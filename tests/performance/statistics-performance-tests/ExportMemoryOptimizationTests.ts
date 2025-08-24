import { describe, test, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { PerformanceTestUtils } from '../../utils/PerformanceTestUtils';
import { PerformanceMeasurement, DataGenerator } from './PerformanceTestUtilities';

/**
 * ExportMemoryOptimizationTests - Export, memory management, and optimization performance tests
 * Part of the StatisticsPerformance test split implementation
 */

export class ExportMemoryOptimizationTests {
    private mainTestSuite: any;
    private performanceConfig: any;
    private environmentThresholds: any;

    constructor(mainTestSuite: any) {
        this.mainTestSuite = mainTestSuite;
        this.performanceConfig = mainTestSuite.performanceConfig;
        this.environmentThresholds = mainTestSuite.environmentThresholds;
        
        console.log('[ExportMemoryOptimizationTests] Component initialized');
    }

    /**
     * Register export, memory, and optimization performance tests
     */
    registerTests(): void {
        describe('データエクスポート・インポートパフォーマンステスト', () => {
            beforeEach(() => {
                this.mainTestSuite.statisticsManager.statistics = DataGenerator.generateLargeStatisticsData();
            });

            test('大量データのエクスポート性能', async () => {
                const formats = ['json', 'csv', 'text'];
                const results: Record<string, any> = {};
                const statisticsExporter = this.mainTestSuite.statisticsExporter;

                for (const format of formats) {
                    const measurement = new PerformanceMeasurement(`export_${format}`);
                    
                    measurement.startMeasurement();
                    if (statisticsExporter && typeof statisticsExporter.exportData === 'function') {
                        results[format] = await statisticsExporter.exportData(format);
                    }
                    const result = measurement.endMeasurement();

                    console.log(`Export performance (${format}):`, result);

                    // フォーマット別性能要件
                    const maxTime = format === 'json' ? 500 : format === 'csv' ? 300 : 400;
                    expect(result.duration).toBeLessThan(maxTime);
                    
                    if (results[format]) {
                        expect(results[format].length).toBeGreaterThan(0);
                    }
                }
            });

            test('ストリームエクスポート性能', async () => {
                const measurement = new PerformanceMeasurement('stream_export');
                const statisticsExporter = this.mainTestSuite.statisticsExporter;

                // 大量データをストリーム形式でエクスポート
                const dataStream = DataGenerator.generateStreamData(10000); // 10k records

                measurement.startMeasurement();
                let exportedRecords = 0;

                if (statisticsExporter && typeof statisticsExporter.exportStream === 'function') {
                    for await (const chunk of dataStream) {
                        await statisticsExporter.exportStream(chunk);
                        exportedRecords += chunk.length;
                    }
                }

                const result = measurement.endMeasurement();

                console.log('Stream export performance:', result);
                console.log(`Exported records: ${exportedRecords}`);

                // ストリームエクスポートは大量データでも効率的
                expect(result.duration).toBeLessThan(2000); // 2秒以内
                expect(exportedRecords).toBe(10000);
            });

            test('インポート処理性能', async () => {
                const measurement = new PerformanceMeasurement('import_performance');
                const statisticsImporter = this.mainTestSuite.statisticsImporter;

                // エクスポートされたデータをインポート
                const testData = DataGenerator.generateExportFormatData('json', 5000);

                measurement.startMeasurement();
                let importedData: any = null;

                if (statisticsImporter && typeof statisticsImporter.importData === 'function') {
                    importedData = await statisticsImporter.importData(testData);
                }

                const result = measurement.endMeasurement();

                console.log('Import performance:', result);

                // インポート処理は高速であること
                expect(result.duration).toBeLessThan(1000); // 1秒以内
                if (importedData) {
                    expect(importedData.length).toBeGreaterThan(4000); // データの90%以上をインポート
                }
            });

            test('差分エクスポート性能', async () => {
                const measurement = new PerformanceMeasurement('delta_export');
                const statisticsExporter = this.mainTestSuite.statisticsExporter;

                const baselineTimestamp = Date.now() - 24 * 60 * 60 * 1000; // 24時間前

                measurement.startMeasurement();
                let deltaData: any = null;

                if (statisticsExporter && typeof statisticsExporter.exportDelta === 'function') {
                    deltaData = await statisticsExporter.exportDelta(baselineTimestamp);
                }

                const result = measurement.endMeasurement();

                console.log('Delta export performance:', result);

                // 差分エクスポートは全体エクスポートより高速
                expect(result.duration).toBeLessThan(200); // 200ms以内
                if (deltaData) {
                    expect(deltaData).toBeDefined();
                }
            });
        });

        describe('メモリ管理パフォーマンステスト', () => {
            test('メモリ使用量最適化テスト', async () => {
                const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const statisticsManager = this.mainTestSuite.statisticsManager;

                // 大量データ処理
                const iterations = 100;
                for (let i = 0; i < iterations; i++) {
                    const testData = DataGenerator.generateLargeStatisticsData();
                    
                    if (statisticsManager && typeof statisticsManager.processLargeDataset === 'function') {
                        await statisticsManager.processLargeDataset(testData);
                    }
                    
                    // 定期的なメモリクリーンアップ
                    if (i % 10 === 0) {
                        if (statisticsManager && typeof statisticsManager.optimizeMemory === 'function') {
                            await statisticsManager.optimizeMemory();
                        }
                        
                        if (global.gc) {
                            global.gc();
                        }
                    }
                }

                const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const memoryIncrease = finalMemory - initialMemory;
                const increaseInMB = memoryIncrease / 1024 / 1024;

                console.log(`Memory increase after optimization: ${increaseInMB.toFixed(2)}MB`);

                // 最適化により、メモリ増加は抑制されていること
                expect(increaseInMB).toBeLessThan(200); // 200MB以下
            });

            test('ガベージコレクション効率テスト', async () => {
                const measurement = new PerformanceMeasurement('gc_efficiency');
                const statisticsManager = this.mainTestSuite.statisticsManager;

                let memoryBefore: number = 0;
                let memoryAfter: number = 0;

                // メモリ集約的な処理
                measurement.startMeasurement();
                
                const largeDatasets = [];
                for (let i = 0; i < 50; i++) {
                    largeDatasets.push(DataGenerator.generateLargeStatisticsData());
                }

                if (process.memoryUsage) {
                    memoryBefore = process.memoryUsage().heapUsed;
                }

                // データ処理と破棄
                for (const dataset of largeDatasets) {
                    if (statisticsManager && typeof statisticsManager.processAndDiscard === 'function') {
                        await statisticsManager.processAndDiscard(dataset);
                    }
                }

                // 明示的なガベージコレクション
                if (global.gc) {
                    global.gc();
                }

                if (process.memoryUsage) {
                    memoryAfter = process.memoryUsage().heapUsed;
                }

                const result = measurement.endMeasurement();
                const memoryRecovered = memoryBefore - memoryAfter;

                console.log('GC efficiency test:', result);
                console.log(`Memory recovered: ${(memoryRecovered / 1024 / 1024).toFixed(2)}MB`);

                // ガベージコレクションによりメモリが回収されていること
                expect(result.duration).toBeLessThan(3000); // 3秒以内
                if (memoryBefore > 0) {
                    expect(memoryRecovered).toBeGreaterThan(0); // メモリ回収が実行されている
                }
            });

            test('メモリリーク長期監視テスト', async () => {
                const baselineMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const statisticsManager = this.mainTestSuite.statisticsManager;

                const cycles = 20;
                const memoryReadings: number[] = [];

                for (let cycle = 0; cycle < cycles; cycle++) {
                    // 各サイクルで大量データ処理
                    const cycleMeasurement = new PerformanceMeasurement(`cycle_${cycle}`);
                    cycleMeasurement.startMeasurement();

                    const cycleData = DataGenerator.generateLargeStatisticsData();
                    if (statisticsManager && typeof statisticsManager.processData === 'function') {
                        await statisticsManager.processData(cycleData);
                    }

                    cycleMeasurement.endMeasurement();

                    // メモリ使用量記録
                    if (process.memoryUsage) {
                        memoryReadings.push(process.memoryUsage().heapUsed);
                    }

                    // 定期的なクリーンアップ
                    if (cycle % 5 === 0) {
                        if (statisticsManager && typeof statisticsManager.cleanup === 'function') {
                            await statisticsManager.cleanup();
                        }
                        if (global.gc) {
                            global.gc();
                        }
                    }

                    // 小休止
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const totalMemoryIncrease = finalMemory - baselineMemory;
                const increaseInMB = totalMemoryIncrease / 1024 / 1024;

                // メモリ使用量のトレンド分析
                const averageIncrease = memoryReadings.reduce((sum, reading, index) => {
                    return sum + (index > 0 ? reading - memoryReadings[index - 1] : 0);
                }, 0) / (memoryReadings.length - 1);

                console.log(`Long-term memory monitoring results:`);
                console.log(`Total increase: ${increaseInMB.toFixed(2)}MB`);
                console.log(`Average per cycle: ${(averageIncrease / 1024 / 1024).toFixed(2)}MB`);

                // 長期間でもメモリリークが最小限であること
                expect(increaseInMB).toBeLessThan(100); // 100MB以下
                expect(Math.abs(averageIncrease) / 1024 / 1024).toBeLessThan(5); // 1サイクルあたり5MB以下
            });
        });

        describe('パフォーマンス最適化テスト', () => {
            test('キャッシュ最適化効果', async () => {
                const statisticsOptimizer = this.mainTestSuite.statisticsOptimizer;
                const testQueries = Array.from({ length: 100 }, (_, i) => `query_${i % 10}`); // 重複クエリを含む

                // キャッシュ無効状態でのテスト
                if (statisticsOptimizer && typeof statisticsOptimizer.disableCache === 'function') {
                    statisticsOptimizer.disableCache();
                }

                const noCacheMeasurement = new PerformanceMeasurement('no_cache');
                noCacheMeasurement.startMeasurement();

                for (const query of testQueries) {
                    if (statisticsOptimizer && typeof statisticsOptimizer.executeQuery === 'function') {
                        await statisticsOptimizer.executeQuery(query);
                    }
                }

                const noCacheResult = noCacheMeasurement.endMeasurement();

                // キャッシュ有効状態でのテスト
                if (statisticsOptimizer && typeof statisticsOptimizer.enableCache === 'function') {
                    statisticsOptimizer.enableCache();
                }

                const withCacheMeasurement = new PerformanceMeasurement('with_cache');
                withCacheMeasurement.startMeasurement();

                for (const query of testQueries) {
                    if (statisticsOptimizer && typeof statisticsOptimizer.executeQuery === 'function') {
                        await statisticsOptimizer.executeQuery(query);
                    }
                }

                const withCacheResult = withCacheMeasurement.endMeasurement();

                console.log('Cache optimization test:');
                console.log(`No cache: ${noCacheResult.duration}ms`);
                console.log(`With cache: ${withCacheResult.duration}ms`);

                const improvement = (noCacheResult.duration - withCacheResult.duration) / noCacheResult.duration;
                console.log(`Performance improvement: ${(improvement * 100).toFixed(1)}%`);

                // キャッシュにより30%以上の性能向上
                expect(improvement).toBeGreaterThan(0.3);
                expect(withCacheResult.duration).toBeLessThan(noCacheResult.duration);
            });

            test('並列処理最適化', async () => {
                const statisticsProcessor = this.mainTestSuite.statisticsProcessor;
                const testTasks = Array.from({ length: 20 }, (_, i) => `task_${i}`);

                // 逐次処理
                const sequentialMeasurement = new PerformanceMeasurement('sequential');
                sequentialMeasurement.startMeasurement();

                for (const task of testTasks) {
                    if (statisticsProcessor && typeof statisticsProcessor.processTask === 'function') {
                        await statisticsProcessor.processTask(task);
                    }
                }

                const sequentialResult = sequentialMeasurement.endMeasurement();

                // 並列処理
                const parallelMeasurement = new PerformanceMeasurement('parallel');
                parallelMeasurement.startMeasurement();

                const parallelPromises = testTasks.map(async (task) => {
                    if (statisticsProcessor && typeof statisticsProcessor.processTask === 'function') {
                        return await statisticsProcessor.processTask(task);
                    }
                    return Promise.resolve();
                });

                await Promise.all(parallelPromises);
                const parallelResult = parallelMeasurement.endMeasurement();

                console.log('Parallel processing optimization:');
                console.log(`Sequential: ${sequentialResult.duration}ms`);
                console.log(`Parallel: ${parallelResult.duration}ms`);

                const speedup = sequentialResult.duration / parallelResult.duration;
                console.log(`Speedup: ${speedup.toFixed(2)}x`);

                // 並列処理により1.5倍以上の高速化
                expect(speedup).toBeGreaterThan(1.5);
                expect(parallelResult.duration).toBeLessThan(sequentialResult.duration);
            });

            test('データ構造最適化効果', async () => {
                const statisticsOptimizer = this.mainTestSuite.statisticsOptimizer;

                const testDataSizes = [1000, 5000, 10000];
                const results: Record<string, any> = {};

                for (const dataSize of testDataSizes) {
                    const testData = DataGenerator.generateLargeStatisticsData(dataSize);

                    // 最適化前の処理
                    const beforeMeasurement = new PerformanceMeasurement(`before_opt_${dataSize}`);
                    beforeMeasurement.startMeasurement();

                    if (statisticsOptimizer && typeof statisticsOptimizer.processUnoptimized === 'function') {
                        await statisticsOptimizer.processUnoptimized(testData);
                    }

                    const beforeResult = beforeMeasurement.endMeasurement();

                    // 最適化後の処理
                    const afterMeasurement = new PerformanceMeasurement(`after_opt_${dataSize}`);
                    afterMeasurement.startMeasurement();

                    if (statisticsOptimizer && typeof statisticsOptimizer.processOptimized === 'function') {
                        await statisticsOptimizer.processOptimized(testData);
                    }

                    const afterResult = afterMeasurement.endMeasurement();

                    const improvement = (beforeResult.duration - afterResult.duration) / beforeResult.duration;
                    results[dataSize] = {
                        before: beforeResult.duration,
                        after: afterResult.duration,
                        improvement
                    };

                    console.log(`Data structure optimization (${dataSize} records):`);
                    console.log(`Before: ${beforeResult.duration}ms, After: ${afterResult.duration}ms`);
                    console.log(`Improvement: ${(improvement * 100).toFixed(1)}%`);

                    // データ構造最適化により20%以上の性能向上
                    expect(improvement).toBeGreaterThan(0.2);
                }

                // 大きなデータセットほど最適化効果が高いことを確認
                expect(results[10000].improvement).toBeGreaterThan(results[1000].improvement);
            });
        });
    }
}