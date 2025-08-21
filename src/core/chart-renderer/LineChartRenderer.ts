/**
 * LineChartRenderer
 * 
 * 線グラフレンダリング機能を担当
 * Chart Renderer Patternの一部として設計
 * 
 * **Features**:
 * - Continuous line chart rendering with smooth curves
 * - Data point visualization and interpolation
 * - Multi-series line chart support
 * - Trend lines and regression analysis
 * 
 * @module LineChartRenderer
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface LineChartContext extends CanvasRenderingContext2D { canvas: HTMLCanvasElement;

export interface LineChartData { value: number;
    x?: number;
    label?: string;
    color?: string;
    series?: string;
    category?: string;
    metadata?: Record<string, any> }

export interface ProcessedLineData extends LineChartData { x: number;
    index: number;
    interpolated?: boolean;
    confidence?: number,  }

export interface LineChartOptions { padding?: number,
    showAxes?: boolean;
    showGrid?: boolean;
    showPoints?: boolean;
    lineColor?: string;
    lineWidth?: number;
    pointColor?: string;
    pointRadius?: number;
    fontSize?: number;
    fontFamily?: string;
    theme: LineChartTheme;
    lineOptions?: LineStyleOptions;
    pointOptions?: PointStyleOptions;
    axes?: LineAxesOptions;
    grid?: LineGridOptions;
    interpolation?: InterpolationOptions;
    series?: SeriesOptions;
    animation?: LineAnimationOptions;
    interaction?: LineInteractionOptions;
     }

export interface LineChartTheme { colors: LineThemeColors;
    palette: string[];
    background?: string;
    font?: LineFontTheme;
    lineStyles?: LineStyleTheme;
     }

export interface LineThemeColors { primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
    background: string;
    text: string;
    grid: string;
    axis: string;
    point: string;

export interface LineFontTheme { family: string;
    size: number;
    weight: string;
    color: string;

export interface LineStyleTheme { defaultWidth: number;
    defaultColor: string;
    defaultStyle: LineStyle;
    pointRadius: number;

export interface LineStyleOptions { width?: number,
    color?: string;
    style?: LineStyle;
    cap?: LineCap;
    join?: LineJoin;
    dashArray?: number[];
    gradient?: boolean;
    smoothing?: boolean;
    tension?: number;

export interface PointStyleOptions { radius?: number,
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shape?: PointShape;
    fill?: boolean;
    shadow?: PointShadowOptions;

export interface PointShadowOptions { enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;

export interface LineAxesOptions { x: LineAxisOptions;
    y: LineAxisOptions;

export interface LineAxisOptions { show?: boolean,
    color?: string;
    width?: number;
    ticks?: LineTickOptions;
    labels?: LineLabelOptions;
    title?: LineAxisTitleOptions;
    grid?: boolean;

export interface LineTickOptions { show?: boolean,
    count?: number;
    length?: number;
    color?: string;
    width?: number;
    format?: (value: number) => string  }
}

export interface LineLabelOptions { show?: boolean,
    font?: LineFontConfiguration;
    color?: string;
    rotation?: number;
    offset?: number;
    format?: (value: number) => string  }
}

export interface LineAxisTitleOptions { text?: string,
    font?: LineFontConfiguration;
    color?: string;
    position?: AxisTitlePosition;
    offset?: number;

export interface LineFontConfiguration { family?: string,
    size?: number;
    weight?: string;
    style?: string;

export interface LineGridOptions { show?: boolean,
    color?: string;
    width?: number;
    dashArray?: number[];
    x?: LineGridAxisOptions;
    y?: LineGridAxisOptions;

export interface LineGridAxisOptions { show?: boolean,
    count?: number;
    color?: string;
    width?: number;
    dashArray?: number[];

export interface InterpolationOptions { enabled?: boolean,
    method?: InterpolationMethod;
    tension?: number;
    segments?: number;
    smoothPoints?: boolean;

export interface SeriesOptions { multiple?: boolean,
    colors?: string[];
    widths?: number[];
    styles?: LineStyle[];
    legend?: SeriesLegendOptions;

export interface SeriesLegendOptions { show?: boolean,
    position?: LegendPosition;
    itemGap?: number;
    symbolSize?: number;
    font?: LineFontConfiguration;

export interface LineAnimationOptions { enabled?: boolean,
    duration?: number;
    easing?: EasingFunction;
    delay?: number;
    drawingSpeed?: number;
    pointDelay?: number;

export interface LineInteractionOptions { hover?: LineHoverOptions,
    click?: LineClickOptions;
    tooltip?: LineTooltipOptions;
    crosshair?: CrosshairOptions;

export interface LineHoverOptions { enabled?: boolean,
    highlightLine?: boolean;
    highlightPoints?: boolean;
    cursorStyle?: string;
    lineWidth?: number;
    pointRadius?: number;

export interface LineClickOptions { enabled?: boolean,
    selectPoint?: boolean;
    selectLine?: boolean;
    callback?: (data: ProcessedLineData, event: MouseEvent) => void  }
}

export interface LineTooltipOptions { enabled?: boolean,
    format?: (data: ProcessedLineData) => string;
    style?: LineTooltipStyle;
    followCursor?: boolean;
    anchor?: TooltipAnchor;
     }
}

export interface LineTooltipStyle { background?: string,
    color?: string;
    border?: string;
    borderRadius?: number;
    padding?: number;
    font?: LineFontConfiguration;
    shadow?: boolean;

export interface CrosshairOptions { enabled?: boolean,
    color?: string;
    width?: number;
    dashArray?: number[];
    showValues?: boolean;

export interface LineChartArea { x: number;
    y: number;
    width: number;
    height: number;

export interface LineChartScales { xScale: number;
    yScale: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xRange: number;
    yRange: number;

export interface LineSegment { start: Point2D;
    end: Point2D;
    control1?: Point2D;
    control2?: Point2D;
    length: number;

export interface Point2D { x: number;
    y: number;

export interface LineRenderResult { type: ChartType;
    dataPoints: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    lines: LineData[];
    points: PointData[];
    chartArea: LineChartArea;
    scales: LineChartScales;
    performance?: LineRenderPerformance;
    error?: string;

export interface LineRenderPerformance { renderTime: number;
    dataProcessingTime: number;
    lineDrawTime: number;
    pointDrawTime: number;
    interpolationTime?: number;
    memoryUsage?: number,  }

export interface LineData { path: ProcessedLineData[];
    color: string;
    width: number;
    style: LineStyle;
    series?: string;
    segments: LineSegment[];

export interface PointData { x: number;
    y: number;
    dataX: number;
    dataY: number;
    radius: number;
    color: string;
    borderColor?: string;
    shape: PointShape;
    data: ProcessedLineData;

export interface LineValidationResult { isValid: boolean;
    errors: LineValidationError[];
    warnings: LineValidationWarning[];

export interface LineValidationError { field: string;
    message: string;
    code: string;

export interface LineValidationWarning { field: string;
    message: string;
    suggestion: string;

export interface LineBounds { minX: number;
    maxX: number;
    minY: number;
    maxY: number;

export interface InterpolationResult { points: Point2D[];
    segments: LineSegment[];
    smoothness: number;

export interface TrendAnalysis { slope: number;
    intercept: number;
    correlation: number;
    trend: TrendDirection;
    confidence: number;

// 列挙型
export type ChartType = 'line' | 'area' | 'scatter' | 'spline' | 'step';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dash-dot';
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';
export type PointShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star';
export type InterpolationMethod = 'linear' | 'cubic' | 'bezier' | 'spline' | 'monotone';
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type AxisTitlePosition = 'start' | 'center' | 'end';
export type TooltipAnchor = 'cursor' | 'point' | 'fixed';
export type TrendDirection = 'up' | 'down' | 'flat' | 'volatile';

// 定数
export const DEFAULT_LINE_OPTIONS: Partial<LineChartOptions> = { padding: 20;
    showAxes: true;
    showGrid: true;
    showPoints: true;
    lineWidth: 2;
    pointRadius: 4;
    fontSize: 12;
    fontFamily: 'Arial, sans-serif' } as const;
';'

export const DEFAULT_LINE_THEME: LineChartTheme = { colors: {''
        primary: '#3B82F6';
        secondary: '#10B981';
        accent: '#F59E0B';
        dark: '#1F2937';
        light: '#F9FAFB';
        background: '#FFFFFF';
        text: '#374151';
        grid: '#E5E7EB';
        axis: '#6B7280';
        point: '#FFFFFF'
            };
    palette: [','
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',]';'
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#14B8A6']';'
    ],
    background: '#FFFFFF';
    lineStyles: { defaultWidth: 2,''
        defaultColor: '#3B82F6';
        defaultStyle: 'solid';
    pointRadius: 4  }
} as const;
export const LINE_CONFIG = { MIN_POINTS: 2;
    MAX_POINTS_FOR_ANIMATION: 100;
    DEFAULT_TENSION: 0.4;
    SMOOTHING_SEGMENTS: 20;
    MAX_LINE_WIDTH: 10  } as const;
export const POINT_CONFIG = { MIN_RADIUS: 1;
    MAX_RADIUS: 20;
    DEFAULT_BORDER_WIDTH: 2;
    HOVER_SCALE: 1.3  } as const;
export const INTERPOLATION_CONFIG = { CUBIC_SEGMENTS: 50;
    BEZIER_SEGMENTS: 30;
    SPLINE_SEGMENTS: 40  } as const;
// ユーティリティ関数
export function validateLineData(data: any[]): LineValidationResult { const errors: LineValidationError[] = [];
    const warnings: LineValidationWarning[] = [];

    if(!Array.isArray(data)) {
        errors.push({''
            field: 'data',','
            message: 'Line chart data must be an array',')',
            code: 'INVALID_DATA_TYPE'
            };
        return { isValid: false, errors, warnings }

    if (data.length < LINE_CONFIG.MIN_POINTS) {
        errors.push({ }

            field: 'data'
            }''
            message: `Line chart requires at least ${LINE_CONFIG.MIN_POINTS} data points`,')'
            code: 'INSUFFICIENT_DATA')');'
    }
    ';'

    const hasInvalidValues = data.some(item => {  ')'
        const value = typeof item === 'number' ? item: item?.value',' 
        return typeof value !== 'number' || !isFinite(value)),

    if (hasInvalidValues) {
        errors.push({ : undefined''
            field: 'data.value',','
            message: 'All data items must have valid numeric values',' }'

            code: 'INVALID_VALUES'),' }'

        }');'
    }
    ';'

    const hasInvalidX = data.some(item => {  ')'
        const x = typeof item === 'object' ? item?.x: undefined'),' 
        return x !== undefined && (typeof, x !== 'number' || !isFinite(x)),

    if (hasInvalidX) {
        errors.push({''
            field: 'data.x',','
            message: 'X coordinates must be valid numbers when specified',' }'

            code: 'INVALID_X_VALUES'); 
    };
    }

    if (data.length > LINE_CONFIG.MAX_POINTS_FOR_ANIMATION) {
        warnings.push({ }

            field: 'data',' }'

            message: `Large dataset (>${LINE_CONFIG.MAX_POINTS_FOR_ANIMATION} points'}' may affect animation performance`,''
            suggestion: 'Consider disabling animations for large datasets',
        } }
    
    return { isValid: errors.length === 0,
        errors };
        warnings }
    }

export function calculateDistance(p1: Point2D, p2: Point2D): number { const dx = p2.x - p1.x,
    const dy = p2.y - p1.y,
    return Math.sqrt(dx * dx + dy * dy) }

export function calculateLineLength(points: Point2D[]): number { let totalLength = 0,
    for(let, i = 1, i < points.length, i++) {
    
}
        totalLength += calculateDistance(points[i - 1], points[i]); }
    }
    return totalLength;
}

export function interpolatePoint(p1: Point2D, p2: Point2D, t: number): Point2D { return { x: p1.x + (p2.x - p1.x) * t },
        y: p1.y + (p2.y - p1.y) * t 
    }

export function calculateBezierPoint(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D { const mt = 1 - t,
    const mt2 = mt * mt,
    const mt3 = mt2 * mt,
    const t2 = t * t,
    const t3 = t2 * t,
    
    return { x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x },
        y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y 
    }
';'

export function calculateTrendLine(data: ProcessedLineData[]): TrendAnalysis { const n = data.length,
    if (n < 2) {
        return { slope: 0,
            intercept: 0,
            correlation: 0 }

            trend: 'flat'
            };
            confidence: 0 
    }
    
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.value, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
    const sumY2 = data.reduce((sum, d) => sum + d.value * d.value, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    ';'

    const correlation = (n * sumXY - sumX * sumY) / ';'
        Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)');'

    let trend: TrendDirection = 'flat',
    if (Math.abs(slope) > 0.01) { ''
        trend = slope > 0 ? 'up' : 'down' }''
    if (Math.abs(correlation) < 0.7) { ''
        trend = 'volatile' }
    
    return { slope,
        intercept,
        correlation,
        trend };
        confidence: Math.abs(correlation); 
    }

export function formatLineValue(value: number, decimals: number = 2): string { return value.toLocaleString(undefined, {
        minimumFractionDigits: 0);
        maximumFractionDigits: decimals,);
}

export class LineChartRenderer {
    private performance: LineRenderPerformance;
    constructor() {

        this.performance = {
            renderTime: 0;
            dataProcessingTime: 0;
    lineDrawTime: 0 }
            pointDrawTime: 0 
    }

    /**
     * メインレンダリング関数
     */
    render(context: LineChartContext, data: (number | LineChartData)[], options: LineChartOptions): LineRenderResult { try {
            const startTime = performance.now();
            // データの検証
            const validation = validateLineData(data);
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
            
            // 軸の描画
            if (options.showAxes) { this.renderAxes(context, chartArea, scales, options) }
            
            // グリッドの描画
            if (options.showGrid) { this.renderGrid(context, chartArea, scales, options) }
            
            // 線の描画
            const lineStartTime = performance.now();
            const lines = this.renderLines(context, processedData, chartArea, scales, options);
            this.performance.lineDrawTime = performance.now() - lineStartTime;
            
            // データポイントの描画
            const pointStartTime = performance.now();
            const points = this.renderDataPoints(context, processedData, chartArea, scales, options);
            this.performance.pointDrawTime = performance.now() - pointStartTime;

            this.performance.renderTime = performance.now('''
                type: 'line';
                dataPoints: processedData.length;
                xMin: scales.xMin;
                xMax: scales.xMax;
                yMin: scales.yMin;
    yMax: scales.yMax;
                lines,
                points,
                chartArea,
                scales,
                performance: { ...this.performance)', ')' } catch (error) {'
            console.error('Line chart rendering failed:', error','

            return { ''
                type: 'line', ;
                dataPoints: 0;
                xMin: 0;
                xMax: 0;
                yMin: 0;
                yMax: 0;
    lines: [] };
                points: [] }
                chartArea: { x: 0, y: 0, width: 0, height: 0  };
                scales: { xScale: 0, yScale: 0, xMin: 0, xMax: 0, yMin: 0, yMax: 0, xRange: 0, yRange: 0  };
                error: (error, as Error).message ;
            } }
    }

    /**
     * チャートエリアの計算
     */
    private calculateChartArea(canvas: HTMLCanvasElement, options: LineChartOptions): LineChartArea { const padding = options.padding || DEFAULT_LINE_OPTIONS.padding!,
        return { x: padding,
            y: padding,
    width: canvas.width - (padding * 2) },
            height: canvas.height - (padding * 2); 
    }

    /**
     * データの前処理
     */'
    private processData(data: (number | LineChartData)[]): ProcessedLineData[] { ''
        return data.map((item, index) => { ''
            if(typeof, item === 'number' { }'
                return { value: item,
                    x: index,
                    label: `Point ${index + 1}`,
                    index,
                    interpolated: false,
                } } else {  return { ...item,
                    x: item.x ? ? index }
                    index, : undefined;;
                    interpolated: false,
        };
    }

    /**
     * スケールの計算
     */
    private calculateScales(data: ProcessedLineData[], chartArea: LineChartArea): LineChartScales { const values = data.map(d => d.value);
        const xValues = data.map(d => d.x);
        const yMin = Math.min(...values);
        const yMax = Math.max(...values);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const xRange = xMax - xMin || 1,
        const yRange = yMax - yMin || 1,
        
        return { xScale: chartArea.width / xRange,
            yScale: chartArea.height / yRange,
            xMin,
            xMax,
            yMin,
            yMax,
            xRange };
            yRange }
        }

    /**
     * 軸の描画
     */
    private renderAxes(context: LineChartContext, chartArea: LineChartArea, scales: LineChartScales, options: LineChartOptions): void {
        const axesOptions = options.axes || { x: {}, y: {}
        const color = options.theme.colors.dark;
        const width = 1;
        
        context.strokeStyle = color;
        context.lineWidth = width;
        
        // Y軸
        if (axesOptions.y.show !== false) {
            context.beginPath();
            context.moveTo(chartArea.x, chartArea.y);
            context.lineTo(chartArea.x, chartArea.y + chartArea.height) }
            context.stroke(); }
        }
        
        // X軸
        if (axesOptions.x.show !== false) {
            context.beginPath();
            context.moveTo(chartArea.x, chartArea.y + chartArea.height);
            context.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height) }
            context.stroke(); }
}

    /**
     * グリッドの描画
     */''
    private renderGrid(context: LineChartContext, chartArea: LineChartArea, scales: LineChartScales, options: LineChartOptions): void {'
        const gridOptions = options.grid || {};
        const color = gridOptions.color || '#E5E7EB';
        const width = gridOptions.width || 0.5;
        
        context.strokeStyle = color;
        context.lineWidth = width;
        
        // 水平グリッド線
        if (gridOptions.y?.show !== false) {
            const ySteps = gridOptions.y?.count || 5,
            for (let, i = 0, i <= ySteps, i++) {
                const y = chartArea.y + (chartArea.height / ySteps) * i,
                context.beginPath();
                context.moveTo(chartArea.x, y);
                context.lineTo(chartArea.x + chartArea.width, y) }
                context.stroke(); }
}
        
        // 垂直グリッド線
        if (gridOptions.x?.show !== false) {
            const xSteps = gridOptions.x?.count || 5,
            for (let, i = 0, i <= xSteps, i++) {
                const x = chartArea.x + (chartArea.width / xSteps) * i,
                context.beginPath();
                context.moveTo(x, chartArea.y);
                context.lineTo(x, chartArea.y + chartArea.height) }
                context.stroke(); }
}
    }

    /**
     * 線の描画
     */ : undefined
    private renderLines(context: LineChartContext, data: ProcessedLineData[], chartArea: LineChartArea, scales: LineChartScales, options: LineChartOptions): LineData[] { ''
        if(data.length < 2) return [] }
        const lineOptions = options.lineOptions || {};
        const lineColor = options.lineColor || options.theme.colors.primary;
        const lineWidth = options.lineWidth || DEFAULT_LINE_OPTIONS.lineWidth!;
        
        context.strokeStyle = lineColor;

        context.lineWidth = lineWidth;
        context.lineCap = lineOptions.cap || 'round';
        context.lineJoin = lineOptions.join || 'round';
        
        // ラインスタイルの設定
        if (lineOptions.dashArray && lineOptions.dashArray.length > 0) { context.setLineDash(lineOptions.dashArray) } else { context.setLineDash([]) }
        
        const segments: LineSegment[] = [],
        
        context.beginPath();
        
        data.forEach((item, index) => {  const x = chartArea.x + (item.x - scales.xMin) * scales.xScale,
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale,
            
            if (index === 0) { }
                context.moveTo(x, y); }
            } else {  context.lineTo(x, y);
                // セグメント情報の記録
                const prevItem = data[index - 1],
                const prevX = chartArea.x + (prevItem.x - scales.xMin) * scales.xScale,
                const prevY = chartArea.y + chartArea.height - (prevItem.value - scales.yMin) * scales.yScale }
                segments.push({
            };
                    start: { x: prevX, y: prevY,)
                    end: { x, y };
                    length: calculateDistance({ x: prevX, y: prevY,, { x, y ) };
            }
        };

        context.stroke()';'
            style: 'solid'),
            segments;
        }];
    }

    /**
     * データポイントの描画
     */''
    private renderDataPoints(context: LineChartContext, data: ProcessedLineData[], chartArea: LineChartArea, scales: LineChartScales, options: LineChartOptions): PointData[] { ''
        if(!options.showPoints) return [] }
        const pointOptions = options.pointOptions || {};
        const pointRadius = options.pointRadius || DEFAULT_LINE_OPTIONS.pointRadius!;

        const pointColor = options.pointColor || options.theme.colors.primary;
        const borderColor = pointOptions.borderColor || '#FFFFFF';
        const borderWidth = pointOptions.borderWidth || POINT_CONFIG.DEFAULT_BORDER_WIDTH;
        
        const points: PointData[] = [],
        
        data.forEach((item, index) => {  const x = chartArea.x + (item.x - scales.xMin) * scales.xScale,
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale,
            
            // データポイントの描画
            context.fillStyle = item.color || pointColor,
            context.beginPath();
            context.arc(x, y, pointRadius, 0, 2 * Math.PI);
            context.fill();
            // ポイントの枠線
            if (borderWidth > 0) {
                context.strokeStyle = borderColor,
                context.lineWidth = borderWidth,
                context.stroke(' }''
                shape: 'circle') }
                data: item); 
    };
        
        return points;
    }

    /**
     * パフォーマンスメトリクスの取得
     */
    getPerformanceMetrics(): LineRenderPerformance {
        return { ...this.performance }

    /**
     * チャート設定のバリデーション
     */
    validateOptions(options: Partial<LineChartOptions>): LineValidationResult { const errors: LineValidationError[] = [],
        const warnings: LineValidationWarning[] = [],

        if(options.padding && (options.padding < 0 || options.padding > 100)) {
            errors.push({''
                field: 'padding',','
                message: 'Padding must be between 0 and 100',')',
                code: 'INVALID_PADDING'
            }

        if(options.lineWidth && (options.lineWidth < 0 || options.lineWidth > LINE_CONFIG.MAX_LINE_WIDTH)) { errors.push({''
                field: 'lineWidth'
            }''
                message: `Line width must be between 0 and ${LINE_CONFIG.MAX_LINE_WIDTH}`,')'
                code: 'INVALID_LINE_WIDTH'),
        }

        if(options.pointRadius && (options.pointRadius < POINT_CONFIG.MIN_RADIUS || options.pointRadius > POINT_CONFIG.MAX_RADIUS)) { warnings.push({)'
                field: 'pointRadius') }
                message: `Point radius is outside recommended range (${POINT_CONFIG.MIN_RADIUS}-${POINT_CONFIG.MAX_RADIUS}px}`,
                suggestion: `Use point radius between ${POINT_CONFIG.MIN_RADIUS} and ${POINT_CONFIG.MAX_RADIUS} pixels`'}'),
        }
        
        return { isValid: errors.length === 0,
            errors };
            warnings }
        }'}'