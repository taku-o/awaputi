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
    constructor() {
        this.testResults = [];
        this.testSuite = new Map();
        this.timeouts = new Map();
        this.mockData = new Map(');
        
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
        this.executor = new PWATestExecutor(this as any);
        this.featureTests = new PWAFeatureTests(this as any);
        this.performanceTests = new PWAPerformanceTests(this as any);
        this.reportGenerator = new PWAReportGenerator(this as any');
        
        // Legacy state reference for backward compatibility
        this.state = this.executor.state;
        
        console.log('[PWATestFramework] PWAテストフレームワーク初期化完了');
    }
    
    /**
     * 全テストスイートの実行
     */
    async runAllTests() {
        return await this.executor.runAllTests();
    }
    
    // ===== DELEGATED METHODS - Maintain backward compatibility =====
    
    /**
     * Run basic PWA tests - delegated to feature tests
     */
    async runBasicPWATests() {
        return await this.featureTests.runBasicPWATests();
    }
    
    /**
     * Run Service Worker tests - delegated to feature tests
     */
    async runServiceWorkerTests() {
        return await this.featureTests.runServiceWorkerTests();
    }
    
    /**
     * Run installation tests - delegated to feature tests
     */
    async runInstallationTests() {
        return await this.featureTests.runInstallationTests();
    }
    
    /**
     * Run offline tests - delegated to performance tests
     */
    async runOfflineTests() {
        return await this.performanceTests.runOfflineTests();
    }
    
    /**
     * Run icon and UI tests - delegated to feature tests
     */
    async runIconAndUITests() {
        return await this.featureTests.runIconAndUITests();
    }
    
    /**
     * Run performance tests - delegated to performance tests
     */
    async runPerformanceTests() {
        return await this.performanceTests.runPerformanceTests();
    }
    
    /**
     * Run browser compatibility tests - delegated to feature tests
     */
    async runBrowserCompatibilityTests() {
        return await this.featureTests.runBrowserCompatibilityTests();
    }
    
    /**
     * Run individual test - delegated to executor
     */
    async runTest(testId, testName, testFunction) {
        return await this.executor.runTest(testId, testName, testFunction);
    }
    
    /**
     * Assert condition - delegated to executor
     */
    assert(condition, message) {
        return this.executor.assert(condition, message);
    }
    
    /**
     * Wait for Service Worker state - delegated to executor
     */
    async waitForServiceWorkerState(registration, targetState) {
        return await this.executor.waitForServiceWorkerState(registration, targetState);
    }
    
    /**
     * Create timeout - delegated to executor
     */
    createTimeout(ms {
        return this.executor.createTimeout(ms);
    }
    
    /**
     * Start test session - delegated to executor
     */
    startTestSession() {
        return this.executor.startTestSession();
    }
    
    /**
     * End test session - delegated to executor
     */
    endTestSession() {
        return this.executor.endTestSession();
    }
    
    /**
     * Generate test report - delegated to report generator
     */
    generateTestReport() {
        return this.reportGenerator.generateTestReport();
    }
    
    /**
     * Generate HTML report - delegated to report generator
     */
    generateHTMLReport() {
        return this.reportGenerator.generateHTMLReport();
    }
    
    /**
     * Error logging - delegated to executor
     */
    logError(message, error) {
        return this.executor.logError(message, error);
    }
    
    /**
     * Get component references for advanced usage
     * @returns {Object} Component references
     */
    getComponents() {
        return {
            executor: this.executor,
            featureTests: this.featureTests,
            performanceTests: this.performanceTests,
            reportGenerator: this.reportGenerator
        };
    }
    
    /**
     * Configure framework settings
     * @param {Object} config - Framework configuration
     */
    configure(config {
        if (config.defaultTimeout !== undefined) {
            this.config.defaultTimeout = config.defaultTimeout;
        }
        
        if (config.retryAttempts !== undefined) {
            this.config.retryAttempts = config.retryAttempts;
        }
        
        if (config.verbose !== undefined) {
            this.config.verbose = config.verbose;
        }
        
        if (config.expectedConfig) {
            Object.assign(this.config.expectedConfig, config.expectedConfig');
        }
        
        console.log('[PWATestFramework] Configuration updated');
    }
    
    /**
     * Get framework status
     * @returns {Object} Framework status
     */
    getStatus() {
        return {
            initialized: true,
            testResultsCount: this.testResults.length,
            executorState: this.executor.getState(),
            config: this.config
        };
    }
    
    /**
     * Reset framework
     */
    reset() {
        this.testResults = [];
        this.testSuite.clear();
        this.timeouts.clear();
        this.mockData.clear(');
        
        // Reset executor state
        this.executor.state.isRunning = false;
        this.executor.state.currentTest = null;
        this.executor.state.startTime = null;
        this.executor.state.totalTests = 0;
        this.executor.state.passedTests = 0;
        this.executor.state.failedTests = 0;
        this.executor.state.skippedTests = 0;
        
        console.log('[PWATestFramework] Framework reset');
    }
}

// グローバル関数として利用可能にする
window.PWATestFramework = PWATestFramework;

// 簡単にテストを実行するためのヘルパー関数
window.runPWATests = async function() {
    const framework = new PWATestFramework();
    const report = await framework.runAllTests(');
    
    console.log('PWAテスト完了:', report');
    
    return report;
};

console.log('[PWATestFramework] PWAテストフレームワーク読み込み完了'');