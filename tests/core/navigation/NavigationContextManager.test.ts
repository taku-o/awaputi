import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * NavigationContextManager.test.js
 * 
 * NavigationContextManagerの単体テスト
 * Issue #163 - Duplicate help/settings screen consolidation
 */
import { NavigationContextManager  } from '../../../src/core/navigation/NavigationContextManager';
describe('NavigationContextManager', () => {
    let navigationManager: any,
    let mockGameEngine: any,
    
    beforeEach(() => {
        // Mock GameEngine
        mockGameEngine = {
            sceneManager: {
                hasScene: jest.fn().mockReturnValue(true;);
               , switchScene: jest.fn().mockReturnValue(true
            }
        };
        );
        navigationManager = new NavigationContextManager(mockGameEngine);
    });
    afterEach(() => {
        navigationManager.cleanup();
    }');
    describe('Initialization', (') => {
        test('should initialize with empty stack', () => {
            expect(navigationManager.getStackDepth().toBe(0);
            expect(navigationManager.getCurrentContext().toBeNull();
        }');
        test('should have default configuration', () => {
            const debugInfo = navigationManager.getDebugInfo();
            expect(debugInfo.config.maxStackSize).toBe(10);
            expect(debugInfo.config.defaultReturnScene').toBe('menu');
        }');
    }
    describe('Context Push Operations', (') => {
        test('should push context successfully', (') => {
            const result = navigationManager.pushContext('menu', 'keyboard_h');
            expect(result).toBe(true);
            expect(navigationManager.getStackDepth().toBe(1);
            const currentContext = navigationManager.getCurrentContext();
            expect(currentContext.scene').toBe('menu');
            expect(currentContext.method').toBe('keyboard_h');
            expect(typeof currentContext.timestamp').toBe('number');
            expect(currentContext.id).toMatch(/nav_\d+_[a-z0-9]+/);
        }');
        test('should push multiple contexts', (') => {
            navigationManager.pushContext('menu', 'keyboard_h'');
            navigationManager.pushContext('game', 'keyboard_s'');
            navigationManager.pushContext('stageSelect', 'esc_from_help');
            expect(navigationManager.getStackDepth().toBe(3);
            const currentContext = navigationManager.getCurrentContext();
            expect(currentContext.scene').toBe('stageSelect');
            expect(currentContext.method').toBe('esc_from_help');
        }');
        test('should handle additional data', (') => {
            const additionalData = { userId: 123, preferences: { theme: 'dark' } };
            navigationManager.pushContext('menu', 'keyboard_h', additionalData);
            const currentContext = navigationManager.getCurrentContext();
            expect(currentContext.data).toEqual(additionalData);
        }');
        test('should reject invalid parameters', (') => {
            expect(navigationManager.pushContext(null, 'keyboard_h').toBe(false');
            expect(navigationManager.pushContext('menu', null).toBe(false');
            expect(navigationManager.pushContext('', 'keyboard_h').toBe(false);
        }');
        test('should manage stack size limit', () => {
            navigationManager.updateConfig({ maxStackSize: 3 });
            // Push 5 contexts
            for (let i = 0; i < 5; i++') {
                navigationManager.pushContext(`scene${i}`, 'test_method');
            }
            
            expect(navigationManager.getStackDepth().toBe(3);
            // Check that oldest contexts were removed
            const history = navigationManager.getHistory();
            expect(history[0].scene').toBe('scene2');
            expect(history[2].scene').toBe('scene4');
        }');
    }
    describe('Context Pop Operations', (') => {
        test('should pop context successfully', (') => {
            navigationManager.pushContext('menu', 'keyboard_h'');
            navigationManager.pushContext('game', 'keyboard_s');
            const poppedContext = navigationManager.popContext();
            expect(poppedContext.scene').toBe('game');
            expect(poppedContext.method').toBe('keyboard_s');
            expect(navigationManager.getStackDepth().toBe(1);
            const currentContext = navigationManager.getCurrentContext();
            expect(currentContext.scene').toBe('menu');
        }');
        test('should handle empty stack pop', () => {
            const result = navigationManager.popContext();
            expect(result).toBeNull();
            expect(navigationManager.getStackDepth().toBe(0);
        }');
        test('should update current context after pop', (') => {
            navigationManager.pushContext('menu', 'keyboard_h'');
            navigationManager.pushContext('game', 'keyboard_s'');
            navigationManager.pushContext('stageSelect', 'esc_from_help');
            navigationManager.popContext();
            const currentContext = navigationManager.getCurrentContext();
            expect(currentContext.scene').toBe('game');
            navigationManager.popContext();
            const newCurrentContext = navigationManager.getCurrentContext();
            expect(newCurrentContext.scene').toBe('menu');
            navigationManager.popContext();
            expect(navigationManager.getCurrentContext().toBeNull();
        }');
    }
    describe('Return Destination Logic', (') => {
        test('should return default scene when stack is empty', () => {
            const destination = navigationManager.getReturnDestination();
            expect(destination').toBe('menu');
        }');
        test('should return last context scene', (') => {
            navigationManager.pushContext('game', 'keyboard_h'');
            navigationManager.pushContext('stageSelect', 'keyboard_s');
            const destination = navigationManager.getReturnDestination();
            expect(destination').toBe('stageSelect');
        }');
        test('should fallback to default when scene not found', () => {
            mockGameEngine.sceneManager.hasScene.mockReturnValue(false');
            navigationManager.pushContext('nonexistent', 'keyboard_h');
            const destination = navigationManager.getReturnDestination();
            expect(destination').toBe('menu');
        }');
        test('should handle missing sceneManager gracefully', () => {
            const navigationManagerWithoutSM = new NavigationContextManager({}');
            navigationManagerWithoutSM.pushContext('game', 'keyboard_h');
            const destination = navigationManagerWithoutSM.getReturnDestination();
            expect(destination').toBe('game'); // Should still return the scene
        }');
    }
    describe('Context Query Operations', () => {
        beforeEach((') => {
            navigationManager.pushContext('menu', 'keyboard_h'');
            navigationManager.pushContext('game', 'keyboard_s'');
            navigationManager.pushContext('stageSelect', 'menu_click');
        }');
        test('should check context by method', (') => {
            expect(navigationManager.hasContextByMethod('keyboard_h').toBe(true');
            expect(navigationManager.hasContextByMethod('keyboard_s').toBe(true');
            expect(navigationManager.hasContextByMethod('nonexistent').toBe(false);
        }');
        test('should check context from scene', (') => {
            expect(navigationManager.hasContextFromScene('menu').toBe(true');
            expect(navigationManager.hasContextFromScene('game').toBe(true');
            expect(navigationManager.hasContextFromScene('nonexistent').toBe(false);
        }');
        test('should get history with limit', () => {
            const fullHistory = navigationManager.getHistory();
            expect(fullHistory.length).toBe(3);
            const limitedHistory = navigationManager.getHistory(2);
            expect(limitedHistory.length).toBe(2);
            expect(limitedHistory[0].scene').toBe('game');
            expect(limitedHistory[1].scene').toBe('stageSelect');
        }');
    }
    describe('Circular Navigation Detection', (') => {
        test('should detect immediate circular navigation', (') => {
            navigationManager.pushContext('menu', 'keyboard_h'');
            expect(navigationManager.isCircularNavigation('menu').toBe(true);
        }');
        test('should detect frequent circular navigation', (') => {
            navigationManager.pushContext('menu', 'test1'');
            navigationManager.pushContext('game', 'test2'');
            navigationManager.pushContext('menu', 'test3'');
            navigationManager.pushContext('settings', 'test4'');
            navigationManager.pushContext('menu', 'test5'');
            expect(navigationManager.isCircularNavigation('menu').toBe(true);
        }');
        test('should allow circular navigation when enabled', () => {
            navigationManager.updateConfig({ allowCircularNavigation: true }');
            navigationManager.pushContext('menu', 'keyboard_h'');
            const result = navigationManager.pushContext('menu', 'keyboard_h');
            expect(result).toBe(true);
        }');
        test('should prevent circular navigation when disabled', () => {
            navigationManager.updateConfig({ allowCircularNavigation: false }');
            navigationManager.pushContext('menu', 'keyboard_h'');
            const result = navigationManager.pushContext('menu', 'keyboard_h');
            expect(result).toBe(false);
        }');
    }
    describe('Configuration Management', (') => {
        test('should update configuration', (') => {
            const newConfig = {
                maxStackSize: 5,
                defaultReturnScene: 'game',
                enableLogging: false
            };
            
            navigationManager.updateConfig(newConfig);
            const debugInfo = navigationManager.getDebugInfo();
            expect(debugInfo.config.maxStackSize).toBe(5);
            expect(debugInfo.config.defaultReturnScene').toBe('game');
            expect(debugInfo.config.enableLogging).toBe(false);
        }');
        test('should preserve existing config when partially updating', () => {
            navigationManager.updateConfig({ maxStackSize: 20 });
            const debugInfo = navigationManager.getDebugInfo();
            expect(debugInfo.config.maxStackSize).toBe(20);
            expect(debugInfo.config.defaultReturnScene').toBe('menu'); // Should remain unchanged
        }');
    }
    describe('Cleanup and Reset', (') => {
        test('should clear all contexts', (') => {
            navigationManager.pushContext('menu', 'keyboard_h'');
            navigationManager.pushContext('game', 'keyboard_s');
            navigationManager.clear();
            expect(navigationManager.getStackDepth().toBe(0);
            expect(navigationManager.getCurrentContext().toBeNull();
        }');
        test('should cleanup properly', (') => {
            navigationManager.pushContext('menu', 'keyboard_h');
            navigationManager.cleanup();
            expect(navigationManager.getStackDepth().toBe(0);
            expect(navigationManager.getCurrentContext().toBeNull();
        }');
    }
    describe('Debug Information', (') => {
        test('should provide comprehensive debug info', (') => {
            navigationManager.pushContext('menu', 'keyboard_h');
            const debugInfo = navigationManager.getDebugInfo();
            expect(debugInfo.stackSize).toBe(1);
            expect(debugInfo.maxStackSize).toBe(10);
            expect(debugInfo.currentContext).toBeTruthy();
            expect(debugInfo.stack).toHaveLength(1);
            expect(debugInfo.config).toBeTruthy();
        }');
    }
    describe('Error Handling', (') => {
        test('should handle errors gracefully in push operations', () => {
            // Test with invalid input types
            expect((') => navigationManager.pushContext(123, 'test').not.toThrow();
            expect((') => navigationManager.pushContext('test', 123).not.toThrow();
        }');
        test('should handle errors gracefully in pop operations', () => {
            expect(() => navigationManager.popContext().not.toThrow();
        });
    }
}');