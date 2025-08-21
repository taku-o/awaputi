/**
 * Data Collector
 * ゲームイベントからデータを収集し、構造化して保存するシステム
 */

// Analytics interfaces and types
export interface SessionInfo { stageId?: string,
    difficulty?: 'easy' | 'normal' | 'hard';
    soundEnabled?: boolean;
    effectsEnabled?: boolean;

export interface SessionEndInfo { finalScore?: number,
    bubblesPopped?: number;
    bubblesMissed?: number;
    maxCombo?: number;
    completed?: boolean;
    exitReason?: string;

export interface SessionData { sessionId: string;
    startTime: number | null;
    endTime: number | null;
    duration: number | null;
    stageId: string;
    finalScore: number | null;
    bubblesPopped: number;
    bubblesMissed: number;
    maxCombo: number;
    completed: boolean;
    exitReason: string | null;
    playerSettings: {
        difficult,y: string;
        soundEnabled: boolean;
    effectsEnabled: boolean;
    effectsEnabled: boolean;
        };
export interface BubblePosition { x: number;
    y: number;
    y: number;
        };
export interface BubbleContextInfo { remainingBubbles: number;
    currentHP: number;
    timeRemaining: number;
';'

export interface BubbleData { bubbleType: string,''
    action: 'popped' | 'missed' | 'expired';
    reactionTime?: number | null;
    position?: BubblePosition | null;
    scoreGained?: number;
    comboCount?: number;
    remainingBubbles?: number;
    currentHP?: number;
    timeRemaining?: number,  }

export interface BubbleInteractionData { sessionId: string;
    timestamp: number;
    bubbleType: string;
    action: 'popped' | 'missed' | 'expired';
    reactionTime: number | null;
    position: BubblePosition | null;
    scoreGained: number;
    comboCount: number;
    contextInfo: BubbleContextInfo;

export interface MemoryUsage { used: number;
    total: number;
    limit: number;

export interface LoadTimes { assets: number;
    scripts: number;
    total: number;

export interface PerformanceMetrics { fps?: number | null,
    memoryUsage?: MemoryUsage | null;
    loadTimes?: LoadTimes | null;
    errors?: string[];

export interface PerformanceData { sessionId: string | null;
    timestamp: number;
    fps: number | null;
    memoryUsage: MemoryUsage | null;
    loadTimes: LoadTimes | null;
    errors: string[];

export interface GameBalanceData { [key: string]: any;

export interface ScoreContextInfo { comboCount: number;
    timeRemaining: number;
    activeItems: string[];
';'

export interface ScoreData {,
    type: 'bubble' | 'combo' | 'bonus' | 'penalty';
    amount: number;
    totalScore: number;
    multiplier?: number;
    source: string;
    comboCount?: number;
    timeRemaining?: number;
    activeItems?: string[];

export interface ScoreEventData { sessionId: string;

    timestamp: number;
    scoreType: 'bubble' | 'combo' | 'bonus' | 'penalty';
    amount: number;
    totalScore: number;
    multiplier: number;
    source: string;
    contextInfo: ScoreContextInfo;

export interface ItemContextInfo { playerAP: number;
    stageProgress: number;
    currentScore: number;
';'

export interface ItemData { itemType: string,''
    action: 'purchased' | 'used' | 'expired';
    cost?: number;
    duration?: number | null;
    effectiveness?: number | null;
    playerAP?: number;
    stageProgress?: number;
    currentScore?: number,  }

export interface ItemUsageEventData { sessionId: string;
    timestamp: number;
    itemType: string;
    action: 'purchased' | 'used' | 'expired';
    cost: number;
    duration: number | null;
    effectiveness: number | null;
    contextInfo: ItemContextInfo;
';'

export interface AnalyticsEvent {,
    type: 'session' | 'bubbleInteraction' | 'performance' | 'gameBalance' | 'score' | 'itemUsage';
    timestamp: number;
    sessionId?: string;
    data: SessionData | BubbleInteractionData | PerformanceData | GameBalanceData | ScoreEventData | ItemUsageEventData }

export interface EventStats { collected: number;
    processed: number;
    errors: number;
    dropped: number;

export interface EventStatsExtended extends EventStats { queueSize: number;
    currentSessionId: string | null;
    isEnabled: boolean;
    isPaused: boolean;

export interface PrivacyManager { checkConsent(): boolean,
    isOptedOut(feature: string): boolean;
    anonymizeData(event: AnalyticsEvent): AnalyticsEvent;
';'

export interface StorageManager {;
    saveData(storeName: string, data: any[]): Promise<void>;

export type FeatureType = 'sessionTracking' | 'behaviorAnalysis' | 'performanceTracking';
export type EventType = 'session' | 'bubbleInteraction' | 'performance' | 'gameBalance' | 'score' | 'itemUsage';

export class DataCollector {
    private privacyManager: PrivacyManager;
    private storageManager: StorageManager;
    private eventQueue: AnalyticsEvent[];
    private batchSize: number;
    private batchTimeout: number;
    private batchTimer: number | null;
    private isEnabled: boolean;
    private isPaused: boolean;
    private currentSessionId: string | null;
    private sessionStartTime: number | null;
    private eventStats: EventStats;
    private maxRetries: number;
    private, retryDelay: number;
    constructor(privacyManager: PrivacyManager, storageManager: StorageManager) {

        this.privacyManager = privacyManager;
        this.storageManager = storageManager;
        
        // イベントキューとバッチ処理設定
        this.eventQueue = [];
        this.batchSize = 50;
        this.batchTimeout = 5000; // 5秒
        this.batchTimer = null;
        
        // データ収集の有効/無効状態
        this.isEnabled = true;
        this.isPaused = false;
        
        // セッション管理
        this.currentSessionId = null;
        this.sessionStartTime = null;
        
        // イベント統計
        this.eventStats = {
            collected: 0;
            processed: 0;
    errors: 0 }
            dropped: 0 
    };
        // エラーハンドリング
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // 自動バッチ処理の開始
        this.startBatchProcessing();
    }
    
    /**
     * 自動バッチ処理の開始
     */
    private startBatchProcessing(): void { this.batchTimer = window.setInterval(() => { 
            if (this.eventQueue.length > 0) { }
                this.processBatch(); }
}, this.batchTimeout);
    }
    
    /**
     * 自動バッチ処理の停止
     */
    private stopBatchProcessing(): void { if (this.batchTimer) {
            clearInterval(this.batchTimer);
            this.batchTimer = null }
    }
    
    /**
     * セッション開始
     */
    startSession(sessionInfo: SessionInfo): void { this.currentSessionId = this.generateSessionId();
        this.sessionStartTime = Date.now('''
            stageId: sessionInfo.stageId || 'unknown',
            finalScore: null,
            bubblesPopped: 0,
            bubblesMissed: 0,
            maxCombo: 0,
            completed: false,
    exitReason: null,
            playerSettings: {''
                difficulty: sessionInfo.difficulty || 'normal',
                soundEnabled: sessionInfo.soundEnabled !== false,
    effectsEnabled: sessionInfo.effectsEnabled !== false  })
        );
        this.collectSessionData(sessionData);
    }
    
    /**
     * セッション終了
     */
    endSession(endInfo: SessionEndInfo): void { if (!this.currentSessionId || !this.sessionStartTime) return,

        const endTime = Date.now('''
            stageId: 'unknown', // Will be set from original session data,
            finalScore: endInfo.finalScore || 0,
            bubblesPopped: endInfo.bubblesPopped || 0,
            bubblesMissed: endInfo.bubblesMissed || 0,
            maxCombo: endInfo.maxCombo || 0,
    completed: endInfo.completed || false,
            exitReason: endInfo.exitReason || 'unknown',
            playerSettings: {''
                difficulty: 'normal',
                soundEnabled: true,
    effectsEnabled: true,))
        );
        this.collectSessionData(sessionData);
        
        // セッション情報をリセット
        this.currentSessionId = null;
        this.sessionStartTime = null;
    }
    
    /**
     * セッションデータ収集
     */''
    private collectSessionData(sessionInfo: SessionData): void { ''
        if(!this.shouldCollectData('sessionTracking)' return,
        ','

        const event: AnalyticsEvent = {''
            type: 'session',
            timestamp: Date.now(
    data: sessionInfo,
        this.addToQueue(event);
    }
    
    /**
     * バブルインタラクション収集'
     */''
    collectBubbleInteraction(bubbleData: BubbleData): void { ''
        if(!this.shouldCollectData('behaviorAnalysis) return,'
        if (!this.currentSessionId) return,
        
        const interactionData: BubbleInteractionData = {'
            sessionId: this.currentSessionId,
            timestamp: Date.now()','
    type: 'bubbleInteraction'),
            timestamp: Date.now(
    data: interactionData,
        this.addToQueue(event);
        this.eventStats.collected++;
    }
    
    /**
     * パフォーマンスデータ収集'
     */''
    collectPerformanceData(performanceMetrics: PerformanceMetrics): void { ''
        if(!this.shouldCollectData('performanceTracking' return,
        
        const performanceData: PerformanceData = {'
            sessionId: this.currentSessionId,
            timestamp: Date.now()','
    type: 'performance'),
            timestamp: Date.now(
    data: performanceData,
        this.addToQueue(event);
    }
    
    /**
     * ゲームバランス関連データ収集'
     */''
    collectGameBalanceData(balanceData: GameBalanceData): void { ''
        if(!this.shouldCollectData('behaviorAnalysis' return,
        if(!this.currentSessionId) return,
        ','

        const event: AnalyticsEvent = {''
            type: 'gameBalance',
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
    data: balanceData,
        this.addToQueue(event);
    }
    
    /**
     * スコア関連データ収集'
     */''
    collectScoreData(scoreData: ScoreData): void { ''
        if(!this.shouldCollectData('behaviorAnalysis) return,'
        if (!this.currentSessionId) return,
        
        const scoreEvent: ScoreEventData = {'
            sessionId: this.currentSessionId,
            timestamp: Date.now()','
    type: 'score'),
            timestamp: Date.now(
    data: scoreEvent,
        this.addToQueue(event);
    }
    
    /**
     * アイテム使用データ収集'
     */''
    collectItemUsageData(itemData: ItemData): void { ''
        if(!this.shouldCollectData('behaviorAnalysis) return,'
        if (!this.currentSessionId) return,
        
        const itemEvent: ItemUsageEventData = {'
            sessionId: this.currentSessionId,
            timestamp: Date.now()','
    type: 'itemUsage'),
            timestamp: Date.now(
    data: itemEvent,
        this.addToQueue(event);
    }
    
    /**
     * データ収集可否チェック
     */
    private shouldCollectData(feature: FeatureType): boolean { if (!this.isEnabled || this.isPaused) return false,
        if(!this.privacyManager.checkConsent() return false,
        if(this.privacyManager.isOptedOut(feature) return false,
        return true }
    
    /**
     * イベントキューに追加
     */
    private addToQueue(event: AnalyticsEvent): void { try {
            // プライバシー保護：データ匿名化
            const anonymizedEvent = this.privacyManager.anonymizeData(event);
            this.eventQueue.push(anonymizedEvent);
            // バッチサイズに達したら即座に処理
            if (this.eventQueue.length >= this.batchSize) {
    
}
                this.processBatch(); }'

            } catch (error) {
            console.error('Failed to add event to queue:', error);
            this.eventStats.errors++ }
    }
    
    /**
     * バッチ処理
     */
    private async processBatch(): Promise<void> { if (this.eventQueue.length === 0) return,
        
        const batch = this.eventQueue.splice(0, this.batchSize);
        try {
            await this.saveBatchToStorage(batch);
            this.eventStats.processed += batch.length,' }'

        } catch (error) {
            console.error('Failed to process batch:', error);
            this.eventStats.errors += batch.length,
            
            // 失敗したバッチを再キューイング（最大リトライ回数まで）
            await this.retryBatch(batch) }
    }
    
    /**
     * バッチをストレージに保存
     */
    private async saveBatchToStorage(batch: AnalyticsEvent[]): Promise<void> { // イベントタイプ別にグループ化
        const groupedEvents = this.groupEventsByType(batch);
        for(const [type, events] of Object.entries(groupedEvents) {
        
            const storeName = this.getStoreNameForEventType(type, as EventType);
            if (storeName) {
                const data = events.map(event => event.data) }
                await this.storageManager.saveData(storeName, data); }
}
    }
    
    /**
     * イベントタイプ別グループ化
     */
    private groupEventsByType(events: AnalyticsEvent[]): Record<string, AnalyticsEvent[]> {
        const grouped: Record<string, AnalyticsEvent[]> = {};
        
        events.forEach(event => {  );
            if (!grouped[event.type]) { }
                grouped[event.type] = []; }
            }
            grouped[event.type].push(event);
        };
        
        return grouped;
    }
    
    /**
     * イベントタイプに対応するストア名を取得
     */''
    private getStoreNameForEventType(eventType: EventType): string | null { const storeMap: Record<EventType, string> = {', 'session': 'sessions','
            'bubbleInteraction': 'bubbleInteractions',
            'performance': 'performance',
            'gameBalance': 'bubbleInteractions', // バブルインタラクションと統合,
            'score': 'bubbleInteractions', // スコアイベントも統合,
            'itemUsage': 'bubbleInteractions' // アイテム使用も統合 };
        
        return storeMap[eventType] || null;
    }
    
    /**
     * バッチリトライ処理
     */
    private async retryBatch(batch: AnalyticsEvent[], retryCount: number = 0): Promise<void> { ''
        if (retryCount >= this.maxRetries) {

            console.error('Max retries reached, dropping batch),'
            this.eventStats.dropped += batch.length }
            return; }
        }
        
        // 指数バックオフでリトライ
        const delay = this.retryDelay * Math.pow(2, retryCount);
        
        setTimeout(async () => {  try {
                await this.saveBatchToStorage(batch) }
                this.eventStats.processed += batch.length; }
            } catch (error) {
                console.error(`Retry ${retryCount + 1} failed:`, error);
                await this.retryBatch(batch, retryCount + 1);
            }
        }, delay);
    }
    
    /**
     * セッションID生成
     */
    private generateSessionId(): string { const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5) }
        return `session_${timestamp}_${random}`;
    }
    
    /**
     * データ収集の有効/無効切り替え
     */
    setEnabled(enabled: boolean): void { this.isEnabled = enabled,
        
        if (enabled) {
    
}
            this.startBatchProcessing(); }
        } else {  this.stopBatchProcessing();
            // 残りのキューを処理
            if (this.eventQueue.length > 0) { }
                this.processBatch(); }
}
    }
    
    /**
     * データ収集の一時停止/再開
     */
    setPaused(paused: boolean): void { this.isPaused = paused,
        
        if (!paused && this.eventQueue.length > 0) {
        
            // 再開時に残りのキューを処理
        
        }
            this.processBatch(); }
}
    
    /**
     * イベント統計の取得
     */
    getEventStats(): EventStatsExtended { return { ...this.eventStats,
            queueSize: this.eventQueue.length,
            currentSessionId: this.currentSessionId isEnabled: this.isEnabled },
            isPaused: this.isPaused 
    }
    
    /**
     * キューのクリア
     */
    clearQueue(): void { const droppedCount = this.eventQueue.length,
        this.eventQueue = [];
        this.eventStats.dropped += droppedCount }
    
    /**
     * 強制バッチ処理（即座に全キューを処理）
     */
    async flushQueue(): Promise<void> { while (this.eventQueue.length > 0) {
            await this.processBatch() }
    }
    
    /**
     * データコレクターの破棄
     */
    destroy(): void { this.stopBatchProcessing();
        this.flushQueue(' }''