/**
 * Performance Threshold Monitor
 * パフォーマンス閾値監視・警告システム
 */
import { getErrorHandler } from '../utils/ErrorHandler.js';

interface ErrorHandler {
    handleError: (error: Error, context: string) => void;
}

interface ThresholdConfig {
    metric: string;
    warning: number;
    critical: number;
    evaluateBelow: boolean;
    unit: string;
    description: string;
    suggestions: string[];
    enabled?: boolean;
}

interface WarningSystem {
    notifications: Notification[];
    maxNotifications: number;
    alertQueue: Alert[];
    alertHistory: Alert[];
    suppressionRules: Map<string, number>;
    escalationLevels: Map<string, EscalationLevel>;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    severity: 'warning' | 'critical';
    timestamp: number;
    persistent: boolean;
    acknowledged?: boolean;
    actions: NotificationAction[];
}

interface NotificationAction {
    label: string;
    action: () => void;
}

interface Alert {
    id: string;
    name: string;
    metric: string;
    description: string;
    value: number;
    threshold: number;
    severity: 'warning' | 'critical';
    unit: string;
    timestamp: number;
    suggestions: string[];
    acknowledged: boolean;
    escalated: boolean;
}

interface EscalationLevel {
    level: number;
    timestamp: number;
    nextEscalation: number;
}

interface SuggestionEngine {
    suggestions: Map<string, Suggestion>;
    suggestionHistory: Suggestion[];
    maxSuggestions: number;
    cooldownPeriod: number;
}

interface Suggestion {
    id: string;
    alert: string;
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    category: string;
    timestamp: number;
    applied: boolean;
    effectiveness: number | null;
}

interface MonitoringState {
    enabled: boolean;
    intervalId: number | null;
    checkInterval: number;
    lastCheck: number;
    suppressionTimeout: number;
    criticalAlertTimeout: number;
}

interface Statistics {
    totalChecks: number;
    warningsTriggered: number;
    criticalAlertsTriggered: number;
    suggestionsGenerated: number;
    falsePositives: number;
    thresholdViolations: Map<string, ViolationStats>;
}

interface ViolationStats {
    warning: number;
    critical: number;
    lastViolation: number;
}

interface PerformanceMonitor {
    getCurrentMetrics: () => PerformanceMetrics;
}

interface PerformanceMetrics {
    frame?: {
        currentFPS?: number;
        frameTime?: number;
        fpsVariance?: number;
    };
    memory?: {
        usedMemory?: number;
        pressureLevel?: number;
    };
    render?: {
        drawCalls?: number;
    };
    game?: {
        entityCount?: number;
    };
}

interface Settings {
    checkInterval?: number;
    suppressionTimeout?: number;
    maxNotifications?: number;
}
type SeverityLevel = 'normal' | 'warning' | 'critical';

export class PerformanceThresholdMonitor {
    private monitor: PerformanceMonitor;
    private errorHandler: ErrorHandler | null;
    private thresholds: Map<string, ThresholdConfig>;
    private warningSystem: WarningSystem;
    private monitoring: MonitoringState;
    private suggestionEngine: SuggestionEngine;
    private statistics: Statistics;
    private visibilityChangeHandler?: () => void;

    constructor(monitor: PerformanceMonitor) {
        this.monitor = monitor;
        this.errorHandler = null;
        
        // 閾値設定
        this.thresholds = new Map();
        this.setupDefaultThresholds();
        
        // 警告システム
        this.warningSystem = {
            notifications: [],
            maxNotifications: 50,
            alertQueue: [],
            alertHistory: [],
            suppressionRules: new Map(),
            escalationLevels: new Map()
        };
        
        // 監視状態
        this.monitoring = {
            enabled: true,
            intervalId: null,
            checkInterval: 1000, // 1秒ごと
            lastCheck: 0,
            suppressionTimeout: 5000, // 5秒間同じ警告を抑制
            criticalAlertTimeout: 30000 // 30秒間重要な警告を記憶
        };
        
        // 提案エンジン
        this.suggestionEngine = {
            suggestions: new Map(),
            suggestionHistory: [],
            maxSuggestions: 10,
            cooldownPeriod: 60000 // 1分間同じ提案を抑制
        };
        
        // 統計
        this.statistics = {
            totalChecks: 0,
            warningsTriggered: 0,
            criticalAlertsTriggered: 0,
            suggestionsGenerated: 0,
            falsePositives: 0,
            thresholdViolations: new Map()
        };
        
        this.initialize();
    }

    private initialize(): void {
        this.setupErrorHandler();
        this.startMonitoring();
        this.setupEventListeners();
        console.log('[PerformanceThresholdMonitor] Threshold monitoring initialized');
    }

    /**
     * エラーハンドラ設定
     */
    private setupErrorHandler(): void {
        try {
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[PerformanceThresholdMonitor] ErrorHandler not available:', (error as Error).message);
            this.errorHandler = {
                handleError: (error: Error, context: string) => console.error(`[${context}]`, error)
            };
        }
    }

    /**
     * デフォルト閾値設定
     */
    private setupDefaultThresholds(): void {
        this.thresholds.set('fps', {
            metric: 'frame.currentFPS',
            warning: 45,
            critical: 30,
            evaluateBelow: true,
            unit: 'fps',
            description: 'Frame rate performance',
            suggestions: [
                'Reduce particle effects quality',
                'Decrease bubble count limit',
                'Optimize rendering pipeline',
                'Enable performance mode'
            ]
        });

        // フレーム時間閾値
        this.thresholds.set('frameTime', {
            metric: 'frame.frameTime',
            warning: 20,
            critical: 33.33,
            evaluateBelow: false,
            unit: 'ms',
            description: 'Frame processing time',
            suggestions: [
                'Optimize game loop performance',
                'Reduce complex calculations per frame',
                'Use object pooling for frequent allocations',
                'Profile and optimize hot code paths'
            ]
        });

        // メモリ使用量閾値
        this.thresholds.set('memory', {
            metric: 'memory.usedMemory',
            warning: 150,
            critical: 200,
            evaluateBelow: false,
            unit: 'MB',
            description: 'Memory usage',
            suggestions: [
                'Clear unused object references',
                'Optimize texture memory usage',
                'Implement aggressive garbage collection',
                'Reduce cached data size'
            ]
        });

        // メモリ圧迫度閾値
        this.thresholds.set('memoryPressure', {
            metric: 'memory.pressureLevel',
            warning: 0.7,
            critical: 0.85,
            evaluateBelow: false,
            unit: 'ratio',
            description: 'Memory pressure level',
            suggestions: [
                'Force garbage collection',
                'Release non-essential caches',
                'Reduce memory allocation rate',
                'Monitor for memory leaks'
            ]
        });

        // 描画コール数閾値
        this.thresholds.set('drawCalls', {
            metric: 'render.drawCalls',
            warning: 300,
            critical: 500,
            evaluateBelow: false,
            unit: 'calls',
            description: 'Draw call count',
            suggestions: [
                'Implement draw call batching',
                'Reduce number of separate objects',
                'Use instanced rendering',
                'Optimize texture atlas usage'
            ]
        });

        // エンティティ数閾値
        this.thresholds.set('entityCount', {
            metric: 'game.entityCount',
            warning: 500,
            critical: 800,
            evaluateBelow: false,
            unit: 'entities',
            description: 'Total entity count',
            suggestions: [
                'Implement entity culling',
                'Reduce maximum entity limits',
                'Optimize entity lifecycle management',
                'Use spatial partitioning for entities'
            ]
        });

        // フレーム分散閾値
        this.thresholds.set('frameVariance', {
            metric: 'frame.fpsVariance',
            warning: 10,
            critical: 20,
            evaluateBelow: false,
            unit: 'fps',
            description: 'Frame rate variance',
            suggestions: [
                'Smooth frame time variations',
                'Implement frame pacing',
                'Reduce CPU spikes',
                'Optimize resource loading'
            ]
        });
        
        console.log(`[PerformanceThresholdMonitor] ${this.thresholds.size} default thresholds configured`);
    }

    /**
     * カスタム閾値設定
     */
    public setThreshold(name: string, config: Partial<ThresholdConfig>): void {
        const threshold: ThresholdConfig = {
            metric: config.metric || '',
            warning: config.warning || 0,
            critical: config.critical || 0,
            evaluateBelow: config.evaluateBelow || false,
            unit: config.unit || '',
            description: config.description || name,
            suggestions: config.suggestions || [],
            enabled: config.enabled !== false
        };
        this.thresholds.set(name, threshold);
        console.log(`[PerformanceThresholdMonitor] Threshold '${name}' configured`);
    }

    /**
     * 閾値監視開始
     */
    public startMonitoring(): void {
        if (this.monitoring.intervalId) {
            clearInterval(this.monitoring.intervalId);
        }

        this.monitoring.intervalId = window.setInterval(() => {
            if (this.monitoring.enabled) {
                this.checkThresholds();
            }
        }, this.monitoring.checkInterval);

        console.log('[PerformanceThresholdMonitor] Monitoring started');
    }

    /**
     * 閾値監視停止
     */
    public stopMonitoring(): void {
        if (this.monitoring.intervalId) {
            clearInterval(this.monitoring.intervalId);
            this.monitoring.intervalId = null;
        }

        console.log('[PerformanceThresholdMonitor] Monitoring stopped');
    }

    /**
     * 閾値チェック実行
     */
    private checkThresholds(): void {
        const now = Date.now();
        this.monitoring.lastCheck = now;
        this.statistics.totalChecks++;

        try {
            const metrics = this.monitor.getCurrentMetrics();
            this.thresholds.forEach((threshold, name) => {
                if (!threshold.enabled) return;
                
                const value = this.getMetricValue(metrics, threshold.metric);
                if (value === null || value === undefined) return;
                
                this.evaluateThreshold(name, threshold, value, now);
            });

            // 警告処理
            this.processAlertQueue();
            
            // 古い通知のクリーンアップ
            this.cleanupOldNotifications(now);

        } catch (error) {
            this.errorHandler?.handleError(error as Error, 'PerformanceThresholdMonitor.checkThresholds');
        }
    }

    /**
     * メトリクス値取得
     */
    private getMetricValue(metrics: PerformanceMetrics, metricPath: string): number | null {
        const parts = metricPath.split('.');
        let value: any = metrics;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return null;
            }
        }

        return typeof value === 'number' ? value : null;
    }

    /**
     * 閾値評価
     */
    private evaluateThreshold(name: string, threshold: ThresholdConfig, value: number, timestamp: number): void {
        let severity: SeverityLevel = 'normal';
        let violated = false;

        if (threshold.evaluateBelow) {
            // 値が閾値より小さい場合に警告（FPS等）
            if (value <= threshold.critical) {
                severity = 'critical';
                violated = true;
            } else if (value <= threshold.warning) {
                severity = 'warning';
                violated = true;
            }
        } else {
            // 値が閾値より大きい場合に警告（メモリ、フレーム時間等）
            if (value >= threshold.critical) {
                severity = 'critical';
                violated = true;
            } else if (value >= threshold.warning) {
                severity = 'warning';
                violated = true;
            }
        }

        // 違反統計更新
        if (violated) {
            this.updateViolationStatistics(name, severity as 'warning' | 'critical');
        }

        // 警告生成
        if (violated && !this.isSuppressed(name, severity as 'warning' | 'critical')) {
            this.generateAlert(name, threshold, value, severity as 'warning' | 'critical', timestamp);
        }
    }

    /**
     * 違反統計更新
     */
    private updateViolationStatistics(name: string, severity: 'warning' | 'critical'): void {
        if (!this.statistics.thresholdViolations.has(name)) {
            this.statistics.thresholdViolations.set(name, {
                warning: 0,
                critical: 0,
                lastViolation: 0
            });
        }

        const stats = this.statistics.thresholdViolations.get(name)!;
        stats[severity]++;
        stats.lastViolation = Date.now();
        
        if (severity === 'warning') {
            this.statistics.warningsTriggered++;
        } else if (severity === 'critical') {
            this.statistics.criticalAlertsTriggered++;
        }
    }

    /**
     * 警告生成
     */
    private generateAlert(name: string, threshold: ThresholdConfig, value: number, severity: 'warning' | 'critical', timestamp: number): void {
        const alert: Alert = {
            id: `${name}_${timestamp}`,
            name: name,
            metric: threshold.metric,
            description: threshold.description,
            value: value,
            threshold: severity === 'critical' ? threshold.critical : threshold.warning,
            severity: severity,
            unit: threshold.unit,
            timestamp: timestamp,
            suggestions: threshold.suggestions || [],
            acknowledged: false,
            escalated: false
        };

        this.warningSystem.alertQueue.push(alert);
        this.warningSystem.alertHistory.push(alert);

        // 抑制ルール設定
        this.setSuppression(name, severity, timestamp);

        console.log(`[PerformanceThresholdMonitor] ${severity.toUpperCase()} alert: ${name} = ${value}${threshold.unit}`);
    }

    /**
     * 抑制チェック
     */
    private isSuppressed(name: string, severity: 'warning' | 'critical'): boolean {
        const key = `${name}_${severity}`;
        const suppressionEnd = this.warningSystem.suppressionRules.get(key);
        
        if (suppressionEnd && Date.now() < suppressionEnd) {
            return true;
        }

        if (suppressionEnd) {
            this.warningSystem.suppressionRules.delete(key);
        }

        return false;
    }

    /**
     * 抑制設定
     */
    private setSuppression(name: string, severity: 'warning' | 'critical', timestamp: number): void {
        const key = `${name}_${severity}`;
        const suppressionDuration = severity === 'critical' ? 
            this.monitoring.criticalAlertTimeout : this.monitoring.suppressionTimeout;
        this.warningSystem.suppressionRules.set(key, timestamp + suppressionDuration);
    }

    /**
     * 警告キュー処理
     */
    private processAlertQueue(): void {
        while (this.warningSystem.alertQueue.length > 0) {
            const alert = this.warningSystem.alertQueue.shift()!;
            
            // 通知作成
            this.createNotification(alert);
            // 提案生成
            this.generateSuggestions(alert);
            
            // エスカレーション処理
            if (alert.severity === 'critical') {
                this.handleCriticalAlert(alert);
            }
        }
    }
    /**
     * 通知作成
     */
    private createNotification(alert: Alert): void {
        const notification: Notification = {
            id: alert.id,
            title: `Performance ${alert.severity.toUpperCase()}`,
            message: `${alert.description}: ${alert.value.toFixed(2)}${alert.unit} (threshold: ${alert.threshold}${alert.unit})`,
            severity: alert.severity,
            timestamp: alert.timestamp,
            persistent: alert.severity === 'critical',
            actions: [
                {
                    label: 'View Details',
                    action: () => this.showAlertDetails(alert)
                },
                {
                    label: 'Acknowledge',
                    action: () => this.acknowledgeAlert(alert.id)
                }
            ]
        };

        this.warningSystem.notifications.push(notification);

        // 通知数制限
        if (this.warningSystem.notifications.length > this.warningSystem.maxNotifications) {
            this.warningSystem.notifications.shift();
        }

        // ブラウザ通知（許可されている場合）
        this.showBrowserNotification(notification);
    }

    /**
     * ブラウザ通知表示
     */
    private showBrowserNotification(notification: Notification): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: this.getNotificationIcon(notification.severity),
                tag: notification.id
            });
        }
    }

    /**
     * アイコン取得
     */
    private getNotificationIcon(severity: 'warning' | 'critical'): string {
        const icons = {
            warning: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>',
            critical: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
        };
        return icons[severity] || icons.warning;
    }

    /**
     * 提案生成
     */
    private generateSuggestions(alert: Alert): void {
        if (!alert.suggestions || alert.suggestions.length === 0) return;

        const suggestions = alert.suggestions.map(suggestion => ({
            id: `${alert.name}_${Date.now()}_${Math.random()}`,
            alert: alert.id,
            type: 'performance',
            priority: (alert.severity === 'critical' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
            title: `${alert.description} Optimization`,
            description: suggestion,
            category: this.categorizeSuggestion(suggestion),
            timestamp: Date.now(),
            applied: false,
            effectiveness: null
        }));

        suggestions.forEach(suggestion => {
            if (!this.isSuggestionInCooldown(suggestion)) {
                this.suggestionEngine.suggestions.set(suggestion.id, suggestion);
                this.suggestionEngine.suggestionHistory.push(suggestion);
                this.statistics.suggestionsGenerated++;
            }
        });

        // 提案数制限
        if (this.suggestionEngine.suggestions.size > this.suggestionEngine.maxSuggestions) {
            const oldestId = this.suggestionEngine.suggestions.keys().next().value;
            this.suggestionEngine.suggestions.delete(oldestId);
        }
    }

    /**
     * 提案カテゴリ分類
     */
    private categorizeSuggestion(suggestion: string): string {
        const categories: Record<string, string[]> = {
            'rendering': ['render', 'draw', 'texture', 'batch'],
            'memory': ['memory', 'cache', 'garbage', 'allocation'],
            'performance': ['optimize', 'performance', 'efficient'],
            'entities': ['entity', 'object', 'culling', 'spatial'],
            'effects': ['particle', 'effect', 'quality']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => suggestion.toLowerCase().includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    /**
     * 提案クールダウンチェック
     */
    private isSuggestionInCooldown(suggestion: Suggestion): boolean {
        const similar = this.suggestionEngine.suggestionHistory.filter(s =>
            s.description === suggestion.description &&
            Date.now() - s.timestamp < this.suggestionEngine.cooldownPeriod
        );

        return similar.length > 0;
    }

    /**
     * 重要警告処理
     */
    private handleCriticalAlert(alert: Alert): void {
        // エスカレーション設定
        this.warningSystem.escalationLevels.set(alert.id, {
            level: 1,
            timestamp: Date.now(),
            nextEscalation: Date.now() + 30000 // 30秒後
        });
        
        // 自動修復試行
        this.attemptAutoRecovery(alert);
    }

    /**
     * 自動修復試行
     */
    private attemptAutoRecovery(alert: Alert): void {
        const recoveryActions: Record<string, () => void> = {
            'fps': () => {
                console.log('[PerformanceThresholdMonitor] Attempting FPS recovery: reducing quality');
                // Quality reduction logic would go here
            },
            'memory': () => {
                console.log('[PerformanceThresholdMonitor] Attempting memory recovery: force GC');
                if ((window as any).gc) {
                    (window as any).gc();
                }
            },
            'memoryPressure': () => {
                console.log('[PerformanceThresholdMonitor] Attempting memory pressure recovery: clearing caches');
                // Cache clearing logic would go here
            }
        };

        const action = recoveryActions[alert.name];
        if (action) {
            try {
                action();
                console.log(`[PerformanceThresholdMonitor] Auto-recovery attempted for ${alert.name}`);
            } catch (error) {
                console.error(`[PerformanceThresholdMonitor] Auto-recovery failed for ${alert.name}:`, error);
            }
        }
    }

    /**
     * 警告確認
     */
    public acknowledgeAlert(alertId: string): void {
        const alert = this.warningSystem.alertHistory.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            console.log(`[PerformanceThresholdMonitor] Alert acknowledged: ${alertId}`);
        }

        // 通知からも削除
        const notificationIndex = this.warningSystem.notifications.findIndex(n => n.id === alertId);
        if (notificationIndex >= 0) {
            this.warningSystem.notifications.splice(notificationIndex, 1);
        }
    }

    /**
     * 警告詳細表示
     */
    public showAlertDetails(alert: Alert): void {
        console.log('[PerformanceThresholdMonitor] Alert Details:', {
            name: alert.name,
            description: alert.description,
            value: alert.value,
            threshold: alert.threshold,
            severity: alert.severity,
            timestamp: new Date(alert.timestamp).toLocaleString(),
            suggestions: alert.suggestions
        });
    }

    /**
     * 古い通知クリーンアップ
     */
    private cleanupOldNotifications(currentTime: number): void {
        const maxAge = 5 * 60 * 1000; // 5分

        this.warningSystem.notifications = this.warningSystem.notifications.filter(
            notification => !notification.persistent &&
                           currentTime - notification.timestamp < maxAge
        );

        this.warningSystem.alertHistory = this.warningSystem.alertHistory.filter(
            alert => currentTime - alert.timestamp < 60 * 60 * 1000 // 1時間
        );
    }

    /**
     * イベントリスナー設定
     */
    private setupEventListeners(): void {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log(`[PerformanceThresholdMonitor] Notification permission: ${permission}`);
            });
        }

        // ページ非表示時の処理
        this.visibilityChangeHandler = () => {
            if (document.hidden) {
                this.monitoring.enabled = false;
            } else {
                this.monitoring.enabled = true;
            }
        };

        document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }

    /**
     * パブリックAPI
     */
    public getCurrentAlerts(): Notification[] {
        return this.warningSystem.notifications.filter(n => !n.acknowledged);
    }

    public getAllAlerts(): Alert[] {
        return [...this.warningSystem.alertHistory];
    }

    public getCurrentSuggestions(): Suggestion[] {
        return Array.from(this.suggestionEngine.suggestions.values())
            .filter(s => !s.applied)
            .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
    }

    public getThresholdConfiguration(): Record<string, ThresholdConfig> {
        return Object.fromEntries(
            Array.from(this.thresholds.entries()).map(([name, config]) => [name, { ...config }])
        );
    }

    public getStatistics(): any {
        return {
            ...this.statistics,
            thresholdViolations: Object.fromEntries(this.statistics.thresholdViolations),
            monitoring: {
                enabled: this.monitoring.enabled,
                lastCheck: this.monitoring.lastCheck,
                checkInterval: this.monitoring.checkInterval
            },
            notifications: this.warningSystem.notifications.length,
            activeSuggestions: this.suggestionEngine.suggestions.size
        };
    }
    /**
     * 設定更新
     */
    public updateSettings(settings: Settings): void {
        if (settings.checkInterval) {
            this.monitoring.checkInterval = settings.checkInterval;
            this.stopMonitoring();
            this.startMonitoring();
        }

        if (settings.suppressionTimeout) {
            this.monitoring.suppressionTimeout = settings.suppressionTimeout;
        }

        if (settings.maxNotifications) {
            this.warningSystem.maxNotifications = settings.maxNotifications;
        }

        console.log('[PerformanceThresholdMonitor] Settings updated');
    }

    /**
     * リセット
     */
    public reset(): void {
        this.warningSystem.notifications = [];
        this.warningSystem.alertQueue = [];
        this.warningSystem.alertHistory = [];
        this.warningSystem.suppressionRules.clear();
        this.warningSystem.escalationLevels.clear();
        this.suggestionEngine.suggestions.clear();
        this.suggestionEngine.suggestionHistory = [];
        
        this.statistics = {
            totalChecks: 0,
            warningsTriggered: 0,
            criticalAlertsTriggered: 0,
            suggestionsGenerated: 0,
            falsePositives: 0,
            thresholdViolations: new Map()
        };
        
        console.log('[PerformanceThresholdMonitor] Reset completed');
    }

    /**
     * クリーンアップ
     */
    public destroy(): void {
        this.stopMonitoring();
        
        // イベントリスナー削除
        if (this.visibilityChangeHandler) {
            document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
        }

        this.reset();
        console.log('[PerformanceThresholdMonitor] Destroyed');
    }
}

export default PerformanceThresholdMonitor;