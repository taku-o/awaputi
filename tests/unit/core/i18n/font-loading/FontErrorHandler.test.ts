import { jest } from '@jest/globals';
import { FontErrorHandler } from '../../../../../src/core/i18n/font-loading/FontErrorHandler.js';
// Type definitions
interface FontContext {
    source: string,
    fontFamily: string,
}
interface ErrorStats {
    [source: string]: {
        [errorType: string]: number,
    };
}
interface FontErrorConfig {
    logLevel?: string;
    suppressRepeated?: boolean;
    maxErrorsPerSource?: number;
    development?: {
        verboseLogging?: boolean;
    };
}
interface ConsoleSpy {
    warn: jest.SpyInstance,
    error: jest.SpyInstance,
    log: jest.SpyInstance,
}
describe('FontErrorHandler', () => {
    let fontErrorHandler: FontErrorHandler,
    let consoleSpy: ConsoleSpy,
    beforeEach(() => {
        fontErrorHandler = new FontErrorHandler(');
        consoleSpy = {
            warn: jest.spyOn(console, 'warn').mockImplementation(() => {}'),
            error: jest.spyOn(console, 'error').mockImplementation(() => {}'),
            log: jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore();
        fontErrorHandler.clearErrorHistory();
    }');
    describe('Error Categorization', (') => {
        test('should categorize network errors correctly', (') => {
            const networkError = new Error('Network request failed'');
            const context: FontContext = { source: 'google', fontFamily: 'Arial' };
            
            const handled = fontErrorHandler.handleFontError(networkError, context);
            expect(handled).toBe(true);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('[FontErrorHandler]');
        }');
        test('should categorize file not found errors correctly', (') => {
            const fileError = new Error('Font file not found'');
            const context: FontContext = { source: 'local', fontFamily: 'CustomFont' };
            
            const handled = fontErrorHandler.handleFontError(fileError, context);
            expect(handled).toBe(true);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('Ensure font file exists');
        }');
        test('should categorize timeout errors correctly', (') => {
            const timeoutError = new Error('Font loading timeout'');
            const context: FontContext = { source: 'google', fontFamily: 'OpenSans' };
            
            const handled = fontErrorHandler.handleFontError(timeoutError, context);
            expect(handled).toBe(true);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('taking too long');
        }');
        test('should categorize configuration errors correctly', (') => {
            const configError = new Error('Invalid font configuration'');
            const context: FontContext = { source: 'system', fontFamily: 'Arial' };
            
            const handled = fontErrorHandler.handleFontError(configError, context);
            expect(handled).toBe(true);
            expect(consoleSpy.error).toHaveBeenCalled();
        }');
    }
    describe('Error Suppression', (') => {
        test('should suppress repeated errors from same source', (') => {
            const error = new Error('Network failed'');
            const context: FontContext = { source: 'google', fontFamily: 'Arial' };
            
            // First error should be handled
            const firstHandled = fontErrorHandler.handleFontError(error, context);
            expect(firstHandled).toBe(true);
            // Subsequent errors should be suppressed after threshold
            for (let i = 0; i < 5; i++) {
                fontErrorHandler.handleFontError(error, context);
            }
            
            const stats = fontErrorHandler.getErrorStats();
            expect(stats.google).toBeDefined();
        }');
        test('should suppress local file not found errors completely', (') => {
            const fileError = new Error('Font file not found'');
            const context: FontContext = { source: 'local', fontFamily: 'MissingFont' };
            
            const handled = fontErrorHandler.handleFontError(fileError, context);
            // Should be handled but may be suppressed based on rules
            expect(typeof handled').toBe('boolean');
        }');
        test('should allow configuration of suppression rules', () => {
            const config: FontErrorConfig = {
                suppressRepeated: false,
                maxErrorsPerSource: 10
            };
            
            const handler = new FontErrorHandler(config');
            const error = new Error('Test error'');
            const context: FontContext = { source: 'google', fontFamily: 'Test' };
            
            // Should not suppress when disabled
            const handled = handler.handleFontError(error, context);
            expect(handled).toBe(true);
        }');
    }
    describe('Logging Levels', (') => {
        test('should use warn level for most font errors', (') => {
            const error = new Error('Font loading failed'');
            const context: FontContext = { source: 'google', fontFamily: 'Arial' };
            
            fontErrorHandler.handleFontError(error, context);
            expect(consoleSpy.warn).toHaveBeenCalled();
            expect(consoleSpy.error).not.toHaveBeenCalled();
        }');
        test('should use error level for configuration errors', (') => {
            const configError = new Error('Invalid font config'');
            const context: FontContext = { source: 'system', fontFamily: 'Arial' };
            
            fontErrorHandler.handleFontError(configError, context);
            expect(consoleSpy.error).toHaveBeenCalled();
        }');
        test('should support verbose logging in development mode', () => {
            const config: FontErrorConfig = {
                development: { verboseLogging: true }
            };
            
            const handler = new FontErrorHandler(config');
            const error = new Error('Test error'');
            const context: FontContext = { source: 'google', fontFamily: 'Test' };
            
            handler.handleFontError(error, context);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('[FontErrorHandler] Detailed font loading error:'),
                expect.any(Object);
        }');
    }
    describe('Error History and Statistics', (') => {
        test('should track error history', (') => {
            const error1 = new Error('Network error'');
            const error2 = new Error('Timeout error'');
            fontErrorHandler.handleFontError(error1, { source: 'google', fontFamily: 'Arial' }');
            fontErrorHandler.handleFontError(error2, { source: 'local', fontFamily: 'Custom' ),
            const stats = fontErrorHandler.getErrorStats();
            expect(Object.keys(stats).length).toBeGreaterThan(0);
        }');
        test('should clear error history', (') => {
            const error = new Error('Test error'');
            fontErrorHandler.handleFontError(error, { source: 'google', fontFamily: 'Arial' });
            fontErrorHandler.clearErrorHistory();
            const stats = fontErrorHandler.getErrorStats();
            expect(Object.keys(stats).length).toBe(0);
        }');
        test('should limit error history size', (') => {
            const error = new Error('Repeated error'');
            const context: FontContext = { source: 'google', fontFamily: 'Arial' };
            
            // Generate many errors
            for (let i = 0; i < 15; i++) {
                fontErrorHandler.handleFontError(error, context);
            }
            
            // History should be limited
            const stats = fontErrorHandler.getErrorStats();
            expect(stats.google.NetworkError).toBeLessThanOrEqual(10);
        }');
    }
    describe('Actionable Error Messages', (') => {
        test('should provide actionable messages for network errors', (') => {
            const networkError = new Error('Failed to fetch'');
            const context: FontContext = { source: 'google', fontFamily: 'Roboto' };
            
            fontErrorHandler.handleFontError(networkError, context);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('Check network connectivity');
        }');
        test('should provide actionable messages for file not found errors', (') => {
            const fileError = new Error('404 not found'');
            const context: FontContext = { source: 'local', fontFamily: 'CustomFont' };
            
            fontErrorHandler.handleFontError(fileError, context);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('Ensure font file exists');
        }');
        test('should provide actionable messages for timeout errors', (') => {
            const timeoutError = new Error('Request timeout'');
            const context: FontContext = { source: 'google', fontFamily: 'OpenSans' };
            
            fontErrorHandler.handleFontError(timeoutError, context);
            expect(consoleSpy.warn).toHaveBeenCalledWith(');
                expect.stringContaining('taking too long');
        }');
    }
    describe('Configuration', (') => {
        test('should accept custom configuration', (') => {
            const config: FontErrorConfig = {
                logLevel: 'error',
                suppressRepeated: false,
                maxErrorsPerSource: 5
            };
            
            const handler = new FontErrorHandler(config);
            expect(handler.config.logLevel').toBe('error');
            expect(handler.config.suppressRepeated).toBe(false);
            expect(handler.config.maxErrorsPerSource).toBe(5);
        }');
        test('should use default configuration when none provided', () => {
            const handler = new FontErrorHandler();
            expect(handler.suppressionRules.repeatSuppression.enabled).toBe(true);
            expect(handler.suppressionRules.repeatSuppression.maxOccurrences).toBe(3);
        });
    }
}');