import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// 型定義
export interface FontErrorConfig {
    suppressRepeated?: boolean;
    suppressionTimeWindow?: number;
    maxErrorsPerSource?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    development?: {
        verboseLogging?: boolean;
    };
}

export interface FontErrorContext {
    source: 'local' | 'google' | 'system';
    fontFamily?: string;
    url?: string;
    timeout?: number;
}

export interface ErrorInfo {
    type: string;
    severity: 'info' | 'warn' | 'error';
}

export interface SuppressionRules {
    repeatSuppression: {
        enabled: boolean;
        timeWindow: number;
        maxOccurrences: number;
    };
    sourceBasedSuppression: {
        [source: string]: {
            [errorType: string]: 'suppress' | 'warn_once' | 'error';
        };
    };
}

export interface FontErrorStats {
    totalErrors: number;
    suppressedErrors: number;
    errorsByType: Record<string, number>;
    errorsBySource: Record<string, number>;
    recentErrors: number;
}

/**
 * フォント読み込みエラーハンドラー
 * フォント読み込み時のエラーを適切に処理し、ログ出力を管理
 */
export class FontErrorHandler {
    private config: FontErrorConfig;
    private errorCounts: Map<string, number>;
    private suppressedErrors: Set<string>;
    private errorHistory: Map<string, number[]>;
    private suppressionRules: SuppressionRules;

    constructor(config: FontErrorConfig = {}) {
        this.config = {
            suppressRepeated: true,
            suppressionTimeWindow: 60000, // 1分
            maxErrorsPerSource: 5,
            logLevel: 'warn',
            development: {
                verboseLogging: false
            },
            ...config
        };

        this.errorCounts = new Map<string, number>();
        this.suppressedErrors = new Set<string>();
        this.errorHistory = new Map<string, number[]>();
        this.suppressionRules = this.initializeSuppressionRules();

        console.log('FontErrorHandler initialized');
    }

    /**
     * 抑制ルールを初期化
     */
    private initializeSuppressionRules(): SuppressionRules {
        return {
            repeatSuppression: {
                enabled: this.config.suppressRepeated ?? true,
                timeWindow: this.config.suppressionTimeWindow ?? 60000,
                maxOccurrences: this.config.maxErrorsPerSource ?? 5
            },
            sourceBasedSuppression: {
                local: {
                    FileNotFoundError: 'suppress',
                    TimeoutError: 'warn_once'
                },
                google: {
                    NetworkError: 'warn_once',
                    TimeoutError: 'warn_once'
                },
                system: {
                    FileNotFoundError: 'warn_once', // システムフォント不在は一度だけ警告
                    ConfigurationError: 'error'
                }
            }
        };
    }

    /**
     * フォントエラーを処理
     */
    handleFontError(error: Error, context: FontErrorContext): boolean {
        try {
            const errorInfo = this.categorizeError(error, context);
            const errorKey = `${context.source}:${errorInfo.type}:${context.fontFamily || 'unknown'}`;

            // 抑制チェック
            const shouldSuppress = this.shouldSuppressError(errorInfo.type, context.source);

            if (shouldSuppress === 'warn_once') {
                if (this.suppressedErrors.has(errorKey)) {
                    return false; // 既に警告済みなので抑制
                }
                this.suppressedErrors.add(errorKey);
            } else if (shouldSuppress === 'suppress') {
                return false;
            }

            const logLevel = this.getLogLevel(shouldSuppress, errorInfo.type, context);
            this.logFontError(error, logLevel, context);

            this.updateErrorHistory(errorInfo, context);
            return true;

        } catch (handlerError) {
            console.error('FontErrorHandler encountered an error:', handlerError);
            return false;
        }
    }

    /**
     * エラーを分類
     */
    private categorizeError(error: Error, context: FontErrorContext): ErrorInfo {
        const errorMessage = (error.message || error.toString()).toLowerCase();

        if (errorMessage.includes('network') ||
            errorMessage.includes('fetch') ||
            errorMessage.includes('cors') ||
            (context.source === 'google' && errorMessage.includes('failed'))) {
            return { type: 'NetworkError', severity: 'warn' };
        }

        if (errorMessage.includes('not found') ||
            errorMessage.includes('404') ||
            (errorMessage.includes('file') && errorMessage.includes('not')) ||
            (context.source === 'local' && errorMessage.includes('failed'))) {
            return { type: 'FileNotFoundError', severity: 'warn' };
        }

        if (errorMessage.includes('timeout') ||
            errorMessage.includes('time out')) {
            return { type: 'TimeoutError', severity: 'warn' };
        }

        if (errorMessage.includes('config') ||
            errorMessage.includes('setting')) {
            return { type: 'ConfigurationError', severity: 'error' };
        }

        return { type: 'UnknownError', severity: 'warn' };
    }

    /**
     * エラーの抑制判定
     */
    shouldSuppressError(errorType: string, source: string): 'suppress' | 'warn_once' | 'error' | false {
        const sourceRules = this.suppressionRules.sourceBasedSuppression[source];
        
        if (sourceRules && sourceRules[errorType]) {
            return sourceRules[errorType];
        }

        if (this.suppressionRules.repeatSuppression.enabled) {
            const errorKey = `${source}:${errorType}`;
            const history = this.errorHistory.get(errorKey);
            
            if (history) {
                const now = Date.now();
                const recentErrors = history.filter(timestamp =>
                    now - timestamp < this.suppressionRules.repeatSuppression.timeWindow
                );

                if (recentErrors.length >= this.suppressionRules.repeatSuppression.maxOccurrences) {
                    return 'suppress';
                }
            }
        }

        return false;
    }

    /**
     * ログレベルを取得
     */
    private getLogLevel(
        suppressionType: 'suppress' | 'warn_once' | 'error' | false,
        errorType: string,
        context: FontErrorContext
    ): 'debug' | 'info' | 'warn' | 'error' {
        if (suppressionType === 'warn_once') {
            return 'warn';
        }

        if (errorType === 'ConfigurationError') {
            return 'error';
        }

        // システムフォントエラーは一般的により低いログレベルに
        if (context.source === 'system' && errorType === 'FileNotFoundError') {
            return 'info';
        }

        return this.config.logLevel || 'warn';
    }

    /**
     * フォントエラーをログ出力
     */
    logFontError(
        error: Error,
        level: 'debug' | 'info' | 'warn' | 'error' = 'warn',
        context: FontErrorContext = {} as FontErrorContext
    ): void {
        const message = this.formatErrorMessage(error, context);
        
        if (this.config.development?.verboseLogging) {
            this.logDetailedError(error, context, level);
        } else {
            this.logSimpleError(message, level);
        }
    }

    /**
     * エラーメッセージをフォーマット
     */
    private formatErrorMessage(error: Error, context: FontErrorContext): string {
        const fontFamily = context.fontFamily || 'unknown';
        const source = context.source || 'unknown';
        const suggestion = this.getSuggestion(error, context);
        
        return `Font loading failed: ${fontFamily} from ${source}. ${suggestion}`;
    }

    /**
     * エラーの対処提案を取得
     */
    private getSuggestion(error: Error, context: FontErrorContext): string {
        const errorMessage = (error.message || error.toString()).toLowerCase();

        if (context.source === 'google' && errorMessage.includes('network')) {
            return 'Check network connectivity or consider using local fonts as fallback.';
        }

        if (context.source === 'local' && errorMessage.includes('not found')) {
            return `Ensure font file exists at '/fonts/${context.fontFamily}.woff2' or disable local font loading.`;
        }

        if (errorMessage.includes('timeout')) {
            return 'Font loading is taking too long. Using system fonts as fallback.';
        }

        // システムフォントが見つからない場合は、より一般的なメッセージ
        if (context.source === 'system') {
            return 'Using system fallback fonts.';
        }

        return 'Using fallback fonts. Check font configuration.';
    }

    /**
     * 詳細エラーをログ出力
     */
    private logDetailedError(
        error: Error,
        context: FontErrorContext,
        level: 'debug' | 'info' | 'warn' | 'error'
    ): void {
        const details = {
            fontFamily: context.fontFamily,
            source: context.source,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            suggestion: this.getSuggestion(error, context)
        };

        (console as any)[level]('[FontErrorHandler] Detailed font loading error:', details);
    }

    /**
     * シンプルエラーをログ出力
     */
    private logSimpleError(message: string, level: 'debug' | 'info' | 'warn' | 'error'): void {
        // debugレベルは本番環境では表示しない
        if (level === 'debug' && !this.config.development?.verboseLogging) {
            return;
        }

        // consoleにdebugメソッドがない場合はlogを使用
        const logMethod = (console as any)[level] || console.log;
        logMethod(`[FontErrorHandler] ${message}`);
    }

    /**
     * エラー履歴を更新
     */
    private updateErrorHistory(errorInfo: ErrorInfo, context: FontErrorContext): void {
        const errorKey = `${context.source}:${errorInfo.type}`;
        const history = this.errorHistory.get(errorKey) || [];
        
        history.push(Date.now());
        
        // 履歴サイズを制限
        const maxHistoryLength = 10;
        if (history.length > maxHistoryLength) {
            history.splice(0, history.length - maxHistoryLength);
        }

        this.errorHistory.set(errorKey, history);

        // エラーカウントを更新
        const countKey = `${context.source}:${errorInfo.type}`;
        this.errorCounts.set(countKey, (this.errorCounts.get(countKey) || 0) + 1);
    }

    /**
     * エラー履歴をクリア
     */
    clearErrorHistory(): void {
        this.errorHistory.clear();
        this.suppressedErrors.clear();
        this.errorCounts.clear();
        console.log('Font error history cleared');
    }

    /**
     * エラー統計を取得
     */
    getErrorStats(): FontErrorStats {
        const stats: FontErrorStats = {
            totalErrors: 0,
            suppressedErrors: this.suppressedErrors.size,
            errorsByType: {},
            errorsBySource: {},
            recentErrors: 0
        };

        const now = Date.now();
        const recentTimeWindow = 60000; // 1分

        for (const [errorKey, history] of this.errorHistory.entries()) {
            const [source, type] = errorKey.split(':');
            
            if (!stats.errorsBySource[source]) {
                stats.errorsBySource[source] = 0;
            }
            if (!stats.errorsByType[type]) {
                stats.errorsByType[type] = 0;
            }

            const errorCount = history.length;
            stats.totalErrors += errorCount;
            stats.errorsBySource[source] += errorCount;
            stats.errorsByType[type] += errorCount;

            // 最近のエラー数を計算
            const recentErrors = history.filter(timestamp => 
                now - timestamp < recentTimeWindow
            ).length;
            stats.recentErrors += recentErrors;
        }

        return stats;
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<FontErrorConfig>): void {
        this.config = { ...this.config, ...config };
        this.suppressionRules = this.initializeSuppressionRules();
        console.log('FontErrorHandler configuration updated');
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): {
        config: FontErrorConfig;
        errorCounts: Record<string, number>;
        suppressedErrors: string[];
        historySize: number;
        stats: FontErrorStats;
    } {
        return {
            config: this.config,
            errorCounts: Object.fromEntries(this.errorCounts),
            suppressedErrors: Array.from(this.suppressedErrors),
            historySize: this.errorHistory.size,
            stats: this.getErrorStats()
        };
    }
}

// シングルトンインスタンス
let fontErrorHandlerInstance: FontErrorHandler | null = null;

/**
 * FontErrorHandlerのシングルトンインスタンスを取得
 */
export function getFontErrorHandler(): FontErrorHandler {
    if (!fontErrorHandlerInstance) {
        fontErrorHandlerInstance = new FontErrorHandler();
    }
    return fontErrorHandlerInstance;
}