/**
 * AnalyticsPerformanceOptimizer.test.ts
 * ゲーム分析パフォーマンス最適化システムのユニットテスト
 */
import { describe, test, beforeEach, afterEach, expect, jest  } from '@jest/globals';
import { AnalyticsPerformanceOptimizer  } from '../../src/analytics/AnalyticsPerformanceOptimizer.js';
// Type definitions for test objects
interface PerformanceHistory {
    timestamp: number;
    fps: number;
interface EventData {
    [key: string]: any;
interface EventHandler {
    (type: string, data: EventData): void;
interface QueuedEvent {
    type: string;
    timestamp: number;
    data: EventData;
    handler?: EventHandler;
interface GroupedEvents {
    [type: string]: QueuedEvent[];
interface OptimizerConfig {
    batchSize: number;
    batchTimeout: number;
    cacheSize: number;
    performanceCheckInterval?: number;
    cacheTimeout?: number;
    memoryWarningThreshold?: number;
interface PerformanceMetrics {
    memoryUsage: number;
    cacheHitRate: number;
    fps?: number;
interface MemoryUsage {
    current: number;
interface OptimizationStats {
    batchesProcessed: number;
    cacheHits: number;
    cacheMisses: number;
    performanceWarnings: number;
    memoryCleanups: number;
interface OptimizationStatsResponse extends OptimizationStats {
    performanceMetrics: PerformanceMetrics;
    memoryUsage: MemoryUsage;
    config: OptimizerConfig;
    eventQueueSize: number;
    cacheSize: number;
interface PerformanceReportSummary {
    batchesProcessed: number;
    cacheHitRate: string;
interface PerformanceReport {
    summary: PerformanceReportSummary;
    recommendations: string[];
    detailedStats: OptimizationStatsResponse;
// モックAnalyticsManager
class MockAnalyticsManager {
    public trackEvent: jest.Mock;
    public trackPlayerBehavior: jest.Mock;
    public performanceHistory: PerformanceHistory[];
    constructor() {
        this.trackEvent = jest.fn();
        this.trackPlayerBehavior = jest.fn(');'
        this.performanceHistory = [] }
}
// モックPerformance.memory
interface MockPerformanceMemory {
    usedJSHeapSize: number;
declare global {
    interface Performance {
        memory?: MockPerformanceMemory;
}
describe('AnalyticsPerformanceOptimizer', () => {
    let mockAnalyticsManager: MockAnalyticsManager,
    let optimizer: AnalyticsPerformanceOptimizer,
    beforeEach(() => {
        mockAnalyticsManager = new MockAnalyticsManager();
        optimizer = new AnalyticsPerformanceOptimizer(mockAnalyticsManager, {
            batchSize: 5,
            batchTimeout: 1000,
            cacheSize: 100,
            performanceCheckInterval: 100
        };
        // タイマーのモック
        jest.useFakeTimers();
    };
    afterEach(() => {
        optimizer.destroy();
        jest.clearAllTimers();
        jest.useRealTimers() }');'
    describe('初期化', (') => {'
        test('デフォルト設定で初期化される', () => {
            const defaultOptimizer = new AnalyticsPerformanceOptimizer(mockAnalyticsManager);
            expect(defaultOptimizer.config.batchSize).toBe(50);
            expect(defaultOptimizer.config.batchTimeout).toBe(5000);
            expect(defaultOptimizer.config.cacheSize).toBe(1000);
            expect(defaultOptimizer.eventQueue).toEqual([]);
            expect(defaultOptimizer.cache.size).toBe(0);
            defaultOptimizer.destroy() }');'
        test('カスタム設定で初期化される', () => {
            expect(optimizer.config.batchSize).toBe(5);
            expect(optimizer.config.batchTimeout).toBe(1000);
            expect(optimizer.config.cacheSize).toBe(100) }');'
    }
    describe('バッチ処理', (') => {'
        test('イベントがキューに追加される', (') => {'
            optimizer.batchEvent('test_event', { data: 'test' }, jest.fn();
            expect(optimizer.eventQueue.length).toBe(1);
            expect(optimizer.eventQueue[0].type').toBe('test_event');'
            expect(optimizer.eventQueue[0].data').toEqual({ data: 'test' )' }
        test('バッチサイズに達すると即座に処理される', async () => {
            const handler = jest.fn();
            // バッチサイズ（5個）のイベントを追加
            for (let i = 0, i < 5, i++) {
                optimizer.batchEvent(`event_${i}`, { index: i,, handler);
            }
            
            // 少し待って処理完了を確認
            await new Promise(resolve => setTimeout(resolve, 5);
            expect(optimizer.eventQueue.length).toBe(0);
            expect(handler).toHaveBeenCalledTimes(5);
        }');'
        test('タイムアウトでバッチ処理が実行される', async () => {
            const handler = jest.fn('),'
            optimizer.batchEvent('timeout_event', { data: 'test' }, handler);
            // バッチタイムアウト時間を進める
            jest.advanceTimersByTime(1000);
            await new Promise(resolve => setTimeout(resolve, 10);
            expect(optimizer.eventQueue.length).toBe(0);
            expect(handler).toHaveBeenCalledTimes(1);
        }');'
        test('イベントタイプ別にグループ化される', (') => {'
            const events: QueuedEvent[] = [
                { type: 'typeA', data: { value: 'data1' }, timestamp: Date.now(') },'
                { type: 'typeB', data: { value: 'data2' }, timestamp: Date.now(') },'
                { type: 'typeA', data: { value: 'data3' }, timestamp: Date.now() }
            ];
            
            const grouped: GroupedEvents = optimizer.groupEventsByType(events,
            expect(grouped.typeA).toHaveLength(2);
            expect(grouped.typeB).toHaveLength(1);
            expect(grouped.typeA[0].data.value').toBe('data1');'
            expect(grouped.typeA[1].data.value').toBe('data3');'
        }');'
    }
    describe('キャッシュ機能', (') => {'
        test('データがキャッシュに保存される', (') => {'
            const testData = { value: 'cached_data' },
            
            optimizer.setCachedData('test_key', testData');'
            const retrieved = optimizer.getCachedData('test_key');
            expect(retrieved).toEqual(testData);
            expect(optimizer.optimizationStats.cacheHits).toBe(1);
        }');'
        test('期限切れのキャッシュは取得できない', (') => {'
            const testData = { value: 'expired_data' },
            
            optimizer.setCachedData('expiring_key', testData);
            // キャッシュタイムアウトを超過
            jest.advanceTimersByTime(optimizer.config.cacheTimeout! + 1000');'
            const retrieved = optimizer.getCachedData('expiring_key');
            expect(retrieved).toBeNull();
            expect(optimizer.optimizationStats.cacheMisses).toBe(1);
        }');'
        test('キャッシュサイズ制限が機能する', () => {
            // キャッシュサイズ制限を超えてデータを追加
            for (let i = 0, i < optimizer.config.cacheSize + 10, i++) {
                optimizer.setCachedData(`key_${i}`, { index: i,);
            }
            
            expect(optimizer.cache.size).toBeLessThanOrEqual(optimizer.config.cacheSize);
        }');'
        test('キャッシュクリーンアップが機能する', (') => {'
            // 期限切れのデータを追加
            optimizer.setCachedData('old_key', { data: 'old' };
            // 時間を進めて期限切れにする
            jest.advanceTimersByTime(optimizer.config.cacheTimeout! + 1000');'
            // 新しいデータを追加してクリーンアップを誘発
            optimizer.setCachedData('new_key', { data: 'new' ,
            optimizer.cleanupCache('),'
            expect(optimizer.cache.has('old_key').toBe(false'),'
            expect(optimizer.cache.has('new_key').toBe(true) }');'
    }
    describe('パフォーマンス監視', (') => {'
        test('パフォーマンスメトリクスが更新される', (') => {'
            // performance.memoryをモック
            Object.defineProperty(global.performance, 'memory', {
                writable: true,
                value: {
                    usedJSHeapSize: 50 * 1024 * 1024 // 50MB
                };
            };
            optimizer.checkPerformanceMetrics();
            expect(optimizer.performanceMetrics.memoryUsage).toBe(50 * 1024 * 1024);
            expect(optimizer.memoryUsage.current).toBe(50 * 1024 * 1024);
        }');'
        test('キャッシュヒット率が計算される', () => {
            optimizer.optimizationStats.cacheHits = 80,
            optimizer.optimizationStats.cacheMisses = 20,
            
            optimizer.checkPerformanceMetrics();
            expect(optimizer.performanceMetrics.cacheHitRate).toBe(80) }');'
        test('メモリ警告が発生する', (') => {'
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}');'
            // メモリ警告閾値を超過
            Object.defineProperty(global.performance, 'memory', {
                writable: true,
                value: {
                    usedJSHeapSize: optimizer.config.memoryWarningThreshold! + 1024 * 1024
                };
            };
            optimizer.checkPerformanceMetrics();
            expect(consoleSpy').toHaveBeenCalledWith('High memory usage detected, performing aggressive cleanup');'
            expect(optimizer.optimizationStats.performanceWarnings).toBeGreaterThan(0);
            consoleSpy.mockRestore();
        }');'
    }
    describe('メモリ管理', (') => {'
        test('メモリクリーンアップが実行される', () => {
            // 古いイベントを追加
            const oldTimestamp = Date.now(') - 400000, // 6分前'
            optimizer.eventQueue.push({
                type: 'old_event',
                timestamp: oldTimestamp,
                data: {},
            }');'
            // 新しいイベントを追加
            optimizer.eventQueue.push({
                type: 'new_event'),
               , timestamp: Date.now(
                data: {}
            };
            optimizer.performMemoryCleanup();
            // 古いイベントが削除され、新しいイベントは残る
            expect(optimizer.eventQueue.length).toBe(1);
            expect(optimizer.eventQueue[0].type').toBe('new_event');'
            expect(optimizer.optimizationStats.memoryCleanups).toBeGreaterThan(0);
        }');'
        test('パフォーマンス履歴がクリーンアップされる', () => {
            // 古いパフォーマンス履歴を追加
            const oldTimestamp = Date.now() - 7200000, // 2時間前
            mockAnalyticsManager.performanceHistory = [
                { timestamp: oldTimestamp, fps: 60 },
                { timestamp: Date.now(), fps: 55 }
            ];
            
            optimizer.performMemoryCleanup();
            expect(mockAnalyticsManager.performanceHistory.length).toBe(1);
            expect(mockAnalyticsManager.performanceHistory[0].fps).toBe(55);
        }');'
    }
    describe('最適化統計', (') => {'
        test('最適化統計が取得できる', () => {
            optimizer.optimizationStats.batchesProcessed = 10,
            optimizer.optimizationStats.cacheHits = 50,
            optimizer.optimizationStats.cacheMisses = 10,
            
            const stats: OptimizationStatsResponse = optimizer.getOptimizationStats(
            expect(stats.batchesProcessed).toBe(10);
            expect(stats.performanceMetrics).toBeDefined();
            expect(stats.memoryUsage).toBeDefined();
            expect(stats.config).toBeDefined();
            expect(stats.eventQueueSize).toBeDefined();
            expect(stats.cacheSize).toBeDefined() }');'
        test('パフォーマンスレポートが生成される', () => {
            optimizer.optimizationStats.batchesProcessed = 5,
            optimizer.performanceMetrics.cacheHitRate = 75,
            optimizer.performanceMetrics.fps = 45,
            
            const report: PerformanceReport = optimizer.generatePerformanceReport(
            expect(report.summary).toBeDefined();
            expect(report.recommendations).toBeDefined();
            expect(report.detailedStats).toBeDefined();
            expect(report.summary.batchesProcessed).toBe(5);
            expect(report.summary.cacheHitRate').toBe('75.00%') }');
        test('最適化推奨事項が生成される', () => {
            const mockStats: OptimizationStatsResponse = {
                batchesProcessed: 0,
                cacheHits: 0,
                cacheMisses: 0,
                performanceWarnings: 0,
                memoryCleanups: 0,
                performanceMetrics: {
                    cacheHitRate: 60, // 低いキャッシュヒット率
                    memoryUsage: 0,
                    fps: 25 // 低いFPS
                },
                memoryUsage: {
                    current: optimizer.config.memoryWarningThreshold! + 1024 * 1024 // 高いメモリ使用量
                },
                config: optimizer.config,
                eventQueueSize: optimizer.config.batchSize * 3, // 大きなイベントキュー
                cacheSize: 0
            };
            
            const recommendations: string[] = optimizer.generateOptimizationRecommendations(mockStats,
            expect(recommendations').toContain('キャッシュヒット率が低いです。キャッシュサイズを増やすことを検討してください。');'
            expect(recommendations').toContain('FPSが低下しています。バッチサイズを小さくするか、処理間隔を長くしてください。');'
            expect(recommendations').toContain('メモリ使用量が多いです。より頻繁なクリーンアップを実行してください。');'
            expect(recommendations').toContain('イベントキューが大きくなっています。バッチ処理頻度を上げてください。');'
        }');'
    }
    describe('設定動的調整', (') => {'
        test('設定が動的に調整される', () => {
            const newConfig: Partial<OptimizerConfig> = {
                batchSize: 100,
                batchTimeout: 2000,
                cacheSize: 500
            };
            
            optimizer.adjustConfiguration(newConfig);
            expect(optimizer.config.batchSize).toBe(100);
            expect(optimizer.config.batchTimeout).toBe(2000);
            expect(optimizer.config.cacheSize).toBe(500);
        }');'
        test('パフォーマンス警告時に設定が自動調整される', (') => {'
            const originalBatchSize = optimizer.config.batchSize,
            const originalBatchTimeout = optimizer.config.batchTimeout,
            
            // fpsThreshold（30）より低い値で警告をトリガー
            optimizer.handlePerformanceWarning('Low FPS detected', { fps: 20 };
            expect(optimizer.config.batchSize).toBeLessThan(originalBatchSize);
            expect(optimizer.config.batchTimeout).toBeGreaterThan(originalBatchTimeout);
            expect(optimizer.optimizationStats.performanceWarnings).toBe(1);
        }');'
    }
    describe('イベント処理最適化', (') => {'
        test('元のイベント送信メソッドがオーバーライドされる', () => {
            expect(typeof mockAnalyticsManager.trackEvent').toBe('function'),'
            expect(typeof mockAnalyticsManager.trackPlayerBehavior').toBe('function') }');
        test('フォールバック処理が機能する', async (') => {'
            const events: QueuedEvent[] = [
                { type: 'test', timestamp: Date.now(), data: { value: 1 }, handler: jest.fn(') },'
                { type: 'test', timestamp: Date.now(), data: { value: 2 }, handler: jest.fn() }
            ];
            
            await optimizer.fallbackToIndividualProcessing(events);
            events.forEach(event => {);
                expect(event.handler!).toHaveBeenCalledWith(event.type, event.data) };
        }
    }');'
    describe('破棄処理', (') => {'
        test('リソースが適切にクリーンアップされる', (') => {'
            // バッチタイマーを設定
            optimizer.batchEvent('test', {}, jest.fn();
            expect(optimizer.batchTimer).toBeTruthy();
            optimizer.destroy();
            expect(optimizer.cache.size).toBe(0);
            expect(optimizer.cacheTimestamps.size).toBe(0);
        }');'
        test('残りのイベントが処理される', async () => {
            const handler = jest.fn('),'
            optimizer.batchEvent('final_event', { final: true,, handler);
            optimizer.destroy();
            // 少し待って処理完了を確認
            await new Promise(resolve => setTimeout(resolve, 5);
            expect(handler').toHaveBeenCalledWith('final_event', { final: true,'
    }');'
}