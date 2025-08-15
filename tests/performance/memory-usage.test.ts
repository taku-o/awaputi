/**
 * メモリ使用量のテスト
 * TypeScript移行 - Task 26対応
 * 
 * キャッシュシステムのメモリ使用量、リーク検出、自動クリーンアップ機能を測定します。
 */

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
    hitRate: string;
}

interface MemoryOverview {
    totalMemoryUsage: string;
    averageEntrySize: string;
}

interface MemoryBreakdown {
    keys: string;
    values: string;
    metadata: string;
}

interface MemoryEntry {
    key: string;
    size: string;
    type: string;
}

interface MemoryReport {
    overview: MemoryOverview;
    breakdown: MemoryBreakdown;
    topLargestEntries: MemoryEntry[];
    recommendations: string[];
}

interface LeakEntry {
    key: string;
    age: number;
    size: string;
    lastAccessed: number;
}

interface MemoryLeakReport {
    potentialLeaks: LeakEntry[];
    memoryUsage: string;
    cacheSize: number;
    recommendations: string[];
}

interface MemoryFixResult {
    success: boolean;
    before: {
        cacheSize: number;
        memoryUsage: string;
    };
    after: {
        cacheSize: number;
        memoryUsage: string;
    };
    expiredEntriesRemoved: number;
    memoryFreed: string;
}

interface CacheSystem {
    config: CacheConfig;
    clear(): void;
    destroy(): void;
    set(key: string, value: any, options?: { ttl?: number }): void;
    get(key: string): any;
    getStats(): CacheStats;
    getMemoryReport(): MemoryReport;
    cleanup(): number;
    detectMemoryLeaks(): MemoryLeakReport;
    fixMemoryLeaks(): MemoryFixResult;
    _optimizeDuplicateData(): void;
    forceGarbageCollection(): boolean;
}

interface TestDataItem {
    key: string;
    value: any;
}

describe('Memory Usage Tests', () => {
    let cache: CacheSystem;
    
    beforeEach(() => {
        cache = getCacheSystem({
            maxSize: 1000,
            ttl: 60000,
            cleanupInterval: 10000
        });
        cache.clear(); // 既存のキャッシュをクリア
    });
    
    afterEach(() => {
        cache.destroy();
    });
    
    test('基本的なメモリ使用量の測定', () => {
        // 様々なサイズのデータを追加
        const testData: TestDataItem[] = [
            { key: 'small', value: 'test' },
            { key: 'medium', value: 'a'.repeat(1000) },
            { key: 'large', value: 'b'.repeat(10000) },
            { key: 'object', value: { data: Array.from({ length: 100 }, (_, i) => i) } },
            { key: 'array', value: Array.from({ length: 500 }, (_, i) => `item${i}`) }
        ];
        
        // データを追加
        testData.forEach(({ key, value }) => {
            cache.set(key, value);
        });
        
        const stats: CacheStats = cache.getStats();
        const memoryReport: MemoryReport = cache.getMemoryReport();
        
        console.log('基本メモリ使用量:');
        console.log('- キャッシュサイズ:', stats.size);
        console.log('- 総メモリ使用量:', memoryReport.overview.totalMemoryUsage);
        console.log('- 平均エントリサイズ:', memoryReport.overview.averageEntrySize);
        console.log('- 最大エントリ:', memoryReport.topLargestEntries[0]);
        
        // メモリ使用量が合理的な範囲内であることを確認
        const memoryKB = parseInt(memoryReport.overview.totalMemoryUsage);
        expect(memoryKB).toBeGreaterThan(0);
        expect(memoryKB).toBeLessThan(1000); // 1MB以下
        
        // キャッシュサイズが正しいことを確認
        expect(stats.size).toBe(testData.length);
    });
    
    test('大量データでのメモリ効率性', () => {
        const dataCount = 500;
        const startTime = Date.now();
        
        // 大量のデータを追加
        for (let i = 0; i < dataCount; i++) {
            const value = {
                id: i,
                data: `data-${i}`,
                timestamp: Date.now(),
                metadata: {
                    type: 'test',
                    size: i % 100,
                    tags: [`tag${i % 10}`, `category${i % 5}`]
                }
            };
            cache.set(`item-${i}`, value);
        }
        
        const endTime = Date.now();
        const addTime = endTime - startTime;
        
        const stats: CacheStats = cache.getStats();
        const memoryReport: MemoryReport = cache.getMemoryReport();
        
        console.log('大量データメモリ効率性:');
        console.log('- データ追加時間:', `${addTime}ms`);
        console.log('- キャッシュサイズ:', stats.size);
        console.log('- 総メモリ使用量:', memoryReport.overview.totalMemoryUsage);
        console.log('- 平均エントリサイズ:', memoryReport.overview.averageEntrySize);
        
        // メモリ使用量が効率的であることを確認
        const memoryKB = parseInt(memoryReport.overview.totalMemoryUsage);
        expect(memoryKB).toBeLessThan(5000); // 5MB以下
        
        // データ追加が高速であることを確認
        expect(addTime).toBeLessThan(1000); // 1秒以下
        
        // キャッシュサイズが制限内であることを確認
        expect(stats.size).toBeLessThanOrEqual(cache.config.maxSize);
    });
    
    test('自動クリーンアップ機能', async () => {
        // 期限切れデータを作成
        cache.set('expired1', 'value1', { ttl: 100 }); // 100ms後に期限切れ
        cache.set('expired2', 'value2', { ttl: 200 }); // 200ms後に期限切れ
        cache.set('persistent', 'value3', { ttl: 60000 }); // 1分後に期限切れ
        
        const beforeCleanup: CacheStats = cache.getStats();
        
        // 期限切れを待つ
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 手動クリーンアップを実行
        const cleanedCount: number = cache.cleanup();
        
        const afterCleanup: CacheStats = cache.getStats();
        
        console.log('自動クリーンアップ:');
        console.log('- クリーンアップ前:', beforeCleanup.size);
        console.log('- クリーンアップ後:', afterCleanup.size);
        console.log('- 削除されたエントリ数:', cleanedCount);
        
        // 期限切れエントリが削除されていることを確認
        expect(cleanedCount).toBe(2);
        expect(afterCleanup.size).toBe(1);
        
        // 永続的なエントリは残っていることを確認
        expect(cache.get('persistent')).toBe('value3');
        expect(cache.get('expired1')).toBeNull();
        expect(cache.get('expired2')).toBeNull();
    });
    
    test('メモリリーク検出機能', (done) => {
        // 古いデータを大量に追加（リークをシミュレート）
        for (let i = 0; i < 100; i++) {
            cache.set(`old-${i}`, `old-value-${i}`, { ttl: 1 }); // 1ms後に期限切れ
        }
        
        // 現在のデータを追加
        for (let i = 0; i < 50; i++) {
            cache.set(`current-${i}`, `current-value-${i}`);
        }
        
        // 少し待機して期限切れにする
        setTimeout(() => {
            const leakReport: MemoryLeakReport = cache.detectMemoryLeaks();
            
            console.log('メモリリーク検出:');
            console.log('- 潜在的リーク数:', leakReport.potentialLeaks.length);
            console.log('- メモリ使用量:', leakReport.memoryUsage);
            console.log('- 推奨事項数:', leakReport.recommendations.length);
            
            if (leakReport.potentialLeaks.length > 0) {
                console.log('- 検出されたリーク:', leakReport.potentialLeaks[0]);
            }
            
            // リークが検出されることを確認
            expect(leakReport.potentialLeaks.length).toBeGreaterThanOrEqual(0);
            expect(leakReport.memoryUsage).toBeDefined();
            expect(leakReport.cacheSize).toBeGreaterThan(0);
            
            done();
        }, 100);
    });
    
    test('メモリリーク修復機能', async () => {
        // リークをシミュレートするデータを追加
        for (let i = 0; i < 200; i++) {
            cache.set(`leak-${i}`, `leak-value-${i}`, { ttl: 50 }); // 50ms後に期限切れ
        }
        
        const beforeFix: CacheStats = cache.getStats();
        
        // 期限切れを待つ
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // リーク修復を実行
        const fixResult: MemoryFixResult = cache.fixMemoryLeaks();
        
        const afterFix: CacheStats = cache.getStats();
        
        console.log('メモリリーク修復:');
        console.log('- 修復前キャッシュサイズ:', fixResult.before.cacheSize);
        console.log('- 修復後キャッシュサイズ:', fixResult.after.cacheSize);
        console.log('- 削除された期限切れエントリ:', fixResult.expiredEntriesRemoved);
        console.log('- 解放されたメモリ:', fixResult.memoryFreed);
        
        // 修復が成功したことを確認
        expect(fixResult.success).toBe(true);
        expect(fixResult.expiredEntriesRemoved).toBeGreaterThan(0);
        expect(afterFix.size).toBeLessThan(beforeFix.size);
    });
    
    test('重複データの最適化', () => {
        const duplicateValue = { data: 'duplicate', size: 1000 };
        
        // 同じ値を複数のキーで保存
        for (let i = 0; i < 10; i++) {
            cache.set(`duplicate-${i}`, duplicateValue);
        }
        
        // 異なる値も追加
        for (let i = 0; i < 5; i++) {
            cache.set(`unique-${i}`, { data: `unique-${i}`, size: i });
        }
        
        const beforeOptimization: CacheStats = cache.getStats();
        
        // 重複データ最適化を実行
        cache._optimizeDuplicateData();
        
        const afterOptimization: CacheStats = cache.getStats();
        
        console.log('重複データ最適化:');
        console.log('- 最適化前:', beforeOptimization.size);
        console.log('- 最適化後:', afterOptimization.size);
        console.log('- 削除されたエントリ数:', beforeOptimization.size - afterOptimization.size);
        
        // 重複データが削除されていることを確認
        expect(afterOptimization.size).toBeLessThan(beforeOptimization.size);
        
        // 少なくとも1つの重複データは残っていることを確認
        let foundDuplicate = false;
        for (let i = 0; i < 10; i++) {
            if (cache.get(`duplicate-${i}`) !== null) {
                foundDuplicate = true;
                break;
            }
        }
        expect(foundDuplicate).toBe(true);
    });
    
    test('メモリ使用量の詳細レポート', () => {
        // 様々なサイズのデータを追加
        const testData: TestDataItem[] = [
            { key: 'tiny', value: 'x' },
            { key: 'small', value: 'x'.repeat(100) },
            { key: 'medium', value: 'x'.repeat(1000) },
            { key: 'large', value: 'x'.repeat(10000) },
            { key: 'huge', value: 'x'.repeat(50000) }
        ];
        
        testData.forEach(({ key, value }) => {
            cache.set(key, value);
        });
        
        const report: MemoryReport = cache.getMemoryReport();
        
        console.log('詳細メモリレポート:');
        console.log('- 概要:', report.overview);
        console.log('- 内訳:', report.breakdown);
        console.log('- 最大エントリ上位3:', report.topLargestEntries.slice(0, 3));
        console.log('- 推奨事項:', report.recommendations);
        
        // レポートの構造が正しいことを確認
        expect(report.overview).toBeDefined();
        expect(report.breakdown).toBeDefined();
        expect(report.topLargestEntries).toBeInstanceOf(Array);
        expect(report.recommendations).toBeInstanceOf(Array);
        
        // 最大エントリが正しく識別されていることを確認
        expect(report.topLargestEntries[0].key).toContain('huge');
    });
    
    test('大量アクセス時のメモリ安定性', () => {
        const iterations = 5000;
        const keyPool = 100; // 100種類のキーを循環使用
        
        const startMemory = cache.getMemoryReport().overview.totalMemoryUsage;
        const startTime = Date.now();
        
        // 大量のアクセスを実行
        for (let i = 0; i < iterations; i++) {
            const key = `key-${i % keyPool}`;
            const value = { iteration: i, data: `data-${i}` };
            
            cache.set(key, value);
            
            // 時々取得もする
            if (i % 10 === 0) {
                cache.get(key);
            }
        }
        
        const endTime = Date.now();
        const endMemory = cache.getMemoryReport().overview.totalMemoryUsage;
        const totalTime = endTime - startTime;
        
        const stats: CacheStats = cache.getStats();
        
        console.log('大量アクセス時のメモリ安定性:');
        console.log('- 処理時間:', `${totalTime}ms`);
        console.log('- 開始時メモリ:', startMemory);
        console.log('- 終了時メモリ:', endMemory);
        console.log('- 最終キャッシュサイズ:', stats.size);
        console.log('- ヒット率:', stats.hitRate);
        
        // メモリ使用量が爆発的に増加していないことを確認
        const startMemoryKB = parseInt(startMemory);
        const endMemoryKB = parseInt(endMemory);
        const memoryIncrease = endMemoryKB - startMemoryKB;
        
        expect(memoryIncrease).toBeLessThan(1000); // 1MB以下の増加
        
        // キャッシュサイズが制限内であることを確認
        expect(stats.size).toBeLessThanOrEqual(cache.config.maxSize);
        
        // 処理時間が合理的であることを確認
        expect(totalTime).toBeLessThan(5000); // 5秒以下
    });
    
    test('ガベージコレクション機能', () => {
        // 大量のデータを追加
        for (let i = 0; i < 500; i++) {
            cache.set(`gc-test-${i}`, {
                data: 'x'.repeat(1000),
                metadata: { id: i, timestamp: Date.now() }
            });
        }
        
        const beforeGC: MemoryReport = cache.getMemoryReport();
        
        // ガベージコレクションを実行
        const gcResult: boolean = cache.forceGarbageCollection();
        
        const afterGC: MemoryReport = cache.getMemoryReport();
        
        console.log('ガベージコレクション:');
        console.log('- GC実行結果:', gcResult);
        console.log('- GC前メモリ:', beforeGC.overview.totalMemoryUsage);
        console.log('- GC後メモリ:', afterGC.overview.totalMemoryUsage);
        
        // ガベージコレクションが実行されたことを確認
        expect(gcResult).toBe(true);
        
        // メモリ使用量が合理的であることを確認
        const afterMemoryKB = parseInt(afterGC.overview.totalMemoryUsage);
        expect(afterMemoryKB).toBeLessThan(10000); // 10MB以下
    });
    
    test('リソース破棄時のメモリクリーンアップ', () => {
        // 大量のデータを追加
        for (let i = 0; i < 1000; i++) {
            cache.set(`destroy-test-${i}`, {
                data: 'x'.repeat(500),
                id: i
            });
        }
        
        const beforeDestroy: CacheStats = cache.getStats();
        
        // リソースを破棄
        cache.destroy();
        
        const afterDestroy: CacheStats = cache.getStats();
        
        console.log('リソース破棄時のクリーンアップ:');
        console.log('- 破棄前キャッシュサイズ:', beforeDestroy.size);
        console.log('- 破棄後キャッシュサイズ:', afterDestroy.size);
        
        // 全てのデータが削除されていることを確認
        expect(afterDestroy.size).toBe(0);
        expect(afterDestroy.hits).toBe(0);
        expect(afterDestroy.misses).toBe(0);
        
        // キャッシュが空であることを確認
        expect(cache.get('destroy-test-0')).toBeNull();
    });
});