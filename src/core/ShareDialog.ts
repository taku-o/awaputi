/**
 * 共有ダイアログベースクラス (Task 7)
 * モーダル表示とアクセシビリティ機能を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface ShareDialogOptions {
    title?: string;
    width?: number | string;
    height?: number | string;
    maxHeight?: string;
    position?: string;
    backdrop?: boolean;
    animation?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    platforms?: string[];
    showPlatformLabels?: boolean;
    showPlatformIcons?: boolean;
    showScreenshotPreview?: boolean;
    allowMessageEdit?: boolean;
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontSize?: string;
    fontFamily?: string;
    zIndex?: number;
    backdropColor?: string;
    accessibility?: boolean;
    announcements?: boolean;
    keyboardNavigation?: boolean;
    focusTrap?: boolean;
    returnFocusElement?: HTMLElement | null;
    initialFocusElement?: HTMLElement | null;
    highContrast?: boolean;
    reducedMotion?: boolean;
}

interface ShareDialogConfig {
    title: string;
    width: number | string;
    height: number | string;
    maxHeight: string;
    position: string;
    backdrop: boolean;
    animation: boolean;
    closeOnBackdrop: boolean;
    closeOnEscape: boolean;
    platforms: string[];
    showPlatformLabels: boolean;
    showPlatformIcons: boolean;
    showScreenshotPreview: boolean;
    allowMessageEdit: boolean;
    theme: string;
    styles: {
        backgroundColor: string;
        textColor: string;
        borderRadius: string;
        fontSize: string;
        fontFamily: string;
        zIndex: number;
        backdropColor: string;
    };
    accessibility: {
        enabled: boolean;
        announcements: boolean;
        keyboardNavigation: boolean;
        focus: {
            trap: boolean;
            returnElement: HTMLElement | null;
            initialElement: HTMLElement | null;
        };
        highContrast: boolean;
        reducedMotion: boolean;
    };
}

interface ShareDialogState {
    visible: boolean;
    opening: boolean;
    closing: boolean;
    shareData: any | null;
    screenshot: any | null;
    editedMessage: string | null;
    focusedElement: HTMLElement | null;
    previousFocus: HTMLElement | null;
}

interface ShareDialogElements {
    backdrop: HTMLElement | null;
    dialog: HTMLElement | null;
    container: HTMLElement | null;
    header: HTMLElement | null;
    body: HTMLElement | null;
    footer: HTMLElement | null;
    closeButton: HTMLElement | null;
    platforms: HTMLElement[];
    messageEditor: HTMLTextAreaElement | null;
    screenshotPreview: HTMLElement | null;
    announcer: HTMLElement | null;
}

interface ShareDialogHandlers {
    backdropClick: (event: Event) => void;
    keydown: (event: KeyboardEvent) => void;
    close: () => void;
    platformClick: (event: Event) => void;
    messageChange: (event: Event) => void;
    resize: () => void;
}

interface ShareDialogStats {
    shows: number;
    shares: number;
    cancellations: number;
    messageEdits: number;
    platforms: { [key: string]: number };
}

export class ShareDialog {
    private socialSharingManager: any;
    private config: ShareDialogConfig;
    private state: ShareDialogState;
    private elements: ShareDialogElements;
    private handlers: ShareDialogHandlers;
    private focusableElements: HTMLElement[] = [];
    private currentFocusIndex: number = 0;
    private stats: ShareDialogStats;

    constructor(socialSharingManager: any, options: ShareDialogOptions = {}) {
        this.socialSharingManager = socialSharingManager;
        
        // 設定
        this.config = {
            // 表示設定
            title: options.title || '共有',
            width: options.width || 480,
            height: options.height || 'auto',
            maxHeight: options.maxHeight || '80vh',
            position: options.position || 'center',
            backdrop: options.backdrop !== false,
            animation: options.animation !== false,
            closeOnBackdrop: options.closeOnBackdrop !== false,
            closeOnEscape: options.closeOnEscape !== false,
            
            // 機能設定
            platforms: options.platforms || ['web-share', 'twitter', 'facebook', 'copy'],
            showPlatformLabels: options.showPlatformLabels !== false,
            showPlatformIcons: options.showPlatformIcons !== false,
            showScreenshotPreview: options.showScreenshotPreview === true,
            allowMessageEdit: options.allowMessageEdit === true,
            
            // スタイル設定
            theme: options.theme || 'default',
            styles: {
                backgroundColor: options.backgroundColor || '#FFFFFF',
                textColor: options.textColor || '#333333',
                borderRadius: options.borderRadius || '12px',
                fontSize: options.fontSize || '14px',
                fontFamily: options.fontFamily || 'system-ui, -apple-system, sans-serif',
                zIndex: options.zIndex || 10000,
                backdropColor: options.backdropColor || 'rgba(0, 0, 0, 0.6)'
            },
            
            // アクセシビリティ設定
            accessibility: {
                enabled: options.accessibility !== false,
                announcements: options.announcements !== false,
                keyboardNavigation: options.keyboardNavigation !== false,
                focus: {
                    trap: options.focusTrap !== false,
                    returnElement: options.returnFocusElement || null,
                    initialElement: options.initialFocusElement || null
                },
                highContrast: options.highContrast === true,
                reducedMotion: options.reducedMotion === true
            }
        };
        
        // 状態管理
        this.state = {
            visible: false,
            opening: false,
            closing: false,
            shareData: null,
            screenshot: null,
            editedMessage: null,
            focusedElement: null,
            previousFocus: null
        };

        // DOM要素
        this.elements = {
            backdrop: null,
            dialog: null,
            container: null,
            header: null,
            body: null,
            footer: null,
            closeButton: null,
            platforms: [],
            messageEditor: null,
            screenshotPreview: null,
            announcer: null
        };

        // イベントハンドラー
        this.handlers = {
            backdropClick: this.handleBackdropClick.bind(this),
            keydown: this.handleKeydown.bind(this),
            close: this.handleClose.bind(this),
            platformClick: this.handlePlatformClick.bind(this),
            messageChange: this.handleMessageChange.bind(this),
            resize: this.handleResize.bind(this)
        };

        // 統計
        this.stats = {
            shows: 0,
            shares: 0,
            cancellations: 0,
            messageEdits: 0,
            platforms: {}
        };

        this.initialize();
        this.log('ShareDialog初期化完了');
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
        } catch (error) {
            this.handleError('SHARE_DIALOG_INITIALIZATION_FAILED', error);
        }
    }
    
    /**
     * DOM要素の作成
     */
    createElements(): void {
        this.elements.backdrop = document.createElement('div');
        this.elements.backdrop.className = 'share-dialog-backdrop';
        this.elements.backdrop.style.display = 'none';

        // ダイアログコンテナ
        this.elements.dialog = document.createElement('div');
        this.elements.dialog.className = 'share-dialog';
        this.elements.dialog.setAttribute('role', 'dialog');
        this.elements.dialog.setAttribute('aria-modal', 'true');
        this.elements.dialog.setAttribute('aria-labelledby', 'share-dialog-title');
        this.elements.dialog.setAttribute('aria-describedby', 'share-dialog-content');

        // メインコンテナ
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'share-dialog-container';
        
        // ヘッダー
        this.elements.header = this.createHeader();
        
        // ボディ
        this.elements.body = this.createBody();
        
        // フッター
        this.elements.footer = this.createFooter();

        // スクリーンリーダー用アナウンサー
        if (this.config.accessibility.enabled) {
            this.elements.announcer = document.createElement('div');
            this.elements.announcer.className = 'share-dialog-announcer';
            this.elements.announcer.setAttribute('aria-live', 'polite');
            this.elements.announcer.setAttribute('aria-atomic', 'true');
            this.elements.announcer.style.position = 'absolute';
            this.elements.announcer.style.left = '-10000px';
            this.elements.announcer.style.width = '1px';
            this.elements.announcer.style.height = '1px';
            this.elements.announcer.style.overflow = 'hidden';
        }
        
        // 要素の組み立て
        this.elements.container.appendChild(this.elements.header);
        this.elements.container.appendChild(this.elements.body);
        this.elements.container.appendChild(this.elements.footer);
        
        this.elements.dialog.appendChild(this.elements.container);
        
        if (this.elements.announcer) {
            this.elements.dialog.appendChild(this.elements.announcer);
        }
        
        this.elements.backdrop.appendChild(this.elements.dialog);
        
        // DOMに追加
        document.body.appendChild(this.elements.backdrop);
    }
    
    /**
     * ヘッダーの作成
     */
    createHeader(): HTMLElement {
        const header = document.createElement('div');
        header.className = 'share-dialog-header';

        // タイトル
        const title = document.createElement('h2');
        title.id = 'share-dialog-title';
        title.className = 'share-dialog-title';
        title.textContent = this.config.title;

        // 閉じるボタン
        this.elements.closeButton = document.createElement('button');
        this.elements.closeButton.className = 'share-dialog-close';
        this.elements.closeButton.innerHTML = '✕';
        this.elements.closeButton.setAttribute('aria-label', '閉じる');
        this.elements.closeButton.setAttribute('type', 'button');
        
        header.appendChild(title);
        header.appendChild(this.elements.closeButton);
        
        return header;
    }
    
    /**
     * ボディの作成
     */
    createBody(): HTMLElement {
        const body = document.createElement('div');
        body.id = 'share-dialog-content';
        body.className = 'share-dialog-body';

        // スクリーンショットプレビュー
        if (this.config.showScreenshotPreview) {
            this.elements.screenshotPreview = document.createElement('div');
            this.elements.screenshotPreview.className = 'share-dialog-screenshot';
            this.elements.screenshotPreview.style.display = 'none';
            body.appendChild(this.elements.screenshotPreview);
        }

        // メッセージエディター
        if (this.config.allowMessageEdit) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'share-dialog-message-container';

            const messageLabel = document.createElement('label');
            messageLabel.className = 'share-dialog-message-label';
            messageLabel.textContent = 'メッセージ';
            messageLabel.setAttribute('for', 'share-message-editor');

            this.elements.messageEditor = document.createElement('textarea');
            this.elements.messageEditor.id = 'share-message-editor';
            this.elements.messageEditor.className = 'share-dialog-message-editor';
            this.elements.messageEditor.setAttribute('placeholder', '共有メッセージを入力...');
            this.elements.messageEditor.setAttribute('rows', '3');
            this.elements.messageEditor.setAttribute('maxlength', '280');
            
            messageContainer.appendChild(messageLabel);
            messageContainer.appendChild(this.elements.messageEditor);
            body.appendChild(messageContainer);
        }

        // プラットフォーム選択
        const platformsContainer = document.createElement('div');
        platformsContainer.className = 'share-dialog-platforms';
        platformsContainer.setAttribute('role', 'group');
        platformsContainer.setAttribute('aria-label', '共有プラットフォーム');
        
        // プラットフォームボタンの作成
        this.config.platforms.forEach((platform, index) => {
            const button = this.createPlatformButton(platform, index);
            this.elements.platforms.push(button);
            platformsContainer.appendChild(button);
        });
        
        body.appendChild(platformsContainer);
        
        return body;
    }
    
    /**
     * フッターの作成
     */
    createFooter(): HTMLElement {
        const footer = document.createElement('div');
        footer.className = 'share-dialog-footer';

        // キャンセルボタン
        const cancelButton = document.createElement('button');
        cancelButton.className = 'share-dialog-cancel';
        cancelButton.textContent = 'キャンセル';
        cancelButton.setAttribute('type', 'button');
        
        footer.appendChild(cancelButton);
        
        return footer;
    }
    
    /**
     * プラットフォームボタンの作成
     */
    createPlatformButton(platform: string, index: number): HTMLElement {
        const button = document.createElement('button');
        button.className = `share-dialog-platform share-dialog-platform-${platform}`;
        button.setAttribute('data-platform', platform);
        button.setAttribute('type', 'button');
        button.setAttribute('data-index', index.toString());

        const platformInfo = this.getPlatformInfo(platform);

        let content = '';
        
        if (this.config.showPlatformIcons) {
            const icon = this.getIcon(platform);
            content += `<span class="share-dialog-platform-icon">${icon}</span>`;
        }

        if (this.config.showPlatformLabels) {
            content += `<span class="share-dialog-platform-label">${platformInfo.label}</span>`;
        }

        button.innerHTML = content;
        button.setAttribute('aria-label', `${platformInfo.label}で共有`);
        
        return button;
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
        const backdrop = this.elements.backdrop!;
        const dialog = this.elements.dialog!;
        const styles = this.config.styles;

        // バックドロップスタイル
        Object.assign(backdrop.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: styles.backdropColor,
            zIndex: styles.zIndex.toString(),
            display: 'flex',
            alignItems: this.getVerticalAlignment(),
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        });
        
        // ダイアログスタイル
        Object.assign(dialog.style, {
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            borderRadius: styles.borderRadius,
            fontSize: styles.fontSize,
            fontFamily: styles.fontFamily,
            width: this.config.width === 'auto' ? 'auto' : `${this.config.width}px`,
            height: this.config.height === 'auto' ? 'auto' : `${this.config.height}px`,
            maxHeight: this.config.maxHeight,
            maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: this.config.animation ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            transform: 'scale(0.9)',
            opacity: '0'
        });
        
        // テーマ別スタイル
        this.applyThemeStyles();
        
        // レスポンシブスタイル
        this.applyResponsiveStyles();
        
        // アクセシビリティスタイル
        if (this.config.accessibility.enabled) {
            this.applyAccessibilityStyles();
        }
    }
    
    /**
     * 垂直配置の取得
     */
    getVerticalAlignment(): string {
        switch(this.config.position) {
            case 'top':
                return 'flex-start';
            case 'bottom':
                return 'flex-end';
            case 'center':
            default:
                return 'center';
        }
    }
    
    /**
     * テーマスタイルの適用
     */
    applyThemeStyles(): void {
        const dialog = this.elements.dialog!;

        switch(this.config.theme) {
            case 'minimal':
                Object.assign(dialog.style, {
                    backgroundColor: '#FAFAFA',
                    color: '#333333',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                });
                break;

            case 'elegant':
                Object.assign(dialog.style, {
                    backgroundColor: '#2D2D3A',
                    color: '#F0F0F0',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
                });
                break;

            case 'gaming':
                Object.assign(dialog.style, {
                    backgroundColor: '#0A0A0F',
                    color: '#00FF41',
                    border: '2px solid #00FF41',
                    boxShadow: '0 0 30px rgba(0, 255, 65, 0.3)'
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
            const dialog = this.elements.dialog!;

            Object.assign(dialog.style, {
                width: '100%',
                maxWidth: '100vw',
                height: 'auto',
                maxHeight: '100vh',
                borderRadius: '0',
                margin: '0'
            });
        }
    }
    
    /**
     * アクセシビリティスタイルの適用
     */
    applyAccessibilityStyles(): void {
        // 高コントラストモード
        if (this.config.accessibility.highContrast) {
            const dialog = this.elements.dialog!;

            Object.assign(dialog.style, {
                backgroundColor: '#000000',
                color: '#FFFFFF',
                border: '3px solid #FFFFFF'
            });
        }

        // 動きの軽減
        if (this.config.accessibility.reducedMotion) {
            const dialog = this.elements.dialog!;
            dialog.style.transition = 'none';
        }

        // フォーカス表示の強化
        const style = document.createElement('style');
        style.textContent = `
            .share-dialog-platform:focus,
            .share-dialog-close:focus,
            .share-dialog-cancel:focus,
            .share-dialog-message-editor:focus {
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
        // バックドロップクリック
        if (this.config.closeOnBackdrop) {
            this.elements.backdrop!.addEventListener('click', this.handlers.backdropClick);
        }

        // ESCキー
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', this.handlers.keydown);
        }

        // 閉じるボタン
        this.elements.closeButton!.addEventListener('click', this.handlers.close);

        // キャンセルボタン
        const cancelButton = this.elements.footer!.querySelector('.share-dialog-cancel') as HTMLElement;
        cancelButton.addEventListener('click', this.handlers.close);

        // プラットフォームボタン
        this.elements.platforms.forEach(button => {
            button.addEventListener('click', this.handlers.platformClick);
        });

        // メッセージエディター
        if (this.elements.messageEditor) {
            this.elements.messageEditor.addEventListener('input', this.handlers.messageChange);
        }

        // ウィンドウリサイズ
        window.addEventListener('resize', this.handlers.resize);
    }
    
    /**
     * アクセシビリティの設定
     */
    setupAccessibility(): void {
        // フォーカス可能要素の収集
        this.updateFocusableElements();

        // キーボードナビゲーション
        if (this.config.accessibility.keyboardNavigation) {
            this.setupKeyboardNavigation();
        }
    }
    
    /**
     * フォーカス可能要素の更新
     */
    updateFocusableElements(): void {
        const selector = `
            button:not([disabled]),
            input:not([disabled]),
            textarea:not([disabled]),
            select:not([disabled]),
            [tabindex]:not([tabindex="-1"])
        `;
        
        this.focusableElements = Array.from(
            this.elements.dialog!.querySelectorAll(selector)
        ) as HTMLElement[];
    }
    
    /**
     * キーボードナビゲーションの設定
     */
    setupKeyboardNavigation(): void {
        this.elements.dialog!.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
        });
    }
    
    /**
     * ダイアログの表示
     */
    async show(shareData: any = {}, screenshot: any = null): Promise<void> {
        if (this.state.visible || this.state.opening) {
            return;
        }
        
        try {
            this.state.opening = true;
            this.state.shareData = shareData;
            this.state.screenshot = screenshot;
            this.stats.shows++;
            
            // 現在のフォーカス要素を記録
            this.state.previousFocus = document.activeElement as HTMLElement;
            
            // スクリーンショット表示
            if (screenshot && this.elements.screenshotPreview) {
                this.showScreenshotPreview(screenshot);
            }
            
            // メッセージの初期化
            if (this.elements.messageEditor && shareData.text) {
                this.elements.messageEditor.value = shareData.text;
                this.state.editedMessage = shareData.text;
            }

            // バックドロップ表示
            this.elements.backdrop!.style.display = 'flex';
            
            // アニメーション
            if (this.config.animation) {
                await this.playShowAnimation();
            } else {
                this.elements.dialog!.style.transform = 'scale(1)';
                this.elements.dialog!.style.opacity = '1';
            }
            
            this.state.visible = true;
            this.state.opening = false;
            
            // フォーカス設定
            this.setInitialFocus();

            // アクセシビリティアナウンス
            if (this.config.accessibility.announcements && this.elements.announcer) {
                this.elements.announcer.textContent = `${this.config.title}ダイアログが開きました`;
            }

            this.log('ShareDialog表示');
        } catch (error) {
            this.state.opening = false;
            this.handleError('SHARE_DIALOG_SHOW_FAILED', error, { shareData, screenshot });
            throw error;
        }
    }
    
    /**
     * ダイアログの非表示
     */
    async hide(): Promise<void> {
        if (!this.state.visible || this.state.closing) {
            return;
        }
        
        try {
            this.state.closing = true;
            
            // アニメーション
            if (this.config.animation) {
                await this.playHideAnimation();
            }

            this.elements.backdrop!.style.display = 'none';
            
            this.state.visible = false;
            this.state.closing = false;

            // フォーカスを戻す
            this.restorePreviousFocus();

            // 状態のリセット
            this.resetState();

            this.log('ShareDialog非表示');
        } catch (error) {
            this.state.closing = false;
            this.handleError('SHARE_DIALOG_HIDE_FAILED', error);
        }
    }
    
    /**
     * 表示アニメーションの再生
     */
    async playShowAnimation(): Promise<void> {
        return new Promise((resolve) => {
            const dialog = this.elements.dialog!;

            requestAnimationFrame(() => {
                dialog.style.transform = 'scale(1)';
                dialog.style.opacity = '1';
                setTimeout(resolve, 300);
            });
        });
    }
    
    /**
     * 非表示アニメーションの再生
     */
    async playHideAnimation(): Promise<void> {
        return new Promise((resolve) => {
            const dialog = this.elements.dialog!;

            dialog.style.transform = 'scale(0.9)';
            dialog.style.opacity = '0';
            setTimeout(resolve, 300);
        });
    }
    
    /**
     * スクリーンショットプレビューの表示
     */
    showScreenshotPreview(screenshot: any): void {
        if (!this.elements.screenshotPreview) return;

        const img = document.createElement('img');
        img.src = screenshot.url;
        img.alt = 'スクリーンショットプレビュー';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';

        this.elements.screenshotPreview.innerHTML = '';
        this.elements.screenshotPreview.appendChild(img);
        this.elements.screenshotPreview.style.display = 'block';
    }
    
    /**
     * 初期フォーカスの設定
     */
    setInitialFocus(): void {
        if (!this.config.accessibility.enabled) return;
        
        let focusElement: HTMLElement | null = null;

        // カスタム初期フォーカス要素
        if (this.config.accessibility.focus.initialElement) {
            focusElement = this.config.accessibility.focus.initialElement;
        } else {
            // デフォルト: 最初のプラットフォームボタン
            focusElement = this.elements.platforms[0] || null;
        }

        if (focusElement && typeof focusElement.focus === 'function') {
            setTimeout(() => {
                focusElement!.focus();
            }, 100);
        }
    }
    
    /**
     * 前のフォーカスの復元
     */
    restorePreviousFocus(): void {
        if (!this.config.accessibility.enabled) return;
        
        const returnElement = this.config.accessibility.focus.returnElement || 
                             this.state.previousFocus;

        if (returnElement && typeof returnElement.focus === 'function') {
            setTimeout(() => {
                returnElement.focus();
            }, 100);
        }
    }
    
    /**
     * 状態のリセット
     */
    resetState(): void {
        this.state.shareData = null;
        this.state.screenshot = null;
        this.state.editedMessage = null;
        this.state.focusedElement = null;
        this.state.previousFocus = null;

        // スクリーンショットプレビューのクリア
        if (this.elements.screenshotPreview) {
            this.elements.screenshotPreview.innerHTML = '';
            this.elements.screenshotPreview.style.display = 'none';
        }

        // メッセージエディターのクリア
        if (this.elements.messageEditor) {
            this.elements.messageEditor.value = '';
        }
    }
    
    /**
     * バックドロップクリックハンドラー
     */
    handleBackdropClick(event: Event): void {
        if (event.target === this.elements.backdrop) {
            this.stats.cancellations++;
            this.hide();
        }
    }
    
    /**
     * キーボードハンドラー
     */
    handleKeydown(event: KeyboardEvent): void {
        if (!this.state.visible) return;

        switch(event.key) {
            case 'Escape':
                event.preventDefault();
                this.stats.cancellations++;
                this.hide();
                break;
        }
    }
    
    /**
     * Tabナビゲーションハンドラー
     */
    handleTabNavigation(event: KeyboardEvent): void {
        if (!this.config.accessibility.focus.trap) return;
        
        if (this.focusableElements.length === 0) return;
        
        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift + Tab
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
     * 閉じるハンドラー
     */
    handleClose(): void {
        this.stats.cancellations++;
        this.hide();
    }
    
    /**
     * プラットフォームクリックハンドラー
     */
    async handlePlatformClick(event: Event): Promise<void> {
        const button = event.currentTarget as HTMLElement;
        const platform = button.getAttribute('data-platform');
        
        if (!platform) return;

        try {
            // 統計の更新
            this.stats.shares++;
            if (!this.stats.platforms[platform]) {
                this.stats.platforms[platform] = 0;
            }
            this.stats.platforms[platform]++;
            
            // 共有データの準備
            const shareData = {
                ...this.state.shareData,
                text: this.state.editedMessage || this.state.shareData?.text
            };

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
                await this.hide();
            } else {
                this.handleShareError(platform, result?.error || 'Unknown error');
            }
        } catch (error) {
            this.handleShareError(platform, error);
        }
    }
    
    /**
     * メッセージ変更ハンドラー
     */
    handleMessageChange(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.state.editedMessage = target.value;
        this.stats.messageEdits++;
    }
    
    /**
     * リサイズハンドラー
     */
    handleResize(): void {
        this.applyResponsiveStyles();
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
     * 設定の更新
     */
    updateConfig(newConfig: Partial<ShareDialogOptions>): void {
        this.config = { ...this.config, ...newConfig } as ShareDialogConfig;

        // スタイルの再適用
        this.applyStyles();
        this.log('ShareDialog設定更新', newConfig);
    }
    
    /**
     * 統計の取得
     */
    getStats(): ShareDialogStats {
        return { ...this.stats };
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        // 非表示
        if (this.state.visible) {
            this.hide();
        }

        document.removeEventListener('keydown', this.handlers.keydown);
        window.removeEventListener('resize', this.handlers.resize);

        // DOM要素の削除
        if (this.elements.backdrop && this.elements.backdrop.parentNode) {
            this.elements.backdrop.parentNode.removeChild(this.elements.backdrop);
        }

        this.log('ShareDialog破棄完了');
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

        if (ErrorHandler) {
            ErrorHandler.handleError(error, 'ShareDialog', context);
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

        console[consoleMethod](`[ShareDialog] ${message}`, data || '');
    }
}