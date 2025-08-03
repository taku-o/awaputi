/**
 * HelpContentManager - ヘルプコンテンツ管理システム
 * 
 * ヘルプコンテンツのデータベース管理、検索、フィルタリング機能を提供
 */

export class HelpContentManager {
    constructor() {
        this.helpDatabase = this.initializeHelpDatabase();
        this.searchIndex = new Map();
        this.categoryIndex = new Map();
        this.difficultyIndex = new Map();
        this.buildSearchIndexes();
    }

    /**
     * ヘルプデータベースを初期化
     * @returns {Object} ヘルプデータベース
     */
    initializeHelpDatabase() {
        return {
            // ゲーム基本操作
            gameBasics: {
                category: 'basic',
                priority: 'high',
                content: {
                    title: 'ゲームの基本操作',
                    description: 'バブルポップゲームの基本的な遊び方を説明します',
                    steps: [
                        {
                            step: 1,
                            title: 'バブルをクリック',
                            description: 'バブルをクリックしてポップしましょう',
                            visual: 'cursor-pointer',
                            keyboardAlternative: 'Tabキーで選択、Enterキーでポップ'
                        },
                        {
                            step: 2,
                            title: 'スコアを獲得',
                            description: 'バブルをポップするとスコアが増えます',
                            visual: 'score-increase',
                            tips: ['連続でポップするとコンボボーナス', '特殊バブルで高得点']
                        },
                        {
                            step: 3,
                            title: '時間制限に注意',
                            description: 'バブルが破裂する前にポップしましょう',
                            visual: 'timer-warning',
                            urgency: 'medium'
                        }
                    ],
                    relatedTopics: ['scoring', 'specialBubbles', 'combos'],
                    difficulty: 'beginner'
                }
            },

            // スコアシステム
            scoring: {
                category: 'gameplay',
                priority: 'medium',
                content: {
                    title: 'スコアシステム',
                    description: 'スコアの仕組みと高得点のコツ',
                    sections: [
                        {
                            title: '基本スコア',
                            content: 'バブルの種類によって基本スコアが決まります',
                            details: {
                                normal: '10点',
                                stone: '25点',
                                rainbow: '50点',
                                boss: '100点'
                            }
                        },
                        {
                            title: 'コンボボーナス',
                            content: '連続でバブルをポップするとボーナスが加算されます',
                            formula: '基本スコア × コンボ倍率',
                            tips: ['3コンボ以上で倍率開始', '最大10倍まで可能']
                        }
                    ],
                    relatedTopics: ['gameBasics', 'specialBubbles'],
                    difficulty: 'intermediate'
                }
            },

            // 特殊バブル
            specialBubbles: {
                category: 'gameplay',
                priority: 'medium',
                content: {
                    title: '特殊バブルの種類',
                    description: '様々な効果を持つ特殊バブルの解説',
                    bubbleTypes: [
                        {
                            name: 'レインボーバブル',
                            color: 'rainbow',
                            effect: 'ボーナスタイム発動',
                            points: 50,
                            strategy: 'すぐにポップしてボーナスタイムを活用',
                            visual: 'rainbow-effect'
                        },
                        {
                            name: 'ピンクバブル',
                            color: 'pink',
                            effect: 'HP回復',
                            points: 20,
                            strategy: 'HPが少ない時に優先的にポップ',
                            visual: 'heal-effect'
                        },
                        {
                            name: 'クロックバブル',
                            color: 'blue',
                            effect: '時間停止',
                            points: 30,
                            strategy: '忙しい時にポップして時間を稼ぐ',
                            visual: 'time-stop-effect'
                        },
                        {
                            name: 'エレクトリックバブル',
                            color: 'yellow',
                            effect: '画面震動（妨害）',
                            points: 15,
                            strategy: '注意してポップ、震動に備える',
                            visual: 'electric-effect',
                            warning: true
                        },
                        {
                            name: 'ポイズンバブル',
                            color: 'green',
                            effect: 'ダメージ',
                            points: 5,
                            strategy: '避けるか、やむを得ない場合のみ',
                            visual: 'poison-effect',
                            warning: true
                        },
                        {
                            name: 'ボスバブル',
                            color: 'red',
                            effect: '大型、高HP',
                            points: 100,
                            strategy: '複数回クリックが必要、高得点',
                            visual: 'boss-effect'
                        }
                    ],
                    relatedTopics: ['gameBasics', 'scoring', 'strategy'],
                    difficulty: 'intermediate'
                }
            },

            // ゲーム戦略
            strategy: {
                category: 'advanced',
                priority: 'low',
                content: {
                    title: '高得点のための戦略',
                    description: '効率的なゲームプレイのコツとテクニック',
                    strategies: [
                        {
                            name: 'コンボ重視戦略',
                            description: '連続ポップでコンボを狙う',
                            techniques: [
                                '小さいバブルから順番にポップ',
                                'グループになったバブルを狙う',
                                'ミスを避けてコンボを維持'
                            ],
                            difficulty: 'intermediate',
                            effectiveness: 'high'
                        },
                        {
                            name: '特殊バブル活用戦略',
                            description: '特殊バブルの効果を最大限活用',
                            techniques: [
                                'レインボーバブルを見つけたらすぐポップ',
                                'HPが減ったらピンクバブルを優先',
                                '忙しい時はクロックバブルで時間稼ぎ'
                            ],
                            difficulty: 'advanced',
                            effectiveness: 'very high'
                        },
                        {
                            name: 'リスク管理戦略',
                            description: 'ダメージを最小限に抑える',
                            techniques: [
                                'ポイズンバブルは可能な限り避ける',
                                'エレクトリックバブルの震動に備える',
                                'HP管理を常に意識する'
                            ],
                            difficulty: 'intermediate',
                            effectiveness: 'medium'
                        }
                    ],
                    relatedTopics: ['specialBubbles', 'scoring'],
                    difficulty: 'advanced'
                }
            },

            // アクセシビリティ機能
            accessibility: {
                category: 'settings',
                priority: 'high',
                content: {
                    title: 'アクセシビリティ機能',
                    description: 'ゲームをより快適にプレイするための機能',
                    features: [
                        {
                            name: 'キーボード操作',
                            description: 'マウスを使わずにキーボードでプレイ',
                            shortcuts: {
                                'Tab': 'バブル選択',
                                'Enter': 'バブルポップ',
                                'Space': 'ゲーム一時停止',
                                'F1': 'ヘルプ表示'
                            }
                        },
                        {
                            name: 'スクリーンリーダー対応',
                            description: '音声でゲーム状況を確認',
                            features: [
                                'バブル位置の音声案内',
                                'スコア・HP・時間の読み上げ',
                                'ゲーム状況の詳細説明'
                            ]
                        },
                        {
                            name: '視覚サポート',
                            description: '見やすさを向上させる機能',
                            options: [
                                '高コントラスト表示',
                                'カラーブラインド対応',
                                'フォントサイズ調整',
                                'アニメーション軽減'
                            ]
                        },
                        {
                            name: '時間調整',
                            description: 'プレイ時間の調整機能',
                            options: [
                                'ゲーム速度調整',
                                '一時停止機能',
                                '時間制限延長',
                                '自動保存機能'
                            ]
                        }
                    ],
                    relatedTopics: ['settings', 'controls'],
                    difficulty: 'beginner'
                }
            }
        };
    }

    /**
     * 検索インデックスを構築
     */
    buildSearchIndexes() {
        Object.entries(this.helpDatabase).forEach(([key, item]) => {
            // カテゴリ別インデックス
            const category = item.category;
            if (!this.categoryIndex.has(category)) {
                this.categoryIndex.set(category, []);
            }
            this.categoryIndex.get(category).push(key);

            // 難易度別インデックス
            const difficulty = item.content.difficulty;
            if (!this.difficultyIndex.has(difficulty)) {
                this.difficultyIndex.set(difficulty, []);
            }
            this.difficultyIndex.get(difficulty).push(key);

            // 検索用キーワードインデックス
            const keywords = this.extractKeywords(item);
            keywords.forEach(keyword => {
                if (!this.searchIndex.has(keyword)) {
                    this.searchIndex.set(keyword, []);
                }
                this.searchIndex.get(keyword).push(key);
            });
        });
    }

    /**
     * ヘルプコンテンツからキーワードを抽出
     */
    extractKeywords(item) {
        const keywords = [];
        const content = item.content;
        
        // タイトルと説明
        keywords.push(...this.tokenize(content.title));
        keywords.push(...this.tokenize(content.description));
        
        // 関連トピック
        if (content.relatedTopics) {
            keywords.push(...content.relatedTopics);
        }
        
        return [...new Set(keywords)]; // 重複削除
    }

    /**
     * テキストをトークン化
     */
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(token => token.length > 1);
    }

    /**
     * ヘルプコンテンツを検索
     */
    searchContent(query, options = {}) {
        const results = new Set();
        const keywords = this.tokenize(query);
        
        keywords.forEach(keyword => {
            if (this.searchIndex.has(keyword)) {
                this.searchIndex.get(keyword).forEach(key => results.add(key));
            }
        });
        
        // カテゴリフィルタ
        if (options.category) {
            return Array.from(results).filter(key => 
                this.helpDatabase[key].category === options.category
            );
        }
        
        // 難易度フィルタ
        if (options.difficulty) {
            return Array.from(results).filter(key => 
                this.helpDatabase[key].content.difficulty === options.difficulty
            );
        }
        
        return Array.from(results);
    }

    /**
     * カテゴリ別ヘルプを取得
     */
    getByCategory(category) {
        return this.categoryIndex.get(category) || [];
    }

    /**
     * 難易度別ヘルプを取得
     */
    getByDifficulty(difficulty) {
        return this.difficultyIndex.get(difficulty) || [];
    }

    /**
     * ヘルプコンテンツを取得
     */
    getContent(key) {
        return this.helpDatabase[key] || null;
    }

    /**
     * 関連ヘルプを取得
     */
    getRelatedContent(key) {
        const content = this.getContent(key);
        if (!content || !content.content.relatedTopics) {
            return [];
        }
        
        return content.content.relatedTopics
            .map(topic => this.getContent(topic))
            .filter(Boolean);
    }

    /**
     * 優先度順でヘルプを取得
     */
    getByPriority(priority) {
        return Object.keys(this.helpDatabase)
            .filter(key => this.helpDatabase[key].priority === priority)
            .sort((a, b) => this.helpDatabase[a].category.localeCompare(this.helpDatabase[b].category));
    }

    /**
     * 全ヘルプキーを取得
     */
    getAllKeys() {
        return Object.keys(this.helpDatabase);
    }

    /**
     * 全カテゴリを取得
     */
    getAllCategories() {
        return Array.from(this.categoryIndex.keys());
    }

    /**
     * 全難易度を取得
     */
    getAllDifficulties() {
        return Array.from(this.difficultyIndex.keys());
    }
}