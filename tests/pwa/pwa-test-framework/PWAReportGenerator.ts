/**
 * PWAReportGenerator - Test report generation and HTML output functionality
 * Part of the PWATestFramework split implementation
 */

export class PWAReportGenerator {
    private mainFramework: any;

    constructor(mainFramework: any) {
        this.mainFramework = mainFramework;
        
        console.log('[PWAReportGenerator] Report generator component initialized');
    }

    /**
     * Generate test report
     */
    generateTestReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.mainFramework.executor.state.startTime;
        
        const report = {
            summary: {
                totalTests: this.mainFramework.executor.state.totalTests,
                passedTests: this.mainFramework.executor.state.passedTests,
                failedTests: this.mainFramework.executor.state.failedTests,
                skippedTests: this.mainFramework.executor.state.skippedTests,
                successRate: this.mainFramework.executor.state.totalTests > 0 
                    ? (this.mainFramework.executor.state.passedTests / this.mainFramework.executor.state.totalTests) * 100 
                    : 0,
                totalDuration: totalDuration,
                averageDuration: this.mainFramework.executor.state.totalTests > 0 
                    ? totalDuration / this.mainFramework.executor.state.totalTests 
                    : 0
            },
            
            details: this.mainFramework.testResults,
            
            environment: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                language: navigator.language,
                languages: navigator.languages,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                screenResolution: `${screen.width}x${screen.height}`,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestamp: new Date().toISOString()
            },
            
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }
    
    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations: string[] = [];
        
        // Analyze test results for recommendations
        if (this.mainFramework.executor.state.failedTests > 0) {
            recommendations.push('Some PWA tests failed. Review failed test details for specific improvements.');
        }
        
        // Check Service Worker support
        if (!('serviceWorker' in navigator)) {
            recommendations.push('Service Worker is not supported in this environment. PWA functionality will be limited.');
        }
        
        // Check HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            recommendations.push('PWA requires HTTPS for production deployment. Ensure your site uses HTTPS.');
        }
        
        // Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (!manifestLink) {
            recommendations.push('Web App Manifest is missing. Add a manifest.json file and link to it in your HTML.');
        }
        
        // Check for performance issues
        if (this.mainFramework.testResults.some((result: any) => 
            result.testName === 'load-performance-test' && result.result?.totalLoadTime > 5000)) {
            recommendations.push('Resource loading is slow. Consider optimizing assets and implementing caching strategies.');
        }
        
        // Check memory usage
        if (this.mainFramework.testResults.some((result: any) => 
            result.testName === 'memory-usage-test' && result.result?.memoryUtilization > 80)) {
            recommendations.push('High memory usage detected. Review and optimize JavaScript code for memory efficiency.');
        }
        
        return recommendations;
    }
    
    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const report = this.generateTestReport();
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PWA Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .summary-card h3 {
            margin: 0 0 10px;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .summary-card .unit {
            color: #888;
            font-size: 0.8em;
        }
        
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .success-rate { color: #2196F3; }
        .duration { color: #FF9800; }
        
        .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .section-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .section-header h2 {
            margin: 0;
            color: #495057;
        }
        
        .section-content {
            padding: 20px;
        }
        
        .test-result {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .test-result.passed {
            background-color: #f1f8e9;
            border-left-color: #4CAF50;
        }
        
        .test-result.failed {
            background-color: #ffebee;
            border-left-color: #f44336;
        }
        
        .test-result.skipped {
            background-color: #fff3e0;
            border-left-color: #FF9800;
        }
        
        .test-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .test-description {
            color: #666;
            margin-bottom: 10px;
        }
        
        .test-duration {
            font-size: 0.8em;
            color: #888;
        }
        
        .test-error {
            background-color: #ffebee;
            border: 1px solid #ffcdd2;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #d32f2f;
        }
        
        .recommendations {
            margin-top: 20px;
        }
        
        .recommendation {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .recommendation:before {
            content: "💡 ";
            margin-right: 5px;
        }
        
        .environment-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .env-item {
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        
        .env-label {
            font-weight: bold;
            color: #495057;
        }
        
        .env-value {
            color: #6c757d;
            word-break: break-all;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .summary {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            .environment-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 PWA Test Report</h1>
        <p>Generated on ${new Date(report.environment.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="value">${report.summary.totalTests}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="value passed">${report.summary.passedTests}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="value failed">${report.summary.failedTests}</div>
        </div>
        <div class="summary-card">
            <h3>Success Rate</h3>
            <div class="value success-rate">${report.summary.successRate.toFixed(1)}<span class="unit">%</span></div>
        </div>
        <div class="summary-card">
            <h3>Total Duration</h3>
            <div class="value duration">${(report.summary.totalDuration / 1000).toFixed(2)}<span class="unit">s</span></div>
        </div>
        <div class="summary-card">
            <h3>Average Duration</h3>
            <div class="value duration">${(report.summary.averageDuration / 1000).toFixed(2)}<span class="unit">s</span></div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-header">
            <h2>📋 Test Results</h2>
        </div>
        <div class="section-content">
            ${report.details.map((result: any) => `
                <div class="test-result ${result.status}">
                    <div class="test-name">${result.testName}</div>
                    <div class="test-description">${result.description}</div>
                    <div class="test-duration">Duration: ${(result.duration / 1000).toFixed(3)}s</div>
                    ${result.error ? `<div class="test-error">${result.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="section">
        <div class="section-header">
            <h2>🌍 Environment Information</h2>
        </div>
        <div class="section-content">
            <div class="environment-info">
                <div class="env-item">
                    <div class="env-label">User Agent</div>
                    <div class="env-value">${report.environment.userAgent}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Platform</div>
                    <div class="env-value">${report.environment.platform}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Language</div>
                    <div class="env-value">${report.environment.language}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Screen Resolution</div>
                    <div class="env-value">${report.environment.screenResolution}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Color Depth</div>
                    <div class="env-value">${report.environment.colorDepth} bits</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Hardware Concurrency</div>
                    <div class="env-value">${report.environment.hardwareConcurrency} cores</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Online Status</div>
                    <div class="env-value">${report.environment.onLine ? 'Online' : 'Offline'}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Cookies Enabled</div>
                    <div class="env-value">${report.environment.cookieEnabled ? 'Yes' : 'No'}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Timezone</div>
                    <div class="env-value">${report.environment.timezone}</div>
                </div>
            </div>
        </div>
    </div>
    
    ${report.recommendations.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>💡 Recommendations</h2>
        </div>
        <div class="section-content">
            <div class="recommendations">
                ${report.recommendations.map((rec: string) => `
                    <div class="recommendation">${rec}</div>
                `).join('')}
            </div>
        </div>
    </div>
    ` : ''}
    
</body>
</html>
        `;
        
        return html;
    }
    
    /**
     * Save HTML report to file
     */
    saveHTMLReport(filename = 'pwa-test-report.html') {
        const html = this.generateHTMLReport();
        
        // Create blob and download link
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log(`[PWAReportGenerator] HTML report saved as: ${filename}`);
    }
    
    /**
     * Generate JSON report
     */
    generateJSONReport() {
        const report = this.generateTestReport();
        return JSON.stringify(report, null, 2);
    }
    
    /**
     * Save JSON report to file
     */
    saveJSONReport(filename = 'pwa-test-report.json') {
        const json = this.generateJSONReport();
        
        // Create blob and download link
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log(`[PWAReportGenerator] JSON report saved as: ${filename}`);
    }
    
    /**
     * Log report to console
     */
    logReport() {
        const report = this.generateTestReport();
        
        console.group('📊 PWA Test Report');
        console.log('Summary:', report.summary);
        console.log('Environment:', report.environment);
        if (report.recommendations.length > 0) {
            console.log('Recommendations:', report.recommendations);
        }
        console.groupEnd();
        
        return report;
    }
}