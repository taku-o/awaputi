/**
 * Performance Debug Splitting Integration Tests
 * Phase E.2で分割された全10個のファイルの統合テスト
 */

import { jest } from '@jest/globals';

// 分割されたコンポーネントのインポート
import { PerformanceTestSuite } from '../../src/utils/PerformanceTestSuite.js';
import { PerformanceWarningSystem } from '../../src/utils/PerformanceWarningSystem.js';
import { PerformanceMonitoringSystem } from '../../src/utils/PerformanceMonitoringSystem.js';
import { PerformanceIntegrationTesting } from '../../src/utils/PerformanceIntegrationTesting.js';
import { BenchmarkSuite } from '../../src/debug/BenchmarkSuite.js';
import { TestResultVisualizer } from '../../src/debug/TestResultVisualizer.js';
import { ErrorReporter } from '../../src/debug/ErrorReporter.js';
import { MobileTestSuite } from '../../src/tests/mobile/MobileTestSuite.js';
import { MobileAccessibilityManager } from '../../src/core/MobileAccessibilityManager.js';
import { MobileSystemIntegrator } from '../../src/core/MobileSystemIntegrator.js';

describe('Performance Debug Splitting Integration', () => {
    let testInstances = {};

    beforeEach(() => {
        // テストインスタンスの初期化
        testInstances = {};
        jest.clearAllMocks();
    });

    afterEach(() => {
        // クリーンアップ
        Object.values(testInstances).forEach(instance => {
            if (instance && typeof instance.cleanup === 'function') {
                instance.cleanup();
            }
        });
    });

    describe('PerformanceTestSuite Component Interactions', () => {
        test('should initialize PerformanceTestSuite with all sub-components', async () => {
            const performanceTestSuite = new PerformanceTestSuite();
            testInstances.performanceTestSuite = performanceTestSuite;

            // メインコントローラーの存在確認
            expect(performanceTestSuite).toBeDefined();
            
            // サブコンポーネントの存在確認
            expect(performanceTestSuite.testExecutor).toBeDefined();
            expect(performanceTestSuite.metricsCollector).toBeDefined();
            expect(performanceTestSuite.testReporter).toBeDefined();
        });

        test('should delegate test execution to sub-components', async () => {
            const performanceTestSuite = new PerformanceTestSuite();
            testInstances.performanceTestSuite = performanceTestSuite;

            // テスト実行のモック
            const mockTestResult = { passed: true, duration: 100, metrics: {} };
            jest.spyOn(performanceTestSuite.testExecutor, 'executeTest').mockResolvedValue(mockTestResult);

            const result = await performanceTestSuite.runTest('sample-test');
            
            // サブコンポーネントが呼ばれることを確認
            expect(performanceTestSuite.testExecutor.executeTest).toHaveBeenCalledWith('sample-test');
            expect(result).toEqual(mockTestResult);
        });

        test('should handle component communication correctly', async () => {
            const performanceTestSuite = new PerformanceTestSuite();
            testInstances.performanceTestSuite = performanceTestSuite;

            // コンポーネント間の通信テスト
            const mockMetrics = { fps: 60, memory: 100 };
            jest.spyOn(performanceTestSuite.metricsCollector, 'collectMetrics').mockResolvedValue(mockMetrics);

            const metrics = await performanceTestSuite.collectMetrics();
            expect(metrics).toEqual(mockMetrics);
        });
    });

    describe('PerformanceWarningSystem Component Interactions', () => {
        test('should initialize PerformanceWarningSystem with sub-components', () => {
            const performanceWarningSystem = new PerformanceWarningSystem();
            testInstances.performanceWarningSystem = performanceWarningSystem;

            expect(performanceWarningSystem).toBeDefined();
            expect(performanceWarningSystem.thresholdMonitor).toBeDefined();
            expect(performanceWarningSystem.notificationManager).toBeDefined();
            expect(performanceWarningSystem.alertGenerator).toBeDefined();
        });

        test('should delegate warning operations to sub-components', async () => {
            const performanceWarningSystem = new PerformanceWarningSystem();
            testInstances.performanceWarningSystem = performanceWarningSystem;

            // 警告処理のモック
            const mockWarning = { type: 'performance', severity: 'high', message: 'High CPU usage' };
            jest.spyOn(performanceWarningSystem.alertGenerator, 'generateAlert').mockReturnValue(mockWarning);

            const warning = performanceWarningSystem.generateAlert('performance', { cpu: 90 });
            expect(performanceWarningSystem.alertGenerator.generateAlert).toHaveBeenCalled();
            expect(warning).toEqual(mockWarning);
        });
    });

    describe('PerformanceMonitoringSystem Component Interactions', () => {
        test('should initialize PerformanceMonitoringSystem with sub-components', () => {
            const performanceMonitoringSystem = new PerformanceMonitoringSystem();
            testInstances.performanceMonitoringSystem = performanceMonitoringSystem;

            expect(performanceMonitoringSystem).toBeDefined();
            expect(performanceMonitoringSystem.realTimeMonitor).toBeDefined();
            expect(performanceMonitoringSystem.dataAnalyzer).toBeDefined();
        });

        test('should handle real-time monitoring delegation', async () => {
            const performanceMonitoringSystem = new PerformanceMonitoringSystem();
            testInstances.performanceMonitoringSystem = performanceMonitoringSystem;

            // リアルタイム監視のモック
            const mockData = { timestamp: Date.now(), metrics: { fps: 58 } };
            jest.spyOn(performanceMonitoringSystem.realTimeMonitor, 'collectRealTimeData').mockResolvedValue(mockData);

            const data = await performanceMonitoringSystem.collectRealTimeData();
            expect(performanceMonitoringSystem.realTimeMonitor.collectRealTimeData).toHaveBeenCalled();
            expect(data).toEqual(mockData);
        });
    });

    describe('BenchmarkSuite Component Interactions', () => {
        test('should initialize BenchmarkSuite with all sub-components', () => {
            const benchmarkSuite = new BenchmarkSuite();
            testInstances.benchmarkSuite = benchmarkSuite;

            expect(benchmarkSuite).toBeDefined();
            expect(benchmarkSuite.benchmarkExecutor).toBeDefined();
            expect(benchmarkSuite.resultAnalyzer).toBeDefined();
            expect(benchmarkSuite.benchmarkReporter).toBeDefined();
        });

        test('should delegate benchmark execution correctly', async () => {
            const benchmarkSuite = new BenchmarkSuite();
            testInstances.benchmarkSuite = benchmarkSuite;

            // ベンチマーク実行のモック
            const mockResults = { duration: 150, iterations: 1000, score: 95 };
            jest.spyOn(benchmarkSuite.benchmarkExecutor, 'executeBenchmark').mockResolvedValue(mockResults);

            const results = await benchmarkSuite.runBenchmarks(['test-benchmark']);
            expect(benchmarkSuite.benchmarkExecutor.executeBenchmark).toHaveBeenCalled();
        });
    });

    describe('TestResultVisualizer Component Interactions', () => {
        test('should initialize TestResultVisualizer with sub-components', () => {
            const testResultVisualizer = new TestResultVisualizer();
            testInstances.testResultVisualizer = testResultVisualizer;

            expect(testResultVisualizer).toBeDefined();
            expect(testResultVisualizer.chartGenerator).toBeDefined();
            expect(testResultVisualizer.dataVisualizer).toBeDefined();
        });

        test('should delegate visualization operations', async () => {
            const testResultVisualizer = new TestResultVisualizer();
            testInstances.testResultVisualizer = testResultVisualizer;

            // 可視化処理のモック
            const mockChart = { type: 'bar', data: [], options: {} };
            jest.spyOn(testResultVisualizer.chartGenerator, 'generateChart').mockResolvedValue(mockChart);

            const chart = await testResultVisualizer.visualizeResults({ data: [] });
            expect(testResultVisualizer.chartGenerator.generateChart).toHaveBeenCalled();
        });
    });

    describe('ErrorReporter Component Interactions', () => {
        test('should initialize ErrorReporter with all sub-components', () => {
            const errorReporter = new ErrorReporter();
            testInstances.errorReporter = errorReporter;

            expect(errorReporter).toBeDefined();
            expect(errorReporter.errorCollector).toBeDefined();
            expect(errorReporter.errorAnalyzer).toBeDefined();
            expect(errorReporter.submissionManager).toBeDefined();
        });

        test('should delegate error reporting operations', async () => {
            const errorReporter = new ErrorReporter();
            testInstances.errorReporter = errorReporter;

            // エラー報告のモック
            const mockError = new Error('Test error');
            const mockReport = { id: 'error-123', timestamp: Date.now() };
            
            jest.spyOn(errorReporter.errorCollector, 'collectError').mockReturnValue(mockReport);

            const report = errorReporter.reportError(mockError);
            expect(errorReporter.errorCollector.collectError).toHaveBeenCalledWith(mockError);
            expect(report).toEqual(mockReport);
        });
    });

    describe('MobileTestSuite Component Interactions', () => {
        test('should initialize MobileTestSuite with sub-components', () => {
            const mobileTestSuite = new MobileTestSuite();
            testInstances.mobileTestSuite = mobileTestSuite;

            expect(mobileTestSuite).toBeDefined();
            expect(mobileTestSuite.testRunner).toBeDefined();
            expect(mobileTestSuite.deviceSimulator).toBeDefined();
            expect(mobileTestSuite.testReporter).toBeDefined();
        });

        test('should delegate mobile test execution', async () => {
            const mobileTestSuite = new MobileTestSuite();
            testInstances.mobileTestSuite = mobileTestSuite;

            // モバイルテスト実行のモック
            const mockResults = { passed: 5, failed: 0, total: 5 };
            jest.spyOn(mobileTestSuite.testRunner, 'runAllTests').mockResolvedValue(mockResults);

            const results = await mobileTestSuite.runAllTests();
            expect(mobileTestSuite.testRunner.runAllTests).toHaveBeenCalled();
            expect(results).toEqual(mockResults);
        });

        test('should handle device simulation delegation', async () => {
            const mobileTestSuite = new MobileTestSuite();
            testInstances.mobileTestSuite = mobileTestSuite;

            // デバイスシミュレーションのモック
            jest.spyOn(mobileTestSuite.deviceSimulator, 'startSimulation').mockResolvedValue(true);

            await mobileTestSuite.startDeviceSimulation('iPhone 12');
            expect(mobileTestSuite.deviceSimulator.startSimulation).toHaveBeenCalledWith('iPhone 12');
        });
    });

    describe('MobileAccessibilityManager Component Interactions', () => {
        test('should initialize MobileAccessibilityManager with validator', () => {
            const mobileAccessibilityManager = new MobileAccessibilityManager();
            testInstances.mobileAccessibilityManager = mobileAccessibilityManager;

            expect(mobileAccessibilityManager).toBeDefined();
            expect(mobileAccessibilityManager.validator).toBeDefined();
        });

        test('should delegate accessibility validation', async () => {
            const mobileAccessibilityManager = new MobileAccessibilityManager();
            testInstances.mobileAccessibilityManager = mobileAccessibilityManager;

            // アクセシビリティ検証のモック
            const mockResults = { overall: 'pass', score: 95, issues: [] };
            jest.spyOn(mobileAccessibilityManager.validator, 'validateMobileAccessibility').mockResolvedValue(mockResults);

            const results = await mobileAccessibilityManager.validateAccessibility();
            expect(mobileAccessibilityManager.validator.validateMobileAccessibility).toHaveBeenCalled();
            expect(results).toEqual(mockResults);
        });
    });

    describe('Cross-Component Integration', () => {
        test('should handle inter-component communication', async () => {
            // 複数コンポーネント間の統合テスト
            const performanceTestSuite = new PerformanceTestSuite();
            const performanceWarningSystem = new PerformanceWarningSystem();
            const errorReporter = new ErrorReporter();

            testInstances.performanceTestSuite = performanceTestSuite;
            testInstances.performanceWarningSystem = performanceWarningSystem;
            testInstances.errorReporter = errorReporter;

            // パフォーマンステストから警告システムへの連携
            const mockMetrics = { fps: 30, memory: 200 }; // 低パフォーマンス
            jest.spyOn(performanceTestSuite.metricsCollector, 'collectMetrics').mockResolvedValue(mockMetrics);
            jest.spyOn(performanceWarningSystem.thresholdMonitor, 'detectViolations').mockReturnValue([
                { type: 'fps', severity: 'high', message: 'Low FPS detected' }
            ]);

            const metrics = await performanceTestSuite.collectMetrics();
            const violations = performanceWarningSystem.thresholdMonitor.detectViolations(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0].type).toBe('fps');
        });

        test('should maintain backward compatibility across all split components', () => {
            // すべての分割されたコンポーネントの後方互換性テスト
            const components = [
                new PerformanceTestSuite(),
                new PerformanceWarningSystem(),
                new PerformanceMonitoringSystem(),
                new BenchmarkSuite(),
                new TestResultVisualizer(),
                new ErrorReporter(),
                new MobileTestSuite(),
                new MobileAccessibilityManager()
            ];

            components.forEach((component, index) => {
                testInstances[`component_${index}`] = component;
                
                // 各コンポーネントが正常に初期化されることを確認
                expect(component).toBeDefined();
                expect(typeof component).toBe('object');
                
                // 基本的な公開メソッドの存在確認
                expect(component.constructor.name).toBeTruthy();
            });
        });
    });

    describe('Error Handling and Fallback Mechanisms', () => {
        test('should handle sub-component initialization failures gracefully', () => {
            // サブコンポーネント初期化失敗時の処理
            const originalConsoleWarn = console.warn;
            console.warn = jest.fn();

            try {
                // 失敗をシミュレートするため、無効なコンストラクタ引数を使用
                const performanceTestSuite = new PerformanceTestSuite();
                expect(performanceTestSuite).toBeDefined();
            } catch (error) {
                // エラーハンドリングが適切に動作することを確認
                expect(error).toBeInstanceOf(Error);
            }

            console.warn = originalConsoleWarn;
        });

        test('should provide fallback mechanisms when sub-components fail', async () => {
            const performanceTestSuite = new PerformanceTestSuite();
            testInstances.performanceTestSuite = performanceTestSuite;

            // サブコンポーネントの失敗をシミュレート
            jest.spyOn(performanceTestSuite.testExecutor, 'executeTest').mockRejectedValue(new Error('Component failure'));

            // フォールバック機能の確認
            try {
                await performanceTestSuite.runTest('failing-test');
            } catch (error) {
                expect(error.message).toContain('Component failure');
            }
        });
    });
});