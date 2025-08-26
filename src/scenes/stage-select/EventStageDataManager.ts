/**
 * EventStageDataManager
 * イベントステージ関連のデータ管理と通知機能を担当
 */

import type { StageSelectScene } from '../StageSelectScene';
import type { EventStageManager } from '../../core/EventStageManager';
import type { AchievementNotificationSystem } from '../../core/achievements/AchievementNotificationSystem';

// Interfaces for Event Stage Data
export interface EventStage {
    id: string;
    name: string;
    description: string;
    icon?: string;
    type: 'seasonal' | 'special' | 'challenge' | 'default';
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    schedule?: {
        activatedAt?: number;
        deactivatedAt?: number;
    };
    activatedAt?: number;
    requirements?: EventRequirements;
    limits?: EventLimits;
    rewards?: EventRewards;
}

export interface EventRequirements {
    minLevel?: number;
    minAP?: number;
    clearedStages?: string[];
}

export interface EventLimits {
    maxParticipations?: number;
}

export interface EventRewards {
    ap?: number;
    items?: string[];
    badges?: string[];
}

export interface EventNotification {
    type: 'new_event' | 'ending_soon';
    eventId: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

export interface EventParticipationRecord {
    eventId: string;
    playerId: string;
    timestamp: number;
}

export interface NotificationData {
    type: "single" | "batch";
    title: string;
    message: string;
    icon: string;
    duration: number;
}

export interface EventAccessResult {
    canAccess: boolean;
    reason: string;
}

// Extended interfaces for game engine components
interface ExtendedGameEngine {
    canvas: HTMLCanvasElement;
    eventStageManager?: EventStageManager & {
        getAvailableEvents(): EventStage[];
        checkEventNotifications(): void;
        getEventTimeRemaining(eventId: string): number;
        isEventAvailable(eventId: string): boolean;
        getParticipationRecords(): EventParticipationRecord[];
        startEventStage(eventId: string): boolean;
        recordEventParticipation(eventId: string, playerId: string): void;
    };
    achievementNotificationSystem?: AchievementNotificationSystem & {
        queueNotification(notification: NotificationData): void;
    };
    playerData?: {
        getLevel?(): number;
        getAP?(): number;
        getClearedStages?(): string[];
        getPlayerId?(): string;
    };
    sceneManager?: {
        switchScene(sceneName: string, data?: any): void;
    };
}

export class EventStageDataManager {
    // @ts-expect-error - stageSelectScene is kept for API consistency
    private readonly stageSelectScene: StageSelectScene;
    private readonly gameEngine: ExtendedGameEngine;
    
    // イベント関連の状態
    private availableEvents: EventStage[] = [];
    private selectedEventIndex: number = -1;
    private showingEvents: boolean = false;
    private eventScrollOffset: number = 0;
    private readonly maxVisibleEvents: number = 4;
    
    // 通知関連の状態
    private eventNotifications: EventNotification[] = [];
    private unreadNotificationCount: number = 0;
    private notificationCheckInterval: number | null = null;

    constructor(stageSelectScene: StageSelectScene) {
        this.stageSelectScene = stageSelectScene;
        this.gameEngine = stageSelectScene.gameEngine as ExtendedGameEngine;
    }

    /**
     * イベントデータ管理の初期化
     */
    public initialize(): void {
        this.updateEventList();
        this.updateEventNotifications();
        this.selectedEventIndex = -1;
        this.eventScrollOffset = 0;
        
        // 定期的な通知更新を開始
        this.startNotificationUpdates();
    }

    /**
     * イベントデータ管理のクリーンアップ
     */
    public cleanup(): void {
        this.stopNotificationUpdates();
    }

    /**
     * 利用可能なイベントリストを更新
     */
    public updateEventList(): void {
        if (this.gameEngine.eventStageManager) {
            const rawEvents = this.gameEngine.eventStageManager.getAvailableEvents();
            // Convert raw events to EventStage format
            this.availableEvents = rawEvents.map((event: any) => ({
                id: event.id,
                name: event.name || event.id,
                description: event.description || '',
                icon: event.icon,
                type: event.type || 'default' as const,
                season: event.season,
                schedule: event.schedule,
                activatedAt: event.activatedAt || event.startTime,
                requirements: event.requirements,
                limits: event.limits,
                rewards: event.rewards
            }));
        } else {
            this.availableEvents = [];
        }
    }

    /**
     * イベント通知状態を更新
     */
    private updateEventNotifications(): void {
        if (!this.gameEngine.eventStageManager) {
            this.eventNotifications = [];
            this.unreadNotificationCount = 0;
            return;
        }
        
        // イベントマネージャーから通知情報を取得
        this.gameEngine.eventStageManager.checkEventNotifications();
        
        // 新規イベントの通知を生成
        const newEvents = this.availableEvents.filter(event => {
            const eventStartTime = event.schedule?.activatedAt || event.activatedAt;
            const now = Date.now();
            // 24時間以内に開始されたイベント
            return eventStartTime && (now - eventStartTime) < 24 * 60 * 60 * 1000;
        });
        
        // 終了間近のイベントの通知を生成
        const endingSoonEvents = this.availableEvents.filter(event => {
            const timeRemaining = this.gameEngine.eventStageManager!.getEventTimeRemaining(event.id);
            // 6時間以内に終了するイベント
            return timeRemaining > 0 && timeRemaining < 6 * 60 * 60 * 1000;
        });
        
        // 通知リストを更新
        this.eventNotifications = [
            ...newEvents.map(event => ({
                type: 'new_event' as const,
                eventId: event.id,
                title: '新しいイベント開始！',
                message: `${event.name}が開始されました`,
                timestamp: event.schedule?.activatedAt || event.activatedAt || Date.now(),
                read: false
            })),
            ...endingSoonEvents.map(event => ({
                type: 'ending_soon' as const,
                eventId: event.id,
                title: 'イベント終了間近！',
                message: `${event.name}まもなく終了`,
                timestamp: Date.now(),
                read: false
            }))
        ];
        
        // 未読通知数を計算
        this.unreadNotificationCount = this.eventNotifications.filter(n => !n.read).length;
    }

    /**
     * 定期的な通知更新を開始
     */
    private startNotificationUpdates(): void {
        // 既存のインターバルをクリア
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }
        
        // 30秒ごとに通知をチェック
        this.notificationCheckInterval = window.setInterval(() => {
            this.updateEventNotifications();
        }, 30000);
    }
    
    /**
     * 定期的な通知更新を停止
     */
    private stopNotificationUpdates(): void {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
            this.notificationCheckInterval = null;
        }
    }

    /**
     * イベント通知バッジを描画
     */
    public renderEventNotificationBadge(context: CanvasRenderingContext2D): void {
        if (this.unreadNotificationCount === 0) return;
        
        const canvas = this.gameEngine.canvas;
        const badgeSize = 24;
        const badgeX = canvas.width - 50;
        const badgeY = 130; // イベントセクションの右上

        context.save();
        context.fillStyle = '#FF4444';
        context.beginPath();
        context.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.stroke();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const displayCount = this.unreadNotificationCount > 99 ? '99+' : this.unreadNotificationCount.toString();
        context.fillText(displayCount, badgeX, badgeY);
        
        // 点滅効果（1秒間隔）
        const shouldBlink = Math.floor(Date.now() / 1000) % 2 === 0;
        if (shouldBlink) {
            context.shadowColor = '#FF4444';
            context.shadowBlur = 10;
            context.beginPath();
            context.arc(badgeX, badgeY, badgeSize / 2 + 2, 0, Math.PI * 2);
            context.strokeStyle = '#FF4444';
            context.lineWidth = 1;
            context.stroke();
        }
        
        context.restore();
    }

    /**
     * イベント通知クリック処理
     */
    public handleEventNotificationClick(x: number, y: number): boolean {
        const canvas = this.gameEngine.canvas;
        const badgeSize = 24;
        const badgeX = canvas.width - 50;
        const badgeY = 130;
        
        // バッジクリック判定
        const distance = Math.sqrt((x - badgeX) ** 2 + (y - badgeY) ** 2);
        if (distance <= badgeSize / 2) {
            // すべての通知を既読にする
            this.eventNotifications.forEach(notification => {
                notification.read = true;
            });
            this.unreadNotificationCount = 0;
            
            // 通知詳細を表示（シンプルなアラート）
            if (this.eventNotifications.length > 0) {
                const latestNotification = this.eventNotifications[this.eventNotifications.length - 1];
                // 通知メッセージをユーザーに表示
                if (this.gameEngine.achievementNotificationSystem) {
                    this.gameEngine.achievementNotificationSystem.queueNotification({
                        type: 'info',
                        title: 'イベント通知',
                        message: latestNotification.message,
                        icon: '📢',
                        duration: 3000
                    });
                }
            }
            
            return true; // クリック処理済み
        }
        
        return false; // クリック処理されていない
    }

    /**
     * イベントステージのクリック処理
     */
    public handleEventStageClick(_x: number, y: number): void {
        const sectionStartY = 120;
        const itemHeight = 40;
        const itemSpacing = 5;
        const itemStartY = sectionStartY + 50;
        
        // クリックされたイベントアイテムを特定
        this.availableEvents.forEach((event, index) => {
            if (index < this.eventScrollOffset) return;
            if (index >= this.eventScrollOffset + this.maxVisibleEvents) return;
            
            const itemY = itemStartY + (index - this.eventScrollOffset) * (itemHeight + itemSpacing);
            
            if (y >= itemY && y <= itemY + itemHeight) {
                this.selectedEventIndex = index;
                this.showingEvents = true;
                // イベントステージを開始
                this.selectEventStage(event);
            }
        });
    }

    /**
     * イベントステージ選択処理
     */
    private selectEventStage(event: EventStage): void {
        if (!event) {
            console.warn('Invalid event provided to selectEventStage');
            return;
        }
        
        // イベント参加条件をチェック
        const accessResult = this.validateEventStageAccess(event);
        if (!accessResult.canAccess) {
            // アクセス拒否メッセージを表示
            if (this.gameEngine.achievementNotificationSystem) {
                this.gameEngine.achievementNotificationSystem.queueNotification({
                    type: 'warning',
                    title: 'イベント参加不可',
                    message: accessResult.reason,
                    icon: '⚠️',
                    duration: 4000
                });
            }
            return;
        }
        
        // イベントステージを開始
        this.startEventStageFromSelection(event);
    }

    /**
     * イベント参加条件チェック
     */
    private validateEventStageAccess(event: EventStage): EventAccessResult {
        const result: EventAccessResult = {
            canAccess: true,
            reason: ''
        };

        if (!this.gameEngine.eventStageManager) {
            result.canAccess = false;
            result.reason = 'イベントシステムが利用できません';
            return result;
        }
        
        // イベントが有効かチェック
        if (!this.gameEngine.eventStageManager.isEventAvailable(event.id)) {
            result.canAccess = false;
            result.reason = 'このイベントは現在利用できません';
            return result;
        }
        
        // イベント時間制限のチェック
        const timeRemaining = this.gameEngine.eventStageManager.getEventTimeRemaining(event.id);
        if (timeRemaining <= 0) {
            result.canAccess = false;
            result.reason = 'このイベントは終了しました';
            return result;
        }
        
        // プレイヤーレベル制限のチェック（もしある場合）
        if (event.requirements?.minLevel && this.gameEngine.playerData?.getLevel) {
            const playerLevel = this.gameEngine.playerData.getLevel();
            if (playerLevel < event.requirements.minLevel) {
                result.canAccess = false;
                result.reason = `レベル ${event.requirements.minLevel} 以上が必要です（現在: ${playerLevel}）`;
                return result;
            }
        }
        
        // 必要APのチェック（もしある場合）
        if (event.requirements?.minAP && this.gameEngine.playerData?.getAP) {
            const currentAP = this.gameEngine.playerData.getAP();
            if (currentAP < event.requirements.minAP) {
                result.canAccess = false;
                result.reason = `${event.requirements.minAP} AP以上が必要です（現在: ${currentAP} AP）`;
                return result;
            }
        }
        
        // 前提ステージクリア条件のチェック（もしある場合）
        if (event.requirements?.clearedStages && this.gameEngine.playerData?.getClearedStages) {
            const clearedStages = this.gameEngine.playerData.getClearedStages();
            const requiredStages = event.requirements.clearedStages;
            
            for (const requiredStage of requiredStages) {
                if (!clearedStages.includes(requiredStage)) {
                    result.canAccess = false;
                    result.reason = `「${requiredStage}」ステージのクリアが必要です`;
                    return result;
                }
            }
        }
        
        // 参加回数制限のチェック（もしある場合）
        if (event.limits?.maxParticipations) {
            const participationCount = this.getEventParticipationCount(event.id);
            if (participationCount >= event.limits.maxParticipations) {
                result.canAccess = false;
                result.reason = `参加回数の上限に達しています（${participationCount}/${event.limits.maxParticipations}）`;
                return result;
            }
        }
        
        return result;
    }

    /**
     * イベント参加回数を取得
     */
    private getEventParticipationCount(eventId: string): number {
        if (!this.gameEngine.eventStageManager) {
            return 0;
        }
        
        const participationRecords = this.gameEngine.eventStageManager.getParticipationRecords();
        return participationRecords.filter(record => record.eventId === eventId).length;
    }

    /**
     * イベントステージ開始処理
     */
    private startEventStageFromSelection(event: EventStage): void {
        try {
            if (!this.gameEngine.eventStageManager) {
                throw new Error('EventStageManager not available');
            }
            
            // イベントステージの開始を試行
            const success = this.gameEngine.eventStageManager.startEventStage(event.id);
            
            if (success) {
                // イベント参加の通知
                if (this.gameEngine.achievementNotificationSystem) {
                    this.gameEngine.achievementNotificationSystem.queueNotification({
                        type: 'success',
                        title: 'イベント開始！',
                        message: `${event.name}に参加しました`,
                        icon: '🎯',
                        duration: 3000
                    });
                }
                
                // ゲームシーンに遷移
                if (this.gameEngine.sceneManager) {
                    this.gameEngine.sceneManager.switchScene('game', {
                        stageType: 'event',
                        eventId: event.id,
                        eventConfig: event
                    });
                }
                
                // 参加統計を記録
                if (this.gameEngine.playerData?.getPlayerId) {
                    this.gameEngine.eventStageManager.recordEventParticipation(
                        event.id,
                        this.gameEngine.playerData.getPlayerId()
                    );
                }
            } else {
                // イベント開始失敗の通知
                if (this.gameEngine.achievementNotificationSystem) {
                    this.gameEngine.achievementNotificationSystem.queueNotification({
                        type: 'error',
                        title: 'イベント開始失敗',
                        message: 'イベントを開始できませんでした',
                        icon: '❌',
                        duration: 4000
                    });
                }
            }
        } catch (error) {
            console.error('Failed to start event stage:', error);
            
            // エラー通知
            if (this.gameEngine.achievementNotificationSystem) {
                this.gameEngine.achievementNotificationSystem.queueNotification({
                    type: 'error',
                    title: 'エラー',
                    message: 'イベントの開始中にエラーが発生しました',
                    icon: '⚠️',
                    duration: 4000
                });
            }
        }
    }

    /**
     * イベント専用セクションを描画
     */
    public renderEventSection(context: CanvasRenderingContext2D): void {
        const canvas = this.gameEngine.canvas;
        const sectionStartY = 120;
        const sectionHeight = 200;
        const sectionWidth = canvas.width - 40;
        const sectionX = 20;
        
        // イベントセクションの背景
        context.save();
        context.fillStyle = 'rgba(255, 215, 0, 0.1)';
        context.strokeStyle = '#FFD700';
        context.lineWidth = 2;
        context.fillRect(sectionX, sectionStartY, sectionWidth, sectionHeight);
        context.strokeRect(sectionX, sectionStartY, sectionWidth, sectionHeight);
        
        // イベントセクションタイトル
        context.fillStyle = '#FFD700';
        context.font = 'bold 24px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('🎉 期間限定イベント', sectionX + 10, sectionStartY + 10);
        context.restore();

        // イベントがない場合のメッセージ
        if (this.availableEvents.length === 0) {
            context.save();
            context.fillStyle = '#CCCCCC';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('現在開催中のイベントはありません',
                canvas.width / 2, sectionStartY + sectionHeight / 2);
            context.fillText('次回イベントをお楽しみに！',
                canvas.width / 2, sectionStartY + sectionHeight / 2 + 25);
            context.restore();
            return;
        }
        
        // イベントアイテムを描画
        const itemHeight = 40;
        const itemSpacing = 5;
        let currentY = sectionStartY + 50;
        
        this.availableEvents.forEach((event, index) => {
            if (index < this.eventScrollOffset) return;
            if (index >= this.eventScrollOffset + this.maxVisibleEvents) return;
            if (currentY + itemHeight > sectionStartY + sectionHeight - 10) return;
            
            const isSelected = index === this.selectedEventIndex;
            this.renderEventStageItem(context, event, sectionX + 10, currentY,
                sectionWidth - 20, itemHeight, isSelected);
            currentY += itemHeight + itemSpacing;
        });
    }

    /**
     * イベントステージアイテムを描画
     */
    private renderEventStageItem(
        context: CanvasRenderingContext2D,
        event: EventStage,
        x: number,
        y: number,
        width: number,
        height: number,
        isSelected: boolean
    ): void {
        context.save();
        
        // アイテム背景
        if (isSelected) {
            context.fillStyle = 'rgba(255, 215, 0, 0.3)';
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
        } else {
            context.fillStyle = 'rgba(255, 255, 255, 0.1)';
            context.strokeStyle = '#888888';
            context.lineWidth = 1;
        }
        
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);
        
        // イベントタイプアイコン
        const iconSize = 24;
        const iconX = x + 10;
        const iconY = y + (height - iconSize) / 2;

        context.font = `${iconSize}px Arial`;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        
        // タイプに応じたアイコン
        let icon = '🎪';
        if (event.type === 'seasonal') {
            if (event.season === 'spring') icon = '🌸';
            else if (event.season === 'summer') icon = '🎆';
            else if (event.season === 'autumn') icon = '🍂';
            else if (event.season === 'winter') icon = '❄️';
        } else if (event.type === 'special') {
            icon = '⭐';
        } else if (event.type === 'challenge') {
            icon = '🏆';
        }

        context.fillText(icon, iconX, iconY + iconSize / 2);
        
        // イベント名
        const nameX = iconX + iconSize + 10;
        const nameY = y + height / 2 - 5;

        context.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(event.name, nameX, nameY);
        
        // 残り時間表示
        if (this.gameEngine.eventStageManager) {
            const timeRemaining = this.gameEngine.eventStageManager.getEventTimeRemaining(event.id);
            if (timeRemaining > 0) {
                this.renderEventTimer(context, timeRemaining, x + width - 120, y + height / 2 + 5, 110, 15);
            }
        }
        
        // 新規バッジ（最近開始されたイベント）
        const now = Date.now();
        const eventStartTime = event.schedule?.activatedAt || event.activatedAt;
        if (eventStartTime && (now - eventStartTime) < 24 * 60 * 60 * 1000) { // 24時間以内
            context.fillStyle = '#FF4444';
            context.font = 'bold 12px Arial';
            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText('NEW!', x + width - 10, y + 5);
        }
        
        context.restore();
    }

    /**
     * イベント残り時間を表示
     */
    private renderEventTimer(
        context: CanvasRenderingContext2D,
        timeRemaining: number,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        context.save();
        
        // 残り時間の計算
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        let timeText = '';
        let urgencyLevel: 'normal' | 'warning' | 'critical' = 'normal';
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            timeText = `残り ${days}日`;
        } else if (hours > 0) {
            timeText = `残り ${hours}:${minutes.toString().padStart(2, '0')}`;
            if (hours < 6) urgencyLevel = 'warning';
        } else {
            timeText = `残り ${minutes}:${seconds.toString().padStart(2, '0')}`;
            urgencyLevel = 'critical';
        }
        
        // 背景色（緊急度に応じて）
        let bgColor: string, textColor: string;
        switch (urgencyLevel) {
            case 'critical':
                bgColor = 'rgba(255, 68, 68, 0.8)';
                textColor = '#FFFFFF';
                break;
            case 'warning':
                bgColor = 'rgba(255, 165, 0, 0.8)';
                textColor = '#FFFFFF';
                break;
            default:
                bgColor = 'rgba(34, 197, 94, 0.8)';
                textColor = '#FFFFFF';
        }
        
        // タイマー背景
        context.fillStyle = bgColor;
        context.fillRect(x, y, width, height);
        
        // タイマーテキスト
        context.fillStyle = textColor;
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(timeText, x + width / 2, y + height / 2);
        
        context.restore();
    }

    /**
     * イベントデータの取得
     */
    public getEventData() {
        return {
            availableEvents: this.availableEvents,
            selectedEventIndex: this.selectedEventIndex,
            showingEvents: this.showingEvents,
            eventScrollOffset: this.eventScrollOffset,
            maxVisibleEvents: this.maxVisibleEvents,
            eventNotifications: this.eventNotifications,
            unreadNotificationCount: this.unreadNotificationCount
        };
    }

    /**
     * イベント状態の設定
     */
    public setEventState(state: Partial<{
        selectedEventIndex: number;
        showingEvents: boolean;
        eventScrollOffset: number;
    }>): void {
        if (state.selectedEventIndex !== undefined) {
            this.selectedEventIndex = state.selectedEventIndex;
        }
        if (state.showingEvents !== undefined) {
            this.showingEvents = state.showingEvents;
        }
        if (state.eventScrollOffset !== undefined) {
            this.eventScrollOffset = state.eventScrollOffset;
        }
    }
}