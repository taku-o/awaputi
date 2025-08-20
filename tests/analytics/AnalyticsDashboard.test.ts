import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * AnalyticsDashboard のテスト
 */
// 手動でモック
const mockChartRenderer = {
    createLineChart: jest.fn((') => ({ id: 'mock-line-chart' )));
    createBarChart: jest.fn((') => ({ id: 'mock-bar-chart' )));
    createPieChart: jest.fn((') => ({ id: 'mock-pie-chart' )));
    createDoughnutChart: jest.fn((') => ({ id: 'mock-doughnut-chart' )));
    updateChartData: jest.fn(() => true),
        destroy: jest.fn();
const mockDataVisualizer = {
    createScatterPlot: jest.fn(),
    createHeatmap: jest.fn(),
        destroy: jest.fn()
');
// モジュールを手動でモック
jest.doMock('../../src/analytics/ChartRenderer.js', () => ({
    ChartRenderer: jest.fn(() => mockChartRenderer));
    }))');
jest.doMock('../../src/analytics/DataVisualizer.js', () => ({
    DataVisualizer: jest.fn(() => mockDataVisualizer));
    })));
import { AnalyticsDashboard ') from '../../src/analytics/AnalyticsDashboard';
// DOM のモック
Object.defineProperty(global, 'document', {
    value: {),
        getElementById: jest.fn(),
        createElement: jest.fn((tag) => ({
            tagName: tag.toUpperCase('),
            id: '',
            className: '',
            innerHTML: '',
            style: {),
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            querySelector: jest.fn(),
        remove: jest.fn()
        ))),
        head: {
            appendChild: jest.fn(),
        },
        body: {
            appendChild: jest.fn(),
        removeChild: jest.fn(),
        }
    }
});
// URL と Blob のモック
(global as any).URL = {
    createObjectURL: jest.fn((') => 'mock-url');
        revokeObjectURL: jest.fn();
(global as any).Blob = jest.fn((') => ({ type: 'application/json' )))'),
// Date のモック
const mockDate = new Date('2023-12-01T10: 00:00Z'),
(global as any).Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime()');
describe('AnalyticsDashboard', () => {
    let dashboard: any,
    let mockContainer: any,
    beforeEach(() => {
        jest.clearAllMocks(');
        mockContainer = {
            id: 'test-dashboard',
            className: '',
            innerHTML: '',
            style: {),
            appendChild: jest.fn(),
        addEventListener: jest.fn();
        document.getElementById.mockReturnValue(mockContainer');
        dashboard = new AnalyticsDashboard('test-dashboard', {
            enableRealtime: false, // テスト用に無効化
            showDataCollectingMessage: true,
            minDataPoints: 3
    ));
    }
    afterEach(() => {
        if (dashboard) {
            dashboard.destroy();
        }
    }');
    describe('初期化', (') => {
        test('正しく初期化される', () => {
            expect(dashboard).toBeDefined();
            expect(dashboard.containerId').toBe('test-dashboard');
            expect(dashboard.container).toBe(mockContainer);
            expect(dashboard.sections).toBeInstanceOf(Map);
            expect(dashboard.activeCharts).toBeInstanceOf(Map);
        }');
        test('コンテナが存在しない場合はエラーログ', (') => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            document.getElementById.mockReturnValue(null');
            new AnalyticsDashboard('non-existent-container');
            expect(consoleSpy).toHaveBeenCalledWith(');
                expect.stringContaining("Container element with ID 'non-existent-container' not found");
            consoleSpy.mockRestore();
        }");
        test('オプションが正しく設定される', (') => {
            const customDashboard = new AnalyticsDashboard('test-custom', {
                theme: 'dark',
                updateInterval: 10000,
                layout: 'flex',
                minDataPoints: 10
            });
            expect(customDashboard.options.theme').toBe('dark');
            expect(customDashboard.options.updateInterval).toBe(10000);
            expect(customDashboard.options.layout').toBe('flex');
            expect(customDashboard.options.minDataPoints).toBe(10);
            customDashboard.destroy();
        }');
    }
    describe('レイアウト作成', (') => {
        test('コンテナにクラスが設定される', () => {
            expect(mockContainer.className').toBe('analytics-dashboard grid-layout');
        }');
        test('セクションが作成される', (') => {
            expect(dashboard.sections.has('basic-stats').toBe(true');
            expect(dashboard.sections.has('bubble-analysis').toBe(true');
            expect(dashboard.sections.has('performance-metrics').toBe(true);
        }');
        test('セクション構造が正しく作成される', (') => {
            const section = dashboard.sections.get('basic-stats');
            expect(section).toBeDefined();
            expect(section.container).toBeDefined();
            expect(section.content).toBeDefined();
            expect(section.title').toBe('プレイ統計');
            expect(section.charts).toBeInstanceOf(Map);
        }');
    }
    describe('基本統計表示', (') => {
        test('十分なデータがある場合、チャートが作成される', (') => {
            const mockData = {
                playtime: [
                    { date: '2023-12-01', minutes: 30 },
                    { date: '2023-12-02', minutes: 45 },
                    { date: '2023-12-03', minutes: 25 }
                ],
                scoreDistribution: [
                    { range: '0-1000', count: 5 },
                    { range: '1000-2000', count: 8 },
                    { range: '2000-3000', count: 3 }
                ],
                successRate: 75
            };
            const dataCallback = jest.fn(() => mockData);
            dashboard.setupBasicStatistics(dataCallback);
            expect(dashboard.chartRenderer.createLineChart').toHaveBeenCalledWith(
                'playtime-chart-canvas',
                expect.objectContaining({
                    label: 'プレイ時間（分）')))
            );
            expect(dashboard.chartRenderer.createBarChart').toHaveBeenCalledWith(
                'score-distribution-chart-canvas',
                expect.objectContaining({
                    label: 'ゲーム数')))
            );
            expect(dashboard.chartRenderer.createDoughnutChart').toHaveBeenCalledWith(
                'success-rate-chart-canvas',
                expect.objectContaining({
                    label: '成功率')))
            ');
            expect(dashboard.dataCallbacks.has('basic-stats').toBe(true);
        }');
        test('データが不足している場合、収集中メッセージが表示される', (') => {
            const insufficientData = {
                playtime: [{ date: '2023-12-01', minutes: 30 }] // minDataPoints未満
            };
            const dataCallback = jest.fn(() => insufficientData);
            dashboard.setupBasicStatistics(dataCallback');
            const section = dashboard.sections.get('basic-stats');
            expect(section.content.innerHTML').toContain('データ収集中');
        )');
        test('プレイ時間チャートが正しく更新される', (') => {
            const mockData = {
                playtime: [
                    { date: '2023-12-01', minutes: 30 '),
                    { date: '2023-12-02',
        minutes: 45 
    }')
                ]
            };
            dashboard.activeCharts.set('playtime-chart', { id: 'mock-chart' ),
            dashboard.updateBasicStatistics(mockData);
            expect(dashboard.chartRenderer.updateChartData').toHaveBeenCalledWith(
                'playtime-chart-canvas',
                {
                    labels: ['2023-12-01', '2023-12-02'],
                    data: [30, 45])
            );
        }');
    }
    describe('バブル分析表示', (') => {
        test('バブル統計チャートが作成される', (') => {
            const mockData = {
                bubbleStats: [
                    { type: 'Normal', successRate: 80, frequency: 100, avgScore: 150 },
                    { type: 'Stone', successRate: 60, frequency: 50, avgScore: 300 },
                    { type: 'Rainbow', successRate: 90, frequency: 20, avgScore: 500 }
                ]
            };
            const dataCallback = jest.fn(() => mockData);
            dashboard.setupBubbleAnalysis(dataCallback);
            expect(dashboard.chartRenderer.createPieChart').toHaveBeenCalledWith(
                'bubble-success-rate-chart-canvas',
                expect.objectContaining({
                    label: '成功率')))
            );
            expect(dashboard.chartRenderer.createBarChart').toHaveBeenCalledWith(
                'bubble-frequency-chart-canvas',
                expect.objectContaining({
                    label: '出現回数')))
            );
            expect(dashboard.chartRenderer.createBarChart').toHaveBeenCalledWith(
                'bubble-score-contribution-chart-canvas',
                expect.objectContaining({
                    label: '平均獲得スコア')))
            );
        }');
        test('バブル分析が正しく更新される', (') => {
            const mockData = {
                bubbleStats: [
                    { type: 'Normal', successRate: 85, frequency: 120, avgScore: 160 }
                ]
            };
            dashboard.activeCharts.set('bubble-success-rate-chart', { id: 'mock-chart' }');
            dashboard.activeCharts.set('bubble-frequency-chart', { id: 'mock-chart' )'),
            dashboard.activeCharts.set('bubble-score-contribution-chart', { id: 'mock-chart' ),
            dashboard.updateBubbleAnalysis(mockData);
            expect(dashboard.chartRenderer.updateChartData).toHaveBeenCalledTimes(3);
        }');
    }
    describe('パフォーマンス指標表示', (') => {
        test('パフォーマンスチャートが作成される', () => {
            const mockData = {
                performance: {
                    fps: [
                        { timestamp: Date.now(), fps: 60 },
                        { timestamp: Date.now() + 1000, fps: 58 },
                        { timestamp: Date.now() + 2000, fps: 59 }
                    ],
                    memory: [
                        { timestamp: Date.now(), usagePercent: 45 },
                        { timestamp: Date.now() + 1000, usagePercent: 48 },
                        { timestamp: Date.now() + 2000, usagePercent: 46 }
                    ]
                }
            };
            const dataCallback = jest.fn(() => mockData);
            dashboard.setupPerformanceMetrics(dataCallback);
            expect(dashboard.chartRenderer.createLineChart').toHaveBeenCalledWith(
                'fps-chart-canvas',
                expect.objectContaining({
                    label: 'FPS')))
            );
            expect(dashboard.chartRenderer.createLineChart').toHaveBeenCalledWith(
                'memory-usage-chart-canvas',
                expect.objectContaining({
                    label: 'メモリ使用量（%）')))
            );
        )');
        test('パフォーマンス指標が正しく更新される', () => {
            const mockData = {
                performance: {
                    fps: [{ timestamp: Date.now(), fps: 60 }],
                    memory: [{ timestamp: Date.now('), usagePercent: 50 }]
                }
            };
            dashboard.activeCharts.set('fps-chart', { id: 'mock-chart' )'),
            dashboard.activeCharts.set('memory-usage-chart', { id: 'mock-chart' ),
            dashboard.updatePerformanceMetrics(mockData);
            expect(dashboard.chartRenderer.updateChartData).toHaveBeenCalledTimes(2);
        }');
    }
    describe('データ不足判定', (') => {
        test('データがnullの場合は不足と判定', () => {
            expect(dashboard.isDataInsufficient(null).toBe(true);
        }');
        test('特定プロパティが存在しない場合は不足と判定', (') => {
            const data = { playtime: [] };
            expect(dashboard.isDataInsufficient(data, 'bubbleStats').toBe(true);
        }');
        test('配列データがminDataPoints未満の場合は不足と判定', (') => {
            const data = { playtime: [{ date: '2023-12-01', minutes: 30 }] };
            expect(dashboard.isDataInsufficient(data, 'playtime').toBe(true);
        }');
        test('十分なデータがある場合は不足と判定されない', (') => {
            const data = {
                playtime: [
                    { date: '2023-12-01', minutes: 30 },
                    { date: '2023-12-02', minutes: 45 },
                    { date: '2023-12-03', minutes: 25 }
                ]
            };
            expect(dashboard.isDataInsufficient(data, 'playtime').toBe(false);
        }');
    }
    describe('ユーザーインタラクション', (') => {
        test('ダッシュボードを手動更新できる', () => {
            const mockCallback = jest.fn(() => ({ playtime: [] )))'),
            dashboard.dataCallbacks.set('test-section', mockCallback);
            dashboard.refresh();
            expect(mockCallback).toHaveBeenCalled();
        )');
        test('時間範囲を変更できる', (') => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            dashboard.refresh = jest.fn(') as jest.Mock;
            dashboard.changeTimeRange('7d');
            expect(dashboard.currentTimeRange').toBe('7d');
            expect(consoleSpy').toHaveBeenCalledWith('Time range changed to: 7d'),
            expect(dashboard.refresh).toHaveBeenCalled();
            consoleSpy.mockRestore();
        }');
        test('セクションを最小化/展開できる', (') => {
            const section = dashboard.sections.get('basic-stats'');
            const mockToggleBtn = { textContent: '最小化' };
            section.container.querySelector = jest.fn(() => mockToggleBtn');
            dashboard.toggleSection('basic-stats');
            expect(section.content.style.display').toBe('none');
            expect(mockToggleBtn.textContent').toBe('展開'');
            dashboard.toggleSection('basic-stats');
            expect(section.content.style.display').toBe('block');
            expect(mockToggleBtn.textContent').toBe('最小化');
        );
    )');
    describe('データエクスポート', (') => {
        test('データをJSON形式でエクスポートできる', () => {
            const mockCallback1 = jest.fn((') => ({ data: 'test1' ))),
            const mockCallback2 = jest.fn((') => ({ data: 'test2' )))'),
            dashboard.dataCallbacks.set('section1', mockCallback1');
            dashboard.dataCallbacks.set('section2', mockCallback2');
            const mockAnchor = {
                href: '',
                download: '',
        click: jest.fn()
            );
            document.createElement.mockReturnValue(mockAnchor);
            dashboard.exportData();
            expect(global.Blob).toHaveBeenCalledWith(')
                [expect.stringContaining('"sections"'')],
                { type: 'application/json' }
            );
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        }');
        test('データ取得エラー時はエラー情報をエクスポート', () => {
            const errorCallback = jest.fn((') => { throw new Error('Test error'); ))');
            dashboard.dataCallbacks.set('error-section', errorCallback);
            const mockAnchor = { click: jest.fn() });
            document.createElement.mockReturnValue(mockAnchor);
            dashboard.exportData();
            expect(global.Blob).toHaveBeenCalledWith(')
                [expect.stringContaining('Test error'')],
                { type: 'application/json' }
            );
        }');
    }
    describe('チャートコンテナ管理', (') => {
        test('チャートコンテナが正しく作成される', () => {
            const mockParent = { appendChild: jest.fn(') };
            const mockCanvas = { 
                id: '',
                width: 0,
                height: 0
            };
            
            document.createElement.mockReturnValue(mockCanvas');
            const container = dashboard.createChartContainer('test-chart', 'テストチャート', mockParent);
            expect(container.id').toBe('container-test-chart');
            expect(mockParent.appendChild).toHaveBeenCalledWith(container);
            expect(mockCanvas.id').toBe('test-chart-canvas');
            expect(mockCanvas.width).toBe(dashboard.options.chartDefaults.width);
            expect(mockCanvas.height).toBe(dashboard.options.chartDefaults.height);
        }');
    }
    describe('メッセージ表示', (') => {
        test('データ収集中メッセージが表示される', (') => {
            const mockContainer = { innerHTML: '' };
            
            dashboard.showDataCollectingMessage(mockContainer, 'test-section');
            expect(mockContainer.innerHTML').toContain('データ収集中');
            expect(mockContainer.innerHTML').toContain('3回以上のゲームプレイが必要');
        }');
        test('データなしメッセージが表示される', () => {
            const mockContainer = { appendChild: jest.fn(') };
            const mockMessageDiv = { innerHTML: '' };
            
            document.createElement.mockReturnValue(mockMessageDiv);
            dashboard.showNoDataMessage(mockContainer);
            expect(mockContainer.appendChild).toHaveBeenCalledWith(mockMessageDiv);
            expect(mockMessageDiv.innerHTML').toContain('データがありません');
        }');
    }
    describe('リアルタイム更新', (') => {
        test('リアルタイム更新を開始できる', () => {
            jest.useFakeTimers();
            const mockCallback = jest.fn((') => ({ data: 'test' )))'),
            dashboard.dataCallbacks.set('test-section', mockCallback);
            dashboard.updateSection = jest.fn(') as jest.Mock;
            dashboard.startRealtimeUpdate('test-section'');
            expect(dashboard.realtimeTimers.has('test-section').toBe(true);
            jest.advanceTimersByTime(dashboard.options.updateInterval);
            expect(dashboard.updateSection').toHaveBeenCalledWith('test-section');
            jest.useRealTimers();
        )');
        test('既存のタイマーは停止される', () => {
            const mockTimer = setInterval(() => {}, 1000');
            dashboard.realtimeTimers.set('test-section', mockTimer');
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval'');
            dashboard.startRealtimeUpdate('test-section');
            expect(clearIntervalSpy).toHaveBeenCalledWith(mockTimer);
        }');
    }
    describe('統計機能', (') => {
        test('ダッシュボード統計を取得できる', (') => {
            dashboard.sections.set('test1', {}');
            dashboard.sections.set('test2', {}');
            dashboard.activeCharts.set('chart1', {}');
            dashboard.realtimeTimers.set('timer1', {}');
            dashboard.dataCallbacks.set('callback1', {);
            const stats = dashboard.getDashboardStatistics();
            expect(stats.totalSections).toBe(5); // 初期3セクション + テスト2セクション
            expect(stats.activeCharts).toBe(1);
            expect(stats.realtimeUpdates).toBe(1);
            expect(stats.dataCallbacks).toBe(1);
            expect(stats.theme').toBe('default');
        }');
    }
    describe('リソース管理', (') => {
        test('destroy(')で全リソースを解放する', () => {
            const mockTimer = setInterval(() => {}, 1000');
            dashboard.realtimeTimers.set('test-timer', mockTimer');
            dashboard.activeCharts.set('test-chart', {}');
            dashboard.sections.set('test-section', {}');
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            dashboard.destroy();
            expect(clearIntervalSpy).toHaveBeenCalledWith(mockTimer);
            expect(dashboard.realtimeTimers.size).toBe(0);
            expect(dashboard.activeCharts.size).toBe(0);
            expect(dashboard.sections.size).toBe(0);
            expect(dashboard.chartRenderer.destroy).toHaveBeenCalled();
            expect(dashboard.dataVisualizer.destroy).toHaveBeenCalled();
        }');
        test('スタイルシートが削除される', () => {
            const mockStyleSheet = { remove: jest.fn() };
            document.getElementById.mockReturnValue(mockStyleSheet);
            dashboard.destroy();
            expect(mockStyleSheet.remove).toHaveBeenCalled();
        }');
    }
    describe('エラーハンドリング', (') => {
        test('セクション更新中のエラーを適切に処理する', (') => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const errorCallback = jest.fn((') => { throw new Error('Update failed'); ))');
            dashboard.dataCallbacks.set('error-section', errorCallback');
            dashboard.updateSection('error-section');
            expect(consoleSpy').toHaveBeenCalledWith(
                'Failed to update section error-section:', 
                expect.any(Error);
            consoleSpy.mockRestore();
        )');
        test('存在しないセクションの更新は何もしない', () => {
            expect((') => dashboard.updateSection('non-existent-section').not.toThrow();
        });
    }
}');