import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';

/**
 * KeyboardShortcutRouter-integration.test.ts
 * 
 * キーボードショートカットルーティングの統合テスト
 * Issue #163 - Duplicate help/settings screen consolidation  
 * Task 11 - Update keyboard shortcut handling to route to unified scenes
 */
import { CoreKeyboardShortcutManager } from '../../src/core/KeyboardShortcutManager';

// DOM APIのモック
(global as any).TextEncoder = class TextEncoder {
    encode(str: string) {
        return new Uint8Array(Buffer.from(str, 'utf8'));
    }
};

(global as any).TextDecoder = class TextDecoder {
    decode(bytes: Uint8Array) {
        return Buffer.from(bytes).toString('utf8');
    }
};

// JSDOM環境の設定
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).localStorage = dom.window.localStorage;
(global as any).performance = dom.window.performance;

// KeyboardEventのセットアップ
(global as any).KeyboardEvent = dom.window.KeyboardEvent;

describe('KeyboardShortcutRouter Integration Tests', () => {
    let shortcutManager: any;
    let mockGameEngine: any;

    beforeEach(() => {
        // ゲームエンジンのモックを設定
        mockGameEngine = {
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

        // デフォルトでMainMenuSceneを返すよう設定
        mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
            constructor: { name: 'MainMenuScene' }
        });

        // KeyboardShortcutManagerインスタンスを作成
        shortcutManager = new CoreKeyboardShortcutManager(mockGameEngine);
    });

    afterEach(() => {
        if (shortcutManager) {
            shortcutManager.cleanup();
        }
        jest.clearAllMocks();
    });

    describe('Unified Scene Routing', () => {
        test('should route shortcuts to unified scenes correctly', () => {
            // Escapeキーのテスト - メニューナビゲーション
            const escapeEvent = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            // GameSceneでのEscapeキー処理
            const mockGameScene = {
                constructor: { name: 'GameScene' },
                showPauseMenu: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockGameScene);

            shortcutManager.handleKeyDown(escapeEvent);
            
            // ゲームシーンでのポーズメニュー表示が呼ばれることを確認
            expect(mockGameScene.showPauseMenu).toHaveBeenCalled();
        });

        test('should handle context-dependent routing', () => {
            const contexts = [
                { scene: 'GameScene', expectedBehavior: 'pause menu' },
                { scene: 'SettingsScene', expectedBehavior: 'go back' },
                { scene: 'HelpScene', expectedBehavior: 'go back' },
                { scene: 'MainMenuScene', expectedBehavior: 'no action' }
            ];

            contexts.forEach(({ scene, expectedBehavior }) => {
                const mockScene = {
                    constructor: { name: scene },
                    showPauseMenu: jest.fn(),
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

    describe('Shortcut Context Management', () => {
        test('should maintain context state during scene transitions', () => {
            // 初期状態
            expect(shortcutManager.isEnabled).toBe(true);

            // シーン変更時もショートカットが有効であることを確認
            const mockSettingsScene = {
                constructor: { name: 'SettingsScene' }
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockSettingsScene);

            const fEvent = new KeyboardEvent('keydown', {
                code: 'KeyF',
                key: 'f'
            });

            shortcutManager.handleKeyDown(fEvent);
            expect(mockGameEngine.responsiveCanvasManager.toggleFullscreen).toHaveBeenCalled();
        });

        test('should handle navigation context correctly', () => {
            const navigationEvent = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            // 各シーンタイプでのナビゲーションテスト
            const sceneTypes = ['HelpScene', 'SettingsScene', 'GameScene'];
            
            sceneTypes.forEach(sceneType => {
                const mockScene = {
                    constructor: { name: sceneType },
                    goBack: jest.fn(),
                    showPauseMenu: jest.fn()
                };
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene);

                expect(() => {
                    shortcutManager.handleKeyDown(navigationEvent);
                }).not.toThrow();
            });
        });
    });

    describe('Routing Error Handling', () => {
        test('should handle missing scene gracefully', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(null);

            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();
        });

        test('should handle incomplete scene objects', () => {
            const incompleteScene = {
                constructor: { name: 'GameScene' }
                // showPauseMenuメソッドが存在しない
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(incompleteScene);

            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();
        });

        test('should handle scene method errors gracefully', () => {
            const errorScene = {
                constructor: { name: 'GameScene' },
                showPauseMenu: jest.fn(() => {
                    throw new Error('Test error');
                })
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(errorScene);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const event = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            expect(() => {
                shortcutManager.handleKeyDown(event);
            }).not.toThrow();

            // エラーがログに記録されることを確認
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('Integration with Unified Scenes', () => {
        test('should work with consolidated help scene', () => {
            // 統合されたヘルプシーンでの動作確認
            const unifiedHelpScene = {
                constructor: { name: 'HelpScene' },
                goBack: jest.fn(),
                handleEscape: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(unifiedHelpScene);

            const escapeEvent = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            shortcutManager.handleKeyDown(escapeEvent);

            // ユニファイされたシーンでの処理が正常に動作することを確認
            expect(() => {
                shortcutManager.handleKeyDown(escapeEvent);
            }).not.toThrow();
        });

        test('should work with consolidated settings scene', () => {
            // 統合された設定シーンでの動作確認
            const unifiedSettingsScene = {
                constructor: { name: 'SettingsScene' },
                goBack: jest.fn(),
                handleEscape: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(unifiedSettingsScene);

            const escapeEvent = new KeyboardEvent('keydown', {
                code: 'Escape',
                key: 'Escape'
            });

            expect(() => {
                shortcutManager.handleKeyDown(escapeEvent);
            }).not.toThrow();
        });
    });

    describe('Router Performance and Stability', () => {
        test('should handle rapid shortcut events', () => {
            const mockScene = {
                constructor: { name: 'GameScene' },
                showPauseMenu: jest.fn()
            };
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene);

            // 連続的なキーイベント
            for (let i = 0; i < 10; i++) {
                const event = new KeyboardEvent('keydown', {
                    code: 'Escape',
                    key: 'Escape'
                });

                expect(() => {
                    shortcutManager.handleKeyDown(event);
                }).not.toThrow();
            }

            expect(mockScene.showPauseMenu).toHaveBeenCalledTimes(10);
        });

        test('should maintain routing table consistency', () => {
            // ルーティングテーブルの一貫性確認
            const shortcuts = shortcutManager.getShortcuts();
            
            // 必要なショートカットが存在することを確認
            expect(shortcuts.menu).toBeDefined();
            expect(shortcuts.pause).toBeDefined();
            expect(shortcuts.fullscreen).toBeDefined();
            expect(shortcuts.mute).toBeDefined();

            // 削除されたショートカットが存在しないことを確認
            expect(shortcuts.settings).toBeUndefined();
            expect(shortcuts.help).toBeUndefined();
            expect(shortcuts.userInfo).toBeUndefined();
        });
    });

    describe('Cross-Scene Routing Consistency', () => {
        test('should maintain consistent behavior across scene types', () => {
            const globalShortcuts = ['fullscreen', 'mute'];
            const sceneTypes = [
                'MainMenuScene',
                'GameScene', 
                'SettingsScene',
                'HelpScene',
                'StageSelectScene'
            ];

            globalShortcuts.forEach(shortcutType => {
                sceneTypes.forEach(sceneType => {
                    const mockScene = {
                        constructor: { name: sceneType }
                    };
                    mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(mockScene);

                    let event: KeyboardEvent;
                    if (shortcutType === 'fullscreen') {
                        event = new KeyboardEvent('keydown', {
                            code: 'KeyF',
                            key: 'f'
                        });
                    } else { // mute
                        event = new KeyboardEvent('keydown', {
                            code: 'KeyM',
                            key: 'm'
                        });
                    }

                    expect(() => {
                        shortcutManager.handleKeyDown(event);
                    }).not.toThrow();
                });
            });
        });
    });

    describe('Route State Management', () => {
        test('should track routing statistics correctly', () => {
            const stats = shortcutManager.getStats();

            expect(stats).toHaveProperty('totalShortcuts');
            expect(stats).toHaveProperty('enabledShortcuts');
            expect(stats).toHaveProperty('activeKeys');
            expect(stats).toHaveProperty('isEnabled');

            expect(typeof stats.totalShortcuts).toBe('number');
            expect(typeof stats.enabledShortcuts).toBe('number');
            expect(typeof stats.activeKeys).toBe('number');
            expect(typeof stats.isEnabled).toBe('boolean');
        });

        test('should provide routing help information', () => {
            const helpText = shortcutManager.generateHelpText();

            expect(helpText).toBeDefined();
            expect(typeof helpText).toBe('object');

            // ヘルプテキストの基本構造確認
            expect(helpText['ゲーム操作']).toBeDefined();
            expect(Array.isArray(helpText['ゲーム操作'])).toBe(true);
        });
    });
});