import { BaseComponent } from '../BaseComponent.js';

/**
 * MockGameStateGenerator - ゲーム状態・パフォーマンス関連のモックデータ生成コンポーネント
 */
export class MockGameStateGenerator extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'MockGameStateGenerator');
        this.gameStates = [];
        this.scenarios = new Map();
        this.performanceProfiles = [];
    }

    async _doInitialize() {
        this.setupGameStates();
        this.setupScenarios();
        this.setupPerformanceProfiles();
    }

    setupGameStates() {
        this.gameStates = [
            'menu', 'playing', 'paused', 'game_over', 'level_complete',
            'loading', 'settings', 'achievements', 'leaderboard', 'tutorial'
        ];
    }

    setupScenarios() {
        this.scenarios.set('performance', {
            fps: [30, 60, 120],
            memoryUsage: [50, 200, 500], // MB
            cpuUsage: [10, 50, 90] // %
        });
        
        this.scenarios.set('stress', {
            bubbleCount: [500, 1000, 2000],
            particleCount: [1000, 5000, 10000],
            effectCount: [10, 50, 100]
        });
        
        this.scenarios.set('error', {
            types: ['memory', 'network', 'render', 'audio', 'input'],
            severity: ['low', 'medium', 'high', 'critical']
        });
    }

    setupPerformanceProfiles() {
        this.performanceProfiles = [
            { name: 'mobile_low', fps: 30, quality: 'low' },
            { name: 'mobile_high', fps: 60, quality: 'medium' },
            { name: 'desktop_low', fps: 60, quality: 'medium' },
            { name: 'desktop_high', fps: 120, quality: 'high' },
            { name: 'gaming_rig', fps: 144, quality: 'ultra' }
        ];
    }

    /**
     * ゲーム状態を生成
     * @param {Object} options - 生成オプション
     * @returns {Object} ゲーム状態データ
     */
    generateGameState(options = {}) {
        const state = options.state || this.mainController.randomChoice(this.gameStates);
        const baseData = {
            id: this.mainController.generateId(),
            state: state,
            timestamp: Date.now(),
            sessionId: this.mainController.generateId(),
            level: this.mainController.randomInt(1, 20),
            score: this.mainController.randomInt(0, 50000),
            lives: this.mainController.randomInt(0, 5),
            time: this.mainController.randomInt(0, 300000), // 5分まで
            combo: this.mainController.randomInt(0, 25),
            powerUps: this.generateActivePowerUps(),
            settings: this.generateGameSettings(),
            performance: this.generatePerformanceData()
        };

        // 状態固有のデータを追加
        return this.addStateSpecificData(baseData, state);
    }

    /**
     * アクティブなパワーアップを生成
     * @returns {Array} パワーアップリスト
     */
    generateActivePowerUps() {
        const powerUps = ['multi_shot', 'time_slow', 'bomb', 'freeze', 'magnet'];
        const activeCount = this.mainController.randomInt(0, 3);
        const active = [];
        
        for (let i = 0; i < activeCount; i++) {
            const powerUp = this.mainController.randomChoice(powerUps);
            if (!active.some(p => p.type === powerUp)) {
                active.push({
                    type: powerUp,
                    duration: this.mainController.randomInt(5000, 30000),
                    remaining: this.mainController.randomInt(1000, 25000)
                });
            }
        }
        
        return active;
    }

    /**
     * ゲーム設定を生成
     * @returns {Object} ゲーム設定
     */
    generateGameSettings() {
        return {
            difficulty: this.mainController.randomChoice(['easy', 'normal', 'hard', 'expert']),
            mode: this.mainController.randomChoice(['classic', 'time_attack', 'endless', 'puzzle']),
            theme: this.mainController.randomChoice(['default', 'dark', 'colorful', 'minimal']),
            particles: this.mainController.randomChoice(['off', 'low', 'medium', 'high']),
            quality: this.mainController.randomChoice(['low', 'medium', 'high', 'ultra'])
        };
    }

    /**
     * パフォーマンスデータを生成
     * @returns {Object} パフォーマンスデータ
     */
    generatePerformanceData() {
        const profile = this.mainController.randomChoice(this.performanceProfiles);
        
        return {
            fps: profile.fps + this.mainController.randomInt(-5, 5),
            frameTime: 1000 / profile.fps,
            memoryUsage: this.mainController.randomInt(50, 300),
            cpuUsage: this.mainController.randomFloat(10, 80),
            gpuUsage: this.mainController.randomFloat(20, 90),
            drawCalls: this.mainController.randomInt(100, 1000),
            triangles: this.mainController.randomInt(1000, 10000),
            textures: this.mainController.randomInt(10, 100),
            profile: profile.name
        };
    }

    /**
     * 状態固有のデータを追加
     * @param {Object} baseData - 基本データ
     * @param {string} state - 状態
     * @returns {Object} 完成したゲーム状態データ
     */
    addStateSpecificData(baseData, state) {
        switch (state) {
            case 'playing':
                baseData.bubbles = this.mainController.getComponent('MockBubbleDataGenerator')?.generateBubbles(10) || [];
                baseData.targetScore = this.mainController.randomInt(10000, 50000);
                baseData.timeLimit = this.mainController.randomInt(60000, 300000);
                break;
                
            case 'game_over':
                baseData.finalScore = baseData.score;
                baseData.reason = this.mainController.randomChoice(['time_up', 'no_moves', 'lives_depleted']);
                baseData.newRecord = Math.random() > 0.8;
                break;
                
            case 'level_complete':
                baseData.starsEarned = this.mainController.randomInt(1, 3);
                baseData.bonusScore = this.mainController.randomInt(0, 5000);
                baseData.perfectClear = Math.random() > 0.9;
                break;
                
            case 'loading':
                baseData.progress = this.mainController.randomFloat(0, 1);
                baseData.loadingAssets = this.generateLoadingAssets();
                break;
        }
        
        return baseData;
    }

    /**
     * ローディングアセットを生成
     * @returns {Array} アセットリスト
     */
    generateLoadingAssets() {
        const assets = ['textures', 'sounds', 'music', 'scripts', 'data'];
        return assets.map(asset => ({
            type: asset,
            loaded: this.mainController.randomInt(0, 100),
            total: 100
        }));
    }

    /**
     * パフォーマンスメトリクスを生成
     * @param {Object} options - 生成オプション
     * @returns {Object} メトリクスデータ
     */
    generatePerformanceMetrics(options = {}) {
        const duration = options.duration || 60000; // 1分間
        const interval = options.interval || 1000; // 1秒間隔
        const points = Math.floor(duration / interval);
        
        const metrics = {
            timestamp: Date.now(),
            duration: duration,
            interval: interval,
            fps: [],
            memory: [],
            cpu: [],
            gpu: [],
            events: []
        };
        
        // データポイントを生成
        for (let i = 0; i < points; i++) {
            const time = i * interval;
            metrics.fps.push({
                time: time,
                value: this.generateFPSValue(time, options)
            });
            
            metrics.memory.push({
                time: time,
                value: this.generateMemoryValue(time, options)
            });
            
            metrics.cpu.push({
                time: time,
                value: this.generateCPUValue(time, options)
            });
            
            metrics.gpu.push({
                time: time,
                value: this.generateGPUValue(time, options)
            });
            
            // ランダムイベント
            if (Math.random() > 0.95) {
                metrics.events.push({
                    time: time,
                    type: this.mainController.randomChoice(['gc', 'spike', 'drop', 'recovery']),
                    severity: this.mainController.randomChoice(['low', 'medium', 'high'])
                });
            }
        }
        
        return metrics;
    }

    /**
     * FPS値を生成
     * @param {number} time - 時間
     * @param {Object} options - オプション
     * @returns {number} FPS値
     */
    generateFPSValue(time, options) {
        const baseFPS = options.targetFPS || 60;
        const noise = this.mainController.randomFloat(-5, 5);
        const spike = Math.random() > 0.98 ? this.mainController.randomFloat(-20, -5) : 0;
        return Math.max(10, baseFPS + noise + spike);
    }

    /**
     * メモリ使用量を生成
     * @param {number} time - 時間
     * @param {Object} options - オプション
     * @returns {number} メモリ使用量（MB）
     */
    generateMemoryValue(time, options) {
        const baseMemory = options.baseMemory || 100;
        const growth = time * 0.001; // 徐々に増加
        const gc = Math.random() > 0.99 ? -30 : 0; // ガベージコレクション
        return Math.max(50, baseMemory + growth + gc);
    }

    /**
     * CPU使用率を生成
     * @param {number} time - 時間
     * @param {Object} options - オプション
     * @returns {number} CPU使用率（%）
     */
    generateCPUValue(time, options) {
        const baseCPU = options.baseCPU || 30;
        const activity = Math.sin(time * 0.001) * 20; // 周期的変動
        const noise = this.mainController.randomFloat(-5, 10);
        return Math.max(5, Math.min(95, baseCPU + activity + noise));
    }

    /**
     * GPU使用率を生成
     * @param {number} time - 時間
     * @param {Object} options - オプション
     * @returns {number} GPU使用率（%）
     */
    generateGPUValue(time, options) {
        const baseGPU = options.baseGPU || 40;
        const load = Math.cos(time * 0.0015) * 25; // レンダリング負荷変動
        const noise = this.mainController.randomFloat(-3, 8);
        return Math.max(10, Math.min(90, baseGPU + load + noise));
    }

    /**
     * 大量のゲーム状態を生成
     * @param {number} count - 生成数
     * @param {Object} options - オプション
     * @returns {Array} ゲーム状態配列
     */
    generateMassGameStates(count = 100, options = {}) {
        const states = [];
        for (let i = 0; i < count; i++) {
            states.push(this.generateGameState(options));
        }
        return states;
    }

    /**
     * ストレステスト用データを生成
     * @param {Object} options - オプション
     * @returns {Object} ストレステストデータ
     */
    generateStressTestData(options = {}) {
        const scenario = this.scenarios.get('stress');
        return {
            bubbleCount: this.mainController.randomChoice(scenario.bubbleCount),
            particleCount: this.mainController.randomChoice(scenario.particleCount),
            effectCount: this.mainController.randomChoice(scenario.effectCount),
            duration: options.duration || 30000,
            profile: this.mainController.randomChoice(this.performanceProfiles)
        };
    }

    /**
     * エラーシナリオを生成
     * @returns {Object} エラーシナリオ
     */
    generateErrorScenario() {
        const scenario = this.scenarios.get('error');
        const errorType = this.mainController.randomChoice(scenario.types);
        
        return {
            type: errorType,
            severity: this.mainController.randomChoice(scenario.severity),
            message: this.generateErrorMessage(errorType),
            timestamp: Date.now(),
            context: this.generateErrorContext(errorType),
            recoverable: Math.random() > 0.3
        };
    }

    /**
     * エラーメッセージを生成
     * @param {string} type - エラータイプ
     * @returns {string} エラーメッセージ
     */
    generateErrorMessage(type) {
        const messages = {
            'memory': 'Out of memory',
            'network': 'Network connection failed',
            'render': 'Rendering error occurred',
            'audio': 'Audio system failure',
            'input': 'Input device not responding'
        };
        return messages[type] || 'Unknown error';
    }

    /**
     * エラーコンテキストを生成
     * @param {string} type - エラータイプ
     * @returns {Object} エラーコンテキスト
     */
    generateErrorContext(type) {
        return {
            gameState: this.mainController.randomChoice(this.gameStates),
            level: this.mainController.randomInt(1, 20),
            timestamp: Date.now(),
            userAgent: 'Mock Browser',
            performance: this.generatePerformanceData()
        };
    }

    /**
     * パフォーマンスシナリオを生成
     * @returns {Object} パフォーマンスシナリオ
     */
    generatePerformanceScenario() {
        const profile = this.mainController.randomChoice(this.performanceProfiles);
        const scenario = this.scenarios.get('performance');
        
        return {
            name: `Performance Test - ${profile.name}`,
            profile: profile,
            targetFPS: profile.fps,
            duration: this.mainController.randomInt(30000, 300000),
            expectedMemory: this.mainController.randomChoice(scenario.memoryUsage),
            expectedCPU: this.mainController.randomChoice(scenario.cpuUsage),
            settings: {
                quality: profile.quality,
                particles: profile.quality === 'low' ? 'off' : 'high',
                effects: profile.quality !== 'low'
            }
        };
    }

    /**
     * エッジケースシナリオを生成
     * @returns {Object} エッジケースシナリオ
     */
    generateEdgeCaseScenario() {
        const scenarios = [
            'maximum_bubbles',
            'minimum_memory',
            'network_timeout',
            'rapid_input',
            'resolution_change',
            'focus_loss',
            'battery_low',
            'thermal_throttling'
        ];
        
        const scenario = this.mainController.randomChoice(scenarios);
        
        return {
            type: scenario,
            description: this.getEdgeCaseDescription(scenario),
            parameters: this.getEdgeCaseParameters(scenario),
            expectedBehavior: this.getExpectedBehavior(scenario)
        };
    }

    /**
     * エッジケース説明を取得
     * @param {string} scenario - シナリオタイプ
     * @returns {string} 説明
     */
    getEdgeCaseDescription(scenario) {
        const descriptions = {
            'maximum_bubbles': 'Test with maximum number of bubbles on screen',
            'minimum_memory': 'Test under low memory conditions',
            'network_timeout': 'Test network timeout handling'
        };
        return descriptions[scenario] || 'Edge case test scenario';
    }

    /**
     * エッジケースパラメータを取得
     * @param {string} scenario - シナリオタイプ
     * @returns {Object} パラメータ
     */
    getEdgeCaseParameters(scenario) {
        const params = {
            'maximum_bubbles': { count: 2000, types: 18 },
            'minimum_memory': { limit: 50, cleanup: true },
            'network_timeout': { timeout: 1000, retries: 3 }
        };
        return params[scenario] || {};
    }

    /**
     * 期待される動作を取得
     * @param {string} scenario - シナリオタイプ
     * @returns {string} 期待される動作
     */
    getExpectedBehavior(scenario) {
        const behaviors = {
            'maximum_bubbles': 'Performance should degrade gracefully',
            'minimum_memory': 'System should free resources automatically',
            'network_timeout': 'Should fallback to offline mode'
        };
        return behaviors[scenario] || 'System should handle gracefully';
    }
}