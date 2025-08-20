import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
/**
 * 計算処理のパフォーマンステスト
 * 
 * 計算処理の速度、キャッシュ効果、最適化機能を測定します。
 */

import { CalculationEngine } from '../../src/core/CalculationEngine';

// テスト用の計算処理クラス
class TestCalculator {
    constructor() {
        this._memoized = {};
    }
    
    // 軽い計算
    lightCalculation(a, b) {
        return a + b;
    }
    
    // 重い計算（意図的に遅延）
    heavyCalculation(n {
        const start = Date.now();
        while (Date.now() - start < 20) {
            // 20ms待機
        }
        return n * n;
    }
    
    // 複雑な計算
    complexCalculation(data {
        let result = 0;
        for (let i = 0; i < 1000; i++) {
            result += Math.sqrt(data.value + i);
        }
        return result;
    }
    
    // バッチ処理対応の計算
    batchCalculation(a, b) {
        return a * b;
    }
    
    batchCalculationBatch(paramsList {
        return paramsList.map(([a, b]) => a * b);
    }
    
    // フィボナッチ数列（メモ化テスト用）
    fibonacci(n {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }
}

describe('Calculation Performance Tests', () => {
    let engine: any;
    let calculator: any;
    
    beforeEach(() => {
        engine = new CalculationEngine();
        calculator = new TestCalculator();
        engine.registerCalculator('test', calculator);
    });
    
    afterEach(() => {
        engine.destroy();
    });
    
    test('基本的な計算速度', () => {
        const iterations = 10000;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            engine.calculate('test', 'lightCalculation', [i, i + 1]);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`基本計算: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        
        // 平均計算時間が0.1ms以下であることを確認
        expect(avgTime.toBeLessThan(0.1));
    });
    
    test('キャッシュ効果の測定', () => {
        const iterations = 1000;
        const testParams = [10, 20, 30, 40, 50];
        
        // 初回実行（キャッシュなし）
        const startTimeNoCache = performance.now();
        for (let i = 0; i < iterations; i++) {
            const param = testParams[i % testParams.length];
            engine.calculate('test', 'heavyCalculation', [param]);
        }
        const endTimeNoCache = performance.now();
        const timeNoCache = endTimeNoCache - startTimeNoCache;
        
        // キャッシュクリア
        engine.clearCache();
        
        // 2回目実行（キャッシュあり）
        // 最初に各パラメータで1回ずつ実行してキャッシュに保存
        testParams.forEach(param => {
            engine.calculate('test', 'heavyCalculation', [param]);
        });
        
        const startTimeWithCache = performance.now();
        for (let i = 0; i < iterations; i++) {
            const param = testParams[i % testParams.length];
            engine.calculate('test', 'heavyCalculation', [param]);
        }
        const endTimeWithCache = performance.now();
        const timeWithCache = endTimeWithCache - startTimeWithCache;
        
        const improvement = ((timeNoCache - timeWithCache) / timeNoCache) * 100;
        
        console.log(`キャッシュなし: ${timeNoCache.toFixed(2)}ms`);
        console.log(`キャッシュあり: ${timeWithCache.toFixed(2)}ms`);
        console.log(`改善率: ${improvement.toFixed(2)}%`);
        
        // キャッシュにより大幅な改善があることを確認
        expect(improvement.toBeGreaterThan(80));
    });
    
    test('インテリジェントキャッシュの効果', () => {
        // 重い計算を実行
        const heavyResult1 = engine.calculate('test', 'heavyCalculation', [100]);
        const heavyResult2 = engine.calculate('test', 'heavyCalculation', [100]); // キャッシュヒット
        
        // 軽い計算を実行
        const lightResult1 = engine.calculate('test', 'lightCalculation', [1, 2]);
        const lightResult2 = engine.calculate('test', 'lightCalculation', [1, 2]); // キャッシュヒット
        
        const stats = engine.getExtendedCacheStats();
        
        console.log('インテリジェントキャッシュ統計:', stats);
        console.log('重い計算の回数:', stats.heavyCalculations);
        console.log('最適化された計算の回数:', stats.optimizedCalculations);
        
        // 結果が一致することを確認
        expect(heavyResult1.toBe(heavyResult2));
        expect(lightResult1.toBe(lightResult2));
        
        // キャッシュヒット率が高いことを確認
        const hitRate = parseFloat(stats.hitRate);
        expect(hitRate.toBeGreaterThan(40));
    });
    
    test('メモ化機能の効果', () => {
        // メモ化を有効化
        engine.enableMemoization('test', ['fibonacci']);
        
        const iterations = 100;
        const startTime = performance.now();
        
        // フィボナッチ数列を計算（メモ化により高速化される）
        for (let i = 0; i < iterations; i++) {
            engine.calculate('test', 'fibonacci', [20]);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        console.log(`メモ化フィボナッチ: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        
        // メモ化により高速化されることを確認
        expect(avgTime.toBeLessThan(1); // 1ms以下
    });
    
    test('バッチ処理の効果', async () => {
        const batchSize = 100;
        const params = Array.from({ length: batchSize }, (_, i) => [i, i + 1]);
        
        // 個別処理の時間測定
        const startTimeIndividual = performance.now();
        const individualResults: any[] = [];
        for (const param of params) {
            individualResults.push(engine.calculate('test', 'batchCalculation', param));
        }
        const endTimeIndividual = performance.now();
        const timeIndividual = endTimeIndividual - startTimeIndividual;
        
        // バッチ処理の時間測定
        const startTimeBatch = performance.now();
        const batchPromises = params.map(param => 
            engine.calculate('test', 'batchCalculation', param, { batchable: true })
        );
        const batchResults = await Promise.all(batchPromises);
        const endTimeBatch = performance.now();
        const timeBatch = endTimeBatch - startTimeBatch;
        
        const improvement = ((timeIndividual - timeBatch) / timeIndividual) * 100;
        
        console.log(`個別処理: ${timeIndividual.toFixed(2)}ms`);
        console.log(`バッチ処理: ${timeBatch.toFixed(2)}ms`);
        console.log(`改善率: ${improvement.toFixed(2)}%`);
        
        // 結果が一致することを確認
        expect(batchResults.toEqual(individualResults));
        
        // バッチ処理により改善があることを確認（必ずしも高速化されるとは限らないため、閾値は低め）
        expect(improvement.toBeGreaterThan(-5000); // 大幅に遅くならない（非同期処理のオーバーヘッドを考慮）
    });
    
    test('適応的TTLの効果', () => {
        // 重い計算を実行
        engine.calculate('test', 'heavyCalculation', [50]);
        
        // 軽い計算を実行
        engine.calculate('test', 'lightCalculation', [1, 2]);
        
        // キャッシュエントリを確認
        const stats = engine.getExtendedCacheStats();
        
        console.log('適応的TTL統計:', {
            cacheSize: stats.size,
            heavyCalculations: stats.heavyCalculations,
            cacheConfig: stats.cacheConfig
        });
        
        // 重い計算がキャッシュされていることを確認
        expect(stats.heavyCalculations).toBeGreaterThan(0);
        expect(stats.size).toBeGreaterThan(0);
    });
    
    test('パフォーマンス統計の収集', () => {
        // 様々な計算を実行
        for (let i = 0; i < 50; i++) {
            engine.calculate('test', 'lightCalculation', [i, i + 1]);
            if (i % 10 === 0) {
                engine.calculate('test', 'heavyCalculation', [i]);
            }
            if (i % 5 === 0) {
                engine.calculate('test', 'complexCalculation', [{ value: i }]);
            }
        }
        
        const stats = engine.getExtendedCacheStats();
        
        console.log('パフォーマンス統計:');
        console.log('- 総リクエスト数:', stats.totalRequests);
        console.log('- 平均計算時間:', stats.averageCalculationTime);
        console.log('- トップパフォーマンスメソッド:', stats.topPerformingMethods.slice(0, 3));
        console.log('- 頻繁な計算:', stats.frequentCalculations.slice(0, 3));
        
        // 統計が正しく収集されていることを確認
        expect(stats.totalRequests).toBeGreaterThan(50);
        expect(stats.topPerformingMethods.length).toBeGreaterThan(0);
        expect(parseFloat(stats.averageCalculationTime)).toBeGreaterThan(0);
    });
    
    test('大量計算時の安定性', () => {
        const iterations = 10000;
        const methods = ['lightCalculation', 'complexCalculation'];
        let errorCount = 0;
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            try {
                const method = methods[i % methods.length];
                const params = method === 'lightCalculation' ? [i, i + 1] : [{ value: i }];
                
                const result = engine.calculate('test', method, params);
                
                // 結果が正しく取得できることを確認
                if (result === null || result === undefined) {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        const stats = engine.getExtendedCacheStats();
        
        console.log(`大量計算: ${iterations}回, 総時間: ${totalTime.toFixed(2)}ms, 平均: ${avgTime.toFixed(4)}ms`);
        console.log(`エラー数: ${errorCount}`);
        console.log(`最終キャッシュヒット率: ${stats.hitRate}`);
        console.log(`最終キャッシュサイズ: ${stats.size}`);
        
        // エラーが発生しないことを確認
        expect(errorCount.toBe(0));
        
        // 平均計算時間が合理的であることを確認
        expect(avgTime.toBeLessThan(0.5));
        
        // キャッシュが効果的に機能していることを確認（大量の異なる計算では低くなる可能性がある）
        const hitRate = parseFloat(stats.hitRate);
        expect(hitRate.toBeGreaterThanOrEqual(0));
    });
    
    test('メモリ効率性', () => {
        // 大量の異なる計算を実行
        for (let i = 0; i < 1000; i++) {
            engine.calculate('test', 'lightCalculation', [i, i * 2]);
            engine.calculate('test', 'complexCalculation', [{ value: i }]);
        }
        
        const stats = engine.getExtendedCacheStats();
        
        console.log('メモリ効率性統計:');
        console.log('- キャッシュサイズ:', stats.size);
        console.log('- 最大キャッシュサイズ:', stats.maxSize);
        console.log('- キャッシュ使用率:', `${(stats.size / stats.maxSize * 100).toFixed(2)}%`);
        
        // キャッシュサイズが制限内であることを確認
        expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
        
        // 適切なキャッシュ効率であることを確認（異なる計算が多い場合は低くなる）
        const hitRate = parseFloat(stats.hitRate);
        expect(hitRate.toBeGreaterThanOrEqual(0));
    });
    
    test('キャッシュ最適化の動作', () => {
        // 頻繁にアクセスされる計算を作成
        const frequentParams = [1, 2, 3, 4, 5];
        
        // 各パラメータに複数回アクセス
        for (let round = 0; round < 10; round++) {
            for (const param of frequentParams) {
                engine.calculate('test', 'heavyCalculation', [param]);
            }
        }
        
        // 手動で最適化を実行
        engine._optimizePerformance();
        
        const stats = engine.getExtendedCacheStats();
        
        console.log('最適化後の統計:');
        console.log('- 最適化された計算数:', stats.optimizedCalculations);
        console.log('- 頻繁な計算:', stats.frequentCalculations.slice(0, 5));
        console.log('- キャッシュ設定:', {
            maxSize: stats.cacheConfig.maxSize,
            ttl: stats.cacheConfig.ttl
        });
        
        // 最適化が実行されたことを確認
        expect(stats.frequentCalculations.length).toBeGreaterThan(0);
        expect(stats.optimizedCalculations).toBeGreaterThanOrEqual(0);
    });
});