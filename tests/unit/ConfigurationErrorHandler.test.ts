/**
 * ConfigurationErrorHandler のテスト
 */
import { jest, describe, test, expect, beforeEach, afterEach  } from '@jest/globals';
import { ConfigurationErrorHandler, getConfigurationErrorHandler  } from '../../src/core/ConfigurationErrorHandler.js';
// Error handling result interface
interface ErrorHandlingResult {
    success: boolean,
    recovered: boolean;
    value?: any;
    params?: any;
    message: string;
// Error context interfaces
interface ConfigurationAccessContext {
    category: string,
    key: string;
    defaultValue?: any;
interface ValidationContext {
    category: string,
    key: string;
    value: any;
    rule: {
        typ,e: string,
        min?: number;
        max?: number;
        maxLength?: number;;
}
interface CalculationContext {
    calculationType: string,
    params: { [ke,y: string]: any,;
    expectedType: string,
    maxValue?: number;
}
interface CacheContext {
    operation: string,
    key: string;
interface DependencyContext {
    dependency: string,
    operation: string;
// Error stats interface
interface ErrorStats {
    total: number,
    recovered: number;
    failed: number;
    recoveryRate: string;
    byType: { [ke,y: string]: number,;
}
// Fallback state interface
interface FallbackState {
    useDefaultValues: boolean,
    disableValidation: boolean;
    disableCache: boolean;
    safeMode: boolean;
// Mock implementations
const mockLoggingSystem = {
    info: jest.fn(
    warn: jest.fn(
        error: jest.fn( };
const mockErrorHandler = {
    enableSafeMode: jest.fn( };
const mockValidationSystem = {
    _getDefaultValue: jest.fn()' };'
// モジュールのモック
jest.mock('../../src/core/LoggingSystem.js', () => ({
    getLoggingSystem: () => mockLoggingSystem
})');'
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: () => mockErrorHandler
})');'
jest.mock('../../src/core/ValidationSystem.js', () => ({
    getValidationSystem: () => mockValidationSystem
})');'
describe('ConfigurationErrorHandler', () => {
    let errorHandler: ConfigurationErrorHandler,
    
    beforeEach(() => {
        // モックをリセット
        jest.clearAllMocks(),
        // 新しいインスタンスを作成
        errorHandler = new ConfigurationErrorHandler(),
        // タイマーをモック
        jest.useFakeTimers() });
    afterEach(() => {
        jest.useRealTimers() }');'
    describe('初期化', (') => {'
        test('正常に初期化される', () => {
            expect(errorHandler).toBeInstanceOf(ConfigurationErrorHandler),
            expect(errorHandler.errorTypes).toBeDefined(),
            expect(errorHandler.recoveryStrategies).toBeInstanceOf(Map),
            expect(errorHandler.errorStats).toBeDefined() }');'
        test('復旧戦略が設定される', () => {
            expect(errorHandler.recoveryStrategies.size).toBeGreaterThan(0'),'
            expect(errorHandler.recoveryStrategies.has('CONFIGURATION_ACCESS').toBe(true'),'
            expect(errorHandler.recoveryStrategies.has('CALCULATION_ERROR').toBe(true) }');'
        test('初期化ログが出力される', () => {
            expect(mockLoggingSystem.info').toHaveBeenCalledWith('
                'ConfigurationErrorHandler initialized',
                null,
                'ConfigurationErrorHandler') }');'
    }
    describe('設定アクセスエラーの処理', (') => {'
        test('デフォルト値がある場合の復旧', (') => {'
            const error = new Error('設定が見つかりません'),
            const context: ConfigurationAccessContext = {
                category: 'game',
                key: 'score',
                defaultValue: 100
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value).toBe(100);
            expect(result.message').toBe('デフォルト値を使用');'
        }');'
        test('デフォルト値がない場合のフォールバック値生成', (') => {'
            const error = new Error('設定が見つかりません'),
            const context: ConfigurationAccessContext = {
                category: 'game',
                key: 'maxScore'
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value).toBe(100); // score関連のフォールバック値
            expect(result.message').toBe('フォールバック値を生成');'
        }');'
        test('エラー統計が更新される', (') => {'
            const error = new Error('テストエラー'),
            const context: ConfigurationAccessContext = { category: 'test', key: 'test' };
            
            const initialTotal = errorHandler.errorStats.total;
            
            errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                context,
            expect(errorHandler.errorStats.total).toBe(initialTotal + 1);
            expect(errorHandler.errorStats.recovered).toBe(1);
        }');'
    }
    describe('設定検証エラーの処理', (') => {'
        test('数値の自動修正', (') => {'
            const error = new Error('値が範囲外です'),
            const context: ValidationContext = {
                category: 'game',
                key: 'level',
                value: 150,
                rule: { type: 'number', min: 1, max: 100 }
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_VALIDATION,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value).toBe(100); // 最大値に修正
            expect(result.message').toBe('値を自動修正');'
        }');'
        test('文字列の長さ修正', (') => {'
            const error = new Error('文字列が長すぎます'),
            const context: ValidationContext = {
                category: 'user',
                key: 'name',
                value: 'とても長い名前です',
                rule: { type: 'string', maxLength: 5 }
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_VALIDATION,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value').toBe('とても長'); // 5文字に切り詰め'
            expect(result.message').toBe('値を自動修正');'
        }');'
        test('修正不可能な場合のデフォルト値使用', (') => {'
            mockValidationSystem._getDefaultValue.mockReturnValue('デフォルト値'),
            const error = new Error('修正不可能な値'),
            const context: ValidationContext = {
                category: 'test',
                key: 'test',
                value: { invalid: 'object' };
                rule: { type: 'string' }
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_VALIDATION,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value').toBe('デフォルト値');'
            expect(result.message').toBe('デフォルト値を使用');'
        }');'
    }
    describe('計算エラーの処理', (') => {'
        test('パラメータの修正', (') => {'
            const error = new Error('計算エラー'),
            const context: CalculationContext = {
                calculationType: 'scoreCalculation',
                params: { score: -10, multiplier: NaN,,
                expectedType: 'number'
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CALCULATION_ERROR,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.params.score).toBe(10); // 負の値を正に修正
            expect(result.params.multiplier).toBe(0); // NaNを0に修正
            expect(result.message').toBe('パラメータを修正');'
        }');'
        test('安全な値の返却', (') => {'
            const error = new Error('計算不可能'),
            const context: CalculationContext = {
                calculationType: 'scoreCalculation',
                params: { invalid: 'params' };
                expectedType: 'number'
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CALCULATION_ERROR,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value).toBe(0); // score関連の安全な値
            expect(result.message').toBe('安全な値を返す');'
        }');'
    }
    describe('計算オーバーフローエラーの処理', (') => {'
        test('値の制限', (') => {'
            const error = new Error('オーバーフロー'),
            const context: CalculationContext = {
                calculationType: 'scoreCalculation',
                params: { score: Number.MAX_VALUE };
                expectedType: 'number',
                maxValue: 999999
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CALCULATION_OVERFLOW,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.value).toBe(999999);
            expect(result.message').toBe('値を安全な範囲に制限');'
        }');'
    }
    describe('キャッシュエラーの処理', (') => {'
        test('直接アクセスへの切り替え', (') => {'
            const error = new Error('キャッシュエラー'),
            const context: CacheContext = {
                operation: 'get',
                key: 'test.key'
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CACHE_ERROR,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.message').toBe('直接アクセスに切り替え');'
            expect(errorHandler.fallbackState.disableCache).toBe(true);
        }');'
    }
    describe('依存関係エラーの処理', (') => {'
        test('セーフモードの有効化', (') => {'
            const error = new Error('依存関係エラー'),
            const context: DependencyContext = {
                dependency: 'TestModule',
                operation: 'initialize'
            };
            
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.DEPENDENCY_ERROR,
                context,
            expect(result.success).toBe(true);
            expect(result.recovered).toBe(true);
            expect(result.message').toBe('セーフモードを有効化');'
            expect(errorHandler.fallbackState.safeMode).toBe(true);
        }');'
    }
    describe('復旧試行制限', (') => {'
        test('最大試行回数に達した場合の処理', (') => {'
            const error = new Error('繰り返しエラー'),
            const context: ConfigurationAccessContext = { category: 'test', key: 'test' };
            
            // 最大試行回数まで実行
            for (let i = 0; i < 3; i++) {
                errorHandler.handleError(
                    error,
                    errorHandler.errorTypes.CONFIGURATION_ACCESS,
                    context }
            
            // 4回目は失敗するはず
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                context,
            expect(result.success).toBe(false);
            expect(result.recovered).toBe(false);
            expect(result.message').toContain('最大復旧試行回数に達しました');'
        }');'
    }
    describe('エラー監視', (') => {'
        test('高いエラー率の検出', () => {
            // 多数のエラーを発生させる
            for (let i = 0, i < 10, i++) {
                const error = new Error(`エラー${i}`);
                // 復旧不可能なエラータイプを使用
                errorHandler.handleError(error, 'UNKNOWN_ERROR', {});
            }
            
            // エラー率監視を実行
            (errorHandler._monitorErrorRate();
            // セーフモードが有効化されるはず
            expect(errorHandler.fallbackState.safeMode).toBe(true);
        }');'
    }
    describe('統計とレポート', (') => {'
        test('エラー統計の取得', (') => {'
            const error = new Error('テストエラー'),
            errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                { category: 'test', key: 'test', defaultValue: 'default' });
            const stats: ErrorStats = errorHandler.getErrorStats(
            expect(stats.total).toBe(1);
            expect(stats.recovered).toBe(1);
            expect(stats.failed).toBe(0);
            expect(stats.recoveryRate').toBe('100.00%');'
            expect(stats.byType.CONFIGURATION_ACCESS).toBe(1);
        }');'
        test('フォールバック状態の取得', () => {
            errorHandler.fallbackState.safeMode = true,
            errorHandler.fallbackState.disableCache = true,
            
            const state: FallbackState = errorHandler.getFallbackState(
            expect(state.safeMode).toBe(true),
            expect(state.disableCache).toBe(true),
            expect(state.useDefaultValues).toBe(false) }');'
        test('フォールバック状態のリセット', () => {
            errorHandler.fallbackState.safeMode = true,
            errorHandler.fallbackState.disableCache = true,
            
            errorHandler.resetFallbackState(),
            expect(errorHandler.fallbackState.safeMode).toBe(false),
            expect(errorHandler.fallbackState.disableCache).toBe(false) }');'
    }
    describe('シングルトンパターン', (') => {'
        test('同じインスタンスが返される', () => {
            const instance1 = getConfigurationErrorHandler(),
            const instance2 = getConfigurationErrorHandler(),
            expect(instance1).toBe(instance2) }');'
    }
    describe('エラーハンドラー内でのエラー処理', (') => {'
        test('復旧戦略でエラーが発生した場合の処理', () => {
            // 復旧戦略を破壊的に変更
            const originalStrategy = errorHandler.recoveryStrategies.get(
                errorHandler.errorTypes.CONFIGURATION_ACCESS),
            errorHandler.recoveryStrategies.set(
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                {
                    maxAttempts: 1),
                   , strategy: (') => {'
                        throw new Error('復旧戦略エラー') }
                }
            ');'
            const error = new Error('テストエラー');
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                { category: 'test', key: 'test' });
            expect(result.success).toBe(false);
            expect(result.message').toContain('復旧戦略実行エラー');'
            // 元の戦略を復元
            errorHandler.recoveryStrategies.set(
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                originalStrategy }');'
        test('ハンドラー自体でエラーが発生した場合の緊急フォールバック', () => {
            // handleErrorメソッドを一時的に破壊
            const originalHandleError = errorHandler.handleError,
            
            errorHandler.handleError = function(this: any, error: Error, errorType: string, context: ErrorHandlingResult {
                // 最初の処理でエラーを発生させる
                if (!this._emergencyMode') {'
                    this._emergencyMode = true;
                    throw new Error('ハンドラー内エラー') }
                
                // 2回目の呼び出しでは正常処理
                return originalHandleError.call(this, error, errorType, context');'
            };
            
            const error = new Error('テストエラー');
            const result: ErrorHandlingResult = errorHandler.handleError(
                error,
                errorHandler.errorTypes.CONFIGURATION_ACCESS,
                { category: 'test', key: 'test' });
            expect(result.success).toBe(false);
            expect(result.message').toBe('エラーハンドラー内でエラー発生');'
            expect(errorHandler.fallbackState.safeMode).toBe(true);
            // 元のメソッドを復元
            errorHandler.handleError = originalHandleError;
        });
    }
}');'