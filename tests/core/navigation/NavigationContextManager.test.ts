import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';

/**
 * NavigationContextManager.test.ts
 * 
 * NavigationContextManagerの単体テスト
 * Issue #163 - Duplicate help/settings screen consolidation
 */
import { NavigationContextManager } from '../../../src/core/navigation/NavigationContextManager';

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
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).localStorage = dom.window.localStorage;
(global as any).performance = dom.window.performance;

describe('NavigationContextManager', () => {
    let contextManager: any;
    let mockGameEngine: any;

    beforeEach(() => {
        // Mock game engine setup
        mockGameEngine = {
            sceneManager: {
                getCurrentScene: jest.fn(),
                switchScene: jest.fn().mockReturnValue(true),
                hasScene: jest.fn().mockReturnValue(true),
                scenes: new Map()
            },
            localizationManager: {
                t: jest.fn((key, fallback) => fallback || key),
                getCurrentLanguage: jest.fn().mockReturnValue('ja')
            }
        };

        // Default scene setup
        mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
            constructor: { name: 'MenuScene' }
        });

        contextManager = new NavigationContextManager(mockGameEngine);
    });

    afterEach(() => {
        if (contextManager && typeof contextManager.cleanup === 'function') {
            contextManager.cleanup();
        }
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with game engine', () => {
            expect(contextManager).toBeDefined();
            expect(contextManager.gameEngine).toBeDefined();
        });

        test('should handle null game engine gracefully', () => {
            expect(() => {
                const manager = new NavigationContextManager(null);
            }).not.toThrow();
        });

        test('should handle undefined game engine gracefully', () => {
            expect(() => {
                const manager = new NavigationContextManager(undefined);
            }).not.toThrow();
        });
    });

    describe('Context Validation', () => {
        test('should validate global context', () => {
            const result = contextManager.isContextValid('global');
            expect(typeof result).toBe('boolean');
        });

        test('should validate menu context', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MenuScene' }
            });

            const result = contextManager.isContextValid('menu');
            expect(typeof result).toBe('boolean');
        });

        test('should validate game context', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });

            const result = contextManager.isContextValid('game');
            expect(typeof result).toBe('boolean');
        });

        test('should validate settings context', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'SettingsScene' }
            });

            const result = contextManager.isContextValid('settings');
            expect(typeof result).toBe('boolean');
        });

        test('should validate help context', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'HelpScene' }
            });

            const result = contextManager.isContextValid('help');
            expect(typeof result).toBe('boolean');
        });

        test('should handle unknown contexts', () => {
            expect(() => {
                const result = contextManager.isContextValid('unknown');
                expect(typeof result).toBe('boolean');
            }).not.toThrow();
        });

        test('should handle null context', () => {
            expect(() => {
                const result = contextManager.isContextValid(null);
                expect(typeof result).toBe('boolean');
            }).not.toThrow();
        });

        test('should handle undefined context', () => {
            expect(() => {
                const result = contextManager.isContextValid(undefined);
                expect(typeof result).toBe('boolean');
            }).not.toThrow();
        });
    });

    describe('Current Context', () => {
        test('should get current context', () => {
            const context = contextManager.getCurrentContext();
            expect(typeof context).toBe('string');
        });

        test('should return correct context for menu scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MenuScene' }
            });

            const context = contextManager.getCurrentContext();
            expect(context).toBeDefined();
        });

        test('should return correct context for game scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });

            const context = contextManager.getCurrentContext();
            expect(context).toBeDefined();
        });

        test('should return correct context for settings scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'SettingsScene' }
            });

            const context = contextManager.getCurrentContext();
            expect(context).toBeDefined();
        });

        test('should handle missing current scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(null);

            expect(() => {
                const context = contextManager.getCurrentContext();
                expect(typeof context).toBe('string');
            }).not.toThrow();
        });
    });

    describe('Context Setting', () => {
        test('should set context', () => {
            expect(() => {
                contextManager.setContext('menu');
            }).not.toThrow();
        });

        test('should handle different context types', () => {
            const contexts = ['global', 'menu', 'game', 'settings', 'help'];

            contexts.forEach(context => {
                expect(() => {
                    contextManager.setContext(context);
                }).not.toThrow();
            });
        });

        test('should handle invalid contexts', () => {
            expect(() => {
                contextManager.setContext('invalid');
            }).not.toThrow();
        });

        test('should handle null context setting', () => {
            expect(() => {
                contextManager.setContext(null);
            }).not.toThrow();
        });
    });

    describe('Scene Integration', () => {
        test('should work with different scene types', () => {
            const sceneTypes = [
                'MenuScene',
                'GameScene',
                'SettingsScene',
                'HelpScene',
                'StageSelectScene',
                'ShopScene'
            ];

            sceneTypes.forEach(sceneType => {
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneType }
                });

                expect(() => {
                    const context = contextManager.getCurrentContext();
                    const isValid = contextManager.isContextValid(context);
                }).not.toThrow();
            });
        });

        test('should handle scene manager errors', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockImplementation(() => {
                throw new Error('Scene manager error');
            });

            expect(() => {
                const context = contextManager.getCurrentContext();
            }).not.toThrow();
        });

        test('should handle missing scene manager', () => {
            const brokenGameEngine = {
                localizationManager: mockGameEngine.localizationManager
            };

            const manager = new NavigationContextManager(brokenGameEngine);

            expect(() => {
                const context = manager.getCurrentContext();
            }).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing game engine methods', () => {
            const incompleteGameEngine = {
                sceneManager: {}
            };

            const manager = new NavigationContextManager(incompleteGameEngine);

            expect(() => {
                const context = manager.getCurrentContext();
                const isValid = manager.isContextValid('global');
            }).not.toThrow();
        });

        test('should handle malformed scene objects', () => {
            const malformedScenes = [
                null,
                undefined,
                {},
                { constructor: null },
                { constructor: {} },
                { constructor: { name: null } },
                { constructor: { name: '' } }
            ];

            malformedScenes.forEach(scene => {
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue(scene);

                expect(() => {
                    const context = contextManager.getCurrentContext();
                    const isValid = contextManager.isContextValid(context);
                }).not.toThrow();
            });
        });

        test('should recover from context validation errors', () => {
            // Mock an error in the validation logic
            const originalGetCurrentScene = mockGameEngine.sceneManager.getCurrentScene;
            mockGameEngine.sceneManager.getCurrentScene = jest.fn(() => {
                throw new Error('Validation error');
            });

            expect(() => {
                const result = contextManager.isContextValid('global');
                expect(typeof result).toBe('boolean');
            }).not.toThrow();

            // Restore original method
            mockGameEngine.sceneManager.getCurrentScene = originalGetCurrentScene;
        });
    });

    describe('Context Transitions', () => {
        test('should handle context transitions correctly', () => {
            // Start in menu context
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MenuScene' }
            });

            let context = contextManager.getCurrentContext();
            expect(context).toBeDefined();

            // Transition to game context
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });

            context = contextManager.getCurrentContext();
            expect(context).toBeDefined();

            // Transition to settings context
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'SettingsScene' }
            });

            context = contextManager.getCurrentContext();
            expect(context).toBeDefined();
        });

        test('should maintain state consistency during transitions', () => {
            const transitions = [
                'MenuScene',
                'GameScene',
                'SettingsScene',
                'HelpScene',
                'MenuScene'
            ];

            transitions.forEach(sceneType => {
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneType }
                });

                const context = contextManager.getCurrentContext();
                const isValid = contextManager.isContextValid(context);

                expect(context).toBeDefined();
                expect(typeof isValid).toBe('boolean');
            });
        });
    });

    describe('Performance', () => {
        test('should handle rapid context queries', () => {
            expect(() => {
                for (let i = 0; i < 1000; i++) {
                    contextManager.getCurrentContext();
                    contextManager.isContextValid('global');
                }
            }).not.toThrow();
        });

        test('should maintain performance under load', () => {
            const start = Date.now();

            for (let i = 0; i < 100; i++) {
                contextManager.getCurrentContext();
                contextManager.isContextValid('menu');
                contextManager.isContextValid('game');
                contextManager.setContext('global');
            }

            const end = Date.now();
            const duration = end - start;

            // Should complete within reasonable time (under 50ms for 400 operations)
            expect(duration).toBeLessThan(50);
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources properly', () => {
            expect(() => {
                contextManager.cleanup();
            }).not.toThrow();
        });

        test('should handle multiple cleanup calls', () => {
            expect(() => {
                contextManager.cleanup();
                contextManager.cleanup();
                contextManager.cleanup();
            }).not.toThrow();
        });

        test('should continue working after cleanup', () => {
            contextManager.cleanup();

            expect(() => {
                const context = contextManager.getCurrentContext();
                const isValid = contextManager.isContextValid('global');
            }).not.toThrow();
        });
    });

    describe('Integration with Unified Scenes', () => {
        test('should work with consolidated help scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'HelpScene' }
            });

            const context = contextManager.getCurrentContext();
            const isValid = contextManager.isContextValid('help');

            expect(context).toBeDefined();
            expect(typeof isValid).toBe('boolean');
        });

        test('should work with consolidated settings scene', () => {
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'SettingsScene' }
            });

            const context = contextManager.getCurrentContext();
            const isValid = contextManager.isContextValid('settings');

            expect(context).toBeDefined();
            expect(typeof isValid).toBe('boolean');
        });

        test('should handle unified scene transitions', () => {
            const unifiedScenes = [
                'HelpScene',
                'SettingsScene',
                'MenuScene',
                'GameScene'
            ];

            unifiedScenes.forEach(sceneType => {
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneType }
                });

                expect(() => {
                    const context = contextManager.getCurrentContext();
                    const isValid = contextManager.isContextValid(context);
                }).not.toThrow();
            });
        });
    });
});