/**
 * 高度キャッシュマネージャー
 * 多層キャッシュ、スマートな削除戦略、パフォーマンス最適化を提供
 */
export class AdvancedCacheManager {
    constructor(options = {}) {
        // 基本設定
        this.maxMemorySize = options.maxMemorySize || 20 * 1024 * 1024; // 20MB
        this.maxEntries = options.maxEntries || 1000;
        this.defaultTTL = options.defaultTTL || 600000; // 10分
        this.cleanupInterval = options.cleanupInterval || 60000; // 1分
        
        // 多層キャッシュ構造
        this.layers = {
            hot: new Map(),    // 頻繁にアクセスされるデータ（インメモリ）
            warm: new Map(),   // 中程度のアクセス頻度（圧縮済み）
            cold: new Map()    // 低頻度アクセス（IndexedDB対応予定）
        };
        
        // メタデータ管理
        this.metadata = new Map(); // エントリごとのメタデータ
        this.accessPatterns = new Map(); // アクセスパターン分析
        this.sizeTracker = new Map(); // サイズトラッキング
        
        // パフォーマンス設定
        this.performanceMode = 'balanced'; // 'memory', 'speed', 'balanced'
        this.compressionThreshold = 1024; // 1KB以上で圧縮を検討
        this.hotCacheRatio = 0.3; // 全体の30%をホットキャッシュに
        this.warmCacheRatio = 0.5; // 全体の50%をウォームキャッシュに
        
        // 統計情報
        this.stats = {
            totalRequests: 0,
            hitsByLayer: { hot: 0, warm: 0, cold: 0 },
            misses: 0,
            evictions: 0,
            compressions: 0,
            decompressions: 0,
            currentMemoryUsage: 0,
            totalEntries: 0,
            averageAccessTime: 0,
            accessTimes: []
        };
        
        // 削除戦略設定
        this.evictionStrategy = 'adaptive'; // 'lru', 'lfu', 'adaptive', 'ttl'
        this.adaptiveWeights = {
            frequency: 0.4,
            recency: 0.3,
            size: 0.2,
            ttl: 0.1
        };
        
        // 圧縮とシリアライゼーション
        this.compressionEnabled = true;
        this.serializationFormat = 'json'; // 'json', 'msgpack'
        
        // 定期クリーンアップの開始
        this.startPeriodicCleanup();
        
        console.log('AdvancedCacheManager initialized with', Object.keys(this.layers).length, 'cache layers');
    }
    
    /**
     * データをキャッシュに追加
     */
    async set(key, value, options = {}) {
        const startTime = performance.now();
        
        try {
            const {
                ttl = this.defaultTTL,
                priority = 'normal',
                compress = null,
                layer = null
            } = options;
            
            // データサイズを計算
            const serializedValue = this._serialize(value);
            const dataSize = this._calculateSize(serializedValue);
            
            // メタデータを作成
            const metadata = {
                key,
                createdAt: Date.now(),
                lastAccessed: Date.now(),
                accessCount: 0,
                ttl,
                priority,
                originalSize: dataSize,
                compressed: false,
                layer: null
            };
            
            // 圧縮判定
            const shouldCompress = compress !== null ? compress : 
                (this.compressionEnabled && dataSize > this.compressionThreshold);
            
            let finalValue = serializedValue;
            if (shouldCompress) {
                finalValue = await this._compress(serializedValue);
                metadata.compressed = true;
                metadata.compressedSize = this._calculateSize(finalValue);
                this.stats.compressions++;
            }
            
            // 適切なレイヤーを決定
            const targetLayer = layer || this._determineLayer(metadata, priority);
            metadata.layer = targetLayer;
            
            // スペース確保
            await this._ensureSpace(dataSize, targetLayer);
            
            // キャッシュに追加
            this.layers[targetLayer].set(key, finalValue);
            this.metadata.set(key, metadata);
            this.sizeTracker.set(key, metadata.compressed ? metadata.compressedSize : metadata.originalSize);
            
            // 統計更新
            this._updateStats(dataSize, performance.now() - startTime);
            
            // アクセスパターンを初期化
            this._initializeAccessPattern(key);
            
            console.log(`Cached ${key} in ${targetLayer} layer (${dataSize} bytes${shouldCompress ? ', compressed' : ''})`);
            
            return true;
            
        } catch (error) {
            console.error('Cache set failed:', error);
            return false;
        }
    }
    
    /**
     * キャッシュからデータを取得
     */
    async get(key) {
        const startTime = performance.now();
        this.stats.totalRequests++;
        
        try {
            // メタデータチェック
            const metadata = this.metadata.get(key);
            if (!metadata) {
                this.stats.misses++;
                return null;
            }
            
            // TTLチェック
            if (this._isExpired(metadata)) {
                await this.delete(key);
                this.stats.misses++;
                return null;
            }
            
            // レイヤーから取得
            const layer = metadata.layer;
            const cachedValue = this.layers[layer].get(key);
            
            if (!cachedValue) {
                this.stats.misses++;
                this.metadata.delete(key);
                this.sizeTracker.delete(key);
                return null;
            }
            
            // 展開処理
            let value = cachedValue;
            if (metadata.compressed) {
                value = await this._decompress(cachedValue);
                this.stats.decompressions++;
            }
            
            const deserializedValue = this._deserialize(value);
            
            // アクセス情報を更新
            this._updateAccessInfo(key, metadata);
            
            // レイヤー最適化（頻繁にアクセスされるものは上位レイヤーに）
            this._optimizeLayerPlacement(key, metadata);
            
            // 統計更新
            this.stats.hitsByLayer[layer]++;
            const accessTime = performance.now() - startTime;
            this.stats.accessTimes.push(accessTime);
            this._updateAverageAccessTime(accessTime);
            this._trackAccessPattern(key, accessTime);
            
            return deserializedValue;
            
        } catch (error) {
            console.error('Cache get failed:', error);
            this.stats.misses++;
            return null;
        }
    }
    
    /**
     * 複数キーの一括取得
     */
    async getMultiple(keys) {
        const results = new Map();
        const promises = keys.map(async (key) => {
            const value = await this.get(key);
            if (value !== null) {
                results.set(key, value);
            }
        });
        
        await Promise.all(promises);
        return results;
    }
    
    /**
     * キャッシュエントリを削除
     */
    async delete(key) {
        try {
            const metadata = this.metadata.get(key);
            if (!metadata) {
                return false;
            }
            
            // 全レイヤーから削除
            for (const layer of Object.keys(this.layers)) {
                this.layers[layer].delete(key);
            }
            
            // メタデータとサイズトラッカーから削除
            this.metadata.delete(key);
            const size = this.sizeTracker.get(key) || 0;
            this.sizeTracker.delete(key);
            this.accessPatterns.delete(key);
            
            // 統計更新
            this.stats.currentMemoryUsage -= size;
            this.stats.totalEntries--;
            
            return true;
            
        } catch (error) {
            console.error('Cache delete failed:', error);
            return false;
        }
    }
    
    /**
     * キーの存在確認
     */
    has(key) {
        const metadata = this.metadata.get(key);
        if (!metadata) {
            return false;
        }
        
        // TTLチェック
        if (this._isExpired(metadata)) {
            this.delete(key);
            return false;
        }
        
        return true;
    }
    
    /**
     * 適切なキャッシュレイヤーを決定
     */
    _determineLayer(metadata, priority) {
        const { originalSize } = metadata;
        
        switch (this.performanceMode) {
            case 'speed':
                // 速度優先：小さなデータはホット、大きなデータもウォーム
                return originalSize < 10240 ? 'hot' : 'warm'; // 10KB
                
            case 'memory':
                // メモリ優先：大きなデータはコールド
                if (originalSize > 102400) return 'cold'; // 100KB
                if (originalSize > 10240) return 'warm';  // 10KB
                return 'hot';
                
            case 'balanced':
            default:
                // バランス：優先度とサイズを考慮
                if (priority === 'high' || originalSize < 5120) {
                    return 'hot'; // 5KB
                }
                if (priority === 'low' || originalSize > 51200) {
                    return 'cold'; // 50KB
                }
                return 'warm';
        }
    }
    
    /**
     * スペースを確保
     */
    async _ensureSpace(requiredSize, targetLayer) {
        const currentSize = this._getCurrentMemoryUsage();
        
        if (currentSize + requiredSize <= this.maxMemorySize) {
            return; // 十分なスペースがある
        }
        
        // 削除が必要
        const spaceToFree = (currentSize + requiredSize) - this.maxMemorySize + (requiredSize * 0.1); // 10%のバッファ
        await this._evictEntries(spaceToFree, targetLayer);
    }
    
    /**
     * エントリを削除してスペースを確保
     */
    async _evictEntries(spaceToFree, protectedLayer) {
        let freedSpace = 0;
        const evictionCandidates = [];
        
        // 削除候補を収集
        for (const [key, metadata] of this.metadata) {
            if (metadata.layer === protectedLayer) {
                continue; // 保護されたレイヤーはスキップ
            }
            
            const size = this.sizeTracker.get(key) || 0;
            const score = this._calculateEvictionScore(key, metadata);
            
            evictionCandidates.push({ key, metadata, size, score });
        }
        
        // スコアでソート（低いスコアから削除）
        evictionCandidates.sort((a, b) => a.score - b.score);
        
        // 必要な分だけ削除
        for (const candidate of evictionCandidates) {
            if (freedSpace >= spaceToFree) {
                break;
            }
            
            await this.delete(candidate.key);
            freedSpace += candidate.size;
            this.stats.evictions++;
        }
        
        console.log(`Evicted entries to free ${freedSpace} bytes`);
    }
    
    /**
     * 削除スコアを計算
     */
    _calculateEvictionScore(key, metadata) {
        const now = Date.now();
        const age = now - metadata.createdAt;
        const timeSinceLastAccess = now - metadata.lastAccessed;
        const accessFrequency = metadata.accessCount / Math.max(age / 1000, 1); // per second
        const size = this.sizeTracker.get(key) || 0;
        const ttlRemaining = Math.max(0, (metadata.createdAt + metadata.ttl) - now);
        
        switch (this.evictionStrategy) {
            case 'lru':
                return timeSinceLastAccess;
                
            case 'lfu':
                return -metadata.accessCount;
                
            case 'ttl':
                return -ttlRemaining;
                
            case 'adaptive':
            default:
                // 複合スコア（低いほど削除されやすい）
                const normalizedFrequency = Math.min(accessFrequency, 10) / 10;
                const normalizedRecency = Math.min(timeSinceLastAccess / 1000, 3600) / 3600;
                const normalizedSize = Math.min(size / 1024, 1024) / 1024;
                const normalizedTTL = Math.min(ttlRemaining / 1000, 3600) / 3600;
                
                return (
                    (1 - normalizedFrequency) * this.adaptiveWeights.frequency +
                    normalizedRecency * this.adaptiveWeights.recency +
                    normalizedSize * this.adaptiveWeights.size +
                    (1 - normalizedTTL) * this.adaptiveWeights.ttl
                );
        }
    }
    
    /**
     * レイヤー配置を最適化
     */
    _optimizeLayerPlacement(key, metadata) {
        const currentLayer = metadata.layer;
        const accessPattern = this.accessPatterns.get(key);
        
        if (!accessPattern) return;
        
        // アクセス頻度に基づいて最適なレイヤーを判定
        const optimalLayer = this._calculateOptimalLayer(accessPattern, metadata);
        
        if (optimalLayer !== currentLayer) {
            // レイヤー移動
            this._moveToLayer(key, currentLayer, optimalLayer);
        }
    }
    
    /**
     * 最適なレイヤーを計算
     */
    _calculateOptimalLayer(accessPattern, metadata) {
        const recentAccessRate = accessPattern.recentAccesses / Math.max(accessPattern.totalAccesses, 1);
        const avgAccessInterval = accessPattern.avgAccessInterval;
        
        // 頻繁にアクセスされている（最近のアクセス率が高く、間隔が短い）
        if (recentAccessRate > 0.7 && avgAccessInterval < 60000) { // 1分以内
            return 'hot';
        }
        
        // 中程度のアクセス
        if (recentAccessRate > 0.3 && avgAccessInterval < 300000) { // 5分以内
            return 'warm';
        }
        
        // 低頻度アクセス
        return 'cold';
    }
    
    /**
     * レイヤー間移動
     */
    _moveToLayer(key, fromLayer, toLayer) {
        const value = this.layers[fromLayer].get(key);
        if (value) {
            this.layers[fromLayer].delete(key);
            this.layers[toLayer].set(key, value);
            
            const metadata = this.metadata.get(key);
            if (metadata) {
                metadata.layer = toLayer;
            }
            
            console.log(`Moved ${key} from ${fromLayer} to ${toLayer} layer`);
        }
    }
    
    /**
     * アクセス情報を更新
     */
    _updateAccessInfo(key, metadata) {
        metadata.lastAccessed = Date.now();
        metadata.accessCount++;
    }
    
    /**
     * アクセスパターンを初期化
     */
    _initializeAccessPattern(key) {
        this.accessPatterns.set(key, {
            totalAccesses: 0,
            recentAccesses: 0,
            lastAccessTime: Date.now(),
            accessIntervals: [],
            avgAccessInterval: 0
        });
    }
    
    /**
     * アクセスパターンを追跡
     */
    _trackAccessPattern(key, accessTime) {
        const pattern = this.accessPatterns.get(key);
        if (!pattern) return;
        
        const now = Date.now();
        const interval = now - pattern.lastAccessTime;
        
        pattern.totalAccesses++;
        pattern.recentAccesses++;
        pattern.lastAccessTime = now;
        
        // アクセス間隔を記録（最新10回分のみ）
        pattern.accessIntervals.push(interval);
        if (pattern.accessIntervals.length > 10) {
            pattern.accessIntervals.shift();
        }
        
        // 平均アクセス間隔を計算
        pattern.avgAccessInterval = pattern.accessIntervals.reduce((a, b) => a + b, 0) / pattern.accessIntervals.length;
        
        // 古いアクセス情報をリセット（1時間ごと）
        if (now - pattern.lastAccessTime > 3600000) {
            pattern.recentAccesses = Math.max(0, pattern.recentAccesses - 1);
        }
    }
    
    /**
     * TTL期限切れチェック
     */
    _isExpired(metadata) {
        return Date.now() > (metadata.createdAt + metadata.ttl);
    }
    
    /**
     * データをシリアライズ
     */
    _serialize(value) {
        switch (this.serializationFormat) {
            case 'json':
            default:
                return JSON.stringify(value);
        }
    }
    
    /**
     * データをデシリアライズ
     */
    _deserialize(serializedValue) {
        switch (this.serializationFormat) {
            case 'json':
            default:
                return JSON.parse(serializedValue);
        }
    }
    
    /**
     * データを圧縮
     */
    async _compress(data) {
        // 基本的な圧縮（実際の実装ではより高度な圧縮アルゴリズムを使用）
        try {
            // 簡単な文字列圧縮
            return data.replace(/\s+/g, ' ').trim();
        } catch (error) {
            console.warn('Compression failed:', error);
            return data;
        }
    }
    
    /**
     * データを展開
     */
    async _decompress(compressedData) {
        try {
            return compressedData;
        } catch (error) {
            console.warn('Decompression failed:', error);
            return compressedData;
        }
    }
    
    /**
     * データサイズを計算
     */
    _calculateSize(data) {
        return new Blob([data]).size;
    }
    
    /**
     * 現在のメモリ使用量を取得
     */
    _getCurrentMemoryUsage() {
        let totalSize = 0;
        for (const size of this.sizeTracker.values()) {
            totalSize += size;
        }
        return totalSize;
    }
    
    /**
     * 統計を更新
     */
    _updateStats(dataSize, accessTime) {
        this.stats.currentMemoryUsage = this._getCurrentMemoryUsage();
        this.stats.totalEntries = this.metadata.size;
        
        if (accessTime > 0) {
            this._updateAverageAccessTime(accessTime);
        }
    }
    
    /**
     * 平均アクセス時間を更新
     */
    _updateAverageAccessTime(accessTime) {
        const times = this.stats.accessTimes;
        if (times.length > 100) {
            times.shift(); // 最新100回分のみ保持
        }
        
        this.stats.averageAccessTime = times.reduce((a, b) => a + b, 0) / times.length;
    }
    
    /**
     * 定期クリーンアップを開始
     */
    startPeriodicCleanup() {
        this.cleanupIntervalId = setInterval(() => {
            this._performPeriodicCleanup();
        }, this.cleanupInterval);
    }
    
    /**
     * 定期クリーンアップを実行
     */
    async _performPeriodicCleanup() {
        const startTime = performance.now();
        let cleanedEntries = 0;
        
        // 期限切れエントリの削除
        const expiredKeys = [];
        for (const [key, metadata] of this.metadata) {
            if (this._isExpired(metadata)) {
                expiredKeys.push(key);
            }
        }
        
        for (const key of expiredKeys) {
            await this.delete(key);
            cleanedEntries++;
        }
        
        // メモリ閾値チェック
        if (this._getCurrentMemoryUsage() > this.maxMemorySize * 0.9) {
            const spaceToFree = this.maxMemorySize * 0.1; // 10%のスペースを確保
            await this._evictEntries(spaceToFree);
        }
        
        // アクセスパターンのクリーンアップ
        this._cleanupAccessPatterns();
        
        const cleanupTime = performance.now() - startTime;
        if (cleanedEntries > 0 || cleanupTime > 100) {
            console.log(`Periodic cleanup completed: ${cleanedEntries} entries removed in ${cleanupTime.toFixed(2)}ms`);
        }
    }
    
    /**
     * アクセスパターンのクリーンアップ
     */
    _cleanupAccessPatterns() {
        const now = Date.now();
        const cleanupThreshold = 24 * 60 * 60 * 1000; // 24時間
        
        for (const [key, pattern] of this.accessPatterns) {
            if (now - pattern.lastAccessTime > cleanupThreshold) {
                // 長期間アクセスがない場合は最近のアクセス数をリセット
                pattern.recentAccesses = Math.max(0, pattern.recentAccesses - 1);
            }
        }
    }
    
    /**
     * 全キャッシュをクリア
     */
    clear() {
        for (const layer of Object.values(this.layers)) {
            layer.clear();
        }
        this.metadata.clear();
        this.accessPatterns.clear();
        this.sizeTracker.clear();
        
        // 統計をリセット
        this.stats = {
            ...this.stats,
            totalEntries: 0,
            currentMemoryUsage: 0
        };
        
        console.log('All cache layers cleared');
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        const hitRate = this.stats.totalRequests > 0 
            ? ((this.stats.totalRequests - this.stats.misses) / this.stats.totalRequests) * 100 
            : 0;
            
        const memoryUsagePercent = (this.stats.currentMemoryUsage / this.maxMemorySize) * 100;
        
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
            memoryUsageKB: Math.round(this.stats.currentMemoryUsage / 1024),
            maxMemoryKB: Math.round(this.maxMemorySize / 1024),
            averageAccessTime: Math.round(this.stats.averageAccessTime * 100) / 100,
            layerDistribution: {
                hot: this.layers.hot.size,
                warm: this.layers.warm.size,
                cold: this.layers.cold.size
            }
        };
    }
    
    /**
     * 詳細統計を取得
     */
    getDetailedStats() {
        const stats = this.getStats();
        
        // レイヤー別詳細
        const layerDetails = {};
        for (const [layerName, layer] of Object.entries(this.layers)) {
            let layerSize = 0;
            let layerEntries = 0;
            
            for (const [key] of layer) {
                const metadata = this.metadata.get(key);
                if (metadata && metadata.layer === layerName) {
                    layerSize += this.sizeTracker.get(key) || 0;
                    layerEntries++;
                }
            }
            
            layerDetails[layerName] = {
                entries: layerEntries,
                sizeKB: Math.round(layerSize / 1024),
                hitRate: stats.hitsByLayer[layerName] / Math.max(stats.totalRequests, 1) * 100
            };
        }
        
        // トップアクセスパターン
        const topAccessPatterns = Array.from(this.accessPatterns.entries())
            .sort(([,a], [,b]) => b.totalAccesses - a.totalAccesses)
            .slice(0, 10)
            .map(([key, pattern]) => ({
                key,
                totalAccesses: pattern.totalAccesses,
                avgInterval: Math.round(pattern.avgAccessInterval / 1000) // seconds
            }));
        
        return {
            ...stats,
            layerDetails,
            topAccessPatterns,
            performanceMode: this.performanceMode,
            evictionStrategy: this.evictionStrategy
        };
    }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config) {
        if (config.maxMemorySize !== undefined) {
            this.maxMemorySize = config.maxMemorySize;
        }
        if (config.performanceMode) {
            this.performanceMode = config.performanceMode;
        }
        if (config.evictionStrategy) {
            this.evictionStrategy = config.evictionStrategy;
        }
        if (config.compressionEnabled !== undefined) {
            this.compressionEnabled = config.compressionEnabled;
        }
        
        console.log('AdvancedCacheManager configuration updated:', config);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }
        
        this.clear();
        console.log('AdvancedCacheManager cleaned up');
    }
}