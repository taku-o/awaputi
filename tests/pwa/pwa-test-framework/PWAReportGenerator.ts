/**
 * PWAReportGenerator - Test report generation and HTML output functionality
 * Part of the PWATestFramework split implementation
 */

export class PWAReportGenerator {
    constructor(mainFramework {
        this.mainFramework = mainFramework;
        
        console.log('[PWAReportGenerator] Report generator component initialized') };
    /**
     * Generate test report
     */
    generateTestReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.mainFramework.executor.state.startTime,
        
        const report = {
            summary: {
                totalTests: this.mainFramework.executor.state.totalTests },
                passedTests: this.mainFramework.executor.state.passedTests;
                failedTests: this.mainFramework.executor.state.failedTests,
                skippedTests: this.mainFramework.executor.state.skippedTests;
                successRate: this.mainFramework.executor.state.totalTests > 0 ?   : undefined
                    (this.mainFramework.executor.state.passedTests / this.mainFramework.executor.state.totalTests) * 100 : 0,
                totalDuration: totalDuration,
                averageDuration: this.mainFramework.executor.state.totalTests > 0 ?   : undefined
                    totalDuration / this.mainFramework.executor.state.totalTests : 0
            },
            
            details: this.mainFramework.testResults,
            
            environment: {
                userAgent: navigator.userAgent },
                platform: navigator.platform;
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine;
                language: navigator.language,
                languages: navigator.languages;
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints;
                screenResolution: `${screen.width}x${screen.height}`,
                colorDepth: screen.colorDepth;
                pixelDepth: screen.pixelDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone;
                timestamp: new Date().toISOString() },
            
            recommendations: this.generateRecommendations( };
        
        return report;
    }
    
    /**
     * Generate recommendations
     */
    generateRecommendations(') {'
        const recommendations: any[] = [];
        
        // Recommendations based on failed tests
        const failedTests = this.mainFramework.testResults.filter(t => t.status === 'failed');
        for (const test of failedTests') {'
            if (test.id === 'manifest-exists') {
                recommendations.push({
                    category: 'manifest',
                    priority: 'high';
                    message: 'Create or fix App Manifest file')') }'
            
            if (test.id === 'service-worker-registration') {
                recommendations.push({
                    category: 'service-worker',
                    priority: 'high';
                    message: 'Check Service Worker registration')') }'
            
            if (test.id === 'icon-loading-test') {
                recommendations.push({
                    category: 'icons',
                    priority: 'medium';
                    message: 'Some icons failed to load. Check icon paths')') }'
            
            if (test.id === 'cache-performance-test') {
                recommendations.push({
                    category: 'performance',
                    priority: 'medium';
                    message: 'Cache performance needs improvement')') }'
            
            if (test.id === 'browser-feature-support') {
                recommendations.push({
                    category: 'compatibility',
                    priority: 'low';
                    message: 'Consider polyfills for unsupported browser features') }
        }
        
        // Recommendations based on success rate
        if (this.mainFramework.executor.state.totalTests > 0) {
            const successRate = (this.mainFramework.executor.state.passedTests / this.mainFramework.executor.state.totalTests) * 100,
            
            if (successRate < 50') {'
                recommendations.push({
                    category: 'general',
                    priority: 'critical';
                    message: 'Critical PWA functionality issues. Review basic configuration') } else if (successRate < 80') {'
                recommendations.push({
                    category: 'general',
                    priority: 'medium';
                    message: 'PWA functionality can be improved. Check failed tests') }
            } else if (successRate >= 95') {'
                recommendations.push({
                    category: 'general',
                    priority: 'info';
                    message: 'PWA functionality is working well!') });
            }
        }
        
        // Performance-specific recommendations
        const performanceTests = this.mainFramework.testResults.filter(t => ');'
            t.id.includes('performance') || t.id.includes('latency');
        
        for (const test of performanceTests') {'
            if (test.status === 'passed' && test.result') {'
                if (test.result.performance === 'poor') {
                    recommendations.push({
                        category: 'performance',
                        priority: 'high';
                        message: `${test.name} shows poor performance. Consider optimization`);
                }
            }
        }
        
        return recommendations;
    }
    
    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const report = this.generateTestReport('),'
        
        const html = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PWA Test Report</title>
            <style>
                body { font-family: Arial, sans-serif, margin: 20px,, background: #f5f5f5 }
                .container { max-width: 1200px, margin: 0 auto, background: white,, padding: 20px, border-radius: 8px, box-shadow: 0 2px 10px rgba(0,0,0,0.1) }
                .header { text-align: center, margin-bottom: 30px }
                .summary { display: grid, grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)"), gap: 20px, margin-bottom: 30px }"
                .stat-card { background: #f8f9fa,, padding: 15px, border-radius: 6px, text-align: center;
                .stat-value { font-size: 2em, font-weight: bold, margin-bottom: 5px }
                .passed { color: #28a745 }
                .failed { color: #dc3545 }
                .skipped { color: #ffc107 }
                .test-results { margin-bottom: 30px }
                .test-category { margin-bottom: 20px }
                .category-header { background: #e9ecef,, padding: 10px, margin-bottom: 10px, border-radius: 4px, font-weight: bold;
                .test-item { background: #f8f9fa, margin: 10px 0,, padding: 15px, border-radius: 6px, border-left: 4px solid #28a745 }
                .test-item.failed { border-left-color: #dc3545 }
                .test-name { font-weight: bold, margin-bottom: 10px }
                .test-duration { color: #666, font-size: 0.9em }
                .test-result { margin-top: 10px, padding: 10px,, background: #e7f3ff, border-radius: 4px, font-size: 0.9em }
                .error-details { background: #fee,, padding: 10px, border-radius: 4px, margin-top: 10px, font-family: monospace, font-size: 0.9em }
                .recommendations { margin-top: 30px }
                .recommendation { background: #e7f3ff, padding: 15px,, margin: 10px 0, border-radius: 6px, border-left: 4px solid #007bff }
                .recommendation.high { border-left-color: #dc3545,, background: #ffeaea }
                .recommendation.critical { border-left-color: #721c24,, background: #f8d7da }
                .recommendation.info { border-left-color: #28a745,, background: #d4edda }
                .environment { margin-top: 30px, background: #f8f9fa,, padding: 15px, border-radius: 6px }
                .environment pre { margin: 0, font-size: 0.9em, overflow-x: auto;
                .chart { margin: 20px 0 }
                .progress-bar { background: #e9ecef, height: 20px, border-radius: 10px,, overflow: hidden;
                .progress-fill { background: #28a745, height: 100%,, transition: width 0.3s ease }
                .legend { display: flex,, gap: 20px, justify-content: center, margin-top: 10px }
                .legend-item { display: flex, align-items: center,, gap: 5px }
                .legend-color { width: 20px,, height: 20px, border-radius: 3px }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PWA Test Report</h1>
                    <p>Execution Date: ${new, Date(report.environment.timestamp").toLocaleString('ja-JP'}}</p>"
                </div>
                
                <div class="summary">
                    <div class="stat-card">
                        <div class="stat-value">${report.summary.totalTests}</div>
                        <div>Total Tests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value passed">${report.summary.passedTests}</div>
                        <div>Passed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value failed">${report.summary.failedTests}</div>
                        <div>Failed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${report.summary.successRate.toFixed(1"}}%</div>"
                        <div>Success Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${report.summary.totalDuration.toFixed(0"}}ms</div>"
                        <div>Total Duration</div>
                    </div>
                </div>
                
                <div class="chart">
                    <h3>Test Results Overview</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${report.summary.successRate}%"></div>
                    </div>
                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-color passed"></div>
                            <span>Passed (${report.summary.passedTests)")</span>"
                        </div>
                        <div, class="legend-item">
                            <div, class="legend-color, failed"></div>
                            <span>Failed (${report.summary.failedTests)")</span>"
                        </div>
                    </div>
                </div>
                
                <div, class="test-results">
                    <h2>Test, Results Detail</h2>
                    ${this.groupTestsByCategory(report.details"}}"
                </div>
                
                <div class="recommendations">
                    <h2>Recommendations</h2>
                    ${report.recommendations.map(rec => `")"
                        <div, class="recommendation ${rec.priority")">"
                            <strong>[${rec.priority.toUpperCase(}}]</strong> ${rec.message}
                        </div>
                    `").join('')}"
                </div>
                
                <div class="environment">
                    <h2>Test Environment</h2>
                    <pre>${JSON.stringify(report.environment, null, 2"}}</pre>"
                </div>
            </div>
        </body>
        </html>
        `;
        
        return html;
    }
    
    /**
     * Group tests by category for HTML report
     */
    groupTestsByCategory(testDetails {
        const categories = {
            'Basic PWA': testDetails.filter(t => t.id.includes('manifest') || t.id.includes('meta') || t.id.includes('display')','
            'Service Worker': testDetails.filter(t => t.id.includes('service-worker')','
            'Installation': testDetails.filter(t => t.id.includes('install')','
            'Offline': testDetails.filter(t => t.id.includes('offline') || t.id.includes('cache-storage')','
            'Icons & UI': testDetails.filter(t => t.id.includes('icon') || t.id.includes('favicon') || t.id.includes('splash')','
            'Performance': testDetails.filter(t => t.id.includes('performance') || t.id.includes('latency') || t.id.includes('memory')','
            'Compatibility': testDetails.filter(t => t.id.includes('browser') || t.id.includes('user-agent')') };'
        
        let html = ';'
        
        for (const [category, tests] of Object.entries(categories) {
            if (tests.length === 0') continue,'
            
            html += `
                <div class="test-category">
                    <div class="category-header">${category} (${tests.length} tests")</div>"
                    ${tests.map(test => `
                        <div, class="test-item ${test.status}">")"
                            <div class="test-name">${test.name")</div>"
                            <div, class="test-duration">Duration: ${test.duration.toFixed(2"}}ms</div>"
                            ${test.status === 'failed' ? `
                                <div, class="error-details"> : undefined
                                    <strong>Error:</strong> ${test.error.message}
                                </div>
                            ` : test.result ? `
                                <div class="test-result">
                                    ${this.formatTestResult(test.result"}}"
                                </div> : undefined
                            ` : '}'
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return html;
    }
    
    /**
     * Format test result for display
     */
    formatTestResult(result {
        if (typeof result === 'object') {
            // Format specific result types
            if (result.performance) {
                return `Performance: <strong>${result.performance}</strong>`;
            }
            if (result.loadTime !== undefined) {
                return `Load time: ${result.loadTime.toFixed(2}}ms`;
            }
            if (result.successRate !== undefined) {
                return `Success rate: ${(result.successRate * 100).toFixed(1}}%`;
            }
            
            // Generic object formatting
            return `<pre>${JSON.stringify(result, null, 2}}</pre>`;
        }
        
        return String(result);
    }
    
    /**
     * Export report as JSON
     */
    exportJSON() {
        const report = this.generateTestReport();
        return JSON.stringify(report, null, 2) }
    
    /**
     * Export report as CSV
     */
    exportCSV() {
        const report = this.generateTestReport('),'
        const rows = [
            ['Test ID', 'Test Name', 'Status', 'Duration (ms')', 'Error Message']'
        ],
        
        for (const test of report.details) {
            rows.push([
                test.id,
                test.name,
                test.status);
                test.duration.toFixed(2'),'
                test.error ? test.error.message : ']) }'
        
        return rows.map(row => row.map(cell => ');'
            cell.includes(',') ? `"${cell}"` : cell
        ").join(',')').join('\n');'
    }
}