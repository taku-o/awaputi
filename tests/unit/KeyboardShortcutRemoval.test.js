/**
 * Tests for keyboard shortcut removal (Issue #170)
 * Verifies that removed keyboard shortcuts no longer trigger any functionality
 */

import { CoreKeyboardShortcutManager } from '../../src/core/KeyboardShortcutManager.js';

// モックの作成
const mockGameEngine = {
    settingsManager: {
        get: jest.fn(),
        set: jest.fn()
    },
    audioManager: {
        toggleMute: jest.fn()
    },
    responsiveCanvasManager: {
        toggleFullscreen: jest.fn()
    },
    sceneManager: {
        getCurrentScene: jest.fn()
    },
    isDebugMode: jest.fn(() => false)
};

const mockErrorHandler = {
    handleError: jest.fn()
};

// モジュールのモック
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
}));

describe('Keyboard Shortcut Removal (Issue #170)', () => {
    let keyboardManager;

    beforeEach(() => {
        // DOM環境をセットアップ
        document.body.innerHTML = '';
        
        // モックをリセット
        jest.clearAllMocks();
        mockGameEngine.settingsManager.get.mockReturnValue(0.5);
        
        keyboardManager = new CoreKeyboardShortcutManager(mockGameEngine);
    });

    afterEach(() => {
        if (keyboardManager) {
            keyboardManager.cleanup();
        }
    });

    describe('Removed Fullscreen Shortcut (F key)', () => {
        test('should not have fullscreen shortcut registered', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.fullscreen).toBeUndefined();
        });

        test('should not trigger fullscreen on F key press', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyF', 
                key: 'f',
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).not.toHaveBeenCalled();
        });

        test('should not have handleFullscreen method', () => {
            expect(keyboardManager.handleFullscreen).toBeUndefined();
        });
    });

    describe('Removed Mute Shortcut (M key)', () => {
        test('should not have mute shortcut registered', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.mute).toBeUndefined();
        });

        test('should not trigger mute on M key press', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyM', 
                key: 'm',
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.audioManager.toggleMute).not.toHaveBeenCalled();
        });

        test('should not have handleMute method', () => {
            expect(keyboardManager.handleMute).toBeUndefined();
        });
    });

    describe('Removed Volume Control Shortcuts (Ctrl+↑/↓)', () => {
        test('should not have volume shortcuts registered', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.volumeUp).toBeUndefined();
            expect(shortcuts.volumeDown).toBeUndefined();
        });

        test('should not trigger volume up on Ctrl+↑', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'ArrowUp',
                key: 'ArrowUp',
                ctrlKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalledWith(
                'masterVolume', 
                expect.any(Number)
            );
        });

        test('should not trigger volume down on Ctrl+↓', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'ArrowDown',
                key: 'ArrowDown',
                ctrlKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalledWith(
                'masterVolume', 
                expect.any(Number)
            );
        });

        test('should not have volume handler methods', () => {
            expect(keyboardManager.handleVolumeUp).toBeUndefined();
            expect(keyboardManager.handleVolumeDown).toBeUndefined();
        });
    });

    describe('Removed Accessibility Shortcuts (Ctrl+Alt+H/T/M)', () => {
        test('should not have accessibility shortcuts registered', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.highContrast).toBeUndefined();
            expect(shortcuts.largeText).toBeUndefined();
            expect(shortcuts.reducedMotion).toBeUndefined();
        });

        test('should not trigger high contrast on Ctrl+Alt+H', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyH',
                key: 'h',
                ctrlKey: true,
                altKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalledWith(
                'accessibility.highContrast', 
                expect.any(Boolean)
            );
        });

        test('should not trigger large text on Ctrl+Alt+T', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyT',
                key: 't',
                ctrlKey: true,
                altKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalledWith(
                'accessibility.largeText', 
                expect.any(Boolean)
            );
        });

        test('should not trigger reduced motion on Ctrl+Alt+M', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyM',
                key: 'm',
                ctrlKey: true,
                altKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalledWith(
                'accessibility.reducedMotion', 
                expect.any(Boolean)
            );
        });

        test('should not have accessibility handler methods', () => {
            expect(keyboardManager.handleHighContrast).toBeUndefined();
            expect(keyboardManager.handleLargeText).toBeUndefined();
            expect(keyboardManager.handleReducedMotion).toBeUndefined();
        });
    });

    describe('Removed Settings Management Shortcuts (Ctrl+P/E/I)', () => {
        test('should not have settings management shortcuts registered', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.profileSwitch).toBeUndefined();
            expect(shortcuts.exportSettings).toBeUndefined();
            expect(shortcuts.importSettings).toBeUndefined();
        });

        test('should not trigger profile switch on Ctrl+P', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyP',
                key: 'p',
                ctrlKey: true,
                bubbles: true 
            });
            
            // 何らかの設定処理が呼び出されないことを確認
            document.dispatchEvent(keyEvent);
            
            // プロファイル切り替え関連のメソッドが呼ばれていないことを確認
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalledWith(
                expect.stringMatching(/profile/i), 
                expect.any(String)
            );
        });

        test('should not trigger export on Ctrl+E', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyE',
                key: 'e',
                ctrlKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            // エクスポート処理が呼ばれていないことを確認
            // (実際の実装では外部のエクスポート処理を監視)
        });

        test('should not trigger import on Ctrl+I', () => {
            const keyEvent = new KeyboardEvent('keydown', { 
                code: 'KeyI',
                key: 'i',
                ctrlKey: true,
                bubbles: true 
            });
            
            document.dispatchEvent(keyEvent);
            
            // インポート処理が呼ばれていないことを確認
            // (実際の実装では外部のインポート処理を監視)
        });
    });

    describe('Remaining Valid Shortcuts', () => {
        test('should still have pause shortcut (Space)', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.pause).toBeDefined();
            expect(shortcuts.pause.keys).toContain('Space');
        });

        test('should still have menu shortcut (Escape)', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.menu).toBeDefined();
            expect(shortcuts.menu.keys).toContain('Escape');
        });

        test('should still have contextual help (F1)', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.contextualHelp).toBeDefined();
            expect(shortcuts.contextualHelp.keys).toContain('F1');
        });

        test('should still have documentation help (Ctrl+H)', () => {
            const shortcuts = keyboardManager.getShortcuts();
            expect(shortcuts.documentationHelp).toBeDefined();
            expect(shortcuts.documentationHelp.keys).toContain('ControlLeft+KeyH');
        });
    });

    describe('Help Text Generation', () => {
        test('should not include removed shortcuts in help text', () => {
            const helpSections = keyboardManager.generateHelpText();
            const allHelpText = Object.values(helpSections).flat().join(' ');
            
            // 削除されたショートカットが含まれていないことを確認
            expect(allHelpText).not.toMatch(/KeyF|fullscreen/i);
            expect(allHelpText).not.toMatch(/KeyM.*mute/i);
            expect(allHelpText).not.toMatch(/Ctrl.*↑.*volume/i);
            expect(allHelpText).not.toMatch(/Ctrl.*↓.*volume/i);
            expect(allHelpText).not.toMatch(/Ctrl.*Alt.*H.*contrast/i);
            expect(allHelpText).not.toMatch(/Ctrl.*Alt.*T.*text/i);
            expect(allHelpText).not.toMatch(/Ctrl.*Alt.*M.*motion/i);
        });

        test('should still include valid shortcuts in help text', () => {
            const helpSections = keyboardManager.generateHelpText();
            const allHelpText = Object.values(helpSections).flat().join(' ');
            
            // 残っているショートカットが含まれていることを確認
            expect(allHelpText).toMatch(/Space.*pause/i);
            expect(allHelpText).toMatch(/Escape.*menu/i);
            expect(allHelpText).toMatch(/F1.*help/i);
        });
    });

    describe('Statistics and Shortcut Counting', () => {
        test('should have correct number of remaining shortcuts', () => {
            const stats = keyboardManager.getStats();
            const shortcuts = keyboardManager.getShortcuts();
            
            // 削除により、ショートカット数が減っていることを確認
            expect(stats.totalShortcuts).toBeLessThan(10);
            expect(stats.enabledShortcuts).toBeLessThan(10);
            
            // 削除されたショートカットが含まれていないことを確認
            const shortcutNames = Object.keys(shortcuts);
            expect(shortcutNames).not.toContain('fullscreen');
            expect(shortcutNames).not.toContain('mute');
            expect(shortcutNames).not.toContain('volumeUp');
            expect(shortcutNames).not.toContain('volumeDown');
            expect(shortcutNames).not.toContain('highContrast');
            expect(shortcutNames).not.toContain('largeText');
            expect(shortcutNames).not.toContain('reducedMotion');
        });
    });

    describe('Complex Key Combinations', () => {
        test('should not trigger any removed shortcuts with complex combinations', () => {
            // 複数の修飾キーの組み合わせをテスト
            const complexEvents = [
                { code: 'KeyF', key: 'f', ctrlKey: true },
                { code: 'KeyM', key: 'm', shiftKey: true },
                { code: 'ArrowUp', key: 'ArrowUp', ctrlKey: true, shiftKey: true },
                { code: 'KeyH', key: 'h', ctrlKey: true, altKey: true, shiftKey: true }
            ];

            complexEvents.forEach(eventProps => {
                const keyEvent = new KeyboardEvent('keydown', { 
                    ...eventProps,
                    bubbles: true 
                });
                
                document.dispatchEvent(keyEvent);
            });

            // いずれの組み合わせでも削除された機能が呼ばれないことを確認
            expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).not.toHaveBeenCalled();
            expect(mockGameEngine.audioManager.toggleMute).not.toHaveBeenCalled();
            expect(mockGameEngine.settingsManager.set).not.toHaveBeenCalled();
        });
    });
});