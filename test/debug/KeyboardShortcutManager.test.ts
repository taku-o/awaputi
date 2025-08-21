/**
 * Keyboard Shortcut Manager Tests
 * KeyboardShortcutManager クラスのユニットテスト
 */
import { jest  } from '@jest/globals';
// DOM environment setup''
import { JSDOM  } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global: any).document = dom.window.document,
(global: any).window = dom.window,
(global: any).localStorage = dom.window.localStorage,
(global: any).performance = dom.window.performance,
// Mock debug interface
const mockDebugInterface = { isVisible: false,
    toggle: jest.fn(
    switchPanel: jest.fn(),','
    hide: jest.fn(),','
        showSettings: jest.fn()') }'
};'
// Import after mocking''
const { KeyboardShortcutManager } = await import('../../src/debug/KeyboardShortcutManager.js');
describe('KeyboardShortcutManager', () => {  let shortcutManager: any,
    let consoleWarnSpy: any,
    let consoleLogSpy: any,','
    let consoleErrorSpy: any,','
    beforeEach((') => { }'
        // Console spies' }'
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}');'
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {}');'
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        // Clear localStorage
        localStorage.clear();
        // Reset mock calls
        jest.clearAllMocks();
        // Create instance
        shortcutManager = new KeyboardShortcutManager(mockDebugInterface: any);
    };
    afterEach(() => {  if (shortcutManager) { }
            shortcutManager.destroy(); }
        }
        // Restore console
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        // Clear timers'
        jest.clearAllTimers();'}');
    describe('Initialization', (') => {  ''
        test('should initialize with default values', () => {
            expect(shortcutManager.shortcuts).toBeInstanceOf(Map: any);
            expect(shortcutManager.shortcutGroups).toBeInstanceOf(Map: any),'
            expect(shortcutManager.contexts).toBeInstanceOf(Map: any);
            expect(shortcutManager.activeContext').toBe('global'),'
            expect(shortcutManager.enabled).toBe(true) }'
            expect(shortcutManager.suspended).toBe(false););' }'
        }');'
        test('should register default shortcuts', () => {  ''
            expect(shortcutManager.shortcuts.size).toBeGreaterThan(0'),' }'
            expect(shortcutManager.shortcuts.has('ctrl+shift+d').toBe(true);');' }'
            expect(shortcutManager.shortcuts.has('escape'}.toBe(true');'
        }''
        test('should setup default contexts', (') => {  ''
            expect(shortcutManager.contexts.has('global').toBe(true'),' }'
            expect(shortcutManager.contexts.has('console').toBe(true);');' }'
            expect(shortcutManager.contexts.has('performance'}.toBe(true');'
        }''
        test('should initialize statistics', () => {  const stats = shortcutManager.getStatistics();
            expect(stats.totalExecuted).toBe(0);
            expect(stats.totalRegistered).toBeGreaterThan(0), // default shortcuts }'
            expect(stats.conflictsDetected).toBe(0););' }'
        }');'
    }''
    describe('Shortcut Registration', (') => {  ''
        test('should register simple shortcut', () => {''
            const callback = jest.fn(')',
            const result = shortcutManager.register('ctrl+x', callback),' }'
            expect(result).toBe(true);');' }'
            expect(shortcutManager.shortcuts.has('ctrl+x'}.toBe(true');'
            const shortcutData = shortcutManager.shortcuts.get('ctrl+x');'
            expect(shortcutData.callback).toBe(callback);
            expect(shortcutData.options.group').toBe('default');'
            expect(shortcutData.options.context').toBe('global');'}');'
        test('should register shortcut with options', () => {  ''
            const callback = jest.fn('',
                description: 'Test shortcut',')'
                group: 'test',')',
                context: 'console') }
                priority: 10 }'
            };')'
            shortcutManager.register('alt+t', callback, options');'
            const shortcutData = shortcutManager.shortcuts.get('alt+t');
            expect(shortcutData.options.description').toBe('Test shortcut');'
            expect(shortcutData.options.group').toBe('test');'
            expect(shortcutData.options.context').toBe('console');'
            expect(shortcutData.options.priority).toBe(10);'}');
        test('should normalize shortcut keys', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('Ctrl+Shift+X', callback}');'
            expect(shortcutManager.shortcuts.has('ctrl+shift+x'}.toBe(true');'
        }''
        test('should handle invalid shortcuts', () => {  ''
            const callback = jest.fn(')',
            const result = shortcutManager.register(', callback),'
            expect(result).toBe(false'),' }'
            expect(consoleErrorSpy.toHaveBeenCalledWith('Invalid shortcut format: '),' }'
        }');'
        test('should handle modifier-only shortcuts', () => {  ''
            const callback = jest.fn(')',
            const result = shortcutManager.register('ctrl+shift', callback);
            expect(result).toBe(false'),' }'
            expect(consoleErrorSpy.toHaveBeenCalledWith('Invalid shortcut format: ctrl+shift'),' }'
        }');'
        test('should detect conflicts with warn strategy', () => {  const callback1 = jest.fn() as jest.Mock,
            const callback2 = jest.fn(')',
            shortcutManager.register('ctrl+x', callback1'),'
            const result = shortcutManager.register('ctrl+x', callback2);
            expect(result).toBe(false'),'
            expect(consoleWarnSpy.toHaveBeenCalledWith('Shortcut conflict detected: ctrl+x'),' }'
            expect(shortcutManager.conflicts.has('ctrl+x').toBe(true'); }'
        }''
        test('should override with override strategy', () => {  const callback1 = jest.fn() as jest.Mock,
            const callback2 = jest.fn(')',
            shortcutManager.setConflictResolutionStrategy('override');
            shortcutManager.register('ctrl+x', callback1'),'
            const result = shortcutManager.register('ctrl+x', callback2);
            expect(result).toBe(true'),'
            expect(consoleWarnSpy.toHaveBeenCalledWith('Shortcut overridden: ctrl+x'),' }'
            expect(shortcutManager.shortcuts.get('ctrl+x').callback).toBe(callback2););' }'
        }');'
        test('should throw error with error strategy', () => {  const callback1 = jest.fn() as jest.Mock,
            const callback2 = jest.fn(')',
            shortcutManager.setConflictResolutionStrategy('error');
            shortcutManager.register('ctrl+x', callback1),' }'
            expect((') => { }'
                shortcutManager.register('ctrl+x', callback2};'}').toThrow('Shortcut conflict: ctrl+x is already registered'),'
        }'}');
    describe('Shortcut Execution', (') => {  ''
        test('should execute registered shortcut', () => {''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x', callback'),'
            const event = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn() }
        stopPropagation: jest.fn(); }
            );'
            const result = shortcutManager.execute(event);
            expect(result).toBe(true');'
            expect(callback.toHaveBeenCalledWith(event, 'ctrl+x', expect.any(Object);'
            expect(event.preventDefault).toHaveBeenCalled();'}');
        test('should not execute when disabled', () => {  ''
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback'); }'
            shortcutManager.setEnabled(false};')'
            const event = new KeyboardEvent('keydown', { ')',
                key: 'x'),
                ctrlKey: true) }
            };
            const result = shortcutManager.execute(event);
            expect(result).toBe(false);'
            expect(callback).not.toHaveBeenCalled();'}');
        test('should not execute when suspended', () => {  ''
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback'); }'
            shortcutManager.setSuspended(true};')'
            const event = new KeyboardEvent('keydown', { ')',
                key: 'x'),
                ctrlKey: true) }
            };
            const result = shortcutManager.execute(event);
            expect(result).toBe(false);'
            expect(callback).not.toHaveBeenCalled();'}');
        test('should handle execution errors gracefully', () => {  ''
            const callback = jest.fn((') => {',
                throw new Error('Test error'),')'),
            shortcutManager.register('ctrl+x', callback'),'
            const event = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn(
        stopPropagation: jest.fn()),
            const result = shortcutManager.execute(event),'
            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(')',
                "Error executing shortcut 'ctrl+x':"),
                expect.any(Error) }""
            );" }"
        }");"""
        test('should update statistics on execution', () => {  ''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x', callback'),'
            const event = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn() }
        stopPropagation: jest.fn(); }
            );
            const initialStats = shortcutManager.getStatistics();
            shortcutManager.execute(event);'
            const updatedStats = shortcutManager.getStatistics();
            expect(updatedStats.totalExecuted).toBe(initialStats.totalExecuted + 1');'
            const shortcutData = shortcutManager.shortcuts.get('ctrl+x');
            expect(shortcutData.statistics.executionCount).toBe(1);'
            expect(shortcutData.statistics.lastExecuted).toBeDefined();'}');'
    }''
    describe('Key Normalization', (') => {  ''
        test('should normalize special keys', (') => {''
            expect(shortcutManager.normalizeKey(', ')').toBe('space'),'
            expect(shortcutManager.normalizeKey('Enter')').toBe('enter'),'
            expect(shortcutManager.normalizeKey('Escape')').toBe('escape'),'),' }'
            expect(shortcutManager.normalizeKey('ArrowUp')').toBe('up'); }'
        }''
        test('should normalize case', (') => {  shortcutManager.settings.caseSensitive = false,' }'
            expect(shortcutManager.normalizeKey('A')').toBe('a');');' }'
            expect(shortcutManager.normalizeKey('X'}').toBe('x');'
        }''
        test('should handle case sensitivity', (') => {  shortcutManager.settings.caseSensitive = true,' }'
            expect(shortcutManager.normalizeKey('A')').toBe('A');');' }'
            expect(shortcutManager.normalizeKey('x'}').toBe('x');'
        }''
        test('should normalize function keys', (') => { }'
            expect(shortcutManager.normalizeKey('F1')').toBe('f1');');' }'
            expect(shortcutManager.normalizeKey('F12'}').toBe('f12');'
        }'}');
    describe('Shortcut Building', (') => {  ''
        test('should build simple shortcut string', (') => {'
            const event = {''
                key: 'x',
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,';'
            };
            expect(shortcutManager.buildShortcutString(event)').toBe('x');'}');'
        test('should build complex shortcut string', (') => {  const event = {''
                key: 'X',
                ctrlKey: true,
                altKey: true,
                shiftKey: false,
                metaKey: false,'
            };
            expect(shortcutManager.buildShortcutString(event)').toBe('ctrl+alt+x');'}');'
        test('should ignore modifier keys as main keys', (') => {  const event = {''
                key: 'Control',
                ctrlKey: true,
                altKey: false,
                shiftKey: false,
                metaKey: false,'
            };
            expect(shortcutManager.buildShortcutString(event)').toBe('ctrl');'}');'
    }''
    describe('Sequence Handling', () => { beforeEach(() => { }
            jest.useFakeTimers(});
        });
        afterEach(() => {  }'
            jest.useRealTimers(});'}');
        test('should register sequence shortcuts', () => {  ''
            const callback = jest.fn(')',
            const result = shortcutManager.register('ctrl+x>ctrl+s', callback),' }'
            expect(result).toBe(true);');' }'
            expect(shortcutManager.shortcuts.has('ctrl+x>ctrl+s'}.toBe(true');'
        }''
        test('should execute sequence shortcuts', () => {  ''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x>ctrl+s', callback'),'
            // First key''
            const event1 = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn() }
        stopPropagation: jest.fn(); }
            );
            const result1 = shortcutManager.execute(event1);'
            expect(result1).toBe(true);
            expect(shortcutManager.isWaitingForSequence).toBe(true');'
            // Second key''
            const event2 = new KeyboardEvent('keydown', { '),'
                key: 's'),
                ctrlKey: true),
               , preventDefault: jest.fn(
        stopPropagation: jest.fn() }
            );
            const result2 = shortcutManager.execute(event2);
            expect(result2).toBe(true);
            expect(callback.toHaveBeenCalled();'
            expect(shortcutManager.isWaitingForSequence).toBe(false);'}');
        test('should timeout sequence', () => {  ''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x>ctrl+s', callback'),'
            // First key''
            const event1 = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn() }
        stopPropagation: jest.fn(); }
            );
            shortcutManager.execute(event1);
            expect(shortcutManager.isWaitingForSequence).toBe(true);
            // Fast-forward time
            jest.advanceTimersByTime(3000);
            expect(shortcutManager.isWaitingForSequence).toBe(false);'
            expect(shortcutManager.currentSequence).toEqual([]);'}');
        test('should reset sequence on invalid continuation', () => {  ''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x>ctrl+s', callback'),'
            // First key''
            const event1 = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn() }
        stopPropagation: jest.fn(); }
            );'
            shortcutManager.execute(event1);
            expect(shortcutManager.isWaitingForSequence).toBe(true');'
            // Invalid continuation''
            const event2 = new KeyboardEvent('keydown', { '),'
                key: 'z'),
                ctrlKey: true),
               , preventDefault: jest.fn(
        stopPropagation: jest.fn() }
            );
            const result2 = shortcutManager.execute(event2);
            expect(result2).toBe(false);'
            expect(shortcutManager.isWaitingForSequence).toBe(false);'}');'
    }''
    describe('Context Management', (') => {  ''
        test('should switch context', (') => {''
            shortcutManager.switchContext('console'),' }'
            expect(shortcutManager.activeContext').toBe('console'););' }'
        }');'
        test('should execute shortcuts from active context', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback, { context: 'console' }');'
            shortcutManager.switchContext('console');
            const event = new KeyboardEvent('keydown', { '),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn(
        stopPropagation: jest.fn() }
            );
            const result = shortcutManager.execute(event);
            expect(result).toBe(true);'
            expect(callback.toHaveBeenCalled();'}');
        test('should not execute shortcuts from inactive context', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback, { context: 'console' }');'
            shortcutManager.switchContext('performance');
            const event = new KeyboardEvent('keydown', { '),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn(
        stopPropagation: jest.fn() }
            );
            const result = shortcutManager.execute(event);
            expect(result).toBe(false);'
            expect(callback).not.toHaveBeenCalled();'}');
        test('should fallback to global context', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback, { context: 'global' }');'
            shortcutManager.switchContext('console');
            const event = new KeyboardEvent('keydown', { '),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn(
        stopPropagation: jest.fn() }
            );
            const result = shortcutManager.execute(event);
            expect(result).toBe(true);'
            expect(callback.toHaveBeenCalled();'}');'
    }''
    describe('Group Management', (') => {  ''
        test('should add shortcuts to groups', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback, { group: 'test' }');'
            const groupShortcuts = shortcutManager.getShortcutsByGroup('test');'
            expect(groupShortcuts.toHaveLength(1);
            expect(groupShortcuts[0].shortcut').toBe('ctrl+x');'}');'
        test('should return empty array for non-existent group', (') => {  ''
            const groupShortcuts = shortcutManager.getShortcutsByGroup('nonexistent') }'
            expect(groupShortcuts).toEqual([]); }'
        }');'
        test('should remove from group when unregistered', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback, { group: 'test' }');'
            shortcutManager.unregister('ctrl+x');
            const groupShortcuts = shortcutManager.getShortcutsByGroup('test');'
            expect(groupShortcuts).toEqual([]);'}');'
    }''
    describe('Shortcut Unregistration', (') => {  ''
        test('should unregister shortcut', () => {''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x', callback'),'
            expect(shortcutManager.shortcuts.has('ctrl+x').toBe(true'),'
            const result = shortcutManager.unregister('ctrl+x'),' }'
            expect(result).toBe(true);');' }'
            expect(shortcutManager.shortcuts.has('ctrl+x'}.toBe(false');'
        }''
        test('should return false for non-existent shortcut', (') => {  ''
            const result = shortcutManager.unregister('ctrl+nonexistent') }'
            expect(result).toBe(false););' }'
        }');'
        test('should remove from conflicts when unregistered', () => {  const callback1 = jest.fn() as jest.Mock,
            const callback2 = jest.fn(')',
            shortcutManager.register('ctrl+x', callback1'),'
            shortcutManager.register('ctrl+x', callback2'), // Creates conflict''
            expect(shortcutManager.conflicts.has('ctrl+x').toBe(true'),'
            shortcutManager.unregister('ctrl+x'),' }'
            expect(shortcutManager.conflicts.has('ctrl+x').toBe(false); }'
        }'}');
    describe('Public API', (') => {  ''
        test('should get all shortcuts', () => {''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x', callback),'
            const allShortcuts = shortcutManager.getAllShortcuts();
            expect(allShortcuts.toBeInstanceOf(Map as any'),' }'
            expect(allShortcuts.has('ctrl+x').toBe(true'); }'
        }''
        test('should get shortcuts by context', () => { }'
            const callback = jest.fn(') }';
            shortcutManager.register('ctrl+x', callback, { context: 'console' }');'
            const contextShortcuts = shortcutManager.getShortcutsByContext('console');'
            expect(contextShortcuts.toHaveLength(1);
            expect(contextShortcuts[0].shortcut').toBe('ctrl+x');'}');'
        test('should get conflicts', () => {  const callback1 = jest.fn() as jest.Mock,
            const callback2 = jest.fn(')',
            shortcutManager.register('ctrl+x', callback1'),' }'
            shortcutManager.register('ctrl+x', callback2);' }'
            const conflicts = shortcutManager.getConflicts(}');'
            expect(conflicts.has('ctrl+x').toBe(true');'
        }''
        test('should get and update settings', () => {  const settings = shortcutManager.getSettings();
            expect(settings.caseSensitive).toBe(false) }
); }
            shortcutManager.updateSettings({ caseSensitive: true,);
            const updatedSettings = shortcutManager.getSettings();'
            expect(updatedSettings.caseSensitive).toBe(true);'}');
        test('should set debug mode', () => {  shortcutManager.setDebug(true) }'
            expect(shortcutManager.debug).toBe(true););' }'
        }');'
        test('should set conflict resolution strategy', (') => {  ''
            shortcutManager.setConflictResolutionStrategy('override'),' }'
            expect(shortcutManager.conflictResolutionStrategy').toBe('override'););' }'
        }');'
        test('should warn for invalid conflict resolution strategy', (') => {  ''
            shortcutManager.setConflictResolutionStrategy('invalid'),' }'
            expect(consoleWarnSpy.toHaveBeenCalledWith('Invalid conflict resolution strategy: invalid'),' }'
        }');'
    }''
    describe('Cleanup', (') => {  ''
        test('should destroy cleanly', () => {''
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x', callback);
            shortcutManager.destroy();
            expect(shortcutManager.shortcuts.size).toBe(0);
            expect(shortcutManager.shortcutGroups.size).toBe(0) }'
            expect(shortcutManager.contexts.size).toBe(0););' }'
        }');'
        test('should clear sequence timer on destroy', () => {  jest.useFakeTimers();
            const callback = jest.fn(')',
            shortcutManager.register('ctrl+x>ctrl+s', callback'),'
            // Start sequence''
            const event = new KeyboardEvent('keydown', {'),'
                key: 'x'),
                ctrlKey: true),
               , preventDefault: jest.fn() }
        stopPropagation: jest.fn(); }
            );
            shortcutManager.execute(event);
            expect(shortcutManager.sequenceTimer).toBeDefined();
            shortcutManager.destroy();
            expect(shortcutManager.sequenceTimer).toBeNull();
            jest.useRealTimers();
        };'
    }'}');