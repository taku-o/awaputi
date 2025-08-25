/**
 * EventStageManager.ts (TypeScript版)
 * イベントステージ管理クラス - メインコントローラー
 * 各種イベントコンポーネントを統合管理
 * Updated: 2024 with load() method for GameEngineInitializer compatibility
 */

import { SeasonalEventManager } from './events/SeasonalEventManager.js';
import { EventNotificationSystem } from './events/EventNotificationSystem.js';
import { EventHistoryManager } from './events/EventHistoryManager.js';
import { EventRankingSystem } from './events/EventRankingSystem.js';
import { GameEngine } from './GameEngine';

interface EventStage {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: string;
    duration?: number;
    targetScore?: number;
    rewards?: {
        ap?: number;
        completion?: {
            ap: number;
        };
        highScore?: {
            threshold: number;
            ap: number;
        };
        items?: string[];
        badges?: string[];
    };
    requirements?: {
        level?: number;
        ap?: number;
    };
    specialRules?: {
        spawnRate?: number;
        bonusMultiplier?: number;
        targetBubbles?: string[];
        goldenSpawnRate?: number;
        globalScoreMultiplier?: number;
        maxBubbles?: number;
        bubbleTypes?: string[];
        phantomSpawnRate?: number;
        reducedVisibility?: boolean;
        nightMode?: boolean;
        [key: string]: any;
    };
    bubbleTypes?: string[];
    spawnRate?: number;
    maxBubbles?: number;
    availability?: {
        startDate?: number;
        endDate?: number;
        recurring?: string;
    };
}

export class EventStageManager {
    private gameEngine: GameEngine;
    private eventStages: Record<string, EventStage>;
    private activeEvents: Map<string, any>;
    private seasonalEventManager: SeasonalEventManager;
    private notificationSystem: EventNotificationSystem;
    private historyManager: EventHistoryManager;
    private rankingSystem: EventRankingSystem;
    public eventRankingManager: EventRankingSystem;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.eventStages = this.initializeEventStages();
        this.activeEvents = new Map();
        
        // 分離されたコンポーネントを初期化
        this.seasonalEventManager = new SeasonalEventManager(gameEngine);
        this.notificationSystem = new EventNotificationSystem(gameEngine);
        this.historyManager = new EventHistoryManager(gameEngine);
        this.rankingSystem = new EventRankingSystem(gameEngine);
        
        // レガシーサポート用（既存コードとの互換性）
        this.eventRankingManager = this.rankingSystem;

        console.log('EventStageManager initialized with new component architecture');
        console.log('[DEBUG] EventStageManager VERSION: v2024-with-load-method');
    }
    
    /**
     * EventRankingManagerを遅延初期化（レガシーサポート）
     */
    initializeRankingManager(): EventRankingSystem {
        return this.rankingSystem;
    }
    
    /**
     * イベントステージを初期化
     */
    initializeEventStages(): Record<string, EventStage> {
        return {
            goldenRush: {
                id: 'goldenRush',
                name: '黄金ラッシュ',
                description: '黄金の泡が大量出現！スコア倍率2倍のチャンス',
                icon: '✨',
                type: 'limited_time',
                duration: 300000, // 5分
                bubbleTypes: ['normal', 'stone', 'golden', 'golden', 'golden', 'rainbow', 'pink'],
                spawnRate: 2.0,
                maxBubbles: 25,
                specialRules: {
                    goldenSpawnRate: 0.4,
                    globalScoreMultiplier: 2.0
                },
                rewards: {
                    completion: { ap: 200 },
                    highScore: { threshold: 15000, ap: 300 }
                },
                availability: {
                    startDate: undefined,
                    endDate: undefined,
                    recurring: 'weekly'
                }
            },

            phantomNight: {
                id: 'phantomNight',
                name: '幻影の夜',
                description: '幻の泡が多数出現。すり抜けに注意！',
                icon: '👻',
                type: 'limited_time',
                duration: 300000,
                bubbleTypes: ['normal', 'phantom', 'phantom', 'phantom', 'electric', 'poison'],
                spawnRate: 2.2,
                maxBubbles: 30,
                specialRules: {
                    phantomSpawnRate: 0.5,
                    reducedVisibility: true,
                    nightMode: true
                },
                rewards: {
                    completion: { ap: 250 },
                    highScore: { threshold: 12000, ap: 100 }
                },
                availability: {
                    startDate: undefined,
                    endDate: undefined,
                    recurring: 'monthly'
                }
            },

            rainbowCascade: {
                id: 'rainbowCascade',
                name: 'レインボーカスケード',
                description: 'レインボー泡のチェーン爆発を狙え！',
                icon: '🌈',
                type: 'limited_time',
                duration: 240000,
                bubbleTypes: ['rainbow', 'rainbow', 'rainbow', 'normal', 'golden'],
                spawnRate: 1.8,
                maxBubbles: 20,
                specialRules: {
                    rainbowChainBonus: 3.0,
                    cascadeMultiplier: 1.5
                },
                rewards: {
                    completion: { ap: 180 },
                    highScore: { threshold: 10000, ap: 200 }
                },
                availability: {
                    startDate: undefined,
                    endDate: undefined,
                    recurring: 'weekly'
                }
            }
        };
    }
    
    /**
     * 利用可能なイベントを取得
     */
    getAvailableEvents(): EventStage[] {
        const currentTime = Date.now();
        const availableEvents: EventStage[] = [];
        
        Object.values(this.eventStages).forEach(event => {
            if (this.isEventAvailable(event, currentTime)) {
                availableEvents.push(event);
            }
        });
        
        // 季節イベントも追加
        const seasonalEvents = this.seasonalEventManager.getActiveSeasonalEvents();
        availableEvents.push(...(seasonalEvents as EventStage[]));
        
        return availableEvents;
    }
    
    /**
     * イベントが利用可能かチェック
     */
    isEventAvailable(event: EventStage, currentTime: number): boolean {
        if (!event.availability) return true;
        
        // 期間指定がある場合
        if (event.availability.startDate && event.availability.endDate) {
            return currentTime >= event.availability.startDate &&
                   currentTime <= event.availability.endDate;
        }
        
        // 繰り返しイベントの場合
        if (event.availability.recurring) {
            return this.isRecurringEventActive(event, currentTime);
        }
        
        return true;
    }
    
    /**
     * 繰り返しイベントがアクティブかチェック
     */
    isRecurringEventActive(event: EventStage, currentTime: number): boolean {
        const recurringType = event.availability?.recurring;
        const now = new Date(currentTime);
        
        switch(recurringType) {
            case 'weekly':
                // 週末（金曜日〜日曜日）にアクティブ
                const dayOfWeek = now.getDay();
                return dayOfWeek >= 5 || dayOfWeek === 0; // 金土日
                
            case 'monthly':
                // 月の最初の週にアクティブ
                const dayOfMonth = now.getDate();
                return dayOfMonth <= 7;
                
            case 'daily':
                // 毎日特定の時間帯にアクティブ
                const hour = now.getHours();
                return hour >= 19 && hour <= 23;
                
            default:
                return true;
        }
    }
    
    /**
     * イベントステージを開始
     */
    startEventStage(eventId: string): boolean {
        const event = this.eventStages[eventId];
        if (!event) {
            console.error(`Event not found: ${eventId}`);
            return false;
        }
        
        try {
            // イベント開始を履歴に記録
            this.historyManager.recordEventStart(event);
            
            // イベント開始通知
            this.notificationSystem.notifyEventStart(event);
            
            // イベント設定を適用
            this.applyEventSettings(event);
            
            // アクティブイベントに追加
            this.activeEvents.set(eventId, {
                ...event,
                startTime: Date.now(),
                endTime: Date.now() + (event.duration || 300000) // デフォルト5分
            });
            
            console.log(`Event started: ${event.name}`);
            return true;

        } catch (error) {
            console.error('Failed to start event:', error);
            return false;
        }
    }
    
    /**
     * イベント設定を適用
     */
    applyEventSettings(event: EventStage): void {
        try {
            // バブル設定
            if (event.bubbleTypes && this.gameEngine.bubbleManager) {
                (this.gameEngine.bubbleManager as any).setEventBubbleTypes(event.bubbleTypes);
                (this.gameEngine.bubbleManager as any).setSpawnRateMultiplier(event.spawnRate || 1.0);
                (this.gameEngine.bubbleManager as any).setMaxBubbles(event.maxBubbles || 15);
            }
            
            // 特別ルールを適用
            if (event.specialRules) {
                this.applySpecialRules(event, event.specialRules);
            }
            
            // 季節エフェクトを適用
            if (event.type === 'seasonal') {
                this.seasonalEventManager.applySeasonalEffects(event as any, event.specialRules || {});
            }
            
            console.log(`Event settings applied: ${event.name}`);
        } catch (error) {
            console.error('Failed to apply event settings:', error);
        }
    }
    
    /**
     * 特別ルールを適用
     */
    applySpecialRules(_event: EventStage, specialRules: any): void {
        // スコア倍率
        if (specialRules.globalScoreMultiplier && this.gameEngine.scoreManager) {
            this.gameEngine.scoreManager.setGlobalScoreMultiplier(specialRules.globalScoreMultiplier);
        }
        
        // 特別なバブルスポーン率
        if (this.gameEngine.bubbleManager) {
            if (specialRules.goldenSpawnRate) {
                (this.gameEngine.bubbleManager as any).setSpecialBubbleSpawnRate('golden', specialRules.goldenSpawnRate);
            }

            if (specialRules.phantomSpawnRate) {
                (this.gameEngine.bubbleManager as any).setSpecialBubbleSpawnRate('phantom', specialRules.phantomSpawnRate);
            }

            if (specialRules.rainbowChainBonus) {
                (this.gameEngine.bubbleManager as any).setChainBonus('rainbow', specialRules.rainbowChainBonus);
            }
        }
        
        // 視覚エフェクト
        if (specialRules.nightMode && this.gameEngine.effectManager) {
            this.gameEngine.effectManager.enableNightMode();
        }
        
        if (specialRules.reducedVisibility && this.gameEngine.effectManager) {
            this.gameEngine.effectManager.setVisibilityReduction(0.7);
        }
    }
    
    /**
     * イベント完了処理
     */
    completeEvent(eventId: string, playerId?: string): boolean {
        const results = playerId ? { playerId } : {};
        const event = this.activeEvents.get(eventId);
        if (!event) {
            console.error(`Active event not found: ${eventId}`);
            return false;
        }
        
        try {
            // イベント完了を履歴に記録
            this.historyManager.recordEventCompletion(event, results as any);
            
            // ランキングを更新
            if (this.rankingSystem && this.rankingSystem.updatePlayerScore && 'score' in results) {
                this.rankingSystem.updatePlayerScore(eventId, (results as any).score);
            }
            
            // イベント終了通知
            this.notificationSystem.notifyEventEnd(event, results as any);
            
            // 報酬を付与
            this.grantEventRewards(event, results as any);
            
            // アクティブイベントから削除
            this.activeEvents.delete(eventId);
            
            console.log(`Event completed: ${event.name}`);
            return true;

        } catch (error) {
            console.error('Failed to complete event:', error);
            return false;
        }
    }
    
    /**
     * イベント報酬を付与
     */
    grantEventRewards(event: EventStage, results: any): void {
        if (!event.rewards) return;
        
        // 完了報酬
        if (event.rewards.completion) {
            this.grantReward(event.rewards.completion);
        }
        
        // スコア閾値報酬
        if (event.rewards.highScore && results.score >= event.rewards.highScore.threshold) {
            this.grantReward(event.rewards.highScore);
        }
        
        // チェーンボーナス報酬
        if ((event.rewards as any).chainBonus && results.maxChain >= (event.rewards as any).chainBonus.threshold) {
            this.grantReward((event.rewards as any).chainBonus);
        }
    }
    
    /**
     * 報酬を付与
     */
    grantReward(reward: any): void {
        if (reward.ap && this.gameEngine.playerData) {
            this.gameEngine.playerData.addAP(reward.ap);
        }
        
        if (reward.items && this.gameEngine.itemManager && (this.gameEngine.itemManager as any).grantItem) {
            reward.items.forEach((item: any) => {
                (this.gameEngine.itemManager as any).grantItem(item.id, item.quantity || 1);
            });
        }
    }
    
    /**
     * アクティブなイベントを取得
     */
    getActiveEvents(): any[] {
        return Array.from(this.activeEvents.values());
    }
    
    /**
     * イベント情報を取得
     */
    getEventInfo(eventId: string): EventStage | null {
        return this.eventStages[eventId] || null;
    }
    
    /**
     * イベント残り時間を取得
     */
    getEventTimeRemaining(eventId: string): number {
        const activeEvent = this.activeEvents.get(eventId);
        if (!activeEvent) return 0;
        
        return Math.max(0, activeEvent.endTime - Date.now());
    }
    
    /**
     * 季節イベント情報を取得
     */
    getSeasonalEventInfo(): SeasonInfo | null {
        return this.seasonalEventManager.getCurrentSeasonInfo();
    }
    
    /**
     * ランキング情報を取得
     */
    getRankingInfo(type = 'global', category: string | null = null): any {
        return this.rankingSystem.getRanking(type, category);
    }
    
    /**
     * イベント履歴を取得
     */
    getEventHistory(filter: any = {}): HistoryEntry[] {
        return this.historyManager.getEventHistory(filter);
    }
    
    /**
     * イベント統計を取得
     */
    getEventStatistics(): DetailedStatistics {
        return this.historyManager.generateDetailedStatistics();
    }
    
    /**
     * 通知設定を更新
     */
    updateNotificationSettings(settings: any): void {
        this.notificationSystem.updateSettings(settings);
    }
    
    /**
     * アクティブな通知を取得
     */
    getActiveNotifications(): any[] {
        return (this.notificationSystem as any).getActiveNotifications();
    }
    
    /**
     * システム更新処理
     */
    update(): void {
        try {
            // 期限切れイベントをチェック
            const currentTime = Date.now();
            const expiredEvents: string[] = [];
            
            this.activeEvents.forEach((event, eventId) => {
                if (currentTime > event.endTime) {
                    expiredEvents.push(eventId);
                }
            });
            
            // 期限切れイベントを終了
            expiredEvents.forEach(eventId => {
                this.completeEvent(eventId, { score: 0, completed: false } as any);
            });
        } catch (error) {
            console.error('EventStageManager update error:', error);
        }
    }
    
    /**
     * データを読み込み（GameEngineInitializer互換性用）
     */
    load(): boolean {
        try {
            console.log('[DEBUG] EventStageManager.load() 開始');
            
            // 各サブコンポーネントのloadメソッドを呼び出し（存在する場合）
            if (this.seasonalEventManager && typeof this.seasonalEventManager.load === 'function') {
                this.seasonalEventManager.load();
            }
            
            if (this.historyManager && typeof this.historyManager.load === 'function') {
                this.historyManager.load();
            }
            
            if (this.rankingSystem && typeof this.rankingSystem.load === 'function') {
                this.rankingSystem.load();
            }
            
            console.log('[DEBUG] EventStageManager.load() 完了');
            return true;

        } catch (error) {
            console.error('[DEBUG] EventStageManager.load() エラー:', error);
            return false;
        }
    }
    
    /**
     * イベント通知をチェック
     * 互換性のためのメソッド（EventStageDataManager用）
     */
    checkEventNotifications(): any[] {
        try {
            console.log('[DEBUG] EventStageManager.checkEventNotifications() 実行');
            
            // 通知システムから通知をチェック
            if (this.notificationSystem && typeof (this.notificationSystem as any).checkNotifications === 'function') {
                return (this.notificationSystem as any).checkNotifications();
            }
            
            // フォールバック: 空の通知配列を返す
            return [];

        } catch (error) {
            console.error('[DEBUG] EventStageManager.checkEventNotifications() エラー:', error);
            return [];
        }
    }
    
    /**
     * リソースクリーンアップ
     */
    dispose(): void {
        try {
            // 各コンポーネントをクリーンアップ
            this.seasonalEventManager?.dispose();
            this.notificationSystem?.dispose();
            this.historyManager?.dispose();
            this.rankingSystem?.dispose();
            
            // アクティブイベントをクリア
            this.activeEvents.clear();
            
            console.log('EventStageManager disposed');

        } catch (error) {
            console.error('EventStageManager dispose error:', error);
        }
    }
}