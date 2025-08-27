/**
 * Help Accessibility Manager
 * ヘルプシーンアクセシビリティ管理 - アクセシビリティ機能の統合管理
 */

/**
 * Help Accessibility Manager
 * アクセシビリティ機能統合管理器 - スクリーンリーダー、キーボードナビゲーション、UI配慮
 */
export class HelpAccessibilityManager {
    constructor(gameEngine, accessibilityManager) {
        this.gameEngine = gameEngine;
        this.accessibilityManager = accessibilityManager;
        
        // アクセシビリティ状態
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.announcementQueue = [];
        this.ariaLabels = new Map();
        this.screenReaderMode = false;
        this.highContrastMode = false;
        this.largeTextMode = false;
        
        // 音声フィードバック
        this.audioFeedbackEnabled = true;
        this.announceNavigation = true;
        
        this.initialize();
    }

    async initialize() {
        try {
            // フォーカス可能要素の定義
            this.focusableElements = [
                { id: 'searchBar', type: 'input', label: 'help.searchBar.label' },
                { id: 'categoryList', type: 'list', label: 'help.categoryList.label' },
                { id: 'topicList', type: 'list', label: 'help.topicList.label' },
                { id: 'contentArea', type: 'region', label: 'help.contentArea.label' },
                { id: 'backButton', type: 'button', label: 'help.backButton.label' }
            ];
            
            // ARIAラベルの設定
            this.setupAriaLabels();
            
            // スクリーンリーダー対応の準備
            this.prepareScreenReaderSupport();
            
            console.log('HelpAccessibilityManager initialized');
            
        } catch (error) {
            console.error('Failed to initialize HelpAccessibilityManager:', error);
        }
    }

    /**
     * ARIAラベルの設定
     */
    setupAriaLabels() {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        this.ariaLabels.set('searchBar', {
            label: t('help.accessibility.searchBar', 'ヘルプを検索するための入力フィールド'),
            role: 'searchbox',
            description: t('help.accessibility.searchBarDesc', 'キーワードを入力してヘルプコンテンツを検索できます')
        });
        
        this.ariaLabels.set('categoryList', {
            label: t('help.accessibility.categoryList', 'ヘルプカテゴリ一覧'),
            role: 'listbox',
            description: t('help.accessibility.categoryListDesc', '矢印キーで移動、Enterで選択')
        });

        this.ariaLabels.set('topicList', {
            label: t('help.accessibility.topicList', 'トピック一覧'),
            role: 'listbox',
            description: t('help.accessibility.topicListDesc', '選択されたカテゴリのトピック一覧')
        });

        this.ariaLabels.set('contentArea', {
            label: t('help.accessibility.contentArea', 'ヘルプコンテンツ表示エリア'),
            role: 'region',
            description: t('help.accessibility.contentAreaDesc', '選択されたトピックの詳細情報')
        });

        this.ariaLabels.set('backButton', {
            label: t('help.accessibility.backButton', '戻るボタン'),
            role: 'button',
            description: t('help.accessibility.backButtonDesc', 'メインメニューに戻ります')
        });
    }

    /**
     * スクリーンリーダー対応の準備
     */
    prepareScreenReaderSupport() {
        // スクリーンリーダーの検出
        this.detectScreenReader();
        
        // 自動アナウンス設定
        this.setupAutoAnnouncements();
    }

    detectScreenReader() {
        // スクリーンリーダーの検出（簡易版）
        const userAgent = navigator.userAgent.toLowerCase();
        this.screenReaderMode = userAgent.includes('nvda') || 
                               userAgent.includes('jaws') || 
                               userAgent.includes('voiceover') ||
                               window.speechSynthesis !== undefined;
    }

    setupAutoAnnouncements() {
        // 自動アナウンス機能の設定
        this.announceOnFocusChange = true;
        this.announceOnContentChange = true;
        this.announceOnSearchResults = true;
    }

    enableScreenReaderMode() {
        this.screenReaderMode = true;
        this.announceToScreenReader('help.accessibility.screenReaderEnabled', 'assertive');
        
        // スクリーンリーダー向けの追加設定
        this.enableDetailedDescriptions = true;
        this.enableNavigationAnnouncements = true;
        this.enableProgressAnnouncements = true;
        
        // UI調整
        this.enableHighContrastMode();
        this.enableLargeTextMode();
    }

    announceToScreenReader(message, priority = 'polite') {
        if (this.screenReaderMode && this.accessibilityManager) {
            this.safeCall(this.accessibilityManager, 'announce', message, priority);
            this.announcementQueue.push({ message, priority, timestamp: Date.now() });
        }
    }

    /**
     * Safe method call - prevents errors from undefined methods
     * @param {Object} obj - Object to call method on
     * @param {string} methodName - Method name
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} Method result or undefined if method doesn't exist
     */
    safeCall(obj, methodName, ...args) {
        try {
            if (obj && typeof obj[methodName] === 'function') {
                return obj[methodName](...args);
            } else {
                console.warn(`HelpAccessibilityManager: Method ${methodName} does not exist on accessibility manager, skipping call`);
                return undefined;
            }
        } catch (error) {
            console.warn(`HelpAccessibilityManager: Error calling ${methodName}:`, error);
            return undefined;
        }
    }

    /**
     * アクセシビリティキーの処理
     */
    handleAccessibilityKeys(event) {
        // F1: アクセシビリティヘルプ
        if (event.key === 'F1') {
            event.preventDefault();
            this.showAccessibilityHelp();
            return true;
        }

        // Alt+H: キーボードショートカット一覧
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            this.announceKeyboardShortcuts();
            return true;
        }

        // Ctrl+Shift+?: 詳細なアクセシビリティ機能トグル
        if (event.ctrlKey && event.shiftKey && event.key === '?') {
            event.preventDefault();
            this.toggleAccessibilityFeatures();
            return true;
        }

        return false;
    }

    /**
     * ナビゲーション変更のアナウンス
     */
    announceNavigationChange(key, categories, selectedCategory, selectedTopicIndex, isSearching, searchResults) {
        if (!this.announceNavigation) return;
        
        let message = '';
        
        switch (key) {
        case 'ArrowUp':
        case 'ArrowDown':
            if (categories && selectedCategory) {
                const category = categories.find(c => c.id === selectedCategory);
                if (category && category.topics[selectedTopicIndex]) {
                    message = `${category.topics[selectedTopicIndex].title}が選択されました`;
                }
            }
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            const selectedCat = categories.find(c => c.id === selectedCategory);
            if (selectedCat) {
                message = `カテゴリ：${selectedCat.key}が選択されました`;
            }
            break;
        case 'Enter':
            if (isSearching) {
                message = `検索結果から選択されました`;
            } else {
                message = `トピックが選択されました`;
            }
            break;
        }
        
        if (message) {
            this.announceToScreenReader(message);
        }
    }

    showAccessibilityHelp() {
        const helpMessage = `
            ヘルプシーンのアクセシビリティ機能：
            - 矢印キー：ナビゲーション
            - Enter：選択
            - Escape：戻る
            - Tab：フォーカス移動
            - /：検索バーにフォーカス
            - F1：このヘルプ
            - Alt+H：キーボードショートカット一覧
            - Ctrl+F：フィードバック送信
            - Ctrl+Shift+E：効果測定レポート表示
        `;
        
        this.announceToScreenReader(helpMessage, 'assertive');
    }

    announceCurrentElementDetails() {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (currentElement && this.ariaLabels.has(currentElement.id)) {
            const ariaInfo = this.ariaLabels.get(currentElement.id);
            this.announceToScreenReader(`${ariaInfo.label}。${ariaInfo.description}`, 'polite');
        }
    }

    announceKeyboardShortcuts() {
        const shortcuts = [
            '矢印キー：ナビゲーション',
            'Enter：選択',
            'Escape：戻る',
            'Tab：フォーカス移動',
            '/：検索',
            'F1：ヘルプ'
        ].join('、');
        
        this.announceToScreenReader(`キーボードショートカット：${shortcuts}`, 'polite');
    }

    enableAccessibilityFeatures() {
        this.screenReaderMode = true;
        if (this.accessibilityManager) {
            // Safe call mechanism - call methods only if they exist
            this.safeCall(this.accessibilityManager, 'enableHighContrast');
            this.safeCall(this.accessibilityManager, 'enableLargeText');
            this.safeCall(this.accessibilityManager, 'enableAudioCues');
            this.safeCall(this.accessibilityManager, 'enableKeyboardNavigation');
            this.safeCall(this.accessibilityManager, 'enableScreenReaderSupport');
        }
        
        this.enableHighContrastMode();
        this.enableLargeTextMode();
        
        this.announceToScreenReader('アクセシビリティ機能が有効になりました', 'assertive');
    }

    disableAccessibilityFeatures() {
        this.screenReaderMode = false;
        
        if (this.accessibilityManager) {
            // Safe call mechanism - call methods only if they exist
            this.safeCall(this.accessibilityManager, 'disableHighContrast');
            this.safeCall(this.accessibilityManager, 'disableLargeText');
            this.safeCall(this.accessibilityManager, 'disableAudioCues');
        }
        
        this.disableHighContrastMode();
        this.disableLargeTextMode();
    }

    toggleAccessibilityFeatures() {
        if (this.screenReaderMode) {
            this.disableAccessibilityFeatures();
        } else {
            this.enableAccessibilityFeatures();
        }
    }

    enableHighContrastMode() {
        this.highContrastMode = true;
        document.body.classList.add('high-contrast-help');
    }

    disableHighContrastMode() {
        this.highContrastMode = false;
        document.body.classList.remove('high-contrast-help');
    }

    enableLargeTextMode() {
        this.largeTextMode = true;
        document.body.classList.add('large-text-help');
    }

    disableLargeTextMode() {
        this.largeTextMode = false;
        document.body.classList.remove('large-text-help');
    }

    /**
     * タブナビゲーション処理
     */
    handleTabNavigation(event) {
        event.preventDefault();
        
        if (event.shiftKey) {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        } else {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
        }
        
        this.announceCurrentElementDetails();
    }

    /**
     * フォーカス管理
     */
    setFocusIndex(index) {
        if (index >= 0 && index < this.focusableElements.length) {
            this.currentFocusIndex = index;
            this.announceCurrentElementDetails();
        }
    }

    getCurrentFocusIndex() {
        return this.currentFocusIndex;
    }

    getFocusableElements() {
        return [...this.focusableElements];
    }

    getAriaLabel(elementId) {
        return this.ariaLabels.get(elementId);
    }

    // 状態取得
    getAccessibilityState() {
        return {
            screenReaderMode: this.screenReaderMode,
            highContrastMode: this.highContrastMode,
            largeTextMode: this.largeTextMode,
            currentFocusIndex: this.currentFocusIndex,
            announcementQueueLength: this.announcementQueue.length
        };
    }

    // クリーンアップ
    destroy() {
        this.disableAccessibilityFeatures();
        this.announcementQueue.length = 0;
        this.ariaLabels.clear();
        this.focusableElements.length = 0;
    }
}

/**
 * Help Accessibility Renderer
 * アクセシビリティレンダラー - アクセシビリティ向けUI描画補助
 */
export class HelpAccessibilityRenderer {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
    }

    /**
     * フォーカスインジケーターの描画
     */
    renderFocusIndicator(ctx, rect, focused = false) {
        if (!focused || !this.accessibilityManager.screenReaderMode) return;

        ctx.save();
        ctx.strokeStyle = this.accessibilityManager.highContrastMode ? '#FFFF00' : '#4A90E2';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4);
        ctx.restore();
    }

    /**
     * 高コントラスト対応色の取得
     */
    getAccessibleColor(baseColor, type = 'text') {
        if (!this.accessibilityManager.highContrastMode) {
            return baseColor;
        }

        switch (type) {
        case 'text':
            return '#FFFFFF';
        case 'background':
            return '#000000';
        case 'selected':
            return '#FFFF00';
        case 'border':
            return '#FFFFFF';
        default:
            return baseColor;
        }
    }

    /**
     * 大きなテキスト対応フォントサイズ
     */
    getAccessibleFontSize(baseFontSize) {
        if (this.accessibilityManager.largeTextMode) {
            return Math.floor(baseFontSize * 1.5);
        }
        return baseFontSize;
    }

    /**
     * アクセシブルなテキスト描画
     */
    renderAccessibleText(ctx, text, x, y, options = {}) {
        const fontSize = this.getAccessibleFontSize(options.fontSize || 16);
        const color = this.getAccessibleColor(options.color || '#FFFFFF', 'text');
        
        ctx.save();
        ctx.font = `${options.bold ? 'bold ' : ''}${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = options.align || 'left';
        ctx.textBaseline = options.baseline || 'top';
        
        // 高コントラストモードでの縁取り
        if (this.accessibilityManager.highContrastMode && options.outline) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(text, x, y);
        }
        
        ctx.fillText(text, x, y);
        ctx.restore();
    }
}