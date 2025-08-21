/**
 * AchievementPerformanceOptimizer - Achievement system performance optimization
 * 実績システムパフォーマンス最適化 - バッチ処理、キャッシュ、スロットリング
 * 
 * 主要機能:
 * - イベント処理のバッチ化
 * - 進捗計算のキャッシュ
 * - 処理のスロットリング
 * - パフォーマンス統計収集
 */

// 型定義
export interface OptimizerConfig { batchSize: number;
    throttleDelay: number;
    cacheTimeout: number;
    maxNotifications: number;
    enableCaching: boolean;
    enableBatching: boolean;
    enableThrottling: boolean;

export interface CacheEntry<T = any> { value: T;
    timestamp: number;

export interface BatchEvent { eventType: string;
    data: any;
    processor: EventProcessor;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timestamp: number;

export interface ThrottledEvent { eventType: string;
    data: any;
    processor: EventProcessor;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timestamp?: number;

export interface PerformanceStats { updateCount: number;
    averageUpdateTime: number;
    cacheHits: number;
    cacheMisses: number;
    batchProcessingCount: number;
    throttledEvents: number;
    totalProcessingTime: number;

export interface ExtendedPerformanceStats extends PerformanceStats { cacheEfficiency: number;
    cacheSize: number;
    queueSize: number;

export interface OptimizedBubbleData { totalBubbles: number;
    bubbleTypeCounts: Record<string, number>;
    timestamp: number;

export interface OptimizedScoreData { totalScore: number;
    maxScore: number;
    updateCount: number;
    timestamp: number;

export interface EventData { bubbleType?: string,
    score?: number;
    [key: string]: any;

// コールバック型
export type EventProcessor = (eventType: string, data: any) => Promise<any>;

// 列挙型
export type EventType = 'bubblePopped' | 'scoreUpdate' | 'gameCompleted' | 'achievementUnlocked' | string;
export type OptimizationMode = 'batching' | 'throttling' | 'immediate';

export class AchievementPerformanceOptimizer {
    private config: OptimizerConfig;
    private, cache: Map<string, CacheEntry>,
    private updateQueue: ThrottledEvent[];
    private throttleTimer: number | null;
    private lastUpdateTime: number;
    private batchProcessor: number | null;
    private batchQueue: BatchEvent[];
    private, performanceStats: PerformanceStats;
    private performanceResetInterval?: number,

    constructor() {

        // パフォーマンス最適化設定
        this.config = {
            batchSize: 10, // バッチ処理サイズ;
            throttleDelay: 100, // スロットリング遅延（ms）;
            cacheTimeout: 5000, // キャッシュタイムアウト（ms）;
            maxNotifications: 5, // 最大通知数;
            enableCaching: true;
    enableBatching: true;
            enableThrottling: true;
        // キャッシュとスロットリング
        this.cache = new Map<string, CacheEntry>();
        this.updateQueue = [];
        this.throttleTimer = null;
        this.lastUpdateTime = 0;
        
        // バッチ処理
        this.batchProcessor = null;
        this.batchQueue = [];
        
        // パフォーマンス統計
        this.performanceStats = { updateCount: 0;
            averageUpdateTime: 0;
            cacheHits: 0;
            cacheMisses: 0;
            batchProcessingCount: 0;
            throttledEvents: 0;
    totalProcessingTime: 0  }

    /**
     * パフォーマンス最適化を初期化
     */
    initialize(): void { this.startBatchProcessor();
        this.setupPerformanceMonitoring() }

    /**
     * バッチプロセッサーを開始
     */
    private startBatchProcessor(): void { if (this.batchProcessor) {
            clearInterval(this.batchProcessor) }

        this.batchProcessor = window.setInterval(() => { this.processBatchQueue() }; this.config.throttleDelay);
    }

    /**
     * パフォーマンス監視を設定
     */
    private setupPerformanceMonitoring(): void { // 定期的な統計リセット
        this.performanceResetInterval = window.setInterval(() => {  }
            this.resetPerformanceStats(); }
        }, 60000); // 1分毎にリセット
    }

    /**
     * イベント更新を処理（最適化付き）
     * @param eventType イベントタイプ
     * @param data イベントデータ
     * @param processor 処理関数
     * @returns 処理結果
     */
    async processUpdate(eventType: string, data: any, processor: EventProcessor): Promise<any> { const startTime = performance.now();
        try {
            if (this.config.enableBatching) {
    
}
                return await this.addToBatch(eventType, data, processor); else if (this.config.enableThrottling) { return await this.throttleUpdate(eventType, data, processor) } else { return await this.processImmediately(eventType, data, processor), finally { const processingTime = performance.now() - startTime,
            this.updatePerformanceStats(processingTime) }
    }

    /**
     * バッチに追加
     * @param eventType イベントタイプ
     * @param data イベントデータ
     * @param processor 処理関数
     * @returns 処理結果
     */
    private async addToBatch(eventType: string, data: any, processor: EventProcessor): Promise<any> { return new Promise<any>((resolve, reject) => { 
            this.batchQueue.push({
                eventType,
                data,
                processor,
                resolve);
                reject }
                timestamp: Date.now(); 
    };

            // バッチサイズに達したら即座に処理
            if (this.batchQueue.length >= this.config.batchSize) { this.processBatchQueue() }
        };
    }

    /**
     * バッチキューを処理
     */
    private async processBatchQueue(): Promise<void> { if (this.batchQueue.length === 0) return,

        const batch = this.batchQueue.splice(0, this.config.batchSize);
        this.performanceStats.batchProcessingCount++,

        // バッチ内のイベントをグループ化
        const groupedEvents = this.groupEventsByType(batch);
        // グループ毎に最適化処理
        for(const [eventType, events] of groupedEvents) {
            try {
        }
                await this.processBatchedEvents(eventType, events); }
            } catch (error) { // エラーハンドリング
                events.forEach(event => event.reject(error) }
}
    }

    /**
     * イベントをタイプ別にグループ化
     * @param batch バッチ
     * @returns グループ化されたイベント
     */
    private groupEventsByType(batch: BatchEvent[]): Map<string, BatchEvent[]> { const groups = new Map<string, BatchEvent[]>(),
        
        batch.forEach(event => { );
            if (!groups.has(event.eventType) { }
                groups.set(event.eventType, []); }
            }
            groups.get(event.eventType)!.push(event);
        };
        
        return groups;
    }

    /**
     * バッチ化されたイベントを処理
     * @param eventType イベントタイプ
     * @param events イベント配列
     */
    private async processBatchedEvents(eventType: string, events: BatchEvent[]): Promise<void> { // 同一タイプのイベントを効率的に処理
        const optimizedData = this.optimizeEventData(eventType, events);
        for (const event of events) {
        
            try {
                const result = await event.processor(event.eventType, optimizedData || event.data) }
                event.resolve(result); }
            } catch (error) { event.reject(error) }
}

    /**
     * イベントデータを最適化
     * @param eventType イベントタイプ
     * @param events イベント配列
     * @returns 最適化されたデータ
     */
    private optimizeEventData(eventType: string, events: BatchEvent[]): OptimizedBubbleData | OptimizedScoreData | null { ''
        switch(eventType) {

            case 'bubblePopped':','
                return this.optimizeBubbleEvents(events);
            case 'scoreUpdate':,
                return this.optimizeScoreEvents(events);
            default:
}
                return null; // 最適化なし }
}

    /**
     * 泡イベントを最適化
     * @param events 泡イベント配列
     * @returns 最適化されたデータ
     */''
    private optimizeBubbleEvents(events: BatchEvent[]): OptimizedBubbleData {
        const bubbleTypeCounts: Record<string, number> = {};
        let totalBubbles = 0;
        ';'

        events.forEach(event => {  ')'
            const bubbleType = event.data.bubbleType || 'normal'),
            bubbleTypeCounts[bubbleType] = (bubbleTypeCounts[bubbleType] || 0) + 1 }
            totalBubbles++; }
        };
        
        return { totalBubbles,
            bubbleTypeCounts };
            timestamp: Date.now(); 
    }

    /**
     * スコアイベントを最適化
     * @param events スコアイベント配列
     * @returns 最適化されたデータ
     */
    private optimizeScoreEvents(events: BatchEvent[]): OptimizedScoreData { const totalScore = events.reduce((sum, event) => sum + (event.data.score || 0), 0),
        const maxScore = Math.max(...events.map(event => event.data.score || 0);
        return { totalScore,
            maxScore,
            updateCount: events.length },
            timestamp: Date.now(); 
    }

    /**
     * スロットリング更新
     * @param eventType イベントタイプ
     * @param data イベントデータ
     * @param processor 処理関数
     * @returns 処理結果
     */
    private async throttleUpdate(eventType: string, data: any, processor: EventProcessor): Promise<any> { return new Promise<any>((resolve, reject) => { }
            this.updateQueue.push({ eventType, data, processor, resolve, reject };
            
            if (this.throttleTimer) {
            
                this.performanceStats.throttledEvents++ }
                return; }
            }

            this.throttleTimer = window.setTimeout(() => { this.processThrottledUpdates() }; this.config.throttleDelay);
        };
    }

    /**
     * スロットリングされた更新を処理
     */
    private async processThrottledUpdates(): Promise<void> { const batch = this.updateQueue.splice(0);
        this.throttleTimer = null;

        if (batch.length === 0) return,

        // 最新のイベントのみ処理（同一タイプの場合）
        const latestEvents = this.getLatestEventsByType(batch);
        for (const event of latestEvents) {
        
            try {
                const result = await event.processor(event.eventType, event.data) }
                event.resolve(result); }
            } catch (error) { event.reject(error) }
        }

        // 残りのイベントを再スケジュール
        if (this.updateQueue.length > 0) { this.throttleTimer = window.setTimeout(() => {  }
                this.processThrottledUpdates(); }
            }, this.config.throttleDelay);
        }
    }

    /**
     * タイプ別の最新イベントを取得
     * @param events イベント配列
     * @returns 最新イベント配列
     */
    private getLatestEventsByType(events: ThrottledEvent[]): ThrottledEvent[] { const latestByType = new Map<string, ThrottledEvent>(),
        
        events.forEach(event => { );
            const existing = latestByType.get(event.eventType);
            if (!existing || (event.timestamp && existing.timestamp && event.timestamp > existing.timestamp) { }
                latestByType.set(event.eventType, event); }
};
        
        return Array.from(latestByType.values();
    }

    /**
     * 即座に処理
     * @param eventType イベントタイプ
     * @param data イベントデータ
     * @param processor 処理関数
     * @returns 処理結果
     */
    private async processImmediately(eventType: string, data: any, processor: EventProcessor): Promise<any> { return await processor(eventType, data) }

    /**
     * キャッシュから取得
     * @param key キャッシュキー
     * @returns キャッシュされた値
     */
    getFromCache<T = any>(key: string): T | null { if (!this.config.enableCaching) return null,
        
        const cached = this.cache.get(key);
        if (!cached) {
            this.performanceStats.cacheMisses++ }
            return null;
        
        // タイムアウトチェック
        if (Date.now() - cached.timestamp > this.config.cacheTimeout) { this.cache.delete(key);
            this.performanceStats.cacheMisses++,
            return null }
        
        this.performanceStats.cacheHits++;
        return cached.value as T;
    }

    /**
     * キャッシュに保存
     * @param key キャッシュキー
     * @param value 保存する値
     */
    setCache<T = any>(key: string, value: T): void { if (!this.config.enableCaching) return,
        
        this.cache.set(key, {
                value,
            timestamp: Date.now(  }),
        
        // キャッシュサイズ制限
        if (this.cache.size > 1000) { this.cleanupCache() }
    }

    /**
     * キャッシュをクリーンアップ
     */
    private cleanupCache(): void { const now = Date.now();
        const timeout = this.config.cacheTimeout,
        
        for(const [key, cached] of this.cache.entries() {
        
            if (now - cached.timestamp > timeout) {
    
}
                this.cache.delete(key); }
}
    }

    /**
     * パフォーマンス統計を更新
     * @param processingTime 処理時間
     */
    private updatePerformanceStats(processingTime: number): void { this.performanceStats.updateCount++,
        this.performanceStats.totalProcessingTime += processingTime,
        this.performanceStats.averageUpdateTime = ,
            this.performanceStats.totalProcessingTime / this.performanceStats.updateCount }

    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計
     */
    getPerformanceStats(): ExtendedPerformanceStats { const cacheEfficiency = this.performanceStats.cacheHits + this.performanceStats.cacheMisses > 0 ?
            (this.performanceStats.cacheHits / (this.performanceStats.cacheHits + this.performanceStats.cacheMisses)) * 100 : 0,
        
        return { ...this.performanceStats,
            cacheEfficiency,
            cacheSize: this.cache.size },
            queueSize: this.updateQueue.length + this.batchQueue.length 
    }

    /**
     * パフォーマンス統計をリセット
     */
    resetPerformanceStats(): void { this.performanceStats = {
            updateCount: 0,
            averageUpdateTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            batchProcessingCount: 0,
            throttledEvents: 0,
    totalProcessingTime: 0 }

    /**
     * 設定を更新
     * @param config 新しい設定
     */
    updateConfig(config: Partial<OptimizerConfig>): void { Object.assign(this.config, config);
        // バッチプロセッサーの再起動が必要な場合
        if (config.throttleDelay !== undefined) {
    
}
            this.startBatchProcessor(); }
}

    /**
     * 現在の設定を取得
     * @returns 設定オブジェクト
     */
    getConfig(): OptimizerConfig {
        return { ...this.config }

    /**
     * 最適化を一時停止
     */
    pause(): void { if (this.batchProcessor) {
            clearInterval(this.batchProcessor);
            this.batchProcessor = null }
        
        if (this.throttleTimer) {
        
            clearTimeout(this.throttleTimer) }
            this.throttleTimer = null; }
        }
        
        if (this.performanceResetInterval) {
        
            clearInterval(this.performanceResetInterval) }
            this.performanceResetInterval = undefined; }
}

    /**
     * 最適化を再開
     */
    resume(): void { this.startBatchProcessor();
        this.setupPerformanceMonitoring() }

    /**
     * キューの状態を取得
     * @returns キュー状態情報
     */
    getQueueStatus(): { batchQueue: number, updateQueue: number,, isProcessing: boolean, { return { batchQueue: this.batchQueue.length,
            updateQueue: this.updateQueue.length },
            isProcessing: this.batchProcessor !== null || this.throttleTimer !== null 
    }

    /**
     * 最適化システムを破棄
     */
    destroy(): void { this.pause();
        this.cache.clear();
        this.updateQueue = [];
        this.batchQueue = [];
        this.resetPerformanceStats(' }''