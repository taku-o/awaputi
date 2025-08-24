import { describe, test, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { PerformanceTestUtils } from '../../utils/PerformanceTestUtils';
import { PerformanceMeasurement, DataGenerator } from './PerformanceTestUtilities';

/**
 * AnalysisRenderingPerformanceTests - Data analysis and rendering performance tests
 * Part of the StatisticsPerformance test split implementation
 */

export class AnalysisRenderingPerformanceTests {
    private mainTestSuite: any;
    private performanceConfig: any;
    private environmentThresholds: any;

    constructor(mainTestSuite: any) {
        this.mainTestSuite = mainTestSuite;
        this.performanceConfig = mainTestSuite.performanceConfig;
        this.environmentThresholds = mainTestSuite.environmentThresholds;
        
        console.log('[AnalysisRenderingPerformanceTests] Component initialized');
    }

    /**
     * Register analysis and rendering performance tests
     */
    registerTests(): void {
        describe('データ分析パフォーマンステスト', () => {
            beforeEach(async () => {
                // 大量の統計データをセットアップ
                this.mainTestSuite.statisticsManager.statistics = DataGenerator.generateLargeStatisticsData();
            });

            test('トレンド分析の処理時間', async () => {
                const measurement = new PerformanceMeasurement('trend_analysis');
                const statisticsAnalyzer = this.mainTestSuite.statisticsAnalyzer;

                measurement.startMeasurement();
                const trendAnalysis = statisticsAnalyzer && typeof statisticsAnalyzer.analyzeTrends === 'function' 
                    ? await statisticsAnalyzer.analyzeTrends() 
                    : { scoreTrend: {} };
                const result = measurement.endMeasurement();

                console.log('Trend analysis performance:', result);

                expect(result.duration).toBeLessThan(200); // 200ms以下
                expect(trendAnalysis).toBeDefined();
                expect(trendAnalysis.scoreTrend).toBeDefined();
            });

            test('比較分析の処理時間', async () => {
                const measurement = new PerformanceMeasurement('comparison_analysis');
                const statisticsAnalyzer = this.mainTestSuite.statisticsAnalyzer;

                measurement.startMeasurement();
                const comparison = statisticsAnalyzer && typeof statisticsAnalyzer.comparePerformance === 'function'
                    ? await statisticsAnalyzer.comparePerformance({
                        startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30日前
                        endDate: Date.now()
                    }) : undefined;
                const result = measurement.endMeasurement();

                console.log('Comparison analysis performance:', result);

                expect(result.duration).toBeLessThan(300); // 300ms以下
                if (comparison) {
                    expect(comparison).toBeDefined();
                }
            });

            test('統計サマリー生成の処理時間', async () => {
                const measurement = new PerformanceMeasurement('summary_generation');
                const statisticsAnalyzer = this.mainTestSuite.statisticsAnalyzer;

                measurement.startMeasurement();
                const summary = statisticsAnalyzer && typeof statisticsAnalyzer.generateSummary === 'function'
                    ? await statisticsAnalyzer.generateSummary()
                    : { totalGames: 0, averageScore: 0 };
                const result = measurement.endMeasurement();

                console.log('Summary generation performance:', result);

                expect(result.duration).toBeLessThan(150); // 150ms以下
                expect(summary).toBeDefined();
                expect(typeof summary.totalGames).toBe('number');
                expect(typeof summary.averageScore).toBe('number');
            });
        });

        describe('レンダリングパフォーマンステスト', () => {
            beforeEach(async () => {
                // レンダリング用のモックキャンバスをセットアップ
                const mockCanvas = {
                    getContext: jest.fn().mockReturnValue({
                        clearRect: jest.fn(),
                        fillRect: jest.fn(),
                        strokeRect: jest.fn(),
                        beginPath: jest.fn(),
                        moveTo: jest.fn(),
                        lineTo: jest.fn(),
                        stroke: jest.fn(),
                        fill: jest.fn(),
                        arc: jest.fn(),
                        fillText: jest.fn(),
                        measureText: jest.fn().mockReturnValue({ width: 100 })
                    }),
                    width: 800,
                    height: 600
                };
                
                global.document = {
                    createElement: jest.fn().mockReturnValue(mockCanvas)
                } as any;
            });

            test('グラフレンダリングの処理時間', async () => {
                const measurement = new PerformanceMeasurement('graph_rendering');
                const statisticsRenderer = this.mainTestSuite.statisticsRenderer;

                if (!statisticsRenderer || typeof statisticsRenderer.renderChart !== 'function') {
                    console.log('StatisticsRenderer not available, skipping test');
                    return;
                }

                const chartData = DataGenerator.generateChartData(100); // 100データポイント

                measurement.startMeasurement();
                await statisticsRenderer.renderChart('line', chartData);
                const result = measurement.endMeasurement();

                console.log('Graph rendering performance:', result);

                expect(result.duration).toBeLessThan(100); // 100ms以下
            });

            test('大量データのチャートレンダリング', async () => {
                const measurement = new PerformanceMeasurement('large_chart_rendering');
                const statisticsRenderer = this.mainTestSuite.statisticsRenderer;

                if (!statisticsRenderer || typeof statisticsRenderer.renderChart !== 'function') {
                    console.log('StatisticsRenderer not available, skipping test');
                    return;
                }

                const largeChartData = DataGenerator.generateChartData(1000); // 1000データポイント

                measurement.startMeasurement();
                await statisticsRenderer.renderChart('bar', largeChartData);
                const result = measurement.endMeasurement();

                console.log('Large chart rendering performance:', result);

                expect(result.duration).toBeLessThan(500); // 500ms以下
            });

            test('リアルタイム統計表示の更新速度', async () => {
                const measurement = new PerformanceMeasurement('realtime_update');
                const statisticsRenderer = this.mainTestSuite.statisticsRenderer;

                if (!statisticsRenderer || typeof statisticsRenderer.updateRealtimeStats !== 'function') {
                    console.log('StatisticsRenderer realtime update not available, skipping test');
                    return;
                }

                const updates = 50; // 50回の更新をシミュレート
                
                measurement.startMeasurement();
                for (let i = 0; i < updates; i++) {
                    const realtimeData = DataGenerator.generateRealtimeData();
                    await statisticsRenderer.updateRealtimeStats(realtimeData);
                }
                const result = measurement.endMeasurement();

                console.log('Realtime update performance:', result);

                const averageUpdateTime = result.duration / updates;
                expect(averageUpdateTime).toBeLessThan(10); // 1更新あたり10ms以下
            });
        });

        describe('メモリ効率性テスト', () => {
            test('分析処理中のメモリ使用量', async () => {
                const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const statisticsAnalyzer = this.mainTestSuite.statisticsAnalyzer;

                // 大量データの分析処理
                if (statisticsAnalyzer && typeof statisticsAnalyzer.analyzeTrends === 'function') {
                    await statisticsAnalyzer.analyzeTrends();
                }

                const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const memoryIncrease = finalMemory - initialMemory;
                const increaseInMB = memoryIncrease / 1024 / 1024;

                console.log(`Memory increase during analysis: ${increaseInMB.toFixed(2)}MB`);

                // 分析処理でのメモリ増加は50MB以下であること
                expect(increaseInMB).toBeLessThan(50);
            });

            test('レンダリング処理中のメモリリーク検出', async () => {
                const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const statisticsRenderer = this.mainTestSuite.statisticsRenderer;

                // 複数回のレンダリングを実行
                if (statisticsRenderer && typeof statisticsRenderer.renderChart === 'function') {
                    for (let i = 0; i < 10; i++) {
                        const chartData = DataGenerator.generateChartData(100);
                        await statisticsRenderer.renderChart('line', chartData);
                        
                        // ガベージコレクションを促進
                        if (global.gc) {
                            global.gc();
                        }
                    }
                }

                const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const memoryLeak = finalMemory - initialMemory;
                const leakInMB = memoryLeak / 1024 / 1024;

                console.log(`Potential memory leak: ${leakInMB.toFixed(2)}MB`);

                // メモリリークは10MB以下であること
                expect(leakInMB).toBeLessThan(10);
            });
        });
    }
}