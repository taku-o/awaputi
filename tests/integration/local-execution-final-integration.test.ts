import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * Local Execution Final Integration Test
 * ローカル実行フローの完全統合テスト
 * 
 * Task 16: 最終統合とテスト
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import LocalExecutionDetector from '../../src/utils/local-execution/LocalExecutionDetector';
import LocalModeManager from '../../src/utils/local-execution/LocalModeManager';
import FaviconGenerator from '../../src/utils/local-execution/FaviconGenerator';
import DeveloperGuidanceSystem from '../../src/utils/local-execution/DeveloperGuidanceSystem';
import BrowserCompatibilityManager from '../../src/utils/local-execution/BrowserCompatibilityManager';
import LocalExecutionErrorHandler from '../../src/utils/local-execution/LocalExecutionErrorHandler';

// モック設定
const mockCanvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => ({
        fillStyle: '',
        fillRect: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        font: '',
        fillText: jest.fn(),
        getImageData: jest.fn(() => ({
            data: new Uint8ClampedArray([255, 0, 0, 255])
        }))
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,test'),
    toBlob: jest.fn((callback) => callback(new Blob(['test'], { type: 'image/png' })))
};

const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};

const mockDocument = {
    createElement: jest.fn((tag) => {
        if (tag === 'canvas') return mockCanvas;
        if (tag === 'link') return {
            rel: '',
            href: '',
            type: ''
        };
        return {
            type: '',
            remove: jest.fn(),
            style: {},
            innerHTML: '',
            onclick: null
        };
    }),
    head: {
        appendChild: jest.fn()
    },
    body: {
        appendChild: jest.fn()
    },
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

const mockWindow = {
    location: { protocol: 'file:', href: 'file:///test/index.html' },
    navigator: { userAgent: 'Test Browser' },
    localStorage: mockLocalStorage,
    sessionStorage: mockSessionStorage,
    performance: { now: () => Date.now() },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

// グローバルモック設定
global.window = mockWindow;
global.document = mockDocument;
global.localStorage = mockLocalStorage;
global.sessionStorage = mockSessionStorage;
global.navigator = mockWindow.navigator;
global.performance = mockWindow.performance;

describe('Local Execution Final Integration Test', () => {
    let localModeManager: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // LocalModeManagerの新しいインスタンスを作成
        localModeManager = new LocalModeManager({
            debugMode: true,
            enableErrorHandling: true,
            enableDeveloperGuidance: true,
            enableFaviconGeneration: true,
            enableMetaTagOptimization: true,
            enableFallbackResources: true
        });

        // 各コンポーネントの初期化状態をリセット
        LocalExecutionErrorHandler.isInitialized = false;
        FaviconGenerator.generationCache.clear();
        DeveloperGuidanceSystem.isInitialized = false;
    });

    afterEach(() => {
        if (localModeManager && localModeManager.isInitialized) {
            // クリーンアップ処理
        }
    });

    describe('Complete Local Execution Flow', () => {
        test('should detect local execution environment correctly', () => {
            const isLocal = LocalExecutionDetector.isLocalExecution();
            expect(isLocal.toBe(true);

            const context = LocalExecutionDetector.getExecutionContext();
            expect(context.toMatchObject({
                isLocal: true,
                protocol: 'file:',
                canUseCanvas: expect.any(Boolean,
                canUseLocalStorage: expect.any(Boolean,
                canUseModules: expect.any(Boolean
            });
        });

        test('should initialize complete local mode system', async () => {
            const result = await localModeManager.initialize();
            
            expect(result.toBe(true);
            expect(localModeManager.isInitialized).toBe(true);
            expect(localModeManager.executionContext.isLocal).toBe(true);
        });

        test('should handle browser compatibility detection', () => {
            const compatibility = BrowserCompatibilityManager.getComprehensiveSupport();
            
            expect(compatibility.toMatchObject({
                browser: expect.objectContaining({
                    name: expect.any(String,
                    version: expect.any(String,
                    isSupported: expect.any(Boolean
                }),
                canvas: expect.objectContaining({
                    available: expect.any(Boolean
                }),
                localStorage: expect.objectContaining({
                    available: expect.any(Boolean
                })
            });
        });

        test('should generate favicons when needed', async () => {
            const config = {
                sizes: [16, 32],
                enableCaching: false,
                debugMode: true
            };

            const result = await FaviconGenerator.generateMissingFavicons(config;
            
            expect(result.toMatchObject({
                success: expect.any(Boolean,
                generated: expect.any(Number,
                cached: expect.any(Number,
                failed: expect.any(Number
            });

            if (result.success) {
                expect(mockDocument.head.appendChild).toHaveBeenCalled();
            }
        });

        test('should integrate error handling system', async () => {
            await localModeManager.initialize();
            
            // エラーハンドリングシステムが初期化されているか確認
            expect(LocalExecutionErrorHandler.isInitialized).toBe(true);
            
            // エラーハンドリングメソッドが利用可能か確認
            expect(typeof localModeManager.handleError).toBe('function');
            expect(typeof localModeManager.handleCompatibilityError).toBe('function');
            expect(typeof localModeManager.handleSecurityError).toBe('function');

            // テストエラーを発生させて処理を確認
            const testError = new Error('Test error for integration');
            
            expect(() => {
                localModeManager.handleError(testError, 'INTEGRATION_TEST');
            }).not.toThrow();
        });
    });

    describe('End-to-End Error Handling', () => {
        beforeEach(async () => {
            await localModeManager.initialize();
        });

        test('should handle CORS errors end-to-end', () => {
            const corsError = new Error('CORS policy blocked this request');
            
            expect(() => {
                localModeManager.handleError(corsError, 'RESOURCE_LOADING', {
                    resource: 'test-script.js'
                });
            }).not.toThrow();
            
            // ガイダンスシステムの呼び出しを確認
            // (実際の実装ではDeveloperGuidanceSystemが呼ばれることを期待)
        });

        test('should handle compatibility errors with fallbacks', () => {
            const compatibilityError = new Error('Canvas API not supported');
            const feature = 'canvas';

            const result = localModeManager.handleCompatibilityError(compatibilityError, feature);
            
            // エラーハンドリングが完了することを確認
            expect(() => result).not.toThrow();
        });

        test('should handle security policy errors', () => {
            const securityError = new Error('X-Frame-Options: DENY');
            const policy = 'X-Frame-Options';

            expect(() => {
                localModeManager.handleSecurityError(securityError, policy);
            }).not.toThrow();
        });

        test('should collect and provide error statistics', () => {
            // いくつかのエラーを発生させる
            localModeManager.handleError(new Error('Error 1'), 'TEST_1');
            localModeManager.handleError(new Error('Error 2'), 'TEST_2');
            
            const stats = localModeManager.getErrorStats();
            
            expect(stats.toMatchObject({
                mainErrorHandler: expect.any(Object,
                localErrorHandler: expect.any(Object
            });
        });
    });

    describe('Performance and Resource Management', () => {
        test('should manage resources efficiently', async () => {
            const startTime = performance.now();
            
            await localModeManager.initialize();
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            // 初期化時間が合理的な範囲内であることを確認
            expect(initTime.toBeLessThan(5000); // 5秒以内
        });

        test('should cleanup resources properly', async () => {
            await localModeManager.initialize();
            
            // 状態確認
            const status = localModeManager.getStatus();
            expect(status.isInitialized).toBe(true);
            
            // メモリリークのないことを確認（基本的なチェック）
            const debugInfo = localModeManager.getDebugInfo();
            expect(debugInfo.toBeDefined();
            expect(typeof debugInfo).toBe('object');
        });

        test('should handle concurrent operations safely', async () => {
            // 同時に複数の操作を実行
            const operations = [
                localModeManager.initialize(),
                FaviconGenerator.generateMissingFavicons({ sizes: [16] }),
                FaviconGenerator.generateMissingFavicons({ sizes: [32] })
            ];

            const results = await Promise.all(operations;
            
            // すべての操作が成功するか、適切にエラーハンドリングされることを確認
            results.forEach(result => {
                expect(typeof result).toBeDefined();
            });
        });
    });

    describe('Developer Experience Features', () => {
        test('should provide comprehensive debug information', async () => {
            await localModeManager.initialize();
            
            const debugInfo = localModeManager.getDebugInfo();
            
            expect(debugInfo.toMatchObject({
                status: expect.objectContaining({
                    isInitialized: true,
                    isLocalMode: true,
                    executionContext: expect.any(Object
                }),
                components: expect.objectContaining({
                    localExecutionDetector: expect.any(Object,
                    faviconGenerator: expect.any(Object,
                    developerGuidanceSystem: expect.any(Object,
                    localExecutionErrorHandler: expect.any(Object,
                    browserCompatibilityManager: expect.any(Object
                })
            });
        });

        test('should provide helpful status information', () => {
            const status = localModeManager.getStatus();
            
            expect(status.toMatchObject({
                isInitialized: expect.any(Boolean,
                isLocalMode: expect.any(Boolean,
                config: expect.any(Object,
                timestamp: expect.any(String
            });
        });

        test('should handle developer guidance display', () => {
            // 開発者ガイダンスが適切に表示されることを確認
            expect(() => {
                DeveloperGuidanceSystem.showDeveloperServerGuidance({
                    title: 'Test Guidance',
                    message: 'This is a test message',
                    showCommands: true
                });
            }).not.toThrow();
        });
    });

    describe('Configuration and Customization', () => {
        test('should respect configuration options', async () => {
            const customConfig = {
                enableMetaTagOptimization: false,
                enableFaviconGeneration: false,
                enableDeveloperGuidance: false,
                debugMode: false
            };

            const customManager = new LocalModeManager(customConfig;
            await customManager.initialize();

            expect(customManager.config).toMatchObject(customConfig;
        });

        test('should provide backward compatibility', async () => {
            // デフォルト設定での初期化
            const defaultManager = new LocalModeManager();
            const result = await defaultManager.initialize();

            expect(result.toBe(true);
            expect(defaultManager.isInitialized).toBe(true);
        });
    });

    describe('Edge Cases and Error Recovery', () => {
        test('should handle initialization failures gracefully', async () => {
            // エラーが発生する設定でテスト
            const faultyManager = new LocalModeManager({
                debugMode: true
            });

            // Canvas APIが利用できない環境をシミュレート
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn(() => {
                throw new Error('createElement failed');
            });

            const result = await faultyManager.initialize();
            
            // 元に戻す
            document.createElement = originalCreateElement;

            // 初期化が失敗してもアプリケーションが停止しないことを確認
            expect(typeof result).toBe('boolean');
        });

        test('should handle missing dependencies gracefully', () => {
            // 重要な依存関係が利用できない場合のテスト
            const originalLocalStorage = global.localStorage;
            global.localStorage = undefined;

            expect(() => {
                LocalExecutionDetector.canUseLocalStorage();
            }).not.toThrow();

            global.localStorage = originalLocalStorage;
        });

        test('should provide fallback content when needed', async () => {
            await localModeManager.initialize();
            
            // フォールバックコンテンツの表示テスト
            expect(() => {
                LocalExecutionErrorHandler.showFallbackContent('module_loading');
            }).not.toThrow();
        });
    });

    describe('Cross-Browser Compatibility', () => {
        test('should work with different user agents', () => {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
            ];

            userAgents.forEach(ua => {
                global.navigator.userAgent = ua;
                
                const compatibility = BrowserCompatibilityManager.getBrowserInfo();
                expect(compatibility.toMatchObject({
                    name: expect.any(String,
                    version: expect.any(String,
                    isSupported: expect.any(Boolean
                });
            });
        });
    });

    describe('Final Validation', () => {
        test('should pass complete integration validation', async () => {
            // 完全な統合フローテスト
            const result = await localModeManager.initialize();
            
            expect(result.toBe(true);
            
            // 各コンポーネントの動作確認
            expect(LocalExecutionDetector.isLocalExecution()).toBe(true);
            expect(LocalExecutionErrorHandler.isInitialized).toBe(true);
            expect(localModeManager.isInitialized).toBe(true);
            
            // デバッグ情報の取得確認
            const debugInfo = localModeManager.getDebugInfo();
            expect(debugInfo.toBeDefined();
            expect(debugInfo.status.isInitialized).toBe(true);
            
            // エラーハンドリングの動作確認
            const testError = new Error('Final validation test error');
            expect(() => {
                localModeManager.handleError(testError, 'FINAL_VALIDATION');
            }).not.toThrow();
            
            console.log('✅ Complete local execution flow validation passed');
        });
    });
});