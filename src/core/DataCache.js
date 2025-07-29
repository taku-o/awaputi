import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * データキャッシュクラス - LRUキャッシュアルゴリズムとキャッシュ管理
 * 
 * 責任:
 * - 頻繁にアクセスするデータのメモリキャッシュ
 * - LRU（Least Recently Used）キャッシュアルゴリズム
 * - キャッシュ無効化とメモリ管理
 * - キャッシュ統計とパフォーマンス監視
 */
export class DataCache {
    constructor(options = {}) {
        // 設定
        this.maxSize = options.maxSize || 1000; // 最大キャッシュエントリ数
        this.maxMemory = options.maxMemory || 50 * 1024 * 1024; // 50MB
        this.ttl = options.ttl || 5 * 60 * 1000; // 5分のTTL
        this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1分ごとにクリーンアップ
        
        // キャッシュストレージ
        this.cache = new Map();
        this.accessOrder = new Map(); // アクセス順序管理用
        this.lastAccess = new Map(); // 最終アクセス時刻
        this.keyMetadata = new Map(); // キーのメタデータ
        
        // メモリ使用量管理
        this.currentMemoryUsage = 0;
        this.sizeEstimator = new Map(); // キーごとのサイズ推定
        
        // 統計情報
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            sets: 0,
            deletes: 0,
            memoryPeakUsage: 0,
            lastCleanup: Date.now()
        };
        
        // イベントリスナー
        this.listeners = new Map();
        
        // クリーンアップタイマー
        this.cleanupTimer = null;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.startCleanupTimer();
        console.log('DataCache initialized');
    }
    
    /**
     * データをキャッシュに設定
     * 
     * @param {string} key - キー
     * @param {*} value - 値
     * @param {Object} options - オプション
     */
    set(key, value, options = {}) {
        try {
            const now = Date.now();
            const ttl = options.ttl || this.ttl;
            const priority = options.priority || 'normal'; // 'high', 'normal', 'low'
            
            // データサイズの推定
            const dataSize = this.estimateSize(value);
            
            // メモリ使用量チェック
            if (this.currentMemoryUsage + dataSize > this.maxMemory) {
                this.evictToMakeSpace(dataSize);
            }
            
            // キャッシュサイズ上限チェック
            if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
                this.evictLeastRecentlyUsed();
            }
            
            // 既存エントリの削除（更新の場合）
            if (this.cache.has(key)) {
                this.currentMemoryUsage -= this.sizeEstimator.get(key) || 0;
            }
            
            // キャッシュエントリを追加
            const cacheEntry = {
                value,
                createdAt: now,
                lastAccessed: now,
                expiresAt: now + ttl,
                accessCount: 0,
                priority,
                dataSize
            };
            
            this.cache.set(key, cacheEntry);
            this.accessOrder.set(key, now);
            this.lastAccess.set(key, now);
            this.sizeEstimator.set(key, dataSize);
            this.keyMetadata.set(key, {
                priority,
                tags: options.tags || [],
                dependencies: options.dependencies || []
            });
            
            this.currentMemoryUsage += dataSize;
            this.stats.sets++;
            
            if (this.currentMemoryUsage > this.stats.memoryPeakUsage) {
                this.stats.memoryPeakUsage = this.currentMemoryUsage;
            }
            
            this.emit('cacheSet', { key, dataSize, priority });
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CACHE_SET_ERROR', {
                key,
                dataSize: this.estimateSize(value),
                options
            });
        }
    }
    
    /**
     * キャッシュからデータを取得
     * 
     * @param {string} key - キー
     * @returns {*} - キャッシュされた値、またはundefined
     */
    get(key) {
        try {
            const entry = this.cache.get(key);
            const now = Date.now();
            
            if (!entry) {
                this.stats.misses++;
                this.emit('cacheMiss', { key });
                return undefined;
            }
            
            // TTLチェック
            if (entry.expiresAt <= now) {
                this.delete(key);
                this.stats.misses++;
                this.emit('cacheExpired', { key });
                return undefined;
            }
            
            // アクセス情報更新
            entry.lastAccessed = now;
            entry.accessCount++;
            this.accessOrder.set(key, now);
            this.lastAccess.set(key, now);
            
            this.stats.hits++;
            this.emit('cacheHit', { key, accessCount: entry.accessCount });
            
            return entry.value;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CACHE_GET_ERROR', { key });
            return undefined;
        }
    }
    
    /**
     * 非同期でデータを取得（キャッシュミス時に値を生成）
     * 
     * @param {string} key - キー
     * @param {Function} valueProvider - 値を生成する関数
     * @param {Object} options - オプション
     * @returns {Promise<*>} - 値
     */
    async getOrSet(key, valueProvider, options = {}) {
        try {
            // キャッシュヒットチェック
            let value = this.get(key);
            if (value !== undefined) {
                return value;
            }
            
            // 値を生成
            const startTime = Date.now();
            value = await valueProvider();
            const generationTime = Date.now() - startTime;
            
            // キャッシュに設定
            this.set(key, value, options);
            
            this.emit('cacheGenerated', { key, generationTime });
            
            return value;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CACHE_GET_OR_SET_ERROR', {
                key,
                options
            });
            throw error;
        }
    }
    
    /**
     * キャッシュからデータを削除
     * 
     * @param {string} key - キー
     * @returns {boolean} - 削除成功フラグ
     */
    delete(key) {
        try {
            if (!this.cache.has(key)) {
                return false;
            }
            
            // メモリ使用量を更新
            const dataSize = this.sizeEstimator.get(key) || 0;
            this.currentMemoryUsage -= dataSize;
            
            // キャッシュから削除
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.lastAccess.delete(key);
            this.sizeEstimator.delete(key);
            this.keyMetadata.delete(key);
            
            this.stats.deletes++;
            this.emit('cacheDelete', { key, dataSize });
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CACHE_DELETE_ERROR', { key });
            return false;
        }
    }
    
    /**
     * 複数のキーを削除
     * 
     * @param {Array<string>} keys - キーの配列
     * @returns {number} - 削除されたキーの数
     */
    deleteMany(keys) {
        let deletedCount = 0;
        for (const key of keys) {
            if (this.delete(key)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    
    /**
     * タグに基づくキャッシュ無効化
     * 
     * @param {string|Array<string>} tags - タグ
     */
    invalidateByTag(tags) {
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        const keysToDelete = [];
        
        for (const [key, metadata] of this.keyMetadata.entries()) {
            if (metadata.tags.some(tag => tagsArray.includes(tag))) {
                keysToDelete.push(key);
            }
        }
        
        const deletedCount = this.deleteMany(keysToDelete);
        this.emit('cacheInvalidatedByTag', { tags: tagsArray, deletedCount });
        
        return deletedCount;
    }
    
    /**
     * 依存関係に基づくキャッシュ無効化
     * 
     * @param {string} dependency - 依存関係
     */
    invalidateByDependency(dependency) {
        const keysToDelete = [];
        
        for (const [key, metadata] of this.keyMetadata.entries()) {
            if (metadata.dependencies.includes(dependency)) {
                keysToDelete.push(key);
            }
        }
        
        const deletedCount = this.deleteMany(keysToDelete);
        this.emit('cacheInvalidatedByDependency', { dependency, deletedCount });
        
        return deletedCount;
    }
    
    /**
     * 全キャッシュをクリア
     */
    clear() {
        const entryCount = this.cache.size;
        const memoryUsage = this.currentMemoryUsage;
        
        this.cache.clear();
        this.accessOrder.clear();
        this.lastAccess.clear();
        this.sizeEstimator.clear();
        this.keyMetadata.clear();
        this.currentMemoryUsage = 0;
        
        this.emit('cacheCleared', { entryCount, memoryUsage });
    }
    
    /**
     * 最近最少使用エントリの削除
     */
    evictLeastRecentlyUsed() {
        if (this.cache.size === 0) return;
        
        // アクセス時刻の古い順にソート
        const sortedEntries = Array.from(this.accessOrder.entries())
            .sort((a, b) => a[1] - b[1]);
        
        // 優先度を考慮した削除対象選択
        let keyToEvict = null;
        
        // まず低優先度のアイテムを探す
        for (const [key] of sortedEntries) {
            const metadata = this.keyMetadata.get(key);
            if (metadata && metadata.priority === 'low') {
                keyToEvict = key;
                break;
            }
        }
        
        // 低優先度がない場合は最も古いアイテム
        if (!keyToEvict && sortedEntries.length > 0) {
            keyToEvict = sortedEntries[0][0];
        }
        
        if (keyToEvict) {
            this.delete(keyToEvict);
            this.stats.evictions++;
            this.emit('cacheEvicted', { key: keyToEvict, reason: 'lru' });
        }
    }
    
    /**
     * メモリ容量確保のための削除
     * 
     * @param {number} requiredSpace - 必要な容量
     */
    evictToMakeSpace(requiredSpace) {
        const targetMemoryUsage = this.maxMemory - requiredSpace;
        
        while (this.currentMemoryUsage > targetMemoryUsage && this.cache.size > 0) {
            this.evictLeastRecentlyUsed();
        }
    }
    
    /**
     * 期限切れエントリのクリーンアップ
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }
        
        const deletedCount = this.deleteMany(expiredKeys);
        this.stats.lastCleanup = now;
        
        if (deletedCount > 0) {
            this.emit('cacheCleanup', { deletedCount, expiredKeys });
        }
        
        return deletedCount;
    }
    
    /**
     * データサイズの推定
     * 
     * @param {*} value - 値
     * @returns {number} - 推定サイズ（バイト）
     */
    estimateSize(value) {
        try {
            if (value === null || value === undefined) {
                return 8; // 基本サイズ
            }
            
            const type = typeof value;
            
            switch (type) {
                case 'boolean':
                    return 4;
                case 'number':
                    return 8;
                case 'string':
                    return value.length * 2; // Unicode文字を考慮
                case 'object':
                    if (Array.isArray(value)) {
                        return value.reduce((size, item) => size + this.estimateSize(item), 0) + 32;
                    } else {
                        // オブジェクトのサイズ推定
                        return JSON.stringify(value).length * 2 + 64;
                    }
                default:
                    return 64; // デフォルトサイズ
            }
        } catch (error) {
            return 1000; // エラー時のフォールバック
        }
    }
    
    /**
     * クリーンアップタイマーの開始
     */
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }
    
    /**
     * クリーンアップタイマーの停止
     */
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
    
    /**
     * キャッシュ統計の取得
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
            : 0;
            
        return {
            ...this.stats,
            hitRate: hitRate.toFixed(2),
            size: this.cache.size,
            maxSize: this.maxSize,
            memoryUsage: this.currentMemoryUsage,
            maxMemory: this.maxMemory,
            memoryUsagePercent: ((this.currentMemoryUsage / this.maxMemory) * 100).toFixed(2)
        };
    }
    
    /**
     * キーの存在チェック
     * 
     * @param {string} key - キー
     * @returns {boolean} - 存在フラグ
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        
        // TTLチェック
        if (entry.expiresAt <= Date.now()) {
            this.delete(key);
            return false;
        }
        
        return true;
    }
    
    /**
     * すべてのキーを取得
     * 
     * @returns {Array<string>} - キーの配列
     */
    keys() {
        return Array.from(this.cache.keys());
    }
    
    /**
     * キャッシュサイズを取得
     * 
     * @returns {number} - エントリ数
     */
    size() {
        return this.cache.size;
    }
    
    /**
     * イベントリスナーの追加
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * イベントの発火
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in cache event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.stopCleanupTimer();
        this.clear();
        this.listeners.clear();
        console.log('DataCache destroyed');
    }
}

// シングルトンインスタンス
let cacheInstance = null;

/**
 * DataCacheシングルトンインスタンスの取得
 */
export function getDataCache() {
    if (!cacheInstance) {
        cacheInstance = new DataCache();
    }
    return cacheInstance;
}