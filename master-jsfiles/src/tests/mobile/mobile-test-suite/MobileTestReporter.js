/**
 * Mobile Test Reporter
 * モバイルテストレポート生成専用クラス
 */

export class MobileTestReporter {
    constructor(mobileTestSuite) {
        this.mobileTestSuite = mobileTestSuite;
        
        // レポート設定
        this.reportConfig = {
            formats: ['json', 'html', 'csv', 'xml'],
            includeStackTraces: true,
            includePerformanceMetrics: true,
            includeCompatibilityMatrix: true,
            maxErrorDetails: 50,
            timestampFormat: 'ISO'
        };
        
        // テンプレート設定
        this.templates = {
            html: {
                title: 'Mobile Test Report',
                theme: 'default',
                includeCharts: true,
                responsiveDesign: true
            },
            email: {
                subject: 'Mobile Test Results',
                includeAttachments: true,
                compressAttachments: true
            }
        };
        
        // レポート履歴
        this.reportHistory = [];
        this.maxHistorySize = 10;
    }
    
    /**
     * テストレポート生成
     */
    generateTestReport(options = {}) {
        const config = { ...this.reportConfig, ...options };
        const testResults = this.mobileTestSuite.testResults;
        
        const total = testResults.passed + testResults.failed + testResults.skipped;
        const successRate = total > 0 ? (testResults.passed / total * 100).toFixed(2) : 0;
        
        const report = {
            metadata: {
                generatedAt: Date.now(),
                generatedBy: 'MobileTestSuite',
                version: '1.0.0',
                testDuration: this.calculateTestDuration(),
                environment: this.getEnvironmentInfo()
            },
            summary: {
                total,
                passed: testResults.passed,
                failed: testResults.failed,
                skipped: testResults.skipped,
                successRate: `${successRate}%`,
                testSuites: this.mobileTestSuite.testSuites.size,
                avgTestTime: this.calculateAverageTestTime()
            },
            results: {
                errors: this.formatErrors(testResults.errors, config),
                performance: this.formatPerformanceResults(testResults.performance, config),
                compatibility: this.formatCompatibilityResults(testResults.compatibility, config)
            },
            analysis: {
                trends: this.analyzeTestTrends(),
                recommendations: this.generateRecommendations(),
                riskAssessment: this.assessRisks()
            },
            charts: config.includeCharts ? this.generateChartData() : null
        };
        
        // レポート履歴に追加
        this.addToHistory(report);
        
        return report;
    }
    
    /**
     * レポート出力
     */
    exportReport(format = 'json', options = {}) {
        const report = this.generateTestReport(options);
        
        switch (format.toLowerCase()) {
            case 'json':
                return this.exportToJSON(report, options);
            case 'html':
                return this.exportToHTML(report, options);
            case 'csv':
                return this.exportToCSV(report, options);
            case 'xml':
                return this.exportToXML(report, options);
            case 'pdf':
                return this.exportToPDF(report, options);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    /**
     * JSON形式でエクスポート
     */
    exportToJSON(report, options = {}) {
        const indent = options.pretty ? 2 : 0;
        return JSON.stringify(report, null, indent);
    }
    
    /**
     * HTML形式でエクスポート
     */
    exportToHTML(report, options = {}) {
        const config = { ...this.templates.html, ...options };
        
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        ${this.getHTMLStyles(config)}
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHTMLHeader(report, config)}
        ${this.generateHTMLSummary(report)}
        ${this.generateHTMLErrorSection(report)}
        ${this.generateHTMLPerformanceSection(report)}
        ${this.generateHTMLCompatibilitySection(report)}
        ${this.generateHTMLAnalysisSection(report)}
        ${config.includeCharts ? this.generateHTMLChartSection(report) : ''}
        ${this.generateHTMLFooter(report)}
    </div>
    ${config.includeCharts ? this.getChartScripts() : ''}
</body>
</html>`;
    }
    
    /**
     * CSV形式でエクスポート
     */
    exportToCSV(report, options = {}) {
        const sections = [];
        
        // サマリー情報
        sections.push('# Test Summary');
        sections.push('Metric,Value');
        sections.push(`Total Tests,${report.summary.total}`);
        sections.push(`Passed,${report.summary.passed}`);
        sections.push(`Failed,${report.summary.failed}`);
        sections.push(`Success Rate,${report.summary.successRate}`);
        sections.push('');
        
        // エラー情報
        if (report.results.errors.length > 0) {
            sections.push('# Errors');
            sections.push('Suite,Test,Error,Timestamp');
            report.results.errors.forEach(error => {
                sections.push(`"${error.suite}","${error.test}","${error.error}","${new Date(error.timestamp).toISOString()}"`);
            });
            sections.push('');
        }
        
        // パフォーマンス情報
        if (Object.keys(report.results.performance).length > 0) {
            sections.push('# Performance Results');
            sections.push('Test,Duration (ms),Status,Metrics');
            Object.entries(report.results.performance).forEach(([test, data]) => {
                const status = data.duration < 100 ? 'Good' : data.duration < 500 ? 'Fair' : 'Poor';
                const metrics = JSON.stringify(data.metrics || {}).replace(/"/g, '""');
                sections.push(`"${test}",${data.duration.toFixed(2)},"${status}","${metrics}"`);
            });
            sections.push('');
        }
        
        return sections.join('\\n');
    }
    
    /**
     * XML形式でエクスポート
     */
    exportToXML(report, options = {}) {
        const xml = [];
        xml.push('<?xml version="1.0" encoding="UTF-8"?>');
        xml.push('<testReport>');
        
        // メタデータ
        xml.push('  <metadata>');
        xml.push(`    <generatedAt>${new Date(report.metadata.generatedAt).toISOString()}</generatedAt>`);
        xml.push(`    <version>${report.metadata.version}</version>`);
        xml.push('  </metadata>');
        
        // サマリー
        xml.push('  <summary>');
        xml.push(`    <total>${report.summary.total}</total>`);
        xml.push(`    <passed>${report.summary.passed}</passed>`);
        xml.push(`    <failed>${report.summary.failed}</failed>`);
        xml.push(`    <successRate>${report.summary.successRate}</successRate>`);
        xml.push('  </summary>');
        
        // エラー
        if (report.results.errors.length > 0) {
            xml.push('  <errors>');
            report.results.errors.forEach(error => {
                xml.push('    <error>');
                xml.push(`      <suite>${this.escapeXML(error.suite)}</suite>`);
                xml.push(`      <test>${this.escapeXML(error.test)}</test>`);
                xml.push(`      <message>${this.escapeXML(error.error)}</message>`);
                xml.push(`      <timestamp>${new Date(error.timestamp).toISOString()}</timestamp>`);
                xml.push('    </error>');
            });
            xml.push('  </errors>');
        }
        
        xml.push('</testReport>');
        return xml.join('\\n');
    }
    
    /**
     * PDF形式でエクスポート（プレースホルダー）
     */
    exportToPDF(report, options = {}) {
        // PDF生成は外部ライブラリが必要なため、現在はプレースホルダー
        return {
            format: 'pdf',
            message: 'PDF export requires additional library',
            htmlVersion: this.exportToHTML(report, options)
        };
    }
    
    /**
     * エラー情報フォーマット
     */
    formatErrors(errors, config) {
        return errors.slice(0, config.maxErrorDetails).map(error => ({
            ...error,
            formattedTimestamp: new Date(error.timestamp).toISOString(),
            severity: this.categorizeErrorSeverity(error),
            stackTrace: config.includeStackTraces ? error.stack : undefined
        }));
    }
    
    /**
     * パフォーマンス結果フォーマット
     */
    formatPerformanceResults(performance, config) {
        const results = {};
        
        for (const [test, data] of performance.entries()) {
            results[test] = {
                duration: data.duration,
                formattedDuration: `${data.duration.toFixed(2)}ms`,
                status: this.categorizePerformanceStatus(data.duration),
                metrics: config.includePerformanceMetrics ? data.metrics : undefined,
                timestamp: data.timestamp,
                formattedTimestamp: new Date(data.timestamp).toISOString()
            };
        }
        
        return results;
    }
    
    /**
     * 互換性結果フォーマット
     */
    formatCompatibilityResults(compatibility, config) {
        const results = {};
        
        for (const [key, data] of compatibility.entries()) {
            results[key] = {
                device: data.device,
                browser: data.browser,
                results: data.results,
                status: this.categorizeCompatibilityStatus(data.results),
                timestamp: data.timestamp,
                formattedTimestamp: new Date(data.timestamp).toISOString()
            };
        }
        
        return results;
    }
    
    /**
     * テスト期間計算
     */
    calculateTestDuration() {
        // テスト実行時間の推定（実際のタイマーがないため）
        const testCount = this.mobileTestSuite.testResults.passed + 
                         this.mobileTestSuite.testResults.failed;
        return testCount * 500; // 平均500ms/テストと仮定
    }
    
    /**
     * 平均テスト時間計算
     */
    calculateAverageTestTime() {
        const performance = this.mobileTestSuite.testResults.performance;
        if (performance.size === 0) return 0;
        
        let totalTime = 0;
        for (const data of performance.values()) {
            totalTime += data.duration;
        }
        
        return (totalTime / performance.size).toFixed(2);
    }
    
    /**
     * 環境情報取得
     */
    getEnvironmentInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: Date.now()
        };
    }
    
    /**
     * テストトレンド分析
     */
    analyzeTestTrends() {
        const history = this.reportHistory.slice(-5); // 直近5回分
        if (history.length < 2) {
            return { message: 'Insufficient data for trend analysis' };
        }
        
        const trends = {
            successRate: this.calculateTrend(history.map(h => parseFloat(h.summary.successRate))),
            testCount: this.calculateTrend(history.map(h => h.summary.total)),
            errorCount: this.calculateTrend(history.map(h => h.summary.failed))
        };
        
        return trends;
    }
    
    /**
     * 推奨事項生成
     */
    generateRecommendations() {
        const recommendations = [];
        const results = this.mobileTestSuite.testResults;
        
        // 失敗率に基づく推奨事項
        const total = results.passed + results.failed + results.skipped;
        const failureRate = total > 0 ? (results.failed / total) : 0;
        
        if (failureRate > 0.1) {
            recommendations.push({
                type: 'high_failure_rate',
                priority: 'high',
                message: `失敗率が${(failureRate * 100).toFixed(1)}%と高くなっています`,
                action: 'テストの安定性を確認し、環境固有の問題を調査してください'
            });
        }
        
        // パフォーマンステストの推奨事項
        const slowTests = [];
        for (const [test, data] of results.performance.entries()) {
            if (data.duration > 1000) {
                slowTests.push({ test, duration: data.duration });
            }
        }
        
        if (slowTests.length > 0) {
            recommendations.push({
                type: 'slow_tests',
                priority: 'medium',
                message: `${slowTests.length}個のテストが1秒以上かかっています`,
                action: 'パフォーマンスの最適化を検討してください',
                details: slowTests.slice(0, 3)
            });
        }
        
        return recommendations;
    }
    
    /**
     * リスク評価
     */
    assessRisks() {
        const risks = [];
        const results = this.mobileTestSuite.testResults;
        
        // クリティカルエラーの評価
        const criticalErrors = results.errors.filter(error => 
            error.error.toLowerCase().includes('fatal') ||
            error.error.toLowerCase().includes('critical')
        );
        
        if (criticalErrors.length > 0) {
            risks.push({
                level: 'critical',
                category: 'stability',
                message: 'クリティカルエラーが検出されました',
                impact: 'アプリケーションの安定性に重大な影響'
            });
        }
        
        return risks;
    }
    
    /**
     * チャートデータ生成
     */
    generateChartData() {
        const results = this.mobileTestSuite.testResults;
        
        return {
            summary: {
                type: 'pie',
                data: {
                    labels: ['Passed', 'Failed', 'Skipped'],
                    values: [results.passed, results.failed, results.skipped]
                }
            },
            performance: {
                type: 'bar',
                data: {
                    labels: Array.from(results.performance.keys()),
                    values: Array.from(results.performance.values()).map(d => d.duration)
                }
            }
        };
    }
    
    /**
     * HTML用スタイル取得
     */
    getHTMLStyles(config) {
        return `
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; border-left: 4px solid #007acc; }
            .metric-value { font-size: 2em; font-weight: bold; color: #007acc; }
            .metric-label { color: #666; margin-top: 5px; }
            .passed { color: #28a745; }
            .failed { color: #dc3545; }
            .error { background: #fff5f5; border: 1px solid #fed7d7; padding: 15px; margin: 10px 0; border-radius: 4px; }
            .error-title { font-weight: bold; color: #c53030; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f8f9fa; font-weight: 600; }
            .status-good { color: #28a745; }
            .status-fair { color: #ffc107; }
            .status-poor { color: #dc3545; }
            .recommendation { background: #e7f3ff; border-left: 4px solid #007acc; padding: 15px; margin: 10px 0; }
            .risk-critical { background: #ffebee; border-left: 4px solid #f44336; }
            .risk-high { background: #fff3e0; border-left: 4px solid #ff9800; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em; }
        `;
    }
    
    /**
     * HTMLヘッダー生成
     */
    generateHTMLHeader(report, config) {
        return `
            <header>
                <h1>${config.title}</h1>
                <p>Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
            </header>
        `;
    }
    
    /**
     * HTMLサマリー生成
     */
    generateHTMLSummary(report) {
        return `
            <section class="summary">
                <div class="metric">
                    <div class="metric-value">${report.summary.total}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value passed">${report.summary.passed}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value failed">${report.summary.failed}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.summary.successRate}</div>
                    <div class="metric-label">Success Rate</div>
                </div>
            </section>
        `;
    }
    
    /**
     * HTMLエラーセクション生成
     */
    generateHTMLErrorSection(report) {
        if (report.results.errors.length === 0) {
            return '<section><h2>Errors</h2><p>No errors found! 🎉</p></section>';
        }
        
        const errorHTML = report.results.errors.map(error => `
            <div class="error">
                <div class="error-title">${error.suite} - ${error.test}</div>
                <div>${error.error}</div>
                <small>Severity: ${error.severity} | ${error.formattedTimestamp}</small>
            </div>
        `).join('');
        
        return `
            <section>
                <h2>Errors (${report.results.errors.length})</h2>
                ${errorHTML}
            </section>
        `;
    }
    
    /**
     * HTMLパフォーマンスセクション生成
     */
    generateHTMLPerformanceSection(report) {
        const perfEntries = Object.entries(report.results.performance);
        if (perfEntries.length === 0) {
            return '<section><h2>Performance</h2><p>No performance data available.</p></section>';
        }
        
        const perfRows = perfEntries.map(([test, data]) => `
            <tr>
                <td>${test}</td>
                <td>${data.formattedDuration}</td>
                <td class="status-${data.status.toLowerCase()}">${data.status}</td>
                <td>${data.formattedTimestamp}</td>
            </tr>
        `).join('');
        
        return `
            <section>
                <h2>Performance Results</h2>
                <table>
                    <thead>
                        <tr><th>Test</th><th>Duration</th><th>Status</th><th>Timestamp</th></tr>
                    </thead>
                    <tbody>
                        ${perfRows}
                    </tbody>
                </table>
            </section>
        `;
    }
    
    /**
     * HTML互換性セクション生成
     */
    generateHTMLCompatibilitySection(report) {
        const compatEntries = Object.entries(report.results.compatibility);
        if (compatEntries.length === 0) {
            return '<section><h2>Compatibility</h2><p>No compatibility data available.</p></section>';
        }
        
        const compatRows = compatEntries.map(([key, data]) => `
            <tr>
                <td>${data.device}</td>
                <td>${data.browser}</td>
                <td class="status-${data.status.toLowerCase()}">${data.status}</td>
                <td>${data.formattedTimestamp}</td>
            </tr>
        `).join('');
        
        return `
            <section>
                <h2>Compatibility Results</h2>
                <table>
                    <thead>
                        <tr><th>Device</th><th>Browser</th><th>Status</th><th>Timestamp</th></tr>
                    </thead>
                    <tbody>
                        ${compatRows}
                    </tbody>
                </table>
            </section>
        `;
    }
    
    /**
     * HTML分析セクション生成
     */
    generateHTMLAnalysisSection(report) {
        const recommendations = report.analysis.recommendations.map(rec => `
            <div class="recommendation">
                <strong>${rec.type} (${rec.priority})</strong><br>
                ${rec.message}<br>
                <em>Action: ${rec.action}</em>
            </div>
        `).join('');
        
        return `
            <section>
                <h2>Analysis & Recommendations</h2>
                ${recommendations || '<p>No specific recommendations at this time.</p>'}
            </section>
        `;
    }
    
    /**
     * HTMLフッター生成
     */
    generateHTMLFooter(report) {
        return `
            <footer class="footer">
                <p>Report generated by MobileTestSuite v${report.metadata.version}</p>
                <p>Test duration: ${report.metadata.testDuration}ms | Environment: ${report.metadata.environment.platform}</p>
            </footer>
        `;
    }
    
    /**
     * エラー重要度分類
     */
    categorizeErrorSeverity(error) {
        const message = error.error.toLowerCase();
        if (message.includes('fatal') || message.includes('critical')) return 'critical';
        if (message.includes('error') || message.includes('failed')) return 'high';
        if (message.includes('warning') || message.includes('deprecated')) return 'medium';
        return 'low';
    }
    
    /**
     * パフォーマンス状態分類
     */
    categorizePerformanceStatus(duration) {
        if (duration < 100) return 'Good';
        if (duration < 500) return 'Fair';
        return 'Poor';
    }
    
    /**
     * 互換性状態分類
     */
    categorizeCompatibilityStatus(results) {
        if (!results || typeof results !== 'object') return 'Unknown';
        
        const issues = Object.values(results).filter(result => !result).length;
        if (issues === 0) return 'Compatible';
        if (issues <= 2) return 'Minor Issues';
        return 'Major Issues';
    }
    
    /**
     * トレンド計算
     */
    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values[values.length - 1];
        const previous = values[values.length - 2];
        
        if (recent > previous) return 'increasing';
        if (recent < previous) return 'decreasing';
        return 'stable';
    }
    
    /**
     * XML文字列エスケープ
     */
    escapeXML(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * レポート履歴に追加
     */
    addToHistory(report) {
        this.reportHistory.push({
            timestamp: report.metadata.generatedAt,
            summary: report.summary,
            errorCount: report.results.errors.length
        });
        
        // 履歴サイズ制限
        if (this.reportHistory.length > this.maxHistorySize) {
            this.reportHistory.shift();
        }
    }
    
    /**
     * レポート履歴取得
     */
    getReportHistory() {
        return [...this.reportHistory];
    }
    
    /**
     * 設定更新
     */
    updateConfig(newConfig) {
        Object.assign(this.reportConfig, newConfig);
    }
    
    /**
     * チャートスクリプト取得
     */
    getChartScripts() {
        return `
            <script>
                // チャート描画用のプレースホルダー
                // 実際の実装では Chart.js や D3.js などを使用
                console.log('Chart data available:', window.chartData);
            </script>
        `;
    }
}