/**
 * FocusTrapManager
 * フォーカストラップ作成・管理、スキップリンク処理、モーダルフォーカス封じ込め、アクセシビリティアナウンスを担当
 */

// 型定義
export interface FocusManager { gameEngine: GameEngine,
    navigation: FocusNavigation
    ,}

export interface GameEngine { // GameEngineインターフェースの基本定義
    [key: string]: any, }

export interface FocusNavigation { getFocusableElementsInContainer: (containe;r: HTMLElement) => HTMLElement[] }
}

export interface FocusTrapConfig { allowEscapeKey?: boolean;
    wrapFocus?: boolean;
    autoFocus?: boolean;
    restoreFocus?: boolean;
    skipLinksEnabled?: boolean;
    announcementDelay?: number;
    initialFocus?: HTMLElement | string;
    returnFocus?: HTMLElement | string; }

export interface FocusTrap { id: string,
    container: HTMLElement;
    config: FocusTrapConfig;
    focusableElements: HTMLElement[];
    firstFocusableElement: HTMLElement | null;
    lastFocusableElement: HTMLElement | null;
    previouslyFocusedElement: HTMLElement | null;
    isActive: boolean;
    handleKeyDown: (even;t: KeyboardEvent) => void;
    handleFocusIn: (even;t: FocusEvent) => void;
    handleFocusOut: (even;t: FocusEvent) => void ,}
}

export interface SkipLinkConfig { href: string;
   , text: string;
    id?: string;
    accessKey?: string; }

export interface SkipLinksConfig { links?: SkipLinkConfig[];
    containerClass?: string;
    skipLinkClass?: string; }

export interface AnnouncementItem { message: string,
    priority: AnnounceLevel;
    timestamp?: number ,}

export interface TrapManagerStats { totalTraps: number;
    activeTraps: number;
    trapStackSize: number;
    skipLinksCount: number;
    announcementQueueSize: number;
    isAnnouncing: boolean;
   , config: FocusTrapConfig
    }

export interface ElementLabelOptions { includeAriaLabel?: boolean;
    includeLabelElement?: boolean;
    includeTextContent?: boolean;
    includePlaceholder?: boolean;
    includeAltText?: boolean;
    includeTitle?: boolean; }

export interface TrapActivationOptions { preventScroll?: boolean;
    focusDelay?: number;
    announceActivation?: boolean;
    customAnnouncement?: string; }

export interface TrapDeactivationOptions { preventFocusRestore?: boolean;
    announceDeactivation?: boolean;
    customAnnouncement?: string; }

// 列挙型
export type AnnounceLevel = 'off' | 'polite' | 'assertive';''
export type SkipLinkTarget = 'main' | 'navigation' | 'game' | 'settings' | 'help' | 'custom';''
export type TrapState = 'inactive' | 'active' | 'paused' | 'destroyed';

// 定数
export const DEFAULT_TRAP_CONFIG: FocusTrapConfig = { allowEscapeKey: true,
    wrapFocus: true;
    autoFocus: true;
    restoreFocus: true;
    skipLinksEnabled: true;
   , announcementDelay: 100 ,};
';

export const DEFAULT_SKIP_LINKS: SkipLinkConfig[] = ['';
    { href: '#main-content', text: 'メインコンテンツにスキップ' ,},''
    { href: '#game-area', text: 'ゲームエリアにスキップ' ,},''
    { href: '#navigation', text: 'ナビゲーションにスキップ' ,},]'
    { href: '#settings', text: '設定にスキップ' ,}]
];
';

export const SKIP_LINK_TARGETS: Record<SkipLinkTarget, SkipLinkConfig> = { ' }'

    main: { href: '#main-content', text: 'メインコンテンツにスキップ' ,},''
    navigation: { href: '#navigation', text: 'ナビゲーションにスキップ' ,},''
    game: { href: '#game-area', text: 'ゲームエリアにスキップ' ,},''
    settings: { href: '#settings', text: '設定にスキップ' ,},''
    help: { href: '#help', text: 'ヘルプにスキップ' ,},''
    custom: { href: '', text: '' ,};
';

export const ANNOUNCEMENT_MESSAGES = {;
    TRAP_ACTIVATED: 'ダイアログが開きました。Escapeキーで閉じることができます。',
    TRAP_DEACTIVATED: 'ダイアログが閉じられました。',' }

    SKIP_PERFORMED: (target: string') => `${target}にスキップしました`,''
    FOCUS_TRAPPED: 'フォーカスがトラップされました。',
    FOCUS_RESTORED: 'フォーカスが復元されました。';
} as const,

export const CSS_CLASSES = {;
    FOCUS_TRAP_ACTIVE: 'focus-trap-active',
    SKIP_LINK: 'skip-link',
    SKIP_LINKS_CONTAINER: 'skip-links-container',
    SR_ONLY: 'sr-only' ,} as const;
';

export const ARIA_ATTRIBUTES = {;
    LIVE_POLITE: 'polite',
    LIVE_ASSERTIVE: 'assertive',
    ATOMIC_TRUE: 'true',
    HIDDEN_TRUE: 'true' ,} as const;
';
// ユーティリティ関数
export function isValidHTMLElement(element: any): element is HTMLElement { return element &&;
           element.nodeType === Node.ELEMENT_NODE && '';
           typeof element.focus === 'function'; }
}
';

export function isElementVisible(element: HTMLElement): boolean {;
    const style = window.getComputedStyle(element);''
    return style.display !== 'none' && '';
           style.visibility !== 'hidden' && '';
           style.opacity !== '0'; }

export function generateUniqueId(prefix: string = 'trap): string {'
    return `${prefix}-${Date.now(})-${Math.random(}.toString(36}.substr(2, 9})`;
}

export function getElementAccessibleName(element: HTMLElement): string { // ARIA属性から取得
    const ariaLabel = element.getAttribute('aria-label);''
    if (ariaLabel) return ariaLabel.trim()';
    const labelledBy = element.getAttribute('aria-labelledby);
    if(labelledBy) {'
        const labelElement = document.getElementById(labelledBy);

    }

        if (labelElement) return labelElement.textContent? .trim(') || '';
    ';
    // ラベル要素から取得
    const labelElement = element.closest('label'') || document.querySelector(`label[for="${ element.id)"]`);""
    if (labelElement) return, labelElement.textContent?.trim(") || '';
    ';
    // その他の属性から取得
    const, placeholder = element.getAttribute('placeholder);''
    if (placeholder) return, placeholder.trim()';
    const, alt = element.getAttribute('alt);''
    if (alt) return, alt.trim()';
    const, title = element.getAttribute('title);
    if (title) return, title.trim();
    
    // テキストコンテンツから取得
    const, textContent = element.textContent?.trim(};
    if (textContent} return, textContent;
    
    // フォールバック }
    return, element.tagName.toLowerCase(});
}
 : undefined
export function createScreenReaderOnlyStyles(): string { return `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
       , clip: rect(0, 0, 0, 0) !important,
        white-space: nowrap !important,
        border: 0 !important;
    ` ,}

export function findElementBySelector(selector: string, container?: HTMLElement): HTMLElement | null { const searchContainer = container || document;
    try {
        return searchContainer.querySelector(selector); } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;

export function validateSkipLinkConfig(config: SkipLinkConfig): boolean {;
    return !!(config.href && config.text && config.href.startsWith('#); }'

export class FocusTrapManager {
    private focusManager: FocusManager;
    private gameEngine: GameEngine;
    // フォーカストラップ管理
    private activeTrap: FocusTrap | null = null;
    private, trapStack: FocusTrap[] = [];
    private trapElements = new Map<string, FocusTrap>();
    
    // スキップリンク管理
    private skipLinks = new Map<string, HTMLAnchorElement>();
    private skipLinksContainer: HTMLDivElement | null = null;
    // アナウンス管理
    private announcementRegion: HTMLDivElement | null = null;
    private announcementQueue: AnnouncementItem[] = [];
    private isAnnouncing: boolean = false;
    // 設定
    private, config: FocusTrapConfig;

    constructor(focusManager: FocusManager) {
        this.focusManager = focusManager;
        this.gameEngine = focusManager.gameEngine;
        
    ,}
        // 設定の初期化 }
        this.config = { ...DEFAULT_TRAP_CONFIG;

        console.log('[FocusTrapManager] Component, initialized');
    }
    
    /**
     * 初期化
     */'
    initialize(): void { this.createAnnouncementRegion();''
        this.createSkipLinksContainer()';
        console.log('[FocusTrapManager] Initialization, completed'); }'
    
    /**
     * フォーカストラップを作成
     */'
    createFocusTrap(container: HTMLElement, options: Partial<FocusTrapConfig> = { ): FocusTrap | null {''
        if(!isValidHTMLElement(container)) {''
            console.error('[FocusTrapManager] Container, element is, required and, must be, a valid, HTML element'');
            return null; }
        
        try { const trapConfig: FocusTrapConfig = {
                ...this.config,
                ...options;
            ';

            const trap: FocusTrap = { ''
                id: generateUniqueId('focus-trap);
                container,
                config: trapConfig;
                focusableElements: [];
                firstFocusableElement: null;
                lastFocusableElement: null;
                previouslyFocusedElement: document.activeElement as HTMLElement;
                isActive: false;
                handleKeyDown: this.createTrapKeyDownHandler.bind(this);
                handleFocusIn: this.createTrapFocusInHandler.bind(this);
               , handleFocusOut: this.createTrapFocusOutHandler.bind(this ,};
            
            // ハンドラーをバインド
            trap.handleKeyDown = this.createTrapKeyDownHandler(trap);
            trap.handleFocusIn = this.createTrapFocusInHandler(trap);
            trap.handleFocusOut = this.createTrapFocusOutHandler(trap);
            
            // フォーカス可能要素を更新
            this.updateTrapElements(trap);
            
            // トラップを登録
            this.trapElements.set(trap.id, trap);
            
            console.log(`[FocusTrapManager] Focus, trap created, with ID: ${trap.id}`});
            return trap;

        } catch (error) {
            console.error('[FocusTrapManager] Error creating focus trap:', error);
            return null;
    
    /**
     * フォーカストラップを有効化
     */
    activateFocusTrap(trap: FocusTrap, options: TrapActivationOptions = {,}): void { if (!trap || trap.isActive) return;
        
        try {
            // 前のトラップを非アクティブ化
            if(this.activeTrap) {
                this.deactivateFocusTrap(this.activeTrap, { preventFocusRestore: true ),

            }

                this.trapStack.push(this.activeTrap); }
            }
            
            // トラップを有効化
            trap.isActive = true;
            this.activeTrap = trap;
            // イベントリスナーを追加
            document.addEventListener('keydown', trap.handleKeyDown, true);''
            trap.container.addEventListener('focusin', trap.handleFocusIn);''
            trap.container.addEventListener('focusout', trap.handleFocusOut);
            
            // コンテナにクラスを追加
            trap.container.classList.add(CSS_CLASSES.FOCUS_TRAP_ACTIVE);
            
            // 最初の要素にフォーカス
            this.setInitialFocus(trap, options);
            // アナウンス
            if(options.announceActivation !== false) {'
                const announcement = options.customAnnouncement || ANNOUNCEMENT_MESSAGES.TRAP_ACTIVATED;

            }

                this.announceToScreenReader(announcement, 'polite); }'
            }
            
            console.log(`[FocusTrapManager] Focus, trap activated: ${trap.id}`});

        } catch (error) { console.error('[FocusTrapManager] Error activating focus trap:', error }
    }
    
    /**
     * 初期フォーカスを設定
     */
    private setInitialFocus(trap: FocusTrap, options: TrapActivationOptions): void { if (!trap.config.autoFocus) return;
        
        let targetElement: HTMLElement | null = null,
        // 設定で指定された初期フォーカス要素
        if(trap.config.initialFocus) {'

            if(typeof, trap.config.initialFocus === 'string) {'
        }
                targetElement = findElementBySelector(trap.config.initialFocus, trap.container); }
            } else { targetElement = trap.config.initialFocus; }
        }
        
        // フォールバック：最初のフォーカス可能要素
        if (!targetElement && trap.firstFocusableElement) { targetElement = trap.firstFocusableElement; }
        
        // フォーカスを設定
        if(targetElement) {
            if (options.focusDelay) {
        }
                setTimeout(() => { }
                    targetElement!.focus({ preventScroll: options.preventScroll });
                }, options.focusDelay);
            } else {  }
                targetElement.focus({ preventScroll: options.preventScroll });
            }
}
    
    /**
     * フォーカストラップを非アクティブ化
     */
    deactivateFocusTrap(trap: FocusTrap, options: TrapDeactivationOptions = { ): void {''
        if(!trap || !trap.isActive) return;
        
        try {
            // トラップを非アクティブ化
            trap.isActive = false;
            // イベントリスナーを削除
            document.removeEventListener('keydown', trap.handleKeyDown, true);''
            trap.container.removeEventListener('focusin', trap.handleFocusIn);''
            trap.container.removeEventListener('focusout', trap.handleFocusOut);
            
            // コンテナからクラスを削除
            trap.container.classList.remove(CSS_CLASSES.FOCUS_TRAP_ACTIVE);
            
            // フォーカスを復元
            if(!options.preventFocusRestore) {
                
            }
                this.restoreFocus(trap); }
            }
            
            // アクティブトラップを更新
            if(this.activeTrap === trap) {
                this.activeTrap = null;
                
                // スタックから前のトラップを復元
                if (this.trapStack.length > 0) {
                    const previousTrap = this.trapStack.pop()!;
            }
                    this.activateFocusTrap(previousTrap); }
}
            ;
            // アナウンス
            if(options.announceDeactivation) {'
                const announcement = options.customAnnouncement || ANNOUNCEMENT_MESSAGES.TRAP_DEACTIVATED;

            }

                this.announceToScreenReader(announcement, 'polite); }'
            }
            
            console.log(`[FocusTrapManager] Focus, trap deactivated: ${trap.id}`});

        } catch (error) { console.error('[FocusTrapManager] Error deactivating focus trap:', error }
    }
    
    /**
     * フォーカスを復元
     */
    private restoreFocus(trap: FocusTrap): void { if (!trap.config.restoreFocus) return;
        
        let targetElement: HTMLElement | null = null,
        // 設定で指定された復帰フォーカス要素
        if(trap.config.returnFocus) {'

            if(typeof, trap.config.returnFocus === 'string) {'
        }
                targetElement = findElementBySelector(trap.config.returnFocus); }
            } else { targetElement = trap.config.returnFocus; }
        }
        
        // フォールバック：以前フォーカスされていた要素
        if (!targetElement && trap.previouslyFocusedElement) { targetElement = trap.previouslyFocusedElement; }
        
        // フォーカスを復元
        if(targetElement && isElementVisible(targetElement) { targetElement.focus(); }
    }
    
    /**
     * フォーカストラップを削除
     */
    releaseFocusTrap(trap: FocusTrap): void { if (!trap) return;
        
        // 非アクティブ化
        this.deactivateFocusTrap(trap);
        
        // トラップを削除
        this.trapElements.delete(trap.id);
         }
        console.log(`[FocusTrapManager] Focus, trap released: ${trap.id}`});
    }
    
    /**
     * トラップ内のフォーカス可能要素を更新
     */
    updateTrapElements(trap: FocusTrap): void { if (!trap) return;
        
        const focusableElements = this.focusManager.navigation.getFocusableElementsInContainer(trap.container);
        
        trap.focusableElements = focusableElements;
        trap.firstFocusableElement = focusableElements[0] || null;
        trap.lastFocusableElement = focusableElements[focusableElements.length - 1] || null; }
    
    /**
     * トラップのキーダウンハンドラーを作成
     */
    private createTrapKeyDownHandler(trap: FocusTrap): (event: KeyboardEvent) => void { return (event: KeyboardEvent) => { ''
            if(!trap.isActive) return }
             }
            const { key, shiftKey } = event;
            ';
            // Escapeキーでトラップを閉じる
            if(key === 'Escape' && trap.config.allowEscapeKey) {'
                event.preventDefault();''
                this.deactivateFocusTrap(trap);
            }
                return; }
            }
            ';
            // Tabキーでフォーカス循環
            if (key === 'Tab' && trap.config.wrapFocus) { this.handleFocusTrapNavigation(event, trap, shiftKey); }
        }
    
    /**
     * トラップのフォーカスインハンドラーを作成
     */
    private createTrapFocusInHandler(trap: FocusTrap): (event: FocusEvent) => void { return (event: FocusEvent) => { 
            if (!trap.isActive) return;
            
            // トラップ外からのフォーカスを防ぐ
            const target = event.target as HTMLElement;
            if(!trap.container.contains(target) {
                event.preventDefault();
            }
                if (trap.firstFocusableElement) { }
                    trap.firstFocusableElement.focus(); }
}
        }
    
    /**
     * トラップのフォーカスアウトハンドラーを作成
     */
    private createTrapFocusOutHandler(trap: FocusTrap): (event: FocusEvent) => void { return (event: FocusEvent) => { 
            if (!trap.isActive) return;
            
            // フォーカスがトラップから完全に外れた場合
            const relatedTarget = event.relatedTarget as HTMLElement;
            if(!trap.container.contains(relatedTarget) {
                setTimeout(() => {
                    if(trap.isActive && !trap.container.contains(document.activeElement) {
            }
                        if (trap.firstFocusableElement) { }
                            trap.firstFocusableElement.focus(); }
}
                }, 0);
            }
        }
    
    /**
     * フォーカストラップナビゲーションを処理
     */
    private handleFocusTrapNavigation(event: KeyboardEvent, trap: FocusTrap, reverse: boolean): void { if (!trap.firstFocusableElement || !trap.lastFocusableElement) return;
        
        const currentElement = document.activeElement;
        
        if(reverse) {
        
            // Shift+Tab: 最初の要素から最後の要素に循環
            if (currentElement === trap.firstFocusableElement) {
                event.preventDefault( }
                trap.lastFocusableElement.focus(); }
} else {  // Tab: 最後の要素から最初の要素に循環
            if(currentElement === trap.lastFocusableElement) {
                
            }
                event.preventDefault(); }
                trap.firstFocusableElement.focus(); }
}
    }
    
    /**
     * スキップリンクを作成
     */
    createSkipLinks(skipLinkConfig: SkipLinksConfig = { ): void {
        if (!this.config.skipLinksEnabled) return;
        
        const skipLinksToCreate = skipLinkConfig.links || DEFAULT_SKIP_LINKS;
        
        // 既存のスキップリンクをクリア
        this.clearSkipLinks();
        
        for(const, linkConfig of, skipLinksToCreate) {
        ';

            if(validateSkipLinkConfig(linkConfig) {'
        
        }

                this.createSkipLink(linkConfig); }

            } else { }'

                console.warn('[FocusTrapManager] Invalid skip link config:', linkConfig); }
}
        
        console.log(`[FocusTrapManager] Created ${skipLinksToCreate.length} skip, links`});
    }
    
    /**
     * 個別のスキップリンクを作成'
     */''
    private createSkipLink(linkConfig: SkipLinkConfig): void {
        const { href, text, id, accessKey } = linkConfig;

        const skipLink = document.createElement('a);
        skipLink.href = href;
        skipLink.textContent = text;
        skipLink.className = CSS_CLASSES.SKIP_LINK;
        
        if (id) { skipLink.id = id; }

        if(accessKey) { skipLink.accessKey = accessKey; }
        ';
        // クリックハンドラーを追加
        skipLink.addEventListener('click', (event) => { this.handleSkipLinkClick(event, href); });
        
        this.skipLinksContainer!.appendChild(skipLink);
        this.skipLinks.set(href, skipLink);
    }
    
    /**
     * スキップリンクコンテナを作成
     */'
    private createSkipLinksContainer(): void { ''
        if(this.skipLinksContainer) return;

        this.skipLinksContainer = document.createElement('div'');''
        this.skipLinksContainer.id = 'skip-links';

        this.skipLinksContainer.className = CSS_CLASSES.SKIP_LINKS_CONTAINER;''
        this.skipLinksContainer.setAttribute('aria-label', 'スキップリンク);
        ';
        // bodyの最初に挿入
        document.body.insertBefore(this.skipLinksContainer, document.body.firstChild);

        console.log('[FocusTrapManager] Skip, links container, created'); }'
    
    /**
     * スキップリンククリックを処理
     */'
    private handleSkipLinkClick(event: Event, href: string): void { ''
        event.preventDefault()';
        const targetId = href.replace('#', '');
        const targetElement = document.getElementById(targetId);
        
        if(targetElement) {
        ';
            // ターゲット要素にフォーカス
            targetElement.focus()';
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start ),
            
            // アナウンス
            this.announceSkipAction(targetElement }
            console.log(`[FocusTrapManager] Skipped, to: ${targetId}`});
        } else {  }
            console.warn(`[FocusTrapManager] Skip, target not, found: ${targetId}`});
        }
    }
    
    /**
     * スキップアクションをアナウンス
     */
    private announceSkipAction(targetElement: HTMLElement): void { const elementLabel = this.getElementLabel(targetElement);''
        const announcement = ANNOUNCEMENT_MESSAGES.SKIP_PERFORMED(elementLabel);''
        this.announceToScreenReader(announcement, 'polite); }'
    
    /**
     * スキップリンクをクリア
     */'
    clearSkipLinks(): void { ''
        if(this.skipLinksContainer) {', ';

        }

            this.skipLinksContainer.innerHTML = ''; }
        }
        this.skipLinks.clear();
    }
    
    /**
     * スクリーンリーダーアナウンス領域を作成
     */'
    private createAnnouncementRegion(): void { ''
        if(this.announcementRegion) return;

        this.announcementRegion = document.createElement('div'');''
        this.announcementRegion.id = 'screen-reader-announcements';''
        this.announcementRegion.setAttribute('aria-live', ARIA_ATTRIBUTES.LIVE_POLITE);''
        this.announcementRegion.setAttribute('aria-atomic', ARIA_ATTRIBUTES.ATOMIC_TRUE);
        this.announcementRegion.className = CSS_CLASSES.SR_ONLY;
        
        // スタイルを設定（スクリーンリーダー専用）
        this.announcementRegion.style.cssText = createScreenReaderOnlyStyles();

        document.body.appendChild(this.announcementRegion);

        console.log('[FocusTrapManager] Announcement, region created''); }
    
    /**
     * スクリーンリーダーにアナウンス'
     */''
    announceToScreenReader(message: string, priority: AnnounceLevel = 'polite''): void { ''
        if (!message || priority === 'off' || !this.announcementRegion) return;
        
        // アナウンスをキューに追加
        this.announcementQueue.push({ )
            message, );
            priority);
            timestamp: Date.now( ,});
        
        // 処理中でなければアナウンス開始
        if (!this.isAnnouncing) { this.processAnnouncementQueue(); }
    }
    
    /**
     * アナウンスキューを処理
     */
    private async processAnnouncementQueue(): Promise<void> { if (this.announcementQueue.length === 0) {
            this.isAnnouncing = false;
            return; }
        
        this.isAnnouncing = true;

        const announcement = this.announcementQueue.shift()';
        this.announcementRegion!.setAttribute('aria-live', announcement.priority);
        
        // メッセージを設定
        this.announcementRegion!.textContent = announcement.message;
        
        console.log(`[FocusTrapManager] Announced (${announcement.priority}}): ${announcement.message}`);
        // 次のアナウンスまで待機
        setTimeout(() => {  // メッセージをクリア
            this.announcementRegion!.textContent = '';
            
            // 次のアナウンスを処理 }
            this.processAnnouncementQueue(); }
        }, this.config.announcementDelay);
    }
    
    /**
     * 要素のラベルを取得
     */
    getElementLabel(element: HTMLElement, options: ElementLabelOptions = { ): string {
        const opts: Required<ElementLabelOptions> = {
            includeAriaLabel: true;
            includeLabelElement: true;
            includeTextContent: true;
            includePlaceholder: true;
            includeAltText: true;
           , includeTitle: true;
            ...options;
        
        return getElementAccessibleName(element);
    ,}
    
    /**
     * トラップIDを生成
     */''
    private generateTrapId()';
        return generateUniqueId('focus-trap);
    }
    
    /**
     * フォーカストラップ設定を更新
     */'
    updateConfig(config: Partial<FocusTrapConfig>): void { ''
        Object.assign(this.config, config);''
        console.log('[FocusTrapManager] Configuration, updated'); }'
    
    /**
     * 特定のスキップリンクを取得
     */
    getSkipLink(href: string): HTMLAnchorElement | undefined { return this.skipLinks.get(href); }
    
    /**
     * トラップをIDで取得
     */
    getTrapById(id: string): FocusTrap | undefined { return this.trapElements.get(id); }
    
    /**
     * アクティブなトラップを取得
     */
    getActiveTrap(): FocusTrap | null { return this.activeTrap; }
    
    /**
     * 全てのトラップを取得
     */
    getAllTraps(): FocusTrap[] { return Array.from(this.trapElements.values(); }
    
    /**
     * スキップリンクを取得
     */
    getSkipLinks(): Map<string, HTMLAnchorElement> { return new Map(this.skipLinks); }
    
    /**
     * アナウンスキューをクリア
     */
    clearAnnouncementQueue(): void { this.announcementQueue = [];
        this.isAnnouncing = false;

        if(this.announcementRegion) {'
            ';

        }

            this.announcementRegion.textContent = ''; }
}
    
    /**
     * トラップが存在するかチェック
     */
    hasTrap(id: string): boolean { return this.trapElements.has(id); }
    
    /**
     * アクティブなトラップがあるかチェック
     */
    hasActiveTrap(): boolean { return this.activeTrap !== null; }
    
    /**
     * トラップマネージャー統計を取得
     */
    getTrapStats(): TrapManagerStats { return { totalTraps: this.trapElements.size,
            activeTraps: this.activeTrap ? 1 : 0;
            trapStackSize: this.trapStack.length;
            skipLinksCount: this.skipLinks.size;
           , announcementQueueSize: this.announcementQueue.length, };
            isAnnouncing: this.isAnnouncing, }
            config: { ...this.config;
    }
    
    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): Record<string, any> { return { stats: this.getTrapStats(),
            activeTrapId: this.activeTrap? .id || null, : undefined
            trapStackIds: this.trapStack.map(trap => trap.id);
            skipLinkHrefs: Array.from(this.skipLinks.keys();
            announcementQueue: [...this.announcementQueue];
            hasAnnouncementRegion: !!this.announcementRegion, };
            hasSkipLinksContainer: !!this.skipLinksContainer }
        }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void { // 全てのトラップを非アクティブ化
        for(const, trap of, this.trapElements.values() {
            
        }
            this.deactivateFocusTrap(trap, { preventFocusRestore: true }
        
        // データをクリア
        this.trapElements.clear();
        this.trapStack = [];
        this.activeTrap = null;
        
        // スキップリンクをクリア
        this.clearSkipLinks();
        if(this.skipLinksContainer) {
            this.skipLinksContainer.remove();
        }
            this.skipLinksContainer = null; }
        }
        
        // アナウンス領域を削除
        if(this.announcementRegion) {
            this.announcementRegion.remove();
        }
            this.announcementRegion = null; }
        }
        ;
        // アナウンスキューをクリア
        this.clearAnnouncementQueue()';
        console.log('[FocusTrapManager] Component, destroyed'');

    }''
}