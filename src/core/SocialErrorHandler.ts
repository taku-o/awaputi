/**
 * ソーシャル機能のエラーハンドリング強化 (Task 19)
 * 包括的なエラーハンドリング、復旧機能、デバッグ情報収集を行う
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

// 型定義
interface ErrorCategory {
    severity: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
    recoverable: boolean;
    userMessage: string;
    debugInfo: string[];
}

interface ErrorInfo {
    id: string;
    type: string;
    category: ErrorCategory;
    error: any;
    context: any;
    component: string;
    timestamp: number;
    environment: EnvironmentInfo;
    stackTrace: string;
    debugData: any;
}

interface EnvironmentInfo {
    userAgent: string;
    platform: string;
    language: string;
    viewport: { width: number; height: number };
    cookiesEnabled: boolean;
    onLine: boolean;
}

interface ErrorStats {
    totalErrors: number;
    recoveredErrors: number;
    failedRecoveries: number;
    errorsByType: { [type: string]: number };
    errorsByComponent: { [component: string]: number };
}

interface RecoveryResult {
    recovered: boolean;
    errorInfo?: ErrorInfo;
    error?: any;
}

interface ErrorCategories {
    [key: string]: ErrorCategory;
}

type ErrorNotificationCallback = (errorInfo: ErrorInfo) => void;

export class SocialErrorHandler {
    private errorCategories: ErrorCategories;
    private errorHistory: ErrorInfo[];
    private maxHistorySize: number;
    private recoveryAttempts: Map<string, number>;
    private maxRecoveryAttempts: number;
    private debugMode: boolean;
    private errorNotificationCallbacks: Set<ErrorNotificationCallback>;
    private errorStats: ErrorStats;

    constructor() {
        // エラーカテゴリの定義
        this.errorCategories = {
            // ネットワーク関連
            NETWORK_ERROR: {
                severity: 'medium',
                recoverable: true,
                userMessage: '通信エラーが発生しました。接続を確認してください。',
                debugInfo: ['url', 'status', 'method']
            },

            TIMEOUT_ERROR: {
                severity: 'medium',
                recoverable: true,
                userMessage: 'タイムアウトしました。もう一度お試しください。',
                debugInfo: ['timeout', 'url', 'startTime']
            },
            
            // API関連
            WEB_SHARE_NOT_SUPPORTED: {
                severity: 'low',
                recoverable: true,
                userMessage: 'お使いのブラウザでは共有機能がサポートされていません。',
                debugInfo: ['userAgent', 'platform']
            },

            WEB_SHARE_FAILED: {
                severity: 'medium',
                recoverable: true,
                userMessage: '共有に失敗しました。別の方法でお試しください。',
                debugInfo: ['shareData', 'error']
            },
            
            // スクリーンショット関連
            SCREENSHOT_CAPTURE_FAILED: {
                severity: 'high',
                recoverable: true,
                userMessage: 'スクリーンショットの作成に失敗しました。',
                debugInfo: ['canvas', 'format', 'options']
            },

            SCREENSHOT_TOO_LARGE: {
                severity: 'medium',
                recoverable: true,
                userMessage: 'スクリーンショットのサイズが大きすぎます。',
                debugInfo: ['size', 'maxSize', 'dimensions']
            },
            
            // ソーシャルメディア関連
            TWITTER_URL_GENERATION_FAILED: {
                severity: 'low',
                recoverable: true,
                userMessage: 'Twitter共有URLの生成に失敗しました。',
                debugInfo: ['shareData', 'textLength']
            },

            FACEBOOK_URL_GENERATION_FAILED: {
                severity: 'low',
                recoverable: true,
                userMessage: 'Facebook共有URLの生成に失敗しました。',
                debugInfo: ['shareData', 'ogTags']
            },
            
            // データ関連
            INVALID_SHARE_DATA: {
                severity: 'high',
                recoverable: false,
                userMessage: '共有データが不正です。',
                debugInfo: ['shareData', 'validation']
            },

            STORAGE_QUOTA_EXCEEDED: {
                severity: 'high',
                recoverable: true,
                userMessage: 'ストレージ容量が不足しています。',
                debugInfo: ['quota', 'usage']
            },
            
            // システム関連
            INITIALIZATION_FAILED: {
                severity: 'critical',
                recoverable: false,
                userMessage: 'ソーシャル機能の初期化に失敗しました。',
                debugInfo: ['component', 'config']
            },

            MEMORY_ERROR: {
                severity: 'high',
                recoverable: true,
                userMessage: 'メモリ不足エラーが発生しました。',
                debugInfo: ['memoryUsage', 'component']
            }
        };
        
        // エラー履歴
        this.errorHistory = [];
        this.maxHistorySize = 100;
        
        // 復旧試行回数
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        
        // デバッグモード
        this.debugMode = false;
        
        // エラー通知コールバック
        this.errorNotificationCallbacks = new Set();
        
        // パフォーマンス統計
        this.errorStats = {
            totalErrors: 0,
            recoveredErrors: 0,
            failedRecoveries: 0,
            errorsByType: {},
            errorsByComponent: {}
        };
    }
    
    /**
     * エラーの処理
     */
    async handleError(errorType: string, error: any, context: any = {}, component: string = 'Unknown'): Promise<RecoveryResult> {
        try {
            const errorCategory = this.errorCategories[errorType] || {
                severity: 'unknown' as const,
                recoverable: false,
                userMessage: 'エラーが発生しました。',
                debugInfo: []
            };
            
            // エラー情報の構築
            const errorInfo: ErrorInfo = {
                id: this.generateErrorId(),
                type: errorType,
                category: errorCategory,
                error: this.sanitizeError(error),
                context: this.sanitizeContext(context),
                component,
                timestamp: Date.now(),
                environment: this.getEnvironmentInfo(),
                stackTrace: this.getStackTrace(error),
                debugData: this.collectDebugData(errorType, error, context, errorCategory.debugInfo)
            };
            
            // エラー履歴に記録
            this.addToHistory(errorInfo);
            
            // 統計の更新
            this.updateStatistics(errorType, component);
            
            // エラーログ
            this.logError(errorInfo);
            
            // ErrorHandlerユーティリティへの転送
            if (ErrorHandler) {
                ErrorHandler.handleError(error, component, { errorType, ...context });
            }
            
            // ユーザー通知
            this.notifyUser(errorInfo);
            
            // エラー通知コールバックの実行
            this.notifyCallbacks(errorInfo);
            
            // 復旧可能な場合は復旧を試行
            if (errorCategory.recoverable) {
                const recovered = await this.attemptRecovery(errorType, error, context, component);
                if (recovered) {
                    this.errorStats.recoveredErrors++;
                    return { recovered: true, errorInfo };
                }
            }
            
            return { recovered: false, errorInfo };
            
        } catch (handlingError) {
            console.error('[SocialErrorHandler] エラーハンドリング中にエラー:', handlingError);
            return { recovered: false, error: handlingError };
        }
    }
    
    /**
     * エラー復旧の試行
     */
    async attemptRecovery(errorType: string, error: any, context: any, component: string): Promise<boolean> {
        const recoveryKey = `${errorType}-${component}`;
        const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
        
        if (attempts >= this.maxRecoveryAttempts) {
            this.errorStats.failedRecoveries++;
            return false;
        }
        
        this.recoveryAttempts.set(recoveryKey, attempts + 1);
        
        try {
            switch(errorType) {
                case 'NETWORK_ERROR':
                case 'TIMEOUT_ERROR':
                    return await this.recoverFromNetworkError(error, context);
                case 'SCREENSHOT_TOO_LARGE':
                    return await this.recoverFromLargeScreenshot(error, context);
                case 'STORAGE_QUOTA_EXCEEDED':
                    return await this.recoverFromStorageQuota(error, context);
                case 'MEMORY_ERROR':
                    return await this.recoverFromMemoryError(error, context);
                case 'WEB_SHARE_FAILED':
                    return await this.recoverFromWebShareFailure(error, context);
                default:
                    return false;
            }
        } catch (recoveryError) {
            console.error(`[SocialErrorHandler] 復旧試行失敗 (${errorType}):`, recoveryError);
            return false;
        }
    }
    
    /**
     * ネットワークエラーからの復旧
     */
    async recoverFromNetworkError(error: any, context: any): Promise<boolean> {
        // ネットワーク状態の確認
        if (!navigator.onLine) {
            // オフライン時は復旧を延期
            return false;
        }
        
        // 簡単な再試行
        if (context.retryFunction && typeof context.retryFunction === 'function') {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
                await context.retryFunction();
                return true;
            } catch (retryError) {
                console.warn('[SocialErrorHandler] ネットワークエラー復旧試行失敗:', retryError);
                return false;
            }
        }
        
        return false;
    }
    
    /**
     * スクリーンショットサイズエラーからの復旧
     */
    async recoverFromLargeScreenshot(error: any, context: any): Promise<boolean> {
        try {
            if (context.canvas && context.reduceQuality) {
                // 品質を下げて再試行
                return await context.reduceQuality(context.canvas);
            }
        } catch (recoveryError) {
            console.warn('[SocialErrorHandler] スクリーンショットサイズ復旧失敗:', recoveryError);
        }
        return false;
    }
    
    /**
     * ストレージ容量超過からの復旧
     */
    async recoverFromStorageQuota(error: any, context: any): Promise<boolean> {
        try {
            // 古いデータの削除
            const keys = Object.keys(localStorage);
            const bubblePopKeys = keys.filter(key => key.startsWith('bubblePop_'));
            
            // 古いキーから順に削除
            bubblePopKeys.sort();
            for (let i = 0; i < Math.min(5, bubblePopKeys.length); i++) {
                localStorage.removeItem(bubblePopKeys[i]);
            }
            
            return true;
        } catch (recoveryError) {
            console.warn('[SocialErrorHandler] ストレージクリーンアップ失敗:', recoveryError);
            return false;
        }
    }
    
    /**
     * メモリエラーからの復旧
     */
    async recoverFromMemoryError(error: any, context: any): Promise<boolean> {
        try {
            // ガベージコレクションの強制実行（可能な場合）
            if ((window as any).gc) {
                (window as any).gc();
            }
            
            // メモリ使用量の多そうなキャッシュをクリア
            if (context.clearCache && typeof context.clearCache === 'function') {
                context.clearCache();
            }
            
            return true;
        } catch (recoveryError) {
            console.warn('[SocialErrorHandler] メモリエラー復旧失敗:', recoveryError);
            return false;
        }
    }
    
    /**
     * Web Share API失敗からの復旧
     */
    async recoverFromWebShareFailure(error: any, context: any): Promise<boolean> {
        try {
            // フォールバック方法を試行
            if (context.fallbackShare && typeof context.fallbackShare === 'function') {
                return await context.fallbackShare(context.shareData);
            }
        } catch (recoveryError) {
            console.warn('[SocialErrorHandler] Web Share復旧失敗:', recoveryError);
        }
        return false;
    }
    
    /**
     * エラー情報のサニタイズ
     */
    private sanitizeError(error: any): any {
        if (!error) return null;
        
        return {
            name: error.name || 'Unknown',
            message: error.message || 'No message',
            code: error.code || null,
            stack: this.debugMode ? error.stack : null
        };
    }
    
    /**
     * コンテキスト情報のサニタイズ
     */
    private sanitizeContext(context: any): any {
        if (!context || typeof context !== 'object') return {};
        
        const sanitized: any = {};
        for (const key in context) {
            if (context.hasOwnProperty(key)) {
                const value = context[key];
                // 関数やDOMオブジェクトは除外
                if (typeof value !== 'function' && !(value instanceof Node)) {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }
    
    /**
     * デバッグデータの収集
     */
    private collectDebugData(errorType: string, error: any, context: any, debugFields: string[]): any {
        const debugData: any = {};
        
        for (const field of debugFields) {
            if (context[field] !== undefined) {
                debugData[field] = context[field];
            } else if (error[field] !== undefined) {
                debugData[field] = error[field];
            }
        }
        
        return debugData;
    }
    
    /**
     * スタックトレースの取得
     */
    private getStackTrace(error: any): string {
        if (error && error.stack && this.debugMode) {
            return error.stack;
        }
        
        // スタックトレースを生成
        if (this.debugMode) {
            try {
                throw new Error();
            } catch (e: any) {
                return e.stack || 'No stack trace available';
            }
        }
        
        return 'Stack trace disabled';
    }
    
    /**
     * 環境情報の取得
     */
    private getEnvironmentInfo(): EnvironmentInfo {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            viewport: {
                width: window.innerWidth || document.documentElement.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight
            },
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }
    
    /**
     * エラーIDの生成
     */
    private generateErrorId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `err_${timestamp}_${random}`;
    }
    
    /**
     * エラー履歴への追加
     */
    private addToHistory(errorInfo: ErrorInfo): void {
        this.errorHistory.unshift(errorInfo);
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }
    }
    
    /**
     * 統計の更新
     */
    private updateStatistics(errorType: string, component: string): void {
        this.errorStats.totalErrors++;
        
        if (!this.errorStats.errorsByType[errorType]) {
            this.errorStats.errorsByType[errorType] = 0;
        }
        this.errorStats.errorsByType[errorType]++;
        
        if (!this.errorStats.errorsByComponent[component]) {
            this.errorStats.errorsByComponent[component] = 0;
        }
        this.errorStats.errorsByComponent[component]++;
    }
    
    /**
     * エラーログの記録
     */
    private logError(errorInfo: ErrorInfo): void {
        const logLevel = this.getLogLevel(errorInfo.category.severity);
        const message = `[SocialErrorHandler] ${errorInfo.type}: ${errorInfo.category.userMessage}`;
        
        switch (logLevel) {
            case 'error':
                console.error(message, this.debugMode ? errorInfo : null);
                break;
            case 'warn':
                console.warn(message, this.debugMode ? errorInfo : null);
                break;
            default:
                console.log(message, this.debugMode ? errorInfo : null);
        }
    }
    
    /**
     * ログレベルの取得
     */
    private getLogLevel(severity: string): string {
        switch (severity) {
            case 'critical':
            case 'high':
                return 'error';
            case 'medium':
                return 'warn';
            default:
                return 'log';
        }
    }
    
    /**
     * ユーザーへの通知
     */
    private notifyUser(errorInfo: ErrorInfo): void {
        // 重要度の高いエラーのみユーザーに通知
        if (errorInfo.category.severity === 'high' || errorInfo.category.severity === 'critical') {
            // カスタムイベントとして発火
            const event = new CustomEvent('socialError', {
                detail: {
                    message: errorInfo.category.userMessage,
                    type: errorInfo.type,
                    severity: errorInfo.category.severity
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    /**
     * エラー通知コールバックの実行
     */
    private notifyCallbacks(errorInfo: ErrorInfo): void {
        for (const callback of this.errorNotificationCallbacks) {
            try {
                callback(errorInfo);
            } catch (callbackError) {
                console.warn('[SocialErrorHandler] エラー通知コールバック実行失敗:', callbackError);
            }
        }
    }
    
    /**
     * エラー通知コールバックの登録
     */
    addErrorNotificationCallback(callback: ErrorNotificationCallback): void {
        this.errorNotificationCallbacks.add(callback);
    }
    
    /**
     * エラー通知コールバックの削除
     */
    removeErrorNotificationCallback(callback: ErrorNotificationCallback): void {
        this.errorNotificationCallbacks.delete(callback);
    }
    
    /**
     * デバッグモードの設定
     */
    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }
    
    /**
     * エラー履歴の取得
     */
    getErrorHistory(limit?: number): ErrorInfo[] {
        if (limit && limit > 0) {
            return this.errorHistory.slice(0, limit);
        }
        return [...this.errorHistory];
    }
    
    /**
     * エラー統計の取得
     */
    getErrorStats(): ErrorStats {
        return { ...this.errorStats };
    }
    
    /**
     * 復旧試行回数のリセット
     */
    resetRecoveryAttempts(errorType?: string): void {
        if (errorType) {
            // 特定のエラータイプの復旧試行回数をリセット
            const keysToDelete = Array.from(this.recoveryAttempts.keys())
                .filter(key => key.startsWith(errorType));
            for (const key of keysToDelete) {
                this.recoveryAttempts.delete(key);
            }
        } else {
            // 全ての復旧試行回数をリセット
            this.recoveryAttempts.clear();
        }
    }
    
    /**
     * エラーハンドラーのクリーンアップ
     */
    destroy(): void {
        this.errorHistory = [];
        this.recoveryAttempts.clear();
        this.errorNotificationCallbacks.clear();
        this.errorStats = {
            totalErrors: 0,
            recoveredErrors: 0,
            failedRecoveries: 0,
            errorsByType: {},
            errorsByComponent: {}
        };
    }
}