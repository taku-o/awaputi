import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * KeyboardShortcutRouter-integration.test.js
 * 
 * キーボードショートカットルーティングの統合テスト
 * Issue #163 - Duplicate help/settings screen consolidation  
 * Task 11 - Update keyboard shortcut handling to route to unified scenes
 */
import { CoreKeyboardShortcutManager  } from '../../src/core/KeyboardShortcutManager';
// DOM APIのモック
const mockDocument = {
    addEventListener: jest.fn(
        removeEventListener: jest.fn( },
// Window APIのモック
const mockWindow = {
    addEventListener: jest.fn(
        removeEventListener: jest.fn( },
// グローバル変数のモック
(global: any).document = mockDocument,
(global as any').window = mockWindow;'
describe('KeyboardShortcut Router Integration', () => {
    let keyboardManager: any,
    let mockGameEngine: any,
    let mockSceneManager: any,
    
    beforeEach(() => {
        // Mock SceneManager
        mockSceneManager = {
            switchScene: jest.fn().mockReturnValue(true),
           , getCurrentScene: jest.fn(').mockReturnValue({'
                constructor: { name: 'TestScene' },
    };
        };
        
        // Mock GameEngine
        mockGameEngine = {
            sceneManager: mockSceneManager,
            settingsManager: {
                get: jest.fn(
        set: jest.fn( },
            responsiveCanvasManager: {
                toggleFullscreen: jest.fn( },
            audioManager: {
                toggleMute: jest.fn().mockReturnValue(false
            );
            performanceStats: {,
            isDebugMode: jest.fn().mockReturnValue(false),
            isDebugMode: jest.fn().mockReturnValue(false),
        };
        keyboardManager = new CoreKeyboardShortcutManager(mockGameEngine) };
    afterEach(() => {
        if (keyboardManager && keyboardManager.cleanup) {
            keyboardManager.cleanup() }
        jest.clearAllMocks();
    }');'
    describe('Settings Shortcut Integration', (') => {'
        test('should route S key to unified SettingsScene', () => {
            keyboardManager.handleSettings();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('settings', {'
                accessMethod: 'keyboard_s',
                sourceScene: 'TestScene' }');'
        }
        test('should handle settings shortcut failure gracefully', () => {
            mockSceneManager.switchScene.mockReturnValue(false);
            mockSceneManager.getCurrentScene.mockReturnValue({);
                openSettings: jest.fn( }');'
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            keyboardManager.handleSettings();
            expect(mockSceneManager.switchScene).toHaveBeenCalled();
            expect(consoleSpy').toHaveBeenCalledWith('Settings scene navigation failed and no fallback available');'
            consoleSpy.mockRestore();
        }');'
        test('should use fallback method when scene switch fails', () => {
            const mockOpenSettings = jest.fn() as jest.Mock,
            mockSceneManager.switchScene.mockReturnValue(false);
            mockSceneManager.getCurrentScene.mockReturnValue({
                openSettings: mockOpenSettings,);
            keyboardManager.handleSettings();
            expect(mockOpenSettings).toHaveBeenCalled();
        }');'
    }
    describe('Help Shortcut Integration', (') => {'
        test('should route H key to unified HelpScene', () => {
            keyboardManager.handleHelp();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('help', {'
                accessMethod: 'keyboard_h',
                sourceScene: 'TestScene',
                standard: true,');'
        }
        test('should handle help shortcut failure gracefully', () => {
            mockSceneManager.switchScene.mockReturnValue(false);
            mockSceneManager.getCurrentScene.mockReturnValue({);
                showControlsHelp: jest.fn( }');'
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            keyboardManager.handleHelp();
            expect(mockSceneManager.switchScene).toHaveBeenCalled();
            expect(consoleSpy').toHaveBeenCalledWith('Help scene navigation failed and no fallback available');'
            consoleSpy.mockRestore();
        }');'
    }
    describe('Contextual Help Shortcut (F1')', (') => {
        test('should route F1 key to contextual help mode', () => {
            keyboardManager.handleContextualHelp();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('help', {'
                accessMethod: 'keyboard_f1',
                sourceScene: 'TestScene',
                contextual: true,');'
        }
        test('should fallback to standard help when contextual fails', () => {
            mockSceneManager.switchScene.mockReturnValueOnce(false.mockReturnValueOnce(true)'),'
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            keyboardManager.handleContextualHelp();
            expect(mockSceneManager.switchScene).toHaveBeenCalledTimes(2);
            expect(consoleSpy').toHaveBeenCalledWith('Contextual help navigation failed, falling back to standard help');'
            consoleSpy.mockRestore();
        }');'
    }
    describe('Documentation Help Shortcut (Ctrl+H')', (') => {
        test('should route Ctrl+H to documentation help mode', () => {
            keyboardManager.handleDocumentationHelp();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('help', {'
                accessMethod: 'keyboard_ctrl_h',
                sourceScene: 'TestScene',
                documentation: true,');'
        }
        test('should fallback to standard help when documentation fails', () => {
            mockSceneManager.switchScene.mockReturnValueOnce(false.mockReturnValueOnce(true)'),'
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            keyboardManager.handleDocumentationHelp();
            expect(mockSceneManager.switchScene).toHaveBeenCalledTimes(2);
            expect(consoleSpy').toHaveBeenCalledWith('Documentation help navigation failed, falling back to standard help');'
            consoleSpy.mockRestore();
        }');'
    }
    describe('Error Handling', (') => {'
        test('should handle errors in settings navigation', () => {
            mockSceneManager.switchScene.mockImplementation((') => {'
                throw new Error('Scene switch error') }');'
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            keyboardManager.handleSettings();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Failed to open settings:', expect.any(Error);'
            consoleSpy.mockRestore();
        }');'
        test('should handle errors in help navigation', () => {
            mockSceneManager.switchScene.mockImplementation((') => {'
                throw new Error('Scene switch error') }');'
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            keyboardManager.handleHelp();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Failed to open help:', expect.any(Error);'
            consoleSpy.mockRestore();
        }');'
        test('should handle errors in contextual help navigation', () => {
            mockSceneManager.switchScene.mockImplementation((') => {'
                throw new Error('Scene switch error') }');'
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            keyboardManager.handleContextualHelp();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Failed to open contextual help:', expect.any(Error);'
            consoleSpy.mockRestore();
        }');'
    }
    describe('Default Shortcut Registration', (') => {'
        test('should register all expected shortcuts', (') => {'
            expect(keyboardManager.shortcuts.has('settings').toBe(true'),'
            expect(keyboardManager.shortcuts.has('help').toBe(true'),'
            expect(keyboardManager.shortcuts.has('contextualHelp').toBe(true'),'
            expect(keyboardManager.shortcuts.has('documentationHelp').toBe(true) }');'
        test('should have correct key mappings for shortcuts', (') => {'
            const settingsShortcut = keyboardManager.shortcuts.get('settings');
            const helpShortcut = keyboardManager.shortcuts.get('help');
            const contextualHelpShortcut = keyboardManager.shortcuts.get('contextualHelp');
            const documentationHelpShortcut = keyboardManager.shortcuts.get('documentationHelp');
            expect(settingsShortcut.keys').toContain('KeyS'),'
            expect(helpShortcut.keys').toContain('KeyH'),'
            expect(contextualHelpShortcut.keys').toContain('F1'),'
            expect(documentationHelpShortcut.keys').toContain('ControlLeft+KeyH') }');
    }
    describe('Scene Context Management', (') => {'
        test('should provide proper context data for settings navigation', (') => {'
            mockSceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' },
            };
            keyboardManager.handleSettings();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('settings', {'
                accessMethod: 'keyboard_s',
                sourceScene: 'GameScene' }');'
        }
        test('should handle missing scene constructor gracefully', () => {
            mockSceneManager.getCurrentScene.mockReturnValue({};
            keyboardManager.handleHelp();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('help', {'
                accessMethod: 'keyboard_h',
                sourceScene: 'unknown',
                standard: true,');'
        }
        test('should handle null current scene gracefully', () => {
            mockSceneManager.getCurrentScene.mockReturnValue(null);
            keyboardManager.handleSettings();
            expect(mockSceneManager.switchScene').toHaveBeenCalledWith('settings', {'
                accessMethod: 'keyboard_s',
                sourceScene: 'unknown' },
        }
    }');'
    describe('Logging and Debugging', (') => {'
        test('should log successful settings navigation', (') => {'
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            keyboardManager.handleSettings();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Settings opened via keyboard shortcut');'
            consoleSpy.mockRestore();
        }');'
        test('should log successful help navigation', (') => {'
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            keyboardManager.handleHelp();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Help opened via keyboard shortcut');'
            consoleSpy.mockRestore();
        }');'
        test('should log successful contextual help navigation', (') => {'
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            keyboardManager.handleContextualHelp();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Contextual help opened via F1 key');'
            consoleSpy.mockRestore();
        }');'
        test('should log successful documentation help navigation', (') => {'
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            keyboardManager.handleDocumentationHelp();
            expect(consoleSpy').toHaveBeenCalledWith('[KeyboardShortcutManager] Documentation help opened via Ctrl+H keys');'
            consoleSpy.mockRestore();
        };
    }
}');'