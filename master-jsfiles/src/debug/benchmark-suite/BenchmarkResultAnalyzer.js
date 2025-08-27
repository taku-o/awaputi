/**
 * BenchmarkResultAnalyzer - Result analysis component
 * Handles statistical analysis, regression detection and performance comparison
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class BenchmarkResultAnalyzer {
    constructor(benchmarkSuite) {
        this.benchmarkSuite = benchmarkSuite;
        this.errorHandler = getErrorHandler();
        
        // Analysis configuration
        this.analysisConfig = {
            regressionThresholds: {
                warning: 1.1,   // 10% degradation
                critical: 1.2   // 20% degradation
            },
            improvementThreshold: 0.9, // 10% improvement
            statisticalSignificance: 0.05, // 5%
            minSamplesForComparison: 3
        };
        
        // Analysis cache
        this.analysisCache = new Map();
        this.comparisonHistory = [];
        
        console.log('[BenchmarkResultAnalyzer] Result analysis component initialized');
    }
    
    /**
     * Analyze benchmark results with statistical methods
     * @param {object} results - Benchmark results
     * @returns {object} Analysis results
     */
    analyzeResults(results) {
        try {
            const analysis = {
                timestamp: Date.now(),
                summary: this.generateResultsSummary(results),
                categories: this.analyzeCategoriesPerformance(results),
                trends: this.analyzeTrends(results),
                outliers: this.detectOutliers(results),
                regressions: this.detectRegressions(results),
                improvements: this.detectImprovements(results),
                recommendations: this.generateAnalysisRecommendations(results)
            };
            
            // Cache analysis results
            this.analysisCache.set(results.timestamp || Date.now(), analysis);
            
            return analysis;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BenchmarkResultAnalyzer.analyzeResults'
            });
            
            return {
                timestamp: Date.now(),
                error: error.message,
                summary: { total: 0, passed: 0, failed: 0 }
            };
        }
    }
    
    /**
     * Compare benchmark results with baseline
     * @param {string} benchmarkName - Benchmark name
     * @param {object} currentResult - Current benchmark result
     * @param {object} baseline - Baseline result
     * @returns {object} Comparison result
     */
    compareWithBaseline(benchmarkName, currentResult, baseline) {
        if (!baseline) {
            return { status: 'no_baseline' };
        }
        
        try {
            const comparison = {
                benchmarkName,
                baseline: baseline,
                current: currentResult,
                status: 'pass',
                details: {},
                overallScore: 100,
                timestamp: Date.now()
            };
            
            let totalScore = 0;
            let criteriaCount = 0;
            
            // Compare each metric in baseline
            Object.entries(baseline).forEach(([metric, baselineValue]) => {
                if (currentResult[metric] !== undefined && typeof baselineValue === 'number') {
                    const currentValue = currentResult[metric];
                    const comparison = this.compareMetric(metric, currentValue, baselineValue);
                    
                    comparison.details[metric] = comparison;
                    totalScore += comparison.score;
                    criteriaCount++;
                    
                    if (comparison.status === 'fail') {
                        comparison.status = 'fail';
                    } else if (comparison.status === 'warning' && comparison.status !== 'fail') {
                        comparison.status = 'warning';
                    }
                }
            });
            
            comparison.overallScore = criteriaCount > 0 ? totalScore / criteriaCount : 100;
            
            // Store comparison in history
            this.comparisonHistory.push(comparison);
            
            return comparison;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BenchmarkResultAnalyzer.compareWithBaseline',
                benchmarkName
            });
            
            return {
                status: 'error',
                error: error.message,
                benchmarkName,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Compare individual metric with baseline
     * @param {string} metric - Metric name
     * @param {number} currentValue - Current value
     * @param {number} baselineValue - Baseline value
     * @returns {object} Metric comparison
     */
    compareMetric(metric, currentValue, baselineValue) {
        const ratio = currentValue / baselineValue;
        let score = 100;
        let status = 'pass';
        let interpretation = 'within_expected_range';
        
        // Determine metric type and evaluation criteria
        const metricType = this.determineMetricType(metric);
        
        switch (metricType) {
            case 'time': // Lower is better
                if (ratio > this.analysisConfig.regressionThresholds.critical) {
                    status = 'fail';
                    score = Math.max(0, 100 - (ratio - 1) * 100);
                    interpretation = 'significant_degradation';
                } else if (ratio > this.analysisConfig.regressionThresholds.warning) {
                    status = 'warning';
                    score = Math.max(50, 100 - (ratio - 1) * 200);
                    interpretation = 'minor_degradation';
                } else if (ratio < this.analysisConfig.improvementThreshold) {
                    interpretation = 'improvement';
                    score = Math.min(110, 100 + (1 - ratio) * 50);
                }
                break;
                
            case 'rate': // Higher is better
                if (ratio < (1 / this.analysisConfig.regressionThresholds.critical)) {
                    status = 'fail';
                    score = Math.max(0, ratio * 100);
                    interpretation = 'significant_degradation';
                } else if (ratio < (1 / this.analysisConfig.regressionThresholds.warning)) {
                    status = 'warning';
                    score = Math.max(50, ratio * 100);
                    interpretation = 'minor_degradation';
                } else if (ratio > (1 / this.analysisConfig.improvementThreshold)) {
                    interpretation = 'improvement';
                    score = Math.min(110, ratio * 100);
                }
                break;
                
            case 'memory': // Lower is generally better
                if (ratio > this.analysisConfig.regressionThresholds.critical * 1.5) {
                    status = 'fail';
                    score = Math.max(0, 100 - (ratio - 1) * 50);
                    interpretation = 'memory_leak_suspected';
                } else if (ratio > this.analysisConfig.regressionThresholds.warning * 1.3) {
                    status = 'warning';
                    score = Math.max(50, 100 - (ratio - 1) * 100);
                    interpretation = 'increased_memory_usage';
                }
                break;
                
            case 'count': // Context dependent
                const threshold = metric.includes('error') || metric.includes('fail') ? 0.5 : 1.2;
                if (ratio > threshold) {
                    status = ratio > threshold * 2 ? 'fail' : 'warning';
                    score = Math.max(0, 100 - (ratio - 1) * 100);
                    interpretation = 'count_increase';
                }
                break;
        }
        
        return {
            metric,
            baseline: baselineValue,
            current: currentValue,
            ratio,
            score,
            status,
            interpretation,
            metricType,
            changePercent: ((ratio - 1) * 100).toFixed(1)
        };
    }
    
    /**
     * Determine metric type for evaluation
     * @param {string} metric - Metric name
     * @returns {string} Metric type
     */
    determineMetricType(metric) {
        const lowerMetric = metric.toLowerCase();
        
        if (lowerMetric.includes('time') || lowerMetric.includes('latency') || lowerMetric.includes('duration')) {
            return 'time';
        }
        if (lowerMetric.includes('fps') || lowerMetric.includes('rate') || lowerMetric.includes('throughput')) {
            return 'rate';
        }
        if (lowerMetric.includes('memory') || lowerMetric.includes('usage') || lowerMetric.includes('size')) {
            return 'memory';
        }
        if (lowerMetric.includes('count') || lowerMetric.includes('number') || lowerMetric.includes('total')) {
            return 'count';
        }
        
        return 'generic';
    }
    
    /**
     * Generate comprehensive results summary
     * @param {object} results - Benchmark results
     * @returns {object} Results summary
     */
    generateResultsSummary(results) {
        const summary = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            categories: {},
            performance: {
                avgExecutionTime: 0,
                totalExecutionTime: results.totalExecutionTime || 0,
                regressions: [],
                improvements: [],
                criticalIssues: []
            }
        };
        
        if (!results.results) {
            return summary;
        }
        
        const benchmarkResults = Object.entries(results.results);
        summary.total = benchmarkResults.length;
        
        let totalExecutionTime = 0;
        
        benchmarkResults.forEach(([name, result]) => {
            const category = result.benchmark?.category || 'other';
            
            if (!summary.categories[category]) {
                summary.categories[category] = { passed: 0, failed: 0, warnings: 0, total: 0 };
            }
            summary.categories[category].total++;
            
            if (result.success) {
                if (result.comparison?.status === 'fail') {
                    summary.failed++;
                    summary.categories[category].failed++;
                    summary.performance.regressions.push(name);
                    
                    if (result.comparison?.overallScore < 50) {
                        summary.performance.criticalIssues.push(name);
                    }
                } else if (result.comparison?.status === 'warning') {
                    summary.warnings++;
                    summary.categories[category].warnings++;
                } else {
                    summary.passed++;
                    summary.categories[category].passed++;
                    
                    if (result.comparison?.overallScore > 110) {
                        summary.performance.improvements.push(name);
                    }
                }
            } else {
                summary.failed++;
                summary.categories[category].failed++;
                summary.performance.criticalIssues.push(name);
            }
            
            totalExecutionTime += result.executionTime || 0;
        });
        
        summary.performance.avgExecutionTime = summary.total > 0 ? totalExecutionTime / summary.total : 0;
        summary.performance.totalExecutionTime = totalExecutionTime;
        
        return summary;
    }
    
    /**
     * Analyze performance by categories
     * @param {object} results - Benchmark results
     * @returns {object} Category analysis
     */
    analyzeCategoriesPerformance(results) {
        const categoryAnalysis = {};
        
        if (!results.results) {
            return categoryAnalysis;
        }
        
        Object.entries(results.results).forEach(([name, result]) => {
            const category = result.benchmark?.category || 'other';
            
            if (!categoryAnalysis[category]) {
                categoryAnalysis[category] = {
                    benchmarks: [],
                    avgScore: 0,
                    avgExecutionTime: 0,
                    status: 'pass'
                };
            }
            
            const score = result.comparison?.overallScore || 100;
            categoryAnalysis[category].benchmarks.push({
                name,
                score,
                executionTime: result.executionTime || 0,
                status: result.comparison?.status || (result.success ? 'pass' : 'fail')
            });
        });
        
        // Calculate category statistics
        Object.keys(categoryAnalysis).forEach(category => {
            const categoryData = categoryAnalysis[category];
            const benchmarks = categoryData.benchmarks;
            
            categoryData.avgScore = benchmarks.reduce((sum, b) => sum + b.score, 0) / benchmarks.length;
            categoryData.avgExecutionTime = benchmarks.reduce((sum, b) => sum + b.executionTime, 0) / benchmarks.length;
            
            const failedCount = benchmarks.filter(b => b.status === 'fail').length;
            const warningCount = benchmarks.filter(b => b.status === 'warning').length;
            
            if (failedCount > 0) {
                categoryData.status = 'fail';
            } else if (warningCount > 0) {
                categoryData.status = 'warning';
            }
        });
        
        return categoryAnalysis;
    }
    
    /**
     * Analyze performance trends
     * @param {object} results - Benchmark results
     * @returns {object} Trend analysis
     */
    analyzeTrends(results) {
        const trends = {
            overall: 'stable',
            categories: {},
            degradingBenchmarks: [],
            improvingBenchmarks: [],
            volatileBenchmarks: []
        };
        
        // Analyze historical data if available
        const recentResults = Array.from(this.analysisCache.values()).slice(-5);
        if (recentResults.length >= 2) {
            trends.overall = this.calculateOverallTrend(recentResults);
        }
        
        return trends;
    }
    
    /**
     * Detect statistical outliers in results
     * @param {object} results - Benchmark results
     * @returns {Array} Detected outliers
     */
    detectOutliers(results) {
        const outliers = [];
        
        if (!results.results) {
            return outliers;
        }
        
        const executionTimes = Object.values(results.results)
            .map(result => result.executionTime)
            .filter(time => typeof time === 'number' && time > 0);
        
        if (executionTimes.length >= 3) {
            const { mean, stdDev } = this.calculateStatistics(executionTimes);
            const threshold = 2 * stdDev; // 2 standard deviations
            
            Object.entries(results.results).forEach(([name, result]) => {
                if (result.executionTime && Math.abs(result.executionTime - mean) > threshold) {
                    outliers.push({
                        benchmark: name,
                        value: result.executionTime,
                        mean,
                        deviation: Math.abs(result.executionTime - mean),
                        type: 'execution_time'
                    });
                }
            });
        }
        
        return outliers;
    }
    
    /**
     * Detect performance regressions
     * @param {object} results - Benchmark results
     * @returns {Array} Detected regressions
     */
    detectRegressions(results) {
        const regressions = [];
        
        if (!results.results) {
            return regressions;
        }
        
        Object.entries(results.results).forEach(([name, result]) => {
            if (result.comparison?.status === 'fail' || 
                (result.comparison?.status === 'warning' && result.comparison?.overallScore < 80)) {
                
                regressions.push({
                    benchmark: name,
                    severity: result.comparison?.status === 'fail' ? 'critical' : 'moderate',
                    score: result.comparison?.overallScore || 0,
                    details: result.comparison?.details || {},
                    category: result.benchmark?.category
                });
            }
        });
        
        return regressions;
    }
    
    /**
     * Detect performance improvements
     * @param {object} results - Benchmark results
     * @returns {Array} Detected improvements
     */
    detectImprovements(results) {
        const improvements = [];
        
        if (!results.results) {
            return improvements;
        }
        
        Object.entries(results.results).forEach(([name, result]) => {
            if (result.comparison?.overallScore > 110) {
                improvements.push({
                    benchmark: name,
                    score: result.comparison?.overallScore,
                    improvement: ((result.comparison?.overallScore - 100) / 100 * 100).toFixed(1) + '%',
                    details: result.comparison?.details || {},
                    category: result.benchmark?.category
                });
            }
        });
        
        return improvements;
    }
    
    /**
     * Generate analysis-based recommendations
     * @param {object} results - Benchmark results
     * @returns {Array} Recommendations
     */
    generateAnalysisRecommendations(results) {
        const recommendations = [];
        
        const analysis = {
            summary: this.generateResultsSummary(results),
            regressions: this.detectRegressions(results),
            outliers: this.detectOutliers(results)
        };
        
        // Regression-based recommendations
        if (analysis.regressions.length > 0) {
            const criticalRegressions = analysis.regressions.filter(r => r.severity === 'critical');
            if (criticalRegressions.length > 0) {
                recommendations.push({
                    type: 'critical_regression',
                    priority: 'high',
                    message: `${criticalRegressions.length} critical performance regressions detected`,
                    affected: criticalRegressions.map(r => r.benchmark),
                    actions: [
                        'Review recent code changes for performance impact',
                        'Profile affected benchmarks for bottlenecks',
                        'Consider reverting problematic changes'
                    ]
                });
            }
        }
        
        // Category-specific recommendations
        const categoryAnalysis = this.analyzeCategoriesPerformance(results);
        Object.entries(categoryAnalysis).forEach(([category, analysis]) => {
            if (analysis.status === 'fail') {
                recommendations.push({
                    type: 'category_degradation',
                    priority: 'medium',
                    category,
                    message: `Performance degradation in ${category} category`,
                    avgScore: analysis.avgScore.toFixed(1),
                    actions: this.getCategorySpecificActions(category)
                });
            }
        });
        
        // Outlier-based recommendations
        if (analysis.outliers.length > 2) {
            recommendations.push({
                type: 'execution_variance',
                priority: 'low',
                message: `High execution time variance detected in ${analysis.outliers.length} benchmarks`,
                outliers: analysis.outliers.map(o => o.benchmark),
                actions: [
                    'Check system load during benchmark execution',
                    'Increase warmup iterations',
                    'Run benchmarks in isolated environment'
                ]
            });
        }
        
        return recommendations;
    }
    
    /**
     * Get category-specific optimization actions
     * @param {string} category - Performance category
     * @returns {Array} Optimization actions
     */
    getCategorySpecificActions(category) {
        const actions = {
            rendering: [
                'Optimize draw calls and batch operations',
                'Review shader performance',
                'Check for unnecessary canvas operations'
            ],
            memory: [
                'Implement object pooling',
                'Review garbage collection patterns',
                'Check for memory leaks'
            ],
            physics: [
                'Optimize collision detection algorithms',
                'Reduce simulation complexity',
                'Implement spatial partitioning'
            ],
            audio: [
                'Preload audio resources',
                'Optimize audio processing chains',
                'Review concurrent audio source limits'
            ],
            input: [
                'Optimize event handling',
                'Reduce input processing complexity',
                'Implement input throttling if needed'
            ]
        };
        
        return actions[category] || ['Review implementation for performance bottlenecks'];
    }
    
    /**
     * Calculate basic statistics for a dataset
     * @param {Array} values - Numeric values
     * @returns {object} Statistics
     */
    calculateStatistics(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return { mean, variance, stdDev };
    }
    
    /**
     * Calculate overall trend from historical results
     * @param {Array} historicalResults - Historical analysis results
     * @returns {string} Trend direction
     */
    calculateOverallTrend(historicalResults) {
        if (historicalResults.length < 2) return 'stable';
        
        const scores = historicalResults.map(result => {
            const summary = result.summary;
            return summary.passed / Math.max(summary.total, 1) * 100;
        });
        
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        const change = lastScore - firstScore;
        
        if (Math.abs(change) < 5) return 'stable';
        return change > 0 ? 'improving' : 'degrading';
    }
    
    /**
     * Get analysis history
     * @param {number} limit - Number of recent analyses to return
     * @returns {Array} Analysis history
     */
    getAnalysisHistory(limit = 10) {
        return Array.from(this.analysisCache.entries())
            .sort(([a], [b]) => b - a)
            .slice(0, limit)
            .map(([timestamp, analysis]) => ({ timestamp, ...analysis }));
    }
    
    /**
     * Configure analysis parameters
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.analysisConfig, config);
        console.log('[BenchmarkResultAnalyzer] Configuration updated');
    }
    
    /**
     * Cleanup analyzer resources
     */
    destroy() {
        this.analysisCache.clear();
        this.comparisonHistory = [];
        
        console.log('[BenchmarkResultAnalyzer] Result analyzer destroyed');
    }
}