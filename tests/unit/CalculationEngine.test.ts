/**
 * CalculationEngine のテスト
 */
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { CalculationEngine } from '../../src/core/CalculationEngine.js';
// Calculator interface
interface ICalculator {
    add(a: number, b: number): number;
    multiply(a: number, b: number): number;
    throwError(): never;
    [key: string]: any;
// Cache stats interface
interface CacheStats {
    size: number,
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: string;
// Cache configuration interface
interface CacheConfig {
    maxSize: number,
    ttl: number;
// Debug info interface
interface DebugInfo {
    registeredCalculators: string[],
    cacheStats: CacheStats;
    cacheConfig: CacheConfig;
// モック計算処理クラス
class MockCalculator implements ICalculator {
    add(a: number, b: number): number {
        return a + b }
    
    multiply(a: number, b: number): number {
        return a * b }
    
    throwError('): never {'
        throw new Error('Test error') }
}
describe('CalculationEngine', () => {
    let engine: CalculationEngine,
    let mockCalculator: MockCalculator,
    
    beforeEach(() => {
        engine = new CalculationEngine(),
        mockCalculator = new MockCalculator() });
    afterEach(() => {
        engine.destroy() }');'
    describe('基本機能', (') => {'
        test('should initialize correctly', () => {
            expect(engine).toBeInstanceOf(CalculationEngine),
            expect(engine.getRegisteredCalculators().toEqual([]),
            expect(engine.getCacheStats().size).toBe(0) }');'
        test('should register calculator', (') => {'
            engine.registerCalculator('test', mockCalculator'),'
            expect(engine.hasCalculator('test').toBe(true),
            expect(engine.getRegisteredCalculators()').toContain('test') }');
        test('should throw error when registering invalid calculator', () => {
            expect((') => {'
                engine.registerCalculator(', mockCalculator) }').toThrow('計算タイプと計算処理クラスは必須です');
            expect((') => {'
                engine.registerCalculator('test', null as any) }').toThrow('計算タイプと計算処理クラスは必須です');'
        }
    }');'
    describe('計算実行', () => {
        beforeEach((') => {'
            engine.registerCalculator('math', mockCalculator) }');'
        test('should execute calculation correctly', (') => {'
            const result = engine.calculate('math', 'add', [2, 3]),
            expect(result).toBe(5) }');'
        test('should execute calculation with multiple parameters', (') => {'
            const result = engine.calculate('math', 'multiply', [4, 5]),
            expect(result).toBe(20) }');'
        test('should throw error for unregistered calculator type', () => {
            expect((') => {'
                engine.calculate('unknown', 'add', [1, 2]) }').toThrow("計算タイプ 'unknown' が登録されていません"");'
        }
        test('should throw error for non-existent method', () => {
            expect((') => {'
                engine.calculate('math', 'divide', [10, 2]) }').toThrow("計算メソッド 'divide' が存在しません (type: math')"" }"
        test('should propagate calculation errors', () => {
            expect((') => {'
                engine.calculate('math', 'throwError', []) }').toThrow('Test error');'
        }
    }');'
    describe('キャッシュ機能', () => {
        beforeEach((') => {'
            engine.registerCalculator('math', mockCalculator) }');'
        test('should cache calculation results', (') => {'
            // 初回計算
            const result1 = engine.calculate('math', 'add', [2, 3]),
            expect(result1).toBe(5'),'
            // キャッシュから取得
            const result2 = engine.calculate('math', 'add', [2, 3]),
            expect(result2).toBe(5),
            const stats = engine.getCacheStats(),
            expect(stats.hits).toBe(1),
            expect(stats.misses).toBe(1),
            expect(stats.totalRequests).toBe(2) }');'
        test('should generate different cache keys for different parameters', (') => {'
            engine.calculate('math', 'add', [2, 3]'),'
            engine.calculate('math', 'add', [3, 4]),
            const stats = engine.getCacheStats(),
            expect(stats.size).toBe(2),
            expect(stats.hits).toBe(0),
            expect(stats.misses).toBe(2) }');'
        test('should bypass cache when noCache option is set', (') => {'
            // 通常の計算（キャッシュあり）
            engine.calculate('math', 'add', [2, 3]'),'
            // キャッシュ無効化オプション付き
            const result = engine.calculate('math', 'add', [2, 3], { noCache: true,);
            expect(result).toBe(5);
            const stats = engine.getCacheStats();
            expect(stats.hits).toBe(0); // キャッシュを使用していない
            expect(stats.misses).toBe(2);
        }');'
        test('should clear cache correctly', (') => {'
            engine.calculate('math', 'add', [2, 3]'),'
            engine.calculate('math', 'multiply', [4, 5]),
            expect(engine.getCacheStats().size).toBe(2),
            engine.clearCache(),
            expect(engine.getCacheStats().size).toBe(0) }');'
        test('should clear cache by type', (') => {'
            engine.registerCalculator('other', mockCalculator'),'
            engine.calculate('math', 'add', [2, 3]'),'
            engine.calculate('other', 'multiply', [4, 5]),
            expect(engine.getCacheStats().size).toBe(2'),'
            engine.clearCache('math'),
            expect(engine.getCacheStats().size).toBe(1) }');'
    }
    describe('キャッシュキー生成', (') => {'
        test('should generate consistent cache keys', (') => {'
            const key1 = engine.generateCacheKey('math', 'add', [2, 3]'),'
            const key2 = engine.generateCacheKey('math', 'add', [2, 3]),
            expect(key1).toBe(key2) }');'
        test('should generate different keys for different parameters', (') => {'
            const key1 = engine.generateCacheKey('math', 'add', [2, 3]'),'
            const key2 = engine.generateCacheKey('math', 'add', [3, 4]),
            expect(key1).not.toBe(key2) }');'
        test('should generate different keys for different methods', (') => {'
            const key1 = engine.generateCacheKey('math', 'add', [2, 3]'),'
            const key2 = engine.generateCacheKey('math', 'multiply', [2, 3]),
            expect(key1).not.toBe(key2) }');'
        test('should generate different keys for different types', (') => {'
            const key1 = engine.generateCacheKey('math', 'add', [2, 3]'),'
            const key2 = engine.generateCacheKey('other', 'add', [2, 3]),
            expect(key1).not.toBe(key2) }');'
    }
    describe('キャッシュ管理', () => {
        beforeEach((') => {'
            engine.registerCalculator('math', mockCalculator),
            // テスト用にキャッシュサイズを小さく設定
            (engine.cacheConfig.maxSize = 3) }');'
        test('should limit cache size', (') => {'
            // キャッシュサイズ制限を超える計算を実行
            engine.calculate('math', 'add', [1, 1]'),'
            engine.calculate('math', 'add', [2, 2]'),'
            engine.calculate('math', 'add', [3, 3]'),'
            engine.calculate('math', 'add', [4, 4]), // これで制限を超える
            
            const stats = engine.getCacheStats(),
            expect(stats.size).toBeLessThanOrEqual(3) }');'
        test('should handle cache expiry', async (') => {'
            // TTLを短く設定
            (engine.cacheConfig.ttl = 10, // 10ms
            
            engine.calculate('math', 'add', [2, 3]),
            expect(engine.getCacheStats().size).toBe(1),
            // TTL経過を待つ
            await new Promise<void>(resolve => setTimeout(resolve, 20)'),'
            // 期限切れキャッシュは取得できない
            const cachedResult = engine.getCachedResult('math:add:[2,3]'),
            expect(cachedResult).toBeNull() }');'
    }
    describe('統計情報', () => {
        beforeEach((') => {'
            engine.registerCalculator('math', mockCalculator) }');'
        test('should track cache statistics correctly', () => {
            // 初期状態
            let stats = engine.getCacheStats(),
            expect(stats.hits).toBe(0),
            expect(stats.misses).toBe(0),
            expect(stats.totalRequests).toBe(0),
            expect(stats.hitRate').toBe('0%'),'
            // 計算実行（キャッシュミス）
            engine.calculate('math', 'add', [2, 3]),
            stats = engine.getCacheStats(),
            expect(stats.misses).toBe(1),
            expect(stats.totalRequests).toBe(1'),'
            // 同じ計算実行（キャッシュヒット）
            engine.calculate('math', 'add', [2, 3]),
            stats = engine.getCacheStats(),
            expect(stats.hits).toBe(1),
            expect(stats.totalRequests).toBe(2),
            expect(stats.hitRate').toBe('50.00%') }');
        test('should provide debug information', (') => {'
            engine.registerCalculator('test', mockCalculator),
            const debugInfo: DebugInfo = engine.getDebugInfo(
            expect(debugInfo').toHaveProperty('registeredCalculators'),'
            expect(debugInfo').toHaveProperty('cacheStats'),'
            expect(debugInfo').toHaveProperty('cacheConfig'),'
            expect(debugInfo.registeredCalculators').toContain('test') }');
    }
    describe('リソース管理', (') => {'
        test('should destroy resources correctly', (') => {'
            engine.registerCalculator('math', mockCalculator'),'
            engine.calculate('math', 'add', [2, 3]),
            expect(engine.getCacheStats().size).toBe(1),
            expect(engine.getRegisteredCalculators().length).toBe(1),
            engine.destroy(),
            expect(engine.getCacheStats().size).toBe(0),
            expect(engine.getRegisteredCalculators().length).toBe(0) });
    }
}');'