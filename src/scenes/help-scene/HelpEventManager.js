/**
 * Help Event Manager
 * ヘルプイベント管理 - キーボード・マウス入力の統合処理
 */

/**
 * Help Event Manager
 * ヘルプイベント管理器 - 入力イベントの統合処理と配信
 */
export class HelpEventManager {
    constructor(gameEngine, contentManager, accessibilityManager, animationManager) {
        this.gameEngine = gameEngine;
        this.contentManager = contentManager;
        this.accessibilityManager = accessibilityManager;
        this.animationManager = animationManager;
        
        // イベントハンドラー
        this.boundKeyHandler = null;
        this.boundClickHandler = null;
        this.boundContextMenuHandler = null;
        
        // IME対応のための隠し入力フィールド
        this.hiddenInput = null;
        this.boundInputHandler = null;
        
        // キーボードショートカット
        this.keyboardHandlers = {
            'ArrowUp': () => this.navigateUp(),
            'ArrowDown': () => this.navigateDown(),
            'ArrowLeft': () => this.navigateLeft(),
            'ArrowRight': () => this.navigateRight(),
            'Enter': () => this.selectCurrentItem(),
            'Escape': () => this.goBack(),
            'Tab': (event) => this.handleTabNavigation(event),
            '/': (event) => { event.preventDefault(); this.focusSearchBar(); },
            'F': (event) => { if (event.ctrlKey) { event.preventDefault(); this.showFeedbackDialog(); } },
            'E': (event) => { if (event.ctrlKey && event.shiftKey) { event.preventDefault(); this.showEffectivenessReport(); } }
        };
        
        // 状態管理
        this.searchFocused = false;
        this.currentSearchQuery = '';
        this.lastInputTime = 0;
        this.inputThrottleMs = 50; // 入力スロットリング
        
        // コールバック
        this.callbacks = {
            onGoBack: null,
            onFeedbackRequest: null,
            onEffectivenessReport: null,
            onSearchFocus: null
        };
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        this.boundKeyHandler = (event) => this.handleKeyPress(event);
        this.boundClickHandler = (event) => this.handleClick(event);
        this.boundContextMenuHandler = (event) => this.handleContextMenu(event);
        
        // IME対応の隠し入力フィールドを作成
        this.createHiddenInput();
        
        document.addEventListener('keydown', this.boundKeyHandler);
        document.addEventListener('click', this.boundClickHandler);
        document.addEventListener('contextmenu', this.boundContextMenuHandler);
    }
    
    /**
     * IME対応の隠し入力フィールドを作成
     */
    createHiddenInput() {
        if (this.hiddenInput) {
            return; // 既に作成済み
        }
        
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'text';
        this.hiddenInput.style.position = 'absolute';
        this.hiddenInput.style.left = '-9999px';
        this.hiddenInput.style.top = '-9999px';
        this.hiddenInput.style.opacity = '0';
        this.hiddenInput.style.pointerEvents = 'none';
        this.hiddenInput.style.zIndex = '-1';
        this.hiddenInput.autocomplete = 'off';
        this.hiddenInput.autocorrect = 'off';
        this.hiddenInput.autocapitalize = 'off';
        this.hiddenInput.spellcheck = false;
        
        // 入力イベントハンドラーを設定
        this.boundInputHandler = (event) => this.handleIMEInput(event);
        this.hiddenInput.addEventListener('input', this.boundInputHandler);
        this.hiddenInput.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });
        this.hiddenInput.addEventListener('compositionend', () => {
            this.isComposing = false;
        });
        
        document.body.appendChild(this.hiddenInput);
    }
    
    /**
     * IME入力の処理
     */
    handleIMEInput(event) {
        if (!this.searchFocused) {
            return;
        }
        
        try {
            const newQuery = event.target.value;
            this.currentSearchQuery = newQuery;
            
            // 検索実行（デバウンス付き）
            this.debounceSearch(newQuery);
            
            // 状態更新通知
            if (this.contentManager) {
                this.contentManager.setSearchQuery(newQuery);
            }
            
        } catch (error) {
            console.error('Error handling IME input:', error);
        }
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
        
        if (this.boundContextMenuHandler) {
            document.removeEventListener('contextmenu', this.boundContextMenuHandler);
            this.boundContextMenuHandler = null;
        }
        
        // 隠し入力フィールドのクリーンアップ
        if (this.hiddenInput) {
            if (this.boundInputHandler) {
                this.hiddenInput.removeEventListener('input', this.boundInputHandler);
                this.boundInputHandler = null;
            }
            
            if (this.hiddenInput.parentNode) {
                this.hiddenInput.parentNode.removeChild(this.hiddenInput);
            }
            this.hiddenInput = null;
        }
    }

    /**
     * キーボード入力処理
     */
    handleKeyPress(event) {
        // 入力スロットリング
        const now = Date.now();
        if (now - this.lastInputTime < this.inputThrottleMs) {
            return;
        }
        this.lastInputTime = now;

        // 検索バーがフォーカスされている場合の特別処理
        if (this.searchFocused) {
            // 制御キーとファンクションキー以外はテキスト入力として処理
            if (event.key === 'Backspace' || event.key === 'Delete' || 
                (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey)) {
                this.handleTextInput(event);
                return;
            }
        }

        // アクセシビリティキーの優先処理
        if (this.accessibilityManager.handleAccessibilityKeys(event)) {
            return;
        }

        // 通常のキー処理
        const handler = this.keyboardHandlers[event.key];
        if (handler) {
            try {
                handler(event);
                
                // ナビゲーション変更のアナウンス
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
                    this.announceNavigationChange(event.key);
                }
                
            } catch (error) {
                console.error('Error handling key press:', error);
            }
        }
    }

    /**
     * テキスト入力処理（検索用）
     */
    handleTextInput(event) {
        // 検索バーがフォーカスされていない場合は無視
        if (!this.searchFocused) {
            return;
        }

        // 制御文字やファンクションキーは無視
        if (event.key.length > 1 && !['Backspace', 'Delete'].includes(event.key)) {
            return;
        }

        event.preventDefault();

        try {
            let newQuery = this.currentSearchQuery;

            if (event.key === 'Backspace') {
                newQuery = newQuery.slice(0, -1);
            } else if (event.key === 'Delete') {
                newQuery = '';
            } else if (event.key.length === 1) {
                newQuery += event.key;
            }

            // 検索クエリを更新
            this.currentSearchQuery = newQuery;
            
            // 検索実行（デバウンス付き）
            this.debounceSearch(newQuery);
            
            // 状態更新通知
            if (this.contentManager) {
                this.contentManager.setSearchQuery(newQuery);
            }

        } catch (error) {
            console.error('Error handling text input:', error);
        }
    }

    /**
     * 検索のデバウンス処理
     */
    debounceSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        this.searchTimeout = setTimeout(() => {
            this.handleSearchInput(query);
        }, 300); // 300ms のデバウンス
    }

    /**
     * ナビゲーション変更のアナウンス
     */
    announceNavigationChange(key) {
        const state = this.contentManager.getState();
        this.accessibilityManager.announceNavigationChange(
            key, 
            state.categories, 
            state.selectedCategory, 
            state.selectedTopicIndex, 
            state.isSearching, 
            state.searchResults
        );
    }

    /**
     * ナビゲーション処理
     */
    async navigateUp() {
        this.contentManager.navigateUp();
        
        // フォーカス遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startFocusTransition(
                this.accessibilityManager.getCurrentFocusIndex(),
                this.accessibilityManager.getCurrentFocusIndex()
            );
        }
    }

    async navigateDown() {
        this.contentManager.navigateDown();
        
        // フォーカス遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startFocusTransition(
                this.accessibilityManager.getCurrentFocusIndex(),
                this.accessibilityManager.getCurrentFocusIndex()
            );
        }
    }

    async navigateLeft() {
        const state = this.contentManager.getState();
        const fromIndex = state.categories.findIndex(c => c.id === state.selectedCategory);
        
        await this.contentManager.navigateLeft();
        
        const newState = this.contentManager.getState();
        const toIndex = newState.categories.findIndex(c => c.id === newState.selectedCategory);
        
        // カテゴリ遷移アニメーション
        if (this.animationManager && fromIndex !== toIndex) {
            this.animationManager.startCategoryTransition(fromIndex, toIndex);
        }
    }

    async navigateRight() {
        const state = this.contentManager.getState();
        const fromIndex = state.categories.findIndex(c => c.id === state.selectedCategory);
        
        await this.contentManager.navigateRight();
        
        const newState = this.contentManager.getState();
        const toIndex = newState.categories.findIndex(c => c.id === newState.selectedCategory);
        
        // カテゴリ遷移アニメーション
        if (this.animationManager && fromIndex !== toIndex) {
            this.animationManager.startCategoryTransition(fromIndex, toIndex);
        }
    }

    /**
     * 選択処理
     */
    async selectCurrentItem() {
        const state = this.contentManager.getState();
        
        if (state.isSearching && state.searchResults.length > 0) {
            // 検索結果から選択
            const result = await this.contentManager.selectSearchResult(state.selectedTopicIndex);
            if (result && this.animationManager) {
                this.animationManager.startContentTransition(result.newContent, 'fade');
            }
        } else {
            // 通常のトピック選択
            const result = await this.contentManager.selectTopic(state.selectedTopicIndex);
            if (result && this.animationManager) {
                this.animationManager.startContentTransition(result.newContent, 'slide');
            }
        }
    }

    /**
     * 戻る処理
     */
    goBack() {
        const state = this.contentManager.getState();
        
        if (state.isSearching) {
            // 検索モードを終了
            this.searchFocused = false;
            this.currentSearchQuery = '';
            
            // 隠し入力フィールドをクリア
            if (this.hiddenInput) {
                this.hiddenInput.value = '';
                this.hiddenInput.blur();
            }
            
            this.contentManager.performSearch('');
            if (this.animationManager) {
                this.animationManager.startSearchTransition(false);
            }
        } else {
            // メインメニューに戻る
            if (this.callbacks.onGoBack) {
                this.callbacks.onGoBack();
            }
        }
    }

    /**
     * 検索バーフォーカス
     */
    focusSearchBar() {
        this.searchFocused = true;
        this.accessibilityManager.setFocusIndex(0); // 検索バーのインデックス
        
        // 隠し入力フィールドにフォーカスを当ててIMEを有効化
        if (this.hiddenInput) {
            this.hiddenInput.focus();
            this.hiddenInput.value = this.currentSearchQuery || '';
        }
        
        if (this.callbacks.onSearchFocus) {
            this.callbacks.onSearchFocus();
        }
        
        // 検索遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startSearchTransition(true);
        }
    }

    /**
     * タブナビゲーション処理
     */
    handleTabNavigation(event) {
        this.accessibilityManager.handleTabNavigation(event);
        
        // フォーカス遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startFocusTransition(
                this.accessibilityManager.getCurrentFocusIndex(),
                this.accessibilityManager.getCurrentFocusIndex()
            );
        }
    }

    /**
     * フィードバックダイアログ表示
     */
    showFeedbackDialog() {
        if (this.callbacks.onFeedbackRequest) {
            const state = this.contentManager.getState();
            const currentTopic = this.contentManager.getCurrentTopic();
            
            this.callbacks.onFeedbackRequest({
                topic: currentTopic,
                content: state.currentContent,
                category: state.selectedCategory
            });
        }
    }

    /**
     * 効果測定レポート表示
     */
    async showEffectivenessReport() {
        if (this.callbacks.onEffectivenessReport) {
            try {
                const report = await this.contentManager.getEffectivenessReport();
                this.callbacks.onEffectivenessReport(report);
            } catch (error) {
                console.error('Failed to generate effectiveness report:', error);
            }
        }
    }

    /**
     * マウス入力処理
     */
    handleClick(event) {
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 検索バークリック処理
        if (this.isPointInSearchBar(x, y)) {
            this.focusSearchBar();
            return;
        }

        // サイドバークリック処理
        if (this.isPointInSidebar(x, y)) {
            this.handleSidebarClick(x, y);
            return;
        }

        // 戻るボタンクリック処理
        if (this.isPointInBackButton(x, y)) {
            this.goBack();
            return;
        }
    }

    /**
     * サイドバークリック処理
     */
    async handleSidebarClick(x, y) {
        const layout = this.getLayout();
        const sidebar = layout.sidebar;
        
        const relativeY = y - sidebar.y;
        const itemHeight = 40;
        let currentY = 10;

        const state = this.contentManager.getState();
        
        // カテゴリクリック判定
        for (let i = 0; i < state.categories.length; i++) {
            if (relativeY >= currentY && relativeY < currentY + itemHeight) {
                const categoryId = state.categories[i].id;
                const result = await this.contentManager.selectCategory(categoryId);
                
                if (result && this.animationManager) {
                    this.animationManager.startCategoryTransition(result.fromIndex, result.toIndex);
                }
                return;
            }
            
            currentY += itemHeight;
            
            // 選択されたカテゴリのトピック判定
            if (state.categories[i].id === state.selectedCategory) {
                for (let j = 0; j < state.categories[i].topics.length; j++) {
                    if (relativeY >= currentY && relativeY < currentY + itemHeight - 5) {
                        const result = await this.contentManager.selectTopic(j);
                        
                        if (result && this.animationManager) {
                            this.animationManager.startContentTransition(result.newContent, 'slide');
                        }
                        return;
                    }
                    currentY += 30;
                }
            }
        }
    }

    /**
     * コンテキストメニュー処理
     */
    handleContextMenu(event) {
        event.preventDefault();
        
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // コンテンツエリアでの右クリック - クイックフィードバック
        if (this.isPointInContent(x, y)) {
            this.showQuickFeedback(x, y);
        }
    }

    /**
     * クイックフィードバック表示
     */
    showQuickFeedback(x, y) {
        const state = this.contentManager.getState();
        if (!state.currentContent) return;

        const currentTopic = this.contentManager.getCurrentTopic();
        if (currentTopic && this.callbacks.onFeedbackRequest) {
            this.callbacks.onFeedbackRequest({
                topic: currentTopic,
                content: state.currentContent,
                category: state.selectedCategory,
                position: { x, y },
                quickMode: true
            });
        }
    }

    /**
     * 検索入力処理
     */
    async handleSearchInput(query) {
        await this.contentManager.performSearch(query);
        
        // 検索遷移アニメーション
        if (this.animationManager) {
            const isEntering = query.trim().length > 0;
            this.animationManager.startSearchTransition(isEntering);
        }
    }

    /**
     * 座標判定ヘルパー
     */
    isPointInSearchBar(x, y) {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.searchBar);
    }

    isPointInSidebar(x, y) {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.sidebar);
    }

    isPointInContent(x, y) {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.content);
    }

    isPointInBackButton(x, y) {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.backButton);
    }

    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    getLayout() {
        // レンダラーからレイアウトを取得（仮実装）
        return {
            searchBar: { x: 50, y: 30, width: 720, height: 40 },
            sidebar: { x: 50, y: 80, width: 250, height: 400 },
            content: { x: 320, y: 80, width: 450, height: 400 },
            backButton: { x: 50, y: 500, width: 100, height: 40 }
        };
    }

    /**
     * コールバック設定
     */
    setCallback(type, callback) {
        if (this.callbacks.hasOwnProperty(type)) {
            this.callbacks[type] = callback;
        }
    }

    /**
     * 状態取得
     */
    getEventState() {
        return {
            searchFocused: this.searchFocused,
            lastInputTime: this.lastInputTime,
            hasActiveListeners: Boolean(this.boundKeyHandler)
        };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.removeEventListeners();
        
        // コールバッククリア
        Object.keys(this.callbacks).forEach(key => {
            this.callbacks[key] = null;
        });
        
        console.log('HelpEventManager destroyed');
    }
}

/**
 * Help Input Validator
 * ヘルプ入力検証器 - 入力値の検証とサニタイズ
 */
export class HelpInputValidator {
    constructor() {
        this.maxSearchLength = 100;
        this.allowedSearchChars = /^[a-zA-Z0-9\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F\-_.,!?()[\]{}'"「」『』【】〔〕〈〉《》：；、。・]*$/;
    }

    /**
     * 検索クエリの検証
     */
    validateSearchQuery(query) {
        if (typeof query !== 'string') {
            return { valid: false, error: 'Search query must be a string' };
        }

        if (query.length > this.maxSearchLength) {
            return { 
                valid: false, 
                error: `Search query too long (max ${this.maxSearchLength} characters)`,
                sanitized: query.substring(0, this.maxSearchLength)
            };
        }

        if (!this.allowedSearchChars.test(query)) {
            const sanitized = query.replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\-_.,!?()[\]{}'"「」『』【】〔〕〈〉《》：；、。・]/g, '');
            return {
                valid: false,
                error: 'Search query contains invalid characters',
                sanitized
            };
        }

        return { valid: true, sanitized: query.trim() };
    }

    /**
     * インデックス値の検証
     */
    validateIndex(index, maxValue) {
        const numIndex = parseInt(index, 10);
        
        if (isNaN(numIndex)) {
            return { valid: false, error: 'Index must be a number' };
        }

        if (numIndex < 0) {
            return { valid: false, error: 'Index cannot be negative', sanitized: 0 };
        }

        if (numIndex >= maxValue) {
            return { 
                valid: false, 
                error: 'Index out of range', 
                sanitized: Math.max(0, maxValue - 1) 
            };
        }

        return { valid: true, sanitized: numIndex };
    }

    /**
     * カテゴリIDの検証
     */
    validateCategoryId(categoryId, validCategories) {
        if (typeof categoryId !== 'string') {
            return { valid: false, error: 'Category ID must be a string' };
        }

        const trimmedId = categoryId.trim();
        
        if (trimmedId.length === 0) {
            return { valid: false, error: 'Category ID cannot be empty' };
        }

        if (!validCategories.includes(trimmedId)) {
            return { 
                valid: false, 
                error: 'Invalid category ID',
                sanitized: validCategories[0] || 'gameplay'
            };
        }

        return { valid: true, sanitized: trimmedId };
    }
}