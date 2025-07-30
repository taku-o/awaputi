/**
 * Error Notification System
 * エラー通知システム - リアルタイム通知・フィルタリング・設定可能閾値
 */

export class ErrorNotificationSystem {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
        
        // 通知設定
        this.notificationConfig = {
            enabled: true,
            channels: {
                console: { enabled: true, level: 'all' },
                ui: { enabled: true, level: 'high' },
                storage: { enabled: true, level: 'all' },
                webhook: { enabled: false, url: null, level: 'critical' }
            },
            rateLimit: {
                maxPerMinute: 10,
                maxPerHour: 100,
                burstLimit: 5
            },
            filters: {
                categories: [], // 空の場合は全カテゴリを通知
                severities: ['medium', 'high', 'critical'],
                patterns: [], // 特定パターンのみ通知
                excludePatterns: [] // 除外パターン
            },
            thresholds: {
                critical: { count: 1, timeWindow: 0 },
                high: { count: 3, timeWindow: 300000 }, // 5分
                medium: { count: 5, timeWindow: 600000 }, // 10分
                low: { count: 10, timeWindow: 1800000 } // 30分
            },
            aggregation: {
                enabled: true,
                windowSize: 60000, // 1分
                maxAggregatedNotifications: 5
            }
        };
        
        // 通知履歴とレート制限
        this.notificationHistory = [];
        this.rateLimitCounter = {
            minute: { count: 0, resetTime: Date.now() + 60000 },
            hour: { count: 0, resetTime: Date.now() + 3600000 }
        };
        
        // 通知集約
        this.pendingNotifications = new Map();
        this.aggregationTimer = null;
        
        // UI通知要素
        this.uiContainer = null;
        this.activeUINotifications = new Map();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.setupUIContainer();
        this.loadSettings();
        this.startRateLimitReset();
        console.log('ErrorNotificationSystem initialized');
    }
    
    /**
     * エラー通知の処理
     */
    processErrorNotification(error, type = 'standard', additionalInfo = {}) {
        if (!this.notificationConfig.enabled) return false;
        
        // フィルタリング
        if (!this.shouldNotify(error, type)) {
            return false;
        }
        
        // レート制限チェック
        if (!this.checkRateLimit()) {
            this.handleRateLimitExceeded(error);
            return false;
        }
        
        // 通知オブジェクトの作成
        const notification = this.createNotification(error, type, additionalInfo);
        
        // 集約処理
        if (this.notificationConfig.aggregation.enabled && type !== 'critical') {
            this.addToAggregation(notification);
            return true;
        }
        
        // 即座に送信
        this.sendNotification(notification);
        return true;
    }
    
    /**
     * 通知すべきかどうかの判定
     */
    shouldNotify(error, type) {
        const config = this.notificationConfig;
        
        // 重要度フィルタ
        if (!config.filters.severities.includes(error.severity)) {
            return false;
        }
        
        // カテゴリフィルタ
        if (config.filters.categories.length > 0 && 
            !config.filters.categories.includes(error.category)) {
            return false;
        }
        
        // パターンフィルタ
        if (config.filters.patterns.length > 0 && 
            !config.filters.patterns.some(pattern => 
                error.fingerprint.includes(pattern))) {
            return false;
        }
        
        // 除外パターン
        if (config.filters.excludePatterns.some(pattern => 
            error.fingerprint.includes(pattern))) {
            return false;
        }
        
        // 閾値チェック
        return this.checkThreshold(error, type);
    }
    
    /**
     * 閾値チェック
     */
    checkThreshold(error, type) {
        const threshold = this.notificationConfig.thresholds[error.severity];
        if (!threshold) return true;
        
        if (threshold.count <= 1) return true; // 即座に通知
        
        // 時間窓内での発生回数をチェック
        const timeWindow = threshold.timeWindow;
        const cutoffTime = Date.now() - timeWindow;
        
        const recentSimilarErrors = this.notificationHistory.filter(notification => 
            notification.timestamp > cutoffTime &&
            notification.error.fingerprint === error.fingerprint
        );
        
        return recentSimilarErrors.length >= threshold.count - 1; // 1回追加で閾値に達する
    }
    
    /**
     * レート制限チェック
     */
    checkRateLimit() {
        const now = Date.now();
        
        // カウンターリセット
        if (now > this.rateLimitCounter.minute.resetTime) {
            this.rateLimitCounter.minute = { count: 0, resetTime: now + 60000 };
        }
        
        if (now > this.rateLimitCounter.hour.resetTime) {
            this.rateLimitCounter.hour = { count: 0, resetTime: now + 3600000 };
        }
        
        // 制限チェック
        const config = this.notificationConfig.rateLimit;
        
        if (this.rateLimitCounter.minute.count >= config.maxPerMinute) {
            return false;
        }
        
        if (this.rateLimitCounter.hour.count >= config.maxPerHour) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 通知オブジェクトの作成
     */
    createNotification(error, type, additionalInfo) {
        const notification = {
            id: this.generateNotificationId(),
            timestamp: Date.now(),
            type,
            error: {
                id: error.id,
                message: error.message,
                severity: error.severity,
                category: error.category,
                fingerprint: error.fingerprint,
                count: this.getErrorCount(error.fingerprint)
            },
            additionalInfo,
            channels: this.determineChannels(error, type)
        };
        
        // 履歴に追加
        this.notificationHistory.push(notification);
        
        // 履歴サイズ制限
        if (this.notificationHistory.length > 1000) {
            this.notificationHistory.shift();
        }
        
        return notification;
    }
    
    /**
     * 通知チャンネルの決定
     */
    determineChannels(error, type) {
        const channels = [];
        const config = this.notificationConfig.channels;
        
        // 各チャンネルの有効性をチェック
        Object.entries(config).forEach(([channel, settings]) => {
            if (!settings.enabled) return;
            
            const shouldUseChannel = this.shouldUseChannel(channel, settings, error, type);
            if (shouldUseChannel) {
                channels.push(channel);
            }
        });
        
        return channels;
    }
    
    /**
     * チャンネル使用判定
     */
    shouldUseChannel(channel, settings, error, type) {
        const level = settings.level;
        
        if (level === 'all') return true;
        if (level === 'critical' && (error.severity === 'critical' || type === 'critical')) return true;
        if (level === 'high' && ['critical', 'high'].includes(error.severity)) return true;
        
        return false;
    }
    
    /**
     * 通知集約への追加
     */
    addToAggregation(notification) {
        const key = `${notification.error.category}_${notification.error.severity}`;
        
        if (!this.pendingNotifications.has(key)) {
            this.pendingNotifications.set(key, {
                key,
                notifications: [],
                firstSeen: notification.timestamp,
                lastSeen: notification.timestamp
            });
        }
        
        const group = this.pendingNotifications.get(key);
        group.notifications.push(notification);
        group.lastSeen = notification.timestamp;
        
        // 集約タイマーの設定
        if (!this.aggregationTimer) {
            this.aggregationTimer = setTimeout(() => {
                this.flushAggregatedNotifications();
            }, this.notificationConfig.aggregation.windowSize);
        }
    }
    
    /**
     * 集約された通知の送信
     */
    flushAggregatedNotifications() {
        for (const [key, group] of this.pendingNotifications.entities()) {
            if (group.notifications.length === 1) {
                // 単一通知はそのまま送信
                this.sendNotification(group.notifications[0]);
            } else {
                // 複数通知は集約して送信
                const aggregatedNotification = this.createAggregatedNotification(group);
                this.sendNotification(aggregatedNotification);
            }
        }
        
        this.pendingNotifications.clear();
        this.aggregationTimer = null;
    }
    
    /**
     * 集約通知の作成
     */
    createAggregatedNotification(group) {
        const notifications = group.notifications;
        const firstNotification = notifications[0];
        
        return {
            id: this.generateNotificationId(),
            timestamp: Date.now(),
            type: 'aggregated',
            error: {
                category: firstNotification.error.category,
                severity: firstNotification.error.severity,
                count: notifications.length,
                timespan: group.lastSeen - group.firstSeen,
                messages: [...new Set(notifications.map(n => n.error.message))].slice(0, 3)
            },
            aggregatedNotifications: notifications.map(n => ({
                id: n.id,
                timestamp: n.timestamp,
                message: n.error.message
            })),
            channels: firstNotification.channels
        };
    }
    
    /**
     * 通知の送信
     */
    sendNotification(notification) {
        // レート制限カウンターを更新
        this.rateLimitCounter.minute.count++;
        this.rateLimitCounter.hour.count++;
        
        // 各チャンネルに送信
        notification.channels.forEach(channel => {
            try {
                this.sendToChannel(channel, notification);
            } catch (error) {
                console.warn(`Failed to send notification to ${channel}:`, error.message);
            }
        });
    }
    
    /**
     * チャンネル別送信
     */
    sendToChannel(channel, notification) {
        switch (channel) {
            case 'console':
                this.sendConsoleNotification(notification);
                break;
            case 'ui':
                this.sendUINotification(notification);
                break;
            case 'storage':
                this.sendStorageNotification(notification);
                break;
            case 'webhook':
                this.sendWebhookNotification(notification);
                break;
            default:
                console.warn(`Unknown notification channel: ${channel}`);
        }
    }
    
    /**
     * コンソール通知
     */
    sendConsoleNotification(notification) {
        const { error, type } = notification;
        
        if (type === 'aggregated') {
            console.group(`🔔 Aggregated Notifications - ${error.category.toUpperCase()}`);
            console.warn(`${error.count} errors in ${(error.timespan / 1000).toFixed(1)}s`);
            error.messages.forEach(message => console.log(`• ${message}`));
            console.groupEnd();
        } else {
            const emoji = this.getSeverityEmoji(error.severity);
            const prefix = `${emoji} ${type.toUpperCase()}`;
            
            console.group(prefix);
            console.error(`Error: ${error.message}`);
            console.log(`Category: ${error.category}`);
            console.log(`Severity: ${error.severity}`);
            console.log(`Fingerprint: ${error.fingerprint}`);
            
            if (error.count > 1) {
                console.log(`Occurrence count: ${error.count}`);
            }
            
            console.groupEnd();
        }
    }
    
    /**
     * UI通知
     */
    sendUINotification(notification) {
        if (!this.uiContainer) return;
        
        const notificationElement = this.createUINotificationElement(notification);
        this.uiContainer.appendChild(notificationElement);
        
        // アクティブ通知として追跡
        this.activeUINotifications.set(notification.id, {
            element: notificationElement,
            timestamp: notification.timestamp
        });
        
        // 自動削除タイマー
        const duration = this.getNotificationDuration(notification);
        setTimeout(() => {
            this.removeUINotification(notification.id);
        }, duration);
        
        // 最大表示数の制限
        this.limitActiveUINotifications();
    }
    
    /**
     * UI通知要素の作成
     */
    createUINotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `error-notification ${notification.error.severity}`;
        element.id = `notification-${notification.id}`;
        
        const emoji = this.getSeverityEmoji(notification.error.severity);
        const timestamp = new Date(notification.timestamp).toLocaleTimeString();
        
        if (notification.type === 'aggregated') {
            element.innerHTML = `
                <div class="notification-header">
                    <span class="emoji">${emoji}</span>
                    <span class="title">Aggregated Errors</span>
                    <span class="timestamp">${timestamp}</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-body">
                    <p><strong>${notification.error.count} errors</strong> in ${notification.error.category}</p>
                    <ul>
                        ${notification.error.messages.map(msg => `<li>${msg}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            element.innerHTML = `
                <div class="notification-header">
                    <span class="emoji">${emoji}</span>
                    <span class="title">${notification.error.category} Error</span>
                    <span class="timestamp">${timestamp}</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-body">
                    <p><strong>${notification.error.message}</strong></p>
                    ${notification.error.count > 1 ? `<p>Count: ${notification.error.count}</p>` : ''}
                </div>
            `;
        }
        
        // スタイル
        element.style.cssText = `
            margin-bottom: 10px;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid ${this.getSeverityColor(notification.error.severity)};
            background: ${this.getSeverityBackground(notification.error.severity)};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            animation: slideIn 0.3s ease-out;
        `;
        
        return element;
    }
    
    /**
     * ストレージ通知
     */
    sendStorageNotification(notification) {
        try {
            const stored = JSON.parse(localStorage.getItem('error_notifications') || '[]');
            stored.push({
                id: notification.id,
                timestamp: notification.timestamp,
                type: notification.type,
                error: notification.error
            });
            
            // 最新100件のみ保持
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }
            
            localStorage.setItem('error_notifications', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store notification:', error.message);
        }
    }
    
    /**
     * Webhook通知
     */
    async sendWebhookNotification(notification) {
        const webhookUrl = this.notificationConfig.channels.webhook.url;
        if (!webhookUrl) return;
        
        try {
            const payload = {
                timestamp: notification.timestamp,
                type: notification.type,
                error: notification.error,
                gameInfo: {
                    sessionId: this.errorReporter.sessionId,
                    gameState: notification.error.gameState
                }
            };
            
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn('Webhook notification failed:', error.message);
        }
    }
    
    /**
     * UI通知コンテナの設定
     */
    setupUIContainer() {
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'error-notification-container';
        this.uiContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10001;
            pointer-events: none;
        `;
        
        // 子要素のクリックイベントを有効化
        this.uiContainer.addEventListener('click', (e) => {
            e.target.style.pointerEvents = 'auto';
        });
        
        // 通知要素にはpointer-eventsを有効化
        const style = document.createElement('style');
        style.textContent = `
            .error-notification {
                pointer-events: auto !important;
            }
            .error-notification .close-btn {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            }
            .notification-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            .notification-body {
                font-size: 12px;
                line-height: 1.4;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.uiContainer);
    }
    
    /**
     * 重要度別スタイルヘルパー
     */
    getSeverityEmoji(severity) {
        const emojis = {
            critical: '🚨',
            high: '⚠️',
            medium: '⚡',
            low: 'ℹ️'
        };
        return emojis[severity] || '📝';
    }
    
    getSeverityColor(severity) {
        const colors = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#17a2b8'
        };
        return colors[severity] || '#6c757d';
    }
    
    getSeverityBackground(severity) {
        const backgrounds = {
            critical: 'rgba(220, 53, 69, 0.1)',
            high: 'rgba(253, 126, 20, 0.1)',
            medium: 'rgba(255, 193, 7, 0.1)',
            low: 'rgba(23, 162, 184, 0.1)'
        };
        return backgrounds[severity] || 'rgba(108, 117, 125, 0.1)';
    }
    
    /**
     * ユーティリティメソッド
     */
    getNotificationDuration(notification) {
        const baseDuration = 5000; // 5秒
        const severityMultiplier = {
            critical: 3,
            high: 2,
            medium: 1.5,
            low: 1
        };
        
        return baseDuration * (severityMultiplier[notification.error.severity] || 1);
    }
    
    removeUINotification(notificationId) {
        const notification = this.activeUINotifications.get(notificationId);
        if (notification) {
            notification.element.remove();
            this.activeUINotifications.delete(notificationId);
        }
    }
    
    limitActiveUINotifications() {
        const maxNotifications = 5;
        if (this.activeUINotifications.size > maxNotifications) {
            // 古い通知から削除
            const sorted = [...this.activeUINotifications.entries()]
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
                
            const toRemove = sorted.slice(0, sorted.length - maxNotifications);
            toRemove.forEach(([id]) => this.removeUINotification(id));
        }
    }
    
    getErrorCount(fingerprint) {
        const pattern = this.errorReporter.errorPatterns.get(fingerprint);
        return pattern ? pattern.count : 1;
    }
    
    generateNotificationId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    startRateLimitReset() {
        setInterval(() => {
            const now = Date.now();
            
            if (now > this.rateLimitCounter.minute.resetTime) {
                this.rateLimitCounter.minute = { count: 0, resetTime: now + 60000 };
            }
            
            if (now > this.rateLimitCounter.hour.resetTime) {
                this.rateLimitCounter.hour = { count: 0, resetTime: now + 3600000 };
            }
        }, 10000); // 10秒ごとにチェック
    }
    
    handleRateLimitExceeded(error) {
        // レート制限超過時の処理
        if (this.rateLimitExceededNotificationSent) return;
        
        console.warn('🚫 Error notification rate limit exceeded');
        
        // 一度だけ警告通知を送信
        this.sendConsoleNotification({
            error: {
                message: 'Notification rate limit exceeded. Some notifications may be suppressed.',
                severity: 'medium',
                category: 'system'
            },
            type: 'rate_limit'
        });
        
        this.rateLimitExceededNotificationSent = true;
        
        // 1分後にフラグをリセット
        setTimeout(() => {
            this.rateLimitExceededNotificationSent = false;
        }, 60000);
    }
    
    /**
     * 設定の読み込み
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem('error_notification_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                Object.assign(this.notificationConfig, settings);
            }
        } catch (error) {
            console.warn('Failed to load notification settings:', error.message);
        }
    }
    
    /**
     * 設定の保存
     */
    saveSettings() {
        try {
            localStorage.setItem('error_notification_settings', JSON.stringify(this.notificationConfig));
        } catch (error) {
            console.warn('Failed to save notification settings:', error.message);
        }
    }
    
    /**
     * 設定の更新
     */
    updateSettings(newSettings) {
        Object.assign(this.notificationConfig, newSettings);
        this.saveSettings();
        console.log('Notification settings updated:', newSettings);
    }
    
    /**
     * 通知統計の取得
     */
    getNotificationStatistics() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;
        
        const recentNotifications = this.notificationHistory.filter(n => now - n.timestamp < oneDay);
        
        return {
            total: this.notificationHistory.length,
            lastHour: recentNotifications.filter(n => now - n.timestamp < oneHour).length,
            lastDay: recentNotifications.length,
            bySeverity: this.groupBy(recentNotifications, 'error.severity'),
            byCategory: this.groupBy(recentNotifications, 'error.category'),
            byType: this.groupBy(recentNotifications, 'type'),
            rateLimitStatus: {
                minute: this.rateLimitCounter.minute,
                hour: this.rateLimitCounter.hour
            }
        };
    }
    
    groupBy(array, path) {
        return array.reduce((groups, item) => {
            const value = path.split('.').reduce((obj, key) => obj?.[key], item);
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {});
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        this.saveSettings();
        
        if (this.aggregationTimer) {
            clearTimeout(this.aggregationTimer);
        }
        
        if (this.uiContainer) {
            this.uiContainer.remove();
        }
        
        console.log('ErrorNotificationSystem destroyed');
    }
}