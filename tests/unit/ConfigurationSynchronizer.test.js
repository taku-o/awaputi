/**
 * Unit tests for ConfigurationSynchronizer
 */

import { ConfigurationSynchronizer, getConfigurationSynchronizer } from '../../src/utils/ConfigurationSynchronizer.js';

// Jest の設定
const mockErrorHandler = {
    handleError: jest.fn()
};

const mockConfigManager = {
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    getCategory: jest.fn()
};

// モックの設定
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
}));

jest.mock('../../src/core/ConfigurationManager.js', () => ({
    getConfigurationManager: () => mockConfigManager
}));

describe('ConfigurationSynchronizer', () => {
    let synchronizer;

    beforeEach(() => {
        // モックをリセット
        jest.clearAllMocks();
        
        // インスタンスを作成
        synchronizer = new ConfigurationSynchronizer();
    });

    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(synchronizer.configManager).toBe(mockConfigManager);
            expect(synchronizer.errorHandler).toBe(mockErrorHandler);
            expect(synchronizer.discrepancies).toEqual([]);
            expect(synchronizer.syncHistory).toEqual([]);
            expect(synchronizer.configurationSources).toBeInstanceOf(Map);
        });

        test('should register configuration sources', () => {
            expect(synchronizer.configurationSources.size).toBe(4);
            expect(synchronizer.configurationSources.has('gameBalance')).toBe(true);
            expect(synchronizer.configurationSources.has('bubbleImplementation')).toBe(true);
            expect(synchronizer.configurationSources.has('testExpectations')).toBe(true);
            expect(synchronizer.configurationSources.has('configurationManager')).toBe(true);
        });
    });

    describe('validateConsistency', () => {
        test('should validate consistency across all sources', async () => {
            // モックデータの設定
            synchronizer._loadGameBalanceConfig = jest.fn().mockResolvedValue({
                bubbles: {
                    normal: { score: 15 },
                    boss: { health: 5 }
                }
            });

            synchronizer._loadBubbleImplementationConfig = jest.fn().mockResolvedValue({
                bubbles: {
                    normal: { score: 15 },
                    boss: { health: 8, size: 90 }
                }
            });

            synchronizer._loadTestExpectationConfig = jest.fn().mockResolvedValue({
                bubbles: {
                    normal: { score: 10 },
                    boss: { health: 5, size: 100 }
                }
            });

            synchronizer._loadConfigurationManagerConfig = jest.fn().mockResolvedValue({
                bubbles: {
                    normal: { score: 15 },
                    boss: { health: 8, size: 90 }
                }
            });

            const result = await synchronizer.validateConsistency();

            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('sourceCount', 4);
            expect(result).toHaveProperty('discrepancyCount');
            expect(result).toHaveProperty('discrepancies');
            expect(result).toHaveProperty('sourceConfigs');
            expect(result).toHaveProperty('recommendations');
            expect(Array.isArray(result.discrepancies)).toBe(true);
        });

        test('should handle source loading errors gracefully', async () => {
            // エラーを発生させるモック
            synchronizer._loadGameBalanceConfig = jest.fn().mockRejectedValue(new Error('Load failed'));
            synchronizer._loadBubbleImplementationConfig = jest.fn().mockResolvedValue({});
            synchronizer._loadTestExpectationConfig = jest.fn().mockResolvedValue({});
            synchronizer._loadConfigurationManagerConfig = jest.fn().mockResolvedValue({});

            const result = await synchronizer.validateConsistency();

            expect(result.sourceCount).toBe(4);
            expect(mockErrorHandler.handleError).toHaveBeenCalled();
        });
    });

    describe('_detectBubbleConfigDiscrepancies', () => {
        test('should detect score inconsistencies', () => {
            const sourceConfigs = new Map([
                ['testExpectations', {
                    config: {
                        bubbles: {
                            normal: { score: 10 }
                        }
                    },
                    source: { name: 'Test', priority: 1 }
                }],
                ['bubbleImplementation', {
                    config: {
                        bubbles: {
                            normal: { score: 15 }
                        }
                    },
                    source: { name: 'Implementation', priority: 3 }
                }]
            ]);

            const discrepancies = synchronizer._detectBubbleConfigDiscrepancies(sourceConfigs);

            expect(discrepancies.length).toBeGreaterThan(0);
            const scoreDiscrepancy = discrepancies.find(d => d.type === 'BUBBLE_SCORE_INCONSISTENCY');
            expect(scoreDiscrepancy).toBeTruthy();
            expect(scoreDiscrepancy.bubbleType).toBe('normal');
            expect(scoreDiscrepancy.key).toBe('bubbles.normal.score');
        });

        test('should detect health inconsistencies', () => {
            const sourceConfigs = new Map([
                ['testExpectations', {
                    config: {
                        bubbles: {
                            boss: { health: 5 }
                        }
                    },
                    source: { name: 'Test', priority: 1 }
                }],
                ['bubbleImplementation', {
                    config: {
                        bubbles: {
                            boss: { health: 8 }
                        }
                    },
                    source: { name: 'Implementation', priority: 3 }
                }]
            ]);

            const discrepancies = synchronizer._detectBubbleConfigDiscrepancies(sourceConfigs);

            const healthDiscrepancy = discrepancies.find(d => d.type === 'BUBBLE_HEALTH_INCONSISTENCY');
            expect(healthDiscrepancy).toBeTruthy();
            expect(healthDiscrepancy.bubbleType).toBe('boss');
            expect(healthDiscrepancy.key).toBe('bubbles.boss.health');
        });
    });

    describe('_detectEffectConfigDiscrepancies', () => {
        test('should detect electric bubble effect inconsistencies', () => {
            const sourceConfigs = new Map([
                ['testExpectations', {
                    config: {
                        bubbles: {
                            electric: { shakeIntensity: 20, disableDuration: 2000 }
                        }
                    },
                    source: { name: 'Test', priority: 1 }
                }],
                ['bubbleImplementation', {
                    config: {
                        bubbles: {
                            electric: { shakeIntensity: 15, disableDuration: 1500 }
                        }
                    },
                    source: { name: 'Implementation', priority: 3 }
                }]
            ]);

            const discrepancies = synchronizer._detectEffectConfigDiscrepancies(sourceConfigs);

            expect(discrepancies.length).toBe(2);
            
            const intensityDiscrepancy = discrepancies.find(d => d.type === 'ELECTRIC_INTENSITY_INCONSISTENCY');
            expect(intensityDiscrepancy).toBeTruthy();
            expect(intensityDiscrepancy.key).toBe('bubbles.electric.shakeIntensity');

            const durationDiscrepancy = discrepancies.find(d => d.type === 'ELECTRIC_DURATION_INCONSISTENCY');
            expect(durationDiscrepancy).toBeTruthy();
            expect(durationDiscrepancy.key).toBe('bubbles.electric.disableDuration');
        });

        test('should detect rainbow bubble duration inconsistency', () => {
            const sourceConfigs = new Map([
                ['testExpectations', {
                    config: {
                        bubbles: {
                            rainbow: { bonusTimeMs: 5000 }
                        }
                    },
                    source: { name: 'Test', priority: 1 }
                }],
                ['bubbleImplementation', {
                    config: {
                        bubbles: {
                            rainbow: { bonusTimeMs: 8000 }
                        }
                    },
                    source: { name: 'Implementation', priority: 3 }
                }]
            ]);

            const discrepancies = synchronizer._detectEffectConfigDiscrepancies(sourceConfigs);

            const rainbowDiscrepancy = discrepancies.find(d => d.type === 'RAINBOW_DURATION_INCONSISTENCY');
            expect(rainbowDiscrepancy).toBeTruthy();
            expect(rainbowDiscrepancy.key).toBe('bubbles.rainbow.bonusTimeMs');
        });
    });

    describe('_calculateSeverity', () => {
        test('should return HIGH for large variance', () => {
            const values = new Map([
                ['source1', 10],
                ['source2', 20] // 100% variance
            ]);

            const severity = synchronizer._calculateSeverity(values);
            expect(severity).toBe('HIGH');
        });

        test('should return MEDIUM for moderate variance', () => {
            const values = new Map([
                ['source1', 10],
                ['source2', 13] // 30% variance
            ]);

            const severity = synchronizer._calculateSeverity(values);
            expect(severity).toBe('MEDIUM');
        });

        test('should return LOW for small variance', () => {
            const values = new Map([
                ['source1', 10],
                ['source2', 11] // 10% variance
            ]);

            const severity = synchronizer._calculateSeverity(values);
            expect(severity).toBe('LOW');
        });
    });

    describe('_generateRecommendations', () => {
        test('should generate sync recommendations for bubble score inconsistency', () => {
            const discrepancies = [{
                type: 'BUBBLE_SCORE_INCONSISTENCY',
                bubbleType: 'normal',
                key: 'bubbles.normal.score',
                values: [
                    { value: 10, source: 'Test', priority: 1 },
                    { value: 15, source: 'Implementation', priority: 3 }
                ],
                severity: 'HIGH'
            }];

            const recommendations = synchronizer._generateRecommendations(discrepancies);

            expect(recommendations).toHaveLength(1);
            expect(recommendations[0].action).toBe('SYNC_TO_IMPLEMENTATION');
            expect(recommendations[0].targetValue).toBe(15);
            expect(recommendations[0].priority).toBe('HIGH');
            expect(recommendations[0].affectedFiles).toContain('tests/unit/Bubble.test.js');
        });
    });

    describe('generateSyncReport', () => {
        test('should generate comprehensive sync report', () => {
            synchronizer.discrepancies = [
                { type: 'TEST_DISCREPANCY', severity: 'HIGH' }
            ];
            synchronizer.syncHistory = [
                { timestamp: Date.now(), action: 'sync' }
            ];

            const report = synchronizer.generateSyncReport();

            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('discrepancyCount', 1);
            expect(report).toHaveProperty('discrepancies');
            expect(report).toHaveProperty('syncHistory');
            expect(report).toHaveProperty('sources');
            expect(report).toHaveProperty('status', 'INCONSISTENT');
        });

        test('should report SYNCHRONIZED status when no discrepancies', () => {
            synchronizer.discrepancies = [];

            const report = synchronizer.generateSyncReport();

            expect(report.status).toBe('SYNCHRONIZED');
            expect(report.discrepancyCount).toBe(0);
        });
    });

    describe('Singleton pattern', () => {
        test('should return same instance for getConfigurationSynchronizer', () => {
            const instance1 = getConfigurationSynchronizer();
            const instance2 = getConfigurationSynchronizer();

            expect(instance1).toBe(instance2);
        });
    });

    describe('Value extraction methods', () => {
        test('should extract bubble score values correctly', () => {
            const sourceConfigs = new Map([
                ['source1', {
                    config: {
                        bubbles: {
                            normal: { score: 10 }
                        }
                    },
                    source: { name: 'Source1', priority: 1 }
                }],
                ['source2', {
                    config: {
                        bubbles: {
                            normal: { score: 15 }
                        }
                    },
                    source: { name: 'Source2', priority: 2 }
                }]
            ]);

            const values = synchronizer._extractBubbleScoreValues(sourceConfigs, 'normal');

            expect(values.size).toBe(2);
            expect(values.get('source1').value).toBe(10);
            expect(values.get('source2').value).toBe(15);
        });

        test('should extract electric intensity values correctly', () => {
            const sourceConfigs = new Map([
                ['source1', {
                    config: {
                        bubbles: {
                            electric: { shakeIntensity: 20 }
                        }
                    },
                    source: { name: 'Source1', priority: 1 }
                }]
            ]);

            const values = synchronizer._extractElectricIntensityValues(sourceConfigs);

            expect(values.size).toBe(1);
            expect(values.get('source1').value).toBe(20);
        });
    });
});