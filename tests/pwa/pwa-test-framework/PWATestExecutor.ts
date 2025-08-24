/**
 * PWATestExecutor - Test execution and management functionality
 * Part of the PWATestFramework split implementation
 */

export class PWATestExecutor {
    private mainFramework: any;
    private testSuite: Map<string, any>;
    private timeouts: Map<string, NodeJS.Timeout>;
    public state: {
        isRunning: boolean;
        currentTest: string | null;
        startTime: number | null;
        totalTests: number;
        passedTests: number;
        failedTests: number;
        skippedTests: number;
    };

    constructor(mainFramework: any) {
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
                await this.mainFramework.performanceTests.runCacheStrategyTests();
            }
        } catch (error: any) {
            this.logError('Test suite execution error', error);
        } finally {
            this.endTestSession();
        }
        
        return this.mainFramework.reportGenerator.generateTestReport();
    }
    
    /**
     * Run individual test
     */
    async runTest(testName: string, description: string, testFunction: () => Promise<any>, timeout = 30000) {
        console.log(`[PWATestExecutor] Running test: ${testName}`);
        
        this.state.currentTest = testName;
        this.state.totalTests++;
        
        const startTime = Date.now();
        let testResult: any = null;
        let testStatus = 'failed';
        let testError: string | null = null;
        
        try {
            // Set up timeout
            const timeoutPromise = new Promise((_, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error(`Test "${testName}" timed out after ${timeout}ms`));
                }, timeout);
                this.timeouts.set(testName, timeoutId);
            });
            
            // Run test with timeout
            testResult = await Promise.race([
                testFunction(),
                timeoutPromise
            ]);
            
            testStatus = 'passed';
            this.state.passedTests++;
            console.log(`[PWATestExecutor] Test "${testName}" passed`);
            
        } catch (error: any) {
            testError = error.message || 'Unknown error occurred';
            testStatus = 'failed';
            this.state.failedTests++;
            console.error(`[PWATestExecutor] Test "${testName}" failed:`, error);
        } finally {
            // Clear timeout
            const timeoutId = this.timeouts.get(testName);
            if (timeoutId) {
                clearTimeout(timeoutId);
                this.timeouts.delete(testName);
            }
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Store test result
        const testRecord = {
            testName: testName,
            description: description,
            status: testStatus,
            duration: duration,
            result: testResult,
            error: testError,
            timestamp: new Date().toISOString()
        };
        
        this.mainFramework.testResults.push(testRecord);
        this.state.currentTest = null;
        
        return testRecord;
    }
    
    /**
     * Assert function for tests
     */
    assert(condition: boolean, message: string) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    
    /**
     * Wait for Service Worker to reach specific state
     */
    async waitForServiceWorkerState(registration: ServiceWorkerRegistration, targetState: string, timeout = 10000): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Service Worker did not reach "${targetState}" state within ${timeout}ms`));
            }, timeout);
            
            const checkState = () => {
                if (registration.active && registration.active.state === targetState) {
                    clearTimeout(timeoutId);
                    resolve();
                    return;
                }
                
                // Continue checking
                setTimeout(checkState, 100);
            };
            
            checkState();
        });
    }
    
    /**
     * Start test session
     */
    private startTestSession() {
        this.state.isRunning = true;
        this.state.startTime = Date.now();
        this.state.totalTests = 0;
        this.state.passedTests = 0;
        this.state.failedTests = 0;
        this.state.skippedTests = 0;
        
        // Clear previous test results
        this.mainFramework.testResults = [];
        
        console.log('[PWATestExecutor] Test session started');
    }
    
    /**
     * End test session
     */
    private endTestSession() {
        this.state.isRunning = false;
        this.state.currentTest = null;
        
        // Clear any remaining timeouts
        for (const [testName, timeoutId] of this.timeouts) {
            clearTimeout(timeoutId);
        }
        this.timeouts.clear();
        
        console.log('[PWATestExecutor] Test session ended');
        console.log(`[PWATestExecutor] Test summary: ${this.state.passedTests} passed, ${this.state.failedTests} failed, ${this.state.skippedTests} skipped`);
    }
    
    /**
     * Skip test
     */
    skipTest(testName: string, reason: string) {
        console.log(`[PWATestExecutor] Skipping test: ${testName} - Reason: ${reason}`);
        
        this.state.totalTests++;
        this.state.skippedTests++;
        
        const testRecord = {
            testName: testName,
            description: `Skipped: ${reason}`,
            status: 'skipped',
            duration: 0,
            result: null,
            error: null,
            timestamp: new Date().toISOString()
        };
        
        this.mainFramework.testResults.push(testRecord);
        
        return testRecord;
    }
    
    /**
     * Get current test status
     */
    getTestStatus() {
        return {
            isRunning: this.state.isRunning,
            currentTest: this.state.currentTest,
            totalTests: this.state.totalTests,
            passedTests: this.state.passedTests,
            failedTests: this.state.failedTests,
            skippedTests: this.state.skippedTests,
            successRate: this.state.totalTests > 0 
                ? (this.state.passedTests / this.state.totalTests) * 100 
                : 0
        };
    }
    
    /**
     * Wait for condition with timeout
     */
    async waitForCondition(conditionFn: () => boolean, timeout = 5000, checkInterval = 100): Promise<void> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkCondition = () => {
                if (conditionFn()) {
                    resolve();
                    return;
                }
                
                if (Date.now() - startTime >= timeout) {
                    reject(new Error(`Condition not met within ${timeout}ms`));
                    return;
                }
                
                setTimeout(checkCondition, checkInterval);
            };
            
            checkCondition();
        });
    }
    
    /**
     * Wait for element to be present
     */
    async waitForElement(selector: string, timeout = 5000): Promise<Element> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }
                
                if (Date.now() - startTime >= timeout) {
                    reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
                    return;
                }
                
                setTimeout(checkElement, 100);
            };
            
            checkElement();
        });
    }
    
    /**
     * Create mock fetch response
     */
    createMockResponse(data: any, options: ResponseInit = {}) {
        return new Response(
            typeof data === 'string' ? data : JSON.stringify(data),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': typeof data === 'string' ? 'text/plain' : 'application/json',
                    ...options.headers
                },
                ...options
            }
        );
    }
    
    /**
     * Log error with context
     */
    private logError(context: string, error: any) {
        console.error(`[PWATestExecutor] ${context}:`, error);
        
        // Add to error log if needed
        if (!this.mainFramework.errorLog) {
            this.mainFramework.errorLog = [];
        }
        
        this.mainFramework.errorLog.push({
            context: context,
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Clear all timeouts
        for (const [testName, timeoutId] of this.timeouts) {
            clearTimeout(timeoutId);
        }
        this.timeouts.clear();
        
        // Reset state
        this.state.isRunning = false;
        this.state.currentTest = null;
        
        console.log('[PWATestExecutor] Cleanup completed');
    }
}