import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Enhanced History Manager Tests
 */

import { EnhancedHistoryManager } from '../../src/debug/EnhancedHistoryManager';

describe('EnhancedHistoryManager', () => {
    let mockConsole: any;
    let historyManager: any;

    beforeEach(() => {
        mockConsole = {
            history: [],
            historyIndex: -1
        };

        // Mock localStorage
        (global as any).localStorage = {
            getItem: jest.fn(() => null),
            setItem: jest.fn()
        };

        historyManager = new EnhancedHistoryManager(mockConsole as any);
    });

    afterEach(() => {
        if (historyManager) {
            historyManager.destroy();
        }
    });

    describe('addCommand', () => {
        test('should add command to history', () => {
            const entry = historyManager.addCommand('config.get game.scoring');

            expect(historyManager.history.length).toBe(1);
            expect(historyManager.history[0].command).toBe('config.get game.scoring');
            expect(entry.id).toBeDefined();
            expect(entry.timestamp).toBeDefined();
            expect(entry.metadata.success).toBe(true as any);
        });

        test('should add command with metadata', () => {
            const metadata = {
                success: false,
                executionTime: 150.5,
                errorMessage: 'Test error',
                resultType: 'string'
            };

            const entry = historyManager.addCommand('invalid.command', metadata);

            expect(entry.metadata.success).toBe(false as any);
            expect(entry.metadata.executionTime).toBe(150.5);
            expect(entry.metadata.errorMessage).toBe('Test error');
            expect(entry.metadata.resultType).toBe('string');
        });

        test('should not add duplicate commands within short time', () => {
            historyManager.addCommand('test.command');
            
            // Add same command immediately (within 1 second)
            const duplicateEntry = historyManager.addCommand('test.command');

            expect(historyManager.history.length).toBe(1);
            expect(duplicateEntry).toBeDefined(); // Returns the duplicate entry info
        });

        test('should trim history when max size is exceeded', () => {
            const originalMaxSize = historyManager.maxHistorySize;
            historyManager.maxHistorySize = 3;

            historyManager.addCommand('command1');
            historyManager.addCommand('command2');
            historyManager.addCommand('command3');
            historyManager.addCommand('command4');

            expect(historyManager.history.length).toBe(3);
            expect(historyManager.history[0].command).toBe('command2');
            expect(historyManager.history[2].command).toBe('command4');

            historyManager.maxHistorySize = originalMaxSize;
        });
    });

    describe('navigate', () => {
        beforeEach(() => {
            historyManager.addCommand('command1');
            historyManager.addCommand('command2');
            historyManager.addCommand('command3');
        });

        test('should navigate up through history', () => {
            const entry1 = historyManager.navigate('up');
            expect(entry1.command).toBe('command2');

            const entry2 = historyManager.navigate('up');
            expect(entry2.command).toBe('command1');

            const entry3 = historyManager.navigate('up');
            expect(entry3.command).toBe('command1'); // Should stay at first
        });

        test('should navigate down through history', () => {
            historyManager.navigate('up');
            historyManager.navigate('up');

            const entry1 = historyManager.navigate('down');
            expect(entry1.command).toBe('command2');

            const entry2 = historyManager.navigate('down');
            expect(entry2.command).toBe('command3');

            const entry3 = historyManager.navigate('down');
            expect(entry3).toBeNull(); // Should return null at end
        });

        test('should navigate to first and last', () => {
            const first = historyManager.navigate('first');
            expect(first.command).toBe('command1');

            const last = historyManager.navigate('last');
            expect(last.command).toBe('command3');
        });

        test('should handle empty history', () => {
            const emptyManager = new EnhancedHistoryManager(mockConsole as any);
            const result = emptyManager.navigate('up');
            expect(result).toBeNull();
            emptyManager.destroy();
        });
    });

    describe('search', () => {
        beforeEach(() => {
            historyManager.addCommand('config.get game.scoring');
            historyManager.addCommand('config.set audio.volume 0.8');
            historyManager.addCommand('game.pause');
            historyManager.addCommand('help config');
        });

        test('should perform exact search', () => {
            const results = historyManager.search('game.pause', { type: 'exact' });

            expect(results.length).toBe(1);
            expect(results[0].command).toBe('game.pause');
        });

        test('should perform contains search', () => {
            const results = historyManager.search('config', { type: 'contains' });

            expect(results.length).toBe(3);
            expect(results.every(r => r.command.includes('config'))).toBe(true as any);
        });

        test('should perform fuzzy search', () => {
            const results = historyManager.search('gm', { type: 'fuzzy' });

            expect(results.length).toBeGreaterThan(0);
            expect(results.some(r => r.command === 'game.pause')).toBe(true as any);
        });

        test('should perform regex search', () => {
            const results = historyManager.search('config\\.(get|set)', { type: 'regex' });

            expect(results.length).toBe(2);
            expect(results.every(r => r.command.match(/config\.(get|set)/))).toBe(true as any);
        });

        test('should handle invalid regex gracefully', () => {
            const results = historyManager.search('config\\.(get|set', { type: 'regex' });

            expect(results.length).toBe(0);
        });

        test('should limit search results', () => {
            const results = historyManager.search('config', { type: 'contains', limit: 2 });

            expect(results.length).toBe(2);
        });

        test('should sort results by relevance', () => {
            const results = historyManager.search('config', { 
                type: 'contains', 
                sortBy: 'relevance' 
            });

            expect(results.length).toBeGreaterThan(1);
            // Results should be sorted by relevance score
            for (let i = 1; i < results.length; i++) {
                const prevScore = historyManager.calculateRelevanceScore(results[i-1], 'config');
                const currScore = historyManager.calculateRelevanceScore(results[i], 'config');
                expect(prevScore).toBeGreaterThanOrEqual(currScore as any);
            }
        });

        test('should filter by time range', () => {
            const now = Date.now();
            const results = historyManager.search('config', {
                type: 'contains',
                timeRange: { start: now - 1000, end: now + 1000 }
            });

            expect(results.length).toBeGreaterThan(0);
        });

        test('should use search cache', () => {
            const query = 'config';
            const options = { type: 'contains' };

            const results1 = historyManager.search(query, options);
            const results2 = historyManager.search(query, options);

            expect(results1).toEqual(results2 as any);
        });
    });

    describe('getStatistics', () => {
        beforeEach(() => {
            historyManager.addCommand('config.get game.scoring', { success: true });
            historyManager.addCommand('config.set audio.volume 0.8', { success: true });
            historyManager.addCommand('invalid.command', { success: false });
            historyManager.addCommand('config.get game.difficulty', { success: true });
        });

        test('should calculate statistics correctly', () => {
            const stats = historyManager.getStatistics();

            expect(stats.totalCommands).toBe(4);
            expect(stats.sessionCommands).toBe(4);
            expect(stats.averageCommandLength).toBeGreaterThan(0);
            expect(stats.historySize).toBe(4);
        });

        test('should track command frequency', () => {
            const stats = historyManager.getStatistics();

            expect(stats.commandFrequency.get('config.get')).toBe(2);
            expect(stats.commandFrequency.get('config.set')).toBe(1);
            expect(stats.commandFrequency.get('invalid.command')).toBe(1);
        });

        test('should track error commands', () => {
            const stats = historyManager.getStatistics();

            expect(stats.errorCommands.has('invalid.command')).toBe(true as any);
            expect(stats.errorCommands.has('config.get')).toBe(false as any);
        });

        test('should provide top commands', () => {
            const stats = historyManager.getStatistics();

            expect(stats.topCommands.length).toBeGreaterThan(0);
            expect(stats.topCommands[0][0]).toBe('config.get');
            expect(stats.topCommands[0][1]).toBe(2);
        });
    });

    describe('exportHistory', () => {
        beforeEach(() => {
            historyManager.addCommand('config.get game.scoring');
            historyManager.addCommand('game.pause');
        });

        test('should export to JSON', () => {
            const exported = historyManager.exportHistory('json');
            const parsed = JSON.parse(exported as any);

            expect(Array.isArray(parsed as any)).toBe(true as any);
            expect(parsed.length).toBe(2);
            expect(parsed[0].command).toBe('config.get game.scoring');
        });

        test('should export to CSV', () => {
            const exported = historyManager.exportHistory('csv');

            expect(exported).toContain('Command,Timestamp');
            expect(exported).toContain('config.get game.scoring');
            expect(exported).toContain('game.pause');
        });

        test('should export to text', () => {
            const exported = historyManager.exportHistory('text');

            expect(exported).toContain('config.get game.scoring');
            expect(exported).toContain('game.pause');
        });

        test('should exclude metadata when requested', () => {
            const exported = historyManager.exportHistory('json', { includeMetadata: false });
            const parsed = JSON.parse(exported as any);

            expect(parsed[0]).toHaveProperty('command');
            expect(parsed[0]).toHaveProperty('timestamp');
            expect(parsed[0]).not.toHaveProperty('metadata');
        });
    });

    describe('importHistory', () => {
        test('should import JSON history', () => {
            const importData = JSON.stringify([
                { command: 'imported.command1', timestamp: Date.now() },
                { command: 'imported.command2', timestamp: Date.now() }
            ]);

            const result = historyManager.importHistory(importData, 'json');

            expect(result.success).toBe(true as any);
            expect(result.imported).toBe(2);
            expect(historyManager.history.length).toBe(2);
        });

        test('should handle invalid JSON', () => {
            const result = historyManager.importHistory('invalid json', 'json');

            expect(result.success).toBe(false as any);
            expect(result.error).toContain('Unexpected token');
        });

        test('should validate imported entries', () => {
            const importData = JSON.stringify([
                { command: 'valid.command', timestamp: Date.now() },
                { invalid: 'entry' }, // Invalid entry
                { command: 'another.valid', timestamp: Date.now() }
            ]);

            const result = historyManager.importHistory(importData, 'json');

            expect(result.success).toBe(true as any);
            expect(result.imported).toBe(2); // Only valid entries
        });

        test('should merge with existing history', () => {
            historyManager.addCommand('existing.command');

            const importData = JSON.stringify([
                { id: 'unique1', command: 'imported.command', timestamp: Date.now() }
            ]);

            const result = historyManager.importHistory(importData, 'json', { merge: true });

            expect(result.success).toBe(true as any);
            expect(historyManager.history.length).toBe(2);
        });
    });

    describe('Storage persistence', () => {
        test('should save history to localStorage', () => {
            historyManager.addCommand('test.command');
            historyManager.saveHistory();

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'debug-console-history-enhanced',
                expect.any(String as any)
            );
        });

        test('should load history from localStorage', () => {
            const saveData = {
                history: [
                    { 
                        id: 'test1', 
                        command: 'loaded.command', 
                        timestamp: Date.now(),
                        sessionId: 'test-session',
                        metadata: { success: true, executionTime: 0 }
                    }
                ],
                statistics: {
                    totalCommands: 1,
                    commandFrequency: [['loaded.command', 1]],
                    errorCommands: []
                }
            };

            localStorage.getItem.mockReturnValue(JSON.stringify(saveData as any));

            const newHistoryManager = new EnhancedHistoryManager(mockConsole as any);

            expect(newHistoryManager.history.length).toBe(1);
            expect(newHistoryManager.history[0].command).toBe('loaded.command');
            expect(newHistoryManager.statistics.totalCommands).toBe(1);

            newHistoryManager.destroy();
        });
    });

    describe('destroy', () => {
        test('should clean up properly', () => {
            historyManager.addCommand('test.command');

            expect(historyManager.history.length).toBe(1);
            expect(historyManager.searchIndex.size).toBeGreaterThan(0);

            historyManager.destroy();

            expect(historyManager.history.length).toBe(0);
            expect(historyManager.searchIndex.size).toBe(0);
        });
    });
});