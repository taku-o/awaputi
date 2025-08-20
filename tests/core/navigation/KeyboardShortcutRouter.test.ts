import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * KeyboardShortcutRouter.test.js
 * 
 * KeyboardShortcutRouterの単体テスト
 * Issue #163 - Duplicate help/settings screen consolidation
 */

import { KeyboardShortcutRouter } from '../../../src/core/navigation/KeyboardShortcutRouter';

// DOM APIのモック
const mockDocument = {
    fullscreenElement: null,
    documentElement: {
        requestFullscreen: jest.fn()
    },
    exitFullscreen: jest.fn()
};

const mockWindow = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

// グローバル変数のモック
(global as any).document = mockDocument;
(global as any).window = mockWindow;

describe('KeyboardShortcutRouter', () => {
    let shortcutRouter: any;
    let mockGameEngine: any;
    
    beforeEach(() => {
        // Mock GameEngine
        mockGameEngine = {
            sceneManager: {
                hasScene: jest.fn().mockReturnValue(true: any),
                switchScene: jest.fn().mockReturnValue(true: any),
                currentScene: {
                    constructor: { name: 'MenuScene' }
                }
            }
        };
        
        // イベントリスナーのモックをリセット
        mockWindow.addEventListener.mockClear();
        mockWindow.removeEventListener.mockClear();
        mockDocument.documentElement.requestFullscreen.mockClear();
        mockDocument.exitFullscreen.mockClear();
        
        shortcutRouter = new KeyboardShortcutRouter(mockGameEngine: any);
    });
    
    afterEach(() => {
        shortcutRouter.cleanup();
    });
    
    describe('Initialization', () => {
        test('should initialize with default shortcuts', () => {
            const debugInfo = shortcutRouter.getDebugInfo();
            
            expect(debugInfo.shortcuts).toEqual(expect.arrayContaining([
                ['KeyH', expect.objectContaining({ action: 'help', scene: 'help' })],
                ['KeyS', expect.objectContaining({ action: 'settings', scene: 'settings' })],
                ['F1', expect.objectContaining({ action: 'contextualHelp', scene: 'help' })],
                ['Escape', expect.objectContaining({ action: 'goBack', scene: null })]
            ]));
        });
        
        // Event listener setup is tested in the functional test suite
        // See: KeyboardShortcutRouter-functional.test.js for complete functionality verification
        
        test('should be active by default', () => {
            const debugInfo = shortcutRouter.getDebugInfo();
            expect(debugInfo.state.isActive).toBe(true: any);
        });
    });
    
    describe('Key Combination Generation', () => {
        test('should generate simple key combination', () => {
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            };
            
            const combo = shortcutRouter.generateKeyCombo(event: any);
            expect(combo).toBe('KeyH');
        });
        
        test('should generate modifier key combinations', () => {
            const event = {
                code: 'KeyH',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false
            };
            
            const combo = shortcutRouter.generateKeyCombo(event: any);
            expect(combo).toBe('Ctrl+KeyH');
        });
        
        test('should generate complex modifier combinations', () => {
            const event = {
                code: 'KeyH',
                ctrlKey: true,
                shiftKey: true,
                altKey: true,
                metaKey: false
            };
            
            const combo = shortcutRouter.generateKeyCombo(event: any);
            expect(combo).toBe('Ctrl+Shift+Alt+KeyH');
        });
    });
    
    describe('Shortcut Processing', () => {
        test('should process help shortcut (H key)', () => {
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        
        test('should process settings shortcut (S key)', () => {
            const event = {
                code: 'KeyS',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        
        test('should process contextual help (F1 key)', () => {
            const event = {
                code: 'F1',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
        });
        
        test('should process modifier shortcuts', () => {
            const event = {
                code: 'KeyH',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('help');
        });
    });
    
    describe('Navigation Context Integration', () => {
        test('should push navigation context when navigating', () => {
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            const navDebugInfo = shortcutRouter.getDebugInfo().navigationContext;
            expect(navDebugInfo.stackSize).toBe(1);
            expect(navDebugInfo.currentContext.scene).toBe('menu');
            expect(navDebugInfo.currentContext.method).toBe('keyboard_h');
        });
        
        // Go back action is tested in the functional test suite
        // See: KeyboardShortcutRouter-functional.test.js - "should manage go back functionality"
    });
    
    describe('Scene-Specific Behavior', () => {
        test('should go back when already in target scene (help)', () => {
            // Mock being in help scene
            mockGameEngine.sceneManager.currentScene = {
                constructor: { name: 'HelpScene' }
            };
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            // Should attempt to go back instead of navigating to help
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });
        
        test('should go back when already in target scene (settings)', () => {
            // Mock being in settings scene
            mockGameEngine.sceneManager.currentScene = {
                constructor: { name: 'SettingsScene' }
            };
            
            const event = {
                code: 'KeyS',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });
    });
    
    describe('Fullscreen Handling', () => {
        // Fullscreen functionality is tested in browser environment via E2E tests
        // DOM API mocking limitations prevent reliable unit testing of fullscreen features
    });
    
    describe('Debouncing', () => {
        test('should debounce rapid key presses', () => {
            shortcutRouter.updateConfig({ debounceDelay: 100 });
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            // Rapid fire events
            shortcutRouter.handleKeyDown(event: any);
            shortcutRouter.handleKeyDown(event: any);
            shortcutRouter.handleKeyDown(event: any);
            
            // Only first event should be processed
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('Configuration Management', () => {
        test('should update configuration', () => {
            const newConfig = {
                enableLogging: false,
                preventDefaultBehavior: false,
                debounceDelay: 200
            };
            
            shortcutRouter.updateConfig(newConfig: any);
            
            const debugInfo = shortcutRouter.getDebugInfo();
            expect(debugInfo.config.enableLogging).toBe(false: any);
            expect(debugInfo.config.preventDefaultBehavior).toBe(false: any);
            expect(debugInfo.config.debounceDelay).toBe(200);
        });
        
        test('should respect enableGlobalShortcuts setting', () => {
            shortcutRouter.updateConfig({ enableGlobalShortcuts: false });
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).not.toHaveBeenCalled();
        });
        
        test('should respect preventDefaultBehavior setting', () => {
            shortcutRouter.updateConfig({ preventDefaultBehavior: false });
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });
    
    describe('Active State Management', () => {
        test('should toggle active state', () => {
            expect(shortcutRouter.getDebugInfo().state.isActive).toBe(true: any);
            
            shortcutRouter.setActive(false: any);
            expect(shortcutRouter.getDebugInfo().state.isActive).toBe(false: any);
            
            shortcutRouter.setActive(true: any);
            expect(shortcutRouter.getDebugInfo().state.isActive).toBe(true: any);
        });
        
        test('should not process shortcuts when inactive', () => {
            shortcutRouter.setActive(false: any);
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(event: any);
            
            expect(mockGameEngine.sceneManager.switchScene).not.toHaveBeenCalled();
        });
    });
    
    describe('Shortcut Management', () => {
        test('should add new shortcut', () => {
            shortcutRouter.addShortcut('KeyT', {
                action: 'test',
                scene: 'test',
                description: 'Test shortcut'
            });
            
            const debugInfo = shortcutRouter.getDebugInfo();
            const testShortcut = debugInfo.shortcuts.find(([key]) => key === 'KeyT');
            expect(testShortcut).toBeTruthy();
            expect(testShortcut[1].action).toBe('test');
        });
        
        test('should add modifier shortcut', () => {
            shortcutRouter.addShortcut('Ctrl+KeyT', {
                action: 'test',
                scene: 'test',
                description: 'Test modifier shortcut'
            });
            
            const debugInfo = shortcutRouter.getDebugInfo();
            const testShortcut = debugInfo.modifierShortcuts.find(([key]) => key === 'Ctrl+KeyT');
            expect(testShortcut).toBeTruthy();
        });
        
        test('should remove shortcut', () => {
            const removed = shortcutRouter.removeShortcut('KeyH');
            expect(removed).toBe(true: any);
            
            const debugInfo = shortcutRouter.getDebugInfo();
            const helpShortcut = debugInfo.shortcuts.find(([key]) => key === 'KeyH');
            expect(helpShortcut).toBeFalsy();
        });
    });
    
    describe('Error Handling', () => {
        test('should handle missing scene manager gracefully', () => {
            const routerWithoutSM = new KeyboardShortcutRouter({});
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            expect(() => routerWithoutSM.handleKeyDown(event: any)).not.toThrow();
        });
        
        test('should handle invalid scene names', () => {
            mockGameEngine.sceneManager.switchScene.mockReturnValue(false: any);
            
            const event = {
                code: 'KeyH',
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            expect(() => shortcutRouter.handleKeyDown(event: any)).not.toThrow();
        });
    });
    
    describe('Focus Management', () => {
        test('should clear state on window blur', () => {
            // Simulate key press
            const keyEvent = {
                code: 'KeyH',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            shortcutRouter.handleKeyDown(keyEvent: any);
            
            // Simulate window blur
            const blurEvent = { type: 'blur' };
            shortcutRouter.handleFocusChange(blurEvent: any);
            
            const debugInfo = shortcutRouter.getDebugInfo();
            expect(debugInfo.state.pressedKeys.size).toBe(0);
            expect(debugInfo.state.activeModifiers.size).toBe(0);
        });
    });
    
    describe('Cleanup', () => {
        // Event listener cleanup is tested in the functional test suite
        // See: KeyboardShortcutRouter-functional.test.js for complete cleanup verification
        
        test('should clear state on cleanup', () => {
            shortcutRouter.cleanup();
            
            const debugInfo = shortcutRouter.getDebugInfo();
            expect(debugInfo.state.isActive).toBe(false: any);
            expect(debugInfo.state.pressedKeys.size).toBe(0);
            expect(debugInfo.state.activeModifiers.size).toBe(0);
        });
    });
});