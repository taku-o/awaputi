/**
 * LocalModeErrorHandler - ローカルモードエラーハンドリング専用クラス
 * LocalModeManager用の統合エラーハンドリング機能
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import LocalExecutionErrorHandler from '../LocalExecutionErrorHandler.js';
import DeveloperGuidanceSystem from '../DeveloperGuidanceSystem.js';

// Type definitions
interface ErrorStats {
    totalErrors: number;
    errorsByType: Map<string, number>;
    errorsByComponent: Map<string, number>;
    recoveredErrors: number;
    unrecoverableErrors: number;
}

interface ErrorMetadata {
    [key: string]: any;
    feature?: string;
    policy?: string;
    component?: string;
    config?: any;
    resource?: string;
    localModeContext?: boolean;
    timestamp?: string;
}

interface ErrorStatsOutput {
    mainErrorHandler: any;
    localErrorHandler: any;
    localMode: {
        totalErrors: number;
        errorsByType: Record<string, number>;
        errorsByComponent: Record<string, number>;
        recoveredErrors: number;
        unrecoverableErrors: number;
        recoveryRate: number;
    };
}

interface InitializationErrorConfig {
    enableDeveloperGuidance?: boolean;
    [key: string]: any;
}

interface InitializationGuidanceOptions {
    component: string;
    error: string;
    suggestions: string[];
}

interface ErrorInfo {
    error: string;
    stack?: string;
    context: string;
    metadata: ErrorMetadata;
    timestamp: string;
}
export default class LocalModeErrorHandler {
    /**
     * エラー統計
     */
    private static _errorStats: ErrorStats = {
        totalErrors: 0,
        errorsByType: new Map(),
        errorsByComponent: new Map(),
        recoveredErrors: 0,
        unrecoverableErrors: 0
    };

    /**
     * エラーハンドリング
     * @param error - エラーオブジェクト
     * @param context - エラーコンテキスト
     * @param metadata - エラーメタデータ
     */
    static handleError(error: Error, context: string = 'GENERAL', metadata: ErrorMetadata = {}): void {
        this._errorStats.totalErrors++;
        this._updateErrorStats('type', error.name || 'UnknownError');
        this._updateErrorStats('component', context);
        try {
            // LocalExecutionErrorHandlerに委譲
            if ((LocalExecutionErrorHandler as any).isInitialized) {
                this._delegateToLocalExecutionErrorHandler(error, context, metadata);
            } else {
                this._handleErrorLocally(error, context, metadata);
            }
            
            // 回復可能なエラーの場合は統計更新
            if (this._isRecoverableError(error)) {
                this._errorStats.recoveredErrors++;
            } else {
                this._errorStats.unrecoverableErrors++;
            }

        } catch (handlingError) {
            console.error('Error in error handling:', handlingError);
            this._errorStats.unrecoverableErrors++;
        }
    }
    
    /**
     * 互換性エラーハンドリング
     * @param error - 互換性エラー
     * @param feature - 機能名
     * @returns 処理成功フラグ
     */
    static handleCompatibilityError(error: Error, feature: string): boolean {
        this.handleError(error, 'COMPATIBILITY', { feature });
        try {
            if ((LocalExecutionErrorHandler as any).isInitialized) {
                (LocalExecutionErrorHandler as any).handleCompatibilityError(error, feature);
            }
            
            // フォールバック処理
            this._applyCompatibilityFallback(feature);
            return true;
            
        } catch (fallbackError) {
            console.error(`Compatibility error handling failed for ${feature}:`, fallbackError);
            return false;
        }
    }
    /**
     * セキュリティエラーハンドリング
     * @param error - セキュリティエラー
     * @param policy - セキュリティポリシー
     */
    static handleSecurityError(error: Error, policy: string): void {
        this.handleError(error, 'SECURITY', { policy });
        try {
            if ((LocalExecutionErrorHandler as any).isInitialized) {
                (LocalExecutionErrorHandler as any).handleSecurityError(error, policy);
            }
            
            // セキュリティ問題の緩和
            this._mitigateSecurityIssue(policy);
            
        } catch (mitigationError) {
            console.error(`Security error mitigation failed for ${policy}:`, mitigationError);
        }
    }
    
    /**
     * 初期化エラーハンドリング
     * @param error - 初期化エラー
     * @param component - コンポーネント名
     * @param config - 設定
     */
    static handleInitializationError(error: Error, component: string, config: InitializationErrorConfig): void {
        this.handleError(error, 'INITIALIZATION', { component, config });
        try {
            // 初期化失敗の場合の代替処理
            this._applyInitializationFallback(component, error);
            
            // 開発者ガイダンス表示
            if (config.enableDeveloperGuidance) {
                const guidanceOptions: InitializationGuidanceOptions = {
                    component,
                    error: error.message,
                    suggestions: this._getInitializationSuggestions(component, error)
                };
                
                (DeveloperGuidanceSystem as any).showInitializationError?.(guidanceOptions);
            }
            
        } catch (fallbackError) {
            console.error(`Initialization error handling failed for ${component}:`, fallbackError);
        }
    }
    
    /**
     * エラー統計取得
     * @returns エラー統計
     */
    static getErrorStats(): ErrorStatsOutput {
        return {
            mainErrorHandler: this._getMainErrorHandlerStats(),
            localErrorHandler: this._getLocalErrorHandlerStats(),
            localMode: {
                totalErrors: this._errorStats.totalErrors,
                errorsByType: Object.fromEntries(this._errorStats.errorsByType),
                errorsByComponent: Object.fromEntries(this._errorStats.errorsByComponent),
                recoveredErrors: this._errorStats.recoveredErrors,
                unrecoverableErrors: this._errorStats.unrecoverableErrors,
                recoveryRate: this._calculateRecoveryRate()
            }
        };
    }
    
    /**
     * エラー履歴クリア
     */
    static clearErrorHistory(): void {
        this._errorStats = {
            totalErrors: 0,
            errorsByType: new Map(),
            errorsByComponent: new Map(),
            recoveredErrors: 0,
            unrecoverableErrors: 0
        };
    }
    
    /**
     * LocalExecutionErrorHandlerに委譲
     * @private
     */
    private static _delegateToLocalExecutionErrorHandler(error: Error, context: string, metadata: ErrorMetadata): void {
        const enhancedMetadata: ErrorMetadata = {
            ...metadata,
            localModeContext: true,
            timestamp: new Date().toISOString()
        };

        if (context.includes('RESOURCE')) {
            (LocalExecutionErrorHandler as any).handleResourceError(error, metadata.resource || 'unknown');
        } else if (context.includes('COMPATIBILITY')) {
            (LocalExecutionErrorHandler as any).handleCompatibilityError(error, metadata.feature || 'unknown');
        } else if (context.includes('SECURITY')) {
            (LocalExecutionErrorHandler as any).handleSecurityError(error, metadata.policy || 'unknown');
        } else {
            // 汎用エラー処理
            (LocalExecutionErrorHandler as any).handleResourceError(error, context, enhancedMetadata);
        }
    }
    
    /**
     * ローカルエラー処理
     * @private
     */
    private static _handleErrorLocally(error: Error, context: string, metadata: ErrorMetadata): void {
        /*
        const _errorInfo: ErrorInfo = {
            error: error.message,
            stack: error.stack,
            context,
            metadata,
            timestamp: new Date().toISOString()
        };
        */

        console.group(`🚨 LocalMode Error (${context})`);
        console.error('Error:', error.message);
        console.error('Context:', context);
        console.error('Metadata:', metadata);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        console.groupEnd();
    }
    
    /**
     * エラー統計更新
     * @private
     */
    private static _updateErrorStats(category: 'type' | 'component', key: string): void {
        const statsMap = category === 'type' ? this._errorStats.errorsByType : this._errorStats.errorsByComponent;
        statsMap.set(key, (statsMap.get(key) || 0) + 1);
    }
    
    /**
     * 回復可能エラーかチェック
     * @private
     */
    private static _isRecoverableError(error: Error): boolean {
        const recoverableTypes: string[] = [
            'NetworkError',
            'TimeoutError',
            'TypeError',
            'ReferenceError'
        ];

        return recoverableTypes.includes(error.name) ||
               error.message.includes('CORS') ||
               error.message.includes('loading');
    }
    
    /**
     * 互換性フォールバック適用
     * @private
     */
    private static _applyCompatibilityFallback(feature: string): void {
        const fallbacks: Record<string, () => void> = {
            canvas: () => console.warn('Canvas API not available, using SVG fallback'),
            localStorage: () => console.warn('localStorage not available, using memory storage'),
            modules: () => console.warn('ES6 modules not supported, using legacy loading')
        };
        
        const fallback = fallbacks[feature];
        if (fallback) {
            fallback();
        }
    }
    
    /**
     * セキュリティ問題緩和
     * @private
     */
    private static _mitigateSecurityIssue(policy: string): void {
        const mitigations: Record<string, () => void> = {
            'X-Frame-Options': () => {
                console.warn('X-Frame-Options policy detected, optimizing for local execution');
            },
            'Content-Security-Policy': () => {
                console.warn('CSP policy detected, applying local execution adjustments');
            }
        };
        
        const mitigation = mitigations[policy];
        if (mitigation) {
            mitigation();
        }
    }
    
    /**
     * 初期化フォールバック適用
     * @private
     */
    private static _applyInitializationFallback(component: string, _error: Error): void {
        const fallbacks: Record<string, () => void> = {
            'faviconGenerator': () => {
                console.warn('Favicon generation failed, continuing without favicons');
            },
            'metaTagOptimizer': () => {
                console.warn('Meta tag optimization failed, using default tags');
            },
            'developerGuidance': () => {
                console.warn('Developer guidance system failed, continuing silently');
            }
        };
        
        const fallback = fallbacks[component];
        if (fallback) {
            fallback();
        }
    }
    
    /**
     * 初期化提案取得
     * @private
     */
    private static _getInitializationSuggestions(component: string, _error: Error): string[] {
        const suggestions: Record<string, string[]> = {
            'faviconGenerator': [
                'Check if Canvas API is supported in this browser',
                'Verify localStorage permissions for caching',
                'Try running with a local server instead of file://'
            ],
            'metaTagOptimizer': [
                'Check if DOM manipulation permissions are available',
                'Verify document.head access',
                'Try refreshing the page'
            ]
        };

        return suggestions[component] || ['Try refreshing the page', 'Check browser console for details'];
    }
    
    /**
     * メインエラーハンドラー統計取得
     * @private
     */
    private static _getMainErrorHandlerStats(): any {
        try {
            return (LocalExecutionErrorHandler as any).errorHandlerInstance?.getErrorStats?.() || {};
        } catch (error) {
            return { error: 'Stats unavailable' };
        }
    }
    
    /**
     * ローカルエラーハンドラー統計取得
     * @private
     */
    private static _getLocalErrorHandlerStats(): any {
        try {
            return (LocalExecutionErrorHandler as any).getDebugInfo?.() || {};
        } catch (error) {
            return { error: 'Debug info unavailable' };
        }
    }
    
    /**
     * 回復率計算
     * @private
     */
    private static _calculateRecoveryRate(): number {
        const total = this._errorStats.totalErrors;

        if (total === 0) return 0;
        return Math.round((this._errorStats.recoveredErrors / total) * 100);
    }
}