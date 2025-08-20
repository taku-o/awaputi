import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * 統一設定スクリーンアクセスの統合テスト
 * Unified Settings Screen Access Integration Tests
 * 
 * タスク18: 統一設定スクリーンアクセスの統合テスト作成
 * - Test main menu to settings navigation
 * - Test S key shortcut from different scenes
 * - Test ESC from help to settings navigation
 * - Test return navigation to correct previous screen
 * Requirements: 2.1, 2.2, 2.4, 4.3
 */

import { SettingsScene } from '../../src/scenes/SettingsScene';
import { NavigationContextManager } from '../../src/core/navigation/NavigationContextManager';
import { KeyboardShortcutRouter } from '../../src/core/navigation/KeyboardShortcutRouter';

// Mock dependencies
const mockGameEngine = {
    sceneManager: {
        switchScene: jest.fn().mockReturnValue(true,
        getCurrentScene: jest.fn(() => ({ constructor: { name: 'MenuScene' } })),
        getScene: jest.fn()
    },
    localizationManager: {
        t: jest.fn((key, fallback) => fallback || key),
        getCurrentLanguage: () => 'ja'
    },
    accessibilityManager: {
        screenReaderMode: false
    },
    configurationManager: {
        getGameConfig: jest.fn(() => ({
            accessibility: {},
            audio: {},
            graphics: {}
        })),
        updateGameConfig: jest.fn()
    }
};

// Mock DOM environment
global.window = { 
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};
global.document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

describe('Unified Settings Screen Access Integration Tests', () => {
    let settingsScene: any;
    let navigationContextManager: any;
    let keyboardShortcutRouter: any;
    
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Reset scene manager mocks
        mockGameEngine.sceneManager.switchScene.mockReturnValue(true);
        mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({ constructor: { name: 'MenuScene' } });
        
        // Initialize components
        navigationContextManager = new NavigationContextManager(mockGameEngine);
        keyboardShortcutRouter = new KeyboardShortcutRouter(mockGameEngine);
        settingsScene = new SettingsScene(mockGameEngine);
    });
    
    afterEach(() => {
        // Cleanup
        settingsScene?.destroy();
        navigationContextManager?.cleanup();
        keyboardShortcutRouter?.cleanup();
    });

    describe('Main Menu to Settings Navigation', () => {
        test('should navigate from main menu to settings scene successfully', () => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MenuScene' }
            });
            
            // Act
            const success = keyboardShortcutRouter.handleSettingsShortcut('MenuScene');
            
            // Assert - Core requirement: navigation should work
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
            expect(success.toBe(true));
        });
        
        test('should handle navigation failures gracefully', () => {
            // Arrange
            mockGameEngine.sceneManager.switchScene.mockReturnValue(false);
            
            // Act
            const success = keyboardShortcutRouter.handleSettingsShortcut('MenuScene');
            
            // Assert
            expect(success.toBe(false));
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });
        
        test('should properly set navigation context when entering settings from menu', () => {
            // Arrange
            const contextData = {
                accessMethod: 'menu_click',
                sourceScene: 'MenuScene'
            };
            
            // Act
            settingsScene.enter(contextData);
            
            // Assert
            expect(settingsScene.navigationContext.getReturnDestination()).toBe('menu');
        });
    });

    describe('S Key Shortcut from Different Scenes', () => {
        const testScenes = [
            'MenuScene',
            'GameScene',
            'HelpScene',
            'StageSelectionScene',
            'ShopScene'
        ];
        
        test.each(testScenes('should handle S key from %s correctly', (sceneName) => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: sceneName }
            });
            
            // Act
            const success = keyboardShortcutRouter.handleSettingsShortcut(sceneName);
            
            // Assert - Core requirement: S key should navigate to settings from any scene
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
            expect(success.toBe(true));
        });
        
        test('should preserve navigation context when using S key from different scenes', () => {
            // Arrange
            const sourceScenes = ['MenuScene', 'GameScene', 'HelpScene'];
            
            sourceScenes.forEach(sceneName => {
                // Setup
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneName }
                });
                
                // Act
                const success = keyboardShortcutRouter.handleSettingsShortcut(sceneName);
                
                // Assert - Should successfully handle S key from all scenes
                expect(success.toBe(true));
                expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
                
                // Reset for next iteration
                jest.clearAllMocks();
            });
        });
        
        test('should handle unknown source scenes with fallback', () => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'UnknownScene' }
            });
            
            // Act & Assert - Should not throw
            expect(() => {
                keyboardShortcutRouter.handleSettingsShortcut('UnknownScene');
            }).not.toThrow();
        });
    });

    describe('ESC from Help to Settings Navigation', () => {
        test('should support navigation from help to settings', () => {
            // Arrange - Test navigation context stack depth
            navigationContextManager.pushContext('SettingsScene', 'menu_click');
            const depth1 = navigationContextManager.getStackDepth();
            
            navigationContextManager.pushContext('HelpScene', 'keyboard_h');
            const depth2 = navigationContextManager.getStackDepth();
            
            // Act - Simulate ESC from help
            navigationContextManager.popContext();
            const depth3 = navigationContextManager.getStackDepth();
            
            // Assert - Should properly manage stack operations
            expect(depth1.toBe(1));
            expect(depth2.toBe(2));
            expect(depth3.toBe(1));
        });
        
        test('should handle complex navigation chains', () => {
            // Arrange - Build navigation chain
            navigationContextManager.pushContext('MenuScene', 'menu_click');
            navigationContextManager.pushContext('SettingsScene', 'keyboard_s');
            navigationContextManager.pushContext('HelpScene', 'keyboard_h');
            
            // Act - Test stack management
            const initialDepth = navigationContextManager.getStackDepth();
            navigationContextManager.popContext();
            const afterFirst = navigationContextManager.getStackDepth();
            navigationContextManager.popContext();
            const afterSecond = navigationContextManager.getStackDepth();
            
            // Assert - Stack should decrease properly
            expect(initialDepth.toBe(3));
            expect(afterFirst.toBe(2));
            expect(afterSecond.toBe(1));
        });
    });

    describe('Return Navigation to Correct Previous Screen', () => {
        test('should return to menu after settings from menu', () => {
            // Arrange
            const contextData = {
                accessMethod: 'menu_click',
                sourceScene: 'MenuScene'
            };
            settingsScene.enter(contextData);
            
            // Act - Simulate going back
            const callback = settingsScene.setupEventCallbacks?.();
            // Since we can't directly access the callback, test the context instead
            const returnDestination = settingsScene.navigationContext.getReturnDestination();
            
            // Assert
            expect(returnDestination.toBe('menu'));
        });
        
        test('should handle navigation from game scene', () => {
            // Arrange
            navigationContextManager.pushContext('GameScene', 'keyboard_s');
            
            // Act
            const currentContext = navigationContextManager.getCurrentContext();
            
            // Assert - Should properly track game scene context
            expect(currentContext.toBeDefined());
            expect(currentContext.scene).toBe('GameScene');
            expect(currentContext.method).toBe('keyboard_s');
        });
        
        test('should handle navigation from help scene', () => {
            // Arrange
            navigationContextManager.pushContext('HelpScene', 'keyboard_s');
            
            // Act
            const currentContext = navigationContextManager.getCurrentContext();
            
            // Assert - Should properly track help scene context
            expect(currentContext.toBeDefined());
            expect(currentContext.scene).toBe('HelpScene');
            expect(currentContext.method).toBe('keyboard_s');
        });
        
        test('should handle navigation context preservation across multiple transitions', () => {
            // Arrange - Build multi-level context
            navigationContextManager.pushContext('MenuScene', 'menu_click');
            navigationContextManager.pushContext('GameScene', 'keyboard_g');
            navigationContextManager.pushContext('SettingsScene', 'keyboard_s');
            
            // Act - Test context retrieval at each level
            const context3 = navigationContextManager.getCurrentContext();
            navigationContextManager.popContext();
            const context2 = navigationContextManager.getCurrentContext();
            navigationContextManager.popContext();
            const context1 = navigationContextManager.getCurrentContext();
            
            // Assert - Each context should be properly preserved
            expect(context3.scene).toBe('SettingsScene');
            expect(context2.scene).toBe('GameScene');
            expect(context1.scene).toBe('MenuScene');
        });
    });

    describe('Keyboard Shortcut Integration', () => {
        test('should provide shortcut mapping for S key', () => {
            // Arrange - Check shortcut mapping
            const shortcutExists = keyboardShortcutRouter.shortcuts.has('KeyS');
            const shortcutConfig = keyboardShortcutRouter.shortcuts.get('KeyS');
            
            // Assert - Should have proper mapping
            expect(shortcutExists.toBe(true));
            expect(shortcutConfig.action).toBe('settings');
            expect(shortcutConfig.scene).toBe('settings');
        });
        
        test('should handle S key routing correctly', () => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MenuScene' }
            });
            
            // Act
            const success = keyboardShortcutRouter.handleSettingsShortcut('MenuScene');
            
            // Assert
            expect(success.toBe(true));
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
        });
        
        test('should handle inactive state correctly', () => {
            // Arrange
            const keyEvent = new KeyboardEvent('keydown', { key: 's', code: 'KeyS' });
            keyboardShortcutRouter.state = { isActive: false, lastKeyTime: 0 };
            
            // Act
            keyboardShortcutRouter.handleKeyDown(keyEvent);
            
            // Assert - Should not process when inactive
            expect(mockGameEngine.sceneManager.switchScene).not.toHaveBeenCalled();
        });
    });

    describe('Settings Scene Integration', () => {
        test('should initialize settings scene properly', () => {
            // Arrange
            const contextData = {
                accessMethod: 'keyboard_s',
                sourceScene: 'MenuScene'
            };
            
            // Act & Assert - Should not throw
            expect(() => {
                settingsScene.enter(contextData);
            }).not.toThrow();
        });
        
        test('should handle settings scene destruction', () => {
            // Arrange
            settingsScene.enter({ accessMethod: 'menu_click', sourceScene: 'MenuScene' });
            
            // Act & Assert - Should not throw
            expect(() => {
                settingsScene.destroy();
            }).not.toThrow();
        });
        
        test('should manage accessibility settings integration', () => {
            // Arrange
            const contextData = {
                accessMethod: 'keyboard_s',
                sourceScene: 'MenuScene'
            };
            
            // Act
            settingsScene.enter(contextData);
            
            // Assert - Should have accessibility manager
            expect(settingsScene.accessibilitySettingsManager).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing sceneManager gracefully', () => {
            // Arrange
            const faultyGameEngine = { ...mockGameEngine };
            faultyGameEngine.sceneManager = null;
            
            // Act & Assert
            expect(() => {
                const testRouter = new KeyboardShortcutRouter(faultyGameEngine);
                testRouter.handleSettingsShortcut('MenuScene');
            }).not.toThrow();
        });
        
        test('should handle scene manager errors', () => {
            // Arrange
            mockGameEngine.sceneManager.switchScene.mockImplementation(() => {
                throw new Error('Scene switch failed');
            });
            
            // Act & Assert - Should not crash
            expect(() => {
                keyboardShortcutRouter.handleSettingsShortcut('MenuScene');
            }).not.toThrow();
        });
        
        test('should handle navigation context errors', () => {
            // Arrange
            const faultyGameEngine = { ...mockGameEngine };
            faultyGameEngine.sceneManager = undefined;
            
            // Act & Assert
            expect(() => {
                const testNavigation = new NavigationContextManager(faultyGameEngine);
                testNavigation.pushContext('MenuScene', 'keyboard_s');
            }).not.toThrow();
        });
        
        test('should handle settings scene initialization errors', () => {
            // Arrange
            const faultyGameEngine = { ...mockGameEngine };
            delete faultyGameEngine.configurationManager;
            
            // Act & Assert
            expect(() => {
                const testSettingsScene = new SettingsScene(faultyGameEngine);
                testSettingsScene.enter({});
            }).not.toThrow();
        });
    });

    describe('Integration Requirements Validation', () => {
        test('should satisfy requirement 2.1: Settings screen unification', () => {
            // Test that settings access goes through unified system
            const success = keyboardShortcutRouter.handleSettingsShortcut('MenuScene');
            
            expect(success.toBe(true));
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
        });
        
        test('should satisfy requirement 2.2: Context-dependent settings routing', () => {
            // Test that settings can be accessed from different contexts
            const scenes = ['MenuScene', 'GameScene', 'HelpScene'];
            
            scenes.forEach(sceneName => {
                jest.clearAllMocks();
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneName }
                });
                
                keyboardShortcutRouter.handleSettingsShortcut(sceneName);
                expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
            });
        });
        
        test('should satisfy requirement 2.4: Consistent settings shortcuts', () => {
            // Test that S key works consistently
            const shortcutConfig = keyboardShortcutRouter.shortcuts.get('KeyS');
            
            expect(shortcutConfig.toBeDefined());
            expect(shortcutConfig.action).toBe('settings');
            expect(shortcutConfig.scene).toBe('settings');
        });
        
        test('should satisfy requirement 4.3: Settings navigation context preservation', () => {
            // Test that navigation context is properly managed for settings
            navigationContextManager.pushContext('MenuScene', 'keyboard_s');
            const context = navigationContextManager.getCurrentContext();
            
            expect(context.scene).toBe('MenuScene');
            expect(context.method).toBe('keyboard_s');
            
            const returnDestination = navigationContextManager.getReturnDestination();
            expect(returnDestination.toBe('menu'));
        });
    });

    describe('Performance and Reliability', () => {
        test('should handle rapid settings access', () => {
            // Arrange & Act - Multiple rapid calls to settings shortcut handler
            let successCount = 0;
            for (let i = 0; i < 5; i++) {
                const result = keyboardShortcutRouter.handleSettingsShortcut('MenuScene');
                if (result) successCount++;
            }
            
            // Assert - Should handle all calls successfully
            expect(successCount.toBe(5));
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledTimes(5);
        });
        
        test('should cleanup navigation context properly', () => {
            // Arrange
            navigationContextManager.pushContext('MenuScene', 'keyboard_s');
            const beforeCleanup = navigationContextManager.getStackDepth();
            
            // Act
            navigationContextManager.clear();
            const afterCleanup = navigationContextManager.getStackDepth();
            
            // Assert
            expect(beforeCleanup.toBe(1));
            expect(afterCleanup.toBe(0));
        });
        
        test('should maintain consistent state across scene transitions', () => {
            // Arrange
            navigationContextManager.pushContext('MenuScene', 'keyboard_s');
            const initialDepth = navigationContextManager.getStackDepth();
            
            // Act
            navigationContextManager.clear();
            navigationContextManager.pushContext('GameScene', 'menu_click');
            const finalDepth = navigationContextManager.getStackDepth();
            
            // Assert - Should maintain consistent stack behavior
            expect(initialDepth.toBe(1));
            expect(finalDepth.toBe(1));
        });
    });
});