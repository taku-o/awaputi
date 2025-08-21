/**
 * FocusStateManager
 * 
 * フォーカス状態管理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Focus state tracking and management
 * - Navigation path updates
 * - System settings detection and application
 * - High contrast mode handling
 * 
 * @module FocusStateManager
 * Created: Phase G.3 (Issue #103)
 */

// 型定義
export interface MainController { accessibilityManager: AccessibilityManager,
    focusManager: FocusManager;
    config: FocusStateConfig;
    cssClasses: CSSClasses;
    state: FocusState;
    focusEffectRenderer: FocusEffectRenderer;
    setupVisualStyles: () => void  }
}

export interface AccessibilityManager { isScreenReaderActive: () => boolean,
    getPreferences: () => AccessibilityPreferences 
    }

export interface FocusManager { focusableElements: HTMLElement[] | null,
    getCurrentFocusIndex: () => number 
    }

export interface FocusStateConfig { focusRing: FocusRingConfig,
    visualCues: VisualCuesConfig;
    highContrast: HighContrastConfig;
    navigation: NavigationConfig;

export interface FocusRingConfig { enabled: boolean,
    color: string;
    width: number;
    style: string;

export interface VisualCuesConfig { landmarkHighlight: boolean,
    groupIndicators: boolean;
    navigationPath: boolean;
    breadcrumbs: boolean;

export interface HighContrastConfig { enabled: boolean,
    color: string;
    autoDetect: boolean;

export interface NavigationConfig { trackPath: boolean,
    maxPathLength: number;
    showDirection: boolean;

export interface CSSClasses { focusVisible: string,
    keyboardMode: string;
    mouseMode: string;
    highContrast: string;
    navigationActive: string;

export interface FocusState { currentFocusElement: HTMLElement | null,
    previousFocusElement: HTMLElement | null;
    keyboardHintVisible: boolean;
    isHighContrastMode: boolean;
    navigationPath: NavigationPathItem[];
    keyboardMode: boolean;
    lastFocusChangeTime: number;

export interface FocusEffectRenderer { positionFocusRing: (element: HTMLElement) => void,
    updateFocusOverlay: (element: HTMLElement) => void;
    highlightLandmarks: (element: HTMLElement) => void;
    updateGroupIndicators: (element: HTMLElement) => void 
    }

export interface NavigationPathItem { element: HTMLElement,
    timestamp: number;
    position: string | null;
    direction?: NavigationDirection;
    elementInfo?: ElementInfo;

export interface NavigationDirection { icon: string,
    text: string;
    angle?: number;
    distance?: number,  }

export interface ElementInfo { tagName: string,
    id?: string;
    className?: string;
    role?: string;
    ariaLabel?: string;
    textContent?: string;

export interface ElementPosition { index: number,
    total: number;
    section?: string;
    group?: string,  }

export interface SystemSettings { highContrast: boolean,
    reducedMotion: boolean;
    forcedColors: boolean;
    screenReader: boolean;

export interface FocusStateReport { currentFocusElement: string | null,
    previousFocusElement: string | null;
    navigationPathLength: number;
    isHighContrastMode: boolean;
    keyboardMode: boolean;
    keyboardHintVisible: boolean;
    lastChangeTime: number;
    systemSettings: SystemSettings;

export interface AccessibilityPreferences { highContrast: boolean,
    reducedMotion: boolean;
    screenReaderActive: boolean;
    keyboardNavigation: boolean;

export interface FocusValidationResult { isValid: boolean,
    reason?: string;
    shouldClear?: boolean;

// 列挙型
export type FocusChangeReason = 'keyboard' | 'mouse' | 'programmatic' | 'system';
export type DirectionType = 'horizontal' | 'vertical' | 'diagonal' | 'unknown';
export type ContainerType = 'section' | 'main' | 'nav' | 'aside' | 'form' | 'fieldset' | 'document';

// 定数
export const NAVIGATION_PATH_LIMITS = { MAX_LENGTH: 10,
    CLEANUP_THRESHOLD: 50,
    MIN_TIME_BETWEEN_ENTRIES: 100  } as const;
export const DIRECTION_THRESHOLD = { MIN_MOVEMENT: 5,
    DIAGONAL_ANGLE: 30  } as const;
';'

export const FOCUS_SELECTORS = [']';
    '[tabindex]', 'button', 'input', 'select', 'textarea', 'a[href]';
];
';'

export const CONTAINER_SELECTORS: Record<ContainerType, string> = {;
    section: 'section',
    main: 'main',
    nav: 'nav',
    aside: 'aside',
    form: 'form',
    fieldset: 'fieldset',
    document: 'body'
            };
';'

export const DIRECTION_ICONS = {;
    UP: '↑',
    DOWN: '↓',
    LEFT: '←',
    RIGHT: '→',
    UP_RIGHT: '↗',
    UP_LEFT: '↖',
    DOWN_RIGHT: '↘',
    DOWN_LEFT: '↙',
    FOCUS: '🎯'
            } as const;
';'

export const MEDIA_QUERIES = {;
    HIGH_CONTRAST: '(prefers-contrast: high')','
    REDUCED_MOTION: '(prefers-reduced-motion: reduce')','
    FORCED_COLORS: '(forced-colors: active')'
            } as const;
// ユーティリティ関数
export function isValidFocusElement(element: any): element is HTMLElement { return element && 
           element.nodeType === Node.ELEMENT_NODE &&,
           document.contains(element) }
';'

export function getElementInfo(element: HTMLElement): ElementInfo { return {,
        tagName: element.tagName.toLowerCase()','
    role: element.getAttribute('role') || undefined,
        ariaLabel: element.getAttribute('aria-label) || undefined };'
        textContent: element.textContent?.trim() || undefined 
    }
 : undefined
export function calculateDirection(fromRect: DOMRect, toRect: DOMRect): NavigationDirection { const dx = toRect.left - fromRect.left,
    const dy = toRect.top - fromRect.top,
    
    // 距離が小さすぎる場合は移動なしとみなす
    const distance = Math.sqrt(dx * dx + dy * dy),
    if (distance < DIRECTION_THRESHOLD.MIN_MOVEMENT) { }'

        return { icon: DIRECTION_ICONS.FOCUS, text: 'フォーカス'
            }
    
    // 角度を計算
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // 主要な8方向に分類
    if (Math.abs(dx) > Math.abs(dy) { // 水平方向が優勢
        if (dx > 0) { }'

            return { icon: DIRECTION_ICONS.RIGHT, text: '右へ移動', angle, distance } else { }'

            return { icon: DIRECTION_ICONS.LEFT, text: '左へ移動', angle, distance }; else {  // 垂直方向が優勢' }'

        if (dy > 0) { }'

            return { icon: DIRECTION_ICONS.DOWN, text: '下へ移動', angle, distance } else { }'

            return { icon: DIRECTION_ICONS.UP, text: '上へ移動', angle, distance };

export function findElementContainer(element: HTMLElement): { type: ContainerType,, element: HTMLElement; | null { let current: HTMLElement | null = element,
    
    while(current && current !== document.body) {
    
        const tagName = current.tagName.toLowerCase() as ContainerType,

        ' }'

        if (Object.keys(CONTAINER_SELECTORS).includes(tagName)) { }
            return { type: tagName, element: current,
        
        current = current.parentElement }

    return { type: 'document', element: document.body  }

export function getElementPosition(element: HTMLElement, focusManager: FocusManager): string | null { // FocusManagerから位置情報を取得
    if (focusManager.focusableElements) {
        const index = focusManager.focusableElements.indexOf(element) }
        if (index !== -1) { }
            return `${index + 1} / ${focusManager.focusableElements.length}`;
    
    // フォールバック：コンテナ内での位置
    const container = findElementContainer(element);
    if (container && container.element !== document.body) {

        const containerElements = container.element.querySelectorAll(FOCUS_SELECTORS.join(', '),
        const elementIndex = Array.from(containerElements).indexOf(element) }
        if (elementIndex !== -1) { }
            return `${elementIndex + 1} / ${containerElements.length}`;
    
    return null;
}

export function detectSystemSettings(): SystemSettings { return { highContrast: window.matchMedia ? window.matchMedia(MEDIA_QUERIES.HIGH_CONTRAST).matches : false,
        reducedMotion: window.matchMedia ? window.matchMedia(MEDIA_QUERIES.REDUCED_MOTION).matches : false,
    forcedColors: window.matchMedia ? window.matchMedia(MEDIA_QUERIES.FORCED_COLORS).matches : false,;
        screenReader: false // 実際の検出は複雑なため、デフォルトはfalse 
    }

export class FocusStateManager {
    private mainController: MainController;
    private accessibilityManager: AccessibilityManager;
    private focusManager: FocusManager;
    private config: FocusStateConfig;
    private cssClasses: CSSClasses;
    private state: FocusState;
    // システム設定の監視
    private, mediaQueryListeners: MediaQueryList[],
    constructor(mainController: MainController) {

        this.mainController = mainController;
        this.accessibilityManager = mainController.accessibilityManager;
        this.focusManager = mainController.focusManager;
        this.config = mainController.config;
        this.cssClasses = mainController.cssClasses;
        this.state = mainController.state;
        
        this.mediaQueryListeners = [];
        
        // システム設定の初期化

    }
        this.initializeSystemSettings(); }
    }

    /**
     * 視覚的フォーカス表示の更新
     */
    updateFocusVisuals(element: HTMLElement, index?: number): void { if (!this.config.focusRing.enabled) return,
        
        // 要素にフォーカスクラスを追加
        element.classList.add(this.cssClasses.focusVisible),
        
        // カスタムフォーカスリングの位置調整
        this.mainController.focusEffectRenderer.positionFocusRing(element),
        
        // フォーカスオーバーレイの更新
        this.mainController.focusEffectRenderer.updateFocusOverlay(element),
        
        // ランドマーク要素のハイライト
        if (this.config.visualCues.landmarkHighlight) {
    
}
            this.mainController.focusEffectRenderer.highlightLandmarks(element); }
        }
        
        // グループインジケータの更新
        if (this.config.visualCues.groupIndicators) { }

            this.mainController.focusEffectRenderer.updateGroupIndicators(element); }
        }
        ';'
        // フォーカス状態の更新
        this.updateFocusState(element, 'programmatic);'
    }

    /**
     * ナビゲーションパスの更新
     */
    updateNavigationPath(element: HTMLElement): void { if (!this.config.navigation.trackPath) return,
        
        const currentTime = Date.now(),
        
        // 短時間での重複エントリを防ぐ
        const lastEntry = this.state.navigationPath[this.state.navigationPath.length - 1],
        if (lastEntry && currentTime - lastEntry.timestamp < NAVIGATION_PATH_LIMITS.MIN_TIME_BETWEEN_ENTRIES) {
    
}
            return; }
        }
        
        // 方向の計算
        let direction: NavigationDirection | undefined,
        if (this.state.previousFocusElement) {
            const prevRect = this.state.previousFocusElement.getBoundingClientRect(),
            const currRect = element.getBoundingClientRect() }
            direction = calculateDirection(prevRect, currRect); }
        }
        
        // パスアイテムの作成
        const pathItem: NavigationPathItem = { element,
            timestamp: currentTime,
    position: this.getElementPosition(element),
            direction,
            elementInfo: getElementInfo(element  };
        
        this.state.navigationPath.push(pathItem);
        
        // パス履歴の制限
        if (this.state.navigationPath.length > this.config.navigation.maxPathLength) { this.state.navigationPath.shift() }
        
        // クリーンアップ（大量蓄積の防止）
        if (this.state.navigationPath.length > NAVIGATION_PATH_LIMITS.CLEANUP_THRESHOLD) { this.state.navigationPath = this.state.navigationPath.slice(-this.config.navigation.maxPathLength) }
    }

    /**
     * 要素位置情報の取得
     */''
    getElementPosition(element: HTMLElement, index?: number): string | null { ''
        if (typeof, index === 'number' && this.focusManager.focusableElements) {
    
}
            const total = this.focusManager.focusableElements.length; }
            return `${index + 1} / ${total}`;
        }
        
        return getElementPosition(element, this.focusManager);
    }

    /**
     * システム設定の初期化
     */
    private initializeSystemSettings(): void { this.detectAndApplySystemSettings(),
        this.setupSystemSettingsListeners() }

    /**
     * システム設定の検出と適用
     */
    detectAndApplySystemSettings(): void { const settings = detectSystemSettings(),
        
        // ハイコントラストモードの適用
        if (settings.highContrast !== this.state.isHighContrastMode) { }

            this.setHighContrastMode(settings.highContrast); }
        }

        console.log('System settings detected:', settings);
    }

    /**
     * システム設定リスナーの設定
     */
    private setupSystemSettingsListeners(): void { if (!window.matchMedia) return,
        ','
        // ハイコントラストモードの監視
        const highContrastQuery = window.matchMedia(MEDIA_QUERIES.HIGH_CONTRAST),
        highContrastQuery.addEventListener('change', (e) => {  }
            this.setHighContrastMode(e.matches); }
        };
        this.mediaQueryListeners.push(highContrastQuery);
        ';'
        // 縮小モーションの監視
        const reducedMotionQuery = window.matchMedia(MEDIA_QUERIES.REDUCED_MOTION);
        reducedMotionQuery.addEventListener('change', (e) => { this.applyMotionPreference(e.matches) };
        this.mediaQueryListeners.push(reducedMotionQuery);
        ';'
        // 強制カラーの監視
        const forcedColorsQuery = window.matchMedia(MEDIA_QUERIES.FORCED_COLORS);
        forcedColorsQuery.addEventListener('change', (e) => { this.applyForcedColors(e.matches) };
        this.mediaQueryListeners.push(forcedColorsQuery);
    }

    /**
     * ハイコントラストモードの設定
     */
    setHighContrastMode(enabled: boolean): void { this.state.isHighContrastMode = enabled,
        this.config.highContrast.enabled = enabled,
        
        if (enabled) {
    
}
            document.body.classList.add(this.cssClasses.highContrast); }
        } else { document.body.classList.remove(this.cssClasses.highContrast) }
        ';'
        // スタイルの再適用
        this.mainController.setupVisualStyles()';'
        console.log(`High, contrast mode ${enabled ? 'enabled' : 'disabled}`});'
    }

    /**
     * フォーカス状態のクリア
     */
    clearFocusState(): void { // フォーカスクラスを削除
        document.querySelectorAll(`.${this.cssClasses.focusVisible)`}.forEach(el => {}
            el.classList.remove(this.cssClasses.focusVisible});
        };
        
        // 状態をリセット
        this.state.currentFocusElement = null;
        this.state.previousFocusElement = null;
        this.state.keyboardHintVisible = false;
        this.state.lastFocusChangeTime = 0;
        
        // ナビゲーションパスをクリア
        if (!this.config.navigation.trackPath) { this.state.navigationPath = [] }
    }

    /**
     * ナビゲーション方向の取得
     */
    getNavigationDirection(): NavigationDirection | null { ''
        if (!this.state.previousFocusElement || !this.state.currentFocusElement) { }'

            return { icon: DIRECTION_ICONS.FOCUS, text: 'フォーカス'
            }
        
        const prevRect = this.state.previousFocusElement.getBoundingClientRect();
        const currRect = this.state.currentFocusElement.getBoundingClientRect();
        
        return calculateDirection(prevRect, currRect);
    }

    /**
     * キーボードモードの状態管理
     */
    setKeyboardMode(enabled: boolean): void { this.state.keyboardMode = enabled,
        
        if (enabled) {
        
            document.body.classList.add(this.cssClasses.keyboardMode) }
            document.body.classList.remove(this.cssClasses.mouseMode); }
        } else {  document.body.classList.remove(this.cssClasses.keyboardMode),
            document.body.classList.add(this.cssClasses.mouseMode) }
            this.clearFocusState(); }
}

    /**
     * フォーカス状態の更新
     */
    private updateFocusState(element: HTMLElement, reason: FocusChangeReason): void { this.state.previousFocusElement = this.state.currentFocusElement,
        this.state.currentFocusElement = element,
        this.state.lastFocusChangeTime = Date.now(),
        
        // ナビゲーションパスの更新
        this.updateNavigationPath(element) }

    /**
     * フォーカス状態の検証
     */
    validateFocusState(): FocusValidationResult { // 現在のフォーカス要素が存在し、DOMに含まれているかチェック
        if(this.state.currentFocusElement && ','
            !isValidFocusElement(this.state.currentFocusElement)) {
            return { isValid: false,''
                reason: 'Current focus element is not valid or not in DOM'
            };
                shouldClear: true;
        
        // 前のフォーカス要素も同様にチェック
        if(this.state.previousFocusElement && );
            !isValidFocusElement(this.state.previousFocusElement) { this.state.previousFocusElement = null }
        
        return { isValid: true,

    /**
     * モーション設定の適用
     */
    private applyMotionPreference(reducedMotion: boolean): void { ''
        if (reducedMotion) {', ' }

            document.body.classList.add('reduced-motion'); }

        } else { }'

            document.body.classList.remove('reduced-motion'); }
        }

        console.log(`Reduced, motion ${reducedMotion ? 'enabled' : 'disabled}`}';
    }

    /**
     * 強制カラーの適用
     */'
    private applyForcedColors(enabled: boolean): void { ''
        if (enabled) {', ' }

            document.body.classList.add('forced-colors'); }

        } else { }'

            document.body.classList.remove('forced-colors'); }
        }

        console.log(`Forced, colors ${enabled ? 'enabled' : 'disabled}`});'
    }

    /**
     * レポート生成
     */
    generateStateReport(): FocusStateReport { const systemSettings = detectSystemSettings(),
        
        return { currentFocusElement: this.state.currentFocusElement?.tagName || null, : undefined
            previousFocusElement: this.state.previousFocusElement?.tagName || null, : undefined
            navigationPathLength: this.state.navigationPath.length,
            isHighContrastMode: this.state.isHighContrastMode,
            keyboardMode: document.body.classList.contains(this.cssClasses.keyboardMode),
            keyboardHintVisible: this.state.keyboardHintVisible,
    lastChangeTime: this.state.lastFocusChangeTime };
            systemSettings }
        }

    /**
     * リソースの解放
     */
    dispose(): void { // フォーカス状態をクリア
        this.clearFocusState(),
        
        // ナビゲーションパスをクリア
        this.state.navigationPath = [],
        
        // メディアクエリリスナーを削除
        this.mediaQueryListeners.forEach(listener => { ')'
            // 実際の削除は各リスナーの実装に依存')' }

            // listener.removeEventListener('change', handler);  }
        };
        this.mediaQueryListeners = [];
        
        // CSSクラスを削除
        document.body.classList.remove(;
            this.cssClasses.keyboardMode);
            this.cssClasses.mouseMode);
            this.cssClasses.highContrast)';'
        ');'

        console.log('FocusStateManager, disposed');

    }'}'