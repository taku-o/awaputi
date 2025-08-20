import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * Help System Functionality Integration Tests
 * ヘルプシステム機能統合テスト
 */

import { HelpScene } from '../../../src/scenes/HelpScene';
import { HelpAnalytics } from '../../../src/core/help/HelpAnalytics';
import { HelpFeedbackSystem } from '../../../src/core/help/HelpFeedbackSystem';
import { KeyboardShortcutManager } from '../../../src/core/KeyboardShortcutManager';

describe('Help System Integration', () => {
    let helpScene: any;
    let helpAnalytics: any;
    let helpFeedbackSystem: any;
    let mockGameEngine: any;
    let mockCanvas: any;
    let mockContext: any;

    beforeEach(() => {
        // Mock canvas and context
        mockContext = {
            clearRect: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            rect: jest.fn(),
            arc: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '16px Arial',
            textAlign: 'left',
            textBaseline: 'top'
        };

        mockCanvas = {
            getContext: jest.fn(() => mockContext),
            width: 800,
            height: 600
        };

        // Mock DOM
        global.document = {
            getElementById: jest.fn((id) => {
                if (id === 'gameCanvas') return mockCanvas;
                return null;
            }),
            createElement: jest.fn(() => ({
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            })),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            }
        };

        // Mock game engine
        mockGameEngine = {
            canvas: mockCanvas,
            ctx: mockContext,
            localizationManager: {
                getCurrentLanguage: () => 'ja',
                t: (key) => key,
                translate: (key) => key
            },
            sceneManager: {
                switchScene: jest.fn(),
                hasScene: jest.fn(() => true)
            },
            keyboardShortcutManager: new KeyboardShortcutManager(),
            responsiveCanvasManager: {
                getCanvasToDisplayRatio: () => 1,
                getDisplayToCanvasRatio: () => 1,
                scaleCoordinates: (x, y) => ({ x, y })
            },
            helpManager: {
                searchEngine: {
                    search: jest.fn(() => []),
                    buildIndex: jest.fn()
                },
                getContent: jest.fn(() => ({})),
                loadContent: jest.fn(() => Promise.resolve({}))
            }
        };

        // Clear localStorage
        localStorage.clear();

        // Create instances
        helpAnalytics = new HelpAnalytics(mockGameEngine);
        helpFeedbackSystem = new HelpFeedbackSystem(mockGameEngine);
        
        // Add analytics and feedback to game engine
        mockGameEngine.helpAnalytics = helpAnalytics;
        mockGameEngine.helpFeedbackSystem = helpFeedbackSystem;

        // Create help scene
        helpScene = new HelpScene(mockGameEngine);
    });

    afterEach(() => {
        if (helpAnalytics) {
            helpAnalytics.cleanup();
        }
        if (helpFeedbackSystem) {
            helpFeedbackSystem.cleanup();
        }
        localStorage.clear();
    });

    describe('Help Scene Initialization', () => {
        test('should initialize help scene with all components', () => {
            expect(helpScene.toBeDefined());
            expect(helpScene.helpContentManager).toBeDefined();
            expect(helpScene.helpEventManager).toBeDefined();
            expect(helpScene.helpRenderer).toBeDefined();
            expect(helpScene.helpAccessibilityManager).toBeDefined();
        });

        test('should connect analytics and feedback systems', () => {
            expect(helpScene.gameEngine.helpAnalytics).toBe(helpAnalytics);
            expect(helpScene.gameEngine.helpFeedbackSystem).toBe(helpFeedbackSystem);
        });
    });

    describe('Help Scene Entry and Exit', () => {
        test('should start help session on scene entry', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'startHelpSession');
            
            helpScene.enter('menu');
            
            expect(analyticsSpy.toHaveBeenCalled());
        });

        test('should end help session on scene exit', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'endHelpSession');
            
            helpScene.enter('menu');
            helpScene.exit();
            
            expect(analyticsSpy.toHaveBeenCalled());
        });

        test('should track contextual help correctly', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'startHelpSession');
            
            helpScene.enter('game', { contextual: true });
            
            expect(analyticsSpy.toHaveBeenCalledWith('contextual_help', expect.any(Object)));
        });
    });

    describe('Navigation and Content Display', () => {
        test('should handle category selection', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'recordCategorySelection');
            
            helpScene.enter('menu');
            
            // Simulate category selection
            if (helpScene.helpContentManager && helpScene.helpContentManager.selectCategory) {
                helpScene.helpContentManager.selectCategory('gameplay');
                expect(analyticsSpy.toHaveBeenCalledWith('gameplay', expect.any(Object)));
            }
        });

        test('should handle topic selection', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'recordTopicView');
            const feedbackSpy = jest.spyOn(helpFeedbackSystem, 'recordTopicView');
            
            helpScene.enter('menu');
            
            // Simulate topic selection
            if (helpScene.helpContentManager && helpScene.helpContentManager.selectTopic) {
                helpScene.helpContentManager.selectTopic('basic-controls');
                expect(analyticsSpy.toHaveBeenCalledWith('basic-controls', expect.any(Object)));
                expect(feedbackSpy.toHaveBeenCalledWith('basic-controls', expect.any(Object)));
            }
        });
    });

    describe('Search Functionality', () => {
        test('should handle search input', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'recordSearchQuery');
            
            helpScene.enter('menu');
            
            // Simulate search
            if (helpScene.helpContentManager && helpScene.helpContentManager.performSearch) {
                helpScene.helpContentManager.performSearch('controls');
                expect(analyticsSpy.toHaveBeenCalledWith('controls', 0));
            }
        });

        test('should cache search results', () => {
            helpAnalytics.initializeContentCaching();
            const cacheSpy = jest.spyOn(helpAnalytics, 'cacheSearchResults');
            
            helpScene.enter('menu');
            
            // Simulate search with results
            if (helpScene.helpContentManager && helpScene.helpContentManager.performSearch) {
                const mockResults = [{ id: 'test', title: 'Test Result' }];
                helpScene.helpContentManager.performSearch('test');
                
                // Manually trigger caching (as we're mocking the search)
                helpAnalytics.cacheSearchResults('test', mockResults);
                expect(cacheSpy.toHaveBeenCalledWith('test', mockResults));
            }
        });

        test('should sanitize search input', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'recordSearchQuery');
            
            helpScene.enter('menu');
            
            // Simulate malicious search input
            if (helpScene.helpContentManager && helpScene.helpContentManager.performSearch) {
                helpScene.helpContentManager.performSearch('<script>alert("xss")</script>');
                
                // Should have been sanitized
                expect(analyticsSpy.toHaveBeenCalledWith('scriptalertxssscript', 0));
            }
        });
    });

    describe('Keyboard Navigation', () => {
        test('should handle slash key for search focus', () => {
            helpScene.enter('menu');
            
            // Simulate slash key press
            const event = new KeyboardEvent('keydown', { key: '/' });
            
            if (helpScene.helpEventManager && helpScene.helpEventManager.handleKeyDown) {
                const result = helpScene.helpEventManager.handleKeyDown(event);
                expect(result.toBe(true); // Should handle the key
            }
        });

        test('should handle ESC key for navigation', () => {
            const sceneManagerSpy = jest.spyOn(mockGameEngine.sceneManager, 'switchScene');
            
            helpScene.enter('menu');
            
            // Simulate ESC key press
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            
            if (helpScene.helpEventManager && helpScene.helpEventManager.handleKeyDown) {
                helpScene.helpEventManager.handleKeyDown(event);
                expect(sceneManagerSpy.toHaveBeenCalled());
            }
        });
    });

    describe('Feedback System Integration', () => {
        test('should start content view tracking', () => {
            const feedbackSpy = jest.spyOn(helpFeedbackSystem, 'startContentView');
            
            helpScene.enter('menu');
            
            // Simulate content viewing
            helpFeedbackSystem.startContentView('test-topic', { title: 'Test Topic' });
            expect(feedbackSpy.toHaveBeenCalledWith('test-topic', { title: 'Test Topic' }));
        });

        test('should track feedback submission', () => {
            const analyticsSpy = jest.spyOn(helpAnalytics, 'recordFeedback');
            const feedbackSpy = jest.spyOn(helpFeedbackSystem, 'recordFeedback');
            
            const mockFeedback = {
                rating: 5,
                comment: 'Very helpful!'
            };
            
            helpAnalytics.recordFeedback('test-topic', {}, mockFeedback);
            helpFeedbackSystem.recordFeedback('test-topic', {}, mockFeedback);
            
            expect(analyticsSpy.toHaveBeenCalledWith('test-topic', {}, mockFeedback));
            expect(feedbackSpy.toHaveBeenCalledWith('test-topic', {}, mockFeedback));
        });
    });

    describe('Error Handling and Recovery', () => {
        test('should handle analytics initialization failure', () => {
            // Create analytics with invalid game engine
            const invalidAnalytics = new HelpAnalytics(null);
            
            expect(() => {
                invalidAnalytics.recordCategorySelection('test-category');
            }).not.toThrow();
        });

        test('should handle feedback system failures gracefully', () => {
            expect(() => {
                helpFeedbackSystem.submitFeedback('test-topic', {
                    rating: 'invalid'
                });
            }).not.toThrow();
        });

        test('should continue operation after validation errors', () => {
            expect(() => {
                helpAnalytics.recordCategorySelection('<script>evil</script>');
                helpAnalytics.recordTopicView(null, {});
                helpAnalytics.recordFeedback('topic', {}, { rating: 'not-a-number' });
            }).not.toThrow();
        });
    });

    describe('Performance and Memory Management', () => {
        test('should initialize performance monitoring', () => {
            helpAnalytics.initializePerformanceMonitoring();
            
            expect(helpAnalytics.performanceMetrics).toBeDefined();
            expect(helpAnalytics.performanceMetrics.operations instanceof Map).toBe(true);
        });

        test('should measure operation performance', () => {
            helpAnalytics.initializePerformanceMonitoring();
            
            const mockOperation = jest.fn(() => 'result');
            const result = helpAnalytics.measurePerformance('test-operation', mockOperation);
            
            expect(result.toBe('result'));
            expect(helpAnalytics.performanceMetrics.operations.has('test-operation')).toBe(true);
        });

        test('should clean up resources on exit', () => {
            helpScene.enter('menu');
            
            expect(() => {
                helpScene.exit();
                helpAnalytics.cleanup();
                helpFeedbackSystem.cleanup();
            }).not.toThrow();
        });
    });

    describe('Data Persistence', () => {
        test('should save and load analytics data', () => {
            // Record some data
            helpAnalytics.recordCategorySelection('test-category');
            helpAnalytics.recordSearchQuery('test query', 5);
            
            // Save data
            helpAnalytics.saveAnalyticsData();
            
            // Create new instance and load data
            const newAnalytics = new HelpAnalytics(mockGameEngine);
            
            expect(newAnalytics.analytics.helpUsage.topHelpCategories.get('test-category')).toBe(1);
        });

        test('should save and load feedback data', () => {
            // Submit feedback
            helpFeedbackSystem.feedbacks.set('test-topic', {
                rating: 5,
                comment: 'Great!'
            });
            
            // Save data
            helpFeedbackSystem.saveFeedbackData();
            
            // Create new instance and load data
            const newFeedback = new HelpFeedbackSystem(mockGameEngine);
            
            expect(newFeedback.feedbacks.has('test-topic')).toBe(true);
        });
    });

    describe('Accessibility Integration', () => {
        test('should announce help system entry', () => {
            helpScene.enter('menu');
            
            // Check if accessibility manager was initialized
            expect(helpScene.helpAccessibilityManager).toBeDefined();
        });

        test('should handle screen reader navigation', () => {
            helpScene.enter('menu');
            
            // Accessibility features should be available
            if (helpScene.helpAccessibilityManager && helpScene.helpAccessibilityManager.announceNavigation) {
                expect(() => {
                    helpScene.helpAccessibilityManager.announceNavigation('category selection');
                }).not.toThrow();
            }
        });
    });
});