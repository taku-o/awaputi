/**
 * ChartRenderer - グラフ描画メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたレンダラーを統制します。
 * Canvas 2D APIを使用してさまざまなタイプのグラフを描画する統合エンジンです。
 */

import { BarChartRenderer } from './chart-renderer/BarChartRenderer.js';
import { LineChartRenderer } from './chart-renderer/LineChartRenderer.js';
import { PieChartRenderer } from './chart-renderer/PieChartRenderer.js';
import { 
    ChartAnimationEngine, 
    ChartInteractionManager, 
    ChartLayoutManager,
    AreaChartRenderer,
    ScatterChartRenderer,
    ProgressBarRenderer 
} from './chart-renderer/ChartUtilities.js';

export class ChartRenderer {
    constructor() {
        // 専門化されたレンダラーを初期化
        this.chartTypes = {
            bar: new BarChartRenderer(),
            line: new LineChartRenderer(),
            pie: new PieChartRenderer(),
            area: new AreaChartRenderer(),
            scatter: new ScatterChartRenderer(),
            progress: new ProgressBarRenderer()
        };
        
        // 支援コンポーネントを初期化
        this.animationEngine = new ChartAnimationEngine();
        this.interactionManager = new ChartInteractionManager();
        this.layoutManager = new ChartLayoutManager();
        
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
        // レイアウト計算を専門コンポーネントに委譲
        const layoutConfig = this.layoutManager.calculateLayout(
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

    // 削除されたクラス定義は別ファイルに移動済み