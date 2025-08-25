/**
 * ConfigurationErrorHandler の基本テスト
 */
import { jest, describe, test, expect, beforeAll } from '@jest/globals';

// Interfaces for Configuration Error Handler
interface ErrorStats {
    total: number;
    recovered: number;
    failed: number;
    byType: Map<string, number>;
    errorRate: string;
    recoveryRate: string;
}

interface FallbackState {
    useDefaultValues: boolean;
    disableValidation: boolean;
    disableCache: boolean;
    safeMode: boolean;
}

interface ValidationConstraints {
    type: string;
    max?: number;
    min?: number;
    maxLength?: number;
    minLength?: number;
    integer?: boolean;
}

interface CalculationParams {
    [key: string]: any;
    score?: number | typeof NaN;
    multiplier?: number | typeof Infinity;
    count?: number;
    value?: number;
}
// Type definitions for the Configuration Error Handler
interface ConfigurationErrorHandlerType {
    errorTypes: {
        CONFIGURATION_ACCESS: string;
        CALCULATION_ERROR: string;
        CACHE_ERROR: string;
    };
    recoveryStrategies: Map<string, any>;
    errorStats: {
        total: number;
        recovered: number;
        failed: number;
        byType: Map<string, number>;
    };
    fallbackState: FallbackState;
    _correctValue(value: any, constraints: ValidationConstraints): any;
    _correctCalculationParams(params: CalculationParams, calculationType: string): CalculationParams;
    _generateFallbackValue(category: string, key: string): any;
    _getSafeCalculationResult(calculationType: string, expectedType: string): any;
    getErrorStats(): ErrorStats;
    getFallbackState(): FallbackState;
    resetFallbackState(): void;
    _shouldBePositive(paramName: string, calculationType: string): boolean;
}

describe('ConfigurationErrorHandler', () => {
    let ConfigurationErrorHandler: new () => ConfigurationErrorHandlerType;
    let getConfigurationErrorHandler: () => ConfigurationErrorHandlerType;
    
    beforeAll(async () => {
        // モジュールを動的にインポート
        const module = await import('../../src/core/ConfigurationErrorHandler.js');
        ConfigurationErrorHandler = module.ConfigurationErrorHandler;
        getConfigurationErrorHandler = module.getConfigurationErrorHandler;
    });

    describe('基本機能', () => {
        test('クラスが正常にインスタンス化される', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler).toBeDefined();
            expect(errorHandler.errorTypes).toBeDefined();
            expect(errorHandler.recoveryStrategies).toBeDefined();
        });

        test('エラータイプが定義されている', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler.errorTypes.CONFIGURATION_ACCESS).toBe('CONFIGURATION_ACCESS');
            expect(errorHandler.errorTypes.CALCULATION_ERROR).toBe('CALCULATION_ERROR');
            expect(errorHandler.errorTypes.CACHE_ERROR).toBe('CACHE_ERROR');
        });

        test('復旧戦略が設定されている', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler.recoveryStrategies.size).toBeGreaterThan(0);
            expect(errorHandler.recoveryStrategies.has('CONFIGURATION_ACCESS')).toBe(true);
            expect(errorHandler.recoveryStrategies.has('CALCULATION_ERROR')).toBe(true);
        });

        test('エラー統計が初期化されている', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler.errorStats.total).toBe(0);
            expect(errorHandler.errorStats.recovered).toBe(0);
            expect(errorHandler.errorStats.failed).toBe(0);
            expect(errorHandler.errorStats.byType).toBeInstanceOf(Map);
        });

        test('フォールバック状態が初期化されている', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler.fallbackState.useDefaultValues).toBe(false);
            expect(errorHandler.fallbackState.disableValidation).toBe(false);
            expect(errorHandler.fallbackState.disableCache).toBe(false);
            expect(errorHandler.fallbackState.safeMode).toBe(false);
        });
    });

    describe('値の修正機能', () => {
        test('数値の範囲修正', () => {
            const errorHandler = new ConfigurationErrorHandler();
            
            // 最大値を超えた場合
            const result1 = errorHandler._correctValue(150, { type: 'number', max: 100 });
            expect(result1).toBe(100);
            
            // 最小値を下回った場合
            const result2 = errorHandler._correctValue(-10, { type: 'number', min: 0 });
            expect(result2).toBe(0);
            
            // 整数でない場合
            const result3 = errorHandler._correctValue(3.7, { type: 'number', integer: true });
            expect(result3).toBe(4);
        });

        test('文字列の長さ修正', () => {
            const errorHandler = new ConfigurationErrorHandler();
            
            // 長すぎる場合
            const result1 = errorHandler._correctValue('長い文字列です', { type: 'string', maxLength: 5 });
            expect(result1).toBe('長い文字列');
            
            // 短すぎる場合
            const result2 = errorHandler._correctValue('短', { type: 'string', minLength: 5 });
            expect(result2).toBe('短    ');
        });

        test('ブール値の修正', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler._correctValue('true', { type: 'boolean' })).toBe(true);
            expect(errorHandler._correctValue('false', { type: 'boolean' })).toBe(false);
            expect(errorHandler._correctValue(1, { type: 'boolean' })).toBe(true);
            expect(errorHandler._correctValue(0, { type: 'boolean' })).toBe(false);
            expect(errorHandler._correctValue('invalid', { type: 'boolean' })).toBe(false);
        });
    });

    describe('計算パラメータの修正', () => {
        test('NaNと無限値の修正', () => {
            const errorHandler = new ConfigurationErrorHandler();
            const params: CalculationParams = {
                score: NaN,
                multiplier: Infinity,
                count: -5
            };
            const corrected = errorHandler._correctCalculationParams(params, 'scoreCalculation');
            expect(corrected.score).toBe(0);
            expect(corrected.multiplier).toBe(Number.MAX_SAFE_INTEGER);
            expect(corrected.count).toBe(5); // 負の値が正に修正される
        });

        test('大きすぎる値の修正', () => {
            const errorHandler = new ConfigurationErrorHandler();
            const params: CalculationParams = {
                value: Number.MAX_VALUE
            };
            const corrected = errorHandler._correctCalculationParams(params, 'test');
            expect(corrected.value).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    describe('フォールバック値の生成', () => {
        test('カテゴリ別フォールバック値', () => {
            const errorHandler = new ConfigurationErrorHandler();
            
            // 直接マッピングされた値
            expect(errorHandler._generateFallbackValue('game', 'baseScore')).toBe(10);
            
            // 汎用フォールバック値のテスト
            expect(errorHandler._generateFallbackValue('test', 'maxCount')).toBe(10); // 'max'が含まれる
            expect(errorHandler._generateFallbackValue('test', 'itemCost')).toBe(100); // 'cost'が含まれる（大文字小文字を区別しない）
            expect(errorHandler._generateFallbackValue('test', 'animationDuration')).toBe(1000); // 'duration'が含まれる
            expect(errorHandler._generateFallbackValue('test', 'masterVolume')).toBe(0.5); // 'volume'が含まれる
            expect(errorHandler._generateFallbackValue('test', 'scoreMultiplier')).toBe(1.0); // 'multiplier'が含まれる
            expect(errorHandler._generateFallbackValue('test', 'isEnabled')).toBe(true); // 'enabled'が含まれる
            
            // マッチしない場合はnullを返す
            expect(errorHandler._generateFallbackValue('test', 'unknownProperty')).toBe(null);
        });
    });

    describe('安全な計算結果の取得', () => {
        test('計算タイプ別の安全な値', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler._getSafeCalculationResult('scoreCalculation', 'number')).toBe(0);
            expect(errorHandler._getSafeCalculationResult('costCalculation', 'number')).toBe(1);
            expect(errorHandler._getSafeCalculationResult('multiplierCalculation', 'number')).toBe(1);
            expect(errorHandler._getSafeCalculationResult('durationCalculation', 'number')).toBe(1000);
        });

        test('型別の安全な値', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler._getSafeCalculationResult('unknown', 'number')).toBe(0);
            expect(errorHandler._getSafeCalculationResult('unknown', 'string')).toBe('');
            expect(errorHandler._getSafeCalculationResult('unknown', 'boolean')).toBe(false);
            expect(errorHandler._getSafeCalculationResult('unknown', 'object')).toEqual({});
            expect(errorHandler._getSafeCalculationResult('unknown', 'array')).toEqual([]);
        });
    });

    describe('統計機能', () => {
        test('エラー統計の取得', () => {
            const errorHandler = new ConfigurationErrorHandler();
            
            // 初期状態
            const initialStats = errorHandler.getErrorStats();
            expect(initialStats.total).toBe(0);
            expect(initialStats.errorRate).toBe('0.00%');
            expect(initialStats.recoveryRate).toBe('0.00%');
        });

        test('フォールバック状態の取得と操作', () => {
            const errorHandler = new ConfigurationErrorHandler();
            
            // 初期状態
            const initialState = errorHandler.getFallbackState();
            expect(initialState.safeMode).toBe(false);
            
            // 状態変更
            errorHandler.fallbackState.safeMode = true;
            const changedState = errorHandler.getFallbackState();
            expect(changedState.safeMode).toBe(true);
            
            // リセット
            errorHandler.resetFallbackState();
            const resetState = errorHandler.getFallbackState();
            expect(resetState.safeMode).toBe(false);
        });
    });

    describe('シングルトンパターン', () => {
        test('同じインスタンスが返される', () => {
            const instance1 = getConfigurationErrorHandler();
            const instance2 = getConfigurationErrorHandler();
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(ConfigurationErrorHandler);
        });
    });

    describe('パラメータ検証ヘルパー', () => {
        test('正の値であるべきパラメータの判定', () => {
            const errorHandler = new ConfigurationErrorHandler();
            expect(errorHandler._shouldBePositive('score', 'scoreCalculation')).toBe(true);
            expect(errorHandler._shouldBePositive('count', 'countCalculation')).toBe(true);
            expect(errorHandler._shouldBePositive('level', 'levelCalculation')).toBe(true);
            expect(errorHandler._shouldBePositive('offset', 'positionCalculation')).toBe(false);
        });
    });
});