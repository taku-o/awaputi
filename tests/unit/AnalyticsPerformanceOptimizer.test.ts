/**
 * AnalyticsPerformanceOptimizer.test.ts
 * ゲーム分析パフォーマンス最適化システムのユニットテスト
 */
import { describe, test, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { AnalyticsPerformanceOptimizer } from '../../src/analytics/AnalyticsPerformanceOptimizer.js';

// Type definitions for test objects
interface PerformanceHistory { 
    timestamp: number; 
    fps: number; 
}

interface EventData {
    [key: string]: any;
}

interface EventHandler {
    (type: string, data: EventData): void;
}

interface QueuedEvent {
    type: string;
    timestamp: number;
    data: EventData;
    handler?: EventHandler;
}

interface GroupedEvents {
    [type: string]: QueuedEvent[];
}

interface OptimizerConfig {
    batchSize: number;
    batchTimeout: number;
    cacheSize: number;
    performanceCheckInterval?: number;
    cacheTimeout?: number;
    memoryWarningThreshold?: number;
}

interface PerformanceMetrics {
    memoryUsage: number;
    cacheHitRate: number;
    fps?: number;
}

interface MemoryUsage {
    current: number;
}

interface OptimizationStats {
    batchesProcessed: number;
    cacheHits: number;
    cacheMisses: number;
    performanceWarnings: number;
    memoryCleanups: number;
}

interface OptimizationStatsResponse extends OptimizationStats {
    performanceMetrics: PerformanceMetrics;
    memoryUsage: MemoryUsage;
    config: OptimizerConfig;
    eventQueueSize: number;
    cacheSize: number;
}

interface PerformanceReportSummary { 
    batchesProcessed: number; 
    cacheHitRate: string; 
}

interface PerformanceReport {
    summary: PerformanceReportSummary;
    recommendations: string[];
    detailedStats: OptimizationStatsResponse;
}

// モックAnalyticsManager
class MockAnalyticsManager {
    public trackEvent: jest.Mock<void, [string, EventData]>;
    public trackPlayerBehavior: jest.Mock<void, [string, EventData]>;
    public performanceHistory: PerformanceHistory[];

    constructor() {
        this.trackEvent = jest.fn();
        this.trackPlayerBehavior = jest.fn();
        this.performanceHistory = [];
    }
}

// モックPerformance.memory
interface MockPerformanceMemory {
    usedJSHeapSize: number;
}

declare global {
    interface Performance {
        memory?: MockPerformanceMemory;
    }
}

describe('AnalyticsPerformanceOptimizer', () => {
    let optimizer: AnalyticsPerformanceOptimizer;
    let mockAnalyticsManager: MockAnalyticsManager;

    beforeEach(() => {
        jest.useFakeTimers();
        mockAnalyticsManager = new MockAnalyticsManager();

        // performance.memory のモック
        Object.defineProperty(global.performance, 'memory', {
            value: { usedJSHeapSize: 50 * 1024 * 1024 }, // 50MB
            configurable: true
        });

        optimizer = new AnalyticsPerformanceOptimizer(mockAnalyticsManager);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(optimizer).toBeDefined();
            expect(optimizer.analyticsManager).toBe(mockAnalyticsManager);
        });

        test('デフォルト設定が適用される', () => {
            const config = optimizer.getConfig();
            expect(config.batchSize).toBe(10);
            expect(config.batchTimeout).toBe(5000);
            expect(config.cacheSize).toBe(100);
        });

        test('カスタム設定で初期化できる', () => {
            const customConfig: OptimizerConfig = {
                batchSize: 20,
                batchTimeout: 3000,
                cacheSize: 200,
                performanceCheckInterval: 10000
            };

            const customOptimizer = new AnalyticsPerformanceOptimizer(
                mockAnalyticsManager,
                customConfig
            );

            const config = customOptimizer.getConfig();
            expect(config.batchSize).toBe(20);
            expect(config.batchTimeout).toBe(3000);
            expect(config.cacheSize).toBe(200);
            expect(config.performanceCheckInterval).toBe(10000);
        });
    });

    describe('イベントバッチ処理', () => {
        test('イベントが正常にキューに追加される', () => {
            const eventData: EventData = { action: 'bubble_pop', score: 100 };
            
            optimizer.batchEvent('game_action', eventData);
            
            const stats = optimizer.getOptimizationStats();
            expect(stats.eventQueueSize).toBe(1);
        });

        test('バッチサイズに達したときに自動処理される', () => {
            const config = optimizer.getConfig();
            
            // バッチサイズ分のイベントを追加
            for (let i = 0; i < config.batchSize; i++) {
                optimizer.batchEvent('test_event', { index: i });
            }

            // バッチが処理されたことを確認
            expect(mockAnalyticsManager.trackEvent).toHaveBeenCalledTimes(config.batchSize);
        });

        test('タイムアウト時にバッチが処理される', () => {
            optimizer.batchEvent('timeout_test', { data: 'test' });
            
            // タイムアウト時間を経過
            jest.advanceTimersByTime(5100);
            
            expect(mockAnalyticsManager.trackEvent).toHaveBeenCalledWith(
                'timeout_test',
                { data: 'test' }
            );
        });

        test('同じタイプのイベントがグループ化される', () => {
            optimizer.batchEvent('grouped_event', { id: 1 });
            optimizer.batchEvent('grouped_event', { id: 2 });
            optimizer.batchEvent('other_event', { id: 3 });

            const stats = optimizer.getOptimizationStats();
            expect(stats.eventQueueSize).toBe(3);
            
            // グループ化されたイベントの処理を確認
            jest.advanceTimersByTime(5100);
            expect(mockAnalyticsManager.trackEvent).toHaveBeenCalledTimes(3);
        });
    });

    describe('キャッシング機能', () => {
        test('データがキャッシュに保存される', () => {
            const testData = { cached: true, value: 'test' };
            
            optimizer.cache('test_key', testData);
            const retrieved = optimizer.getCached('test_key');
            
            expect(retrieved).toEqual(testData);
        });

        test('キャッシュヒット統計が記録される', () => {
            optimizer.cache('hit_test', { data: 'cached' });
            optimizer.getCached('hit_test');
            
            const stats = optimizer.getOptimizationStats();
            expect(stats.cacheHits).toBe(1);
            expect(stats.cacheMisses).toBe(0);
        });

        test('キャッシュミス統計が記録される', () => {
            optimizer.getCached('non_existent_key');
            
            const stats = optimizer.getOptimizationStats();
            expect(stats.cacheMisses).toBe(1);
            expect(stats.cacheHits).toBe(0);
        });

        test('キャッシュサイズ制限が適用される', () => {
            const config = optimizer.getConfig();
            
            // キャッシュ容量を超えるデータを追加
            for (let i = 0; i < config.cacheSize + 10; i++) {
                optimizer.cache(`key_${i}`, { value: i });
            }
            
            const stats = optimizer.getOptimizationStats();
            expect(stats.cacheSize).toBeLessThanOrEqual(config.cacheSize);
        });

        test('期限切れキャッシュが削除される', () => {
            const customConfig: OptimizerConfig = {
                batchSize: 10,
                batchTimeout: 5000,
                cacheSize: 100,
                cacheTimeout: 1000 // 1秒でタイムアウト
            };

            const customOptimizer = new AnalyticsPerformanceOptimizer(
                mockAnalyticsManager,
                customConfig
            );

            customOptimizer.cache('expiring_key', { data: 'will_expire' });
            
            // タイムアウト時間を経過
            jest.advanceTimersByTime(1100);
            
            const retrieved = customOptimizer.getCached('expiring_key');
            expect(retrieved).toBeNull();
        });
    });

    describe('パフォーマンス監視', () => {
        test('メモリ使用量が監視される', () => {
            const metrics = optimizer.getPerformanceMetrics();
            expect(metrics.memoryUsage).toBeDefined();
            expect(typeof metrics.memoryUsage).toBe('number');
        });

        test('高メモリ使用量で警告が記録される', () => {
            // メモリ使用量を高く設定
            Object.defineProperty(global.performance, 'memory', {
                value: { usedJSHeapSize: 200 * 1024 * 1024 }, // 200MB
                configurable: true
            });

            optimizer.checkPerformance();
            
            const stats = optimizer.getOptimizationStats();
            expect(stats.performanceWarnings).toBeGreaterThan(0);
        });

        test('FPS履歴が記録される', () => {
            optimizer.recordFPS(60);
            optimizer.recordFPS(58);
            optimizer.recordFPS(55);

            const metrics = optimizer.getPerformanceMetrics();
            expect(metrics.fps).toBeDefined();
        });

        test('パフォーマンスチェックが定期実行される', () => {
            const performanceCheckSpy = jest.spyOn(optimizer, 'checkPerformance');
            
            // 定期チェック間隔を経過
            jest.advanceTimersByTime(61000); // デフォルト60秒
            
            expect(performanceCheckSpy).toHaveBeenCalled();
        });
    });

    describe('最適化統計', () => {
        test('統計データが正しく取得される', () => {
            optimizer.batchEvent('stats_test', { data: 'test' });
            optimizer.cache('stats_cache', { cached: true });
            optimizer.getCached('stats_cache'); // キャッシュヒット
            optimizer.getCached('non_existent'); // キャッシュミス

            const stats = optimizer.getOptimizationStats();
            
            expect(stats.cacheHits).toBe(1);
            expect(stats.cacheMisses).toBe(1);
            expect(stats.eventQueueSize).toBe(1);
            expect(stats.performanceMetrics).toBeDefined();
        });

        test('パフォーマンスレポートが生成される', () => {
            // テストデータを設定
            optimizer.batchEvent('report_test', { data: 'test1' });
            optimizer.batchEvent('report_test', { data: 'test2' });
            optimizer.cache('report_cache', { cached: true });
            
            const report = optimizer.generatePerformanceReport();
            
            expect(report.summary).toBeDefined();
            expect(report.recommendations).toBeInstanceOf(Array);
            expect(report.detailedStats).toBeDefined();
        });

        test('パフォーマンス推奨事項が生成される', () => {
            // 低いキャッシュヒット率を設定
            for (let i = 0; i < 10; i++) {
                optimizer.getCached(`miss_key_${i}`); // すべてキャッシュミス
            }

            const report = optimizer.generatePerformanceReport();
            
            expect(report.recommendations.length).toBeGreaterThan(0);
            expect(report.recommendations.some(r => r.includes('キャッシュ'))).toBe(true);
        });
    });

    describe('設定更新', () => {
        test('設定が正常に更新される', () => {
            const newConfig: Partial<OptimizerConfig> = {
                batchSize: 15,
                batchTimeout: 3000
            };

            optimizer.updateConfig(newConfig);
            
            const config = optimizer.getConfig();
            expect(config.batchSize).toBe(15);
            expect(config.batchTimeout).toBe(3000);
            expect(config.cacheSize).toBe(100); // 元の値が保持される
        });

        test('無効な設定値は無視される', () => {
            const invalidConfig = {
                batchSize: -5,
                batchTimeout: 0,
                cacheSize: -10
            };

            const originalConfig = optimizer.getConfig();
            optimizer.updateConfig(invalidConfig);
            
            const config = optimizer.getConfig();
            // 元の設定が保持される
            expect(config.batchSize).toBe(originalConfig.batchSize);
            expect(config.batchTimeout).toBe(originalConfig.batchTimeout);
            expect(config.cacheSize).toBe(originalConfig.cacheSize);
        });
    });

    describe('メモリ管理', () => {
        test('メモリクリーンアップが実行される', () => {
            // キャッシュにデータを追加
            for (let i = 0; i < 50; i++) {
                optimizer.cache(`cleanup_key_${i}`, { data: `value_${i}` });
            }

            const beforeCleanup = optimizer.getOptimizationStats();
            optimizer.performMemoryCleanup();
            const afterCleanup = optimizer.getOptimizationStats();

            expect(afterCleanup.memoryCleanups).toBe(beforeCleanup.memoryCleanups + 1);
            expect(afterCleanup.cacheSize).toBeLessThanOrEqual(beforeCleanup.cacheSize);
        });

        test('不要なイベントキューがクリアされる', () => {
            // 多数のイベントをキューに追加
            for (let i = 0; i < 20; i++) {
                optimizer.batchEvent('cleanup_event', { index: i });
            }

            optimizer.performMemoryCleanup();
            
            const stats = optimizer.getOptimizationStats();
            expect(stats.eventQueueSize).toBe(0);
        });
    });

    describe('エラーハンドリング', () => {
        test('無効なイベントデータでもエラーが発生しない', () => {
            expect(() => {
                optimizer.batchEvent('error_test', null as any);
            }).not.toThrow();

            expect(() => {
                optimizer.batchEvent('error_test', undefined as any);
            }).not.toThrow();
        });

        test('カスタムハンドラーでエラーが発生してもシステムが継続する', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            const faultyHandler: EventHandler = () => {
                throw new Error('Handler error');
            };

            expect(() => {
                optimizer.batchEvent('error_test', { data: 'test' }, faultyHandler);
            }).not.toThrow();
            
            consoleSpy.mockRestore();
        });
    });
});