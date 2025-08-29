/**
 * Error Submission Manager
 * エラー送信とキュー管理専用クラス
 */

export class ErrorSubmissionManager {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
        
        // 送信キュー
        this.submissionQueue = [];
        this.maxQueueSize = 100;
        this.isProcessing = false;
        
        // 送信設定
        this.submissionConfig = {
            enabled: false, // デフォルトは無効（プライバシー保護）
            endpoint: null,
            batchSize: 10,
            retryAttempts: 3,
            retryDelay: 5000,
            timeout: 30000
        };
        
        // レート制限
        this.rateLimiting = {
            enabled: true,
            maxPerMinute: 10,
            maxPerHour: 100,
            resetInterval: 60000,
            recentSubmissions: []
        };
        
        // 送信統計
        this.submissionStats = {
            totalSubmissions: 0,
            successful: 0,
            failed: 0,
            queued: 0,
            dropped: 0,
            rateLimited: 0
        };
        
        // 送信履歴
        this.submissionHistory = [];
        this.maxHistorySize = 50;
        
        this.initializeSubmissionManager();
    }
    
    /**
     * 初期化
     */
    initializeSubmissionManager() {
        this.loadSubmissionSettings();
        this.setupRateLimitReset();
        this.setupPeriodicProcessing();
    }
    
    /**
     * エラーの送信キューへの追加
     */
    submitError(error, priority = 'normal') {
        if (!this.submissionConfig.enabled) {
            return { success: false, reason: 'submission_disabled' };
        }
        
        // レート制限チェック
        if (!this.checkRateLimit()) {
            this.submissionStats.rateLimited++;
            return { success: false, reason: 'rate_limited' };
        }
        
        // キューサイズ制限
        if (this.submissionQueue.length >= this.maxQueueSize) {
            const dropped = this.submissionQueue.shift();
            this.submissionStats.dropped++;
            console.warn('Submission queue full, dropped oldest error:', dropped.id);
        }
        
        const submissionItem = {
            id: this.generateSubmissionId(),
            error,
            priority,
            timestamp: Date.now(),
            attempts: 0,
            status: 'queued'
        };
        
        // 優先度に基づく挿入
        if (priority === 'high' || priority === 'critical') {
            this.submissionQueue.unshift(submissionItem);
        } else {
            this.submissionQueue.push(submissionItem);
        }
        
        this.submissionStats.queued++;
        
        // 即座に処理を開始（高優先度の場合）
        if (priority === 'critical' && !this.isProcessing) {
            this.processQueue();
        }
        
        return { success: true, submissionId: submissionItem.id };
    }
    
    /**
     * バッチでの送信キューへの追加
     */
    submitErrorBatch(errors, priority = 'normal') {
        const results = [];
        
        for (const error of errors) {
            const result = this.submitError(error, priority);
            results.push({
                errorId: error.id,
                ...result
            });
        }
        
        return results;
    }
    
    /**
     * レート制限チェック
     */
    checkRateLimit() {
        if (!this.rateLimiting.enabled) return true;
        
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;
        
        // 古い記録をクリーンアップ
        this.rateLimiting.recentSubmissions = this.rateLimiting.recentSubmissions
            .filter(timestamp => timestamp > oneHourAgo);
        
        const recentMinute = this.rateLimiting.recentSubmissions
            .filter(timestamp => timestamp > oneMinuteAgo);
        
        const recentHour = this.rateLimiting.recentSubmissions;
        
        return recentMinute.length < this.rateLimiting.maxPerMinute &&
               recentHour.length < this.rateLimiting.maxPerHour;
    }
    
    /**
     * 送信キューの処理
     */
    async processQueue() {
        if (this.isProcessing || this.submissionQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        try {
            const batch = this.submissionQueue.splice(0, this.submissionConfig.batchSize);
            
            for (const item of batch) {
                await this.processSubmissionItem(item);
            }
        } catch (error) {
            console.warn('Error processing submission queue:', error.message);
        } finally {
            this.isProcessing = false;
            
            // キューに残りがある場合は再処理
            if (this.submissionQueue.length > 0) {
                setTimeout(() => this.processQueue(), 1000);
            }
        }
    }
    
    /**
     * 個別送信アイテムの処理
     */
    async processSubmissionItem(item) {
        item.status = 'processing';
        item.attempts++;
        
        try {
            const result = await this.sendToEndpoint(item.error);
            
            if (result.success) {
                item.status = 'completed';
                this.submissionStats.successful++;
                this.recordSubmissionHistory(item, 'success', result);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            item.status = 'failed';
            item.lastError = error.message;
            
            // リトライ判定
            if (item.attempts < this.submissionConfig.retryAttempts) {
                item.status = 'retry';
                // 指数バックオフでリトライ
                const delay = this.submissionConfig.retryDelay * Math.pow(2, item.attempts - 1);
                setTimeout(() => {
                    this.submissionQueue.unshift(item);
                }, delay);
            } else {
                this.submissionStats.failed++;
                this.recordSubmissionHistory(item, 'failed', { error: error.message });
            }
        }
        
        this.submissionStats.totalSubmissions++;
    }
    
    /**
     * エンドポイントへの送信
     */
    async sendToEndpoint(error) {
        if (!this.submissionConfig.endpoint) {
            throw new Error('No submission endpoint configured');
        }
        
        const payload = this.preparePayload(error);
        
        try {
            const response = await fetch(this.submissionConfig.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `ErrorReporter/1.0 (${navigator.userAgent})`
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.submissionConfig.timeout)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // レート制限記録
            this.rateLimiting.recentSubmissions.push(Date.now());
            
            return { success: true, result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 送信ペイロードの準備
     */
    preparePayload(error) {
        // プライバシー保護のため、機密情報を除外
        const sanitizedError = {
            id: error.id,
            timestamp: error.timestamp,
            message: error.message,
            name: error.name,
            category: error.category,
            severity: error.severity,
            fingerprint: error.fingerprint,
            
            // サニタイズされたコンテキスト
            context: {
                url: this.sanitizeUrl(error.context.url),
                userAgent: error.context.userAgent,
                viewport: error.context.viewport,
                browserInfo: this.sanitizeBrowserInfo(error.context.browserInfo),
                gameState: this.sanitizeGameState(error.context.gameState)
            },
            
            // メタデータ
            sessionId: error.sessionId,
            version: this.getApplicationVersion()
        };
        
        return {
            errors: [sanitizedError],
            timestamp: Date.now(),
            source: 'ErrorReporter',
            version: '1.0'
        };
    }
    
    /**
     * URLのサニタイズ
     */
    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // クエリパラメータとフラグメントを除去
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        } catch (e) {
            return '[sanitized-url]';
        }
    }
    
    /**
     * ブラウザ情報のサニタイズ
     */
    sanitizeBrowserInfo(browserInfo) {
        if (!browserInfo) return null;
        
        return {
            platform: browserInfo.platform,
            language: browserInfo.language,
            hardwareConcurrency: browserInfo.hardwareConcurrency,
            connection: browserInfo.connection ? {
                effectiveType: browserInfo.connection.effectiveType
            } : null
        };
    }
    
    /**
     * ゲーム状態のサニタイズ
     */
    sanitizeGameState(gameState) {
        if (!gameState) return null;
        
        return {
            currentScene: gameState.currentScene,
            isRunning: gameState.isRunning,
            isPaused: gameState.isPaused,
            fps: gameState.fps
            // スコアやHP等の個人データは除外
        };
    }
    
    /**
     * アプリケーションバージョンの取得
     */
    getApplicationVersion() {
        // manifest.jsonやpackage.jsonから取得（実装依存）
        return '1.0.0';
    }
    
    /**
     * 送信履歴の記録
     */
    recordSubmissionHistory(item, status, details) {
        this.submissionHistory.push({
            submissionId: item.id,
            errorId: item.error.id,
            status,
            timestamp: Date.now(),
            attempts: item.attempts,
            details
        });
        
        // 履歴サイズ制限
        if (this.submissionHistory.length > this.maxHistorySize) {
            this.submissionHistory.shift();
        }
    }
    
    /**
     * キューの状態取得
     */
    getQueueStatus() {
        const statusCounts = this.submissionQueue.reduce((counts, item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
            return counts;
        }, {});
        
        return {
            total: this.submissionQueue.length,
            isProcessing: this.isProcessing,
            statusBreakdown: statusCounts,
            oldestItem: this.submissionQueue[0]?.timestamp,
            newestItem: this.submissionQueue[this.submissionQueue.length - 1]?.timestamp
        };
    }
    
    /**
     * 送信統計の取得
     */
    getSubmissionStatistics() {
        return {
            ...this.submissionStats,
            successRate: this.submissionStats.totalSubmissions > 0 
                ? (this.submissionStats.successful / this.submissionStats.totalSubmissions * 100).toFixed(2)
                : 0,
            queueStatus: this.getQueueStatus(),
            rateLimitStatus: {
                enabled: this.rateLimiting.enabled,
                recentSubmissions: this.rateLimiting.recentSubmissions.length,
                nextReset: Date.now() + this.rateLimiting.resetInterval
            }
        };
    }
    
    /**
     * キューのクリア
     */
    clearQueue(filter = {}) {
        let clearedCount = 0;
        
        if (Object.keys(filter).length === 0) {
            // 全件クリア
            clearedCount = this.submissionQueue.length;
            this.submissionQueue = [];
        } else {
            // 条件付きクリア
            const originalLength = this.submissionQueue.length;
            this.submissionQueue = this.submissionQueue.filter(item => {
                const shouldKeep = !this.matchesQueueFilter(item, filter);
                if (!shouldKeep) clearedCount++;
                return shouldKeep;
            });
        }
        
        this.submissionStats.dropped += clearedCount;
        return clearedCount;
    }
    
    /**
     * キューフィルターのマッチング
     */
    matchesQueueFilter(item, filter) {
        if (filter.status && item.status !== filter.status) return false;
        if (filter.priority && item.priority !== filter.priority) return false;
        if (filter.maxAge) {
            const age = Date.now() - item.timestamp;
            if (age > filter.maxAge) return true;
        }
        return true;
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        Object.assign(this.submissionConfig, newConfig);
        this.saveSubmissionSettings();
    }
    
    /**
     * レート制限設定の更新
     */
    updateRateLimiting(newSettings) {
        Object.assign(this.rateLimiting, newSettings);
        this.saveSubmissionSettings();
    }
    
    /**
     * 設定の読み込み
     */
    loadSubmissionSettings() {
        try {
            const stored = localStorage.getItem('errorReporter_submission');
            if (stored) {
                const settings = JSON.parse(stored);
                Object.assign(this.submissionConfig, settings.config || {});
                Object.assign(this.rateLimiting, settings.rateLimiting || {});
            }
        } catch (e) {
            console.warn('Failed to load submission settings:', e.message);
        }
    }
    
    /**
     * 設定の保存
     */
    saveSubmissionSettings() {
        try {
            const settings = {
                config: this.submissionConfig,
                rateLimiting: this.rateLimiting,
                savedAt: Date.now()
            };
            localStorage.setItem('errorReporter_submission', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save submission settings:', e.message);
        }
    }
    
    /**
     * レート制限リセットの設定
     */
    setupRateLimitReset() {
        setInterval(() => {
            const oneHourAgo = Date.now() - 3600000;
            this.rateLimiting.recentSubmissions = this.rateLimiting.recentSubmissions
                .filter(timestamp => timestamp > oneHourAgo);
        }, this.rateLimiting.resetInterval);
    }
    
    /**
     * 定期処理の設定
     */
    setupPeriodicProcessing() {
        // 定期的にキューを処理
        setInterval(() => {
            if (this.submissionQueue.length > 0 && !this.isProcessing) {
                this.processQueue();
            }
        }, 30000); // 30秒間隔
        
        // 古いキューアイテムのクリーンアップ
        setInterval(() => {
            const maxAge = 24 * 60 * 60 * 1000; // 24時間
            this.clearQueue({ maxAge });
        }, 3600000); // 1時間間隔
    }
    
    /**
     * ユーティリティメソッド
     */
    generateSubmissionId() {
        return 'submission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 手動での即座送信
     */
    async forceSubmit(errorId) {
        const error = this.errorReporter.errorCollector.getErrorById(errorId);
        if (!error) {
            return { success: false, reason: 'error_not_found' };
        }
        
        try {
            const result = await this.sendToEndpoint(error);
            
            if (result.success) {
                this.submissionStats.successful++;
                this.recordSubmissionHistory(
                    { id: this.generateSubmissionId(), error, attempts: 1 },
                    'success',
                    result
                );
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        this.saveSubmissionSettings();
        this.submissionQueue = [];
        this.submissionHistory = [];
    }
}