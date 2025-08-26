/**
 * 分析用エラー通知システム
 * エラー発生時の即座の通知表示とコンテキスト情報収集機能を提供
 */

export class AnalyticsErrorNotificationSystem {
    private options: any;
    private errorHistory: any[];
    private errorTypes: Map<string, any>;
    private recoveryAttempts: Map<string, any>;
    private notificationContainer: HTMLElement | null;
    // private isInitialized: boolean;

    constructor(options: any = {}) {
        this.options = {
            enableErrorNotifications: true,
            enableErrorReporting: true,
            enableAutoRecovery: true,
            maxErrorHistory: 100,
            errorReportingEndpoint: null,
            enableContextCollection: true,
            enableStackTrace: true,
            enableUserFeedback: true,
            notificationTimeout: 8000, // 8秒
            criticalErrorTimeout: 15000, // 15秒
            ...options
        };

        this.errorHistory = [];
        this.errorTypes = new Map();
        this.recoveryAttempts = new Map();
        this.notificationContainer = null;
        this.isInitialized = false;

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.setupErrorTypes();
        this.createNotificationContainer();
        this.setupGlobalErrorHandlers();
        this.isInitialized = true;
    }

    /**
     * エラータイプの設定
     */
    setupErrorTypes() {
        this.errorTypes.set('javascript', {
            name: 'JavaScript エラー',
            icon: '💥',
            color: '#f44336',
            severity: 'error',
            recoverable: false,
            actions: ['詳細表示', 'レポート送信', '再読み込み']
        });

        this.errorTypes.set('network', {
            name: 'ネットワークエラー',
            icon: '🌐',
            color: '#ff9800',
            severity: 'warning',
            recoverable: true,
            actions: ['再試行', '詳細表示', 'オフラインモード']
        });

        this.errorTypes.set('resource', {
            name: 'リソースエラー',
            icon: '📁',
            color: '#2196f3',
            severity: 'warning',
            recoverable: true,
            actions: ['再読み込み', '詳細表示', 'キャッシュクリア']
        });

        this.errorTypes.set('permission', {
            name: '権限エラー',
            icon: '🔒',
            color: '#9c27b0',
            severity: 'warning',
            recoverable: false,
            actions: ['権限設定', '詳細表示', 'ヘルプ']
        });

        this.errorTypes.set('storage', {
            name: 'ストレージエラー',
            icon: '💾',
            color: '#607d8b',
            severity: 'error',
            recoverable: true,
            actions: ['ストレージクリア', '詳細表示', 'データエクスポート']
        });

        this.errorTypes.set('performance', {
            name: 'パフォーマンスエラー',
            icon: '⚡',
            color: '#ff5722',
            severity: 'warning',
            recoverable: true,
            actions: ['品質設定', '詳細表示', '最適化']
        });

        this.errorTypes.set('security', {
            name: 'セキュリティエラー',
            icon: '🛡️',
            color: '#d32f2f',
            severity: 'critical',
            recoverable: false,
            actions: ['詳細表示', 'レポート送信', 'セキュリティヘルプ']
        });
    }

    /**
     * 通知コンテナの作成
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'error-notification-container';
        this.notificationContainer.className = 'error-notification-container';

        Object.assign(this.notificationContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            maxWidth: '90vw',
            zIndex: '10002',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            pointerEvents: 'none'
        });

        document.body.appendChild(this.notificationContainer);
        this.applyNotificationStyles();
    }

    /**
     * 通知スタイルの適用
     */
    applyNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .error-notification-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .error-notification {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border-left: 4px solid;
                pointer-events: auto;
                transform: translateX(100%);
                animation: slideInError 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .error-notification.critical {
                animation: slideInError 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards,
                          pulseError 2s infinite 0.4s;
                box-shadow: 0 8px 32px rgba(255, 0, 0, 0.4);
            }
            .error-notification.dismissing {
                animation: slideOutError 0.3s ease-in forwards;
            }
            .error-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            .error-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: bold;
                color: white;
                font-size: 16px;
            }
            .error-icon {
                font-size: 20px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
            .error-severity {
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-transform: uppercase;
                font-weight: bold;
                letter-spacing: 0.5px;
            }
            .error-message {
                color: #e0e0e0;
                margin-bottom: 12px;
                line-height: 1.5;
                font-size: 14px;
            }
            .error-details {
                background: rgba(0, 0, 0, 0.3);
                padding: 12px;
                border-radius: 8px;
                font-size: 12px;
                color: #ccc;
                margin-bottom: 12px;
                font-family: 'Courier New', monospace;
                max-height: 100px;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .error-context {
                background: rgba(255, 255, 255, 0.05);
                padding: 8px;
                border-radius: 6px;
                font-size: 11px;
                color: #999;
                margin-bottom: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            .context-item {
                display: flex;
                justify-content: space-between;
            }
            .error-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 8px;
            }
            .error-action {
                background: rgba(255, 255, 255, 0.15);
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
                font-weight: 500;
            }
            .error-action:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-1px);
            }
            .error-action.primary {
                background: linear-gradient(135deg, #2196f3, #1976d2);
            }
            .error-action.danger {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }
            .error-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 20px;
                padding: 4px;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .error-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            .error-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
                transition: width 0.1s linear;
                border-radius: 0 0 12px 12px;
            }
            .error-timestamp {
                font-size: 10px;
                color: #666;
                text-align: right;
                margin-top: 4px;
            }
            .recovery-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                color: #4caf50;
                margin-top: 8px;
            }
            .recovery-spinner {
                width: 12px;
                height: 12px;
                border: 2px solid rgba(76, 175, 80, 0.3);
                border-top-color: #4caf50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes slideInError {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutError {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            @keyframes pulseError {
                0%, 100% {
                    box-shadow: 0 8px 32px rgba(255, 0, 0, 0.4);
                }
                50% {
                    box-shadow: 0 8px 32px rgba(255, 0, 0, 0.7);
                }
            }
            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * グローバルエラーハンドラーの設定
     */
    setupGlobalErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                error: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        window.addEventListener('error', (event) => {
            const target = event.target as any;
            if (target !== window && target?.tagName) {
                this.handleError({
                    type: 'resource',
                    message: `Failed to load ${target.tagName.toLowerCase()}: ${target.src || target.href}`,
                    element: target.tagName,
                    src: target.src || target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    /**
     * エラーの処理
     */
    handleError(errorData: any) {
        if (!this.options.enableErrorNotifications) return;

        const processedError = this.processError(errorData);
        this.recordError(processedError);
        this.showErrorNotification(processedError);

        // 自動復旧の試行
        if (this.options.enableAutoRecovery && this.canAttemptRecovery(processedError)) {
            this.attemptAutoRecovery(processedError);
        }

        // エラーレポート送信
        if (this.options.enableErrorReporting) {
            this.sendErrorReport(processedError);
        }

        // カスタムイベント発火
        this.dispatchErrorEvent(processedError);
    }

    /**
     * エラーの処理と拡張
     */
    processError(errorData: any) {
        const errorType = this.errorTypes.get(errorData.type) || this.errorTypes.get('javascript');
        
        const processedError = {
            id: this.generateErrorId(),
            timestamp: errorData.timestamp || Date.now(),
            type: errorData.type,
            severity: errorType.severity,
            message: errorData.message,
            details: this.extractErrorDetails(errorData),
            context: this.options.enableContextCollection ? this.collectContext() : null,
            stack: this.options.enableStackTrace ? errorData.stack : null,
            recoverable: errorType.recoverable,
            actions: errorType.actions,
            attempts: 0
        };

        return processedError;
    }

    /**
     * エラー詳細の抽出
     */
    extractErrorDetails(errorData: any) {
        const details: any = {};
        
        if (errorData.filename) details.filename = errorData.filename;
        if (errorData.lineno) details.line = errorData.lineno;
        if (errorData.colno) details.column = errorData.colno;
        if (errorData.element) details.element = errorData.element;
        if (errorData.src) details.source = errorData.src;
        if (errorData.error?.name) details.errorName = errorData.error.name;
        
        return details;
    }

    /**
     * コンテキスト情報の収集
     */
    collectContext() {
        try {
            return {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                online: navigator.onLine,
                memory: (performance as any).memory ? {
                    used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
                } : null,
                storage: this.getStorageInfo()
            };
        } catch (e) {
            return { error: 'Failed to collect context' };
        }
    }

    /**
     * ストレージ情報の取得
     */
    getStorageInfo() {
        try {
            const localStorage = {
                available: !!window.localStorage,
                quota: null,
                usage: null
            };

            if (navigator.storage && navigator.storage.estimate) {
                navigator.storage.estimate().then(estimate => {
                    localStorage.quota = Math.round((estimate.quota || 0) / 1024 / 1024) as any;
                    localStorage.usage = Math.round((estimate.usage || 0) / 1024 / 1024) as any;
                });
            }

            return localStorage;
        } catch (e) {
            return { error: 'Storage info unavailable' };
        }
    }

    /**
     * エラー記録
     */
    recordError(errorData: any) {
        this.errorHistory.unshift(errorData);
        
        // 履歴のトリミング
        if (this.errorHistory.length > this.options.maxErrorHistory) {
            this.errorHistory = this.errorHistory.slice(0, this.options.maxErrorHistory);
        }
    }

    /**
     * エラー通知の表示
     */
    showErrorNotification(errorData: any) {
        if (!this.notificationContainer) return;

        const errorType = this.errorTypes.get(errorData.type);
        const notification = document.createElement('div');
        notification.className = `error-notification ${errorData.severity}`;
        notification.dataset.errorId = errorData.id;
        notification.style.borderLeftColor = errorType.color;

        const timeout = errorData.severity === 'critical' ?
            this.options.criticalErrorTimeout : this.options.notificationTimeout;

        notification.innerHTML = `
            <div class="error-progress" style="width: 100%"></div>
            <div class="error-header">
                <div class="error-title">
                    <span class="error-icon">${errorType.icon}</span>
                    <span>${errorType.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="error-severity">${errorData.severity}</span>
                    <button class="error-close" onclick="window.errorNotificationSystem?.dismissError('${errorData.id}')">&times;</button>
                </div>
            </div>
            <div class="error-message">${errorData.message}</div>
            ${Object.keys(errorData.details).length > 0 ? `
                <div class="error-details">
                    ${this.formatErrorDetails(errorData.details)}
                </div>
            ` : ''}
            ${errorData.context ? `
                <div class="error-context">
                    <div class="context-item">
                        <span>URL:</span>
                        <span>${errorData.context.url?.split('/').pop() || 'Unknown'}</span>
                    </div>
                    <div class="context-item">
                        <span>Time:</span>
                        <span>${new Date(errorData.timestamp).toLocaleTimeString()}</span>
                    </div>
                    ${errorData.context.memory ? `
                        <div class="context-item">
                            <span>Memory:</span>
                            <span>${errorData.context.memory.used}MB</span>
                        </div>
                    ` : ''}
                    <div class="context-item">
                        <span>Online:</span>
                        <span>${errorData.context.online ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            ` : ''}
            <div class="error-actions">
                ${errorData.actions.map((action: string) => `
                    <button class="error-action ${action === '再読み込み' || action === 'レポート送信' ? 'primary' : ''}"
                            onclick="window.errorNotificationSystem?.handleErrorAction('${errorData.id}', '${action}')">
                        ${action}
                    </button>
                `).join('')}
            </div>
            <div id="recovery-status-${errorData.id}"></div>
            <div class="error-timestamp">
                ${new Date(errorData.timestamp).toLocaleString()}
            </div>
        `;

        // 進行状況バーのアニメーション
        const progressBar = notification.querySelector('.error-progress');
        let startTime = Date.now();
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.max(0, 100 - (elapsed / timeout) * 100);
            if (progressBar) (progressBar as any).style.width = `${progress}%`;
            
            if (progress > 0 && document.contains(notification)) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        requestAnimationFrame(updateProgress);

        this.notificationContainer.appendChild(notification);

        // 自動削除
        setTimeout(() => {
            if (document.contains(notification)) {
                this.dismissError(errorData.id);
            }
        }, timeout);
    }

    /**
     * エラー詳細のフォーマット
     */
    formatErrorDetails(details: any) {
        return Object.entries(details)
            .map(([key, value]) => `${key}: ${value}`)
            .join('<br>');
    }

    /**
     * 自動復旧の判定
     */
    canAttemptRecovery(errorData: any) {
        if (!errorData.recoverable) return false;
        
        const attempts = this.recoveryAttempts.get(errorData.type) || 0;
        return attempts < 3; // 最大3回まで
    }

    /**
     * 自動復旧の試行
     */
    async attemptAutoRecovery(errorData: any) {
        const attempts = (this.recoveryAttempts.get(errorData.type) || 0) + 1;
        this.recoveryAttempts.set(errorData.type, attempts);
        this.showRecoveryStatus(errorData.id, 'attempting');

        try {
            let recovered = false;

            switch(errorData.type) {
                case 'network':
                    recovered = await this.recoverFromNetworkError(errorData);
                    break;
                case 'resource':
                    recovered = await this.recoverFromResourceError(errorData);
                    break;
                case 'storage':
                    recovered = await this.recoverFromStorageError(errorData);
                    break;
                case 'performance':
                    recovered = await this.recoverFromPerformanceError(errorData);
                    break;
            }

            if (recovered) {
                this.showRecoveryStatus(errorData.id, 'success');
                // 成功時はカウンターをリセット
                this.recoveryAttempts.delete(errorData.type);
            } else {
                this.showRecoveryStatus(errorData.id, 'failed');
            }
        } catch (e) {
            this.showRecoveryStatus(errorData.id, 'failed');
        }
    }

    /**
     * 復旧状況の表示
     */
    showRecoveryStatus(errorId: any, status: any) {
        const statusElement = document.getElementById(`recovery-status-${errorId}`);
        if (!statusElement) return;

        const statusTexts = {
            attempting: '<div class="recovery-status"><div class="recovery-spinner"></div>復旧を試行中...</div>',
            success: '<div class="recovery-status">✅ 自動復旧に成功しました</div>',
            failed: '<div class="recovery-status" style="color: #f44336;">❌ 自動復旧に失敗しました</div>'
        };

        statusElement.innerHTML = (statusTexts as any)[status] || '';
    }

    /**
     * ネットワークエラーからの復旧
     */
    async recoverFromNetworkError(_errorData: any) {
        // 簡単な接続テスト
        try {
            const response = await fetch('/', { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    /**
     * リソースエラーからの復旧
     */
    async recoverFromResourceError(errorData: any) {
        // リソースの再読み込みを試行
        if (errorData.details.source) {
            try {
                const response = await fetch(errorData.details.source, { method: 'HEAD' });
                return response.ok;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    /**
     * ストレージエラーからの復旧
     */
    async recoverFromStorageError(_errorData: any) {
        try {
            // ストレージテスト
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * パフォーマンスエラーからの復旧
     */
    async recoverFromPerformanceError(_errorData: any) {
        // メモリクリーンアップの試行
        if (window.gc) {
            window.gc();
        }
        return true; // パフォーマンスエラーは一時的なことが多いので成功とする
    }

    /**
     * エラーレポートの送信
     */
    async sendErrorReport(errorData: any) {
        if (!this.options.errorReportingEndpoint) return;

        try {
            await fetch(this.options.errorReportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: errorData,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                })
            });
        } catch (e) {
            console.warn('Failed to send error report:', e);
        }
    }

    /**
     * エラーアクションの処理
     */
    handleErrorAction(errorId: any, action: any) {
        const errorData = this.errorHistory.find(e => e.id === errorId);
        if (!errorData) return;

        switch(action) {
            case '詳細表示':
                this.showErrorDetails(errorData);
                break;
            case 'レポート送信':
                this.sendErrorReport(errorData);
                this.showUserFeedback(errorId);
                break;
            case '再読み込み':
                window.location.reload();
                break;
            case '再試行':
                this.attemptAutoRecovery(errorData);
                break;
            case 'オフラインモード':
                (this as any).enableOfflineMode();
                break;
            case 'キャッシュクリア':
                (this as any).clearCache();
                break;
            case '権限設定':
                (this as any).showPermissionGuide();
                break;
            case 'ストレージクリア':
                (this as any).clearStorage();
                break;
            case 'データエクスポート':
                (this as any).exportUserData();
                break;
            case '品質設定':
                (this as any).showQualitySettings();
                break;
            case '最適化':
                (this as any).optimizePerformance();
                break;
            case 'ヘルプ':
                (this as any).showHelp(errorData.type);
                break;
            case 'セキュリティヘルプ':
                (this as any).showSecurityHelp();
                break;
        }
    }

    /**
     * エラー詳細の表示
     */
    showErrorDetails(errorData: any) {
        const details = [
            `エラーID: ${errorData.id}`,
            `タイプ: ${errorData.type}`,
            `重要度: ${errorData.severity}`,
            `時刻: ${new Date(errorData.timestamp).toLocaleString()}`,
            ''
        ];

        if (errorData.stack) {
            details.push('スタックトレース:');
            details.push(errorData.stack);
            details.push('');
        }

        if (errorData.context) {
            details.push('コンテキスト情報:');
            details.push(JSON.stringify(errorData.context, null, 2));
        }

        alert(details.join('\n'));
    }

    /**
     * ユーザーフィードバックの表示
     */
    showUserFeedback(errorId: any) {
        if (!this.options.enableUserFeedback) return;

        const feedback = prompt('このエラーについて追加情報があれば教えてください（オプション）:');
        if (feedback) {
            // フィードバックをエラーデータに追加
            const errorData = this.errorHistory.find(e => e.id === errorId);
            if (errorData) {
                errorData.userFeedback = feedback;
            }
        }
    }

    /**
     * エラーの削除
     */
    dismissError(errorId: any) {
        const notification = document.querySelector(`[data-error-id="${errorId}"]`);
        if (notification) {
            notification.classList.add('dismissing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * エラーID生成
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * カスタムイベント発火
     */
    dispatchErrorEvent(errorData: any) {
        const event = new CustomEvent('error-notification-displayed', {
            detail: errorData
        });
        window.dispatchEvent(event);
    }

    /**
     * エラー統計の取得
     */
    getErrorStatistics() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentErrors = this.errorHistory.filter(e => e.timestamp > oneHourAgo);

        const statistics = {
            totalErrors: this.errorHistory.length,
            recentErrors: recentErrors.length,
            errorsByType: {},
            errorsBySeverity: {},
            recoveryAttempts: Object.fromEntries(this.recoveryAttempts)
        };
        
        recentErrors.forEach(error => {
            (statistics.errorsByType as any)[error.type] = ((statistics.errorsByType as any)[error.type] || 0) + 1;
            (statistics.errorsBySeverity as any)[error.severity] = ((statistics.errorsBySeverity as any)[error.severity] || 0) + 1;
        });
        
        return statistics;
    }

    /**
     * 設定の更新
     */
    updateOptions(newOptions: any) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * リソースの解放
     */
    destroy() {
        if (this.notificationContainer) {
            this.notificationContainer.remove();
            this.notificationContainer = null;
        }
        
        // グローバル参照を削除
        if ((window as any).errorNotificationSystem === this) {
            delete (window as any).errorNotificationSystem;
        }

        this.errorHistory = [];
        this.recoveryAttempts.clear();
        console.log('ErrorNotificationSystem destroyed');
    }
}

// Export alias for backward compatibility
export { AnalyticsErrorNotificationSystem as ErrorNotificationSystem };

// グローバルアクセス用
(window as any).errorNotificationSystem = null;