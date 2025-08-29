/**
 * 高性能検索エンジン
 * インデックス作成、全文検索、結果ランキング機能付き
 */

export class SearchEngine {
    constructor() {
        // 検索インデックス
        this.textIndex = new Map(); // 単語 -> [documentId, ...]
        this.documentStore = new Map(); // documentId -> document
        this.fieldWeights = {
            title: 3.0,
            content: 1.0,
            searchKeywords: 2.0,
            category: 1.5
        };
        
        // パフォーマンス最適化
        this.searchCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分
        this.maxCacheSize = 100;
        
        // 検索統計
        this.searchStats = {
            totalSearches: 0,
            cacheHits: 0,
            averageSearchTime: 0,
            popularQueries: new Map()
        };
        
        // ストップワード（検索対象外の単語）
        this.stopWords = new Set([
            'の', 'に', 'は', 'を', 'が', 'で', 'と', 'て', 'も', 'から',
            'まで', 'より', 'で', 'ある', 'です', 'だ', 'である',
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
            'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
            'that', 'the', 'to', 'was', 'were', 'will', 'with'
        ]);
        
        // 類義語辞書
        this.synonyms = new Map([
            ['bubble', ['泡', 'バブル', 'ふうせん']],
            ['click', ['クリック', 'タップ', '選択']],
            ['score', ['スコア', '得点', 'ポイント']],
            ['game', ['ゲーム', 'プレイ', '遊び']],
            ['help', ['ヘルプ', 'サポート', '支援', '助け']]
        ]);
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        // 検索履歴の復元（ローカルストレージから）
        this.loadSearchHistory();
        
        // 定期的なキャッシュクリーンアップ
        setInterval(() => this.cleanupCache(), 60000); // 1分ごと
    }
    
    /**
     * コンテンツのインデックス作成
     * @param {Array} contentArray - インデックス対象コンテンツ配列
     */
    indexContent(contentArray) {
        const startTime = performance.now();
        
        for (const content of contentArray) {
            this.indexDocument(content);
        }
        
        const indexTime = performance.now() - startTime;
        console.log(`Indexed ${contentArray.length} documents in ${indexTime.toFixed(2)}ms`);
        
        // インデックス完了後にキャッシュをクリア（古い検索結果が無効になるため）
        this.searchCache.clear();
    }
    
    /**
     * 単一ドキュメントのインデックス作成
     * @param {Object} document - ドキュメント
     */
    indexDocument(document) {
        if (!document.id) {
            console.warn('Document without ID cannot be indexed');
            return;
        }
        
        // ドキュメントを保存
        this.documentStore.set(document.id, document);
        
        // 各フィールドを解析してインデックス作成
        for (const [field, weight] of Object.entries(this.fieldWeights)) {
            const text = document[field];
            if (text) {
                const tokens = this.tokenize(text);
                for (const token of tokens) {
                    this.addToIndex(token, document.id, field, weight);
                }
            }
        }
    }
    
    /**
     * 検索実行
     * @param {string} query - 検索クエリ
     * @param {Object} options - 検索オプション
     * @returns {Promise<Array>} - 検索結果
     */
    async search(query, options = {}) {
        const startTime = performance.now();
        
        if (!query || query.trim().length === 0) {
            return [];
        }
        
        const normalizedQuery = query.toLowerCase().trim();
        
        // キャッシュチェック
        const cacheKey = this.getCacheKey(normalizedQuery, options);
        const cachedResult = this.getCachedResult(cacheKey);
        if (cachedResult) {
            this.searchStats.cacheHits++;
            return cachedResult;
        }
        
        try {
            // 検索実行
            const results = await this.performSearch(normalizedQuery, options);
            
            // 結果をキャッシュ
            this.setCachedResult(cacheKey, results);
            
            // 統計更新
            this.updateSearchStats(normalizedQuery, performance.now() - startTime);
            
            return results;
            
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }
    
    /**
     * 実際の検索処理
     * @private
     */
    async performSearch(query, options) {
        const tokens = this.tokenize(query);
        const expandedTokens = this.expandQuery(tokens);
        
        // 各トークンの検索結果を取得
        const tokenResults = new Map();
        for (const token of expandedTokens) {
            const docIds = this.textIndex.get(token) || [];
            tokenResults.set(token, docIds);
        }
        
        // ドキュメントスコアを計算
        const documentScores = new Map();
        for (const [token, docIds] of tokenResults) {
            for (const docId of docIds) {
                const score = this.calculateRelevanceScore(token, docId, query);
                documentScores.set(docId, (documentScores.get(docId) || 0) + score);
            }
        }
        
        // フィルタリング
        const filteredScores = this.applyFilters(documentScores, options);
        
        // 結果をソートして返す
        const sortedResults = this.rankResults(filteredScores, query);
        
        // 制限数を適用
        const limit = options.limit || 20;
        return sortedResults.slice(0, limit);
    }
    
    /**
     * クエリ拡張（類義語・ステミング）
     * @private
     */
    expandQuery(tokens) {
        const expanded = new Set(tokens);
        
        for (const token of tokens) {
            // 類義語を追加
            if (this.synonyms.has(token)) {
                for (const synonym of this.synonyms.get(token)) {
                    expanded.add(synonym.toLowerCase());
                }
            }
            
            // 部分マッチング（3文字以上の場合）
            if (token.length >= 3) {
                for (const indexedToken of this.textIndex.keys()) {
                    if (indexedToken.includes(token) || token.includes(indexedToken)) {
                        expanded.add(indexedToken);
                    }
                }
            }
        }
        
        return Array.from(expanded);
    }
    
    /**
     * 関連度スコア計算
     * @private
     */
    calculateRelevanceScore(token, docId, originalQuery) {
        const document = this.documentStore.get(docId);
        if (!document) return 0;
        
        let score = 0;
        
        // フィールドごとの重み付きスコア
        for (const [field, weight] of Object.entries(this.fieldWeights)) {
            const text = document[field];
            if (text) {
                const fieldScore = this.calculateFieldScore(token, text, weight);
                score += fieldScore;
            }
        }
        
        // 追加ボーナス
        score += this.calculateBonusScore(token, document, originalQuery);
        
        return score;
    }
    
    /**
     * フィールドスコア計算
     * @private
     */
    calculateFieldScore(token, text, weight) {
        const lowerText = text.toLowerCase();
        const occurrences = (lowerText.match(new RegExp(token, 'g')) || []).length;
        
        if (occurrences === 0) return 0;
        
        // TF-IDF風のスコア計算
        const tf = occurrences / text.length;
        const idf = Math.log(this.documentStore.size / (this.getDocumentFrequency(token) + 1));
        
        return tf * idf * weight;
    }
    
    /**
     * ボーナススコア計算
     * @private
     */
    calculateBonusScore(token, document, originalQuery) {
        let bonus = 0;
        
        // 完全一致ボーナス
        if (document.title && document.title.toLowerCase().includes(originalQuery)) {
            bonus += 2.0;
        }
        
        // 最近更新されたコンテンツのボーナス
        if (document.lastUpdated) {
            const daysSinceUpdate = (Date.now() - new Date(document.lastUpdated)) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 30) {
                bonus += 0.5;
            }
        }
        
        // 人気コンテンツのボーナス
        if (document.viewCount && document.viewCount > 100) {
            bonus += Math.log(document.viewCount / 100) * 0.3;
        }
        
        return bonus;
    }
    
    /**
     * フィルタリング適用
     * @private
     */
    applyFilters(documentScores, options) {
        const filtered = new Map();
        
        for (const [docId, score] of documentScores) {
            const document = this.documentStore.get(docId);
            if (!document) continue;
            
            // カテゴリフィルター
            if (options.category && document.category !== options.category) {
                continue;
            }
            
            // 言語フィルター
            if (options.language && document.language !== options.language) {
                continue;
            }
            
            // 最小スコア閾値
            const minScore = options.minScore || 0.1;
            if (score < minScore) {
                continue;
            }
            
            filtered.set(docId, score);
        }
        
        return filtered;
    }
    
    /**
     * 結果ランキング
     * @private
     */
    rankResults(documentScores, query) {
        const results = [];
        
        for (const [docId, score] of documentScores) {
            const document = this.documentStore.get(docId);
            if (document) {
                results.push({
                    ...document,
                    relevanceScore: score,
                    highlights: this.generateHighlights(document, query)
                });
            }
        }
        
        // スコア順でソート
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        return results;
    }
    
    /**
     * 検索語句のハイライト生成
     * @private
     */
    generateHighlights(document, query) {
        const tokens = this.tokenize(query);
        const highlights = {};
        
        for (const [field, weight] of Object.entries(this.fieldWeights)) {
            const text = document[field];
            if (text) {
                let highlightedText = text;
                for (const token of tokens) {
                    const regex = new RegExp(`(${token})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
                }
                if (highlightedText !== text) {
                    highlights[field] = highlightedText;
                }
            }
        }
        
        return highlights;
    }
    
    /**
     * 検索提案取得
     * @param {string} partialQuery - 部分クエリ
     * @returns {Promise<Array>} - 提案リスト
     */
    async getSuggestions(partialQuery) {
        if (!partialQuery || partialQuery.length < 2) {
            return [];
        }
        
        const suggestions = new Set();
        const lowerQuery = partialQuery.toLowerCase();
        
        // インデックスされた単語から提案を生成
        for (const token of this.textIndex.keys()) {
            if (token.startsWith(lowerQuery)) {
                suggestions.add(token);
            }
        }
        
        // 人気クエリから提案
        for (const [query] of this.searchStats.popularQueries) {
            if (query.toLowerCase().includes(lowerQuery)) {
                suggestions.add(query);
            }
        }
        
        // 類義語から提案
        for (const [key, synonyms] of this.synonyms) {
            if (key.startsWith(lowerQuery)) {
                suggestions.add(key);
            }
            for (const synonym of synonyms) {
                if (synonym.toLowerCase().startsWith(lowerQuery)) {
                    suggestions.add(synonym);
                }
            }
        }
        
        return Array.from(suggestions).slice(0, 10);
    }
    
    /**
     * 関連コンテンツ取得
     * @param {string} contentId - コンテンツID
     * @returns {Array} - 関連コンテンツ
     */
    getRelatedContent(contentId) {
        const document = this.documentStore.get(contentId);
        if (!document) return [];
        
        // カテゴリが同じコンテンツを検索
        const related = [];
        for (const [id, doc] of this.documentStore) {
            if (id === contentId) continue;
            
            if (doc.category === document.category) {
                related.push({
                    ...doc,
                    similarity: this.calculateSimilarity(document, doc)
                });
            }
        }
        
        // 類似度順でソート
        related.sort((a, b) => b.similarity - a.similarity);
        
        return related.slice(0, 5);
    }
    
    /**
     * テキストのトークン化
     * @private
     */
    tokenize(text) {
        if (!text) return [];
        
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // 記号を除去
            .split(/\s+/)
            .filter(token => token.length > 1 && !this.stopWords.has(token));
    }
    
    /**
     * インデックスに追加
     * @private
     */
    addToIndex(token, docId, field, weight) {
        if (!this.textIndex.has(token)) {
            this.textIndex.set(token, []);
        }
        
        const docList = this.textIndex.get(token);
        if (!docList.includes(docId)) {
            docList.push(docId);
        }
    }
    
    /**
     * ドキュメント頻度取得
     * @private
     */
    getDocumentFrequency(token) {
        const docList = this.textIndex.get(token);
        return docList ? docList.length : 0;
    }
    
    /**
     * 類似度計算
     * @private
     */
    calculateSimilarity(doc1, doc2) {
        const tokens1 = new Set(this.tokenize(doc1.title + ' ' + doc1.content));
        const tokens2 = new Set(this.tokenize(doc2.title + ' ' + doc2.content));
        
        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);
        
        return intersection.size / union.size; // Jaccard係数
    }
    
    /**
     * キャッシュキー生成
     * @private
     */
    getCacheKey(query, options) {
        return `${query}|${JSON.stringify(options)}`;
    }
    
    /**
     * キャッシュ結果取得
     * @private
     */
    getCachedResult(key) {
        const cached = this.searchCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.result;
        }
        
        if (cached) {
            this.searchCache.delete(key);
        }
        
        return null;
    }
    
    /**
     * キャッシュ結果保存
     * @private
     */
    setCachedResult(key, result) {
        if (this.searchCache.size >= this.maxCacheSize) {
            // 古いキャッシュを削除
            const oldestKey = this.searchCache.keys().next().value;
            this.searchCache.delete(oldestKey);
        }
        
        this.searchCache.set(key, {
            result: result,
            timestamp: Date.now()
        });
    }
    
    /**
     * 検索統計更新
     * @private
     */
    updateSearchStats(query, searchTime) {
        this.searchStats.totalSearches++;
        
        // 平均検索時間更新
        const prevAvg = this.searchStats.averageSearchTime;
        const count = this.searchStats.totalSearches;
        this.searchStats.averageSearchTime = (prevAvg * (count - 1) + searchTime) / count;
        
        // 人気クエリ更新
        const currentCount = this.searchStats.popularQueries.get(query) || 0;
        this.searchStats.popularQueries.set(query, currentCount + 1);
        
        // 検索履歴保存
        this.saveSearchHistory();
    }
    
    /**
     * キャッシュクリーンアップ
     * @private
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, cached] of this.searchCache) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.searchCache.delete(key);
            }
        }
    }
    
    /**
     * 検索履歴読み込み
     * @private
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('search_history');
            if (stored) {
                const data = JSON.parse(stored);
                this.searchStats.popularQueries = new Map(data.popularQueries || []);
            }
        } catch (error) {
            console.warn('Failed to load search history:', error);
        }
    }
    
    /**
     * 検索履歴保存
     * @private
     */
    saveSearchHistory() {
        try {
            const data = {
                popularQueries: Array.from(this.searchStats.popularQueries.entries())
            };
            localStorage.setItem('search_history', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }
    
    /**
     * パフォーマンス統計取得
     * @returns {Object} - パフォーマンス統計
     */
    getPerformanceStats() {
        return {
            totalSearches: this.searchStats.totalSearches,
            cacheHitRate: this.searchStats.totalSearches > 0 
                ? (this.searchStats.cacheHits / this.searchStats.totalSearches) * 100 
                : 0,
            averageSearchTime: Math.round(this.searchStats.averageSearchTime * 100) / 100,
            indexSize: this.textIndex.size,
            documentCount: this.documentStore.size,
            cacheSize: this.searchCache.size,
            popularQueries: Array.from(this.searchStats.popularQueries.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
        };
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.textIndex.clear();
        this.documentStore.clear();
        this.searchCache.clear();
        this.searchStats = {
            totalSearches: 0,
            cacheHits: 0,
            averageSearchTime: 0,
            popularQueries: new Map()
        };
    }
}