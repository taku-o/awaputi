import { describe, test, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { PerformanceTestUtils } from '../../utils/PerformanceTestUtils';
import { PerformanceMeasurement, DataGenerator } from './PerformanceTestUtilities';

/**
 * DataCollectionPerformanceTests - Data collection performance tests
 * Part of the StatisticsPerformance test split implementation
 */

export class DataCollectionPerformanceTests {
    private mainTestSuite: any;
    private performanceConfig: any;
    private environmentThresholds: any;

    constructor(mainTestSuite: any) {
        this.mainTestSuite = mainTestSuite;
        this.performanceConfig = mainTestSuite.performanceConfig;
        this.environmentThresholds = mainTestSuite.environmentThresholds;
        
        console.log('[DataCollectionPerformanceTests] Component initialized');
    }

    /**
     * Register data collection performance tests
     */
    registerTests(): void {
        describe('データ収集パフォーマンステスト', () => {
            test('環境対応統計収集処理性能（要件確認）', async () => {
                const testFunction = PerformanceTestUtils.createStablePerformanceTest(
                    'Single Event Collection',
                    async (threshold: number, env: string, attempt: number) => {
                        const measurement = new PerformanceMeasurement('single_event_collection');
                        const iterations = this.performanceConfig.measurementIterations;
                        const statisticsCollector = this.mainTestSuite.statisticsCollector;
                        
                        // 複数回の単一イベント収集を測定
                        for (let i = 0; i < iterations; i++) {
                            const event = DataGenerator.generateGameplayEvents(1)[0];
                            
                            measurement.startMeasurement();
                            if (statisticsCollector && typeof statisticsCollector.collectEvent === 'function') {
                                await statisticsCollector.collectEvent(event);
                            }
                            measurement.endMeasurement();
                        }

                        const stats = measurement.getStats();
                        console.log(`Single Event Collection Stats (${env}, attempt ${attempt + 1}):`, stats);

                        // 環境対応の要件チェック
                        const maxTime = env === 'ci' ? 2 : env === 'local' ? 1.5 : 1; // CI: 2ms, Local: 1.5ms, Prod: 1ms
                        expect(stats.duration.average).toBeLessThan(maxTime);
                        
                        return stats;
                    },
                    { 
                        retries: this.performanceConfig.retries,
                        timeout: this.performanceConfig.timeout
                    }
                );

                await testFunction();
            });

            test('バッチデータ収集性能', async () => {
                const measurement = new PerformanceMeasurement('batch_data_collection');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;
                
                const batchSizes = [10, 50, 100, 500];
                
                for (const batchSize of batchSizes) {
                    const events = DataGenerator.generateGameplayEvents(batchSize);
                    
                    measurement.startMeasurement();
                    if (statisticsCollector && typeof statisticsCollector.collectBatch === 'function') {
                        await statisticsCollector.collectBatch(events);
                    }
                    const result = measurement.endMeasurement();

                    console.log(`Batch collection (${batchSize} events):`, result);

                    // バッチサイズに応じた性能要件
                    const expectedMaxTime = Math.min(batchSize * 0.5, 200); // 最大200ms
                    expect(result.duration).toBeLessThan(expectedMaxTime);
                }
            });

            test('並行データ収集処理', async () => {
                const measurement = new PerformanceMeasurement('concurrent_collection');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;
                
                const concurrentTasks = 10;
                const eventsPerTask = 20;

                measurement.startMeasurement();
                
                const promises = Array.from({ length: concurrentTasks }, async (_, taskIndex) => {
                    const taskEvents = DataGenerator.generateGameplayEvents(eventsPerTask);
                    
                    if (statisticsCollector && typeof statisticsCollector.collectBatch === 'function') {
                        return await statisticsCollector.collectBatch(taskEvents);
                    }
                    return Promise.resolve();
                });

                await Promise.all(promises);
                const result = measurement.endMeasurement();

                console.log('Concurrent collection performance:', result);

                // 並行処理は逐次処理より早いことを期待
                expect(result.duration).toBeLessThan(concurrentTasks * eventsPerTask * 0.5);
            });

            test('大容量データ収集処理', async () => {
                const measurement = new PerformanceMeasurement('large_volume_collection');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;
                
                const largeEventSet = DataGenerator.generateGameplayEvents(2000); // 2000イベント
                const batchSize = 100;

                measurement.startMeasurement();
                
                // バッチごとに処理
                for (let i = 0; i < largeEventSet.length; i += batchSize) {
                    const batch = largeEventSet.slice(i, i + batchSize);
                    
                    if (statisticsCollector && typeof statisticsCollector.collectBatch === 'function') {
                        await statisticsCollector.collectBatch(batch);
                    }
                }
                
                const result = measurement.endMeasurement();

                console.log('Large volume collection performance:', result);

                // 大容量処理は5秒以内であること
                expect(result.duration).toBeLessThan(5000);
            });
        });

        describe('リアルタイムデータ処理', () => {
            test('リアルタイムイベントストリーム処理', async () => {
                const measurement = new PerformanceMeasurement('realtime_stream');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;
                
                const streamDuration = 1000; // 1秒間のストリーム
                const eventInterval = 10; // 10ms間隔
                const expectedEvents = streamDuration / eventInterval;

                measurement.startMeasurement();

                let processedEvents = 0;
                const streamInterval = setInterval(async () => {
                    const event = DataGenerator.generateGameplayEvents(1)[0];
                    
                    if (statisticsCollector && typeof statisticsCollector.collectEvent === 'function') {
                        await statisticsCollector.collectEvent(event);
                        processedEvents++;
                    }
                }, eventInterval);

                // ストリーム期間待機
                await new Promise(resolve => setTimeout(resolve, streamDuration));
                clearInterval(streamInterval);

                const result = measurement.endMeasurement();

                console.log('Realtime stream performance:', result);
                console.log(`Processed events: ${processedEvents}/${expectedEvents}`);

                // リアルタイム処理の要件チェック
                expect(processedEvents).toBeGreaterThan(expectedEvents * 0.9); // 90%以上処理できること
                expect(result.duration).toBeLessThanOrEqual(streamDuration * 1.1); // 10%以内の遅延
            });

            test('高頻度イベント処理', async () => {
                const measurement = new PerformanceMeasurement('high_frequency_events');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;
                
                const highFrequencyEvents = 1000; // 1000イベント/秒
                const testDuration = 500; // 0.5秒間のテスト
                const events = DataGenerator.generateGameplayEvents(highFrequencyEvents * testDuration / 1000);

                measurement.startMeasurement();

                // 高頻度でイベントを送信
                for (const event of events) {
                    if (statisticsCollector && typeof statisticsCollector.collectEvent === 'function') {
                        await statisticsCollector.collectEvent(event);
                    }
                }

                const result = measurement.endMeasurement();

                console.log('High frequency events performance:', result);

                // 高頻度処理でも遅延が少ないこと
                expect(result.duration).toBeLessThan(testDuration * 1.5); // 50%以内の追加時間
            });
        });

        describe('メモリ効率性テスト', () => {
            test('データ収集中のメモリ使用量監視', async () => {
                const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const statisticsCollector = this.mainTestSuite.statisticsCollector;

                // 大量のデータ収集をシミュレート
                const iterations = 100;
                for (let i = 0; i < iterations; i++) {
                    const events = DataGenerator.generateGameplayEvents(50);
                    
                    if (statisticsCollector && typeof statisticsCollector.collectBatch === 'function') {
                        await statisticsCollector.collectBatch(events);
                    }
                    
                    // 定期的にメモリクリーンアップ
                    if (i % 20 === 0 && global.gc) {
                        global.gc();
                    }
                }

                const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const memoryIncrease = finalMemory - initialMemory;
                const increaseInMB = memoryIncrease / 1024 / 1024;

                console.log(`Memory increase during collection: ${increaseInMB.toFixed(2)}MB`);

                // メモリ増加は適切な範囲内であること
                expect(increaseInMB).toBeLessThan(100); // 100MB以下
            });

            test('長期間データ収集でのメモリリーク検出', async () => {
                const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const statisticsCollector = this.mainTestSuite.statisticsCollector;

                // 長期間のデータ収集をシミュレート
                const cycles = 50;
                for (let cycle = 0; cycle < cycles; cycle++) {
                    const events = DataGenerator.generateGameplayEvents(20);
                    
                    if (statisticsCollector && typeof statisticsCollector.collectBatch === 'function') {
                        await statisticsCollector.collectBatch(events);
                    }
                    
                    // 定期的なクリーンアップ
                    if (cycle % 10 === 0 && statisticsCollector && typeof statisticsCollector.cleanup === 'function') {
                        await statisticsCollector.cleanup();
                    }
                    
                    if (global.gc && cycle % 5 === 0) {
                        global.gc();
                    }
                }

                const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
                const memoryLeak = finalMemory - initialMemory;
                const leakInMB = memoryLeak / 1024 / 1024;

                console.log(`Potential memory leak: ${leakInMB.toFixed(2)}MB`);

                // メモリリークは最小限であること
                expect(leakInMB).toBeLessThan(20); // 20MB以下
            });
        });

        describe('データ品質とパフォーマンス', () => {
            test('データ検証処理の性能', async () => {
                const measurement = new PerformanceMeasurement('data_validation');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;

                // 正常データと異常データが混在するデータセット
                const validEvents = DataGenerator.generateGameplayEvents(800);
                const invalidEvents = DataGenerator.generateInvalidEvents(200);
                const mixedEvents = [...validEvents, ...invalidEvents].sort(() => Math.random() - 0.5);

                measurement.startMeasurement();
                
                let validatedCount = 0;
                let rejectedCount = 0;

                for (const event of mixedEvents) {
                    if (statisticsCollector && typeof statisticsCollector.validateAndCollect === 'function') {
                        try {
                            await statisticsCollector.validateAndCollect(event);
                            validatedCount++;
                        } catch (error) {
                            rejectedCount++;
                        }
                    }
                }

                const result = measurement.endMeasurement();

                console.log('Data validation performance:', result);
                console.log(`Validated: ${validatedCount}, Rejected: ${rejectedCount}`);

                // データ検証処理も高速であること
                expect(result.duration).toBeLessThan(2000); // 2秒以内
                expect(validatedCount).toBeGreaterThan(700); // 大部分が正常データ
                expect(rejectedCount).toBeGreaterThan(150); // 異常データも適切に検出
            });

            test('データ変換処理の性能', async () => {
                const measurement = new PerformanceMeasurement('data_transformation');
                const statisticsCollector = this.mainTestSuite.statisticsCollector;

                const rawEvents = DataGenerator.generateRawGameplayData(500);

                measurement.startMeasurement();

                const transformedEvents = [];
                for (const rawEvent of rawEvents) {
                    if (statisticsCollector && typeof statisticsCollector.transformData === 'function') {
                        const transformed = await statisticsCollector.transformData(rawEvent);
                        transformedEvents.push(transformed);
                    }
                }

                const result = measurement.endMeasurement();

                console.log('Data transformation performance:', result);

                // データ変換処理の性能要件
                expect(result.duration).toBeLessThan(1000); // 1秒以内
                expect(transformedEvents.length).toBe(rawEvents.length);
            });
        });
    }
}