/**
 * EventNotificationSystem.ts
 * イベント通知システム
 * EventStageManagerから分離された通知機能
 */

interface NotificationSettings {
    enableNotifications: boolean;
    eventStartNotifications: boolean;
    eventEndNotifications: boolean;
    achievementNotifications: boolean;
    rankingNotifications: boolean;
    maxActiveNotifications: number;
    notificationDuration: number;
    animationDuration: number;
    maxDisplayCount?: number;
}

interface NotificationAction {
    text: string;
    action: () => void;
}

interface NotificationData {
    id: string;
    type: string;
    title: string;
    message: string;
    icon: string;
    priority: 'high' | 'normal' | 'low';
    duration: number;
    actions: NotificationAction[];
    timestamp: number;
    category: string;
    showTime?: number;
    expireTime?: number;
    expiresAt?: number;
}

interface NotificationInput {
    type?: string;
    title?: string;
    message?: string;
    icon?: string;
    priority?: 'high' | 'normal' | 'low';
    duration?: number;
    actions?: NotificationAction[];
    category?: string;
}

interface NotificationHistoryEntry extends NotificationData {
    status: string;
}

interface Event {
    id: string;
    name: string;
    icon?: string;
}

interface EventResults {
    rank: number;
}

interface Achievement {
    name: string;
}

interface RankingData {
    improvement: number;
    currentRank: number;
}

export class EventNotificationSystem {
    private gameEngine: any;
    private notificationQueue: NotificationData[] = [];
    private activeNotifications: Map<string, NotificationData> = new Map();
    private notificationHistory: NotificationHistoryEntry[] = [];
    private notificationCheckInterval: number | null = null;
    private settings: NotificationSettings;

    constructor(gameEngine: any) {
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
    private startNotificationChecking(): void {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }
        
        // 30秒ごとに通知をチェック
        this.notificationCheckInterval = setInterval(() => {
            this.processNotificationQueue();
            this.checkExpiredNotifications();
        }, 30000) as unknown as number;
        
        // 初回チェック
        this.processNotificationQueue();
    }
    
    /**
     * 通知を追加
     */
    addNotification(notification: NotificationInput): string | undefined {
        if (!this.settings.enableNotifications) {
            return;
        }

        const fullNotification: NotificationData = {
            id: this.generateNotificationId(),
            type: notification.type || 'info',
            title: notification.title || '',
            message: notification.message || '',
            icon: notification.icon || '🔔',
            priority: notification.priority || 'normal',
            duration: notification.duration || this.settings.notificationDuration,
            actions: notification.actions || [],
            timestamp: Date.now(),
            category: notification.category || 'general',
            expiresAt: Date.now() + (notification.duration || this.settings.notificationDuration)
        };

        this.notificationQueue.push(fullNotification);
        this.processNotificationQueue();
        
        console.log(`Notification added: ${fullNotification.title}`);
        return fullNotification.id;
    }
    
    /**
     * イベント開始通知
     */
    notifyEventStart(event: Event): void {
        if (!this.settings.eventStartNotifications) {
            return;
        }

        this.addNotification({
            type: 'event_start',
            title: 'イベント開始',
            message: `${event.name}が開始されました！`,
            icon: event.icon || '🎉',
            priority: 'high',
            category: 'event',
            actions: [{
                text: 'イベントを開く',
                action: () => {
                    // イベント画面への遷移ロジック
                    console.log(`Opening event: ${event.id}`);
                }
            }]
        });
    }
    
    /**
     * イベント終了通知
     */
    notifyEventEnd(event: Event, results: EventResults): void {
        if (!this.settings.eventEndNotifications) {
            return;
        }

        this.addNotification({
            type: 'event_end',
            title: 'イベント完了',
            message: `${event.name}が完了しました！ランク: ${results.rank}`,
            icon: '🏆',
            priority: 'high',
            category: 'event'
        });
    }
    
    /**
     * 実績解除通知
     */
    notifyAchievementUnlock(achievement: Achievement): void {
        if (!this.settings.achievementNotifications) {
            return;
        }

        this.addNotification({
            type: 'achievement',
            title: '実績解除',
            message: `「${achievement.name}」を獲得しました！`,
            icon: '🏅',
            priority: 'high',
            category: 'achievement'
        });
    }
    
    /**
     * ランキング更新通知
     */
    notifyRankingUpdate(rankingData: RankingData): void {
        if (!this.settings.rankingNotifications) {
            return;
        }

        const improvementText = rankingData.improvement > 0 ? 
            `ランクアップ！ ${rankingData.improvement}位上昇` :
            rankingData.improvement < 0 ? 
            `${Math.abs(rankingData.improvement)}位ダウン` :
            'ランクに変動はありません';

        this.addNotification({
            type: 'ranking',
            title: 'ランキング更新',
            message: `現在のランク: ${rankingData.currentRank}位 (${improvementText})`,
            icon: '📊',
            priority: 'normal',
            category: 'ranking'
        });
    }
    
    /**
     * 通知キューを処理
     */
    private processNotificationQueue(): void {
        while (this.notificationQueue.length > 0 && 
               this.activeNotifications.size < this.settings.maxActiveNotifications) {
            const notification = this.notificationQueue.shift()!;
            this.displayNotification(notification);
        }
    }
    
    /**
     * 通知を表示
     */
    private displayNotification(notification: NotificationData): void {
        notification.showTime = Date.now();
        this.activeNotifications.set(notification.id, notification);
        
        // 履歴に追加
        this.notificationHistory.push({
            ...notification,
            status: 'displayed'
        });
        
        // DOM要素作成と表示ロジック
        this.createNotificationElement(notification);
        
        // 自動削除タイマー
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, notification.duration);
        
        console.log(`Notification displayed: ${notification.title}`);
    }
    
    /**
     * 通知DOM要素を作成
     */
    private createNotificationElement(notification: NotificationData): void {
        // 通知表示エリアを取得または作成
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // 通知要素を作成
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification notification-${notification.priority}`;
        element.style.cssText = `
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 300px;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform ${this.settings.animationDuration}ms ease-out;
        `;

        // 内容を設定
        element.innerHTML = `
            <div style="display: flex; align-items: flex-start;">
                <span style="font-size: 20px; margin-right: 8px;">${notification.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${notification.title}</div>
                    <div style="color: #666; font-size: 14px;">${notification.message}</div>
                    ${notification.actions.length > 0 ? this.createActionButtons(notification.actions) : ''}
                </div>
            </div>
        `;

        // 閉じるボタン
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #999;
        `;
        closeBtn.onclick = () => this.removeNotification(notification.id);
        element.appendChild(closeBtn);

        container.appendChild(element);

        // アニメーション
        requestAnimationFrame(() => {
            element.style.transform = 'translateX(0)';
        });
    }
    
    /**
     * アクションボタンを作成
     */
    private createActionButtons(actions: NotificationAction[]): string {
        return `
            <div style="margin-top: 8px;">
                ${actions.map(action => 
                    `<button onclick="(${action.action.toString()})()" 
                             style="padding: 4px 8px; margin-right: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5; cursor: pointer;">
                        ${action.text}
                    </button>`
                ).join('')}
            </div>
        `;
    }
    
    /**
     * 通知を削除
     */
    removeNotification(notificationId: string): void {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) {
            return;
        }

        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
            element.style.transform = 'translateX(100%)';
            setTimeout(() => {
                element.remove();
            }, this.settings.animationDuration);
        }

        this.activeNotifications.delete(notificationId);
        
        // 履歴を更新
        const historyEntry = this.notificationHistory.find(entry => entry.id === notificationId);
        if (historyEntry) {
            historyEntry.status = 'dismissed';
        }
        
        // 次の通知を処理
        this.processNotificationQueue();
        
        console.log(`Notification removed: ${notificationId}`);
    }
    
    /**
     * 期限切れ通知をチェック
     */
    private checkExpiredNotifications(): void {
        const now = Date.now();
        
        this.activeNotifications.forEach((notification, id) => {
            if (notification.expiresAt && now > notification.expiresAt) {
                this.removeNotification(id);
            }
        });
    }
    
    /**
     * 全ての通知をクリア
     */
    clearAllNotifications(): void {
        // アクティブな通知を削除
        this.activeNotifications.forEach((_, id) => {
            this.removeNotification(id);
        });
        
        // キューをクリア
        this.notificationQueue = [];
        
        console.log('All notifications cleared');
    }
    
    /**
     * 通知設定を更新
     */
    updateSettings(newSettings: Partial<NotificationSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        console.log('Notification settings updated');
    }
    
    /**
     * 通知履歴を取得
     */
    getNotificationHistory(limit?: number): NotificationHistoryEntry[] {
        const history = [...this.notificationHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }
    
    /**
     * 通知IDを生成
     */
    private generateNotificationId(): string {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * リソースクリーンアップ
     */
    dispose(): void {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
            this.notificationCheckInterval = null;
        }
        
        this.clearAllNotifications();
        
        // 通知コンテナを削除
        const container = document.getElementById('notification-container');
        if (container) {
            container.remove();
        }
        
        console.log('EventNotificationSystem disposed');
    }
}