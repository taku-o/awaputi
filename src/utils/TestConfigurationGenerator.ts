/**
 * テスト設定生成器 - TestConfigurationGenerator
 * 
 * 正規設定からテスト期待値を自動生成し、
 * 設定変更時にテストファイルを自動更新するクラス。
 * Main Controller Pattern適用版
 */

import fs from 'fs';
import path from 'path';
import { ConfigurationParser  } from './test-configuration/ConfigurationParser.js';
import { ExpectationGenerator  } from './test-configuration/ExpectationGenerator.js';
import { TestFileOperations  } from './test-configuration/TestFileOperations.js';
import { ConfigurationValidator  } from './test-configuration/ConfigurationValidator.js';

// Type definitions
interface TestConfigurationOptions { projectRoot?: string,
    testsDir?: string;
    configSourceDir?: string;
    backupEnabled?: boolean;
    dryRun?: boolean;
    interface ErrorHandler { handleError: (error: Error, context: string, details?: any) => void 
    }

interface ConfigurationManager { get: (namespace: string, path: string) => any  }
}

interface TestFilePatterns { bubble: string,
    gameBalance: string,
    bubbleManager: string;
    interface Component { initialized: boolean;
    parseAllConfigurations?: () => any;
    generateTestCode?: (expectations: any, testType: string) => string | null;
    updateTestFile?: (testType: string, testCode: string, options: any) => UpdateResult;
    validateConfigurationSync?: (canonical: any) => ValidationResult;
    clearCache?: () => void;
    cleanup?: () => void;
    initialize?: () => Promise<void> }
}

interface ComponentDefinition { name: string,
    class: new (controller: TestConfigurationGenerator) => Component  }
}

interface ExpectationMetadata { extractedAt: number,
    sourceFiles: string[],
    generatorVersion: string;
    interface CanonicalExpectations { bubbleTypes: Record<string, any>,
    gameBalance: Record<string, any>;
    metadata: ExpectationMetadata;
    interface UpdateResult { success: boolean;
    error?: string;
    testType?: string;
    [key: string]: any;
    interface UpdateOptions { testTypes?: string[],
    [key: string]: any;
    interface UpdateResults { updated: UpdateResult[],
    failed: Array<{ testType?: string, error: string;>,
    skipped: UpdateResult[],
    backups: UpdateResult[];
    }

interface ValidationResult { valid: boolean,
    issues: string[],
    warnings: string[],
    bubbleTypesCount: number,
    sourceFiles: string[];
    interface GenerationStatistics { totalExpectations: number,
    lastGenerated: number | null,
    bubbleTypesProcessed: number,
    sourceFilesProcessed: number,
    cacheSize: number,
    componentsInitialized: number;
    export class TestConfigurationGenerator {
    private components: Map<string, Component>;
    private initialized: boolean;
    private errorHandler: ErrorHandler;
    private configurationManager: ConfigurationManager;
    private projectRoot: string;
    private testsDir: string;
    private configSourceDir: string;
    private backupEnabled: boolean;
    private dryRun: boolean;
    private testFilePatterns: TestFilePatterns;
    private, generatedExpectations: Map<string, any>,

    constructor(options: TestConfigurationOptions = {) {

        // Main Controller Pattern用の設定
        this.components = new Map<string, Component>(),
        this.initialized = false;
        
        // 軽量エラーハンドラー（Node.js環境用）
        this.errorHandler = {};
            handleError: (error: Error, context: string, details?: any) => { }
                console.error(`[ERROR] ${context}: ${error.message}`);
                if (details) {', ' }

                    console.error('Details:', details'; }'
}
        };
        
        // 軽量ConfigurationManager（Node.js環境用）
        this.configurationManager = { ''
            get: (namespace: string, path: string') => {,'
                // Node.js環境では実際の設定ファイルから直接読み取る
                console.warn('[TestConfigurationGenerator] ConfigurationManager.get() is not available in Node.js environment');
                return undefined;
        ';'
        // 設定
        this.projectRoot = options.projectRoot || process.cwd()';'
        this.testsDir = options.testsDir || path.join(this.projectRoot, 'tests');
        this.configSourceDir = options.configSourceDir || path.join(this.projectRoot, 'src', 'config');
        this.backupEnabled = options.backupEnabled !== false;
        this.dryRun = options.dryRun || false;
        
        // テストファイルパターン
        this.testFilePatterns = {;
            bubble: 'Bubble.test.js,
            gameBalance: 'GameBalance.test.js,
            bubbleManager: 'BubbleManager.test.js'
            };
        // 生成された期待値のキャッシュ（後方互換性のため保持）
        this.generatedExpectations = new Map<string, any>();

        this.initializeComponents()';'
        console.log('[TestConfigurationGenerator] テスト設定生成器を初期化しました');
    }

    /**
     * コンポーネントを初期化'
     */''
    async initializeComponents('''
                { name: 'parser', class: ConfigurationParser,''
                { name: 'generator', class: ExpectationGenerator,''
                { name: 'fileOperations', class: TestFileOperations,''
                { name: 'validator', class: ConfigurationValidator,
            ];
);
            for (const { name, class: ComponentClass ) of components) {
                try {
                    const component = new ComponentClass(this);
                    if (component.initialize) {
    
}
                        await component.initialize(); }
                    }
                    this.components.set(name, component);
                } catch (error) {
                    console.error(`Failed to initialize ${name}:`, error);
                    // フォールバック機能で継続
                    this.components.set(name, this.createFallbackComponent(name);
                }
            }
';'

            this.initialized = true;'} catch (error) {'
            this.errorHandler.handleError(error as Error, 'TestConfigurationGenerator', 'initialization) }'
    }

    /**
     * フォールバック用のコンポーネントを作成
     */
    createFallbackComponent(name: string): Component { return { initialized: false,
            // 基本的なフォールバック実装
            parseAllConfigurations: () => null };
            generateTestCode: () => null,' }'

            updateTestFile: () => ({ success: false, error: 'Component not available'
            }',''
            validateConfigurationSync: () => ({ valid: false, issues: ['Component not available], warnings: [], bubbleTypesCount: 0, sourceFiles: []  };'
        }

    /**
     * コンポーネントを取得
     */
    getComponent(name: string): Component | undefined { return this.components.get(name);
    
    // === 公開API（後方互換性維持） ===

    /**
     * 正規設定から期待値を抽出（後方互換性維持）
     */''
    extractCanonicalExpectations()';'
        const parser = this.getComponent('parser);'
        if (parser && parser.parseAllConfigurations) {
            const expectations = parser.parseAllConfigurations();
            if (expectations) {
                // 後方互換性のためキャッシュに保存
        }

                this.generatedExpectations.set('canonical', expectations'; }'
            }
            return expectations;
        }
        
        // フォールバック：最小限の期待値を返す
        const fallbackExpectations: CanonicalExpectations = {
            bubbleTypes: {  },
            gameBalance: {  },
            metadata: { ''
                extractedAt: Date.now(''  ,
    generatorVersion: '1.0.0' }'};')'
        this.generatedExpectations.set('canonical', fallbackExpectations';'
        return fallbackExpectations;
    }

    /**
     * テストファイルを生成（後方互換性維持）'
     */''
    generateTestFile(expectations: any, testType: string): string | null { ''
        const generator = this.getComponent('generator),'
        if (generator && generator.generateTestCode) {
    
}
            return generator.generateTestCode(expectations, testType);
        ';'
        // フォールバック：最小限のテストコードを返す
        return `// Fallback test for ${testType} (${new, Date(}.toISOString(});
describe('${ testType} Tests', ('} => { }'

    test('should create test', () => { }
        expect(true).toBe(true});
    });
});`;
    }

    /**
     * テストファイルを更新（後方互換性維持）'
     */''
    updateTestFiles(expectations: any, options: UpdateOptions = {}: UpdateResults { ''
        const fileOperations = this.getComponent('fileOperations');
        const generator = this.getComponent('generator),'

        if (fileOperations && generator && fileOperations.updateTestFile && generator.generateTestCode) {
            try {
                const results: UpdateResults = {
                    updated: [],
                    failed: [],
    skipped: [] }
                    backups: [] 
    };
                const testTypes = options.testTypes || ['bubble', 'gameBalance', 'bubbleManager'];
                
                for (const testType of testTypes) {
                
                    try {
                        // テストコードを生成
                        const testCode = generator.generateTestCode(expectations, testType);
                        if (!testCode) { }
                            results.failed.push({ testType, error: `Failed to generate test code for ${testType }` ),
                            continue;
                        }
                        
                        // ファイルを更新
                        const result = fileOperations.updateTestFile(testType, testCode, options);
                        
                        if (result.success) {
                        ','

                            ' }'

                            results.updated.push(result); }

                        } else { }'

                            results.failed.push({ testType, error: result.error || 'Unknown error  } catch (updateError) { results.failed.push({ )'
                            testType,
                            error: (updateError, as Error).message      }
}
                console.log(`[TestConfigurationGenerator] テストファイル更新完了: ${results.updated.length}件成功, ${results.failed.length}件失敗`};
                return results;

            } catch (error) {
                this.errorHandler.handleError(error as Error, 'TEST_GENERATOR_UPDATE_FILES', {);
                    expectationsKeys: Object.keys(expectations || {};
                    options;
                };

                return { updated: [],' }'

                    failed: [{ error: (error, as Error').message }];'
                    skipped: [],
    backups: []     }
}
        // フォールバック：エラー結果を返す
        return { updated: [],' }'

            failed: [{ error: 'Components not available' }],
            skipped: [],
    backups: [] } }

    /**
     * 設定同期の検証（後方互換性維持）'
     */''
    validateConfigurationSync()';'
        const validator = this.getComponent('validator);'
        if (validator && validator.validateConfigurationSync) {
            const canonical = this.extractCanonicalExpectations();
            if (canonical) {
        }

                return validator.validateConfigurationSync(canonical);
        
        // フォールバック：基本的な検証結果を返す
        return { valid: false,''
            issues: ['Component validation not available],'
            warnings: [],
    bubbleTypesCount: 0 ,
            sourceFiles: [] 
    }

    /**
     * 生成統計を取得'
     */''
    getGenerationStatistics()';'
        const canonical = this.generatedExpectations.get('canonical);'
        if (canonical) {
            stats.lastGenerated = canonical.metadata?.extractedAt,
            stats.bubbleTypesProcessed = Object.keys(canonical.bubbleTypes || {).length }
            stats.sourceFilesProcessed = canonical.metadata?.sourceFiles?.length || 0; }
        }
        
        return stats;
    }

    /**
     * キャッシュをクリア（後方互換性維持）
     */ : undefined
    clearCache(): void { // コンポーネントのキャッシュをクリア
        for (const component of this.components.values() {
            if (component.clearCache) {
        
                component.clearCache();
}
        ;
        // レガシーキャッシュもクリア
        this.generatedExpectations.clear()';'
        console.log('[TestConfigurationGenerator] キャッシュをクリアしました);'
    }

    /**
     * クリーンアップ
     */
    cleanup(): void { // コンポーネントのクリーンアップ
        for(const component of this.components.values() {
            if (component.cleanup) {
        }
                component.cleanup(); }
}
        this.components.clear();
        // レガシーデータのクリーンアップ
        this.generatedExpectations.clear()';'
        console.log('[TestConfigurationGenerator] クリーンアップ完了);'
    }
}

// シングルトンインスタンス
let testGeneratorInstance: TestConfigurationGenerator | null = null,

/**
 * TestConfigurationGeneratorのシングルトンインスタンスを取得
 */
export function getTestConfigurationGenerator(options: TestConfigurationOptions = {}: TestConfigurationGenerator { if (!testGeneratorInstance') {''
        testGeneratorInstance = new TestConfigurationGenerator(options);
    return testGeneratorInstance;
}

export default TestConfigurationGenerator;