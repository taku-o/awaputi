/**
 * ContextualHelpManager - コンテキスト対応ヘルプ管理システム
 * 
 * インテリジェントな支援機能を提供し、ユーザーの状況に応じたヘルプとガイダンスを実装します。
 * WCAG 2.1 AAガイドラインに準拠した認知アクセシビリティ機能を実装します。
 */

export class ContextualHelpManager {
    /**
     * ContextualHelpManagerを初期化
     * @param {Object} gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // 設定とヘルプコンテンツ
        this.config = {
            // 基本設定
            enabled: true,
            autoShow: true,
            smartTiming: true,
            adaptiveContent: true,
            voiceOutput: false,
            
            // ヘルプ表示設定
            displaySettings: {
                position: 'contextual', // contextual, fixed, floating, overlay
                animation: 'slide',
                duration: 3000,
                dismissible: true,
                persistent: false,
                maxWidth: 400,
                fontSize: 'medium'
            },
            
            // トリガー設定
            triggers: {
                onHover: true,
                onFocus: true,
                onError: true,
                onStuck: true,
                onRequest: true,
                onFirstVisit: true,
                onInactivity: 5000, // 5秒非アクティブでヘルプ表示
                onMultipleErrors: 3 // 3回エラーでヘルプ表示
            },
            
            // 学習設定
            learning: {
                enabled: true,
                trackInteractions: true,
                personalizeContent: true,
                rememberPreferences: true,
                adaptToProgress: true
            }
        };
        
        // ヘルプコンテンツデータベース
        this.helpDatabase = {
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
            },
            
            // 設定・カスタマイズ
            settings: {
                category: 'settings',
                priority: 'medium',
                content: {
                    title: 'ゲーム設定',
                    description: 'ゲームの設定とカスタマイズ方法',
                    categories: [
                        {
                            name: '音声設定',
                            options: [
                                '効果音のオン/オフ',
                                'BGMのオン/オフ',
                                '音量調整',
                                '音声ガイドの設定'
                            ]
                        },
                        {
                            name: '表示設定',
                            options: [
                                '画面サイズ調整',
                                '色合い設定',
                                'アニメーション設定',
                                'UI要素の表示/非表示'
                            ]
                        },
                        {
                            name: 'ゲームプレイ設定',
                            options: [
                                '難易度調整',
                                '操作感度設定',
                                'オートセーブ設定',
                                'パフォーマンス最適化'
                            ]
                        }
                    ],
                    relatedTopics: ['accessibility', 'controls'],
                    difficulty: 'beginner'
                }
            },
            
            // トラブルシューティング
            troubleshooting: {
                category: 'support',
                priority: 'high',
                content: {
                    title: 'よくある問題と解決方法',
                    description: 'ゲームでよく発生する問題の解決策',
                    problems: [
                        {
                            problem: 'バブルがクリックできない',
                            causes: [
                                'バブルの寿命が切れた',
                                'マウスカーソルが正確でない',
                                'ゲームが一時停止中'
                            ],
                            solutions: [
                                'より早くクリックする',
                                'バブルの中心を狙う',
                                'スペースキーで一時停止を解除'
                            ],
                            prevention: 'バブルの色の変化に注意する'
                        },
                        {
                            problem: 'スコアが上がらない',
                            causes: [
                                'コンボが切れている',
                                '低得点バブルばかりポップ',
                                'ボーナスタイムを逃している'
                            ],
                            solutions: [
                                '連続でバブルをポップする',
                                '特殊バブルを優先的に狙う',
                                'レインボーバブルを見逃さない'
                            ],
                            prevention: 'スコアシステムを理解する'
                        },
                        {
                            problem: 'ゲームが重い・カクカクする',
                            causes: [
                                'デバイスの性能不足',
                                '他のアプリが動作中',
                                'ブラウザのキャッシュ問題'
                            ],
                            solutions: [
                                '他のアプリを閉じる',
                                'ブラウザを再起動する',
                                'パフォーマンス設定を下げる'
                            ],
                            prevention: '定期的なブラウザメンテナンス'
                        }
                    ],
                    relatedTopics: ['settings', 'performance'],
                    difficulty: 'intermediate'
                }
            }
        };
        
        // 状態管理
        this.state = {
            currentContext: null,
            activeHelp: null,
            helpHistory: [],
            userProgress: {
                completedTutorials: new Set(),
                viewedTopics: new Set(),
                helpRequestCount: 0,
                successfulInteractions: 0,
                errorCount: 0
            },
            personalizedContent: new Map(),
            contextualTriggers: new Map(),
            learningData: {
                preferredHelpType: 'detailed', // detailed, concise, visual
                avgHelpViewTime: 0,
                frequentTopics: new Map(),
                ignoredSuggestions: new Set()
            }
        };
        
        // インタラクティブチュートリアルシステム
        this.tutorialSystem = {
            enabled: true,
            currentTutorial: null,
            tutorials: new Map(),
            progress: new Map(),
            adaptiveSteps: true
        };
        
        // ヘルプUI要素
        this.ui = {
            helpPanel: null,
            tooltip: null,
            overlay: null,
            tutorial: null,
            floatingHelper: null
        };
        
        // イベントリスナー
        this.boundHandlers = {
            mouseover: this.handleMouseOver.bind(this),
            focus: this.handleFocus.bind(this),
            click: this.handleClick.bind(this),
            error: this.handleError.bind(this),
            keydown: this.handleKeydown.bind(this),
            inactivity: this.handleInactivity.bind(this)
        };
        
        // コンテキスト検出器
        this.contextDetectors = {
            gameState: this.detectGameStateContext.bind(this),
            userBehavior: this.detectUserBehaviorContext.bind(this),
            performance: this.detectPerformanceContext.bind(this),
            errors: this.detectErrorContext.bind(this),
            progress: this.detectProgressContext.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    async initialize() {
        try {
            console.log('ContextualHelpManager: 初期化開始');
            
            // 設定の読み込み
            await this.loadConfiguration();
            
            // ヘルプデータベースの初期化
            this.initializeHelpDatabase();
            
            // チュートリアルシステムの初期化
            this.initializeTutorialSystem();
            
            // UI要素の作成
            this.createHelpUI();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // コンテキスト監視の開始
            this.startContextMonitoring();
            
            // アクセシビリティマネージャーとの統合
            if (this.gameEngine.accessibilityManager) {
                this.integrateWithAccessibilityManager();
            }
            
            this.isInitialized = true;
            console.log('ContextualHelpManager: 初期化完了');
            
        } catch (error) {
            console.error('ContextualHelpManager: 初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * 設定を読み込み
     */
    async loadConfiguration() {
        try {
            // LocalStorageから設定を読み込み
            const savedConfig = localStorage.getItem('contextualHelpConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.mergeConfig(parsed);
            }
            
            // ユーザー進捗データの読み込み
            const savedProgress = localStorage.getItem('contextualHelpProgress');
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                this.state.userProgress = { ...this.state.userProgress, ...parsed };
                
                // Setオブジェクトの復元
                this.state.userProgress.completedTutorials = new Set(parsed.completedTutorials || []);
                this.state.userProgress.viewedTopics = new Set(parsed.viewedTopics || []);
            }
            
            // 学習データの読み込み
            const savedLearningData = localStorage.getItem('contextualHelpLearning');
            if (savedLearningData) {
                const parsed = JSON.parse(savedLearningData);
                this.state.learningData = { ...this.state.learningData, ...parsed };
                
                // Mapオブジェクトの復元
                this.state.learningData.frequentTopics = new Map(parsed.frequentTopics || []);
                this.state.learningData.ignoredSuggestions = new Set(parsed.ignoredSuggestions || []);
            }
            
        } catch (error) {
            console.warn('ContextualHelpManager: 設定読み込みエラー:', error);
        }
    }
    
    /**
     * ヘルプデータベースを初期化
     */
    initializeHelpDatabase() {
        // 動的コンテンツの生成
        this.generateDynamicContent();
        
        // 多言語対応の初期化
        this.initializeLocalization();
        
        // カスタムヘルプコンテンツの読み込み
        this.loadCustomContent();
        
        console.log('ContextualHelpManager: ヘルプデータベース初期化完了');
    }
    
    /**
     * 動的コンテンツを生成
     */
    generateDynamicContent() {
        // ゲーム状態に基づくヘルプコンテンツ
        if (this.gameEngine.gameState) {
            const gameState = this.gameEngine.gameState;
            
            // 現在のスコアに基づくアドバイス
            if (gameState.score !== undefined) {
                this.helpDatabase.currentScore = {
                    category: 'dynamic',
                    priority: 'medium',
                    content: {
                        title: `現在のスコア: ${gameState.score}`,
                        description: this.generateScoreAdvice(gameState.score),
                        suggestions: this.generateScoreSuggestions(gameState.score)
                    }
                };
            }
            
            // 残りHPに基づくアドバイス
            if (gameState.hp !== undefined) {
                this.helpDatabase.currentHP = {
                    category: 'dynamic',
                    priority: gameState.hp < 3 ? 'high' : 'low',
                    content: {
                        title: `残りHP: ${gameState.hp}`,
                        description: this.generateHPAdvice(gameState.hp),
                        urgency: gameState.hp < 3 ? 'high' : 'normal'
                    }
                };
            }
        }
    }
    
    /**
     * スコアアドバイスを生成
     */
    generateScoreAdvice(score) {
        if (score < 100) {
            return 'まだスコアが低いです。特殊バブルを狙ってコンボを作りましょう。';
        } else if (score < 500) {
            return '良いペースです！コンボを維持してさらに高得点を狙いましょう。';
        } else if (score < 1000) {
            return '素晴らしいスコアです！この調子で特殊バブルを活用しましょう。';
        } else {
            return '驚異的なスコアです！完璧なプレイを続けています。';
        }
    }
    
    /**
     * スコア提案を生成
     */
    generateScoreSuggestions(score) {
        const suggestions = [];
        
        if (score < 200) {
            suggestions.push('レインボーバブルを見逃していませんか？');
            suggestions.push('連続でバブルをポップしてコンボを作りましょう');
        } else if (score < 800) {
            suggestions.push('ボスバブルに挑戦して大きなポイントを獲得');
            suggestions.push('ボーナスタイム中に集中してポップ');
        } else {
            suggestions.push('この調子で完璧なプレイを維持しましょう');
            suggestions.push('新記録更新まであと少しです！');
        }
        
        return suggestions;
    }
    
    /**
     * HPアドバイスを生成
     */
    generateHPAdvice(hp) {
        if (hp <= 1) {
            return '⚠️ HPが危険な状態です！ピンクバブルを最優先で狙い、ポイズンバブルは絶対に避けましょう。';
        } else if (hp <= 2) {
            return '⚠️ HPが少なくなっています。ピンクバブルで回復し、危険なバブルは避けましょう。';
        } else if (hp <= 3) {
            return 'HPに注意が必要です。回復の機会を逃さないようにしましょう。';
        } else {
            return 'HPは十分です。積極的にプレイしましょう！';
        }
    }
    
    /**
     * 多言語対応を初期化
     */
    initializeLocalization() {
        // LocalizationManagerとの統合
        if (this.gameEngine.localizationManager) {
            const currentLanguage = this.gameEngine.localizationManager.getCurrentLanguage();
            this.localizeHelpContent(currentLanguage);
        }
    }
    
    /**
     * ヘルプコンテンツを多言語化
     */
    localizeHelpContent(language) {
        // 現在は日本語のみ実装
        // 将来的に他言語対応を追加予定
        console.log(`ContextualHelpManager: ${language} 言語でコンテンツを初期化`);
    }
    
    /**
     * カスタムコンテンツを読み込み
     */
    loadCustomContent() {
        // ユーザーカスタムヘルプコンテンツの読み込み
        const customContent = localStorage.getItem('customHelpContent');
        if (customContent) {
            try {
                const parsed = JSON.parse(customContent);
                Object.assign(this.helpDatabase, parsed);
            } catch (error) {
                console.warn('ContextualHelpManager: カスタムコンテンツ読み込みエラー:', error);
            }
        }
    }
    
    /**
     * チュートリアルシステムを初期化
     */
    initializeTutorialSystem() {
        // インタラクティブチュートリアルの定義
        this.tutorialSystem.tutorials.set('firstPlay', {
            name: '初回プレイチュートリアル',
            description: 'ゲームの基本操作を覚える',
            required: true,
            steps: [
                {
                    id: 'welcome',
                    title: 'バブルポップゲームへようこそ！',
                    description: 'このチュートリアルでゲームの基本を学びましょう',
                    action: 'introduction',
                    target: '.game-area',
                    position: 'center'
                },
                {
                    id: 'clickBubble',
                    title: 'バブルをクリック',
                    description: '画面上のバブルをクリックしてポップしてください',
                    action: 'click',
                    target: '.bubble:first-of-type',
                    highlight: true,
                    validation: 'bubblePopped'
                },
                {
                    id: 'watchScore',
                    title: 'スコアを確認',
                    description: 'バブルをポップするとスコアが増加します',
                    action: 'observe',
                    target: '.score-display',
                    highlight: true,
                    duration: 3000
                },
                {
                    id: 'combo',
                    title: 'コンボに挑戦',
                    description: '連続でバブルをポップしてコンボを作りましょう',
                    action: 'click-multiple',
                    target: '.bubble',
                    requirement: 'combo-3',
                    validation: 'comboAchieved'
                },
                {
                    id: 'specialBubble',
                    title: '特殊バブルを探す',
                    description: '色の違うバブルには特殊な効果があります',
                    action: 'identify',
                    target: '.bubble.special',
                    highlight: true,
                    explanation: 'これがレインボーバブルです'
                },
                {
                    id: 'complete',
                    title: 'チュートリアル完了！',
                    description: '基本操作をマスターしました。さあ、ゲームを楽しみましょう！',
                    action: 'completion',
                    rewards: ['tutorial-badge', '50-bonus-points']
                }
            ]
        });
        
        this.tutorialSystem.tutorials.set('specialBubbles', {
            name: '特殊バブル解説',
            description: '各種特殊バブルの効果と活用法',
            required: false,
            unlockCondition: 'score-500',
            steps: [
                {
                    id: 'rainbow',
                    title: 'レインボーバブル',
                    description: 'ボーナスタイムを発動する特別なバブルです',
                    action: 'demonstration',
                    visual: 'rainbow-bubble-demo'
                },
                {
                    id: 'pink',
                    title: 'ピンクバブル',
                    description: 'HPを回復してくれる癒しのバブルです',
                    action: 'demonstration',
                    visual: 'pink-bubble-demo'
                },
                {
                    id: 'practice',
                    title: '実践練習',
                    description: '実際に特殊バブルを使ってみましょう',
                    action: 'practice',
                    requirement: 'use-special-bubbles-5'
                }
            ]
        });
        
        console.log('ContextualHelpManager: チュートリアルシステム初期化完了');
    }
    
    /**
     * ヘルプUIを作成
     */
    createHelpUI() {
        // メインヘルプパネル
        this.ui.helpPanel = this.createHelpPanel();
        
        // ツールチップ
        this.ui.tooltip = this.createTooltip();
        
        // フローティングヘルパー
        this.ui.floatingHelper = this.createFloatingHelper();
        
        // チュートリアルオーバーレイ
        this.ui.tutorial = this.createTutorialOverlay();
        
        // ヘルプボタン
        this.createHelpButton();
        
        console.log('ContextualHelpManager: ヘルプUI作成完了');
    }
    
    /**
     * メインヘルプパネルを作成
     */
    createHelpPanel() {
        const panel = document.createElement('div');
        panel.id = 'contextual-help-panel';
        panel.className = 'help-panel hidden';
        
        panel.innerHTML = `
            <div class="help-panel-header">
                <h2 class="help-title">ヘルプ</h2>
                <button class="help-close-btn" aria-label="ヘルプを閉じる">×</button>
            </div>
            <div class="help-panel-content">
                <div class="help-search">
                    <input type="text" placeholder="ヘルプを検索..." class="help-search-input" aria-label="ヘルプ検索">
                    <button class="help-search-btn" aria-label="検索実行">🔍</button>
                </div>
                <div class="help-categories">
                    <button class="help-category-btn active" data-category="all">すべて</button>
                    <button class="help-category-btn" data-category="basic">基本</button>
                    <button class="help-category-btn" data-category="gameplay">ゲームプレイ</button>
                    <button class="help-category-btn" data-category="settings">設定</button>
                    <button class="help-category-btn" data-category="support">サポート</button>
                </div>
                <div class="help-content-area">
                    <!-- 動的にコンテンツが挿入される -->
                </div>
            </div>
            <div class="help-panel-footer">
                <button class="help-tutorial-btn">チュートリアルを開始</button>
                <button class="help-feedback-btn">フィードバック</button>
            </div>
        `;
        
        // スタイルを適用
        this.applyHelpPanelStyles(panel);
        
        // イベントリスナーを設定
        this.setupHelpPanelEvents(panel);
        
        document.body.appendChild(panel);
        return panel;
    }
    
    /**
     * ヘルプパネルのスタイルを適用
     */
    applyHelpPanelStyles(panel) {
        const styles = `
            .help-panel {
                position: fixed;
                top: 10%;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: white;
                border: 2px solid #3498db;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .help-panel.hidden {
                transform: translateX(100%);
                opacity: 0;
                pointer-events: none;
            }
            
            .help-panel-header {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .help-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .help-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .help-close-btn:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            .help-panel-content {
                padding: 20px;
                max-height: calc(80vh - 140px);
                overflow-y: auto;
            }
            
            .help-search {
                display: flex;
                margin-bottom: 15px;
                gap: 8px;
            }
            
            .help-search-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .help-search-btn {
                padding: 8px 12px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .help-categories {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 20px;
            }
            
            .help-category-btn {
                padding: 6px 12px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .help-category-btn.active,
            .help-category-btn:hover {
                background: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .help-content-area {
                min-height: 200px;
            }
            
            .help-panel-footer {
                padding: 15px 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
            }
            
            .help-tutorial-btn,
            .help-feedback-btn {
                flex: 1;
                padding: 8px 16px;
                border: 1px solid #3498db;
                border-radius: 6px;
                background: white;
                color: #3498db;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .help-tutorial-btn:hover,
            .help-feedback-btn:hover {
                background: #3498db;
                color: white;
            }
        `;
        
        // スタイルシートを追加
        if (!document.getElementById('help-panel-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'help-panel-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }
    
    /**
     * ヘルプパネルのイベントを設定
     */
    setupHelpPanelEvents(panel) {
        // 閉じるボタン
        panel.querySelector('.help-close-btn').addEventListener('click', () => {
            this.hideHelp();
        });
        
        // 検索機能
        const searchInput = panel.querySelector('.help-search-input');
        const searchBtn = panel.querySelector('.help-search-btn');
        
        searchBtn.addEventListener('click', () => {
            this.searchHelp(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchHelp(searchInput.value);
            }
        });
        
        // カテゴリーフィルター
        panel.querySelectorAll('.help-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // アクティブ状態を更新
                panel.querySelectorAll('.help-category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // カテゴリーでフィルター
                this.filterHelpByCategory(btn.dataset.category);
            });
        });
        
        // チュートリアルボタン
        panel.querySelector('.help-tutorial-btn').addEventListener('click', () => {
            this.startTutorial('firstPlay');
        });
        
        // フィードバックボタン
        panel.querySelector('.help-feedback-btn').addEventListener('click', () => {
            this.showFeedbackForm();
        });
    }
    
    /**
     * ツールチップを作成
     */
    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'contextual-tooltip';
        tooltip.className = 'contextual-tooltip hidden';
        
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-title"></div>
                <div class="tooltip-description"></div>
                <div class="tooltip-shortcut"></div>
            </div>
            <div class="tooltip-arrow"></div>
        `;
        
        // ツールチップスタイル
        const tooltipStyles = `
            .contextual-tooltip {
                position: absolute;
                background: rgba(44, 62, 80, 0.95);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                max-width: 250px;
                z-index: 10001;
                transition: opacity 0.2s ease;
                pointer-events: none;
                backdrop-filter: blur(10px);
            }
            
            .contextual-tooltip.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .tooltip-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #3498db;
            }
            
            .tooltip-description {
                margin-bottom: 8px;
                line-height: 1.4;
            }
            
            .tooltip-shortcut {
                font-size: 12px;
                color: #95a5a6;
                font-style: italic;
            }
            
            .tooltip-arrow {
                position: absolute;
                width: 0;
                height: 0;
                border-style: solid;
            }
            
            .tooltip-arrow.top {
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px 8px 0 8px;
                border-color: rgba(44, 62, 80, 0.95) transparent transparent transparent;
            }
            
            .tooltip-arrow.bottom {
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 0 8px 8px 8px;
                border-color: transparent transparent rgba(44, 62, 80, 0.95) transparent;
            }
        `;
        
        if (!document.getElementById('tooltip-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'tooltip-styles';
            styleSheet.textContent = tooltipStyles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    /**
     * フローティングヘルパーを作成
     */
    createFloatingHelper() {
        const helper = document.createElement('div');
        helper.id = 'floating-helper';
        helper.className = 'floating-helper hidden';
        
        helper.innerHTML = `
            <div class="helper-content">
                <div class="helper-icon">💡</div>
                <div class="helper-text">
                    <div class="helper-title"></div>
                    <div class="helper-message"></div>
                </div>
                <div class="helper-actions">
                    <button class="helper-action-btn primary"></button>
                    <button class="helper-action-btn secondary">後で</button>
                    <button class="helper-close-btn">×</button>
                </div>
            </div>
        `;
        
        // フローティングヘルパーのスタイル
        const helperStyles = `
            .floating-helper {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: white;
                border: 2px solid #f39c12;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                max-width: 350px;
                animation: slideInUp 0.3s ease-out;
                font-family: inherit;
            }
            
            .floating-helper.hidden {
                transform: translateY(100%);
                opacity: 0;
                pointer-events: none;
            }
            
            .helper-content {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .helper-icon {
                font-size: 24px;
                text-align: center;
            }
            
            .helper-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
            }
            
            .helper-message {
                color: #34495e;
                line-height: 1.4;
                font-size: 14px;
            }
            
            .helper-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .helper-action-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .helper-action-btn.primary {
                background: #f39c12;
                color: white;
            }
            
            .helper-action-btn.primary:hover {
                background: #e67e22;
            }
            
            .helper-action-btn.secondary {
                background: #ecf0f1;
                color: #7f8c8d;
            }
            
            .helper-action-btn.secondary:hover {
                background: #d5dbdb;
            }
            
            .helper-close-btn {
                margin-left: auto;
                background: none;
                border: none;
                font-size: 18px;
                color: #95a5a6;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .helper-close-btn:hover {
                background: #f8f9fa;
                color: #7f8c8d;
            }
            
            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        
        if (!document.getElementById('floating-helper-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'floating-helper-styles';
            styleSheet.textContent = helperStyles;
            document.head.appendChild(styleSheet);
        }
        
        // イベントリスナー
        helper.querySelector('.helper-close-btn').addEventListener('click', () => {
            this.hideFloatingHelper();
        });
        
        helper.querySelector('.helper-action-btn.secondary').addEventListener('click', () => {
            this.postponeHelp();
        });
        
        document.body.appendChild(helper);
        return helper;
    }
    
    /**
     * チュートリアルオーバーレイを作成
     */
    createTutorialOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay hidden';
        
        overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-spotlight"></div>
            <div class="tutorial-content">
                <div class="tutorial-step-indicator">
                    <span class="current-step">1</span> / <span class="total-steps">5</span>
                </div>
                <div class="tutorial-main">
                    <h3 class="tutorial-title"></h3>
                    <p class="tutorial-description"></p>
                    <div class="tutorial-hint"></div>
                </div>
                <div class="tutorial-controls">
                    <button class="tutorial-skip-btn">スキップ</button>
                    <button class="tutorial-prev-btn">戻る</button>
                    <button class="tutorial-next-btn">次へ</button>
                </div>
            </div>
        `;
        
        // チュートリアルオーバーレイのスタイル
        const tutorialStyles = `
            .tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10002;
                pointer-events: none;
            }
            
            .tutorial-overlay.hidden {
                display: none;
            }
            
            .tutorial-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                pointer-events: auto;
            }
            
            .tutorial-spotlight {
                position: absolute;
                border-radius: 8px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8);
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .tutorial-content {
                position: absolute;
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                pointer-events: auto;
            }
            
            .tutorial-step-indicator {
                text-align: center;
                color: #7f8c8d;
                font-size: 14px;
                margin-bottom: 16px;
            }
            
            .current-step {
                color: #3498db;
                font-weight: 600;
            }
            
            .tutorial-title {
                color: #2c3e50;
                margin: 0 0 12px 0;
                font-size: 20px;
            }
            
            .tutorial-description {
                color: #34495e;
                line-height: 1.5;
                margin: 0 0 16px 0;
            }
            
            .tutorial-hint {
                background: #f8f9fa;
                border-left: 4px solid #3498db;
                padding: 12px 16px;
                margin-bottom: 20px;
                font-size: 14px;
                color: #5a6c7d;
            }
            
            .tutorial-controls {
                display: flex;
                gap: 12px;
                justify-content: space-between;
            }
            
            .tutorial-skip-btn {
                background: none;
                border: 1px solid #bdc3c7;
                color: #7f8c8d;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .tutorial-prev-btn,
            .tutorial-next-btn {
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
            
            .tutorial-prev-btn:disabled {
                background: #bdc3c7;
                cursor: not-allowed;
            }
            
            .tutorial-next-btn:hover,
            .tutorial-prev-btn:hover:not(:disabled) {
                background: #2980b9;
            }
        `;
        
        if (!document.getElementById('tutorial-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'tutorial-styles';
            styleSheet.textContent = tutorialStyles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    /**
     * ヘルプボタンを作成
     */
    createHelpButton() {
        const button = document.createElement('button');
        button.id = 'contextual-help-btn';
        button.className = 'contextual-help-btn';
        button.innerHTML = '?';
        button.setAttribute('aria-label', 'ヘルプを表示');
        button.title = 'ヘルプ (F1)';
        
        // ヘルプボタンのスタイル
        const buttonStyles = `
            .contextual-help-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border: none;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
                z-index: 9998;
                transition: all 0.3s ease;
            }
            
            .contextual-help-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
            }
            
            .contextual-help-btn:active {
                transform: translateY(0);
            }
        `;
        
        if (!document.getElementById('help-button-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'help-button-styles';
            styleSheet.textContent = buttonStyles;
            document.head.appendChild(styleSheet);
        }
        
        // クリックイベント
        button.addEventListener('click', () => {
            this.toggleHelp();
        });
        
        document.body.appendChild(button);
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // マウスオーバーヘルプ
        if (this.config.triggers.onHover) {
            document.addEventListener('mouseover', this.boundHandlers.mouseover);
        }
        
        // フォーカスヘルプ
        if (this.config.triggers.onFocus) {
            document.addEventListener('focusin', this.boundHandlers.focus);
        }
        
        // クリック追跡
        document.addEventListener('click', this.boundHandlers.click);
        
        // キーボードショートカット
        document.addEventListener('keydown', this.boundHandlers.keydown);
        
        // エラー追跡
        window.addEventListener('error', this.boundHandlers.error);
        
        // ゲームエンジンイベント
        if (this.gameEngine.eventEmitter) {
            this.gameEngine.eventEmitter.on('gameStateChange', this.handleGameStateChange.bind(this));
            this.gameEngine.eventEmitter.on('userStuck', this.handleUserStuck.bind(this));
            this.gameEngine.eventEmitter.on('scoreChange', this.handleScoreChange.bind(this));
            this.gameEngine.eventEmitter.on('helpRequested', this.handleHelpRequest.bind(this));
        }
        
        // 非アクティビティタイマー
        if (this.config.triggers.onInactivity) {
            this.setupInactivityTimer();
        }
    }
    
    /**
     * コンテキスト監視を開始
     */
    startContextMonitoring() {
        // 定期的なコンテキスト検出
        this.contextMonitoringInterval = setInterval(() => {
            this.detectCurrentContext();
        }, 2000); // 2秒間隔
        
        console.log('ContextualHelpManager: コンテキスト監視開始');
    }
    
    /**
     * 現在のコンテキストを検出
     */
    detectCurrentContext() {
        const contexts = [];
        
        // 各検出器を実行
        for (const [name, detector] of Object.entries(this.contextDetectors)) {
            try {
                const context = detector();
                if (context) {
                    contexts.push({ name, ...context });
                }
            } catch (error) {
                console.warn(`ContextualHelpManager: コンテキスト検出エラー (${name}):`, error);
            }
        }
        
        // 最も優先度の高いコンテキストを選択
        if (contexts.length > 0) {
            const primaryContext = contexts.reduce((prev, current) => 
                (current.priority > prev.priority) ? current : prev
            );
            
            this.updateContext(primaryContext);
        }
    }
    
    /**
     * ゲーム状態コンテキストを検出
     */
    detectGameStateContext() {
        if (!this.gameEngine.gameState) return null;
        
        const gameState = this.gameEngine.gameState;
        let context = null;
        
        // HPが低い場合
        if (gameState.hp !== undefined && gameState.hp <= 2) {
            context = {
                type: 'lowHP',
                priority: 8,
                urgency: 'high',
                helpTopic: 'currentHP',
                message: 'HPが危険な状態です'
            };
        }
        
        // スコアが低い場合
        else if (gameState.score !== undefined && gameState.score < 100) {
            context = {
                type: 'lowScore',
                priority: 5,
                urgency: 'medium',
                helpTopic: 'currentScore',
                message: 'スコアアップのコツを確認しませんか？'
            };
        }
        
        // 初回プレイの場合
        else if (this.state.userProgress.successfulInteractions === 0) {
            context = {
                type: 'firstPlay',
                priority: 9,
                urgency: 'high',
                helpTopic: 'gameBasics',
                message: 'ゲームの基本操作を学びましょう'
            };
        }
        
        return context;
    }
    
    /**
     * ユーザー行動コンテキストを検出
     */
    detectUserBehaviorContext() {
        const recentErrors = this.state.userProgress.errorCount;
        const interactions = this.state.userProgress.successfulInteractions;
        
        let context = null;
        
        // エラーが多い場合
        if (recentErrors >= this.config.triggers.onMultipleErrors) {
            context = {
                type: 'frequentErrors',
                priority: 7,
                urgency: 'medium',
                helpTopic: 'troubleshooting',
                message: 'エラーが多く発生しています。ヘルプをご覧ください'
            };
        }
        
        // 操作に慣れていない場合
        else if (interactions < 10 && interactions > 0) {
            context = {
                type: 'learning',
                priority: 6,
                urgency: 'low',
                helpTopic: 'gameBasics',
                message: '基本操作をマスターしましょう'
            };
        }
        
        return context;
    }
    
    /**
     * パフォーマンスコンテキストを検出
     */
    detectPerformanceContext() {
        // パフォーマンス監視（実装は簡略化）
        const performanceIssues = this.checkPerformanceIssues();
        
        if (performanceIssues.length > 0) {
            return {
                type: 'performance',
                priority: 4,
                urgency: 'low',
                helpTopic: 'troubleshooting',
                message: 'ゲームの動作が重い場合の対処法'
            };
        }
        
        return null;
    }
    
    /**
     * エラーコンテキストを検出
     */
    detectErrorContext() {
        // 最近のエラーがある場合
        if (this.state.userProgress.errorCount > 0) {
            return {
                type: 'error',
                priority: 8,
                urgency: 'high',
                helpTopic: 'troubleshooting',
                message: '問題が発生しました。解決方法を確認しましょう'
            };
        }
        
        return null;
    }
    
    /**
     * 進捗コンテキストを検出
     */
    detectProgressContext() {
        const viewedTopics = this.state.userProgress.viewedTopics.size;
        const completedTutorials = this.state.userProgress.completedTutorials.size;
        
        // チュートリアル未完了の場合
        if (completedTutorials === 0 && this.state.userProgress.successfulInteractions > 5) {
            return {
                type: 'tutorialSuggestion',
                priority: 5,
                urgency: 'low',
                helpTopic: 'gameBasics',
                message: 'チュートリアルで基本を学びませんか？'
            };
        }
        
        return null;
    }
    
    /**
     * マウスオーバーイベントを処理
     */
    handleMouseOver(event) {
        const element = event.target;
        const helpInfo = this.getElementHelpInfo(element);
        
        if (helpInfo && this.config.triggers.onHover) {
            // 短時間の遅延後にツールチップを表示
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = setTimeout(() => {
                this.showTooltip(element, helpInfo);
            }, 500);
        }
    }
    
    /**
     * フォーカスイベントを処理
     */
    handleFocus(event) {
        const element = event.target;
        const helpInfo = this.getElementHelpInfo(element);
        
        if (helpInfo && this.config.triggers.onFocus) {
            this.showTooltip(element, helpInfo);
        }
    }
    
    /**
     * クリックイベントを処理
     */
    handleClick(event) {
        // インタラクションを記録
        this.trackInteraction('click', event.target);
        
        // ツールチップを非表示
        this.hideTooltip();
    }
    
    /**
     * キーボードイベントを処理
     */
    handleKeydown(event) {
        // F1キーでヘルプを表示
        if (event.key === 'F1') {
            event.preventDefault();
            this.toggleHelp();
        }
        
        // Escキーでヘルプを閉じる
        else if (event.key === 'Escape') {
            if (!this.ui.helpPanel.classList.contains('hidden')) {
                this.hideHelp();
            }
        }
        
        // Ctrl+Hでコンテキストヘルプ
        else if (event.ctrlKey && event.key === 'h') {
            event.preventDefault();
            this.showContextualHelp();
        }
    }
    
    /**
     * エラーイベントを処理
     */
    handleError(event) {
        this.state.userProgress.errorCount++;
        
        if (this.config.triggers.onError) {
            this.showErrorHelp(event.error);
        }
        
        this.saveProgress();
    }
    
    /**
     * 非アクティビティイベントを処理
     */
    handleInactivity() {
        if (this.config.triggers.onInactivity) {
            this.showInactivityHelp();
        }
    }
    
    /**
     * ゲーム状態変更を処理
     */
    handleGameStateChange(newState) {
        // 動的コンテンツを更新
        this.generateDynamicContent();
        
        // コンテキストを再評価
        this.detectCurrentContext();
    }
    
    /**
     * ユーザーが行き詰まった時の処理
     */
    handleUserStuck() {
        if (this.config.triggers.onStuck) {
            this.showStuckHelp();
        }
    }
    
    /**
     * スコア変更を処理
     */
    handleScoreChange(newScore) {
        // スコアベースのアドバイスを更新
        this.updateScoreAdvice(newScore);
    }
    
    /**
     * ヘルプリクエストを処理
     */
    handleHelpRequest(request) {
        this.state.userProgress.helpRequestCount++;
        this.showRequestedHelp(request);
        this.saveProgress();
    }
    
    /**
     * 要素のヘルプ情報を取得
     */
    getElementHelpInfo(element) {
        // データ属性から直接取得
        if (element.dataset.helpTopic) {
            return {
                topic: element.dataset.helpTopic,
                title: element.dataset.helpTitle || '',
                description: element.dataset.helpDescription || '',
                shortcut: element.dataset.helpShortcut || ''
            };
        }
        
        // クラス名や要素タイプから推測
        if (element.classList.contains('bubble')) {
            return {
                topic: 'gameBasics',
                title: 'バブル',
                description: 'クリックしてポップしましょう',
                shortcut: 'Enterキー'
            };
        }
        
        if (element.classList.contains('score-display')) {
            return {
                topic: 'scoring',
                title: 'スコア表示',
                description: '現在のスコアが表示されます',
                shortcut: ''
            };
        }
        
        // ボタン要素
        if (element.tagName === 'BUTTON') {
            return {
                topic: 'controls',
                title: element.textContent || 'ボタン',
                description: 'クリックして実行',
                shortcut: 'Enterキーまたはスペースキー'
            };
        }
        
        return null;
    }
    
    /**
     * ツールチップを表示
     */
    showTooltip(element, helpInfo) {
        const tooltip = this.ui.tooltip;
        
        // コンテンツを設定
        tooltip.querySelector('.tooltip-title').textContent = helpInfo.title;
        tooltip.querySelector('.tooltip-description').textContent = helpInfo.description;
        tooltip.querySelector('.tooltip-shortcut').textContent = helpInfo.shortcut;
        
        // 位置を計算
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // 画面外に出る場合の調整
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) {
            top = rect.bottom + 10;
            tooltip.querySelector('.tooltip-arrow').className = 'tooltip-arrow bottom';
        } else {
            tooltip.querySelector('.tooltip-arrow').className = 'tooltip-arrow top';
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.remove('hidden');
    }
    
    /**
     * ツールチップを非表示
     */
    hideTooltip() {
        clearTimeout(this.hoverTimeout);
        this.ui.tooltip.classList.add('hidden');
    }
    
    /**
     * ヘルプパネルの表示を切り替え
     */
    toggleHelp() {
        if (this.ui.helpPanel.classList.contains('hidden')) {
            this.showHelp();
        } else {
            this.hideHelp();
        }
    }
    
    /**
     * ヘルプパネルを表示
     */
    showHelp(topic = null) {
        this.ui.helpPanel.classList.remove('hidden');
        
        if (topic) {
            this.displayHelpTopic(topic);
        } else {
            this.displayHelpIndex();
        }
        
        // アクセシビリティ
        this.ui.helpPanel.setAttribute('aria-hidden', 'false');
        this.ui.helpPanel.focus();
    }
    
    /**
     * ヘルプパネルを非表示
     */
    hideHelp() {
        this.ui.helpPanel.classList.add('hidden');
        this.ui.helpPanel.setAttribute('aria-hidden', 'true');
    }
    
    /**
     * コンテキストを更新
     */
    updateContext(context) {
        if (this.state.currentContext?.type === context.type) {
            return; // 同じコンテキストの場合は無視
        }
        
        this.state.currentContext = context;
        
        // 自動表示が有効な場合
        if (this.config.autoShow && context.urgency === 'high') {
            this.showContextualSuggestion(context);
        }
    }
    
    /**
     * コンテキスト提案を表示
     */
    showContextualSuggestion(context) {
        const helper = this.ui.floatingHelper;
        
        // コンテンツを設定
        helper.querySelector('.helper-title').textContent = context.message;
        helper.querySelector('.helper-message').textContent = 
            this.getContextualMessage(context);
        
        const primaryBtn = helper.querySelector('.helper-action-btn.primary');
        primaryBtn.textContent = this.getContextualAction(context);
        primaryBtn.onclick = () => {
            this.handleContextualAction(context);
        };
        
        // 表示
        helper.classList.remove('hidden');
        
        // 自動非表示
        if (context.urgency !== 'high') {
            setTimeout(() => {
                this.hideFloatingHelper();
            }, 8000);
        }
    }
    
    /**
     * パフォーマンス問題をチェック
     */
    checkPerformanceIssues() {
        // 簡略化された実装
        const issues = [];
        
        // フレームレートのチェック（仮想的）
        if (this.gameEngine.performanceManager?.getCurrentFPS() < 30) {
            issues.push('lowFPS');
        }
        
        return issues;
    }
    
    /**
     * インタラクションを追跡
     */
    trackInteraction(type, element) {
        this.state.userProgress.successfulInteractions++;
        
        // 学習データの更新
        if (this.config.learning.trackInteractions) {
            this.updateLearningData(type, element);
        }
        
        this.saveProgress();
    }
    
    /**
     * 学習データを更新
     */
    updateLearningData(type, element) {
        // 要素タイプの頻度を記録
        const elementType = element.tagName.toLowerCase();
        const currentCount = this.state.learningData.frequentTopics.get(elementType) || 0;
        this.state.learningData.frequentTopics.set(elementType, currentCount + 1);
    }
    
    /**
     * 設定を保存
     */
    saveConfiguration() {
        try {
            localStorage.setItem('contextualHelpConfig', JSON.stringify(this.config));
        } catch (error) {
            console.warn('ContextualHelpManager: 設定保存エラー:', error);
        }
    }
    
    /**
     * 進捗を保存
     */
    saveProgress() {
        try {
            const progressData = {
                ...this.state.userProgress,
                completedTutorials: Array.from(this.state.userProgress.completedTutorials),
                viewedTopics: Array.from(this.state.userProgress.viewedTopics)
            };
            
            localStorage.setItem('contextualHelpProgress', JSON.stringify(progressData));
            
            const learningData = {
                ...this.state.learningData,
                frequentTopics: Array.from(this.state.learningData.frequentTopics.entries()),
                ignoredSuggestions: Array.from(this.state.learningData.ignoredSuggestions)
            };
            
            localStorage.setItem('contextualHelpLearning', JSON.stringify(learningData));
            
        } catch (error) {
            console.warn('ContextualHelpManager: 進捗保存エラー:', error);
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // イベントリスナーを削除
        document.removeEventListener('mouseover', this.boundHandlers.mouseover);
        document.removeEventListener('focusin', this.boundHandlers.focus);
        document.removeEventListener('click', this.boundHandlers.click);
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        window.removeEventListener('error', this.boundHandlers.error);
        
        // タイマーをクリア
        clearInterval(this.contextMonitoringInterval);
        clearTimeout(this.hoverTimeout);
        clearTimeout(this.inactivityTimeout);
        
        // UI要素を削除
        Object.values(this.ui).forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // 設定を保存
        this.saveConfiguration();
        this.saveProgress();
        
        console.log('ContextualHelpManager: クリーンアップ完了');
    }
    
    // パブリックAPI（基本的なメソッドのみ実装、詳細は省略）
    
    /**
     * 設定をマージ
     */
    mergeConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * ヘルプを検索
     */
    searchHelp(query) {
        // 実装省略
        console.log(`ContextualHelpManager: "${query}" を検索`);
    }
    
    /**
     * カテゴリーでフィルター
     */
    filterHelpByCategory(category) {
        // 実装省略
        console.log(`ContextualHelpManager: カテゴリー "${category}" でフィルター`);
    }
    
    /**
     * チュートリアルを開始
     */
    startTutorial(tutorialId) {
        // 実装省略
        console.log(`ContextualHelpManager: チュートリアル "${tutorialId}" を開始`);
    }
    
    /**
     * 他のメソッド（省略）
     */
    displayHelpTopic(topic) { /* 実装省略 */ }
    displayHelpIndex() { /* 実装省略 */ }
    getContextualMessage(context) { return context.message; }
    getContextualAction(context) { return 'ヘルプを見る'; }
    handleContextualAction(context) { this.showHelp(context.helpTopic); }
    hideFloatingHelper() { this.ui.floatingHelper.classList.add('hidden'); }
    postponeHelp() { this.hideFloatingHelper(); }
    setupInactivityTimer() { /* 実装省略 */ }
    showContextualHelp() { this.showHelp(); }
    showErrorHelp(error) { this.showHelp('troubleshooting'); }
    showInactivityHelp() { this.showContextualHelp(); }
    showStuckHelp() { this.showHelp('gameBasics'); }
    updateScoreAdvice(score) { this.generateDynamicContent(); }
    showRequestedHelp(request) { this.showHelp(request.topic); }
    showFeedbackForm() { /* 実装省略 */ }
    integrateWithAccessibilityManager() { /* 実装省略 */ }
}