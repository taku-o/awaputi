import { Scene } from '../core/Scene.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { LoggingSystem } from '../core/LoggingSystem.js';
import { AccessibilityManager } from '../core/AccessibilityManager.js';

/**
 * ヘルプシーン
 * 包括的なヘルプ表示とナビゲーション機能を提供
 */
export class HelpScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // アクセシビリティ管理
        this.accessibilityManager = gameEngine.accessibilityManager || new AccessibilityManager(gameEngine);
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.announcementQueue = [];
        this.ariaLabels = new Map();
        
        // ヘルプ管理
        this.helpManager = null;
        this.searchEngine = null;
        
        // UI状態
        this.selectedCategory = 'gameplay';
        this.selectedTopicIndex = 0;
        this.currentContent = null;
        this.searchQuery = '';
        this.searchResults = [];
        this.isSearching = false;
        
        // アニメーション状態
        this.animations = {
            contentTransition: {
                isActive: false,
                startTime: 0,
                duration: 300, // 300ms
                fromContent: null,
                toContent: null,
                progress: 0,
                type: 'slide' // 'slide', 'fade', 'scale'
            },
            categoryTransition: {
                isActive: false,
                startTime: 0,
                duration: 200,
                fromIndex: 0,
                toIndex: 0,
                progress: 0
            },
            searchTransition: {
                isActive: false,
                startTime: 0,
                duration: 250,
                isEntering: true,
                progress: 0
            }
        };
        
        // レイアウト設定
        this.layout = {
            sidebar: {
                x: 50,
                y: 80,
                width: 250,
                height: 400
            },
            content: {
                x: 320,
                y: 80,
                width: 450,
                height: 400
            },
            searchBar: {
                x: 50,
                y: 30,
                width: 720,
                height: 40
            },
            backButton: {
                x: 50,
                y: 500,
                width: 100,
                height: 40
            }
        };
        
        // ヘルプカテゴリ
        this.categories = [
            { id: 'gameplay', key: 'help.categories.gameplay', topics: [] },
            { id: 'bubbles', key: 'help.categories.bubbles', topics: [] },
            { id: 'controls', key: 'help.categories.controls', topics: [] },
            { id: 'scoring', key: 'help.categories.scoring', topics: [] },
            { id: 'settings', key: 'help.categories.settings', topics: [] },
            { id: 'troubleshooting', key: 'help.categories.troubleshooting', topics: [] }
        ];
        
        // キーボードショートカット
        this.keyboardHandlers = {
            'ArrowUp': () => this.navigateUp(),
            'ArrowDown': () => this.navigateDown(),
            'ArrowLeft': () => this.navigateLeft(),
            'ArrowRight': () => this.navigateRight(),
            'Enter': () => this.selectCurrentItem(),
            'Escape': () => this.goBack(),
            'Tab': (event) => this.handleTabNavigation(event),
            '/': (event) => { event.preventDefault(); this.focusSearchBar(); }
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    async initialize() {
        try {
            // アクセシビリティの初期化
            await this.initializeAccessibility();
            
            // ヘルプマネージャーとの統合
            if (this.gameEngine.helpManager) {
                this.helpManager = this.gameEngine.helpManager;
                this.searchEngine = this.helpManager.searchEngine;
            }
            
            // ヘルプコンテンツの読み込み
            await this.loadHelpContent();
            
            // 検索インデックスの構築
            if (this.searchEngine) {
                await this.searchEngine.buildIndex();
            }
            
            this.loggingSystem.info('HelpScene', 'Help scene initialized successfully');
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Failed to initialize help scene', error);
            ErrorHandler.handle(error, 'HelpScene.initialize');
        }
    }
    
    /**
     * アクセシビリティ機能の初期化
     */
    async initializeAccessibility() {
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
            
            this.loggingSystem.debug('HelpScene', 'Accessibility initialized');
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Failed to initialize accessibility', error);
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
            role: 'main',
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
        // スクリーンリーダーが検出された場合の特別な処理
        if (this.accessibilityManager.getState().screenReaderDetected) {
            this.enableScreenReaderMode();
        }
    }
    
    /**
     * スクリーンリーダーモードの有効化
     */
    enableScreenReaderMode() {
        // 音声による案内の有効化
        this.screenReaderMode = true;
        
        // コンテンツ変更時の自動読み上げ設定
        this.autoAnnounceContentChanges = true;
        
        this.loggingSystem.info('HelpScene', 'Screen reader mode enabled');
    }
    
    /**
     * スクリーンリーダーへのアナウンス
     * @param {string} message - アナウンスメッセージ
     * @param {string} priority - 優先度 (polite|assertive)
     */
    announceToScreenReader(message, priority = 'polite') {
        if (this.screenReaderMode && this.accessibilityManager) {
            this.accessibilityManager.announceToScreenReader(message, priority);
        }
    }
    
    /**
     * ヘルプコンテンツの読み込み
     */
    async loadHelpContent() {
        try {
            if (!this.helpManager) {
                return;
            }
            
            // カテゴリ別コンテンツの読み込み
            for (const category of this.categories) {
                const topics = await this.helpManager.getHelpTopics(category.id);
                category.topics = topics || [];
            }
            
            // デフォルトコンテンツの設定
            await this.loadCategoryContent(this.selectedCategory);
            
            this.loggingSystem.debug('HelpScene', 'Help content loaded successfully');
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Failed to load help content', error);
        }
    }
    
    /**
     * カテゴリコンテンツの読み込み
     * @param {string} categoryId - カテゴリID
     */
    async loadCategoryContent(categoryId) {
        try {
            const category = this.categories.find(cat => cat.id === categoryId);
            if (!category || !category.topics.length) {
                this.currentContent = null;
                return;
            }
            
            // 最初のトピックを選択
            this.selectedTopicIndex = 0;
            const firstTopic = category.topics[0];
            
            if (this.helpManager) {
                this.currentContent = await this.helpManager.getHelpContent(firstTopic.id);
            }
            
            this.loggingSystem.debug('HelpScene', `Category content loaded: ${categoryId}`);
        } catch (error) {
            this.loggingSystem.error('HelpScene', `Failed to load category content: ${categoryId}`, error);
        }
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.selectedCategory = 'gameplay';
        this.selectedTopicIndex = 0;
        this.searchQuery = '';
        this.searchResults = [];
        this.isSearching = false;
        this.currentFocusIndex = 0;
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // アクセシビリティ機能の有効化
        this.enableAccessibilityFeatures();
        
        // コンテンツの再読み込み
        this.loadCategoryContent(this.selectedCategory);
        
        // スクリーンリーダーへの入場アナウンス
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        this.announceToScreenReader(t('help.accessibility.sceneEntered', 'ヘルプシーンに入りました。F1キーでキーボードショートカットを確認できます。'));
        
        this.loggingSystem.info('HelpScene', 'Help scene entered');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        // イベントリスナーの削除
        this.removeEventListeners();
        
        // アクセシビリティ機能の無効化
        this.disableAccessibilityFeatures();
        
        this.loggingSystem.info('HelpScene', 'Help scene exited');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        this.boundKeyHandler = (event) => this.handleKeyPress(event);
        document.addEventListener('keydown', this.boundKeyHandler);
        
        this.boundClickHandler = (event) => this.handleClick(event);
        document.addEventListener('click', this.boundClickHandler);
    }
    
    /**
     * イベントリスナーの削除
     */
    removeEventListeners() {
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
        
        if (this.boundClickHandler) {
            document.removeEventListener('click', this.boundClickHandler);
            this.boundClickHandler = null;
        }
    }
    
    /**
     * キーボード入力処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyPress(event) {
        // アクセシビリティモードでの特別なキー処理
        if (this.handleAccessibilityKeys(event)) {
            return;
        }
        
        const handler = this.keyboardHandlers[event.key];
        if (handler) {
            event.preventDefault();
            handler(event);
            
            // スクリーンリーダーへのフィードバック
            this.announceNavigationChange(event.key);
        }
    }
    
    /**
     * アクセシビリティ関連のキー処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} 処理された場合true
     */
    handleAccessibilityKeys(event) {
        // F1キー: アクセシビリティヘルプの表示
        if (event.key === 'F1') {
            event.preventDefault();
            this.showAccessibilityHelp();
            return true;
        }
        
        // Alt + H: 現在の要素の詳細説明
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            this.announceCurrentElementDetails();
            return true;
        }
        
        // Ctrl + Shift + ?: キーボードショートカット一覧
        if (event.ctrlKey && event.shiftKey && event.key === '?') {
            event.preventDefault();
            this.announceKeyboardShortcuts();
            return true;
        }
        
        return false;
    }
    
    /**
     * ナビゲーション変更のアナウンス
     * @param {string} key - 押されたキー
     */
    announceNavigationChange(key) {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        let message = '';
        
        switch (key) {
            case 'ArrowUp':
            case 'ArrowDown':
                const category = this.categories.find(cat => cat.id === this.selectedCategory);
                if (category && category.topics[this.selectedTopicIndex]) {
                    message = t('help.accessibility.topicSelected', 
                              `選択中: ${category.topics[this.selectedTopicIndex].title}`);
                }
                break;
                
            case 'ArrowLeft':
            case 'ArrowRight':
                const selectedCat = this.categories.find(cat => cat.id === this.selectedCategory);
                if (selectedCat) {
                    message = t('help.accessibility.categorySelected', 
                              `カテゴリ選択中: ${t(selectedCat.key, selectedCat.id)}`);
                }
                break;
                
            case 'Enter':
                if (this.isSearching) {
                    message = t('help.accessibility.searchResultSelected', '検索結果を選択しました');
                } else {
                    message = t('help.accessibility.topicOpened', 'トピックを開きました');
                }
                break;
                
            case 'Escape':
                if (this.isSearching) {
                    message = t('help.accessibility.searchClosed', '検索を終了しました');
                } else {
                    message = t('help.accessibility.returningToMenu', 'メインメニューに戻ります');
                }
                break;
        }
        
        if (message) {
            this.announceToScreenReader(message);
        }
    }
    
    /**
     * アクセシビリティヘルプの表示
     */
    showAccessibilityHelp() {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const helpText = t('help.accessibility.helpText', 
            'ヘルプシーンのキーボードショートカット:\n' +
            '矢印キー: ナビゲーション\n' +
            'Enter: 選択\n' +
            'Escape: 戻る\n' +
            'Tab: フォーカス移動\n' +
            '/: 検索バーにフォーカス\n' +
            'F1: このヘルプ\n' +
            'Alt+H: 詳細説明\n' +
            'Ctrl+Shift+?: ショートカット一覧'
        );
        
        this.announceToScreenReader(helpText, 'assertive');
    }
    
    /**
     * 現在の要素の詳細説明
     */
    announceCurrentElementDetails() {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (currentElement && this.ariaLabels.has(currentElement.id)) {
            const ariaInfo = this.ariaLabels.get(currentElement.id);
            const message = `${ariaInfo.label}. ${ariaInfo.description}`;
            this.announceToScreenReader(message, 'assertive');
        }
    }
    
    /**
     * キーボードショートカット一覧のアナウンス
     */
    announceKeyboardShortcuts() {
        this.showAccessibilityHelp();
    }
    
    /**
     * アクセシビリティ機能の有効化
     */
    enableAccessibilityFeatures() {
        // AccessibilityManagerに現在のシーンを通知
        if (this.accessibilityManager) {
            this.accessibilityManager.setCurrentScene('HelpScene');
            this.accessibilityManager.setFocusableElements(this.focusableElements);
        }
        
        // 高コントラストモードの確認
        if (this.accessibilityManager && this.accessibilityManager.getState().highContrastEnabled) {
            this.enableHighContrastMode();
        }
        
        // 大きな文字サイズの確認
        if (this.accessibilityManager && this.accessibilityManager.getState().largeTextEnabled) {
            this.enableLargeTextMode();
        }
    }
    
    /**
     * アクセシビリティ機能の無効化
     */
    disableAccessibilityFeatures() {
        // 特別なモードの解除
        this.disableHighContrastMode();
        this.disableLargeTextMode();
        
        // AccessibilityManagerのクリーンアップ
        if (this.accessibilityManager) {
            this.accessibilityManager.clearCurrentScene();
        }
    }
    
    /**
     * 高コントラストモードの有効化
     */
    enableHighContrastMode() {
        this.highContrastMode = true;
        this.loggingSystem.debug('HelpScene', 'High contrast mode enabled');
    }
    
    /**
     * 高コントラストモードの無効化
     */
    disableHighContrastMode() {
        this.highContrastMode = false;
    }
    
    /**
     * 大きな文字サイズモードの有効化
     */
    enableLargeTextMode() {
        this.largeTextMode = true;
        this.textSizeMultiplier = 1.3;
        this.loggingSystem.debug('HelpScene', 'Large text mode enabled');
    }
    
    /**
     * 大きな文字サイズモードの無効化
     */
    disableLargeTextMode() {
        this.largeTextMode = false;
        this.textSizeMultiplier = 1.0;
    }
    
    /**
     * クリック処理
     * @param {MouseEvent} event - マウスイベント
     */
    handleClick(event) {
        const rect = this.gameEngine.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 検索バークリック
        if (this.isPointInRect(x, y, this.layout.searchBar)) {
            this.focusSearchBar();
            return;
        }
        
        // サイドバークリック（カテゴリ・トピック選択）
        if (this.isPointInRect(x, y, this.layout.sidebar)) {
            this.handleSidebarClick(x, y);
            return;
        }
        
        // 戻るボタンクリック
        if (this.isPointInRect(x, y, this.layout.backButton)) {
            this.goBack();
            return;
        }
    }
    
    /**
     * サイドバークリック処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    handleSidebarClick(x, y) {
        const relativeY = y - this.layout.sidebar.y;
        const itemHeight = 30;
        
        // カテゴリクリック検出
        let currentY = 0;
        for (let i = 0; i < this.categories.length; i++) {
            if (relativeY >= currentY && relativeY < currentY + itemHeight) {
                this.selectCategory(this.categories[i].id);
                return;
            }
            currentY += itemHeight;
            
            // 選択されたカテゴリのトピック表示
            if (this.categories[i].id === this.selectedCategory) {
                for (let j = 0; j < this.categories[i].topics.length; j++) {
                    if (relativeY >= currentY && relativeY < currentY + itemHeight - 5) {
                        this.selectTopic(j);
                        return;
                    }
                    currentY += itemHeight - 5;
                }
            }
        }
    }
    
    /**
     * 検索実行
     * @param {string} query - 検索クエリ
     */
    async performSearch(query) {
        try {
            if (!this.searchEngine) {
                return;
            }
            
            const wasSearching = this.isSearching;
            this.isSearching = true;
            this.searchQuery = query;
            
            // 検索モードに入る際のアニメーション
            if (!wasSearching && query.trim() !== '') {
                this.startSearchTransition(true);
            }
            
            if (query.trim() === '') {
                this.searchResults = [];
                this.isSearching = false;
                // 検索モードから出る際のアニメーション
                if (wasSearching) {
                    this.startSearchTransition(false);
                }
                return;
            }
            
            this.searchResults = await this.searchEngine.search(query, {
                maxResults: 20,
                categories: this.categories.map(cat => cat.id)
            });
            
            this.loggingSystem.debug('HelpScene', `Search completed: ${this.searchResults.length} results`);
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Search failed', error);
            this.searchResults = [];
        } finally {
            this.isSearching = false;
        }
    }
    
    /**
     * カテゴリ選択
     * @param {string} categoryId - カテゴリID
     */
    async selectCategory(categoryId) {
        if (this.selectedCategory === categoryId) {
            return;
        }
        
        const fromIndex = this.categories.findIndex(cat => cat.id === this.selectedCategory);
        const toIndex = this.categories.findIndex(cat => cat.id === categoryId);
        
        // カテゴリ遷移アニメーションを開始
        if (fromIndex !== -1 && toIndex !== -1) {
            this.startCategoryTransition(fromIndex, toIndex);
        }
        
        this.selectedCategory = categoryId;
        this.selectedTopicIndex = 0;
        this.searchResults = [];
        this.isSearching = false;
        
        await this.loadCategoryContent(categoryId);
    }
    
    /**
     * トピック選択
     * @param {number} index - トピックインデックス
     */
    async selectTopic(index) {
        const category = this.categories.find(cat => cat.id === this.selectedCategory);
        if (!category || index < 0 || index >= category.topics.length) {
            return;
        }
        
        this.selectedTopicIndex = index;
        const topic = category.topics[index];
        
        try {
            if (this.helpManager) {
                const newContent = await this.helpManager.getHelpContent(topic.id);
                
                // アニメーション付きでコンテンツを変更
                if (this.currentContent && newContent) {
                    this.startContentTransition(newContent, 'slide');
                } else {
                    this.currentContent = newContent;
                }
            }
        } catch (error) {
            this.loggingSystem.error('HelpScene', `Failed to load topic content: ${topic.id}`, error);
        }
    }

    /**
     * コンテンツ遷移アニメーションの開始
     * @param {Object} newContent - 新しいコンテンツ
     * @param {string} transitionType - 遷移タイプ ('slide', 'fade', 'scale')
     */
    startContentTransition(newContent, transitionType = 'slide') {
        if (this.animations.contentTransition.isActive) {
            return; // 既に遷移中の場合は何もしない
        }
        
        this.animations.contentTransition = {
            isActive: true,
            startTime: Date.now(),
            duration: 300,
            fromContent: this.currentContent,
            toContent: newContent,
            progress: 0,
            type: transitionType
        };
        
        this.loggingSystem.debug('HelpScene', `Content transition started: ${transitionType}`);
    }
    
    /**
     * カテゴリ遷移アニメーションの開始
     * @param {number} fromIndex - 元のカテゴリインデックス
     * @param {number} toIndex - 新しいカテゴリインデックス
     */
    startCategoryTransition(fromIndex, toIndex) {
        if (this.animations.categoryTransition.isActive) {
            return;
        }
        
        this.animations.categoryTransition = {
            isActive: true,
            startTime: Date.now(),
            duration: 200,
            fromIndex: fromIndex,
            toIndex: toIndex,
            progress: 0
        };
        
        this.loggingSystem.debug('HelpScene', `Category transition started: ${fromIndex} -> ${toIndex}`);
    }
    
    /**
     * 検索遷移アニメーションの開始
     * @param {boolean} isEntering - 検索モードに入るかどうか
     */
    startSearchTransition(isEntering) {
        this.animations.searchTransition = {
            isActive: true,
            startTime: Date.now(),
            duration: 250,
            isEntering: isEntering,
            progress: 0
        };
        
        this.loggingSystem.debug('HelpScene', `Search transition started: ${isEntering ? 'entering' : 'exiting'}`);
    }
    
    /**
     * イージング関数 - ease-out
     * @param {number} t - 進捗 (0-1)
     * @returns {number} イージングされた値
     */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * イージング関数 - ease-in-out
     * @param {number} t - 進捗 (0-1)
     * @returns {number} イージングされた値
     */
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * アニメーション更新処理
     * @param {number} currentTime - 現在時刻
     */
    updateAnimations(currentTime) {
        // コンテンツ遷移アニメーション
        if (this.animations.contentTransition.isActive) {
            const elapsed = currentTime - this.animations.contentTransition.startTime;
            const progress = Math.min(elapsed / this.animations.contentTransition.duration, 1);
            
            this.animations.contentTransition.progress = this.easeOut(progress);
            
            if (progress >= 1) {
                // アニメーション完了
                this.currentContent = this.animations.contentTransition.toContent;
                this.animations.contentTransition.isActive = false;
                this.loggingSystem.debug('HelpScene', 'Content transition completed');
            }
        }
        
        // カテゴリ遷移アニメーション
        if (this.animations.categoryTransition.isActive) {
            const elapsed = currentTime - this.animations.categoryTransition.startTime;
            const progress = Math.min(elapsed / this.animations.categoryTransition.duration, 1);
            
            this.animations.categoryTransition.progress = this.easeInOut(progress);
            
            if (progress >= 1) {
                this.animations.categoryTransition.isActive = false;
                this.loggingSystem.debug('HelpScene', 'Category transition completed');
            }
        }
        
        // 検索遷移アニメーション
        if (this.animations.searchTransition.isActive) {
            const elapsed = currentTime - this.animations.searchTransition.startTime;
            const progress = Math.min(elapsed / this.animations.searchTransition.duration, 1);
            
            this.animations.searchTransition.progress = this.easeOut(progress);
            
            if (progress >= 1) {
                this.animations.searchTransition.isActive = false;
                this.loggingSystem.debug('HelpScene', 'Search transition completed');
            }
        }
    }
    
    /**
     * ナビゲーション処理
     */
    navigateUp() {
        if (this.isSearching && this.searchResults.length > 0) {
            this.selectedTopicIndex = Math.max(0, this.selectedTopicIndex - 1);
        } else {
            const category = this.categories.find(cat => cat.id === this.selectedCategory);
            if (category) {
                this.selectedTopicIndex = Math.max(0, this.selectedTopicIndex - 1);
                this.selectTopic(this.selectedTopicIndex);
            }
        }
    }
    
    navigateDown() {
        if (this.isSearching && this.searchResults.length > 0) {
            this.selectedTopicIndex = Math.min(this.searchResults.length - 1, this.selectedTopicIndex + 1);
        } else {
            const category = this.categories.find(cat => cat.id === this.selectedCategory);
            if (category) {
                this.selectedTopicIndex = Math.min(category.topics.length - 1, this.selectedTopicIndex + 1);
                this.selectTopic(this.selectedTopicIndex);
            }
        }
    }
    
    navigateLeft() {
        const currentIndex = this.categories.findIndex(cat => cat.id === this.selectedCategory);
        const newIndex = Math.max(0, currentIndex - 1);
        this.selectCategory(this.categories[newIndex].id);
    }
    
    navigateRight() {
        const currentIndex = this.categories.findIndex(cat => cat.id === this.selectedCategory);
        const newIndex = Math.min(this.categories.length - 1, currentIndex + 1);
        this.selectCategory(this.categories[newIndex].id);
    }
    
    selectCurrentItem() {
        if (this.isSearching && this.searchResults.length > 0) {
            const result = this.searchResults[this.selectedTopicIndex];
            if (result) {
                this.selectCategory(result.category);
                this.isSearching = false;
                this.searchResults = [];
            }
        }
    }
    
    goBack() {
        if (this.isSearching) {
            this.isSearching = false;
            this.searchResults = [];
            this.searchQuery = '';
        } else {
            this.gameEngine.sceneManager.switchScene('menu');
        }
    }
    
    focusSearchBar() {
        // 検索バーフォーカス処理（実装は簡略化）
        this.isSearching = true;
    }
    
    handleTabNavigation(event) {
        // タブナビゲーション処理
        event.preventDefault();
        if (event.shiftKey) {
            this.navigateLeft();
        } else {
            this.navigateRight();
        }
    }
    
    /**
     * 点が矩形内にあるかチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} rect - 矩形オブジェクト
     * @returns {boolean} 矩形内にある場合true
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    render(ctx) {
        try {
            // 背景クリア
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // タイトル描画
            this.renderTitle(ctx);
            
            // 検索バー描画
            this.renderSearchBar(ctx);
            
            // サイドバー描画
            this.renderSidebar(ctx);
            
            // コンテンツエリア描画
            this.renderContent(ctx);
            
            // 戻るボタン描画
            this.renderBackButton(ctx);
            
            // 検索結果描画
            if (this.isSearching && this.searchResults.length > 0) {
                this.renderSearchResults(ctx);
            }
            
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Render error', error);
        }
    }
    
    /**
     * タイトル描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderTitle(ctx) {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        // アクセシビリティモードに応じた色とフォントサイズの調整
        ctx.fillStyle = this.highContrastMode ? '#000' : '#333';
        const fontSize = Math.round(24 * (this.textSizeMultiplier || 1));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(t('help.title', 'ヘルプ'), 50, 30);
    }
    
    /**
     * 検索バー描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderSearchBar(ctx) {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const searchBar = this.layout.searchBar;
        
        // アクセシビリティモードに応じた色の調整
        const bgColor = this.isSearching ? (this.highContrastMode ? '#fff' : '#fff') : (this.highContrastMode ? '#e0e0e0' : '#f0f0f0');
        const borderColor = this.isSearching ? (this.highContrastMode ? '#000' : '#007acc') : (this.highContrastMode ? '#000' : '#ccc');
        
        // 検索バー背景
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = this.highContrastMode ? 3 : 2;
        ctx.fillRect(searchBar.x, searchBar.y, searchBar.width, searchBar.height);
        ctx.strokeRect(searchBar.x, searchBar.y, searchBar.width, searchBar.height);
        
        // フォーカス表示（キーボードナビゲーション用）
        if (this.currentFocusIndex === 0) { // searchBarのフォーカス
            ctx.strokeStyle = this.highContrastMode ? '#ff0000' : '#ff6600';
            ctx.lineWidth = 3;
            ctx.strokeRect(searchBar.x - 2, searchBar.y - 2, searchBar.width + 4, searchBar.height + 4);
        }
        
        // プレースホルダー・検索テキスト
        ctx.fillStyle = this.highContrastMode ? '#000' : '#666';
        const fontSize = Math.round(14 * (this.textSizeMultiplier || 1));
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'left';
        const text = this.searchQuery || t('help.searchPlaceholder', 'ヘルプを検索...');
        ctx.fillText(text, searchBar.x + 10, searchBar.y + 25);
        
        // 検索アイコン
        ctx.fillStyle = this.highContrastMode ? '#000' : '#999';
        const iconSize = Math.round(16 * (this.textSizeMultiplier || 1));
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText('🔍', searchBar.x + searchBar.width - 10, searchBar.y + 25);
    }
    
    /**
     * サイドバー描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderSidebar(ctx) {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const sidebar = this.layout.sidebar;
        
        // サイドバー背景（アクセシビリティ対応）
        ctx.fillStyle = this.highContrastMode ? '#f8f8f8' : '#fff';
        ctx.strokeStyle = this.highContrastMode ? '#000' : '#ddd';
        ctx.lineWidth = this.highContrastMode ? 2 : 1;
        ctx.fillRect(sidebar.x, sidebar.y, sidebar.width, sidebar.height);
        ctx.strokeRect(sidebar.x, sidebar.y, sidebar.width, sidebar.height);
        
        // カテゴリリストのフォーカス表示
        if (this.currentFocusIndex === 1) { // categoryListのフォーカス
            ctx.strokeStyle = this.highContrastMode ? '#ff0000' : '#ff6600';
            ctx.lineWidth = 3;
            ctx.strokeRect(sidebar.x - 2, sidebar.y - 2, sidebar.width + 4, sidebar.height + 4);
        }
        
        let currentY = sidebar.y + 20;
        
        // カテゴリ遷移アニメーションの処理
        let transitionOffset = 0;
        if (this.animations.categoryTransition.isActive) {
            const progress = this.animations.categoryTransition.progress;
            const fromIndex = this.animations.categoryTransition.fromIndex;
            const toIndex = this.animations.categoryTransition.toIndex;
            const direction = toIndex > fromIndex ? 1 : -1;
            transitionOffset = direction * 10 * Math.sin(progress * Math.PI);
        }
        
        // カテゴリ描画
        for (let catIndex = 0; catIndex < this.categories.length; catIndex++) {
            const category = this.categories[catIndex];
            const isSelected = category.id === this.selectedCategory;
            
            // カテゴリ遷移アニメーション適用
            let categoryAlpha = 1;
            let categoryOffset = 0;
            if (this.animations.categoryTransition.isActive) {
                const progress = this.animations.categoryTransition.progress;
                const fromIndex = this.animations.categoryTransition.fromIndex;
                const toIndex = this.animations.categoryTransition.toIndex;
                
                if (catIndex === fromIndex) {
                    categoryAlpha = 1 - progress * 0.3;
                } else if (catIndex === toIndex) {
                    categoryAlpha = 0.7 + progress * 0.3;
                    categoryOffset = -transitionOffset;
                }
            }
            
            ctx.save();
            ctx.globalAlpha = categoryAlpha;
            ctx.translate(categoryOffset, 0);
            
            // カテゴリ項目背景（アクセシビリティ対応）
            if (isSelected) {
                ctx.fillStyle = this.highContrastMode ? '#000' : '#e3f2fd';
                ctx.fillRect(sidebar.x + 5, currentY - 15, sidebar.width - 10, 25);
            }
            
            // カテゴリ名（アクセシビリティ対応）
            ctx.fillStyle = isSelected ? 
                (this.highContrastMode ? '#fff' : '#1976d2') : 
                (this.highContrastMode ? '#000' : '#333');
            const fontSize = Math.round(14 * (this.textSizeMultiplier || 1));
            ctx.font = isSelected ? `bold ${fontSize}px Arial` : `${fontSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText(t(category.key, category.id), sidebar.x + 15, currentY);
            
            ctx.restore();
            currentY += 30;
            
            // 選択されたカテゴリのトピック表示（アニメーション付き）
            if (isSelected && category.topics.length > 0) {
                for (let i = 0; i < category.topics.length; i++) {
                    const topic = category.topics[i];
                    const isTopicSelected = i === this.selectedTopicIndex;
                    
                    // トピック項目のアニメーション
                    let topicAlpha = 1;
                    let topicSlide = 0;
                    if (this.animations.contentTransition.isActive && isTopicSelected) {
                        const progress = this.animations.contentTransition.progress;
                        topicAlpha = 0.7 + progress * 0.3;
                        topicSlide = Math.sin(progress * Math.PI) * 3;
                    }
                    
                    ctx.save();
                    ctx.globalAlpha = topicAlpha;
                    ctx.translate(topicSlide, 0);
                    
                    // トピック項目背景（アクセシビリティ対応）
                    if (isTopicSelected) {
                        ctx.fillStyle = this.highContrastMode ? '#666' : '#f3e5f5';
                        ctx.fillRect(sidebar.x + 15, currentY - 12, sidebar.width - 20, 20);
                    }
                    
                    // トピック名（アクセシビリティ対応）
                    ctx.fillStyle = isTopicSelected ? 
                        (this.highContrastMode ? '#fff' : '#7b1fa2') : 
                        (this.highContrastMode ? '#000' : '#666');
                    const topicFontSize = Math.round(12 * (this.textSizeMultiplier || 1));
                    ctx.font = `${topicFontSize}px Arial`;
                    ctx.fillText('  • ' + topic.title, sidebar.x + 25, currentY);
                    
                    ctx.restore();
                    currentY += 25;
                }
            }
        }
    }
    
    /**
     * コンテンツエリア描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderContent(ctx) {
        const content = this.layout.content;
        
        // コンテンツエリア背景（アクセシビリティ対応）
        ctx.fillStyle = this.highContrastMode ? '#f8f8f8' : '#fff';
        ctx.strokeStyle = this.highContrastMode ? '#000' : '#ddd';
        ctx.lineWidth = this.highContrastMode ? 2 : 1;
        ctx.fillRect(content.x, content.y, content.width, content.height);
        ctx.strokeRect(content.x, content.y, content.width, content.height);
        
        // コンテンツエリアのフォーカス表示
        if (this.currentFocusIndex === 3) { // contentAreaのフォーカス
            ctx.strokeStyle = this.highContrastMode ? '#ff0000' : '#ff6600';
            ctx.lineWidth = 3;
            ctx.strokeRect(content.x - 2, content.y - 2, content.width + 4, content.height + 4);
        }
        
        // アニメーション中の処理
        if (this.animations.contentTransition.isActive) {
            this.renderContentTransition(ctx, content);
            return;
        }
        
        // 通常のコンテンツ描画
        this.renderNormalContent(ctx, content);
    }
    
    /**
     * コンテンツ遷移アニメーションの描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {Object} contentArea - コンテンツエリアの情報
     */
    renderContentTransition(ctx, contentArea) {
        const transition = this.animations.contentTransition;
        const progress = transition.progress;
        
        // クリッピング領域を設定
        ctx.save();
        ctx.beginPath();
        ctx.rect(contentArea.x, contentArea.y, contentArea.width, contentArea.height);
        ctx.clip();
        
        switch (transition.type) {
            case 'slide':
                this.renderSlideTransition(ctx, contentArea, transition, progress);
                break;
            case 'fade':
                this.renderFadeTransition(ctx, contentArea, transition, progress);
                break;
            case 'scale':
                this.renderScaleTransition(ctx, contentArea, transition, progress);
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * スライド遷移の描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {Object} contentArea - コンテンツエリア
     * @param {Object} transition - 遷移情報
     * @param {number} progress - 進捗 (0-1)
     */
    renderSlideTransition(ctx, contentArea, transition, progress) {
        const slideDistance = contentArea.width;
        const offset = slideDistance * (1 - progress);
        
        // 古いコンテンツを左にスライドアウト
        if (transition.fromContent) {
            ctx.save();
            ctx.translate(-offset, 0);
            this.renderContentData(ctx, contentArea, transition.fromContent);
            ctx.restore();
        }
        
        // 新しいコンテンツを右からスライドイン
        if (transition.toContent) {
            ctx.save();
            ctx.translate(slideDistance - offset, 0);
            this.renderContentData(ctx, contentArea, transition.toContent);
            ctx.restore();
        }
    }
    
    /**
     * フェード遷移の描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {Object} contentArea - コンテンツエリア
     * @param {Object} transition - 遷移情報
     * @param {number} progress - 進捗 (0-1)
     */
    renderFadeTransition(ctx, contentArea, transition, progress) {
        // 古いコンテンツをフェードアウト
        if (transition.fromContent) {
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            this.renderContentData(ctx, contentArea, transition.fromContent);
            ctx.restore();
        }
        
        // 新しいコンテンツをフェードイン
        if (transition.toContent) {
            ctx.save();
            ctx.globalAlpha = progress;
            this.renderContentData(ctx, contentArea, transition.toContent);
            ctx.restore();
        }
    }
    
    /**
     * スケール遷移の描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {Object} contentArea - コンテンツエリア
     * @param {Object} transition - 遷移情報
     * @param {number} progress - 進捗 (0-1)
     */
    renderScaleTransition(ctx, contentArea, transition, progress) {
        const centerX = contentArea.x + contentArea.width / 2;
        const centerY = contentArea.y + contentArea.height / 2;
        
        // 古いコンテンツをスケールアウト
        if (transition.fromContent) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(1 - progress * 0.2, 1 - progress * 0.2);
            ctx.globalAlpha = 1 - progress;
            ctx.translate(-centerX, -centerY);
            this.renderContentData(ctx, contentArea, transition.fromContent);
            ctx.restore();
        }
        
        // 新しいコンテンツをスケールイン
        if (transition.toContent) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(0.8 + progress * 0.2, 0.8 + progress * 0.2);
            ctx.globalAlpha = progress;
            ctx.translate(-centerX, -centerY);
            this.renderContentData(ctx, contentArea, transition.toContent);
            ctx.restore();
        }
    }
    
    /**
     * 通常のコンテンツ描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {Object} contentArea - コンテンツエリア
     */
    renderNormalContent(ctx, contentArea) {
        if (!this.currentContent) {
            // コンテンツがない場合（アクセシビリティ対応）
            ctx.fillStyle = this.highContrastMode ? '#000' : '#999';
            const fontSize = Math.round(14 * (this.textSizeMultiplier || 1));
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('コンテンツを選択してください', 
                         contentArea.x + contentArea.width / 2, 
                         contentArea.y + contentArea.height / 2);
            return;
        }
        
        this.renderContentData(ctx, contentArea, this.currentContent);
    }
    
    /**
     * コンテンツデータの描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {Object} contentArea - コンテンツエリア
     * @param {Object} contentData - コンテンツデータ
     */
    renderContentData(ctx, contentArea, contentData) {
        let currentY = contentArea.y + 30;
        
        // タイトル（アクセシビリティ対応）
        if (contentData.title) {
            ctx.fillStyle = this.highContrastMode ? '#000' : '#333';
            const titleFontSize = Math.round(18 * (this.textSizeMultiplier || 1));
            ctx.font = `bold ${titleFontSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText(contentData.title, contentArea.x + 20, currentY);
            currentY += 40;
        }
        
        // 説明文（アクセシビリティ対応）
        if (contentData.description) {
            ctx.fillStyle = this.highContrastMode ? '#000' : '#666';
            const descFontSize = Math.round(14 * (this.textSizeMultiplier || 1));
            ctx.font = `${descFontSize}px Arial`;
            this.renderWrappedText(ctx, contentData.description, 
                                   contentArea.x + 20, currentY, contentArea.width - 40);
            currentY += 60;
        }
        
        // 手順・詳細内容
        if (contentData.steps && Array.isArray(contentData.steps)) {
            for (let i = 0; i < contentData.steps.length; i++) {
                const step = contentData.steps[i];
                
                ctx.fillStyle = this.highContrastMode ? '#000' : '#333';
                const stepFontSize = Math.round(14 * (this.textSizeMultiplier || 1));
                ctx.font = `${stepFontSize}px Arial`;
                ctx.fillText(`${i + 1}. ${step}`, contentArea.x + 20, currentY);
                currentY += 25;
                
                if (currentY > contentArea.y + contentArea.height - 30) {
                    break; // エリア溢れ防止
                }
            }
        }
    }
    
    /**
     * 検索結果描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderSearchResults(ctx) {
        const content = this.layout.content;
        
        // 検索遷移アニメーション適用
        let alpha = 1;
        let scale = 1;
        if (this.animations.searchTransition.isActive) {
            const progress = this.animations.searchTransition.progress;
            if (this.animations.searchTransition.isEntering) {
                alpha = progress;
                scale = 0.95 + progress * 0.05;
            } else {
                alpha = 1 - progress;
                scale = 1 - progress * 0.05;
            }
        }
        
        ctx.save();
        
        // スケール変換を適用
        const centerX = content.x + content.width / 2;
        const centerY = content.y + content.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        
        // 透明度を適用
        ctx.globalAlpha = alpha;
        
        // 検索結果オーバーレイ
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(content.x, content.y, content.width, content.height);
        
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 2;
        ctx.strokeRect(content.x, content.y, content.width, content.height);
        
        let currentY = content.y + 30;
        
        // 検索結果タイトル
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`検索結果: ${this.searchResults.length}件`, content.x + 20, currentY);
        currentY += 40;
        
        // 検索結果項目（アニメーション付き）
        for (let i = 0; i < Math.min(this.searchResults.length, 10); i++) {
            const result = this.searchResults[i];
            const isSelected = i === this.selectedTopicIndex;
            
            // 項目ごとのアニメーション遅延
            const itemAlpha = this.animations.searchTransition.isActive ? 
                Math.min(alpha * (1 + i * 0.1), 1) : alpha;
            
            ctx.save();
            ctx.globalAlpha = itemAlpha;
            
            // 選択状態の背景
            if (isSelected) {
                ctx.fillStyle = '#e3f2fd';
                ctx.fillRect(content.x + 10, currentY - 15, content.width - 20, 25);
            }
            
            // タイトル
            ctx.fillStyle = isSelected ? '#1976d2' : '#333';
            ctx.font = '14px Arial';
            ctx.fillText(result.title, content.x + 20, currentY);
            
            // カテゴリとスニペット
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.fillText(`[${result.category}] ${result.snippet}`, content.x + 20, currentY + 15);
            
            ctx.restore();
            currentY += 35;
        }
        
        ctx.restore();
    }
    
    /**
     * 戻るボタン描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderBackButton(ctx) {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const button = this.layout.backButton;
        
        // ボタン背景（アクセシビリティ対応）
        ctx.fillStyle = this.highContrastMode ? '#000' : '#007acc';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // フォーカス表示
        if (this.currentFocusIndex === 4) { // backButtonのフォーカス
            ctx.strokeStyle = this.highContrastMode ? '#ff0000' : '#ff6600';
            ctx.lineWidth = 3;
            ctx.strokeRect(button.x - 2, button.y - 2, button.width + 4, button.height + 4);
        }
        
        // ボタンテキスト（アクセシビリティ対応）
        ctx.fillStyle = '#fff';
        const buttonFontSize = Math.round(14 * (this.textSizeMultiplier || 1));
        ctx.font = `${buttonFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(t('common.back', '戻る'), 
                     button.x + button.width / 2, 
                     button.y + button.height / 2 + 5);
    }
    
    /**
     * テキストの自動折り返し描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {string} text - テキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} maxWidth - 最大幅
     */
    renderWrappedText(ctx, text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && line !== '') {
                ctx.fillText(line, x, currentY);
                line = word + ' ';
                currentY += 20;
            } else {
                line = testLine;
            }
        }
        
        if (line !== '') {
            ctx.fillText(line, x, currentY);
        }
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - デルタタイム
     */
    update(deltaTime) {
        // アニメーション更新
        this.updateAnimations(Date.now());
    }
}