/**
 * LRU Cache Implementation Component
 * 
 * LRUキャッシュアルゴリズムとノード管理機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler  } from '../../utils/ErrorHandler';

/**
 * Cache statistics interface
 */
export interface CacheStats { hits: number,
    misses: number;
    evictions: number;
    totalAccesses: number;
    hitRate?: number;
    currentSize?: number;
    maxSize?: number;
    entryCount?: number;
    memoryUsageRatio?: number,  }

/**
 * Cache entry info for frequency-based removal
 */
export interface CacheEntryInfo { key: string,
    hitCount: number;
    accessTime: number;
    size: number;
    score: number;

/**
 * Result of cache removal operations
 */
export interface RemovalResult { removedCount: number,
    removedSize: number;
    removedKeys: string[];

/**
 * LRUキャッシュノード
 */
class CacheNode<T = any> { key: string,
    value: T;
    size: number;
    accessTime: number;
    hitCount: number;
    prev: CacheNode<T> | null;
    next: CacheNode<T> | null;
    constructor(key: string, value: T, size: number) {

        this.key = key;
        this.value = value;
        this.size = size; // バイト単位のサイズ
        this.accessTime = Date.now();
        this.hitCount = 1;
        this.prev = null
}
        this.next = null; }
}

/**
 * LRUキャッシュ実装
 */
export class LRUCache<T = any> { private readonly maxSize: number,
    private currentSize: number;
    private readonly, cache: Map<string, CacheNode<T>>,
    private readonly head: CacheNode<T>,
    private readonly tail: CacheNode<T>,
    private stats: CacheStats;
    constructor(maxSize: number = 50 * 1024 * 1024) {

        // デフォルト50MB
        this.maxSize = maxSize;
        this.currentSize = 0;
        this.cache = new Map()';'
        this.head = new CacheNode(', null as any, 0',
        this.tail = new CacheNode(', null as any, 0),'
        this.head.next = this.tail,
        this.tail.prev = this.head,
        
        // 統計情報
        this.stats = {
            hits: 0,
            misses: 0,
    evictions: 0 }
            totalAccesses: 0 
    }
    
    /**
     * キャッシュから値を取得
     * @param key - キー
     * @returns 値またはnull
     */
    get(key: string): T | null { this.stats.totalAccesses++,
        
        if (this.cache.has(key) {
        
            const node = this.cache.get(key)!,
            
            // アクセス情報を更新
            node.accessTime = Date.now(),
            node.hitCount++,
            
            // ノードを最前面に移動
            this._moveToHead(node),
            
            this.stats.hits++ }
            return node.value;
        
        this.stats.misses++;
        return null;
    }
    
    /**
     * キャッシュに値を設定
     * @param key - キー
     * @param value - 値
     * @param size - サイズ（バイト）
     */
    set(key: string, value: T, size: number): void { if (this.cache.has(key) {
            // 既存エントリを更新
            const node = this.cache.get(key)!,
            const oldSize = node.size,
            
            node.value = value,
            node.size = size,
            node.accessTime = Date.now(),
            node.hitCount++,
            
            this.currentSize += (size - oldSize),
            this._moveToHead(node) } else {  // 新しいエントリを追加
            const newNode = new CacheNode(key, value, size),
            
            this.cache.set(key, newNode),
            this._addToHead(newNode) }
            this.currentSize += size; }
        }
        
        // サイズ制限をチェックして必要に応じて削除
        while (this.currentSize > this.maxSize) { this._evictLRU() }
    }
    
    /**
     * キャッシュから削除
     * @param key - キー
     * @returns 削除成功
     */
    delete(key: string): boolean { if (this.cache.has(key) {
            const node = this.cache.get(key)!,
            this._removeNode(node),
            this.cache.delete(key),
            this.currentSize -= node.size,
            return true }
        return false;
    }
    
    /**
     * キャッシュをクリア
     */
    clear(): void { this.cache.clear(),
        this.currentSize = 0;
        this.head.next = this.tail,
        this.tail.prev = this.head,
        
        // 統計をリセット
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
    totalAccesses: 0 }
    
    /**
     * ノードを先頭に移動
     * @param node - ノード
     * @private
     */
    private _moveToHead(node: CacheNode<T>): void { this._removeNode(node),
        this._addToHead(node) }
    
    /**
     * ノードを先頭に追加
     * @param node - ノード
     * @private
     */
    private _addToHead(node: CacheNode<T>): void { node.prev = this.head,
        node.next = this.head.next,
        this.head.next!.prev = node,
        this.head.next = node }
    
    /**
     * ノードを削除
     * @param node - ノード
     * @private
     */
    private _removeNode(node: CacheNode<T>): void { node.prev!.next = node.next,
        node.next!.prev = node.prev }
    
    /**
     * LRUエントリを削除
     * @private
     */
    private _evictLRU(): void { const lru = this.tail.prev,
        if (lru !== this.head) {
            this._removeNode(lru!),
            this.cache.delete(lru!.key),
            this.currentSize -= lru!.size }
            this.stats.evictions++; }
}
    
    /**
     * キャッシュ統計を取得
     * @returns 統計情報
     */
    getStats(): CacheStats { const hitRate = this.stats.totalAccesses > 0 ? undefined : undefined
            this.stats.hits / this.stats.totalAccesses: 0,
            
        return { ...this.stats,
            hitRate: hitRate,
            currentSize: this.currentSize,
            maxSize: this.maxSize,
    entryCount: this.cache.size };
            memoryUsageRatio: this.currentSize / this.maxSize 
    }
    
    /**
     * 削除スコアを計算
     * @param node - キャッシュノード
     * @returns 削除スコア（低いほど削除候補）
     */
    calculateEvictionScore(node: CacheNode<T>): number { const now = Date.now(),
        const timeSinceAccess = now - node.accessTime,
        const hitCountWeight = node.hitCount,
        const sizeWeight = node.size / (1024 * 1024), // MB単位
        
        // スコア計算（時間経過とサイズは削除候補、ヒット数は保持候補）
        return (timeSinceAccess / 60000) + sizeWeight - (hitCountWeight * 0.1) }
    
    /**
     * 期限切れエントリの削除
     * @param maxAge - 最大保持時間（ミリ秒）
     * @returns 削除されたキーの配列
     */
    removeExpiredEntries(maxAge: number): string[] { const now = Date.now(),
        const expiredKeys: string[] = [],
        
        // 期限切れエントリを検索
        for(const [key, node] of this.cache) {
            if (now - node.accessTime > maxAge) {
        }
                expiredKeys.push(key); }
}
        
        // 期限切れエントリを削除
        expiredKeys.forEach(key => this.delete(key);
        
        return expiredKeys;
    }
    
    /**
     * 使用頻度に基づくエントリ削除
     * @param targetReduction - 目標削減率
     * @returns 削除結果
     */
    removeByUsageFrequency(targetReduction: number): RemovalResult { const entries: CacheEntryInfo[] = [],
        
        // 全エントリの使用頻度情報を収集
        for(const [key, node] of this.cache) {
            entries.push({
                key: key),
                hitCount: node.hitCount,
    accessTime: node.accessTime),
                size: node.size) }
                score: this.calculateEvictionScore(node); 
    });
        }
        
        // スコアの低い順にソート（削除候補）
        entries.sort((a, b) => a.score - b.score);
        
        // 目標削減量まで削除
        const targetSize = this.currentSize * targetReduction;
        let removedSize = 0;
        let removedCount = 0;
        const removedKeys: string[] = [],
        
        for (const entry of entries) {
        
            if (removedSize >= targetSize) {
    
}
                break; }
            }
            ';'

            this.delete(entry.key);
            removedKeys.push(entry.key);
            removedSize += entry.size;
            removedCount++;
        }
        
        return { removedCount,
            removedSize };
            removedKeys }
        }'}'