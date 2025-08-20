/**
 * StatisticsPerformance - Main Controller for statistics performance testing
 * Refactored to use the Main Controller Pattern with sub-components
 * 統計システムパフォーマンステスト
 * 大量データ処理時のパフォーマンステスト、メモリ使用量・処理時間・描画パフォーマンスのベンチマーク
 * パフォーマンス要件（統計収集<1ms、表示<500ms、更新<100ms）の検証テスト
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../mocks/MockFactory';
import { PerformanceTestUtils } from '../utils/PerformanceTestUtils';
import { performanceErrorRecovery } from '../utils/PerformanceErrorRecovery';

// Import sub-components
import { DataCollectionPerformanceTests } from './statistics-performance-tests/DataCollectionPerformanceTests';
import { AnalysisRenderingPerformanceTests } from './statistics-performance-tests/AnalysisRenderingPerformanceTests';
import { ExportMemoryOptimizationTests } from './statistics-performance-tests/ExportMemoryOptimizationTests';

// Export utility classes for compatibility
export { PerformanceMeasurement, DataGenerator, PerformanceTestHelper } from './statistics-performance-tests/PerformanceTestUtilities';

// 環境対応パフォーマンス設定を取得
const performanceConfig = PerformanceTestUtils.createPerformanceTestConfig();
const environmentThresholds = PerformanceTestUtils.getEnvironmentThresholds();

// MockFactoryからの標準化されたモック
const mockCanvas = MockFactory.createCanvasMock();
const mockGameEngine = MockFactory.createGameEngineMock();

describe('統計システムパフォーマンステスト', () => {
    let statisticsManager: any;
    let statisticsCollector: any;
    let statisticsAnalyzer: any;
    let chartRenderer: any;
    let statisticsExporter: any;
    let statisticsPerformanceOptimizer: any;
    
    // Test suite components
    let dataCollectionTests: any;
    let analysisRenderingTests: any;
    let exportMemoryOptimizationTests: any;

    beforeAll(async () => {
        // MockFactoryからの標準化されたモック適用
        const performanceMock = MockFactory.createPerformanceMock();
        const storageMock = MockFactory.createStorageMock();
        
        // グローバルAPIのモック設定
        if (typeof global !== 'undefined') {
            (global as any).performance = performanceMock;
            (global as any).localStorage = storageMock;
        }
        if (typeof window !== 'undefined') {
            window.performance = performanceMock;
            window.localStorage = storageMock;
        }

        // 必要なクラスをインポート
        try {
            const StatisticsManagerModule = await import('../../src/core/StatisticsManager.js');
            const StatisticsCollectorModule = await import('../../src/core/StatisticsCollector.js');
            const StatisticsAnalyzerModule = await import('../../src/core/StatisticsAnalyzer.js');
            const ChartRendererModule = await import('../../src/core/ChartRenderer.js');
            const StatisticsExporterModule = await import('../../src/core/StatisticsExporter.js');
            const StatisticsPerformanceOptimizerModule = await import('../../src/core/StatisticsPerformanceOptimizer.js');

            // インスタンス作成
            statisticsManager = new StatisticsManagerModule.StatisticsManager(mockGameEngine);
            statisticsCollector = new StatisticsCollectorModule.StatisticsCollector(statisticsManager);
            statisticsAnalyzer = new StatisticsAnalyzerModule.StatisticsAnalyzer(statisticsManager);
            chartRenderer = new ChartRendererModule.ChartRenderer(mockCanvas);
            statisticsExporter = new StatisticsExporterModule.StatisticsExporter(statisticsManager);
            statisticsPerformanceOptimizer = new StatisticsPerformanceOptimizerModule.StatisticsPerformanceOptimizer(statisticsManager);
        } catch (error) {
            console.error('Failed to import modules:', error);
        }
        
        // Create main test suite object for dependency injection
        const mainTestSuite = {
            statisticsManager,
            statisticsCollector,
            statisticsAnalyzer,
            chartRenderer,
            statisticsExporter,
            statisticsPerformanceOptimizer,
            mockCanvas,
            performanceConfig,
            environmentThresholds
        };
        
        // Initialize sub-components with dependency injection
        dataCollectionTests = new DataCollectionPerformanceTests(mainTestSuite);
        analysisRenderingTests = new AnalysisRenderingPerformanceTests(mainTestSuite);
        exportMemoryOptimizationTests = new ExportMemoryOptimizationTests(mainTestSuite);
        
        console.log('[StatisticsPerformance] Main test controller initialized successfully');
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        
        // 環境に応じたパフォーマンステスト準備
        await PerformanceTestUtils.waitForStableEnvironment(performanceConfig.stabilizationDelay);
        
        // Performance mock のリセット
        if (performance && typeof performance.now === 'function' && performance.now.mockReturnValue) {
            performance.now.mockReturnValue(Date.now());
        }
        
        // メモリ使用量の環境対応リセット
        if (performance && performance.memory) {
            const baseMemory = environmentThresholds.memoryUsage.max * 0.3; // ベースライン30%
            performance.memory.usedJSHeapSize = baseMemory;
        }
    });

    afterAll(() => {
        // クリーンアップ
        statisticsManager?.destroy();
        statisticsCollector?.destroy();
        statisticsAnalyzer?.destroy();
        chartRenderer?.destroy();
        statisticsExporter?.destroy();
        statisticsPerformanceOptimizer?.destroy();
        
        console.log('[StatisticsPerformance] Main test controller destroyed');
    });

    // Register all test suites using sub-components
    if (typeof dataCollectionTests !== 'undefined') {
        dataCollectionTests.registerTests();
    }
    
    if (typeof analysisRenderingTests !== 'undefined') {
        analysisRenderingTests.registerTests();
    }
    
    if (typeof exportMemoryOptimizationTests !== 'undefined') {
        exportMemoryOptimizationTests.registerTests();
    }
    
    // Legacy helper methods for backward compatibility
    /**
     * Get test suite components for advanced usage
     * @returns {Object} Component references
     */
    function getTestComponents() {
        return {
            dataCollection: dataCollectionTests,
            analysisRendering: analysisRenderingTests,
            exportMemoryOptimization: exportMemoryOptimizationTests,
            mainSuite: {
                statisticsManager,
                statisticsCollector,
                statisticsAnalyzer,
                chartRenderer,
                statisticsExporter,
                statisticsPerformanceOptimizer
            }
        };
    }
    
    /**
     * Configure test suite settings
     * @param {Object} config - Test configuration
     */
    function configureTestSuite(config {
        if (config.performanceConfig) {
            Object.assign(performanceConfig, config.performanceConfig);
        }
        
        if (config.environmentThresholds) {
            Object.assign(environmentThresholds, config.environmentThresholds);
        }
        
        console.log('[StatisticsPerformance] Test configuration updated');
    }
    
    /**
     * Get test suite status
     * @returns {Object} Test suite status
     */
    function getTestSuiteStatus() {
        return {
            initialized: true,
            componentCount: 3,
            components: {
                dataCollection: !!dataCollectionTests,
                analysisRendering: !!analysisRenderingTests,
                exportMemoryOptimization: !!exportMemoryOptimizationTests
            },
            performanceConfig,
            environmentThresholds
        };
    }
    
    // Make helper functions available globally for compatibility
    (global as any).getStatisticsPerformanceTestComponents = getTestComponents;
    (global as any).configureStatisticsPerformanceTestSuite = configureTestSuite;
    (global as any).getStatisticsPerformanceTestSuiteStatus = getTestSuiteStatus;
});

console.log('[StatisticsPerformance] Performance test suite loaded successfully');