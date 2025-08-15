/**
 * Help Content Manager
 * ヘルプコンテンツ管理 - コンテンツ読み込み、検索、状態管理
 */

/**
 * Help Content Manager
 * ヘルプコンテンツ管理器 - コンテンツの読み込み、検索、カテゴリ管理
 */
export class HelpContentManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.helpManager = null;
        this.searchEngine = null;
        
        // コンテンツ状態
        this.selectedCategory = 'gameplay';
        this.selectedTopicIndex = 0;
        this.currentContent = null;
        this.searchQuery = '';
        this.currentSearchQuery = '';
        this.searchResults = [];
        this.isSearching = false;
        
        // ヘルプカテゴリ
        this.categories = [
            { id: 'gameplay', key: 'help.categories.gameplay', topics: [] },
            { id: 'bubbles', key: 'help.categories.bubbles', topics: [] },
            { id: 'controls', key: 'help.categories.controls', topics: [] },
            { id: 'scoring', key: 'help.categories.scoring', topics: [] },
            { id: 'settings', key: 'help.categories.settings', topics: [] },
            { id: 'troubleshooting', key: 'help.categories.troubleshooting', topics: [] }
        ];
        
        // コンテンツキャッシュ
        this.contentCache = new Map();
        this.searchCache = new Map();
        this.maxCacheSize = 50;
        
        // アナリティクス
        this.helpAnalytics = null;
        this.helpFeedbackSystem = null;
        this.helpEffectivenessAnalyzer = null;
        
        this.initialize();
    }

    async initialize() {
        try {
            // ヘルプマネージャーとの統合
            if (this.gameEngine.helpManager) {
                this.helpManager = this.gameEngine.helpManager;
                this.searchEngine = this.helpManager.searchEngine;
            }
            
            // アナリティクスシステムの初期化
            await this.initializeAnalytics();
            
            // ヘルプコンテンツの読み込み
            await this.loadHelpContent();
            
            // 検索インデックスの構築
            if (this.searchEngine) {
                await this.searchEngine.buildIndex();
                
                // ヘルプコンテンツをインデックスに追加
                await this.indexHelpContentForSearch();
            }
            
            console.log('HelpContentManager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize HelpContentManager:', error);
        }
    }

    async initializeAnalytics() {
        try {
            // ヘルプアナリティクスの初期化
            const { getHelpAnalytics } = await import('../../core/help/HelpAnalytics.js');
            this.helpAnalytics = getHelpAnalytics(this.gameEngine);
            
            // ヘルプフィードバックシステムの初期化
            const { getHelpFeedbackSystem } = await import('../../core/help/HelpFeedbackSystem.js');
            this.helpFeedbackSystem = getHelpFeedbackSystem(this.gameEngine);
            
            // ヘルプ効果測定ツールの初期化
            const { getHelpEffectivenessAnalyzer } = await import('../../core/help/HelpEffectivenessAnalyzer.js');
            this.helpEffectivenessAnalyzer = getHelpEffectivenessAnalyzer(this.gameEngine);
            
        } catch (error) {
            console.warn('Some analytics systems failed to initialize:', error);
        }
    }

    /**
     * ヘルプコンテンツを検索エンジンにインデックス
     */
    async indexHelpContentForSearch() {
        if (!this.searchEngine) {
            return;
        }

        try {\n            console.log('Indexing help content for search...');\n            
            // 全カテゴリのトピックを収集してインデックス化
            const allContent = [];
            
            for (const category of this.categories) {
                for (const topic of category.topics) {
                    try {
                        // トピックの詳細コンテンツを取得
                        let content = null;
                        if (this.helpManager) {
                            content = await this.helpManager.getTopicContent(topic.id);
                        }
                        
                        // 検索用データ構造を作成
                        const searchItem = {
                            id: `${category.id}:${topic.id}`,
                            categoryId: category.id,
                            topicId: topic.id,
                            title: topic.title || topic.question || '',
                            content: content ? (content.content || content.answer || content.description || '') : '',
                            category: category.id,
                            categoryName: this.gameEngine.localizationManager?.t(category.key, category.id) || category.id,
                            tags: topic.tags || [],
                            language: 'ja',
                            difficulty: topic.difficulty || 'beginner',
                            popularity: topic.popularity || 0,
                            lastUpdated: Date.now(),
                            searchKeywords: topic.searchKeywords || []
                        };
                        
                        allContent.push(searchItem);
                        
                    } catch (error) {
                        console.warn(`Failed to index topic ${topic.id}:`, error);
                    }
                }
            }
            
            // SearchEngineにコンテンツをインデックス
            if (allContent.length > 0) {
                this.searchEngine.indexContent(allContent, 'help');
                console.log(`Successfully indexed ${allContent.length} help topics for search`);
            } else {
                console.warn('No help content found to index');
            }
            
        } catch (error) {
            console.error('Failed to index help content for search:', error);
        }
    }

    /**
     * ヘルプコンテンツの読み込み
     */
    async loadHelpContent() {
        try {
            if (!this.helpManager) {
                console.warn('HelpManager not available, using default content');
                return;
            }

            // 各カテゴリのコンテンツを読み込み
            for (const category of this.categories) {
                try {
                    const topics = await this.helpManager.getCategoryTopics(category.id);
                    category.topics = topics || [];
                } catch (error) {
                    console.error(`Failed to load topics for category ${category.id}:`, error);
                    category.topics = [];
                }
            }

            // 初期コンテンツの読み込み
            await this.loadCategoryContent(this.selectedCategory);
            
        } catch (error) {
            console.error('Failed to load help content:', error);
        }
    }

    /**
     * カテゴリコンテンツの読み込み
     */
    async loadCategoryContent(categoryId) {
        try {
            const category = this.categories.find(c => c.id === categoryId);
            if (!category || !category.topics.length) {
                this.currentContent = null;
                return;
            }

            // トピック選択の調整
            if (this.selectedTopicIndex >= category.topics.length) {
                this.selectedTopicIndex = 0;
            }

            // コンテンツの読み込み（キャッシュ付き）
            if (this.helpManager) {
                const topic = category.topics[this.selectedTopicIndex];
                const cacheKey = `${categoryId}:${this.selectedTopicIndex}`;
                
                if (this.contentCache.has(cacheKey)) {
                    this.currentContent = this.contentCache.get(cacheKey);
                } else {
                    this.currentContent = await this.helpManager.getTopicContent(topic.id);
                    this.setContentCache(cacheKey, this.currentContent);
                }
            }
            
        } catch (error) {
            console.error('Failed to load category content:', error);
            this.currentContent = null;
        }
    }

    /**
     * 検索実行
     */
    async performSearch(query) {
        try {
            if (!this.searchEngine) {
                console.warn('Search engine not available');
                return;
            }

            const trimmedQuery = query.trim();
            if (trimmedQuery.length === 0) {
                // 空のクエリ - 検索モードを終了
                const wasSearching = this.isSearching;
                this.isSearching = false;
                this.searchQuery = '';
                this.searchResults = [];
                
                if (wasSearching) {
                    // 通常表示に戻る
                    await this.loadCategoryContent(this.selectedCategory);
                }
                return;
            }

            // 検索キャッシュをチェック
            if (this.searchCache.has(trimmedQuery)) {
                this.searchResults = this.searchCache.get(trimmedQuery);
            } else {
                // 新しい検索実行
                const searchResult = await this.searchEngine.search(trimmedQuery);
                this.searchResults = searchResult.results || [];
                this.setSearchCache(trimmedQuery, this.searchResults);
            }

            this.isSearching = true;
            this.searchQuery = trimmedQuery;
            this.selectedTopicIndex = 0; // 最初の結果を選択

            // アナリティクス記録
            if (this.helpAnalytics) {
                this.helpAnalytics.recordSearchQuery(trimmedQuery, this.searchResults.length);
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            this.searchResults = [];
            this.isSearching = false;
        }
    }

    /**
     * カテゴリ選択
     */
    async selectCategory(categoryId) {
        if (this.selectedCategory === categoryId) {
            return; // 既に選択済み
        }

        const fromIndex = this.categories.findIndex(c => c.id === this.selectedCategory);
        const toIndex = this.categories.findIndex(c => c.id === categoryId);
        
        this.selectedCategory = categoryId;
        this.selectedTopicIndex = 0;
        this.isSearching = false;
        this.searchQuery = '';
        this.searchResults = [];

        // コンテンツ読み込み
        await this.loadCategoryContent(categoryId);

        // アナリティクス記録
        if (this.helpAnalytics && typeof this.helpAnalytics.recordCategorySelection === 'function') {
            try {
                this.helpAnalytics.recordCategorySelection(categoryId);
            } catch (error) {
                console.warn('Failed to record category selection:', error);
            }
        }

        return { fromIndex, toIndex };
    }

    /**
     * トピック選択
     */
    async selectTopic(index) {
        const category = this.categories.find(c => c.id === this.selectedCategory);
        if (!category || index < 0 || index >= category.topics.length) {
            return null;
        }

        // 前のコンテンツのフィードバック記録
        if (this.helpFeedbackSystem && typeof this.helpFeedbackSystem.recordTopicExit === 'function' && this.currentContent && category.topics[this.selectedTopicIndex]) {
            try {
                const currentTopic = category.topics[this.selectedTopicIndex];
                this.helpFeedbackSystem.recordTopicExit(currentTopic.id, this.currentContent);
            } catch (error) {
                console.warn('Failed to record topic exit:', error);
            }
        }

        this.selectedTopicIndex = index;
        let newContent = null;

        try {
            // 新しいコンテンツの読み込み
            if (this.helpManager) {
                const topic = category.topics[index];
                newContent = await this.helpManager.getTopicContent(topic.id);
                
                // アナリティクス記録
                if (this.helpAnalytics) {
                    this.helpAnalytics.recordTopicView(topic.id, this.selectedCategory);
                }
                
                // フィードバックシステムに記録
                if (this.helpFeedbackSystem) {
                    this.helpFeedbackSystem.recordTopicView(topic.id, newContent);
                }
            }
            
            return { newContent, currentContent: this.currentContent };
            
        } catch (error) {
            console.error('Failed to select topic:', error);
            return null;
        }
    }

    /**
     * 検索結果から選択
     */
    async selectSearchResult(index) {
        if (!this.isSearching || index < 0 || index >= this.searchResults.length) {
            return null;
        }

        const result = this.searchResults[index];
        if (result) {
            // SearchEngineの結果構造に対応
            const resultData = result.content || result;
            const categoryId = resultData.categoryId || result.categoryId;
            const topicId = resultData.topicId || result.topicId;
            
            if (!categoryId || !topicId) {
                console.error('Invalid search result structure:', result);
                return null;
            }
            
            // 検索モードを終了
            this.isSearching = false;
            this.searchQuery = '';
            this.searchResults = [];
            
            // カテゴリとトピックを設定
            await this.selectCategory(categoryId);
            const topicIndex = this.categories
                .find(c => c.id === categoryId)?.topics
                .findIndex(t => t.id === topicId) || 0;
            
            return await this.selectTopic(topicIndex);
        }
        
        return null;
    }

    /**
     * フィードバック関連
     */
    recordTopicFeedback(topicId, feedback) {
        if (this.helpFeedbackSystem && this.currentContent) {
            const category = this.categories.find(c => c.id === this.selectedCategory);
            if (category && category.topics[this.selectedTopicIndex]) {
                const topic = category.topics[this.selectedTopicIndex];
                this.helpFeedbackSystem.recordFeedback(topic.id, this.currentContent, feedback);
            }
        }
    }

    async getEffectivenessReport() {
        if (!this.helpEffectivenessAnalyzer) {
            return null;
        }

        try {
            return await this.helpEffectivenessAnalyzer.generateReport();
        } catch (error) {
            console.error('Failed to generate effectiveness report:', error);
            return null;
        }
    }

    /**
     * キャッシュ管理
     */
    setContentCache(key, content) {
        if (this.contentCache.size >= this.maxCacheSize) {
            const firstKey = this.contentCache.keys().next().value;
            this.contentCache.delete(firstKey);
        }
        this.contentCache.set(key, content);
    }

    setSearchCache(query, results) {
        if (this.searchCache.size >= this.maxCacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        this.searchCache.set(query, results);
    }

    clearCache() {
        this.contentCache.clear();
        this.searchCache.clear();
    }

    /**
     * ナビゲーション処理
     */
    navigateUp() {
        if (this.isSearching && this.searchResults.length > 0) {
            this.selectedTopicIndex = Math.max(0, this.selectedTopicIndex - 1);
        } else {
            const category = this.categories.find(c => c.id === this.selectedCategory);
            if (category) {
                this.selectedTopicIndex = Math.max(0, this.selectedTopicIndex - 1);
            }
        }
    }

    navigateDown() {
        if (this.isSearching && this.searchResults.length > 0) {
            this.selectedTopicIndex = Math.min(this.searchResults.length - 1, this.selectedTopicIndex + 1);
        } else {
            const category = this.categories.find(c => c.id === this.selectedCategory);
            if (category) {
                this.selectedTopicIndex = Math.min(category.topics.length - 1, this.selectedTopicIndex + 1);
            }
        }
    }

    async navigateLeft() {
        const currentIndex = this.categories.findIndex(c => c.id === this.selectedCategory);
        const newIndex = (currentIndex - 1 + this.categories.length) % this.categories.length;
        await this.selectCategory(this.categories[newIndex].id);
    }

    async navigateRight() {
        const currentIndex = this.categories.findIndex(c => c.id === this.selectedCategory);
        const newIndex = (currentIndex + 1) % this.categories.length;
        await this.selectCategory(this.categories[newIndex].id);
    }

    /**
     * 状態取得
     */
    getState() {
        // Ensure searchResults is always an array
        const searchResults = Array.isArray(this.searchResults) ? this.searchResults : [];
        
        return {
            selectedCategory: this.selectedCategory,
            selectedTopicIndex: this.selectedTopicIndex,
            currentContent: this.currentContent,
            searchQuery: this.searchQuery,
            searchResults: [...searchResults],
            isSearching: this.isSearching,
            categories: this.categories.map(cat => ({
                ...cat,
                topics: [...cat.topics]
            }))
        };
    }

    getCurrentCategory() {
        return this.categories.find(c => c.id === this.selectedCategory);
    }

    getCurrentTopic() {
        const category = this.getCurrentCategory();
        return category?.topics[this.selectedTopicIndex] || null;
    }

    getSearchResults() {
        return [...this.searchResults];
    }

    /**
     * 検索クエリを設定
     * @param {string} query - 検索クエリ
     */
    setSearchQuery(query) {
        this.currentSearchQuery = query.trim();
        
        // 検索クエリを更新
        this.searchQuery = this.currentSearchQuery;
        
        // 空の検索クエリの場合は検索結果をクリア
        if (!this.currentSearchQuery) {
            this.searchResults = [];
            this.isSearching = false;
        } else {
            this.isSearching = true;
        }
    }

    // Analytics getters
    getHelpAnalytics() {
        return this.helpAnalytics;
    }

    getHelpFeedbackSystem() {
        return this.helpFeedbackSystem;
    }

    getHelpEffectivenessAnalyzer() {
        return this.helpEffectivenessAnalyzer;
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.clearCache();
        this.searchResults.length = 0;
        this.currentContent = null;
        
        // アナリティクスのクリーンアップ
        if (this.helpAnalytics && this.helpAnalytics.destroy) {
            this.helpAnalytics.destroy();
        }
        if (this.helpFeedbackSystem && this.helpFeedbackSystem.destroy) {
            this.helpFeedbackSystem.destroy();
        }
        if (this.helpEffectivenessAnalyzer && this.helpEffectivenessAnalyzer.destroy) {
            this.helpEffectivenessAnalyzer.destroy();
        }
        
        console.log('HelpContentManager destroyed');
    }
}

/**
 * Help Search Manager
 * ヘルプ検索管理器 - 検索機能の特化管理
 */
export class HelpSearchManager {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.searchHistory = [];
        this.maxHistorySize = 20;
        this.searchSuggestions = [];
    }

    async performSearch(query) {
        // 検索履歴に追加
        this.addToSearchHistory(query);
        
        // コンテンツマネージャーの検索を実行
        await this.contentManager.performSearch(query);
        
        // 検索提案を更新
        this.updateSearchSuggestions(query);
    }

    addToSearchHistory(query) {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) return;
        
        // 重複を削除
        this.searchHistory = this.searchHistory.filter(h => h !== trimmedQuery);
        
        // 先頭に追加
        this.searchHistory.unshift(trimmedQuery);
        
        // サイズ制限
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
    }

    updateSearchSuggestions(query) {
        // 簡単な検索提案の実装
        const categories = this.contentManager.categories;
        this.searchSuggestions = categories.flatMap(cat => 
            cat.topics.filter(topic => 
                topic.title.toLowerCase().includes(query.toLowerCase())
            ).map(topic => ({
                text: topic.title,
                category: cat.id,
                topicId: topic.id
            }))
        ).slice(0, 5); // 最大5個の提案
    }

    getSearchHistory() {
        return [...this.searchHistory];
    }

    getSearchSuggestions() {
        return [...this.searchSuggestions];
    }

    clearSearchHistory() {
        this.searchHistory.length = 0;
    }
}