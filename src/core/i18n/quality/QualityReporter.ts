import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// 型定義
export interface ReportTemplate {
    name: string;
    sections: string[];
    format: 'html' | 'csv' | 'json';
}

export interface ReportOptions {
    template?: string;
    includeRawData?: boolean;
    customSections?: string[];
    filterSeverity?: string[];
    maxIssues?: number;
}

export interface ValidationResults {
    language: string;
    sourceLanguage: string;
    timestamp: string;
    totalItems: number;
    checkedItems: number;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    passed: ValidationIssue[];
    qualityScore: number;
    qualityGrade: string;
}

export interface ValidationIssue {
    rule: string;
    name: string;
    message: string;
    suggestion?: string;
    severity: 'error' | 'warning';
    key?: string;
}

export interface ReportSummary {
    language: string;
    sourceLanguage: string;
    totalItems: number;
    checkedItems: number;
    qualityScore: number;
    qualityGrade: string;
    errorCount: number;
    warningCount: number;
    passedCount: number;
    completionRate: number;
    successRate: number;
}

export interface RuleStatistics {
    total: number;
    errors: number;
    warnings: number;
    passed: number;
}

export interface ReportStatistics {
    byRule: Record<string, RuleStatistics>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, RuleStatistics>;
}

export interface CategorizedIssues {
    critical: ValidationIssue[];
    major: ValidationIssue[];
    minor: ValidationIssue[];
    info: ValidationIssue[];
}

export interface Recommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    title: string;
    description: string;
    actions: string[];
}

export interface TrendChange {
    value: number;
    direction: 'improvement' | 'decline' | 'stable';
    percentage?: number;
}

export interface TrendAnalysis {
    scoreChange: TrendChange;
    errorChange: TrendChange;
    warningChange: TrendChange;
    overallTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
}

export interface TrendData {
    message?: string;
    data: TrendAnalysis | null;
}

export interface QualityTrend {
    timestamp: string;
    qualityScore: number;
    errorCount: number;
    warningCount: number;
    successRate: number;
}

export interface ReportData {
    id: string;
    timestamp: string;
    template: string;
    language: string;
    sourceLanguage: string;
    summary: ReportSummary;
    statistics: ReportStatistics;
    issues: CategorizedIssues;
    recommendations: Recommendation[];
    trends: TrendData;
}

export interface ReportHistoryEntry {
    id: string;
    timestamp: string;
    language: string;
    qualityScore: number;
    errorCount: number;
    warningCount: number;
}

export interface GeneratedReport {
    id: string;
    data: ReportData;
    report: string;
    format: string;
}

export interface ReporterStats {
    totalReports: number;
    languagesTracked: number;
    availableTemplates: string[];
    averageQualityScore: number;
}

/**
 * 翻訳品質レポート生成クラス - 品質検証結果のレポート生成と分析
 */
export class QualityReporter {
    private reportTemplates: Map<string, ReportTemplate>;
    private reportHistory: ReportHistoryEntry[];
    private qualityTrends: Map<string, QualityTrend[]>;

    constructor() {
        this.reportTemplates = new Map<string, ReportTemplate>();
        this.reportHistory = [];
        this.qualityTrends = new Map<string, QualityTrend[]>();
        
        // デフォルトレポートテンプレートを初期化
        this.initializeReportTemplates();
        
        console.log('QualityReporter initialized');
    }
    
    /**
     * レポートテンプレートを初期化
     */
    private initializeReportTemplates(): void {
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
    generateComprehensiveReport(validationResults: ValidationResults, options: ReportOptions = {}): GeneratedReport {
        try {
            const template = this.reportTemplates.get(options.template || 'detailed')!;
            const reportId = this.generateReportId();
            
            // レポートデータを準備
            const reportData: ReportData = {
                id: reportId,
                timestamp: new Date().toISOString(),
                template: template.name,
                language: validationResults.language,
                sourceLanguage: validationResults.sourceLanguage,
                summary: this.generateSummary(validationResults),
                statistics: this.generateStatistics(validationResults),
                issues: this.categorizeIssues(validationResults, options),
                recommendations: this.generateRecommendations(validationResults),
                trends: this.analyzeTrends(validationResults.language)
            };
            
            // レポートを生成
            const report = this.renderReport(reportData, template, options);
            
            // 履歴に追加
            this.addToHistory(reportData);
            
            // トレンドデータを更新
            this.updateTrends(validationResults);
            
            return {
                id: reportId,
                data: reportData,
                report: report,
                format: template.format
            };
            
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'QUALITY_REPORTER_ERROR', {
                language: validationResults.language,
                template: options.template
            });
            throw error;
        }
    }
    
    /**
     * 要約情報を生成
     */
    private generateSummary(results: ValidationResults): ReportSummary {
        const errorCount = results.errors.length;
        const warningCount = results.warnings.length;
        const passedCount = results.passed.length;
        const totalChecked = errorCount + warningCount + passedCount;
        
        return {
            language: results.language,
            sourceLanguage: results.sourceLanguage,
            totalItems: results.totalItems,
            checkedItems: results.checkedItems,
            qualityScore: results.qualityScore,
            qualityGrade: results.qualityGrade,
            errorCount: errorCount,
            warningCount: warningCount,
            passedCount: passedCount,
            completionRate: results.totalItems > 0 ? (results.checkedItems / results.totalItems) * 100 : 0,
            successRate: totalChecked > 0 ? (passedCount / totalChecked) * 100 : 0
        };
    }
    
    /**
     * 統計情報を生成
     */
    private generateStatistics(results: ValidationResults): ReportStatistics {
        const stats: ReportStatistics = {
            byRule: {},
            bySeverity: {
                error: results.errors.length,
                warning: results.warnings.length,
                passed: results.passed.length
            },
            byCategory: {}
        };
        
        // ルール別統計
        const allIssues = [...results.errors, ...results.warnings, ...results.passed];
        for (const issue of allIssues) {
            if (!stats.byRule[issue.rule]) {
                stats.byRule[issue.rule] = {
                    total: 0,
                    errors: 0,
                    warnings: 0,
                    passed: 0
                };
            }
            
            stats.byRule[issue.rule].total++;
            if (issue.severity === 'error') {
                stats.byRule[issue.rule].errors++;
            } else if (issue.severity === 'warning') {
                stats.byRule[issue.rule].warnings++;
            } else {
                stats.byRule[issue.rule].passed++;
            }
        }
        
        // カテゴリ別統計
        for (const [rule, ruleStats] of Object.entries(stats.byRule)) {
            const category = this.getRuleCategory(rule);
            if (!stats.byCategory[category]) {
                stats.byCategory[category] = {
                    total: 0,
                    errors: 0,
                    warnings: 0,
                    passed: 0
                };
            }
            
            stats.byCategory[category].total += ruleStats.total;
            stats.byCategory[category].errors += ruleStats.errors;
            stats.byCategory[category].warnings += ruleStats.warnings;
            stats.byCategory[category].passed += ruleStats.passed;
        }
        
        return stats;
    }
    
    /**
     * 問題を分類
     */
    private categorizeIssues(results: ValidationResults, options: ReportOptions): CategorizedIssues {
        const categorized: CategorizedIssues = {
            critical: [],
            major: [],
            minor: [],
            info: []
        };
        
        const issues = [...results.errors, ...results.warnings];
        
        // フィルタリング
        let filteredIssues = issues;
        if (options.filterSeverity) {
            filteredIssues = issues.filter(issue => 
                options.filterSeverity!.includes(issue.severity)
            );
        }
        
        if (options.maxIssues) {
            filteredIssues = filteredIssues.slice(0, options.maxIssues);
        }
        
        // 分類
        for (const issue of filteredIssues) {
            const priority = this.calculateIssuePriority(issue);
            switch (priority) {
                case 'critical':
                    categorized.critical.push(issue);
                    break;
                case 'major':
                    categorized.major.push(issue);
                    break;
                case 'minor':
                    categorized.minor.push(issue);
                    break;
                default:
                    categorized.info.push(issue);
            }
        }
        
        return categorized;
    }
    
    /**
     * 推奨事項を生成
     */
    private generateRecommendations(results: ValidationResults): Recommendation[] {
        const recommendations: Recommendation[] = [];
        const summary = this.generateSummary(results);
        const stats = this.generateStatistics(results);
        
        // 品質スコアに基づく推奨
        if (summary.qualityScore < 50) {
            recommendations.push({
                priority: 'critical',
                type: 'quality',
                title: '品質改善が急務です',
                description: '翻訳品質が著しく低下しています。早急な対応が必要です。',
                actions: [
                    'プロの翻訳者によるレビューを検討',
                    'エラーの多いルールを優先的に修正',
                    '機械翻訳の設定を見直し'
                ]
            });
        } else if (summary.qualityScore < 70) {
            recommendations.push({
                priority: 'high',
                type: 'quality',
                title: '品質向上の余地があります',
                description: '翻訳品質にいくつかの問題があります。',
                actions: [
                    '警告事項を確認し修正',
                    'スタイルガイドの見直し',
                    '用語集の更新'
                ]
            });
        }
        
        // エラー数に基づく推奨
        if (summary.errorCount > 50) {
            recommendations.push({
                priority: 'critical',
                type: 'errors',
                title: '多数のエラーが検出されました',
                description: `${summary.errorCount}件のエラーが見つかりました。`,
                actions: [
                    '最も頻度の高いエラータイプから修正',
                    '自動修正ツールの活用',
                    'CI/CDパイプラインへの品質チェック導入'
                ]
            });
        }
        
        // 完成率に基づく推奨
        if (summary.completionRate < 80) {
            recommendations.push({
                priority: 'high',
                type: 'completion',
                title: '翻訳の完成度が低い',
                description: `翻訳完成率が${summary.completionRate.toFixed(1)}%です。`,
                actions: [
                    '未翻訳項目の優先順位付け',
                    '翻訳リソースの追加割り当て',
                    '段階的なリリース計画の検討'
                ]
            });
        }
        
        // カテゴリ別の推奨
        for (const [category, catStats] of Object.entries(stats.byCategory)) {
            const errorRate = catStats.total > 0 ? (catStats.errors / catStats.total) * 100 : 0;
            if (errorRate > 30) {
                recommendations.push({
                    priority: 'medium',
                    type: 'category',
                    title: `${category}カテゴリに問題があります`,
                    description: `${category}のエラー率が${errorRate.toFixed(1)}%と高くなっています。`,
                    actions: [
                        `${category}専門の翻訳者によるレビュー`,
                        `${category}用の用語集作成`,
                        `${category}特有のルール見直し`
                    ]
                });
            }
        }
        
        return recommendations.sort((a, b) => 
            this.getPriorityOrder(a.priority) - this.getPriorityOrder(b.priority)
        );
    }
    
    /**
     * トレンド分析
     */
    private analyzeTrends(language: string): TrendData {
        const trends = this.qualityTrends.get(language) || [];
        
        if (trends.length < 2) {
            return {
                message: 'トレンド分析には複数回のレポートが必要です',
                data: null
            };
        }
        
        const latest = trends[trends.length - 1];
        const previous = trends[trends.length - 2];
        
        const scoreChange: TrendChange = {
            value: latest.qualityScore - previous.qualityScore,
            direction: this.getChangeDirection(latest.qualityScore, previous.qualityScore),
            percentage: previous.qualityScore > 0 
                ? ((latest.qualityScore - previous.qualityScore) / previous.qualityScore) * 100 
                : 0
        };
        
        const errorChange: TrendChange = {
            value: latest.errorCount - previous.errorCount,
            direction: this.getChangeDirection(previous.errorCount, latest.errorCount), // 逆方向
            percentage: previous.errorCount > 0 
                ? ((latest.errorCount - previous.errorCount) / previous.errorCount) * 100 
                : 0
        };
        
        const warningChange: TrendChange = {
            value: latest.warningCount - previous.warningCount,
            direction: this.getChangeDirection(previous.warningCount, latest.warningCount), // 逆方向
            percentage: previous.warningCount > 0 
                ? ((latest.warningCount - previous.warningCount) / previous.warningCount) * 100 
                : 0
        };
        
        const overallTrend = this.calculateOverallTrend(scoreChange, errorChange, warningChange);
        
        return {
            data: {
                scoreChange: scoreChange,
                errorChange: errorChange,
                warningChange: warningChange,
                overallTrend: overallTrend
            }
        };
    }
    
    /**
     * レポートをレンダリング
     */
    private renderReport(data: ReportData, template: ReportTemplate, options: ReportOptions): string {
        switch (template.format) {
            case 'html':
                return this.renderHTMLReport(data, template, options);
            case 'csv':
                return this.renderCSVReport(data, options);
            case 'json':
                return this.renderJSONReport(data, options);
            default:
                throw new Error(`Unsupported report format: ${template.format}`);
        }
    }
    
    /**
     * HTML形式のレポートをレンダリング
     */
    private renderHTMLReport(data: ReportData, template: ReportTemplate, options: ReportOptions): string {
        const sections = options.customSections || template.sections;
        let html = this.getHTMLHeader(data);
        
        for (const section of sections) {
            switch (section) {
                case 'summary':
                    html += this.renderSummarySection(data.summary);
                    break;
                case 'statistics':
                    html += this.renderStatisticsSection(data.statistics);
                    break;
                case 'issues':
                    html += this.renderIssuesSection(data.issues);
                    break;
                case 'recommendations':
                    html += this.renderRecommendationsSection(data.recommendations);
                    break;
                case 'trends':
                    html += this.renderTrendsSection(data.trends);
                    break;
                case 'key_issues':
                    html += this.renderKeyIssuesSection(data.issues);
                    break;
            }
        }
        
        html += this.getHTMLFooter();
        return html;
    }
    
    /**
     * HTMLヘッダーを取得
     */
    private getHTMLHeader(data: ReportData): string {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>翻訳品質レポート - ${data.language}</title>
    <style>
        body { font-family: 'Noto Sans JP', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        h3 { color: #666; }
        .summary { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .score { font-size: 48px; font-weight: bold; }
        .grade { font-size: 24px; margin-left: 10px; }
        .grade-A { color: #4CAF50; }
        .grade-B { color: #8BC34A; }
        .grade-C { color: #FFC107; }
        .grade-D { color: #FF9800; }
        .grade-F { color: #F44336; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #333; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .error { color: #F44336; }
        .warning { color: #FF9800; }
        .success { color: #4CAF50; }
        .issue { margin: 10px 0; padding: 10px; background: #fff; border-left: 4px solid; border-radius: 3px; }
        .issue-critical { border-color: #F44336; background: #FFEBEE; }
        .issue-major { border-color: #FF9800; background: #FFF3E0; }
        .issue-minor { border-color: #FFC107; background: #FFFDE7; }
        .issue-info { border-color: #2196F3; background: #E3F2FD; }
        .recommendation { margin: 15px 0; padding: 15px; background: #E8F5E9; border-radius: 5px; }
        .recommendation-critical { background: #FFEBEE; }
        .recommendation-high { background: #FFF3E0; }
        .recommendation-medium { background: #FFFDE7; }
        .recommendation-low { background: #E3F2FD; }
        .trend { display: flex; align-items: center; gap: 10px; }
        .trend-up { color: #4CAF50; }
        .trend-down { color: #F44336; }
        .trend-stable { color: #666; }
        .progress { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
        .progress-bar { height: 100%; background: #4CAF50; transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="container">
        <h1>翻訳品質レポート</h1>
        <p>言語: ${data.language} | ソース言語: ${data.sourceLanguage} | 生成日時: ${new Date(data.timestamp).toLocaleString('ja-JP')}</p>`;
    }
    
    /**
     * HTMLフッターを取得
     */
    private getHTMLFooter(): string {
        return `
    </div>
</body>
</html>`;
    }
    
    /**
     * サマリーセクションをレンダリング
     */
    private renderSummarySection(summary: ReportSummary): string {
        const gradeClass = `grade-${summary.qualityGrade}`;
        
        return `
        <div class="summary">
            <h2>概要</h2>
            <div style="display: flex; align-items: baseline; margin-bottom: 20px;">
                <span class="score">${summary.qualityScore.toFixed(1)}</span>
                <span class="grade ${gradeClass}">${summary.qualityGrade}</span>
            </div>
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-value">${summary.totalItems}</div>
                    <div class="stat-label">総項目数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${summary.checkedItems}</div>
                    <div class="stat-label">検査済み項目</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value error">${summary.errorCount}</div>
                    <div class="stat-label">エラー</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value warning">${summary.warningCount}</div>
                    <div class="stat-label">警告</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value success">${summary.passedCount}</div>
                    <div class="stat-label">合格</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${summary.completionRate.toFixed(1)}%</div>
                    <div class="stat-label">完成率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${summary.successRate.toFixed(1)}%</div>
                    <div class="stat-label">成功率</div>
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar" style="width: ${summary.successRate}%"></div>
            </div>
        </div>`;
    }
    
    /**
     * 統計セクションをレンダリング
     */
    private renderStatisticsSection(statistics: ReportStatistics): string {
        let html = '<div class="statistics"><h2>詳細統計</h2>';
        
        // ルール別統計
        html += '<h3>ルール別結果</h3><table><tr><th>ルール</th><th>合計</th><th>エラー</th><th>警告</th><th>合格</th></tr>';
        for (const [rule, stats] of Object.entries(statistics.byRule)) {
            html += `<tr>
                <td>${rule}</td>
                <td>${stats.total}</td>
                <td class="error">${stats.errors}</td>
                <td class="warning">${stats.warnings}</td>
                <td class="success">${stats.passed}</td>
            </tr>`;
        }
        html += '</table>';
        
        // カテゴリ別統計
        html += '<h3>カテゴリ別結果</h3><table><tr><th>カテゴリ</th><th>合計</th><th>エラー</th><th>警告</th><th>合格</th></tr>';
        for (const [category, stats] of Object.entries(statistics.byCategory)) {
            html += `<tr>
                <td>${category}</td>
                <td>${stats.total}</td>
                <td class="error">${stats.errors}</td>
                <td class="warning">${stats.warnings}</td>
                <td class="success">${stats.passed}</td>
            </tr>`;
        }
        html += '</table></div>';
        
        return html;
    }
    
    /**
     * 問題セクションをレンダリング
     */
    private renderIssuesSection(issues: CategorizedIssues): string {
        let html = '<div class="issues"><h2>検出された問題</h2>';
        
        // 重大な問題
        if (issues.critical.length > 0) {
            html += '<h3>重大な問題</h3>';
            for (const issue of issues.critical) {
                html += this.renderIssue(issue, 'critical');
            }
        }
        
        // 主要な問題
        if (issues.major.length > 0) {
            html += '<h3>主要な問題</h3>';
            for (const issue of issues.major) {
                html += this.renderIssue(issue, 'major');
            }
        }
        
        // 軽微な問題
        if (issues.minor.length > 0) {
            html += '<h3>軽微な問題</h3>';
            for (const issue of issues.minor) {
                html += this.renderIssue(issue, 'minor');
            }
        }
        
        // 情報
        if (issues.info.length > 0) {
            html += '<h3>情報</h3>';
            for (const issue of issues.info) {
                html += this.renderIssue(issue, 'info');
            }
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * 個別の問題をレンダリング
     */
    private renderIssue(issue: ValidationIssue, priority: string): string {
        return `<div class="issue issue-${priority}">
            <strong>${issue.rule}</strong>: ${issue.message}
            ${issue.key ? `<br><small>キー: ${issue.key}</small>` : ''}
            ${issue.suggestion ? `<br><em>提案: ${issue.suggestion}</em>` : ''}
        </div>`;
    }
    
    /**
     * 推奨事項セクションをレンダリング
     */
    private renderRecommendationsSection(recommendations: Recommendation[]): string {
        if (recommendations.length === 0) {
            return '';
        }
        
        let html = '<div class="recommendations"><h2>推奨事項</h2>';
        
        for (const rec of recommendations) {
            html += `<div class="recommendation recommendation-${rec.priority}">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <ul>
                    ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * トレンドセクションをレンダリング
     */
    private renderTrendsSection(trends: TrendData): string {
        let html = '<div class="trends"><h2>トレンド分析</h2>';
        
        if (!trends.data) {
            html += `<p>${trends.message || 'トレンドデータが不足しています'}</p>`;
        } else {
            const trendData = trends.data;
            const overallIcon = this.getTrendIcon(trendData.overallTrend);
            
            html += `<p><strong>全体的な傾向: ${overallIcon} ${this.getTrendText(trendData.overallTrend)}</strong></p>`;
            
            html += '<div class="stat-grid">';
            html += this.renderTrendItem('品質スコア', trendData.scoreChange);
            html += this.renderTrendItem('エラー数', trendData.errorChange);
            html += this.renderTrendItem('警告数', trendData.warningChange);
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * トレンド項目をレンダリング
     */
    private renderTrendItem(label: string, change: TrendChange): string {
        const directionClass = `trend-${change.direction === 'improvement' ? 'up' : change.direction === 'decline' ? 'down' : 'stable'}`;
        const icon = this.getDirectionIcon(change.direction);
        
        return `<div class="stat-card">
            <div class="stat-label">${label}</div>
            <div class="trend ${directionClass}">
                ${icon} ${change.value > 0 ? '+' : ''}${change.value.toFixed(1)}
                ${change.percentage !== undefined ? `(${change.percentage.toFixed(1)}%)` : ''}
            </div>
        </div>`;
    }
    
    /**
     * 主要な問題セクションをレンダリング
     */
    private renderKeyIssuesSection(issues: CategorizedIssues): string {
        const keyIssues = [
            ...issues.critical.slice(0, 3),
            ...issues.major.slice(0, 2)
        ];
        
        if (keyIssues.length === 0) {
            return '';
        }
        
        let html = '<div class="key-issues"><h2>主要な問題</h2>';
        
        for (const issue of keyIssues) {
            const priority = issues.critical.includes(issue) ? 'critical' : 'major';
            html += this.renderIssue(issue, priority);
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * CSV形式のレポートをレンダリング
     */
    private renderCSVReport(data: ReportData, _options: ReportOptions): string {
        const rows: string[][] = [];
        
        // ヘッダー
        rows.push(['Type', 'Rule', 'Severity', 'Key', 'Message', 'Suggestion']);
        
        // 問題を追加
        const allIssues = [
            ...data.issues.critical.map(i => ({ ...i, priority: 'critical' })),
            ...data.issues.major.map(i => ({ ...i, priority: 'major' })),
            ...data.issues.minor.map(i => ({ ...i, priority: 'minor' })),
            ...data.issues.info.map(i => ({ ...i, priority: 'info' }))
        ];
        
        for (const issue of allIssues) {
            rows.push([
                issue.priority,
                issue.rule,
                issue.severity,
                issue.key || '',
                issue.message,
                issue.suggestion || ''
            ]);
        }
        
        // CSVフォーマット
        return rows.map(row => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    /**
     * JSON形式のレポートをレンダリング
     */
    private renderJSONReport(data: ReportData, options: ReportOptions): string {
        if (options.includeRawData) {
            return JSON.stringify(data, null, 2);
        } else {
            // 簡略化されたデータ
            const simplified = {
                id: data.id,
                timestamp: data.timestamp,
                language: data.language,
                summary: data.summary,
                issueCount: {
                    critical: data.issues.critical.length,
                    major: data.issues.major.length,
                    minor: data.issues.minor.length,
                    info: data.issues.info.length
                },
                recommendations: data.recommendations.length,
                trends: data.trends
            };
            return JSON.stringify(simplified, null, 2);
        }
    }
    
    /**
     * レポートIDを生成
     */
    private generateReportId(): string {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 履歴に追加
     */
    private addToHistory(data: ReportData): void {
        this.reportHistory.push({
            id: data.id,
            timestamp: data.timestamp,
            language: data.language,
            qualityScore: data.summary.qualityScore,
            errorCount: data.summary.errorCount,
            warningCount: data.summary.warningCount
        });
        
        // 履歴を最新100件に制限
        if (this.reportHistory.length > 100) {
            this.reportHistory = this.reportHistory.slice(-100);
        }
    }
    
    /**
     * トレンドを更新
     */
    private updateTrends(results: ValidationResults): void {
        const trends = this.qualityTrends.get(results.language) || [];
        const summary = this.generateSummary(results);
        
        trends.push({
            timestamp: results.timestamp,
            qualityScore: summary.qualityScore,
            errorCount: summary.errorCount,
            warningCount: summary.warningCount,
            successRate: summary.successRate
        });
        
        // トレンドを最新50件に制限
        if (trends.length > 50) {
            trends.splice(0, trends.length - 50);
        }
        
        this.qualityTrends.set(results.language, trends);
    }
    
    /**
     * ルールのカテゴリを取得
     */
    private getRuleCategory(rule: string): string {
        // ルール名からカテゴリを推定
        if (rule.includes('length') || rule.includes('size')) {
            return '長さ';
        } else if (rule.includes('format') || rule.includes('placeholder')) {
            return 'フォーマット';
        } else if (rule.includes('consistency') || rule.includes('term')) {
            return '一貫性';
        } else if (rule.includes('spelling') || rule.includes('grammar')) {
            return '文法';
        } else if (rule.includes('character') || rule.includes('encoding')) {
            return '文字';
        } else {
            return 'その他';
        }
    }
    
    /**
     * 問題の優先度を計算
     */
    private calculateIssuePriority(issue: ValidationIssue): 'critical' | 'major' | 'minor' | 'info' {
        // ルールと重要度に基づいて優先度を決定
        if (issue.severity === 'error') {
            if (issue.rule.includes('placeholder') || issue.rule.includes('format')) {
                return 'critical';
            } else {
                return 'major';
            }
        } else if (issue.severity === 'warning') {
            if (issue.rule.includes('consistency') || issue.rule.includes('term')) {
                return 'major';
            } else {
                return 'minor';
            }
        } else {
            return 'info';
        }
    }
    
    /**
     * 優先度の順序を取得
     */
    private getPriorityOrder(priority: string): number {
        const order: Record<string, number> = {
            'critical': 0,
            'high': 1,
            'medium': 2,
            'low': 3
        };
        return order[priority] || 999;
    }
    
    /**
     * 変更の方向を取得
     */
    private getChangeDirection(current: number, previous: number): 'improvement' | 'decline' | 'stable' {
        const threshold = 0.01; // 1%の変化を閾値とする
        const change = Math.abs(current - previous) / (previous || 1);
        
        if (change < threshold) {
            return 'stable';
        } else if (current > previous) {
            return 'improvement';
        } else {
            return 'decline';
        }
    }
    
    /**
     * 全体的なトレンドを計算
     */
    private calculateOverallTrend(
        scoreChange: TrendChange,
        errorChange: TrendChange,
        warningChange: TrendChange
    ): 'improving' | 'declining' | 'stable' | 'insufficient_data' {
        let improvementScore = 0;
        
        // スコアの変化を評価（重み: 3）
        if (scoreChange.direction === 'improvement') improvementScore += 3;
        else if (scoreChange.direction === 'decline') improvementScore -= 3;
        
        // エラーの変化を評価（重み: 2）
        if (errorChange.direction === 'improvement') improvementScore += 2;
        else if (errorChange.direction === 'decline') improvementScore -= 2;
        
        // 警告の変化を評価（重み: 1）
        if (warningChange.direction === 'improvement') improvementScore += 1;
        else if (warningChange.direction === 'decline') improvementScore -= 1;
        
        if (improvementScore > 2) {
            return 'improving';
        } else if (improvementScore < -2) {
            return 'declining';
        } else {
            return 'stable';
        }
    }
    
    /**
     * トレンドアイコンを取得
     */
    private getTrendIcon(trend: string): string {
        const icons: Record<string, string> = {
            'improving': '📈',
            'declining': '📉',
            'stable': '➡️',
            'insufficient_data': '❓'
        };
        return icons[trend] || '';
    }
    
    /**
     * トレンドテキストを取得
     */
    private getTrendText(trend: string): string {
        const texts: Record<string, string> = {
            'improving': '改善傾向',
            'declining': '悪化傾向',
            'stable': '安定',
            'insufficient_data': 'データ不足'
        };
        return texts[trend] || '';
    }
    
    /**
     * 方向アイコンを取得
     */
    private getDirectionIcon(direction: string): string {
        const icons: Record<string, string> = {
            'improvement': '↑',
            'decline': '↓',
            'stable': '→'
        };
        return icons[direction] || '';
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): ReporterStats {
        const scores = this.reportHistory.map(h => h.qualityScore);
        const averageScore = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0;
        
        return {
            totalReports: this.reportHistory.length,
            languagesTracked: this.qualityTrends.size,
            availableTemplates: Array.from(this.reportTemplates.keys()),
            averageQualityScore: averageScore
        };
    }
    
    /**
     * 履歴を取得
     */
    getHistory(language?: string, limit: number = 10): ReportHistoryEntry[] {
        let history = this.reportHistory;
        
        if (language) {
            history = history.filter(h => h.language === language);
        }
        
        return history.slice(-limit);
    }
    
    /**
     * トレンドデータを取得
     */
    getTrendData(language: string): QualityTrend[] {
        return this.qualityTrends.get(language) || [];
    }
    
    /**
     * 履歴をクリア
     */
    clearHistory(): void {
        this.reportHistory = [];
        this.qualityTrends.clear();
    }
    
    /**
     * カスタムテンプレートを追加
     */
    addCustomTemplate(name: string, template: ReportTemplate): void {
        this.reportTemplates.set(name, template);
    }
}

// シングルトンインスタンス
let qualityReporterInstance: QualityReporter | null = null;

/**
 * QualityReporterのシングルトンインスタンスを取得
 */
export function getQualityReporter(): QualityReporter {
    if (!qualityReporterInstance) {
        qualityReporterInstance = new QualityReporter();
    }
    return qualityReporterInstance;
}