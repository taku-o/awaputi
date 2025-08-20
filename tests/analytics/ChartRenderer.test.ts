import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * ChartRenderer のテスト
 */
import { ChartRenderer } from '../../src/analytics/ChartRenderer';
// Chart.js のモック
(global as any).Chart = jest.fn(() => ({
    data: { labels: [], datasets: [] '),
    config: { type: 'line', data: {), options: {) },
    update: jest.fn(),
        destroy: jest.fn(),
})');
global.Chart.defaults = {
    font: { family: '', size: 12 },
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 750 };
    color: '#333333'
};
// DOM のモック
Object.defineProperty(global, 'document', {
    value: {),
        getElementById: jest.fn(),
        createElement: jest.fn((') => ({
            id: '',
            width: 400,
            height: 300,
            getContext: jest.fn(() => ({
                clearRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                arc: jest.fn(),
        fill: jest.fn()
            )))
        ))),
        head: {
            appendChild: jest.fn(),
    }),
        body: {
            appendChild: jest.fn(),
        }
    }
}');
describe('ChartRenderer', () => {
    let chartRenderer: any,
    let mockCanvas: any,
    let mockChart: any,
    beforeEach(() => {
        jest.clearAllMocks(');
        mockCanvas = {
            id: 'test-canvas',
            width: 400,
            height: 300,
            getContext: jest.fn(() => ({
                clearRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn('),
                strokeStyle: '',
                fillStyle: '',
                lineWidth: 1
    })))
        ');
        mockChart = {
            data: { 
                labels: [], 
                datasets: [{ data: [] }] 
            },
            config: { type: 'line' };
            update: jest.fn(),
        destroy: jest.fn(),
        };
        global.Chart.mockImplementation(() => mockChart);
        document.getElementById.mockReturnValue(mockCanvas);
        chartRenderer = new ChartRenderer({
            animationDuration: 100, // テスト用に短縮
            updateInterval: 50
        )');
        // Chart.jsが読み込まれたとして設定
        chartRenderer.Chart = global.Chart;
        chartRenderer.currentTheme = {
            backgroundColor: 'rgba(75, 192, 192, 0.2')',
            borderColor: 'rgba(75, 192, 192, 1')',
            textColor: '#333333',
            gridColor: 'rgba(0, 0, 0, 0.1')'
        };
    });
    afterEach(() => {
        if (chartRenderer) {
            chartRenderer.destroy();
        }
    }');
    describe('初期化', (') => {
        test('正しく初期化される', () => {
            expect(chartRenderer).toBeDefined();
            expect(chartRenderer.charts).toBeInstanceOf(Map);
            expect(chartRenderer.chartConfigs).toBeInstanceOf(Map);
            expect(chartRenderer.updateTimers).toBeInstanceOf(Map);
        }');
        test('オプションが正しく設定される', () => {
            const customRenderer = new ChartRenderer({
                defaultWidth: 600,
                defaultHeight: 400,
                maxDataPoints: 100
            });
            expect(customRenderer.options.defaultWidth).toBe(600);
            expect(customRenderer.options.defaultHeight).toBe(400);
            expect(customRenderer.options.maxDataPoints).toBe(100);
            customRenderer.destroy();
        }');
    }
    describe('テーマ機能', (') => {
        test('デフォルトテーマが適用される', (') => {
            chartRenderer.applyTheme('default');
            expect(chartRenderer.currentTheme).toBeDefined();
            expect(chartRenderer.currentTheme.backgroundColor).toBeDefined();
            expect(chartRenderer.currentTheme.borderColor).toBeDefined();
        }');
        test('ダークテーマが適用される', (') => {
            chartRenderer.applyTheme('dark');
            expect(chartRenderer.currentTheme.textColor').toBe('#ffffff');
            expect(chartRenderer.currentTheme.gridColor').toBe('rgba(255, 255, 255, 0.2')');
        }');
        test('不正なテーマはデフォルトテーマを使用する', (') => {
            chartRenderer.applyTheme('invalid-theme');
            expect(chartRenderer.currentTheme.textColor').toBe('#333333'); // デフォルト
        }');
    }
    describe('線グラフ作成', (') => {
        test('線グラフを作成できる', (') => {
            const chart = chartRenderer.createLineChart('test-canvas-line', {
                label: 'テストデータ',
                xAxisLabel: 'X軸',
                yAxisLabel: 'Y軸'),
            });
            expect(chart).toBeDefined();
            expect(global.Chart).toHaveBeenCalledWith();
                expect.anything('),
                expect.objectContaining({
                    type: 'line');
            ');
            expect(chartRenderer.charts.has('test-canvas-line').toBe(true);
        }');
        test('設定が正しく適用される', (') => {
            const config = {
                label: 'カスタムラベル',
                xAxisLabel: 'カスタムX軸',
                yAxisLabel: 'カスタムY軸',
                showLegend: false
            };
            chartRenderer.createLineChart('test-canvas-line', config);
            expect(global.Chart).toHaveBeenCalledWith();
                expect.anything('),
                expect.objectContaining({
                    type: 'line',
                    data: expect.objectContaining({
                        datasets: expect.arrayContaining([
                            expect.objectContaining({
                                label: 'カスタムラベル');
                        ]);
                    }),
                    options: expect.objectContaining({
                        plugins: expect.objectContaining({
                            legend: expect.objectContaining({
                                display: false);
    }
    });
    }
            );
        }');
    }
    describe('棒グラフ作成', (') => {
        test('棒グラフを作成できる', (') => {
            const chart = chartRenderer.createBarChart('test-canvas-bar', {
                label: 'テスト棒グラフ',
                dataCount: 5),
            });
            expect(chart).toBeDefined();
            expect(global.Chart).toHaveBeenCalledWith();
                expect.anything('),
                expect.objectContaining({
                    type: 'bar');
            ');
            expect(chartRenderer.charts.has('test-canvas-bar').toBe(true);
        }');
        test('カラーパレットが生成される', () => {
            const colors = chartRenderer.generateColorPalette(5, 0.8);
            expect(colors).toHaveLength(5);
            colors.forEach(color => {);
                expect(color).toMatch(/^hsla\(\d+, \d+%, \d+%, 0\.8\)$/);
            });
        }
    }');
    describe('円グラフ作成', (') => {
        test('円グラフを作成できる', (') => {
            const chart = chartRenderer.createPieChart('test-canvas-pie', {
                label: 'テスト円グラフ',
                dataCount: 6,
                legendPosition: 'bottom'),
            });
            expect(chart).toBeDefined();
            expect(global.Chart).toHaveBeenCalledWith();
                expect.anything('),
                expect.objectContaining({
                    type: 'pie');
            );
        }');
        test('ドーナツグラフを作成できる', (') => {
            const chart = chartRenderer.createDoughnutChart('test-canvas-doughnut', {
                label: 'テストドーナツグラフ'),
            });
            expect(chart).toBeDefined(');
            expect(chartRenderer.chartConfigs.get('test-canvas-doughnut').type').toBe('doughnut');
        }');
    }
    describe('データ更新', (') => {
        test('チャートデータを更新できる', (') => {
            const chart = chartRenderer.createLineChart('test-canvas-update'');
            const newData = {
                labels: ['A', 'B', 'C'],
                data: [10, 20, 15]
            };
            const result = chartRenderer.updateChartData('test-canvas-update', newData);
            expect(result).toBe(true);
            expect(mockChart.update').toHaveBeenCalledWith('none');
        }');
        test('存在しないチャートの更新は失敗する', (') => {
            const result = chartRenderer.updateChartData('non-existent', { data: [1, 2, 3] });
            expect(result).toBe(false);
        }');
        test('データポイント数が制限される', () => {
            const limitedRenderer = new ChartRenderer({ maxDataPoints: 3 }');
            limitedRenderer.Chart = global.Chart;
            
            const mockChartWithData = {
                data: {
                    labels: ['A', 'B', 'C', 'D', 'E'],
                    datasets: [{ data: [1, 2, 3, 4, 5] }]
                },
        update: jest.fn(),
            };
            limitedRenderer.limitDataPoints(mockChartWithData);
            expect(mockChartWithData.data.labels).toHaveLength(3);
            expect(mockChartWithData.data.datasets[0].data).toHaveLength(3);
            limitedRenderer.destroy();
        }');
    }
    describe('リアルタイム更新', (') => {
        test('リアルタイム更新を開始できる', (done') => {
            chartRenderer.createLineChart('test-canvas-realtime');
            let callCount = 0;
            const dataCallback = (') => {
                callCount++;
                return {
                    labels: [`Point ${callCount}`];
                    data: [callCount * 10]
                };
            };
            chartRenderer.startRealtimeUpdate('test-canvas-realtime', dataCallback, 10);
            setTimeout(() => {
                expect(callCount).toBeGreaterThan(0');
                expect(chartRenderer.updateTimers.has('test-canvas-realtime').toBe(true);
                done();
            }, 50);
        }');
        test('リアルタイム更新を停止できる', (') => {
            chartRenderer.createLineChart('test-canvas-realtime-stop'');
            chartRenderer.startRealtimeUpdate('test-canvas-realtime-stop', () => ({ data: [1] })');
            expect(chartRenderer.updateTimers.has('test-canvas-realtime-stop').toBe(true');
            chartRenderer.stopRealtimeUpdate('test-canvas-realtime-stop'');
            expect(chartRenderer.updateTimers.has('test-canvas-realtime-stop').toBe(false);
        }');
    }
    describe('Canvas フォールバック', (') => {
        test('Chart.jsが利用できない場合のフォールバック', () => {
            const fallbackRenderer = new ChartRenderer();
            fallbackRenderer.fallbackToCanvasRenderer();
            expect(fallbackRenderer.useCanvasFallback).toBe(true);
        }');
        test('Canvas APIで簡単な線グラフを描画できる', () => {
            chartRenderer.fallbackToCanvasRenderer(');
            const mockContext = mockCanvas.getContext('2d'');
            const data = { data: [10, 20, 15, 25] };
            
            const result = chartRenderer.drawSimpleLineChart('test-canvas', data);
            expect(result).toBe(true);
            expect(mockContext.clearRect).toHaveBeenCalled();
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.stroke).toHaveBeenCalled();
        }');
        test('データがない場合は描画しない', () => {
            chartRenderer.fallbackToCanvasRenderer(');
            const result = chartRenderer.drawSimpleLineChart('test-canvas', { data: [] });
            expect(result).toBe(false);
        }');
    }
    describe('統計機能', (') => {
        test('チャート統計を取得できる', (') => {
            chartRenderer.createLineChart('chart1'');
            chartRenderer.createBarChart('chart2'');
            chartRenderer.startRealtimeUpdate('chart1', () => ({ data: [1] }));
            const stats = chartRenderer.getChartStatistics();
            expect(stats.totalCharts).toBe(2);
            expect(stats.activeRealtimeCharts).toBe(1);
            expect(stats.chartTypes).toEqual({ line: 1, bar: 1 ),
            expect(stats.memoryUsage).toBeDefined();
        }');
        test('メモリ使用量を推定できる', (') => {
            chartRenderer.createLineChart('memory-test');
            const memoryUsage = chartRenderer.estimateMemoryUsage();
            expect(memoryUsage.estimatedDataPoints).toBeDefined();
            expect(memoryUsage.estimatedMemoryKB).toBeDefined();
        }');
    }
    describe('リソース管理', (') => {
        test('チャートを個別に削除できる', (') => {
            chartRenderer.createLineChart('destroy-test'');
            chartRenderer.startRealtimeUpdate('destroy-test', () => ({ data: [1] })');
            expect(chartRenderer.charts.has('destroy-test').toBe(true');
            chartRenderer.destroyChart('destroy-test'');
            expect(chartRenderer.charts.has('destroy-test').toBe(false');
            expect(chartRenderer.updateTimers.has('destroy-test').toBe(false);
            expect(mockChart.destroy).toHaveBeenCalled();
        }');
        test('destroy(')で全リソースを解放する', (') => {
            chartRenderer.createLineChart('test1'');
            chartRenderer.createBarChart('test2'');
            chartRenderer.startRealtimeUpdate('test1', () => ({ data: [1] }));
            expect(chartRenderer.charts.size).toBe(2);
            expect(chartRenderer.updateTimers.size).toBe(1);
            chartRenderer.destroy();
            expect(chartRenderer.charts.size).toBe(0);
            expect(chartRenderer.updateTimers.size).toBe(0);
        }');
    }
    describe('キャンバス管理', (') => {
        test('既存のキャンバスを取得する', (') => {
            const canvas = chartRenderer.getCanvas('existing-canvas');
            expect(document.getElementById').toHaveBeenCalledWith('existing-canvas');
            expect(canvas).toBe(mockCanvas);
        }');
        test('存在しないキャンバスを作成する', () => {
            document.getElementById.mockReturnValue(null');
            const mockCreatedCanvas = {
                id: '',
                width: 400,
                height: 300
            };
            document.createElement.mockReturnValue(mockCreatedCanvas');
            const canvas = chartRenderer.getCanvas('new-canvas');
            expect(document.createElement').toHaveBeenCalledWith('canvas');
            expect(mockCreatedCanvas.id').toBe('new-canvas');
            expect(canvas).toBe(mockCreatedCanvas);
        }');
    }
    describe('全チャート更新', (') => {
        test('全チャートを一括更新できる', (') => {
            chartRenderer.createLineChart('chart1'');
            chartRenderer.createLineChart('chart2'');
            chartRenderer.dataSourceCallbacks.set('chart1', () => ({ data: [1, 2, 3] })');
            chartRenderer.dataSourceCallbacks.set('chart2', () => ({ data: [4, 5, 6] });
            chartRenderer.updateAllCharts();
            expect(mockChart.update).toHaveBeenCalledTimes(2);
        }');
        test('エラーが発生しても他のチャートの更新は続行する', (') => {
            chartRenderer.createLineChart('chart1'');
            chartRenderer.createLineChart('chart2'');
            chartRenderer.dataSourceCallbacks.set('chart1', (') => { throw new Error('Test error'); }');
            chartRenderer.dataSourceCallbacks.set('chart2', () => ({ data: [1, 2, 3] });
            expect(() => chartRenderer.updateAllCharts().not.toThrow();
            expect(mockChart.update).toHaveBeenCalledTimes(1); // chart2のみ更新
        });
    }
}');