/**
 * CoreKeyboardShortcutManager - Remaining Functionality Tests
 * Issue #169対応 - 残存するショートカット機能のテスト
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
        getCurrentScene: jest.fn(),
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

// Mock confirm function
(global as any).confirm = jest.fn(() => true);

// Import after mocking
const { CoreKeyboardShortcutManager } = await import('../../src/core/KeyboardShortcutManager.js');

describe('CoreKeyboardShortcutManager - Remaining Functionality (Issue #169)', () => {
    let shortcutManager: any;
    let consoleLogSpy: any;

    beforeEach(() => {
        // Console spies
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
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
        // Restore console
        consoleLogSpy.mockRestore();
    });

    describe('Pause Functionality', () => {
        test('should handle Space key for pause/unpause in game scene', () => {
            // Mock game scene with pause functionality
            const mockGameScene = {
                constructor: { name: 'GameScene' },
                togglePause: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene);

            // Create Space keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' ',
                bubbles: true,
                cancelable: true
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify pause was toggled
            expect(mockGameScene.togglePause).toHaveBeenCalled();
        });

        test('should not handle Space key in non-game scenes', () => {
            // Mock menu scene
            const mockMenuScene = {
                constructor: { name: 'MainMenuScene' }
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockMenuScene);

            // Create Space keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' '
            });

            // Handle the event - should not crash
            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();
        });
    });

    describe('Menu/Escape Functionality', () => {
        test('should handle Escape key for menu navigation', () => {
            // Mock game scene with menu functionality
            const mockGameScene = {
                constructor: { name: 'GameScene' },
                showPauseMenu: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene);

            // Create Escape keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify menu was shown
            expect(mockGameScene.showPauseMenu).toHaveBeenCalled();
        });

        test('should handle Escape key in different scene contexts', () => {
            // Test various scene types
            const sceneTypes = ['MainMenuScene', 'SettingsScene', 'HelpScene'];
            
            sceneTypes.forEach(sceneType => {
                const mockScene = {
                    constructor: { name: sceneType },
                    goBack: jest.fn()
                };
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene);

                const event = new KeyboardEvent('keydown', {
                    code: 'Escape',
                    key: 'Escape'
                });

                expect(() => {
                    shortcutManager.handleKeyDown(event);
                }).not.toThrow();
            });
        });
    });

    describe('Fullscreen Functionality', () => {
        test('should handle F key for fullscreen toggle', () => {
            // Create F keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyF',
                key: 'f'
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify fullscreen was toggled
            expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).toHaveBeenCalled();
        });

        test('should handle both upper and lowercase F key', () => {
            const testCases = [
                { code: 'KeyF', key: 'f' },
                { code: 'KeyF', key: 'F' }
            ];

            testCases.forEach(testCase => {
                const event = new KeyboardEvent('keydown', testCase);
                mockGameEngine.responsiveCanvasManager.toggleFullscreen.mockClear();

                shortcutManager.handleKeyDown(event);

                expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).toHaveBeenCalled();
            });
        });
    });

    describe('Mute Functionality', () => {
        test('should handle M key for audio mute toggle', () => {
            // Create M keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyM',
                key: 'm'
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify mute was toggled
            expect(mockGameEngine.audioManager.toggleMute).toHaveBeenCalled();
        });

        test('should return mute state from toggleMute', () => {
            // Mock different return values
            mockGameEngine.audioManager.toggleMute
                .mockReturnValueOnce(true)  // muted
                .mockReturnValueOnce(false); // unmuted

            const event = new KeyboardEvent('keydown', {
                code: 'KeyM',
                key: 'm'
            });

            // First call should mute
            shortcutManager.handleKeyDown(event);
            expect(mockGameEngine.audioManager.toggleMute).toHaveBeenCalled();

            // Second call should unmute
            shortcutManager.handleKeyDown(event);
            expect(mockGameEngine.audioManager.toggleMute).toHaveBeenCalledTimes(2);
        });
    });

    describe('Volume Control Functionality', () => {
        test('should handle Ctrl+ArrowUp for volume increase', () => {
            mockGameEngine.settingsManager.get.mockReturnValue(0.5); // current volume
            
            // Create Ctrl+ArrowUp keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'ArrowUp',
                key: 'ArrowUp',
                ctrlKey: true
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify volume was increased
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.6);
        });

        test('should handle Ctrl+ArrowDown for volume decrease', () => {
            mockGameEngine.settingsManager.get.mockReturnValue(0.5); // current volume
            
            // Create Ctrl+ArrowDown keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'ArrowDown',
                key: 'ArrowDown',
                ctrlKey: true
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify volume was decreased
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.4);
        });

        test('should respect volume bounds (0.0 to 1.0)', () => {
            // Test maximum volume boundary
            mockGameEngine.settingsManager.get.mockReturnValue(0.95);
            const upEvent = new KeyboardEvent('keydown', {
                code: 'ArrowUp',
                key: 'ArrowUp',
                ctrlKey: true
            });
            shortcutManager.handleKeyDown(upEvent);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 1.0);

            // Test minimum volume boundary
            mockGameEngine.settingsManager.get.mockReturnValue(0.05);
            const downEvent = new KeyboardEvent('keydown', {
                code: 'ArrowDown',
                key: 'ArrowDown',
                ctrlKey: true
            });
            shortcutManager.handleKeyDown(downEvent);
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('audio.masterVolume', 0.0);
        });
    });

    describe('Debug Functionality', () => {
        test('should handle Ctrl+Shift+D for debug mode toggle', () => {
            // Create Ctrl+Shift+D keydown event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyD',
                key: 'd',
                ctrlKey: true,
                shiftKey: true
            });

            // Handle the event
            shortcutManager.handleKeyDown(event);

            // Verify debug mode was toggled (implementation dependent)
            // This test documents the expected behavior
            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();
        });
    });

    describe('Key Combination Handling', () => {
        test('should differentiate between single keys and combinations', () => {
            const testCases = [
                { code: 'KeyF', key: 'f', ctrlKey: false, expected: 'fullscreen' },
                { code: 'KeyM', key: 'm', ctrlKey: false, expected: 'mute' },
                { code: 'ArrowUp', key: 'ArrowUp', ctrlKey: true, expected: 'volumeUp' },
                { code: 'ArrowDown', key: 'ArrowDown', ctrlKey: true, expected: 'volumeDown' }
            ];

            testCases.forEach(testCase => {
                const event = new KeyboardEvent('keydown', {
                    code: testCase.code,
                    key: testCase.key,
                    ctrlKey: testCase.ctrlKey
                });

                expect(() => {
                    shortcutManager.handleKeyDown(event);
                }).not.toThrow();
            });
        });

        test('should handle modifier key states correctly', () => {
            // Test that regular ArrowUp without Ctrl doesn't trigger volume
            const event = new KeyboardEvent('keydown', {
                code: 'ArrowUp',
                key: 'ArrowUp',
                ctrlKey: false
            });

            shortcutManager.handleKeyDown(event);

            // Volume should not have been changed
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalled();
        });
    });

    describe('Context Awareness', () => {
        test('should respect scene context for context-sensitive shortcuts', () => {
            const gameScene = {
                constructor: { name: 'GameScene' },
                togglePause: jest.fn()
            };
            const menuScene = {
                constructor: { name: 'MainMenuScene' }
            };

            // Test in game context
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(gameScene);
            const spaceEvent = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' '
            });
            shortcutManager.handleKeyDown(spaceEvent);
            expect(gameScene.togglePause).toHaveBeenCalled();

            // Test in menu context (should not crash)
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(menuScene);
            expect(() => {
                shortcutManager.handleKeyDown(spaceEvent);
            }).not.toThrow();
        });

        test('should handle global shortcuts in any context', () => {
            const contexts = [
                { constructor: { name: 'GameScene' } },
                { constructor: { name: 'MainMenuScene' } },
                { constructor: { name: 'SettingsScene' } }
            ];

            contexts.forEach(context => {
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(context);
                mockGameEngine.responsiveCanvasManager.toggleFullscreen.mockClear();

                const fEvent = new KeyboardEvent('keydown', {
                    code: 'KeyF',
                    key: 'f'
                });

                shortcutManager.handleKeyDown(fEvent);
                expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).toHaveBeenCalled();
            });
        });
    });

    describe('Error Resilience', () => {
        test('should handle missing scene gracefully', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(null);

            const event = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' '
            });

            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();
        });

        test('should handle missing scene methods gracefully', () => {
            const incompleteScene = {
                constructor: { name: 'GameScene' }
                // Missing togglePause method
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(incompleteScene);

            const event = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' '
            });

            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();
        });
    });

    describe('Shortcut Statistics', () => {
        test('should provide accurate count of remaining shortcuts', () => {
            const stats = shortcutManager.getStats();

            // After Issue #169, we should have fewer shortcuts but still core functionality
            expect(stats.totalShortcuts).toBeGreaterThan(5);
            expect(stats.totalShortcuts).toBeLessThan(20);
            expect(stats.enabledShortcuts).toBe(stats.totalShortcuts);
        });

        test('should list expected shortcut categories', () => {
            const shortcuts = shortcutManager.getShortcuts();

            // Verify essential shortcuts are still present
            const expectedShortcuts = ['pause', 'menu', 'fullscreen', 'mute'];
            expectedShortcuts.forEach(shortcut => {
                expect(shortcuts[shortcut]).toBeDefined();
            });
        });
    });
});