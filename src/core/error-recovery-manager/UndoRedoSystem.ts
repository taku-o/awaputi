/**
 * UndoRedoSystem
 * 
 * アンドゥ・リドゥシステム機能を担当
 * Command Pattern & History Management Patternの一部として設計
 * 
 * **Features**:
 * - Action recording and replay system
 * - Game state capture and restoration
 * - Keyboard shortcuts and UI integration
 * - Critical action management with recovery
 * 
 * @module UndoRedoSystem
 * Created: Phase G.10 (Issue #103)
 */

// 型定義
export interface UndoRedoConfig { enabled: boolean,
    maxHistory: number;
    maxRedoSteps: number;
    ignoredActions: Set<string>;
    criticalActions: Set<string>
    ,}

export interface ActionRecord { id: string;
    type: string;
    subtype: string;
    timestamp: number;
    stateBefore: GameStateSnapshot;
    stateAfter: GameStateSnapshot | null;
    data: Record<string, any>,
    metadata: ActionMetadata
    ,}

export interface ActionMetadata { isCritical: boolean;
    canUndo: boolean;
    description: string;
    priority?: ActionPriority;
    category?: ActionCategory;
    estimatedImpact?: ImpactLevel;
    }

export interface GameStateSnapshot { game?: any;
    player?: PlayerState;
    scene?: SceneState;
    bubbles?: BubbleState;
    score?: ScoreState;
    timestamp: number ,}

export interface PlayerState { id?: string;
    name?: string;
    level?: number;
    experience?: number;
    settings?: Record<string, any>;
    statistics?: PlayerStatistics;
    }

export interface PlayerStatistics { gamesPlayed: number,
    totalScore: number;
    bestScore: number;
    averageScore: number;
    playtime: number;
    achievements: string[] ,}

export interface SceneState { current: string;
    data: Record<string, any>,
    history?: string[];
    transition?: TransitionState;
    }

export interface TransitionState { from: string,
    to: string;
    progress: number;
    startTime: number ,}

export interface BubbleState { bubbles: BubbleData[];
    grid: GridData;
    physics: PhysicsData;
    effects: EffectData[]
    }

export interface BubbleData { id: string;
    type: BubbleType;
    position: Position;
    velocity?: Velocity;
    color: BubbleColor;
    size: number;
    state: BubbleElementState
    }

export interface GridData { width: number;
    height: number;
    cellSize: number;
    occupied: boolean[][] }

export interface PhysicsData { gravity: number;
    friction: number;
    bounce: number;
    timeStep: number }

export interface EffectData { id: string;
    type: EffectType;
    position: Position;
    duration: number;
    progress: number }

export interface ScoreState { current: number;
    best: number;
    combo: number;
    multiplier: number;
    level: number;
    progress: number }

export interface Position { x: number;
    y: number }

export interface Velocity { x: number;
    y: number }

export interface UndoRedoSystemState { isRecording: boolean;
    lastAction: ActionRecord | null;
    actionCount: number;
    undoCount: number;
    redoCount: number;
    operationInProgress: boolean }

export interface UIElements { undoButton: HTMLButtonElement | null;
    redoButton: HTMLButtonElement | null;
    statusIndicator?: HTMLElement | null }

export interface GameEngineInterface { gameState?: any;
    playerData?: PlayerDataInterface;
    sceneManager?: SceneManagerInterface;
    bubbleManager?: BubbleManagerInterface;
    scoreManager?: ScoreManagerInterface;
    eventEmitter?: EventEmitterInterface;
    render?: () => void; }
}

export interface PlayerDataInterface { exportData(): PlayerState;
    importData(data: PlayerState): void, }

export interface SceneManagerInterface { getCurrentScene(): string;
    getSceneData(): Record<string, any>;
    restoreScene(sceneState: SceneState): void, }

export interface BubbleManagerInterface { exportState(): BubbleState;
    importState(state: BubbleState): void, }

export interface ScoreManagerInterface { getState(): ScoreState;
    setState(state: ScoreState): void, }

export interface EventEmitterInterface { on(event: string, callback: Function): void,
    emit(event: string, data?: any): void }

export interface ActionData { type: string,
    subtype?: string;
    data?: Record<string, any>;
    canUndo?: boolean;
    description?: string;
    priority?: ActionPriority;
    }

export interface StateChangeData { type: string,
    significant?: boolean;
    data?: Record<string, any>; }

export interface UndoRedoStatistics { enabled: boolean,
    totalActions: number;
    undoCount: number;
    redoCount: number;
    historyLength: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    lastAction: string | null;
    averageStateSize?: number;
    memoryUsage?: number; ,}

export interface KeyboardShortcut { key: string,
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    description: string ,}

export interface FeedbackOptions { message: string;
    duration?: number;
    type?: FeedbackType;
    position?: FeedbackPosition;
    }

export interface ButtonStyle { position: string,
    width: string;
    height: string;
    borderRadius: string;
    border: string;
    background: string;
    color: string;
    fontSize: string;
    cursor: string;
    zIndex: string;
    transition: string;
    boxShadow: string;
    bottom?: string;
    right?: string;
    top?: string;
    left?: string; ,}

// 列挙型
export type ActionPriority = 'low' | 'normal' | 'high' | 'critical';''
export type ActionCategory = 'game' | 'ui' | 'system' | 'player' | 'scene';''
export type ImpactLevel = 'minimal' | 'low' | 'medium' | 'high' | 'major';''
export type BubbleType = 'normal' | 'special' | 'power' | 'bonus' | 'obstacle';''
export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';''
export type BubbleElementState = 'idle' | 'moving' | 'popping' | 'falling' | 'locked';''
export type EffectType = 'explosion' | 'sparkle' | 'trail' | 'glow' | 'shake';''
export type FeedbackType = 'success' | 'info' | 'warning' | 'error';''
export type FeedbackPosition = 'center' | 'top' | 'bottom' | 'topRight' | 'bottomRight';

// 定数
export const DEFAULT_UNDO_REDO_CONFIG: UndoRedoConfig = { enabled: true,
    maxHistory: 10;
    maxRedoSteps: 10,
    ignoredActions: new Set(['move', 'hover', 'focus', 'scroll', 'mouseover', 'mouseout]),
    criticalActions: new Set(['reset', 'newGame', 'delete', 'clear', 'restart', 'quit] } as const;
';

export const KEYBOARD_SHORTCUTS: Record<string, KeyboardShortcut> = { UNDO: {''
        key: 'z',
        ctrlKey: true,
        description: '元に戻す (Ctrl+Z)' ,};
    REDO: { ''
        key: 'y',
        ctrlKey: true,
        description: 'やり直し (Ctrl+Y')' ,};
    REDO_ALT: { ''
        key: 'z';
        ctrlKey: true,
        shiftKey: true,
        description: 'やり直し (Ctrl+Shift+Z')' ,}
} as const;
';

export const BUTTON_STYLES: Record<string, ButtonStyle> = { base: {''
        position: 'fixed',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        border: '2px solid #6c757d',
        background: 'white',
        color: '#6c757d',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: '9997',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' },

    undo: {;
        position: 'fixed',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        border: '2px solid #6c757d',
        background: 'white',
        color: '#6c757d',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: '9997',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        bottom: '80px',
        right: '20px' ,};
    redo: { ''
        position: 'fixed',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        border: '2px solid #6c757d',
        background: 'white',
        color: '#6c757d',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: '9997',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        bottom: '135px',
        right: '20px' ,}
} as const;
';

export const BUTTON_SYMBOLS = {;
    UNDO: '↶',
    REDO: '↷' ,} as const;
';

export const FEEDBACK_MESSAGES = {;
    UNDO_SUCCESS: '元に戻しました',
    UNDO_FAILED: '元に戻せません',
    UNDO_ERROR: 'Undo操作に失敗しました',
    REDO_SUCCESS: 'やり直しました',
    REDO_FAILED: 'やり直せません',
    REDO_ERROR: 'Redo操作に失敗しました' ,} as const;
';

export const CSS_CLASSES = {;
    UNDO_REDO_BTN: 'undo-redo-btn',
    UNDO_BTN: 'undo-btn',
    REDO_BTN: 'redo-btn',
    DISABLED: 'disabled' ,} as const;
export const DEFAULT_FEEDBACK_DURATION = 2000;

// ユーティリティ関数
export function generateActionId(): string {
    return `action_${Date.now(})_${Math.random(}.toString(36}.substr(2, 9})`;
}

export function deepClone<T>(obj: T'): T {;
    if(obj === null || typeof, obj !== 'object) return obj;
    if (obj, instanceof Date) return new Date(obj) as unknown as T;
    if (obj, instanceof Array) return obj.map(item => deepClone(item) as unknown as T;
     }
    const cloned = {} as T;
    for(const, key in, obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key) {
    }
            cloned[key] = deepClone(obj[key]); }
}
    return cloned;
}

export function isActionIgnored(actionType: string, ignoredActions: Set<string>): boolean { return ignoredActions.has(actionType); }

export function isActionCritical(actionType: string, criticalActions: Set<string>): boolean { return criticalActions.has(actionType); }

export function calculateStateSize(state: GameStateSnapshot): number { try {
        const serialized = JSON.stringify(state);
        return new Blob([serialized]).size; } catch { return 0;

export function formatActionDescription(action: ActionRecord): string { const timestamp = new Date(action.timestamp).toLocaleTimeString(); }
    return `${action.type} (${action.subtype}) at ${timestamp}`;
}

export function validateGameState(state: GameStateSnapshot): boolean { return state !== null &&;
           typeof state === 'object' && '';
           typeof state.timestamp === 'number' &&;
           state.timestamp > 0; }

export function createFeedbackElement(options: FeedbackOptions): HTMLElement {;
    const feedback = document.createElement('div'');

    feedback.textContent = options.message;''
    feedback.setAttribute('role', 'status'');''
    feedback.setAttribute('aria-live', 'polite'');

    const position = options.position || 'center';''
    let transform = 'translate(-50%, -50%)';''
    let top = '50%';''
    let left = '50%';''
    let right = 'auto';''
    let bottom = 'auto';

    switch(position) {'

        case 'topRight':'';
            transform = 'none';''
            top = '20px';''
            left = 'auto';''
            right = '20px';

            break;''
        case 'bottomRight':'';
            transform = 'none';''
            top = 'auto';''
            left = 'auto';''
            right = '20px';''
            bottom = '20px';

            break;''
        case 'top':'';
            transform = 'translateX(-50%)';''
            top = '20px';''
            left = '50%';

            break;''
        case 'bottom':'';
            transform = 'translateX(-50%)';''
            top = 'auto';''
            left = '50%';''
            bottom = '20px';
    }
            break; }
    }
    
    feedback.style.cssText = `;
        position: fixed;
        top: ${top};
        left: ${left};
        right: ${right};
        bottom: ${bottom};
        transform: ${transform};
        background: rgba(0, 0, 0, 0.8),
        color: white;
        padding: 12px 24px;
        border-radius: 6px,
        z-index: 10003,
        font-size: 14px,
        font-family: inherit,
        pointer-events: none,
        max-width: 300px,
        text-align: center,
    `;
    
    return feedback;
}

export class UndoRedoSystem {
    private config: UndoRedoConfig;
    private gameEngine: GameEngineInterface;
    private actionHistory: ActionRecord[];
    private currentIndex: number;
    private state: UndoRedoSystemState;
    private ui: UIElements;
    // イベントハンドラーの参照保持
    private keydownHandler: (event: KeyboardEvent) => void;
    private gameActionHandler: (action: ActionData) => void;
    private stateChangeHandler: (stateChange: StateChangeData) => void;

    constructor(config: Partial<UndoRedoConfig>, gameEngine: GameEngineInterface) {
        this.config = { ...DEFAULT_UNDO_REDO_CONFIG, ...config;
        this.gameEngine = gameEngine;
        
        // アクション履歴
        this.actionHistory = [];
        this.currentIndex = -1;
        
        // 状態管理
        this.state = { isRecording: true,
            lastAction: null;
            actionCount: 0;
            undoCount: 0;
            redoCount: 0;
            operationInProgress: false ,};
        // UI要素
        this.ui = { undoButton: null,
            redoButton: null ,};
        // イベントハンドラーをバインド
        this.keydownHandler = this.handleKeydown.bind(this);
        this.gameActionHandler = this.handleGameAction.bind(this);
        this.stateChangeHandler = this.handleStateChange.bind(this);
        
        this.initialize();
    }

    /**
     * システムを初期化
     */
    private initialize(): void { this.createUndoRedoButtons();''
        this.setupEventListeners()';
        console.log('[UndoRedoSystem] Component, initialized'); }'

    /**
     * Undo/Redoボタンを作成'
     */''
    private createUndoRedoButtons()';
        const undoBtn = document.createElement('button'');''
        undoBtn.id = 'undo-btn';
        undoBtn.className = `${CSS_CLASSES.UNDO_REDO_BTN} ${CSS_CLASSES.UNDO_BTN}`;
        undoBtn.innerHTML = BUTTON_SYMBOLS.UNDO;

        undoBtn.title = KEYBOARD_SHORTCUTS.UNDO.description;''
        undoBtn.setAttribute('aria-label', '元に戻す'');
        undoBtn.disabled = true;
        ';
        // Redoボタン
        const redoBtn = document.createElement('button'');''
        redoBtn.id = 'redo-btn';
        redoBtn.className = `${CSS_CLASSES.UNDO_REDO_BTN} ${CSS_CLASSES.REDO_BTN}`;
        redoBtn.innerHTML = BUTTON_SYMBOLS.REDO;

        redoBtn.title = KEYBOARD_SHORTCUTS.REDO.description;''
        redoBtn.setAttribute('aria-label', 'やり直し);
        redoBtn.disabled = true;
        ';
        // スタイルを適用
        this.applyUndoRedoStyles()';
        undoBtn.addEventListener('click', () => this.undo());''
        redoBtn.addEventListener('click', () => this.redo();
        
        document.body.appendChild(undoBtn);
        document.body.appendChild(redoBtn);
        
        this.ui.undoButton = undoBtn;
        this.ui.redoButton = redoBtn;
    }

    /**
     * Undo/Redoボタンのスタイルを適用'
     */''
    private applyUndoRedoStyles()';
        if(document.getElementById('undo-redo-styles) return;
        
        const styles = `;
            .${CSS_CLASSES.UNDO_REDO_BTN} { position: fixed,
                width: 45px;
                height: 45px;
                border-radius: 50%,
                border: 2px solid #6c757d;
                background: white;
                color: #6c757d;
                font-size: 20px,
                cursor: pointer;
                z-index: 9997,
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                font-family: inherit, }
            
            .${CSS_CLASSES.UNDO_BTN} { bottom: 80px,
                right: 20px ,}
            
            .${CSS_CLASSES.REDO_BTN} { bottom: 135px;
                right: 20px }
            
            .${CSS_CLASSES.UNDO_REDO_BTN}:not(:disabled):hover { background: #6c757d;
                color: white,
                transform: scale(1.1 ,}
            
            .${CSS_CLASSES.UNDO_REDO_BTN}:disabled { opacity: 0.3;
                cursor: not-allowed }
            
            .${CSS_CLASSES.UNDO_REDO_BTN}:focus { outline: 2px solid #007bff;
                outline-offset: 2px, }
        `;

        const styleSheet = document.createElement('style'');''
        styleSheet.id = 'undo-redo-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * イベントリスナーを設定'
     */''
    private setupEventListeners()';
        document.addEventListener('keydown', this.keydownHandler);
        ';
        // ゲームエンジンイベント
        if(this.gameEngine.eventEmitter) {'

            this.gameEngine.eventEmitter.on('gameAction', this.gameActionHandler);

        }

            this.gameEngine.eventEmitter.on('stateChange', this.stateChangeHandler); }
}

    /**
     * キーボードイベントを処理
     */'
    private handleKeydown(event: KeyboardEvent): void { ''
        if(this.state.operationInProgress) return;
        ';
        // Ctrl+Z で Undo
        if(event.ctrlKey && event.key === 'z' && !event.shiftKey) {'
            event.preventDefault();''
            this.undo()';
        else if ((event.ctrlKey && event.key === 'y'') || '';
                 (event.ctrlKey && event.shiftKey && event.key === 'z') {
            event.preventDefault();
        }
            this.redo(); }
}

    /**
     * ゲームアクションを処理
     */
    private handleGameAction(action: ActionData): void { if (!this.config.enabled || !this.state.isRecording) return;
        
        // 無視すべきアクション
        if(isActionIgnored(action.type, this.config.ignoredActions) return;
        
        // アクションを記録
        this.recordAction(action); }

    /**
     * 状態変更を処理
     */
    private handleStateChange(stateChange: StateChangeData): void { // 状態変更に基づくアクション記録
        if(stateChange.significant && this.state.isRecording) {'
            this.recordAction({)'
                type: 'stateChange' }
                subtype: stateChange.type,) }
                data: stateChange.data || {}
            );
        }
    }

    /**
     * アクションを記録
     */
    recordAction(action: ActionData): void { try {
            // 現在位置以降の履歴を削除（新しいブランチの開始）
            if(this.currentIndex < this.actionHistory.length - 1) {
                
            }
                this.actionHistory = this.actionHistory.slice(0, this.currentIndex + 1); }
            }
            
            // アクション前の状態をキャプチャ
            const stateBefore = this.captureGameState();
            
            // アクションオブジェクトを作成
            const actionRecord: ActionRecord = { ''
                id: generateActionId()';
                subtype: action.subtype || 'default');
                timestamp: Date.now();
                stateBefore: stateBefore;
                stateAfter: null, // 後で設定 }
                data: { ...action.data;
                metadata: { ''
                    isCritical: isActionCritical(action.type, this.config.criticalActions),
                    canUndo: action.canUndo !== false, }

                    description: action.description || `${action.type} action`,''
                    priority: action.priority || 'normal';
                    category: this.categorizeAction(action.type);
                    estimatedImpact: this.estimateImpact(action);
                }
            };
            
            // 履歴に追加
            this.actionHistory.push(actionRecord);
            this.currentIndex++;
            
            // 最大履歴数を制限
            if(this.actionHistory.length > this.config.maxHistory) {
                this.actionHistory.shift();
            }
                this.currentIndex--; }
            }
            
            // 少し後にアクション後の状態をキャプチャ
            setTimeout(() => {  if (this.actionHistory[this.currentIndex]) { }
                    this.actionHistory[this.currentIndex].stateAfter = this.captureGameState(); }
}, 100);
            
            // 統計更新
            this.state.actionCount++;
            this.state.lastAction = actionRecord;
            
            // UI更新
            this.updateButtons();
            
            console.log(`[UndoRedoSystem] Action, recorded: ${actionRecord.id}`});

        } catch (error) { console.error('[UndoRedoSystem] Action recording error:', error }
    }

    /**
     * アクションをカテゴライズ'
     */''
    private categorizeAction(actionType: string): ActionCategory { ''
        if (actionType.includes('bubble'') || actionType.includes('game)) return 'game';''
        if (actionType.includes('ui'') || actionType.includes('button)) return 'ui';''
        if (actionType.includes('player'') || actionType.includes('user)) return 'player';''
        if (actionType.includes('scene'') || actionType.includes('screen)) return 'scene';''
        return 'system'; }

    /**
     * アクションの影響を推定'
     */''
    private estimateImpact(action: ActionData): ImpactLevel { ''
        const criticalTypes = ['reset', 'newGame', 'delete', 'clear'];''
        const highTypes = ['move', 'pop', 'score', 'level'];''
        const mediumTypes = ['ui', 'setting', 'sound'];

        if(criticalTypes.some(type => action.type.includes(type)) return 'major';''
        if(highTypes.some(type => action.type.includes(type)) return 'high';''
        if(mediumTypes.some(type => action.type.includes(type)) return 'medium';

        return 'minimal';

    /**
     * ゲーム状態をキャプチャ
     */
    private captureGameState(): GameStateSnapshot { const gameState: GameStateSnapshot = {
            timestamp: Date.now( ,};
        
        try { // ゲームエンジンから状態を取得
            if(this.gameEngine.gameState) {
                
            }
                gameState.game = deepClone(this.gameEngine.gameState); }
            }
            
            // プレイヤーデータ
            if (this.gameEngine.playerData) { gameState.player = this.gameEngine.playerData.exportData(); }
            
            // シーン状態
            if(this.gameEngine.sceneManager) { gameState.scene = {
                    current: this.gameEngine.sceneManager.getCurrentScene( }
                    data: this.gameEngine.sceneManager.getSceneData(); }
                }
            
            // バブル状態
            if (this.gameEngine.bubbleManager) { gameState.bubbles = this.gameEngine.bubbleManager.exportState(); }
            
            // スコア状態
            if (this.gameEngine.scoreManager) { gameState.score = this.gameEngine.scoreManager.getState();' }'

            } catch (error) { console.warn('[UndoRedoSystem] State capture error:', error }
        
        return gameState;
    }

    /**
     * Undo操作
     */
    undo(): boolean { if (!this.canUndo() || this.state.operationInProgress) {
            this.showUndoFeedback({ message: FEEDBACK_MESSAGES.UNDO_FAILED ),
            return false }
        
        try { this.state.operationInProgress = true;
            
            const action = this.actionHistory[this.currentIndex];
            
            // 記録停止
            this.state.isRecording = false;
            
            // 状態を復元
            this.restoreGameState(action.stateBefore);
            
            this.currentIndex--;
            this.state.undoCount++;
            // UI更新
            this.updateButtons()';
            this.emitEvent('actionUndone', action);
            
            this.showUndoFeedback({ )'
                message: FEEDBACK_MESSAGES.UNDO_SUCCESS,')';
                type: 'success');
             ,}
            console.log(`[UndoRedoSystem] Undo, completed: ${action.id}`});
            return true;

        } catch (error) { console.error('[UndoRedoSystem] Undo error:', error);
            this.state.isRecording = true;
            this.state.operationInProgress = false;
            this.showUndoFeedback({ )'
                message: FEEDBACK_MESSAGES.UNDO_ERROR,')';
                type: 'error' ,});
            return false;

    /**
     * Redo操作
     */
    redo(): boolean { if (!this.canRedo() || this.state.operationInProgress) {
            this.showUndoFeedback({ message: FEEDBACK_MESSAGES.REDO_FAILED ),
            return false }
        
        try { this.state.operationInProgress = true;
            
            this.currentIndex++;
            const action = this.actionHistory[this.currentIndex];
            
            // 記録停止
            this.state.isRecording = false;
            
            // 状態を復元
            if(action.stateAfter) {
                
            }
                this.restoreGameState(action.stateAfter); }
            }
            
            this.state.redoCount++;
            // UI更新
            this.updateButtons()';
            this.emitEvent('actionRedone', action);
            ';

            this.showUndoFeedback({ message: FEEDBACK_MESSAGES.REDO_SUCCESS,)'
                type: 'success');
             ,}
            console.log(`[UndoRedoSystem] Redo, completed: ${action.id}`});
            return true;

        } catch (error) { console.error('[UndoRedoSystem] Redo error:', error);
            this.state.isRecording = true;
            this.state.operationInProgress = false;
            this.showUndoFeedback({ )'
                message: FEEDBACK_MESSAGES.REDO_ERROR,')';
                type: 'error' ,});
            return false;

    /**
     * Undoが可能かチェック
     */
    canUndo(): boolean { return this.config.enabled && 
               this.currentIndex >= 0 &&;
               this.actionHistory.length > 0 &&;
               this.actionHistory[this.currentIndex]? .metadata?.canUndo !== false; }

    /**
     * Redoが可能かチェック
     */ : undefined
    canRedo(): boolean { return this.config.enabled && 
               this.currentIndex < this.actionHistory.length - 1 &&;
               this.actionHistory[this.currentIndex + 1]? .stateAfter !== null; }

    /**
     * ゲーム状態を復元
     */ : undefined'
    private restoreGameState(state: GameStateSnapshot): void { ''
        if(!validateGameState(state)) {''
            throw new Error('Invalid, game state, for restoration); }'
        
        try { // ゲーム状態の復元
            if(state.game && this.gameEngine.gameState) {
                
            }
                Object.assign(this.gameEngine.gameState, state.game); }
            }
            
            // プレイヤーデータの復元
            if (state.player && this.gameEngine.playerData) { this.gameEngine.playerData.importData(state.player); }
            
            // シーン状態の復元
            if (state.scene && this.gameEngine.sceneManager) { this.gameEngine.sceneManager.restoreScene(state.scene); }
            
            // バブル状態の復元
            if (state.bubbles && this.gameEngine.bubbleManager) { this.gameEngine.bubbleManager.importState(state.bubbles); }
            
            // スコア状態の復元
            if (state.score && this.gameEngine.scoreManager) { this.gameEngine.scoreManager.setState(state.score); }
            
            // UIを更新
            if (this.gameEngine.render) { this.gameEngine.render();' }'

            } catch (error) {
            console.error('[UndoRedoSystem] State restoration error:', error);
            throw error; }
    }

    /**
     * ボタンの状態を更新
     */
    private updateButtons(): void { if (this.ui.undoButton) {'
            this.ui.undoButton.disabled = !this.canUndo();''
            this.ui.undoButton.title = this.canUndo(''';
                KEYBOARD_SHORTCUTS.UNDO.description: '元に戻せません' })
        );
        if(this.ui.redoButton) {'
            this.ui.redoButton.disabled = !this.canRedo();''
            this.ui.redoButton.title = this.canRedo('';
        }

                KEYBOARD_SHORTCUTS.REDO.description: 'やり直せません', }
}

    /**
     * フィードバック表示)
     */)
    private showUndoFeedback(options: FeedbackOptions): void { const feedback = createFeedbackElement(options);
        const duration = options.duration || DEFAULT_FEEDBACK_DURATION;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => { 
            if (feedback.parentNode) { }
                feedback.parentNode.removeChild(feedback); }
}, duration);
    }

    /**
     * イベントを発火
     */
    private emitEvent(eventName: string, data: any): void { if (this.gameEngine.eventEmitter) { }
            this.gameEngine.eventEmitter.emit(`undoRedo:${eventName}`, data});
        }
    }

    /**
     * 履歴をクリア
     */
    clearHistory(): void { this.actionHistory = [];
        this.currentIndex = -1;
        this.state.actionCount = 0;
        this.state.undoCount = 0;
        this.state.redoCount = 0;
        this.state.lastAction = null;

        this.updateButtons()';
        console.log('[UndoRedoSystem] History, cleared'); }'

    /**
     * 統計情報を取得
     */
    getStatistics(): UndoRedoStatistics { const totalStateSize = this.actionHistory.reduce((sum, action) => { 
            return sum + calculateStateSize(action.stateBefore) +  }
                   (action.stateAfter ? calculateStateSize(action.stateAfter) : 0);, 0);
        
        return { enabled: this.config.enabled,
            totalActions: this.state.actionCount;
            undoCount: this.state.undoCount;
            redoCount: this.state.redoCount;
            historyLength: this.actionHistory.length;
            currentIndex: this.currentIndex;
            canUndo: this.canUndo();
            canRedo: this.canRedo();
            lastAction: this.state.lastAction? .type || null, : undefined
            averageStateSize: this.actionHistory.length > 0 ?   : undefined
                Math.round(totalStateSize / this.actionHistory.length / 2) : 0, };
            memoryUsage: totalStateSize }
        }

    /**
     * アクション履歴を取得
     */
    getActionHistory(): ReadonlyArray<ActionRecord> { return [...this.actionHistory];

    /**
     * 特定のアクションを検索
     */
    findActionById(actionId: string): ActionRecord | null { return this.actionHistory.find(action => action.id === actionId) || null;

    /**
     * アクションタイプでフィルター
     */
    getActionsByType(actionType: string): ActionRecord[] { return this.actionHistory.filter(action => action.type === actionType);

    /**
     * 設定を更新
     */
    updateSettings(newSettings: Partial<UndoRedoConfig>): void {'
        this.config = { ...this.config, ...newSettings;''
        this.updateButtons()';
        console.log('[UndoRedoSystem] Settings updated:', newSettings);
    }

    /**
     * 記録の有効/無効を切り替え'
     */''
    setRecording(enabled: boolean): void { this.state.isRecording = enabled;' }'

        console.log(`[UndoRedoSystem] Recording ${enabled ? 'enabled' : 'disabled}`});
    }

    /**
     * システムの有効/無効を切り替え
     */'
    setEnabled(enabled: boolean): void { this.config.enabled = enabled;''
        this.updateButtons( }

        console.log(`[UndoRedoSystem] System ${enabled ? 'enabled' : 'disabled}`});
    }

    /**
     * リソースの解放
     */
    destroy(): void { // UI要素を削除
        if(this.ui.undoButton && this.ui.undoButton.parentNode) {
            
        }
            this.ui.undoButton.parentNode.removeChild(this.ui.undoButton); }
        }
        
        if(this.ui.redoButton && this.ui.redoButton.parentNode) {
        ';

            ';

        }

            this.ui.redoButton.parentNode.removeChild(this.ui.redoButton); }
        }
        ';
        // スタイルシートを削除
        const styleSheet = document.getElementById('undo-redo-styles);
        if(styleSheet && styleSheet.parentNode) {'
            ';

        }

            styleSheet.parentNode.removeChild(styleSheet); }
        }
        ';
        // イベントリスナーを削除
        document.removeEventListener('keydown', this.keydownHandler);
        
        if(this.gameEngine.eventEmitter) {
        
            // Note: eventEmitterにremoveListenerメソッドがあると仮定
            try {'
                (this.gameEngine.eventEmitter, as any').removeListener? .('gameAction', this.gameActionHandler);

        }

                (this.gameEngine.eventEmitter, as any').removeListener?.('stateChange', this.stateChangeHandler);' }

            } catch (error) { : undefined''
                console.warn('[UndoRedoSystem] Failed to remove event listeners:', error 
        }
        ';
        // 履歴をクリア
        this.clearHistory()';
        console.log('[UndoRedoSystem] Component, destroyed'');

    }''
}