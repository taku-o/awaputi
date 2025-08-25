/**
 * LocalExecutionDetector.test.ts
 * Unit tests for LocalExecutionDetector - Issue #63 local execution support
 * 
 * Test coverage:
 * - Protocol detection (file:// vs http:/https:)
 * - Browser capability detection
 * - Execution context creation
 * - Edge cases and error handling
 * 
 * Requirements: 1.1, 2.1, 5.1
 */
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import LocalExecutionDetector from '../../../src/utils/local-execution/LocalExecutionDetector.js';

// Type definitions
interface MockLocation {
    protocol: string;
    href: string;


interface MockCanvas {
    getContext: jest.Mock<any, [string]>;
    style: Partial<CSSStyleDeclaration>;


interface MockDocument {
    createElement: jest.Mock<MockCanvas, [string]>;


interface MockLocalStorage {
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;


interface MockWindow {
    location: MockLocation;
    localStorage?: MockLocalStorage;
    document: MockDocument;
    HTMLCanvasElement?: Function;
    CanvasRenderingContext2D?: Function;


interface ExecutionContext {
    isLocal: boolean;
    protocol: string;
    canUseModules: boolean;
    canUseCanvas: boolean;
    canUseLocalStorage: boolean;
    supportedFeatures: {
        canvas: boolean;
        localStorage: boolean;
        modules: boolean;
    };
    url: string;


describe('LocalExecutionDetector', () => {
    let originalWindow: Window | undefined;
    let mockWindow: MockWindow;
    
    beforeEach(() => {
        // Store original window for restoration
        originalWindow = (global as any).window;
        
        // Create mock window object
        mockWindow = {
            location: {
                protocol: 'http:',
                href: 'http://localhost:3000'
            },
            localStorage: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn()
            },
            document: {
                createElement: jest.fn(() => ({
                    getContext: jest.fn(() => ({})),
                    style: {}
                }))
            },
            HTMLCanvasElement: function() {},
            CanvasRenderingContext2D: function() {}
        };
        
        (global as any).window = mockWindow;
    });
    
    afterEach(() => {
        // Restore original window
        (global as any).window = originalWindow;
        jest.clearAllMocks();
    });
    
    describe('isLocalExecution', () => {
        test('should return true for file:// protocol', () => {
            mockWindow.location.protocol = 'file:';
            expect(LocalExecutionDetector.isLocalExecution()).toBe(true);
        });
        
        test('should return false for http:// protocol', () => {
            mockWindow.location.protocol = 'http:';
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });
        
        test('should return false for https:// protocol', () => {
            mockWindow.location.protocol = 'https:';
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });
        
        test('should handle missing window gracefully', () => {
            (global as any).window = undefined;
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });
        
        test('should handle missing location gracefully', () => {
            mockWindow.location = undefined as any;
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });
        
        test('should handle various protocol formats', () => {
            const testCases = [
                { protocol: 'FILE:', expected: true },
                { protocol: 'file:', expected: true },
                { protocol: 'File:', expected: true },
                { protocol: 'http:', expected: false },
                { protocol: 'https:', expected: false },
                { protocol: 'ftp:', expected: false },
                { protocol: '', expected: false }
            ];
            
            testCases.forEach(({ protocol, expected }) => {
                mockWindow.location.protocol = protocol;
                expect(LocalExecutionDetector.isLocalExecution()).toBe(expected);
            });
        });
    });
    
    describe('canUseCanvas', () => {
        test('should return true when canvas is available', () => {
            expect(LocalExecutionDetector.canUseCanvas()).toBe(true);
            expect(mockWindow.document.createElement).toHaveBeenCalledWith('canvas');
        });
        
        test('should return false when canvas creation fails', () => {
            mockWindow.document.createElement.mockImplementation(() => {
                throw new Error('Canvas not supported');
            });
            
            expect(LocalExecutionDetector.canUseCanvas()).toBe(false);
        });
        
        test('should return false when getContext fails', () => {
            const mockCanvas = {
                getContext: jest.fn(() => null),
                style: {}
            };
            mockWindow.document.createElement.mockReturnValue(mockCanvas);
            
            expect(LocalExecutionDetector.canUseCanvas()).toBe(false);
        });
        
        test('should handle missing document gracefully', () => {
            mockWindow.document = undefined as any;
            expect(LocalExecutionDetector.canUseCanvas()).toBe(false);
        });
        
        test('should test both 2d and webgl contexts', () => {
            const mockCanvas = {
                getContext: jest.fn()
                    .mockReturnValueOnce({ canvas: 'mock-2d' })  // 2d context
                    .mockReturnValueOnce({ canvas: 'mock-webgl' }), // webgl context
                style: {}
            };
            mockWindow.document.createElement.mockReturnValue(mockCanvas);
            
            expect(LocalExecutionDetector.canUseCanvas()).toBe(true);
            expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
            expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
        });
    });
    
    describe('canUseLocalStorage', () => {
        test('should return true when localStorage is available', () => {
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(true);
        });
        
        test('should return false when localStorage is not available', () => {
            mockWindow.localStorage = undefined;
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(false);
        });
        
        test('should test localStorage functionality', () => {
            const testKey = 'test-key';
            const testValue = 'test-value';
            
            LocalExecutionDetector.canUseLocalStorage();
            
            expect(mockWindow.localStorage!.setItem).toHaveBeenCalledWith(testKey, testValue);
            expect(mockWindow.localStorage!.getItem).toHaveBeenCalledWith(testKey);
            expect(mockWindow.localStorage!.removeItem).toHaveBeenCalledWith(testKey);
        });
        
        test('should handle localStorage exceptions gracefully', () => {
            mockWindow.localStorage!.setItem.mockImplementation(() => {
                throw new Error('LocalStorage quota exceeded');
            });
            
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(false);
        });
    });
    
    describe('canUseModules', () => {
        test('should return true when ES modules are supported', () => {
            // ES modules are supported by default in modern environments
            expect(LocalExecutionDetector.canUseModules()).toBe(true);
        });
        
        test('should detect module support based on script type', () => {
            const mockScript = {
                setAttribute: jest.fn(),
                type: ''
            };
            
            mockWindow.document.createElement = jest.fn(() => mockScript as any);
            
            const result = LocalExecutionDetector.canUseModules();
            expect(result).toBeDefined();
        });
        
        test('should handle module detection errors gracefully', () => {
            mockWindow.document.createElement.mockImplementation(() => {
                throw new Error('Script creation failed');
            });
            
            expect(LocalExecutionDetector.canUseModules()).toBe(false);
        });
    });
    
    describe('getExecutionContext', () => {
        test('should return complete execution context for HTTP', () => {
            mockWindow.location.protocol = 'http:';
            mockWindow.location.href = 'http://example.com/game';
            
            const context: ExecutionContext = LocalExecutionDetector.getExecutionContext();
            
            expect(context.isLocal).toBe(false);
            expect(context.protocol).toBe('http:');
            expect(context.url).toBe('http://example.com/game');
            expect(context.canUseCanvas).toBe(true);
            expect(context.canUseLocalStorage).toBe(true);
            expect(context.canUseModules).toBe(true);
            expect(context.supportedFeatures.canvas).toBe(true);
            expect(context.supportedFeatures.localStorage).toBe(true);
            expect(context.supportedFeatures.modules).toBe(true);
        });
        
        test('should return complete execution context for file://', () => {
            mockWindow.location.protocol = 'file:';
            mockWindow.location.href = 'file:///path/to/game/index.html';
            
            const context = LocalExecutionDetector.getExecutionContext();
            
            expect(context.isLocal).toBe(true);
            expect(context.protocol).toBe('file:');
            expect(context.url).toBe('file:///path/to/game/index.html');
        });
        
        test('should handle limited browser capabilities', () => {
            // Simulate limited browser
            mockWindow.localStorage = undefined;
            mockWindow.document.createElement.mockImplementation((tag: string) => {
                if (tag === 'canvas') {
                    throw new Error('Canvas not supported');
                }
                return { style: {} } as any;
            });
            
            const context = LocalExecutionDetector.getExecutionContext();
            
            expect(context.canUseCanvas).toBe(false);
            expect(context.canUseLocalStorage).toBe(false);
            expect(context.supportedFeatures.canvas).toBe(false);
            expect(context.supportedFeatures.localStorage).toBe(false);
        });
        
        test('should provide fallback values for missing window', () => {
            (global as any).window = undefined;
            
            const context = LocalExecutionDetector.getExecutionContext();
            
            expect(context.isLocal).toBe(false);
            expect(context.protocol).toBe('unknown');
            expect(context.url).toBe('unknown');
            expect(context.canUseCanvas).toBe(false);
            expect(context.canUseLocalStorage).toBe(false);
            expect(context.canUseModules).toBe(false);
        });
    });
    
    describe('getBrowserCapabilities', () => {
        test('should return comprehensive browser capabilities', () => {
            const capabilities = LocalExecutionDetector.getBrowserCapabilities();
            
            expect(capabilities).toHaveProperty('canvas');
            expect(capabilities).toHaveProperty('localStorage');
            expect(capabilities).toHaveProperty('modules');
            expect(capabilities).toHaveProperty('webgl');
            expect(capabilities).toHaveProperty('audioContext');
        });
        
        test('should test WebGL capability separately', () => {
            const mockCanvas = {
                getContext: jest.fn()
                    .mockReturnValueOnce({ canvas: 'mock-2d' })  // 2d
                    .mockReturnValueOnce(null)  // webgl (not supported)
                    .mockReturnValueOnce(null), // webgl2 (not supported)
                style: {}
            };
            mockWindow.document.createElement.mockReturnValue(mockCanvas);
            
            const capabilities = LocalExecutionDetector.getBrowserCapabilities();
            
            expect(capabilities.canvas).toBe(true);
            expect(capabilities.webgl).toBe(false);
        });
        
        test('should test AudioContext capability', () => {
            (mockWindow as any).AudioContext = function() {};
            
            const capabilities = LocalExecutionDetector.getBrowserCapabilities();
            
            expect(capabilities.audioContext).toBe(true);
        });
        
        test('should handle missing AudioContext', () => {
            (mockWindow as any).AudioContext = undefined;
            (mockWindow as any).webkitAudioContext = undefined;
            
            const capabilities = LocalExecutionDetector.getBrowserCapabilities();
            
            expect(capabilities.audioContext).toBe(false);
        });
    });
    
    describe('isFileProtocol', () => {
        test('should detect file:// protocol correctly', () => {
            mockWindow.location.protocol = 'file:';
            expect(LocalExecutionDetector.isFileProtocol()).toBe(true);
        });
        
        test('should return false for non-file protocols', () => {
            const protocols = ['http:', 'https:', 'ftp:', 'mailto:', 'tel:'];
            
            protocols.forEach(protocol => {
                mockWindow.location.protocol = protocol;
                expect(LocalExecutionDetector.isFileProtocol()).toBe(false);
            });
        });
        
        test('should be case insensitive', () => {
            const fileProtocols = ['file:', 'FILE:', 'File:', 'fILe:'];
            
            fileProtocols.forEach(protocol => {
                mockWindow.location.protocol = protocol;
                expect(LocalExecutionDetector.isFileProtocol()).toBe(true);
            });
        });
    });
    
    describe('getLocalExecutionWarnings', () => {
        test('should return warnings for file:// execution', () => {
            mockWindow.location.protocol = 'file:';
            
            const warnings = LocalExecutionDetector.getLocalExecutionWarnings();
            
            expect(Array.isArray(warnings)).toBe(true);
            expect(warnings.length).toBeGreaterThan(0);
            expect(warnings.some(w => w.includes('CORS'))).toBe(true);
        });
        
        test('should return empty array for HTTP execution', () => {
            mockWindow.location.protocol = 'http:';
            
            const warnings = LocalExecutionDetector.getLocalExecutionWarnings();
            
            expect(Array.isArray(warnings)).toBe(true);
            expect(warnings.length).toBe(0);
        });
        
        test('should include specific warnings for missing capabilities', () => {
            mockWindow.location.protocol = 'file:';
            mockWindow.localStorage = undefined;
            
            const warnings = LocalExecutionDetector.getLocalExecutionWarnings();
            
            expect(warnings.some(w => w.includes('LocalStorage'))).toBe(true);
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle null location', () => {
            (mockWindow as any).location = null;
            
            expect(() => {
                LocalExecutionDetector.isLocalExecution();
                LocalExecutionDetector.getExecutionContext();
            }).not.toThrow();
        });
        
        test('should handle undefined protocol', () => {
            mockWindow.location.protocol = undefined as any;
            
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });
        
        test('should handle corrupted window object', () => {
            (global as any).window = { 
                location: {},
                document: null
            };
            
            expect(() => {
                LocalExecutionDetector.canUseCanvas();
                LocalExecutionDetector.canUseLocalStorage();
            }).not.toThrow();
        });
        
        test('should handle circular references in context', () => {
            const context = LocalExecutionDetector.getExecutionContext();
            
            // Should be serializable (no circular references)
            expect(() => JSON.stringify(context)).not.toThrow();
        });
    });
    
    describe('Performance', () => {
        test('should cache capabilities detection results', () => {
            // First call
            LocalExecutionDetector.getBrowserCapabilities();
            const firstCallCount = mockWindow.document.createElement.mock.calls.length;
            
            // Second call should use cached results
            LocalExecutionDetector.getBrowserCapabilities();
            const secondCallCount = mockWindow.document.createElement.mock.calls.length;
            
            // Should not make additional createElement calls for caching
            expect(secondCallCount).toBe(firstCallCount);
        });
        
        test('should execute quickly for repeated calls', () => {
            const start = performance.now();
            
            // Make multiple calls
            for (let i = 0; i < 100; i++) {
                LocalExecutionDetector.isLocalExecution();
                LocalExecutionDetector.canUseCanvas();
                LocalExecutionDetector.canUseLocalStorage();
            }
            
            const duration = performance.now() - start;
            
            // Should complete quickly (less than 100ms for 100 iterations)
            expect(duration).toBeLessThan(100);
        });
    });
    
    describe('Integration with Game Systems', () => {
        test('should provide information needed for CORS handling', () => {
            mockWindow.location.protocol = 'file:';
            
            const context = LocalExecutionDetector.getExecutionContext();
            const warnings = LocalExecutionDetector.getLocalExecutionWarnings();
            
            expect(context.isLocal).toBe(true);
            expect(warnings.some(w => w.includes('CORS'))).toBe(true);
        });
        
        test('should detect capabilities needed for game features', () => {
            const capabilities = LocalExecutionDetector.getBrowserCapabilities();
            
            // Game should be able to check these for feature availability
            expect(typeof capabilities.canvas).toBe('boolean');
            expect(typeof capabilities.webgl).toBe('boolean');
            expect(typeof capabilities.audioContext).toBe('boolean');
            expect(typeof capabilities.localStorage).toBe('boolean');
        });
        
        test('should support configuration-based feature detection', () => {
            const context = LocalExecutionDetector.getExecutionContext();
            
            // Game systems can use this to configure themselves
            expect(context.supportedFeatures).toEqual({
                canvas: expect.any(Boolean),
                localStorage: expect.any(Boolean),
                modules: expect.any(Boolean)
            });
        });
    });
});