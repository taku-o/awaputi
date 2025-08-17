/**
 * EventNotificationSystem.js
 * イベント通知システム
 * EventStageManagerから分離された通知機能
 */

export class EventNotificationSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 通知関連の状態
        this.notificationQueue = [];
        this.activeNotifications = new Map();
        this.notificationHistory = [];
        this.notificationCheckInterval = null;
        
        // 通知設定
        this.settings = {
            enableNotifications: true,
            eventStartNotifications: true,
            eventEndNotifications: true,
            achievementNotifications: true,
            rankingNotifications: true,
            maxActiveNotifications: 3,
            notificationDuration: 5000,
            animationDuration: 300
        };
        
        this.startNotificationChecking();
    }
    
    /**
     * 通知チェックを開始
     */
    startNotificationChecking() {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }
        
        // 30秒ごとに通知をチェック
        this.notificationCheckInterval = setInterval(() => {
            this.processNotificationQueue();
            this.checkExpiredNotifications();
        }, 30000);
        
        // 初回チェック
        this.processNotificationQueue();
    }
    
    /**
     * 通知を追加
     */
    addNotification(notification) {
        if (!this.settings.enableNotifications) {
            return;
        }
        
        // notification が null または undefined の場合は早期リターン
        if (!notification) {
            console.warn('[EventNotificationSystem] Invalid notification object');
            return;
        }
        
        const notificationData = {
            id: this.generateNotificationId(),
            type: notification.type || 'info',
            title: notification.title || '',
            message: notification.message || '',
            icon: notification.icon || '📢',
            priority: notification.priority || 'normal',
            duration: notification.duration || this.settings.notificationDuration,
            actions: notification.actions || [],
            timestamp: Date.now(),
            category: notification.category || 'general'
        };
        
        // 優先度に基づいて挿入位置を決定
        const insertIndex = this.findInsertIndex(notificationData.priority);
        this.notificationQueue.splice(insertIndex, 0, notificationData);
        
        console.log(`Notification queued: ${notificationData.title}`);
        
        // 即座に処理を試行
        this.processNotificationQueue();
        
        return notificationData.id;
    }
    
    /**
     * イベント開始通知
     */
    notifyEventStart(event) {
        if (!this.settings.eventStartNotifications) return;
        
        this.addNotification({
            type: 'event-start',
            title: 'イベント開始！',
            message: `${event.name}が開始されました`,
            icon: event.icon || '🎉',
            priority: 'high',
            category: 'event',
            actions: [
                {
                    text: '参加する',
                    action: () => this.joinEvent(event.id)
                },
                {
                    text: '詳細を見る',
                    action: () => this.showEventDetails(event.id)
                }
            ]
        });
    }
    
    /**
     * イベント終了通知
     */
    notifyEventEnd(event, results) {
        if (!this.settings.eventEndNotifications) return;
        
        const message = results ? 
            `${event.name}が終了しました。結果: ${results.rank}位` :
            `${event.name}が終了しました`;
        
        this.addNotification({
            type: 'event-end',
            title: 'イベント終了',
            message: message,
            icon: event.icon || '🏁',
            priority: 'normal',
            category: 'event',
            actions: results ? [
                {
                    text: '結果を見る',
                    action: () => this.showEventResults(event.id)
                }
            ] : []
        });
    }
    
    /**
     * 実績解除通知
     */
    notifyAchievementUnlocked(achievement) {
        if (!this.settings.achievementNotifications) return;
        
        this.addNotification({
            type: 'achievement',
            title: '実績解除！',
            message: `「${achievement.name}」を達成しました`,
            icon: '🏆',
            priority: 'high',
            category: 'achievement',
            actions: [
                {
                    text: '実績を見る',
                    action: () => this.showAchievements()
                }
            ]
        });
    }
    
    /**
     * ランキング更新通知
     */
    notifyRankingUpdate(rankingData) {
        if (!this.settings.rankingNotifications) return;
        
        const message = rankingData.improvement > 0 ?
            `ランキングが${rankingData.improvement}位上昇しました！` :
            `現在のランキング: ${rankingData.currentRank}位`;
        
        this.addNotification({
            type: 'ranking',
            title: 'ランキング更新',
            message: message,
            icon: '👑',
            priority: 'normal',
            category: 'ranking',
            actions: [
                {
                    text: 'ランキングを見る',
                    action: () => this.showRanking()
                }
            ]
        });
    }
    
    /**
     * 通知キューを処理
     */
    processNotificationQueue() {
        if (this.notificationQueue.length === 0) return;
        
        const availableSlots = this.settings.maxActiveNotifications - this.activeNotifications.size;
        if (availableSlots <= 0) return;
        
        const notificationsToShow = this.notificationQueue.splice(0, availableSlots);
        
        notificationsToShow.forEach(notification => {
            this.showNotification(notification);
        });
    }
    
    /**
     * 通知を表示
     */
    showNotification(notification) {
        // 既にアクティブな同種の通知があるかチェック
        const existingNotification = Array.from(this.activeNotifications.values())
            .find(n => n.type === notification.type && n.category === notification.category);
        
        if (existingNotification) {
            // 既存の通知を更新
            this.updateNotification(existingNotification.id, notification);
            return;
        }
        
        // 新しい通知を表示
        notification.showTime = Date.now();
        notification.expireTime = notification.showTime + notification.duration;
        
        this.activeNotifications.set(notification.id, notification);
        
        // UIに通知表示を要求
        if (this.gameEngine.uiManager) {
            this.gameEngine.uiManager.showNotification(notification);
        }
        
        // 履歴に記録
        this.notificationHistory.push({
            ...notification,
            status: 'shown'
        });
        
        console.log(`Notification shown: ${notification.title}`);
        
        // 自動削除タイマー設定
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, notification.duration);
    }
    
    /**
     * 通知を更新
     */
    updateNotification(notificationId, newData) {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) return;
        
        // データを更新
        Object.assign(notification, newData);
        notification.expireTime = Date.now() + notification.duration;
        
        // UIに更新を要求
        if (this.gameEngine.uiManager) {
            this.gameEngine.uiManager.updateNotification(notification);
        }
        
        console.log(`Notification updated: ${notification.title}`);
    }
    
    /**
     * 通知を削除
     */
    removeNotification(notificationId) {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) return;
        
        this.activeNotifications.delete(notificationId);
        
        // UIから通知削除を要求
        if (this.gameEngine.uiManager) {
            this.gameEngine.uiManager.removeNotification(notificationId);
        }
        
        console.log(`Notification removed: ${notification.title}`);
        
        // キューに残りがあれば処理
        this.processNotificationQueue();
    }
    
    /**
     * 期限切れ通知をチェック
     */
    checkExpiredNotifications() {
        const currentTime = Date.now();
        const expiredNotifications = [];
        
        this.activeNotifications.forEach((notification, id) => {
            if (currentTime > notification.expireTime) {
                expiredNotifications.push(id);
            }
        });
        
        expiredNotifications.forEach(id => {
            this.removeNotification(id);
        });
    }
    
    /**
     * 通知IDを生成
     */
    generateNotificationId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 優先度に基づく挿入位置を検索
     */
    findInsertIndex(priority) {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const targetPriority = priorityOrder[priority] || 1;
        
        for (let i = 0; i < this.notificationQueue.length; i++) {
            const itemPriority = priorityOrder[this.notificationQueue[i].priority] || 1;
            if (targetPriority < itemPriority) {
                return i;
            }
        }
        
        return this.notificationQueue.length;
    }
    
    /**
     * イベントアクション: イベント参加
     */
    joinEvent(eventId) {
        if (this.gameEngine.eventStageManager) {
            this.gameEngine.eventStageManager.startEventStage(eventId);
        }
    }
    
    /**
     * イベントアクション: イベント詳細表示
     */
    showEventDetails(eventId) {
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.switchToScene('EventDetailsScene', { eventId });
        }
    }
    
    /**
     * イベントアクション: イベント結果表示
     */
    showEventResults(eventId) {
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.switchToScene('EventResultsScene', { eventId });
        }
    }
    
    /**
     * イベントアクション: 実績表示
     */
    showAchievements() {
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.switchToScene('UserInfoScene', { tab: 'achievements' });
        }
    }
    
    /**
     * イベントアクション: ランキング表示
     */
    showRanking() {
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.switchToScene('UserInfoScene', { tab: 'leaderboard' });
        }
    }
    
    /**
     * 通知設定を更新
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        console.log('Notification settings updated:', newSettings);
    }
    
    /**
     * アクティブな通知を取得
     */
    getActiveNotifications() {
        return Array.from(this.activeNotifications.values());
    }
    
    /**
     * 通知履歴を取得
     */
    getNotificationHistory(limit = 50) {
        return this.notificationHistory.slice(-limit);
    }
    
    /**
     * すべての通知をクリア
     */
    clearAllNotifications() {
        this.notificationQueue.length = 0;
        
        this.activeNotifications.forEach((notification, id) => {
            this.removeNotification(id);
        });
        
        console.log('All notifications cleared');
    }

    /**
     * 通知をチェック（EventStageManager対応）
     * アクティブな通知と期限切れ通知を確認・管理
     */
    checkNotifications() {
        try {
            const currentTime = Date.now();
            const expiredNotifications = [];
            
            // 期限切れ通知を特定
            this.activeNotifications.forEach((notification, id) => {
                if (notification.expiresAt && currentTime > notification.expiresAt) {
                    expiredNotifications.push(id);
                }
            });
            
            // 期限切れ通知を削除
            expiredNotifications.forEach(id => {
                this.removeNotification(id);
            });
            
            // 通知キューから新しい通知を処理
            if (this.notificationQueue.length > 0 && this.activeNotifications.size < this.settings.maxDisplayCount) {
                const nextNotification = this.notificationQueue.shift();
                this.displayNotification(nextNotification);
            }
            
            // 統計情報を更新
            if (expiredNotifications.length > 0) {
                console.log(`[EventNotificationSystem] ${expiredNotifications.length}個の期限切れ通知を削除`);
            }
            
            return {
                activeCount: this.activeNotifications.size,
                queueCount: this.notificationQueue.length,
                expiredCount: expiredNotifications.length
            };
            
        } catch (error) {
            console.error('[EventNotificationSystem] checkNotifications error:', error);
            return {
                activeCount: 0,
                queueCount: 0,
                expiredCount: 0
            };
        }
    }
    
    /**
     * リソースクリーンアップ
     */
    dispose() {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
            this.notificationCheckInterval = null;
        }
        
        this.clearAllNotifications();
        this.notificationHistory.length = 0;
        
        console.log('EventNotificationSystem disposed');
    }
}