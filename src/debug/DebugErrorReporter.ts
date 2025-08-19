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

import type { GameEngine } from '../core/GameEngine';

interface NotificationThresholds {
    critical: number;
    warning: number;
    error: number;
}

interface DeveloperNotificationChannel {
    enabled: boolean;
    maxPerMinute: number;
    recentNotifications: any[];
    channels: string[];
}

interface ErrorContext {
    type?: string;
    component?: string;
    critical?: boolean;
    gameState?: any;
    url?: string;
    userAgent?: string;
    viewport?: {
        width: number;
        height: number;
    };
    browserInfo?: any;
    performanceInfo?: any;
    promise?: Promise<any>;
    element?: string;
    source?: string;
}

interface GameState {
    currentScene?: string;
    gameTime?: number;
    isRunning?: boolean;
    isPaused?: boolean;
    fps?: number;
    bubbleCount?: number;
    score?: number;
    playerHP?: number;
    error?: string;
    message?: string;
}

interface BrowserInfo {
    userAgent: string;
    platform: string;
    language: string;
    cookieEnabled: boolean;
    onLine: boolean;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
    } | null;
}

interface PerformanceInfo {
    memory?: {
        used?: number;
        total?: number;
        limit?: number;
    } | null;
    timing: number;
    navigation?: {
        type?: number;
        redirectCount?: number;
    } | null;
    error?: string;
}

interface EnhancedError {
    id: string;
    sessionId: string;
    timestamp: number;
    message: string;
    stack?: string;
    name: string;
    context: ErrorContext & {
        gameState: GameState | null;
        browserInfo: BrowserInfo;
        performanceInfo: PerformanceInfo;
    };
    fingerprint: string;
    severity: string;
    category: string;
    screenshot?: {
        id: string;
        timestamp: number;
        size: number;
    };
    recovery?: any;
}

interface ErrorPattern {
    count: number;
}

interface NotificationData {
    id: string;
    timestamp: number;
    type: string;
    error: EnhancedError;
    additionalInfo: any;
    sessionId: string;
}

export class DebugErrorReporter extends ErrorHandler {
    public sessionId: string;
    public sessionStartTime: number;
    public errorStorage: ErrorStorage;
    public errorCollector: ErrorCollector;
    public errorAnalyzer: DebugErrorAnalyzer;
    public submissionManager: ErrorSubmissionManager;
    public screenshotCapture: ErrorScreenshotCapture;
    public notificationSystem: DebugErrorNotificationSystem;
    public recoveryTracker: ErrorRecoveryTracker;
    public errorPatterns: Map<string, ErrorPattern>;
    
    private gameEngine: GameEngine;
    private notificationThresholds: NotificationThresholds;
    private patternDetectionEnabled: boolean;
    private developerNotifications: DeveloperNotificationChannel;
    private criticalErrors: Set<string>;

    constructor(gameEngine: GameEngine) {
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
    private initializeErrorReporter(): void {
        this.setupEnhancedErrorCollection();
        this.loadStoredErrors();
        
        console.log(`ErrorReporter initialized - Session: ${this.sessionId}`);
    }
    
    /**
     * 拡張エラー収集の設定
     */
    private setupEnhancedErrorCollection(): void {
        // 既存のエラーハンドリングを拡張
        const originalHandleError = this.handleError.bind(this);
        
        this.handleError = async (error: Error, context: ErrorContext = {}) => {
            // 元のエラーハンドリングを実行
            const result = originalHandleError(error, context);
            
            // 拡張エラー収集を実行（非同期）
            try {
                await this.collectEnhancedError(error, context);
            } catch (collectionError) {
                console.warn('Error collection failed:', (collectionError as Error).message);
            }
            
            return result;
        };
        
        // 追加のエラーキャッチ設定
        this.setupAdditionalErrorCatching();
    }
    
    /**
     * 追加のエラーキャッチ設定
     */
    private setupAdditionalErrorCatching(): void {
        // Promise rejectionのキャッチ
        window.addEventListener('unhandledrejection', async (event) => {
            try {
                await this.collectEnhancedError(new Error(event.reason), {
                    type: 'unhandledrejection',
                    promise: event.promise,
                    gameState: this.captureGameState()
                });
            } catch (e) {
                console.warn('Unhandled rejection collection failed:', (e as Error).message);
            }
        });
        
        // リソース読み込みエラー
        window.addEventListener('error', async (event) => {
            if (event.target !== window) {
                try {
                    const target = event.target as HTMLElement;
                    await this.collectEnhancedError(new Error(`Resource load failed: ${(target as any).src || (target as any).href}`), {
                        type: 'resource_error',
                        element: target.tagName,
                        source: (target as any).src || (target as any).href,
                        gameState: this.captureGameState()
                    });
                } catch (e) {
                    console.warn('Resource error collection failed:', (e as Error).message);
                }
            }
        }, true);
    }
    
    /**
     * 拡張エラー情報の収集（主要メソッド）
     */
    private async collectEnhancedError(error: Error, context: ErrorContext = {}): Promise<EnhancedError> {
        const enhancedError: EnhancedError = {
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
                console.warn('Failed to capture error screenshot:', (screenshotError as Error).message);
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
                console.warn('Recovery attempt failed:', (recoveryError as Error).message);
            }
        }
        
        return enhancedError;
    }
    
    /**
     * 復旧試行の判定
     */
    private shouldAttemptRecovery(error: EnhancedError): boolean {
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
    captureGameState(): GameState | null {
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
            return { error: 'Failed to capture game state', message: (e as Error).message };
        }
    }
    
    /**
     * ブラウザ情報のキャプチャ
     */
    private captureBrowserInfo(): BrowserInfo {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: (navigator as any).deviceMemory,
            connection: (navigator as any).connection ? {
                effectiveType: (navigator as any).connection.effectiveType,
                downlink: (navigator as any).connection.downlink,
                rtt: (navigator as any).connection.rtt
            } : null
        };
    }
    
    /**
     * パフォーマンス情報のキャプチャ
     */
    private capturePerformanceInfo(): PerformanceInfo {
        try {
            const memory = (performance as any).memory;
            return {
                memory: memory ? {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                } : null,
                timing: performance.now(),
                navigation: (performance as any).navigation ? {
                    type: (performance as any).navigation.type,
                    redirectCount: (performance as any).navigation.redirectCount
                } : null
            };
        } catch (e) {
            return { error: 'Failed to capture performance info', timing: performance.now() };
        }
    }
    
    /**
     * エラーフィンガープリントの生成
     */
    private generateErrorFingerprint(error: Error, context: ErrorContext): string {
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
    private calculateSeverity(error: Error, context: ErrorContext): string {
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
    private categorizeError(error: Error, context: ErrorContext): string {
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
    private checkNotificationThreshold(error: EnhancedError): void {
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
    private checkPatternBasedNotification(error: EnhancedError): void {
        const pattern = this.errorPatterns.get(error.fingerprint);
        if (!pattern) return;
        
        const threshold = this.notificationThresholds[error.severity as keyof NotificationThresholds] || 10;
        
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
    private notifyDeveloper(error: EnhancedError, type: string = 'standard', additionalInfo: any = {}): void {
        if (!this.developerNotifications.enabled) return;
        
        // 新しい通知システムを使用
        const notificationSent = this.notificationSystem.processErrorNotification(error as any, type, additionalInfo);
        
        if (notificationSent) {
            // 既存の履歴記録も保持（後方互換性）
            const notification: NotificationData = {
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
    private loadStoredErrors(): void {
        try {
            this.errorStorage.loadSession(this.sessionId);
        } catch (e) {
            console.warn('Failed to load stored errors:', (e as Error).message);
        }
    }
    
    // ========================================
    // 公開API - サブコンポーネントへの委譲
    // ========================================
    
    /**
     * エラーレポートの生成（ErrorAnalyzerに委譲）
     */
    generateErrorReport(timeframe: string = 'session'): any {
        return this.errorAnalyzer.generateReport(timeframe);
    }
    
    /**
     * エラー統計の取得（ErrorAnalyzerに委譲）
     */
    getErrorStatistics(): any {
        return this.errorAnalyzer.getStatistics();
    }
    
    /**
     * エラー検索（ErrorCollectorに委譲）
     */
    searchErrors(query: any): any {
        return this.errorCollector.searchErrors(query);
    }
    
    /**
     * エラー送信（ErrorSubmissionManagerに委譲）
     */
    submitError(error: any, priority: string = 'normal'): any {
        return this.submissionManager.submitError(error, priority);
    }
    
    /**
     * ストレージ統計（ErrorStorageに委譲）
     */
    getStorageStatistics(): any {
        return this.errorStorage.getStorageStatistics();
    }
    
    // ========================================
    // ユーティリティメソッド
    // ========================================
    
    generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateErrorId(): string {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateNotificationId(): string {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    upgradeSeverity(currentSeverity: string): string {
        const levels = ['low', 'medium', 'high', 'critical'];
        const currentIndex = levels.indexOf(currentSeverity);
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
    }
    
    /**
     * 設定の保存
     */
    saveSettings(): void {
        try {
            localStorage.setItem('errorReporter_settings', JSON.stringify(this.developerNotifications));
        } catch (e) {
            console.warn('Failed to save settings:', (e as Error).message);
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        this.saveSettings();
        this.errorStorage?.destroy();
        this.errorCollector = null as any;
        this.errorAnalyzer = null as any;
        this.submissionManager?.destroy();
        this.screenshotCapture?.destroy();
        this.notificationSystem?.destroy();
        this.recoveryTracker?.destroy();
        super.destroy?.();
    }
}