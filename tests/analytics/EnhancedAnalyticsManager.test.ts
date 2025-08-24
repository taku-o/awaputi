import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Enhanced Analytics Manager Tests
 * EnhancedAnalyticsManagerクラスの単体テスト
 */
import { EnhancedAnalyticsManager } from '../../src/analytics/EnhancedAnalyticsManager';
import Analytics from '../../src/utils/Analytics';

// Analyticsのモック作成
jest.mock('../../src/utils/Analytics.js');
jest.mock('../../src/analytics/PrivacyManager.js');

describe('EnhancedAnalyticsManager', () => {
    let manager: any;
    let mockAnalytics: any;
    let mockPrivacyManager: any;

    beforeEach(() => {
        mockAnalytics = {
            trackEvent: jest.fn(),
            initialize: jest.fn(),
            getSession: jest.fn().mockReturnValue({ id: 'session_123' }),
            destroy: jest.fn()
        };

        mockPrivacyManager = {
            checkConsent: jest.fn().mockReturnValue(true),
            anonymizeData: jest.fn((data: any) => ({ ...data, anonymized: true })),
            isOptedOut: jest.fn().mockReturnValue(false)
        };

        (Analytics as any).mockImplementation(() => mockAnalytics);

        manager = new EnhancedAnalyticsManager(mockPrivacyManager);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正しく初期化される', () => {
            expect(manager).toBeDefined();
            expect(manager.privacyManager).toBe(mockPrivacyManager);
        });

        test('デフォルト設定で初期化される', () => {
            const defaultManager = new EnhancedAnalyticsManager();
            expect(defaultManager).toBeDefined();
        });
    });

    describe('イベント追跡', () => {
        test('基本イベントが追跡される', async () => {
            const eventData = {
                type: 'bubble_pop',
                bubbleId: 'bubble_123',
                score: 100,
                timestamp: Date.now()
            };

            await manager.trackEvent('interaction', eventData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'interaction',
                expect.objectContaining(eventData)
            );
        });

        test('セッションイベントが追跡される', async () => {
            const sessionData = {
                sessionId: 'session_456',
                startTime: Date.now(),
                userId: 'user_789'
            };

            await manager.trackSessionStart(sessionData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'session_start',
                expect.objectContaining(sessionData)
            );
        });

        test('パフォーマンスイベントが追跡される', async () => {
            const performanceData = {
                fps: 58.5,
                memoryUsage: 65000000,
                renderTime: 16.7,
                timestamp: Date.now()
            };

            await manager.trackPerformance(performanceData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'performance',
                expect.objectContaining(performanceData)
            );
        });
    });

    describe('プライバシー管理', () => {
        test('同意確認が実行される', async () => {
            const eventData = { type: 'test_event' };

            await manager.trackEvent('test', eventData);

            expect(mockPrivacyManager.checkConsent).toHaveBeenCalled();
        });

        test('オプトアウト時にイベントが追跡されない', async () => {
            mockPrivacyManager.isOptedOut.mockReturnValue(true);

            const eventData = { type: 'test_event' };
            await manager.trackEvent('test', eventData);

            expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
        });

        test('データが匿名化される', async () => {
            const eventData = {
                userId: 'user_123',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0'
            };

            await manager.trackEvent('privacy_test', eventData);

            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalledWith(
                expect.objectContaining(eventData)
            );
        });
    });

    describe('バッチ処理', () => {
        test('複数イベントがバッチで処理される', async () => {
            const events = [
                { type: 'event1', data: { value: 1 } },
                { type: 'event2', data: { value: 2 } },
                { type: 'event3', data: { value: 3 } }
            ];

            await manager.trackEventBatch(events);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledTimes(3);
        });

        test('大量イベントが効率的に処理される', async () => {
            const events = Array.from({ length: 1000 }, (_, i) => ({
                type: 'bulk_event',
                data: { index: i, timestamp: Date.now() + i }
            }));

            const startTime = Date.now();
            await manager.trackEventBatch(events);
            const endTime = Date.now();

            expect(mockAnalytics.trackEvent).toHaveBeenCalledTimes(1000);
            expect(endTime - startTime).toBeLessThan(2000); // 2秒以内
        });
    });

    describe('カスタム次元', () => {
        test('カスタム次元が追加される', () => {
            const customDimensions = {
                gameMode: 'classic',
                difficulty: 'normal',
                userLevel: 15
            };

            manager.setCustomDimensions(customDimensions);

            expect(manager.customDimensions).toEqual(customDimensions);
        });

        test('カスタム次元がイベントに含まれる', async () => {
            manager.setCustomDimensions({ testDimension: 'testValue' });

            const eventData = { type: 'test_event' };
            await manager.trackEvent('test', eventData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'test',
                expect.objectContaining({
                    customDimensions: { testDimension: 'testValue' }
                })
            );
        });
    });

    describe('A/Bテスト統合', () => {
        test('A/Bテスト情報が追跡される', async () => {
            const abTestInfo = {
                experimentId: 'button_color_test',
                variant: 'red_button',
                userId: 'user_123'
            };

            await manager.trackABTest(abTestInfo);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'ab_test',
                expect.objectContaining(abTestInfo)
            );
        });

        test('コンバージョンイベントが追跡される', async () => {
            const conversionData = {
                experimentId: 'checkout_flow_test',
                variant: 'simplified_flow',
                conversionType: 'purchase',
                value: 29.99
            };

            await manager.trackConversion(conversionData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'conversion',
                expect.objectContaining(conversionData)
            );
        });
    });

    describe('リアルタイム分析', () => {
        test('リアルタイムイベントが送信される', async () => {
            manager.enableRealTimeAnalytics(true);

            const eventData = { type: 'realtime_event', urgent: true };
            await manager.trackEvent('realtime', eventData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'realtime',
                expect.objectContaining({
                    realTime: true,
                    ...eventData
                })
            );
        });

        test('しきい値を超えたイベントがリアルタイム送信される', async () => {
            manager.setRealTimeThreshold(100);

            const highValueEvent = { type: 'high_score', score: 150 };
            const lowValueEvent = { type: 'regular_score', score: 50 };

            await manager.trackEvent('score', highValueEvent);
            await manager.trackEvent('score', lowValueEvent);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'score',
                expect.objectContaining({
                    realTime: true,
                    ...highValueEvent
                })
            );
        });
    });

    describe('セッション管理', () => {
        test('セッション情報が自動追加される', async () => {
            const eventData = { type: 'test_event' };
            await manager.trackEvent('test', eventData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'test',
                expect.objectContaining({
                    sessionInfo: expect.objectContaining({
                        sessionId: 'session_123'
                    })
                })
            );
        });

        test('セッション終了が追跡される', async () => {
            const sessionEndData = {
                sessionId: 'session_123',
                duration: 300000,
                totalScore: 1500,
                eventsCount: 45
            };

            await manager.trackSessionEnd(sessionEndData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'session_end',
                expect.objectContaining(sessionEndData)
            );
        });
    });

    describe('エラー追跡', () => {
        test('エラーイベントが追跡される', async () => {
            const errorData = {
                errorType: 'JavaScript',
                message: 'Cannot read property of null',
                stack: 'Error at line 42',
                url: 'http://localhost:8000/game.js'
            };

            await manager.trackError(errorData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'error',
                expect.objectContaining(errorData)
            );
        });

        test('未処理エラーが自動追跡される', () => {
            const errorHandler = jest.fn();
            manager.enableAutoErrorTracking(errorHandler);

            const mockError = new Error('Test error');
            window.dispatchEvent(new ErrorEvent('error', {
                error: mockError,
                message: 'Test error',
                filename: 'test.js',
                lineno: 42
            }));

            expect(errorHandler).toHaveBeenCalled();
        });
    });

    describe('カスタムメトリクス', () => {
        test('カスタムメトリクスが記録される', async () => {
            const metrics = {
                bubblesPerMinute: 15.5,
                accuracyRate: 0.85,
                averageReactionTime: 250
            };

            await manager.trackCustomMetrics('gameplay', metrics);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'custom_metrics',
                expect.objectContaining({
                    category: 'gameplay',
                    metrics
                })
            );
        });

        test('時系列メトリクスが記録される', async () => {
            const timeSeriesData = [
                { timestamp: Date.now() - 60000, value: 10 },
                { timestamp: Date.now() - 30000, value: 15 },
                { timestamp: Date.now(), value: 20 }
            ];

            await manager.trackTimeSeriesMetric('score_progression', timeSeriesData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
                'time_series_metric',
                expect.objectContaining({
                    metricName: 'score_progression',
                    data: timeSeriesData
                })
            );
        });
    });

    describe('データ品質', () => {
        test('無効なデータが拒否される', async () => {
            const invalidData = [
                null,
                undefined,
                { type: null },
                { data: undefined },
                ''
            ];

            for (const data of invalidData) {
                await manager.trackEvent('test', data);
            }

            expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
        });

        test('データバリデーションが実行される', async () => {
            const validator = jest.fn().mockReturnValue(true);
            manager.setDataValidator(validator);

            const eventData = { type: 'validated_event', value: 100 };
            await manager.trackEvent('test', eventData);

            expect(validator).toHaveBeenCalledWith(
                expect.objectContaining(eventData)
            );
        });

        test('スキーマ検証が実行される', async () => {
            const schema = {
                type: 'string',
                value: 'number',
                timestamp: 'number'
            };

            manager.setEventSchema('test_event', schema);

            const validEvent = {
                type: 'test_event',
                value: 100,
                timestamp: Date.now()
            };

            const invalidEvent = {
                type: 'test_event',
                value: 'invalid', // Should be number
                timestamp: Date.now()
            };

            await manager.trackEvent('test_event', validEvent);
            await manager.trackEvent('test_event', invalidEvent);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledTimes(1);
        });
    });

    describe('設定管理', () => {
        test('設定が更新される', () => {
            const newConfig = {
                enableRealTime: true,
                batchSize: 50,
                flushInterval: 5000,
                enableDebug: true
            };

            manager.updateConfiguration(newConfig);

            expect(manager.configuration).toMatchObject(newConfig);
        });

        test('機能フラグが適用される', async () => {
            manager.setFeatureFlag('advanced_tracking', false);

            const eventData = { type: 'advanced_event' };
            await manager.trackAdvancedEvent(eventData);

            // 機能が無効なので追跡されない
            expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();

            manager.setFeatureFlag('advanced_tracking', true);
            await manager.trackAdvancedEvent(eventData);

            // 機能が有効なので追跡される
            expect(mockAnalytics.trackEvent).toHaveBeenCalled();
        });
    });

    describe('パフォーマンス最適化', () => {
        test('イベントキューイングが機能する', async () => {
            manager.enableEventQueuing(true);

            const events = Array.from({ length: 100 }, (_, i) => ({
                type: 'queued_event',
                data: { index: i }
            }));

            // イベントを一気に送信
            const promises = events.map(event => 
                manager.trackEvent('queued', event)
            );

            await Promise.all(promises);

            expect(manager.getQueueSize()).toBe(0); // キューが処理済み
        });

        test('バッチ送信が最適化される', async () => {
            manager.setBatchSize(10);
            manager.setFlushInterval(100); // 100ms

            const events = Array.from({ length: 25 }, (_, i) => ({
                type: 'batch_event',
                data: { index: i }
            }));

            for (const event of events) {
                await manager.trackEvent('batch', event);
            }

            // 少し待ってバッチ処理を完了させる
            await new Promise(resolve => setTimeout(resolve, 200));

            // 25個のイベントが10個ずつ3バッチで送信される
            expect(mockAnalytics.trackEvent).toHaveBeenCalledTimes(25);
        });
    });

    describe('デバッグ機能', () => {
        test('デバッグモードが有効化される', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            manager.enableDebugMode(true);
            manager.trackEvent('debug_test', { value: 123 });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Analytics Debug')
            );

            consoleSpy.mockRestore();
        });

        test('統計情報が取得される', () => {
            manager.incrementEventCount('test_event', 5);
            manager.incrementEventCount('another_event', 3);

            const stats = manager.getStatistics();

            expect(stats.totalEvents).toBe(8);
            expect(stats.eventCounts.test_event).toBe(5);
            expect(stats.eventCounts.another_event).toBe(3);
        });
    });

    describe('エラーハンドリング', () => {
        test('Analytics初期化エラーが処理される', () => {
            mockAnalytics.initialize.mockRejectedValue(new Error('Init failed'));

            expect(() => {
                new EnhancedAnalyticsManager(mockPrivacyManager);
            }).not.toThrow();
        });

        test('イベント送信エラーが処理される', async () => {
            mockAnalytics.trackEvent.mockRejectedValue(new Error('Send failed'));

            const eventData = { type: 'error_test' };
            
            await expect(
                manager.trackEvent('test', eventData)
            ).resolves.not.toThrow();
        });

        test('プライバシー処理エラーが処理される', async () => {
            mockPrivacyManager.anonymizeData.mockRejectedValue(new Error('Privacy failed'));

            const eventData = { type: 'privacy_error_test' };

            await expect(
                manager.trackEvent('test', eventData)
            ).resolves.not.toThrow();
        });
    });

    describe('リソース管理', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            manager.destroy();

            expect(mockAnalytics.destroy).toHaveBeenCalled();
            expect(manager.isDestroyed).toBe(true);
        });

        test('破棄後のイベント追跡が無視される', async () => {
            manager.destroy();

            const eventData = { type: 'post_destroy_event' };
            await manager.trackEvent('test', eventData);

            expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
        });
    });
});