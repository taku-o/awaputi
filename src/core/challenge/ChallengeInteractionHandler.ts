/**
 * ChallengeInteractionHandler
 * 
 * チャレンジUI インタラクション処理システム機能を担当
 * Interaction Management Controller Patternの一部として設計
 * 
 * **Features**:
 * - Keyboard navigation and accessibility support
 * - Touch gesture handling and mobile interactions
 * - Focus management and navigation history
 * - Real-time interaction feedback and announcements
 * 
 * @module ChallengeInteractionHandler
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface EventHandlers { keydown: (event: KeyboardEvent) => void,
    challengeClick: (event: MouseEvent | KeyboardEvent) => void,
    filterChange: (event: Event) => Promise<void>,
    sortChange: (event: Event) => Promise<void>,
    refresh: () => Promise<void>,
    resize: () => void  }
}

export interface FocusableElement extends HTMLElement { tabIndex: number }

export interface NavigationState { focusedIndex: number,
    lastFocusedElement?: HTMLElement,
    navigationMode: NavigationMode,
    focusHistoryEnabled: boolean }

export interface TouchGestureConfig { minSwipeDistance: number,
    maxSwipeTime: number,
    touchSensitivity: number,
    gesturesEnabled: boolean }

export interface TouchEvent { startX: number,
    startY: number,
    endX: number,
    endY: number,
    startTime: number,
    endTime: number }

export interface KeyboardNavigationConfig { enabled: boolean,
    arrowKeys: boolean,
    homeEndKeys: boolean,
    enterSpaceActivation: boolean,
    shortcuts: Record<string, KeyboardShortcut> }

export interface KeyboardShortcut { key: string,
    ctrlKey?: boolean,
    shiftKey?: boolean,
    altKey?: boolean,
    metaKey?: boolean,
    action: ShortcutAction,
    description: string  }

export interface AccessibilityConfig { keyboardNavigation: boolean,
    progressAnnouncements: boolean,
    rewardAnnouncements: boolean,
    focusManagement: boolean,
    ariaUpdates: boolean,
    screenReaderSupport: boolean }

export interface InteractionStats { keyboardInteractions: number,
    challengeViews: number,
    filterChanges: number,
    sortChanges: number,
    touchGestures: number,
    focusChanges: number,
    clickInteractions: number,
    lastInteractionTime?: Date
    }

export interface ChallengeUIElements { container: HTMLElement,
    header: HTMLElement,
    filterControls: HTMLElement,
    sortControls: HTMLElement,
    challengeItems: HTMLElement[],
    refreshButton: HTMLElement,
    progressSection: HTMLElement,
    footer: HTMLElement
    }

export interface ChallengeUIState { challenges: Challenge[],
    selectedChallenge?: Challenge,
    focusedIndex: number,
    loading: boolean,
    filterBy: string,
    sortBy: string,
    visible: boolean }

export interface ChallengeUIReference { config: ChallengeInteractionConfig,
    state: ChallengeUIState,
    elements: ChallengeUIElements,
    stats: InteractionStats,
    renderer: ChallengeRenderer,
    challengeSystem?: ChallengeSystem,
    announce: (message: string, priority?: AnnouncementPriority) => void,
    log: (action: string, data?: Record<string, any>) => void,
    loadChallenges: () => Promise<void>  }
}

export interface ChallengeInteractionConfig { accessibility: AccessibilityConfig,
    keyboard: KeyboardNavigationConfig,
    touch: TouchGestureConfig,
    doubleClickDelay: number,
    focusHistoryLimit: number }

export interface Challenge { id: string,
    title: string,
    description: string,
    type: ChallengeType,
    difficulty: ChallengeDifficulty,
    progress: number,
    target: number,
    deadline: Date,
    priority: number }

export interface ChallengeRenderer { applyResponsiveStyles: () => void 
    }

export interface ChallengeSystem { onProgressUpdate?: (callback: (challengeId: string, progress: number) => void) => void  }
}

export interface ClickPreventionHandler { (event: Event): void }

export interface GestureRecognitionResult { type: GestureType,
    direction?: GestureDirection,
    distance: number,
    duration: number,
    confidence: number  }

export interface AriaAttributes { busy?: boolean,
    setSize?: number,
    positionInSet?: number,
    selected?: boolean,
    expanded?: boolean,
    level?: number }

export interface FocusHistoryEntry { element: HTMLElement,
    timestamp: Date,
    context: string  }

export interface NavigationCommand { type: NavigationType,
    target?: NavigationTarget,
    options?: NavigationOptions }

export interface NavigationOptions { wrap?: boolean,
    announce?: boolean,
    scrollIntoView?: boolean }

// 列挙型
export type NavigationMode = 'standard' | 'grid' | 'tree' | 'linear';
export type NavigationType = 'up' | 'down' | 'left' | 'right' | 'first' | 'last' | 'next' | 'previous';
export type NavigationTarget = 'item' | 'group' | 'control' | 'section';
export type GestureType = 'swipe' | 'tap' | 'longPress' | 'pinch' | 'rotate';
export type GestureDirection = 'up' | 'down' | 'left' | 'right';
export type ShortcutAction = 'refresh' | 'filter' | 'sort' | 'select' | 'activate' | 'close';
export type ChallengeType = 'daily' | 'weekly' | 'special' | 'event';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type AnnouncementPriority = 'polite' | 'assertive' | 'off';

// 定数
export const DEFAULT_TOUCH_CONFIG: TouchGestureConfig = { minSwipeDistance: 50,
    maxSwipeTime: 500,
    touchSensitivity: 0.8,
    gesturesEnabled: true  } as const;
export const DEFAULT_KEYBOARD_CONFIG: KeyboardNavigationConfig = { enabled: true,
    arrowKeys: true,
    homeEndKeys: true,
    enterSpaceActivation: true,
    shortcuts: {
        refresh: {''
            key: 'r',
            ctrlKey: true,
            action: 'refresh',
            description: 'チャレンジを更新'
            };
        filter: { ''
            key: 'f',
            ctrlKey: true,
            action: 'filter',
            description: 'フィルターにフォーカス'
            }
} as const;
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = { keyboardNavigation: true,
    progressAnnouncements: true,
    rewardAnnouncements: true,
    focusManagement: true,
    ariaUpdates: true,
    screenReaderSupport: true  } as const;
export const FOCUSABLE_SELECTOR = `;
    button: not([disabled],
    select: not([disabled],
    input: not([disabled],
    .challenge-item[tabindex="0"],
    [tabindex]:not([tabindex="-1"]):not([disabled]);
` as const;
";
export const DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {;
    easy: '簡単',
    medium: '普通',
    hard: '難しい'
            } as const;
';

export const KEYBOARD_NAVIGATION_KEYS = {;
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    ENTER: 'Enter',
    SPACE: ', ',
    ESCAPE: 'Escape',
    TAB: 'Tab'
            } as const;
export const GESTURE_THRESHOLDS = { minSwipeDistance: 30,
    minTapDuration: 50,
    maxTapDuration: 200,
    minLongPressDuration: 500,
    maxClickDelay: 300  } as const;
';
// ユーティリティ関数
export function isFocusableElement(element: HTMLElement): element is FocusableElement { return element.tabIndex >= 0 &&,
           !element.hasAttribute('disabled) &&,
           element.offsetParent !== null }

export function calculateGestureDistance(startX: number, startY: number, endX: number, endY: number): number { return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2) }

export function determineGestureDirection(startX: number, startY: number, endX: number, endY: number): GestureDirection { const deltaX = endX - startX,
    const deltaY = endY - startY,

    if (Math.abs(deltaX) > Math.abs(deltaY)) {''
        return deltaX > 0 ? 'right' : 'left', else { }

        return deltaY > 0 ? 'down' : 'up';

export function formatRelativeTime(deadline: Date): string { const now = new Date(),
    const diff = deadline.getTime() - now.getTime(),

    if(diff < 0) {', ' }

        return '期限切れ'; else if (diff < 60 * 60 * 1000) { const minutes = Math.floor(diff / (60 * 1000) }
        return `あと${minutes}分`;
    } else if (diff < 24 * 60 * 60 * 1000) { const hours = Math.floor(diff / (60 * 60 * 1000) }
        return `あと${hours}時間`;
    } else { const days = Math.floor(diff / (24 * 60 * 60 * 1000) }
        return `あと${days}日`;

export function createDebounceHandler<T extends any[]>(;
    handler: (...args: T) => void;
    delay: number;
): (...args: T) => void { let timeoutId: number | null = null,
    
    return (...args: T): void => { 
        if (timeoutId !== null) {  }
            window.clearTimeout(timeoutId);
        
        timeoutId = window.setTimeout(() => {  handler(...args),
            timeoutId = null }
        }, delay);
    }

export class ChallengeInteractionHandler {
    private challengeUI: ChallengeUIReference,
    private config: ChallengeInteractionConfig,
    private state: ChallengeUIState,
    private elements: ChallengeUIElements,
    private stats: InteractionStats,
    private handlers: EventHandlers,
    private focusableElements: FocusableElement[],
    private focusHistory: FocusHistoryEntry[],
    private touchState: TouchEvent | null,
    private navigationState: NavigationState,
    private, preventDoubleClickHandlers: Map<HTMLElement, ClickPreventionHandler>,

    constructor(challengeUI: ChallengeUIReference) {

        this.challengeUI = challengeUI,
        this.config = challengeUI.config,
        this.state = challengeUI.state,
        this.elements = challengeUI.elements,
        this.stats = challengeUI.stats,
        
        // イベントハンドラーの初期化
        this.handlers = {
            keydown: this.handleKeydown.bind(this),
            challengeClick: this.handleChallengeClick.bind(this),
            filterChange: this.handleFilterChange.bind(this),
            sortChange: this.handleSortChange.bind(this,
    refresh: this.handleRefresh.bind(this) }
            resize: this.handleResize.bind(this); 
    };
        
        // 初期化
        this.focusableElements = [];
        this.focusHistory = [];
        this.touchState = null;
        this.preventDoubleClickHandlers = new Map('''
            navigationMode: 'linear',
    focusHistoryEnabled: true);
        }''

        console.log('[ChallengeInteractionHandler] Component, initialized');
    }
    
    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners()';
            this.elements.container.addEventListener('keydown', this.handlers.keydown';
            ';
            // フィルター変更
            const filterSelect = this.elements.filterControls.querySelector('select' as HTMLSelectElement;
            if(filterSelect) {', ' }

                filterSelect.addEventListener('change', this.handlers.filterChange'; }
            }
            ';
            // ソート変更
            const sortSelect = this.elements.sortControls.querySelector('select' as HTMLSelectElement;
            if(sortSelect) {', ' }

                sortSelect.addEventListener('change', this.handlers.sortChange'; }
            }
            ';
            // 更新ボタン
            const refreshButton = this.elements.header.querySelector('.challenge-ui-refresh' as HTMLButtonElement;
            if(refreshButton) {', ' }

                refreshButton.addEventListener('click', this.handlers.refresh'; }
            }
            ';
            // ウィンドウリサイズ
            window.addEventListener('resize', this.handlers.resize);
            
            // アクセシビリティ機能の設定
            this.setupAccessibility();

        } catch (error) { console.error('[ChallengeInteractionHandler] Failed to setup event listeners:', error }
    }
    
    /**
     * フォーカス可能要素の更新
     */
    updateFocusableElements(): void { try {
            const elements = Array.from(),
                this.elements.container.querySelectorAll(FOCUSABLE_SELECTOR) as HTMLElement[],
            
            this.focusableElements = elements.filter(isFocusableElement),
            
            // フォーカスインデックスの調整
            if(this.navigationState.focusedIndex >= this.focusableElements.length) {
    
}
                this.navigationState.focusedIndex = Math.max(0, this.focusableElements.length - 1);' }'

            } catch (error) {
            console.error('[ChallengeInteractionHandler] Failed to update focusable elements:', error',
            this.focusableElements = [] }
    }
    
    /**
     * 初期フォーカスの設定
     */'
    setInitialFocus(): void { if (this.focusableElements.length > 0) {''
            this.focusableElements[0].focus()',
            this.recordFocusChange(this.focusableElements[0], 'initial' }'
    }
    
    /**
     * キーボードハンドラー
     */
    private handleKeydown(event: KeyboardEvent): void { if (!this.config.accessibility.keyboardNavigation) return,
        
        this.stats.keyboardInteractions++,
        this.stats.lastInteractionTime = new Date(),
        
        switch(event.key) {
        
            case KEYBOARD_NAVIGATION_KEYS.ARROW_UP: event.preventDefault(
                this.navigateUp(),
                break,
            case KEYBOARD_NAVIGATION_KEYS.ARROW_DOWN: event.preventDefault(
                this.navigateDown(),
                break,
            case KEYBOARD_NAVIGATION_KEYS.HOME: event.preventDefault(
                this.navigateToFirst(),
                break,
            case KEYBOARD_NAVIGATION_KEYS.END: event.preventDefault(
                this.navigateToLast(),
                break,
            case KEYBOARD_NAVIGATION_KEYS.ENTER:,
            case KEYBOARD_NAVIGATION_KEYS.SPACE: event.preventDefault(
                this.activateCurrentItem(),
                break,
            default: this.handleKeyboardShortcuts(event) }
                break; }
}
    
    /**
     * キーボードショートカットの処理
     */
    private handleKeyboardShortcuts(event: KeyboardEvent): void { const shortcuts = this.config.keyboard.shortcuts,
        
        for (const shortcut of Object.values(shortcuts) {
        
            if(this.matchesShortcut(event, shortcut) {
                event.preventDefault(),
                this.executeShortcutAction(shortcut.action) }
                break; }
}
    }
    
    /**
     * ショートカットマッチング
     */
    private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean { return event.key.toLowerCase() === shortcut.key.toLowerCase() &&
               !!event.ctrlKey === !!shortcut.ctrlKey &&,
               !!event.shiftKey === !!shortcut.shiftKey &&,
               !!event.altKey === !!shortcut.altKey &&,
               !!event.metaKey === !!shortcut.metaKey }
    
    /**
     * ショートカットアクションの実行
     */'
    private executeShortcutAction(action: ShortcutAction): void { ''
        switch(action) {

            case 'refresh':',
                this.handleRefresh('''
            case 'filter': ',
                this.focusFilterControl('',
            case 'sort':',
                this.focusSortControl()',
            case 'select':),
                this.activateCurrentItem() }
                break; }
}
    
    /**
     * 上方向ナビゲーション
     */
    navigateUp(): void { if (this.navigationState.focusedIndex > 0) {
            this.navigationState.focusedIndex--,
            this.focusElementAtIndex(this.navigationState.focusedIndex) }
    }
    
    /**
     * 下方向ナビゲーション
     */
    navigateDown(): void { if (this.navigationState.focusedIndex < this.focusableElements.length - 1) {
            this.navigationState.focusedIndex++,
            this.focusElementAtIndex(this.navigationState.focusedIndex) }
    }
    
    /**
     * 最初の要素にナビゲーション
     */
    navigateToFirst(): void { if (this.focusableElements.length > 0) {
            this.navigationState.focusedIndex = 0,
            this.focusElementAtIndex(0) }
    }
    
    /**
     * 最後の要素にナビゲーション
     */
    navigateToLast(): void { if (this.focusableElements.length > 0) {
            this.navigationState.focusedIndex = this.focusableElements.length - 1,
            this.focusElementAtIndex(this.navigationState.focusedIndex) }
    }
    
    /**
     * 指定インデックスの要素にフォーカス
     */
    private focusElementAtIndex(index: number): void { const element = this.focusableElements[index],
        if(element) {

            element.focus()',
            this.recordFocusChange(element, 'navigation' }
            this.stats.focusChanges++; }
}
    
    /**
     * 現在のアイテムの有効化
     */'
    activateCurrentItem(): void { const focusedElement = this.focusableElements[this.navigationState.focusedIndex],
        if(focusedElement) {

            if(focusedElement.classList.contains('challenge-item' { }
                this.handleChallengeClick({ currentTarget: focusedElement ) as MouseEvent } else { focusedElement.click() }
}
    
    /**
     * チャレンジクリックハンドラー'
     */''
    private handleChallengeClick(event: MouseEvent | KeyboardEvent): void { const item = event.currentTarget as HTMLElement,
        const challengeId = item.getAttribute('data-challenge-id),
        const challenge = this.state.challenges.find(c => c.id === challengeId),
        
        if(challenge) {
        
            this.state.selectedChallenge = challenge,
            this.stats.challengeViews++,
            this.stats.clickInteractions++,
            this.stats.lastInteractionTime = new Date(),
            ',
            // 詳細情報のアナウンス
            this.announceChallenge(challenge),
            ',

            // ログ出力
        
        }

            this.challengeUI.log('チャレンジ選択', { challengeId ) }
    }
    
    /**
     * フィルター変更ハンドラー
     */
    private async handleFilterChange(event: Event): Promise<void> { const target = event.target as HTMLSelectElement,
        const newFilter = target.value,
        
        if(newFilter !== this.state.filterBy) {
        
            this.state.filterBy = newFilter,
            this.stats.filterChanges++,
            
            await this.challengeUI.loadChallenges(),
            
            const selectedOption = target.selectedOptions[0] }
            const filterText = selectedOption ? selectedOption.text: newFilter 
            this.challengeUI.announce(`フィルターを「${filterText}」に変更しました`});
        }
    }
    
    /**
     * ソート変更ハンドラー
     */
    private async handleSortChange(event: Event): Promise<void> { const target = event.target as HTMLSelectElement,
        const newSort = target.value,
        
        if(newSort !== this.state.sortBy) {
        
            this.state.sortBy = newSort,
            this.stats.sortChanges++,
            
            await this.challengeUI.loadChallenges(),
            
            const selectedOption = target.selectedOptions[0] }
            const sortText = selectedOption ? selectedOption.text: newSort 
            this.challengeUI.announce(`並び順を「${sortText}」に変更しました`});
        }
    }
    
    /**
     * 更新ハンドラー
     */'
    private async handleRefresh(): Promise<void> { ''
        await this.challengeUI.loadChallenges(),

        this.challengeUI.announce('チャレンジを更新しました' }'
    
    /**
     * リサイズハンドラー
     */
    private handleResize(): void { this.challengeUI.renderer.applyResponsiveStyles(),
        this.updateFocusableElements() }
    
    /**
     * チャレンジの詳細アナウンス
     */
    announceChallenge(challenge: Challenge): void { const progressPercent = Math.round((challenge.progress / challenge.target) * 100),
        const difficultyLabel = DIFFICULTY_LABELS[challenge.difficulty] || challenge.difficulty,
        const deadlineText = formatRelativeTime(challenge.deadline) }
        const message = `選択中: ${challenge.title}. 進捗 ${progressPercent}パーセント. ` +
                       `難易度 ${difficultyLabel}. 期限 ${deadlineText}`;
        
        this.challengeUI.announce(message);
    }
    
    /**
     * 進捗更新のアナウンス
     */
    announceProgressUpdate(challengeId: string, progress: number): void { if (!this.config.accessibility.progressAnnouncements) return,
        
        const challenge = this.state.challenges.find(c => c.id === challengeId),
        if(challenge) {', ' }

            const progressPercent = Math.round((progress / challenge.target) * 100'); }'
            const message = `「${challenge.title}」の進捗が ${progressPercent}パーセント になりました`;

            this.challengeUI.announce(message, 'assertive';
        }
    }
    
    /**
     * フォーカス状態の管理
     */'
    manageFocusState(): void { const activeElement = document.activeElement as HTMLElement,
        if(activeElement && this.elements.container.contains(activeElement)) {''
            this.recordFocusChange(activeElement, 'manual' }'
    }
    
    /**
     * フォーカス変更の記録
     */
    private recordFocusChange(element: HTMLElement, context: string): void { if (!this.navigationState.focusHistoryEnabled) return,
        
        this.focusHistory.push({)
            element,
            timestamp: new Date(),
            context,
        
        // 履歴の制限
        const limit = this.config.focusHistoryLimit || 10,
        if (this.focusHistory.length > limit) { this.focusHistory = this.focusHistory.slice(-Math.floor(limit / 2) }
    }
    
    /**
     * フォーカス履歴から復元
     */
    restoreFocus(): boolean { if (this.focusHistory.length > 0) {
            const lastEntry = this.focusHistory.pop(),
            if(lastEntry?.element && document.contains(lastEntry.element) {
                lastEntry.element.focus() }
                return true;
        return false;
    }
    
    /**
     * チャレンジアイテムのクリックイベントを設定
     */ : undefined
    setupChallengeItemEvents(): void { this.elements.challengeItems.forEach(item => { 
            // ダブルクリック防止ハンドラーを作成
            const, preventedHandler = this.createDoubleClickPrevention(),
                this.handlers.challengeClick),
                this.config.doubleClickDelay || GESTURE_THRESHOLDS.maxClickDelay),

            this.preventDoubleClickHandlers.set(item, preventedHandler),

            item.addEventListener('click', preventedHandler',
            item.addEventListener('keydown', (event: KeyboardEvent) => {
                if(event.key === KEYBOARD_NAVIGATION_KEYS.ENTER || event.key === KEYBOARD_NAVIGATION_KEYS.SPACE) {
    
}
                    event.preventDefault(); }
                    preventedHandler(event); }
});
        });
    }
    
    /**
     * タッチイベントのサポート
     */'
    setupTouchEvents(): void { ''
        if(!this.config.touch.gesturesEnabled) return }
        let touchStartData: { x: number, y: number,, time: number } | null = null;

        this.elements.container.addEventListener('touchstart', (event: TouchEvent) => {  const touch = event.changedTouches[0],
            touchStartData = {
                x: touch.screenX,
    y: touch.screenY }
                time: Date.now(); 
    };'}');

        this.elements.container.addEventListener('touchend', (event: TouchEvent) => {  if (!touchStartData) return,
            
            const touch = event.changedTouches[0],
            const touchEndData = {
                x: touch.screenX,
    y: touch.screenY }
                time: Date.now(); 
    };
            
            const gestureResult = this.recognizeGesture(touchStartData, touchEndData);
            if(gestureResult) {
                this.handleGesture(gestureResult) }
                this.stats.touchGestures++; }
            }
            
            touchStartData = null;
        });
    }
    
    /**
     * ジェスチャー認識
     */
    private recognizeGesture(;
        start: { x: number, y: number,  time: number
            });
        end: { x: number, y: number,, time: number ): GestureRecognitionResult | null {
        const distance = calculateGestureDistance(start.x, start.y, end.x, end.y),
        const duration = end.time - start.time,
        
        if(distance < this.config.touch.minSwipeDistance) {
        ',

            if(duration < GESTURE_THRESHOLDS.maxTapDuration) {
                return { ''
                    type: 'tap',
                    distance }
                    duration };
                    confidence: 0.9 
    }
            return null;
        }
        
        if (duration > this.config.touch.maxSwipeTime) { return null }

        const direction = determineGestureDirection(start.x, start.y, end.x, end.y);
        ';

        return { ''
            type: 'swipe',
            direction,
            distance,
            duration };
            confidence: Math.min(distance / (this.config.touch.minSwipeDistance * 2), 1.0); }
        }
    
    /**
     * ジェスチャーの処理
     */'
    private handleGesture(gesture: GestureRecognitionResult): void { ''
        switch(gesture.type) {

            case 'swipe':',
                this.handleSwipeGesture(gesture.direction),

                break,
            case 'tap':,
                // タップは通常のクリックイベントで処理される
        }
                break; }
}
    
    /**
     * スワイプジェスチャーの処理
     */
    private handleSwipeGesture(direction?: GestureDirection): void { ''
        switch(direction) {

            case 'up':',
                this.navigateUp()',
            case 'down':),
                this.navigateDown() }
                break; }
}
    
    /**
     * ダブルクリック防止ハンドラーの作成
     */
    private createDoubleClickPrevention(;
        handler: (event: Event) => void;
        delay: number = GESTURE_THRESHOLDS.maxClickDelay;
    ): ClickPreventionHandler { let lastClickTime = 0,
        
        return (event: Event): void => { 
            const now = Date.now(),
            if(now - lastClickTime < delay) {
    
}
                event.preventDefault(); }
                return; }
            }
            lastClickTime = now;
            handler(event);
        }
    
    /**
     * アクセシビリティ設定
     */
    setupAccessibility(): void { if (!this.config.accessibility.screenReaderSupport) return,
        
        // フォーカス可能要素の更新
        this.updateFocusableElements(),
        
        // キーボードナビゲーションの設定
        if(this.config.accessibility.keyboardNavigation) {
    
}
            this.setupKeyboardNavigation(); }
        }
        
        // 進捗アナウンスの設定
        if (this.config.accessibility.progressAnnouncements) { this.setupProgressAnnouncements() }
        
        // タッチイベントの設定（モバイルアクセシビリティ向上）
        this.setupTouchEvents();
        
        // ARIA属性の初期設定
        if (this.config.accessibility.ariaUpdates) { this.updateAriaAttributes() }
    }
    
    /**
     * キーボードナビゲーションの設定
     */
    private setupKeyboardNavigation(): void { // ARIA属性の動的更新
        this.updateAriaAttributes() }
    
    /**
     * 進捗アナウンスの設定
     */
    private setupProgressAnnouncements(): void { // チャレンジ進捗の監視
        if(this.challengeUI.challengeSystem?.onProgressUpdate) {
            : undefined
        
            this.challengeUI.challengeSystem.onProgressUpdate((challengeId: string, progress: number) => {   }
                this.announceProgressUpdate(challengeId, progress); }
            });
        }
    }
    
    /**
     * ARIA属性の更新
     */
    updateAriaAttributes(): void { ''
        if(!this.config.accessibility.ariaUpdates) return,
        ',
        // コンテナのARIA属性
        this.elements.container.setAttribute('aria-busy', this.state.loading ? 'true' : 'false',
        ',
        // チャレンジアイテムのARIA属性更新
        this.elements.challengeItems.forEach((item, index) => { ''
            item.setAttribute('aria-setsize', this.elements.challengeItems.length.toString()),
            item.setAttribute('aria-posinset', (index + 1).toString(),

            if(this.state.selectedChallenge) {

                const challengeId = item.getAttribute('data-challenge-id') }

                item.setAttribute('aria-selected');' }

                    challengeId === this.state.selectedChallenge.id ? 'true' : 'false'); 
    }';
    }
    
    /**
     * フィルターコントロールにフォーカス'
     */''
    private focusFilterControl()';
        const filterSelect = this.elements.filterControls.querySelector('select) as HTMLSelectElement;
        if (filterSelect) { filterSelect.focus() }
    }
    
    /**
     * ソートコントロールにフォーカス'
     */''
    private focusSortControl()';
        const sortSelect = this.elements.sortControls.querySelector('select) as HTMLSelectElement;
        if (sortSelect) { sortSelect.focus() }
    }
    
    /**
     * インタラクション統計の取得
     */
    getInteractionStats(): InteractionStats {
        return { ...this.stats }
    
    /**
     * フォーカス履歴の取得
     */
    getFocusHistory(): FocusHistoryEntry[] { return [...this.focusHistory],
    
    /**
     * 現在のフォーカス要素の取得
     */
    getCurrentFocusElement(): FocusableElement | null { return this.focusableElements[this.navigationState.focusedIndex] || null }
    
    /**
     * ナビゲーション状態のリセット
     */
    resetNavigationState(): void { this.navigationState.focusedIndex = 0,
        this.focusHistory = [],
        this.updateFocusableElements() }
    
    /**
     * イベントリスナーの削除'
     */''
    removeEventListeners()';
        window.removeEventListener('resize', this.handlers.resize);
        
        // チャレンジアイテムのイベントリスナー削除
        this.elements.challengeItems.forEach(item => {  ),
            const handler = this.preventDoubleClickHandlers.get(item),
            if(handler) {', ' }

                item.removeEventListener('click', handler); }
                this.preventDoubleClickHandlers.delete(item); }

            }'}');
        ';
        // コンテナのイベントリスナー削除
        this.elements.container.removeEventListener('keydown', this.handlers.keydown);
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void { this.removeEventListeners(),
        
        this.focusableElements = [],
        this.focusHistory = [],

        this.touchState = null,
        this.preventDoubleClickHandlers.clear()',
        console.log('[ChallengeInteractionHandler] Component, destroyed') }

    }'}