/**
 * PWATestExecutor - Test execution and management functionality
 * Part of the PWATestFramework split implementation
 */

export class PWATestExecutor {
    constructor(mainFramework {
        this.mainFramework = mainFramework;
        this.testSuite = new Map();
        this.timeouts = new Map();
        
        // テスト状態
        this.state = {
            isRunning: false,
            currentTest: null,
            startTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0
        };
        
        console.log('[PWATestExecutor] Test executor component initialized');
    }
    
    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('[PWATestExecutor] Starting all PWA tests');
        this.startTestSession();
        
        try {
            // Run tests from feature tests component
            if (this.mainFramework.featureTests) {
                await this.mainFramework.featureTests.runBasicPWATests();
                await this.mainFramework.featureTests.runServiceWorkerTests();
                await this.mainFramework.featureTests.runInstallationTests();
                await this.mainFramework.featureTests.runIconAndUITests();
                await this.mainFramework.featureTests.runBrowserCompatibilityTests();
            }
            
            // Run tests from performance tests component
            if (this.mainFramework.performanceTests) {
                await this.mainFramework.performanceTests.runOfflineTests();
                await this.mainFramework.performanceTests.runPerformanceTests();
            }
            
        } catch (error) {
            this.logError('Test suite execution error', error);
        } finally {
            this.endTestSession();
        }
        
        return this.mainFramework.reportGenerator.generateTestReport();
    }
    
    /**
     * Run individual test
     */
    async runTest(testId, testName, testFunction) {
        this.state.currentTest = testId;
        const startTime = performance.now();
        
        console.log(`[PWATestExecutor] Starting test: ${testName}`);
        
        try {
            const result = await Promise.race([
                testFunction(),
                this.createTimeout(this.mainFramework.config.defaultTimeout)
            ]);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const testResult = {
                id: testId,
                name: testName,
                status: 'passed',
                duration: duration,
                result: result,
                timestamp: new Date().toISOString()
            };
            
            this.mainFramework.testResults.push(testResult as any);
            this.state.passedTests++;
            
            console.log(`[PWATestExecutor] Test passed: ${testName} (${duration.toFixed(2)}ms)`);
            
            return testResult;
            
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const testResult = {
                id: testId,
                name: testName,
                status: 'failed',
                duration: duration,
                error: {
                    message: error.message,
                    stack: error.stack
                },
                timestamp: new Date().toISOString()
            };
            
            this.mainFramework.testResults.push(testResult as any);
            this.state.failedTests++;
            
            console.error(`[PWATestExecutor] Test failed: ${testName} - ${error.message}`);
            
            return testResult;
        }
    }
    
    /**
     * Assert condition
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    
    /**
     * Wait for Service Worker state
     */
    async waitForServiceWorkerState(registration, targetState) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Service Worker ${targetState} state timeout`));
            }, 10000);
            
            const checkState = () => {
                if (registration.active && registration.active.state === targetState) {
                    clearTimeout(timeout as any);
                    resolve(registration;
                } else if (registration.installing) {
                    registration.installing.addEventListener('statechange', checkState);
                } else if (registration.waiting) {
                    registration.waiting.addEventListener('statechange', checkState);
                }
            };
            
            checkState();
        });
    }
    
    /**
     * Create timeout promise
     */
    createTimeout(ms {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Test timeout: ${ms}ms`));
            }, ms);
        });
    }
    
    /**
     * Start test session
     */
    startTestSession() {
        this.state.isRunning = true;
        this.state.startTime = Date.now();
        this.state.totalTests = 0;
        this.state.passedTests = 0;
        this.state.failedTests = 0;
        this.state.skippedTests = 0;
        this.mainFramework.testResults = [];
        
        console.log('[PWATestExecutor] Test session started');
    }
    
    /**
     * End test session
     */
    endTestSession() {
        this.state.isRunning = false;
        this.state.currentTest = null;
        this.state.totalTests = this.mainFramework.testResults.length;
        
        const duration = Date.now() - this.state.startTime;
        
        console.log(`[PWATestExecutor] Test session completed - Duration: ${duration}ms`);
        console.log(`[PWATestExecutor] Results: ${this.state.passedTests} passed, ${this.state.failedTests} failed, ${this.state.skippedTests} skipped`);
    }
    
    /**
     * Get executor state
     * @returns {Object} Current executor state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Error logging
     */
    logError(message, error) {
        console.error(`[PWATestExecutor] ${message}:`, error);
    }
}