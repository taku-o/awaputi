/**
 * SEOエラーハンドリング
 * 
 * SEO操作中のエラーを適切に処理し、フォールバック機能を提供
 */
import { SEOConfig } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';

export class SEOErrorHandler {
    constructor() {
        this.errorHandlers = new Map();
        this.fallbackStrategies = new Map();
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2
        };
        
        this._registerDefaultHandlers();
        this._registerDefaultFallbacks();
    }
    
    /**
     * エラーハンドラーの登録
     * @param {string} errorType 
     * @param {Function} handler 
     */
    registerHandler(errorType, handler) {
        this.errorHandlers.set(errorType, handler);
    }
    
    /**
     * フォールバック戦略の登録
     * @param {string} component 
     * @param {Function} strategy 
     */
    registerFallback(component, strategy) {
        this.fallbackStrategies.set(component, strategy);
    }
    
    /**
     * エラーの処理
     * @param {Error} error 
     * @param {string} context 
     * @param {Object} data 
     * @returns {any}
     */
    async handle(error, context, data = {}) {
        seoLogger.error(`Error in ${context}`, error);
        
        // エラータイプ別のハンドラー実行
        const handler = this.errorHandlers.get(error.constructor.name) || 
                       this.errorHandlers.get('default');
        
        if (handler) {
            try {
                return await handler(error, context, data);
            } catch (handlerError) {
                seoLogger.error('Error handler failed', handlerError);
            }
        }
        
        // フォールバック戦略の実行
        return this._executeFallback(context, data);
    }
    
    /**
     * リトライ付き操作の実行
     * @param {Function} operation 
     * @param {string} context 
     * @param {Object} options 
     * @returns {any}
     */
    async executeWithRetry(operation, context, options = {}) {
        const config = { ...this.retryConfig, ...options };
        let lastError;
        
        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                const result = await operation();
                
                if (attempt > 0) {
                    seoLogger.info(`${context} succeeded after ${attempt} retries`);
                }
                
                return result;
            } catch (error) {
                lastError = error;
                
                if (attempt < config.maxRetries) {
                    const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt);
                    seoLogger.warn(`${context} failed, retrying in ${delay}ms`, {
                        attempt: attempt + 1,
                        error: error.message
                    });
                    
                    await this._delay(delay);
                }
            }
        }
        
        // 全てのリトライが失敗
        return this.handle(lastError, context, { retriesExhausted: true });
    }
    
    /**
     * フォールバックの実行
     * @private
     */
    _executeFallback(context, data) {
        const fallback = this.fallbackStrategies.get(context) || 
                        this.fallbackStrategies.get('default');
        
        if (fallback) {
            seoLogger.info(`Executing fallback for ${context}`);
            return fallback(data);
        }
        
        seoLogger.error(`No fallback available for ${context}`);
        return null;
    }
    
    /**
     * デフォルトエラーハンドラーの登録
     * @private
     */
    _registerDefaultHandlers() {
        // ネットワークエラー
        this.registerHandler('NetworkError', async (error, context, data) => {
            seoLogger.warn('Network error detected, using cached data if available');
            return data.cached || null;
        });
        
        // 型エラー
        this.registerHandler('TypeError', (error, context, data) => {
            seoLogger.error('Type error in SEO operation', {
                context,
                message: error.message,
                stack: error.stack
            });
            return this._executeFallback(context, data);
        });
        
        // 参照エラー
        this.registerHandler('ReferenceError', (error, context, data) => {
            seoLogger.error('Reference error in SEO operation', {
                context,
                message: error.message
            });
            return this._executeFallback(context, data);
        });
        
        // デフォルトハンドラー
        this.registerHandler('default', (error, context, data) => {
            seoLogger.error('Unhandled error in SEO operation', {
                context,
                errorType: error.constructor.name,
                message: error.message
            });
            return this._executeFallback(context, data);
        });
    }
    
    /**
     * デフォルトフォールバック戦略の登録
     * @private
     */
    _registerDefaultFallbacks() {
        // メタタグフォールバック
        this.registerFallback('metaTags', () => {
            return {
                title: SEOConfig.siteName,
                description: SEOConfig.metadata.defaultDescription[SEOConfig.defaultLanguage],
                image: SEOConfig.socialImages.fallback
            };
        });
        
        // 構造化データフォールバック
        this.registerFallback('structuredData', () => {
            return {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SEOConfig.siteName,
                url: SEOConfig.baseUrl
            };
        });
        
        // ソーシャル画像フォールバック
        this.registerFallback('socialImage', (data) => {
            const fallbackPath = SEOConfig.socialImages.fallback;
            return `${SEOConfig.baseUrl}${fallbackPath}`;
        });
        
        // サイトマップフォールバック
        this.registerFallback('sitemap', () => {
            return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${SEOConfig.baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
        });
        
        // デフォルトフォールバック
        this.registerFallback('default', () => {
            seoLogger.warn('Using empty fallback');
            return null;
        });
    }
    
    /**
     * エラー統計の取得
     * @returns {Object}
     */
    getErrorStatistics() {
        const errorSummary = seoLogger.getErrorSummary();
        
        return {
            ...errorSummary,
            recoveryRate: this._calculateRecoveryRate(),
            commonErrors: this._getCommonErrors()
        };
    }
    
    /**
     * リカバリー率の計算
     * @private
     */
    _calculateRecoveryRate() {
        const logs = seoLogger.export();
        const errors = logs.filter(log => log.level === 'error');
        const recoveries = logs.filter(log => 
            log.level === 'info' && 
            log.message.includes('fallback') || 
            log.message.includes('succeeded after')
        );
        
        if (errors.length === 0) return 100;
        
        return Math.round((recoveries.length / errors.length) * 100);
    }
    
    /**
     * 頻出エラーの取得
     * @private
     */
    _getCommonErrors() {
        const errorSummary = seoLogger.getErrorSummary();
        const sorted = Object.entries(errorSummary.errorTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return Object.fromEntries(sorted);
    }
    
    /**
     * 遅延処理
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// シングルトンインスタンス
export const seoErrorHandler = new SEOErrorHandler();