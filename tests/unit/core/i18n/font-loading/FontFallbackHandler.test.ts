import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { FontFallbackHandler } from '../../../../../src/core/i18n/font-loading/FontFallbackHandler.js';

// Type definitions
interface MockCanvasContext {
    font: string;
    measureText: jest.Mock<{ width: number }, [string]>;
}

interface MockCanvas {
    getContext: jest.Mock<MockCanvasContext, [string]>;
}

interface MockElement {
    style: {
        fontFamily?: string;
    };
    getAttribute?: jest.Mock<string | null, [string]>;
    setAttribute?: jest.Mock<void, [string, string]>;
}

interface FallbackInfo {
    language: string;
    originalFont: string;
}

interface FallbackStats {
    totalApplied: number;
    byLanguage: {
        [language: string]: number;
    };
    systemFontsCount: number;
    availableSystemFonts: string[];
}

interface FontFallbackConfig {
    development?: {
        verboseLogging?: boolean;
    };
}

interface ConsoleSpy {
    log: jest.SpyInstance;
}
// Mock DOM methods
const mockCanvas: MockCanvas = {
    getContext: jest.fn(() => ({
        font: '',
        measureText: jest.fn(() => ({ width: 100 }))
    }))
};

Object.defineProperty(document, 'createElement', {
    writable: true,
    value: jest.fn(() => mockCanvas)
});

describe('FontFallbackHandler', () => {
    let fontFallbackHandler: FontFallbackHandler;
    let consoleSpy: ConsoleSpy;
    
    beforeEach(() => {
        fontFallbackHandler = new FontFallbackHandler();
        consoleSpy = {
            log: jest.spyOn(console, 'log').mockImplementation(() => {})
        };
        
        // Reset canvas mock
        (mockCanvas.getContext() as MockCanvasContext).measureText.mockReturnValue({ width: 100 });
    });
    
    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore());
        fontFallbackHandler.clearFallbackHistory();
    });
    
    describe('Fallback Chain Management', () => {
        test('should return language-specific fallback chain for Japanese', () => {
            const chain = fontFallbackHandler.getFallbackChain('ja');
            expect(chain).toContain('Noto Sans JP');
            expect(chain).toContain('Hiragino Sans');
            expect(chain).toContain('sans-serif');
        });
        
        test('should return language-specific fallback chain for Chinese Simplified', () => {
            const chain = fontFallbackHandler.getFallbackChain('zh-CN');
            expect(chain).toContain('Noto Sans SC');
            expect(chain).toContain('PingFang SC');
            expect(chain).toContain('sans-serif');
        });
        
        test('should return language-specific fallback chain for Korean', () => {
            const chain = fontFallbackHandler.getFallbackChain('ko');
            expect(chain).toContain('Noto Sans KR');
            expect(chain).toContain('Apple SD Gothic Neo');
            expect(chain).toContain('sans-serif');
        });
        
        test('should return default fallback chain for unknown language', () => {
            const chain = fontFallbackHandler.getFallbackChain('unknown');
            expect(chain).toContain('Arial');
            expect(chain).toContain('Helvetica');
            expect(chain).toContain('sans-serif');
        });
        
        test('should filter unavailable system fonts from fallback chain', () => {
            // Mock font detection to return different results
            (mockCanvas.getContext() as MockCanvasContext).measureText
                .mockReturnValueOnce({ width: 100 })  // baseline
                .mockReturnValue({ width: 100 });     // same width = not available
            
            const chain = fontFallbackHandler.getFallbackChain('ja');
            // Should still include generic families
            expect(chain).toContain('sans-serif');
        });
    });
    
    describe('System Font Detection', () => {
        test('should detect available system fonts', () => {
            // Mock different widths to simulate font availability
            (mockCanvas.getContext() as MockCanvasContext).measureText
                .mockReturnValueOnce({ width: 100 })  // baseline
                .mockReturnValue({ width: 120 });     // different width = available
            
            const isAvailable = (fontFallbackHandler as any)._isFontAvailable('Arial');
            expect(isAvailable).toBe(true);
        });
        
        test('should detect unavailable system fonts', () => {
            // Mock same widths to simulate font unavailability
            (mockCanvas.getContext() as MockCanvasContext).measureText.mockReturnValue({ width: 100 });
            const isAvailable = (fontFallbackHandler as any)._isFontAvailable('NonexistentFont');
            expect(isAvailable).toBe(false);
        });
        
        test('should get all available system fonts', () => {
            // Mock different results for different fonts
            const measureTextMock = (mockCanvas.getContext() as MockCanvasContext).measureText;
            measureTextMock
                .mockReturnValueOnce({ width: 100 })  // baseline
                .mockReturnValueOnce({ width: 120 })  // Arial - available
                .mockReturnValueOnce({ width: 100 })  // baseline
                .mockReturnValueOnce({ width: 100 }); // Times - unavailable
            
            const availableFonts = fontFallbackHandler.getAvailableSystemFonts();
            expect(availableFonts.length).toBeGreaterThan(0);
        });
    });
    
    describe('Element Fallback Application', () => {
        test('should apply fallback to DOM element', () => {
            const mockElement: MockElement = {
                style: {
                    fontFamily: '"NonexistentFont", sans-serif'
                }
            };
            
            fontFallbackHandler.applyFallback(mockElement as any, 'ja');
            expect(mockElement.style.fontFamily).toContain('Noto Sans JP');
        });
        
        test('should apply fallback to element without font-family', () => {
            const mockElement: MockElement = {
                style: {}
            };
            
            fontFallbackHandler.applyFallback(mockElement as any, 'zh-CN');
            expect(mockElement.style.fontFamily).toContain('Noto Sans SC');
        });
        
        test('should apply fallback to multiple elements', () => {
            const mockElements: MockElement[] = [
                { style: { fontFamily: 'Arial' } },
                { style: { fontFamily: 'Times' } },
                { style: {} }
            ];
            
            fontFallbackHandler.applyFallbackToElements(mockElements as any, 'ko');
            mockElements.forEach(element => {
                expect(element.style.fontFamily).toContain('Noto Sans KR');
            });
        });
    });
    
    describe('Statistics and History', () => {
        test('should track fallback application statistics', () => {
            const mockElement: MockElement = { style: {} };
            
            fontFallbackHandler.applyFallback(mockElement as any, 'ja');
            fontFallbackHandler.applyFallback(mockElement as any, 'ko');
            fontFallbackHandler.applyFallback(mockElement as any, 'ja');
            
            const stats = fontFallbackHandler.getFallbackStats();
            expect(stats.totalApplied).toBe(3);
            expect(stats.byLanguage['ja']).toBe(2);
            expect(stats.byLanguage['ko']).toBe(1);
        });
        
        test('should maintain fallback history', () => {
            const mockElement: MockElement = { style: {} };
            
            fontFallbackHandler.applyFallback(mockElement as any, 'zh-TW');
            
            const history = fontFallbackHandler.getFallbackHistory();
            expect(history.length).toBe(1);
            expect(history[0].language).toBe('zh-TW');
        });
        
        test('should clear fallback history', () => {
            const mockElement: MockElement = { style: {} };
            
            fontFallbackHandler.applyFallback(mockElement as any, 'en');
            fontFallbackHandler.clearFallbackHistory();
            
            const history = fontFallbackHandler.getFallbackHistory();
            expect(history.length).toBe(0);
            
            const stats = fontFallbackHandler.getFallbackStats();
            expect(stats.totalApplied).toBe(0);
        });
    });
    
    describe('Font String Parsing', () => {
        test('should parse font-family string with quotes', () => {
            const fontString = '"Hiragino Sans", "Arial", sans-serif';
            const fonts = (fontFallbackHandler as any)._parseFontFamily(fontString);
            expect(fonts).toEqual(['Hiragino Sans', 'Arial', 'sans-serif']);
        });
        
        test('should parse font-family string without quotes', () => {
            const fontString = 'Arial, Helvetica, sans-serif';
            const fonts = (fontFallbackHandler as any)._parseFontFamily(fontString);
            expect(fonts).toEqual(['Arial', 'Helvetica', 'sans-serif']);
        });
        
        test('should parse mixed font-family string', () => {
            const fontString = '"Noto Sans JP", Arial, "Times New Roman", serif';
            const fonts = (fontFallbackHandler as any)._parseFontFamily(fontString);
            expect(fonts).toEqual(['Noto Sans JP', 'Arial', 'Times New Roman', 'serif']);
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle null element gracefully', () => {
            expect(() => {
                fontFallbackHandler.applyFallback(null as any, 'ja');
            }).not.toThrow();
        });
        
        test('should handle empty language code', () => {
            const chain = fontFallbackHandler.getFallbackChain('');
            expect(chain).toContain('Arial');
            expect(chain).toContain('sans-serif');
        });
        
        test('should handle malformed font-family string', () => {
            const mockElement: MockElement = {
                style: {
                    fontFamily: ';;;,,,"""'
                }
            };
            
            expect(() => {
                fontFallbackHandler.applyFallback(mockElement as any, 'ja');
            }).not.toThrow();
        });
    });
    
    describe('Configuration', () => {
        test('should use custom configuration when provided', () => {
            const config: FontFallbackConfig = {
                development: {
                    verboseLogging: true
                }
            };
            
            const customHandler = new FontFallbackHandler(config);
            const mockElement: MockElement = { style: {} };
            
            customHandler.applyFallback(mockElement as any, 'ja');
            // Verbose logging should be active
            expect(consoleSpy.log).toHaveBeenCalled();
        });
    });
});