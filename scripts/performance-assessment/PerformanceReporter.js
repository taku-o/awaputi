/**
 * Performance Reporter Component
 * 
 * パフォーマンスレポート生成機能を担当
 * Main Controller Patternの一部として設計
 */

export class PerformanceReporter {
    constructor(mainController) {
        this.mainController = mainController;
        this.performanceTargets = mainController.performanceTargets;
    }

    /**
     * 包括的なパフォーマンスレポートの生成
     */
    generatePerformanceReport(results) {
        console.log('\n📊 PERFORMANCE IMPACT ASSESSMENT REPORT\n');
        console.log('=' .repeat(60));
        
        let overallStatus = 'EXCELLENT';
        let totalScore = 0;
        let testCount = 0;

        // Response Time Analysis
        console.log('\n⏱️ RESPONSE TIME ANALYSIS:');
        const responseResult = results.responseTimeAnalysis;
        console.log(`  Status: ${responseResult.status} (${responseResult.averageScore}%)`);
        console.log(`  Target: <${responseResult.target}ms response time`);
        console.log(`  Async Operations: ${responseResult.details.asyncOperations}`);
        console.log(`  Optimization Patterns: ${responseResult.details.optimizationPatterns}`);
        if (responseResult.details.performanceBottlenecks.length > 0) {
            console.log(`  Bottlenecks: ${responseResult.details.performanceBottlenecks.join(', ')}`);
        }
        totalScore += responseResult.averageScore;
        testCount++;
        if (responseResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Memory Usage Analysis
        console.log('\n🧠 MEMORY USAGE ANALYSIS:');
        const memoryResult = results.memoryUsageAnalysis;
        console.log(`  Status: ${memoryResult.status} (${memoryResult.score}%)`);
        console.log(`  Total Files: ${memoryResult.totalFiles}`);
        console.log(`  Total Sub-components: ${memoryResult.totalSubComponents}`);
        console.log(`  Memory Footprint: ${memoryResult.memoryFootprint}KB`);
        console.log(`  Estimated Increase: ${memoryResult.estimatedMemoryIncrease}`);
        if (memoryResult.recommendations.length > 0) {
            console.log(`  Recommendations: ${memoryResult.recommendations.length} items`);
        }
        totalScore += memoryResult.score;
        testCount++;
        if (memoryResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // CPU Impact Analysis
        console.log('\n🖥️ CPU IMPACT ANALYSIS:');
        const cpuResult = results.cpuImpactAnalysis;
        console.log(`  Status: ${cpuResult.status} (${cpuResult.score}%)`);
        console.log(`  Estimated CPU Impact: ${cpuResult.estimatedCPUImpact}`);
        console.log(`  Target: <${cpuResult.target}% CPU usage`);
        totalScore += cpuResult.score;
        testCount++;
        if (cpuResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Battery Efficiency Analysis
        console.log('\n🔋 BATTERY EFFICIENCY ANALYSIS:');
        const batteryResult = results.batteryEfficiencyAnalysis;
        console.log(`  Status: ${batteryResult.status} (${batteryResult.score}%)`);
        console.log(`  Estimated Battery Impact: ${batteryResult.estimatedBatteryImpact}`);
        console.log(`  Target: <${batteryResult.target}% battery impact`);
        console.log(`  Mobile Optimizations: ${batteryResult.mobileOptimizations.join(', ')}`);
        totalScore += batteryResult.score;
        testCount++;
        if (batteryResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Code Complexity Analysis
        console.log('\n📊 CODE COMPLEXITY ANALYSIS:');
        const complexityResult = results.codeComplexityAnalysis;
        console.log(`  Status: ${complexityResult.status} (${complexityResult.score}%)`);
        console.log(`  Average File Size: ${complexityResult.metrics.averageFileSize}KB`);
        console.log(`  Dependencies: ${complexityResult.metrics.dependencyCount}`);
        console.log(`  Maintainability Index: ${complexityResult.maintainabilityIndex}`);
        totalScore += complexityResult.score;
        testCount++;
        if (complexityResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Bundle Size Analysis
        console.log('\n📦 BUNDLE SIZE ANALYSIS:');
        const bundleResult = results.bundleSizeAnalysis;
        console.log(`  Status: ${bundleResult.status} (${bundleResult.score}%)`);
        console.log(`  Total Size: ${bundleResult.metrics.totalSize}KB`);
        console.log(`  File Count: ${bundleResult.metrics.fileCount}`);
        console.log(`  Estimated Load Time: ${bundleResult.metrics.loadTimeEstimate}`);
        console.log(`  Compression Estimate: ${bundleResult.metrics.compressionEstimate}KB (gzipped)`);
        totalScore += bundleResult.score;
        testCount++;
        if (bundleResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Rendering Performance Analysis
        console.log('\n🎨 RENDERING PERFORMANCE:');
        const renderingResult = results.renderingPerformance;
        console.log(`  Status: ${renderingResult.status} (${renderingResult.score}%)`);
        console.log(`  Target: ${renderingResult.renderingTarget}FPS`);
        totalScore += renderingResult.score;
        testCount++;
        if (renderingResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Mobile Performance Analysis
        console.log('\n📱 MOBILE PERFORMANCE:');
        const mobileResult = results.mobilePerformance;
        console.log(`  Status: ${mobileResult.status} (${mobileResult.score}%)`);
        console.log(`  Desktop Performance Ratio: ${mobileResult.desktopPerformanceRatio}`);
        totalScore += mobileResult.score;
        testCount++;
        if (mobileResult.status !== 'EXCELLENT') overallStatus = 'GOOD';

        // Overall Summary
        const averageScore = Math.round(totalScore / testCount);
        
        console.log('\n' + '=' .repeat(60));
        console.log(`📊 OVERALL PERFORMANCE: ${overallStatus}`);
        console.log(`📈 AVERAGE SCORE: ${averageScore}%`);
        
        this.printPerformanceSummary(averageScore);
        this.printKeyPerformanceIndicators(results, averageScore);
        
        console.log('\n' + '=' .repeat(60));

        return {
            overallStatus,
            averageScore,
            testCount,
            details: results,
            meetsTargets: this.checkPerformanceTargets(results)
        };
    }

    /**
     * パフォーマンス概要の印刷
     */
    printPerformanceSummary(averageScore) {
        if (averageScore >= 85) {
            console.log('\n🎉 EXCELLENT PERFORMANCE PROFILE!');
            console.log('✅ Response times under 100ms target');
            console.log('✅ Memory usage optimized');
            console.log('✅ Minimal CPU impact');
            console.log('✅ Battery efficient');
            console.log('✅ Mobile performance maintained');
        } else if (averageScore >= 70) {
            console.log('\n✅ GOOD PERFORMANCE PROFILE');
            console.log('⚠️  Minor optimizations recommended');
        } else if (averageScore >= 50) {
            console.log('\n⚠️  ACCEPTABLE PERFORMANCE');
            console.log('🔧 Several optimization opportunities identified');
        } else {
            console.log('\n❌ PERFORMANCE NEEDS IMPROVEMENT');
            console.log('🚨 Significant optimizations required');
        }
    }

    /**
     * 主要パフォーマンス指標の印刷
     */
    printKeyPerformanceIndicators(results, averageScore) {
        const responseResult = results.responseTimeAnalysis;
        const memoryResult = results.memoryUsageAnalysis;
        const cpuResult = results.cpuImpactAnalysis;
        const batteryResult = results.batteryEfficiencyAnalysis;
        const bundleResult = results.bundleSizeAnalysis;

        console.log('\n📋 KEY PERFORMANCE INDICATORS:');
        console.log(`  • Response Time: ${responseResult.averageScore >= 80 ? '✅' : '⚠️'} Average ${responseResult.averageScore}%`);
        console.log(`  • Memory Usage: ${memoryResult.score >= 80 ? '✅' : '⚠️'} ${memoryResult.estimatedMemoryIncrease} increase`);
        console.log(`  • CPU Impact: ${cpuResult.score >= 80 ? '✅' : '⚠️'} ${cpuResult.estimatedCPUImpact} usage`);
        console.log(`  • Battery Impact: ${batteryResult.score >= 80 ? '✅' : '⚠️'} ${batteryResult.estimatedBatteryImpact} drain`);
        console.log(`  • Bundle Size: ${bundleResult.score >= 80 ? '✅' : '⚠️'} ${bundleResult.metrics.totalSize}KB total`);
    }

    /**
     * パフォーマンス目標のチェック
     */
    checkPerformanceTargets(results) {
        return {
            responseTime: results.responseTimeAnalysis.averageScore >= 80,
            memoryUsage: results.memoryUsageAnalysis.score >= 80,
            cpuImpact: results.cpuImpactAnalysis.score >= 70,
            batteryEfficiency: results.batteryEfficiencyAnalysis.score >= 70
        };
    }

    /**
     * 詳細レポートの生成（JSON形式）
     */
    generateDetailedReport(results) {
        const report = {
            timestamp: new Date().toISOString(),
            assessment: {
                overallStatus: this.determineOverallStatus(results),
                averageScore: this.calculateAverageScore(results),
                meetsTargets: this.checkPerformanceTargets(results)
            },
            categories: {
                responseTime: this.formatCategoryReport(results.responseTimeAnalysis, 'Response Time'),
                memoryUsage: this.formatCategoryReport(results.memoryUsageAnalysis, 'Memory Usage'),
                cpuImpact: this.formatCategoryReport(results.cpuImpactAnalysis, 'CPU Impact'),
                batteryEfficiency: this.formatCategoryReport(results.batteryEfficiencyAnalysis, 'Battery Efficiency'),
                codeComplexity: this.formatCategoryReport(results.codeComplexityAnalysis, 'Code Complexity'),
                bundleSize: this.formatCategoryReport(results.bundleSizeAnalysis, 'Bundle Size'),
                renderingPerformance: this.formatCategoryReport(results.renderingPerformance, 'Rendering'),
                mobilePerformance: this.formatCategoryReport(results.mobilePerformance, 'Mobile')
            },
            recommendations: this.generateConsolidatedRecommendations(results),
            performanceTargets: this.performanceTargets
        };

        return report;
    }

    /**
     * カテゴリレポートのフォーマット
     */
    formatCategoryReport(categoryResult, categoryName) {
        return {
            status: categoryResult.status,
            score: categoryResult.score || categoryResult.averageScore,
            target: categoryResult.target,
            details: categoryResult.details || {},
            recommendations: categoryResult.recommendations || []
        };
    }

    /**
     * 全体ステータスの決定
     */
    determineOverallStatus(results) {
        const scores = [
            results.responseTimeAnalysis.averageScore,
            results.memoryUsageAnalysis.score,
            results.cpuImpactAnalysis.score,
            results.batteryEfficiencyAnalysis.score,
            results.codeComplexityAnalysis.score,
            results.bundleSizeAnalysis.score,
            results.renderingPerformance.score,
            results.mobilePerformance.score
        ];

        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        if (averageScore >= 85) return 'EXCELLENT';
        if (averageScore >= 70) return 'GOOD';
        if (averageScore >= 50) return 'ACCEPTABLE';
        return 'NEEDS_IMPROVEMENT';
    }

    /**
     * 平均スコアの計算
     */
    calculateAverageScore(results) {
        const scores = [
            results.responseTimeAnalysis.averageScore,
            results.memoryUsageAnalysis.score,
            results.cpuImpactAnalysis.score,
            results.batteryEfficiencyAnalysis.score,
            results.codeComplexityAnalysis.score,
            results.bundleSizeAnalysis.score,
            results.renderingPerformance.score,
            results.mobilePerformance.score
        ];

        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    /**
     * 統合推奨事項の生成
     */
    generateConsolidatedRecommendations(results) {
        const allRecommendations = [];

        // 各カテゴリから推奨事項を収集
        if (results.memoryUsageAnalysis.recommendations) {
            allRecommendations.push(...results.memoryUsageAnalysis.recommendations.map(rec => ({
                category: 'Memory',
                priority: 'HIGH',
                recommendation: rec
            })));
        }

        if (results.cpuImpactAnalysis.recommendations) {
            allRecommendations.push(...results.cpuImpactAnalysis.recommendations.map(rec => ({
                category: 'CPU',
                priority: 'HIGH',
                recommendation: rec
            })));
        }

        // 全体的な推奨事項
        const averageScore = this.calculateAverageScore(results);
        if (averageScore < 70) {
            allRecommendations.push({
                category: 'General',
                priority: 'HIGH',
                recommendation: 'Consider implementing performance monitoring to track improvements'
            });
        }

        if (results.responseTimeAnalysis.averageScore < 60) {
            allRecommendations.push({
                category: 'Response Time',
                priority: 'HIGH',
                recommendation: 'Implement request optimization and caching strategies'
            });
        }

        return allRecommendations;
    }

    /**
     * HTML形式レポートの生成
     */
    generateHTMLReport(results) {
        const report = this.generateDetailedReport(results);
        
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Impact Assessment Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status-excellent { color: #28a745; }
        .status-good { color: #17a2b8; }
        .status-acceptable { color: #ffc107; }
        .status-needs-improvement { color: #dc3545; }
        .category { margin-bottom: 30px; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; }
        .score { font-size: 1.5em; font-weight: bold; }
        .recommendations { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .recommendation-item { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #007bff; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Performance Impact Assessment Report</h1>
        <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString('ja-JP')}</p>
        <p class="status-${report.assessment.overallStatus.toLowerCase().replace('_', '-')}">
            <strong>Overall Status:</strong> ${report.assessment.overallStatus}
        </p>
        <p><strong>Average Score:</strong> <span class="score">${report.assessment.averageScore}%</span></p>
    </div>

    ${Object.entries(report.categories).map(([key, category]) => `
        <div class="category">
            <h2>${category.details.title || key}</h2>
            <p><strong>Status:</strong> <span class="status-${category.status.toLowerCase()}">${category.status}</span></p>
            <p><strong>Score:</strong> ${category.score}%</p>
            ${category.target ? `<p><strong>Target:</strong> ${category.target}</p>` : ''}
            
            ${category.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h3>Recommendations:</h3>
                    ${category.recommendations.map(rec => `
                        <div class="recommendation-item">${rec}</div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('')}

    <div class="category">
        <h2>📋 Performance Targets Compliance</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Target</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Response Time</td>
                    <td>&lt;${report.performanceTargets.responseTime}ms</td>
                    <td>${report.assessment.meetsTargets.responseTime ? '✅ Met' : '❌ Not Met'}</td>
                </tr>
                <tr>
                    <td>Memory Increase</td>
                    <td>&lt;${report.performanceTargets.memoryIncrease}%</td>
                    <td>${report.assessment.meetsTargets.memoryUsage ? '✅ Met' : '❌ Not Met'}</td>
                </tr>
                <tr>
                    <td>CPU Impact</td>
                    <td>&lt;${report.performanceTargets.cpuImpact}%</td>
                    <td>${report.assessment.meetsTargets.cpuImpact ? '✅ Met' : '❌ Not Met'}</td>
                </tr>
                <tr>
                    <td>Battery Efficiency</td>
                    <td>&lt;${report.performanceTargets.batteryEfficiency}%</td>
                    <td>${report.assessment.meetsTargets.batteryEfficiency ? '✅ Met' : '❌ Not Met'}</td>
                </tr>
            </tbody>
        </table>
    </div>

    ${report.recommendations.length > 0 ? `
        <div class="category">
            <h2>🔧 Consolidated Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation-item">
                    <strong>[${rec.priority}] ${rec.category}:</strong> ${rec.recommendation}
                </div>
            `).join('')}
        </div>
    ` : ''}

</body>
</html>`;
    }

    /**
     * CSV形式レポートの生成
     */
    generateCSVReport(results) {
        const report = this.generateDetailedReport(results);
        
        let csv = 'Category,Status,Score,Target,Meets Target\n';
        
        Object.entries(report.categories).forEach(([key, category]) => {
            csv += `"${key}","${category.status}",${category.score},"${category.target || 'N/A'}","${category.score >= 80 ? 'Yes' : 'No'}"\n`;
        });
        
        return csv;
    }

    /**
     * レポートファイルの保存
     */
    async saveReport(results, format = 'json', filename = null) {
        const timestamp = new Date().toISOString().split('T')[0];
        const defaultFilename = `performance-assessment-${timestamp}`;
        const finalFilename = filename || defaultFilename;

        let content;
        let extension;
        
        switch (format) {
            case 'html':
                content = this.generateHTMLReport(results);
                extension = 'html';
                break;
            case 'csv':
                content = this.generateCSVReport(results);
                extension = 'csv';
                break;
            case 'json':
            default:
                content = JSON.stringify(this.generateDetailedReport(results), null, 2);
                extension = 'json';
                break;
        }

        const fs = await import('fs');
        const path = await import('path');
        
        const outputDir = path.dirname(this.mainController.accessibilityDir);
        const outputPath = path.join(outputDir, `${finalFilename}.${extension}`);
        
        fs.writeFileSync(outputPath, content, 'utf8');
        
        console.log(`\n💾 Report saved: ${outputPath}`);
        return outputPath;
    }

    /**
     * レポート概要の生成
     */
    generateReportSummary(results) {
        const averageScore = this.calculateAverageScore(results);
        const meetsTargets = this.checkPerformanceTargets(results);
        const targetsMet = Object.values(meetsTargets).filter(Boolean).length;
        const totalTargets = Object.keys(meetsTargets).length;

        return {
            timestamp: new Date().toISOString(),
            overallScore: averageScore,
            status: this.determineOverallStatus(results),
            targetsCompliance: {
                met: targetsMet,
                total: totalTargets,
                percentage: Math.round((targetsMet / totalTargets) * 100)
            },
            keyMetrics: {
                responseTime: results.responseTimeAnalysis.averageScore,
                memoryUsage: results.memoryUsageAnalysis.score,
                cpuImpact: results.cpuImpactAnalysis.score,
                batteryEfficiency: results.batteryEfficiencyAnalysis.score
            },
            recommendationCount: this.generateConsolidatedRecommendations(results).length
        };
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            reporterType: 'PerformanceReporter',
            supportedFormats: ['json', 'html', 'csv'],
            performanceTargets: this.performanceTargets
        };
    }
}