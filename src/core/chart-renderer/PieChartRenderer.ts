/**
 * PieChartRenderer
 * 
 * 円グラフレンダリング機能を担当
 * Chart Renderer Patternの一部として設計
 * 
 * **Features**:
 * - Pie chart rendering with slice customization
 * - Donut chart support and label positioning
 * - Interactive slice selection and highlighting
 * - 3D perspective and explosion effects
 * 
 * @module PieChartRenderer
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface PieChartContext extends CanvasRenderingContext2D {
    canvas: HTMLCanvasElement;
}

export interface PieChartData {
    value: number;
    label?: string;
    color?: string;
    category?: string;
    exploded?: boolean;
    metadata?: Record<string, any>;
}

export interface ProcessedPieData extends PieChartData {
    percentage: number;
    index: number;
    normalizedValue: number;
    sliceInfo?: SliceGeometry;
}

export interface PieChartOptions {
    padding?: number;
    showLabels?: boolean;
    showLegend?: boolean;
    showPercentages?: boolean;
    showValues?: boolean;
    fontSize?: number;
    fontFamily?: string;
    theme: PieChartTheme;
    sliceOptions?: SliceOptions;
    labelOptions?: PieLabelOptions;
    legendOptions?: PieLegendOptions;
    donutOptions?: DonutOptions;
    explosionOptions?: ExplosionOptions;
    animation?: PieAnimationOptions;
    interaction?: PieInteractionOptions;
}

export interface PieChartTheme {
    colors: PieThemeColors;
    palette: string[];
    background?: string;
    font?: PieFontTheme;
    sliceStyles?: SliceStyleTheme;
}

export interface PieThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
    background: string;
    text: string;
    border: string;
    shadow: string;
    highlight: string;
}

export interface PieFontTheme {
    family: string;
    size: number;
    weight: string;
    color: string;
    labelColor?: string;
    legendColor?: string;
}

export interface SliceStyleTheme {
    borderWidth: number;
    borderColor: string;
    shadowBlur: number;
    shadowColor: string;
    hoverScale: number;
}

export interface SliceOptions {
    borderWidth?: number;
    borderColor?: string;
    startAngle?: number;
    clockwise?: boolean;
    shadow?: SliceShadowOptions;
    gradient?: SliceGradientOptions;
    pattern?: SlicePatternOptions;
}

export interface SliceShadowOptions {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
}

export interface SliceGradientOptions {
    enabled: boolean;
    type: GradientType;
    stops: GradientStop[];
    angle?: number;
    center?: Point2D;
}

export interface GradientStop {
    position: number;
    color: string;
}

export interface SlicePatternOptions {
    enabled: boolean;
    type: PatternType;
    image?: HTMLImageElement;
    repeat?: PatternRepeat;
}

export interface PieLabelOptions {
    show?: boolean;
    position?: LabelPosition;
    format?: LabelFormat;
    font?: PieFontConfiguration;
    color?: string;
    offset?: number;
    connector?: ConnectorOptions;
    rotation?: LabelRotation;
    collision?: CollisionAvoidance;
}

export interface PieFontConfiguration {
    family?: string;
    size?: number;
    weight?: string;
    style?: string;
}

export interface ConnectorOptions {
    show: boolean;
    color: string;
    width: number;
    length: number;
    style: LineStyle;
}

export interface CollisionAvoidance {
    enabled: boolean;
    method: AvoidanceMethod;
    spacing: number;
}

export interface PieLegendOptions {
    show?: boolean;
    position?: PieLegendPosition;
    alignment?: PieLegendAlignment;
    itemGap?: number;
    symbolSize?: number;
    symbolShape?: SymbolShape;
    font?: PieFontConfiguration;
    color?: string;
    background?: string;
    border?: LegendBorderOptions;
    columns?: number;
}

export interface LegendBorderOptions {
    show: boolean;
    color: string;
    width: number;
    radius: number;
}

export interface DonutOptions {
    enabled?: boolean;
    innerRadius?: number;
    innerRadiusPercent?: number;
    centerLabel?: CenterLabelOptions;
    centerIcon?: CenterIconOptions;
}

export interface CenterLabelOptions {
    show: boolean;
    text: string;
    font?: PieFontConfiguration;
    color?: string;
    multiline?: boolean;
    maxWidth?: number;
}

export interface CenterIconOptions {
    show: boolean;
    icon: string;
    size: number;
    color?: string;
    image?: HTMLImageElement;
}

export interface ExplosionOptions {
    enabled?: boolean;
    distance?: number;
    slices?: number[];
    animation?: ExplosionAnimationOptions;
}

export interface ExplosionAnimationOptions {
    enabled: boolean;
    duration: number;
    easing: EasingFunction;
    stagger: number;
}

export interface PieAnimationOptions {
    enabled?: boolean;
    duration?: number;
    easing?: EasingFunction;
    delay?: number;
    type?: AnimationType;
    stagger?: number;
}

export interface PieInteractionOptions {
    hover?: PieHoverOptions;
    click?: PieClickOptions;
    selection?: SelectionOptions;
    tooltip?: PieTooltipOptions;
}

export interface PieHoverOptions {
    enabled?: boolean;
    scale?: number;
    explode?: boolean;
    explodeDistance?: number;
    highlightColor?: string;
    cursor?: string;
}

export interface PieClickOptions {
    enabled?: boolean;
    toggle?: boolean;
    explodeOnClick?: boolean;
    callback?: (slice: SliceData, event: MouseEvent) => void;
}

export interface SelectionOptions {
    enabled: boolean;
    multiple: boolean;
    highlightColor: string;
    selectedSlices: Set<number>;
}

export interface PieTooltipOptions {
    enabled?: boolean;
    format?: (slice: SliceData) => string;
    style?: PieTooltipStyle;
    position?: TooltipPosition;
}

export interface PieTooltipStyle {
    background?: string;
    color?: string;
    border?: string;
    borderRadius?: number;
    padding?: number;
    font?: PieFontConfiguration;
    shadow?: boolean;
}

export interface PieChartArea {
    centerX: number;
    centerY: number;
    radius: number;
    innerRadius?: number;
    size: number;
}

export interface SliceGeometry {
    startAngle: number;
    endAngle: number;
    angle: number;
    midAngle: number;
    radius: number;
    innerRadius?: number;
    centerX: number;
    centerY: number;
    explodeX?: number;
    explodeY?: number;
}

export interface SliceData {
    startAngle: number;
    endAngle: number;
    angle: number;
    midAngle: number;
    color: string;
    value: number;
    percentage: number;
    label?: string;
    category?: string;
    exploded: boolean;
    selected: boolean;
    geometry: SliceGeometry;
    data: ProcessedPieData;
}

export interface Point2D {
    x: number;
    y: number;
}

export interface PieRenderResult {
    type: ChartType;
    dataPoints: number;
    total: number;
    slices: SliceData[];
    chartArea: PieChartArea;
    performance?: PieRenderPerformance;
    error?: string;
}

export interface PieRenderPerformance {
    renderTime: number;
    dataProcessingTime: number;
    sliceDrawTime: number;
    labelDrawTime: number;
    legendDrawTime: number;
    memoryUsage?: number;
}

export interface PieValidationResult {
    isValid: boolean;
    errors: PieValidationError[];
    warnings: PieValidationWarning[];
}

export interface PieValidationError {
    field: string;
    message: string;
    code: string;
}

export interface PieValidationWarning {
    field: string;
    message: string;
    suggestion: string;
}

export interface LabelBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
}

// 列挙型
export type ChartType = 'pie' | 'donut' | 'semi-circle' | 'rose';
export type GradientType = 'linear' | 'radial' | 'conic';
export type PatternType = 'stripes' | 'dots' | 'grid' | 'diagonal' | 'custom';
export type PatternRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
export type LabelPosition = 'inside' | 'outside' | 'edge' | 'center';
export type LabelFormat = 'percentage' | 'value' | 'label' | 'both' | 'custom';
export type LabelRotation = 'none' | 'tangent' | 'radial' | 'horizontal';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type AvoidanceMethod = 'shift' | 'hide' | 'abbreviate';
export type PieLegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type PieLegendAlignment = 'start' | 'center' | 'end';
export type SymbolShape = 'square' | 'circle' | 'triangle' | 'diamond';
export type AnimationType = 'grow' | 'rotate' | 'fade' | 'slide' | 'bounce';
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type TooltipPosition = 'cursor' | 'slice' | 'center';

// 定数
export const DEFAULT_PIE_OPTIONS: Partial<PieChartOptions> = {
    padding: 20,
    showLabels: true,
    showLegend: false,
    showPercentages: true,
    showValues: false,
    fontSize: 12,
    fontFamily: 'Arial, sans-serif'
} as const;

export const DEFAULT_PIE_THEME: PieChartTheme = {
    colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        dark: '#1F2937',
        light: '#F9FAFB',
        background: '#FFFFFF',
        text: '#374151',
        border: '#E5E7EB',
        shadow: 'rgba(0, 0, 0, 0.1)',
        highlight: '#FBBF24'
    },
    palette: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#14B8A6',
        '#F472B6', '#A78BFA', '#34D399', '#FBBF24', '#FB7185'
    ],
    background: '#FFFFFF',
    sliceStyles: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowBlur: 4,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        hoverScale: 1.05
    }
} as const;

export const PIE_CONFIG = {
    MIN_SLICE_ANGLE: 0.01, // 最小スライス角度（ラジアン）
    DEFAULT_START_ANGLE: -Math.PI / 2, // 12時位置から開始
    MAX_SLICES: 20,
    MIN_RADIUS: 20,
    LABEL_OFFSET: 20,
    CONNECTOR_LENGTH: 15
} as const;

export const DONUT_CONFIG = {
    DEFAULT_INNER_RADIUS_PERCENT: 0.5,
    MIN_INNER_RADIUS_PERCENT: 0.1,
    MAX_INNER_RADIUS_PERCENT: 0.9
} as const;

export const EXPLOSION_CONFIG = {
    DEFAULT_DISTANCE: 10,
    MAX_DISTANCE: 50,
    ANIMATION_DURATION: 300
} as const;

// ユーティリティ関数
export function validatePieData(data: any[]): PieValidationResult {
    const errors: PieValidationError[] = [];
    const warnings: PieValidationWarning[] = [];

    if (!Array.isArray(data)) {
        errors.push({
            field: 'data',
            message: 'Pie chart data must be an array',
            code: 'INVALID_DATA_TYPE'
        });
        return { isValid: false, errors, warnings };
    }

    if (data.length === 0) {
        errors.push({
            field: 'data',
            message: 'Pie chart data cannot be empty',
            code: 'EMPTY_DATA'
        });
    }

    const hasNegativeValues = data.some(item => {
        const value = typeof item === 'number' ? item : item?.value;
        return typeof value === 'number' && value < 0;
    });

    if (hasNegativeValues) {
        errors.push({
            field: 'data.value',
            message: 'Pie chart data cannot contain negative values',
            code: 'NEGATIVE_VALUES'
        });
    }

    const hasInvalidValues = data.some(item => {
        const value = typeof item === 'number' ? item : item?.value;
        return typeof value !== 'number' || !isFinite(value);
    });

    if (hasInvalidValues) {
        errors.push({
            field: 'data.value',
            message: 'All data items must have valid numeric values',
            code: 'INVALID_VALUES'
        });
    }

    if (data.length > PIE_CONFIG.MAX_SLICES) {
        warnings.push({
            field: 'data',
            message: `Large number of slices (>${PIE_CONFIG.MAX_SLICES}) may affect readability`,
            suggestion: 'Consider grouping smaller slices into "Other" category'
        });
    }

    const total = data.reduce((sum, item) => {
        const value = typeof item === 'number' ? item : item?.value || 0;
        return sum + Math.abs(value);
    }, 0);

    if (total === 0) {
        errors.push({
            field: 'data',
            message: 'Total value cannot be zero',
            code: 'ZERO_TOTAL'
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function calculateAngle(value: number, total: number): number {
    return (value / total) * 2 * Math.PI;
}

export function calculateSlicePosition(centerX: number, centerY: number, radius: number, angle: number, explodeDistance: number = 0): Point2D {
    const x = centerX + Math.cos(angle) * (radius + explodeDistance);
    const y = centerY + Math.sin(angle) * (radius + explodeDistance);
    return { x, y };
}

export function isPointInSlice(point: Point2D, slice: SliceData): boolean {
    const { centerX, centerY } = slice.geometry;
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > slice.geometry.radius || (slice.geometry.innerRadius && distance < slice.geometry.innerRadius)) {
        return false;
    }
    
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;
    
    let startAngle = slice.startAngle;
    let endAngle = slice.endAngle;
    
    if (startAngle < 0) {
        startAngle += 2 * Math.PI;
        endAngle += 2 * Math.PI;
    }
    
    return angle >= startAngle && angle <= endAngle;
}

export function formatPieValue(value: number, format: LabelFormat, percentage?: number): string {
    switch (format) {
        case 'percentage':
            return `${(percentage || 0).toFixed(1)}%`;
        case 'value':
            return value.toLocaleString();
        case 'both':
            return `${value.toLocaleString()} (${(percentage || 0).toFixed(1)}%)`;
        default:
            return `${(percentage || 0).toFixed(1)}%`;
    }
}

export function generateSliceColors(count: number, baseColors: string[] = DEFAULT_PIE_THEME.palette): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

export function calculateOptimalRadius(width: number, height: number, padding: number): number {
    const availableSize = Math.min(width, height) - (padding * 2);
    return Math.max(PIE_CONFIG.MIN_RADIUS, availableSize / 2);
}

export class PieChartRenderer {
    private performance: PieRenderPerformance;

    constructor() {
        this.performance = {
            renderTime: 0,
            dataProcessingTime: 0,
            sliceDrawTime: 0,
            labelDrawTime: 0,
            legendDrawTime: 0
        };
    }

    /**
     * メインレンダリング関数
     */
    render(context: PieChartContext, data: (number | PieChartData)[], options: PieChartOptions): PieRenderResult {
        try {
            const startTime = performance.now();
            
            // データの検証
            const validation = validatePieData(data);
            if (!validation.isValid) {
                throw new Error(`Data validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }
            
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            
            // データ処理
            const dataStartTime = performance.now();
            const processedData = this.processData(data);
            this.performance.dataProcessingTime = performance.now() - dataStartTime;
            
            // スライスの描画
            const sliceStartTime = performance.now();
            const slices = this.renderSlices(context, processedData, chartArea, options);
            this.performance.sliceDrawTime = performance.now() - sliceStartTime;
            
            // ラベルの描画
            if (options.showLabels !== false) {
                const labelStartTime = performance.now();
                this.renderLabels(context, processedData, slices, chartArea, options);
                this.performance.labelDrawTime = performance.now() - labelStartTime;
            }
            
            // 凡例の描画
            if (options.showLegend) {
                const legendStartTime = performance.now();
                this.renderLegend(context, processedData, chartArea, options);
                this.performance.legendDrawTime = performance.now() - legendStartTime;
            }
            
            // ドーナツ中央のラベル
            if (options.donutOptions?.enabled && options.donutOptions.centerLabel?.show) {
                this.renderCenterLabel(context, chartArea, options);
            }
            
            this.performance.renderTime = performance.now() - startTime;

            const total = processedData.reduce((sum, item) => sum + item.value, 0);

            return {
                type: 'pie',
                dataPoints: processedData.length,
                total,
                slices,
                chartArea,
                performance: { ...this.performance }
            };
        } catch (error) {
            console.error('Pie chart rendering failed:', error);
            return {
                type: 'pie',
                dataPoints: 0,
                total: 0,
                slices: [],
                chartArea: { centerX: 0, centerY: 0, radius: 0, size: 0 },
                error: (error as Error).message
            };
        }
    }

    /**
     * チャートエリアの計算
     */
    private calculateChartArea(canvas: HTMLCanvasElement, options: PieChartOptions): PieChartArea {
        const padding = options.padding || DEFAULT_PIE_OPTIONS.padding!;
        const size = Math.min(canvas.width, canvas.height) - (padding * 2);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = calculateOptimalRadius(canvas.width, canvas.height, padding);

        let innerRadius: number | undefined;
        if (options.donutOptions?.enabled) {
            if (options.donutOptions.innerRadius) {
                innerRadius = options.donutOptions.innerRadius;
            } else {
                const percent = options.donutOptions.innerRadiusPercent || DONUT_CONFIG.DEFAULT_INNER_RADIUS_PERCENT;
                innerRadius = radius * Math.max(DONUT_CONFIG.MIN_INNER_RADIUS_PERCENT, Math.min(DONUT_CONFIG.MAX_INNER_RADIUS_PERCENT, percent));
            }
        }
        
        return {
            centerX,
            centerY,
            radius,
            innerRadius,
            size
        };
    }

    /**
     * データの前処理
     */
    private processData(data: (number | PieChartData)[]): ProcessedPieData[] {
        // Calculate total with explicit type handling
        let total = 0;
        for (const item of data) {
            const value = typeof item === 'number' ? item : (item.value || 0);
            total += Math.abs(value);
        }

        return data.map((item, index) => {
            if (typeof item === 'number') {
                return {
                    value: item,
                    label: `Slice ${index + 1}`,
                    percentage: (item / total) * 100,
                    index,
                    normalizedValue: item / total
                };
            } else {
                const itemValue = item.value || 0;
                return {
                    ...item,
                    value: itemValue,
                    percentage: (itemValue / total) * 100,
                    index,
                    normalizedValue: itemValue / total
                };
            }
        });
    }

    /**
     * スライスの描画
     */
    private renderSlices(context: PieChartContext, data: ProcessedPieData[], chartArea: PieChartArea, options: PieChartOptions): SliceData[] {
        const slices: SliceData[] = [];
        const sliceOptions = options.sliceOptions || {};
        const startAngle = sliceOptions.startAngle || PIE_CONFIG.DEFAULT_START_ANGLE;
        const clockwise = sliceOptions.clockwise !== false;
        
        let currentAngle = startAngle;
        
        data.forEach((item, index) => {
            const sliceAngle = calculateAngle(item.value, data.reduce((sum, d) => sum + d.value, 0));
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // 爆発効果の計算
            const exploded = item.exploded || false;
            const explodeDistance = exploded ? (options.explosionOptions?.distance || EXPLOSION_CONFIG.DEFAULT_DISTANCE) : 0;
            const midAngle = currentAngle + sliceAngle / 2;
            
            const slicePosition = calculateSlicePosition(chartArea.centerX, chartArea.centerY, 0, midAngle, explodeDistance);

            // スライスジオメトリの構築
            const geometry: SliceGeometry = {
                startAngle: currentAngle,
                endAngle: currentAngle + sliceAngle,
                angle: sliceAngle,
                midAngle,
                radius: chartArea.radius,
                innerRadius: chartArea.innerRadius,
                centerX: chartArea.centerX + slicePosition.x,
                centerY: chartArea.centerY + slicePosition.y
            };

            // スライスの描画
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(geometry.centerX, geometry.centerY);
            
            if (chartArea.innerRadius) {
                // ドーナツチャート
                context.arc(geometry.centerX, geometry.centerY, chartArea.radius, currentAngle, currentAngle + sliceAngle, !clockwise);
                context.arc(geometry.centerX, geometry.centerY, chartArea.innerRadius, currentAngle + sliceAngle, currentAngle, clockwise);
            } else {
                // 標準パイチャート
                context.arc(geometry.centerX, geometry.centerY, chartArea.radius, currentAngle, currentAngle + sliceAngle, !clockwise);
            }

            context.closePath();
            context.fill();

            const borderWidth = options.theme.sliceStyles?.borderWidth || 0;
            const borderColor = sliceOptions.borderColor || options.theme.sliceStyles?.borderColor || '#FFFFFF';
            if (borderWidth > 0) {
                context.strokeStyle = borderColor;
                context.lineWidth = borderWidth;
                context.stroke();
            }
            
            // 影の描画
            if (sliceOptions.shadow?.enabled) {
                context.shadowColor = sliceOptions.shadow.color;
                context.shadowBlur = sliceOptions.shadow.blur;
                context.shadowOffsetX = sliceOptions.shadow.offsetX;
                context.shadowOffsetY = sliceOptions.shadow.offsetY;
            }

            const sliceData: SliceData = {
                startAngle: currentAngle,
                endAngle: currentAngle + sliceAngle,
                angle: sliceAngle,
                midAngle,
                color,
                value: item.value,
                percentage: item.percentage,
                label: item.label,
                category: item.category,
                exploded,
                selected: false,
                geometry,
                data: item
            };

            slices.push(sliceData);

            currentAngle += clockwise ? sliceAngle : -sliceAngle;
        });

        // 影をリセット
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        
        return slices;
    }

    /**
     * ラベルの描画
     */
    private renderLabels(context: PieChartContext, data: ProcessedPieData[], slices: SliceData[], chartArea: PieChartArea, options: PieChartOptions): void {
        const labelOptions = options.labelOptions || {};
        const fontSize = options.fontSize || DEFAULT_PIE_OPTIONS.fontSize!;
        const fontFamily = options.fontFamily || DEFAULT_PIE_OPTIONS.fontFamily!;

        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = labelOptions.color || options.theme.colors.text;
        
        const labelBounds: LabelBounds[] = [];
        
        slices.forEach((slice, index) => {
            const labelRadius = chartArea.radius * 0.7; // 内側のラベル位置
            const x = slice.geometry.centerX + Math.cos(slice.midAngle) * labelRadius;
            const y = slice.geometry.centerY + Math.sin(slice.midAngle) * labelRadius;
            
            // フォーマットされたラベルの生成
            let labelText = '';
            const format = labelOptions.format || 'percentage';

            if (options.showPercentages && format !== 'value') {
                labelText = formatPieValue(slice.value, format, slice.percentage);
            } else if (options.showValues) {
                labelText = formatPieValue(slice.value, 'value');
            } else {
                labelText = slice.label || '';
            }
            
            // ラベルが十分な大きさのスライスにのみ表示
            if (slice.angle > PIE_CONFIG.MIN_SLICE_ANGLE && labelText) {
                // 背景の描画（可読性向上のため）
                const textMetrics = context.measureText(labelText);
                const textWidth = textMetrics.width;
                const textHeight = fontSize;

                context.fillStyle = 'rgba(255, 255, 255, 0.8)';
                context.fillRect(x - textWidth/2 - 4, y - textHeight/2 - 2, textWidth + 8, textHeight + 4);

                // テキストの描画
                context.fillStyle = labelOptions.color || options.theme.colors.dark;
                context.fillText(labelText, x, y);

                labelBounds.push({
                    x: x - textWidth/2,
                    y: y - textHeight/2,
                    width: textWidth,
                    height: textHeight,
                    text: labelText
                });
            }
        });
    }

    /**
     * 凡例の描画
     */
    private renderLegend(context: PieChartContext, data: ProcessedPieData[], chartArea: PieChartArea, options: PieChartOptions): void {
        const legendOptions = options.legendOptions || {};
        const fontSize = legendOptions.font?.size || options.fontSize || DEFAULT_PIE_OPTIONS.fontSize!;
        const fontFamily = legendOptions.font?.family || options.fontFamily || DEFAULT_PIE_OPTIONS.fontFamily!;
        const symbolSize = legendOptions.symbolSize || 16;
        const itemGap = legendOptions.itemGap || 24;

        const legendX = chartArea.centerX + chartArea.radius + 20;
        let legendY = chartArea.centerY - (data.length * itemGap) / 2;

        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = 'left';
        context.textBaseline = 'middle';

        data.forEach((item, index) => {
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // シンボルの描画
            const symbolShape = legendOptions.symbolShape || 'square';
            context.fillStyle = color;

            if (symbolShape === 'circle') {
                context.beginPath();
                context.arc(legendX + symbolSize/2, legendY, symbolSize/2, 0, 2 * Math.PI);
                context.fill();
            } else {
                context.fillRect(legendX, legendY - symbolSize/2, symbolSize, symbolSize);
            }
            
            // ラベルテキストの描画
            context.fillStyle = legendOptions.color || options.theme.colors.dark;
            const labelText = item.label || `Item ${index + 1}`;
            context.fillText(labelText, legendX + symbolSize + 8, legendY);
            
            legendY += itemGap;
        });
    }

    /**
     * ドーナツ中央ラベルの描画
     */
    private renderCenterLabel(context: PieChartContext, chartArea: PieChartArea, options: PieChartOptions): void {
        const centerLabel = options.donutOptions?.centerLabel;
        if (!centerLabel || !centerLabel.show) return;
        
        const fontSize = centerLabel.font?.size || options.fontSize || DEFAULT_PIE_OPTIONS.fontSize!;
        const fontFamily = centerLabel.font?.family || options.fontFamily || DEFAULT_PIE_OPTIONS.fontFamily!;

        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = centerLabel.color || options.theme.colors.text;

        const lines = centerLabel.multiline ? centerLabel.text.split('\n') : [centerLabel.text];
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        let startY = chartArea.centerY - totalHeight / 2;
        
        lines.forEach(line => {
            context.fillText(line, chartArea.centerX, startY + lineHeight / 2);
            startY += lineHeight;
        });
    }

    /**
     * パフォーマンスメトリクスの取得
     */
    getPerformanceMetrics(): PieRenderPerformance {
        return { ...this.performance };
    }

    /**
     * チャート設定のバリデーション
     */
    validateOptions(options: Partial<PieChartOptions>): PieValidationResult {
        const errors: PieValidationError[] = [];
        const warnings: PieValidationWarning[] = [];

        if (options.padding && (options.padding < 0 || options.padding > 100)) {
            errors.push({
                field: 'padding',
                message: 'Padding must be between 0 and 100',
                code: 'INVALID_PADDING'
            });
        }
        
        if (options.donutOptions?.innerRadiusPercent) {
            const percent = options.donutOptions.innerRadiusPercent;
            if (percent < DONUT_CONFIG.MIN_INNER_RADIUS_PERCENT || percent > DONUT_CONFIG.MAX_INNER_RADIUS_PERCENT) {
                errors.push({
                    field: 'donutOptions.innerRadiusPercent',
                    message: `Inner radius percent must be between ${DONUT_CONFIG.MIN_INNER_RADIUS_PERCENT} and ${DONUT_CONFIG.MAX_INNER_RADIUS_PERCENT}`,
                    code: 'INVALID_INNER_RADIUS'
                });
            }
        }
        
        if (options.explosionOptions?.distance) {
            const distance = options.explosionOptions.distance;
            if (distance > EXPLOSION_CONFIG.MAX_DISTANCE) {
                warnings.push({
                    field: 'explosionOptions.distance',
                    message: `Explosion distance is very high (>${EXPLOSION_CONFIG.MAX_DISTANCE}px)`,
                    suggestion: 'Consider using smaller explosion distance for better visual appearance'
                });
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}