/**
 * ErrorReporter - Handles user notifications and error display
 * Part of the ErrorHandler split implementation
 */

export class ErrorReporter {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Notification configuration
        this.notificationConfig = {
            autoHide: true,
            hideDelay: 10000, // 10 seconds
            maxConcurrentNotifications: 3,
            position: 'top-right',
            showReloadButton: true,
            showCloseButton: true
        };
        
        // Active notifications tracking
        this.activeNotifications = new Set();
        this.notificationQueue = [];
        this.notificationId = 0;
        
        console.log('[ErrorReporter] Error reporting component initialized');
    }
    
    /**
     * Notify user about error
     * @param {object} errorInfo - Error information
     */
    notifyUser(errorInfo) {
        // Only notify for important errors
        if (this.shouldNotifyUser(errorInfo)) {
            this.showErrorNotification(errorInfo);
        }
    }
    
    /**
     * Determine if user should be notified
     * @param {object} errorInfo - Error information
     * @returns {boolean} Whether to notify user
     */
    shouldNotifyUser(errorInfo) {
        const { context, message } = errorInfo;
        
        // Canvas-related critical errors
        if (context === 'CANVAS_ERROR' && message.includes('Canvas')) {
            return true;
        }
        
        // Browser compatibility issues
        if (message.includes('not supported') || message.includes('not available')) {
            return true;
        }
        
        // Network-related issues
        if (message.includes('network') || message.includes('fetch')) {
            return true;
        }
        
        // Memory issues
        if (context === 'MEMORY_WARNING' && message.includes('memory')) {
            return true;
        }
        
        // Performance issues
        if (context === 'PERFORMANCE_WARNING' && message.includes('FPS')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Show error notification to user
     * @param {object} errorInfo - Error information
     */
    showErrorNotification(errorInfo) {
        // Check notification limits
        if (this.activeNotifications.size >= this.notificationConfig.maxConcurrentNotifications) {
            this.queueNotification(errorInfo);
            return;
        }
        
        const notification = this.createNotificationElement(errorInfo);
        this.displayNotification(notification, errorInfo);
    }
    
    /**
     * Queue notification for later display
     * @param {object} errorInfo - Error information
     */
    queueNotification(errorInfo) {
        this.notificationQueue.push(errorInfo);
        
        // Keep queue reasonable size
        if (this.notificationQueue.length > 10) {
            this.notificationQueue.shift();
        }
    }
    
    /**
     * Create notification DOM element
     * @param {object} errorInfo - Error information
     * @returns {HTMLElement} Notification element
     */
    createNotificationElement(errorInfo) {
        const notificationId = ++this.notificationId;
        const notification = document.createElement('div');
        notification.id = `error-notification-${notificationId}`;
        notification.className = 'error-notification';
        notification.dataset.errorId = errorInfo.id;
        
        const severity = this.mainController.determineSeverity?.(errorInfo) || 'MEDIUM';
        notification.dataset.severity = severity;
        
        notification.innerHTML = `
            <div class="error-notification-content">
                <div class="error-notification-header">
                    <span class="error-notification-icon">${this.getSeverityIcon(severity)}</span>
                    <h3 class="error-notification-title">${this.getSeverityTitle(severity)}</h3>
                    ${this.notificationConfig.showCloseButton ? 
                        '<button class="error-notification-close" aria-label="閉じる">×</button>' : ''}
                </div>
                <div class="error-notification-body">
                    <p class="error-notification-message">${this.getUserFriendlyMessage(errorInfo)}</p>
                    ${errorInfo.metadata && Object.keys(errorInfo.metadata).length > 0 ? 
                        `<details class="error-notification-details">
                            <summary>詳細情報</summary>
                            <pre>${JSON.stringify(errorInfo.metadata, null, 2)}</pre>
                        </details>` : ''}
                </div>
                <div class="error-notification-actions">
                    ${this.notificationConfig.showCloseButton ? 
                        '<button class="error-btn error-btn-secondary" data-action="dismiss">閉じる</button>' : ''}
                    ${this.notificationConfig.showReloadButton ? 
                        '<button class="error-btn error-btn-primary" data-action="reload">再読み込み</button>' : ''}
                </div>
            </div>
        `;
        
        this.applyNotificationStyles(notification, severity);
        this.attachNotificationEventListeners(notification);
        
        return notification;
    }
    
    /**
     * Get severity icon
     * @param {string} severity - Error severity
     * @returns {string} Icon character or HTML
     */
    getSeverityIcon(severity) {
        const icons = {
            CRITICAL: '🚨',
            HIGH: '⚠️',
            MEDIUM: 'ℹ️',
            LOW: '📝'
        };
        return icons[severity] || icons.MEDIUM;
    }
    
    /**
     * Get severity title
     * @param {string} severity - Error severity
     * @returns {string} User-friendly title
     */
    getSeverityTitle(severity) {
        const titles = {
            CRITICAL: 'システムエラー',
            HIGH: '重要なエラー',
            MEDIUM: '警告',
            LOW: '情報'
        };
        return titles[severity] || titles.MEDIUM;
    }
    
    /**
     * Generate user-friendly error message
     * @param {object} errorInfo - Error information
     * @returns {string} User-friendly message
     */
    getUserFriendlyMessage(errorInfo) {
        const { context, message } = errorInfo;
        
        if (context === 'CANVAS_ERROR') {
            return 'グラフィック機能に問題が発生しました。ブラウザを更新してください。';
        }
        
        if (context === 'AUDIO_ERROR') {
            return '音声機能が利用できません。ゲームは音声なしで続行されます。';
        }
        
        if (context === 'STORAGE_ERROR') {
            return 'データの保存に問題が発生しました。進行状況が保存されない可能性があります。';
        }
        
        if (context === 'MEMORY_WARNING') {
            return 'メモリ使用量が多くなっています。パフォーマンスが低下する可能性があります。';
        }
        
        if (context === 'PERFORMANCE_WARNING') {
            return 'パフォーマンスが低下しています。設定を調整することをお勧めします。';
        }
        
        if (context === 'NETWORK_ERROR') {
            return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
        }
        
        if (context === 'BROWSER_COMPATIBILITY') {
            return 'お使いのブラウザではサポートされていない機能があります。';
        }
        
        return '技術的な問題が発生しました。ページを再読み込みしてください。';
    }
    
    /**
     * Apply notification styles
     * @param {HTMLElement} notification - Notification element
     * @param {string} severity - Error severity
     */
    applyNotificationStyles(notification, severity) {
        const baseStyles = `
            position: fixed;
            ${this.getPositionStyles()}
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            max-width: 400px;
            min-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease-out;
            border-left: 4px solid ${this.getSeverityColor(severity)};
        `;
        
        notification.style.cssText = baseStyles;
        
        // Content styles
        const content = notification.querySelector('.error-notification-content');
        if (content) {
            content.style.cssText = 'padding: 16px;';
        }
        
        // Header styles
        const header = notification.querySelector('.error-notification-header');
        if (header) {
            header.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 12px;';
        }
        
        // Title styles
        const title = notification.querySelector('.error-notification-title');
        if (title) {
            title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600; color: #333; flex: 1;';
        }
        
        // Close button styles
        const closeBtn = notification.querySelector('.error-notification-close');
        if (closeBtn) {
            closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 20px;
                color: #666;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
        }
        
        // Message styles
        const messageEl = notification.querySelector('.error-notification-message');
        if (messageEl) {
            messageEl.style.cssText = 'margin: 0 0 16px 0; color: #555; line-height: 1.4;';
        }
        
        // Actions styles
        const actions = notification.querySelector('.error-notification-actions');
        if (actions) {
            actions.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end;';
        }
        
        // Button styles
        notification.querySelectorAll('.error-btn').forEach(btn => {
            const isPrimary = btn.classList.contains('error-btn-primary');
            btn.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.2s;
                ${isPrimary ? 
                    `background: ${this.getSeverityColor(severity)}; color: white;` :
                    'background: #f5f5f5; color: #333;'
                }
            `;
        });
    }
    
    /**
     * Get position styles based on configuration
     * @returns {string} CSS position styles
     */
    getPositionStyles() {
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
        };
        
        return positions[this.notificationConfig.position] || positions['top-right'];
    }
    
    /**
     * Get severity color
     * @param {string} severity - Error severity
     * @returns {string} Color code
     */
    getSeverityColor(severity) {
        const colors = {
            CRITICAL: '#dc3545',
            HIGH: '#fd7e14',
            MEDIUM: '#ffc107',
            LOW: '#17a2b8'
        };
        return colors[severity] || colors.MEDIUM;
    }
    
    /**
     * Attach event listeners to notification
     * @param {HTMLElement} notification - Notification element
     */
    attachNotificationEventListeners(notification) {
        // Close button
        const closeBtn = notification.querySelector('.error-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.dismissNotification(notification));
        }
        
        // Action buttons
        notification.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleNotificationAction(action, notification);
            });
        });
        
        // Hover effects
        notification.addEventListener('mouseenter', () => {
            notification.style.transform = 'translateX(0) scale(1.02)';
        });
        
        notification.addEventListener('mouseleave', () => {
            notification.style.transform = 'translateX(0) scale(1)';
        });
    }
    
    /**
     * Display notification with animation
     * @param {HTMLElement} notification - Notification element
     * @param {object} errorInfo - Error information
     */
    displayNotification(notification, errorInfo) {
        document.body.appendChild(notification);
        this.activeNotifications.add(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-hide if configured
        if (this.notificationConfig.autoHide) {
            setTimeout(() => {
                this.dismissNotification(notification);
            }, this.notificationConfig.hideDelay);
        }
        
        // Adjust position for multiple notifications
        this.adjustNotificationPositions();
    }
    
    /**
     * Handle notification action
     * @param {string} action - Action type
     * @param {HTMLElement} notification - Notification element
     */
    handleNotificationAction(action, notification) {
        switch (action) {
            case 'dismiss':
                this.dismissNotification(notification);
                break;
            case 'reload':
                if (confirm('ページを再読み込みしますか？未保存の変更は失われる可能性があります。')) {
                    location.reload();
                }
                break;
            case 'report':
                this.showReportDialog(notification.dataset.errorId);
                break;
            default:
                console.warn(`[ErrorReporter] Unknown action: ${action}`);
        }
    }
    
    /**
     * Dismiss notification with animation
     * @param {HTMLElement} notification - Notification element
     */
    dismissNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            this.activeNotifications.delete(notification);
            this.adjustNotificationPositions();
            this.processNotificationQueue();
        }, 300);
    }
    
    /**
     * Adjust positions of multiple notifications
     */
    adjustNotificationPositions() {
        const notifications = Array.from(this.activeNotifications);
        notifications.forEach((notification, index) => {
            const offset = index * 90; // 90px gap between notifications
            if (this.notificationConfig.position.includes('top')) {
                notification.style.top = `${20 + offset}px`;
            } else {
                notification.style.bottom = `${20 + offset}px`;
            }
        });
    }
    
    /**
     * Process queued notifications
     */
    processNotificationQueue() {
        if (this.notificationQueue.length > 0 && 
            this.activeNotifications.size < this.notificationConfig.maxConcurrentNotifications) {
            const errorInfo = this.notificationQueue.shift();
            this.showErrorNotification(errorInfo);
        }
    }
    
    /**
     * Show fallback UI for compatibility issues
     */
    showFallbackUI() {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.id = 'fallbackUI';
        fallbackDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
                max-width: 500px;
            ">
                <h2>互換性の問題が発生しました</h2>
                <p>お使いのブラウザではゲームを正常に実行できません。</p>
                <p>以下のブラウザでお試しください：</p>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>Google Chrome (推奨)</li>
                    <li>Mozilla Firefox</li>
                    <li>Microsoft Edge</li>
                    <li>Safari (iOS/macOS)</li>
                </ul>
                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-right: 10px;
                    ">再試行</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        padding: 10px 20px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">閉じる</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(fallbackDiv);
    }
    
    /**
     * Configure reporter settings
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.notificationConfig, config);
        console.log('[ErrorReporter] Configuration updated');
    }
    
    /**
     * Clear all active notifications
     */
    clearAllNotifications() {
        this.activeNotifications.forEach(notification => {
            this.dismissNotification(notification);
        });
        this.notificationQueue = [];
    }
    
    /**
     * Get active notifications count
     * @returns {number} Number of active notifications
     */
    getActiveNotificationsCount() {
        return this.activeNotifications.size;
    }
    
    /**
     * Get queued notifications count
     * @returns {number} Number of queued notifications
     */
    getQueuedNotificationsCount() {
        return this.notificationQueue.length;
    }
    
    /**
     * Cleanup reporter resources
     */
    destroy() {
        this.clearAllNotifications();
        console.log('[ErrorReporter] Reporter destroyed');
    }
}