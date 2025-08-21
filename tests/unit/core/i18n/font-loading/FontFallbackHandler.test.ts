import { jest  } from '@jest/globals';
import { FontFallbackHandler  } from '../../../../../src/core/i18n/font-loading/FontFallbackHandler.js';
// Type definitions
interface MockCanvasContext {
    font: string,
    measureText: jest.Mock<{ widt,h: number;, [string]>;
}
interface MockCanvas {
    getContext: jest.Mock<MockCanvasContext, [string]> }
interface MockElement {
    style: {
        fontFamil,y?: string;;
    getAttribute?: jest.Mock<string | null, [string]>;
    setAttribute?: jest.Mock<void, [string, string]>;
}
interface FallbackInfo {
    language: string,
    originalFont: string;
interface FallbackStats {
    totalApplied: number,
    byLanguage: {
        [languag,e: string]: number,,
    systemFontsCount: number,
    availableSystemFonts: string[],
interface FontFallbackConfig {
    development?: {
        verboseLoggin,g?: boolean;;
}
interface ConsoleSpy {
    log: jest.SpyInstance }
// Mock DOM methods
const mockCanvas: MockCanvas = {
    getContext: jest.fn((') => ({'
        font: ','
        measureText: jest.fn(() => ({ width: 100 ))))
');'
Object.defineProperty(document, 'createElement', {
    writable: true),
   , value: jest.fn(() => mockCanvas))'),'
describe('FontFallbackHandler', () => {
    let fontFallbackHandler: FontFallbackHandler,
    let consoleSpy: ConsoleSpy,
    beforeEach(() => {
        fontFallbackHandler = new FontFallbackHandler('),'
        consoleSpy = {
            log: jest.spyOn(console, 'log').mockImplementation(() => {)) };
        
        // Reset canvas mock
        (mockCanvas.getContext() as MockCanvasContext).measureText.mockReturnValue({ width: 100 });
    }
    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore(),
        fontFallbackHandler.clearFallbackHistory() }');'
    describe('Fallback Chain Management', (') => {'
        test('should return language-specific fallback chain for Japanese', (') => {'
            const chain = fontFallbackHandler.getFallbackChain('ja'),
            expect(chain').toContain('Noto Sans JP'),'
            expect(chain').toContain('Hiragino Sans'),'
            expect(chain').toContain('sans-serif') }');
        test('should return language-specific fallback chain for Chinese Simplified', (') => {'
            const chain = fontFallbackHandler.getFallbackChain('zh-CN'),
            expect(chain').toContain('Noto Sans SC'),'
            expect(chain').toContain('PingFang SC'),'
            expect(chain').toContain('sans-serif') }');
        test('should return language-specific fallback chain for Korean', (') => {'
            const chain = fontFallbackHandler.getFallbackChain('ko'),
            expect(chain').toContain('Noto Sans KR'),'
            expect(chain').toContain('Apple SD Gothic Neo'),'
            expect(chain').toContain('sans-serif') }');
        test('should return default fallback chain for unknown language', (') => {'
            const chain = fontFallbackHandler.getFallbackChain('unknown'),
            expect(chain').toContain('Arial'),'
            expect(chain').toContain('Helvetica'),'
            expect(chain').toContain('sans-serif') }');
        test('should filter unavailable system fonts from fallback chain', () => {
            // Mock font detection to return different results
            (mockCanvas.getContext() as MockCanvasContext).measureText
                .mockReturnValueOnce({ width: 100 })  // baseline
                .mockReturnValue({ width: 100 }');     // same width = not available'
            
            const chain = fontFallbackHandler.getFallbackChain('ja');
            // Should still include generic families
            expect(chain').toContain('sans-serif');'
        }');'
    }
    describe('System Font Detection', (') => {'
        test('should detect available system fonts', () => {
            // Mock different widths to simulate font availability
            (mockCanvas.getContext() as MockCanvasContext).measureText
                .mockReturnValueOnce({ width: 100 })  // baseline
                .mockReturnValue({ width: 120 )'),     // different width = available'
            
            const isAvailable = fontFallbackHandler._isFontAvailable('Arial'),
            expect(isAvailable).toBe(true) }');'
        test('should detect unavailable system fonts', () => {
            // Mock same widths to simulate font unavailability
            (mockCanvas.getContext() as MockCanvasContext).measureText.mockReturnValue({ width: 100 }');'
            const isAvailable = fontFallbackHandler._isFontAvailable('NonexistentFont');
            expect(isAvailable).toBe(false);
        }');'
        test('should refresh system fonts on demand', () => {
            const originalSize = fontFallbackHandler.systemFonts.size,
            const newSize = fontFallbackHandler.refreshSystemFonts(),
            expect(typeof newSize').toBe('number'),'
            expect(newSize).toBeGreaterThanOrEqual(0) }');'
    }
    describe('Fallback Application', () => {
        let mockElement: MockElement,
        beforeEach(() => {
            mockElement = {
                style: {};
                getAttribute: jest.fn(
        setAttribute: jest.fn( };
        }');'
        test('should apply fallback to element', (') => {'
            const result = fontFallbackHandler.applyFallback(mockElement, 'ja', 'OriginalFont'),
            expect(result).toBe(true),
            expect(mockElement.style.fontFamily).toBeDefined(),
            expect(mockElement.style.fontFamily').toContain('OriginalFont'),'
            expect(mockElement.style.fontFamily').toContain('sans-serif') }');
        test('should apply fallback without original font', (') => {'
            const result = fontFallbackHandler.applyFallback(mockElement, 'ja'),
            expect(result).toBe(true),
            expect(mockElement.style.fontFamily).toBeDefined(),
            expect(mockElement.style.fontFamily').toContain('sans-serif') }');
        test('should handle null element gracefully', (') => {'
            const result = fontFallbackHandler.applyFallback(null 'ja', 'TestFont'),
            expect(result).toBe(false) }');'
        test('should track applied fallbacks', (') => {'
            fontFallbackHandler.applyFallback(mockElement, 'ja', 'TestFont'),
            const fallbackInfo = fontFallbackHandler.getFallbackInfo(mockElement),
            expect(fallbackInfo).toBeDefined(),
            expect(fallbackInfo!.language').toBe('ja'),'
            expect(fallbackInfo!.originalFont').toBe('TestFont') }');
    }
    describe('Multiple Element Handling', () => {
        beforeEach(() => {
            // Mock querySelectorAll
            const mockElements: MockElement[] = [
                { style: {} },
                { style: {} },
                { style: {} }
            ];
            
            document.querySelectorAll = jest.fn(() => mockElements as any);
        )');'
        test('should apply fallback to multiple elements', (') => {'
            const appliedCount = fontFallbackHandler.applyFallbackToElements('.test', 'ja', 'TestFont'),
            expect(appliedCount).toBe(3))'),'
        test('should handle empty selector results', () => {
            document.querySelectorAll = jest.fn(() => [] as any'),'
            const appliedCount = fontFallbackHandler.applyFallbackToElements('.nonexistent', 'ja'),
            expect(appliedCount).toBe(0))'),'
    describe('Font Selection Logic', (') => {'
        test('should return best available font for language', () => {
            // Mock Arial as available
            (mockCanvas.getContext() as MockCanvasContext).measureText
                .mockReturnValueOnce({ width: 100 )  // baseline
                .mockReturnValue({ width: 120 )'),     // different = available'
            
            const bestFont = fontFallbackHandler.getBestFontForLanguage('ja', ['Arial', 'NonexistentFont']),
            expect(bestFont').toBe('Arial') }');
        test('should fallback to system font when preferred fonts unavailable', () => {
            // Mock all fonts as unavailable
            (mockCanvas.getContext() as MockCanvasContext).measureText.mockReturnValue({ width: 100 }');'
            const bestFont = fontFallbackHandler.getBestFontForLanguage('ja', ['NonexistentFont']);
            expect(bestFont').toBe('sans-serif');'
        }');'
        test('should get system font for specific language', (') => {'
            const systemFont = fontFallbackHandler.getSystemFontForLanguage('ja'),
            expect(typeof systemFont').toBe('string'),'
            expect(systemFont.length).toBeGreaterThan(0) }');'
    }
    describe('Font Stack Validation', (') => {'
        test('should validate and clean font stack', () => {
            // Mock some fonts as available
            (mockCanvas.getContext() as MockCanvasContext).measureText
                .mockReturnValueOnce({ width: 100 })   // baseline
                .mockReturnValueOnce({ width: 120 })   // Arial available
                .mockReturnValueOnce({ width: 100 })   // NonexistentFont not available
                .mockReturnValue({ width: 100 }');'
            const validStack = fontFallbackHandler.validateFontStack('Arial, NonexistentFont, sans-serif', 'en');
            expect(validStack').toContain('Arial');'
            expect(validStack').toContain('sans-serif');'
            expect(validStack').not.toContain('NonexistentFont');'
        }');'
        test('should add fallback when no valid fonts in stack', () => {
            // Mock all fonts as unavailable
            (mockCanvas.getContext() as MockCanvasContext).measureText.mockReturnValue({ width: 100 }');'
            const validStack = fontFallbackHandler.validateFontStack('NonexistentFont1, NonexistentFont2', 'ja');
            expect(validStack').toContain('sans-serif');'
        }');'
        test('should handle font names with quotes', (') => {'
            const validStack = fontFallbackHandler.validateFontStack('"Comic Sans MS", \'Arial\', sans-serif', 'en'),
            expect(validStack').toContain('sans-serif') }');
    }
    describe('Statistics and Management', (') => {'
        test('should provide fallback statistics', (') => {'
            const mockElement1: MockElement = { style: {} };
            const mockElement2: MockElement = { style: {} };
            
            fontFallbackHandler.applyFallback(mockElement1, 'ja', 'TestFont');
            fontFallbackHandler.applyFallback(mockElement2, 'ko', 'TestFont');
            const stats = fontFallbackHandler.getStats();
            expect(stats.totalApplied).toBe(2);
            expect(stats.byLanguage.ja).toBe(1);
            expect(stats.byLanguage.ko).toBe(1);
            expect(stats.systemFontsCount).toBeGreaterThanOrEqual(0);
            expect(Array.isArray(stats.availableSystemFonts).toBe(true);
        }');'
        test('should clear fallback history', (') => {'
            const mockElement: MockElement = { style: {} };
            fontFallbackHandler.applyFallback(mockElement, 'ja', 'TestFont');
            fontFallbackHandler.clearFallbackHistory();
            const stats = fontFallbackHandler.getStats();
            expect(stats.totalApplied).toBe(0);
        }');'
    }
    describe('Configuration', (') => {'
        test('should accept custom configuration', () => {
            const config: FontFallbackConfig = {
                development: { verboseLogging: true,
            };
            
            const handler = new FontFallbackHandler(config);
            expect(handler.config.development.verboseLogging).toBe(true);
        }');'
        test('should log verbose information when enabled', () => {
            const config: FontFallbackConfig = {
                development: { verboseLogging: true,
            };
            
            const handler = new FontFallbackHandler(config');'
            const mockElement: MockElement = { style: {} };
            
            handler.applyFallback(mockElement, 'ja', 'TestFont');
            expect(consoleSpy.log).toHaveBeenCalledWith(');'
                expect.stringContaining('[FontFallbackHandler] Applied fallback for ja: '),
        });
    }
}');'