/**
 * 設定システム専用エラーハンドリングクラス
 * 
 * 設定エラー、計算エラーの統一的な処理を実装し、
 * エラー復旧機能を提供します。
 */

import { getErrorHandler, ErrorHandler } from '../utils/ErrorHandler';
import { getLoggingSystem, LoggingSystem } from './LoggingSystem';
import { getValidationSystem, ValidationSystem } from './ValidationSystem';

interface ErrorTypes {
    CONFIGURATION_ACCESS: string;
    CONFIGURATION_VALIDATION: string;
    CONFIGURATION_STORAGE: string;
    CALCULATION_ERROR: string;
    CALCULATION_OVERFLOW: string;
    CACHE_ERROR: string;
    DEPENDENCY_ERROR: string;
}

interface RecoveryStrategy {
    maxAttempts: number;
    strategy: (error: Error, context: any) => RecoveryResult;
}

interface RecoveryResult {
    success: boolean;
    value?: any;
    params?: any;
    message: string;
}

interface ErrorStats {
    total: number;
    byType: Map<string, number>;
    recovered: number;
    failed: number;
    lastReset: number;
}

interface FallbackState {
    useDefaultValues: boolean;
    disableValidation: boolean;
    disableCache: boolean;
    safeMode: boolean;
}

interface ErrorRecord {
    timestamp: number;
    errorType: string;
    errorMessage: string;
    recovered: boolean;
}

interface RecoveryStats {
    total: number;
    recovered: number;
}

interface CriticalError {
    timestamp: number;
    fullKey: string;
    errorType: string;
    errorMessage: string;
    recovered: boolean;
}

interface HandleErrorResult {
    success: boolean;
    recovered: boolean;
    value?: any;
    params?: any;
    message: string;
}

export class ConfigurationErrorHandler {
    private errorTypes: ErrorTypes;
    private recoveryStrategies: Map<string, RecoveryStrategy>;
    private errorStats: ErrorStats;
    private recoveryAttempts: Map<string, number>;
    private maxRecoveryAttempts: number;
    private fallbackState: FallbackState;
    private logger: LoggingSystem;

    constructor() {
        // エラー種別定義
        this.errorTypes = {
            CONFIGURATION_ACCESS: 'CONFIGURATION_ACCESS',
            CONFIGURATION_VALIDATION: 'CONFIGURATION_VALIDATION',
            CONFIGURATION_STORAGE: 'CONFIGURATION_STORAGE',
            CALCULATION_ERROR: 'CALCULATION_ERROR',
            CALCULATION_OVERFLOW: 'CALCULATION_OVERFLOW',
            CACHE_ERROR: 'CACHE_ERROR',
            DEPENDENCY_ERROR: 'DEPENDENCY_ERROR'
        };
        
        // エラー復旧戦略
        this.recoveryStrategies = new Map();
        
        // エラー統計
        this.errorStats = {
            total: 0,
            byType: new Map(),
            recovered: 0,
            failed: 0,
            lastReset: Date.now()
        };
        
        // 復旧試行履歴
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        
        // フォールバック状態
        this.fallbackState = {
            useDefaultValues: false,
            disableValidation: false,
            disableCache: false,
            safeMode: false
        };
        
        // ロギングシステム
        this.logger = getLoggingSystem();
        
        // 初期化
        this._initialize();
    }
    
    /**
     * 初期化処理
     * @private
     */
    private _initialize(): void {
        this._setupRecoveryStrategies();
        this._setupErrorMonitoring();
        
        this.logger.info('ConfigurationErrorHandler initialized', null, 'ConfigurationErrorHandler');
    }
    
    /**
     * 復旧戦略を設定
     * @private
     */
    private _setupRecoveryStrategies(): void {
        // 設定アクセスエラーの復旧
        this.recoveryStrategies.set(this.errorTypes.CONFIGURATION_ACCESS, {
            maxAttempts: 3,
            strategy: (error: Error, context: any): RecoveryResult => {
                const { category, key, defaultValue } = context;
                
                // デフォルト値を使用
                if (defaultValue !== undefined && defaultValue !== null) {
                    this.logger.warn(`設定アクセスエラー、デフォルト値を使用: ${category}.${key}`, {
                        error: error.message,
                        defaultValue
                    }, 'ConfigurationErrorHandler');
                    
                    return {
                        success: true,
                        value: defaultValue,
                        message: 'デフォルト値を使用'
                    };
                }
                
                // 型に基づくフォールバック値を生成
                const fallbackValue = this._generateFallbackValue(category, key);
                
                this.logger.warn(`設定アクセスエラー、フォールバック値を生成: ${category}.${key}`, {
                    error: error.message,
                    fallbackValue
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: true,
                    value: fallbackValue,
                    message: 'フォールバック値を生成'
                };
            }
        });
        
        // 設定検証エラーの復旧
        this.recoveryStrategies.set(this.errorTypes.CONFIGURATION_VALIDATION, {
            maxAttempts: 2,
            strategy: (error: Error, context: any): RecoveryResult => {
                const { category, key, value, rule } = context;
                
                try {
                    // 値の自動修正を試行
                    const correctedValue = this._correctValue(value, rule);
                    
                    if (correctedValue !== null) {
                        this.logger.warn(`設定値を自動修正: ${category}.${key}`, {
                            originalValue: value,
                            correctedValue,
                            rule
                        }, 'ConfigurationErrorHandler');
                        
                        return {
                            success: true,
                            value: correctedValue,
                            message: '値を自動修正'
                        };
                    }
                    
                    // 修正できない場合はデフォルト値を使用
                    const validationSystem = getValidationSystem();
                    const defaultValue = (validationSystem as any)._getDefaultValue(category, key);
                    
                    this.logger.warn(`設定値修正不可、デフォルト値を使用: ${category}.${key}`, {
                        originalValue: value,
                        defaultValue
                    }, 'ConfigurationErrorHandler');
                    
                    return {
                        success: true,
                        value: defaultValue,
                        message: 'デフォルト値を使用'
                    };
                    
                } catch (recoveryError) {
                    this.logger.error(`設定検証エラー復旧に失敗: ${category}.${key}`, {
                        originalError: error.message,
                        recoveryError: (recoveryError as Error).message
                    }, 'ConfigurationErrorHandler');
                    
                    return {
                        success: false,
                        message: '復旧に失敗'
                    };
                }
            }
        });
        
        // 計算エラーの復旧
        this.recoveryStrategies.set(this.errorTypes.CALCULATION_ERROR, {
            maxAttempts: 2,
            strategy: (error: Error, context: any): RecoveryResult => {
                const { calculationType, params, expectedType } = context;
                
                try {
                    // パラメータの検証と修正
                    const correctedParams = this._correctCalculationParams(params, calculationType);
                    
                    if (correctedParams) {
                        this.logger.warn(`計算パラメータを修正: ${calculationType}`, {
                            originalParams: params,
                            correctedParams
                        }, 'ConfigurationErrorHandler');
                        
                        return {
                            success: true,
                            params: correctedParams,
                            message: 'パラメータを修正'
                        };
                    }
                    
                    // 安全なデフォルト値を返す
                    const safeValue = this._getSafeCalculationResult(calculationType, expectedType);
                    
                    this.logger.warn(`計算エラー、安全な値を返す: ${calculationType}`, {
                        error: error.message,
                        safeValue
                    }, 'ConfigurationErrorHandler');
                    
                    return {
                        success: true,
                        value: safeValue,
                        message: '安全な値を返す'
                    };
                    
                } catch (recoveryError) {
                    return {
                        success: false,
                        message: '計算復旧に失敗'
                    };
                }
            }
        });
        
        // 計算オーバーフローエラーの復旧
        this.recoveryStrategies.set(this.errorTypes.CALCULATION_OVERFLOW, {
            maxAttempts: 1,
            strategy: (error: Error, context: any): RecoveryResult => {
                const { calculationType, params, maxValue } = context;
                
                const clampedValue = maxValue || Number.MAX_SAFE_INTEGER;
                
                this.logger.warn(`計算オーバーフロー、値を制限: ${calculationType}`, {
                    error: error.message,
                    clampedValue
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: true,
                    value: clampedValue,
                    message: '値を安全な範囲に制限'
                };
            }
        });
        
        // キャッシュエラーの復旧
        this.recoveryStrategies.set(this.errorTypes.CACHE_ERROR, {
            maxAttempts: 1,
            strategy: (error: Error, context: any): RecoveryResult => {
                const { operation, key } = context;
                
                // キャッシュを無効化して直接アクセス
                this.fallbackState.disableCache = true;
                
                this.logger.warn(`キャッシュエラー、直接アクセスに切り替え: ${operation}`, {
                    error: error.message,
                    key
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: true,
                    message: '直接アクセスに切り替え'
                };
            }
        });
        
        // 依存関係エラーの復旧
        this.recoveryStrategies.set(this.errorTypes.DEPENDENCY_ERROR, {
            maxAttempts: 2,
            strategy: (error: Error, context: any): RecoveryResult => {
                const { dependency, operation } = context;
                
                // セーフモードを有効化
                this.fallbackState.safeMode = true;
                
                this.logger.error(`依存関係エラー、セーフモードを有効化: ${dependency}`, {
                    error: error.message,
                    operation
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: true,
                    message: 'セーフモードを有効化'
                };
            }
        });
    }
    
    /**
     * エラー監視を設定
     * @private
     */
    private _setupErrorMonitoring(): void {
        // 定期的な統計リセット（1時間ごと）
        setInterval(() => {
            this._resetStatsIfNeeded();
        }, 3600000);
        
        // エラー率の監視（5分ごと）
        setInterval(() => {
            this._monitorErrorRate();
        }, 300000);
    }
    
    /**
     * エラーを処理
     */
    public handleError(error: Error, errorType: string, context: any = {}): HandleErrorResult {
        try {
            // エラー統計を更新
            this._updateErrorStats(errorType);
            
            // エラーをログに記録
            this.logger.error(`設定システムエラー: ${errorType}`, {
                error: error.message,
                stack: error.stack,
                context
            }, 'ConfigurationErrorHandler');
            
            // 復旧を試行
            const recoveryResult = this._attemptRecovery(error, errorType, context);
            
            if (recoveryResult.success) {
                this.errorStats.recovered++;
                
                this.logger.info(`エラー復旧成功: ${errorType}`, {
                    message: recoveryResult.message,
                    context
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: true,
                    recovered: true,
                    value: recoveryResult.value,
                    params: recoveryResult.params,
                    message: recoveryResult.message
                };
            } else {
                this.errorStats.failed++;
                
                this.logger.error(`エラー復旧失敗: ${errorType}`, {
                    message: recoveryResult.message,
                    context
                }, 'ConfigurationErrorHandler');
                
                // 最後の手段としてセーフモードを有効化
                if (!this.fallbackState.safeMode) {
                    this._enableSafeMode();
                }
                
                return {
                    success: false,
                    recovered: false,
                    message: recoveryResult.message
                };
            }
            
        } catch (handlerError) {
            // エラーハンドラー自体でエラーが発生した場合
            this.logger.error('ConfigurationErrorHandler内でエラー発生', {
                originalError: error.message,
                handlerError: (handlerError as Error).message
            }, 'ConfigurationErrorHandler');
            
            // 緊急フォールバック
            this._enableSafeMode();
            
            return {
                success: false,
                recovered: false,
                message: 'エラーハンドラー内でエラー発生'
            };
        }
    }
    
    /**
     * 復旧を試行
     * @private
     */
    private _attemptRecovery(error: Error, errorType: string, context: any): RecoveryResult {
        const strategy = this.recoveryStrategies.get(errorType);
        
        if (!strategy) {
            return {
                success: false,
                message: `復旧戦略が見つかりません: ${errorType}`
            };
        }
        
        // 復旧試行回数をチェック
        const attemptKey = `${errorType}_${JSON.stringify(context)}`;
        const currentAttempts = this.recoveryAttempts.get(attemptKey) || 0;
        
        if (currentAttempts >= strategy.maxAttempts) {
            return {
                success: false,
                message: `最大復旧試行回数に達しました: ${errorType}`
            };
        }
        
        // 復旧試行回数を更新
        this.recoveryAttempts.set(attemptKey, currentAttempts + 1);
        
        try {
            const result = strategy.strategy(error, context);
            
            // 成功した場合は試行回数をリセット
            if (result.success) {
                this.recoveryAttempts.delete(attemptKey);
            }
            
            return result;
            
        } catch (strategyError) {
            this.logger.error(`復旧戦略実行エラー: ${errorType}`, {
                error: error.message,
                strategyError: (strategyError as Error).message,
                context
            }, 'ConfigurationErrorHandler');
            
            return {
                success: false,
                message: `復旧戦略実行エラー: ${(strategyError as Error).message}`
            };
        }
    }
    
    /**
     * 値を自動修正
     * @private
     */
    private _correctValue(value: any, rule: any): any {
        try {
            // 数値の修正
            if (rule.type === 'number') {
                let numValue = Number(value);
                
                if (isNaN(numValue)) {
                    return rule.min || 0;
                }
                
                if (rule.min !== undefined && numValue < rule.min) {
                    return rule.min;
                }
                
                if (rule.max !== undefined && numValue > rule.max) {
                    return rule.max;
                }
                
                if (rule.integer && !Number.isInteger(numValue)) {
                    return Math.round(numValue);
                }
                
                return numValue;
            }
            
            // 文字列の修正
            if (rule.type === 'string') {
                let strValue = String(value);
                
                if (rule.maxLength && strValue.length > rule.maxLength) {
                    return strValue.substring(0, rule.maxLength);
                }
                
                if (rule.minLength && strValue.length < rule.minLength) {
                    return strValue.padEnd(rule.minLength, ' ');
                }
                
                return strValue;
            }
            
            // ブール値の修正
            if (rule.type === 'boolean') {
                if (typeof value === 'boolean') {
                    return value;
                }
                
                if (value === 'true' || value === 1 || value === '1') {
                    return true;
                }
                
                if (value === 'false' || value === 0 || value === '0') {
                    return false;
                }
                
                return false; // デフォルト
            }
            
            // 配列の修正
            if (rule.type === 'object' && Array.isArray(value)) {
                if (rule.maxLength && value.length > rule.maxLength) {
                    return value.slice(0, rule.maxLength);
                }
                
                return value;
            }
            
            return null; // 修正不可
            
        } catch (error) {
            return null;
        }
    }
    
    /**
     * 計算パラメータを修正
     * @private
     */
    private _correctCalculationParams(params: any, calculationType: string): any {
        try {
            const corrected = { ...params };
            
            // 数値パラメータの修正
            for (const [key, value] of Object.entries(corrected)) {
                if (typeof value === 'number') {
                    if (isNaN(value)) {
                        corrected[key] = 0;
                    } else if (!isFinite(value)) {
                        corrected[key] = Number.MAX_SAFE_INTEGER;
                    } else if (value < 0 && this._shouldBePositive(key, calculationType)) {
                        corrected[key] = Math.abs(value);
                    } else if (value > Number.MAX_SAFE_INTEGER) {
                        corrected[key] = Number.MAX_SAFE_INTEGER;
                    }
                }
            }
            
            return corrected;
            
        } catch (error) {
            return null;
        }
    }
    
    /**
     * パラメータが正の値であるべきかチェック
     * @private
     */
    private _shouldBePositive(paramName: string, calculationType: string): boolean {
        const positiveParams = [
            'score', 'count', 'level', 'age', 'health', 'cost', 'duration',
            'intensity', 'multiplier', 'bonus', 'experience'
        ];
        
        return positiveParams.some(param => paramName.toLowerCase().includes(param));
    }
    
    /**
     * 安全な計算結果を取得
     * @private
     */
    private _getSafeCalculationResult(calculationType: string, expectedType: string): any {
        const safeValues: Record<string, number> = {
            score: 0,
            cost: 1,
            multiplier: 1,
            duration: 1000,
            count: 1,
            level: 1,
            health: 100,
            intensity: 0.5
        };
        
        // 計算種別に基づく安全な値
        for (const [key, value] of Object.entries(safeValues)) {
            if (calculationType.toLowerCase().includes(key)) {
                return value;
            }
        }
        
        // 型に基づく安全な値
        switch (expectedType) {
            case 'number': return 0;
            case 'string': return '';
            case 'boolean': return false;
            case 'object': return {};
            case 'array': return [];
            default: return null;
        }
    }
    
    /**
     * フォールバック値を生成
     * @private
     */
    private _generateFallbackValue(category: string, key: string): any {
        // カテゴリとキーに基づくフォールバック値
        const fallbackMap: Record<string, Record<string, any>> = {
            'game.scoring': { baseScore: 10, multiplier: 1.0 },
            'game.bubbles': { maxAge: 30000, health: 1 },
            'game.stages': { unlockScore: 1000, difficulty: 1 },
            'audio.volumes': { master: 0.7, sfx: 0.8, bgm: 0.5 },
            'effects.particles': { maxCount: 100, quality: 1.0 },
            'performance.optimization': { maxBubbles: 20, quality: 1.0 }
        };
        
        // 直接キーマッチングを試行
        for (const [mapKey, values] of Object.entries(fallbackMap)) {
            const [mapCategory, mapSubCategory] = mapKey.split('.');
            if (category === mapCategory) {
                if (values[key] !== undefined) {
                    return values[key];
                }
            }
        }
        
        // 汎用フォールバック値（優先順位に注意、大文字小文字を区別しない）
        const lowerKey = key.toLowerCase();
        // より具体的なパターンを先にチェック（部分一致の問題を避けるため）
        if (lowerKey.includes('duration') || lowerKey.includes('time')) return 1000;
        if (lowerKey.includes('multiplier') || (lowerKey.includes('ratio') && !lowerKey.includes('duration'))) return 1.0;
        if (lowerKey.includes('volume') || lowerKey.includes('quality')) return 0.5;
        if (lowerKey.includes('enabled') || lowerKey.includes('active')) return true;
        if (lowerKey.includes('count') || lowerKey.includes('max')) return 10;
        if (lowerKey.includes('score') || lowerKey.includes('cost')) return 100;
        
        return null;
    }
    
    /**
     * セーフモードを有効化
     * @private
     */
    private _enableSafeMode(): void {
        this.fallbackState.safeMode = true;
        this.fallbackState.useDefaultValues = true;
        this.fallbackState.disableValidation = true;
        
        this.logger.warn('セーフモードを有効化', {
            fallbackState: this.fallbackState
        }, 'ConfigurationErrorHandler');
        
        // グローバルエラーハンドラーに通知
        const globalHandler = getErrorHandler();
        (globalHandler as any).enableSafeMode();
    }
    
    /**
     * エラー統計を更新
     * @private
     */
    private _updateErrorStats(errorType: string): void {
        this.errorStats.total++;
        
        const currentCount = this.errorStats.byType.get(errorType) || 0;
        this.errorStats.byType.set(errorType, currentCount + 1);
    }
    
    /**
     * 統計をリセット（必要に応じて）
     * @private
     */
    private _resetStatsIfNeeded(): void {
        const now = Date.now();
        const hoursSinceReset = (now - this.errorStats.lastReset) / (1000 * 60 * 60);
        
        if (hoursSinceReset >= 24) { // 24時間ごとにリセット
            this.errorStats = {
                total: 0,
                byType: new Map(),
                recovered: 0,
                failed: 0,
                lastReset: now
            };
            
            // 復旧試行履歴もクリア
            this.recoveryAttempts.clear();
            
            this.logger.info('エラー統計をリセット', null, 'ConfigurationErrorHandler');
        }
    }
    
    /**
     * エラー率を監視
     * @private
     */
    private _monitorErrorRate(): void {
        if (this.errorStats.total === 0) return;
        
        const errorRate = (this.errorStats.failed / this.errorStats.total) * 100;
        const recoveryRate = (this.errorStats.recovered / this.errorStats.total) * 100;
        
        if (errorRate > 50) { // エラー率が50%を超えた場合
            this.logger.warn('高いエラー率を検出', {
                errorRate: `${errorRate.toFixed(2)}%`,
                recoveryRate: `${recoveryRate.toFixed(2)}%`,
                totalErrors: this.errorStats.total
            }, 'ConfigurationErrorHandler');
            
            // セーフモードを有効化
            if (!this.fallbackState.safeMode) {
                this._enableSafeMode();
            }
        }
    }
    
    /**
     * エラー統計を取得
     */
    public getErrorStats(): any {
        const errorRate = this.errorStats.total > 0 
            ? (this.errorStats.failed / this.errorStats.total) * 100 
            : 0;
        
        const recoveryRate = this.errorStats.total > 0 
            ? (this.errorStats.recovered / this.errorStats.total) * 100 
            : 0;
        
        return {
            total: this.errorStats.total,
            recovered: this.errorStats.recovered,
            failed: this.errorStats.failed,
            errorRate: `${errorRate.toFixed(2)}%`,
            recoveryRate: `${recoveryRate.toFixed(2)}%`,
            byType: Object.fromEntries(this.errorStats.byType),
            fallbackState: { ...this.fallbackState },
            lastReset: new Date(this.errorStats.lastReset).toISOString()
        };
    }
    
    /**
     * フォールバック状態を取得
     */
    public getFallbackState(): FallbackState {
        return { ...this.fallbackState };
    }
    
    /**
     * フォールバック状態をリセット
     */
    public resetFallbackState(): void {
        this.fallbackState = {
            useDefaultValues: false,
            disableValidation: false,
            disableCache: false,
            safeMode: false
        };
        
        this.logger.info('フォールバック状態をリセット', null, 'ConfigurationErrorHandler');
    }
    
    /**
     * 復旧試行履歴をクリア
     */
    public clearRecoveryAttempts(): void {
        this.recoveryAttempts.clear();
        this.logger.info('復旧試行履歴をクリア', null, 'ConfigurationErrorHandler');
    }
}

// シングルトンインスタンス
let instance: ConfigurationErrorHandler | null = null;

/**
 * ConfigurationErrorHandlerのシングルトンインスタンスを取得
 */
export function getConfigurationErrorHandler(): ConfigurationErrorHandler {
    if (!instance) {
        instance = new ConfigurationErrorHandler();
    }
    return instance;
}