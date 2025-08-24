import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * ErrorTrackingSystem のテスト
 */
import { ErrorTrackingSystem } from '../../src/analytics/ErrorTrackingSystem';

// DOM とブラウザ API のモック
(global as any).XMLHttpRequest = jest.fn(() => ({
    open: jest.fn(),
    send: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setRequestHeader: jest.fn(),
    status: 200,
    readyState: 4
}));

describe('ErrorTrackingSystem', () => {
    let errorTracker: any;
    let mockConfig: any;

    beforeEach(() => {
        mockConfig = {
            endpoint: 'https://api.example.com/errors',
            apiKey: 'test-api-key',
            enableConsoleCapture: true,
            enableUnhandledRejections: true,
            maxErrors: 100,
            rateLimitMs: 1000
        };

        errorTracker = new ErrorTrackingSystem(mockConfig);

        // console.error のモック
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        errorTracker.destroy();
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正しく初期化される', () => {
            expect(errorTracker).toBeDefined();
            expect(errorTracker.config).toEqual(mockConfig);
        });

        test('デフォルト設定で初期化される', () => {
            const defaultTracker = new ErrorTrackingSystem();
            expect(defaultTracker).toBeDefined();
            expect(defaultTracker.config.maxErrors).toBe(100);
        });

        test('イベントリスナーが設定される', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            
            new ErrorTrackingSystem(mockConfig);
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
            
            addEventListenerSpy.mockRestore();
        });
    });

    describe('エラーキャプチャ', () => {
        test('JavaScriptエラーがキャプチャされる', () => {
            const mockError = new Error('Test JavaScript error');
            mockError.stack = 'Error: Test JavaScript error\n    at test.js:10:5';

            const errorEvent = {
                error: mockError,
                message: 'Test JavaScript error',
                filename: 'test.js',
                lineno: 10,
                colno: 5
            };

            errorTracker.captureError(errorEvent);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].type).toBe('javascript');
            expect(errorTracker.errors[0].message).toBe('Test JavaScript error');
        });

        test('Promise拒否がキャプチャされる', () => {
            const rejectionReason = new Error('Unhandled promise rejection');
            
            const rejectionEvent = {
                reason: rejectionReason,
                promise: Promise.reject(rejectionReason)
            };

            errorTracker.captureUnhandledRejection(rejectionEvent);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].type).toBe('unhandledrejection');
            expect(errorTracker.errors[0].message).toContain('Unhandled promise rejection');
        });

        test('ネットワークエラーがキャプチャされる', () => {
            const networkError = {
                type: 'network',
                url: 'https://api.example.com/data',
                status: 404,
                statusText: 'Not Found',
                responseText: 'Resource not found'
            };

            errorTracker.captureNetworkError(networkError);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].type).toBe('network');
            expect(errorTracker.errors[0].url).toBe('https://api.example.com/data');
            expect(errorTracker.errors[0].status).toBe(404);
        });

        test('カスタムエラーがキャプチャされる', () => {
            const customError = {
                type: 'custom',
                category: 'game_logic',
                message: 'Invalid bubble state',
                context: {
                    bubbleId: 'bubble_123',
                    gameState: 'active',
                    level: 5
                }
            };

            errorTracker.captureCustomError(customError);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].type).toBe('custom');
            expect(errorTracker.errors[0].category).toBe('game_logic');
            expect(errorTracker.errors[0].context.bubbleId).toBe('bubble_123');
        });
    });

    describe('エラー分類', () => {
        test('エラーレベルが正しく設定される', () => {
            const criticalError = new Error('Critical system failure');
            const warningError = new Error('Performance warning');

            errorTracker.captureError({
                error: criticalError,
                message: 'Critical system failure',
                level: 'critical'
            });

            errorTracker.captureError({
                error: warningError,
                message: 'Performance warning',
                level: 'warning'
            });

            expect(errorTracker.errors[0].level).toBe('critical');
            expect(errorTracker.errors[1].level).toBe('warning');
        });

        test('エラーカテゴリが自動分類される', () => {
            const typeError = new TypeError('Cannot read property of null');
            const referenceError = new ReferenceError('Variable is not defined');
            const rangeError = new RangeError('Array index out of bounds');

            errorTracker.captureError({
                error: typeError,
                message: typeError.message
            });

            errorTracker.captureError({
                error: referenceError,
                message: referenceError.message
            });

            errorTracker.captureError({
                error: rangeError,
                message: rangeError.message
            });

            expect(errorTracker.errors[0].category).toBe('TypeError');
            expect(errorTracker.errors[1].category).toBe('ReferenceError');
            expect(errorTracker.errors[2].category).toBe('RangeError');
        });

        test('重複エラーが統合される', () => {
            const duplicateError = new Error('Duplicate error message');

            // 同じエラーを3回キャプチャ
            for (let i = 0; i < 3; i++) {
                errorTracker.captureError({
                    error: duplicateError,
                    message: 'Duplicate error message',
                    filename: 'test.js',
                    lineno: 10
                });
            }

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].count).toBe(3);
            expect(errorTracker.errors[0].firstSeen).toBeDefined();
            expect(errorTracker.errors[0].lastSeen).toBeDefined();
        });
    });

    describe('フィルタリング', () => {
        test('無視パターンが適用される', () => {
            errorTracker.addIgnorePattern(/Script error/);
            errorTracker.addIgnorePattern(/ResizeObserver loop limit exceeded/);

            errorTracker.captureError({
                error: new Error('Script error.'),
                message: 'Script error.'
            });

            errorTracker.captureError({
                error: new Error('ResizeObserver loop limit exceeded'),
                message: 'ResizeObserver loop limit exceeded'
            });

            errorTracker.captureError({
                error: new Error('Real error'),
                message: 'Real error'
            });

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].message).toBe('Real error');
        });

        test('ドメインフィルターが適用される', () => {
            errorTracker.setDomainFilter(['localhost', 'example.com']);

            errorTracker.captureError({
                error: new Error('Allowed error'),
                message: 'Allowed error',
                filename: 'http://localhost:8000/app.js'
            });

            errorTracker.captureError({
                error: new Error('Blocked error'),
                message: 'Blocked error',
                filename: 'http://malicious.com/script.js'
            });

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].message).toBe('Allowed error');
        });

        test('レベルフィルターが適用される', () => {
            errorTracker.setMinLevel('error');

            errorTracker.captureError({
                error: new Error('Warning level'),
                message: 'Warning level',
                level: 'warning'
            });

            errorTracker.captureError({
                error: new Error('Error level'),
                message: 'Error level',
                level: 'error'
            });

            errorTracker.captureError({
                error: new Error('Critical level'),
                message: 'Critical level',
                level: 'critical'
            });

            expect(errorTracker.errors).toHaveLength(2);
            expect(errorTracker.errors[0].level).toBe('error');
            expect(errorTracker.errors[1].level).toBe('critical');
        });
    });

    describe('コンテキスト情報', () => {
        test('ブラウザ情報が記録される', () => {
            // User-Agent のモック
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                configurable: true
            });

            errorTracker.captureError({
                error: new Error('Test error'),
                message: 'Test error'
            });

            const error = errorTracker.errors[0];
            expect(error.context.userAgent).toBeDefined();
            expect(error.context.url).toBeDefined();
            expect(error.context.timestamp).toBeDefined();
        });

        test('ゲーム状態が記録される', () => {
            const gameState = {
                level: 5,
                score: 1500,
                lives: 3,
                mode: 'classic'
            };

            errorTracker.setGameContext(gameState);

            errorTracker.captureError({
                error: new Error('Game error'),
                message: 'Game error'
            });

            const error = errorTracker.errors[0];
            expect(error.context.gameState).toEqual(gameState);
        });

        test('カスタムコンテキストが記録される', () => {
            const customContext = {
                userId: 'user_123',
                sessionId: 'session_456',
                feature: 'bubble_physics'
            };

            errorTracker.addCustomContext(customContext);

            errorTracker.captureError({
                error: new Error('Context error'),
                message: 'Context error'
            });

            const error = errorTracker.errors[0];
            expect(error.context.custom).toEqual(customContext);
        });
    });

    describe('レポート送信', () => {
        test('エラーレポートが送信される', async () => {
            const mockXHR = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'load') {
                        setTimeout(() => callback({ target: { status: 200, responseText: 'OK' } }), 0);
                    }
                }),
                status: 200,
                responseText: 'OK'
            };

            (global.XMLHttpRequest as jest.Mock).mockImplementation(() => mockXHR);

            errorTracker.captureError({
                error: new Error('Report test'),
                message: 'Report test'
            });

            await errorTracker.sendReport();

            expect(mockXHR.open).toHaveBeenCalledWith('POST', mockConfig.endpoint);
            expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('X-API-Key', mockConfig.apiKey);
            expect(mockXHR.send).toHaveBeenCalled();
        });

        test('バッチ送信が機能する', async () => {
            const mockXHR = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'load') {
                        setTimeout(() => callback({ target: { status: 200 } }), 0);
                    }
                })
            };

            (global.XMLHttpRequest as jest.Mock).mockImplementation(() => mockXHR);

            // 複数のエラーをキャプチャ
            for (let i = 0; i < 5; i++) {
                errorTracker.captureError({
                    error: new Error(`Batch error ${i}`),
                    message: `Batch error ${i}`
                });
            }

            await errorTracker.sendBatchReport();

            expect(mockXHR.send).toHaveBeenCalled();
            const sentData = JSON.parse(mockXHR.send.mock.calls[0][0]);
            expect(sentData.errors).toHaveLength(5);
        });

        test('送信失敗時のリトライ機能', async () => {
            let attemptCount = 0;
            const mockXHR = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'error' || event === 'load') {
                        attemptCount++;
                        const status = attemptCount < 3 ? 500 : 200;
                        setTimeout(() => callback({ target: { status } }), 0);
                    }
                })
            };

            (global.XMLHttpRequest as jest.Mock).mockImplementation(() => mockXHR);
            errorTracker.setRetryConfig({ maxRetries: 3, retryDelay: 10 });

            errorTracker.captureError({
                error: new Error('Retry test'),
                message: 'Retry test'
            });

            await errorTracker.sendReport();

            expect(attemptCount).toBe(3);
        });
    });

    describe('統計情報', () => {
        test('エラー統計が計算される', () => {
            // 異なるタイプのエラーを追加
            errorTracker.captureError({
                error: new TypeError('Type error'),
                message: 'Type error'
            });

            errorTracker.captureError({
                error: new ReferenceError('Reference error'),
                message: 'Reference error'
            });

            errorTracker.captureError({
                error: new TypeError('Another type error'),
                message: 'Another type error'
            });

            const stats = errorTracker.getStatistics();

            expect(stats.totalErrors).toBe(3);
            expect(stats.errorsByType.TypeError).toBe(2);
            expect(stats.errorsByType.ReferenceError).toBe(1);
            expect(stats.errorsByLevel.error).toBe(3);
        });

        test('時間別統計が計算される', () => {
            const now = Date.now();
            
            // 過去1時間のエラー
            errorTracker.captureError({
                error: new Error('Recent error'),
                message: 'Recent error',
                timestamp: now - 30 * 60 * 1000 // 30分前
            });

            // 過去24時間のエラー
            errorTracker.captureError({
                error: new Error('Old error'),
                message: 'Old error',
                timestamp: now - 2 * 60 * 60 * 1000 // 2時間前
            });

            const stats = errorTracker.getTimeBasedStatistics();

            expect(stats.lastHour).toBe(1);
            expect(stats.last24Hours).toBe(2);
        });
    });

    describe('アラート機能', () => {
        test('エラー率しきい値でアラートが発生する', () => {
            const alertCallback = jest.fn();
            errorTracker.setErrorRateAlert(2, 60000, alertCallback); // 1分間に2件以上

            // 短時間で複数のエラーを発生
            errorTracker.captureError({
                error: new Error('Alert test 1'),
                message: 'Alert test 1'
            });

            errorTracker.captureError({
                error: new Error('Alert test 2'),
                message: 'Alert test 2'
            });

            expect(alertCallback).toHaveBeenCalledWith({
                type: 'error_rate',
                threshold: 2,
                currentRate: 2,
                timeWindow: 60000
            });
        });

        test('クリティカルエラーでアラートが発生する', () => {
            const alertCallback = jest.fn();
            errorTracker.setCriticalErrorAlert(alertCallback);

            errorTracker.captureError({
                error: new Error('Critical failure'),
                message: 'Critical failure',
                level: 'critical'
            });

            expect(alertCallback).toHaveBeenCalledWith({
                type: 'critical_error',
                error: expect.objectContaining({
                    message: 'Critical failure',
                    level: 'critical'
                })
            });
        });
    });

    describe('設定管理', () => {
        test('設定が更新される', () => {
            const newConfig = {
                endpoint: 'https://new-api.example.com/errors',
                maxErrors: 200,
                rateLimitMs: 2000
            };

            errorTracker.updateConfig(newConfig);

            expect(errorTracker.config.endpoint).toBe(newConfig.endpoint);
            expect(errorTracker.config.maxErrors).toBe(newConfig.maxErrors);
            expect(errorTracker.config.rateLimitMs).toBe(newConfig.rateLimitMs);
        });

        test('エラー制限が適用される', () => {
            errorTracker.updateConfig({ maxErrors: 2 });

            // 制限を超える数のエラーを追加
            for (let i = 0; i < 5; i++) {
                errorTracker.captureError({
                    error: new Error(`Limited error ${i}`),
                    message: `Limited error ${i}`
                });
            }

            expect(errorTracker.errors.length).toBeLessThanOrEqual(2);
        });
    });

    describe('リソース管理', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            errorTracker.destroy();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
            expect(errorTracker.errors).toHaveLength(0);

            removeEventListenerSpy.mockRestore();
        });

        test('メモリリークを防ぐためのクリーンアップ', () => {
            // 大量のエラーを追加
            for (let i = 0; i < 1000; i++) {
                errorTracker.captureError({
                    error: new Error(`Memory test ${i}`),
                    message: `Memory test ${i}`
                });
            }

            // 古いエラーをクリーンアップ
            errorTracker.cleanup();

            // 最大エラー数に制限されている
            expect(errorTracker.errors.length).toBeLessThanOrEqual(mockConfig.maxErrors);
        });
    });

    describe('エラーハンドリング', () => {
        test('送信エラーが適切に処理される', async () => {
            const mockXHR = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'error') {
                        setTimeout(() => callback(new Error('Network error')), 0);
                    }
                })
            };

            (global.XMLHttpRequest as jest.Mock).mockImplementation(() => mockXHR);

            errorTracker.captureError({
                error: new Error('Send test'),
                message: 'Send test'
            });

            await expect(errorTracker.sendReport()).resolves.not.toThrow();
        });

        test('無効なエラーデータが処理される', () => {
            const invalidErrors = [
                null,
                undefined,
                {},
                { message: null },
                { error: null }
            ];

            invalidErrors.forEach(invalidError => {
                expect(() => {
                    errorTracker.captureError(invalidError);
                }).not.toThrow();
            });

            expect(errorTracker.errors).toHaveLength(0);
        });
    });
});