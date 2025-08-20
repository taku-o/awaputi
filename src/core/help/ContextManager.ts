/**
 * ContextManager.ts
 * コンテキスト検出とツールチップ管理クラス
 * 現在の状況に応じた適切なヘルプコンテンツの提供を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';''
import { LoggingSystem } from '../LoggingSystem.js';

// 型定義
export interface GameEngine { sceneManager?: {
        currentScene?: {
            constructor: {
                name: string }
            };
        };
    };
    eventBus?: any;
    state?: any;
    isRunning?: boolean;
    isPaused?: boolean;
    score?: number;
    currentLevel?: number;
}

export interface Context { scene: string,
    gameState: GameState,
    userInterface: UIState,
    userAction: UserAction | null,
    timestamp: number,
    [key: string]: any, }
}

export interface GameState { isPlaying?: boolean;
    isPaused?: boolean;
    score?: number;
    level?: number;
    isRunning?: boolean; }
}

export interface UIState { activeDialogs: number,
    hoveredElements?: number;
    focusedElement?: string;
    visiblePanels?: number; }
}

export interface UserAction { type: string,
    data: any,
    timestamp: number }
}

export interface UserActivity { isActive: boolean,
    idleTime: number,
    recentActions: UserAction[]
    }
}

export interface HelpItem { id: string,
    title: string,
    priority: number }
}

export interface TooltipData { element: HTMLElement,
    content: string | TooltipContent,
    options: TooltipOptions,
    registered: number }
}
';'
export interface TooltipContent { html?: string;''
    toString(''';
    severity: 'low' | 'medium' | 'high',
    description: string }
}

export interface BehaviorPatterns { clickFrequency: number,
    averageIdleTime: number,
    commonTargets: string[],
    strugglingAreas: string[] }
}

export interface SmartHelp { type: string,
    struggles: Struggle[],
    help: HelpContent,
    confidence: number,
    timestamp: number }
}

export interface HelpContent { title: string,
    suggestions: HelpSuggestion[]
    }
}

export interface HelpSuggestion { text: string,
    action: string }
}

export interface Position { x: number,
    y: number }
}

export interface UserBehaviorTracker { actions: UserAction[]
    )
    patterns: Map<string, any>);
    lastActivity: number | null }
}

export type ContextDetector = (context: Context) => any;
export type HelpProvider = (context: Context) => HelpItem[];

/**
 * コンテキスト管理クラス
 */
export class ContextManager {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    // コンテキスト検出
    private currentContext: Context | null;
    private contextHistory: (Context | null)[];
    private contextDetectors: Map<string, ContextDetector>;
    
    // ツールチップ管理
    private activeTooltips: Map<string, ActiveTooltip>;
    private tooltipRegistry: Map<string, TooltipData>;
    private tooltipElements: Map<string, HTMLElement>;
    private currentTooltip: string | null;
    private contextCache: Map<string, any>;
    private tooltipConfig: TooltipOptions;
    // 動的ヘルプ
    private helpProviders: Map<string, HelpProvider>;
    private userBehaviorTracker: UserBehaviorTracker;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // コンテキスト検出
        this.currentContext = null;
        this.contextHistory = [];
        this.contextDetectors = new Map<string, ContextDetector>();
        
        // ツールチップ管理
        this.activeTooltips = new Map<string, ActiveTooltip>();
        this.tooltipRegistry = new Map<string, TooltipData>();
        this.tooltipElements = new Map<string, HTMLElement>();
        this.currentTooltip = null;
        this.contextCache = new Map<string, any>();
        this.tooltipConfig = {
            showDelay: 800,
            hideDelay: 300,
            maxWidth: 300,

    }
    }
            maxHeight: 200 }
        },
        
        // 動的ヘルプ
        this.helpProviders = new Map<string, HelpProvider>();
        this.userBehaviorTracker = { actions: [],
            patterns: new Map<string, any>(),
            lastActivity: null }
        },
        
        this.initialize();
    }

    /**
     * コンテキストマネージャーの初期化
     */''
    initialize()';
            this.loggingSystem.info('ContextManager', 'Initializing context manager...');
            
            // デフォルトコンテキスト検出器の設定
            this.setupDefaultDetectors();
            
            // ツールチップ登録の設定
            this.setupTooltipRegistry();
            
            // ヘルププロバイダーの設定
            this.setupHelpProviders();
            ;
            // イベントリスナーの設定
            this.setupEventListeners()';
            this.loggingSystem.info('ContextManager', 'Context manager initialized successfully');''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to initialize context manager', error');''
            ErrorHandler.handle(error, 'ContextManager.initialize'); }
        }
    }

    /**
     * 現在のコンテキストを検出
     * @returns 現在のコンテキスト情報
     */
    detectCurrentContext(): Context | null { try {
            const context: Context = {
                scene: this.getCurrentScene(),
                gameState: this.getGameState(),
                userInterface: this.getUIState(),
                userAction: this.getLastUserAction(),
                timestamp: Date.now() }
            };

            // コンテキスト検出器を実行
            for(const [name, detector] of this.contextDetectors.entries() {
                try {
                    const detected = detector(context);
                    if (detected) {
            }
                        context[name] = detected;' }'
                    } catch (error) { ' }'
                    this.loggingSystem.error('ContextManager', `Detector error: ${name}`, error);
                }
            }

            // コンテキスト履歴に追加
            if(!this.isContextSimilar(context, this.currentContext) {
                this.contextHistory.push(this.currentContext);
                if (this.contextHistory.length > 10) {'
            }'
                    this.contextHistory.shift() }'
            this.loggingSystem.debug('ContextManager', `Context detected: ${context.scene)`});'
            return context;''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to detect current context', error);
            return null; }
        }
    }

    /**
     * 関連するヘルプの取得
     * @param context - コンテキスト情報
     * @returns 関連ヘルプ一覧
     */
    getRelevantHelp(context: Context): HelpItem[] { try {
            const relevantHelp: HelpItem[] = [],
            
            // シーンベースのヘルプ
            const sceneHelp = this.getSceneHelp(context.scene);
            if(sceneHelp) {
                
            }
                relevantHelp.push(...sceneHelp); }
            }
            
            // アクションベースのヘルプ
            if(context.userAction) {
                const actionHelp = this.getActionHelp(context.userAction);
                if (actionHelp) {
            }
                    relevantHelp.push(...actionHelp); }
                }
            }
            
            // 状況ベースのヘルプ
            const situationalHelp = this.getSituationalHelp(context);
            if (situationalHelp) { relevantHelp.push(...situationalHelp); }
            }
            ;
            // 重複排除とスコアリング
            const uniqueHelp = this.deduplicateAndScore(relevantHelp, context');'
            '';
            this.loggingSystem.debug('ContextManager', `Found ${uniqueHelp.length) relevant help items`});'
            return uniqueHelp;''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to get relevant help', error);
            return []; }
        }
    }

    /**
     * ツールチップの登録
     * @param element - 対象要素またはセレクター
     * @param content - ツールチップ内容
     * @param options - オプション'
     */''
    registerTooltip(element: HTMLElement | string, content: string | TooltipContent, options: TooltipOptions = { )'): void {'
        try {'
            const targetElement = typeof element === 'string' ? document.querySelector(element) as HTMLElement: element,'';
            if (!targetElement') {' }'
                this.loggingSystem.warn('ContextManager', `Tooltip target not found: ${element)`});
                return;
            }

            const tooltipId = this.generateTooltipId(targetElement);
            const tooltipData: TooltipData = { element: targetElement,
                content, }
                options: { ...this.tooltipConfig, ...options },
                registered: Date.now(),
            };

            this.tooltipRegistry.set(tooltipId, tooltipData);
            ';
            // イベントリスナーの追加
            this.attachTooltipListeners(targetElement, tooltipId');'
            '';
            this.loggingSystem.debug('ContextManager', `Tooltip registered: ${tooltipId)`});''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to register tooltip', error); }
        }
    }

    /**
     * コンテキスト対応ツールチップの表示
     * @param x - X座標
     * @param y - Y座標
     * @param content - コンテンツ
     * @param options - 表示オプション
     */
    showContextualTooltip(x: number, y: number, content: string | TooltipContent, options: TooltipOptions = { ): string | null {
        try { }
            const tooltipId = `contextual_${Date.now(})}`;
            const tooltip = this.createTooltipElement(content, options);
            ';
            // 位置調整
            const position = this.calculateTooltipPosition(x, y, tooltip');
            tooltip.style.left = `${position.x}px`;
            tooltip.style.top = `${position.y}px`;
            ';
            // 表示アニメーション
            tooltip.style.opacity = '0';''
            tooltip.style.transform = 'scale(0.8')';
            document.body.appendChild(tooltip);'
            '';
            requestAnimationFrame((') => {  ''
                tooltip.style.opacity = '1';' }'
                tooltip.style.transform = 'scale(1')'; }
            });
            
            // アクティブツールチップに追加
            this.activeTooltips.set(tooltipId, { )
                element: tooltip),
                showTime: Date.now(), }
                position: { x, y }
            });
            ;
            // 自動非表示タイマー
            setTimeout(() => this.hideTooltip(tooltipId), options.autoHide || 5000');'
            '';
            this.loggingSystem.debug('ContextManager', `Contextual tooltip shown at (${x}, ${y)`});'
            return tooltipId;''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to show contextual tooltip', error);
            return null; }
        }
    }

    /**
     * 次のアクション提案
     * @param currentState - 現在の状態
     * @returns 提案アクション一覧
     */
    suggestNextActions(currentState: Context): ActionSuggestion[] { try {
            const suggestions: ActionSuggestion[] = [],
            ';
            // 状態ベースの提案
            const stateKey = this.getStateKey(currentState');'
            const actionMap: Record<string, ActionSuggestion[]> = {''
                'MainMenuScene': [' }'
                    { action: 'start_game', label: 'ゲームを開始', priority: 1 },''
                    { action: 'view_tutorial', label: 'チュートリアルを見る', priority: 2 },']'
                    { action: 'open_settings', label: '設定を開く', priority: 3 }]'
                ],'';
                'GameScene.playing': ['';
                    { action: 'click_bubble', label: '泡をクリックしてください', priority: 1 },''
                    { action: 'use_item', label: 'アイテムを使用', priority: 2 },']'
                    { action: 'pause_game', label: 'ゲームを一時停止', priority: 3 }]'
                ],'';
                'GameScene.paused': ['';
                    { action: 'resume_game', label: 'ゲームを再開', priority: 1 },']'
                    { action: 'return_menu', label: 'メニューに戻る', priority: 2 }]
                ];
            };

            const mappedSuggestions = actionMap[stateKey] || [];
            suggestions.push(...mappedSuggestions);
            
            // ユーザー行動パターンベースの提案
            const behaviorSuggestions = this.getBehaviorBasedSuggestions(currentState);
            suggestions.push(...behaviorSuggestions);
            ;
            // プライオリティ順にソート
            suggestions.sort((a, b) => a.priority - b.priority');'
            '';
            this.loggingSystem.debug('ContextManager', `Generated ${ suggestions.length) action suggestions`); }'
            return suggestions.slice(0, 5}); // 最大5個
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to suggest next actions', error);
            return []; }
        }
    }

    /**
     * スマートヘルプの取得
     * @param userBehavior - ユーザー行動データ
     * @returns スマートヘルプ
     */
    getSmartHelp(userBehavior: any): SmartHelp | null { try {
            // 行動パターンの分析
            const patterns = this.analyzeUserBehavior(userBehavior);
            
            // 困っている兆候の検出
            const struggles = this.detectStruggles(patterns);
            
            if(struggles.length > 0) {
            ';'
                '';
                const helpContent = this.generateHelpForStruggles(struggles');'
                '';
                this.loggingSystem.info('ContextManager', `Smart help generated for ${struggles.length) struggles`');'
                return { ''
                    type: 'smart_help',
                    struggles,
            
            }
                    help: helpContent, };
                    confidence: this.calculateHelpConfidence(patterns), }
                    timestamp: Date.now(}),
                };
            }
            ';'
            return null;''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to get smart help', error);
            return null; }
        }
    }

    // ---- プライベートメソッド ----

    /**
     * デフォルトコンテキスト検出器の設定
     */''
    private setupDefaultDetectors()';
        this.contextDetectors.set('gameState', (context: Context) => {  if (!this.gameEngine) return null;
            
            return { isPlaying: this.gameEngine.isRunning,
                isPaused: this.gameEngine.isPaused, }
                score: this.gameEngine.score || 0, };
                level: this.gameEngine.currentLevel || 1 }'
            };''
        }');
';
        // UI状態検出器
        this.contextDetectors.set('uiState', (context: Context') => {  return { ''
                activeDialogs: document.querySelectorAll('.dialog:not(.hidden')'').length,' }'
                hoveredElements: document.querySelectorAll(':hover').length, };
                focusedElement: document.activeElement? .tagName }'
            };''
        }');
';
        // ユーザー活動検出器 : undefined
        this.contextDetectors.set('userActivity', (context: Context) => {  const lastAction = this.userBehaviorTracker.lastActivity;
            const timeSinceLastAction = lastAction ? Date.now() - lastAction: Infinity,
            return { isActive: timeSinceLastAction < 10000, // 10秒以内 }
                idleTime: timeSinceLastAction, };
                recentActions: this.userBehaviorTracker.actions.slice(-5); }
            };
        });
    }

    /**
     * ツールチップレジストリの設定
     */''
    private setupTooltipRegistry(''';
            { selector: '.start-button', content: 'ゲームを開始します' },''
            { selector: '.pause-button', content: 'ゲームを一時停止します' },''
            { selector: '.help-button', content: 'ヘルプを表示します' },''
            { selector: '.settings-button', content: '設定画面を開きます' }
        ];
);
        defaultTooltips.forEach(tooltip => {  );
            const element = document.querySelector(tooltip.selector) as HTMLElement;
            if (element) { }
                this.registerTooltip(element, tooltip.content); }
            }
        });
    }

    /**
     * ヘルププロバイダーの設定'
     */''
    private setupHelpProviders()';
        this.helpProviders.set('MainMenuScene', (context: Context') => ['';
            { id: 'menu_navigation', title: 'メニューの使い方', priority: 1 },']'
            { id: 'game_start', title: 'ゲームの始め方', priority: 2 }']'
        ]');'
'';
        this.helpProviders.set('GameScene', (context: Context') => ['';
            { id: 'bubble_basics', title: '泡の割り方', priority: 1 },''
            { id: 'scoring_system', title: 'スコアシステム', priority: 2 },']'
            { id: 'special_bubbles', title: '特殊な泡について', priority: 3 }]
        ]);
    }

    /**
     * イベントリスナーの設定'
     */''
    private setupEventListeners()';
        document.addEventListener('mousemove', (event: MouseEvent') => { ' }'
            this.trackUserAction('mouse_move', { x: event.clientX, y: event.clientY });''
        }');
';
        // クリック追跡
        document.addEventListener('click', (event: MouseEvent') => {  ''
            this.trackUserAction('click', { )
                x: event.clientX, );
                y: event.clientY ), }
                target: (event.target as HTMLElement)? .tagName  }'
            });''
        }');
';
        // キーワード追跡 : undefined
        document.addEventListener('keydown', (event: KeyboardEvent') => { ' }'
            this.trackUserAction('keydown', { key: event.key });
        });
    }

    /**
     * 現在のシーンを取得
     * @returns シーン名
     */'
    private getCurrentScene(): string { ''
        if(this.gameEngine && this.gameEngine.sceneManager') {'
            ';'
        }'
            return this.gameEngine.sceneManager.currentScene? .constructor.name || 'Unknown'; }'
        }''
        return 'Unknown';
    }

    /**
     * ゲーム状態を取得
     * @returns ゲーム状態
     */ : undefined
    private getGameState(): GameState {
        if (!this.gameEngine) return {};
        
        return { isRunning: this.gameEngine.isRunning || false,
            isPaused: this.gameEngine.isPaused || false, };
            score: this.gameEngine.score || 0 }
        },
    }

    /**
     * UI状態を取得
     * @returns UI状態'
     */''
    private getUIState()';
            activeDialogs: document.querySelectorAll('.dialog:not(.hidden')'').length,'';
            visiblePanels: document.querySelectorAll('.panel:not(.hidden')').length;
        },
    }

    /**
     * 最後のユーザーアクションを取得
     * @returns 最後のアクション
     */
    private getLastUserAction(): UserAction | null { const actions = this.userBehaviorTracker.actions;
        return actions.length > 0 ? actions[actions.length - 1] : null; }
    }

    /**
     * ユーザーアクションの追跡
     * @param type - アクションタイプ
     * @param data - アクションデータ
     */
    private trackUserAction(type: string, data: any): void { const action: UserAction = {
            type,
            data,
            timestamp: Date.now() }
        };

        this.userBehaviorTracker.actions.push(action);
        this.userBehaviorTracker.lastActivity = Date.now();

        // 最大100アクションを保持
        if (this.userBehaviorTracker.actions.length > 100) { this.userBehaviorTracker.actions.shift(); }
        }
    }

    /**
     * コンテキストの類似性チェック
     * @param context1 - コンテキスト1
     * @param context2 - コンテキスト2
     * @returns 類似フラグ
     */
    private isContextSimilar(context1: Context, context2: Context | null): boolean { if (!context1 || !context2) return false;
        
        return context1.scene === context2.scene &&;
               JSON.stringify(context1.gameState) === JSON.stringify(context2.gameState); }
    }

    /**
     * シーンヘルプの取得
     * @param sceneName - シーン名
     * @returns シーンヘルプ
     */
    private getSceneHelp(sceneName: string): HelpItem[] { const provider = this.helpProviders.get(sceneName);
        if(provider && this.currentContext) {
            
        }
            return provider(this.currentContext); }
        }
        return [];
    }

    /**
     * アクションヘルプの取得
     * @param action - アクション
     * @returns アクションヘルプ
     */''
    private getActionHelp(action: UserAction'): HelpItem[] { // アクションタイプベースのヘルプマッピング
        const actionHelpMap: Record<string, HelpItem[]> = {' }'
            'click': [{ id: 'click_help', title: 'クリック操作について', priority: 1 }],''
            'drag': [{ id: 'drag_help', title: 'ドラッグ操作について', priority: 1 }],''
            'bubble_pop': [{ id: 'bubble_pop_help', title: '泡を割るコツ', priority: 1 }]
        };

        return actionHelpMap[action.type] || [];
    }

    /**
     * 状況ヘルプの取得
     * @param context - コンテキスト
     * @returns 状況ヘルプ
     */
    private getSituationalHelp(context: Context): HelpItem[] { const help: HelpItem[] = [],
        ';
        // スコアが低い場合
        if(context.gameState && context.gameState.score && context.gameState.score < 100') {'
            ';'
        }'
            help.push({ id: 'low_score_help', title: 'スコアアップのコツ', priority: 2 ) }
        }
        ';
        // 長時間操作がない場合
        if (context.userActivity && (context.userActivity as UserActivity).idleTime > 30000') { ''
            help.push({ id: 'idle_help', title: '操作方法について', priority: 1 ) }
        }
        
        return help;
    }

    /**
     * 重複排除とスコアリング
     * @param helpItems - ヘルプアイテム一覧
     * @param context - コンテキスト
     * @returns スコア付きヘルプアイテム
     */
    private deduplicateAndScore(helpItems: HelpItem[], context: Context): HelpItem[] { const unique = new Map<string, HelpItem>();
        
        helpItems.forEach(item => { );
            const existing = unique.get(item.id);
            if (!existing || existing.priority > item.priority) { }
                unique.set(item.id, item); }
            }
        });
        
        return Array.from(unique.values().sort((a, b) => a.priority - b.priority);
    }

    /**
     * ツールチップID生成
     * @param element - 対象要素
     * @returns ツールチップID
     */
    private generateTooltipId(element: HTMLElement): string {
        return `tooltip_${element.id || element.className || Date.now(})}`;
    }

    /**
     * ツールチップリスナーの追加
     * @param element - 対象要素
     * @param tooltipId - ツールチップID'
     */''
    private attachTooltipListeners(element: HTMLElement, tooltipId: string'): void { let showTimer: number, hideTimer: number,'
'';
        element.addEventListener('mouseenter', () => { 
            clearTimeout(hideTimer);
            showTimer = window.setTimeout(() => { }
                this.showRegisteredTooltip(tooltipId); }'
            }, this.tooltipConfig.showDelay || 800);''
        }');'
'';
        element.addEventListener('mouseleave', () => {  clearTimeout(showTimer);
            hideTimer = window.setTimeout(() => { }
                this.hideTooltip(tooltipId); }
            }, this.tooltipConfig.hideDelay || 300);
        });
    }

    /**
     * 登録済みツールチップの表示
     * @param tooltipId - ツールチップID
     */
    private showRegisteredTooltip(tooltipId: string): void { const tooltipData = this.tooltipRegistry.get(tooltipId);
        if (!tooltipData) return;

        const rect = tooltipData.element.getBoundingClientRect();
        this.showContextualTooltip(;
            rect.left + rect.width / 2);
            rect.top - 10);
            tooltipData.content,);
            tooltipData.options); }
    }

    /**
     * ツールチップ要素の作成
     * @param content - コンテンツ
     * @param options - オプション
     * @returns ツールチップ要素'
     */''
    private createTooltipElement(content: string | TooltipContent, options: TooltipOptions'): HTMLElement { ''
        const tooltip = document.createElement('div'');''
        tooltip.className = 'context-tooltip';
        tooltip.style.cssText = `;
            position: fixed,
            background: rgba(0, 0, 0, 0.9),
            color: white,
            padding: 8px 12px,
            border-radius: 6px,
            font-size: 14px, }
            max-width: ${options.maxWidth || this.tooltipConfig.maxWidth}px;
            z-index: 10000,
            pointer-events: none,';
            transition: opacity 0.2s, transform 0.2s,'';
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3');
        `;'
'';
        if (typeof content === 'string') { tooltip.textContent = content; }
        } else { tooltip.innerHTML = (content as TooltipContent).html || content.toString(); }
        }

        return tooltip;
    }

    /**
     * ツールチップ位置の計算
     * @param x - X座標
     * @param y - Y座標
     * @param tooltip - ツールチップ要素
     * @returns 調整後の位置
     */
    private calculateTooltipPosition(x: number, y: number, tooltip: HTMLElement): Position { const rect = tooltip.getBoundingClientRect();
        let adjustedX = x - rect.width / 2;
        let adjustedY = y - rect.height - 10;

        // 画面外への はみ出し調整
        if (adjustedX < 10) adjustedX = 10;
        if(adjustedX + rect.width > window.innerWidth - 10) {
            
        }
            adjustedX = window.innerWidth - rect.width - 10; }
        }
        if (adjustedY < 10) adjustedY = y + 10;

        return { x: adjustedX, y: adjustedY }
    }

    /**
     * ツールチップの非表示
     * @param tooltipId - ツールチップID
     */
    private hideTooltip(tooltipId: string): void { const activeTooltip = this.activeTooltips.get(tooltipId);''
        if(activeTooltip') {'
            '';
            activeTooltip.element.style.opacity = '0';''
            activeTooltip.element.style.transform = 'scale(0.8')';
            
            setTimeout(() => { 
        }
                if (activeTooltip.element.parentNode) { }
                    activeTooltip.element.parentNode.removeChild(activeTooltip.element); }
                }
            }, 200);
            
            this.activeTooltips.delete(tooltipId);
        }
    }

    /**
     * 状態キーの生成
     * @param state - 状態
     * @returns 状態キー'
     */''
    private getStateKey(state: Context'): string { ''
        const scene = state.scene || 'Unknown'; }
        const gameState = state.gameState || {};'
        '';
        if(scene === 'GameScene') {'
            '';
            if (gameState.isPaused') return 'GameScene.paused';'
        }'
            if (gameState.isRunning') return 'GameScene.playing'; }
        }
        
        return scene;
    }

    /**
     * 行動ベース提案の取得
     * @param currentState - 現在の状態
     * @returns 行動ベース提案
     */
    private getBehaviorBasedSuggestions(currentState: Context): ActionSuggestion[] { // ユーザーの行動パターンに基づく提案
        const suggestions: ActionSuggestion[] = [],
        const recentActions = this.userBehaviorTracker.actions.slice(-10);
        
        // 繰り返し行動の検出 }
        const actionCounts: Record<string, number> = {};
        recentActions.forEach(action => {  ); }
            actionCounts[action.type] = (actionCounts[action.type] || 0) + 1; }
        });
        ;
        // 提案生成
        if(actionCounts.click > 5') {'
            suggestions.push({ ''
                action: 'try_drag', ')';
                label: 'ドラッグ操作も試してみてください', )
        }
                priority: 4 ); }
            });
        }
        
        return suggestions;
    }

    /**
     * ユーザー行動の分析
     * @param userBehavior - ユーザー行動データ
     * @returns 分析結果
     */
    private analyzeUserBehavior(userBehavior: any): BehaviorPatterns { const patterns: BehaviorPatterns = {
            clickFrequency: 0,
            averageIdleTime: 0,
            commonTargets: [],
            strugglingAreas: [] }
        },
';'
        const actions = this.userBehaviorTracker.actions;''
        if (actions.length === 0') return patterns;
';
        // クリック頻度計算
        const clicks = actions.filter(a => a.type === 'click');
        patterns.clickFrequency = clicks.length / (actions.length || 1);

        // アイドル時間計算
        let totalIdleTime = 0;
        for (let i = 1; i < actions.length; i++) { totalIdleTime += actions[i].timestamp - actions[i-1].timestamp; }
        }
        patterns.averageIdleTime = totalIdleTime / (actions.length - 1 || 1);

        return patterns;
    }

    /**
     * 困っている兆候の検出
     * @param patterns - 行動パターン
     * @returns 困っている兆候
     */
    private detectStruggles(patterns: BehaviorPatterns): Struggle[] { const struggles: Struggle[] = [],
;
        // 過度のクリック
        if(patterns.clickFrequency > 0.7') {'
            struggles.push({''
                type: 'excessive_clicking',')';
                severity: 'medium',')
        }'
                description: 'クリックが多すぎる可能性があります'); }
        }
';
        // 長いアイドル時間
        if(patterns.averageIdleTime > 10000') {'
            struggles.push({''
                type: 'long_idle',')';
                severity: 'low',')
        }'
                description: '操作に迷っている可能性があります'); }
        }

        return struggles;
    }

    /**
     * 困り事への対応ヘルプ生成
     * @param struggles - 困り事一覧
     * @returns ヘルプコンテンツ'
     */''
    private generateHelpForStruggles(struggles: Struggle[]'): HelpContent { const helpContent: HelpContent = {''
            title: 'お困りではありませんか？',
            suggestions: [] }
        },
';'
        struggles.forEach(struggle => {  );''
            switch(struggle.type') {'
                '';
                case 'excessive_clicking':';
                    helpContent.suggestions.push({'
            })'
                        text: 'ドラッグ操作も試してみてください',') }'
                        action: 'show_drag_tutorial'),' }'
                    }');'
                    break;''
                case 'long_idle':';
                    helpContent.suggestions.push({ ')'
                        text: 'チュートリアルを見てみますか？',')';
                        action: 'show_tutorial'),
                    break }
            }
        });

        return helpContent;
    }

    /**
     * ヘルプ信頼度の計算
     * @param patterns - 行動パターン
     * @returns 信頼度（0-1）
     */
    private calculateHelpConfidence(patterns: BehaviorPatterns): number { let confidence = 0.5; // ベース信頼度

        // データ量による調整
        const actionCount = this.userBehaviorTracker.actions.length;
        if (actionCount > 20) confidence += 0.2;
        if (actionCount > 50) confidence += 0.2;

        // パターンの明確さによる調整
        if(patterns.clickFrequency > 0.8 || patterns.clickFrequency < 0.2) {
            
        }
            confidence += 0.1; }
        }

        return Math.min(confidence, 1.0);
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void { try {
            // アクティブなツールチップを削除
            for(const [id, tooltip] of this.activeTooltips.entries() {
                
            }
                this.hideTooltip(id); }
            }

            // イベントリスナーの削除
            // （実際の実装では、追加したリスナーを個別に削除）

            this.activeTooltips.clear();
            this.tooltipRegistry.clear();
            this.contextDetectors.clear();''
            this.helpProviders.clear()';
            this.loggingSystem.info('ContextManager', 'Context manager destroyed');''
        } catch (error) { ''
            this.loggingSystem.error('ContextManager', 'Failed to destroy context manager', error); }
        }
    }
}

// シングルトンインスタンス管理
let contextManagerInstance: ContextManager | null = null,

/**
 * ContextManagerのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns ContextManagerインスタンス
 */  
export function getContextManager(gameEngine: GameEngine): ContextManager { if (!contextManagerInstance) {
        contextManagerInstance = new ContextManager(gameEngine); }
    }
    return contextManagerInstance;
}

/**
 * ContextManagerインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいContextManagerインスタンス
 */
export function reinitializeContextManager(gameEngine: GameEngine): ContextManager { if (contextManagerInstance) {
        contextManagerInstance.destroy(); }
    }''
    contextManagerInstance = new ContextManager(gameEngine');'
    return contextManagerInstance;''
}