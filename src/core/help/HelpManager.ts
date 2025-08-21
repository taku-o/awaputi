/**
 * HelpManager.ts
 * ヘルプシステムの中央管理クラス
 * コンテンツ読み込み、検索、コンテキスト対応ヘルプを統合管理
 */

import { ErrorHandler  } from '../../utils/ErrorHandler.js';
import { getLocalizationManager  } from '../LocalizationManager.js';
import { CacheSystem  } from '../CacheSystem.js';
import { LoggingSystem  } from '../LoggingSystem.js';
import { SearchEngine  } from './SearchEngine.js';

// 型定義
export interface HelpContent { category: string;
    title: string;
    description: string;
    language: string;
    version: string;
    lastUpdated?: string;
    isPlaceholder?: boolean;
    topics: HelpTopic[];

export interface HelpTopic { id: string;
    title: string;
    description: string;
   , content: TopicContent;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    tags: string[];
    searchKeywords?: string[];

export interface TopicContent { message?: string,
    note?: string;
    troubleshooting?: string;
    title?: string;
    content?: string;
    isEmpty?: boolean;

export interface UserProgress { viewedSections: Set<string>;
    searchHistory: SearchHistoryEntry[];
    lastAccessed: number | null }

export interface SearchHistoryEntry { query: string;
    timestamp: number;
    language: string;

export interface SearchResult { section: HelpTopic;
    score: number;
    category: string;
    language: string;

export interface SearchFilters { language?: string,

    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    limit?: number;

export interface ContextualHelpResult { section: HelpTopic;
    context: string;
    suggestions: HelpTopic[];

export interface TopicDetails { id: string;
    title: string;
    description: string;
    category: string;
    language: string;
   , content: TopicContent;

export interface UserHelpProgress { viewedSections: string[];
    searchCount: number;
    lastAccessed: number | null;
    totalSections: number;

export interface PlaceholderMessages { title: string;
    description: string;
    content: string;
    fallbackNote: string;

export interface LocalizationManager { getCurrentLanguage(): string;

export interface GameEngine {
    localizationManager: LocalizationManager;

/**
 * ヘルプシステムの中央管理クラス
 */
export class HelpManager {
    private gameEngine: GameEngine;
    private localizationManager: LocalizationManager;
    private cacheSystem: CacheSystem;
    private loggingSystem: LoggingSystem;
    private searchEngine: SearchEngine;
    private, helpContent: Map<string, HelpContent>,
    private userProgress: UserProgress;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.localizationManager = getLocalizationManager();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.searchEngine = new SearchEngine();
        this.helpContent = new Map<string, HelpContent>(),
        this.userProgress = {
            viewedSections: new Set<string>(
            searchHistory: [] }
            lastAccessed: null;;
        this.initialize();
    }

    /**
     * ヘルプマネージャーの初期化'
     */''
    async initialize()';'
            this.loggingSystem.info('HelpManager', 'Initializing help system...';
            ';'
            // 基本ヘルプカテゴリを読み込み
            const currentLanguage = this.localizationManager.getCurrentLanguage()';'
            await this.loadHelpContent('gameplay', currentLanguage';'
            ';'
            // ユーザー進捗の復元
            this.loadUserProgress()';'
            this.loggingSystem.info('HelpManager', 'Help system initialized successfully';} catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to initialize help system', error','
            ErrorHandler.handle(error, 'HelpManager.initialize') }
    }

    /**
     * ヘルプコンテンツの読み込み
     * @param category - コンテンツカテゴリ
     * @param language - 言語コード
     * @returns ヘルプコンテンツ'
     */''
    async loadHelpContent(category: string, language: string = 'ja': Promise<HelpContent> { try { }'
            const cacheKey = `help_content_${category}_${language}`;
            
            // キャッシュから確認
            let content = this.cacheSystem.get(cacheKey) as HelpContent;
            if (content) { }'

                this.loggingSystem.debug('HelpManager', `Loaded help content from cache: ${cacheKey}`};
                return content;
            }

            // 新しい強化されたコンテンツ読み込み
            content = await this.tryLoadContent(category, language);
            
            if (!content) {
            
                // フォールバック機能付きの安全な読み込み
            
            }
                content = await this.loadWithFallback(category, language); }
            }
            ;
            // バリデーション
            if(!this.validateHelpContent(content)) { ''
                this.loggingSystem.warn('HelpManager', `Invalid content format for ${category}, generating placeholder`}
                content = await this.generatePlaceholderContent(category, language};
            }

            // キャッシュに保存
            this.cacheSystem.set(cacheKey, content, 30 * 60 * 1000); // 30分
            this.helpContent.set(`${category}_${ language}`, content'}'

            ' }'

            this.loggingSystem.info('HelpManager', `Loaded help content: ${cacheKey}`};
            return content;

        } catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to load help content: ${category}`, error);
            return await this.generatePlaceholderContent(category, language);

    /**
     * 静かにコンテンツの読み込みを試行（404エラーを生成しない）
     * @param category - カテゴリ
     * @param language - 言語コード
     * @returns コンテンツまたはnull'
     */''
    async tryLoadContent(category: string, language: string): Promise<HelpContent | null> { try { }
            const contentPath = `./src/core/help/content/help/${language}/${category}.json`;
            ';'
            // HEADリクエストでファイル存在確認（404エラーを避ける）
            const headResponse = await fetch(contentPath, { method: 'HEAD ,'
            if (!headResponse.ok) {
    
}
                return null;
            
            // ファイルが存在する場合のみGETリクエストを実行
            const response = await fetch(contentPath);
            if (!response.ok) { return null }

            const content = await response.json();

            this.loggingSystem.debug('HelpManager', `Successfully loaded content: ${contentPath}`};
            return content;
            
        } catch (error) { // エラーを静かに処理（ログに出力しない）
            return null,

    /**
     * フォールバック機能付きの安全なコンテンツ読み込み
     * @param category - カテゴリ
     * @param language - 言語コード
     * @returns コンテンツ
     */''
    async loadWithFallback(category: string, language: string): Promise<HelpContent> { // フォールバックチェーン: 指定言語 → 日本語 → 英語 → プレースホルダー
        const fallbackChain = [language,
            'ja',]','
            'en'],
        ].filter((lang, index, array) => array.indexOf(lang) === index), // 重複除去

        for (const fallbackLang of fallbackChain) {

            const content = await this.tryLoadContent(category, fallbackLang);
            if (content) {''
                if (fallbackLang !== language) {
    
}

                    this.loggingSystem.info('HelpManager' }'
                        `Content not found for ${language}/${category}, using fallback: ${fallbackLang}`};
                }
                return content;

        // レガシーパスの確認
        const legacyContent = await this.tryLoadLegacyContent(category);
        if (legacyContent) {', ' }

            this.loggingSystem.info('HelpManager'}

                `Using legacy content for ${category}`}';'
            return legacyContent;
        }
';'
        // 全てのフォールバックが失敗した場合はプレースホルダーを生成
        this.loggingSystem.warn('HelpManager);'
            `All fallbacks failed for ${ category}, generating placeholder content`}
        return await this.generatePlaceholderContent(category, language};
    }

    /**
     * レガシーパスからのコンテンツ読み込み試行
     * @param category - カテゴリ
     * @returns コンテンツまたはnull'
     */''
    async tryLoadLegacyContent(category: string): Promise<HelpContent | null> { try { }

            const legacyPath = `./src/core/help/content/help/${category}.json`;
            const headResponse = await fetch(legacyPath, { method: 'HEAD ,'
            if (!headResponse.ok) {
    
}
                return null;
            
            const response = await fetch(legacyPath);
            if (!response.ok) { return null }
            
            return await response.json() as HelpContent;
        } catch (error) { return null,

    /**
     * プレースホルダーコンテンツの生成
     * @param category - カテゴリ
     * @param language - 言語コード
     * @returns プレースホルダーコンテンツ'
     */''
    async generatePlaceholderContent(category: string, language: string): Promise<HelpContent> { const placeholderMessages: Record<string, PlaceholderMessages> = {
            ja: { }
                title: `${category}ヘルプ（準備中）`,
                description: `${category}に関するヘルプコンテンツは現在準備中です。`,''
                content: '申し訳ございませんが、このヘルプコンテンツは現在利用できません。しばらくしてから再度お試しください。',
                fallbackNote: '最新の情報については、メインメニューの他のヘルプセクションをご確認ください。',
            },

            en: { }'

                title: `${category} Help(Coming, Soon)`;
                description: `Help content for ${category} is currently being prepared.`,''
                content: 'Sorry, this help content is currently unavailable. Please try again later.',
                fallbackNote: 'For the latest information, please check other help sections in the main menu.';
            }
        };

        const messages = placeholderMessages[language] || placeholderMessages['en'];
        
        return { category: category,
            title: messages.title,
    description: messages.description,
            language: language,
            version: "0.0.1-placeholder",
            lastUpdated: new Date().toISOString().split('T')[0],
    isPlaceholder: true,
            topics: [{''
                    id: 'placeholder_info',
                    title: messages.title,
                    description: messages.description,
    content: {
                        message: messages.content,
                        note: messages.fallbackNote,' };'

                        troubleshooting: '問題が続く場合は、ページを再読み込みするか、サポートにお問い合わせください。' 
    },''
                    difficulty: 'beginner]',
    estimatedReadTime: 30,']';
                    tags: ['placeholder', 'info'] }
            ];
        }

    /**
     * ヘルプセクションの取得
     * @param sectionId - セクションID
     * @param language - 言語コード
     * @returns ヘルプセクション'
     */''
    getHelpSection(sectionId: string, language: string = 'ja'): HelpTopic | null { try {'
            const parts = sectionId.split('.),'
            const category = parts[0],
            const section = parts[1] }
            const contentKey = `${category}_${language}`;
            const content = this.helpContent.get(contentKey);

            if (!content || !content.topics) { }'

                this.loggingSystem.warn('HelpManager', `Help content not found: ${contentKey}`};
                return null;
            }

            const sectionData = content.topics.find(s => s.id === section);
            if (sectionData) {
                // 閲覧履歴に追加
                this.trackHelpUsage(sectionId) }
                return sectionData;
';'

            return null;} catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get help section: ${sectionId}`, error);
            return null;

    /**
     * コンテンツ検索
     * @param query - 検索クエリ
     * @param filters - フィルター条件
     * @returns 検索結果
     */
    searchContent(query: string, filters: SearchFilters = { ): SearchResult[] {
        try {
            const results: SearchResult[] = [],
            const language = filters.language || this.localizationManager.getCurrentLanguage();
            // 検索履歴に追加
            this.userProgress.searchHistory.push({)
                query,
                timestamp: Date.now(),
                language,
            
            // 最大100件の検索履歴を保持
            if (this.userProgress.searchHistory.length > 100) { this.userProgress.searchHistory.shift() }

            // 全カテゴリを検索
            for(const [key, content] of this.helpContent.entries() {
                if (!key.endsWith(`_${language)`) continue,

                if (content.topics) {
                    for (const, section, of, content.topics) {
                        const, score = this.calculateSearchScore(section, query);
                        if (score > 0) {
                            results.push({}
                                section}
                                score,' }'

                                category: key.replace(`_${language}`, '},'
                                language;
                            };
                        }
}
            }

            // スコア順にソート
            results.sort((a, b) => b.score - a.score);
            
            // フィルター適用
            let filteredResults = results;
            if (filters.category) { filteredResults = results.filter(r => r.category === filters.category) }
            }
            if (filters.difficulty) { }

                filteredResults = filteredResults.filter(r => r.section.difficulty === filters.difficulty); }
            }

            this.loggingSystem.debug('HelpManager', `Search completed: "${query}" - ${ filteredResults.length} results`}
            return filteredResults.slice(0, filters.limit || 50};

        } catch (error") { }"
            this.loggingSystem.error('HelpManager', `Failed to search content: ${query}`, error);
            return [];

    /**
     * コンテキストに応じたヘルプの取得
     * @param currentScene - 現在のシーン
     * @param userAction - ユーザーアクション
     * @returns コンテキストヘルプ
     */
    getContextualHelp(currentScene: string, userAction: string | null = null): ContextualHelpResult | null { try { }

            const contextKey = userAction ? `${currentScene}.${userAction}` : currentScene;
            const language = this.localizationManager.getCurrentLanguage('''
                'MainMenuScene': 'menu.navigation',
                'GameScene': 'gameplay.basics',
                'GameScene.bubble_click': 'gameplay.bubble_interaction',
                'GameScene.combo': 'gameplay.combo_system',
                'StageSelectScene': 'stages.selection',
                'ShopScene': 'shop.items',
                'UserInfoScene': 'profile.statistics';
            };
);
            const sectionId = contextMap[contextKey] || contextMap[currentScene];)
            if (sectionId) {
                const helpSection = this.getHelpSection(sectionId, language);
                if (helpSection) {''
                    this.loggingSystem.debug('HelpManager', `Contextual help provided: ${contextKey}`}
            }
                    return { section: helpSection,
                        context: contextKey,
                        suggestions: this.getRelatedSuggestions(sectionId};
                    }
            }
';'

            return null;} catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get contextual help: ${currentScene}`, error);
            return null;

    /**
     * カテゴリ別トピック一覧を取得
     * @param category - カテゴリ名
     * @param language - 言語コード
     * @returns トピック一覧
     */
    async getCategoryTopics(category: string, language: string | null = null): Promise<TopicDetails[]> { try {
            const lang = language || this.localizationManager.getCurrentLanguage();
            // コンテンツを直接読み込み }
            const contentKey = `${category}_${lang}`;
            let content = this.helpContent.get(contentKey);
            
            if (!content) {
            
                // コンテンツが未読み込みの場合は読み込み
            
            }
                content = await this.loadHelpContent(category, lang); }
            }

            if (!content || !content.topics) { }'

                this.loggingSystem.warn('HelpManager', `No topics found for category: ${category} in ${lang}`}';'
                return [];
            }
            
            // 実際のコンテンツからトピックリストを取得
            const topics = content.topics || [];
            
            // 各トピックに詳細情報を付加
            return topics.map(topic => ({ id: topic.id,
                title: topic.title,
                description: topic.description || ','
                category,
                language: lang,
    content: topic.content || {'
                    title: topic.title,','
                    content: 'コンテンツを読み込み中...',
    isEmpty: true;));
        } catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get category topics: ${category}`, error';'
            return [];

    /**
     * ツールチップの表示
     * @param element - 対象要素
     * @param content - ツールチップ内容
     * @param options - 表示オプション'
     */''
    showTooltip(element: HTMLElement, content: string, options: Record<string, any> = { )): void {
        try {
            // TooltipSystemとの連携は後続のタスクで実装
            this.loggingSystem.debug('HelpManager', `Tooltip requested for element: ${element.id || element.className'`},'
            // 基本的なツールチップ表示
            element.setAttribute('title', content};' }'

            element.setAttribute('aria-label', content};

        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to show tooltip', error' }'
    }

    /**
     * ツールチップの非表示'
     */''
    hideTooltip()';'
            this.loggingSystem.debug('HelpManager', 'Tooltip hide requested';} catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to hide tooltip', error) }
    }

    /**
     * ヘルプ使用履歴の追跡
     * @param sectionId - セクションID
     * @param duration - 閲覧時間（ミリ秒）
     */
    trackHelpUsage(sectionId: string, duration: number = 0): void { try {
            this.userProgress.viewedSections.add(sectionId);
            this.userProgress.lastAccessed = Date.now();
            ','
            // 使用統計をローカルストレージに保存
            this.saveUserProgress( }

            this.loggingSystem.debug('HelpManager', `Help usage tracked: ${sectionId}`}';} catch (error) {'
            this.loggingSystem.error('HelpManager', 'Failed to track help usage', error) }
    }

    /**
     * セクションを既読としてマーク
     * @param sectionId - セクションID
     */
    markAsRead(sectionId: string): void { this.trackHelpUsage(sectionId) }

    /**
     * ユーザーのヘルプ進捗取得
     * @returns ユーザー進捗
     */
    getUserHelpProgress(): UserHelpProgress { return { viewedSections: Array.from(this.userProgress.viewedSections,
            searchCount: this.userProgress.searchHistory.length,
    lastAccessed: this.userProgress.lastAccessed },
            totalSections: this.getTotalSectionCount(); 
    }

    // ---- プライベートメソッド ----

    /**
     * ヘルプコンテンツのバリデーション
     * @param content - コンテンツ
     * @returns バリデーション結果
     */''
    private validateHelpContent(content: any): content is HelpContent { try {
            // 基本構造チェック
            if (!content || typeof, content !== 'object') {

                this.loggingSystem.debug('HelpManager', 'Content validation failed: Invalid object structure')
            }
                return false;
';'
            // 必須フィールドチェック
            const requiredFields = ['category', 'title', 'description', 'language', 'version', 'topics'];
            for (const field of requiredFields) {', ' }

                if(!(field, in content)) { }'

                    this.loggingSystem.debug('HelpManager', `Content validation failed: Missing required, field: ${field}`}';'
                    return false;
';'
            // topics配列チェック
            if(!Array.isArray(content.topics)) { ''
                this.loggingSystem.debug('HelpManager', 'Content validation failed: Topics must be an array,'
                return false }

            // 各トピックの詳細バリデーション
            for(let, i = 0; i < content.topics.length; i++) {
                const topic = content.topics[i],
                if (!this.validateTopic(topic, i) {
            }
                    return false;
;
            // 言語コードの検証
            if(!this.validateLanguageCode(content.language)) { }'

                this.loggingSystem.debug('HelpManager', `Content validation failed: Invalid language, code: ${content.language}`}';'
                return false;
            }
';'
            // バージョン形式の検証
            if(!this.validateVersion(content.version)) { }'

                this.loggingSystem.debug('HelpManager', `Content validation failed: Invalid version, format: ${content.version}`}';'
                return false;
            }
';'

            return true;} catch (error) {
            this.loggingSystem.error('HelpManager', 'Content validation error:', error','
            return false,

    /**
     * トピックのバリデーション
     * @param topic - トピック
     * @param index - インデックス
     * @returns バリデーション結果'
     */''
    private validateTopic(topic: any, index: number): topic is HelpTopic { // トピックの必須フィールド
        const requiredTopicFields = ['id', 'title', 'description', 'content', 'difficulty', 'estimatedReadTime', 'tags'],
        
        for (const field of requiredTopicFields) {
        ','

            ' }'

            if(!(field, in topic)) { }'

                this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Missing field: ${field}`}';'
                return false;
';'
        // ID形式の検証
        if (typeof, topic.id !== 'string' || topic.id.trim().length === 0') { }'

            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid ID format`}';'
            return false;
        }
';'
        // 難易度レベルの検証
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if(!validDifficulties.includes(topic.difficulty)) { }'

            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid difficulty: ${topic.difficulty}`}';'
            return false;
        }
';'
        // 推定読み時間の検証
        if(typeof, topic.estimatedReadTime !== 'number' || topic.estimatedReadTime <= 0' { }'

            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid estimatedReadTime`}';'
            return false;
        }
';'
        // タグの検証
        if (!Array.isArray(topic.tags) || topic.tags.length === 0') { }'

            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid tags array`}';'
            return false;
        }
';'
        // コンテンツ構造の検証
        if(typeof, topic.content !== 'object' || topic.content === null' { }'

            this.loggingSystem.debug('HelpManager', `Topic validation failed at index ${index}: Invalid content structure`}';'
            return false;
        }

        return true;
    }

    /**
     * 言語コードの検証
     * @param languageCode - 言語コード
     * @returns 検証結果'
     */''
    private validateLanguageCode(languageCode: string): boolean { ''
        const validLanguages = ['ja', 'en', 'ko', 'zh-CN', 'zh-TW],'
        return validLanguages.includes(languageCode) }

    /**
     * バージョン形式の検証
     * @param version - バージョン文字列
     * @returns 検証結果
     */
    private validateVersion(version: string): boolean { // セマンティックバージョニング形式またはプレースホルダー形式をサポート
        const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)? $/,
        const placeholderPattern = /^\d+\.\d+\.\d+-placeholder$/,
        
        return semverPattern.test(version) || placeholderPattern.test(version) }
 : undefined';'
    getDefaultHelpContent(category: string): HelpContent { return { ''
            version: '1.0.0',
            category,
            title: 'ヘルプが利用できません',
            description: 'このセクションのヘルプコンテンツを読み込めませんでした。',
            language: 'ja',
            topics: [{''
                id: 'default',
                title: 'ヘルプが利用できません',' };'

                description: 'このセクションのヘルプコンテンツを読み込めませんでした。',' }'

                content: { content: 'このセクションのヘルプコンテンツを読み込めませんでした。' },''
                difficulty: 'beginner]',
    estimatedReadTime: 30,']';
                tags: ['error'] }]
        }
    }

    /**
     * 検索スコアの計算
     * @param section - ヘルプセクション
     * @param query - 検索クエリ
     * @returns スコア
     */
    private calculateSearchScore(section: HelpTopic, query: string): number { let score = 0,
        const queryLower = query.toLowerCase();
        ','
        // タイトルでの一致
        if (section.title.toLowerCase().includes(queryLower)) {
            score += 10 }
        ';'
        // コンテンツでの一致（文字列として検索）
        const contentString = typeof section.content === 'string' ? section.content: (section.content.content || section.content.message || ','
        if (contentString.toLowerCase().includes(queryLower) { score += 5 }
        
        // タグでの一致
        if (section.tags && section.tags.some(tag => tag.toLowerCase().includes(queryLower)) { score += 7 }
        
        // キーワードでの一致
        if (section.searchKeywords && section.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower)) { score += 8 }
        
        return score;
    }

    /**
     * 関連提案の取得
     * @param sectionId - セクションID
     * @returns 関連セクション
     */
    private getRelatedSuggestions(sectionId: string): HelpTopic[] { try {
            const suggestions: HelpTopic[] = [],
            const language = this.localizationManager.getCurrentLanguage('''
                'gameplay.basics': ['gameplay.bubble_interaction', 'gameplay.combo_system],'
                'gameplay.bubble_interaction': ['gameplay.special_bubbles', 'gameplay.scoring],'
                'menu.navigation': ['stages.selection', 'shop.items] };'
            );
            const relatedIds = relatedMap[sectionId] || [];)
            for (const relatedId of relatedIds) {
                const section = this.getHelpSection(relatedId, language);
                if (section) {
            }
                    suggestions.push(section); }
}
            ';'

            return suggestions;} catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get related suggestions: ${sectionId}`, error);
            return [];

    /**
     * 総セクション数の取得
     * @returns 総セクション数
     */
    private getTotalSectionCount(): number { let total = 0,
        for (const content of this.helpContent.values() {
            if (content.topics) {
        }
                total += content.topics.length; }
}
        return total;
    }

    /**
     * ユーザー進捗の読み込み'
     */''
    private loadUserProgress()';'
            const saved = localStorage.getItem('awaputi_help_progress);'
            if (saved) {
                const progress = JSON.parse(saved);
                this.userProgress.viewedSections = new Set(progress.viewedSections || []);
                this.userProgress.searchHistory = progress.searchHistory || [] }

                this.userProgress.lastAccessed = progress.lastAccessed;' }'

            } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to load user progress', error) }
    }

    /**
     * ユーザー進捗の保存
     */
    private saveUserProgress(): void { try {
            const progress = {'
                viewedSections: Array.from(this.userProgress.viewedSections,
                searchHistory: this.userProgress.searchHistory.slice(-50), // 最新50件のみ保持,
                lastAccessed: this.userProgress.lastAccessed },
            localStorage.setItem('awaputi_help_progress', JSON.stringify(progress);'} catch (error) {'
            this.loggingSystem.error('HelpManager', 'Failed to save user progress', error) }
    }

    /**
     * カテゴリのヘルプトピック一覧を取得
     * @param categoryId - カテゴリID
     * @param language - 言語コード
     * @returns トピック一覧
     */
    async getHelpTopics(categoryId: string, language: string | null = null): Promise<TopicDetails[]> { try {
            // 現在の言語を取得
            const currentLanguage = language || this.gameEngine.localizationManager.getCurrentLanguage();
            // ヘルプコンテンツを読み込み
            const content = await this.loadHelpContent(categoryId, currentLanguage);
            if (content && content.topics) {
            
                return content.topics.map(topic => ({
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                    category: categoryId,
    language: currentLanguage)
            }
                    content: topic.content)); 
    }
            ';'

            return [];} catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get help topics for ${categoryId}`, error);
            return [];
    
    /**
     * 特定のヘルプコンテンツを取得
     * @param topicId - トピックID
     * @param categoryId - カテゴリID（オプション）
     * @param language - 言語コード
     * @returns ヘルプコンテンツ
     */
    async getHelpContent(topicId: string, categoryId: string | null = null, language: string | null = null): Promise<TopicDetails | null>,
        try { // 現在の言語を取得
            const currentLanguage = language || this.gameEngine.localizationManager.getCurrentLanguage();
            // カテゴリが指定されていない場合、全カテゴリを検索
            if (!categoryId) {

                const categories = ['gameplay', 'bubbles', 'controls', 'scoring', 'settings', 'troubleshooting'],
                for (const cat of categories) {
                    const content = await this.findContentInCategory(topicId, cat, currentLanguage) }
                    if (content) return content;
                return null;
            }
            ';'

            return await this.findContentInCategory(topicId, categoryId, currentLanguage);} catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get help content for ${topicId}`, error);
            return null;
    
    /**
     * 特定のトピックコンテンツを取得（getHelpContentのエイリアス）
     * @param topicId - トピックID
     * @param categoryId - カテゴリID（オプション）
     * @param language - 言語コード
     * @returns トピックコンテンツ
     */
    async getTopicContent(topicId: string, categoryId: string | null = null, language: string | null = null): Promise<TopicDetails>,
        try { const content = await this.getHelpContent(topicId, categoryId, language);
            if (content) {
    
}

                // 使用履歴を記録' }'

                this.trackHelpUsage(`${categoryId || 'unknown'}.${ topicId}`}' }'

                this.loggingSystem.debug('HelpManager', `Topic content retrieved: ${topicId}`}';'
                return content;
            }
            ';'
            // フォールバック: デフォルトコンテンツを返す
            this.loggingSystem.warn('HelpManager', `Topic content not found: ${topicId}, returning fallback`}';'

            return { id: topicId,''
                title: 'コンテンツが見つかりません',
                description: '申し訳ございませんが、このトピックのコンテンツが見つかりませんでした。',
                category: categoryId || 'general',
                language: language || 'ja',
                content: {''
                    content: 'このヘルプトピックは現在利用できません。後でもう一度お試しください。' },
                    isEmpty: true, catch (error) { }

            this.loggingSystem.error('HelpManager', `Failed to get topic content for ${topicId}`, error';'
            
            // エラー時のフォールバックコンテンツ
            return { id: topicId,''
                title: 'エラーが発生しました',
                description: 'コンテンツの読み込み中にエラーが発生しました。',
                category: categoryId || 'general',
                language: language || 'ja',
                content: {''
                    content: 'ヘルプコンテンツの読み込みに失敗しました。ページを更新してもう一度お試しください。' },
                    isEmpty: true,
    }
    
    /**
     * カテゴリ内でコンテンツを検索
     * @param topicId - トピックID
     * @param categoryId - カテゴリID
     * @param language - 言語コード
     * @returns 見つかったコンテンツ
     */
    async findContentInCategory(topicId: string, categoryId: string, language: string): Promise<TopicDetails | null>,
        try { const categoryContent = await this.loadHelpContent(categoryId, language);
            if (!categoryContent || !categoryContent.topics) return null,
            
            const topic = categoryContent.topics.find(t => t.id === topicId);
            if (!topic) return null,
            
            return { id: topic.id,
                title: topic.title,
                description: topic.description,
                category: categoryId,
    language: language,
                content: topic.content 
    };'} catch (error) { }'

            this.loggingSystem.error('HelpManager', `Error finding content in category ${categoryId}`, error);
            return null;
    
    /**
     * 言語変更時の処理
     * @param newLanguage - 新しい言語コード
     */
    async onLanguageChange(newLanguage: string): Promise<void> { try {
            // キャッシュをクリア
            this.helpContent.clear();
            // 検索エンジンのインデックスを再構築
            if (this.searchEngine) { }

                await this.searchEngine.buildIndex(newLanguage); }
            }

            this.loggingSystem.info('HelpManager', `Language changed to ${newLanguage}, content refreshed`}';} catch (error) { }'

            this.loggingSystem.error('HelpManager', `Failed to handle language change to ${newLanguage}`, error);
        }
    }

    destroy(): void { try {
            this.saveUserProgress();
            this.helpContent.clear()','
            this.loggingSystem.info('HelpManager', 'Help manager destroyed',' }'

        } catch (error) {
            this.loggingSystem.error('HelpManager', 'Failed to destroy help manager', error) }
}

// シングルトンインスタンス管理
let helpManagerInstance: HelpManager | null = null,

/**
 * HelpManagerのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns HelpManagerインスタンス
 */
export function getHelpManager(gameEngine: GameEngine): HelpManager { if (!helpManagerInstance) {
        helpManagerInstance = new HelpManager(gameEngine) }
    return helpManagerInstance;
}

/**
 * HelpManagerインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいHelpManagerインスタンス
 */
export function reinitializeHelpManager(gameEngine: GameEngine): HelpManager { if (helpManagerInstance) {
        helpManagerInstance.destroy() }''
    helpManagerInstance = new HelpManager(gameEngine);

    return helpManagerInstance;}