/**
 * ChartUtilities
 * 
 * チャート描画支援ユーティリティ機能を担当
 * Chart Renderer Patternの一部として設計
 * 
 * **Features**:
 * - Chart animation engine and interaction management
 * - Layout management and responsive design
 * - Area, Scatter, Progress bar chart renderers
 * - Common utilities and helper functions
 * 
 * @module ChartUtilities
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface ChartContext extends CanvasRenderingContext2D { canvas: HTMLCanvasElement
    }
}

export interface ChartRenderer { render: (context: ChartContext, data: any[], options: ChartOptions) => ChartRenderResult }
}

export interface ChartRenderResult { type: ChartType,
    dataPoints: number,
    min?: number;
    max?: number;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    chartArea: ChartArea,
    scales?: ChartScales;
    areas?: AreaData[];
    points?: ScatterPoint[];
    bars?: ProgressBarData[];
    performance?: RenderPerformance;
    error?: string; }
}

export interface ChartOptions { padding?: number;
    showAxes?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    fontSize?: number;
    fontFamily?: string;
    theme: ChartTheme,
    areaColor?: string;
    lineColor?: string;
    animation?: AnimationConfig;
    interaction?: InteractionConfig;
    layout?: LayoutConfig;
    }
}

export interface ChartTheme { colors: ThemeColors,
    palette: string[],
    background?: string;
    gradients?: ThemeGradients;
    }
}

export interface ThemeColors { primary: string,
    secondary: string,
    accent: string,
    dark: string,
    light: string,
    background: string,
    text: string,
    grid: string,
    axis: string }
}

export interface ThemeGradients { primary: string[],
    secondary: string[],
    accent: string[] }
}

export interface AnimationConfig { enabled: boolean,
    duration: number,
    easing: EasingFunction,
    staggerDelay?: number;
    loop?: boolean; }
}

export interface InteractionConfig { hover: HoverConfig,
    click: ClickConfig,
    tooltip: TooltipConfig
    }
}

export interface HoverConfig { enabled: boolean,
    highlightColor?: string;
    cursor?: string;
    scale?: number; }
}

export interface ClickConfig { enabled: boolean,
    callback?: (data: any, event: MouseEvent) => void;
    selectMultiple?: boolean; }
}

export interface TooltipConfig { enabled: boolean,
    template?: string;
    position?: TooltipPosition;
    style?: TooltipStyle;
    formatter?: (data: any) => string }
}

export interface TooltipStyle { background: string,
    color: string,
    border: string,
    borderRadius: number,
    padding: number,
    fontSize: number,
    fontFamily: string,
    shadow?: string }
}

export interface LayoutConfig { type: LayoutType,
    columns?: number;
    rows?: number;
    gap?: number;
    responsive?: boolean; }
}

export interface ChartArea { x: number,
    y: number,
    width: number,
    height: number }
}

export interface ChartScales { xScale: number,
    yScale: number,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    xRange?: number;
    yRange?: number; }
}

export interface AnimationFrame { id: string,
    progress: number,
    duration: number,
    startTime: number,
    easing: EasingFunction,
    update: (progress: number) => void,
    complete?: () => void }
}

export interface ActiveInteraction { type: InteractionType,
    element?: HTMLElement;
    data?: any;
    startTime: number,
    position?: InteractionPosition
    }
}

export interface InteractionPosition { x: number,
    y: number,
    clientX: number,
    clientY: number }
}

export interface LayoutArea { x: number,
    y: number,
    width: number,
    height: number,
    index: number }
}

export interface LayoutResult { areas: LayoutArea[],
    totalArea: ChartArea,
    columns: number,
    rows: number }
}

export interface AreaChartData { x: number,
    value: number,
    label?: string;
    color?: string;
    series?: string; }
}

export interface AreaData { path: AreaChartData[],
    gradient: CanvasGradient,
    color: string,
    opacity: number }
}

export interface ScatterChartData { x: number,
    y: number,
    size?: number;
    label?: string;
    color?: string;
    series?: string; }
}

export interface ScatterPoint { x: number,
    y: number,
    radius: number,
    dataX: number,
    dataY: number,
    label?: string;
    color: string }
}

export interface ProgressData { value: number,
    max: number,
    label?: string;
    color?: string; }
}

export interface ProgressBarData { x: number,
    y: number,
    width: number,
    height: number,
    progressWidth: number,
    value: number,
    max: number,
    percentage: number,
    color: string }
}

export interface RenderPerformance { renderTime: number,
    animationFrames?: number;
    interactionEvents?: number;
    memoryUsage?: number; }
}

// 列挙型
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'progress' | 'bubble';''
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';''
export type InteractionType = 'hover' | 'click' | 'drag' | 'zoom' | 'pan';''
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'follow' | 'fixed';''
export type LayoutType = 'grid' | 'flex' | 'stack' | 'float' | 'absolute';

// 定数
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = { enabled: true,
    duration: 1000,'';
    easing: 'ease-out',
    staggerDelay: 50,
    loop: false }
} as const,

export const DEFAULT_INTERACTION_CONFIG: InteractionConfig = { hover: {'
        enabled: true,'';
        cursor: 'pointer',
        scale: 1.1 }
    },
    click: { enabled: true,
        selectMultiple: false }
    },'
    tooltip: { enabled: true,''
        position: 'follow',';
        style: {''
            background: 'rgba(0, 0, 0, 0.8')','';
            color: '#FFFFFF','';
            border: 'none',
            borderRadius: 4,
            padding: 8,';
            fontSize: 12,'';
            fontFamily: 'Arial, sans-serif' }
        }
    }
} as const;
';'
export const EASING_FUNCTIONS: Record<EasingFunction, (t: number) => number> = { linear: (t) => t,''
    ease: (t) => t * t * (3 - 2 * t'),'';
    'ease-in': (t') => t * t,'';
    'ease-out': (t) => t * (2 - t'),'';
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: (t) => { 
        if (t < 0.36) return 7.5625 * t * t,
        if (t < 0.73) return 7.5625 * (t -= 0.545) * t + 0.75;
        if (t < 0.91) return 7.5625 * (t -= 0.818) * t + 0.9375; }
        return 7.5625 * (t -= 0.955) * t + 0.984375; }
    },
    elastic: (t) => t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1) * Math.sin((t - 1.1) * 5 * Math.PI);
} as const;

export const LAYOUT_DEFAULTS = { GRID_COLUMNS: 2,
    GRID_GAP: 10,
    MIN_CHART_SIZE: 100,
    ASPECT_RATIO: 16 / 9 }
} as const,

export const AREA_CONFIG = { DEFAULT_OPACITY: 0.6,
    LINE_WIDTH: 2,
    GRADIENT_STOPS: [0, 1] }
} as const;

export const SCATTER_CONFIG = { DEFAULT_RADIUS: 5,
    MIN_RADIUS: 2,
    MAX_RADIUS: 20,
    BORDER_WIDTH: 1 }
} as const,

export const PROGRESS_CONFIG = { DEFAULT_HEIGHT: 30,
    DEFAULT_SPACING: 10,
    MIN_VALUE: 0,
    MAX_VALUE: 100 }
} as const,

// ユーティリティ関数
export function interpolate(start: number, end: number, progress: number): number { return start + (end - start) * progress; }
}
';'
export function clamp(value: number, min: number, max: number): number { ''
    return Math.min(Math.max(value, min), max'); }
}'
'';
export function generateGradient(context: CanvasRenderingContext2D, area: ChartArea, colors: string[], direction: 'horizontal' | 'vertical' = 'vertical''): CanvasGradient { ''
    const gradient = direction === 'horizontal';
        ? context.createLinearGradient(area.x, 0, area.x + area.width, 0);
        : context.createLinearGradient(0, area.y, 0, area.y + area.height);
    
    colors.forEach((color, index) => {  }
        gradient.addColorStop(index / (colors.length - 1), color); }
    };
    
    return gradient;
}

export function calculateGridLayout(chartCount: number, maxColumns: number = 4): { columns: number; rows: number } { const columns = Math.min(Math.ceil(Math.sqrt(chartCount), maxColumns);
    const rows = Math.ceil(chartCount / columns); }
    return { columns, rows };
}

export function formatPercentage(value: number, max: number, decimals: number = 1): string { const percentage = (value / max) * 100; }
    return `${percentage.toFixed(decimals})}%`;
}

/**
 * チャートアニメーションエンジン
 */
export class ChartAnimationEngine {
    private animations: Map<string, AnimationFrame>;
    private isAnimating: boolean;
    private animationFrameId: number | null;
    constructor() {

        this.animations = new Map();
        this.isAnimating = false;

    }
    }
        this.animationFrameId = null; }
    }

    /**
     * アニメーション付きチャート描画
     */
    animateChart(context: ChartContext, renderer: ChartRenderer, data: any[], options: ChartOptions): Promise<ChartRenderResult>,
        return new Promise((resolve) => {  const animationConfig = options.animation || DEFAULT_ANIMATION_CONFIG;
            
            if(!animationConfig.enabled) {
            
                const result = renderer.render(context, data, options);
            
            }
                resolve(result); }
                return; }
            }
            
            const animationId = `chart_${Date.now(})}`;
            const startTime = performance.now();
            
            const animationFrame: AnimationFrame = { id: animationId,
                progress: 0,
                duration: animationConfig.duration,
                startTime,
                easing: animationConfig.easing,
                update: (progress) => { 
                    // データのアニメーション補間
                    const animatedData = this.interpolateData(data, progress, animationConfig) }
                    renderer.render(context, animatedData, options); }
                },
                complete: () => {  const finalResult = renderer.render(context, data, options); }
                    resolve(finalResult); }
                }
            };
            
            this.animations.set(animationId, animationFrame);
            this.startAnimationLoop();
        };
    }

    /**
     * データの補間
     */
    private interpolateData(data: any[], progress: number, config: AnimationConfig): any[] { const easingFunc = EASING_FUNCTIONS[config.easing];
        const easedProgress = easingFunc(progress);
        
        return data.map((item, index) => { 
            const delay = (config.staggerDelay || 0) * index;''
            const adjustedProgress = clamp((progress * config.duration - delay) / config.duration, 0, 1');'
            '';
            if (typeof item === 'number') { }
                return item * easedProgress; }
            }
            
            return { ...item, };
                value: (item.value || 0) * interpolate(0, 1, adjustedProgress); }
            };
        };
    }

    /**
     * アニメーションループの開始
     */
    private startAnimationLoop(): void { if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        const animate = () => { 
            const currentTime = performance.now();
            let hasActiveAnimations = false;
            
            for(const [id, frame] of this.animations) {
            
                const elapsed = currentTime - frame.startTime;
                const progress = Math.min(elapsed / frame.duration, 1);
                
                if (progress < 1) {
                    frame.progress = progress;
            
            }
                    frame.update(progress); }
                    hasActiveAnimations = true; }
                } else {  frame.complete? .(); }
                    this.animations.delete(id); }
                }
            }
            
            if (hasActiveAnimations) { this.animationFrameId = requestAnimationFrame(animate); }
            } else {  this.isAnimating = false; }
                this.animationFrameId = null; }
            }
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * 全アニメーションの停止
     */ : undefined
    stopAllAnimations(): void { this.animations.clear();
        if(this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
            this.animationFrameId = null; }
        }
        this.isAnimating = false;
    }

    /**
     * リソースの解放
     */
    dispose(): void { this.stopAllAnimations(); }
    }
}

/**
 * チャートインタラクションマネージャー
 */
export class ChartInteractionManager {
    private activeInteractions: Map<string, ActiveInteraction>;
    private tooltipElement: HTMLElement | null;
    private eventListeners: Map<HTMLElement, Map<string, EventListener>>;

    constructor() {

        this.activeInteractions = new Map();
        this.tooltipElement = null;

    }
    }
        this.eventListeners = new Map(); }
    }

    /**
     * インタラクションの設定
     */
    setupInteractions(canvas: HTMLCanvasElement, renderResult: ChartRenderResult, options: ChartOptions): void { const interactionConfig = options.interaction || DEFAULT_INTERACTION_CONFIG;
        
        // ツールチップの設定
        if(interactionConfig.tooltip.enabled && options.showTooltip) {
            
        }
            this.setupTooltips(canvas, renderResult, interactionConfig.tooltip); }
        }
        
        // ホバーエフェクトの設定
        if (interactionConfig.hover.enabled) { this.setupHoverEffects(canvas, renderResult, interactionConfig.hover); }
        }
        
        // クリックイベントの設定
        if (interactionConfig.click.enabled) { this.setupClickEvents(canvas, renderResult, interactionConfig.click); }
        }
    }

    /**
     * ツールチップの設定
     */
    setupTooltips(canvas: HTMLCanvasElement, renderResult: ChartRenderResult, config: TooltipConfig): void { if (!this.tooltipElement) {
            this.createTooltipElement(config.style || DEFAULT_INTERACTION_CONFIG.tooltip.style); }
        }
        
        const mouseMoveHandler = (event: MouseEvent) => {  const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const dataPoint = this.getDataPointAtPosition(x, y, renderResult);
            
            if (dataPoint) { }
                this.showTooltip(event, dataPoint, config); }
            } else { this.hideTooltip(); }
            }
        };
        ';'
        const mouseLeaveHandler = () => {  ''
            this.hideTooltip()';
        this.addEventListener(canvas, 'mousemove', mouseMoveHandler');' }'
        this.addEventListener(canvas, 'mouseleave', mouseLeaveHandler); }
    }

    /**
     * ホバーエフェクトの設定
     */'
    private setupHoverEffects(canvas: HTMLCanvasElement, renderResult: ChartRenderResult, config: HoverConfig): void { ''
        const mouseEnterHandler = (') => { ' }'
            canvas.style.cursor = config.cursor || 'pointer'; }
        };'
        '';
        const mouseLeaveHandler = (') => {  ' }'
            canvas.style.cursor = 'default'; }
        };'
        '';
        this.addEventListener(canvas, 'mouseenter', mouseEnterHandler');''
        this.addEventListener(canvas, 'mouseleave', mouseLeaveHandler);
    }

    /**
     * クリックイベントの設定
     */
    private setupClickEvents(canvas: HTMLCanvasElement, renderResult: ChartRenderResult, config: ClickConfig): void { const clickHandler = (event: MouseEvent) => { 
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const dataPoint = this.getDataPointAtPosition(x, y, renderResult);
            ';'
            if (dataPoint && config.callback) {' }'
                config.callback(dataPoint, event'); }
            }
        };'
        '';
        this.addEventListener(canvas, 'click', clickHandler);
    }

    /**
     * 指定位置のデータポイントを取得
     */
    private getDataPointAtPosition(x: number, y: number, renderResult: ChartRenderResult): any { // 実装は chartType に依存
        if(renderResult.points) {
            return renderResult.points.find(point => { );
        }
                const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2); }
                return distance <= point.radius; }
            };
        }
        
        if(renderResult.bars) {
        
            return renderResult.bars.find(bar => { 
        
        })
                return x >= bar.x && x <= bar.x + bar.width &&) }
                       y >= bar.y && y <= bar.y + bar.height); }
        }
        
        return null;
    }

    /**
     * ツールチップ要素の作成
     */''
    private createTooltipElement(style: TooltipStyle'): void { ''
        this.tooltipElement = document.createElement('div'');
        this.tooltipElement.style.cssText = `;
            position: absolute }
            background: ${style.background},
            color: ${style.color},
            border: ${style.border}
            border-radius: ${style.borderRadius}px,
            padding: ${style.padding}px,
            font-size: ${style.fontSize}px;
            font-family: ${style.fontFamily}
            pointer-events: none,
            z-index: 10000,
            opacity: 0,';
            transition: opacity 0.2s ease,'';
            ${style.shadow ? `box-shadow: ${style.shadow};` : ''}
        `;
        document.body.appendChild(this.tooltipElement);
    }

    /**
     * ツールチップの表示
     */
    private showTooltip(event: MouseEvent, data: any, config: TooltipConfig): void { if (!this.tooltipElement) return;
        
        const content = config.formatter ? config.formatter(data) : this.formatTooltipContent(data);
        this.tooltipElement.textContent = content;
        
        // 位置の調整
        let x = event.clientX + 10;
        let y = event.clientY - 10;
        
        const rect = this.tooltipElement.getBoundingClientRect();
        
        if(x + rect.width > window.innerWidth) {
        
            
        
        }
            x = event.clientX - rect.width - 10; }
        }
        '';
        if (y < 0') { y = event.clientY + 10; }
        }
        
        this.tooltipElement.style.left = `${x}px`;'
        this.tooltipElement.style.top = `${y}px`;''
        this.tooltipElement.style.opacity = '1';
    }

    /**
     * ツールチップの非表示
     */'
    private hideTooltip(): void { ''
        if(this.tooltipElement') {'
            ';'
        }'
            this.tooltipElement.style.opacity = '0'; }
        }
    }

    /**
     * ツールチップ内容のフォーマット
     */
    private formatTooltipContent(data: any): string { if (data.label && data.value !== undefined) { }
            return `${data.label}: ${data.value}`;
        }
        
        if(data.dataX !== undefined && data.dataY !== undefined) {
        
            
        
        }
            return `(${data.dataX}, ${data.dataY})`;
        }
        
        if(data.percentage !== undefined) {
        
            
        
        }
            return `${data.percentage}%`;
        }
        
        return data.toString();
    }

    /**
     * イベントリスナーの追加
     */
    private addEventListener(element: HTMLElement, type: string, listener: EventListener): void { if(!this.eventListeners.has(element) {
            this.eventListeners.set(element, new Map(); }
        }
        
        const elementListeners = this.eventListeners.get(element)!;
        elementListeners.set(type, listener);
        element.addEventListener(type, listener);
    }

    /**
     * リソースの解放
     */
    dispose(): void { // イベントリスナーの削除
        for(const [element, listeners] of this.eventListeners) {
            for (const [type, listener] of listeners) {
        }
                element.removeEventListener(type, listener); }
            }
        }
        this.eventListeners.clear();
        
        // ツールチップ要素の削除
        if(this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
        }
            this.tooltipElement = null; }
        }
        '';
        this.activeInteractions.clear()';
    calculateLayout(context: ChartContext, chartCount: number, layout: LayoutConfig = { type: 'grid' ): LayoutResult {
        const canvas = context.canvas;
        const totalWidth = canvas.width;
        const totalHeight = canvas.height;'
        '';
        switch(layout.type') {'
            '';
            case 'grid':'';
                return this.calculateGridLayout(totalWidth, totalHeight, chartCount, layout');''
            case 'flex':'';
                return this.calculateFlexLayout(totalWidth, totalHeight, chartCount, layout');''
            case 'stack':;
                return this.calculateStackLayout(totalWidth, totalHeight, chartCount, layout);
            default:;
        }
                return this.calculateGridLayout(totalWidth, totalHeight, chartCount, layout); }
        }
    }

    /**
     * グリッドレイアウトの計算
     */
    private calculateGridLayout(width: number, height: number, chartCount: number, layout: LayoutConfig): LayoutResult {
        const { columns, rows } = layout.columns && layout.rows 
            ? { columns: layout.columns, rows: layout.rows }
            : calculateGridLayout(chartCount, layout.columns || LAYOUT_DEFAULTS.GRID_COLUMNS);
        
        const gap = layout.gap || LAYOUT_DEFAULTS.GRID_GAP;
        const chartWidth = (width - (columns - 1) * gap) / columns;
        const chartHeight = (height - (rows - 1) * gap) / rows;
        
        const areas: LayoutArea[] = [],
        
        for(let i = 0; i < chartCount; i++) {
        
            const col = i % columns;
            const row = Math.floor(i / columns);
            
            areas.push({);
                x: col * (chartWidth + gap),
                y: row * (chartHeight + gap),
                width: chartWidth,
                height: chartHeight,
        
        }
                index: i }
            },
        }
        
        return { areas, }
            totalArea: { x: 0, y: 0, width, height },
            columns,
            rows;
        };
    }

    /**
     * フレックスレイアウトの計算
     */
    private calculateFlexLayout(width: number, height: number, chartCount: number, layout: LayoutConfig): LayoutResult { const gap = layout.gap || LAYOUT_DEFAULTS.GRID_GAP;
        const chartWidth = (width - (chartCount - 1) * gap) / chartCount;
        const chartHeight = height;
        
        const areas: LayoutArea[] = [],
        
        for(let i = 0; i < chartCount; i++) {
        
            areas.push({);
                x: i * (chartWidth + gap),
                y: 0,
                width: chartWidth,
                height: chartHeight,
        
        }
                index: i }
            },
        }
        
        return { areas, }
            totalArea: { x: 0, y: 0, width, height },
            columns: chartCount,
            rows: 1;
        },
    }

    /**
     * スタックレイアウトの計算
     */
    private calculateStackLayout(width: number, height: number, chartCount: number, layout: LayoutConfig): LayoutResult { const gap = layout.gap || LAYOUT_DEFAULTS.GRID_GAP;
        const chartWidth = width;
        const chartHeight = (height - (chartCount - 1) * gap) / chartCount;
        
        const areas: LayoutArea[] = [],
        
        for(let i = 0; i < chartCount; i++) {
        
            areas.push({)
                x: 0),
                y: i * (chartHeight + gap),
                width: chartWidth,
                height: chartHeight,
        
        }
                index: i }
            },
        }
        
        return { areas, }
            totalArea: { x: 0, y: 0, width, height },
            columns: 1,
            rows: chartCount;
        },
    }
}

/**
 * エリアグラフレンダラー
 */
export class AreaChartRenderer implements ChartRenderer { render(context: ChartContext, data: (number | AreaChartData)[], options: ChartOptions): ChartRenderResult {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if(options.showAxes) {
                
            }
                this.renderAxes(context, chartArea, scales, options); }
            }
            
            // グリッドの描画
            if (options.showGrid) { this.renderGrid(context, chartArea, scales, options); }
            }
            ;
            // エリアの描画
            const areas = this.renderAreas(context, processedData, chartArea, scales, options');
            ';'
            return { ''
                type: 'area',
                dataPoints: processedData.length,
                yMin: scales.yMin,
                yMax: scales.yMax,
                xMin: scales.xMin,
                xMax: scales.xMax,
                areas,
                chartArea, };
                scales }
            };'
            '';
        } catch (error) { ''
            console.error('Area chart rendering failed:', error');'
            return { ''
                type: 'area',  };
                dataPoints: 0, }
                chartArea: { x: 0, y: 0, width: 0, height: 0 },
                areas: [],
                error: (error as Error).message ;
            },
        }
    }

    private calculateChartArea(canvas: HTMLCanvasElement, options: ChartOptions): ChartArea { const padding = options.padding || 20;
        return { x: padding,
            y: padding,
            width: canvas.width - (padding * 2), };
            height: canvas.height - (padding * 2); }
        };
    }
';'
    private processData(data: (number | AreaChartData)[]): AreaChartData[] { ''
        return data.map((item, index') => { ' }'
            if (typeof item === 'number') { }
                return { value: item, x: index }
            }
            return { ...item, x: item.x ? ? index }
        };
    }
 : undefined;
    private calculateScales(data: AreaChartData[], chartArea: ChartArea): ChartScales { const values = data.map(d => d.value);
        const xValues = data.map(d => d.x);
        
        const yMin = Math.min(0, Math.min(...values);
        const yMax = Math.max(...values);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        
        return { xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax,
            xRange: xMax - xMin, };
            yRange: yMax - yMin }
        },
    }

    private renderAxes(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions): void { context.strokeStyle = options.theme.colors.dark;
        context.lineWidth = 1;
        
        // Y軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y);
        context.lineTo(chartArea.x, chartArea.y + chartArea.height);
        context.stroke();
        
        // X軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y + chartArea.height);
        context.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
        context.stroke(); }
    }
'';
    private renderGrid(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions'): void { ''
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for(let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
        }
            context.stroke(); }
        }
    }

    private renderAreas(context: ChartContext, data: AreaChartData[], chartArea: ChartArea, scales: ChartScales, options: ChartOptions): AreaData[] { if (data.length < 2) return [];
        
        const baseY = chartArea.y + chartArea.height;
        
        // エリアパスの作成
        context.beginPath();
        
        // 底辺の開始点
        const firstX = chartArea.x + (data[0].x - scales.xMin) * scales.xScale;
        context.moveTo(firstX, baseY);
        
        // 上辺のパス
        data.forEach((item) => { 
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale; }
            context.lineTo(x, y); }
        });
        
        // 底辺に戻る
        const lastX = chartArea.x + (data[data.length - 1].x - scales.xMin) * scales.xScale;
        context.lineTo(lastX, baseY);''
        context.closePath()';
        const gradient = generateGradient(context, chartArea, [areaColor + '80', areaColor + '20']);
        
        context.fillStyle = gradient;
        context.fill();
        
        // 境界線の描画
        context.strokeStyle = options.lineColor || options.theme.colors.primary;
        context.lineWidth = AREA_CONFIG.LINE_WIDTH;
        context.stroke();
        
        return [{ path: data,
            gradient,
            color: areaColor];
            opacity: AREA_CONFIG.DEFAULT_OPACITY }]
        }],
    }
}

/**
 * 散布図レンダラー
 */
export class ScatterChartRenderer implements ChartRenderer { render(context: ChartContext, data: (number | ScatterChartData)[], options: ChartOptions): ChartRenderResult {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if(options.showAxes) {
                
            }
                this.renderAxes(context, chartArea, scales, options); }
            }
            
            // グリッドの描画
            if (options.showGrid) { this.renderGrid(context, chartArea, scales, options); }
            }
            ;
            // 散布点の描画
            const points = this.renderPoints(context, processedData, chartArea, scales, options');
            ';'
            return { ''
                type: 'scatter',
                dataPoints: processedData.length,
                xMin: scales.xMin,
                xMax: scales.xMax,
                yMin: scales.yMin,
                yMax: scales.yMax,
                points,
                chartArea, };
                scales }
            };'
            '';
        } catch (error) { ''
            console.error('Scatter chart rendering failed:', error');'
            return { ''
                type: 'scatter',  };
                dataPoints: 0, }
                chartArea: { x: 0, y: 0, width: 0, height: 0 },
                points: [],
                error: (error as Error).message ;
            },
        }
    }

    private calculateChartArea(canvas: HTMLCanvasElement, options: ChartOptions): ChartArea { const padding = options.padding || 20;
        return { x: padding,
            y: padding,
            width: canvas.width - (padding * 2), };
            height: canvas.height - (padding * 2); }
        };
    }
';'
    private processData(data: (number | ScatterChartData)[]): ScatterChartData[] { ''
        return data.map((item, index') => { ' }'
            if (typeof item === 'number') { }
                return { x: index, y: item, size: SCATTER_CONFIG.DEFAULT_RADIUS }
            }
            return { x: item.x ? ? index,  : undefined
                y: item.y ? ? 0, : undefined;
                size: clamp(item.size ? ? SCATTER_CONFIG.DEFAULT_RADIUS, SCATTER_CONFIG.MIN_RADIUS, SCATTER_CONFIG.MAX_RADIUS), : undefined;
                label: item.label,
                color: item.color, };
                series: item.series }
            },
        };
    }

    private calculateScales(data: ScatterChartData[], chartArea: ChartArea): ChartScales { const xValues = data.map(d => d.x);
        const yValues = data.map(d => d.y);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        return { xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax,
            xRange: xMax - xMin, };
            yRange: yMax - yMin }
        },
    }

    private renderAxes(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions): void { context.strokeStyle = options.theme.colors.dark;
        context.lineWidth = 1;
        
        // Y軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y);
        context.lineTo(chartArea.x, chartArea.y + chartArea.height);
        context.stroke();
        
        // X軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y + chartArea.height);
        context.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
        context.stroke(); }
    }
'';
    private renderGrid(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions'): void { ''
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        const gridSteps = 5;
        
        // 水平グリッド線
        for(let i = 0; i <= gridSteps; i++) {
            const y = chartArea.y + (chartArea.height / gridSteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
        }
            context.stroke(); }
        }
        
        // 垂直グリッド線
        for(let i = 0; i <= gridSteps; i++) {
            const x = chartArea.x + (chartArea.width / gridSteps) * i;
            context.beginPath();
            context.moveTo(x, chartArea.y);
            context.lineTo(x, chartArea.y + chartArea.height);
        }
            context.stroke(); }
        }
    }

    private renderPoints(context: ChartContext, data: ScatterChartData[], chartArea: ChartArea, scales: ChartScales, options: ChartOptions): ScatterPoint[] { const points: ScatterPoint[] = [],
        
        data.forEach((item, index) => { 
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.y - scales.yMin) * scales.yScale;
            const radius = item.size || SCATTER_CONFIG.DEFAULT_RADIUS;
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // 散布点の描画
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);''
            context.fill(''';
            context.strokeStyle = '#FFFFFF';)
            context.lineWidth = SCATTER_CONFIG.BORDER_WIDTH;)
            context.stroke();
            
            points.push({
                x,
                y,
                radius,
                dataX: item.x);
                dataY: item.y);
                label: item.label,) }
                color); }
        });
        
        return points;
    }
}

/**
 * プログレスバーレンダラー
 */
export class ProgressBarRenderer implements ChartRenderer { render(context: ChartContext, data: (number | ProgressData)[], options: ChartOptions): ChartRenderResult {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            ';
            // プログレスバーの描画
            const bars = this.renderProgressBars(context, processedData, chartArea, options');
            ';'
            return { ''
                type: 'progress',
                dataPoints: processedData.length,
                bars, };
                chartArea }
            };'
            '';
        } catch (error) { ''
            console.error('Progress bar rendering failed:', error');'
            return { ''
                type: 'progress',  };
                dataPoints: 0, }
                chartArea: { x: 0, y: 0, width: 0, height: 0 },
                bars: [],
                error: (error as Error).message ;
            },
        }
    }

    private calculateChartArea(canvas: HTMLCanvasElement, options: ChartOptions): ChartArea { const padding = options.padding || 20;
        return { x: padding,
            y: padding,
            width: canvas.width - (padding * 2), };
            height: canvas.height - (padding * 2); }
        };
    }
';'
    private processData(data: (number | ProgressData)[]): ProgressData[] { ''
        return data.map((item, index') => { ''
            if (typeof item === 'number') { }
                return {  };
                    value: clamp(item, PROGRESS_CONFIG.MIN_VALUE, PROGRESS_CONFIG.MAX_VALUE), }
                    label: `Progress ${index + 1}`,
                    max: PROGRESS_CONFIG.MAX_VALUE;
                },
            }
            return { value: clamp(item.value, PROGRESS_CONFIG.MIN_VALUE, item.max || PROGRESS_CONFIG.MAX_VALUE), };
                max: item.max || PROGRESS_CONFIG.MAX_VALUE, }
                label: item.label || `Progress ${index + 1}`,
                color: item.color;
            },
        };
    }

    private renderProgressBars(context: ChartContext, data: ProgressData[], chartArea: ChartArea, options: ChartOptions): ProgressBarData[] { const barHeight = PROGRESS_CONFIG.DEFAULT_HEIGHT;
        const barSpacing = PROGRESS_CONFIG.DEFAULT_SPACING;
        const totalHeight = (barHeight + barSpacing) * data.length - barSpacing;
        const startY = chartArea.y + (chartArea.height - totalHeight) / 2;
        const bars: ProgressBarData[] = [],
        
        data.forEach((item, index) => { '
            const y = startY + index * (barHeight + barSpacing);''
            const progressWidth = (item.value / item.max') * chartArea.width;
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            ';
            // 背景バー
            context.fillStyle = '#E5E7EB';
            context.fillRect(chartArea.x, y, chartArea.width, barHeight);
            
            // プログレスバー
            context.fillStyle = color;
            context.fillRect(chartArea.x, y, progressWidth, barHeight);
            
            // 枠線
            context.strokeStyle = options.theme.colors.dark;
            context.lineWidth = 1;''
            context.strokeRect(chartArea.x, y, chartArea.width, barHeight');
            
            // ラベルとパーセンテージ }
            context.fillStyle = options.theme.colors.dark;' }'
            context.font = `${options.fontSize || 12}px ${options.fontFamily || 'Arial'}`;''
            context.textAlign = 'left';
            
            // ラベル
            if (item.label) { context.fillText(item.label, chartArea.x, y - 5); }
            }
            ;
            // パーセンテージ
            const percentage = formatPercentage(item.value, item.max');''
            context.textAlign = 'right';
            context.fillText(percentage, chartArea.x + chartArea.width, y - 5);
            
            bars.push({ x: chartArea.x,
                y,
                width: chartArea.width,
                height: barHeight);
                progressWidth)';
                value: item.value,')';
                max: item.max'),'';
                percentage: parseFloat(percentage.replace('%', ''),
                color }'
            };''
        }');
        
        return bars;'
    }''
}