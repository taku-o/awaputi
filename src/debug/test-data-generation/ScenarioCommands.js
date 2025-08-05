import { BaseComponent } from '../BaseComponent.js';

/**
 * ScenarioCommands - シナリオベースコマンド処理コンポーネント
 */
export class ScenarioCommands extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'ScenarioCommands');
        this.performanceScenarios = new Map();
        this.configTemplates = new Map();
        this.errorSimulators = new Map();
        this.stressTestRunners = new Map();
        this.activeStressTests = new Map();
    }

    async _doInitialize() {
        this.setupPerformanceScenarios();
        this.setupConfigTemplates();
        this.setupErrorSimulators();
        this.setupStressTestRunners();
    }

    /**
     * パフォーマンスシナリオを設定
     */
    setupPerformanceScenarios() {
        this.performanceScenarios.set('memory', {
            description: 'Memory performance testing scenario',
            generator: (intensity = 'medium') => {
                const multipliers = { low: 0.5, medium: 1.0, high: 1.5, extreme: 2.0 };
                const multiplier = multipliers[intensity] || 1.0;
                
                return {
                    allocateObjects: Math.floor(1000 * multiplier),
                    objectSize: Math.floor(1024 * multiplier),
                    retainObjects: Math.floor(100 * multiplier),
                    scenario: 'memory',
                    intensity
                };
            }
        });

        this.performanceScenarios.set('cpu', {
            description: 'CPU performance testing scenario',
            generator: (intensity = 'medium') => {
                const multipliers = { low: 0.5, medium: 1.0, high: 1.5, extreme: 2.0 };
                const multiplier = multipliers[intensity] || 1.0;
                
                return {
                    computationCycles: Math.floor(100000 * multiplier),
                    parallelTasks: Math.floor(10 * multiplier),
                    complexCalculations: true,
                    scenario: 'cpu',
                    intensity
                };
            }
        });

        this.performanceScenarios.set('rendering', {
            description: 'Rendering performance testing scenario',
            generator: (intensity = 'medium') => {
                const multipliers = { low: 0.5, medium: 1.0, high: 1.5, extreme: 2.0 };
                const multiplier = multipliers[intensity] || 1.0;
                
                return {
                    drawCalls: Math.floor(1000 * multiplier),
                    particleCount: Math.floor(5000 * multiplier),
                    effectLayers: Math.floor(20 * multiplier),
                    scenario: 'rendering',
                    intensity
                };
            }
        });

        this.performanceScenarios.set('particles', {
            description: 'Particle system performance testing scenario',
            generator: (intensity = 'medium') => {
                const multipliers = { low: 0.5, medium: 1.0, high: 1.5, extreme: 2.0 };
                const multiplier = multipliers[intensity] || 1.0;
                
                return {
                    particleCount: Math.floor(10000 * multiplier),
                    emitterCount: Math.floor(50 * multiplier),
                    complexity: intensity,
                    scenario: 'particles',
                    intensity
                };
            }
        });
    }

    /**
     * 設定テンプレートを設定
     */
    setupConfigTemplates() {
        this.configTemplates.set('game', {
            description: 'Game configuration templates',
            templates: {
                default: { canvas: { width: 800, height: 600 }, fps: 60 },
                minimal: { canvas: { width: 400, height: 300 }, fps: 30 },
                maximal: { canvas: { width: 1920, height: 1080 }, fps: 120 },
                broken: { canvas: { width: -100, height: 0 }, fps: -1 }
            }
        });

        this.configTemplates.set('audio', {
            description: 'Audio configuration templates',
            templates: {
                default: { masterVolume: 0.7, sfxVolume: 0.8, musicVolume: 0.6 },
                minimal: { masterVolume: 0.1, sfxVolume: 0.1, musicVolume: 0.1 },
                maximal: { masterVolume: 1.0, sfxVolume: 1.0, musicVolume: 1.0 },
                broken: { masterVolume: 2.0, sfxVolume: -0.5, musicVolume: 'invalid' }
            }
        });

        this.configTemplates.set('effects', {
            description: 'Effects configuration templates',
            templates: {
                default: { particleCount: 100, quality: 'medium' },
                minimal: { particleCount: 10, quality: 'low' },
                maximal: { particleCount: 1000, quality: 'ultra' },
                broken: { particleCount: -50, quality: 'invalid' }
            }
        });

        this.configTemplates.set('performance', {
            description: 'Performance configuration templates',
            templates: {
                default: { targetFPS: 60, memoryLimit: 100 },
                minimal: { targetFPS: 30, memoryLimit: 50 },
                maximal: { targetFPS: 120, memoryLimit: 500 },
                broken: { targetFPS: 0, memoryLimit: -100 }
            }
        });
    }

    /**
     * エラーシミュレーターを設定
     */
    setupErrorSimulators() {
        this.errorSimulators.set('memory', {
            description: 'Memory error simulation',
            simulator: (parameters = {}) => {
                const error = new Error('Simulated memory exhaustion');
                error.name = 'MemoryError';
                return { error, type: 'memory', parameters };
            }
        });

        this.errorSimulators.set('network', {
            description: 'Network error simulation',
            simulator: (parameters = {}) => {
                const delay = parameters.delay || 1000;
                const error = new Error(`Simulated network failure (delay: ${delay}ms)`);
                error.name = 'NetworkError';
                return { error, type: 'network', parameters: { ...parameters, delay } };
            }
        });

        this.errorSimulators.set('render', {
            description: 'Rendering error simulation',
            simulator: (parameters = {}) => {
                const error = new Error('Simulated rendering corruption');
                error.name = 'RenderError';
                return { error, type: 'render', parameters };
            }
        });

        this.errorSimulators.set('logic', {
            description: 'Logic error simulation',
            simulator: (parameters = {}) => {
                const error = new Error('Simulated game logic error');
                error.name = 'LogicError';
                return { error, type: 'logic', parameters };
            }
        });

        this.errorSimulators.set('crash', {
            description: 'Crash simulation',
            simulator: (parameters = {}) => {
                const error = new Error('Simulated application crash');
                error.name = 'CrashError';
                return { error, type: 'crash', parameters, delayed: true };
            }
        });
    }

    /**
     * ストレステストランナーを設定
     */
    setupStressTestRunners() {
        this.stressTestRunners.set('bubbles', {
            description: 'Bubble system stress test',
            runner: (duration, options) => this.runBubbleStressTest(duration, options)
        });

        this.stressTestRunners.set('rendering', {
            description: 'Rendering system stress test',
            runner: (duration, options) => this.runRenderingStressTest(duration, options)
        });

        this.stressTestRunners.set('audio', {
            description: 'Audio system stress test',
            runner: (duration, options) => this.runAudioStressTest(duration, options)
        });

        this.stressTestRunners.set('memory', {
            description: 'Memory system stress test',
            runner: (duration, options) => this.runMemoryStressTest(duration, options)
        });

        this.stressTestRunners.set('all', {
            description: 'All systems stress test',
            runner: (duration, options) => this.runAllSystemsStressTest(duration, options)
        });
    }

    /**
     * パフォーマンステストコマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processPerformanceTestCommand(args, context, console) {
        try {
            const scenario = args[0];
            const intensity = args[1] || 'medium';

            if (!scenario) {
                throw new Error('Scenario is required');
            }

            const scenarioConfig = this.performanceScenarios.get(scenario);
            if (!scenarioConfig) {
                throw new Error(`Unknown performance scenario: ${scenario}. Available: ${Array.from(this.performanceScenarios.keys()).join(', ')}`);
            }

            const testConfig = scenarioConfig.generator(intensity);
            
            // データを記録
            const data = this.mainController.generatedData || new Map();
            data.set('lastPerformanceTest', testConfig);

            return `Generated ${scenario} performance test (${intensity}): ${JSON.stringify(testConfig)}`;

        } catch (error) {
            this._handleError('performance test command processing', error);
            return `Error generating performance test: ${error.message}`;
        }
    }

    /**
     * 設定テストコマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processConfigTestCommand(args, context, console) {
        try {
            const type = args[0];
            const scenario = args[1] || 'default';

            if (!type) {
                throw new Error('Config type is required');
            }

            const configTemplate = this.configTemplates.get(type);
            if (!configTemplate) {
                throw new Error(`Unknown config type: ${type}. Available: ${Array.from(this.configTemplates.keys()).join(', ')}`);
            }

            if (!configTemplate.templates[scenario]) {
                throw new Error(`Unknown scenario: ${scenario}. Available: ${Object.keys(configTemplate.templates).join(', ')}`);
            }

            const config = configTemplate.templates[scenario];
            
            // データを記録
            const data = this.mainController.generatedData || new Map();
            data.set('lastConfig', { type, scenario, config });

            return `Generated ${type} config (${scenario}): ${JSON.stringify(config)}`;

        } catch (error) {
            this._handleError('config test command processing', error);
            return `Error generating config test: ${error.message}`;
        }
    }

    /**
     * エラーシミュレーションコマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processErrorSimulationCommand(args, context, console) {
        try {
            const type = args[0];
            const parameters = args[1] ? JSON.parse(args[1]) : {};

            if (!type) {
                throw new Error('Error type is required');
            }

            const simulator = this.errorSimulators.get(type);
            if (!simulator) {
                throw new Error(`Unknown error type: ${type}. Available: ${Array.from(this.errorSimulators.keys()).join(', ')}`);
            }

            const { error, parameters: errorParams, delayed } = simulator.simulator(parameters);

            // エラーハンドラーに報告
            const gameEngine = this.mainController.gameEngine;
            if (gameEngine && gameEngine.errorHandler) {
                if (delayed && type === 'crash') {
                    console.warn('Simulating application crash (controlled)');
                    setTimeout(() => {
                        gameEngine.errorHandler.handleError(error, { simulated: true, type, ...errorParams });
                    }, 1000);
                    return 'Simulated crash will occur in 1 second';
                } else {
                    gameEngine.errorHandler.handleError(error, { simulated: true, type, ...errorParams });
                }
            }

            return `Simulated ${type} error${errorParams.delay ? ` with ${errorParams.delay}ms delay` : ''}`;

        } catch (error) {
            this._handleError('error simulation command processing', error);
            return `Error simulating error: ${error.message}`;
        }
    }

    /**
     * ストレステストコマンドを処理
     * @param {Array} args - コマンド引数
     * @param {Object} context - 実行コンテキスト
     * @param {Object} console - コンソールオブジェクト
     * @returns {Promise<string>} 実行結果
     */
    async processStressTestCommand(args, context, console) {
        try {
            const component = args[0];
            const duration = parseInt(args[1]) || 30;
            const options = args[2] ? JSON.parse(args[2]) : {};

            if (!component) {
                throw new Error('Component is required');
            }

            const runner = this.stressTestRunners.get(component);
            if (!runner) {
                throw new Error(`Unknown component: ${component}. Available: ${Array.from(this.stressTestRunners.keys()).join(', ')}`);
            }

            console.output(`Starting ${duration}s stress test for ${component}...`, 'info');

            // ストレステストを開始
            const testId = `stress-test-${Date.now()}`;
            const testPromise = runner.runner(duration, options);
            this.activeStressTests.set(testId, testPromise);

            // 非同期でテスト実行
            testPromise.then((results) => {
                this.activeStressTests.delete(testId);
                const data = this.mainController.generatedData || new Map();
                data.set('lastStressTest', results);
                console.output(`Stress test completed. Metrics collected: ${results.metrics.length}`, 'success');
            }).catch((error) => {
                this.activeStressTests.delete(testId);
                console.output(`Stress test failed: ${error.message}`, 'error');
            });

            return `Started ${duration}s stress test for ${component}. Use 'test.list data' to check results.`;

        } catch (error) {
            this._handleError('stress test command processing', error);
            return `Error running stress test: ${error.message}`;
        }
    }

    /**
     * バブルシステムストレステストを実行
     * @param {number} duration - テスト期間（秒）
     * @param {Object} options - オプション
     * @returns {Promise<Object>} テスト結果
     */
    async runBubbleStressTest(duration, options = {}) {
        return this.runGenericStressTest('bubbles', duration, options);
    }

    /**
     * レンダリングシステムストレステストを実行
     * @param {number} duration - テスト期間（秒）
     * @param {Object} options - オプション
     * @returns {Promise<Object>} テスト結果
     */
    async runRenderingStressTest(duration, options = {}) {
        return this.runGenericStressTest('rendering', duration, options);
    }

    /**
     * オーディオシステムストレステストを実行
     * @param {number} duration - テスト期間（秒）
     * @param {Object} options - オプション
     * @returns {Promise<Object>} テスト結果
     */
    async runAudioStressTest(duration, options = {}) {
        return this.runGenericStressTest('audio', duration, options);
    }

    /**
     * メモリシステムストレステストを実行
     * @param {number} duration - テスト期間（秒）
     * @param {Object} options - オプション
     * @returns {Promise<Object>} テスト結果
     */
    async runMemoryStressTest(duration, options = {}) {
        return this.runGenericStressTest('memory', duration, { ...options, leakTest: true });
    }

    /**
     * 全システムストレステストを実行
     * @param {number} duration - テスト期間（秒）
     * @param {Object} options - オプション
     * @returns {Promise<Object>} テスト結果
     */
    async runAllSystemsStressTest(duration, options = {}) {
        return this.runGenericStressTest('all', duration, { ...options, intensity: 'high' });
    }

    /**
     * 汎用ストレステストを実行
     * @param {string} component - コンポーネント名
     * @param {number} duration - テスト期間（秒）
     * @param {Object} options - オプション
     * @returns {Promise<Object>} テスト結果
     */
    async runGenericStressTest(component, duration, options = {}) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const testResults = {
                component,
                duration,
                startTime,
                options,
                metrics: []
            };

            const testInterval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;

                if (elapsed >= duration) {
                    clearInterval(testInterval);
                    testResults.endTime = Date.now();
                    resolve(testResults);
                    return;
                }

                // メトリクスを収集（シミュレーション）
                testResults.metrics.push({
                    timestamp: Date.now(),
                    elapsed,
                    fps: Math.random() * 20 + 40, // 40-60 FPS
                    memory: Math.random() * 50 + 50, // 50-100 MB
                    cpu: Math.random() * 30 + 30 // 30-60% CPU
                });

            }, 1000);
        });
    }

    /**
     * シナリオコマンドの登録情報を取得
     * @returns {Array} コマンド登録情報配列
     */
    getScenarioCommandRegistrations() {
        return [
            {
                command: 'test.performance',
                handler: this.processPerformanceTestCommand.bind(this),
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
            },
            {
                command: 'test.config',
                handler: this.processConfigTestCommand.bind(this),
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
            },
            {
                command: 'test.errors',
                handler: this.processErrorSimulationCommand.bind(this),
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
            },
            {
                command: 'test.stress',
                handler: this.processStressTestCommand.bind(this),
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
            }
        ];
    }

    /**
     * アクティブストレステスト数を取得
     * @returns {number} アクティブテスト数
     */
    getActiveStressTestCount() {
        return this.activeStressTests.size;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        // アクティブなストレステストを停止
        for (const [testId] of this.activeStressTests) {
            this.activeStressTests.delete(testId);
        }

        this.performanceScenarios.clear();
        this.configTemplates.clear();
        this.errorSimulators.clear();
        this.stressTestRunners.clear();
        this.activeStressTests.clear();
        super.cleanup();
    }
}