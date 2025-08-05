import { BaseComponent } from '../BaseComponent.js';

/**
 * TestExecutionManager - テスト実行・スイート調整コンポーネント
 */
export class TestExecutionManager extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'TestExecutionManager');
        this.testSuites = new Map();
        this.currentExecution = null;
        this.testRunner = null;
    }

    async _doInitialize() {
        this.testRunner = new TestRunner(this.mainController.gameEngine);
        this.registerDefaultTests();
    }

    /**
     * デフォルトテストスイートの登録
     */
    registerDefaultTests() {
        // デフォルトテストスイートの登録
        this.testRunner.registerSuite('core', this.createCoreTestSuite());
        this.testRunner.registerSuite('performance', this.createPerformanceTestSuite());
        this.testRunner.registerSuite('integration', this.createIntegrationTestSuite());
    }

    /**
     * テスト実行メソッド
     * @param {Array} suiteNames - 実行するスイート名
     * @returns {Object} 実行結果
     */
    async runTests(suiteNames = null) {
        if (this.currentExecution) {
            throw new Error('Tests are already running');
        }

        const startTime = performance.now();
        
        try {
            this.currentExecution = true;
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

            return testSession;
            
        } finally {
            this.currentExecution = null;
        }
    }

    /**
     * デフォルトテストスイート作成
     */
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
        const engine = this.mainController.gameEngine;
        
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
        const bubbleManager = this.mainController.gameEngine?.bubbleManager;
        
        if (!bubbleManager) {
            throw new Error('BubbleManager is not available');
        }

        // モックバブルでテスト
        const mockDataManager = this.mainController.getMockDataManager();
        const initialCount = bubbleManager.getBubbleCount();
        const mockBubbles = mockDataManager ? 
            mockDataManager.generateMockBubbles(5) : [];
        
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
        const scoreManager = this.mainController.gameEngine?.scoreManager;
        
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
            if (this.mainController.gameEngine?.render) {
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        this.mainController.gameEngine.render();
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
        const mockDataManager = this.mainController.getMockDataManager();
        const mockData = mockDataManager ? 
            mockDataManager.generateLargeBubbleSet(1000) : [];
        
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
        const sceneManager = this.mainController.gameEngine?.sceneManager;
        
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
        const inputManager = this.mainController.gameEngine?.inputManager;
        
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
        const playerData = this.mainController.gameEngine?.playerData;
        
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

    /**
     * クリーンアップ
     */
    cleanup() {
        this.testRunner?.destroy();
        this.testSuites.clear();
        this.currentExecution = null;
        super.cleanup();
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