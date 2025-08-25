/**
 * Unit tests for ConfigurationSynchronizer
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ConfigurationSynchronizer, getConfigurationSynchronizer } from '../../src/utils/ConfigurationSynchronizer.js';

// Configuration interfaces
interface BubbleConfig {
    score?: number;
    health?: number;
    size?: number;
    shakeIntensity?: number;
    disableDuration?: number;
    bonusTimeMs?: number;
}

interface ConfigMap {
    bubbles: {
        [bubbleType: string]: BubbleConfig;
    };
}

interface SourceInfo { 
    name: string; 
    priority: number; 
}

interface SourceConfig { 
    config: ConfigMap; 
    source: SourceInfo; 
}

interface Discrepancy {
    type: string;
    bubbleType?: string;
    key: string;
    values: Array<{
        value: any;
        source: string;
        priority: number;
    }>;
    severity: string;
}

interface Recommendation {
    type: string;
    description: string;
    action?: string;
}

interface ValidationResult {
    timestamp: Date;
    sourceCount: number;
    discrepancyCount: number;
    discrepancies: Discrepancy[];
    sourceConfigs: Map<string, SourceConfig>;
    recommendations: Recommendation[];
}

interface SynchronizationOptions {
    prioritizeHigherSource?: boolean;
    resolveConflicts?: boolean;
    backupConfig?: boolean;
    validateAfterSync?: boolean;
}

interface SynchronizationReport {
    success: boolean;
    changedKeys: string[];
    errors: string[];
    backupCreated?: boolean;
    validationPassed?: boolean;
}

// Mock classes
class MockConfigurationManager {
    private config: ConfigMap = {
        bubbles: {
            normal: { score: 10, health: 1, size: 50 },
            stone: { score: 20, health: 2, size: 55 },
            boss: { score: 100, health: 5, size: 80 }
        }
    };

    get(category: string, key?: string, defaultValue?: any): any {
        if (key) {
            const path = `${category}.${key}`.split('.');
            let value = this.config as any;
            for (const part of path) {
                value = value?.[part];
            }
            return value !== undefined ? value : defaultValue;
        }
        return (this.config as any)[category] || defaultValue;
    }

    set(category: string, key: string, value: any): boolean {
        try {
            const path = `${category}.${key}`.split('.');
            let target = this.config as any;
            for (let i = 0; i < path.length - 1; i++) {
                if (!target[path[i]]) target[path[i]] = {};
                target = target[path[i]];
            }
            target[path[path.length - 1]] = value;
            return true;
        } catch {
            return false;
        }
    }

    getAll(): ConfigMap {
        return JSON.parse(JSON.stringify(this.config));
    }

    save(): boolean {
        return true;
    }

    backup(name?: string): boolean {
        return true;
    }
}

describe('ConfigurationSynchronizer', () => {
    let synchronizer: ConfigurationSynchronizer;
    let mockConfigManager: MockConfigurationManager;

    beforeEach(() => {
        mockConfigManager = new MockConfigurationManager();
        synchronizer = new ConfigurationSynchronizer(mockConfigManager as any);
    });

    describe('Initialization', () => {
        test('should create instance with default configuration', () => {
            expect(synchronizer).toBeDefined();
            expect(synchronizer).toBeInstanceOf(ConfigurationSynchronizer);
        });

        test('should initialize with configuration manager', () => {
            const configManager = synchronizer.getConfigurationManager();
            expect(configManager).toBeDefined();
        });
    });

    describe('Configuration Source Registration', () => {
        test('should register configuration source', () => {
            const sourceConfig: SourceConfig = {
                config: {
                    bubbles: {
                        normal: { score: 15, health: 1, size: 50 }
                    }
                },
                source: { name: 'test-source', priority: 1 }
            };

            const result = synchronizer.registerConfigurationSource(sourceConfig);
            expect(result).toBe(true);

            const sources = synchronizer.getRegisteredSources();
            expect(sources.length).toBe(1);
            expect(sources[0].source.name).toBe('test-source');
        });

        test('should handle multiple configuration sources', () => {
            const sourceConfig1: SourceConfig = {
                config: { bubbles: { normal: { score: 15 } } },
                source: { name: 'source-1', priority: 1 }
            };

            const sourceConfig2: SourceConfig = {
                config: { bubbles: { stone: { score: 25 } } },
                source: { name: 'source-2', priority: 2 }
            };

            synchronizer.registerConfigurationSource(sourceConfig1);
            synchronizer.registerConfigurationSource(sourceConfig2);

            const sources = synchronizer.getRegisteredSources();
            expect(sources.length).toBe(2);
        });

        test('should prioritize sources by priority value', () => {
            const lowPrioritySource: SourceConfig = {
                config: { bubbles: { normal: { score: 10 } } },
                source: { name: 'low-priority', priority: 1 }
            };

            const highPrioritySource: SourceConfig = {
                config: { bubbles: { normal: { score: 20 } } },
                source: { name: 'high-priority', priority: 10 }
            };

            synchronizer.registerConfigurationSource(lowPrioritySource);
            synchronizer.registerConfigurationSource(highPrioritySource);

            const sortedSources = synchronizer.getRegisteredSources();
            expect(sortedSources[0].source.name).toBe('high-priority');
            expect(sortedSources[1].source.name).toBe('low-priority');
        });
    });

    describe('Configuration Validation', () => {
        test('should validate configuration consistency', () => {
            const sourceConfig1: SourceConfig = {
                config: { bubbles: { normal: { score: 15, health: 1 } } },
                source: { name: 'source-1', priority: 1 }
            };

            const sourceConfig2: SourceConfig = {
                config: { bubbles: { normal: { score: 20, health: 1 } } },
                source: { name: 'source-2', priority: 2 }
            };

            synchronizer.registerConfigurationSource(sourceConfig1);
            synchronizer.registerConfigurationSource(sourceConfig2);

            const validation = synchronizer.validateConfiguration();
            expect(validation.success).toBeDefined();
            expect(validation.discrepancies).toBeDefined();
        });

        test('should detect configuration discrepancies', () => {
            const conflictingSource1: SourceConfig = {
                config: { bubbles: { normal: { score: 10 } } },
                source: { name: 'source-1', priority: 1 }
            };

            const conflictingSource2: SourceConfig = {
                config: { bubbles: { normal: { score: 50 } } },
                source: { name: 'source-2', priority: 1 }
            };

            synchronizer.registerConfigurationSource(conflictingSource1);
            synchronizer.registerConfigurationSource(conflictingSource2);

            const validation = synchronizer.validateConfiguration();
            expect(validation.discrepancies.length).toBeGreaterThan(0);
        });

        test('should generate recommendations for resolution', () => {
            const problematicSource: SourceConfig = {
                config: { bubbles: { invalid: { score: -1 } } },
                source: { name: 'problematic-source', priority: 1 }
            };

            synchronizer.registerConfigurationSource(problematicSource);

            const validation = synchronizer.validateConfiguration();
            expect(validation.recommendations).toBeDefined();
            expect(Array.isArray(validation.recommendations)).toBe(true);
        });
    });

    describe('Configuration Synchronization', () => {
        test('should synchronize configurations with default options', () => {
            const sourceConfig: SourceConfig = {
                config: { bubbles: { normal: { score: 25 } } },
                source: { name: 'sync-source', priority: 5 }
            };

            synchronizer.registerConfigurationSource(sourceConfig);

            const report = synchronizer.synchronizeConfiguration();
            expect(report.success).toBe(true);
            expect(report.changedKeys).toBeDefined();
        });

        test('should synchronize with custom options', () => {
            const sourceConfig: SourceConfig = {
                config: { bubbles: { stone: { health: 3 } } },
                source: { name: 'custom-sync', priority: 3 }
            };

            const options: SynchronizationOptions = {
                prioritizeHigherSource: true,
                resolveConflicts: true,
                backupConfig: true,
                validateAfterSync: true
            };

            synchronizer.registerConfigurationSource(sourceConfig);

            const report = synchronizer.synchronizeConfiguration(options);
            expect(report.success).toBe(true);
            expect(report.backupCreated).toBe(true);
            expect(report.validationPassed).toBeDefined();
        });

        test('should handle synchronization errors gracefully', () => {
            // Simulate error by providing invalid configuration
            const invalidSource: SourceConfig = {
                config: null as any,
                source: { name: 'invalid-source', priority: 1 }
            };

            synchronizer.registerConfigurationSource(invalidSource);

            const report = synchronizer.synchronizeConfiguration();
            expect(report.success).toBe(false);
            expect(report.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Configuration Backup and Restore', () => {
        test('should create configuration backup', () => {
            const backupResult = synchronizer.createBackup('test-backup');
            expect(backupResult).toBe(true);
        });

        test('should restore configuration from backup', () => {
            // Create a backup first
            synchronizer.createBackup('restore-test');

            // Make some changes
            const sourceConfig: SourceConfig = {
                config: { bubbles: { normal: { score: 999 } } },
                source: { name: 'change-source', priority: 1 }
            };
            synchronizer.registerConfigurationSource(sourceConfig);
            synchronizer.synchronizeConfiguration();

            // Restore from backup
            const restoreResult = synchronizer.restoreFromBackup('restore-test');
            expect(restoreResult).toBe(true);
        });

        test('should list available backups', () => {
            synchronizer.createBackup('backup-1');
            synchronizer.createBackup('backup-2');

            const backups = synchronizer.listBackups();
            expect(Array.isArray(backups)).toBe(true);
            expect(backups.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Configuration Export and Import', () => {
        test('should export configuration to JSON', () => {
            const exportResult = synchronizer.exportConfiguration();
            expect(exportResult).toBeDefined();
            expect(typeof exportResult).toBe('string');

            // Should be valid JSON
            expect(() => JSON.parse(exportResult)).not.toThrow();
        });

        test('should import configuration from JSON', () => {
            const originalConfig = synchronizer.exportConfiguration();
            
            // Modify configuration
            const sourceConfig: SourceConfig = {
                config: { bubbles: { normal: { score: 777 } } },
                source: { name: 'import-test', priority: 1 }
            };
            synchronizer.registerConfigurationSource(sourceConfig);
            synchronizer.synchronizeConfiguration();

            // Import original configuration
            const importResult = synchronizer.importConfiguration(originalConfig);
            expect(importResult).toBe(true);
        });

        test('should handle invalid JSON during import', () => {
            const invalidJson = '{ invalid json }';
            const importResult = synchronizer.importConfiguration(invalidJson);
            expect(importResult).toBe(false);
        });
    });

    describe('Performance and Statistics', () => {
        test('should collect synchronization statistics', () => {
            const sourceConfig: SourceConfig = {
                config: { bubbles: { normal: { score: 15 } } },
                source: { name: 'stats-test', priority: 1 }
            };

            synchronizer.registerConfigurationSource(sourceConfig);
            synchronizer.synchronizeConfiguration();

            const stats = synchronizer.getStatistics();
            expect(stats.totalSynchronizations).toBeGreaterThan(0);
            expect(stats.lastSynchronizationTime).toBeDefined();
        });

        test('should reset statistics', () => {
            // Perform some operations
            synchronizer.synchronizeConfiguration();
            synchronizer.validateConfiguration();

            // Reset statistics
            synchronizer.resetStatistics();

            const stats = synchronizer.getStatistics();
            expect(stats.totalSynchronizations).toBe(0);
            expect(stats.totalValidations).toBe(0);
        });

        test('should measure synchronization performance', () => {
            const startTime = performance.now();

            // Perform multiple synchronizations
            for (let i = 0; i < 10; i++) {
                const sourceConfig: SourceConfig = {
                    config: { bubbles: { [`test-${i}`]: { score: i } } },
                    source: { name: `perf-test-${i}`, priority: i }
                };
                synchronizer.registerConfigurationSource(sourceConfig);
            }

            synchronizer.synchronizeConfiguration();

            const endTime = performance.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe('Global Function', () => {
        test('getConfigurationSynchronizer should return valid instance', () => {
            const globalSynchronizer = getConfigurationSynchronizer();
            expect(globalSynchronizer).toBeDefined();
            expect(globalSynchronizer).toBeInstanceOf(ConfigurationSynchronizer);
        });
    });
});