import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * フォーカス管理クラス
 * 論理的なタブ順序とフォーカスリング管理を提供
 */
export class FocusManager {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager.gameEngine;
        
        // フォーカス管理状態
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.focusHistory = [];
        this.focusTraps = new Map();
        this.skipLinks = new Map();
        
        // フォーカス設定
        this.config = {
            autoUpdateElements: true,
            focusRingStyle: {
                width: 3,
                color: '#4A90E2',
                offset: 2,
                borderRadius: 4,
                animated: true
            },
            focusRingHighContrast: {
                width: 3,
                color: '#FFFF00',
                backgroundColor: '#000000',
                textColor: '#FFFFFF'
            },
            announcements: {
                enabled: true,
                delay: 100,
                maxLength: 200
            },
            navigation: {
                wrapAround: true,
                skipDisabled: true,
                respectTabIndex: true
            }
        };
        
        // 状態管理
        this.state = {
            isKeyboardMode: false,
            lastFocusedElement: null,
            focusTrapsActive: new Set(),
            pendingFocusChange: null,
            focusChangeInProgress: false
        };
        
        // イベントリスナー
        this.eventListeners = new Map();
        
        // DOM監視
        this.mutationObserver = null;
        
        console.log('FocusManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // フォーカススタイルの設定
            this.setupFocusStyles();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // スキップリンクの作成
            this.createSkipLinks();
            
            // フォーカス可能要素の初期更新
            this.updateFocusableElements();
            
            // DOM変更の監視
            this.setupMutationObserver();
            
            console.log('FocusManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * フォーカススタイルの設定
     */
    setupFocusStyles() {
        const styleId = 'focus-manager-styles';
        
        // 既存のスタイルを削除
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.generateFocusCSS();
        
        document.head.appendChild(style);
        console.log('Focus styles applied');
    }
    
    /**
     * フォーカス用CSS生成
     */
    generateFocusCSS() {
        const { focusRingStyle, focusRingHighContrast } = this.config;
        
        return `
            /* フォーカス表示のリセット */
            *:focus {
                outline: none;
            }
            
            /* 基本フォーカスリング */
            .focus-visible {
                outline: ${focusRingStyle.width}px solid ${focusRingStyle.color} !important;
                outline-offset: ${focusRingStyle.offset}px !important;
                border-radius: ${focusRingStyle.borderRadius}px !important;
                box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3) !important;
                ${focusRingStyle.animated ? 'transition: outline-color 0.2s ease, box-shadow 0.2s ease;' : ''}
            }
            
            /* ハイコントラストモード */
            .high-contrast .focus-visible,
            body.high-contrast .focus-visible {
                outline: ${focusRingHighContrast.width}px solid ${focusRingHighContrast.color} !important;
                background-color: ${focusRingHighContrast.backgroundColor} !important;
                color: ${focusRingHighContrast.textColor} !important;
                box-shadow: none !important;
            }
            
            /* スキップリンク */
            .skip-link {
                position: absolute;
                top: -1000px;
                left: -1000px;
                height: 1px;
                width: 1px;
                text-align: left;
                overflow: hidden;
                z-index: 9999;
                padding: 8px 16px;
                background: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 0 0 4px 0;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .skip-link:focus,
            .skip-link:active {
                top: 0;
                left: 0;
                height: auto;
                width: auto;
                overflow: visible;
                clip: unset;
            }
            
            .skip-link:hover {
                background: #333;
                transform: translateY(2px);
            }
            
            /* フォーカストラップ */
            .focus-trap-active {
                position: relative;
            }
            
            .focus-trap-active::before,
            .focus-trap-active::after {
                content: '';
                position: absolute;
                top: 0;
                width: 1px;
                height: 1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            /* キーボードモード検出 */
            body.keyboard-mode *:focus {
                outline: none;
            }
            
            body.keyboard-mode .focus-visible {
                display: block;
            }
            
            body:not(.keyboard-mode) .focus-visible {
                outline: none !important;
                box-shadow: none !important;
            }
            
            /* スクリーンリーダー専用 */
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
            
            /* アクセシブルボタン */
            .accessible-button {
                min-height: 44px;
                min-width: 44px;
                padding: 12px 16px;
                cursor: pointer;
                user-select: none;
            }
            
            .accessible-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        `;
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // フォーカスイベント
        document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
        document.addEventListener('focusout', this.handleFocusOut.bind(this), true);
        
        // キーボードイベント
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.addEventListener('keyup', this.handleKeyUp.bind(this), true);
        
        // マウスイベント（キーボードモード検出）
        document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), true);
        
        // ウィンドウイベント
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        
        console.log('Focus event listeners set up');
    }
    
    /**
     * スキップリンクの作成
     */
    createSkipLinks() {
        const skipLinksContainer = document.createElement('div');
        skipLinksContainer.id = 'skip-links';
        skipLinksContainer.setAttribute('role', 'navigation');
        skipLinksContainer.setAttribute('aria-label', 'スキップナビゲーション');
        
        const skipLinks = [
            {
                href: '#main-content',
                text: 'メインコンテンツへスキップ',
                id: 'skip-to-main'
            },
            {
                href: '#game-area',
                text: 'ゲーム領域へスキップ',
                id: 'skip-to-game'
            },
            {
                href: '#navigation',
                text: 'ナビゲーションへスキップ',
                id: 'skip-to-nav'
            },
            {
                href: '#settings',
                text: '設定へスキップ',
                id: 'skip-to-settings'
            }
        ];
        
        skipLinks.forEach(linkData => {
            const link = document.createElement('a');
            link.href = linkData.href;
            link.id = linkData.id;
            link.textContent = linkData.text;
            link.className = 'skip-link';
            link.tabIndex = 0;
            
            link.addEventListener('click', (event) => {
                this.handleSkipLinkClick(event, linkData.href);
            });
            
            skipLinksContainer.appendChild(link);
            this.skipLinks.set(linkData.id, link);
        });
        
        // ページの最初に挿入
        if (document.body.firstChild) {
            document.body.insertBefore(skipLinksContainer, document.body.firstChild);
        } else {
            document.body.appendChild(skipLinksContainer);
        }
        
        console.log('Skip links created');
    }
    
    /**
     * スキップリンククリックの処理
     */
    handleSkipLinkClick(event, targetHref) {
        event.preventDefault();
        
        const targetId = targetHref.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // ターゲット要素にフォーカス
            this.setFocus(targetElement);
            
            // スクリーンリーダーに通知
            this.announceSkipAction(targetElement);
        } else {
            console.warn(`Skip link target not found: ${targetId}`);
        }
    }
    
    /**
     * フォーカス可能要素の更新
     */
    updateFocusableElements() {
        try {
            const selector = [
                'button:not([disabled]):not([aria-hidden="true"])',
                'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
                'select:not([disabled]):not([aria-hidden="true"])',
                'textarea:not([disabled]):not([aria-hidden="true"])',
                'a[href]:not([aria-hidden="true"])',
                '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
                '[role="button"]:not([disabled]):not([aria-hidden="true"])',
                '[role="link"]:not([disabled]):not([aria-hidden="true"])',
                '[role="tab"]:not([disabled]):not([aria-hidden="true"])',
                'canvas[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
                '.focusable:not([disabled]):not([aria-hidden="true"])'
            ].join(', ');
            
            const allElements = Array.from(document.querySelectorAll(selector));
            
            // 表示されている要素のみをフィルタリング
            this.focusableElements = allElements.filter(element => {
                return this.isElementVisible(element) && this.isElementFocusable(element);
            });
            
            // タブ順序でソート
            this.sortElementsByTabOrder();
            
            console.log(`Updated focusable elements: ${this.focusableElements.length} elements found`);
            
            // 変更イベントを発行
            this.emit('focusableElementsUpdated', {
                count: this.focusableElements.length,
                elements: this.focusableElements.slice() // コピーを提供
            });
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'updateFocusableElements'
            });
        }
    }
    
    /**
     * 要素の表示状態をチェック
     */
    isElementVisible(element) {
        // 基本的な表示チェック
        if (!element.offsetParent && element.offsetHeight === 0 && element.offsetWidth === 0) {
            return false;
        }
        
        // CSS表示プロパティチェック
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }
        
        // 透明度チェック
        if (parseFloat(style.opacity) === 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 要素のフォーカス可能性をチェック
     */
    isElementFocusable(element) {
        // disabled属性チェック
        if (element.disabled || element.getAttribute('aria-disabled') === 'true') {
            return false;
        }
        
        // aria-hidden チェック
        if (element.getAttribute('aria-hidden') === 'true') {
            return false;
        }
        
        // tabindex チェック
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex === '-1') {
            return false;
        }
        
        // 親要素のinert属性チェック
        let parent = element.parentElement;
        while (parent) {
            if (parent.hasAttribute('inert') || parent.getAttribute('aria-hidden') === 'true') {
                return false;
            }
            parent = parent.parentElement;
        }
        
        return true;
    }
    
    /**
     * タブ順序でソート
     */
    sortElementsByTabOrder() {
        this.focusableElements.sort((a, b) => {
            const getTabIndex = (element) => {
                const tabIndex = element.getAttribute('tabindex');
                return tabIndex ? parseInt(tabIndex, 10) : 0;
            };
            
            const aTabIndex = getTabIndex(a);
            const bTabIndex = getTabIndex(b);
            
            // tabindex が設定されている要素を優先
            if (aTabIndex > 0 && bTabIndex <= 0) return -1;
            if (bTabIndex > 0 && aTabIndex <= 0) return 1;
            
            // 両方ともtabindexが設定されている場合
            if (aTabIndex > 0 && bTabIndex > 0) {
                return aTabIndex - bTabIndex;
            }
            
            // DOM順序を維持
            return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
    }
    
    /**
     * DOM変更の監視設定
     */
    setupMutationObserver() {
        if (!this.config.autoUpdateElements) return;
        
        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach(mutation => {
                // DOM構造の変更
                if (mutation.type === 'childList' && 
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    shouldUpdate = true;
                }
                
                // 属性の変更
                if (mutation.type === 'attributes') {
                    const relevantAttributes = ['tabindex', 'disabled', 'aria-hidden', 'aria-disabled'];
                    if (relevantAttributes.includes(mutation.attributeName)) {
                        shouldUpdate = true;
                    }
                }
            });
            
            if (shouldUpdate) {
                // デバウンス処理
                this.debounceUpdateElements();
            }
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled', 'aria-hidden', 'aria-disabled', 'inert']
        });
        
        console.log('DOM mutation observer set up');
    }
    
    /**
     * 要素更新のデバウンス処理
     */
    debounceUpdateElements() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        this.updateTimeout = setTimeout(() => {
            this.updateFocusableElements();
        }, 100);
    }
    
    /**
     * フォーカスイン処理
     */
    handleFocusIn(event) {
        const element = event.target;
        
        try {
            // 現在のフォーカス要素を更新
            this.state.lastFocusedElement = element;
            this.updateCurrentFocusIndex(element);
            
            // フォーカス履歴に追加
            this.addToFocusHistory(element);
            
            // キーボードモードでフォーカス表示を追加
            if (this.state.isKeyboardMode) {
                element.classList.add('focus-visible');
                this.announceElementFocus(element);
            }
            
            // フォーカスイベントを発行
            this.emit('focusChanged', {
                element: element,
                index: this.currentFocusIndex,
                keyboardMode: this.state.isKeyboardMode
            });
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'handleFocusIn',
                element: element.tagName
            });
        }
    }
    
    /**
     * フォーカスアウト処理
     */
    handleFocusOut(event) {
        const element = event.target;
        
        try {
            // フォーカス表示を削除
            element.classList.remove('focus-visible');
            
            // フォーカスアウトイベントを発行
            this.emit('focusLost', {
                element: element,
                index: this.currentFocusIndex
            });
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'handleFocusOut',
                element: element.tagName
            });
        }
    }
    
    /**
     * キーダウン処理
     */
    handleKeyDown(event) {
        this.state.isKeyboardMode = true;
        document.body.classList.add('keyboard-mode');
        
        try {
            // Tab キーナビゲーション
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
            
            // 矢印キーナビゲーション
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                this.handleArrowNavigation(event);
            }
            
            // Escape キー
            if (event.key === 'Escape') {
                this.handleEscapeKey(event);
            }
            
            // Enter/Space キー
            if (event.key === 'Enter' || event.key === ' ') {
                this.handleActivationKey(event);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'handleKeyDown',
                key: event.key
            });
        }
    }
    
    /**
     * キーアップ処理
     */
    handleKeyUp(event) {
        // キーアップ時の処理（必要に応じて）
    }
    
    /**
     * マウスダウン処理
     */
    handleMouseDown(event) {
        this.state.isKeyboardMode = false;
        document.body.classList.remove('keyboard-mode');
    }
    
    /**
     * タッチスタート処理
     */
    handleTouchStart(event) {
        this.state.isKeyboardMode = false;
        document.body.classList.remove('keyboard-mode');
    }
    
    /**
     * ウィンドウブラー処理
     */
    handleWindowBlur() {
        // アクティブなフォーカストラップをクリア
        this.state.focusTrapsActive.clear();
        this.emit('windowBlurred');
    }
    
    /**
     * ウィンドウフォーカス処理
     */
    handleWindowFocus() {
        // 必要に応じてフォーカスを復元
        if (this.state.lastFocusedElement && document.contains(this.state.lastFocusedElement)) {
            this.setFocus(this.state.lastFocusedElement);
        }
        this.emit('windowFocused');
    }
    
    /**
     * Tab ナビゲーション処理
     */
    handleTabNavigation(event) {
        // フォーカストラップがアクティブな場合の処理
        if (this.state.focusTrapsActive.size > 0) {
            const activeTrap = Array.from(this.state.focusTrapsActive)[0];
            if (this.handleFocusTrapNavigation(event, activeTrap)) {
                return;
            }
        }
        
        // 通常のTabナビゲーション
        const direction = event.shiftKey ? -1 : 1;
        const nextElement = this.getNextFocusableElement(direction);
        
        if (nextElement) {
            event.preventDefault();
            this.setFocus(nextElement);
        }
    }
    
    /**
     * 矢印キーナビゲーション処理
     */
    handleArrowNavigation(event) {
        // 2D ナビゲーションモードの場合
        if (this.accessibilityManager.config.keyboard.navigationMode === '2d') {
            event.preventDefault();
            
            const currentElement = document.activeElement;
            const direction = event.key;
            
            const nextElement = this.find2DNavigationTarget(currentElement, direction);
            if (nextElement) {
                this.setFocus(nextElement);
            }
        }
    }
    
    /**
     * Escape キー処理
     */
    handleEscapeKey(event) {
        // アクティブなフォーカストラップを解除
        if (this.state.focusTrapsActive.size > 0) {
            const activeTrap = Array.from(this.state.focusTrapsActive)[0];
            this.releaseFocusTrap(activeTrap);
            event.preventDefault();
            return;
        }
        
        // 前のフォーカス位置に戻る
        if (this.focusHistory.length > 1) {
            const previousElement = this.focusHistory[this.focusHistory.length - 2];
            if (document.contains(previousElement)) {
                this.setFocus(previousElement);
                event.preventDefault();
            }
        }
    }
    
    /**
     * アクティベーションキー処理
     */
    handleActivationKey(event) {
        const element = document.activeElement;
        
        // ボタンやリンクの場合はクリックイベントを発火
        if (element.tagName === 'BUTTON' || 
            element.tagName === 'A' || 
            element.getAttribute('role') === 'button') {
            
            if (event.key === 'Enter' || (event.key === ' ' && element.tagName === 'BUTTON')) {
                element.click();
                event.preventDefault();
            }
        }
    }
    
    /**
     * 次のフォーカス可能要素を取得
     */
    getNextFocusableElement(direction) {
        if (this.focusableElements.length === 0) {
            this.updateFocusableElements();
            if (this.focusableElements.length === 0) return null;
        }
        
        let nextIndex = this.currentFocusIndex + direction;
        
        // ラップアラウンド処理
        if (this.config.navigation.wrapAround) {
            if (nextIndex >= this.focusableElements.length) {
                nextIndex = 0;
            } else if (nextIndex < 0) {
                nextIndex = this.focusableElements.length - 1;
            }
        } else {
            nextIndex = Math.max(0, Math.min(nextIndex, this.focusableElements.length - 1));
        }
        
        return this.focusableElements[nextIndex];
    }
    
    /**
     * 2D ナビゲーションのターゲットを検索
     */
    find2DNavigationTarget(currentElement, direction) {
        const currentRect = currentElement.getBoundingClientRect();
        const candidates = this.focusableElements.filter(el => el !== currentElement);
        
        let bestCandidate = null;
        let bestScore = Infinity;
        
        candidates.forEach(candidate => {
            const candidateRect = candidate.getBoundingClientRect();
            const score = this.calculate2DNavigationScore(currentRect, candidateRect, direction);
            
            if (score < bestScore) {
                bestScore = score;
                bestCandidate = candidate;
            }
        });
        
        return bestCandidate;
    }
    
    /**
     * 2D ナビゲーションスコアの計算
     */
    calculate2DNavigationScore(currentRect, candidateRect, direction) {
        const currentCenter = {
            x: currentRect.left + currentRect.width / 2,
            y: currentRect.top + currentRect.height / 2
        };
        
        const candidateCenter = {
            x: candidateRect.left + candidateRect.width / 2,
            y: candidateRect.top + candidateRect.height / 2
        };
        
        const dx = candidateCenter.x - currentCenter.x;
        const dy = candidateCenter.y - currentCenter.y;
        
        // 方向に基づくフィルタリング
        switch (direction) {
            case 'ArrowUp':
                if (dy >= 0) return Infinity; // 上方向以外は除外
                return Math.abs(dx) + Math.abs(dy) * 2; // 垂直距離を重視
                
            case 'ArrowDown':
                if (dy <= 0) return Infinity;
                return Math.abs(dx) + Math.abs(dy) * 2;
                
            case 'ArrowLeft':
                if (dx >= 0) return Infinity;
                return Math.abs(dx) * 2 + Math.abs(dy); // 水平距離を重視
                
            case 'ArrowRight':
                if (dx <= 0) return Infinity;
                return Math.abs(dx) * 2 + Math.abs(dy);
                
            default:
                return Math.sqrt(dx * dx + dy * dy); // ユークリッド距離
        }
    }
    
    /**
     * フォーカスの設定
     */
    setFocus(element, options = {}) {
        if (!element || !document.contains(element)) {
            console.warn('Cannot set focus: element is null or not in document');
            return false;
        }
        
        try {
            // フォーカス変更中フラグを設定
            this.state.focusChangeInProgress = true;
            
            // スムーズスクロール（オプション）
            if (options.scroll !== false) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
            
            // フォーカスを設定
            element.focus();
            
            // aria-live 領域での通知（オプション）
            if (options.announce !== false && this.config.announcements.enabled) {
                setTimeout(() => {
                    this.announceElementFocus(element);
                }, this.config.announcements.delay);
            }
            
            this.state.focusChangeInProgress = false;
            return true;
            
        } catch (error) {
            this.state.focusChangeInProgress = false;
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'setFocus',
                element: element.tagName
            });
            return false;
        }
    }
    
    /**
     * 現在のフォーカスインデックスを更新
     */
    updateCurrentFocusIndex(element) {
        const index = this.focusableElements.indexOf(element);
        if (index !== -1) {
            this.currentFocusIndex = index;
        } else {
            // 要素リストを更新して再試行
            this.updateFocusableElements();
            this.currentFocusIndex = this.focusableElements.indexOf(element);
        }
    }
    
    /**
     * フォーカス履歴に追加
     */
    addToFocusHistory(element) {
        // 重複を避ける
        const lastElement = this.focusHistory[this.focusHistory.length - 1];
        if (lastElement !== element) {
            this.focusHistory.push(element);
            
            // 履歴サイズを制限
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        }
    }
    
    /**
     * 要素フォーカスのアナウンス
     */
    announceElementFocus(element) {
        try {
            const announcement = this.generateFocusAnnouncement(element);
            if (announcement && this.accessibilityManager.getManager) {
                const screenReaderManager = this.accessibilityManager.getManager('screenReader');
                if (screenReaderManager && screenReaderManager.announce) {
                    screenReaderManager.announce(announcement, 'polite');
                }
            }
        } catch (error) {
            console.warn('Failed to announce element focus:', error);
        }
    }
    
    /**
     * フォーカスアナウンスメントの生成
     */
    generateFocusAnnouncement(element) {
        let text = '';
        
        // ラベルの取得
        const label = this.getElementLabel(element);
        if (label) {
            text += label;
        }
        
        // 役割の取得
        const role = this.getElementRole(element);
        if (role && role !== 'generic') {
            text += `, ${role}`;
        }
        
        // 状態の取得
        const state = this.getElementState(element);
        if (state) {
            text += `, ${state}`;
        }
        
        // 位置情報
        const position = `${this.currentFocusIndex + 1} / ${this.focusableElements.length}`;
        text += `, 位置: ${position}`;
        
        return text.trim();
    }
    
    /**
     * 要素ラベルの取得
     */
    getElementLabel(element) {
        // aria-label
        if (element.getAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }
        
        // aria-labelledby
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelElement = document.getElementById(labelledBy);
            if (labelElement) {
                return labelElement.textContent;
            }
        }
        
        // label 要素
        const labelFor = document.querySelector(`label[for="${element.id}"]`);
        if (labelFor) {
            return labelFor.textContent;
        }
        
        // テキストコンテンツ
        if (element.textContent && element.textContent.trim()) {
            return element.textContent.trim();
        }
        
        // alt 属性
        if (element.getAttribute('alt')) {
            return element.getAttribute('alt');
        }
        
        // title 属性
        if (element.getAttribute('title')) {
            return element.getAttribute('title');
        }
        
        return element.tagName.toLowerCase();
    }
    
    /**
     * 要素の役割を取得
     */
    getElementRole(element) {
        // aria-role
        const role = element.getAttribute('role');
        if (role) {
            return role;
        }
        
        // デフォルトの役割
        const tagRoles = {
            'button': 'ボタン',
            'input': '入力フィールド',
            'select': '選択',
            'textarea': 'テキストエリア',
            'a': 'リンク',
            'h1': '見出しレベル1',
            'h2': '見出しレベル2',
            'h3': '見出しレベル3',
            'h4': '見出しレベル4',
            'h5': '見出しレベル5',
            'h6': '見出しレベル6'
        };
        
        return tagRoles[element.tagName.toLowerCase()] || '';
    }
    
    /**
     * 要素の状態を取得
     */
    getElementState(element) {
        const states = [];
        
        if (element.disabled || element.getAttribute('aria-disabled') === 'true') {
            states.push('無効');
        }
        
        if (element.checked) {
            states.push('チェック済み');
        }
        
        if (element.getAttribute('aria-expanded') === 'true') {
            states.push('展開済み');
        } else if (element.getAttribute('aria-expanded') === 'false') {
            states.push('折りたたみ済み');
        }
        
        if (element.required) {
            states.push('必須');
        }
        
        return states.join(', ');
    }
    
    /**
     * スキップアクションのアナウンス
     */
    announceSkipAction(targetElement) {
        const label = this.getElementLabel(targetElement);
        const announcement = `${label}にスキップしました`;
        
        if (this.accessibilityManager.getManager) {
            const screenReaderManager = this.accessibilityManager.getManager('screenReader');
            if (screenReaderManager && screenReaderManager.announce) {
                screenReaderManager.announce(announcement, 'polite');
            }
        }
    }
    
    /**
     * フォーカストラップの作成
     */
    createFocusTrap(container, options = {}) {
        const trapId = options.id || `trap-${Date.now()}`;
        
        const trap = {
            id: trapId,
            container: container,
            options: {
                returnFocus: options.returnFocus !== false,
                escapeToClose: options.escapeToClose !== false,
                initialFocus: options.initialFocus || null
            },
            previousFocus: document.activeElement,
            isActive: false
        };
        
        this.focusTraps.set(trapId, trap);
        return trapId;
    }
    
    /**
     * フォーカストラップの活性化
     */
    activateFocusTrap(trapId) {
        const trap = this.focusTraps.get(trapId);
        if (!trap) {
            console.warn(`Focus trap not found: ${trapId}`);
            return false;
        }
        
        try {
            // 他のトラップを非活性化
            this.state.focusTrapsActive.forEach(id => {
                if (id !== trapId) {
                    this.deactivateFocusTrap(id);
                }
            });
            
            trap.isActive = true;
            this.state.focusTrapsActive.add(trapId);
            
            // コンテナにクラスを追加
            trap.container.classList.add('focus-trap-active');
            
            // 初期フォーカスを設定
            if (trap.options.initialFocus) {
                this.setFocus(trap.options.initialFocus);
            } else {
                // コンテナ内の最初のフォーカス可能要素にフォーカス
                const firstFocusable = this.getFirstFocusableInContainer(trap.container);
                if (firstFocusable) {
                    this.setFocus(firstFocusable);
                }
            }
            
            console.log(`Focus trap activated: ${trapId}`);
            this.emit('focusTrapActivated', { trapId, trap });
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'activateFocusTrap',
                trapId
            });
            return false;
        }
    }
    
    /**
     * フォーカストラップの非活性化
     */
    deactivateFocusTrap(trapId) {
        const trap = this.focusTraps.get(trapId);
        if (!trap || !trap.isActive) {
            return false;
        }
        
        try {
            trap.isActive = false;
            this.state.focusTrapsActive.delete(trapId);
            
            // コンテナからクラスを削除
            trap.container.classList.remove('focus-trap-active');
            
            // 前のフォーカスを復元
            if (trap.options.returnFocus && trap.previousFocus && document.contains(trap.previousFocus)) {
                this.setFocus(trap.previousFocus);
            }
            
            console.log(`Focus trap deactivated: ${trapId}`);
            this.emit('focusTrapDeactivated', { trapId, trap });
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_ERROR', {
                operation: 'deactivateFocusTrap',
                trapId
            });
            return false;
        }
    }
    
    /**
     * フォーカストラップの解放
     */
    releaseFocusTrap(trapId) {
        this.deactivateFocusTrap(trapId);
        this.focusTraps.delete(trapId);
    }
    
    /**
     * フォーカストラップナビゲーションの処理
     */
    handleFocusTrapNavigation(event, trapId) {
        const trap = this.focusTraps.get(trapId);
        if (!trap || !trap.isActive) {
            return false;
        }
        
        const focusableInTrap = this.getFocusableElementsInContainer(trap.container);
        if (focusableInTrap.length === 0) {
            return true; // トラップ内にフォーカス可能要素がない場合は移動を阻止
        }
        
        const currentIndex = focusableInTrap.indexOf(document.activeElement);
        let nextIndex;
        
        if (event.shiftKey) {
            // Shift+Tab（後方移動）
            nextIndex = currentIndex <= 0 ? focusableInTrap.length - 1 : currentIndex - 1;
        } else {
            // Tab（前方移動）
            nextIndex = currentIndex >= focusableInTrap.length - 1 ? 0 : currentIndex + 1;
        }
        
        event.preventDefault();
        this.setFocus(focusableInTrap[nextIndex]);
        return true;
    }
    
    /**
     * コンテナ内の最初のフォーカス可能要素を取得
     */
    getFirstFocusableInContainer(container) {
        const focusableInContainer = this.getFocusableElementsInContainer(container);
        return focusableInContainer[0] || null;
    }
    
    /**
     * コンテナ内のフォーカス可能要素を取得
     */
    getFocusableElementsInContainer(container) {
        const selector = [
            'button:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"]):not([disabled])',
            '[role="button"]:not([disabled])',
            '[role="link"]:not([disabled])'
        ].join(', ');
        
        const elements = Array.from(container.querySelectorAll(selector));
        return elements.filter(el => this.isElementVisible(el) && this.isElementFocusable(el));
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual) {
            // ハイコントラスト設定の適用
            if (config.visual.highContrast.enabled) {
                this.config.focusRingStyle = this.config.focusRingHighContrast;
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        }
        
        if (config.keyboard) {
            // キーボード設定の更新
            Object.assign(this.config.navigation, config.keyboard);
        }
        
        // スタイルの再適用
        this.setupFocusStyles();
        
        console.log('FocusManager configuration applied');
    }
    
    /**
     * イベントエミッター機能
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in FocusManager event listener for ${event}:`, error);
                }
            });
        }
    }
    
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }
    
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return {
            focusableElementsCount: this.focusableElements.length,
            currentFocusIndex: this.currentFocusIndex,
            keyboardMode: this.state.isKeyboardMode,
            activeFocusTraps: Array.from(this.state.focusTrapsActive),
            skipLinksCount: this.skipLinks.size,
            focusHistoryLength: this.focusHistory.length
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        // 実装は必要に応じて
        console.log(`FocusManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying FocusManager...');
        
        // イベントリスナーの削除
        document.removeEventListener('focusin', this.handleFocusIn, true);
        document.removeEventListener('focusout', this.handleFocusOut, true);
        document.removeEventListener('keydown', this.handleKeyDown, true);
        document.removeEventListener('keyup', this.handleKeyUp, true);
        document.removeEventListener('mousedown', this.handleMouseDown, true);
        document.removeEventListener('touchstart', this.handleTouchStart, true);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
        
        // MutationObserverの停止
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // タイマーのクリア
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        // フォーカストラップのクリーンアップ
        this.focusTraps.forEach((trap, id) => {
            this.releaseFocusTrap(id);
        });
        
        // スタイル要素の削除
        const styleElement = document.getElementById('focus-manager-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // スキップリンクの削除
        const skipLinksContainer = document.getElementById('skip-links');
        if (skipLinksContainer) {
            skipLinksContainer.remove();
        }
        
        // データのクリア
        this.focusableElements = [];
        this.focusHistory = [];
        this.focusTraps.clear();
        this.skipLinks.clear();
        this.eventListeners.clear();
        
        console.log('FocusManager destroyed');
    }
}