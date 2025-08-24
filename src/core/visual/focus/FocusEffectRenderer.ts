/**
 * FocusEffectRenderer
 * 
 * フォーカス効果描画機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Focus ring positioning and animation
 * - Focus overlay rendering
 * - Landmark element highlighting
 * - Group indicator management
 * 
 * @module FocusEffectRenderer
 * Created: Phase G.3 (Issue #103)
 */

// 型定義
export interface MainController {
    config: VisualFocusConfig;
    state: VisualFocusState;
    elements: VisualFocusElements;
    cssClasses: CSSClasses;
}

export interface VisualFocusConfig {
    focusRing: FocusRingConfig;
    navigationFeedback: NavigationFeedbackConfig;
    highContrast: HighContrastConfig;
    animations: AnimationConfig;
}

export interface FocusRingConfig {
    color: string;
    width: number;
    offset: number;
    borderRadius: number;
    animationDuration: number;
    enabled: boolean;
}

export interface NavigationFeedbackConfig {
    fadeTimeout: number;
    enabled: boolean;
}

export interface HighContrastConfig {
    color: string;
    width: number;
    enabled: boolean;
}

export interface AnimationConfig {
    enabled: boolean;
    duration: number;
    easing: string;
    reducedMotion: boolean;
}

export interface VisualFocusState {
    animationTimers: Map<string, number>;
    currentFocusElement: HTMLElement | null;
    isHighContrastMode: boolean;
    keyboardMode: boolean;
}

export interface VisualFocusElements {
    focusRing: HTMLElement;
    focusOverlay: HTMLElement;
}

export interface CSSClasses {
    keyboardMode: string;
    mouseMode: string;
    highContrast: string;
    focusRing: string;
    focusOverlay: string;
}

export interface ElementBounds {
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
}

export interface ViewportBounds {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

export interface EffectOptions {
    duration?: number;
    delay?: number;
    easing?: string;
    autoRemove?: boolean;
}

export interface CustomEffectStyle {
    position: string;
    left: string;
    top: string;
    width: string;
    height: string;
    pointerEvents: string;
    zIndex: string;
}

export interface RenderingOptimizationResult {
    shouldRender: boolean;
    reason?: string;
    elementBounds?: ElementBounds;
    viewportBounds?: ViewportBounds;
}

// 列挙型
export type EffectType = 'pulse' | 'glow' | 'ripple' | 'flash' | 'slide' | 'zoom';
export type LandmarkType = 'main' | 'nav' | 'aside' | 'header' | 'footer' | 'section' | 'article';
export type GroupType = 'form' | 'fieldset' | 'section' | 'nav' | 'aside' | 'group' | 'radiogroup';
export type TimerType = 'focusRing' | 'overlay' | 'fadeOut' | 'customEffect';

// 定数
export const LANDMARK_SELECTORS: string[] = [
    'main', 'nav', 'aside', 'header', 'footer', 'section', 'article'
];

export const GROUP_SELECTORS: string[] = [
    'form', 'fieldset', 'section', 'nav', 'aside'
];

export const GROUP_ROLES: string[] = ['group', 'radiogroup'];

export const EFFECT_DURATIONS: Record<EffectType, number> = {
    pulse: 1000,
    glow: 1500,
    ripple: 800,
    flash: 500,
    slide: 600,
    zoom: 400
};

export const DEFAULT_FOCUS_RING_CONFIG: FocusRingConfig = {
    color: '#4A90E2',
    width: 2,
    offset: 2,
    borderRadius: 4,
    animationDuration: 150,
    enabled: true
} as const;

export const HIGH_CONTRAST_COLORS = {
    DEFAULT: '#FFFF00',
    ALT: '#00FFFF',
    ERROR: '#FF0000',
    SUCCESS: '#00FF00'
} as const;

// ユーティリティ関数
export function getElementBounds(element: HTMLElement): ElementBounds {
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    return {
        left: rect.left + scrollX,
        top: rect.top + scrollY,
        width: rect.width,
        height: rect.height,
        right: rect.right + scrollX,
        bottom: rect.bottom + scrollY
    };
}

export function getViewportBounds(): ViewportBounds {
    return {
        top: window.pageYOffset,
        left: window.pageXOffset,
        bottom: window.pageYOffset + window.innerHeight,
        right: window.pageXOffset + window.innerWidth
    };
}

export function isElementInViewport(elementBounds: ElementBounds, viewportBounds: ViewportBounds): boolean {
    return !(elementBounds.right < viewportBounds.left ||
             elementBounds.left > viewportBounds.right ||
             elementBounds.bottom < viewportBounds.top ||
             elementBounds.top > viewportBounds.bottom);
}

export function optimizeRendering(element: HTMLElement): RenderingOptimizationResult {
    const elementBounds = getElementBounds(element);
    const viewportBounds = getViewportBounds();

    // Check if element is in viewport
    if (!isElementInViewport(elementBounds, viewportBounds)) {
        return {
            shouldRender: false,
            reason: 'Element is outside viewport',
            elementBounds,
            viewportBounds
        };
    }

    // Check if element is visible
    const computedStyle = getComputedStyle(element);
    if (computedStyle.visibility === 'hidden' || computedStyle.display === 'none') {
        return {
            shouldRender: false,
            reason: 'Element is not visible',
            elementBounds,
            viewportBounds
        };
    }

    return {
        shouldRender: true,
        elementBounds,
        viewportBounds
    };
}

export function isLandmarkElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return LANDMARK_SELECTORS.includes(tagName) || 
           (role && LANDMARK_SELECTORS.includes(role));
}

export function isGroupElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return GROUP_SELECTORS.includes(tagName) || 
           (role && GROUP_ROLES.includes(role));
}

export class FocusEffectRenderer {
    private mainController: MainController;
    private config: VisualFocusConfig;
    private state: VisualFocusState;
    private elements: VisualFocusElements;
    private cssClasses: CSSClasses;

    // Style cache for performance
    private styleCache: Map<string, CustomEffectStyle> = new Map();

    constructor(mainController: MainController) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.state = mainController.state;
        this.elements = mainController.elements;
        this.cssClasses = mainController.cssClasses;

        this.initializeRenderer();
        console.log('FocusEffectRenderer initialized');
    }

    /**
     * レンダラーの初期化
     */
    private initializeRenderer(): void {
        this.setupFocusRing();
        this.setupFocusOverlay();
        this.bindEvents();
    }

    /**
     * フォーカスリングの設定
     */
    private setupFocusRing(): void {
        if (!this.config.focusRing.enabled) {
            return;
        }

        this.elements.focusRing.style.cssText = `
            position: absolute;
            pointer-events: none;
            border: ${this.config.focusRing.width}px solid ${this.config.focusRing.color};
            border-radius: ${this.config.focusRing.borderRadius}px;
            transition: all ${this.config.focusRing.animationDuration}ms ease;
            opacity: 0;
            z-index: 9999;
        `;

        this.elements.focusRing.className = this.cssClasses.focusRing;
    }

    /**
     * フォーカスオーバーレイの設定
     */
    private setupFocusOverlay(): void {
        this.elements.focusOverlay.style.cssText = `
            position: absolute;
            pointer-events: none;
            background: rgba(74, 144, 226, 0.1);
            border-radius: 4px;
            opacity: 0;
            transition: opacity 200ms ease;
            z-index: 9998;
        `;

        this.elements.focusOverlay.className = this.cssClasses.focusOverlay;
    }

    /**
     * イベントのバインド
     */
    private bindEvents(): void {
        // High contrast mode detection
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-contrast: high)');
            mediaQuery.addListener(() => {
                this.state.isHighContrastMode = mediaQuery.matches;
                this.updateHighContrastMode();
            });
            this.state.isHighContrastMode = mediaQuery.matches;
        }

        // Reduced motion detection
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addListener(() => {
                this.config.animations.reducedMotion = mediaQuery.matches;
                this.updateAnimationSettings();
            });
            this.config.animations.reducedMotion = mediaQuery.matches;
        }
    }

    /**
     * フォーカスリングの位置付け
     */
    positionFocusRing(element: HTMLElement): void {
        if (!this.config.focusRing.enabled) {
            return;
        }

        const optimization = optimizeRendering(element);
        if (!optimization.shouldRender) {
            this.hideFocusRing();
            return;
        }

        const bounds = optimization.elementBounds!;
        const offset = this.config.focusRing.offset;

        this.elements.focusRing.style.left = `${bounds.left - offset}px`;
        this.elements.focusRing.style.top = `${bounds.top - offset}px`;
        this.elements.focusRing.style.width = `${bounds.width + (offset * 2)}px`;
        this.elements.focusRing.style.height = `${bounds.height + (offset * 2)}px`;
        this.elements.focusRing.style.opacity = '1';

        // Update state
        this.state.currentFocusElement = element;

        // Handle landmark elements
        if (isLandmarkElement(element)) {
            this.highlightLandmark(element);
        }

        // Handle group elements
        if (isGroupElement(element)) {
            this.showGroupIndicator(element);
        }
    }

    /**
     * フォーカスリングの非表示
     */
    hideFocusRing(): void {
        this.elements.focusRing.style.opacity = '0';
        this.hideFocusOverlay();
        this.hideGroupIndicator();
        this.state.currentFocusElement = null;
    }

    /**
     * フォーカスオーバーレイの表示
     */
    showFocusOverlay(element: HTMLElement): void {
        const optimization = optimizeRendering(element);
        if (!optimization.shouldRender) {
            return;
        }

        const bounds = optimization.elementBounds!;

        this.elements.focusOverlay.style.left = `${bounds.left}px`;
        this.elements.focusOverlay.style.top = `${bounds.top}px`;
        this.elements.focusOverlay.style.width = `${bounds.width}px`;
        this.elements.focusOverlay.style.height = `${bounds.height}px`;
        this.elements.focusOverlay.style.opacity = '1';
    }

    /**
     * フォーカスオーバーレイの非表示
     */
    hideFocusOverlay(): void {
        this.elements.focusOverlay.style.opacity = '0';
    }

    /**
     * ランドマーク要素のハイライト
     */
    private highlightLandmark(element: HTMLElement): void {
        element.classList.add('landmark-highlighted');
        
        // Auto-remove after delay
        this.clearTimer('landmarkHighlight');
        const timerId = window.setTimeout(() => {
            element.classList.remove('landmark-highlighted');
        }, 3000);
        
        this.state.animationTimers.set('landmarkHighlight', timerId);
    }

    /**
     * グループインジケータの表示
     */
    private showGroupIndicator(element: HTMLElement): void {
        element.classList.add('group-focused');
        this.showFocusOverlay(element);
    }

    /**
     * グループインジケータの非表示
     */
    private hideGroupIndicator(): void {
        if (this.state.currentFocusElement) {
            this.state.currentFocusElement.classList.remove('group-focused');
        }
    }

    /**
     * カスタムエフェクトの作成
     */
    createCustomEffect(element: HTMLElement, effectType: EffectType, options: EffectOptions = {}): void {
        if (!this.config.animations.enabled || this.config.animations.reducedMotion) {
            return;
        }

        const optimization = optimizeRendering(element);
        if (!optimization.shouldRender) {
            return;
        }

        const bounds = optimization.elementBounds!;
        const duration = options.duration || EFFECT_DURATIONS[effectType];
        const delay = options.delay || 0;
        const easing = options.easing || this.config.animations.easing;

        // Create effect element
        const effectElement = document.createElement('div');
        effectElement.className = `custom-effect custom-effect-${effectType}`;

        const style = this.getEffectStyle(bounds, effectType);
        Object.assign(effectElement.style, style);

        // Add animation
        effectElement.style.animation = `${effectType} ${duration}ms ${easing} ${delay}ms`;

        document.body.appendChild(effectElement);

        // Clean up after animation
        const cleanup = () => {
            if (effectElement.parentNode) {
                effectElement.parentNode.removeChild(effectElement);
            }
        };

        if (options.autoRemove !== false) {
            setTimeout(cleanup, duration + delay + 100);
        }
    }

    /**
     * エフェクトスタイルの取得
     */
    private getEffectStyle(bounds: ElementBounds, effectType: EffectType): CustomEffectStyle {
        const cacheKey = `${effectType}-${bounds.left}-${bounds.top}-${bounds.width}-${bounds.height}`;
        
        if (this.styleCache.has(cacheKey)) {
            return this.styleCache.get(cacheKey)!;
        }

        const style: CustomEffectStyle = {
            position: 'absolute',
            left: `${bounds.left}px`,
            top: `${bounds.top}px`,
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            pointerEvents: 'none',
            zIndex: '9997'
        };

        this.styleCache.set(cacheKey, style);
        return style;
    }

    /**
     * ハイコントラストモードの更新
     */
    private updateHighContrastMode(): void {
        if (this.state.isHighContrastMode && this.config.highContrast.enabled) {
            this.elements.focusRing.style.borderColor = this.config.highContrast.color;
            this.elements.focusRing.style.borderWidth = `${this.config.highContrast.width}px`;
            document.body.classList.add(this.cssClasses.highContrast);
        } else {
            this.elements.focusRing.style.borderColor = this.config.focusRing.color;
            this.elements.focusRing.style.borderWidth = `${this.config.focusRing.width}px`;
            document.body.classList.remove(this.cssClasses.highContrast);
        }
    }

    /**
     * アニメーション設定の更新
     */
    private updateAnimationSettings(): void {
        if (this.config.animations.reducedMotion) {
            this.elements.focusRing.style.transition = 'none';
            this.elements.focusOverlay.style.transition = 'none';
        } else {
            this.elements.focusRing.style.transition = `all ${this.config.focusRing.animationDuration}ms ease`;
            this.elements.focusOverlay.style.transition = 'opacity 200ms ease';
        }
    }

    /**
     * タイマーのクリア
     */
    private clearTimer(name: string): void {
        const timerId = this.state.animationTimers.get(name);
        if (timerId) {
            clearTimeout(timerId);
            this.state.animationTimers.delete(name);
        }
    }

    /**
     * スタイルキャッシュのクリア
     */
    clearStyleCache(): void {
        this.styleCache.clear();
        console.log('Style cache cleared');
    }

    /**
     * レンダリング統計の取得
     */
    getRenderingStats() {
        return {
            cacheSize: this.styleCache.size,
            activeTimers: this.state.animationTimers.size,
            currentElement: this.state.currentFocusElement?.tagName || null,
            highContrastMode: this.state.isHighContrastMode,
            keyboardMode: this.state.keyboardMode
        };
    }

    /**
     * リソースの解放
     */
    destroy(): void {
        console.log('Destroying FocusEffectRenderer...');

        // Clear all timers
        this.state.animationTimers.forEach(timerId => clearTimeout(timerId));
        this.state.animationTimers.clear();

        // Clear style cache
        this.clearStyleCache();

        // Hide effects
        this.hideFocusRing();
        this.hideFocusOverlay();

        console.log('FocusEffectRenderer destroyed');
    }
}