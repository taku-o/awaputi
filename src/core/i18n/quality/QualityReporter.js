import { getErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * 翻訳品質レポート生成クラス - 品質検証結果のレポート生成と分析
 */
export class QualityReporter {
    constructor() {
        this.reportTemplates = new Map();
        this.reportHistory = [];
        this.qualityTrends = new Map();
        
        // デフォルトレポートテンプレートを初期化
        this.initializeReportTemplates();
        
        console.log('QualityReporter initialized');
    }
    
    /**
     * レポートテンプレートを初期化
     */
    initializeReportTemplates() {
        // 詳細レポートテンプレート
        this.reportTemplates.set('detailed', {
            name: '詳細品質レポート',
            sections: ['summary', 'statistics', 'issues', 'recommendations', 'trends'],
            format: 'html'
        });
        
        // サマリーレポートテンプレート
        this.reportTemplates.set('summary', {
            name: 'サマリーレポート',
            sections: ['summary', 'statistics', 'key_issues'],
            format: 'html'
        });
        
        // CSV エクスポート用テンプレート
        this.reportTemplates.set('csv', {
            name: 'CSV品質データ',
            sections: ['issues_csv'],
            format: 'csv'
        });
        
        // JSON レポートテンプレート
        this.reportTemplates.set('json', {
            name: 'JSON品質データ',
            sections: ['raw_data'],
            format: 'json'
        });
    }
    
    /**
     * 包括的品質レポートを生成
     */
    generateComprehensiveReport(validationResults, options = {}) {
        try {
            const reportId = this.generateReportId();
            const templateType = options.template || 'detailed';
            const template = this.reportTemplates.get(templateType);
            
            if (!template) {
                throw new Error(`Unknown report template: ${templateType}`);
            }
            
            const reportData = {
                id: reportId,
                timestamp: new Date().toISOString(),
                template: templateType,
                language: validationResults.language,
                sourceLanguage: validationResults.sourceLanguage,
                ...this.analyzeValidationResults(validationResults)
            };
            
            // 品質トレンドを更新
            this.updateQualityTrends(reportData);
            
            // レポートを生成
            const report = this.renderReport(reportData, template);
            
            // レポート履歴に保存
            this.reportHistory.push({
                id: reportId,
                timestamp: reportData.timestamp,
                language: reportData.language,
                qualityScore: reportData.summary.qualityScore,
                errorCount: reportData.summary.errorCount,
                warningCount: reportData.summary.warningCount
            });
            
            return {
                id: reportId,
                data: reportData,
                report: report,
                format: template.format
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'QUALITY_REPORTER_ERROR', {
                operation: 'generateComprehensiveReport'
            });
            throw error;
        }
    }
    
    /**
     * 検証結果を分析
     */
    analyzeValidationResults(results) {
        const analysis = {
            summary: this.generateSummary(results),
            statistics: this.generateStatistics(results),
            issues: this.categorizeIssues(results),
            recommendations: this.generateRecommendations(results),
            trends: this.analyzeTrends(results)
        };
        
        return analysis;
    }
    
    /**
     * サマリーを生成
     */
    generateSummary(results) {
        return {
            language: results.language,
            sourceLanguage: results.sourceLanguage,
            totalItems: results.totalItems,
            checkedItems: results.checkedItems,
            qualityScore: results.qualityScore,
            qualityGrade: results.qualityGrade,
            errorCount: results.errors.length,
            warningCount: results.warnings.length,
            passedCount: results.passed.length,
            completionRate: results.checkedItems > 0 ? 
                Math.round((results.checkedItems / results.totalItems) * 100) : 0,
            successRate: results.checkedItems > 0 ? 
                Math.round((results.passed.length / results.checkedItems) * 100) : 0
        };
    }
    
    /**
     * 統計データを生成
     */
    generateStatistics(results) {
        const statistics = {
            byRule: new Map(),
            bySeverity: new Map(),
            byCategory: new Map()
        };
        
        // ルール別統計
        [...results.errors, ...results.warnings, ...results.passed].forEach(item => {
            const rule = item.rule;
            if (!statistics.byRule.has(rule)) {
                statistics.byRule.set(rule, {
                    total: 0,
                    errors: 0,
                    warnings: 0,
                    passed: 0
                });
            }
            
            const ruleStats = statistics.byRule.get(rule);
            ruleStats.total++;
            
            if (results.errors.includes(item)) {
                ruleStats.errors++;
            } else if (results.warnings.includes(item)) {
                ruleStats.warnings++;
            } else {
                ruleStats.passed++;
            }
        });
        
        // 重要度別統計
        statistics.bySeverity.set('error', results.errors.length);
        statistics.bySeverity.set('warning', results.warnings.length);
        statistics.bySeverity.set('passed', results.passed.length);
        
        // カテゴリ別統計（翻訳キーのプレフィックスベース）
        [...results.errors, ...results.warnings, ...results.passed].forEach(item => {
            if (item.key) {
                const category = item.key.split('.')[0]; // 例: "menu.play" -> "menu"
                if (!statistics.byCategory.has(category)) {
                    statistics.byCategory.set(category, {
                        total: 0,
                        errors: 0,
                        warnings: 0,
                        passed: 0
                    });
                }
                
                const categoryStats = statistics.byCategory.get(category);
                categoryStats.total++;
                
                if (results.errors.includes(item)) {
                    categoryStats.errors++;
                } else if (results.warnings.includes(item)) {
                    categoryStats.warnings++;
                } else {
                    categoryStats.passed++;
                }
            }
        });
        
        return {
            byRule: Object.fromEntries(statistics.byRule),
            bySeverity: Object.fromEntries(statistics.bySeverity),
            byCategory: Object.fromEntries(statistics.byCategory)
        };
    }
    
    /**
     * 問題を分類
     */
    categorizeIssues(results) {
        const categories = {
            critical: [],
            major: [],
            minor: [],
            info: []
        };
        
        // エラーを重要度別に分類
        results.errors.forEach(error => {
            if (error.rule === 'parameterConsistency' || error.rule === 'formatValidation') {
                categories.critical.push(error);
            } else if (error.rule === 'completenessCheck') {
                categories.major.push(error);
            } else {
                categories.minor.push(error);
            }
        });
        
        // 警告を分類
        results.warnings.forEach(warning => {
            if (warning.rule === 'culturalAppropriateness') {
                categories.major.push(warning);
            } else if (warning.rule === 'lengthValidation' || warning.rule === 'consistencyCheck') {
                categories.minor.push(warning);
            } else {
                categories.info.push(warning);
            }
        });
        
        return categories;
    }
    
    /**
     * 改善推奨事項を生成
     */
    generateRecommendations(results) {
        const recommendations = [];
        const summary = this.generateSummary(results);
        
        // 品質スコアベースの推奨事項
        if (summary.qualityScore < 60) {
            recommendations.push({
                priority: 'critical',
                type: 'quality_improvement',
                title: '品質スコア改善が必要',
                description: `現在の品質スコア（${summary.qualityScore}）は低すぎます。`,
                actions: [
                    'すべてのエラーを修正する',
                    '警告の大部分を解決する',
                    '翻訳の見直しを行う'
                ]
            });
        } else if (summary.qualityScore < 80) {
            recommendations.push({
                priority: 'high',
                type: 'quality_enhancement',
                title: '品質向上の推奨',
                description: `品質スコア（${summary.qualityScore}）をさらに向上させることをお勧めします。`,
                actions: [
                    'エラーを完全に修正する',
                    '主要な警告を解決する'
                ]
            });
        }
        
        // エラー数ベースの推奨事項
        if (summary.errorCount > 0) {
            recommendations.push({
                priority: 'high',
                type: 'error_resolution',
                title: 'エラーの解決',
                description: `${summary.errorCount}個のエラーが検出されました。`,
                actions: [
                    'パラメータの整合性を確認する',
                    'フォーマットの正確性を検証する',
                    '翻訳の完成度を確認する'
                ]
            });
        }
        
        // 警告数ベースの推奨事項
        if (summary.warningCount > 10) {
            recommendations.push({
                priority: 'medium',
                type: 'warning_review',
                title: '警告の確認',
                description: `${summary.warningCount}個の警告があります。`,
                actions: [
                    '文化的配慮を確認する',
                    '翻訳の長さを調整する',
                    '一貫性を改善する'
                ]
            });
        }
        
        // 成功率ベースの推奨事項
        if (summary.successRate < 70) {
            recommendations.push({
                priority: 'medium',
                type: 'success_rate_improvement',
                title: '合格率の向上',
                description: `現在の合格率（${summary.successRate}%）を改善しましょう。`,
                actions: [
                    '品質検証プロセスを見直す',
                    '翻訳ガイドラインを確認する',
                    'レビュープロセスを強化する'
                ]
            });
        }
        
        return recommendations;
    }
    
    /**
     * トレンド分析
     */
    analyzeTrends(results) {
        const language = results.language;
        const trends = this.qualityTrends.get(language) || [];
        
        if (trends.length < 2) {
            return {
                message: 'トレンド分析には最低2回の検証が必要です',
                data: null
            };
        }
        
        const latest = trends[trends.length - 1];
        const previous = trends[trends.length - 2];
        
        const scoreChange = latest.qualityScore - previous.qualityScore;
        const errorChange = latest.errorCount - previous.errorCount;
        const warningChange = latest.warningCount - previous.warningCount;
        
        return {
            scoreChange: {
                value: scoreChange,
                direction: scoreChange > 0 ? 'improvement' : scoreChange < 0 ? 'decline' : 'stable',
                percentage: previous.qualityScore > 0 ? 
                    Math.round((scoreChange / previous.qualityScore) * 100) : 0
            },
            errorChange: {
                value: errorChange,
                direction: errorChange < 0 ? 'improvement' : errorChange > 0 ? 'decline' : 'stable'
            },
            warningChange: {
                value: warningChange,
                direction: warningChange < 0 ? 'improvement' : warningChange > 0 ? 'decline' : 'stable'
            },
            overallTrend: this.calculateOverallTrend(trends)
        };
    }
    
    /**
     * 全体的なトレンドを計算
     */
    calculateOverallTrend(trends) {
        if (trends.length < 3) return 'insufficient_data';
        
        const recent = trends.slice(-3);
        const scores = recent.map(t => t.qualityScore);
        
        let increasing = 0;
        let decreasing = 0;
        
        for (let i = 1; i < scores.length; i++) {
            if (scores[i] > scores[i - 1]) increasing++;
            else if (scores[i] < scores[i - 1]) decreasing++;
        }
        
        if (increasing > decreasing) return 'improving';
        if (decreasing > increasing) return 'declining';
        return 'stable';
    }
    
    /**
     * 品質トレンドを更新
     */
    updateQualityTrends(reportData) {
        const language = reportData.language;
        if (!this.qualityTrends.has(language)) {
            this.qualityTrends.set(language, []);
        }
        
        const trends = this.qualityTrends.get(language);
        trends.push({
            timestamp: reportData.timestamp,
            qualityScore: reportData.summary.qualityScore,
            errorCount: reportData.summary.errorCount,
            warningCount: reportData.summary.warningCount,
            successRate: reportData.summary.successRate
        });
        
        // 最新50件のトレンドのみ保持
        if (trends.length > 50) {
            trends.splice(0, trends.length - 50);
        }
    }
    
    /**
     * レポートをレンダリング
     */
    renderReport(reportData, template) {
        switch (template.format) {
            case 'html':
                return this.renderHtmlReport(reportData, template);
            case 'csv':
                return this.renderCsvReport(reportData);
            case 'json':
                return this.renderJsonReport(reportData);
            default:
                throw new Error(`Unsupported report format: ${template.format}`);
        }
    }
    
    /**
     * HTMLレポートをレンダリング
     */
    renderHtmlReport(reportData, template) {
        const sections = [];
        
        // ヘッダー
        sections.push(`
            <div class="report-header">
                <h1>翻訳品質レポート</h1>
                <div class="report-meta">
                    <span>言語: ${reportData.language}</span>
                    <span>生成日時: ${new Date(reportData.timestamp).toLocaleString('ja-JP')}</span>
                    <span>レポートID: ${reportData.id}</span>
                </div>
            </div>
        `);
        
        // サマリーセクション
        if (template.sections.includes('summary')) {
            sections.push(this.renderSummarySection(reportData.summary));
        }
        
        // 統計セクション
        if (template.sections.includes('statistics')) {
            sections.push(this.renderStatisticsSection(reportData.statistics));
        }
        
        // 問題セクション
        if (template.sections.includes('issues')) {
            sections.push(this.renderIssuesSection(reportData.issues));
        }
        
        // 推奨事項セクション
        if (template.sections.includes('recommendations')) {
            sections.push(this.renderRecommendationsSection(reportData.recommendations));
        }
        
        // トレンドセクション
        if (template.sections.includes('trends')) {
            sections.push(this.renderTrendsSection(reportData.trends));
        }
        
        return `
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>翻訳品質レポート - ${reportData.language}</title>
                <style>${this.getReportCSS()}</style>
            </head>
            <body>
                <div class="report-container">
                    ${sections.join('\n')}
                </div>
            </body>
            </html>
        `;
    }
    
    /**
     * サマリーセクションをレンダリング
     */
    renderSummarySection(summary) {
        const qualityColor = this.getQualityColor(summary.qualityScore);
        
        return `
            <section class="summary-section">
                <h2>📊 品質サマリー</h2>
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-value" style="color: ${qualityColor}">
                            ${summary.qualityScore}
                        </div>
                        <div class="summary-label">品質スコア</div>
                        <div class="summary-grade">${this.getQualityGradeText(summary.qualityGrade)}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${summary.totalItems}</div>
                        <div class="summary-label">総項目数</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${summary.checkedItems}</div>
                        <div class="summary-label">検証済み項目</div>
                    </div>
                    <div class="summary-card error">
                        <div class="summary-value">${summary.errorCount}</div>
                        <div class="summary-label">エラー</div>
                    </div>
                    <div class="summary-card warning">
                        <div class="summary-value">${summary.warningCount}</div>
                        <div class="summary-label">警告</div>
                    </div>
                    <div class="summary-card success">
                        <div class="summary-value">${summary.passedCount}</div>
                        <div class="summary-label">合格</div>
                    </div>
                </div>
                <div class="completion-bar">
                    <div class="completion-progress" style="width: ${summary.completionRate}%"></div>
                    <span class="completion-text">完了率: ${summary.completionRate}%</span>
                </div>
            </section>
        `;
    }
    
    /**
     * 統計セクションをレンダリング
     */
    renderStatisticsSection(statistics) {
        return `
            <section class="statistics-section">
                <h2>📈 詳細統計</h2>
                
                <div class="statistics-group">
                    <h3>ルール別統計</h3>
                    <table class="statistics-table">
                        <thead>
                            <tr>
                                <th>ルール</th>
                                <th>合計</th>
                                <th>エラー</th>
                                <th>警告</th>
                                <th>合格</th>
                                <th>合格率</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(statistics.byRule).map(([rule, stats]) => `
                                <tr>
                                    <td>${this.getRuleDisplayName(rule)}</td>
                                    <td>${stats.total}</td>
                                    <td class="error-cell">${stats.errors}</td>
                                    <td class="warning-cell">${stats.warnings}</td>
                                    <td class="success-cell">${stats.passed}</td>
                                    <td>${Math.round((stats.passed / stats.total) * 100)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="statistics-group">
                    <h3>カテゴリ別統計</h3>
                    <div class="category-stats">
                        ${Object.entries(statistics.byCategory).map(([category, stats]) => `
                            <div class="category-card">
                                <h4>${category}</h4>
                                <div class="category-stats-grid">
                                    <span>合計: ${stats.total}</span>
                                    <span class="error-text">エラー: ${stats.errors}</span>
                                    <span class="warning-text">警告: ${stats.warnings}</span>
                                    <span class="success-text">合格: ${stats.passed}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }
    
    /**
     * 問題セクションをレンダリング
     */
    renderIssuesSection(issues) {
        return `
            <section class="issues-section">
                <h2>⚠️ 検出された問題</h2>
                
                ${issues.critical.length > 0 ? `
                    <div class="issue-category critical">
                        <h3>🔴 重大な問題 (${issues.critical.length}件)</h3>
                        ${issues.critical.map(issue => this.renderIssueItem(issue, 'critical')).join('')}
                    </div>
                ` : ''}
                
                ${issues.major.length > 0 ? `
                    <div class="issue-category major">
                        <h3>🟠 主要な問題 (${issues.major.length}件)</h3>
                        ${issues.major.map(issue => this.renderIssueItem(issue, 'major')).join('')}
                    </div>
                ` : ''}
                
                ${issues.minor.length > 0 ? `
                    <div class="issue-category minor">
                        <h3>🟡 軽微な問題 (${issues.minor.length}件)</h3>
                        ${issues.minor.map(issue => this.renderIssueItem(issue, 'minor')).join('')}
                    </div>
                ` : ''}
                
                ${issues.info.length > 0 ? `
                    <div class="issue-category info">
                        <h3>ℹ️ 情報 (${issues.info.length}件)</h3>
                        ${issues.info.map(issue => this.renderIssueItem(issue, 'info')).join('')}
                    </div>
                ` : ''}
            </section>
        `;
    }
    
    /**
     * 個別問題項目をレンダリング
     */
    renderIssueItem(issue, severity) {
        return `
            <div class="issue-item ${severity}">
                <div class="issue-header">
                    <strong>${issue.name || this.getRuleDisplayName(issue.rule)}</strong>
                    <span class="issue-key">${issue.key || ''}</span>
                </div>
                <div class="issue-message">${issue.message}</div>
                ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * 推奨事項セクションをレンダリング
     */
    renderRecommendationsSection(recommendations) {
        if (recommendations.length === 0) {
            return `
                <section class="recommendations-section">
                    <h2>✅ 推奨事項</h2>
                    <div class="no-recommendations">
                        現在、特別な推奨事項はありません。品質が良好です。
                    </div>
                </section>
            `;
        }
        
        return `
            <section class="recommendations-section">
                <h2>💡 推奨事項</h2>
                ${recommendations.map(rec => `
                    <div class="recommendation-item ${rec.priority}">
                        <div class="recommendation-header">
                            <strong>${rec.title}</strong>
                            <span class="priority-badge ${rec.priority}">${this.getPriorityText(rec.priority)}</span>
                        </div>
                        <div class="recommendation-description">${rec.description}</div>
                        <div class="recommendation-actions">
                            <strong>推奨アクション:</strong>
                            <ul>
                                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </section>
        `;
    }
    
    /**
     * トレンドセクションをレンダリング
     */
    renderTrendsSection(trends) {
        if (!trends.data) {
            return `
                <section class="trends-section">
                    <h2>📈 品質トレンド</h2>
                    <div class="no-trends">${trends.message}</div>
                </section>
            `;
        }
        
        return `
            <section class="trends-section">
                <h2>📈 品質トレンド</h2>
                <div class="trends-grid">
                    <div class="trend-item">
                        <div class="trend-label">品質スコア変化</div>
                        <div class="trend-value ${trends.data.scoreChange.direction}">
                            ${trends.data.scoreChange.value > 0 ? '+' : ''}${trends.data.scoreChange.value}
                            (${trends.data.scoreChange.percentage > 0 ? '+' : ''}${trends.data.scoreChange.percentage}%)
                        </div>
                        <div class="trend-direction">${this.getTrendDirectionText(trends.data.scoreChange.direction)}</div>
                    </div>
                    <div class="trend-item">
                        <div class="trend-label">エラー数変化</div>
                        <div class="trend-value ${trends.data.errorChange.direction}">
                            ${trends.data.errorChange.value > 0 ? '+' : ''}${trends.data.errorChange.value}
                        </div>
                        <div class="trend-direction">${this.getTrendDirectionText(trends.data.errorChange.direction)}</div>
                    </div>
                    <div class="trend-item">
                        <div class="trend-label">警告数変化</div>
                        <div class="trend-value ${trends.data.warningChange.direction}">
                            ${trends.data.warningChange.value > 0 ? '+' : ''}${trends.data.warningChange.value}
                        </div>
                        <div class="trend-direction">${this.getTrendDirectionText(trends.data.warningChange.direction)}</div>
                    </div>
                </div>
                <div class="overall-trend">
                    <strong>全体的な傾向:</strong> ${this.getOverallTrendText(trends.data.overallTrend)}
                </div>
            </section>
        `;
    }
    
    /**
     * CSVレポートをレンダリング
     */
    renderCsvReport(reportData) {
        const rows = [];
        
        // ヘッダー
        rows.push(['Key', 'Rule', 'Severity', 'Message', 'Suggestion'].join(','));
        
        // エラーと警告を追加
        [...reportData.issues.critical, ...reportData.issues.major, ...reportData.issues.minor, ...reportData.issues.info]
            .forEach(issue => {
                rows.push([
                    `"${issue.key || ''}"`,
                    `"${issue.rule || ''}"`,
                    `"${issue.severity || ''}"`,
                    `"${issue.message || ''}"`,
                    `"${issue.suggestion || ''}"`
                ].join(','));
            });
        
        return rows.join('\n');
    }
    
    /**
     * JSONレポートをレンダリング
     */
    renderJsonReport(reportData) {
        return JSON.stringify(reportData, null, 2);
    }
    
    /**
     * レポート用CSSを取得
     */
    getReportCSS() {
        return `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
            .report-container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .report-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
            .report-header h1 { color: #333; margin: 0; }
            .report-meta { margin-top: 10px; color: #666; }
            .report-meta span { margin: 0 15px; }
            section { margin: 30px 0; }
            h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h3 { color: #34495e; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
            .summary-card { text-align: center; padding: 20px; border-radius: 8px; background: #f8f9fa; }
            .summary-card.error { background: #fee; border-left: 4px solid #e74c3c; }
            .summary-card.warning { background: #fff8e1; border-left: 4px solid #f39c12; }
            .summary-card.success { background: #e8f5e8; border-left: 4px solid #27ae60; }
            .summary-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
            .summary-label { color: #666; font-size: 0.9em; }
            .summary-grade { margin-top: 5px; padding: 5px 10px; border-radius: 15px; font-size: 0.8em; background: #3498db; color: white; }
            .completion-bar { position: relative; height: 20px; background: #eee; border-radius: 10px; margin: 20px 0; }
            .completion-progress { height: 100%; background: #3498db; border-radius: 10px; transition: width 0.3s; }
            .completion-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.8em; font-weight: bold; }
            .statistics-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .statistics-table th, .statistics-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .statistics-table th { background: #f8f9fa; font-weight: bold; }
            .error-cell, .error-text { color: #e74c3c; }
            .warning-cell, .warning-text { color: #f39c12; }
            .success-cell, .success-text { color: #27ae60; }
            .category-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .category-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; }
            .category-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 0.9em; margin-top: 10px; }
            .issue-category { margin: 20px 0; }
            .issue-item { margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #ddd; }
            .issue-item.critical { background: #fee; border-left-color: #e74c3c; }
            .issue-item.major { background: #fff8e1; border-left-color: #f39c12; }
            .issue-item.minor { background: #f0f8ff; border-left-color: #3498db; }
            .issue-item.info { background: #f8f9fa; border-left-color: #95a5a6; }
            .issue-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .issue-key { font-family: monospace; color: #666; font-size: 0.9em; }
            .issue-message { margin: 10px 0; }
            .issue-suggestion { background: #e8f5e8; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 0.9em; }
            .recommendation-item { margin: 15px 0; padding: 20px; border-radius: 8px; background: #f8f9fa; border-left: 4px solid #3498db; }
            .recommendation-item.critical { border-left-color: #e74c3c; }
            .recommendation-item.high { border-left-color: #f39c12; }
            .recommendation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .priority-badge { padding: 3px 8px; border-radius: 12px; font-size: 0.8em; color: white; }
            .priority-badge.critical { background: #e74c3c; }
            .priority-badge.high { background: #f39c12; }
            .priority-badge.medium { background: #3498db; }
            .trends-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .trend-item { text-align: center; padding: 20px; border-radius: 8px; background: #f8f9fa; }
            .trend-value { font-size: 1.5em; font-weight: bold; margin: 10px 0; }
            .trend-value.improvement { color: #27ae60; }
            .trend-value.decline { color: #e74c3c; }
            .trend-value.stable { color: #95a5a6; }
            .overall-trend { text-align: center; margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 8px; }
        `;
    }
    
    /**
     * ヘルパー関数群
     */
    
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getQualityColor(score) {
        if (score >= 90) return '#27ae60';
        if (score >= 75) return '#f39c12';
        if (score >= 60) return '#e67e22';
        return '#e74c3c';
    }
    
    getQualityGradeText(grade) {
        const grades = {
            excellent: '優秀',
            good: '良好',
            acceptable: '可',
            poor: '不良',
            unacceptable: '不可'
        };
        return grades[grade] || grade;
    }
    
    getRuleDisplayName(rule) {
        const names = {
            parameterConsistency: 'パラメータ整合性',
            lengthValidation: '長さ検証',
            formatValidation: 'フォーマット検証',
            culturalAppropriateness: '文化的適切性',
            completenessCheck: '完成度チェック',
            consistencyCheck: '一貫性チェック'
        };
        return names[rule] || rule;
    }
    
    getPriorityText(priority) {
        const priorities = {
            critical: '重要',
            high: '高',
            medium: '中',
            low: '低'
        };
        return priorities[priority] || priority;
    }
    
    getTrendDirectionText(direction) {
        const directions = {
            improvement: '改善',
            decline: '悪化',
            stable: '安定'
        };
        return directions[direction] || direction;
    }
    
    getOverallTrendText(trend) {
        const trends = {
            improving: '改善傾向',
            declining: '悪化傾向',
            stable: '安定',
            insufficient_data: 'データ不足'
        };
        return trends[trend] || trend;
    }
    
    /**
     * レポート履歴を取得
     */
    getReportHistory(language = null, limit = 10) {
        let history = [...this.reportHistory];
        
        if (language) {
            history = history.filter(report => report.language === language);
        }
        
        return history
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
    
    /**
     * 品質トレンドデータを取得
     */
    getQualityTrends(language) {
        return this.qualityTrends.get(language) || [];
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            totalReports: this.reportHistory.length,
            languagesTracked: this.qualityTrends.size,
            availableTemplates: Array.from(this.reportTemplates.keys()),
            averageQualityScore: this.reportHistory.length > 0 ?
                Math.round(this.reportHistory.reduce((sum, r) => sum + r.qualityScore, 0) / this.reportHistory.length) : 0
        };
    }
}

// シングルトンインスタンス
let qualityReporterInstance = null;

/**
 * QualityReporterのシングルトンインスタンスを取得
 */
export function getQualityReporter() {
    if (!qualityReporterInstance) {
        qualityReporterInstance = new QualityReporter();
    }
    return qualityReporterInstance;
}