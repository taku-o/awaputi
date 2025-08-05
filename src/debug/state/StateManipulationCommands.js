import { BaseComponent } from '../BaseComponent.js';

/**
 * StateManipulationCommands - 状態操作・修変コマンドコンポーネント
 */
export class StateManipulationCommands extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'StateManipulationCommands');
    }

    /**
     * ゲーム制御コマンド登録
     */
    registerGameControlCommands() {
        // ゲーム一時停止
        this.mainController.console.registerCommand('pause', {
            description: 'Pause the game',
            usage: 'pause',
            category: 'game-control',
            execute: () => {
                if (!this.mainController.gameEngine) return 'Game engine not available';
                
                try {
                    if (this.mainController.gameEngine.isPaused) {
                        return 'Game is already paused';
                    }
                    
                    this.mainController.gameEngine.pause();
                    this.mainController.logCommand('pause', {});
                    return 'Game paused';
                } catch (error) {
                    return `Failed to pause game: ${error.message}`;
                }
            }
        });

        // ゲーム再開
        this.mainController.console.registerCommand('resume', {
            description: 'Resume the game',
            usage: 'resume',
            category: 'game-control',
            aliases: ['unpause'],
            execute: () => {
                if (!this.mainController.gameEngine) return 'Game engine not available';
                
                try {
                    if (!this.mainController.gameEngine.isPaused) {
                        return 'Game is not paused';
                    }
                    
                    this.mainController.gameEngine.resume();
                    this.mainController.logCommand('resume', {});
                    return 'Game resumed';
                } catch (error) {
                    return `Failed to resume game: ${error.message}`;
                }
            }
        });

        // ゲームリセット
        this.mainController.console.registerCommand('reset', {
            description: 'Reset the current game',
            usage: 'reset [--confirm]',
            category: 'game-control',
            execute: (args) => {
                if (!this.mainController.gameEngine) return 'Game engine not available';
                
                const safetyValidator = this.mainController.getSafetyValidator();
                if (safetyValidator && !safetyValidator.validateDestructiveOperation('reset', args)) {
                    return 'This will reset the current game. Use "reset --confirm" to proceed';
                }
                
                try {
                    const currentState = this.mainController.captureGameState();
                    this.mainController.gameEngine.reset();
                    
                    const undoManager = this.mainController.getUndoManager();
                    if (undoManager) {
                        undoManager.addToUndoStack('reset', currentState);
                    }
                    
                    this.mainController.logCommand('reset', { confirmed: true });
                    return 'Game reset successfully';
                } catch (error) {
                    return `Failed to reset game: ${error.message}`;
                }
            }
        });

        // ゲーム終了
        this.mainController.console.registerCommand('stop', {
            description: 'Stop the current game',
            usage: 'stop [--confirm]',
            category: 'game-control',
            execute: (args) => {
                if (!this.mainController.gameEngine) return 'Game engine not available';
                
                const safetyValidator = this.mainController.getSafetyValidator();
                if (safetyValidator && !safetyValidator.validateDestructiveOperation('stop', args)) {
                    return 'This will stop the current game. Use "stop --confirm" to proceed';
                }
                
                try {
                    const currentState = this.mainController.captureGameState();
                    this.mainController.gameEngine.stop();
                    
                    const undoManager = this.mainController.getUndoManager();
                    if (undoManager) {
                        undoManager.addToUndoStack('stop', currentState);
                    }
                    
                    this.mainController.logCommand('stop', { confirmed: true });
                    return 'Game stopped';
                } catch (error) {
                    return `Failed to stop game: ${error.message}`;
                }
            }
        });

        // ゲーム状態表示
        this.mainController.console.registerCommand('status', {
            description: 'Show current game status',
            usage: 'status',
            category: 'game-control',
            aliases: ['state'],
            execute: () => {
                if (!this.mainController.gameEngine) return 'Game engine not available';
                
                const status = [];
                status.push('=== Game Status ===');
                status.push(`Running: ${this.mainController.gameEngine.isRunning || false}`);
                status.push(`Paused: ${this.mainController.gameEngine.isPaused || false}`);
                
                if (this.mainController.gameEngine.sceneManager) {
                    status.push(`Current Scene: ${this.mainController.gameEngine.sceneManager.currentScene || 'none'}`);
                }
                
                if (this.mainController.gameEngine.performanceOptimizer) {
                    status.push(`FPS: ${this.mainController.gameEngine.performanceOptimizer.getCurrentFPS()}`);
                }
                
                return status.join('\n');
            }
        });
    }

    /**
     * スコア操作コマンド登録
     */
    registerScoreCommands() {
        // スコア設定
        this.mainController.console.registerCommand('set-score', {
            description: 'Set player score',
            usage: 'set-score <value>',
            category: 'score',
            execute: (args) => {
                if (args.length === 0) return 'Usage: set-score <value>';
                
                const score = parseInt(args[0]);
                if (isNaN(score) || score < 0) {
                    return 'Invalid score value';
                }
                
                try {
                    const scoreManager = this.mainController.getScoreManager();
                    if (!scoreManager) return 'Score manager not available';
                    
                    const oldScore = scoreManager.getScore();
                    scoreManager.setScore(score);
                    
                    const undoManager = this.mainController.getUndoManager();
                    if (undoManager) {
                        undoManager.addToUndoStack('set-score', { oldScore });
                    }
                    
                    this.mainController.logCommand('set-score', { oldScore, newScore: score });
                    return `Score set to ${score} (was ${oldScore})`;
                } catch (error) {
                    return `Failed to set score: ${error.message}`;
                }
            },
            getCompletions: () => ['1000', '5000', '10000', '50000']
        });

        // スコア追加
        this.mainController.console.registerCommand('add-score', {
            description: 'Add to player score',
            usage: 'add-score <value>',
            category: 'score',
            execute: (args) => {
                if (args.length === 0) return 'Usage: add-score <value>';
                
                const addition = parseInt(args[0]);
                if (isNaN(addition)) return 'Invalid score value';
                
                try {
                    const scoreManager = this.mainController.getScoreManager();
                    if (!scoreManager) return 'Score manager not available';
                    
                    const oldScore = scoreManager.getScore();
                    const newScore = oldScore + addition;
                    scoreManager.setScore(Math.max(0, newScore));
                    
                    const undoManager = this.mainController.getUndoManager();
                    if (undoManager) {
                        undoManager.addToUndoStack('add-score', { oldScore });
                    }
                    
                    this.mainController.logCommand('add-score', { addition, oldScore, newScore });
                    return `Added ${addition} to score (${oldScore} → ${newScore})`;
                } catch (error) {
                    return `Failed to add score: ${error.message}`;
                }
            }
        });

        // コンボリセット
        this.mainController.console.registerCommand('reset-combo', {
            description: 'Reset current combo',
            usage: 'reset-combo',
            category: 'score',
            execute: () => {
                try {
                    const scoreManager = this.mainController.getScoreManager();
                    if (!scoreManager) return 'Score manager not available';
                    
                    const oldCombo = scoreManager.getCurrentCombo ? scoreManager.getCurrentCombo() : 0;
                    if (scoreManager.resetCombo) {
                        scoreManager.resetCombo();
                        this.mainController.logCommand('reset-combo', { oldCombo });
                        return `Combo reset (was ${oldCombo})`;
                    } else {
                        return 'Combo reset not supported';
                    }
                } catch (error) {
                    return `Failed to reset combo: ${error.message}`;
                }
            }
        });

        // ハイスコア表示
        this.mainController.console.registerCommand('high-score', {
            description: 'Show high score information',
            usage: 'high-score',
            category: 'score',
            aliases: ['highscore', 'best'],
            execute: () => {
                try {
                    const playerData = this.mainController.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const highScore = playerData.getHighScore ? playerData.getHighScore() : 'Unknown';
                    const currentScore = this.mainController.getScoreManager()?.getScore() || 0;
                    
                    return `High Score: ${highScore}\nCurrent Score: ${currentScore}`;
                } catch (error) {
                    return `Failed to get high score: ${error.message}`;
                }
            }
        });
    }

    /**
     * バブル操作コマンド登録
     */
    registerBubbleCommands() {
        // バブル生成
        this.mainController.console.registerCommand('spawn-bubble', {
            description: 'Spawn bubbles',
            usage: 'spawn-bubble [type] [count] [x] [y]',
            category: 'bubbles',
            aliases: ['bubble'],
            execute: (args) => {
                try {
                    const bubbleManager = this.mainController.getBubbleManager();
                    if (!bubbleManager) return 'Bubble manager not available';
                    
                    const type = args[0] || 'normal';
                    const count = parseInt(args[1]) || 1;
                    const x = args[2] ? parseFloat(args[2]) : null;
                    const y = args[3] ? parseFloat(args[3]) : null;
                    
                    if (count < 1 || count > 50) {
                        return 'Count must be between 1 and 50';
                    }
                    
                    let spawned = 0;
                    for (let i = 0; i < count; i++) {
                        if (bubbleManager.spawnBubble) {
                            const position = (x !== null && y !== null) ? { x, y } : null;
                            bubbleManager.spawnBubble(type, position);
                            spawned++;
                        }
                    }
                    
                    this.mainController.logCommand('spawn-bubble', { type, count: spawned, x, y });
                    return `Spawned ${spawned} ${type} bubble(s)`;
                } catch (error) {
                    return `Failed to spawn bubbles: ${error.message}`;
                }
            },
            getCompletions: (args) => {
                if (args.length === 1) {
                    return ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky', 'escaping', 'boss'];
                }
                if (args.length === 2) {
                    return ['1', '5', '10', '20'];
                }
                return [];
            }
        });

        // 全バブル削除
        this.mainController.console.registerCommand('clear-bubbles', {
            description: 'Clear all bubbles',
            usage: 'clear-bubbles [--confirm]',
            category: 'bubbles',
            execute: (args) => {
                const safetyValidator = this.mainController.getSafetyValidator();
                if (safetyValidator && !safetyValidator.validateDestructiveOperation('clear-bubbles', args)) {
                    return 'This will clear all bubbles. Use "clear-bubbles --confirm" to proceed';
                }
                
                try {
                    const bubbleManager = this.mainController.getBubbleManager();
                    if (!bubbleManager) return 'Bubble manager not available';
                    
                    const bubbleCount = bubbleManager.getActiveBubbleCount ? bubbleManager.getActiveBubbleCount() : 0;
                    
                    if (bubbleManager.clearAllBubbles) {
                        bubbleManager.clearAllBubbles();
                    } else if (bubbleManager.bubbles) {
                        bubbleManager.bubbles = [];
                    }
                    
                    this.mainController.logCommand('clear-bubbles', { clearedCount: bubbleCount });
                    return `Cleared ${bubbleCount} bubbles`;
                } catch (error) {
                    return `Failed to clear bubbles: ${error.message}`;
                }
            }
        });

        // バブル情報表示
        this.mainController.console.registerCommand('bubble-info', {
            description: 'Show bubble information',
            usage: 'bubble-info',
            category: 'bubbles',
            execute: () => {
                try {
                    const bubbleManager = this.mainController.getBubbleManager();
                    if (!bubbleManager) return 'Bubble manager not available';
                    
                    const info = [];
                    info.push('=== Bubble Information ===');
                    
                    const activeCount = bubbleManager.getActiveBubbleCount ? bubbleManager.getActiveBubbleCount() : 'Unknown';
                    info.push(`Active Bubbles: ${activeCount}`);
                    
                    if (bubbleManager.getBubbleCountByType) {
                        const typeCount = bubbleManager.getBubbleCountByType();
                        info.push('By Type:');
                        Object.entries(typeCount).forEach(([type, count]) => {
                            info.push(`  ${type}: ${count}`);
                        });
                    }
                    
                    return info.join('\n');
                } catch (error) {
                    return `Failed to get bubble info: ${error.message}`;
                }
            }
        });
    }

    /**
     * プレイヤーデータ操作コマンド登録
     */
    registerPlayerDataCommands() {
        // AP操作
        this.mainController.console.registerCommand('set-ap', {
            description: 'Set player AP (Awaputi Points)',
            usage: 'set-ap <value>',
            category: 'player',
            execute: (args) => {
                if (args.length === 0) return 'Usage: set-ap <value>';
                
                const ap = parseInt(args[0]);
                if (isNaN(ap) || ap < 0) return 'Invalid AP value';
                
                try {
                    const playerData = this.mainController.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const oldAP = playerData.getAP ? playerData.getAP() : 0;
                    if (playerData.setAP) {
                        playerData.setAP(ap);
                        
                        const undoManager = this.mainController.getUndoManager();
                        if (undoManager) {
                            undoManager.addToUndoStack('set-ap', { oldAP });
                        }
                        
                        this.mainController.logCommand('set-ap', { oldAP, newAP: ap });
                        return `AP set to ${ap} (was ${oldAP})`;
                    } else {
                        return 'AP setting not supported';
                    }
                } catch (error) {
                    return `Failed to set AP: ${error.message}`;
                }
            },
            getCompletions: () => ['100', '500', '1000', '5000']
        });

        // レベル設定
        this.mainController.console.registerCommand('set-level', {
            description: 'Set player level',
            usage: 'set-level <level>',
            category: 'player',
            execute: (args) => {
                if (args.length === 0) return 'Usage: set-level <level>';
                
                const level = parseInt(args[0]);
                if (isNaN(level) || level < 1 || level > 100) {
                    return 'Level must be between 1 and 100';
                }
                
                try {
                    const playerData = this.mainController.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const oldLevel = playerData.getLevel ? playerData.getLevel() : 1;
                    if (playerData.setLevel) {
                        playerData.setLevel(level);
                        
                        const undoManager = this.mainController.getUndoManager();
                        if (undoManager) {
                            undoManager.addToUndoStack('set-level', { oldLevel });
                        }
                        
                        this.mainController.logCommand('set-level', { oldLevel, newLevel: level });
                        return `Level set to ${level} (was ${oldLevel})`;
                    } else {
                        return 'Level setting not supported';
                    }
                } catch (error) {
                    return `Failed to set level: ${error.message}`;
                }
            },
            getCompletions: () => Array.from({length: 10}, (_, i) => String((i + 1) * 10))
        });

        // プレイヤー情報表示
        this.mainController.console.registerCommand('player-info', {
            description: 'Show player information',
            usage: 'player-info',
            category: 'player',
            aliases: ['player'],
            execute: () => {
                try {
                    const playerData = this.mainController.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const info = [];
                    info.push('=== Player Information ===');
                    
                    if (playerData.getName) info.push(`Name: ${playerData.getName()}`);
                    if (playerData.getLevel) info.push(`Level: ${playerData.getLevel()}`);
                    if (playerData.getAP) info.push(`AP: ${playerData.getAP()}`);
                    if (playerData.getTAP) info.push(`TAP: ${playerData.getTAP()}`);
                    if (playerData.getHighScore) info.push(`High Score: ${playerData.getHighScore()}`);
                    
                    return info.join('\n');
                } catch (error) {
                    return `Failed to get player info: ${error.message}`;
                }
            }
        });

        // プレイヤーデータリセット
        this.mainController.console.registerCommand('reset-player', {
            description: 'Reset player data',
            usage: 'reset-player [--confirm] [--backup]',
            category: 'player',
            execute: (args) => {
                const safetyValidator = this.mainController.getSafetyValidator();
                if (safetyValidator && !safetyValidator.validateDestructiveOperation('reset-player', args)) {
                    return 'This will reset all player data. Use "reset-player --confirm" to proceed';
                }
                
                try {
                    const playerData = this.mainController.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    // バックアップ作成
                    if (args.includes('--backup')) {
                        const backup = this.mainController.createPlayerDataBackup();
                        this.mainController.console.print(`Backup created: ${backup.id}`, 'info');
                    }
                    
                    const currentData = this.mainController.capturePlayerData();
                    if (playerData.reset) {
                        playerData.reset();
                        
                        const undoManager = this.mainController.getUndoManager();
                        if (undoManager) {
                            undoManager.addToUndoStack('reset-player', currentData);
                        }
                        
                        this.mainController.logCommand('reset-player', { backup: args.includes('--backup') });
                        return 'Player data reset successfully';
                    } else {
                        return 'Player data reset not supported';
                    }
                } catch (error) {
                    return `Failed to reset player data: ${error.message}`;
                }
            }
        });
    }

    /**
     * レベル・ステージ操作コマンド登録
     */
    registerLevelCommands() {
        // ステージ変更
        this.mainController.console.registerCommand('goto-stage', {
            description: 'Go to specific stage',
            usage: 'goto-stage <stage-name>',
            category: 'level',
            aliases: ['stage'],
            execute: (args) => {
                if (args.length === 0) return 'Usage: goto-stage <stage-name>';
                
                const stageName = args[0];
                try {
                    const stageManager = this.mainController.getStageManager();
                    if (!stageManager) return 'Stage manager not available';
                    
                    if (stageManager.setCurrentStage) {
                        const currentStage = stageManager.getCurrentStage ? stageManager.getCurrentStage() : 'unknown';
                        stageManager.setCurrentStage(stageName);
                        
                        const undoManager = this.mainController.getUndoManager();
                        if (undoManager) {
                            undoManager.addToUndoStack('goto-stage', { oldStage: currentStage });
                        }
                        
                        this.mainController.logCommand('goto-stage', { oldStage: currentStage, newStage: stageName });
                        return `Switched to stage: ${stageName}`;
                    } else {
                        return 'Stage switching not supported';
                    }
                } catch (error) {
                    return `Failed to switch stage: ${error.message}`;
                }
            },
            getCompletions: () => ['tutorial', 'normal', 'hard', 'expert', 'boss', 'endless']
        });

        // ステージ一覧
        this.mainController.console.registerCommand('list-stages', {
            description: 'List available stages',
            usage: 'list-stages',
            category: 'level',
            execute: () => {
                try {
                    const stageManager = this.mainController.getStageManager();
                    if (!stageManager) return 'Stage manager not available';
                    
                    if (stageManager.getAvailableStages) {
                        const stages = stageManager.getAvailableStages();
                        return `Available stages:\n${stages.map(s => `  ${s}`).join('\n')}`;
                    } else {
                        return 'Stage listing not supported';
                    }
                } catch (error) {
                    return `Failed to list stages: ${error.message}`;
                }
            }
        });

        // 難易度設定
        this.mainController.console.registerCommand('set-difficulty', {
            description: 'Set game difficulty',
            usage: 'set-difficulty <level>',
            category: 'level',
            execute: (args) => {
                if (args.length === 0) return 'Usage: set-difficulty <level>';
                
                const difficulty = args[0].toLowerCase();
                const validDifficulties = ['easy', 'normal', 'hard', 'expert'];
                
                if (!validDifficulties.includes(difficulty)) {
                    return `Invalid difficulty. Valid options: ${validDifficulties.join(', ')}`;
                }
                
                try {
                    const stageManager = this.mainController.getStageManager();
                    if (!stageManager) return 'Stage manager not available';
                    
                    if (stageManager.setDifficulty) {
                        const oldDifficulty = stageManager.getDifficulty ? stageManager.getDifficulty() : 'unknown';
                        stageManager.setDifficulty(difficulty);
                        
                        const undoManager = this.mainController.getUndoManager();
                        if (undoManager) {
                            undoManager.addToUndoStack('set-difficulty', { oldDifficulty });
                        }
                        
                        this.mainController.logCommand('set-difficulty', { oldDifficulty, newDifficulty: difficulty });
                        return `Difficulty set to: ${difficulty}`;
                    } else {
                        return 'Difficulty setting not supported';
                    }
                } catch (error) {
                    return `Failed to set difficulty: ${error.message}`;
                }
            },
            getCompletions: () => ['easy', 'normal', 'hard', 'expert']
        });
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
    }
}