/**
 * CacheSystem 単体テスト
 */

import { CacheSystem, getCacheSystem } from '../../src/core/CacheSystem.js';

describe('CacheSystem', () => {
    let cacheSystem;
    
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
            expect(cacheSystem.cache).toBeInstanceOf(Map);
            expect(cacheSystem.accessHistory).toBeInstanceOf(Map);
            expect(cacheSystem.config.maxSize).toBe(10);
            expect(cacheSystem.config.ttl).toBe(100);
            expect(cacheSystem.stats.hits).toBe(0);
            expect(cacheSystem.stats.misses).toBe(0);
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
            expect(instance1.config.maxSize).toBe(500);
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
            
            expect(cacheSystem.clear()).toBe(2);
            expect(cacheSystem.has('key1')).toBe(false);
            expect(cacheSystem.has('key2')).toBe(false);
        });
        
        test('プレフィックスでキャッシュをクリアできる', () => {
            cacheSystem.set('prefix1:key1', 'value1');
            cacheSystem.set('prefix1:key2', 'value2');
            cacheSystem.set('prefix2:key3', 'value3');
            
            expect(cacheSystem.clear('prefix1:')).toBe(2);
            expect(cacheSystem.has('prefix1:key1')).toBe(false);
            expect(cacheSystem.has('prefix1:key2')).toBe(false);
            expect(cacheSystem.has('prefix2:key3')).toBe(true);
        });
    });
    
    describe('有効期限', () => {
        test('有効期限切れの値はnullを返す', () => {
            cacheSystem.set('key1', 'value1', { ttl: 50 });
            
            expect(cacheSystem.get('key1')).toBe('value1');
            
            // 有効期限が切れるまで進める
            jest.advanceTimersByTime(60);
            
            expect(cacheSystem.get('key1')).toBeNull();
            expect(cacheSystem.has('key1')).toBe(false);
        });
        
        test('有効期限を更新できる', () => {
            cacheSystem.set('key1', 'value1', { ttl: 50 });
            
            // 有効期限を延長
            cacheSystem.updateExpiry('key1', 200);
            
            // 元の有効期限が切れるまで進める
            jest.advanceTimersByTime(60);
            
            // まだ有効なはず
            expect(cacheSystem.get('key1')).toBe('value1');
        });
    });
    
    describe('キャッシュサイズ制限', () => {
        test('最大サイズを超えると古いアイテムが削除される', () => {
            // 最大サイズ（10）を超えるアイテムを追加
            for (let i = 0; i < 15; i++) {
                cacheSystem.set(`key${i}`, `value${i}`);
            }
            
            // 最初のいくつかのアイテムは削除されているはず
            expect(cacheSystem.has('key0')).toBe(false);
            expect(cacheSystem.has('key1')).toBe(false);
            expect(cacheSystem.has('key2')).toBe(false);
            expect(cacheSystem.has('key3')).toBe(false);
            expect(cacheSystem.has('key4')).toBe(false);
            
            // 最後のアイテムは残っているはず
            expect(cacheSystem.has('key14')).toBe(true);
            
            // キャッシュサイズは最大値以下
            expect(cacheSystem.getStats().size).toBeLessThanOrEqual(10);
        });
        
        test('優先度の高いアイテムは保持される', () => {
            // 優先度の高いアイテムを追加
            cacheSystem.set('important', 'value', { priority: 10 });
            
            // 通常のアイテムを最大サイズを超えるまで追加
            for (let i = 0; i < 15; i++) {
                cacheSystem.set(`key${i}`, `value${i}`);
            }
            
            // 優先度の高いアイテムは残っているはず
            expect(cacheSystem.has('important')).toBe(true);
        });
    });
    
    describe('統計情報', () => {
        test('ヒット・ミス統計が正しく記録される', () => {
            cacheSystem.set('key1', 'value1');
            
            // ヒット
            cacheSystem.get('key1');
            cacheSystem.get('key1');
            
            // ミス
            cacheSystem.get('nonexistent');
            
            const stats = cacheSystem.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
            expect(stats.totalRequests).toBe(3);
            expect(stats.hitRate).toBe('66.67%');
        });
        
        test('有効期限切れはミスとしてカウントされる', () => {
            cacheSystem.set('key1', 'value1', { ttl: 50 });
            
            // 有効期限内のアクセス
            cacheSystem.get('key1');
            
            // 有効期限が切れるまで進める
            jest.advanceTimersByTime(60);
            
            // 有効期限切れのアクセス
            cacheSystem.get('key1');
            
            const stats = cacheSystem.getStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
            expect(stats.expirations).toBe(1);
        });
    });
    
    describe('クリーンアップ', () => {
        test('クリーンアップで期限切れアイテムが削除される', () => {
            cacheSystem.set('key1', 'value1', { ttl: 30 });
            cacheSystem.set('key2', 'value2', { ttl: 200 });
            
            // 一部の有効期限が切れるまで進める
            jest.advanceTimersByTime(40);
            
            // 手動クリーンアップ
            const removed = cacheSystem.cleanup();
            
            expect(removed).toBe(1);
            expect(cacheSystem.has('key1')).toBe(false);
            expect(cacheSystem.has('key2')).toBe(true);
        });
        
        test('自動クリーンアップが動作する', () => {
            cacheSystem.set('key1', 'value1', { ttl: 30 });
            
            // 有効期限 + クリーンアップ間隔を進める
            jest.advanceTimersByTime(100);
            
            // 自動クリーンアップで削除されているはず
            expect(cacheSystem.has('key1')).toBe(false);
        });
    });
    
    describe('メモリ使用量推定', () => {
        test('メモリ使用量が推定される', () => {
            cacheSystem.set('key1', 'short value');
            cacheSystem.set('key2', 'a much longer value that should take more memory');
            
            const stats = cacheSystem.getStats();
            expect(stats.memoryUsage).toMatch(/^\d+ KB$/);
        });
    });
    
    describe('エラーハンドリング', () => {
        test('無効なキーでも例外が発生しない', () => {
            expect(() => {
                cacheSystem.get(undefined);
                cacheSystem.set(null, 'value');
                cacheSystem.delete({});
            }).not.toThrow();
        });
    });
});