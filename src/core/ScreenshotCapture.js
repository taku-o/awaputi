/**
 * スクリーンショット機能の基盤実装 (Task 5)
 * Canvasキャプチャ、画像フォーマット変換、品質・サイズ最適化を行う
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

export class ScreenshotCapture {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 設定
        this.config = {
            defaultFormat: 'png',
            quality: {
                high: 0.92,
                medium: 0.8,
                low: 0.6
            },
            maxWidth: 1200,
            maxHeight: 630,
            compression: {
                png: { quality: 1.0 },
                jpeg: { quality: 0.8 },
                webp: { quality: 0.8 }
            },
            optimization: {
                enabled: true,
                targetSizeKB: 500, // 500KB以下に最適化
                maxAttempts: 3
            }
        };
        
        // キャプチャ状態
        this.capturing = false;
        this.lastCapture = null;
        this.captureHistory = [];
        
        // パフォーマンス統計
        this.stats = {
            captures: 0,
            successes: 0,
            errors: 0,
            totalTime: 0,
            averageTime: 0,
            totalSize: 0,
            averageSize: 0
        };
        
        // オーバーレイ機能 (Task 6)
        this.overlayEnabled = true;
        this.screenshotOverlay = null;
        
        this.log('ScreenshotCapture初期化完了');
    }
    
    /**
     * メインCanvasのスクリーンショットを取得
     */
    async captureGameCanvas(options = {}) {
        try {
            if (this.capturing) {
                throw new Error('スクリーンショット作成中です');
            }
            
            this.capturing = true;
            const startTime = performance.now();
            
            // オプションの処理
            const captureOptions = {
                format: options.format || this.config.defaultFormat,
                quality: options.quality || 'high',
                maxWidth: options.maxWidth || this.config.maxWidth,
                maxHeight: options.maxHeight || this.config.maxHeight,
                optimize: options.optimize !== false,
                filename: options.filename || this.generateFilename(),
                includeUI: options.includeUI !== false
            };
            
            // ゲームCanvasの取得
            const canvas = this.getGameCanvas();
            if (!canvas) {
                throw new Error('ゲームCanvasが見つかりません');
            }
            
            // スクリーンショットの作成
            const screenshotData = await this.createScreenshot(canvas, captureOptions);
            
            // 統計の更新
            const captureTime = performance.now() - startTime;
            this.updateStats(true, captureTime, screenshotData.size);
            
            // キャプチャ履歴に追加
            const captureInfo = {
                timestamp: Date.now(),
                filename: captureOptions.filename,
                format: captureOptions.format,
                size: screenshotData.size,
                width: screenshotData.width,
                height: screenshotData.height,
                captureTime
            };
            
            this.captureHistory.unshift(captureInfo);
            if (this.captureHistory.length > 10) {
                this.captureHistory = this.captureHistory.slice(0, 10);
            }
            
            this.lastCapture = screenshotData;
            
            this.log(`スクリーンショット作成完了`, {
                format: captureOptions.format,
                size: `${Math.round(screenshotData.size / 1024)}KB`,
                dimensions: `${screenshotData.width}x${screenshotData.height}`,
                time: `${Math.round(captureTime)}ms`
            });
            
            return screenshotData;
            
        } catch (error) {
            this.updateStats(false, 0, 0);
            this.handleError('SCREENSHOT_CAPTURE_FAILED', error, options);
            throw error;
        } finally {
            this.capturing = false;
        }
    }
    
    /**
     * カスタム領域のスクリーンショットを取得
     */
    async captureRegion(x, y, width, height, options = {}) {
        try {
            const canvas = this.getGameCanvas();
            if (!canvas) {
                throw new Error('ゲームCanvasが見つかりません');
            }
            
            // 領域の検証
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            x = Math.max(0, Math.min(x, canvasWidth));
            y = Math.max(0, Math.min(y, canvasHeight));
            width = Math.min(width, canvasWidth - x);
            height = Math.min(height, canvasHeight - y);
            
            if (width <= 0 || height <= 0) {
                throw new Error('不正な領域指定です');
            }
            
            // 一時的なCanvasを作成
            const regionCanvas = document.createElement('canvas');
            regionCanvas.width = width;
            regionCanvas.height = height;
            const regionCtx = regionCanvas.getContext('2d');
            
            // 指定領域をコピー
            regionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
            
            // スクリーンショットの作成
            const captureOptions = {
                ...options,
                filename: options.filename || this.generateFilename('region')
            };
            
            return await this.createScreenshot(regionCanvas, captureOptions);
            
        } catch (error) {
            this.handleError('REGION_CAPTURE_FAILED', error, { x, y, width, height, options });
            throw error;
        }
    }

    
    /**
     * オーバーレイ付きスクリーンショットの取得 (Task 6)
     */
    async captureWithOverlay(overlayData, options = {}) {
        try {
            if (!this.overlayEnabled) {
                return await this.captureGameCanvas(options);
            }
            
            // ScreenshotOverlayの初期化
            if (!this.screenshotOverlay) {
                const { ScreenshotOverlay } = await import('./ScreenshotOverlay.js');
                this.screenshotOverlay = new ScreenshotOverlay(this.gameEngine);
            }
            
            // 基本スクリーンショットの取得
            const baseScreenshot = await this.captureGameCanvas({
                ...options,
                skipOverlay: true // オーバーレイなしで基本画像を取得
            });
            
            // 基本画像からCanvasを作成
            const baseCanvas = await this.createCanvasFromBlob(baseScreenshot.blob);
            
            // オーバーレイの適用
            let overlayCanvas;
            
            switch (overlayData.type) {
                case 'score':
                    overlayCanvas = await this.screenshotOverlay.createScoreOverlay(baseCanvas, overlayData.data, options.overlay);
                    break;
                case 'achievement':
                    overlayCanvas = await this.screenshotOverlay.createAchievementOverlay(baseCanvas, overlayData.data, options.overlay);
                    break;
                case 'custom':
                    overlayCanvas = await this.screenshotOverlay.createCustomOverlay(baseCanvas, overlayData.data, options.overlay);
                    break;
                default:
                    throw new Error(`未対応のオーバーレイタイプ: ${overlayData.type}`);
            }
            
            // オーバーレイCanvas からスクリーンショットデータを作成
            const overlayScreenshot = await this.createScreenshot(overlayCanvas, {
                ...options,
                filename: options.filename || this.generateFilename(`${overlayData.type}-overlay`)
            });
            
            // クリーンアップ
            baseCanvas.remove();
            if (overlayCanvas !== baseCanvas) {
                overlayCanvas.remove();
            }
            
            return {
                ...overlayScreenshot,
                overlayType: overlayData.type,
                hasOverlay: true
            };
            
        } catch (error) {
            this.handleError('OVERLAY_CAPTURE_FAILED', error, { overlayData, options });
            
            // フォールバック: オーバーレイなしでの取得
            this.log('オーバーレイなしでの取得にフォールバック', null, 'warn');
            return await this.captureGameCanvas(options);
        }
    }
    
    /**
     * スコア情報付きスクリーンショットの取得
     */
    async captureWithScore(scoreData, options = {}) {
        return await this.captureWithOverlay({
            type: 'score',
            data: scoreData
        }, options);
    }
    
    /**
     * 実績情報付きスクリーンショットの取得
     */
    async captureWithAchievement(achievementData, options = {}) {
        return await this.captureWithOverlay({
            type: 'achievement',
            data: achievementData
        }, options);
    }
    
    /**
     * カスタムオーバーレイ付きスクリーンショットの取得
     */
    async captureWithCustomOverlay(customData, options = {}) {
        return await this.captureWithOverlay({
            type: 'custom',
            data: customData
        }, options);
    }
    
    /**
     * BlobからCanvasを作成
     */
    async createCanvasFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                URL.revokeObjectURL(img.src);
                resolve(canvas);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error('画像の読み込みに失敗しました'));
            };
            
            img.src = URL.createObjectURL(blob);
        });
    }
    
    /**
     * スクリーンショットの作成
     */
    async createScreenshot(sourceCanvas, options) {
        try {
            // リサイズが必要か確認
            const needsResize = sourceCanvas.width > options.maxWidth || 
                               sourceCanvas.height > options.maxHeight;
            
            let targetCanvas = sourceCanvas;
            
            if (needsResize) {
                targetCanvas = this.resizeCanvas(sourceCanvas, options.maxWidth, options.maxHeight);
            }
            
            // フォーマット別の画像生成
            let imageData;
            const qualityValue = this.getQualityValue(options.quality, options.format);
            
            switch (options.format.toLowerCase()) {
                case 'jpeg':
                case 'jpg':
                    imageData = await this.createJPEG(targetCanvas, qualityValue);
                    break;
                case 'webp':
                    imageData = await this.createWebP(targetCanvas, qualityValue);
                    break;
                case 'png':
                default:
                    imageData = await this.createPNG(targetCanvas);
                    break;
            }
            
            // 最適化が有効な場合
            if (options.optimize && this.config.optimization.enabled) {
                imageData = await this.optimizeImage(imageData, options);
            }
            
            // 一時Canvasのクリーンアップ
            if (targetCanvas !== sourceCanvas) {
                targetCanvas.remove();
            }
            
            return {
                data: imageData.data,
                blob: imageData.blob,
                url: imageData.url,
                format: options.format,
                size: imageData.size,
                width: targetCanvas.width,
                height: targetCanvas.height,
                filename: options.filename,
                optimized: options.optimize && imageData.optimized,
                originalSize: imageData.originalSize || imageData.size
            };
            
        } catch (error) {
            this.handleError('SCREENSHOT_CREATION_FAILED', error, options);
            throw error;
        }
    }
    
    /**
     * Canvasのリサイズ
     */
    resizeCanvas(sourceCanvas, maxWidth, maxHeight) {
        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;
        
        // アスペクト比を維持してリサイズ
        const aspectRatio = sourceWidth / sourceHeight;
        let newWidth = sourceWidth;
        let newHeight = sourceHeight;
        
        if (sourceWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        }
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        // リサイズ用Canvasを作成
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = Math.round(newWidth);
        resizedCanvas.height = Math.round(newHeight);
        const ctx = resizedCanvas.getContext('2d');
        
        // 高品質なリサイズのための設定
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // リサイズ実行
        ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);
        
        return resizedCanvas;
    }
    
    /**
     * PNG画像の作成
     */
    async createPNG(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('PNG画像の作成に失敗しました'));
                    return;
                }
                
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const url = URL.createObjectURL(blob);
                    
                    resolve({
                        data: arrayBuffer,
                        blob: blob,
                        url: url,
                        size: blob.size,
                        optimized: false
                    });
                } catch (error) {
                    reject(error);
                }
            }, 'image/png');
        });
    }
    
    /**
     * JPEG画像の作成
     */
    async createJPEG(canvas, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('JPEG画像の作成に失敗しました'));
                    return;
                }
                
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const url = URL.createObjectURL(blob);
                    
                    resolve({
                        data: arrayBuffer,
                        blob: blob,
                        url: url,
                        size: blob.size,
                        optimized: false
                    });
                } catch (error) {
                    reject(error);
                }
            }, 'image/jpeg', quality);
        });
    }
    
    /**
     * WebP画像の作成
     */
    async createWebP(canvas, quality) {
        return new Promise((resolve, reject) => {
            // WebPサポートチェック
            if (!this.isWebPSupported()) {
                reject(new Error('WebPはサポートされていません'));
                return;
            }
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('WebP画像の作成に失敗しました'));
                    return;
                }
                
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const url = URL.createObjectURL(blob);
                    
                    resolve({
                        data: arrayBuffer,
                        blob: blob,
                        url: url,
                        size: blob.size,
                        optimized: false
                    });
                } catch (error) {
                    reject(error);
                }
            }, 'image/webp', quality);
        });
    }
    
    /**
     * 画像の最適化
     */
    async optimizeImage(imageData, options) {
        try {
            const targetSize = this.config.optimization.targetSizeKB * 1024;
            
            if (imageData.size <= targetSize) {
                return imageData;
            }
            
            const originalSize = imageData.size;
            let optimizedData = imageData;
            let attempts = 0;
            
            while (optimizedData.size > targetSize && attempts < this.config.optimization.maxAttempts) {
                attempts++;
                
                // 品質を段階的に下げて最適化
                const reductionFactor = 0.8 - (attempts * 0.1);
                optimizedData = await this.reduceImageQuality(optimizedData, reductionFactor, options);
                
                this.log(`最適化試行 ${attempts}`, {
                    originalSize: `${Math.round(originalSize / 1024)}KB`,
                    currentSize: `${Math.round(optimizedData.size / 1024)}KB`,
                    targetSize: `${Math.round(targetSize / 1024)}KB`
                });
            }
            
            optimizedData.optimized = true;
            optimizedData.originalSize = originalSize;
            
            return optimizedData;
            
        } catch (error) {
            this.log('画像最適化に失敗、元の画像を返します', error, 'warn');
            return imageData;
        }
    }
    
    /**
     * 画像品質の削減
     */
    async reduceImageQuality(imageData, reductionFactor, options) {
        try {
            // 元の画像からCanvasを作成
            const img = new Image();
            img.src = imageData.url;
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // 品質を下げて再作成
            const newQuality = this.getQualityValue(options.quality, options.format) * reductionFactor;
            
            let newImageData;
            switch (options.format.toLowerCase()) {
                case 'jpeg':
                case 'jpg':
                    newImageData = await this.createJPEG(canvas, newQuality);
                    break;
                case 'webp':
                    newImageData = await this.createWebP(canvas, newQuality);
                    break;
                default:
                    // PNGは品質パラメータがないので、サイズを縮小
                    const scaledCanvas = this.resizeCanvas(canvas, 
                        canvas.width * reductionFactor, 
                        canvas.height * reductionFactor);
                    newImageData = await this.createPNG(scaledCanvas);
                    scaledCanvas.remove();
                    break;
            }
            
            // 古いURLをクリーンアップ
            URL.revokeObjectURL(imageData.url);
            canvas.remove();
            
            return newImageData;
            
        } catch (error) {
            this.handleError('IMAGE_QUALITY_REDUCTION_FAILED', error, { reductionFactor, options });
            return imageData;
        }
    }
    
    /**
     * ファイル名の生成
     */
    generateFilename(prefix = 'screenshot') {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}-${random}`;
    }
    
    /**
     * ゲームCanvasの取得
     */
    getGameCanvas() {
        // GameEngineからCanvasを取得
        if (this.gameEngine && this.gameEngine.canvas) {
            return this.gameEngine.canvas;
        }
        
        // 直接DOMから取得を試行
        const canvas = document.querySelector('canvas#gameCanvas, canvas.game-canvas, canvas');
        if (canvas) {
            return canvas;
        }
        
        return null;
    }
    
    /**
     * 品質値の取得
     */
    getQualityValue(qualityLevel, format) {
        const formatConfig = this.config.compression[format.toLowerCase()];
        if (!formatConfig) {
            return this.config.quality[qualityLevel] || this.config.quality.high;
        }
        
        return formatConfig.quality * (this.config.quality[qualityLevel] || this.config.quality.high);
    }
    
    /**
     * WebPサポートの確認
     */
    isWebPSupported() {
        try {
            const canvas = document.createElement('canvas');
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 統計の更新
     */
    updateStats(success, captureTime, size) {
        this.stats.captures++;
        
        if (success) {
            this.stats.successes++;
            this.stats.totalTime += captureTime;
            this.stats.totalSize += size;
            this.stats.averageTime = this.stats.totalTime / this.stats.successes;
            this.stats.averageSize = this.stats.totalSize / this.stats.successes;
        } else {
            this.stats.errors++;
        }
    }
    
    /**
     * 統計情報の取得
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.captures > 0 ? 
                (this.stats.successes / this.stats.captures) * 100 : 0,
            averageTimeMs: Math.round(this.stats.averageTime),
            averageSizeKB: Math.round(this.stats.averageSize / 1024)
        };
    }
    
    /**
     * キャプチャ履歴の取得
     */
    getCaptureHistory() {
        return [...this.captureHistory];
    }
    
    /**
     * 最後のキャプチャの取得
     */
    getLastCapture() {
        return this.lastCapture;
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('設定を更新しました', newConfig);
    }
    
    /**
     * キャプチャ履歴のクリア
     */
    clearHistory() {
        // URLのクリーンアップ
        this.captureHistory.forEach(capture => {
            if (capture.url) {
                URL.revokeObjectURL(capture.url);
            }
        });
        
        this.captureHistory = [];
        this.log('キャプチャ履歴をクリアしました');
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = {}) {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };
        
        // ErrorHandlerユーティリティの使用
        if (ErrorHandler) {
            ErrorHandler.handleError(error, 'ScreenshotCapture', context);
        }
        
        // ローカルログの記録
        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録
     */
    log(message, data = null, level = 'info') {
        const logEntry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        
        // コンソール出力
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[ScreenshotCapture] ${message}`, data || '');
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // キャプチャ履歴のクリーンアップ
        this.clearHistory();
        
        // 最後のキャプチャのクリーンアップ
        if (this.lastCapture && this.lastCapture.url) {
            URL.revokeObjectURL(this.lastCapture.url);
            this.lastCapture = null;
        }
        
        this.log('ScreenshotCapture クリーンアップ完了');
    }
}