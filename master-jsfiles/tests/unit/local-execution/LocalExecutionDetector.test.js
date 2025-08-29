/**
 * LocalExecutionDetector.test.js
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

import LocalExecutionDetector from '../../../src/utils/local-execution/LocalExecutionDetector.js';

describe('LocalExecutionDetector', () => {
    let originalWindow;
    let mockWindow;

    beforeEach(() => {
        // Store original window for restoration
        originalWindow = global.window;
        
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
        
        global.window = mockWindow;
    });

    afterEach(() => {
        // Restore original window
        global.window = originalWindow;
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
            global.window = undefined;
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });

        test('should handle missing location gracefully', () => {
            delete mockWindow.location;
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });

        test('should handle errors during protocol access', () => {
            Object.defineProperty(mockWindow.location, 'protocol', {
                get() {
                    throw new Error('Access denied');
                }
            });
            expect(LocalExecutionDetector.isLocalExecution()).toBe(false);
        });
    });

    describe('canUseCanvas', () => {
        test('should return true when Canvas is supported', () => {
            expect(LocalExecutionDetector.canUseCanvas()).toBe(true);
        });

        test('should return false when HTMLCanvasElement is not available', () => {
            delete mockWindow.HTMLCanvasElement;
            expect(LocalExecutionDetector.canUseCanvas()).toBe(false);
        });

        test('should return false when createElement fails', () => {
            mockWindow.document.createElement.mockImplementation(() => {
                throw new Error('createElement failed');
            });
            expect(LocalExecutionDetector.canUseCanvas()).toBe(false);
        });

        test('should return false when getContext fails', () => {
            mockWindow.document.createElement.mockReturnValue({
                getContext: jest.fn(() => null),
                style: {}
            });
            expect(LocalExecutionDetector.canUseCanvas()).toBe(false);
        });
    });

    describe('canUseLocalStorage', () => {
        test('should return true when localStorage is available', () => {
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(true);
        });

        test('should return false when localStorage is not available', () => {
            delete mockWindow.localStorage;
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(false);
        });

        test('should return false when localStorage access throws error', () => {
            Object.defineProperty(mockWindow, 'localStorage', {
                get() {
                    throw new Error('localStorage access denied');
                }
            });
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(false);
        });

        test('should return false when localStorage.setItem throws error', () => {
            mockWindow.localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });
            expect(LocalExecutionDetector.canUseLocalStorage()).toBe(false);
        });
    });

    describe('canUseModules', () => {
        test('should return true for http:// protocol', () => {
            mockWindow.location.protocol = 'http:';
            expect(LocalExecutionDetector.canUseModules()).toBe(true);
        });

        test('should return true for https:// protocol', () => {
            mockWindow.location.protocol = 'https:';
            expect(LocalExecutionDetector.canUseModules()).toBe(true);
        });

        test('should return false for file:// protocol', () => {
            mockWindow.location.protocol = 'file:';
            expect(LocalExecutionDetector.canUseModules()).toBe(false);
        });

        test('should handle missing location gracefully', () => {
            delete mockWindow.location;
            expect(LocalExecutionDetector.canUseModules()).toBe(false);
        });
    });

    describe('getExecutionContext', () => {
        test('should return complete context for server execution', () => {
            mockWindow.location.protocol = 'https:';
            mockWindow.location.href = 'https://example.com/game';

            const context = LocalExecutionDetector.getExecutionContext();

            expect(context).toMatchObject({
                isLocal: false,
                protocol: 'https:',
                canUseModules: true,
                canUseCanvas: true,
                canUseLocalStorage: true,
                supportedFeatures: {
                    canvas: true,
                    localStorage: true,
                    modules: true
                },
                url: 'https://example.com/game'
            });
        });

        test('should return complete context for local execution', () => {
            mockWindow.location.protocol = 'file:';
            mockWindow.location.href = 'file:///path/to/game/index.html';

            const context = LocalExecutionDetector.getExecutionContext();

            expect(context).toMatchObject({
                isLocal: true,
                protocol: 'file:',
                canUseModules: false,
                canUseCanvas: true,
                canUseLocalStorage: true,
                supportedFeatures: {
                    canvas: true,
                    localStorage: true,
                    modules: false
                },
                url: 'file:///path/to/game/index.html'
            });
        });

        test('should handle limited browser capabilities', () => {
            mockWindow.location.protocol = 'file:';
            delete mockWindow.HTMLCanvasElement;
            delete mockWindow.localStorage;

            const context = LocalExecutionDetector.getExecutionContext();

            expect(context.supportedFeatures).toEqual({
                canvas: false,
                localStorage: false,
                modules: false
            });
            expect(context.canUseCanvas).toBe(false);
            expect(context.canUseLocalStorage).toBe(false);
        });

        test('should handle missing window gracefully', () => {
            global.window = undefined;

            const context = LocalExecutionDetector.getExecutionContext();

            expect(context).toEqual({
                isLocal: false,
                protocol: 'unknown',
                canUseModules: false,
                canUseCanvas: false,
                canUseLocalStorage: false,
                supportedFeatures: {
                    canvas: false,
                    localStorage: false,
                    modules: false
                },
                url: 'unknown'
            });
        });
    });

    describe('Error handling and edge cases', () => {
        test('should not throw errors when all browser features fail', () => {
            // Simulate complete browser capability failure
            global.window = {
                location: {
                    get protocol() { throw new Error('Protocol access failed'); },
                    get href() { throw new Error('URL access failed'); }
                },
                get localStorage() { throw new Error('localStorage access failed'); },
                document: {
                    createElement() { throw new Error('createElement failed'); }
                }
            };

            expect(() => {
                LocalExecutionDetector.isLocalExecution();
                LocalExecutionDetector.canUseCanvas();
                LocalExecutionDetector.canUseLocalStorage();
                LocalExecutionDetector.canUseModules();
                LocalExecutionDetector.getExecutionContext();
            }).not.toThrow();
        });

        test('should provide consistent results across multiple calls', () => {
            mockWindow.location.protocol = 'file:';

            const context1 = LocalExecutionDetector.getExecutionContext();
            const context2 = LocalExecutionDetector.getExecutionContext();
            const isLocal1 = LocalExecutionDetector.isLocalExecution();
            const isLocal2 = LocalExecutionDetector.isLocalExecution();

            expect(context1).toEqual(context2);
            expect(isLocal1).toBe(isLocal2);
        });
    });

    describe('Integration with real browser scenarios', () => {
        test('should detect Chrome file:// execution', () => {
            mockWindow.location.protocol = 'file:';
            mockWindow.location.href = 'file:///Users/user/Desktop/game/index.html';
            // Chrome typically supports Canvas and localStorage in file://
            
            const context = LocalExecutionDetector.getExecutionContext();
            
            expect(context.isLocal).toBe(true);
            expect(context.canUseModules).toBe(false);
            expect(context.canUseCanvas).toBe(true);
            expect(context.canUseLocalStorage).toBe(true);
        });

        test('should detect Firefox local restrictions', () => {
            mockWindow.location.protocol = 'file:';
            // Firefox might have stricter localStorage restrictions
            mockWindow.localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage disabled in file:// protocol');
            });
            
            const context = LocalExecutionDetector.getExecutionContext();
            
            expect(context.isLocal).toBe(true);
            expect(context.canUseLocalStorage).toBe(false);
        });

        test('should handle Safari private browsing mode', () => {
            mockWindow.location.protocol = 'https:';
            // Safari private browsing might have localStorage issues
            mockWindow.localStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });
            
            const context = LocalExecutionDetector.getExecutionContext();
            
            expect(context.isLocal).toBe(false);
            expect(context.canUseLocalStorage).toBe(false);
        });
    });

    describe('Performance considerations', () => {
        test('should complete detection quickly', () => {
            const startTime = Date.now();
            
            for (let i = 0; i < 100; i++) {
                LocalExecutionDetector.getExecutionContext();
            }
            
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            
            // Should complete 100 calls in under 100ms
            expect(executionTime).toBeLessThan(100);
        });

        test('should not create memory leaks', () => {
            const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
            
            // Run detection many times
            for (let i = 0; i < 1000; i++) {
                LocalExecutionDetector.getExecutionContext();
            }
            
            // Force garbage collection if available
            if (global.gc) global.gc();
            
            const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Should not increase memory by more than 1MB
            expect(memoryIncrease).toBeLessThan(1024 * 1024);
        });
    });
});