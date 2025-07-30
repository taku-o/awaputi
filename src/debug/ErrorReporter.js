/**
 * Error Reporter
 * 既存のErrorHandlerを拡張した包括的エラー収集・分析・レポートシステム
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ErrorScreenshotCapture } from './ErrorScreenshotCapture.js';
import { ErrorNotificationSystem } from './ErrorNotificationSystem.js';

export class ErrorReporter extends ErrorHandler {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        
        // エラー収集システム
        this.errorCollector = new ErrorCollector(this);
        this.errorAnalyzer = new ErrorAnalyzer(this);
        this.errorStorage = new ErrorStorage(this);
        this.screenshotCapture = new ErrorScreenshotCapture(gameEngine);
        this.notificationSystem = new ErrorNotificationSystem(this);
        
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
        
        // 新しい通知システムを使用
        const notificationSent = this.notificationSystem.processErrorNotification(error, type, additionalInfo);
        
        if (notificationSent) {
            // 既存の履歴記録も保持（後方互換性）
            const notification = {
                id: this.generateNotificationId(),
                timestamp: Date.now(),
                type,
                error,
                additionalInfo,
                sessionId: this.sessionId
            };
            
            this.developerNotifications.recentNotifications.push(notification);
            
            // 履歴サイズ制限
            if (this.developerNotifications.recentNotifications.length > 100) {
                this.developerNotifications.recentNotifications.shift();
            }
        }
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
        this.notificationSystem?.destroy();
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
        
        // 分析設定
        this.analysisConfig = {
            patternSimilarityThreshold: 0.8,
            trendAnalysisWindow: 3600000, // 1時間
            frequencyAnalysisWindow: 1800000, // 30分
            criticalPatternThreshold: 10,
            correlationAnalysisEnabled: true
        };
        
        // 分析データキャッシュ
        this.analysisCache = new Map();
        this.cacheTimeout = 300000; // 5分
        
        // イベント相関分析
        this.eventCorrelations = new Map();
        this.userActionBuffer = [];
        this.maxActionBufferSize = 100;
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
        
        // 相関分析
        if (this.analysisConfig.correlationAnalysisEnabled) {
            this.analyzeCorrelations(error, pattern);
        }
        
        // 類似パターンの検出
        this.detectSimilarPatterns(pattern);
        
        // クリティカルパターンの判定
        this.assessCriticalPattern(pattern);
        
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
    
    /**
     * エラーと他のイベントとの相関分析
     */
    analyzeCorrelations(error, pattern) {
        const correlationKey = `${pattern.fingerprint}_correlations`;
        
        if (!this.eventCorrelations.has(correlationKey)) {
            this.eventCorrelations.set(correlationKey, {
                gameStates: new Map(),
                userActions: new Map(),
                systemEvents: new Map(),
                temporalPatterns: []
            });
        }
        
        const correlations = this.eventCorrelations.get(correlationKey);
        
        // ゲーム状態との相関
        if (error.context.gameState) {
            const gameState = error.context.gameState;
            const stateKey = `${gameState.currentScene}_${gameState.isRunning}_${gameState.isPaused}`;
            
            correlations.gameStates.set(stateKey, 
                (correlations.gameStates.get(stateKey) || 0) + 1
            );
        }
        
        // ユーザーアクション履歴との相関
        const recentActions = this.getRecentUserActions(error.timestamp, 30000); // 30秒以内
        recentActions.forEach(action => {
            correlations.userActions.set(action.type, 
                (correlations.userActions.get(action.type) || 0) + 1
            );
        });
        
        // 時間的パターンの分析
        this.analyzeTemporalPatterns(error, correlations);
    }
    
    /**
     * 類似パターンの検出
     */
    detectSimilarPatterns(currentPattern) {
        const similarities = [];
        
        for (const [fingerprint, pattern] of this.errorReporter.errorPatterns.entries()) {
            if (fingerprint === currentPattern.fingerprint) continue;
            
            const similarity = this.calculatePatternSimilarity(currentPattern, pattern);
            if (similarity > this.analysisConfig.patternSimilarityThreshold) {
                similarities.push({
                    pattern,
                    similarity,
                    potentialDuplicate: similarity > 0.95
                });
            }
        }
        
        if (similarities.length > 0) {
            currentPattern.similarPatterns = similarities;
            
            // 重複パターンの警告
            const duplicates = similarities.filter(s => s.potentialDuplicate);
            if (duplicates.length > 0) {
                console.warn(`Potential duplicate error patterns detected for ${currentPattern.fingerprint}`);
            }
        }
    }
    
    /**
     * クリティカルパターンの評価
     */
    assessCriticalPattern(pattern) {
        let criticalityScore = 0;
        
        // 頻度ベースの評価
        if (pattern.count > this.analysisConfig.criticalPatternThreshold) {
            criticalityScore += 3;
        }
        
        // トレンドベースの評価
        if (pattern.trend === 'increasing') {
            criticalityScore += 2;
        }
        
        // 相関ベースの評価
        const correlationKey = `${pattern.fingerprint}_correlations`;
        const correlations = this.eventCorrelations.get(correlationKey);
        
        if (correlations) {
            // ゲーム実行中のエラーは重要度が高い
            for (const [stateKey, count] of correlations.gameStates.entries()) {
                if (stateKey.includes('true_false') && count > 5) { // 実行中かつ非一時停止
                    criticalityScore += 2;
                }
            }
        }
        
        // 時間的集中度の評価
        const recentErrors = pattern.errors.slice(-10);
        if (recentErrors.length >= 5) {
            const timespan = pattern.lastSeen - pattern.firstSeen;
            const concentration = recentErrors.length / (timespan / 60000); // エラー/分
            
            if (concentration > 1) { // 1分に1回以上
                criticalityScore += 1;
            }
        }
        
        pattern.criticalityScore = criticalityScore;
        pattern.isCritical = criticalityScore >= 5;
        
        if (pattern.isCritical && !pattern.criticalAlertSent) {
            this.sendCriticalPatternAlert(pattern);
            pattern.criticalAlertSent = true;
        }
    }
    
    /**
     * パターン類似度の計算
     */
    calculatePatternSimilarity(pattern1, pattern2) {
        // フィンガープリントの類似度（編集距離ベース）
        const fingerprintSimilarity = this.calculateStringSimilarity(
            pattern1.fingerprint, 
            pattern2.fingerprint
        );
        
        // カテゴリの類似度
        const errors1 = this.getErrorsForPattern(pattern1);
        const errors2 = this.getErrorsForPattern(pattern2);
        
        const categories1 = new Set(errors1.map(e => e.category));
        const categories2 = new Set(errors2.map(e => e.category));
        
        const categoryIntersection = new Set([...categories1].filter(x => categories2.has(x)));
        const categoryUnion = new Set([...categories1, ...categories2]);
        
        const categorySimilarity = categoryIntersection.size / categoryUnion.size;
        
        // 重み付き平均
        return (fingerprintSimilarity * 0.7) + (categorySimilarity * 0.3);
    }
    
    /**
     * 文字列類似度の計算（レーベンシュタイン距離ベース）
     */
    calculateStringSimilarity(str1, str2) {
        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        return maxLength === 0 ? 1 : 1 - (distance / maxLength);
    }
    
    /**
     * レーベンシュタイン距離の計算
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * 時間的パターンの分析
     */
    analyzeTemporalPatterns(error, correlations) {
        const timestamp = error.timestamp;
        const hour = new Date(timestamp).getHours();
        const dayOfWeek = new Date(timestamp).getDay();
        
        correlations.temporalPatterns.push({
            timestamp,
            hour,
            dayOfWeek,
            gameTime: error.context.gameState?.gameTime || 0
        });
        
        // 最新100件のみ保持
        if (correlations.temporalPatterns.length > 100) {
            correlations.temporalPatterns.shift();
        }
    }
    
    /**
     * 最近のユーザーアクションの取得
     */
    getRecentUserActions(timestamp, timeWindow) {
        return this.userActionBuffer.filter(action => 
            timestamp - action.timestamp <= timeWindow
        );
    }
    
    /**
     * パターンに対応するエラーの取得
     */
    getErrorsForPattern(pattern) {
        return this.errorReporter.errorCollector.collectedErrors.filter(error =>
            pattern.errors.includes(error.id)
        );
    }
    
    /**
     * クリティカルパターンアラートの送信
     */
    sendCriticalPatternAlert(pattern) {
        const alert = {
            type: 'critical_pattern',
            pattern: {
                fingerprint: pattern.fingerprint,
                count: pattern.count,
                criticalityScore: pattern.criticalityScore,
                trend: pattern.trend
            },
            timestamp: Date.now(),
            recommendations: this.generatePatternRecommendations(pattern)
        };
        
        console.error('🚨 CRITICAL ERROR PATTERN DETECTED:', alert);
        
        // 開発者通知システムとの統合
        if (this.errorReporter.developerNotifications.enabled) {
            this.errorReporter.notifyDeveloper(
                new Error(`Critical pattern: ${pattern.fingerprint}`),
                'critical_pattern',
                alert
            );
        }
    }
    
    /**
     * パターン固有の推奨事項生成
     */
    generatePatternRecommendations(pattern) {
        const recommendations = [];
        const errors = this.getErrorsForPattern(pattern);
        
        // 頻度ベースの推奨事項
        if (pattern.count > 20) {
            recommendations.push({
                type: 'high_frequency',
                priority: 'critical',
                message: `エラーパターンが${pattern.count}回発生しています`,
                action: '根本原因の調査と修正を最優先で実施してください'
            });
        }
        
        // 相関ベースの推奨事項
        const correlationKey = `${pattern.fingerprint}_correlations`;
        const correlations = this.eventCorrelations.get(correlationKey);
        
        if (correlations) {
            // 特定のゲーム状態で多発している場合
            const topGameState = [...correlations.gameStates.entries()]
                .sort((a, b) => b[1] - a[1])[0];
                
            if (topGameState && topGameState[1] > pattern.count * 0.7) {
                recommendations.push({
                    type: 'state_correlation',
                    priority: 'high',
                    message: `特定のゲーム状態(${topGameState[0]})でエラーが集中しています`,
                    action: 'この状態での処理ロジックを重点的に確認してください'
                });
            }
        }
        
        // カテゴリベースの推奨事項
        const categories = [...new Set(errors.map(e => e.category))];
        if (categories.length === 1) {
            const category = categories[0];
            recommendations.push({
                type: 'category_specific',
                priority: 'medium',
                message: `全て${category}カテゴリのエラーです`,
                action: `${category}システムの包括的な診断を実施してください`
            });
        }
        
        return recommendations;
    }
    
    /**
     * ユーザーアクションの記録
     */
    recordUserAction(actionType, context = {}) {
        this.userActionBuffer.push({
            type: actionType,
            timestamp: Date.now(),
            context
        });
        
        // バッファサイズの制限
        if (this.userActionBuffer.length > this.maxActionBufferSize) {
            this.userActionBuffer.shift();
        }
    }
    
    /**
     * 高度な分析レポートの生成
     */
    generateAdvancedAnalysisReport() {
        const patterns = Array.from(this.errorReporter.errorPatterns.values());
        
        return {
            timestamp: Date.now(),
            summary: {
                totalPatterns: patterns.length,
                criticalPatterns: patterns.filter(p => p.isCritical).length,
                increasingTrends: patterns.filter(p => p.trend === 'increasing').length
            },
            criticalPatterns: patterns
                .filter(p => p.isCritical)
                .sort((a, b) => b.criticalityScore - a.criticalityScore)
                .slice(0, 10),
            similarityAnalysis: this.generateSimilarityReport(patterns),
            correlationAnalysis: this.generateCorrelationReport(),
            temporalAnalysis: this.generateTemporalReport(),
            recommendations: this.generateAdvancedRecommendations(patterns)
        };
    }
    
    /**
     * 類似度分析レポートの生成
     */
    generateSimilarityReport(patterns) {
        const similarityGroups = [];
        const processed = new Set();
        
        patterns.forEach(pattern => {
            if (processed.has(pattern.fingerprint)) return;
            
            const similar = patterns.filter(p => 
                !processed.has(p.fingerprint) && 
                p.similarPatterns?.some(sp => sp.similarity > 0.8)
            );
            
            if (similar.length > 1) {
                similarityGroups.push({
                    representative: pattern.fingerprint,
                    patterns: similar.map(p => p.fingerprint),
                    avgSimilarity: similar.reduce((sum, p) => {
                        const sim = p.similarPatterns?.find(sp => 
                            sp.pattern.fingerprint === pattern.fingerprint
                        );
                        return sum + (sim?.similarity || 0);
                    }, 0) / similar.length
                });
                
                similar.forEach(p => processed.add(p.fingerprint));
            }
        });
        
        return {
            totalGroups: similarityGroups.length,
            groups: similarityGroups,
            potentialDuplicates: similarityGroups.filter(g => g.avgSimilarity > 0.95).length
        };
    }
    
    /**
     * 相関分析レポートの生成
     */
    generateCorrelationReport() {
        const correlationSummary = {
            gameStateCorrelations: new Map(),
            userActionCorrelations: new Map(),
            strongCorrelations: []
        };
        
        for (const [key, correlations] of this.eventCorrelations.entries()) {
            // ゲーム状態相関の統計
            for (const [state, count] of correlations.gameStates.entries()) {
                correlationSummary.gameStateCorrelations.set(state, 
                    (correlationSummary.gameStateCorrelations.get(state) || 0) + count
                );
            }
            
            // ユーザーアクション相関の統計  
            for (const [action, count] of correlations.userActions.entries()) {
                correlationSummary.userActionCorrelations.set(action,
                    (correlationSummary.userActionCorrelations.get(action) || 0) + count
                );
            }
            
            // 強い相関の検出
            const topGameState = [...correlations.gameStates.entries()]
                .sort((a, b) => b[1] - a[1])[0];
                
            if (topGameState && topGameState[1] > 10) {
                correlationSummary.strongCorrelations.push({
                    pattern: key,
                    type: 'gameState',
                    correlatedWith: topGameState[0],
                    strength: topGameState[1]
                });
            }
        }
        
        return correlationSummary;
    }
    
    /**
     * 時間的分析レポートの生成
     */
    generateTemporalReport() {
        const temporalData = {
            hourlyDistribution: new Array(24).fill(0),
            dailyDistribution: new Array(7).fill(0),
            peakHours: [],
            peakDays: []
        };
        
        for (const correlations of this.eventCorrelations.values()) {
            correlations.temporalPatterns.forEach(pattern => {
                temporalData.hourlyDistribution[pattern.hour]++;
                temporalData.dailyDistribution[pattern.dayOfWeek]++;
            });
        }
        
        // ピーク時間の特定
        const avgHourly = temporalData.hourlyDistribution.reduce((a, b) => a + b, 0) / 24;
        temporalData.peakHours = temporalData.hourlyDistribution
            .map((count, hour) => ({ hour, count }))
            .filter(h => h.count > avgHourly * 1.5)
            .sort((a, b) => b.count - a.count);
            
        // ピーク曜日の特定
        const avgDaily = temporalData.dailyDistribution.reduce((a, b) => a + b, 0) / 7;
        temporalData.peakDays = temporalData.dailyDistribution
            .map((count, day) => ({ day, count }))
            .filter(d => d.count > avgDaily * 1.5)
            .sort((a, b) => b.count - a.count);
        
        return temporalData;
    }
    
    /**
     * 高度な推奨事項の生成
     */
    generateAdvancedRecommendations(patterns) {
        const recommendations = [];
        
        // クリティカルパターンの推奨事項
        const criticalPatterns = patterns.filter(p => p.isCritical);
        if (criticalPatterns.length > 0) {
            recommendations.push({
                type: 'critical_patterns',
                priority: 'critical',
                count: criticalPatterns.length,
                message: `${criticalPatterns.length}個のクリティカルエラーパターンが検出されました`,
                action: '緊急対応が必要です。開発チームに即座に報告してください',
                details: criticalPatterns.slice(0, 5).map(p => ({
                    pattern: p.fingerprint,
                    score: p.criticalityScore,
                    count: p.count
                }))
            });
        }
        
        // 類似パターンの推奨事項
        const similarPatterns = patterns.filter(p => p.similarPatterns?.length > 0);
        if (similarPatterns.length > 0) {
            recommendations.push({
                type: 'pattern_consolidation',
                priority: 'medium',
                count: similarPatterns.length,
                message: '類似のエラーパターンが検出されました',
                action: 'パターンの統合と根本原因の調査を検討してください'
            });
        }
        
        return recommendations;
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