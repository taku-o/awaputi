/**
 * FocusNavigation
 * タブオーダー管理、フォーカス移動ロジック、キーボードナビゲーション、フォーカス履歴追跡を担当
 */

// 型定義
export interface FocusManager { gameEngine: GameEngine;
    emit: (event: string, data: any) => void  }
}

export interface GameEngine { // GameEngineインターフェースの基本定義
    [key: string]: any;

export interface Navigation2DConfig { enabled: boolean;
    grid: NavigationGrid | null;
    currentPosition: GridPosition;

export interface NavigationGrid { rows: number;
    columns: number;
    elements: HTMLElement[][];

export interface GridPosition { x: number;
    y: number;

export interface KeyboardNavigationConfig { enabled: boolean;
    wrapAround: boolean;
    arrowKeysEnabled: boolean;
    homeEndEnabled: boolean;

export interface FocusableElementsUpdateEvent { count: number;
    previousCount: number;

export interface NavigationStats { focusableElementsCount: number;
    currentFocusIndex: number;
    focusHistoryLength: number;
    navigation2DEnabled: boolean;
    keyboardNavigationEnabled: boolean;
    wrapAroundEnabled: boolean;

export interface ElementRect { left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;

export interface Point2D { x: number;
    y: number;

export interface NavigationScoreCalculation { distance: number;
    alignment: number;
    totalScore: number;
    isValidDirection: boolean;

export interface ViewportInfo { height: number;
    scrollTop: number;
    visibleTop: number;
    visibleBottom: number;

export interface FocusValidationResult { isValid: boolean;
    reason?: string;
    element?: HTMLElement;

export interface NavigationContext { currentElement: HTMLElement | null;
    targetElement: HTMLElement | null;
    direction: NavigationDirection;
    method: NavigationMethod;

// 列挙型
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward';
export type NavigationMethod = 'tab' | 'arrow' | 'page' | 'home_end' | 'programmatic';

export type FocusableElementType = ';'
    | 'anchor' | 'button' | 'input' | 'select' | 'textarea', ';'
    | 'contenteditable' | 'audio' | 'video' | 'summary' | 'iframe' | 'custom';

// 定数
export const FOCUSABLE_SELECTORS = [']';
    'a[href]',
    'button: not([disabled])';
    'input:not([disabled]):not([type="hidden"]",'
    'select: not([disabled])';
    'textarea: not([disabled])';
    '[tabindex]:not([tabindex="-1"]",'
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'summary',
    'iframe:not([tabindex="-1"]";'
] as const;

export const, DEFAULT_KEYBOARD_CONFIG: KeyboardNavigationConfig = { enabled: true;
    wrapAround: true;
    arrowKeysEnabled: true;
    homeEndEnabled: true;
export const DEFAULT_2D_CONFIG: Navigation2DConfig = { enabled: false;
    grid: null;
    currentPosition: { x: 0, y: 0  };
';'

export const NAVIGATION_KEYS = {;
    TAB: 'Tab';
    ARROW_UP: 'ArrowUp';
    ARROW_DOWN: 'ArrowDown';
    ARROW_LEFT: 'ArrowLeft';
    ARROW_RIGHT: 'ArrowRight';
    HOME: 'Home';
    END: 'End';
    PAGE_UP: 'PageUp';
    PAGE_DOWN: 'PageDown'
            } as const;
export const ALIGNMENT_WEIGHT = 100;
export const DEFAULT_MAX_HISTORY_SIZE = 10;
';'
// ユーティリティ関数
export function isValidHTMLElement(element: any): element is HTMLElement { return element &&;
           element.nodeType === Node.ELEMENT_NODE && ','
           typeof element.focus === 'function' }
}

export function hasTabIndex(element: HTMLElement): boolean {;
    const tabIndex = element.getAttribute('tabindex');
    return tabIndex !== null && tabIndex !== '-1' }

export function getTabIndexValue(element: HTMLElement): number {;
    const tabIndex = element.getAttribute('tabindex),'
    return tabIndex ? parseInt(tabIndex, 10) : 0 }

export function isElementInViewport(element: HTMLElement, viewport?: ViewportInfo): boolean { const rect = element.getBoundingClientRect();
    const vp = viewport || {
        height: window.innerHeight;
        scrollTop: window.pageYOffset;
        visibleTop: 0;
    visibleBottom: window.innerHeight };
    return rect.bottom >= vp.visibleTop && rect.top <= vp.visibleBottom;
}

export function calculateElementCenter(rect: DOMRect): Point2D { return { x: rect.left + rect.width / 2 };
        y: rect.top + rect.height / 2 
    }

export function calculateDistance(point1: Point2D, point2: Point2D): number { const dx = point2.x - point1.x;
    const dy = point2.y - point1.y,
    return Math.sqrt(dx * dx + dy * dy) }

export function isDirectionValid(from: Point2D, to: Point2D, direction: NavigationDirection): boolean { const dx = to.x - from.x;
    const dy = to.y - from.y,

    switch(direction) {

        case 'up': return dy < 0,
        case 'down': return dy > 0,
        case 'left': return dx < 0,
        case 'right': return dx > 0 }
        default: return true;
';'

export function getFocusableElementType(element: HTMLElement): FocusableElementType {;
    const tagName = element.tagName.toLowerCase()','
    if(tagName === 'a' && element.hasAttribute('href)' return 'anchor',
    if (tagName === 'button') return 'button',
    if (tagName === 'input') return 'input',
    if (tagName === 'select') return 'select',
    if (tagName === 'textarea') return 'textarea',
    if (element.contentEditable === 'true') return 'contenteditable',
    if(tagName === 'audio' && element.hasAttribute('controls)' return 'audio',
    if(tagName === 'video' && element.hasAttribute('controls)' return 'video',
    if (tagName === 'summary') return 'summary',
    if (tagName === 'iframe') return 'iframe',

    return 'custom' }

export class FocusNavigation {
    private focusManager: FocusManager;
    private gameEngine: GameEngine;
    // フォーカス可能要素とナビゲーション状態
    private focusableElements: HTMLElement[] = [];
    private currentFocusIndex: number = -1;
    private focusHistory: HTMLElement[] = [];
    private readonly, maxHistorySize: number = DEFAULT_MAX_HISTORY_SIZE;
    
    // 2Dナビゲーション設定
    private navigation2D: Navigation2DConfig;
    // キーボードナビゲーション設定
    private, keyboardNavigation: KeyboardNavigationConfig;

    constructor(focusManager: FocusManager) {
        this.focusManager = focusManager;
        this.gameEngine = focusManager.gameEngine
}
        // 設定の初期化 }
        this.navigation2D = { ...DEFAULT_2D_CONFIG;
        this.keyboardNavigation = { ...DEFAULT_KEYBOARD_CONFIG;

        console.log('[FocusNavigation] Component, initialized') }
    
    /**
     * フォーカス可能要素を更新'
     */''
    updateFocusableElements(container: Document | HTMLElement = document): void { try {
            const previousCount = this.focusableElements.length,
            ','
            // 要素を取得してフィルタリング
            const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS.join(', ')),
                .filter((element): element is HTMLElement => isValidHTMLElement(element);
                .filter(element => this.isElementFocusable(element);
                .filter(element => this.isElementVisible(element);
            // タブオーダーでソート
            this.focusableElements = this.sortElementsByTabOrder(elements);
            
            // 現在のフォーカスインデックスを更新
            this.updateCurrentFocusIndex();
            ' }'

            console.log(`[FocusNavigation] Updated, focusable elements: ${previousCount} -> ${ this.focusableElements.length)`),
            ','
            // 変更をFocusManagerに通知
            this.focusManager.emit('focusableElementsUpdated', {}
                count: this.focusableElements.length } }
                previousCount) as FocusableElementsUpdateEvent};

        } catch (error) { console.error('[FocusNavigation] Error updating focusable elements:', error }
    }
    
    /**
     * 要素がフォーカス可能かチェック
     */
    isElementFocusable(element: HTMLElement): boolean { if (!element || (element, as any).disabled) return false,
        ','
        // hidden属性のチェック
        if ((element, as any).hidden) return false,
        ','
        // aria-hiddenのチェック
        if (element.getAttribute('aria-hidden') === 'true') return false,
        ','
        // tabindexが-1の場合はプログラム的にのみフォーカス可能
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex === '-1') return false,
        ','
        // contenteditable要素のチェック
        if (element.contentEditable === 'true') return true,
        ','
        // フォーム要素のチェック
        if(element.matches('input, select, textarea, button' {'
            const formElement = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement }

            return !formElement.disabled && (element, as HTMLInputElement').type !== 'hidden';'
        ';'
        // リンクのチェック
        if(element.matches('a' {'
            const linkElement = element as HTMLAnchorElement }

            return !!(linkElement.href && linkElement.href.length > 0');'
        ';'
        // その他のインタラクティブ要素
        if(element.matches('audio[controls], video[controls], summary, iframe' { return true }'
        
        // tabindex属性があるかチェック
        return hasTabIndex(element);
    }
    
    /**
     * 要素が表示されているかチェック
     */
    isElementVisible(element: HTMLElement): boolean { if (!element) return false,
        
        try {
            // display: noneやvisibility: hiddenのチェック
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') {
    
}
                return false;
            ';'
            // 親要素も含めて透明度をチェック
            if(style.opacity === '0) return false;'
            
            // 要素のサイズをチェック
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;
            ';'

            return true;} catch (error) {
            console.warn('[FocusNavigation] Error checking element visibility:', error);
            return false,
    
    /**
     * 要素をタブオーダーでソート
     */
    private sortElementsByTabOrder(elements: HTMLElement[]): HTMLElement[] { return elements.sort((a, b) => { 
            const aTabIndex = getTabIndexValue(a);
            const bTabIndex = getTabIndexValue(b);
            // tabindex > 0 の要素が最初
            if (aTabIndex > 0 && bTabIndex > 0) { }
                return aTabIndex - bTabIndex; else if (aTabIndex > 0) { return -1 } else if (bTabIndex > 0) { return 1 }
            
            // tabindex = 0 の要素はDOM順序
            const position = a.compareDocumentPosition(b);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) { return -1 } else if (position & Node.DOCUMENT_POSITION_PRECEDING) { return 1 }
            
            return 0;
        };
    }
    
    /**
     * 現在のフォーカスインデックスを更新
     */
    private updateCurrentFocusIndex(): void { const activeElement = document.activeElement as HTMLElement,
        if (activeElement) {
    
}
            this.currentFocusIndex = this.focusableElements.indexOf(activeElement); }
        } else { this.currentFocusIndex = -1 }
    }
    
    /**
     * 次のフォーカス可能要素に移動
     */
    moveToNext(reverse: boolean = false): HTMLElement | null { if (this.focusableElements.length === 0) return null,
        
        try {
            let newIndex: number,
            
            if (this.currentFocusIndex === -1) {
            
                // フォーカスがない場合は最初または最後の要素
            
            }
                newIndex = reverse ? this.focusableElements.length - 1 : 0; 
    } else {  // 次または前の要素を計算
                if (reverse) {
                    newIndex = this.currentFocusIndex - 1,
                    if (newIndex < 0) {
                }
                        newIndex = this.keyboardNavigation.wrapAround ? undefined : undefined 
                                  this.focusableElements.length - 1 : 0; 
    } else {  newIndex = this.currentFocusIndex + 1,
                    if (newIndex >= this.focusableElements.length) {
    
}
                        newIndex = this.keyboardNavigation.wrapAround ? 0 : this.focusableElements.length - 1; 
    }
            }
            
            const targetElement = this.focusableElements[newIndex];
            if (targetElement) {
                this.setFocus(targetElement) }
                return targetElement; }'

            } catch (error) { console.error('[FocusNavigation] Error moving to next element:', error }
        
        return null;
    }
    
    /**
     * 前のフォーカス可能要素に移動
     */
    moveToPrevious(): HTMLElement | null { return this.moveToNext(true) }
    
    /**
     * 最初のフォーカス可能要素に移動
     */
    moveToFirst(): HTMLElement | null { if (this.focusableElements.length === 0) return null,
        
        const firstElement = this.focusableElements[0],
        this.setFocus(firstElement);
        return firstElement }
    
    /**
     * 最後のフォーカス可能要素に移動
     */
    moveToLast(): HTMLElement | null { if (this.focusableElements.length === 0) return null,
        
        const lastElement = this.focusableElements[this.focusableElements.length - 1],
        this.setFocus(lastElement);
        return lastElement }
    
    /**
     * 指定された要素にフォーカスを設定
     */
    setFocus(element: HTMLElement): void { if(!element || !this.isElementFocusable(element) return,
        
        try {
            // フォーカス履歴に追加
            this.addToFocusHistory(element);
            // フォーカスを設定
            element.focus();
            // インデックスを更新
            this.currentFocusIndex = this.focusableElements.indexOf(element);
            
            console.log(`[FocusNavigation] Focus set to element:`, element.tagName, element.id || element.className);
            ' }'

        } catch (error) { console.error('[FocusNavigation] Error setting focus:', error }
    }
    
    /**
     * フォーカス履歴に要素を追加
     */
    private addToFocusHistory(element: HTMLElement): void { if (!element) return,
        
        // 既存の履歴から削除
        const existingIndex = this.focusHistory.indexOf(element);
        if (existingIndex !== -1) {
    
}
            this.focusHistory.splice(existingIndex, 1); }
        }
        
        // 最新として先頭に追加
        this.focusHistory.unshift(element);
        
        // 履歴サイズを制限
        if (this.focusHistory.length > this.maxHistorySize) { this.focusHistory = this.focusHistory.slice(0; this.maxHistorySize) }
    }
    
    /**
     * キーボードナビゲーションを処理
     */
    handleKeyboardNavigation(event: KeyboardEvent): boolean { if (!this.keyboardNavigation.enabled) return false }
        const { key, shiftKey, ctrlKey, altKey, metaKey } = event;
        
        // 修飾キーが押されている場合はスキップ（Shiftは例外）
        if (ctrlKey || altKey || metaKey) return false;
        
        try { switch (key) {
                case NAVIGATION_KEYS.TAB: return this.handleTabNavigation(event);
                case NAVIGATION_KEYS.ARROW_UP:,
                case NAVIGATION_KEYS.ARROW_DOWN:,
                case NAVIGATION_KEYS.ARROW_LEFT:,
                case NAVIGATION_KEYS.ARROW_RIGHT: return this.handleArrowNavigation(event);
                case NAVIGATION_KEYS.HOME:,
                    if (this.keyboardNavigation.homeEndEnabled) {
                        event.preventDefault();
                        this.moveToFirst() }
                        return true;
                    break;
                    
                case NAVIGATION_KEYS.END:;
                    if (this.keyboardNavigation.homeEndEnabled) {
                        event.preventDefault();
                        this.moveToLast() }
                        return true;
                    break;
                    
                case NAVIGATION_KEYS.PAGE_UP:;
                case NAVIGATION_KEYS.PAGE_DOWN: return this.handlePageNavigation(event } catch (error) { console.error('[FocusNavigation] Error handling keyboard navigation:', error }
        
        return false;
    }
    
    /**
     * Tabナビゲーションを処理
     */
    private handleTabNavigation(event: KeyboardEvent): boolean { event.preventDefault();
        if (event.shiftKey) {
    
}
            this.moveToPrevious(); }
        } else { this.moveToNext() }
        
        return true;
    }
    
    /**
     * 矢印キーナビゲーションを処理
     */
    private handleArrowNavigation(event: KeyboardEvent): boolean { if (!this.keyboardNavigation.arrowKeysEnabled) return false,
        
        // 2Dナビゲーションが有効な場合
        if (this.navigation2D.enabled) {
    
}
            return this.handle2DNavigation(event);
        
        // 1Dナビゲーション（通常のTab順序）
        const { key } = event;
        
        if (key === NAVIGATION_KEYS.ARROW_DOWN || key === NAVIGATION_KEYS.ARROW_RIGHT) {
        
            event.preventDefault();
            this.moveToNext() }
            return true; else if (key === NAVIGATION_KEYS.ARROW_UP || key === NAVIGATION_KEYS.ARROW_LEFT) { event.preventDefault();
            this.moveToPrevious();
            return true }
        
        return false;
    }
    
    /**
     * 2Dナビゲーションを処理
     */
    private handle2DNavigation(event: KeyboardEvent): boolean {
        const { key } = event;
        let direction: NavigationDirection,

        switch(key) {

            case NAVIGATION_KEYS.ARROW_UP: direction = 'up',
                break,
            case NAVIGATION_KEYS.ARROW_DOWN: direction = 'down',
                break,
            case NAVIGATION_KEYS.ARROW_LEFT: direction = 'left',
                break,
            case NAVIGATION_KEYS.ARROW_RIGHT: direction = 'right',
                break
        }
            default: return false,
        
        event.preventDefault();
        
        const target = this.find2DNavigationTarget(direction);
        if (target) {
            this.setFocus(target) }
            return true;
        
        return false;
    }
    
    /**
     * 2Dナビゲーションのターゲットを検索
     */
    private find2DNavigationTarget(direction: NavigationDirection): HTMLElement | null { const currentElement = document.activeElement as HTMLElement,
        if (!currentElement) return null,
        
        const currentRect = currentElement.getBoundingClientRect();
        const candidates = this.focusableElements.filter(el => el !== currentElement);
        let bestCandidate: HTMLElement | null = null,
        let bestScore = Infinity,
        
        for (const candidate of candidates) {
        
            const score = this.calculate2DNavigationScore(currentRect, candidate.getBoundingClientRect(), direction),
            if (score < bestScore) {
                bestScore = score }
                bestCandidate = candidate; }
}
        
        return bestCandidate;
    }
    
    /**
     * 2Dナビゲーションスコアを計算
     */
    private calculate2DNavigationScore(fromRect: DOMRect, toRect: DOMRect, direction: NavigationDirection): number { const fromCenter = calculateElementCenter(fromRect);
        const toCenter = calculateElementCenter(toRect);
        // 方向の妥当性チェック
        if (!isDirectionValid(fromCenter, toCenter, direction) {
    
}
            return Infinity;
        
        // 距離とアライメントを考慮したスコア計算
        const distance = calculateDistance(fromCenter, toCenter);
        const alignment = this.calculateAlignment(fromRect, toRect, direction);
        
        return distance + (alignment * ALIGNMENT_WEIGHT); // アライメントを重視
    }
    
    /**
     * 要素間のアライメントを計算
     */''
    private calculateAlignment(fromRect: DOMRect, toRect: DOMRect, direction: NavigationDirection): number { ''
        if (direction === 'up' || direction === 'down) {'
            // 垂直方向の移動では水平方向のアライメントを重視
            const fromCenterX = fromRect.left + fromRect.width / 2,
            const toCenterX = toRect.left + toRect.width / 2 }
            return Math.abs(fromCenterX - toCenterX); else {  // 水平方向の移動では垂直方向のアライメントを重視
            const fromCenterY = fromRect.top + fromRect.height / 2,
            const toCenterY = toRect.top + toRect.height / 2 }
            return Math.abs(fromCenterY - toCenterY);
    
    /**
     * ページナビゲーションを処理
     */
    private handlePageNavigation(event: KeyboardEvent): boolean {
        const { key } = event;
        
        // 現在のビューポート内の要素を取得
        const viewportElements = this.getElementsInViewport();
        if (viewportElements.length === 0) return false;
        
        event.preventDefault();
        
        if (key === NAVIGATION_KEYS.PAGE_DOWN) {
        
            // ビューポート内の最後の要素にフォーカス
            const lastElement = viewportElements[viewportElements.length - 1] }
            this.setFocus(lastElement); }
        } else if (key === NAVIGATION_KEYS.PAGE_UP) { // ビューポート内の最初の要素にフォーカス
            const firstElement = viewportElements[0],
            this.setFocus(firstElement) }
        
        return true;
    }
    
    /**
     * ビューポート内のフォーカス可能要素を取得
     */
    private getElementsInViewport(): HTMLElement[] { const viewportInfo: ViewportInfo = {
            height: window.innerHeight,
            scrollTop: window.pageYOffset,
            visibleTop: 0,
    visibleBottom: window.innerHeight },
        return this.focusableElements.filter(element => );
            isElementInViewport(element, viewportInfo);
    }
    
    /**
     * 2Dナビゲーションを有効/無効化
     */''
    set2DNavigationEnabled(enabled: boolean): void { this.navigation2D.enabled = enabled,' }'

        console.log(`[FocusNavigation] 2D, navigation ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * キーボードナビゲーション設定を更新
     */'
    updateKeyboardConfig(config: Partial<KeyboardNavigationConfig>): void { ''
        Object.assign(this.keyboardNavigation, config);
        console.log('[FocusNavigation] Keyboard, navigation config, updated') }'
    
    /**
     * フォーカス可能要素のリストを取得
     */
    getFocusableElements(): HTMLElement[] { return [...this.focusableElements],
    
    /**
     * 現在のフォーカス要素を取得
     */
    getCurrentFocusedElement(): HTMLElement | null { if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            return this.focusableElements[this.currentFocusIndex] }
        return null;
    }
    
    /**
     * フォーカス履歴を取得
     */
    getFocusHistory(limit: number = this.maxHistorySize): HTMLElement[] { return this.focusHistory.slice(0, limit) }
    
    /**
     * フォーカス履歴をクリア'
     */''
    clearFocusHistory()';'
        console.log('[FocusNavigation] Focus, history cleared');
    }
    
    /**
     * フォーカス検証を実行
     */'
    validateFocus(element: HTMLElement): FocusValidationResult { ''
        if(!isValidHTMLElement(element)) {
            return { isValid: false,''
                reason: 'Element is not a valid HTML element'
            };
                element }
            }

        if(!this.isElementFocusable(element)) { return { isValid: false,''
                reason: 'Element is not focusable'
            };
                element }
            }

        if(!this.isElementVisible(element)) { return { isValid: false,''
                reason: 'Element is not visible'
            };
                element }
            }
        
        return { isValid: true,
            element }
        }
    
    /**
     * ナビゲーション統計を取得
     */
    getNavigationStats(): NavigationStats { return { focusableElementsCount: this.focusableElements.length,
            currentFocusIndex: this.currentFocusIndex,
            focusHistoryLength: this.focusHistory.length,
            navigation2DEnabled: this.navigation2D.enabled,
    keyboardNavigationEnabled: this.keyboardNavigation.enabled },
            wrapAroundEnabled: this.keyboardNavigation.wrapAround 
    }
    
    /**
     * ナビゲーションコンテキストを取得
     */'
    getNavigationContext(): NavigationContext { return { ''
            currentElement: this.getCurrentFocusedElement('',
    direction: 'forward',' };'

            method: 'programmatic' })
    }
    
    /**
     * フォーカス可能要素の型を判定
     */)
    getElementType(element: HTMLElement): FocusableElementType { return getFocusableElementType(element) }
    
    /**
     * ナビゲーションスコアの詳細計算
     */
    calculateNavigationScore(fromElement: HTMLElement, toElement: HTMLElement, direction: NavigationDirection): NavigationScoreCalculation { const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const fromCenter = calculateElementCenter(fromRect);
        const toCenter = calculateElementCenter(toRect);
        const isValidDirection = isDirectionValid(fromCenter, toCenter, direction);
        const distance = calculateDistance(fromCenter, toCenter);
        const alignment = this.calculateAlignment(fromRect, toRect, direction);
        const totalScore = isValidDirection ? distance + (alignment * ALIGNMENT_WEIGHT) : Infinity,
        
        return { distance,
            alignment,
            totalScore };
            isValidDirection }
        }
    
    /**
     * コンポーネントクリーンアップ'
     */''
    destroy()';'
        console.log('[FocusNavigation] Component, destroyed');

    }'}'