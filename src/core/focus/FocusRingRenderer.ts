/**
 * FocusRingRenderer
 * フォーカスリング視覚的レンダリング、ハイコントラストサポート、アニメーション・スタイリング、視覚フィードバック管理を担当
 */

// 型定義
export interface FocusManager {
    gameEngine: GameEngine;
}

export interface GameEngine { // GameEngineインターフェースの基本定義
    [key: string]: any, }

export interface RenderConfig { enabled: boolean,
    showFocusRings: boolean;
    highContrastMode: boolean;
    animationsEnabled: boolean;
    customStyles: boolean ,}

export interface StyleConfig { focusRingColor: string;
    focusRingWidth: string;
    focusRingStyle: string;
    focusRingOffset: string;
    highContrastColor: string;
    animationDuration: string;
    animationEasing: string }

export interface FocusRingOptions { color?: string;
    width?: string;
    style?: string;
    offset?: string;
    animated?: boolean;
    customClass?: string | null; }

export interface VisualFeedbackOptions { hoverClass?: string;
    activeClass?: string;
    disabledClass?: string;
    errorColor?: string;
    [key: string]: any, }

export interface StyleUpdateOptions { color?: string;
    width?: string;
    style?: string;
    offset?: string;
    animated?: boolean; }

export interface RendererConfig { render: RenderConfig,
    style: StyleConfig
    ,}

export interface RendererStats { enabled: boolean;
    showFocusRings: boolean;
    highContrastMode: boolean;
    animationsEnabled: boolean;
    customStylesEnabled: boolean;
    hasStyleElement: boolean;
    cssLength: number }

export interface MediaQuerySupport { highContrast: boolean;
    forcedColors: boolean;
    reducedMotion: boolean }

export interface CSSGenerationContext { primaryColor: string;
    focusRingColor: string;
    focusRingWidth: string;
    focusRingStyle: string;
    focusRingOffset: string;
    highContrastColor: string;
    animationDuration: string;
    animationEasing: string;
    highContrastMode: boolean;
    animationsEnabled: boolean }

// 列挙型
export type VisualFeedbackType = 'focus' | 'hover' | 'active' | 'disabled' | 'error';''
export type CSSColorScheme = 'light' | 'dark' | 'auto';''
export type OutlineStyle = 'solid' | 'dashed' | 'dotted' | 'double';''
export type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

// 定数
export const DEFAULT_RENDER_CONFIG: RenderConfig = { enabled: true,
    showFocusRings: true;
    highContrastMode: false;
    animationsEnabled: true;
    customStyles: true ,};
';

export const DEFAULT_STYLE_CONFIG: StyleConfig = {;
    focusRingColor: '#007acc',
    focusRingWidth: '2px',
    focusRingStyle: 'solid',
    focusRingOffset: '2px',
    highContrastColor: '#ffff00',
    animationDuration: '150ms',
    animationEasing: 'ease-out' ,};
';

export const FOCUS_CSS_SELECTORS = {;
    INTERACTIVE_ELEMENTS: 'button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible',
    GAME_ELEMENTS: '.game-button:focus-visible, .menu-item:focus-visible, .settings-control:focus-visible',
    FOCUS_RING_CLASS: '.focus-ring',
    SKIP_LINK: '.skip-link',
    FOCUS_TRAP: '.focus-trap-active' ,} as const;
';

export const CSS_CUSTOM_PROPERTIES = {;
    FOCUS_COLOR: '--focus-ring-color',
    FOCUS_WIDTH: '--focus-ring-width',
    FOCUS_OFFSET: '--focus-ring-offset',
    ANIMATION_DURATION: '--focus-animation-duration' ,} as const;
';

export const MEDIA_QUERIES = {;
    HIGH_CONTRAST: '(prefers-contrast: high')',
    FORCED_COLORS: '(forced-colors: active')',
    REDUCED_MOTION: '(prefers-reduced-motion: reduce')' ,} as const;
';

export const ACCESSIBILITY_COLORS = {;
    HIGHLIGHT: 'Highlight',
    BUTTON_TEXT: 'ButtonText',
    BUTTON_FACE: 'ButtonFace' ,} as const;
';
// ユーティリティ関数
export function isValidColor(color: string): boolean {;
    const tempElement = document.createElement('div'');

    tempElement.style.color = color;''
    return tempElement.style.color !== ''; }

export function parseAnimationDuration(duration: string): number { const match = duration.match(/^(\d+(?:\.\d+)? )(ms|s)$/);
    if (!match) return 150; // デフォルト値

    const value = parseFloat(match[1]);
    const unit = match[2];

     : undefined'';
    return unit === 's' ? value * 1000 : value; }

export function validateStyleConfig(config: Partial<StyleConfig>): boolean { if(config.focusRingColor && !isValidColor(config.focusRingColor) {
        return false; }
    
    if(config.highContrastColor && !isValidColor(config.highContrastColor) { return false; }
    
    if(config.focusRingWidth && !config.focusRingWidth.match(/^\d+px$/) { return false; }
    
    return true;
}
';

export function createCSSRule(selector: string, properties: Record<string, string>): string { const propertyStrings = Object.entries(properties)' }'

        .map(([key, value]) => `${key}: ${value}`')''
        .join('; ');
    
    return `${selector} { ${propertyStrings}`;

}

export function sanitizeCSS(css: string): string { // 基本的なCSS検証とサニタイゼーション
    return css'';
        .replace(/<script[^>]*>.*? <\/script>/gi, ''') : undefined'';
        .replace(/javascript:/gi, ''')'';
        .replace(/expression\s*\(/gi, ''); }

export function generateAnimationCSS(duration: string, easing: string): string {
    return `transition: outline-color ${duration} ${easing}`;
}

export class FocusRingRenderer {
    private focusManager: FocusManager;
    private gameEngine: GameEngine;
    // レンダリング設定
    private renderConfig: RenderConfig;
    // スタイル設定
    private styleConfig: StyleConfig;
    // DOM要素
    private styleElement: HTMLStyleElement | null = null'';
    private customCSS: string = '';
    // メディアクエリリスナー
    private mediaQueryListeners: MediaQueryList[] = [];

    constructor(focusManager: FocusManager) {
        this.focusManager = focusManager;
        this.gameEngine = focusManager.gameEngine;
        
    }
        // 設定の初期化 }
        this.renderConfig = { ...DEFAULT_RENDER_CONFIG;
        this.styleConfig = { ...DEFAULT_STYLE_CONFIG;

        console.log('[FocusRingRenderer] Component, initialized);
    }
    
    /**
     * フォーカススタイルを初期化
     */
    initialize(): void { this.setupFocusStyles();

        this.detectHighContrastMode(');''
        this.setupMediaQueryListeners()';
        console.log('[FocusRingRenderer] Initialization, completed'); }'
    
    /**
     * フォーカススタイルを設定
     */'
    setupFocusStyles(): void { if (this.styleElement) {''
            this.styleElement.remove()';
        this.styleElement = document.createElement('style'');''
        this.styleElement.id = 'focus-manager-styles';
        
        this.customCSS = this.generateFocusCSS();
        this.styleElement.textContent = sanitizeCSS(this.customCSS);

        document.head.appendChild(this.styleElement);

        console.log('[FocusRingRenderer] Focus, styles applied'); }'
    
    /**
     * フォーカスCSSを生成
     */
    private generateFocusCSS(): string { const context: CSSGenerationContext = {
            ...this.styleConfig,
            primaryColor: this.renderConfig.highContrastMode ?   : undefined
                         this.styleConfig.highContrastColor : ;
                         this.styleConfig.focusRingColor,
            highContrastMode: this.renderConfig.highContrastMode;
            animationsEnabled: this.renderConfig.animationsEnabled ,};
        return this.buildCompleteCSS(context);
    }
    
    /**
     * 完全なCSSを構築
     */
    private buildCompleteCSS(context: CSSGenerationContext): string { const { primaryColor, focusRingWidth, focusRingStyle, focusRingOffset, 
                highContrastColor, animationDuration, animationEasing, }
                highContrastMode, animationsEnabled } = context;
        ';

        const animationCSS = animationsEnabled ?   : undefined'';
            generateAnimationCSS(animationDuration, animationEasing) : '';

        const highContrastCSS = highContrastMode ? this.generateHighContrastCSS(context) : '';''
        const animationKeyframes = animationsEnabled ? this.generateAnimationKeyframes(') : '';
        
        return `;
            /* フォーカス管理基本スタイル */
            .focus-manager-active { outline: none !important }
            
            /* カスタムフォーカスリング */
            ${FOCUS_CSS_SELECTORS.FOCUS_RING_CLASS} {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: ${focusRingOffset} !important;''
                ${animationCSS ? `${animationCSS};` : ''
            }
            
            /* インタラクティブ要素の基本フォーカススタイル */
            ${FOCUS_CSS_SELECTORS.INTERACTIVE_ELEMENTS} {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: ${focusRingOffset} !important;''
                ${animationCSS ? `${animationCSS};` : ''
            }
            
            ${highContrastCSS}
            
            /* マウス使用時はフォーカスリングを非表示 */
            body.using-mouse *:focus { outline: none !important }
            
            /* キーボード使用時はフォーカスリングを表示 */
            body.using-keyboard *:focus {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: ${focusRingOffset} !important;
            }
            
            /* ゲーム固有のフォーカススタイル */
            .game-button:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: 4px !important,
                box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.3) !important;''
                ${animationCSS ? `${animationCSS}, box-shadow ${animationDuration} ${animationEasing};` : ''
            }
            
            .menu-item:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: -2px !important,
                background-color: rgba(0, 122, 204, 0.1) !important;''
                ${animationCSS ? `${animationCSS}, background-color ${animationDuration} ${animationEasing};` : ''
            }
            
            .settings-control:focus-visible {
                outline: ${focusRingWidth} ${focusRingStyle} ${primaryColor} !important;
                outline-offset: 2px !important,
                border-radius: 4px !important,
            }
            
            ${this.generateSkipLinkCSS(context})
            ${this.generateFocusTrapCSS(context})
            ${this.generateMediaQueryCSS(context})
            ${animationKeyframes}
        `;
    }
    
    /**
     * ハイコントラストCSS生成
     */
    private generateHighContrastCSS(context: CSSGenerationContext): string {
        const { highContrastColor } = context;
        
        return `;
            /* ハイコントラストモード用スタイル */
            ${FOCUS_CSS_SELECTORS.FOCUS_RING_CLASS},
            ${FOCUS_CSS_SELECTORS.INTERACTIVE_ELEMENTS} {
                outline-color: ${highContrastColor} !important;
                outline-width: 3px !important,
                background-color: rgba(255, 255, 0, 0.1) !important;
            }
        `;
    }
    
    /**
     * スキップリンクCSS生成'
     */''
    private generateSkipLinkCSS(context: CSSGenerationContext): string {
        const { primaryColor, animationDuration, animationEasing, animationsEnabled } = context;
        ';

        const transitionCSS = animationsEnabled ?   : undefined'';
            `transition: opacity ${animationDuration} ${animationEasing}, transform ${animationDuration} ${animationEasing};` : '';
        
        return `;
            /* スキップリンクスタイル */
            ${FOCUS_CSS_SELECTORS.SKIP_LINK} { position: absolute,
                top: -40px;
                left: 6px, }
                background: ${primaryColor};
                color: white;
                padding: 8px 16px;
                text-decoration: none,
                border-radius: 4px,
                z-index: 10000,
                opacity: 0;
                transform: translateY(-10px);
                ${transitionCSS}
            
            ${FOCUS_CSS_SELECTORS.SKIP_LINK}:focus { position: absolute,
                top: 6px;
                opacity: 1, }
                transform: translateY(0};
                outline: 2px, solid white !important);
                outline-offset: 2px !important);
            }
        `;
    );
    /**
     * フォーカストラップCSS生成'
     */''
    private generateFocusTrapCSS(context: CSSGenerationContext): string {
        const { primaryColor, animationsEnabled } = context;

        const animationCSS = animationsEnabled ? 'animation: focus-trap-pulse 2s infinite;' : '';
        
        return `;
            /* フォーカストラップ内のスタイル */
            ${FOCUS_CSS_SELECTORS.FOCUS_TRAP} { position: relative }
            ';

            ${FOCUS_CSS_SELECTORS.FOCUS_TRAP}::before { ''
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px, }
                border: 2px solid ${primaryColor}
                border-radius: 4px;
                pointer-events: none,
                z-index: 1,
                ${animationCSS}
        `;
    }
    
    /**
     * アニメーションキーフレーム生成
     */
    private generateAnimationKeyframes(): string { return `
            /* フォーカストラップパルスアニメーション */
            @keyframes focus-trap-pulse { }
                0%, 100% { opacity: 0.6, }
                50% { opacity: 1 }
        `;
    }
    
    /**
     * メディアクエリCSS生成
     */
    private generateMediaQueryCSS(context: CSSGenerationContext): string {
        const { highContrastColor } = context;
        
        return `;
            /* モーション削減対応 */
            @media ${MEDIA_QUERIES.REDUCED_MOTION} {
                ${FOCUS_CSS_SELECTORS.FOCUS_RING_CLASS},
                ${FOCUS_CSS_SELECTORS.INTERACTIVE_ELEMENTS},
                ${FOCUS_CSS_SELECTORS.GAME_ELEMENTS},
                ${FOCUS_CSS_SELECTORS.SKIP_LINK},
                ${FOCUS_CSS_SELECTORS.FOCUS_TRAP}::before { transition: none !important,
                    animation: none !important ,}
            }
            
            /* 高コントラストモード検出 */
            @media ${MEDIA_QUERIES.HIGH_CONTRAST} {
                ${FOCUS_CSS_SELECTORS.FOCUS_RING_CLASS};
                ${FOCUS_CSS_SELECTORS.INTERACTIVE_ELEMENTS} {
                    outline-color: ${highContrastColor} !important;
                    outline-width: 3px !important,
                }
            }
            
            /* 強制カラーモード対応 */
            @media ${MEDIA_QUERIES.FORCED_COLORS} {
                ${FOCUS_CSS_SELECTORS.FOCUS_RING_CLASS},
                ${FOCUS_CSS_SELECTORS.INTERACTIVE_ELEMENTS} {
                    outline: 2px solid ${ACCESSIBILITY_COLORS.HIGHLIGHT} !important;
                    outline-offset: 2px !important,
                }
                
                ${FOCUS_CSS_SELECTORS.SKIP_LINK} {
                    background: ${ACCESSIBILITY_COLORS.BUTTON_TEXT} !important;
                    color: ${ACCESSIBILITY_COLORS.BUTTON_FACE} !important;
                }
                
                ${FOCUS_CSS_SELECTORS.FOCUS_TRAP}::before {
                    border-color: ${ACCESSIBILITY_COLORS.HIGHLIGHT} !important;
                }
            }
        `;
    }
    
    /**
     * フォーカスリングを要素に適用
     */'
    renderFocusRing(element: HTMLElement, options: FocusRingOptions = { ): void {''
        if(!element || !this.renderConfig.enabled) return;
        
        try {
            const { color = this.styleConfig.focusRingColor,
                width = this.styleConfig.focusRingWidth,
                style = this.styleConfig.focusRingStyle,
                offset = this.styleConfig.focusRingOffset,
                animated = this.renderConfig.animationsEnabled,
                customClass = null } = options;
            ';
            // 既存のフォーカスクラスを削除
            element.classList.remove('focus-ring);

            if(this.renderConfig.showFocusRings) {'
                // フォーカスリングクラスを追加
                element.classList.add('focus-ring);
                
                // カスタムクラスがある場合は追加
                if (customClass) {
            }
                    element.classList.add(customClass); }
                }
                
                // インラインスタイルでカスタマイズ
                this.applyCustomStyles(element, { color, width, style, offset, animated ); }
            
            console.log(`[FocusRingRenderer] Focus ring applied to element:`, element.tagName);

        } catch (error) { console.error('[FocusRingRenderer] Error rendering focus ring:', error }
    }
    
    /**
     * カスタムスタイルを適用
     */
    private applyCustomStyles(element: HTMLElement, options: StyleUpdateOptions): void {
        const { color, width, style, offset, animated } = options;
        
        if(color !== this.styleConfig.focusRingColor || ;
            width !== this.styleConfig.focusRingWidth ||;
            style !== this.styleConfig.focusRingStyle ||);
            offset !== this.styleConfig.focusRingOffset) { const actualColor = this.renderConfig.highContrastMode ?   : undefined
                               this.styleConfig.highContrastColor: (color || this.styleConfig.focusRingColor 
            element.style.outline = `${width || this.styleConfig.focusRingWidth,} ${style || this.styleConfig.focusRingStyle} ${actualColor}`;
            element.style.outlineOffset = offset || this.styleConfig.focusRingOffset;
        }
        
        // アニメーション設定
        if(animated && this.renderConfig.animationsEnabled) {
            element.style.transition = generateAnimationCSS(;
                this.styleConfig.animationDuration);
                this.styleConfig.animationEasing;
        }
            ); }
}
    
    /**
     * フォーカスリングを要素から削除
     */
    removeFocusRing(element: HTMLElement): void { ''
        if(!element) return;

        element.classList.remove('focus-ring'');''
        element.style.outline = '';''
        element.style.outlineOffset = '';''
        element.style.transition = '';
        
        console.log(`[FocusRingRenderer] Focus ring removed from element:`, element.tagName }
    
    /**
     * フォーカスリングスタイルを更新
     */
    updateFocusRingStyle(element: HTMLElement, styleOptions: StyleUpdateOptions = { ): void {
        if (!element) return;
         }
        const { color, width, style, offset, animated } = styleOptions;
        
        if(color) {
        
            const actualColor = this.renderConfig.highContrastMode ?   : undefined
                               this.styleConfig.highContrastColor: color 
            element.style.outlineColor = actualColor; ,}
        }
        
        if (width) { element.style.outlineWidth = width; }
        
        if (style) { element.style.outlineStyle = style; }
        
        if (offset) { element.style.outlineOffset = offset; }
        
        if(animated !== undefined) {
        
            if (animated && this.renderConfig.animationsEnabled) {
                element.style.transition = generateAnimationCSS(;
                    this.styleConfig.animationDuration)';
                    this.styleConfig.animationEasing';
        }

                '); }'

            } else { }'

                element.style.transition = ''; }
}
    }
    
    /**
     * ハイコントラストモードを処理
     */
    handleHighContrast(enabled: boolean): void { this.renderConfig.highContrastMode = enabled;
        ';
        // スタイルを再生成して適用
        this.setupFocusStyles()';
        if(focusedElement && focusedElement.classList.contains('focus-ring) {'
            ';

        }

            this.renderFocusRing(focusedElement); }
        }

        console.log(`[FocusRingRenderer] High, contrast mode ${enabled ? 'enabled' : 'disabled}`});
    }
    
    /**
     * ハイコントラストモードを検出
     */
    detectHighContrastMode(): void { // CSS媒体クエリでハイコントラストを検出
        const highContrastQuery = window.matchMedia(MEDIA_QUERIES.HIGH_CONTRAST);
        const forcedColorsQuery = window.matchMedia(MEDIA_QUERIES.FORCED_COLORS);
        
        const isHighContrast = highContrastQuery.matches || forcedColorsQuery.matches;
        
        if(isHighContrast !== this.renderConfig.highContrastMode) {
        
            
        
        }
            this.handleHighContrast(isHighContrast); }
}
    
    /**
     * メディアクエリリスナーを設定
     */
    setupMediaQueryListeners(): void { // 既存のリスナーをクリア
        this.clearMediaQueryListeners();
        
        // ハイコントラストモード変更監視
        const highContrastQuery = window.matchMedia(MEDIA_QUERIES.HIGH_CONTRAST);
        const forcedColorsQuery = window.matchMedia(MEDIA_QUERIES.FORCED_COLORS);
        
        const contrastListener = () => this.detectHighContrastMode();
        
        highContrastQuery.addListener(contrastListener);
        forcedColorsQuery.addListener(contrastListener);
        
        // モーション設定変更監視
        const reducedMotionQuery = window.matchMedia(MEDIA_QUERIES.REDUCED_MOTION);
        const motionListener = (e: MediaQueryListEvent) => { 
            this.renderConfig.animationsEnabled = !e.matches }
            this.setupFocusStyles(); }
        };

        reducedMotionQuery.addListener(motionListener);
        
        // リスナーを保存
        this.mediaQueryListeners = [highContrastQuery, forcedColorsQuery, reducedMotionQuery];

        console.log('[FocusRingRenderer] Media, query listeners, set up);
    }
    
    /**
     * メディアクエリリスナーをクリア
     */
    private clearMediaQueryListeners(): void { this.mediaQueryListeners.forEach(query => { )
            // リスナーを削除（実際の実装では適切なリスナー参照が必要）); }
        this.mediaQueryListeners = []; }
    }
    
    /**
     * 視覚フィードバックを管理
     */
    manageVisualFeedback(element: HTMLElement, feedbackType: VisualFeedbackType, options: VisualFeedbackOptions = {}): void { if (!element') return;
        ';

        try {'
            switch(feedbackType) {'

                case 'focus':'';
                    this.renderFocusRing(element, options as FocusRingOptions);
                    break;

                case 'hover':'';
                    this.applyHoverEffect(element, options);
                    break;

                case 'active':'';
                    this.applyActiveEffect(element, options);
                    break;

                case 'disabled':'';
                    this.applyDisabledEffect(element, options);
                    break;

                case 'error':;
                    this.applyErrorEffect(element, options);
                    break;
                    
            }
                default: }

                    console.warn(`[FocusRingRenderer] Unknown, feedback type: ${feedbackType}`});''
            } catch (error) { console.error('[FocusRingRenderer] Error managing visual feedback:', error }
    }
    
    /**
     * ホバー効果を適用'
     */''
    private applyHoverEffect(element: HTMLElement, options: VisualFeedbackOptions): void { ''
        const hoverClass = options.hoverClass || 'focus-hover';
        element.classList.add(hoverClass); }
    
    /**
     * アクティブ効果を適用'
     */''
    private applyActiveEffect(element: HTMLElement, options: VisualFeedbackOptions): void { ''
        const activeClass = options.activeClass || 'focus-active';
        element.classList.add(activeClass); }
    
    /**
     * 無効化効果を適用'
     */''
    private applyDisabledEffect(element: HTMLElement, options: VisualFeedbackOptions): void { ''
        const disabledClass = options.disabledClass || 'focus-disabled';''
        element.classList.add(disabledClass);''
        element.style.opacity = '0.5';''
        element.style.cursor = 'not-allowed'; }
    
    /**
     * エラー効果を適用'
     */''
    private applyErrorEffect(element: HTMLElement, options: VisualFeedbackOptions): void { ''
        const errorColor = options.errorColor || '#ff4444';

        element.style.outlineColor = errorColor;''
        element.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'; }
    
    /**
     * レンダリング設定を更新
     */'
    updateRenderConfig(config: Partial<RenderConfig>): void { ''
        Object.assign(this.renderConfig, config);

        if (config.hasOwnProperty('enabled'') || '';
            config.hasOwnProperty('showFocusRings'') ||'';
            config.hasOwnProperty('highContrastMode'') ||'';
            config.hasOwnProperty('animationsEnabled) {''
            this.setupFocusStyles()';
        console.log('[FocusRingRenderer] Render, config updated'); }'
    
    /**
     * スタイル設定を更新
     */'
    updateStyleConfig(config: Partial<StyleConfig>): void { ''
        if(!validateStyleConfig(config)) {''
            console.warn('[FocusRingRenderer] Invalid, style config, provided');
            return; }
        ';

        Object.assign(this.styleConfig, config);''
        this.setupFocusStyles()';
        console.log('[FocusRingRenderer] Style, config updated);
    }
    
    /**
     * 現在の設定を取得
     */
    getConfig(): RendererConfig { return { }
            render: { ...this.renderConfig;
            style: { ...this.styleConfig;
    }
    
    /**
     * メディアクエリサポート状況を取得
     */
    getMediaQuerySupport(): MediaQuerySupport { return { highContrast: window.matchMedia(MEDIA_QUERIES.HIGH_CONTRAST).matches,
            forcedColors: window.matchMedia(MEDIA_QUERIES.FORCED_COLORS).matches, };
            reducedMotion: window.matchMedia(MEDIA_QUERIES.REDUCED_MOTION).matches }
        }
    
    /**
     * レンダラー統計を取得
     */
    getRendererStats('): RendererStats { return { enabled: this.renderConfig.enabled,
            showFocusRings: this.renderConfig.showFocusRings;
            highContrastMode: this.renderConfig.highContrastMode;
            animationsEnabled: this.renderConfig.animationsEnabled;
            customStylesEnabled: this.renderConfig.customStyles;
            hasStyleElement: !!this.styleElement, };
            cssLength: this.customCSS.length }
        }
    
    /**
     * CSS検証を実行
     */'
    validateCSS(): boolean { try {'
            if(!this.customCSS) return false;
            ';
            // 基本的なCSS構文チェック
            const tempStyle = document.createElement('style);
            tempStyle.textContent = this.customCSS;
            document.head.appendChild(tempStyle);
            
            const isValid = tempStyle.sheet !== null;
            document.head.removeChild(tempStyle);
            ';

            return isValid;' }'

        } catch (error) {
            console.error('[FocusRingRenderer] CSS validation error:', error);
            return false;
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void { // スタイル要素を削除
        if(this.styleElement) {
            this.styleElement.remove();
        }
            this.styleElement = null; }
        }
        ;
        // メディアクエリリスナーをクリア
        this.clearMediaQueryListeners(''';
        this.customCSS = '';)'
        ')';
        console.log('[FocusRingRenderer] Component, destroyed'');

    }''
}