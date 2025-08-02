/**
 * AchievementNotificationSystem - Achievement notification management
 * 実績通知システム - 実績解除通知の管理と表示
 * 
 * 主要機能:
 * - 実績解除通知の生成と管理
 * - 通知キューイングシステム
 * - 通知表示とアニメーション
 * - 通知履歴管理
 */
export class AchievementNotificationSystem {
    constructor() {
        // 通知管理
        this.notifications = [];
        this.notificationQueue = [];
        this.activeNotifications = new Set();
        
        // 通知設定
        this.config = {
            maxActiveNotifications: 3,
            notificationDuration: 5000, // 5秒
            animationDuration: 300, // アニメーション時間
            queueProcessingInterval: 500, // キュー処理間隔
            maxQueueSize: 10,
            
            // 表示設定
            position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
            fadeIn: true,
            slideIn: true,
            sound: true,
            vibration: true // モバイル端末での振動
        };
        
        // 通知タイプ別設定
        this.notificationTypes = {
            achievement: {
                icon: '🏆',
                color: '#FFD700',
                priority: 2,
                sound: 'achievement.mp3'
            },
            rare: {
                icon: '💎',
                color: '#9C27B0',
                priority: 3,
                sound: 'rare_achievement.mp3'
            },
            milestone: {
                icon: '🌟',
                color: '#FF6B6B',
                priority: 4,
                sound: 'milestone.mp3'
            },
            collection: {
                icon: '🗂️',
                color: '#4ECDC4',
                priority: 3,
                sound: 'collection.mp3'
            }
        };
        
        // 通知履歴
        this.history = [];
        this.historyLimit = 50;
        
        // UI要素への参照
        this.container = null;
        this.queueProcessor = null;
        
        this.initializeNotificationSystem();
    }

    /**
     * 通知システムを初期化
     */
    initializeNotificationSystem() {
        this.createNotificationContainer();
        this.startQueueProcessor();
        this.setupEventListeners();
    }

    /**
     * 通知コンテナを作成
     */
    createNotificationContainer() {
        // 既存のコンテナを削除
        const existing = document.getElementById('achievement-notifications');
        if (existing) {
            existing.remove();
        }

        // 新しいコンテナを作成
        this.container = document.createElement('div');
        this.container.id = 'achievement-notifications';
        this.container.className = `achievement-notifications achievement-notifications-${this.config.position}`;
        
        // スタイルを設定
        this.applyContainerStyles();
        
        document.body.appendChild(this.container);
    }

    /**
     * コンテナスタイルを適用
     */
    applyContainerStyles() {
        const styles = {
            position: 'fixed',
            zIndex: '10000',
            pointerEvents: 'none',
            maxWidth: '400px',
            width: '100%'
        };

        // 位置に応じてスタイルを設定
        switch (this.config.position) {
            case 'top-right':
                Object.assign(styles, { top: '20px', right: '20px' });
                break;
            case 'top-left':
                Object.assign(styles, { top: '20px', left: '20px' });
                break;
            case 'bottom-right':
                Object.assign(styles, { bottom: '20px', right: '20px' });
                break;
            case 'bottom-left':
                Object.assign(styles, { bottom: '20px', left: '20px' });
                break;
        }

        Object.assign(this.container.style, styles);
    }

    /**
     * キュープロセッサーを開始
     */
    startQueueProcessor() {
        if (this.queueProcessor) {
            clearInterval(this.queueProcessor);
        }

        this.queueProcessor = setInterval(() => {
            this.processNotificationQueue();
        }, this.config.queueProcessingInterval);
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // ページ非表示時の処理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNotifications();
            } else {
                this.resumeNotifications();
            }
        });
    }

    /**
     * 実績解除通知を作成
     * @param {object} achievement - 実績オブジェクト
     * @param {object} options - 通知オプション
     */
    createAchievementNotification(achievement, options = {}) {
        const notification = {
            id: `achievement_${achievement.id}_${Date.now()}`,
            type: this.determineNotificationType(achievement),
            achievement,
            timestamp: Date.now(),
            priority: options.priority || this.getNotificationPriority(achievement),
            options: {
                duration: options.duration || this.config.notificationDuration,
                sound: options.sound !== false,
                vibration: options.vibration !== false,
                ...options
            }
        };

        this.addNotificationToQueue(notification);
    }

    /**
     * 通知タイプを決定
     * @param {object} achievement - 実績オブジェクト
     * @returns {string} 通知タイプ
     */
    determineNotificationType(achievement) {
        // 報酬が高い実績はレア扱い
        if (achievement.reward.ap >= 300) {
            return 'rare';
        }

        // 特定のカテゴリはマイルストーン扱い
        if (['stage', 'collection'].includes(achievement.category)) {
            return 'milestone';
        }

        // コレクション系
        if (achievement.category === 'collection') {
            return 'collection';
        }

        return 'achievement';
    }

    /**
     * 通知優先度を取得
     * @param {object} achievement - 実績オブジェクト
     * @returns {number} 優先度
     */
    getNotificationPriority(achievement) {
        const type = this.determineNotificationType(achievement);
        return this.notificationTypes[type]?.priority || 1;
    }

    /**
     * 通知をキューに追加
     * @param {object} notification - 通知オブジェクト
     */
    addNotificationToQueue(notification) {
        // キューサイズ制限チェック
        if (this.notificationQueue.length >= this.config.maxQueueSize) {
            // 最も優先度の低い通知を削除
            this.notificationQueue.sort((a, b) => b.priority - a.priority);
            this.notificationQueue.pop();
        }

        this.notificationQueue.push(notification);
        
        // 優先度順にソート
        this.notificationQueue.sort((a, b) => b.priority - a.priority);
    }

    /**
     * 通知キューを処理
     */
    processNotificationQueue() {
        if (this.notificationQueue.length === 0) return;
        if (this.activeNotifications.size >= this.config.maxActiveNotifications) return;

        const notification = this.notificationQueue.shift();
        this.showNotification(notification);
    }

    /**
     * 通知を表示
     * @param {object} notification - 通知オブジェクト
     */
    showNotification(notification) {
        const element = this.createNotificationElement(notification);
        this.container.appendChild(element);
        
        this.activeNotifications.add(notification.id);
        
        // アニメーション
        if (this.config.fadeIn || this.config.slideIn) {
            this.animateNotificationIn(element);
        }
        
        // サウンド再生
        if (notification.options.sound && this.config.sound) {
            this.playNotificationSound(notification);
        }
        
        // 振動
        if (notification.options.vibration && this.config.vibration) {
            this.triggerVibration(notification);
        }
        
        // 自動削除タイマー
        setTimeout(() => {
            this.hideNotification(notification.id);
        }, notification.options.duration);
        
        // 履歴に追加
        this.addToHistory(notification);
    }

    /**
     * 通知要素を作成
     * @param {object} notification - 通知オブジェクト
     * @returns {HTMLElement} 通知要素
     */
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = 'achievement-notification';
        element.setAttribute('data-notification-id', notification.id);
        
        const typeConfig = this.notificationTypes[notification.type];
        const achievement = notification.achievement;
        
        element.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-notification-icon" style="color: ${typeConfig.color}">
                    ${achievement.icon || typeConfig.icon}
                </div>
                <div class="achievement-notification-text">
                    <div class="achievement-notification-title">${achievement.name}</div>
                    <div class="achievement-notification-description">${achievement.description}</div>
                    <div class="achievement-notification-reward">+${achievement.reward.ap} AP</div>
                </div>
                <div class="achievement-notification-close">×</div>
            </div>
        `;
        
        // スタイルを適用
        this.applyNotificationStyles(element, typeConfig);
        
        // クローズボタンイベント
        const closeBtn = element.querySelector('.achievement-notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification.id);
        });
        
        return element;
    }

    /**
     * 通知スタイルを適用
     * @param {HTMLElement} element - 通知要素
     * @param {object} typeConfig - タイプ設定
     */
    applyNotificationStyles(element, typeConfig) {
        const styles = {
            backgroundColor: '#ffffff',
            border: `2px solid ${typeConfig.color}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: '0',
            transform: this.config.slideIn ? 'translateX(100%)' : 'scale(0.8)',
            transition: `all ${this.config.animationDuration}ms ease-out`,
            pointerEvents: 'auto',
            cursor: 'pointer'
        };

        Object.assign(element.style, styles);
        
        // コンテンツスタイル
        const content = element.querySelector('.achievement-notification-content');
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        });
        
        // アイコンスタイル
        const icon = element.querySelector('.achievement-notification-icon');
        Object.assign(icon.style, {
            fontSize: '24px',
            flexShrink: '0'
        });
        
        // テキストスタイル
        const text = element.querySelector('.achievement-notification-text');
        Object.assign(text.style, {
            flex: '1'
        });
        
        const title = element.querySelector('.achievement-notification-title');
        Object.assign(title.style, {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#333',
            marginBottom: '2px'
        });
        
        const description = element.querySelector('.achievement-notification-description');
        Object.assign(description.style, {
            fontSize: '12px',
            color: '#666',
            lineHeight: '1.3'
        });
        
        const reward = element.querySelector('.achievement-notification-reward');
        Object.assign(reward.style, {
            fontSize: '11px',
            color: typeConfig.color,
            fontWeight: 'bold',
            marginTop: '2px'
        });
        
        // クローズボタンスタイル
        const closeBtn = element.querySelector('.achievement-notification-close');
        Object.assign(closeBtn.style, {
            fontSize: '18px',
            color: '#999',
            cursor: 'pointer',
            flexShrink: '0',
            width: '20px',
            textAlign: 'center'
        });
    }

    /**
     * 通知のイン・アニメーション
     * @param {HTMLElement} element - 通知要素
     */
    animateNotificationIn(element) {
        // トリガーリフロー
        element.offsetHeight;
        
        // アニメーション実行
        element.style.opacity = '1';
        element.style.transform = 'translateX(0) scale(1)';
    }

    /**
     * 通知を非表示
     * @param {string} notificationId - 通知ID
     */
    hideNotification(notificationId) {
        const element = this.container.querySelector(`[data-notification-id="${notificationId}"]`);
        if (!element) return;

        // アウトアニメーション
        element.style.opacity = '0';
        element.style.transform = this.config.slideIn ? 'translateX(100%)' : 'scale(0.8)';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeNotifications.delete(notificationId);
        }, this.config.animationDuration);
    }

    /**
     * 通知サウンドを再生
     * @param {object} notification - 通知オブジェクト
     */
    playNotificationSound(notification) {
        try {
            const typeConfig = this.notificationTypes[notification.type];
            if (typeConfig.sound) {
                // ここで実際のサウンド再生を実装
                // 例: AudioContextやHTML5 Audioを使用
                console.log(`Playing sound: ${typeConfig.sound}`);
            }
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }

    /**
     * 振動を発生
     * @param {object} notification - 通知オブジェクト
     */
    triggerVibration(notification) {
        if ('vibrate' in navigator) {
            const pattern = notification.type === 'rare' ? [100, 50, 100] : [100];
            navigator.vibrate(pattern);
        }
    }

    /**
     * 履歴に追加
     * @param {object} notification - 通知オブジェクト
     */
    addToHistory(notification) {
        this.history.unshift({
            id: notification.id,
            achievement: notification.achievement,
            timestamp: notification.timestamp,
            type: notification.type
        });
        
        // 履歴サイズ制限
        if (this.history.length > this.historyLimit) {
            this.history = this.history.slice(0, this.historyLimit);
        }
    }

    /**
     * 通知を一時停止
     */
    pauseNotifications() {
        if (this.queueProcessor) {
            clearInterval(this.queueProcessor);
            this.queueProcessor = null;
        }
    }

    /**
     * 通知を再開
     */
    resumeNotifications() {
        if (!this.queueProcessor) {
            this.startQueueProcessor();
        }
    }

    /**
     * 全通知をクリア
     */
    clearAllNotifications() {
        // アクティブ通知をクリア
        this.activeNotifications.forEach(id => {
            this.hideNotification(id);
        });
        
        // キューをクリア
        this.notificationQueue = [];
    }

    /**
     * 通知履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} 通知履歴
     */
    getNotificationHistory(limit = 10) {
        return this.history.slice(0, limit);
    }

    /**
     * 設定を更新
     * @param {object} config - 設定オブジェクト
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        
        // コンテナスタイルを再適用
        if (config.position && this.container) {
            this.container.className = `achievement-notifications achievement-notifications-${this.config.position}`;
            this.applyContainerStyles();
        }
    }

    /**
     * 通知システムを破棄
     */
    destroy() {
        // キュープロセッサーを停止
        if (this.queueProcessor) {
            clearInterval(this.queueProcessor);
        }
        
        // 全通知をクリア
        this.clearAllNotifications();
        
        // コンテナを削除
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // データをクリア
        this.notifications = [];
        this.notificationQueue = [];
        this.activeNotifications.clear();
        this.history = [];
    }
}