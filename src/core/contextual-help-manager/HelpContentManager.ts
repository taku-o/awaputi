/**
 * HelpContentManager
 * 
 * ヘルプコンテンツ管理システム機能を担当
 * Content Management Controller Patternの一部として設計
 * 
 * **Features**:
 * - Help content database management and indexing
 * - Advanced search and filtering capabilities
 * - Category and difficulty-based organization
 * - Related content recommendation system
 * 
 * @module HelpContentManager
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface HelpDatabase { gameBasics: HelpItem,
    scoring: HelpItem,
    specialBubbles: HelpItem,
    strategy: HelpItem,
    accessibility: HelpItem,
    [key: string]: HelpItem,
    }
}

export interface HelpItem { category: HelpCategory,
    priority: HelpPriority,
    content: HelpContent;
    }
}

export interface HelpContent { title: string,
    description: string,
    difficulty: DifficultyLevel,
    relatedTopics?: string[];
    steps?: HelpStep[];
    sections?: HelpSection[];
    bubbleTypes?: BubbleType[];
    strategies?: Strategy[];
    features?: AccessibilityFeature[];
    metadata?: ContentMetadata;
    }
}

export interface HelpStep { step: number,
    title: string,
    description: string,
    visual?: string;
    keyboardAlternative?: string;
    tips?: string[];
    urgency?: UrgencyLevel;
    duration?: number;
    prerequisites?: string[]; }
}

export interface HelpSection { title: string,
    content: string,
    details?: Record<string, string>;
    formula?: string;
    tips?: string[];
    examples?: SectionExample[];
    subSections?: HelpSubSection[];
    }
}

export interface HelpSubSection { title: string,
    content: string,
    codeExample?: string;
    links?: HelpLink[];
    }
}

export interface SectionExample { title: string,
    description: string,
    input?: string;
    output?: string;
    explanation?: string; }
}

export interface BubbleType { name: string,
    color: BubbleColor,
    effect: string,
    points: number,
    strategy: string,
    visual: string,
    warning?: boolean;
    rarity?: BubbleRarity;
    conditions?: BubbleCondition[];
    }
}

export interface BubbleCondition { type: ConditionType,
    value: string | number,
    operator?: ComparisonOperator;
    }
}

export interface Strategy { name: string,
    description: string,
    techniques: string[],
    difficulty: DifficultyLevel,
    effectiveness: EffectivenessLevel,
    timeRequired?: number;
    skillLevel?: SkillLevel;
    situations?: GameSituation[];
    }
}

export interface GameSituation { scenario: string,
    recommendation: string,
    priority: number; }
}

export interface AccessibilityFeature { name: string,
    description: string,
    shortcuts?: Record<string, string>;
    features?: string[];
    options?: string[];
    category?: AccessibilityCategory;
    enabled?: boolean; }
}

export interface ContentMetadata { author?: string;
    lastUpdated?: Date;
    version?: string;
    tags?: string[];
    language?: string;
    readingTime?: number;
    mediaAssets?: MediaAsset[];
    }
}

export interface MediaAsset { type: MediaType,
    url: string,
    alt?: string;
    caption?: string;
    duration?: number; }
}

export interface HelpLink { title: string,
    url: string,
    type: LinkType,
    description?: string; }
}

export interface SearchOptions { category?: HelpCategory;
    difficulty?: DifficultyLevel;
    priority?: HelpPriority;
    tags?: string[];
    includeMetadata?: boolean;
    maxResults?: number;
    fuzzySearch?: boolean; }
}

export interface SearchResult { key: string,
    item: HelpItem,
    score: number,
    matches: SearchMatch[];
    }
}

export interface SearchMatch { field: string,
    text: string,
    position: number,
    context: string; }
}

export interface SearchIndexEntry { key: string,
    keywords: string[],
    weight: number,
    lastIndexed: Date;
    }
}

export interface CategoryIndex { category: HelpCategory,
    keys: string[],
    count: number,
    priority: HelpPriority;
    }
}

export interface DifficultyIndex { difficulty: DifficultyLevel,
    keys: string[],
    count: number,
    averageComplexity: number; }
}

export interface ContentStatistics { totalItems: number,
    categoryCounts: Record<HelpCategory, number>,
    difficultyCounts: Record<DifficultyLevel, number>,
    priorityCounts: Record<HelpPriority, number>,
    averageReadingTime: number,
    mostSearchedTopics: string[]; }
}

export interface RelatedContentOptions { maxResults?: number;
    includeSameCategory?: boolean;
    includeHigherDifficulty?: boolean;
    weightByPopularity?: boolean; }
}

export interface ContentValidation { isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[];
    }
}

export interface ValidationError { field: string,
    message: string,
    severity: ErrorSeverity;
    }
}

export interface ValidationWarning { field: string,
    message: string,
    suggestion: string; }
}

// 列挙型
export type HelpCategory = 'basic' | 'gameplay' | 'advanced' | 'settings' | 'troubleshooting';''
export type HelpPriority = 'low' | 'medium' | 'high' | 'critical';''
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';''
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';''
export type BubbleColor = 'normal' | 'rainbow' | 'pink' | 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'orange';''
export type BubbleRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';''
export type EffectivenessLevel = 'low' | 'medium' | 'high' | 'very high' | 'exceptional';''
export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';''
export type AccessibilityCategory = 'visual' | 'auditory' | 'motor' | 'cognitive' | 'general';''
export type MediaType = 'image' | 'video' | 'audio' | 'animation' | 'interactive';''
export type LinkType = 'internal' | 'external' | 'tutorial' | 'reference' | 'documentation';''
export type ConditionType = 'score' | 'level' | 'time' | 'combo' | 'health';''
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';''
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// 定数'
export const HELP_CATEGORIES: readonly HelpCategory[] = [']';
    'basic', 'gameplay', 'advanced', 'settings', 'troubleshooting'];
] as const;
';
export const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [']';
    'beginner', 'intermediate', 'advanced', 'expert'];
] as const;
';
export const HELP_PRIORITIES: readonly HelpPriority[] = [']';
    'low', 'medium', 'high', 'critical'];
] as const;
';
export const BUBBLE_COLORS: readonly BubbleColor[] = [']';
    'normal', 'rainbow', 'pink', 'blue', 'yellow', 'green', 'red', 'purple', 'orange'];
] as const;

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = { maxResults: 10,
    includeMetadata: true,
    fuzzySearch: false }
} as const,

export const KEYWORD_WEIGHTS = { title: 3,
    description: 2,
    sections: 1.5,
    tags: 1,
    relatedTopics: 0.8 }
} as const,

export const SEARCH_INDEX_CONFIG = { minKeywordLength: 2,'
    maxKeywordLength: 50,'';
    stopWords: ['の', 'を', 'に', 'は', 'が', 'で', 'と', 'や', 'から', 'まで'],
    rebuildThreshold: 100 }
} as const,

// ユーティリティ関数
export function isValidHelpCategory(category: string): category is HelpCategory { return HELP_CATEGORIES.includes(category as HelpCategory); }
}

export function isValidDifficultyLevel(difficulty: string): difficulty is DifficultyLevel { return DIFFICULTY_LEVELS.includes(difficulty as DifficultyLevel); }
}

export function isValidHelpPriority(priority: string): priority is HelpPriority { return HELP_PRIORITIES.includes(priority as HelpPriority); }
}'
'';
export function calculateReadingTime(content: HelpContent'): number { const wordsPerMinute = 200; // 平均読書速度
    let wordCount = 0;'
    '';
    wordCount += content.title.split(' '').length;''
    wordCount += content.description.split(' ').length;
    
    if(content.sections) {
    ';
        '';
        content.sections.forEach(section => { ');''
            wordCount += section.content.split(' ').length;'
    
    }'
            if (section.tips') {' }'
                wordCount += section.tips.join(' '').split(' ').length; }
            }
        });
    }
    
    if(content.steps) {
    ';
        ';
    }'
        content.steps.forEach(step => { ');' }'
            wordCount += step.description.split(' ').length; }
        });
    }
    
    return Math.ceil(wordCount / wordsPerMinute);
}

export function generateContentId(): string {
    return `help_${Date.now(})}_${Math.random().toString(36).substr(2, 9})}`;
}
';
export function sanitizeKeyword(keyword: string): string { ''
    return keyword.toLowerCase('')';
        .replace(/[^\w\s]/g, '');
        .trim(); }
}

export class HelpContentManager {
    private helpDatabase: HelpDatabase;
    private searchIndex: Map<string, string[]>;
    private categoryIndex: Map<HelpCategory, CategoryIndex>;
    private difficultyIndex: Map<DifficultyLevel, DifficultyIndex>;
    private indexedEntries: Map<string, SearchIndexEntry>;
    private lastRebuild: Date;
    constructor() {

        this.helpDatabase = this.initializeHelpDatabase();
        this.searchIndex = new Map();
        this.categoryIndex = new Map();
        this.difficultyIndex = new Map();
        this.indexedEntries = new Map();
        this.lastRebuild = new Date();
        

    }
    }
        this.buildSearchIndexes(); }
    }

    /**
     * ヘルプデータベースを初期化'
     */''
    initializeHelpDatabase(''';
                category: 'basic','';
                priority: 'high',';
                content: { ''
                    title: 'ゲームの基本操作','';
                    description: 'バブルポップゲームの基本的な遊び方を説明します',
                    steps: [{'
                            step: 1,'';
                            title: 'バブルをクリック','';
                            description: 'バブルをクリックしてポップしましょう','';
                            visual: 'cursor-pointer','';
                            keyboardAlternative: 'Tabキーで選択、Enterキーでポップ',
                            duration: 5 }
                        },'
                        { step: 2,''
                            title: 'スコアを獲得','';
                            description: 'バブルをポップするとスコアが増えます',']';
                            visual: 'score-increase',']';
                            tips: ['連続でポップするとコンボボーナス', '特殊バブルで高得点'],
                            duration: 10 }
                        },'
                        { step: 3,''
                            title: '時間制限に注意','';
                            description: 'バブルが破裂する前にポップしましょう','';
                            visual: 'timer-warning','';
                            urgency: 'medium',
                            duration: 15 }
                        }'
                    ],'';
                    relatedTopics: ['scoring', 'specialBubbles', 'combos'],'';
                    difficulty: 'beginner',';
                    metadata: { readingTime: 3,''
                        tags: ['基本', '操作', 'クリック', 'スコア'],'';
                        lastUpdated: new Date(''';
                category: 'gameplay','';
                priority: 'medium',';
                content: {''
                    title: 'スコアシステム','';
                    description: 'スコアの仕組みと高得点のコツ',';
                    sections: [{''
                            title: '基本スコア','';
                            content: 'バブルの種類によって基本スコアが決まります',';
                            details: {''
                                normal: '10点','';
                                stone: '25点','';
                                rainbow: '50点','';
                                boss: '100点' }
                            },
                            examples: [';
                                { ''
                                    title: '通常バブル','';
                                    description: '最も一般的なバブル','';
                                    input: '通常バブル × 1','';
                                    output: '10点','';
                                    explanation: '基本得点として10点が加算されます' }]
                                }]
                            ];
                        },'
                        { ''
                            title: 'コンボボーナス','';
                            content: '連続でバブルをポップするとボーナスが加算されます','';
                            formula: '基本スコア × コンボ倍率',')';
                            tips: ['3コンボ以上で倍率開始', '最大10倍まで可能'])';
                            subSections: [{''
                                    title: 'コンボ計算式','';
                                    content: 'コンボ倍率 = min(コンボ数 / 3, 10')','';
                                    codeExample: 'score = baseScore * Math.min(combo / 3, 10')' }]
                                }]
                            ];
                        }'
                    ],'';
                    relatedTopics: ['gameBasics', 'specialBubbles'],'';
                    difficulty: 'intermediate',';
                    metadata: { readingTime: 5,''
                        tags: ['スコア', 'コンボ', '得点', '計算'],'';
                        lastUpdated: new Date(''';
                category: 'gameplay','';
                priority: 'medium',';
                content: {''
                    title: '特殊バブルの種類','';
                    description: '様々な効果を持つ特殊バブルの解説',';
                    bubbleTypes: [{''
                            name: 'レインボーバブル','';
                            color: 'rainbow','';
                            effect: 'ボーナスタイム発動',';
                            points: 50,'';
                            strategy: 'すぐにポップしてボーナスタイムを活用','';
                            visual: 'rainbow-effect','';
                            rarity: 'rare',';
                            conditions: [' }]'
                                { type: 'score', value: 1000, operator: 'gte' }]
                            ];
                        },'
                        { ''
                            name: 'ピンクバブル','';
                            color: 'pink','';
                            effect: 'HP回復',';
                            points: 20,'';
                            strategy: 'HPが少ない時に優先的にポップ','';
                            visual: 'heal-effect','';
                            rarity: 'common' }
                        },'
                        { ''
                            name: 'クロックバブル','';
                            color: 'blue','';
                            effect: '時間停止',';
                            points: 30,'';
                            strategy: '忙しい時にポップして時間を稼ぐ','';
                            visual: 'time-stop-effect','';
                            rarity: 'uncommon' }
                        },'
                        { ''
                            name: 'エレクトリックバブル','';
                            color: 'yellow','';
                            effect: '画面震動（妨害）',';
                            points: 15,'';
                            strategy: '注意してポップ、震動に備える','';
                            visual: 'electric-effect',';
                            warning: true,'';
                            rarity: 'common' }
                        },'
                        { ''
                            name: 'ポイズンバブル','';
                            color: 'green','';
                            effect: 'ダメージ',';
                            points: 5,'';
                            strategy: '避けるか、やむを得ない場合のみ','';
                            visual: 'poison-effect',';
                            warning: true,'';
                            rarity: 'common' }
                        },'
                        { ''
                            name: 'ボスバブル','';
                            color: 'red','';
                            effect: '大型、高HP',';
                            points: 100,'';
                            strategy: '複数回クリックが必要、高得点','';
                            visual: 'boss-effect','';
                            rarity: 'epic' }
                        }'
                    ],'';
                    relatedTopics: ['gameBasics', 'scoring', 'strategy'],'';
                    difficulty: 'intermediate',';
                    metadata: { readingTime: 8,''
                        tags: ['特殊バブル', '効果', '戦略', 'レインボー', 'ボス'],'';
                        lastUpdated: new Date(''';
                category: 'advanced','';
                priority: 'low',';
                content: {''
                    title: '高得点のための戦略','';
                    description: '効率的なゲームプレイのコツとテクニック',';
                    strategies: [{''
                            name: 'コンボ重視戦略','';
                            description: '連続ポップでコンボを狙う',';
                            techniques: ['';
                                '小さいバブルから順番にポップ','';
                                'グループになったバブルを狙う',']';
                                'ミスを避けてコンボを維持']';
                            ],'';
                            difficulty: 'intermediate','';
                            effectiveness: 'high',';
                            timeRequired: 30,'';
                            skillLevel: 'intermediate',';
                            situations: [{''
                                    scenario: 'バブルが密集している時','';
                                    recommendation: '中央から外側に向かってポップ',
                                    priority: 1 }]
                                }]
                            ];
                        },'
                        { ''
                            name: '特殊バブル活用戦略','';
                            description: '特殊バブルの効果を最大限活用',';
                            techniques: ['';
                                'レインボーバブルを見つけたらすぐポップ','';
                                'HPが減ったらピンクバブルを優先',']';
                                '忙しい時はクロックバブルで時間稼ぎ']';
                            ],'';
                            difficulty: 'advanced','';
                            effectiveness: 'very high',';
                            timeRequired: 45,'';
                            skillLevel: 'advanced' }
                        },'
                        { ''
                            name: 'リスク管理戦略','';
                            description: 'ダメージを最小限に抑える',';
                            techniques: ['';
                                'ポイズンバブルは可能な限り避ける','';
                                'エレクトリックバブルの震動に備える',']';
                                'HP管理を常に意識する']';
                            ],'';
                            difficulty: 'intermediate','';
                            effectiveness: 'medium',';
                            timeRequired: 20,'';
                            skillLevel: 'beginner' }
                        }'
                    ],'';
                    relatedTopics: ['specialBubbles', 'scoring'],'';
                    difficulty: 'advanced',';
                    metadata: { readingTime: 12,''
                        tags: ['戦略', '高得点', 'コンボ', 'リスク管理'],'';
                        lastUpdated: new Date(''';
                category: 'settings','';
                priority: 'high',';
                content: {''
                    title: 'アクセシビリティ機能','';
                    description: 'ゲームをより快適にプレイするための機能',';
                    features: [{''
                            name: 'キーボード操作','';
                            description: 'マウスを使わずにキーボードでプレイ',';
                            shortcuts: {''
                                'Tab': 'バブル選択','';
                                'Enter': 'バブルポップ','';
                                'Space': 'ゲーム一時停止','';
                                'F1': 'ヘルプ表示' }'
                            },''
                            category: 'motor',
                            enabled: true;
                        },'
                        { ''
                            name: 'スクリーンリーダー対応','';
                            description: '音声でゲーム状況を確認',';
                            features: ['';
                                'バブル位置の音声案内','';
                                'スコア・HP・時間の読み上げ',']';
                                'ゲーム状況の詳細説明']';
                            ],'';
                            category: 'visual',
                            enabled: true }
                        },'
                        { ''
                            name: '視覚サポート','';
                            description: '見やすさを向上させる機能',';
                            options: ['';
                                '高コントラスト表示','';
                                'カラーブラインド対応','';
                                'フォントサイズ調整',']';
                                'アニメーション軽減']';
                            ],'';
                            category: 'visual',
                            enabled: false }
                        },'
                        { ''
                            name: '時間調整','';
                            description: 'プレイ時間の調整機能',';
                            options: ['';
                                'ゲーム速度調整','';
                                '一時停止機能','';
                                '時間制限延長',']';
                                '自動保存機能']';
                            ],'';
                            category: 'cognitive',
                            enabled: true }
                        }'
                    ],'';
                    relatedTopics: ['settings', 'controls'],'';
                    difficulty: 'beginner',';
                    metadata: { readingTime: 6,')'
                        tags: ['アクセシビリティ', 'キーボード', '視覚', '時間調整']);
                        lastUpdated: new Date(); }
                    }
                }
            }
        };
    }

    /**
     * 検索インデックスを構築
     */
    buildSearchIndexes(): void { this.searchIndex.clear();
        this.categoryIndex.clear();
        this.difficultyIndex.clear();
        this.indexedEntries.clear();

        Object.entries(this.helpDatabase).forEach(([key, item]) => { 
            // カテゴリ別インデックス
            this.updateCategoryIndex(key, item);
            
            // 難易度別インデックス
            this.updateDifficultyIndex(key, item);
            
            // 検索用キーワードインデックス }
            this.updateSearchIndex(key, item); }
        });

        this.lastRebuild = new Date();
    }

    /**
     * カテゴリインデックスの更新
     */
    private updateCategoryIndex(key: string, item: HelpItem): void { const category = item.category;
        
        if(!this.categoryIndex.has(category) {
        
            this.categoryIndex.set(category, {
                category,);
                keys: []);
                count: 0,);
        }
                priority: item.priority); }
        }
        
        const index = this.categoryIndex.get(category)!;
        index.keys.push(key);
        index.count++;
    }

    /**
     * 難易度インデックスの更新
     */
    private updateDifficultyIndex(key: string, item: HelpItem): void { const difficulty = item.content.difficulty;
        
        if(!this.difficultyIndex.has(difficulty) {
        
            this.difficultyIndex.set(difficulty, {
                difficulty,);
                keys: []);
                count: 0,);
        }
                averageComplexity: 0); }
        }
        
        const index = this.difficultyIndex.get(difficulty)!;
        index.keys.push(key);
        index.count++;
        
        // 複雑度の計算（仮の実装）
        const complexity = this.calculateContentComplexity(item.content);
        index.averageComplexity = (index.averageComplexity * (index.count - 1) + complexity) / index.count;
    }

    /**
     * 検索インデックスの更新
     */
    private updateSearchIndex(key: string, item: HelpItem): void { const keywords = this.extractKeywords(item);
        
        this.indexedEntries.set(key, {)
            key,);
            keywords);
            weight: this.calculateContentWeight(item),
            lastIndexed: new Date(); }
        });
        
        keywords.forEach(keyword => {  );
            if(!this.searchIndex.has(keyword) { }
                this.searchIndex.set(keyword, []); }
            }
            this.searchIndex.get(keyword)!.push(key);
        });
    }

    /**
     * コンテンツの複雑度を計算
     */
    private calculateContentComplexity(content: HelpContent): number { let complexity = 0;
        
        // 基本的な複雑度
        complexity += content.steps? .length || 0;
        complexity += content.sections?.length || 0;
        complexity += content.bubbleTypes?.length || 0;
        complexity += content.strategies?.length || 0;
        
        // 難易度による重み付け
        const difficultyWeights = { : undefined
            beginner: 1,
            intermediate: 2,
            advanced: 3,
            expert: 4 }
        },
        
        complexity *= difficultyWeights[content.difficulty] || 1;
        
        return complexity;
    }

    /**
     * コンテンツの重みを計算
     */
    private calculateContentWeight(item: HelpItem): number { let weight = 1;
        
        // 優先度による重み付け
        const priorityWeights = {
            low: 0.5,
            medium: 1,
            high: 2,
            critical: 3 }
        },
        
        weight *= priorityWeights[item.priority] || 1;
        
        // カテゴリによる重み付け
        const categoryWeights = { basic: 2,
            gameplay: 1.5,
            advanced: 1,
            settings: 1.2,
            troubleshooting: 1.8 }
        },
        
        weight *= categoryWeights[item.category] || 1;
        
        return weight;
    }

    /**
     * ヘルプコンテンツからキーワードを抽出
     */
    extractKeywords(item: HelpItem): string[] { const keywords = new Set<string>();
        const content = item.content;
        
        // タイトルと説明からキーワードを抽出
        this.tokenize(content.title).forEach(token => keywords.add(token);
        this.tokenize(content.description).forEach(token => keywords.add(token);
        
        // 関連トピック
        if(content.relatedTopics) {
            
        }
            content.relatedTopics.forEach(topic => keywords.add(topic); }
        }
        
        // メタデータのタグ
        if(content.metadata? .tags) {
            content.metadata.tags.forEach(tag => );
                this.tokenize(tag).forEach(token => keywords.add(token);
        }
            ); }
        }
        
        // セクションからのキーワード
        if(content.sections) {
            content.sections.forEach(section => { );
        }
                this.tokenize(section.title).forEach(token => keywords.add(token); }
                this.tokenize(section.content).forEach(token => keywords.add(token); }
            });
        }
        
        // ステップからのキーワード
        if(content.steps) {
            content.steps.forEach(step => { );
        }
                this.tokenize(step.title).forEach(token => keywords.add(token); }
                this.tokenize(step.description).forEach(token => keywords.add(token); }
            });
        }
        
        return Array.from(keywords).filter(keyword => );
            keyword.length >= SEARCH_INDEX_CONFIG.minKeywordLength &&);
            keyword.length <= SEARCH_INDEX_CONFIG.maxKeywordLength &&);
            !SEARCH_INDEX_CONFIG.stopWords.includes(keyword);
    }

    /**
     * テキストをトークン化
     */ : undefined
    tokenize(text: string): string[] { return sanitizeKeyword(text)
            .split(/\s+/);
            .filter(token => token.length > 1); }
    }

    /**
     * ヘルプコンテンツを検索
     */
    searchContent(query: string, options: SearchOptions = { ): SearchResult[] { }
        const mergedOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
        const results = new Map<string, SearchResult>();
        const keywords = this.tokenize(query);
        
        keywords.forEach(keyword => {  );
            if(this.searchIndex.has(keyword) {
                this.searchIndex.get(keyword)!.forEach(key => {)
                    const item = this.helpDatabase[key]);
                    if (!item) return;
                    
                    // フィルタリング
                    if(this.shouldExcludeFromResults(item, mergedOptions) return;
                    
                    const score = this.calculateSearchScore(keyword, key, query);
                    const matches = this.findMatches(keyword, item);
                    
                    if(results.has(key) {
                        const existing = results.get(key)!;
            }
                        existing.score += score; }
                        existing.matches.push(...matches); }
                    } else {  results.set(key, {
                            key,);
                            item);
                            score,) }
                            matches); }
                    }
                });
            }
        });
        
        return Array.from(results.values();
            .sort((a, b) => b.score - a.score);
            .slice(0, mergedOptions.maxResults);
    }

    /**
     * 結果から除外すべきかチェック
     */
    private shouldExcludeFromResults(item: HelpItem, options: SearchOptions): boolean { if (options.category && item.category !== options.category) return true;
        if (options.difficulty && item.content.difficulty !== options.difficulty) return true;
        if (options.priority && item.priority !== options.priority) return true;
        
        if(options.tags && options.tags.length > 0) {
        
            const itemTags = item.content.metadata? .tags || [];
        
        }
            if(!options.tags.some(tag => itemTags.includes(tag)) return true; }
        }
        
        return false;
    }

    /**
     * 検索スコアを計算
     */ : undefined
    private calculateSearchScore(keyword: string, key: string, originalQuery: string): number { const entry = this.indexedEntries.get(key);
        if (!entry) return 0;
        
        let score = entry.weight;
        
        // キーワードマッチの重み付け
        if(entry.keywords.includes(keyword) {
            
        }
            score *= KEYWORD_WEIGHTS.title; }
        }
        
        // 完全一致ボーナス
        if(keyword === originalQuery.toLowerCase() { score *= 1.5; }
        }
        
        return score;
    }

    /**
     * マッチングを検出
     */
    private findMatches(keyword: string, item: HelpItem): SearchMatch[] { const matches: SearchMatch[] = [],
        const content = item.content;
        
        // タイトルでのマッチ'
        const titleIndex = content.title.toLowerCase().indexOf(keyword);''
        if(titleIndex !== -1') {'
            matches.push({''
                field: 'title',);
                text: keyword);
                position: titleIndex,);
        }
                context: content.title); }
        }
        
        // 説明でのマッチ'
        const descIndex = content.description.toLowerCase().indexOf(keyword);''
        if(descIndex !== -1') {'
            matches.push({''
                field: 'description',);
                text: keyword);
                position: descIndex,);
        }
                context: content.description); }
        }
        
        return matches;
    }

    /**
     * カテゴリ別ヘルプを取得
     */
    getByCategory(category: HelpCategory): string[] { const index = this.categoryIndex.get(category);
        return index ? [...index.keys] : []; }
    }

    /**
     * 難易度別ヘルプを取得
     */
    getByDifficulty(difficulty: DifficultyLevel): string[] { const index = this.difficultyIndex.get(difficulty);
        return index ? [...index.keys] : []; }
    }

    /**
     * ヘルプコンテンツを取得
     */
    getContent(key: string): HelpItem | null { return this.helpDatabase[key] || null; }
    }

    /**
     * 関連ヘルプを取得
     */
    getRelatedContent(key: string, options: RelatedContentOptions = { ): HelpItem[] {
        const content = this.getContent(key);
        if(!content || !content.content.relatedTopics) {
            
        }
            return []; }
        }
        
        const maxResults = options.maxResults || 5;
        let relatedItems = content.content.relatedTopics;
            .map(topic => this.getContent(topic);
            .filter((item): item is HelpItem => item !== null);
        
        // 同じカテゴリのアイテムを含めるかどうか
        if(options.includeSameCategory) {
            const sameCategoryItems = this.getByCategory(content.category);
                .filter(k => k !== key);
                .map(k => this.getContent(k);
                .filter((item): item is HelpItem => item !== null);
                .slice(0, 2);
            
        }
            relatedItems = relatedItems.concat(sameCategoryItems); }
        }
        
        // より高い難易度のアイテムを含めるかどうか
        if(!options.includeHigherDifficulty) {
            const currentDifficultyLevel = DIFFICULTY_LEVELS.indexOf(content.content.difficulty);
            relatedItems = relatedItems.filter(item => );
                DIFFICULTY_LEVELS.indexOf(item.content.difficulty) <= currentDifficultyLevel;
        }
            ); }
        }
        
        // 重複を削除して制限
        const uniqueItems = Array.from(new Set(relatedItems);
        return uniqueItems.slice(0, maxResults);
    }

    /**
     * 優先度順でヘルプを取得
     */
    getByPriority(priority: HelpPriority): string[] { return Object.keys(this.helpDatabase)
            .filter(key => this.helpDatabase[key].priority === priority);
            .sort((a, b) => this.helpDatabase[a].category.localeCompare(this.helpDatabase[b].category); }
    }

    /**
     * 全ヘルプキーを取得
     */
    getAllKeys(): string[] { return Object.keys(this.helpDatabase); }
    }

    /**
     * 全カテゴリを取得
     */
    getAllCategories(): HelpCategory[] { return Array.from(this.categoryIndex.keys(); }
    }

    /**
     * 全難易度を取得
     */
    getAllDifficulties(): DifficultyLevel[] { return Array.from(this.difficultyIndex.keys(); }
    }

    /**
     * コンテンツ統計を取得
     */
    getContentStatistics(): ContentStatistics { const totalItems = Object.keys(this.helpDatabase).length;
         }
        const categoryCounts = {} as Record<HelpCategory, number>;
        this.categoryIndex.forEach((index, category) => { categoryCounts[category] = index.count; }
        });
        
        const difficultyCounts = {} as Record<DifficultyLevel, number>;
        this.difficultyIndex.forEach((index, difficulty) => { difficultyCounts[difficulty] = index.count; }
        });
        
        const priorityCounts = {} as Record<HelpPriority, number>;
        Object.values(this.helpDatabase).forEach(item => {  ); }
            priorityCounts[item.priority] = (priorityCounts[item.priority] || 0) + 1; }
        });
        
        const totalReadingTime = Object.values(this.helpDatabase);
            .reduce((sum, item) => sum + (item.content.metadata? .readingTime || 0), 0); : undefined
        const averageReadingTime = totalItems > 0 ? totalReadingTime / totalItems: 0,
        
        return { totalItems,
            categoryCounts,
            difficultyCounts,
            priorityCounts,
            averageReadingTime, };
            mostSearchedTopics: [] // TODO: 実装が必要 }
        },
    }

    /**
     * コンテンツの妥当性を検証
     */'
    validateContent(key: string): ContentValidation { const item = this.getContent(key);''
        if(!item') {
            
        }
            return {  };'
                isValid: false,' }'
                errors: [{ field: 'key', message: 'Content not found', severity: 'critical' }],
                warnings: [];
            },
        }
        
        const errors: ValidationError[] = [],
        const warnings: ValidationWarning[] = [],
        ';
        // 必須フィールドのチェック''
        if (!item.content.title.trim()') { ''
            errors.push({ field: 'title', message: 'Title is required', severity: 'high' ); }
        }'
        '';
        if (!item.content.description.trim()') { ''
            errors.push({ field: 'description', message: 'Description is required', severity: 'high' ); }
        }
        ';
        // 読みやすさのチェック''
        if(item.content.title.length > 100') {'
            warnings.push({''
                field: 'title',')';
                message: 'Title is very long',');
        }'
                suggestion: 'Consider shortening the title to improve readability'); }
        }
        
        return { isValid: errors.length === 0,
            errors, };
            warnings }
        };
    }

    /**
     * インデックスの再構築が必要かチェック
     */
    shouldRebuildIndex(): boolean { const hoursSinceRebuild = (Date.now() - this.lastRebuild.getTime() / (1000 * 60 * 60);
        return hoursSinceRebuild > 24 || this.indexedEntries.size > SEARCH_INDEX_CONFIG.rebuildThreshold; }
    }

    /**
     * インデックスの再構築
     */
    rebuildIndexIfNeeded(): void { if(this.shouldRebuildIndex() {
            this.buildSearchIndexes(); }
        }
    }

    /**
     * コンテンツの追加
     */
    addContent(key: string, item: HelpItem): boolean { if (this.helpDatabase[key]) {
            return false; // 既に存在 }
        }
        
        this.helpDatabase[key] = item;
        this.updateCategoryIndex(key, item);
        this.updateDifficultyIndex(key, item);
        this.updateSearchIndex(key, item);
        
        return true;
    }

    /**
     * コンテンツの更新
     */
    updateContent(key: string, item: HelpItem): boolean { if (!this.helpDatabase[key]) {
            return false; // 存在しない }
        }
        
        this.helpDatabase[key] = item;
        this.buildSearchIndexes(); // 完全再構築
        
        return true;
    }

    /**
     * コンテンツの削除
     */
    removeContent(key: string): boolean { if (!this.helpDatabase[key]) {
            return false; // 存在しない }
        }
        ';
        delete this.helpDatabase[key];''
        this.buildSearchIndexes(')');