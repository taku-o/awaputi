import { BaseComponent } from './BaseComponent.js';
import { TestExecutionManager } from './support/TestExecutionManager.js';
import { MockDataManager } from './support/MockDataManager.js';
import { BenchmarkManager } from './support/BenchmarkManager.js';
import { TestResultProcessor } from './support/TestResultProcessor.js';

/**
 * Test Support Tools (Main Controller)
 * テスト実行と支援機能を提供する包括的システム
 */
export class TestSupportTools extends BaseComponent {
    constructor(gameEngine) {
        super(null, 'TestSupportTools');
        this.gameEngine = gameEngine;
        this.components = new Map();
        this.testEnvironment = null;
        this.isRunning = false;
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
            this.setupTestEnvironment();
            
            // コンポーネントの初期化
            this.components.set('executionManager', new TestExecutionManager(this));
            this.components.set('mockDataManager', new MockDataManager(this));
            this.components.set('benchmarkManager', new BenchmarkManager(this));
            this.components.set('resultProcessor', new TestResultProcessor(this));

            // 各コンポーネントを初期化
            for (const [name, component] of this.components) {
                if (component.initialize) {
                    await component.initialize();
                }
            }

            this.initialized = true;
        } catch (error) {
            this._handleError('Failed to initialize TestSupportTools', error);
            throw error;
        }
    }

    /**
     * テスト環境のセットアップ
     */
    setupTestEnvironment() {
        // テスト環境の初期化
        this.testEnvironment = {
            mockData: new Map(),
            testStates: new Map(),
            benchmarkResults: new Map(),
            testHistory: []
        };
    }

    /**
     * 実行マネージャーを取得
     */
    getExecutionManager() {
        return this.components.get('executionManager');
    }

    /**
     * モックデータマネージャーを取得
     */
    getMockDataManager() {
        return this.components.get('mockDataManager');
    }

    /**
     * ベンチマークマネージャーを取得
     */
    getBenchmarkManager() {
        return this.components.get('benchmarkManager');
    }

    /**
     * 結果プロセッサーを取得
     */
    getResultProcessor() {
        return this.components.get('resultProcessor');
    }

    // テスト実行メソッド（メインコントローラー統制）
    async runTests(suiteNames = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        const executionManager = this.getExecutionManager();
        if (!executionManager) {
            throw new Error('ExecutionManager not available');
        }

        const testSession = await executionManager.runTests(suiteNames);
        this.testEnvironment.testHistory.push(testSession);
        return testSession;
    }

    async runBenchmarks(benchmarkNames = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        const benchmarkManager = this.getBenchmarkManager();
        if (!benchmarkManager) {
            throw new Error('BenchmarkManager not available');
        }

        const results = await benchmarkManager.runBenchmarks(benchmarkNames);
        this.testEnvironment.benchmarkResults.set(Date.now(), results);
        return results;
    }

    // モックデータ生成（メインコントローラー統制）
    generateTestData(type, count = 1, options = {}) {
        if (!this.initialized) {
            throw new Error('TestSupportTools not initialized');
        }

        const mockDataManager = this.getMockDataManager();
        return mockDataManager ? mockDataManager.generateTestData(type, count, options) : null;
    }

    generateMockGameState(options = {}) {
        if (!this.initialized) {
            throw new Error('TestSupportTools not initialized');
        }

        const mockDataManager = this.getMockDataManager();
        return mockDataManager ? mockDataManager.generateMockGameState(options) : null;
    }

    generateMockBubbles(count = 10, types = null) {
        if (!this.initialized) {
            throw new Error('TestSupportTools not initialized');
        }

        const mockDataManager = this.getMockDataManager();
        return mockDataManager ? mockDataManager.generateMockBubbles(count, types) : [];
    }

    // 結果分析（メインコントローラー統制）
    analyzeTestResults(results = null) {
        if (!this.initialized) {
            throw new Error('TestSupportTools not initialized');
        }

        const resultProcessor = this.getResultProcessor();
        return resultProcessor ? resultProcessor.analyzeTestResults(results) : null;
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

    /**
     * 旧来のAPIとの互換性のため
     */
    get testRunner() {
        return this.getExecutionManager()?.testRunner;
    }

    get mockDataGenerator() {
        return this.getMockDataManager()?.mockDataGenerator;
    }

    get benchmarkSuite() {
        return this.getBenchmarkManager()?.benchmarkSuite;
    }

    get testResults() {
        // 旧形式のtestResultsマップとの互換性
        const resultsMap = new Map();
        this.testEnvironment.testHistory.forEach((session, index) => {
            resultsMap.set(`session_${index}`, session.results);
        });
        return resultsMap;
    }

    /**
     * 破棄処理
     */
    destroy() {
        try {
            this.isRunning = false;
            
            // 各コンポーネントのクリーンアップ
            for (const [name, component] of this.components) {
                if (component.cleanup) {
                    component.cleanup();
                }
            }
            
            this.components.clear();
            this.testEnvironment = null;
            this.initialized = false;
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

// グローバルアクセス用（デバッグ目的）
if (typeof window !== 'undefined') {
    window.TestSupportTools = TestSupportTools;
}