import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * 翻訳キャッシュシステム - LRUキャッシュによる高速翻訳アクセス
 */
export class TranslationCache {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.accessOrder = []; // LRU管理用
        this.hitCount = 0;
        this.missCount = 0;
        this.evictionCount = 0;
        
        // キャッシュクリーンアップのタイマー
        this.cleanupInterval = null;
        this.startPeriodicCleanup();
    }
    
    /**
     * キャッシュから翻訳を取得
     */
    get(key, language = 'ja') {
        try {
            const cacheKey = this.generateCacheKey(key, language);
            
            if (this.cache.has(cacheKey)) {
                this.hitCount++;
                this.updateAccessOrder(cacheKey);
                const cached = this.cache.get(cacheKey);
                
                // TTL（Time To Live）チェック
                if (this.isExpired(cached)) {
                    this.cache.delete(cacheKey);
                    this.removeFromAccessOrder(cacheKey);
                    this.missCount++;
                    return null;
                }
                
                return cached.value;
            }
            
            this.missCount++;
            return null;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'get',
                key: key,
                language: language
            });
            this.missCount++;
            return null;
        }
    }
    
    /**
     * キャッシュに翻訳を保存
     */
    set(key, value, language = 'ja', ttl = null) {
        try {
            const cacheKey = this.generateCacheKey(key, language);
            
            // キャッシュサイズ制限チェック
            if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
                this.evictLeastRecentlyUsed();
            }
            
            const cacheEntry = {
                value: value,
                timestamp: Date.now(),
                ttl: ttl,
                accessCount: 1,
                language: language,
                originalKey: key
            };
            
            this.cache.set(cacheKey, cacheEntry);
            this.updateAccessOrder(cacheKey);
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'set',
                key: key,
                language: language
            });
            return false;
        }
    }
    
    /**
     * キャッシュキーを生成
     */
    generateCacheKey(key, language) {
        return `${language}:${key}`;
    }
    
    /**
     * キャッシュエントリが期限切れかチェック
     */
    isExpired(cacheEntry) {
        if (!cacheEntry.ttl) {
            return false; // TTLが設定されていない場合は期限切れしない
        }
        
        return Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
    }
    
    /**
     * アクセス順序を更新（LRU管理）
     */
    updateAccessOrder(cacheKey) {
        // 既存の位置から削除
        this.removeFromAccessOrder(cacheKey);
        
        // 最後（最新）に追加
        this.accessOrder.push(cacheKey);
        
        // キャッシュエントリのアクセス回数を増加
        const entry = this.cache.get(cacheKey);
        if (entry) {
            entry.accessCount++;
        }
    }
    
    /**
     * アクセス順序リストから要素を削除
     */
    removeFromAccessOrder(cacheKey) {
        const index = this.accessOrder.indexOf(cacheKey);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
    }
    
    /**
     * LRU（最も使用頻度の低い）エントリを削除
     */
    evictLeastRecentlyUsed() {
        if (this.accessOrder.length === 0) {
            return;
        }
        
        const lruKey = this.accessOrder.shift();
        this.cache.delete(lruKey);
        this.evictionCount++;
        
        console.log(`Cache eviction: ${lruKey}`);
    }
    
    /**
     * 特定のキーをキャッシュから削除
     */
    delete(key, language = 'ja') {
        try {
            const cacheKey = this.generateCacheKey(key, language);
            const deleted = this.cache.delete(cacheKey);
            
            if (deleted) {
                this.removeFromAccessOrder(cacheKey);
            }
            
            return deleted;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'delete',
                key: key,
                language: language
            });
            return false;
        }
    }
    
    /**
     * 特定言語のキャッシュをクリア
     */
    clearLanguage(language) {
        try {
            const keysToDelete = [];
            
            for (const [cacheKey, entry] of this.cache.entries()) {
                if (entry.language === language) {
                    keysToDelete.push(cacheKey);
                }
            }
            
            for (const key of keysToDelete) {
                this.cache.delete(key);
                this.removeFromAccessOrder(key);
            }
            
            console.log(`Cleared ${keysToDelete.length} cache entries for language: ${language}`);
            return keysToDelete.length;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'clearLanguage',
                language: language
            });
            return 0;
        }
    }
    
    /**
     * キャッシュ全体をクリア
     */
    clear() {
        try {
            const size = this.cache.size;
            this.cache.clear();
            this.accessOrder = [];
            this.resetStats();
            
            console.log(`Cache cleared: ${size} entries removed`);
            return size;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'clear'
            });
            return 0;
        }
    }
    
    /**
     * キャッシュサイズを変更
     */
    resize(newSize) {
        try {
            if (newSize < 1) {
                throw new Error('Cache size must be at least 1');
            }
            
            this.maxSize = newSize;
            
            // 現在のサイズが新しいサイズを超えている場合、LRUで削除
            while (this.cache.size > this.maxSize) {
                this.evictLeastRecentlyUsed();
            }
            
            console.log(`Cache resized to: ${newSize}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'resize',
                newSize: newSize
            });
            return false;
        }
    }
    
    /**
     * キャッシュ統計を取得
     */
    getStats() {
        const totalRequests = this.hitCount + this.missCount;
        const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
        
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitCount: this.hitCount,
            missCount: this.missCount,
            evictionCount: this.evictionCount,
            hitRate: Math.round(hitRate * 100) / 100,
            totalRequests: totalRequests,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    
    /**
     * メモリ使用量を推定
     */
    estimateMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            // キーのサイズ
            totalSize += key.length * 2; // UTF-16文字として計算
            
            // 値のサイズ
            if (typeof entry.value === 'string') {
                totalSize += entry.value.length * 2;
            }
            
            // メタデータのサイズ（推定）
            totalSize += 100; // timestamp, ttl, accessCount, language, originalKey
        }
        
        return {
            bytes: totalSize,
            kb: Math.round(totalSize / 1024 * 100) / 100,
            mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
        };
    }
    
    /**
     * 統計をリセット
     */
    resetStats() {
        this.hitCount = 0;
        this.missCount = 0;
        this.evictionCount = 0;
    }
    
    /**
     * 期限切れエントリを定期的にクリーンアップ
     */
    startPeriodicCleanup(intervalMs = 300000) { // 5分間隔
        this.stopPeriodicCleanup();
        
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredEntries();
        }, intervalMs);
    }
    
    /**
     * 定期クリーンアップを停止
     */
    stopPeriodicCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    
    /**
     * 期限切れエントリをクリーンアップ
     */
    cleanupExpiredEntries() {
        try {
            const expiredKeys = [];
            
            for (const [cacheKey, entry] of this.cache.entries()) {
                if (this.isExpired(entry)) {
                    expiredKeys.push(cacheKey);
                }
            }
            
            for (const key of expiredKeys) {
                this.cache.delete(key);
                this.removeFromAccessOrder(key);
            }
            
            if (expiredKeys.length > 0) {
                console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
            }
            
            return expiredKeys.length;
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_CACHE_ERROR', {
                operation: 'cleanupExpiredEntries'
            });
            return 0;
        }
    }
    
    /**
     * キャッシュの詳細情報を取得（デバッグ用）
     */
    getDetailedInfo() {
        const languages = new Map();
        const keyPatterns = new Map();
        
        for (const [cacheKey, entry] of this.cache.entries()) {
            // 言語別統計
            if (!languages.has(entry.language)) {
                languages.set(entry.language, { count: 0, totalAccess: 0 });
            }
            const langStats = languages.get(entry.language);
            langStats.count++;
            langStats.totalAccess += entry.accessCount;
            
            // キーパターン統計
            const keyPrefix = entry.originalKey.split('.')[0];
            if (!keyPatterns.has(keyPrefix)) {
                keyPatterns.set(keyPrefix, { count: 0, totalAccess: 0 });
            }
            const patternStats = keyPatterns.get(keyPrefix);
            patternStats.count++;
            patternStats.totalAccess += entry.accessCount;
        }
        
        return {
            stats: this.getStats(),
            languages: Object.fromEntries(languages),
            keyPatterns: Object.fromEntries(keyPatterns),
            accessOrder: this.accessOrder.slice(-10), // 最新10件のアクセス
            oldestEntries: this.getOldestEntries(5),
            mostAccessedEntries: this.getMostAccessedEntries(5)
        };
    }
    
    /**
     * 最も古いエントリを取得
     */
    getOldestEntries(count = 5) {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)
            .slice(0, count);
        
        return entries.map(([key, entry]) => ({
            key,
            originalKey: entry.originalKey,
            language: entry.language,
            age: Date.now() - entry.timestamp,
            accessCount: entry.accessCount
        }));
    }
    
    /**
     * 最もアクセス頻度の高いエントリを取得
     */
    getMostAccessedEntries(count = 5) {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => b[1].accessCount - a[1].accessCount)
            .slice(0, count);
        
        return entries.map(([key, entry]) => ({
            key,
            originalKey: entry.originalKey,
            language: entry.language,
            accessCount: entry.accessCount,
            age: Date.now() - entry.timestamp
        }));
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.stopPeriodicCleanup();
        this.clear();
    }
}