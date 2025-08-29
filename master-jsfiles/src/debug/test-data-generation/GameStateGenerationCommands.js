import { BaseComponent } from '../BaseComponent.js';

/**
 * GameStateGenerationCommands - ゲーム状態生成コマンド処理コンポーネント
 */
export class GameStateGenerationCommands extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'GameStateGenerationCommands');
        this.stateTemplates = new Map();
        this.playerDataProfiles = new Map();
        this.statisticsGenerators = new Map();
        this.lastGeneratedState = null;
    }

    async _doInitialize() {
        this.setupStateTemplates();
        this.setupPlayerDataProfiles();
        this.setupStatisticsGenerators();
    }

    /**
     * ゲーム状態テンプレートを設定
     */
    setupStateTemplates() {
        // 通常ゲームシナリオ
        this.stateTemplates.set('normal', {
            description: 'Normal gameplay scenario',
            setup: (params = {}) => ({
                bubbleCount: params.bubbleCount || 15,
                playerHP: params.playerHP || 3,
                timeRemaining: params.timeRemaining || 300000,
                currentScore: params.currentScore || 0,
                currentCombo: params.currentCombo || 0,
                activeBubbleTypes: ['normal', 'stone', 'rainbow', 'pink'],
                gameSpeed: 1.0,
                ...params
            })
        });

        // ストレステストシナリオ
        this.stateTemplates.set('stress', {
            description: 'High-stress gameplay scenario',
            setup: (params = {}) => ({
                bubbleCount: params.bubbleCount || 50,
                playerHP: params.playerHP || 1,
                timeRemaining: params.timeRemaining || 60000,
                currentScore: params.currentScore || 10000,
                currentCombo: params.currentCombo || 15,
                activeBubbleTypes: ['normal', 'stone', 'iron', 'diamond', 'electric', 'poison', 'spiky', 'boss'],
                gameSpeed: 1.5,
                spawnRate: 0.3,
                ...params
            })
        });

        // ボスバトルシナリオ
        this.stateTemplates.set('boss', {
            description: 'Boss battle scenario',
            setup: (params = {}) => ({
                bubbleCount: params.bubbleCount || 5,
                playerHP: params.playerHP || 2,
                timeRemaining: params.timeRemaining || 180000,
                currentScore: params.currentScore || 5000,
                currentCombo: params.currentCombo || 8,
                activeBubbleTypes: ['boss', 'normal'],
                gameSpeed: 1.2,
                bossType: params.bossType || 'electric',
                bossCount: params.bossCount || 3,
                ...params
            })
        });

        // コンボシナリオ
        this.stateTemplates.set('combo', {
            description: 'High combo scenario',
            setup: (params = {}) => ({
                bubbleCount: params.bubbleCount || 25,
                playerHP: params.playerHP || 3,
                timeRemaining: params.timeRemaining || 240000,
                currentScore: params.currentScore || 2000,
                currentCombo: params.currentCombo || params.comboLevel || 20,
                activeBubbleTypes: ['normal', 'rainbow', 'multiplier'],
                gameSpeed: 1.1,
                comboMultiplier: 2.5,
                ...params
            })
        });

        // クリティカルシナリオ
        this.stateTemplates.set('critical', {
            description: 'Critical game state scenario',
            setup: (params = {}) => ({
                bubbleCount: params.bubbleCount || 40,
                playerHP: params.playerHP || 1,
                timeRemaining: params.timeRemaining || 30000,
                currentScore: params.currentScore || 1000,
                currentCombo: params.currentCombo || 3,
                activeBubbleTypes: ['poison', 'spiky', 'electric', 'escaping'],
                gameSpeed: 1.8,
                criticalMode: true,
                ...params
            })
        });
    }

    /**
     * プレイヤーデータプロファイルを設定
     */
    setupPlayerDataProfiles() {
        this.playerDataProfiles.set('beginner', {
            description: 'New player profile',
            generator: (overrides = {}) => ({
                totalScore: Math.floor(Math.random() * 1000),
                sessionsPlayed: Math.floor(Math.random() * 10) + 1,
                averageScore: Math.floor(Math.random() * 100),
                bestCombo: Math.floor(Math.random() * 5) + 1,
                playtimeMinutes: Math.floor(Math.random() * 60),
                bubblesPopped: Math.floor(Math.random() * 500),
                level: 1,
                ap: Math.floor(Math.random() * 100),
                tap: Math.floor(Math.random() * 150),
                ...overrides
            })
        });

        this.playerDataProfiles.set('experienced', {
            description: 'Experienced player profile',
            generator: (overrides = {}) => ({
                totalScore: Math.floor(Math.random() * 50000) + 5000,
                sessionsPlayed: Math.floor(Math.random() * 100) + 20,
                averageScore: Math.floor(Math.random() * 1000) + 200,
                bestCombo: Math.floor(Math.random() * 15) + 5,
                playtimeMinutes: Math.floor(Math.random() * 600) + 120,
                bubblesPopped: Math.floor(Math.random() * 10000) + 2000,
                level: Math.floor(Math.random() * 5) + 3,
                ap: Math.floor(Math.random() * 1000) + 200,
                tap: Math.floor(Math.random() * 2000) + 500,
                ...overrides
            })
        });

        this.playerDataProfiles.set('expert', {
            description: 'Expert player profile',
            generator: (overrides = {}) => ({
                totalScore: Math.floor(Math.random() * 200000) + 50000,
                sessionsPlayed: Math.floor(Math.random() * 500) + 100,
                averageScore: Math.floor(Math.random() * 5000) + 1000,
                bestCombo: Math.floor(Math.random() * 50) + 20,
                playtimeMinutes: Math.floor(Math.random() * 3000) + 600,
                bubblesPopped: Math.floor(Math.random() * 100000) + 20000,
                level: Math.floor(Math.random() * 10) + 8,
                ap: Math.floor(Math.random() * 10000) + 2000,
                tap: Math.floor(Math.random() * 50000) + 10000,
                ...overrides
            })
        });

        this.playerDataProfiles.set('random', {
            description: 'Random player profile',
            generator: (overrides = {}) => {
                const profiles = ['beginner', 'experienced', 'expert'];
                const selectedProfile = profiles[Math.floor(Math.random() * profiles.length)];
                return this.playerDataProfiles.get(selectedProfile).generator(overrides);
            }
        });
    }

    /**
     * 統計データジェネレーターを設定
     */
    setupStatisticsGenerators() {
        this.statisticsGenerators.set('daily', {
            description: 'Daily statistics generator',
            generator: (options = {}) => this.generatePeriodStatistics(1, options)
        });

        this.statisticsGenerators.set('weekly', {
            description: 'Weekly statistics generator',
            generator: (options = {}) => this.generatePeriodStatistics(7, options)
        });

        this.statisticsGenerators.set('monthly', {
            description: 'Monthly statistics generator',
            generator: (options = {}) => this.generatePeriodStatistics(30, options)
        });

        this.statisticsGenerators.set('session', {
            description: 'Session statistics generator',
            generator: (options = {}) => this.generatePeriodStatistics(0.04, options) // 1時間
        });
    }

    /**
     * ゲーム状態生成コマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processGameStateCommand(args, context, console) {
        try {
            const scenario = args[0];
            const parameters = args[1] ? JSON.parse(args[1]) : {};

            if (!scenario) {
                throw new Error('Scenario name is required');
            }

            const scenarioConfig = this.stateTemplates.get(scenario);
            if (!scenarioConfig) {
                throw new Error(`Unknown scenario: ${scenario}. Available: ${Array.from(this.stateTemplates.keys()).join(', ')}`);
            }

            const gameState = scenarioConfig.setup(parameters);
            
            // ゲーム状態を適用
            this.applyGameState(gameState);
            
            // 結果を記録
            this.lastGeneratedState = gameState;

            return `Applied ${scenario} scenario: ${gameState.bubbleCount} bubbles, HP=${gameState.playerHP}, Score=${gameState.currentScore}, Combo=${gameState.currentCombo}`;

        } catch (error) {
            this._handleError('game state command processing', error);
            return `Error generating game state: ${error.message}`;
        }
    }

    /**
     * プレイヤーデータ生成コマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processPlayerDataCommand(args, context, console) {
        try {
            const profile = args[0] || 'normal';
            const overrides = args[1] ? JSON.parse(args[1]) : {};

            const profileConfig = this.playerDataProfiles.get(profile);
            if (!profileConfig) {
                throw new Error(`Unknown profile: ${profile}. Available: ${Array.from(this.playerDataProfiles.keys()).join(', ')}`);
            }

            const playerData = profileConfig.generator(overrides);
            
            // プレイヤーデータを適用
            this.applyPlayerData(playerData);

            return `Generated ${profile} player profile: Score=${playerData.totalScore}, Level=${playerData.level}, AP=${playerData.ap}, Sessions=${playerData.sessionsPlayed}`;

        } catch (error) {
            this._handleError('player data command processing', error);
            return `Error generating player data: ${error.message}`;
        }
    }

    /**
     * 統計データ生成コマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processStatisticsCommand(args, context, console) {
        try {
            const period = args[0] || 'daily';
            const data = args[1] ? JSON.parse(args[1]) : {};

            const generatorConfig = this.statisticsGenerators.get(period);
            if (!generatorConfig) {
                throw new Error(`Unknown period: ${period}. Available: ${Array.from(this.statisticsGenerators.keys()).join(', ')}`);
            }

            const statistics = generatorConfig.generator(data);
            
            // 統計データを適用
            this.applyStatistics(statistics);

            return `Generated ${statistics.length} ${period} statistics entries. Total sessions: ${statistics.reduce((sum, s) => sum + s.sessionsPlayed, 0)}`;

        } catch (error) {
            this._handleError('statistics command processing', error);
            return `Error generating statistics: ${error.message}`;
        }
    }

    /**
     * ゲーム状態を適用
     * @param {Object} gameState - ゲーム状態
     */
    applyGameState(gameState) {
        const gameEngine = this.mainController.gameEngine;
        
        if (!gameEngine || !gameEngine.currentScene) {
            return;
        }

        const scene = gameEngine.currentScene;
        
        // プレイヤーHP設定
        if (scene.playerData) {
            scene.playerData.currentHP = gameState.playerHP;
        }
        
        // スコア設定
        if (scene.scoreManager) {
            scene.scoreManager.setScore(gameState.currentScore);
            scene.scoreManager.setCombo(gameState.currentCombo);
        }
        
        // バブル生成
        if (scene.bubbleManager && gameState.bubbleCount > 0) {
            const bubbleComponent = this.mainController.getComponent('bubbleGenerator');
            if (bubbleComponent) {
                const bubbles = bubbleComponent.generateBubbles(gameState.bubbleCount, 'random');
                
                for (const bubble of bubbles) {
                    scene.bubbleManager.addTestBubble(bubble);
                }
            }
        }
    }

    /**
     * プレイヤーデータを適用
     * @param {Object} playerData - プレイヤーデータ
     */
    applyPlayerData(playerData) {
        const gameEngine = this.mainController.gameEngine;
        
        if (gameEngine && gameEngine.playerData) {
            Object.assign(gameEngine.playerData, playerData);
            if (gameEngine.playerData.save) {
                gameEngine.playerData.save();
            }
        }
    }

    /**
     * 統計データを適用
     * @param {Array} statistics - 統計データ
     */
    applyStatistics(statistics) {
        const gameEngine = this.mainController.gameEngine;
        
        if (gameEngine && gameEngine.statisticsManager) {
            if (gameEngine.statisticsManager.importTestData) {
                gameEngine.statisticsManager.importTestData(statistics);
            }
        }
    }

    /**
     * 期間統計を生成
     * @param {number} periodDays - 期間（日数）
     * @param {Object} options - オプション
     * @returns {Array} 統計データ配列
     */
    generatePeriodStatistics(periodDays, options = {}) {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const data = [];
        
        for (let i = 0; i < periodDays; i++) {
            const timestamp = now - (i * dayMs);
            data.push({
                timestamp,
                date: new Date(timestamp).toISOString().split('T')[0],
                sessionsPlayed: Math.floor(Math.random() * 10) + 1,
                totalScore: Math.floor(Math.random() * 5000),
                bubblesPopped: Math.floor(Math.random() * 500) + 50,
                averageCombo: Math.floor(Math.random() * 8) + 2,
                maxCombo: Math.floor(Math.random() * 15) + 5,
                playtimeMinutes: Math.floor(Math.random() * 120) + 15,
                achievements: Math.floor(Math.random() * 3),
                ...options
            });
        }
        
        return data.reverse();
    }

    /**
     * ゲーム状態コマンドの登録情報を取得
     * @returns {Array} コマンド登録情報配列
     */
    getGameStateCommandRegistrations() {
        return [
            {
                command: 'test.gamestate',
                handler: this.processGameStateCommand.bind(this),
                description: 'Generate specific game state for testing',
                usage: 'test.gamestate <scenario> [parameters]',
                parameters: [
                    { name: 'scenario', type: 'string', required: true, description: 'Scenario name: normal, stress, boss, combo, critical' },
                    { name: 'parameters', type: 'string', required: false, description: 'JSON parameters string' }
                ],
                examples: [
                    'test.gamestate normal',
                    'test.gamestate stress {"bubbleCount": 50}',
                    'test.gamestate boss {"bossType": "electric"}',
                    'test.gamestate combo {"comboLevel": 10}'
                ],
                group: 'test'
            },
            {
                command: 'test.playerdata',
                handler: this.processPlayerDataCommand.bind(this),
                description: 'Generate test player data',
                usage: 'test.playerdata <profile> [overrides]',
                parameters: [
                    { name: 'profile', type: 'string', required: true, description: 'Profile: beginner, experienced, expert, random' },
                    { name: 'overrides', type: 'string', required: false, description: 'JSON overrides string' }
                ],
                examples: [
                    'test.playerdata beginner',
                    'test.playerdata expert {"totalScore": 100000}',
                    'test.playerdata random'
                ],
                group: 'test'
            },
            {
                command: 'test.statistics',
                handler: this.processStatisticsCommand.bind(this),
                description: 'Generate test statistics data',
                usage: 'test.statistics <period> [data]',
                parameters: [
                    { name: 'period', type: 'string', required: true, description: 'Period: daily, weekly, monthly, session' },
                    { name: 'data', type: 'string', required: false, description: 'JSON data overrides' }
                ],
                examples: [
                    'test.statistics daily',
                    'test.statistics weekly {"sessionsPlayed": 50}',
                    'test.statistics session'
                ],
                group: 'test'
            }
        ];
    }

    /**
     * 最後に生成された状態を取得
     * @returns {Object|null} ゲーム状態
     */
    getLastGeneratedState() {
        return this.lastGeneratedState;
    }

    /**
     * 利用可能なシナリオを取得
     * @returns {Array} シナリオ一覧
     */
    getAvailableScenarios() {
        return Array.from(this.stateTemplates.entries()).map(([name, config]) => ({
            name,
            description: config.description
        }));
    }

    /**
     * 利用可能なプロファイルを取得
     * @returns {Array} プロファイル一覧
     */
    getAvailableProfiles() {
        return Array.from(this.playerDataProfiles.entries()).map(([name, config]) => ({
            name,
            description: config.description
        }));
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.stateTemplates.clear();
        this.playerDataProfiles.clear();
        this.statisticsGenerators.clear();
        this.lastGeneratedState = null;
        super.cleanup();
    }
}