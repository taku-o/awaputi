/**
 * FaviconGenerator - Canvas APIを使用した動的ファビコン生成（Main Controller）
 * 
 * Main Controller Pattern: 軽量オーケストレーターとして各専用コンポーネントを統制
 * 
 * Requirements: 2.1, 2.2, 6.1, 6.2, 6.3
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import FaviconCanvasRenderer from './favicon/FaviconCanvasRenderer.js';
import FaviconCacheManager from './favicon/FaviconCacheManager.js';
import FaviconPerformanceManager from './favicon/FaviconPerformanceManager.js';
import FaviconDOMManager from './favicon/FaviconDOMManager.js';

class FaviconGenerator {
    /**
     * デフォルト設定
     */
    static DEFAULT_CONFIG = {
        sizes: [16, 32, 48, 192, 512],
        backgroundColor: '#2196F3',
        textColor: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        text: 'B',
        cacheEnabled: true,
        enablePerformanceOptimizations: true
    };
    
    /**
     * 生成キャッシュ（メモリキャッシュ）
     */
    static generationCache = new Map();
    
    /**
     * 不足しているファビコンを生成
     * @param {Object} config - 生成設定
     * @returns {Promise<Object>} 生成結果
     */
    static async generateMissingFavicons(config = {}) {
        const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
        
        try {
            const result = {
                success: false,
                generated: 0,
                cached: 0,
                failed: 0,
                details: []
            };
            
            // 既存favicon検証
            const validation = FaviconDOMManager.validateExistingFavicons();
            
            // 設定ハッシュ生成
            const configHash = FaviconCacheManager.generateConfigHash(finalConfig);
            
            // 生成リクエスト準備
            const requests = finalConfig.sizes.map(size => ({
                size,
                config: finalConfig,
                configHash
            }));
            
            if (finalConfig.enablePerformanceOptimizations) {
                // バッチ処理で生成
                const batchResults = await FaviconPerformanceManager.processBatch(
                    requests,
                    this._renderFaviconWithCache.bind(this)
                );
                
                this._processBatchResults(batchResults, result);
            } else {
                // 順次処理で生成
                for (const request of requests) {
                    try {
                        const faviconResult = await this._renderFaviconWithCache(null, request);
                        result.generated++;
                        result.details.push(faviconResult);
                    } catch (error) {
                        result.failed++;
                        result.details.push({ size: request.size, error: error.message });
                    }
                }
            }
            
            // DOM更新
            if (result.generated > 0) {
                const faviconData = result.details
                    .filter(detail => detail.dataURL)
                    .map(detail => ({
                        size: detail.size,
                        dataURL: detail.dataURL,
                        type: detail.size === 'ico' ? 'ico' : 'png'
                    }));
                
                FaviconDOMManager.removeExistingFavicons();
                FaviconDOMManager.addFaviconsToDOM(faviconData);
            }
            
            result.success = result.failed === 0 || result.generated > 0;
            
            // メモリクリーンアップ
            if (finalConfig.enablePerformanceOptimizations) {
                FaviconPerformanceManager.cleanupMemory();
            }
            
            return result;
            
        } catch (error) {
            console.error('FaviconGenerator: Generation failed:', error);
            return {
                success: false,
                generated: 0,
                cached: 0,
                failed: 1,
                error: error.message
            };
        }
    }
    
    /**
     * キャッシュクリア
     * @param {number|null} size - 特定サイズのみクリアする場合
     */
    static clearCache(size = null) {
        FaviconCacheManager.clear(size);
        
        // メモリキャッシュもクリア
        if (size === null) {
            this.generationCache.clear();
        } else {
            const keysToDelete = Array.from(this.generationCache.keys())
                .filter(key => key.includes(`_${size}_`));
            keysToDelete.forEach(key => this.generationCache.delete(key));
        }
    }
    
    /**
     * 統計情報取得
     * @returns {Object} 統計情報
     */
    static getStats() {
        const cacheStats = FaviconCacheManager.getStats();
        const performanceStats = FaviconPerformanceManager.getPerformanceStats();
        
        return {
            cache: cacheStats,
            performance: performanceStats,
            memoryCache: {
                size: this.generationCache.size,
                keys: Array.from(this.generationCache.keys())
            }
        };
    }
    
    /**
     * 設定更新
     * @param {Object} newConfig - 新しい設定
     */
    static updateConfig(newConfig) {
        Object.assign(this.DEFAULT_CONFIG, newConfig);
        FaviconPerformanceManager.updateConfig(newConfig);
    }
    
    /**
     * キャッシュ付きファビコンレンダリング
     * @private
     * @param {Object} canvasInfo - Canvas情報
     * @param {Object} request - リクエスト情報
     * @returns {Promise<Object>} レンダリング結果
     */
    static async _renderFaviconWithCache(canvasInfo, request) {
        const { size, config, configHash } = request;
        
        // キャッシュチェック
        if (config.cacheEnabled) {
            const cached = FaviconCacheManager.get(size, configHash);
            if (cached) {
                return { size, dataURL: cached, cached: true };
            }
        }
        
        // Canvas取得（パフォーマンス最適化有効時はプールから）
        const canvas = canvasInfo ? canvasInfo.canvas : 
            FaviconCanvasRenderer.createCanvas(size).canvas;
        const ctx = canvasInfo ? canvasInfo.ctx :
            FaviconCanvasRenderer.createCanvas(size).ctx;
        
        // レンダリング実行
        FaviconCanvasRenderer.renderFavicon(ctx, size, config);
        
        // Data URL生成
        const format = size === 'ico' ? 'ico' : 'png';
        const dataURL = FaviconCanvasRenderer.canvasToDataURL(canvas, format);
        
        // キャッシュ保存
        if (config.cacheEnabled) {
            FaviconCacheManager.set(size, configHash, dataURL);
        }
        
        return { size, dataURL, cached: false };
    }
    
    /**
     * バッチ処理結果を処理
     * @private
     * @param {Array} batchResults - バッチ処理結果
     * @param {Object} result - 結果オブジェクト
     */
    static _processBatchResults(batchResults, result) {
        batchResults.forEach(batchResult => {
            if (batchResult.status === 'fulfilled') {
                const detail = batchResult.value;
                if (detail.cached) {
                    result.cached++;
                } else {
                    result.generated++;
                }
                result.details.push(detail);
            } else {
                result.failed++;
                result.details.push({ 
                    error: batchResult.reason?.message || 'Unknown error'
                });
            }
        });
    }
}

export default FaviconGenerator;