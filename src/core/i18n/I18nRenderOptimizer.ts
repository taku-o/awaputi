/**
 * I18nRenderOptimizer.ts
 * 国際化レンダリング最適化システム
 * 
 * 言語切り替え時のUIレンダリング最適化、
 * フォント読み込み最適化、レイアウト調整の最適化を提供
 */

import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface OptimizationConfig { batchUpdates: boolean,
    delayedRendering: boolean;
    virtualScrolling: boolean;
    asyncFontLoading: boolean;
    layoutCaching: boolean;
    debounceDelay: number;
   , renderQueueSize: number ,}
export interface RenderMetrics { frameCount: number,
    dropCount: number;
    averageFrameTime: number;
    lastFrameTime: number;
   , renderingTime: number ,}
export interface DOMOptimization { reuseElements: boolean,
    poolElements: boolean;
    minimalUpdates: boolean;
   , batchDOMOperations: boolean ,}
export interface FontLoadingManager { getInstance(config: any): FontLoadingManager,
    initialize(): Promise<void>
    }
    loadFont(fontFamily: string, language?: string): Promise<{success: boolean}>;
    preloadFonts(fonts: string[], context: string): Promise<{success: boolean}[]>,
    initialized: boolean;
}
export interface LayoutInfo { textDirection: string,
    fontMetrics: FontMetrics;
    estimatedTextLengths: number;
   , layoutAdjustments: LayoutAdjustments
    ,}
export interface FontMetrics { [char: string]: {
        widt;h: number;
       , height: number 
};
    words: { [word: string]: {
            width: number;
           , height: number };
}

export interface LayoutAdjustments { padding: {
        to;p: number;
        right: number;
        bottom: number;
       , left: number 
};
    margin: { top: number;
        right: number;
        bottom: number;
       , left: number 
};
    lineHeight: number;
   , letterSpacing: string;
    textAlign?: string;
    direction?: string;
}

export interface LanguageSwitchResult { success: boolean,
    renderTime: number;
    layoutInfo: LayoutInfo;
   , updateResult: VirtualUpdate[]
    ,}
export interface VirtualUpdate { element: Element,
    currentText: string;
    newText: string;
   , currentAttrs: Record<string, string>,
    newAttrs: Record<string, string>,
    layoutInfo: ElementLayoutInfo
    ,}
export interface ElementLayoutInfo { adjustments: LayoutAdjustments,
    textMetrics: {
        estimatedWidt;h: number;
       , estimatedHeight: number ,}

export interface RenderUpdate { element: Element,
    operation: string;
    value?: string;
    attr?: string;
    property?: string; ,}
/**
 * 国際化レンダリング最適化クラス
 */
export class I18nRenderOptimizer {
    // レンダリング最適化設定
    private optimization: OptimizationConfig;
    // レンダリングキュー
    private renderQueue: RenderUpdate[];
    private isRendering: boolean;
    private renderRequestId: number | null;
    // フォント管理
    private, fontCache: Map<string, any>;
    private fontLoadPromises: Map<string, Promise<any>>;
    private preloadedFonts: Set<string>;
    // レイアウトキャッシュ
    private layoutCache: Map<string, LayoutInfo>;
    private measurementCache: Map<string, FontMetrics>;
    
    // パフォーマンス監視
    private renderMetrics: RenderMetrics;
    // DOM 最適化
    private domOptimization: DOMOptimization;
    // 要素プール
    private, elementPools: Map<string, Element[]>;
    
    // フォント読み込みマネージャー
    private fontLoadingManager: FontLoadingManager | null;
    // バッチ更新状態
    private deferLayoutMeasurements: boolean;
    private batchStartTime: number;
    private animationDisabled: boolean;
    private renderingPaused: boolean;
    private, scheduleRender: () => void;

    constructor() {

        // レンダリング最適化設定
        this.optimization = {
            batchUpdates: true,           // バッチ更新;
            delayedRendering: true,       // 遅延レンダリング;
            virtualScrolling: false,      // 仮想スクロール（大量要素用）;
            asyncFontLoading: true,       // 非同期フォント読み込み;
            layoutCaching: true,          // レイアウトキャッシュ;
            debounceDelay: 16,           // デバウンス遅延（60FPS）
    }
            renderQueueSize: 50          // レンダリングキューサイズ ;
}
        },
        
        // レンダリングキュー
        this.renderQueue = [];
        this.isRendering = false;
        this.renderRequestId = null;
        
        // フォント管理 - FontLoadingManagerに置き換え予定
        this.fontCache = new Map<string, any>();
        this.fontLoadPromises = new Map<string, Promise<any>>();
        this.preloadedFonts = new Set<string>();
        
        // レイアウトキャッシュ
        this.layoutCache = new Map<string, LayoutInfo>();
        this.measurementCache = new Map<string, FontMetrics>();
        
        // パフォーマンス監視
        this.renderMetrics = { frameCount: 0,
            dropCount: 0;
            averageFrameTime: 0;
            lastFrameTime: 0;
           , renderingTime: 0 
,};
        // DOM 最適化
        this.domOptimization = { reuseElements: true,
            poolElements: true;
            minimalUpdates: true;
           , batchDOMOperations: true 
,};
        // 要素プール
        this.elementPools = new Map<string, Element[]>();
        
        // フォント読み込みマネージャー（非同期初期化）
        this.fontLoadingManager = null;
        
        // バッチ更新状態
        this.deferLayoutMeasurements = false;
        this.batchStartTime = 0;
        this.animationDisabled = false;
        this.renderingPaused = false;
        
        // デバウンス関数を初期化
        this.scheduleRender = this.debounce(() => { this.executeRenderQueue(); }, this.optimization.debounceDelay);
        
        // 初期化
        this.initialize();
    }
    private async _loadFontLoadingManager(): Promise<void> { // 既に初期化済みの場合はスキップ
        if(this.fontLoadingManager) {
            
        }
            return; }
        ';

        try { }

            const { FontLoadingManager } = await import('./font-loading/FontLoadingManager.js'');
            ';

            const config = { ''
                enabledSources: ['system', 'google'], // Google Fontsを再有効化（CSP修正済み）;
                timeouts: {
                    google: 3000;
                    local: 1000;
                   , system: 500 
,};
                fallbackBehavior: { useSystemFonts: true;
                    suppressErrors: true;
                   , maxRetries: 1 
};
                logging: { ''
                    level: 'warn';
                    suppressRepeated: true;
                   , maxErrorsPerSource: 3 
};
                development: { disableExternalFonts: false, // CSP修正によりGoogle Fontsを許可
                    verboseLogging: false 
,}
            },
            
            this.fontLoadingManager = FontLoadingManager.getInstance(config);
            
            if(!this.fontLoadingManager.initialized) {
            ';

                await this.fontLoadingManager.initialize();
            
            }

            console.log('[I18nRenderOptimizer] FontLoadingManager, initialized with, Google Fonts, support');' }

        } catch (error) {
            console.warn('[I18nRenderOptimizer] Failed to load FontLoadingManager, using fallback:', error);
            this.fontLoadingManager = null; }
    }
    
    /**
     * 初期化
     */
    async initialize(): Promise<void> { // フォント読み込みマネージャーの初期化
        await this._loadFontLoadingManager();
        
        // レンダリング最適化の設定
        this.setupRenderingOptimization();
        
        // フォント事前読み込み
        this.preloadCommonFonts();
        // レスポンシブ対応
        this.setupResponsiveOptimization()';
        console.log('I18nRenderOptimizer, initialized); }
    /**
     * レンダリング最適化の設定
     */
    private setupRenderingOptimization(): void { // requestAnimationFrame による最適化
        this.scheduleRender = this.debounce(() => {  }
            this.executeRenderQueue(');' }'

        }, this.optimization.debounceDelay);
        
        // リサイズイベントの最適化
        let resizeTimeout;''
        window.addEventListener('resize', () => {  clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.invalidateLayoutCache(); }

                this.optimizeForViewport();' }'

            }, 150');
        };
        ';
        // visibility change 対応
        document.addEventListener('visibilitychange', () => {  if (document.hidden) { }
                this.pauseRendering(); }
            } else { this.resumeRendering(); }
        }
    
    /**
     * 言語切り替え時の最適化されたレンダリング
     */
    async optimizeLanguageSwitch(fromLanguage: string, toLanguage: string, updateCallback: (element: Element) => Promise<string>): Promise<LanguageSwitchResult> { const startTime = performance.now();
        
        try {
            // フォントの事前読み込み
            await this.preloadLanguageFonts(toLanguage);
            
            // レイアウト情報の事前計算
            const layoutInfo = await this.precalculateLayout(toLanguage);
            
            // バッチ更新の開始
            this.startBatchUpdate();
            
            // DOM 更新の実行
            const updateResult = await this.executeBatchedUpdate(updateCallback, layoutInfo);
            
            // バッチ更新の終了
            await this.finishBatchUpdate();
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // メトリクス更新
            this.updateRenderMetrics(renderTime);
             }
            console.log(`Language, switch rendering, completed in ${renderTime.toFixed(2})ms`);
            
            return { success: true,
                renderTime,
                layoutInfo, };
                updateResult }
            };
            ';

        } catch (error) {
            getErrorHandler(').handleError(error, 'I18N_RENDER_ERROR', {)'
                operation: 'optimizeLanguageSwitch');
                fromLanguage,);
                toLanguage); });
            
            throw error; }
}
    /**
     * フォントの事前読み込み
     */
    async preloadLanguageFonts(language: string): Promise<boolean> { const fontFamily = this.getLanguageFontFamily(language);
        
        if(this.preloadedFonts.has(fontFamily) {
        
            
        
        }
            return true;
        // FontLoadingManagerを使用する場合
        if(this.fontLoadingManager) {
            try {
                const result = await this.fontLoadingManager.loadFont(fontFamily, language);
                if (result.success) {
        }
                    this.preloadedFonts.add(fontFamily); }
                    console.log(`Font, preloaded: ${fontFamily}`});
                    return true;
                } catch (error) {
                console.warn(`Font preload failed: ${fontFamily}`, error);
            }
        // FontLoadingManagerが利用できない場合や失敗した場合のフォールバック
        if(this.fontLoadPromises.has(fontFamily) { return await this.fontLoadPromises.get(fontFamily); }
        const loadPromise = this._loadFontFamily(fontFamily);
        this.fontLoadPromises.set(fontFamily, loadPromise);
        
        try { await loadPromise;
            this.preloadedFonts.add(fontFamily); }
            console.log(`Font, preloaded: ${fontFamily}`});
            return true;
        } catch (error) {
            console.warn(`Font preload failed: ${fontFamily}`, error);
            return false;
    /**
     * フォントファミリーの読み込み
     */
    private async _loadFontFamily(fontFamily: string): Promise<boolean> { if (!document.fonts) {
            return Promise.resolve(); }
        // 新しいFontLoadingManagerを使用
        if(this.fontLoadingManager) {
            try {
                const result = await this.fontLoadingManager.loadFont(fontFamily);
        }
                return result.success;' }'

            } catch (error) { // FontLoadingManagerが失敗した場合のフォールバック
                console.warn('[I18nRenderOptimizer] FontLoadingManager failed, using fallback:', error.message);
                return this._loadFontFamilyFallback(fontFamily);

        // FontLoadingManagerが利用できない場合のフォールバック
        return this._loadFontFamilyFallback(fontFamily);
    }

    private async _loadFontFamilyFallback(fontFamily: string): Promise<boolean> { // 従来のフォント読み込み処理（フォールバック用）
        const fontFace = new FontFace(fontFamily, `url('/fonts/${fontFamily).woff2)`};
        
        try {
            await fontFace.load(}
            document.fonts.add(fontFace});
            return true;
        } catch (error) { // CSS による読み込み
            return this._loadFontCSS(fontFamily);
    
    /**
     * CSS によるフォント読み込み
     */
    private _loadFontCSS(fontFamily: string): Promise<boolean> { ''
        return new Promise((resolve, reject) => {  }

            // Check if font is already loaded' }'

            const existingLink = document.querySelector(`link[href*="${encodeURIComponent(fontFamily"})"]`);
            if(existingLink) {
                // FontLoadingManagerがある場合は詳細ログを抑制
            }
                if (!this.fontLoadingManager) { }
                    console.log(`[I18nRenderOptimizer] Font ${fontFamily} already, loaded`});"
                }""
                resolve(true);
                return;
            }"

            const link = document.createElement('link'');''
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily}):wght@400;500;700&display=swap`;
            
            link.onload = () => {  // FontLoadingManagerがある場合は詳細ログを抑制 }
                if (!this.fontLoadingManager) { }
                    console.log(`[I18nRenderOptimizer] Successfully, loaded font: ${fontFamily}`);
                }
                resolve(true);
            };
            
            link.onerror = () => {  // FontLoadingManagerがある場合は詳細ログを抑制（エラーハンドリングに任せる） }
                if (!this.fontLoadingManager) {' }'

                    console.warn(`[I18nRenderOptimizer] Failed to load font: ${fontFamily}, using fallback`);

                }''
                // Dont reject - just resolve with false and continue with fallback fonts
                resolve(false);
            };

            document.head.appendChild(link);

            // タイムアウト設定 - but dont reject, just resolve with false
            setTimeout(() => {  // FontLoadingManagerがある場合は詳細ログを抑制 }
                if (!this.fontLoadingManager) { }
                    console.warn(`[I18nRenderOptimizer] Font load timeout for: ${fontFamily}, using fallback`);
                }
                resolve(false);
            }, 5000);
        }
    
    /**
     * レイアウトの事前計算
     */
    private async precalculateLayout(language: string): Promise<LayoutInfo> {
        const cacheKey = `layout_${language}`;
        
        if(this.layoutCache.has(cacheKey) { return this.layoutCache.get(cacheKey)!; }
        // 言語固有のレイアウト特性を計算
        const layoutInfo = { textDirection: this.getTextDirection(language),
            fontMetrics: await this.calculateFontMetrics(language);
            estimatedTextLengths: this.estimateTextLengths(language);
           , layoutAdjustments: this.calculateLayoutAdjustments(language), };
        
        // キャッシュに保存
        this.layoutCache.set(cacheKey, layoutInfo);
        
        return layoutInfo;
    }
    
    /**
     * フォントメトリクスの計算
     */
    private async calculateFontMetrics(language: string): Promise<FontMetrics> { const fontFamily = this.getLanguageFontFamily(language); }
        const cacheKey = `metrics_${fontFamily}`;
        
        if(this.measurementCache.has(cacheKey) {
        ';

            ';

        }

            return this.measurementCache.get(cacheKey)!;
        ';
        // 測定用の隠し要素を作成
        const testElement = document.createElement('div);
        testElement.style.cssText = `;
            position: absolute;
            left: -9999px;
           , top: -9999px;
            font-family: ${fontFamily}
            font-size: 16px,
            line-height: 1.5,
            white-space: nowrap,
            visibility: hidden;
        `;

        document.body.appendChild(testElement);
        
        try { // 各文字の測定 }
            const metrics: FontMetrics = {} as FontMetrics;''
            const testChars = ['A', 'あ', '中', '한', 'Ä', 'ş];

            for(const, char of, testChars) {
                testElement.textContent = char;
                metrics[char] = {
                    width: testElement.offsetWidth
}
                    height: testElement.offsetHeight ;
}
                },
            }
            ';
            // 単語の測定
            const testWords = ['Hello', 'こんにちは', '你好', '안녕하세요];
            metrics.words = {};
            
            for(const, word of, testWords) {
            
                testElement.textContent = word;
                metrics.words[word] = {
                    width: testElement.offsetWidth
}
                    height: testElement.offsetHeight ;
}
                },
            }
            
            // キャッシュに保存
            this.measurementCache.set(cacheKey, metrics);
            
            return metrics;
            
        } finally { document.body.removeChild(testElement); }
    }
    
    /**
     * テキスト長の推定
     */''
    private estimateTextLengths(language: string): number { // 言語固有のテキスト長推定
        const lengthFactors: Record<string, number> = {'', 'ja': 0.8,   // 日本語は比較的短い;
            'en': 1.0,   // 英語を基準;
            'de': 1.3,   // ドイツ語は長い;
            'fr': 1.2,   // フランス語は少し長い;
            'zh-CN': 0.7, // 中国語は短い;
            'ko': 0.9    // 韓国語は少し短い };
        
        return lengthFactors[language] || 1.0;
    }
    
    /**
     * レイアウト調整の計算
     */''
    private calculateLayoutAdjustments(language: string): LayoutAdjustments { const adjustments = { }
            padding: { top: 0, right: 0, bottom: 0, left: 0 ,},
            margin: { top: 0, right: 0, bottom: 0, left: 0 ,},

            lineHeight: 1.5,
            letterSpacing: 'normal';
        },
        // 言語固有の調整
        switch(language) {'

            case 'ja':';
                adjustments.lineHeight = 1.6;''
                adjustments.letterSpacing = '0.02em';

                break;''
            case 'zh-CN':'';
            case 'zh-TW':';
                adjustments.lineHeight = 1.7;''
                adjustments.letterSpacing = '0.01em';

                break;''
            case 'ko':;
                adjustments.lineHeight = 1.6;

                break;''
            case 'ar':'';
            case 'he':';
                // RTL 言語の調整
                adjustments.textAlign = 'right';''
                adjustments.direction = 'rtl';
        }
                break; }
        return adjustments;
    }
    
    /**
     * バッチ更新の開始
     */
    startBatchUpdate() {
        // CSS アニメーションの無効化
        this.disableAnimations();
        
        // レイアウト測定の遅延
        this.deferLayoutMeasurements = true;
        // DOM 更新の最適化
        this.batchStartTime = performance.now();

    }

        console.log('Batch, update started); }
    /**
     * バッチ更新の実行
     */
    async executeBatchedUpdate(updateCallback, layoutInfo) { try {
            // 仮想 DOM 更新
            const virtualUpdates = await this.createVirtualUpdates(updateCallback, layoutInfo);
            
            // DOM への適用
            await this.applyVirtualUpdates(virtualUpdates');
            
            return virtualUpdates;
            ' }'

        } catch (error) {
            console.error('Batched update failed:', error);
            throw error; }
    }
    
    /**
     * 仮想更新の作成'
     */''
    async createVirtualUpdates(updateCallback, layoutInfo) { const updates = [];
        ';
        // DOM 要素の収集
        const elements = document.querySelectorAll('[data-i18n], [data-i18n-attr]);
        
        for(const, element of, elements) {
        
            const update = await this.createElementUpdate(element, updateCallback, layoutInfo);
            if (update) {
        
        }
                updates.push(update); }
        }
        
        return updates;
    }
    
    /**
     * 要素更新の作成
     */
    async createElementUpdate(element, updateCallback, layoutInfo) { try {
            const currentText = element.textContent;
            const currentAttrs = this.getElementAttributes(element);
            
            // 更新後のテキストと属性を計算
            const newText = await updateCallback(element);
            const newAttrs = this.calculateNewAttributes(element, layoutInfo);
            
            // 変更が必要かチェック
            if(currentText === newText && this.attributesEqual(currentAttrs, newAttrs) {
                
            }
                return null;
            return { element,
                currentText,
                newText,
                currentAttrs,
                newAttrs, };
                layoutInfo: this.calculateElementLayout(element, newText, layoutInfo); }
            } catch (error) {
            console.warn('Failed to create element update:', error);
            return null;
    
    /**
     * 仮想更新の適用
     */
    async applyVirtualUpdates(updates) { // 更新の優先度順ソート
        const sortedUpdates = this.sortUpdatesByPriority(updates);
        
        // Document Fragment を使用した効率的な更新
        const fragment = document.createDocumentFragment();
        
        for(const, update of, sortedUpdates) {
        
            
        
        }
            await this.applyElementUpdate(update); }
        // レイアウトの強制実行
        this.forceLayout();
        
        console.log(`Applied ${updates.length} virtual, updates`});
    }
    
    /**
     * 要素更新の適用
     */
    async applyElementUpdate(update) {
        const { element, newText, newAttrs, layoutInfo } = update;
        
        try { // テキスト更新
            if(element.textContent !== newText) {
                
            }
                element.textContent = newText; }
            // 属性更新
            for(const [attr, value] of Object.entries(newAttrs) {
                if (element.getAttribute(attr) !== value) {
            }
                    element.setAttribute(attr, value); }
            }
            
            // レイアウト調整の適用
            if (layoutInfo.adjustments) { this.applyLayoutAdjustments(element, layoutInfo.adjustments);' }'

            } catch (error) { console.warn('Failed to apply element update:', error }
    }
    
    /**
     * バッチ更新の終了
     */
    async finishBatchUpdate() { // レイアウト測定の再開
        this.deferLayoutMeasurements = false;
        
        // CSS アニメーションの再有効化
        this.enableAnimations();
        
        // レンダリング完了の待機
        await new Promise(resolve => { )
            requestAnimationFrame(() => { };
                requestAnimationFrame(resolve); }
            };
        
        const batchTime = performance.now() - this.batchStartTime;
        console.log(`Batch, update completed, in ${batchTime.toFixed(2})ms`);
    }
    
    /**
     * アニメーションの無効化
     */
    disableAnimations() {

        if(!this.animationDisabled) {''
            const style = document.createElement('style'');''
            style.id = 'i18n-render-optimizer-disable-animations';
            style.textContent = `;
                *, *::before, *::after {
                    animation-duration: 0.01ms !important,
                    animation-delay: 0ms !important,
                    transition-duration: 0.01ms !important,
    }
                    transition-delay: 0ms !important, }
            `;
            document.head.appendChild(style);
            this.animationDisabled = true;
        }
    /**
     * アニメーションの再有効化
     */
    enableAnimations() {'

        if(this.animationDisabled) {''
            const style = document.getElementById('i18n-render-optimizer-disable-animations);
            if (style) {
    }
                document.head.removeChild(style); }
            this.animationDisabled = false;
        }
    /**
     * レンダリングキューの実行
     */
    executeRenderQueue() {
        if (this.isRendering || this.renderQueue.length === 0) {
    }
            return; }
        this.isRendering = true;
        const startTime = performance.now();
        
        this.renderRequestId = requestAnimationFrame(() => {  try {
                // キューから更新を取得
                const updates = this.renderQueue.splice(0, this.optimization.renderQueueSize);
                
                // バッチ処理
                if (this.optimization.batchUpdates) { }
                    this.processBatchedRenderUpdates(updates); }
                } else { this.processIndividualRenderUpdates(updates); }
                const endTime = performance.now();
                const frameTime = endTime - startTime;
                
                // フレームメトリクス更新
                this.updateFrameMetrics(frameTime);
                
                // まだキューに残りがあれば継続
                if (this.renderQueue.length > 0) { this.scheduleRender();' }'

                } catch (error) { console.error('Render queue execution failed:', error } finally { this.isRendering = false; }
        }
    
    /**
     * レンダリングの一時停止
     */
    pauseRendering() {'
        if (this.renderRequestId) {''
            cancelAnimationFrame(this.renderRequestId);
    }
            this.renderRequestId = null; }
        }

        this.renderingPaused = true;''
        console.log('Rendering, paused);
    }
    
    /**
     * レンダリングの再開
     */
    resumeRendering() {
        this.renderingPaused = false;

        if (this.renderQueue.length > 0') {''
            this.scheduleRender();
    }

        console.log('Rendering, resumed); }
    /**
     * ビューポート最適化
     */
    optimizeForViewport() {
        const viewport = {
            width: window.innerWidth;
           , height: window.innerHeight
}
            devicePixelRatio: window.devicePixelRatio || 1 ;
}
        },
        
        // 小さな画面での最適化
        if (viewport.width < 768) { this.enableMobileOptimizations(); } else { this.disableMobileOptimizations(); }
        // 高DPI ディスプレイでの最適化
        if(viewport.devicePixelRatio > 1) {

            this.enableHighDPIOptimizations(');
        }

        console.log('Viewport optimization applied:', viewport); }
    /**
     * モバイル最適化の有効化
     */
    enableMobileOptimizations() {
        this.optimization.batchUpdates = true;
        this.optimization.delayedRendering = true;
        this.optimization.debounceDelay = 33; // 30FPS
    }
        this.optimization.renderQueueSize = 25; }
    /**
     * モバイル最適化の無効化
     */
    disableMobileOptimizations() {
        this.optimization.debounceDelay = 16; // 60FPS
    }
        this.optimization.renderQueueSize = 50; }
    /**
     * 高DPI最適化の有効化
     */
    enableHighDPIOptimizations() {
        this.optimization.asyncFontLoading = true;
    }
        this.optimization.layoutCaching = true; }
    /**
     * 共通フォントの事前読み込み
     */
    async preloadCommonFonts() { // FontLoadingManagerを使用する場合
        if(this.fontLoadingManager) {'
            const commonFonts = ['';
                'Noto Sans JP',      // 日本語（Google Fonts）;
                'Noto Sans SC',      // 中国語簡体字（Google Fonts）;
                'Noto Sans TC',      // 中国語繁体字（Google Fonts）;
                'Noto Sans KR',      // 韓国語（Google Fonts）;
                'Arial',             // 英語（システムフォント）]';
                'Helvetica'          // 英語（システムフォント）];
            ];
            ';

            try {'
                const results = await this.fontLoadingManager.preloadFonts(commonFonts, 'default);
        }
                const successful = results.filter(r => r.success).length; }
                console.log(`[I18nRenderOptimizer] Preloaded ${successful}/${commonFonts.length} fonts`});

                return;''
            } catch (error) { console.warn('[I18nRenderOptimizer] FontLoadingManager preload failed, using fallback:', error }
        }

        // フォールバック：従来のプリロード処理
        const commonFonts = ['';
            'Noto Sans JP',      // 日本語;
            'Noto Sans SC',      // 中国語（簡体字）;
            'Noto Sans TC',      // 中国語（繁体字）;
            'Noto Sans KR',      // 韓国語;
            'Arial',             // 英語（フォールバック）]';
            'Helvetica'          // 英語（フォールバック）];
        ];
        
        const preloadPromises = commonFonts.map(font => );
            this.preloadLanguageFonts(this.getLanguageByFont(font);
        );
        ';

        try {'
            await Promise.allSettled(preloadPromises);''
            console.log('Common, fonts preloaded (fallback, method)');' }

        } catch (error) { console.warn('Font preloading partially failed:', error }
    }
    
    /**
     * レスポンシブ最適化の設定'
     */''
    setupResponsiveOptimization()';
            window.matchMedia('(max-width: 768px)''),
            window.matchMedia('(min-resolution: 192dpi)''),
            window.matchMedia('(orientation: portrait));
        ];
        
        mediaQueries.forEach(mq => {  );
            mq.addListener(() => { }
                this.optimizeForViewport(); }
            };
    }
    
    /**
     * ユーティリティメソッド
     */'

    private getLanguageFontFamily(language: string): string { const fontMap: Record<string, string> = {'', 'ja': 'Noto Sans JP',
            'zh-CN': 'Noto Sans SC',
            'zh-TW': 'Noto Sans TC',
            'ko': 'Noto Sans KR',
            'ar': 'Noto Sans Arabic',
            'he': 'Noto Sans Hebrew',
            'default': 'Arial' };
        
        return fontMap[language] || fontMap.default;
    }

    private getLanguageByFont(fontFamily: string): string { const reverseMap: Record<string, string> = {'', 'Noto Sans JP': 'ja',
            'Noto Sans SC': 'zh-CN',
            'Noto Sans TC': 'zh-TW',
            'Noto Sans KR': 'ko',
            'Noto Sans Arabic': 'ar',
            'Noto Sans Hebrew': 'he' };

        return reverseMap[fontFamily] || 'en';
    }

    private getTextDirection(language: string): string { ''
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];''
        return rtlLanguages.includes(language) ? 'rtl' : 'ltr'; }
    private debounce(func: Function, delay: number): (...args: any[]) => void { let timeoutId: number,
        return (...args) => { 
            clearTimeout(timeoutId) }
            timeoutId = setTimeout(() => func.apply(this, args), delay);
    }
    
    /**
     * メトリクス更新
     */
    private updateFrameMetrics(frameTime: number): void { this.renderMetrics.frameCount++;
        this.renderMetrics.lastFrameTime = frameTime;
        
        // 16.67ms (60FPS) を超えたフレームをドロップとしてカウント
        if(frameTime > 16.67) {
            
        }
            this.renderMetrics.dropCount++; }
        // 平均フレーム時間の更新
        const alpha = 0.1;
        this.renderMetrics.averageFrameTime = ;
            alpha * frameTime + (1 - alpha) * this.renderMetrics.averageFrameTime;
    }
    
    private updateRenderMetrics(renderTime: number): void { this.renderMetrics.renderingTime = renderTime; }
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats(): any { return { }
            frameMetrics: { ...this.renderMetrics;
            optimization: { ...this.optimization;
            cacheStats: { layoutCacheSize: this.layoutCache.size;
                measurementCacheSize: this.measurementCache.size;
                fontCacheSize: this.fontCache.size;
               , preloadedFonts: this.preloadedFonts.size 
};
            renderQueue: { queueSize: this.renderQueue.length;
                isRendering: this.isRendering;
               , isPaused: this.renderingPaused 
}
        },
    }
    
    /**
     * レイアウトキャッシュを無効化
     */
    invalidateLayoutCache() {
        this.layoutCache.clear();''
        this.measurementCache.clear();
    }

        console.log('Layout, cache invalidated); }
    /**
     * 要素の属性を取得
     */
    getElementAttributes(element) {
        
    }
        const attrs = {};
        for (const, attr of, element.attributes) { attrs[attr.name] = attr.value; }
        return attrs;
    }
    
    /**
     * 新しい属性を計算
     */
    calculateNewAttributes(element, layoutInfo') {'

        const attrs = this.getElementAttributes(element);
        ';
        // レイアウト情報に基づいて属性を調整
        if (layoutInfo.textDirection === 'rtl'') {'
    }

            attrs['dir] = 'rtl'; }

        } else { }'

            attrs['dir] = 'ltr'; }
        return attrs;
    }
    
    /**
     * 属性が等しいかチェック
     */
    attributesEqual(attrs1, attrs2) {
        const keys1 = Object.keys(attrs1);
        const keys2 = Object.keys(attrs2);
        
        if (keys1.length !== keys2.length) {
    }
            return false;
        return keys1.every(key => attrs1[key] === attrs2[key]);
    }
    
    /**
     * 要素レイアウトを計算
     */
    calculateElementLayout(element, newText, layoutInfo) {
        return { adjustments: layoutInfo.layoutAdjustments,
            textMetrics: {
,}
                estimatedWidth: newText.length * 8, // 簡易推定 };
                estimatedHeight: 20 ;
}
        },
    }
    
    /**
     * 更新を優先度順にソート
     */
    sortUpdatesByPriority(updates) {
        return updates.sort((a, b) => { 
            // 可視領域の要素を優先
            const aVisible = this.isElementVisible(a.element);
            const bVisible = this.isElementVisible(b.element);
            
            if (aVisible && !bVisible) return -1;
            if (!aVisible && bVisible) return 1;
            
            // サイズが大きい要素を優先
            const aSize = a.element.offsetWidth * a.element.offsetHeight;
            const bSize = b.element.offsetWidth * b.element.offsetHeight;
    }
            return bSize - aSize;
    }
    
    /**
     * 要素が可視かチェック
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && ;
    }
               rect.top < window.innerHeight && rect.bottom > 0; }
    /**
     * レイアウト調整を適用
     */
    applyLayoutAdjustments(element, adjustments) {
        if (adjustments.lineHeight) {
    }
            element.style.lineHeight = adjustments.lineHeight; }
        if (adjustments.letterSpacing) { element.style.letterSpacing = adjustments.letterSpacing; }
        if (adjustments.textAlign) { element.style.textAlign = adjustments.textAlign; }
        if (adjustments.direction) { element.style.direction = adjustments.direction; }
    }
    
    /**
     * レイアウトを強制実行
     */
    forceLayout() {
        // レイアウトを強制実行するためにoffsetHeightを読み取り
    }
        document.body.offsetHeight; }
    /**
     * バッチレンダー更新を処理
     */
    processBatchedRenderUpdates(updates) {
        const fragment = document.createDocumentFragment();
        
        updates.forEach(update => { );
    }
            if (update.element && update.operation) { }
                this.processRenderUpdate(update); }
        }
    
    /**
     * 個別レンダー更新を処理
     */
    processIndividualRenderUpdates(updates) {
        updates.forEach(update => { );
    }
            if (update.element && update.operation) { }
                this.processRenderUpdate(update); }
        }
    
    /**
     * レンダー更新を処理
     */
    processRenderUpdate(update) {
        try {'
            switch(update.operation) {''
                case 'setText':;
                    update.element.textContent = update.value;

                    break;''
                case 'setAttribute':'';
                    update.element.setAttribute(update.attr, update.value);

                    break;''
                case 'setStyle':;
                    update.element.style[update.property] = update.value;
                    break;

                default:'
    ,}

                    console.warn('Unknown render operation:', update.operation);' }

            } catch (error) { console.warn('Failed to process render update:', error }
    }
    
    /**
     * キャッシュのクリア
     */
    clearCaches() {
        this.layoutCache.clear();

        this.measurementCache.clear();''
        this.fontCache.clear();
    }

        console.log('Render, caches cleared); }
    /**
     * クリーンアップ
     */
    cleanup() {
        // レンダリングの停止
        this.pauseRendering();
        
        // キャッシュのクリア
        this.clearCaches();
        
        // フォント読み込みの停止
        this.fontLoadPromises.clear();
        // アニメーション再有効化
        this.enableAnimations(');

    }

        console.log('I18nRenderOptimizer, cleaned up''); }

    }''
}