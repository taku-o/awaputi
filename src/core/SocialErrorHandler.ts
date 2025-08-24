/**
 * ソーシャル機能のエラーハンドリング強化 (Task 19)
 * 包括的なエラーハンドリング、復旧機能、デバッグ情報収集を行う
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

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
    browser?: string;
    os?: string;
    device?: string;
    screen?: {
        width: number;
        height: number;
        colorDepth: number;
        pixelRatio: number;
    };
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
            try {
                const errorHandler = getErrorHandler();
                if (errorHandler) {
                    errorHandler.handleError(error, component, { errorType, ...context });
                }
            } catch (e) {
                console.warn('[SocialErrorHandler] ErrorHandler転送に失敗:', e);
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
            // 品質を下げて再試行するフラグを設定
            if (context.screenshotOptions) {
                context.screenshotOptions.quality = 'low';
                context.screenshotOptions.maxWidth = Math.floor((context.screenshotOptions.maxWidth || 1200) * 0.7);
                context.screenshotOptions.maxHeight = Math.floor((context.screenshotOptions.maxHeight || 630) * 0.7);
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
            // 古いデータのクリーンアップを試行
            const cleaned = await this.cleanupOldData();
            return cleaned;
        } catch (cleanupError) {
            return false;
        }
    }
    
    /**
     * メモリエラーからの復旧
     */
    async recoverFromMemoryError(error: any, context: any): Promise<boolean> {
        try {
<<<<<<< HEAD
            // ガベージコレクションの強制実行（可能な場合）
            if ((window as any).gc) {
=======
            // ガベージコレクションのヒント
            if (typeof (window as any).gc === 'function') {
>>>>>>> feature/typescript-migration-st
                (window as any).gc();
            }
            
            // メモリ使用量の多そうなキャッシュをクリア
            if (context.clearCache && typeof context.clearCache === 'function') {
                context.clearCache();
            }
            
            return true;
        } catch (memoryError) {
            console.warn('[SocialErrorHandler] メモリエラー復旧失敗:', memoryError);
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
            // フォールバック方法の提案
            context.fallbackMethod = 'dialog';
            return true;
        } catch (recoveryError) {
            console.warn('[SocialErrorHandler] Web Share復旧失敗:', recoveryError);
        }
        return false;
    }
    
    /**
     * HTMLエスケープ
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * ユーザーへの通知
     */
    private notifyUser(errorInfo: ErrorInfo): void {
        const { category, type } = errorInfo;
        
        // 重要度に応じて通知方法を変更
        switch(category.severity) {
            case 'critical':
                this.showErrorModal(category.userMessage, errorInfo);
                break;

            case 'high':
                this.showErrorToast(category.userMessage, 'error', 5000);
                break;

            case 'medium':
                this.showErrorToast(category.userMessage, 'warning', 3000);
                break;

            case 'low':
                if (this.debugMode) {
                    console.warn(`[${type}] ${category.userMessage}`);
                }
                break;
        }
    }
    
    /**
     * エラーモーダルの表示
     */
    private showErrorModal(message: string, errorInfo: ErrorInfo): void {
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('social-error-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'social-error-modal';
        modal.className = 'social-error-modal';

        modal.innerHTML = `
            <div class="social-error-modal-content">
                <div class="social-error-icon">⚠️</div>
                <h3>エラーが発生しました</h3>
                <p>${this.escapeHtml(message)}</p>
                ${this.debugMode ? `
                    <details class="social-error-details">
                        <summary>詳細情報</summary>
                        <pre>${this.escapeHtml(JSON.stringify(errorInfo, null, 2))}</pre>
                    </details>
                ` : ''}
                <div class="social-error-actions">
                    <button class="social-error-btn-retry">再試行</button>
                    <button class="social-error-btn-close">閉じる</button>
                </div>
            </div>
        `;
        
        // スタイルの追加
        this.addErrorStyles();

        document.body.appendChild(modal);
        
        // イベントハンドラー
        const retryBtn = modal.querySelector('.social-error-btn-retry');
        const closeBtn = modal.querySelector('.social-error-btn-close');

        retryBtn?.addEventListener('click', () => {
            modal.remove();
            this.notifyCallbacks({ ...errorInfo, action: 'retry' });
        });

        closeBtn?.addEventListener('click', () => {
            modal.remove();
        });
    }
    
    /**
     * エラートーストの表示
     */
    showErrorToast(message: string, type: string = 'error', duration: number = 3000): void {
        // トーストコンテナの作成または取得
        let toastContainer = document.getElementById('social-error-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'social-error-toast-container';
            toastContainer.className = 'social-error-toast-container';
            document.body.appendChild(toastContainer);
            this.addErrorStyles();
        }

        const toast = document.createElement('div');
        toast.className = `social-error-toast social-error-toast-${type}`;

        toast.innerHTML = `
            <div class="social-error-toast-icon">
                ${type === 'error' ? '❌' : '⚠️'}
            </div>
            <div class="social-error-toast-message">
                ${this.escapeHtml(message)}
            </div>
            <button class="social-error-toast-close">×</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // アニメーション
        setTimeout(() => toast.classList.add('social-error-toast-show'), 10);
        
        // 自動削除
        const removeToast = () => {
            toast.classList.remove('social-error-toast-show');
            setTimeout(() => toast.remove(), 300);
        };

        const timeout = setTimeout(removeToast, duration);
        
        // 閉じるボタン
        const closeBtn = toast.querySelector('.social-error-toast-close');
        closeBtn?.addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast();
        });
    }
    
    /**
     * エラースタイルの追加
     */
    addErrorStyles(): void {
        if(document.getElementById('social-error-styles')) return;

        const style = document.createElement('style');
        style.id = 'social-error-styles';
        style.textContent = `
            /* エラーモーダル */
            .social-error-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .social-error-modal-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 450px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }
            
            .social-error-icon {
                font-size: 48px;
                text-align: center;
                margin-bottom: 16px;
            }
            
            .social-error-modal-content h3 {
                margin: 0 0 16px 0;
                text-align: center;
                color: #333;
            }
            
            .social-error-modal-content p {
                margin: 0 0 20px 0;
                text-align: center;
                color: #666;
                line-height: 1.5;
            }
            
            .social-error-details {
                margin: 20px 0;
                padding: 12px;
                background: #f5f5f5;
                border-radius: 8px;
            }
            
            .social-error-details summary {
                cursor: pointer;
                font-weight: bold;
                color: #666;
            }
            
            .social-error-details pre {
                margin: 12px 0 0 0;
                font-size: 12px;
                overflow-x: auto;
                color: #444;
            }
            
            .social-error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .social-error-btn-retry,
            .social-error-btn-close {
                padding: 10px 24px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .social-error-btn-retry {
                background: #007AFF;
                color: white;
            }
            
            .social-error-btn-retry:hover {
                background: #0051D5;
            }
            
            .social-error-btn-close {
                background: #E0E0E0;
                color: #333;
            }
            
            .social-error-btn-close:hover {
                background: #D0D0D0;
            }
            
            /* エラートースト */
            .social-error-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                pointer-events: none;
            }
            
            .social-error-toast {
                display: flex;
                align-items: center;
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                margin-bottom: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                max-width: 350px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                pointer-events: auto;
            }
            
            .social-error-toast-show {
                transform: translateX(0);
            }
            
            .social-error-toast-error {
                border-left: 4px solid #FF3B30;
            }
            
            .social-error-toast-warning {
                border-left: 4px solid #FF9500;
            }
            
            .social-error-toast-icon {
                font-size: 20px;
                margin-right: 12px;
            }
            
            .social-error-toast-message {
                flex: 1;
                color: #333;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .social-error-toast-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                margin-left: 12px;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .social-error-toast-close:hover {
                color: #666;
            }
            
            @keyframes fadeIn {
                from { opacity: 0 }
                to { opacity: 1 }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0 }
                to { transform: translateY(0); opacity: 1 }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * デバッグデータの収集
     */
    collectDebugData(errorType: string, error: any, context: any, requiredInfo: string[]): any {
        const debugData: any = {
            errorType,
            errorMessage: error?.message || 'Unknown error',
            errorStack: error?.stack || '',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            onLine: navigator.onLine,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            memory: this.getMemoryInfo()
        };
        
        // 必要な情報を収集
        requiredInfo.forEach(info => {
            if (context[info] !== undefined) {
                debugData[info] = context[info];
            }
        });
>>>>>>> feature/typescript-migration-st
        
        return debugData;
    }
    
    /**
     * スタックトレースの取得
     */
<<<<<<< HEAD
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
            onLine: navigator.onLine,
            browser: this.detectBrowser(),
            os: this.detectOS(),
            device: this.detectDevice(),
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelRatio: window.devicePixelRatio
            }
        };
    }
    
    /**
     * メモリ情報の取得
     */
    private getMemoryInfo(): any {
        if ((performance as any).memory) {
            return {
                usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB',
                totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1048576) + 'MB',
                jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576) + 'MB'
            };
        }
        return null;
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
     * ブラウザの検出
     */
    private detectBrowser(): string {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        return 'Unknown';
    }
    
    /**
     * OSの検出
     */
    private detectOS(): string {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    }
    
    /**
     * デバイスタイプの検出
     */
    private detectDevice(): string {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }
    
    /**
     * スタックトレースの取得
     */
    private getStackTrace(error: any): string {
        if (error?.stack) {
            return error.stack;
        }
        
        // エラーオブジェクトがない場合は新しいエラーからスタックトレースを取得
        try {
            throw new Error('Stack trace');
        } catch (e: any) {
            return e.stack || 'No stack trace available';
        }
    }
    
    /**
     * エラー履歴への追加
     */
<<<<<<< HEAD
    private addToHistory(errorInfo: ErrorInfo): void {
=======
    addToHistory(errorInfo: ErrorInfo): void {
>>>>>>> feature/typescript-migration-st
        this.errorHistory.unshift(errorInfo);
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }
    }
    
    /**
     * 統計の更新
     */
<<<<<<< HEAD
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
=======
    updateStatistics(errorType: string, component: string): void {
        this.errorStats.totalErrors++;
        
        // エラータイプ別カウント
        this.errorStats.errorsByType[errorType] = (this.errorStats.errorsByType[errorType] || 0) + 1;
        
        // コンポーネント別カウント
        this.errorStats.errorsByComponent[component] = (this.errorStats.errorsByComponent[component] || 0) + 1;
>>>>>>> feature/typescript-migration-st
    }
    
    /**
     * エラーログの記録
     */
    private logError(errorInfo: ErrorInfo): void {
        const logLevel = this.getLogLevel(errorInfo.category.severity);
        const logMessage = `[${errorInfo.component}] ${errorInfo.type}: ${errorInfo.error.message || errorInfo.error}`;
        
        (console as any)[logLevel](logMessage, errorInfo);
        
        // デバッグモードの場合は詳細を表示
        if (this.debugMode) {
            console.groupCollapsed(`Error Details: ${errorInfo.id}`);
            console.log('Error Info:', errorInfo);
            console.log('Debug Data:', errorInfo.debugData);
            console.log('Stack Trace:', errorInfo.stackTrace);
            console.groupEnd();
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
            case 'low':
            default:
                return 'log';
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
     * エラー情報のサニタイズ
     */
    private sanitizeError(error: any): any {
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }

        if (typeof error === 'string') {
            return { message: error };
        }
        
        return { message: String(error) };
    }
    
    /**
     * コンテキスト情報のサニタイズ
     */
    private sanitizeContext(context: any): any {
        try {
            // 循環参照を除去してJSONシリアライズ可能にする
            return JSON.parse(JSON.stringify(context));
        } catch (error) {
            return { error: 'Context serialization failed' };
        }
    }
    
    /**
     * エラー通知コールバックの登録
     */
<<<<<<< HEAD
    addErrorNotificationCallback(callback: ErrorNotificationCallback): void {
        this.errorNotificationCallbacks.add(callback);
=======
    sanitizeContext(context: any): any {
        try {
            // 循環参照を除去してJSONシリアライズ可能にする
            return JSON.parse(JSON.stringify(context));
        } catch (error) {
            return { error: 'Context serialization failed' };
        }
    }
    
    /**
     * HTMLエスケープ
     */
    escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * エラー通知コールバックの登録
     */
    addErrorCallback(callback: Function): void {
        if (typeof callback === 'function') {
            this.errorNotificationCallbacks.add(callback);
        }
>>>>>>> feature/typescript-migration-st
    }
    
    /**
     * エラー通知コールバックの削除
     */
<<<<<<< HEAD
    removeErrorNotificationCallback(callback: ErrorNotificationCallback): void {
=======
    removeErrorCallback(callback: Function): void {
>>>>>>> feature/typescript-migration-st
        this.errorNotificationCallbacks.delete(callback);
    }
    
    /**
<<<<<<< HEAD
     * デバッグモードの設定
     */
    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
=======
     * コールバックへの通知
     */
    notifyCallbacks(errorInfo: any): void {
        this.errorNotificationCallbacks.forEach(callback => {
            try {
                callback(errorInfo);
            } catch (error) {
                console.error('Error notification callback failed:', error);
            }
        });
    }
    
    /**
     * 古いデータのクリーンアップ
     */
    async cleanupOldData(): Promise<boolean> {
        try {
            // ローカルストレージの古いデータを削除
            const keys = Object.keys(localStorage);
            const oldDataKeys = keys.filter(key => {
                if (key.startsWith('social_') || key.startsWith('screenshot_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key) || '');
                        const age = Date.now() - (data.timestamp || 0);
                        return age > 7 * 24 * 60 * 60 * 1000; // 7日以上前
                    } catch (e) {
                        return true; // パースできないデータは削除
                    }
                }
                return false;
            });
            
            oldDataKeys.forEach(key => localStorage.removeItem(key));
            
            return oldDataKeys.length > 0;
        } catch (error) {
            console.error('Cleanup failed:', error);
            return false;
        }
    }
    
    /**
     * 未使用リソースの解放
     */
    releaseUnusedResources(): void {
        // 古いエラー履歴を削減
        if (this.errorHistory.length > 50) {
            this.errorHistory = this.errorHistory.slice(0, 50);
        }
        
        // 復旧試行カウントのリセット（古いものを削除）
        const now = Date.now();
        const entries = Array.from(this.recoveryAttempts.entries());
        for (const [key, value] of entries) {
            if (now - (value as any).timestamp > 60000) { // 1分以上前
                this.recoveryAttempts.delete(key);
            }
        }
    }
    
    /**
     * エラー履歴の取得
     */
<<<<<<< HEAD
    getErrorHistory(limit?: number): ErrorInfo[] {
        if (limit && limit > 0) {
            return this.errorHistory.slice(0, limit);
        }
        return [...this.errorHistory];
=======
    getErrorHistory(limit: number = 50): ErrorInfo[] {
        return this.errorHistory.slice(0, limit);
>>>>>>> feature/typescript-migration-st
    }
    
    /**
     * エラー統計の取得
     */
<<<<<<< HEAD
    getErrorStats(): ErrorStats {
        return { ...this.errorStats };
=======
    getErrorStatistics(): any {
        return {
            ...this.errorStats,
            recoveryRate: this.errorStats.totalErrors > 0
                ? (this.errorStats.recoveredErrors / this.errorStats.totalErrors) * 100
                : 0,
            topErrors: this.getTopErrors(),
            topComponents: this.getTopComponents()
        };
>>>>>>> feature/typescript-migration-st
    }
    
    /**
     * 復旧試行回数のリセット
     */
<<<<<<< HEAD
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
=======
    getTopErrors(limit: number = 5): Array<{type: string, count: number}> {
        return Object.entries(this.errorStats.errorsByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([type, count]) => ({ type, count }));
>>>>>>> feature/typescript-migration-st
    }
    
    /**
     * エラーハンドラーのクリーンアップ
     */
<<<<<<< HEAD
    destroy(): void {
=======
    getTopComponents(limit: number = 5): Array<{component: string, count: number}> {
        return Object.entries(this.errorStats.errorsByComponent)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([component, count]) => ({ component, count }));
    }
    
    /**
     * デバッグモードの切り替え
     */
    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
        console.log(`[SocialErrorHandler] デバッグモード: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * エラー履歴のクリア
     */
    clearErrorHistory(): void {
>>>>>>> feature/typescript-migration-st
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
        console.log('[SocialErrorHandler] エラー履歴をクリアしました');
    }
    
    /**
     * エラーレポートのエクスポート
     */
    exportErrorReport(): void {
        const report = {
            generated: new Date().toISOString(),
            statistics: this.getErrorStatistics(),
            recentErrors: this.getErrorHistory(20),
            environment: this.getEnvironmentInfo()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `social-error-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[SocialErrorHandler] エラーレポートをエクスポートしました');
    }
}

// シングルトンインスタンス
export const socialErrorHandler = new SocialErrorHandler();
>>>>>>> feature/typescript-migration-st
