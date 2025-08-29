/**
 * PWA Test Framework - Main Controller for PWA testing system
 * Refactored to use the Main Controller Pattern with sub-components
 * PWA機能の包括的テストフレームワーク
 * 
 * 主要機能:
 * - Service Worker テスト
 * - インストールフロー テスト
 * - オフライン機能 テスト
 * - アイコン表示 テスト
 * - キャッシュ機能 テスト
 */

import { PWATestExecutor } from './pwa-test-framework/PWATestExecutor';
import { PWAFeatureTests } from './pwa-test-framework/PWAFeatureTests';
import { PWAPerformanceTests } from './pwa-test-framework/PWAPerformanceTests';
import { PWAReportGenerator } from './pwa-test-framework/PWAReportGenerator';

export class PWATestFramework {
    public testResults: any[];
    public testSuite: Map<string, any>;
    public timeouts: Map<string, any>;
    public mockData: Map<string, any>;
    public config: {
        defaultTimeout: number;
        retryAttempts: number;
        verbose: boolean;
        baseUrl: string;
        manifestUrl: string;
        serviceWorkerUrl: string;
        expectedConfig: {
            appName: string;
            themeColor: string;
            backgroundColor: string;
            displayMode: string;
            orientation: string;
        };
    };
    public executor: PWATestExecutor;
    public featureTests: PWAFeatureTests;
    public performanceTests: PWAPerformanceTests;
    public reportGenerator: PWAReportGenerator;
    public state: any;

    constructor() {
        this.testResults = [];
        this.testSuite = new Map();
        this.timeouts = new Map();
        this.mockData = new Map();
        
        // テスト設定
        this.config = {
            defaultTimeout: 10000,
            retryAttempts: 3,
            verbose: true,
            // テスト対象URL
            baseUrl: window.location.origin,
            manifestUrl: '/manifest.json',
            serviceWorkerUrl: '/sw.js',
            // 期待される設定値
            expectedConfig: {
                appName: 'BubblePop',
                themeColor: '#4CAF50',
                backgroundColor: '#ffffff',
                displayMode: 'standalone',
                orientation: 'portrait-primary'
            }
        };
        
        // Initialize sub-components with dependency injection
        this.executor = new PWATestExecutor(this);
        this.featureTests = new PWAFeatureTests(this);
        this.performanceTests = new PWAPerformanceTests(this);
        this.reportGenerator = new PWAReportGenerator(this);
        
        // Legacy state reference for backward compatibility
        this.state = this.executor.state;
        
        console.log('[PWATestFramework] PWAテストフレームワーク初期化完了');
    }
    
    /**
     * Main test execution entry point
     */
    async run() {
        console.log('[PWATestFramework] PWAテスト実行開始');
        
        try {
            // Run all test suites using the executor
            const testReport = await this.executor.runAllTests();
            
            console.log('[PWATestFramework] PWAテスト実行完了');
            console.log(`[PWATestFramework] テスト結果: ${this.executor.state.passedTests}件成功, ${this.executor.state.failedTests}件失敗`);
            
            return testReport;
            
        } catch (error: any) {
            console.error('[PWATestFramework] PWAテスト実行エラー:', error);
            throw error;
        }
    }
    
    /**
     * Legacy method for backward compatibility - delegates to executor
     */
    async runTest(testName: string, description: string, testFunction: () => Promise<any>, timeout?: number) {
        return this.executor.runTest(testName, description, testFunction, timeout);
    }
    
    /**
     * Legacy method for backward compatibility - delegates to executor
     */
    assert(condition: boolean, message: string) {
        return this.executor.assert(condition, message);
    }
    
    /**
     * Legacy method for backward compatibility - delegates to executor
     */
    skipTest(testName: string, reason: string) {
        return this.executor.skipTest(testName, reason);
    }
    
    /**
     * Legacy method for backward compatibility - delegates to executor
     */
    getTestStatus() {
        return this.executor.getTestStatus();
    }
    
    /**
     * Generate test report - delegates to report generator
     */
    generateTestReport() {
        return this.reportGenerator.generateTestReport();
    }
    
    /**
     * Generate HTML report - delegates to report generator
     */
    generateHTMLReport() {
        return this.reportGenerator.generateHTMLReport();
    }
    
    /**
     * Save HTML report - delegates to report generator
     */
    saveHTMLReport(filename?: string) {
        return this.reportGenerator.saveHTMLReport(filename);
    }
    
    /**
     * Generate JSON report - delegates to report generator
     */
    generateJSONReport() {
        return this.reportGenerator.generateJSONReport();
    }
    
    /**
     * Save JSON report - delegates to report generator
     */
    saveJSONReport(filename?: string) {
        return this.reportGenerator.saveJSONReport(filename);
    }
    
    /**
     * Log report to console - delegates to report generator
     */
    logReport() {
        return this.reportGenerator.logReport();
    }
    
    /**
     * Wait for Service Worker state - delegates to executor
     */
    async waitForServiceWorkerState(registration: ServiceWorkerRegistration, targetState: string, timeout?: number) {
        return this.executor.waitForServiceWorkerState(registration, targetState, timeout);
    }
    
    /**
     * Wait for condition - delegates to executor
     */
    async waitForCondition(conditionFn: () => boolean, timeout?: number, checkInterval?: number) {
        return this.executor.waitForCondition(conditionFn, timeout, checkInterval);
    }
    
    /**
     * Wait for element - delegates to executor
     */
    async waitForElement(selector: string, timeout?: number) {
        return this.executor.waitForElement(selector, timeout);
    }
    
    /**
     * Create mock response - delegates to executor
     */
    createMockResponse(data: any, options?: ResponseInit) {
        return this.executor.createMockResponse(data, options);
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Clean up sub-components
        if (this.executor) {
            this.executor.cleanup();
        }
        
        // Clear framework-level resources
        this.testSuite.clear();
        this.timeouts.clear();
        this.mockData.clear();
        this.testResults = [];
        
        console.log('[PWATestFramework] Cleanup completed');
    }
    
    /**
     * Set configuration
     */
    setConfig(newConfig: Partial<typeof this.config>) {
        this.config = { ...this.config, ...newConfig };
        console.log('[PWATestFramework] Configuration updated:', newConfig);
    }
    
    /**
     * Get configuration
     */
    getConfig() {
        return this.config;
    }
    
    /**
     * Add mock data
     */
    addMockData(key: string, data: any) {
        this.mockData.set(key, data);
        console.log(`[PWATestFramework] Mock data added for key: ${key}`);
    }
    
    /**
     * Get mock data
     */
    getMockData(key: string) {
        return this.mockData.get(key);
    }
    
    /**
     * Clear mock data
     */
    clearMockData() {
        this.mockData.clear();
        console.log('[PWATestFramework] Mock data cleared');
    }
    
    /**
     * Get test results
     */
    getTestResults() {
        return this.testResults;
    }
    
    /**
     * Clear test results
     */
    clearTestResults() {
        this.testResults = [];
        console.log('[PWATestFramework] Test results cleared');
    }
    
    /**
     * Get framework version
     */
    getVersion() {
        return '2.0.0'; // Version after refactoring to Main Controller Pattern
    }
    
    /**
     * Get framework info
     */
    getInfo() {
        return {
            name: 'PWA Test Framework',
            version: this.getVersion(),
            components: [
                'PWATestExecutor',
                'PWAFeatureTests', 
                'PWAPerformanceTests',
                'PWAReportGenerator'
            ],
            initialized: Date.now(),
            config: this.config
        };
    }
}