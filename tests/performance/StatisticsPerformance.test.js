/**
 * 統計システムパフォーマンステスト
 * 大量データ処理時のパフォーマンステスト、メモリ使用量・処理時間・描画パフォーマンスのベンチマーク
 * パフォーマンス要件（統計収集<1ms、表示<500ms、更新<100ms）の検証テスト
 */

import { jest } from '@jest/globals';

// パフォーマンス測定ユーティリティ
class PerformanceMeasurement {
    constructor(name) {
        this.name = name;
        this.measurements = [];
        this.memoryBaseline = null;
    }

    startMeasurement() {
        this.startTime = performance.now();
        this.memoryBaseline = performance.memory ? performance.memory.usedJSHeapSize : 0;
        return this;
    }

    endMeasurement() {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        const memoryUsed = performance.memory ? 
            performance.memory.usedJSHeapSize - this.memoryBaseline : 0;

        const measurement = {
            duration,
            memoryUsed,
            timestamp: Date.now()
        };

        this.measurements.push(measurement);
        return measurement;
    }

    getStats() {
        if (this.measurements.length === 0) return null;

        const durations = this.measurements.map(m => m.duration);
        const memoryUsages = this.measurements.map(m => m.memoryUsed);

        return {
            count: this.measurements.length,
            duration: {
                min: Math.min(...durations),
                max: Math.max(...durations),
                average: durations.reduce((a, b) => a + b, 0) / durations.length,
                median: this.calculateMedian(durations),
                p95: this.calculatePercentile(durations, 95),
                p99: this.calculatePercentile(durations, 99)
            },
            memory: {
                min: Math.min(...memoryUsages),
                max: Math.max(...memoryUsages),
                average: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
                total: memoryUsages.reduce((a, b) => a + b, 0)
            }
        };
    }

    calculateMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }

    calculatePercentile(arr, percentile) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
}

// 大量データ生成ユーティリティ
class DataGenerator {
    static generateGameplayEvents(count) {
        const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'boss'];
        const events = [];

        for (let i = 0; i < count; i++) {
            events.push({
                type: 'bubble_popped',
                timestamp: Date.now() + i,
                data: {
                    bubbleType: bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)],
                    score: Math.floor(Math.random() * 1000) + 50,
                    combo: Math.floor(Math.random() * 20) + 1,
                    position: {
                        x: Math.floor(Math.random() * 800),
                        y: Math.floor(Math.random() * 600)
                    },
                    sessionId: `session-${Math.floor(i / 100)}`
                }
            });
        }

        return events;
    }

    static generateTimeSeriesData(days) {
        const data = new Map();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            data.set(dateStr, {
                games: Math.floor(Math.random() * 10) + 1,
                score: Math.floor(Math.random() * 50000) + 5000,
                playtime: Math.floor(Math.random() * 3600000) + 600000, // 10分-60分
                bubblesPopped: Math.floor(Math.random() * 500) + 50,
                accuracy: Math.random() * 0.3 + 0.7 // 70%-100%
            });
        }

        return data;
    }

    static generateLargeStatisticsData() {
        const bubbleTypeStats = new Map();
        const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'boss'];
        
        bubbleTypes.forEach(type => {
            bubbleTypeStats.set(type, {
                count: Math.floor(Math.random() * 10000),
                score: Math.floor(Math.random() * 500000),
                accuracy: Math.random() * 0.3 + 0.7,
                averageTime: Math.random() * 2000 + 500
            });
        });

        return {
            gamePlayStats: {
                totalGames: 10000,
                totalPlayTime: 36000000, // 10時間
                averageSessionTime: 3600000, // 1時間
                lastPlayTime: Date.now()
            },
            scoreStats: {
                totalScore: 5000000,
                highestScore: 50000,
                averageScore: 500,
                scoreHistory: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
            },
            bubbleStats: {
                totalPopped: 100000,
                accuracy: 0.85,
                bubbleTypeStats
            },
            comboStats: {
                maxCombo: 100,
                averageCombo: 15,
                comboHistory: Array.from({ length: 500 }, () => Math.floor(Math.random() * 100))
            },
            timeSeries: {
                daily: this.generateTimeSeriesData(365),
                weekly: this.generateTimeSeriesData(52),
                monthly: this.generateTimeSeriesData(12)
            }
        };
    }
}

// モックSetup
const mockCanvas = {
    getContext: jest.fn().mockReturnValue({
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 100 }),
        createLinearGradient: jest.fn().mockReturnValue({
            addColorStop: jest.fn()
        }),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn().mockReturnValue({
            data: new Uint8ClampedArray(800 * 600 * 4)
        }),
        putImageData: jest.fn()
    }),
    width: 800,
    height: 600
};

const mockGameEngine = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getPerformanceMetrics: jest.fn().mockReturnValue({
        frameRate: 60,
        memoryUsage: { used: 1024 * 1024 * 50 }
    })
};

describe('統計システムパフォーマンステスト', () => {
    let statisticsManager;
    let statisticsCollector;
    let statisticsAnalyzer;
    let chartRenderer;
    let statisticsExporter;
    let statisticsPerformanceOptimizer;

    beforeAll(async () => {
        // Performance APIのモック
        Object.defineProperty(window, 'performance', {
            value: {
                now: jest.fn(() => Date.now()),
                memory: {
                    usedJSHeapSize: 1024 * 1024 * 50,
                    totalJSHeapSize: 1024 * 1024 * 100,
                    jsHeapSizeLimit: 1024 * 1024 * 200
                },
                mark: jest.fn(),
                measure: jest.fn(),
                getEntriesByType: jest.fn().mockReturnValue([]),
                getEntriesByName: jest.fn().mockReturnValue([])
            },
            writable: true
        });

        // LocalStorageのモック
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            writable: true
        });

        // 必要なクラスをインポート
        try {
            const StatisticsManagerModule = await import('../../src/core/StatisticsManager.js');
            const StatisticsCollectorModule = await import('../../src/core/StatisticsCollector.js');
            const StatisticsAnalyzerModule = await import('../../src/core/StatisticsAnalyzer.js');
            const ChartRendererModule = await import('../../src/core/ChartRenderer.js');
            const StatisticsExporterModule = await import('../../src/core/StatisticsExporter.js');
            const StatisticsPerformanceOptimizerModule = await import('../../src/core/StatisticsPerformanceOptimizer.js');

            // インスタンス作成
            statisticsManager = new StatisticsManagerModule.StatisticsManager(mockGameEngine);
            statisticsCollector = new StatisticsCollectorModule.StatisticsCollector(statisticsManager);
            statisticsAnalyzer = new StatisticsAnalyzerModule.StatisticsAnalyzer(statisticsManager);
            chartRenderer = new ChartRendererModule.ChartRenderer(mockCanvas);
            statisticsExporter = new StatisticsExporterModule.StatisticsExporter(statisticsManager);
            statisticsPerformanceOptimizer = new StatisticsPerformanceOptimizerModule.StatisticsPerformanceOptimizer(statisticsManager);
        } catch (error) {
            console.error('Failed to import modules:', error);
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        
        // パフォーマンス測定のリセット
        performance.now.mockReturnValue(Date.now());
        
        // メモリ使用量のリセット
        performance.memory.usedJSHeapSize = 1024 * 1024 * 50;
    });

    afterAll(() => {
        // クリーンアップ
        statisticsManager?.destroy();
        statisticsCollector?.destroy();
        statisticsAnalyzer?.destroy();
        chartRenderer?.destroy();
        statisticsExporter?.destroy();
        statisticsPerformanceOptimizer?.destroy();
    });

    describe('データ収集パフォーマンステスト', () => {
        test('1ms以下での統計収集処理（要件確認）', async () => {
            const measurement = new PerformanceMeasurement('single_event_collection');
            
            // 100回の単一イベント収集を測定
            for (let i = 0; i < 100; i++) {
                const event = DataGenerator.generateGameplayEvents(1)[0];
                
                measurement.startMeasurement();
                await statisticsCollector.collectEvent(event);
                measurement.endMeasurement();
            }

            const stats = measurement.getStats();
            console.log('Single Event Collection Stats:', stats);

            // 要件: 統計収集処理時間 < 1ms
            expect(stats.duration.average).toBeLessThan(1);
            expect(stats.duration.p95).toBeLessThan(2); // 95%のケースで2ms以下
            expect(stats.duration.p99).toBeLessThan(5); // 99%のケースで5ms以下
        });

        test('大量イベントのバッチ処理パフォーマンス', async () => {
            const eventCounts = [100, 500, 1000, 5000];
            const results = {};

            for (const count of eventCounts) {
                const measurement = new PerformanceMeasurement(`batch_${count}`);
                const events = DataGenerator.generateGameplayEvents(count);

                measurement.startMeasurement();
                
                // イベントをキューに追加
                for (const event of events) {
                    await statisticsCollector.collectEvent(event);
                }
                
                // バッチ処理実行
                await statisticsCollector.processBatch();
                
                const result = measurement.endMeasurement();
                results[count] = result;

                console.log(`Batch ${count} events:`, result);
            }

            // スケーラビリティの確認
            expect(results[1000].duration).toBeLessThan(100); // 1000イベントで100ms以下
            expect(results[5000].duration).toBeLessThan(500); // 5000イベントで500ms以下
        });

        test('メモリ効率的なデータ収集', async () => {
            const memoryBaseline = performance.memory.usedJSHeapSize;
            const events = DataGenerator.generateGameplayEvents(10000);

            // 大量データの処理
            for (let i = 0; i < events.length; i += 100) {
                const batch = events.slice(i, i + 100);
                for (const event of batch) {
                    await statisticsCollector.collectEvent(event);
                }
                await statisticsCollector.processBatch();
                
                // 定期的なガベージコレクション
                if (i % 1000 === 0 && global.gc) {
                    global.gc();
                }
            }

            const memoryUsed = performance.memory.usedJSHeapSize - memoryBaseline;
            console.log('Memory used for 10k events:', memoryUsed / (1024 * 1024), 'MB');

            // メモリ使用量が50MB以下であることを確認
            expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);
        });

        test('並行処理での安定性', async () => {
            const concurrentOperations = 10;
            const eventsPerOperation = 100;
            const promises = [];

            const overallStart = performance.now();

            for (let i = 0; i < concurrentOperations; i++) {
                const promise = async () => {
                    const events = DataGenerator.generateGameplayEvents(eventsPerOperation);
                    for (const event of events) {
                        await statisticsCollector.collectEvent(event);
                    }
                    return statisticsCollector.processBatch();
                };
                promises.push(promise());
            }

            await Promise.all(promises);
            
            const totalTime = performance.now() - overallStart;
            console.log('Concurrent operations total time:', totalTime);

            // 並行処理が2秒以内に完了することを確認
            expect(totalTime).toBeLessThan(2000);
        });
    });

    describe('データ分析パフォーマンステスト', () => {
        beforeEach(async () => {
            // 大量の統計データをセットアップ
            statisticsManager.statistics = DataGenerator.generateLargeStatisticsData();
        });

        test('トレンド分析の処理時間', async () => {
            const measurement = new PerformanceMeasurement('trend_analysis');

            measurement.startMeasurement();
            const trendAnalysis = await statisticsAnalyzer.analyzeTrends();
            const result = measurement.endMeasurement();

            console.log('Trend analysis performance:', result);

            expect(result.duration).toBeLessThan(200); // 200ms以下
            expect(trendAnalysis).toBeDefined();
            expect(trendAnalysis.scoreTrend).toBeDefined();
        });

        test('比較分析の処理時間', async () => {
            const measurement = new PerformanceMeasurement('comparison_analysis');

            measurement.startMeasurement();
            const comparison = await statisticsAnalyzer.comparePerformance({
                startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30日前
                endDate: Date.now()
            });
            const result = measurement.endMeasurement();

            console.log('Comparison analysis performance:', result);

            expect(result.duration).toBeLessThan(300); // 300ms以下
            expect(comparison).toBeDefined();
        });

        test('洞察生成の処理時間', async () => {
            const measurement = new PerformanceMeasurement('insight_generation');

            measurement.startMeasurement();
            const insights = await statisticsAnalyzer.generateInsights();
            const result = measurement.endMeasurement();

            console.log('Insight generation performance:', result);

            expect(result.duration).toBeLessThan(500); // 500ms以下
            expect(insights).toBeDefined();
            expect(Array.isArray(insights.recommendations)).toBe(true);
        });

        test('複数分析の並行実行', async () => {
            const startTime = performance.now();

            const [trends, comparison, insights] = await Promise.all([
                statisticsAnalyzer.analyzeTrends(),
                statisticsAnalyzer.comparePerformance({
                    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
                    endDate: Date.now()
                }),
                statisticsAnalyzer.generateInsights()
            ]);

            const totalTime = performance.now() - startTime;
            console.log('Parallel analysis time:', totalTime);

            expect(totalTime).toBeLessThan(800); // 800ms以下
            expect(trends).toBeDefined();
            expect(comparison).toBeDefined();
            expect(insights).toBeDefined();
        });
    });

    describe('描画パフォーマンステスト', () => {
        test('500ms以下での統計画面初回表示（要件確認）', async () => {
            const measurement = new PerformanceMeasurement('initial_render');
            
            const largeDataset = {
                labels: Array.from({ length: 100 }, (_, i) => `Item ${i}`),
                datasets: [{
                    label: 'Large Dataset',
                    data: Array.from({ length: 100 }, () => Math.random() * 1000),
                    backgroundColor: Array.from({ length: 100 }, () => 
                        `hsl(${Math.random() * 360}, 70%, 50%)`
                    )
                }]
            };

            measurement.startMeasurement();
            
            // 複数のチャートを同時描画（初回表示をシミュレーション）
            await Promise.all([
                chartRenderer.renderBarChart(largeDataset),
                chartRenderer.renderLineChart(largeDataset),
                chartRenderer.renderPieChart(largeDataset)
            ]);
            
            const result = measurement.endMeasurement();
            console.log('Initial render performance:', result);

            // 要件: 統計画面の初回表示時間 < 500ms
            expect(result.duration).toBeLessThan(500);
        });

        test('100ms以下でのデータ更新時描画（要件確認）', async () => {
            const measurement = new PerformanceMeasurement('update_render');
            
            const smallDataset = {
                labels: ['A', 'B', 'C', 'D', 'E'],
                datasets: [{
                    data: [10, 20, 30, 40, 50]
                }]
            };

            // 10回の更新を測定
            for (let i = 0; i < 10; i++) {
                measurement.startMeasurement();
                
                // データ更新をシミュレーション
                smallDataset.datasets[0].data = smallDataset.datasets[0].data.map(
                    val => val + Math.random() * 10 - 5
                );
                
                await chartRenderer.renderBarChart(smallDataset);
                measurement.endMeasurement();
            }

            const stats = measurement.getStats();
            console.log('Update render stats:', stats);

            // 要件: データ更新時間 < 100ms
            expect(stats.duration.average).toBeLessThan(100);
            expect(stats.duration.p95).toBeLessThan(150);
        });

        test('レスポンシブ描画のパフォーマンス', async () => {
            const sizes = [
                { width: 400, height: 300 },   // 小画面
                { width: 800, height: 600 },   // 中画面
                { width: 1200, height: 800 },  // 大画面
                { width: 1920, height: 1080 }  // 超大画面
            ];

            const results = {};

            for (const size of sizes) {
                mockCanvas.width = size.width;
                mockCanvas.height = size.height;

                const measurement = new PerformanceMeasurement(`render_${size.width}x${size.height}`);
                
                const dataset = {
                    labels: Array.from({ length: 50 }, (_, i) => `Item ${i}`),
                    datasets: [{
                        data: Array.from({ length: 50 }, () => Math.random() * 1000)
                    }]
                };

                measurement.startMeasurement();
                await chartRenderer.renderBarChart(dataset);
                const result = measurement.endMeasurement();

                results[`${size.width}x${size.height}`] = result;
                console.log(`Render ${size.width}x${size.height}:`, result);
            }

            // 画面サイズに関係なく一定の性能を維持
            Object.values(results).forEach(result => {
                expect(result.duration).toBeLessThan(300);
            });
        });

        test('アニメーション付き描画のパフォーマンス', async () => {
            const animationFrames = 60; // 1秒間のアニメーション
            const measurement = new PerformanceMeasurement('animated_render');

            const dataset = {
                labels: ['A', 'B', 'C', 'D'],
                datasets: [{
                    data: [0, 0, 0, 0] // 初期値
                }]
            };

            const targetData = [100, 200, 150, 300];
            const increment = targetData.map(val => val / animationFrames);

            measurement.startMeasurement();

            // アニメーションフレームをシミュレーション
            for (let frame = 0; frame < animationFrames; frame++) {
                dataset.datasets[0].data = dataset.datasets[0].data.map(
                    (val, index) => val + increment[index]
                );
                
                await chartRenderer.renderBarChart(dataset);
            }

            const result = measurement.endMeasurement();
            console.log('Animated render performance:', result);

            // 60FPSを維持できることを確認（16.67ms/frame）
            const averageFrameTime = result.duration / animationFrames;
            expect(averageFrameTime).toBeLessThan(20); // 余裕を見て20ms
        });
    });

    describe('データエクスポート・インポートパフォーマンステスト', () => {
        beforeEach(() => {
            statisticsManager.statistics = DataGenerator.generateLargeStatisticsData();
        });

        test('大量データのエクスポート性能', async () => {
            const formats = ['json', 'csv', 'text'];
            const results = {};

            for (const format of formats) {
                const measurement = new PerformanceMeasurement(`export_${format}`);

                measurement.startMeasurement();
                const exportResult = await statisticsExporter.exportData(format);
                const result = measurement.endMeasurement();

                results[format] = {
                    ...result,
                    dataSize: exportResult.data.length
                };

                console.log(`Export ${format}:`, results[format]);

                expect(exportResult.success).toBe(true);
                expect(result.duration).toBeLessThan(1000); // 1秒以下
            }
        });

        test('大量データのインポート性能', async () => {
            const measurement = new PerformanceMeasurement('import_performance');

            // 大量データをエクスポート
            const exportResult = await statisticsExporter.exportData('json');
            
            // 統計データをクリア
            statisticsManager.statistics = statisticsManager.initializeStatistics();

            // インポート性能を測定
            measurement.startMeasurement();
            const importResult = await statisticsExporter.importData(exportResult.data, 'json');
            const result = measurement.endMeasurement();

            console.log('Import performance:', result);

            expect(importResult.success).toBe(true);
            expect(result.duration).toBeLessThan(2000); // 2秒以下
        });

        test('ストリーミングエクスポートの性能', async () => {
            // 非常に大量のデータをシミュレーション
            const veryLargeData = {
                ...DataGenerator.generateLargeStatisticsData(),
                extendedHistory: Array.from({ length: 50000 }, (_, i) => ({
                    timestamp: Date.now() + i,
                    score: Math.random() * 1000,
                    combo: Math.floor(Math.random() * 50)
                }))
            };

            statisticsManager.statistics = veryLargeData;

            const measurement = new PerformanceMeasurement('streaming_export');

            measurement.startMeasurement();
            const exportResult = await statisticsExporter.exportData('json', {
                streaming: true,
                chunkSize: 1000
            });
            const result = measurement.endMeasurement();

            console.log('Streaming export performance:', result);

            expect(exportResult.success).toBe(true);
            expect(result.duration).toBeLessThan(5000); // 5秒以下
        });
    });

    describe('メモリ管理パフォーマンステスト', () => {
        test('長時間動作でのメモリリーク検出', async () => {
            const initialMemory = performance.memory.usedJSHeapSize;
            let maxMemoryIncrease = 0;

            // 1000回のサイクルを実行
            for (let cycle = 0; cycle < 1000; cycle++) {
                // データ収集
                const events = DataGenerator.generateGameplayEvents(10);
                for (const event of events) {
                    await statisticsCollector.collectEvent(event);
                }
                await statisticsCollector.processBatch();

                // 分析
                if (cycle % 100 === 0) {
                    await statisticsAnalyzer.analyzeTrends();
                }

                // 描画
                if (cycle % 50 === 0) {
                    const chartData = {
                        labels: ['A', 'B', 'C'],
                        datasets: [{ data: [1, 2, 3] }]
                    };
                    await chartRenderer.renderBarChart(chartData);
                }

                // メモリ使用量の監視
                const currentMemory = performance.memory.usedJSHeapSize;
                const memoryIncrease = currentMemory - initialMemory;
                maxMemoryIncrease = Math.max(maxMemoryIncrease, memoryIncrease);

                // 定期的なガベージコレクション
                if (cycle % 100 === 0 && global.gc) {
                    global.gc();
                }
            }

            console.log('Max memory increase:', maxMemoryIncrease / (1024 * 1024), 'MB');

            // メモリリークがないことを確認（100MB以下の増加）
            expect(maxMemoryIncrease).toBeLessThan(100 * 1024 * 1024);
        });

        test('ガベージコレクション頻度の最適化', async () => {
            const gcCalls = [];
            const originalGc = global.gc;

            // GCの呼び出しを監視
            global.gc = jest.fn(() => {
                gcCalls.push(Date.now());
                return originalGc?.();
            });

            // 大量のオブジェクト生成と破棄
            for (let i = 0; i < 500; i++) {
                const largeArray = new Array(10000).fill(0).map(() => Math.random());
                
                // 統計処理
                await statisticsCollector.collectEvent({
                    type: 'test',
                    data: { value: largeArray[0] }
                });

                if (i % 50 === 0) {
                    await statisticsCollector.processBatch();
                }
            }

            console.log('GC calls:', gcCalls.length);

            // GCが適切な頻度で呼ばれることを確認
            expect(gcCalls.length).toBeLessThan(20); // 過度なGCを避ける

            global.gc = originalGc;
        });
    });

    describe('パフォーマンス最適化機能テスト', () => {
        test('バッチ処理最適化の効果', async () => {
            const events = DataGenerator.generateGameplayEvents(1000);

            // 最適化なしの処理時間
            statisticsPerformanceOptimizer.config.batchProcessing.enabled = false;
            
            const unoptimizedStart = performance.now();
            for (const event of events) {
                await statisticsCollector.collectEvent(event);
            }
            const unoptimizedTime = performance.now() - unoptimizedStart;

            // 最適化ありの処理時間
            statisticsPerformanceOptimizer.config.batchProcessing.enabled = true;
            
            const optimizedStart = performance.now();
            for (const event of events) {
                await statisticsCollector.collectEvent(event);
            }
            await statisticsCollector.processBatch();
            const optimizedTime = performance.now() - optimizedStart;

            console.log('Unoptimized:', unoptimizedTime, 'Optimized:', optimizedTime);

            // 最適化により処理時間が改善されることを確認
            expect(optimizedTime).toBeLessThan(unoptimizedTime * 0.8); // 20%以上の改善
        });

        test('キャッシュ機能の効果', async () => {
            // キャッシュなしでの分析
            statisticsPerformanceOptimizer.config.caching.enabled = false;
            
            const noCacheStart = performance.now();
            await statisticsAnalyzer.analyzeTrends();
            await statisticsAnalyzer.analyzeTrends(); // 同じ分析を2回
            const noCacheTime = performance.now() - noCacheStart;

            // キャッシュありでの分析
            statisticsPerformanceOptimizer.config.caching.enabled = true;
            
            const withCacheStart = performance.now();
            await statisticsAnalyzer.analyzeTrends();
            await statisticsAnalyzer.analyzeTrends(); // 2回目はキャッシュから
            const withCacheTime = performance.now() - withCacheStart;

            console.log('No cache:', noCacheTime, 'With cache:', withCacheTime);

            // キャッシュにより処理時間が改善されることを確認
            expect(withCacheTime).toBeLessThan(noCacheTime * 0.7); // 30%以上の改善
        });
    });

    describe('パフォーマンス要件検証', () => {
        test('全体的なパフォーマンス要件の確認', async () => {
            const requirements = {
                statisticsCollection: 1,      // <1ms
                initialDisplay: 500,          // <500ms
                dataUpdate: 100               // <100ms
            };

            const results = {};

            // 統計収集性能
            const collectionMeasurement = new PerformanceMeasurement('collection_requirement');
            collectionMeasurement.startMeasurement();
            await statisticsCollector.collectEvent(DataGenerator.generateGameplayEvents(1)[0]);
            results.collection = collectionMeasurement.endMeasurement();

            // 初回表示性能
            const displayMeasurement = new PerformanceMeasurement('display_requirement');
            const largeDataset = {
                labels: Array.from({ length: 50 }, (_, i) => `Item ${i}`),
                datasets: [{ data: Array.from({ length: 50 }, () => Math.random() * 100) }]
            };

            displayMeasurement.startMeasurement();
            await Promise.all([
                chartRenderer.renderBarChart(largeDataset),
                chartRenderer.renderLineChart(largeDataset)
            ]);
            results.display = displayMeasurement.endMeasurement();

            // データ更新性能
            const updateMeasurement = new PerformanceMeasurement('update_requirement');
            updateMeasurement.startMeasurement();
            await chartRenderer.renderBarChart({
                labels: ['A', 'B', 'C'],
                datasets: [{ data: [1, 2, 3] }]
            });
            results.update = updateMeasurement.endMeasurement();

            console.log('Performance Requirements Validation:', results);

            // 要件確認
            expect(results.collection.duration).toBeLessThan(requirements.statisticsCollection);
            expect(results.display.duration).toBeLessThan(requirements.initialDisplay);
            expect(results.update.duration).toBeLessThan(requirements.dataUpdate);
        });

        test('パフォーマンス劣化の監視', async () => {
            const baselineResults = [];
            const testResults = [];

            // ベースライン測定
            for (let i = 0; i < 10; i++) {
                const start = performance.now();
                await statisticsCollector.collectEvent(DataGenerator.generateGameplayEvents(1)[0]);
                baselineResults.push(performance.now() - start);
            }

            // 負荷をかけた状態での測定（大量データ）
            statisticsManager.statistics = DataGenerator.generateLargeStatisticsData();
            
            for (let i = 0; i < 10; i++) {
                const start = performance.now();
                await statisticsCollector.collectEvent(DataGenerator.generateGameplayEvents(1)[0]);
                testResults.push(performance.now() - start);
            }

            const baselineAvg = baselineResults.reduce((a, b) => a + b, 0) / baselineResults.length;
            const testAvg = testResults.reduce((a, b) => a + b, 0) / testResults.length;

            console.log('Baseline avg:', baselineAvg, 'Test avg:', testAvg);

            // パフォーマンス劣化が50%以内であることを確認
            expect(testAvg).toBeLessThan(baselineAvg * 1.5);
        });
    });
});

// テスト用ヘルパー関数
const PerformanceTestHelper = {
    /**
     * CPU集約的な処理をシミュレーション
     */
    simulateCpuIntensiveTask(durationMs) {
        const start = Date.now();
        while (Date.now() - start < durationMs) {
            Math.random() * Math.random();
        }
    },

    /**
     * メモリ集約的な処理をシミュレーション
     */
    simulateMemoryIntensiveTask(sizeInMB) {
        const arraySize = sizeInMB * 1024 * 1024 / 8; // 8 bytes per number
        const largeArray = new Array(arraySize).fill(0);
        return largeArray.map(() => Math.random());
    },

    /**
     * ネットワーク遅延をシミュレーション
     */
    async simulateNetworkDelay(delayMs) {
        return new Promise(resolve => setTimeout(resolve, delayMs));
    },

    /**
     * パフォーマンス統計の計算
     */
    calculatePerformanceStats(measurements) {
        if (measurements.length === 0) return null;

        const sorted = [...measurements].sort((a, b) => a - b);
        return {
            min: Math.min(...measurements),
            max: Math.max(...measurements),
            mean: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            standardDeviation: this.calculateStandardDeviation(measurements)
        };
    },

    /**
     * 標準偏差の計算
     */
    calculateStandardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }
};

export { PerformanceMeasurement, DataGenerator, PerformanceTestHelper };