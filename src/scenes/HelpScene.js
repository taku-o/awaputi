import { Scene } from '../core/Scene.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { LoggingSystem } from '../core/LoggingSystem.js';

/**
 * ヘルプシーン
 * 包括的なヘルプ表示とナビゲーション機能を提供
 */
export class HelpScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
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
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // コンテンツの再読み込み
        this.loadCategoryContent(this.selectedCategory);
        
        this.loggingSystem.info('HelpScene', 'Help scene entered');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        // イベントリスナーの削除
        this.removeEventListeners();
        
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
        const handler = this.keyboardHandlers[event.key];
        if (handler) {
            event.preventDefault();
            handler(event);
        }
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
            
            this.isSearching = true;
            this.searchQuery = query;
            
            if (query.trim() === '') {
                this.searchResults = [];
                this.isSearching = false;
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
                this.currentContent = await this.helpManager.getHelpContent(topic.id);
            }
        } catch (error) {
            this.loggingSystem.error('HelpScene', `Failed to load topic content: ${topic.id}`, error);
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
            this.sceneManager.changeScene('MainMenuScene');
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
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
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
        
        // 検索バー背景
        ctx.fillStyle = this.isSearching ? '#fff' : '#f0f0f0';
        ctx.strokeStyle = this.isSearching ? '#007acc' : '#ccc';
        ctx.lineWidth = 2;
        ctx.fillRect(searchBar.x, searchBar.y, searchBar.width, searchBar.height);
        ctx.strokeRect(searchBar.x, searchBar.y, searchBar.width, searchBar.height);
        
        // プレースホルダー・検索テキスト
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        const text = this.searchQuery || t('help.searchPlaceholder', 'ヘルプを検索...');
        ctx.fillText(text, searchBar.x + 10, searchBar.y + 25);
        
        // 検索アイコン
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
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
        
        // サイドバー背景
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.fillRect(sidebar.x, sidebar.y, sidebar.width, sidebar.height);
        ctx.strokeRect(sidebar.x, sidebar.y, sidebar.width, sidebar.height);
        
        let currentY = sidebar.y + 20;
        
        // カテゴリ描画
        for (const category of this.categories) {
            const isSelected = category.id === this.selectedCategory;
            
            // カテゴリ項目背景
            if (isSelected) {
                ctx.fillStyle = '#e3f2fd';
                ctx.fillRect(sidebar.x + 5, currentY - 15, sidebar.width - 10, 25);
            }
            
            // カテゴリ名
            ctx.fillStyle = isSelected ? '#1976d2' : '#333';
            ctx.font = isSelected ? 'bold 14px Arial' : '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(t(category.key, category.id), sidebar.x + 15, currentY);
            currentY += 30;
            
            // 選択されたカテゴリのトピック表示
            if (isSelected && category.topics.length > 0) {
                for (let i = 0; i < category.topics.length; i++) {
                    const topic = category.topics[i];
                    const isTopicSelected = i === this.selectedTopicIndex;
                    
                    // トピック項目背景
                    if (isTopicSelected) {
                        ctx.fillStyle = '#f3e5f5';
                        ctx.fillRect(sidebar.x + 15, currentY - 12, sidebar.width - 20, 20);
                    }
                    
                    // トピック名
                    ctx.fillStyle = isTopicSelected ? '#7b1fa2' : '#666';
                    ctx.font = '12px Arial';
                    ctx.fillText('  • ' + topic.title, sidebar.x + 25, currentY);
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
        
        // コンテンツエリア背景
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.fillRect(content.x, content.y, content.width, content.height);
        ctx.strokeRect(content.x, content.y, content.width, content.height);
        
        if (!this.currentContent) {
            // コンテンツがない場合
            ctx.fillStyle = '#999';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('コンテンツを選択してください', 
                         content.x + content.width / 2, 
                         content.y + content.height / 2);
            return;
        }
        
        // コンテンツ描画
        let currentY = content.y + 30;
        
        // タイトル
        if (this.currentContent.title) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(this.currentContent.title, content.x + 20, currentY);
            currentY += 40;
        }
        
        // 説明文
        if (this.currentContent.description) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            this.renderWrappedText(ctx, this.currentContent.description, 
                                   content.x + 20, currentY, content.width - 40);
            currentY += 60;
        }
        
        // 手順・詳細内容
        if (this.currentContent.steps && Array.isArray(this.currentContent.steps)) {
            for (let i = 0; i < this.currentContent.steps.length; i++) {
                const step = this.currentContent.steps[i];
                
                ctx.fillStyle = '#333';
                ctx.font = '14px Arial';
                ctx.fillText(`${i + 1}. ${step}`, content.x + 20, currentY);
                currentY += 25;
                
                if (currentY > content.y + content.height - 30) {
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
        
        // 検索結果項目
        for (let i = 0; i < Math.min(this.searchResults.length, 10); i++) {
            const result = this.searchResults[i];
            const isSelected = i === this.selectedTopicIndex;
            
            if (isSelected) {
                ctx.fillStyle = '#e3f2fd';
                ctx.fillRect(content.x + 10, currentY - 15, content.width - 20, 25);
            }
            
            ctx.fillStyle = isSelected ? '#1976d2' : '#333';
            ctx.font = '14px Arial';
            ctx.fillText(result.title, content.x + 20, currentY);
            
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.fillText(`[${result.category}] ${result.snippet}`, content.x + 20, currentY + 15);
            
            currentY += 35;
        }
    }
    
    /**
     * 戻るボタン描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    renderBackButton(ctx) {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const button = this.layout.backButton;
        
        // ボタン背景
        ctx.fillStyle = '#007acc';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // ボタンテキスト
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
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
        // 必要に応じて更新処理を実装
    }
}