/**
 * HelpManager.js
 * ヘルプシステムの中央管理クラス
 * コンテンツ読み込み、検索、コンテキスト対応ヘルプを統合管理
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LocalizationManager } from '../LocalizationManager.js';
import { CacheSystem } from '../CacheSystem.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * ヘルプシステムの中央管理クラス
 */
export class HelpManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.localizationManager = new LocalizationManager();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.helpContent = new Map();
        this.userProgress = {
            viewedSections: new Set(),
            searchHistory: [],
            lastAccessed: null
        };
        
        this.initialize();
    }

    /**
     * ヘルプマネージャーの初期化
     */
    async initialize() {
        try {
            this.loggingSystem.info('HelpManager', 'Initializing help system...');
            
            // 基本ヘルプカテゴリを読み込み
            const currentLanguage = this.localizationManager.getCurrentLanguage();
            await this.loadHelpContent('gameplay', currentLanguage);
            
            // ユーザー進捗の復元
            this.loadUserProgress();
            
            this.loggingSystem.info('HelpManager', 'Help system initialized successfully');
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to initialize help system', error);
            ErrorHandler.handle(error, 'HelpManager.initialize');
        }
    }

    /**
     * ヘルプコンテンツの読み込み
     * @param {string} category - コンテンツカテゴリ
     * @param {string} language - 言語コード
     * @returns {Promise<Object>} ヘルプコンテンツ
     */
    async loadHelpContent(category, language = 'ja') {
        try {
            const cacheKey = `help_content_${category}_${language}`;
            
            // キャッシュから確認
            let content = this.cacheSystem.get(cacheKey);
            if (content) {
                this.loggingSystem.debug('HelpManager', `Loaded help content from cache: ${cacheKey}`);
                return content;
            }

            // 新しい強化されたコンテンツ読み込み
            content = await this.tryLoadContent(category, language);
            
            if (!content) {
                // フォールバック機能付きの安全な読み込み
                content = await this.loadWithFallback(category, language);
            }
            
            // バリデーション
            if (!this.validateHelpContent(content)) {
                this.loggingSystem.warn('HelpManager', `Invalid content format for ${category}, generating placeholder`);
                content = await this.generatePlaceholderContent(category, language);
            }

            // キャッシュに保存
            this.cacheSystem.set(cacheKey, content, 30 * 60 * 1000); // 30分
            this.helpContent.set(`${category}_${language}`, content);
            
            this.loggingSystem.info('HelpManager', `Loaded help content: ${cacheKey}`);
            return content;
            
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to load help content: ${category}`, error);
            return await this.generatePlaceholderContent(category, language);
        }
    }

    /**
     * 静かにコンテンツの読み込みを試行（404エラーを生成しない）
     * @param {string} category - カテゴリ
     * @param {string} language - 言語コード
     * @returns {Object|null} コンテンツまたはnull
     */
    async tryLoadContent(category, language) {
        try {
            const contentPath = `./src/core/help/content/help/${language}/${category}.json`;
            
            // HEADリクエストでファイル存在確認（404エラーを避ける）
            const headResponse = await fetch(contentPath, { method: 'HEAD' });
            if (!headResponse.ok) {
                return null;
            }
            
            // ファイルが存在する場合のみGETリクエストを実行
            const response = await fetch(contentPath);
            if (!response.ok) {
                return null;
            }
            
            const content = await response.json();
            this.loggingSystem.debug('HelpManager', `Successfully loaded content: ${contentPath}`);
            return content;
            
        } catch (error) {
            // エラーを静かに処理（ログに出力しない）
            return null;
        }
    }

    /**
     * フォールバック機能付きの安全なコンテンツ読み込み
     * @param {string} category - カテゴリ
     * @param {string} language - 言語コード
     * @returns {Object} コンテンツ
     */
    async loadWithFallback(category, language) {
        // フォールバックチェーン: 指定言語 → 日本語 → 英語 → プレースホルダー
        const fallbackChain = [
            language,
            'ja',
            'en'
        ].filter((lang, index, array) => array.indexOf(lang) === index); // 重複除去

        for (const fallbackLang of fallbackChain) {
            const content = await this.tryLoadContent(category, fallbackLang);
            if (content) {
                if (fallbackLang !== language) {
                    this.loggingSystem.info('HelpManager', 
                        `Content not found for ${language}/${category}, using fallback: ${fallbackLang}`);
                }
                return content;
            }
        }

        // レガシーパスの確認
        const legacyContent = await this.tryLoadLegacyContent(category);
        if (legacyContent) {
            this.loggingSystem.info('HelpManager', 
                `Using legacy content for ${category}`);
            return legacyContent;
        }

        // 全てのフォールバックが失敗した場合はプレースホルダーを生成
        this.loggingSystem.warn('HelpManager', 
            `All fallbacks failed for ${category}, generating placeholder content`);
        return await this.generatePlaceholderContent(category, language);
    }

    /**
     * レガシーパスからのコンテンツ読み込み試行
     * @param {string} category - カテゴリ
     * @returns {Object|null} コンテンツまたはnull
     */
    async tryLoadLegacyContent(category) {
        try {
            const legacyPath = `./src/core/help/content/help/${category}.json`;
            const headResponse = await fetch(legacyPath, { method: 'HEAD' });
            if (!headResponse.ok) {
                return null;
            }
            
            const response = await fetch(legacyPath);
            if (!response.ok) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    /**
     * プレースホルダーコンテンツの生成
     * @param {string} category - カテゴリ
     * @param {string} language - 言語コード
     * @returns {Object} プレースホルダーコンテンツ
     */
    async generatePlaceholderContent(category, language) {
        const placeholderMessages = {
            ja: {
                title: `${category}ヘルプ（準備中）`,
                description: `${category}に関するヘルプコンテンツは現在準備中です。`,
                content: '申し訳ございませんが、このヘルプコンテンツは現在利用できません。しばらくしてから再度お試しください。',
                fallbackNote: '最新の情報については、メインメニューの他のヘルプセクションをご確認ください。'
            },
            en: {
                title: `${category} Help (Coming Soon)`,
                description: `Help content for ${category} is currently being prepared.`,
                content: 'Sorry, this help content is currently unavailable. Please try again later.',
                fallbackNote: 'For the latest information, please check other help sections in the main menu.'
            }
        };

        const messages = placeholderMessages[language] || placeholderMessages['en'];
        
        return {
            category: category,
            title: messages.title,
            description: messages.description,
            language: language,
            version: "0.0.1-placeholder",
            lastUpdated: new Date().toISOString().split('T')[0],
            isPlaceholder: true,
            topics: [
                {
                    id: 'placeholder_info',
                    title: messages.title,
                    description: messages.description,
                    content: {
                        message: messages.content,
                        note: messages.fallbackNote,
                        troubleshooting: '問題が続く場合は、ページを再読み込みするか、サポートにお問い合わせください。'
                    },
                    difficulty: 'beginner',
                    estimatedReadTime: 30,
                    tags: ['placeholder', 'info']
                }
            ]
        };
    }

    /**
     * ヘルプセクションの取得
     * @param {string} sectionId - セクションID
     * @param {string} language - 言語コード
     * @returns {Object|null} ヘルプセクション
     */
    getHelpSection(sectionId, language = 'ja') {
        try {
            const parts = sectionId.split('.');
            const category = parts[0];
            const section = parts[1];

            const contentKey = `${category}_${language}`;
            const content = this.helpContent.get(contentKey);
            
            if (!content || !content.topics) {
                this.loggingSystem.warn('HelpManager', `Help content not found: ${contentKey}`);
                return null;
            }

            const sectionData = content.topics.find(s => s.id === section);
            if (sectionData) {
                // 閲覧履歴に追加
                this.trackHelpUsage(sectionId);
                return sectionData;
            }

            return null;
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get help section: ${sectionId}`, error);
            return null;
        }
    }

    /**
     * コンテンツ検索
     * @param {string} query - 検索クエリ
     * @param {Object} filters - フィルター条件
     * @returns {Array} 検索結果
     */
    searchContent(query, filters = {}) {
        try {
            const results = [];
            const language = filters.language || this.localizationManager.getCurrentLanguage();
            
            // 検索履歴に追加
            this.userProgress.searchHistory.push({
                query,
                timestamp: Date.now(),
                language
            });
            
            // 最大100件の検索履歴を保持
            if (this.userProgress.searchHistory.length > 100) {
                this.userProgress.searchHistory.shift();
            }

            // 全カテゴリを検索
            for (const [key, content] of this.helpContent.entries()) {
                if (!key.endsWith(`_${language}`)) continue;

                if (content.topics) {
                    for (const section of content.topics) {
                        const score = this.calculateSearchScore(section, query);
                        if (score > 0) {
                            results.push({
                                section,
                                score,
                                category: key.replace(`_${language}`, ''),
                                language
                            });
                        }
                    }
                }
            }

            // スコア順にソート
            results.sort((a, b) => b.score - a.score);
            
            // フィルター適用
            let filteredResults = results;
            if (filters.category) {
                filteredResults = results.filter(r => r.category === filters.category);
            }
            if (filters.difficulty) {
                filteredResults = filteredResults.filter(r => r.section.difficulty === filters.difficulty);
            }

            this.loggingSystem.debug('HelpManager', `Search completed: "${query}" - ${filteredResults.length} results`);
            return filteredResults.slice(0, filters.limit || 50);
            
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to search content: ${query}`, error);
            return [];
        }
    }

    /**
     * コンテキストに応じたヘルプの取得
     * @param {string} currentScene - 現在のシーン
     * @param {string} userAction - ユーザーアクション
     * @returns {Object|null} コンテキストヘルプ
     */
    getContextualHelp(currentScene, userAction = null) {
        try {
            const contextKey = userAction ? `${currentScene}.${userAction}` : currentScene;
            const language = this.localizationManager.getCurrentLanguage();
            
            // コンテキストマッピングの定義
            const contextMap = {
                'MainMenuScene': 'menu.navigation',
                'GameScene': 'gameplay.basics',
                'GameScene.bubble_click': 'gameplay.bubble_interaction',
                'GameScene.combo': 'gameplay.combo_system',
                'StageSelectScene': 'stages.selection',
                'ShopScene': 'shop.items',
                'UserInfoScene': 'profile.statistics'
            };

            const sectionId = contextMap[contextKey] || contextMap[currentScene];
            if (sectionId) {
                const helpSection = this.getHelpSection(sectionId, language);
                if (helpSection) {
                    this.loggingSystem.debug('HelpManager', `Contextual help provided: ${contextKey}`);
                    return {
                        section: helpSection,
                        context: contextKey,
                        suggestions: this.getRelatedSuggestions(sectionId)
                    };
                }
            }

            return null;
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get contextual help: ${currentScene}`, error);
            return null;
        }
    }

    /**
     * カテゴリ別トピック一覧を取得
     * @param {string} category - カテゴリ名
     * @param {string} language - 言語コード
     * @returns {Array} トピック一覧
     */
    getCategoryTopics(category, language = null) {
        try {
            const lang = language || this.localizationManager.getCurrentLanguage();
            
            // カテゴリ別のトピック定義
            const categoryTopics = {
                gameplay: [
                    { id: 'basics', title: '基本操作' },
                    { id: 'bubble_types', title: '泡の種類' },
                    { id: 'combo_system', title: 'コンボシステム' },
                    { id: 'power_ups', title: 'パワーアップ' },
                    { id: 'scoring', title: 'スコアシステム' }
                ],
                bubbles: [
                    { id: 'normal_bubbles', title: '通常の泡' },
                    { id: 'special_bubbles', title: '特殊な泡' },
                    { id: 'boss_bubbles', title: 'ボス泡' },
                    { id: 'poison_bubbles', title: '毒泡' },
                    { id: 'healing_bubbles', title: '回復泡' }
                ],
                stages: [
                    { id: 'stage_types', title: 'ステージタイプ' },
                    { id: 'difficulty', title: '難易度設定' },
                    { id: 'time_limits', title: '制限時間' },
                    { id: 'objectives', title: 'クリア条件' }
                ],
                menu: [
                    { id: 'navigation', title: 'メニュー操作' },
                    { id: 'settings', title: '設定項目' },
                    { id: 'profile', title: 'プロフィール' },
                    { id: 'achievements', title: '実績システム' }
                ]
            };
            
            const topics = categoryTopics[category] || [];
            
            // 各トピックに詳細情報を付加
            return topics.map(topic => ({
                ...topic,
                category,
                language: lang,
                content: this.getHelpSection(`${category}.${topic.id}`, lang) || {
                    title: topic.title,
                    content: 'コンテンツを読み込み中...',
                    isEmpty: true
                }
            }));
            
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get category topics: ${category}`, error);
            return [];
        }
    }

    /**
     * ツールチップの表示
     * @param {HTMLElement} element - 対象要素
     * @param {string} content - ツールチップ内容
     * @param {Object} options - 表示オプション
     */
    showTooltip(element, content, options = {}) {
        try {
            // TooltipSystemとの連携は後続のタスクで実装
            this.loggingSystem.debug('HelpManager', `Tooltip requested for element: ${element.id || element.className}`);
            
            // 基本的なツールチップ表示
            element.setAttribute('title', content);
            element.setAttribute('aria-label', content);
            
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to show tooltip', error);
        }
    }

    /**
     * ツールチップの非表示
     */
    hideTooltip() {
        try {
            // TooltipSystemとの連携は後続のタスクで実装
            this.loggingSystem.debug('HelpManager', 'Tooltip hide requested');
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to hide tooltip', error);
        }
    }

    /**
     * ヘルプ使用履歴の追跡
     * @param {string} sectionId - セクションID
     * @param {number} duration - 閲覧時間（ミリ秒）
     */
    trackHelpUsage(sectionId, duration = 0) {
        try {
            this.userProgress.viewedSections.add(sectionId);
            this.userProgress.lastAccessed = Date.now();
            
            // 使用統計をローカルストレージに保存
            this.saveUserProgress();
            
            this.loggingSystem.debug('HelpManager', `Help usage tracked: ${sectionId}`);
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to track help usage', error);
        }
    }

    /**
     * セクションを既読としてマーク
     * @param {string} sectionId - セクションID
     */
    markAsRead(sectionId) {
        this.trackHelpUsage(sectionId);
    }

    /**
     * ユーザーのヘルプ進捗取得
     * @returns {Object} ユーザー進捗
     */
    getUserHelpProgress() {
        return {
            viewedSections: Array.from(this.userProgress.viewedSections),
            searchCount: this.userProgress.searchHistory.length,
            lastAccessed: this.userProgress.lastAccessed,
            totalSections: this.getTotalSectionCount()
        };
    }

    // ---- プライベートメソッド ----

    /**
     * ヘルプコンテンツのバリデーション
     * @param {Object} content - コンテンツ
     * @returns {boolean} バリデーション結果
     */
    validateHelpContent(content) {
        try {
            // 基本構造チェック
            if (!content || typeof content !== 'object') {
                this.loggingSystem.debug('HelpManager', 'Content validation failed: Invalid object structure');
                return false;
            }

            // 必須フィールドチェック
            const requiredFields = ['category', 'title', 'description', 'language', 'version', 'topics'];
            for (const field of requiredFields) {
                if (!(field in content)) {
                    this.loggingSystem.debug('HelpManager', `Content validation failed: Missing required field: ${field}`);
                    return false;
                }
            }

            // topics配列チェック
            if (!Array.isArray(content.topics)) {
                this.loggingSystem.debug('HelpManager', 'Content validation failed: Topics must be an array');
                return false;
            }

            // 各トピックの詳細バリデーション
            for (let i = 0; i < content.topics.length; i++) {
                const topic = content.topics[i];
                if (!this.validateTopic(topic, i)) {
                    return false;
                }
            }

            // 言語コードの検証
            if (!this.validateLanguageCode(content.language)) {
                this.loggingSystem.debug('HelpManager', `Content validation failed: Invalid language code: ${content.language}`);
                return false;
            }

            // バージョン形式の検証
            if (!this.validateVersion(content.version)) {
                this.loggingSystem.debug('HelpManager', `Content validation failed: Invalid version format: ${content.version}`);
                return false;
            }

            return true;
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Content validation error:', error);
            return false;
        }
    }

    /**
     * トピックのバリデーション
     * @param {Object} topic - トピック
     * @param {number} index - インデックス
     * @returns {boolean} バリデーション結果
     */
    validateTopic(topic, index) {
        // トピックの必須フィールド
        const requiredTopicFields = ['id', 'title', 'description', 'content', 'difficulty', 'estimatedReadTime', 'tags'];
        
        for (const field of requiredTopicFields) {
            if (!(field in topic)) {
                this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Missing field: ${field}`);
                return false;
            }
        }

        // ID形式の検証
        if (typeof topic.id !== 'string' || topic.id.trim().length === 0) {
            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid ID format`);
            return false;
        }

        // 難易度レベルの検証
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(topic.difficulty)) {
            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid difficulty: ${topic.difficulty}`);
            return false;
        }

        // 推定読み時間の検証
        if (typeof topic.estimatedReadTime !== 'number' || topic.estimatedReadTime <= 0) {
            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid estimatedReadTime`);
            return false;
        }

        // タグの検証
        if (!Array.isArray(topic.tags) || topic.tags.length === 0) {
            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid tags array`);
            return false;
        }

        // コンテンツ構造の検証
        if (typeof topic.content !== 'object' || topic.content === null) {
            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid content structure`);
            return false;
        }

        return true;
    }

    /**
     * 言語コードの検証
     * @param {string} languageCode - 言語コード
     * @returns {boolean} 検証結果
     */
    validateLanguageCode(languageCode) {
        const validLanguages = ['ja', 'en', 'ko', 'zh-CN', 'zh-TW'];
        return validLanguages.includes(languageCode);
    }

    /**
     * バージョン形式の検証
     * @param {string} version - バージョン文字列
     * @returns {boolean} 検証結果
     */
    validateVersion(version) {
        // セマンティックバージョニング形式またはプレースホルダー形式をサポート
        const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
        const placeholderPattern = /^\d+\.\d+\.\d+-placeholder$/;
        
        return semverPattern.test(version) || placeholderPattern.test(version);
    }

    getDefaultHelpContent(category) {
        return {
            version: '1.0.0',
            category,
            topics: [{
                id: 'default',
                title: 'ヘルプが利用できません',
                content: 'このセクションのヘルプコンテンツを読み込めませんでした。',
                difficulty: 'beginner',
                tags: ['error']
            }]
        };
    }

    /**
     * 検索スコアの計算
     * @param {Object} section - ヘルプセクション
     * @param {string} query - 検索クエリ
     * @returns {number} スコア
     */
    calculateSearchScore(section, query) {
        let score = 0;
        const queryLower = query.toLowerCase();
        
        // タイトルでの一致
        if (section.title.toLowerCase().includes(queryLower)) {
            score += 10;
        }
        
        // コンテンツでの一致
        if (section.content.toLowerCase().includes(queryLower)) {
            score += 5;
        }
        
        // タグでの一致
        if (section.tags && section.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
            score += 7;
        }
        
        // キーワードでの一致
        if (section.searchKeywords && section.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower))) {
            score += 8;
        }
        
        return score;
    }

    /**
     * 関連提案の取得
     * @param {string} sectionId - セクションID
     * @returns {Array} 関連セクション
     */
    getRelatedSuggestions(sectionId) {
        try {
            const suggestions = [];
            const language = this.localizationManager.getCurrentLanguage();
            
            // 簡単な関連性ルール
            const relatedMap = {
                'gameplay.basics': ['gameplay.bubble_interaction', 'gameplay.combo_system'],
                'gameplay.bubble_interaction': ['gameplay.special_bubbles', 'gameplay.scoring'],
                'menu.navigation': ['stages.selection', 'shop.items']
            };
            
            const relatedIds = relatedMap[sectionId] || [];
            for (const relatedId of relatedIds) {
                const section = this.getHelpSection(relatedId, language);
                if (section) {
                    suggestions.push(section);
                }
            }
            
            return suggestions;
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get related suggestions: ${sectionId}`, error);
            return [];
        }
    }

    /**
     * 総セクション数の取得
     * @returns {number} 総セクション数
     */
    getTotalSectionCount() {
        let total = 0;
        for (const content of this.helpContent.values()) {
            if (content.topics) {
                total += content.topics.length;
            }
        }
        return total;
    }

    /**
     * ユーザー進捗の読み込み
     */
    loadUserProgress() {
        try {
            const saved = localStorage.getItem('awaputi_help_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.userProgress.viewedSections = new Set(progress.viewedSections || []);
                this.userProgress.searchHistory = progress.searchHistory || [];
                this.userProgress.lastAccessed = progress.lastAccessed;
            }
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to load user progress', error);
        }
    }

    /**
     * ユーザー進捗の保存
     */
    saveUserProgress() {
        try {
            const progress = {
                viewedSections: Array.from(this.userProgress.viewedSections),
                searchHistory: this.userProgress.searchHistory.slice(-50), // 最新50件のみ保持
                lastAccessed: this.userProgress.lastAccessed
            };
            localStorage.setItem('awaputi_help_progress', JSON.stringify(progress));
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to save user progress', error);
        }
    }

    /**
     * リソースのクリーンアップ
     */
    /**
     * カテゴリのヘルプトピック一覧を取得
     * @param {string} categoryId - カテゴリID
     * @param {string} language - 言語コード
     * @returns {Promise<Array>} トピック一覧
     */
    async getHelpTopics(categoryId, language = null) {
        try {
            // 現在の言語を取得
            const currentLanguage = language || this.gameEngine.localizationManager.getCurrentLanguage();
            
            // ヘルプコンテンツを読み込み
            const content = await this.loadHelpContent(categoryId, currentLanguage);
            
            if (content && content.topics) {
                return content.topics.map(topic => ({
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                    difficulty: topic.difficulty,
                    estimatedReadTime: topic.estimatedReadTime,
                    tags: topic.tags
                }));
            }
            
            return [];
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get help topics for ${categoryId}`, error);
            return [];
        }
    }
    
    /**
     * 特定のヘルプコンテンツを取得
     * @param {string} topicId - トピックID
     * @param {string} categoryId - カテゴリID（オプション）
     * @param {string} language - 言語コード
     * @returns {Promise<Object>} ヘルプコンテンツ
     */
    async getHelpContent(topicId, categoryId = null, language = null) {
        try {
            // 現在の言語を取得
            const currentLanguage = language || this.gameEngine.localizationManager.getCurrentLanguage();
            
            // カテゴリが指定されていない場合、全カテゴリを検索
            if (!categoryId) {
                const categories = ['gameplay', 'bubbles', 'controls', 'scoring', 'settings', 'troubleshooting'];
                for (const cat of categories) {
                    const content = await this.findContentInCategory(topicId, cat, currentLanguage);
                    if (content) return content;
                }
                return null;
            }
            
            return await this.findContentInCategory(topicId, categoryId, currentLanguage);
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get help content for ${topicId}`, error);
            return null;
        }
    }
    
    /**
     * 特定のトピックコンテンツを取得（getHelpContentのエイリアス）
     * @param {string} topicId - トピックID
     * @param {string} categoryId - カテゴリID（オプション）
     * @param {string} language - 言語コード
     * @returns {Promise<Object>} トピックコンテンツ
     */
    async getTopicContent(topicId, categoryId = null, language = null) {
        try {
            const content = await this.getHelpContent(topicId, categoryId, language);
            
            if (content) {
                // 使用履歴を記録
                this.trackHelpUsage(`${categoryId || 'unknown'}.${topicId}`);
                this.loggingSystem.debug('HelpManager', `Topic content retrieved: ${topicId}`);
                return content;
            }
            
            // フォールバック: デフォルトコンテンツを返す
            this.loggingSystem.warn('HelpManager', `Topic content not found: ${topicId}, returning fallback`);
            return {
                id: topicId,
                title: 'コンテンツが見つかりません',
                description: '申し訳ございませんが、このトピックのコンテンツが見つかりませんでした。',
                content: 'このヘルプトピックは現在利用できません。後でもう一度お試しください。',
                difficulty: 'beginner',
                estimatedReadTime: '1分',
                tags: ['error', 'not-found'],
                category: categoryId || 'general',
                language: language || 'ja',
                isEmpty: true
            };
            
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to get topic content for ${topicId}`, error);
            
            // エラー時のフォールバックコンテンツ
            return {
                id: topicId,
                title: 'エラーが発生しました',
                description: 'コンテンツの読み込み中にエラーが発生しました。',
                content: 'ヘルプコンテンツの読み込みに失敗しました。ページを更新してもう一度お試しください。',
                difficulty: 'beginner',
                estimatedReadTime: '1分',
                tags: ['error'],
                category: categoryId || 'general',
                language: language || 'ja',
                isEmpty: true,
                error: true
            };
        }
    }
    
    /**
     * カテゴリ内でコンテンツを検索
     * @param {string} topicId - トピックID
     * @param {string} categoryId - カテゴリID
     * @param {string} language - 言語コード
     * @returns {Promise<Object>} 見つかったコンテンツ
     */
    async findContentInCategory(topicId, categoryId, language) {
        try {
            const categoryContent = await this.loadHelpContent(categoryId, language);
            if (!categoryContent || !categoryContent.topics) return null;
            
            const topic = categoryContent.topics.find(t => t.id === topicId);
            if (!topic) return null;
            
            return {
                id: topic.id,
                title: topic.title,
                description: topic.description,
                content: topic.content,
                difficulty: topic.difficulty,
                estimatedReadTime: topic.estimatedReadTime,
                tags: topic.tags,
                category: categoryId,
                language: language
            };
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Error finding content in category ${categoryId}`, error);
            return null;
        }
    }
    
    /**
     * 言語変更時の処理
     * @param {string} newLanguage - 新しい言語コード
     */
    async onLanguageChange(newLanguage) {
        try {
            // キャッシュをクリア
            this.helpContent.clear();
            
            // 検索エンジンのインデックスを再構築
            if (this.searchEngine) {
                await this.searchEngine.buildIndex(newLanguage);
            }
            
            this.loggingSystem.info('HelpManager', `Language changed to ${newLanguage}, content refreshed`);
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to handle language change to ${newLanguage}`, error);
        }
    }

    destroy() {
        try {
            this.saveUserProgress();
            this.helpContent.clear();
            this.loggingSystem.info('HelpManager', 'Help manager destroyed');
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to destroy help manager', error);
        }
    }
}

// シングルトンインスタンス管理
let helpManagerInstance = null;

/**
 * HelpManagerのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {HelpManager} HelpManagerインスタンス
 */
export function getHelpManager(gameEngine) {
    if (!helpManagerInstance) {
        helpManagerInstance = new HelpManager(gameEngine);
    }
    return helpManagerInstance;
}

/**
 * HelpManagerインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {HelpManager} 新しいHelpManagerインスタンス
 */
export function reinitializeHelpManager(gameEngine) {
    if (helpManagerInstance) {
        helpManagerInstance.destroy();
    }
    helpManagerInstance = new HelpManager(gameEngine);
    return helpManagerInstance;
}