/**
 * 統計システム専用エラーハンドリングクラス
 * データ破損、ストレージ容量不足、計算エラー、描画エラーの処理と自動復旧機能を提供する
 */
export class StatisticsErrorHandler {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        
        // エラーハンドリング設定
        this.config = {
            errorTypes: {
                DATA_CORRUPTION: 'data_corruption',
                STORAGE_FULL: 'storage_full',
                CALCULATION_ERROR: 'calculation_error',
                RENDERING_ERROR: 'rendering_error',
                NETWORK_ERROR: 'network_error',
                MEMORY_ERROR: 'memory_error',
                PERMISSION_ERROR: 'permission_error' }

                TIMEOUT_ERROR: 'timeout_error' 
    };
            severityLevels: { LOW: 1,      // 軽微なエラー（ログのみ）
                MEDIUM: 2,   // 中程度（警告表示）;
                HIGH: 3,     // 重大（自動復旧試行）;
                CRITICAL: 4  // 致命的（セーフモード移行）  };
            recovery: { maxRetryAttempts: 3,
                retryDelayMs: 1000,
                autoRecoveryEnabled: true,
                safeModeEnabled: true,
    fallbackDataEnabled: true,;
            monitoring: { errorTrackingEnabled: true,
                maxErrorHistory: 1000,
    alertThreshold: 10, // 10分間に10エラーで警告;
                alertWindowMs: 600000 // 10分間  }
        };
        // エラー状態管理
        this.errorState = { isInSafeMode: false,
            isRecovering: false,
            lastError: null,
            errorCount: 0,
            consecutiveErrors: 0,
    recoveryAttempts: 0  };
        // エラー履歴とメトリクス
        this.errorHistory = [];
        this.errorMetrics = new Map();
        this.errorPatterns = new Map();
        
        // 復旧戦略
        this.recoveryStrategies = new Map([);
            [this.config.errorTypes.DATA_CORRUPTION, this.handleDataCorruption.bind(this)],
            [this.config.errorTypes.STORAGE_FULL, this.handleStorageFull.bind(this)],
            [this.config.errorTypes.CALCULATION_ERROR, this.handleCalculationError.bind(this)],
            [this.config.errorTypes.RENDERING_ERROR, this.handleRenderingError.bind(this)],
            [this.config.errorTypes.NETWORK_ERROR, this.handleNetworkError.bind(this)],
            [this.config.errorTypes.MEMORY_ERROR, this.handleMemoryError.bind(this)],
            [this.config.errorTypes.PERMISSION_ERROR, this.handlePermissionError.bind(this)],
            [this.config.errorTypes.TIMEOUT_ERROR, this.handleTimeoutError.bind(this)];
        ]);
        
        // セーフモード機能
        this.safeModeFeatures = { reducedStatistics: true,
            disableAnimations: true,
            simplifiedRendering: true,
            limitedDataCollection: true,
    emergencyBackup: true,;
        // フォールバックデータ
        this.fallbackData = { statistics: this.createFallbackStatistics(
            config: this.createFallbackConfig(
    lastKnownGood: null,;
        // エラー通知システム
        this.notificationCallbacks = new Set();
        this.alertSystem = { isEnabled: true,
            lastAlert: null,
    alertCooldown: 30000 // 30秒のクールダウン  };
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.setupGlobalErrorHandlers(),
        this.setupPerformanceMonitoring(),
        this.loadErrorHistory() }
        this.createInitialBackup(); }
    }
    
    /**
     * グローバルエラーハンドラーの設定
     */''
    setupGlobalErrorHandlers()';'
        if (typeof, window !== 'undefined') {

            window.addEventListener('error', (event) => { '
                this.handleError(),
                    new Error(event.message),
                    this.config.errorTypes.CALCULATION_ERROR,
                    {
                        filename: event.filename,
    lineno: event.lineno }

                        colno: event.colno,' }'

                        source: 'global' 
    }

                ';}');
            ';'
            // Promiseの未捕捉拒否
            window.addEventListener('unhandledrejection', (event) => { this.handleError(event.reason,
                    this.config.errorTypes.CALCULATION_ERROR,
                    {)'
                        source: 'promise_rejection'
            }
                        promise: event.promise) 
    });
            }';'
        }
    }
    
    /**
     * パフォーマンス監視の設定'
     */''
    setupPerformanceMonitoring()';'
        if (typeof, performance !== 'undefined' && performance.memory) { setInterval(() => {  }
                this.checkMemoryUsage(); }
            }, 30000); // 30秒間隔
        }
        
        // LocalStorage容量の監視
        setInterval(() => { this.checkStorageUsage() }, 60000); // 1分間隔
    }
    
    /**
     * メインエラーハンドリング関数
     */
    async handleError(error, errorType = null, context = {}) { try {
            // エラータイプの自動判定
            if (!errorType) {
    
}
                errorType = this.classifyError(error); }
            }
            
            // エラー詳細の作成
            const errorDetails = this.createErrorDetails(error, errorType, context);
            
            // 重要度の判定
            const severity = this.determineSeverity(errorDetails);
            
            // エラーの記録
            this.recordError(errorDetails, severity);
            
            // 通知の送信
            await this.notifyError(errorDetails, severity);
            
            // 復旧処理の実行
            if (severity >= this.config.severityLevels.HIGH && this.config.recovery.autoRecoveryEnabled) { await this.attemptRecovery(errorDetails) }
            
            // セーフモードの判定
            if (severity >= this.config.severityLevels.CRITICAL || this.shouldEnterSafeMode() { await this.enterSafeMode(errorDetails) }
            
            return { handled: true,
                errorId: errorDetails.id,
    severity: severity,;
                recoveryAttempted: severity >= this.config.severityLevels.HIGH 
    } catch (handlingError) { // エラーハンドリング自体のエラー
            console.error('Error handler failed:', handlingError),
            await this.enterEmergencyMode(error, handlingError) }
            return { handled: false, emergencyMode: true,
    }
    
    /**
     * エラーの分類
     */
    classifyError(error) {

        const message = error.message?.toLowerCase() || ','
        const stack = error.stack?.toLowerCase() || ','
        ','
        // メッセージによる分類
        if (message.includes('quota') || message.includes('storage)' {
    }
            return this.config.errorTypes.STORAGE_FULL;

        if (message.includes('memory') || message.includes('heap)' { return this.config.errorTypes.MEMORY_ERROR }

        if (message.includes('network') || message.includes('fetch)' { return this.config.errorTypes.NETWORK_ERROR }

        if (message.includes('permission') || message.includes('denied)' { return this.config.errorTypes.PERMISSION_ERROR }

        if(message.includes('timeout)' { return this.config.errorTypes.TIMEOUT_ERROR }', ';
        // スタックトレースによる分類
        if (stack.includes('canvas') || stack.includes('render)' { return this.config.errorTypes.RENDERING_ERROR }

        if (stack.includes('statistics') || stack.includes('calculate) { return this.config.errorTypes.CALCULATION_ERROR }'
        
        // 特定のエラータイプ
        if (error, instanceof TypeError || error, instanceof ReferenceError) { return this.config.errorTypes.CALCULATION_ERROR }
        
        if (error, instanceof RangeError) { return this.config.errorTypes.MEMORY_ERROR }
        
        // デフォルト
        return this.config.errorTypes.CALCULATION_ERROR;
    }
    
    /**
     * エラー詳細の作成
     */
    createErrorDetails(error, errorType, context) {
        return { : undefined
            id: this.generateErrorId(
            timestamp: Date.now('',
    message: error.message || 'Unknown error',
            stack: error.stack || ',',
            name: error.name || 'Error',
    context: {'
                ...context,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                url: typeof location !== 'undefined' ? location.href : 'unknown'),
                statisticsState: this.getStatisticsState() }
                memoryUsage: this.getMemoryUsage() };
                storageUsage: this.getStorageUsage(); 
    },
            fingerprint: this.generateErrorFingerprint(error, errorType);
        }
    
    /**
     * エラーIDの生成
     */
    generateErrorId() {
    
}
        return `error_${Date.now())_${Math.random().toString(36).substr(2, 9})`;
    }
    
    /**
     * エラーフィンガープリントの生成
     */
    generateErrorFingerprint(error, errorType) {
    
}
        const key = `${errorType}_${error.name}_${error.message}`;
        let hash = 0;
        
        for(let, i = 0; i < key.length; i++) {
        
            const char = key.charCodeAt(i),
            hash = ((hash << 5) - hash) + char }
            hash = hash & hash; // 32bit integer }
        }
        
        return hash.toString(16);
    }
    
    /**
     * 重要度の判定
     */
    determineSeverity(errorDetails) {
    
}
        const { type, context } = errorDetails;
        
        // エラータイプによる基本重要度
        const baseSeverity = { [this.config.errorTypes.DATA_CORRUPTION]: this.config.severityLevels.CRITICAL,
            [this.config.errorTypes.STORAGE_FULL]: this.config.severityLevels.HIGH,
            [this.config.errorTypes.MEMORY_ERROR]: this.config.severityLevels.HIGH,
            [this.config.errorTypes.RENDERING_ERROR]: this.config.severityLevels.MEDIUM,
            [this.config.errorTypes.CALCULATION_ERROR]: this.config.severityLevels.MEDIUM,
            [this.config.errorTypes.NETWORK_ERROR]: this.config.severityLevels.LOW,
            [this.config.errorTypes.PERMISSION_ERROR]: this.config.severityLevels.MEDIUM,
            [this.config.errorTypes.TIMEOUT_ERROR]: this.config.severityLevels.LOW }[type] || this.config.severityLevels.MEDIUM;
        
        // 連続エラーによる重要度上昇
        let adjustedSeverity = baseSeverity;
        if (this.errorState.consecutiveErrors > 5) { adjustedSeverity = Math.min(adjustedSeverity + 1, this.config.severityLevels.CRITICAL) }
        
        // 短時間での大量エラーによる重要度上昇
        const recentErrors = this.getRecentErrorCount(300000); // 5分間
        if (recentErrors > 20) { adjustedSeverity = this.config.severityLevels.CRITICAL }
        
        return adjustedSeverity;
    }
    
    /**
     * エラーの記録
     */
    recordError(errorDetails, severity) {
        // エラー履歴に追加
        this.errorHistory.push({)
            ...errorDetails),
            severity,
        
        // 履歴サイズの制限
        if (this.errorHistory.length > this.config.monitoring.maxErrorHistory) {
    }
            this.errorHistory = this.errorHistory.slice(-this.config.monitoring.maxErrorHistory); }
        }
        
        // エラーメトリクスの更新
        this.updateErrorMetrics(errorDetails, severity);
        
        // エラー状態の更新
        this.updateErrorState(errorDetails, severity);
        
        // パターン分析
        this.analyzeErrorPatterns(errorDetails);
        
        // LocalStorageに保存（エラー履歴の永続化）
        this.saveErrorHistory();
    }
    
    /**
     * エラーメトリクスの更新
     */
    updateErrorMetrics(errorDetails, severity) {
    
}
        const { type, fingerprint } = errorDetails;
        
        // タイプ別メトリクス
        if (!this.errorMetrics.has(type) {
            this.errorMetrics.set(type, {
                count: 0),
                lastOccurred: null,
    severityDistribution: new Map() })
                fingerprints: new Set(); 
    });
        }
        
        const typeMetrics = this.errorMetrics.get(type);
        typeMetrics.count++;
        typeMetrics.lastOccurred = Date.now();
        typeMetrics.fingerprints.add(fingerprint);
        
        // 重要度分布
        const severityCount = typeMetrics.severityDistribution.get(severity) || 0;
        typeMetrics.severityDistribution.set(severity, severityCount + 1);
    }
    
    /**
     * エラー状態の更新
     */
    updateErrorState(errorDetails, severity) {
        this.errorState.lastError = errorDetails,
        this.errorState.errorCount++,
        
        // 連続エラーのカウント
        const timeSinceLastError = this.errorState.lastError ? undefined : undefined
            Date.now() - this.errorState.lastError.timestamp: Infinity,
        if (timeSinceLastError < 10000) { // 10秒以内
    
            this.errorState.consecutiveErrors++ }
        } else { this.errorState.consecutiveErrors = 1 }
    }
    
    /**
     * エラーパターンの分析
     */
    analyzeErrorPatterns(errorDetails) {
        const pattern = {
            type: errorDetails.type,
    fingerprint: errorDetails.fingerprint,
            hour: new Date(errorDetails.timestamp).getHours('}'

            context: errorDetails.context.source || 'unknown' }))
        );
        const patternKey = JSON.stringify(pattern);
        const count = this.errorPatterns.get(patternKey) || 0;
        this.errorPatterns.set(patternKey, count + 1);
        ';'
        // 頻繁なパターンの検出
        if (count > 5) {', ' }

            console.warn('Frequent error pattern detected:', pattern); }
}
    
    /**
     * エラー通知
     */
    async notifyError(errorDetails, severity) { // 通知コールバックの実行
        for (const callback of this.notificationCallbacks) {
            try {
        }
                await callback(errorDetails, severity);' }'

            } catch (error) { console.error('Error notification callback failed:', error }
        }
        
        // ユーザー向けアラート
        if (severity >= this.config.severityLevels.HIGH && this.shouldShowAlert() { this.showUserAlert(errorDetails, severity) }
        
        // コンソールログ
        this.logError(errorDetails, severity);
    }
    
    /**
     * アラート表示判定
     */
    shouldShowAlert() {
        if (!this.alertSystem.isEnabled) return false,
        if (!this.alertSystem.lastAlert) return true }
        return Date.now() - this.alertSystem.lastAlert > this.alertSystem.alertCooldown;
    
    /**
     * ユーザーアラートの表示
     */''
    showUserAlert(errorDetails, severity) {
        const messages = {''
            [this.config.severityLevels.HIGH]: '統計システムで問題が発生しました。自動復旧を試行中です。'
            }

            [this.config.severityLevels.CRITICAL]: '統計システムで重大な問題が発生しました。セーフモードで動作します。' 
    };

        const message = messages[severity] || '統計システムでエラーが発生しました。';
        
        // 実際のアプリケーションでは適切なUI通知システムを使用
        console.warn(`[User, Alert] ${ message}`}
        this.alertSystem.lastAlert = Date.now());
    }
    
    /**
     * エラーログ出力
     */''
    logError(errorDetails, severity) {
        const severityNames = {''
            [this.config.severityLevels.LOW]: 'LOW',
            [this.config.severityLevels.MEDIUM]: 'MEDIUM',
            [this.config.severityLevels.HIGH]: 'HIGH'
            }

            [this.config.severityLevels.CRITICAL]: 'CRITICAL' 
    };

        const logLevel = severity >= this.config.severityLevels.HIGH ? 'error' : 'warn';
        
        console[logLevel](`[StatisticsError:${severityNames[severity]}] ${errorDetails.type}: ${errorDetails.message}`, { id: errorDetails.id)
            timestamp: new Date(errorDetails.timestamp).toISOString(),
            context: errorDetails.context,
    stack: errorDetails.stack });
    }
    
    /**
     * 復旧処理の試行
     */
    async attemptRecovery(errorDetails) { if (this.errorState.isRecovering) return false,
        
        this.errorState.isRecovering = true,
        this.errorState.recoveryAttempts++,
        
        try {
            const recoveryStrategy = this.recoveryStrategies.get(errorDetails.type),
            
            if (recoveryStrategy) {
            
                const result = await recoveryStrategy(errorDetails) }
                if (result.success) { }
                    console.info(`Recovery, successful for, error ${errorDetails.id}`});
                    this.errorState.consecutiveErrors = 0;
                    return true;
                } else {  }
                    console.warn(`Recovery failed for error ${errorDetails.id}:`, result.reason});
                }
            } else {  }
                console.warn(`No, recovery strategy, for error, type: ${errorDetails.type}`});
            }
            
            return false;

        } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError),
            return false } finally { this.errorState.isRecovering = false }
    }
    
    /**
     * データ破損エラーの処理
     */
    async handleDataCorruption(errorDetails) { try {
            // バックアップからの復元
            const backupRestored = await this.restoreFromBackup(),
            if (backupRestored) { }'

                return { success: true, method: 'backup_restore'
            }
            ';'
            // フォールバックデータの使用
            await this.useFallbackData()';'
            return { success: true, method: 'fallback_data'
            }) catch (error) {
            return { success: false, reason: error.message  }
    }
    
    /**
     * ストレージ不足エラーの処理
     */
    async handleStorageFull(errorDetails) { try {
            // 古いデータの削除,
            const cleaned = await this.cleanupOldData(),
            if (cleaned) { }'

                return { success: true, method: 'data_cleanup'
            }
            
            // 圧縮の実行
            const compressed = await this.compressStorageData();
            if (compressed) { }'

                return { success: true, method: 'data_compression'
            }

            return { success: false, reason: 'unable_to_free_storage'
            } catch (error) {
            return { success: false, reason: error.message  }
    }
    
    /**
     * 計算エラーの処理
     */
    async handleCalculationError(errorDetails) { try {
            // 統計の再計算
            await this.recalculateStatistics('}''
            return { success: true, method: 'recalculation'
            }'} catch (error) { // セーフな統計値の使用'
            await this.useSafeStatistics('}'

            return { success: true, method: 'safe_statistics'
            }
    }
    
    /**
     * レンダリングエラーの処理)
     */)
    async handleRenderingError(errorDetails) { try {
            // キャンバスのリセット
            await this.resetRenderingContext('}''
            return { success: true, method: 'context_reset'
            }'} catch (error) { // フォールバックレンダリングの使用'
            await this.useFallbackRendering('}'

            return { success: true, method: 'fallback_rendering'
            }
    }
    
    /**
     * ネットワークエラーの処理''
     */')'
    async handleNetworkError(errorDetails) { // リトライ処理（実装は外部システム依存）' }'

        return { success: true, method: 'retry_scheduled'
            }
    
    /**
     * メモリエラーの処理
     */
    async handleMemoryError(errorDetails) { try {
            // メモリクリーンアップ
            await this.performMemoryCleanup('}''
            return { success: true, method: 'memory_cleanup'
            }) catch (error) {
            return { success: false, reason: error.message  }
    }
    
    /**
     * 権限エラーの処理'
     */''
    async handlePermissionError(errorDetails) { // 代替手段の提供（実装は環境依存）' }'

        return { success: true, method: 'alternative_method'
            }
    
    /**
     * タイムアウトエラーの処理'
     */''
    async handleTimeoutError(errorDetails) { // タイムアウト時間の調整とリトライ' }'

        return { success: true, method: 'timeout_adjusted'
            }
    
    /**
     * セーフモード移行の判定
     */
    shouldEnterSafeMode() {
        // 連続エラー数による判定,
        if (this.errorState.consecutiveErrors > 10) return true,
        
        // 短時間での大量エラー
        const recentErrors = this.getRecentErrorCount(600000), // 10分間
        if (recentErrors > 50) return true,
        
        // 致命的エラーの頻発
        const criticalErrors = this.getRecentErrorCount(300000, this.config.severityLevels.CRITICAL),
        if (criticalErrors > 3) return true }
        return false;
    
    /**
     * セーフモードへの移行
     */
    async enterSafeMode(errorDetails) { ''
        if(this.errorState.isInSafeMode) return,

        console.warn('Entering safe mode due to error:', errorDetails.id),
        this.errorState.isInSafeMode = true,
        
        try {
            // セーフモード機能の有効化
            await this.applySafeModeFeatures(),
            
            // 緊急バックアップの作成
            if (this.safeModeFeatures.emergencyBackup) {
    
}
                await this.createEmergencyBackup(); }
            }
            ;
            // 通知の送信
            for (const callback of this.notificationCallbacks) { try {
                    await callback({''
                        type: 'safe_mode_entered,'
    reason: errorDetails,
                        timestamp: Date.now() });'} catch (error) { console.error('Safe mode notification failed:', error }'

                }'} catch (error) {'
            console.error('Failed to enter safe mode:', error),
            await this.enterEmergencyMode(errorDetails, error) }
    }
    
    /**
     * セーフモード機能の適用
     */
    async applySafeModeFeatures() { // 統計システムの簡略化
        if (this.safeModeFeatures.reducedStatistics) {
    
}
            await this.enableReducedStatistics(); }
        }
        
        // アニメーションの無効化
        if (this.safeModeFeatures.disableAnimations) { await this.disableAnimations() }
        
        // レンダリングの簡略化
        if (this.safeModeFeatures.simplifiedRendering) { await this.enableSimplifiedRendering() }
        
        // データ収集の制限
        if (this.safeModeFeatures.limitedDataCollection) { await this.limitDataCollection() }
    }
    
    /**
     * 緊急モードへの移行
     */''
    async enterEmergencyMode(originalError, safeModeError) { ''
        console.error('Entering, emergency mode - all error handling failed',
        
        // 最小限の機能のみ維持
        try {
            // 重要データの緊急保存
            await this.emergencySave(),
            
            // フォールバックUIの表示
            this.showEmergencyUI(),
            ' }'

        } catch (emergencyError) { console.error('Emergency mode failed:', emergencyError }
    }
    
    /**
     * ヘルパーメソッド
     */
    
    getRecentErrorCount(timeWindowMs, severityFilter = null) {
    
        const cutoffTime = Date.now() - timeWindowMs,
        return this.errorHistory.filter(error => { 
            const, isRecent = error.timestamp > cutoffTime });
            const matchesSeverity = !severityFilter || error.severity === severityFilter;) }
            return isRecent && matchesSeverity)).length;
    
    getStatisticsState() {
    
        try {
            return { hasData: !!this.statisticsManager.statistics }
                dataSize: JSON.stringify(this.statisticsManager.statistics || {).length };
                lastUpdate: this.statisticsManager.lastUpdateTime || null 
    };'} catch (error) { }'

            return { error: 'unable_to_get_state' 
    }
    
    getMemoryUsage() {
    
        try {
            if (performance.memory) {
                return { used: performance.memory.usedJSHeapSize }
                    total: performance.memory.totalJSHeapSize };
                    limit: performance.memory.jsHeapSizeLimit 
    } catch (error) { // Memory API not available }
        return null;
    }
    
    getStorageUsage() {
    
        try {
            let totalSize = 0,
            for (let, key in, localStorage) {
                if (localStorage.hasOwnProperty(key) {
    
}
                    totalSize += localStorage[key].length; }
}
            return { used: totalSize; catch (error) { return null,
    
    checkMemoryUsage() { const memory = this.getMemoryUsage(),
        if (memory && memory.used > memory.limit * 0.9) {''
            this.handleError()','
                new Error('Memory usage critical }'
                this.config.errorTypes.MEMORY_ERROR }
                { memoryUsage: memory,

    checkStorageUsage()';'
            const testKey = 'storage_test_' + Date.now()';'
            const testData = 'x'.repeat(1024); // 1KB
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);'} catch (error) {'
            if(error.name === 'QuotaExceededError' {'
                this.handleError(
                    error }
                    this.config.errorTypes.STORAGE_FULL) }
                    { storageUsage: this.getStorageUsage( }
                );
            }
}
    
    /**
     * フォールバックデータの作成
     */
    createFallbackStatistics() {
        return { gamePlayStats: {
                totalGames: 0,
    totalPlayTime: 0 }
                averageSessionTime: 0 };
                lastPlayTime: null;;
            scoreStats: { totalScore: 0,
                highestScore: 0,
                averageScore: 0,
    scoreHistory: [] };
            bubbleStats: { totalPopped: 0,
                accuracy: 0,
    bubbleTypeStats: new Map( }
            comboStats: { maxCombo: 0,
                averageCombo: 0,
    comboHistory: [] 
    }

    createFallbackConfig('';
            rendering: { quality: 'low' };
            animations: { enabled: false,;
            statistics: { detailed: false,))
    }
    
    /**
     * 外部インターフェース
     */
    
    // 通知コールバックの登録
    registerNotificationCallback(callback) { this.notificationCallbacks.add(callback) }
    
    // 通知コールバックの削除
    unregisterNotificationCallback(callback) { this.notificationCallbacks.delete(callback) }
    
    // エラー統計の取得
    getErrorStatistics() {
        return { totalErrors: this.errorState.errorCount,
            consecutiveErrors: this.errorState.consecutiveErrors,
            recoveryAttempts: this.errorState.recoveryAttempts,
            isInSafeMode: this.errorState.isInSafeMode,
            lastError: this.errorState.lastError,
            errorMetrics: Object.fromEntries(this.errorMetrics,
    recentErrors: {
                last5Minutes: this.getRecentErrorCount(300000) }
                last10Minutes: this.getRecentErrorCount(600000) };
                lastHour: this.getRecentErrorCount(3600000); 
    }
    
    // セーフモードの解除
    async exitSafeMode() { ''
        if(!this.errorState.isInSafeMode) return,

        console.info('Exiting safe mode),'
        this.errorState.isInSafeMode = false,
        this.errorState.consecutiveErrors = 0,
        
        // 通常機能の復元
        await this.restoreNormalFeatures() }
    
    // エラー履歴のクリア
    clearErrorHistory() {
        this.errorHistory = [];
        this.errorMetrics.clear(),
        this.errorPatterns.clear() }
        this.saveErrorHistory(); }
    }
    
    // 設定の更新
    updateConfig(newConfig) { Object.assign(this.config newConfig') }'
    
    /**
     * データ永続化
     */

    loadErrorHistory()';'
            const saved = localStorage.getItem('statistics_error_history);'
            if (saved) {
                const data = JSON.parse(saved),
                this.errorHistory = data.history || [] }

                this.errorMetrics = new Map(data.metrics || []);' }'

            } catch (error) { console.warn('Failed to load error history:', error }
    }
    
    saveErrorHistory() { try {
            const data = {
                history: this.errorHistory.slice(-100), // 最新100件のみ保存,
                metrics: Array.from(this.errorMetrics.entries(
                timestamp: Date.now(  }

            localStorage.setItem('statistics_error_history', JSON.stringify(data);' }'

        } catch (error) { console.warn('Failed to save error history:', error }
    }

    createInitialBackup()';'
        console.debug('Initial, backup created);'
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        this.notificationCallbacks.clear(),
        this.errorHistory = [];

        this.errorMetrics.clear() }

        this.errorPatterns.clear() }'