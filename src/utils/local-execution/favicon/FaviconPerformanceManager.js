/**
 * FaviconPerformanceManager - Faviconパフォーマンス管理専用クラス
 * バッチ処理、遅延読み込み、メモリ管理を担当
 * 
 * @author Claude Code
 * @version 1.0.0
 */

export default class FaviconPerformanceManager {
    /**
     * パフォーマンス設定
     */
    static PERFORMANCE_CONFIG = {
        lazyLoadingEnabled: true,
        batchProcessing: true,
        memoryCleanupEnabled: true,
        maxConcurrentGeneration: 3,
        cacheCompressionEnabled: true,
        debounceDelay: 100
    };
    
    /**
     * リソースプール
     */
    static _resourcePool = {
        canvasElements: [],
        contexts: [],
        generationQueue: [],
        activeGenerations: 0
    };
    
    /**
     * デバウンス用タイマー
     */
    static _debounceTimers = new Map();
    
    /**
     * Canvas要素プールから取得
     * @param {number} size - サイズ
     * @returns {Object} Canvas要素とコンテキスト
     */
    static getCanvasFromPool(size) {
        // プールから再利用可能なCanvasを探す
        const poolIndex = this._resourcePool.canvasElements.findIndex(
            (item) => item.size === size && !item.inUse
        );
        
        if (poolIndex !== -1) {
            const poolItem = this._resourcePool.canvasElements[poolIndex];
            poolItem.inUse = true;
            
            // Canvasをクリア
            const ctx = poolItem.context;
            ctx.clearRect(0, 0, size, size);
            
            return {
                canvas: poolItem.canvas,
                ctx: poolItem.context,
                fromPool: true,
                poolIndex
            };
        }
        
        // プールに無い場合は新規作成
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // プールに追加
        const poolItem = {
            canvas,
            context: ctx,
            size,
            inUse: true,
            createdAt: Date.now()
        };
        
        this._resourcePool.canvasElements.push(poolItem);
        
        return {
            canvas,
            ctx,
            fromPool: false,
            poolIndex: this._resourcePool.canvasElements.length - 1
        };
    }
    
    /**
     * Canvas要素をプールに返却
     * @param {number} poolIndex - プールインデックス
     */
    static returnCanvasToPool(poolIndex) {
        if (poolIndex >= 0 && poolIndex < this._resourcePool.canvasElements.length) {
            this._resourcePool.canvasElements[poolIndex].inUse = false;
        }
    }
    
    /**
     * バッチ処理でファビコン生成
     * @param {Array<Object>} requests - 生成リクエスト配列
     * @param {Function} renderCallback - レンダリングコールバック
     * @returns {Promise<Array>} 生成結果配列
     */
    static async processBatch(requests, renderCallback) {
        const results = [];
        const batches = this._createBatches(requests, this.PERFORMANCE_CONFIG.maxConcurrentGeneration);
        
        for (const batch of batches) {
            const batchPromises = batch.map(request => 
                this._processSingleRequest(request, renderCallback)
            );
            
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
        }
        
        return results;
    }
    
    /**
     * 遅延読み込み処理
     * @param {Function} generationFunction - 生成関数
     * @param {string} identifier - 識別子
     * @param {number} delay - 遅延時間
     * @returns {Promise} 生成プロミス
     */
    static lazyLoad(generationFunction, identifier, delay = null) {
        const debounceDelay = delay || this.PERFORMANCE_CONFIG.debounceDelay;
        
        // 既存のタイマーをクリア
        if (this._debounceTimers.has(identifier)) {
            clearTimeout(this._debounceTimers.get(identifier));
        }
        
        return new Promise((resolve, reject) => {
            const timer = setTimeout(async () => {
                try {
                    const result = await generationFunction();
                    this._debounceTimers.delete(identifier);
                    resolve(result);
                } catch (error) {
                    this._debounceTimers.delete(identifier);
                    reject(error);
                }
            }, debounceDelay);
            
            this._debounceTimers.set(identifier, timer);
        });
    }
    
    /**
     * メモリクリーンアップ
     */
    static cleanupMemory() {
        if (!this.PERFORMANCE_CONFIG.memoryCleanupEnabled) {
            return;
        }
        
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分
        
        // 古い未使用Canvas要素を削除
        this._resourcePool.canvasElements = this._resourcePool.canvasElements.filter(item => {
            if (!item.inUse && (now - item.createdAt) > maxAge) {
                // Canvas要素を削除
                if (item.canvas && item.canvas.parentNode) {
                    item.canvas.parentNode.removeChild(item.canvas);
                }
                return false;
            }
            return true;
        });
        
        // デバウンスタイマーをクリーンアップ
        this._debounceTimers.forEach((timer, identifier) => {
            clearTimeout(timer);
        });
        this._debounceTimers.clear();
        
        // 強制ガベージコレクション（利用可能な場合）
        if (typeof window !== 'undefined' && window.gc) {
            window.gc();
        }
    }
    
    /**
     * パフォーマンス統計取得
     * @returns {Object} パフォーマンス統計
     */
    static getPerformanceStats() {
        return {
            resourcePool: {
                totalCanvasElements: this._resourcePool.canvasElements.length,
                activeCanvasElements: this._resourcePool.canvasElements.filter(item => item.inUse).length,
                queuedGenerations: this._resourcePool.generationQueue.length,
                activeGenerations: this._resourcePool.activeGenerations
            },
            config: { ...this.PERFORMANCE_CONFIG },
            debounceTimers: this._debounceTimers.size,
            memoryUsage: this._estimateMemoryUsage()
        };
    }
    
    /**
     * パフォーマンス設定更新
     * @param {Object} newConfig - 新しい設定
     */
    static updateConfig(newConfig) {
        Object.assign(this.PERFORMANCE_CONFIG, newConfig);
    }
    
    /**
     * リクエストを処理
     * @private
     * @param {Object} request - リクエスト
     * @param {Function} renderCallback - レンダリングコールバック
     * @returns {Promise} 処理結果
     */
    static async _processSingleRequest(request, renderCallback) {
        this._resourcePool.activeGenerations++;
        
        try {
            const canvasInfo = this.getCanvasFromPool(request.size);
            const result = await renderCallback(canvasInfo, request);
            
            this.returnCanvasToPool(canvasInfo.poolIndex);
            return { status: 'fulfilled', value: result };
        } catch (error) {
            return { status: 'rejected', reason: error };
        } finally {
            this._resourcePool.activeGenerations--;
        }
    }
    
    /**
     * バッチ作成
     * @private
     * @param {Array} items - アイテム配列
     * @param {number} batchSize - バッチサイズ
     * @returns {Array<Array>} バッチ配列
     */
    static _createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    
    /**
     * メモリ使用量推定
     * @private
     * @returns {Object} メモリ使用量情報
     */
    static _estimateMemoryUsage() {
        let estimatedSize = 0;
        
        this._resourcePool.canvasElements.forEach(item => {
            // Canvas要素のメモリ使用量を推定 (4 bytes per pixel * width * height)
            estimatedSize += item.size * item.size * 4;
        });
        
        return {
            canvasMemoryBytes: estimatedSize,
            canvasMemoryKB: Math.round(estimatedSize / 1024),
            canvasMemoryMB: Math.round(estimatedSize / (1024 * 1024) * 10) / 10
        };
    }
}