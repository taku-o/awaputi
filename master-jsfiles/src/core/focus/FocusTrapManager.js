/**
 * FocusTrapManager
 * フォーカストラップ作成・管理、スキップリンク処理、モーダルフォーカス封じ込め、アクセシビリティアナウンスを担当
 */
export class FocusTrapManager {
    constructor(focusManager) {
        this.focusManager = focusManager;
        this.gameEngine = focusManager.gameEngine;
        
        // フォーカストラップ管理
        this.activeTrap = null;
        this.trapStack = [];
        this.trapElements = new Map();
        
        // スキップリンク管理
        this.skipLinks = new Map();
        this.skipLinksContainer = null;
        
        // アナウンス管理
        this.announcementRegion = null;
        this.announcementQueue = [];
        this.isAnnouncing = false;
        
        // 設定
        this.config = {
            allowEscapeKey: true,
            wrapFocus: true,
            autoFocus: true,
            restoreFocus: true,
            skipLinksEnabled: true,
            announcementDelay: 100
        };
        
        console.log('[FocusTrapManager] Component initialized');
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.createAnnouncementRegion();
        this.createSkipLinksContainer();
        
        console.log('[FocusTrapManager] Initialization completed');
    }
    
    /**
     * フォーカストラップを作成
     * @param {HTMLElement} container トラップするコンテナ要素
     * @param {Object} options トラップオプション
     * @returns {Object} トラップオブジェクト
     */
    createFocusTrap(container, options = {}) {
        if (!container) {
            console.error('[FocusTrapManager] Container element is required');
            return null;
        }
        
        try {
            const trapConfig = {
                container,
                ...this.config,
                ...options
            };
            
            const trap = {
                id: this.generateTrapId(),
                container,
                config: trapConfig,
                focusableElements: [],
                firstFocusableElement: null,
                lastFocusableElement: null,
                previouslyFocusedElement: document.activeElement,
                isActive: false,
                handleKeyDown: this.createTrapKeyDownHandler(trap),
                handleFocusIn: this.createTrapFocusInHandler(trap),
                handleFocusOut: this.createTrapFocusOutHandler(trap)
            };
            
            // フォーカス可能要素を更新
            this.updateTrapElements(trap);
            
            // トラップを登録
            this.trapElements.set(trap.id, trap);
            
            console.log(`[FocusTrapManager] Focus trap created with ID: ${trap.id}`);
            return trap;
            
        } catch (error) {
            console.error('[FocusTrapManager] Error creating focus trap:', error);
            return null;
        }
    }
    
    /**
     * フォーカストラップを有効化
     * @param {Object} trap トラップオブジェクト
     */
    activateFocusTrap(trap) {
        if (!trap || trap.isActive) return;
        
        try {
            // 前のトラップを非アクティブ化
            if (this.activeTrap) {
                this.deactivateFocusTrap(this.activeTrap, false);
                this.trapStack.push(this.activeTrap);
            }
            
            // トラップを有効化
            trap.isActive = true;
            this.activeTrap = trap;
            
            // イベントリスナーを追加
            document.addEventListener('keydown', trap.handleKeyDown, true);
            trap.container.addEventListener('focusin', trap.handleFocusIn);
            trap.container.addEventListener('focusout', trap.handleFocusOut);
            
            // コンテナにクラスを追加
            trap.container.classList.add('focus-trap-active');
            
            // 最初の要素にフォーカス
            if (trap.config.autoFocus && trap.firstFocusableElement) {
                trap.firstFocusableElement.focus();
            }
            
            // アナウンス
            this.announceToScreenReader('ダイアログが開きました。Escapeキーで閉じることができます。', 'polite');
            
            console.log(`[FocusTrapManager] Focus trap activated: ${trap.id}`);
            
        } catch (error) {
            console.error('[FocusTrapManager] Error activating focus trap:', error);
        }
    }
    
    /**
     * フォーカストラップを非アクティブ化
     * @param {Object} trap トラップオブジェクト
     * @param {boolean} restoreFocus フォーカスを復元するか
     */
    deactivateFocusTrap(trap, restoreFocus = true) {
        if (!trap || !trap.isActive) return;
        
        try {
            // トラップを非アクティブ化
            trap.isActive = false;
            
            // イベントリスナーを削除
            document.removeEventListener('keydown', trap.handleKeyDown, true);
            trap.container.removeEventListener('focusin', trap.handleFocusIn);
            trap.container.removeEventListener('focusout', trap.handleFocusOut);
            
            // コンテナからクラスを削除
            trap.container.classList.remove('focus-trap-active');
            
            // フォーカスを復元
            if (restoreFocus && trap.config.restoreFocus && trap.previouslyFocusedElement) {
                trap.previouslyFocusedElement.focus();
            }
            
            // アクティブトラップを更新
            if (this.activeTrap === trap) {
                this.activeTrap = null;
                
                // スタックから前のトラップを復元
                if (this.trapStack.length > 0) {
                    const previousTrap = this.trapStack.pop();
                    this.activateFocusTrap(previousTrap);
                }
            }
            
            console.log(`[FocusTrapManager] Focus trap deactivated: ${trap.id}`);
            
        } catch (error) {
            console.error('[FocusTrapManager] Error deactivating focus trap:', error);
        }
    }
    
    /**
     * フォーカストラップを削除
     * @param {Object} trap トラップオブジェクト
     */
    releaseFocusTrap(trap) {
        if (!trap) return;
        
        // 非アクティブ化
        this.deactivateFocusTrap(trap);
        
        // トラップを削除
        this.trapElements.delete(trap.id);
        
        console.log(`[FocusTrapManager] Focus trap released: ${trap.id}`);
    }
    
    /**
     * トラップ内のフォーカス可能要素を更新
     * @param {Object} trap トラップオブジェクト
     */
    updateTrapElements(trap) {
        if (!trap) return;
        
        const focusableElements = this.focusManager.navigation.getFocusableElementsInContainer(trap.container);
        
        trap.focusableElements = focusableElements;
        trap.firstFocusableElement = focusableElements[0] || null;
        trap.lastFocusableElement = focusableElements[focusableElements.length - 1] || null;
    }
    
    /**
     * トラップのキーダウンハンドラーを作成
     * @param {Object} trap トラップオブジェクト
     * @returns {Function} ハンドラー関数
     */
    createTrapKeyDownHandler(trap) {
        return (event) => {
            if (!trap.isActive) return;
            
            const { key, shiftKey } = event;
            
            // Escapeキーでトラップを閉じる
            if (key === 'Escape' && trap.config.allowEscapeKey) {
                event.preventDefault();
                this.deactivateFocusTrap(trap);
                return;
            }
            
            // Tabキーでフォーカス循環
            if (key === 'Tab' && trap.config.wrapFocus) {
                this.handleFocusTrapNavigation(event, trap, shiftKey);
            }
        };
    }
    
    /**
     * トラップのフォーカスインハンドラーを作成
     * @param {Object} trap トラップオブジェクト
     * @returns {Function} ハンドラー関数
     */
    createTrapFocusInHandler(trap) {
        return (event) => {
            if (!trap.isActive) return;
            
            // トラップ外からのフォーカスを防ぐ
            if (!trap.container.contains(event.target)) {
                event.preventDefault();
                if (trap.firstFocusableElement) {
                    trap.firstFocusableElement.focus();
                }
            }
        };
    }
    
    /**
     * トラップのフォーカスアウトハンドラーを作成
     * @param {Object} trap トラップオブジェクト
     * @returns {Function} ハンドラー関数
     */
    createTrapFocusOutHandler(trap) {
        return (event) => {
            if (!trap.isActive) return;
            
            // フォーカスがトラップから完全に外れた場合
            if (!trap.container.contains(event.relatedTarget)) {
                setTimeout(() => {
                    if (trap.isActive && !trap.container.contains(document.activeElement)) {
                        if (trap.firstFocusableElement) {
                            trap.firstFocusableElement.focus();
                        }
                    }
                }, 0);
            }
        };
    }
    
    /**
     * フォーカストラップナビゲーションを処理
     * @param {KeyboardEvent} event キーボードイベント
     * @param {Object} trap トラップオブジェクト
     * @param {boolean} reverse 逆方向かどうか
     */
    handleFocusTrapNavigation(event, trap, reverse) {
        if (!trap.firstFocusableElement || !trap.lastFocusableElement) return;
        
        const currentElement = document.activeElement;
        
        if (reverse) {
            // Shift+Tab: 最初の要素から最後の要素に循環
            if (currentElement === trap.firstFocusableElement) {
                event.preventDefault();
                trap.lastFocusableElement.focus();
            }
        } else {
            // Tab: 最後の要素から最初の要素に循環
            if (currentElement === trap.lastFocusableElement) {
                event.preventDefault();
                trap.firstFocusableElement.focus();
            }
        }
    }
    
    /**
     * スキップリンクを作成
     * @param {Object} skipLinkConfig スキップリンク設定
     */
    createSkipLinks(skipLinkConfig = {}) {
        if (!this.config.skipLinksEnabled) return;
        
        const defaultSkipLinks = [
            { href: '#main-content', text: 'メインコンテンツにスキップ' },
            { href: '#game-area', text: 'ゲームエリアにスキップ' },
            { href: '#navigation', text: 'ナビゲーションにスキップ' },
            { href: '#settings', text: '設定にスキップ' }
        ];
        
        const skipLinksToCreate = skipLinkConfig.links || defaultSkipLinks;
        
        // 既存のスキップリンクをクリア
        this.clearSkipLinks();
        
        for (const linkConfig of skipLinksToCreate) {
            this.createSkipLink(linkConfig);
        }
        
        console.log(`[FocusTrapManager] Created ${skipLinksToCreate.length} skip links`);
    }
    
    /**
     * 個別のスキップリンクを作成
     * @param {Object} linkConfig リンク設定
     */
    createSkipLink(linkConfig) {
        const { href, text, id } = linkConfig;
        
        const skipLink = document.createElement('a');
        skipLink.href = href;
        skipLink.textContent = text;
        skipLink.className = 'skip-link';
        
        if (id) {
            skipLink.id = id;
        }
        
        // クリックハンドラーを追加
        skipLink.addEventListener('click', (event) => {
            this.handleSkipLinkClick(event, href);
        });
        
        this.skipLinksContainer.appendChild(skipLink);
        this.skipLinks.set(href, skipLink);
    }
    
    /**
     * スキップリンクコンテナを作成
     */
    createSkipLinksContainer() {
        if (this.skipLinksContainer) return;
        
        this.skipLinksContainer = document.createElement('div');
        this.skipLinksContainer.id = 'skip-links';
        this.skipLinksContainer.className = 'skip-links-container';
        this.skipLinksContainer.setAttribute('aria-label', 'スキップリンク');
        
        // bodyの最初に挿入
        document.body.insertBefore(this.skipLinksContainer, document.body.firstChild);
        
        console.log('[FocusTrapManager] Skip links container created');
    }
    
    /**
     * スキップリンククリックを処理
     * @param {Event} event クリックイベント
     * @param {string} href リンク先
     */
    handleSkipLinkClick(event, href) {
        event.preventDefault();
        
        const targetId = href.replace('#', '');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // ターゲット要素にフォーカス
            targetElement.focus();
            
            // スクロール調整
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // アナウンス
            this.announceSkipAction(targetElement);
            
            console.log(`[FocusTrapManager] Skipped to: ${targetId}`);
        } else {
            console.warn(`[FocusTrapManager] Skip target not found: ${targetId}`);
        }
    }
    
    /**
     * スキップアクションをアナウンス
     * @param {HTMLElement} targetElement ターゲット要素
     */
    announceSkipAction(targetElement) {
        const elementLabel = this.getElementLabel(targetElement);
        const announcement = `${elementLabel}にスキップしました`;
        this.announceToScreenReader(announcement, 'polite');
    }
    
    /**
     * スキップリンクをクリア
     */
    clearSkipLinks() {
        if (this.skipLinksContainer) {
            this.skipLinksContainer.innerHTML = '';
        }
        this.skipLinks.clear();
    }
    
    /**
     * スクリーンリーダーアナウンス領域を作成
     */
    createAnnouncementRegion() {
        if (this.announcementRegion) return;
        
        this.announcementRegion = document.createElement('div');
        this.announcementRegion.id = 'screen-reader-announcements';
        this.announcementRegion.setAttribute('aria-live', 'polite');
        this.announcementRegion.setAttribute('aria-atomic', 'true');
        this.announcementRegion.className = 'sr-only';
        
        // スタイルを設定（スクリーンリーダー専用）
        this.announcementRegion.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        
        document.body.appendChild(this.announcementRegion);
        
        console.log('[FocusTrapManager] Announcement region created');
    }
    
    /**
     * スクリーンリーダーにアナウンス
     * @param {string} message アナウンスメッセージ
     * @param {string} priority 優先度 ('polite' | 'assertive')
     */
    announceToScreenReader(message, priority = 'polite') {
        if (!message || !this.announcementRegion) return;
        
        // アナウンスをキューに追加
        this.announcementQueue.push({ message, priority });
        
        // 処理中でなければアナウンス開始
        if (!this.isAnnouncing) {
            this.processAnnouncementQueue();
        }
    }
    
    /**
     * アナウンスキューを処理
     */
    async processAnnouncementQueue() {
        if (this.announcementQueue.length === 0) {
            this.isAnnouncing = false;
            return;
        }
        
        this.isAnnouncing = true;
        
        const { message, priority } = this.announcementQueue.shift();
        
        // aria-liveを設定
        this.announcementRegion.setAttribute('aria-live', priority);
        
        // メッセージを設定
        this.announcementRegion.textContent = message;
        
        console.log(`[FocusTrapManager] Announced (${priority}): ${message}`);
        
        // 次のアナウンスまで待機
        setTimeout(() => {
            // メッセージをクリア
            this.announcementRegion.textContent = '';
            
            // 次のアナウンスを処理
            this.processAnnouncementQueue();
        }, this.config.announcementDelay);
    }
    
    /**
     * 要素のラベルを取得
     * @param {HTMLElement} element 対象要素
     * @returns {string} 要素ラベル
     */
    getElementLabel(element) {
        if (!element) return '';
        
        // aria-labelまたはaria-labelledby
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelElement = document.getElementById(labelledBy);
            if (labelElement) return labelElement.textContent.trim();
        }
        
        // ラベル要素
        if (element.labels && element.labels.length > 0) {
            return element.labels[0].textContent.trim();
        }
        
        // テキストコンテンツ
        const textContent = element.textContent.trim();
        if (textContent) return textContent;
        
        // プレースホルダー
        const placeholder = element.getAttribute('placeholder');
        if (placeholder) return placeholder;
        
        // alt属性
        const alt = element.getAttribute('alt');
        if (alt) return alt;
        
        // title属性
        const title = element.getAttribute('title');
        if (title) return title;
        
        // フォールバック
        return element.tagName.toLowerCase();
    }
    
    /**
     * トラップIDを生成
     * @returns {string} 一意のトラップID
     */
    generateTrapId() {
        return `focus-trap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * フォーカストラップ設定を更新
     * @param {Object} config 新しい設定
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        console.log('[FocusTrapManager] Configuration updated');
    }
    
    /**
     * アクティブなトラップを取得
     * @returns {Object|null} アクティブなトラップ
     */
    getActiveTrap() {
        return this.activeTrap;
    }
    
    /**
     * 全てのトラップを取得
     * @returns {Array} トラップ配列
     */
    getAllTraps() {
        return Array.from(this.trapElements.values());
    }
    
    /**
     * スキップリンクを取得
     * @returns {Map} スキップリンクマップ
     */
    getSkipLinks() {
        return new Map(this.skipLinks);
    }
    
    /**
     * トラップマネージャー統計を取得
     * @returns {Object} 統計情報
     */
    getTrapStats() {
        return {
            totalTraps: this.trapElements.size,
            activeTraps: this.activeTrap ? 1 : 0,
            trapStackSize: this.trapStack.length,
            skipLinksCount: this.skipLinks.size,
            announcementQueueSize: this.announcementQueue.length,
            isAnnouncing: this.isAnnouncing,
            config: { ...this.config }
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        // 全てのトラップを非アクティブ化
        for (const trap of this.trapElements.values()) {
            this.deactivateFocusTrap(trap, false);
        }
        
        // データをクリア
        this.trapElements.clear();
        this.trapStack = [];
        this.activeTrap = null;
        
        // スキップリンクをクリア
        this.clearSkipLinks();
        if (this.skipLinksContainer) {
            this.skipLinksContainer.remove();
            this.skipLinksContainer = null;
        }
        
        // アナウンス領域を削除
        if (this.announcementRegion) {
            this.announcementRegion.remove();
            this.announcementRegion = null;
        }
        
        // アナウンスキューをクリア
        this.announcementQueue = [];
        this.isAnnouncing = false;
        
        console.log('[FocusTrapManager] Component destroyed');
    }
}