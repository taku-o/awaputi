/**
 * テスト設定生成器 - TestConfigurationGenerator
 * 
 * 正規設定からテスト期待値を自動生成し、
 * 設定変更時にテストファイルを自動更新するクラス。
 */

import fs from 'fs';
import path from 'path';
// Node.js環境での動作のため、エラーハンドリングとConfigurationManagerは軽量版を使用

export class TestConfigurationGenerator {
    constructor(options = {}) {
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
        
        // 生成された期待値のキャッシュ
        this.generatedExpectations = new Map();
        
        console.log('[TestConfigurationGenerator] テスト設定生成器を初期化しました');
    }
    
    /**
     * 正規設定から期待値を抽出
     * @returns {Object} 正規設定から抽出された期待値
     */
    extractCanonicalExpectations() {
        try {
            const expectations = {
                bubbleTypes: {},
                gameBalance: {},
                metadata: {
                    extractedAt: Date.now(),
                    sourceFiles: [],
                    generatorVersion: '1.0.0'
                }
            };
            
            // GameBalance.jsから期待値を抽出
            const gameBalanceExpectations = this._extractFromGameBalance();
            if (gameBalanceExpectations) {
                expectations.gameBalance = gameBalanceExpectations;
                expectations.metadata.sourceFiles.push('src/config/GameBalance.js');
            }
            
            // Bubble.jsから期待値を抽出
            const bubbleExpectations = this._extractFromBubbleClass();
            if (bubbleExpectations) {
                expectations.bubbleTypes = bubbleExpectations;
                expectations.metadata.sourceFiles.push('src/bubbles/Bubble.js');
            }
            
            // ConfigurationManagerから期待値を補完
            const configManagerExpectations = this._extractFromConfigurationManager();
            if (configManagerExpectations) {
                // 既存の期待値とマージ
                for (const [bubbleType, config] of Object.entries(configManagerExpectations)) {
                    if (!expectations.bubbleTypes[bubbleType]) {
                        expectations.bubbleTypes[bubbleType] = {};
                    }
                    Object.assign(expectations.bubbleTypes[bubbleType], config);
                }
                expectations.metadata.sourceFiles.push('ConfigurationManager');
            }
            
            // キャッシュに保存
            this.generatedExpectations.set('canonical', expectations);
            
            console.log(`[TestConfigurationGenerator] ${Object.keys(expectations.bubbleTypes).length}個のバブルタイプの期待値を抽出しました`);
            return expectations;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'TEST_GENERATOR_EXTRACT_CANONICAL', {
                projectRoot: this.projectRoot
            });
            return null;
        }
    }
    
    /**
     * GameBalance.jsから期待値を抽出
     * @returns {Object|null} GameBalance設定から抽出された期待値
     * @private
     */
    _extractFromGameBalance() {
        try {
            const gameBalancePath = path.join(this.configSourceDir, 'GameBalance.js');
            if (!fs.existsSync(gameBalancePath)) {
                console.warn('[TestConfigurationGenerator] GameBalance.js が見つかりません');
                return null;
            }
            
            const content = fs.readFileSync(gameBalancePath, 'utf8');
            const expectations = {};
            
            // baseScores の抽出
            const baseScoresMatch = content.match(/baseScores:\s*\{([^}]+)\}/s);
            if (baseScoresMatch) {
                const scoresContent = baseScoresMatch[1];
                const scoreMatches = scoresContent.matchAll(/(\w+):\s*(\d+)/g);
                
                expectations.baseScores = {};
                for (const match of scoreMatches) {
                    const [, bubbleType, score] = match;
                    expectations.baseScores[bubbleType] = parseInt(score);
                }
            }
            
            // bubbles 設定の抽出
            const bubblesMatch = content.match(/bubbles:\s*\{([\s\S]*?)\n\s*\}/);
            if (bubblesMatch) {
                const bubblesContent = bubblesMatch[1];
                expectations.bubbles = {};
                
                // 各バブルタイプの設定を抽出
                const bubbleTypeMatches = bubblesContent.matchAll(/(\w+):\s*\{([^}]*)\}/g);
                
                for (const match of bubbleTypeMatches) {
                    const [, bubbleType, configContent] = match;
                    expectations.bubbles[bubbleType] = {};
                    
                    // 各プロパティを抽出
                    const properties = {
                        health: /health:\s*(\d+)/,
                        size: /size:\s*(\d+)/,
                        maxAge: /maxAge:\s*(\d+)/
                    };
                    
                    for (const [propName, regex] of Object.entries(properties)) {
                        const propMatch = configContent.match(regex);
                        if (propMatch) {
                            expectations.bubbles[bubbleType][propName] = parseInt(propMatch[1]);
                        }
                    }
                    
                    // 特殊効果の抽出
                    const effectsMatch = configContent.match(/effects:\s*\{([^}]*)\}/);
                    if (effectsMatch) {
                        const effectsContent = effectsMatch[1];
                        expectations.bubbles[bubbleType].effects = {};
                        
                        const effectProperties = {
                            intensity: /intensity:\s*(\d+)/,
                            duration: /duration:\s*(\d+)/
                        };
                        
                        for (const [effectProp, effectRegex] of Object.entries(effectProperties)) {
                            const effectMatch = effectsContent.match(effectRegex);
                            if (effectMatch) {
                                expectations.bubbles[bubbleType].effects[effectProp] = parseInt(effectMatch[1]);
                            }
                        }
                    }
                }
            }
            
            console.log('[TestConfigurationGenerator] GameBalance.jsから期待値を抽出しました');
            return expectations;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'TEST_GENERATOR_EXTRACT_GAME_BALANCE', {
                gameBalancePath: path.join(this.configSourceDir, 'GameBalance.js')
            });
            return null;
        }
    }
    
    /**
     * Bubble.jsから期待値を抽出
     * @returns {Object|null} Bubble.jsから抽出された期待値
     * @private
     */
    _extractFromBubbleClass() {
        try {
            const bubblePath = path.join(this.projectRoot, 'src', 'bubbles', 'Bubble.js');
            if (!fs.existsSync(bubblePath)) {
                console.warn('[TestConfigurationGenerator] Bubble.js が見つかりません');
                return null;
            }
            
            const content = fs.readFileSync(bubblePath, 'utf8');
            const expectations = {};
            
            // _getHardcodedConfig メソッドから設定を抽出
            const hardcodedConfigMatch = content.match(/_getHardcodedConfig\(\)\s*\{([\s\S]*?)\n\s*\}/);
            if (hardcodedConfigMatch) {
                const configContent = hardcodedConfigMatch[1];
                
                // switch文のケースを抽出
                const caseMatches = configContent.matchAll(/case\s+'(\w+)':\s*return\s*\{([^}]*)\}/g);
                
                for (const match of caseMatches) {
                    const [, bubbleType, configStr] = match;
                    expectations[bubbleType] = {};
                    
                    // 各プロパティを抽出
                    const properties = {
                        health: /health:\s*(\d+)/,
                        score: /score:\s*(\d+)/,
                        size: /size:\s*(\d+)/,
                        maxAge: /maxAge:\s*(\d+)/
                    };
                    
                    for (const [propName, regex] of Object.entries(properties)) {
                        const propMatch = configStr.match(regex);
                        if (propMatch) {
                            expectations[bubbleType][propName] = parseInt(propMatch[1]);
                        }
                    }
                }
            }
            
            console.log('[TestConfigurationGenerator] Bubble.jsから期待値を抽出しました');
            return expectations;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'TEST_GENERATOR_EXTRACT_BUBBLE_CLASS', {
                bubblePath: path.join(this.projectRoot, 'src', 'bubbles', 'Bubble.js')
            });
            return null;
        }
    }
    
    /**
     * ConfigurationManagerから期待値を抽出
     * @returns {Object|null} ConfigurationManagerから抽出された期待値
     * @private
     */
    _extractFromConfigurationManager() {
        try {
            const expectations = {};
            
            // 各バブルタイプの設定を取得
            const bubbleTypes = [
                'normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock',
                'electric', 'poison', 'spiky', 'escaping', 'boss', 'golden',
                'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'
            ];
            
            for (const bubbleType of bubbleTypes) {
                try {
                    expectations[bubbleType] = {};
                    
                    // 基本プロパティを取得
                    const properties = ['health', 'score', 'size', 'maxAge'];
                    for (const property of properties) {
                        try {
                            const value = this.configurationManager.get('game', `bubbles.${bubbleType}.${property}`);
                            if (value !== undefined && value !== null) {
                                expectations[bubbleType][property] = value;
                            }
                        } catch (configError) {
                            // 設定が見つからない場合は無視
                        }
                        
                        // スコアの場合はbaseScoresからも取得を試行
                        if (property === 'score') {
                            try {
                                const scoreValue = this.configurationManager.get('game', `scoring.baseScores.${bubbleType}`);
                                if (scoreValue !== undefined && scoreValue !== null) {
                                    expectations[bubbleType][property] = scoreValue;
                                }
                            } catch (scoreError) {
                                // 設定が見つからない場合は無視
                            }
                        }
                    }
                    
                    // 特殊効果を取得
                    try {
                        const effects = this.configurationManager.get('game', `bubbles.${bubbleType}.effects`);
                        if (effects && typeof effects === 'object') {
                            expectations[bubbleType].effects = effects;
                        }
                    } catch (effectsError) {
                        // 特殊効果がない場合は無視
                    }
                    
                    // 空のオブジェクトは削除
                    if (Object.keys(expectations[bubbleType]).length === 0) {
                        delete expectations[bubbleType];
                    }
                    
                } catch (bubbleError) {
                    // 個別のバブルタイプでエラーが発生した場合は無視
                }
            }
            
            console.log('[TestConfigurationGenerator] ConfigurationManagerから期待値を抽出しました');
            return expectations;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'TEST_GENERATOR_EXTRACT_CONFIG_MANAGER');
            return null;
        }
    }
    
    /**
     * テストファイルを生成
     * @param {Object} expectations - 期待値オブジェクト
     * @param {string} testType - テストタイプ ('bubble', 'gameBalance', 'bubbleManager')
     * @returns {string|null} 生成されたテストコード
     */
    generateTestFile(expectations, testType) {
        try {
            switch (testType) {
                case 'bubble':
                    return this._generateBubbleTest(expectations);
                case 'gameBalance':
                    return this._generateGameBalanceTest(expectations);
                case 'bubbleManager':
                    return this._generateBubbleManagerTest(expectations);
                default:
                    throw new Error(`Unknown test type: ${testType}`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TEST_GENERATOR_GENERATE', {
                testType,
                expectationsKeys: Object.keys(expectations || {})
            });
            return null;
        }
    }
    
    /**
     * Bubble.test.jsを生成
     * @param {Object} expectations - 期待値
     * @returns {string} 生成されたテストコード
     * @private
     */
    _generateBubbleTest(expectations) {
        let testCode = `/**
 * Bubble Class Test Suite
 * 
 * このファイルは TestConfigurationGenerator によって自動生成されました。
 * 手動での編集は推奨されません。設定を変更する場合は、
 * 正規設定ファイルを更新し、テスト生成を再実行してください。
 * 
 * 生成日時: ${new Date().toISOString()}
 * 生成器バージョン: ${expectations.metadata?.generatorVersion || '1.0.0'}
 */

import { jest } from '@jest/globals';
import { Bubble } from '../../src/bubbles/Bubble.js';

// Mock dependencies
jest.mock('../../src/core/ConfigurationManager.js', () => ({
    getConfigurationManager: jest.fn(() => ({
        get: jest.fn(),
        watch: jest.fn(),
        set: jest.fn()
    }))
}));

jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: jest.fn(() => ({
        handleError: jest.fn()
    }))
}));

describe('Bubble Class Configuration Tests', () => {
    let mockCanvas;
    let mockContext;
    let mockGameEngine;
    
    beforeEach(() => {
        // Mock canvas and context
        mockContext = {
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            textBaseline: '',
            globalAlpha: 1
        };
        
        mockCanvas = {
            getContext: jest.fn(() => mockContext),
            width: 800,
            height: 600
        };
        
        mockGameEngine = {
            canvas: mockCanvas,
            ctx: mockContext,
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
            }))
        };
        
        // Reset all mocks
        jest.clearAllMocks();
    });
    
    describe('Bubble Type Configuration', () => {
`;

        // 各バブルタイプのテストを生成
        let bubbleTestCode = '';
        for (const [bubbleType, config] of Object.entries(expectations.bubbleTypes || {})) {
            bubbleTestCode += this._generateBubbleTypeTests(bubbleType, config);
        }
        testCode += bubbleTestCode;

        testCode += `    });
    
    describe('Configuration Consistency', () => {
        test('should have consistent configuration across all bubble types', () => {
            const bubbleTypes = ${JSON.stringify(Object.keys(expectations.bubbleTypes || {}), null, 12)};
            
            for (const bubbleType of bubbleTypes) {
                const bubble = new Bubble(mockGameEngine, 100, 100, bubbleType);
                const config = bubble.getTypeConfig();
                
                // 基本プロパティの存在確認
                expect(config).toHaveProperty('health');
                expect(config).toHaveProperty('score');
                expect(config).toHaveProperty('size');
                expect(config).toHaveProperty('maxAge');
                
                // 値の型確認
                expect(typeof config.health).toBe('number');
                expect(typeof config.score).toBe('number');
                expect(typeof config.size).toBe('number');
                expect(typeof config.maxAge).toBe('number');
                
                // 値の範囲確認
                expect(config.health).toBeGreaterThan(0);
                expect(config.score).toBeGreaterThanOrEqual(0);
                expect(config.size).toBeGreaterThan(0);
                expect(config.maxAge).toBeGreaterThan(0);
            }
        });
        
        test('should maintain relative balance between bubble types', () => {
            const normalBubble = new Bubble(mockGameEngine, 100, 100, 'normal');
            const bossBubble = new Bubble(mockGameEngine, 100, 100, 'boss');
            
            const normalConfig = normalBubble.getTypeConfig();
            const bossConfig = bossBubble.getTypeConfig();
            
            // Boss bubble should be stronger than normal
            expect(bossConfig.health).toBeGreaterThanOrEqual(normalConfig.health);
            expect(bossConfig.score).toBeGreaterThanOrEqual(normalConfig.score);
            expect(bossConfig.size).toBeGreaterThanOrEqual(normalConfig.size);
        });
    });
    
    describe('Generated Test Metadata', () => {
        test('should have test generation metadata', () => {
            const metadata = ${JSON.stringify(expectations.metadata || {}, null, 12)};
            
            expect(metadata).toHaveProperty('extractedAt');
            expect(metadata).toHaveProperty('sourceFiles');
            expect(metadata).toHaveProperty('generatorVersion');
            expect(Array.isArray(metadata.sourceFiles)).toBe(true);
        });
    });
});
`;

        return testCode;
    }
    
    /**
     * 個別バブルタイプのテストを生成
     * @param {string} bubbleType - バブルタイプ
     * @param {Object} config - 設定
     * @returns {string} テストコード
     * @private
     */
    _generateBubbleTypeTests(bubbleType, config) {
        let testCode = `
        describe('${bubbleType} bubble configuration', () => {
            let bubble;
            
            beforeEach(() => {
                bubble = new Bubble(mockGameEngine, 100, 100, '${bubbleType}');
            });
            
`;

        // 基本プロパティのテスト
        if (config.health !== undefined) {
            testCode += `            test('should have correct health value', () => {
                const typeConfig = bubble.getTypeConfig();
                expect(typeConfig.health).toBe(${config.health});
            });
            
`;
        }

        if (config.score !== undefined) {
            testCode += `            test('should have correct score value', () => {
                const typeConfig = bubble.getTypeConfig();
                expect(typeConfig.score).toBe(${config.score});
            });
            
`;
        }

        if (config.size !== undefined) {
            testCode += `            test('should have correct size value', () => {
                const typeConfig = bubble.getTypeConfig();
                expect(typeConfig.size).toBe(${config.size});
            });
            
`;
        }

        if (config.maxAge !== undefined) {
            testCode += `            test('should have correct maxAge value', () => {
                const typeConfig = bubble.getTypeConfig();
                expect(typeConfig.maxAge).toBe(${config.maxAge});
            });
            
`;
        }

        // 特殊効果のテスト
        if (config.effects) {
            testCode += `            test('should have correct special effects configuration', () => {
                const typeConfig = bubble.getTypeConfig();
                expect(typeConfig.effects).toBeDefined();
                
`;
            
            if (config.effects.intensity !== undefined) {
                testCode += `                expect(typeConfig.effects.intensity).toBe(${config.effects.intensity});
`;
            }
            
            if (config.effects.duration !== undefined) {
                testCode += `                expect(typeConfig.effects.duration).toBe(${config.effects.duration});
`;
            }
            
            testCode += `            });
            
`;
        }

        testCode += `        });
`;

        return testCode;
    }
    
    /**
     * GameBalance.test.jsを生成
     * @param {Object} expectations - 期待値
     * @returns {string} 生成されたテストコード
     * @private
     */
    _generateGameBalanceTest(expectations) {
        return `/**
 * GameBalance Configuration Test Suite
 * 
 * このファイルは TestConfigurationGenerator によって自動生成されました。
 * 
 * 生成日時: ${new Date().toISOString()}
 * 生成器バージョン: ${expectations.metadata?.generatorVersion || '1.0.0'}
 */

import { jest } from '@jest/globals';

// GameBalance.jsを動的にインポート
let GameBalance;

beforeAll(async () => {
    const module = await import('../../src/config/GameBalance.js');
    GameBalance = module.default || module.GameBalance;
});

describe('GameBalance Configuration Tests', () => {
    test('should have valid GameBalance object', () => {
        expect(GameBalance).toBeDefined();
        expect(typeof GameBalance).toBe('object');
    });
    
    describe('Base Scores Configuration', () => {
        test('should have baseScores property', () => {
            expect(GameBalance.scoring).toBeDefined();
            expect(GameBalance.scoring.baseScores).toBeDefined();
        });
        
${Object.entries(expectations.gameBalance?.baseScores || {}).map(([bubbleType, score]) => `        test('should have correct ${bubbleType} bubble base score', () => {
            expect(GameBalance.scoring.baseScores.${bubbleType}).toBe(${score});
        });`).join('\n        \n')}
    });
    
    describe('Bubbles Configuration', () => {
        test('should have bubbles property', () => {
            expect(GameBalance.bubbles).toBeDefined();
            expect(typeof GameBalance.bubbles).toBe('object');
        });
        
${Object.entries(expectations.gameBalance?.bubbles || {}).map(([bubbleType, config]) => {
    let tests = `        describe('${bubbleType} bubble configuration', () => {\n`;
    
    if (config.health !== undefined) {
        tests += `            test('should have correct health value', () => {\n`;
        tests += `                expect(GameBalance.bubbles.${bubbleType}.health).toBe(${config.health});\n`;
        tests += `            });\n\n`;
    }
    
    if (config.size !== undefined) {
        tests += `            test('should have correct size value', () => {\n`;
        tests += `                expect(GameBalance.bubbles.${bubbleType}.size).toBe(${config.size});\n`;
        tests += `            });\n\n`;
    }
    
    if (config.maxAge !== undefined) {
        tests += `            test('should have correct maxAge value', () => {\n`;
        tests += `                expect(GameBalance.bubbles.${bubbleType}.maxAge).toBe(${config.maxAge});\n`;
        tests += `            });\n\n`;
    }
    
    if (config.effects) {
        tests += `            test('should have correct effects configuration', () => {\n`;
        tests += `                expect(GameBalance.bubbles.${bubbleType}.effects).toBeDefined();\n`;
        
        if (config.effects.intensity !== undefined) {
            tests += `                expect(GameBalance.bubbles.${bubbleType}.effects.intensity).toBe(${config.effects.intensity});\n`;
        }
        
        if (config.effects.duration !== undefined) {
            tests += `                expect(GameBalance.bubbles.${bubbleType}.effects.duration).toBe(${config.effects.duration});\n`;
        }
        
        tests += `            });\n\n`;
    }
    
    tests += `        });\n`;
    return tests;
}).join('\n        ')}
    });
    
    describe('Configuration Integrity', () => {
        test('should have consistent bubble types across baseScores and bubbles', () => {
            const baseScoreTypes = Object.keys(GameBalance.scoring.baseScores);
            const bubbleConfigTypes = Object.keys(GameBalance.bubbles);
            
            // Check that all bubble types with scores have configurations
            for (const bubbleType of baseScoreTypes) {
                if (!['score'].includes(bubbleType)) { // Exclude special score entries
                    expect(bubbleConfigTypes).toContain(bubbleType);
                }
            }
        });
        
        test('should have valid value ranges', () => {
            for (const [bubbleType, config] of Object.entries(GameBalance.bubbles)) {
                if (config.health !== undefined) {
                    expect(config.health).toBeGreaterThan(0);
                    expect(config.health).toBeLessThanOrEqual(100);
                }
                
                if (config.size !== undefined) {
                    expect(config.size).toBeGreaterThan(0);
                    expect(config.size).toBeLessThanOrEqual(500);
                }
                
                if (config.maxAge !== undefined) {
                    expect(config.maxAge).toBeGreaterThan(0);
                    expect(config.maxAge).toBeLessThanOrEqual(600000); // 10 minutes max
                }
            }
        });
    });
});
`;
    }
    
    /**
     * BubbleManager.test.jsを生成
     * @param {Object} expectations - 期待値
     * @returns {string} 生成されたテストコード
     * @private
     */
    _generateBubbleManagerTest(expectations) {
        return `/**
 * BubbleManager Configuration Test Suite
 * 
 * このファイルは TestConfigurationGenerator によって自動生成されました。
 * 
 * 生成日時: ${new Date().toISOString()}
 * 生成器バージョン: ${expectations.metadata?.generatorVersion || '1.0.0'}
 */

import { jest } from '@jest/globals';
import { BubbleManager } from '../../src/managers/BubbleManager.js';

// Mock dependencies
jest.mock('../../src/core/ConfigurationManager.js');
jest.mock('../../src/utils/ErrorHandler.js');

describe('BubbleManager Configuration Tests', () => {
    let bubbleManager;
    let mockGameEngine;
    let mockCanvas;
    let mockContext;
    
    beforeEach(() => {
        mockContext = {
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            globalAlpha: 1
        };
        
        mockCanvas = {
            getContext: jest.fn(() => mockContext),
            width: 800,
            height: 600
        };
        
        mockGameEngine = {
            canvas: mockCanvas,
            ctx: mockContext,
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
            }))
        };
        
        bubbleManager = new BubbleManager(mockGameEngine);
        
        jest.clearAllMocks();
    });
    
    describe('Bubble Creation with Configurations', () => {
${Object.keys(expectations.bubbleTypes || {}).map(bubbleType => `        test('should create ${bubbleType} bubble with correct configuration', () => {
            const bubble = bubbleManager.createBubble(100, 100, '${bubbleType}');
            
            expect(bubble).toBeDefined();
            expect(bubble.type).toBe('${bubbleType}');
            
            const config = bubble.getTypeConfig();
            expect(config).toBeDefined();
            expect(typeof config.health).toBe('number');
            expect(typeof config.score).toBe('number');
            expect(typeof config.size).toBe('number');
            expect(typeof config.maxAge).toBe('number');
        });`).join('\n        \n')}
    });
    
    describe('Configuration-Based Bubble Behavior', () => {
        test('should respect bubble health configuration in damage handling', () => {
            const normalBubble = bubbleManager.createBubble(100, 100, 'normal');
            const bossBubble = bubbleManager.createBubble(200, 200, 'boss');
            
            const normalHealth = normalBubble.getTypeConfig().health;
            const bossHealth = bossBubble.getTypeConfig().health;
            
            // Test that boss bubbles have more health
            expect(bossHealth).toBeGreaterThanOrEqual(normalHealth);
            
            // Test damage handling
            normalBubble.takeDamage(1);
            bossBubble.takeDamage(1);
            
            expect(normalBubble.currentHealth).toBe(normalHealth - 1);
            expect(bossBubble.currentHealth).toBe(bossHealth - 1);
        });
        
        test('should use configuration-based scoring', () => {
            const bubbleTypes = ${JSON.stringify(Object.keys(expectations.bubbleTypes || {}))};
            
            for (const bubbleType of bubbleTypes) {
                const bubble = bubbleManager.createBubble(100, 100, bubbleType);
                const expectedScore = bubble.getTypeConfig().score;
                
                expect(typeof expectedScore).toBe('number');
                expect(expectedScore).toBeGreaterThanOrEqual(0);
            }
        });
        
        test('should apply configuration-based aging', () => {
            const bubble = bubbleManager.createBubble(100, 100, 'normal');
            const maxAge = bubble.getTypeConfig().maxAge;
            
            expect(typeof maxAge).toBe('number');
            expect(maxAge).toBeGreaterThan(0);
            
            // Test aging
            bubble.age = maxAge + 1000; // Exceed max age
            bubble.update(16.67); // One frame
            
            expect(bubble.shouldBeRemoved()).toBe(true);
        });
    });
    
    describe('Metadata Validation', () => {
        test('should have valid test generation metadata', () => {
            const metadata = ${JSON.stringify(expectations.metadata || {}, null, 12)};
            
            expect(metadata).toHaveProperty('extractedAt');
            expect(metadata).toHaveProperty('sourceFiles');
            expect(metadata).toHaveProperty('generatorVersion');
            
            expect(Array.isArray(metadata.sourceFiles)).toBe(true);
            expect(metadata.sourceFiles.length).toBeGreaterThan(0);
        });
    });
});
`;
    }
    
    /**
     * テストファイルを更新
     * @param {Object} expectations - 期待値
     * @param {Object} options - 更新オプション
     * @returns {Object} 更新結果
     */
    updateTestFiles(expectations, options = {}) {
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
                    const result = this._updateSingleTestFile(expectations, testType, options);
                    
                    if (result.success) {
                        results.updated.push(result);
                        if (result.backupPath) {
                            results.backups.push(result.backupPath);
                        }
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
    
    /**
     * 単一テストファイルを更新
     * @param {Object} expectations - 期待値
     * @param {string} testType - テストタイプ
     * @param {Object} options - オプション
     * @returns {Object} 更新結果
     * @private
     */
    _updateSingleTestFile(expectations, testType, options) {
        try {
            const testFilename = this.testFilePatterns[testType];
            if (!testFilename) {
                throw new Error(`Unknown test type: ${testType}`);
            }
            
            const testFilePath = path.join(this.testsDir, 'unit', testFilename);
            
            // ドライランモードの場合
            if (this.dryRun) {
                console.log(`[DRY RUN] Would update: ${testFilePath}`);
                return {
                    success: true,
                    testType,
                    testFilePath,
                    dryRun: true
                };
            }
            
            // バックアップの作成
            let backupPath = null;
            if (this.backupEnabled && fs.existsSync(testFilePath)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                backupPath = `${testFilePath}.backup.${timestamp}`;
                fs.copyFileSync(testFilePath, backupPath);
                console.log(`[TestConfigurationGenerator] バックアップ作成: ${path.basename(backupPath)}`);
            }
            
            // 新しいテストコードを生成
            const newTestCode = this.generateTestFile(expectations, testType);
            if (!newTestCode) {
                throw new Error(`Failed to generate test code for ${testType}`);
            }
            
            // ディレクトリが存在しない場合は作成
            const testDir = path.dirname(testFilePath);
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            // ファイルを書き込み
            fs.writeFileSync(testFilePath, newTestCode);
            
            console.log(`[TestConfigurationGenerator] テストファイル更新: ${testFilename}`);
            
            return {
                success: true,
                testType,
                testFilePath,
                backupPath,
                linesGenerated: newTestCode.split('\n').length
            };
            
        } catch (error) {
            return {
                success: false,
                testType,
                error: error.message
            };
        }
    }
    
    /**
     * 設定同期の検証
     * @returns {Object} 検証結果
     */
    validateConfigurationSync() {
        try {
            const canonical = this.extractCanonicalExpectations();
            if (!canonical) {
                throw new Error('Failed to extract canonical expectations');
            }
            
            const validation = {
                valid: true,
                issues: [],
                warnings: [],
                bubbleTypesCount: Object.keys(canonical.bubbleTypes || {}).length,
                sourceFiles: canonical.metadata?.sourceFiles || []
            };
            
            // 各バブルタイプの設定一貫性をチェック
            for (const [bubbleType, config] of Object.entries(canonical.bubbleTypes || {})) {
                if (!config.health || !config.score || !config.size || !config.maxAge) {
                    validation.warnings.push(`${bubbleType}: 不完全な設定（一部プロパティが不足）`);
                }
                
                if (config.health <= 0) {
                    validation.issues.push(`${bubbleType}: 無効な体力値 (${config.health})`);
                    validation.valid = false;
                }
                
                if (config.size <= 0) {
                    validation.issues.push(`${bubbleType}: 無効なサイズ値 (${config.size})`);
                    validation.valid = false;
                }
            }
            
            return validation;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'TEST_GENERATOR_VALIDATE_SYNC');
            return {
                valid: false,
                issues: [`検証エラー: ${error.message}`],
                warnings: [],
                bubbleTypesCount: 0,
                sourceFiles: []
            };
        }
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
            cacheSize: this.generatedExpectations.size
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
     * キャッシュをクリア
     */
    clearCache() {
        this.generatedExpectations.clear();
        console.log('[TestConfigurationGenerator] キャッシュをクリアしました');
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