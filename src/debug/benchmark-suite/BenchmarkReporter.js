/**
 * BenchmarkReporter - Report generation component
 * Handles benchmark report generation, visualization and data export
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class BenchmarkReporter {
    constructor(benchmarkSuite) {
        this.benchmarkSuite = benchmarkSuite;
        this.errorHandler = getErrorHandler();
        
        // Report configuration
        this.reportConfig = {
            defaultFormat: 'detailed',
            includeCharts: true,
            includeHistory: true,
            maxHistoryItems: 50,
            exportFormats: ['json', 'csv', 'html']
        };
        
        // Report templates
        this.reportTemplates = new Map();
        this.initializeReportTemplates();
        
        // Report history
        this.reportHistory = [];
        
        console.log('[BenchmarkReporter] Report generation component initialized');
    }
    
    /**
     * Generate comprehensive benchmark report
     * @param {object} results - Benchmark results
     * @param {object} analysis - Analysis results
     * @param {object} options - Report options
     * @returns {object} Generated report
     */
    generateBenchmarkReport(results, analysis = null, options = {}) {
        try {
            const reportOptions = { ...this.reportConfig, ...options };
            const timestamp = Date.now();
            
            const report = {
                metadata: this.generateReportMetadata(results, reportOptions),
                summary: results.summary || this.generateBasicSummary(results),
                environment: results.environment || this.captureEnvironment(),
                benchmarks: this.formatBenchmarkResults(results.results || {}),
                analysis: analysis || {},
                performance: this.generatePerformanceSection(results),
                trends: this.generateTrendsSection(results),
                recommendations: this.generateRecommendationsSection(results, analysis),
                appendices: {
                    detailedMetrics: this.generateDetailedMetrics(results),
                    executionLog: this.generateExecutionLog(results),
                    comparisonData: this.generateComparisonData(results)
                },
                timestamp
            };
            
            // Store in history
            this.reportHistory.push({
                timestamp,
                format: reportOptions.format,
                summary: report.summary,
                benchmarkCount: Object.keys(results.results || {}).length
            });
            
            // Limit history size
            if (this.reportHistory.length > reportOptions.maxHistoryItems) {
                this.reportHistory = this.reportHistory.slice(-reportOptions.maxHistoryItems);
            }
            
            return report;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BenchmarkReporter.generateBenchmarkReport'
            });
            
            return {
                error: error.message,
                timestamp: Date.now(),
                summary: { total: 0, passed: 0, failed: 0 }
            };
        }
    }
    
    /**
     * Visualize benchmark results with charts and graphs
     * @param {object} results - Benchmark results
     * @param {object} options - Visualization options
     * @returns {object} Visualization data
     */
    visualizeResults(results, options = {}) {
        try {
            const visualizations = {
                executionTimeChart: this.generateExecutionTimeChart(results),
                categoryPerformanceChart: this.generateCategoryChart(results),
                comparisonChart: this.generateComparisonChart(results),
                trendChart: this.generateTrendChart(results),
                distributionChart: this.generateDistributionChart(results)
            };
            
            // Generate chart data for different formats
            const chartData = {
                charts: visualizations,
                summary: this.generateVisualizationSummary(visualizations),
                interactiveData: this.generateInteractiveData(results),
                exportOptions: this.getVisualizationExportOptions()
            };
            
            return chartData;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BenchmarkReporter.visualizeResults'
            });
            
            return {
                error: error.message,
                charts: {},
                summary: {}
            };
        }
    }
    
    /**
     * Export benchmark results in various formats
     * @param {object} results - Benchmark results
     * @param {string} format - Export format ('json', 'csv', 'html', 'pdf')
     * @param {object} options - Export options
     * @returns {object} Export data
     */
    exportBenchmarks(results, format = 'json', options = {}) {
        try {
            const exportData = {
                format,
                timestamp: Date.now(),
                filename: this.generateExportFilename(results, format),
                data: null,
                size: 0
            };
            
            switch (format.toLowerCase()) {
                case 'json':
                    exportData.data = this.exportToJSON(results, options);
                    break;
                case 'csv':
                    exportData.data = this.exportToCSV(results, options);
                    break;
                case 'html':
                    exportData.data = this.exportToHTML(results, options);
                    break;
                case 'markdown':
                    exportData.data = this.exportToMarkdown(results, options);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            exportData.size = new Blob([exportData.data]).size;
            
            return exportData;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BenchmarkReporter.exportBenchmarks',
                format
            });
            
            return {
                error: error.message,
                format,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Generate report metadata
     * @param {object} results - Benchmark results
     * @param {object} options - Report options
     * @returns {object} Report metadata
     */
    generateReportMetadata(results, options) {
        return {
            title: 'Benchmark Suite Report',
            generatedAt: new Date().toISOString(),
            generatedBy: 'BenchmarkSuite v1.0',
            reportFormat: options.format || 'detailed',
            totalBenchmarks: Object.keys(results.results || {}).length,
            executionDuration: results.totalExecutionTime || 0,
            environment: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                timestamp: results.timestamp
            }
        };
    }
    
    /**
     * Format benchmark results for reporting
     * @param {object} results - Raw benchmark results
     * @returns {Array} Formatted benchmark data
     */
    formatBenchmarkResults(results) {
        return Object.entries(results).map(([name, result]) => ({
            name,
            category: result.benchmark?.category || 'other',
            description: result.benchmark?.description || '',
            success: result.success,
            executionTime: result.executionTime || 0,
            keyMetrics: this.extractKeyMetrics(result),
            comparison: result.comparison || null,
            status: this.determineBenchmarkStatus(result),
            score: result.comparison?.overallScore || (result.success ? 100 : 0),
            issues: this.extractIssues(result)
        }));
    }
    
    /**
     * Generate performance overview section
     * @param {object} results - Benchmark results
     * @returns {object} Performance section
     */
    generatePerformanceSection(results) {
        const benchmarkResults = Object.values(results.results || {});
        
        return {
            overview: {
                totalExecutionTime: results.totalExecutionTime || 0,
                avgExecutionTime: benchmarkResults.length > 0 
                    ? benchmarkResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / benchmarkResults.length
                    : 0,
                successRate: benchmarkResults.length > 0
                    ? benchmarkResults.filter(r => r.success).length / benchmarkResults.length * 100
                    : 0
            },
            topPerformers: this.getTopPerformers(benchmarkResults),
            bottlenecks: this.getPerformanceBottlenecks(benchmarkResults),
            regressions: this.getPerformanceRegressions(benchmarkResults),
            improvements: this.getPerformanceImprovements(benchmarkResults)
        };
    }
    
    /**
     * Generate trends analysis section
     * @param {object} results - Benchmark results
     * @returns {object} Trends section
     */
    generateTrendsSection(results) {
        const historicalData = this.getHistoricalTrendData();
        
        return {
            overallTrend: this.calculateOverallTrend(historicalData),
            categoryTrends: this.calculateCategoryTrends(results, historicalData),
            performanceMetrics: this.generateTrendMetrics(historicalData),
            predictions: this.generatePerformancePredictions(historicalData)
        };
    }
    
    /**
     * Generate recommendations section
     * @param {object} results - Benchmark results
     * @param {object} analysis - Analysis results
     * @returns {object} Recommendations section
     */
    generateRecommendationsSection(results, analysis) {
        const recommendations = [];
        
        // Add analysis recommendations if available
        if (analysis?.recommendations) {
            recommendations.push(...analysis.recommendations);
        }
        
        // Generate additional recommendations based on results
        recommendations.push(...this.generateResultBasedRecommendations(results));
        
        return {
            immediate: recommendations.filter(r => r.priority === 'high'),
            shortTerm: recommendations.filter(r => r.priority === 'medium'),
            longTerm: recommendations.filter(r => r.priority === 'low'),
            summary: this.summarizeRecommendations(recommendations)
        };
    }
    
    /**
     * Generate execution time chart data
     * @param {object} results - Benchmark results
     * @returns {object} Chart data
     */
    generateExecutionTimeChart(results) {
        const benchmarkResults = Object.entries(results.results || {});
        
        return {
            type: 'bar',
            title: 'Benchmark Execution Times',
            data: {
                labels: benchmarkResults.map(([name]) => name),
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: benchmarkResults.map(([, result]) => result.executionTime || 0),
                    backgroundColor: benchmarkResults.map(([, result]) => 
                        this.getBarColor(result.success, result.comparison?.status)
                    )
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Time (ms)' }
                    }
                }
            }
        };
    }
    
    /**
     * Generate category performance chart
     * @param {object} results - Benchmark results
     * @returns {object} Chart data
     */
    generateCategoryChart(results) {
        const categories = {};
        
        Object.entries(results.results || {}).forEach(([name, result]) => {
            const category = result.benchmark?.category || 'other';
            if (!categories[category]) {
                categories[category] = { total: 0, passed: 0, avgTime: 0, totalTime: 0 };
            }
            
            categories[category].total++;
            categories[category].totalTime += result.executionTime || 0;
            if (result.success) {
                categories[category].passed++;
            }
        });
        
        // Calculate averages
        Object.values(categories).forEach(cat => {
            cat.avgTime = cat.total > 0 ? cat.totalTime / cat.total : 0;
            cat.successRate = cat.total > 0 ? (cat.passed / cat.total) * 100 : 0;
        });
        
        return {
            type: 'doughnut',
            title: 'Performance by Category',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Success Rate (%)',
                    data: Object.values(categories).map(cat => cat.successRate),
                    backgroundColor: this.generateCategoryColors(Object.keys(categories))
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        };
    }
    
    /**
     * Export results to JSON format
     * @param {object} results - Benchmark results
     * @param {object} options - Export options
     * @returns {string} JSON data
     */
    exportToJSON(results, options) {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                format: 'json'
            },
            summary: results.summary,
            environment: results.environment,
            results: results.results,
            totalExecutionTime: results.totalExecutionTime,
            timestamp: results.timestamp
        };
        
        if (options.includeAnalysis && this.benchmarkSuite.resultAnalyzer) {
            exportData.analysis = this.benchmarkSuite.resultAnalyzer.getAnalysisHistory(1)[0];
        }
        
        return JSON.stringify(exportData, null, options.pretty ? 2 : undefined);
    }
    
    /**
     * Export results to CSV format
     * @param {object} results - Benchmark results
     * @param {object} options - Export options
     * @returns {string} CSV data
     */
    exportToCSV(results, options) {
        const headers = [
            'Benchmark Name',
            'Category',
            'Success',
            'Execution Time (ms)',
            'Score',
            'Status',
            'Key Metrics'
        ];
        
        const rows = [headers.join(',')];
        
        Object.entries(results.results || {}).forEach(([name, result]) => {
            const row = [
                `"${name}"`,
                `"${result.benchmark?.category || 'other'}"`,
                result.success ? 'TRUE' : 'FALSE',
                result.executionTime || 0,
                result.comparison?.overallScore || (result.success ? 100 : 0),
                `"${this.determineBenchmarkStatus(result)}"`,
                `"${this.formatKeyMetricsForCSV(result)}"`
            ];
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    }
    
    /**
     * Export results to HTML format
     * @param {object} results - Benchmark results
     * @param {object} options - Export options
     * @returns {string} HTML data
     */
    exportToHTML(results, options) {
        const report = this.generateBenchmarkReport(results, null, options);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benchmark Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .benchmark-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .benchmark-table th, .benchmark-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .benchmark-table th { background: #f5f5f5; }
        .status-pass { color: green; font-weight: bold; }
        .status-fail { color: red; font-weight: bold; }
        .status-warning { color: orange; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Benchmark Suite Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Total Execution Time: ${(results.totalExecutionTime || 0).toFixed(2)}ms</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Benchmarks</h3>
            <p>${report.summary.total || 0}</p>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <p class="status-pass">${report.summary.passed || 0}</p>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <p class="status-fail">${report.summary.failed || 0}</p>
        </div>
        <div class="summary-card">
            <h3>Warnings</h3>
            <p class="status-warning">${report.summary.warnings || 0}</p>
        </div>
    </div>
    
    <h2>Benchmark Results</h2>
    <table class="benchmark-table">
        <thead>
            <tr>
                <th>Benchmark</th>
                <th>Category</th>
                <th>Status</th>
                <th>Execution Time</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            ${report.benchmarks.map(benchmark => `
                <tr>
                    <td>${benchmark.name}</td>
                    <td>${benchmark.category}</td>
                    <td class="status-${benchmark.status}">${benchmark.status.toUpperCase()}</td>
                    <td>${benchmark.executionTime.toFixed(2)}ms</td>
                    <td>${benchmark.score.toFixed(1)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    }
    
    /**
     * Initialize report templates
     */
    initializeReportTemplates() {
        this.reportTemplates.set('summary', {
            name: 'Summary Report',
            sections: ['metadata', 'summary', 'performance']
        });
        
        this.reportTemplates.set('detailed', {
            name: 'Detailed Report',
            sections: ['metadata', 'summary', 'benchmarks', 'analysis', 'performance', 'trends', 'recommendations']
        });
        
        this.reportTemplates.set('executive', {
            name: 'Executive Summary',
            sections: ['metadata', 'summary', 'recommendations']
        });
    }
    
    /**
     * Get report generation history
     * @param {number} limit - Number of recent reports to return
     * @returns {Array} Report history
     */
    getReportHistory(limit = 10) {
        return this.reportHistory
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Helper methods for report generation
     */
    
    extractKeyMetrics(result) {
        const keyMetrics = {};
        ['fps', 'avgFrameTime', 'avgUpdateTime', 'avgLatency', 'stabilityScore', 'memoryUsage'].forEach(key => {
            if (result[key] !== undefined) {
                keyMetrics[key] = result[key];
            }
        });
        return keyMetrics;
    }
    
    determineBenchmarkStatus(result) {
        if (!result.success) return 'fail';
        if (result.comparison?.status === 'fail') return 'fail';
        if (result.comparison?.status === 'warning') return 'warning';
        return 'pass';
    }
    
    getBarColor(success, comparisonStatus) {
        if (!success) return '#ff4444';
        if (comparisonStatus === 'fail') return '#ff6b6b';
        if (comparisonStatus === 'warning') return '#ffa726';
        return '#4caf50';
    }
    
    generateCategoryColors(categories) {
        const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFEB3B'];
        return categories.map((_, index) => colors[index % colors.length]);
    }
    
    generateExportFilename(results, format) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `benchmark-report-${timestamp}.${format}`;
    }
    
    /**
     * Configure reporter parameters
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.reportConfig, config);
        console.log('[BenchmarkReporter] Configuration updated');
    }
    
    /**
     * Cleanup reporter resources
     */
    destroy() {
        this.reportTemplates.clear();
        this.reportHistory = [];
        
        console.log('[BenchmarkReporter] Benchmark reporter destroyed');
    }
}