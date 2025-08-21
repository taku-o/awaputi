/**
 * Analytics Performance Optimizer
 * ゲーム分析システムのパフォーマンス最適化機能
 */

export class AnalyticsPerformanceOptimizer {
    constructor(analyticsManager, options: any = { }) {
        this.analyticsManager = analyticsManager;
        
        // 設定
        this.config = {
            // バッチ処理設定
            batchSize: options.batchSize || 50;
    batchTimeout: options.batchTimeout || 5000, // 5秒;
            maxBatchDelay: options.maxBatchDelay || 30000, // 30秒;
            // キャッシュ設定
            cacheSize: options.cacheSize || 1000,
    cacheTimeout: options.cacheTimeout || 300000, // 5分;
            // メモリ管理設定
            memoryCleanupInterval: options.memoryCleanupInterval || 60000, // 1分;
            maxMemoryThreshold: options.maxMemoryThreshold || 100 * 1024 * 1024, // 100MB;
            // パフォーマンス監視設定
            performanceCheckInterval: options.performanceCheckInterval || 1000, // 1秒;
            fpsThreshold: options.fpsThreshold || 30,
    memoryWarningThreshold: options.memoryWarningThreshold || 80 * 1024 * 1024, // 80MB
    }
            ...options
        };
        
        // バッチ処理キュー
        this.eventQueue = [];
        this.batchTimer = null;
        this.lastBatchTime = Date.now();
        
        // キャッシュシステム
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        
        // メモリ管理
        this.memoryUsage = { current: 0,
            peak: 0,
    lastCleanup: Date.now(  }
        
        // パフォーマンス監視
        this.performanceMetrics = { fps: 60,
            frameTime: 16.67,
            memoryUsage: 0,
            eventProcessingTime: 0,
    cacheHitRate: 0  };
        // 最適化統計
        this.optimizationStats = { batchesProcessed: 0,
            cacheHits: 0,
            cacheMisses: 0,
            memoryCleanups: 0,
    performanceWarnings: 0  };
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.startPerformanceMonitoring(),
        this.startMemoryCleanup() }
        this.optimizeEventProcessing(); }
    }
    
    /**
     * パフォーマンス監視開始
     */
    startPerformanceMonitoring() { setInterval(() => {  }
            this.checkPerformanceMetrics(); }
        }, this.config.performanceCheckInterval);
    }
    
    /**
     * パフォーマンスメトリクスチェック
     */
    checkPerformanceMetrics() {
        const now = Date.now(),
        
        // FPS測定（近似値）
        const expectedFrameTime = 1000 / 60, // 60fps期待値
        const actualFrameTime = this.performanceMetrics.frameTime,
        this.performanceMetrics.fps = Math.min(60, Math.round(1000 / actualFrameTime),
        
        // メモリ使用量チェック
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize,
            this.memoryUsage.current = performance.memory.usedJSHeapSize,
            this.memoryUsage.peak = Math.max(this.memoryUsage.peak, this.memoryUsage.current),
            
            // メモリ警告チェック
            if (this.memoryUsage.current > this.config.memoryWarningThreshold) {
    }
                this.handleMemoryWarning(); }
}
        
        // キャッシュヒット率計算
        const totalCacheAccess = this.optimizationStats.cacheHits + this.optimizationStats.cacheMisses;
        this.performanceMetrics.cacheHitRate = totalCacheAccess > 0 ;
            ? (this.optimizationStats.cacheHits / totalCacheAccess) * 100 ;
            : 0;
        
        // FPS警告チェック
        if (this.performanceMetrics.fps < this.config.fpsThreshold) { this.handlePerformanceWarning('Low FPS detected', {
                fps: this.performanceMetrics.fps })
                threshold: this.config.fpsThreshold); 
    }
    
    /**
     * イベント処理最適化
     */
    optimizeEventProcessing() {
        // 元のイベント送信メソッドをオーバーライド
        const originalTrackEvent = this.analyticsManager.trackEvent?.bind(this.analyticsManager),
        
        if (originalTrackEvent) {
    }
            this.analyticsManager.trackEvent = (eventType, data) => {  }
                return this.batchEvent(eventType, data, originalTrackEvent);
        }
        
        // プレイヤー行動追跡の最適化
        const originalTrackPlayerBehavior = this.analyticsManager.trackPlayerBehavior?.bind(this.analyticsManager);
        
        if (originalTrackPlayerBehavior) {
        ','

            ' }'

            this.analyticsManager.trackPlayerBehavior = (eventType, data') => { }'

                return this.batchEvent('player_behavior', { eventType, ...data, originalTrackPlayerBehavior),
    
    /**
     * イベントのバッチ処理
     */
    batchEvent(eventType, data, originalHandler) {
        const event = { : undefined
            type: eventType,
            data: data,
    timestamp: Date.now() }
            handler: originalHandler;;
        this.eventQueue.push(event);
        
        // バッチサイズに達した場合、即座に処理
        if (this.eventQueue.length >= this.config.batchSize) { this.processBatch() } else {  // タイマーを設定（未設定の場合のみ）
            if (!this.batchTimer) { }
                this.batchTimer = setTimeout(() => {  }
                    this.processBatch(); }
                }, this.config.batchTimeout);
            }
        }
        
        // 最大遅延時間チェック
        const timeSinceLastBatch = Date.now() - this.lastBatchTime;
        if (timeSinceLastBatch > this.config.maxBatchDelay) { this.processBatch() }
    }
    
    /**
     * バッチ処理実行
     */
    async processBatch() { if (this.eventQueue.length === 0) return,
        
        const startTime = Date.now(),
        const batchEvents = this.eventQueue.splice(0),
        
        // タイマーをクリア
        if (this.batchTimer) {
            clearTimeout(this.batchTimer) }
            this.batchTimer = null; }
        }
        
        try { // 非同期でバッチ処理
            await this.processBatchAsync(batchEvents),
            
            // 統計更新
            this.optimizationStats.batchesProcessed++,
            this.lastBatchTime = Date.now();
            
            // 処理時間記録
            this.performanceMetrics.eventProcessingTime = Date.now() - startTime,
            ' }'

        } catch (error) {
            console.error('Batch processing failed:', error),
            
            // エラー時は個別処理にフォールバック
            this.fallbackToIndividualProcessing(batchEvents) }
    }
    
    /**
     * 非同期バッチ処理
     */
    async processBatchAsync(events) { // イベントをタイプ別にグループ化
        const groupedEvents = this.groupEventsByType(events),
        
        // 各グループを並列処理
        const processingPromises = Object.entries(groupedEvents).map(([type, typeEvents]) => {  }
            return this.processEventGroup(type, typeEvents););
        
        await Promise.allSettled(processingPromises);
    }
    
    /**
     * イベントをタイプ別にグループ化
     */
    groupEventsByType(events) {
        return events.reduce((groups, event) => { 
    }
            if (!groups[event.type]) { }
                groups[event.type] = [];
            groups[event.type].push(event);
            return groups;
        }, {});
    }
    
    /**
     * イベントグループ処理
     */
    async processEventGroup(type, events) { // 同種のイベントを効率的に処理
        const batchData = events.map(event => event.data),
        
        // 最初のイベントのハンドラーを使用
        const handler = events[0].handler,
        if (handler) {
            try {
                // バッチ処理に対応している場合
                if (handler.length > 2) {
        }
                    await handler(type, batchData, { batch: true; else {  // 個別処理
                    for (const event of events) { }
                        await handler(event.type, event.data); }
} catch (error) {
                console.error(`Event group processing failed for type ${type}:`, error);
            }
}
    
    /**
     * 個別処理フォールバック
     */
    async fallbackToIndividualProcessing(events) { for (const event of events) {
            try {
                if (event.handler) {
    
}
                    await event.handler(event.type, event.data);' }'

                } catch (error) { console.error('Individual event processing failed:', error }
}
    
    /**
     * キャッシュ機能
     */
    getCachedData(key) {
        const cacheEntry = this.cache.get(key),
        const timestamp = this.cacheTimestamps.get(key),
        
        if (cacheEntry && timestamp && (Date.now() - timestamp < this.config.cacheTimeout)) {
            this.optimizationStats.cacheHits++ }
            return cacheEntry;
        
        this.optimizationStats.cacheMisses++;
        return null;
    }
    
    /**
     * キャッシュ設定
     */
    setCachedData(key, data) {
        // キャッシュサイズ制限チェック
        if (this.cache.size >= this.config.cacheSize) {
    }
            this.cleanupCache(); }
        }
        
        this.cache.set(key, data);
        this.cacheTimestamps.set(key, Date.now();
    }
    
    /**
     * キャッシュクリーンアップ
     */
    cleanupCache() {
        const now = Date.now(),
        const keysToDelete = [],
        
        for(const [key, timestamp] of this.cacheTimestamps.entries() {
            if (now - timestamp > this.config.cacheTimeout) {
    }
                keysToDelete.push(key); }
}
        
        keysToDelete.forEach(key => {  ),
            this.cache.delete(key) }
            this.cacheTimestamps.delete(key); }
        });
        
        // サイズ制限に達している場合、古いエントリから削除
        if (this.cache.size >= this.config.cacheSize) {
            const sortedEntries = Array.from(this.cacheTimestamps.entries(),
                .sort((a, b) => a[1] - b[1]),
            
            const deleteCount = Math.floor(this.config.cacheSize * 0.2), // 20%削除
            for (let, i = 0, i < deleteCount && i < sortedEntries.length, i++) {
                const key = sortedEntries[i][0],
                this.cache.delete(key) }
                this.cacheTimestamps.delete(key); }
}
    }
    
    /**
     * メモリクリーンアップ開始
     */
    startMemoryCleanup() { setInterval(() => {  }
            this.performMemoryCleanup(); }
        }, this.config.memoryCleanupInterval);
    }
    
    /**
     * メモリクリーンアップ実行
     */
    performMemoryCleanup() {
        const now = Date.now(),
        
        // キャッシュクリーンアップ
        this.cleanupCache(),
        
        // イベントキューの古いデータをクリーンアップ
        const oldEventThreshold = now - 300000, // 5分前
        this.eventQueue = this.eventQueue.filter(event => );
            event.timestamp > oldEventThreshold),
        
        // パフォーマンスメトリクスの古いデータをクリーンアップ
        if (this.analyticsManager.performanceHistory) {
            this.analyticsManager.performanceHistory = this.analyticsManager.performanceHistory' }'

                .filter(entry => entry.timestamp > now - 3600000); // 1時間保持 }
        }
        ;
        // ガベージコレクションのヒント（実際の効果は限定的）
        if (typeof, window !== 'undefined' && window.gc) {
            try {
        }
                window.gc(); }
            } catch (e) { // gc()が利用できない場合は無視 }
        }
        
        this.optimizationStats.memoryCleanups++;
        this.memoryUsage.lastCleanup = now;
    }
    
    /**
     * メモリ警告処理
     */''
    handleMemoryWarning()';'
        console.warn('High memory usage detected, performing aggressive cleanup);'
        
        // 積極的なクリーンアップ
        this.cache.clear();
        this.cacheTimestamps.clear();
        // 即座にバッチ処理を実行
        this.processBatch()';'
            event.type === 'error' || event.type === 'critical');
        
        this.optimizationStats.performanceWarnings++;
    }
    
    /**
     * パフォーマンス警告処理
     */
    handlePerformanceWarning(message, details) {
        console.warn(`Performance, warning: ${message)`, details};
        
        // バッチサイズを動的に調整
        if (details.fps < this.config.fpsThreshold} {
    }
            this.config.batchSize = Math.max(10, Math.floor(this.config.batchSize * 0.8); }
            this.config.batchTimeout = Math.min(10000, this.config.batchTimeout * 1.2});
        }
        
        this.optimizationStats.performanceWarnings++;
    }
    
    /**
     * 最適化統計取得
     */
    getOptimizationStats() { return {  };
            ...this.optimizationStats }
            performanceMetrics: { ...this.performanceMetrics,
            memoryUsage: { ...this.memoryUsage,
            config: { ...this.config,
            eventQueueSize: this.eventQueue.length,
    cacheSize: this.cache.size } }
    
    /**
     * 設定動的調整
     */''
    adjustConfiguration(newConfig) {
    
}
        this.config = { ...this.config, ...newConfig,

        console.log('Analytics performance configuration updated:', newConfig) }
    
    /**
     * パフォーマンス最適化レポート生成
     */
    generatePerformanceReport() {
        const stats = this.getOptimizationStats(),
        
        return { summary: {'
                batchesProcessed: stats.batchesProcessed,
                cacheHitRate: stats.performanceMetrics.cacheHitRate.toFixed(2) + '%',
                averageFPS: stats.performanceMetrics.fps }

                memoryUsage: (stats.memoryUsage.current / 1024 / 1024).toFixed(2) + 'MB',' };'

                eventProcessingTime: stats.performanceMetrics.eventProcessingTime + 'ms' 
    };
            recommendations: this.generateOptimizationRecommendations(stats,
    detailedStats: stats,
        } }
    
    /**
     * 最適化推奨事項生成
     */
    generateOptimizationRecommendations(stats) {
        const recommendations = [],

        if (stats.performanceMetrics.cacheHitRate < 70) {
    }

            recommendations.push('キャッシュヒット率が低いです。キャッシュサイズを増やすことを検討してください。'; }'
        }

        if (stats.performanceMetrics.fps < 30) {', ' }

            recommendations.push('FPSが低下しています。バッチサイズを小さくするか、処理間隔を長くしてください。'; }'
        }

        if (stats.memoryUsage.current > this.config.memoryWarningThreshold) {', ' }

            recommendations.push('メモリ使用量が多いです。より頻繁なクリーンアップを実行してください。'; }'
        }

        if (stats.eventQueueSize > this.config.batchSize * 2) {', ' }

            recommendations.push('イベントキューが大きくなっています。バッチ処理頻度を上げてください。'; }'
        }
        
        return recommendations;
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        if (this.batchTimer) {
    }
            clearTimeout(this.batchTimer); }
        }
        
        // 残りのイベントを処理
        if (this.eventQueue.length > 0) { this.processBatch() }
        
        // キャッシュクリア
        this.cache.clear();
        this.cacheTimestamps.clear();