/**
 * FAQSystem.ts
 * インタラクティブFAQシステム
 * 検索機能、カテゴリ表示、ユーザーフィードバック機能を提供
 */

import { ErrorHandler  } from '../../utils/ErrorHandler.js';''
import { LoggingSystem  } from '../LoggingSystem.js';

// 型定義
export interface GameEngine { helpManager?: HelpManager;
    }

export interface HelpManager { contentLoader?: ContentLoader;
    }
';

export interface ContentLoader {;
    loadFAQData(''';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';''
export type SortOrder = 'relevance' | 'popularity' | 'recent' | 'alphabetical' | 'helpful';''
export type FeedbackType = 'helpful' | 'not_helpful' | 'suggestion';

/**
 * FAQシステムクラス
 */
export class FAQSystem {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    // FAQ データ管理
    private, faqDatabase: Map<string, FAQData>;
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
    );
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
        this.searchEngine = null;''
        this.activeFilters = new Set<string>(');''
        this.sortOrder = 'relevance';
        
        // 表示設定
        this.displayConfig = {
            itemsPerPage: 10,
            expandedItems: new Set<string>(');
            showCategories: true;
            showSearchBox: true;
            showFeedback: true;
    ,}
            animationDuration: 300 }
        };
        // FAQカテゴリ定義
        this.defaultCategories = [{;
                id: 'gameplay',
                name: 'ゲームプレイ',
                description: 'ゲームの基本操作や遊び方について',
                icon: '🎮';
               , priority: 1 ,};
            { ''
                id: 'bubbles',
                name: '泡の種類',
                description: '特殊泡の効果や使い方について',
                icon: '🫧';
               , priority: 2 ,};
            { ''
                id: 'scoring',
                name: 'スコアシステム',
                description: 'スコアの計算方法やコンボについて',
                icon: '🏆';
               , priority: 3 ,};
            { ''
                id: 'controls',
                name: '操作方法',
                description: 'キーボードやマウスの操作について',
                icon: '⌨️';
               , priority: 4 ,};
            { ''
                id: 'settings',
                name: '設定',
                description: 'ゲーム設定や環境設定について',
                icon: '⚙️';
               , priority: 5 ,};
            { ''
                id: 'troubleshooting',
                name: 'トラブルシューティング',
                description: '問題解決や不具合報告について',
                icon: '🔧';
               , priority: 6 ,}]
            }]
        ];
        // デフォルトFAQデータ
        this.defaultFAQs = [// ゲームプレイ関連;
            { ''
                id: 'how_to_play',
                category: 'gameplay',
                question: 'ゲームはどうやって遊ぶの？',]';
                answer: '画面に現れる泡をクリックして割るゲームです。泡が自然破裂する前に割る必要があります。特殊な泡にはそれぞれ異なる効果があります。',']';
                tags: ['基本', '初心者', '遊び方],
                difficulty: 'beginner',
                lastUpdated: new Date().toISOString(''';
               , id: 'game_objective',
                category: 'gameplay',
                question: 'ゲームの目的は何？',
                answer: 'できるだけ高いスコアを獲得することが目的です。泡を連続して割ってコンボを決めたり、特殊泡を活用してボーナスポイントを稼ぎましょう。',
                tags: ['目的', 'スコア', 'コンボ],)';
                difficulty: 'beginner',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'special_bubbles_types',
                category: 'bubbles',
                question: '特殊泡にはどんな種類がある？',
                answer: '虹色泡（ボーナスタイム）、ピンク泡（HP回復）、時計泡（時間停止）、電気泡（画面震動）、毒泡（ダメージ）、石泡・鉄泡（複数回クリック必要）など、18種類以上の特殊泡があります。',
                tags: ['特殊泡', '種類', '効果],)';
                difficulty: 'intermediate',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'rainbow_bubble_effect',
                category: 'bubbles',
                question: '虹色の泡の効果は？',
                answer: '虹色泡を割るとボーナスタイムが発動し、一定時間すべての泡のスコアが2倍になります。見つけたら優先的に割りましょう。',
                tags: ['虹色泡', 'ボーナスタイム', 'スコア2倍],)';
                difficulty: 'beginner',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'combo_system',
                category: 'scoring',
                question: 'コンボシステムはどう動作する？',
                answer: '泡を連続して素早く割るとコンボが発生し、スコアにボーナスが付きます。コンボ数が高いほど獲得スコアが増加します。時間が空くとコンボは途切れます。',
                tags: ['コンボ', 'ボーナス', 'スコア],)';
                difficulty: 'intermediate',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'score_calculation',
                category: 'scoring',
                question: 'スコアはどうやって計算される？',
                answer: '基本スコア + コンボボーナス + 特殊泡ボーナス + タイミングボーナスで計算されます。難しい泡ほど高得点で、コンボ中は倍率が上がります。',
                tags: ['スコア計算', 'ボーナス', '倍率],)';
                difficulty: 'advanced',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'mouse_controls',
                category: 'controls',
                question: 'マウス操作方法は？',
                answer: '左クリックで泡を割る、ドラッグで泡を押し退けることができます。右クリックは使用しません。',
                tags: ['マウス', 'クリック', 'ドラッグ],)';
                difficulty: 'beginner',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'keyboard_shortcuts',
                category: 'controls',
                question: 'キーボードショートカットはある？',
                answer: 'Escキー：メニューを開く、Hキー：ヘルプを表示、Pキー：ポーズ、Ctrl+Shift+D：デバッグモード切り替え、などがあります。',
                tags: ['キーボード', 'ショートカット', 'ホットキー],)';
                difficulty: 'intermediate',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'audio_settings',
                category: 'settings',
                question: '音量設定はどこで変更できる？',
                answer: 'メインメニューの設定から音量を調整できます。BGM、効果音、マスター音量をそれぞれ個別に設定可能です。',
                tags: ['音量', '設定', 'BGM', '効果音],)';
                difficulty: 'beginner',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'performance_settings',
                category: 'settings',
                question: 'ゲームが重い時はどうすれば？',
                answer: '設定で視覚効果を下げる、パーティクル数を減らす、フレームレート制限を設定する、ブラウザの他のタブを閉じるなどを試してください。',
                tags: ['パフォーマンス', '重い', '最適化],)';
                difficulty: 'intermediate',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'game_not_loading',
                category: 'troubleshooting',
                question: 'ゲームが読み込まれない',
                answer: 'ブラウザを更新する、キャッシュをクリアする、JavaScriptが有効になっているか確認する、対応ブラウザ（Chrome、Firefox、Safari、Edge）を使用しているか確認してください。',
                tags: ['読み込み', 'エラー', 'ブラウザ],)';
                difficulty: 'beginner',')';
                lastUpdated: new Date().toISOString(''';
               , id: 'save_data_lost',
                category: 'troubleshooting',
                question: 'セーブデータが消えた',
                answer: 'ブラウザのローカルストレージが削除された可能性があります。プライベートモード使用、クッキー削除、ブラウザのストレージクリアが原因の場合があります。バックアップ機能を使用することをお勧めします。',
                tags: ['セーブデータ', '消失', 'ローカルストレージ],)';
                difficulty: 'intermediate',);
                lastUpdated: new Date().toISOString();
                viewCount: 0;
                helpfulCount: 0;
               , notHelpfulCount: 0 ,}
        ];
        this.initialize();
    }
    
    /**
     * システムの初期化
     */
    async initialize(): Promise<void> { try {
            // カテゴリの初期化
            this.initializeCategories();
            
            // FAQ データの初期化
            await this.initializeFAQData();
            
            // 検索インデックスの構築
            this.buildSearchIndex();
            // ユーザー統計の読み込み
            this.loadUserStatistics()';
            this.loggingSystem.info('FAQSystem', 'FAQ system initialized);' }

        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to initialize FAQ system', error);''
            ErrorHandler.handle(error as Error, 'FAQSystem.initialize); }'
    }
    
    /**
     * カテゴリの初期化
     */
    private initializeCategories(): void { this.defaultCategories.forEach(category => { 
            this.categories.set(category.id, {
                ...category);
                faqCount: 0);
               , viewCount: 0,) }
                lastAccessed: null); }
        });
    }
    
    /**
     * FAQ データの初期化
     */
    private async initializeFAQData(): Promise<void> { // デフォルトFAQをデータベースに追加
        this.defaultFAQs.forEach(faq => { 
            this.faqDatabase.set(faq.id, {)
                ...faq,);
                id: faq.id);
                createdAt: new Date().toISOString();
               , popularity: 0, }
                relevanceScore: 0 }
            });
            // カテゴリのFAQ数を更新
            const category = this.categories.get(faq.category);
            if (category) { category.faqCount!++; }
        });
        
        // 外部FAQデータの読み込み（必要に応じて）
        await this.loadExternalFAQData();
    }
    
    /**
     * 外部FAQデータの読み込み
     */
    private async loadExternalFAQData(): Promise<void> { try {
            if(this.gameEngine.helpManager? .contentLoader) {
                const faqContent = await this.gameEngine.helpManager.contentLoader.loadFAQData();
                if(faqContent && Array.isArray(faqContent) {
                    faqContent.forEach(faq => { );
                        if(!this.faqDatabase.has(faq.id) {
                            this.faqDatabase.set(faq.id, faq);
                            
                            const category = this.categories.get(faq.category);
            }
                            if (category) { }
                                category.faqCount!++; }
}
                    });
                }''
            } catch (error) {
            this.loggingSystem.warn('FAQSystem', 'Failed to load external FAQ data', error);
            // エラーが発生してもデフォルトデータで継続 }
    }
    
    /**
     * 検索インデックスの構築
     */ : undefined
    private buildSearchIndex(): void { this.searchIndex.clear();
        
        for(const [faqId, faq] of this.faqDatabase) {
        
            // 検索可能なテキストを抽出
            const searchableText = [faq.question];
                faq.answer,']';
                ...(faq.tags || []')'';
            ].join(' ').toLowerCase();
            
            // キーワードごとにインデックス化
            const words = searchableText.split(/\s+/);
            words.forEach(word => { );
                if (word.length >= 2) { // 2文字以上のワードのみ
        
        }
                    if(!this.searchIndex.has(word) { }
                        this.searchIndex.set(word, new Set<string>(); }
                    }
                    this.searchIndex.get(word)!.add(faqId);
                }
            });
        }
    }
    
    /**
     * FAQ検索
     * @param query - 検索クエリ
     * @param options - 検索オプション
     * @returns 検索結果
     */
    searchFAQs(query: string, options: SearchOptions = { ): SearchResult {
        try {
            if (!query || query.trim().length === 0) {
                return this.getAllFAQs(options); }
            
            const searchTerms = query.toLowerCase().split(/\s+/);
            const matchingFAQs = new Map<string, number>(); // FAQ ID -> スコア
            
            // 検索語ごとにマッチングFAQを収集
            searchTerms.forEach(term => {  );
                if(this.searchIndex.has(term) {
                    const faqIds = this.searchIndex.get(term)!;
                    for (const, faqId of, faqIds) {
                }
                        const currentScore = matchingFAQs.get(faqId) || 0; }
                        matchingFAQs.set(faqId, currentScore + 1); }
}
            });
            
            // 完全一致・部分一致のボーナススコア
            for(const [faqId, faq] of this.faqDatabase) {
                const questionLower = faq.question.toLowerCase();
                const answerLower = faq.answer.toLowerCase();
                
                let bonusScore = 0;
                
                // 質問での完全一致
                if(questionLower.includes(query.toLowerCase()) {
            }
                    bonusScore += 10; }
                }
                
                // 回答での部分一致
                if(answerLower.includes(query.toLowerCase()) { bonusScore += 5; }
                
                // タグでの一致
                if(faq.tags) {
                    for (const, tag of, faq.tags) {
                        if (tag.toLowerCase().includes(query.toLowerCase()) {
                }
                            bonusScore += 3; }
}
                }
                
                if(bonusScore > 0) {
                
                    const currentScore = matchingFAQs.get(faqId) || 0;
                
                }
                    matchingFAQs.set(faqId, currentScore + bonusScore); }
}
            
            // 結果をスコア順にソート
            const sortedResults = Array.from(matchingFAQs.entries();
                .sort((a, b) => b[1] - a[1]);
                .map(([faqId, score]) => ({ ...this.faqDatabase.get(faqId)!,
                    relevanceScore: score ,});
            // フィルタリングとページネーション
            return this.applyFiltersAndPagination(sortedResults, options);

        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'FAQ search error', error);
            return { faqs: [],
                totalCount: 0;
                page: 1;
               , totalPages: 0, };
                hasMore: false }
            }
    }
    
    /**
     * 全FAQ取得
     * @param options - 取得オプション
     * @returns FAQ一覧
     */
    getAllFAQs(options: SearchOptions = { ): SearchResult {
        const allFAQs = Array.from(this.faqDatabase.values();
        return this.applyFiltersAndPagination(allFAQs, options); }
    
    /**
     * カテゴリ別FAQ取得
     * @param categoryId - カテゴリID
     * @param options - 取得オプション
     * @returns FAQ一覧
     */
    getFAQsByCategory(categoryId: string, options: SearchOptions = { ): SearchResult {
        const categoryFAQs = Array.from(this.faqDatabase.values();
            .filter(faq => faq.category === categoryId);
        
        return this.applyFiltersAndPagination(categoryFAQs, options);
    
    /**
     * フィルタリングとページネーションの適用
     * @param faqs - FAQ配列
     * @param options - オプション
     * @returns 処理済みFAQ配列
     */
    private applyFiltersAndPagination(faqs: FAQData[], options: SearchOptions): SearchResult { let filteredFAQs = [...faqs];
        
        // 難易度フィルター
        if(options.difficulty) {
            
        ,}
            filteredFAQs = filteredFAQs.filter(faq => faq.difficulty === options.difficulty); }
        }
        
        // タグフィルター
        if(options.tags && options.tags.length > 0) {
            filteredFAQs = filteredFAQs.filter(faq => );
                faq.tags && faq.tags.some(tag => options.tags!.includes(tag);
        }
            ); }
        }
        
        // ソート
        filteredFAQs = this.sortFAQs(filteredFAQs, options.sortBy || this.sortOrder);
        
        // ページネーション
        const page = options.page || 1;
        const itemsPerPage = options.itemsPerPage || this.displayConfig.itemsPerPage;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return { faqs: filteredFAQs.slice(startIndex, endIndex),
            totalCount: filteredFAQs.length;
            page: page;
           , totalPages: Math.ceil(filteredFAQs.length / itemsPerPage), };
            hasMore: endIndex < filteredFAQs.length }
        }
    
    /**
     * FAQ配列のソート
     * @param faqs - FAQ配列
     * @param sortBy - ソート基準
     * @returns ソート済みFAQ配列
     */
    private sortFAQs(faqs: FAQData[], sortBy: SortOrder): FAQData[] { ''
        switch(sortBy) {'

            case 'popularity':'';
                return faqs.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)');

            case 'recent':'';
                return faqs.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

            case 'alphabetical':'';
                return faqs.sort((a, b) => a.question.localeCompare(b.question));

            case 'helpful':'';
                return faqs.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0)');

            case 'relevance':;
            default:;
        ,}
                return faqs.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    /**
     * FAQ詳細取得
     * @param faqId - FAQ ID
     * @returns FAQ詳細
     */
    getFAQ(faqId: string): FAQData | null { const faq = this.faqDatabase.get(faqId);
        if(faq) {
            // 閲覧数を増加
            faq.viewCount = (faq.viewCount || 0) + 1;
            faq.lastViewed = new Date().toISOString();
            
            // カテゴリの閲覧数も更新
            const category = this.categories.get(faq.category);
            if (category) {
                category.viewCount = (category.viewCount || 0) + 1;''
                category.lastAccessed = new Date().toISOString()';
            this.updateUsageStatistics(faqId, 'view'');
        }
            return { ...faq;
        }
        return null;
    }
    
    /**
     * ユーザーフィードバックの記録
     * @param faqId - FAQ ID
     * @param feedbackType - フィードバックタイプ
     * @param comment - コメント（オプション）'
     */''
    recordFeedback(faqId: string, feedbackType: FeedbackType, comment: string = ''): void { try {
            const faq = this.faqDatabase.get(faqId);
            if (!faq) return;
            ';
            // FAQのフィードバック統計を更新
            switch(feedbackType) {'

                case 'helpful':'';
                    faq.helpfulCount = (faq.helpfulCount || 0') + 1;

                    break;''
                case 'not_helpful':;
                    faq.notHelpfulCount = (faq.notHelpfulCount || 0) + 1;
            }
                    break; }
            }
            
            // フィードバックデータを保存
            const feedbackId = `${faqId}_${Date.now(})`;
            this.feedbackData.set(feedbackId, { faqId: faqId)
               , type: feedbackType,);
                comment: comment);
                timestamp: new Date().toISOString();
               , userAgent: navigator.userAgent' ,}'

            }');
            ';
            // 統計更新
            this.updateUsageStatistics(faqId, 'feedback', feedbackType);

            this.loggingSystem.info('FAQSystem', `Feedback recorded: ${faqId} - ${feedbackType}`});''
        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to record feedback', error); }
    }
    
    /**
     * 使用統計の更新
     * @param faqId - FAQ ID
     * @param action - アクション
     * @param details - 詳細情報'
     */''
    private updateUsageStatistics(faqId: string, action: string, details: string = ''): void {
        const statsKey = `${faqId}_${action}`;
        const currentStats = this.usageStatistics.get(statsKey) || { count: 0,
            lastAction: null;
           , details: [] ,};
        currentStats.count++;
        currentStats.lastAction = new Date().toISOString();
        
        if(details) { currentStats.details.push({)
                value: details }
                timestamp: new Date().toISOString(); }
            });
            
            // 詳細は最新10件のみ保持
            if (currentStats.details.length > 10) { currentStats.details = currentStats.details.slice(-10); }
        }
        
        this.usageStatistics.set(statsKey, currentStats);
    }
    
    /**
     * ユーザー統計の読み込み
     */''
    private loadUserStatistics()';
            const savedStats = localStorage.getItem('awaputi_faq_stats);
            if(savedStats) { const parsedStats: UserStatisticsData = JSON.parse(savedStats),
                this.usageStatistics = new Map(parsedStats.usageStatistics || [] }

                this.userPreferences = new, Map(parsedStats.userPreferences || []);' }'

            } catch (error) {
            this.loggingSystem.warn('FAQSystem', 'Failed to load user statistics', error); }
    }
    
    /**
     * ユーザー統計の保存
     */
    private saveUserStatistics(): void { try {
            const statsData: UserStatisticsData = {
                usageStatistics: Array.from(this.usageStatistics.entries(),
                userPreferences: Array.from(this.userPreferences.entries(),
                lastSaved: new Date().toISOString()';
            localStorage.setItem('awaputi_faq_stats', JSON.stringify(statsData);' }

        } catch (error) {
            this.loggingSystem.warn('FAQSystem', 'Failed to save user statistics', error); }
    }
    
    /**
     * カテゴリ一覧取得
     * @returns カテゴリ一覧
     */
    getCategories(): CategoryData[] { return Array.from(this.categories.values()
            .sort((a, b) => a.priority - b.priority);
    
    /**
     * 人気FAQ取得
     * @param limit - 取得件数
     * @returns 人気FAQ一覧
     */
    getPopularFAQs(limit: number = 5): FAQData[] { return Array.from(this.faqDatabase.values()
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            .slice(0, limit); }
    }
    
    /**
     * 最近のFAQ取得
     * @param limit - 取得件数
     * @returns 最近のFAQ一覧
     */
    getRecentFAQs(limit: number = 5): FAQData[] { return Array.from(this.faqDatabase.values()
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            .slice(0, limit); }
    }
    
    /**
     * 関連FAQ取得
     * @param faqId - FAQ ID
     * @param limit - 取得件数
     * @returns 関連FAQ一覧
     */
    getRelatedFAQs(faqId: string, limit: number = 3): RelatedFAQ[] { const targetFAQ = this.faqDatabase.get(faqId);
        if (!targetFAQ) return [];
        
        const relatedFAQs = Array.from(this.faqDatabase.values();
            .filter(faq => faq.id !== faqId);
            .map(faq => { 
                let, score = 0;)
                );
                // 同じカテゴリ);
                if (faq.category === targetFAQ.category) { }
                    score += 5; }
                }
                
                // 共通タグ
                if(targetFAQ.tags && faq.tags) {
                    const commonTags = targetFAQ.tags.filter(tag => faq.tags!.includes(tag);
                }
                    score += commonTags.length * 2; }
                }
                
                // 同じ難易度
                if (faq.difficulty === targetFAQ.difficulty) { score += 1; }
                
                return { ...faq, relationScore: score ,})
            .filter(faq => faq.relationScore > 0);
            .sort((a, b) => b.relationScore - a.relationScore);
            .slice(0, limit);
        
        return relatedFAQs;
    }
    
    /**
     * FAQ検索サジェスト取得
     * @param query - 検索クエリ
     * @param limit - 取得件数
     * @returns サジェスト一覧
     */
    getSearchSuggestions(query: string, limit: number = 5): string[] { if (!query || query.length < 2) return [];
        
        const queryLower = query.toLowerCase();
        const suggestions = new Set<string>();
        
        // 質問からの抽出
        for(const, faq of, this.faqDatabase.values() {
            const question = faq.question.toLowerCase();
            if(question.includes(queryLower) {
        }
                suggestions.add(faq.question); }
            }
            
            // タグからの抽出
            if(faq.tags) {
                for (const, tag of, faq.tags) {
                    if (tag.toLowerCase().includes(queryLower) {
            }
                        suggestions.add(tag); }
}
            }
            
            if (suggestions.size >= limit) break;
        }
        
        return Array.from(suggestions).slice(0, limit);
    }
    
    /**
     * システム統計取得
     * @returns システム統計
     */
    getSystemStats(): SystemStats { return { totalFAQs: this.faqDatabase.size,
            totalCategories: this.categories.size;
           , totalViews: Array.from(this.faqDatabase.values().reduce((sum, faq) => sum + (faq.viewCount || 0), 0),
            totalFeedback: this.feedbackData.size;
            mostPopularFAQ: this.getPopularFAQs(1)[0];
           , categoryStats: Object.fromEntries();
                Array.from(this.categories.entries().map(([id, category]) => [id,
                    {
                        name: category.name;
                       , faqCount: category.faqCount || 0, };
                        viewCount: category.viewCount || 0 }]
                    }]
                ]);
            ),
        }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void { try {
            // 統計データの保存
            this.saveUserStatistics();
            
            // データのクリア
            this.faqDatabase.clear();
            this.categories.clear();
            this.searchIndex.clear();
            this.feedbackData.clear();
            this.usageStatistics.clear();''
            this.userPreferences.clear()';
            this.loggingSystem.info('FAQSystem', 'FAQ system cleaned up);' }

        } catch (error) {
            this.loggingSystem.error('FAQSystem', 'Failed to cleanup FAQ system', error); }
}

// シングルトンインスタンス管理
let faqSystemInstance: FAQSystem | null = null,

/**
 * FAQSystemのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns FAQSystemインスタンス
 */
export function getFAQSystem(gameEngine: GameEngine): FAQSystem { if (!faqSystemInstance) {
        faqSystemInstance = new FAQSystem(gameEngine); }
    return faqSystemInstance;
}

/**
 * FAQSystemインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいFAQSystemインスタンス
 */
export function reinitializeFAQSystem(gameEngine: GameEngine): FAQSystem { if (faqSystemInstance) {
        faqSystemInstance.cleanup(); }''
    faqSystemInstance = new FAQSystem(gameEngine);

    return faqSystemInstance;''
}