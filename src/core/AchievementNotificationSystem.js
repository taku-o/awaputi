/**
 * 実績通知システムクラス
 */
export class AchievementNotificationSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.canvas = gameEngine.canvas;
        this.context = gameEngine.context;
        
        // 通知管理
        this.notifications = [];
        this.notificationQueue = [];
        this.maxDisplayedNotifications = 3;
        this.notificationDuration = 4000; // 4秒表示
        
        // アニメーション設定
        this.animationDuration = 500; // フェード/スライドアニメーション
        this.slideDistance = 100; // スライド距離
        
        // 表示位置設定
        this.notificationWidth = 320;
        this.notificationHeight = 80;
        this.notificationMargin = 10;
        this.notificationPadding = 15;
        
        // 音響効果
        this.soundEnabled = true;
        
        this.initialize();
        this.setupEventListeners();
    }
    
    /**
     * 通知システムを初期化
     */
    initialize() {
        // 実績マネージャーから通知を定期的にチェック
        this.checkInterval = setInterval(() => {
            this.checkForNewNotifications();
        }, 100); // 100ms毎にチェック
        
        console.log('Achievement Notification System initialized');
    }
    
    /**
     * 新しい通知をチェック
     */
    checkForNewNotifications() {
        if (!this.gameEngine.achievementManager) return;
        
        const newNotifications = this.gameEngine.achievementManager.getNotifications();
        
        newNotifications.forEach(notification => {
            this.queueNotification(notification);
        });
    }
    
    /**
     * 通知をキューに追加
     */
    queueNotification(achievementData) {
        const notification = this.createNotification(achievementData);
        this.notificationQueue.push(notification);
        this.processNotificationQueue();
    }
    
    /**
     * 通知オブジェクトを作成
     */
    createNotification(achievementData) {
        // イベント通知の場合は専用処理
        if (achievementData.type === 'event') {
            return this.createEventNotification(achievementData);
        }
        
        // 通常の実績通知
        return {
            id: achievementData.id,
            name: achievementData.name,
            description: achievementData.description,
            icon: achievementData.icon,
            reward: achievementData.reward,
            timestamp: achievementData.timestamp || Date.now(),
            type: 'achievement',
            
            // アニメーション状態
            animationState: 'entering',
            animationProgress: 0,
            displayTime: 0,
            
            // 表示位置
            x: this.canvas.width,
            y: 0,
            targetX: this.canvas.width - this.notificationWidth - this.notificationMargin,
            targetY: 0,
            
            // 視覚効果
            alpha: 0,
            scale: 0.8,
            
            // フラグ
            displayed: false,
            shouldRemove: false
        };
    }
    
    /**
     * イベント通知オブジェクトを作成
     */
    createEventNotification(eventData) {
        return {
            id: eventData.id,
            name: eventData.name,
            description: eventData.description,
            icon: eventData.icon,
            reward: eventData.reward,
            timestamp: eventData.timestamp || Date.now(),
            type: 'event',
            subType: eventData.subType,
            eventId: eventData.eventId,
            duration: eventData.duration || this.notificationDuration,
            actions: eventData.actions || [],
            
            // アニメーション状態
            animationState: 'entering',
            animationProgress: 0,
            displayTime: 0,
            
            // 表示位置
            x: this.canvas.width,
            y: 0,
            targetX: this.canvas.width - this.notificationWidth - this.notificationMargin,
            targetY: 0,
            
            // 視覚効果
            alpha: 0,
            scale: 0.8,
            
            // フラグ
            displayed: false,
            shouldRemove: false,
            
            // イベント固有プロパティ
            isEventNotification: true,
            clickable: eventData.actions && eventData.actions.length > 0
        };
    }
    
    /**
     * 通知キューを処理
     */
    processNotificationQueue() {
        // 表示中の通知数が上限未満の場合、新しい通知を表示開始
        while (this.notifications.length < this.maxDisplayedNotifications && 
               this.notificationQueue.length > 0) {
            
            const notification = this.notificationQueue.shift();
            this.showNotification(notification);
        }
    }
    
    /**
     * 通知の表示を開始
     */
    showNotification(notification) {
        // 表示位置を計算
        const index = this.notifications.length;
        notification.targetY = this.notificationMargin + 
                               (this.notificationHeight + this.notificationMargin) * index;
        notification.y = notification.targetY;
        
        // 通知を表示リストに追加
        this.notifications.push(notification);
        
        // 音響効果を再生
        this.playUnlockSound(notification);
        
        console.log(`Achievement notification shown: ${notification.name}`);
    }
    
    /**
     * 音響効果を再生
     */
    playUnlockSound(achievement) {
        if (!this.soundEnabled || !this.gameEngine.audioManager) return;
        
        // 実績のレアリティに応じて異なる音を再生
        const rarity = this.getAchievementRarity(achievement);
        
        try {
            switch (rarity) {
                case 'legendary':
                    this.gameEngine.audioManager.playSound('achievement_legendary');
                    break;
                case 'epic':
                    this.gameEngine.audioManager.playSound('achievement_epic');
                    break;
                case 'rare':
                    this.gameEngine.audioManager.playSound('achievement_rare');
                    break;
                default:
                    this.gameEngine.audioManager.playSound('achievement_common');
                    break;
            }
        } catch (error) {
            console.warn('Failed to play achievement sound:', error);
        }
    }
    
    /**
     * 実績のレアリティを取得
     */
    getAchievementRarity(achievement) {
        const ap = achievement.reward?.ap || 0;
        
        if (ap >= 500) return 'legendary';
        if (ap >= 300) return 'epic';
        if (ap >= 150) return 'rare';
        return 'common';
    }
    
    /**
     * 通知システムを更新
     */
    update(deltaTime) {
        // 表示中の通知を更新
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            this.updateNotification(notification, deltaTime);
            
            // 削除フラグが立った通知を削除
            if (notification.shouldRemove) {
                this.notifications.splice(i, 1);
                this.repositionNotifications();
            }
        }
        
        // キューにある通知があれば処理
        if (this.notificationQueue.length > 0) {
            this.processNotificationQueue();
        }
    }
    
    /**
     * 個別通知を更新
     */
    updateNotification(notification, deltaTime) {
        const animSpeed = 1000 / this.animationDuration; // アニメーション速度
        
        switch (notification.animationState) {
            case 'entering':
                notification.animationProgress += deltaTime * animSpeed;
                
                if (notification.animationProgress >= 1.0) {
                    notification.animationProgress = 1.0;
                    notification.animationState = 'displaying';
                    notification.displayTime = 0;
                }
                
                // イージングアニメーション
                const enterProgress = this.easeOutBack(notification.animationProgress);
                notification.x = this.canvas.width - (this.notificationWidth + this.notificationMargin) * enterProgress;
                notification.alpha = enterProgress;
                notification.scale = 0.8 + 0.2 * enterProgress;
                break;
                
            case 'displaying':
                notification.displayTime += deltaTime;
                notification.alpha = 1.0;
                notification.scale = 1.0;
                notification.x = notification.targetX;
                
                if (notification.displayTime >= this.notificationDuration) {
                    notification.animationState = 'exiting';
                    notification.animationProgress = 0;
                }
                break;
                
            case 'exiting':
                notification.animationProgress += deltaTime * animSpeed;
                
                if (notification.animationProgress >= 1.0) {
                    notification.shouldRemove = true;
                    return;
                }
                
                // フェードアウトアニメーション
                const exitProgress = notification.animationProgress;
                notification.alpha = 1.0 - exitProgress;
                notification.x = notification.targetX + this.slideDistance * exitProgress;
                break;
        }
    }
    
    /**
     * 通知の位置を再調整
     */
    repositionNotifications() {
        this.notifications.forEach((notification, index) => {
            notification.targetY = this.notificationMargin + 
                                  (this.notificationHeight + this.notificationMargin) * index;
        });
    }
    
    /**
     * イージング関数（バックイーズアウト）
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    
    /**
     * 通知を描画
     */
    render() {
        if (this.notifications.length === 0) return;
        
        this.notifications.forEach(notification => {
            this.renderNotificationPopup(notification);
        });
    }
    
    /**
     * 通知ポップアップを描画
     */
    renderNotificationPopup(notification) {
        const ctx = this.context;
        
        ctx.save();
        
        // 透明度とスケールを適用
        ctx.globalAlpha = notification.alpha;
        
        const centerX = notification.x + this.notificationWidth / 2;
        const centerY = notification.y + this.notificationHeight / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(notification.scale, notification.scale);
        ctx.translate(-this.notificationWidth / 2, -this.notificationHeight / 2);
        
        // 通知タイプに応じて描画
        if (notification.type === 'event') {
            this.renderEventNotificationBackground(ctx, notification);
            this.renderEventNotificationContent(ctx, notification);
        } else {
            this.renderNotificationBackground(ctx, notification);
            this.renderNotificationContent(ctx, notification);
        }
        
        ctx.restore();
    }
    
    /**
     * イベント通知の背景を描画
     */
    renderEventNotificationBackground(ctx, notification) {
        // イベント通知のタイプに応じた背景色
        let gradient;
        switch (notification.subType) {
            case 'EVENT_STARTED':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#00C851');
                gradient.addColorStop(1, '#007E33');
                break;
            case 'EVENT_ENDING':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#FF8800');
                gradient.addColorStop(1, '#FF6600');
                break;
            case 'EVENT_ENDED':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#757575');
                gradient.addColorStop(1, '#424242');
                break;
            case 'EVENT_ELIGIBLE':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#2196F3');
                gradient.addColorStop(1, '#0D47A1');
                break;
            case 'EVENT_REMINDER':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#9C27B0');
                gradient.addColorStop(1, '#4A148C');
                break;
            default:
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#607D8B');
                gradient.addColorStop(1, '#37474F');
                break;
        }
        
        // 背景の描画
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.notificationWidth, this.notificationHeight);
        
        // 枠線
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.notificationWidth, this.notificationHeight);
        
        // 光る効果
        if (notification.animationState === 'entering') {
            ctx.save();
            ctx.globalAlpha = 0.3 * (1 - notification.animationProgress);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, this.notificationWidth, this.notificationHeight);
            ctx.restore();
        }
        
        // イベントタイプのインジケーター
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, 4, this.notificationHeight);
    }
    
    /**
     * イベント通知のコンテンツを描画
     */
    renderEventNotificationContent(ctx, notification) {
        // アイコンを描画
        this.renderEventNotificationIcon(ctx, notification);
        
        // テキストを描画
        this.renderEventNotificationText(ctx, notification);
        
        // アクションボタンを描画
        this.renderEventNotificationActions(ctx, notification);
    }
    
    /**
     * イベント通知アイコンを描画
     */
    renderEventNotificationIcon(ctx, notification) {
        const iconSize = 36;
        const iconX = this.notificationPadding + 4;
        const iconY = (this.notificationHeight - iconSize) / 2;
        
        ctx.save();
        
        // アイコン背景（円形）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // アイコン（絵文字）
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(
            notification.icon, 
            iconX + iconSize / 2, 
            iconY + iconSize / 2
        );
        
        ctx.restore();
    }
    
    /**
     * イベント通知テキストを描画
     */
    renderEventNotificationText(ctx, notification) {
        const textX = this.notificationPadding + 50;
        const textY = this.notificationPadding + 2;
        const textWidth = this.notificationWidth - textX - this.notificationPadding - 80;
        
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        
        // タイトル
        ctx.font = 'bold 15px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const titleText = this.truncateText(ctx, notification.name, textWidth);
        ctx.fillText(titleText, textX, textY);
        
        // 説明
        ctx.font = '11px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const descText = this.truncateText(ctx, notification.description, textWidth);
        ctx.fillText(descText, textX, textY + 18);
        
        // イベントタイプ表示
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const typeText = this.getEventTypeDisplayText(notification.subType);
        ctx.fillText(typeText, textX, textY + 35);
        
        ctx.restore();
    }
    
    /**
     * イベント通知アクションを描画
     */
    renderEventNotificationActions(ctx, notification) {
        if (!notification.actions || notification.actions.length === 0) return;
        
        const actionWidth = 60;
        const actionHeight = 20;
        const actionX = this.notificationWidth - this.notificationPadding - actionWidth;
        const actionY = this.notificationHeight - this.notificationPadding - actionHeight - 5;
        
        ctx.save();
        
        // 最初のアクションボタンのみ表示
        const primaryAction = notification.actions[0];
        
        // ボタン背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(actionX, actionY, actionWidth, actionHeight);
        
        // ボタンテキスト
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333333';
        ctx.fillText(
            primaryAction,
            actionX + actionWidth / 2,
            actionY + actionHeight / 2
        );
        
        // ボタン枠線
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(actionX, actionY, actionWidth, actionHeight);
        
        ctx.restore();
    }
    
    /**
     * イベントタイプの表示テキストを取得
     */
    getEventTypeDisplayText(subType) {
        switch (subType) {
            case 'EVENT_STARTED': return 'イベント開始';
            case 'EVENT_ENDING': return 'まもなく終了';
            case 'EVENT_ENDED': return 'イベント終了';
            case 'EVENT_ELIGIBLE': return '参加可能';
            case 'EVENT_REMINDER': return 'リマインダー';
            default: return 'イベント';
        }
    }
    
    /**
     * 通知の背景を描画
     */
    renderNotificationBackground(ctx, notification) {
        const rarity = this.getAchievementRarity(notification);
        
        // レアリティに応じた背景色
        let gradient;
        switch (rarity) {
            case 'legendary':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                break;
            case 'epic':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#9932CC');
                gradient.addColorStop(1, '#8A2BE2');
                break;
            case 'rare':
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#4169E1');
                gradient.addColorStop(1, '#0000CD');
                break;
            default:
                gradient = ctx.createLinearGradient(0, 0, this.notificationWidth, 0);
                gradient.addColorStop(0, '#32CD32');
                gradient.addColorStop(1, '#228B22');
                break;
        }
        
        // 背景の描画
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.notificationWidth, this.notificationHeight);
        
        // 枠線
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.notificationWidth, this.notificationHeight);
        
        // 光る効果
        if (notification.animationState === 'entering') {
            ctx.save();
            ctx.globalAlpha = 0.3 * (1 - notification.animationProgress);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, this.notificationWidth, this.notificationHeight);
            ctx.restore();
        }
    }
    
    /**
     * 通知のコンテンツを描画
     */
    renderNotificationContent(ctx, notification) {
        // アイコンを描画
        this.renderNotificationIcon(ctx, notification);
        
        // テキストを描画
        this.renderNotificationText(ctx, notification);
        
        // 報酬を描画
        this.renderNotificationReward(ctx, notification);
    }
    
    /**
     * 通知アイコンを描画
     */
    renderNotificationIcon(ctx, notification) {
        const iconSize = 40;
        const iconX = this.notificationPadding;
        const iconY = (this.notificationHeight - iconSize) / 2;
        
        ctx.save();
        
        // アイコン背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(iconX - 5, iconY - 5, iconSize + 10, iconSize + 10);
        
        // アイコン（絵文字）
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(
            notification.icon, 
            iconX + iconSize / 2, 
            iconY + iconSize / 2
        );
        
        ctx.restore();
    }
    
    /**
     * 通知テキストを描画
     */
    renderNotificationText(ctx, notification) {
        const textX = this.notificationPadding + 50;
        const textY = this.notificationPadding;
        const textWidth = this.notificationWidth - textX - this.notificationPadding - 60;
        
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        
        // タイトル
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const titleText = this.truncateText(ctx, notification.name, textWidth);
        ctx.fillText(titleText, textX, textY);
        
        // 説明
        ctx.font = '12px Arial';
        const descText = this.truncateText(ctx, notification.description, textWidth);
        ctx.fillText(descText, textX, textY + 20);
        
        ctx.restore();
    }
    
    /**
     * 通知報酬を描画
     */
    renderNotificationReward(ctx, notification) {
        if (!notification.reward || !notification.reward.ap) return;
        
        const rewardX = this.notificationWidth - this.notificationPadding - 50;
        const rewardY = this.notificationHeight / 2;
        
        ctx.save();
        
        // 報酬背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(rewardX - 25, rewardY - 15, 50, 30);
        
        // AP表示
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`+${notification.reward.ap}AP`, rewardX, rewardY);
        
        ctx.restore();
    }
    
    /**
     * テキストを指定幅に収まるように切り詰め
     */
    truncateText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) {
            return text;
        }
        
        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }
    
    /**
     * 通知をすべてクリア
     */
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            notification.animationState = 'exiting';
            notification.animationProgress = 0;
        });
        
        this.notificationQueue = [];
    }
    
    /**
     * 音響効果の有効/無効を切り替え
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        this.canvas.addEventListener('click', (event) => {
            this.handleNotificationClick(event);
        });
    }
    
    /**
     * 通知クリック処理
     */
    handleNotificationClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 表示中の通知をチェック
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            
            // 通知領域内かチェック
            if (this.isPointInNotification(x, y, notification)) {
                if (notification.type === 'event' && notification.clickable) {
                    this.handleEventNotificationClick(notification, x, y);
                    return;
                }
            }
        }
    }
    
    /**
     * 点が通知領域内にあるかチェック
     */
    isPointInNotification(x, y, notification) {
        const notificationX = notification.targetX;
        const notificationY = notification.targetY;
        
        return x >= notificationX && 
               x <= notificationX + this.notificationWidth &&
               y >= notificationY && 
               y <= notificationY + this.notificationHeight;
    }
    
    /**
     * イベント通知クリック処理
     */
    handleEventNotificationClick(notification, x, y) {
        // アクションボタンクリックかチェック
        const actionWidth = 60;
        const actionHeight = 20;
        const actionX = notification.targetX + this.notificationWidth - this.notificationPadding - actionWidth;
        const actionY = notification.targetY + this.notificationHeight - this.notificationPadding - actionHeight - 5;
        
        if (x >= actionX && x <= actionX + actionWidth &&
            y >= actionY && y <= actionY + actionHeight) {
            
            // 最初のアクション（「参加する」など）を実行
            this.executeEventAction(notification, notification.actions[0]);
        } else {
            // 通知全体のクリック - 通知を閉じる
            this.dismissNotification(notification);
        }
    }
    
    /**
     * イベントアクションを実行
     */
    executeEventAction(notification, action) {
        console.log(`Event action executed: ${action} for event ${notification.eventId}`);
        
        switch (action) {
            case '参加する':
            case '今すぐ参加':
                // イベントステージ選択画面に遷移
                if (this.gameEngine.sceneManager) {
                    this.gameEngine.sceneManager.switchScene('stageSelect');
                    // イベントフィルターを有効化（Task 6-8で実装予定）
                }
                break;
                
            case '後で':
            case '閉じる':
                // 通知を閉じる
                this.dismissNotification(notification);
                break;
                
            default:
                this.dismissNotification(notification);
                break;
        }
    }
    
    /**
     * 通知を閉じる
     */
    dismissNotification(notification) {
        notification.animationState = 'exiting';
        notification.animationProgress = 0;
    }
    
    /**
     * 通知システムを破棄
     */
    dispose() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        this.notifications = [];
        this.notificationQueue = [];
        
        console.log('Achievement Notification System disposed');
    }
}