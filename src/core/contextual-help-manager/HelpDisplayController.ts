/**
 * HelpDisplayController
 * 
 * ヘルプ表示制御システム機能を担当
 * Display Management Controller Patternの一部として設計
 * 
 * **Features**:
 * - Contextual help positioning and rendering
 * - Responsive display adaptations and animations
 * - Accessibility support and keyboard navigation
 * - Auto-hide timers and queue management
 * 
 * @module HelpDisplayController
 * Created: Phase G.5 (Issue #103)
 */

// 型定義
export interface HelpDisplayConfig { position: HelpPosition,
    animation: AnimationType;
    duration: number;
    dismissible: boolean;
    persistent: boolean;
    maxWidth: number;
   , fontSize: FontSize
    ,}

export interface HelpContent { title?: string;
    description?: string;
    steps?: HelpStep[];
    sections?: HelpSection[];
    bubbleTypes?: BubbleTypeInfo[];
    strategies?: StrategyInfo[];
    features?: AccessibilityFeature[];
    shortcuts?: Record<string, string>;
    relatedTopics?: string[];
    difficulty?: HelpDifficulty;
    }

export interface HelpStep { step: number,
    title: string;
   , description: string;
    visual?: string;
    keyboardAlternative?: string;
    tips?: string[];
    urgency?: UrgencyLevel;
    ,}

export interface HelpSection { title: string,
    content: string;
    details?: Record<string, string>;
    formula?: string;
    tips?: string[]; }

export interface BubbleTypeInfo { name: string,
    color: string;
    effect: string;
    points: number;
    strategy: string;
   , visual: string;
    warning?: boolean ,}

export interface StrategyInfo { name: string;
    description: string;
    techniques: string[];
    difficulty: HelpDifficulty;
   , effectiveness: EffectivenessLevel
    }

export interface AccessibilityFeature { name: string;
   , description: string;
    shortcuts?: Record<string, string>;
    features?: string[];
    options?: string[]; }

export interface HelpDisplayOptions { targetElement?: HTMLElement;
    position?: HelpPosition;
    animation?: AnimationType;
    duration?: number;
    dismissible?: boolean;
    priority?: DisplayPriority;
    overlay?: boolean; }

export interface ActiveHelp { content: HelpContent,
    options: HelpDisplayOptions;
   , timestamp: Date
    ,}

export interface HelpQueue { content: HelpContent;
    options: HelpDisplayOptions;
    priority: DisplayPriority;
   , id: string }

export interface DisplayElementsConfig { container: HTMLElement;
   , overlay: HTMLElement;
    closeButton?: HTMLButtonElement
    }

export interface ResponsiveBreakpoints { mobile: number;
    tablet: number;
   , desktop: number }

export interface AnimationConfig { duration: number;
   , easing: string;
    delay?: number }

export interface PositionConstraints { minDistance: number;
    maxDistance: number;
    preferredSide: PositionSide;
   , fallbackSides: PositionSide[]
    }

export interface FontSizeMap { small: string;
    medium: string;
    large: string;
   , xl: string }

export interface MediaQueryHandler { query: MediaQueryList;
   , handler: () => void }
}

export interface TabNavigationState { focusableElements: HTMLElement[];
    currentIndex: number;
   , trapped: boolean }

export interface AutoHideTimer { id: number | null;
    duration: number;
   , paused: boolean }

export interface HelpDimensions { width: number;
    height: number;
    maxWidth: number;
   , maxHeight: number }

export interface ViewportConstraints { width: number;
    height: number;
    scrollX: number;
   , scrollY: number }

export interface ElementBounds { top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
   , height: number }

export interface CalculatedPosition { top: number;
    left: number;
    transform?: string;
   , side: PositionSide
    }

export interface AnimationState { inProgress: boolean;
   , type: AnimationType | null;
    startTime?: number;
    duration?: number; }

// 列挙型
export type HelpPosition = 'contextual' | 'fixed' | 'overlay' | 'center';''
export type AnimationType = 'slide' | 'fade' | 'scale' | 'none';''
export type FontSize = 'small' | 'medium' | 'large' | 'xl';''
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';''
export type HelpDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';''
export type EffectivenessLevel = 'low' | 'medium' | 'high' | 'very high';''
export type DisplayPriority = 'low' | 'normal' | 'high' | 'urgent';''
export type PositionSide = 'top' | 'right' | 'bottom' | 'left';

// 定数
export const DEFAULT_DISPLAY_CONFIG: HelpDisplayConfig = {;
    position: 'contextual',
    animation: 'slide';
    duration: 3000;
    dismissible: true;
   , persistent: false,
    maxWidth: 400,
    fontSize: 'medium' ,} as const;
export const RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoints = { mobile: 768,
    tablet: 1024;
   , desktop: 1200 ,} as const;
';

export const FONT_SIZES: FontSizeMap = {;
    small: '12px',
    medium: '14px',
    large: '16px',
    xl: '18px' ,} as const;
';

export const ANIMATION_CONFIGS: Record<AnimationType, AnimationConfig> = { ' }'

    slide: { duration: 300, easing: 'ease-out' ,},''
    fade: { duration: 300, easing: 'ease-out' ,},''
    scale: { duration: 300, easing: 'ease-out' ,},''
    none: { duration: 0, easing: 'linear' ,} as const;

export const POSITION_CONSTRAINTS: PositionConstraints = { minDistance: 10,

    maxDistance: 20,
    preferredSide: 'bottom',
    fallbackSides: ['top', 'right', 'left] } as const;

export const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' as const;

export const HELP_CONTAINER_STYLES = `;
    position: fixed;
    z-index: 10000,
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px,
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    line-height: 1.4,
    display: none;
    pointer-events: auto,
` as const;

export const HELP_OVERLAY_STYLES = `;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
   , background: rgba(0, 0, 0, 0.5);
    z-index: 9999,
    display: none;
    pointer-events: auto,
` as const;

// ユーティリティ関数
export function calculateOptimalPosition(;
    targetRect: DOMRect
    );
    helpDimensions: HelpDimensions);
   , viewport: ViewportConstraints'';
'): CalculatedPosition { const positions = {'
        bottom: {'
            top: targetRect.bottom + POSITION_CONSTRAINTS.minDistance,
            left: targetRect.left,
            side: 'bottom' as PositionSide ,};
        top: { top: targetRect.top - helpDimensions.height - POSITION_CONSTRAINTS.minDistance;
           , left: targetRect.left,
            side: 'top' as PositionSide ,};
        right: { top: targetRect.top;
           , left: targetRect.right + POSITION_CONSTRAINTS.minDistance,
            side: 'right' as PositionSide ,};
        left: { top: targetRect.top;
           , left: targetRect.left - helpDimensions.width - POSITION_CONSTRAINTS.minDistance,
            side: 'left' as PositionSide ,}
    };
    // 優先順位に従ってチェック
    const preferredPosition = positions[POSITION_CONSTRAINTS.preferredSide];
    if(isPositionValid(preferredPosition, helpDimensions, viewport) { return preferredPosition; }

    // フォールバック位置をチェック
    for(const, side of, POSITION_CONSTRAINTS.fallbackSides) {
        const position = positions[side];''
        if(isPositionValid(position, helpDimensions, viewport)) {
    }
            return position;

    // すべて失敗した場合は中央に配置
    return { top: viewport.height / 2,
        left: viewport.width / 2,
        transform: 'translate(-50%, -50%)',' };

        side: 'center' as PositionSide }
    }

export function isPositionValid(;
    position: CalculatedPosition
    );
    dimensions: HelpDimensions);
   , viewport: ViewportConstraints;
    ): boolean { return position.top >= 0 &&
           position.left >= 0 &&;
           position.top + dimensions.height <= viewport.height &&;
           position.left + dimensions.width <= viewport.width, }

export function adjustPositionForViewport(;
    position: CalculatedPosition
    );
    dimensions: HelpDimensions);
   , viewport: ViewportConstraints;
    ): CalculatedPosition {
    const adjusted = { ...position,

    // 右端チェック
    if (adjusted.left + dimensions.width > viewport.width) { adjusted.left = viewport.width - dimensions.width - POSITION_CONSTRAINTS.minDistance; }

    // 左端チェック
    if (adjusted.left < POSITION_CONSTRAINTS.minDistance) { adjusted.left = POSITION_CONSTRAINTS.minDistance; }

    // 下端チェック
    if (adjusted.top + dimensions.height > viewport.height) { adjusted.top = viewport.height - dimensions.height - POSITION_CONSTRAINTS.minDistance; }

    // 上端チェック
    if (adjusted.top < POSITION_CONSTRAINTS.minDistance) { adjusted.top = POSITION_CONSTRAINTS.minDistance; }

    return adjusted;
}

export function generateUniqueId(): string {
    return `help_${Date.now(})_${Math.random(}.toString(36}.substr(2, 9})`;
}

export function debounce<T extends any[]>(;
    func: (...args: T) => void;
    wait: number;
): (...args: T) => void { let timeout: number | null = null,

    return (...args: T): void => { 
        if (timeout !== null) { ,}
            clearTimeout(timeout);
        
        timeout = window.setTimeout(() => {  func(...args);
            timeout = null; }
        }, wait);
    }

export class HelpDisplayController {
    private displayConfig: HelpDisplayConfig;
    private activeHelp: ActiveHelp | null;
    private helpQueue: HelpQueue[];
    private isDisplaying: boolean;
    private animationInProgress: boolean;
    private animationState: AnimationState;
    private helpContainer: HTMLElement;
    private helpOverlay: HTMLElement;
    private autoHideTimer: AutoHideTimer;
    private mediaQueryHandlers: MediaQueryHandler[];
    private tabNavigationState: TabNavigationState;
    private debouncedUpdatePosition: () => void;
    private debouncedHandleResize: () => void;

    constructor() { }
        this.displayConfig = { ...DEFAULT_DISPLAY_CONFIG;
        this.activeHelp = null;
        this.helpQueue = [];
        this.isDisplaying = false;
        this.animationInProgress = false;
        
        this.animationState = { inProgress: false,
            type: null ,};
        this.autoHideTimer = { id: null,
            duration: 0;
           , paused: false ,};
        this.mediaQueryHandlers = [];
        this.tabNavigationState = { focusableElements: [],
            currentIndex: 0;
           , trapped: false ,};
        // デバウンスされたメソッド
        this.debouncedUpdatePosition = debounce(this.updatePosition.bind(this), 100);
        this.debouncedHandleResize = debounce(this.handleResponsiveChange.bind(this), 150);
        ';

        this.initializeDisplayElements();''
        this.setupEventListeners()';
        console.log('[HelpDisplayController] Component, initialized);
    }

    /**
     * 表示要素を初期化
     */
    private initializeDisplayElements(): void { this.createHelpContainer();
        this.createHelpOverlay();
        this.setupResponsiveHandling('); }

    /**
     * ヘルプコンテナを作成'
     */''
    private createHelpContainer()';
        this.helpContainer = document.createElement('div'');''
        this.helpContainer.className = 'contextual-help-container';''
        this.helpContainer.setAttribute('role', 'dialog'');''
        this.helpContainer.setAttribute('aria-label', 'コンテキストヘルプ'');''
        this.helpContainer.setAttribute('aria-live', 'polite);
        
        this.helpContainer.style.cssText = HELP_CONTAINER_STYLES + `;
            max-width: ${this.displayConfig.maxWidth}px;
            font-size: ${this.getFontSize(})
        `;
        
        document.body.appendChild(this.helpContainer);
    }

    /**
     * ヘルプオーバーレイを作成'
     */''
    private createHelpOverlay()';
        this.helpOverlay = document.createElement('div'');''
        this.helpOverlay.className = 'contextual-help-overlay';
        this.helpOverlay.style.cssText = HELP_OVERLAY_STYLES;

        this.helpOverlay.addEventListener('click', () => {  if (this.displayConfig.dismissible) { }
                this.hideHelp(); }
};
        
        document.body.appendChild(this.helpOverlay);
    }

    /**
     * イベントリスナーを設定'
     */''
    private setupEventListeners()';
        document.addEventListener('keydown', (e: KeyboardEvent) => {  ''
            if(this.isDisplaying) {'

                if (e.key === 'Escape' && this.displayConfig.dismissible) {''
                    this.hideHelp();
            }

                if(e.key === 'Tab) {' }

                    this.handleTabNavigation(e); }
}
        };
';
        // リサイズイベント
        window.addEventListener('resize', this.debouncedHandleResize);
';
        // スクロールイベント
        window.addEventListener('scroll', () => {  ''
            if(this.isDisplaying && this.displayConfig.position === 'contextual) { }'
                this.debouncedUpdatePosition(); }
}

    /**
     * レスポンシブ対応を設定
     */
    private setupResponsiveHandling(): void { const mobileQuery = window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINTS.mobile)px}`} }
        const tabletQuery = window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINTS.tablet}px}`});
        
        const mobileHandler: MediaQueryHandler = { query: mobileQuery,
            handler: this.debouncedHandleResize ,};
        const tabletHandler: MediaQueryHandler = { query: tabletQuery,
            handler: this.debouncedHandleResize ,};
        mobileQuery.addListener(mobileHandler.handler);
        tabletQuery.addListener(tabletHandler.handler);
        
        this.mediaQueryHandlers.push(mobileHandler, tabletHandler);
        this.handleResponsiveChange();
    }

    /**
     * レスポンシブ変更を処理
     */
    private handleResponsiveChange(): void { const isMobile = window.innerWidth <= RESPONSIVE_BREAKPOINTS.mobile;
        const isTablet = window.innerWidth <= RESPONSIVE_BREAKPOINTS.tablet;
        
        if(isMobile) {
        ';

            this.displayConfig.maxWidth = Math.min(320, window.innerWidth - 32);

        }

            this.displayConfig.position = 'fixed'; }

        } else if (isTablet) { ''
            this.displayConfig.maxWidth = Math.min(350, window.innerWidth - 48);''
            this.displayConfig.position = 'contextual'; }

        } else {  this.displayConfig.maxWidth = 400;' }'

            this.displayConfig.position = 'contextual'; }
        }
        
        if(this.helpContainer) {
        
            
        
        }
            this.helpContainer.style.maxWidth = `${this.displayConfig.maxWidth}px`;
        }
        
        if (this.isDisplaying) { this.updatePosition(); }
    }

    /**
     * ヘルプを表示
     */
    async showHelp(content: HelpContent, options: HelpDisplayOptions = { ): Promise<void> {
        if(this.animationInProgress) {
            this.addToQueue(content, options);
        }
            return; }
        }

        const helpData: ActiveHelp = { content,
            options,
            timestamp: new Date( ,};

        this.activeHelp = helpData;
        this.isDisplaying = true;
        this.animationInProgress = true;
        this.animationState.inProgress = true;
        this.animationState.type = options.animation || this.displayConfig.animation;

        try { // コンテンツを設定
            this.renderHelpContent(content, options);
            
            // 位置を計算
            this.calculatePosition(options.targetElement);
            
            // 表示アニメーション
            await this.showAnimation();
            
            // 自動非表示タイマー
            if(!this.displayConfig.persistent && this.displayConfig.duration > 0) {
                
            }
                this.setupAutoHide(); }
            }
            
            // フォーカストラップの設定
            this.setupFocusTrap();

        } catch (error) { console.error('[HelpDisplayController] Failed to show help:', error } finally { this.animationInProgress = false;
            this.animationState.inProgress = false;
            this.animationState.type = null; }
    }

    /**
     * ヘルプをキューに追加'
     */''
    private addToQueue(content: HelpContent, options: HelpDisplayOptions): void { const queueItem: HelpQueue = {
            content,
            options,
            priority: options.priority || 'normal';
           , id: generateUniqueId( ,};

        // 優先度順でソート
        this.helpQueue.push(queueItem);
        this.helpQueue.sort((a, b) => {  }
            const priorities = { urgent: 3, high: 2, normal: 1, low: 0 ,}
            return priorities[b.priority] - priorities[a.priority];

    /**
     * ヘルプコンテンツをレンダリング
     */''
    private renderHelpContent(content: HelpContent, options: HelpDisplayOptions): void { ''
        let html = '';
        ';
        // タイトル
        if(content.title) {' }'

            html += `<h3 style="margin: 0 0 12px 0; font-size: 1.2em;, color: #fff;">${this.escapeHtml(content.title})</h3>`;
        }
        ";
        // 説明""
        if (content.description) { " }"
            html += `<p style="margin: 0 0 12px 0;, color: #ccc;">${this.escapeHtml(content.description})</p>`;
        }
        ";
        // ステップ""
        if(content.steps && content.steps.length > 0) {"

            html += '<ol style="margin: 0; padding-left: 20px;">';
        }

            content.steps.forEach(step => { ' }'

                html += `<li, style="margin-bottom: 8px;">)" }"
                    <strong>${this.escapeHtml(step.title"})</strong><br>""
                    <span style="color: #ccc;">${this.escapeHtml(step.description})</span>"
                `;""
                if (step.keyboardAlternative) { " }"
                    html += `<br><small style="color: #aaa;">キーボード: ${this.escapeHtml(step.keyboardAlternative})</small>`;"
                }""
                if(step.tips && step.tips.length > 0) {"

                    html += '<ul style="margin: 4px 0 0 16px;">';

                }

                    step.tips.forEach(tip => {);' }'

                        html += `<li style="color: #aaa; font-size: 0.9em;">${this.escapeHtml(tip"})</li>`;"
                    };""
                    html += '</ul>';

                }''
                html += '</li>';

            };''
            html += '</ol>';
        }
        ';
        // セクション
        if(content.sections && content.sections.length > 0) { content.sections.forEach(section => { ') }'

                html += `<div style="margin-bottom: 12px;">")" }"
                    <h4 style="margin: 0 0 4px 0;, color: #fff;">${this.escapeHtml(section.title"})</h4>""
                    <p style="margin: 0;, color: #ccc;">${this.escapeHtml(section.content})</p>"
                `;""
                if(section.details) {"

                    html += '<dl style="margin: 4px 0; font-size: 0.9em;">';

                }

                    Object.entries(section.details).forEach(([key, value]) => {' }'

                        html += `<dt style="display: inline;, color: #fff;">${this.escapeHtml(key"}):</dt> `;""
                        html += `<dd style="display: inline;, color: #ccc; margin-right: 12px;">${this.escapeHtml(value"})</dd>`;"
                    };""
                    html += '</dl>';

                }''
                if(section.tips && section.tips.length > 0) {'

                    html += '<ul style="margin: 4px 0 0 20px;">';

                }

                    section.tips.forEach(tip => {);' }'

                        html += `<li style="color: #aaa; font-size: 0.9em;">${this.escapeHtml(tip"})</li>`;"
                    };""
                    html += '</ul>';

                }''
                html += '</div>';
            }
';
        // バブル種類
        if(content.bubbleTypes && content.bubbleTypes.length > 0) {'

            html += '<div style="margin-bottom: 12px;">';
        }

            content.bubbleTypes.forEach(bubble => { ' })'
                const warningClass = bubble.warning ? ' style="color: #ffcc00;"' : '';') }

                html += `<div style="margin-bottom: 8px;, padding: 8px; border-left: 3px solid ${bubble.color};">)""
                    <strong${warningClass}>${this.escapeHtml(bubble.name})</strong> (${bubble.points}pt")<br>""
                    <span style="color: #ccc;">${this.escapeHtml(bubble.effect"})</span><br>""
                    <small style="color: #aaa;">${this.escapeHtml(bubble.strategy"})</small>
                </div>`;"
            };""
            html += '</div>';
        }
';
        // 戦略
        if(content.strategies && content.strategies.length > 0) {'

            html += '<div style="margin-bottom: 12px;">';
        }

            content.strategies.forEach(strategy => { ' }'

                html += `<div, style="margin-bottom: 12px;">)" }"
                    <h5 style="margin: 0 0 4px 0;, color: #fff;">${this.escapeHtml(strategy.name"})</h5>""
                    <p style="margin: 0 0 8px 0;, color: #ccc;">${this.escapeHtml(strategy.description"})</p>""
                    <ul style="margin: 0; padding-left: 16px;">"
                `;""
                strategy.techniques.forEach(technique => { ");" }"
                    html += `<li style="color: #aaa; font-size: 0.9em;">${this.escapeHtml(technique"})</li>`;
                };"
                html += `</ul>"";
                    <small style="color: #888;">難易度: ${this.escapeHtml(strategy.difficulty}) | 効果: ${this.escapeHtml(strategy.effectiveness"})</small>
                </div>`;"
            };""
            html += '</div>';
        }
';
        // アクセシビリティ機能
        if(content.features && content.features.length > 0) {'

            html += '<div style="margin-bottom: 12px;">';
        }

            content.features.forEach(feature => { ' }'

                html += `<div, style="margin-bottom: 8px;">)" }"
                    <h5 style="margin: 0 0 4px 0;, color: #fff;">${this.escapeHtml(feature.name"})</h5>""
                    <p style="margin: 0;, color: #ccc;">${this.escapeHtml(feature.description})</p>"
                `;""
                if(feature.shortcuts) {"

                    html += '<dl style="margin: 4px 0; font-size: 0.9em;">';

                }

                    Object.entries(feature.shortcuts).forEach(([key, desc]) => {' }'

                        html += `<dt style="display: inline;, color: #fff; font-family: monospace;">${this.escapeHtml(key"}):</dt> `;""
                        html += `<dd style="display: inline;, color: #ccc; margin-right: 12px;">${this.escapeHtml(desc"})</dd>`;"
                    };""
                    html += '</dl>';

                }''
                if(feature.features && feature.features.length > 0) {'

                    html += '<ul style="margin: 4px 0 0 16px;">';

                }

                    feature.features.forEach(item => {);' }'

                        html += `<li style="color: #aaa; font-size: 0.9em;">${this.escapeHtml(item"})</li>`;"
                    };""
                    html += '</ul>';

                }''
                if(feature.options && feature.options.length > 0) {'

                    html += '<ul style="margin: 4px 0 0 16px;">';

                }

                    feature.options.forEach(option => {);' }'

                        html += `<li style="color: #aaa; font-size: 0.9em;">${this.escapeHtml(option"})</li>`;"
                    };""
                    html += '</ul>';

                }''
                html += '</div>';

            };''
            html += '</div>';
        }
        ';
        // 閉じるボタン
        if(this.displayConfig.dismissible || options.dismissible) {'
            html += `<button '';
                class="help-close-button""";
                style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #ccc; font-size: 18px; cursor: pointer; padding: 4px; width: 32px; height: 32px; border-radius: 4px;, display: flex; align-items: center; justify-content: center;"""
                aria-label="ヘルプを閉じる""";
                type="button";
        }
            >×</button>`; }
        }
        
        this.helpContainer.innerHTML = html;
        ";
        // 閉じるボタンのイベントリスナーを設定""
        const closeButton = this.helpContainer.querySelector('.help-close-button) as HTMLButtonElement;''
        if(closeButton) {', ';

        }

            closeButton.addEventListener('click', () => this.hideHelp(); }
}

    /**
     * HTMLエスケープ'
     */''
    private escapeHtml(text: string): string { ''
        const div = document.createElement('div);
        div.textContent = text;
        return div.innerHTML; }

    /**
     * 位置を計算'
     */''
    private calculatePosition(targetElement?: HTMLElement): void { ''
        if(this.displayConfig.position === 'fixed) {', ';

        }

            this.setFixedPosition() }

        } else if (this.displayConfig.position === 'contextual' && targetElement) { ''
            this.setContextualPosition(targetElement);' }'

        } else if(this.displayConfig.position === 'overlay) { this.setOverlayPosition(); } else { this.setCenterPosition(); }'
    }

    /**
     * 固定位置を設定'
     */''
    private setFixedPosition(''';
            top: '20px',
            right: '20px',
            left: 'auto',
            bottom: 'auto',)';
            transform: 'none');
    }

    /**
     * コンテキスト位置を設定
     */
    private setContextualPosition(targetElement: HTMLElement): void { const targetRect = targetElement.getBoundingClientRect();
        const containerRect = this.helpContainer.getBoundingClientRect();
        
        const helpDimensions: HelpDimensions = {
            width: containerRect.width || this.displayConfig.maxWidth;
            height: containerRect.height || 200;
            maxWidth: this.displayConfig.maxWidth;
           , maxHeight: window.innerHeight * 0.8 };
        const viewport: ViewportConstraints = { width: window.innerWidth,
            height: window.innerHeight;
            scrollX: window.scrollX;
           , scrollY: window.scrollY ,};
        ';

        let position = calculateOptimalPosition(targetRect, helpDimensions, viewport);''
        position = adjustPositionForViewport(position, helpDimensions, viewport);
        
        Object.assign(this.helpContainer.style, {)
            top: `${position.top}px`)'
            left: `${position.left}px`,''
            right: 'auto',
            bottom: 'auto',')';
            transform: position.transform || 'none');
    }

    /**
     * オーバーレイ位置を設定
     */
    private setOverlayPosition(): void { this.setCenterPosition(); }

    /**
     * 中央位置を設定'
     */''
    private setCenterPosition(''';
            top: '50%',
            left: '50%',
            right: 'auto',)';
            bottom: 'auto''),
            transform: 'translate(-50%, -50%)';
        }

    /**
     * 表示アニメーション'
     */''
    private async showAnimation(''';
        this.helpContainer.style.display = 'block';

        ')';
        if(this.displayConfig.position === 'overlay'') {', ';

        }

            this.helpOverlay.style.display = 'block'; }
        }
        
        const animationType = this.animationState.type || this.displayConfig.animation;

        switch(animationType) {'

            case 'slide':'';
                await this.slideInAnimation(''';
            case 'fade':'';
                await, this.fadeInAnimation(''';
            case 'scale':'';
                await, this.scaleInAnimation('';
        }

            default: this.helpContainer.style.opacity = '1'; }
}

    /**
     * スライドイン アニメーション'
     */)'
    private async slideInAnimation();

        this.helpContainer.style.transform += ' translateY(-20px)';''
        this.helpContainer.style.opacity = '0';
        ';

        return new Promise<void>(resolve => {  ' }'

            requestAnimationFrame(() => { }

                this.helpContainer.style.transition = `all ${config.duration}ms ${config.easing}`;''
                this.helpContainer.style.transform = this.helpContainer.style.transform.replace('translateY(-20px)', ''');''
                this.helpContainer.style.opacity = '1';
                setTimeout(resolve, config.duration);
            };
    }

    /**
     * フェードイン アニメーション'
     */''
    private async fadeInAnimation(''';
        this.helpContainer.style.opacity = '0';
        ';

        return, new Promise<void>(resolve => {  ' })'
            requestAnimationFrame(() => { }

                this.helpContainer.style.transition = `opacity ${config.duration}ms ${config.easing}`;''
                this.helpContainer.style.opacity = '1';
                setTimeout(resolve, config.duration);
            };
    }

    /**
     * スケールイン アニメーション'
     */''
    private async scaleInAnimation()';
        this.helpContainer.style.transform += ' scale(0.8)';''
        this.helpContainer.style.opacity = '0';
        ';

        return new Promise<void>(resolve => {  ' }'

            requestAnimationFrame(() => { }

                this.helpContainer.style.transition = `all ${config.duration}ms ${config.easing}`;''
                this.helpContainer.style.transform = this.helpContainer.style.transform.replace('scale(0.8)', ''');''
                this.helpContainer.style.opacity = '1';
                setTimeout(resolve, config.duration);
            };
    }

    /**
     * ヘルプを非表示
     */
    async hideHelp(): Promise<void> { if (!this.isDisplaying || this.animationInProgress) return;
        
        this.animationInProgress = true;
        this.animationState.inProgress = true;
        
        try {
            this.clearAutoHideTimer();
            this.releaseFocusTrap();

            await this.hideAnimation('';

            this.helpContainer.style.display = 'none';''
            this.helpOverlay.style.display = 'none';
            
            this.isDisplaying = false;
            this.activeHelp = null;
            );
            // キューの次のヘルプを表示)
            if(this.helpQueue.length > 0) {
                const next = this.helpQueue.shift()!;
            }
                setTimeout(() => this.showHelp(next.content, next.options), 100);' }'

            } catch (error) { console.error('[HelpDisplayController] Failed to hide help:', error } finally { this.animationInProgress = false;
            this.animationState.inProgress = false; }
    }

    /**
     * 非表示アニメーション'
     */''
    private async hideAnimation(''';
            this.helpContainer.style.transition = 'all 0.2s ease-in';''
            this.helpContainer.style.opacity = '0';)'
            this.helpContainer.style.transform += ' translateY(-10px)';
            setTimeout(resolve, 200);
        }

    /**
     * 自動非表示を設定
     */
    private setupAutoHide(): void { this.clearAutoHideTimer();
        
        this.autoHideTimer = {
            id: window.setTimeout(() => {  }
                this.hideHelp(), }
            }, this.displayConfig.duration),
            duration: this.displayConfig.duration;
           , paused: false;
        },
    }

    /**
     * 自動非表示タイマーをクリア
     */
    private clearAutoHideTimer(): void { if (this.autoHideTimer.id !== null) {
            clearTimeout(this.autoHideTimer.id);
            this.autoHideTimer.id = null; }
    }

    /**
     * フォーカストラップを設定
     */
    private setupFocusTrap(): void { this.updateFocusableElements();
        this.tabNavigationState.trapped = true;
        
        // 最初のフォーカス可能要素にフォーカス
        if(this.tabNavigationState.focusableElements.length > 0) {
            
        }
            this.tabNavigationState.focusableElements[0].focus(); }
}

    /**
     * フォーカストラップを解除
     */
    private releaseFocusTrap(): void { this.tabNavigationState.trapped = false;
        this.tabNavigationState.focusableElements = [];
        this.tabNavigationState.currentIndex = 0; }

    /**
     * フォーカス可能要素を更新
     */
    private updateFocusableElements(): void { const elements = Array.from();
            this.helpContainer.querySelectorAll(FOCUSABLE_SELECTOR) as HTMLElement[];
        ';

        this.tabNavigationState.focusableElements = elements.filter(element => { ')'
            return element.offsetParent !== null && ')'';
                   !element.hasAttribute('disabled) && }'
                   element.tabIndex >= 0; }
        }

    /**
     * 位置を更新
     */
    private updatePosition(): void { if (this.activeHelp? .options.targetElement) {
            this.calculatePosition(this.activeHelp.options.targetElement); }
    }

    /**
     * フォントサイズを取得
     */ : undefined
    private getFontSize(): string { return FONT_SIZES[this.displayConfig.fontSize] || FONT_SIZES.medium; }

    /**
     * Tabナビゲーションを処理
     */
    private handleTabNavigation(event: KeyboardEvent): void { if (!this.tabNavigationState.trapped || this.tabNavigationState.focusableElements.length === 0) {
            return; }
        
        const elements = this.tabNavigationState.focusableElements;
        const currentIndex = elements.indexOf(document.activeElement, as HTMLElement);
        
        if (currentIndex === -1) return;
        
        event.preventDefault();
        
        let nextIndex: number,
        
        if(event.shiftKey) {
        
            // Shift+Tab: 前の要素
        
        }
            nextIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1; }
        } else {  // Tab: 次の要素 }
            nextIndex = currentIndex === elements.length - 1 ? 0 : currentIndex + 1; }
        }
        
        elements[nextIndex].focus();
        this.tabNavigationState.currentIndex = nextIndex;
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<HelpDisplayConfig>): void { Object.assign(this.displayConfig, newConfig);
        
        if (this.helpContainer) { }
            this.helpContainer.style.maxWidth = `${this.displayConfig.maxWidth}px`;
            this.helpContainer.style.fontSize = this.getFontSize();
        }
        
        if (this.isDisplaying) { this.updatePosition(); }
    }

    /**
     * アクティブヘルプを取得
     */
    getActiveHelp(): ActiveHelp | null {
        return this.activeHelp ? { ...this.activeHelp : null;
    }

    /**
     * 表示状態を取得
     */
    isHelpDisplaying(): boolean { return this.isDisplaying; }

    /**
     * キューをクリア
     */
    clearQueue(): void { this.helpQueue = []; }

    /**
     * キューの長さを取得
     */
    getQueueLength(): number { return this.helpQueue.length; }

    /**
     * アニメーション状態を取得
     */
    getAnimationState(): AnimationState {
        return { ...this.animationState;
    }

    /**
     * クリーンアップ
     */
    destroy(): void { this.clearAutoHideTimer();
        this.clearQueue();
        this.releaseFocusTrap();
        
        // メディアクエリハンドラーの削除
        this.mediaQueryHandlers.forEach(({ query, handler ) => { ' }'

            query.removeListener(handler); }
        };
        ';
        // イベントリスナーの削除
        window.removeEventListener('resize', this.debouncedHandleResize);
        
        // DOM要素の削除
        if (this.helpContainer) { this.helpContainer.remove(); }
        
        if(this.helpOverlay) {
        ';

            this.helpOverlay.remove();
        }

        console.log('[HelpDisplayController] Component, destroyed''); }

    }''
}