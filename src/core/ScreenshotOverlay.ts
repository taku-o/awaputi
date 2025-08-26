/**
 * スクリーンショットオーバーレイ機能 (Task 6)
 * スコア情報、ゲームロゴ、ウォーターマーク等をスクリーンショットに合成する
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface OverlayConfig {
    layout: {
        scorePosition: string;
        logoPosition: string;
        watermarkPosition: string;
        padding: number;
        cornerRadius: number;
        transparency: number;
    };
    score: {
        enabled: boolean;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        textColor: string;
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        padding: { x: number; y: number };
        shadowColor: string;
        shadowBlur: number;
        shadowOffset: { x: number; y: number };
        position?: string;
    };
    logo: {
        enabled: boolean;
        text: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        textColor: string;
        strokeColor: string;
        strokeWidth: number;
        shadowColor: string;
        shadowBlur: number;
        shadowOffset: { x: number; y: number };
        maxWidth: number;
        position?: string;
    };
    watermark: {
        enabled: boolean;
        text: string;
        fontSize: number;
        fontFamily: string;
        textColor: string;
        backgroundColor: string;
        padding: { x: number; y: number };
        cornerRadius: number;
        position?: string;
    };
    achievement: {
        enabled: boolean;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        textColor: string;
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        padding: { x: number; y: number };
        iconSize: number;
        maxWidth: number;
    };
    stats: {
        enabled: boolean;
        fontSize: number;
        fontFamily: string;
        textColor: string;
        backgroundColor: string;
        padding: { x: number; y: number };
        lineHeight: number;
    };
}

interface ScoreData {
    score?: number;
    combo?: number;
    accuracy?: number;
    stage?: string;
}

interface AchievementData {
    name: string;
    description?: string;
}

interface OverlayData {
    elements?: Array<{
        type: string;
        text?: string;
        position?: any;
        style?: any;
        align?: string;
    }>;
}

interface Position {
    x: number;
    y: number;
}

export class ScreenshotOverlay {
    private gameEngine: any;
    private config: OverlayConfig;
    private cache: {
        fonts: Map<string, any>;
        images: Map<string, any>;
        measurements: Map<string, any>;
    };
    private stats: {
        overlaysCreated: number;
        totalTime: number;
        averageTime: number;
        errors: number;
    };

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        
        // オーバーレイ設定
        this.config = {
            // レイアウト設定
            layout: {
                scorePosition: 'top-right',     // top-left, top-right, bottom-left, bottom-right, center
                logoPosition: 'bottom-left',
                watermarkPosition: 'bottom-right',
                padding: 20,
                cornerRadius: 10,
                transparency: 0.9
            },
            // スコア表示設定
            score: {
                enabled: true,
                fontSize: 24,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                textColor: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: '#FFD700',
                borderWidth: 2,
                padding: { x: 15, y: 10 },
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowBlur: 5,
                shadowOffset: { x: 2, y: 2 }
            },
            
            // ロゴ設定
            logo: {
                enabled: true,
                text: 'BubblePop',
                fontSize: 32,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                textColor: '#FF6B6B',
                strokeColor: '#FFFFFF',
                strokeWidth: 3,
                shadowColor: 'rgba(0, 0, 0, 0.8)',
                shadowBlur: 8,
                shadowOffset: { x: 3, y: 3 },
                maxWidth: 200
            },
            // ウォーターマーク設定
            watermark: {
                enabled: true,
                text: 'play.bubblepop.game',
                fontSize: 14,
                fontFamily: 'Arial, sans-serif',
                textColor: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: { x: 8, y: 5 },
                cornerRadius: 5
            },
            // 実績オーバーレイ設定
            achievement: {
                enabled: true,
                fontSize: 20,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                textColor: '#FFD700',
                backgroundColor: 'rgba(75, 0, 130, 0.8)',
                borderColor: '#FFD700',
                borderWidth: 2,
                padding: { x: 12, y: 8 },
                iconSize: 24,
                maxWidth: 300
            },
            
            // 統計情報設定
            stats: {
                enabled: false,
                fontSize: 16,
                fontFamily: 'Arial, sans-serif',
                textColor: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: { x: 10, y: 8 },
                lineHeight: 1.4
            }
        };
        
        // キャッシュとパフォーマンス
        this.cache = {
            fonts: new Map(),
            images: new Map(),
            measurements: new Map()
        };
        
        // 統計情報
        this.stats = {
            overlaysCreated: 0,
            totalTime: 0,
            averageTime: 0,
            errors: 0
        };
        
        this.log('ScreenshotOverlay初期化完了');
    }
    
    /**
     * スコア情報オーバーレイの作成
     */
    async createScoreOverlay(screenshotCanvas: HTMLCanvasElement, scoreData: ScoreData, options: Partial<OverlayConfig> = {}): Promise<HTMLCanvasElement> {
        try {
            const startTime = performance.now();
            
            // オーバーレイCanvas作成
            const overlayCanvas = this.createOverlayCanvas(screenshotCanvas.width, screenshotCanvas.height);
            const ctx = overlayCanvas.getContext('2d')!;
            
            // ベース画像を描画
            ctx.drawImage(screenshotCanvas, 0, 0);
            
            // 設定のマージ
            const config = { ...this.config, ...options };
            
            // スコア情報の描画
            if (config.score.enabled && scoreData.score !== undefined) {
                await this.drawScoreInfo(ctx, scoreData, config, overlayCanvas.width, overlayCanvas.height);
            }
            
            // ロゴの描画
            if (config.logo.enabled) {
                await this.drawLogo(ctx, config, overlayCanvas.width, overlayCanvas.height);
            }
            
            // ウォーターマークの描画
            if (config.watermark.enabled) {
                await this.drawWatermark(ctx, config, overlayCanvas.width, overlayCanvas.height);
            }
            
            // 統計の更新
            const renderTime = performance.now() - startTime;
            this.updateStats(renderTime);

            this.log('スコアオーバーレイ作成完了', {
                score: scoreData.score,
                renderTime: `${Math.round(renderTime)}ms`,
                dimensions: `${overlayCanvas.width}x${overlayCanvas.height}`
            });
            
            return overlayCanvas;

        } catch (error) {
            this.stats.errors++;
            this.handleError('SCORE_OVERLAY_CREATION_FAILED', error as Error, { scoreData, options });
            throw error;
        }
    }
    
    /**
     * 実績オーバーレイの作成
     */
    async createAchievementOverlay(screenshotCanvas: HTMLCanvasElement, achievementData: AchievementData, options: Partial<OverlayConfig> = {}): Promise<HTMLCanvasElement> {
        try {
            const startTime = performance.now();
            const overlayCanvas = this.createOverlayCanvas(screenshotCanvas.width, screenshotCanvas.height);
            const ctx = overlayCanvas.getContext('2d')!;
            
            // ベース画像を描画
            ctx.drawImage(screenshotCanvas, 0, 0);
            const config = { ...this.config, ...options };
            
            // 実績情報の描画
            if (config.achievement.enabled && achievementData.name) {
                await this.drawAchievementInfo(ctx, achievementData, config, overlayCanvas.width, overlayCanvas.height);
            }
            
            // ロゴとウォーターマークの描画
            if (config.logo.enabled) {
                await this.drawLogo(ctx, config, overlayCanvas.width, overlayCanvas.height);
            }
            
            if (config.watermark.enabled) {
                await this.drawWatermark(ctx, config, overlayCanvas.width, overlayCanvas.height);
            }

            const renderTime = performance.now() - startTime;
            this.updateStats(renderTime);

            this.log('実績オーバーレイ作成完了', {
                achievement: achievementData.name,
                renderTime: `${Math.round(renderTime)}ms`
            });
            
            return overlayCanvas;

        } catch (error) {
            this.stats.errors++;
            this.handleError('ACHIEVEMENT_OVERLAY_CREATION_FAILED', error as Error, { achievementData, options });
            throw error;
        }
    }
    
    /**
     * カスタムオーバーレイの作成
     */
    async createCustomOverlay(screenshotCanvas: HTMLCanvasElement, overlayData: OverlayData, options: Partial<OverlayConfig> = {}): Promise<HTMLCanvasElement> {
        try {
            const startTime = performance.now();
            const overlayCanvas = this.createOverlayCanvas(screenshotCanvas.width, screenshotCanvas.height);
            const ctx = overlayCanvas.getContext('2d')!;
            
            // ベース画像を描画
            ctx.drawImage(screenshotCanvas, 0, 0);
            const config = { ...this.config, ...options };
            
            // カスタム要素の描画
            if (overlayData.elements && Array.isArray(overlayData.elements)) {
                for (const element of overlayData.elements) {
                    await this.drawCustomElement(ctx, element, config, overlayCanvas.width, overlayCanvas.height);
                }
            }
            
            // 標準要素の描画
            if (config.logo.enabled) {
                await this.drawLogo(ctx, config, overlayCanvas.width, overlayCanvas.height);
            }
            
            if (config.watermark.enabled) {
                await this.drawWatermark(ctx, config, overlayCanvas.width, overlayCanvas.height);
            }

            const renderTime = performance.now() - startTime;
            this.updateStats(renderTime);

            this.log('カスタムオーバーレイ作成完了', {
                elements: overlayData.elements?.length || 0,
                renderTime: `${Math.round(renderTime)}ms`
            });
            
            return overlayCanvas;

        } catch (error) {
            this.stats.errors++;
            this.handleError('CUSTOM_OVERLAY_CREATION_FAILED', error as Error, { overlayData, options });
            throw error;
        }
    }
    
    /**
     * スコア情報の描画
     */
    async drawScoreInfo(ctx: CanvasRenderingContext2D, scoreData: ScoreData, config: OverlayConfig, canvasWidth: number, canvasHeight: number): Promise<void> {
        const scoreConfig = config.score;
        
        // フォントの設定
        ctx.font = `${scoreConfig.fontWeight} ${scoreConfig.fontSize}px ${scoreConfig.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // 表示するテキストの準備
        const lines: string[] = [];
        
        // スコア
        if (scoreData.score !== undefined) {
            lines.push(`スコア: ${this.formatNumber(scoreData.score)}`);
        }
        
        // コンボ
        if (scoreData.combo && scoreData.combo > 1) {
            lines.push(`コンボ: ${scoreData.combo}`);
        }
        
        // 精度
        if (scoreData.accuracy !== undefined) {
            lines.push(`精度: ${Math.round(scoreData.accuracy * 100)}%`);
        }
        
        // ステージ
        if (scoreData.stage) {
            lines.push(`ステージ: ${scoreData.stage}`);
        }
        
        if (lines.length === 0) return;
        
        // テキストの測定
        const lineHeight = scoreConfig.fontSize * 1.2;
        const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const textHeight = lines.length * lineHeight;
        
        // 背景ボックスのサイズ
        const boxWidth = textWidth + (scoreConfig.padding.x * 2);
        const boxHeight = textHeight + (scoreConfig.padding.y * 2);
        
        // 位置の計算
        const position = this.calculatePosition(
            scoreConfig.position || config.layout.scorePosition,
            boxWidth,
            boxHeight,
            canvasWidth,
            canvasHeight,
            config.layout.padding
        );
        
        // 影の描画
        if (scoreConfig.shadowBlur > 0) {
            ctx.save();
            ctx.shadowColor = scoreConfig.shadowColor;
            ctx.shadowBlur = scoreConfig.shadowBlur;
            ctx.shadowOffsetX = scoreConfig.shadowOffset.x;
            ctx.shadowOffsetY = scoreConfig.shadowOffset.y;
        }
        
        // 背景の描画
        this.drawRoundedRect(
            ctx,
            position.x,
            position.y,
            boxWidth,
            boxHeight,
            config.layout.cornerRadius,
            scoreConfig.backgroundColor,
            scoreConfig.borderColor,
            scoreConfig.borderWidth
        );
        
        if (scoreConfig.shadowBlur > 0) {
            ctx.restore();
        }
        
        // テキストの描画
        ctx.fillStyle = scoreConfig.textColor;
        
        lines.forEach((line, index) => {
            const textX = position.x + scoreConfig.padding.x;
            const textY = position.y + scoreConfig.padding.y + (index * lineHeight);
            ctx.fillText(line, textX, textY);
        });
    }
    
    /**
     * ロゴの描画
     */
    async drawLogo(ctx: CanvasRenderingContext2D, config: OverlayConfig, canvasWidth: number, canvasHeight: number): Promise<void> {
        const logoConfig = config.logo;
        
        // フォントの設定
        ctx.font = `${logoConfig.fontWeight} ${logoConfig.fontSize}px ${logoConfig.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // テキストの測定
        const textMetrics = ctx.measureText(logoConfig.text);
        const textWidth = Math.min(textMetrics.width, logoConfig.maxWidth);
        const textHeight = logoConfig.fontSize;
        
        // 位置の計算
        const position = this.calculatePosition(
            logoConfig.position || config.layout.logoPosition,
            textWidth,
            textHeight,
            canvasWidth,
            canvasHeight,
            config.layout.padding
        );
        
        // 影の描画
        if (logoConfig.shadowBlur > 0) {
            ctx.save();
            ctx.shadowColor = logoConfig.shadowColor;
            ctx.shadowBlur = logoConfig.shadowBlur;
            ctx.shadowOffsetX = logoConfig.shadowOffset.x;
            ctx.shadowOffsetY = logoConfig.shadowOffset.y;
        }
        
        // ストローク（輪郭）の描画
        if (logoConfig.strokeWidth > 0) {
            ctx.strokeStyle = logoConfig.strokeColor;
            ctx.lineWidth = logoConfig.strokeWidth;
            ctx.strokeText(logoConfig.text, position.x, position.y);
        }
        
        // テキストの描画
        ctx.fillStyle = logoConfig.textColor;
        ctx.fillText(logoConfig.text, position.x, position.y);
        
        if (logoConfig.shadowBlur > 0) {
            ctx.restore();
        }
    }
    
    /**
     * ウォーターマークの描画
     */
    async drawWatermark(ctx: CanvasRenderingContext2D, config: OverlayConfig, canvasWidth: number, canvasHeight: number): Promise<void> {
        const watermarkConfig = config.watermark;
        
        // フォントの設定
        ctx.font = `${watermarkConfig.fontSize}px ${watermarkConfig.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // テキストの測定
        const textWidth = ctx.measureText(watermarkConfig.text).width;
        const textHeight = watermarkConfig.fontSize;
        
        // 背景ボックスのサイズ
        const boxWidth = textWidth + (watermarkConfig.padding.x * 2);
        const boxHeight = textHeight + (watermarkConfig.padding.y * 2);
        
        // 位置の計算
        const position = this.calculatePosition(
            watermarkConfig.position || config.layout.watermarkPosition,
            boxWidth,
            boxHeight,
            canvasWidth,
            canvasHeight,
            config.layout.padding
        );
        
        // 背景の描画
        if (watermarkConfig.backgroundColor) {
            this.drawRoundedRect(
                ctx,
                position.x,
                position.y,
                boxWidth,
                boxHeight,
                watermarkConfig.cornerRadius || 0,
                watermarkConfig.backgroundColor
            );
        }
        
        // テキストの描画
        ctx.fillStyle = watermarkConfig.textColor;
        ctx.fillText(
            watermarkConfig.text,
            position.x + watermarkConfig.padding.x,
            position.y + watermarkConfig.padding.y
        );
    }
    
    /**
     * 実績情報の描画
     */
    async drawAchievementInfo(ctx: CanvasRenderingContext2D, achievementData: AchievementData, config: OverlayConfig, canvasWidth: number, canvasHeight: number): Promise<void> {
        const achievementConfig = config.achievement;
        
        // フォントの設定
        ctx.font = `${achievementConfig.fontWeight} ${achievementConfig.fontSize}px ${achievementConfig.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // 実績テキストの準備
        const lines: string[] = [];
        lines.push('🏆 実績解除！');
        lines.push(achievementData.name);
        
        if (achievementData.description) {
            // 長い説明文の折り返し処理
            const wrappedDescription = this.wrapText(ctx, achievementData.description, achievementConfig.maxWidth - 40);
            lines.push(...wrappedDescription);
        }
        
        // テキストの測定
        const lineHeight = achievementConfig.fontSize * 1.3;
        const textWidth = Math.min(
            Math.max(...lines.map(line => ctx.measureText(line).width)),
            achievementConfig.maxWidth
        );
        const textHeight = lines.length * lineHeight;
        
        // 背景ボックスのサイズ
        const boxWidth = textWidth + (achievementConfig.padding.x * 2);
        const boxHeight = textHeight + (achievementConfig.padding.y * 2);
        
        // 位置の計算（中央表示）
        const position = this.calculatePosition(
            'center',
            boxWidth,
            boxHeight,
            canvasWidth,
            canvasHeight,
            0
        );
        
        // 背景の描画
        this.drawRoundedRect(
            ctx,
            position.x,
            position.y,
            boxWidth,
            boxHeight,
            config.layout.cornerRadius,
            achievementConfig.backgroundColor,
            achievementConfig.borderColor,
            achievementConfig.borderWidth
        );
        
        // テキストの描画
        ctx.fillStyle = achievementConfig.textColor;
        
        lines.forEach((line, index) => {
            const textX = position.x + achievementConfig.padding.x;
            const textY = position.y + achievementConfig.padding.y + (index * lineHeight);
            ctx.fillText(line, textX, textY);
        });
    }
    
    /**
     * カスタム要素の描画
     */
    async drawCustomElement(ctx: CanvasRenderingContext2D, element: any, config: OverlayConfig, canvasWidth: number, canvasHeight: number): Promise<void> {
        switch(element.type) {
            case 'text':
                await this.drawCustomText(ctx, element, config, canvasWidth, canvasHeight);
                break;
            case 'image':
                await this.drawCustomImage(ctx, element, config, canvasWidth, canvasHeight);
                break;
            case 'shape':
                await this.drawCustomShape(ctx, element, config, canvasWidth, canvasHeight);
                break;
            default:
                this.log(`未知のカスタム要素タイプ: ${element.type}`, null, 'warn');
        }
    }
    
    /**
     * カスタムテキストの描画
     */
    async drawCustomText(ctx: CanvasRenderingContext2D, element: any, config: OverlayConfig, canvasWidth: number, canvasHeight: number): Promise<void> {
        const textConfig = { ...config.score, ...element.style };

        ctx.font = `${textConfig.fontWeight || 'normal'} ${textConfig.fontSize || 16}px ${textConfig.fontFamily || 'Arial'}`;
        ctx.textAlign = element.align || 'left';
        ctx.textBaseline = 'top';

        const position = element.position || 
            this.calculatePosition('center', 100, 20, canvasWidth, canvasHeight, config.layout.padding);

        ctx.fillStyle = textConfig.textColor || '#FFFFFF';
        ctx.fillText(element.text || '', position.x, position.y);
    }
    
    /**
     * カスタム画像の描画
     */
    async drawCustomImage(_ctx: CanvasRenderingContext2D, element: any, _config: OverlayConfig, _canvasWidth: number, _canvasHeight: number): Promise<void> {
        // TODO: 画像描画実装
        this.log('カスタム画像の描画は未実装です', element);
    }
    
    /**
     * カスタムシェイプの描画
     */
    async drawCustomShape(_ctx: CanvasRenderingContext2D, element: any, _config: OverlayConfig, _canvasWidth: number, _canvasHeight: number): Promise<void> {
        // TODO: シェイプ描画実装
        this.log('カスタムシェイプの描画は未実装です', element);
    }
    
    /**
     * 角丸四角形の描画
     */
    drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, 
                    radius: number, fillColor?: string, strokeColor?: string, strokeWidth?: number): void {
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
        
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        
        if (strokeColor && strokeWidth && strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
    }
    
    /**
     * 位置の計算
     */
    calculatePosition(position: string | Position, elementWidth: number, elementHeight: number, 
                     canvasWidth: number, canvasHeight: number, padding: number): Position {
        let x: number, y: number;

        switch(position) {
            case 'top-left':
                x = padding;
                y = padding;
                break;
            case 'top-right':
                x = canvasWidth - elementWidth - padding;
                y = padding;
                break;
            case 'bottom-left':
                x = padding;
                y = canvasHeight - elementHeight - padding;
                break;
            case 'bottom-right':
                x = canvasWidth - elementWidth - padding;
                y = canvasHeight - elementHeight - padding;
                break;
            case 'center':
                x = (canvasWidth - elementWidth) / 2;
                y = (canvasHeight - elementHeight) / 2;
                break;
            case 'top-center':
                x = (canvasWidth - elementWidth) / 2;
                y = padding;
                break;
            case 'bottom-center':
                x = (canvasWidth - elementWidth) / 2;
                y = canvasHeight - elementHeight - padding;
                break;
            default:
                // カスタム座標 { x, y }
                if (typeof position === 'object' && position.x !== undefined && position.y !== undefined) {
                    x = position.x;
                    y = position.y;
                } else {
                    x = padding;
                    y = padding;
                }
        }
        
        return { x: Math.max(0, x), y: Math.max(0, y) };
    }
    
    /**
     * テキストの折り返し処理
     */
    wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }
    
    /**
     * 数値のフォーマット
     */
    formatNumber(number: number): string {
        return number.toLocaleString();
    }
    
    /**
     * オーバーレイCanvas作成
     */
    createOverlayCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        return canvas;
    }
    
    /**
     * レスポンシブ設定の取得
     */
    getResponsiveConfig(canvasWidth: number, canvasHeight: number): OverlayConfig {
        const aspectRatio = canvasWidth / canvasHeight;
        const isLandscape = aspectRatio > 1;
        const isMobile = Math.min(canvasWidth, canvasHeight) < 600;
        const responsiveConfig = { ...this.config };
        
        if (isMobile) {
            // モバイル用の設定調整
            responsiveConfig.score.fontSize *= 0.8;
            responsiveConfig.logo.fontSize *= 0.8;
            responsiveConfig.watermark.fontSize *= 0.8;
            responsiveConfig.layout.padding *= 0.7;
        }

        if (!isLandscape) {
            // ポートレート用の設定調整
            responsiveConfig.layout.scorePosition = 'top-center';
            responsiveConfig.layout.logoPosition = 'bottom-center';
        }
        
        return responsiveConfig;
    }
    
    /**
     * プリセット設定の取得
     */
    getPresetConfig(presetName: string): Partial<OverlayConfig> {
        const presets: { [key: string]: any } = {
            minimal: {
                logo: { enabled: false },
                watermark: { enabled: false },
                score: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderWidth: 0
                }
            },
            
            elegant: {
                score: {
                    backgroundColor: 'rgba(50, 50, 70, 0.9)',
                    borderColor: '#C0C0C0',
                    textColor: '#F0F0F0'
                },
                logo: {
                    textColor: '#FF8C69',
                    strokeColor: '#FFFFFF'
                }
            },
            
            gaming: {
                score: {
                    backgroundColor: 'rgba(0, 255, 0, 0.8)',
                    borderColor: '#00FF00',
                    textColor: '#000000',
                    fontSize: 28
                },
                logo: {
                    textColor: '#FF00FF',
                    fontSize: 36
                }
            },
            
            social: {
                layout: {
                    scorePosition: 'center',
                    logoPosition: 'top-center',
                    watermarkPosition: 'bottom-center'
                },
                score: {
                    fontSize: 32,
                    backgroundColor: 'rgba(64, 128, 255, 0.9)'
                }
            }
        };
        
        return presets[presetName] || {};
    }
    
    /**
     * 統計の更新
     */
    updateStats(renderTime: number): void {
        this.stats.overlaysCreated++;
        this.stats.totalTime += renderTime;
        this.stats.averageTime = this.stats.totalTime / this.stats.overlaysCreated;
    }
    
    /**
     * 統計情報の取得
     */
    getStats(): any {
        return {
            ...this.stats,
            averageTimeMs: Math.round(this.stats.averageTime),
            successRate: this.stats.overlaysCreated > 0 ?
                ((this.stats.overlaysCreated - this.stats.errors) / this.stats.overlaysCreated) * 100 : 0
        };
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<OverlayConfig>): void {
        this.config = this.mergeConfig(this.config, newConfig);
        this.log('オーバーレイ設定を更新しました', newConfig);
    }
    
    /**
     * 設定のマージ（深いマージ）
     */
    mergeConfig(target: any, source: any): any {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfig(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache(): void {
        this.cache.fonts.clear();
        this.cache.images.clear();
        this.cache.measurements.clear();
        
        this.log('オーバーレイキャッシュをクリアしました');
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type: string, error: Error, context: any = {}): void {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };
        
        // ErrorHandlerユーティリティの使用
        if (ErrorHandler) {
            (ErrorHandler as any).handleError(error, 'ScreenshotOverlay', context);
        }
        
        // ローカルログの記録
        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録
     */
    log(message: string, data: any = null, level: string = 'info'): void {
        const __logEntry = {
            timestamp: Date.now(),
            message,
            data,
            level
        };
        
        const consoleMethod = level === 'error' ? 'error' :
                            level === 'warn' ? 'warn' : 'log';

        console[consoleMethod](`[ScreenshotOverlay] ${message}`, data || '');
    }
}