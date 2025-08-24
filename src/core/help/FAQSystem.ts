/**
 * FAQSystem.ts
 * インタラクティブFAQシステム
 * 検索機能、カテゴリ表示、ユーザーフィードバック機能を提供
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

// 型定義
export interface GameEngine {
    helpManager?: HelpManager;
}

export interface HelpManager {
    contentLoader?: ContentLoader;
}

export interface ContentLoader {
    loadFAQData(): Promise<any>;
}

export interface FAQData {
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    difficulty: DifficultyLevel;
    popularity: number;
    helpfulCount: number;
    notHelpfulCount: number;
    lastUpdated: number;
    relatedQuestions: string[];
    searchKeywords: string[];
}

export interface CategoryData {
    id: string;
    name: string;
    description: string;
    icon: string;
    priority: number;
    faqCount?: number;
}

export interface FeedbackData {
    faqId: string;
    userId?: string;
    type: FeedbackType;
    rating?: number;
    comment?: string;
    timestamp: number;
    helpful: boolean;
}

export interface UsageStatistics {
    faqId: string;
    viewCount: number;
    searchCount: number;
    feedbackCount: number;
    averageRating: number;
    lastAccessed: number;
}

export interface SearchResult {
    results: FAQData[];
    totalCount: number;
    query: string;
    filters: string[];
    sortOrder: SortOrder;
    hasMore: boolean;
}

export interface DisplayConfig {
    itemsPerPage: number;
    expandedItems: Set<string>;
    showCategories: boolean;
    showSearchBox: boolean;
    showFeedback: boolean;
    animationDuration: number;
}

export interface SearchOptions {
    query?: string;
    categories?: string[];
    tags?: string[];
    difficulty?: DifficultyLevel;
    sortOrder?: SortOrder;
    limit?: number;
    offset?: number;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type SortOrder = 'relevance' | 'popularity' | 'recent' | 'alphabetical' | 'helpful';
export type FeedbackType = 'helpful' | 'not_helpful' | 'suggestion';

/**
 * FAQシステムクラス
 */
export class FAQSystem {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    // FAQ データ管理
    private faqDatabase: Map<string, FAQData>;
    private categories: Map<string, CategoryData>;
    private searchIndex: Map<string, Set<string>>;
    
    // ユーザーフィードバック
    private feedbackData: Map<string, FeedbackData>;
    private usageStatistics: Map<string, UsageStatistics>;
    private userPreferences: Map<string, any>;
    
    // 検索・フィルタリング
    private searchEngine: any; // 将来の拡張用
    private activeFilters: Set<string>;
    private sortOrder: SortOrder;
    
    // 表示設定
    private displayConfig: DisplayConfig;
    
    // FAQカテゴリ定義
    private defaultCategories: CategoryData[];
    
    // デフォルトFAQデータ
    private defaultFAQs: FAQData[];

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // FAQ データ管理
        this.faqDatabase = new Map<string, FAQData>();
        this.categories = new Map<string, CategoryData>();
        this.searchIndex = new Map<string, Set<string>>();
        
        // ユーザーフィードバック
        this.feedbackData = new Map<string, FeedbackData>();
        this.usageStatistics = new Map<string, UsageStatistics>();
        this.userPreferences = new Map<string, any>();
        
        // 検索・フィルタリング
        this.searchEngine = null;
        this.activeFilters = new Set<string>();
        this.sortOrder = 'relevance';
        
        // 表示設定
        this.displayConfig = {
            itemsPerPage: 10,
            expandedItems: new Set<string>(),
            showCategories: true,
            showSearchBox: true,
            showFeedback: true,
            animationDuration: 300
        };

        // FAQカテゴリ定義
        this.defaultCategories = [
            {
                id: 'gameplay',
                name: 'ゲームプレイ',
                description: 'ゲームの基本操作や遊び方について',
                icon: '🎮',
                priority: 1
            },
            {
                id: 'bubbles',
                name: '泡の種類',
                description: '特殊泡の効果や使い方について',
                icon: '🫧',
                priority: 2
            },
            {
                id: 'scoring',
                name: 'スコアシステム',
                description: 'スコアの計算方法やコンボについて',
                icon: '🏆',
                priority: 3
            },
            {
                id: 'controls',
                name: '操作方法',
                description: 'キーボードやマウスの操作について',
                icon: '⌨️',
                priority: 4
            },
            {
                id: 'settings',
                name: '設定',
                description: 'ゲーム設定やカスタマイズについて',
                icon: '⚙️',
                priority: 5
            },
            {
                id: 'troubleshooting',
                name: 'トラブルシューティング',
                description: '問題の解決方法について',
                icon: '🔧',
                priority: 6
            }
        ];

        // デフォルトFAQデータ
        this.defaultFAQs = [
            {
                id: 'gameplay-001',
                question: 'ゲームの目的は何ですか？',
                answer: 'BubblePopの目的は、色の付いた泡を割ってスコアを獲得することです。同じ色の泡を3つ以上繋げて割ると、高得点とコンボが獲得できます。',
                category: 'gameplay',
                tags: ['基本', '目的', 'スコア'],
                difficulty: 'beginner',
                popularity: 95,
                helpfulCount: 150,
                notHelpfulCount: 5,
                lastUpdated: Date.now(),
                relatedQuestions: ['gameplay-002', 'scoring-001'],
                searchKeywords: ['目的', 'ゲーム', '泡', 'スコア', '基本']
            },
            {
                id: 'gameplay-002',
                question: '泡を割る方法を教えてください',
                answer: 'マウスクリックまたはタップで泡を選択し、同じ色の泡が3つ以上隣接している場合に割ることができます。より多くの泡を一度に割ると高得点が獲得できます。',
                category: 'gameplay',
                tags: ['基本', '操作', '泡'],
                difficulty: 'beginner',
                popularity: 88,
                helpfulCount: 132,
                notHelpfulCount: 8,
                lastUpdated: Date.now(),
                relatedQuestions: ['controls-001', 'scoring-002'],
                searchKeywords: ['泡', '割る', 'クリック', 'タップ', '操作']
            },
            {
                id: 'bubbles-001',
                question: '特殊泡にはどんな種類がありますか？',
                answer: 'レインボー泡（全色対応）、ボム泡（周囲破壊）、フリーズ泡（時間停止）、コンボ泡（連鎖効果）などがあります。それぞれ特別な効果を持っています。',
                category: 'bubbles',
                tags: ['特殊泡', '種類', '効果'],
                difficulty: 'intermediate',
                popularity: 76,
                helpfulCount: 98,
                notHelpfulCount: 12,
                lastUpdated: Date.now(),
                relatedQuestions: ['bubbles-002', 'gameplay-003'],
                searchKeywords: ['特殊泡', 'レインボー', 'ボム', 'フリーズ', 'コンボ']
            }
        ];

        this.initialize();
    }

    /**
     * FAQシステムの初期化
     */
    async initialize(): Promise<void> {
        try {
            this.loggingSystem.info('FAQSystem', 'Initializing FAQ system...');
            
            // デフォルトカテゴリの登録
            this.setupDefaultCategories();
            
            // デフォルトFAQデータの登録
            this.setupDefaultFAQs();
            
            // 外部データの読み込み
            await this.loadExternalFAQData();
            
            // 検索インデックスの構築
            this.buildSearchIndex();
            
            // 統計データの初期化
            this.initializeStatistics();
            
            this.loggingSystem.info('FAQSystem', 'FAQ system initialized successfully');
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to initialize FAQ system', error);
            ErrorHandler.handle(error as Error, 'FAQSystem.initialize');
        }
    }

    /**
     * FAQ検索の実行
     * @param options - 検索オプション
     * @returns 検索結果
     */
    search(options: SearchOptions = {}): SearchResult {
        try {
            const {
                query = '',
                categories = [],
                tags = [],
                difficulty,
                sortOrder = this.sortOrder,
                limit = this.displayConfig.itemsPerPage,
                offset = 0
            } = options;

            let results = Array.from(this.faqDatabase.values());

            // テキスト検索
            if (query.trim()) {
                results = this.performTextSearch(results, query);
                this.trackSearch(query);
            }

            // カテゴリフィルタ
            if (categories.length > 0) {
                results = results.filter(faq => categories.includes(faq.category));
            }

            // タグフィルタ
            if (tags.length > 0) {
                results = results.filter(faq => 
                    tags.some(tag => faq.tags.includes(tag))
                );
            }

            // 難易度フィルタ
            if (difficulty) {
                results = results.filter(faq => faq.difficulty === difficulty);
            }

            // ソート
            results = this.sortResults(results, sortOrder);

            // ページネーション
            const totalCount = results.length;
            const paginatedResults = results.slice(offset, offset + limit);

            this.loggingSystem.debug('FAQSystem', `Search completed: ${totalCount} results`, {
                query, categories, tags, difficulty, sortOrder
            });

            return {
                results: paginatedResults,
                totalCount,
                query,
                filters: [...categories, ...tags, difficulty].filter(Boolean) as string[],
                sortOrder,
                hasMore: offset + limit < totalCount
            };
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Search failed', error);
            return {
                results: [],
                totalCount: 0,
                query: options.query || '',
                filters: [],
                sortOrder: options.sortOrder || 'relevance',
                hasMore: false
            };
        }
    }

    /**
     * FAQの詳細取得
     * @param faqId - FAQ ID
     * @returns FAQ詳細データ
     */
    getFAQById(faqId: string): FAQData | null {
        try {
            const faq = this.faqDatabase.get(faqId);
            if (faq) {
                this.trackView(faqId);
                return faq;
            }
            return null;
        } catch (error) {
            this.loggingSystem.error('FAQSystem', `Failed to get FAQ: ${faqId}`, error);
            return null;
        }
    }

    /**
     * カテゴリ一覧の取得
     * @returns カテゴリデータ配列
     */
    getCategories(): CategoryData[] {
        try {
            const categories = Array.from(this.categories.values());
            
            // FAQカウントの更新
            for (const category of categories) {
                category.faqCount = Array.from(this.faqDatabase.values())
                    .filter(faq => faq.category === category.id).length;
            }

            return categories.sort((a, b) => a.priority - b.priority);
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to get categories', error);
            return [];
        }
    }

    /**
     * フィードバックの送信
     * @param faqId - FAQ ID
     * @param feedbackType - フィードバックタイプ
     * @param userId - ユーザーID（オプション）
     * @param comment - コメント（オプション）
     * @param rating - 評価（オプション）
     */
    submitFeedback(
        faqId: string, 
        feedbackType: FeedbackType, 
        userId?: string, 
        comment?: string, 
        rating?: number
    ): boolean {
        try {
            const faq = this.faqDatabase.get(faqId);
            if (!faq) {
                throw new Error(`FAQ not found: ${faqId}`);
            }

            const feedback: FeedbackData = {
                faqId,
                userId,
                type: feedbackType,
                comment,
                rating,
                timestamp: Date.now(),
                helpful: feedbackType === 'helpful'
            };

            const feedbackId = `${faqId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.feedbackData.set(feedbackId, feedback);

            // FAQ統計の更新
            if (feedbackType === 'helpful') {
                faq.helpfulCount++;
            } else if (feedbackType === 'not_helpful') {
                faq.notHelpfulCount++;
            }

            // 使用統計の更新
            this.updateFeedbackStatistics(faqId, feedback);

            this.loggingSystem.debug('FAQSystem', `Feedback submitted for FAQ: ${faqId}`, {
                type: feedbackType, userId, rating
            });

            return true;
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to submit feedback', error);
            return false;
        }
    }

    /**
     * 人気のFAQ取得
     * @param limit - 取得件数
     * @param category - カテゴリフィルタ
     * @returns 人気FAQリスト
     */
    getPopularFAQs(limit: number = 10, category?: string): FAQData[] {
        try {
            let faqs = Array.from(this.faqDatabase.values());
            
            if (category) {
                faqs = faqs.filter(faq => faq.category === category);
            }

            return faqs
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, limit);
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to get popular FAQs', error);
            return [];
        }
    }

    /**
     * 関連FAQ取得
     * @param faqId - 基準となるFAQ ID
     * @param limit - 取得件数
     * @returns 関連FAQリスト
     */
    getRelatedFAQs(faqId: string, limit: number = 5): FAQData[] {
        try {
            const baseFAQ = this.faqDatabase.get(faqId);
            if (!baseFAQ) {
                return [];
            }

            // 明示的な関連質問
            const explicitRelated = baseFAQ.relatedQuestions
                .map(id => this.faqDatabase.get(id))
                .filter(Boolean) as FAQData[];

            if (explicitRelated.length >= limit) {
                return explicitRelated.slice(0, limit);
            }

            // 同カテゴリの関連FAQ
            const categoryRelated = Array.from(this.faqDatabase.values())
                .filter(faq => 
                    faq.id !== faqId && 
                    faq.category === baseFAQ.category &&
                    !explicitRelated.some(related => related.id === faq.id)
                )
                .sort((a, b) => b.popularity - a.popularity);

            const combined = [...explicitRelated, ...categoryRelated];
            return combined.slice(0, limit);
        } catch (error) {
            this.loggingSystem.error('FAQSystem', `Failed to get related FAQs for: ${faqId}`, error);
            return [];
        }
    }

    /**
     * FAQ統計情報の取得
     * @param faqId - FAQ ID
     * @returns 統計データ
     */
    getFAQStatistics(faqId: string): UsageStatistics | null {
        try {
            return this.usageStatistics.get(faqId) || null;
        } catch (error) {
            this.loggingSystem.error('FAQSystem', `Failed to get statistics for FAQ: ${faqId}`, error);
            return null;
        }
    }

    /**
     * FAQデータのエクスポート
     * @param format - エクスポート形式
     * @returns エクスポートされたデータ
     */
    exportFAQData(format: 'json' | 'csv' = 'json'): string {
        try {
            const data = {
                faqs: Array.from(this.faqDatabase.values()),
                categories: Array.from(this.categories.values()),
                statistics: Array.from(this.usageStatistics.values()),
                exportedAt: Date.now()
            };

            if (format === 'json') {
                return JSON.stringify(data, null, 2);
            } else {
                return this.convertToCSV(data);
            }
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to export FAQ data', error);
            throw error;
        }
    }

    /**
     * リソースの破棄
     */
    destroy(): void {
        try {
            this.faqDatabase.clear();
            this.categories.clear();
            this.searchIndex.clear();
            this.feedbackData.clear();
            this.usageStatistics.clear();
            this.userPreferences.clear();
            this.activeFilters.clear();
            this.displayConfig.expandedItems.clear();

            this.loggingSystem.info('FAQSystem', 'FAQ system destroyed');
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to destroy FAQ system', error);
        }
    }

    // プライベートメソッド

    private setupDefaultCategories(): void {
        for (const category of this.defaultCategories) {
            this.categories.set(category.id, category);
        }
    }

    private setupDefaultFAQs(): void {
        for (const faq of this.defaultFAQs) {
            this.faqDatabase.set(faq.id, faq);
        }
    }

    private async loadExternalFAQData(): Promise<void> {
        try {
            const contentLoader = this.gameEngine.helpManager?.contentLoader;
            if (contentLoader) {
                const externalData = await contentLoader.loadFAQData();
                if (externalData && externalData.faqs) {
                    for (const faq of externalData.faqs) {
                        this.faqDatabase.set(faq.id, faq);
                    }
                }
            }
        } catch (error) {
            this.loggingSystem.warn('FAQSystem', 'Failed to load external FAQ data', error);
            // 外部データが読み込めなくてもデフォルトデータで動作
        }
    }

    private buildSearchIndex(): void {
        for (const faq of this.faqDatabase.values()) {
            const keywords = [
                ...faq.searchKeywords,
                ...faq.tags,
                faq.question,
                faq.answer,
                faq.category
            ].join(' ').toLowerCase();

            const words = keywords.split(/\s+/)
                .filter(word => word.length > 1)
                .filter(word => !this.isStopWord(word));

            for (const word of words) {
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, new Set());
                }
                this.searchIndex.get(word)!.add(faq.id);
            }
        }
    }

    private performTextSearch(faqs: FAQData[], query: string): FAQData[] {
        const queryWords = query.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 1)
            .filter(word => !this.isStopWord(word));

        if (queryWords.length === 0) {
            return faqs;
        }

        const matchingIds = new Set<string>();
        
        for (const word of queryWords) {
            const wordMatches = this.searchIndex.get(word);
            if (wordMatches) {
                for (const id of wordMatches) {
                    matchingIds.add(id);
                }
            }
        }

        return faqs.filter(faq => matchingIds.has(faq.id));
    }

    private sortResults(results: FAQData[], sortOrder: SortOrder): FAQData[] {
        switch (sortOrder) {
            case 'popularity':
                return results.sort((a, b) => b.popularity - a.popularity);
            case 'recent':
                return results.sort((a, b) => b.lastUpdated - a.lastUpdated);
            case 'alphabetical':
                return results.sort((a, b) => a.question.localeCompare(b.question));
            case 'helpful':
                return results.sort((a, b) => {
                    const aRatio = a.helpfulCount / (a.helpfulCount + a.notHelpfulCount) || 0;
                    const bRatio = b.helpfulCount / (b.helpfulCount + b.notHelpfulCount) || 0;
                    return bRatio - aRatio;
                });
            case 'relevance':
            default:
                return results; // すでに関連性順でソート済み
        }
    }

    private trackView(faqId: string): void {
        const stats = this.usageStatistics.get(faqId) || {
            faqId,
            viewCount: 0,
            searchCount: 0,
            feedbackCount: 0,
            averageRating: 0,
            lastAccessed: 0
        };

        stats.viewCount++;
        stats.lastAccessed = Date.now();
        this.usageStatistics.set(faqId, stats);
    }

    private trackSearch(query: string): void {
        // 検索クエリの統計追跡（実装は省略）
    }

    private updateFeedbackStatistics(faqId: string, feedback: FeedbackData): void {
        const stats = this.usageStatistics.get(faqId) || {
            faqId,
            viewCount: 0,
            searchCount: 0,
            feedbackCount: 0,
            averageRating: 0,
            lastAccessed: 0
        };

        stats.feedbackCount++;
        if (feedback.rating) {
            const totalRating = stats.averageRating * (stats.feedbackCount - 1) + feedback.rating;
            stats.averageRating = totalRating / stats.feedbackCount;
        }

        this.usageStatistics.set(faqId, stats);
    }

    private initializeStatistics(): void {
        for (const faq of this.faqDatabase.values()) {
            if (!this.usageStatistics.has(faq.id)) {
                this.usageStatistics.set(faq.id, {
                    faqId: faq.id,
                    viewCount: 0,
                    searchCount: 0,
                    feedbackCount: 0,
                    averageRating: 0,
                    lastAccessed: 0
                });
            }
        }
    }

    private isStopWord(word: string): boolean {
        const stopWords = [
            // 日本語ストップワード
            'の', 'に', 'は', 'を', 'が', 'で', 'と', 'から', 'まで', 'より', 'こと', 'もの',
            // 英語ストップワード
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
        ];
        return stopWords.includes(word);
    }

    private convertToCSV(data: any): string {
        // 簡易CSV変換（実装は省略）
        return 'CSV conversion not implemented';
    }
}

// シングルトンインスタンス管理
let faqSystemInstance: FAQSystem | null = null;

/**
 * FAQSystemのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns FAQSystemインスタンス
 */
export function getFAQSystem(gameEngine: GameEngine): FAQSystem {
    if (!faqSystemInstance) {
        faqSystemInstance = new FAQSystem(gameEngine);
    }
    return faqSystemInstance;
}

/**
 * FAQSystemインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいFAQSystemインスタンス
 */
export function reinitializeFAQSystem(gameEngine: GameEngine): FAQSystem {
    if (faqSystemInstance) {
        faqSystemInstance.destroy();
    }
    faqSystemInstance = new FAQSystem(gameEngine);
    return faqSystemInstance;
}

export default FAQSystem;