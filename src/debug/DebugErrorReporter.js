/**
 * Debug Error Reporter
 * 既存のErrorHandlerを拡張したデバッグ用包括的エラー収集・分析・レポートシステム（Main Controller）
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ErrorScreenshotCapture } from './ErrorScreenshotCapture.js';
import { DebugErrorNotificationSystem } from './DebugErrorNotificationSystem.js';
import { ErrorRecoveryTracker } from './ErrorRecoveryTracker.js';

// サブコンポーネントのインポート
import { ErrorCollector } from './error-reporter/ErrorCollector.js';
import { DebugErrorAnalyzer } from './error-reporter/DebugErrorAnalyzer.js';
import { ErrorSubmissionManager } from './error-reporter/ErrorSubmissionManager.js';
import { ErrorStorage } from './error-reporter/ErrorStorage.js';

export class DebugErrorReporter extends ErrorHandler {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        
        // セッション管理
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        
        // サブコンポーネントを初期化（依存性注入）
        this.errorStorage = new ErrorStorage(this);
        this.errorCollector = new ErrorCollector(this);
        this.errorAnalyzer = new DebugErrorAnalyzer(this);
        this.submissionManager = new ErrorSubmissionManager(this);
        
        // 既存の統合コンポーネント
        this.screenshotCapture = new ErrorScreenshotCapture(gameEngine);
        this.notificationSystem = new DebugErrorNotificationSystem(this);
        this.recoveryTracker = new ErrorRecoveryTracker(this);
        
        // 通知システム設定
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
        
        // クリティカルエラー定義
        this.criticalErrors = new Set([
            'TypeError',
            'ReferenceError',
            'OutOfMemoryError',
            'SecurityError'
        ]);
        
        this.initializeErrorReporter();
    }
    
    /**
     * ErrorReporter固有の初期化
     */
    initializeErrorReporter() {
        this.setupEnhancedErrorCollection();
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
     * 拡張エラー情報の収集（主要メソッド）
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
        
        // サブコンポーネントに処理を委譲
        this.errorCollector.collect(enhancedError);
        
        // パターン分析
        if (this.patternDetectionEnabled) {
            this.errorAnalyzer.analyzePattern(enhancedError);
        }
        
        // 通知判定
        this.checkNotificationThreshold(enhancedError);
        
        // 復旧可能性の評価と復旧試行
        if (this.shouldAttemptRecovery(enhancedError)) {
            try {
                const recoveryResult = await this.recoveryTracker.attemptRecovery(enhancedError, context);
                enhancedError.recovery = recoveryResult;
                
                if (recoveryResult.success) {
                    console.log(`🔧 Error recovery successful: ${recoveryResult.result}`);
                }
            } catch (recoveryError) {
                console.warn('Recovery attempt failed:', recoveryError.message);
            }
        }
        
        return enhancedError;
    }
    
    /**
     * 復旧試行の判定
     */
    shouldAttemptRecovery(error) {
        // クリティカルまたは高重要度エラーの場合
        if (['critical', 'high'].includes(error.severity)) {
            return true;
        }
        
        // ゲーム実行中のエラーの場合
        if (error.context.gameState?.isRunning === true) {
            return true;
        }
        
        // 特定カテゴリのエラー
        const recoverableCategories = ['rendering', 'audio', 'memory', 'storage', 'network'];
        if (recoverableCategories.includes(error.category)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * ゲーム状態のキャプチャ
     */
    captureGameState() {
        if (!this.gameEngine) return null;
        
        try {
            if (!this.gameEngine) {
                return {
                    currentScene: 'unknown',
                    gameTime: 0,
                    isRunning: false,
                    isPaused: false,
                    fps: 0,
                    bubbleCount: 0,
                    score: 0,
                    playerHP: 0
                };
            }
            
            return {
                currentScene: this.gameEngine.sceneManager?.currentScene?.constructor.name || 'unknown',
                gameTime: this.gameEngine.gameTime || 0,
                isRunning: this.gameEngine.isRunning || false,
                isPaused: this.gameEngine.isPaused || false,
                fps: this.gameEngine.performanceOptimizer?.getTargetFPS?.() || this.gameEngine.configurationManager?.get('performance.targetFPS') || 60,
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
     * ストレージからエラーデータを読み込み
     */
    loadStoredErrors() {
        try {
            this.errorStorage.loadSession(this.sessionId);
        } catch (e) {
            console.warn('Failed to load stored errors:', e.message);
        }
    }
    
    // ========================================
    // 公開API - サブコンポーネントへの委譲
    // ========================================
    
    /**
     * エラーレポートの生成（ErrorAnalyzerに委譲）
     */
    generateErrorReport(timeframe = 'session') {
        return this.errorAnalyzer.generateReport(timeframe);
    }
    
    /**
     * エラー統計の取得（ErrorAnalyzerに委譲）
     */
    getErrorStatistics() {
        return this.errorAnalyzer.getStatistics();
    }
    
    /**
     * エラー検索（ErrorCollectorに委譲）
     */
    searchErrors(query) {
        return this.errorCollector.searchErrors(query);
    }
    
    /**
     * エラー送信（ErrorSubmissionManagerに委譲）
     */
    submitError(error, priority = 'normal') {
        return this.submissionManager.submitError(error, priority);
    }
    
    /**
     * ストレージ統計（ErrorStorageに委譲）
     */
    getStorageStatistics() {
        return this.errorStorage.getStorageStatistics();
    }
    
    // ========================================
    // ユーティリティメソッド
    // ========================================
    
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
        this.errorStorage?.destroy();
        this.errorCollector = null;
        this.errorAnalyzer = null;
        this.submissionManager?.destroy();
        this.screenshotCapture?.destroy();
        this.notificationSystem?.destroy();
        this.recoveryTracker?.destroy();
        super.destroy?.();
    }
}