/**
 * CoreKeyboardShortcutManager - Removed Shortcuts Tests
 * Issue #169対応 - 削除されたショートカット（S、H、I）のテスト
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
            constructor: { name: 'GameScene' },
            togglePause: jest.fn(),
            closeSettings: jest.fn(),
            showingSettings: false
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
    let consoleLogSpy: any;
    let consoleWarnSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        // Console spies
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

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
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Removed Shortcuts Verification', () => {
        test('should NOT respond to S key press (settings shortcut removed)', () => {
            // S key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyS',
                key: 's',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Mock current scene
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MainMenuScene' },
                openSettings: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify no settings action was triggered
            expect(mockGameEngine.sceneManager.switchScene).not.toHaveBeenCalledWith('settings', expect.any(Object);
            expect(mockGameEngine.sceneManager.getCurrentScene().openSettings).not.toHaveBeenCalled();
        });

        test('should NOT respond to H key press (help shortcut removed)', () => {
            // H key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyH',
                key: 'h',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Mock current scene
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MainMenuScene' },
                showControlsHelp: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify no help action was triggered
            expect(mockGameEngine.sceneManager.switchScene).not.toHaveBeenCalledWith('help', expect.any(Object);
            expect(mockGameEngine.sceneManager.getCurrentScene().showControlsHelp).not.toHaveBeenCalled();
        });

        test('should NOT respond to I key press (userInfo shortcut removed)', () => {
            // I key press event
            const event = new KeyboardEvent('keydown', {
                code: 'KeyI',
                key: 'i',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Mock current scene
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MainMenuScene' },
                openUserInfo: jest.fn()
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify no user info action was triggered
            expect(mockGameEngine.sceneManager.getCurrentScene().openUserInfo).not.toHaveBeenCalled();
        });

        test('should verify removed handler methods no longer exist', () => {
            // Verify methods are not defined
            expect(shortcutManager.handleSettings).toBeUndefined();
            expect(shortcutManager.handleHelp).toBeUndefined();
            expect(shortcutManager.handleUserInfo).toBeUndefined();
        });

        test('should verify removed shortcuts are not registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            
            // Verify S, H, I shortcuts are not registered
            expect(shortcuts.settings).toBeUndefined();
            expect(shortcuts.help).toBeUndefined();
            expect(shortcuts.userInfo).toBeUndefined();
        });
    });

    describe('Remaining Shortcuts Still Work', () => {
        test('should still respond to Space key (pause functionality)', () => {
            // Space key press event
            const event = new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' ',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Mock current scene with pause functionality
            const mockScene = {
                constructor: { name: 'GameScene' },
                togglePause: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene;

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify pause was triggered
            expect(mockScene.togglePause).toHaveBeenCalled();
        });

        test('should still respond to Escape key (menu functionality)', () => {
            // Escape key press event
            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            });

            // Mock current scene
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });

            // Simulate key press
            shortcutManager.handleKeyDown(event;

            // Verify menu switch was triggered
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });

        test('should still respond to F key (fullscreen functionality)', () => {
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

        test('should verify remaining shortcuts are still registered', () => {
            const shortcuts = shortcutManager.getShortcuts();
            
            // Verify essential shortcuts still exist
            expect(shortcuts.pause).toBeDefined();
            expect(shortcuts.menu).toBeDefined();
            expect(shortcuts.fullscreen).toBeDefined();
            expect(shortcuts.mute).toBeDefined();
        });
    });

    describe('Help Text Generation Excludes Removed Shortcuts', () => {
        test('should not include removed shortcuts in generated help text', () => {
            const helpText = shortcutManager.generateHelpText();
            
            // Convert all help sections to a single string for easy searching
            const allHelpText = Object.values(helpText
                .flat()
                .join(' ')
                .toLowerCase();

            // Verify S, H, I shortcuts are not mentioned
            expect(allHelpText).not.toMatch(/keys?\s*s[:\s]/); // "Key S:" or "Keys S:"
            expect(allHelpText).not.toMatch(/keys?\s*h[:\s]/); // "Key H:" or "Keys H:"
            expect(allHelpText).not.toMatch(/keys?\s*i[:\s]/); // "Key I:" or "Keys I:"
            
            // Verify settings, help, userInfo are not mentioned
            expect(allHelpText).not.toMatch(/settings|設定/);
            expect(allHelpText).not.toMatch(/help|ヘルプ/);
            expect(allHelpText).not.toMatch(/user\s*info|ユーザー情報/);
        });

        test('should include remaining shortcuts in generated help text', () => {
            const helpText = shortcutManager.generateHelpText();
            
            // Convert all help sections to a single string for easy searching
            const allHelpText = Object.values(helpText
                .flat()
                .join(' ')
                .toLowerCase();

            // Verify remaining essential shortcuts are mentioned
            expect(allHelpText).toMatch(/space|スペース/); // Pause
            expect(allHelpText).toMatch(/escape|エスケープ/); // Menu
            expect(allHelpText).toMatch(/f(?![a-z])|f\s/); // Fullscreen (F key but not part of other words)
        });
    });

    describe('No Console Errors for Removed Shortcuts', () => {
        test('should not generate console errors when removed keys are pressed', () => {
            // Test S key
            const sEvent = new KeyboardEvent('keydown', {
                code: 'KeyS',
                key: 's'
            });
            shortcutManager.handleKeyDown(sEvent;

            // Test H key  
            const hEvent = new KeyboardEvent('keydown', {
                code: 'KeyH',
                key: 'h'
            });
            shortcutManager.handleKeyDown(hEvent;

            // Test I key
            const iEvent = new KeyboardEvent('keydown', {
                code: 'KeyI',
                key: 'i'
            });
            shortcutManager.handleKeyDown(iEvent;

            // Verify no console errors were generated
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('KeyboardShortcutManager Initialization', () => {
        test('should initialize without errors after shortcut removal', () => {
            // This test verifies that removing shortcuts doesn't break initialization
            expect(shortcutManager).toBeInstanceOf(CoreKeyboardShortcutManager;
            expect(shortcutManager.shortcuts).toBeInstanceOf(Map;
            expect(shortcutManager.isEnabled).toBe(true);
        });

        test('should have fewer total shortcuts after removal', () => {
            const shortcuts = shortcutManager.getShortcuts();
            const stats = shortcutManager.getStats();
            
            // Should have fewer shortcuts than before (originally had settings, help, userInfo)
            // This is a regression test to ensure removal actually reduced the count
            expect(stats.totalShortcuts).toBeLessThan(20); // Arbitrary reasonable upper bound
            
            // Specifically verify the count doesn't include removed shortcuts
            const shortcutNames = Object.keys(shortcuts;
            expect(shortcutNames).not.toContain('settings');
            expect(shortcutNames).not.toContain('help');
            expect(shortcutNames).not.toContain('userInfo');
        });
    });
});