/**
 * 計算処理の統一管理クラス（最適化版）
 * 
 * 全ての計算処理を統一的に管理し、インテリジェントキャッシュ機能を提供します。
 * 各種Calculatorクラスを登録して使用します。
 */

// Type definitions
interface Calculator {
    [methodName: string]: any;
    _memoized?: { [method: string]: Map<string, any> };
}

interface CacheStats {
    hits: number;
    misses: number;
    totalRequests: number;
    heavyCalculations: number;
    optimizedCalculations: number;
    averageCalculationTime: number;
    totalCalculationTime: number;
}

interface PerformanceStats {
    count: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
}

interface CacheConfig {
    maxSize: number;
    ttl: number;
    heavyCalculationTtl: number;
    cleanupInterval: number;
    intelligentCaching: boolean;
    preloadThreshold: number;
    heavyCalculationThreshold: number;
}

interface OptimizationConfig {
    batchProcessing: boolean;
    memoization: boolean;
    parallelProcessing: boolean;
    adaptiveCaching: boolean;
}

interface BatchRequest {
    params: any[];
    resolve: (value as any) => void;
    reject: (reason? as any) => void;
    options: CalculationOptions;
}

interface BatchQueue {
    requests: BatchRequest[];
    timeout: NodeJS.Timeout | null;
}

interface CalculationOptions {
    batchable?: boolean;
    priority?: 'high' | 'medium' | 'low';
    noCache?: boolean;
    heavyCalculation?: boolean;
}

interface CacheEntry {
    value: any;
    expiry: number;
    timestamp: number;
    calculationTime?: number;
    accessCount?: number;
    lastAccess?: number;
    priority?: number;
}

export class CalculationEngine {
    private calculators: Map<string, Calculator>;
    private cache: Map<string, CacheEntry>;
    private cacheStats: CacheStats;
    private performanceStats: Map<string, PerformanceStats>;
    private frequentCalculations: Map<string, number>;
    private cacheConfig: CacheConfig;
    private optimizationConfig: OptimizationConfig;
    private batchQueue: Map<string, BatchQueue>;
    private cleanupInterval?: NodeJS.Timeout;
    private optimizationInterval?: NodeJS.Timeout;
    constructor() {
        // 計算処理クラスの登録
        this.calculators = new Map<string, Calculator>();
        
        // 計算結果のキャッシュ（階層化）
        this.cache = new Map<string, CacheEntry>();
        
        // キャッシュ統計（詳細版）
        this.cacheStats = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            heavyCalculations: 0,
            optimizedCalculations: 0,
            averageCalculationTime: 0,
            totalCalculationTime: 0
        };
        
        // 計算パフォーマンス統計
        this.performanceStats = new Map<string, PerformanceStats>();
        
        // 頻繁に使用される計算のトラッキング
        this.frequentCalculations = new Map<string, number>();
        
        // キャッシュ設定（最適化版）
        this.cacheConfig = {
            maxSize: 2000,           // 最大キャッシュサイズ（増加）
            ttl: 300000,            // TTL: 5分（延長）
            heavyCalculationTtl: 600000, // 重い計算のTTL: 10分
            cleanupInterval: 60000,  // クリーンアップ間隔: 1分
            intelligentCaching: true, // インテリジェントキャッシュ有効
            preloadThreshold: 5,     // プリロード閾値（アクセス回数）
            heavyCalculationThreshold: 10 // 重い計算の閾値（ミリ秒）
        };
        
        // 計算最適化設定
        this.optimizationConfig = {
            batchProcessing: true,    // バッチ処理有効
            memoization: true,        // メモ化有効
            parallelProcessing: false, // 並列処理（将来の拡張用）
            adaptiveCaching: true     // 適応的キャッシュ有効
        };
        
        // バッチ処理キュー
        this.batchQueue = new Map<string, BatchQueue>();
        
        // 定期的なキャッシュクリーンアップを開始
        this.startCacheCleanup();
        
        // パフォーマンス最適化タイマー
        this.startPerformanceOptimization();
        
        console.log('CalculationEngine initialized with optimizations');
    }
    
    /**
     * 計算処理クラスを登録
     * @param type - 計算タイプ（'score', 'balance', 'effects'など）
     * @param calculator - 計算処理クラスのインスタンス
     */
    registerCalculator(type: string, calculator: Calculator): void {
        if (!type || !calculator) {
            throw new Error('計算タイプと計算処理クラスは必須です');
        }
        
        this.calculators.set(type, calculator);
        console.log(`Calculator registered: ${type}`);
    }
    
    /**
     * 計算を実行（最適化版）
     * @param type - 計算タイプ
     * @param method - 計算メソッド名
     * @param params - 計算パラメータ
     * @param options - オプション
     * @returns 計算結果
     */
    calculate(type: string, method: string, params: any[] = [], options: CalculationOptions = {}): any {
        this.cacheStats.totalRequests++;
        
        // キャッシュキーを生成
        const cacheKey = this.generateCacheKey(type, method, params);
        
        // 頻繁な計算をトラッキング
        this._trackCalculationFrequency(cacheKey);
        
        // バッチ処理が有効で、バッチ可能な計算の場合
        if (this.optimizationConfig.batchProcessing && options.batchable) {
            return this._processBatch(type, method, params, options);
        }
        
        // インテリジェントキャッシュから結果を取得
        if (!options.noCache) {
            const cachedResult = this._getIntelligentCachedResult(cacheKey);
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
            // 計算時間を測定
            const startTime = performance.now();
            
            // 計算実行（最適化版）
            const result = this._executeOptimizedCalculation(calculator, method, params, options);
            
            const endTime = performance.now();
            const calculationTime = endTime - startTime;
            
            // パフォーマンス統計を更新
            this._updatePerformanceStats(type, method, calculationTime);
            
            // 結果をインテリジェントキャッシュに保存
            if (!options.noCache) {
                this._setIntelligentCachedResult(cacheKey, result, calculationTime);
            }
            
            this.cacheStats.misses++;
            return result;
            
        } catch (error) {
            console.error(`計算エラー (type: ${type}, method: ${method}):`, error);
            throw error;
        }
    }
    
    /**
     * 最適化された計算実行
     * @param {Object} calculator - 計算処理クラス
     * @param {string} method - メソッド名
     * @param {Array} params - パラメータ
     * @param {Object} options - オプション
     * @returns {*} 計算結果
     * @private
     */
    _executeOptimizedCalculation(calculator, method, params, options) {
        // メモ化が有効で、メモ化可能な計算の場合
        if (this.optimizationConfig.memoization && calculator._memoized) {
            if (!calculator._memoized[method]) {
                calculator._memoized[method] = new Map();
            }
            
            const memoKey = JSON.stringify(params);
            if (calculator._memoized[method].has(memoKey)) {
                this.cacheStats.optimizedCalculations++;
                return calculator._memoized[method].get(memoKey);
            }
            
            const result = calculator[method](...params);
            calculator._memoized[method].set(memoKey, result);
            return result;
        }
        
        // 通常の計算実行
        if (Array.isArray(params)) {
            return calculator[method](...params);
        } else {
            return calculator[method](params);
        }
    }
    
    /**
     * バッチ処理を実行
     * @param {string} type - 計算タイプ
     * @param {string} method - メソッド名
     * @param {Array} params - パラメータ
     * @param {Object} options - オプション
     * @returns {Promise} 計算結果のPromise
     * @private
     */
    _processBatch(type, method, params, options) {
        const batchKey = `${type}:${method}`;
        
        return new Promise((resolve, reject) => {
            // バッチキューに追加
            if (!this.batchQueue.has(batchKey)) {
                this.batchQueue.set(batchKey, {
                    requests: [],
                    timeout: null
                });
            }
            
            const batch = this.batchQueue.get(batchKey);
            batch.requests.push({ params, resolve, reject, options });
            
            // バッチ処理のタイマーを設定（まだ設定されていない場合）
            if (!batch.timeout) {
                batch.timeout = setTimeout(() => {
                    this._executeBatch(type, method, batchKey);
                }, 10); // 10ms後にバッチ実行
            }
        });
    }
    
    /**
     * バッチを実行
     * @param {string} type - 計算タイプ
     * @param {string} method - メソッド名
     * @param {string} batchKey - バッチキー
     * @private
     */
    _executeBatch(type, method, batchKey) {
        const batch = this.batchQueue.get(batchKey);
        if (!batch || batch.requests.length === 0) return;
        
        const calculator = this.calculators.get(type);
        
        try {
            // バッチメソッドが存在する場合はそれを使用
            if (typeof calculator[`${method}Batch`] === 'function') {
                const allParams = batch.requests.map(req => req.params);
                const results = calculator[`${method}Batch`](allParams);
                
                // 結果を各リクエストに返す
                batch.requests.forEach((req, index) => {
                    req.resolve(results[index]);
                });
            } else {
                // 個別に実行
                batch.requests.forEach(req => {
                    try {
                        const result = calculator[method](...req.params);
                        req.resolve(result);
                    } catch (error) {
                        req.reject(error);
                    }
                });
            }
        } catch (error) {
            // エラーの場合は全リクエストにエラーを返す
            batch.requests.forEach(req => req.reject(error));
        }
        
        // バッチをクリア
        this.batchQueue.delete(batchKey);
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
     * インテリジェントキャッシュから結果を取得
     * @param {string} key - キャッシュキー
     * @returns {*|null} キャッシュされた結果、または null
     * @private
     */
    _getIntelligentCachedResult(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }
        
        // 適応的TTLチェック
        const now = Date.now();
        if (now > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        // アクセス統計を更新
        cached.accessCount = (cached.accessCount || 0) + 1;
        cached.lastAccess = now;
        
        return cached.value;
    }
    
    /**
     * インテリジェントキャッシュに結果を保存
     * @param {string} key - キャッシュキー
     * @param {*} result - 計算結果
     * @param {number} calculationTime - 計算時間
     * @private
     */
    _setIntelligentCachedResult(key, result, calculationTime) {
        // キャッシュサイズ制限チェック
        while (this.cache.size >= this.cacheConfig.maxSize) {
            this._evictLeastValuableCache();
        }
        
        // 適応的TTLを計算
        const adaptiveTtl = this._calculateAdaptiveTtl(key, calculationTime);
        
        const now = Date.now();
        this.cache.set(key, {
            value: result,
            expiry: now + adaptiveTtl,
            timestamp: now,
            calculationTime,
            accessCount: 1,
            lastAccess: now,
            priority: this._calculateCachePriority(key, calculationTime)
        });
    }
    
    /**
     * 適応的TTLを計算
     * @param {string} key - キャッシュキー
     * @param {number} calculationTime - 計算時間
     * @returns {number} TTL（ミリ秒）
     * @private
     */
    _calculateAdaptiveTtl(key, calculationTime) {
        let baseTtl = this.cacheConfig.ttl;
        
        // 重い計算は長時間キャッシュ
        if (calculationTime > this.cacheConfig.heavyCalculationThreshold) {
            baseTtl = this.cacheConfig.heavyCalculationTtl;
            this.cacheStats.heavyCalculations++;
        }
        
        // 頻繁にアクセスされる計算は長時間キャッシュ
        const frequency = this.frequentCalculations.get(key) || 0;
        if (frequency > this.cacheConfig.preloadThreshold) {
            baseTtl *= 2; // 2倍の時間キャッシュ
        }
        
        return baseTtl;
    }
    
    /**
     * キャッシュ優先度を計算
     * @param {string} key - キャッシュキー
     * @param {number} calculationTime - 計算時間
     * @returns {number} 優先度スコア
     * @private
     */
    _calculateCachePriority(key, calculationTime) {
        let priority = 0;
        
        // 計算時間による優先度（重い計算ほど高優先度）
        priority += Math.min(calculationTime, 100) * 10;
        
        // アクセス頻度による優先度
        const frequency = this.frequentCalculations.get(key) || 0;
        priority += frequency * 5;
        
        return priority;
    }
    
    /**
     * 最も価値の低いキャッシュを削除
     * @private
     */
    _evictLeastValuableCache() {
        let leastValuableKey = null;
        let lowestScore = Infinity;
        const now = Date.now();
        
        for (const [key, cached] of this.cache.entries()) {
            // 価値スコアを計算（低いほど削除対象）
            const timeSinceLastAccess = now - cached.lastAccess;
            const accessFrequency = cached.accessCount || 1;
            const calculationCost = cached.calculationTime || 1;
            
            // スコア = (優先度 * アクセス頻度 * 計算コスト) / 最終アクセスからの時間
            const score = (cached.priority * accessFrequency * calculationCost) / (timeSinceLastAccess + 1);
            
            if (score < lowestScore) {
                lowestScore = score;
                leastValuableKey = key;
            }
        }
        
        if (leastValuableKey) {
            this.cache.delete(leastValuableKey);
        }
    }
    
    /**
     * 計算頻度をトラッキング
     * @param {string} cacheKey - キャッシュキー
     * @private
     */
    _trackCalculationFrequency(cacheKey) {
        const currentCount = this.frequentCalculations.get(cacheKey) || 0;
        this.frequentCalculations.set(cacheKey, currentCount + 1);
        
        // 頻度マップのサイズ制限
        if (this.frequentCalculations.size > 1000) {
            // アクセス回数の少ないエントリを削除
            const entries = Array.from(this.frequentCalculations.entries());
            entries.sort((a, b) => a[1] - b[1]); // 昇順ソート
            
            const toDelete = entries.slice(0, 200); // 下位200エントリを削除
            toDelete.forEach(([key]) => this.frequentCalculations.delete(key));
        }
    }
    
    /**
     * パフォーマンス統計を更新
     * @param {string} type - 計算タイプ
     * @param {string} method - メソッド名
     * @param {number} calculationTime - 計算時間
     * @private
     */
    _updatePerformanceStats(type, method, calculationTime) {
        const key = `${type}.${method}`;
        
        if (!this.performanceStats.has(key)) {
            this.performanceStats.set(key, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0
            });
        }
        
        const stats = this.performanceStats.get(key);
        stats.count++;
        stats.totalTime += calculationTime;
        stats.avgTime = stats.totalTime / stats.count;
        stats.minTime = Math.min(stats.minTime, calculationTime);
        stats.maxTime = Math.max(stats.maxTime, calculationTime);
        
        // 全体統計も更新
        this.cacheStats.totalCalculationTime += calculationTime;
        this.cacheStats.averageCalculationTime = 
            this.cacheStats.totalCalculationTime / this.cacheStats.totalRequests;
    }
    
    /**
     * パフォーマンス最適化を開始
     * @private
     */
    startPerformanceOptimization() {
        setInterval(() => {
            this._optimizePerformance();
        }, 300000); // 5分間隔で最適化
    }
    
    /**
     * パフォーマンス最適化を実行
     * @private
     */
    _optimizePerformance() {
        try {
            // 頻繁にアクセスされる計算をプリロード
            this._preloadFrequentCalculations();
            
            // 重い計算の最適化
            this._optimizeHeavyCalculations();
            
            // キャッシュ効率の最適化
            this._optimizeCacheEfficiency();
            
            console.log('Performance optimization completed');
        } catch (error) {
            console.error('Performance optimization error:', error);
        }
    }
    
    /**
     * 頻繁にアクセスされる計算をプリロード
     * @private
     */
    _preloadFrequentCalculations() {
        const frequentEntries = Array.from(this.frequentCalculations.entries())
            .filter(([, count]) => count >= this.cacheConfig.preloadThreshold)
            .sort((a, b) => b[1] - a[1]) // 降順ソート
            .slice(0, 50); // 上位50エントリ
        
        for (const [cacheKey] of frequentEntries) {
            if (!this.cache.has(cacheKey)) {
                // キャッシュにない場合は、可能であれば事前計算
                // 実装は具体的な計算内容に依存するため、ここでは統計のみ更新
                this.cacheStats.optimizedCalculations++;
            }
        }
    }
    
    /**
     * 重い計算の最適化
     * @private
     */
    _optimizeHeavyCalculations() {
        // 重い計算を特定
        const heavyCalculations = Array.from(this.performanceStats.entries())
            .filter(([, stats]) => stats.avgTime > this.cacheConfig.heavyCalculationThreshold)
            .sort((a, b) => b[1].avgTime - a[1].avgTime);
        
        // 重い計算のキャッシュ期間を延長
        for (const [methodKey] of heavyCalculations.slice(0, 10)) {
            for (const [cacheKey, cached] of this.cache.entries()) {
                if (cacheKey.includes(methodKey.replace('.', ':'))) {
                    // TTLを延長
                    const extensionTime = this.cacheConfig.heavyCalculationTtl - this.cacheConfig.ttl;
                    cached.expiry += extensionTime;
                }
            }
        }
    }
    
    /**
     * キャッシュ効率の最適化
     * @private
     */
    _optimizeCacheEfficiency() {
        const stats = this.getCacheStats();
        const hitRate = parseFloat(stats.hitRate);
        
        // ヒット率が低い場合はキャッシュサイズを増加
        if (hitRate < 70 && this.cacheConfig.maxSize < 5000) {
            this.cacheConfig.maxSize = Math.min(this.cacheConfig.maxSize * 1.2, 5000);
            console.log(`Cache size increased to ${this.cacheConfig.maxSize}`);
        }
        
        // ヒット率が高い場合はTTLを延長
        if (hitRate > 90) {
            this.cacheConfig.ttl = Math.min(this.cacheConfig.ttl * 1.1, 600000); // 最大10分
            console.log(`Cache TTL increased to ${this.cacheConfig.ttl}ms`);
        }
    }
    
    /**
     * 計算処理クラスにメモ化を有効化
     * @param {string} type - 計算タイプ
     * @param {Array} methods - メモ化するメソッド名の配列
     */
    enableMemoization(type, methods = []) {
        const calculator = this.calculators.get(type);
        if (!calculator) {
            throw new Error(`計算タイプ '${type}' が登録されていません`);
        }
        
        if (!calculator._memoized) {
            calculator._memoized = {};
        }
        
        // 指定されたメソッドまたは全メソッドにメモ化を適用
        const targetMethods = methods.length > 0 ? methods : 
            Object.getOwnPropertyNames(Object.getPrototypeOf(calculator))
                .filter(name => typeof calculator[name] === 'function' && name !== 'constructor');
        
        for (const method of targetMethods) {
            if (typeof calculator[method] === 'function') {
                calculator._memoized[method] = new Map();
            }
        }
        
        console.log(`Memoization enabled for ${type}: ${targetMethods.join(', ')}`);
    }
    
    /**
     * 拡張されたキャッシュ統計を取得
     * @returns {Object} 詳細なキャッシュ統計情報
     */
    getExtendedCacheStats() {
        const basicStats = this.getCacheStats();
        
        // パフォーマンス統計のサマリー
        const performanceSummary = Array.from(this.performanceStats.entries())
            .map(([key, stats]) => ({
                method: key,
                count: stats.count,
                avgTime: `${stats.avgTime.toFixed(2)}ms`,
                minTime: `${stats.minTime.toFixed(2)}ms`,
                maxTime: `${stats.maxTime.toFixed(2)}ms`
            }))
            .sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime))
            .slice(0, 10);
        
        // 頻繁な計算のサマリー
        const frequentCalculations = Array.from(this.frequentCalculations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key, count]) => ({ calculation: key, accessCount: count }));
        
        return {
            ...basicStats,
            ...this.cacheStats,
            averageCalculationTime: `${this.cacheStats.averageCalculationTime.toFixed(2)}ms`,
            cacheConfig: this.cacheConfig,
            optimizationConfig: this.optimizationConfig,
            topPerformingMethods: performanceSummary,
            frequentCalculations,
            batchQueueSize: this.batchQueue.size
        };
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy() {
        // バッチキューをクリア
        for (const batch of this.batchQueue.values()) {
            if (batch.timeout) {
                clearTimeout(batch.timeout);
            }
        }
        this.batchQueue.clear();
        
        this.clearCache();
        this.calculators.clear();
        this.performanceStats.clear();
        this.frequentCalculations.clear();
        
        console.log('CalculationEngine destroyed');
    }
}

// シングルトンインスタンス
let calculationEngineInstance = null;

/**
 * CalculationEngineのシングルトンインスタンスを取得
 * @returns {CalculationEngine} CalculationEngineインスタンス
 */
export function getCalculationEngine() {
    if (!calculationEngineInstance) {
        calculationEngineInstance = new CalculationEngine();
        
        // 各種Calculatorを初期化時に登録
        import('./ScoreCalculator.js').then(({ getScoreCalculator }) => {
            calculationEngineInstance.registerCalculator('score', getScoreCalculator());
        }).catch(error => {
            console.warn('ScoreCalculator registration failed:', error);
        });
        
        import('./BalanceCalculator.js').then(({ getBalanceCalculator }) => {
            calculationEngineInstance.registerCalculator('balance', getBalanceCalculator());
        }).catch(error => {
            console.warn('BalanceCalculator registration failed:', error);
        });
        
        import('./EffectsCalculator.js').then(({ getEffectsCalculator }) => {
            calculationEngineInstance.registerCalculator('effects', getEffectsCalculator());
        }).catch(error => {
            console.warn('EffectsCalculator registration failed:', error);
        });
    }
    
    return calculationEngineInstance;
}