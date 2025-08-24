/**
 * ChartRenderer - グラフ描画メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたレンダラーを統制します。
 * Canvas 2D APIを使用してさまざまなタイプのグラフを描画する統合エンジンです。
 */

import { getErrorHandler } from '../utils/ErrorHandler';

/**
 * チャートテーマインターフェース
 */
export interface ChartTheme {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        danger: string;
        info: string;
        light: string;
        dark: string;
        palette: string[];
    };
    fonts: {
        family: string;
        size: {
            small: number;
            normal: number;
            large: number;
            title: number;
        };
        weight: {
            normal: string;
            bold: string;
        };
    };
    spacing: {
        padding: number;
        margin: number;
        gap: number;
    };
    borders: {
        width: number;
        radius: number;
        style: string;
    };
    shadows: {
        light: string;
        medium: string;
        heavy: string;
    };
    animation: {
        duration: number;
        easing: string;
    };
}

/**
 * チャートオプションインターフェース
 */
export interface ChartOptions {
    width?: number;
    height?: number;
    padding?: number;
    fontSize?: number;
    fontFamily?: string;
    backgroundColor?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showAxes?: boolean;
    showTooltip?: boolean;
    animated?: boolean;
    interactive?: boolean;
    responsive?: boolean;
    accessibility?: boolean;
    area?: ChartArea;
    theme?: ChartTheme;
    breakpoint?: 'small' | 'medium' | 'large';
}

/**
 * チャートエリアインターフェース
 */
interface ChartArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * レンダリング結果インターフェース
 */
export interface RenderResult {
    type: string;
    dataPoints?: number;
    min?: number;
    max?: number;
    message?: string;
    timestamp?: number;
    layout?: string;
    charts?: RenderResult[];
    totalArea?: ChartArea;
}

/**
 * チャートデータインターフェース
 */
export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

/**
 * チャートデータセットインターフェース
 */
export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
}

/**
 * チャートポイント情報
 */
interface ChartPoint {
    x: number;
    y: number;
    value: number;
    label: string;
    color: string;
}

/**
 * レンダリング統計
 */
interface RenderStats {
    renders: number;
    lastRender: number;
    renderTime: number;
    errors: number;
    cacheHits: number;
    cacheMisses: number;
}

/**
 * チャート種別
 */
export enum ChartType {
    BAR = 'bar',
    LINE = 'line',
    PIE = 'pie',
    AREA = 'area',
    SCATTER = 'scatter',
    PROGRESS = 'progress'
}

export class ChartRenderer {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private config: Required<ChartOptions>;
    private theme: ChartTheme;
    private stats: RenderStats;
    private cache: Map<string, ImageData> = new Map();
    private animationFrameId: number | null = null;

    constructor(canvas?: HTMLCanvasElement, options: ChartOptions = {}) {
        this.canvas = canvas || null;
        this.ctx = this.canvas?.getContext('2d') || null;

        // デフォルト設定
        this.config = {
            width: options.width || 400,
            height: options.height || 300,
            padding: options.padding || 20,
            fontSize: options.fontSize || 12,
            fontFamily: options.fontFamily || 'Arial, sans-serif',
            backgroundColor: options.backgroundColor || '#ffffff',
            showLegend: options.showLegend !== false,
            showGrid: options.showGrid !== false,
            showAxes: options.showAxes !== false,
            showTooltip: options.showTooltip !== false,
            animated: options.animated !== false,
            interactive: options.interactive !== false,
            responsive: options.responsive !== false,
            accessibility: options.accessibility !== false,
            area: options.area || { x: 0, y: 0, width: 400, height: 300 },
            theme: options.theme || this.getDefaultTheme(),
            breakpoint: options.breakpoint || 'medium'
        };

        this.theme = this.config.theme;

        // 統計初期化
        this.stats = {
            renders: 0,
            lastRender: 0,
            renderTime: 0,
            errors: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this.initializeCanvas();
        console.log('[ChartRenderer] 初期化完了');
    }

    /**
     * キャンバスの初期化
     */
    private initializeCanvas(): void {
        if (!this.canvas || !this.ctx) return;

        // キャンバスサイズの設定
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;

        // デフォルトスタイルの設定
        this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        this.ctx.fillStyle = this.theme.colors.dark;
        this.ctx.strokeStyle = this.theme.colors.primary;

        // 背景色の設定
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    }

    /**
     * デフォルトテーマの取得
     */
    private getDefaultTheme(): ChartTheme {
        return {
            colors: {
                primary: '#007AFF',
                secondary: '#5856D6',
                success: '#34C759',
                warning: '#FF9500',
                danger: '#FF3B30',
                info: '#5AC8FA',
                light: '#F2F2F7',
                dark: '#1C1C1E',
                palette: ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#5AC8FA']
            },
            fonts: {
                family: 'system-ui, -apple-system, sans-serif',
                size: {
                    small: 10,
                    normal: 12,
                    large: 16,
                    title: 18
                },
                weight: {
                    normal: 'normal',
                    bold: 'bold'
                }
            },
            spacing: {
                padding: 16,
                margin: 8,
                gap: 4
            },
            borders: {
                width: 1,
                radius: 4,
                style: 'solid'
            },
            shadows: {
                light: '0 1px 3px rgba(0,0,0,0.1)',
                medium: '0 4px 6px rgba(0,0,0,0.1)',
                heavy: '0 10px 25px rgba(0,0,0,0.2)'
            },
            animation: {
                duration: 300,
                easing: 'ease-in-out'
            }
        };
    }

    /**
     * バーチャートの描画
     */
    renderBarChart(data: ChartData, options: ChartOptions = {}): RenderResult {
        try {
            const startTime = performance.now();
            
            if (!this.ctx || !data.datasets.length) {
                throw new Error('Invalid data or context');
            }

            this.clearCanvas();
            
            const chartArea = this.calculateChartArea();
            const barWidth = chartArea.width / data.labels.length * 0.8;
            const maxValue = Math.max(...data.datasets[0].data);
            const scale = chartArea.height / maxValue;

            // バーの描画
            data.labels.forEach((label, index) => {
                const value = data.datasets[0].data[index];
                const barHeight = value * scale;
                const x = chartArea.x + (index * chartArea.width / data.labels.length) + (chartArea.width / data.labels.length - barWidth) / 2;
                const y = chartArea.y + chartArea.height - barHeight;

                // バー
                this.ctx!.fillStyle = data.datasets[0].backgroundColor as string || this.theme.colors.primary;
                this.ctx!.fillRect(x, y, barWidth, barHeight);

                // ラベル
                this.ctx!.fillStyle = this.theme.colors.dark;
                this.ctx!.textAlign = 'center';
                this.ctx!.fillText(label, x + barWidth / 2, chartArea.y + chartArea.height + 20);

                // 値
                this.ctx!.fillText(value.toString(), x + barWidth / 2, y - 5);
            });

            const endTime = performance.now();
            this.stats.renders++;
            this.stats.lastRender = Date.now();
            this.stats.renderTime = endTime - startTime;

            return {
                type: 'bar',
                dataPoints: data.labels.length,
                min: Math.min(...data.datasets[0].data),
                max: maxValue,
                timestamp: Date.now()
            };
        } catch (error) {
            this.stats.errors++;
            getErrorHandler().handleError(error as Error, {
                context: 'ChartRenderer.renderBarChart',
                data
            });
            
            return {
                type: 'bar',
                message: 'Render failed',
                timestamp: Date.now()
            };
        }
    }

    /**
     * 線グラフの描画
     */
    renderLineChart(data: ChartData, options: ChartOptions = {}): RenderResult {
        try {
            const startTime = performance.now();
            
            if (!this.ctx || !data.datasets.length) {
                throw new Error('Invalid data or context');
            }

            this.clearCanvas();
            
            const chartArea = this.calculateChartArea();
            const maxValue = Math.max(...data.datasets[0].data);
            const scaleX = chartArea.width / (data.labels.length - 1);
            const scaleY = chartArea.height / maxValue;

            this.ctx.strokeStyle = data.datasets[0].borderColor as string || this.theme.colors.primary;
            this.ctx.lineWidth = data.datasets[0].borderWidth || 2;
            
            this.ctx.beginPath();
            
            data.labels.forEach((label, index) => {
                const value = data.datasets[0].data[index];
                const x = chartArea.x + (index * scaleX);
                const y = chartArea.y + chartArea.height - (value * scaleY);

                if (index === 0) {
                    this.ctx!.moveTo(x, y);
                } else {
                    this.ctx!.lineTo(x, y);
                }

                // ポイント
                this.ctx!.fillStyle = this.theme.colors.primary;
                this.ctx!.beginPath();
                this.ctx!.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx!.fill();
            });
            
            this.ctx.stroke();

            const endTime = performance.now();
            this.stats.renders++;
            this.stats.lastRender = Date.now();
            this.stats.renderTime = endTime - startTime;

            return {
                type: 'line',
                dataPoints: data.labels.length,
                min: Math.min(...data.datasets[0].data),
                max: maxValue,
                timestamp: Date.now()
            };
        } catch (error) {
            this.stats.errors++;
            getErrorHandler().handleError(error as Error, {
                context: 'ChartRenderer.renderLineChart',
                data
            });
            
            return {
                type: 'line',
                message: 'Render failed',
                timestamp: Date.now()
            };
        }
    }

    /**
     * 円グラフの描画
     */
    renderPieChart(data: ChartData, options: ChartOptions = {}): RenderResult {
        try {
            const startTime = performance.now();
            
            if (!this.ctx || !data.datasets.length) {
                throw new Error('Invalid data or context');
            }

            this.clearCanvas();
            
            const chartArea = this.calculateChartArea();
            const centerX = chartArea.x + chartArea.width / 2;
            const centerY = chartArea.y + chartArea.height / 2;
            const radius = Math.min(chartArea.width, chartArea.height) / 2 * 0.8;
            
            const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
            let currentAngle = -Math.PI / 2;

            data.labels.forEach((label, index) => {
                const value = data.datasets[0].data[index];
                const angle = (value / total) * Math.PI * 2;
                
                // セクター
                this.ctx!.fillStyle = this.theme.colors.palette[index % this.theme.colors.palette.length];
                this.ctx!.beginPath();
                this.ctx!.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
                this.ctx!.lineTo(centerX, centerY);
                this.ctx!.fill();

                // ラベル
                const labelAngle = currentAngle + angle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                this.ctx!.fillStyle = this.theme.colors.light;
                this.ctx!.textAlign = 'center';
                this.ctx!.fillText(`${label}: ${Math.round(value / total * 100)}%`, labelX, labelY);

                currentAngle += angle;
            });

            const endTime = performance.now();
            this.stats.renders++;
            this.stats.lastRender = Date.now();
            this.stats.renderTime = endTime - startTime;

            return {
                type: 'pie',
                dataPoints: data.labels.length,
                timestamp: Date.now()
            };
        } catch (error) {
            this.stats.errors++;
            getErrorHandler().handleError(error as Error, {
                context: 'ChartRenderer.renderPieChart',
                data
            });
            
            return {
                type: 'pie',
                message: 'Render failed',
                timestamp: Date.now()
            };
        }
    }

    /**
     * チャートエリアの計算
     */
    private calculateChartArea(): ChartArea {
        const padding = this.config.padding;
        return {
            x: padding,
            y: padding,
            width: this.config.width - padding * 2,
            height: this.config.height - padding * 2
        };
    }

    /**
     * キャンバスのクリア
     */
    private clearCanvas(): void {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    }

    /**
     * グリッドの描画
     */
    private drawGrid(): void {
        if (!this.ctx || !this.config.showGrid) return;
        
        const chartArea = this.calculateChartArea();
        this.ctx.strokeStyle = this.theme.colors.light;
        this.ctx.lineWidth = 0.5;

        // 垂直線
        for (let i = 0; i <= 10; i++) {
            const x = chartArea.x + (chartArea.width / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, chartArea.y);
            this.ctx.lineTo(x, chartArea.y + chartArea.height);
            this.ctx.stroke();
        }

        // 水平線
        for (let i = 0; i <= 10; i++) {
            const y = chartArea.y + (chartArea.height / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(chartArea.x, y);
            this.ctx.lineTo(chartArea.x + chartArea.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * 軸の描画
     */
    private drawAxes(): void {
        if (!this.ctx || !this.config.showAxes) return;
        
        const chartArea = this.calculateChartArea();
        this.ctx.strokeStyle = this.theme.colors.dark;
        this.ctx.lineWidth = 1;

        // X軸
        this.ctx.beginPath();
        this.ctx.moveTo(chartArea.x, chartArea.y + chartArea.height);
        this.ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
        this.ctx.stroke();

        // Y軸
        this.ctx.beginPath();
        this.ctx.moveTo(chartArea.x, chartArea.y);
        this.ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
        this.ctx.stroke();
    }

    /**
     * 設定の更新
     */
    updateConfig(newOptions: Partial<ChartOptions>): void {
        this.config = { ...this.config, ...newOptions };
        this.theme = this.config.theme;
        this.initializeCanvas();
    }

    /**
     * キャンバスの設定
     */
    setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initializeCanvas();
    }

    /**
     * 統計の取得
     */
    getStats(): RenderStats {
        return { ...this.stats };
    }

    /**
     * キャッシュのクリア
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * アニメーションの停止
     */
    stopAnimation(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        this.stopAnimation();
        this.clearCache();
        this.canvas = null;
        this.ctx = null;
        console.log('[ChartRenderer] クリーンアップ完了');
    }
}

// シングルトンインスタンス
let chartRendererInstance: ChartRenderer | null = null;

/**
 * ChartRendererのシングルトンインスタンスを取得
 */
export function getChartRenderer(canvas?: HTMLCanvasElement, options?: ChartOptions): ChartRenderer {
    if (!chartRendererInstance) {
        chartRendererInstance = new ChartRenderer(canvas, options);
    }
    return chartRendererInstance;
}