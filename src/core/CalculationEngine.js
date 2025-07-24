/**
 * 計算処理の統一管理クラス
 * 
 * 全ての計算処理を統一的に管理し、キャッシュ機能を提供します。
 * 各種Calculatorクラスを登録して使用します。
 */
export class CalculationEngine {
    constructor() {
        // 計算処理クラスの登録
        this.calculators = new Map();
        
        // 計算結果のキャッシュ
        this.cache = new Map();
        
        // キャッシュ統計
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalRequests: 0
        };
        
        // キャッシュ設定
        this.cacheConfig = {
            maxSize: 1000,           // 最大キャッシュサイズ
            ttl: 60000,             // TTL: 60秒
            cleanupInterval: 30000   // クリーンアップ間隔: 30秒
        };
        
        // 定期的なキャッシュクリーンアップを開始
        this.startCacheCleanup();
        
        console.log('CalculationEngine initialized');
    }
    
    /**
     * 計算処理クラスを登録
     * @param {string} type - 計算タイプ（'score', 'balance', 'effects'など）
     * @param {Object} calculator - 計算処理クラスのインスタンス
     */
    registerCalculator(type, calculator) {
        if (!type || !calculator) {
            throw new Error('計算タイプと計算処理クラスは必須です');
        }
        
        this.calculators.set(type, calculator);
        console.log(`Calculator registered: ${type}`);
    }
    
    /**
     * 計算を実行
     * @param {string} type - 計算タイプ
     * @param {string} method - 計算メソッド名
     * @param {Array} params - 計算パラメータ
     * @param {Object} options - オプション（キャッシュ無効化など）
     * @returns {*} 計算結果
     */
    calculate(type, method, params = [], options = {}) {
        this.cacheStats.totalRequests++;
        
        // キャッシュキーを生成
        const cacheKey = this.generateCacheKey(type, method, params);
        
        // キャッシュから結果を取得（キャッシュ無効化オプションがない場合）
        if (!options.noCache) {
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult !== null) {
                this.cacheStats.hits++;
                return cachedResult;
            }
        }
        
        // 計算処理クラスを取得
        const calculator = this.calculators.get(type);
        if (!calculator) {
            throw new Error(`計算タイプ '${type}' が登録されていません`);
        }
        
        // メソッドの存在確認
        if (typeof calculator[method] !== 'function') {
            throw new Error(`計算メソッド '${method}' が存在しません (type: ${type})`);
        }
        
        try {
            // 計算実行
            const result = calculator[method](...params);
            
            // 結果をキャッシュに保存（キャッシュ無効化オプションがない場合）
            if (!options.noCache) {
                this.setCachedResult(cacheKey, result);
            }
            
            this.cacheStats.misses++;
            return result;
            
        } catch (error) {
            console.error(`計算エラー (type: ${type}, method: ${method}):`, error);
            throw error;
        }
    }
    
    /**
     * キャッシュキーを生成
     * @param {string} type - 計算タイプ
     * @param {string} method - 計算メソッド名
     * @param {Array} params - 計算パラメータ
     * @returns {string} キャッシュキー
     */
    generateCacheKey(type, method, params) {
        const paramString = JSON.stringify(params);
        return `${type}:${method}:${paramString}`;
    }
    
    /**
     * キャッシュから結果を取得
     * @param {string} key - キャッシュキー
     * @returns {*|null} キャッシュされた結果、または null
     */
    getCachedResult(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }
        
        // TTLチェック
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.value;
    }
    
    /**
     * 結果をキャッシュに保存
     * @param {string} key - キャッシュキー
     * @param {*} result - 計算結果
     */
    setCachedResult(key, result) {
        // キャッシュサイズ制限チェック（新しいエントリを追加する前に）
        while (this.cache.size >= this.cacheConfig.maxSize) {
            this.cleanupOldestCache();
        }
        
        const expiry = Date.now() + this.cacheConfig.ttl;
        this.cache.set(key, {
            value: result,
            expiry: expiry,
            timestamp: Date.now()
        });
    }
    
    /**
     * 最も古いキャッシュエントリを削除
     */
    cleanupOldestCache() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, cached] of this.cache.entries()) {
            if (cached.timestamp < oldestTime) {
                oldestTime = cached.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    
    /**
     * 期限切れキャッシュをクリーンアップ
     */
    cleanupExpiredCache() {
        const now = Date.now();
        const keysToDelete = [];
        
        for (const [key, cached] of this.cache.entries()) {
            if (now > cached.expiry) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }
    
    /**
     * 定期的なキャッシュクリーンアップを開始
     */
    startCacheCleanup() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, this.cacheConfig.cleanupInterval);
    }
    
    /**
     * キャッシュをクリア
     * @param {string} type - 特定のタイプのキャッシュのみクリア（省略時は全てクリア）
     */
    clearCache(type = null) {
        if (type) {
            // 特定のタイプのキャッシュのみクリア
            const keysToDelete = [];
            for (const key of this.cache.keys()) {
                if (key.startsWith(`${type}:`)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.cache.delete(key));
            console.log(`Cleared ${keysToDelete.length} cache entries for type: ${type}`);
        } else {
            // 全キャッシュをクリア
            const size = this.cache.size;
            this.cache.clear();
            console.log(`Cleared all ${size} cache entries`);
        }
        
        // 統計をリセット
        this.cacheStats.hits = 0;
        this.cacheStats.misses = 0;
        this.cacheStats.totalRequests = 0;
    }
    
    /**
     * キャッシュ統計を取得
     * @returns {Object} キャッシュ統計情報
     */
    getCacheStats() {
        const hitRate = this.cacheStats.totalRequests > 0 
            ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2)
            : 0;
            
        return {
            size: this.cache.size,
            maxSize: this.cacheConfig.maxSize,
            hits: this.cacheStats.hits,
            misses: this.cacheStats.misses,
            totalRequests: this.cacheStats.totalRequests,
            hitRate: `${hitRate}%`
        };
    }
    
    /**
     * 登録されている計算処理クラスの一覧を取得
     * @returns {Array} 計算タイプの配列
     */
    getRegisteredCalculators() {
        return Array.from(this.calculators.keys());
    }
    
    /**
     * 計算処理クラスが登録されているかチェック
     * @param {string} type - 計算タイプ
     * @returns {boolean} 登録されている場合 true
     */
    hasCalculator(type) {
        return this.calculators.has(type);
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            registeredCalculators: this.getRegisteredCalculators(),
            cacheStats: this.getCacheStats(),
            cacheConfig: this.cacheConfig
        };
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy() {
        this.clearCache();
        this.calculators.clear();
        console.log('CalculationEngine destroyed');
    }
}