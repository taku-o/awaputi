/**
 * HelpAnalytics Test Suite
 * ヘルプアナリティクスシステムのテスト
 */
import { jest  } from '@jest/globals';
import { HelpAnalytics  } from '../../../../src/core/help/HelpAnalytics.js';
// Type definitions
interface MockGameEngine {
    localizationManager: {
        getCurrentLanguag,e: jest.Mock<string, []> };
}
interface ValidationResult {
    isValid: boolean;
    sanitizedData?: any;
    errors: string[];
interface Feedback {
    rating: number | string;
    comment: string | null }
interface SanitizedFeedback {
    rating: number;
    comment: string;
interface TopicContext {
    title?: string;
    [key: string]: any;
interface CategoryContext {
    source?: string;
    [key: string]: any;
interface AnalyticsStructure {
    helpUsage: any;
    content: any;
    tutorialUsage: any;
    userBehavior: any;
    effectiveness: any;
interface ContentItem {
    title: string;
    body?: string;
    [key: string]: any;
interface SearchResult {
    id: string;
    title: string;
    [key: string]: any;
describe('HelpAnalytics', () => {
    let helpAnalytics: HelpAnalytics;
    let mockGameEngine: MockGameEngine;
    beforeEach(() => {
        // Mock game engine
        mockGameEngine = {
            localizationManager: {
                getCurrentLanguage: jest.fn((') => 'ja')),'
        );
        // Clear localStorage
        localStorage.clear();
        // Create instance
        helpAnalytics = new HelpAnalytics(mockGameEngine);
    };
    afterEach(() => {
        if (helpAnalytics) {
            helpAnalytics.cleanup() }
        localStorage.clear();
    }');'
    describe('Initialization', (') => {'
        test('should initialize with default analytics structure', () => {
            expect(helpAnalytics.analytics).toBeDefined();
            expect(helpAnalytics.analytics.helpUsage).toBeDefined();
            expect(helpAnalytics.analytics.content).toBeDefined();
            expect(helpAnalytics.analytics.tutorialUsage).toBeDefined();
            expect(helpAnalytics.analytics.userBehavior).toBeDefined();
            expect(helpAnalytics.analytics.effectiveness).toBeDefined() }');'
        test('should initialize Map objects correctly', () => {
            expect(helpAnalytics.analytics.helpUsage.topHelpCategories instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.helpUsage.topHelpTopics instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.helpUsage.searchQueries instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.content.topicViews instanceof Map).toBe(true);
            expect(helpAnalytics.analytics.content.categoryViews instanceof Map).toBe(true) }');'
    }
    describe('Data Validation and Sanitization', (') => {'
        test('should validate and sanitize category IDs', (') => {'
            const result = helpAnalytics.validateAndSanitizeData('test-category', 'categoryId') as ValidationResult,
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData').toBe('test-category') }');
        test('should reject invalid category IDs', (') => {'
            const result = helpAnalytics.validateAndSanitizeData('<script>alert("xss"")</script>', 'categoryId') as ValidationResult,"
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData').toBe('scriptalertxssscript') }');
        test('should validate search queries', (') => {'
            const result = helpAnalytics.validateAndSanitizeData('help search', 'searchQuery') as ValidationResult,
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData').toBe('help search') }');
        test('should sanitize XSS attempts in search queries', (') => {'
            const maliciousQuery = '<script>malicious(')</script>search term','
            const result = helpAnalytics.validateAndSanitizeData(maliciousQuery, 'searchQuery') as ValidationResult,
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData').not.toContain('<script>'),'
            expect(result.sanitizedData').not.toContain('malicious(')') }');'
        test('should validate feedback objects', (') => {'
            const feedback: Feedback = {
                rating: 5;
                comment: 'Very helpful!'
            };
            const result = helpAnalytics.validateAndSanitizeData(feedback, 'feedback') as ValidationResult;
            expect(result.isValid).toBe(true);
            expect((result.sanitizedData as SanitizedFeedback).rating).toBe(5);
            expect((result.sanitizedData as SanitizedFeedback).comment').toBe('Very helpful!');'
        }');'
        test('should reject invalid ratings', (') => {'
            const feedback: Feedback = {
                rating: 10, // Invalid rating
                comment: 'Test'
            };
            const result = helpAnalytics.validateAndSanitizeData(feedback, 'feedback') as ValidationResult;
            expect(result.isValid).toBe(false);
        }');'
    }
    describe('Category Selection Recording', (') => {'
        test('should record valid category selection', (') => {'
            const spy = jest.spyOn(helpAnalytics, 'trackEvent' as any'),'
            helpAnalytics.recordCategorySelection('test-category', { source: 'menu' };
            expect(spy').toHaveBeenCalledWith('category_selection', expect.objectContaining({'
                categoryId: 'test-category';
                context: { source: 'menu' };
            }');'
        }
        test('should update category statistics', (') => {'
            helpAnalytics.recordCategorySelection('test-category');
            const categoryStats = helpAnalytics.analytics.helpUsage.topHelpCategories as Map<string, number>,
            expect(categoryStats.has('test-category').toBe(true'),'
            expect(categoryStats.get('test-category').toBe(1) }');'
        test('should handle malicious input safely', (') => {'
            const maliciousCategory = '<script>alert("hack"")</script>',"
            
            // Should not throw error
            expect(() => {
                helpAnalytics.recordCategorySelection(maliciousCategory) }.not.toThrow();
        }
    }');'
    describe('Topic View and Exit Recording', (') => {'
        test('should record topic view', (') => {'
            const spy = jest.spyOn(helpAnalytics, 'trackEvent' as any'),'
            helpAnalytics.recordTopicView('topic-1', { title: 'Test Topic' };
            expect(spy').toHaveBeenCalledWith('topic_view', expect.objectContaining({'
                topicId: 'topic-1' }');'
        }
        test('should record topic exit', (') => {'
            const spy = jest.spyOn(helpAnalytics, 'trackEvent' as any'),'
            helpAnalytics.recordTopicExit('topic-1', { title: 'Test Topic' };
            expect(spy').toHaveBeenCalledWith('topic_exit', expect.objectContaining({'
                topicId: 'topic-1' }');'
        }
        test('should update topic statistics', (') => {'
            helpAnalytics.recordTopicView('topic-1', { title: 'Test Topic' }');'
            const topicStats = helpAnalytics.analytics.content.topicViews.get('topic-1');
            expect(topicStats).toBeDefined();
            expect(topicStats.viewCount).toBe(1);
        }');'
    }
    describe('Search Query Recording', (') => {'
        test('should record search queries', (') => {'
            const spy = jest.spyOn(helpAnalytics, 'trackSearchQuery' as any'),'
            helpAnalytics.recordSearchQuery('help me', 5);
            expect(spy').toHaveBeenCalledWith('help me', [], 5) }');
        test('should handle empty search queries', () => {
            expect((') => {'
                helpAnalytics.recordSearchQuery(', 0) }.not.toThrow(');
        }
        test('should sanitize malicious search queries', (') => {'
            const spy = jest.spyOn(helpAnalytics, 'trackSearchQuery' as any'),'
            helpAnalytics.recordSearchQuery('<script>evil(')</script>', 0),'
            expect(spy').toHaveBeenCalledWith('scriptevil(')script', [], 0) }');'
    }
    describe('Feedback Recording', (') => {'
        test('should record valid feedback', (') => {'
            const feedback: Feedback = {
                rating: 4;
                comment: 'Good help topic'
            };
            
            const spy = jest.spyOn(helpAnalytics, 'trackEvent' as any');'
            helpAnalytics.recordFeedback('topic-1', { title: 'Test' ), feedback),
            expect(spy').toHaveBeenCalledWith('topic_feedback', expect.objectContaining({'
                topicId: 'topic-1';
                feedback: expect.objectContaining({
                    rating: 4;
                    comment: 'Good help topic') }');'
        }
        test('should handle invalid feedback gracefully', (') => {'
            const invalidFeedback: Feedback = {
                rating: 'not-a-number';
                comment: null;
                comment: null;
        };
            expect((') => {'
                helpAnalytics.recordFeedback('topic-1', {}, invalidFeedback);
            }.not.toThrow();
        }
    }');'
    describe('Performance and Caching', (') => {'
        test('should initialize caching system', () => {
            helpAnalytics.initializeContentCaching();
            expect(helpAnalytics.contentCache).toBeDefined();
            expect(helpAnalytics.searchCache).toBeDefined();
            expect(helpAnalytics.cacheConfig).toBeDefined() }');'
        test('should cache and retrieve content', () => {
            helpAnalytics.initializeContentCaching('),'
            const testContent: ContentItem = { title: 'Test Content', body: 'Test body' };
            helpAnalytics.cacheContent('test-content', testContent');'
            const cached = helpAnalytics.getCachedContent('test-content');
            expect(cached).toEqual(testContent);
        }');'
        test('should cache and retrieve search results', () => {
            helpAnalytics.initializeContentCaching('),'
            const searchResults: SearchResult[] = [
                { id: 'result1', title: 'Result 1' };
                { id: 'result2', title: 'Result 2' }
            ];
            
            helpAnalytics.cacheSearchResults('test query', searchResults');'
            const cached = helpAnalytics.getCachedSearchResults('test query');
            expect(cached).toEqual(searchResults);
        }');'
        test('should handle cache expiration', (done) => {
            helpAnalytics.initializeContentCaching('),'
            // Set very short expiry for testing
            helpAnalytics.cacheConfig.cacheExpiryTime = 1,
            
            const testContent: ContentItem = { title: 'Test Content' };
            helpAnalytics.cacheContent('test-content', testContent);
            // Wait for expiration
            setTimeout((') => {'
                const cached = helpAnalytics.getCachedContent('test-content');
                expect(cached).toBeNull();
                done() }, 2);
        }');'
    }
    describe('Error Handling', (') => {'
        test('should handle validation errors gracefully', (') => {'
            const result = helpAnalytics.validateAndSanitizeData(null, 'categoryId') as ValidationResult,
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0) }');'
        test('should handle unknown data types', (') => {'
            const result = helpAnalytics.validateAndSanitizeData('test', 'unknown-type') as ValidationResult,
            expect(result.isValid).toBe(false);
            expect(result.errors').toContain('Unknown data type: unknown-type' }');
        test('should continue operation after validation failures', () => {
            // Should not throw error even with invalid input
            expect(() => {
                helpAnalytics.recordCategorySelection(null) }.not.toThrow();
        }
    }');'
    describe('Data Structure Validation', (') => {'
        test('should validate analytics structure', () => {
            const validData: AnalyticsStructure = {
                helpUsage: {};
                content: {};
                tutorialUsage: {};
                userBehavior: {};
                effectiveness: {}
            };
            
            expect(helpAnalytics.validateAnalyticsStructure(validData).toBe(true);
        }');'
        test('should reject invalid analytics structure', () => {
            const invalidData = {
                helpUsage: null;
                content: {}
            };
            
            expect(helpAnalytics.validateAnalyticsStructure(invalidData).toBe(false);
        }');'
    }
    describe('Integration', (') => {'
        test('should work with executeWithValidation wrapper', () => {
            const mockOperation = jest.fn((') => 'result'),'
            const result = helpAnalytics.executeWithValidation('test-operation', mockOperation);
            expect(mockOperation).toHaveBeenCalled();
            expect(result').toBe('result'))'),
        test('should handle errors in executeWithValidation', () => {
            const mockOperation = jest.fn((') => {'
                throw new Error('Test error')),
            expect((') => {'
                helpAnalytics.executeWithValidation('test-operation', mockOperation))').toThrow('Test error')) }');
}