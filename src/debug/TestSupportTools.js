/**
 * Test Support Tools
 * テスト実行と支援機能を提供する包括的システム
 */

export class TestSupportTools {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.testRunner = new TestRunner(gameEngine);
        this.mockDataGenerator = new MockDataGenerator(gameEngine);
        this.benchmarkSuite = new BenchmarkSuite(gameEngine);
        this.testResults = new Map();
        this.isRunning = false;
        
        this.initialize();
    }

    initialize() {
        this.setupTestEnvironment();
        this.registerDefaultTests();
    }

    setupTestEnvironment() {
        // テスト環境の初期化
        this.testEnvironment = {
            mockData: new Map(),
            testStates: new Map(),
            benchmarkResults: new Map(),
            testHistory: []
        };
    }

    registerDefaultTests() {
        // デフォルトテストスイートの登録
        this.testRunner.registerSuite('core', this.createCoreTestSuite());
        this.testRunner.registerSuite('performance', this.createPerformanceTestSuite());
        this.testRunner.registerSuite('integration', this.createIntegrationTestSuite());
    }

    // テスト実行メソッド
    async runTests(suiteNames = null) {
        if (this.isRunning) {
            throw new Error('Tests are already running');
        }

        this.isRunning = true;
        const startTime = performance.now();
        
        try {
            const suitesToRun = suiteNames || this.testRunner.getAllSuiteNames();
            const results = await this.testRunner.runSuites(suitesToRun);
            
            const executionTime = performance.now() - startTime;
            const testSession = {
                timestamp: Date.now(),
                suites: suitesToRun,
                results: results,
                executionTime: executionTime,
                success: results.failed === 0
            };

            this.testEnvironment.testHistory.push(testSession);
            return testSession;
            
        } finally {
            this.isRunning = false;
        }
    }

    async runBenchmarks(benchmarkNames = null) {
        if (this.isRunning) {
            throw new Error('Benchmarks are already running');
        }

        this.isRunning = true;
        
        try {
            const results = await this.benchmarkSuite.runBenchmarks(benchmarkNames);
            this.testEnvironment.benchmarkResults.set(Date.now(), results);
            return results;
        } finally {
            this.isRunning = false;
        }
    }

    // モックデータ生成
    generateTestData(type, count = 1, options = {}) {
        return this.mockDataGenerator.generate(type, count, options);
    }

    generateMockGameState(options = {}) {
        return this.mockDataGenerator.generateGameState(options);
    }

    generateMockBubbles(count = 10, types = null) {
        return this.mockDataGenerator.generateBubbles(count, types);
    }

    // 結果分析
    analyzeTestResults(results = null) {
        const targetResults = results || this.getLatestTestResults();
        if (!targetResults) {
            return null;
        }

        const analysis = {
            summary: this.createTestSummary(targetResults),
            performance: this.analyzePerformanceMetrics(targetResults),
            trends: this.analyzeTestTrends(),
            recommendations: this.generateRecommendations(targetResults)
        };

        return analysis;
    }

    createTestSummary(results) {
        return {
            totalTests: results.passed + results.failed + results.skipped,
            passed: results.passed,
            failed: results.failed,
            skipped: results.skipped,
            successRate: results.passed / (results.passed + results.failed),
            executionTime: results.executionTime
        };
    }

    analyzePerformanceMetrics(results) {
        const performanceTests = results.results.filter(r => r.category === 'performance');
        
        return {
            averageExecutionTime: performanceTests.reduce((sum, test) => sum + test.executionTime, 0) / performanceTests.length,
            slowestTest: performanceTests.reduce((slowest, test) => 
                test.executionTime > slowest.executionTime ? test : slowest, performanceTests[0]),
            fastestTest: performanceTests.reduce((fastest, test) => 
                test.executionTime < fastest.executionTime ? test : fastest, performanceTests[0])
        };
    }

    analyzeTestTrends() {
        const recentSessions = this.testEnvironment.testHistory.slice(-10);
        if (recentSessions.length < 2) {
            return null;
        }

        const successRates = recentSessions.map(session => 
            session.results.passed / (session.results.passed + session.results.failed));
        
        const executionTimes = recentSessions.map(session => session.executionTime);

        return {
            successRateTrend: this.calculateTrend(successRates),
            executionTimeTrend: this.calculateTrend(executionTimes),
            recentAverage: successRates.slice(-5).reduce((sum, rate) => sum + rate, 0) / 5
        };
    }

    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-3);
        const older = values.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (change > 0.05) return 'improving';
        if (change < -0.05) return 'declining';
        return 'stable';
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        if (results.failed > 0) {
            recommendations.push({
                type: 'error',
                message: `${results.failed} tests failed. Review failing tests and fix issues.`,
                priority: 'high'
            });
        }

        if (results.executionTime > 30000) { // 30秒以上
            recommendations.push({
                type: 'performance',
                message: 'Test execution time is high. Consider optimizing slow tests.',
                priority: 'medium'
            });
        }

        const successRate = results.passed / (results.passed + results.failed);
        if (successRate < 0.9) {
            recommendations.push({
                type: 'quality',
                message: 'Test success rate is below 90%. Improve test reliability.',
                priority: 'high'
            });
        }

        return recommendations;
    }

    // ユーティリティメソッド
    getLatestTestResults() {
        return this.testEnvironment.testHistory[this.testEnvironment.testHistory.length - 1]?.results;
    }

    getTestHistory(limit = 10) {
        return this.testEnvironment.testHistory.slice(-limit);
    }

    clearTestHistory() {
        this.testEnvironment.testHistory = [];
    }

    // デフォルトテストスイート作成
    createCoreTestSuite() {
        return {
            name: 'Core Tests',
            tests: [
                {
                    name: 'GameEngine Initialization',
                    test: () => this.testGameEngineInitialization(),
                    category: 'core'
                },
                {
                    name: 'BubbleManager Functionality',
                    test: () => this.testBubbleManager(),
                    category: 'core'
                },
                {
                    name: 'ScoreManager Calculation',
                    test: () => this.testScoreManager(),
                    category: 'core'
                }
            ]
        };
    }

    createPerformanceTestSuite() {
        return {
            name: 'Performance Tests',
            tests: [
                {
                    name: 'Rendering Performance',
                    test: () => this.testRenderingPerformance(),
                    category: 'performance'
                },
                {
                    name: 'Memory Usage',
                    test: () => this.testMemoryUsage(),
                    category: 'performance'
                },
                {
                    name: 'FPS Stability',
                    test: () => this.testFPSStability(),
                    category: 'performance'
                }
            ]
        };
    }

    createIntegrationTestSuite() {
        return {
            name: 'Integration Tests',
            tests: [
                {
                    name: 'Scene Transitions',
                    test: () => this.testSceneTransitions(),
                    category: 'integration'
                },
                {
                    name: 'Input Handling',
                    test: () => this.testInputHandling(),
                    category: 'integration'
                },
                {
                    name: 'Data Persistence',
                    test: () => this.testDataPersistence(),
                    category: 'integration'
                }
            ]
        };
    }

    // 個別テストメソッド
    async testGameEngineInitialization() {
        const engine = this.gameEngine;
        
        if (!engine) {
            throw new Error('GameEngine is not available');
        }

        if (!engine.canvas) {
            throw new Error('Canvas is not initialized');
        }

        if (!engine.sceneManager) {
            throw new Error('SceneManager is not initialized');
        }

        return { success: true, message: 'GameEngine initialized successfully' };
    }

    async testBubbleManager() {
        const bubbleManager = this.gameEngine?.bubbleManager;
        
        if (!bubbleManager) {
            throw new Error('BubbleManager is not available');
        }

        // モックバブルでテスト
        const initialCount = bubbleManager.getBubbleCount();
        const mockBubbles = this.generateMockBubbles(5);
        
        // バブル追加のテスト
        mockBubbles.forEach(bubble => bubbleManager.addBubble(bubble));
        
        const newCount = bubbleManager.getBubbleCount();
        if (newCount !== initialCount + 5) {
            throw new Error(`Expected ${initialCount + 5} bubbles, got ${newCount}`);
        }

        // クリーンアップ
        bubbleManager.clearBubbles();

        return { success: true, message: 'BubbleManager functionality verified' };
    }

    async testScoreManager() {
        const scoreManager = this.gameEngine?.scoreManager;
        
        if (!scoreManager) {
            throw new Error('ScoreManager is not available');
        }

        const initialScore = scoreManager.getScore();
        scoreManager.addScore(100);
        
        const newScore = scoreManager.getScore();
        if (newScore !== initialScore + 100) {
            throw new Error(`Expected score ${initialScore + 100}, got ${newScore}`);
        }

        return { success: true, message: 'ScoreManager calculation verified' };
    }

    async testRenderingPerformance() {
        const startTime = performance.now();
        let frameCount = 0;
        
        // 60フレーム分の描画をシミュレート
        for (let i = 0; i < 60; i++) {
            if (this.gameEngine?.render) {
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        this.gameEngine.render();
                        frameCount++;
                        resolve();
                    });
                });
            }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const fps = (frameCount / duration) * 1000;
        
        if (fps < 30) {
            throw new Error(`FPS too low: ${fps.toFixed(1)}`);
        }

        return { 
            success: true, 
            message: `Rendering performance: ${fps.toFixed(1)} FPS`,
            metrics: { fps, duration, frameCount }
        };
    }

    async testMemoryUsage() {
        if (!performance.memory) {
            throw new Error('Memory API not available');
        }

        const beforeMemory = performance.memory.usedJSHeapSize;
        
        // メモリを使用する操作をシミュレート
        const mockData = this.generateTestData('largeBubbleSet', 1000);
        
        const afterMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = afterMemory - beforeMemory;
        
        // クリーンアップ
        mockData.length = 0;
        
        return {
            success: true,
            message: `Memory usage test completed`,
            metrics: { 
                before: beforeMemory,
                after: afterMemory,
                increase: memoryIncrease
            }
        };
    }

    async testFPSStability() {
        const measurements = [];
        const measurementDuration = 2000; // 2秒
        const startTime = performance.now();
        
        while (performance.now() - startTime < measurementDuration) {
            const frameStart = performance.now();
            
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    const frameEnd = performance.now();
                    const frameTime = frameEnd - frameStart;
                    measurements.push(1000 / frameTime); // FPS
                    resolve();
                });
            });
        }
        
        const avgFPS = measurements.reduce((sum, fps) => sum + fps, 0) / measurements.length;
        const variance = measurements.reduce((sum, fps) => sum + Math.pow(fps - avgFPS, 2), 0) / measurements.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev > 10) {
            throw new Error(`FPS unstable: standard deviation ${stdDev.toFixed(1)}`);
        }

        return {
            success: true,
            message: `FPS stability: ${avgFPS.toFixed(1)} ± ${stdDev.toFixed(1)}`,
            metrics: { avgFPS, stdDev, measurements: measurements.length }
        };
    }

    async testSceneTransitions() {
        const sceneManager = this.gameEngine?.sceneManager;
        
        if (!sceneManager) {
            throw new Error('SceneManager is not available');
        }

        const currentScene = sceneManager.getCurrentScene();
        const availableScenes = sceneManager.getAvailableScenes();
        
        if (availableScenes.length < 2) {
            throw new Error('Not enough scenes available for transition test');
        }

        // 別のシーンに遷移
        const targetScene = availableScenes.find(scene => scene !== currentScene);
        await sceneManager.transitionTo(targetScene);
        
        if (sceneManager.getCurrentScene() !== targetScene) {
            throw new Error('Scene transition failed');
        }

        // 元のシーンに戻す
        await sceneManager.transitionTo(currentScene);

        return { success: true, message: 'Scene transitions working correctly' };
    }

    async testInputHandling() {
        const inputManager = this.gameEngine?.inputManager;
        
        if (!inputManager) {
            throw new Error('InputManager is not available');
        }

        // モックイベントでテスト
        const mockEvent = {
            type: 'click',
            clientX: 100,
            clientY: 100,
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        let eventHandled = false;
        inputManager.addEventListener('click', () => {
            eventHandled = true;
        });

        inputManager.handleEvent(mockEvent);
        
        if (!eventHandled) {
            throw new Error('Input event was not handled');
        }

        return { success: true, message: 'Input handling verified' };
    }

    async testDataPersistence() {
        const playerData = this.gameEngine?.playerData;
        
        if (!playerData) {
            throw new Error('PlayerData is not available');
        }

        const testKey = 'test_data_' + Date.now();
        const testValue = { test: true, timestamp: Date.now() };
        
        // データ保存
        playerData.setData(testKey, testValue);
        
        // データ読み込み
        const retrievedValue = playerData.getData(testKey);
        
        if (!retrievedValue || retrievedValue.test !== testValue.test) {
            throw new Error('Data persistence failed');
        }

        // クリーンアップ
        playerData.removeData(testKey);

        return { success: true, message: 'Data persistence verified' };
    }

    destroy() {
        this.isRunning = false;
        this.testRunner?.destroy();
        this.mockDataGenerator?.destroy();
        this.benchmarkSuite?.destroy();
        this.testEnvironment = null;
    }
}

/**
 * Test Runner
 * テスト実行エンジン
 */
class TestRunner {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.testSuites = new Map();
        this.currentExecution = null;
    }

    registerSuite(name, suite) {
        this.testSuites.set(name, suite);
    }

    getAllSuiteNames() {
        return Array.from(this.testSuites.keys());
    }

    async runSuites(suiteNames) {
        const results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            results: [],
            executionTime: 0
        };

        const startTime = performance.now();

        for (const suiteName of suiteNames) {
            const suite = this.testSuites.get(suiteName);
            if (!suite) {
                results.skipped++;
                continue;
            }

            const suiteResults = await this.runSuite(suite);
            results.passed += suiteResults.passed;
            results.failed += suiteResults.failed;
            results.skipped += suiteResults.skipped;
            results.results.push(...suiteResults.results);
        }

        results.executionTime = performance.now() - startTime;
        return results;
    }

    async runSuite(suite) {
        const results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            results: []
        };

        for (const test of suite.tests) {
            const testResult = await this.runTest(test);
            results.results.push(testResult);
            
            if (testResult.passed) {
                results.passed++;
            } else if (testResult.failed) {
                results.failed++;
            } else {
                results.skipped++;
            }
        }

        return results;
    }

    async runTest(test) {
        const testResult = {
            name: test.name,
            category: test.category,
            passed: false,
            failed: false,
            skipped: false,
            error: null,
            executionTime: 0,
            metrics: {}
        };

        const startTime = performance.now();

        try {
            const result = await test.test();
            testResult.passed = true;
            testResult.metrics = result.metrics || {};
        } catch (error) {
            testResult.failed = true;
            testResult.error = {
                message: error.message,
                stack: error.stack
            };
        }

        testResult.executionTime = performance.now() - startTime;
        return testResult;
    }

    destroy() {
        this.testSuites.clear();
        this.currentExecution = null;
    }
}

/**
 * Mock Data Generator
 * テスト用モックデータ生成システム
 */
class MockDataGenerator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.generators = new Map();
        this.setupGenerators();
    }

    setupGenerators() {
        this.generators.set('bubble', this.generateBubble.bind(this));
        this.generators.set('bubbles', this.generateBubbles.bind(this));
        this.generators.set('gameState', this.generateGameState.bind(this));
        this.generators.set('playerData', this.generatePlayerData.bind(this));
        this.generators.set('largeBubbleSet', this.generateLargeBubbleSet.bind(this));
        this.generators.set('scoreHistory', this.generateScoreHistory.bind(this));
    }

    generate(type, count = 1, options = {}) {
        const generator = this.generators.get(type);
        if (!generator) {
            throw new Error(`Unknown mock data type: ${type}`);
        }

        if (count === 1) {
            return generator(options);
        }

        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(generator(options));
        }
        return results;
    }

    generateBubble(options = {}) {
        const types = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky'];
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            type: options.type || types[Math.floor(Math.random() * types.length)],
            x: options.x || Math.random() * 800,
            y: options.y || Math.random() * 600,
            radius: options.radius || (20 + Math.random() * 20),
            health: options.health || (1 + Math.floor(Math.random() * 3)),
            velocity: {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4
            },
            age: 0,
            maxAge: 5000 + Math.random() * 10000
        };
    }

    generateBubbles(count = 10, types = null) {
        const bubbles = [];
        for (let i = 0; i < count; i++) {
            const options = {};
            if (types && types.length > 0) {
                options.type = types[Math.floor(Math.random() * types.length)];
            }
            bubbles.push(this.generateBubble(options));
        }
        return bubbles;
    }

    generateGameState(options = {}) {
        return {
            score: options.score || Math.floor(Math.random() * 10000),
            combo: options.combo || Math.floor(Math.random() * 20),
            level: options.level || (1 + Math.floor(Math.random() * 10)),
            timeRemaining: options.timeRemaining || Math.floor(Math.random() * 300000),
            playerHP: options.playerHP || (80 + Math.floor(Math.random() * 20)),
            bubbleCount: options.bubbleCount || Math.floor(Math.random() * 50),
            activeEffects: options.activeEffects || [],
            gameMode: options.gameMode || 'normal'
        };
    }

    generatePlayerData(options = {}) {
        return {
            name: options.name || `TestPlayer${Math.floor(Math.random() * 1000)}`,
            totalScore: options.totalScore || Math.floor(Math.random() * 100000),
            highScore: options.highScore || Math.floor(Math.random() * 50000),
            totalAP: options.totalAP || Math.floor(Math.random() * 5000),
            currentAP: options.currentAP || Math.floor(Math.random() * 1000),
            gamesPlayed: options.gamesPlayed || Math.floor(Math.random() * 100),
            achievements: options.achievements || [],
            settings: options.settings || {
                volume: 0.5,
                difficulty: 'normal',
                quality: 'high'
            }
        };
    }

    generateLargeBubbleSet(count = 1000) {
        return this.generateBubbles(count);
    }

    generateScoreHistory(options = {}) {
        const count = options.count || 50;
        const history = [];
        
        for (let i = 0; i < count; i++) {
            history.push({
                timestamp: Date.now() - (i * 24 * 60 * 60 * 1000), // 1日ごと
                score: Math.floor(Math.random() * 10000),
                level: 1 + Math.floor(Math.random() * 10),
                duration: Math.floor(Math.random() * 300000)
            });
        }
        
        return history.reverse(); // 古い順にソート
    }

    destroy() {
        this.generators.clear();
    }
}

/**
 * Benchmark Suite
 * パフォーマンステスト実行システム
 */
class BenchmarkSuite {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.benchmarks = new Map();
        this.setupBenchmarks();
    }

    setupBenchmarks() {
        this.benchmarks.set('rendering', this.benchmarkRendering.bind(this));
        this.benchmarks.set('bubblePhysics', this.benchmarkBubblePhysics.bind(this));
        this.benchmarks.set('particleEffects', this.benchmarkParticleEffects.bind(this));
        this.benchmarks.set('memoryAllocation', this.benchmarkMemoryAllocation.bind(this));
        this.benchmarks.set('audioProcessing', this.benchmarkAudioProcessing.bind(this));
    }

    async runBenchmarks(benchmarkNames = null) {
        const targets = benchmarkNames || Array.from(this.benchmarks.keys());
        const results = {};

        for (const name of targets) {
            const benchmark = this.benchmarks.get(name);
            if (benchmark) {
                try {
                    results[name] = await benchmark();
                } catch (error) {
                    results[name] = {
                        error: error.message,
                        success: false
                    };
                }
            }
        }

        return results;
    }

    async benchmarkRendering() {
        const iterations = 60;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            
            if (this.gameEngine?.render) {
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        this.gameEngine.render();
                        resolve();
                    });
                });
            }
            
            times.push(performance.now() - start);
        }

        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        return {
            avgRenderTime: avgTime,
            minRenderTime: minTime,
            maxRenderTime: maxTime,
            estimatedFPS: 1000 / avgTime,
            success: true
        };
    }

    async benchmarkBubblePhysics() {
        const bubbleManager = this.gameEngine?.bubbleManager;
        if (!bubbleManager) {
            throw new Error('BubbleManager not available');
        }

        const mockGenerator = new MockDataGenerator(this.gameEngine);
        const testBubbles = mockGenerator.generateBubbles(100);
        
        const start = performance.now();
        
        // 物理演算シミュレーション
        for (let frame = 0; frame < 60; frame++) {
            testBubbles.forEach(bubble => {
                // 簡単な物理演算
                bubble.x += bubble.velocity.x;
                bubble.y += bubble.velocity.y;
                bubble.age += 16.67; // 60FPS想定
                
                // 境界チェック
                if (bubble.x < 0 || bubble.x > 800) bubble.velocity.x *= -1;
                if (bubble.y < 0 || bubble.y > 600) bubble.velocity.y *= -1;
            });
        }
        
        const totalTime = performance.now() - start;
        
        return {
            totalTime: totalTime,
            bubblesProcessed: testBubbles.length,
            framesProcessed: 60,
            avgTimePerFrame: totalTime / 60,
            avgTimePerBubble: totalTime / (testBubbles.length * 60),
            success: true
        };
    }

    async benchmarkParticleEffects() {
        const particleManager = this.gameEngine?.enhancedParticleManager;
        if (!particleManager) {
            return { error: 'ParticleManager not available', success: false };
        }

        const start = performance.now();
        
        // パーティクルエフェクトを大量生成
        for (let i = 0; i < 50; i++) {
            if (particleManager.createBubbleDestructionEffect) {
                particleManager.createBubbleDestructionEffect(
                    Math.random() * 800,
                    Math.random() * 600,
                    'normal'
                );
            }
        }
        
        const generationTime = performance.now() - start;
        
        // 更新処理のベンチマーク
        const updateStart = performance.now();
        for (let frame = 0; frame < 60; frame++) {
            if (particleManager.update) {
                particleManager.update(16.67);
            }
        }
        const updateTime = performance.now() - updateStart;
        
        return {
            generationTime: generationTime,
            updateTime: updateTime,
            totalTime: generationTime + updateTime,
            effectsGenerated: 50,
            framesUpdated: 60,
            success: true
        };
    }

    async benchmarkMemoryAllocation() {
        if (!performance.memory) {
            return { error: 'Memory API not available', success: false };
        }

        const initialMemory = performance.memory.usedJSHeapSize;
        const mockGenerator = new MockDataGenerator(this.gameEngine);
        
        const start = performance.now();
        
        // 大量のオブジェクト生成
        const allocations = [];
        for (let i = 0; i < 1000; i++) {
            allocations.push(mockGenerator.generateBubbles(10));
        }
        
        const allocationTime = performance.now() - start;
        const peakMemory = performance.memory.usedJSHeapSize;
        
        // クリーンアップ
        allocations.length = 0;
        
        // ガベージコレクションを促す
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        
        return {
            allocationTime: allocationTime,
            initialMemory: initialMemory,
            peakMemory: peakMemory,
            finalMemory: finalMemory,
            memoryAllocated: peakMemory - initialMemory,
            memoryReleased: peakMemory - finalMemory,
            objectsAllocated: 10000,
            success: true
        };
    }

    async benchmarkAudioProcessing() {
        const audioManager = this.gameEngine?.audioManager;
        if (!audioManager) {
            return { error: 'AudioManager not available', success: false };
        }

        const start = performance.now();
        
        // 音声処理のシミュレーション
        for (let i = 0; i < 100; i++) {
            // 音声エフェクトの処理をシミュレート
            if (audioManager.playEffect) {
                // 実際の音声再生はしない（テスト用）
                const effectName = ['pop', 'combo', 'bonus'][i % 3];
                // audioManager.playEffect(effectName); // コメントアウトして処理時間のみ測定
            }
        }
        
        const processingTime = performance.now() - start;
        
        return {
            processingTime: processingTime,
            effectsProcessed: 100,
            avgTimePerEffect: processingTime / 100,
            success: true
        };
    }

    destroy() {
        this.benchmarks.clear();
    }
}

// グローバルアクセス用（デバッグ目的）
window.TestSupportTools = TestSupportTools;