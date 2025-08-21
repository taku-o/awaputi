/**
 * 統計パフォーマンス最適化クラス
 * データ収集、メモリ使用量監視、描画最適化機能を提供する
 */
export class StatisticsPerformanceOptimizer {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager,
        
        // パフォーマンス設定
        this.config = {
            batchProcessing: {
                enabled: true,
                batchSize: 100,
    processingInterval: 16, // 60fps対応
    }
                maxBatchWaitTime: 100 
    };
            memoryManagement: { enabled: true,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB,
                cleanupThreshold: 0.8, // 80%でクリーンアップ,
                compressionThreshold: 1000, // 1000レコード以上で圧縮,
                archiveThreshold: 10000 // 10000レコード以上でアーカイブ  };
            renderingOptimization: { enabled: true,
                useOffscreenCanvas: true,
                enableDifferentialUpdate: true,
                viewportCulling: true,
    renderBudget: 16, // 16ms以内でレンダリング完了,
                frameThrottling: true  };
            caching: { enabled: true,
                maxCacheSize: 100,
    cacheTTL: 300000, // 5分,
                compressionLevel: 3  }
        };
        // パフォーマンス監視
        this.performanceMetrics = { dataCollection: {
                averageTime: 0,
                maxTime: 0,
                sampleCount: 0,
    lastMeasurement: 0 };
            memoryUsage: { current: 0,
                peak: 0,
                allocated: 0,
    freed: 0 };
            rendering: { averageFrameTime: 0,
                maxFrameTime: 0,
                frameCount: 0,
    droppedFrames: 0 };
            cache: { hitRate: 0,
                missCount: 0,
                hitCount: 0,
    evictionCount: 0 
    };
        // バッチ処理キュー
        this.processingQueue = { dataOperations: [],
            renderOperations: [],
    cleanupOperations: []  };
        // キャッシュシステム
        this.cache = new Map();
        this.cacheMetadata = new Map();
        
        // メモリ監視
        this.memoryMonitor = { interval: null,
            measurements: [],
    alerts: []  };
        // レンダリング最適化
        this.renderingOptimizer = { offscreenCanvas: null,
            dirtyRegions: new Set(),
            lastRenderTime: 0,
    frameRequestId: null  };
        // データ圧縮マネージャー
        this.compressionManager = { compressionQueue: [],
            isCompressing: false,
    compressionHistory: []  };
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.setupBatchProcessing(),
        this.setupMemoryMonitoring(),
        this.setupRenderingOptimization() }
        this.setupCacheManagement(); }
    }
    
    /**
     * バッチ処理の設定
     */
    setupBatchProcessing() {
        if (!this.config.batchProcessing.enabled) return,
        
        // データ操作バッチ処理
    }
        setInterval(() => {  }
            this.processBatch('dataOperations'; }'
        }, this.config.batchProcessing.processingInterval';
        ';
        // レンダリング操作バッチ処理
        setInterval(() => { }'

            this.processBatch('renderOperations'; }'
        }, this.config.batchProcessing.processingInterval';
        ';
        // クリーンアップ操作バッチ処理
        setInterval(() => { }'

            this.processBatch('cleanupOperations'; }'
        }, this.config.batchProcessing.processingInterval * 4); // 低頻度実行
    }
    
    /**
     * メモリ監視の設定
     */
    setupMemoryMonitoring() {
        if (!this.config.memoryManagement.enabled) return,
        
        this.memoryMonitor.interval = setInterval(() => { 
    }
            this.measureMemoryUsage(); }
            this.checkMemoryThresholds(); }
        }, 1000); // 1秒間隔
    }
    
    /**
     * レンダリング最適化の設定
     */
    setupRenderingOptimization() {
        if (!this.config.renderingOptimization.enabled) return,
        
        // オフスクリーンキャンバスの作成
        if (this.config.renderingOptimization.useOffscreenCanvas) {
            try {
    }
                this.renderingOptimizer.offscreenCanvas = new OffscreenCanvas(1, 1);' }'

            } catch (error) {
                console.warn('OffscreenCanvas not supported, falling back to regular canvas'),
                this.renderingOptimizer.offscreenCanvas = document.createElement('canvas' }'
}
    
    /**
     * キャッシュ管理の設定
     */
    setupCacheManagement() {
        if (!this.config.caching.enabled) return,
        
        // キャッシュ定期クリーンアップ
    }
        setInterval(() => {  }
            this.cleanupExpiredCache();' }'

        }, 60000'); // 1分間隔'
    }
    
    /**
     * データ収集の最適化
     */''
    optimizeDataCollection(operation, data, priority = 'normal' {'

        const startTime = performance.now('',
            this.addToBatch('dataOperations', {
                operation,
                data),
                priority,
                timestamp: Date.now() })

                startTime' }'

            }');
            ';
            // 高優先度の場合は即座に処理
            if(priority === 'high') {', ' }

                this.processBatch('dataOperations'; }'
            }
            ';

            return true;} catch (error) {
            console.error('Data collection optimization failed:', error',
            return false, finally { ''
            this.updatePerformanceMetrics('dataCollection', startTime) }
    }
    
    /**
     * バッチ処理への追加
     */
    addToBatch(queueType, operation) {
        const queue = this.processingQueue[queueType],
        
        if (queue.length >= this.config.batchProcessing.batchSize) {
    }
            this.processBatch(queueType); }
        }
        
        queue.push(operation);
    }
    
    /**
     * バッチ処理の実行
     */
    async processBatch(queueType) { const queue = this.processingQueue[queueType],
        if (queue.length === 0) return,
        
        const batch = queue.splice(0, this.config.batchProcessing.batchSize),
        const startTime = performance.now(),
        ',

        try {'
            switch(queueType) {

                case 'dataOperations':',
                    await this.processDataBatch(batch),

                    break,
                case 'renderOperations':',
                    await this.processRenderBatch(batch),

                    break,
                case 'cleanupOperations':,
                    await this.processCleanupBatch(batch) }
                    break; }
            } catch (error) {
            console.error(`Batch processing failed for ${queueType}:`, error);
        }
        
        const processingTime = performance.now() - startTime;
        console.debug(`Processed ${batch.length} ${queueType} operations, in ${processingTime.toFixed(2})ms`);
    }
    
    /**
     * データバッチの処理
     */
    async processDataBatch(batch) { // 優先度でソート
        batch.sort((a, b) => { }
            const priorityOrder = { high: 3, normal: 2, low: 1  }
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        for (const operation of batch) {
        
            try {
    
}
                await this.executeDataOperation(operation);' }'

            } catch (error) { console.error('Data operation failed:', error }
}
    
    /**
     * データ操作の実行
     */
    async executeDataOperation(operation) {
        const { operation: opType, data } = operation;

        switch(opType) {

            case 'collect':',
                await this.statisticsManager.collectStatistics(data),

                break,
            case 'aggregate':',
                await this.statisticsManager.aggregateData(data),

                break,
            case 'compress':',
                await this.compressData(data),

                break,
            case 'archive':,
                await this.archiveData(data),
                break }
            default: }
                console.warn(`Unknown, data operation: ${opType}`});
        }
    }
    
    /**
     * レンダリングバッチの処理
     */
    async processRenderBatch(batch) { const renderStartTime = performance.now(),
        
        try {
            // 差分更新の場合、変更された領域のみ処理
            if(this.config.renderingOptimization.enableDifferentialUpdate) {
    
}
                batch = this.optimizeDifferentialUpdate(batch); }
            }
            
            // ビューポートカリング
            if (this.config.renderingOptimization.viewportCulling) { batch = this.applyViewportCulling(batch) }
            
            // レンダリング実行
            for (const renderOp of batch) {
                await this.executeRenderOperation(renderOp),
                
                // レンダリング予算チェック
                if (performance.now() - renderStartTime > this.config.renderingOptimization.renderBudget) {
                    // 残りの操作を次のフレームに延期
                    this.processingQueue.renderOperations.unshift(...batch.slice(batch.indexOf(renderOp) + 1)) }
                    break; }
                }'} catch (error) { console.error('Render batch processing failed:', error }
        
        this.updateRenderingMetrics(renderStartTime);
    }
    
    /**
     * 差分更新の最適化
     */
    optimizeDifferentialUpdate(batch) {
        // 重複する領域をマージ
        const mergedRegions = new Map(),
        
        batch.forEach(operation => { )
    }
            const region = operation.region); }
            if (region) { }
                const key = `${region.x},${region.y},${region.width},${region.height}`;
                if(!mergedRegions.has(key) { mergedRegions.set(key, operation) }
});
        
        return Array.from(mergedRegions.values();
    }
    
    /**
     * ビューポートカリングの適用
     */
    applyViewportCulling(batch) {
        // ビューポート外の要素を除外
        return batch.filter(operation => { ) }
            if (!operation.bounds) return true;
            const viewport = operation.viewport || { x: 0, y: 0, width: 1920, height: 1080  }
            return this.isInViewport(operation.bounds, viewport);
        });
    }
    
    /**
     * ビューポート内判定
     */
    isInViewport(bounds, viewport) {
        return !(bounds.x + bounds.width < viewport.x ||,
                bounds.x > viewport.x + viewport.width ||,
                bounds.y + bounds.height < viewport.y || }
                bounds.y > viewport.y + viewport.height); }
    }
    
    /**
     * レンダリング操作の実行
     */
    async executeRenderOperation(operation) {
        const { type, context, data, options } = operation;
        ';

        try {'
            switch(type) {

                case 'chart':',
                    await this.renderChart(context, data, options),

                    break,
                case 'text':',
                    await this.renderText(context, data, options),

                    break,
                case 'background':,
                    await this.renderBackground(context, options),
                    break }
                default: }
                    console.warn(`Unknown, render operation: ${type}`});
            } catch (error) {
            console.error(`Render operation ${type} failed:`, error);
        }
    }
    
    /**
     * クリーンアップバッチの処理
     */
    async processCleanupBatch(batch) { for (const cleanupOp of batch) {
            try {
                await this.executeCleanupOperation(cleanupOp),' }'

            } catch (error) { console.error('Cleanup operation failed:', error }
}
    
    /**
     * クリーンアップ操作の実行
     */
    async executeCleanupOperation(operation) {
        const { type, target } = operation;

        switch(type) {

            case 'cache':',
                this.cleanupCache(target),

                break,
            case 'memory':',
                await this.performMemoryCleanup(target),

                break,
            case 'compress':',
                await this.compressOldData(target),

                break,
            case 'archive':,
                await this.archiveOldData(target) }
                break; }
}
    
    /**
     * メモリ使用量の測定
     */
    measureMemoryUsage() {
        let memoryUsage = 0,
        
        try {
            // パフォーマンスAPIを使用
            if (performance.memory) {
                memoryUsage = performance.memory.usedJSHeapSize,
                this.performanceMetrics.memoryUsage.current = memoryUsage,
                this.performanceMetrics.memoryUsage.peak = Math.max(
                    this.performanceMetrics.memoryUsage.peak) }
                    memoryUsage }
            }
            
            // 統計データのメモリ使用量を推定
            const statsMemoryUsage = this.estimateStatisticsMemoryUsage();
            this.performanceMetrics.memoryUsage.allocated = statsMemoryUsage;

        } catch (error) { console.warn('Memory measurement failed:', error }
        
        // 測定履歴を記録
        this.memoryMonitor.measurements.push({ ),
            timestamp: Date.now(),
            usage: memoryUsage,
    statsUsage: this.performanceMetrics.memoryUsage.allocated });
        // 履歴を制限（最新100件）
        if (this.memoryMonitor.measurements.length > 100) { this.memoryMonitor.measurements = this.memoryMonitor.measurements.slice(-100) }
    }
    
    /**
     * 統計データのメモリ使用量推定
     */
    estimateStatisticsMemoryUsage() {
        let totalSize = 0,
        
        try {
            // 基本統計のサイズ推定
            const stats = this.statisticsManager.statistics,
            totalSize += this.estimateObjectSize(stats),
            
            // 時系列データのサイズ推定
            if (this.statisticsManager.timeSeriesDataManager) {
    }
                totalSize += this.estimateTimeSeriesSize(); }
            }
            
            // キャッシュサイズ
            totalSize += this.estimateCacheSize();

        } catch (error) { console.warn('Memory estimation failed:', error }
        
        return totalSize;
    }
    
    /**
     * オブジェクトサイズの推定
     */
    estimateObjectSize(obj) {
        const jsonString = JSON.stringify(obj) }
        return jsonString.length * 2; // 文字列の概算バイト数（UTF-16） }
    }
    
    /**
     * 時系列データサイズの推定
     */
    estimateTimeSeriesSize() {
        let size = 0,
        
        try {
            const manager = this.statisticsManager.timeSeriesDataManager,
            if (manager.data) {
    }
                size += this.estimateObjectSize(manager.data);' }'

            } catch (error) { console.warn('Time series size estimation failed:', error }
        
        return size;
    }
    
    /**
     * キャッシュサイズの推定
     */
    estimateCacheSize() {
        let size = 0,
        
        for (const [key, value] of this.cache) {
            size += key.length * 2, // キーのサイズ
    }
            size += this.estimateObjectSize(value); // 値のサイズ }
        }
        
        return size;
    }
    
    /**
     * メモリ閾値のチェック
     */
    checkMemoryThresholds() {
        const currentUsage = this.performanceMetrics.memoryUsage.current,
        const maxUsage = this.config.memoryManagement.maxMemoryUsage,
        const threshold = maxUsage * this.config.memoryManagement.cleanupThreshold,

        if(currentUsage > threshold) {
    }

            this.triggerMemoryCleanup('high_usage'; }'
        }
        
        // 統計データの圧縮チェック
        const statsCount = this.getStatisticsRecordCount();
        if (statsCount > this.config.memoryManagement.compressionThreshold) { this.triggerDataCompression() }
        
        // アーカイブチェック
        if (statsCount > this.config.memoryManagement.archiveThreshold) { this.triggerDataArchive() }
    }
    
    /**
     * 統計レコード数の取得
     */
    getStatisticsRecordCount() {
        let count = 0,
        
        try {
            const stats = this.statisticsManager.statistics,
            if (stats.sessions) count += stats.sessions.length,
            if (stats.achievements) count += stats.achievements.length,
            
            // 時系列データのカウント
            if (this.statisticsManager.timeSeriesDataManager) {
                const tsManager = this.statisticsManager.timeSeriesDataManager,
                if (tsManager.data) {
                    Object.values(tsManager.data).forEach(periodData => { ) }
                        if(Array.isArray(periodData) { }
                            count += periodData.length; }
});
                }'} catch (error) { console.warn('Record count estimation failed:', error }
        
        return count;
    }
    
    /**
     * メモリクリーンアップのトリガー'
     */''
    triggerMemoryCleanup(reason) {

        this.addToBatch('cleanupOperations', {''
            type: 'memory',',
            target: 'all'),
            reason: reason) }

            timestamp: Date.now(),' }'

        }');
        ';
        // 緊急時は即座に実行
        if(reason === 'high_usage') {', ' }

            this.processBatch('cleanupOperations'; }'
}
    
    /**
     * データ圧縮のトリガー
     */
    triggerDataCompression() {

        if(this.compressionManager.isCompressing) return,

        this.addToBatch('cleanupOperations', {''
            type: 'compress',')',
            target: 'statistics') }
            timestamp: Date.now(); 
    });
    }
    
    /**
     * データアーカイブのトリガー'
     */''
    triggerDataArchive('';
        this.addToBatch('cleanupOperations', { ')'
            type: 'archive',')',
            target: 'old_data',
    timestamp: Date.now(  });
    }
    
    /**
     * データの圧縮
     */
    async compressData(data) { this.compressionManager.isCompressing = true,
        
        try {
            // 古いセッションデータの圧縮
            const compressedData = this.compressSessionData(data),
            
            // 圧縮結果の記録
            this.compressionManager.compressionHistory.push({),
                timestamp: Date.now(),
                originalSize: this.estimateObjectSize(data),
                compressedSize: this.estimateObjectSize(compressedData,
    compressionRatio: this.estimateObjectSize(compressedData) / this.estimateObjectSize(data });
            ';

            return compressedData;} catch (error) {
            console.error('Data compression failed:', error),
            throw error } finally { this.compressionManager.isCompressing = false }
    }
    
    /**
     * セッションデータの圧縮
     */
    compressSessionData(data) {
        // 重複データの除去と要約
        const compressed = {
            summary: this.generateSessionSummary(data),
            sampleData: this.sampleSessions(data,
    metadata: {
                originalCount: data.sessions?.length || 0, : undefined
                compressedAt: Date.now() }
                compressionLevel: this.config.caching.compressionLevel 
    };
        return compressed;
    }
    
    /**
     * セッションサマリーの生成
     */
    generateSessionSummary(data) {
        const sessions = data.sessions || [],
        
        return { totalSessions: sessions.length,
            totalScore: sessions.reduce((sum, s) => sum + (s.score || 0), 0),
            totalPlayTime: sessions.reduce((sum, s) => sum + (s.playTime || 0), 0),
            averageAccuracy: sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length,
            dateRange: {
     }
                start: Math.min(...sessions.map(s = > s.timestamp) };
                end: Math.max(...sessions.map(s => s.timestamp); 
    }
    
    /**
     * セッションのサンプリング
     */
    sampleSessions(data) {
        const sessions = data.sessions || [],
        const sampleSize = Math.min(100, Math.floor(sessions.length * 0.1), // 10%または最大100件
        
        // ランダムサンプリング
        const sampled = [],
        const indices = new Set(),
        
        while (sampled.length < sampleSize && indices.size < sessions.length) {
            const index = Math.floor(Math.random() * sessions.length),
            if(!indices.has(index) {
                indices.add(index) }
                sampled.push(sessions[index]); }
}
        
        return sampled;
    }
    
    /**
     * キャッシュの最適化
     */
    optimizeCache(key, data, options = { ) {
        const cacheKey = this.generateCacheKey(key, options),
        
        // キャッシュヒット確認
        if(this.cache.has(cacheKey) {
            const cached = this.cache.get(cacheKey),
            const metadata = this.cacheMetadata.get(cacheKey),
            
            // TTLチェック
            if (Date.now() - metadata.timestamp < this.config.caching.cacheTTL) {
                this.performanceMetrics.cache.hitCount++,
                this.updateCacheHitRate() }
                return cached; else {  // 期限切れキャッシュを削除
                this.cache.delete(cacheKey) }
                this.cacheMetadata.delete(cacheKey); }
}
        
        // キャッシュミス
        this.performanceMetrics.cache.missCount++;
        this.updateCacheHitRate();
        
        // キャッシュサイズ制限チェック
        if (this.cache.size >= this.config.caching.maxCacheSize) { this.evictLRUCache() }
        
        // 新しいデータをキャッシュ
        this.cache.set(cacheKey, data);
        this.cacheMetadata.set(cacheKey, { ),
            timestamp: Date.now(),
            accessCount: 1,
    size: this.estimateObjectSize(data });
        
        return data;
    }
    
    /**
     * キャッシュキーの生成
     */
    generateCacheKey(key, options) { const optionsString = JSON.stringify(options) }
        return `${key}_${this.hashString(optionsString})`;
    }
    
    /**
     * 文字列ハッシュ
     */
    hashString(str) {
        let hash = 0,
        for (let, i = 0, i < str.length, i++) {
            const char = str.charCodeAt(i),
            hash = ((hash << 5) - hash) + char }
            hash = hash & hash; // 32bit integer }
        }
        return hash;
    }
    
    /**
     * LRUキャッシュの排出
     */
    evictLRUCache() {
        let oldestKey = null,
        let oldestTime = Date.now(),
        
        for (const [key, metadata] of this.cacheMetadata) {
            if (metadata.timestamp < oldestTime) {
                oldestTime = metadata.timestamp }
                oldestKey = key; }
}
        
        if(oldestKey) {
        
            this.cache.delete(oldestKey),
            this.cacheMetadata.delete(oldestKey) }
            this.performanceMetrics.cache.evictionCount++; }
}
    
    /**
     * キャッシュヒット率の更新
     */
    updateCacheHitRate() {
        const total = this.performanceMetrics.cache.hitCount + this.performanceMetrics.cache.missCount,
        this.performanceMetrics.cache.hitRate = total > 0 ? undefined: undefined
    
            this.performanceMetrics.cache.hitCount / total: 0 }
    }
    
    /**
     * 期限切れキャッシュのクリーンアップ
     */
    cleanupExpiredCache() {
        const now = Date.now(),
        const expiredKeys = [],
        
        for (const [key, metadata] of this.cacheMetadata) {
            if (now - metadata.timestamp > this.config.caching.cacheTTL) {
    }
                expiredKeys.push(key); }
}
        
        expiredKeys.forEach(key => {  ),
            this.cache.delete(key) }
            this.cacheMetadata.delete(key); }
        });
        
        if(expiredKeys.length > 0) {
    
}
            console.debug(`Cleaned, up ${expiredKeys.length} expired, cache entries`);
        }
    }
    
    /**
     * パフォーマンスメトリクスの更新
     */
    updatePerformanceMetrics(category, startTime) {
        const duration = performance.now() - startTime,
        const metrics = this.performanceMetrics[category],
        
        if (metrics) {
            metrics.sampleCount++,
            metrics.averageTime = (metrics.averageTime * (metrics.sampleCount - 1) + duration) / metrics.sampleCount,
            metrics.maxTime = Math.max(metrics.maxTime, duration) }
            metrics.lastMeasurement = duration; }
}
    
    /**
     * レンダリングメトリクスの更新
     */
    updateRenderingMetrics(startTime) {
        const frameTime = performance.now() - startTime,
        const metrics = this.performanceMetrics.rendering,
        
        metrics.frameCount++,
        metrics.averageFrameTime = (metrics.averageFrameTime * (metrics.frameCount - 1) + frameTime) / metrics.frameCount,
        metrics.maxFrameTime = Math.max(metrics.maxFrameTime, frameTime),
        
        // フレームドロップの検出
        if (frameTime > this.config.renderingOptimization.renderBudget) {
    }
            metrics.droppedFrames++; }
}
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStatistics() {
        return { ...this.performanceMetrics,
            configuration: this.config,
    memoryMonitor: {
     }
                measurementCount: this.memoryMonitor.measurements.length };
                alertCount: this.memoryMonitor.alerts.length 
    };
            cacheStatistics: { size: this.cache.size,
                totalSize: this.estimateCacheSize(),
                evictionCount: this.performanceMetrics.cache.evictionCount,
    hitRate: this.performanceMetrics.cache.hitRate };
            compressionStatistics: { historyCount: this.compressionManager.compressionHistory.length,
                averageCompressionRatio: this.calculateAverageCompressionRatio(
    isCompressing: this.compressionManager.isCompressing 
    }
    
    /**
     * 平均圧縮率の計算
     */
    calculateAverageCompressionRatio() {
        const history = this.compressionManager.compressionHistory,
        if (history.length === 0) return 0,
        
        const totalRatio = history.reduce((sum, entry) => sum + entry.compressionRatio, 0) }
        return totalRatio / history.length;
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig),
        
        // 設定変更に応じて再初期化
        if (newConfig.memoryManagement) {
    }
            this.setupMemoryMonitoring(); }
        }
        
        if (newConfig.renderingOptimization) { this.setupRenderingOptimization() }
    }
    
    /**
     * 最適化の一時停止
     */
    pause() {
        if (this.memoryMonitor.interval) {
            clearInterval(this.memoryMonitor.interval) }
            this.memoryMonitor.interval = null; }
        }
        
        if(this.renderingOptimizer.frameRequestId) {
        
            cancelAnimationFrame(this.renderingOptimizer.frameRequestId) }
            this.renderingOptimizer.frameRequestId = null; }
}
    
    /**
     * 最適化の再開
     */
    resume() {
        this.setupMemoryMonitoring() }
        this.setupRenderingOptimization(); }
    }
    
    /**
     * リソースのクリーンアップ
     */
    destroy() {
        this.pause(),
        this.cache.clear() }

        this.cacheMetadata.clear() }'