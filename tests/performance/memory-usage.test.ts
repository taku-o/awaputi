/**
 * メモリ使用量パフォーマンステスト
 * TypeScript移行 - Task 26対応
 * 
 * キャッシュシステムのメモリ使用量、リーク検出、自動クリーンアップ機能を測定します。
 */

// @ts-ignore 将来のテスト拡張で使用予定
import { jest } from '@jest/globals';
import { getCacheSystem } from '../../src/core/CacheSystem.js';

interface CacheConfig {
    maxSize: number;
    ttl: number;
    cleanupInterval: number;
}

interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
}

interface CacheSystem {
    get(key: string): any;
    set(key: string, value: void);
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    size: number;
    getStats(): CacheStats;
    destroy(): void;
}

// Mock performance API if not available
if (typeof performance === 'undefined') {
    (global as any).performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        memory: {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024
        }
    };
}

// サンプルデータ生成関数
function generateSampleData(size: number): string {
    return 'x'.repeat(size);
}

function generateTestObjects(count: number, size: number = 1024): Array<{ id: string; data: string }> {
    const objects: Array<{ id: string; data: string }> = [];
    for (let i = 0; i < count; i++) {
        objects.push({
            id: `test-${i}`,
            data: generateSampleData(size)
        });
    }
    return objects;
}

// メモリ使用量測定ヘルパー
function measureMemoryUsage(): number {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize;
    }
    return 0; // Fallback for environments without memory API
}

function calculateMemoryDelta(before: number, after: number): number {
    return after - before;
}

// 実行時間測定ヘルパー
function measureExecutionTime<T>(fn: () => T): { result: T; time: number } {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, time: end - start };
}

// メモリリーク検出ヘルパー
function detectMemoryGrowth(measurements: number[], threshold: number = 10 * 1024 * 1024): boolean {
    if (measurements.length < 2) return false;
    
    const growth = measurements[measurements.length - 1] - measurements[0];
    return growth > threshold;
}

// テスト用設定
const testConfigs: { [key: string]: CacheConfig } = {
    small: { maxSize: 100, ttl: 30000, cleanupInterval: 5000 },
    medium: { maxSize: 1000, ttl: 60000, cleanupInterval: 10000 },
    large: { maxSize: 10000, ttl: 120000, cleanupInterval: 20000 }
};

describe('Memory Usage Tests', () => {
    let cache: CacheSystem;
    
    beforeEach(() => {
        cache = getCacheSystem({
            maxSize: 1000,
            ttl: 60000,
            cleanupInterval: 10000
        }) as any;
    });
    
    afterEach(() => {
        if (cache) {
            cache.destroy();
        }
    });
    
    describe('基本メモリ使用量テスト', () => {
        test('空のキャッシュでは最小限のメモリを使用', () => {
            const memoryBefore = measureMemoryUsage();
            
            // キャッシュのサイズを確認
            expect(cache.size).toBe(0);
            
            const memoryAfter = measureMemoryUsage();
            const memoryDelta = calculateMemoryDelta(memoryBefore, memoryAfter);
            
            // メモリ使用量の増加が最小限であることを確認
            expect(memoryDelta).toBeLessThan(1024 * 1024); // 1MB以下
        });
        
        test('データ追加時のメモリ使用量増加', () => {
            const testData = generateTestObjects(100, 1024); // 100個のオブジェクト、各1KB
            const memoryBefore = measureMemoryUsage();
            
            // データをキャッシュに追加
            testData.forEach(obj => {
                cache.set(obj.id, obj);
            });
            
            const memoryAfter = measureMemoryUsage();
            const memoryDelta = calculateMemoryDelta(memoryBefore, memoryAfter);
            
            // メモリ使用量が適切に増加していることを確認
            expect(cache.size).toBe(100);
            expect(memoryDelta).toBeGreaterThan(0);
            expect(memoryDelta).toBeLessThan(10 * 1024 * 1024); // 10MB以下
        });
    });
    
    describe('メモリリーク検出テスト', () => {
        test('キャッシュクリア後のメモリ解放', () => {
            const testData = generateTestObjects(500, 2048); // 500個のオブジェクト、各2KB
            
            // データ追加前のメモリ使用量
            const memoryBefore = measureMemoryUsage();
            
            // データ追加
            testData.forEach(obj => {
                cache.set(obj.id, obj);
            });
            
            const memoryAfterAdd = measureMemoryUsage();
            
            // キャッシュクリア
            cache.clear();
            
            // 強制的にガベージコレクションを試行（可能な場合）
            if (global.gc) {
                global.gc();
            }
            
            // 少し待ってからメモリ測定
            const memoryAfterClear = measureMemoryUsage();
            
            // メモリが適切に解放されていることを確認
            expect(cache.size).toBe(0);
            const memoryGrowth = calculateMemoryDelta(memoryBefore, memoryAfterClear);
            expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // 5MB以下の増加
        });
        
        test('長時間実行でのメモリリーク検出', () => {
            const memoryMeasurements: number[] = [];
            const iterations = 50;
            
            for (let i = 0; i < iterations; i++) {
                // 各イテレーションでデータを追加・削除
                const testData = generateTestObjects(20, 1024);
                
                testData.forEach(obj => {
                    cache.set(obj.id, obj);
                });
                
                // 半分のデータを削除
                testData.slice(0, 10).forEach(obj => {
                    cache.delete(obj.id);
                });
                
                // メモリ使用量を記録
                memoryMeasurements.push(measureMemoryUsage());
                
                // 定期的にクリーンアップ
                if (i % 10 === 0) {
                    cache.clear();
                }
            }
            
            // メモリリークがないことを確認
            const hasLeak = detectMemoryGrowth(memoryMeasurements);
            expect(hasLeak).toBe(false);
        });
    });
    
    describe('パフォーマンス影響テスト', () => {
        test('メモリ使用量がパフォーマンスに与える影響', () => {
            const smallData = generateTestObjects(100, 512);
            const largeData = generateTestObjects(100, 8192);
            
            // 小さなデータでの操作時間測定
            const smallDataResult = measureExecutionTime(() => {
                smallData.forEach(obj => cache.set(obj.id, obj));
                return smallData.map(obj => cache.get(obj.id));
            });
            
            cache.clear();
            
            // 大きなデータでの操作時間測定
            const largeDataResult = measureExecutionTime(() => {
                largeData.forEach(obj => cache.set(obj.id, obj));
                return largeData.map(obj => cache.get(obj.id));
            });
            
            // パフォーマンスが著しく劣化していないことを確認
            const performanceRatio = largeDataResult.time / smallDataResult.time;
            expect(performanceRatio).toBeLessThan(5); // 5倍以上遅くならない
            
            // データが正しく取得できることを確認
            expect(smallDataResult.result).toHaveLength(100);
            expect(largeDataResult.result).toHaveLength(100);
        });
        
        test('異なるキャッシュサイズでのメモリ効率', () => {
            const results: { [key: string]: { memory: number; time: number } } = {};
            
            Object.entries(testConfigs).forEach(([configName, config]) => {
                const testCache = getCacheSystem(config) as CacheSystem;
                const testData = generateTestObjects(config.maxSize / 2, 1024);
                
                const memoryBefore = measureMemoryUsage();
                
                const execResult = measureExecutionTime(() => {
                    testData.forEach(obj => testCache.set(obj.id, obj));
                    return testData.map(obj => testCache.get(obj.id));
                });
                
                const memoryAfter = measureMemoryUsage();
                
                results[configName] = {
                    memory: calculateMemoryDelta(memoryBefore, memoryAfter),
                    time: execResult.time
                };
                
                testCache.destroy();
            });
            
            // 各設定でテストが完了することを確認
            expect(Object.keys(results)).toHaveLength(3);
            
            // メモリ使用量が設定サイズに比例していることを確認
            expect(results.small.memory).toBeLessThan(results.medium.memory);
            expect(results.medium.memory).toBeLessThan(results.large.memory);
        });
    });
    
    describe('自動クリーンアップ機能テスト', () => {
        test('TTL期限切れデータの自動削除', async () => {
            const shortTTLCache = getCacheSystem({
                maxSize: 100,
                ttl: 100, // 100ms
                cleanupInterval: 50
            }) as CacheSystem;
            
            const testData = generateTestObjects(10, 512);
            const memoryBefore = measureMemoryUsage();
            
            // データを追加
            testData.forEach(obj => {
                shortTTLCache.set(obj.id, obj);
            });
            
            expect(shortTTLCache.size).toBe(10);
            
            // TTL期限切れまで待機
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // クリーンアップ後のメモリ使用量
            const memoryAfter = measureMemoryUsage();
            
            // データが削除されていることを確認
            expect(shortTTLCache.size).toBeLessThan(10);
            
            // メモリが適切に解放されていることを確認
            const memoryDelta = calculateMemoryDelta(memoryBefore, memoryAfter);
            expect(memoryDelta).toBeLessThan(2 * 1024 * 1024); // 2MB以下
            
            shortTTLCache.destroy();
        });
    });
    
    describe('メモリ統計とモニタリング', () => {
        test('キャッシュ統計の正確性', () => {
            const testData = generateTestObjects(50, 1024);
            
            // 初期統計
            const initialStats = cache.getStats();
            expect(initialStats.size).toBe(0);
            expect(initialStats.hits).toBe(0);
            expect(initialStats.misses).toBe(0);
            
            // データ追加
            testData.forEach(obj => {
                cache.set(obj.id, obj);
            });
            
            // 一部データにアクセス（ヒット）
            const hitResults = testData.slice(0, 25).map(obj => cache.get(obj.id));
            
            // 存在しないデータにアクセス（ミス）
            const missResults = ['nonexistent-1', 'nonexistent-2'].map(key => cache.get(key));
            
            const finalStats = cache.getStats();
            
            // 統計の正確性を確認
            expect(finalStats.size).toBe(50);
            expect(finalStats.hits).toBe(25);
            expect(finalStats.misses).toBe(2);
            expect(finalStats.hitRate).toBeCloseTo(25 / 27, 2);
            
            // 結果の確認
            expect(hitResults).toHaveLength(25);
            expect(hitResults.every(result => result !== null)).toBe(true);
            expect(missResults.every(result => result === null)).toBe(true);
        });
        
        test('destroy後のメモリクリーンアップ', () => {
            const testData = generateTestObjects(100, 2048);
            
            // データを追加
            testData.forEach(obj => {
                cache.set(obj.id, obj);
            });
            
            expect(cache.size).toBe(100);
            
            // 統計を取得
            const statsBeforeDestroy = cache.getStats();
            expect(statsBeforeDestroy.size).toBe(100);
            
            // キャッシュを破棄
            cache.destroy();
            
            // 破棄後の統計（新しいインスタンスで確認）
            const newCache = getCacheSystem({ maxSize: 1000, ttl: 60000, cleanupInterval: 10000 }) as CacheSystem;
            const afterDestroy = newCache.getStats();
            
            expect(afterDestroy.size).toBe(0);
            expect(afterDestroy.hits).toBe(0);
            expect(afterDestroy.misses).toBe(0);
            
            // キャッシュが空であることを確認
            expect(cache.get('destroy-test-0')).toBeNull();
        });
    });
});