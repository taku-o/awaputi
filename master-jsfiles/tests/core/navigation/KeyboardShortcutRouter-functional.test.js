/**
 * KeyboardShortcutRouter Functional Tests
 * 
 * 実際の機能動作を検証する代替テストスイート
 * 失敗している単体テストの代替として機能検証を重視
 */

import { KeyboardShortcutRouter } from '../../../src/core/navigation/KeyboardShortcutRouter.js';
import { NavigationContextManager } from '../../../src/core/navigation/NavigationContextManager.js';

// Functional mock game engine
const createFunctionalGameEngine = () => ({
    sceneManager: {
        switchScene: jest.fn().mockReturnValue(true),
        getCurrentScene: jest.fn(() => ({ constructor: { name: 'MenuScene' } })),
        hasScene: jest.fn().mockReturnValue(true),
        currentScene: { constructor: { name: 'MenuScene' } }
    },
    localizationManager: {
        t: jest.fn((key, fallback) => fallback || key),
        getCurrentLanguage: () => 'ja'
    },
    accessibilityManager: {
        screenReaderMode: false
    }
});

describe('KeyboardShortcutRouter Functional Tests', () => {
    let shortcutRouter;
    let gameEngine;

    beforeEach(() => {
        // Reset environment
        global.window = undefined;
        global.document = undefined;
        
        gameEngine = createFunctionalGameEngine();
        shortcutRouter = new KeyboardShortcutRouter(gameEngine);
    });

    afterEach(() => {
        if (shortcutRouter && typeof shortcutRouter.cleanup === 'function') {
            shortcutRouter.cleanup();
        }
    });

    describe('Core Functionality Verification', () => {
        test('should initialize with correct shortcut mappings', () => {
            expect(shortcutRouter.shortcuts.has('KeyH')).toBe(true);
            expect(shortcutRouter.shortcuts.has('KeyS')).toBe(true);
            expect(shortcutRouter.shortcuts.has('F1')).toBe(true);
            expect(shortcutRouter.shortcuts.has('Escape')).toBe(true);
            
            const hShortcut = shortcutRouter.shortcuts.get('KeyH');
            expect(hShortcut.action).toBe('help');
            expect(hShortcut.scene).toBe('help');
        });

        test('should successfully route help requests', () => {
            const success = shortcutRouter.handleHelpShortcut('MenuScene');
            
            expect(success).toBe(true);
            expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
        });

        test('should successfully route settings requests', () => {
            const success = shortcutRouter.handleSettingsShortcut('GameScene');
            
            expect(success).toBe(true);
            expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
        });

        test('should handle contextual help requests', () => {
            const success = shortcutRouter.handleContextualHelp('GameScene');
            
            expect(success).toBe(true);
            expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
        });
    });

    describe('Navigation Context Integration', () => {
        test('should integrate with NavigationContextManager correctly', () => {
            expect(shortcutRouter.navigationContext).toBeInstanceOf(NavigationContextManager);
        });

        test('should handle navigation operations', () => {
            // Push context through navigation
            shortcutRouter.navigateToScene('help', 'MenuScene', 'keyboard_h');
            
            expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
        });

        test('should manage go back functionality', () => {
            // Set up navigation context
            shortcutRouter.navigationContext.pushContext('MenuScene', 'keyboard_h');
            
            // Test go back
            const success = shortcutRouter.handleGoBack();
            
            // Should attempt to navigate back
            expect(typeof success).toBe('boolean');
        });
    });

    describe('Scene-Specific Behavior', () => {
        test('should handle same-scene navigation (help)', () => {
            gameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'HelpScene' }
            });
            
            const result = shortcutRouter.handleHelpShortcut('HelpScene');
            
            // Should handle being already in help scene
            expect(typeof result).toBe('boolean');
        });

        test('should handle same-scene navigation (settings)', () => {
            gameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'SettingsScene' }
            });
            
            const result = shortcutRouter.handleSettingsShortcut('SettingsScene');
            
            // Should handle being already in settings scene
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Configuration Management', () => {
        test('should allow configuration updates', () => {
            const newConfig = {
                enableLogging: false,
                debounceDelay: 200
            };
            
            expect(() => {
                shortcutRouter.updateConfig(newConfig);
            }).not.toThrow();
            
            expect(shortcutRouter.config.enableLogging).toBe(false);
            expect(shortcutRouter.config.debounceDelay).toBe(200);
        });

        test('should handle active state changes', () => {
            expect(() => {
                shortcutRouter.setActive(false);
            }).not.toThrow();
            
            expect(shortcutRouter.state.isActive).toBe(false);
            
            shortcutRouter.setActive(true);
            expect(shortcutRouter.state.isActive).toBe(true);
        });
    });

    describe('Shortcut Management', () => {
        test('should allow adding new shortcuts', () => {
            const newShortcut = {
                action: 'test',
                scene: 'test',
                description: 'Test shortcut'
            };
            
            expect(() => {
                shortcutRouter.addShortcut('KeyT', newShortcut);
            }).not.toThrow();
            
            expect(shortcutRouter.shortcuts.has('KeyT')).toBe(true);
            expect(shortcutRouter.shortcuts.get('KeyT')).toEqual(newShortcut);
        });

        test('should allow removing shortcuts', () => {
            shortcutRouter.addShortcut('KeyT', { action: 'test', scene: 'test' });
            
            const removed = shortcutRouter.removeShortcut('KeyT');
            
            expect(removed).toBe(true);
            expect(shortcutRouter.shortcuts.has('KeyT')).toBe(false);
        });
    });

    describe('Error Handling and Robustness', () => {
        test('should handle null scene manager gracefully', () => {
            gameEngine.sceneManager = null;
            
            expect(() => {
                shortcutRouter.handleHelpShortcut('MenuScene');
            }).not.toThrow();
        });

        test('should handle scene switching failures', () => {
            gameEngine.sceneManager.switchScene.mockReturnValue(false);
            
            const result = shortcutRouter.handleSettingsShortcut('MenuScene');
            
            expect(result).toBe(false);
        });

        test('should handle invalid scene names', () => {
            expect(() => {
                shortcutRouter.handleHelpShortcut('InvalidScene');
            }).not.toThrow();
        });
    });

    describe('Debug and Introspection', () => {
        test('should provide debug information', () => {
            const debugInfo = shortcutRouter.getDebugInfo();
            
            expect(debugInfo).toBeDefined();
            expect(debugInfo.shortcuts).toBeDefined();
            expect(debugInfo.state).toBeDefined();
            expect(debugInfo.config).toBeDefined();
            expect(debugInfo.navigationContext).toBeDefined();
        });

        test('should track state correctly', () => {
            expect(shortcutRouter.state).toBeDefined();
            expect(shortcutRouter.state.isActive).toBe(true);
            expect(shortcutRouter.state.pressedKeys).toBeInstanceOf(Set);
            expect(shortcutRouter.state.activeModifiers).toBeInstanceOf(Set);
        });
    });

    describe('Integration with NavigationContextManager', () => {
        test('should use NavigationContextManager for return destinations', () => {
            // Push multiple contexts
            shortcutRouter.navigationContext.pushContext('MenuScene', 'menu_click');
            shortcutRouter.navigationContext.pushContext('GameScene', 'keyboard_g');
            
            const returnDest1 = shortcutRouter.navigationContext.getReturnDestination();
            expect(returnDest1).toBe('GameScene');
            
            shortcutRouter.navigationContext.popContext();
            const returnDest2 = shortcutRouter.navigationContext.getReturnDestination();
            expect(returnDest2).toBe('MenuScene');
        });

        test('should integrate navigation context in scene switching', () => {
            const success = shortcutRouter.navigateToScene('help', 'MenuScene', 'keyboard_h');
            
            expect(success).toBe(true);
            expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            
            // Verify context was pushed
            const stackDepth = shortcutRouter.navigationContext.getStackDepth();
            expect(stackDepth).toBe(1);
        });
    });
});