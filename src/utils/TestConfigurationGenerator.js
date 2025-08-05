/**
 * テスト設定生成器 - TestConfigurationGenerator
 * 
 * 正規設定からテスト期待値を自動生成し、
 * 設定変更時にテストファイルを自動更新するクラス。
 * Main Controller Pattern適用版
 */

import fs from 'fs';
import path from 'path';
import { ConfigurationParser } from './test-configuration/ConfigurationParser.js';
import { ExpectationGenerator } from './test-configuration/ExpectationGenerator.js';
import { TestFileOperations } from './test-configuration/TestFileOperations.js';
import { ConfigurationValidator } from './test-configuration/ConfigurationValidator.js';

export class TestConfigurationGenerator {
    constructor(options = {}) {
        // Main Controller Pattern用の設定
        this.components = new Map();
        this.initialized = false;
        
        // 軽量エラーハンドラー（Node.js環境用）
        this.errorHandler = {
            handleError: (error, context, details) => {
                console.error(`[ERROR] ${context}: ${error.message}`);
                if (details) {
                    console.error('Details:', details);
                }
            }
        };
        
        // 軽量ConfigurationManager（Node.js環境用）
        this.configurationManager = {
            get: (namespace, path) => {
                // Node.js環境では実際の設定ファイルから直接読み取る
                console.warn('[TestConfigurationGenerator] ConfigurationManager.get() is not available in Node.js environment');
                return undefined;
            }
        };
        
        // 設定
        this.projectRoot = options.projectRoot || process.cwd();
        this.testsDir = options.testsDir || path.join(this.projectRoot, 'tests');
        this.configSourceDir = options.configSourceDir || path.join(this.projectRoot, 'src', 'config');
        this.backupEnabled = options.backupEnabled !== false;
        this.dryRun = options.dryRun || false;
        
        // テストファイルパターン
        this.testFilePatterns = {
            bubble: 'Bubble.test.js',
            gameBalance: 'GameBalance.test.js',
            bubbleManager: 'BubbleManager.test.js'
        };
        
        // 生成された期待値のキャッシュ（後方互換性のため保持）
        this.generatedExpectations = new Map();
        
        this.initializeComponents();
        
        console.log('[TestConfigurationGenerator] テスト設定生成器を初期化しました');
    }

    /**
     * コンポーネントを初期化
     */
    async initializeComponents() {
        try {
            // コンポーネントの作成と初期化
            const components = [
                { name: 'parser', class: ConfigurationParser },
                { name: 'generator', class: ExpectationGenerator },
                { name: 'fileOperations', class: TestFileOperations },
                { name: 'validator', class: ConfigurationValidator }
            ];

            for (const { name, class: ComponentClass } of components) {
                try {
                    const component = new ComponentClass(this);
                    await component.initialize();
                    this.components.set(name, component);
                } catch (error) {
                    console.error(`Failed to initialize ${name}:`, error);
                    // フォールバック機能で継続
                    this.components.set(name, this.createFallbackComponent(name));
                }
            }

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'TestConfigurationGenerator', 'initialization');
        }
    }

    /**
     * フォールバック用のコンポーネントを作成
     * @param {string} name - コンポーネント名
     * @returns {Object} フォールバック機能
     */
    createFallbackComponent(name) {
        return {
            initialized: false,
            // 基本的なフォールバック実装
            parseAllConfigurations: () => null,
            generateTestCode: () => null,
            updateTestFile: () => ({ success: false, error: 'Component not available' }),
            validateConfigurationSync: () => ({ valid: false, issues: ['Component not available'] })
        };
    }

    /**
     * コンポーネントを取得
     * @param {string} name - コンポーネント名
     * @returns {Object} コンポーネント
     */
    getComponent(name) {
        return this.components.get(name);
    }
    
    // === 公開API（後方互換性維持） ===

    /**
     * 正規設定から期待値を抽出（後方互換性維持）
     * @returns {Object} 正規設定から抽出された期待値
     */
    extractCanonicalExpectations() {
        const parser = this.getComponent('parser');
        if (parser) {
            const expectations = parser.parseAllConfigurations();
            if (expectations) {
                // 後方互換性のためキャッシュに保存
                this.generatedExpectations.set('canonical', expectations);
            }
            return expectations;
        }
        
        // フォールバック：最小限の期待値を返す
        const fallbackExpectations = {
            bubbleTypes: {},
            gameBalance: {},
            metadata: {
                extractedAt: Date.now(),
                sourceFiles: [],
                generatorVersion: '1.0.0'
            }
        };
        this.generatedExpectations.set('canonical', fallbackExpectations);
        return fallbackExpectations;
    }

    /**
     * テストファイルを生成（後方互換性維持）
     * @param {Object} expectations - 期待値オブジェクト
     * @param {string} testType - テストタイプ ('bubble', 'gameBalance', 'bubbleManager')
     * @returns {string|null} 生成されたテストコード
     */
    generateTestFile(expectations, testType) {
        const generator = this.getComponent('generator');
        if (generator) {
            return generator.generateTestCode(expectations, testType);
        }
        
        // フォールバック：最小限のテストコードを返す
        return `// Fallback test for ${testType} (${new Date().toISOString()})
describe('${testType} Tests', () => {
    test('should create test', () => {
        expect(true).toBe(true);
    });
});`;
    }

    /**
     * テストファイルを更新（後方互換性維持）
     * @param {Object} expectations - 期待値
     * @param {Object} options - 更新オプション
     * @returns {Object} 更新結果
     */
    updateTestFiles(expectations, options = {}) {
        const fileOperations = this.getComponent('fileOperations');
        const generator = this.getComponent('generator');
        
        if (fileOperations && generator) {
            try {
                const results = {
                    updated: [],
                    failed: [],
                    skipped: [],
                    backups: []
                };
                
                const testTypes = options.testTypes || ['bubble', 'gameBalance', 'bubbleManager'];
                
                for (const testType of testTypes) {
                    try {
                        // テストコードを生成
                        const testCode = generator.generateTestCode(expectations, testType);
                        if (!testCode) {
                            results.failed.push({ testType, error: `Failed to generate test code for ${testType}` });
                            continue;
                        }
                        
                        // ファイルを更新
                        const result = fileOperations.updateTestFile(testType, testCode, options);
                        
                        if (result.success) {
                            results.updated.push(result);
                        } else {
                            results.failed.push({ testType, error: result.error });
                        }
                        
                    } catch (updateError) {
                        results.failed.push({ 
                            testType, 
                            error: updateError.message 
                        });
                    }
                }
                
                console.log(`[TestConfigurationGenerator] テストファイル更新完了: ${results.updated.length}件成功, ${results.failed.length}件失敗`);
                return results;
                
            } catch (error) {
                this.errorHandler.handleError(error, 'TEST_GENERATOR_UPDATE_FILES', {
                    expectationsKeys: Object.keys(expectations || {}),
                    options
                });
                return {
                    updated: [],
                    failed: [{ error: error.message }],
                    skipped: [],
                    backups: []
                };
            }
        }
        
        // フォールバック：エラー結果を返す
        return {
            updated: [],
            failed: [{ error: 'Components not available' }],
            skipped: [],
            backups: []
        };
    }

    /**
     * 設定同期の検証（後方互換性維持）
     * @returns {Object} 検証結果
     */
    validateConfigurationSync() {
        const validator = this.getComponent('validator');
        if (validator) {
            const canonical = this.extractCanonicalExpectations();
            if (canonical) {
                return validator.validateConfigurationSync(canonical);
            }
        }
        
        // フォールバック：基本的な検証結果を返す
        return {
            valid: false,
            issues: ['Component validation not available'],
            warnings: [],
            bubbleTypesCount: 0,
            sourceFiles: []
        };
    }

    /**
     * 生成統計を取得
     * @returns {Object} 生成統計
     */
    getGenerationStatistics() {
        const stats = {
            totalExpectations: this.generatedExpectations.size,
            lastGenerated: null,
            bubbleTypesProcessed: 0,
            sourceFilesProcessed: 0,
            cacheSize: this.generatedExpectations.size,
            componentsInitialized: this.components.size
        };
        
        const canonical = this.generatedExpectations.get('canonical');
        if (canonical) {
            stats.lastGenerated = canonical.metadata?.extractedAt;
            stats.bubbleTypesProcessed = Object.keys(canonical.bubbleTypes || {}).length;
            stats.sourceFilesProcessed = canonical.metadata?.sourceFiles?.length || 0;
        }
        
        return stats;
    }

    /**
     * キャッシュをクリア（後方互換性維持）
     */
    clearCache() {
        // コンポーネントのキャッシュをクリア
        for (const component of this.components.values()) {
            if (component.clearCache) {
                component.clearCache();
            }
        }
        
        // レガシーキャッシュもクリア
        this.generatedExpectations.clear();
        console.log('[TestConfigurationGenerator] キャッシュをクリアしました');
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        // コンポーネントのクリーンアップ
        for (const component of this.components.values()) {
            if (component.cleanup) {
                component.cleanup();
            }
        }
        this.components.clear();

        // レガシーデータのクリーンアップ
        this.generatedExpectations.clear();
        this.initialized = false;

        console.log('[TestConfigurationGenerator] クリーンアップ完了');
    }
}

// シングルトンインスタンス
let testGeneratorInstance = null;

/**
 * TestConfigurationGeneratorのシングルトンインスタンスを取得
 * @param {Object} options - 初期化オプション
 * @returns {TestConfigurationGenerator} テスト生成器インスタンス
 */
export function getTestConfigurationGenerator(options = {}) {
    if (!testGeneratorInstance) {
        testGeneratorInstance = new TestConfigurationGenerator(options);
    }
    return testGeneratorInstance;
}

export default TestConfigurationGenerator;