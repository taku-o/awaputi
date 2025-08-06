/**
 * SEO Report Generator Component
 * 
 * レポート生成機能を担当
 * SEOTester のサブコンポーネント
 */

import { seoLogger } from '../SEOLogger.js';
import { seoErrorHandler } from '../SEOErrorHandler.js';

export class SEOReportGenerator {
    constructor(mainController) {
        this.mainController = mainController;
        this.baseUrl = mainController.baseUrl;
    }

    /**
     * テスト結果のエクスポート
     * @param {Object} results - テスト結果
     * @param {string} format - エクスポート形式 ('json', 'html', 'csv')
     * @returns {string}
     */
    exportResults(results, format = 'json') {
        try {
            switch (format) {
                case 'json':
                    return this._generateJSONReport(results);
                
                case 'html':
                    return this._generateHTMLReport(results);
                
                case 'csv':
                    return this._generateCSVReport(results);
                
                case 'xml':
                    return this._generateXMLReport(results);
                
                case 'markdown':
                    return this._generateMarkdownReport(results);
                
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            return seoErrorHandler.handle(error, 'exportResults', { format });
        }
    }

    /**
     * Lighthouseスコア監視
     * @returns {Promise<Object>}
     */
    async monitorLighthouseScore() {
        try {
            // 実際の実装では Lighthouse API を使用
            // ここではモックデータを返す
            const lighthouseScore = {
                performance: 95,
                accessibility: 92,
                bestPractices: 88,
                seo: 96,
                timestamp: new Date().toISOString(),
                details: {
                    performance: {
                        'first-contentful-paint': 1200,
                        'speed-index': 1300,
                        'largest-contentful-paint': 1500,
                        'interactive': 2000,
                        'total-blocking-time': 150,
                        'cumulative-layout-shift': 0.05
                    },
                    accessibility: {
                        'color-contrast': 'pass',
                        'image-alt': 'pass',
                        'heading-order': 'pass',
                        'label': 'pass'
                    },
                    seo: {
                        'meta-description': 'pass',
                        'document-title': 'pass',
                        'structured-data': 'pass',
                        'robots-txt': 'pass'
                    }
                }
            };
            
            seoLogger.info('Lighthouse score monitored', lighthouseScore);
            return lighthouseScore;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'monitorLighthouseScore');
        }
    }

    /**
     * 詳細レポートの生成
     * @param {Object} results - テスト結果
     * @param {Object} options - レポートオプション
     * @returns {Object}
     */
    generateDetailedReport(results, options = {}) {
        try {
            const {
                includeRecommendations = true,
                includeTimeline = true,
                includeComparison = false,
                previousResults = null
            } = options;

            const detailedReport = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    baseUrl: this.baseUrl,
                    reportVersion: '1.0.0',
                    totalTests: results.summary?.totalTests || 0,
                    executionTime: results.executionTime || 0
                },
                summary: this._generateExecutiveSummary(results),
                categories: this._enhanceCategoryResults(results.categories || {}),
                recommendations: includeRecommendations ? this._generateRecommendations(results) : null,
                timeline: includeTimeline ? this._generateTimeline(results) : null,
                comparison: includeComparison && previousResults ? this._generateComparison(results, previousResults) : null,
                visualizations: this._generateVisualizationData(results)
            };

            return detailedReport;

        } catch (error) {
            return seoErrorHandler.handle(error, 'generateDetailedReport', options);
        }
    }

    /**
     * レポートの可視化データ生成
     * @param {Object} results - テスト結果
     * @returns {Object}
     */
    generateVisualizationData(results) {
        try {
            return {
                scoreDistribution: this._calculateScoreDistribution(results),
                categoryBreakdown: this._calculateCategoryBreakdown(results),
                timeSeriesData: this._generateTimeSeriesData(results),
                heatmapData: this._generateHeatmapData(results)
            };
        } catch (error) {
            return seoErrorHandler.handle(error, 'generateVisualizationData');
        }
    }

    // プライベートメソッド

    /**
     * JSONレポートの生成
     * @private
     */
    _generateJSONReport(results) {
        return JSON.stringify(results, null, 2);
    }

    /**
     * HTMLレポートの生成
     * @private
     */
    _generateHTMLReport(results) {
        const timestamp = new Date().toLocaleString('ja-JP');
        const overallScore = results.overallScore || 0;
        const scoreColor = overallScore >= 90 ? '#4CAF50' : overallScore >= 70 ? '#FF9800' : '#f44336';

        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Test Report - ${timestamp}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            padding: 30px; 
            background: #f8f9fa;
        }
        .summary-card { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 { margin: 0 0 10px; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .warning { color: #ff9800; }
        .score { color: ${scoreColor}; font-size: 3em; }
        .category { 
            margin: 0; 
            border-bottom: 1px solid #eee;
        }
        .category:last-child { border-bottom: none; }
        .category-header { 
            background: #f8f9fa; 
            padding: 20px 30px; 
            border-left: 4px solid #4CAF50;
            margin: 0;
        }
        .category-header h3 { 
            margin: 0; 
            color: #333; 
            font-size: 1.3em;
        }
        .test { 
            padding: 15px 30px; 
            border-bottom: 1px solid #f0f0f0; 
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-result { font-size: 0.9em; }
        .footer { 
            background: #333; 
            color: white; 
            text-align: center; 
            padding: 20px;
        }
        @media (max-width: 768px) {
            .summary { grid-template-columns: 1fr; }
            .test { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEO Test Report</h1>
            <p>Generated on ${timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Overall Score</h3>
                <div class="number score">${overallScore}%</div>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${results.summary?.totalTests || 0}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${results.summary?.passedTests || 0}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${results.summary?.failedTests || 0}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div class="number warning">${results.summary?.warnings || 0}</div>
            </div>
        </div>
        
        ${Object.entries(results.categories || {}).map(([name, category]) => `
        <div class="category">
            <div class="category-header">
                <h3>${category.category}</h3>
            </div>
            ${category.tests?.map(test => `
            <div class="test">
                <div class="test-name">${test.name}</div>
                <div class="test-result ${test.passed ? 'passed' : test.message?.includes('⚠️') ? 'warning' : 'failed'}">
                    ${test.message}
                </div>
            </div>
            `).join('') || ''}
        </div>
        `).join('')}
        
        <div class="footer">
            <p>Generated by SEOTester v1.0.0 | ${this.baseUrl}</p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * CSVレポートの生成
     * @private
     */
    _generateCSVReport(results) {
        const rows = ['Category,Test Name,Status,Message'];
        
        Object.entries(results.categories || {}).forEach(([name, category]) => {
            category.tests?.forEach(test => {
                const status = test.passed ? 'PASSED' : test.message?.includes('⚠️') ? 'WARNING' : 'FAILED';
                const message = (test.message || '').replace(/,/g, ';').replace(/"/g, '""');
                rows.push(`"${category.category}","${test.name}","${status}","${message}"`);
            });
        });
        
        return rows.join('\n');
    }

    /**
     * XMLレポートの生成
     * @private
     */
    _generateXMLReport(results) {
        const escapeXml = (text) => {
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const timestamp = new Date().toISOString();
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<seo-report generated="${timestamp}" url="${escapeXml(this.baseUrl)}">
    <summary>
        <overall-score>${results.overallScore || 0}</overall-score>
        <total-tests>${results.summary?.totalTests || 0}</total-tests>
        <passed-tests>${results.summary?.passedTests || 0}</passed-tests>
        <failed-tests>${results.summary?.failedTests || 0}</failed-tests>
        <warnings>${results.summary?.warnings || 0}</warnings>
        <execution-time>${results.executionTime || 0}</execution-time>
    </summary>
    <categories>`;

        Object.entries(results.categories || {}).forEach(([name, category]) => {
            xml += `
        <category name="${escapeXml(category.category)}">
            <tests>`;
            
            category.tests?.forEach(test => {
                const status = test.passed ? 'passed' : test.message?.includes('⚠️') ? 'warning' : 'failed';
                xml += `
                <test name="${escapeXml(test.name)}" status="${status}">
                    <message>${escapeXml(test.message || '')}</message>
                </test>`;
            });
            
            xml += `
            </tests>
        </category>`;
        });

        xml += `
    </categories>
</seo-report>`;

        return xml;
    }

    /**
     * Markdownレポートの生成
     * @private
     */
    _generateMarkdownReport(results) {
        const timestamp = new Date().toLocaleString('ja-JP');
        const overallScore = results.overallScore || 0;
        const scoreEmoji = overallScore >= 90 ? '🟢' : overallScore >= 70 ? '🟡' : '🔴';

        let markdown = `# SEO Test Report

**Generated:** ${timestamp}  
**URL:** ${this.baseUrl}  
**Overall Score:** ${scoreEmoji} ${overallScore}%

## Summary

| Metric | Count |
|--------|--------|
| Total Tests | ${results.summary?.totalTests || 0} |
| Passed | ✅ ${results.summary?.passedTests || 0} |
| Failed | ❌ ${results.summary?.failedTests || 0} |
| Warnings | ⚠️ ${results.summary?.warnings || 0} |

`;

        Object.entries(results.categories || {}).forEach(([name, category]) => {
            markdown += `## ${category.category}\n\n`;
            
            category.tests?.forEach(test => {
                const status = test.passed ? '✅' : test.message?.includes('⚠️') ? '⚠️' : '❌';
                markdown += `- ${status} **${test.name}**: ${test.message}\n`;
            });
            
            markdown += '\n';
        });

        markdown += `---
*Generated by SEOTester v1.0.0*`;

        return markdown;
    }

    /**
     * エグゼクティブサマリーの生成
     * @private
     */
    _generateExecutiveSummary(results) {
        const overallScore = results.overallScore || 0;
        const totalTests = results.summary?.totalTests || 0;
        const passedTests = results.summary?.passedTests || 0;
        const failedTests = results.summary?.failedTests || 0;
        const warnings = results.summary?.warnings || 0;

        let grade, priority, recommendation;

        if (overallScore >= 90) {
            grade = 'Excellent';
            priority = 'Low';
            recommendation = 'Maintain current SEO practices and monitor for any changes.';
        } else if (overallScore >= 80) {
            grade = 'Good';
            priority = 'Medium';
            recommendation = 'Address warning items to improve SEO performance.';
        } else if (overallScore >= 70) {
            grade = 'Fair';
            priority = 'High';
            recommendation = 'Focus on resolving failed tests and critical issues.';
        } else {
            grade = 'Poor';
            priority = 'Critical';
            recommendation = 'Immediate action required to improve SEO fundamentals.';
        }

        return {
            grade,
            priority,
            recommendation,
            keyMetrics: {
                overallScore,
                totalTests,
                passedTests,
                failedTests,
                warnings,
                passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
            }
        };
    }

    /**
     * カテゴリ結果の拡張
     * @private
     */
    _enhanceCategoryResults(categories) {
        const enhanced = {};
        
        Object.entries(categories).forEach(([key, category]) => {
            enhanced[key] = {
                ...category,
                score: category.tests?.length > 0 
                    ? Math.round((category.passed / category.tests.length) * 100) 
                    : 0,
                impact: this._calculateCategoryImpact(category),
                priority: this._calculateCategoryPriority(category)
            };
        });
        
        return enhanced;
    }

    /**
     * カテゴリの影響度計算
     * @private
     */
    _calculateCategoryImpact(category) {
        const failedRatio = category.tests?.length > 0 ? category.failed / category.tests.length : 0;
        
        if (failedRatio > 0.5) return 'High';
        if (failedRatio > 0.2) return 'Medium';
        return 'Low';
    }

    /**
     * カテゴリの優先度計算
     * @private
     */
    _calculateCategoryPriority(category) {
        const criticalCategories = ['Meta Tags', 'Structured Data', 'Performance Optimization'];
        
        if (criticalCategories.includes(category.category) && category.failed > 0) {
            return 'High';
        }
        
        return category.failed > category.passed ? 'Medium' : 'Low';
    }

    /**
     * 推奨事項の生成
     * @private
     */
    _generateRecommendations(results) {
        const recommendations = [];
        
        Object.entries(results.categories || {}).forEach(([key, category]) => {
            category.tests?.forEach(test => {
                if (!test.passed && !test.message?.includes('⚠️')) {
                    recommendations.push({
                        category: category.category,
                        test: test.name,
                        issue: test.message,
                        recommendation: this._getRecommendationForTest(test.name),
                        priority: this._getRecommendationPriority(test.name, category.category)
                    });
                }
            });
        });
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * テスト別推奨事項の取得
     * @private
     */
    _getRecommendationForTest(testName) {
        const recommendations = {
            'Required meta tag: title': 'Add a descriptive title tag to your HTML head section.',
            'Required meta tag: description': 'Add a meta description tag with a compelling summary of your page.',
            'Title length validation': 'Optimize your title tag length to be between 10-60 characters.',
            'Required OG tag: og:image': 'Add an Open Graph image tag for better social media sharing.',
            'Structured data presence': 'Implement structured data markup using JSON-LD format.',
            'WebP support detection': 'Consider implementing WebP image format for better performance.',
            'Image alt attributes': 'Add descriptive alt attributes to all images for accessibility.',
            'Sitemap accessibility': 'Create and submit an XML sitemap to search engines.',
            'Robots.txt accessibility': 'Create a robots.txt file to guide search engine crawlers.'
        };
        
        return recommendations[testName] || 'Review and optimize this SEO element according to best practices.';
    }

    /**
     * 推奨事項の優先度取得
     * @private
     */
    _getRecommendationPriority(testName, category) {
        const highPriorityTests = [
            'Required meta tag: title',
            'Required meta tag: description',
            'Structured data presence'
        ];
        
        const criticalCategories = ['Meta Tags', 'Structured Data'];
        
        if (highPriorityTests.includes(testName)) return 'Critical';
        if (criticalCategories.includes(category)) return 'High';
        
        return 'Medium';
    }

    /**
     * タイムラインの生成
     * @private
     */
    _generateTimeline(results) {
        return {
            testStartTime: new Date(Date.now() - (results.executionTime || 0)).toISOString(),
            testEndTime: new Date().toISOString(),
            executionTime: results.executionTime || 0,
            phases: [
                { name: 'Meta Tags Validation', duration: 100 },
                { name: 'Structured Data Validation', duration: 150 },
                { name: 'Performance Testing', duration: 300 },
                { name: 'Accessibility Testing', duration: 200 },
                { name: 'Report Generation', duration: 50 }
            ]
        };
    }

    /**
     * スコア分布計算
     * @private
     */
    _calculateScoreDistribution(results) {
        const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
        
        Object.values(results.categories || {}).forEach(category => {
            const score = category.tests?.length > 0 
                ? (category.passed / category.tests.length) * 100 
                : 0;
            
            if (score >= 90) distribution.excellent++;
            else if (score >= 80) distribution.good++;
            else if (score >= 70) distribution.fair++;
            else distribution.poor++;
        });
        
        return distribution;
    }

    /**
     * カテゴリ別内訳計算
     * @private
     */
    _calculateCategoryBreakdown(results) {
        const breakdown = [];
        
        Object.entries(results.categories || {}).forEach(([key, category]) => {
            breakdown.push({
                name: category.category,
                passed: category.passed || 0,
                failed: category.failed || 0,
                warnings: category.warnings || 0,
                total: category.tests?.length || 0
            });
        });
        
        return breakdown;
    }

    /**
     * 時系列データ生成
     * @private
     */
    _generateTimeSeriesData() {
        // 実際の実装では過去のテスト結果を使用
        return [];
    }

    /**
     * ヒートマップデータ生成
     * @private
     */
    _generateHeatmapData() {
        // 実際の実装では各テストの重要度と結果をマッピング
        return [];
    }

    /**
     * 比較レポート生成
     * @private
     */
    _generateComparison(currentResults, previousResults) {
        const comparison = {
            scoreChange: (currentResults.overallScore || 0) - (previousResults.overallScore || 0),
            testChanges: {
                newPassed: (currentResults.summary?.passedTests || 0) - (previousResults.summary?.passedTests || 0),
                newFailed: (currentResults.summary?.failedTests || 0) - (previousResults.summary?.failedTests || 0),
                newWarnings: (currentResults.summary?.warnings || 0) - (previousResults.summary?.warnings || 0)
            },
            categoryChanges: {},
            improvements: [],
            regressions: []
        };
        
        // カテゴリ別比較
        Object.entries(currentResults.categories || {}).forEach(([key, current]) => {
            const previous = previousResults.categories?.[key];
            if (previous) {
                const currentScore = current.tests?.length > 0 ? (current.passed / current.tests.length) * 100 : 0;
                const previousScore = previous.tests?.length > 0 ? (previous.passed / previous.tests.length) * 100 : 0;
                
                comparison.categoryChanges[key] = {
                    category: current.category,
                    currentScore,
                    previousScore,
                    change: currentScore - previousScore
                };
                
                if (currentScore > previousScore) {
                    comparison.improvements.push({
                        category: current.category,
                        improvement: currentScore - previousScore
                    });
                } else if (currentScore < previousScore) {
                    comparison.regressions.push({
                        category: current.category,
                        regression: previousScore - currentScore
                    });
                }
            }
        });
        
        return comparison;
    }
}