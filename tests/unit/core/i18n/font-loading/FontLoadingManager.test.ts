import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { FontLoadingManager } from '../../../../../src/core/i18n/font-loading/FontLoadingManager.js';

// Mock dependencies
jest.mock('../../../../../src/core/i18n/font-loading/FontSourceManager.js');
jest.mock('../../../../../src/core/i18n/font-loading/FontFallbackHandler.js');
jest.mock('../../../../../src/core/i18n/font-loading/FontErrorHandler.js');

import { FontSourceManager } from '../../../../../src/core/i18n/font-loading/FontSourceManager.js';
import { FontFallbackHandler } from '../../../../../src/core/i18n/font-loading/FontFallbackHandler.js';
import { FontErrorHandler } from '../../../../../src/core/i18n/font-loading/FontErrorHandler.js';

// Type definitions
interface LoadResult {
    success: boolean;
    fontFamily: string;
    source: string;
    loadTime: number;
    cached?: boolean;
    fallbackUsed?: boolean;
}

interface MockSourceManager {
    loadFromSource: jest.Mock<Promise<LoadResult>, [string, string, any]>;
    getAvailableSources: jest.Mock<string[], []>;
    isSourceAvailable: jest.Mock<boolean, [string]>;
    enableSource: jest.Mock<void, [string]>;
    disableSource: jest.Mock<void, [string]>;
    clearLoadHistory: jest.Mock<void, []>;
    getStats: jest.Mock<any, []>;
    enabledSources?: string[];
    timeouts?: any;
}

interface MockFallbackHandler {
    getSystemFontForLanguage: jest.Mock<string, [string]>;
    applyFallback: jest.Mock<boolean, [any, string, string?]>;
    clearFallbackHistory: jest.Mock<void, []>;
    getStats: jest.Mock<any, []>;
}

interface MockErrorHandler {
    handleFontError: jest.Mock<boolean, [Error, any]>;
    clearErrorHistory: jest.Mock<void, []>;
    getErrorStats: jest.Mock<any, []>;
}

interface FontConfig {
    enabledSources?: string[];
    timeouts?: {
        [source: string]: number;
    };
    fallbackBehavior?: {
        useSystemFonts?: boolean;
    };
}

interface MockElement {
    style: {
        fontFamily?: string;
    };
}

interface MultiElementResult {
    total: number;
    successful: number;
    failed: number;
}
interface ConsoleSpy {
    warn: jest.SpyInstance;
    log: jest.SpyInstance;
}

interface GlobalErrorHandler {
    handleError: jest.Mock<void, [Error]>;
}

describe('FontLoadingManager', () => {
    let fontLoadingManager: FontLoadingManager;
    let mockSourceManager: MockSourceManager;
    let mockFallbackHandler: MockFallbackHandler;
    let mockErrorHandler: MockErrorHandler;
    let consoleSpy: ConsoleSpy;
    
    beforeEach(() => {
        // Setup mocks
        mockSourceManager = {
            loadFromSource: jest.fn(),
            getAvailableSources: jest.fn(() => ['system', 'google']),
            isSourceAvailable: jest.fn(() => true),
            enableSource: jest.fn(),
            disableSource: jest.fn(),
            clearLoadHistory: jest.fn(),
            getStats: jest.fn(() => ({}))
        };
        
        mockFallbackHandler = {
            getSystemFontForLanguage: jest.fn(() => 'Arial'),
            applyFallback: jest.fn(() => true),
            clearFallbackHistory: jest.fn(),
            getStats: jest.fn(() => ({}))
        };
        
        mockErrorHandler = {
            handleFontError: jest.fn(() => true),
            clearErrorHistory: jest.fn(),
            getErrorStats: jest.fn(() => ({}))
        };
        
        (FontSourceManager as jest.MockedClass<typeof FontSourceManager>).mockImplementation(() => mockSourceManager as any);
        (FontFallbackHandler as jest.MockedClass<typeof FontFallbackHandler>).mockImplementation(() => mockFallbackHandler as any);
        (FontErrorHandler as jest.MockedClass<typeof FontErrorHandler>).mockImplementation(() => mockErrorHandler as any);
        
        fontLoadingManager = new FontLoadingManager();
        
        consoleSpy = {
            warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
            log: jest.spyOn(console, 'log').mockImplementation(() => {})
        };
    });
    
    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore());
        jest.clearAllMocks();
    });
    
    describe('Font Loading', () => {
        test('should load font successfully', async () => {
            const mockResult: LoadResult = {
                success: true,
                fontFamily: 'Noto Sans JP',
                source: 'google',
                loadTime: 100
            };
            
            mockSourceManager.loadFromSource.mockResolvedValue(mockResult);
            
            const result = await fontLoadingManager.loadFont('Noto Sans JP', 'ja');
            expect(result).toEqual(mockResult);
            expect(mockSourceManager.loadFromSource).toHaveBeenCalled();
        });
        
        test('should handle font loading failure', async () => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Load failed'));
            
            const result = await fontLoadingManager.loadFont('NonexistentFont', 'en');
            expect(result.success).toBe(false);
            expect(mockErrorHandler.handleFontError).toHaveBeenCalled();
        });
        
        test('should use fallback when primary loading fails', async () => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Load failed'));
            mockFallbackHandler.getSystemFontForLanguage.mockReturnValue('Hiragino Sans');
            
            const result = await fontLoadingManager.loadFont('Noto Sans JP', 'ja', {
                fallbackBehavior: { useSystemFonts: true }
            });
            
            expect(result.fallbackUsed).toBe(true);
            expect(mockFallbackHandler.getSystemFontForLanguage).toHaveBeenCalledWith('ja');
        });
        
        test('should respect timeout configuration', async () => {
            const config: FontConfig = {
                timeouts: { google: 1000 }
            };
            
            fontLoadingManager.updateConfig(config);
            
            mockSourceManager.loadFromSource.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve({
                    success: true,
                    fontFamily: 'Test Font',
                    source: 'google',
                    loadTime: 100
                }), 500))
            );
            
            const result = await fontLoadingManager.loadFont('Test Font', 'en');
            expect(result.success).toBe(true);
        });
    });
    
    describe('Element Font Application', () => {
        test('should apply font to single element', async () => {
            const mockElement: MockElement = {
                style: { fontFamily: '' }
            };
            
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Roboto',
                source: 'google',
                loadTime: 50
            });
            
            const result = await fontLoadingManager.applyFontToElement(
                mockElement as any,
                'Roboto',
                'en'
            );
            
            expect(result.success).toBe(true);
            expect(mockElement.style.fontFamily).toContain('Roboto');
        });
        
        test('should apply font to multiple elements', async () => {
            const mockElements: MockElement[] = [
                { style: { fontFamily: '' } },
                { style: { fontFamily: '' } },
                { style: { fontFamily: '' } }
            ];
            
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Arial',
                source: 'system',
                loadTime: 10
            });
            
            const result = await fontLoadingManager.applyFontToElements(
                mockElements as any,
                'Arial',
                'en'
            );
            
            expect(result.successful).toBe(3);
            expect(result.failed).toBe(0);
            mockElements.forEach(element => {
                expect(element.style.fontFamily).toContain('Arial');
            });
        });
        
        test('should handle partial element application failure', async () => {
            const mockElements: MockElement[] = [
                { style: { fontFamily: '' } },
                null as any, // Invalid element
                { style: { fontFamily: '' } }
            ];
            
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Helvetica',
                source: 'system',
                loadTime: 20
            });
            
            const result = await fontLoadingManager.applyFontToElements(
                mockElements as any,
                'Helvetica',
                'en'
            );
            
            expect(result.successful).toBe(2);
            expect(result.failed).toBe(1);
        });
    });
    
    describe('Source Management', () => {
        test('should enable font source', () => {
            fontLoadingManager.enableSource('google');
            expect(mockSourceManager.enableSource).toHaveBeenCalledWith('google');
        });
        
        test('should disable font source', () => {
            fontLoadingManager.disableSource('cdn');
            expect(mockSourceManager.disableSource).toHaveBeenCalledWith('cdn');
        });
        
        test('should get available sources', () => {
            const sources = fontLoadingManager.getAvailableSources();
            expect(sources).toEqual(['system', 'google']);
            expect(mockSourceManager.getAvailableSources).toHaveBeenCalled();
        });
        
        test('should check if source is available', () => {
            const isAvailable = fontLoadingManager.isSourceAvailable('local');
            expect(isAvailable).toBe(true);
            expect(mockSourceManager.isSourceAvailable).toHaveBeenCalledWith('local');
        });
    });
    
    describe('Configuration', () => {
        test('should update configuration', () => {
            const config: FontConfig = {
                enabledSources: ['system', 'local'],
                timeouts: {
                    google: 3000,
                    cdn: 5000
                },
                fallbackBehavior: {
                    useSystemFonts: true
                }
            };
            
            fontLoadingManager.updateConfig(config);
            expect(fontLoadingManager.getConfig()).toMatchObject(config);
        });
        
        test('should merge configuration updates', () => {
            fontLoadingManager.updateConfig({
                enabledSources: ['system']
            });
            
            fontLoadingManager.updateConfig({
                timeouts: { google: 2000 }
            });
            
            const config = fontLoadingManager.getConfig();
            expect(config.enabledSources).toContain('system');
            expect(config.timeouts?.google).toBe(2000);
        });
    });
    
    describe('Statistics and Monitoring', () => {
        test('should get combined statistics', () => {
            mockSourceManager.getStats.mockReturnValue({
                totalLoads: 10,
                successfulLoads: 8
            });
            
            mockFallbackHandler.getStats.mockReturnValue({
                totalFallbacks: 2
            });
            
            mockErrorHandler.getErrorStats.mockReturnValue({
                totalErrors: 2
            });
            
            const stats = fontLoadingManager.getStats();
            expect(stats.sourceStats.totalLoads).toBe(10);
            expect(stats.fallbackStats.totalFallbacks).toBe(2);
            expect(stats.errorStats.totalErrors).toBe(2);
        });
        
        test('should clear all statistics', () => {
            fontLoadingManager.clearStats();
            
            expect(mockSourceManager.clearLoadHistory).toHaveBeenCalled();
            expect(mockFallbackHandler.clearFallbackHistory).toHaveBeenCalled();
            expect(mockErrorHandler.clearErrorHistory).toHaveBeenCalled();
        });
    });
    
    describe('Error Handling', () => {
        test('should handle global error handler', async () => {
            const globalHandler: GlobalErrorHandler = {
                handleError: jest.fn()
            };
            
            fontLoadingManager.setGlobalErrorHandler(globalHandler.handleError);
            
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Test error'));
            
            await fontLoadingManager.loadFont('TestFont', 'en');
            
            expect(globalHandler.handleError).toHaveBeenCalled();
        });
        
        test('should handle errors without global handler', async () => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Test error'));
            
            const result = await fontLoadingManager.loadFont('TestFont', 'en');
            
            expect(result.success).toBe(false);
            expect(mockErrorHandler.handleFontError).toHaveBeenCalled();
        });
    });
    
    describe('Batch Operations', () => {
        test('should load multiple fonts in batch', async () => {
            const fonts = [
                { family: 'Font1', language: 'en' },
                { family: 'Font2', language: 'ja' },
                { family: 'Font3', language: 'ko' }
            ];
            
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Font',
                source: 'google',
                loadTime: 50
            });
            
            const results = await fontLoadingManager.loadFontsBatch(fonts);
            
            expect(results).toHaveLength(3);
            expect(mockSourceManager.loadFromSource).toHaveBeenCalledTimes(3);
        });
        
        test('should handle partial batch failure', async () => {
            const fonts = [
                { family: 'Font1', language: 'en' },
                { family: 'Font2', language: 'ja' }
            ];
            
            mockSourceManager.loadFromSource
                .mockResolvedValueOnce({
                    success: true,
                    fontFamily: 'Font1',
                    source: 'google',
                    loadTime: 50
                })
                .mockRejectedValueOnce(new Error('Load failed'));
            
            const results = await fontLoadingManager.loadFontsBatch(fonts);
            
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(false);
        });
    });
    
    describe('Preloading', () => {
        test('should preload fonts for language', async () => {
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Preloaded Font',
                source: 'google',
                loadTime: 30
            });
            
            const results = await fontLoadingManager.preloadFontsForLanguage('ja');
            
            expect(results.length).toBeGreaterThan(0);
            expect(mockSourceManager.loadFromSource).toHaveBeenCalled();
        });
        
        test('should handle preload with custom font list', async () => {
            const customFonts = ['CustomFont1', 'CustomFont2'];
            
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Custom Font',
                source: 'local',
                loadTime: 20
            });
            
            const results = await fontLoadingManager.preloadFontsForLanguage('en', customFonts);
            
            expect(results).toHaveLength(2);
            expect(mockSourceManager.loadFromSource).toHaveBeenCalledTimes(2);
        });
    });
});