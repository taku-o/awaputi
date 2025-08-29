/**
 * LRU Cache Implementation Component
 * 
 * LRUキャッシュアルゴリズムとノード管理機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * LRUキャッシュノード
 */
class CacheNode {
    constructor(key, value, size) {
        this.key = key;
        this.value = value;
        this.size = size; // バイト単位のサイズ
        this.accessTime = Date.now();
        this.hitCount = 1;
        this.prev = null;
        this.next = null;
    }
}

/**
 * LRUキャッシュ実装
 */
export class LRUCache {
    constructor(maxSize = 50 * 1024 * 1024) { // デフォルト50MB
        this.maxSize = maxSize;
        this.currentSize = 0;
        this.cache = new Map();
        
        // ダミーノードで双方向リストを初期化
        this.head = new CacheNode(null, null, 0);
        this.tail = new CacheNode(null, null, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        
        // 統計情報
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccesses: 0
        };
    }
    
    /**
     * キャッシュから値を取得
     * @param {string} key - キー
     * @returns {*} 値またはnull
     */
    get(key) {
        this.stats.totalAccesses++;
        
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            
            // アクセス情報を更新
            node.accessTime = Date.now();
            node.hitCount++;
            
            // ノードを最前面に移動
            this._moveToHead(node);
            
            this.stats.hits++;
            return node.value;
        }
        
        this.stats.misses++;
        return null;
    }
    
    /**
     * キャッシュに値を設定
     * @param {string} key - キー
     * @param {*} value - 値
     * @param {number} size - サイズ（バイト）
     */
    set(key, value, size) {
        if (this.cache.has(key)) {
            // 既存エントリを更新
            const node = this.cache.get(key);
            const oldSize = node.size;
            
            node.value = value;
            node.size = size;
            node.accessTime = Date.now();
            node.hitCount++;
            
            this.currentSize += (size - oldSize);
            this._moveToHead(node);
        } else {
            // 新しいエントリを追加
            const newNode = new CacheNode(key, value, size);
            
            this.cache.set(key, newNode);
            this._addToHead(newNode);
            
            this.currentSize += size;
        }
        
        // サイズ制限をチェックして必要に応じて削除
        while (this.currentSize > this.maxSize) {
            this._evictLRU();
        }
    }
    
    /**
     * キャッシュから削除
     * @param {string} key - キー
     * @returns {boolean} 削除成功
     */
    delete(key) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            this._removeNode(node);
            this.cache.delete(key);
            this.currentSize -= node.size;
            return true;
        }
        return false;
    }
    
    /**
     * キャッシュをクリア
     */
    clear() {
        this.cache.clear();
        this.currentSize = 0;
        this.head.next = this.tail;
        this.tail.prev = this.head;
        
        // 統計をリセット
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccesses: 0
        };
    }
    
    /**
     * ノードを先頭に移動
     * @param {CacheNode} node - ノード
     * @private
     */
    _moveToHead(node) {
        this._removeNode(node);
        this._addToHead(node);
    }
    
    /**
     * ノードを先頭に追加
     * @param {CacheNode} node - ノード
     * @private
     */
    _addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    
    /**
     * ノードを削除
     * @param {CacheNode} node - ノード
     * @private
     */
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    /**
     * LRUエントリを削除
     * @private
     */
    _evictLRU() {
        const lru = this.tail.prev;
        if (lru !== this.head) {
            this._removeNode(lru);
            this.cache.delete(lru.key);
            this.currentSize -= lru.size;
            this.stats.evictions++;
        }
    }
    
    /**
     * キャッシュ統計を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        const hitRate = this.stats.totalAccesses > 0 ? 
            this.stats.hits / this.stats.totalAccesses : 0;
            
        return {
            ...this.stats,
            hitRate: hitRate,
            currentSize: this.currentSize,
            maxSize: this.maxSize,
            entryCount: this.cache.size,
            memoryUsageRatio: this.currentSize / this.maxSize
        };
    }
    
    /**
     * 削除スコアを計算
     * @param {CacheNode} node - キャッシュノード
     * @returns {number} 削除スコア（低いほど削除候補）
     */
    calculateEvictionScore(node) {
        const now = Date.now();
        const timeSinceAccess = now - node.accessTime;
        const hitCountWeight = node.hitCount;
        const sizeWeight = node.size / (1024 * 1024); // MB単位
        
        // スコア計算（時間経過とサイズは削除候補、ヒット数は保持候補）
        return (timeSinceAccess / 60000) + sizeWeight - (hitCountWeight * 0.1);
    }
    
    /**
     * 期限切れエントリの削除
     * @param {number} maxAge - 最大保持時間（ミリ秒）
     * @returns {Array} 削除されたキーの配列
     */
    removeExpiredEntries(maxAge) {
        const now = Date.now();
        const expiredKeys = [];
        
        // 期限切れエントリを検索
        for (const [key, node] of this.cache) {
            if (now - node.accessTime > maxAge) {
                expiredKeys.push(key);
            }
        }
        
        // 期限切れエントリを削除
        expiredKeys.forEach(key => this.delete(key));
        
        return expiredKeys;
    }
    
    /**
     * 使用頻度に基づくエントリ削除
     * @param {number} targetReduction - 目標削減率
     * @returns {Object} 削除結果
     */
    removeByUsageFrequency(targetReduction) {
        const entries = [];
        
        // 全エントリの使用頻度情報を収集
        for (const [key, node] of this.cache) {
            entries.push({
                key: key,
                hitCount: node.hitCount,
                accessTime: node.accessTime,
                size: node.size,
                score: this.calculateEvictionScore(node)
            });
        }
        
        // スコアの低い順にソート（削除候補）
        entries.sort((a, b) => a.score - b.score);
        
        // 目標削減量まで削除
        const targetSize = this.currentSize * targetReduction;
        let removedSize = 0;
        let removedCount = 0;
        const removedKeys = [];
        
        for (const entry of entries) {
            if (removedSize >= targetSize) {
                break;
            }
            
            this.delete(entry.key);
            removedKeys.push(entry.key);
            removedSize += entry.size;
            removedCount++;
        }
        
        return {
            removedCount,
            removedSize,
            removedKeys
        };
    }
}