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
        shortcutManager = new CoreKeyboardShortcutManager(mockGameEngine;
    });

    afterEach(() => {
        if (shortcutManager) {
            shortcutManager.cleanup();
        }

        // Restore console
        consoleLogSpy.mockRestore();
    });

    describe('Space Key (Pause) Still Works', () => {
        test('should toggle pause when Space is pressed during gameplay', () => {
            // Mock game scene with pause functionality
            const mockGameScene = {
                constructor: { name: 'GameScene' },
                togglePause: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene;

            // Space key press event
            const event = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' ',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify pause was triggered
            expect(mockGameScene.togglePause).toHaveBeenCalled();
        });

        test('should verify pause shortcut is still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.pause).toBeDefined();
            expect(shortcuts.pause.keys).toContain('Space');
        });
    });

    describe('Escape Key (Menu) Still Works', () => {
        test('should return to menu when Escape is pressed during gameplay', () => {
            // Mock game scene
            const mockGameScene = {
                constructor: { name: 'GameScene' }
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene;

            // Escape key press event
            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify menu switch was triggered
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });

        test('should close settings when Escape is pressed in settings screen', () => {
            // Mock scene with settings showing
            const mockScene = {
                constructor: { name: 'MainMenuScene' },
                showingSettings: true,
                closeSettings: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene;

            // Escape key press event
            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify settings close was triggered
            expect(mockScene.closeSettings).toHaveBeenCalled();
        });

        test('should verify menu shortcut is still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.menu).toBeDefined();
            expect(shortcuts.menu.keys).toContain('Escape');
        });
    });

    describe('F Key (Fullscreen) Still Works', () => {
        test('should toggle fullscreen when F is pressed', () => {
            // F key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyF',
                key: 'f',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify fullscreen toggle was triggered
            expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).toHaveBeenCalled();
        });

        test('should verify fullscreen shortcut is still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.fullscreen).toBeDefined();
            expect(shortcuts.fullscreen.keys).toContain('KeyF');
        });
    });

    describe('M Key (Mute) Still Works', () => {
        test('should toggle mute when M is pressed', () => {
            // M key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyM',
                key: 'm',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify mute toggle was triggered
            expect(mockGameEngine.audioManager.toggleMute).toHaveBeenCalled();
        });

        test('should update settings when mute is toggled', () => {
            // Mock mute returning true (muted)
            mockGameEngine.audioManager.toggleMute.mockReturnValue(true;

            // M key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyM',
                key: 'm',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify settings were updated
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('isMuted', true);
        });

        test('should verify mute shortcut is still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.mute).toBeDefined();
            expect(shortcuts.mute.keys).toContain('KeyM');
        });
    });

    describe('F1 Key (Contextual Help) Still Works', () => {
        test('should open contextual help when F1 is pressed', () => {
            // Mock current scene
            const mockScene = {
                constructor: { name: 'MainMenuScene' }
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene;

            // F1 key press event
            const event = new KeyboardEvent('keydown', {
                code: 'F1',
                key: 'F1',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify help scene switch was triggered with contextual data
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help', 
                expect.objectContaining({
                    accessMethod: 'keyboard_f1',
                    sourceScene: 'MainMenuScene',
                    contextual: true
                })
            );
        });

        test('should verify contextual help shortcut is still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.contextualHelp).toBeDefined();
            expect(shortcuts.contextualHelp.keys).toContain('F1');
        });
    });

    describe('Ctrl+H Keys (Documentation Help) Still Works', () => {
        test('should open documentation help when Ctrl+H is pressed', () => {
            // Mock current scene
            const mockScene = {
                constructor: { name: 'GameScene' }
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene;

            // Ctrl+H key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyH',
                key: 'h',
                ctrlKey: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify help scene switch was triggered with documentation data
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help', 
                expect.objectContaining({
                    accessMethod: 'keyboard_ctrl_h',
                    sourceScene: 'GameScene',
                    documentation: true
                })
            );
        });

        test('should verify documentation help shortcut is still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            expect(shortcuts.documentationHelp).toBeDefined();
            expect(shortcuts.documentationHelp.keys).toContain('ControlLeft+KeyH');
        });
    });

    describe('Game Control Shortcuts Still Work', () => {
        test('should handle give up (G key) in game scene', () => {
            // Mock game scene with give up functionality
            const mockGameScene = {
                constructor: { name: 'GameScene' },
                giveUp: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene;

            // G key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyG',
                key: 'g',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify give up was triggered (confirm dialog was shown)
            expect(global.confirm).toHaveBeenCalledWith('ゲームを終了しますか？');
            expect(mockGameScene.giveUp).toHaveBeenCalled();
        });

        test('should handle restart (R key) in game scene', () => {
            // Mock game scene with restart functionality
            const mockGameScene = {
                constructor: { name: 'GameScene' },
                restart: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene;

            // R key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyR',
                key: 'r',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify restart was triggered (confirm dialog was shown)
            expect(global.confirm).toHaveBeenCalledWith('ゲームを再開始しますか？');
            expect(mockGameScene.restart).toHaveBeenCalled();
        });
    });

    describe('Volume Control Shortcuts Still Work', () => {
        test('should increase volume with Ctrl+Up arrow', () => {
            // Mock initial volume
            mockGameEngine.settingsManager.get.mockReturnValue(0.5);

            // Ctrl+Up arrow key press event
            const event = new KeyboardEvent('keydown', {
                code: 'ArrowUp',
                key: 'ArrowUp',
                ctrlKey: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify volume was increased
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.6);
        });

        test('should decrease volume with Ctrl+Down arrow', () => {
            // Mock initial volume
            mockGameEngine.settingsManager.get.mockReturnValue(0.5);

            // Ctrl+Down arrow key press event
            const event = new KeyboardEvent('keydown', {
                code: 'ArrowDown',
                key: 'ArrowDown',
                ctrlKey: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify volume was decreased
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('masterVolume', 0.4);
        });
    });

    describe('Debug Shortcuts Still Work', () => {
        test('should show debug info with F12 key', () => {
            // Enable debug mode
            mockGameEngine.isDebugMode.mockReturnValue(true;

            // Mock current scene
            const mockScene = {
                constructor: { name: 'GameScene' }
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene;

            // F12 key press event
            const event = new KeyboardEvent('keydown', {
                code: 'F12',
                key: 'F12',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify debug info was logged
            expect(consoleLogSpy).toHaveBeenCalledWith('Debug info:', expect.objectContaining({
                scene: 'GameScene',
                performance: expect.any(Object,
                settings: undefined
            }));
        });

        test('should toggle debug mode with Ctrl+Shift+D', () => {
            // Mock localStorage
            localStorage.setItem('debug', 'false');

            // Mock confirm for reload
            global.confirm.mockReturnValue(false; // Don't reload for test

            // Ctrl+Shift+D key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyD',
                key: 'd',
                ctrlKey: true,
                shiftKey: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify debug mode was toggled
            expect(localStorage.getItem('debug')).toBe('true');
            expect(consoleLogSpy).toHaveBeenCalledWith('Debug mode:', 'enabled');
        });
    });

    describe('Accessibility Shortcuts Still Work', () => {
        test('should toggle high contrast with Ctrl+Alt+H', () => {
            // Mock current setting
            mockGameEngine.settingsManager.get.mockReturnValue(false;

            // Ctrl+Alt+H key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyH',
                key: 'h',
                ctrlKey: true,
                altKey: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify accessibility setting was toggled
            expect(mockGameEngine.settingsManager.set).toHaveBeenCalledWith('accessibility.highContrast', true);
        });
    });

    describe('All Remaining Shortcuts Are Registered', () => {
        test('should have all expected shortcuts registered after removal', () => {
            const shortcuts = shortcutManager.getShortcuts();
            
            // Essential game controls
            expect(shortcuts.pause).toBeDefined();
            expect(shortcuts.menu).toBeDefined();
            expect(shortcuts.fullscreen).toBeDefined();
            expect(shortcuts.mute).toBeDefined();
            
            // Help shortcuts (non-removed ones)
            expect(shortcuts.contextualHelp).toBeDefined();
            expect(shortcuts.documentationHelp).toBeDefined();
            
            // Game controls
            expect(shortcuts.giveUp).toBeDefined();
            expect(shortcuts.restart).toBeDefined();
            
            // Volume controls
            expect(shortcuts.volumeUp).toBeDefined();
            expect(shortcuts.volumeDown).toBeDefined();
            
            // Debug controls
            expect(shortcuts.debug).toBeDefined();
            expect(shortcuts.debugToggle).toBeDefined();
            
            // Accessibility controls
            expect(shortcuts.highContrast).toBeDefined();
            expect(shortcuts.largeText).toBeDefined();
            expect(shortcuts.reducedMotion).toBeDefined();
        });

        test('should verify that only removed shortcuts are missing', () => {
            const shortcuts = shortcutManager.getShortcuts();
            
            // Specifically verify only the three removed shortcuts are missing
            expect(shortcuts.settings).toBeUndefined();
            expect(shortcuts.help).toBeUndefined();
            expect(shortcuts.userInfo).toBeUndefined();
            
            // All others should be present
            const expectedShortcuts = [
                'pause', 'menu', 'fullscreen', 'mute',
                'contextualHelp', 'documentationHelp',
                'giveUp', 'restart',
                'volumeUp', 'volumeDown',
                'debug', 'debugToggle',
                'highContrast', 'largeText', 'reducedMotion'
            ];
            
            expectedShortcuts.forEach(shortcut => {
                expect(shortcuts[shortcut]).toBeDefined();
            });
        });
    });
});