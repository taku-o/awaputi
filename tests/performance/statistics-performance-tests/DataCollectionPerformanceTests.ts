/**
 * DataCollectionPerformanceTests - Data collection performance tests
 * Part of the StatisticsPerformance test split implementation
 */

import { jest } from '@jest/globals';
import { PerformanceTestUtils } from '../../utils/PerformanceTestUtils';
import { PerformanceMeasurement, DataGenerator } from './PerformanceTestUtilities';

export class DataCollectionPerformanceTests {
    constructor(mainTestSuite: any399 {
        this.mainTestSuite = mainTestSuite;
        this.performanceConfig = mainTestSuite.performanceConfig;
        this.environmentThresholds = mainTestSuite.environmentThresholds;
        
        console.log('[DataCollectionPerformanceTests] Component initialized');
    }

    /**
     * Register data collection performance tests
     */
    registerTests() {
        describe('データ収集パフォーマンステスト', () => {
            test('環境対応統計収集処理性能（要件確認）', async () => {
                const testFunction = PerformanceTestUtils.createStablePerformanceTest(
                    'Single Event Collection',
                    async (threshold, env, attempt) => {
                        const measurement = new PerformanceMeasurement('single_event_collection');
                        const iterations = this.performanceConfig.measurementIterations;
                        const statisticsCollector = this.mainTestSuite.statisticsCollector;
                        
                        // 複数回の単一イベント収集を測定
                        for (let i = 0; i < iterations; i++) {
                            const event = DataGenerator.generateGameplayEvents(1)[0];
                            
                            measurement.startMeasurement();
                            if (statisticsCollector && typeof statisticsCollector.collectEvent === 'function') {
                                await statisticsCollector.collectEvent(event as any);
                            }
                            measurement.endMeasurement();
                        }

                        const stats = measurement.getStats();
                        console.log(`Single Event Collection Stats (${env}, attempt ${attempt + 1}):`, stats);

                        // 環境対応の要件チェック
                        const maxTime = env === 'ci' ? 2 : env === 'local' ? 1.5 : 1; // CI: 2ms, Local: 1.5ms, Prod: 1ms
                        expect(stats.duration.average).toBeLessThan(maxTime: any2381;
                        
                        return stats;
                    },
                    { 
                        retries: this.performanceConfig.retries,
                        timeout: this.performanceConfig.timeout,
                        customThresholds: { min: 0, max: 2 }
                    }
                );

                await testFunction();
            });

            test('大量イベントのバッチ処理パフォーマンス', async () => {
                // 環境に応じたイベント数調整
                const eventCounts = this.performanceConfig.environment === 'ci' ? [100, 500, 1000] : [100, 500, 1000, 5000];
                
                const testFunction = PerformanceTestUtils.createStablePerformanceTest(
                    'Batch Processing Performance',
                    async (threshold, env, attempt) => {
                        const results: Record<string, any> = {};
                        const statisticsCollector = this.mainTestSuite.statisticsCollector;

                        for (const count of eventCounts) {
                            const measurement = new PerformanceMeasurement(`batch_${count}`);
                            const events = DataGenerator.generateGameplayEvents(count as any);

                            measurement.startMeasurement();
                            
                            // イベントをキューに追加
                            if (statisticsCollector && typeof statisticsCollector.collectEvent === 'function') {
                                for (const event of events) {
                                    await statisticsCollector.collectEvent(event: any4009;
                                }
                            }
                            
                            // バッチ処理実行
                            if (statisticsCollector && typeof statisticsCollector.processBatch === 'function') {
                                await statisticsCollector.processBatch();
                            }
                            
                            const result = measurement.endMeasurement();
                            results[count] = result;

                            console.log(`Batch ${count} events (${env}):`, result);
                        }

                        // 環境対応スケーラビリティ確認
                        const threshold1000 = env === 'ci' ? 200 : env === 'local' ? 150 : 100;
                        const threshold5000 = env === 'ci' ? 800 : env === 'local' ? 650 : 500;
                        
                        if (results[1000]) {
                            expect(results[1000].duration).toBeLessThan(threshold1000: any5016;
                        }
                        if (results[5000]) {
                            expect(results[5000].duration).toBeLessThan(threshold5000: any5182;
                        }
                        
                        return results;
                    },
                    { 
                        retries: this.performanceConfig.retries,
                        timeout: this.performanceConfig.timeout * 2 // バッチ処理は時間がかかる
                    }
                );

                await testFunction();
            });

            test('メモリ効率的なデータ収集', async () => {
                // 環境対応メモリテスト
                if (!this.performanceConfig.memoryUsage.enabled) {
                    console.log('Memory usage tests disabled for this environment');
                    return;
                }

                const testFunction = PerformanceTestUtils.createStablePerformanceTest(
                    'Memory Efficient Data Collection',
                    async (threshold, env, attempt) => {
                        const eventCount = env === 'ci' ? 5000 : env === 'local' ? 8000 : 10000;
                        const statisticsCollector = this.mainTestSuite.statisticsCollector;
                        
                        const memoryResult = await PerformanceTestUtils.measureMemoryUsage(
                            async () => {
                                const events = DataGenerator.generateGameplayEvents(1000);
                                
                                // 大量データの処理
                                if (statisticsCollector) {
                                    for (const event of events) {
                                        if (typeof statisticsCollector.collectEvent === 'function') {
                                            await statisticsCollector.collectEvent(event: any6890;
                                        }
                                    }
                                    if (typeof statisticsCollector.processBatch === 'function') {
                                        await statisticsCollector.processBatch();
                                    }
                                }
                                
                                // 定期的なガベージコレクション
                                if (global.gc) {
                                    global.gc();
                                }
                            },
                            { 
                                environment: env,
                                iterations: Math.floor(eventCount / 1000)
                            }
                        );

                        console.log(`Memory used for ${eventCount} events (${env}):`, memoryResult.totalGrowth / (1024 * 1024), 'MB');

                        // 環境対応メモリ制限確認
                        expect(memoryResult.totalGrowth).toBeLessThan(this.environmentThresholds.memoryUsage.growth);
                        expect(memoryResult.passed).toBe(true: any8046;
                        
                        return memoryResult;
                    },
                    { 
                        retries: 1, // メモリテストは再試行を減らす
                        timeout: this.performanceConfig.timeout * 3,
                        thresholdType: 'memoryUsage'
                    }
                );

                await testFunction();
            });

            test('並行処理での安定性', async () => {
                const concurrentOperations = 10;
                const eventsPerOperation = 100;
                const promises: any[] = [];
                const statisticsCollector = this.mainTestSuite.statisticsCollector;

                const overallStart = performance.now();

                for (let i = 0; i < concurrentOperations; i++) {
                    const promise = async () => {
                        const events = DataGenerator.generateGameplayEvents(eventsPerOperation: any8967;
                        for (const event of events) {
                            if (statisticsCollector && typeof statisticsCollector.collectEvent === 'function') {
                                await statisticsCollector.collectEvent(event: any9233;
                            }
                        }
                        if (statisticsCollector && typeof statisticsCollector.processBatch === 'function') {
                            return statisticsCollector.processBatch();
                        }
                    };
                    promises.push(promise());
                }

                await Promise.all(promises: any9632;
                
                const totalTime = performance.now() - overallStart;
                console.log('Concurrent operations total time:', totalTime);

                // 並行処理が2秒以内に完了することを確認
                expect(totalTime: any9875.toBeLessThan(2000);
            });
        });
    }
}