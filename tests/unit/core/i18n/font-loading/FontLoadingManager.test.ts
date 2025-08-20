import { jest } from '@jest/globals';
import { FontLoadingManager } from '../../../../../src/core/i18n/font-loading/FontLoadingManager.js';
// Mock dependencies
jest.mock('../../../../../src/core/i18n/font-loading/FontSourceManager.js'');
jest.mock('../../../../../src/core/i18n/font-loading/FontFallbackHandler.js'');
jest.mock('../../../../../src/core/i18n/font-loading/FontErrorHandler.js'');
import { FontSourceManager } from '../../../../../src/core/i18n/font-loading/FontSourceManager.js';
import { FontFallbackHandler } from '../../../../../src/core/i18n/font-loading/FontFallbackHandler.js';
import { FontErrorHandler } from '../../../../../src/core/i18n/font-loading/FontErrorHandler.js';
// Type definitions
interface LoadResult {
    success: boolean,
    fontFamily: string,
    source: string,
    loadTime: number,
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
    applyFallback: jest.Mock<boolean, [any, string, string? ]>; : undefined
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
        [source: string]: number,
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
    total: number,
    successful: number,
    failed: number,
}
interface ConsoleSpy {
    warn: jest.SpyInstance,
    log: jest.SpyInstance,
}
interface GlobalErrorHandler {
    handleError: jest.Mock<void, [Error]>;
}
describe('FontLoadingManager', () => {
    let fontLoadingManager: FontLoadingManager,
    let mockSourceManager: MockSourceManager,
    let mockFallbackHandler: MockFallbackHandler,
    let mockErrorHandler: MockErrorHandler,
    let consoleSpy: ConsoleSpy,
    beforeEach(() => {
        // Setup mocks
        mockSourceManager = {
            loadFromSource: jest.fn(),
            getAvailableSources: jest.fn((') => ['system', 'google']),
            isSourceAvailable: jest.fn(() => true);
            enableSource: jest.fn(),
            disableSource: jest.fn(),
            clearLoadHistory: jest.fn(),
            getStats: jest.fn(() => ({)));
    });
        mockFallbackHandler = {
            getSystemFontForLanguage: jest.fn((') => 'Arial');
            applyFallback: jest.fn(() => true);
            clearFallbackHistory: jest.fn(),
            getStats: jest.fn(() => ({)));
    });
        mockErrorHandler = {
            handleFontError: jest.fn(() => true);
            clearErrorHistory: jest.fn(),
            getErrorStats: jest.fn(() => ({)));
    });
        (FontSourceManager as jest.MockedClass<typeof FontSourceManager>).mockImplementation(() => mockSourceManager as any);
        (FontFallbackHandler as jest.MockedClass<typeof FontFallbackHandler>).mockImplementation(() => mockFallbackHandler as any);
        (FontErrorHandler as jest.MockedClass<typeof FontErrorHandler>).mockImplementation(() => mockErrorHandler as any);
        fontLoadingManager = new FontLoadingManager(');
        consoleSpy = {
            warn: jest.spyOn(console, 'warn').mockImplementation(() => {}'),
            log: jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore();
        jest.clearAllMocks();
    }');
    describe('Initialization', (') => {
        test('should initialize with default configuration', () => {
            expect(fontLoadingManager.config.enabledSources').toEqual(['system', 'google', 'local']);
            expect(fontLoadingManager.config.timeouts.google).toBe(3000);
            expect(fontLoadingManager.config.fallbackBehavior.useSystemFonts).toBe(true);
        }');
        test('should accept custom configuration', (') => {
            const config: FontConfig = {
                enabledSources: ['system'],
                timeouts: { system: 1000 }
            };
            
            const manager = new FontLoadingManager(config);
            expect(manager.config.enabledSources').toEqual(['system']);
            expect(manager.config.timeouts.system).toBe(1000);
        }');
        test('should initialize components correctly', async () => {
            await fontLoadingManager.initialize();
            expect(fontLoadingManager.initialized).toBe(true);
            expect(mockSourceManager.getAvailableSources).toHaveBeenCalled();
        }');
        test('should handle initialization errors gracefully', async () => {
            mockSourceManager.getAvailableSources.mockImplementation((') => {
                throw new Error('Initialization failed');
            });
            await fontLoadingManager.initialize();
            expect(fontLoadingManager.initialized).toBe(true);
            expect(mockErrorHandler.handleFontError).toHaveBeenCalled();
        }');
    }
    describe('Font Loading', () => {
        beforeEach(async () => {
            await fontLoadingManager.initialize();
        }');
        test('should load font successfully from first available source', async (') => {
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Arial',
                source: 'system',
                loadTime: 100),
            }');
            const result = await fontLoadingManager.loadFont('Arial', 'en');
            expect(result.success).toBe(true);
            expect(result.fontFamily').toBe('Arial');
            expect(result.source').toBe('system');
            expect(mockSourceManager.loadFromSource').toHaveBeenCalledWith('system', 'Arial', {)');
        }
        test('should return cached result for already loaded font', async (') => {
            const loadKey = 'Arial: en',
            fontLoadingManager.successfulLoads.add(loadKey');
            const result = await fontLoadingManager.loadFont('Arial', 'en');
            expect(result.success).toBe(true);
            expect(result.cached).toBe(true);
            expect(mockSourceManager.loadFromSource).not.toHaveBeenCalled();
        }');
        test('should try multiple sources when first source fails', async (') => {
            mockSourceManager.loadFromSource
                .mockRejectedValueOnce(new Error('Google Fonts failed'')}
                .mockResolvedValue({
                    success: true,
                    fontFamily: 'Arial',
                    source: 'system',
                    loadTime: 100),
                }');
            const result = await fontLoadingManager.loadFont('Arial', 'en');
            expect(result.success).toBe(true);
            expect(result.source').toBe('system');
            expect(mockSourceManager.loadFromSource).toHaveBeenCalledTimes(2);
        }');
        test('should use fallback when all sources fail', async (') => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('All sources failed')');
            const result = await fontLoadingManager.loadFont('Arial', 'en');
            expect(result.success).toBe(true);
            expect(result.fallbackUsed).toBe(true);
            expect(result.source').toBe('fallback');
            expect(mockFallbackHandler.getSystemFontForLanguage').toHaveBeenCalledWith('en');
        }');
        test('should handle concurrent loading requests for same font', async () => {
            mockSourceManager.loadFromSource.mockImplementation(() => 
                new Promise(resolve => setTimeout((') => resolve({
                    success: true,
                    fontFamily: 'Arial',
                    source: 'system',
                    loadTime: 100
                }), 100)
            ');
            const promises = [
                fontLoadingManager.loadFont('Arial', 'en''),
                fontLoadingManager.loadFont('Arial', 'en''),
                fontLoadingManager.loadFont('Arial', 'en')
            ];
            
            const results = await Promise.all(promises);
            // Should only load once, but all requests should succeed
            expect(results.every(r => r.success).toBe(true);
            expect(mockSourceManager.loadFromSource).toHaveBeenCalledTimes(2); // system, google
        }');
    }
    describe('Element Font Application', () => {
        let mockElement: MockElement,
        beforeEach(async () => {
            await fontLoadingManager.initialize();
            mockElement = {
                style: {}
            };
        }');
        test('should apply font to element successfully', async (') => {
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Arial',
                source: 'system',
                loadTime: 100),
            }');
            const result = await fontLoadingManager.applyFontToElement(mockElement, 'Arial', 'en');
            expect(result).toBe(true);
            expect(mockElement.style.fontFamily').toBe('Arial');
        }');
        test('should apply fallback when font loading fails', async (') => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Load failed')');
            const result = await fontLoadingManager.applyFontToElement(mockElement, 'FailedFont', 'en');
            expect(result).toBe(false);
            expect(mockFallbackHandler.applyFallback').toHaveBeenCalledWith(mockElement, 'en', 'FailedFont');
        }');
        test('should handle element application errors', async (') => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Load failed');
            mockFallbackHandler.applyFallback.mockImplementation((') => {
                throw new Error('Fallback failed');
            }');
            const result = await fontLoadingManager.applyFontToElement(mockElement, 'ErrorFont', 'en');
            expect(result).toBe(false);
            expect(mockErrorHandler.handleFontError).toHaveBeenCalled();
        }');
    }
    describe('Multiple Elements Font Application', () => {
        beforeEach(async () => {
            await fontLoadingManager.initialize();
            const mockElements: MockElement[] = [
                { style: {} },
                { style: {} },
                { style: {} }
            ];
            
            document.querySelectorAll = jest.fn(() => mockElements as any);
        )');
        test('should apply font to multiple elements', async (') => {
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Arial',
                source: 'system',
                loadTime: 100),
    })');
            const result = await fontLoadingManager.applyFontToElements('.test', 'Arial', 'en');
            expect(result.total).toBe(3);
            expect(result.successful).toBe(3);
            expect(result.failed).toBe(0);
        )');
        test('should handle mixed success/failure scenarios', async (') => {
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Arial',
                source: 'system',
                loadTime: 100),
            });
            // Mock one element to fail
            let callCount = 0;
            const originalApplyFontToElement = fontLoadingManager.applyFontToElement.bind(fontLoadingManager);
            fontLoadingManager.applyFontToElement = jest.fn().mockImplementation(async (element, fontFamily, language) => {
                callCount++;
                if (callCount === 2') {
                    throw new Error('Second element failed');
                }
                return originalApplyFontToElement(element, fontFamily, language);
            }');
            const result = await fontLoadingManager.applyFontToElements('.test', 'Arial', 'en');
            expect(result.total).toBe(3);
            expect(result.successful).toBe(2);
            expect(result.failed).toBe(1);
        }');
    }
    describe('Source Management', (') => {
        test('should enable font source', (') => {
            fontLoadingManager.enableSource('newSource');
            expect(mockSourceManager.enableSource').toHaveBeenCalledWith('newSource');
            expect(fontLoadingManager.failedSources.size).toBe(0); // Should clear failed sources
        }');
        test('should disable font source', (') => {
            fontLoadingManager.disableSource('google');
            expect(mockSourceManager.disableSource').toHaveBeenCalledWith('google');
        }');
        test('should check source availability', (') => {
            const isAvailable = fontLoadingManager.isSourceAvailable('system');
            expect(isAvailable).toBe(true);
            expect(mockSourceManager.isSourceAvailable').toHaveBeenCalledWith('system');
        }');
    }
    describe('Configuration Management', (') => {
        test('should update configuration', (') => {
            const newConfig: FontConfig = {
                enabledSources: ['system'],
                timeouts: { system: 2000 }
            };
            
            fontLoadingManager.updateConfig(newConfig);
            expect(fontLoadingManager.config.enabledSources').toEqual(['system']);
            expect(fontLoadingManager.config.timeouts.system).toBe(2000);
        }');
        test('should update child component configurations', (') => {
            const newConfig: FontConfig = {
                enabledSources: ['system', 'google'],
                timeouts: { google: 5000 }
            };
            
            fontLoadingManager.updateConfig(newConfig);
            expect(mockSourceManager.enabledSources').toEqual(['system', 'google']);
            expect(mockSourceManager.timeouts).toEqual(expect.objectContaining({ google: 5000 )),
        }
    }');
    describe('Font Preloading', () => {
        beforeEach(async () => {
            await fontLoadingManager.initialize();
        }');
        test('should preload multiple fonts', async (') => {
            mockSourceManager.loadFromSource.mockResolvedValue({
                success: true,
                fontFamily: 'Arial',
                source: 'system',
                loadTime: 100),
            }');
            const fontList = ['Arial', 'Helvetica', 'Times New Roman'];
            const results = await fontLoadingManager.preloadFonts(fontList, 'en');
            expect(results).toHaveLength(3);
            expect(results.every(r => r.success).toBe(true);
            expect(mockSourceManager.loadFromSource).toHaveBeenCalledTimes(6); // 3 fonts × 2 sources
        }');
        test('should handle preloading errors', async (') => {
            mockSourceManager.loadFromSource.mockRejectedValue(new Error('Preload failed')');
            const fontList = ['FailedFont'];
            const results = await fontLoadingManager.preloadFonts(fontList, 'en');
            expect(results).toHaveLength(1);
            expect(results[0].success).toBe(true); // Should succeed with fallback
            expect(results[0].fallbackUsed).toBe(true);
        }');
    }
    describe('Cache Management', () => {
        beforeEach(async () => {
            await fontLoadingManager.initialize();
        }');
        test('should clear all caches', (') => {
            fontLoadingManager.loadAttempts.set('test', Promise.resolve()');
            fontLoadingManager.failedSources.add('test'');
            fontLoadingManager.successfulLoads.add('test');
            fontLoadingManager.clearCaches();
            expect(fontLoadingManager.loadAttempts.size).toBe(0);
            expect(fontLoadingManager.failedSources.size).toBe(0);
            expect(fontLoadingManager.successfulLoads.size).toBe(0);
            expect(mockSourceManager.clearLoadHistory).toHaveBeenCalled();
            expect(mockFallbackHandler.clearFallbackHistory).toHaveBeenCalled();
            expect(mockErrorHandler.clearErrorHistory).toHaveBeenCalled();
        }');
    }
    describe('Statistics', (') => {
        test('should provide comprehensive statistics', () => {
            const stats = fontLoadingManager.getStats();
            expect(stats.manager).toBeDefined();
            expect(stats.sources).toBeDefined();
            expect(stats.fallbacks).toBeDefined();
            expect(stats.errors).toBeDefined();
            expect(stats.config).toBeDefined();
            expect(stats.manager.initialized).toBe(false);
            expect(stats.config.enabledSources').toEqual(['system', 'google', 'local']);
        }');
    }
    describe('Error Handler Integration', (') => {
        test('should accept global error handler', () => {
            const mockGlobalErrorHandler: GlobalErrorHandler = {
                handleError: jest.fn(),
            };
            
            const manager = new FontLoadingManager({}, mockGlobalErrorHandler);
            expect(manager.globalErrorHandler).toBe(mockGlobalErrorHandler);
        }');
        test('should setup error integration when global error handler provided', () => {
            const mockGlobalErrorHandler: GlobalErrorHandler = {
                handleError: jest.fn(),
            };
            
            const manager = new FontLoadingManager({}, mockGlobalErrorHandler);
            expect(manager.errorIntegration).toBeNull(); // Will be set up asynchronously
            expect(typeof manager._setupErrorIntegration').toBe('function');
        }');
    }
    describe('Disposal', (') => {
        test('should dispose properly', () => {
            fontLoadingManager.dispose();
            expect(fontLoadingManager.initialized).toBe(false);
            expect(fontLoadingManager.loadAttempts.size).toBe(0);
            expect(fontLoadingManager.failedSources.size).toBe(0);
            expect(fontLoadingManager.successfulLoads.size).toBe(0);
        });
    }
}');