import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
import { RealtimeDashboard  } from '../../src/analytics/RealtimeDashboard';
import { PerformanceDataCollector  } from '../../src/analytics/PerformanceDataCollector';
import { RealtimeMonitor  } from '../../src/analytics/RealtimeMonitor';
// Chart.jsのモック
(global as any).Chart = jest.fn() as jest.Mock.mockImplementation(() => ({
    data: { datasets: [{ data: [] }] };
    update: jest.fn(),
        destroy: jest.fn(),
})');
describe('RealtimeDashboard', () => {
    let container: any,
    let dataCollector: any,
    let realtimeMonitor: any,
    let dashboard: any,
    beforeEach((') => {
        // DOM要素を作成
        container = document.createElement('div');
        document.body.appendChild(container);
        // 依存関係のモック
        dataCollector = {
            getCurrentStats: jest.fn().mockReturnValue({
                currentFPS: 60,
                currentMemoryUsage: { usagePercent: 45.5 };
                errorCount: 3,
                averageFrameTime: 16.67),
    });
        };
        realtimeMonitor = {
            isMonitoring: false,
            startMonitoring: jest.fn(),
        stopMonitoring: jest.fn(),
        };
        // ダッシュボードを作成
        dashboard = new RealtimeDashboard(container, dataCollector, realtimeMonitor);
    });
    afterEach(() => {
        if (dashboard) {
            dashboard.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        jest.clearAllMocks();
    }');
    describe('Task 9.1: リアルタイムグラフ表示の実装', (') => {
        test('ダッシュボードが正しく初期化される', (') => {
            expect(container.querySelector('.realtime-dashboard').toBeTruthy(');
            expect(container.querySelector('.dashboard-header').toBeTruthy(');
            expect(container.querySelector('.dashboard-grid').toBeTruthy(');
            expect(container.querySelector('.dashboard-alerts').toBeTruthy();
        }');
        test('FPSチャートが作成される', (') => {
            const fpsCanvas = container.querySelector('#fps-chart');
            expect(fpsCanvas).toBeTruthy(');
            expect(dashboard.charts.has('fps').toBe(true);
        }');
        test('メモリチャートが作成される', (') => {
            const memoryCanvas = container.querySelector('#memory-chart');
            expect(memoryCanvas).toBeTruthy(');
            expect(dashboard.charts.has('memory').toBe(true);
        }');
        test('エラーチャートが作成される', (') => {
            const errorsCanvas = container.querySelector('#errors-chart');
            expect(errorsCanvas).toBeTruthy(');
            expect(dashboard.charts.has('errors').toBe(true);
        }');
        test('レイテンシチャートが作成される', (') => {
            const latencyCanvas = container.querySelector('#latency-chart');
            expect(latencyCanvas).toBeTruthy(');
            expect(dashboard.charts.has('latency').toBe(true);
        }');
        test('監視開始ボタンが機能する', (') => {
            const toggleBtn = container.querySelector('#toggle-monitoring');
            expect(toggleBtn).toBeTruthy();
            expect(toggleBtn.textContent').toBe('監視開始');
            // 監視開始
            toggleBtn.click();
            expect(toggleBtn.textContent').toBe('監視停止'');
            expect(toggleBtn.classList.contains('active').toBe(true);
            expect(dashboard.updateTimer).toBeTruthy();
            expect(realtimeMonitor.startMonitoring).toHaveBeenCalled();
        }');
        test('監視停止ボタンが機能する', (') => {
            const toggleBtn = container.querySelector('#toggle-monitoring');
            // まず監視を開始
            toggleBtn.click();
            // 監視停止
            toggleBtn.click();
            expect(toggleBtn.textContent').toBe('監視開始'');
            expect(toggleBtn.classList.contains('active').toBe(false);
            expect(dashboard.updateTimer).toBe(null);
        }');
        test('データ更新が正しく実行される', () => {
            // データ更新を実行
            dashboard.updateData();
            // データ履歴が更新される
            expect(dashboard.dataHistory.fps.length).toBe(1);
            expect(dashboard.dataHistory.fps[0]).toBe(60);
            expect(dashboard.dataHistory.memory[0]).toBe(45.5);
            expect(dashboard.dataHistory.errors[0]).toBe(3);
            expect(dashboard.dataHistory.latency[0]).toBe(16.67);
        }');
        test('データ履歴が最大長を超えない', () => {
            // 履歴の最大長を超えるデータを追加
            for (let i = 0; i < 100; i++) {
                dashboard.updateData();
            }
            expect(dashboard.dataHistory.fps.length).toBe(dashboard.options.historyLength);
            expect(dashboard.dataHistory.memory.length).toBe(dashboard.options.historyLength);
            expect(dashboard.dataHistory.errors.length).toBe(dashboard.options.historyLength);
            expect(dashboard.dataHistory.latency.length).toBe(dashboard.options.historyLength);
        }');
        test('チャートが更新される', () => {
            // データを追加
            dashboard.updateData();
            dashboard.updateData();
            // チャート更新
            dashboard.updateCharts();
            // 各チャートのupdateメソッドが呼ばれる
            dashboard.charts.forEach(chart => {);
                expect(chart.update).toHaveBeenCalled();
            }');
        }
        test('統計情報が正しく計算される', () => {
            // 複数のデータポイントを追加
            for (let i = 0; i < 5; i++) {
                dashboard.updateData();
            }
            // 統計情報を更新
            dashboard.updateStats(');
            // FPS統計が表示される
            const fpsStats = container.querySelector('#fps-stats');
            expect(fpsStats.textContent').toContain('現在: 60.0');
            expect(fpsStats.textContent').toContain('平均: 60.0');
        }');
        test('データクリアボタンが機能する', () => {
            // データを追加
            dashboard.updateData();
            dashboard.updateData();
            expect(dashboard.dataHistory.fps.length).toBe(2');
            // データクリア
            const clearBtn = container.querySelector('#clear-data');
            clearBtn.click();
            expect(dashboard.dataHistory.fps.length).toBe(0);
            expect(dashboard.dataHistory.memory.length).toBe(0);
            expect(dashboard.dataHistory.errors.length).toBe(0);
            expect(dashboard.dataHistory.latency.length).toBe(0);
        }');
        test('アラートが正しく表示される', () => {
            const alert = {
                timestamp: Date.now('),
                severity: 'warning',
                message: 'Low FPS, detected: 25fps'
            };
            dashboard.displayAlert(alert');
            const alertsContainer = container.querySelector('#alerts-container'');
            const alertItem = alertsContainer.querySelector('.alert-item');
            expect(alertItem).toBeTruthy(');
            expect(alertItem.classList.contains('warning').toBe(true);
            expect(alertItem.textContent').toContain('Low FPS detected: 25fps'),
        }');
        test('リアルタイムアラートイベントが処理される', () => {
            const alert = {
                timestamp: Date.now('),
                severity: 'error',
                message: 'High memory usage'
            };
            // カスタムイベントを発火
            window.dispatchEvent(new CustomEvent('realtime-alert', { detail: alert })');
            const alertsContainer = container.querySelector('#alerts-container'');
            const alertItem = alertsContainer.querySelector('.alert-item');
            expect(alertItem).toBeTruthy(');
            expect(alertItem.classList.contains('error').toBe(true);
        }');
        test('データエクスポートが機能する', (') => {
            // モックの設定
            const createElementSpy = jest.spyOn(document, 'createElement');
            // URLオブジェクトをモック
            const originalURL = global.URL;
            (global as any).URL = {
                createObjectURL: jest.fn(').mockReturnValue('blob:test'),
        revokeObjectURL: jest.fn(),
            };
            
            // データを追加
            dashboard.updateData(');
            // エクスポート実行
            const exportBtn = container.querySelector('#export-data');
            exportBtn.click();
            // ダウンロードリンクが作成される
            expect(createElementSpy').toHaveBeenCalledWith('a');
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL').toHaveBeenCalledWith('blob: test'),
            // 元に戻す
            createElementSpy.mockRestore();
            (global as any).URL = originalURL;
        }');
        test('平均値が正しく計算される', () => {
            const values = [10, 20, 30, 40, 50];
            const average = dashboard.calculateAverage(values);
            expect(average).toBe(30);
        }');
        test('エラー率が正しく計算される', () => {
            // エラーデータを設定
            dashboard.dataHistory.errors = [0, 0, 1, 1, 2, 2, 3, 4, 5, 6];
            
            const errorRate = dashboard.calculateErrorRate();
            expect(errorRate).toBeGreaterThan(0);
        }');
        test('オプション設定が正しく適用される', (') => {
            const customDashboard = new RealtimeDashboard(container, dataCollector, realtimeMonitor, {
                updateInterval: 2000,
                historyLength: 120,
                theme: 'light',
                enableFPS: false,
                enableMemory: true
            });
            expect(customDashboard.options.updateInterval).toBe(2000);
            expect(customDashboard.options.historyLength).toBe(120);
            expect(customDashboard.options.theme').toBe('light'');
            expect(container.querySelector('#fps-chart').toBeFalsy(');
            expect(container.querySelector('#memory-chart').toBeTruthy();
            customDashboard.destroy();
        }');
        test('destroyメソッドがリソースを正しく解放する', () => {
            // 監視を開始
            dashboard.startUpdates();
            // チャートが存在することを確認
            expect(dashboard.charts.size).toBeGreaterThan(0);
            // 破棄
            dashboard.destroy();
            // リソースが解放される
            expect(dashboard.charts.size).toBe(0);
            expect(dashboard.updateTimer).toBe(null);
            expect(container.innerHTML').toBe('');
        });
    }
}');