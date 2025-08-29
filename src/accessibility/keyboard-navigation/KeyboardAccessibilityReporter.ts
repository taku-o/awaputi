/**
 * KeyboardAccessibilityReporter
 * キーボードアクセシビリティテスト結果の報告と分析機能を提供
 * - テスト結果の編集と報告
 * - 問題の分類と優先順位付け
 * - アクセシビリティ準拠スコア計算
 * - レポート生成とフォーマット
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// Interfaces for keyboard accessibility reporting
interface ReporterConfig {
    enabled: boolean;
    generateDetailedReports: boolean;
    includeRecommendations: boolean;
    exportFormats: string[];
    scoringWeights: ScoringWeights;
}

interface ScoringWeights {
    critical: number;
    high: number;
    medium: number;
    low: number;
}

interface TestResults {
    overall: OverallResults;
    suiteResults: Record<string, SuiteResult>;
    issues: Issue[];
    recommendations: Recommendation[];
    statistics: Statistics;
    categorizedIssues?: CategorizedIssues;
    timestamp?: string;
}

interface OverallResults {
    score: number;
    passed: number;
    failed: number;
    warnings: number;
    timestamp: string | null;
    deductions?: number;
    level?: string;
}

interface SuiteResult {
    score?: number;
    passed?: number;
    failed?: number;
    warnings?: number;
    issues?: Issue[];
}

interface Issue {
    type: "single" | "batch";
    message: string;
    details?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    category?: string;
    impact?: number;
    wcagReference?: string;
}

interface Recommendation {
    category: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actions: string[];
    wcagReference?: string;
    effort?: string;
}

interface Statistics {
    totalTests: number;
    passRate: number;
    failureRate: number;
    warningRate: number;
    issuesByCategory: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    testDuration: number;
    coverage: number;
}

interface CategorizedIssues {
    [category: string]: Issue[];
}

interface ReportFormat {
    name: string;
    extension: string;
    mimeType: string;
    generator: (results: TestResults) => string | Blob;
}

interface ReportTemplate {
    name: string;
    sections: ReportSection[];
}

interface ReportSection {
    title: string;
    type: 'summary' | 'issues' | 'recommendations' | 'statistics' | 'details';
    includeCharts?: boolean;
    includeData?: boolean;
}

export class KeyboardAccessibilityReporter {
    private config: ReporterConfig;
    private reportFormats: Map<string, ReportFormat>;
    private reportTemplates: Map<string, ReportTemplate>;
    private currentResults: TestResults | null;
    private initialized: boolean;

    constructor(config: Partial<ReporterConfig> = {}) {
        this.config = {
            enabled: true,
            generateDetailedReports: true,
            includeRecommendations: true,
            exportFormats: ['html', 'json', 'csv'],
            scoringWeights: {
                critical: 10,
                high: 5,
                medium: 2,
                low: 1
            },
            ...config
        };

        this.reportFormats = new Map();
        this.reportTemplates = new Map();
        this.currentResults = null;
        this.initialized = false;

        this.initialize();
    }

    /**
     * Initialize the reporter
     */
    private initialize(): void {
        try {
            this.setupReportFormats();
            this.setupReportTemplates();
            this.initialized = true;
            console.log('KeyboardAccessibilityReporter initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_REPORTER_ERROR', {
                operation: 'initialize'
            });
        }
    }

    /**
     * Process and store test results
     */
    processResults(results: any): TestResults {
        try {
            if (!this.initialized) {
                throw new Error('Reporter not initialized');
            }

            const processedResults: TestResults = {
                overall: this.calculateOverallResults(results),
                suiteResults: this.processSuiteResults(results.suiteResults || {}),
                issues: this.categorizeIssues(results.issues || []),
                recommendations: this.generateRecommendations(results.issues || []),
                statistics: this.calculateStatistics(results),
                timestamp: new Date().toISOString()
            };

            // Add categorized issues
            processedResults.categorizedIssues = this.groupIssuesByCategory(processedResults.issues);

            this.currentResults = processedResults;
            return processedResults;
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_REPORTER_ERROR', {
                operation: 'processResults'
            });
            throw error;
        }
    }

    /**
     * Calculate overall test results
     */
    private calculateOverallResults(results: any): OverallResults {
        const overall = results.overall || {};
        const passed = overall.passed || 0;
        const failed = overall.failed || 0;
        const warnings = overall.warnings || 0;
        const total = passed + failed + warnings;

        const score = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        return {
            score: score,
            passed: passed,
            failed: failed,
            warnings: warnings,
            timestamp: overall.timestamp || new Date().toISOString(),
            deductions: this.calculateDeductions(results.issues || []),
            level: this.determineComplianceLevel(score)
        };
    }

    /**
     * Process suite-specific results
     */
    private processSuiteResults(suiteResults: Record<string, any>): Record<string, SuiteResult> {
        const processed: Record<string, SuiteResult> = {};

        for (const [suiteName, suite] of Object.entries(suiteResults)) {
            processed[suiteName] = {
                score: suite.score || 0,
                passed: suite.passed || 0,
                failed: suite.failed || 0,
                warnings: suite.warnings || 0,
                issues: suite.issues || []
            };
        }

        return processed;
    }

    /**
     * Categorize and prioritize issues
     */
    private categorizeIssues(issues: any[]): Issue[] {
        return issues.map(issue => ({
            type: issue.type || "single",
            message: issue.message || 'Unknown issue',
            details: issue.details,
            severity: this.determineSeverity(issue),
            priority: this.determinePriority(issue),
            category: this.categorizeIssue(issue),
            impact: this.calculateImpact(issue),
            wcagReference: this.getWCAGReference(issue)
        }));
    }

    /**
     * Generate recommendations based on issues
     */
    private generateRecommendations(issues: any[]): Recommendation[] {
        const recommendations: Recommendation[] = [];
        const issueCategories = this.groupIssuesByCategory(issues);

        for (const [category, categoryIssues] of Object.entries(issueCategories)) {
            const recommendation = this.createCategoryRecommendation(category, categoryIssues);
            if (recommendation) {
                recommendations.push(recommendation);
            }
        }

        return recommendations.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
    }

    /**
     * Calculate test statistics
     */
    private calculateStatistics(results: any): Statistics {
        const overall = results.overall || {};
        const issues = results.issues || [];
        const total = (overall.passed || 0) + (overall.failed || 0) + (overall.warnings || 0);

        return {
            totalTests: total,
            passRate: total > 0 ? Math.round(((overall.passed || 0) / total) * 100) : 0,
            failureRate: total > 0 ? Math.round(((overall.failed || 0) / total) * 100) : 0,
            warningRate: total > 0 ? Math.round(((overall.warnings || 0) / total) * 100) : 0,
            issuesByCategory: this.countByProperty(issues, 'category'),
            issuesBySeverity: this.countByProperty(issues, 'severity'),
            testDuration: results.duration || 0,
            coverage: this.calculateCoverage(results)
        };
    }

    /**
     * Generate report in specified format
     */
    generateReport(format: string = 'html', template: string = 'default'): string | Blob | null {
        try {
            if (!this.currentResults) {
                throw new Error('No test results available for reporting');
            }

            const reportFormat = this.reportFormats.get(format.toLowerCase());
            if (!reportFormat) {
                throw new Error(`Unsupported report format: ${format}`);
            }

            return reportFormat.generator(this.currentResults);
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_REPORTER_ERROR', {
                operation: 'generateReport',
                format: format
            });
            return null;
        }
    }

    /**
     * Export report to file
     */
    exportReport(format: string = 'html', filename?: string): void {
        try {
            const report = this.generateReport(format);
            if (!report) {
                throw new Error('Failed to generate report');
            }

            const reportFormat = this.reportFormats.get(format.toLowerCase());
            if (!reportFormat) {
                throw new Error(`Unknown format: ${format}`);
            }

            const finalFilename = filename || `accessibility-report-${Date.now()}.${reportFormat.extension}`;
            
            if (typeof report === 'string') {
                this.downloadTextFile(report, finalFilename, reportFormat.mimeType);
            } else {
                this.downloadBlob(report, finalFilename);
            }

            console.log(`Report exported as ${finalFilename}`);
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_REPORTER_ERROR', {
                operation: 'exportReport',
                format: format
            });
        }
    }

    /**
     * Setup available report formats
     */
    private setupReportFormats(): void {
        this.reportFormats.set('html', {
            name: 'HTML Report',
            extension: 'html',
            mimeType: 'text/html',
            generator: (results: TestResults) => this.generateHTMLReport(results)
        });

        this.reportFormats.set('json', {
            name: 'JSON Data',
            extension: 'json',
            mimeType: 'application/json',
            generator: (results: TestResults) => JSON.stringify(results, null, 2)
        });

        this.reportFormats.set('csv', {
            name: 'CSV Data',
            extension: 'csv',
            mimeType: 'text/csv',
            generator: (results: TestResults) => this.generateCSVReport(results)
        });
    }

    /**
     * Setup report templates
     */
    private setupReportTemplates(): void {
        this.reportTemplates.set('default', {
            name: 'Default Report',
            sections: [
                { title: 'Summary', type: 'summary', includeCharts: true },
                { title: 'Issues', type: 'issues', includeData: true },
                { title: 'Recommendations', type: 'recommendations' },
                { title: 'Statistics', type: 'statistics', includeCharts: true }
            ]
        });

        this.reportTemplates.set('executive', {
            name: 'Executive Summary',
            sections: [
                { title: 'Summary', type: 'summary', includeCharts: true },
                { title: 'Recommendations', type: 'recommendations' }
            ]
        });
    }

    /**
     * Generate HTML report
     */
    private generateHTMLReport(results: TestResults): string {
        const timestamp = new Date().toLocaleString();
        
        return `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>キーボードアクセシビリティレポート</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
                .score { font-size: 2em; font-weight: bold; color: ${this.getScoreColor(results.overall.score)}; }
                .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .issue { margin: 10px 0; padding: 10px; border-left: 4px solid; }
                .critical { border-left-color: #d32f2f; background: #ffebee; }
                .high { border-left-color: #f57c00; background: #fff3e0; }
                .medium { border-left-color: #fbc02d; background: #fffde7; }
                .low { border-left-color: #388e3c; background: #e8f5e8; }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                .stat-card { padding: 15px; background: #f9f9f9; border-radius: 5px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>キーボードアクセシビリティレポート</h1>
                <p>生成日時: ${timestamp}</p>
                <div class="score">スコア: ${results.overall.score}/100</div>
                <p>準拠レベル: ${results.overall.level}</p>
            </div>

            <div class="section">
                <h2>概要</h2>
                <div class="stats">
                    <div class="stat-card">
                        <h3>合格</h3>
                        <p>${results.overall.passed}</p>
                    </div>
                    <div class="stat-card">
                        <h3>失敗</h3>
                        <p>${results.overall.failed}</p>
                    </div>
                    <div class="stat-card">
                        <h3>警告</h3>
                        <p>${results.overall.warnings}</p>
                    </div>
                    <div class="stat-card">
                        <h3>総テスト数</h3>
                        <p>${results.statistics.totalTests}</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>問題一覧</h2>
                ${results.issues.map(issue => `
                    <div class="issue ${issue.severity}">
                        <h4>${issue.message}</h4>
                        <p><strong>重要度:</strong> ${issue.severity}</p>
                        <p><strong>カテゴリ:</strong> ${issue.category}</p>
                        ${issue.details ? `<p><strong>詳細:</strong> ${issue.details}</p>` : ''}
                        ${issue.wcagReference ? `<p><strong>WCAG参照:</strong> ${issue.wcagReference}</p>` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>推奨事項</h2>
                ${results.recommendations.map(rec => `
                    <div class="issue ${rec.priority}">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate CSV report
     */
    private generateCSVReport(results: TestResults): string {
        const headers = ['Category', 'Message', 'Severity', 'Priority', 'Details', 'WCAG Reference'];
        const rows = results.issues.map(issue => [
            issue.category || '',
            issue.message || '',
            issue.severity || '',
            issue.priority || '',
            issue.details || '',
            issue.wcagReference || ''
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    }

    // Helper methods
    private determineSeverity(issue: any): 'critical' | 'high' | 'medium' | 'low' {
        if (issue.severity) return issue.severity;
        if (issue.message?.toLowerCase().includes('critical')) return 'critical';
        if (issue.message?.toLowerCase().includes('error')) return 'high';
        if (issue.message?.toLowerCase().includes('warning')) return 'medium';
        return 'low';
    }

    private determinePriority(issue: any): 'critical' | 'high' | 'medium' | 'low' {
        return issue.priority || this.determineSeverity(issue);
    }

    private categorizeIssue(issue: any): string {
        if (issue.category) return issue.category;
        
        const message = issue.message?.toLowerCase() || '';
        if (message.includes('focus')) return 'Focus Management';
        if (message.includes('keyboard')) return 'Keyboard Navigation';
        if (message.includes('tab')) return 'Tab Order';
        if (message.includes('aria')) return 'ARIA';
        
        return 'General';
    }

    private calculateImpact(issue: any): number {
        const severityWeights = this.config.scoringWeights;
        const severity = this.determineSeverity(issue);
        return severityWeights[severity] || 1;
    }

    private getWCAGReference(issue: any): string | undefined {
        return issue.wcagReference || this.inferWCAGReference(issue);
    }

    private inferWCAGReference(issue: any): string | undefined {
        const message = issue.message?.toLowerCase() || '';
        if (message.includes('focus')) return 'WCAG 2.4.7';
        if (message.includes('keyboard')) return 'WCAG 2.1.1';
        if (message.includes('tab')) return 'WCAG 2.4.3';
        return undefined;
    }

    private calculateDeductions(issues: any[]): number {
        return issues.reduce((total, issue) => total + this.calculateImpact(issue), 0);
    }

    private determineComplianceLevel(score: number): string {
        if (score >= 90) return 'AAA';
        if (score >= 80) return 'AA';
        if (score >= 70) return 'A';
        return 'Non-compliant';
    }

    private groupIssuesByCategory(issues: any[]): CategorizedIssues {
        const categorized: CategorizedIssues = {};
        
        for (const issue of issues) {
            const category = issue.category || 'Other';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(issue);
        }
        
        return categorized;
    }

    private createCategoryRecommendation(category: string, issues: any[]): Recommendation | null {
        if (issues.length === 0) return null;

        const highestPriority = issues.reduce((max, issue) => 
            this.getPriorityWeight(issue.priority || 'low') > this.getPriorityWeight(max) ? issue.priority : max, 
            'low'
        );

        return {
            category: category,
            priority: highestPriority,
            title: `${category}の改善`,
            description: `${category}カテゴリで${issues.length}件の問題が発見されました。`,
            actions: this.generateCategoryActions(category, issues)
        };
    }

    private generateCategoryActions(category: string, issues: any[]): string[] {
        const actions = [`${category}関連の問題を優先的に修正してください。`];
        
        if (category === 'Focus Management') {
            actions.push('フォーカス可視化の改善を実装してください。');
            actions.push('適切なフォーカスオーダーを確保してください。');
        } else if (category === 'Keyboard Navigation') {
            actions.push('すべての機能をキーボードでアクセス可能にしてください。');
            actions.push('ショートカットキーの実装を検討してください。');
        }
        
        return actions;
    }

    private getPriorityWeight(priority: string): number {
        const weights = { critical: 4, high: 3, medium: 2, low: 1 };
        return weights[priority as keyof typeof weights] || 1;
    }

    private countByProperty(items: any[], property: string): Record<string, number> {
        return items.reduce((counts, item) => {
            const key = item[property] || 'Unknown';
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    }

    private calculateCoverage(results: any): number {
        // Simplified coverage calculation
        return Math.round(Math.random() * 100); // Placeholder
    }

    private getScoreColor(score: number): string {
        if (score >= 90) return '#4caf50';
        if (score >= 80) return '#ff9800';
        if (score >= 70) return '#f44336';
        return '#d32f2f';
    }

    private downloadTextFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        this.downloadBlob(blob, filename);
    }

    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Get current configuration
     */
    getConfig(): ReporterConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ReporterConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('KeyboardAccessibilityReporter configuration updated');
    }

    /**
     * Check if reporter is ready
     */
    isReady(): boolean {
        return this.initialized;
    }

    /**
     * Get available report formats
     */
    getAvailableFormats(): string[] {
        return Array.from(this.reportFormats.keys());
    }

    /**
     * Clear current results
     */
    clearResults(): void {
        this.currentResults = null;
        console.log('Test results cleared');
    }

    /**
     * Destroy reporter and cleanup resources
     */
    destroy(): void {
        this.clearResults();
        this.reportFormats.clear();
        this.reportTemplates.clear();
        this.initialized = false;
        console.log('KeyboardAccessibilityReporter destroyed');
    }
}