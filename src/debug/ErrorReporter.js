/**
 * Error Reporter
 * 既存のErrorHandlerを拡張した包括的エラー収集・分析・レポートシステム
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ErrorScreenshotCapture } from './ErrorScreenshotCapture.js';

export class ErrorReporter extends ErrorHandler {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        
        // エラー収集システム
        this.errorCollector = new ErrorCollector(this);
        this.errorAnalyzer = new ErrorAnalyzer(this);
        this.errorStorage = new ErrorStorage(this);
        this.screenshotCapture = new ErrorScreenshotCapture(gameEngine);
        
        // セッション管理
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        
        // 通知システム
        this.notificationThresholds = {
            critical: 1,      // 1回でも発生したら通知
            warning: 5,       // 5回で通知
            error: 10         // 10回で通知
        };
        
        // エラーパターン分析
        this.errorPatterns = new Map();
        this.patternDetectionEnabled = true;
        
        // 開発者通知設定
        this.developerNotifications = {
            enabled: true,
            maxPerMinute: 10,
            recentNotifications: [],
            channels: ['console', 'ui', 'storage']
        };
        
        this.initializeErrorReporter();
    }
    
    /**
     * ErrorReporter固有の初期化
     */
    initializeErrorReporter() {
        this.setupEnhancedErrorCollection();
        this.setupPatternDetection();
        this.setupNotificationSystem();
        this.loadStoredErrors();
        
        console.log(`ErrorReporter initialized - Session: ${this.sessionId}`);
    }
    
    /**
     * 拡張エラー収集の設定
     */
    setupEnhancedErrorCollection() {
        // 既存のエラーハンドリングを拡張
        const originalHandleError = this.handleError.bind(this);
        
        this.handleError = async (error, context = {}) => {
            // 元のエラーハンドリングを実行
            const result = originalHandleError(error, context);
            
            // 拡張エラー収集を実行（非同期）
            try {
                await this.collectEnhancedError(error, context);
            } catch (collectionError) {
                console.warn('Error collection failed:', collectionError.message);
            }
            
            return result;
        };
        
        // 追加のエラーキャッチ設定
        this.setupAdditionalErrorCatching();
    }
    
    /**
     * 追加のエラーキャッチ設定
     */
    setupAdditionalErrorCatching() {
        // Promise rejectionのキャッチ
        window.addEventListener('unhandledrejection', async (event) => {
            try {
                await this.collectEnhancedError(new Error(event.reason), {
                    type: 'unhandledrejection',
                    promise: event.promise,
                    gameState: this.captureGameState()
                });
            } catch (e) {
                console.warn('Unhandled rejection collection failed:', e.message);
            }
        });
        
        // リソース読み込みエラー
        window.addEventListener('error', async (event) => {
            if (event.target !== window) {
                try {
                    await this.collectEnhancedError(new Error(`Resource load failed: ${event.target.src || event.target.href}`), {
                        type: 'resource_error',
                        element: event.target.tagName,
                        source: event.target.src || event.target.href,
                        gameState: this.captureGameState()
                    });
                } catch (e) {
                    console.warn('Resource error collection failed:', e.message);
                }
            }
        }, true);
    }
    
    /**
     * 拡張エラー情報の収集
     */
    async collectEnhancedError(error, context = {}) {
        const enhancedError = {
            id: this.generateErrorId(),
            sessionId: this.sessionId,
            timestamp: Date.now(),
            
            // 基本エラー情報
            message: error.message,
            stack: error.stack,
            name: error.name,
            
            // コンテキスト情報
            context: {
                ...context,
                url: window.location.href,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                gameState: context.gameState || this.captureGameState(),
                browserInfo: this.captureBrowserInfo(),
                performanceInfo: this.capturePerformanceInfo()
            },
            
            // パターン分析用情報
            fingerprint: this.generateErrorFingerprint(error, context),
            severity: this.calculateSeverity(error, context),
            category: this.categorizeError(error, context)
        };
        
        // クリティカルエラーの場合はスクリーンショットを取得
        if (enhancedError.severity === 'critical' || enhancedError.severity === 'high') {
            try {
                const screenshot = await this.screenshotCapture.captureOnCriticalError(error, {
                    errorId: enhancedError.id,
                    gameState: enhancedError.context.gameState
                });
                
                if (screenshot) {
                    enhancedError.screenshot = {
                        id: screenshot.id,
                        timestamp: screenshot.timestamp,
                        size: screenshot.size
                    };
                }
            } catch (screenshotError) {
                console.warn('Failed to capture error screenshot:', screenshotError.message);
            }
        }
        
        // エラーを保存
        this.errorCollector.collect(enhancedError);
        
        // パターン分析
        if (this.patternDetectionEnabled) {
            this.errorAnalyzer.analyzePattern(enhancedError);
        }
        
        // 通知判定
        this.checkNotificationThreshold(enhancedError);
        
        return enhancedError;
    }
    
    /**
     * ゲーム状態のキャプチャ
     */
    captureGameState() {
        if (!this.gameEngine) return null;
        
        try {
            return {
                currentScene: this.gameEngine.sceneManager?.currentScene?.constructor.name,
                gameTime: this.gameEngine.gameTime,
                isRunning: this.gameEngine.isRunning,
                isPaused: this.gameEngine.isPaused,
                fps: this.gameEngine.targetFPS,
                bubbleCount: this.gameEngine.bubbleManager?.bubbles?.length || 0,
                score: this.gameEngine.scoreManager?.score || 0,
                playerHP: this.gameEngine.playerData?.currentHP || 0
            };
        } catch (e) {
            return { error: 'Failed to capture game state', message: e.message };
        }
    }
    
    /**
     * ブラウザ情報のキャプチャ
     */
    captureBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }
    
    /**
     * パフォーマンス情報のキャプチャ
     */
    capturePerformanceInfo() {
        try {
            const memory = performance.memory;
            return {
                memory: memory ? {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                } : null,
                timing: performance.now(),
                navigation: performance.navigation ? {
                    type: performance.navigation.type,
                    redirectCount: performance.navigation.redirectCount
                } : null
            };
        } catch (e) {
            return { error: 'Failed to capture performance info' };
        }
    }
    
    /**
     * エラーフィンガープリントの生成
     */
    generateErrorFingerprint(error, context) {
        const components = [
            error.name,
            error.message,
            error.stack ? error.stack.split('\n')[0] : '',
            context.type || 'generic',
            context.component || 'unknown'
        ];
        
        return this.hashString(components.join('|'));
    }
    
    /**
     * エラー重要度の計算
     */
    calculateSeverity(error, context) {
        let severity = 'low';
        
        // クリティカルエラーの判定
        if (error.name === 'TypeError' || error.name === 'ReferenceError') {
            severity = 'high';
        }
        
        if (context.type === 'unhandledrejection') {
            severity = 'medium';
        }
        
        if (context.critical || this.criticalErrors.has(error.name)) {
            severity = 'critical';
        }
        
        // ゲーム状態に基づく重要度調整
        if (context.gameState?.isRunning === false) {
            severity = this.upgradeSeverity(severity);
        }
        
        return severity;
    }
    
    /**
     * エラーのカテゴリ化
     */
    categorizeError(error, context) {
        if (context.type) return context.type;
        
        // メッセージベースのカテゴリ化
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'network';
        }
        
        if (message.includes('canvas') || message.includes('render')) {
            return 'rendering';
        }
        
        if (message.includes('audio') || message.includes('sound')) {
            return 'audio';
        }
        
        if (message.includes('storage') || message.includes('localstorage')) {
            return 'storage';
        }
        
        return 'generic';
    }
    
    /**
     * 通知閾値のチェック
     */
    checkNotificationThreshold(error) {
        const category = error.category;
        const severity = error.severity;
        
        // 重要度別の通知判定
        if (severity === 'critical') {
            this.notifyDeveloper(error, 'immediate');
        } else {
            // パターンベースの通知判定
            this.checkPatternBasedNotification(error);
        }
    }
    
    /**
     * パターンベース通知の判定
     */
    checkPatternBasedNotification(error) {
        const pattern = this.errorPatterns.get(error.fingerprint);
        if (!pattern) return;
        
        const threshold = this.notificationThresholds[error.severity] || 10;
        
        if (pattern.count >= threshold) {
            this.notifyDeveloper(error, 'pattern', {
                patternInfo: pattern,
                totalOccurrences: pattern.count
            });
        }
    }
    
    /**
     * 開発者通知の送信
     */
    notifyDeveloper(error, type = 'standard', additionalInfo = {}) {
        if (!this.developerNotifications.enabled) return;
        
        // レート制限チェック
        if (!this.checkNotificationRateLimit()) return;
        
        const notification = {
            id: this.generateNotificationId(),
            timestamp: Date.now(),
            type,
            error,
            additionalInfo,
            sessionId: this.sessionId
        };
        
        this.developerNotifications.recentNotifications.push(notification);
        
        // 通知チャンネルへの送信
        this.sendToNotificationChannels(notification);
    }
    
    /**
     * 通知チャンネルへの送信
     */
    sendToNotificationChannels(notification) {
        const channels = this.developerNotifications.channels;
        
        if (channels.includes('console')) {
            this.sendConsoleNotification(notification);
        }
        
        if (channels.includes('ui')) {
            this.sendUINotification(notification);
        }
        
        if (channels.includes('storage')) {
            this.sendStorageNotification(notification);
        }
    }
    
    /**
     * コンソール通知の送信
     */
    sendConsoleNotification(notification) {
        const { error, type, additionalInfo } = notification;
        
        console.group(`🚨 Error Reporter - ${type.toUpperCase()}`);
        console.error(`Error: ${error.message}`);
        console.log(`Category: ${error.category}`);
        console.log(`Severity: ${error.severity}`);
        console.log(`Session: ${error.sessionId}`);
        
        if (additionalInfo.patternInfo) {
            console.log(`Pattern detected - Occurrences: ${additionalInfo.totalOccurrences}`);
        }
        
        console.log('Game State:', error.context.gameState);
        console.groupEnd();
    }
    
    /**
     * UI通知の送信
     */
    sendUINotification(notification) {
        // UI通知システムと統合（後で実装）
        if (this.gameEngine?.debugInterface) {
            this.gameEngine.debugInterface.showErrorNotification(notification);
        }
    }
    
    /**
     * ストレージ通知の送信
     */
    sendStorageNotification(notification) {
        this.errorStorage.storeNotification(notification);
    }
    
    /**
     * 通知レート制限のチェック
     */
    checkNotificationRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // 1分以内の通知を数える
        const recentCount = this.developerNotifications.recentNotifications
            .filter(n => n.timestamp > oneMinuteAgo).length;
        
        // 古い通知をクリーンアップ
        this.developerNotifications.recentNotifications = 
            this.developerNotifications.recentNotifications
                .filter(n => n.timestamp > oneMinuteAgo);
        
        return recentCount < this.developerNotifications.maxPerMinute;
    }
    
    /**
     * パターン検出の設定
     */
    setupPatternDetection() {
        setInterval(() => {
            this.cleanupOldPatterns();
        }, 300000); // 5分ごとにクリーンアップ
    }
    
    /**
     * 通知システムの設定
     */
    setupNotificationSystem() {
        // 設定の読み込み
        this.loadNotificationSettings();
    }
    
    /**
     * ストレージからエラーデータを読み込み
     */
    loadStoredErrors() {
        try {
            this.errorStorage.loadSession(this.sessionId);
        } catch (e) {
            console.warn('Failed to load stored errors:', e.message);
        }
    }
    
    /**
     * 設定の読み込み
     */
    loadNotificationSettings() {
        try {
            const stored = localStorage.getItem('errorReporter_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                Object.assign(this.developerNotifications, settings);
            }
        } catch (e) {
            console.warn('Failed to load notification settings:', e.message);
        }
    }
    
    /**
     * ユーティリティメソッド群
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateErrorId() {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateNotificationId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    upgradeSeverity(currentSeverity) {
        const levels = ['low', 'medium', 'high', 'critical'];
        const currentIndex = levels.indexOf(currentSeverity);
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
    }
    
    cleanupOldPatterns() {
        const oneHourAgo = Date.now() - 3600000;
        
        for (const [fingerprint, pattern] of this.errorPatterns.entries()) {
            if (pattern.lastSeen < oneHourAgo) {
                this.errorPatterns.delete(fingerprint);
            }
        }
    }
    
    /**
     * エラーレポートの生成
     */
    generateErrorReport(timeframe = 'session') {
        return this.errorAnalyzer.generateReport(timeframe);
    }
    
    /**
     * エラー統計の取得
     */
    getErrorStatistics() {
        return this.errorAnalyzer.getStatistics();
    }
    
    /**
     * 設定の保存
     */
    saveSettings() {
        try {
            localStorage.setItem('errorReporter_settings', JSON.stringify(this.developerNotifications));
        } catch (e) {
            console.warn('Failed to save settings:', e.message);
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        this.saveSettings();
        this.errorStorage.cleanup();
        this.screenshotCapture?.destroy();
        super.destroy?.();
    }
}

/**
 * Error Collector
 * エラー収集専用クラス
 */
class ErrorCollector {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
        this.collectedErrors = [];
        this.maxStorageSize = 1000;
    }
    
    collect(error) {
        this.collectedErrors.push(error);
        
        // サイズ制限の適用
        if (this.collectedErrors.length > this.maxStorageSize) {
            this.collectedErrors.shift();
        }
        
        // ストレージに保存
        this.errorReporter.errorStorage.store(error);
        
        return error.id;
    }
    
    getErrors(filter = {}) {
        return this.collectedErrors.filter(error => {
            return this.matchesFilter(error, filter);
        });
    }
    
    matchesFilter(error, filter) {
        if (filter.severity && error.severity !== filter.severity) return false;
        if (filter.category && error.category !== filter.category) return false;
        if (filter.timeframe) {
            const timeLimit = Date.now() - filter.timeframe;
            if (error.timestamp < timeLimit) return false;
        }
        return true;
    }
}

/**
 * Error Analyzer
 * エラーパターン分析専用クラス
 */
class ErrorAnalyzer {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
    }
    
    analyzePattern(error) {
        const fingerprint = error.fingerprint;
        
        if (!this.errorReporter.errorPatterns.has(fingerprint)) {
            this.errorReporter.errorPatterns.set(fingerprint, {
                fingerprint,
                count: 0,
                firstSeen: error.timestamp,
                lastSeen: error.timestamp,
                errors: [],
                trend: 'stable'
            });
        }
        
        const pattern = this.errorReporter.errorPatterns.get(fingerprint);
        pattern.count++;
        pattern.lastSeen = error.timestamp;
        pattern.errors.push(error.id);
        
        // トレンド分析
        this.updateTrend(pattern);
        
        return pattern;
    }
    
    updateTrend(pattern) {
        const timeWindow = 300000; // 5分
        const recentErrors = pattern.errors.filter(errorId => {
            const error = this.errorReporter.errorCollector.collectedErrors.find(e => e.id === errorId);
            return error && (Date.now() - error.timestamp) < timeWindow;
        });
        
        if (recentErrors.length > pattern.count * 0.7) {
            pattern.trend = 'increasing';
        } else if (recentErrors.length < pattern.count * 0.3) {
            pattern.trend = 'decreasing';
        } else {
            pattern.trend = 'stable';
        }
    }
    
    generateReport(timeframe = 'session') {
        const errors = this.getErrorsForTimeframe(timeframe);
        
        return {
            timeframe,
            sessionId: this.errorReporter.sessionId,
            generatedAt: Date.now(),
            summary: {
                total: errors.length,
                bySeverity: this.groupBy(errors, 'severity'),
                byCategory: this.groupBy(errors, 'category'),
                uniquePatterns: this.errorReporter.errorPatterns.size
            },
            patterns: Array.from(this.errorReporter.errorPatterns.values()),
            recentErrors: errors.slice(-10),
            recommendations: this.generateRecommendations(errors)
        };
    }
    
    getErrorsForTimeframe(timeframe) {
        const now = Date.now();
        let timeLimit = 0;
        
        switch (timeframe) {
            case 'last_hour':
                timeLimit = now - 3600000;
                break;
            case 'last_day':
                timeLimit = now - 86400000;
                break;
            case 'session':
            default:
                timeLimit = this.errorReporter.sessionStartTime;
                break;
        }
        
        return this.errorReporter.errorCollector.collectedErrors
            .filter(error => error.timestamp >= timeLimit);
    }
    
    groupBy(errors, property) {
        return errors.reduce((groups, error) => {
            const key = error[property];
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }
    
    generateRecommendations(errors) {
        const recommendations = [];
        
        // 高頻度エラーのチェック
        const highFrequencyPatterns = Array.from(this.errorReporter.errorPatterns.values())
            .filter(pattern => pattern.count > 5);
        
        if (highFrequencyPatterns.length > 0) {
            recommendations.push({
                type: 'high_frequency',
                message: `${highFrequencyPatterns.length}個のエラーパターンが高頻度で発生しています`,
                action: 'これらのパターンを優先的に修正してください',
                patterns: highFrequencyPatterns.slice(0, 3)
            });
        }
        
        // メモリ関連エラーのチェック
        const memoryErrors = errors.filter(error => 
            error.message.toLowerCase().includes('memory') ||
            error.category === 'memory'
        );
        
        if (memoryErrors.length > 0) {
            recommendations.push({
                type: 'memory_issues',
                message: `${memoryErrors.length}個のメモリ関連エラーが検出されました`,
                action: 'メモリリークの調査を推奨します'
            });
        }
        
        return recommendations;
    }
    
    getStatistics() {
        const errors = this.errorReporter.errorCollector.collectedErrors;
        
        return {
            sessionDuration: Date.now() - this.errorReporter.sessionStartTime,
            totalErrors: errors.length,
            errorRate: this.calculateErrorRate(errors),
            severityDistribution: this.groupBy(errors, 'severity'),
            categoryDistribution: this.groupBy(errors, 'category'),
            patternCount: this.errorReporter.errorPatterns.size,
            topPatterns: this.getTopPatterns(5)
        };
    }
    
    calculateErrorRate(errors) {
        const sessionDuration = Date.now() - this.errorReporter.sessionStartTime;
        const hours = sessionDuration / 3600000;
        return hours > 0 ? (errors.length / hours).toFixed(2) : 0;
    }
    
    getTopPatterns(limit = 5) {
        return Array.from(this.errorReporter.errorPatterns.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}

/**
 * Error Storage
 * エラーデータの永続化専用クラス
 */
class ErrorStorage {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
        this.storageKey = 'errorReporter_data';
        this.maxStorageSize = 500; // IndexedDBの代わりにLocalStorageを使用
    }
    
    store(error) {
        try {
            const stored = this.getStoredData();
            stored.errors.push(error);
            
            // サイズ制限の適用
            if (stored.errors.length > this.maxStorageSize) {
                stored.errors.shift();
            }
            
            stored.lastUpdated = Date.now();
            this.saveStoredData(stored);
            
        } catch (e) {
            console.warn('Failed to store error:', e.message);
        }
    }
    
    storeNotification(notification) {
        try {
            const stored = this.getStoredData();
            stored.notifications.push(notification);
            
            // 通知は最新10件のみ保持
            if (stored.notifications.length > 10) {
                stored.notifications.shift();
            }
            
            stored.lastUpdated = Date.now();
            this.saveStoredData(stored);
            
        } catch (e) {
            console.warn('Failed to store notification:', e.message);
        }
    }
    
    loadSession(sessionId) {
        const stored = this.getStoredData();
        return stored.errors.filter(error => error.sessionId === sessionId);
    }
    
    getStoredData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {
                errors: [],
                notifications: [],
                sessions: [],
                lastUpdated: Date.now()
            };
        } catch (e) {
            return {
                errors: [],
                notifications: [],
                sessions: [],
                lastUpdated: Date.now()
            };
        }
    }
    
    saveStoredData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            // ストレージ容量エラーの場合、古いデータを削除
            if (e.name === 'QuotaExceededError') {
                data.errors = data.errors.slice(-100);
                data.notifications = data.notifications.slice(-5);
                localStorage.setItem(this.storageKey, JSON.stringify(data));
            }
        }
    }
    
    cleanup() {
        try {
            const stored = this.getStoredData();
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            // 1週間以上古いエラーを削除
            stored.errors = stored.errors.filter(error => error.timestamp > oneWeekAgo);
            stored.notifications = stored.notifications.filter(n => n.timestamp > oneWeekAgo);
            
            this.saveStoredData(stored);
        } catch (e) {
            console.warn('Failed to cleanup storage:', e.message);
        }
    }
}