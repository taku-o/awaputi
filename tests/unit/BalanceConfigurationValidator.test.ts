/**
 * Unit tests for BalanceConfigurationValidator
 */
import { describe, test, beforeEach, expect, jest } from '@jest/globals';
import { BalanceConfigurationValidator, getBalanceConfigurationValidator } from '../../src/utils/BalanceConfigurationValidator.js';

// Type definitions for test objects
interface MockErrorHandler {
    handleError: jest.Mock<void, [Error]>;
}

interface BubbleConfig {
    health?: number;
    size?: number;
    maxAge?: number;
    score?: number;
    healAmount?: number;
    shakeIntensity?: number;
    disableDuration?: number;
}

interface ScoreConfig {
    baseScores?: {
        [bubbleType: string]: number;
    };
    combo?: {
        maxMultiplier: number;
    };
    ageBonus?: { 
        earlyBonus: number; 
        lateBonus: number; 
    };
}

interface StageConfig {
    spawnRate?: number;
    maxBubbles?: number;
    unlockRequirement?: number;
}

interface ItemConfig {
    baseCost?: number;
    costMultiplier?: number;
    maxLevel?: number;
}

interface ValidationError {
    property: string;
    rule: string;
    error: string;
}

interface ValidationWarning { 
    property: string; 
    message: string; 
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    bubbleType?: string;
    validationId?: string;
    timestamp?: number;
    executionTime?: number;
}

interface ValidationStats {
    totalValidations: number;
    failedValidations: number;
    successRate: string;
}

interface ValidationHistoryEntry { 
    validationId: string; 
    bubbleType: string; 
}

interface ValidationRule {
    type: string;
    min?: number;
    max?: number;
    description: string;
}

interface PropertyValidationResult {
    isValid: boolean;
    error: string | null;
}

// Jest の設定
const mockErrorHandler: MockErrorHandler = {
    handleError: jest.fn()
};

// モックの設定
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: jest.fn(() => mockErrorHandler)
}));

describe('BalanceConfigurationValidator', () => {
    let validator: BalanceConfigurationValidator;
    
    beforeEach(() => {
        validator = new BalanceConfigurationValidator();
        mockErrorHandler.handleError.mockClear();
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(validator).toBeDefined();
            expect(validator).toBeInstanceOf(BalanceConfigurationValidator);
        });

        test('バリデーションルールが初期化される', () => {
            expect(validator.getValidationRules).toBeDefined();
            expect(typeof validator.getValidationRules).toBe('function');
        });
    });

    describe('バブル設定バリデーション', () => {
        test('正常なバブル設定が有効と判定される', () => {
            const validBubbleConfig: BubbleConfig = {
                health: 1,
                size: 50,
                maxAge: 12000,
                score: 15
            };

            const result = validator.validateBubbleConfig('normal', validBubbleConfig);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.bubbleType).toBe('normal');
        });

        test('無効な体力値でエラーが記録される', () => {
            const invalidBubbleConfig: BubbleConfig = {
                health: -1,  // 無効値
                size: 50,
                maxAge: 12000,
                score: 15
            };

            const result = validator.validateBubbleConfig('normal', invalidBubbleConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(e => e.property === 'health')).toBe(true);
        });

        test('無効なサイズ値でエラーが記録される', () => {
            const invalidBubbleConfig: BubbleConfig = {
                health: 1,
                size: 200,  // 上限超過
                maxAge: 12000,
                score: 15
            };

            const result = validator.validateBubbleConfig('normal', invalidBubbleConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'size')).toBe(true);
        });

        test('無効な寿命値でエラーが記録される', () => {
            const invalidBubbleConfig: BubbleConfig = {
                health: 1,
                size: 50,
                maxAge: 0,  // 無効値
                score: 15
            };

            const result = validator.validateBubbleConfig('normal', invalidBubbleConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'maxAge')).toBe(true);
        });

        test('特殊バブル設定が正しく検証される', () => {
            const pinkBubbleConfig: BubbleConfig = {
                health: 1,
                size: 45,
                maxAge: 10000,
                score: 25,
                healAmount: 25  // ピンクバブル特有
            };

            const result = validator.validateBubbleConfig('pink', pinkBubbleConfig);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('不正な回復量でエラーが記録される', () => {
            const invalidPinkBubbleConfig: BubbleConfig = {
                health: 1,
                size: 45,
                maxAge: 10000,
                score: 25,
                healAmount: -10  // 無効値
            };

            const result = validator.validateBubbleConfig('pink', invalidPinkBubbleConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'healAmount')).toBe(true);
        });
    });

    describe('スコア設定バリデーション', () => {
        test('正常なスコア設定が有効と判定される', () => {
            const validScoreConfig: ScoreConfig = {
                baseScores: {
                    normal: 15,
                    stone: 25,
                    pink: 25
                },
                combo: {
                    maxMultiplier: 2.5
                },
                ageBonus: {
                    earlyBonus: 2.0,
                    lateBonus: 3.0
                }
            };

            const result = validator.validateScoreConfig(validScoreConfig);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('無効なベーススコアでエラーが記録される', () => {
            const invalidScoreConfig: ScoreConfig = {
                baseScores: {
                    normal: -5,  // 無効値
                    stone: 25,
                    pink: 25
                }
            };

            const result = validator.validateScoreConfig(invalidScoreConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'baseScores.normal')).toBe(true);
        });

        test('無効なコンボ倍率でエラーが記録される', () => {
            const invalidScoreConfig: ScoreConfig = {
                combo: {
                    maxMultiplier: 0  // 無効値
                }
            };

            const result = validator.validateScoreConfig(invalidScoreConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'combo.maxMultiplier')).toBe(true);
        });

        test('無効な年齢ボーナスでエラーが記録される', () => {
            const invalidScoreConfig: ScoreConfig = {
                ageBonus: {
                    earlyBonus: -1,  // 無効値
                    lateBonus: 3.0
                }
            };

            const result = validator.validateScoreConfig(invalidScoreConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'ageBonus.earlyBonus')).toBe(true);
        });
    });

    describe('ステージ設定バリデーション', () => {
        test('正常なステージ設定が有効と判定される', () => {
            const validStageConfig: StageConfig = {
                spawnRate: 2.5,
                maxBubbles: 15,
                unlockRequirement: 500
            };

            const result = validator.validateStageConfig('hard', validStageConfig);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('無効なスポーン率でエラーが記録される', () => {
            const invalidStageConfig: StageConfig = {
                spawnRate: 0,  // 無効値
                maxBubbles: 15,
                unlockRequirement: 500
            };

            const result = validator.validateStageConfig('hard', invalidStageConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'spawnRate')).toBe(true);
        });

        test('無効なバブル最大数でエラーが記録される', () => {
            const invalidStageConfig: StageConfig = {
                spawnRate: 2.5,
                maxBubbles: 100,  // 上限超過
                unlockRequirement: 500
            };

            const result = validator.validateStageConfig('hard', invalidStageConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'maxBubbles')).toBe(true);
        });

        test('無効な解放要件でエラーが記録される', () => {
            const invalidStageConfig: StageConfig = {
                spawnRate: 2.5,
                maxBubbles: 15,
                unlockRequirement: -1  // 無効値
            };

            const result = validator.validateStageConfig('hard', invalidStageConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'unlockRequirement')).toBe(true);
        });
    });

    describe('アイテム設定バリデーション', () => {
        test('正常なアイテム設定が有効と判定される', () => {
            const validItemConfig: ItemConfig = {
                baseCost: 100,
                costMultiplier: 1.5,
                maxLevel: 10
            };

            const result = validator.validateItemConfig('speedBoost', validItemConfig);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('無効なベースコストでエラーが記録される', () => {
            const invalidItemConfig: ItemConfig = {
                baseCost: -50,  // 無効値
                costMultiplier: 1.5,
                maxLevel: 10
            };

            const result = validator.validateItemConfig('speedBoost', invalidItemConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'baseCost')).toBe(true);
        });

        test('無効なコスト倍率でエラーが記録される', () => {
            const invalidItemConfig: ItemConfig = {
                baseCost: 100,
                costMultiplier: 0.5,  // 無効値 (1未満)
                maxLevel: 10
            };

            const result = validator.validateItemConfig('speedBoost', invalidItemConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'costMultiplier')).toBe(true);
        });

        test('無効な最大レベルでエラーが記録される', () => {
            const invalidItemConfig: ItemConfig = {
                baseCost: 100,
                costMultiplier: 1.5,
                maxLevel: 0  // 無効値
            };

            const result = validator.validateItemConfig('speedBoost', invalidItemConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.property === 'maxLevel')).toBe(true);
        });
    });

    describe('バリデーション統計', () => {
        test('統計情報が正しく記録される', () => {
            const validConfig: BubbleConfig = {
                health: 1,
                size: 50,
                maxAge: 12000,
                score: 15
            };

            // 複数のバリデーションを実行
            validator.validateBubbleConfig('normal', validConfig);
            validator.validateBubbleConfig('stone', validConfig);

            const stats = validator.getValidationStats();

            expect(stats.totalValidations).toBe(2);
            expect(stats.failedValidations).toBe(0);
            expect(stats.successRate).toBe('100%');
        });

        test('失敗統計が正しく記録される', () => {
            const invalidConfig: BubbleConfig = {
                health: -1,
                size: 50,
                maxAge: 12000,
                score: 15
            };

            validator.validateBubbleConfig('normal', invalidConfig);

            const stats = validator.getValidationStats();

            expect(stats.totalValidations).toBe(1);
            expect(stats.failedValidations).toBe(1);
            expect(stats.successRate).toBe('0%');
        });

        test('バリデーション履歴が記録される', () => {
            const validConfig: BubbleConfig = {
                health: 1,
                size: 50,
                maxAge: 12000,
                score: 15
            };

            validator.validateBubbleConfig('normal', validConfig);

            const history = validator.getValidationHistory();

            expect(history).toHaveLength(1);
            expect(history[0].bubbleType).toBe('normal');
            expect(history[0].validationId).toBeDefined();
        });
    });

    describe('バリデーションルール', () => {
        test('バリデーションルールが取得できる', () => {
            const rules = validator.getValidationRules();

            expect(rules).toBeDefined();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);
        });

        test('カスタムバリデーションルールを追加できる', () => {
            const customRule: ValidationRule = {
                type: 'custom',
                min: 0,
                max: 100,
                description: 'Custom rule for testing'
            };

            validator.addValidationRule('customProperty', customRule);

            const rules = validator.getValidationRules();
            expect(rules.some((rule: any) => rule.description === customRule.description)).toBe(true);
        });

        test('個別プロパティのバリデーション', () => {
            const result = validator.validateProperty('health', 5);

            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('無効値での個別プロパティバリデーション', () => {
            const result = validator.validateProperty('health', -1);

            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('エラーハンドリング', () => {
        test('null設定でもエラーなく処理される', () => {
            expect(() => {
                validator.validateBubbleConfig('normal', null as any);
            }).not.toThrow();
        });

        test('undefined設定でもエラーなく処理される', () => {
            expect(() => {
                validator.validateScoreConfig(undefined as any);
            }).not.toThrow();
        });

        test('空オブジェクトでもエラーなく処理される', () => {
            const result = validator.validateBubbleConfig('normal', {});

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('予期しないプロパティが含まれても処理される', () => {
            const configWithExtraProps: BubbleConfig & { unexpectedProp: string } = {
                health: 1,
                size: 50,
                maxAge: 12000,
                score: 15,
                unexpectedProp: 'unexpected'
            };

            expect(() => {
                validator.validateBubbleConfig('normal', configWithExtraProps);
            }).not.toThrow();
        });
    });

    describe('シングルトンパターン', () => {
        test('getBalanceConfigurationValidator で同じインスタンスが返される', () => {
            const instance1 = getBalanceConfigurationValidator();
            const instance2 = getBalanceConfigurationValidator();

            expect(instance1).toBe(instance2);
        });

        test('シングルトンインスタンスが正しい型を持つ', () => {
            const instance = getBalanceConfigurationValidator();
            expect(instance).toBeInstanceOf(BalanceConfigurationValidator);
        });
    });

    describe('パフォーマンス', () => {
        test('バリデーション実行時間が記録される', () => {
            const validConfig: BubbleConfig = {
                health: 1,
                size: 50,
                maxAge: 12000,
                score: 15
            };

            const result = validator.validateBubbleConfig('normal', validConfig);

            expect(result.timestamp).toBeDefined();
            expect(result.executionTime).toBeDefined();
            expect(typeof result.executionTime).toBe('number');
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        test('複数の並行バリデーションが正しく処理される', () => {
            const configs = [
                { health: 1, size: 50, maxAge: 12000, score: 15 },
                { health: 2, size: 60, maxAge: 15000, score: 20 },
                { health: 3, size: 70, maxAge: 18000, score: 25 }
            ];

            const promises = configs.map((config, index) =>
                Promise.resolve(validator.validateBubbleConfig(`type${index}`, config))
            );

            return Promise.all(promises).then(results => {
                expect(results).toHaveLength(3);
                results.forEach(result => {
                    expect(result.isValid).toBe(true);
                    expect(result.executionTime).toBeDefined();
                });
            });
        });
    });
});