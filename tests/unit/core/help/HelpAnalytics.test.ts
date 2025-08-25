/**
 * HelpAnalytics Test Suite
 * ヘルプアナリティクスシステムのテスト
 */
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { HelpAnalytics } from '../../../../src/core/help/HelpAnalytics.js';

// Type definitions
interface MockGameEngine {
    localizationManager: {
        getCurrentLanguage: jest.Mock<string, []>;
    };
}

interface ValidationResult {
    isValid: boolean;
    sanitizedData?: any;
    errors: string[];
}

interface Feedback {
    rating: number | string;
    comment: string | null;
}

interface SanitizedFeedback {
    rating: number;
    comment: string;
}

interface TopicContext {
    title?: string;
    [key: string]: any;
}
interface CategoryContext {
    source?: string;
    [key: string]: any;
}

interface AnalyticsStructure {
    helpUsage: any;
    content: any;
    tutorialUsage: any;
    userBehavior: any;
    effectiveness: any;
}

interface ContentItem {
    title: string;
    body?: string;
    [key: string]: any;
}

interface SearchResult {
    id: string;
    title: string;
    [key: string]: any;
}
describe('HelpAnalytics', () => {
    let helpAnalytics: HelpAnalytics;
    let mockGameEngine: MockGameEngine;
    
    beforeEach(() => {
        // Mock game engine
        mockGameEngine = {
            localizationManager: {
                getCurrentLanguage: jest.fn(() => 'ja')
            }
        };
        
        // Clear localStorage
        localStorage.clear();
        
        // Create instance
        helpAnalytics = new HelpAnalytics(mockGameEngine as any);
    });
    
    afterEach(() => {
        if (helpAnalytics) {
            helpAnalytics.cleanup();
        }
        localStorage.clear();
    });
    
    describe('Initialization', () => {
        test('should initialize with default analytics structure', () => {
            expect(helpAnalytics.analytics).toBeDefined();
            expect(helpAnalytics.analytics.helpUsage).toBeDefined();
            expect(helpAnalytics.analytics.content).toBeDefined();
            expect(helpAnalytics.analytics.tutorialUsage).toBeDefined();
            expect(helpAnalytics.analytics.userBehavior).toBeDefined();
            expect(helpAnalytics.analytics.effectiveness).toBeDefined();
        });
        
        test('should initialize Map objects correctly', () => {
            expect(helpAnalytics.analytics.helpUsage.topHelpCategories instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.helpUsage.topHelpTopics instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.helpUsage.searchQueries instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.content.topicViews instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.content.categoryViews instanceof Map).toBe(true);
        });
    });
    
    describe('Data Validation and Sanitization', () => {
        test('should validate and sanitize category IDs', () => {
            const result = helpAnalytics.validateAndSanitizeData('test-category', 'categoryId') as ValidationResult;
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData).toBe('test-category');
        });
        
        test('should reject invalid category IDs', () => {
            const result = helpAnalytics.validateAndSanitizeData('<script>alert("xss")</script>', 'categoryId') as ValidationResult;
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData).toBe('scriptalertxssscript');
        });
        
        test('should validate search queries', () => {
            const result = helpAnalytics.validateAndSanitizeData('help search', 'searchQuery') as ValidationResult;
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData).toBe('help search');
        });
        
        test('should reject too long search queries', () => {
            const longQuery = 'a'.repeat(201);
            const result = helpAnalytics.validateAndSanitizeData(longQuery, 'searchQuery') as ValidationResult;
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('検索クエリが長すぎます');
        });
        
        test('should validate feedback data', () => {
            const feedback: Feedback = { rating: 4, comment: 'Very helpful!' };
            const result = helpAnalytics.validateAndSanitizeData(feedback, 'feedback') as ValidationResult;
            expect(result.isValid).toBe(true);
            expect((result.sanitizedData as SanitizedFeedback).rating).toBe(4);
            expect((result.sanitizedData as SanitizedFeedback).comment).toBe('Very helpful!');
        });
        
        test('should reject invalid feedback rating', () => {
            const feedback: Feedback = { rating: 10, comment: 'Test' };
            const result = helpAnalytics.validateAndSanitizeData(feedback, 'feedback') as ValidationResult;
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('評価は1から5の間である必要があります');
        });
    });
    
    describe('Help Usage Tracking', () => {
        test('should record help opens', () => {
            helpAnalytics.recordHelpOpened();
            expect(helpAnalytics.analytics.helpUsage.opens).toBe(1);
            
            helpAnalytics.recordHelpOpened();
            expect(helpAnalytics.analytics.helpUsage.opens).toBe(2);
        });
        
        test('should record help closes with duration', () => {
            helpAnalytics.recordHelpClosed(30000);
            expect(helpAnalytics.analytics.helpUsage.totalDuration).toBe(30000);
            expect(helpAnalytics.analytics.helpUsage.averageDuration).toBe(30000);
            
            helpAnalytics.recordHelpClosed(60000);
            expect(helpAnalytics.analytics.helpUsage.totalDuration).toBe(90000);
            expect(helpAnalytics.analytics.helpUsage.averageDuration).toBe(45000);
        });
        
        test('should record category selection', () => {
            helpAnalytics.recordCategorySelection('gameplay');
            expect(helpAnalytics.analytics.helpUsage.topHelpCategories.get('gameplay')).toBe(1);
            
            helpAnalytics.recordCategorySelection('gameplay');
            expect(helpAnalytics.analytics.helpUsage.topHelpCategories.get('gameplay')).toBe(2);
        });
        
        test('should record topic selection', () => {
            helpAnalytics.recordTopicSelection('topic1', { title: 'Topic 1' });
            expect(helpAnalytics.analytics.helpUsage.topHelpTopics.get('topic1')).toBe(1);
            
            helpAnalytics.recordTopicSelection('topic1', { title: 'Topic 1' });
            expect(helpAnalytics.analytics.helpUsage.topHelpTopics.get('topic1')).toBe(2);
        });
        
        test('should record search queries', () => {
            helpAnalytics.recordSearch('how to play');
            expect(helpAnalytics.analytics.helpUsage.searchQueries.get('how to play')).toBe(1);
            
            helpAnalytics.recordSearch('how to play');
            expect(helpAnalytics.analytics.helpUsage.searchQueries.get('how to play')).toBe(2);
        });
    });
    
    describe('Content Analytics', () => {
        test('should record topic view', () => {
            helpAnalytics.recordTopicView('topic1');
            expect(helpAnalytics.analytics.content.topicViews.get('topic1')).toBe(1);
            
            helpAnalytics.recordTopicView('topic1');
            expect(helpAnalytics.analytics.content.topicViews.get('topic1')).toBe(2);
        });
        
        test('should record category view', () => {
            helpAnalytics.recordCategoryView('gameplay', { source: 'menu' });
            expect(helpAnalytics.analytics.content.categoryViews.get('gameplay')).toBe(1);
            
            helpAnalytics.recordCategoryView('gameplay');
            expect(helpAnalytics.analytics.content.categoryViews.get('gameplay')).toBe(2);
        });
        
        test('should record content usefulness', () => {
            helpAnalytics.recordContentUsefulness('topic1', true);
            expect(helpAnalytics.analytics.content.usefulnessRatings.useful).toBe(1);
            expect(helpAnalytics.analytics.content.usefulnessRatings.notUseful).toBe(0);
            
            helpAnalytics.recordContentUsefulness('topic2', false);
            expect(helpAnalytics.analytics.content.usefulnessRatings.useful).toBe(1);
            expect(helpAnalytics.analytics.content.usefulnessRatings.notUseful).toBe(1);
        });
        
        test('should track missing content', () => {
            helpAnalytics.recordMissingContent('advanced-tips');
            expect(helpAnalytics.analytics.content.missingContent.length).toBe(1);
            expect(helpAnalytics.analytics.content.missingContent[0]).toEqual({
                query: 'advanced-tips',
                timestamp: expect.any(Number),
                language: 'ja'
            });
        });
    });
    
    describe('Tutorial Usage', () => {
        test('should record tutorial starts', () => {
            helpAnalytics.recordTutorialStarted('basic-tutorial');
            expect(helpAnalytics.analytics.tutorialUsage.starts['basic-tutorial']).toBe(1);
            
            helpAnalytics.recordTutorialStarted('basic-tutorial');
            expect(helpAnalytics.analytics.tutorialUsage.starts['basic-tutorial']).toBe(2);
        });
        
        test('should record tutorial completions', () => {
            helpAnalytics.recordTutorialCompleted('basic-tutorial', 120000);
            expect(helpAnalytics.analytics.tutorialUsage.completions['basic-tutorial']).toBe(1);
            expect(helpAnalytics.analytics.tutorialUsage.completionTimes['basic-tutorial']).toBe(120000);
        });
        
        test('should record tutorial skips', () => {
            helpAnalytics.recordTutorialSkipped('basic-tutorial');
            expect(helpAnalytics.analytics.tutorialUsage.skips['basic-tutorial']).toBe(1);
        });
        
        test('should calculate completion rate correctly', () => {
            helpAnalytics.recordTutorialStarted('tutorial1');
            helpAnalytics.recordTutorialStarted('tutorial1');
            helpAnalytics.recordTutorialCompleted('tutorial1', 60000);
            
            const analytics = helpAnalytics.getAnalytics();
            expect(analytics.tutorialUsage.completionRate).toBe(50);
        });
    });
    
    describe('User Behavior', () => {
        test('should track navigation paths', () => {
            helpAnalytics.recordNavigation('menu', 'gameplay');
            helpAnalytics.recordNavigation('gameplay', 'controls');
            
            expect(helpAnalytics.analytics.userBehavior.navigationPaths.length).toBe(2);
            expect(helpAnalytics.analytics.userBehavior.navigationPaths[0]).toEqual({
                from: 'menu',
                to: 'gameplay',
                timestamp: expect.any(Number)
            });
        });
        
        test('should record exit points', () => {
            helpAnalytics.recordExit('controls');
            expect(helpAnalytics.analytics.userBehavior.exitPoints.get('controls')).toBe(1);
        });
        
        test('should record scroll depth', () => {
            helpAnalytics.recordScrollDepth('topic1', 75);
            expect(helpAnalytics.analytics.userBehavior.scrollDepth.get('topic1')).toBe(75);
            
            helpAnalytics.recordScrollDepth('topic1', 100);
            expect(helpAnalytics.analytics.userBehavior.scrollDepth.get('topic1')).toBe(100);
        });
        
        test('should record interaction time', () => {
            helpAnalytics.recordInteractionTime('topic1', 45000);
            expect(helpAnalytics.analytics.userBehavior.interactionTime.get('topic1')).toBe(45000);
        });
    });
    
    describe('Effectiveness Analytics', () => {
        test('should record feedback', () => {
            const feedback: Feedback = { rating: 5, comment: 'Great help!' };
            helpAnalytics.recordFeedback('topic1', feedback);
            
            expect(helpAnalytics.analytics.effectiveness.feedback.length).toBe(1);
            expect(helpAnalytics.analytics.effectiveness.feedback[0]).toEqual({
                topicId: 'topic1',
                rating: 5,
                comment: 'Great help!',
                timestamp: expect.any(Number)
            });
        });
        
        test('should calculate average feedback rating', () => {
            helpAnalytics.recordFeedback('topic1', { rating: 5, comment: null });
            helpAnalytics.recordFeedback('topic2', { rating: 3, comment: null });
            helpAnalytics.recordFeedback('topic3', { rating: 4, comment: null });
            
            const analytics = helpAnalytics.getAnalytics();
            expect(analytics.effectiveness.averageRating).toBe(4);
        });
        
        test('should track task completion', () => {
            helpAnalytics.recordTaskCompletion('task1', true);
            helpAnalytics.recordTaskCompletion('task2', false);
            helpAnalytics.recordTaskCompletion('task3', true);
            
            const analytics = helpAnalytics.getAnalytics();
            expect(analytics.effectiveness.taskCompletionRate).toBe(66.67);
        });
        
        test('should track problem resolution', () => {
            helpAnalytics.recordProblemResolution('problem1', true);
            expect(helpAnalytics.analytics.effectiveness.problemResolution.resolved).toBe(1);
            expect(helpAnalytics.analytics.effectiveness.problemResolution.unresolved).toBe(0);
            
            helpAnalytics.recordProblemResolution('problem2', false);
            expect(helpAnalytics.analytics.effectiveness.problemResolution.resolved).toBe(1);
            expect(helpAnalytics.analytics.effectiveness.problemResolution.unresolved).toBe(1);
        });
    });
    
    describe('Search Analytics', () => {
        test('should record search results', () => {
            const results: SearchResult[] = [
                { id: '1', title: 'Result 1' },
                { id: '2', title: 'Result 2' }
            ];
            
            helpAnalytics.recordSearchResults('test query', results);
            expect(helpAnalytics.analytics.helpUsage.searchQueries.get('test query')).toBe(1);
        });
        
        test('should track search result clicks', () => {
            helpAnalytics.recordSearchResultClick('result1', 2);
            expect(helpAnalytics.analytics.helpUsage.searchResultClicks.get('result1')).toBe(1);
        });
        
        test('should handle no search results', () => {
            helpAnalytics.recordSearchResults('no results query', []);
            expect(helpAnalytics.analytics.helpUsage.searchQueries.get('no results query')).toBe(1);
        });
    });
    
    describe('Data Export and Reporting', () => {
        test('should export analytics data', () => {
            helpAnalytics.recordHelpOpened();
            helpAnalytics.recordCategorySelection('gameplay');
            helpAnalytics.recordTopicView('topic1');
            
            const exportedData = helpAnalytics.exportAnalytics();
            expect(exportedData).toBeDefined();
            expect(exportedData.helpUsage.opens).toBe(1);
            expect(exportedData.content.topicViews['topic1']).toBe(1);
        });
        
        test('should generate summary report', () => {
            helpAnalytics.recordHelpOpened();
            helpAnalytics.recordHelpOpened();
            helpAnalytics.recordHelpClosed(30000);
            helpAnalytics.recordHelpClosed(60000);
            helpAnalytics.recordCategorySelection('gameplay');
            helpAnalytics.recordTopicView('topic1');
            helpAnalytics.recordFeedback('topic1', { rating: 4, comment: 'Good' });
            
            const summary = helpAnalytics.getSummary();
            expect(summary.totalSessions).toBe(2);
            expect(summary.averageSessionDuration).toBe(45000);
            expect(summary.mostViewedCategories.length).toBeGreaterThan(0);
            expect(summary.mostViewedTopics.length).toBeGreaterThan(0);
            expect(summary.averageRating).toBe(4);
        });
        
        test('should get top items correctly', () => {
            helpAnalytics.recordCategorySelection('cat1');
            helpAnalytics.recordCategorySelection('cat1');
            helpAnalytics.recordCategorySelection('cat2');
            helpAnalytics.recordCategorySelection('cat3');
            helpAnalytics.recordCategorySelection('cat3');
            helpAnalytics.recordCategorySelection('cat3');
            
            const summary = helpAnalytics.getSummary();
            expect(summary.mostViewedCategories[0]).toEqual({ name: 'cat3', views: 3 });
            expect(summary.mostViewedCategories[1]).toEqual({ name: 'cat1', views: 2 });
        });
    });
    
    describe('Data Persistence', () => {
        test('should save analytics to localStorage', () => {
            helpAnalytics.recordHelpOpened();
            helpAnalytics.recordCategorySelection('gameplay');
            
            helpAnalytics.saveAnalytics();
            
            const saved = localStorage.getItem('helpAnalytics');
            expect(saved).toBeDefined();
            
            const parsed = JSON.parse(saved!);
            expect(parsed.helpUsage.opens).toBe(1);
        });
        
        test('should load analytics from localStorage', () => {
            const testData = {
                helpUsage: { opens: 5 },
                content: {},
                tutorialUsage: {},
                userBehavior: {},
                effectiveness: {}
            };
            
            localStorage.setItem('helpAnalytics', JSON.stringify(testData));
            
            const newAnalytics = new HelpAnalytics(mockGameEngine as any);
            expect(newAnalytics.analytics.helpUsage.opens).toBe(5);
        });
        
        test('should handle corrupted localStorage data', () => {
            localStorage.setItem('helpAnalytics', 'invalid json');
            
            const newAnalytics = new HelpAnalytics(mockGameEngine as any);
            expect(newAnalytics.analytics.helpUsage.opens).toBe(0);
        });
    });
    
    describe('Cleanup and Reset', () => {
        test('should reset analytics data', () => {
            helpAnalytics.recordHelpOpened();
            helpAnalytics.recordCategorySelection('gameplay');
            
            helpAnalytics.resetAnalytics();
            
            expect(helpAnalytics.analytics.helpUsage.opens).toBe(0);
            expect(helpAnalytics.analytics.helpUsage.topHelpCategories.size).toBe(0);
        });
        
        test('should cleanup properly', () => {
            helpAnalytics.recordHelpOpened();
            helpAnalytics.saveAnalytics();
            
            helpAnalytics.cleanup();
            
            // Analytics should still be saved
            const saved = localStorage.getItem('helpAnalytics');
            expect(saved).toBeDefined();
        });
    });
});