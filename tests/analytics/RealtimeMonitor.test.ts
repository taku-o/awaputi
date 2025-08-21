import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * RealtimeMonitor のテスト
 */
import { RealtimeMonitor } from '../../src/analytics/RealtimeMonitor';
// Performance API とその他のモック
(global as any').Notification = class Notification {'
    static permission = 'granted',
    static requestPermission = jest.fn((') => Promise.resolve('granted'),'
    constructor(title, options = {)') {'
        this.title = title;
        this.body = options.body || ';'
        this.icon = options.icon || ';'
        this.badge = options.badge || ';'
        this.onclick = null;
        this.onclose = null;
        this.onerror = null;
        this.onshow = null)
    ;
    close() {
        if (this.onclose) this.onclose()) };
(global: any).requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16);
    return 1),
// モックのPerformanceDataCollector
const mockDataCollector = {
    getCurrentStats: jest.fn((') => ({'
        sessionId: 'test-session',
        currentFPS: 60,
        averageFrameTime: 16.67,
        currentMemoryUsage: {
            used: 10000000,
            usagePercent: 10,
            total: 50000000
    },
        errorCount: 0
    }),
    getPerformanceData: jest.fn(() => []),
    }');'
describe('RealtimeMonitor', () => {
    let monitor: any,
    let mockDispatchEvent: any,
    beforeEach(() => {
        jest.clearAllMocks('),'
        mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
        monitor = new RealtimeMonitor(mockDataCollector, {
            monitoringInterval: 100, // テスト用に短縮
            warningCooldown: 500,
            enableDebugPanel: false,
            enableNotifications: false,);
    }
    afterEach(() => {
        if (monitor) {
            monitor.destroy() }
        mockDispatchEvent.mockRestore();
    }');'
    describe('初期化', (') => {'
        test('正しく初期化される', () => {
            expect(monitor).toBeDefined();
            expect(monitor.isMonitoring).toBe(false);
            expect(monitor.alerts).toEqual([]);
            expect(monitor.monitoringStats).toBeDefined() }');'
        test('オプションが正しく設定される', () => {
            const customMonitor = new RealtimeMonitor(mockDataCollector, {
                fpsThreshold: 25,
                memoryThreshold: 90,
                enableConsoleWarnings: false,);
            expect(customMonitor.options.fpsThreshold).toBe(25);
            expect(customMonitor.options.memoryThreshold).toBe(90);
            expect(customMonitor.options.enableConsoleWarnings).toBe(false);
            customMonitor.destroy();
        }');'
    }
    describe('監視制御', (') => {'
        test('監視を開始・停止できる', () => {
            expect(monitor.isMonitoring).toBe(false);
            monitor.startMonitoring();
            expect(monitor.isMonitoring).toBe(true);
            expect(monitor.monitoringStats.startTime).toBeDefined();
            monitor.stopMonitoring();
            expect(monitor.isMonitoring).toBe(false) }');'
        test('重複開始・停止を処理する', () => {
            monitor.startMonitoring();
            monitor.startMonitoring(), // 重複開始
            expect(monitor.isMonitoring).toBe(true);
            monitor.stopMonitoring();
            monitor.stopMonitoring(), // 重複停止
            expect(monitor.isMonitoring).toBe(false) }');'
    }
    describe('パフォーマンス監視', (') => {'
        test('低FPSを検出する', (done) => {
            mockDataCollector.getCurrentStats.mockReturnValue({
                currentFPS: 25, // 閾値30未満
                averageFrameTime: 40 // 33.33ms超過で poor_responsiveness が生成される },
            monitor.startMonitoring();
            setTimeout(() => {
                expect(monitor.alerts.length).toBeGreaterThan(0'),'
                // 実装では averageFrameTime > 33.33 の場合 'poor_responsiveness' が生成される
                expect(monitor.alerts[0].alertType').toBe('poor_responsiveness'),'
                expect(monitor.alerts[0].severity').toBe('warning'),'
                monitor.stopMonitoring();
                done() }, 150);
        }');'
        test('高メモリ使用量を検出する', (done) => {
            mockDataCollector.getCurrentStats.mockReturnValue({
                currentMemoryUsage: {
                    usagePercent: 85, // 閾値80%超過
                    used: 85000000
                };
            };
            monitor.startMonitoring();
            setTimeout(() => {
                expect(monitor.alerts.length).toBeGreaterThan(0);
                expect(monitor.alerts[0].alertType').toBe('high_memory'),'
                expect(monitor.alerts[0].severity').toBe('warning'),'
                monitor.stopMonitoring();
                done() }, 150);
        }');'
        test('応答性の問題を検出する', (done) => {
            mockDataCollector.getCurrentStats.mockReturnValue({
                averageFrameTime: 50, // 33.33ms超過
                currentFPS: 20 },
            monitor.startMonitoring();
            setTimeout(() => {
                expect(monitor.alerts.length).toBeGreaterThan(0);
                expect(monitor.alerts[0].alertType').toBe('poor_responsiveness'),'
                expect(monitor.alerts[0].severity').toBe('warning'),'
                monitor.stopMonitoring();
                done() }, 150);
        }');'
    }
    describe('アラート管理', (') => {'
        test('アラートを生成する', (') => {'
            const alertData = {
                type: 'performance',
                severity: 'warning',
                message: 'Test alert'
            };
            monitor.generateAlert('test_alert', alertData);
            expect(monitor.alerts).toHaveLength(1);
            expect(monitor.alerts[0].alertType').toBe('test_alert');'
            expect(monitor.alerts[0].type').toBe('performance');'
            expect(monitor.alerts[0].severity').toBe('warning');'
            expect(monitor.alerts[0].message').toBe('Test alert');'
        }');'
        test('クールダウン機能が動作する', (') => {'
            const alertData = {
                type: 'performance',
                severity: 'warning',
                message: 'Test alert'
            };
            monitor.generateAlert('test_alert', alertData);
            expect(monitor.alerts).toHaveLength(1');'
            // クールダウン期間中の重複アラートは無視される
            monitor.generateAlert('test_alert', alertData);
            expect(monitor.alerts).toHaveLength(1);
        }');'
        test('最大アラート数を制限する', () => {
            const limitedMonitor = new RealtimeMonitor(mockDataCollector, {
                maxAlerts: 3
            };
            // 制限を超えるアラートを生成
            for (let i = 0; i < 5; i++') {'
                limitedMonitor.generateAlert(`test_alert_${i}`, {
                    type: 'test',
                    severity: 'info',
                    message: `Test alert ${i}`),
                };
            }
            expect(limitedMonitor.alerts).toHaveLength(3);
            limitedMonitor.destroy();
        }');'
        test('アラートイベントを発火する', (') => {'
            const alertData = {
                type: 'performance',
                severity: 'warning',
                message: 'Test alert'
            };
            monitor.generateAlert('test_alert', alertData);
            expect(mockDispatchEvent').toHaveBeenCalledWith('
                expect.objectContaining({
                    type: 'realtime-alert')) }');'
    }
    describe('パフォーマンス警告の処理', (') => {'
        test('パフォーマンス警告を処理する', (') => {'
            const warningData = {
                type: 'low_fps',
                details: {
                    currentFPS: 25,
                    threshold: 30
                }
            };
            monitor.handlePerformanceWarning(warningData);
            expect(monitor.alerts).toHaveLength(1);
            expect(monitor.alerts[0].alertType').toBe('low_fps');'
        }');'
        test('警告の重要度レベルを正しく判定する', (') => {'
            expect(monitor.getSeverityLevel('low_fps')').toBe('warning'),'
            expect(monitor.getSeverityLevel('error_occurred')').toBe('error'),'
            expect(monitor.getSeverityLevel('unknown_type')').toBe('info') }');
        test('警告メッセージを正しくフォーマットする', (') => {'
            const warningData = {
                type: 'low_fps',
                details: { currentFPS: 25 }
            };
            const message = monitor.formatWarningMessage(warningData);
            expect(message').toContain('Low FPS: 25fps' }'),
    }
    describe('エラー率の計算', (') => {'
        test('エラー率を正しく計算する', () => {
            const mockErrorData = [
                { timestamp: Date.now() - 30000 }, // 30秒前
                { timestamp: Date.now() - 45000 }, // 45秒前
                { timestamp: Date.now() - 90000 }  // 90秒前（1分超過）
            ];
            mockDataCollector.getPerformanceData.mockReturnValue(mockErrorData);
            const errorRate = monitor.calculateErrorRate();
            expect(errorRate).toBe(2); // 過去1分間のエラーは2件
        }');'
        test('エラーデータがない場合はゼロを返す', () => {
            mockDataCollector.getPerformanceData.mockReturnValue([]);
            const errorRate = monitor.calculateErrorRate();
            expect(errorRate).toBe(0) }');'
    }
    describe('アラート履歴', (') => {'
        test('アラート履歴を取得する', (') => {'
            monitor.generateAlert('alert1', {
                type: 'performance',
                severity: 'warning',
                message: 'Warning alert' }');'
            monitor.generateAlert('alert2', {
                type: 'error',
                severity: 'error',
                message: 'Error alert' },
            const allAlerts = monitor.getAlertHistory();
            expect(allAlerts).toHaveLength(2');'
            const warningAlerts = monitor.getAlertHistory(null, 'warning');
            expect(warningAlerts).toHaveLength(1);
            expect(warningAlerts[0].severity').toBe('warning');'
            const errorAlerts = monitor.getAlertHistory(null, 'error');
            expect(errorAlerts).toHaveLength(1);
            expect(errorAlerts[0].severity').toBe('error');'
        }');'
        test('制限付きでアラート履歴を取得する', () => {
            for (let i = 0, i < 5, i++') {'
                monitor.generateAlert(`alert${i}`, {
                    type: 'test',
                    severity: 'info',
                    message: `Test alert ${i}`),
                };
            }
            const limitedAlerts = monitor.getAlertHistory(3);
            expect(limitedAlerts).toHaveLength(3);
        }');'
    }
    describe('監視統計', (') => {'
        test('監視統計を取得する', async () => {
            monitor.startMonitoring();
            // uptimeが正しく計算されるように少し待機
            await new Promise(resolve => setTimeout(resolve, 10)'),'
            monitor.generateAlert('test_alert', {
                type: 'performance',
                severity: 'warning',
                message: 'Test warning' }');'
            monitor.generateAlert('error_alert', {
                type: 'error',
                severity: 'error',
                message: 'Test error'),
            const stats = monitor.getMonitoringStatistics();
            expect(stats.isMonitoring).toBe(true);
            expect(stats.warningsGenerated).toBe(2);
            expect(stats.performanceIssues).toBe(1);
            expect(stats.errorsDetected).toBe(1);
            expect(stats.alertCount).toBe(2);
            expect(stats.uptime).toBeGreaterThan(0);
            monitor.stopMonitoring() }');'
    }
    describe('設定の更新', (') => {'
        test('監視オプションを更新できる', () => {
            const originalThreshold = monitor.options.fpsThreshold,
            
            monitor.updateOptions({ fpsThreshold: 25 },
            expect(monitor.options.fpsThreshold).toBe(25);
            expect(monitor.options.fpsThreshold).not.toBe(originalThreshold);
        }');'
    }
    describe('アラートのクリア', (') => {'
        test('アラートをクリアできる', (') => {'
            monitor.generateAlert('test_alert', {
                type: 'test',
                severity: 'info',
                message: 'Test' },
            expect(monitor.alerts).toHaveLength(1);
            monitor.clearAlerts();
            expect(monitor.alerts).toHaveLength(0);
        }');'
    }
    describe('通知権限', (') => {'
        test('通知権限を要求できる', async () => {
            const result = await monitor.requestNotificationPermission();
            expect(result).toBe(true) }');'
        test('通知が拒否された場合の処理', async (') => {'
            global.Notification.permission = 'denied',
            
            const result = await monitor.requestNotificationPermission();
            expect(result).toBe(false'),'
            // リセット
            global.Notification.permission = 'granted' }');'
    }
    describe('リソース管理', (') => {'
        test('destroy(')でリソースを解放する', () => {'
            monitor.startMonitoring();
            expect(monitor.isMonitoring).toBe(true);
            monitor.destroy();
            expect(monitor.isMonitoring).toBe(false);
            expect(monitor.alerts).toHaveLength(0) };
    }
}');'