import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { DeveloperAlertSystem } from '../../src/analytics/DeveloperAlertSystem';

// fetch APIのモック
(global as any).fetch = jest.fn() as jest.Mock;

describe('DeveloperAlertSystem', () => {
    let dataCollector: any;
    let trendAnalyzer: any;
    let alertSystem: any;
    let consoleGroupSpy: any, consoleLogSpy: any, consoleGroupEndSpy: any, consoleWarnSpy: any;

    beforeEach(() => {
        // モックデータコレクターとトレンドアナライザー
        dataCollector = {
            getData: jest.fn()
        };
        
        trendAnalyzer = {
            analyzeTrend: jest.fn()
        };

        // コンソールメソッドをモック
        consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        alertSystem = new DeveloperAlertSystem(dataCollector, trendAnalyzer);
    });

    afterEach(() => {
        jest.clearAllMocks();
        consoleGroupSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleGroupEndSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    describe('基本機能', () => {
        test('正しく初期化される', () => {
            expect(alertSystem).toBeDefined();
            expect(alertSystem.dataCollector).toBe(dataCollector);
            expect(alertSystem.trendAnalyzer).toBe(trendAnalyzer);
        });

        test('アラート設定が更新される', () => {
            const config = {
                enabled: true,
                thresholds: {
                    errorRate: 0.05,
                    performanceDrop: 0.2
                }
            };

            alertSystem.updateConfig(config);
            
            expect(alertSystem.config).toEqual(config);
        });
    });

    describe('パフォーマンスアラート', () => {
        test('FPS低下アラートが発生する', async () => {
            const performanceData = [
                { fps: 58, timestamp: Date.now() - 5000 },
                { fps: 55, timestamp: Date.now() - 4000 },
                { fps: 30, timestamp: Date.now() - 3000 }, // 大幅低下
                { fps: 25, timestamp: Date.now() - 2000 },
                { fps: 20, timestamp: Date.now() - 1000 }
            ];

            dataCollector.getData.mockResolvedValue(performanceData);
            trendAnalyzer.analyzeTrend.mockReturnValue({
                trend: 'declining',
                severity: 'high',
                changePercent: -65
            });

            await alertSystem.checkPerformanceAlerts();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('FPS Performance Alert')
            );
        });

        test('メモリ使用量アラートが発生する', async () => {
            const memoryData = [
                { memoryUsage: 50000000, timestamp: Date.now() - 5000 },
                { memoryUsage: 75000000, timestamp: Date.now() - 4000 },
                { memoryUsage: 95000000, timestamp: Date.now() - 3000 },
                { memoryUsage: 98000000, timestamp: Date.now() - 2000 },
                { memoryUsage: 99000000, timestamp: Date.now() - 1000 }
            ];

            dataCollector.getData.mockResolvedValue(memoryData);
            trendAnalyzer.analyzeTrend.mockReturnValue({
                trend: 'increasing',
                severity: 'critical',
                changePercent: 98
            });

            await alertSystem.checkMemoryAlerts();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Memory Usage Alert')
            );
        });
    });

    describe('エラーアラート', () => {
        test('エラー率アラートが発生する', async () => {
            const errorData = [
                { type: 'JavaScript', severity: 'high', timestamp: Date.now() - 1000 },
                { type: 'Network', severity: 'medium', timestamp: Date.now() - 2000 },
                { type: 'JavaScript', severity: 'high', timestamp: Date.now() - 3000 }
            ];

            const totalSessions = 10;

            dataCollector.getData
                .mockResolvedValueOnce(errorData)
                .mockResolvedValueOnce(Array(totalSessions).fill({ sessionId: 'test' }));

            await alertSystem.checkErrorRateAlerts();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Error Rate Alert')
            );
        });

        test('JavaScriptエラー増加アラートが発生する', async () => {
            const jsErrors = [
                { message: 'TypeError: Cannot read property', timestamp: Date.now() - 1000 },
                { message: 'ReferenceError: variable is not defined', timestamp: Date.now() - 2000 },
                { message: 'TypeError: Cannot read property', timestamp: Date.now() - 3000 },
                { message: 'SyntaxError: Unexpected token', timestamp: Date.now() - 4000 }
            ];

            dataCollector.getData.mockResolvedValue(jsErrors);
            trendAnalyzer.analyzeTrend.mockReturnValue({
                trend: 'increasing',
                severity: 'high',
                changePercent: 300
            });

            await alertSystem.checkJavaScriptErrorAlerts();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('JavaScript Error Alert')
            );
        });
    });

    describe('ユーザー体験アラート', () => {
        test('セッション完了率低下アラートが発生する', async () => {
            const sessionData = [
                { completed: false, duration: 30000 },
                { completed: false, duration: 45000 },
                { completed: true, duration: 300000 },
                { completed: false, duration: 60000 },
                { completed: false, duration: 25000 }
            ];

            dataCollector.getData.mockResolvedValue(sessionData);

            await alertSystem.checkSessionCompletionAlerts();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Session Completion Alert')
            );
        });

        test('平均セッション時間短縮アラートが発生する', async () => {
            const sessionData = [
                { duration: 60000, timestamp: Date.now() - 1000 },   // 1分
                { duration: 45000, timestamp: Date.now() - 2000 },   // 45秒
                { duration: 30000, timestamp: Date.now() - 3000 },   // 30秒
                { duration: 25000, timestamp: Date.now() - 4000 },   // 25秒
                { duration: 20000, timestamp: Date.now() - 5000 }    // 20秒
            ];

            dataCollector.getData.mockResolvedValue(sessionData);
            trendAnalyzer.analyzeTrend.mockReturnValue({
                trend: 'declining',
                severity: 'medium',
                changePercent: -67
            });

            await alertSystem.checkSessionDurationAlerts();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Session Duration Alert')
            );
        });
    });

    describe('リアルタイム監視', () => {
        test('リアルタイム監視が開始される', () => {
            const config = {
                enabled: true,
                interval: 5000,
                checks: ['performance', 'errors', 'userExperience']
            };

            alertSystem.startRealTimeMonitoring(config);

            expect(alertSystem.isMonitoring).toBe(true);
            expect(alertSystem.monitoringInterval).toBeDefined();
        });

        test('リアルタイム監視が停止される', () => {
            alertSystem.startRealTimeMonitoring({ enabled: true, interval: 5000 });
            alertSystem.stopRealTimeMonitoring();

            expect(alertSystem.isMonitoring).toBe(false);
        });
    });

    describe('通知システム', () => {
        test('Webhookアラートが送信される', async () => {
            const webhookConfig = {
                enabled: true,
                url: 'https://example.com/webhook',
                events: ['performance', 'errors']
            };

            alertSystem.setWebhookConfig(webhookConfig);

            const mockResponse = { ok: true };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const alert = {
                type: 'performance',
                severity: 'high',
                message: 'FPS dropped below threshold',
                timestamp: Date.now()
            };

            await alertSystem.sendWebhookAlert(alert);

            expect(global.fetch).toHaveBeenCalledWith(
                webhookConfig.url,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('FPS dropped below threshold')
                })
            );
        });

        test('ブラウザ通知が表示される', async () => {
            // Notification APIのモック
            const mockNotification = jest.fn();
            (global as any).Notification = mockNotification;
            mockNotification.permission = 'granted';

            const alert = {
                type: 'error',
                severity: 'critical',
                message: 'Critical JavaScript error detected',
                timestamp: Date.now()
            };

            await alertSystem.showBrowserNotification(alert);

            expect(mockNotification).toHaveBeenCalledWith(
                'Critical Alert: error',
                expect.objectContaining({
                    body: 'Critical JavaScript error detected',
                    icon: expect.any(String)
                })
            );
        });
    });

    describe('統計とレポート', () => {
        test('アラート統計が取得される', () => {
            // いくつかのアラートをシミュレート
            alertSystem.alertHistory = [
                { type: 'performance', severity: 'high', timestamp: Date.now() - 60000 },
                { type: 'error', severity: 'medium', timestamp: Date.now() - 120000 },
                { type: 'performance', severity: 'low', timestamp: Date.now() - 180000 }
            ];

            const stats = alertSystem.getAlertStatistics();

            expect(stats.totalAlerts).toBe(3);
            expect(stats.alertsByType.performance).toBe(2);
            expect(stats.alertsByType.error).toBe(1);
            expect(stats.alertsBySeverity.high).toBe(1);
            expect(stats.alertsBySeverity.medium).toBe(1);
            expect(stats.alertsBySeverity.low).toBe(1);
        });

        test('アラートサマリーレポートが生成される', () => {
            alertSystem.alertHistory = [
                { type: 'performance', severity: 'high', timestamp: Date.now() - 86400000, resolved: true },
                { type: 'error', severity: 'critical', timestamp: Date.now() - 43200000, resolved: false },
                { type: 'userExperience', severity: 'medium', timestamp: Date.now() - 3600000, resolved: true }
            ];

            const report = alertSystem.generateSummaryReport();

            expect(report.period).toBeDefined();
            expect(report.summary.totalAlerts).toBe(3);
            expect(report.summary.unresolvedAlerts).toBe(1);
            expect(report.summary.resolvedAlerts).toBe(2);
            expect(report.recommendations).toBeDefined();
            expect(report.trends).toBeDefined();
        });
    });

    describe('カスタムルール', () => {
        test('カスタムアラートルールが追加される', () => {
            const customRule = {
                id: 'custom_bubble_pop_rate',
                name: 'Bubble Pop Rate Monitor',
                condition: (data: any) => {
                    const popRate = data.bubblesPoppedPerMinute;
                    return popRate < 10; // 1分間に10個未満
                },
                severity: 'medium',
                message: 'Bubble pop rate is below expected threshold'
            };

            alertSystem.addCustomRule(customRule);

            expect(alertSystem.customRules).toContainEqual(customRule);
        });

        test('カスタムルールが評価される', async () => {
            const customRule = {
                id: 'test_rule',
                condition: jest.fn().mockReturnValue(true),
                severity: 'high',
                message: 'Custom rule triggered'
            };

            alertSystem.addCustomRule(customRule);

            const testData = { value: 100 };
            dataCollector.getData.mockResolvedValue([testData]);

            await alertSystem.evaluateCustomRules();

            expect(customRule.condition).toHaveBeenCalledWith(testData);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Custom rule triggered')
            );
        });
    });

    describe('エラーハンドリング', () => {
        test('データ取得エラーが適切に処理される', async () => {
            dataCollector.getData.mockRejectedValue(new Error('Data access failed'));

            await expect(alertSystem.checkPerformanceAlerts()).resolves.not.toThrow();
        });

        test('Webhook送信エラーが適切に処理される', async () => {
            const webhookConfig = {
                enabled: true,
                url: 'https://invalid-url.com/webhook'
            };

            alertSystem.setWebhookConfig(webhookConfig);
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const alert = {
                type: 'test',
                severity: 'medium',
                message: 'Test alert'
            };

            await expect(alertSystem.sendWebhookAlert(alert)).resolves.not.toThrow();
        });
    });

    describe('設定管理', () => {
        test('しきい値設定が更新される', () => {
            const newThresholds = {
                fpsDropThreshold: 10,
                memoryUsageThreshold: 0.9,
                errorRateThreshold: 0.02,
                sessionCompletionThreshold: 0.7
            };

            alertSystem.updateThresholds(newThresholds);

            expect(alertSystem.config.thresholds).toEqual(newThresholds);
        });

        test('除外フィルターが設定される', () => {
            const excludeFilters = {
                errorTypes: ['NetworkError', 'TimeoutError'],
                userAgents: ['TestBot', 'Crawler'],
                sessionDurationMin: 5000
            };

            alertSystem.setExcludeFilters(excludeFilters);

            expect(alertSystem.excludeFilters).toEqual(excludeFilters);
        });
    });

    describe('リソース管理', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            alertSystem.startRealTimeMonitoring({ enabled: true, interval: 1000 });
            
            alertSystem.destroy();

            expect(alertSystem.isMonitoring).toBe(false);
            expect(alertSystem.alertHistory).toEqual([]);
        });
    });
});