import { getConfigurationManager  } from './ConfigurationManager.js';
import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { getBrowserCompatibility  } from '../utils/BrowserCompatibility.js';
import { ResponsiveCanvasManager  } from '../utils/ResponsiveCanvasManager.js';

interface Breakpoint { min?: number,
    max?: number;
    name: string;
    interface GameEngine { canvas?: HTMLCanvasElement,
    [key: string]: unknown;
    interface ConfigurationManager { [key: string]: unknown;
    interface ErrorHandler { [key: string]: unknown;
    interface DynamicLayout { currentBreakpoint: string,
    previousBreakpoint: string,
    transitionInProgress: boolean,
    transitionDuration: number,
    adaptiveScaling: boolean,
    mode: string,
    forceOrientation: string | null,
    container: {  }
        padding: { top: number, right: number, bottom: number, left: number,
        margin: { top: number, right: number, bottom: number, left: number,
        maxWidth: number | null  ,
        maxHeight: number | null,
    aspectRatio: number | null;
    }

interface SafeAreaManager { enabled: boolean;
    [key: string]: unknown;

/**
 * Advanced Responsive Layout Manager
 * 高度なレスポンシブレイアウト管理システム
 */
export class AdvancedResponsiveLayoutManager extends ResponsiveCanvasManager { private configManager: ConfigurationManager
    private errorHandler: ErrorHandler;
    private, advancedBreakpoints: Record<string, Breakpoint>,
    private dynamicLayout: DynamicLayout;
    private, safeAreaManager: SafeAreaManager;
    constructor(canvas: HTMLCanvasElement, gameEngine: GameEngine) {

        super(canvas, gameEngine);
    this.configManager = getConfigurationManager() };
        this.errorHandler = getErrorHandler('}'

            'xs': { max: 479, name: 'Extra Small'
            ,', 'sm': { min: 480, max: 767, name: 'Small'
            ,', 'md': { min: 768, max: 1023, name: 'Medium'
            ,', 'lg': { min: 1024, max: 1439, name: 'Large'
            ,', 'xl': { min: 1440, max: 1919, name: 'Extra Large'
            ,', 'xxl': { min: 1920, name: 'Extra Extra Large'
            };
        
        // 動的レイアウト設定
        this.dynamicLayout = {;
            currentBreakpoint: 'md,
            previousBreakpoint: 'md,
            transitionInProgress: false,
            transitionDuration: 300,
            adaptiveScaling: true;
            ','
            // レイアウトモード
           , mode: 'auto, // 'auto', 'portrait', 'landscape', 'fixed',
            forceOrientation: null;
            // コンテナ設定
            container: {  }
                padding: { top: 0, right: 0, bottom: 0, left: 0  ,
                margin: { top: 0, right: 0, bottom: 0, left: 0  ,
                maxWidth: null,
                maxHeight: null,
    aspectRatio: null;
    },
        
        // セーフエリア管理
        this.safeAreaManager = { enabled: true,
            insets: { top: 0, right: 0, bottom: 0, left: 0  ,
            constants: { ', 'safe-area-inset-top': 0,'
                'safe-area-inset-right': 0,
                'safe-area-inset-bottom': 0,
                'safe-area-inset-left': 0 },
            
            // セーフエリア検出方法
            detection: {;
                method: 'css-env', // 'css-env', 'viewport-fit', 'user-agent' }
                fallbackValues: { top: 44, bottom: 34, left: 0, right: 0  }
        };
        
        // 画面回転管理
        this.orientationManager = {;
            current: 'portrait,
            previous: 'portrait,
    locked: false,
            autoRotate: true,
            preferredOrientations: ['portrait', 'landscape'],
            preferredOrientations: ['portrait', 'landscape'] };
            // 回転アニメーション
            animation: { )
                enabled: true','  },
    duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1),
                inProgress: false;
        };
        // UI要素スケーリング
        this.uiScaling = { baseScale: 1.0,
            currentScale: 1.0,
            minScale: 0.5,
            maxScale: 2.0,
            autoScale: true;
            // 要素別スケーリング
            elements: {  }
                buttons: { scale: 1.0, minSize: 44  ,
                text: { scale: 1.0, minSize: 14  ,
                icons: { scale: 1.0, minSize: 24  ,
                spacing: { scale: 1.0, minSize: 8  }
        };
        
        // パフォーマンス最適化
        this.performance = { debounceTime: 100,
            throttleTime: 16, // 60fps,
            lastResizeTime: 0,
            resizeObserver: null,
            intersectionObserver: null;
            // キャッシュ
            cache: { measurements: new Map()  ,
                calculations: new Map(),
                lastUpdate: 0,
    ttl: 1000 // 1秒  }
        };
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        super.initialize?.(),
        
        try {
            // セーフエリア検出
            this.detectSafeArea();
            // 初期レイアウト計算
            this.calculateOptimalLayout();
            // オブザーバーの設定
            this.setupObservers();
            // イベントリスナーの拡張設定
            this.setupAdvancedEventListeners()','
            console.log('[AdvancedResponsiveLayoutManager] 高度なレスポンシブレイアウトマネージャーを初期化しました');

            ' }'

        } catch (error) { this.errorHandler.logError(error, { : undefined)'
                context: 'AdvancedResponsiveLayoutManager.initialize'
                }
}
    /**
     * セーフエリア検出
     */
    detectSafeArea() {
        const detection = this.safeAreaManager.detection,

        // CSS env()
        if(detection.method === 'css-env' && CSS.supports('padding: env(safe-area-inset-top))') {''
            const testElement = document.createElement('div),'
            testElement.style.cssText = ,
                position: fixed,
                top: 0,
                left: 0,
                width: 1px,
    height: 1px;
                padding-top: env(safe-area-inset-top,
                padding-right: env(safe-area-inset-right,
                padding-bottom: env(safe-area-inset-bottom,
                padding-left: env(safe-area-inset-left,
                pointer-events: none,
                visibility: hidden;
            ,
            
            document.body.appendChild(testElement);
            const computed = window.getComputedStyle(testElement);
            this.safeAreaManager.insets = {
                top: parseInt(computed.paddingTop, 10) || 0,
                right: parseInt(computed.paddingRight, 10) || 0,
                bottom: parseInt(computed.paddingBottom, 10) || 0 }
                left: parseInt(computed.paddingLeft, 10) || 0 }
            };
            
            document.body.removeChild(testElement);
        } 
        // フォールバック: デバイス固有の値
        else { ''
            const deviceInfo = getBrowserCompatibility()','
            if (deviceInfo.platform === 'ios' && deviceInfo.isMobile) {
                // iPhone X系の場合
                if (window.screen.height >= 812) {
            }
                    this.safeAreaManager.insets = detection.fallbackValues;     }
}
        ;
        // CSS変数として設定
        this.updateSafeAreaConstants()';'
        console.log('[AdvancedResponsiveLayoutManager] セーフエリア検出完了:', this.safeAreaManager.insets';'
    }
    
    /**
     * セーフエリア定数の更新'
     */''
    updateSafeAreaConstants()';'
        root.style.setProperty('--safe-area-inset-top', `${ insets.top'px`),'
        root.style.setProperty('--safe-area-inset-right', `${insets.right'px`),'
        root.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`};' }'

        root.style.setProperty('--safe-area-inset-left', `${insets.left}px`}';'
        ';'

        this.safeAreaManager.constants = { ', 'safe-area-inset-top': insets.top,'
            'safe-area-inset-right': insets.right,
            'safe-area-inset-bottom': insets.bottom,
            'safe-area-inset-left': insets.left }
    
    /**
     * 最適なレイアウトを計算
     */
    calculateOptimalLayout() {
        const viewport = this.getViewportInfo();
        const breakpoint = this.determineBreakpoint(viewport.width);
        // ブレークポイント変更チェック
        if (breakpoint !== this.dynamicLayout.currentBreakpoint) {
    }
            this.handleBreakpointChange(breakpoint); }
        }
        ;
        // レイアウト計算
        const layout = this.computeLayout(viewport, breakpoint);
        ';'
        // キャッシュに保存
        this.performance.cache.calculations.set('current-layout', {
                layout,
            timestamp: Date.now();
            viewport,
            breakpoint,
        
        return layout }
    
    /**
     * ビューポート情報を取得'
     */''
    getViewportInfo('';
        const, cacheKey = 'viewport-info';)
        const cached = this.performance.cache.measurements.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.performance.cache.ttl) { return cached.data }
        
        const viewport = { width: window.innerWidth,
            height: window.innerHeight,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: this.getOrientation(),
            // セーフエリアを考慮した実際の利用可能領域
            safeWidth: window.innerWidth - this.safeAreaManager.insets.left - this.safeAreaManager.insets.right,
    safeHeight: window.innerHeight - this.safeAreaManager.insets.top - this.safeAreaManager.insets.bottom  ,
        this.performance.cache.measurements.set(cacheKey, {
                data: viewport,
    timestamp: Date.now( 
            });
        
        return viewport;
    }
    
    /**
     * 画面の向きを取得
     */
    getOrientation() {

        if (screen.orientation) {
    }

            return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
        ';'
        // フォールバック
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    /**
     * ブレークポイントを決定
     */
    determineBreakpoint(width) {
        for(const [key, breakpoint] of Object.entries(this.advancedBreakpoints) {
            if (breakpoint.min !== undefined && breakpoint.max !== undefined) {
                if (width >= breakpoint.min && width <= breakpoint.max) {
    }
                    return key; else if (breakpoint.max !== undefined) { if (width <= breakpoint.max) {
                    return key, else if (breakpoint.min !== undefined) { ''
                if (width >= breakpoint.min) {
    
}
                    return key;

        }''
        return 'md'; // デフォルト
    }
    
    /**
     * ブレークポイント変更処理
     */
    handleBreakpointChange(newBreakpoint) {
        const oldBreakpoint = this.dynamicLayout.currentBreakpoint,
        
        this.dynamicLayout.previousBreakpoint = oldBreakpoint,
        this.dynamicLayout.currentBreakpoint = newBreakpoint,
        this.dynamicLayout.transitionInProgress = true,
        
        // トランジションアニメーション
        if (this.dynamicLayout.transitionDuration > 0) {
    }

            this.animateBreakpointTransition(oldBreakpoint, newBreakpoint); }
        }
        ';'
        // イベント発火
        this.dispatchLayoutEvent('breakpoint-change', { from: oldBreakpoint)
            to: newBreakpoint,
    viewport: this.getViewportInfo( };
        console.log(`[AdvancedResponsiveLayoutManager] ブレークポイント変更: ${oldBreakpoint} → ${newBreakpoint}`}
    }
    
    /**
     * ブレークポイント遷移アニメーション
     */
    animateBreakpointTransition(from, to) {
        const canvas = this.canvas }
        canvas.style.transition = `all ${this.dynamicLayout.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        setTimeout(() => { ''
            canvas.style.transition = ','
            this.dynamicLayout.transitionInProgress = false,

            this.dispatchLayoutEvent('breakpoint-transition-complete', { }
                from, to); }
            }
        }, this.dynamicLayout.transitionDuration);
    }
    
    /**
     * レイアウトを計算
     */
    computeLayout(viewport, breakpoint) {
        const config = this.getBreakpointConfig(breakpoint);
        const orientation = viewport.orientation,
        
        let layout = {
            breakpoint,
            orientation,
            viewport,
            
            // キャンバス設定
            canvas: {
                width: viewport.safeWidth ,
    height: viewport.safeHeight }
                scale: this.calculateScale(viewport, config);
                position: { x: 0, y: 0  ,
            
            // UI設定
            ui: { scale: this.calculateUIScale(viewport, config),
                spacing: this.calculateSpacing(viewport, config)  },
                elements: this.calculateElementSizes(viewport, config },
            
            // セーフエリア設定
            safeArea: { ...this.safeAreaManager.insets,
                padding: this.calculateSafeAreaPadding(viewport 
     ,
        
        // レイアウトモード適用
        layout = this.applyLayoutMode(layout, config);
        
        // カスタムレイアウト調整
        layout = this.applyCustomAdjustments(layout, config);
        
        return layout;
    }
    
    /**
     * ブレークポイント設定を取得
     */''
    getBreakpointConfig(breakpoint) {
        const configs = { }

            'xs': { }

                canvas: { scale: 0.8, aspectRatio: 'fit'
            ,

                ui: { scale: 1.2, compactMode: true,''
                layout: { mode: 'portrait-optimized' 
    ,', 'sm': { }'

                canvas: { scale: 0.9, aspectRatio: 'fit'
            ,

                ui: { scale: 1.1, compactMode: true,''
                layout: { mode: 'portrait-optimized' 
    ,', 'md': { }'

                canvas: { scale: 1.0, aspectRatio: '4:3'
            ,

                ui: { scale: 1.0, compactMode: false,''
                layout: { mode: 'auto' 
    ,', 'lg': { }'

                canvas: { scale: 1.0, aspectRatio: '16:10'
            ,

                ui: { scale: 0.95, compactMode: false,''
                layout: { mode: 'landscape-optimized' 
    ,', 'xl': { }'

                canvas: { scale: 1.0, aspectRatio: '16:9'
            ,

                ui: { scale: 0.9, compactMode: false,''
                layout: { mode: 'landscape-optimized' 
    ,', 'xxl': { }'

                canvas: { scale: 1.0, aspectRatio: '21:9'
            ,

                ui: { scale: 0.85, compactMode: false,''
                layout: { mode: 'ultra-wide' 
     ,
        return configs[breakpoint] || configs['md'];
    }
    
    /**
     * スケール計算
     */
    calculateScale(viewport, config) {
        if (!this.uiScaling.autoScale) {
    }
            return this.uiScaling.baseScale;
        
        const baseWidth = 800; // 基準幅
        const scale = Math.min(;
            viewport.safeWidth / baseWidth);
            config.canvas.scale || 1.0);
        
        return Math.max();
            this.uiScaling.minScale);
            Math.min(this.uiScaling.maxScale, scale);
    }
    
    /**
     * UIスケール計算
     */
    calculateUIScale(viewport, config) {
        const baseScale = config.ui.scale || 1.0,
        const densityFactor = Math.min(viewport.pixelRatio / 2, 1.2);
        return baseScale * densityFactor;
    
    /**
     * スペーシング計算
     */
    calculateSpacing(viewport, config) {
        const baseSpacing = 16,
        const scale = this.calculateUIScale(viewport, config);
        return { xs: Math.round(baseSpacing * 0.25 * scale,
            sm: Math.round(baseSpacing * 0.5 * scale,
    md: Math.round(baseSpacing * scale),
            lg: Math.round(baseSpacing * 1.5 * scale) ,
            xl: Math.round(baseSpacing * 2 * scale) }
    
    /**
     * 要素サイズ計算
     */
    calculateElementSizes(viewport, config) {
        const uiScale = this.calculateUIScale(viewport, config);
        return { button: {
                minWidth: Math.max(44, Math.round(44 * uiScale) } };
                minHeight: Math.max(44, Math.round(44 * uiScale) };
                fontSize: Math.max(14, Math.round(16 * uiScale); }
            },
            text: { small: Math.max(12, Math.round(12 * uiScale),
                medium: Math.max(14, Math.round(16 * uiScale)  },
                large: Math.max(18, Math.round(20 * uiScale },
            icon: { small: Math.max(16, Math.round(16 * uiScale),
                medium: Math.max(24, Math.round(24 * uiScale)  },
                large: Math.max(32, Math.round(32 * uiScale }
        }
    
    /**
     * セーフエリアパディング計算
     */
    calculateSafeAreaPadding(viewport) {
        const insets = this.safeAreaManager.insets,
        const minPadding = 8,
        
        return { top: Math.max(minPadding, insets.top);
            right: Math.max(minPadding, insets.right);
            bottom: Math.max(minPadding, insets.bottom) };
            left: Math.max(minPadding, insets.left); }
        }
    
    /**
     * レイアウトモード適用
     */
    applyLayoutMode(layout, config) {
        const mode = this.dynamicLayout.mode,

        switch(mode) {''
            case 'portrait':','
                return this.applyPortraitLayout(layout);
            case 'landscape':','
                return this.applyLandscapeLayout(layout);
            case 'fixed':,
                return this.applyFixedLayout(layout);
            default:
}
                return this.applyAutoLayout(layout, config);
    
    /**
     * 自動レイアウト適用'
     */''
    applyAutoLayout(layout, config) {
    
}
        const { orientation } = layout;
        const layoutMode = config.layout.mode;

        if(layoutMode === 'portrait-optimized' && orientation === 'portrait' {', ' }

            return this.applyPortraitOptimizations(layout); }'

        } else if (layoutMode === 'landscape-optimized' && orientation === 'landscape) { return this.applyLandscapeOptimizations(layout) }'
        
        return layout;
    }
    
    /**
     * ポートレート最適化
     */
    applyPortraitOptimizations(layout) {
        // 縦画面での最適化
        layout.canvas.height = Math.min(
            layout.viewport.safeHeight);
            layout.viewport.safeWidth * 1.5)','
        '),'

        ','

        layout.ui.compactMode = true,
        layout.ui.buttonLayout = 'vertical' }
        return layout;
    
    /**
     * ランドスケープ最適化
     */
    applyLandscapeOptimizations(layout) {
        // 横画面での最適化
        layout.canvas.width = Math.min(
            layout.viewport.safeWidth);
            layout.viewport.safeHeight * 1.5)','
        '),'

        ','

        layout.ui.compactMode = false,
        layout.ui.buttonLayout = 'horizontal' }
        return layout;
    
    /**
     * カスタム調整適用
     */
    applyCustomAdjustments(layout, config) {
        // ゲーム固有の調整
        if (this.gameEngine && this.gameEngine.getLayoutAdjustments) {
    }
            const adjustments = this.gameEngine.getLayoutAdjustments(layout); }
            return { ...layout, ...adjustments }
        
        return layout;
    }
    
    /**
     * オブザーバーの設定
     */
    setupObservers() {
        // ResizeObserver
        if (window.ResizeObserver) {
            this.performance.resizeObserver = new ResizeObserver( };
                this.debounce((entries) => {  }
                    this.handleResize(); }
                }, this.performance.debounceTime)
            );
            
            this.performance.resizeObserver.observe(document.body);
        }
        
        // IntersectionObserver（キャンバス可視性監視）
        if (window.IntersectionObserver) {
            this.performance.intersectionObserver = new IntersectionObserver(
                (entries) => { 
                    entries.forEach(entry => {);
                        if (entry.target === this.canvas) { }
                            this.handleVisibilityChange(entry.isIntersecting); }
}
                },
                { threshold: [0, 0.5, 1] };
            
            this.performance.intersectionObserver.observe(this.canvas);
        }
    }
    
    /**
     * 拡張イベントリスナーの設定
     */
    setupAdvancedEventListeners() {
        // Screen Orientation API
        if (screen.orientation) {
    }

            screen.orientation.addEventListener('change', () => {  }
                this.handleOrientationChange();     }
}
        ';'
        // Visual Viewport API
        if (window.visualViewport) {', ' }

            window.visualViewport.addEventListener('resize', () => {  }
                this.handleViewportChange();     }
}
        // Media Query listeners
        this.setupMediaQueryListeners();
        
        // Device pixel ratio changes
        this.setupPixelRatioListener();
    }
    
    /**
     * メディアクエリリスナー設定
     */
    setupMediaQueryListeners() {

        Object.entries(this.advancedBreakpoints).forEach(([key, breakpoint]) => { ''
            let query = ' }'
             }
            if (breakpoint.min && breakpoint.max) { }
                query = `(min-width: ${breakpoint.min}px) and (max-width: ${breakpoint.max}px)` } else if (breakpoint.min) {
                query = `(min-width: ${breakpoint.min}px)` } else if (breakpoint.max) {
                query = `(max-width: ${breakpoint.max}px)` }
            
            if (query) {
            
                const mediaQuery = window.matchMedia(query);
                mediaQuery.addListener((e) => {
    
}
                    if (e.matches) { }
                        this.handleBreakpointChange(key);     }
}
        }
    }
    
    /**
     * ピクセル比リスナー設定
     */
    setupPixelRatioListener() {
        const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio)dppx}`} }
        mediaQuery.addListener(() => {  }
            // デバイスピクセル比変更時の処理 }
            this.handlePixelRatioChange(}
        };
    }
    
    /**
     * 画面回転処理（オーバーライド）
     */
    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        const oldOrientation = this.orientationManager.current,
        
        if (newOrientation !== oldOrientation) {
            this.orientationManager.previous = oldOrientation,
            this.orientationManager.current = newOrientation,
            
            // アニメーション中フラグ
            this.orientationManager.animation.inProgress = true,
            
            // レイアウト再計算
            setTimeout(() => { 
                this.calculateOptimalLayout();
                this.updateCanvasSize();
                // アニメーション完了
                setTimeout(() => {'
                    this.orientationManager.animation.inProgress = false,
                    this.dispatchLayoutEvent('orientation-change-complete', {
            };
                        from: oldOrientation),
                        to: newOrientation); 
    }
                }, this.orientationManager.animation.duration';'

            }, 100');'

            this.dispatchLayoutEvent('orientation-change', { from: oldOrientation)
            to: newOrientation,
        
        super.handleOrientationChange?.();
    }
    
    /**
     * ビューポート変更処理
     */
    handleViewportChange() {
        // キャッシュクリア
        this.performance.cache.measurements.clear();
        // セーフエリア再検出
        this.detectSafeArea();
        // レイアウト再計算
        this.calculateOptimalLayout();
        this.updateCanvasSize()','
        this.dispatchLayoutEvent('viewport-change', {), : undefined
    
            viewport: this.getViewportInfo();
        }
    }
    
    /**
     * 可視性変更処理'
     */''
    handleVisibilityChange(isVisible) {

        this.dispatchLayoutEvent('visibility-change', { isVisible );
        if (this.gameEngine && this.gameEngine.handleVisibilityChange) {
    }
            this.gameEngine.handleVisibilityChange(isVisible); }
}
    
    /**
     * ピクセル比変更処理
     */
    handlePixelRatioChange() {
        // 高DPI表示の再計算
        this.updateCanvasSize()','
        this.dispatchLayoutEvent('pixel-ratio-change', { }
            pixelRatio: window.devicePixelRatio); 
    }
    
    /**
     * レイアウトイベント発火
     */
    dispatchLayoutEvent(type, detail) {
        const event = new CustomEvent(`layout-${type}`, {
            detail: {
                ...detail }
                manager: this,
                timestamp: Date.now()) };
        
        document.dispatchEvent(event);
        
        // ゲームエンジンにも通知
        if (this.gameEngine && this.gameEngine.onLayoutEvent) { this.gameEngine.onLayoutEvent(type, detail);
    }
    
    /**
     * デバウンス関数
     */
    debounce(func, wait) {
        let timeout,
        return function executedFunction(...args) {
            const later = () => { 
    }
                clearTimeout(timeout); }
                func.apply(this, args); }
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        }
    
    /**
     * キャンバスサイズ更新（オーバーライド）
     */
    updateCanvasSize() {

        const layout = this.calculateOptimalLayout(',
        this.canvas.style.width = layout.canvas.width + 'px,
        this.canvas.style.height = layout.canvas.height + 'px,
        
        // 実際のCanvas描画サイズ（高DPI対応）
        const, pixelRatio = layout.viewport.pixelRatio,
        this.canvas.width = layout.canvas.width * pixelRatio,
        this.canvas.height = layout.canvas.height * pixelRatio,
        ','
        // コンテキストのスケール調整')'
        const context = this.canvas.getContext('2d),'
        context.scale(pixelRatio, pixelRatio);
        // 現在のサイズ情報更新
        this.currentSize = {
            displayWidth: layout.canvas.width,
            displayHeight: layout.canvas.height,
            actualWidth: this.canvas.width,
            actualHeight: this.canvas.height,
            scale: layout.canvas.scale,
    pixelRatio: pixelRatio,
            layout: layout,
        // Canvas配置
        this.positionCanvas(layout);
        
        // ゲームエンジンに通知
        if (this.gameEngine && this.gameEngine.onCanvasResize) { }

            this.gameEngine.onCanvasResize(this.currentSize); }
        }

        this.dispatchLayoutEvent('canvas-resize', { size: this.currentSize'
            layout: layout,
    
    /**
     * Canvas配置'
     */''
    positionCanvas(layout) {
        const safeArea = layout.safeArea,
        ','
        // セーフエリアを考慮した配置
        this.canvas.style.position = 'relative,
        this.canvas.style.marginTop = safeArea.padding.top + 'px,
        this.canvas.style.marginRight = safeArea.padding.right + 'px,
        this.canvas.style.marginBottom = safeArea.padding.bottom + 'px,
        this.canvas.style.marginLeft = safeArea.padding.left + 'px,
        ','
        // 中央配置
        this.canvas.style.display = 'block,
        this.canvas.style.marginLeft = 'auto' }

        this.canvas.style.marginRight = 'auto'; }
    }
    
    /**
     * レイアウト情報取得
     */
    getLayoutInfo() {
        return { }

            ...this.getCanvasInfo();

            layout: this.performance.cache.calculations.get('current-layout'?.layout }'
        }
    
    /**
     * クリーンアップ（オーバーライド）
     */
    cleanup() {
        super.cleanup?.(),
        
        // オブザーバーの削除
        if (this.performance.resizeObserver) {
    }
            this.performance.resizeObserver.disconnect(); }
        }
        
        if (this.performance.intersectionObserver) { this.performance.intersectionObserver.disconnect();
        
        // キャッシュクリア
        this.performance.cache.measurements.clear();
        this.performance.cache.calculations.clear()';'
        console.log('[AdvancedResponsiveLayoutManager] クリーンアップ完了');

    }'} : undefined'