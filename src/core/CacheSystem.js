/**
 * キャッシュシステム
 * 
 * 設定値と計算結果のキャッシュ機能を提供し、
 * メモリ効率的なキャッシュ管理を実装します。
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

class CacheSystem {
    constructor(options = {}) {
        // キャッシュストレージ
        this.cache = new Map();
        
        // キャッシュ設定
        this.config = {
            maxSize: options.maxSize || 1000,
            ttl: options.ttl || 60000, // デフォルト有効期限: 60秒
            cleanupInterval: options.cleanupInterval || 300000, // デフォルトクリーンアップ間隔: 5分
            priorityFunction: options.priorityFunction || this._defaultPriorityFunction
        };
        
        // キャッシュ統計
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            expirations: 0,
            size: 0,
            totalRequests: 0
        };
        
        // アクセス履歴（LRU用）
        this.accessHistory = new Map();
        
        // 最終クリーンアップ時刻
        this.lastCleanup = Date.now();
        
        // 自動クリーンアップタイマー
        this._startCleanupTimer();
    }
    
    /**
     * キャッシュに値を設定
     * @param {string} key - キャッシュキー
     * @param {*} value - キャッシュする値
     * @param {Object} options - オプション
     * @param {number} options.ttl - 有効期限（ミリ秒）
     * @param {number} options.priority - 優先度（高いほど優先）
     * @returns {boolean} 設定成功フラグ
     */
    set(key, value, options = {}) {
        try {
            // キャッシュサイズ制限チェック
            if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
                this._evictItems(1);
            }
            
            const ttl = options.ttl || this.config.ttl;
            const expiresAt = Date.now() + ttl;
            const priority = options.priority || 0;
            
            // キャッシュエントリを作成
            const entry = {
                value,
                expiresAt,
                priority,
                createdAt: Date.now(),
                accessCount: 0
            };
            
            // キャッシュに保存
            this.cache.set(key, entry);
            
            // 統計更新
            if (!this.accessHistory.has(key)) {
                this.stats.size++;
            }
            
            // アクセス履歴を更新
            this._updateAccessHistory(key);
            
            return true;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.set',
                key,
                value
            });
            return false;
        }
    }
    
    /**
     * キャッシュから値を取得
     * @param {string} key - キャッシュキー
     * @returns {*} キャッシュされた値（存在しない場合はnull）
     */
    get(key) {
        try {
            this.stats.totalRequests++;
            
            // キャッシュの存在確認
            if (!this.cache.has(key)) {
                this.stats.misses++;
                return null;
            }
            
            const entry = this.cache.get(key);
            
            // 有効期限チェック
            if (entry.expiresAt < Date.now()) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.expirations++;
                this.stats.misses++;
                this.stats.size--;
                return null;
            }
            
            // アクセス統計を更新
            entry.accessCount++;
            this._updateAccessHistory(key);
            this.stats.hits++;
            
            return entry.value;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.get',
                key
            });
            return null;
        }
    }
    
    /**
     * キャッシュから値を削除
     * @param {string} key - キャッシュキー
     * @returns {boolean} 削除成功フラグ
     */
    delete(key) {
        try {
            if (this.cache.has(key)) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.size--;
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.delete',
                key
            });
            return false;
        }
    }
    
    /**
     * キャッシュをクリア
     * @param {string} prefix - キープレフィックス（指定した場合はプレフィックスに一致するキーのみ削除）
     * @returns {number} 削除されたエントリ数
     */
    clear(prefix = null) {
        try {
            let count = 0;
            
            if (prefix) {
                // プレフィックスに一致するキーのみ削除
                for (const key of this.cache.keys()) {
                    if (key.startsWith(prefix)) {
                        this.cache.delete(key);
                        this.accessHistory.delete(key);
                        count++;
                    }
                }
            } else {
                // 全キャッシュをクリア
                count = this.cache.size;
                this.cache.clear();
                this.accessHistory.clear();
            }
            
            // 統計更新
            this.stats.size -= count;
            if (this.stats.size < 0) this.stats.size = 0;
            
            return count;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.clear',
                prefix
            });
            return 0;
        }
    }
    
    /**
     * キャッシュの有効期限を更新
     * @param {string} key - キャッシュキー
     * @param {number} ttl - 新しい有効期限（ミリ秒）
     * @returns {boolean} 更新成功フラグ
     */
    updateExpiry(key, ttl = null) {
        try {
            if (!this.cache.has(key)) {
                return false;
            }
            
            const entry = this.cache.get(key);
            const newTtl = ttl || this.config.ttl;
            
            entry.expiresAt = Date.now() + newTtl;
            return true;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.updateExpiry',
                key,
                ttl
            });
            return false;
        }
    }
    
    /**
     * キャッシュの存在確認
     * @param {string} key - キャッシュキー
     * @returns {boolean} 存在フラグ
     */
    has(key) {
        try {
            if (!this.cache.has(key)) {
                return false;
            }
            
            const entry = this.cache.get(key);
            
            // 有効期限チェック
            if (entry.expiresAt < Date.now()) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.expirations++;
                this.stats.size--;
                return false;
            }
            
            return true;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.has',
                key
            });
            return false;
        }
    }
    
    /**
     * キャッシュ統計を取得
     * @returns {Object} キャッシュ統計
     */
    getStats() {
        const hitRate = this.stats.totalRequests > 0 
            ? (this.stats.hits / this.stats.totalRequests) * 100 
            : 0;
        
        return {
            ...this.stats,
            hitRate: `${hitRate.toFixed(2)}%`,
            memoryUsage: this._estimateMemoryUsage()
        };
    }
    
    /**
     * キャッシュ設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // クリーンアップタイマーを再設定
        if (newConfig.cleanupInterval) {
            this._stopCleanupTimer();
            this._startCleanupTimer();
        }
    }
    
    /**
     * キャッシュのクリーンアップを実行
     * @returns {number} 削除されたエントリ数
     */
    cleanup() {
        try {
            let count = 0;
            const now = Date.now();
            
            // 期限切れエントリを削除
            for (const [key, entry] of this.cache.entries()) {
                if (entry.expiresAt < now) {
                    this.cache.delete(key);
                    this.accessHistory.delete(key);
                    count++;
                    this.stats.expirations++;
                }
            }
            
            this.lastCleanup = now;
            this.stats.size -= count;
            if (this.stats.size < 0) this.stats.size = 0;
            
            return count;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem.cleanup'
            });
            return 0;
        }
    }
    
    /**
     * リソースを破棄
     */
    destroy() {
        this._stopCleanupTimer();
        this.cache.clear();
        this.accessHistory.clear();
        this.stats.size = 0;
    }
    
    /**
     * アイテムを追い出す（キャッシュサイズ制限時）
     * @param {number} count - 追い出すアイテム数
     * @private
     */
    _evictItems(count) {
        try {
            if (this.cache.size === 0) return;
            
            // 優先度に基づいて追い出し候補を選定
            const candidates = Array.from(this.cache.entries()).map(([key, entry]) => {
                const priority = this.config.priorityFunction(entry);
                return { key, priority };
            });
            
            // 優先度の低い順にソート
            candidates.sort((a, b) => a.priority - b.priority);
            
            // 指定数のアイテムを追い出し
            const toEvict = candidates.slice(0, count);
            
            for (const { key } of toEvict) {
                this.cache.delete(key);
                this.accessHistory.delete(key);
                this.stats.evictions++;
            }
            
            this.stats.size -= toEvict.length;
            if (this.stats.size < 0) this.stats.size = 0;
            
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'CacheSystem._evictItems',
                count
            });
        }
    }
    
    /**
     * アクセス履歴を更新
     * @param {string} key - キャッシュキー
     * @private
     */
    _updateAccessHistory(key) {
        this.accessHistory.set(key, Date.now());
    }
    
    /**
     * デフォルトの優先度計算関数（LRU + 優先度）
     * @param {Object} entry - キャッシュエントリ
     * @returns {number} 優先度スコア（低いほど追い出し優先）
     * @private
     */
    _defaultPriorityFunction(entry) {
        // 基本優先度（ユーザー指定）
        const basePriority = entry.priority * 1000;
        
        // アクセス頻度ボーナス
        const accessBonus = Math.min(entry.accessCount, 100) * 10;
        
        // 作成時刻ペナルティ（古いほど優先度低）
        const ageMs = Date.now() - entry.createdAt;
        const agePenalty = Math.min(ageMs / 60000, 100) * -5; // 1分あたり5ポイント減
        
        return basePriority + accessBonus + agePenalty;
    }
    
    /**
     * メモリ使用量を推定
     * @returns {string} メモリ使用量（KB）
     * @private
     */
    _estimateMemoryUsage() {
        try {
            let totalSize = 0;
            
            // キャッシュエントリのサイズを推定
            for (const [key, entry] of this.cache.entries()) {
                // キーのサイズ
                totalSize += key.length * 2; // 文字列は約2バイト/文字
                
                // エントリのサイズ
                totalSize += this._estimateObjectSize(entry.value);
                
                // メタデータのサイズ（固定値として推定）
                totalSize += 40; // 数値4つ + オブジェクトオーバーヘッド
            }
            
            // アクセス履歴のサイズ
            totalSize += this.accessHistory.size * 16; // キー参照 + タイムスタンプ
            
            // 統計情報のサイズ
            totalSize += 48; // 数値6つ + オブジェクトオーバーヘッド
            
            return `${Math.round(totalSize / 1024)} KB`;
        } catch (error) {
            return 'unknown';
        }
    }
    
    /**
     * オブジェクトのサイズを推定
     * @param {*} obj - サイズを推定するオブジェクト
     * @returns {number} 推定サイズ（バイト）
     * @private
     */
    _estimateObjectSize(obj) {
        try {
            const type = typeof obj;
            
            if (obj === null || obj === undefined) {
                return 4;
            }
            
            if (type === 'boolean') {
                return 4;
            }
            
            if (type === 'number') {
                return 8;
            }
            
            if (type === 'string') {
                return obj.length * 2 + 4; // 文字列は約2バイト/文字 + 長さ
            }
            
            if (Array.isArray(obj)) {
                let size = 16; // 配列オーバーヘッド
                
                // 最初の10要素のみ計算（パフォーマンス対策）
                const sampleSize = Math.min(obj.length, 10);
                if (sampleSize > 0) {
                    let totalSampleSize = 0;
                    for (let i = 0; i < sampleSize; i++) {
                        totalSampleSize += this._estimateObjectSize(obj[i]);
                    }
                    // 平均サイズ × 全要素数
                    size += (totalSampleSize / sampleSize) * obj.length;
                }
                
                return size;
            }
            
            if (type === 'object') {
                let size = 32; // オブジェクトオーバーヘッド
                
                // 最初の10プロパティのみ計算（パフォーマンス対策）
                const keys = Object.keys(obj);
                const sampleSize = Math.min(keys.length, 10);
                
                if (sampleSize > 0) {
                    let totalSampleSize = 0;
                    for (let i = 0; i < sampleSize; i++) {
                        const key = keys[i];
                        totalSampleSize += key.length * 2; // キー名
                        totalSampleSize += this._estimateObjectSize(obj[key]); // 値
                    }
                    // 平均サイズ × 全プロパティ数
                    size += (totalSampleSize / sampleSize) * keys.length;
                }
                
                return size;
            }
            
            return 8; // その他の型
        } catch (error) {
            return 16; // エラー時のデフォルト値
        }
    }
    
    /**
     * クリーンアップタイマーを開始
     * @private
     */
    _startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
        
        // ノードプロセスが終了しないようにする
        if (this.cleanupTimer && this.cleanupTimer.unref) {
            this.cleanupTimer.unref();
        }
    }
    
    /**
     * クリーンアップタイマーを停止
     * @private
     */
    _stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
}

// シングルトンインスタンス
let instance = null;

/**
 * CacheSystemのシングルトンインスタンスを取得
 * @param {Object} options - 設定オプション
 * @returns {CacheSystem} インスタンス
 */
function getCacheSystem(options = {}) {
    if (!instance) {
        instance = new CacheSystem(options);
    } else if (Object.keys(options).length > 0) {
        // 既存インスタンスの設定を更新
        instance.updateConfig(options);
    }
    return instance;
}

export {
    CacheSystem,
    getCacheSystem
};