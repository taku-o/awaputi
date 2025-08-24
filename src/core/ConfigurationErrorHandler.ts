/**
 * 設定システム専用エラーハンドリングクラス
 * 
 * 設定エラー、計算エラーの統一的な処理を実装し、
 * エラー復旧機能を提供します。
 */

import { getErrorHandler } from '../utils/ErrorHandler';
import { getLoggingSystem } from './LoggingSystem';
import { getValidationSystem } from './ValidationSystem';

export enum ConfigErrorType {
    CONFIGURATION_ACCESS = 'CONFIGURATION_ACCESS',
    CONFIGURATION_VALIDATION = 'CONFIGURATION_VALIDATION',
    CONFIGURATION_STORAGE = 'CONFIGURATION_STORAGE',
    CALCULATION_ERROR = 'CALCULATION_ERROR',
    CALCULATION_OVERFLOW = 'CALCULATION_OVERFLOW',
    CACHE_ERROR = 'CACHE_ERROR',
    DEPENDENCY_ERROR = 'DEPENDENCY_ERROR'
}

interface RecoveryStrategy {
    maxAttempts: number;
    strategy: (error: Error, context: any) => RecoveryResult;
}

interface RecoveryResult {
    success: boolean;
    value?: any;
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

export class ConfigurationErrorHandler {
    private errorTypes = ConfigErrorType;
    private recoveryStrategies: Map<ConfigErrorType, RecoveryStrategy>;
    private errorStats: ErrorStats;
    private recoveryAttempts: Map<string, number>;
    private maxRecoveryAttempts: number = 3;
    private fallbackState: FallbackState;
    private logger: any;

    constructor() {
        this.recoveryStrategies = new Map();
        this.errorStats = {
            total: 0,
            byType: new Map(),
            recovered: 0,
            failed: 0,
            lastReset: Date.now()
        };

        this.recoveryAttempts = new Map();
        this.fallbackState = {
            useDefaultValues: false,
            disableValidation: false,
            disableCache: false,
            safeMode: false
        };

        this.logger = getLoggingSystem();
        this._initialize();
    }

    private _initialize(): void {
        this._setupRecoveryStrategies();
        this._setupErrorMonitoring();
        this.logger.info('ConfigurationErrorHandler initialized', null, 'ConfigurationErrorHandler');
    }

    private _setupRecoveryStrategies(): void {
        // 設定アクセスエラーの復旧
        this.recoveryStrategies.set(ConfigErrorType.CONFIGURATION_ACCESS, {
            maxAttempts: 3,
            strategy: (error: Error, context: any) => {
                const { category, key, defaultValue } = context;
                
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
        this.recoveryStrategies.set(ConfigErrorType.CONFIGURATION_VALIDATION, {
            maxAttempts: 2,
            strategy: (error: Error, context: any) => {
                const { category, key, value, defaultValue } = context;
                
                if (defaultValue !== undefined) {
                    this.logger.warn(`設定検証エラー、デフォルト値に戻す: ${category}.${key}`, {
                        error: error.message,
                        invalidValue: value,
                        defaultValue
                    }, 'ConfigurationErrorHandler');
                    
                    return {
                        success: true,
                        value: defaultValue,
                        message: 'デフォルト値に戻す'
                    };
                }
                
                return {
                    success: false,
                    message: '復旧不可能な検証エラー'
                };
            }
        });

        // 設定保存エラーの復旧
        this.recoveryStrategies.set(ConfigErrorType.CONFIGURATION_STORAGE, {
            maxAttempts: 3,
            strategy: (error: Error, context: any) => {
                const { operation, category, key } = context;
                
                this.logger.warn(`設定保存エラー: ${operation}`, {
                    error: error.message,
                    category,
                    key
                }, 'ConfigurationErrorHandler');
                
                // セーフモードに切り替え
                this.fallbackState.safeMode = true;
                
                return {
                    success: true,
                    message: 'セーフモードで継続'
                };
            }
        });

        // 計算エラーの復旧
        this.recoveryStrategies.set(ConfigErrorType.CALCULATION_ERROR, {
            maxAttempts: 2,
            strategy: (error: Error, context: any) => {
                const { operation, fallbackValue } = context;
                
                this.logger.warn(`計算エラー: ${operation}`, {
                    error: error.message,
                    fallbackValue
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: true,
                    value: fallbackValue || 0,
                    message: '計算結果をフォールバック値で置換'
                };
            }
        });

        // キャッシュエラーの復旧
        this.recoveryStrategies.set(ConfigErrorType.CACHE_ERROR, {
            maxAttempts: 1,
            strategy: (error: Error, context: any) => {
                this.logger.warn('キャッシュエラー、キャッシュを無効化', {
                    error: error.message
                }, 'ConfigurationErrorHandler');
                
                this.fallbackState.disableCache = true;
                
                return {
                    success: true,
                    message: 'キャッシュを無効化して継続'
                };
            }
        });
    }

    private _setupErrorMonitoring(): void {
        // エラー監視の設定
        setInterval(() => {
            this._checkErrorThresholds();
        }, 60000); // 1分間隔でチェック
    }

    private _checkErrorThresholds(): void {
        const errorRate = this.errorStats.total > 0 ? this.errorStats.failed / this.errorStats.total : 0;
        
        if (errorRate > 0.5) { // 50%以上のエラー率
            this.logger.error('エラー率が高すぎます、セーフモードに切り替え', {
                errorRate: `${(errorRate * 100).toFixed(2)}%`,
                stats: this.errorStats
            }, 'ConfigurationErrorHandler');
            
            this.fallbackState.safeMode = true;
        }
    }

    private _generateFallbackValue(category: string, key: string): any {
        // 基本的なフォールバック値の生成
        if (key.includes('time') || key.includes('interval')) {
            return 1000; // 1秒
        }
        if (key.includes('count') || key.includes('max')) {
            return 10;
        }
        if (key.includes('enabled')) {
            return false;
        }
        return null;
    }

    handleError(errorType: ConfigErrorType, error: Error, context: any = {}): RecoveryResult {
        this.errorStats.total++;
        
        const typeCount = this.errorStats.byType.get(errorType) || 0;
        this.errorStats.byType.set(errorType, typeCount + 1);

        const strategy = this.recoveryStrategies.get(errorType);
        if (strategy) {
            try {
                const result = strategy.strategy(error, context);
                if (result.success) {
                    this.errorStats.recovered++;
                } else {
                    this.errorStats.failed++;
                }
                return result;
            } catch (recoveryError) {
                this.errorStats.failed++;
                this.logger.error('復旧戦略実行中にエラー', {
                    originalError: error.message,
                    recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
                }, 'ConfigurationErrorHandler');
                
                return {
                    success: false,
                    message: '復旧に失敗'
                };
            }
        }

        this.errorStats.failed++;
        return {
            success: false,
            message: '復旧戦略なし'
        };
    }

    getErrorStats(): ErrorStats {
        return { ...this.errorStats };
    }

    resetStats(): void {
        this.errorStats = {
            total: 0,
            byType: new Map(),
            recovered: 0,
            failed: 0,
            lastReset: Date.now()
        };
    }

    getFallbackState(): FallbackState {
        return { ...this.fallbackState };
    }

    setSafeMode(enabled: boolean): void {
        this.fallbackState.safeMode = enabled;
        this.logger.info(`セーフモード ${enabled ? '有効' : '無効'}`, null, 'ConfigurationErrorHandler');
    }
}

let instance: ConfigurationErrorHandler | null = null;

export function getConfigurationErrorHandler(): ConfigurationErrorHandler {
    if (!instance) {
        instance = new ConfigurationErrorHandler();
    }
    return instance;
}