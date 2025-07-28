/**
 * グラフ描画エンジンクラス
 * Canvas 2D APIを使用してさまざまなタイプのグラフを描画する
 */
export class ChartRenderer {
    constructor() {
        // グラフタイプごとのレンダラー
        this.chartTypes = {
            bar: new BarChartRenderer(),
            line: new LineChartRenderer(),
            pie: new PieChartRenderer(),
            area: new AreaChartRenderer(),
            scatter: new ScatterChartRenderer(),
            progress: new ProgressBarRenderer()
        };
        
        // アニメーションエンジン
        this.animationEngine = new ChartAnimationEngine();
        
        // インタラクションマネージャー
        this.interactionManager = new ChartInteractionManager();
        
        // テーマとスタイル設定
        this.defaultTheme = this.createDefaultTheme();
        this.currentTheme = this.defaultTheme;
        
        // レスポンシブ設定
        this.responsiveBreakpoints = {
            small: 480,
            medium: 768,
            large: 1024
        };
        
        // パフォーマンス設定
        this.performanceConfig = {
            maxDataPoints: 1000,
            animationFrameLimit: 60,
            cacheEnabled: true
        };
        
        // レンダリングキャッシュ
        this.renderCache = new Map();
    }
    
    /**
     * メインの描画メソッド
     */
    render(context, type, data, options = {}) {
        try {
            // 入力検証
            if (!this.validateInput(context, type, data)) {
                throw new Error('Invalid input parameters');
            }
            
            // レンダラーの取得
            const renderer = this.chartTypes[type];
            if (!renderer) {
                throw new Error(`Unsupported chart type: ${type}`);
            }
            
            // オプションの統合
            const mergedOptions = this.mergeOptions(options);
            
            // レスポンシブ調整
            const responsiveOptions = this.applyResponsiveSettings(context, mergedOptions);
            
            // キャッシュチェック
            const cacheKey = this.generateCacheKey(type, data, responsiveOptions);
            if (this.performanceConfig.cacheEnabled && this.renderCache.has(cacheKey)) {
                const cached = this.renderCache.get(cacheKey);
                if (this.isCacheValid(cached)) {
                    return this.applyCachedRender(context, cached);
                }
            }
            
            // コンテキストの準備
            this.prepareContext(context, responsiveOptions);
            
            // データの前処理
            const processedData = this.preprocessData(data, type, responsiveOptions);
            
            // レンダリング結果
            let renderResult;
            
            // アニメーション対応
            if (responsiveOptions.animated) {
                renderResult = this.animationEngine.animateChart(
                    context, renderer, processedData, responsiveOptions
                );
            } else {
                renderResult = renderer.render(context, processedData, responsiveOptions);
            }
            
            // インタラクション設定
            if (responsiveOptions.interactive) {
                this.interactionManager.setupInteractions(
                    context.canvas, renderResult, responsiveOptions
                );
            }
            
            // アクセシビリティ設定
            this.setupAccessibility(context, renderResult, responsiveOptions);
            
            // レンダリング結果をキャッシュ
            if (this.performanceConfig.cacheEnabled) {
                this.cacheRenderResult(cacheKey, renderResult, context);
            }
            
            return renderResult;
            
        } catch (error) {
            console.error('Chart rendering failed:', error);
            return this.renderErrorChart(context, error.message, options);
        }
    }
    
    /**
     * 複数グラフの同時描画
     */
    renderMultiple(context, charts, layout = 'grid') {
        const layoutManager = new ChartLayoutManager();
        
        // レイアウト計算
        const layoutConfig = layoutManager.calculateLayout(
            context, charts.length, layout
        );
        
        const results = [];
        
        charts.forEach((chart, index) => {
            const chartArea = layoutConfig.areas[index];
            
            // サブコンテキストの作成
            const subContext = this.createSubContext(context, chartArea);
            
            // 個別チャートの描画
            const result = this.render(
                subContext, 
                chart.type, 
                chart.data, 
                { ...chart.options, area: chartArea }
            );
            
            results.push(result);
        });
        
        return {
            type: 'multiple',
            layout: layout,
            charts: results,
            totalArea: layoutConfig.totalArea
        };
    }
    
    /**
     * テーマの設定
     */
    setTheme(theme) {
        if (typeof theme === 'string') {
            this.currentTheme = this.getPresetTheme(theme);
        } else {
            this.currentTheme = { ...this.defaultTheme, ...theme };
        }
        
        // レンダリングキャッシュをクリア
        this.clearCache();
    }
    
    /**
     * レスポンシブ設定の適用
     */
    applyResponsiveSettings(context, options) {
        const canvas = context.canvas;
        const width = canvas.width;
        
        let breakpoint = 'large';
        if (width <= this.responsiveBreakpoints.small) {
            breakpoint = 'small';
        } else if (width <= this.responsiveBreakpoints.medium) {
            breakpoint = 'medium';
        }
        
        const responsiveOptions = { ...options };
        
        // ブレークポイント別設定
        switch (breakpoint) {
            case 'small':
                responsiveOptions.fontSize = Math.max(10, options.fontSize * 0.8);
                responsiveOptions.padding = Math.max(5, options.padding * 0.7);
                responsiveOptions.showLegend = false;
                responsiveOptions.showGrid = false;
                break;
                
            case 'medium':
                responsiveOptions.fontSize = Math.max(12, options.fontSize * 0.9);
                responsiveOptions.padding = Math.max(10, options.padding * 0.85);
                responsiveOptions.showLegend = true;
                responsiveOptions.showGrid = true;
                break;
                
            case 'large':
                // デフォルト設定を使用
                break;
        }
        
        responsiveOptions.breakpoint = breakpoint;
        return responsiveOptions;
    }
    
    /**
     * データの前処理
     */
    preprocessData(data, type, options) {
        if (!data || data.length === 0) {
            return this.createEmptyDataset(type);
        }
        
        let processedData = Array.isArray(data) ? [...data] : [data];
        
        // データポイント数制限
        if (processedData.length > this.performanceConfig.maxDataPoints) {
            processedData = this.downsampleData(processedData, this.performanceConfig.maxDataPoints);
        }
        
        // データの正規化
        processedData = this.normalizeData(processedData, type);
        
        // 欠損値の処理
        processedData = this.handleMissingValues(processedData, options);
        
        return processedData;
    }
    
    /**
     * デフォルトテーマの作成
     */
    createDefaultTheme() {
        return {
            colors: {
                primary: '#3B82F6',
                secondary: '#8B5CF6',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                info: '#06B6D4',
                light: '#F8FAFC',
                dark: '#1E293B'
            },
            palette: [
                '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
                '#EF4444', '#06B6D4', '#8D4654', '#7C3AED'
            ],
            fonts: {
                family: 'system-ui, -apple-system, sans-serif',
                size: {
                    small: 10,
                    normal: 12,
                    large: 14,
                    title: 16
                },
                weight: {
                    normal: 'normal',
                    bold: 'bold'
                }
            },
            spacing: {
                padding: 20,
                margin: 10,
                gap: 5
            },
            borders: {
                width: 1,
                radius: 4,
                style: 'solid'
            },
            shadows: {
                light: '0 1px 3px rgba(0, 0, 0, 0.1)',
                medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
                heavy: '0 10px 15px rgba(0, 0, 0, 0.1)'
            },
            animation: {
                duration: 800,
                easing: 'easeInOutCubic'
            }
        };
    }
    
    /**
     * オプションのマージ
     */
    mergeOptions(options) {
        const defaultOptions = {
            width: 400,
            height: 300,
            padding: this.currentTheme.spacing.padding,
            fontSize: this.currentTheme.fonts.size.normal,
            fontFamily: this.currentTheme.fonts.family,
            backgroundColor: '#FFFFFF',
            showLegend: true,
            showGrid: true,
            showAxes: true,
            showTooltip: true,
            animated: false,
            interactive: true,
            responsive: true,
            accessibility: true
        };
        
        return { ...defaultOptions, ...options, theme: this.currentTheme };
    }
    
    /**
     * コンテキストの準備
     */
    prepareContext(context, options) {
        // 高DPI対応
        const devicePixelRatio = window.devicePixelRatio || 1;
        const canvas = context.canvas;
        
        if (devicePixelRatio !== 1) {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;
            context.scale(devicePixelRatio, devicePixelRatio);
        }
        
        // アンチエイリアシング設定
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        // 背景色設定
        if (options.backgroundColor) {
            context.fillStyle = options.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // フォント設定
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.textAlign = 'left';
        context.textBaseline = 'top';
    }
    
    /**
     * エラーチャートの描画
     */
    renderErrorChart(context, errorMessage, options) {
        const mergedOptions = this.mergeOptions(options);
        this.prepareContext(context, mergedOptions);
        
        const canvas = context.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // エラーアイコン
        context.fillStyle = this.currentTheme.colors.danger;
        context.fillRect(centerX - 20, centerY - 30, 40, 4);
        context.fillRect(centerX - 2, centerY - 15, 4, 20);
        context.fillRect(centerX - 2, centerY + 10, 4, 4);
        
        // エラーメッセージ
        context.fillStyle = this.currentTheme.colors.dark;
        context.font = `${mergedOptions.fontSize}px ${mergedOptions.fontFamily}`;
        context.textAlign = 'center';
        context.fillText('グラフの描画に失敗しました', centerX, centerY + 30);
        context.fillText(errorMessage, centerX, centerY + 50);
        
        return {
            type: 'error',
            message: errorMessage,
            timestamp: Date.now()
        };
    }
    
    /**
     * アクセシビリティ設定
     */
    setupAccessibility(context, renderResult, options) {
        if (!options.accessibility) return;
        
        const canvas = context.canvas;
        
        // ARIA属性の設定
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', this.generateAriaLabel(renderResult, options));
        
        // 代替テキストの生成
        const altText = this.generateAltText(renderResult, options);
        canvas.setAttribute('aria-describedby', 'chart-description');
        
        // 説明要素の作成（既存の要素がない場合）
        let descElement = document.getElementById('chart-description');
        if (!descElement) {
            descElement = document.createElement('div');
            descElement.id = 'chart-description';
            descElement.className = 'sr-only';
            descElement.style.position = 'absolute';
            descElement.style.left = '-10000px';
            document.body.appendChild(descElement);
        }
        descElement.textContent = altText;
    }
    
    /**
     * ヘルパーメソッド群
     */
    validateInput(context, type, data) {
        return context && 
               context.getContext && 
               typeof type === 'string' && 
               type.length > 0 && 
               data !== null && 
               data !== undefined;
    }
    
    generateCacheKey(type, data, options) {
        const dataHash = this.hashData(data);
        const optionsHash = this.hashObject(options);
        return `${type}_${dataHash}_${optionsHash}`;
    }
    
    hashData(data) {
        return btoa(JSON.stringify(data)).slice(0, 16);
    }
    
    hashObject(obj) {
        return btoa(JSON.stringify(obj)).slice(0, 16);
    }
    
    isCacheValid(cached) {
        return Date.now() - cached.timestamp < 300000; // 5分間有効
    }
    
    applyCachedRender(context, cached) {
        const canvas = context.canvas;
        context.drawImage(cached.canvas, 0, 0, canvas.width, canvas.height);
        return cached.result;
    }
    
    cacheRenderResult(key, result, context) {
        const cacheCanvas = document.createElement('canvas');
        const cacheContext = cacheCanvas.getContext('2d');
        cacheCanvas.width = context.canvas.width;
        cacheCanvas.height = context.canvas.height;
        cacheContext.drawImage(context.canvas, 0, 0);
        
        this.renderCache.set(key, {
            result: result,
            canvas: cacheCanvas,
            timestamp: Date.now()
        });
        
        // キャッシュサイズ制限
        if (this.renderCache.size > 50) {
            const oldestKey = this.renderCache.keys().next().value;
            this.renderCache.delete(oldestKey);
        }
    }
    
    clearCache() {
        this.renderCache.clear();
    }
    
    createSubContext(context, area) {
        // サブコンテキストの作成（簡略化）
        return context;
    }
    
    downsampleData(data, maxPoints) {
        if (data.length <= maxPoints) return data;
        
        const step = Math.ceil(data.length / maxPoints);
        return data.filter((_, index) => index % step === 0);
    }
    
    normalizeData(data, type) {
        // データの正規化（型に応じて）
        return data.map(item => {
            if (typeof item === 'number') {
                return { value: item, label: item.toString() };
            }
            return item;
        });
    }
    
    handleMissingValues(data, options) {
        // 欠損値の処理
        return data.filter(item => 
            item !== null && 
            item !== undefined && 
            (typeof item === 'object' ? item.value !== null && item.value !== undefined : true)
        );
    }
    
    createEmptyDataset(type) {
        return [];
    }
    
    getPresetTheme(themeName) {
        const presets = {
            dark: {
                ...this.defaultTheme,
                colors: {
                    ...this.defaultTheme.colors,
                    primary: '#60A5FA',
                    light: '#1E293B',
                    dark: '#F8FAFC'
                }
            },
            minimal: {
                ...this.defaultTheme,
                colors: {
                    ...this.defaultTheme.colors,
                    primary: '#000000'
                },
                palette: ['#000000', '#666666', '#CCCCCC']
            }
        };
        
        return presets[themeName] || this.defaultTheme;
    }
    
    generateAriaLabel(renderResult, options) {
        return `${renderResult.type}グラフ：${renderResult.dataPoints || 0}個のデータポイント`;
    }
    
    generateAltText(renderResult, options) {
        let description = `${renderResult.type}グラフが表示されています。`;
        
        if (renderResult.dataPoints) {
            description += `${renderResult.dataPoints}個のデータポイントがあります。`;
        }
        
        if (renderResult.min !== undefined && renderResult.max !== undefined) {
            description += `値の範囲は${renderResult.min}から${renderResult.max}です。`;
        }
        
        return description;
    }
}

/**
 * チャートアニメーションエンジン
 */
class ChartAnimationEngine {
    constructor() {
        this.animations = new Map();
        this.isAnimating = false;
    }
    
    animateChart(context, renderer, data, options) {
        // アニメーション実装（簡略化）
        return renderer.render(context, data, options);
    }
}

/**
 * チャートインタラクションマネージャー
 */
class ChartInteractionManager {
    constructor() {
        this.activeInteractions = new Map();
    }
    
    setupInteractions(canvas, renderResult, options) {
        // インタラクション設定（簡略化）
        if (options.showTooltip) {
            this.setupTooltips(canvas, renderResult);
        }
    }
    
    setupTooltips(canvas, renderResult) {
        // ツールチップ設定（簡略化）
    }
}

/**
 * チャートレイアウトマネージャー
 */
class ChartLayoutManager {
    calculateLayout(context, chartCount, layout) {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // グリッドレイアウトの計算
        const cols = Math.ceil(Math.sqrt(chartCount));
        const rows = Math.ceil(chartCount / cols);
        
        const chartWidth = width / cols;
        const chartHeight = height / rows;
        
        const areas = [];
        for (let i = 0; i < chartCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            areas.push({
                x: col * chartWidth,
                y: row * chartHeight,
                width: chartWidth,
                height: chartHeight
            });
        }
        
        return {
            areas: areas,
            totalArea: { width, height }
        };
    }
}

/**
 * 棒グラフレンダラー
 */
class BarChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if (options.showAxes) {
                this.renderAxes(context, chartArea, scales, options);
            }
            
            // グリッドの描画
            if (options.showGrid) {
                this.renderGrid(context, chartArea, scales, options);
            }
            
            // バーの描画
            const bars = this.renderBars(context, processedData, chartArea, scales, options);
            
            // 凡例の描画
            if (options.showLegend && processedData.some(d => d.series)) {
                this.renderLegend(context, processedData, chartArea, options);
            }
            
            return {
                type: 'bar',
                dataPoints: processedData.length,
                min: scales.yMin,
                max: scales.yMax,
                bars: bars,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Bar chart rendering failed:', error);
            return { type: 'bar', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return { value: item, label: `Item ${index + 1}`, index };
            }
            return { ...item, index };
        });
    }
    
    calculateScales(data, chartArea) {
        const values = data.map(d => d.value);
        const yMin = Math.min(0, Math.min(...values));
        const yMax = Math.max(...values);
        const yRange = yMax - yMin;
        
        return {
            xScale: chartArea.width / data.length,
            yScale: chartArea.height / (yRange || 1),
            yMin,
            yMax,
            yRange
        };
    }
    
    renderAxes(context, chartArea, scales, options) {
        context.strokeStyle = options.theme.colors.dark;
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
        context.stroke();
    }
    
    renderGrid(context, chartArea, scales, options) {
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
            context.stroke();
        }
    }
    
    renderBars(context, data, chartArea, scales, options) {
        const barWidth = scales.xScale * 0.8;
        const barGap = scales.xScale * 0.1;
        const bars = [];
        
        data.forEach((item, index) => {
            const barHeight = Math.abs(item.value) * scales.yScale;
            const x = chartArea.x + (index * scales.xScale) + barGap;
            const y = item.value >= 0 
                ? chartArea.y + chartArea.height - barHeight
                : chartArea.y + chartArea.height;
            
            // バーの描画
            context.fillStyle = item.color || options.theme.palette[index % options.theme.palette.length];
            context.fillRect(x, y, barWidth, barHeight);
            
            // バーの枠線
            context.strokeStyle = options.theme.colors.dark;
            context.lineWidth = 1;
            context.strokeRect(x, y, barWidth, barHeight);
            
            // ラベルの描画
            if (item.label) {
                context.fillStyle = options.theme.colors.dark;
                context.font = `${options.fontSize}px ${options.fontFamily}`;
                context.textAlign = 'center';
                context.fillText(item.label, x + barWidth / 2, chartArea.y + chartArea.height + 15);
            }
            
            bars.push({ x, y, width: barWidth, height: barHeight, value: item.value });
        });
        
        return bars;
    }
    
    renderLegend(context, data, chartArea, options) {
        // 凡例実装（簡略化）
        const legendY = chartArea.y - 10;
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.fillStyle = options.theme.colors.dark;
        context.textAlign = 'left';
        context.fillText('凡例', chartArea.x, legendY);
    }
}

/**
 * 線グラフレンダラー
 */
class LineChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if (options.showAxes) {
                this.renderAxes(context, chartArea, scales, options);
            }
            
            // グリッドの描画
            if (options.showGrid) {
                this.renderGrid(context, chartArea, scales, options);
            }
            
            // 線の描画
            const lines = this.renderLines(context, processedData, chartArea, scales, options);
            
            // データポイントの描画
            this.renderDataPoints(context, processedData, chartArea, scales, options);
            
            return {
                type: 'line',
                dataPoints: processedData.length,
                min: scales.yMin,
                max: scales.yMax,
                lines: lines,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Line chart rendering failed:', error);
            return { type: 'line', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return { value: item, x: index, label: `Point ${index + 1}` };
            }
            return { ...item, x: item.x || index };
        });
    }
    
    calculateScales(data, chartArea) {
        const values = data.map(d => d.value);
        const xValues = data.map(d => d.x);
        
        const yMin = Math.min(...values);
        const yMax = Math.max(...values);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        
        return {
            xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax
        };
    }
    
    renderAxes(context, chartArea, scales, options) {
        context.strokeStyle = options.theme.colors.dark;
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
        context.stroke();
    }
    
    renderGrid(context, chartArea, scales, options) {
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
            context.stroke();
        }
        
        // 垂直グリッド線
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const x = chartArea.x + (chartArea.width / xSteps) * i;
            context.beginPath();
            context.moveTo(x, chartArea.y);
            context.lineTo(x, chartArea.y + chartArea.height);
            context.stroke();
        }
    }
    
    renderLines(context, data, chartArea, scales, options) {
        if (data.length < 2) return [];
        
        context.strokeStyle = options.lineColor || options.theme.colors.primary;
        context.lineWidth = options.lineWidth || 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        
        data.forEach((item, index) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale;
            
            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        });
        
        context.stroke();
        
        return [{ path: data, color: context.strokeStyle }];
    }
    
    renderDataPoints(context, data, chartArea, scales, options) {
        const pointRadius = options.pointRadius || 4;
        
        data.forEach((item, index) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale;
            
            // データポイント
            context.fillStyle = options.pointColor || options.theme.colors.primary;
            context.beginPath();
            context.arc(x, y, pointRadius, 0, 2 * Math.PI);
            context.fill();
            
            // ポイントの枠線
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.stroke();
        });
    }
}

/**
 * 円グラフレンダラー
 */
class PieChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // 円グラフの描画
            const slices = this.renderSlices(context, processedData, chartArea, options);
            
            // ラベルの描画
            if (options.showLabels !== false) {
                this.renderLabels(context, processedData, slices, chartArea, options);
            }
            
            // 凡例の描画
            if (options.showLegend) {
                this.renderLegend(context, processedData, chartArea, options);
            }
            
            return {
                type: 'pie',
                dataPoints: processedData.length,
                slices: slices,
                total: processedData.reduce((sum, item) => sum + item.value, 0),
                chartArea: chartArea
            };
            
        } catch (error) {
            console.error('Pie chart rendering failed:', error);
            return { type: 'pie', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        const size = Math.min(canvas.width, canvas.height) - (padding * 2);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        return {
            centerX,
            centerY,
            radius: size / 2,
            size
        };
    }
    
    processData(data) {
        const total = data.reduce((sum, item) => {
            const value = typeof item === 'number' ? item : item.value;
            return sum + Math.abs(value);
        }, 0);
        
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return {
                    value: item,
                    label: `Slice ${index + 1}`,
                    percentage: (item / total) * 100
                };
            }
            return {
                ...item,
                percentage: (item.value / total) * 100
            };
        });
    }
    
    renderSlices(context, data, chartArea, options) {
        const slices = [];
        let currentAngle = -Math.PI / 2; // 12時位置から開始
        
        data.forEach((item, index) => {
            const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // スライスの描画
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(chartArea.centerX, chartArea.centerY);
            context.arc(
                chartArea.centerX, 
                chartArea.centerY, 
                chartArea.radius, 
                currentAngle, 
                currentAngle + sliceAngle
            );
            context.closePath();
            context.fill();
            
            // スライスの枠線
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.stroke();
            
            slices.push({
                startAngle: currentAngle,
                endAngle: currentAngle + sliceAngle,
                angle: sliceAngle,
                color: color,
                value: item.value,
                percentage: item.percentage,
                label: item.label
            });
            
            currentAngle += sliceAngle;
        });
        
        return slices;
    }
    
    renderLabels(context, data, slices, chartArea, options) {
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        slices.forEach((slice, index) => {
            const midAngle = slice.startAngle + (slice.angle / 2);
            const labelRadius = chartArea.radius * 0.7;
            
            const x = chartArea.centerX + Math.cos(midAngle) * labelRadius;
            const y = chartArea.centerY + Math.sin(midAngle) * labelRadius;
            
            // パーセンテージ表示
            context.fillStyle = '#FFFFFF';
            context.fillText(`${slice.percentage.toFixed(1)}%`, x, y);
        });
    }
    
    renderLegend(context, data, chartArea, options) {
        const legendX = chartArea.centerX + chartArea.radius + 20;
        let legendY = chartArea.centerY - (data.length * 20) / 2;
        
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        
        data.forEach((item, index) => {
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // 色サンプル
            context.fillStyle = color;
            context.fillRect(legendX, legendY - 8, 16, 16);
            
            // ラベル
            context.fillStyle = options.theme.colors.dark;
            context.fillText(item.label, legendX + 24, legendY);
            
            legendY += 24;
        });
    }
}

/**
 * エリアグラフレンダラー
 */
class AreaChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if (options.showAxes) {
                this.renderAxes(context, chartArea, scales, options);
            }
            
            // グリッドの描画
            if (options.showGrid) {
                this.renderGrid(context, chartArea, scales, options);
            }
            
            // エリアの描画
            const areas = this.renderAreas(context, processedData, chartArea, scales, options);
            
            return {
                type: 'area',
                dataPoints: processedData.length,
                min: scales.yMin,
                max: scales.yMax,
                areas: areas,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Area chart rendering failed:', error);
            return { type: 'area', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return { value: item, x: index };
            }
            return { ...item, x: item.x || index };
        });
    }
    
    calculateScales(data, chartArea) {
        const values = data.map(d => d.value);
        const xValues = data.map(d => d.x);
        
        const yMin = Math.min(0, Math.min(...values));
        const yMax = Math.max(...values);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        
        return {
            xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax
        };
    }
    
    renderAxes(context, chartArea, scales, options) {
        context.strokeStyle = options.theme.colors.dark;
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
        context.stroke();
    }
    
    renderGrid(context, chartArea, scales, options) {
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
            context.stroke();
        }
    }
    
    renderAreas(context, data, chartArea, scales, options) {
        if (data.length < 2) return [];
        
        const baseY = chartArea.y + chartArea.height;
        
        // エリアパスの作成
        context.beginPath();
        
        // 底辺の開始点
        const firstX = chartArea.x + (data[0].x - scales.xMin) * scales.xScale;
        context.moveTo(firstX, baseY);
        
        // 上辺のパス
        data.forEach((item) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale;
            context.lineTo(x, y);
        });
        
        // 底辺に戻る
        const lastX = chartArea.x + (data[data.length - 1].x - scales.xMin) * scales.xScale;
        context.lineTo(lastX, baseY);
        context.closePath();
        
        // エリアの塗りつぶし
        const gradient = context.createLinearGradient(0, chartArea.y, 0, baseY);
        gradient.addColorStop(0, options.areaColor || options.theme.colors.primary + '80');
        gradient.addColorStop(1, options.areaColor || options.theme.colors.primary + '20');
        
        context.fillStyle = gradient;
        context.fill();
        
        // 境界線の描画
        context.strokeStyle = options.lineColor || options.theme.colors.primary;
        context.lineWidth = 2;
        context.stroke();
        
        return [{ path: data, gradient: gradient }];
    }
}

/**
 * 散布図レンダラー
 */
class ScatterChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if (options.showAxes) {
                this.renderAxes(context, chartArea, scales, options);
            }
            
            // グリッドの描画
            if (options.showGrid) {
                this.renderGrid(context, chartArea, scales, options);
            }
            
            // 散布点の描画
            const points = this.renderPoints(context, processedData, chartArea, scales, options);
            
            return {
                type: 'scatter',
                dataPoints: processedData.length,
                xMin: scales.xMin,
                xMax: scales.xMax,
                yMin: scales.yMin,
                yMax: scales.yMax,
                points: points,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Scatter chart rendering failed:', error);
            return { type: 'scatter', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return { x: index, y: item, size: 5 };
            }
            return { 
                x: item.x || index, 
                y: item.y || item.value || 0,
                size: item.size || 5,
                label: item.label
            };
        });
    }
    
    calculateScales(data, chartArea) {
        const xValues = data.map(d => d.x);
        const yValues = data.map(d => d.y);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        return {
            xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax
        };
    }
    
    renderAxes(context, chartArea, scales, options) {
        context.strokeStyle = options.theme.colors.dark;
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
        context.stroke();
    }
    
    renderGrid(context, chartArea, scales, options) {
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
            context.stroke();
        }
        
        // 垂直グリッド線
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const x = chartArea.x + (chartArea.width / xSteps) * i;
            context.beginPath();
            context.moveTo(x, chartArea.y);
            context.lineTo(x, chartArea.y + chartArea.height);
            context.stroke();
        }
    }
    
    renderPoints(context, data, chartArea, scales, options) {
        const points = [];
        
        data.forEach((item, index) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.y - scales.yMin) * scales.yScale;
            const radius = item.size || 5;
            
            // 散布点の描画
            context.fillStyle = item.color || options.theme.palette[index % options.theme.palette.length];
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            
            // 点の枠線
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 1;
            context.stroke();
            
            points.push({
                x: x,
                y: y,
                radius: radius,
                dataX: item.x,
                dataY: item.y,
                label: item.label
            });
        });
        
        return points;
    }
}

/**
 * プログレスバーレンダラー
 */
class ProgressBarRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // プログレスバーの描画
            const bars = this.renderProgressBars(context, processedData, chartArea, options);
            
            return {
                type: 'progress',
                dataPoints: processedData.length,
                bars: bars,
                chartArea: chartArea
            };
            
        } catch (error) {
            console.error('Progress bar rendering failed:', error);
            return { type: 'progress', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return {
                    value: Math.max(0, Math.min(100, item)),
                    label: `Progress ${index + 1}`,
                    max: 100
                };
            }
            return {
                value: Math.max(0, Math.min(item.max || 100, item.value || 0)),
                max: item.max || 100,
                label: item.label || `Progress ${index + 1}`
            };
        });
    }
    
    renderProgressBars(context, data, chartArea, options) {
        const barHeight = 30;
        const barSpacing = 10;
        const totalHeight = (barHeight + barSpacing) * data.length - barSpacing;
        const startY = chartArea.y + (chartArea.height - totalHeight) / 2;
        const bars = [];
        
        data.forEach((item, index) => {
            const y = startY + index * (barHeight + barSpacing);
            const progressWidth = (item.value / item.max) * chartArea.width;
            
            // 背景バー
            context.fillStyle = '#E5E7EB';
            context.fillRect(chartArea.x, y, chartArea.width, barHeight);
            
            // プログレスバー
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            context.fillStyle = color;
            context.fillRect(chartArea.x, y, progressWidth, barHeight);
            
            // 枠線
            context.strokeStyle = options.theme.colors.dark;
            context.lineWidth = 1;
            context.strokeRect(chartArea.x, y, chartArea.width, barHeight);
            
            // ラベルとパーセンテージ
            context.fillStyle = options.theme.colors.dark;
            context.font = `${options.fontSize}px ${options.fontFamily}`;
            context.textAlign = 'left';
            
            // ラベル
            context.fillText(item.label, chartArea.x, y - 5);
            
            // パーセンテージ
            const percentage = ((item.value / item.max) * 100).toFixed(1);
            context.textAlign = 'right';
            context.fillText(`${percentage}%`, chartArea.x + chartArea.width, y - 5);
            
            bars.push({
                x: chartArea.x,
                y: y,
                width: chartArea.width,
                height: barHeight,
                progressWidth: progressWidth,
                value: item.value,
                max: item.max,
                percentage: parseFloat(percentage)
            });
        });
        
        return bars;
    }
}