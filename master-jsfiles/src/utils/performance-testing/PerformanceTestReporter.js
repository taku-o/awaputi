/**
 * PerformanceTestReporter - パフォーマンステスト結果の報告と可視化を担当するコンポーネント
 * レポート生成、結果フォーマット、エクスポート機能、推奨事項生成を提供
 */
export class PerformanceTestReporter {
    constructor(performanceTestSuite) {
        this.performanceTestSuite = performanceTestSuite;
        this.reportTemplates = new Map();
        this.initializeTemplates();
    }

    /**
     * レポートテンプレートの初期化
     */
    initializeTemplates() {
        this.reportTemplates.set('comprehensive', {
            sections: ['overview', 'detailed_results', 'analysis', 'recommendations', 'history'],
            format: 'detailed'
        });

        this.reportTemplates.set('summary', {
            sections: ['overview', 'key_metrics', 'critical_issues'],
            format: 'condensed'
        });

        this.reportTemplates.set('technical', {
            sections: ['raw_data', 'statistics', 'correlations', 'technical_analysis'],
            format: 'technical'
        });
    }

    /**
     * 包括的なテストレポート生成
     */
    generateReport(analysis, template = 'comprehensive') {
        const reportConfig = this.reportTemplates.get(template) || this.reportTemplates.get('comprehensive');
        
        const report = {
            metadata: this.generateMetadata(analysis),
            sections: {}
        };

        for (const section of reportConfig.sections) {
            report.sections[section] = this.generateSection(section, analysis);
        }

        return this.formatReport(report, reportConfig.format);
    }

    /**
     * レポートメタデータ生成
     */
    generateMetadata(analysis) {
        return {
            generated_at: new Date().toISOString(),
            session_id: analysis.session.id,
            test_duration: analysis.session.endTime - analysis.session.startTime,
            overall_result: analysis.overallPassed ? 'PASSED' : 'FAILED',
            total_tests: this.calculateTotalTests(analysis.session.results),
            passed_tests: this.calculatePassedTests(analysis.session.results),
            tool_version: '1.0.0',
            environment: this.getEnvironmentInfo()
        };
    }

    /**
     * レポートセクション生成
     */
    generateSection(sectionName, analysis) {
        switch (sectionName) {
            case 'overview':
                return this.generateOverviewSection(analysis);
            case 'detailed_results':
                return this.generateDetailedResultsSection(analysis);
            case 'analysis':
                return this.generateAnalysisSection(analysis);
            case 'recommendations':
                return this.generateRecommendationsSection(analysis);
            case 'history':
                return this.generateHistorySection(analysis);
            case 'key_metrics':
                return this.generateKeyMetricsSection(analysis);
            case 'critical_issues':
                return this.generateCriticalIssuesSection(analysis);
            case 'raw_data':
                return this.generateRawDataSection(analysis);
            case 'statistics':
                return this.generateStatisticsSection(analysis);
            case 'correlations':
                return this.generateCorrelationsSection(analysis);
            case 'technical_analysis':
                return this.generateTechnicalAnalysisSection(analysis);
            default:
                return { error: `Unknown section: ${sectionName}` };
        }
    }

    /**
     * 概要セクション生成
     */
    generateOverviewSection(analysis) {
        const passRate = this.calculatePassRate(analysis.session.results);
        
        return {
            title: 'Performance Test Overview',
            summary: {
                overall_status: analysis.overallPassed ? 'PASSED' : 'FAILED',
                pass_rate: `${passRate.toFixed(1)}%`,
                total_categories: analysis.session.results.size,
                execution_time: `${((analysis.session.endTime - analysis.session.startTime) / 1000).toFixed(2)}s`,
                timestamp: new Date(analysis.session.startTime).toISOString()
            },
            category_summary: this.generateCategorySummary(analysis.session.results),
            key_findings: this.generateKeyFindings(analysis)
        };
    }

    /**
     * 詳細結果セクション生成
     */
    generateDetailedResultsSection(analysis) {
        const detailedResults = {};

        for (const [category, results] of analysis.session.results) {
            detailedResults[category] = {
                category_status: results.passed ? 'PASSED' : 'FAILED',
                summary: results.summary,
                tests: {}
            };

            for (const [testName, testResult] of Object.entries(results.tests)) {
                detailedResults[category].tests[testName] = {
                    status: testResult.passed ? 'PASSED' : 'FAILED',
                    result: testResult.result,
                    expected: testResult.expected,
                    details: testResult.details || {},
                    deviation: this.calculateDeviation(testResult.result, testResult.expected)
                };
            }
        }

        return {
            title: 'Detailed Test Results',
            results: detailedResults
        };
    }

    /**
     * 分析セクション生成
     */
    generateAnalysisSection(analysis) {
        return {
            title: 'Performance Analysis',
            regressions: {
                count: analysis.regressions.length,
                critical: analysis.regressions.filter(r => r.severity === 'critical').length,
                high: analysis.regressions.filter(r => r.severity === 'high').length,
                details: analysis.regressions
            },
            improvements: {
                count: analysis.improvements.length,
                details: analysis.improvements
            },
            baseline_comparison: this.formatBaselineComparison(analysis.comparison),
            trends: this.analyzeTrends(analysis)
        };
    }

    /**
     * 推奨事項セクション生成
     */
    generateRecommendationsSection(analysis) {
        return {
            title: 'Recommendations',
            priority_recommendations: this.prioritizeRecommendations(analysis.recommendations),
            quick_fixes: this.identifyQuickFixes(analysis.recommendations),
            long_term_improvements: this.identifyLongTermImprovements(analysis.recommendations),
            optimization_opportunities: this.identifyOptimizationOpportunities(analysis)
        };
    }

    /**
     * 履歴セクション生成
     */
    generateHistorySection(analysis) {
        const history = this.performanceTestSuite.getTestHistory();
        
        return {
            title: 'Test History',
            recent_runs: history.slice(0, 10),
            trend_analysis: this.analyzeHistoricalTrends(history),
            performance_evolution: this.analyzePerformanceEvolution(history)
        };
    }

    /**
     * キーメトリクスセクション生成
     */
    generateKeyMetricsSection(analysis) {
        const keyMetrics = this.extractKeyMetrics(analysis.session.results);
        
        return {
            title: 'Key Performance Metrics',
            frame_rate: keyMetrics.frameRate,
            memory_usage: keyMetrics.memory,
            rendering_performance: keyMetrics.rendering,
            network_performance: keyMetrics.network,
            battery_efficiency: keyMetrics.battery
        };
    }

    /**
     * 重大問題セクション生成
     */
    generateCriticalIssuesSection(analysis) {
        const criticalIssues = analysis.regressions.filter(r => r.severity === 'critical' || r.severity === 'high');
        
        return {
            title: 'Critical Issues',
            count: criticalIssues.length,
            issues: criticalIssues.map(issue => ({
                category: issue.category,
                test: issue.test,
                severity: issue.severity,
                impact: this.assessImpact(issue),
                recommended_action: this.getRecommendedAction(issue)
            }))
        };
    }

    /**
     * 生データセクション生成
     */
    generateRawDataSection(analysis) {
        return {
            title: 'Raw Test Data',
            session_data: analysis.session,
            baseline_data: Object.fromEntries(this.performanceTestSuite.baselines),
            collected_metrics: this.performanceTestSuite.metricsCollector?.getCollectedMetrics() || {}
        };
    }

    /**
     * 統計セクション生成
     */
    generateStatisticsSection(analysis) {
        const statistics = {};

        for (const [category, results] of analysis.session.results) {
            const values = Object.values(results.tests).map(test => test.result);
            statistics[category] = {
                count: values.length,
                mean: this.calculateMean(values),
                median: this.calculateMedian(values),
                variance: this.calculateVariance(values),
                standard_deviation: Math.sqrt(this.calculateVariance(values)),
                min: Math.min(...values),
                max: Math.max(...values),
                percentiles: {
                    p25: this.calculatePercentile(values, 25),
                    p50: this.calculatePercentile(values, 50),
                    p75: this.calculatePercentile(values, 75),
                    p90: this.calculatePercentile(values, 90),
                    p95: this.calculatePercentile(values, 95),
                    p99: this.calculatePercentile(values, 99)
                }
            };
        }

        return {
            title: 'Statistical Analysis',
            category_statistics: statistics,
            overall_statistics: this.calculateOverallStatistics(analysis.session.results)
        };
    }

    /**
     * 相関セクション生成
     */
    generateCorrelationsSection(analysis) {
        return {
            title: 'Performance Correlations',
            category_correlations: this.calculateCategoryCorrelations(analysis.session.results),
            metric_correlations: this.calculateMetricCorrelations(analysis.session.results)
        };
    }

    /**
     * 技術分析セクション生成
     */
    generateTechnicalAnalysisSection(analysis) {
        return {
            title: 'Technical Analysis',
            performance_bottlenecks: this.identifyBottlenecks(analysis),
            resource_utilization: this.analyzeResourceUtilization(analysis),
            optimization_potential: this.assessOptimizationPotential(analysis),
            technical_recommendations: this.generateTechnicalRecommendations(analysis)
        };
    }

    /**
     * レポートフォーマット
     */
    formatReport(report, format) {
        switch (format) {
            case 'detailed':
                return this.formatDetailedReport(report);
            case 'condensed':
                return this.formatCondensedReport(report);
            case 'technical':
                return this.formatTechnicalReport(report);
            default:
                return report;
        }
    }

    /**
     * 詳細レポートフォーマット
     */
    formatDetailedReport(report) {
        return {
            ...report,
            formatted_output: this.generateHTMLReport(report),
            export_formats: {
                json: JSON.stringify(report, null, 2),
                csv: this.convertToCSV(report),
                markdown: this.convertToMarkdown(report)
            }
        };
    }

    /**
     * HTMLレポート生成
     */
    generateHTMLReport(report) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .passed { color: green; font-weight: bold; }
        .failed { color: red; font-weight: bold; }
        .critical { background: #ffebee; padding: 10px; border-left: 4px solid #f44336; }
        .table { border-collapse: collapse; width: 100%; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Test Report</h1>
        <p>Generated: ${report.metadata.generated_at}</p>
        <p>Overall Result: <span class="${report.metadata.overall_result.toLowerCase()}">${report.metadata.overall_result}</span></p>
        <p>Total Tests: ${report.metadata.total_tests} | Passed: ${report.metadata.passed_tests}</p>
    </div>
    ${this.generateHTMLSections(report.sections)}
</body>
</html>`;
        return html;
    }

    /**
     * HTMLセクション生成
     */
    generateHTMLSections(sections) {
        let html = '';
        for (const [sectionName, sectionData] of Object.entries(sections)) {
            html += `
            <div class="section">
                <h2>${sectionData.title || sectionName}</h2>
                ${this.formatSectionHTML(sectionData)}
            </div>`;
        }
        return html;
    }

    /**
     * セクションHTML フォーマット
     */
    formatSectionHTML(sectionData) {
        if (typeof sectionData === 'object' && sectionData !== null) {
            return `<pre>${JSON.stringify(sectionData, null, 2)}</pre>`;
        }
        return `<p>${sectionData}</p>`;
    }

    /**
     * Markdown変換
     */
    convertToMarkdown(report) {
        let markdown = `# Performance Test Report\n\n`;
        markdown += `**Generated:** ${report.metadata.generated_at}\n`;
        markdown += `**Overall Result:** ${report.metadata.overall_result}\n`;
        markdown += `**Total Tests:** ${report.metadata.total_tests} | **Passed:** ${report.metadata.passed_tests}\n\n`;

        for (const [sectionName, sectionData] of Object.entries(report.sections)) {
            markdown += `## ${sectionData.title || sectionName}\n\n`;
            markdown += this.formatSectionMarkdown(sectionData);
            markdown += '\n\n';
        }

        return markdown;
    }

    /**
     * セクション Markdown フォーマット
     */
    formatSectionMarkdown(sectionData) {
        return '```json\n' + JSON.stringify(sectionData, null, 2) + '\n```';
    }

    /**
     * CSV変換
     */
    convertToCSV(report) {
        const rows = ['Category,Test,Status,Result,Expected,Deviation'];
        
        if (report.sections.detailed_results && report.sections.detailed_results.results) {
            for (const [category, categoryData] of Object.entries(report.sections.detailed_results.results)) {
                for (const [testName, testData] of Object.entries(categoryData.tests)) {
                    rows.push(`${category},${testName},${testData.status},${testData.result},${testData.expected},${testData.deviation || 0}`);
                }
            }
        }

        return rows.join('\n');
    }

    // ヘルパーメソッド

    calculateTotalTests(results) {
        let total = 0;
        for (const [category, categoryResults] of results) {
            total += Object.keys(categoryResults.tests).length;
        }
        return total;
    }

    calculatePassedTests(results) {
        let passed = 0;
        for (const [category, categoryResults] of results) {
            for (const test of Object.values(categoryResults.tests)) {
                if (test.passed) passed++;
            }
        }
        return passed;
    }

    calculatePassRate(results) {
        const total = this.calculateTotalTests(results);
        const passed = this.calculatePassedTests(results);
        return total > 0 ? (passed / total) * 100 : 0;
    }

    calculateDeviation(result, expected) {
        return expected !== 0 ? ((result - expected) / expected) * 100 : 0;
    }

    calculateMean(values) {
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    calculateMedian(values) {
        if (values.length === 0) return 0;
        const sorted = values.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculateVariance(values) {
        if (values.length === 0) return 0;
        const mean = this.calculateMean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile / 100) - 1;
        return sorted[Math.max(0, index)];
    }

    generateCategorySummary(results) {
        const summary = {};
        for (const [category, categoryResults] of results) {
            summary[category] = {
                status: categoryResults.passed ? 'PASSED' : 'FAILED',
                test_count: Object.keys(categoryResults.tests).length,
                pass_rate: this.calculateCategoryPassRate(categoryResults)
            };
        }
        return summary;
    }

    calculateCategoryPassRate(categoryResults) {
        const tests = Object.values(categoryResults.tests);
        const passed = tests.filter(test => test.passed).length;
        return tests.length > 0 ? (passed / tests.length) * 100 : 0;
    }

    generateKeyFindings(analysis) {
        const findings = [];
        
        if (analysis.regressions.length > 0) {
            findings.push(`${analysis.regressions.length} performance regressions detected`);
        }
        
        if (analysis.improvements.length > 0) {
            findings.push(`${analysis.improvements.length} performance improvements found`);
        }
        
        const criticalIssues = analysis.regressions.filter(r => r.severity === 'critical').length;
        if (criticalIssues > 0) {
            findings.push(`${criticalIssues} critical performance issues require immediate attention`);
        }

        return findings;
    }

    getEnvironmentInfo() {
        return {
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            hardware_concurrency: navigator.hardwareConcurrency || 'unknown',
            connection: navigator.connection ? {
                effective_type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : 'unknown'
        };
    }

    prioritizeRecommendations(recommendations) {
        return recommendations
            .sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            })
            .slice(0, 5); // トップ5の推奨事項
    }

    identifyQuickFixes(recommendations) {
        return recommendations.filter(rec => 
            rec.type === 'configuration' || rec.type === 'setting'
        );
    }

    identifyLongTermImprovements(recommendations) {
        return recommendations.filter(rec => 
            rec.type === 'architecture' || rec.type === 'refactoring'
        );
    }

    identifyOptimizationOpportunities(analysis) {
        const opportunities = [];
        
        // メモリ使用量が高い場合
        const memoryResults = analysis.session.results.get('memory');
        if (memoryResults && !memoryResults.passed) {
            opportunities.push({
                area: 'memory',
                description: 'Memory usage optimization needed',
                potential_impact: 'high'
            });
        }

        // フレームレートが低い場合
        const frameRateResults = analysis.session.results.get('frameRate');
        if (frameRateResults && !frameRateResults.passed) {
            opportunities.push({
                area: 'rendering',
                description: 'Frame rate optimization needed',
                potential_impact: 'high'
            });
        }

        return opportunities;
    }

    /**
     * レポート結果のエクスポート
     */
    exportResults(analysis, format = 'json', options = {}) {
        const report = this.generateReport(analysis, options.template);
        
        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'csv':
                return this.convertToCSV(report);
            case 'html':
                return this.generateHTMLReport(report);
            case 'markdown':
                return this.convertToMarkdown(report);
            default:
                return report;
        }
    }

    /**
     * 結果の要約
     */
    summarizeResults(categoryResults) {
        const summary = {};
        
        for (const [category, results] of categoryResults) {
            const testCount = Object.keys(results.tests).length;
            const passedCount = Object.values(results.tests).filter(test => test.passed).length;
            
            summary[category] = {
                total: testCount,
                passed: passedCount,
                failed: testCount - passedCount,
                pass_rate: testCount > 0 ? (passedCount / testCount) * 100 : 0,
                status: results.passed ? 'PASSED' : 'FAILED'
            };
        }
        
        return summary;
    }
}