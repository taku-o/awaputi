/**
 * エラー追跡システム
 * エラー発生時の詳細情報収集とコンテキスト保存機能
 */

export class ErrorTrackingSystem {
    constructor(options = {}) {
        this.options = {
            enableContextCapture: true,
            enableStackTrace: true,
            enableScreenshot: false, // パフォーマンス上の理由でデフォルトはfalse
            enableLocalStorage: true,
            maxErrors: 100,
            maxContextDepth: 3,
            contextCaptureTimeout: 1000, // コンテキスト収集のタイムアウト
            enableRecoveryTracking: true,
            enableUserActionTracking: true,
            errorCategories: ['javascript', 'network', 'rendering', 'game_logic', 'user_input'],
            ...options
        };

        this.errors = [];
        this.gameContext = null;
        this.userActions = [];
        this.sessionInfo = this.initializeSessionInfo();
        this.errorStats = this.initializeErrorStats();
        
        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        // JavaScript エラーハンドラー
        this.setupJavaScriptErrorHandling();
        
        // 未処理のPromise拒否ハンドラー
        this.setupUnhandledRejectionHandling();
        
        // ネットワークエラーハンドラー
        this.setupNetworkErrorHandling();
        
        // ユーザーアクション追跡
        if (this.options.enableUserActionTracking) {
            this.setupUserActionTracking();
        }
        
        // ゲームコンテキストの初期化
        this.initializeGameContext();

        console.log('Error tracking system initialized');
    }

    /**
     * セッション情報の初期化
     */
    initializeSessionInfo() {
        return {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            platform: navigator.platform,
            cookiesEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine
        };
    }

    /**
     * エラー統計の初期化
     */
    initializeErrorStats() {
        return {
            totalErrors: 0,
            errorsByCategory: {},
            errorsByType: {},
            recoverableErrors: 0,
            fatalErrors: 0,
            recentErrorRate: 0,
            averageRecoveryTime: 0
        };
    }

    /**
     * ゲームコンテキストの初期化
     */
    initializeGameContext() {
        this.gameContext = {
            currentScene: null,
            gameState: null,
            playerData: null,
            performanceMetrics: null,
            lastActions: [],
            memorySnapshot: null
        };
    }

    /**
     * JavaScript エラーハンドリングの設定
     */
    setupJavaScriptErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript_error',
                timestamp: Date.now()
            });
        });

        // カスタムエラーハンドラー（既存のErrorHandlerとの統合用）
        window.addEventListener('game-error', (event) => {
            this.handleGameError(event.detail);
        });
    }

    /**
     * 未処理のPromise拒否ハンドリングの設定
     */
    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection({
                reason: event.reason,
                promise: event.promise,
                type: 'unhandled_promise_rejection',
                timestamp: Date.now()
            });
        });
    }

    /**
     * ネットワークエラーハンドリングの設定
     */
    setupNetworkErrorHandling() {
        // XMLHttpRequest のエラー監視
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._errorTracker = {
                method: method,
                url: url,
                startTime: Date.now()
            };
            return originalXHROpen.apply(this, [method, url, ...args]);
        };

        XMLHttpRequest.prototype.send = function(data) {
            const xhr = this;
            
            xhr.addEventListener('error', () => {
                if (xhr._errorTracker) {
                    window.errorTrackingSystem?.handleNetworkError({
                        method: xhr._errorTracker.method,
                        url: xhr._errorTracker.url,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        duration: Date.now() - xhr._errorTracker.startTime,
                        type: 'network_error',
                        timestamp: Date.now()
                    });
                }
            });

            xhr.addEventListener('timeout', () => {
                if (xhr._errorTracker) {
                    window.errorTrackingSystem?.handleNetworkError({
                        method: xhr._errorTracker.method,
                        url: xhr._errorTracker.url,
                        status: xhr.status,
                        statusText: 'Timeout',
                        duration: Date.now() - xhr._errorTracker.startTime,
                        type: 'network_timeout',
                        timestamp: Date.now()
                    });
                }
            });

            return originalXHRSend.apply(this, [data]);
        };

        // Fetch API のエラー監視
        if (window.fetch) {
            const originalFetch = window.fetch;
            window.fetch = function(url, options = {}) {
                const startTime = Date.now();
                
                return originalFetch(url, options)
                    .catch(error => {
                        window.errorTrackingSystem?.handleNetworkError({
                            method: options.method || 'GET',
                            url: url,
                            error: error.message,
                            duration: Date.now() - startTime,
                            type: 'fetch_error',
                            timestamp: Date.now()
                        });
                        throw error;
                    });
            };
        }

        // グローバル参照を設定
        window.errorTrackingSystem = this;
    }

    /**
     * ユーザーアクション追跡の設定
     */
    setupUserActionTracking() {
        const trackAction = (actionType, event) => {
            this.recordUserAction({
                type: actionType,
                timestamp: Date.now(),
                target: event.target ? {
                    tagName: event.target.tagName,
                    id: event.target.id,
                    className: event.target.className,
                    textContent: event.target.textContent?.substring(0, 50)
                } : null,
                coordinates: event.clientX !== undefined ? {
                    x: event.clientX,
                    y: event.clientY
                } : null
            });
        };

        // 主要なユーザーアクション
        document.addEventListener('click', (e) => trackAction('click', e));
        document.addEventListener('keydown', (e) => trackAction('keydown', e));
        document.addEventListener('touchstart', (e) => trackAction('touchstart', e));
        
        // ページナビゲーション
        window.addEventListener('beforeunload', () => {
            this.recordUserAction({
                type: 'page_unload',
                timestamp: Date.now()
            });
        });
    }

    /**
     * JavaScriptエラーの処理
     */
    handleJavaScriptError(errorData) {
        const errorInfo = {
            ...errorData,
            category: 'javascript',
            severity: this.determineErrorSeverity(errorData),
            context: this.captureErrorContext(),
            userActions: this.getRecentUserActions(),
            gameState: this.captureGameState(),
            recovery: {
                attempted: false,
                successful: false,
                recoveryTime: null
            }
        };

        this.recordError(errorInfo);
        
        // 自動復旧を試行
        if (this.options.enableRecoveryTracking) {
            this.attemptErrorRecovery(errorInfo);
        }
    }

    /**
     * ゲームエラーの処理
     */
    handleGameError(errorData) {
        const errorInfo = {
            ...errorData,
            category: 'game_logic',
            severity: errorData.severity || 'error',
            context: this.captureErrorContext(),
            userActions: this.getRecentUserActions(),
            gameState: this.captureGameState(),
            timestamp: Date.now(),
            recovery: {
                attempted: false,
                successful: false,
                recoveryTime: null
            }
        };

        this.recordError(errorInfo);
    }

    /**
     * Promise拒否の処理
     */
    handlePromiseRejection(rejectionData) {
        const errorInfo = {
            message: rejectionData.reason?.message || rejectionData.reason,
            stack: rejectionData.reason?.stack,
            type: 'unhandled_promise_rejection',
            category: 'javascript',
            severity: 'warning',
            context: this.captureErrorContext(),
            userActions: this.getRecentUserActions(),
            gameState: this.captureGameState(),
            timestamp: rejectionData.timestamp,
            recovery: {
                attempted: false,
                successful: false,
                recoveryTime: null
            }
        };

        this.recordError(errorInfo);
    }

    /**
     * ネットワークエラーの処理
     */
    handleNetworkError(errorData) {
        const errorInfo = {
            ...errorData,
            category: 'network',
            severity: this.determineNetworkErrorSeverity(errorData),
            context: this.captureErrorContext(),
            userActions: this.getRecentUserActions(),
            gameState: this.captureGameState(),
            recovery: {
                attempted: false,
                successful: false,
                recoveryTime: null
            }
        };

        this.recordError(errorInfo);
    }

    /**
     * エラーの記録
     */
    recordError(errorInfo) {
        errorInfo.id = this.generateErrorId();
        errorInfo.sessionInfo = this.sessionInfo;

        this.errors.unshift(errorInfo);
        this.trimErrors();
        
        // 統計の更新
        this.updateErrorStats(errorInfo);

        // ローカルストレージに保存
        if (this.options.enableLocalStorage) {
            this.saveToLocalStorage();
        }

        // エラーイベントを発火
        this.dispatchErrorEvent(errorInfo);

        console.error(`[Error Tracked] ${errorInfo.category}:${errorInfo.type}`, errorInfo);
    }

    /**
     * ユーザーアクションの記録
     */
    recordUserAction(action) {
        this.userActions.unshift(action);
        
        // 最新100アクションのみ保持
        if (this.userActions.length > 100) {
            this.userActions = this.userActions.slice(0, 100);
        }
    }

    /**
     * エラーコンテキストの収集
     */
    captureErrorContext() {
        const context = {
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: null,
            performance: null
        };

        // メモリ情報
        if (performance.memory) {
            context.memory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }

        // パフォーマンス情報
        context.performance = {
            timeOrigin: performance.timeOrigin,
            now: performance.now(),
            navigation: performance.navigation ? {
                type: performance.navigation.type,
                redirectCount: performance.navigation.redirectCount
            } : null
        };

        // DOM情報
        try {
            context.dom = {
                activeElement: document.activeElement ? {
                    tagName: document.activeElement.tagName,
                    id: document.activeElement.id,
                    className: document.activeElement.className
                } : null,
                visibilityState: document.visibilityState,
                readyState: document.readyState
            };
        } catch (error) {
            console.warn('Failed to capture DOM context:', error);
        }

        return context;
    }

    /**
     * ゲーム状態の収集
     */
    captureGameState() {
        const gameState = {
            timestamp: Date.now()
        };

        try {
            // グローバルなゲーム状態の収集
            if (window.gameEngine) {
                gameState.currentScene = window.gameEngine.sceneManager?.getCurrentScene?.()?.constructor?.name;
                gameState.gameStatus = window.gameEngine.isRunning ? 'running' : 'stopped';
            }

            if (window.playerData) {
                gameState.playerData = {
                    currentHP: window.playerData.currentHP,
                    score: window.playerData.score,
                    level: window.playerData.level
                };
            }

            // 統計情報
            if (window.statisticsManager) {
                const stats = window.statisticsManager.getCurrentStats?.();
                if (stats) {
                    gameState.statistics = {
                        totalGamesPlayed: stats.totalGamesPlayed,
                        averageScore: stats.averageScore,
                        currentFPS: stats.currentFPS
                    };
                }
            }

        } catch (error) {
            console.warn('Failed to capture game state:', error);
            gameState.captureError = error.message;
        }

        return gameState;
    }

    /**
     * 最近のユーザーアクションの取得
     */
    getRecentUserActions(count = 10) {
        return this.userActions.slice(0, count);
    }

    /**
     * エラーの重要度判定
     */
    determineErrorSeverity(errorData) {
        if (errorData.message) {
            const message = errorData.message.toLowerCase();
            
            // 致命的エラー
            if (message.includes('out of memory') || 
                message.includes('maximum call stack') ||
                message.includes('cannot read prop')) {
                return 'fatal';
            }
            
            // 重要なエラー
            if (message.includes('undefined') || 
                message.includes('null') ||
                message.includes('not a function')) {
                return 'error';
            }
            
            // 警告レベル
            return 'warning';
        }
        
        return 'error';
    }

    /**
     * ネットワークエラーの重要度判定
     */
    determineNetworkErrorSeverity(errorData) {
        if (errorData.status) {
            if (errorData.status >= 500) return 'error';
            if (errorData.status >= 400) return 'warning';
        }
        
        if (errorData.type === 'network_timeout') return 'warning';
        
        return 'error';
    }

    /**
     * エラー復旧の試行
     */
    attemptErrorRecovery(errorInfo) {
        const startTime = Date.now();
        errorInfo.recovery.attempted = true;

        try {
            // エラータイプ別の復旧戦略
            const recoveryStrategy = this.getRecoveryStrategy(errorInfo);
            
            if (recoveryStrategy) {
                const result = recoveryStrategy(errorInfo);
                
                if (result && result.success) {
                    errorInfo.recovery.successful = true;
                    errorInfo.recovery.recoveryTime = Date.now() - startTime;
                    errorInfo.recovery.method = result.method;
                    
                    this.errorStats.recoverableErrors++;
                    console.log(`Error recovery successful: ${result.method}`);
                } else {
                    this.errorStats.fatalErrors++;
                }
            }
            
        } catch (recoveryError) {
            console.error('Error recovery failed:', recoveryError);
            errorInfo.recovery.recoveryError = recoveryError.message;
        }
    }

    /**
     * 復旧戦略の取得
     */
    getRecoveryStrategy(errorInfo) {
        const strategies = {
            'reference_error': this.recoverFromReferenceError.bind(this),
            'type_error': this.recoverFromTypeError.bind(this),
            'network_error': this.recoverFromNetworkError.bind(this),
            'out_of_memory': this.recoverFromMemoryError.bind(this)
        };

        // エラーメッセージから戦略を選択
        const message = errorInfo.message?.toLowerCase() || '';
        
        if (message.includes('is not defined')) {
            return strategies.reference_error;
        } else if (message.includes('is not a function')) {
            return strategies.type_error;
        } else if (errorInfo.category === 'network') {
            return strategies.network_error;
        } else if (message.includes('out of memory')) {
            return strategies.out_of_memory;
        }

        return null;
    }

    /**
     * 参照エラーからの復旧
     */
    recoverFromReferenceError(errorInfo) {
        // 基本的な参照エラーの復旧を試行
        return { success: false, method: 'reference_fallback' };
    }

    /**
     * 型エラーからの復旧
     */
    recoverFromTypeError(errorInfo) {
        // 型エラーの復旧を試行
        return { success: false, method: 'type_fallback' };
    }

    /**
     * ネットワークエラーからの復旧
     */
    recoverFromNetworkError(errorInfo) {
        // ネットワークエラーの場合は再試行
        return { success: false, method: 'network_retry' };
    }

    /**
     * メモリエラーからの復旧
     */
    recoverFromMemoryError(errorInfo) {
        // メモリクリーンアップを試行
        if (typeof window.gc === 'function') {
            window.gc();
            return { success: true, method: 'garbage_collection' };
        }
        return { success: false, method: 'memory_cleanup_unavailable' };
    }

    /**
     * エラー統計の更新
     */
    updateErrorStats(errorInfo) {
        this.errorStats.totalErrors++;
        
        // カテゴリ別統計
        if (!this.errorStats.errorsByCategory[errorInfo.category]) {
            this.errorStats.errorsByCategory[errorInfo.category] = 0;
        }
        this.errorStats.errorsByCategory[errorInfo.category]++;
        
        // タイプ別統計
        if (!this.errorStats.errorsByType[errorInfo.type]) {
            this.errorStats.errorsByType[errorInfo.type] = 0;
        }
        this.errorStats.errorsByType[errorInfo.type]++;

        // エラー率の計算（過去1分間）
        const oneMinuteAgo = Date.now() - 60000;
        const recentErrors = this.errors.filter(error => error.timestamp > oneMinuteAgo);
        this.errorStats.recentErrorRate = recentErrors.length;
    }

    /**
     * エラーの配列をトリミング
     */
    trimErrors() {
        if (this.errors.length > this.options.maxErrors) {
            this.errors = this.errors.slice(0, this.options.maxErrors);
        }
    }

    /**
     * ローカルストレージへの保存
     */
    saveToLocalStorage() {
        try {
            const data = {
                errors: this.errors.slice(0, 20), // 最新20件のみ保存
                stats: this.errorStats,
                sessionInfo: this.sessionInfo,
                timestamp: Date.now()
            };
            
            localStorage.setItem('bubblePop_errorTracking', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save error tracking data to localStorage:', error);
        }
    }

    /**
     * ローカルストレージからの読み込み
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('bubblePop_errorTracking');
            if (data) {
                const parsed = JSON.parse(data);
                
                // 24時間以内のデータのみ復元
                const oneDayAgo = Date.now() - 86400000;
                if (parsed.timestamp > oneDayAgo) {
                    this.errors = parsed.errors || [];
                    this.errorStats = { ...this.errorStats, ...parsed.stats };
                }
            }
        } catch (error) {
            console.warn('Failed to load error tracking data from localStorage:', error);
        }
    }

    /**
     * エラーイベントの発火
     */
    dispatchErrorEvent(errorInfo) {
        const errorEvent = new CustomEvent('error-tracked', {
            detail: errorInfo
        });
        window.dispatchEvent(errorEvent);
    }

    /**
     * エラー履歴の取得
     */
    getErrorHistory(filter = {}) {
        let errors = [...this.errors];

        // フィルタリング
        if (filter.category) {
            errors = errors.filter(error => error.category === filter.category);
        }
        if (filter.severity) {
            errors = errors.filter(error => error.severity === filter.severity);
        }
        if (filter.startTime) {
            errors = errors.filter(error => error.timestamp >= filter.startTime);
        }
        if (filter.endTime) {
            errors = errors.filter(error => error.timestamp <= filter.endTime);
        }

        return errors;
    }

    /**
     * エラー統計の取得
     */
    getErrorStatistics() {
        const uptime = Date.now() - this.sessionInfo.startTime;
        
        return {
            ...this.errorStats,
            uptime: uptime,
            averageErrorRate: this.errorStats.totalErrors > 0 ? 
                (this.errorStats.totalErrors / (uptime / 60000)) : 0, // errors per minute
            sessionInfo: this.sessionInfo,
            recoveryRate: this.errorStats.totalErrors > 0 ? 
                (this.errorStats.recoverableErrors / this.errorStats.totalErrors) * 100 : 0
        };
    }

    /**
     * エラーレポートの生成
     */
    generateErrorReport(format = 'json') {
        const report = {
            summary: this.getErrorStatistics(),
            recentErrors: this.errors.slice(0, 10),
            topErrorsByCategory: this.getTopErrorsByCategory(),
            topErrorsByType: this.getTopErrorsByType(),
            timeline: this.generateErrorTimeline(),
            generatedAt: Date.now()
        };

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'csv':
                return this.convertReportToCSV(report);
            default:
                return report;
        }
    }

    /**
     * カテゴリ別トップエラーの取得
     */
    getTopErrorsByCategory() {
        return Object.entries(this.errorStats.errorsByCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    }

    /**
     * タイプ別トップエラーの取得
     */
    getTopErrorsByType() {
        return Object.entries(this.errorStats.errorsByType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }

    /**
     * エラータイムラインの生成
     */
    generateErrorTimeline() {
        const timeline = [];
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        for (let i = 0; i < 24; i++) {
            const hourStart = now - (i * oneHour);
            const hourEnd = hourStart + oneHour;
            
            const errorsInHour = this.errors.filter(error => 
                error.timestamp >= hourStart && error.timestamp < hourEnd);
            
            timeline.unshift({
                hour: new Date(hourStart).getHours(),
                errorCount: errorsInHour.length,
                errorTypes: [...new Set(errorsInHour.map(e => e.type))]
            });
        }

        return timeline;
    }

    /**
     * レポートのCSV変換
     */
    convertReportToCSV(report) {
        let csv = 'Type,Category,Severity,Message,Timestamp,Recovered\n';
        
        report.recentErrors.forEach(error => {
            csv += `${error.type},${error.category},${error.severity},"${error.message}",${error.timestamp},${error.recovery.successful}\n`;
        });

        return csv;
    }

    /**
     * エラーIDの生成
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }

    /**
     * セッションIDの生成
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * データのクリア
     */
    clearErrors() {
        this.errors = [];
        this.userActions = [];
        this.errorStats = this.initializeErrorStats();
        
        if (this.options.enableLocalStorage) {
            localStorage.removeItem('bubblePop_errorTracking');
        }
        
        console.log('Error tracking data cleared');
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.clearErrors();
        
        // グローバル参照を削除
        if (window.errorTrackingSystem === this) {
            delete window.errorTrackingSystem;
        }
        
        console.log('Error tracking system destroyed');
    }
}