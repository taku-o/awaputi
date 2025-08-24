/**
 * ソーシャル機能アクセシビリティマネージャー (Task, 23)
 * WCAG 2.1 AA準拠のアクセシビリティ機能を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface AccessibilityConfig {
    wcag: {
        level: string;
        colorContrast: {
            normal: number;
            large: number;
        };
        focusIndicator: {
            width: string;
            color: string;
        };
    };
    screenReader: {
        enabled: boolean;
        announcements: boolean;
        verbose: boolean;
        language: string;
    };
    keyboard: {
        enabled: boolean;
        tabSequence: string;
        shortcuts: boolean;
        focusTrapping: boolean;
    };
    highContrast: {
        enabled: boolean;
        backgroundColor: string;
        textColor: string;
        borderColor: string;
    };
    reducedMotion: {
        enabled: boolean;
        animations: boolean;
        transitions: boolean;
    };
}

interface AccessibilityState {
    enabled: boolean;
    currentFocus: Element | null;
    focusHistory: Array<{ element: Element; timestamp: number }>;
    announcements: Array<{ message: string; priority: string; timestamp: number }>;
    screenReaderActive: boolean;
}

interface AccessibilityElements {
    announcer: HTMLElement | null;
    skipLinks: HTMLElement | null;
    focusIndicator: HTMLElement | null;
    contrastOverlay: HTMLElement | null;
}

interface AccessibilityStats {
    focusChanges: number;
    announcements: number;
    keyboardInteractions: number;
    shortcutUses: Record<string, number>;
    accessibilityViolations: number;
}

interface LiveRegion {
    id: string;
    priority: string;
    label: string;
}

interface AccessibilityViolation {
    type: string;
    element: Element;
    message: string;
}

export class SocialAccessibilityManager {
    private socialSharingManager: any;
    private config: AccessibilityConfig;
    private state: AccessibilityState;
    private elements: AccessibilityElements;
    private handlers: Record<string, (event?: any) => void>;
    private shortcuts: Record<string, string>;
    private stats: AccessibilityStats;

    constructor(socialSharingManager: any) {
        this.socialSharingManager = socialSharingManager;
        
        // 設定
        this.config = {
            // WCAG 準拠設定
            wcag: {
                level: 'AA', // A, AA, AAA
                colorContrast: {
                    normal: 4.5,
                    large: 3.0
                },
                focusIndicator: {
                    width: '3px',
                    color: '#005fcc'
                }
            },
            // スクリーンリーダー設定
            screenReader: {
                enabled: true,
                announcements: true,
                verbose: false,
                language: 'ja'
            },
            // キーボードナビゲーション設定
            keyboard: {
                enabled: true,
                tabSequence: 'logical',
                shortcuts: true,
                focusTrapping: true
            },
            // 高コントラスト設定
            highContrast: {
                enabled: false,
                backgroundColor: '#000000',
                textColor: '#ffffff',
                borderColor: '#ffffff'
            },
            // 動きの軽減設定
            reducedMotion: {
                enabled: false,
                animations: false,
                transitions: false
            }
        };
        
        // 状態管理
        this.state = {
            enabled: true,
            currentFocus: null,
            focusHistory: [],
            announcements: [],
            screenReaderActive: false
        };
        
        // DOM要素管理
        this.elements = {
            announcer: null,
            skipLinks: null,
            focusIndicator: null,
            contrastOverlay: null
        };
        
        // イベントハンドラー
        this.handlers = {
            keydown: this.handleKeydown.bind(this),
            focus: this.handleFocus.bind(this),
            blur: this.handleBlur.bind(this),
            preferredColorSchemeChange: this.handlePreferredColorSchemeChange.bind(this),
            preferredReducedMotionChange: this.handlePreferredReducedMotionChange.bind(this)
        };
        
        // ショートカットキー定義
        this.shortcuts = {
            'Alt+1': 'focusMainShareButton',
            'Alt+2': 'showShareDialog',
            'Alt+3': 'toggleHighContrast',
            'Alt+4': 'announceCurrentState',
            'Escape': 'closeCurrentDialog'
        };
        
        // 統計
        this.stats = {
            focusChanges: 0,
            announcements: 0,
            keyboardInteractions: 0,
            shortcutUses: {},
            accessibilityViolations: 0
        };
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        try {
            // ユーザー設定の検出
            this.detectUserPreferences();
            // DOM要素の作成
            this.createAccessibilityElements();
            // イベントリスナーの設定
            this.setupEventListeners();
            // スクリーンリーダー検出
            this.detectScreenReader();
            // 初期設定の適用
            this.applyInitialSettings();
            // ARIA Live Regionsの設定
            this.setupLiveRegions();
            this.log('SocialAccessibilityManager初期化完了');
        } catch (error) {
            this.handleError('ACCESSIBILITY_INIT_FAILED', error);
        }
    }
    
    /**
     * ユーザー設定の検出
     */
    detectUserPreferences(): void {
        // 高コントラストの検出
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.config.highContrast.enabled = true;
        }
        
        // 動きの軽減の検出
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.config.reducedMotion.enabled = true;
        }
        
        // カラースキームの検出
        const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (darkMode) {
            this.config.highContrast.backgroundColor = '#000000';
            this.config.highContrast.textColor = '#ffffff';
        }
        
        // 言語設定の検出
        const language = navigator.language || 'ja';
        this.config.screenReader.language = language.split('-')[0];

        this.log('ユーザー設定検出完了', {
            highContrast: this.config.highContrast.enabled,
            reducedMotion: this.config.reducedMotion.enabled,
            language: this.config.screenReader.language
        });
    }
    
    /**
     * アクセシビリティ要素の作成
     */
    createAccessibilityElements(): void {
        // アナウンサー要素
        this.elements.announcer = document.createElement('div');
        this.elements.announcer.id = 'social-accessibility-announcer';
        this.elements.announcer.setAttribute('aria-live', 'polite');
        this.elements.announcer.setAttribute('aria-atomic', 'true');
        this.elements.announcer.className = 'sr-only';
        this.elements.announcer.style.cssText = `
            position: absolute !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip: rect(1px, 1px, 1px, 1px) !important;
            clip-path: inset(50%) !important;
        `;
        
        // スキップリンク
        this.elements.skipLinks = document.createElement('div');
        this.elements.skipLinks.id = 'social-skip-links';
        this.elements.skipLinks.className = 'skip-links';

        this.elements.skipLinks.innerHTML = `
            <a href="#social-share-main" class="skip-link">メイン共有ボタンにスキップ</a>
            <a href="#social-platforms" class="skip-link">プラットフォーム選択にスキップ</a>
            <a href="#social-content" class="skip-link">共有コンテンツにスキップ</a>
        `;
        
        // フォーカス表示の強化
        this.elements.focusIndicator = document.createElement('style');
        this.elements.focusIndicator.textContent = this.generateFocusStyles();
        
        // コントラストオーバーレイ
        this.elements.contrastOverlay = document.createElement('div');
        this.elements.contrastOverlay.id = 'social-contrast-overlay';
        this.elements.contrastOverlay.style.display = 'none';
        
        // DOM に追加
        document.head.appendChild(this.elements.focusIndicator);
        document.body.insertBefore(this.elements.skipLinks, document.body.firstChild);
        document.body.appendChild(this.elements.announcer);
        document.body.appendChild(this.elements.contrastOverlay);
    }
    
    /**
     * フォーカススタイルの生成
     */
    generateFocusStyles(): string {
        const focusColor = this.config.wcag.focusIndicator.color;
        const focusWidth = this.config.wcag.focusIndicator.width;
        
        return `
            /* ソーシャル機能のフォーカススタイル */
            .share-button-main:focus,
            .share-button-platform:focus,
            .share-dialog button:focus,
            .leaderboard-entry:focus,
            .challenge-item:focus {
                outline: ${focusWidth} solid ${focusColor} !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 ${focusWidth} ${focusColor} !important;
            }
            
            /* スキップリンクのスタイル */
            .skip-links {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 10001;
            }
            
            .skip-link {
                position: absolute;
                left: -10000px;
                top: auto;
                width: 1px;
                height: 1px;
                overflow: hidden;
                background: #000;
                color: #fff;
                padding: 8px 16px;
                text-decoration: none;
                font-weight: bold;
                border-radius: 4px;
            }
            
            .skip-link:focus {
                position: static;
                width: auto;
                height: auto;
                left: 6px;
                top: 6px;
                outline: 3px solid ${focusColor};
            }
            
            /* 高コントラストモード */
            .high-contrast-mode .share-button-container,
            .high-contrast-mode .share-dialog,
            .high-contrast-mode .leaderboard-container {
                background: ${this.config.highContrast.backgroundColor} !important;
                color: ${this.config.highContrast.textColor} !important;
                border: 2px solid ${this.config.highContrast.borderColor} !important;
            }
            
            /* 動きの軽減 */
            .reduced-motion-mode * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners(): void {
        // キーボードイベント
        document.addEventListener('keydown', this.handlers.keydown);
        
        // フォーカスイベント
        document.addEventListener('focusin', this.handlers.focus);
        document.addEventListener('focusout', this.handlers.blur);
        
        // メディアクエリの監視
        window.matchMedia('(prefers-contrast: high)').addEventListener('change',
            this.handlers.preferredColorSchemeChange);
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',
            this.handlers.preferredReducedMotionChange);
    }
    
    /**
     * スクリーンリーダーの検出
     */
    detectScreenReader(): void {
        // 一般的なスクリーンリーダーの検出
        const userAgent = navigator.userAgent.toLowerCase();
        const screenReaders = ['nvda', 'jaws', 'voiceover', 'talkback', 'orca'];
        this.state.screenReaderActive = screenReaders.some(sr => userAgent.includes(sr));
        
        // より詳細な検出（Windows環境でのScreen Reader API）
        if ('speechSynthesis' in window) {
            this.state.screenReaderActive = true;
        }
        
        // Accessibility APIの検出
        if ((navigator as any).userAgentData && (navigator as any).userAgentData.getHighEntropyValues) {
            (navigator as any).userAgentData.getHighEntropyValues(['uaFullVersion']).then((ua: any) => {
                // より詳細な検出ロジック
            });
        }

        this.log('スクリーンリーダー検出', { active: this.state.screenReaderActive });
    }
    
    /**
     * 初期設定の適用
     */
    applyInitialSettings(): void {
        if (this.config.highContrast.enabled) {
            this.enableHighContrast();
        }
        
        if (this.config.reducedMotion.enabled) {
            this.enableReducedMotion();
        }
    }
    
    /**
     * Live Regionsの設定
     */
    setupLiveRegions(): void {
        const liveRegions: LiveRegion[] = [
            { id: 'social-urgent-announcements', priority: 'assertive', label: '緊急通知' },
            { id: 'social-status-announcements', priority: 'polite', label: 'ステータス通知' },
            { id: 'social-progress-announcements', priority: 'polite', label: '進捗通知' }
        ];

        liveRegions.forEach(region => {
            const element = document.createElement('div');
            element.id = region.id;
            element.setAttribute('aria-live', region.priority);
            element.setAttribute('aria-label', region.label);
            element.className = 'sr-only';
            element.style.cssText = this.elements.announcer!.style.cssText;
            document.body.appendChild(element);
        });
    }

    /**
     * キーボードイベントハンドラー
     */
    handleKeydown(event: KeyboardEvent): void {
        this.stats.keyboardInteractions++;
        
        // ショートカットキーの処理
        const shortcutKey = this.getShortcutKey(event);
        if (shortcutKey && this.shortcuts[shortcutKey]) {
            event.preventDefault();
            this.executeShortcut(this.shortcuts[shortcutKey]);
            return;
        }
        
        // Tab キーによるフォーカス管理
        if (event.key === 'Tab') {
            this.handleTabNavigation(event);
        }
        
        // Escape キーによるダイアログ閉じる
        if (event.key === 'Escape') {
            this.handleEscapeKey(event);
        }
        
        // 矢印キーによるナビゲーション
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            this.handleArrowNavigation(event);
        }
    }
    
    /**
     * ショートカットキーの取得
     */
    getShortcutKey(event: KeyboardEvent): string {
        const modifiers: string[] = [];
        if (event.ctrlKey) modifiers.push('Ctrl');
        if (event.altKey) modifiers.push('Alt');
        if (event.shiftKey) modifiers.push('Shift');
        if (event.metaKey) modifiers.push('Meta');

        const key = event.key;

        return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
    }
    
    /**
     * ショートカットの実行
     */
    executeShortcut(action: string): void {
        this.stats.shortcutUses[action] = (this.stats.shortcutUses[action] || 0) + 1;

        switch(action) {
            case 'focusMainShareButton':
                this.focusMainShareButton();
                break;
            case 'showShareDialog':
                this.showShareDialog();
                break;
            case 'toggleHighContrast':
                this.toggleHighContrast();
                break;
            case 'announceCurrentState':
                this.announceCurrentState();
                break;
            case 'closeCurrentDialog':
                this.closeCurrentDialog();
                break;
        }
    }
    
    /**
     * フォーカスイベントハンドラー
     */
    handleFocus(event: FocusEvent): void {
        this.stats.focusChanges++;
        this.state.currentFocus = event.target as Element;
        this.state.focusHistory.push({
            element: event.target as Element,
            timestamp: Date.now()
        });
        
        // フォーカス履歴の管理（最新100件まで）
        if (this.state.focusHistory.length > 100) {
            this.state.focusHistory.shift();
        }
        
        // ARIA属性の動的更新
        this.updateAriaState(event.target as Element);
    }
    
    /**
     * ブラーイベントハンドラー
     */
    handleBlur(event: FocusEvent): void {
        // フォーカスの記録
        if (this.state.currentFocus === event.target) {
            this.state.currentFocus = null;
        }
    }
    
    /**
     * ARIAステートの更新
     */
    updateAriaState(element: Element): void {
        // 共有ボタンの状態更新
        if (element.classList.contains('share-button-main')) {
            const expanded = element.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                this.announce('共有オプションが展開されました');
            }
        }
        
        // ダイアログの状態更新
        if (element.closest('.share-dialog')) {
            const dialog = element.closest('.share-dialog') as HTMLElement;
            if (dialog && dialog.style.display !== 'none') {
                this.announce('共有ダイアログが開いています');
            }
        }
    }

    /**
     * アナウンスの実行
     */
    announce(message: string, priority: string = 'polite'): void {
        if (!this.config.screenReader.enabled || !this.config.screenReader.announcements) {
            return;
        }
        
        this.stats.announcements++;
        this.state.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
        
        // 適切なLive Regionを選択
        const regionId = priority === 'assertive' ?
            'social-urgent-announcements' : 'social-status-announcements';
        
        const region = document.getElementById(regionId) || this.elements.announcer;

        if (region) {
            // 一度クリアしてから新しいメッセージを設定
            region.textContent = '';
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        }

        this.log('アナウンス実行', { message, priority });
    }
    
    /**
     * 高コントラストモードの有効化
     */
    enableHighContrast(): void {
        document.body.classList.add('high-contrast-mode');
        this.config.highContrast.enabled = true;
        this.announce('高コントラストモードが有効になりました');
        this.log('高コントラストモード有効化');
    }
    
    /**
     * 高コントラストモードの無効化
     */
    disableHighContrast(): void {
        document.body.classList.remove('high-contrast-mode');
        this.config.highContrast.enabled = false;
        this.announce('高コントラストモードが無効になりました');
        this.log('高コントラストモード無効化');
    }
    
    /**
     * 高コントラストモードの切り替え
     */
    toggleHighContrast(): void {
        if (this.config.highContrast.enabled) {
            this.disableHighContrast();
        } else {
            this.enableHighContrast();
        }
    }
    
    /**
     * 動きの軽減モードの有効化
     */
    enableReducedMotion(): void {
        document.body.classList.add('reduced-motion-mode');
        this.config.reducedMotion.enabled = true;
        this.announce('動きの軽減モードが有効になりました');
        this.log('動きの軽減モード有効化');
    }
    
    /**
     * 動きの軽減モードの無効化
     */
    disableReducedMotion(): void {
        document.body.classList.remove('reduced-motion-mode');
        this.config.reducedMotion.enabled = false;
        this.announce('動きの軽減モードが無効になりました');
        this.log('動きの軽減モード無効化');
    }
    
    /**
     * メイン共有ボタンにフォーカス
     */
    focusMainShareButton(): void {
        const mainButton = document.querySelector('.share-button-main') as HTMLElement;
        if (mainButton) {
            mainButton.focus();
            this.announce('メイン共有ボタンにフォーカスしました');
        }
    }
    
    /**
     * 共有ダイアログの表示
     */
    showShareDialog(): void {
        if (this.socialSharingManager) {
            // デフォルト共有データで表示
            this.socialSharingManager.promptShareScore({
                score: 0,
                stage: 'default'
            });
        }
    }
    
    /**
     * 現在の状態のアナウンス
     */
    announceCurrentState(): void {
        const state = this.getCurrentState();
        this.announce(state, 'assertive');
    }
    
    /**
     * 現在の状態の取得
     */
    getCurrentState(): string {
        let state = 'BubblePopソーシャル機能。';

        if (this.state.currentFocus) {
            const element = this.state.currentFocus;
            const role = element.getAttribute('role') || element.tagName.toLowerCase();
            const label = element.getAttribute('aria-label') || element.textContent || '';
            state += `現在フォーカス中: ${role} ${label}。`;
        }

        if (this.config.highContrast.enabled) {
            state += '高コントラストモード有効。';
        }

        if (this.config.reducedMotion.enabled) {
            state += '動きの軽減モード有効。';
        }
        
        return state;
    }
    
    /**
     * 現在のダイアログを閉じる
     */
    closeCurrentDialog(): void {
        const openDialog = document.querySelector('.share-dialog[style*="block"]') as HTMLElement;
        if (openDialog) {
            const closeButton = openDialog.querySelector('.dialog-close') as HTMLElement;
            if (closeButton) {
                closeButton.click();
                this.announce('ダイアログを閉じました');
            }
        }
    }
    
    /**
     * コントラスト設定の変更を処理
     */
    handlePreferredColorSchemeChange(event: MediaQueryListEvent): void {
        if (event.matches) {
            this.enableHighContrast();
        } else {
            this.disableHighContrast();
        }
    }
    
    /**
     * 動きの軽減設定の変更を処理
     */
    handlePreferredReducedMotionChange(event: MediaQueryListEvent): void {
        if (event.matches) {
            this.enableReducedMotion();
        } else {
            this.disableReducedMotion();
        }
    }
    
    /**
     * Tabナビゲーションの処理
     */
    handleTabNavigation(event: KeyboardEvent): void {
        // フォーカストラップの実装
        const dialog = (event.target as Element).closest('[role="dialog"]') as HTMLElement;
        if (dialog) {
            this.handleDialogTabNavigation(event, dialog);
        }
    }
    
    /**
     * ダイアログ内のTabナビゲーション
     */
    handleDialogTabNavigation(event: KeyboardEvent, dialog: HTMLElement): void {
        const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift+Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Escapeキーの処理
     */
    handleEscapeKey(event: KeyboardEvent): void {
        // 最上位のモーダルを閉じる
        const modals = document.querySelectorAll('[role="dialog"]:not([style*="none"])') as NodeListOf<HTMLElement>;
        if (modals.length > 0) {
            const topModal = modals[modals.length - 1];
            const closeButton = topModal.querySelector('[aria-label*="閉じる"], .dialog-close') as HTMLElement;
            if (closeButton) {
                closeButton.click();
            }
        }
    }

    /**
     * 矢印キーナビゲーションの処理
     */
    handleArrowNavigation(event: KeyboardEvent): void {
        // プラットフォームボタン間のナビゲーション
        if ((event.target as Element).classList.contains('share-button-platform')) {
            this.handlePlatformButtonNavigation(event);
        }
        
        // リーダーボード項目間のナビゲーション
        if ((event.target as Element).classList.contains('leaderboard-entry')) {
            this.handleLeaderboardNavigation(event);
        }
    }
    
    /**
     * プラットフォームボタン間のナビゲーション
     */
    handlePlatformButtonNavigation(event: KeyboardEvent): void {
        const buttons = Array.from(document.querySelectorAll('.share-button-platform')) as HTMLElement[];
        const currentIndex = buttons.indexOf(event.target as HTMLElement);
        if (currentIndex === -1) return;
        
        let nextIndex: number;
        switch(event.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                nextIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                nextIndex = currentIndex === buttons.length - 1 ? 0 : currentIndex + 1;
                break;
            default:
                return;
        }
        
        buttons[nextIndex].focus();
    }
    
    /**
     * リーダーボードナビゲーション
     */
    handleLeaderboardNavigation(event: KeyboardEvent): void {
        const entries = Array.from(document.querySelectorAll('.leaderboard-entry')) as HTMLElement[];
        const currentIndex = entries.indexOf(event.target as HTMLElement);
        if (currentIndex === -1) return;
        
        let nextIndex: number;
        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                nextIndex = currentIndex === 0 ? entries.length - 1 : currentIndex - 1;
                break;
            case 'ArrowDown':
                event.preventDefault();
                nextIndex = currentIndex === entries.length - 1 ? 0 : currentIndex + 1;
                break;
            default:
                return;
        }
        
        entries[nextIndex].focus();
    }
    
    /**
     * アクセシビリティ検証
     */
    validateAccessibility(): AccessibilityViolation[] {
        const violations: AccessibilityViolation[] = [];
        
        // フォーカス可能要素の検証
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea');
        focusableElements.forEach(element => {
            if (!element.hasAttribute('tabindex') && (element as HTMLElement).tabIndex < 0) {
                violations.push({
                    type: 'FOCUSABLE_ELEMENT_WITHOUT_TABINDEX',
                    element,
                    message: 'フォーカス可能要素にtabindexが設定されていません'
                });
            }
        });
        
        // ARIA属性の検証
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
        ariaElements.forEach(element => {
            const labelledby = element.getAttribute('aria-labelledby');
            if (labelledby && !document.getElementById(labelledby)) {
                violations.push({
                    type: 'INVALID_ARIA_LABELLEDBY',
                    element,
                    message: `aria-labelledbyで参照されているID "${labelledby}" が存在しません`
                });
            }
        });
        
        // カラーコントラストの検証
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const contrast = this.calculateColorContrast(button);
            if (contrast < this.config.wcag.colorContrast.normal) {
                violations.push({
                    type: 'INSUFFICIENT_COLOR_CONTRAST',
                    element: button,
                    message: `カラーコントラストが不十分です (${contrast.toFixed(2)}:1)`
                });
            }
        });
        
        this.stats.accessibilityViolations = violations.length;

        if (violations.length > 0) {
            this.log('アクセシビリティ違反検出', { violations }, 'warn');
        }
        
        return violations;
    }
    
    /**
     * カラーコントラスト計算
     */
    calculateColorContrast(element: Element): number {
        const styles = window.getComputedStyle(element as HTMLElement);
        const bgcolor = styles.backgroundColor;
        const color = styles.color;
        
        // 簡易的な計算（実際の実装ではより詳細な計算が必要）
        const bgLuminance = this.calculateLuminance(bgcolor);
        const fgLuminance = this.calculateLuminance(color);
        const lighter = Math.max(bgLuminance, fgLuminance);
        const darker = Math.min(bgLuminance, fgLuminance);
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    /**
     * 輝度計算
     */
    calculateLuminance(color: string): number {
        // RGB値の抽出と正規化
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return 0;
        
        const [r, g, b] = rgb.map(val => {
            const normalized = parseInt(val) / 255;
            return normalized <= 0.03928 
                ? normalized / 12.92
                : Math.pow((normalized + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    /**
     * 統計情報の取得
     */
    getStats(): any {
        return {
            ...this.stats,
            enabled: this.state.enabled,
            screenReaderActive: this.state.screenReaderActive,
            highContrastEnabled: this.config.highContrast.enabled,
            reducedMotionEnabled: this.config.reducedMotion.enabled,
            currentFocus: this.state.currentFocus?.tagName || null,
            focusHistoryLength: this.state.focusHistory.length,
            announcementsCount: this.state.announcements.length
        };
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<AccessibilityConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.applyInitialSettings();
        this.log('アクセシビリティ設定更新', newConfig);
    }
    
    /**
     * アクセシビリティレポートの生成
     */
    generateAccessibilityReport(): any {
        const violations = this.validateAccessibility();
        return {
            timestamp: new Date().toISOString(),
            wcagLevel: this.config.wcag.level,
            stats: this.getStats(),
            violations,
            recommendations: this.generateRecommendations(violations),
            userPreferences: {
                highContrast: this.config.highContrast.enabled,
                reducedMotion: this.config.reducedMotion.enabled,
                screenReader: this.state.screenReaderActive
            }
        };
    }
    
    /**
     * 改善提案の生成
     */
    generateRecommendations(violations: AccessibilityViolation[]): string[] {
        const recommendations: string[] = [];

        if (violations.some(v => v.type === 'INSUFFICIENT_COLOR_CONTRAST')) {
            recommendations.push('カラーコントラストを4.5:1以上に改善してください');
        }

        if (violations.some(v => v.type === 'INVALID_ARIA_LABELLEDBY')) {
            recommendations.push('ARIA属性の参照先IDを確認してください');
        }

        if (violations.some(v => v.type === 'FOCUSABLE_ELEMENT_WITHOUT_TABINDEX')) {
            recommendations.push('フォーカス可能要素にtabindex属性を追加してください');
        }
        
        return recommendations;
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        document.removeEventListener('keydown', this.handlers.keydown);
        document.removeEventListener('focusin', this.handlers.focus);
        document.removeEventListener('focusout', this.handlers.blur);
        
        // DOM要素の削除
        Object.values(this.elements).forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        this.log('SocialAccessibilityManager破棄完了');
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type: string, error: any, context: any = {}): void {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };

        if (ErrorHandler && typeof ErrorHandler.handle === 'function') {
            ErrorHandler.handle(error, 'SocialAccessibilityManager', context);
        }

        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録
     */
    log(message: string, data: any = null, level: string = 'info'): void {
        const logEntry = {
            timestamp: Date.now(),
            message,
            data
        };
        
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';

        console[consoleMethod](`[SocialAccessibilityManager] ${message}`, data || '');
    }
}