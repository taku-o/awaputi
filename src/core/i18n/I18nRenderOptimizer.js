/**
 * 国際化レンダリング最適化システム
 * 
 * 言語切り替え時のUIレンダリング最適化、
 * フォント読み込み最適化、レイアウト調整の最適化を提供
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class I18nRenderOptimizer {
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
        
        // フォント管理
        this.fontCache = new Map();
        this.fontLoadPromises = new Map();
        this.preloadedFonts = new Set();
        
        // レイアウトキャッシュ
        this.layoutCache = new Map();
        this.measurementCache = new Map();
        
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
        this.elementPools = new Map();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        // レンダリング最適化の設定
        this.setupRenderingOptimization();
        
        // フォント事前読み込み
        this.preloadCommonFonts();
        
        // レスポンシブ対応
        this.setupResponsiveOptimization();
        
        console.log('I18nRenderOptimizer initialized');
    }
    
    /**
     * レンダリング最適化の設定
     */
    setupRenderingOptimization() {
        // requestAnimationFrame による最適化
        this.scheduleRender = this.debounce(() => {
            this.executeRenderQueue();
        }, this.optimization.debounceDelay);
        
        // リサイズイベントの最適化
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.invalidateLayoutCache();
                this.optimizeForViewport();
            }, 150);
        });
        
        // visibility change 対応
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseRendering();
            } else {
                this.resumeRendering();
            }
        });
    }
    
    /**
     * 言語切り替え時の最適化されたレンダリング
     */
    async optimizeLanguageSwitch(fromLanguage, toLanguage, updateCallback) {
        const startTime = performance.now();
        
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
            
            console.log(`Language switch rendering completed in ${renderTime.toFixed(2)}ms`);
            
            return {
                success: true,
                renderTime,
                layoutInfo,
                updateResult
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'I18N_RENDER_ERROR', {
                operation: 'optimizeLanguageSwitch',
                fromLanguage,
                toLanguage
            });
            
            throw error;
        }
    }
    
    /**
     * フォントの事前読み込み
     */
    async preloadLanguageFonts(language) {
        const fontFamily = this.getLanguageFontFamily(language);
        
        if (this.preloadedFonts.has(fontFamily)) {
            return true;
        }
        
        if (this.fontLoadPromises.has(fontFamily)) {
            return await this.fontLoadPromises.get(fontFamily);
        }
        
        const loadPromise = this._loadFontFamily(fontFamily);
        this.fontLoadPromises.set(fontFamily, loadPromise);
        
        try {
            await loadPromise;
            this.preloadedFonts.add(fontFamily);
            console.log(`Font preloaded: ${fontFamily}`);
            return true;
        } catch (error) {
            console.warn(`Font preload failed: ${fontFamily}`, error);
            return false;
        }
    }
    
    /**
     * フォントファミリーの読み込み
     */
    async _loadFontFamily(fontFamily) {
        if (!document.fonts) {
            return Promise.resolve();
        }
        
        // CSS Font Loading API を使用
        const fontFace = new FontFace(fontFamily, `url('/fonts/${fontFamily}.woff2')`);
        
        try {
            await fontFace.load();
            document.fonts.add(fontFace);
            return true;
        } catch (error) {
            // フォールバック: CSS による読み込み
            return this._loadFontCSS(fontFamily);
        }
    }
    
    /**
     * CSS によるフォント読み込み
     */
    _loadFontCSS(fontFamily) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;700&display=swap`;
            
            link.onload = () => resolve(true);
            link.onerror = () => reject(new Error(`Failed to load font: ${fontFamily}`));
            
            document.head.appendChild(link);
            
            // タイムアウト設定
            setTimeout(() => reject(new Error('Font load timeout')), 5000);
        });
    }
    
    /**
     * レイアウトの事前計算
     */
    async precalculateLayout(language) {
        const cacheKey = `layout_${language}`;
        
        if (this.layoutCache.has(cacheKey)) {
            return this.layoutCache.get(cacheKey);
        }
        
        // 言語固有のレイアウト特性を計算
        const layoutInfo = {
            textDirection: this.getTextDirection(language),
            fontMetrics: await this.calculateFontMetrics(language),
            estimatedTextLengths: this.estimateTextLengths(language),
            layoutAdjustments: this.calculateLayoutAdjustments(language)
        };
        
        // キャッシュに保存
        this.layoutCache.set(cacheKey, layoutInfo);
        
        return layoutInfo;
    }
    
    /**
     * フォントメトリクスの計算
     */
    async calculateFontMetrics(language) {
        const fontFamily = this.getLanguageFontFamily(language);
        const cacheKey = `metrics_${fontFamily}`;
        
        if (this.measurementCache.has(cacheKey)) {
            return this.measurementCache.get(cacheKey);
        }
        
        // 測定用の隠し要素を作成
        const testElement = document.createElement('div');
        testElement.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            font-family: ${fontFamily};
            font-size: 16px;
            line-height: 1.5;
            white-space: nowrap;
            visibility: hidden;
        `;
        
        document.body.appendChild(testElement);
        
        try {
            // 各文字の測定
            const metrics = {};
            const testChars = ['A', 'あ', '中', '한', 'Ä', 'ş'];
            
            for (const char of testChars) {
                testElement.textContent = char;
                metrics[char] = {
                    width: testElement.offsetWidth,
                    height: testElement.offsetHeight
                };
            }
            
            // 単語の測定
            const testWords = ['Hello', 'こんにちは', '你好', '안녕하세요'];
            metrics.words = {};
            
            for (const word of testWords) {
                testElement.textContent = word;
                metrics.words[word] = {
                    width: testElement.offsetWidth,
                    height: testElement.offsetHeight
                };
            }
            
            // キャッシュに保存
            this.measurementCache.set(cacheKey, metrics);
            
            return metrics;
            
        } finally {
            document.body.removeChild(testElement);
        }
    }
    
    /**
     * テキスト長の推定
     */
    estimateTextLengths(language) {
        // 言語固有のテキスト長推定
        const lengthFactors = {
            'ja': 0.8,   // 日本語は比較的短い
            'en': 1.0,   // 英語を基準
            'de': 1.3,   // ドイツ語は長い
            'fr': 1.2,   // フランス語は少し長い
            'zh-CN': 0.7, // 中国語は短い
            'ko': 0.9    // 韓国語は少し短い
        };
        
        return lengthFactors[language] || 1.0;
    }
    
    /**
     * レイアウト調整の計算
     */
    calculateLayoutAdjustments(language) {
        const adjustments = {
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            lineHeight: 1.5,
            letterSpacing: 'normal'
        };
        
        // 言語固有の調整
        switch (language) {
            case 'ja':
                adjustments.lineHeight = 1.6;
                adjustments.letterSpacing = '0.02em';
                break;
            case 'zh-CN':
            case 'zh-TW':
                adjustments.lineHeight = 1.7;
                adjustments.letterSpacing = '0.01em';
                break;
            case 'ko':
                adjustments.lineHeight = 1.6;
                break;
            case 'ar':
            case 'he':
                // RTL 言語の調整
                adjustments.textAlign = 'right';
                adjustments.direction = 'rtl';
                break;
        }
        
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
        
        console.log('Batch update started');
    }
    
    /**
     * バッチ更新の実行
     */
    async executeBatchedUpdate(updateCallback, layoutInfo) {
        try {
            // 仮想 DOM 更新
            const virtualUpdates = await this.createVirtualUpdates(updateCallback, layoutInfo);
            
            // DOM への適用
            await this.applyVirtualUpdates(virtualUpdates);
            
            return virtualUpdates;
            
        } catch (error) {
            console.error('Batched update failed:', error);
            throw error;
        }
    }
    
    /**
     * 仮想更新の作成
     */
    async createVirtualUpdates(updateCallback, layoutInfo) {
        const updates = [];
        
        // DOM 要素の収集
        const elements = document.querySelectorAll('[data-i18n], [data-i18n-attr]');
        
        for (const element of elements) {
            const update = await this.createElementUpdate(element, updateCallback, layoutInfo);
            if (update) {
                updates.push(update);
            }
        }
        
        return updates;
    }
    
    /**
     * 要素更新の作成
     */
    async createElementUpdate(element, updateCallback, layoutInfo) {
        try {
            const currentText = element.textContent;
            const currentAttrs = this.getElementAttributes(element);
            
            // 更新後のテキストと属性を計算
            const newText = await updateCallback(element);
            const newAttrs = this.calculateNewAttributes(element, layoutInfo);
            
            // 変更が必要かチェック
            if (currentText === newText && this.attributesEqual(currentAttrs, newAttrs)) {
                return null;
            }
            
            return {
                element,
                currentText,
                newText,
                currentAttrs,
                newAttrs,
                layoutInfo: this.calculateElementLayout(element, newText, layoutInfo)
            };
            
        } catch (error) {
            console.warn('Failed to create element update:', error);
            return null;
        }
    }
    
    /**
     * 仮想更新の適用
     */
    async applyVirtualUpdates(updates) {
        // 更新の優先度順ソート
        const sortedUpdates = this.sortUpdatesByPriority(updates);
        
        // Document Fragment を使用した効率的な更新
        const fragment = document.createDocumentFragment();
        
        for (const update of sortedUpdates) {
            await this.applyElementUpdate(update);
        }
        
        // レイアウトの強制実行
        this.forceLayout();
        
        console.log(`Applied ${updates.length} virtual updates`);
    }
    
    /**
     * 要素更新の適用
     */
    async applyElementUpdate(update) {
        const { element, newText, newAttrs, layoutInfo } = update;
        
        try {
            // テキスト更新
            if (element.textContent !== newText) {
                element.textContent = newText;
            }
            
            // 属性更新
            for (const [attr, value] of Object.entries(newAttrs)) {
                if (element.getAttribute(attr) !== value) {
                    element.setAttribute(attr, value);
                }
            }
            
            // レイアウト調整の適用
            if (layoutInfo.adjustments) {
                this.applyLayoutAdjustments(element, layoutInfo.adjustments);
            }
            
        } catch (error) {
            console.warn('Failed to apply element update:', error);
        }
    }
    
    /**
     * バッチ更新の終了
     */
    async finishBatchUpdate() {
        // レイアウト測定の再開
        this.deferLayoutMeasurements = false;
        
        // CSS アニメーションの再有効化
        this.enableAnimations();
        
        // レンダリング完了の待機
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });
        
        const batchTime = performance.now() - this.batchStartTime;
        console.log(`Batch update completed in ${batchTime.toFixed(2)}ms`);
    }
    
    /**
     * アニメーションの無効化
     */
    disableAnimations() {
        if (!this.animationDisabled) {
            const style = document.createElement('style');
            style.id = 'i18n-render-optimizer-disable-animations';
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-delay: 0ms !important;
                    transition-duration: 0.01ms !important;
                    transition-delay: 0ms !important;
                }
            `;
            document.head.appendChild(style);
            this.animationDisabled = true;
        }
    }
    
    /**
     * アニメーションの再有効化
     */
    enableAnimations() {
        if (this.animationDisabled) {
            const style = document.getElementById('i18n-render-optimizer-disable-animations');
            if (style) {
                document.head.removeChild(style);
            }
            this.animationDisabled = false;
        }
    }
    
    /**
     * レンダリングキューの実行
     */
    executeRenderQueue() {
        if (this.isRendering || this.renderQueue.length === 0) {
            return;
        }
        
        this.isRendering = true;
        const startTime = performance.now();
        
        this.renderRequestId = requestAnimationFrame(() => {
            try {
                // キューから更新を取得
                const updates = this.renderQueue.splice(0, this.optimization.renderQueueSize);
                
                // バッチ処理
                if (this.optimization.batchUpdates) {
                    this.processBatchedRenderUpdates(updates);
                } else {
                    this.processIndividualRenderUpdates(updates);
                }
                
                const endTime = performance.now();
                const frameTime = endTime - startTime;
                
                // フレームメトリクス更新
                this.updateFrameMetrics(frameTime);
                
                // まだキューに残りがあれば継続
                if (this.renderQueue.length > 0) {
                    this.scheduleRender();
                }
                
            } catch (error) {
                console.error('Render queue execution failed:', error);
            } finally {
                this.isRendering = false;
            }
        });
    }
    
    /**
     * レンダリングの一時停止
     */
    pauseRendering() {
        if (this.renderRequestId) {
            cancelAnimationFrame(this.renderRequestId);
            this.renderRequestId = null;
        }
        this.renderingPaused = true;
        console.log('Rendering paused');
    }
    
    /**
     * レンダリングの再開
     */
    resumeRendering() {
        this.renderingPaused = false;
        if (this.renderQueue.length > 0) {
            this.scheduleRender();
        }
        console.log('Rendering resumed');
    }
    
    /**
     * ビューポート最適化
     */
    optimizeForViewport() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1
        };
        
        // 小さな画面での最適化
        if (viewport.width < 768) {
            this.enableMobileOptimizations();
        } else {
            this.disableMobileOptimizations();
        }
        
        // 高DPI ディスプレイでの最適化
        if (viewport.devicePixelRatio > 1) {
            this.enableHighDPIOptimizations();
        }
        
        console.log('Viewport optimization applied:', viewport);
    }
    
    /**
     * モバイル最適化の有効化
     */
    enableMobileOptimizations() {
        this.optimization.batchUpdates = true;
        this.optimization.delayedRendering = true;
        this.optimization.debounceDelay = 33; // 30FPS
        this.optimization.renderQueueSize = 25;
    }
    
    /**
     * モバイル最適化の無効化
     */
    disableMobileOptimizations() {
        this.optimization.debounceDelay = 16; // 60FPS
        this.optimization.renderQueueSize = 50;
    }
    
    /**
     * 高DPI最適化の有効化
     */
    enableHighDPIOptimizations() {
        this.optimization.asyncFontLoading = true;
        this.optimization.layoutCaching = true;
    }
    
    /**
     * 共通フォントの事前読み込み
     */
    async preloadCommonFonts() {
        const commonFonts = [
            'Noto Sans JP',      // 日本語
            'Noto Sans SC',      // 中国語（簡体字）
            'Noto Sans TC',      // 中国語（繁体字）
            'Noto Sans KR',      // 韓国語
            'Arial',             // 英語（フォールバック）
            'Helvetica'          // 英語（フォールバック）
        ];
        
        const preloadPromises = commonFonts.map(font => 
            this.preloadLanguageFonts(this.getLanguageByFont(font))
        );
        
        try {
            await Promise.allSettled(preloadPromises);
            console.log('Common fonts preloaded');
        } catch (error) {
            console.warn('Font preloading partially failed:', error);
        }
    }
    
    /**
     * レスポンシブ最適化の設定
     */
    setupResponsiveOptimization() {
        // メディアクエリの監視
        const mediaQueries = [
            window.matchMedia('(max-width: 768px)'),
            window.matchMedia('(min-resolution: 192dpi)'),
            window.matchMedia('(orientation: portrait)')
        ];
        
        mediaQueries.forEach(mq => {
            mq.addListener(() => {
                this.optimizeForViewport();
            });
        });
    }
    
    /**
     * ユーティリティメソッド
     */
    
    getLanguageFontFamily(language) {
        const fontMap = {
            'ja': 'Noto Sans JP',
            'zh-CN': 'Noto Sans SC',
            'zh-TW': 'Noto Sans TC',
            'ko': 'Noto Sans KR',
            'ar': 'Noto Sans Arabic',
            'he': 'Noto Sans Hebrew',
            'default': 'Arial'
        };
        
        return fontMap[language] || fontMap.default;
    }
    
    getLanguageByFont(fontFamily) {
        const reverseMap = {
            'Noto Sans JP': 'ja',
            'Noto Sans SC': 'zh-CN',
            'Noto Sans TC': 'zh-TW',
            'Noto Sans KR': 'ko',
            'Noto Sans Arabic': 'ar',
            'Noto Sans Hebrew': 'he'
        };
        
        return reverseMap[fontFamily] || 'en';
    }
    
    getTextDirection(language) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    }
    
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * メトリクス更新
     */
    updateFrameMetrics(frameTime) {
        this.renderMetrics.frameCount++;
        this.renderMetrics.lastFrameTime = frameTime;
        
        // 16.67ms (60FPS) を超えたフレームをドロップとしてカウント
        if (frameTime > 16.67) {
            this.renderMetrics.dropCount++;
        }
        
        // 平均フレーム時間の更新
        const alpha = 0.1;
        this.renderMetrics.averageFrameTime = 
            alpha * frameTime + (1 - alpha) * this.renderMetrics.averageFrameTime;
    }
    
    updateRenderMetrics(renderTime) {
        this.renderMetrics.renderingTime = renderTime;
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats() {
        return {
            frameMetrics: { ...this.renderMetrics },
            optimization: { ...this.optimization },
            cacheStats: {
                layoutCacheSize: this.layoutCache.size,
                measurementCacheSize: this.measurementCache.size,
                fontCacheSize: this.fontCache.size,
                preloadedFonts: this.preloadedFonts.size
            },
            renderQueue: {
                queueSize: this.renderQueue.length,
                isRendering: this.isRendering,
                isPaused: this.renderingPaused
            }
        };
    }
    
    /**
     * キャッシュのクリア
     */
    clearCaches() {
        this.layoutCache.clear();
        this.measurementCache.clear();
        this.fontCache.clear();
        console.log('Render caches cleared');
    }
    
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
        this.enableAnimations();
        
        console.log('I18nRenderOptimizer cleaned up');
    }
}