/**
 * FocusRingRenderer
 * フォーカスリング視覚的レンダリング、ハイコントラストサポート、アニメーション・スタイリング、視覚フィードバック管理を担当
 */
export class FocusRingRenderer {
    constructor(focusManager) {
        this.focusManager = focusManager;
        this.gameEngine = focusManager.gameEngine;
        
        // レンダリング設定
        this.renderConfig = {
            enabled: true,
            showFocusRings: true,
            highContrastMode: false,
            animationsEnabled: true,
            customStyles: true
        };
        
        // スタイル設定
        this.styleConfig = {
            focusRingColor: '#007acc',
            focusRingWidth: '2px',
            focusRingStyle: 'solid',
            focusRingOffset: '2px',
            highContrastColor: '#ffff00',
            animationDuration: '150ms',
            animationEasing: 'ease-out'
        };
        
        // DOM要素
        this.styleElement = null;
        this.customCSS = '';
        
        console.log('[FocusRingRenderer] Component initialized');
    }
    
    /**
     * フォーカススタイルを初期化
     */
    initialize() {
        this.setupFocusStyles();
        this.detectHighContrastMode();
        this.setupMediaQueryListeners();
        
        console.log('[FocusRingRenderer] Initialization completed');
    }
    
    /**
     * フォーカススタイルを設定
     */
    setupFocusStyles() {
        if (this.styleElement) {
            this.styleElement.remove();
        }
        
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'focus-manager-styles';
        
        this.customCSS = this.generateFocusCSS();
        this.styleElement.textContent = this.customCSS;
        
        document.head.appendChild(this.styleElement);
        
        console.log('[FocusRingRenderer] Focus styles applied');
    }
    
    /**
     * フォーカスCSSを生成
     * @returns {string} 生成されたCSS
     */
    generateFocusCSS() {
        const { focusRingColor, focusRingWidth, focusRingStyle, focusRingOffset, 
                highContrastColor, animationDuration, animationEasing } = this.styleConfig;
        
        const primaryColor = this.renderConfig.highContrastMode ? highContrastColor : focusRingColor;
        
        return `
            /* フォーカス管理基本スタイル */
            .focus-manager-active {
                outline: none !important;
            }
            
            /* カスタムフォーカスリング */
            .focus-ring {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: ${focusRingOffset} !important;
                ${this.renderConfig.animationsEnabled ? `transition: outline-color ${animationDuration} ${animationEasing};` : ''}
            }
            
            /* インタラクティブ要素の基本フォーカススタイル */
            button:focus-visible,
            a:focus-visible,
            input:focus-visible,
            select:focus-visible,
            textarea:focus-visible,
            [tabindex]:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: ${focusRingOffset} !important;
                ${this.renderConfig.animationsEnabled ? `transition: outline-color ${animationDuration} ${animationEasing};` : ''}
            }
            
            /* ハイコントラストモード用スタイル */
            ${this.renderConfig.highContrastMode ? `
                .focus-ring,
                button:focus-visible,
                a:focus-visible,
                input:focus-visible,
                select:focus-visible,
                textarea:focus-visible,
                [tabindex]:focus-visible {
                    outline-color: ${highContrastColor} !important;
                    outline-width: 3px !important;
                    background-color: rgba(255, 255, 0, 0.1) !important;
                }
            ` : ''}
            
            /* マウス使用時はフォーカスリングを非表示 */
            body.using-mouse *:focus {
                outline: none !important;
            }
            
            /* キーボード使用時はフォーカスリングを表示 */
            body.using-keyboard *:focus {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: ${focusRingOffset} !important;
            }
            
            /* ゲーム固有のフォーカススタイル */
            .game-button:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: 4px !important;
                box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.3) !important;
                ${this.renderConfig.animationsEnabled ? `transition: box-shadow ${animationDuration} ${animationEasing}, outline-color ${animationDuration} ${animationEasing};` : ''}
            }
            
            .menu-item:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: -2px !important;
                background-color: rgba(0, 122, 204, 0.1) !important;
                ${this.renderConfig.animationsEnabled ? `transition: background-color ${animationDuration} ${animationEasing}, outline-color ${animationDuration} ${animationEasing};` : ''}
            }
            
            .settings-control:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
            }
            
            /* スキップリンクスタイル */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: ${primaryColor};
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                opacity: 0;
                transform: translateY(-10px);
                ${this.renderConfig.animationsEnabled ? `transition: opacity ${animationDuration} ${animationEasing}, transform ${animationDuration} ${animationEasing};` : ''}
            }
            
            .skip-link:focus {
                position: absolute;
                top: 6px;
                opacity: 1;
                transform: translateY(0);
                outline: 2px solid white !important;
                outline-offset: 2px !important;
            }
            
            /* フォーカストラップ内のスタイル */
            .focus-trap-active {
                position: relative;
            }
            
            .focus-trap-active::before {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border: 2px solid ${primaryColor};
                border-radius: 4px;
                pointer-events: none;
                z-index: 1;
                ${this.renderConfig.animationsEnabled ? `animation: focus-trap-pulse 2s infinite;` : ''}
            }
            
            /* フォーカストラップパルスアニメーション */
            ${this.renderConfig.animationsEnabled ? `
                @keyframes focus-trap-pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            ` : ''}
            
            /* モーション削減対応 */
            @media (prefers-reduced-motion: reduce) {
                .focus-ring,
                button:focus-visible,
                a:focus-visible,
                input:focus-visible,
                select:focus-visible,
                textarea:focus-visible,
                [tabindex]:focus-visible,
                .game-button:focus-visible,
                .menu-item:focus-visible,
                .skip-link,
                .focus-trap-active::before {
                    transition: none !important;
                    animation: none !important;
                }
            }
            
            /* 高コントラストモード検出 */
            @media (prefers-contrast: high) {
                .focus-ring,
                button:focus-visible,
                a:focus-visible,
                input:focus-visible,
                select:focus-visible,
                textarea:focus-visible,
                [tabindex]:focus-visible {
                    outline-color: ${highContrastColor} !important;
                    outline-width: 3px !important;
                }
            }
            
            /* 強制カラーモード対応 */
            @media (forced-colors: active) {
                .focus-ring,
                button:focus-visible,
                a:focus-visible,
                input:focus-visible,
                select:focus-visible,
                textarea:focus-visible,
                [tabindex]:focus-visible {
                    outline: 2px solid Highlight !important;
                    outline-offset: 2px !important;
                }
                
                .skip-link {
                    background: ButtonText !important;
                    color: ButtonFace !important;
                }
                
                .focus-trap-active::before {
                    border-color: Highlight !important;
                }
            }
        `;
    }
    
    /**
     * フォーカスリングを要素に適用
     * @param {HTMLElement} element 対象要素
     * @param {Object} options レンダリングオプション
     */
    renderFocusRing(element, options = {}) {
        if (!element || !this.renderConfig.enabled) return;
        
        try {
            const {
                color = this.styleConfig.focusRingColor,
                width = this.styleConfig.focusRingWidth,
                style = this.styleConfig.focusRingStyle,
                offset = this.styleConfig.focusRingOffset,
                animated = this.renderConfig.animationsEnabled,
                customClass = null
            } = options;
            
            // 既存のフォーカスクラスを削除
            element.classList.remove('focus-ring');
            
            if (this.renderConfig.showFocusRings) {
                // フォーカスリングクラスを追加
                element.classList.add('focus-ring');
                
                // カスタムクラスがある場合は追加
                if (customClass) {
                    element.classList.add(customClass);
                }
                
                // インラインスタイルでカスタマイズ
                if (color !== this.styleConfig.focusRingColor || 
                    width !== this.styleConfig.focusRingWidth ||
                    style !== this.styleConfig.focusRingStyle ||
                    offset !== this.styleConfig.focusRingOffset) {
                    
                    const actualColor = this.renderConfig.highContrastMode ? 
                                       this.styleConfig.highContrastColor : color;
                    
                    element.style.outline = `${width} ${style} ${actualColor}`;
                    element.style.outlineOffset = offset;
                }
                
                // アニメーション設定
                if (animated && this.renderConfig.animationsEnabled) {
                    element.style.transition = `outline-color ${this.styleConfig.animationDuration} ${this.styleConfig.animationEasing}`;
                }
            }
            
            console.log(`[FocusRingRenderer] Focus ring applied to element:`, element.tagName);
            
        } catch (error) {
            console.error('[FocusRingRenderer] Error rendering focus ring:', error);
        }
    }
    
    /**
     * フォーカスリングを要素から削除
     * @param {HTMLElement} element 対象要素
     */
    removeFocusRing(element) {
        if (!element) return;
        
        element.classList.remove('focus-ring');
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.transition = '';
        
        console.log(`[FocusRingRenderer] Focus ring removed from element:`, element.tagName);
    }
    
    /**
     * フォーカスリングスタイルを更新
     * @param {HTMLElement} element 対象要素
     * @param {Object} styleOptions スタイルオプション
     */
    updateFocusRingStyle(element, styleOptions = {}) {
        if (!element) return;
        
        const {
            color,
            width,
            style,
            offset,
            animated
        } = styleOptions;
        
        if (color) {
            const actualColor = this.renderConfig.highContrastMode ? 
                               this.styleConfig.highContrastColor : color;
            element.style.outlineColor = actualColor;
        }
        
        if (width) {
            element.style.outlineWidth = width;
        }
        
        if (style) {
            element.style.outlineStyle = style;
        }
        
        if (offset) {
            element.style.outlineOffset = offset;
        }
        
        if (animated !== undefined) {
            if (animated && this.renderConfig.animationsEnabled) {
                element.style.transition = `outline-color ${this.styleConfig.animationDuration} ${this.styleConfig.animationEasing}`;
            } else {
                element.style.transition = '';
            }
        }
    }
    
    /**
     * ハイコントラストモードを処理
     * @param {boolean} enabled ハイコントラストを有効にするか
     */
    handleHighContrast(enabled) {
        this.renderConfig.highContrastMode = enabled;
        
        // スタイルを再生成して適用
        this.setupFocusStyles();
        
        // 現在フォーカスされている要素があれば更新
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('focus-ring')) {
            this.renderFocusRing(focusedElement);
        }
        
        console.log(`[FocusRingRenderer] High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * ハイコントラストモードを検出
     */
    detectHighContrastMode() {
        // CSS媒体クエリでハイコントラストを検出
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
        
        const isHighContrast = highContrastQuery.matches || forcedColorsQuery.matches;
        
        if (isHighContrast !== this.renderConfig.highContrastMode) {
            this.handleHighContrast(isHighContrast);
        }
    }
    
    /**
     * メディアクエリリスナーを設定
     */
    setupMediaQueryListeners() {
        // ハイコントラストモード変更監視
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
        
        highContrastQuery.addListener(() => this.detectHighContrastMode());
        forcedColorsQuery.addListener(() => this.detectHighContrastMode());
        
        // モーション設定変更監視
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addListener((e) => {
            this.renderConfig.animationsEnabled = !e.matches;
            this.setupFocusStyles();
        });
        
        console.log('[FocusRingRenderer] Media query listeners set up');
    }
    
    /**
     * 視覚フィードバックを管理
     * @param {HTMLElement} element 対象要素
     * @param {string} feedbackType フィードバックタイプ
     * @param {Object} options オプション
     */
    manageVisualFeedback(element, feedbackType, options = {}) {
        if (!element) return;
        
        try {
            switch (feedbackType) {
                case 'focus':
                    this.renderFocusRing(element, options);
                    break;
                    
                case 'hover':
                    this.applyHoverEffect(element, options);
                    break;
                    
                case 'active':
                    this.applyActiveEffect(element, options);
                    break;
                    
                case 'disabled':
                    this.applyDisabledEffect(element, options);
                    break;
                    
                case 'error':
                    this.applyErrorEffect(element, options);
                    break;
                    
                default:
                    console.warn(`[FocusRingRenderer] Unknown feedback type: ${feedbackType}`);
            }
            
        } catch (error) {
            console.error('[FocusRingRenderer] Error managing visual feedback:', error);
        }
    }
    
    /**
     * ホバー効果を適用
     * @param {HTMLElement} element 対象要素
     * @param {Object} options オプション
     */
    applyHoverEffect(element, options = {}) {
        const hoverClass = options.hoverClass || 'focus-hover';
        element.classList.add(hoverClass);
    }
    
    /**
     * アクティブ効果を適用
     * @param {HTMLElement} element 対象要素
     * @param {Object} options オプション
     */
    applyActiveEffect(element, options = {}) {
        const activeClass = options.activeClass || 'focus-active';
        element.classList.add(activeClass);
    }
    
    /**
     * 無効化効果を適用
     * @param {HTMLElement} element 対象要素
     * @param {Object} options オプション
     */
    applyDisabledEffect(element, options = {}) {
        const disabledClass = options.disabledClass || 'focus-disabled';
        element.classList.add(disabledClass);
        element.style.opacity = '0.5';
        element.style.cursor = 'not-allowed';
    }
    
    /**
     * エラー効果を適用
     * @param {HTMLElement} element 対象要素
     * @param {Object} options オプション
     */
    applyErrorEffect(element, options = {}) {
        const errorColor = options.errorColor || '#ff4444';
        element.style.outlineColor = errorColor;
        element.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
    }
    
    /**
     * レンダリング設定を更新
     * @param {Object} config 新しい設定
     */
    updateRenderConfig(config) {
        Object.assign(this.renderConfig, config);
        
        if (config.hasOwnProperty('enabled') || 
            config.hasOwnProperty('showFocusRings') ||
            config.hasOwnProperty('highContrastMode') ||
            config.hasOwnProperty('animationsEnabled')) {
            this.setupFocusStyles();
        }
        
        console.log('[FocusRingRenderer] Render config updated');
    }
    
    /**
     * スタイル設定を更新
     * @param {Object} config 新しいスタイル設定
     */
    updateStyleConfig(config) {
        Object.assign(this.styleConfig, config);
        this.setupFocusStyles();
        
        console.log('[FocusRingRenderer] Style config updated');
    }
    
    /**
     * 現在の設定を取得
     * @returns {Object} 現在の設定
     */
    getConfig() {
        return {
            render: { ...this.renderConfig },
            style: { ...this.styleConfig }
        };
    }
    
    /**
     * レンダラー統計を取得
     * @returns {Object} レンダラー統計
     */
    getRendererStats() {
        return {
            enabled: this.renderConfig.enabled,
            showFocusRings: this.renderConfig.showFocusRings,
            highContrastMode: this.renderConfig.highContrastMode,
            animationsEnabled: this.renderConfig.animationsEnabled,
            customStylesEnabled: this.renderConfig.customStyles,
            hasStyleElement: !!this.styleElement,
            cssLength: this.customCSS.length
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        // スタイル要素を削除
        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
        
        // 設定をリセット
        this.customCSS = '';
        
        console.log('[FocusRingRenderer] Component destroyed');
    }
}