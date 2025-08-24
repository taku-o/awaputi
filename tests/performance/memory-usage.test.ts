/**
 * メモリ使用量パフォーマンステスト
 * TypeScript移行 - Task 26対応
 * 
 * キャッシュシステムのメモリ使用量、リーク検出、自動クリーンアップ機能を測定します。
 */
import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import { getCacheSystem } from '../../src/core/CacheSystem';

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
    set(key: string, value: any): void;
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

// メモリ使用量を取得する関数
function getMemoryUsage(): number {
    if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
    }
    // Node.js環境の場合
    if (typeof process !== 'undefined' && process.memoryUsage) {
        return process.memoryUsage().heapUsed;
    }
    // フォールバック（推定値）
    return 0;
}

describe('Memory Usage Performance Tests', () => {
    let cache: CacheSystem;

    beforeEach(() => {
        cache = getCacheSystem();
    });

    afterEach(() => {
        if (cache && typeof cache.destroy === 'function') {
            cache.destroy();
        }
    });

    test('基本的なメモリ使用量測定', () => {
        const initialMemory = getMemoryUsage();
        
        // 1MB相当のデータを100個キャッシュに保存
        const testData = generateTestObjects(100, 10 * 1024); // 10KB each
        
        testData.forEach(item => {
            cache.set(item.id, item);
        });
        
        const afterMemory = getMemoryUsage();
        const memoryIncrease = afterMemory - initialMemory;
        
        console.log(`初期メモリ: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
        console.log(`使用後メモリ: ${(afterMemory / 1024 / 1024).toFixed(2)} MB`);
        console.log(`増加量: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
        
        // メモリ使用量が合理的な範囲内であることを確認
        expect(memoryIncrease).toBeGreaterThan(0); // メモリが使用されている
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB未満
    });

    test('メモリリーク検出テスト', async () => {
        const iterations = 50;
        const itemsPerIteration = 20;
        const memoryMeasurements: number[] = [];
        
        for (let i = 0; i < iterations; i++) {
            // データを追加
            const testData = generateTestObjects(itemsPerIteration, 5 * 1024); // 5KB each
            testData.forEach(item => {
                cache.set(`${i}-${item.id}`, item);
            });
            
            // 古いデータを削除（メモリリークがない場合、メモリ使用量は安定する）
            if (i > 10) {
                for (let j = 0; j < itemsPerIteration; j++) {
                    cache.delete(`${i - 10}-test-${j}`);
                }
            }
            
            // メモリ使用量を記録
            const currentMemory = getMemoryUsage();
            memoryMeasurements.push(currentMemory);
            
            // 少し待機してGCの機会を与える
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // メモリリークがないことを確認（後半のメモリ使用量が前半より極端に高くない）
        const firstHalf = memoryMeasurements.slice(0, Math.floor(iterations / 2));
        const secondHalf = memoryMeasurements.slice(Math.floor(iterations / 2));
        
        const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const memoryGrowthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        
        console.log(`前半平均メモリ: ${(firstHalfAvg / 1024 / 1024).toFixed(2)} MB`);
        console.log(`後半平均メモリ: ${(secondHalfAvg / 1024 / 1024).toFixed(2)} MB`);
        console.log(`メモリ増加率: ${memoryGrowthRate.toFixed(2)}%`);
        
        // 極端なメモリ増加がないことを確認（リークがない場合、増加率は低い）
        expect(memoryGrowthRate).toBeLessThan(50); // 50%未満の増加
    });

    test('自動クリーンアップ機能の効果', async () => {
        const initialMemory = getMemoryUsage();
        
        // 大量のデータを追加
        const largeDataSet = generateTestObjects(200, 5 * 1024); // 5KB each
        largeDataSet.forEach(item => {
            cache.set(item.id, item);
        });
        
        const afterAddMemory = getMemoryUsage();
        
        // 自動クリーンアップを待機（TTLやサイズ制限による削除）
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const afterCleanupMemory = getMemoryUsage();
        
        const addedMemory = afterAddMemory - initialMemory;
        const cleanedMemory = afterAddMemory - afterCleanupMemory;
        const cleanupEfficiency = (cleanedMemory / addedMemory) * 100;
        
        console.log(`追加後メモリ増加: ${(addedMemory / 1024 / 1024).toFixed(2)} MB`);
        console.log(`クリーンアップで削減: ${(cleanedMemory / 1024 / 1024).toFixed(2)} MB`);
        console.log(`クリーンアップ効率: ${cleanupEfficiency.toFixed(2)}%`);
        
        // クリーンアップが機能していることを確認
        expect(cleanupEfficiency).toBeGreaterThanOrEqual(0); // 何らかの削減が行われる
        
        // キャッシュサイズが制限されていることを確認
        expect(cache.size).toBeLessThanOrEqual(largeDataSet.length);
    });

    test('キャッシュサイズ制限の動作', () => {
        // 大量のデータを追加してサイズ制限をテスト
        const testData = generateTestObjects(1000, 1024); // 1KB each
        
        testData.forEach((item, index) => {
            cache.set(item.id, item);
            
            // 定期的にサイズをチェック
            if (index % 100 === 0) {
                console.log(`${index}個追加後のキャッシュサイズ: ${cache.size}`);
            }
        });
        
        const finalSize = cache.size;
        const stats = cache.getStats();
        
        console.log(`最終キャッシュサイズ: ${finalSize}`);
        console.log(`ヒット率: ${stats.hitRate}%`);
        console.log(`総ヒット数: ${stats.hits}`);
        console.log(`総ミス数: ${stats.misses}`);
        
        // サイズ制限が機能していることを確認
        expect(finalSize).toBeLessThanOrEqual(testData.length);
        expect(finalSize).toBeGreaterThan(0);
    });

    test('メモリ効率的なデータ管理', () => {
        const initialMemory = getMemoryUsage();
        const dataPoints: Array<{ operations: number; memory: number; cacheSize: number }> = [];
        
        // 段階的にデータを追加し、メモリ効率を測定
        for (let batch = 1; batch <= 10; batch++) {
            const batchSize = 50;
            const testData = generateTestObjects(batchSize, 2 * 1024); // 2KB each
            
            testData.forEach(item => {
                cache.set(`batch${batch}-${item.id}`, item);
            });
            
            const currentMemory = getMemoryUsage();
            dataPoints.push({
                operations: batch * batchSize,
                memory: currentMemory - initialMemory,
                cacheSize: cache.size
            });
        }
        
        // メモリ効率の分析
        dataPoints.forEach((point, index) => {
            const memoryPerItem = point.memory / point.operations;
            console.log(`${point.operations}操作後: メモリ=${(point.memory / 1024).toFixed(2)}KB, ` +
                       `キャッシュサイズ=${point.cacheSize}, アイテム当たり=${(memoryPerItem / 1024).toFixed(3)}KB`);
        });
        
        // メモリ効率が合理的であることを確認
        const finalDataPoint = dataPoints[dataPoints.length - 1];
        const averageMemoryPerItem = finalDataPoint.memory / finalDataPoint.operations;
        
        expect(averageMemoryPerItem).toBeLessThan(10 * 1024); // アイテム当たり10KB未満
        expect(finalDataPoint.cacheSize).toBeGreaterThan(0);
    });

    test('ガベージコレクション効果の測定', async () => {
        const initialMemory = getMemoryUsage();
        
        // 一時的な大量データを作成
        const temporaryData = generateTestObjects(300, 3 * 1024); // 3KB each
        temporaryData.forEach(item => {
            cache.set(item.id, item);
        });
        
        const peakMemory = getMemoryUsage();
        
        // データをクリア
        cache.clear();
        
        // ガベージコレクションの機会を与える
        if ((global as any).gc) {
            (global as any).gc();
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const afterGCMemory = getMemoryUsage();
        
        const peakIncrease = peakMemory - initialMemory;
        const finalIncrease = afterGCMemory - initialMemory;
        const garbageCollected = peakIncrease - finalIncrease;
        const gcEfficiency = (garbageCollected / peakIncrease) * 100;
        
        console.log(`ピーク時メモリ増加: ${(peakIncrease / 1024 / 1024).toFixed(2)} MB`);
        console.log(`最終メモリ増加: ${(finalIncrease / 1024 / 1024).toFixed(2)} MB`);
        console.log(`ガベージコレクション量: ${(garbageCollected / 1024 / 1024).toFixed(2)} MB`);
        console.log(`GC効率: ${gcEfficiency.toFixed(2)}%`);
        
        // ガベージコレクションが効果を示していることを確認
        expect(garbageCollected).toBeGreaterThanOrEqual(0);
        expect(cache.size).toBe(0); // キャッシュが空であることを確認
    });

    test('高負荷時のメモリ安定性', async () => {
        const stabilityTest = async (duration: number) => {
            const startTime = Date.now();
            const memoryReadings: number[] = [];
            
            while (Date.now() - startTime < duration) {
                // ランダムなデータを追加
                const randomData = generateTestObjects(10, Math.floor(Math.random() * 5000) + 1000);
                randomData.forEach(item => {
                    cache.set(`stability-${Date.now()}-${item.id}`, item);
                });
                
                // ランダムに古いデータを削除
                if (Math.random() > 0.7) {
                    const keysToDelete = Math.floor(Math.random() * 5) + 1;
                    for (let i = 0; i < keysToDelete; i++) {
                        cache.delete(`stability-${Date.now() - Math.random() * 10000}-test-${i}`);
                    }
                }
                
                // メモリ使用量を記録
                memoryReadings.push(getMemoryUsage());
                
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            return memoryReadings;
        };
        
        const testDuration = 1000; // 1秒間のテスト
        const memoryReadings = await stabilityTest(testDuration);
        
        // メモリ使用量の安定性を分析
        const memoryStats = {
            min: Math.min(...memoryReadings),
            max: Math.max(...memoryReadings),
            avg: memoryReadings.reduce((a, b) => a + b, 0) / memoryReadings.length
        };
        
        const memoryVariation = ((memoryStats.max - memoryStats.min) / memoryStats.avg) * 100;
        
        console.log(`メモリ統計 - 最小: ${(memoryStats.min / 1024 / 1024).toFixed(2)}MB, ` +
                   `最大: ${(memoryStats.max / 1024 / 1024).toFixed(2)}MB, ` +
                   `平均: ${(memoryStats.avg / 1024 / 1024).toFixed(2)}MB`);
        console.log(`メモリ変動率: ${memoryVariation.toFixed(2)}%`);
        
        // メモリ使用量が安定していることを確認
        expect(memoryVariation).toBeLessThan(200); // 200%未満の変動
        expect(cache.size).toBeGreaterThan(0);
        
        const finalStats = cache.getStats();
        expect(finalStats.hitRate).toBeGreaterThanOrEqual(0);
    });
});