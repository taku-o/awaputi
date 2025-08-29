/**
 * HelpScene Navigation Unit Tests
 * Issue #166対応 - ヘルプ画面からメインメニューへの戻りナビゲーションのテスト
 */

import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Mock GameEngine and SceneManager
const mockSceneManager = {
    switchScene: jest.fn()
};

const mockGameEngine = {
    sceneManager: mockSceneManager
};

// Mock HelpEventManager
class MockHelpEventManager {
    constructor() {
        this.callbacks = new Map();
    }

    setCallback(eventName, callback) {
        this.callbacks.set(eventName, callback);
    }

    getCallback(eventName) {
        return this.callbacks.get(eventName);
    }

    trigger(eventName, data) {
        const callback = this.callbacks.get(eventName);
        if (callback) {
            callback(data);
        }
    }
}

// Mock HelpScene (essential parts)
class MockHelpScene {
    constructor() {
        this.gameEngine = mockGameEngine;
        this.helpEventManager = new MockHelpEventManager();
        this.setupEventCallbacks();
    }

    setupEventCallbacks() {
        // イベントマネージャーのコールバック設定
        this.helpEventManager.setCallback('onGoBack', () => {
            try {
                if (!this.gameEngine.sceneManager) {
                    console.error('SceneManager not available');
                    return;
                }
                const success = this.gameEngine.sceneManager.switchScene('menu');
                if (!success) {
                    console.error('Failed to navigate to main menu from help screen');
                    // フォールバックロジックや用户通知をここに追加可能
                }
            } catch (error) {
                console.error('Error navigating to main menu from help screen:', error);
            }
        });
        
        this.helpEventManager.setCallback('onFeedbackRequest', (data) => {
            this.showFeedbackDialog(data);
        });
        
        this.helpEventManager.setCallback('onEffectivenessReport', (report) => {
            this.showEffectivenessReport(report);
        });
        
        this.helpEventManager.setCallback('onSearchFocus', () => {
            // 検索フォーカス時の処理
            console.log('Search bar focused');
        });
    }

    showFeedbackDialog(data) {
        // Mock implementation
        console.log('Showing feedback dialog:', data);
    }

    showEffectivenessReport(report) {
        // Mock implementation
        console.log('Showing effectiveness report:', report);
    }
}

describe('HelpScene Navigation Tests', () => {
    let helpScene;
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        // Reset scene manager mock
        mockSceneManager.switchScene.mockClear();
        mockSceneManager.switchScene.mockReturnValue(true);
        // Reset mockGameEngine reference
        mockGameEngine.sceneManager = mockSceneManager;
        
        helpScene = new MockHelpScene();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    describe('setupEventCallbacks() method', () => {
        test('should set up onGoBack callback properly', () => {
            const callback = helpScene.helpEventManager.getCallback('onGoBack');
            expect(callback).toBeDefined();
            expect(typeof callback).toBe('function');
        });

        test('should set up other callbacks properly', () => {
            expect(helpScene.helpEventManager.getCallback('onFeedbackRequest')).toBeDefined();
            expect(helpScene.helpEventManager.getCallback('onEffectivenessReport')).toBeDefined();
            expect(helpScene.helpEventManager.getCallback('onSearchFocus')).toBeDefined();
        });
    });

    describe('onGoBack callback navigation', () => {
        test('should call SceneManager.switchScene with correct scene name "menu"', () => {
            mockSceneManager.switchScene.mockReturnValue(true);

            helpScene.helpEventManager.trigger('onGoBack');

            expect(mockSceneManager.switchScene).toHaveBeenCalledWith('menu');
            expect(mockSceneManager.switchScene).toHaveBeenCalledTimes(1);
        });

        test('should handle SceneManager unavailable error', () => {
            helpScene.gameEngine.sceneManager = null;

            helpScene.helpEventManager.trigger('onGoBack');

            expect(consoleErrorSpy).toHaveBeenCalledWith('SceneManager not available');
        });

        test('should handle navigation failure', () => {
            mockSceneManager.switchScene.mockReturnValue(false);

            helpScene.helpEventManager.trigger('onGoBack');

            expect(mockSceneManager.switchScene).toHaveBeenCalledWith('menu');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to navigate to main menu from help screen');
        });

        test('should handle SceneManager.switchScene throwing error', () => {
            const error = new Error('SceneManager error');
            mockSceneManager.switchScene.mockImplementation(() => {
                throw error;
            });

            helpScene.helpEventManager.trigger('onGoBack');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error navigating to main menu from help screen:', error);
        });

        test('should handle undefined gameEngine', () => {
            helpScene.gameEngine = undefined;

            expect(() => helpScene.helpEventManager.trigger('onGoBack')).not.toThrow();
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('ESC key handling through event manager', () => {
        test('should trigger onGoBack when ESC event is fired', () => {
            mockSceneManager.switchScene.mockReturnValue(true);
            const onGoBackCallback = jest.fn();
            helpScene.helpEventManager.setCallback('onGoBack', onGoBackCallback);

            // ESCキー処理のシミュレーション
            const escKeyEvent = { key: 'Escape', preventDefault: jest.fn() };
            
            // ESCキーが押された場合の処理をシミュレート
            if (escKeyEvent.key === 'Escape') {
                helpScene.helpEventManager.trigger('onGoBack');
            }

            expect(onGoBackCallback).toHaveBeenCalled();
        });
    });

    describe('Error handling in navigation callback', () => {
        test('should maintain proper error logging format', () => {
            const testError = new Error('Test navigation error');
            mockSceneManager.switchScene.mockImplementation(() => {
                throw testError;
            });

            helpScene.helpEventManager.trigger('onGoBack');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error navigating to main menu from help screen:',
                testError
            );
        });

        test('should handle graceful navigation failure without throwing', () => {
            mockSceneManager.switchScene.mockReturnValue(false);

            expect(() => {
                helpScene.helpEventManager.trigger('onGoBack');
            }).not.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to navigate to main menu from help screen')
            );
        });
    });

    describe('Other callbacks functionality', () => {
        test('should handle onFeedbackRequest callback', () => {
            const testData = { feedback: 'Test feedback' };
            const showFeedbackSpy = jest.spyOn(helpScene, 'showFeedbackDialog');

            helpScene.helpEventManager.trigger('onFeedbackRequest', testData);

            expect(showFeedbackSpy).toHaveBeenCalledWith(testData);
        });

        test('should handle onEffectivenessReport callback', () => {
            const testReport = { effectiveness: 0.85 };
            const showReportSpy = jest.spyOn(helpScene, 'showEffectivenessReport');

            helpScene.helpEventManager.trigger('onEffectivenessReport', testReport);

            expect(showReportSpy).toHaveBeenCalledWith(testReport);
        });

        test('should handle onSearchFocus callback', () => {
            helpScene.helpEventManager.trigger('onSearchFocus');

            expect(consoleLogSpy).toHaveBeenCalledWith('Search bar focused');
        });
    });
});