/**
 * Mobile Test Runner
 * モバイルテスト実行専用クラス
 */

export class MobileTestRunner {
    constructor(mobileTestSuite) {
        this.mobileTestSuite = mobileTestSuite;
        
        // 実行設定
        this.executionConfig = {
            timeout: 30000, // 30秒
            retries: 3,
            concurrent: false,
            parallelLimit: 2
        };
        
        // 実行状態
        this.executionState = {
            isRunning: false,
            currentSuite: null,
            currentTest: null,
            startTime: null,
            abortController: null
        };
        
        // 実行統計
        this.executionStats = {
            totalTestsRun: 0,
            averageTestTime: 0,
            suitesExecuted: 0,
            timeouts: 0,
            retries: 0
        };
    }
    
    /**
     * 全テスト実行
     */
    async runAllTests() {
        console.log('[MobileTestRunner] 全テスト実行開始');
        
        if (this.executionState.isRunning) {
            throw new Error('Tests are already running');
        }
        
        this.startExecution();
        
        try {
            this.mobileTestSuite.resetTestResults();
            
            for (const [suiteName, suite] of this.mobileTestSuite.testSuites) {
                await this.runTestSuite(suiteName, suite);
                this.executionStats.suitesExecuted++;
            }
            
            const report = this.mobileTestSuite.generateTestReport();
            this.completeExecution();
            
            console.log('[MobileTestRunner] 全テスト実行完了', report);
            return report;
            
        } catch (error) {
            this.abortExecution();
            throw error;
        }
    }
    
    /**
     * 個別テストスイート実行
     */
    async runTestSuite(suiteName, suite) {
        console.log(`[MobileTestRunner] ${suiteName} テスト実行開始`);
        
        this.executionState.currentSuite = suiteName;
        
        try {
            const tests = suite.getTests();
            
            if (this.executionConfig.concurrent) {
                await this.runTestsConcurrently(suiteName, tests);
            } else {
                await this.runTestsSequentially(suiteName, tests);
            }
            
            console.log(`[MobileTestRunner] ${suiteName} テスト実行完了`);
            
        } catch (error) {
            this.mobileTestSuite.recordTestError(suiteName, 'suite_execution', error);
            console.error(`[MobileTestRunner] ${suiteName} テストスイートエラー:`, error);
            throw error;
        } finally {
            this.executionState.currentSuite = null;
        }
    }
    
    /**
     * 順次テスト実行
     */
    async runTestsSequentially(suiteName, tests) {
        for (const test of tests) {
            if (this.isExecutionAborted()) {
                throw new Error('Test execution aborted');
            }
            
            await this.runSingleTest(suiteName, test);
        }
    }
    
    /**
     * 並行テスト実行
     */
    async runTestsConcurrently(suiteName, tests) {
        const chunks = this.chunkArray(tests, this.executionConfig.parallelLimit);
        
        for (const chunk of chunks) {
            if (this.isExecutionAborted()) {
                throw new Error('Test execution aborted');
            }
            
            const promises = chunk.map(test => this.runSingleTest(suiteName, test));
            await Promise.allSettled(promises);
        }
    }
    
    /**
     * 単一テスト実行
     */
    async runSingleTest(suiteName, test) {
        this.executionState.currentTest = test.name;
        
        let retries = this.executionConfig.retries;
        const testStartTime = performance.now();
        
        while (retries > 0) {
            try {
                const result = await Promise.race([
                    this.executeTestWithContext(test),
                    this.createTimeoutPromise()
                ]);
                
                const testDuration = performance.now() - testStartTime;
                this.updateExecutionStats(testDuration);
                
                if (result.passed) {
                    this.mobileTestSuite.testResults.passed++;
                } else {
                    this.mobileTestSuite.testResults.failed++;
                    this.mobileTestSuite.recordTestFailure(suiteName, test.name, result.error);
                }
                
                // パフォーマンス結果記録
                if (result.performance) {
                    this.mobileTestSuite.recordPerformanceResult(
                        `${suiteName}.${test.name}`,
                        testDuration,
                        result.performance
                    );
                }
                
                return result;
                
            } catch (error) {
                retries--;
                this.executionStats.retries++;
                
                if (error.message === 'Test timeout') {
                    this.executionStats.timeouts++;
                }
                
                if (retries === 0) {
                    this.mobileTestSuite.testResults.failed++;
                    this.mobileTestSuite.recordTestError(suiteName, test.name, error);
                    throw error;
                }
                
                console.warn(`[MobileTestRunner] ${test.name} リトライ (残り${retries}回)`);
                await this.wait(1000); // 1秒待機してリトライ
            }
        }
        
        this.executionState.currentTest = null;
    }
    
    /**
     * コンテキスト付きテスト実行
     */
    async executeTestWithContext(test) {
        const context = {
            testSuite: this.mobileTestSuite,
            deviceSimulator: this.mobileTestSuite.deviceSimulator,
            utils: this.mobileTestSuite.utils,
            startTime: Date.now()
        };
        
        // テスト前処理
        await this.preTestSetup(test, context);
        
        try {
            // テスト実行
            const result = await test.run(context);
            
            // テスト後処理
            await this.postTestCleanup(test, context);
            
            return result;
            
        } catch (error) {
            // エラー時のクリーンアップ
            await this.errorTestCleanup(test, context, error);
            throw error;
        }
    }
    
    /**
     * テスト前セットアップ
     */
    async preTestSetup(test, context) {
        // テスト固有の環境セットアップ
        if (test.setup && typeof test.setup === 'function') {
            await test.setup(context);
        }
        
        // デバイス状態のリセット
        if (this.mobileTestSuite.deviceSimulator) {
            await this.mobileTestSuite.deviceSimulator.resetDeviceState();
        }
    }
    
    /**
     * テスト後クリーンアップ
     */
    async postTestCleanup(test, context) {
        // テスト固有のクリーンアップ
        if (test.cleanup && typeof test.cleanup === 'function') {
            await test.cleanup(context);
        }
    }
    
    /**
     * エラー時クリーンアップ
     */
    async errorTestCleanup(test, context, error) {
        try {
            // エラー時の緊急クリーンアップ
            if (test.errorCleanup && typeof test.errorCleanup === 'function') {
                await test.errorCleanup(context, error);
            }
            
            // デバイス状態の強制リセット
            if (this.mobileTestSuite.deviceSimulator) {
                await this.mobileTestSuite.deviceSimulator.forceResetDevice();
            }
            
        } catch (cleanupError) {
            console.warn('[MobileTestRunner] クリーンアップエラー:', cleanupError);
        }
    }
    
    /**
     * タイムアウトPromise作成
     */
    createTimeoutPromise() {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Test timeout'));
            }, this.executionConfig.timeout);
        });
    }
    
    /**
     * 特定テストスイート実行
     */
    async runSpecificSuite(suiteName) {
        const suite = this.mobileTestSuite.testSuites.get(suiteName);
        if (!suite) {
            throw new Error(`Test suite '${suiteName}' not found`);
        }
        
        console.log(`[MobileTestRunner] ${suiteName} 単体実行開始`);
        
        this.startExecution();
        this.mobileTestSuite.resetTestResults();
        
        try {
            await this.runTestSuite(suiteName, suite);
            const report = this.mobileTestSuite.generateTestReport();
            this.completeExecution();
            
            return report;
            
        } catch (error) {
            this.abortExecution();
            throw error;
        }
    }
    
    /**
     * 特定テスト実行
     */
    async runSpecificTest(suiteName, testName) {
        const suite = this.mobileTestSuite.testSuites.get(suiteName);
        if (!suite) {
            throw new Error(`Test suite '${suiteName}' not found`);
        }
        
        const tests = suite.getTests();
        const test = tests.find(t => t.name === testName);
        if (!test) {
            throw new Error(`Test '${testName}' not found in suite '${suiteName}'`);
        }
        
        console.log(`[MobileTestRunner] ${suiteName}.${testName} 単体実行開始`);
        
        this.startExecution();
        this.mobileTestSuite.resetTestResults();
        
        try {
            await this.runSingleTest(suiteName, test);
            const report = this.mobileTestSuite.generateTestReport();
            this.completeExecution();
            
            return report;
            
        } catch (error) {
            this.abortExecution();
            throw error;
        }
    }
    
    /**
     * テスト実行中断
     */
    abortTests() {
        if (!this.executionState.isRunning) {
            return false;
        }
        
        console.log('[MobileTestRunner] テスト実行中断');
        
        if (this.executionState.abortController) {
            this.executionState.abortController.abort();
        }
        
        this.abortExecution();
        return true;
    }
    
    /**
     * 実行開始処理
     */
    startExecution() {
        this.executionState.isRunning = true;
        this.executionState.startTime = Date.now();
        this.executionState.abortController = new AbortController();
        
        // 統計リセット
        this.executionStats = {
            totalTestsRun: 0,
            averageTestTime: 0,
            suitesExecuted: 0,
            timeouts: 0,
            retries: 0
        };
    }
    
    /**
     * 実行完了処理
     */
    completeExecution() {
        this.executionState.isRunning = false;
        this.executionState.currentSuite = null;
        this.executionState.currentTest = null;
        this.executionState.abortController = null;
        
        const duration = Date.now() - this.executionState.startTime;
        console.log(`[MobileTestRunner] 実行完了 (${duration}ms)`);
    }
    
    /**
     * 実行中断処理
     */
    abortExecution() {
        this.executionState.isRunning = false;
        this.executionState.currentSuite = null;
        this.executionState.currentTest = null;
        this.executionState.abortController = null;
    }
    
    /**
     * 実行中断チェック
     */
    isExecutionAborted() {
        return this.executionState.abortController?.signal.aborted || false;
    }
    
    /**
     * 実行統計更新
     */
    updateExecutionStats(testDuration) {
        this.executionStats.totalTestsRun++;
        
        // 平均テスト時間の更新
        const totalTime = this.executionStats.averageTestTime * (this.executionStats.totalTestsRun - 1);
        this.executionStats.averageTestTime = (totalTime + testDuration) / this.executionStats.totalTestsRun;
    }
    
    /**
     * 実行状態取得
     */
    getExecutionState() {
        return {
            ...this.executionState,
            stats: { ...this.executionStats },
            duration: this.executionState.startTime ? 
                Date.now() - this.executionState.startTime : 0
        };
    }
    
    /**
     * 設定更新
     */
    updateConfig(newConfig) {
        Object.assign(this.executionConfig, newConfig);
    }
    
    /**
     * 配列チャンク化
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    
    /**
     * 待機ユーティリティ
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * デバッグ情報取得
     */
    getDebugInfo() {
        return {
            config: this.executionConfig,
            state: this.executionState,
            stats: this.executionStats,
            isRunning: this.executionState.isRunning
        };
    }
}