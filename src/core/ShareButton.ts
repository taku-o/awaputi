/**
 * 共有ボタンコンポーネント (Task 7)
 * アクセシブルな共有ボタンUIを提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

// 型定義
interface ShareButtonOptions {
    position?: string;
    theme?: string;
    size?: string;
    animation?: boolean;
    hideDelay?: number;
    platforms?: string[];
    showLabels?: boolean;
    showIcons?: boolean;
    autoHide?: boolean;
    triggerEvents?: string[];
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontSize?: string;
    padding?: string;
    zIndex?: number;
    accessibility?: boolean;
    announcements?: boolean;
    keyboardNavigation?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
}

interface ShareButtonConfig {
    position: string;
    theme: string;
    size: string;
    animation: boolean;
    hideDelay: number;
    platforms: string[];
    showLabels: boolean;
    showIcons: boolean;
    autoHide: boolean;
    triggerEvents: string[];
    styles: {
        backgroundColor: string;
        textColor: string;
        borderRadius: string;
        fontSize: string;
        padding: string;
    };
    zIndex: number;
    accessibility: {
        enabled: boolean;
        announcements: boolean;
        keyboardNavigation: boolean;
        highContrast: boolean;
        reducedMotion: boolean;
    };
}

interface ShareButtonState {
    isVisible: boolean;
    isAnimating: boolean;
    currentPlatform: string | null;
    hideTimeout: number | null;
    keyboardFocus: number;
    visible: boolean;
    expanded: boolean;
    activeButton: HTMLElement | null;
    shareData: any | null;
    lastTriggeredBy: string | null;
}

interface ShareButtonElements {
    container: HTMLElement | null;
    mainButton: HTMLElement | null;
    platformButtons: HTMLElement[];
    tooltip: HTMLElement | null;
    announcer: HTMLElement | null;
}

interface ShareButtonHandlers {
    click: (event: Event) => void;
    keydown: (event: KeyboardEvent) => void;
    focus: (event: FocusEvent) => void;
    blur: (event: FocusEvent) => void;
    mouseenter: (event: MouseEvent) => void;
    mouseleave: (event: MouseEvent) => void;
    resize: () => void;
}

interface ShareButtonStats {
    shows: number;
    clicks: number;
    shares: number;
    platforms: { [key: string]: number };
}

export class ShareButton {
    private container: HTMLElement;
    private socialSharingManager: any;
    private config: ShareButtonConfig;
    private state: ShareButtonState;
    // private element?: HTMLElement;
    // private buttonElements: HTMLElement[] = [];
    // private isInitialized: boolean = false;
    private elements: ShareButtonElements;
    private handlers: ShareButtonHandlers;
    private hideTimer: number | null = null;
    private stats: ShareButtonStats;

    constructor(container: HTMLElement, socialSharingManager: any, options: ShareButtonOptions = {}) {
        this.container = container;
        this.socialSharingManager = socialSharingManager;
        
        // 設定
        this.config = {
            // 表示設定
            position: options.position || 'bottom-right',
            theme: options.theme || 'default',
            size: options.size || 'medium',
            animation: options.animation !== false,
            hideDelay: options.hideDelay || 3000,
            
            // 機能設定
            platforms: options.platforms || ['web-share', 'twitter', 'facebook'],
            showLabels: options.showLabels !== false,
            showIcons: options.showIcons !== false,
            autoHide: options.autoHide === true,
            triggerEvents: options.triggerEvents || ['score', 'achievement'],
            
            // スタイル設定
            styles: {
                backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.8)',
                textColor: options.textColor || '#FFFFFF',
                borderRadius: options.borderRadius || '8px',
                fontSize: options.fontSize || '14px',
                padding: options.padding || '12px 16px'
            },
            zIndex: options.zIndex || 1000,
            
            // アクセシビリティ設定
            accessibility: {
                enabled: options.accessibility !== false,
                announcements: options.announcements !== false,
                keyboardNavigation: options.keyboardNavigation !== false,
                highContrast: options.highContrast === true,
                reducedMotion: options.reducedMotion === true
            }
        };

        // 状態管理
        this.state = {
            isVisible: false,
            isAnimating: false,
            currentPlatform: null,
            hideTimeout: null,
            keyboardFocus: 0,
            visible: false,
            expanded: false,
            activeButton: null,
            shareData: null,
            lastTriggeredBy: null
        };

        // DOM要素
        this.elements = {
            container: null,
            mainButton: null,
            platformButtons: [],
            tooltip: null,
            announcer: null
        };

        // イベントハンドラー
        this.handlers = {
            click: this.handleClick.bind(this),
            keydown: this.handleKeydown.bind(this),
            focus: this.handleFocus.bind(this),
            blur: this.handleBlur.bind(this),
            mouseenter: this.handleMouseEnter.bind(this),
            mouseleave: this.handleMouseLeave.bind(this),
            resize: this.handleResize.bind(this)
        };

        // 統計
        this.stats = {
            shows: 0,
            clicks: 0,
            shares: 0,
            platforms: {}
        };

        this.initialize();
        this.log('ShareButton初期化完了');
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        try {
            // DOM要素の作成
            this.createElements();
            // スタイルの適用
            this.applyStyles();
            // イベントリスナーの設定
            this.setupEventListeners();
            // アクセシビリティの設定
            if (this.config.accessibility.enabled) {
                this.setupAccessibility();
            }
            
            // 自動表示設定
            this.setupAutoTrigger();

        } catch (error) {
            this.handleError('SHARE_BUTTON_INITIALIZATION_FAILED', error);
        }
    }
    
    /**
     * DOM要素の作成
     */
    createElements(): void {
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'share-button-container';
        this.elements.container.style.display = 'none';
        
        // メイン共有ボタン
        this.elements.mainButton = document.createElement('button');
        this.elements.mainButton.className = 'share-button-main';
        this.elements.mainButton.innerHTML = this.getButtonContent('share', '共有');
        this.elements.mainButton.setAttribute('aria-label', '共有オプションを表示');
        this.elements.mainButton.setAttribute('aria-expanded', 'false');
        
        // プラットフォーム別ボタンコンテナ
        const platformContainer = document.createElement('div');
        platformContainer.className = 'share-button-platforms';
        platformContainer.setAttribute('role', 'menu');
        platformContainer.setAttribute('aria-label', '共有プラットフォーム');
        
        // プラットフォーム別ボタンの作成
        this.config.platforms.forEach((platform, index) => {
            const button = this.createPlatformButton(platform, index);
            this.elements.platformButtons.push(button);
            platformContainer.appendChild(button);
        });

        // ツールチップ
        if (this.config.showLabels) {
            this.elements.tooltip = document.createElement('div');
            this.elements.tooltip.className = 'share-button-tooltip';
            this.elements.tooltip.setAttribute('role', 'tooltip');
            this.elements.tooltip.style.display = 'none';
        }
        
        // スクリーンリーダー用アナウンサー
        if (this.config.accessibility.enabled) {
            this.elements.announcer = document.createElement('div');
            this.elements.announcer.className = 'share-button-announcer';
            this.elements.announcer.setAttribute('aria-live', 'polite');
            this.elements.announcer.setAttribute('aria-atomic', 'true');
            this.elements.announcer.style.position = 'absolute';
            this.elements.announcer.style.left = '-10000px';
            this.elements.announcer.style.width = '1px';
            this.elements.announcer.style.height = '1px';
            this.elements.announcer.style.overflow = 'hidden';
        }
        
        // 要素の組み立て
        this.elements.container.appendChild(this.elements.mainButton);
        this.elements.container.appendChild(platformContainer);
        
        if (this.elements.tooltip) {
            this.elements.container.appendChild(this.elements.tooltip);
        }
        
        if (this.elements.announcer) {
            this.elements.container.appendChild(this.elements.announcer);
        }
        
        // コンテナに追加
        this.container.appendChild(this.elements.container);
    }
    
    /**
     * プラットフォーム別ボタンの作成
     */
    createPlatformButton(platform: string, _index: number): HTMLElement {
        const button = document.createElement('button');
        button.className = `share-button-platform share-button-${platform}`;
        button.setAttribute('data-platform', platform);
        button.setAttribute('role', 'menuitem');
        button.setAttribute('tabindex', '-1');

        const platformInfo = this.getPlatformInfo(platform);
        button.innerHTML = this.getButtonContent(platform, platformInfo.label);
        button.setAttribute('aria-label', `${platformInfo.label}で共有`);
        
        return button;
    }
    
    /**
     * ボタンコンテンツの生成
     */
    getButtonContent(platform: string, label: string): string {
        const showIcons = this.config.showIcons;
        const showLabels = this.config.showLabels;

        let content = '';

        if (showIcons) {
            const icon = this.getIcon(platform);
            content += `<span class="share-button-icon">${icon}</span>`;
        }

        if (showLabels) {
            content += `<span class="share-button-label">${label}</span>`;
        }
        
        return content;
    }
    
    /**
     * プラットフォーム情報の取得
     */
    getPlatformInfo(platform: string): { label: string; color: string } {
        const platforms: { [key: string]: { label: string; color: string } } = {
            'web-share': { label: '共有', color: '#007AFF' },
            'twitter': { label: 'Twitter', color: '#1DA1F2' },
            'facebook': { label: 'Facebook', color: '#1877F2' },
            'line': { label: 'LINE', color: '#00C300' },
            'whatsapp': { label: 'WhatsApp', color: '#25D366' },
            'telegram': { label: 'Telegram', color: '#0088CC' },
            'email': { label: 'メール', color: '#EA4335' },
            'copy': { label: 'コピー', color: '#6C757D' }
        };

        return platforms[platform] || { label: platform, color: '#6C757D' };
    }
    
    /**
     * アイコンの取得
     */
    getIcon(platform: string): string {
        const icons: { [key: string]: string } = {
            'share': '📤',
            'web-share': '📤',
            'twitter': '🐦',
            'facebook': '📘',
            'line': '💬',
            'whatsapp': '📱',
            'telegram': '✈️',
            'email': '📧',
            'copy': '📋'
        };

        return icons[platform] || '📤';
    }
    
    /**
     * スタイルの適用
     */
    applyStyles(): void {
        const container = this.elements.container!;
        const styles = this.config.styles;
        const isMobile = window.innerWidth <= 768;
        
        // 位置の設定
        const position = this.getPositionStyles();
        Object.assign(container.style, position);

        // 基本スタイル（モバイル対応の改善）
        Object.assign(container.style, {
            position: 'fixed',
            zIndex: this.config.zIndex.toString(),
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            borderRadius: styles.borderRadius,
            fontSize: isMobile ? '16px' : styles.fontSize,
            padding: isMobile ? '12px' : styles.padding,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: this.config.animation ? 'all 0.3s ease' : 'none',
            userSelect: 'none',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minHeight: isMobile ? '44px' : 'auto',
            minWidth: isMobile ? '44px' : 'auto'
        });
        
        // ボタンのタッチ操作改善
        if (this.elements.mainButton) {
            Object.assign(this.elements.mainButton.style, {
                minHeight: isMobile ? '44px' : '36px',
                minWidth: isMobile ? '44px' : '36px',
                padding: isMobile ? '8px 16px' : '6px 12px',
                touchAction: 'manipulation',
                cursor: 'pointer',
                outline: 'none',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'inherit',
                fontFamily: 'inherit'
            });
        }
        
        // プラットフォームボタンのスタイル
        this.elements.platformButtons.forEach(button => {
            Object.assign(button.style, {
                minHeight: isMobile ? '44px' : '36px',
                minWidth: isMobile ? '44px' : '36px',
                padding: isMobile ? '8px' : '6px',
                margin: isMobile ? '4px' : '2px',
                touchAction: 'manipulation',
                cursor: 'pointer',
                outline: 'none',
                border: 'none',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
            });
        });
        
        // テーマ別スタイル
        this.applyThemeStyles();
        
        // レスポンシブ対応
        this.applyResponsiveStyles();
        
        // アクセシビリティスタイル
        if (this.config.accessibility.enabled) {
            this.applyAccessibilityStyles();
        }
    }
    
    /**
     * 位置スタイルの取得
     */
    getPositionStyles(): { [key: string]: string } {
        // モバイルデバイスではより大きなパディングを使用
        const isMobile = window.innerWidth <= 768;
        const padding = isMobile ? 16 : 20;

        switch(this.config.position) {
            case 'top-left':
                return { top: `${padding}px`, left: `${padding}px` };
            case 'top-right':
                return { top: `${padding}px`, right: `${padding}px` };
            case 'bottom-left':
                return { bottom: `${padding}px`, left: `${padding}px` };
            case 'bottom-right':
                return { bottom: `${padding}px`, right: `${padding}px` };
            case 'center':
                return {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                };
            default:
                return { bottom: `${padding}px`, right: `${padding}px` };
        }
    }
    
    /**
     * テーマスタイルの適用
     */
    applyThemeStyles(): void {
        const container = this.elements.container!;

        switch(this.config.theme) {
            case 'minimal':
                Object.assign(container.style, {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#333333',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                });
                break;

            case 'gaming':
                Object.assign(container.style, {
                    backgroundColor: 'rgba(0, 255, 0, 0.9)',
                    color: '#000000',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                    border: '2px solid #00FF00'
                });
                break;

            case 'elegant':
                Object.assign(container.style, {
                    backgroundColor: 'rgba(50, 50, 70, 0.95)',
                    color: '#F0F0F0',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(192, 192, 192, 0.2)'
                });
                break;
        }
    }
    
    /**
     * レスポンシブスタイルの適用
     */
    applyResponsiveStyles(): void {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        if (mediaQuery.matches) {
            // モバイル用調整
            const container = this.elements.container!;
            Object.assign(container.style, {
                fontSize: '16px',
                padding: '14px 18px'
            });
            
            // 位置の調整
            if (this.config.position === 'bottom-right') {
                Object.assign(container.style, {
                    bottom: '80px',
                    right: '16px'
                });
            }
        }
    }
    
    /**
     * アクセシビリティスタイルの適用
     */
    applyAccessibilityStyles(): void {
        // 高コントラストモード
        if (this.config.accessibility.highContrast) {
            const container = this.elements.container!;

            Object.assign(container.style, {
                backgroundColor: '#000000',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF'
            });
        }
        
        // 動きの軽減
        if (this.config.accessibility.reducedMotion) {
            const container = this.elements.container!;
            container.style.transition = 'none';
        }
        
        // フォーカス表示の強化
        const style = document.createElement('style');
        style.textContent = `
            .share-button-main:focus,
            .share-button-platform:focus {
                outline: 3px solid #007AFF;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners(): void {
        this.elements.mainButton!.addEventListener('click', this.handlers.click);
        this.elements.mainButton!.addEventListener('keydown', this.handlers.keydown);
        
        // プラットフォームボタン
        this.elements.platformButtons.forEach(button => {
            button.addEventListener('click', this.handlers.click);
            button.addEventListener('keydown', this.handlers.keydown);
            button.addEventListener('focus', this.handlers.focus);
            button.addEventListener('blur', this.handlers.blur);
            if (this.elements.tooltip) {
                button.addEventListener('mouseenter', this.handlers.mouseenter);
                button.addEventListener('mouseleave', this.handlers.mouseleave);
            }
        });
        
        // ウィンドウリサイズ
        window.addEventListener('resize', this.handlers.resize);
        
        // 外部クリックでの閉じる処理
        document.addEventListener('click', (event) => {
            if (!this.elements.container!.contains(event.target as Node)) {
                this.collapse();
            }
        });
        
        // ESCキーでの閉じる処理
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.state.expanded) {
                this.collapse();
                this.elements.mainButton!.focus();
            }
        });
    }

    /**
     * アクセシビリティの設定
     */
    setupAccessibility(): void {
        this.elements.container!.setAttribute('role', 'toolbar');
        this.elements.container!.setAttribute('aria-label', '共有ツール');
        
        // キーボードナビゲーションの設定
        if (this.config.accessibility.keyboardNavigation) {
            this.setupKeyboardNavigation();
        }
    }
    
    /**
     * キーボードナビゲーションの設定
     */
    setupKeyboardNavigation(): void {
        this.elements.mainButton!.setAttribute('tabindex', '0');
        
        // 矢印キーでのナビゲーション
        this.elements.platformButtons.forEach((button, index) => {
            button.setAttribute('data-index', index.toString());
        });
    }

    /**
     * 自動トリガーの設定
     */
    setupAutoTrigger(): void {
        if (!this.socialSharingManager) return;
        
        // GameEngineイベントの監視
        const gameEngine = this.socialSharingManager.gameEngine;
        if (gameEngine) {
            this.config.triggerEvents.forEach(eventType => {
                gameEngine.on(eventType, (data: any) => {
                    this.showWithData(data, eventType);
                });
            });
        }
    }
    
    /**
     * データ付きで表示
     */
    showWithData(shareData: any, triggeredBy: string | null = null): void {
        this.state.shareData = shareData;
        this.state.lastTriggeredBy = triggeredBy;
        this.show();

        // 自動非表示の設定
        if (this.config.autoHide && this.config.hideDelay > 0) {
            this.scheduleHide();
        }
    }
    
    /**
     * ボタンの表示
     */
    show(): void {
        if (this.state.visible) return;
        
        this.state.visible = true;
        this.stats.shows++;

        const container = this.elements.container!;
        container.style.display = 'block';

        if (this.config.animation) {
            container.style.opacity = '0';
            container.style.transform = this.getShowAnimation();
            requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transform = 'none';
            });
        }
        
        // アクセシビリティアナウンス
        if (this.config.accessibility.announcements && this.elements.announcer) {
            this.elements.announcer.textContent = '共有ボタンが表示されました';
        }

        this.log('ShareButton表示');
    }
    
    /**
     * ボタンの非表示
     */
    hide(): void {
        if (!this.state.visible) return;
        
        this.state.visible = false;
        this.collapse();
        const container = this.elements.container!;

        if (this.config.animation) {
            container.style.opacity = '0';
            container.style.transform = this.getHideAnimation();
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 300);
        } else {
            container.style.display = 'none';
        }

        this.clearHideTimer();
        this.log('ShareButton非表示');
    }
    
    /**
     * 展開
     */
    expand(): void {
        if (this.state.expanded) return;

        this.state.expanded = true;
        this.elements.mainButton!.setAttribute('aria-expanded', 'true');
        const platformContainer = this.elements.container!.querySelector('.share-button-platforms') as HTMLElement;
        platformContainer.style.display = 'block';
        
        // 最初のプラットフォームボタンにフォーカス
        if (this.config.accessibility.keyboardNavigation && this.elements.platformButtons.length > 0) {
            setTimeout(() => {
                this.elements.platformButtons[0].focus();
            }, 100);
        }

        this.log('ShareButton展開');
    }
    
    /**
     * 折りたたみ
     */
    collapse(): void {
        if (!this.state.expanded) return;

        this.state.expanded = false;
        this.elements.mainButton!.setAttribute('aria-expanded', 'false');
        const platformContainer = this.elements.container!.querySelector('.share-button-platforms') as HTMLElement;
        platformContainer.style.display = 'none';
        
        // ツールチップを非表示
        if (this.elements.tooltip) {
            this.elements.tooltip.style.display = 'none';
        }

        this.log('ShareButton折りたたみ');
    }
    
    /**
     * 自動非表示のスケジュール
     */
    scheduleHide(): void {
        this.clearHideTimer();
        this.hideTimer = window.setTimeout(() => {
            this.hide();
        }, this.config.hideDelay);
    }
    
    /**
     * 自動非表示タイマーのクリア
     */
    clearHideTimer(): void {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
    
    /**
     * 表示アニメーションの取得
     */
    getShowAnimation(): string {
        switch(this.config.position) {
            case 'bottom-right':
                return 'translateY(100px)';
            case 'bottom-left':
                return 'translateY(100px)';
            case 'top-right':
                return 'translateY(-100px)';
            case 'top-left':
                return 'translateY(-100px)';
            default:
                return 'scale(0.8)';
        }
    }
    
    /**
     * 非表示アニメーションの取得
     */
    getHideAnimation(): string {
        return this.getShowAnimation();
    }
    
    /**
     * クリックハンドラー
     */
    handleClick(event: Event): void {
        const target = (event.target as Element).closest('button');
        if (!target) return;
        
        this.stats.clicks++;
        
        if (target === this.elements.mainButton) {
            // メインボタンのクリック
            if (this.state.expanded) {
                this.collapse();
            } else {
                this.expand();
            }
        } else {
            // プラットフォームボタンのクリック
            const platform = target.getAttribute('data-platform');
            if (platform) {
                this.handlePlatformShare(platform);
            }
        }
    }
    
    /**
     * キーボードハンドラー
     */
    handleKeydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;

        switch(event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleClick({ target } as any);
                break;

            case 'ArrowDown':
            case 'ArrowRight':
                if (this.state.expanded) {
                    event.preventDefault();
                    this.focusNext(target);
                }
                break;

            case 'ArrowUp':
            case 'ArrowLeft':
                if (this.state.expanded) {
                    event.preventDefault();
                    this.focusPrevious(target);
                }
                break;

            case 'Home':
                if (this.state.expanded) {
                    event.preventDefault();
                    this.elements.platformButtons[0]?.focus();
                }
                break;

            case 'End':
                if (this.state.expanded) {
                    event.preventDefault();
                    this.elements.platformButtons[this.elements.platformButtons.length - 1]?.focus();
                }
                break;
        }
    }
    
    /**
     * 次の要素にフォーカス
     */
    focusNext(currentElement: HTMLElement): void {
        const buttons = this.elements.platformButtons;
        const currentIndex = buttons.indexOf(currentElement);
        if (currentIndex >= 0) {
            const nextIndex = (currentIndex + 1) % buttons.length;
            buttons[nextIndex].focus();
        }
    }
    
    /**
     * 前の要素にフォーカス
     */
    focusPrevious(currentElement: HTMLElement): void {
        const buttons = this.elements.platformButtons;
        const currentIndex = buttons.indexOf(currentElement);
        if (currentIndex >= 0) {
            const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
            buttons[prevIndex].focus();
        }
    }
    
    /**
     * フォーカスハンドラー
     */
    handleFocus(event: FocusEvent): void {
        this.state.activeButton = event.target as HTMLElement;
        
        // ツールチップの表示
        if (this.elements.tooltip) {
            this.showTooltip(event.target as HTMLElement);
        }
    }
    
    /**
     * ブラーハンドラー
     */
    handleBlur(event: FocusEvent): void {
        if (this.state.activeButton === event.target) {
            this.state.activeButton = null;
        }
        
        // ツールチップの非表示
        if (this.elements.tooltip) {
            setTimeout(() => {
                if (!this.state.activeButton) {
                    this.hideTooltip();
                }
            }, 100);
        }
    }
    
    /**
     * マウスエンターハンドラー
     */
    handleMouseEnter(event: MouseEvent): void {
        if (this.elements.tooltip) {
            this.showTooltip(event.target as HTMLElement);
        }
    }
    
    /**
     * マウスリーブハンドラー
     */
    handleMouseLeave(event: MouseEvent): void {
        if (this.elements.tooltip) {
            setTimeout(() => {
                if (this.state.activeButton !== event.target) {
                    this.hideTooltip();
                }
            }, 100);
        }
    }
    
    /**
     * リサイズハンドラー
     */
    handleResize(): void {
        // レスポンシブスタイルの再適用
        this.applyResponsiveStyles();
    }
    
    /**
     * ツールチップの表示
     */
    showTooltip(button: HTMLElement): void {
        if (!this.elements.tooltip) return;

        const platform = button.getAttribute('data-platform');
        if (!platform) return;

        const platformInfo = this.getPlatformInfo(platform);

        this.elements.tooltip.textContent = `${platformInfo.label}で共有`;
        this.elements.tooltip.style.display = 'block';
        
        // 位置の調整
        const buttonRect = button.getBoundingClientRect();
        const tooltipRect = this.elements.tooltip.getBoundingClientRect();
        this.elements.tooltip.style.position = 'absolute';
        this.elements.tooltip.style.top = `${buttonRect.top - tooltipRect.height - 8}px`;
        this.elements.tooltip.style.left = `${buttonRect.left + (buttonRect.width - tooltipRect.width) / 2}px`;
    }
    
    /**
     * ツールチップの非表示
     */
    hideTooltip(): void {
        if (this.elements.tooltip) {
            this.elements.tooltip.style.display = 'none';
        }
    }
    
    /**
     * プラットフォーム共有の処理
     */
    async handlePlatformShare(platform: string): Promise<void> {
        try {
            if (!this.socialSharingManager) {
                throw new Error('SocialSharingManagerが設定されていません');
            }
            
            // 統計の更新
            this.stats.shares++;
            if (!this.stats.platforms[platform]) {
                this.stats.platforms[platform] = 0;
            }
            this.stats.platforms[platform]++;
            
            // 共有データの準備
            const shareData = this.state.shareData || this.getDefaultShareData();
            
            // アクセシビリティアナウンス
            if (this.config.accessibility.announcements && this.elements.announcer) {
                const platformInfo = this.getPlatformInfo(platform);
                this.elements.announcer.textContent = `${platformInfo.label}で共有中...`;
            }
            
            // プラットフォーム別の共有処理
            let result;
            switch(platform) {
                case 'web-share':
                    result = await this.socialSharingManager.share(shareData);
                    break;
                case 'twitter':
                    result = await this.socialSharingManager.shareViaTwitterUrl(shareData);
                    break;
                case 'facebook':
                    result = await this.socialSharingManager.shareViaFacebookUrl(shareData);
                    break;
                case 'copy':
                    result = await this.copyToClipboard(shareData);
                    break;
                default:
                    result = await this.socialSharingManager.share(shareData, { platform });
            }
            
            // 成功時の処理
            if (result && result.success) {
                this.handleShareSuccess(platform, result);
            } else {
                this.handleShareError(platform, result?.error || 'Unknown error');
            }
            
            // ボタンを折りたたむ
            this.collapse();
            
        } catch (error) {
            this.handleShareError(platform, error);
        }
    }
    
    /**
     * デフォルト共有データの取得
     */
    getDefaultShareData(): any {
        return {
            type: 'general',
            title: 'BubblePop',
            text: 'BubblePopをプレイ中！',
            url: window.location.href
        };
    }

    /**
     * クリップボードにコピー
     */
    async copyToClipboard(shareData: any): Promise<any> {
        try {
            const text = `${shareData.title || shareData.text} ${shareData.url || window.location.href}`;
            
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
            } else {
                // フォールバック
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            return { success: true, method: 'clipboard' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 共有成功の処理
     */
    handleShareSuccess(platform: string, result: any): void {
        this.log(`${platform}での共有成功`, result);
        
        // アクセシビリティアナウンス
        if (this.config.accessibility.announcements && this.elements.announcer) {
            const platformInfo = this.getPlatformInfo(platform);
            this.elements.announcer.textContent = `${platformInfo.label}での共有が完了しました`;
        }
        
        // 視覚的フィードバック
        this.showSuccessFeedback(platform);
    }
    
    /**
     * 共有エラーの処理
     */
    handleShareError(platform: string, error: any): void {
        this.handleError('PLATFORM_SHARE_FAILED', error, { platform });
        
        // アクセシビリティアナウンス
        if (this.config.accessibility.announcements && this.elements.announcer) {
            this.elements.announcer.textContent = '共有に失敗しました';
        }
    }
    
    /**
     * 成功フィードバックの表示
     */
    showSuccessFeedback(platform: string): void {
        const button = this.elements.platformButtons.find(
            btn => btn.getAttribute('data-platform') === platform
        );

        if (button && this.config.animation) {
            const originalTransform = button.style.transform;
            button.style.transform = 'scale(1.2)';
            button.style.backgroundColor = '#4CAF50';

            setTimeout(() => {
                button.style.transform = originalTransform;
                button.style.backgroundColor = '';
            }, 200);
        }
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<ShareButtonOptions>): void {
        this.config = { ...this.config, ...newConfig } as ShareButtonConfig;
        
        // スタイルの再適用
        this.applyStyles();
        this.log('ShareButton設定更新', newConfig);
    }
    
    /**
     * 統計の取得
     */
    getStats(): ShareButtonStats {
        return { ...this.stats };
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        this.elements.mainButton?.removeEventListener('click', this.handlers.click);
        this.elements.platformButtons.forEach(button => {
            button.removeEventListener('click', this.handlers.click);
            button.removeEventListener('keydown', this.handlers.keydown);
        });

        window.removeEventListener('resize', this.handlers.resize);
        
        // タイマーのクリア
        this.clearHideTimer();
        
        // DOM要素の削除
        if (this.elements.container && this.elements.container.parentNode) {
            this.elements.container.parentNode.removeChild(this.elements.container);
        }

        this.log('ShareButton破棄完了');
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type: "single" | "batch", error: any, context: any = {}): void {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now()
        };

        if (ErrorHandler) {
            (ErrorHandler as any).handleError(error, 'ShareButton', context);
        }

        this.log('エラー発生', errorInfo, 'error');
    }
    
    /**
     * ログ記録
     */
    log(message: string, data: any = null, level: string = 'info'): void {
        // const _logEntry = {
        //     timestamp: Date.now(),
        //     message,
        //     data
        // };

        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warn' ? 'warn' : 'log';

        console[consoleMethod](`[ShareButton] ${message}`, data || '');
    }
}
