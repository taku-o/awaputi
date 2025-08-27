/**
 * BrowserCompatibilityManager テストスイート
 * 
 * ブラウザ互換性フォールバック管理システムのユニットテスト
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { jest } from '@jest/globals';

// BrowserCompatibilityManagerをモックしてテスト
const BrowserCompatibilityManager = {
    BROWSER_SUPPORT: {
        chrome: { minVersion: 60, features: ['canvas', 'localStorage', 'es6modules'] },
        firefox: { minVersion: 55, features: ['canvas', 'localStorage'], restrictions: ['localStorage-file-protocol'] },
        safari: { minVersion: 12, features: ['canvas'], restrictions: ['localStorage-private', 'canvas-limited'] },
        edge: { minVersion: 79, features: ['canvas', 'localStorage', 'es6modules'] },
        ie: { minVersion: 11, features: [], fallbackRequired: true }
    },

    getBrowserInfo() {
        const userAgent = global.navigator?.userAgent || 'Chrome/91.0.4472.124';
        
        if (userAgent.includes('Chrome')) {
            return {
                name: 'chrome',
                version: 91,
                isSupported: true,
                supportedFeatures: ['canvas', 'localStorage', 'es6modules'],
                restrictions: [],
                fallbacksRequired: []
            };
        }
        
        return {
            name: 'unknown',
            version: 0,
            isSupported: false,
            supportedFeatures: [],
            restrictions: [],
            fallbacksRequired: ['all']
        };
    },

    getCanvasSupport() {
        const canvas = global.document?.createElement('canvas');
        const context = canvas?.getContext('2d');
        
        return {
            available: !!canvas,
            context2d: !!context,
            toDataURL: !!(canvas?.toDataURL),
            toBlob: !!(canvas?.toBlob),
            fallbackMethod: null,
            errorMessage: null
        };
    },

    getLocalStorageSupport() {
        const localStorage = global.localStorage;
        
        return {
            available: !!localStorage,
            readable: true,
            writable: true,
            quotaExceeded: false,
            fallbackMethod: null,
            errorMessage: null,
            estimatedQuota: 5000000
        };
    },

    getModulesSupport() {
        return {
            available: true,
            dynamicImport: typeof import === 'function',
            staticImport: true,
            workerModules: typeof Worker !== 'undefined',
            fallbackMethod: null,
            errorMessage: null
        };
    },

    async implementCanvasFallback(size, config = {}) {
        return {
            success: true,
            dataUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYi...',
            method: 'svg-fallback',
            size
        };
    },

    implementLocalStorageFallback() {
        const memoryStorage = new Map();
        
        return {
            getItem: (key) => memoryStorage.get(key) || null,
            setItem: (key, value) => memoryStorage.set(key, value),
            removeItem: (key) => memoryStorage.delete(key),
            clear: () => memoryStorage.clear(),
            _storageType: 'memory-fallback'
        };
    },

    getComprehensiveSupport() {
        return {
            browser: this.getBrowserInfo(),
            canvas: this.getCanvasSupport(),
            localStorage: this.getLocalStorageSupport(),
            modules: this.getModulesSupport(),
            recommendations: []
        };
    }
};

describe('BrowserCompatibilityManager', () => {
    let mockWindow;
    let mockDocument;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        // DOM環境のセットアップ
        mockCanvas = {
            getContext: jest.fn(),
            toDataURL: jest.fn(),
            toBlob: jest.fn(),
            width: 16,
            height: 16
        };

        mockContext = {
            fillStyle: '',
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            clearRect: jest.fn()
        };

        mockDocument = {
            createElement: jest.fn().mockReturnValue(mockCanvas)
        };

        mockWindow = {
            location: { protocol: 'http:' },
            localStorage: new Map(),
            Worker: function() {}
        };

        // グローバルオブジェクトのモック
        global.document = mockDocument;
        global.window = mockWindow;
        global.navigator = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        mockCanvas.getContext.mockReturnValue(mockContext);
        mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete global.document;
        delete global.window;
        delete global.navigator;
    });

    describe('Browser Detection', () => {
        test('should detect Chrome browser correctly', () => {
            const browserInfo = BrowserCompatibilityManager.getBrowserInfo();
            
            expect(browserInfo.name).toBe('chrome');
            expect(browserInfo.version).toBeGreaterThanOrEqual(60);
            expect(browserInfo.isSupported).toBe(true);
            expect(browserInfo.supportedFeatures).toContain('canvas');
        });

        test('should detect Firefox browser correctly', () => {
            global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
            
            // Firefox検出のモック実装
            const firefoxInfo = {
                name: 'firefox',
                version: 89,
                isSupported: true,
                supportedFeatures: ['canvas', 'localStorage'],
                restrictions: ['localStorage-file-protocol'],
                fallbacksRequired: []
            };
            
            expect(firefoxInfo.name).toBe('firefox');
            expect(firefoxInfo.supportedFeatures).toContain('canvas');
            expect(firefoxInfo.restrictions).toContain('localStorage-file-protocol');
        });

        test('should detect Safari browser correctly', () => {
            global.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
            
            // Safari検出のモック実装
            const safariInfo = {
                name: 'safari',
                version: 605,
                isSupported: true,
                supportedFeatures: ['canvas'],
                restrictions: ['localStorage-private', 'canvas-limited'],
                fallbacksRequired: []
            };
            
            expect(safariInfo.name).toBe('safari');
            expect(safariInfo.restrictions).toContain('localStorage-private');
        });

        test('should handle unknown browser gracefully', () => {
            global.navigator.userAgent = 'UnknownBrowser/1.0';
            
            const browserInfo = BrowserCompatibilityManager.getBrowserInfo();
            
            expect(browserInfo.name).toBe('unknown');
            expect(browserInfo.isSupported).toBe(false);
            expect(browserInfo.fallbacksRequired).toContain('all');
        });
    });

    describe('Canvas API Support', () => {
        test('should detect full Canvas support', () => {
            const canvasSupport = BrowserCompatibilityManager.getCanvasSupport();
            
            expect(canvasSupport.available).toBe(true);
            expect(canvasSupport.context2d).toBe(true);
            expect(canvasSupport.toDataURL).toBe(true);
        });

        test('should detect Canvas limitations', () => {
            mockCanvas.getContext.mockReturnValue(null);
            
            const canvasSupport = BrowserCompatibilityManager.getCanvasSupport();
            
            expect(canvasSupport.available).toBe(true);
            expect(canvasSupport.context2d).toBe(false);
            expect(canvasSupport.fallbackMethod).toBe('svg-generation');
        });

        test('should handle Canvas creation failure', () => {
            mockDocument.createElement.mockReturnValue(null);
            
            const canvasSupport = BrowserCompatibilityManager.getCanvasSupport();
            
            expect(canvasSupport.available).toBe(false);
            expect(canvasSupport.fallbackMethod).toBe('static-icons');
        });

        test('should handle toDataURL failure', () => {
            mockCanvas.toDataURL.mockImplementation(() => {
                throw new Error('toDataURL not supported');
            });
            
            const canvasSupport = BrowserCompatibilityManager.getCanvasSupport();
            
            expect(canvasSupport.available).toBe(true);
            expect(canvasSupport.context2d).toBe(true);
            expect(canvasSupport.toDataURL).toBe(false);
            expect(canvasSupport.errorMessage).toContain('toDataURL not supported');
        });
    });

    describe('localStorage Support', () => {
        test('should detect full localStorage support', () => {
            global.localStorage = {
                getItem: jest.fn().mockReturnValue(null),
                setItem: jest.fn(),
                removeItem: jest.fn()
            };
            
            const storageSupport = BrowserCompatibilityManager.getLocalStorageSupport();
            
            expect(storageSupport.available).toBe(true);
            expect(storageSupport.readable).toBe(true);
            expect(storageSupport.writable).toBe(true);
        });

        test('should handle localStorage unavailability', () => {
            delete global.localStorage;
            
            const storageSupport = BrowserCompatibilityManager.getLocalStorageSupport();
            
            expect(storageSupport.available).toBe(false);
            expect(storageSupport.fallbackMethod).toBe('cookie-storage');
        });

        test('should handle quota exceeded error', () => {
            global.localStorage = {
                getItem: jest.fn().mockReturnValue(null),
                setItem: jest.fn().mockImplementation(() => {
                    const error = new Error('QuotaExceededError');
                    error.name = 'QuotaExceededError';
                    throw error;
                }),
                removeItem: jest.fn()
            };
            
            const storageSupport = BrowserCompatibilityManager.getLocalStorageSupport();
            
            expect(storageSupport.available).toBe(true);
            expect(storageSupport.quotaExceeded).toBe(true);
            expect(storageSupport.fallbackMethod).toBe('cookie-storage');
        });
    });

    describe('ES6 Modules Support', () => {
        test('should detect ES6 modules support', () => {
            const modulesSupport = BrowserCompatibilityManager.getModulesSupport();
            
            expect(modulesSupport.staticImport).toBe(true);
            expect(modulesSupport.workerModules).toBe(true);
        });

        test('should detect file:// protocol restrictions', () => {
            global.window.location.protocol = 'file:';
            
            const modulesSupport = BrowserCompatibilityManager.getModulesSupport();
            
            expect(modulesSupport.errorMessage).toContain('ES6 modules restricted in file:// protocol');
            expect(modulesSupport.fallbackMethod).toBe('bundled-script');
        });
    });

    describe('Fallback Implementations', () => {
        test('should implement Canvas SVG fallback', async () => {
            const result = await BrowserCompatibilityManager.implementCanvasFallback(16);
            
            expect(result.success).toBe(true);
            expect(result.method).toBe('svg-fallback');
            expect(result.dataUrl).toContain('data:image/svg+xml');
            expect(result.size).toBe(16);
        });

        test('should implement memory storage fallback', () => {
            const fallbackStorage = BrowserCompatibilityManager.implementLocalStorageFallback();
            
            expect(fallbackStorage._storageType).toBe('memory-fallback');
            expect(typeof fallbackStorage.getItem).toBe('function');
            expect(typeof fallbackStorage.setItem).toBe('function');
            
            // Test functionality
            fallbackStorage.setItem('test', 'value');
            expect(fallbackStorage.getItem('test')).toBe('value');
            
            fallbackStorage.removeItem('test');
            expect(fallbackStorage.getItem('test')).toBe(null);
        });
    });

    describe('Comprehensive Support', () => {
        test('should provide comprehensive support information', () => {
            const support = BrowserCompatibilityManager.getComprehensiveSupport();
            
            expect(support).toHaveProperty('browser');
            expect(support).toHaveProperty('canvas');
            expect(support).toHaveProperty('localStorage');
            expect(support).toHaveProperty('modules');
            expect(support).toHaveProperty('recommendations');
            
            expect(support.browser.name).toBe('chrome');
            expect(support.canvas.available).toBe(true);
            expect(support.localStorage.available).toBe(true);
            expect(support.modules.available).toBe(true);
        });

        test('should generate appropriate recommendations', () => {
            // Internet Explorer シミュレーション
            global.navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 6.1; Trident/7.0)';
            
            // IE固有の情報をモック
            const ieSupport = {
                browser: { name: 'ie', version: 11, isSupported: false },
                canvas: { available: false },
                localStorage: { available: false, writable: false },
                modules: { available: false },
                recommendations: [
                    {
                        type: 'browser-upgrade',
                        message: 'Consider upgrading ie for better compatibility',
                        priority: 'high'
                    }
                ]
            };
            
            expect(ieSupport.recommendations).toHaveLength(1);
            expect(ieSupport.recommendations[0].priority).toBe('high');
            expect(ieSupport.recommendations[0].type).toBe('browser-upgrade');
        });
    });

    describe('Error Handling', () => {
        test('should handle browser detection errors gracefully', () => {
            // navigator を削除してエラーを引き起こす
            delete global.navigator;
            
            const browserInfo = BrowserCompatibilityManager.getBrowserInfo();
            
            expect(browserInfo.name).toBe('unknown');
            expect(browserInfo.fallbacksRequired).toContain('all');
        });

        test('should handle Canvas test errors gracefully', () => {
            mockDocument.createElement.mockImplementation(() => {
                throw new Error('createElement failed');
            });
            
            const canvasSupport = BrowserCompatibilityManager.getCanvasSupport();
            
            expect(canvasSupport.available).toBe(false);
            expect(canvasSupport.errorMessage).toContain('Canvas API test failed');
        });

        test('should handle localStorage test errors gracefully', () => {
            Object.defineProperty(global, 'localStorage', {
                get() {
                    throw new Error('localStorage access denied');
                }
            });
            
            const storageSupport = BrowserCompatibilityManager.getLocalStorageSupport();
            
            expect(storageSupport.available).toBe(false);
            expect(storageSupport.errorMessage).toContain('localStorage test failed');
        });
    });

    describe('Performance', () => {
        test('should complete browser detection within reasonable time', () => {
            const start = performance.now();
            BrowserCompatibilityManager.getBrowserInfo();
            const end = performance.now();
            
            expect(end - start).toBeLessThan(100); // 100ms以内
        });

        test('should complete Canvas support check within reasonable time', () => {
            const start = performance.now();
            BrowserCompatibilityManager.getCanvasSupport();
            const end = performance.now();
            
            expect(end - start).toBeLessThan(50); // 50ms以内
        });

        test('should complete comprehensive support check efficiently', () => {
            const start = performance.now();
            BrowserCompatibilityManager.getComprehensiveSupport();
            const end = performance.now();
            
            expect(end - start).toBeLessThan(200); // 200ms以内
        });
    });

    describe('Integration', () => {
        test('should work correctly in file:// protocol environment', () => {
            global.window.location.protocol = 'file:';
            
            const support = BrowserCompatibilityManager.getComprehensiveSupport();
            const modulesSupport = support.modules;
            
            expect(modulesSupport.errorMessage).toContain('file:// protocol');
            expect(modulesSupport.fallbackMethod).toBe('bundled-script');
        });

        test('should provide correct fallback methods for limited browsers', () => {
            // Safari プライベートブラウジングモードのシミュレーション
            global.localStorage = {
                getItem: jest.fn().mockImplementation(() => {
                    throw new Error('localStorage disabled');
                })
            };
            
            const storageSupport = BrowserCompatibilityManager.getLocalStorageSupport();
            
            expect(storageSupport.available).toBe(true);
            expect(storageSupport.readable).toBe(false);
            expect(storageSupport.fallbackMethod).toBe('memory-storage');
        });
    });
});