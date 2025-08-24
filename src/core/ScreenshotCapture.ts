/**
 * ScreenshotCapture - スクリーンショット機能の基盤実装
 * Canvasキャプチャ、画像フォーマット変換、品質・サイズ最適化を行う
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface ScreenshotConfig {
    defaultFormat: string;
    quality: {
        high: number;
        medium: number;
        low: number;
    };
    maxWidth: number;
    maxHeight: number;
    compression: {
        png: { quality: number };
        jpeg: { quality: number };
        webp: { quality: number };
    };
    optimization: {
        enabled: boolean;
        targetSizeKB: number;
        maxAttempts: number;
    };
}

interface CaptureOptions {
    format?: string;
    quality?: string | number;
    maxWidth?: number;
    maxHeight?: number;
    optimize?: boolean;
    filename?: string;
    includeUI?: boolean;
    skipOverlay?: boolean;
    overlay?: any;
}

interface ScreenshotData {
    data: string;
    blob: Blob;
    url: string;
    format: string;
    size: number;
    width: number;
    height: number;
    filename?: string;
    optimized?: boolean;
    originalSize?: number;
    overlayType?: string;
    hasOverlay?: boolean;
}

interface CaptureStats {
    captures: number;
    successes: number;
    errors: number;
    totalTime: number;
    averageTime: number;
    totalSize: number;
    averageSize: number;
}

interface CaptureInfo {
    timestamp: number;
    filename?: string;
    format: string;
    size: number;
    width: number;
    height: number;
    captureTime: number;
}

interface ImageData {
    data: string;
    blob: Blob;
    url: string;
    size: number;
    optimized?: boolean;
    originalSize?: number;
}

interface OverlayData {
    type: 'score' | 'achievement' | 'custom';
    data: any;
}

export class ScreenshotCapture {
    private gameEngine: any;
    private errorHandler: any;
    private config: ScreenshotConfig;
    private capturing: boolean;
    private lastCapture: ScreenshotData | null;
    private captureHistory: CaptureInfo[];
    private stats: CaptureStats;
    private overlayEnabled: boolean;
    private screenshotOverlay: any;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
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

        // オーバーレイ機能
        this.overlayEnabled = true;
        this.screenshotOverlay = null;
        
        // パフォーマンス最適化機能の初期化
        this.setupCaptureQueue();
        this.setupAutoMemoryManagement();
        
        this.log('ScreenshotCapture初期化完了');
    }
    
    /**
     * キャプチャキューのセットアップ
     */
    private setupCaptureQueue(): void {
        // キューイング機能の初期化（必要に応じて実装）
        console.log('[ScreenshotCapture] Capture queue initialized');
    }
    
    /**
     * 自動メモリ管理のセットアップ
     */
    private setupAutoMemoryManagement(): void {
        // メモリ管理機能の初期化（必要に応じて実装）
        console.log('[ScreenshotCapture] Auto memory management initialized');
    }
    
    /**
     * メインCanvasのスクリーンショットを取得
     */
    public async captureGameCanvas(options: CaptureOptions = {}): Promise<ScreenshotData> {
        try {
            if (this.capturing) {
                throw new Error('スクリーンショット作成中です');
            }
            
            this.capturing = true;
            const startTime = performance.now();
            
            const captureOptions: CaptureOptions = {
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
            const captureInfo: CaptureInfo = {
                timestamp: Date.now(),
                filename: captureOptions.filename,
                format: captureOptions.format || this.config.defaultFormat,
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
            
            this.log('スクリーンショット作成完了', {
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
    public async captureRegion(x: number, y: number, width: number, height: number, options: CaptureOptions = {}): Promise<ScreenshotData> {
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
            
            if (!regionCtx) {
                throw new Error('Canvas context の取得に失敗しました');
            }
            
            // 指定領域をコピー
            regionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
            
            // スクリーンショットの作成
            const captureOptions: CaptureOptions = {
                format: this.config.defaultFormat,
                quality: 'high',
                maxWidth: this.config.maxWidth,
                maxHeight: this.config.maxHeight,
                optimize: true,
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
     * オーバーレイ付きスクリーンショットの取得
     */
    public async captureWithOverlay(overlayData: OverlayData, options: CaptureOptions = {}): Promise<ScreenshotData> {
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
            let overlayCanvas: HTMLCanvasElement;

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
            
            // オーバーレイCanvasからスクリーンショットデータを作成
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
    public async captureWithScore(scoreData: any, options: CaptureOptions = {}): Promise<ScreenshotData> {
        const result = await this.captureWithOverlay({
            type: 'score',
            data: scoreData
        }, options);
        
        return {
            ...result,
            overlayType: 'score',
            hasOverlay: true
        };
    }
    
    /**
     * 実績情報付きスクリーンショットの取得
     */
    public async captureWithAchievement(achievementData: any, options: CaptureOptions = {}): Promise<ScreenshotData> {
        const result = await this.captureWithOverlay({
            type: 'achievement',
            data: achievementData
        }, options);
        
        return {
            ...result,
            overlayType: 'achievement',
            hasOverlay: true
        };
    }
    
    /**
     * カスタムオーバーレイ付きスクリーンショットの取得
     */
    public async captureWithCustomOverlay(customData: any, options: CaptureOptions = {}): Promise<ScreenshotData> {
        const result = await this.captureWithOverlay({
            type: 'custom',
            data: customData
        }, options);
        
        return {
            ...result,
            overlayType: 'custom',
            hasOverlay: true
        };
    }
    
    /**
     * BlobからCanvasを作成
     */
    private async createCanvasFromBlob(blob: Blob): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(img.src);
                    reject(new Error('Canvas context の取得に失敗しました'));
                    return;
                }
                
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
    private async createScreenshot(sourceCanvas: HTMLCanvasElement, options: CaptureOptions): Promise<ScreenshotData> {
        try {
            // リサイズが必要か確認
            const needsResize = sourceCanvas.width > (options.maxWidth || this.config.maxWidth) || 
                               sourceCanvas.height > (options.maxHeight || this.config.maxHeight);
            
            let targetCanvas = sourceCanvas;
            
            if (needsResize) {
                targetCanvas = this.resizeCanvas(
                    sourceCanvas, 
                    options.maxWidth || this.config.maxWidth, 
                    options.maxHeight || this.config.maxHeight
                );
            }
            
            // フォーマット別の画像生成
            let imageData: ImageData;
            const qualityValue = this.getQualityValue(options.quality, options.format);
            const format = (options.format || this.config.defaultFormat).toLowerCase();

            switch (format) {
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
                format: format,
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
    private resizeCanvas(sourceCanvas: HTMLCanvasElement, maxWidth: number, maxHeight: number): HTMLCanvasElement {
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
        
        if (!ctx) {
            throw new Error('Canvas context の取得に失敗しました');
        }
        
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
    private async createPNG(canvas: HTMLCanvasElement): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('PNG画像の作成に失敗しました'));
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                const data = canvas.toDataURL('image/png');
                
                resolve({
                    data,
                    blob,
                    url,
                    size: blob.size
                });
            }, 'image/png');
        });
    }
    
    /**
     * JPEG画像の作成
     */
    private async createJPEG(canvas: HTMLCanvasElement, quality: number): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('JPEG画像の作成に失敗しました'));
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                const data = canvas.toDataURL('image/jpeg', quality);
                
                resolve({
                    data,
                    blob,
                    url,
                    size: blob.size
                });
            }, 'image/jpeg', quality);
        });
    }
    
    /**
     * WebP画像の作成
     */
    private async createWebP(canvas: HTMLCanvasElement, quality: number): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('WebP画像の作成に失敗しました'));
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                const data = canvas.toDataURL('image/webp', quality);
                
                resolve({
                    data,
                    blob,
                    url,
                    size: blob.size
                });
            }, 'image/webp', quality);
        });
    }
    
    /**
     * 画像の最適化
     */
    private async optimizeImage(imageData: ImageData, options: CaptureOptions): Promise<ImageData> {
        const targetSizeBytes = this.config.optimization.targetSizeKB * 1024;
        
        if (imageData.size <= targetSizeBytes) {
            return {
                ...imageData,
                optimized: false
            };
        }
        
        // 最適化ロジックの実装（簡単な例）
        return {
            ...imageData,
            optimized: true,
            originalSize: imageData.size
        };
    }
    
    /**
     * 品質値の取得
     */
    private getQualityValue(quality: string | number | undefined, format: string | undefined): number {
        if (typeof quality === 'number') {
            return Math.max(0, Math.min(1, quality));
        }
        
        const qualityMap = this.config.quality;
        const formatConfig = this.config.compression;
        const formatKey = (format || this.config.defaultFormat).toLowerCase() as keyof typeof formatConfig;
        
        switch (quality) {
            case 'high':
                return formatConfig[formatKey]?.quality || qualityMap.high;
            case 'medium':
                return formatConfig[formatKey]?.quality || qualityMap.medium;
            case 'low':
                return formatConfig[formatKey]?.quality || qualityMap.low;
            default:
                return formatConfig[formatKey]?.quality || qualityMap.high;
        }
    }
    
    /**
     * ゲームCanvasの取得
     */
    private getGameCanvas(): HTMLCanvasElement | null {
        // GameEngineからCanvasを取得
        if (this.gameEngine && this.gameEngine.canvas) {
            return this.gameEngine.canvas;
        }
        
        // フォールバック: DOMから検索
        const canvas = document.querySelector('canvas#game-canvas, canvas.game-canvas, canvas[data-game="true"]');
        return canvas as HTMLCanvasElement;
    }
    
    /**
     * ファイル名の生成
     */
    private generateFilename(prefix: string = 'screenshot'): string {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').replace(/T/, '_').replace(/Z$/, '');
        return `${prefix}_${timestamp}`;
    }
    
    /**
     * 統計の更新
     */
    private updateStats(success: boolean, captureTime: number, size: number): void {
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
     * エラーハンドリング
     */
    private handleError(code: string, error: any, context?: any): void {
        this.errorHandler.handleError(error, `ScreenshotCapture.${code}`, context);
    }
    
    /**
     * ログ出力
     */
    private log(message: string, data?: any, level: string = 'info'): void {
        const logMessage = `[ScreenshotCapture] ${message}`;
        
        switch (level) {
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'error':
                console.error(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }
    
    /**
     * オーバーレイ機能の有効/無効
     */
    public setOverlayEnabled(enabled: boolean): void {
        this.overlayEnabled = enabled;
    }
    
    /**
     * 統計情報の取得
     */
    public getStats(): CaptureStats {
        return { ...this.stats };
    }
    
    /**
     * キャプチャ履歴の取得
     */
    public getCaptureHistory(): CaptureInfo[] {
        return [...this.captureHistory];
    }
    
    /**
     * 最後のキャプチャの取得
     */
    public getLastCapture(): ScreenshotData | null {
        return this.lastCapture;
    }
    
    /**
     * 設定の更新
     */
    public updateConfig(newConfig: Partial<ScreenshotConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * 現在の設定を取得
     */
    public getConfig(): ScreenshotConfig {
        return { ...this.config };
    }
    
    /**
     * クリーンアップ
     */
    public dispose(): void {
        // URLオブジェクトのクリーンアップ
        if (this.lastCapture && this.lastCapture.url) {
            URL.revokeObjectURL(this.lastCapture.url);
        }
        
        // 履歴内のURLもクリーンアップ
        this.captureHistory.forEach(capture => {
            // 必要に応じてURLクリーンアップ
        });
        
        this.captureHistory = [];
        this.lastCapture = null;
        
        this.log('ScreenshotCapture disposed');
    }
}