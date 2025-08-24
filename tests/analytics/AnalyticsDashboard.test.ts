import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';

/**
 * AnalyticsDashboard のテスト
 */

// 手動でモック
const mockChartRenderer = {
    createLineChart: jest.fn(() => ({ id: 'mock-line-chart' })),
    createBarChart: jest.fn(() => ({ id: 'mock-bar-chart' })),
    createPieChart: jest.fn(() => ({ id: 'mock-pie-chart' })),
    createDoughnutChart: jest.fn(() => ({ id: 'mock-doughnut-chart' })),
    updateChartData: jest.fn(() => true),
    destroy: jest.fn()
};

const mockDataVisualizer = {
    createScatterPlot: jest.fn(() => ({ id: 'mock-scatter-plot' })),
    createHeatmap: jest.fn(() => ({ id: 'mock-heatmap' })),
    destroy: jest.fn()
};

// モジュールを手動でモック
jest.doMock('../../src/analytics/ChartRenderer.js', () => ({
    ChartRenderer: jest.fn(() => mockChartRenderer)
}));

jest.doMock('../../src/analytics/DataVisualizer.js', () => ({
    DataVisualizer: jest.fn(() => mockDataVisualizer)
}));

import { AnalyticsDashboard } from '../../src/analytics/AnalyticsDashboard';

// DOM のモック
Object.defineProperty(global, 'document', {
    value: {
        getElementById: jest.fn(),
        createElement: jest.fn((tag: string) => ({
            tagName: tag.toUpperCase(),
            id: '',
            className: '',
            innerHTML: '',
            style: {},
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        }))
    },
    writable: true
});

describe('AnalyticsDashboard', () => {
    let dashboard: any;
    let mockContainer: any;

    beforeEach(() => {
        // コンテナ要素のモック
        mockContainer = {
            id: 'dashboard-container',
            innerHTML: '',
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        // document.getElementById のモック
        (global.document.getElementById as jest.Mock).mockReturnValue(mockContainer);

        dashboard = new AnalyticsDashboard('dashboard-container');
    });

    afterEach(() => {
        if (dashboard) {
            dashboard.destroy();
        }
        jest.clearAllMocks();
    });

    describe('コンストラクタ', () => {
        test('正しく初期化される', () => {
            expect(dashboard).toBeDefined();
            expect(dashboard.containerId).toBe('dashboard-container');
            expect(dashboard.container).toBe(mockContainer);
        });

        test('コンテナが見つからない場合のエラー処理', () => {
            (global.document.getElementById as jest.Mock).mockReturnValue(null);
            
            expect(() => {
                new AnalyticsDashboard('nonexistent-container');
            }).toThrow('Dashboard container not found: nonexistent-container');
        });
    });

    describe('チャートレンダリング', () => {
        test('線グラフが作成される', async () => {
            const chartData = {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: [{
                    label: 'Sessions',
                    data: [100, 150, 200]
                }]
            };

            const chartConfig = {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true
                }
            };

            const chart = await dashboard.createChart('line-chart', chartConfig);
            
            expect(mockChartRenderer.createLineChart).toHaveBeenCalledWith('line-chart', chartConfig);
            expect(chart).toEqual({ id: 'mock-line-chart' });
        });

        test('棒グラフが作成される', async () => {
            const chartData = {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'Revenue',
                    data: [1000, 1500, 1200, 1800]
                }]
            };

            const chartConfig = {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true
                }
            };

            const chart = await dashboard.createChart('bar-chart', chartConfig);
            
            expect(mockChartRenderer.createBarChart).toHaveBeenCalledWith('bar-chart', chartConfig);
            expect(chart).toEqual({ id: 'mock-bar-chart' });
        });

        test('円グラフが作成される', async () => {
            const chartData = {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [60, 35, 5],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            };

            const chartConfig = {
                type: 'pie',
                data: chartData
            };

            const chart = await dashboard.createChart('pie-chart', chartConfig);
            
            expect(mockChartRenderer.createPieChart).toHaveBeenCalledWith('pie-chart', chartConfig);
            expect(chart).toEqual({ id: 'mock-pie-chart' });
        });
    });

    describe('データ視覚化', () => {
        test('散布図が作成される', async () => {
            const scatterData = {
                datasets: [{
                    label: 'Score vs Time',
                    data: [
                        { x: 10, y: 20 },
                        { x: 15, y: 30 },
                        { x: 20, y: 25 }
                    ]
                }]
            };

            const visualization = await dashboard.createVisualization('scatter', 'scatter-plot', scatterData);
            
            expect(mockDataVisualizer.createScatterPlot).toHaveBeenCalledWith('scatter-plot', scatterData);
            expect(visualization).toEqual({ id: 'mock-scatter-plot' });
        });

        test('ヒートマップが作成される', async () => {
            const heatmapData = {
                data: [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ],
                labels: {
                    x: ['A', 'B', 'C'],
                    y: ['1', '2', '3']
                }
            };

            const visualization = await dashboard.createVisualization('heatmap', 'heatmap-viz', heatmapData);
            
            expect(mockDataVisualizer.createHeatmap).toHaveBeenCalledWith('heatmap-viz', heatmapData);
            expect(visualization).toEqual({ id: 'mock-heatmap' });
        });
    });

    describe('データ更新', () => {
        test('チャートデータが更新される', async () => {
            const initialData = {
                labels: ['A', 'B', 'C'],
                datasets: [{
                    data: [1, 2, 3]
                }]
            };

            const updatedData = {
                labels: ['A', 'B', 'C', 'D'],
                datasets: [{
                    data: [1, 2, 3, 4]
                }]
            };

            // チャートを作成
            await dashboard.createChart('update-chart', {
                type: 'bar',
                data: initialData
            });

            // データを更新
            const result = await dashboard.updateChart('update-chart', updatedData);
            
            expect(mockChartRenderer.updateChartData).toHaveBeenCalledWith('update-chart', updatedData);
            expect(result).toBe(true);
        });

        test('存在しないチャートの更新時のエラー処理', async () => {
            const result = await dashboard.updateChart('nonexistent-chart', { data: [] });
            
            expect(result).toBe(false);
        });
    });

    describe('レイアウト管理', () => {
        test('ダッシュボードレイアウトが設定される', () => {
            const layout = {
                columns: 2,
                rows: 2,
                gap: '10px'
            };

            dashboard.setLayout(layout);
            
            expect(dashboard.layout).toEqual(layout);
            expect(mockContainer.style.display).toBe('grid');
            expect(mockContainer.style.gridTemplateColumns).toBe('1fr 1fr');
            expect(mockContainer.style.gridTemplateRows).toBe('1fr 1fr');
            expect(mockContainer.style.gap).toBe('10px');
        });

        test('チャートコンテナが追加される', () => {
            const chartId = 'new-chart';
            const config = {
                position: { row: 1, column: 1 },
                size: { width: '100%', height: '300px' }
            };

            dashboard.addChartContainer(chartId, config);
            
            expect(global.document.createElement).toHaveBeenCalledWith('div');
            expect(mockContainer.appendChild).toHaveBeenCalled();
        });
    });

    describe('インタラクティブ機能', () => {
        test('フィルターが適用される', () => {
            const filter = {
                dateRange: {
                    start: new Date('2023-01-01'),
                    end: new Date('2023-12-31')
                },
                categories: ['session', 'interaction'],
                minValue: 0,
                maxValue: 1000
            };

            dashboard.applyFilter(filter);
            
            expect(dashboard.currentFilter).toEqual(filter);
        });

        test('フィルターリセット', () => {
            const filter = { categories: ['session'] };
            dashboard.applyFilter(filter);
            
            dashboard.resetFilter();
            
            expect(dashboard.currentFilter).toEqual({});
        });

        test('ズーム機能', () => {
            const zoomConfig = {
                chartId: 'zoom-chart',
                level: 1.5,
                center: { x: 100, y: 100 }
            };

            const result = dashboard.zoomChart(zoomConfig);
            
            expect(result).toBe(true);
            expect(dashboard.zoomStates['zoom-chart']).toEqual(zoomConfig);
        });
    });

    describe('エクスポート機能', () => {
        test('ダッシュボードがPNG形式でエクスポートされる', async () => {
            const exportOptions = {
                format: 'png',
                width: 1200,
                height: 800,
                quality: 0.9
            };

            const mockCanvas = {
                toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock-image-data')
            };

            // html2canvas のモック
            (global as any).html2canvas = jest.fn().mockResolvedValue(mockCanvas);

            const result = await dashboard.exportDashboard(exportOptions);
            
            expect(result.success).toBe(true);
            expect(result.data).toBe('data:image/png;base64,mock-image-data');
            expect(result.format).toBe('png');
        });

        test('個別チャートのエクスポート', async () => {
            const exportOptions = {
                chartId: 'export-chart',
                format: 'jpg',
                quality: 0.8
            };

            const result = await dashboard.exportChart(exportOptions);
            
            expect(result).toBeDefined();
        });
    });

    describe('リアルタイム更新', () => {
        test('リアルタイム更新が開始される', () => {
            const updateConfig = {
                interval: 5000,
                charts: ['chart1', 'chart2'],
                dataSource: 'ws://localhost:8080/analytics'
            };

            dashboard.startRealTimeUpdates(updateConfig);
            
            expect(dashboard.realTimeConfig).toEqual(updateConfig);
            expect(dashboard.isRealTimeActive).toBe(true);
        });

        test('リアルタイム更新が停止される', () => {
            const updateConfig = {
                interval: 5000,
                charts: ['chart1', 'chart2']
            };

            dashboard.startRealTimeUpdates(updateConfig);
            dashboard.stopRealTimeUpdates();
            
            expect(dashboard.isRealTimeActive).toBe(false);
        });
    });

    describe('レスポンシブ機能', () => {
        test('画面サイズに応じてレイアウトが調整される', () => {
            const mockResizeEvent = new Event('resize');
            Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
            Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });

            dashboard.enableResponsive();
            window.dispatchEvent(mockResizeEvent);
            
            expect(dashboard.responsiveLayout).toBe(true);
        });

        test('モバイルレイアウトに切り替わる', () => {
            Object.defineProperty(window, 'innerWidth', { value: 480, writable: true });
            
            dashboard.adjustLayoutForScreen();
            
            expect(dashboard.currentBreakpoint).toBe('mobile');
        });
    });

    describe('パフォーマンス', () => {
        test('大量データの描画が最適化される', async () => {
            const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
                x: i,
                y: Math.random() * 1000
            }));

            const startTime = Date.now();
            
            await dashboard.createChart('performance-chart', {
                type: 'line',
                data: {
                    datasets: [{
                        data: largeDataset
                    }]
                },
                options: {
                    optimization: {
                        enabled: true,
                        sampling: true
                    }
                }
            });

            const endTime = Date.now();
            const renderTime = endTime - startTime;
            
            expect(renderTime).toBeLessThan(2000); // 2秒以内
        });

        test('仮想化が適用される', () => {
            const virtualizationConfig = {
                enabled: true,
                itemHeight: 50,
                containerHeight: 500,
                buffer: 5
            };

            dashboard.enableVirtualization(virtualizationConfig);
            
            expect(dashboard.virtualizationEnabled).toBe(true);
            expect(dashboard.virtualizationConfig).toEqual(virtualizationConfig);
        });
    });

    describe('アクセシビリティ', () => {
        test('ARIA属性が設定される', () => {
            dashboard.enableAccessibility();
            
            expect(mockContainer.setAttribute).toHaveBeenCalledWith('role', 'application');
            expect(mockContainer.setAttribute).toHaveBeenCalledWith('aria-label', 'Analytics Dashboard');
        });

        test('キーボードナビゲーションが有効になる', () => {
            dashboard.enableKeyboardNavigation();
            
            expect(mockContainer.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('スクリーンリーダー対応', () => {
            const chartSummary = dashboard.generateChartSummary('accessibility-chart');
            
            expect(chartSummary).toBeDefined();
            expect(typeof chartSummary).toBe('string');
        });
    });

    describe('エラーハンドリング', () => {
        test('チャート作成エラーが適切に処理される', async () => {
            mockChartRenderer.createLineChart.mockRejectedValueOnce(new Error('Chart creation failed'));
            
            const result = await dashboard.createChart('error-chart', {
                type: 'line',
                data: { datasets: [] }
            });
            
            expect(result).toBeNull();
        });

        test('データ更新エラーが適切に処理される', async () => {
            mockChartRenderer.updateChartData.mockReturnValueOnce(false);
            
            const result = await dashboard.updateChart('error-update', { data: [] });
            
            expect(result).toBe(false);
        });
    });

    describe('リソース管理', () => {
        test('destroy メソッドがリソースを適切にクリーンアップする', () => {
            dashboard.destroy();
            
            expect(mockChartRenderer.destroy).toHaveBeenCalled();
            expect(mockDataVisualizer.destroy).toHaveBeenCalled();
        });
    });
});