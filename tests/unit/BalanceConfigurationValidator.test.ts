/**
 * Unit tests for BalanceConfigurationValidator
 */
import { describe, test, beforeEach, expect, jest } from '@jest/globals';
import { BalanceConfigurationValidator, getBalanceConfigurationValidator } from '../../src/utils/BalanceConfigurationValidator.js';
// Type definitions for test objects
interface MockErrorHandler {
    handleError: jest.Mock,
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
        [bubbleType: string]: number,
    };
    combo?: {
        maxMultiplier: number,
    };
    ageBonus?: {
        earlyBonus: number,
        lateBonus: number,
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
    property: string,
    rule: string,
    error: string,
}
interface ValidationWarning {
    property: string,
    message: string,
}
interface ValidationResult {
    isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    bubbleType?: string;
    validationId?: string;
    timestamp?: number;
    executionTime?: number;
}
interface ValidationStats {
    totalValidations: number,
    failedValidations: number,
    successRate: string,
}
interface ValidationHistoryEntry {
    validationId: string,
    bubbleType: string,
}
interface ValidationRule {
    type: string,
    min?: number;
    max?: number;
    description: string,
}
interface PropertyValidationResult {
    isValid: boolean,
    error: string | null,
}
// Jest の設定
const mockErrorHandler: MockErrorHandler = {
    handleError: jest.fn()'),
};
// モックの設定
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: jest.fn(() => mockErrorHandler));
    }))');
describe('BalanceConfigurationValidator', () => {
    let validator: BalanceConfigurationValidator,
    beforeEach(() => {
        // モックをリセット
        jest.clearAllMocks();
        // インスタンスを作成
        validator = new BalanceConfigurationValidator();
    )');
    describe('Constructor', (') => {
        test('should initialize with correct properties', () => {
            expect(validator.errorHandler).toBe(mockErrorHandler);
            expect(validator.validationRules).toBeInstanceOf(Map);
            expect(validator.validationHistory).toEqual([]);
            expect(validator.errorStats').toHaveProperty('totalValidations', 0);
            expect(validator.errorStats').toHaveProperty('failedValidations', 0);
        }');
        test('should initialize validation rules', () => {
            expect(validator.validationRules.size).toBeGreaterThan(0');
            expect(validator.validationRules.has('bubble.health').toBe(true');
            expect(validator.validationRules.has('bubble.score').toBe(true');
            expect(validator.validationRules.has('score.baseScore').toBe(true);
        }');
    }
    describe('validateBubbleConfig', (') => {
        test('should validate valid normal bubble config', (') => {
            const config: BubbleConfig = {
                health: 1,
                size: 50,
                maxAge: 12000,
                score: 15
            };
            const result: ValidationResult = validator.validateBubbleConfig('normal', config);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.bubbleType').toBe('normal');
            expect(result').toHaveProperty('validationId');
            expect(result').toHaveProperty('timestamp');
            expect(result').toHaveProperty('executionTime');
        }');
        test('should reject invalid health value', (') => {
            const config: BubbleConfig = {
                health: 0, // Invalid: below minimum
                size: 50,
                maxAge: 12000,
                score: 15
            };
            const result: ValidationResult = validator.validateBubbleConfig('normal', config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]').toHaveProperty('property', 'health');
            expect(result.errors[0]').toHaveProperty('rule', 'bubble.health');
            expect(result.errors[0].error').toContain('below minimum');
        }');
        test('should reject invalid size value', (') => {
            const config: BubbleConfig = {
                health: 1,
                size: 200, // Invalid: above maximum
                maxAge: 12000,
                score: 15
            };
            const result: ValidationResult = validator.validateBubbleConfig('normal', config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]').toHaveProperty('property', 'size');
            expect(result.errors[0].error').toContain('above maximum');
        }');
        test('should validate boss bubble config with warnings', (') => {
            const config: BubbleConfig = {
                health: 8,
                size: 90,
                score: 800
            };
            const result: ValidationResult = validator.validateBubbleConfig('boss', config);
            expect(result.isValid).toBe(true);
            expect(result.warnings.length).toBeGreaterThanOrEqual(0);
        }');
        test('should validate boss bubble and warn about low health', (') => {
            const config: BubbleConfig = {
                health: 1, // Valid value but low for boss
                size: 90,
                score: 800
            };
            const result: ValidationResult = validator.validateBubbleConfig('boss', config);
            expect(result.isValid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0');
            const healthWarning = result.warnings.find(w => w.property === 'health');
            expect(healthWarning).toBeTruthy();
            expect(healthWarning!.message').toContain('greater than normal bubble health');
        }');
        test('should validate pink bubble special effects', (') => {
            const config: BubbleConfig = {
                health: 1,
                size: 45,
                healAmount: 25
            };
            const result: ValidationResult = validator.validateBubbleConfig('pink', config);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');
        test('should reject invalid heal amount for pink bubble', (') => {
            const config: BubbleConfig = {
                health: 1,
                size: 45,
                healAmount: 200 // Invalid: above maximum
            };
            const result: ValidationResult = validator.validateBubbleConfig('pink', config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]').toHaveProperty('property', 'healAmount');
        }');
        test('should validate electric bubble special effects', (') => {
            const config: BubbleConfig = {
                health: 1,
                size: 50,
                shakeIntensity: 15,
                disableDuration: 1500
            };
            const result: ValidationResult = validator.validateBubbleConfig('electric', config);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');
        test('should handle validation errors gracefully', () => {
            // モックエラーハンドラーがエラーを投げるように設定
            const originalValidateProperty = validator._validateProperty;
            validator._validateProperty = jest.fn().mockImplementation((') => {
                throw new Error('Validation error');
            }');
            const config: BubbleConfig = { health: 1 };
            const result: ValidationResult = validator.validateBubbleConfig('normal', config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error').toContain('internal error');
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
            // 元のメソッドを復元
            validator._validateProperty = originalValidateProperty;
        }');
    }
    describe('validateScoreConfig', (') => {
        test('should validate valid score config', () => {
            const scoreConfig: ScoreConfig = {
                baseScores: {
                    normal: 15,
                    stone: 25,
                    boss: 100
                },
                combo: {
                    maxMultiplier: 2.5
                },
                ageBonus: {
                    earlyBonus: 2.0,
                    lateBonus: 3.0
                }
            };
            const result: ValidationResult = validator.validateScoreConfig(scoreConfig),
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');
        test('should reject invalid base scores', () => {
            const scoreConfig: ScoreConfig = {
                baseScores: {
                    normal: 0, // Invalid: below minimum
                    stone: 25
                }
            };
            const result: ValidationResult = validator.validateScoreConfig(scoreConfig),
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]').toHaveProperty('property', 'baseScores.normal');
        }');
        test('should generate warnings for logical inconsistencies', () => {
            const scoreConfig: ScoreConfig = {
                baseScores: {
                    normal: 25,
                    stone: 20 // Warning: stone should be higher than normal
                }
            };
            const result: ValidationResult = validator.validateScoreConfig(scoreConfig),
            expect(result.isValid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0');
            const stoneWarning = result.warnings.find(w => w.property === 'baseScores.stone');
            expect(stoneWarning).toBeTruthy();
        }');
    }
    describe('validateStageConfig', (') => {
        test('should validate valid stage config', () => {
            const stageConfig: StageConfig = {
                spawnRate: 1.5,
                maxBubbles: 20,
                unlockRequirement: 500
            };
            const result: ValidationResult = validator.validateStageConfig(stageConfig),
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');
        test('should reject invalid spawn rate', () => {
            const stageConfig: StageConfig = {
                spawnRate: 15.0 // Invalid: above maximum
            };
            const result: ValidationResult = validator.validateStageConfig(stageConfig),
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]').toHaveProperty('property', 'spawnRate');
        }');
    }
    describe('validateItemConfig', (') => {
        test('should validate valid item config', () => {
            const itemConfig: ItemConfig = {
                baseCost: 100,
                costMultiplier: 1.3,
                maxLevel: 5
            };
            const result: ValidationResult = validator.validateItemConfig(itemConfig),
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');
        test('should reject invalid cost multiplier', () => {
            const itemConfig: ItemConfig = {
                costMultiplier: 5.0 // Invalid: above maximum
            };
            const result: ValidationResult = validator.validateItemConfig(itemConfig),
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]').toHaveProperty('property', 'costMultiplier');
        }');
    }
    describe('_validateProperty', (') => {
        test('should validate number type correctly', (') => {
            const result: PropertyValidationResult = validator._validateProperty('bubble.health', 5);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        }');
        test('should reject wrong type', (') => {
            const result: PropertyValidationResult = validator._validateProperty('bubble.health', '5');
            expect(result.isValid).toBe(false);
            expect(result.error').toContain('Expected number');
        }');
        test('should validate number range', (') => {
            const validResult: PropertyValidationResult = validator._validateProperty('bubble.health', 5);
            expect(validResult.isValid).toBe(true');
            const belowMinResult: PropertyValidationResult = validator._validateProperty('bubble.health', 0);
            expect(belowMinResult.isValid).toBe(false);
            expect(belowMinResult.error').toContain('below minimum'');
            const aboveMaxResult: PropertyValidationResult = validator._validateProperty('bubble.health', 25);
            expect(aboveMaxResult.isValid).toBe(false);
            expect(aboveMaxResult.error').toContain('above maximum');
        }');
        test('should pass validation for unknown rule', (') => {
            const result: PropertyValidationResult = validator._validateProperty('unknown.rule', 'any value');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        }');
    }
    describe('Statistics and history', (') => {
        test('should update validation statistics', (') => {
            const config: BubbleConfig = { health: 1 };
            validator.validateBubbleConfig('normal', config);
            const stats: ValidationStats = validator.getValidationStats(),
            expect(stats.totalValidations).toBe(1);
            expect(stats.failedValidations).toBe(0);
            expect(stats.successRate').toBe('100.00%');
        }');
        test('should track failed validations', (') => {
            const config: BubbleConfig = { health: 0 }; // Invalid
            validator.validateBubbleConfig('normal', config);
            const stats: ValidationStats = validator.getValidationStats(),
            expect(stats.totalValidations).toBe(1);
            expect(stats.failedValidations).toBe(1);
            expect(stats.successRate').toBe('0.00%');
        }');
        test('should maintain validation history', (') => {
            const config: BubbleConfig = { health: 1 };
            validator.validateBubbleConfig('normal', config);
            const history: ValidationHistoryEntry[] = validator.getValidationHistory(),
            expect(history).toHaveLength(1);
            expect(history[0]').toHaveProperty('validationId');
            expect(history[0]').toHaveProperty('bubbleType', 'normal');
        }');
        test('should cleanup history when it gets too long', () => {
            // 履歴クリーンアップのテスト用に大量のバリデーションを実行
            for (let i = 0; i < 1100; i++') {
                validator.validateBubbleConfig('normal', { health: 1 });
            }
            expect(validator.validationHistory.length).toBeLessThan(1100);
        }');
    }
    describe('Custom validation rules', (') => {
        test('should allow adding custom validation rules', (') => {
            const customRule: ValidationRule = {
                type: 'number',
                min: 10,
                max: 100,
                description: 'Custom test rule'
            };
            validator.addValidationRule('custom.test', customRule');
            const retrievedRule: ValidationRule = validator.getValidationRule('custom.test'),
            expect(retrievedRule).toEqual(customRule);
        }');
        test('should return all validation rules', () => {
            const allRules: Record<string, ValidationRule> = validator.getAllValidationRules();
            expect(typeof allRules').toBe('object');
            expect(allRules').toHaveProperty('bubble.health');
            expect(allRules').toHaveProperty('bubble.score');
        }');
    }
    describe('Singleton pattern', (') => {
        test('should return same instance for getBalanceConfigurationValidator', () => {
            const instance1 = getBalanceConfigurationValidator();
            const instance2 = getBalanceConfigurationValidator();
            expect(instance1).toBe(instance2);
        }');
    }
    describe('Logical consistency validation', (') => {
        test('should validate hard bubble health progression', (') => {
            // Stone bubble with low health should generate warning
            const stoneConfig: BubbleConfig = { health: 1 }; // Should be at least 2
            const result: ValidationResult = validator.validateBubbleConfig('stone', stoneConfig);
            expect(result.isValid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0');
            const healthWarning = result.warnings.find(w => w.property === 'health');
            expect(healthWarning).toBeTruthy();
        }');
        test('should warn about extreme effect values', (') => {
            // High heal amount should generate warning
            const pinkConfig: BubbleConfig = { healAmount: 60 };
            const result: ValidationResult = validator.validateBubbleConfig('pink', pinkConfig);
            expect(result.isValid).toBe(true');
            const healWarning = result.warnings.find(w => w.property === 'healAmount');
            expect(healWarning).toBeTruthy();
            expect(healWarning!.message').toContain('too easy');
        }');
        test('should validate score progression in score config', () => {
            const scoreConfig: ScoreConfig = {
                baseScores: {
                    normal: 15,
                    stone: 25,
                    iron: 40,
                    diamond: 60,
                    boss: 100
                }
            };
            const result: ValidationResult = validator.validateScoreConfig(scoreConfig),
            expect(result.isValid).toBe(true);
            // Proper progression should not generate warnings about order
            const orderWarnings = result.warnings.filter(w => ');
                w.message.includes('should be higher than');
            expect(orderWarnings).toHaveLength(0);
        });
    }
}');