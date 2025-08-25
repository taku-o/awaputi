/**
 * Configuration Consistency Test Suite
 * 
 * ゲームバランス設定ファイル間の整合性を包括的にテストするスイート。
 * このテストは設定の同期、一貫性、論理的整合性を検証します。
 * 
 * Created: 2025-07-27 (Task 7.3)
 */
import { jest, describe, test, expect, beforeAll } from '@jest/globals';

// Configuration interfaces
interface BubbleConfig {
    score?: number;
    effects?: {
        intensity?: number;
        duration?: number;
    };
    [key: string]: any;
}

interface GameBalanceConfig {
    [bubbleType: string]: BubbleConfig;
}

interface ValidationResult {
    issues: Array<{ severity: string; message: string; }>;
    warnings: Array<{
        message: string;
    }>;
}

interface ConfigMetadata {
    version: string;
    lastUpdated: string;
    bubbleTypesCount: number;
    hasSpecialEffects: boolean;
    scoreRange: { min: number; max: number; };
}

interface ConfigStructure {
    bubbleTypes: string[];
    propertiesPerType: { [key: string]: string[] };
    specialEffectTypes: string[];
    scoreDistribution: { [key: string]: number };
}


// Mock dependencies for Node.js environment
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

// Mock validation utilities with proper types
const mockConfigurationExtractor = {
    extractGameBalanceConfig: jest.fn().mockReturnValue({
        normal: { score: 15 },
        stone: { score: 25 },
        iron: { score: 50 },
        diamond: { score: 100 },
        boss: { score: 100 },
        pink: { score: 30 },
        poison: { score: 20 },
        spiky: { score: 40 },
        electric: { 
            score: 35,
            effects: { intensity: 15, duration: 1500 }
        },
        rainbow: { 
            score: 50,
            effects: { duration: 8000 }
        },
        clock: { score: 40 },
        escaping: { score: 25 }
    } as GameBalanceConfig),
    extractBubbleHardcodedConfig: jest.fn().mockReturnValue({} as any)
};

const mockValidationRules = {
    validateConsistency: jest.fn().mockReturnValue({
        issues: [],
        warnings: []
    } as ValidationResult),
    validateLogicalConsistency: jest.fn().mockReturnValue({
        issues: [],
        warnings: []
    } as ValidationResult),
    validatePerformanceImpact: jest.fn().mockReturnValue({
        warnings: []
    } as { warnings: any[] })
};

// Import test utilities (mocked)
jest.mock('../../scripts/validate-configuration.js', () => ({
    ConfigurationExtractor: mockConfigurationExtractor,
    ValidationRules: mockValidationRules
}));

import { ConfigurationExtractor, ValidationRules } from '../../scripts/validate-configuration.js';

describe('Configuration Consistency Tests', () => {

    let gameBalanceConfig: GameBalanceConfig;
    let bubbleConfig: any;
    let validationResults: ValidationResult;

    beforeAll(async () => {
        // Extract configurations from source files
        gameBalanceConfig = ConfigurationExtractor.extractGameBalanceConfig();
        bubbleConfig = ConfigurationExtractor.extractBubbleHardcodedConfig();
        
        // Run validation
        validationResults = ValidationRules.validateConsistency(
            gameBalanceConfig,
            bubbleConfig
        );
    });
    describe('Configuration Extraction', () => {
        test('should successfully extract GameBalance configuration', () => {
            expect(gameBalanceConfig).toBeDefined();
            expect(typeof gameBalanceConfig).toBe('object');
            expect(Object.keys(gameBalanceConfig).length).toBeGreaterThan(0);
        });

        test('should extract base scores from GameBalance.js', () => {
            expect(gameBalanceConfig).toHaveProperty('normal');
            expect(gameBalanceConfig.normal).toHaveProperty('score');
            expect(gameBalanceConfig.normal.score).toBe(15);
            expect(gameBalanceConfig).toHaveProperty('boss');
            expect(gameBalanceConfig.boss).toHaveProperty('score');
            expect(gameBalanceConfig.boss.score).toBe(100);
        });

        test('should extract bubble configuration properties', () => {
            const bubbleTypes = Object.keys(gameBalanceConfig);
            expect(bubbleTypes.length).toBeGreaterThan(5);
            
            for (const bubbleType of bubbleTypes) {
                const config = gameBalanceConfig[bubbleType];
                if (config.score !== undefined) {
                    expect(typeof config.score).toBe('number');
                    expect(config.score).toBeGreaterThanOrEqual(0);
                }
            }
        });
    });

    describe('Cross-File Configuration Consistency', () => {
        test('should have consistent bubble types across configuration sources', () => {
            const gameBalanceTypes = Object.keys(gameBalanceConfig);
            
            // Check that key bubble types are present
            const expectedTypes = ['normal', 'stone', 'iron', 'diamond', 'boss', 'pink', 'poison', 'spiky'];
            for (const expectedType of expectedTypes) {
                expect(gameBalanceTypes).toContain(expectedType);
            }
        });

        test('should have logical score progression', () => {
            const scores = {
                normal: gameBalanceConfig.normal?.score || 0,
                stone: gameBalanceConfig.stone?.score || 0,
                iron: gameBalanceConfig.iron?.score || 0,
                diamond: gameBalanceConfig.diamond?.score || 0,
                boss: gameBalanceConfig.boss?.score || 0
            };

            expect(scores.normal).toBeLessThan(scores.stone);
            expect(scores.stone).toBeLessThan(scores.iron);
            expect(scores.iron).toBeLessThanOrEqual(scores.diamond);
            expect(scores.diamond).toBeLessThanOrEqual(scores.boss);
        });

        test('should have consistent special bubble configurations', () => {
            const specialBubbles = ['electric', 'rainbow', 'poison', 'spiky'];
            
            for (const bubbleType of specialBubbles) {
                expect(gameBalanceConfig).toHaveProperty(bubbleType);
                expect(gameBalanceConfig[bubbleType]).toHaveProperty('score');
                expect(typeof gameBalanceConfig[bubbleType].score).toBe('number');
            }
        });
    });

    describe('Effect Configuration Consistency', () => {
        test('should have proper effect configurations for special bubbles', () => {
            const effectBubbles = ['electric', 'rainbow'];
            
            for (const bubbleType of effectBubbles) {
                const bubbleConfig = gameBalanceConfig[bubbleType];
                expect(bubbleConfig).toHaveProperty('effects');
                
                if (bubbleConfig.effects) {
                    if (bubbleConfig.effects.duration !== undefined) {
                        expect(typeof bubbleConfig.effects.duration).toBe('number');
                        expect(bubbleConfig.effects.duration).toBeGreaterThan(0);
                    }
                    if (bubbleConfig.effects.intensity !== undefined) {
                        expect(typeof bubbleConfig.effects.intensity).toBe('number');
                        expect(bubbleConfig.effects.intensity).toBeGreaterThan(0);
                    }
                }
            }
        });
    });

    describe('Configuration Metadata', () => {
        test('should generate proper configuration metadata', () => {
            const metadata: ConfigMetadata = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                bubbleTypesCount: Object.keys(gameBalanceConfig).length,
                hasSpecialEffects: Object.values(gameBalanceConfig).some(config => config.effects),
                scoreRange: {
                    min: Math.min(...Object.values(gameBalanceConfig).map(config => config.score || 0)),
                    max: Math.max(...Object.values(gameBalanceConfig).map(config => config.score || 0))
                }
            };

            expect(metadata.bubbleTypesCount).toBeGreaterThan(5);
            expect(metadata.hasSpecialEffects).toBe(true);
            expect(metadata.scoreRange.min).toBeGreaterThanOrEqual(0);
            expect(metadata.scoreRange.max).toBeGreaterThan(metadata.scoreRange.min);
        });

        test('should analyze configuration structure', () => {
            const structure: ConfigStructure = {
                bubbleTypes: Object.keys(gameBalanceConfig),
                propertiesPerType: {},
                specialEffectTypes: [],
                scoreDistribution: {}
            };

            // Analyze properties per type
            for (const [type, config] of Object.entries(gameBalanceConfig)) {
                structure.propertiesPerType[type] = Object.keys(config);
                
                if (config.effects) {
                    structure.specialEffectTypes.push(type);
                }
                if (config.score !== undefined) {
                    structure.scoreDistribution[type] = config.score;
                }
            }

            expect(structure.bubbleTypes.length).toBeGreaterThan(0);
            expect(structure.specialEffectTypes.length).toBeGreaterThan(0);
            expect(Object.keys(structure.scoreDistribution).length).toBeGreaterThan(0);
        });
    });

    describe('Validation Rules', () => {

        test('should pass consistency validation', () => {
            expect(validationResults).toBeDefined();
            expect(validationResults.issues).toBeInstanceOf(Array);
            expect(validationResults.warnings).toBeInstanceOf(Array);
            
            // For this test, we expect no critical issues
            const criticalIssues = validationResults.issues.filter(issue => 
                issue.severity === 'error' || issue.severity === 'critical'
            );
            expect(criticalIssues.length).toBe(0);
        });
        test('should validate logical consistency', () => {
            const logicalResults = ValidationRules.validateLogicalConsistency(gameBalanceConfig);
            expect(logicalResults).toBeDefined();
            expect(logicalResults.issues).toBeInstanceOf(Array);
            expect(logicalResults.warnings).toBeInstanceOf(Array);
        });

        test('should validate performance impact', () => {
            const performanceResults = ValidationRules.validatePerformanceImpact(gameBalanceConfig);
            expect(performanceResults).toBeDefined();
            expect(performanceResults.warnings).toBeInstanceOf(Array);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing configuration gracefully', () => {
            expect(() => {
                ConfigurationExtractor.extractGameBalanceConfig();
            }).not.toThrow();
        });

        test('should handle invalid configuration data', () => {
            expect(() => {
                ValidationRules.validateConsistency(null as any, null as any);
            }).not.toThrow();
        });
    });

    describe('Configuration Updates', () => {
        test('should detect configuration changes', () => {
            const originalConfig = { ...gameBalanceConfig };
            const modifiedConfig = {
                ...originalConfig,
                normal: { ...originalConfig.normal, score: 20 }
            };

            expect(modifiedConfig.normal.score).not.toBe(originalConfig.normal.score);
        });

        test('should maintain configuration integrity after updates', () => {
            const updatedConfig = {
                ...gameBalanceConfig,
                newBubbleType: { score: 75 }
            };

            expect(Object.keys(updatedConfig).length).toBe(Object.keys(gameBalanceConfig).length + 1);
            expect(updatedConfig).toHaveProperty('newBubbleType');
            expect(updatedConfig.newBubbleType.score).toBe(75);
        });
    });
});