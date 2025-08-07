/**
 * FaviconGenerator - Canvas APIを使用した動的ファビコン生成
 * 
 * 不足しているファビコンファイルをCanvas APIを使用して動的に生成し、
 * ローカルファイル実行時のファビコンエラーを解決します。
 * 
 * Requirements: 2.1, 2.2, 6.1, 6.2, 6.3
 * 
 * @author Claude Code
 * @version 1.0.0
 */

class FaviconGenerator {
    /**
     * キャッシュキーのプレフィックス
     */
    static CACHE_PREFIX = 'awaputi_favicon_';
    
    /**
     * パフォーマンス最適化用の設定
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
     * デフォルトのファビコン設定
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
     * リソース管理用のプライベートストレージ
     */
    static _resourcePool = {
        canvasElements: [],
        contexts: [],
        generationQueue: [],
        isProcessing: false
    };

    /**
     * 不足しているファビコンを生成（パフォーマンス最適化版）
     * @param {Object} config - 設定オプション
     * @returns {Promise<Object>} 生成結果
     */
    static async generateMissingFavicons(config = {}) {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        const startTime = performance.now();
        
        console.log('FaviconGenerator: Starting optimized favicon generation');
        
        try {
            // パフォーマンス最適化が有効な場合
            if (mergedConfig.enablePerformanceOptimizations) {
                return await this._generateWithOptimizations(mergedConfig, startTime);
            }
            
            // 従来の方法（後方互換性のため）
            return await this._generateLegacy(mergedConfig, startTime);
            
        } catch (error) {
            console.error('FaviconGenerator: Generation failed', error);
            return {
                success: false,
                error: error.message,
                generated: 0,
                cached: 0,
                executionTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * パフォーマンス最適化を適用した生成処理
     * @private
     */
    static async _generateWithOptimizations(config, startTime) {
        // 1. Lazy loading - 必要な場合のみ生成
        if (this.PERFORMANCE_CONFIG.lazyLoadingEnabled) {
            const needsGeneration = await this._checkIfGenerationNeeded(config);
            if (!needsGeneration.required) {
                console.log('FaviconGenerator: Generation not needed, using cached resources');
                return {
                    success: true,
                    generated: 0,
                    cached: needsGeneration.cachedCount,
                    fromCache: needsGeneration.cachedCount,
                    executionTime: performance.now() - startTime
                };
            }
        }
        
        // 2. バッチ処理 - 複数のファビコンを効率的に生成
        let result;
        if (this.PERFORMANCE_CONFIG.batchProcessing) {
            result = await this._generateBatch(config);
        } else {
            result = await this._generateSequential(config);
        }
        
        // 3. メモリクリーンアップ
        if (this.PERFORMANCE_CONFIG.memoryCleanupEnabled) {
            await this._cleanupResources();
        }
        
        const executionTime = performance.now() - startTime;
        console.log(`FaviconGenerator: Optimized generation completed in ${executionTime.toFixed(2)}ms`);
        
        return {
            ...result,
            executionTime,
            optimizationsApplied: true
        };
    }
    
    /**
     * 生成が必要かチェック（Lazy loading用）
     * @private
     */
    static async _checkIfGenerationNeeded(config) {
        try {
            // キャッシュの確認
            const cached = this._getCachedFavicons();
            if (cached && cached.data) {
                const cachedSizes = Object.keys(cached.data);
                const requestedSizes = config.sizes.map(s => s.toString());
                const allCached = requestedSizes.every(size => cachedSizes.includes(size));
                
                // キャッシュの有効性確認
                const cacheAge = Date.now() - (cached.timestamp || 0);
                const cacheExpiry = config.cacheExpiry || (24 * 60 * 60 * 1000); // 24時間
                
                if (allCached && cacheAge < cacheExpiry) {
                    return {
                        required: false,
                        cachedCount: cachedSizes.length
                    };
                }
            }
            
            // DOM内の既存ファビコンの確認
            if (typeof document !== 'undefined') {
                const existingLinks = document.querySelectorAll('link[rel*="icon"]');
                if (existingLinks.length >= config.sizes.length) {
                    return {
                        required: false,
                        cachedCount: existingLinks.length
                    };
                }
            }
            
            return { required: true, cachedCount: 0 };
            
        } catch (error) {
            console.warn('FaviconGenerator: Generation necessity check failed', error);
            return { required: true, cachedCount: 0 };
        }
    }
    
    /**
     * バッチ処理でファビコンを生成
     * @private
     */
    static async _generateBatch(config) {
        const sizes = config.sizes;
        const maxConcurrent = this.PERFORMANCE_CONFIG.maxConcurrentGeneration;
        
        console.log(`FaviconGenerator: Batch processing ${sizes.length} sizes (max concurrent: ${maxConcurrent})`);
        
        let generated = 0;
        let cached = 0;
        const errors = [];
        
        // サイズをバッチに分割
        for (let i = 0; i < sizes.length; i += maxConcurrent) {
            const batch = sizes.slice(i, i + maxConcurrent);
            
            // 並列処理
            const batchPromises = batch.map(async (size) => {
                try {
                    const result = await this._generateSingleFavicon(size, config);
                    if (result.fromCache) {
                        cached++;
                    } else {
                        generated++;
                    }
                    return result;
                } catch (error) {
                    errors.push({ size, error: error.message });
                    return null;
                }
            });
            
            await Promise.all(batchPromises);
            
            // バッチ間の短い休憩（ブラウザへの負荷軽減）
            if (i + maxConcurrent < sizes.length) {
                await this._sleep(this.PERFORMANCE_CONFIG.debounceDelay);
            }
        }
        
        return {
            success: true,
            generated,
            cached,
            errors,
            batchProcessed: true
        };
    }
    
    /**
     * 順次処理でファビコンを生成
     * @private
     */
    static async _generateSequential(config) {
        console.log('FaviconGenerator: Sequential processing');
        
        let generated = 0;
        let cached = 0;
        const errors = [];
        
        for (const size of config.sizes) {
            try {
                const result = await this._generateSingleFavicon(size, config);
                if (result.fromCache) {
                    cached++;
                } else {
                    generated++;
                }
            } catch (error) {
                errors.push({ size, error: error.message });
            }
        }
        
        return {
            success: true,
            generated,
            cached,
            errors
        };
    }
    
    /**
     * 単一ファビコンの生成（最適化版）
     * @private
     */
    static async _generateSingleFavicon(size, config) {
        // キャッシュから確認
        const cached = this._getCachedFavicon(size);
        if (cached && config.cacheEnabled) {
            return { success: true, size, fromCache: true, dataUrl: cached };
        }
        
        // Canvas要素をプールから取得または作成
        const canvas = this._getCanvasFromPool(size);
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error(`Canvas context creation failed for size ${size}`);
        }
        
        try {
            // 高効率な描画処理
            await this._drawOptimizedFavicon(context, size, config);
            
            // データURL生成
            const dataUrl = canvas.toDataURL('image/png', 0.8); // 軽微な圧縮
            
            // キャッシュに保存
            if (config.cacheEnabled) {
                this._setCachedFavicon(size, dataUrl);
            }
            
            // DOM注入
            if (config.injectIntoDOM !== false) {
                this._injectFaviconToDOM(size, dataUrl);
            }
            
            return {
                success: true,
                size,
                fromCache: false,
                dataUrl
            };
            
        } finally {
            // Canvas要素をプールに戻す
            this._returnCanvasToPool(canvas);
        }
    }
    
    /**
     * 最適化された描画処理
     * @private
     */
    static async _drawOptimizedFavicon(context, size, config) {
        const canvas = context.canvas;
        
        // キャンバスをクリア（効率的な方法）
        canvas.width = canvas.width; // これが最も高速
        
        // 高解像度対応
        const devicePixelRatio = window.devicePixelRatio || 1;
        if (devicePixelRatio > 1 && size <= 48) { // 小さいサイズのみ高解像度対応
            const scaledSize = size * devicePixelRatio;
            canvas.width = scaledSize;
            canvas.height = scaledSize;
            context.scale(devicePixelRatio, devicePixelRatio);
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
        }
        
        // 効率的なバブルデザイン描画
        await this._drawBubbleDesign(context, size, config);
    }
    
    /**
     * バブルデザイン描画（最適化版）
     * @private
     */
    static async _drawBubbleDesign(context, size, config) {
        const center = size / 2;
        const bubbleRadius = size * 0.4;
        
        // グラデーション作成（キャッシュ可能）
        const gradient = this._createCachedGradient(context, center, bubbleRadius, config);
        
        // メインバブル描画
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(center, center, bubbleRadius, 0, Math.PI * 2);
        context.fill();
        
        // ハイライト効果（小さいサイズでは省略）
        if (size >= 32) {
            this._drawHighlight(context, center, bubbleRadius * 0.6);
        }
        
        // 装飾的な小さなバブル（大きいサイズのみ）
        if (size >= 48) {
            this._drawDecoratinBubbles(context, center, bubbleRadius);
        }
    }
    
    /**
     * キャッシュ可能なグラデーション作成
     * @private
     */
    static _createCachedGradient(context, centerX, centerY, radius, config) {
        const gradient = context.createRadialGradient(
            centerX * 0.7, centerY * 0.7, 0,
            centerX, centerY, radius
        );
        
        gradient.addColorStop(0, '#E3F2FD');
        gradient.addColorStop(0.3, '#BBDEFB');
        gradient.addColorStop(0.7, config.backgroundColor || '#2196F3');
        gradient.addColorStop(1, '#1565C0');
        
        return gradient;
    }
    
    /**
     * Canvas要素プールから取得
     * @private
     */
    static _getCanvasFromPool(size) {
        let canvas = this._resourcePool.canvasElements.pop();
        
        if (!canvas || canvas.width !== size || canvas.height !== size) {
            canvas = document.createElement('canvas');
        }
        
        canvas.width = size;
        canvas.height = size;
        
        return canvas;
    }
    
    /**
     * Canvas要素をプールに戻す
     * @private
     */
    static _returnCanvasToPool(canvas) {
        // プールサイズ制限
        if (this._resourcePool.canvasElements.length < 5) {
            // コンテキストをクリア
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            this._resourcePool.canvasElements.push(canvas);
        }
    }
    
    /**
     * リソースクリーンアップ
     * @private
     */
    static async _cleanupResources() {
        try {
            // Canvas要素プールをクリア
            this._resourcePool.canvasElements.forEach(canvas => {
                const context = canvas.getContext('2d');
                if (context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }
            });
            this._resourcePool.canvasElements = [];
            
            // ガベージコレクションの促進（可能であれば）
            if (window.gc) {
                window.gc();
            }
            
            console.log('FaviconGenerator: Resource cleanup completed');
        } catch (error) {
            console.warn('FaviconGenerator: Resource cleanup failed', error);
        }
    }
    
    /**
     * スリープ処理（非同期）
     * @private
     */
    static _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 圧縮されたキャッシュデータの処理
     * @private
     */
    static _getCachedFavicons() {
        try {
            if (!localStorage) return null;
            
            const compressed = localStorage.getItem(this.CACHE_PREFIX + 'compressed');
            if (compressed) {
                // 簡単な圧縮解除（Base64デコード）
                return JSON.parse(atob(compressed));
            }
            
            // 非圧縮キャッシュをフォールバック
            return JSON.parse(localStorage.getItem(this.CACHE_PREFIX + 'data') || 'null');
            
        } catch (error) {
            console.warn('FaviconGenerator: Cache retrieval failed', error);
            return null;
        }
    }
    
    /**
     * 圧縮キャッシュの保存
     * @private
     */
    static _setCachedFavicons(data) {
        try {
            if (!localStorage) return;
            
            if (this.PERFORMANCE_CONFIG.cacheCompressionEnabled) {
                // 簡単な圧縮（Base64エンコード）
                const compressed = btoa(JSON.stringify(data));
                localStorage.setItem(this.CACHE_PREFIX + 'compressed', compressed);
            } else {
                localStorage.setItem(this.CACHE_PREFIX + 'data', JSON.stringify(data));
            }
            
        } catch (error) {
            console.warn('FaviconGenerator: Cache storage failed', error);
        }
    }
    
    /**
     * 従来の生成方法（後方互換性）
     * @private
     */
    static async _generateLegacy(config, startTime) {
        try {
            // Canvas API サポートチェック
            if (!this._supportsCanvas()) {
                console.warn('FaviconGenerator: Canvas API not supported');
                return {
                    success: false,
                    error: 'Canvas API not supported',
                    generated: 0,
                    cached: 0,
                    executionTime: performance.now() - startTime
                };
            }

            let generated = 0;
            const errors = [];

            // 各サイズのPNGファビコンを生成
            for (const size of config.sizes) {
                try {
                    await this._generatePNGFavicon(size, config);
                    generated++;
                } catch (error) {
                    errors.push({ size, error: error.message });
                }
            }

            // favicon.ico を生成
            try {
                await this._generateICOFavicon(config);
            } catch (error) {
                errors.push({ task: 'ICO generation', error: error.message });
            }
            
            console.log('FaviconGenerator: Legacy favicon generation completed');
            
            return {
                success: true,
                generated,
                cached: 0,
                errors,
                executionTime: performance.now() - startTime,
                legacyMode: true
            };
            
        } catch (error) {
            console.error('FaviconGenerator: Legacy generation failed', error);
            return {
                success: false,
                error: error.message,
                generated: 0,
                cached: 0,
                executionTime: performance.now() - startTime
            };
        }
    }

    /**
     * 指定サイズのPNGファビコンを生成
     * @param {number} size - ファビコンサイズ
     * @param {Object} config - 設定オプション
     * @returns {Promise<Blob>}
     */
    static async createPNGFavicon(size, config = {}) {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        
        try {
            // キャッシュをチェック
            if (mergedConfig.cacheEnabled) {
                const cached = await this._getCachedFavicon(size);
                if (cached) {
                    return cached;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // 背景を描画
            ctx.fillStyle = mergedConfig.backgroundColor;
            ctx.fillRect(0, 0, size, size);

            // 角を丸くする（オプション）
            this._drawRoundedRect(ctx, 0, 0, size, size, size * 0.1);

            // テキストを描画
            this._drawText(ctx, mergedConfig.text, size, mergedConfig.textColor, mergedConfig.fontFamily);

            // Blobに変換
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    // キャッシュに保存
                    if (mergedConfig.cacheEnabled) {
                        this._cacheFavicon(size, blob);
                    }
                    resolve(blob);
                }, 'image/png');
            });

        } catch (error) {
            console.error(`FaviconGenerator: Failed to create PNG favicon (${size}px)`, error);
            throw error;
        }
    }

    /**
     * ICOファイル形式のファビコンを生成
     * @param {number[]} sizes - ICOに含めるサイズ配列
     * @param {Object} config - 設定オプション
     * @returns {Promise<Blob>}
     */
    static async createFaviconICO(sizes = [16, 32, 48], config = {}) {
        try {
            console.log(`FaviconGenerator: Creating ICO favicon with sizes: ${sizes.join(', ')}`);
            
            // 各サイズのPNGデータを生成
            const pngBlobs = [];
            for (const size of sizes) {
                const blob = await this.createPNGFavicon(size, config);
                pngBlobs.push({
                    size,
                    data: await blob.arrayBuffer()
                });
            }

            // ICOファイルのバイナリデータを生成
            const icoData = this._createICOFile(pngBlobs);
            
            return new Blob([icoData], { type: 'image/x-icon' });
            
        } catch (error) {
            console.error('FaviconGenerator: Failed to create ICO favicon', error);
            throw error;
        }
    }

    /**
     * 不足しているファビコンファイルをチェック
     * @returns {string[]} 不足しているファビコンファイルのリスト
     */
    static checkMissingFavicons() {
        const requiredFavicons = [
            '/favicon.ico',
            '/favicon-16x16.png', 
            '/favicon-32x32.png',
            '/icon-192x192.png',
            '/icon-512x512.png'
        ];

        const missingFavicons = [];
        
        requiredFavicons.forEach(faviconPath => {
            if (!this._faviconExists(faviconPath)) {
                missingFavicons.push(faviconPath);
            }
        });

        return missingFavicons;
    }

    /**
     * 指定サイズのPNGファビコンを生成して適用
     * @param {number} size - サイズ
     * @param {Object} config - 設定
     * @private
     */
    static async _generatePNGFavicon(size, config) {
        try {
            const blob = await this.createPNGFavicon(size, config);
            const url = URL.createObjectURL(blob);
            
            // HTMLにリンクタグを追加
            this._addFaviconLink(size, url);
            
        } catch (error) {
            console.error(`FaviconGenerator: Failed to generate PNG favicon (${size}px)`, error);
        }
    }

    /**
     * ICOファビコンを生成して適用
     * @param {Object} config - 設定
     * @private
     */
    static async _generateICOFavicon(config) {
        try {
            const blob = await this.createFaviconICO([16, 32, 48], config);
            const url = URL.createObjectURL(blob);
            
            // HTMLにリンクタグを追加
            this._addFaviconLink('ico', url);
            
        } catch (error) {
            console.error('FaviconGenerator: Failed to generate ICO favicon', error);
        }
    }

    /**
     * ファビコンリンクタグをHTMLに追加
     * @param {number|string} size - サイズまたは'ico'
     * @param {string} url - Blob URL
     * @private
     */
    static _addFaviconLink(size, url) {
        const link = document.createElement('link');
        
        if (size === 'ico') {
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = url;
        } else {
            link.rel = size >= 192 ? 'apple-touch-icon' : 'icon';
            link.type = 'image/png';
            link.sizes = `${size}x${size}`;
            link.href = url;
        }
        
        document.head.appendChild(link);
        console.log(`FaviconGenerator: Added favicon link for size ${size}`);
    }

    /**
     * ファビコンファイルが存在するかチェック
     * @param {string} path - ファイルパス
     * @returns {boolean}
     * @private
     */
    static _faviconExists(path) {
        // 実際のファイル存在チェックは困難なため、
        // リンクタグの存在で代用
        return !!document.querySelector(`link[href="${path}"]`);
    }

    /**
     * Canvas APIサポートをチェック
     * @returns {boolean}
     * @private
     */
    static _supportsCanvas() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (error) {
            return false;
        }
    }

    /**
     * 角の丸い四角形を描画
     * @param {CanvasRenderingContext2D} ctx - Canvas コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {number} radius - 角の半径
     * @private
     */
    static _drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * テキストを描画
     * @param {CanvasRenderingContext2D} ctx - Canvas コンテキスト
     * @param {string} text - テキスト
     * @param {number} size - キャンバスサイズ
     * @param {string} color - テキスト色
     * @param {string} fontFamily - フォントファミリー
     * @private
     */
    static _drawText(ctx, text, size, color, fontFamily) {
        const fontSize = Math.floor(size * 0.6);
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(text, size / 2, size / 2);
    }

    /**
     * キャッシュからファビコンを取得
     * @param {number} size - サイズ
     * @returns {Promise<Blob|null>}
     * @private
     */
    static async _getCachedFavicon(size) {
        try {
            const cached = localStorage.getItem(`${this.CACHE_PREFIX}${size}`);
            if (cached) {
                const binaryString = atob(cached);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new Blob([bytes], { type: 'image/png' });
            }
        } catch (error) {
            console.warn(`FaviconGenerator: Cache retrieval failed for size ${size}`, error);
        }
        return null;
    }

    /**
     * ファビコンをキャッシュに保存
     * @param {number} size - サイズ
     * @param {Blob} blob - ファビコンBlob
     * @private
     */
    static async _cacheFavicon(size, blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const binaryString = String.fromCharCode(...bytes);
            const base64 = btoa(binaryString);
            
            localStorage.setItem(`${this.CACHE_PREFIX}${size}`, base64);
            localStorage.setItem(`${this.CACHE_PREFIX}${size}_timestamp`, Date.now().toString());
            
        } catch (error) {
            console.warn(`FaviconGenerator: Cache storage failed for size ${size}`, error);
        }
    }

    /**
     * ICOファイルのバイナリデータを生成
     * @param {Array} pngBlobs - PNGデータ配列
     * @returns {ArrayBuffer}
     * @private
     */
    static _createICOFile(pngBlobs) {
        // ICO ファイルヘッダー（6バイト）
        const iconDir = new ArrayBuffer(6);
        const iconDirView = new DataView(iconDir);
        iconDirView.setUint16(0, 0, true);      // Reserved
        iconDirView.setUint16(2, 1, true);      // Type (1 = ICO)
        iconDirView.setUint16(4, pngBlobs.length, true); // Number of images

        // アイコンディレクトリエントリー（16バイト × 画像数）
        const entries = new ArrayBuffer(16 * pngBlobs.length);
        const entriesView = new DataView(entries);
        
        let imageOffset = 6 + (16 * pngBlobs.length); // ヘッダー + エントリー
        
        pngBlobs.forEach((png, index) => {
            const offset = index * 16;
            entriesView.setUint8(offset + 0, png.size);     // Width
            entriesView.setUint8(offset + 1, png.size);     // Height
            entriesView.setUint8(offset + 2, 0);            // Color count
            entriesView.setUint8(offset + 3, 0);            // Reserved
            entriesView.setUint16(offset + 4, 1, true);     // Color planes
            entriesView.setUint16(offset + 6, 32, true);    // Bits per pixel
            entriesView.setUint32(offset + 8, png.data.byteLength, true); // Image size
            entriesView.setUint32(offset + 12, imageOffset, true);        // Image offset
            
            imageOffset += png.data.byteLength;
        });

        // 全体を結合
        const totalSize = 6 + (16 * pngBlobs.length) + pngBlobs.reduce((sum, png) => sum + png.data.byteLength, 0);
        const icoFile = new Uint8Array(totalSize);
        
        let pos = 0;
        icoFile.set(new Uint8Array(iconDir), pos);
        pos += iconDir.byteLength;
        
        icoFile.set(new Uint8Array(entries), pos);
        pos += entries.byteLength;
        
        pngBlobs.forEach(png => {
            icoFile.set(new Uint8Array(png.data), pos);
            pos += png.data.byteLength;
        });

        return icoFile.buffer;
    }

    /**
     * キャッシュをクリア
     */
    static clearCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('FaviconGenerator: Cache cleared');
        } catch (error) {
            console.error('FaviconGenerator: Failed to clear cache', error);
        }
    }

    /**
     * デバッグ情報を取得
     * @returns {Object}
     */
    static getDebugInfo() {
        return {
            canvasSupport: this._supportsCanvas(),
            missingFavicons: this.checkMissingFavicons(),
            cacheKeys: Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX)),
            config: this.DEFAULT_CONFIG
        };
    }
}

export default FaviconGenerator;