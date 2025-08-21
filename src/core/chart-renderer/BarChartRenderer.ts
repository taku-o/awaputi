/**
 * BarChartRenderer
 * 
 * 棒グラフレンダリング機能を担当
 * Chart Renderer Patternの一部として設計
 * 
 * **Features**:
 * - Vertical bar chart rendering
 * - Data processing and scale calculation
 * - Axes, grid, and legend rendering
 * - Theme and styling support
 * 
 * @module BarChartRenderer
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface ChartContext extends CanvasRenderingContext2D { canvas: HTMLCanvasElement;

export interface ChartData { value: number;
    label?: string;
    color?: string;
    series?: string;
    category?: string;
    metadata?: Record<string, any> };
export interface RawChartData { [key: string]: any;
    value?: number;
    label?: string;
    color?: string;
    export interface ProcessedChartData extends ChartData { index: number,
    normalizedValue: number,
    position: DataPosition;
    export interface DataPosition { x: number,
    y: number,
    width: number,
    height: number;
    export interface ChartOptions { padding?: number,
    showAxes?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
    fontSize?: number;
    fontFamily?: string;
    theme: ChartTheme;
    barOptions?: BarOptions;
    axes?: AxesOptions;
    grid?: GridOptions;
    legend?: LegendOptions;
    animation?: AnimationOptions;
    interaction?: InteractionOptions;
     };
export interface ChartTheme { colors: ThemeColors,
    palette: string[];
    background?: string;
    font?: FontTheme;
     };
export interface ThemeColors { primary: string,
    secondary: string,
    accent: string,
    dark: string,
    light: string,
    background: string,
    text: string,
    grid: string,
    axis: string;
    export interface FontTheme { family: string,
    size: number,
    weight: string,
    color: string;
    export interface BarOptions { width?: number,
    gap?: number;
    borderWidth?: number;
    borderColor?: string;
    gradient?: boolean;
    roundCorners?: boolean;
    cornerRadius?: number;
    export interface AxesOptions { x: AxisOptions,
    y: AxisOptions;
    export interface AxisOptions { show?: boolean,
    color?: string;
    width?: number;
    ticks?: TickOptions;
    labels?: LabelOptions;
    title?: AxisTitleOptions;
    export interface TickOptions { show?: boolean,
    count?: number;
    length?: number;
    color?: string;
    width?: number;
    export interface LabelOptions { show?: boolean,
    font?: FontConfiguration;
    color?: string;
    rotation?: number;
    format?: (value: any) => string  };
}

export interface AxisTitleOptions { text?: string,
    font?: FontConfiguration;
    color?: string;
    position?: TitlePosition;
    export interface FontConfiguration { family?: string,
    size?: number;
    weight?: string;
    style?: string;
    export interface GridOptions { show?: boolean,
    color?: string;
    width?: number;
    dashArray?: number[];
    x?: GridLineOptions;
    y?: GridLineOptions;
    export interface GridLineOptions { show?: boolean,
    count?: number;
    color?: string;
    width?: number;
    export interface LegendOptions { show?: boolean,
    position?: LegendPosition;
    alignment?: LegendAlignment;
    font?: FontConfiguration;
    color?: string;
    itemGap?: number;
    symbolSize?: number;
    export interface AnimationOptions { enabled?: boolean,
    duration?: number;
    easing?: EasingFunction;
    delay?: number;
    export interface InteractionOptions { hover?: HoverOptions,
    click?: ClickOptions;
    tooltip?: TooltipOptions;
    export interface HoverOptions { enabled?: boolean,
    highlightColor?: string;
    cursor?: string;
    export interface ClickOptions { enabled?: boolean,
    callback?: (data: ProcessedChartData, event: MouseEvent) => void  };
}

export interface TooltipOptions { enabled?: boolean,
    format?: (data: ProcessedChartData) => string;
    style?: TooltipStyle;
     };
}

export interface TooltipStyle { background?: string,
    color?: string;
    border?: string;
    borderRadius?: number;
    padding?: number;
    font?: FontConfiguration;
    export interface ChartArea { x: number,
    y: number,
    width: number,
    height: number;
    export interface ChartScales { xScale: number,
    yScale: number,
    yMin: number,
    yMax: number,
    yRange: number;
    xMin?: number;
    xMax?: number;
    xRange?: number;
    export interface BarData { x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    color: string,
    data: ProcessedChartData;
    export interface ChartRenderResult { type: ChartType,
    dataPoints: number,
    min: number,
    max: number,
    bars: BarData[],
    chartArea: ChartArea,
    scales: ChartScales;
    performance?: RenderPerformance;
    error?: string;
    export interface RenderPerformance { renderTime: number,
    dataProcessingTime: number,
    drawTime: number;
    memoryUsage?: number;
    export interface LegendItem { label: string,
    color: string;
    series?: string;
    visible: boolean;
    export interface AxisLabel { text: string,
    x: number,
    y: number;
    rotation?: number;
    export interface GridLine { x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: GridLineType;
    export interface ChartBounds { minX: number,
    maxX: number,
    minY: number,
    maxY: number;
    export interface ValidationResult { isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[];
    export interface ValidationError { field: string,
    message: string,
    code: string;
    export interface ValidationWarning { field: string,
    message: string,
    suggestion: string;

// 列挙型
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'bubble';
    export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
    export type LegendAlignment = 'start' | 'center' | 'end';
    export type TitlePosition = 'start' | 'center' | 'end';
    export type GridLineType = 'horizontal' | 'vertical';

// 定数
export const DEFAULT_CHART_OPTIONS: Partial<ChartOptions> = { padding: 20,
    showAxes: true,
    showGrid: true,
    showLegend: false,
    fontSize: 12,
    fontFamily: 'Arial, sans-serif' } as const;
';'

export const DEFAULT_THEME: ChartTheme = { colors: {''
        primary: '#3B82F6,
        secondary: '#10B981,
        accent: '#F59E0B,
        dark: '#1F2937,
        light: '#F9FAFB,
        background: '#FFFFFF,
        text: '#374151,
        grid: '#E5E7EB,
        axis: '#6B7280'
        }
    palette: [','
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',]';'
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#14B8A6']';'
    ],
    background: '#FFFFFF';
} as const,

export const BAR_CONFIG = { DEFAULT_WIDTH_RATIO: 0.8,
    DEFAULT_GAP_RATIO: 0.1,
    MIN_BAR_HEIGHT: 1,
    MAX_BARS_FOR_LABELS: 20  } as const;
';'

export const GRID_CONFIG = { DEFAULT_STEPS: 5,''
    DEFAULT_COLOR: '#E5E7EB,
    DEFAULT_WIDTH: 0.5  } as const;
';'

export const AXIS_CONFIG = {,
    DEFAULT_COLOR: '#6B7280,
    DEFAULT_WIDTH: 1,
    TICK_LENGTH: 5,
    LABEL_OFFSET: 15 } as const;
// ユーティリティ関数
export function validateChartData(data: any[]): ValidationResult { const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if(!Array.isArray(data)) {
        errors.push({''
            field: 'data',','
            message: 'Chart data must be an array,')',
            code: 'INVALID_DATA_TYPE'
            };
        return { isValid: false, errors, warnings }

    if (data.length === 0) {
        errors.push({''
            field: 'data',','
            message: 'Chart data cannot be empty',' }'

            code: 'EMPTY_DATA')'); '
    }
    ';'

    const hasInvalidValues = data.some(item => {  ')'
        const value = typeof item === 'number' ? item: item?.value',' 
        return typeof value !== 'number' || !isFinite(value)),

    if (hasInvalidValues) {
        errors.push({ : undefined''
            field: 'data.value',','
            message: 'All data items must have valid numeric values',' }'

            code: 'INVALID_VALUES'); 
    }
    }

    if (data.length > 100) {
        warnings.push({)'
            field: 'data,
            message: 'Large dataset detected(>100, items)'
}

            suggestion: 'Consider data aggregation for better performance' 
    }
    }
    
    return { isValid: errors.length === 0;
        errors };
        warnings }
    }

export function normalizeDataValue(value: number, min: number, max: number): number { if (max === min) return 0.5,
    return (value - min) / (max - min) };
export function calculateOptimalBarWidth(chartWidth: number, dataCount: number, maxWidth: number = 50): number { const availableWidth = chartWidth * BAR_CONFIG.DEFAULT_WIDTH_RATIO,
    const calculatedWidth = availableWidth / dataCount,
    return Math.min(calculatedWidth, maxWidth) };
export function generateColorPalette(count: number, baseColors: string[] = DEFAULT_THEME.palette): string[] { const colors: string[] = [],
    for(let, i = 0, i < count, i++) {
    
};
        colors.push(baseColors[i % baseColors.length]); }
    }
    return colors;
}

export function formatValue(value: number, decimals: number = 2): string { return value.toLocaleString(undefined, {
        minimumFractionDigits: 0),
        maximumFractionDigits: decimals,);
};
export function calculateTextWidth(text: string, font: string, context: CanvasRenderingContext2D): number { const originalFont = context.font,
    context.font = font,
    const width = context.measureText(text).width,
    context.font = originalFont,
    return width };
export class BarChartRenderer {
    private performance: RenderPerformance;
    constructor() {

        this.performance = {
            renderTime: 0,
    dataProcessingTime: 0 };
            drawTime: 0 
    }

    /**
     * メインレンダリング関数
     */
    render(context: ChartContext, data: (number | RawChartData)[], options: ChartOptions): ChartRenderResult { try {
            const startTime = performance.now();
            // データの検証
            const validation = validateChartData(data);
            if (!validation.isValid) { }'

                throw new Error(`Data validation failed: ${validation.errors.map(e => e.message}.join(', '})`);
            }
            
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            
            // データ処理
            const dataStartTime = performance.now();
            const processedData = this.processData(data);
            this.performance.dataProcessingTime = performance.now() - dataStartTime;
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 描画開始
            const drawStartTime = performance.now();
            
            // 軸の描画
            if (options.showAxes) { this.renderAxes(context, chartArea, scales, options);
            
            // グリッドの描画
            if (options.showGrid) { this.renderGrid(context, chartArea, scales, options);
            
            // バーの描画
            const bars = this.renderBars(context, processedData, chartArea, scales, options);
            
            // 凡例の描画
            if (options.showLegend && processedData.some(d => d.series) { this.renderLegend(context, processedData, chartArea, options);
            ';'

            this.performance.drawTime = performance.now() - drawStartTime;
            this.performance.renderTime = performance.now('''
                type: 'bar,
                dataPoints: processedData.length,
                min: scales.yMin,
    max: scales.yMax;
                bars,
                chartArea,
                scales,
                performance: { ...this.performance)', ')' } catch (error) {'
            console.error('Bar chart rendering failed:', error',' };

            return { ''
                type: 'bar', ;
                dataPoints: 0,
                min: 0,
    max: 0 };
                bars: [] }
                chartArea: { x: 0, y: 0, width: 0, height: 0  ,
                scales: { xScale: 0, yScale: 0, yMin: 0, yMax: 0, yRange: 0  ,
                error: (error, as Error).message ;
                }
}
    /**
     * チャートエリアの計算
     */
    private calculateChartArea(canvas: HTMLCanvasElement, options: ChartOptions): ChartArea { const padding = options.padding || DEFAULT_CHART_OPTIONS.padding!,
        return { x: padding,
            y: padding,
    width: canvas.width - (padding * 2) };
            height: canvas.height - (padding * 2); 
    }

    /**
     * データの前処理
     */'
    private processData(data: (number | RawChartData)[]): ProcessedChartData[] { ''
        return data.map((item, index) => { 
            let processedItem: ProcessedChartData,

            if(typeof, item === 'number' { }
                processedItem = { }
                    value: item,
                    label: `Item ${index + 1}`;
                    index,
                    normalizedValue: 0,
    position: { x: 0, y: 0, width: 0, height: 0  } else {  processedItem = { }
                    value: item.value || 0 }
                    label: item.label || `Item ${index + 1}`;
                    color: item.color,
                    series: item.series,
                    category: item.category,
    metadata: item.metadata;
                    index,
                    normalizedValue: 0,
    position: { x: 0, y: 0, width: 0, height: 0  }
            
            return processedItem;
        }
    }

    /**
     * スケールの計算
     */
    private calculateScales(data: ProcessedChartData[], chartArea: ChartArea): ChartScales { const values = data.map(d => d.value);
        const yMin = Math.min(0, Math.min(...values);
        const yMax = Math.max(...values);
        const yRange = yMax - yMin,
        
        // 正規化値の計算
        data.forEach(item => { );
            item.normalizedValue = normalizeDataValue(item.value, yMin, yMax); }
        };
        
        return { xScale: chartArea.width / data.length,
            yScale: chartArea.height / (yRange || 1);
            yMin,
            yMax };
            yRange }
        }

    /**
     * 軸の描画
     */
    private renderAxes(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions): void {
        const axesOptions = options.axes || { x: {}, y: {}
        const color = options.theme.colors.axis || AXIS_CONFIG.DEFAULT_COLOR;
        const width = AXIS_CONFIG.DEFAULT_WIDTH };
        
        context.strokeStyle = color;
        context.lineWidth = width;
        
        // Y軸
        if (axesOptions.y.show !== false) {
            context.beginPath();
            context.moveTo(chartArea.x, chartArea.y);
            context.lineTo(chartArea.x, chartArea.y + chartArea.height);
            context.stroke(); }
        }
        
        // X軸
        if (axesOptions.x.show !== false) {
            context.beginPath();
            context.moveTo(chartArea.x, chartArea.y + chartArea.height);
            context.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
            context.stroke(); }
        }
        
        // 軸ラベルの描画
        this.renderAxisLabels(context, chartArea, scales, options);
    }

    /**
     * 軸ラベルの描画
     */''
    private renderAxisLabels(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions): void { const fontSize = options.fontSize || DEFAULT_CHART_OPTIONS.fontSize!,
        const fontFamily = options.fontFamily || DEFAULT_CHART_OPTIONS.fontFamily! }
        context.font = `${fontSize}px ${fontFamily}`;

        context.fillStyle = options.theme.colors.text;
        context.textAlign = 'center';
        
        // Y軸の値ラベル
        const ySteps = GRID_CONFIG.DEFAULT_STEPS;
        for(let, i = 0; i <= ySteps; i++) {
            const value = scales.yMin + (scales.yRange / ySteps) * i,
            const y = chartArea.y + chartArea.height - (chartArea.height / ySteps') * i,'

            context.textAlign = 'right,
            context.fillText();
                formatValue(value);
                chartArea.x - 10,
                y + fontSize / 2 }
            ); }
}

    /**
     * グリッドの描画
     */
    private renderGrid(context: ChartContext, chartArea: ChartArea, scales: ChartScales, options: ChartOptions): void {
        const gridOptions = options.grid || {};
        const color = gridOptions.color || GRID_CONFIG.DEFAULT_COLOR;
        const width = gridOptions.width || GRID_CONFIG.DEFAULT_WIDTH;
        
        context.strokeStyle = color;
        context.lineWidth = width;
        
        // 水平グリッド線
        if (gridOptions.y?.show !== false) {
            const ySteps = gridOptions.y?.count || GRID_CONFIG.DEFAULT_STEPS,
            for (let, i = 0, i <= ySteps, i++) {
                const y = chartArea.y + (chartArea.height / ySteps) * i,
                context.beginPath();
                context.moveTo(chartArea.x, y);
                context.lineTo(chartArea.x + chartArea.width, y);
                context.stroke(); }
}
        
        // 垂直グリッド線
        if (gridOptions.x?.show !== false) {
            : undefined
            const xSteps = gridOptions.x?.count || Math.min(10, scales.xScale > 20 ? Math.floor(chartArea.width / 50) : 0),
            for (let, i = 0, i <= xSteps, i++) {
                const x = chartArea.x + (chartArea.width / xSteps) * i,
                context.beginPath();
                context.moveTo(x, chartArea.y);
                context.lineTo(x, chartArea.y + chartArea.height);
                context.stroke();     }
}
    /**
     * バーの描画
     */
    private renderBars(context: ChartContext, data: ProcessedChartData[], chartArea: ChartArea, scales: ChartScales, options: ChartOptions): BarData[] {
        const barOptions = options.barOptions || {};
        const barWidth = calculateOptimalBarWidth(scales.xScale, 1) * (barOptions.width || BAR_CONFIG.DEFAULT_WIDTH_RATIO);
        const barGap = scales.xScale * (barOptions.gap || BAR_CONFIG.DEFAULT_GAP_RATIO);
        const bars: BarData[] = [],
        
        const fontSize = options.fontSize || DEFAULT_CHART_OPTIONS.fontSize!;
        const fontFamily = options.fontFamily || DEFAULT_CHART_OPTIONS.fontFamily!;
        
        data.forEach((item, index) => {  const barHeight = Math.max(BAR_CONFIG.MIN_BAR_HEIGHT, Math.abs(item.value) * scales.yScale),
            const x = chartArea.x + (index * scales.xScale) + barGap,
            const y = item.value >= 0 ,
                ? chartArea.y + chartArea.height - barHeight: chartArea.y + chartArea.height,
            
            // バーの色
            const barColor = item.color || options.theme.palette[index % options.theme.palette.length],
            
            // バーの描画
            context.fillStyle = barColor,
            context.fillRect(x, y, barWidth, barHeight);
            // バーの枠線
            if (barOptions.borderWidth && barOptions.borderWidth > 0) {
                context.strokeStyle = barOptions.borderColor || options.theme.colors.dark }
                context.lineWidth = barOptions.borderWidth; }
                context.strokeRect(x, y, barWidth, barHeight); }
            }
            ;
            // ラベルの描画
            if (item.label && data.length <= BAR_CONFIG.MAX_BARS_FOR_LABELS) { context.fillStyle = options.theme.colors.text }

                context.font = `${fontSize}px ${fontFamily}`;
                context.textAlign = 'center';
                
                const labelX = x + barWidth / 2;
                const labelY = chartArea.y + chartArea.height + AXIS_CONFIG.LABEL_OFFSET;
                
                context.fillText(item.label, labelX, labelY);
            }
            
            // 位置情報の更新
            item.position = { x, y, width: barWidth, height: barHeight,
            bars.push({ x, 
                y, 
                width: barWidth,
                height: barHeight ),
                value: item.value,
    color: barColor),
                data: item,);
                data: item,);
        };
        return bars;
    }

    /**
     * 凡例の描画
     */
    private renderLegend(context: ChartContext, data: ProcessedChartData[], chartArea: ChartArea, options: ChartOptions): void {
        const legendOptions = options.legend || {};
        const fontSize = legendOptions.font?.size || options.fontSize || DEFAULT_CHART_OPTIONS.fontSize!;
        const fontFamily = legendOptions.font?.family || options.fontFamily || DEFAULT_CHART_OPTIONS.fontFamily!;
        
        // 凡例項目の抽出 : undefined
        const legendItems: LegendItem[] = [],
        const seriesMap = new Map<string, { color: string, count: number,>();
        
        data.forEach((item, index) => {  }
            const series = item.series || item.label || `Series ${index + 1}`;
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            if (!seriesMap.has(series) {
            
                seriesMap.set(series, { color, count: 1  }
                legendItems.push({ label: series, color, series, visible: true; else { seriesMap.get(series)!.count++ }'}');
        
        // 凡例の描画
        const legendY = chartArea.y - 10;
        const symbolSize = legendOptions.symbolSize || 10;
        const itemGap = legendOptions.itemGap || 20;
        let currentX = chartArea.x;
        
        context.font = `${fontSize}px ${fontFamily}`;
        context.fillStyle = legendOptions.color || options.theme.colors.text;
        context.textAlign = 'left';
        
        legendItems.forEach(item => {  // 凡例シンボル)
            context.fillStyle = item.color),
            context.fillRect(currentX, legendY - symbolSize, symbolSize, symbolSize);
            // 凡例ラベル
            context.fillStyle = legendOptions.color || options.theme.colors.text,
            context.fillText(item.label, currentX + symbolSize + 5, legendY);
            const textWidth = calculateTextWidth(item.label, context.font, context);
            currentX += symbolSize + 5 + textWidth + itemGap;     }
}
    /**
     * パフォーマンスメトリクスの取得
     */
    getPerformanceMetrics(): RenderPerformance {
        return { ...this.performance }

    /**
     * チャート設定のバリデーション
     */
    validateOptions(options: Partial<ChartOptions>): ValidationResult { const errors: ValidationError[] = [],
        const warnings: ValidationWarning[] = [],

        if(options.padding && (options.padding < 0 || options.padding > 100)) {
            errors.push({''
                field: 'padding',','
                message: 'Padding must be between 0 and 100,')',
                code: 'INVALID_PADDING'
            }

        if(options.fontSize && (options.fontSize < 8 || options.fontSize > 72)) { warnings.push({)'
                field: 'fontSize,
                message: 'Font size is outside recommended range(8-72px),
                suggestion: 'Use font sizes between 8 and 72 pixels'}

            }');'
        }
        
        return { isValid: errors.length === 0,
            errors };
            warnings }
        }'}'