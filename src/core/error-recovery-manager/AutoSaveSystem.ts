/**
 * AutoSaveSystem
 * 
 * 自動保存システム機能を担当
 * Backup & Recovery Pattern & Checkpoint Systemの一部として設計
 * 
 * **Features**:
 * - Periodic game state saving and restoration
 * - Emergency backup and recovery mechanisms
 * - Save point management with storage optimization
 * - Critical action checkpointing
 * 
 * @module AutoSaveSystem
 * Created: Phase G.11 (Issue #103)
 */

// 型定義
export interface AutoSaveConfig { enabled: boolean,
    interval: number;
    maxSavePoints: number;
    gracePeriod: number;
   , emergencyRestore: boolean;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean; ,}

export interface SavePoint { id: string,
    timestamp: number;
    type: SaveType;
    state: GameStateSaveData;
   , metadata: SavePointMetadata;
    checksum?: string;
    compressed?: boolean; ,}

export interface SavePointMetadata { version: string,
    gameVersion: string;
    saveIndex: number;
   , size: number;
    playerLevel?: number;
    gameMode?: string;
    location?: string;
    description?: string; ,}

export interface GameStateSaveData { game?: any;
    player?: PlayerSaveData;
    scene?: SceneSaveData;
    settings?: Record<string, any>;
    bubbles?: BubbleSaveData;
    score?: ScoreSaveData;
    timestamp: number;
   , sessionId: string ,}

export interface PlayerSaveData { id?: string;
    name?: string;
    level?: number;
    experience?: number;
    currency?: number;
    inventory?: InventoryData;
    achievements?: string[];
    statistics?: PlayerSaveStatistics;
    preferences?: UserPreferences;
    }

export interface PlayerSaveStatistics { totalPlayTime: number,
    gamesPlayed: number;
    totalScore: number;
    bestScore: number;
    averageScore: number;
    bubblesPopped: number;
   , combos: number ,}

export interface UserPreferences { soundEnabled: boolean;
    musicEnabled: boolean;
    difficulty: string;
   , controls: Record<string, any>,
    accessibility: Record<string, any>, }

export interface InventoryData { items: InventoryItem[],
    capacity: number;
   , categories: string[] ,}

export interface InventoryItem { id: string;
    type: string;
   , quantity: number;
    metadata?: Record<string, any> }

export interface SceneSaveData { current: string,
    data: Record<string, any>,
    history?: string[];
    transition?: TransitionSaveData;
    }

export interface TransitionSaveData { from: string,
    to: string;
    progress: number;
    startTime: number;
   , type: string ,}

export interface BubbleSaveData { bubbles: BubbleSaveEntry[];
    grid: GridSaveData;
    physics: PhysicsSaveData;
    effects: EffectSaveEntry[];
   , state: BubbleGameState
    }

export interface BubbleSaveEntry { id: string;
   , type: BubbleType;
    }
    position: { x: number;, y: number }
    velocity?: { x: number;, y: number },
    color: BubbleColor;
    size: number;
   , state: BubbleState;
    properties?: Record<string, any>;
}

export interface GridSaveData { width: number,
    height: number;
    cellSize: number;
   , occupied: boolean[][];
    patterns?: GridPattern[]
    ,}

export interface GridPattern { name: string, }
    positions: { x: number;, y: number }[],
    color: BubbleColor;
    }

export interface PhysicsSaveData { gravity: number,
    friction: number;
    bounce: number;
   , timeStep: number, }
    wind?: { x: number;, y: number }

export interface EffectSaveEntry { id: string,
    type: EffectType;
    ,}
    position: { x: number;, y: number },
    duration: number;
   , progress: number;
    properties?: Record<string, any>;
}

export interface BubbleGameState { paused: boolean,
    level: number;
    timeRemaining: number;
    combo: number;
   , powerUps: string[] ,}

export interface ScoreSaveData { current: number;
    best: number;
    combo: number;
    multiplier: number;
    level: number;
    progress: number;
   , bonuses: ScoreBonus[]
    }

export interface ScoreBonus { type: string;
    value: number;
   , timestamp: number;
    duration?: number }

export interface AutoSaveSystemState { isRunning: boolean;
    lastSaveTime: number;
    saveCount: number;
    restoreCount: number;
    emergencyRestores: number;
   , saveErrors: number;
    consecutiveErrors?: number;
    lastErrorTime?: number; }

export interface StorageKeys { saveStates: string,
    metadata: string;
   , emergency: string;
    checksum?: string;
    index?: string; ,}

export interface AutoSaveGameEngine { version?: string;
    sessionId?: string;
    gameState?: any;
    playerData?: PlayerDataManager;
    sceneManager?: SceneManager;
    settingsManager?: SettingsManager;
    bubbleManager?: BubbleManager;
    scoreManager?: ScoreManager;
    eventEmitter?: AutoSaveEventEmitter;
    render?: () => void; }
}

export interface PlayerDataManager { exportData(): PlayerSaveData;
    importData(data: PlayerSaveData): void, }

export interface SceneManager { getCurrentScene(): string;
    getSceneData(): Record<string, any>;
    restoreScene(sceneData: SceneSaveData): void, }

export interface SettingsManager { getAllSettings(): Record<string, any>;
    restoreSettings(settings: Record<string, any>): void }

export interface BubbleManager { exportState(): BubbleSaveData;
    importState(state: BubbleSaveData): void, }

export interface ScoreManager { getState(): ScoreSaveData;
    setState(state: ScoreSaveData): void, }

export interface AutoSaveEventEmitter { on(event: string, callback: Function): void,
    emit(event: string, data?: any): void;
    removeListener?(event: string, callback: Function): void 
export interface SavePointInfo { i;d: string,
    timestamp: number;
    type: SaveType;
   , metadata: SavePointMetadata;
    size?: number;
    valid?: boolean; ,}

export interface StorageQuotaInfo { used: number,
    available: number;
    total: number;
   , percentage: number ,}

export interface AutoSaveStatistics { enabled: boolean;
    isRunning: boolean;
    saveInterval: number;
    savePointCount: number;
    maxSavePoints: number;
    totalSaves: number;
    totalRestores: number;
    emergencyRestores: number;
    saveErrors: number;
    lastSaveTime: number;
    oldestSaveTime: number | null;
   , newestSaveTime: number | null;
    averageSaveSize?: number;
    storageUsage?: StorageQuotaInfo;
    consecutiveErrors?: number; }

export interface RestoreOptions { validate?: boolean;
    skipErrors?: boolean;
    partialRestore?: boolean;
    backupCurrent?: boolean; }

export interface SaveOptions { force?: boolean;
    compress?: boolean;
    encrypt?: boolean;
    description?: string;
    metadata?: Record<string, any>; }

export interface ValidationResult { valid: boolean,
    errors: string[];
   , warnings: string[];
    repaired?: boolean ,}

// 列挙型
export type SaveType = 'initial' | 'periodic' | 'manual' | 'final' | 'emergency' | 'beforeCritical' | '';
                       'beforeUnload' | 'windowBlur' | 'windowFocus' | 'gameStart' | 'gameEnd' | 'destroy';

export type BubbleType = 'normal' | 'special' | 'power' | 'bonus' | 'obstacle' | 'multiplier';''
export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'white' | 'black';''
export type BubbleState = 'idle' | 'moving' | 'popping' | 'falling' | 'locked' | 'charging' | 'exploding';''
export type EffectType = 'explosion' | 'sparkle' | 'trail' | 'glow' | 'shake' | 'fade' | 'grow' | 'shrink';

// 定数
export const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = { enabled: true,
    interval: 30000, // 30秒;
    maxSavePoints: 5;
   , gracePeriod: 5000, // 5秒;
    emergencyRestore: true;
    compressionEnabled: false;
   , encryptionEnabled: false ,} as const;
';

export const STORAGE_KEYS: StorageKeys = {;
    saveStates: 'errorRecoverySaveStates',
    metadata: 'errorRecoverySaveMetadata',
    emergency: 'errorRecoveryEmergencySave',
    checksum: 'errorRecoverySaveChecksum',
    index: 'errorRecoverySaveIndex' ,} as const;
export const SAVE_TYPE_PRIORITIES: Record<SaveType, number> = { emergency: 10,
    beforeCritical: 9;
    gameEnd: 8;
    beforeUnload: 7;
    final: 6;
    manual: 5;
    gameStart: 4;
    initial: 3;
    windowBlur: 2;
    windowFocus: 1;
    periodic: 1;
   , destroy: 0 ,} as const;
export const SAVE_VALIDATION_RULES = { MIN_STATE_SIZE: 10, // bytes
    MAX_STATE_SIZE: 50 * 1024 * 1024, // 50MB;
    REQUIRED_FIELDS: ['timestamp', 'sessionId'],
    MAX_SAVE_POINTS: 50;
   , MIN_SAVE_INTERVAL: 1000 // 1秒 ,} as const;
export const ERROR_RECOVERY_THRESHOLDS = { MAX_CONSECUTIVE_ERRORS: 3,
    ERROR_COOLDOWN_PERIOD: 10000, // 10秒;
    EMERGENCY_CLEANUP_THRESHOLD: 10;
   , STORAGE_WARNING_THRESHOLD: 0.8 // 80% ,} as const;
// ユーティリティ関数
export function generateSaveId(): string {
    return `save_${Date.now(})_${Math.random(}.toString(36}.substr(2, 9})`;
}

export function calculateSavePointSize(savePoint: SavePoint): number { try {
        const serialized = JSON.stringify(savePoint);
        return new Blob([serialized]).size; } catch { return 0;

export function validateSaveData(data: GameStateSaveData): ValidationResult { const result: ValidationResult = {
        valid: true;
        errors: [];
       , warnings: [] };
    ';
    // 基本的な必須フィールドをチェック
    if(!data || typeof, data !== 'object'') {'
        result.valid = false;''
        result.errors.push('Save, data is, not a, valid object);
    }
        return result;

    if(!data.timestamp) {'
        result.valid = false;

    }

        result.errors.push('Missing, timestamp); }'
    }

    if(!data.sessionId) {', ';

    }

        result.warnings.push('Missing, session ID); }'
    }
    
    // データサイズチェック
    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;

    if(size < SAVE_VALIDATION_RULES.MIN_STATE_SIZE) {', ';

    }

        result.warnings.push('Save data is very small, may be incomplete); }'
    }

    if(size > SAVE_VALIDATION_RULES.MAX_STATE_SIZE) {'
        result.valid = false;

    }

        result.errors.push('Save, data exceeds, maximum size, limit); }'
    }
    
    return result;
}

export function compressSaveData(data: SavePoint): SavePoint { try {
        // 簡単な圧縮シミュレーション（実際のプロジェクトでは適切な圧縮ライブラリを使用）
        const compressed = {
            ...data,
            state: JSON.parse(JSON.stringify(data.state), // Deep clone;
            compressed: true ,};
        compressed.metadata.size = calculateSavePointSize(compressed);
        return compressed;''
    } catch (error) {
        console.warn('[AutoSaveSystem] Compression failed:', error);
        return data;

export function decompressSaveData(data: SavePoint): SavePoint { if (!data.compressed) return data;
    
    try {
        // 解凍処理（実装は圧縮に対応）
        const decompressed = {
            ...data,
            compressed: false ,};
        ';

        return decompressed;''
    } catch (error) {
        console.warn('[AutoSaveSystem] Decompression failed:', error);
        return data;

export function calculateChecksum(data: any): string { // 簡単なチェックサム計算（実際のプロジェクトではより堅牢なハッシュを使用）
    const str = JSON.stringify(data);
    let hash = 0;
    for(let, i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
    ,}
        hash = hash & hash; // 32-bit integer }
    }
    return Math.abs(hash).toString(16);
}

export function isQuotaExceededError(error: Error): boolean {;
    return error.name === 'QuotaExceededError' || '';
           error.message.includes('quota'') ||'';
           error.message.includes('storage); }'

export function formatSaveType(saveType: SaveType): string { const typeNames: Record<SaveType, string> = {''
        initial: '初期保存',
        periodic: '定期保存',
        manual: '手動保存',
        final: '最終保存',
        emergency: '緊急保存',
        beforeCritical: '重要操作前',
        beforeUnload: 'ページ離脱前',
        windowBlur: 'フォーカス喪失',
        windowFocus: 'フォーカス取得',
        gameStart: 'ゲーム開始',
        gameEnd: 'ゲーム終了',
        destroy: '破棄時' ,};
    return typeNames[saveType] || saveType;
}

export function sortSavePointsByPriority(savePoints: SavePoint[]): SavePoint[] { return [...savePoints].sort((a, b) => { 
        const priorityA = SAVE_TYPE_PRIORITIES[a.type] || 0;
        const priorityB = SAVE_TYPE_PRIORITIES[b.type] || 0;
        
        if (priorityA !== priorityB) { }
            return priorityB - priorityA; // 高い優先度を先に }
        }
        
        return b.timestamp - a.timestamp; // 新しいものを先に
    }

export class AutoSaveSystem {
    private config: AutoSaveConfig;
    private gameEngine: AutoSaveGameEngine;
    private savePoints: SavePoint[];
    private currentSaveIndex: number;
    private timer: number | null;
    private state: AutoSaveSystemState;
    // イベントハンドラーの参照保持
    private gameStartHandler: () => void;
    private gameEndHandler: () => void;
    private gameErrorHandler: (error: any) => void;
    private criticalActionHandler: (action: any) => void;
    private beforeUnloadHandler: (event: BeforeUnloadEvent) => void;
    private windowBlurHandler: () => void;
    private windowFocusHandler: () => void;

    constructor(config: Partial<AutoSaveConfig>, gameEngine: AutoSaveGameEngine) {
        this.config = { ...DEFAULT_AUTO_SAVE_CONFIG, ...config;
        this.gameEngine = gameEngine;
        
        // 保存データ
        this.savePoints = [];
        this.currentSaveIndex = 0;
        this.timer = null;
        
        // 状態管理
        this.state = { isRunning: false,
            lastSaveTime: 0;
            saveCount: 0;
            restoreCount: 0;
            emergencyRestores: 0;
            saveErrors: 0;
            consecutiveErrors: 0;
           , lastErrorTime: 0 ,};
        // イベントハンドラーをバインド
        this.gameStartHandler = this.handleGameStart.bind(this);
        this.gameEndHandler = this.handleGameEnd.bind(this);
        this.gameErrorHandler = this.handleGameError.bind(this);
        this.criticalActionHandler = this.handleCriticalAction.bind(this);
        this.beforeUnloadHandler = this.handleBeforeUnload.bind(this);
        this.windowBlurHandler = this.handleWindowBlur.bind(this);
        this.windowFocusHandler = this.handleWindowFocus.bind(this);
        
        this.initialize();
    }

    /**
     * システムを初期化
     */
    private initialize(): void { this.loadSavePoints();
        this.setupEventListeners();
        
        if(this.config.enabled) {
        ';

            this.start();
        }

        console.log('[AutoSaveSystem] Component, initialized'); }'
    }

    /**
     * 保存点を読み込み
     */
    private loadSavePoints(): void { try {
            const savedStates = localStorage.getItem(STORAGE_KEYS.saveStates);
            const savedMetadata = localStorage.getItem(STORAGE_KEYS.metadata);
            
            if(savedStates) {
            
                const parsedStates = JSON.parse(savedStates) as SavePoint[];
            
            }
                this.savePoints = parsedStates.filter(sp => this.validateSavePoint(sp); }
                console.log(`[AutoSaveSystem] Loaded ${this.savePoints.length} save, points`});
            }
            
            if (savedMetadata) { const metadata = JSON.parse(savedMetadata); }
                this.state = { ...this.state, ...metadata;
            }
            
            // インデックスを修復
            this.repairSaveIndex();

        } catch (error) {
            console.warn('[AutoSaveSystem] Save points loading error:', error);
            this.savePoints = []; }
    }

    /**
     * 保存点を検証'
     */''
    private validateSavePoint(savePoint: SavePoint): boolean { ''
        if(!savePoint || typeof, savePoint !== 'object) return false;
        if (!savePoint.id || !savePoint.timestamp) return false;
        if (!savePoint.state) return false;
        
        const validation = validateSaveData(savePoint.state);
        return validation.valid; }

    /**
     * 保存インデックスを修復
     */
    private repairSaveIndex(): void { if (this.savePoints.length > 0) {
            const maxIndex = Math.max(...this.savePoints.map(sp => sp.metadata.saveIndex || 0);
            this.currentSaveIndex = maxIndex + 1; }
}

    /**
     * イベントリスナーを設定
     */'
    private setupEventListeners(): void { // ゲームエンジンイベント
        if(this.gameEngine.eventEmitter) {'

            this.gameEngine.eventEmitter.on('gameStart', this.gameStartHandler);''
            this.gameEngine.eventEmitter.on('gameEnd', this.gameEndHandler);''
            this.gameEngine.eventEmitter.on('gameError', this.gameErrorHandler);

        }

            this.gameEngine.eventEmitter.on('criticalAction', this.criticalActionHandler); }
        }
        ';
        // ブラウザイベント
        window.addEventListener('beforeunload', this.beforeUnloadHandler);''
        window.addEventListener('blur', this.windowBlurHandler);''
        window.addEventListener('focus', this.windowFocusHandler);
    }

    /**
     * 自動保存を開始
     */'
    start(): void { ''
        if(this.state.isRunning) return;
        
        this.state.isRunning = true;
        ';
        // 初回保存
        this.performSave('initial);
        ';
        // 定期保存を開始
        this.timer = window.setInterval(() => { ' }'

            this.performSave('periodic); }'
        }, this.config.interval);
        
        console.log(`[AutoSaveSystem] Auto-save, started (${this.config.interval}ms, interval)`);
    }

    /**
     * 自動保存を停止
     */
    stop(): void { if (!this.state.isRunning) return;
        
        this.state.isRunning = false;
        
        if(this.timer) {
        ';

            clearInterval(this.timer);
        
        }
            this.timer = null; }
        }
        ';
        // 最終保存
        this.performSave('final'');

        console.log('[AutoSaveSystem] Auto-save, stopped'');
    }

    /**
     * 保存を実行'
     */''
    performSave(saveType: SaveType = 'manual', options: SaveOptions = { ): boolean {
        // 連続エラーチェック
        if(this.state.consecutiveErrors && this.state.consecutiveErrors >= ERROR_RECOVERY_THRESHOLDS.MAX_CONSECUTIVE_ERRORS) {
            const cooldownExpired = Date.now() - (this.state.lastErrorTime || 0) > ERROR_RECOVERY_THRESHOLDS.ERROR_COOLDOWN_PERIOD;''
            if(!cooldownExpired && !options.force) {''
                console.log('[AutoSaveSystem] Save skipped due to consecutive errors, waiting for cooldown);
        }
                return false;
        
        try { const gameState = this.captureGameState();

            if (!this.isValidGameState(gameState) && !options.force') {''
                console.log('[AutoSaveSystem] Invalid state, save skipped');
                return false; }
            ';

            const savePoint: SavePoint = { id: generateSaveId(),''
                timestamp: Date.now(''';
                   , version: '1.0',
                    gameVersion: this.gameEngine.version || '1.0';
                    saveIndex: this.currentSaveIndex++;
                   , size: 0, // 後で計算);
                    description: options.description);
                    ...options.metadata,)
                checksum: calculateChecksum(gameState);
            ,};
            
            // 圧縮処理
            let finalSavePoint = savePoint;
            if (this.config.compressionEnabled || options.compress) { finalSavePoint = compressSaveData(savePoint); }
            
            // サイズを計算
            finalSavePoint.metadata.size = calculateSavePointSize(finalSavePoint);
            
            // 保存点を追加
            this.savePoints.push(finalSavePoint);
            
            // 最大保存数を超えた場合、古いものを削除
            this.cleanupOldSavePoints();
            
            // ストレージに保存
            this.saveSavePoints();
            
            // 統計更新
            this.state.saveCount++;
            this.state.lastSaveTime = Date.now();
            this.state.consecutiveErrors = 0; // エラーカウントリセット
            
            console.log(`[AutoSaveSystem] Save, completed (${formatSaveType(saveType})) - ${finalSavePoint.id}`);
            return true;

        } catch (error) {
            console.error('[AutoSaveSystem] Save error:', error);
            this.state.saveErrors++;
            this.state.consecutiveErrors = (this.state.consecutiveErrors || 0) + 1;
            this.state.lastErrorTime = Date.now();
            
            // ストレージ容量エラーの特別処理
            if(isQuotaExceededError(error, as Error) {
                
            }
                this.handleStorageQuotaExceeded(); }
            }
            
            return false;

    /**
     * 古い保存点をクリーンアップ
     */
    private cleanupOldSavePoints(): void { if (this.savePoints.length <= this.config.maxSavePoints) return;
        
        // 優先度でソートして削除対象を決定
        const sortedSaves = sortSavePointsByPriority(this.savePoints);
        const toKeep = sortedSaves.slice(0, this.config.maxSavePoints);
        const toRemove = sortedSaves.slice(this.config.maxSavePoints);
        
        this.savePoints = toKeep;
         }
        console.log(`[AutoSaveSystem] Cleaned, up ${toRemove.length} old, save points`});
    }

    /**
     * ゲーム状態をキャプチャ
     */
    private captureGameState(): GameStateSaveData { const gameState: GameStateSaveData = {''
            timestamp: Date.now(''';
           , sessionId: this.gameEngine.sessionId || 'unknown' }))
        try { // ゲームエンジンから状態を取得)
            if(this.gameEngine.gameState) {
                
            }
                gameState.game = JSON.parse(JSON.stringify(this.gameEngine.gameState); }
            }
            
            // プレイヤーデータ
            if (this.gameEngine.playerData) { gameState.player = this.gameEngine.playerData.exportData(); }
            
            // シーン状態
            if(this.gameEngine.sceneManager) { gameState.scene = {
                    current: this.gameEngine.sceneManager.getCurrentScene( }
                    data: this.gameEngine.sceneManager.getSceneData(); }
                }
            
            // 設定
            if (this.gameEngine.settingsManager) { gameState.settings = this.gameEngine.settingsManager.getAllSettings(); }
            
            // バブル状態（ゲーム中の場合）
            if (this.gameEngine.bubbleManager && this.gameEngine.gameState? .playing) { gameState.bubbles = this.gameEngine.bubbleManager.exportState(); }
            
            // スコア状態
            if (this.gameEngine.scoreManager) { gameState.score = this.gameEngine.scoreManager.getState();' }'

            } catch (error) { : undefined''
            console.warn('[AutoSaveSystem] State capture error:', error 
        return gameState;
    }

    /**
     * ゲーム状態が有効かチェック
     */
    private isValidGameState(gameState: GameStateSaveData): boolean { const validation = validateSaveData(gameState);
        return validation.valid; }

    /**
     * 保存点をLocalStorageに保存
     */
    private saveSavePoints(): void { try {
            // 保存点データ
            localStorage.setItem(STORAGE_KEYS.saveStates, JSON.stringify(this.savePoints);
            
            // メタデータ
            const metadata: Partial<AutoSaveSystemState> = {
                saveCount: this.state.saveCount;
                lastSaveTime: this.state.lastSaveTime;
                restoreCount: this.state.restoreCount;
                emergencyRestores: this.state.emergencyRestores;
                saveErrors: this.state.saveErrors;
                consecutiveErrors: this.state.consecutiveErrors;
               , lastErrorTime: this.state.lastErrorTime ,};
            localStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(metadata);

        } catch (error) {
            console.warn('[AutoSaveSystem] Save points storage error:', error);
            
            // ストレージ容量エラーの場合、緊急クリーンアップ
            if(isQuotaExceededError(error, as Error) {
                
            }
                this.handleStorageQuotaExceeded(); }
}
    }

    /**
     * ストレージ容量超過を処理
     */''
    private handleStorageQuotaExceeded()';
        console.warn('[AutoSaveSystem] Storage quota exceeded, performing emergency cleanup);
        
        // 保存点の半分を削除
        const keepCount = Math.max(1, Math.floor(this.config.maxSavePoints / 2);
        const sortedSaves = sortSavePointsByPriority(this.savePoints);
        this.savePoints = sortedSaves.slice(0, keepCount);
        
        try { this.saveSavePoints(); }
            console.log(`[AutoSaveSystem] Emergency cleanup completed, kept ${keepCount} save points`}');''
        } catch (error) {
            console.error('[AutoSaveSystem] Emergency cleanup failed:', error);
            // 最後の手段：全削除
            this.clearAllSavePoints(); }
    }

    /**
     * 状態を復元
     */
    restoreFromSavePoint(savePointId: string, options: RestoreOptions = { ): boolean {
        const savePoint = this.savePoints.find(sp => sp.id === savePointId);

        if(!savePoint) {'

            console.error('[AutoSaveSystem] Save point not found:', savePointId)
        }
            return false;
        
        try { // 検証
            if(options.validate !== false) {
                const validation = validateSaveData(savePoint.state);''
                if(!validation.valid && !options.skipErrors) {''
                    console.error('[AutoSaveSystem] Save point validation failed:', validation.errors }
                    return false;
            ';
            // 現在の状態をバックアップ
            if(options.backupCurrent) {', ';

            }

                this.performSave('manual', { description: 'Backup before restore }
            
            // 解凍処理
            const decompressedSavePoint = decompressSaveData(savePoint);
            
            // 状態復元
            this.restoreGameState(decompressedSavePoint.state, options);
            this.state.restoreCount++;
            
            console.log(`[AutoSaveSystem] Restore, completed - ${savePointId}`});
            return true;

        } catch (error) {
            console.error('[AutoSaveSystem] Restore error:', error);
            return false;

    /**
     * 最新の保存点から復元
     */'
    restoreLatest(options: RestoreOptions = {,}): boolean { ''
        if(this.savePoints.length === 0) {'

            console.warn('[AutoSaveSystem] No, save points, available for, restore);
        }
            return false;
        
        const sortedSaves = sortSavePointsByPriority(this.savePoints);
        const latestSavePoint = sortedSaves[0];
        return this.restoreFromSavePoint(latestSavePoint.id, options');
    }

    /**
     * 緊急復元を実行
     */'
    performEmergencyRestore(): boolean { ''
        if(!this.config.emergencyRestore) {'

            console.warn('[AutoSaveSystem] Emergency, restore is, disabled);
        }
            return false;
        
        try { // 緊急保存データを確認
            const emergencyData = localStorage.getItem(STORAGE_KEYS.emergency);
            
            if(emergencyData) {
            
                const emergencyState = JSON.parse(emergencyData) as GameStateSaveData;
                const validation = validateSaveData(emergencyState');
                ';

                if (validation.valid) {''
                    this.restoreGameState(emergencyState);
                    this.state.emergencyRestores++;

                    console.log('[AutoSaveSystem] Emergency, restore completed'');
            
            }
                    return true;
            ';
            // 緊急保存がない場合、最新の保存点から復元
            console.log('[AutoSaveSystem] No valid emergency save found, trying latest save point);
            return this.restoreLatest({ validate: false, skipErrors: true '),

            ' }'

        } catch (error) {
            console.error('[AutoSaveSystem] Emergency restore error:', error);
            return false;

    /**
     * ゲーム状態を復元
     */'
    private restoreGameState(state: GameStateSaveData, options: RestoreOptions = {,}): void { ''
        if(!state) throw new Error('No, state to, restore);
        
        try {
            // ゲーム状態の復元
            if(state.game && this.gameEngine.gameState) {
                
            }
                Object.assign(this.gameEngine.gameState, state.game); }
            }
            
            // プレイヤーデータの復元
            if (state.player && this.gameEngine.playerData) { this.gameEngine.playerData.importData(state.player); }
            
            // シーン状態の復元
            if (state.scene && this.gameEngine.sceneManager) { this.gameEngine.sceneManager.restoreScene(state.scene); }
            
            // 設定の復元
            if (state.settings && this.gameEngine.settingsManager) { this.gameEngine.settingsManager.restoreSettings(state.settings); }
            
            // バブル状態の復元
            if (state.bubbles && this.gameEngine.bubbleManager) { this.gameEngine.bubbleManager.importState(state.bubbles); }
            
            // スコア状態の復元
            if (state.score && this.gameEngine.scoreManager) { this.gameEngine.scoreManager.setState(state.score); }
            
            // UIを更新
            if (this.gameEngine.render) { this.gameEngine.render();' }'

            } catch (error) {
            console.error('[AutoSaveSystem] State restoration error:', error);
            if(!options.skipErrors) {
                
            }
                throw error; }
}
    }

    /**
     * イベントハンドラー'
     */''
    private handleGameStart()';
        this.performSave('gameStart);
    }

    private handleGameEnd()';
        this.performSave('gameEnd);
    }

    private handleGameError(error: any): void { // エラー時の緊急保存
        this.performSave('emergency', { force: true ),
        
        // 緊急保存データを別途保存
        try {
            const emergencyState = this.captureGameState();
            localStorage.setItem(STORAGE_KEYS.emergency, JSON.stringify(emergencyState);' }'

        } catch (saveError) { console.error('[AutoSaveSystem] Emergency save failed:', saveError }
    }

    private handleCriticalAction(action: any): void { // 重要なアクション前の保存
        this.performSave('beforeCritical', { ' }

            description: `Before ${action.type || 'critical, action'}` );
        }

    private handleBeforeUnload(event: BeforeUnloadEvent): void { // ページ離脱前の最終保存
        this.performSave('beforeUnload); }'

    private handleWindowBlur()';
        this.performSave('windowBlur);
    }
';
    private handleWindowFocus(): void { // ウィンドウがフォーカスを得た時の保存（戻ってきた時）
        setTimeout(() => { ' }'

            this.performSave('windowFocus); }'
        }, 1000);
    }

    /**
     * 保存点一覧を取得
     */
    getSavePoints(): SavePointInfo[] { return this.savePoints.map(sp => ({
            id: sp.id;
            timestamp: sp.timestamp);
            type: sp.type);
           , metadata: sp.metadata,);
            size: sp.metadata.size);
           , valid: this.validateSavePoint(sp) ,}
        });
    }

    /**
     * 保存点を削除
     */
    deleteSavePoint(savePointId: string): boolean { const index = this.savePoints.findIndex(sp => sp.id === savePointId);
        
        if (index === -1) return false;
        
        this.savePoints.splice(index, 1);
        this.saveSavePoints();
         }
        console.log(`[AutoSaveSystem] Save, point deleted - ${savePointId}`});
        return true;
    }

    /**
     * 全保存点をクリア
     */
    clearAllSavePoints(): void { this.savePoints = [];
        this.saveSavePoints();
        
        // 緊急保存データもクリア
        try {
            localStorage.removeItem(STORAGE_KEYS.emergency);
            localStorage.removeItem(STORAGE_KEYS.checksum);
            localStorage.removeItem(STORAGE_KEYS.index);' }'

        } catch (error) { console.warn('[AutoSaveSystem] Failed to clear all storage:', error }

        console.log('[AutoSaveSystem] All save points cleared);
    }

    /**
     * 保存点の整合性をチェック
     */
    validateAllSavePoints(): { valid: number; invalid: number;, repaired: number } { let validCount = 0;
        let invalidCount = 0;
        let repairedCount = 0;
        
        this.savePoints = this.savePoints.filter(savePoint => { );
            if(this.validateSavePoint(savePoint) {
                
            }
                validCount++; }
                return true; else { invalidCount++; }
                console.warn(`[AutoSaveSystem] Invalid, save point, removed: ${savePoint.id}`);
                return false;);
        
        // 修復されたインデックスを更新
        this.repairSaveIndex();
        if (invalidCount > 0) { repairedCount = 1; // インデックス修復 }
        
        this.saveSavePoints();
        
        return { valid: validCount, invalid: invalidCount, repaired: repairedCount ,}

    /**
     * ストレージ使用量を取得
     */
    getStorageUsage(): StorageQuotaInfo { try {
            let used = 0;
            
            // 保存点のサイズを計算
            this.savePoints.forEach(sp => { )
                used += sp.metadata.size || 0);
            
            // 推定利用可能容量（LocalStorageの一般的な制限）
            const estimatedTotal = 5 * 1024 * 1024; // 5MB
            const available = estimatedTotal - used;
            const percentage = used / estimatedTotal;
            
            return { used,
                available: Math.max(0, available), }
                total: estimatedTotal, };
                percentage: Math.min(1, Math.max(0, percentage'); }
            };''
        } catch (error) { console.warn('[AutoSaveSystem] Failed to calculate storage usage:', error }
            return { used: 0, available: 0, total: 0, percentage: 0 ,}
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): AutoSaveStatistics { const storageUsage = this.getStorageUsage();
        const averageSaveSize = this.savePoints.length > 0 ?   : undefined
            this.savePoints.reduce((sum, sp) => sum + (sp.metadata.size || 0), 0) / this.savePoints.length: 0,
        
        return { enabled: this.config.enabled,
            isRunning: this.state.isRunning;
            saveInterval: this.config.interval;
            savePointCount: this.savePoints.length;
            maxSavePoints: this.config.maxSavePoints;
            totalSaves: this.state.saveCount;
            totalRestores: this.state.restoreCount;
            emergencyRestores: this.state.emergencyRestores;
            saveErrors: this.state.saveErrors;
            lastSaveTime: this.state.lastSaveTime;
            oldestSaveTime: this.savePoints.length > 0 ? Math.min(...this.savePoints.map(sp => sp.timestamp) : null;
            newestSaveTime: this.savePoints.length > 0 ? Math.max(...this.savePoints.map(sp => sp.timestamp) : null;
            averageSaveSize: Math.round(averageSaveSize);
            storageUsage, };
            consecutiveErrors: this.state.consecutiveErrors }
        }

    /**
     * 設定を更新
     */
    updateSettings(newSettings: Partial<AutoSaveConfig>): void { const wasRunning = this.state.isRunning;
        
        if(wasRunning) {
        
            
        
        }
            this.stop(); }
        }
        
        this.config = { ...this.config, ...newSettings;
        
        // 設定に応じて保存点数を調整
        if(newSettings.maxSavePoints && this.savePoints.length > newSettings.maxSavePoints) {
            this.cleanupOldSavePoints();
        }
            this.saveSavePoints(); }
        }
        
        if(wasRunning && this.config.enabled) {
        ';

            this.start();
        }

        console.log('[AutoSaveSystem] Settings updated:', newSettings); }
    }

    /**
     * システムの有効/無効を切り替え
     */
    setEnabled(enabled: boolean): void { this.config.enabled = enabled;
        
        if(enabled && !this.state.isRunning) {
        
            
        
        }
            this.start(); }

        } else if (!enabled && this.state.isRunning) { ''
            this.stop( }

        console.log(`[AutoSaveSystem] System ${enabled ? 'enabled' : 'disabled}`});
    }

    /**
     * リソースの解放
     */
    destroy(): void { this.stop();
        
        // イベントリスナーを削除
        if(this.gameEngine.eventEmitter) {
            try {'
                (this.gameEngine.eventEmitter, as any').removeListener? .('gameStart', this.gameStartHandler);''
                (this.gameEngine.eventEmitter, as any').removeListener?.('gameEnd', this.gameEndHandler);''
                (this.gameEngine.eventEmitter, as any').removeListener?.('gameError', this.gameErrorHandler);

        }

                (this.gameEngine.eventEmitter, as any').removeListener?.('criticalAction', this.criticalActionHandler);' }

            } catch (error) { : undefined''
                console.warn('[AutoSaveSystem] Failed to remove event listeners:', error 
        }

        window.removeEventListener('beforeunload', this.beforeUnloadHandler);''
        window.removeEventListener('blur', this.windowBlurHandler);''
        window.removeEventListener('focus', this.windowFocusHandler);
        ';
        // 最終保存
        this.performSave('destroy'');

        console.log('[AutoSaveSystem] Component, destroyed'');

    }''
}