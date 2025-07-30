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
            
            // デフォルト言語のヘルプコンテンツを読み込み
            const currentLanguage = this.localizationManager.getCurrentLanguage();
            await this.loadHelpContent('default', currentLanguage);
            
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

            // コンテンツファイルの読み込み
            const contentPath = `/help/${language}/${category}.json`;
            const response = await fetch(contentPath);
            
            if (!response.ok) {
                // フォールバック: 日本語版を試行
                if (language !== 'ja') {
                    this.loggingSystem.warn('HelpManager', `Help content not found for ${language}, falling back to Japanese`);
                    return await this.loadHelpContent(category, 'ja');
                }
                throw new Error(`Failed to load help content: ${contentPath}`);
            }

            content = await response.json();
            
            // バリデーション
            if (!this.validateHelpContent(content)) {
                throw new Error('Invalid help content format');
            }

            // キャッシュに保存
            this.cacheSystem.set(cacheKey, content, 30 * 60 * 1000); // 30分
            this.helpContent.set(`${category}_${language}`, content);
            
            this.loggingSystem.info('HelpManager', `Loaded help content: ${cacheKey}`);
            return content;
            
        } catch (error) {
            this.loggingSystem.error('HelpManager', `Failed to load help content: ${category}`, error);
            return this.getDefaultHelpContent(category);
        }
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
            
            if (!content || !content.sections) {
                this.loggingSystem.warn('HelpManager', `Help content not found: ${contentKey}`);
                return null;
            }

            const sectionData = content.sections.find(s => s.id === section);
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

                if (content.sections) {
                    for (const section of content.sections) {
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
        if (!content || typeof content !== 'object') return false;
        if (!content.version || !content.sections) return false;
        if (!Array.isArray(content.sections)) return false;
        
        return content.sections.every(section => 
            section.id && section.title && section.content
        );
    }

    /**
     * デフォルトヘルプコンテンツの取得
     * @param {string} category - カテゴリ
     * @returns {Object} デフォルトコンテンツ
     */
    getDefaultHelpContent(category) {
        return {
            version: '1.0.0',
            category,
            sections: [{
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
            if (content.sections) {
                total += content.sections.length;
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