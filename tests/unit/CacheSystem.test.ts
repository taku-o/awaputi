/**
 * CacheSystem 単体テスト
 */
import { describe, test, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { CacheSystem, getCacheSystem } from '../../src/core/CacheSystem.js';

// Type definitions for test objects
interface CacheConfig {
    maxSize?: number;
    ttl?: number;
    cleanupInterval?: number;
}

interface CacheOptions {
    ttl?: number;
    priority?: number;
}

interface CacheStats {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: string;
    expirations: number;
    size: number;
    memoryUsage: string;
}

describe('CacheSystem', () => {
    let cacheSystem: CacheSystem;
    
    beforeEach(() => {
        cacheSystem = new CacheSystem({
            maxSize: 10,
            ttl: 100, // 短い有効期限（テスト用）
            cleanupInterval: 50 // 短いクリーンアップ間隔（テスト用）
        });
    });

    afterEach(() => {
        cacheSystem.destroy();
    });

    describe('基本機能', () => {
        test('CacheSystemクラスが正しく初期化される', () => {
            expect((cacheSystem as any).cache).toBeInstanceOf(Map);
            expect((cacheSystem as any).accessHistory).toBeInstanceOf(Map);
            expect((cacheSystem as any).config.maxSize).toBe(10);
            expect((cacheSystem as any).config.ttl).toBe(100);
            expect((cacheSystem as any).stats.hits).toBe(0);
            expect((cacheSystem as any).stats.misses).toBe(0);
        });

        test('シングルトンインスタンスが正しく動作する', () => {
            const instance1 = getCacheSystem();
            const instance2 = getCacheSystem();
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(CacheSystem);
        });

        test('シングルトンインスタンスの設定を更新できる', () => {
            const instance1 = getCacheSystem();
            const instance2 = getCacheSystem({ maxSize: 500 });
            expect(instance1).toBe(instance2);
            expect((instance1 as any).config.maxSize).toBe(500);
        });
    });

    describe('キャッシュ操作', () => {
        test('値を設定・取得できる', () => {
            cacheSystem.set('key1', 'value1');
            expect(cacheSystem.get('key1')).toBe('value1');
            expect(cacheSystem.has('key1')).toBe(true);
        });

        test('存在しないキーはnullを返す', () => {
            expect(cacheSystem.get('nonexistent')).toBeNull();
            expect(cacheSystem.has('nonexistent')).toBe(false);
        });

        test('値を削除できる', () => {
            cacheSystem.set('key1', 'value1');
            expect(cacheSystem.has('key1')).toBe(true);
            cacheSystem.delete('key1');
            expect(cacheSystem.has('key1')).toBe(false);
            expect(cacheSystem.get('key1')).toBeNull();
        });

        test('キャッシュをクリアできる', () => {
            cacheSystem.set('key1', 'value1');
            cacheSystem.set('key2', 'value2');
            cacheSystem.set('key3', 'value3');
            expect(cacheSystem.size()).toBe(3);
            
            cacheSystem.clear();
            expect(cacheSystem.size()).toBe(0);
            expect(cacheSystem.get('key1')).toBeNull();
            expect(cacheSystem.get('key2')).toBeNull();
            expect(cacheSystem.get('key3')).toBeNull();
        });

        test('カスタムオプションで値を設定できる', () => {
            const options: CacheOptions = {
                ttl: 50,
                priority: 2
            };
            
            cacheSystem.set('key1', 'value1', options);
            expect(cacheSystem.get('key1')).toBe('value1');
            
            const entry = (cacheSystem as any).cache.get('key1');
            expect(entry.options.ttl).toBe(50);
            expect(entry.options.priority).toBe(2);
        });
    });

    describe('有効期限とLRU', () => {
        test('有効期限切れの値は取得できない', async () => {
            cacheSystem.set('key1', 'value1', { ttl: 50 });
            expect(cacheSystem.get('key1')).toBe('value1');
            
            // 有効期限が切れるまで待つ
            await new Promise(resolve => setTimeout(resolve, 60));
            
            expect(cacheSystem.get('key1')).toBeNull();
            expect(cacheSystem.has('key1')).toBe(false);
        });

        test('LRUアルゴリズムが正しく動作する', () => {
            // maxSize = 10 に対して11個の値を設定
            for (let i = 0; i < 11; i++) {
                cacheSystem.set(`key${i}`, `value${i}`);
            }
            
            // 最初のキーは削除されているはず
            expect(cacheSystem.has('key0')).toBe(false);
            expect(cacheSystem.has('key10')).toBe(true);
            expect(cacheSystem.size()).toBe(10);
        });

        test('アクセスによってLRU順序が更新される', () => {
            // maxSize = 10 に値を設定
            for (let i = 0; i < 10; i++) {
                cacheSystem.set(`key${i}`, `value${i}`);
            }
            
            // key0にアクセスして最新にする
            cacheSystem.get('key0');
            
            // 新しい値を追加
            cacheSystem.set('key10', 'value10');
            
            // key0は残り、key1が削除されているはず
            expect(cacheSystem.has('key0')).toBe(true);
            expect(cacheSystem.has('key1')).toBe(false);
            expect(cacheSystem.has('key10')).toBe(true);
        });
    });

    describe('統計情報', () => {
        test('ヒット率が正しく計算される', () => {
            cacheSystem.set('key1', 'value1');
            
            // ヒット
            cacheSystem.get('key1');
            cacheSystem.get('key1');
            
            // ミス
            cacheSystem.get('key2');
            
            const stats = cacheSystem.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
            expect(stats.totalRequests).toBe(3);
            expect(stats.hitRate).toBe('66.67%');
        });

        test('統計情報をリセットできる', () => {
            cacheSystem.set('key1', 'value1');
            cacheSystem.get('key1');
            cacheSystem.get('key2');
            
            cacheSystem.resetStats();
            
            const stats = cacheSystem.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
            expect(stats.totalRequests).toBe(0);
            expect(stats.hitRate).toBe('0.00%');
        });

        test('メモリ使用量が計算される', () => {
            cacheSystem.set('key1', 'value1');
            cacheSystem.set('key2', { data: 'object value' });
            cacheSystem.set('key3', [1, 2, 3, 4, 5]);
            
            const stats = cacheSystem.getStats();
            expect(stats.size).toBe(3);
            expect(stats.memoryUsage).toMatch(/^\d+(\.\d+)?\s*(B|KB|MB)$/);
        });
    });

    describe('クリーンアップ', () => {
        test('自動クリーンアップが動作する', async () => {
            // 短い有効期限で値を設定
            cacheSystem.set('key1', 'value1', { ttl: 40 });
            cacheSystem.set('key2', 'value2', { ttl: 40 });
            
            expect(cacheSystem.size()).toBe(2);
            
            // クリーンアップが実行されるまで待つ
            await new Promise(resolve => setTimeout(resolve, 100));
            
            expect(cacheSystem.size()).toBe(0);
        });

        test('手動クリーンアップが動作する', async () => {
            // 短い有効期限で値を設定
            cacheSystem.set('key1', 'value1', { ttl: 10 });
            cacheSystem.set('key2', 'value2', { ttl: 1000 }); // 長い有効期限
            
            // 有効期限が切れるまで待つ
            await new Promise(resolve => setTimeout(resolve, 20));
            
            cacheSystem.cleanup();
            
            expect(cacheSystem.has('key1')).toBe(false);
            expect(cacheSystem.has('key2')).toBe(true);
            expect(cacheSystem.size()).toBe(1);
        });
    });

    describe('パフォーマンス', () => {
        test('大量のデータを効率的に処理できる', () => {
            const startTime = performance.now();
            
            // 1000個の値を設定
            for (let i = 0; i < 1000; i++) {
                cacheSystem.set(`key${i}`, `value${i}`);
            }
            
            // 1000回アクセス
            for (let i = 0; i < 1000; i++) {
                cacheSystem.get(`key${i % 10}`); // 最新の10個にアクセス
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // 処理時間が妥当であることを確認
            expect(duration).toBeLessThan(1000); // 1秒以内
            
            // メモリ使用量が制限されていることを確認
            expect(cacheSystem.size()).toBe(10); // maxSize = 10
        });
    });

    describe('エラーハンドリング', () => {
        test('無効な設定でもクラッシュしない', () => {
            const invalidCache = new CacheSystem({
                maxSize: -1,
                ttl: -100,
                cleanupInterval: -50
            });
            
            expect(() => {
                invalidCache.set('key1', 'value1');
                invalidCache.get('key1');
            }).not.toThrow();
            
            invalidCache.destroy();
        });

        test('nullやundefinedの値も扱える', () => {
            cacheSystem.set('null', null);
            cacheSystem.set('undefined', undefined);
            
            expect(cacheSystem.get('null')).toBeNull();
            expect(cacheSystem.get('undefined')).toBeUndefined();
            expect(cacheSystem.has('null')).toBe(true);
            expect(cacheSystem.has('undefined')).toBe(true);
        });

        test('循環参照を持つオブジェクトも扱える', () => {
            const obj: any = { name: 'test' };
            obj.self = obj; // 循環参照
            
            expect(() => {
                cacheSystem.set('circular', obj);
                const retrieved = cacheSystem.get('circular');
                expect(retrieved).toBe(obj);
            }).not.toThrow();
        });
    });

    describe('優先度システム', () => {
        test('優先度の高いアイテムは保持される', () => {
            // 通常の優先度で満杯にする
            for (let i = 0; i < 10; i++) {
                cacheSystem.set(`normal${i}`, `value${i}`, { priority: 1 });
            }
            
            // 高優先度のアイテムを追加
            cacheSystem.set('high-priority', 'important', { priority: 10 });
            
            // 高優先度のアイテムは残り、低優先度のアイテムが削除される
            expect(cacheSystem.has('high-priority')).toBe(true);
            expect(cacheSystem.has('normal0')).toBe(false);
        });

        test('同じ優先度の場合はLRU順序に従う', () => {
            // 同じ優先度で満杯にする
            for (let i = 0; i < 10; i++) {
                cacheSystem.set(`key${i}`, `value${i}`, { priority: 5 });
            }
            
            // 新しいアイテムを追加
            cacheSystem.set('new-key', 'new-value', { priority: 5 });
            
            // 最も古いアイテムが削除される
            expect(cacheSystem.has('key0')).toBe(false);
            expect(cacheSystem.has('new-key')).toBe(true);
        });
    });
});