import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * レンダリング最適化システム
 * 言語切り替え時のレンダリングパフォーマンスを最適化
 */
export class RenderingOptimizer {
    constructor() {
        // 基本設定
        this.optimizationLevel = 'balanced'; // 'performance', 'balanced', 'quality'
        this.batchUpdateThreshold = 16; // 16ms以内でバッチ処理
        this.maxBatchSize = 50; // 最大バッチサイズ
        
        // レンダリング状態管理
        this.isRenderingOptimized = false;
        this.pendingUpdates = new Map();
        this.updateQueue = [];
        this.renderFrameId = null;
        this.lastRenderTime = 0;
        
        // UI要素キャッシュ
        this.elementCache = new Map();
        this.textContentCache = new Map();
        this.styleCache = new Map();
        this.measurementCache = new Map();
        
        // バッチ処理設定
        this.batchProcessor = {
            enabled: true,
            debounceTime: 8, // 8ms
            maxWaitTime: 32, // 32ms
            currentBatch: [],
            batchTimer: null,
            maxWaitTimer: null
        };
        
        // フォント最適化
        this.fontOptimizer = {
            preloadedFonts: new Set(),
            fontLoadPromises: new Map(),
            fallbackFonts: new Map(),
            fontSwapEnabled: true
        };
        
        // アニメーション最適化
        this.animationOptimizer = {
            enabled: true,
            reducedMotion: false,
            animationQueue: [],
            activeAnimations: new Set(),
            frameScheduler: null
        };
        
        // パフォーマンス監視
        this.performanceMetrics = {
            renderTimes: [],
            batchSizes: [],
            fontLoadTimes: [],
            animationFrameTimes: [],
            cacheHitRate: 0,
            totalRenders: 0,
            optimizedRenders: 0
        };
        
        // 統計情報
        this.stats = {
            totalUpdates: 0,
            batchedUpdates: 0,
            cacheHits: 0,
            cacheMisses: 0,
            fontLoads: 0,
            animationsOptimized: 0,
            renderTime: 0,
            lastOptimizationTime: 0
        };
        
        // 初期化
        this.initializeOptimizer();
        
        console.log('RenderingOptimizer initialized with level:', this.optimizationLevel);
    }
    
    /**
     * 最適化システムを初期化
     */
    initializeOptimizer() {
        // Reduced Motion検出
        this.detectReducedMotionPreference();
        
        // パフォーマンスオブザーバー設定
        this.setupPerformanceObserver();
        
        // フォント読み込み監視
        this.setupFontLoadMonitoring();
        
        // レスポンシブ設定
        this.setupResponsiveOptimization();
    }
    
    /**
     * 言語切り替え時の最適化処理
     */
    async optimizeLanguageSwitch(language, elements, options = {}) {
        const startTime = performance.now();
        
        try {
            const {
                batchMode = true,
                animateTransition = true,
                preloadFonts = true,
                cacheResults = true
            } = options;
            
            this.stats.totalUpdates++;
            
            // フォントプリロード
            if (preloadFonts) {
                await this.preloadLanguageFonts(language);
            }
            
            // レンダリング最適化モード開始
            this.startOptimizedRendering();
            
            // 要素更新の最適化
            if (batchMode && elements.length > this.maxBatchSize) {
                await this.processBatchedUpdates(elements, language, {
                    animateTransition,
                    cacheResults
                });
            } else {
                await this.processImmediateUpdates(elements, language, {
                    animateTransition,
                    cacheResults
                });
            }
            
            // レンダリング最適化モード終了
            this.endOptimizedRendering();
            
            const renderTime = performance.now() - startTime;
            this.updatePerformanceMetrics(renderTime, elements.length);
            
            console.log(`Language switch optimized in ${renderTime.toFixed(2)}ms for ${elements.length} elements`);
            
            return {
                success: true,
                renderTime,
                elementsProcessed: elements.length,
                batchMode,
                stats: this.getOptimizationStats()
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'RENDERING_OPTIMIZER_ERROR', {
                operation: 'optimizeLanguageSwitch',
                language,
                elementCount: elements.length
            });
            
            return {
                success: false,
                error: error.message,
                renderTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * バッチ処理による要素更新
     */
    async processBatchedUpdates(elements, language, options) {
        const { animateTransition, cacheResults } = options;
        const batchSize = Math.min(this.maxBatchSize, elements.length);
        const batches = this.createElementBatches(elements, batchSize);
        
        this.stats.batchedUpdates++;
        
        // バッチ処理の実行
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            // DOM読み込み・書き込みの分離
            const measurements = this.batchMeasureElements(batch);
            await this.batchUpdateElements(batch, language, measurements, {
                animateTransition: animateTransition && i === 0, // 最初のバッチのみアニメーション
                cacheResults
            });
            
            // フレーム間で処理を分割
            if (i < batches.length - 1) {
                await this.waitForNextFrame();
            }
        }
    }
    
    /**
     * 即座の要素更新
     */
    async processImmediateUpdates(elements, language, options) {
        const { animateTransition, cacheResults } = options;
        
        // アニメーション準備
        if (animateTransition) {
            this.prepareTransitionAnimation(elements);
        }
        
        // 要素の測定
        const measurements = this.batchMeasureElements(elements);
        
        // 要素の更新
        await this.batchUpdateElements(elements, language, measurements, options);
        
        // アニメーション実行
        if (animateTransition) {
            await this.executeTransitionAnimation(elements);
        }
    }
    
    /**
     * 要素のバッチ作成
     */
    createElementBatches(elements, batchSize) {
        const batches = [];
        
        // 要素を優先度でソート
        const sortedElements = elements.sort((a, b) => {
            const priorityA = this.getElementPriority(a);
            const priorityB = this.getElementPriority(b);
            return priorityB - priorityA;
        });
        
        for (let i = 0; i < sortedElements.length; i += batchSize) {
            batches.push(sortedElements.slice(i, i + batchSize));
        }
        
        return batches;
    }
    
    /**
     * 要素の優先度を取得
     */
    getElementPriority(element) {
        // 可視性チェック
        if (!this.isElementVisible(element)) {
            return 0;
        }
        
        // 要素タイプによる優先度
        const tagPriority = {
            'H1': 10, 'H2': 9, 'H3': 8,
            'BUTTON': 7, 'INPUT': 7,
            'P': 5, 'SPAN': 4, 'DIV': 3
        };
        
        let priority = tagPriority[element.tagName] || 1;
        
        // クラスによる優先度調整
        if (element.classList.contains('critical')) priority += 5;
        if (element.classList.contains('above-fold')) priority += 3;
        
        return priority;
    }
    
    /**
     * 要素の可視性チェック
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    /**
     * 要素の一括測定
     */
    batchMeasureElements(elements) {
        const measurements = new Map();
        
        // 一括で DOM読み込み
        for (const element of elements) {
            const cacheKey = this.getElementCacheKey(element);
            
            if (this.measurementCache.has(cacheKey)) {
                measurements.set(element, this.measurementCache.get(cacheKey));
                this.stats.cacheHits++;
            } else {
                const rect = element.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(element);
                
                const measurement = {
                    rect,
                    fontSize: computedStyle.fontSize,
                    fontFamily: computedStyle.fontFamily,
                    width: rect.width,
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
    async batchUpdateElements(elements, language, measurements, options) {
        const { animateTransition, cacheResults } = options;
        
        // DOM書き込みの準備
        const updates = [];
        
        for (const element of elements) {
            const measurement = measurements.get(element);
            const update = await this.prepareElementUpdate(element, language, measurement);
            
            if (update) {
                updates.push({ element, update });
            }
        }
        
        // 一括DOM書き込み
        requestAnimationFrame(() => {
            for (const { element, update } of updates) {
                this.applyElementUpdate(element, update, cacheResults);
            }
        });
    }
    
    /**
     * 要素更新の準備
     */
    async prepareElementUpdate(element, language, measurement) {
        try {
            const textContent = element.textContent;
            const cacheKey = `${language}:${textContent}`;
            
            // キャッシュチェック
            if (this.textContentCache.has(cacheKey)) {
                return this.textContentCache.get(cacheKey);
            }
            
            // 新しい翻訳を取得（仮想的な処理）
            const translatedText = await this.getTranslatedText(textContent, language);
            
            const update = {
                textContent: translatedText,
                originalSize: measurement,
                needsReflow: this.needsReflow(textContent, translatedText, measurement)
            };
            
            this.textContentCache.set(cacheKey, update);
            return update;
            
        } catch (error) {
            console.warn('Failed to prepare element update:', error);
            return null;
        }
    }
    
    /**
     * 翻訳テキストを取得（仮想メソッド）
     */
    async getTranslatedText(originalText, language) {
        // 実際の実装では LocalizationManager から取得
        return `[${language}] ${originalText}`;
    }
    
    /**
     * リフローが必要かチェック
     */
    needsReflow(originalText, translatedText, measurement) {
        const lengthRatio = translatedText.length / originalText.length;
        
        // テキスト長が50%以上変わる場合はリフローが必要
        return lengthRatio < 0.5 || lengthRatio > 1.5;
    }
    
    /**
     * 要素更新を適用
     */
    applyElementUpdate(element, update, cacheResults) {
        try {
            // テキスト更新
            if (update.textContent !== element.textContent) {
                element.textContent = update.textContent;
            }
            
            // リフローが必要な場合の最適化
            if (update.needsReflow) {
                this.optimizeReflow(element, update);
            }
            
            // 結果をキャッシュ
            if (cacheResults) {
                const cacheKey = this.getElementCacheKey(element);
                this.elementCache.set(cacheKey, {
                    element,
                    update,
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.warn('Failed to apply element update:', error);
        }
    }
    
    /**
     * リフロー最適化
     */
    optimizeReflow(element, update) {
        // contain: layout を一時的に適用
        const originalContain = element.style.contain;
        element.style.contain = 'layout';
        
        // 更新完了後に元に戻す
        requestAnimationFrame(() => {
            element.style.contain = originalContain;
        });
    }
    
    /**
     * フォント最適化
     */
    async preloadLanguageFonts(language) {
        const startTime = performance.now();
        
        try {
            const requiredFonts = this.getRequiredFonts(language);
            const loadPromises = [];
            
            for (const fontFamily of requiredFonts) {
                if (!this.fontOptimizer.preloadedFonts.has(fontFamily)) {
                    const promise = this.loadFont(fontFamily);
                    loadPromises.push(promise);
                    this.fontOptimizer.fontLoadPromises.set(fontFamily, promise);
                }
            }
            
            if (loadPromises.length > 0) {
                await Promise.allSettled(loadPromises);
                this.stats.fontLoads += loadPromises.length;
            }
            
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.fontLoadTimes.push(loadTime);
            
            console.log(`Fonts preloaded for ${language} in ${loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.warn('Font preloading failed:', error);
        }
    }
    
    /**
     * 必要なフォントを取得
     */
    getRequiredFonts(language) {
        const fontMap = {
            'ja': ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic'],
            'zh-CN': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei'],
            'zh-TW': ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei'],
            'ko': ['Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo'],
            'en': ['Roboto', 'Arial', 'Helvetica']
        };
        
        return fontMap[language] || fontMap['en'];
    }
    
    /**
     * フォント読み込み
     */
    async loadFont(fontFamily) {
        try {
            if (document.fonts && document.fonts.load) {
                await document.fonts.load(`16px "${fontFamily}"`);
                this.fontOptimizer.preloadedFonts.add(fontFamily);
                return true;
            }
            
            // フォールバック: CSS preload
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = this.getFontURL(fontFamily);
            link.crossOrigin = 'anonymous';
            
            document.head.appendChild(link);
            
            return new Promise((resolve, reject) => {
                link.onload = () => {
                    this.fontOptimizer.preloadedFonts.add(fontFamily);
                    resolve(true);
                };
                link.onerror = () => reject(new Error(`Failed to load font: ${fontFamily}`));
                
                // タイムアウト
                setTimeout(() => reject(new Error(`Font load timeout: ${fontFamily}`)), 5000);
            });
            
        } catch (error) {
            console.warn(`Font loading failed for ${fontFamily}:`, error);
            return false;
        }
    }
    
    /**
     * フォントURLを取得
     */
    getFontURL(fontFamily) {
        // Google Fonts URLの生成（実際の実装では適切なURLを使用）
        const encodedFamily = encodeURIComponent(fontFamily);
        return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;500;700&display=swap`;
    }
    
    /**
     * アニメーション最適化
     */
    prepareTransitionAnimation(elements) {
        if (!this.animationOptimizer.enabled || this.animationOptimizer.reducedMotion) {
            return;
        }
        
        for (const element of elements) {
            // 初期状態を記録
            const initialState = {
                opacity: element.style.opacity || '1',
                transform: element.style.transform || 'none'
            };
            
            // アニメーション準備
            element.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
            element.style.opacity = '0.7';
            
            this.animationOptimizer.animationQueue.push({
                element,
                initialState,
                startTime: performance.now()
            });
        }
    }
    
    /**
     * トランジションアニメーション実行
     */
    async executeTransitionAnimation(elements) {
        if (!this.animationOptimizer.enabled || this.animationOptimizer.reducedMotion) {
            return;
        }
        
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                for (const item of this.animationOptimizer.animationQueue) {
                    const { element, initialState } = item;
                    
                    // 最終状態に遷移
                    element.style.opacity = initialState.opacity;
                    element.style.transform = initialState.transform;
                }
                
                // アニメーション完了後のクリーンアップ
                setTimeout(() => {
                    for (const item of this.animationOptimizer.animationQueue) {
                        item.element.style.transition = '';
                    }
                    this.animationOptimizer.animationQueue = [];
                    this.stats.animationsOptimized++;
                    resolve();
                }, 200);
            });
        });
    }
    
    /**
     * Reduced Motion検出
     */
    detectReducedMotionPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.animationOptimizer.reducedMotion = mediaQuery.matches;
            
            mediaQuery.addEventListener('change', (e) => {
                this.animationOptimizer.reducedMotion = e.matches;
                console.log('Reduced motion preference changed:', e.matches);
            });
        }
    }
    
    /**
     * パフォーマンスオブザーバー設定
     */
    setupPerformanceObserver() {
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    
                    for (const entry of entries) {
                        if (entry.entryType === 'measure' && entry.name.includes('i18n-render')) {
                            this.performanceMetrics.renderTimes.push(entry.duration);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('Performance observer setup failed:', error);
            }
        }
    }
    
    /**
     * フォント読み込み監視設定
     */
    setupFontLoadMonitoring() {
        if (document.fonts && document.fonts.addEventListener) {
            document.fonts.addEventListener('loadingdone', (event) => {
                console.log('Font loading completed:', event.fontfaces.length, 'fonts');
            });
            
            document.fonts.addEventListener('loadingerror', (event) => {
                console.warn('Font loading error:', event);
            });
        }
    }
    
    /**
     * レスポンシブ最適化設定
     */
    setupResponsiveOptimization() {
        if (window.matchMedia) {
            // モバイルデバイス検出
            const mobileQuery = window.matchMedia('(max-width: 768px)');
            
            const updateOptimizationLevel = (isMobile) => {
                if (isMobile) {
                    this.optimizationLevel = 'performance';
                    this.batchUpdateThreshold = 8; // より積極的なバッチ処理
                    this.maxBatchSize = 25; // 小さなバッチサイズ
                } else {
                    this.optimizationLevel = 'balanced';
                    this.batchUpdateThreshold = 16;
                    this.maxBatchSize = 50;
                }
            };
            
            updateOptimizationLevel(mobileQuery.matches);
            mobileQuery.addEventListener('change', (e) => updateOptimizationLevel(e.matches));
        }
    }
    
    /**
     * 最適化レンダリング開始
     */
    startOptimizedRendering() {
        this.isRenderingOptimized = true;
        this.lastRenderTime = performance.now();
        
        // CSS contain プロパティでレイアウト最適化
        document.documentElement.style.contain = 'layout style';
    }
    
    /**
     * 最適化レンダリング終了
     */
    endOptimizedRendering() {
        this.isRenderingOptimized = false;
        
        // CSS contain プロパティを元に戻す
        document.documentElement.style.contain = '';
        
        const renderTime = performance.now() - this.lastRenderTime;
        this.stats.renderTime += renderTime;
        this.stats.lastOptimizationTime = renderTime;
        
        this.performanceMetrics.totalRenders++;
        this.performanceMetrics.optimizedRenders++;
    }
    
    /**
     * 次のフレームまで待機
     */
    waitForNextFrame() {
        return new Promise(resolve => {
            requestAnimationFrame(resolve);
        });
    }
    
    /**
     * 要素キャッシュキーを生成
     */
    getElementCacheKey(element) {
        return `${element.tagName}:${element.className}:${element.textContent?.substring(0, 50)}`;
    }
    
    /**
     * パフォーマンスメトリクスを更新
     */
    updatePerformanceMetrics(renderTime, elementCount) {
        this.performanceMetrics.renderTimes.push(renderTime);
        this.performanceMetrics.batchSizes.push(elementCount);
        
        // 古いメトリクスを制限
        if (this.performanceMetrics.renderTimes.length > 100) {
            this.performanceMetrics.renderTimes = this.performanceMetrics.renderTimes.slice(-50);
        }
        
        // キャッシュヒット率を計算
        const totalAccesses = this.stats.cacheHits + this.stats.cacheMisses;
        this.performanceMetrics.cacheHitRate = totalAccesses > 0 
            ? (this.stats.cacheHits / totalAccesses) * 100 
            : 0;
    }
    
    /**
     * 最適化統計を取得
     */
    getOptimizationStats() {
        const avgRenderTime = this.performanceMetrics.renderTimes.length > 0
            ? this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length
            : 0;
            
        const avgBatchSize = this.performanceMetrics.batchSizes.length > 0
            ? this.performanceMetrics.batchSizes.reduce((a, b) => a + b, 0) / this.performanceMetrics.batchSizes.length
            : 0;
        
        return {
            ...this.stats,
            averageRenderTime: Math.round(avgRenderTime * 100) / 100,
            averageBatchSize: Math.round(avgBatchSize),
            cacheHitRate: Math.round(this.performanceMetrics.cacheHitRate * 100) / 100,
            optimizationLevel: this.optimizationLevel,
            totalRenders: this.performanceMetrics.totalRenders,
            optimizedRenders: this.performanceMetrics.optimizedRenders,
            cacheSize: this.elementCache.size,
            measurementCacheSize: this.measurementCache.size,
            textContentCacheSize: this.textContentCache.size
        };
    }
    
    /**
     * 詳細パフォーマンス統計を取得
     */
    getDetailedPerformanceStats() {
        const stats = this.getOptimizationStats();
        
        return {
            ...stats,
            renderTimeDistribution: {
                min: Math.min(...this.performanceMetrics.renderTimes) || 0,
                max: Math.max(...this.performanceMetrics.renderTimes) || 0,
                median: this.calculateMedian(this.performanceMetrics.renderTimes),
                p95: this.calculatePercentile(this.performanceMetrics.renderTimes, 0.95)
            },
            fontLoadStats: {
                totalLoads: this.stats.fontLoads,
                preloadedFonts: this.fontOptimizer.preloadedFonts.size,
                averageLoadTime: this.calculateAverage(this.performanceMetrics.fontLoadTimes)
            },
            animationStats: {
                optimizedAnimations: this.stats.animationsOptimized,
                reducedMotionEnabled: this.animationOptimizer.reducedMotion,
                averageFrameTime: this.calculateAverage(this.performanceMetrics.animationFrameTimes)
            }
        };
    }
    
    /**
     * 中央値を計算
     */
    calculateMedian(values) {
        if (values.length === 0) return 0;
        
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    
    /**
     * パーセンタイルを計算
     */
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile) - 1;
        
        return sorted[Math.max(0, index)];
    }
    
    /**
     * 平均値を計算
     */
    calculateAverage(values) {
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config) {
        if (config.optimizationLevel) {
            this.optimizationLevel = config.optimizationLevel;
        }
        
        if (config.batchUpdateThreshold !== undefined) {
            this.batchUpdateThreshold = config.batchUpdateThreshold;
        }
        
        if (config.maxBatchSize !== undefined) {
            this.maxBatchSize = config.maxBatchSize;
        }
        
        if (config.fontOptimization !== undefined) {
            this.fontOptimizer.enabled = config.fontOptimization;
        }
        
        if (config.animationOptimization !== undefined) {
            this.animationOptimizer.enabled = config.animationOptimization;
        }
        
        console.log('RenderingOptimizer configuration updated:', config);
    }
    
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.elementCache.clear();
        this.textContentCache.clear();
        this.styleCache.clear();
        this.measurementCache.clear();
        
        console.log('RenderingOptimizer caches cleared');
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // フレームリクエストをキャンセル
        if (this.renderFrameId) {
            cancelAnimationFrame(this.renderFrameId);
        }
        
        // バッチタイマーをクリア
        if (this.batchProcessor.batchTimer) {
            clearTimeout(this.batchProcessor.batchTimer);
        }
        
        if (this.batchProcessor.maxWaitTimer) {
            clearTimeout(this.batchProcessor.maxWaitTimer);
        }
        
        // キャッシュをクリア
        this.clearCache();
        
        // CSS contain プロパティを元に戻す
        document.documentElement.style.contain = '';
        
        console.log('RenderingOptimizer cleaned up');
    }
}