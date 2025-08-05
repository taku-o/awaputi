import { BaseComponent } from '../BaseComponent.js';

/**
 * UndoOperationManager - アンドゥ操作管理・スタック処理コンポーネント
 */
export class UndoOperationManager extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'UndoOperationManager');
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSize = 10;
    }

    /**
     * Undoスタックに追加
     * @param {string} command - コマンド名
     * @param {Object} state - 状態データ
     */
    addToUndoStack(command, state) {
        const undoItem = {
            command: command,
            state: state,
            timestamp: Date.now(),
            id: this.generateUndoId()
        };

        this.undoStack.push(undoItem);
        
        // サイズ制限
        if (this.undoStack.length > this.maxUndoSize) {
            this.undoStack.shift();
        }

        // 新しいアクションが追加されたらredoスタックをクリア
        this.redoStack = [];

        console.log(`[UndoOperationManager] Added undo point for: ${command}`);
    }

    /**
     * Undo操作を実行
     * @returns {string} 結果メッセージ
     */
    executeUndo() {
        if (this.undoStack.length === 0) {
            return 'No commands to undo';
        }

        try {
            const undoItem = this.undoStack.pop();
            
            // 現在の状態をredoスタックに保存
            const currentState = this.captureCurrentState(undoItem.command);
            this.redoStack.push({
                command: undoItem.command,
                state: currentState,
                timestamp: Date.now(),
                id: this.generateUndoId()
            });

            // 状態を復元
            this.restoreState(undoItem);
            
            // 履歴に記録
            const historyManager = this.mainController.getHistoryManager();
            if (historyManager) {
                historyManager.logCommand('undo', { 
                    undoCommand: undoItem.command,
                    undoId: undoItem.id 
                });
            }

            return `Undid: ${undoItem.command}`;
        } catch (error) {
            console.error('[UndoOperationManager] Undo failed:', error);
            return `Failed to undo: ${error.message}`;
        }
    }

    /**
     * Redo操作を実行
     * @returns {string} 結果メッセージ
     */
    executeRedo() {
        if (this.redoStack.length === 0) {
            return 'No commands to redo';
        }

        try {
            const redoItem = this.redoStack.pop();
            
            // 現在の状態をundoスタックに保存
            const currentState = this.captureCurrentState(redoItem.command);
            this.undoStack.push({
                command: redoItem.command,
                state: currentState,
                timestamp: Date.now(),
                id: this.generateUndoId()
            });

            // 状態を復元
            this.restoreState(redoItem);
            
            // 履歴に記録
            const historyManager = this.mainController.getHistoryManager();
            if (historyManager) {
                historyManager.logCommand('redo', { 
                    redoCommand: redoItem.command,
                    redoId: redoItem.id 
                });
            }

            return `Redid: ${redoItem.command}`;
        } catch (error) {
            console.error('[UndoOperationManager] Redo failed:', error);
            return `Failed to redo: ${error.message}`;
        }
    }

    /**
     * 状態復元処理
     * @param {Object} undoItem - アンドゥアイテム
     * @private
     */
    restoreState(undoItem) {
        const { command, state } = undoItem;

        // コマンド種類別の復元処理
        switch (command) {
            case 'set-score':
                this.restoreScoreState(state);
                break;
                
            case 'add-score':
                this.restoreScoreState(state);
                break;
                
            case 'set-ap':
                this.restorePlayerAPState(state);
                break;
                
            case 'set-level':
                this.restorePlayerLevelState(state);
                break;
                
            case 'reset':
                this.restoreGameState(state);
                break;
                
            case 'stop':
                this.restoreGameState(state);
                break;
                
            case 'reset-player':
                this.restoreFullPlayerState(state);
                break;
                
            case 'goto-stage':
                this.restoreStageState(state);
                break;
                
            case 'set-difficulty':
                this.restoreDifficultyState(state);
                break;
                
            default:
                console.warn('[UndoOperationManager] Unknown command for restore:', command);
        }
    }

    /**
     * スコア状態復元
     * @private
     */
    restoreScoreState(state) {
        const scoreManager = this.mainController.getScoreManager();
        if (scoreManager && state.oldScore !== undefined) {
            scoreManager.setScore(state.oldScore);
        }
    }

    /**
     * プレイヤーAP状態復元
     * @private
     */
    restorePlayerAPState(state) {
        const playerData = this.mainController.getPlayerData();
        if (playerData && playerData.setAP && state.oldAP !== undefined) {
            playerData.setAP(state.oldAP);
        }
    }

    /**
     * プレイヤーレベル状態復元
     * @private
     */
    restorePlayerLevelState(state) {
        const playerData = this.mainController.getPlayerData();
        if (playerData && playerData.setLevel && state.oldLevel !== undefined) {
            playerData.setLevel(state.oldLevel);
        }
    }

    /**
     * ゲーム状態復元
     * @private
     */
    restoreGameState(state) {
        // ゲーム状態の復元は複雑なため、基本的な復元のみ実装
        console.log('[UndoOperationManager] Restoring game state:', state);
        
        if (state.running && this.mainController.gameEngine) {
            if (state.paused) {
                this.mainController.gameEngine.pause();
            } else {
                this.mainController.gameEngine.resume();
            }
        }
    }

    /**
     * プレイヤーデータ全体復元
     * @private
     */
    restoreFullPlayerState(state) {
        const playerData = this.mainController.getPlayerData();
        if (!playerData || !state) return;

        if (state.name && playerData.setName) {
            playerData.setName(state.name);
        }
        if (state.level && playerData.setLevel) {
            playerData.setLevel(state.level);
        }
        if (state.ap && playerData.setAP) {
            playerData.setAP(state.ap);
        }
        if (state.tap && playerData.setTAP) {
            playerData.setTAP(state.tap);
        }
    }

    /**
     * ステージ状態復元
     * @private
     */
    restoreStageState(state) {
        const stageManager = this.mainController.getStageManager();
        if (stageManager && stageManager.setCurrentStage && state.oldStage) {
            stageManager.setCurrentStage(state.oldStage);
        }
    }

    /**
     * 難易度状態復元
     * @private
     */
    restoreDifficultyState(state) {
        const stageManager = this.mainController.getStageManager();
        if (stageManager && stageManager.setDifficulty && state.oldDifficulty) {
            stageManager.setDifficulty(state.oldDifficulty);
        }
    }

    /**
     * 現在の状態をキャプチャ
     * @param {string} command - コマンド名
     * @returns {Object} 現在の状態
     * @private
     */
    captureCurrentState(command) {
        switch (command) {
            case 'set-score':
            case 'add-score':
                const scoreManager = this.mainController.getScoreManager();
                return {
                    oldScore: scoreManager ? scoreManager.getScore() : 0
                };
                
            case 'set-ap':
                const playerData = this.mainController.getPlayerData();
                return {
                    oldAP: playerData && playerData.getAP ? playerData.getAP() : 0
                };
                
            case 'set-level':
                const playerDataLevel = this.mainController.getPlayerData();
                return {
                    oldLevel: playerDataLevel && playerDataLevel.getLevel ? playerDataLevel.getLevel() : 1
                };
                
            case 'goto-stage':
                const stageManager = this.mainController.getStageManager();
                return {
                    oldStage: stageManager && stageManager.getCurrentStage ? stageManager.getCurrentStage() : 'unknown'
                };
                
            case 'set-difficulty':
                const stageManagerDiff = this.mainController.getStageManager();
                return {
                    oldDifficulty: stageManagerDiff && stageManagerDiff.getDifficulty ? stageManagerDiff.getDifficulty() : 'normal'
                };
                
            default:
                return this.mainController.captureGameState();
        }
    }

    /**
     * Undo/Redo統計情報を取得
     * @returns {Object} 統計情報
     */
    getUndoRedoStatistics() {
        return {
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length,
            maxUndoSize: this.maxUndoSize,
            availableUndos: this.undoStack.length,
            availableRedos: this.redoStack.length,
            oldestUndo: this.undoStack.length > 0 ? this.undoStack[0].timestamp : null,
            newestUndo: this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].timestamp : null
        };
    }

    /**
     * Undoスタックの概要を取得
     * @returns {Array} Undoスタックの概要
     */
    getUndoStackSummary() {
        return this.undoStack.map(item => ({
            id: item.id,
            command: item.command,
            timestamp: item.timestamp,
            timeAgo: Date.now() - item.timestamp
        }));
    }

    /**
     * Redoスタックの概要を取得
     * @returns {Array} Redoスタックの概要
     */
    getRedoStackSummary() {
        return this.redoStack.map(item => ({
            id: item.id,
            command: item.command,
            timestamp: item.timestamp,
            timeAgo: Date.now() - item.timestamp
        }));
    }

    /**
     * 特定のアンドゥポイントまで戻る
     * @param {string} undoId - アンドゥID
     * @returns {string} 結果メッセージ
     */
    undoToPoint(undoId) {
        const targetIndex = this.undoStack.findIndex(item => item.id === undoId);
        if (targetIndex === -1) {
            return 'Undo point not found';
        }

        const undoCount = this.undoStack.length - targetIndex;
        const results = [];

        for (let i = 0; i < undoCount; i++) {
            const result = this.executeUndo();
            results.push(result);
        }

        return `Undid ${undoCount} operations: ${results.join(', ')}`;
    }

    /**
     * アンドゥスタックをクリア
     * @param {boolean} confirm - 確認フラグ
     */
    clearUndoStack(confirm = false) {
        if (!confirm) {
            throw new Error('Undo stack clearing requires confirmation');
        }

        const undoCount = this.undoStack.length;
        const redoCount = this.redoStack.length;
        
        this.undoStack = [];
        this.redoStack = [];

        console.log(`[UndoOperationManager] Cleared ${undoCount} undo operations and ${redoCount} redo operations`);
        return { undoCount, redoCount };
    }

    /**
     * Undoサイズ制限を設定
     * @param {number} size - 新しいサイズ制限
     */
    setMaxUndoSize(size) {
        if (size < 1 || size > 100) {
            throw new Error('Max undo size must be between 1 and 100');
        }

        this.maxUndoSize = size;
        
        // 現在のスタックサイズが制限を超えている場合は調整
        while (this.undoStack.length > this.maxUndoSize) {
            this.undoStack.shift();
        }

        console.log(`[UndoOperationManager] Max undo size set to ${size}`);
    }

    /**
     * ユニークなUndoID生成
     * @private
     */
    generateUndoId() {
        return `undo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * デバッグ・テストコマンド登録
     */
    registerDebugCommands() {
        // Undo機能
        this.mainController.console.registerCommand('undo', {
            description: 'Undo last command',
            usage: 'undo',
            category: 'debug',
            execute: () => {
                return this.executeUndo();
            }
        });

        // Redo機能
        this.mainController.console.registerCommand('redo', {
            description: 'Redo last undone command',
            usage: 'redo',
            category: 'debug',
            execute: () => {
                return this.executeRedo();
            }
        });

        // Undoスタック表示
        this.mainController.console.registerCommand('undo-list', {
            description: 'List available undo operations',
            usage: 'undo-list',
            category: 'debug',
            execute: () => {
                const summary = this.getUndoStackSummary();
                if (summary.length === 0) {
                    return 'No undo operations available';
                }

                const lines = ['Available undo operations:'];
                summary.reverse().forEach((item, index) => {
                    const timeAgo = Math.round(item.timeAgo / 1000);
                    lines.push(`  ${index + 1}. ${item.command} (${timeAgo}s ago)`);
                });

                return lines.join('\n');
            }
        });
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.undoStack = [];
        this.redoStack = [];
        super.cleanup();
    }
}