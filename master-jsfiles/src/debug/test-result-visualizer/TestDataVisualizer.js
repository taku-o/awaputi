/**
 * TestDataVisualizer - Data visualization component
 * Handles data processing, formatting and visual representation for test results
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class TestDataVisualizer {
    constructor(testResultVisualizer) {
        this.testResultVisualizer = testResultVisualizer;
        this.errorHandler = getErrorHandler();
        
        // Visualization configuration
        this.visualizationConfig = {
            dateFormats: {
                time: 'HH:mm:ss',
                date: 'MM/dd',
                full: 'yyyy-MM-dd HH:mm:ss'
            },
            defaultMetrics: ['executionTime', 'passed', 'failed', 'skipped'],
            colorSchemes: {
                status: {
                    passed: '#28a745',
                    failed: '#dc3545',
                    warning: '#ffc107',
                    skipped: '#6c757d'
                },
                quality: {
                    excellent: '#28a745',
                    good: '#28a745',
                    average: '#ffc107',
                    poor: '#fd7e14',
                    critical: '#dc3545'
                }
            }
        };
        
        // Data processing cache
        this.dataCache = new Map();
        this.processedData = new Map();
        
        console.log('[TestDataVisualizer] Data visualization component initialized');
    }
    
    /**
     * Visualize test results with multiple representation formats
     * @param {object} results - Test results data
     * @param {object} options - Visualization options
     * @returns {object} Visualization data
     */
    visualizeResults(results, options = {}) {
        try {
            const visualizationData = {
                timestamp: Date.now(),
                summary: this.generateSummaryVisualization(results),
                performance: this.generatePerformanceVisualization(results),
                trends: this.generateTrendsVisualization(results),
                details: this.generateDetailsVisualization(results),
                coverage: this.generateCoverageVisualization(results),
                quality: this.generateQualityVisualization(results)
            };
            
            // Cache processed data
            this.dataCache.set(`visualization_${results.timestamp || Date.now()}`, visualizationData);
            
            return visualizationData;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'TestDataVisualizer.visualizeResults'
            });
            
            return {
                timestamp: Date.now(),
                error: error.message,
                summary: this.getEmptyVisualization()
            };
        }
    }
    
    /**
     * Generate summary visualization data
     * @param {object} results - Test results
     * @returns {object} Summary visualization
     */
    generateSummaryVisualization(results) {
        const summary = {
            totalTests: (results.results?.passed || 0) + (results.results?.failed || 0) + (results.results?.skipped || 0),
            passedTests: results.results?.passed || 0,
            failedTests: results.results?.failed || 0,
            skippedTests: results.results?.skipped || 0,
            successRate: 0,
            qualityScore: 0,
            executionTime: results.results?.executionTime || 0,
            regressions: results.summary?.performance?.regressions?.length || 0,
            improvements: results.summary?.performance?.improvements?.length || 0
        };
        
        // Calculate success rate
        const totalExecuted = summary.passedTests + summary.failedTests;
        if (totalExecuted > 0) {
            summary.successRate = (summary.passedTests / totalExecuted) * 100;
        }
        
        // Calculate quality score
        summary.qualityScore = this.calculateQualityScore(results);
        
        return {
            metrics: summary,
            chartData: this.prepareSummaryChartData(summary),
            status: this.determineOverallStatus(summary),
            recommendations: this.generateSummaryRecommendations(summary)
        };
    }
    
    /**
     * Generate performance visualization data
     * @param {object} results - Test results
     * @returns {object} Performance visualization
     */
    generatePerformanceVisualization(results) {
        const benchmarks = results.benchmarks || [];
        
        const performanceData = {
            executionTimeMetrics: this.analyzeExecutionTimes(benchmarks),
            categoryPerformance: this.analyzeCategoryPerformance(results),
            benchmarkResults: this.formatBenchmarkResults(benchmarks),
            performanceHistory: this.getPerformanceHistory(),
            bottlenecks: this.identifyBottlenecks(benchmarks),
            optimizations: this.suggestOptimizations(benchmarks)
        };
        
        return {
            data: performanceData,
            chartData: this.preparePerformanceChartData(performanceData),
            insights: this.generatePerformanceInsights(performanceData)
        };
    }
    
    /**
     * Generate trends visualization data
     * @param {object} results - Test results
     * @returns {object} Trends visualization
     */
    generateTrendsVisualization(results) {
        const history = this.testResultVisualizer.testSupportTools?.getTestHistory(20) || [];
        
        const trendsData = {
            successRateTrend: this.analyzeSuccessRateTrend(history),
            executionTimeTrend: this.analyzeExecutionTimeTrend(history),
            categoryTrends: this.analyzeCategoryTrends(history),
            regressionTrends: this.analyzeRegressionTrends(history),
            stabilityMetrics: this.calculateStabilityMetrics(history)
        };
        
        return {
            data: trendsData,
            chartData: this.prepareTrendsChartData(trendsData),
            analysis: this.generateTrendsAnalysis(trendsData),
            predictions: this.generateTrendPredictions(trendsData)
        };
    }
    
    /**
     * Generate details visualization data
     * @param {object} results - Test results
     * @returns {object} Details visualization
     */
    generateDetailsVisualization(results) {
        const testResults = results.results?.results || [];
        
        const detailsData = {
            testCases: this.formatTestCaseDetails(testResults),
            categories: this.groupTestsByCategory(testResults),
            failures: this.analyzeFailures(testResults),
            performance: this.analyzeTestPerformance(testResults),
            filters: this.generateFilterOptions(testResults)
        };
        
        return {
            data: detailsData,
            tableData: this.prepareDetailsTableData(detailsData),
            filterOptions: detailsData.filters,
            statistics: this.generateDetailsStatistics(detailsData)
        };
    }
    
    /**
     * Generate coverage visualization data
     * @param {object} results - Test results
     * @returns {object} Coverage visualization
     */
    generateCoverageVisualization(results) {
        // Mock coverage data - in real implementation, this would come from coverage tools
        const coverageData = {
            overall: 79.8,
            components: [
                { name: 'GameEngine', coverage: 85, lines: 340, coveredLines: 289 },
                { name: 'BubbleManager', coverage: 92, lines: 156, coveredLines: 143 },
                { name: 'ScoreManager', coverage: 78, lines: 89, coveredLines: 69 },
                { name: 'InputManager', coverage: 88, lines: 67, coveredLines: 59 },
                { name: 'AudioManager', coverage: 65, lines: 123, coveredLines: 80 },
                { name: 'EffectManager', coverage: 71, lines: 234, coveredLines: 166 }
            ],
            gaps: this.identifyCoverageGaps(),
            recommendations: this.generateCoverageRecommendations()
        };
        
        return {
            data: coverageData,
            chartData: this.prepareCoverageChartData(coverageData),
            analysis: this.generateCoverageAnalysis(coverageData)
        };
    }
    
    /**
     * Generate quality visualization data
     * @param {object} results - Test results
     * @returns {object} Quality visualization
     */
    generateQualityVisualization(results) {
        const qualityMetrics = {
            overallScore: this.calculateQualityScore(results),
            reliability: this.calculateReliabilityScore(results),
            performance: this.calculatePerformanceScore(results),
            maintainability: this.calculateMaintainabilityScore(results),
            testCoverage: 79.8, // From coverage data
            codeQuality: this.calculateCodeQualityScore(results)
        };
        
        return {
            metrics: qualityMetrics,
            chartData: this.prepareQualityChartData(qualityMetrics),
            insights: this.generateQualityInsights(qualityMetrics),
            improvements: this.suggestQualityImprovements(qualityMetrics)
        };
    }
    
    /**
     * Calculate overall quality score
     * @param {object} results - Test results
     * @returns {number} Quality score (0-100)
     */
    calculateQualityScore(results) {
        const totalTests = (results.results?.passed || 0) + (results.results?.failed || 0);
        if (totalTests === 0) return 0;
        
        const successRate = (results.results?.passed || 0) / totalTests;
        const performanceScore = Math.max(0, (results.summary?.performance?.improvements?.length || 0) - 
                                           (results.summary?.performance?.regressions?.length || 0));
        const speedScore = Math.min(100, 10000 / (results.results?.executionTime || 10000));
        
        const overallScore = (successRate * 60) + 
                           (Math.min(10, Math.max(-10, performanceScore)) * 2) + 
                           (speedScore * 0.3);
        
        return Math.max(0, Math.min(100, Math.round(overallScore)));
    }
    
    /**
     * Prepare summary chart data
     * @param {object} summary - Summary metrics
     * @returns {object} Chart data
     */
    prepareSummaryChartData(summary) {
        return {
            pieChart: {
                data: [
                    { label: 'Passed', value: summary.passedTests, color: this.visualizationConfig.colorSchemes.status.passed },
                    { label: 'Failed', value: summary.failedTests, color: this.visualizationConfig.colorSchemes.status.failed },
                    { label: 'Skipped', value: summary.skippedTests, color: this.visualizationConfig.colorSchemes.status.skipped }
                ]
            },
            qualityGauge: {
                value: summary.qualityScore,
                color: this.getQualityColor(summary.qualityScore),
                ranges: [
                    { min: 0, max: 40, color: this.visualizationConfig.colorSchemes.quality.critical },
                    { min: 40, max: 60, color: this.visualizationConfig.colorSchemes.quality.poor },
                    { min: 60, max: 80, color: this.visualizationConfig.colorSchemes.quality.average },
                    { min: 80, max: 100, color: this.visualizationConfig.colorSchemes.quality.excellent }
                ]
            }
        };
    }
    
    /**
     * Format benchmark results for visualization
     * @param {Array} benchmarks - Benchmark results
     * @returns {Array} Formatted benchmark data
     */
    formatBenchmarkResults(benchmarks) {
        return benchmarks.map(benchmark => ({
            name: benchmark.name,
            category: benchmark.category || 'unknown',
            success: benchmark.success,
            executionTime: benchmark.executionTime || 0,
            score: benchmark.score || 0,
            status: this.determineBenchmarkStatus(benchmark),
            statusColor: this.getBenchmarkStatusColor(benchmark),
            keyMetrics: this.extractKeyMetrics(benchmark),
            comparison: benchmark.comparison ? {
                score: benchmark.comparison.overallScore || 0,
                status: benchmark.comparison.status || 'unknown',
                color: this.getComparisonColor(benchmark.comparison.overallScore || 0)
            } : null
        }));
    }
    
    /**
     * Format test case details for visualization
     * @param {Array} testResults - Test results
     * @returns {Array} Formatted test case data
     */
    formatTestCaseDetails(testResults) {
        return testResults.map(test => ({
            name: test.name,
            category: test.category || 'unknown',
            status: this.getTestStatus(test),
            statusIcon: this.getStatusIcon(test),
            statusColor: this.getTestStatusColor(test),
            executionTime: test.executionTime || 0,
            score: test.score || 0,
            error: test.error ? {
                message: test.error.message,
                type: test.error.constructor.name,
                stack: test.error.stack
            } : null,
            details: test.details || 'No additional details available'
        }));
    }
    
    /**
     * Analyze execution time trends
     * @param {Array} history - Test history
     * @returns {object} Execution time analysis
     */
    analyzeExecutionTimeTrend(history) {
        if (history.length < 2) {
            return { trend: 'stable', change: 0, data: [] };
        }
        
        const timeData = history.map((session, index) => ({
            x: index,
            y: session.executionTime || 0,
            timestamp: session.timestamp,
            label: new Date(session.timestamp).toLocaleDateString()
        }));
        
        const recent = timeData.slice(-3);
        const older = timeData.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, point) => sum + point.y, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, point) => sum + point.y, 0) / older.length : recentAvg;
        
        const change = recentAvg - olderAvg;
        const trend = change < -100 ? 'improving' : change > 100 ? 'declining' : 'stable';
        
        return {
            trend,
            change,
            data: timeData,
            recentAverage: recentAvg,
            olderAverage: olderAvg,
            changePercent: olderAvg > 0 ? (change / olderAvg) * 100 : 0
        };
    }
    
    /**
     * Analyze success rate trends
     * @param {Array} history - Test history
     * @returns {object} Success rate analysis
     */
    analyzeSuccessRateTrend(history) {
        if (history.length < 2) {
            return { trend: 'stable', change: 0, data: [] };
        }
        
        const successData = history.map((session, index) => {
            const total = (session.results?.passed || 0) + (session.results?.failed || 0);
            const successRate = total > 0 ? ((session.results?.passed || 0) / total) * 100 : 0;
            
            return {
                x: index,
                y: successRate,
                timestamp: session.timestamp,
                label: new Date(session.timestamp).toLocaleDateString()
            };
        });
        
        const recent = successData.slice(-3);
        const older = successData.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, point) => sum + point.y, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, point) => sum + point.y, 0) / older.length : recentAvg;
        
        const change = recentAvg - olderAvg;
        const trend = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
        
        return {
            trend,
            change,
            data: successData,
            currentRate: recentAvg,
            previousRate: olderAvg
        };
    }
    
    /**
     * Get test status
     * @param {object} test - Test result
     * @returns {string} Status
     */
    getTestStatus(test) {
        if (test.passed && !test.failed) return 'passed';
        if (!test.passed && test.failed) return 'failed';
        if (test.skipped) return 'skipped';
        return 'warning';
    }
    
    /**
     * Get status icon for test
     * @param {object} test - Test result
     * @returns {string} Icon
     */
    getStatusIcon(test) {
        const status = this.getTestStatus(test);
        const icons = {
            passed: '✅',
            failed: '❌',
            warning: '⚠️',
            skipped: '⏭️'
        };
        return icons[status] || '❓';
    }
    
    /**
     * Get status color for test
     * @param {object} test - Test result
     * @returns {string} Color
     */
    getTestStatusColor(test) {
        const status = this.getTestStatus(test);
        return this.visualizationConfig.colorSchemes.status[status] || '#6c757d';
    }
    
    /**
     * Get quality score color
     * @param {number} score - Quality score
     * @returns {string} Color
     */
    getQualityColor(score) {
        if (score >= 80) return this.visualizationConfig.colorSchemes.quality.excellent;
        if (score >= 60) return this.visualizationConfig.colorSchemes.quality.average;
        if (score >= 40) return this.visualizationConfig.colorSchemes.quality.poor;
        return this.visualizationConfig.colorSchemes.quality.critical;
    }
    
    /**
     * Determine benchmark status
     * @param {object} benchmark - Benchmark result
     * @returns {string} Status
     */
    determineBenchmarkStatus(benchmark) {
        if (!benchmark.success) return 'failed';
        if (benchmark.comparison?.status === 'fail') return 'failed';
        if (benchmark.comparison?.status === 'warning') return 'warning';
        return 'passed';
    }
    
    /**
     * Get benchmark status color
     * @param {object} benchmark - Benchmark result
     * @returns {string} Color
     */
    getBenchmarkStatusColor(benchmark) {
        const status = this.determineBenchmarkStatus(benchmark);
        return this.visualizationConfig.colorSchemes.status[status] || '#6c757d';
    }
    
    /**
     * Get comparison color based on score
     * @param {number} score - Comparison score
     * @returns {string} Color
     */
    getComparisonColor(score) {
        if (score >= 100) return this.visualizationConfig.colorSchemes.status.passed;
        if (score >= 80) return this.visualizationConfig.colorSchemes.status.warning;
        return this.visualizationConfig.colorSchemes.status.failed;
    }
    
    /**
     * Extract key metrics from benchmark
     * @param {object} benchmark - Benchmark result
     * @returns {object} Key metrics
     */
    extractKeyMetrics(benchmark) {
        const keyMetrics = {};
        ['fps', 'avgFrameTime', 'avgUpdateTime', 'avgLatency', 'stabilityScore', 'memoryUsage']
            .forEach(key => {
                if (benchmark[key] !== undefined) {
                    keyMetrics[key] = benchmark[key];
                }
            });
        return keyMetrics;
    }
    
    /**
     * Get empty visualization structure
     * @returns {object} Empty visualization
     */
    getEmptyVisualization() {
        return {
            metrics: { totalTests: 0, passedTests: 0, failedTests: 0, skippedTests: 0, successRate: 0, qualityScore: 0 },
            chartData: { pieChart: { data: [] }, qualityGauge: { value: 0, color: '#6c757d' } },
            status: 'no_data',
            recommendations: ['Run tests to generate visualization data']
        };
    }
    
    /**
     * Configure visualization parameters
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.visualizationConfig, config);
        console.log('[TestDataVisualizer] Configuration updated');
    }
    
    /**
     * Clear visualization cache
     */
    clearCache() {
        this.dataCache.clear();
        this.processedData.clear();
        console.log('[TestDataVisualizer] Visualization cache cleared');
    }
    
    /**
     * Cleanup data visualizer resources
     */
    destroy() {
        this.dataCache.clear();
        this.processedData.clear();
        console.log('[TestDataVisualizer] Data visualizer destroyed');
    }
}