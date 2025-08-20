import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
/**
 * 設定アクセスのパフォーマンステスト
 * 
 * 設定値の取得速度、キャッシュ効果、メモリ使用量を測定します。
 */

import { getConfigurationManager } from '../../src/core/ConfigurationManager';

describe('Configuration Access Performance Tests', () => {
    let configManager: any;
    
    beforeEach(() => {
        configManager = getConfigurationManager();
        
        // テスト用の設定値を準備
        configManager.set('game', 'scoring.baseScore', 100);
        configManager.set('game', 'bubbles.maxAge', 5000);
        configManager.set('audio', 'volumes.master', 0.7);
        configManager.set('effects', 'particles.maxCount', 500);
        configManager.set('performance', 'optimization.maxBubbles', 20);
        
        // キャッシュをクリア
        configManager.clearCache();
    });
    
    afterEach(() => {
        configManager.clearCache();
    });
    
    test('基本的な設定アクセス速度', () => {
        const iterations = 10000;
        const startTime = performance.now();
        
        // 同じ設定値に繰り返しアクセス
        for (let i = 0; i < iterations; i++) {
            configManager.get('game', 'scoring.baseScore');
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`基本アクセス: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        
        // 平均アクセス時間が0.1ms以下であることを確認
        expect(avgTime.toBeLessThan(0.1));
    });
    
    test('キャッシュ効果の測定', () => {
        const iterations = 1000;
        
        // 初回アクセス（キャッシュなし）
        const startTimeNoCache = performance.now();
        for (let i = 0; i < iterations; i++) {
            configManager.get('game', 'bubbles.maxAge');
        }
        const endTimeNoCache = performance.now();
        const timeNoCache = endTimeNoCache - startTimeNoCache;
        
        // キャッシュウォームアップ
        configManager.warmupCache();
        
        // キャッシュありアクセス
        const startTimeWithCache = performance.now();
        for (let i = 0; i < iterations; i++) {
            configManager.get('game', 'bubbles.maxAge');
        }
        const endTimeWithCache = performance.now();
        const timeWithCache = endTimeWithCache - startTimeWithCache;
        
        const improvement = ((timeNoCache - timeWithCache) / timeNoCache) * 100;
        
        console.log(`キャッシュなし: ${timeNoCache.toFixed(2)}ms`);
        console.log(`キャッシュあり: ${timeWithCache.toFixed(2)}ms`);
        console.log(`改善率: ${improvement.toFixed(2)}%`);
        
        // キャッシュにより少なくとも2%の改善があることを確認
        expect(improvement.toBeGreaterThan(2));
    });
    
    test('複数キーの同時アクセス性能', () => {
        const keys = [
            ['game', 'scoring.baseScore'],
            ['game', 'bubbles.maxAge'],
            ['audio', 'volumes.master'],
            ['effects', 'particles.maxCount'],
            ['performance', 'optimization.maxBubbles']
        ];
        
        const iterations = 2000;
        const startTime = performance.now();
        
        // ランダムなキーにアクセス
        for (let i = 0; i < iterations; i++) {
            const [category, key] = keys[i % keys.length];
            configManager.get(category, key);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`複数キーアクセス: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        
        // 平均アクセス時間が0.2ms以下であることを確認
        expect(avgTime.toBeLessThan(0.2));
    });
    
    test('プリロードキーの効果測定', () => {
        const testKey = 'game.test.preload';
        
        // プリロードキーとして登録
        configManager.set('game', 'test.preload', 'test-value');
        configManager.addPreloadKey('game', 'test.preload');
        
        const iterations = 1000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            configManager.get('game', 'test.preload');
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`プリロードキーアクセス: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        
        // プリロードキーは非常に高速であることを確認
        expect(avgTime.toBeLessThan(0.05));
    });
    
    test('遅延読み込みの性能', () => {
        let loadCount = 0;
        
        // 遅延読み込み関数を登録
        configManager.registerLazyLoader('test', 'lazy', () => {
            loadCount++;
            // 重い処理をシミュレート
            const start = Date.now();
            while (Date.now() - start < 1) {
                // 1ms待機
            }
            return `lazy-value-${loadCount}`;
        });
        
        const iterations = 100;
        const startTime = performance.now();
        
        // 同じ遅延読み込みキーに複数回アクセス
        for (let i = 0; i < iterations; i++) {
            configManager.get('test', 'lazy');
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        console.log(`遅延読み込み: ${iterations}回アクセス, ${loadCount}回読み込み, 総時間: ${totalTime.toFixed(2)}ms`);
        
        // 遅延読み込み関数は1回だけ実行されることを確認
        expect(loadCount.toBe(1));
        
        // キャッシュにより2回目以降は高速であることを確認
        expect(totalTime.toBeLessThan(50); // 50ms以下
    });
    
    test('キャッシュヒット率の測定', () => {
        const keys = [
            ['game', 'scoring.baseScore'],
            ['audio', 'volumes.master'],
            ['effects', 'particles.maxCount']
        ];
        
        // 各キーに複数回アクセス
        for (let round = 0; round < 5; round++) {
            for (const [category, key] of keys) {
                for (let i = 0; i < 10; i++) {
                    configManager.get(category, key);
                }
            }
        }
        
        const stats = configManager.getPerformanceStats();
        const hitRate = parseFloat(stats.hitRate);
        
        console.log(`キャッシュヒット率: ${stats.hitRate}`);
        console.log(`総アクセス数: ${stats.totalAccesses}`);
        console.log(`キャッシュヒット数: ${stats.cacheHits}`);
        console.log(`キャッシュミス数: ${stats.cacheMisses}`);
        
        // ヒット率が50%以上であることを確認
        expect(hitRate.toBeGreaterThan(50));
    });
    
    test('メモリ使用量の監視', () => {
        // 大量の設定値を作成
        for (let i = 0; i < 100; i++) {
            configManager.set('test', `key${i}`, `value${i}`);
        }
        
        // 各設定値に複数回アクセス（キャッシュに保存させる）
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 5; j++) {
                configManager.get('test', `key${i}`);
            }
        }
        
        const stats = configManager.getPerformanceStats();
        const cacheStats = stats.cacheStats;
        
        console.log(`キャッシュサイズ: ${cacheStats.size}`);
        console.log(`メモリ使用量: ${cacheStats.memoryUsage}`);
        
        // メモリ使用量が合理的な範囲内であることを確認
        const memoryKB = parseInt(cacheStats.memoryUsage);
        expect(memoryKB.toBeLessThan(1000); // 1MB以下
    });
    
    test('大量アクセス時の安定性', () => {
        const iterations = 50000;
        const keys = [
            ['game', 'scoring.baseScore'],
            ['game', 'bubbles.maxAge'],
            ['audio', 'volumes.master'],
            ['effects', 'particles.maxCount'],
            ['performance', 'optimization.maxBubbles']
        ];
        
        const startTime = performance.now();
        let errorCount = 0;
        
        // 大量のランダムアクセス
        for (let i = 0; i < iterations; i++) {
            try {
                const [category, key] = keys[i % keys.length];
                const value = configManager.get(category, key);
                
                // 値が正しく取得できることを確認
                if (value === null || value === undefined) {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`大量アクセス: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        console.log(`エラー数: ${errorCount}`);
        
        // エラーが発生しないことを確認
        expect(errorCount.toBe(0));
        
        // 平均アクセス時間が合理的であることを確認
        expect(avgTime.toBeLessThan(0.1));
    });
    
    test('キャッシュ最適化の効果', () => {
        // 最適化前の状態を測定
        const beforeStats = configManager.getPerformanceStats();
        
        // 様々なキーにアクセスしてアクセス統計を蓄積
        const testKeys: any[] = [];
        for (let i = 0; i < 50; i++) {
            const key = `test.key${i}`;
            configManager.set('test', `key${i}`, `value${i}`);
            testKeys.push(['test', `key${i}`]);
        }
        
        // 一部のキーに頻繁にアクセス
        const frequentKeys = testKeys.slice(0, 10);
        for (let round = 0; round < 10; round++) {
            for (const [category, key] of frequentKeys) {
                configManager.get(category, key);
            }
        }
        
        // 手動で最適化を実行
        configManager._optimizeCache();
        
        const afterStats = configManager.getPerformanceStats();
        
        console.log('最適化前のキャッシュサイズ:', beforeStats.cachedKeys);
        console.log('最適化後のキャッシュサイズ:', afterStats.cachedKeys);
        console.log('頻繁にアクセスされるキー:', afterStats.topAccessedKeys.slice(0, 5));
        
        // 最適化により頻繁にアクセスされるキーがキャッシュされることを確認
        expect(afterStats.cachedKeys).toBeGreaterThan(beforeStats.cachedKeys);
    });
});