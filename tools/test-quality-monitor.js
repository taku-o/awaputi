#!/usr/bin/env node

/**
 * テスト品質監視ツール
 * Issue #106修復後のテスト成功率とメトリクスを継続監視
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestQualityMonitor {
    constructor(options = {}) {
        this.options = {
            targetSuccessRate: options.targetSuccessRate || 95,
            highStabilityTests: options.highStabilityTests || [
                'GameEngine.test.js',
                'SyncManager.test.js', 
                'ScreenshotCapture.test.js'
            ],
            reportDir: options.reportDir || 'test-quality-reports',
            retentionDays: options.retentionDays || 30,
            ...options
        };
        
        this.metrics = {
            timestamp: new Date().toISOString(),
            overallStats: {},
            highStabilityStats: {},
            trendAnalysis: {},
            issues: [],
            recommendations: []
        };
        
        // レポートディレクトリ作成
        this.ensureReportDir();
    }

    /**
     * メイン監視実行
     */
    async monitor() {
        console.log('🔍 Test Quality Monitoring Started');
        console.log(`Target Success Rate: ${this.options.targetSuccessRate}%`);
        console.log(`High Stability Tests: ${this.options.highStabilityTests.join(', ')}`);
        console.log('');

        try {
            // 1. 全体テスト実行
            await this.runOverallTests();
            
            // 2. 高安定性テスト実行  
            await this.runHighStabilityTests();
            
            // 3. 品質メトリクス分析
            await this.analyzeQualityMetrics();
            
            // 4. トレンド分析
            await this.analyzeTrends();
            
            // 5. レポート生成
            await this.generateReport();
            
            // 6. アラート判定
            await this.checkAlerts();
            
            console.log('✅ Test Quality Monitoring Completed');
            
        } catch (error) {
            console.error('❌ Monitoring failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * 全体テスト実行と分析
     */
    async runOverallTests() {
        console.log('📊 Running overall test suite analysis...');
        
        try {
            // Jest でテスト実行（JSONレポート出力）
            const reportPath = path.join(this.options.reportDir, 'overall-test-results.json');
            
            execSync(`npm test -- --json --outputFile=${reportPath} --passWithNoTests`, {
                stdio: 'pipe',
                encoding: 'utf8'
            });
            
            // 結果解析
            if (fs.existsSync(reportPath)) {
                const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
                this.metrics.overallStats = this.parseTestResults(results);
                
                console.log(`  Total Tests: ${this.metrics.overallStats.totalTests}`);
                console.log(`  Passed: ${this.metrics.overallStats.passedTests}`);
                console.log(`  Failed: ${this.metrics.overallStats.failedTests}`);
                console.log(`  Success Rate: ${this.metrics.overallStats.successRate}%`);
            }
            
        } catch (error) {
            console.warn('⚠️ Overall test execution failed:', error.message);
            this.metrics.overallStats = {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 0,
                executionTime: 0,
                issues: ['Overall test execution failed: ' + error.message]
            };
        }
    }

    /**
     * 高安定性テスト実行
     */
    async runHighStabilityTests() {
        console.log('🎯 Running high stability tests...');
        
        this.metrics.highStabilityStats = {
            tests: [],
            overallSuccess: true,
            averageSuccessRate: 0
        };
        
        for (const testPattern of this.options.highStabilityTests) {
            try {
                const reportPath = path.join(this.options.reportDir, `${testPattern.replace(/\./g, '-')}-results.json`);
                
                execSync(`npm test -- --testPathPattern="${testPattern}" --json --outputFile=${reportPath}`, {
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                
                if (fs.existsSync(reportPath)) {
                    const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
                    const stats = this.parseTestResults(results);
                    
                    const testInfo = {
                        name: testPattern,
                        ...stats,
                        target: 100,
                        status: stats.successRate >= 100 ? 'PASS' : 'FAIL'
                    };
                    
                    this.metrics.highStabilityStats.tests.push(testInfo);
                    
                    console.log(`  ${testInfo.status === 'PASS' ? '✅' : '❌'} ${testPattern}: ${stats.successRate}% (${stats.passedTests}/${stats.totalTests})`);
                    
                    if (testInfo.status === 'FAIL') {
                        this.metrics.highStabilityStats.overallSuccess = false;
                        this.metrics.issues.push(`High stability test failed: ${testPattern} (${stats.successRate}%)`);
                    }
                }
                
            } catch (error) {
                console.warn(`  ⚠️ ${testPattern} execution failed:`, error.message);
                this.metrics.highStabilityStats.tests.push({
                    name: testPattern,
                    totalTests: 0,
                    passedTests: 0,
                    failedTests: 0,
                    successRate: 0,
                    status: 'ERROR',
                    error: error.message
                });
                this.metrics.highStabilityStats.overallSuccess = false;
            }
        }
        
        // 平均成功率計算
        const validTests = this.metrics.highStabilityStats.tests.filter(t => t.status !== 'ERROR');
        this.metrics.highStabilityStats.averageSuccessRate = validTests.length > 0
            ? Math.round(validTests.reduce((sum, test) => sum + test.successRate, 0) / validTests.length)
            : 0;
    }

    /**
     * 品質メトリクス分析
     */
    async analyzeQualityMetrics() {
        console.log('📈 Analyzing quality metrics...');
        
        this.metrics.qualityMetrics = {
            targetAchievement: {
                overall: this.metrics.overallStats.successRate >= this.options.targetSuccessRate,
                highStability: this.metrics.highStabilityStats.overallSuccess
            },
            performanceIndicators: {
                testCoverage: await this.calculateTestCoverage(),
                executionTime: this.metrics.overallStats.executionTime || 0,
                flakyTestRate: await this.calculateFlakyTestRate()
            },
            qualityScore: 0
        };
        
        // 品質スコア計算（0-100）
        let score = 0;
        
        // 成功率 (40点満点)
        score += Math.min(40, (this.metrics.overallStats.successRate / this.options.targetSuccessRate) * 40);
        
        // 高安定性テスト (30点満点)  
        score += this.metrics.highStabilityStats.overallSuccess ? 30 : 0;
        
        // カバレッジ (20点満点)
        score += Math.min(20, (this.metrics.qualityMetrics.performanceIndicators.testCoverage / 80) * 20);
        
        // 実行時間 (10点満点) - 180秒以内で満点
        const timeScore = Math.max(0, 10 - (this.metrics.qualityMetrics.performanceIndicators.executionTime / 180) * 10);
        score += Math.min(10, timeScore);
        
        this.metrics.qualityMetrics.qualityScore = Math.round(score);
        
        console.log(`  Quality Score: ${this.metrics.qualityMetrics.qualityScore}/100`);
        console.log(`  Target Achievement: Overall ${this.metrics.qualityMetrics.targetAchievement.overall ? '✅' : '❌'}, High Stability ${this.metrics.qualityMetrics.targetAchievement.highStability ? '✅' : '❌'}`);
    }

    /**
     * トレンド分析
     */
    async analyzeTrends() {
        console.log('📊 Analyzing trends...');
        
        // 過去のレポートを読み込んでトレンド分析
        const historicalData = await this.loadHistoricalData();
        
        this.metrics.trendAnalysis = {
            dataPoints: historicalData.length,
            successRateTrend: this.calculateTrend(historicalData, 'overallSuccessRate'),
            qualityScoreTrend: this.calculateTrend(historicalData, 'qualityScore'),
            recommendations: []
        };
        
        // トレンド判定と推奨アクション
        if (this.metrics.trendAnalysis.successRateTrend < -5) {
            this.metrics.trendAnalysis.recommendations.push('Success rate declining - investigate recent changes');
        }
        
        if (this.metrics.trendAnalysis.qualityScoreTrend < -10) {
            this.metrics.trendAnalysis.recommendations.push('Quality score declining - review test maintenance');
        }
        
        console.log(`  Success Rate Trend: ${this.metrics.trendAnalysis.successRateTrend > 0 ? '+' : ''}${this.metrics.trendAnalysis.successRateTrend}%`);
        console.log(`  Quality Score Trend: ${this.metrics.trendAnalysis.qualityScoreTrend > 0 ? '+' : ''}${this.metrics.trendAnalysis.qualityScoreTrend}`);
    }

    /**
     * レポート生成
     */
    async generateReport() {
        console.log('📝 Generating quality report...');
        
        // JSON レポート
        const jsonReportPath = path.join(this.options.reportDir, `test-quality-report-${Date.now()}.json`);
        fs.writeFileSync(jsonReportPath, JSON.stringify(this.metrics, null, 2));
        
        // 人間が読めるレポート
        const htmlReport = this.generateHTMLReport();
        const htmlReportPath = path.join(this.options.reportDir, `test-quality-report-${Date.now()}.html`);
        fs.writeFileSync(htmlReportPath, htmlReport);
        
        // 最新レポートのシンボリックリンク
        const latestJsonPath = path.join(this.options.reportDir, 'latest-report.json');
        const latestHtmlPath = path.join(this.options.reportDir, 'latest-report.html');
        
        try {
            if (fs.existsSync(latestJsonPath)) fs.unlinkSync(latestJsonPath);
            if (fs.existsSync(latestHtmlPath)) fs.unlinkSync(latestHtmlPath);
            
            fs.symlinkSync(path.basename(jsonReportPath), latestJsonPath);
            fs.symlinkSync(path.basename(htmlReportPath), latestHtmlPath);
        } catch (error) {
            // Windows environment may not support symlinks
            fs.copyFileSync(jsonReportPath, latestJsonPath);
            fs.copyFileSync(htmlReportPath, latestHtmlPath);
        }
        
        console.log(`  JSON Report: ${jsonReportPath}`);
        console.log(`  HTML Report: ${htmlReportPath}`);
    }

    /**
     * アラート判定
     */
    async checkAlerts() {
        console.log('🚨 Checking alerts...');
        
        const alerts = [];
        
        // 成功率アラート
        if (this.metrics.overallStats.successRate < this.options.targetSuccessRate) {
            alerts.push({
                level: 'ERROR',
                message: `Overall success rate (${this.metrics.overallStats.successRate}%) below target (${this.options.targetSuccessRate}%)`,
                action: 'Review recent changes and failing tests'
            });
        }
        
        // 高安定性テストアラート
        if (!this.metrics.highStabilityStats.overallSuccess) {
            alerts.push({
                level: 'CRITICAL',
                message: 'High stability tests failing',
                action: 'Immediate investigation required - core functionality at risk'
            });
        }
        
        // 品質スコアアラート
        if (this.metrics.qualityMetrics.qualityScore < 80) {
            alerts.push({
                level: 'WARNING',
                message: `Quality score (${this.metrics.qualityMetrics.qualityScore}/100) below threshold`,
                action: 'Review test maintenance and coverage'
            });
        }
        
        if (alerts.length > 0) {
            console.log('');
            console.log('🚨 ALERTS DETECTED:');
            alerts.forEach((alert, index) => {
                console.log(`${index + 1}. [${alert.level}] ${alert.message}`);
                console.log(`   Action: ${alert.action}`);
            });
            
            // CI環境では非ゼロ終了コードで失敗を通知
            if (process.env.CI && alerts.some(a => a.level === 'CRITICAL' || a.level === 'ERROR')) {
                process.exit(1);
            }
        } else {
            console.log('✅ No alerts - all quality metrics within acceptable ranges');
        }
    }

    /**
     * ユーティリティメソッド群
     */
    
    ensureReportDir() {
        if (!fs.existsSync(this.options.reportDir)) {
            fs.mkdirSync(this.options.reportDir, { recursive: true });
        }
    }

    parseTestResults(jestResults) {
        const stats = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            successRate: 0,
            executionTime: jestResults.executionTime || 0,
            testFiles: jestResults.testResults?.length || 0
        };
        
        if (jestResults.testResults) {
            jestResults.testResults.forEach(result => {
                stats.totalTests += result.numPassingTests + result.numFailingTests;
                stats.passedTests += result.numPassingTests;
                stats.failedTests += result.numFailingTests;
            });
        }
        
        stats.successRate = stats.totalTests > 0 
            ? Math.round((stats.passedTests / stats.totalTests) * 100)
            : 0;
            
        return stats;
    }

    async calculateTestCoverage() {
        try {
            // Jest カバレッジ実行
            const result = execSync('npm test -- --coverage --coverageReporters=json-summary --passWithNoTests', {
                stdio: 'pipe',
                encoding: 'utf8'
            });
            
            const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json');
            if (fs.existsSync(coveragePath)) {
                const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
                return coverage.total.lines.pct || 0;
            }
        } catch (error) {
            console.warn('⚠️ Coverage calculation failed:', error.message);
        }
        return 0;
    }

    async calculateFlakyTestRate() {
        // 過去のレポートから不安定テストの割合を計算
        // 実装は簡略化版
        return 0;
    }

    async loadHistoricalData() {
        const reports = [];
        try {
            const files = fs.readdirSync(this.options.reportDir)
                .filter(f => f.startsWith('test-quality-report-') && f.endsWith('.json'))
                .sort()
                .slice(-10); // 過去10件
                
            files.forEach(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(this.options.reportDir, file), 'utf8'));
                    reports.push({
                        timestamp: data.timestamp,
                        overallSuccessRate: data.overallStats?.successRate || 0,
                        qualityScore: data.qualityMetrics?.qualityScore || 0
                    });
                } catch (error) {
                    // Skip invalid files
                }
            });
        } catch (error) {
            // No historical data available
        }
        return reports;
    }

    calculateTrend(data, field) {
        if (data.length < 2) return 0;
        
        const recent = data.slice(-3).map(d => d[field]);
        const older = data.slice(-6, -3).map(d => d[field]);
        
        if (recent.length === 0 || older.length === 0) return 0;
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        return Math.round(recentAvg - olderAvg);
    }

    generateHTMLReport() {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Test Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
        .success { border-left-color: #4CAF50; }
        .warning { border-left-color: #FF9800; }
        .error { border-left-color: #F44336; }
        .score { font-size: 2em; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Test Quality Report</h1>
    <p>Generated: ${this.metrics.timestamp}</p>
    
    <h2>Quality Score</h2>
    <div class="score ${this.metrics.qualityMetrics.qualityScore >= 80 ? 'success' : this.metrics.qualityMetrics.qualityScore >= 60 ? 'warning' : 'error'}">
        ${this.metrics.qualityMetrics.qualityScore}/100
    </div>
    
    <h2>Overall Statistics</h2>
    <div class="metric ${this.metrics.overallStats.successRate >= this.options.targetSuccessRate ? 'success' : 'error'}">
        <strong>Success Rate:</strong> ${this.metrics.overallStats.successRate}% 
        (${this.metrics.overallStats.passedTests}/${this.metrics.overallStats.totalTests})
    </div>
    
    <h2>High Stability Tests</h2>
    <table>
        <tr><th>Test</th><th>Success Rate</th><th>Status</th></tr>
        ${this.metrics.highStabilityStats.tests.map(test => `
            <tr>
                <td>${test.name}</td>
                <td>${test.successRate}%</td>
                <td class="${test.status === 'PASS' ? 'success' : 'error'}">${test.status}</td>
            </tr>
        `).join('')}
    </table>
    
    <h2>Issues & Recommendations</h2>
    ${this.metrics.issues.length > 0 ? `
        <h3>Issues:</h3>
        <ul>${this.metrics.issues.map(issue => `<li class="error">${issue}</li>`).join('')}</ul>
    ` : '<p class="success">No issues detected</p>'}
    
    ${this.metrics.recommendations.length > 0 ? `
        <h3>Recommendations:</h3>
        <ul>${this.metrics.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
    ` : ''}
</body>
</html>`;
    }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
    const options = {
        targetSuccessRate: process.argv.includes('--threshold') 
            ? parseInt(process.argv[process.argv.indexOf('--threshold') + 1])
            : 95
    };
    
    const monitor = new TestQualityMonitor(options);
    monitor.monitor().catch(error => {
        console.error('Monitoring failed:', error);
        process.exit(1);
    });
}

export { TestQualityMonitor };