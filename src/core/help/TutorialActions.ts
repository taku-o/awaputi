/**
 * TutorialActions.ts
 * チュートリアル用アクション検出・統合システム
 * ゲームエンジンとチュートリアルシステム間のブリッジ機能を提供
 */

import { ErrorHandler  } from '../../utils/ErrorHandler.js';
import { LoggingSystem  } from '../LoggingSystem.js';

// 型定義
export interface GameEngine { eventBus?: EventBus,
    bubbleManager?: BubbleManager;
    inputManager?: InputManager;
    scoreManager?: ScoreManager;
    playerData?: PlayerData;
    currentScene?: Scene;
    gameTime?: number;

export interface EventBus { on(event: string, callback: (data: any) => void): void;
    off?(event: string, callback: (data: any) => void): void;

export interface BubbleManager { popBubble(bubble: Bubble): boolean;
    getActiveBubbleCount(): number;

export interface InputManager { on(event: string, callback: (data: DragData) => void): void;
}

export interface ScoreManager { getCurrentScore(): number,
    getCurrentCombo(): number;
    getComboScore(): number;
    getComboMultiplier(): number;

export interface PlayerData { getCurrentHP(): number;

export interface Scene {
    constructor: { nam,e: string;
    constructor: { nam,e: string;
        };
export interface Bubble { id: string;
    type: string;
    x: number;
    y: number;
    score?: number;

export interface Position { x: number;
    y: number;
    y: number;
        };
export interface DragData { targetType: string;
    targetId: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    endY: number;
        };
export interface ActionData { actionType: string;
    timestamp: number;
    gameState: GameState;
    [key: string]: any;

export interface BubblePopData extends ActionData { bubbleId: string;
    bubbleType: string;
    position: Position;
    score: number;
    comboMultiplier: number;
    comboMultiplier: number;
        };
export interface BubbleDragData extends ActionData { bubbleId: string;
    startPosition: Position;
    endPosition: Position;
    dragDistance: number;
    dragDirection: number;
    dragDirection: number;
        };
export interface SpecialBubblePopData extends ActionData { bubbleId: string;
    bubbleType: string;
    specialEffect: string;
    affectedBubbles: string[];
    effectDuration: number;
    effectDuration: number;
        };
export interface ComboAchievedData extends ActionData { comboCount: number;
    comboScore: number;
    comboMultiplier: number;
    comboDuration: number;
    comboDuration: number;
        };
export interface ScoreReachedData extends ActionData { score: number;
    milestone: number;
    previousScore: number;
    scoreIncrease: number;
    scoreIncrease: number;
        };
export interface HPChangedData extends ActionData { currentHP: number;
    previousHP: number;
    hpChange: number;
    changeReason: string;
    changeReason: string;
        };
export interface KeyPressedData extends ActionData { key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    altKey: boolean;
        };
export interface ClickData extends ActionData { position: Position;
    target: string;
    button: number;
    button: number;
        };
export interface TouchStartData extends ActionData { position: Position;
    touchCount: number;
    touchCount: number;
        };
export interface GameState { currentScene: string;
    score: number;
    combo: number;
    hp: number;
    activeBubbles: number;
    gameTime: number;
    gameTime: number;
        };
export interface ActionListenerInfo { callback: ActionCallback;
    options: ActionOptions;
    registeredAt: number;
    triggerCount: number;
    triggerCount: number;
        };
export interface ActionOptions { requiredCombo?: number,
    requiredScore?: number;
    [key: string]: any;

export interface ActionStats { totalActions: number;
    actionsByType: Map<string, number>;
    averageResponseTime: Map<string, number>;
    lastActionTime: number;
    lastActionTime: number;
        };
export interface ActionStatistics { totalActions: number;
    actionsByType: Record<string, number>;
    averageResponseTime: Record<string, number>;
    activeListeners: number;
    stateWatchers: number;
';'

export type ActionCallback = (data: ActionData) => void;
export type StateWatcher = () => void;
export type ActionType = 'bubble_pop' | 'bubble_drag' | 'special_bubble_pop' | 'combo_achieved' | 'score_reached' | 'hp_changed' | 'key_pressed' | 'click' | 'touch_start';

/**
 * チュートリアルアクション検出クラス
 */
export class TutorialActions {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    private stateMonitoringInterval: number | null;
    // アクションリスナー管理
    private, activeListeners: Map<string, any[]>,
    private actionCallbacks: Map<string, ActionListenerInfo>;
    
    // ゲーム状態監視
    private gameStateWatchers: Map<string, StateWatcher>;
    private lastKnownStates: Map<string, any>;
    
    // アクション統計
    private actionStats: ActionStats;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.stateMonitoringInterval = null;
        
        // アクションリスナー管理
        this.activeListeners = new Map<string, any[]>(),
        this.actionCallbacks = new Map<string, ActionListenerInfo>(),
        
        // ゲーム状態監視
        this.gameStateWatchers = new Map<string, StateWatcher>(),
        this.lastKnownStates = new Map<string, any>(),
        
        // アクション統計
        this.actionStats = {
            totalActions: 0;
    actionsByType: new Map<string, number>();
            averageResponseTime: new Map<string, number>() }
            lastActionTime: 0 
    };
        this.initialize();
    }

    /**
     * システムの初期化
     */
    initialize(): void { try {
            // ゲームエンジンイベントの監視設定
            this.setupGameEngineIntegration();
            // DOM イベントの監視設定
            this.setupDOMEventListeners();
            // 状態監視の開始
            this.startStateMonitoring()','
            this.loggingSystem.info('TutorialActions', 'Tutorial action system initialized',' }'

        } catch (error) {
            this.loggingSystem.error('TutorialActions', 'Failed to initialize tutorial actions', error','
            ErrorHandler.handle(error as Error, 'TutorialActions.initialize' }'
    }

    /**
     * アクションリスナーの登録
     * @param actionType - アクションタイプ
     * @param callback - コールバック関数
     * @param options - オプション設定
     */
    registerActionListener(actionType: string, callback: ActionCallback, options: ActionOptions = { ): void {
        try {
            const listenerInfo: ActionListenerInfo = {
                callback,
                options,
                registeredAt: Date.now(
    triggerCount: 0  },
            this.actionCallbacks.set(actionType, listenerInfo);
            ';'
            // アクションタイプ別の監視設定
            this.setupActionSpecificListeners(actionType, options);

            this.loggingSystem.debug('TutorialActions', `Action listener registered: ${actionType}`}';} catch (error) { }'

            this.loggingSystem.error('TutorialActions', `Failed to register action listener: ${actionType}`, error);
        }
    }

    /**
     * アクションリスナーの解除
     * @param actionType - アクションタイプ
     */
    unregisterActionListener(actionType: string): void { try {
            if (this.actionCallbacks.has(actionType) {
                this.actionCallbacks.delete(actionType) }

                this.cleanupActionListeners(actionType);' }'

                this.loggingSystem.debug('TutorialActions', `Action listener unregistered: ${actionType}`}';} catch (error) { }'

            this.loggingSystem.error('TutorialActions', `Failed to unregister action listener: ${actionType}`, error);
        }
    }

    /**
     * アクションの発火
     * @param actionType - アクションタイプ
     * @param eventData - イベントデータ
     */
    triggerAction(actionType: string, eventData: any = { ): void {
        try {
            const listenerInfo = this.actionCallbacks.get(actionType);
            if (!listenerInfo) {
    
}
                return; }
            }

            const actionData = this.buildActionData(actionType, eventData);
            
            // 統計の更新
            this.updateActionStats(actionType, actionData);
            // コールバックの実行
            listenerInfo.callback(actionData);
            listenerInfo.triggerCount++;

            this.loggingSystem.debug('TutorialActions', `Action triggered: ${actionType}`, actionData}';} catch (error) { }'

            this.loggingSystem.error('TutorialActions', `Failed to trigger action: ${actionType}`, error);
        }
    }

    /**
     * アクションデータの構築
     * @param actionType - アクションタイプ
     * @param eventData - イベントデータ
     * @returns 構築されたアクションデータ
     */
    buildActionData(actionType: string, eventData: any): ActionData { const baseData = {
            actionType,
            timestamp: Date.now(
    gameState: this.getCurrentGameState();
            ...eventData,
','
        // アクションタイプ別の追加データ
        switch(actionType) {

            case 'bubble_pop': return { ...baseData,

                    bubbleId: eventData.bubbleId,' };'

                    bubbleType: eventData.bubbleType || 'normal'
            }
                    position: eventData.position || { x: 0, y: 0  },

                    score: eventData.score || 0,
                    comboMultiplier: this.getCurrentComboMultiplier('''
            case 'bubble_drag':
                return { ...baseData };
                    bubbleId: eventData.bubbleId }
                    startPosition: eventData.startPosition || { x: 0, y: 0  },
                    endPosition: eventData.endPosition || { x: 0, y: 0  },
                    dragDistance: eventData.dragDistance || 0,
    dragDirection: eventData.dragDirection || 0,
                },

            case 'special_bubble_pop': return { ...baseData,
                    bubbleId: eventData.bubbleId,
                    bubbleType: eventData.bubbleType,
                    specialEffect: eventData.specialEffect,
    affectedBubbles: eventData.affectedBubbles || [] },
                    effectDuration: eventData.effectDuration || 0 
    };
            case 'combo_achieved': return { ...baseData,
                    comboCount: eventData.comboCount || 0,
                    comboScore: eventData.comboScore || 0,
    comboMultiplier: eventData.comboMultiplier || 1 },
                    comboDuration: eventData.comboDuration || 0 
    };
            case 'score_reached': return { ...baseData,
                    score: eventData.score || 0,
                    milestone: eventData.milestone || 0,
    previousScore: eventData.previousScore || 0 },
                    scoreIncrease: eventData.scoreIncrease || 0 
    };
            case 'hp_changed': return { ...baseData,
                    currentHP: eventData.currentHP || 0,
    previousHP: eventData.previousHP || 0,
                    hpChange: eventData.hpChange || 0,' };'

                    changeReason: eventData.changeReason || 'unknown' 
    }
);
            default: return baseData),

    /**
     * ゲームエンジン統合の設定
     */''
    setupGameEngineIntegration(): void { ''
        if (!this.gameEngine || !this.gameEngine.eventBus) {
    
}
            return; }
        }

        const eventBus = this.gameEngine.eventBus;
';'
        // バブル関連イベント
        eventBus.on('bubble_popped', (data) => { }

            this.triggerAction('bubble_pop', data'; }'

        }');'

        eventBus.on('bubble_dragged', (data) => { }

            this.triggerAction('bubble_drag', data'; }'

        }');'

        eventBus.on('special_bubble_popped', (data) => { }

            this.triggerAction('special_bubble_pop', data'; }'

        }');'
';'
        // スコア・コンボ関連イベント
        eventBus.on('combo_achieved', (data) => { }

            this.triggerAction('combo_achieved', data'; }'

        }');'

        eventBus.on('score_updated', (data) => {  const milestone = this.checkScoreMilestone(data.score);
            if (milestone) {

                this.triggerAction('score_reached', {
            };
                    ...data) }
                    milestone }
                }';'

            }'}');
';'
        // HP関連イベント
        eventBus.on('hp_changed', (data) => { }

            this.triggerAction('hp_changed', data'; }'

        }');'
';'
        // ゲーム状態イベント
        eventBus.on('game_state_changed', (data) => { this.updateGameState(data) });
    }

    /**
     * DOM イベントリスナーの設定'
     */''
    setupDOMEventListeners()';'
        document.addEventListener('keydown', (event: KeyboardEvent) => { ''
            this.triggerAction('key_pressed', {
                key: event.key,
                code: event.code);
                ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey }
                altKey: event.altKey); 
    }';}');
';'
        // マウス・タッチイベント
        document.addEventListener('click', (event: MouseEvent) => { }

            this.triggerAction('click', {
            };
                position: { x: event.clientX, y: event.clientY  }
                target: event.target.className),
                button: event.button }';}');

        document.addEventListener('touchstart', (event: TouchEvent) => {  const touch = event.touches[0],' }'

            this.triggerAction('touch_start', {
            };
                position: { x: touch.clientX, y: touch.clientY  }
                touchCount: event.touches.length),
            };
        }';'
    }

    /**
     * アクション固有リスナーの設定
     * @param actionType - アクションタイプ
     * @param options - オプション設定
     */'
    setupActionSpecificListeners(actionType: string, options: ActionOptions): void { ''
        switch(actionType) {

            case 'bubble_pop':','
                this.setupBubblePopListener(options);
                break,

            case 'bubble_drag':','
                this.setupBubbleDragListener(options);
                break,

            case 'combo_achieved':','
                this.setupComboListener(options);
                break,

            case 'score_reached':,
                this.setupScoreListener(options) }
                break; }
}

    /**
     * バブルポップリスナーの設定
     * @param options - オプション設定
     */
    setupBubblePopListener(options: ActionOptions): void { // バブルマネージャーとの統合
        if (this.gameEngine.bubbleManager) {
            const originalPop = this.gameEngine.bubbleManager.popBubble,
            this.gameEngine.bubbleManager.popBubble = (bubble: Bubble) => { 
                const result = originalPop.call(this.gameEngine.bubbleManager, bubble);
                if (result) {''
                    this.triggerAction('bubble_pop', {
            };
                        bubbleId: bubble.id) }
                        bubbleType: bubble.type }
                        position: { x: bubble.x, y: bubble.y  }
                        score: bubble.score || 0),
                    }';'
                }
                
                return result;

    /**
     * バブルドラッグリスナーの設定
     * @param options - オプション設定
     */'
    setupBubbleDragListener(options: ActionOptions): void { // 入力マネージャーとの統合
        if (this.gameEngine.inputManager) {
            const inputManager = this.gameEngine.inputManager,

            inputManager.on('drag_end', (data: DragData) => { ''
                if(data.targetType === 'bubble' {'
                    const dragDistance = Math.sqrt();
                        Math.pow(data.endX - data.startX, 2) + ','

                        Math.pow(data.endY - data.startY, 2)','
                    '),'

                    ' }'

                    this.triggerAction('bubble_drag', {
            };
                        bubbleId: data.targetId) }
                        startPosition: { x: data.startX, y: data.startY  },
                        endPosition: { x: data.endX, y: data.endY ,
                        dragDistance: dragDistance,
    dragDirection: Math.atan2(data.endY - data.startY, data.endX - data.startX };
                }
            };
        }
    }

    /**
     * コンボリスナーの設定
     * @param options - オプション設定
     */'
    setupComboListener(options: ActionOptions): void { ''
        if (this.gameEngine.scoreManager) {
            const scoreManager = this.gameEngine.scoreManager,
            let lastComboCount = 0,
            ','
            // スコア更新時にコンボをチェック
            this.gameStateWatchers.set('combo_watcher', () => { '
                const currentCombo = scoreManager.getCurrentCombo();
                if(currentCombo > lastComboCount && currentCombo >= (options.requiredCombo || 1)) {''
                    this.triggerAction('combo_achieved', {
                comboCount: currentCombo) }
                        comboScore: scoreManager.getComboScore() }
                        comboMultiplier: scoreManager.getComboMultiplier(); 
    };
                }
                lastComboCount = currentCombo;
            };
        }
    }

    /**
     * スコアリスナーの設定
     * @param options - オプション設定
     */'
    setupScoreListener(options: ActionOptions): void { ''
        if (this.gameEngine.scoreManager) {
            const scoreManager = this.gameEngine.scoreManager,
            let lastScore = 0,

            this.gameStateWatchers.set('score_watcher', () => { 
                const currentScore = scoreManager.getCurrentScore();
                if (currentScore > lastScore) {
                    const milestone = options.requiredScore || 100,
                    if (currentScore >= milestone && lastScore < milestone) {''
                        this.triggerAction('score_reached', {
                            score: currentScore,
    milestone: milestone)
         }
                            previousScore: lastScore) }
                            scoreIncrease: currentScore - lastScore); 
    }
                lastScore = currentScore;
            };
        }
    }

    /**
     * 状態監視の開始
     */
    startStateMonitoring(): void { // 定期的な状態チェック（100ms間隔）
        this.stateMonitoringInterval = setInterval(() => { 
            for(const [name, watcher] of this.gameStateWatchers) {
    
}
                try { }
                    watcher();' }'

                } catch (error) { }

                    this.loggingSystem.error('TutorialActions', `State watcher error: ${name}`, error);
                }
}, 100' as any;'
    }

    /**
     * 現在のゲーム状態を取得
     * @returns ゲーム状態
     */'
    getCurrentGameState(): GameState { ''
        if (!this.gameEngine) { }
            return {}
';'

        return { ''
            currentScene: this.gameEngine.currentScene?.constructor.name || 'unknown', : undefined
            score: this.gameEngine.scoreManager?.getCurrentScore() || 0, : undefined
            combo: this.gameEngine.scoreManager?.getCurrentCombo() || 0, : undefined
            hp: this.gameEngine.playerData?.getCurrentHP() || 0, : undefined
            activeBubbles: this.gameEngine.bubbleManager?.getActiveBubbleCount() || 0, : undefined;;
            gameTime: this.gameEngine.gameTime || 0 
    }

    /**
     * 現在のコンボ倍率を取得
     * @returns コンボ倍率
     */
    getCurrentComboMultiplier(): number { return this.gameEngine.scoreManager?.getComboMultiplier() || 1 }

    /**
     * スコアマイルストーンのチェック
     * @param score - 現在のスコア
     * @returns マイルストーン値'
     */ : undefined''
    checkScoreMilestone(score: number): number | null { const milestones = [50, 100, 200, 500, 1000, 2000, 5000],
        const lastScore = this.lastKnownStates.get('score) || 0,'
        
        for (const milestone of milestones) {
        
            if (score >= milestone && lastScore < milestone) {
    
}
                return milestone;
        
        return null;
    }

    /**
     * アクション統計の更新
     * @param actionType - アクションタイプ
     * @param actionData - アクションデータ
     */
    updateActionStats(actionType: string, actionData: ActionData): void { this.actionStats.totalActions++,
        
        const typeCount = this.actionStats.actionsByType.get(actionType) || 0,
        this.actionStats.actionsByType.set(actionType, typeCount + 1);
        // レスポンス時間の計算（前回のアクションからの時間）
        if (this.actionStats.lastActionTime > 0) {
            const responseTime = actionData.timestamp - this.actionStats.lastActionTime,
            const avgResponseTime = this.actionStats.averageResponseTime.get(actionType) || 0,
            const newAvg = avgResponseTime > 0 ? (avgResponseTime + responseTime) / 2 : responseTime;

            this.actionStats.averageResponseTime.set(actionType, newAvg); }
        }
        ';'

        this.actionStats.lastActionTime = actionData.timestamp;
        this.lastKnownStates.set('score', actionData.gameState.score);
    }

    /**
     * ゲーム状態の更新
     * @param stateData - 状態データ
     */
    updateGameState(stateData: Record<string, any>): void { for(const [key, value] of Object.entries(stateData) {
            this.lastKnownStates.set(key, value) }
    }

    /**
     * アクションリスナーのクリーンアップ
     * @param actionType - アクションタイプ
     */
    cleanupActionListeners(actionType: string): void { // アクション固有のクリーンアップ
        if (this.activeListeners.has(actionType) {
            const listeners = this.activeListeners.get(actionType);
            listeners?.forEach(listener => { ) }
                if (listener.remove) { }
                    listener.remove(); }
};
            this.activeListeners.delete(actionType);
        }
    }

    /**
     * 統計情報の取得
     * @returns 統計情報
     */ : undefined
    getActionStats(): ActionStatistics { return { ...this.actionStats,
            actionsByType: Object.fromEntries(this.actionStats.actionsByType);
            averageResponseTime: Object.fromEntries(this.actionStats.averageResponseTime,
    activeListeners: this.actionCallbacks.size },
            stateWatchers: this.gameStateWatchers.size 
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup(): void { try {
            // 状態監視の停止
            if (this.stateMonitoringInterval) {
                clearInterval(this.stateMonitoringInterval) }
                this.stateMonitoringInterval = null; }
            }
            
            // すべてのリスナーをクリーンアップ
            for (const actionType of this.actionCallbacks.keys() { this.cleanupActionListeners(actionType) }
            
            // データのクリア
            this.actionCallbacks.clear();
            this.gameStateWatchers.clear();
            this.lastKnownStates.clear()';'
            this.loggingSystem.info('TutorialActions', 'Tutorial action system cleaned up';} catch (error) {
            this.loggingSystem.error('TutorialActions', 'Failed to cleanup tutorial actions', error' }'
    }

    /**
     * システムの破棄
     */'
    destroy(): void { ''
        this.cleanup()','
        this.loggingSystem.info('TutorialActions', 'Tutorial action system destroyed) }'
}

// シングルトンインスタンス管理
let tutorialActionsInstance: TutorialActions | null = null,

/**
 * TutorialActionsのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns TutorialActionsインスタンス
 */
export function getTutorialActions(gameEngine: GameEngine): TutorialActions { if (!tutorialActionsInstance) {
        tutorialActionsInstance = new TutorialActions(gameEngine) }
    return tutorialActionsInstance;
}

/**
 * TutorialActionsインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいTutorialActionsインスタンス
 */
export function reinitializeTutorialActions(gameEngine: GameEngine): TutorialActions { if (tutorialActionsInstance) {
        tutorialActionsInstance.destroy() }''
    tutorialActionsInstance = new TutorialActions(gameEngine);

    return tutorialActionsInstance;}