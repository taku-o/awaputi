/**
 * Test Data Generation Commands
 * テストデータ生成用のコマンド群を提供
 */

export class TestDataGenerationCommands {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.mockDataGenerators = new Map();
        this.testScenarios = new Map();
        this.generatedData = new Map();
        
        this.initializeGenerators();
        this.initializeScenarios();
    }

    /**
     * DeveloperConsoleにコマンドを登録
     */
    registerCommands(console) {
        // バブル生成コマンド
        console.register('test.bubbles', this.generateBubblesCommand.bind(this), {
            description: 'Generate test bubbles with specified parameters',
            usage: 'test.bubbles [count] [type] [options]',
            parameters: [
                { name: 'count', type: 'number', required: false, description: 'Number of bubbles (default: 10)' },
                { name: 'type', type: 'string', required: false, description: 'Bubble type or "random"' },
                { name: 'options', type: 'string', required: false, description: 'JSON options string' }
            ],
            examples: [
                'test.bubbles',
                'test.bubbles 20',
                'test.bubbles 15 electric',
                'test.bubbles 5 random {"spawnDelay": 100}'
            ],
            group: 'test'
        });

        // ゲーム状態生成コマンド
        console.register('test.gamestate', this.generateGameStateCommand.bind(this), {
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
        });

        // プレイヤーデータ生成コマンド
        console.register('test.playerdata', this.generatePlayerDataCommand.bind(this), {
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
        });

        // 統計データ生成コマンド
        console.register('test.statistics', this.generateStatisticsCommand.bind(this), {
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
        });

        // パフォーマンステストデータ生成コマンド
        console.register('test.performance', this.generatePerformanceTestCommand.bind(this), {
            description: 'Generate performance test scenarios',
            usage: 'test.performance <scenario> [intensity]',
            parameters: [
                { name: 'scenario', type: 'string', required: true, description: 'Scenario: memory, cpu, rendering, particles' },
                { name: 'intensity', type: 'string', required: false, description: 'Intensity: low, medium, high, extreme' }
            ],
            examples: [
                'test.performance memory',
                'test.performance cpu high',
                'test.performance rendering extreme',
                'test.performance particles medium'
            ],
            group: 'test'
        });

        // 設定テストデータ生成コマンド
        console.register('test.config', this.generateConfigTestCommand.bind(this), {
            description: 'Generate test configurations',
            usage: 'test.config <type> [scenario]',
            parameters: [
                { name: 'type', type: 'string', required: true, description: 'Config type: game, audio, effects, performance' },
                { name: 'scenario', type: 'string', required: false, description: 'Scenario: default, minimal, maximal, broken' }
            ],
            examples: [
                'test.config game',
                'test.config audio minimal',
                'test.config effects maximal',
                'test.config performance broken'
            ],
            group: 'test'
        });

        // エラーシミュレーションコマンド
        console.register('test.errors', this.simulateErrorsCommand.bind(this), {
            description: 'Simulate various error conditions',
            usage: 'test.errors <type> [parameters]',
            parameters: [
                { name: 'type', type: 'string', required: true, description: 'Error type: memory, network, render, logic, crash' },
                { name: 'parameters', type: 'string', required: false, description: 'JSON parameters for error simulation' }
            ],
            examples: [
                'test.errors memory',
                'test.errors network {"delay": 5000}',
                'test.errors render {"corruption": true}',
                'test.errors logic {"bubbleOverflow": true}'
            ],
            group: 'test'
        });

        // ストレステストコマンド
        console.register('test.stress', this.runStressTestCommand.bind(this), {
            description: 'Run stress tests for performance evaluation',
            usage: 'test.stress <component> [duration] [options]',
            parameters: [
                { name: 'component', type: 'string', required: true, description: 'Component: bubbles, rendering, audio, memory, all' },
                { name: 'duration', type: 'number', required: false, description: 'Test duration in seconds (default: 30)' },
                { name: 'options', type: 'string', required: false, description: 'JSON test options' }
            ],
            examples: [
                'test.stress bubbles',
                'test.stress rendering 60',
                'test.stress all 120 {"intensity": "high"}',
                'test.stress memory 30 {"leakTest": true}'
            ],
            group: 'test'
        });

        // テストデータクリアコマンド
        console.register('test.clear', this.clearTestDataCommand.bind(this), {
            description: 'Clear generated test data',
            usage: 'test.clear [type]',
            parameters: [
                { name: 'type', type: 'string', required: false, description: 'Data type to clear or "all"' }
            ],
            examples: [
                'test.clear',
                'test.clear bubbles',
                'test.clear all'
            ],
            group: 'test'
        });

        // テストデータリストコマンド
        console.register('test.list', this.listTestDataCommand.bind(this), {
            description: 'List available test data and scenarios',
            usage: 'test.list [category]',
            parameters: [
                { name: 'category', type: 'string', required: false, description: 'Category: generators, scenarios, data' }
            ],
            examples: [
                'test.list',
                'test.list generators',
                'test.list scenarios'
            ],
            group: 'test'
        });
    }

    /**
     * データジェネレーターの初期化
     */
    initializeGenerators() {
        // バブルジェネレーター
        this.mockDataGenerators.set('bubbles', {
            generate: (options = {}) => {
                const count = options.count || 10;
                const type = options.type || 'random';
                const bubbles = [];
                
                const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky', 'escaping', 'boss'];
                
                for (let i = 0; i < count; i++) {
                    const bubbleType = type === 'random' 
                        ? bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)]
                        : type;
                    
                    bubbles.push({
                        id: `test-bubble-${i}`,
                        type: bubbleType,
                        x: Math.random() * 800,
                        y: Math.random() * 600,
                        size: Math.random() * 30 + 20,
                        health: this.getBubbleHealth(bubbleType),
                        velocity: {
                            x: (Math.random() - 0.5) * 4,
                            y: (Math.random() - 0.5) * 4
                        },
                        spawnTime: Date.now() - Math.random() * 10000,
                        properties: this.getBubbleProperties(bubbleType)
                    });
                }
                
                return bubbles;
            }
        });

        // プレイヤーデータジェネレーター
        this.mockDataGenerators.set('playerData', {
            generate: (profile = 'normal', overrides = {}) => {
                const profiles = {
                    beginner: {
                        totalScore: Math.floor(Math.random() * 1000),
                        sessionsPlayed: Math.floor(Math.random() * 10) + 1,
                        averageScore: Math.floor(Math.random() * 100),
                        bestCombo: Math.floor(Math.random() * 5) + 1,
                        playtimeMinutes: Math.floor(Math.random() * 60),
                        bubblesPopped: Math.floor(Math.random() * 500),
                        level: 1,
                        ap: Math.floor(Math.random() * 100),
                        tap: Math.floor(Math.random() * 150)
                    },
                    experienced: {
                        totalScore: Math.floor(Math.random() * 50000) + 5000,
                        sessionsPlayed: Math.floor(Math.random() * 100) + 20,
                        averageScore: Math.floor(Math.random() * 1000) + 200,
                        bestCombo: Math.floor(Math.random() * 15) + 5,
                        playtimeMinutes: Math.floor(Math.random() * 600) + 120,
                        bubblesPopped: Math.floor(Math.random() * 10000) + 2000,
                        level: Math.floor(Math.random() * 5) + 3,
                        ap: Math.floor(Math.random() * 1000) + 200,
                        tap: Math.floor(Math.random() * 2000) + 500
                    },
                    expert: {
                        totalScore: Math.floor(Math.random() * 200000) + 50000,
                        sessionsPlayed: Math.floor(Math.random() * 500) + 100,
                        averageScore: Math.floor(Math.random() * 5000) + 1000,
                        bestCombo: Math.floor(Math.random() * 50) + 20,
                        playtimeMinutes: Math.floor(Math.random() * 3000) + 600,
                        bubblesPopped: Math.floor(Math.random() * 100000) + 20000,
                        level: Math.floor(Math.random() * 10) + 8,
                        ap: Math.floor(Math.random() * 10000) + 2000,
                        tap: Math.floor(Math.random() * 50000) + 10000
                    }
                };

                const baseData = profiles[profile] || profiles.experienced;
                return { ...baseData, ...overrides };
            }
        });

        // 統計データジェネレーター
        this.mockDataGenerators.set('statistics', {
            generate: (period = 'daily', options = {}) => {
                const now = Date.now();
                const dayMs = 24 * 60 * 60 * 1000;
                
                const periods = {
                    daily: 1,
                    weekly: 7,
                    monthly: 30,
                    session: 0.04 // 1時間
                };
                
                const periodDays = periods[period] || 1;
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
        });
    }

    /**
     * テストシナリオの初期化
     */
    initializeScenarios() {
        // 通常ゲームシナリオ
        this.testScenarios.set('normal', {
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
        this.testScenarios.set('stress', {
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
        this.testScenarios.set('boss', {
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
        this.testScenarios.set('combo', {
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
        this.testScenarios.set('critical', {
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
     * バブルのヘルス値を取得
     */
    getBubbleHealth(type) {
        const healthMap = {
            normal: 1,
            stone: 2,
            iron: 3,
            diamond: 4,
            rainbow: 1,
            pink: 1,
            clock: 1,
            electric: 2,
            poison: 1,
            spiky: 2,
            escaping: 1,
            boss: 8,
            golden: 1,
            frozen: 3,
            magnetic: 2,
            explosive: 1,
            phantom: 1,
            multiplier: 1
        };
        return healthMap[type] || 1;
    }

    /**
     * バブルの特性を取得
     */
    getBubbleProperties(type) {
        const properties = {
            normal: {},
            stone: { hardness: 'medium' },
            iron: { hardness: 'hard', metallic: true },
            diamond: { hardness: 'extreme', sparkle: true },
            rainbow: { special: 'bonusTime', colorful: true },
            pink: { special: 'heal', healing: 1 },
            clock: { special: 'timeStop', duration: 3000 },
            electric: { special: 'shock', intensity: 15 },
            poison: { special: 'damage', damage: 1 },
            spiky: { special: 'chainDamage', spikes: true },
            escaping: { special: 'flee', speed: 2.0 },
            boss: { special: 'boss', size: 2.0, threat: 'high' }
        };
        return properties[type] || {};
    }

    // === コマンド実装 ===

    async generateBubblesCommand(args, context, console) {
        const count = parseInt(args[0]) || 10;
        const type = args[1] || 'random';
        const options = args[2] ? JSON.parse(args[2]) : {};
        
        const bubbles = this.mockDataGenerators.get('bubbles').generate({
            count,
            type,
            ...options
        });
        
        // 生成されたバブルをゲームに追加
        if (this.gameEngine.currentScene && this.gameEngine.currentScene.bubbleManager) {
            const bubbleManager = this.gameEngine.currentScene.bubbleManager;
            
            for (const bubbleData of bubbles) {
                bubbleManager.addTestBubble(bubbleData);
            }
        }
        
        this.generatedData.set('lastBubbles', bubbles);
        
        return `Generated ${bubbles.length} ${type} bubbles. ${bubbles.length > 0 ? `First bubble: ${bubbles[0].type} at (${bubbles[0].x.toFixed(1)}, ${bubbles[0].y.toFixed(1)})` : ''}`;
    }

    async generateGameStateCommand(args, context, console) {
        const scenario = args[0];
        const parameters = args[1] ? JSON.parse(args[1]) : {};
        
        const scenarioConfig = this.testScenarios.get(scenario);
        if (!scenarioConfig) {
            throw new Error(`Unknown scenario: ${scenario}. Available: ${Array.from(this.testScenarios.keys()).join(', ')}`);
        }
        
        const gameState = scenarioConfig.setup(parameters);
        
        // ゲーム状態の適用
        if (this.gameEngine.currentScene) {
            const scene = this.gameEngine.currentScene;
            
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
                const bubbles = this.mockDataGenerators.get('bubbles').generate({
                    count: gameState.bubbleCount,
                    type: 'random'
                });
                
                for (const bubble of bubbles) {
                    scene.bubbleManager.addTestBubble(bubble);
                }
            }
        }
        
        this.generatedData.set('lastGameState', gameState);
        
        return `Applied ${scenario} scenario: ${gameState.bubbleCount} bubbles, HP=${gameState.playerHP}, Score=${gameState.currentScore}, Combo=${gameState.currentCombo}`;
    }

    async generatePlayerDataCommand(args, context, console) {
        const profile = args[0] || 'normal';
        const overrides = args[1] ? JSON.parse(args[1]) : {};
        
        const playerData = this.mockDataGenerators.get('playerData').generate(profile, overrides);
        
        // プレイヤーデータの適用
        if (this.gameEngine.playerData) {
            Object.assign(this.gameEngine.playerData, playerData);
            this.gameEngine.playerData.save();
        }
        
        this.generatedData.set('lastPlayerData', playerData);
        
        return `Generated ${profile} player profile: Score=${playerData.totalScore}, Level=${playerData.level}, AP=${playerData.ap}, Sessions=${playerData.sessionsPlayed}`;
    }

    async generateStatisticsCommand(args, context, console) {
        const period = args[0] || 'daily';
        const data = args[1] ? JSON.parse(args[1]) : {};
        
        const statistics = this.mockDataGenerators.get('statistics').generate(period, data);
        
        // 統計データの適用
        if (this.gameEngine.statisticsManager) {
            this.gameEngine.statisticsManager.importTestData(statistics);
        }
        
        this.generatedData.set('lastStatistics', statistics);
        
        return `Generated ${statistics.length} ${period} statistics entries. Total sessions: ${statistics.reduce((sum, s) => sum + s.sessionsPlayed, 0)}`;
    }

    async generatePerformanceTestCommand(args, context, console) {
        const scenario = args[0];
        const intensity = args[1] || 'medium';
        
        const intensityMultipliers = {
            low: 0.5,
            medium: 1.0,
            high: 1.5,
            extreme: 2.0
        };
        
        const multiplier = intensityMultipliers[intensity] || 1.0;
        let testConfig;
        
        switch (scenario) {
            case 'memory':
                testConfig = {
                    allocateObjects: Math.floor(1000 * multiplier),
                    objectSize: Math.floor(1024 * multiplier),
                    retainObjects: Math.floor(100 * multiplier)
                };
                break;
                
            case 'cpu':
                testConfig = {
                    computationCycles: Math.floor(100000 * multiplier),
                    parallelTasks: Math.floor(10 * multiplier),
                    complexCalculations: true
                };
                break;
                
            case 'rendering':
                testConfig = {
                    drawCalls: Math.floor(1000 * multiplier),
                    particleCount: Math.floor(5000 * multiplier),
                    effectLayers: Math.floor(20 * multiplier)
                };
                break;
                
            case 'particles':
                testConfig = {
                    particleCount: Math.floor(10000 * multiplier),
                    emitterCount: Math.floor(50 * multiplier),
                    complexity: intensity
                };
                break;
                
            default:
                throw new Error(`Unknown performance scenario: ${scenario}. Available: memory, cpu, rendering, particles`);
        }
        
        this.generatedData.set('lastPerformanceTest', { scenario, intensity, config: testConfig });
        
        return `Generated ${scenario} performance test (${intensity}): ${JSON.stringify(testConfig)}`;
    }

    async generateConfigTestCommand(args, context, console) {
        const type = args[0];
        const scenario = args[1] || 'default';
        
        const configTemplates = {
            game: {
                default: { canvas: { width: 800, height: 600 }, fps: 60 },
                minimal: { canvas: { width: 400, height: 300 }, fps: 30 },
                maximal: { canvas: { width: 1920, height: 1080 }, fps: 120 },
                broken: { canvas: { width: -100, height: 0 }, fps: -1 }
            },
            audio: {
                default: { masterVolume: 0.7, sfxVolume: 0.8, musicVolume: 0.6 },
                minimal: { masterVolume: 0.1, sfxVolume: 0.1, musicVolume: 0.1 },
                maximal: { masterVolume: 1.0, sfxVolume: 1.0, musicVolume: 1.0 },
                broken: { masterVolume: 2.0, sfxVolume: -0.5, musicVolume: 'invalid' }
            },
            effects: {
                default: { particleCount: 100, quality: 'medium' },
                minimal: { particleCount: 10, quality: 'low' },
                maximal: { particleCount: 1000, quality: 'ultra' },
                broken: { particleCount: -50, quality: 'invalid' }
            },
            performance: {
                default: { targetFPS: 60, memoryLimit: 100 },
                minimal: { targetFPS: 30, memoryLimit: 50 },
                maximal: { targetFPS: 120, memoryLimit: 500 },
                broken: { targetFPS: 0, memoryLimit: -100 }
            }
        };
        
        if (!configTemplates[type]) {
            throw new Error(`Unknown config type: ${type}. Available: ${Object.keys(configTemplates).join(', ')}`);
        }
        
        if (!configTemplates[type][scenario]) {
            throw new Error(`Unknown scenario: ${scenario}. Available: ${Object.keys(configTemplates[type]).join(', ')}`);
        }
        
        const config = configTemplates[type][scenario];
        this.generatedData.set('lastConfig', { type, scenario, config });
        
        return `Generated ${type} config (${scenario}): ${JSON.stringify(config)}`;
    }

    async simulateErrorsCommand(args, context, console) {
        const type = args[0];
        const parameters = args[1] ? JSON.parse(args[1]) : {};
        
        switch (type) {
            case 'memory':
                // メモリ不足エラーのシミュレーション
                const memoryError = new Error('Simulated memory exhaustion');
                memoryError.name = 'MemoryError';
                if (this.gameEngine.errorHandler) {
                    this.gameEngine.errorHandler.handleError(memoryError, { simulated: true, type: 'memory' });
                }
                return 'Simulated memory error';
                
            case 'network':
                // ネットワークエラーのシミュレーション
                const networkError = new Error(`Simulated network failure (delay: ${parameters.delay || 1000}ms)`);
                networkError.name = 'NetworkError';
                if (this.gameEngine.errorHandler) {
                    this.gameEngine.errorHandler.handleError(networkError, { simulated: true, type: 'network', ...parameters });
                }
                return `Simulated network error with ${parameters.delay || 1000}ms delay`;
                
            case 'render':
                // レンダリングエラーのシミュレーション
                const renderError = new Error('Simulated rendering corruption');
                renderError.name = 'RenderError';
                if (this.gameEngine.errorHandler) {
                    this.gameEngine.errorHandler.handleError(renderError, { simulated: true, type: 'render', ...parameters });
                }
                return 'Simulated rendering error';
                
            case 'logic':
                // ロジックエラーのシミュレーション
                const logicError = new Error('Simulated game logic error');
                logicError.name = 'LogicError';
                if (this.gameEngine.errorHandler) {
                    this.gameEngine.errorHandler.handleError(logicError, { simulated: true, type: 'logic', ...parameters });
                }
                return 'Simulated logic error';
                
            case 'crash':
                // クラッシュのシミュレーション（注意深く実装）
                console.warn('Simulating application crash (controlled)');
                setTimeout(() => {
                    throw new Error('Simulated application crash');
                }, 1000);
                return 'Simulated crash will occur in 1 second';
                
            default:
                throw new Error(`Unknown error type: ${type}. Available: memory, network, render, logic, crash`);
        }
    }

    async runStressTestCommand(args, context, console) {
        const component = args[0];
        const duration = parseInt(args[1]) || 30;
        const options = args[2] ? JSON.parse(args[2]) : {};
        
        console.output(`Starting ${duration}s stress test for ${component}...`, 'info');
        
        const startTime = Date.now();
        const testResults = {
            component,
            duration,
            startTime,
            metrics: []
        };
        
        // ストレステストの実行（簡略化実装）
        const testInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            
            if (elapsed >= duration) {
                clearInterval(testInterval);
                testResults.endTime = Date.now();
                this.generatedData.set('lastStressTest', testResults);
                console.output(`Stress test completed. Metrics collected: ${testResults.metrics.length}`, 'success');
                return;
            }
            
            // メトリクスの収集
            testResults.metrics.push({
                timestamp: Date.now(),
                elapsed,
                fps: Math.random() * 20 + 40, // シミュレートされたFPS
                memory: Math.random() * 50 + 50, // シミュレートされたメモリ使用量
                cpu: Math.random() * 30 + 30 // シミュレートされたCPU使用量
            });
            
        }, 1000);
        
        return `Started ${duration}s stress test for ${component}. Use 'test.list data' to check results.`;
    }

    async clearTestDataCommand(args, context, console) {
        const type = args[0] || 'all';
        
        if (type === 'all') {
            this.generatedData.clear();
            return 'Cleared all test data';
        } else if (this.generatedData.has(type)) {
            this.generatedData.delete(type);
            return `Cleared test data: ${type}`;
        } else {
            return `No test data found for: ${type}`;
        }
    }

    async listTestDataCommand(args, context, console) {
        const category = args[0] || 'all';
        
        let output = '';
        
        if (category === 'all' || category === 'generators') {
            output += 'Available Data Generators:\n';
            for (const [name] of this.mockDataGenerators) {
                output += `  - ${name}\n`;
            }
            output += '\n';
        }
        
        if (category === 'all' || category === 'scenarios') {
            output += 'Available Test Scenarios:\n';
            for (const [name, scenario] of this.testScenarios) {
                output += `  - ${name}: ${scenario.description}\n`;
            }
            output += '\n';
        }
        
        if (category === 'all' || category === 'data') {
            output += 'Generated Test Data:\n';
            if (this.generatedData.size === 0) {
                output += '  (no data generated yet)\n';
            } else {
                for (const [name, data] of this.generatedData) {
                    const dataType = Array.isArray(data) ? 'array' : typeof data;
                    const dataSize = Array.isArray(data) ? data.length : Object.keys(data).length;
                    output += `  - ${name}: ${dataType} (${dataSize} items)\n`;
                }
            }
        }
        
        return output.trim();
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.mockDataGenerators.clear();
        this.testScenarios.clear();
        this.generatedData.clear();
    }
}