import { BaseComponent } from '../BaseComponent.js';

/**
 * TestResultProcessor - テスト結果処理・フォーマットコンポーネント
 */
export class TestResultProcessor extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'TestResultProcessor');
    }

    /**
     * テスト結果を分析
     * @param {Object} results - テスト結果
     * @returns {Object} 分析結果
     */
    analyzeTestResults(results = null) {
        const targetResults = results || this.getLatestTestResults();
        if (!targetResults) {
            return null;
        }

        const analysis = {
            summary: this.createTestSummary(targetResults),
            performance: this.analyzePerformanceMetrics(targetResults),
            trends: this.analyzeTestTrends(),
            recommendations: this.generateRecommendations(targetResults)
        };

        return analysis;
    }

    /**
     * テストサマリーを作成
     * @param {Object} results - テスト結果
     * @returns {Object} サマリー
     */
    createTestSummary(results) {
        return {
            totalTests: results.passed + results.failed + results.skipped,
            passed: results.passed,
            failed: results.failed,
            skipped: results.skipped,
            successRate: results.passed / (results.passed + results.failed),
            executionTime: results.executionTime
        };
    }

    /**
     * パフォーマンスメトリクスを分析
     * @param {Object} results - テスト結果
     * @returns {Object} パフォーマンス分析
     */
    analyzePerformanceMetrics(results) {
        const performanceTests = results.results.filter(r => r.category === 'performance');
        
        if (performanceTests.length === 0) {
            return {
                averageExecutionTime: 0,
                slowestTest: null,
                fastestTest: null
            };
        }

        return {
            averageExecutionTime: performanceTests.reduce((sum, test) => sum + test.executionTime, 0) / performanceTests.length,
            slowestTest: performanceTests.reduce((slowest, test) => 
                test.executionTime > slowest.executionTime ? test : slowest, performanceTests[0]),
            fastestTest: performanceTests.reduce((fastest, test) => 
                test.executionTime < fastest.executionTime ? test : fastest, performanceTests[0])
        };
    }

    /**
     * テストトレンドを分析
     * @returns {Object|null} トレンド分析
     */
    analyzeTestTrends() {
        const testHistory = this.mainController.testEnvironment?.testHistory || [];
        const recentSessions = testHistory.slice(-10);
        
        if (recentSessions.length < 2) {
            return null;
        }

        const successRates = recentSessions.map(session => 
            session.results.passed / (session.results.passed + session.results.failed));
        
        const executionTimes = recentSessions.map(session => session.executionTime);

        return {
            successRateTrend: this.calculateTrend(successRates),
            executionTimeTrend: this.calculateTrend(executionTimes),
            recentAverage: successRates.slice(-5).reduce((sum, rate) => sum + rate, 0) / 5
        };
    }

    /**
     * トレンドを計算
     * @param {Array} values - 値の配列
     * @returns {string} トレンド
     */
    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-3);
        const older = values.slice(-6, -3);
        
        if (older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (change > 0.05) return 'improving';
        if (change < -0.05) return 'declining';
        return 'stable';
    }

    /**
     * 推奨事項を生成
     * @param {Object} results - テスト結果
     * @returns {Array} 推奨事項
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        if (results.failed > 0) {
            recommendations.push({
                type: 'error',
                message: `${results.failed} tests failed. Review failing tests and fix issues.`,
                priority: 'high'
            });
        }

        if (results.executionTime > 30000) { // 30秒以上
            recommendations.push({
                type: 'performance',
                message: 'Test execution time is high. Consider optimizing slow tests.',
                priority: 'medium'
            });
        }

        const successRate = results.passed / (results.passed + results.failed);
        if (successRate < 0.9) {
            recommendations.push({
                type: 'quality',
                message: 'Test success rate is below 90%. Improve test reliability.',
                priority: 'high'
            });
        }

        return recommendations;
    }

    /**
     * 最新のテスト結果を取得
     * @returns {Object|null} テスト結果
     */
    getLatestTestResults() {
        const testHistory = this.mainController.testEnvironment?.testHistory;
        if (!testHistory || testHistory.length === 0) {
            return null;
        }
        
        return testHistory[testHistory.length - 1]?.results;
    }

    /**
     * テスト結果をフォーマット
     * @param {Object} results - テスト結果
     * @returns {string} フォーマット済み文字列
     */
    formatTestResults(results) {
        const lines = [];
        
        lines.push('Test Results Summary');
        lines.push('===================');
        lines.push(`Total Tests: ${results.passed + results.failed + results.skipped}`);
        lines.push(`Passed: ${results.passed}`);
        lines.push(`Failed: ${results.failed}`);
        lines.push(`Skipped: ${results.skipped}`);
        lines.push(`Success Rate: ${(results.passed / (results.passed + results.failed) * 100).toFixed(1)}%`);
        lines.push(`Execution Time: ${results.executionTime.toFixed(0)}ms`);
        
        if (results.results && results.results.length > 0) {
            lines.push('');
            lines.push('Test Details:');
            lines.push('-------------');
            
            results.results.forEach(test => {
                const status = test.passed ? 'PASS' : test.failed ? 'FAIL' : 'SKIP';
                lines.push(`[${status}] ${test.name} (${test.executionTime.toFixed(0)}ms)`);
                
                if (test.failed && test.error) {
                    lines.push(`  Error: ${test.error.message}`);
                }
                
                if (test.metrics && Object.keys(test.metrics).length > 0) {
                    lines.push(`  Metrics: ${JSON.stringify(test.metrics)}`);
                }
            });
        }
        
        return lines.join('\n');
    }

    /**
     * レポートを生成
     * @param {Object} results - テスト結果
     * @returns {Object} レポート
     */
    generateReport(results) {
        const analysis = this.analyzeTestResults(results);
        
        return {
            timestamp: Date.now(),
            results: results,
            analysis: analysis,
            formatted: this.formatTestResults(results),
            recommendations: analysis.recommendations,
            health: this.assessOverallHealth(results, analysis)
        };
    }

    /**
     * 全体的な健全性を評価
     * @param {Object} results - テスト結果
     * @param {Object} analysis - 分析結果
     * @returns {string} 健全性評価
     */
    assessOverallHealth(results, analysis) {
        const successRate = results.passed / (results.passed + results.failed);
        
        if (results.failed === 0 && results.executionTime < 10000) {
            return 'excellent';
        } else if (successRate >= 0.9 && results.executionTime < 30000) {
            return 'good';
        } else if (successRate >= 0.7) {
            return 'fair';
        } else {
            return 'poor';
        }
    }

    /**
     * 結果をエクスポート
     * @param {Object} results - テスト結果
     * @param {string} format - フォーマット (json, csv, txt)
     * @returns {string} エクスポートデータ
     */
    exportResults(results, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(results, null, 2);
            
            case 'csv':
                return this.exportAsCSV(results);
            
            case 'txt':
                return this.formatTestResults(results);
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * CSV形式でエクスポート
     * @private
     */
    exportAsCSV(results) {
        const lines = [];
        
        // ヘッダー
        lines.push('Test Name,Category,Status,Execution Time (ms),Error Message');
        
        // データ行
        results.results.forEach(test => {
            const status = test.passed ? 'PASS' : test.failed ? 'FAIL' : 'SKIP';
            const errorMsg = test.error ? test.error.message.replace(/,/g, ';') : '';
            
            lines.push(`"${test.name}","${test.category}","${status}",${test.executionTime.toFixed(0)},"${errorMsg}"`);
        });
        
        return lines.join('\n');
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
    }
}