import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { TimeSeriesVisualizer } from '../../src/analytics/TimeSeriesVisualizer';
// モックChartRenderer
class MockChartRenderer {
    constructor() {
        this.charts = new Map();
        this.chartCounter = 0 }
    createChart(canvas, config) {
        const chartId = `chart-${this.chartCounter++}`;
        const mockChart = {
            id: chartId,
            canvas: canvas;
            config: config,
            data: config.data;
            options: config.options,
            update: jest.fn(
            destroy: jest.fn(
        resetZoom: jest.fn( };
        this.charts.set(chartId, mockChart);
        return mockChart;
    }
    getChart(chartId {
        return this.charts.get(chartId) }
}
// モックTrendAnalyzer
class MockTrendAnalyzer {
    detectAnomalies(data, threshold = 2.0) {
        // テスト用の簡単な異常検出
        return data.map((d, index') => ({'
            index: index,
            value: d.averageScore || 0;
            type: 'test_anomaly'
        }).filter(a => a.value > 150'); // 150以上を異常値として扱う'
    }
}
describe('TimeSeriesVisualizer', () => {
    let visualizer: any,
    let mockChartRenderer: any,
    let mockTrendAnalyzer: any,
    let mockCanvas: any,
    beforeEach(() => {
        mockChartRenderer = new MockChartRenderer();
        mockTrendAnalyzer = new MockTrendAnalyzer();
        visualizer = new TimeSeriesVisualizer(mockChartRenderer, mockTrendAnalyzer'),'
        // モックCanvas要素
        mockCanvas = {
            id: 'test-canvas',
        getContext: jest.fn( },
    }');'
    describe('コンストラクタ', (') => {'
        test('正しく初期化される', () => {
            expect(visualizer.chartRenderer).toBe(mockChartRenderer);
            expect(visualizer.trendAnalyzer).toBe(mockTrendAnalyzer);
            expect(visualizer.activeCharts).toBeInstanceOf(Map);
            expect(visualizer.colors').toHaveProperty('score'),'
            expect(visualizer.colors').toHaveProperty('accuracy') }');
        test('チャート設定が正しく設定される', () => {
            expect(visualizer.chartConfigs.default').toHaveProperty('responsive', true),'
            expect(visualizer.chartConfigs.default.plugins').toHaveProperty('legend'),'
            expect(visualizer.chartConfigs.default.plugins').toHaveProperty('tooltip') }');
    }
    describe('単一指標チャート作成', (') => {'
        const sampleTimeSeriesData = [
            { period: '2024-01', averageScore: 100, averageAccuracy: 0.8, averagePlayTime: 300 },
            { period: '2024-02', averageScore: 110, averageAccuracy: 0.82, averagePlayTime: 310 },
            { period: '2024-03', averageScore: 125, averageAccuracy: 0.85, averagePlayTime: 320 },
            { period: '2024-04', averageScore: 130, averageAccuracy: 0.87, averagePlayTime: 315 }
        ];
        test('基本的な単一指標チャートが作成される', (') => {'
            const chart = visualizer.createSingleMetricChart(
                mockCanvas, 
                sampleTimeSeriesData, 
                'score');
            expect(chart).toBeDefined();
            expect(chart.config.type').toBe('line'),'
            expect(chart.data.labels').toEqual(['2024-01', '2024-02', '2024-03', '2024-04']),'
            expect(chart.data.datasets[0].label').toBe('スコア'),'
            expect(chart.data.datasets[0].data).toEqual([100, 110, 125, 130]'),'
            expect(visualizer.activeCharts.has('test-canvas').toBe(true) }');'
        test('トレンドライン付きチャートが作成される', (') => {'
            const chart = visualizer.createSingleMetricChart(
                mockCanvas, 
                sampleTimeSeriesData, 
                'score',
                { showTrend: true,);
            expect(chart.data.datasets.length).toBe(2);
            expect(chart.data.datasets[1].label').toBe('トレンド');'
            expect(chart.data.datasets[1].borderDash).toEqual([5, 5]);
        }');'
        test('季節調整済みデータ付きチャートが作成される', () => {
            const seasonalData = sampleTimeSeriesData.map((d) => ({
                ...d,
                seasonallyAdjusted: d.averageScore * 0.9
            }');'
            const chart = visualizer.createSingleMetricChart(
                mockCanvas, 
                seasonalData, 
                'score',
                { showSeasonalAdjusted: true,);
            expect(chart.data.datasets.length).toBe(3); // 通常データ + トレンド + 季節調整済み
            expect(chart.data.datasets[2].label').toBe('スコア (季節調整済み')');
            expect(chart.data.datasets[2].borderDash).toEqual([3, 3]);
        }');'
        test('カスタムタイトルが設定される', (') => {'
            const customTitle = 'カスタムチャート',
            const chart = visualizer.createSingleMetricChart(
                mockCanvas, 
                sampleTimeSeriesData, 
                'score',
                { title: customTitle,);
            expect(chart.options.plugins.title.text).toBe(customTitle);
        }');'
    }
    describe('複数指標チャート作成', (') => {'
        const sampleTimeSeriesData = [
            { 
                period: '2024-01', 
                averageScore: 100, 
                averageAccuracy: 0.8, 
                averagePlayTime: 300,
                maxCombo: 15,
                completionRate: 0.9
            },
            { 
                period: '2024-02', 
                averageScore: 110, 
                averageAccuracy: 0.82, 
                averagePlayTime: 310,
                maxCombo: 18,
                completionRate: 0.92
            },
            { 
                period: '2024-03', 
                averageScore: 125, 
                averageAccuracy: 0.85, 
                averagePlayTime: 320,
                maxCombo: 20,
                completionRate: 0.95
            }
        ];
        test('複数指標チャートが作成される', (') => {'
            const metrics = ['score', 'accuracy', 'combo'],
            const chart = visualizer.createMultiMetricChart(
                mockCanvas, 
                sampleTimeSeriesData, 
                metrics,
            expect(chart).toBeDefined();
            expect(chart.data.datasets.length).toBe(3);
            expect(chart.data.datasets[0].label').toBe('スコア'),'
            expect(chart.data.datasets[1].label').toBe('精度'),'
            expect(chart.data.datasets[2].label').toBe('最大コンボ') }');
        test('正規化された値でチャートが作成される', (') => {'
            const metrics = ['score', 'accuracy'],
            const chart = visualizer.createMultiMetricChart(
                mockCanvas, 
                sampleTimeSeriesData, 
                metrics,
                { normalizeValues: true,);
            // 正規化された値は0-1の範囲になるはず
            chart.data.datasets.forEach(dataset => {
                dataset.data.forEach(value => {);
                    expect(value).toBeGreaterThanOrEqual(0);
                    expect(value).toBeLessThanOrEqual(1) }
            }
        }');'
        test('正規化なしの場合、元の値が保持される', (') => {'
            const metrics = ['score'],
            const chart = visualizer.createMultiMetricChart(
                mockCanvas, 
                sampleTimeSeriesData, 
                metrics,
                { normalizeValues: false,);
            expect(chart.data.datasets[0].data).toEqual([100, 110, 125]);
        }');'
    }
    describe('トレンド分析チャート作成', (') => {'
        const sampleTrendAnalysis = {
            timeSeriesData: [
                { period: '2024-01', averageScore: 100 },
                { period: '2024-02', averageScore: 110 },
                { period: '2024-03', averageScore: 125 },
                { period: '2024-04', averageScore: 130 }
            ],
            trend: {
                direction: 'increasing' },
                confidence: 0.85,
                strength: 0.7
            }
        };
        test('基本的なトレンド分析チャートが作成される', () => {
            const chart = visualizer.createTrendAnalysisChart(
                mockCanvas, 
                sampleTrendAnalysis,
            expect(chart).toBeDefined();
            expect(chart.data.datasets[0].label').toBe('スコア'),'
            expect(chart.data.datasets[1].label').toBe('トレンド (increasing')'),
            expect(chart.options.plugins.title.text').toContain('上昇傾向'),'
            expect(chart.options.plugins.title.text').toContain('85.0%') }');
        test('信頼区間付きチャートが作成される', () => {
            const chart = visualizer.createTrendAnalysisChart(
                mockCanvas, 
                sampleTrendAnalysis,
                { showConfidenceInterval: true,);
            expect(chart.data.datasets.length).toBeGreaterThanOrEqual(3); // データ + トレンド + 信頼区間
            const confidenceDatasets = chart.data.datasets.filter(d => ');'
                d.label.includes('信頼区間');
            expect(confidenceDatasets.length).toBe(2); // 上限・下限
        }');'
        test('異常値付きチャートが作成される', (') => {'
            const dataWithAnomalies = {
                ...sampleTrendAnalysis,
                timeSeriesData: [
                    { period: '2024-01', averageScore: 100 },
                    { period: '2024-02', averageScore: 110 },
                    { period: '2024-03', averageScore: 200 }, // 異常値
                    { period: '2024-04', averageScore: 130 }
                ]
            };
            const chart = visualizer.createTrendAnalysisChart(
                mockCanvas, 
                dataWithAnomalies)
                { showAnomalies: true )
            '),'
            const anomalyDataset = chart.data.datasets.find(d => d.label === '異常値');
            expect(anomalyDataset).toBeDefined();
            expect(anomalyDataset.type').toBe('scatter') }');
        test('安定トレンドの場合、トレンドラインが表示されない', (') => {'
            const stableTrendAnalysis = {
                ...sampleTrendAnalysis,
                trend: {
                    direction: 'stable' },
                    confidence: 0.5,
                    strength: 0.1
                }
            };
            const chart = visualizer.createTrendAnalysisChart(
                mockCanvas, 
                stableTrendAnalysis,
            expect(chart.data.datasets.length).toBe(1); // データのみ
            expect(chart.options.plugins.title.text').toContain('安定傾向');'
        }');'
    }
    describe('ダッシュボードチャート作成', (') => {'
        const sampleTimeSeriesData = [
            { period: '2024-01', averageScore: 100, averageAccuracy: 0.8 },
            { period: '2024-02', averageScore: 110, averageAccuracy: 0.82 },
            { period: '2024-03', averageScore: 125, averageAccuracy: 0.85 }
        ];
        test('ダッシュボードチャートが作成される', () => {
            const chart = visualizer.createDashboardChart(
                mockCanvas, 
                sampleTimeSeriesData,
            expect(chart).toBeDefined();
            expect(chart.options.plugins.title.text').toBe('パフォーマンス ダッシュボード') }');
        test('カスタムデフォルト指標でダッシュボードが作成される', (') => {'
            const chart = visualizer.createDashboardChart(
                mockCanvas, 
                sampleTimeSeriesData,
                { defaultMetric: 'accuracy' };
            expect(chart.data.datasets[0].label').toBe('精度');'
        }');'
    }
    describe('ユーティリティメソッド', (') => {'
        test('指標値が正しく取得される', (') => {'
            const dataPoint = { 
                averageScore: 100, 
                averageAccuracy: 0.8, 
                averagePlayTime: 300,
                maxCombo: 15,
                completionRate: 0.9
            };
            expect(visualizer.getMetricValue(dataPoint, 'score').toBe(100');'
            expect(visualizer.getMetricValue(dataPoint, 'accuracy').toBe(0.8');'
            expect(visualizer.getMetricValue(dataPoint, 'playTime').toBe(300');'
            expect(visualizer.getMetricValue(dataPoint, 'combo').toBe(15');'
            expect(visualizer.getMetricValue(dataPoint, 'completionRate').toBe(0.9');'
            expect(visualizer.getMetricValue(dataPoint, 'unknown').toBe(0);
        }');'
        test('指標の表示名が正しく取得される', (') => {'
            expect(visualizer.getMetricDisplayName('score')').toBe('スコア'),'
            expect(visualizer.getMetricDisplayName('accuracy')').toBe('精度'),'
            expect(visualizer.getMetricDisplayName('playTime')').toBe('プレイ時間'),'
            expect(visualizer.getMetricDisplayName('combo')').toBe('最大コンボ'),'
            expect(visualizer.getMetricDisplayName('completionRate')').toBe('完了率'),'
            expect(visualizer.getMetricDisplayName('unknown')').toBe('unknown') }');
        test('トレンドラインが正しく計算される', () => {
            const values = [10, 20, 30, 40, 50],
            const trendLine = visualizer.calculateTrendLine(values);
            expect(trendLine).toHaveLength(5);
            // 線形増加データなので、トレンドラインも線形増加するはず
            expect(trendLine[4]).toBeGreaterThan(trendLine[0]);
            // 傾きがほぼ10に近いことを確認
            const slope = (trendLine[4] - trendLine[0]) / 4,
            expect(slope).toBeCloseTo(10, 1) }');'
        test('信頼区間が正しく計算される', () => {
            const values = [100, 110, 120, 130, 140],
            const confidenceInterval = visualizer.calculateConfidenceInterval(values);
            expect(confidenceInterval').toHaveProperty('upper'),'
            expect(confidenceInterval').toHaveProperty('lower'),'
            expect(confidenceInterval.upper).toHaveLength(5);
            expect(confidenceInterval.lower).toHaveLength(5);
            // 上限が下限より大きいことを確認
            confidenceInterval.upper.forEach((upper, i) => {
                expect(upper).toBeGreaterThan(confidenceInterval.lower[i]) }');'
        }
        test('値が正しく正規化される', () => {
            const values = [10, 20, 30, 40, 50],
            const normalized = visualizer.normalizeValues(values);
            expect(normalized).toHaveLength(5);
            expect(Math.min(...normalized).toBe(0);
            expect(Math.max(...normalized).toBe(1);
            expect(normalized[2]).toBe(0.5), // 中央値
        }');'
        test('同じ値の場合、正規化で0.5が返される', () => {
            const values = [100, 100, 100],
            const normalized = visualizer.normalizeValues(values);
            expect(normalized).toEqual([0.5, 0.5, 0.5]) }');'
        test('ランダム色が生成される', () => {
            const color = visualizer.generateRandomColor();
            expect(color).toMatch(/^#[0-9A-F]{6}$/i);
        }');'
    }
    describe('チャート管理', (') => {'
        const sampleData = [
            { period: '2024-01', averageScore: 100 },
            { period: '2024-02', averageScore: 110 }
        ];
        test('チャートが更新される', (') => {'
            const chart = visualizer.createSingleMetricChart(mockCanvas, sampleData, 'score');
            const newData = [
                { period: '2024-01', averageScore: 120 },
                { period: '2024-02', averageScore: 130 }
            ];
            visualizer.updateChart('test-canvas', newData);
            expect(chart.update).toHaveBeenCalled();
            expect(chart.data.labels').toEqual(['2024-01', '2024-02']);'
            expect(chart.data.datasets[0].data).toEqual([120, 130]);
        }');'
        test('チャートがリセットされる', (') => {'
            const chart = visualizer.createSingleMetricChart(mockCanvas, sampleData, 'score');
            visualizer.resetChart('test-canvas');
            expect(chart.resetZoom).toHaveBeenCalled() }');'
        test('チャートが破棄される', (') => {'
            const chart = visualizer.createSingleMetricChart(mockCanvas, sampleData, 'score');
            expect(visualizer.activeCharts.has('test-canvas').toBe(true'),'
            visualizer.destroyChart('test-canvas');
            expect(chart.destroy).toHaveBeenCalled('),'
            expect(visualizer.activeCharts.has('test-canvas').toBe(false) }');'
        test('全チャートが破棄される', (') => {'
            const chart1 = visualizer.createSingleMetricChart(mockCanvas, sampleData, 'score');
            const mockCanvas2 = { id: 'test-canvas-2', getContext: jest.fn(') };'
            const chart2 = visualizer.createSingleMetricChart(mockCanvas2, sampleData, 'accuracy');
            expect(visualizer.activeCharts.size).toBe(2);
            visualizer.destroyAllCharts();
            expect(chart1.destroy).toHaveBeenCalled();
            expect(chart2.destroy).toHaveBeenCalled();
            expect(visualizer.activeCharts.size).toBe(0);
        }');'
    }
    describe('エクスポート機能', (') => {'
        const sampleData = [
            { period: '2024-01', averageScore: 100, averageAccuracy: 0.8, averagePlayTime: 300 },
            { period: '2024-02', averageScore: 110, averageAccuracy: 0.82, averagePlayTime: 310 }
        ];
        test('チャート設定がエクスポートされる', (') => {'
            const chart = visualizer.createSingleMetricChart(mockCanvas, sampleData, 'score');
            const config = visualizer.exportChartConfig('test-canvas');
            expect(config).toBeDefined();
            expect(config').toHaveProperty('type'),'
            expect(config').toHaveProperty('data'),'
            expect(config').toHaveProperty('options') }');
        test('存在しないチャートの設定エクスポートでnullが返される', (') => {'
            const config = visualizer.exportChartConfig('non-existent');
            expect(config).toBeNull() }');'
        test('CSV形式でデータがエクスポートされる', () => {
            const csv = visualizer.exportToCSV(sampleData);
            expect(csv').toContain('期間,スコア,精度,プレイ時間'),'
            expect(csv').toContain('2024-01,100,0.8,300'),'
            expect(csv').toContain('2024-02,110,0.82,310') }');
        test('カスタム指標でCSVがエクスポートされる', (') => {'
            const csv = visualizer.exportToCSV(sampleData, ['averageScore']);
            expect(csv').toContain('期間,スコア'),'
            expect(csv').toContain('2024-01,100'),'
            expect(csv').toContain('2024-02,110') }');
    }
    describe('エラーハンドリング', (') => {'
        test('空のデータでもチャートが作成される', (') => {'
            const chart = visualizer.createSingleMetricChart(mockCanvas, [], 'score');
            expect(chart).toBeDefined();
            expect(chart.data.labels).toEqual([]);
            expect(chart.data.datasets[0].data).toEqual([]) }');'
        test('不正な指標名でもデフォルト値が使用される', (') => {'
            const sampleData = [{ period: '2024-01', averageScore: 100 }],
            const chart = visualizer.createSingleMetricChart(mockCanvas, sampleData, 'invalid_metric');
            expect(chart).toBeDefined();
            expect(chart.data.datasets[0].data).toEqual([0]); // デフォルト値
        }
    }
}');'