import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * HelpScene-navigation.test.js
 * 
 * HelpSceneのコンテキスト依存ナビゲーションテスト
 * Issue #163 - Duplicate help/settings screen consolidation
 * Task 7 - Context-aware navigation support for HelpScene
 */
import { HelpScene } from '../../src/scenes/HelpScene';

// DOM APIのモック
const mockDocument = {
    fullscreenElement: null,
    documentElement: {
        requestFullscreen: jest.fn(),
        exitFullscreen: jest.fn()
    }
};

// グローバル変数のモック
(global as any).document = mockDocument;
(global as any).navigator = {
    userAgent: 'test-agent'
};
(global as any).window = {
    innerWidth: 1920,
    innerHeight: 1080
};

describe('HelpScene Context-Aware Navigation', () => {
    let helpScene: any;
    let mockGameEngine: any;
    
    beforeEach(() => {
        // Mock GameEngine
        mockGameEngine = {
            sceneManager: {
                hasScene: jest.fn().mockReturnValue(true),
                switchScene: jest.fn().mockReturnValue(true),
                currentScene: {
                    constructor: { name: 'HelpScene' }
                }
            },
            localizationManager: {
                getCurrentLanguage: jest.fn().mockReturnValue('ja'),
                t: jest.fn().mockImplementation((key, defaultValue) => defaultValue)
            },
            accessibilityManager: {
                announceToScreenReader: jest.fn()
            }
        };
        
        // HelpSceneのサブコンポーネントをモック
        jest.mock('../../src/scenes/help-scene/HelpAccessibilityManager.js', () => ({
            HelpAccessibilityManager: jest.fn().mockImplementation(() => ({
                enableAccessibilityFeatures: jest.fn(),
                disableAccessibilityFeatures: jest.fn(),
                announceToScreenReader: jest.fn(),
                destroy: jest.fn(),
                getAccessibilityState: jest.fn().mockReturnValue({})
            }))
        }));
        
        jest.mock('../../src/scenes/help-scene/HelpContentManager.js', () => ({
            HelpContentManager: jest.fn().mockImplementation(() => ({
                initialize: jest.fn().mockResolvedValue(true),
                getState: jest.fn().mockReturnValue({}),
                getHelpAnalytics: jest.fn().mockReturnValue({
                    startHelpSession: jest.fn(),
                    endHelpSession: jest.fn()
                }),
                getHelpFeedbackSystem: jest.fn().mockReturnValue({
                    endContentView: jest.fn()
                }),
                getCurrentTopic: jest.fn(),
                destroy: jest.fn()
            }))
        }));
        
        jest.mock('../../src/scenes/help-scene/HelpAnimationManager.js', () => ({
            HelpAnimationManager: jest.fn().mockImplementation(() => ({
                updateAnimations: jest.fn(),
                getAllAnimationStates: jest.fn().mockReturnValue({}),
                destroy: jest.fn()
            })),
            HelpTransitionRenderer: jest.fn().mockImplementation(() => ({}))
        }));
        
        jest.mock('../../src/scenes/help-scene/HelpRenderer.js', () => ({
            HelpRenderer: jest.fn().mockImplementation(() => ({
                render: jest.fn()
            }))
        }));
        
        jest.mock('../../src/scenes/help-scene/HelpEventManager.js', () => ({
            HelpEventManager: jest.fn().mockImplementation(() => ({
                setCallback: jest.fn(),
                setupEventListeners: jest.fn(),
                removeEventListeners: jest.fn(),
                getEventState: jest.fn().mockReturnValue({}),
                destroy: jest.fn()
            }))
        }));
        
        helpScene = new HelpScene(mockGameEngine);
    });
    
    afterEach(() => {
        if (helpScene && helpScene.destroy) {
            helpScene.destroy();
        }
        jest.clearAllMocks();
    });
    
    describe('Context Data Processing', () => {
        test('should handle standard help mode', () => {
            const contextData: Record<string, any> = {};
            
            helpScene.enter(contextData);
            // 標準モードが設定されることを確認
            expect(helpScene.loggingSystem.info).toHaveBeenCalledWith(
                'HelpScene',
                'Standard help mode activated'
            );
        });
        
        test('should handle contextual help mode', () => {
            const contextData = {
                contextual: true,
                sourceScene: 'game',
                accessMethod: 'keyboard_f1'
            };
            
            helpScene.enter(contextData);
            // コンテキスト依存モードが設定されることを確認
            expect(helpScene.loggingSystem.info).toHaveBeenCalledWith(
                'HelpScene',
                'Contextual help mode for scene: game'
            );
        });
        
        test('should handle documentation help mode', () => {
            const contextData = {
                documentation: true,
                sourceScene: 'settings',
                accessMethod: 'keyboard_ctrl_h'
            };
            
            helpScene.enter(contextData);
            expect(helpScene.loggingSystem.info).toHaveBeenCalledWith(
                'HelpScene',
                'Documentation help mode activated'
            );
        });
        
        test('should handle quick help mode', () => {
            const contextData = {
                quick: true,
                sourceScene: 'menu',
                accessMethod: 'keyboard_ctrl_slash'
            };
            
            helpScene.enter(contextData);
            expect(helpScene.loggingSystem.info).toHaveBeenCalledWith(
                'HelpScene',
                'Quick help mode activated'
            );
        });
    });
    
    describe('Navigation Context Integration', () => {
        test('should use NavigationContextManager for go back', () => {
            // ナビゲーションコンテキストをモック
            helpScene.navigationContext.getReturnDestination = jest.fn().mockReturnValue('settings') as jest.Mock;
            helpScene.navigationContext.popContext = jest.fn() as jest.Mock;
            
            // onGoBackコールバックを取得して実行
            const callbacks = helpScene.helpEventManager.setCallback.mock.calls;
            const onGoBackCallback = callbacks.find(call => call[0] === 'onGoBack')[1];
            
            onGoBackCallback();
            
            expect(helpScene.navigationContext.getReturnDestination).toHaveBeenCalled();
            expect(helpScene.navigationContext.popContext).toHaveBeenCalled();
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('settings');
        });
        
        test('should fallback to menu when no return destination', () => {
            // 戻り先がない場合のテスト
            helpScene.navigationContext.getReturnDestination = jest.fn().mockReturnValue(null) as jest.Mock;
            helpScene.navigationContext.popContext = jest.fn() as jest.Mock;
            
            const callbacks = helpScene.helpEventManager.setCallback.mock.calls;
            const onGoBackCallback = callbacks.find(call => call[0] === 'onGoBack')[1];
            
            onGoBackCallback();
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });
        
        test('should handle scene switch failure with fallback', () => {
            helpScene.navigationContext.getReturnDestination = jest.fn().mockReturnValue('nonexistent') as jest.Mock;
            helpScene.navigationContext.popContext = jest.fn() as jest.Mock;
            mockGameEngine.sceneManager.switchScene = jest.fn()
                .mockReturnValueOnce(false)  // 最初の試行は失敗
                .mockReturnValueOnce(true) as jest.Mock;  // フォールバックは成功
            
            const callbacks = helpScene.helpEventManager.setCallback.mock.calls;
            const onGoBackCallback = callbacks.find(call => call[0] === 'onGoBack')[1];
            
            onGoBackCallback();
            
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('nonexistent');
            expect(mockGameEngine.sceneManager.switchScene).toHaveBeenCalledWith('menu');
        });
    });
    
    describe('Analytics Integration', () => {
        test('should track contextual help analytics', () => {
            const mockAnalytics = {
                startHelpSession: jest.fn(),
                endHelpSession: jest.fn()
            };
            
            helpScene.helpContentManager.getHelpAnalytics = jest.fn().mockReturnValue(mockAnalytics) as jest.Mock;
            
            const contextData = {
                contextual: true,
                sourceScene: 'game',
                accessMethod: 'keyboard_f1'
            };
            
            helpScene.enter(contextData);
            
            expect(mockAnalytics.startHelpSession).toHaveBeenCalledWith('help_scene', {
                initialCategory: 'contextual',
                accessMethod: 'keyboard_f1',
                sourceScene: 'game',
                userAgent: 'test-agent',
                screenSize: '1920x1080',
                language: 'ja'
            });
        });
        
        test('should track standard help analytics', () => {
            const mockAnalytics = {
                startHelpSession: jest.fn(),
                endHelpSession: jest.fn()
            };
            
            helpScene.helpContentManager.getHelpAnalytics = jest.fn().mockReturnValue(mockAnalytics) as jest.Mock;
            
            const contextData = {
                accessMethod: 'menu_click'
            };
            
            helpScene.enter(contextData);
            
            expect(mockAnalytics.startHelpSession).toHaveBeenCalledWith('help_scene', {
                initialCategory: 'gameplay',
                accessMethod: 'menu_click',
                sourceScene: 'unknown',
                userAgent: 'test-agent',
                screenSize: '1920x1080',
                language: 'ja'
            });
        });
    });
    
    describe('Accessibility Announcements', () => {
        test('should announce contextual help entry', () => {
            const contextData = {
                contextual: true,
                sourceScene: 'game'
            };
            
            helpScene.enter(contextData);
            const announceCalls = helpScene.helpAccessibilityManager.announceToScreenReader.mock.calls;
            expect(announceCalls.length).toBeGreaterThan(0);
            const lastCall = announceCalls[announceCalls.length - 1];
            expect(lastCall[0]).toContain('コンテキスト依存のヘルプを表示しています。');
        });
        
        test('should announce documentation help entry', () => {
            const contextData = {
                documentation: true,
                sourceScene: 'settings'
            };
            
            helpScene.enter(contextData);
            const announceCalls = helpScene.helpAccessibilityManager.announceToScreenReader.mock.calls;
            const lastCall = announceCalls[announceCalls.length - 1];
            expect(lastCall[0]).toContain('ドキュメントヘルプを表示しています。');
        });
        
        test('should announce quick help entry', () => {
            const contextData = {
                quick: true,
                sourceScene: 'menu'
            };
            
            helpScene.enter(contextData);
            const announceCalls = helpScene.helpAccessibilityManager.announceToScreenReader.mock.calls;
            const lastCall = announceCalls[announceCalls.length - 1];
            expect(lastCall[0]).toContain('クイックヘルプを表示しています。');
        });
    });
    
    describe('Error Handling', () => {
        test('should handle missing scene manager gracefully', () => {
            mockGameEngine.sceneManager = null;
            
            const callbacks = helpScene.helpEventManager.setCallback.mock.calls;
            const onGoBackCallback = callbacks.find(call => call[0] === 'onGoBack')[1];
            
            expect(() => onGoBackCallback()).not.toThrow();
        });
        
        test('should handle context processing errors', () => {
            // processEntryContextでエラーが発生する状況をシミュレート
            const originalProcessEntryContext = helpScene.processEntryContext;
            helpScene.processEntryContext = jest.fn().mockImplementation(() => {
                throw new Error('Context processing error');
            }) as jest.Mock;
            
            expect(() => helpScene.enter({ contextual: true })).not.toThrow();
            
            // 元のメソッドを復元
            helpScene.processEntryContext = originalProcessEntryContext;
        });
    });
    
    describe('Cleanup', () => {
        test('should cleanup NavigationContextManager on destroy', () => {
            helpScene.navigationContext.cleanup = jest.fn() as jest.Mock;
            
            helpScene.destroy();
            
            expect(helpScene.navigationContext.cleanup).toHaveBeenCalled();
        });
    });
});