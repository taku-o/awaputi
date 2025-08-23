/**
 * I18nRenderOptimizer.ts
 * 国際化レンダリング最適化システム
 * 
 * 言語切り替え時のUIレンダリング最適化、
 * フォント読み込み最適化、レイアウト調整の最適化を提供
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface OptimizationConfig {
    batchUpdates: boolean;
    delayedRendering: boolean;
    virtualScrolling: boolean;
    asyncFontLoading: boolean;
    layoutCaching: boolean;
    debounceDelay: number;
    renderQueueSize: number;
}

export interface RenderMetrics {
    frameCount: number;
    dropCount: number;
    averageFrameTime: number;
    lastFrameTime: number;
    renderingTime: number;
}

export interface DOMOptimization {
    reuseElements: boolean;
    poolElements: boolean;
    minimalUpdates: boolean;
    batchDOMOperations: boolean;
}

export interface FontLoadingManager {
    getInstance(config: any): FontLoadingManager;
    initialize(): Promise<void>;
    loadFont(fontFamily: string, language?: string): Promise<{success: boolean}>;
    preloadFonts(fonts: string[], context: string): Promise<{success: boolean}[]>;
    initialized: boolean;
}

export interface LayoutInfo {
    textDirection: string;
    fontMetrics: FontMetrics;
    estimatedTextLengths: number;
    layoutAdjustments: LayoutAdjustments;
}

export interface FontMetrics {
    [char: string]: {
        width: number;
        height: number;
        words: { [word: string]: {
            width: number;
            height: number;
        }};
    };
}

export interface LayoutAdjustments {
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    lineHeight: number;
    letterSpacing: string;
    textAlign?: string;
    direction?: string;
}

export interface LanguageSwitchResult {
    success: boolean;
    renderTime: number;
    layoutInfo: LayoutInfo;
    updateResult: VirtualUpdate[];
}

export interface VirtualUpdate {
    element: Element;
    currentText: string;
    newText: string;
    currentAttrs: Record<string, string>;
    newAttrs: Record<string, string>;
    layoutInfo: ElementLayoutInfo;
}

export interface ElementLayoutInfo {
    adjustments: LayoutAdjustments;
    textMetrics: {
        estimatedWidth: number;
        estimatedHeight: number;
    };
}

export interface RenderUpdate {
    element: Element;
    operation: string;
    value?: string;
    attr?: string;
    property?: string;
}

export interface RenderBatch {
    updates: RenderUpdate[];
    priority: number;
    timestamp: number;
}

export interface FontPreloadResult {
    font: string;
    loaded: boolean;
    cached: boolean;
    loadTime: number;
}

export interface RenderContext {
    element: Element;
    language: string;
    direction: string;
    fontFamily?: string;
    shouldPreload: boolean;
}

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
    private fontCache: Map<string, any>;
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
    private elementPools: Map<string, Element[]>;
    
    // フォント読み込みマネージャー
    private fontLoadingManager: FontLoadingManager | null;
    
    // バッチ更新状態
    private deferLayoutMeasurements: boolean;
    private batchStartTime: number;
    private animationDisabled: boolean;
    private renderingPaused: boolean;
    private scheduleRender: () => void;

    constructor() {
        // レンダリング最適化設定
        this.optimization = {
            batchUpdates: true,           // バッチ更新
            delayedRendering: true,       // 遅延レンダリング
            virtualScrolling: false,      // 仮想スクロール（大量要素用）
            asyncFontLoading: true,       // 非同期フォント読み込み
            layoutCaching: true,          // レイアウトキャッシュ
            debounceDelay: 16,           // デバウンス遅延（60FPS）
            renderQueueSize: 50          // レンダリングキューサイズ
        };
        
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
        this.renderMetrics = {
            frameCount: 0,
            dropCount: 0,
            averageFrameTime: 0,
            lastFrameTime: 0,
            renderingTime: 0
        };
        
        // DOM 最適化
        this.domOptimization = {
            reuseElements: true,
            poolElements: true,
            minimalUpdates: true,
            batchDOMOperations: true
        };
        
        // 要素プール
        this.elementPools = new Map<string, Element[]>();
        
        // フォント読み込みマネージャー
        this.fontLoadingManager = null;
        
        // バッチ更新状態
        this.deferLayoutMeasurements = false;
        this.batchStartTime = 0;
        this.animationDisabled = false;
        this.renderingPaused = false;
        
        // レンダリングスケジューラー
        this.scheduleRender = this.createRenderScheduler();
        
        console.log('I18nRenderOptimizer initialized');
    }
    
    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        try {
            // フォント読み込みマネージャーの初期化
            await this.initializeFontManager();
            
            // パフォーマンス監視開始
            this.startPerformanceMonitoring();
            
            console.log('I18nRenderOptimizer initialized successfully');
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'I18N_RENDER_OPTIMIZER_INIT', {
                operation: 'initialize'
            });
            throw error;
        }
    }
    
    /**
     * 言語切り替え時の最適化処理
     */
    async optimizeLanguageSwitch(
        elements: Element[],
        translations: Record<string, string>,
        targetLanguage: string,
        options: { preloadFonts?: boolean; animateTransitions?: boolean } = {}
    ): Promise<LanguageSwitchResult> {
        const startTime = performance.now();
        
        try {
            const { preloadFonts = true, animateTransitions = true } = options;
            
            // アニメーションを一時的に無効化（パフォーマンス向上）
            if (!animateTransitions) {
                this.animationDisabled = true;
            }
            
            // フォントの事前読み込み
            if (preloadFonts) {
                await this.preloadLanguageFonts(targetLanguage);
            }
            
            // レイアウト情報を計算
            const layoutInfo = await this.calculateLayoutInfo(targetLanguage, translations);
            
            // 仮想更新を準備
            const virtualUpdates = await this.prepareVirtualUpdates(elements, translations, layoutInfo);
            
            // バッチレンダリング実行
            await this.executeBatchRender(virtualUpdates);
            
            // アニメーション復元
            if (!animateTransitions) {
                this.animationDisabled = false;
            }
            
            const renderTime = performance.now() - startTime;
            this.updateRenderMetrics(renderTime);
            
            return {
                success: true,
                renderTime,
                layoutInfo,
                updateResult: virtualUpdates
            };
            
        } catch (error) {
            this.animationDisabled = false;
            
            getErrorHandler().handleError(error as Error, 'I18N_RENDER_OPTIMIZER_ERROR', {
                operation: 'optimizeLanguageSwitch',
                targetLanguage,
                elementCount: elements.length
            });
            
            return {
                success: false,
                renderTime: performance.now() - startTime,
                layoutInfo: this.getDefaultLayoutInfo(),
                updateResult: []
            };
        }
    }
    
    /**
     * フォント読み込みマネージャーの初期化
     */
    private async initializeFontManager(): Promise<void> {
        try {
            // FontLoadingManagerが利用可能な場合は使用
            if (this.fontLoadingManager) {
                await this.fontLoadingManager.initialize();
            }
        } catch (error) {
            console.warn('FontLoadingManager initialization failed, using fallback:', error);
            // フォールバック処理
        }
    }
    
    /**
     * 言語固有フォントの事前読み込み
     */
    private async preloadLanguageFonts(language: string): Promise<FontPreloadResult[]> {
        const results: FontPreloadResult[] = [];
        
        try {
            // 言語別フォント設定
            const languageFonts = this.getLanguageFonts(language);
            
            for (const font of languageFonts) {
                const startTime = performance.now();
                
                // キャッシュチェック
                if (this.preloadedFonts.has(font)) {
                    results.push({
                        font,
                        loaded: true,
                        cached: true,
                        loadTime: 0
                    });
                    continue;
                }
                
                // フォント読み込み
                const loadResult = await this.loadFont(font, language);
                const loadTime = performance.now() - startTime;
                
                if (loadResult.success) {
                    this.preloadedFonts.add(font);
                }
                
                results.push({
                    font,
                    loaded: loadResult.success,
                    cached: false,
                    loadTime
                });
            }
            
        } catch (error) {
            console.warn('Font preloading failed:', error);
        }
        
        return results;
    }
    
    /**
     * レイアウト情報の計算
     */
    private async calculateLayoutInfo(language: string, translations: Record<string, string>): Promise<LayoutInfo> {
        const cacheKey = `${language}-${Object.keys(translations).join(',')}`;
        
        // キャッシュチェック
        if (this.optimization.layoutCaching && this.layoutCache.has(cacheKey)) {
            return this.layoutCache.get(cacheKey)!;
        }
        
        try {
            const textDirection = this.getTextDirection(language);
            const fontMetrics = await this.calculateFontMetrics(language, translations);
            const estimatedTextLengths = this.estimateTextLengths(translations);
            const layoutAdjustments = this.calculateLayoutAdjustments(language, textDirection);
            
            const layoutInfo: LayoutInfo = {
                textDirection,
                fontMetrics,
                estimatedTextLengths,
                layoutAdjustments
            };
            
            // キャッシュに保存
            if (this.optimization.layoutCaching) {
                this.layoutCache.set(cacheKey, layoutInfo);
            }
            
            return layoutInfo;
            
        } catch (error) {
            console.warn('Layout calculation failed:', error);
            return this.getDefaultLayoutInfo();
        }
    }
    
    /**
     * 仮想更新の準備
     */
    private async prepareVirtualUpdates(
        elements: Element[],
        translations: Record<string, string>,
        layoutInfo: LayoutInfo
    ): Promise<VirtualUpdate[]> {
        const updates: VirtualUpdate[] = [];
        
        for (const element of elements) {
            try {
                const translationKey = this.getTranslationKey(element);
                if (!translationKey || !translations[translationKey]) continue;
                
                const currentText = this.getCurrentElementText(element);
                const newText = translations[translationKey];
                
                if (currentText === newText) continue;
                
                const currentAttrs = this.getCurrentElementAttrs(element);
                const newAttrs = this.calculateNewElementAttrs(element, layoutInfo);
                const elementLayoutInfo = this.calculateElementLayoutInfo(element, newText, layoutInfo);
                
                updates.push({
                    element,
                    currentText,
                    newText,
                    currentAttrs,
                    newAttrs,
                    layoutInfo: elementLayoutInfo
                });
                
            } catch (error) {
                console.warn('Failed to prepare virtual update for element:', element, error);
            }
        }
        
        return updates;
    }
    
    /**
     * バッチレンダリングの実行
     */
    private async executeBatchRender(updates: VirtualUpdate[]): Promise<void> {
        if (!this.optimization.batchUpdates) {
            return this.executeImmediateRender(updates);
        }
        
        // 優先度別にバッチ作成
        const batches = this.createRenderBatches(updates);
        
        // バッチを順次実行
        for (const batch of batches) {
            await this.processBatch(batch);
            
            // フレーム間の余裕を確保
            if (batch.priority < 3) {
                await this.waitForNextFrame();
            }
        }
    }
    
    /**
     * 即座レンダリングの実行
     */
    private async executeImmediateRender(updates: VirtualUpdate[]): Promise<void> {
        for (const update of updates) {
            this.applyVirtualUpdate(update);
        }
    }
    
    /**
     * レンダリングバッチの作成
     */
    private createRenderBatches(updates: VirtualUpdate[]): RenderBatch[] {
        const batches: RenderBatch[] = [];
        const batchSize = Math.ceil(updates.length / Math.max(1, Math.floor(updates.length / this.optimization.renderQueueSize)));
        
        for (let i = 0; i < updates.length; i += batchSize) {
            const batchUpdates = updates.slice(i, i + batchSize);
            const renderUpdates: RenderUpdate[] = batchUpdates.map(update => ({
                element: update.element,
                operation: 'textContent',
                value: update.newText
            }));
            
            batches.push({
                updates: renderUpdates,
                priority: this.calculateBatchPriority(batchUpdates),
                timestamp: Date.now()
            });
        }
        
        return batches.sort((a, b) => b.priority - a.priority);
    }
    
    /**
     * バッチの処理
     */
    private async processBatch(batch: RenderBatch): Promise<void> {
        const startTime = performance.now();
        
        try {
            // DOM操作をバッチ化
            if (this.domOptimization.batchDOMOperations) {
                this.executeBatchDOMOperations(batch.updates);
            } else {
                for (const update of batch.updates) {
                    this.applyRenderUpdate(update);
                }
            }
            
            this.renderMetrics.frameCount++;
            
        } catch (error) {
            console.error('Batch processing failed:', error);
            this.renderMetrics.dropCount++;
        }
        
        const processingTime = performance.now() - startTime;
        this.updateFrameTime(processingTime);
    }
    
    /**
     * バッチDOM操作の実行
     */
    private executeBatchDOMOperations(updates: RenderUpdate[]): void {
        // DocumentFragmentを使用した効率的な更新
        const fragment = document.createDocumentFragment();
        
        for (const update of updates) {
            if (update.operation === 'textContent' && update.value) {
                (update.element as HTMLElement).textContent = update.value;
            }
        }
    }
    
    /**
     * レンダリング更新の適用
     */
    private applyRenderUpdate(update: RenderUpdate): void {
        try {
            if (update.operation === 'textContent' && update.value) {
                (update.element as HTMLElement).textContent = update.value;
            } else if (update.operation === 'setAttribute' && update.attr && update.value) {
                update.element.setAttribute(update.attr, update.value);
            } else if (update.operation === 'property' && update.property && update.value) {
                (update.element as any)[update.property] = update.value;
            }
        } catch (error) {
            console.warn('Failed to apply render update:', update, error);
        }
    }
    
    /**
     * 仮想更新の適用
     */
    private applyVirtualUpdate(update: VirtualUpdate): void {
        try {
            // テキストコンテンツの更新
            (update.element as HTMLElement).textContent = update.newText;
            
            // 属性の更新
            for (const [attr, value] of Object.entries(update.newAttrs)) {
                if (update.currentAttrs[attr] !== value) {
                    update.element.setAttribute(attr, value);
                }
            }
            
            // レイアウト調整の適用
            this.applyLayoutAdjustments(update.element, update.layoutInfo.adjustments);
            
        } catch (error) {
            console.warn('Failed to apply virtual update:', update, error);
        }
    }
    
    /**
     * レイアウト調整の適用
     */
    private applyLayoutAdjustments(element: Element, adjustments: LayoutAdjustments): void {
        const htmlElement = element as HTMLElement;
        
        if (adjustments.direction) {
            htmlElement.style.direction = adjustments.direction;
        }
        
        if (adjustments.textAlign) {
            htmlElement.style.textAlign = adjustments.textAlign;
        }
        
        htmlElement.style.lineHeight = adjustments.lineHeight.toString();
        htmlElement.style.letterSpacing = adjustments.letterSpacing;
    }

    // ヘルパーメソッド
    private createRenderScheduler(): () => void {
        let timeoutId: NodeJS.Timeout | null = null;
        
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            timeoutId = setTimeout(() => {
                this.processRenderQueue();
            }, this.optimization.debounceDelay);
        };
    }
    
    private async processRenderQueue(): Promise<void> {
        if (this.isRendering || this.renderingPaused) return;
        
        this.isRendering = true;
        
        try {
            const updates = this.renderQueue.splice(0, this.optimization.renderQueueSize);
            if (updates.length > 0) {
                await this.processBatch({
                    updates,
                    priority: 1,
                    timestamp: Date.now()
                });
            }
        } finally {
            this.isRendering = false;
            
            if (this.renderQueue.length > 0) {
                this.scheduleRender();
            }
        }
    }
    
    private startPerformanceMonitoring(): void {
        setInterval(() => {
            this.calculateAverageFrameTime();
        }, 1000);
    }
    
    private calculateAverageFrameTime(): void {
        if (this.renderMetrics.frameCount > 0) {
            this.renderMetrics.averageFrameTime = 
                this.renderMetrics.renderingTime / this.renderMetrics.frameCount;
        }
    }
    
    private updateFrameTime(frameTime: number): void {
        this.renderMetrics.lastFrameTime = frameTime;
        this.renderMetrics.renderingTime += frameTime;
    }
    
    private updateRenderMetrics(renderTime: number): void {
        this.renderMetrics.renderingTime += renderTime;
        this.renderMetrics.frameCount++;
    }
    
    private getLanguageFonts(language: string): string[] {
        const fontMap: Record<string, string[]> = {
            'ja': ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic'],
            'ko': ['Noto Sans KR', 'Malgun Gothic', 'Dotum'],
            'zh': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei'],
            'ar': ['Noto Sans Arabic', 'Tahoma', 'Arial'],
            'hi': ['Noto Sans Devanagari', 'Arial Unicode MS']
        };
        
        return fontMap[language] || ['Arial', 'Helvetica', 'sans-serif'];
    }
    
    private async loadFont(font: string, language: string): Promise<{success: boolean}> {
        try {
            if (this.fontLoadingManager) {
                return await this.fontLoadingManager.loadFont(font, language);
            }
            
            // フォールバック実装
            if (document.fonts && document.fonts.load) {
                await document.fonts.load(`1em ${font}`);
                return { success: true };
            }
            
            return { success: false };
            
        } catch (error) {
            console.warn(`Failed to load font ${font}:`, error);
            return { success: false };
        }
    }
    
    private getTextDirection(language: string): string {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    }
    
    private async calculateFontMetrics(language: string, translations: Record<string, string>): Promise<FontMetrics> {
        const cacheKey = `fontMetrics-${language}`;
        
        if (this.measurementCache.has(cacheKey)) {
            return this.measurementCache.get(cacheKey)!;
        }
        
        // 簡易実装
        const metrics: FontMetrics = {};
        
        // 実際の実装では、Canvas APIを使用してテキスト測定を行う
        for (const text of Object.values(translations)) {
            for (const char of text) {
                if (!metrics[char]) {
                    metrics[char] = {
                        width: 10, // 仮の値
                        height: 16, // 仮の値
                        words: {}
                    };
                }
            }
        }
        
        this.measurementCache.set(cacheKey, metrics);
        return metrics;
    }
    
    private estimateTextLengths(translations: Record<string, string>): number {
        const lengths = Object.values(translations).map(text => text.length);
        return lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
    }
    
    private calculateLayoutAdjustments(language: string, textDirection: string): LayoutAdjustments {
        return {
            padding: { top: 4, right: 8, bottom: 4, left: 8 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            lineHeight: 1.5,
            letterSpacing: '0px',
            textAlign: textDirection === 'rtl' ? 'right' : 'left',
            direction: textDirection
        };
    }
    
    private getDefaultLayoutInfo(): LayoutInfo {
        return {
            textDirection: 'ltr',
            fontMetrics: {},
            estimatedTextLengths: 0,
            layoutAdjustments: {
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
                lineHeight: 1,
                letterSpacing: '0px'
            }
        };
    }
    
    private getTranslationKey(element: Element): string | null {
        return element.getAttribute('data-i18n-key') || 
               element.getAttribute('data-translate') || 
               null;
    }
    
    private getCurrentElementText(element: Element): string {
        return (element as HTMLElement).textContent || (element as HTMLElement).innerText || '';
    }
    
    private getCurrentElementAttrs(element: Element): Record<string, string> {
        const attrs: Record<string, string> = {};
        for (const attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }
    
    private calculateNewElementAttrs(element: Element, layoutInfo: LayoutInfo): Record<string, string> {
        const attrs = this.getCurrentElementAttrs(element);
        
        if (layoutInfo.textDirection === 'rtl') {
            attrs['dir'] = 'rtl';
        }
        
        return attrs;
    }
    
    private calculateElementLayoutInfo(element: Element, newText: string, layoutInfo: LayoutInfo): ElementLayoutInfo {
        return {
            adjustments: layoutInfo.layoutAdjustments,
            textMetrics: {
                estimatedWidth: newText.length * 10, // 簡易計算
                estimatedHeight: 16
            }
        };
    }
    
    private calculateBatchPriority(updates: VirtualUpdate[]): number {
        // 要素の重要度に基づいて優先度を計算
        let priority = 1;
        
        for (const update of updates) {
            const tagName = update.element.tagName.toLowerCase();
            if (['h1', 'h2', 'h3'].includes(tagName)) priority += 3;
            else if (['button', 'a'].includes(tagName)) priority += 2;
            else priority += 1;
        }
        
        return priority;
    }
    
    private async waitForNextFrame(): Promise<void> {
        return new Promise(resolve => requestAnimationFrame(() => resolve()));
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<OptimizationConfig>): void {
        this.optimization = { ...this.optimization, ...config };
    }

    /**
     * パフォーマンス統計を取得
     */
    getMetrics(): RenderMetrics {
        return { ...this.renderMetrics };
    }

    /**
     * キャッシュをクリア
     */
    clearCache(): void {
        this.layoutCache.clear();
        this.measurementCache.clear();
        this.fontCache.clear();
        this.preloadedFonts.clear();
    }

    /**
     * レンダリングを一時停止
     */
    pauseRendering(): void {
        this.renderingPaused = true;
    }

    /**
     * レンダリングを再開
     */
    resumeRendering(): void {
        this.renderingPaused = false;
        if (this.renderQueue.length > 0) {
            this.scheduleRender();
        }
    }

    /**
     * リソースクリーンアップ
     */
    cleanup(): void {
        if (this.renderRequestId) {
            cancelAnimationFrame(this.renderRequestId);
            this.renderRequestId = null;
        }
        
        this.clearCache();
        this.renderQueue.length = 0;
        
        console.log('I18nRenderOptimizer cleaned up');
    }
}

// シングルトンインスタンス
let optimizerInstance: I18nRenderOptimizer | null = null;

/**
 * I18nRenderOptimizerのシングルトンインスタンスを取得
 */
export function getI18nRenderOptimizer(): I18nRenderOptimizer {
    if (!optimizerInstance) {
        optimizerInstance = new I18nRenderOptimizer();
    }
    return optimizerInstance;
}