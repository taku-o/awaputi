import { getErrorHandler  } from '../../utils/ErrorHandler.js';

/**
 * レンダリング最適化システム
 * 言語切り替え時のレンダリングパフォーマンスを最適化
 */

// 型定義
export interface OptimizationOptions { batchMode?: boolean,
    animateTransition?: boolean;
    preloadFonts?: boolean;
    cacheResults?: boolean;
    export interface BatchedUpdateOptions { animateTransition: boolean,
    cacheResults: boolean;
    export interface ElementMeasurement { rect: DOMRect,
    fontSize: string,
    fontFamily: string,
    width: number,
    height: number;
    export interface ElementUpdate { textContent: string,
    originalSize: ElementMeasurement,
    needsReflow: boolean;
    export interface BatchProcessor { enabled: boolean,
    debounceTime: number,
    maxWaitTime: number,
    currentBatch: HTMLElement[],
    batchTimer: number | null,
    maxWaitTimer: number | null };
export interface FontOptimizer { preloadedFonts: Set<string>,
    fontLoadPromises: Map<string, Promise<boolean>>;
    fallbackFonts: Map<string, string[]>;
    fontSwapEnabled: boolean;
    enabled?: boolean;
    export interface AnimationOptimizer { enabled: boolean,
    reducedMotion: boolean,
    animationQueue: AnimationQueueItem[],
    activeAnimations: Set<string>,
    frameScheduler: number | null };
export interface AnimationQueueItem { element: HTMLElement,
    initialState: AnimationState,
    startTime: number;
    export interface AnimationState { opacity: string,
    transform: string;
    export interface PerformanceMetrics { renderTimes: number[],
    batchSizes: number[],
    fontLoadTimes: number[],
    animationFrameTimes: number[],
    cacheHitRate: number,
    totalRenders: number,
    optimizedRenders: number;
    export interface RenderingStats { totalUpdates: number,
    batchedUpdates: number,
    cacheHits: number,
    cacheMisses: number,
    fontLoads: number,
    animationsOptimized: number,
    renderTime: number,
    lastOptimizationTime: number;
    export interface OptimizationResult { success: boolean,
    renderTime: number;
    elementsProcessed?: number;
    batchMode?: boolean;
    stats?: OptimizationStatsResult;
    error?: string;
    export interface OptimizationStatsResult { totalUpdates: number,
    batchedUpdates: number,
    cacheHits: number,
    cacheMisses: number,
    fontLoads: number,
    animationsOptimized: number,
    renderTime: number,
    lastOptimizationTime: number,
    averageRenderTime: number,
    averageBatchSize: number,
    cacheHitRate: number,
    optimizationLevel: OptimizationLevel,
    totalRenders: number,
    optimizedRenders: number,
    cacheSize: number,
    measurementCacheSize: number,
    textContentCacheSize: number;
    export interface CacheEntry { element: HTMLElement,
    update: ElementUpdate,
    timestamp: number;
    export interface ElementUpdatePair { element: HTMLElement,
    update: ElementUpdate;
    export interface RenderTimeDistribution { min: number,
    max: number,
    median: number,
    p95: number;
    export interface FontLoadStats { totalLoads: number,
    preloadedFonts: number,
    averageLoadTime: number;
    export interface AnimationStats { optimizedAnimations: number,
    reducedMotionEnabled: boolean,
    averageFrameTime: number;
    export interface DetailedPerformanceStats extends OptimizationStatsResult { renderTimeDistribution: RenderTimeDistribution,
    fontLoadStats: FontLoadStats,
    animationStats: AnimationStats;
    export interface ConfigurationUpdate { optimizationLevel?: OptimizationLevel,
    batchUpdateThreshold?: number;
    maxBatchSize?: number;
    fontOptimization?: boolean;
    animationOptimization?: boolean;
    export type OptimizationLevel = 'performance' | 'balanced' | 'quality';

// FontFace API型定義（補完）
declare global { interface Document {
        fonts?: FontFaceSet;
    interface FontFaceSet extends EventTarget { load(font: string): Promise<FontFace[]>;
    addEventListener(type: string, listener: EventListener): void;
    interface FontFace { family: string,
        status: string;
};
export class RenderingOptimizer {
    // 基本設定
    private optimizationLevel: OptimizationLevel;
    private batchUpdateThreshold: number;
    private maxBatchSize: number;
    // レンダリング状態管理
    private isRenderingOptimized: boolean;
    private, pendingUpdates: Map<string, any>,
    private updateQueue: any[];
    private renderFrameId: number | null;
    private lastRenderTime: number;
    // UI要素キャッシュ
    private, elementCache: Map<string, CacheEntry>,
    private textContentCache: Map<string, ElementUpdate>;
    private styleCache: Map<string, any>;
    private measurementCache: Map<string, ElementMeasurement>;
    
    // バッチ処理設定
    private batchProcessor: BatchProcessor;
    // フォント最適化
    private fontOptimizer: FontOptimizer;
    // アニメーション最適化
    private animationOptimizer: AnimationOptimizer;
    // パフォーマンス監視
    private performanceMetrics: PerformanceMetrics;
    // 統計情報
    private, stats: RenderingStats;

    constructor(',
        this.optimizationLevel = 'balanced'; // 'performance', 'balanced', 'quality'
        this.batchUpdateThreshold = 16; // 16ms以内でバッチ処理
        this.maxBatchSize = 50; // 最大バッチサイズ
        
        // レンダリング状態管理
        this.isRenderingOptimized = false)
        this.pendingUpdates = new Map<string, any>(),
        this.updateQueue = [];
        this.renderFrameId = null;
        this.lastRenderTime = 0;
        
        // UI要素キャッシュ
        this.elementCache = new Map<string, CacheEntry>(),
        this.textContentCache = new Map<string, ElementUpdate>(),
        this.styleCache = new Map<string, any>(),
        this.measurementCache = new Map<string, ElementMeasurement>(),
        
        // バッチ処理設定
        this.batchProcessor = {
            enabled: true,
    debounceTime: 8, // 8ms;
            maxWaitTime: 32, // 32ms;
            currentBatch: [],
            batchTimer: null,
    maxWaitTimer: null;
        // フォント最適化
        this.fontOptimizer = { preloadedFonts: new Set<string>(
            fontLoadPromises: new Map<string, Promise<boolean>>();
            fallbackFonts: new Map<string, string[]>();
            fontSwapEnabled: true;
        // アニメーション最適化
        this.animationOptimizer = { enabled: true,
            reducedMotion: false,
            animationQueue: [],
            activeAnimations: new Set<string>(),
            frameScheduler: null;
        // パフォーマンス監視
        this.performanceMetrics = { renderTimes: [],
            batchSizes: [],
            fontLoadTimes: [],
            animationFrameTimes: [],
            cacheHitRate: 0,
            totalRenders: 0,
    optimizedRenders: 0  };
        // 統計情報
        this.stats = { totalUpdates: 0,
            batchedUpdates: 0,
            cacheHits: 0,
            cacheMisses: 0,
            fontLoads: 0,
            animationsOptimized: 0,
            renderTime: 0,
    lastOptimizationTime: 0  };
        ;
        // 初期化
        this.initializeOptimizer()';'
        console.log('RenderingOptimizer initialized with level:', this.optimizationLevel);
    }
    
    /**
     * 最適化システムを初期化
     */
    private initializeOptimizer(): void { // Reduced Motion検出
        this.detectReducedMotionPreference();
        // パフォーマンスオブザーバー設定
        this.setupPerformanceObserver();
        // フォント読み込み監視
        this.setupFontLoadMonitoring();
        // レスポンシブ設定
        this.setupResponsiveOptimization();
    
    /**
     * 言語切り替え時の最適化処理
     */
    async optimizeLanguageSwitch(language: string, elements: HTMLElement[], options: OptimizationOptions = { ): Promise<OptimizationResult>;
        const startTime = performance.now();
        try {
            const { batchMode = true,
                animateTransition = true,
                preloadFonts = true,
                cacheResults = true } = options;
            
            this.stats.totalUpdates++;
            
            // フォントプリロード
            if (preloadFonts) { await this.preloadLanguageFonts(language);
            
            // レンダリング最適化モード開始
            this.startOptimizedRendering();
            
            // 要素更新の最適化
            if (batchMode && elements.length > this.maxBatchSize) {
                await this.processBatchedUpdates(elements, language, {)
                    animateTransition);
                    cacheResults }
            } else {  await this.processImmediateUpdates(elements, language, {)
                    animateTransition);
                    cacheResults }
            }
            
            // レンダリング最適化モード終了
            this.endOptimizedRendering();
            
            const renderTime = performance.now() - startTime;
            this.updatePerformanceMetrics(renderTime, elements.length);
            
            console.log(`Language, switch optimized, in ${renderTime.toFixed(2}ms for ${elements.length} elements`);
            
            return { success: true;
                renderTime,
                elementsProcessed: elements.length;
                batchMode };
                stats: this.getOptimizationStats();
    };
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'RENDERING_OPTIMIZER_ERROR', {''
                operation: 'optimizeLanguageSwitch');
                language),
                elementCount: elements.length  };
            
            return { success: false,
                error: (error, as Error).message };
                renderTime: performance.now() - startTime 
    }
    }
    
    /**
     * バッチ処理による要素更新
     */
    private async processBatchedUpdates(elements: HTMLElement[], language: string, options: BatchedUpdateOptions): Promise<void>,
        const { animateTransition, cacheResults } = options;
        const batchSize = Math.min(this.maxBatchSize, elements.length);
        const batches = this.createElementBatches(elements, batchSize);
        
        this.stats.batchedUpdates++;
        
        // バッチ処理の実行
        for(let, i = 0; i < batches.length; i++) {
            const batch = batches[i],
            
            // DOM読み込み・書き込みの分離
            const measurements = this.batchMeasureElements(batch);
            await this.batchUpdateElements(batch, language, measurements, {)
                animateTransition: animateTransition && i === 0, // 最初のバッチのみアニメーション),
                cacheResults,
            
            // フレーム間で処理を分割
            if (i < batches.length - 1) {
        }
                await this.waitForNextFrame();     }
}
    /**
     * 即座の要素更新
     */
    private async processImmediateUpdates(elements: HTMLElement[], language: string, options: BatchedUpdateOptions): Promise<void>,
        const { animateTransition, cacheResults } = options;
        
        // アニメーション準備
        if (animateTransition) { this.prepareTransitionAnimation(elements);
        
        // 要素の測定
        const measurements = this.batchMeasureElements(elements);
        
        // 要素の更新
        await this.batchUpdateElements(elements, language, measurements, options);
        
        // アニメーション実行
        if (animateTransition) { await this.executeTransitionAnimation(elements);
    }
    
    /**
     * 要素のバッチ作成
     */
    private createElementBatches(elements: HTMLElement[], batchSize: number): HTMLElement[][] { const batches: HTMLElement[][] = [],
        
        // 要素を優先度でソート
        const sortedElements = elements.sort((a, b) => { 
            const priorityA = this.getElementPriority(a);
            const priorityB = this.getElementPriority(b);
            return priorityB - priorityA;);
        
        for (let, i = 0; i < sortedElements.length; i += batchSize) { batches.push(sortedElements.slice(i, i + batchSize);
        
        return batches;
    }
    
    /**
     * 要素の優先度を取得
     */
    private getElementPriority(element: HTMLElement): number { // 可視性チェック
        if(!this.isElementVisible(element)) {
            return 0 }
        
        // 要素タイプによる優先度
        const tagPriority: Record<string, number> = { ', 'H1': 10, 'H2': 9, 'H3': 8,'
            'BUTTON': 7, 'INPUT': 7,
            'P': 5, 'SPAN': 4, 'DIV': 3 };
        
        let priority = tagPriority[element.tagName] || 1;
        ';'
        // クラスによる優先度調整
        if(element.classList.contains('critical)' priority += 5;
        if(element.classList.contains('above-fold) priority += 3;'
        
        return priority;
    }
    
    /**
     * 要素の可視性チェック
     */
    private isElementVisible(element: HTMLElement): boolean { const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && ,
               rect.top < window.innerHeight && rect.bottom > 0 }
    
    /**
     * 要素の一括測定
     */
    private batchMeasureElements(elements: HTMLElement[]): Map<HTMLElement, ElementMeasurement> { const measurements = new Map<HTMLElement, ElementMeasurement>(),
        
        // 一括で DOM読み込み
        for (const element of elements) {
            const cacheKey = this.getElementCacheKey(element);
            if (this.measurementCache.has(cacheKey) {
                measurements.set(element, this.measurementCache.get(cacheKey)!);
                this.stats.cacheHits++; }
            } else {  const rect = element.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(element);
                const measurement: ElementMeasurement = {
                    rect,
                    fontSize: computedStyle.fontSize,
                    fontFamily: computedStyle.fontFamily,
    width: rect.width }
                    height: rect.height 
    };
                measurements.set(element, measurement);
                this.measurementCache.set(cacheKey, measurement);
                this.stats.cacheMisses++;
            }
        }
        
        return measurements;
    }
    
    /**
     * 要素の一括更新
     */
    private async batchUpdateElements(elements: HTMLElement[], language: string, measurements: Map<HTMLElement, ElementMeasurement>, options: BatchedUpdateOptions): Promise<void>,
        const { animateTransition, cacheResults } = options;
        
        // DOM書き込みの準備
        const updates: ElementUpdatePair[] = [],
        
        for (const element of elements) {
        
            const measurement = measurements.get(element);
            if (measurement) {
                const update = await this.prepareElementUpdate(element, language, measurement);
                if (update) {
    
}
                    updates.push({ element, update );
}
        
        // 一括DOM書き込み
        requestAnimationFrame(() => {  }
            for (const { element, update } of updates) { this.applyElementUpdate(element, update, cacheResults);
        }
    }
    
    /**
     * 要素更新の準備
     */''
    private async prepareElementUpdate(element: HTMLElement, language: string, measurement: ElementMeasurement): Promise<ElementUpdate | null> { try {'
            const textContent = element.textContent || ' }'
            const cacheKey = `${language}:${textContent}`;
            
            // キャッシュチェック
            if (this.textContentCache.has(cacheKey) { return this.textContentCache.get(cacheKey)! }
            
            // 新しい翻訳を取得（仮想的な処理）
            const translatedText = await this.getTranslatedText(textContent, language);
            
            const update: ElementUpdate = { textContent: translatedText,
                originalSize: measurement,
    needsReflow: this.needsReflow(textContent, translatedText, measurement };
            
            this.textContentCache.set(cacheKey, update);
            return update;

        } catch (error) {
            console.warn('Failed to prepare element update:', error);
            return null,
    
    /**
     * 翻訳テキストを取得（仮想メソッド）
     */
    private async getTranslatedText(originalText: string, language: string): Promise<string> { // 実際の実装では LocalizationManager から取得  }
        return `[${language}] ${originalText}`;
    }
    
    /**
     * リフローが必要かチェック
     */
    private needsReflow(originalText: string, translatedText: string, measurement: ElementMeasurement): boolean { const lengthRatio = translatedText.length / originalText.length,
        
        // テキスト長が50%以上変わる場合はリフローが必要
        return lengthRatio < 0.5 || lengthRatio > 1.5 }
    
    /**
     * 要素更新を適用
     */
    private applyElementUpdate(element: HTMLElement, update: ElementUpdate, cacheResults: boolean): void { try {
            // テキスト更新
            if (update.textContent !== element.textContent) {
    
}
                element.textContent = update.textContent; }
            }
            
            // リフローが必要な場合の最適化
            if (update.needsReflow) { this.optimizeReflow(element, update);
            
            // 結果をキャッシュ
            if (cacheResults) {
                const cacheKey = this.getElementCacheKey(element);
                this.elementCache.set(cacheKey, {
                element);
                    update }
                    timestamp: Date.now(); 
    };'} catch (error) { console.warn('Failed to apply element update:', error }'
    }
    
    /**
     * リフロー最適化'
     */''
    private optimizeReflow(element: HTMLElement, update: ElementUpdate): void { // contain: layout を一時的に適用
        const originalContain = element.style.contain,
        element.style.contain = 'layout,
        
        // 更新完了後に元に戻す
        requestAnimationFrame(() => {  }
            element.style.contain = originalContain;     }
}
    /**
     * フォント最適化
     */
    private async preloadLanguageFonts(language: string): Promise<void>,
        const startTime = performance.now();
        
        try { const requiredFonts = this.getRequiredFonts(language);
            const loadPromises: Promise<boolean>[] = [],
            
            for (const fontFamily of requiredFonts) {
            
                if (!this.fontOptimizer.preloadedFonts.has(fontFamily) {
                    const promise = this.loadFont(fontFamily);
                    loadPromises.push(promise);
                    this.fontOptimizer.fontLoadPromises.set(fontFamily, promise); }
}
            
            if (loadPromises.length > 0) {
            
                await Promise.allSettled(loadPromises);
                this.stats.fontLoads += loadPromises.length; }
            }
            
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.fontLoadTimes.push(loadTime);
            
            console.log(`Fonts, preloaded for ${language} in ${loadTime.toFixed(2}ms`);

        } catch (error) { console.warn('Font preloading failed:', error }
    }
    
    /**
     * 必要なフォントを取得'
     */''
    private getRequiredFonts(language: string): string[] { const fontMap: Record<string, string[]> = {', 'ja': ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic],
            'zh-CN': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei],'
            'zh-TW': ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei],'
            'ko': ['Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo],'
            'en': ['Roboto', 'Arial', 'Helvetica] };'

        return fontMap[language] || fontMap['en'];
    }
    
    /**
     * フォント読み込み
     */'
    private async loadFont(fontFamily: string): Promise<boolean> { try {'
            if (document.fonts && document.fonts.load) { }

                await document.fonts.load(`16px "${fontFamily}"`};" }"
                this.fontOptimizer.preloadedFonts.add(fontFamily"}";
                return true;
            }
            ";"
            // フォールバック: CSS preload""
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = this.getFontURL(fontFamily);
            link.crossOrigin = 'anonymous';
            
            document.head.appendChild(link);
            
            return new Promise<boolean>((resolve, reject) => {  link.onload = () => {
                    this.fontOptimizer.preloadedFonts.add(fontFamily);
                    resolve(true); }
                };
                link.onerror = () => reject(new, Error(`Failed, to load, font: ${fontFamily}`);
                // タイムアウト
                setTimeout(() => reject(new Error(`Font load timeout: ${ fontFamily}` }, 5000}
            };
            
        } catch (error) {
            console.warn(`Font loading failed for ${fontFamily}:`, error);
            return false;
    
    /**
     * フォントURLを取得
     */
    private getFontURL(fontFamily: string): string { // Google Fonts URLの生成（実際の実装では適切なURLを使用）
        const encodedFamily = encodeURIComponent(fontFamily);
        return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;500;700&display=swap`;
    }
    
    /**
     * アニメーション最適化
     */
    private prepareTransitionAnimation(elements: HTMLElement[]): void { if (!this.animationOptimizer.enabled || this.animationOptimizer.reducedMotion) {
            return }

        for (const element of elements) {
            // 初期状態を記録
            const initialState: AnimationState = {''
                opacity: element.style.opacity || '1' }

                transform: element.style.transform || 'none' 
    };
            ';'
            // アニメーション準備
            element.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
            element.style.opacity = '0.7';
            
            this.animationOptimizer.animationQueue.push({
                element
                initialState,
                startTime: performance.now(     }
}
    /**
     * トランジションアニメーション実行
     */
    private async executeTransitionAnimation(elements: HTMLElement[]): Promise<void>,
        if (!this.animationOptimizer.enabled || this.animationOptimizer.reducedMotion) { return }
        
        return new Promise<void>(resolve => {  requestAnimationFrame(() => { }
                for (const item of this.animationOptimizer.animationQueue) { }
                    const { element, initialState } = item;
                    
                    // 最終状態に遷移
                    element.style.opacity = initialState.opacity;
                    element.style.transform = initialState.transform;
                }
                
                // アニメーション完了後のクリーンアップ
                setTimeout(() => {  ''
                    for (const item of this.animationOptimizer.animationQueue) { }'

                        item.element.style.transition = '; }'
                    }
                    this.animationOptimizer.animationQueue = [];
                    this.stats.animationsOptimized++;
                    resolve();
                }, 200);
            }
        };
    }
    
    /**
     * Reduced Motion検出
     */'
    private detectReducedMotionPreference(): void { ''
        if (window.matchMedia) {

            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce),
            this.animationOptimizer.reducedMotion = mediaQuery.matches,

            mediaQuery.addEventListener('change', (e) => { 
        }

                this.animationOptimizer.reducedMotion = e.matches;' }'

                console.log('Reduced motion preference changed:', e.matches); }
            }';'
        }
    }
    
    /**
     * パフォーマンスオブザーバー設定'
     */''
    private setupPerformanceObserver()';'
        if(typeof, PerformanceObserver !== 'undefined' {'
            try {
                const observer = new PerformanceObserver((list) => { 
                    const entries = list.getEntries();
                    for (const entry of entries) {
        }

                        if (entry.entryType === 'measure' && entry.name.includes('i18n-render) { }'
                            this.performanceMetrics.renderTimes.push(entry.duration); }
}'}');

                observer.observe({ entryTypes: ['measure] ',' }'

            } catch (error) { console.warn('Performance observer setup failed:', error }
}
    
    /**
     * フォント読み込み監視設定
     */'
    private setupFontLoadMonitoring(): void { ''
        if (document.fonts && document.fonts.addEventListener) {', ' }

            document.fonts.addEventListener('loadingdone', (event: any) => { }

                console.log('Font loading completed:', event.fontfaces.length, 'fonts'; }

            }');'

            document.fonts.addEventListener('loadingerror', (event: any) => { }

                console.warn('Font loading error:', event); }
            }';'
        }
    }
    
    /**
     * レスポンシブ最適化設定
     */'
    private setupResponsiveOptimization(): void { ''
        if (window.matchMedia) {
            // モバイルデバイス検出
            const mobileQuery = window.matchMedia('(max-width: 768px),'

            const updateOptimizationLevel = (isMobile: boolean): void => { ''
                if (isMobile) {''
                    this.optimizationLevel = 'performance'
            }
                    this.batchUpdateThreshold = 8; // より積極的なバッチ処理 }
                    this.maxBatchSize = 25; // 小さなバッチサイズ }
                } else {
                    this.optimizationLevel = 'balanced';
                    this.batchUpdateThreshold = 16 }
                    this.maxBatchSize = 50; }
};

            updateOptimizationLevel(mobileQuery.matches);
            mobileQuery.addEventListener('change', (e) => updateOptimizationLevel(e.matches);
        }
    }
    
    /**
     * 最適化レンダリング開始
     */'
    private startOptimizedRendering(): void { this.isRenderingOptimized = true;
        this.lastRenderTime = performance.now('';
        document.documentElement.style.contain = 'layout, style' }
    
    /**
     * 最適化レンダリング終了'
     */''
    private, endOptimizedRendering('';
        document.documentElement.style.contain = ';)'
        );
        const renderTime = performance.now() - this.lastRenderTime;
        this.stats.renderTime += renderTime;
        this.stats.lastOptimizationTime = renderTime;
        
        this.performanceMetrics.totalRenders++;
        this.performanceMetrics.optimizedRenders++;
    }
    
    /**
     * 次のフレームまで待機
     */
    private waitForNextFrame(): Promise<void>;
        return new Promise<void>(resolve => { requestAnimationFrame(() => resolve());
    
    /**
     * 要素キャッシュキーを生成
     */
    private getElementCacheKey(element: HTMLElement): string {
        return `${element.tagName}:${element.className}:${element.textContent?.substring(0, 50}`;
    }
    
    /**
     * パフォーマンスメトリクスを更新
     */ : undefined
    private updatePerformanceMetrics(renderTime: number, elementCount: number): void { this.performanceMetrics.renderTimes.push(renderTime);
        this.performanceMetrics.batchSizes.push(elementCount);
        // 古いメトリクスを制限
        if (this.performanceMetrics.renderTimes.length > 100) {
    
}
            this.performanceMetrics.renderTimes = this.performanceMetrics.renderTimes.slice(-50); }
        }
        
        // キャッシュヒット率を計算
        const totalAccesses = this.stats.cacheHits + this.stats.cacheMisses;
        this.performanceMetrics.cacheHitRate = totalAccesses > 0 ;
            ? (this.stats.cacheHits / totalAccesses) * 100 ;
            : 0;
    }
    
    /**
     * 最適化統計を取得
     */
    getOptimizationStats(): OptimizationStatsResult { const avgRenderTime = this.performanceMetrics.renderTimes.length > 0
            ? this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length: 0,
            
        const avgBatchSize = this.performanceMetrics.batchSizes.length > 0,
            ? this.performanceMetrics.batchSizes.reduce((a, b) => a + b, 0) / this.performanceMetrics.batchSizes.length: 0,
        
        return { ...this.stats,
            averageRenderTime: Math.round(avgRenderTime * 100) / 100,
            averageBatchSize: Math.round(avgBatchSize),
            cacheHitRate: Math.round(this.performanceMetrics.cacheHitRate * 100) / 100,
            optimizationLevel: this.optimizationLevel,
            totalRenders: this.performanceMetrics.totalRenders,
            optimizedRenders: this.performanceMetrics.optimizedRenders,
            cacheSize: this.elementCache.size,
    measurementCacheSize: this.measurementCache.size ,
            textContentCacheSize: this.textContentCache.size 
    }
    
    /**
     * 詳細パフォーマンス統計を取得
     */
    getDetailedPerformanceStats(): DetailedPerformanceStats { const stats = this.getOptimizationStats();
        return { ...stats,
            renderTimeDistribution: {
                min: Math.min(...this.performanceMetrics.renderTimes) || 0 ,
                max: Math.max(...this.performanceMetrics.renderTimes) || 0,
    median: this.calculateMedian(this.performanceMetrics.renderTimes) ,
                p95: this.calculatePercentile(this.performanceMetrics.renderTimes, 0.95); }
            },
            fontLoadStats: { totalLoads: this.stats.fontLoads,
                preloadedFonts: this.fontOptimizer.preloadedFonts.size ,
    averageLoadTime: this.calculateAverage(this.performanceMetrics.fontLoadTimes }
            animationStats: { optimizedAnimations: this.stats.animationsOptimized,
                reducedMotionEnabled: this.animationOptimizer.reducedMotion ,
    averageFrameTime: this.calculateAverage(this.performanceMetrics.animationFrameTimes 
    }
    
    /**
     * 中央値を計算
     */
    private, calculateMedian(values: number[]): number { if (values.length === 0) return 0,
        
        const sorted = [...values].sort((a, b) => a - b),
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0,
            ? (sorted[mid - 1] + sorted[mid]) / 2,
            : sorted[mid];
    
    /**
     * パーセンタイルを計算
     */
    private calculatePercentile(values: number[], percentile: number): number { if (values.length === 0) return 0,
        
        const sorted = [...values].sort((a, b) => a - b),
        const index = Math.ceil(sorted.length * percentile) - 1,
        
        return sorted[Math.max(0, index)],
    
    /**
     * 平均値を計算
     */
    private calculateAverage(values: number[]): number { if (values.length === 0) return 0,
        return values.reduce((a, b) => a + b, 0) / values.length,
    
    /**
     * 設定を更新
     */
    updateConfiguration(config: ConfigurationUpdate): void { if (config.optimizationLevel) {
            this.optimizationLevel = config.optimizationLevel }
        
        if (config.batchUpdateThreshold !== undefined) { this.batchUpdateThreshold = config.batchUpdateThreshold }
        
        if (config.maxBatchSize !== undefined) { this.maxBatchSize = config.maxBatchSize }
        
        if (config.fontOptimization !== undefined) { this.fontOptimizer.enabled = config.fontOptimization }

        if (config.animationOptimization !== undefined) { this.animationOptimizer.enabled = config.animationOptimization }

        console.log('RenderingOptimizer configuration updated:', config);
    }
    
    /**
     * キャッシュをクリア
     */
    clearCache(): void { this.elementCache.clear();
        this.textContentCache.clear();
        this.styleCache.clear();
        this.measurementCache.clear()','
        console.log('RenderingOptimizer, caches cleared') }'
    
    /**
     * クリーンアップ
     */
    cleanup(): void { // フレームリクエストをキャンセル
        if (this.renderFrameId) {
    
}
            cancelAnimationFrame(this.renderFrameId); }
        }
        
        // バッチタイマーをクリア
        if (this.batchProcessor.batchTimer) { clearTimeout(this.batchProcessor.batchTimer);
        
        if (this.batchProcessor.maxWaitTimer) { clearTimeout(this.batchProcessor.maxWaitTimer);
        ;
        // キャッシュをクリア
        this.clearCache('';
        document.documentElement.style.contain = ';, ')';'
        console.log('RenderingOptimizer, cleaned up');

    }'}'