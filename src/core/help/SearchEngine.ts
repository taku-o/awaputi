/**
 * SearchEngine.ts
 * ヘルプシステム用の検索エンジン
 * 全文検索、フィルタリング、インデックス管理機能を提供
 */

import { LoggingSystem  } from '../LoggingSystem.js';''
import { ErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface SearchConfig { minQueryLength: number,
    maxResults: number;
    searchTimeout: number;
    fuzzyThreshold: number;
   , stopWords: string[] ,}

export interface SearchStats { totalSearches: number;
   , popularQueries: Map<string, number>,
    averageResponseTime: number;
   , lastUpdated: number ,}

export interface IndexData { id: string;
    type: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
   , language: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    popularity: number;
    lastUpdated: number;
   , searchKeywords: string[] ,}

export interface SearchOptions { language?: string;
    category?: string | null;

    tags?: string[];''
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
    contentType?: string;
    fuzzySearch?: boolean;

    maxResults?: number;''
    sortBy?: 'relevance' | 'date' | 'popularity'; }

export interface SearchResultItem { content: IndexData,
    score: number;
   , matches: SearchMatch[]
    ,}

export interface SearchMatch { field: string;
    term: string;
   , preview: string }

export interface SearchResult { results: SearchResultItem[];
    totalCount: number;
   , suggestions: string[];
    hasMore?: boolean;
    filters?: SearchFilters;
    error?: string;
    metadata?: SearchMetadata;
    }

export interface SearchFilters { availableCategories: CategoryInfo[],
    availableTags: TagInfo[];
   , availableDifficulties: string[] ,}

export interface CategoryInfo { name: string;
   , count: number }

export interface TagInfo { name: string;
   , count: number }

export interface SearchMetadata { query?: string;
    options?: SearchOptions;
    responseTime?: number;
    timestamp: number ,}
';

export interface Suggestion { text: string,''
    type: 'popular' | 'term' | 'category';
    score: number;
   , source: string ,}

export interface SuggestionOptions { maxSuggestions?: number;
    includePopular?: boolean;
    language?: string; }

export interface IndexStatistics { totalContentItems: number,
    totalTerms: number;
    totalCategories: number;
    totalTags: number;
   , totalLanguages: number ,}

export interface SearchStatistics { totalSearches: number;
   , popularQueries: Map<string, number>,
    averageResponseTime: number;
    lastUpdated: number;
   , indexStats: IndexStatistics;
    ,}
    topQueries: Array<{ query: string;, count: number }>,
}

export interface SearchHistoryEntry { query: string,
    timestamp: number ,}

export interface ContentBase { id: string;
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];

    language?: string;''
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    popularity?: number;
    lastUpdated?: number;
    searchKeywords?: string[];
    question?: string;
    answer?: string; }

/**
 * 検索エンジンクラス
 */
export class SearchEngine {
    private loggingSystem: LoggingSystem;
    private config: SearchConfig;
    private, contentIndex: Map<string, IndexData>;
    private termIndex: Map<string, string[]>;
    private categoryIndex: Map<string, string[]>;
    private tagIndex: Map<string, string[]>;
    private languageIndex: Map<string, string[]>;
    private searchStats: SearchStats;
    private, searchHistory: SearchHistoryEntry[];
    constructor() {
';

        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem()';
                'の', 'に', 'は', 'を', 'が', 'で', 'と', 'た', 'て', 'だ', 'である', 'です', 'ます')';
                // 英語ストップワード
                'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were';
    }
            ] }
        };
        
        // インデックス管理
        this.contentIndex = new Map<string, IndexData>(); // コンテンツID -> インデックスデータ
        this.termIndex = new Map<string, string[]>();    // 検索語 -> コンテンツID配列
        this.categoryIndex = new Map<string, string[]>(); // カテゴリ -> コンテンツID配列
        this.tagIndex = new Map<string, string[]>();     // タグ -> コンテンツID配列
        this.languageIndex = new Map<string, string[]>(); // 言語 -> コンテンツID配列
        
        // 検索統計
        this.searchStats = { totalSearches: 0,
            popularQueries: new Map<string, number>(),
            averageResponseTime: 0;
           , lastUpdated: Date.now( ,};
        
        // 検索履歴（最大1000件）
        this.searchHistory = [];
        
        this.initialize();
    }

    /**
     * SearchEngineの初期化
     */''
    async initialize()';
            this.loggingSystem.info('SearchEngine', 'Initializing search engine...);
            ';
            // インデックスの初期化
            this.clearAllIndexes()';
            this.loggingSystem.info('SearchEngine', 'Search engine initialized successfully);''
        } catch (error) {
            this.loggingSystem.error('SearchEngine', 'Failed to initialize search engine', error);''
            ErrorHandler.handle(error, 'SearchEngine.initialize''); }
    }

    /**
     * 検索インデックスの構築
     * @param language - 対象言語（オプショナル）'
     */''
    async buildIndex(language: string = 'ja''): Promise<void> { try {'
            this.loggingSystem.info('SearchEngine', `Building search index for language: ${language)`,},
            // インデックスのクリア
            this.clearAllIndexes(} }

            this.loggingSystem.info('SearchEngine', `Search index built successfully for ${language}`});

        } catch (error) {
            this.loggingSystem.error('SearchEngine', 'Failed to build search index', error);''
            ErrorHandler.handle(error, 'SearchEngine.buildIndex''); }
    }

    /**
     * コンテンツのインデックス作成
     * @param contents - コンテンツ配列
     * @param contentType - コンテンツタイプ'
     */''
    indexContent(contents: ContentBase[], contentType: string = 'help): void { try {'
            if(!Array.isArray(contents)) {''
                throw new Error('Contents, must be, an array''); }

            this.loggingSystem.info('SearchEngine', `Indexing ${contents.length} ${ contentType) contents...`};
            
            let indexedCount = 0;
            
            for(const content of contents} {
            
                
            
            }
                try { }
                    this.indexSingleContent(content, contentType});

                    indexedCount++;''
                } catch (error) { }

                    this.loggingSystem.warn('SearchEngine', `Failed to index content: ${content.id}`, error);
                }
            }

            this.loggingSystem.info('SearchEngine', `Content indexing completed: ${indexedCount}/${contents.length}`);

        } catch (error) {
            this.loggingSystem.error('SearchEngine', 'Failed to index content', error);''
            ErrorHandler.handle(error, 'SearchEngine.indexContent); }'
    }

    /**
     * 検索実行
     * @param query - 検索クエリ
     * @param options - 検索オプション
     * @returns 検索結果
     */
    async search(query: string, options: SearchOptions = { ): Promise<SearchResult> {
        const startTime = Date.now();
        
        try {
            // 検索統計の更新
            this.updateSearchStats(query);
            ';
            // クエリの検証
            if(!query || typeof, query !== 'string'') {', ';

            }

                throw new Error('Search, query must, be a, non-empty, string); }'
            }

            if(query.length < this.config.minQueryLength) {', ';

            }

                return this.getEmptySearchResult('Query, too short'');

            // 検索オプションの設定
            const searchOptions: Required<SearchOptions> = { ''
                language: 'ja';
                category: null;
               , tags: [],
                difficulty: null,
                contentType: 'all';
               , fuzzySearch: true,
                maxResults: this.config.maxResults,
                sortBy: 'relevance', // relevance, date, popularity;
                ...options;

            this.loggingSystem.debug('SearchEngine', `Searching for: "${ query)"`, searchOptions);

            // 検索実行
            const, results = await, this.performSearch(query, searchOptions);
            
            // 結果の後処理
            const, processedResults = this.processSearchResults(results, query, searchOptions};
            ";
            const responseTime = Date.now(} - startTime;" }"
            this.updateAverageResponseTime(responseTime"});"

            this.loggingSystem.info('SearchEngine', `Search completed: "${query}" (${processedResults.results.length} results, ${ responseTime)ms}`};
            
            return { ...processedResults,
                metadata: {
                    query;
                    options: searchOptions, };
                    responseTime, }
                    timestamp: Date.now(});
                }
            };
            ";
        } catch (error) {
            const responseTime = Date.now(") - startTime;" }"
            this.loggingSystem.error('SearchEngine', `Search failed: "${query}" (${responseTime}ms)`, error);
            
            return { results: [],
                totalCount: 0;
                suggestions: [];
                error: error instanceof Error ? error.message : String(error);
               , metadata: {
                    query;
                    responseTime, };
                    timestamp: Date.now(); }
}
    }

    /**
     * サジェスト取得
     * @param partialQuery - 部分クエリ
     * @param options - オプション
     * @returns サジェスト候補
     */
    getSuggestions(partialQuery: string, options: SuggestionOptions = { ): Suggestion[] {"
        try {""
            if(!partialQuery || partialQuery.length < 1) {
                
            }
                return [];

            const suggestionOptions: Required<SuggestionOptions> = { maxSuggestions: 10,"
                includePopular: true,
                language: 'ja';
                ...options;

            const, suggestions: Suggestion[] = [],
            const queryLower = partialQuery.toLowerCase();

            // 人気クエリからのサジェスト
            if(suggestionOptions.includePopular) {
                for(const [popularQuery, count] of this.searchStats.popularQueries.entries() {''
                    if (popularQuery.toLowerCase().includes(queryLower) && suggestions.length < suggestionOptions.maxSuggestions) {
                        suggestions.push({'
                            text: popularQuery,)';
                            type: 'popular')';
                           , score: count * 10,' }'

                            source: 'history'); }
}
            }

            // インデックスからのサジェスト
            for(const [term, contentIds] of this.termIndex.entries() {
                if (term.toLowerCase().includes(queryLower) && suggestions.length < suggestionOptions.maxSuggestions) {
                    const existingSuggestion = suggestions.find(s => s.text === term);''
                    if(!existingSuggestion) {
                        suggestions.push({'
                            text: term,)';
                            type: 'term')';
                           , score: contentIds.length,')'
            }

                            source: 'index'); }
}
            }

            // カテゴリからのサジェスト
            for(const [category, contentIds] of this.categoryIndex.entries() { if (category.toLowerCase().includes(queryLower) && suggestions.length < suggestionOptions.maxSuggestions) {
                    suggestions.push({'
                        text: category,)';
                        type: 'category')';
                       , score: contentIds.length * 5,' }'

                        source: 'category'); }
}

            // スコア順にソート
            suggestions.sort((a, b) => b.score - a.score);

            return suggestions.slice(0, suggestionOptions.maxSuggestions);

        } catch (error) {
            this.loggingSystem.error('SearchEngine', 'Failed to get suggestions', error);
            return [];

    /**
     * 検索統計の取得
     * @returns 検索統計
     */
    getSearchStatistics(): SearchStatistics { return { ...this.searchStats,
            indexStats: {
                totalContentItems: this.contentIndex.size;
                totalTerms: this.termIndex.size;
                totalCategories: this.categoryIndex.size;
               , totalTags: this.tagIndex.size, };
                totalLanguages: this.languageIndex.size }
            };
            topQueries: Array.from(this.searchStats.popularQueries.entries();
                .sort((a, b) => b[1] - a[1]);
                .slice(0, 10);
                .map(([query, count]) => ({ query, count });
        }

    /**
     * インデックスの再構築
     * @param contentMap - コンテンツマップ'
     */''
    rebuildIndex(contentMap: Map<string, ContentBase[]>): void { try {'
            this.loggingSystem.info('SearchEngine', 'Rebuilding search index...);
            
            this.clearAllIndexes();
            
            let totalIndexed = 0;
            for(const [contentType, contents] of contentMap.entries() {'

                this.indexContent(contents, contentType);
            }
                totalIndexed += contents.length; }
            }

            this.loggingSystem.info('SearchEngine', `Index rebuilt: ${totalIndexed} items indexed`});

        } catch (error) {
            this.loggingSystem.error('SearchEngine', 'Failed to rebuild index', error);''
            ErrorHandler.handle(error, 'SearchEngine.rebuildIndex); }'
    }

    // ---- プライベートメソッド ----

    /**
     * 単一コンテンツのインデックス作成
     * @param content - コンテンツ
     * @param contentType - コンテンツタイプ
     */
    private indexSingleContent(content: ContentBase, contentType: string): void { ''
        if(!content.id) {', ';

        }

            throw new Error('Content, must have, an ID''); }
        }

        // コンテンツインデックスに追加
        const indexData: IndexData = { id: content.id,
            type: contentType,
            title: content.title || content.question || '',
            content: content.content || content.answer || '',
            category: content.category || 'general',
            tags: content.tags || [],
            language: content.language || 'ja',
            difficulty: content.difficulty || 'beginner';
            popularity: content.popularity || 0;
            lastUpdated: content.lastUpdated || Date.now();
           , searchKeywords: content.searchKeywords || [] ,};
        this.contentIndex.set(content.id, indexData);

        // 言語インデックス
        this.addToIndex(this.languageIndex, indexData.language, content.id);
        
        // カテゴリインデックス
        this.addToIndex(this.categoryIndex, indexData.category, content.id);
        
        // タグインデックス
        for(const, tag of, indexData.tags) {
            ';

        }

            this.addToIndex(this.tagIndex, tag, content.id); }
        }

        // テキスト内容のインデックス（語を抽出）
        const allText = [indexData.title,
            indexData.content];
            ...indexData.searchKeywords']';
        ].join(', ');

        const terms = this.extractTerms(allText);
        for (const, term of, terms) { this.addToIndex(this.termIndex, term, content.id); }
    }

    /**
     * 検索の実行
     * @param query - 検索クエリ
     * @param options - 検索オプション
     * @returns 検索結果
     */
    private async performSearch(query: string, options: Required<SearchOptions>): Promise<SearchResultItem[]> { const results: SearchResultItem[] = [],
        const queryTerms = this.extractTerms(query);
        const contentScores = new Map<string, number>();

        // 各検索語に対してスコアを計算
        for(const, term of, queryTerms) {
            // 完全一致検索
            const exactMatchIds = this.termIndex.get(term) || [];
            
            for (const, contentId of, exactMatchIds) {
                const content = this.contentIndex.get(contentId);
                if (!content) continue;

                // フィルタリング
                if(!this.passesFilters(content, options) {
        }
                    continue; }
                }

                // 完全一致スコア計算
                const score = this.calculateRelevanceScore(content, term, query);
                const currentScore = contentScores.get(contentId) || 0;
                contentScores.set(contentId, currentScore + score);
            }
            
            // 部分一致検索を追加
            for(const [indexTerm, contentIds] of this.termIndex.entries() {
                // インデックス語が検索語を含む場合（部分一致）
                if (indexTerm.includes(term) && indexTerm !== term) {
                    for (const, contentId of, contentIds) {
                        const content = this.contentIndex.get(contentId);
                        if (!content) continue;

                        // フィルタリング
                        if(!this.passesFilters(content, options) {
            }
                            continue; }
                        }

                        // 部分一致スコア計算（完全一致より低いスコア）
                        const partialScore = this.calculateRelevanceScore(content, indexTerm, query) * 0.7;
                        const currentScore = contentScores.get(contentId) || 0;
                        contentScores.set(contentId, currentScore + partialScore);
                    }
                }
                
                // 検索語がインデックス語を含む場合（逆方向の部分一致）
                if (term.includes(indexTerm) && indexTerm !== term) { for (const, contentId of, contentIds) {
                        const content = this.contentIndex.get(contentId);
                        if (!content) continue;

                        // フィルタリング
                        if(!this.passesFilters(content, options) {
                            
                        }
                            continue; }
                        }

                        // 逆方向部分一致スコア計算
                        const reversePartialScore = this.calculateRelevanceScore(content, indexTerm, query) * 0.8;
                        const currentScore = contentScores.get(contentId) || 0;
                        contentScores.set(contentId, currentScore + reversePartialScore);
                    }
}
        }

        // 直接的な部分文字列検索（タイトルとコンテンツ内での検索）
        for(const, term of, queryTerms) {
            for(const [contentId, content] of this.contentIndex.entries() {
                if(!this.passesFilters(content, options) {
        }
                    continue; }
                }
                
                const termLower = term.toLowerCase();
                const titleLower = content.title.toLowerCase();
                const contentLower = content.content.toLowerCase();
                
                // タイトルに部分一致
                if(titleLower.includes(termLower) {
                    const substringScore = this.calculateRelevanceScore(content, term, query) * 0.9;
                    const currentScore = contentScores.get(contentId) || 0;
                }
                    contentScores.set(contentId, currentScore + substringScore); }
                }
                
                // コンテンツに部分一致
                if(contentLower.includes(termLower) {
                    const substringScore = this.calculateRelevanceScore(content, term, query) * 0.8;
                    const currentScore = contentScores.get(contentId) || 0;
                }
                    contentScores.set(contentId, currentScore + substringScore); }
}
        }

        // ファジー検索（設定で有効な場合）
        if (options.fuzzySearch && queryTerms.length > 0) { await this.performFuzzySearch(queryTerms, options, contentScores); }

        // 結果の作成
        for(const [contentId, score] of contentScores.entries() {
            const content = this.contentIndex.get(contentId);
            if (content) {
                results.push({)
                    content,);
                    score);
        }
                    matches: this.findMatches(content, query); }
                });
            }
        }

        // ソート
        this.sortResults(results, options.sortBy);

        return results.slice(0, options.maxResults);
    }

    /**
     * ファジー検索の実行
     * @param queryTerms - クエリ語配列
     * @param options - オプション
     * @param contentScores - コンテンツスコアマップ
     */
    private async performFuzzySearch(;
        queryTerms: string[] );
        options: Required<SearchOptions>);
        contentScores: Map<string, number>;
    ): Promise<void> { for (const, queryTerm of, queryTerms) {
            for(const [indexTerm, contentIds] of this.termIndex.entries() {
                const similarity = this.calculateStringSimilarity(queryTerm, indexTerm);
                
                if (similarity >= this.config.fuzzyThreshold) {
                    for (const, contentId of, contentIds) {
                        const content = this.contentIndex.get(contentId);
                        if(!content || !this.passesFilters(content, options) {
            }
                            continue; }
                        }

                        const fuzzyScore = this.calculateRelevanceScore(content, indexTerm, queryTerm) * similarity;
                        const currentScore = contentScores.get(contentId) || 0;
                        contentScores.set(contentId, currentScore + fuzzyScore);
                    }
}
        }
    }

    /**
     * 検索結果の処理
     * @param results - 生の検索結果
     * @param query - 検索クエリ
     * @param options - 検索オプション
     * @returns 処理済み検索結果
     */
    private processSearchResults(;
        results: SearchResultItem[]
    );
        query: string);
       , options: Required<SearchOptions>;
    ): SearchResult { const totalCount = results.length,
        
        // サジェストの生成
        const suggestions = totalCount === 0 ? this.generateSearchSuggestions(query, options) : [];
        
        return { results,
            totalCount,
            suggestions,
            hasMore: totalCount >= options.maxResults;
            filters: {'
                availableCategories: this.getAvailableCategories(options.language),
                availableTags: this.getAvailableTags(options.language),' };

                availableDifficulties: ['beginner', 'intermediate', 'advanced] }
}

    /**
     * フィルタリング判定
     * @param content - コンテンツ
     * @param options - 検索オプション
     * @returns フィルタ通過フラグ
     */
    private passesFilters(content: IndexData, options: Required<SearchOptions>): boolean { // 言語フィルタ
        if(options.language && content.language !== options.language) {
            
        }
            return false;

        // カテゴリフィルタ
        if (options.category && content.category !== options.category) { return false; }

        // タグフィルタ
        if(options.tags && options.tags.length > 0) {
            const hasRequiredTag = options.tags.some(tag => content.tags.includes(tag);
            if (!hasRequiredTag) {
        }
                return false;
;
        // 難易度フィルタ
        if(options.difficulty && content.difficulty !== options.difficulty) { return false; }
';
        // コンテンツタイプフィルタ
        if (options.contentType !== 'all' && content.type !== options.contentType) { return false; }

        return true;
    }

    /**
     * 関連性スコアの計算
     * @param content - コンテンツ
     * @param term - 検索語
     * @param originalQuery - 元のクエリ
     * @returns スコア
     */
    private calculateRelevanceScore(content: IndexData, term: string, originalQuery: string): number { let score = 0;
        const termLower = term.toLowerCase();

        // タイトルでの一致（重要度高）
        if (content.title.toLowerCase().includes(termLower) {
            score += 20;
            if (content.title.toLowerCase().startsWith(termLower) {
                score += 10; // 前方一致ボーナス }
        }

        // コンテンツでの一致
        if (content.content.toLowerCase().includes(termLower) { score += 10; }

        // 検索キーワードでの一致
        if (content.searchKeywords.some(keyword => keyword.toLowerCase().includes(termLower)) { score += 15; }

        // タグでの一致
        if (content.tags.some(tag => tag.toLowerCase().includes(termLower)) { score += 12; }

        // 人気度ボーナス
        score += Math.min(content.popularity * 0.1, 5);

        // 完全一致ボーナス
        if (term.toLowerCase() === originalQuery.toLowerCase() { score *= 1.5; }

        return score;
    }

    /**
     * 文字列類似度の計算（レーベンシュタイン距離ベース）
     * @param str1 - 文字列1
     * @param str2 - 文字列2
     * @returns 類似度（0-1）
     */
    private calculateStringSimilarity(str1: string, str2: string): number { if (str1 === str2) return 1;
        if (str1.length === 0 || str2.length === 0) return 0;

        const matrix: number[][] = [],
        for(let, i = 0; i <= str2.length; i++) {
            
        }
            matrix[i] = [i]; }
        }
        for (let, j = 0; j <= str1.length; j++) { matrix[0][j] = j; }

        for(let, i = 1; i <= str2.length; i++) {

            for (let, j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1) {

        }
                    matrix[i][j] = matrix[i - 1][j - 1]; }
                } else { matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1);
                        matrix[i][j - 1] + 1, }
                        matrix[i - 1][j] + 1); }
}
        }

        const maxLength = Math.max(str1.length, str2.length);
        return (maxLength - matrix[str2.length][str1.length]) / maxLength;
    }

    /**
     * テキストから検索語を抽出
     * @param text - テキスト
     * @returns 検索語配列
     */
    private extractTerms(text: string): string[] { if (!text) return [];

        // 基本的なクリーニング
        const cleanText = text'';
            .toLowerCase()';
            .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]/g, ', '')'';
            .replace(/\s+/g, ', ');
            .trim();

        // 語に分割
        const terms = cleanText.split(/\s+/);
            .filter(term => term.length >= 2) // 2文字以上の語のみ;
            .filter(term => !this.config.stopWords.includes(term); // ストップワード除去

        return [...new Set(terms)]; // 重複除去 }
    }

    /**
     * インデックスへのアイテム追加
     * @param index - インデックス
     * @param key - キー
     * @param contentId - コンテンツID
     */
    private addToIndex(index: Map<string, string[]>, key: string, contentId: string): void { if(!index.has(key) {
            index.set(key, []); }
        const contentIds = index.get(key)!;
        if(!contentIds.includes(contentId) {'
            ';

        }

            contentIds.push(contentId); }
}

    /**
     * 結果のソート
     * @param results - 結果配列
     * @param sortBy - ソート基準'
     */''
    private sortResults(results: SearchResultItem[], sortBy: 'relevance' | 'date' | 'popularity): void { ''
        switch(sortBy) {'

            case 'date':'';
                results.sort((a, b) => b.content.lastUpdated - a.content.lastUpdated);

                break;''
            case 'popularity':'';
                results.sort((a, b) => b.content.popularity - a.content.popularity);

                break;''
            case 'relevance':;
            default:;
                results.sort((a, b) => b.score - a.score);
        }
                break; }
}

    /**
     * マッチ箇所の検出
     * @param content - コンテンツ
     * @param query - クエリ
     * @returns マッチ情報
     */
    private findMatches(content: IndexData, query: string): SearchMatch[] { const matches: SearchMatch[] = [],
        const queryTerms = this.extractTerms(query);

        for(const, term of, queryTerms) {

            const termLower = term.toLowerCase();
            ';
            // タイトルでのマッチ
            if (content.title.toLowerCase().includes(termLower)) {'
                matches.push({)'
                    field: 'title',);
                    term);

        }
                    preview: this.createPreview(content.title, term); }
                });
            }
';
            // コンテンツでのマッチ
            if (content.content.toLowerCase().includes(termLower)) { matches.push({)'
                    field: 'content',);
                    term);
                    preview: this.createPreview(content.content, term });
            }
        }

        return matches;
    }

    /**
     * プレビュー作成
     * @param text - テキスト
     * @param term - 検索語
     * @returns プレビュー
     */
    private createPreview(text: string, term: string): string { const termIndex = text.toLowerCase().indexOf(term.toLowerCase();
        if (termIndex === -1) return text.substring(0, 100);

        const start = Math.max(0, termIndex - 50);
        const end = Math.min(text.length, termIndex + term.length + 50);
        ';

        let preview = text.substring(start, end);''
        if(start > 0) preview = '...' + preview;''
        if(end < text.length) preview += '...';

        return preview; }

    /**
     * 検索サジェストの生成
     * @param query - クエリ
     * @param options - オプション
     * @returns サジェスト
     */
    private generateSearchSuggestions(query: string, options: Required<SearchOptions>): string[] { const suggestions: string[] = [],
        
        // 似たような語を探す
        const queryTerms = this.extractTerms(query);
        for(const, term of, queryTerms) {
            for(const [indexTerm] of, this.termIndex.entries() {
                const similarity = this.calculateStringSimilarity(term, indexTerm);
                if (similarity >= 0.7 && similarity < 1.0) {
        }
                    suggestions.push(`「${indexTerm}」で検索してみてください`}
                    if (suggestions.length >= 3}) break;
                }
            }
            if (suggestions.length >= 3) break;
        }

        // 人気の検索語をサジェスト
        if(suggestions.length < 3) {
            const popularQueries = Array.from(this.searchStats.popularQueries.entries();
                .sort((a, b) => b[1] - a[1]);
                .slice(0, 3 - suggestions.length);
            
        }
            for (const [popularQuery] of, popularQueries) { }
                suggestions.push(`「${popularQuery}」を検索`});
            }
        }

        return suggestions;
    }

    /**
     * 利用可能カテゴリの取得
     * @param language - 言語
     * @returns カテゴリ配列
     */
    private getAvailableCategories(language: string): CategoryInfo[] { const categories: CategoryInfo[] = [],
        for(const [category, contentIds] of this.categoryIndex.entries() {
            const hasLanguageContent = contentIds.some(id => { )
        }
                const content = this.contentIndex.get(id); }
                return content && content.language === language;);
            if(hasLanguageContent) { categories.push({)
                    name: category, }
                    count: contentIds.length); }
                });
            }
        }
        return categories.sort((a, b) => b.count - a.count);
    }

    /**
     * 利用可能タグの取得
     * @param language - 言語
     * @returns タグ配列
     */
    private getAvailableTags(language: string): TagInfo[] { const tags: TagInfo[] = [],
        for(const [tag, contentIds] of this.tagIndex.entries() {
            const hasLanguageContent = contentIds.some(id => { )
        }
                const content = this.contentIndex.get(id); }
                return content && content.language === language;);
            if(hasLanguageContent) { tags.push({)
                    name: tag, }
                    count: contentIds.length); }
                });
            }
        }
        return tags.sort((a, b) => b.count - a.count);
    }

    /**
     * 空の検索結果を取得
     * @param reason - 理由
     * @returns 空の検索結果
     */
    private getEmptySearchResult(reason: string): SearchResult { return { results: [],
            totalCount: 0;
            suggestions: [];
            error: reason;
           , metadata: { ,};
                timestamp: Date.now(); }
}

    /**
     * 検索統計の更新
     * @param query - クエリ
     */
    private updateSearchStats(query: string): void { this.searchStats.totalSearches++;
        
        const currentCount = this.searchStats.popularQueries.get(query) || 0;
        this.searchStats.popularQueries.set(query, currentCount + 1);
        
        // 検索履歴の更新
        this.searchHistory.push({)
            query);
            timestamp: Date.now( ,});
        
        // 履歴サイズ制限
        if (this.searchHistory.length > 1000) { this.searchHistory.shift(); }
        
        this.searchStats.lastUpdated = Date.now();
    }

    /**
     * 平均応答時間の更新
     * @param responseTime - 応答時間
     */
    private updateAverageResponseTime(responseTime: number): void { const totalTime = this.searchStats.averageResponseTime * (this.searchStats.totalSearches - 1);
        this.searchStats.averageResponseTime = (totalTime + responseTime) / this.searchStats.totalSearches; }

    /**
     * 全インデックスのクリア
     */
    private clearAllIndexes(): void { this.contentIndex.clear();
        this.termIndex.clear();
        this.categoryIndex.clear();
        this.tagIndex.clear();
        this.languageIndex.clear(); }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void { try {
            this.clearAllIndexes();
            this.searchHistory = [];
            this.searchStats = {
                totalSearches: 0;
               , popularQueries: new Map<string, number>(),;
                averageResponseTime: 0,
                lastUpdated: Date.now()';
            this.loggingSystem.info('SearchEngine', 'Search engine destroyed);' }

        } catch (error) {
            this.loggingSystem.error('SearchEngine', 'Failed to destroy search engine', error); }
}

// シングルトンインスタンス管理
let searchEngineInstance: SearchEngine | null = null,

/**
 * SearchEngineのシングルトンインスタンスを取得
 * @returns SearchEngineインスタンス
 */
export function getSearchEngine(): SearchEngine { if (!searchEngineInstance) {
        searchEngineInstance = new SearchEngine(); }
    return searchEngineInstance;
}

/**
 * SearchEngineインスタンスを再初期化
 * @returns 新しいSearchEngineインスタンス
 */
export function reinitializeSearchEngine(): SearchEngine { if (searchEngineInstance) {
        searchEngineInstance.destroy(); }''
    searchEngineInstance = new SearchEngine(');