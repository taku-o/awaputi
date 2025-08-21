import { BaseComponent } from '../BaseComponent.js';

// Type definitions
interface Suggestion { action: string,
    code?: string;
    description: string,
    priority: 'low' | 'medium' | 'high';
    category: string;
    score?: number ,}

interface Pattern { id: string;
    name: string,
    category: string,
    severity: 'low' | 'medium' | 'high' | 'critical' ,}

interface Test { name: string;
    error?: string;
    [key: string]: any, }

interface ContextualSuggestion { action: string,
    code: string;
    description: string ,}

interface ComponentPattern { pattern: RegExp;
    name: string }

interface SuggestionStatistics { totalPatterns: number;
    totalSuggestions: number;
    suggestionsByCategory: Record<string, number>;
    suggestionsByPriority: Record<string, number> }

interface MainController { [key: string]: any, }

/**
 * DebugSuggestionEngine - デバッグ提案生成・テンプレート処理コンポーネント
 */
export class DebugSuggestionEngine extends BaseComponent { private debugSuggestions: Map<string, Suggestion[]>;
    private contextualSuggestions: Map<string, Record<string, ContextualSuggestion[]>>;

    constructor(mainController: MainController) {'

        super(mainController, 'DebugSuggestionEngine);
        this.debugSuggestions = new Map<string, Suggestion[]>();
    }
        this.contextualSuggestions = new Map<string, Record<string, ContextualSuggestion[]>>(); }
    }

    async _doInitialize(): Promise<void> { this.setupDebugSuggestions();
        this.setupContextualSuggestions(); }

    /**
     * デバッグ提案システムを設定'
     */''
    setupDebugSuggestions()';
        this.debugSuggestions.set('null_reference', [{ ')'
                action: 'Add null checks''),' }

                code: 'if(object && object.property) { /* use object.property */ }',''
                description: 'オブジェクトとプロパティの存在確認を追加',
                priority: 'high',
                category: 'safety';
            },

            { ''
                action: 'Use optional chaining',
                code: 'object? .property?.method?.(')', : undefined'';
                description: 'オプショナルチェーニングで安全にアクセス',
                priority: 'high',
                category: 'modern' ,};
            { ''
                action: 'Initialize with default',
                code: 'const value = object.property || defaultValue',
                description: 'デフォルト値を使用してフォールバック',
                priority: 'medium',
                category: 'safety' ,};
            { ''
                action: 'Use nullish coalescing',
                code: 'const value = object.property ? ? defaultValue', : undefined'';
                description: 'null/undefinedの場合のみデフォルト値を使用',
                priority: 'medium',
                category: 'modern' ,}]'
            }']'
        ]'),

        this.debugSuggestions.set('assertion_failure', [{ ')'
                action: 'Add debug logging''),
                code: 'console.log("Expected:", expected, "Actual:", actual)',
                description: '期待値と実際の値をログ出力して比較',
                priority: 'high',
                category: 'debugging' ,};
            { ''
                action: 'Use deep equality',
                code: 'expect(result).toEqual(expected) // not toBe',
                description: 'オブジェクトの比較にはtoEqualを使用',
                priority: 'high',
                category: 'testing' ,};
            { ''
                action: 'Check data types',
                code: 'console.log(typeof actual, typeof expected)',
                description: 'データ型の違いを確認',
                priority: 'medium',
                category: 'debugging' ,};
            { ''
                action: 'Serialize objects for comparison',
                code: 'console.log(JSON.stringify({expected, actual), null, 2)')',''
                description: 'オブジェクトを可視化して詳細比較',
                priority: 'medium',
                category: 'debugging' ,}]'
            }']'
        ]'),

        this.debugSuggestions.set('async_error', [{ ')'
                action: 'Add await''),
                code: 'const result = await asyncFunction(')',
                description: '非同期関数の完了を待つ',
                priority: 'high',
                category: 'async' ,};
            { ''
                action: 'Handle promise rejection',' }

                code: 'try { await asyncFunc( } catch (error) { /* handle */ }',''
                description: 'Promise拒否のエラーハンドリングを追加',
                priority: 'high',
                category: 'error_handling';
            },

            { ''
                action: 'Use Promise.allSettled',
                code: 'const results = await Promise.allSettled(promises)',
                description: '並行処理の完了を確実に待つ',
                priority: 'medium',
                category: 'async' ,};
            { ]'
                action: 'Add timeout handling',']';
                code: 'await Promise.race([asyncFunc(), timeout(5000)]')',
                description: 'タイムアウト処理を追加',
                priority: 'medium',
                category: 'reliability' ,}

            }''
        ]'),

        this.debugSuggestions.set('type_error', [{ ');

                action: 'Check function existence'');' }

                code: 'if (typeof, obj.method === "function") { obj.method(" }',''
                description: '関数の存在確認を追加',
                priority: 'high',
                category: 'safety';
            },

            { ''
                action: 'Validate object structure',' }

                code: 'if(obj && obj.constructor === ExpectedClass) { /* use obj */ }',''
                description: 'オブジェクトの型を確認',
                priority: 'high',
                category: 'validation';
            },

            { ''
                action: 'Use type guards',
                code: 'const isValidObject = (obj') => obj && typeof obj === "object"',
                description: 'タイプガード関数を作成',
                priority: 'medium',
                category: 'validation' ,}]'
            }']'
        ]'),

        this.debugSuggestions.set('timeout_error', [{ ')'
                action: 'Increase timeout''),
                code: 'jest.setTimeout(10000) // 10 seconds',
                description: 'テストタイムアウト値を増加',
                priority: 'high',
                category: 'testing' ,};
            { ''
                action: 'Optimize performance',
                code: '// Use object pools, reduce complexity',
                description: 'パフォーマンスを最適化',
                priority: 'medium',
                category: 'performance' ,};
            { ''
                action: 'Mock heavy operations',' }

                code: 'jest.mock("./heavyModule", () => ({ /* mock */ }")',''
                description: '重い処理をモック化',
                priority: 'medium',
                category: 'testing]';
            }']'
        ]'),

        this.debugSuggestions.set('memory_error', [{ ')'
                action: 'Use object pools''),
                code: 'const pool = new ObjectPool(ExpectedClass)',
                description: 'オブジェクトプールでメモリ効率化',
                priority: 'high',
                category: 'performance' ,};
            { ''
                action: 'Clean up resources',
                code: 'window.addEventListener("beforeunload", cleanup)',
                description: 'リソースのクリーンアップ処理を追加',
                priority: 'high',
                category: 'memory' ,};
            { ''
                action: 'Monitor memory usage',
                code: 'console.log(performance.memory)',
                description: 'メモリ使用量を監視',
                priority: 'medium',
                category: 'monitoring' ,}]'
            }']'
        ]'),

        this.debugSuggestions.set('configuration_error', [{ ')'
                action: 'Validate configuration''),
                code: 'const isValid = validateConfig(config)',
                description: '設定値の検証を追加',
                priority: 'high',
                category: 'validation' ,};
            { ''
                action: 'Use default fallbacks',
                code: 'const value = config.value ? ? DEFAULT_VALUE', : undefined'';
                description: 'デフォルト設定のフォールバックを追加',
                priority: 'medium',
                category: 'safety' ,};
            { ''
                action: 'Log configuration state',
                code: 'console.log("Config:", JSON.stringify(config, null, 2))',
                description: '設定状態をログ出力',
                priority: 'medium',
                category: 'debugging' ,}]
            }]
        ]);
    }

    /**
     * コンテキスト特化の提案を設定'
     */''
    setupContextualSuggestions()';
        this.contextualSuggestions.set('BubbleManager', { null_reference: [{)'
                    action: 'Check GameEngine initialization''),
                    code: 'await gameEngine.initialize(); console.log(gameEngine.bubbleManager)',''
                    description: 'GameEngineが初期化されBubbleManagerが作成されているか確認' ,}]
                }]
            ],
            assertion_failure: [{ ''
                    action: 'Verify bubble properties',
                    code: 'console.log("Bubble:", bubble.type, bubble.x, bubble.y)',
                    description: 'バブルのプロパティを確認' ,}]
                }]'
            ]'';
        }'),

        this.contextualSuggestions.set('ScoreManager', { assertion_failure: [{''
                    action: 'Check GameBalance values',' }

                    code: 'import { BUBBLE_CONFIGS } from "./config/GameBalance.js"',''
                    description: 'GameBalance.jsの設定値を確認])';
                }')]'
            ])'),

        this.contextualSuggestions.set('Canvas', { null_reference: [{''
                    action: 'Mock Canvas for tests',
                    code: 'import "jest-canvas-mock"',
                    description: 'テスト環境でCanvas APIをモック化' ,}])
                })]
            ]);
    }

    /**
     * パターンとテストに基づいて提案を生成
     * @param pattern - 識別されたパターン
     * @param test - テスト情報
     * @returns 提案の配列
     */
    generateSuggestions(pattern: Pattern, test: Test): Suggestion[] { if (!pattern) {
            return []; }

        const suggestions: Suggestion[] = [],
        
        // 基本的なパターン提案
        const patternSuggestions = this.debugSuggestions.get(pattern.id) || [];
        suggestions.push(...patternSuggestions);

        // コンテキスト特化提案
        const contextualSuggestions = this.generateContextualSuggestions(pattern, test);
        suggestions.push(...contextualSuggestions);

        // テスト特化提案
        const testSpecificSuggestions = this.generateTestSpecificSuggestions(test);
        suggestions.push(...testSpecificSuggestions);

        // 優先度でソート
        return this.rankSuggestions(suggestions, pattern, test);
    }

    /**
     * コンテキスト特化の提案を生成
     * @param pattern - パターン情報
     * @param test - テスト情報
     * @returns コンテキスト特化提案
     */
    generateContextualSuggestions(pattern: Pattern, test: Test): Suggestion[] { if (!test || !test.name) {
            return []; }

        const suggestions: Suggestion[] = [],
        const componentName = this.extractComponentName(test.name);
        
        if(componentName && this.contextualSuggestions.has(componentName) {
        ';

            const contextSuggestions = this.contextualSuggestions.get(componentName)!;''
            if(contextSuggestions[pattern.id]) {
                suggestions.push(...contextSuggestions[pattern.id].map(s => ({'
                    ...s,)';
                    category: 'contextual',')
        }

                    priority: 'high' as const))); }
}

        return suggestions;
    }

    /**
     * テスト特化の提案を生成
     * @param test - テスト情報
     * @returns テスト特化提案
     */
    generateTestSpecificSuggestions(test: Test): Suggestion[] { if (!test || !test.name) {
            return []; }
';

        const suggestions: Suggestion[] = [],
        const testName = test.name.toLowerCase()';
        if (testName.includes('async'') || testName.includes('promise)) { suggestions.push({)'
                action: 'Add async/await to test''),' }

                code: 'test("async test", async () => { await asyncOperation( })',''
                description: 'テスト関数をasyncにして非同期処理を適切に処理',
                priority: 'high',
                category: 'test_structure''';
            }'),
        }

        if (testName.includes('mock'') || testName.includes('spy)) { suggestions.push({)'
                action: 'Reset mocks between tests''),' }

                code: 'beforeEach(() => { jest.clearAllMocks( })',''
                description: 'テスト間でモックをリセット',
                priority: 'medium',
                category: 'test_hygiene''';
            }'),
        }

        if (testName.includes('render'') || testName.includes('canvas)) { suggestions.push({)'
                action: 'Setup Canvas mock''),
                code: 'Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {...))',''
                description: 'Canvas関連テストにモックを設定',
                priority: 'high',
                category: 'test_setup' ,});
        }
;
        return suggestions;
    }

    /**
     * 提案の優先度付けとランキング
     * @param suggestions - 提案配列
     * @param pattern - パターン情報
     * @param test - テスト情報
     * @returns ランク付けされた提案'
     */''
    rankSuggestions(suggestions: Suggestion[], pattern: Pattern, test: Test): Suggestion[] { ' }'

        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        
        return suggestions;
            .map(suggestion => ({ )
                ...suggestion);
                score: this.calculateSuggestionScore(suggestion, pattern, test })
            .sort((a, b) => {  // 優先度でソート
                const priorityDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
                if (priorityDiff !== 0) return priorityDiff;
                
                // スコアでソート }
                return (b.score || 0) - (a.score || 0);)
            .slice(0, 8); // 最大8件の提案
    }

    /**
     * 提案のスコアを計算
     * @param suggestion - 提案
     * @param pattern - パターン情報
     * @param test - テスト情報
     * @returns スコア
     */''
    calculateSuggestionScore(suggestion: Suggestion, pattern: Pattern, test: Test): number { let score = 0;
';

        // 基本スコア' }'

        const priorityScore = { 'high': 10, 'medium': 5, 'low': 2 };
        score += priorityScore[suggestion.priority] || 2;
';
        // カテゴリボーナス
        if (suggestion.category === 'contextual'') score += 5;''
        if (suggestion.category === 'safety'') score += 3;''
        if (suggestion.category === 'debugging'') score += 2;
';
        // パターン適合度
        if(pattern && pattern.severity === 'high) score += 3;

        return score;
    }

    /**
     * テスト名からコンポーネント名を抽出
     * @param testName - テスト名
     * @returns コンポーネント名
     */'
    extractComponentName(testName: string): string | null { ''
        if(!testName) return null;
';

        const componentPatterns: ComponentPattern[] = [' }'

            { pattern: /bubblemanager/i, name: 'BubbleManager' ,},''
            { pattern: /scoremanager/i, name: 'ScoreManager' ,},''
            { pattern: /gameengine/i, name: 'GameEngine' ,},''
            { pattern: /canvas/i, name: 'Canvas' ,},''
            { pattern: /rendering/i, name: 'Rendering' ,},''
            { pattern: /particle/i, name: 'ParticleManager' ,},''
            { pattern: /audio/i, name: 'AudioManager' ,},]'
            { pattern: /input/i, name: 'InputManager' ,}]
        ];

        for (const { pattern, name ) of componentPatterns) {
            if(pattern.test(testName) {
                
            }
                return name;

        return null;
    }

    /**
     * 提案テンプレートを取得
     * @param patternId - パターンID
     * @returns 提案テンプレート
     */
    getSuggestionTemplates(patternId: string): Suggestion[] { return this.debugSuggestions.get(patternId) || []; }

    /**
     * 提案の統計情報を取得
     * @returns 統計情報
     */
    getSuggestionStatistics(): SuggestionStatistics { const stats: SuggestionStatistics = {
            totalPatterns: this.debugSuggestions.size;
            totalSuggestions: 0, }
            suggestionsByCategory: {};
            suggestionsByPriority: {};
        for(const, suggestions of, this.debugSuggestions.values() {

            stats.totalSuggestions += suggestions.length;

            for(const, suggestion of, suggestions) {'
                // カテゴリ別統計
                const category = suggestion.category || 'general';''
                stats.suggestionsByCategory[category] = (stats.suggestionsByCategory[category] || 0') + 1;
';
                // 優先度別統計
                const priority = suggestion.priority || 'medium';

        }
                stats.suggestionsByPriority[priority] = (stats.suggestionsByPriority[priority] || 0) + 1; }
}

        return stats;
    }

    /**
     * クリーンアップ
     */
    cleanup(): void { this.debugSuggestions.clear();

        this.contextualSuggestions.clear();''
        super.cleanup(' }'