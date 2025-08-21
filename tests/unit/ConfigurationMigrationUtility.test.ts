/**
 * Unit tests for ConfigurationMigrationUtility
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ConfigurationMigrationUtility, getConfigurationMigrationUtility } from '../../src/utils/ConfigurationMigrationUtility.js';
// Configuration interfaces
interface BubbleConfig {
    health: number;
    size: number;
    maxAge: number;
    color: string;
    score: number;
    healAmount?: number;
interface SpecialEffects {
    healAmount?: number;
    [key: string]: any;
interface MigrationStats {
    totalMigrations: number;
    successfulMigrations: number;
    failedMigrations: number;
    successRate: string;
    totalMigratedTypes: number;
    lastMigration: Date | null }
interface MigrationHistoryItem {
    timestamp: Date;
    action: string;
    success: boolean;
    details?: any;
describe('ConfigurationMigrationUtility', () => {
    let migrationUtility: ConfigurationMigrationUtility;
    beforeEach(() => {
        migrationUtility = new ConfigurationMigrationUtility() }');'
    describe('Constructor', (') => {'
        test('should initialize with correct properties', () => {
            expect(migrationUtility.configManager).toBeDefined();
            expect(migrationUtility.errorHandler).toBeDefined();
            expect(migrationUtility.migrationHistory).toEqual([]) }');'
    }
    describe('_getHardcodedBubbleConfig', (') => {'
        test('should return correct config for normal bubble', (') => {'
            const config: BubbleConfig | null = migrationUtility._getHardcodedBubbleConfig('normal';
            expect(config').toEqual({'
                health: 1;
                size: 50;
                maxAge: 12000;
                color: '#87CEEB';
                score: 15 }');'
        }
        test('should return correct config for boss bubble', (') => {'
            const config: BubbleConfig | null = migrationUtility._getHardcodedBubbleConfig('boss';
            expect(config').toEqual({'
                health: 8;
                size: 90;
                maxAge: 35000;
                color: '#8B0000';
                score: 800 }');'
        }
        test('should return null for unknown bubble type', (') => {'
            const config: BubbleConfig | null = migrationUtility._getHardcodedBubbleConfig('unknown';
            expect(config).toBeNull() }');'
    }
    describe('_extractSpecialEffects', (') => {'
        test('should extract special effects from pink bubble config', (') => {'
            const config: BubbleConfig = {
                health: 1;
                size: 45;
                maxAge: 10000;
                color: '#FFB6C1';
                score: 25;
                healAmount: 25
            };
            const effects: SpecialEffects = migrationUtility._extractSpecialEffects('pink', config);
            expect(effects).toEqual({
                healAmount: 25)') }'
        test('should return empty object for basic bubble with no special effects', (') => {'
            const config: BubbleConfig = {
                health: 1;
                size: 50;
                maxAge: 12000;
                color: '#87CEEB';
                score: 15
            };
            const effects: SpecialEffects = migrationUtility._extractSpecialEffects('normal', config);
            expect(effects).toEqual({) }
    }');'
    describe('Statistics and history', (') => {'
        test('should return empty migration history initially', () => {
            const history: MigrationHistoryItem[] = migrationUtility.getMigrationHistory(
            expect(history).toEqual([]) }');'
        test('should calculate initial migration statistics', () => {
            const stats: MigrationStats = migrationUtility.getMigrationStats(
            expect(stats.totalMigrations).toBe(0);
            expect(stats.successfulMigrations).toBe(0);
            expect(stats.failedMigrations).toBe(0);
            expect(stats.successRate').toBe('0%'),'
            expect(stats.totalMigratedTypes).toBe(0);
            expect(stats.lastMigration).toBeNull() }');'
    }
    describe('Singleton pattern', (') => {'
        test('should return same instance for getConfigurationMigrationUtility', () => {
            const instance1 = getConfigurationMigrationUtility();
            const instance2 = getConfigurationMigrationUtility();
            expect(instance1).toBe(instance2) };
    }
}');'