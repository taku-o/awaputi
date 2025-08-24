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
            expect(entry.metadata.success).toBe(true);
        });

        test('should add command with metadata', () => {
            const metadata = {
                success: false,
                executionTime: 150.5,
                errorMessage: 'Test error',
                resultType: 'string'
            };
            const entry = historyManager.addCommand('invalid.command', metadata);
            expect(entry.metadata.success).toBe(false);
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

        test('should find exact matches', () => {
            const results = historyManager.search('game.pause');
            expect(results.length).toBe(1);
            expect(results[0].command).toBe('game.pause');
        });

        test('should find partial matches', () => {
            const results = historyManager.search('config');
            expect(results.length).toBe(3);
            expect(results.some((r: any) => r.command === 'config.get game.scoring')).toBe(true);
            expect(results.some((r: any) => r.command === 'config.set audio.volume 0.8')).toBe(true);
            expect(results.some((r: any) => r.command === 'help config')).toBe(true);
        });

        test('should return results in chronological order', () => {
            const results = historyManager.search('config');
            expect(results[0].command).toBe('config.get game.scoring');
            expect(results[1].command).toBe('config.set audio.volume 0.8');
            expect(results[2].command).toBe('help config');
        });

        test('should handle regex search', () => {
            const results = historyManager.search(/config\.(get|set)/);
            expect(results.length).toBe(2);
            expect(results[0].command).toBe('config.get game.scoring');
            expect(results[1].command).toBe('config.set audio.volume 0.8');
        });

        test('should handle case insensitive search', () => {
            const results = historyManager.search('CONFIG', { caseSensitive: false });
            expect(results.length).toBe(3);
        });

        test('should limit search results', () => {
            const results = historyManager.search('config', { limit: 2 });
            expect(results.length).toBe(2);
        });

        test('should return empty array for no matches', () => {
            const results = historyManager.search('nonexistent');
            expect(results).toEqual([]);
        });
    });

    describe('getStatistics', () => {
        beforeEach(() => {
            historyManager.addCommand('config.get game.scoring', { success: true, executionTime: 10 });
            historyManager.addCommand('invalid.command', { success: false, executionTime: 5 });
            historyManager.addCommand('config.set audio.volume 0.8', { success: true, executionTime: 15 });
            historyManager.addCommand('game.pause', { success: true, executionTime: 2 });
        });

        test('should calculate basic statistics', () => {
            const stats = historyManager.getStatistics();
            expect(stats.totalCommands).toBe(4);
            expect(stats.successfulCommands).toBe(3);
            expect(stats.failedCommands).toBe(1);
            expect(stats.successRate).toBe(0.75);
        });

        test('should calculate execution time statistics', () => {
            const stats = historyManager.getStatistics();
            expect(stats.averageExecutionTime).toBe(8); // (10+5+15+2)/4
            expect(stats.minExecutionTime).toBe(2);
            expect(stats.maxExecutionTime).toBe(15);
        });

        test('should identify most used commands', () => {
            // Add more instances of specific commands
            historyManager.addCommand('config.get game.scoring');
            historyManager.addCommand('config.get game.scoring');
            const stats = historyManager.getStatistics();
            expect(stats.mostUsedCommands).toBeDefined();
            expect(stats.mostUsedCommands.length).toBeGreaterThan(0);
        });

        test('should handle empty history', () => {
            const emptyManager = new EnhancedHistoryManager(mockConsole as any);
            const stats = emptyManager.getStatistics();
            expect(stats.totalCommands).toBe(0);
            expect(stats.successRate).toBe(0);
            expect(stats.averageExecutionTime).toBe(0);
            emptyManager.destroy();
        });
    });

    describe('clear', () => {
        test('should clear all history', () => {
            historyManager.addCommand('command1');
            historyManager.addCommand('command2');
            expect(historyManager.history.length).toBe(2);
            historyManager.clear();
            expect(historyManager.history.length).toBe(0);
            expect(historyManager.currentIndex).toBe(-1);
        });

        test('should reset index after clearing', () => {
            historyManager.addCommand('command1');
            historyManager.navigate('up');
            expect(historyManager.currentIndex).toBe(0);
            historyManager.clear();
            expect(historyManager.currentIndex).toBe(-1);
        });
    });

    describe('export and import', () => {
        beforeEach(() => {
            historyManager.addCommand('config.get game.scoring');
            historyManager.addCommand('config.set audio.volume 0.8');
            historyManager.addCommand('game.pause');
        });

        test('should export history to JSON', () => {
            const exported = historyManager.export();
            expect(exported).toBeDefined();
            const parsed = JSON.parse(exported);
            expect(parsed.history).toHaveLength(3);
            expect(parsed.metadata.exportedAt).toBeDefined();
            expect(parsed.metadata.version).toBeDefined();
        });

        test('should import history from JSON', () => {
            const exported = historyManager.export();
            historyManager.clear();
            expect(historyManager.history.length).toBe(0);
            
            const result = historyManager.import(exported);
            expect(result).toBe(true);
            expect(historyManager.history.length).toBe(3);
            expect(historyManager.history[0].command).toBe('config.get game.scoring');
        });

        test('should handle invalid import data', () => {
            const result = historyManager.import('invalid json');
            expect(result).toBe(false);
        });

        test('should merge imported history with existing', () => {
            historyManager.addCommand('existing.command');
            const exported = historyManager.export();
            
            // Create new manager and add different commands
            const newManager = new EnhancedHistoryManager(mockConsole as any);
            newManager.addCommand('new.command');
            
            const result = newManager.import(exported, true); // merge = true
            expect(result).toBe(true);
            expect(newManager.history.length).toBe(5); // 1 existing + 4 imported
            newManager.destroy();
        });
    });

    describe('persistence', () => {
        test('should save history to localStorage', () => {
            historyManager.addCommand('test.command');
            historyManager.saveToStorage();
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'enhanced-debug-history',
                expect.any(String)
            );
        });

        test('should load history from localStorage', () => {
            const historyData = {
                history: [
                    { id: '1', command: 'loaded.command', timestamp: Date.now() }
                ],
                metadata: { version: '1.0' }
            };
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(historyData));
            
            const newManager = new EnhancedHistoryManager(mockConsole as any);
            expect(newManager.history.length).toBe(1);
            expect(newManager.history[0].command).toBe('loaded.command');
            newManager.destroy();
        });

        test('should handle corrupted localStorage data', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue('corrupted data');
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const newManager = new EnhancedHistoryManager(mockConsole as any);
            
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(newManager.history.length).toBe(0);
            
            consoleWarnSpy.mockRestore();
            newManager.destroy();
        });
    });

    describe('destroy', () => {
        test('should clean up properly', () => {
            historyManager.addCommand('test.command');
            expect(historyManager.history.length).toBe(1);
            
            historyManager.destroy();
            expect(historyManager.history.length).toBe(0);
        });

        test('should save before destroying when autoSave is enabled', () => {
            historyManager.autoSave = true;
            historyManager.addCommand('test.command');
            
            const saveToStorageSpy = jest.spyOn(historyManager, 'saveToStorage');
            historyManager.destroy();
            expect(saveToStorageSpy).toHaveBeenCalled();
        });
    });
});