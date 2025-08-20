import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * 統一ヘルプスクリーンアクセスの統合テスト
 * Unified Help Screen Access Integration Tests
 * 
 * タスク17: 統一ヘルプスクリーンアクセスの統合テスト作成
 * - Test main menu to help navigation
 * - Test H key shortcut from different scenes
 * - Test F1 contextual help access  
 * - Test return navigation to correct previous screen
 * Requirements: 1.1, 1.2, 1.4, 4.1
 */

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

describe('Unified Help Screen Access Integration Tests', () => {
    let navigationContextManager: any;
    let keyboardShortcutRouter: any;
    
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Reset scene manager mocks
        mockGameEngine.sceneManager.switchScene.mockReturnValue(true;
        mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({ constructor: { name: 'MenuScene' } });
        
        // Initialize components
        navigationContextManager = new NavigationContextManager(mockGameEngine;
        keyboardShortcutRouter = new KeyboardShortcutRouter(mockGameEngine;
    });
    
    afterEach(() => {
        // Cleanup
        navigationContextManager?.cleanup();
        keyboardShortcutRouter?.cleanup();
    });

    describe('Main Menu to Help Navigation', () => {
        test('should navigate from main menu to help scene successfully', () => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'MenuScene' }
            });
            
            // Act
            const success = keyboardShortcutRouter.handleHelpShortcut('MenuScene');
            
            // Assert - Core requirement: navigation should work
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            expect(success.toBe(true);
        });
        
        test('should handle navigation failures gracefully', () => {
            // Arrange
            mockGameEngine.sceneManager.switchScene.mockReturnValue(false;
            
            // Act
            const success = keyboardShortcutRouter.handleHelpShortcut('MenuScene');
            
            // Assert
            expect(success.toBe(false);
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalled();
        });
    });

    describe('H Key Shortcut from Different Scenes', () => {
        const testScenes = [
            'MenuScene',
            'GameScene', 
            'SettingsScene',
            'StageSelectionScene',
            'ShopScene'
        ];
        
        test.each(testScenes('should handle H key from %s correctly', (sceneName) => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: sceneName }
            });
            
            // Act
            const success = keyboardShortcutRouter.handleHelpShortcut(sceneName;
            
            // Assert - Core requirement: H key should navigate to help from any scene
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            expect(success.toBe(true);
        });
        
        test('should handle unknown source scenes', () => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'UnknownScene' }
            });
            
            // Act & Assert - Should not throw
            expect(() => {
                keyboardShortcutRouter.handleHelpShortcut('UnknownScene');
            }).not.toThrow();
        });
    });

    describe('F1 Contextual Help Access', () => {
        test('should handle F1 key for contextual help', () => {
            // Arrange
            mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                constructor: { name: 'GameScene' }
            });
            
            // Act
            const success = keyboardShortcutRouter.handleContextualHelp('GameScene');
            
            // Assert - Core requirement: F1 should navigate to help 
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            expect(success.toBe(true);
        });
        
        test('should handle F1 from various scenes', () => {
            // Arrange
            const testScenes = ['GameScene', 'SettingsScene', 'MenuScene'];
            
            testScenes.forEach(sceneName => {
                // Setup
                jest.clearAllMocks();
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneName }
                });
                
                // Act
                const success = keyboardShortcutRouter.handleContextualHelp(sceneName;
                
                // Assert
                expect(success.toBe(true);
                expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            });
        });
    });

    describe('Navigation Context Management', () => {
        test('should manage navigation context properly', () => {
            // Arrange
            const sourceScene = 'MenuScene';
            const accessMethod = 'keyboard_h';
            
            // Act
            navigationContextManager.pushContext(sourceScene, accessMethod);
            const returnDestination = navigationContextManager.getReturnDestination();
            
            // Assert - Core requirement: context should be preserved
            expect(returnDestination.toBe('menu');
        });
        
        test('should handle context stack operations', () => {
            // Arrange
            navigationContextManager.pushContext('MenuScene', 'keyboard_h');
            const stackDepth1 = navigationContextManager.getStackDepth();
            navigationContextManager.pushContext('SettingsScene', 'keyboard_s');
            const stackDepth2 = navigationContextManager.getStackDepth();
            
            // Act
            navigationContextManager.popContext();
            const stackDepth3 = navigationContextManager.getStackDepth();
            
            // Assert - Test stack operations
            expect(stackDepth1.toBe(1);
            expect(stackDepth2.toBe(2);
            expect(stackDepth3.toBe(1);
        });
        
        test('should provide fallback when stack is empty', () => {
            // Arrange - Empty stack
            
            // Act
            const returnDestination = navigationContextManager.getReturnDestination();
            
            // Assert
            expect(returnDestination.toBe('menu'); // Default fallback
        });
    });

    describe('Keyboard Event Integration', () => {
        test('should provide shortcut mapping for H key', () => {
            // Arrange - Check shortcut mapping
            const shortcutExists = keyboardShortcutRouter.shortcuts.has('KeyH');
            const shortcutConfig = keyboardShortcutRouter.shortcuts.get('KeyH');
            
            // Assert - Should have proper mapping
            expect(shortcutExists.toBe(true);
            expect(shortcutConfig.action).toBe('help');
            expect(shortcutConfig.scene).toBe('help');
        });
        
        test('should provide shortcut mapping for F1 key', () => {
            // Arrange - Check shortcut mapping
            const shortcutExists = keyboardShortcutRouter.shortcuts.has('F1');
            const shortcutConfig = keyboardShortcutRouter.shortcuts.get('F1');
            
            // Assert - Should have proper mapping  
            expect(shortcutExists.toBe(true);
            expect(shortcutConfig.action).toBe('contextualHelp');
            expect(shortcutConfig.scene).toBe('help');
        });
        
        test('should handle inactive state', () => {
            // Arrange
            const keyEvent = new KeyboardEvent('keydown', { key: 'h', code: 'KeyH' });
            keyboardShortcutRouter.state = { isActive: false, lastKeyTime: 0 };
            
            // Act
            keyboardShortcutRouter.handleKeyDown(keyEvent;
            
            // Assert - Should not process when inactive
            expect(mockGameEngine.sceneManager.switchScene).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing sceneManager gracefully', () => {
            // Arrange
            const faultyGameEngine = { ...mockGameEngine };
            faultyGameEngine.sceneManager = null;
            
            // Act & Assert
            expect(() => {
                const testRouter = new KeyboardShortcutRouter(faultyGameEngine;
                testRouter.handleHelpShortcut('MenuScene');
            }).not.toThrow();
        });
        
        test('should handle scene manager errors', () => {
            // Arrange
            mockGameEngine.sceneManager.switchScene.mockImplementation(() => {
                throw new Error('Scene switch failed');
            });
            
            // Act & Assert - Should not crash
            expect(() => {
                keyboardShortcutRouter.handleHelpShortcut('MenuScene');
            }).not.toThrow();
        });
        
        test('should handle navigation context errors', () => {
            // Arrange
            const faultyGameEngine = { ...mockGameEngine };
            faultyGameEngine.sceneManager = undefined;
            
            // Act & Assert
            expect(() => {
                const testNavigation = new NavigationContextManager(faultyGameEngine;
                testNavigation.pushContext('MenuScene', 'keyboard_h');
            }).not.toThrow();
        });
    });

    describe('Integration Requirements Validation', () => {
        test('should satisfy requirement 1.1: Help screen unification', () => {
            // Test that all help access methods go through unified system
            const accessMethods = [
                () => keyboardShortcutRouter.handleHelpShortcut('MenuScene'),
                () => keyboardShortcutRouter.handleContextualHelp('GameScene')
            ];
            
            accessMethods.forEach(method => {
                jest.clearAllMocks();
                method();
                expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            });
        });
        
        test('should satisfy requirement 1.2: Context-dependent help routing', () => {
            // Test that F1 provides contextual help
            const success = keyboardShortcutRouter.handleContextualHelp('GameScene');
            
            expect(success.toBe(true);
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
        });
        
        test('should satisfy requirement 1.4: Consistent keyboard shortcuts', () => {
            // Test that H key works from multiple scenes
            const scenes = ['MenuScene', 'GameScene', 'SettingsScene'];
            
            scenes.forEach(sceneName => {
                jest.clearAllMocks();
                mockGameEngine.sceneManager.getCurrentScene.mockReturnValue({
                    constructor: { name: sceneName }
                });
                
                keyboardShortcutRouter.handleHelpShortcut(sceneName;
                expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            });
        });
        
        test('should satisfy requirement 4.1: Navigation context preservation', () => {
            // Test that navigation context is properly managed
            navigationContextManager.pushContext('MenuScene', 'keyboard_h');
            const context1 = navigationContextManager.getCurrentContext();
            
            expect(context1.scene).toBe('MenuScene');
            expect(context1.method).toBe('keyboard_h');
            
            navigationContextManager.pushContext('GameScene', 'keyboard_h');
            const context2 = navigationContextManager.getCurrentContext();
            
            expect(context2.scene).toBe('GameScene');
            expect(context2.method).toBe('keyboard_h');
        });
    });

    describe('Performance and Reliability', () => {
        test('should handle debounced shortcuts correctly', () => {
            // Arrange - Test debounce functionality
            keyboardShortcutRouter.state.isActive = true;
            keyboardShortcutRouter.config.enableGlobalShortcuts = true;
            keyboardShortcutRouter.config.debounceDelay = 100;
            
            // Act - Multiple rapid calls to shortcut handler
            let callCount = 0;
            for (let i = 0; i < 5; i++) {
                const result = keyboardShortcutRouter.handleHelpShortcut('MenuScene');
                if (result) callCount++;
            }
            
            // Assert - Should process all calls (debounce is handled in handleKeyDown, not in direct method calls)
            expect(callCount.toBe(5);
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledTimes(5);
        });
        
        test('should cleanup resources properly', () => {
            // Arrange
            navigationContextManager.pushContext('MenuScene', 'keyboard_h');
            const beforeCleanup = navigationContextManager.getStackDepth();
            
            // Act
            navigationContextManager.clear();
            const afterCleanup = navigationContextManager.getStackDepth();
            keyboardShortcutRouter.cleanup();
            
            // Assert - Should clear contexts and not throw
            expect(beforeCleanup.toBe(1);
            expect(afterCleanup.toBe(0);
            expect(() => {
                keyboardShortcutRouter.handleHelpShortcut('MenuScene');
            }).not.toThrow();
        });
        
    });
});