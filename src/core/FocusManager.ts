import { FocusNavigation } from './focus/FocusNavigation.js';
import { FocusRingRenderer } from './focus/FocusRingRenderer.js';
import { FocusTrapManager } from './focus/FocusTrapManager.js';

/**
 * FocusManager (Main Controller)
 * フォーカス管理システムの中央制御クラス
 * Main Controller Patternによる軽量オーケストレーター
 */

// 型定義
interface FocusConfig {
    autoUpdateElements: boolean;
    focusRingStyle: {
        width: number;
        color: string;
        offset: number;
        borderRadius: number;
        animated: boolean;
    };
    focusRingHighContrast: {
        width: number;
        color: string;
        backgroundColor: string;
        textColor: string;
    };
    announcements: {
        enabled: boolean;
        delay: number;
        maxLength: number;
    };
    navigation: {
        wrapAround: boolean;
        skipDisabled: boolean;
        respectTabIndex: boolean;
    };
}

interface FocusState {
    isKeyboardMode: boolean;
    lastFocusedElement: Element | null;
    focusChangeInProgress: boolean;
    enabled: boolean;
}
export class FocusManager {
    private accessibilityManager: any;
    private gameEngine: any;
    private config: FocusConfig;
    private state: FocusState;
    private navigation: FocusNavigation;
    private renderer: FocusRingRenderer;
    private trapManager: FocusTrapManager;
    private listeners: Map<string, Function[]>;

    constructor(accessibilityManager: any) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager.gameEngine;
        
        // 基本設定
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
            focusChangeInProgress: false,
            enabled: true
        };
        
        // イベントリスナー管理
        this.eventListeners = new Map();
        this.mutationObserver = null;
        this.updateTimeout = null;
        
        // サブコンポーネントの初期化（依存注入）
        this.navigation = new FocusNavigation(this);
        this.renderer = new FocusRingRenderer(this);
        this.trapManager = new FocusTrapManager(this);
        
        console.log('[FocusManager] Main Controller initialized with sub-components');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // サブコンポーネントの初期化
            this.renderer.initialize();
            this.trapManager.initialize();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // フォーカス可能要素の初期更新
            this.updateFocusableElements();
            
            // DOM変更の監視
            this.setupMutationObserver();
            
            console.log('[FocusManager] Initialization completed successfully');
        } catch (error) {
            this.handleError(error, 'FOCUS_INITIALIZATION_ERROR');
        }
    }
    
    /**
     * フォーカススタイルの設定（レンダラーに委譲）
     */
    setupFocusStyles() {
        this.renderer.setupFocusStyles();
        console.log('[FocusManager] Focus styles delegated to renderer');
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
        
        // マウス・タッチイベント（キーボードモード検出）
        document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), true);
        
        // ウィンドウイベント
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        
        console.log('[FocusManager] Event listeners set up');
    }
    
    /**
     * スキップリンクの作成（トラップマネージャーに委譲）
     */
    createSkipLinks() {
        this.trapManager.createSkipLinks();
        console.log('[FocusManager] Skip links creation delegated to trap manager');
    }
    
    /**
     * フォーカス可能要素の更新（ナビゲーションに委譲）
     */
    updateFocusableElements() {
        this.navigation.updateFocusableElements();
        console.log('[FocusManager] Focusable elements update delegated to navigation');
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
                this.debounceUpdateElements();
            }
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled', 'aria-hidden', 'aria-disabled', 'inert']
        });
        
        console.log('[FocusManager] DOM mutation observer set up');
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
    
    // ========== イベントハンドラー ==========
    
    /**
     * フォーカスイン処理
     */
    handleFocusIn(event) {
        const element = event.target;
        
        try {
            // 現在のフォーカス要素を更新
            this.state.lastFocusedElement = element;
            
            // キーボードモードでフォーカス表示を追加
            if (this.state.isKeyboardMode) {
                this.renderer.renderFocusRing(element);
                this.announceElementFocus(element);
            }
            
            // フォーカスイベントを発行
            this.emit('focusChanged', {
                element: element,
                keyboardMode: this.state.isKeyboardMode
            });
            
        } catch (error) {
            this.handleError(error, 'FOCUS_IN_ERROR', { element: element.tagName });
        }
    }
    
    /**
     * フォーカスアウト処理
     */
    handleFocusOut(event) {
        const element = event.target;
        
        try {
            // フォーカス表示を削除
            this.renderer.removeFocusRing(element);
            
            // フォーカスアウトイベントを発行
            this.emit('focusLost', {
                element: element
            });
            
        } catch (error) {
            this.handleError(error, 'FOCUS_OUT_ERROR', { element: element.tagName });
        }
    }
    
    /**
     * キーダウン処理
     */
    handleKeyDown(event) {
        this.state.isKeyboardMode = true;
        document.body.classList.add('keyboard-mode');
        
        try {
            // ナビゲーションに委譲
            const handled = this.navigation.handleKeyboardNavigation(event);
            
            if (!handled) {
                // Escapeキー処理
                if (event.key === 'Escape') {
                    this.handleEscapeKey(event);
                }
                
                // Enter/Spaceキー処理
                if (event.key === 'Enter' || event.key === ' ') {
                    this.handleActivationKey(event);
                }
            }
            
        } catch (error) {
            this.handleError(error, 'KEY_DOWN_ERROR', { key: event.key });
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
     * Escapeキー処理
     */
    handleEscapeKey(event) {
        // アクティブなフォーカストラップを解除
        const activeTrap = this.trapManager.getActiveTrap();
        if (activeTrap) {
            this.trapManager.deactivateFocusTrap(activeTrap);
            event.preventDefault();
            return;
        }
        
        // 前のフォーカス位置に戻る
        const focusHistory = this.navigation.getFocusHistory(2);
        if (focusHistory.length > 1) {
            const previousElement = focusHistory[1];
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
    
    // ========== 公開API（後方互換性維持） ==========
    
    /**
     * フォーカスの設定
     * @param {HTMLElement} element フォーカスする要素
     * @param {Object} options オプション
     * @returns {boolean} 成功したかどうか
     */
    setFocus(element, options = {}) {
        if (!element || !document.contains(element)) {
            console.warn('[FocusManager] Cannot set focus: element is null or not in document');
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
            
            // ナビゲーションに委譲してフォーカスを設定
            this.navigation.setFocus(element);
            
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
            this.handleError(error, 'SET_FOCUS_ERROR', { element: element.tagName });
            return false;
        }
    }
    
    /**
     * 要素フォーカスのアナウンス（トラップマネージャーに委譲）
     */
    announceElementFocus(element) {
        try {
            const label = this.getElementLabel(element);
            const role = this.getElementRole(element);
            const state = this.getElementState(element);
            
            let announcement = label;
            if (role && role !== 'generic') {
                announcement += `, ${role}`;
            }
            if (state) {
                announcement += `, ${state}`;
            }
            
            this.trapManager.announceToScreenReader(announcement, 'polite');
            
        } catch (error) {
            console.warn('[FocusManager] Failed to announce element focus:', error);
        }
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
    
    // ========== フォーカストラップ関連（トラップマネージャーに委譲） ==========
    
    /**
     * フォーカストラップの作成
     */
    createFocusTrap(container, options = {}) {
        return this.trapManager.createFocusTrap(container, options);
    }
    
    /**
     * フォーカストラップの活性化
     */
    activateFocusTrap(trap) {
        return this.trapManager.activateFocusTrap(trap);
    }
    
    /**
     * フォーカストラップの非活性化
     */
    deactivateFocusTrap(trap) {
        return this.trapManager.deactivateFocusTrap(trap);
    }
    
    /**
     * フォーカストラップの解放
     */
    releaseFocusTrap(trap) {
        return this.trapManager.releaseFocusTrap(trap);
    }
    
    /**
     * コンテナ内のフォーカス可能要素を取得（ナビゲーションに委譲）
     */
    getFocusableElementsInContainer(container) {
        return this.navigation.getFocusableElementsInContainer ?
               this.navigation.getFocusableElementsInContainer(container) :
               [];
    }
    
    /**
     * コンテナ内の最初のフォーカス可能要素を取得（ナビゲーションに委譲）
     */
    getFirstFocusableInContainer(container) {
        const elements = this.getFocusableElementsInContainer(container);
        return elements[0] || null;
    }
    
    // ========== 設定・状態管理 ==========
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual) {
            // ハイコントラスト設定の適用
            if (config.visual.highContrast.enabled) {
                this.renderer.handleHighContrast(true);
                document.body.classList.add('high-contrast');
            } else {
                this.renderer.handleHighContrast(false);
                document.body.classList.remove('high-contrast');
            }
        }
        
        if (config.keyboard) {
            // キーボード設定の更新
            Object.assign(this.config.navigation, config.keyboard);
            this.navigation.updateKeyboardConfig(config.keyboard);
        }
        
        console.log('[FocusManager] Configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.state.enabled = enabled;
        console.log(`[FocusManager] ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        const navigationStats = this.navigation.getNavigationStats();
        const rendererStats = this.renderer.getRendererStats();
        const trapStats = this.trapManager.getTrapStats();
        
        return {
            // 基本統計
            keyboardMode: this.state.isKeyboardMode,
            enabled: this.state.enabled,
            
            // ナビゲーション統計
            ...navigationStats,
            
            // レンダラー統計
            renderer: rendererStats,
            
            // トラップマネージャー統計
            traps: trapStats
        };
    }
    
    // ========== イベントエミッター機能 ==========
    
    /**
     * イベントを発行
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[FocusManager] Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * イベントリスナーを追加
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }
    
    /**
     * イベントリスナーを削除
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }
    
    // ========== エラーハンドリング ==========
    
    /**
     * エラーハンドリング
     */
    handleError(error, errorCode, context = {}) {
        console.error(`[FocusManager] ${errorCode}:`, error, context);
        
        // AccessibilityManagerのエラーハンドラーがあれば使用
        if (this.accessibilityManager && this.accessibilityManager.handleError) {
            this.accessibilityManager.handleError(error, errorCode, context);
        }
    }
    
    // ========== クリーンアップ ==========
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('[FocusManager] Destroying...');
        
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
        
        // サブコンポーネントのクリーンアップ
        if (this.navigation) {
            this.navigation.destroy();
        }
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        if (this.trapManager) {
            this.trapManager.destroy();
        }
        
        // データのクリア
        this.eventListeners.clear();
        
        console.log('[FocusManager] Main Controller destroyed');
    }
}