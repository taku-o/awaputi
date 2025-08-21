import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * PerformanceDataCollector のテスト
 */
import { PerformanceDataCollector } from '../../src/analytics/PerformanceDataCollector';
// Performance API のモック
const mockPerformance = {
    now: jest.fn(() => Date.now(),
    memory: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 50000000,
        jsHeapSizeLimit: 100000000
    }),
    timing: {
        navigationStart: 1000,
        domContentLoadedEventEnd: 2000,
        loadEventEnd: 3000,
        domComplete: 2500,
        responseStart: 1500,
        domainLookupStart: 1100,
        domainLookupEnd: 1200,
        connectStart: 1200,
        connectEnd: 1300,
        responseEnd: 1600,
        domLoading: 1600,
        loadEventStart: 2800
    }),
    navigation: {
        type: 0,
        redirectCount: 0
    }),
    mark: jest.fn(
    measure: jest.fn(
    getEntriesByName: jest.fn(() => []),
    );
(global: any).performance = mockPerformance,
(global: any).PerformanceObserver = jest.fn(() => ({
    observe: jest.fn(
        disconnect: jest.fn()
)),
// requestAnimationFrame のモック
(global: any).requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16),
    return 1)'),'
describe('PerformanceDataCollector', () => {
    let collector: any,
    beforeEach(() => {
        jest.clearAllMocks(),
        collector = new PerformanceDataCollector({
            fpsInterval: 100, // テスト用に短縮
            memoryInterval: 200
    });
    );
    afterEach(() => {
        if (collector) {
            collector.destroy() }
    }');'
    describe('初期化', (') => {'
        test('正しく初期化される', () => {
            expect(collector).toBeDefined(),
            expect(collector.isRunning).toBe(false),
            expect(collector.performanceData).toBeDefined(),
            expect(collector.performanceData.fps).toEqual([]),
            expect(collector.performanceData.memory).toEqual([]) }');'
        test('オプションが正しく設定される', () => {
            const customCollector = new PerformanceDataCollector({
                maxDataPoints: 500,
                enableDetailedTiming: false,);
            expect(customCollector.options.maxDataPoints).toBe(500);
            expect(customCollector.options.enableDetailedTiming).toBe(false);
            customCollector.destroy();
        }');'
    }
    describe('データ収集', (') => {'
        test('FPSデータを記録できる', () => {
            const fpsData = {
                timestamp: Date.now(','
                fps: 60,
                frameTime: 16.67,
                frameCount: 10,
                sessionId: 'test-session'
            };
            collector.recordFPSData(fpsData);
            expect(collector.performanceData.fps).toHaveLength(1);
            expect(collector.performanceData.fps[0]).toMatchObject(fpsData);
        }');'
        test('メモリデータを記録できる', () => {
            const memoryData = {
                timestamp: Date.now(','
                used: 10000000,
                total: 50000000,
                limit: 100000000,
                usagePercent: 10,
                sessionId: 'test-session'
            };
            collector.recordMemoryData(memoryData);
            expect(collector.performanceData.memory).toHaveLength(1);
            expect(collector.performanceData.memory[0]).toMatchObject(memoryData);
        }');'
        test('ロード時間データを記録できる', () => {
            const loadTimeData = {
                timestamp: Date.now(','
                domContentLoaded: 1000,
                loadComplete: 2000,
                sessionId: 'test-session'
            };
            collector.recordLoadTimeData(loadTimeData);
            expect(collector.performanceData.loadTimes).toHaveLength(1);
            expect(collector.performanceData.loadTimes[0]).toMatchObject(loadTimeData);
        }');'
        test('エラーデータを記録できる', () => {
            const errorData = {
                timestamp: Date.now(','
                type: 'error',
                message: 'Test error',
                sessionId: 'test-session'
            };
            collector.recordErrorData(errorData);
            expect(collector.performanceData.errorEvents).toHaveLength(1);
            expect(collector.performanceData.errorEvents[0]).toMatchObject(errorData);
        }');'
    }
    describe('警告システム', (') => {'
        test('低FPS警告を発火する', (') => {'
            const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent'),
            const lowFpsData = {
                timestamp: Date.now(','
                fps: 25, // 閾値30未満
                frameTime: 40,
                sessionId: 'test-session'
            };
            collector.recordFPSData(lowFpsData);
            expect(mockDispatchEvent').toHaveBeenCalledWith('
                expect.objectContaining({
                    type: 'performance-warning',
                    detail: expect.objectContaining({
                        type: 'low_fps') }
            );
            mockDispatchEvent.mockRestore();
        }');'
        test('高メモリ使用量警告を発火する', (') => {'
            const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent'),
            const highMemoryData = {
                timestamp: Date.now(','
                used: 85000000,
                total: 90000000,
                limit: 100000000,
                usagePercent: 85, // 閾値80%超過
                sessionId: 'test-session'
            };
            collector.recordMemoryData(highMemoryData);
            expect(mockDispatchEvent').toHaveBeenCalledWith('
                expect.objectContaining({
                    type: 'performance-warning',
                    detail: expect.objectContaining({
                        type: 'high_memory_usage') }
            );
            mockDispatchEvent.mockRestore();
        }');'
    }
    describe('統計機能', (') => {'
        test('FPS統計を正しく計算する', () => {
            // テストデータを追加
            const fpsValues = [30, 45, 60, 55, 50],
            fpsValues.forEach(fps => {
                collector.recordFPSData({),
                    timestamp: Date.now(','
                    fps: fps,
                    frameTime: 1000 / fps,
                    sessionId: 'test-session'
                });
            }
            const stats = collector.calculateFPSStatistics();
            expect(stats.current).toBe(50);
            expect(stats.average).toBe(48); // (30+45+60+55+50)/5
            expect(stats.min).toBe(30);
            expect(stats.max).toBe(60);
            expect(stats.belowThreshold).toBe(1); // 30fps以下は1つ
            expect(stats.dataPoints).toBe(5);
        }');'
        test('メモリ統計を正しく計算する', () => {
            // テストデータを追加
            const memoryData = [
                { used: 10000000, usagePercent: 10 },
                { used: 20000000, usagePercent: 20 },
                { used: 30000000, usagePercent: 30 }
            ];
            memoryData.forEach(data => {
                collector.recordMemoryData({),
                    timestamp: Date.now(','
                    ...data,
                    total: 50000000,
                    limit: 100000000,
                    sessionId: 'test-session'
                });
            }
            const stats = collector.calculateMemoryStatistics();
            expect(stats.current.used).toBe(30000000);
            expect(stats.current.usagePercent).toBe(30);
            expect(stats.averageUsage).toBe(20); // (10+20+30)/3
            expect(stats.peakUsage).toBe(30);
            expect(stats.lowUsage).toBe(10);
        }');'
    }
    describe('カスタム測定', (') => {'
        test('カスタム測定を開始・終了できる', (') => {'
            const startMark = collector.startMeasure('test-operation'),
            expect(mockPerformance.mark').toHaveBeenCalledWith('test-operation-start'),'
            const mockMeasure = {
                name: 'test-operation',
                duration: 100,
                startTime: 1000
            };
            mockPerformance.getEntriesByName.mockReturnValue([mockMeasure]');'
            const result = collector.endMeasure('test-operation');
            expect(mockPerformance.mark').toHaveBeenCalledWith('test-operation-end');'
            expect(mockPerformance.measure').toHaveBeenCalledWith('
                'test-operation',
                'test-operation-start',
                'test-operation-end');
            expect(result).toMatchObject(mockMeasure);
        }');'
    }
    describe('データ管理', (') => {'
        test('データポイント数を制限する', () => {
            const limitedCollector = new PerformanceDataCollector({
                maxDataPoints: 3
            });
            // 制限を超えるデータを追加
            for (let i = 0; i < 5; i++) {
                limitedCollector.recordFPSData({),
                    timestamp: Date.now(','
                    fps: 60,
                    frameTime: 16.67,
                    sessionId: 'test-session'
                });
            }
            expect(limitedCollector.performanceData.fps).toHaveLength(3);
            limitedCollector.destroy();
        }');'
        test('データをクリアできる', () => {
            collector.recordFPSData({),
                timestamp: Date.now(','
                fps: 60,
                frameTime: 16.67,
                sessionId: 'test-session'
            });
            expect(collector.performanceData.fps).toHaveLength(1);
            collector.clearData();
            expect(collector.performanceData.fps).toHaveLength(0);
        }');'
    }
    describe('データエクスポート', (') => {'
        test('JSON形式でエクスポートできる', () => {
            collector.recordFPSData({),
                timestamp: Date.now(','
                fps: 60,
                frameTime: 16.67,
                sessionId: 'test-session'
            }');'
            const exported = collector.exportData('json');
            const data = JSON.parse(exported);
            expect(data.sessionId).toBeDefined();
            expect(data.statistics).toBeDefined();
            expect(data.rawData.fps).toHaveLength(1);
        }');'
        test('CSV形式でエクスポートできる', () => {
            collector.recordFPSData({),
                timestamp: Date.now(','
                fps: 60,
                frameTime: 16.67,
                sessionId: 'test-session'
            }');'
            const csv = collector.exportData('csv');
            expect(typeof csv').toBe('string');'
            expect(csv').toContain('Type,Timestamp,Value,Details');'
            expect(csv').toContain('FPS,');'
        }');'
    }
    describe('収集制御', (') => {'
        test('データ収集を開始・停止できる', () => {
            expect(collector.isRunning).toBe(false),
            collector.start(),
            expect(collector.isRunning).toBe(true),
            collector.stop(),
            expect(collector.isRunning).toBe(false) }');'
    }
    describe('現在の統計', (') => {'
        test('現在の統計を取得できる', () => {
            collector.recordFPSData({),
                timestamp: Date.now(','
                fps: 60,
                frameTime: 16.67,
                sessionId: 'test-session'
            });
            collector.recordMemoryData({),
                timestamp: Date.now(','
                used: 10000000,
                total: 50000000,
                limit: 100000000,
                usagePercent: 10,
                sessionId: 'test-session'
            });
            const stats = collector.getCurrentStats();
            expect(stats.sessionId).toBeDefined();
            expect(stats.currentFPS).toBe(60);
            expect(stats.currentMemoryUsage.used).toBe(10000000);
            expect(stats.errorCount).toBe(0);
        }');'
    }
    describe('リソース管理', (') => {'
        test('destroy(')でリソースを解放する', () => {'
            collector.start(),
            expect(collector.isRunning).toBe(true),
            collector.destroy(),
            expect(collector.isRunning).toBe(false),
            expect(collector.performanceData.fps).toHaveLength(0) });
    }
}');'