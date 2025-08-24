import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';

/**
 * KeyboardShortcutRouter.test.ts
 * 
 * KeyboardShortcutRouterの単体テスト
 * Issue #163 - Duplicate help/settings screen consolidation
 */
import { KeyboardShortcutRouter } from '../../../src/core/navigation/KeyboardShortcutRouter';

// DOM APIのモック
const mockDocument = {
    fullscreenElement: null,
    documentElement: {
        requestFullscreen: jest.fn(),
        exitFullscreen: jest.fn()
    }
};

const mockWindow = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

// グローバル変数のモック
(global as any).document = mockDocument;
(global as any).window = mockWindow;

// TextEncoder/TextDecoder polyfill
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

// JSDOM setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).localStorage = dom.window.localStorage;
(global as any).performance = dom.window.performance;

describe('KeyboardShortcutRouter', () => {
    let shortcutRouter: any;
    let mockGameEngine: any;
    
    beforeEach(() => {
        // Mock game engine setup
        mockGameEngine = {
            sceneManager: {
                getCurrentScene: jest.fn(),
                switchScene: jest.fn().mockReturnValue(true),
                hasScene: jest.fn().mockReturnValue(true)
            },
            localizationManager: {
                t: jest.fn((key, fallback) => fallback || key),
                getCurrentLanguage: jest.fn().mockReturnValue('ja')
            }
        };

        // Mock NavigationContextManager
        const mockContextManager = {
            isContextValid: jest.fn().mockReturnValue(true),
            getCurrentContext: jest.fn().mockReturnValue('global'),
            setContext: jest.fn()
        };

        shortcutRouter = new KeyboardShortcutRouter(mockContextManager, mockGameEngine);
    });

    afterEach(() => {
        if (shortcutRouter && typeof shortcutRouter.cleanup === 'function') {
            shortcutRouter.cleanup();
        }
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with context manager and game engine', () => {
            expect(shortcutRouter).toBeDefined();
            expect(shortcutRouter.contextManager).toBeDefined();
            expect(shortcutRouter.gameEngine).toBeDefined();
        });

        test('should handle null context manager gracefully', () => {
            expect(() => {
                const router = new KeyboardShortcutRouter(null, mockGameEngine);
            }).not.toThrow();
        });

        test('should handle null game engine gracefully', () => {
            const mockContextManager = {
                isContextValid: jest.fn().mockReturnValue(true),
                getCurrentContext: jest.fn().mockReturnValue('global'),
                setContext: jest.fn()
            };

            expect(() => {
                const router = new KeyboardShortcutRouter(mockContextManager, null);
            }).not.toThrow();
        });
    });

    describe('Route Method', () => {
        test('should route shortcut data correctly', () => {
            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });

        test('should validate context before routing', () => {
            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'menu'
            };

            shortcutRouter.route(shortcutData);

            expect(shortcutRouter.contextManager.isContextValid).toHaveBeenCalledWith('menu');
        });

        test('should handle invalid context gracefully', () => {
            shortcutRouter.contextManager.isContextValid.mockReturnValue(false);

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'invalid'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });

        test('should handle missing shortcut data', () => {
            expect(() => {
                shortcutRouter.route(null);
            }).not.toThrow();

            expect(() => {
                shortcutRouter.route(undefined);
            }).not.toThrow();

            expect(() => {
                shortcutRouter.route({});
            }).not.toThrow();
        });
    });

    describe('Scene Routing', () => {
        test('should route to help scene', () => {
            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            shortcutRouter.route(shortcutData);

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });

        test('should route to settings scene', () => {
            const shortcutData = {
                id: 'settings',
                action: 'showSettings',
                context: 'global'
            };

            shortcutRouter.route(shortcutData);

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });

        test('should handle scene switch failures', () => {
            mockGameEngine.sceneManager.switchScene.mockReturnValue(false);

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });

        test('should handle scene manager errors', () => {
            mockGameEngine.sceneManager.switchScene.mockImplementation(() => {
                throw new Error('Scene switch error');
            });

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });
    });

    describe('Context Management', () => {
        test('should work with different contexts', () => {
            const contexts = ['global', 'menu', 'game', 'settings', 'help'];

            contexts.forEach(context => {
                const shortcutData = {
                    id: 'test',
                    action: 'test',
                    context: context
                };

                expect(() => {
                    shortcutRouter.route(shortcutData);
                }).not.toThrow();
            });
        });

        test('should validate context through context manager', () => {
            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'game'
            };

            shortcutRouter.route(shortcutData);

            expect(shortcutRouter.contextManager.isContextValid).toHaveBeenCalledWith('game');
        });

        test('should handle context manager errors', () => {
            shortcutRouter.contextManager.isContextValid.mockImplementation(() => {
                throw new Error('Context validation error');
            });

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });
    });

    describe('Action Handling', () => {
        test('should handle showHelp action', () => {
            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            shortcutRouter.route(shortcutData);

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });

        test('should handle showSettings action', () => {
            const shortcutData = {
                id: 'settings',
                action: 'showSettings',
                context: 'global'
            };

            shortcutRouter.route(shortcutData);

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });

        test('should handle navigate action', () => {
            const shortcutData = {
                id: 'menu',
                action: 'navigate',
                context: 'global'
            };

            shortcutRouter.route(shortcutData);

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });

        test('should handle unknown actions gracefully', () => {
            const shortcutData = {
                id: 'test',
                action: 'unknownAction',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing game engine methods', () => {
            const incompleteGameEngine = {
                sceneManager: {}
            };

            const mockContextManager = {
                isContextValid: jest.fn().mockReturnValue(true),
                getCurrentContext: jest.fn().mockReturnValue('global'),
                setContext: jest.fn()
            };

            const router = new KeyboardShortcutRouter(mockContextManager, incompleteGameEngine);

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                router.route(shortcutData);
            }).not.toThrow();
        });

        test('should handle context manager failures', () => {
            shortcutRouter.contextManager = null;

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });

        test('should handle malformed shortcut data', () => {
            const malformedData = [
                { id: '', action: '', context: '' },
                { id: null, action: null, context: null },
                { id: undefined, action: undefined, context: undefined },
                'not an object',
                123,
                true,
                []
            ];

            malformedData.forEach(data => {
                expect(() => {
                    shortcutRouter.route(data);
                }).not.toThrow();
            });
        });
    });

    describe('Integration', () => {
        test('should work with unified help scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'HelpScene' }
            });

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });

        test('should work with unified settings scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'SettingsScene' }
            });

            const shortcutData = {
                id: 'settings',
                action: 'showSettings',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });

        test('should maintain consistency across multiple routes', () => {
            const shortcuts = [
                { id: 'help', action: 'showHelp', context: 'global' },
                { id: 'settings', action: 'showSettings', context: 'global' },
                { id: 'menu', action: 'navigate', context: 'game' }
            ];

            shortcuts.forEach(shortcut => {
                expect(() => {
                    shortcutRouter.route(shortcut);
                }).not.toThrow();
            });

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledTimes(3);
        });
    });

    describe('Performance', () => {
        test('should handle rapid routing calls', () => {
            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                for (let i = 0; i < 1000; i++) {
                    shortcutRouter.route(shortcutData);
                }
            }).not.toThrow();

            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledTimes(1000);
        });

        test('should maintain performance under load', () => {
            const start = Date.now();

            for (let i = 0; i < 100; i++) {
                shortcutRouter.route({
                    id: 'help',
                    action: 'showHelp',
                    context: 'global'
                });
            }

            const end = Date.now();
            const duration = end - start;

            // Should complete within reasonable time (under 100ms for 100 calls)
            expect(duration).toBeLessThan(100);
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources properly', () => {
            expect(() => {
                shortcutRouter.cleanup();
            }).not.toThrow();
        });

        test('should handle cleanup when already cleaned', () => {
            shortcutRouter.cleanup();

            expect(() => {
                shortcutRouter.cleanup();
            }).not.toThrow();
        });

        test('should not break after cleanup', () => {
            shortcutRouter.cleanup();

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });
    });

    describe('Localization', () => {
        test('should work with different languages', () => {
            const languages = ['ja', 'en', 'ko', 'zh-CN', 'zh-TW'];

            languages.forEach(lang => {
                mockGameEngine.localizationManager.getCurrentLanguage.mockReturnValue(lang);

                const shortcutData = {
                    id: 'help',
                    action: 'showHelp',
                    context: 'global'
                };

                expect(() => {
                    shortcutRouter.route(shortcutData);
                }).not.toThrow();
            });
        });

        test('should handle localization errors', () => {
            mockGameEngine.localizationManager.t.mockImplementation(() => {
                throw new Error('Localization error');
            });

            const shortcutData = {
                id: 'help',
                action: 'showHelp',
                context: 'global'
            };

            expect(() => {
                shortcutRouter.route(shortcutData);
            }).not.toThrow();
        });
    });
});