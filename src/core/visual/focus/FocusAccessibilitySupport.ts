/**
 * FocusAccessibilitySupport
 * 
 * アクセシビリティサポート機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Navigation feedback display
 * - Keyboard hints management
 * - Breadcrumb trail updates
 * - Accessibility announcements
 * 
 * @module FocusAccessibilitySupport
 * Created: Phase G.3 (Issue #103)
 */

// 型定義
export interface MainController {
    config: MainControllerConfig;
    state: MainControllerState;
    elements: MainControllerElements;
    focusStateManager: FocusStateManager;
    accessibilityManager?: AccessibilityManager;
}

export interface MainControllerConfig {
    navigationFeedback: NavigationFeedbackConfig;
    keyboardHints: KeyboardHintsConfig;
    visualCues: VisualCuesConfig;
    announcements: AnnouncementsConfig;
}

export interface NavigationFeedbackConfig {
    enabled: boolean;
    showDirection: boolean;
    showPosition: boolean;
    fadeTimeout: number;
}

export interface KeyboardHintsConfig {
    enabled: boolean;
    autoHide: boolean;
    hideDelay: number;
    detailed: boolean;
}

export interface VisualCuesConfig {
    breadcrumbs: boolean;
}

export interface AnnouncementsConfig {
    enabled: boolean;
}

export interface MainControllerState {
    animationTimers: Map<string, number>;
    keyboardHintVisible: boolean;
    currentFocusElement: HTMLElement | null;
}

export interface MainControllerElements {
    navigationIndicator: HTMLElement;
    keyboardHint: HTMLElement;
    breadcrumbTrail: HTMLElement;
}

export interface FocusStateManager {
    getNavigationDirection(): NavigationDirectionInfo | null;
    getElementPosition(element: HTMLElement, index: number): string | null;
}

export interface AccessibilityManager {
    config: AccessibilityConfig;
}

export interface AccessibilityConfig {
    keyboard: KeyboardAccessibilityConfig;
}

export interface KeyboardAccessibilityConfig {
    navigationMode: NavigationMode;
}

export interface NavigationDirectionInfo {
    icon: string;
    text: string;
}

export interface KeyboardHint {
    key: string;
    description: string;
}

export interface AccessibilityReport {
    totalFocusableElements: number;
    visibleFocusableElements: number;
    keyboardHintsEnabled: boolean;
    navigationFeedbackEnabled: boolean;
    breadcrumbsEnabled: boolean;
    currentFocusPath: string[] | null;
}

export interface AccessibilitySettings {
    announcements?: boolean;
    detailedHints?: boolean;
    breadcrumbs?: boolean;
}

export interface ElementValidationResult {
    isValid: boolean;
    isFocusable: boolean;
    isVisible: boolean;
    accessibility: ElementAccessibilityInfo;
}

export interface ElementAccessibilityInfo {
    hasAriaLabel: boolean;
    hasTitle: boolean;
    hasTextContent: boolean;
    role: string | null;
    tabIndex: number | null;
}

export interface ScreenReaderAnnouncementOptions {
    priority: AnnounceLevel;
    delay?: number;
    clearAfter?: number;
}

// 列挙型
export type NavigationMode = '1d' | '2d' | 'spatial' | 'grid';
export type AnnounceLevel = 'polite' | 'assertive' | 'off';
export type FeedbackType = 'navigation' | 'keyboardHint' | 'breadcrumb';
export type ElementRole = 
    | 'button' | 'input' | 'select' | 'textarea' | 'link' | 'checkbox'
    | 'radio' | 'menuitem' | 'tab' | 'option' | 'generic';

// 定数
export const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
] as const;

export const DEFAULT_NAVIGATION_FEEDBACK_CONFIG: NavigationFeedbackConfig = {
    enabled: true,
    showDirection: true,
    showPosition: true,
    fadeTimeout: 2000
} as const;

export const DEFAULT_KEYBOARD_HINTS_CONFIG: KeyboardHintsConfig = {
    enabled: true,
    autoHide: true,
    hideDelay: 5000,
    detailed: false
} as const;

export const KEYBOARD_HINTS: Record<string, KeyboardHint> = {
    'Tab': { key: 'Tab', description: '次の要素に移動' },
    'Shift+Tab': { key: 'Shift+Tab', description: '前の要素に移動' },
    'Enter': { key: 'Enter', description: '選択・実行' },
    'Space': { key: 'Space', description: '選択・チェック' },
    'Escape': { key: 'Escape', description: 'キャンセル・閉じる' },
    'ArrowKeys': { key: '矢印キー', description: '方向移動' }
} as const;

// ユーティリティ関数
export function isFocusableElement(element: HTMLElement): boolean {
    if (element.hasAttribute('tabindex')) {
        const tabindex = parseInt(element.getAttribute('tabindex') || '0', 10);
        return tabindex >= 0;
    }

    const tagName = element.tagName.toLowerCase();
    const disabledElements = ['button', 'input', 'select', 'textarea'];
    
    if (disabledElements.includes(tagName)) {
        return !element.hasAttribute('disabled');
    }

    return FOCUSABLE_SELECTORS.some(selector => {
        try {
            return element.matches(selector.replace(':not([disabled])', ''));
        } catch {
            return false;
        }
    });
}

export function getElementAccessibilityInfo(element: HTMLElement): ElementAccessibilityInfo {
    return {
        hasAriaLabel: element.hasAttribute('aria-label'),
        hasTitle: element.hasAttribute('title'),
        hasTextContent: (element.textContent?.trim().length || 0) > 0,
        role: element.getAttribute('role'),
        tabIndex: element.hasAttribute('tabindex') ? 
            parseInt(element.getAttribute('tabindex') || '0', 10) : null
    };
}

export function validateAccessibilityElement(element: HTMLElement): ElementValidationResult {
    const isFocusable = isFocusableElement(element);
    const accessibility = getElementAccessibilityInfo(element);
    
    const isVisible = element.offsetParent !== null && 
        getComputedStyle(element).visibility !== 'hidden' &&
        getComputedStyle(element).display !== 'none';

    return {
        isValid: isFocusable && (
            accessibility.hasAriaLabel || 
            accessibility.hasTitle || 
            accessibility.hasTextContent
        ),
        isFocusable,
        isVisible,
        accessibility
    };
}

export class FocusAccessibilitySupport {
    private mainController: MainController;
    private config: MainControllerConfig;
    private state: MainControllerState;
    private elements: MainControllerElements;
    private focusStateManager: FocusStateManager;

    // Accessibility features
    private screenReader: HTMLElement | null = null;
    private keyboardHints: Map<string, HTMLElement> = new Map();

    constructor(mainController: MainController) {
        this.mainController = mainController;
        this.config = mainController.config;
        this.state = mainController.state;
        this.elements = mainController.elements;
        this.focusStateManager = mainController.focusStateManager;

        this.initializeAccessibilityFeatures();
        console.log('FocusAccessibilitySupport initialized');
    }

    /**
     * アクセシビリティ機能の初期化
     */
    private initializeAccessibilityFeatures(): void {
        this.createScreenReaderElement();
        this.initializeKeyboardHints();
        this.setupNavigationFeedback();
    }

    /**
     * スクリーンリーダー用要素の作成
     */
    private createScreenReaderElement(): void {
        this.screenReader = document.createElement('div');
        this.screenReader.setAttribute('aria-live', 'polite');
        this.screenReader.setAttribute('aria-atomic', 'true');
        this.screenReader.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.screenReader);
    }

    /**
     * キーボードヒントの初期化
     */
    private initializeKeyboardHints(): void {
        if (!this.config.keyboardHints.enabled) {
            return;
        }

        Object.entries(KEYBOARD_HINTS).forEach(([key, hint]) => {
            const hintElement = this.createKeyboardHintElement(hint);
            this.keyboardHints.set(key, hintElement);
            this.elements.keyboardHint.appendChild(hintElement);
        });
    }

    /**
     * キーボードヒント要素の作成
     */
    private createKeyboardHintElement(hint: KeyboardHint): HTMLElement {
        const element = document.createElement('div');
        element.className = 'keyboard-hint';
        element.innerHTML = `
            <span class="key">${hint.key}</span>
            <span class="description">${hint.description}</span>
        `;
        element.style.display = 'none';
        return element;
    }

    /**
     * ナビゲーションフィードバックの設定
     */
    private setupNavigationFeedback(): void {
        if (!this.config.navigationFeedback.enabled) {
            return;
        }

        // Navigation indicator styling
        this.elements.navigationIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
    }

    /**
     * ナビゲーションフィードバックの表示
     */
    showNavigationFeedback(element: HTMLElement, index: number): void {
        if (!this.config.navigationFeedback.enabled) {
            return;
        }

        const direction = this.focusStateManager.getNavigationDirection();
        const position = this.focusStateManager.getElementPosition(element, index);

        let feedbackText = '';
        
        if (this.config.navigationFeedback.showDirection && direction) {
            feedbackText += `${direction.icon} ${direction.text}`;
        }
        
        if (this.config.navigationFeedback.showPosition && position) {
            feedbackText += (feedbackText ? ' - ' : '') + position;
        }

        if (feedbackText) {
            this.elements.navigationIndicator.textContent = feedbackText;
            this.elements.navigationIndicator.style.opacity = '1';

            // Auto-hide after timeout
            this.clearAnimationTimer('navigationFeedback');
            const timerId = window.setTimeout(() => {
                this.elements.navigationIndicator.style.opacity = '0';
            }, this.config.navigationFeedback.fadeTimeout);
            
            this.state.animationTimers.set('navigationFeedback', timerId);
        }
    }

    /**
     * キーボードヒントの表示
     */
    showKeyboardHints(): void {
        if (!this.config.keyboardHints.enabled || this.state.keyboardHintVisible) {
            return;
        }

        this.keyboardHints.forEach(element => {
            element.style.display = 'block';
        });

        this.elements.keyboardHint.style.opacity = '1';
        this.state.keyboardHintVisible = true;

        // Auto-hide if enabled
        if (this.config.keyboardHints.autoHide) {
            this.clearAnimationTimer('keyboardHints');
            const timerId = window.setTimeout(() => {
                this.hideKeyboardHints();
            }, this.config.keyboardHints.hideDelay);
            
            this.state.animationTimers.set('keyboardHints', timerId);
        }
    }

    /**
     * キーボードヒントの非表示
     */
    hideKeyboardHints(): void {
        this.keyboardHints.forEach(element => {
            element.style.display = 'none';
        });

        this.elements.keyboardHint.style.opacity = '0';
        this.state.keyboardHintVisible = false;
        this.clearAnimationTimer('keyboardHints');
    }

    /**
     * スクリーンリーダーアナウンス
     */
    announceToScreenReader(message: string, options: ScreenReaderAnnouncementOptions = { priority: 'polite' }): void {
        if (!this.config.announcements.enabled || !this.screenReader) {
            return;
        }

        const announce = () => {
            if (this.screenReader) {
                this.screenReader.setAttribute('aria-live', options.priority);
                this.screenReader.textContent = message;

                if (options.clearAfter) {
                    setTimeout(() => {
                        if (this.screenReader) {
                            this.screenReader.textContent = '';
                        }
                    }, options.clearAfter);
                }
            }
        };

        if (options.delay) {
            setTimeout(announce, options.delay);
        } else {
            announce();
        }
    }

    /**
     * パンくずリストの更新
     */
    updateBreadcrumbTrail(focusPath: HTMLElement[]): void {
        if (!this.config.visualCues.breadcrumbs) {
            return;
        }

        const breadcrumbs = focusPath.map((element, index) => {
            const info = getElementAccessibilityInfo(element);
            let label = '';

            if (info.hasAriaLabel) {
                label = element.getAttribute('aria-label') || '';
            } else if (info.hasTextContent) {
                label = element.textContent?.trim() || '';
            } else if (info.hasTitle) {
                label = element.getAttribute('title') || '';
            } else {
                label = element.tagName.toLowerCase();
            }

            return `<span class="breadcrumb-item">${label}</span>`;
        }).join('<span class="breadcrumb-separator"> → </span>');

        this.elements.breadcrumbTrail.innerHTML = breadcrumbs;
    }

    /**
     * アニメーションタイマーのクリア
     */
    private clearAnimationTimer(name: string): void {
        const timerId = this.state.animationTimers.get(name);
        if (timerId) {
            clearTimeout(timerId);
            this.state.animationTimers.delete(name);
        }
    }

    /**
     * アクセシビリティレポートの生成
     */
    generateAccessibilityReport(): AccessibilityReport {
        const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTORS.join(','));
        const visibleFocusableElements = Array.from(focusableElements).filter(
            element => validateAccessibilityElement(element as HTMLElement).isVisible
        );

        return {
            totalFocusableElements: focusableElements.length,
            visibleFocusableElements: visibleFocusableElements.length,
            keyboardHintsEnabled: this.config.keyboardHints.enabled,
            navigationFeedbackEnabled: this.config.navigationFeedback.enabled,
            breadcrumbsEnabled: this.config.visualCues.breadcrumbs,
            currentFocusPath: this.state.currentFocusElement ? 
                [this.state.currentFocusElement.tagName.toLowerCase()] : null
        };
    }

    /**
     * 設定の更新
     */
    updateSettings(settings: AccessibilitySettings): void {
        if (settings.announcements !== undefined) {
            this.config.announcements.enabled = settings.announcements;
        }

        if (settings.detailedHints !== undefined) {
            this.config.keyboardHints.detailed = settings.detailedHints;
        }

        if (settings.breadcrumbs !== undefined) {
            this.config.visualCues.breadcrumbs = settings.breadcrumbs;
        }

        console.log('Accessibility settings updated:', settings);
    }

    /**
     * リソースの解放
     */
    destroy(): void {
        console.log('Destroying FocusAccessibilitySupport...');

        // Clear all timers
        this.state.animationTimers.forEach(timerId => clearTimeout(timerId));
        this.state.animationTimers.clear();

        // Remove screen reader element
        if (this.screenReader && this.screenReader.parentNode) {
            this.screenReader.parentNode.removeChild(this.screenReader);
        }

        // Clear keyboard hints
        this.keyboardHints.clear();

        console.log('FocusAccessibilitySupport destroyed');
    }
}