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
export class AchievementPerformanceOptimizer {
    constructor() {
        // パフォーマンス最適化設定
        this.config = {
            batchSize: 10, // バッチ処理サイズ
            throttleDelay: 100, // スロットリング遅延（ms）
            cacheTimeout: 5000, // キャッシュタイムアウト（ms）
            maxNotifications: 5, // 最大通知数
            enableCaching: true,
            enableBatching: true,
            enableThrottling: true
        };
        
        // キャッシュとスロットリング
        this.cache = new Map();
        this.updateQueue = [];
        this.throttleTimer = null;
        this.lastUpdateTime = 0;
        
        // バッチ処理
        this.batchProcessor = null;
        this.batchQueue = [];
        
        // パフォーマンス統計
        this.performanceStats = {
            updateCount: 0,
            averageUpdateTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            batchProcessingCount: 0,
            throttledEvents: 0,
            totalProcessingTime: 0
        };
    }

    /**
     * パフォーマンス最適化を初期化
     */
    initialize() {
        this.startBatchProcessor();
        this.setupPerformanceMonitoring();
    }

    /**
     * バッチプロセッサーを開始
     */
    startBatchProcessor() {
        if (this.batchProcessor) {
            clearInterval(this.batchProcessor);
        }

        this.batchProcessor = setInterval(() => {
            this.processBatchQueue();
        }, this.config.throttleDelay);
    }

    /**
     * パフォーマンス監視を設定
     */
    setupPerformanceMonitoring() {
        // 定期的な統計リセット
        setInterval(() => {
            this.resetPerformanceStats();
        }, 60000); // 1分毎にリセット
    }

    /**
     * イベント更新を処理（最適化付き）
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     * @param {function} processor - 処理関数
     * @returns {Promise} 処理結果
     */
    async processUpdate(eventType, data, processor) {
        const startTime = performance.now();
        
        try {
            if (this.config.enableBatching) {
                return await this.addToBatch(eventType, data, processor);
            } else if (this.config.enableThrottling) {
                return await this.throttleUpdate(eventType, data, processor);
            } else {
                return await this.processImmediately(eventType, data, processor);
            }
        } finally {
            const processingTime = performance.now() - startTime;
            this.updatePerformanceStats(processingTime);
        }
    }

    /**
     * バッチに追加
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     * @param {function} processor - 処理関数
     * @returns {Promise} 処理結果
     */
    async addToBatch(eventType, data, processor) {
        return new Promise((resolve, reject) => {
            this.batchQueue.push({
                eventType,
                data,
                processor,
                resolve,
                reject,
                timestamp: Date.now()
            });

            // バッチサイズに達したら即座に処理
            if (this.batchQueue.length >= this.config.batchSize) {
                this.processBatchQueue();
            }
        });
    }

    /**
     * バッチキューを処理
     */
    async processBatchQueue() {
        if (this.batchQueue.length === 0) return;

        const batch = this.batchQueue.splice(0, this.config.batchSize);
        this.performanceStats.batchProcessingCount++;

        // バッチ内のイベントをグループ化
        const groupedEvents = this.groupEventsByType(batch);
        
        // グループ毎に最適化処理
        for (const [eventType, events] of groupedEvents) {
            try {
                await this.processBatchedEvents(eventType, events);
            } catch (error) {
                // エラーハンドリング
                events.forEach(event => event.reject(error));
            }
        }
    }

    /**
     * イベントをタイプ別にグループ化
     * @param {Array} batch - バッチ
     * @returns {Map} グループ化されたイベント
     */
    groupEventsByType(batch) {
        const groups = new Map();
        
        batch.forEach(event => {
            if (!groups.has(event.eventType)) {
                groups.set(event.eventType, []);
            }
            groups.get(event.eventType).push(event);
        });
        
        return groups;
    }

    /**
     * バッチ化されたイベントを処理
     * @param {string} eventType - イベントタイプ
     * @param {Array} events - イベント配列
     */
    async processBatchedEvents(eventType, events) {
        // 同一タイプのイベントを効率的に処理
        const optimizedData = this.optimizeEventData(eventType, events);
        
        for (const event of events) {
            try {
                const result = await event.processor(event.eventType, optimizedData || event.data);
                event.resolve(result);
            } catch (error) {
                event.reject(error);
            }
        }
    }

    /**
     * イベントデータを最適化
     * @param {string} eventType - イベントタイプ
     * @param {Array} events - イベント配列
     * @returns {object} 最適化されたデータ
     */
    optimizeEventData(eventType, events) {
        switch (eventType) {
            case 'bubblePopped':
                return this.optimizeBubbleEvents(events);
            case 'scoreUpdate':
                return this.optimizeScoreEvents(events);
            default:
                return null; // 最適化なし
        }
    }

    /**
     * 泡イベントを最適化
     * @param {Array} events - 泡イベント配列
     * @returns {object} 最適化されたデータ
     */
    optimizeBubbleEvents(events) {
        const bubbleTypeCounts = {};
        let totalBubbles = 0;
        
        events.forEach(event => {
            const bubbleType = event.data.bubbleType || 'normal';
            bubbleTypeCounts[bubbleType] = (bubbleTypeCounts[bubbleType] || 0) + 1;
            totalBubbles++;
        });
        
        return {
            totalBubbles,
            bubbleTypeCounts,
            timestamp: Date.now()
        };
    }

    /**
     * スコアイベントを最適化
     * @param {Array} events - スコアイベント配列
     * @returns {object} 最適化されたデータ
     */
    optimizeScoreEvents(events) {
        const totalScore = events.reduce((sum, event) => sum + (event.data.score || 0), 0);
        const maxScore = Math.max(...events.map(event => event.data.score || 0));
        
        return {
            totalScore,
            maxScore,
            updateCount: events.length,
            timestamp: Date.now()
        };
    }

    /**
     * スロットリング更新
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     * @param {function} processor - 処理関数
     * @returns {Promise} 処理結果
     */
    async throttleUpdate(eventType, data, processor) {
        return new Promise((resolve, reject) => {
            this.updateQueue.push({ eventType, data, processor, resolve, reject });
            
            if (this.throttleTimer) {
                this.performanceStats.throttledEvents++;
                return;
            }

            this.throttleTimer = setTimeout(() => {
                this.processThrottledUpdates();
            }, this.config.throttleDelay);
        });
    }

    /**
     * スロットリングされた更新を処理
     */
    async processThrottledUpdates() {
        const batch = this.updateQueue.splice(0);
        this.throttleTimer = null;

        if (batch.length === 0) return;

        // 最新のイベントのみ処理（同一タイプの場合）
        const latestEvents = this.getLatestEventsByType(batch);
        
        for (const event of latestEvents) {
            try {
                const result = await event.processor(event.eventType, event.data);
                event.resolve(result);
            } catch (error) {
                event.reject(error);
            }
        }

        // 残りのイベントを再スケジュール
        if (this.updateQueue.length > 0) {
            this.throttleTimer = setTimeout(() => {
                this.processThrottledUpdates();
            }, this.config.throttleDelay);
        }
    }

    /**
     * タイプ別の最新イベントを取得
     * @param {Array} events - イベント配列
     * @returns {Array} 最新イベント配列
     */
    getLatestEventsByType(events) {
        const latestByType = new Map();
        
        events.forEach(event => {
            const existing = latestByType.get(event.eventType);
            if (!existing || event.timestamp > existing.timestamp) {
                latestByType.set(event.eventType, event);
            }
        });
        
        return Array.from(latestByType.values());
    }

    /**
     * 即座に処理
     * @param {string} eventType - イベントタイプ
     * @param {object} data - イベントデータ
     * @param {function} processor - 処理関数
     * @returns {Promise} 処理結果
     */
    async processImmediately(eventType, data, processor) {
        return await processor(eventType, data);
    }

    /**
     * キャッシュから取得
     * @param {string} key - キャッシュキー
     * @returns {any} キャッシュされた値
     */
    getFromCache(key) {
        if (!this.config.enableCaching) return null;
        
        const cached = this.cache.get(key);
        if (!cached) {
            this.performanceStats.cacheMisses++;
            return null;
        }
        
        // タイムアウトチェック
        if (Date.now() - cached.timestamp > this.config.cacheTimeout) {
            this.cache.delete(key);
            this.performanceStats.cacheMisses++;
            return null;
        }
        
        this.performanceStats.cacheHits++;
        return cached.value;
    }

    /**
     * キャッシュに保存
     * @param {string} key - キャッシュキー
     * @param {any} value - 保存する値
     */
    setCache(key, value) {
        if (!this.config.enableCaching) return;
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
        
        // キャッシュサイズ制限
        if (this.cache.size > 1000) {
            this.cleanupCache();
        }
    }

    /**
     * キャッシュをクリーンアップ
     */
    cleanupCache() {
        const now = Date.now();
        const timeout = this.config.cacheTimeout;
        
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > timeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * パフォーマンス統計を更新
     * @param {number} processingTime - 処理時間
     */
    updatePerformanceStats(processingTime) {
        this.performanceStats.updateCount++;
        this.performanceStats.totalProcessingTime += processingTime;
        this.performanceStats.averageUpdateTime = 
            this.performanceStats.totalProcessingTime / this.performanceStats.updateCount;
    }

    /**
     * パフォーマンス統計を取得
     * @returns {object} パフォーマンス統計
     */
    getPerformanceStats() {
        const cacheEfficiency = this.performanceStats.cacheHits + this.performanceStats.cacheMisses > 0 ?
            (this.performanceStats.cacheHits / (this.performanceStats.cacheHits + this.performanceStats.cacheMisses)) * 100 : 0;
        
        return {
            ...this.performanceStats,
            cacheEfficiency,
            cacheSize: this.cache.size,
            queueSize: this.updateQueue.length + this.batchQueue.length
        };
    }

    /**
     * パフォーマンス統計をリセット
     */
    resetPerformanceStats() {
        this.performanceStats = {
            updateCount: 0,
            averageUpdateTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            batchProcessingCount: 0,
            throttledEvents: 0,
            totalProcessingTime: 0
        };
    }

    /**
     * 設定を更新
     * @param {object} config - 新しい設定
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        
        // バッチプロセッサーの再起動が必要な場合
        if (config.throttleDelay !== undefined) {
            this.startBatchProcessor();
        }
    }

    /**
     * 最適化を一時停止
     */
    pause() {
        if (this.batchProcessor) {
            clearInterval(this.batchProcessor);
            this.batchProcessor = null;
        }
        
        if (this.throttleTimer) {
            clearTimeout(this.throttleTimer);
            this.throttleTimer = null;
        }
    }

    /**
     * 最適化を再開
     */
    resume() {
        this.startBatchProcessor();
    }

    /**
     * 最適化システムを破棄
     */
    destroy() {
        this.pause();
        this.cache.clear();
        this.updateQueue = [];
        this.batchQueue = [];
        this.resetPerformanceStats();
    }
}