import { BaseComponent } from './BaseComponent.js';
import { StateManipulationCommands } from './state/StateManipulationCommands.js';
import { SafetyValidator } from './state/SafetyValidator.js';
import { CommandHistoryManager } from './state/CommandHistoryManager.js';
import { UndoOperationManager } from './state/UndoOperationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * Game State Commands (Main Controller)
 * ゲーム状態操作コマンド群
 */
export class GameStateCommands extends BaseComponent {
    constructor(gameEngine, console) {
        super(null, 'GameStateCommands');
        this.gameEngine = gameEngine;
        this.console = console;
        this.errorHandler = null;
        this.components = new Map();
        this.initialized = false;
    }

    /**
     * 初期化
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            this.setupErrorHandler();
            
            // コンポーネントの初期化
            this.components.set('stateManipulation', new StateManipulationCommands(this));
            this.components.set('safetyValidator', new SafetyValidator(this));
            this.components.set('historyManager', new CommandHistoryManager(this));
            this.components.set('undoManager', new UndoOperationManager(this));

            // 各コンポーネントを初期化
            for (const [name, component] of this.components) {
                if (component.initialize) {
                    await component.initialize();
                }
            }

            this.registerCommands();
            this.initialized = true;
            
            console.log('[GameStateCommands] Game state commands initialized');
        } catch (error) {
            this._handleError('Failed to initialize GameStateCommands', error);
            throw error;
        }
    }

    /**
     * エラーハンドラ設定
     */
    setupErrorHandler() {
        try {
            // Removed require: const { getErrorHandler } = require('../utils/ErrorHandler.js');
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[GameStateCommands] ErrorHandler not available:', error.message);
            this.errorHandler = {
                handleError: (error, context) => console.error(`[${context}]`, error)
            };
        }
    }

    /**
     * 状態操作コンポーネントを取得
     */
    getStateManipulation() {
        return this.components.get('stateManipulation');
    }

    /**
     * 安全性検証コンポーネントを取得
     */
    getSafetyValidator() {
        return this.components.get('safetyValidator');
    }

    /**
     * 履歴管理コンポーネントを取得
     */
    getHistoryManager() {
        return this.components.get('historyManager');
    }

    /**
     * アンドゥ管理コンポーネントを取得
     */
    getUndoManager() {
        return this.components.get('undoManager');
    }

    /**
     * コマンド登録（メインコントローラー統制）
     */
    registerCommands() {
        const stateManipulation = this.getStateManipulation();
        const undoManager = this.getUndoManager();
        
        if (stateManipulation) {
            // ゲーム制御コマンド
            stateManipulation.registerGameControlCommands();
            
            // スコア操作コマンド
            stateManipulation.registerScoreCommands();
            
            // バブル操作コマンド
            stateManipulation.registerBubbleCommands();
            
            // プレイヤーデータ操作コマンド
            stateManipulation.registerPlayerDataCommands();
            
            // レベル・ステージ操作コマンド
            stateManipulation.registerLevelCommands();
        }
        
        if (undoManager) {
            // デバッグ・テストコマンド
            undoManager.registerDebugCommands();
        }

        // 統合コマンド
        this.registerIntegratedCommands();
    }

    /**
     * 統合コマンド登録
     */
    registerIntegratedCommands() {
        // テストシナリオ実行
        this.console.registerCommand('run-test', {
            description: 'Run test scenario',
            usage: 'run-test <scenario>',
            category: 'debug',
            execute: (args) => {
                if (args.length === 0) return 'Usage: run-test <scenario>';
                
                const scenario = args[0];
                try {
                    return this.runTestScenario(scenario);
                } catch (error) {
                    return `Test failed: ${error.message}`;
                }
            },
            getCompletions: () => ['stress', 'memory', 'performance', 'bubbles', 'scoring']
        });

        // ゲーム状態ダンプ
        this.console.registerCommand('dump-state', {
            description: 'Dump current game state',
            usage: 'dump-state [--json]',
            category: 'debug',
            execute: (args) => {
                try {
                    const state = this.captureGameState();
                    if (args.includes('--json')) {
                        return JSON.stringify(state, null, 2);
                    } else {
                        return this.formatGameState(state);
                    }
                } catch (error) {
                    return `Failed to dump state: ${error.message}`;
                }
            }
        });
    }

    // ヘルパーメソッド（メインコントローラー統制）

    /**
     * ゲームマネージャー取得
     */
    getScoreManager() {
        return this.gameEngine?.scoreManager;
    }

    getBubbleManager() {
        return this.gameEngine?.bubbleManager;
    }

    getPlayerData() {
        return this.gameEngine?.playerData;
    }

    getStageManager() {
        return this.gameEngine?.stageManager;
    }

    /**
     * ゲーム状態キャプチャ
     */
    captureGameState() {
        const state = {
            timestamp: Date.now(),
            running: this.gameEngine?.isRunning || false,
            paused: this.gameEngine?.isPaused || false,
            currentScene: this.gameEngine?.sceneManager?.currentScene || null
        };
        
        // スコア情報
        const scoreManager = this.getScoreManager();
        if (scoreManager) {
            state.score = {
                current: scoreManager.getScore ? scoreManager.getScore() : 0,
                combo: scoreManager.getCurrentCombo ? scoreManager.getCurrentCombo() : 0
            };
        }
        
        // バブル情報
        const bubbleManager = this.getBubbleManager();
        if (bubbleManager) {
            state.bubbles = {
                count: bubbleManager.getActiveBubbleCount ? bubbleManager.getActiveBubbleCount() : 0
            };
        }
        
        return state;
    }

    /**
     * プレイヤーデータキャプチャ
     */
    capturePlayerData() {
        const playerData = this.getPlayerData();
        if (!playerData) return null;
        
        return {
            name: playerData.getName ? playerData.getName() : '',
            level: playerData.getLevel ? playerData.getLevel() : 1,
            ap: playerData.getAP ? playerData.getAP() : 0,
            tap: playerData.getTAP ? playerData.getTAP() : 0,
            highScore: playerData.getHighScore ? playerData.getHighScore() : 0
        };
    }

    /**
     * テストシナリオ実行
     */
    runTestScenario(scenario) {
        const scenarios = {
            stress: () => {
                const bubbleManager = this.getBubbleManager();
                if (!bubbleManager || !bubbleManager.spawnBubble) {
                    return 'Bubble manager not available for stress test';
                }
                
                for (let i = 0; i < 100; i++) {
                    bubbleManager.spawnBubble('normal');
                }
                return 'Stress test: Spawned 100 bubbles';
            },
            
            memory: () => {
                if (typeof window !== 'undefined' && window.gc) {
                    window.gc();
                    return 'Memory test: Forced garbage collection';
                } else {
                    return 'Memory test: GC not available';
                }
            },
            
            performance: () => {
                const start = performance.now();
                for (let i = 0; i < 10000; i++) {
                    Math.random();
                }
                const end = performance.now();
                return `Performance test: ${(end - start).toFixed(2)}ms for 10k operations`;
            }
        };
        
        const test = scenarios[scenario];
        if (!test) {
            return `Unknown test scenario: ${scenario}`;
        }
        
        return test();
    }

    /**
     * ゲーム状態フォーマット
     */
    formatGameState(state) {
        const lines = [];
        lines.push('=== Game State ===');
        lines.push(`Timestamp: ${new Date(state.timestamp).toLocaleTimeString()}`);
        lines.push(`Running: ${state.running}`);
        lines.push(`Paused: ${state.paused}`);
        lines.push(`Scene: ${state.currentScene || 'none'}`);
        
        if (state.score) {
            lines.push(`Score: ${state.score.current}`);
            lines.push(`Combo: ${state.score.combo}`);
        }
        
        if (state.bubbles) {
            lines.push(`Bubbles: ${state.bubbles.count}`);
        }
        
        return lines.join('\n');
    }

    /**
     * プレイヤーデータバックアップ作成
     */
    createPlayerDataBackup() {
        const backup = {
            id: `backup_${Date.now()}`,
            timestamp: Date.now(),
            data: this.capturePlayerData()
        };
        
        // LocalStorageに保存
        try {
            localStorage.setItem(`player_backup_${backup.id}`, JSON.stringify(backup));
        } catch (error) {
            console.warn('Failed to save backup to localStorage:', error);
        }
        
        return backup;
    }

    /**
     * コマンド実行記録（メインコントローラー統制）
     */
    logCommand(command, params) {
        const historyManager = this.getHistoryManager();
        if (historyManager) {
            historyManager.logCommand(command, params);
        }
    }

    /**
     * 実行統計取得（メインコントローラー統制）
     */
    getExecutionStatistics() {
        const historyManager = this.getHistoryManager();
        const undoManager = this.getUndoManager();
        
        const historyStats = historyManager ? historyManager.getExecutionStatistics() : {};
        const undoStats = undoManager ? undoManager.getUndoRedoStatistics() : {};
        
        return {
            ...historyStats,
            undo: undoStats
        };
    }

    /**
     * 安全性設定更新（メインコントローラー統制）
     */
    updateSafetySettings(settings) {
        const safetyValidator = this.getSafetyValidator();
        if (safetyValidator) {
            safetyValidator.updateSafetySettings(settings);
        }
        console.log('[GameStateCommands] Safety settings updated');
    }

    /**
     * 旧来のAPIとの互換性のため
     */
    get executionState() {
        const historyManager = this.getHistoryManager();
        const undoManager = this.getUndoManager();
        
        return {
            lastCommand: historyManager ? historyManager.executionState.lastCommand : null,
            commandHistory: historyManager ? historyManager.getCommandHistory() : [],
            undoStack: undoManager ? undoManager.getUndoStackSummary() : [],
            maxUndoSize: undoManager ? undoManager.maxUndoSize : 10
        };
    }

    get safetyChecks() {
        const safetyValidator = this.getSafetyValidator();
        return safetyValidator ? safetyValidator.getSafetySettings() : {
            confirmDestructive: true,
            preventDataLoss: true,
            validateInputs: true,
            logAllChanges: true
        };
    }

    /**
     * 破棄処理
     */
    destroy() {
        try {
            // 各コンポーネントのクリーンアップ
            for (const [name, component] of this.components) {
                if (component.cleanup) {
                    component.cleanup();
                }
            }
            
            this.components.clear();
            this.initialized = false;
            console.log('[GameStateCommands] Destroyed');
        } catch (error) {
            this._handleError('Error during destroy', error);
        }
    }

    /**
     * クリーンアップ（BaseComponent互換）
     */
    cleanup() {
        this.destroy();
        super.cleanup();
    }
}

export default GameStateCommands;