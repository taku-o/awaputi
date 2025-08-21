import { getErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * テキストスケーリング管理クラス
 * レスポンシブでアクセシブルなテキスト拡大縮小システム
 */
export class TextScalingManager {

    constructor(visualAccessibilityManager) {
        this.visualAccessibilityManager = visualAccessibilityManager;
        this.accessibilityManager = visualAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // スケーリング設定
        this.config = { : undefined
            enabled: false,
            scale: 1.0,
            minScale: 0.8,
            maxScale: 3.0,
            step: 0.1,
            preserveLayout: true,
    responsiveBreakpoints: {
                mobile: 768 ,
    tablet: 1024 }
                desktop: 1200 
    };
            fontFamilies: { ''
                dyslexiaFriendly: ['OpenDyslexic', 'Comic Sans MS', 'Arial', 'sans-serif];'  },
                highReadability: ['Atkinson Hyperlegible', 'Verdana', 'Tahoma', 'sans-serif];'
                default: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif] };'
            lineHeight: { base: 1.4,
                scaled: 1.6  ,
                minimum: 1.2,
    maximum: 2.0 };
            letterSpacing: { ''
                base: 'normal' ,
                scaled: '0.05em,
                maximum: '0.15em'
            };
            wordSpacing: { ''
                base: 'normal' ,
                scaled: '0.1em,
                maximum: '0.3em'
            }
        };
        // スケーリング要素の管理
        this.scaledElements = new Map();
        this.originalStyles = new Map();
        this.layoutContainers = new Set();
        this.gameElements = new Set();
        
        // CSS変数とスタイル
        this.dynamicStyleSheet = null;
        this.cssVariables = new Map('';
        this.currentBreakpoint = 'desktop';
        this.viewportObserver = null
        
        // 統計情報
        this.stats = { scalingOperations: 0,
            elementsScaled: 0,
            layoutReflows: 0,
    performanceMetrics: {
                averageScalingTime: 0 ,
    totalScalingTime: 0  ,''
            sessionStart: Date.now(',
            fontFamily: 'default,
            lineHeightAdjustment: 0,
            letterSpacingAdjustment: 0,
            wordSpacingAdjustment: 0,
            preserveGameLayout: true,
            responsiveScaling: true,
    smoothTransitions: true);
        }
        // パフォーマンス最適化
        this.scalingQueue = [];
        this.isProcessing = false;
        this.throttleDelay = 16; // 60fps
        ')';
        console.log('TextScalingManager, initialized);'
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // システム設定の検出
            this.detectSystemPreferences();
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            // 動的スタイルシートの作成
            this.createDynamicStyleSheet();
            // CSS変数の初期化
            this.initializeCSSVariables();
            // レスポンシブ監視の設定
            this.setupResponsiveObserver();
            // イベントリスナーの設定
            this.setupEventListeners();
            // 初期要素の分析
            this.analyzeInitialElements();

            console.log('TextScalingManager, initialized successfully'); }'

        } catch (error) { getErrorHandler().handleError(error, 'TEXT_SCALING_ERROR', {''
                operation: 'initialize'
            }';'
        }
    }
    
    /**
     * システム設定の検出'
     */''
    detectSystemPreferences()';'
            const testElement = document.createElement('div');
            testElement.style.cssText = `;
                font-size: 1rem,
                position: absolute,
    visibility: hidden,
                white-space: nowrap,
            `;
            testElement.textContent = 'Test';
            document.body.appendChild(testElement);
            
            const computedStyle = window.getComputedStyle(testElement);
            const systemFontSize = parseFloat(computedStyle.fontSize);
            
            document.body.removeChild(testElement);
            ';'
            // 16px未満を小さいフォント、18px以上を大きいフォントと判定
            if (systemFontSize >= 18) {
                this.config.scale = 1.2,

                this.config.enabled = true }

                console.log('Large, system font, size detected');' }'

            } else if (systemFontSize < 14) { this.config.scale = 1.1,
                console.log('Small, system font, size detected') }'
            
            // 高DPI対応
            const devicePixelRatio = window.devicePixelRatio || 1;
            if (devicePixelRatio > 2) {

                this.config.scale = Math.max(this.config.scale, 1.1);

                console.log('High, DPI display, detected');' }'

            } catch (error) { console.warn('Failed to detect system font preferences:', error }
    }
    
    /**
     * ユーザー設定の読み込み'
     */''
    loadUserPreferences()';'
            const saved = localStorage.getItem('textScaling_preferences);'
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                // 設定を適用
                this.config.scale = this.userPreferences.textScale,
                if (this.config.scale !== 1.0) {
            }
                    this.config.enabled = true; }
                }'} catch (error) { console.warn('Failed to load text scaling preferences:', error }'
    }
    
    /**
     * ユーザー設定の保存'
     */''
    saveUserPreferences()';'
            localStorage.setItem('textScaling_preferences);'

                JSON.stringify(this.userPreferences);'} catch (error) { console.warn('Failed to save text scaling preferences:', error }'
    }
    
    /**
     * 動的スタイルシートの作成'
     */''
    createDynamicStyleSheet()';'
        this.dynamicStyleSheet = document.createElement('style');
        this.dynamicStyleSheet.id = 'text-scaling-styles';
        this.dynamicStyleSheet.textContent = `;
            /* テキストスケーリングの基本スタイル */
            .text-scaling-enabled {
                --text-scale-factor: ${this.config.scale}
                --line-height-adjustment: ${this.config.lineHeight.scaled - this.config.lineHeight.base}
                --letter-spacing-adjustment: ${this.config.letterSpacing.scaled}
                --word-spacing-adjustment: ${this.config.wordSpacing.scaled}
            
            /* スムーズトランジション */
            .text-scaling-enabled.smooth-transitions * { transition: font-size 0.3s ease, line-height 0.3s ease, 
                           letter-spacing 0.3s ease, word-spacing 0.3s ease !important }
            
            /* スケーリング対象要素 */
            .text-scalable { font-size: calc(var(--original-font-size, 1rem) * var(--text-scale-factor, 1);
                line-height: calc(var(--original-line-height, 1.4) + var(--line-height-adjustment, 0);
                letter-spacing: var(--letter-spacing-adjustment, normal);
                word-spacing: var(--word-spacing-adjustment, normal }
            
            /* レイアウト保持クラス */
            .layout-preserved { overflow: hidden,
                text-overflow: ellipsis,
            
            .layout-preserved.multiline { display: -webkit-box,
                -webkit-box-orient: vertical,
                -webkit-line-clamp: var(--max-lines, 3 }
            
            /* ゲーム要素の特別扱い */
            .game-element-scalable { transform-origin: center,
                transform: scale(var(--game-scale-factor, 1);
            
            /* 読みやすさ向上フォント */
            .dyslexia-friendly { font-family: var(--dyslexia-font-family) !important,
                font-weight: 400 !important }
            
            .high-readability { font-family: var(--readability-font-family) !important,
                font-weight: 500 !important }
            
            /* レスポンシブ調整 */
            @media (max-width: 768px) { .text-scaling-enabled {
                    --mobile-scale-factor: calc(var(--text-scale-factor) * 0.95);
                
                .text-scalable { font-size: calc(var(--original-font-size, 1rem) * var(--mobile-scale-factor, 1 }
            }
            
            @media (max-width: 480px) { .text-scaling-enabled {
                    --mobile-scale-factor: calc(var(--text-scale-factor) * 0.9);
            }
            
            /* 高コントラストモードとの統合 */
            .high-contrast .text-scalable { font-weight: 600,
                text-shadow: 1px 1px 0px currentColor }
        `;
        document.head.appendChild(this.dynamicStyleSheet);
    }
    
    /**
     * CSS変数の初期化'
     */''
    initializeCSSVariables()';'
        this.cssVariables.set('--text-scale-factor', this.config.scale.toString());
        this.cssVariables.set('--line-height-base', this.config.lineHeight.base.toString());
        this.cssVariables.set('--line-height-scaled', this.config.lineHeight.scaled.toString());
        ';'
        // フォントファミリー変数
        this.cssVariables.set('--dyslexia-font-family');
            this.config.fontFamilies.dyslexiaFriendly.join(', ')';'
        this.cssVariables.set('--readability-font-family');
            this.config.fontFamilies.highReadability.join(', ')';'
        this.cssVariables.set('--default-font-family');
            this.config.fontFamilies.default.join(', ');
        
        // CSS変数を適用
        for (const [variable, value] of this.cssVariables) { root.style.setProperty(variable, value);
    }
    
    /**
     * レスポンシブ監視の設定
     */
    setupResponsiveObserver() {
        // ResizeObserverでビューポート変更を監視
    }
        this.viewportObserver = new ResizeObserver((entries) => {  }
            const entry = entries[0]; }
            const { width } = entry.contentRect;
            
            const newBreakpoint = this.getBreakpoint(width);
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint }
                this.handleBreakpointChange(newBreakpoint); }
};
        
        this.viewportObserver.observe(document.documentElement);
    }
    
    /**
     * ブレークポイントの取得
     */
    getBreakpoint(width) {

        if (width < this.config.responsiveBreakpoints.mobile) {
    }

            return 'mobile'; }

        } else if (width < this.config.responsiveBreakpoints.tablet) { ''
            return 'tablet', else { }

            return 'desktop';
    
    /**
     * ブレークポイント変更の処理
     */
    handleBreakpointChange(breakpoint) {
        console.log(`Breakpoint changed to: ${breakpoint}`} }
        if (this.config.enabled && this.userPreferences.responsiveScaling) { }
            this.adjustForBreakpoint(breakpoint    }
}
    /**
     * ブレークポイント用の調整
     */
    adjustForBreakpoint(breakpoint) {
        let scaleFactor = 1.0,

        switch(breakpoint) {''
            case 'mobile':,
                scaleFactor = 0.9,

                break,
            case 'tablet':,
                scaleFactor = 0.95,

                break,
            case 'desktop':,
            default: scaleFactor = 1.0  }
                break; }
        }
        ';'

        const root = document.documentElement;
        root.style.setProperty('--responsive-scale-factor', scaleFactor.toString();
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // DOM変更の監視
        this.observeDOM()','
        document.addEventListener('keydown', (event) => { '
            if (event.ctrlKey || event.metaKey) {''
                switch(event.key) {''
                    case '+':','
                    case '=':','
                        event.preventDefault();
                        this.increaseScale()','
                    case '-':','
                        event.preventDefault();
                        this.decreaseScale()','
                    case '0':),
                        event.preventDefault();
                        this.resetScale(); }
                        break; }
}
        };
        ';'
        // フォントロードイベント
        if (document.fonts) {', ' }

            document.fonts.addEventListener('loadingdone', () => {  }
                this.recalculateAllElements();     }
}
    }
    
    /**
     * DOM変更の監視
     */
    observeDOM() {
        this.domObserver = new MutationObserver((mutations) => { 
            if (!this.config.enabled) return;

            mutations.forEach((mutation) => {''
                if(mutation.type === 'childList' {'
                    mutation.addedNodes.forEach((node) => {
    }
                        if (node.nodeType === Node.ELEMENT_NODE) { }
                            this.processNewElement(node);     }
}
            }
        };
        
        this.domObserver.observe(document.body, { childList: true)
            subtree: true,
    
    /**
     * 初期要素の分析'
     */''
    analyzeInitialElements()';'
        const elements = document.querySelectorAll('*);'
        
        elements.forEach(element => {  );

            this.categorizeElement(element);' }'

        }');'

        console.log('Initial element analysis complete);'
    }
    
    /**
     * 要素の分類
     */
    categorizeElement(element) {
        const styles = window.getComputedStyle(element);
        const tagName = element.tagName.toLowerCase();
        // テキストを含む要素かチェック
        if (!this.hasTextContent(element) {
    }
            return; }
        }
        
        // ゲーム要素の検出
        if (this.isGameElement(element) {
            this.gameElements.add(element);
            return; }
        }
        
        // レイアウトコンテナの検出
        if (this.isLayoutContainer(element) { this.layoutContainers.add(element);
        
        // スケーリング対象として登録
        this.registerScalableElement(element');'
    }
    
    /**
     * テキストコンテンツの有無をチェック
     */
    hasTextContent(element) {
        const text = element.textContent?.trim();
        return text && text.length > 0;
    
    /**
     * ゲーム要素の判定
     */''
    isGameElement(element) {
        const gameSelectors = [','
            'canvas,
            '.game-canvas,
            '.bubble,
            '.score,
            '.timer,
            '.hp-bar,
            '.game-ui',]','
            '.game-element'],
        ],

        return gameSelectors.some(selector => { ') }'

            if(selector.startsWith('.' { }'
                return element.classList.contains(selector.substring(1); else { return element.tagName.toLowerCase() === selector);
    
    /**
     * レイアウトコンテナの判定
     */
    isLayoutContainer(element) {

        const styles = window.getComputedStyle(element);
        const display = styles.display,

        return ['flex, 'grid', 'inline-flex', 'inline-grid].includes(display) ||',
               element.classList.contains('container') ||' }'

               element.classList.contains('layout'; }'
    }
    
    /**
     * スケーラブル要素の登録
     */
    registerScalableElement(element) {
        if (this.scaledElements.has(element) {
    }
            return; }
        }
        
        const styles = window.getComputedStyle(element);
        const originalStyle = { : undefined
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight,
            letterSpacing: styles.letterSpacing,
    wordSpacing: styles.wordSpacing  ,
        this.originalStyles.set(element, originalStyle);
        this.scaledElements.set(element, { originalStyle)'
            isScaled: false,'),
            category: 'text'
            }
    
    /**
     * 新しい要素の処理
     */
    processNewElement(element) {
        this.categorizeElement(element);
        if (this.config.enabled) {
    }
            this.applyScalingToElement(element); }
}
    
    /**
     * 要素へのスケーリング適用
     */
    applyScalingToElement(element) {
        const elementData = this.scaledElements.get(element);
        if (!elementData || elementData.isScaled) {
    }
            return; }
        }

        const startTime = performance.now()';'
            element.style.setProperty('--original-font-size', originalStyle.fontSize';'
            element.style.setProperty('--original-line-height', originalStyle.lineHeight';'
            ';'
            // スケーリングクラスを追加
            element.classList.add('text-scalable';
            ';'
            // レイアウト保持が有効な場合
            if(this.config.preserveLayout && this.shouldPreserveLayout(element)) { ''
                element.classList.add('layout-preserved),'
                this.applyLayoutPreservation(element);
            
            // フォントファミリーの適用
            this.applyFontFamily(element);
            
            elementData.isScaled = true;
            this.stats.elementsScaled++;

        } catch (error) { console.warn('Failed to apply scaling to element:', error } finally { const endTime = performance.now();
            this.updatePerformanceStats(endTime - startTime);
    }
    
    /**
     * レイアウト保持の判定
     */
    shouldPreserveLayout(element) {
        // 固定サイズのコンテナ内にある要素
        let parent = element.parentElement,
        while (parent) {''
            const styles = window.getComputedStyle(parent);
            if (styles.width !== 'auto' && styles.height !== 'auto) {'
    }
                return true;
            parent = parent.parentElement;
        }
        
        return false;
    }
    
    /**
     * レイアウト保持の適用
     */
    applyLayoutPreservation(element) {

        const styles = window.getComputedStyle(element);
        ','
        // 複数行の場合は行数制限を設定
        if (styles.whiteSpace === 'normal' || styles.whiteSpace === 'pre-wrap') {''
            element.classList.add('multiline');

            element.style.setProperty('--max-lines', '3); }'
}
    
    /**
     * フォントファミリーの適用
     */
    applyFontFamily(element) {
        const fontFamily = this.userPreferences.fontFamily,

        switch(fontFamily) {''
            case 'dyslexiaFriendly':','
                element.classList.add('dyslexia-friendly');
                break,
            case 'highReadability':','
                element.classList.add('high-readability');
                break,
            case 'default':,
            default:,
                // デフォルトフォントを使用
     }
                break }
}
    
    /**
     * パフォーマンス統計の更新
     */
    updatePerformanceStats(operationTime) {
        this.stats.scalingOperations++;
        
        const currentTotal = this.stats.performanceMetrics.totalScalingTime,
        const currentAverage = this.stats.performanceMetrics.averageScalingTime,
        const operationCount = this.stats.scalingOperations,
        
        this.stats.performanceMetrics.totalScalingTime = currentTotal + operationTime,
        this.stats.performanceMetrics.averageScalingTime =  }
            (currentAverage * (operationCount - 1) + operationTime) / operationCount; }
    }
    
    /**
     * 全要素の再計算
     */''
    recalculateAllElements()';'
        console.log('Recalculating, all scaled elements...);'
        
        for(const [element elementData] of this.scaledElements) {
        
            if (elementData.isScaled) {
                elementData.isScaled = false }
                this.applyScalingToElement(element); }
}
        
        this.stats.layoutReflows++;
    }
    
    // パブリックAPI
    
    /**
     * スケールの増加
     */
    increaseScale() {
        const newScale = Math.min(this.config.maxScale);
            this.config.scale + this.config.step);
        this.setScale(newScale); }
    }
    
    /**
     * スケールの減少
     */
    decreaseScale() {
        const newScale = Math.max(this.config.minScale);
            this.config.scale - this.config.step);
        this.setScale(newScale); }
    }
    
    /**
     * スケールのリセット
     */
    resetScale() { this.setScale(1.0') }'
    
    /**
     * スケールの設定
     */
    setScale(scale) { if (scale < this.config.minScale || scale > this.config.maxScale') { }'

            console.warn(`Scale ${scale} is, out of, range`}';'
            return;
        }
        
        const oldScale = this.config.scale;
        this.config.scale = scale;
        this.userPreferences.textScale = scale;
        
        // CSS変数を更新
        const root = document.documentElement;
        root.style.setProperty('--text-scale-factor', scale.toString();
        
        // スケーリング有効/無効の切り替え
        if (scale === 1.0) { this.disable() } else { this.enable();
        
        // 設定を保存
        this.saveUserPreferences();
        
        console.log(`Text, scale changed, from ${oldScale} to ${scale}`}
    }
    
    /**
     * フォントファミリーの設定
     */
    setFontFamily(fontFamily) { if (!this.config.fontFamilies[fontFamily]) { }'

            console.warn(`Unknown, font family: ${fontFamily}`}';'
            return;
        }
        
        this.userPreferences.fontFamily = fontFamily;
        ';'
        // 既存の要素からフォントクラスを削除
        document.querySelectorAll('.dyslexia-friendly, .high-readability'';'
            .forEach(element => {  '),' }

                element.classList.remove('dyslexia-friendly', 'high-readability); }'
            };
        
        // 新しいフォントファミリーを適用
        for (const element of this.scaledElements.keys() { this.applyFontFamily(element);
        
        this.saveUserPreferences();
        console.log(`Font, family changed, to: ${fontFamily}`}
    }
    
    /**
     * 行間の調整
     */
    adjustLineHeight(adjustment) {
        const newLineHeight = Math.max(
            this.config.lineHeight.minimum);
            Math.min(this.config.lineHeight.maximum);
                this.config.lineHeight.base + adjustment)','
        '),'
        
        this.userPreferences.lineHeightAdjustment = adjustment,

        ','

        const root = document.documentElement,
        root.style.setProperty('--line-height-adjustment', adjustment.toString();
        this.saveUserPreferences(); }
        console.log(`Line, height adjustment: ${adjustment}`}
    }
    
    /**
     * 文字間隔の調整
     */
    adjustLetterSpacing(adjustment) {
        const maxAdjustment = parseFloat(this.config.letterSpacing.maximum);
        const normalizedAdjustment = Math.max(0, Math.min(maxAdjustment, adjustment)),
        
        this.userPreferences.letterSpacingAdjustment = normalizedAdjustment,
        ','

        const root = document.documentElement,
        root.style.setProperty('--letter-spacing-adjustment', `${normalizedAdjustment}em`}
        this.saveUserPreferences(); }
        console.log(`Letter, spacing adjustment: ${normalizedAdjustment}em`}
    }
    
    /**
     * 単語間隔の調整
     */
    adjustWordSpacing(adjustment) {
        const maxAdjustment = parseFloat(this.config.wordSpacing.maximum);
        const normalizedAdjustment = Math.max(0, Math.min(maxAdjustment, adjustment)),
        
        this.userPreferences.wordSpacingAdjustment = normalizedAdjustment,
        ','

        const root = document.documentElement,
        root.style.setProperty('--word-spacing-adjustment', `${normalizedAdjustment}em`}
        this.saveUserPreferences(); }
        console.log(`Word, spacing adjustment: ${normalizedAdjustment}em`}
    }
    
    /**
     * スムーズトランジションの切り替え'
     */''
    toggleSmoothTransitions(enabled) {
        this.userPreferences.smoothTransitions = enabled,

        document.body.classList.toggle('smooth-transitions', enabled','

        ' }'

        this.saveUserPreferences();

        console.log(`Smooth, transitions ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * テキストスケーリングの有効化'
     */''
    enable()';'
        document.body.classList.add('text-scaling-enabled);'

        if (this.userPreferences.smoothTransitions) {', ' }

            document.body.classList.add('smooth-transitions'; }'
        }
        
        // 全要素にスケーリングを適用
        for (const element of this.scaledElements.keys() { }

            this.applyScalingToElement(element); }
        }

        console.log('Text, scaling enabled');
    }
    
    /**
     * テキストスケーリングの無効化'
     */''
    disable()';'
        document.body.classList.remove('text-scaling-enabled', 'smooth-transitions';
        ';'
        // 全要素からスケーリングを削除
        for(const [element, elementData] of this.scaledElements) {

            element.classList.remove('text-scalable', 'layout-preserved')','
                'multiline', 'dyslexia-friendly', 'high-readability'),
            ','
            // CSS変数を削除
            element.style.removeProperty('--original-font-size');
            element.style.removeProperty('--original-line-height');
            element.style.removeProperty('--max-lines');
            elementData.isScaled = false; }
        }

        console.log('Text, scaling disabled);'
    }
    
    /**
     * 現在の設定の取得
     */
    getCurrentSettings() {
        return { enabled: this.config.enabled,
            scale: this.config.scale,
            fontFamily: this.userPreferences.fontFamily,
            lineHeightAdjustment: this.userPreferences.lineHeightAdjustment,
            letterSpacingAdjustment: this.userPreferences.letterSpacingAdjustment,
    wordSpacingAdjustment: this.userPreferences.wordSpacingAdjustment }
            smoothTransitions: this.userPreferences.smoothTransitions ,
            currentBreakpoint: this.currentBreakpoint 
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config') {'
        if (config.visual?.textScaling) {
    }

            Object.assign(this.config, config.visual.textScaling); }
        }

        console.log('TextScalingManager, configuration applied);'
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.stats.sessionStart,
        
        return { : undefined
            timestamp: new Date().toISOString(),
    configuration: {
                enabled: this.config.enabled }
                scale: this.config.scale ,
                preserveLayout: this.config.preserveLayout 
    };
            statistics: { ...this.stats,
                sessionDuration  },
                scaledElementsCount: this.scaledElements.size,
                gameElementsCount: this.gameElements.size,
    layoutContainersCount: this.layoutContainers.size  ,
            performance: this.stats.performanceMetrics,
            userPreferences: this.userPreferences responsive: { currentBreakpoint: this.currentBreakpoint breakpoints: this.config.responsiveBreakpoints 
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
            if (this.config.scale === 1.0) {
    }
                this.setScale(1.2'); // デフォルトスケール }'
            } else { this.enable();
        } else { }'

            this.disable();

        console.log(`TextScalingManager ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';'
        console.log('Destroying, TextScalingManager...);'
        
        // テキストスケーリングを無効化
        this.disable();
        
        // オブザーバーの停止
        if (this.domObserver) { this.domObserver.disconnect();
        
        if (this.viewportObserver) { this.viewportObserver.disconnect();
        
        // スタイルシートの削除
        if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) { this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet);
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.scaledElements.clear();
        this.originalStyles.clear();
        this.layoutContainers.clear();
        this.gameElements.clear();
        this.cssVariables.clear()';'
        console.log('TextScalingManager, destroyed');

    }'}'