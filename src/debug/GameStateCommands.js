/**
 * Game State Commands
 * ゲーム状態操作コマンド群
 */

export class GameStateCommands {
    constructor(gameEngine, console) {
        this.gameEngine = gameEngine;
        this.console = console;
        this.errorHandler = null;
        
        // コマンド実行状態
        this.executionState = {
            lastCommand: null,
            commandHistory: [],
            undoStack: [],
            maxUndoSize: 10
        };
        
        // 安全性チェック設定
        this.safetyChecks = {
            confirmDestructive: true,
            preventDataLoss: true,
            validateInputs: true,
            logAllChanges: true
        };
        
        this.initialize();
    }

    initialize() {
        this.setupErrorHandler();
        this.registerCommands();
        
        console.log('[GameStateCommands] Game state commands initialized');
    }

    /**
     * エラーハンドラ設定
     */
    setupErrorHandler() {
        try {
            const { getErrorHandler } = require('../utils/ErrorHandler.js');
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[GameStateCommands] ErrorHandler not available:', error.message);
            this.errorHandler = {
                handleError: (error, context) => console.error(`[${context}]`, error)
            };
        }
    }

    /**
     * コマンド登録
     */
    registerCommands() {
        // ゲーム制御コマンド
        this.registerGameControlCommands();
        
        // スコア操作コマンド
        this.registerScoreCommands();
        
        // バブル操作コマンド
        this.registerBubbleCommands();
        
        // プレイヤーデータ操作コマンド
        this.registerPlayerDataCommands();
        
        // レベル・ステージ操作コマンド
        this.registerLevelCommands();
        
        // デバッグ・テストコマンド
        this.registerDebugCommands();
    }

    /**
     * ゲーム制御コマンド登録
     */
    registerGameControlCommands() {
        // ゲーム一時停止
        this.console.registerCommand('pause', {
            description: 'Pause the game',
            usage: 'pause',
            category: 'game-control',
            execute: () => {
                if (!this.gameEngine) return 'Game engine not available';
                
                try {
                    if (this.gameEngine.isPaused) {
                        return 'Game is already paused';
                    }
                    
                    this.gameEngine.pause();
                    this.logCommand('pause', {});
                    return 'Game paused';
                } catch (error) {
                    return `Failed to pause game: ${error.message}`;
                }
            }
        });

        // ゲーム再開
        this.console.registerCommand('resume', {
            description: 'Resume the game',
            usage: 'resume',
            category: 'game-control',
            aliases: ['unpause'],
            execute: () => {
                if (!this.gameEngine) return 'Game engine not available';
                
                try {
                    if (!this.gameEngine.isPaused) {
                        return 'Game is not paused';
                    }
                    
                    this.gameEngine.resume();
                    this.logCommand('resume', {});
                    return 'Game resumed';
                } catch (error) {
                    return `Failed to resume game: ${error.message}`;
                }
            }
        });

        // ゲームリセット
        this.console.registerCommand('reset', {
            description: 'Reset the current game',
            usage: 'reset [--confirm]',
            category: 'game-control',
            execute: (args) => {
                if (!this.gameEngine) return 'Game engine not available';
                
                if (this.safetyChecks.confirmDestructive && !args.includes('--confirm')) {
                    return 'This will reset the current game. Use "reset --confirm" to proceed';
                }
                
                try {
                    const currentState = this.captureGameState();
                    this.gameEngine.reset();
                    this.addToUndoStack('reset', currentState);
                    this.logCommand('reset', { confirmed: true });
                    return 'Game reset successfully';
                } catch (error) {
                    return `Failed to reset game: ${error.message}`;
                }
            }
        });

        // ゲーム終了
        this.console.registerCommand('stop', {
            description: 'Stop the current game',
            usage: 'stop [--confirm]',
            category: 'game-control',
            execute: (args) => {
                if (!this.gameEngine) return 'Game engine not available';
                
                if (this.safetyChecks.confirmDestructive && !args.includes('--confirm')) {
                    return 'This will stop the current game. Use "stop --confirm" to proceed';
                }
                
                try {
                    const currentState = this.captureGameState();
                    this.gameEngine.stop();
                    this.addToUndoStack('stop', currentState);
                    this.logCommand('stop', { confirmed: true });
                    return 'Game stopped';
                } catch (error) {
                    return `Failed to stop game: ${error.message}`;
                }
            }
        });

        // ゲーム状態表示
        this.console.registerCommand('status', {
            description: 'Show current game status',
            usage: 'status',
            category: 'game-control',
            aliases: ['state'],
            execute: () => {
                if (!this.gameEngine) return 'Game engine not available';
                
                const status = [];
                status.push('=== Game Status ===');
                status.push(`Running: ${this.gameEngine.isRunning || false}`);
                status.push(`Paused: ${this.gameEngine.isPaused || false}`);
                
                if (this.gameEngine.sceneManager) {
                    status.push(`Current Scene: ${this.gameEngine.sceneManager.currentScene || 'none'}`);
                }
                
                if (this.gameEngine.performanceOptimizer) {
                    status.push(`FPS: ${this.gameEngine.performanceOptimizer.getCurrentFPS()}`);
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
        this.console.registerCommand('set-score', {
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
                    const scoreManager = this.getScoreManager();
                    if (!scoreManager) return 'Score manager not available';
                    
                    const oldScore = scoreManager.getScore();
                    scoreManager.setScore(score);
                    this.addToUndoStack('set-score', { oldScore });
                    this.logCommand('set-score', { oldScore, newScore: score });
                    return `Score set to ${score} (was ${oldScore})`;
                } catch (error) {
                    return `Failed to set score: ${error.message}`;
                }
            },
            getCompletions: () => ['1000', '5000', '10000', '50000']
        });

        // スコア追加
        this.console.registerCommand('add-score', {
            description: 'Add to player score',
            usage: 'add-score <value>',
            category: 'score',
            execute: (args) => {
                if (args.length === 0) return 'Usage: add-score <value>';
                
                const addition = parseInt(args[0]);
                if (isNaN(addition)) return 'Invalid score value';
                
                try {
                    const scoreManager = this.getScoreManager();
                    if (!scoreManager) return 'Score manager not available';
                    
                    const oldScore = scoreManager.getScore();
                    const newScore = oldScore + addition;
                    scoreManager.setScore(Math.max(0, newScore));
                    this.addToUndoStack('add-score', { oldScore });
                    this.logCommand('add-score', { addition, oldScore, newScore });
                    return `Added ${addition} to score (${oldScore} → ${newScore})`;
                } catch (error) {
                    return `Failed to add score: ${error.message}`;
                }
            }
        });

        // コンボリセット
        this.console.registerCommand('reset-combo', {
            description: 'Reset current combo',
            usage: 'reset-combo',
            category: 'score',
            execute: () => {
                try {
                    const scoreManager = this.getScoreManager();
                    if (!scoreManager) return 'Score manager not available';
                    
                    const oldCombo = scoreManager.getCurrentCombo ? scoreManager.getCurrentCombo() : 0;
                    if (scoreManager.resetCombo) {
                        scoreManager.resetCombo();
                        this.logCommand('reset-combo', { oldCombo });
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
        this.console.registerCommand('high-score', {
            description: 'Show high score information',
            usage: 'high-score',
            category: 'score',
            aliases: ['highscore', 'best'],
            execute: () => {
                try {
                    const playerData = this.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const highScore = playerData.getHighScore ? playerData.getHighScore() : 'Unknown';
                    const currentScore = this.getScoreManager()?.getScore() || 0;
                    
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
        this.console.registerCommand('spawn-bubble', {
            description: 'Spawn bubbles',
            usage: 'spawn-bubble [type] [count] [x] [y]',
            category: 'bubbles',
            aliases: ['bubble'],
            execute: (args) => {
                try {
                    const bubbleManager = this.getBubbleManager();
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
                    
                    this.logCommand('spawn-bubble', { type, count: spawned, x, y });
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
        this.console.registerCommand('clear-bubbles', {
            description: 'Clear all bubbles',
            usage: 'clear-bubbles [--confirm]',
            category: 'bubbles',
            execute: (args) => {
                if (this.safetyChecks.confirmDestructive && !args.includes('--confirm')) {
                    return 'This will clear all bubbles. Use "clear-bubbles --confirm" to proceed';
                }
                
                try {
                    const bubbleManager = this.getBubbleManager();
                    if (!bubbleManager) return 'Bubble manager not available';
                    
                    const bubbleCount = bubbleManager.getActiveBubbleCount ? bubbleManager.getActiveBubbleCount() : 0;
                    
                    if (bubbleManager.clearAllBubbles) {
                        bubbleManager.clearAllBubbles();
                    } else if (bubbleManager.bubbles) {
                        bubbleManager.bubbles = [];
                    }
                    
                    this.logCommand('clear-bubbles', { clearedCount: bubbleCount });
                    return `Cleared ${bubbleCount} bubbles`;
                } catch (error) {
                    return `Failed to clear bubbles: ${error.message}`;
                }
            }
        });

        // バブル情報表示
        this.console.registerCommand('bubble-info', {
            description: 'Show bubble information',
            usage: 'bubble-info',
            category: 'bubbles',
            execute: () => {
                try {
                    const bubbleManager = this.getBubbleManager();
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
        this.console.registerCommand('set-ap', {
            description: 'Set player AP (Awaputi Points)',
            usage: 'set-ap <value>',
            category: 'player',
            execute: (args) => {
                if (args.length === 0) return 'Usage: set-ap <value>';
                
                const ap = parseInt(args[0]);
                if (isNaN(ap) || ap < 0) return 'Invalid AP value';
                
                try {
                    const playerData = this.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const oldAP = playerData.getAP ? playerData.getAP() : 0;
                    if (playerData.setAP) {
                        playerData.setAP(ap);
                        this.addToUndoStack('set-ap', { oldAP });
                        this.logCommand('set-ap', { oldAP, newAP: ap });
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
        this.console.registerCommand('set-level', {
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
                    const playerData = this.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    const oldLevel = playerData.getLevel ? playerData.getLevel() : 1;
                    if (playerData.setLevel) {
                        playerData.setLevel(level);
                        this.addToUndoStack('set-level', { oldLevel });
                        this.logCommand('set-level', { oldLevel, newLevel: level });
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
        this.console.registerCommand('player-info', {
            description: 'Show player information',
            usage: 'player-info',
            category: 'player',
            aliases: ['player'],
            execute: () => {
                try {
                    const playerData = this.getPlayerData();
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
        this.console.registerCommand('reset-player', {
            description: 'Reset player data',
            usage: 'reset-player [--confirm] [--backup]',
            category: 'player',
            execute: (args) => {
                if (this.safetyChecks.confirmDestructive && !args.includes('--confirm')) {
                    return 'This will reset all player data. Use "reset-player --confirm" to proceed';
                }
                
                try {
                    const playerData = this.getPlayerData();
                    if (!playerData) return 'Player data not available';
                    
                    // バックアップ作成
                    if (args.includes('--backup')) {
                        const backup = this.createPlayerDataBackup();
                        this.console.print(`Backup created: ${backup.id}`, 'info');
                    }
                    
                    const currentData = this.capturePlayerData();
                    if (playerData.reset) {
                        playerData.reset();
                        this.addToUndoStack('reset-player', currentData);
                        this.logCommand('reset-player', { backup: args.includes('--backup') });
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
        this.console.registerCommand('goto-stage', {
            description: 'Go to specific stage',
            usage: 'goto-stage <stage-name>',
            category: 'level',
            aliases: ['stage'],
            execute: (args) => {
                if (args.length === 0) return 'Usage: goto-stage <stage-name>';
                
                const stageName = args[0];
                try {
                    const stageManager = this.getStageManager();
                    if (!stageManager) return 'Stage manager not available';
                    
                    if (stageManager.setCurrentStage) {
                        const currentStage = stageManager.getCurrentStage ? stageManager.getCurrentStage() : 'unknown';
                        stageManager.setCurrentStage(stageName);
                        this.addToUndoStack('goto-stage', { oldStage: currentStage });
                        this.logCommand('goto-stage', { oldStage: currentStage, newStage: stageName });
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
        this.console.registerCommand('list-stages', {
            description: 'List available stages',
            usage: 'list-stages',
            category: 'level',
            execute: () => {
                try {
                    const stageManager = this.getStageManager();
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
        this.console.registerCommand('set-difficulty', {
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
                    const stageManager = this.getStageManager();
                    if (!stageManager) return 'Stage manager not available';
                    
                    if (stageManager.setDifficulty) {
                        const oldDifficulty = stageManager.getDifficulty ? stageManager.getDifficulty() : 'unknown';
                        stageManager.setDifficulty(difficulty);
                        this.addToUndoStack('set-difficulty', { oldDifficulty });
                        this.logCommand('set-difficulty', { oldDifficulty, newDifficulty: difficulty });
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
     * デバッグ・テストコマンド登録
     */
    registerDebugCommands() {
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

        // Undo機能
        this.console.registerCommand('undo', {
            description: 'Undo last command',
            usage: 'undo',
            category: 'debug',
            execute: () => {
                if (this.executionState.undoStack.length === 0) {
                    return 'No commands to undo';
                }
                
                try {
                    const lastCommand = this.executionState.undoStack.pop();
                    this.restoreState(lastCommand);
                    return `Undid: ${lastCommand.command}`;
                } catch (error) {
                    return `Failed to undo: ${error.message}`;
                }
            }
        });
    }

    // ヘルパーメソッド

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
     * コマンド実行記録
     */
    logCommand(command, params) {
        const log = {
            timestamp: Date.now(),
            command: command,
            params: params
        };
        
        this.executionState.commandHistory.push(log);
        this.executionState.lastCommand = command;
        
        if (this.safetyChecks.logAllChanges) {
            console.log('[GameStateCommands] Command executed:', log);
        }
    }

    /**
     * Undoスタックに追加
     */
    addToUndoStack(command, state) {
        this.executionState.undoStack.push({
            command: command,
            state: state,
            timestamp: Date.now()
        });
        
        // サイズ制限
        if (this.executionState.undoStack.length > this.safetyChecks.maxUndoSize) {
            this.executionState.undoStack.shift();
        }
    }

    /**
     * 状態復元
     */
    restoreState(undoItem) {
        // 実装は各コマンドの種類に応じて適切な復元処理を行う
        console.log('[GameStateCommands] Restoring state for:', undoItem.command);
        // 具体的な復元ロジックは各ゲームシステムに依存
    }

    /**
     * 安全性設定更新
     */
    updateSafetySettings(settings) {
        Object.assign(this.safetyChecks, settings);
        console.log('[GameStateCommands] Safety settings updated');
    }

    /**
     * 実行統計取得
     */
    getExecutionStatistics() {
        return {
            totalCommands: this.executionState.commandHistory.length,
            lastCommand: this.executionState.lastCommand,
            undoStackSize: this.executionState.undoStack.length,
            availableUndos: this.executionState.undoStack.length
        };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.executionState.commandHistory = [];
        this.executionState.undoStack = [];
        
        console.log('[GameStateCommands] Destroyed');
    }
}

export default GameStateCommands;