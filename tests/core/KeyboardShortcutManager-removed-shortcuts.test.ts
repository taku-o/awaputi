/**
 * CoreKeyboardShortcutManager - Removed Shortcuts Tests
 * Issue #169対応 - 削除されたショートカットの非存在テスト
 */
import { jest } from '@jest/globals';

// TextEncoder/TextDecoder polyfill for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// DOM environment setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).localStorage = dom.window.localStorage;
(global as any).performance = dom.window.performance;

// Mock game engine components
const mockGameEngine = {
    sceneManager: {
        getCurrentScene: jest.fn(() => ({
            constructor: { name: 'MainMenuScene' }
        })),
        switchScene: jest.fn(() => true)
    },
    audioManager: {
        toggleMute: jest.fn(() => false)
    },
    settingsManager: {
        get: jest.fn(() => 0.5),
        set: jest.fn()
    },
    responsiveCanvasManager: {
        toggleFullscreen: jest.fn()
    },
    isDebugMode: jest.fn(() => false),
    performanceStats: {}
};

// Import after mocking
const { CoreKeyboardShortcutManager } = await import('../../src/core/KeyboardShortcutManager.js');

describe('CoreKeyboardShortcutManager - Removed Shortcuts (Issue #169)', () => {
    let shortcutManager: any;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();
        // Reset mock calls
        jest.clearAllMocks();
        // Create instance
        shortcutManager = new CoreKeyboardShortcutManager(mockGameEngine);
    });

    afterEach(() => {
        if (shortcutManager) {
            shortcutManager.cleanup();
        }
    });

    describe('Settings Shortcut (S key) - REMOVED', () => {
        test('should not register S key shortcut', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.settings).toBeUndefined();
        });

        test('should not respond to S key press', () => {
            const event = new KeyboardEvent('keydown', {
                code: 'KeyS',
                key: 's'
            });

            // Mock scene manager switchScene to verify it's NOT called
            const switchSceneSpy = jest.spyOn(mockGameEngine.sceneManager, 'switchScene');

            shortcutManager.handleKeyDown(event);

            // Verify no scene switch occurred
            expect(switchSceneSpy).not.toHaveBeenCalledWith('settings');
            expect(switchSceneSpy).not.toHaveBeenCalledWith('SettingsScene');
            
            switchSceneSpy.mockRestore();
        });

        test('should not have handleSettings method accessible', () => {
            // Verify the specific handler method is not accessible
            expect(typeof shortcutManager.handleSettings).toBe('undefined');
        });
    });

    describe('Help Shortcut (H key) - REMOVED', () => {
        test('should not register H key shortcut', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.help).toBeUndefined();
        });

        test('should not respond to H key press', () => {
            const event = new KeyboardEvent('keydown', {
                code: 'KeyH',
                key: 'h'
            });

            // Mock scene manager switchScene to verify it's NOT called
            const switchSceneSpy = jest.spyOn(mockGameEngine.sceneManager, 'switchScene');

            shortcutManager.handleKeyDown(event);

            // Verify no scene switch occurred
            expect(switchSceneSpy).not.toHaveBeenCalledWith('help');
            expect(switchSceneSpy).not.toHaveBeenCalledWith('HelpScene');
            
            switchSceneSpy.mockRestore();
        });

        test('should not have handleHelp method accessible', () => {
            // Verify the specific handler method is not accessible
            expect(typeof shortcutManager.handleHelp).toBe('undefined');
        });
    });

    describe('User Info Shortcut (I key) - REMOVED', () => {
        test('should not register I key shortcut', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.userInfo).toBeUndefined();
        });

        test('should not respond to I key press', () => {
            const event = new KeyboardEvent('keydown', {
                code: 'KeyI',
                key: 'i'
            });

            // Mock scene manager switchScene to verify it's NOT called
            const switchSceneSpy = jest.spyOn(mockGameEngine.sceneManager, 'switchScene');

            shortcutManager.handleKeyDown(event);

            // Verify no scene switch occurred
            expect(switchSceneSpy).not.toHaveBeenCalledWith('userInfo');
            expect(switchSceneSpy).not.toHaveBeenCalledWith('UserInfoScene');
            
            switchSceneSpy.mockRestore();
        });

        test('should not have handleUserInfo method accessible', () => {
            // Verify the specific handler method is not accessible
            expect(typeof shortcutManager.handleUserInfo).toBe('undefined');
        });
    });

    describe('Multiple Removed Shortcuts Verification', () => {
        test('should not register any of the removed shortcuts', () => {
            const shortcuts = shortcutManager.getShortcuts();
            const removedShortcuts = ['settings', 'help', 'userInfo'];

            removedShortcuts.forEach(shortcutName => {
                expect(shortcuts[shortcutName]).toBeUndefined();
            });
        });

        test('should not respond to any removed shortcut keys', () => {
            const removedKeyEvents = [
                { code: 'KeyS', key: 's', description: 'Settings' },
                { code: 'KeyH', key: 'h', description: 'Help' },
                { code: 'KeyI', key: 'i', description: 'User Info' }
            ];

            const switchSceneSpy = jest.spyOn(mockGameEngine.sceneManager, 'switchScene');

            removedKeyEvents.forEach(({ code, key, description }) => {
                const event = new KeyboardEvent('keydown', { code, key });
                
                switchSceneSpy.mockClear();
                shortcutManager.handleKeyDown(event);

                // Verify no scene switches occurred for any removed shortcuts
                expect(switchSceneSpy).not.toHaveBeenCalled();
            });

            switchSceneSpy.mockRestore();
        });

        test('should have reduced total shortcut count', () => {
            const stats = shortcutManager.getStats();
            
            // After removing 3 shortcuts, the total should be reduced
            // This is a regression test to ensure shortcuts were actually removed
            expect(stats.totalShortcuts).toBeLessThan(25);
            expect(stats.totalShortcuts).toBeGreaterThan(5);
        });
    });

    describe('Shortcut Context Independence', () => {
        test('removed shortcuts should not work in any scene context', () => {
            const sceneContexts = [
                { constructor: { name: 'MainMenuScene' } },
                { constructor: { name: 'GameScene' } },
                { constructor: { name: 'SettingsScene' } },
                { constructor: { name: 'HelpScene' } }
            ];

            const removedKeys = ['KeyS', 'KeyH', 'KeyI'];
            const switchSceneSpy = jest.spyOn(mockGameEngine.sceneManager, 'switchScene');

            sceneContexts.forEach(sceneContext => {
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(sceneContext);

                removedKeys.forEach(keyCode => {
                    switchSceneSpy.mockClear();
                    const event = new KeyboardEvent('keydown', {
                        code: keyCode,
                        key: keyCode.slice(-1).toLowerCase()
                    });

                    shortcutManager.handleKeyDown(event);

                    // Verify no scene switches occurred
                    expect(switchSceneSpy).not.toHaveBeenCalled();
                });
            });

            switchSceneSpy.mockRestore();
        });
    });

    describe('Help Text Generation - Removed Shortcuts', () => {
        test('should not include removed shortcuts in help text', () => {
            const helpText = shortcutManager.generateHelpText();
            const allHelpEntries = Object.values(helpText).flat();
            
            // Convert all help entries to lowercase string for searching
            const helpString = JSON.stringify(allHelpEntries).toLowerCase();
            
            // Verify removed shortcuts are not mentioned
            expect(helpString).not.toContain('設定');  // Settings in Japanese
            expect(helpString).not.toContain('ヘルプ'); // Help in Japanese  
            expect(helpString).not.toContain('ユーザー情報'); // User Info in Japanese
            expect(helpString).not.toContain('key s'); // S key reference
            expect(helpString).not.toContain('key h'); // H key reference
            expect(helpString).not.toContain('key i'); // I key reference
        });

        test('should have consistent help text structure without removed shortcuts', () => {
            const helpText = shortcutManager.generateHelpText();
            
            // Verify help text structure is still intact
            expect(helpText['ゲーム操作']).toBeDefined();
            expect(Array.isArray(helpText['ゲーム操作'])).toBe(true);
            
            // But verify removed shortcuts are not in any category
            Object.values(helpText).forEach(category => {
                const categoryString = JSON.stringify(category).toLowerCase();
                expect(categoryString).not.toContain('s キー');
                expect(categoryString).not.toContain('h キー');
                expect(categoryString).not.toContain('i キー');
            });
        });
    });

    describe('Shortcut Registration Verification', () => {
        test('should not have removed shortcut configurations', () => {
            const shortcuts = shortcutManager.getShortcuts();
            
            // Verify specific shortcut configurations don't exist
            expect(shortcuts.settings).toBeUndefined();
            expect(shortcuts.help).toBeUndefined();
            expect(shortcuts.userInfo).toBeUndefined();
            
            // But verify other shortcuts still exist
            expect(shortcuts.pause).toBeDefined();
            expect(shortcuts.menu).toBeDefined();
            expect(shortcuts.fullscreen).toBeDefined();
            expect(shortcuts.mute).toBeDefined();
        });

        test('should have clean shortcut key mappings without removed keys', () => {
            const shortcuts = shortcutManager.getShortcuts();
            const allKeys: string[] = [];

            // Collect all registered keys
            Object.values(shortcuts).forEach((shortcut: any) => {
                if (shortcut && shortcut.keys) {
                    allKeys.push(...shortcut.keys);
                }
            });

            // Verify removed keys are not in any shortcut mapping
            expect(allKeys).not.toContain('KeyS');
            expect(allKeys).not.toContain('KeyH');
            expect(allKeys).not.toContain('KeyI');
        });
    });

    describe('Memory and Performance Impact', () => {
        test('should not allocate memory for removed shortcut handlers', () => {
            // Check that removed handler methods don't exist on the instance
            const handlerMethods = ['handleSettings', 'handleHelp', 'handleUserInfo'];
            
            handlerMethods.forEach(methodName => {
                expect(shortcutManager[methodName]).toBeUndefined();
            });
        });

        test('should have expected number of active listeners after removal', () => {
            const stats = shortcutManager.getStats();
            
            // After removing 3 shortcuts, we should have fewer registered listeners
            // This is a performance test to ensure we're not keeping unused handlers
            expect(stats.totalShortcuts).toBeLessThan(20);
            expect(stats.enabledShortcuts).toBe(stats.totalShortcuts);
        });
    });

    describe('Backward Compatibility Verification', () => {
        test('should handle attempts to use removed shortcuts gracefully', () => {
            // Even if someone tries to call removed functionality, it shouldn't crash
            const removedKeys = [
                { code: 'KeyS', key: 's' },
                { code: 'KeyH', key: 'h' },
                { code: 'KeyI', key: 'i' }
            ];

            removedKeys.forEach(({ code, key }) => {
                const event = new KeyboardEvent('keydown', { code, key });
                
                expect(() => {
                    shortcutManager.handleKeyDown(event);
                }).not.toThrow();
            });
        });

        test('should maintain stable API surface after shortcut removal', () => {
            // Verify core API methods still exist and work
            expect(typeof shortcutManager.getShortcuts).toBe('function');
            expect(typeof shortcutManager.getStats).toBe('function');
            expect(typeof shortcutManager.generateHelpText).toBe('function');
            expect(typeof shortcutManager.setEnabled).toBe('function');
            expect(typeof shortcutManager.cleanup).toBe('function');
            
            // And they don't throw errors
            expect(() => shortcutManager.getShortcuts()).not.toThrow();
            expect(() => shortcutManager.getStats()).not.toThrow();
            expect(() => shortcutManager.generateHelpText()).not.toThrow();
        });
    });
});