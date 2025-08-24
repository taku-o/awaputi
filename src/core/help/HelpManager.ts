/**
 * HelpManager.ts
 * ヘルプシステムの中央管理クラス
 * コンテンツ読み込み、検索、コンテキスト対応ヘルプを統合管理
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { getLocalizationManager } from '../LocalizationManager.js';
import { CacheSystem } from '../CacheSystem.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { SearchEngine } from './SearchEngine.js';

// 型定義
export interface HelpContent {
    category: string;
    title: string;
    description: string;
    language: string;
    version: string;
    lastUpdated?: string;
    isPlaceholder?: boolean;
    topics: HelpTopic[];
}

export interface HelpTopic {
    id: string;
    title: string;
    description: string;
    content: TopicContent;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    tags: string[];
    searchKeywords?: string[];
}

export interface TopicContent {
    message?: string;
    note?: string;
    troubleshooting?: string;
    title?: string;
    content?: string;
    isEmpty?: boolean;
}

export interface UserProgress {
    viewedSections: Set<string>;
    searchHistory: SearchHistoryEntry[];
    lastAccessed: number | null;
}

export interface SearchHistoryEntry {
    query: string;
    timestamp: number;
    language: string;
}

export interface SearchResult {
    section: HelpTopic;
    score: number;
    category: string;
    language: string;
}

export interface SearchFilters {
    language?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    limit?: number;
}

export interface ContextualHelpResult {
    section: HelpTopic;
    context: string;
    suggestions: HelpTopic[];
}

export interface TopicDetails {
    id: string;
    title: string;
    description: string;
    category: string;
    language: string;
    content: TopicContent;
}

export interface UserHelpProgress {
    viewedSections: string[];
    searchCount: number;
    lastAccessed: number | null;
    totalSections: number;
}

export interface PlaceholderMessages {
    title: string;
    description: string;
    content: string;
    fallbackNote: string;
}

export interface LocalizationManager {
    getCurrentLanguage(): string;
}

export interface GameEngine {
    localizationManager: LocalizationManager;
}

/**
 * ヘルプシステムの中央管理クラス
 */
export class HelpManager {
    private gameEngine: GameEngine;
    private localizationManager: LocalizationManager;
    private cacheSystem: CacheSystem;
    private loggingSystem: LoggingSystem;
    private searchEngine: SearchEngine;
    private helpContent: Map<string, HelpContent>;
    private userProgress: UserProgress;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.localizationManager = getLocalizationManager();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.searchEngine = new SearchEngine();
        this.helpContent = new Map<string, HelpContent>();
        this.userProgress = {
            viewedSections: new Set<string>(),
            searchHistory: [],
            lastAccessed: null
        };

        this.initialize();
    }

    /**
     * ヘルプマネージャーの初期化
     */
    async initialize(): Promise<void> {
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
     * @param category - コンテンツカテゴリ
     * @param language - 言語コード
     * @returns ヘルプコンテンツ
     */
    async loadHelpContent(category: string, language: string = 'ja'): Promise<HelpContent> {
        try {
            const cacheKey = `help_content_${category}_${language}`;
            
            // キャッシュから確認
            let content = this.cacheSystem.get(cacheKey) as HelpContent;
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
     * @param category - カテゴリ
     * @param language - 言語コード
     * @returns コンテンツまたはnull
     */
    async tryLoadContent(category: string, language: string): Promise<HelpContent | null> {
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
     * @param category - カテゴリ
     * @param language - 言語コード
     * @returns コンテンツ
     */
    async loadWithFallback(category: string, language: string): Promise<HelpContent> {
        // フォールバックチェーン: 指定言語 → 日本語 → 英語 → プレースホルダー
        const fallbackChain = [language, 'ja', 'en'].filter((lang, index, array) => array.indexOf(lang) === index); // 重複除去

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
            this.loggingSystem.info('HelpManager', `Using legacy content for ${category}`);
            return legacyContent;
        }

        // 全てのフォールバックが失敗した場合はプレースホルダーを生成
        this.loggingSystem.warn('HelpManager', 
            `All fallbacks failed for ${category}, generating placeholder content`);
        return await this.generatePlaceholderContent(category, language);
    }

    /**
     * レガシーパスからのコンテンツ読み込み試行
     * @param category - カテゴリ
     * @returns コンテンツまたはnull
     */
    async tryLoadLegacyContent(category: string): Promise<HelpContent | null> {
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
            
            return await response.json() as HelpContent;
        } catch (error) {
            return null;
        }
    }

    /**
     * プレースホルダーコンテンツの生成
     * @param category - カテゴリ
     * @param language - 言語コード
     * @returns プレースホルダーコンテンツ
     */
    async generatePlaceholderContent(category: string, language: string): Promise<HelpContent> {
        const placeholderMessages: Record<string, PlaceholderMessages> = {
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
            topics: [{
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
            }]
        };
    }

    /**
     * ヘルプセクションの取得
     * @param sectionId - セクションID
     * @param language - 言語コード
     * @returns ヘルプセクション
     */
    getHelpSection(sectionId: string, language: string = 'ja'): HelpTopic | null {
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
     * @param query - 検索クエリ
     * @param filters - フィルター条件
     * @returns 検索結果
     */
    searchContent(query: string, filters: SearchFilters = {}): SearchResult[] {
        try {
            const results: SearchResult[] = [];
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
     * @param currentScene - 現在のシーン
     * @param userAction - ユーザーアクション
     * @returns コンテキストヘルプ
     */
    getContextualHelp(currentScene: string, userAction: string | null = null): ContextualHelpResult | null {
        try {
            const contextKey = userAction ? `${currentScene}.${userAction}` : currentScene;
            const language = this.localizationManager.getCurrentLanguage();

            // コンテキストマッピング
            const contextMap: Record<string, string> = {
                'MainMenuScene': 'menu.navigation',
                'GameScene': 'gameplay.basics',
                'GameScene.bubble_click': 'gameplay.bubble_interaction',
                'GameScene.combo': 'gameplay.combo_system',
                'StageSelectScene': 'stages.selection',
                'SettingsScene': 'settings.configuration',
                'HelpScene': 'help.navigation'
            };

            const mappedSectionId = contextMap[contextKey] || contextMap[currentScene];
            if (!mappedSectionId) {
                return null;
            }

            const section = this.getHelpSection(mappedSectionId, language);
            if (!section) {
                return null;
            }

            // 関連する提案を取得
            const suggestions = this.getRelatedSuggestions(mappedSectionId, language);

            return {
                section,
                context: contextKey,
                suggestions
            };

        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to get contextual help', error);
            return null;
        }
    }

    /**
     * 検索スコアの計算
     * @param section - セクション
     * @param query - クエリ
     * @returns スコア
     */
    private calculateSearchScore(section: HelpTopic, query: string): number {
        let score = 0;
        const queryLower = query.toLowerCase();

        // タイトル一致（高スコア）
        if (section.title.toLowerCase().includes(queryLower)) {
            score += 10;
        }

        // 説明一致
        if (section.description.toLowerCase().includes(queryLower)) {
            score += 5;
        }

        // タグ一致
        if (section.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
            score += 3;
        }

        // 検索キーワード一致
        if (section.searchKeywords && section.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower))) {
            score += 7;
        }

        // コンテンツ一致
        if (section.content && section.content.content && section.content.content.toLowerCase().includes(queryLower)) {
            score += 2;
        }

        return score;
    }

    /**
     * 関連提案の取得
     * @param sectionId - セクションID
     * @param language - 言語
     * @returns 関連セクション
     */
    private getRelatedSuggestions(sectionId: string, language: string): HelpTopic[] {
        const suggestions: HelpTopic[] = [];
        
        try {
            const parts = sectionId.split('.');
            const category = parts[0];
            const contentKey = `${category}_${language}`;
            const content = this.helpContent.get(contentKey);

            if (content && content.topics) {
                // 同じカテゴリから3つの関連セクションを取得
                const otherSections = content.topics.filter(topic => topic.id !== parts[1]);
                suggestions.push(...otherSections.slice(0, 3));
            }
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to get related suggestions', error);
        }

        return suggestions;
    }

    /**
     * ヘルプ利用履歴の追跡
     * @param sectionId - セクションID
     */
    private trackHelpUsage(sectionId: string): void {
        this.userProgress.viewedSections.add(sectionId);
        this.userProgress.lastAccessed = Date.now();
        
        // ユーザー進捗の保存
        this.saveUserProgress();
    }

    /**
     * ユーザー進捗の読み込み
     */
    private loadUserProgress(): void {
        try {
            const savedProgress = localStorage.getItem('help_user_progress');
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                this.userProgress.viewedSections = new Set(parsed.viewedSections || []);
                this.userProgress.searchHistory = parsed.searchHistory || [];
                this.userProgress.lastAccessed = parsed.lastAccessed || null;
            }
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to load user progress', error);
        }
    }

    /**
     * ユーザー進捗の保存
     */
    private saveUserProgress(): void {
        try {
            const progressData = {
                viewedSections: Array.from(this.userProgress.viewedSections),
                searchHistory: this.userProgress.searchHistory,
                lastAccessed: this.userProgress.lastAccessed
            };
            localStorage.setItem('help_user_progress', JSON.stringify(progressData));
        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to save user progress', error);
        }
    }

    /**
     * ヘルプコンテンツの検証
     * @param content - コンテンツ
     * @returns 有効性
     */
    private validateHelpContent(content: any): content is HelpContent {
        return content && 
               typeof content.category === 'string' &&
               typeof content.title === 'string' &&
               typeof content.language === 'string' &&
               Array.isArray(content.topics);
    }

    /**
     * ユーザー進捗の取得
     * @returns ユーザー進捗
     */
    getUserProgress(): UserHelpProgress {
        const totalSections = Array.from(this.helpContent.values())
            .reduce((total, content) => total + content.topics.length, 0);
        
        return {
            viewedSections: Array.from(this.userProgress.viewedSections),
            searchCount: this.userProgress.searchHistory.length,
            lastAccessed: this.userProgress.lastAccessed,
            totalSections
        };
    }

    /**
     * カテゴリ一覧の取得
     * @param language - 言語
     * @returns カテゴリ一覧
     */
    getAvailableCategories(language: string = 'ja'): string[] {
        const categories: Set<string> = new Set();
        
        for (const [key, content] of this.helpContent.entries()) {
            if (key.endsWith(`_${language}`)) {
                categories.add(content.category);
            }
        }

        return Array.from(categories);
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
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
let helpManagerInstance: HelpManager | null = null;

/**
 * HelpManagerのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns HelpManagerインスタンス
 */
export function getHelpManager(gameEngine: GameEngine): HelpManager {
    if (!helpManagerInstance) {
        helpManagerInstance = new HelpManager(gameEngine);
    }
    return helpManagerInstance;
}

/**
 * HelpManagerインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいHelpManagerインスタンス
 */
export function reinitializeHelpManager(gameEngine: GameEngine): HelpManager {
    if (helpManagerInstance) {
        helpManagerInstance.destroy();
    }
    helpManagerInstance = new HelpManager(gameEngine);
    return helpManagerInstance;
}

export default HelpManager;