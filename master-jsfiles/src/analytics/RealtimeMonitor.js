/**
 * リアルタイム監視システム
 * パフォーマンス問題の即座検出とアラート機能
 */

export class RealtimeMonitor {
    constructor(performanceDataCollector, options = {}) {
        this.dataCollector = performanceDataCollector;
        this.options = {
            enableDebugPanel: false,
            enableNotifications: true,
            enableConsoleWarnings: true,
            fpsThreshold: 30,
            memoryThreshold: 80, // パーセント
            loadTimeThreshold: 5000, // ミリ秒
            errorRateThreshold: 5, // 分あたりのエラー数
            monitoringInterval: 1000, // 監視間隔（1秒）
            warningCooldown: 10000, // 同じ警告の再表示間隔（10秒）
            maxAlerts: 50, // 保持する最大アラート数
            ...options
        };

        this.isMonitoring = false;
        this.monitoringTimer = null;
        this.alerts = [];
        this.warningHistory = new Map(); // 警告のクールダウン管理
        this.debugPanel = null;
        
        // パフォーマンス統計
        this.monitoringStats = {
            startTime: null,
            warningsGenerated: 0,
            errorsDetected: 0,
            performanceIssues: 0
        };

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        // パフォーマンス警告イベントリスナーを設定
        window.addEventListener('performance-warning', (event) => {
            this.handlePerformanceWarning(event.detail);
        });

        // デバッグパネルを設定
        if (this.options.enableDebugPanel) {
            this.createDebugPanel();
        }
    }

    /**
     * 監視開始
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringStats.startTime = Date.now();
        
        console.log('Real-time monitoring started');

        // 定期監視を開始
        this.monitoringTimer = setInterval(() => {
            this.performMonitoringCheck();
        }, this.options.monitoringInterval);

        // デバッグパネルを表示
        if (this.debugPanel) {
            this.debugPanel.style.display = 'block';
            this.startDebugPanelUpdates();
        }
    }

    /**
     * 監視停止
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        console.log('Real-time monitoring stopped');

        // タイマーをクリア
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        // デバッグパネルを隠す
        if (this.debugPanel) {
            this.debugPanel.style.display = 'none';
            this.stopDebugPanelUpdates();
        }
    }

    /**
     * 監視チェックの実行
     */
    performMonitoringCheck() {
        if (!this.dataCollector) return;

        const currentStats = this.dataCollector.getCurrentStats();
        
        // FPSチェック
        if (currentStats.currentFPS && currentStats.currentFPS < this.options.fpsThreshold) {
            this.generateAlert('low_fps', {
                type: 'performance',
                severity: 'warning',
                message: `Low FPS detected: ${currentStats.currentFPS}`,
                details: {
                    currentFPS: currentStats.currentFPS,
                    threshold: this.options.fpsThreshold,
                    frameTime: currentStats.averageFrameTime
                }
            });
        }

        // メモリ使用量チェック
        if (currentStats.currentMemoryUsage && 
            currentStats.currentMemoryUsage.usagePercent > this.options.memoryThreshold) {
            this.generateAlert('high_memory', {
                type: 'performance',
                severity: 'warning',
                message: `High memory usage detected: ${currentStats.currentMemoryUsage.usagePercent.toFixed(1)}%`,
                details: {
                    usagePercent: currentStats.currentMemoryUsage.usagePercent,
                    used: currentStats.currentMemoryUsage.used,
                    threshold: this.options.memoryThreshold
                }
            });
        }

        // エラー率チェック
        const errorRate = this.calculateErrorRate();
        if (errorRate > this.options.errorRateThreshold) {
            this.generateAlert('high_error_rate', {
                type: 'error',
                severity: 'error',
                message: `High error rate detected: ${errorRate} errors/min`,
                details: {
                    errorRate: errorRate,
                    threshold: this.options.errorRateThreshold,
                    recentErrors: currentStats.errorCount
                }
            });
        }

        // 応答性チェック（フレームタイムが長い場合）
        if (currentStats.averageFrameTime && currentStats.averageFrameTime > 33.33) { // 30FPS未満
            this.generateAlert('poor_responsiveness', {
                type: 'performance',
                severity: 'warning',
                message: `Poor responsiveness detected: ${currentStats.averageFrameTime.toFixed(1)}ms frame time`,
                details: {
                    frameTime: currentStats.averageFrameTime,
                    expectedFrameTime: 16.67, // 60FPS
                    currentFPS: currentStats.currentFPS
                }
            });
        }
    }

    /**
     * パフォーマンス警告の処理
     */
    handlePerformanceWarning(warningData) {
        const alertData = {
            type: 'performance',
            severity: this.getSeverityLevel(warningData.type),
            message: this.formatWarningMessage(warningData),
            details: warningData.details,
            source: 'performance_collector'
        };

        this.generateAlert(warningData.type, alertData);
    }

    /**
     * アラートの生成
     */
    generateAlert(alertId, alertData) {
        // クールダウンチェック
        if (this.isInCooldown(alertId)) return;

        const alert = {
            id: this.generateAlertId(),
            alertType: alertId,
            timestamp: Date.now(),
            ...alertData
        };

        this.alerts.unshift(alert);
        this.trimAlerts();

        // 統計更新
        this.monitoringStats.warningsGenerated++;
        if (alert.type === 'error') {
            this.monitoringStats.errorsDetected++;
        } else if (alert.type === 'performance') {
            this.monitoringStats.performanceIssues++;
        }

        // 通知の送信
        this.sendNotification(alert);

        // コンソール出力
        if (this.options.enableConsoleWarnings) {
            this.logAlert(alert);
        }

        // デバッグパネル更新
        if (this.debugPanel) {
            this.updateDebugPanel();
        }

        // クールダウン設定
        this.setWarningCooldown(alertId);

        // カスタムイベント発火
        this.dispatchAlertEvent(alert);
    }

    /**
     * 通知の送信
     */
    sendNotification(alert) {
        if (!this.options.enableNotifications) return;

        // ブラウザ通知（許可されている場合）
        if (Notification && Notification.permission === 'granted') {
            const notification = new Notification(`Game Performance Alert`, {
                body: alert.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: alert.alertType // 同じタイプの通知を置き換え
            });

            // 自動で閉じる
            setTimeout(() => {
                notification.close();
            }, 5000);
        }

        // ページ内通知（カスタム実装）
        this.showInPageNotification(alert);
    }

    /**
     * ページ内通知の表示
     */
    showInPageNotification(alert) {
        const notification = document.createElement('div');
        notification.className = `performance-notification ${alert.severity}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-type">${alert.type.toUpperCase()}</span>
                <span class="notification-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-message">${alert.message}</div>
        `;

        // スタイル設定
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(alert.severity),
            color: 'white',
            padding: '12px 16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            maxWidth: '350px',
            fontSize: '14px',
            fontFamily: 'monospace'
        });

        // 閉じるボタンの処理
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // 自動で削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    /**
     * デバッグパネルの作成
     */
    createDebugPanel() {
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'realtime-debug-panel';
        this.debugPanel.innerHTML = `
            <div class="debug-panel-header">
                <h3>Real-time Performance Monitor</h3>
                <button id="debug-panel-toggle">−</button>
            </div>
            <div class="debug-panel-content">
                <div class="debug-section">
                    <h4>Current Status</h4>
                    <div id="current-stats"></div>
                </div>
                <div class="debug-section">
                    <h4>Recent Alerts</h4>
                    <div id="recent-alerts"></div>
                </div>
                <div class="debug-section">
                    <h4>Monitoring Stats</h4>
                    <div id="monitoring-stats"></div>
                </div>
            </div>
        `;

        // スタイル設定
        Object.assign(this.debugPanel.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            width: '350px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00ff00',
            border: '1px solid #333',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: '9999',
            display: 'none'
        });

        // パネルの折りたたみ機能
        const toggleButton = this.debugPanel.querySelector('#debug-panel-toggle');
        const content = this.debugPanel.querySelector('.debug-panel-content');
        let isCollapsed = false;

        toggleButton.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            content.style.display = isCollapsed ? 'none' : 'block';
            toggleButton.textContent = isCollapsed ? '+' : '−';
        });

        document.body.appendChild(this.debugPanel);
    }

    /**
     * デバッグパネルの更新開始
     */
    startDebugPanelUpdates() {
        this.debugPanelTimer = setInterval(() => {
            this.updateDebugPanel();
        }, 1000);
    }

    /**
     * デバッグパネルの更新停止
     */
    stopDebugPanelUpdates() {
        if (this.debugPanelTimer) {
            clearInterval(this.debugPanelTimer);
            this.debugPanelTimer = null;
        }
    }

    /**
     * デバッグパネルの更新
     */
    updateDebugPanel() {
        if (!this.debugPanel || !this.dataCollector) return;

        const currentStats = this.dataCollector.getCurrentStats();
        const recentAlerts = this.alerts.slice(0, 5);

        // 現在の統計
        const currentStatsElement = this.debugPanel.querySelector('#current-stats');
        currentStatsElement.innerHTML = `
            <div>FPS: ${currentStats.currentFPS || 'N/A'}</div>
            <div>Memory: ${currentStats.currentMemoryUsage ? currentStats.currentMemoryUsage.usagePercent.toFixed(1) + '%' : 'N/A'}</div>
            <div>Errors: ${currentStats.errorCount || 0}</div>
            <div>Frame Time: ${currentStats.averageFrameTime ? currentStats.averageFrameTime.toFixed(1) + 'ms' : 'N/A'}</div>
        `;

        // 最近のアラート
        const recentAlertsElement = this.debugPanel.querySelector('#recent-alerts');
        recentAlertsElement.innerHTML = recentAlerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
                <span class="alert-message">${alert.message}</span>
            </div>
        `).join('');

        // 監視統計
        const monitoringStatsElement = this.debugPanel.querySelector('#monitoring-stats');
        const uptime = this.monitoringStats.startTime ? 
            Math.floor((Date.now() - this.monitoringStats.startTime) / 1000) : 0;
        
        monitoringStatsElement.innerHTML = `
            <div>Uptime: ${uptime}s</div>
            <div>Warnings: ${this.monitoringStats.warningsGenerated}</div>
            <div>Errors: ${this.monitoringStats.errorsDetected}</div>
            <div>Performance Issues: ${this.monitoringStats.performanceIssues}</div>
        `;
    }

    /**
     * エラー率の計算
     */
    calculateErrorRate() {
        if (!this.dataCollector) return 0;

        const errorData = this.dataCollector.getPerformanceData('errorEvents');
        if (!errorData || errorData.length === 0) return 0;

        // 過去1分間のエラー数を計算
        const oneMinuteAgo = Date.now() - 60000;
        const recentErrors = errorData.filter(error => error.timestamp > oneMinuteAgo);
        
        return recentErrors.length;
    }

    /**
     * 警告の重要度レベル取得
     */
    getSeverityLevel(warningType) {
        const severityMap = {
            'low_fps': 'warning',
            'high_memory_usage': 'warning',
            'slow_load_time': 'warning',
            'slow_resource_load': 'warning',
            'error_occurred': 'error',
            'high_error_rate': 'error',
            'poor_responsiveness': 'warning'
        };
        return severityMap[warningType] || 'info';
    }

    /**
     * 警告メッセージのフォーマット
     */
    formatWarningMessage(warningData) {
        const messageMap = {
            'low_fps': `Low FPS: ${warningData.details.currentFPS}fps`,
            'high_memory_usage': `High memory usage: ${warningData.details.usagePercent?.toFixed(1)}%`,
            'slow_load_time': `Slow load time: ${warningData.details.loadTime}ms`,
            'slow_resource_load': `Slow resource load: ${warningData.details.loadTime}ms`,
            'error_occurred': `Error: ${warningData.details.message}`,
            'poor_responsiveness': `Poor responsiveness detected`
        };
        return messageMap[warningData.type] || `Performance issue: ${warningData.type}`;
    }

    /**
     * 通知の色取得
     */
    getNotificationColor(severity) {
        const colorMap = {
            'error': '#f44336',
            'warning': '#ff9800',
            'info': '#2196f3'
        };
        return colorMap[severity] || '#666';
    }

    /**
     * クールダウンチェック
     */
    isInCooldown(alertId) {
        const lastWarning = this.warningHistory.get(alertId);
        if (!lastWarning) return false;
        
        return (Date.now() - lastWarning) < this.options.warningCooldown;
    }

    /**
     * 警告のクールダウン設定
     */
    setWarningCooldown(alertId) {
        this.warningHistory.set(alertId, Date.now());
    }

    /**
     * アラートのトリミング
     */
    trimAlerts() {
        if (this.alerts.length > this.options.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.options.maxAlerts);
        }
    }

    /**
     * アラートのログ出力
     */
    logAlert(alert) {
        const logMethod = alert.severity === 'error' ? console.error : console.warn;
        logMethod(`[${alert.type.toUpperCase()}] ${alert.message}`, alert.details);
    }

    /**
     * アラートイベントの発火
     */
    dispatchAlertEvent(alert) {
        const alertEvent = new CustomEvent('realtime-alert', {
            detail: alert
        });
        window.dispatchEvent(alertEvent);
    }

    /**
     * アラートIDの生成
     */
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * アラート履歴の取得
     */
    getAlertHistory(limit = null, severity = null, type = null) {
        let alerts = [...this.alerts];

        // フィルタリング
        if (severity) {
            alerts = alerts.filter(alert => alert.severity === severity);
        }
        if (type) {
            alerts = alerts.filter(alert => alert.type === type);
        }

        // 制限
        if (limit) {
            alerts = alerts.slice(0, limit);
        }

        return alerts;
    }

    /**
     * 監視統計の取得
     */
    getMonitoringStatistics() {
        const uptime = this.monitoringStats.startTime ? 
            Date.now() - this.monitoringStats.startTime : 0;

        return {
            ...this.monitoringStats,
            uptime: uptime,
            isMonitoring: this.isMonitoring,
            alertCount: this.alerts.length,
            averageAlertsPerMinute: uptime > 0 ? 
                (this.monitoringStats.warningsGenerated / (uptime / 60000)) : 0
        };
    }

    /**
     * 設定の更新
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        console.log('Real-time monitor options updated', this.options);
    }

    /**
     * アラートのクリア
     */
    clearAlerts() {
        this.alerts = [];
        console.log('Alerts cleared');
    }

    /**
     * 通知権限の要求
     */
    async requestNotificationPermission() {
        if (!Notification) {
            console.warn('Notifications not supported in this browser');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Notification permission denied');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }

    /**
     * デバッグパネルの表示/非表示切り替え
     */
    toggleDebugPanel() {
        if (!this.debugPanel) {
            this.options.enableDebugPanel = true;
            this.createDebugPanel();
        }

        const isVisible = this.debugPanel.style.display !== 'none';
        this.debugPanel.style.display = isVisible ? 'none' : 'block';

        if (!isVisible && this.isMonitoring) {
            this.startDebugPanelUpdates();
        } else if (isVisible) {
            this.stopDebugPanelUpdates();
        }
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.stopMonitoring();
        
        if (this.debugPanel) {
            this.debugPanel.remove();
            this.debugPanel = null;
        }

        this.alerts = [];
        this.warningHistory.clear();
        
        console.log('RealtimeMonitor destroyed');
    }
}