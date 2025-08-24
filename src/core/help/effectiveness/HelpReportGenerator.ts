/**
 * HelpReportGenerator
 * レポート生成、フォーマット、エクスポート機能を担当
 */

// 型定義
export interface HelpEffectivenessAnalyzer {
    gameEngine: GameEngine;
    loggingSystem: LoggingSystem;
    analyzeEffectiveness(options?: any): Promise<AnalysisResult>;
}

export interface GameEngine {
    [key: string]: any;
}

export interface LoggingSystem {
    info(component: string, message: string): void;
    warn(component: string, message: string): void;
    error(component: string, message: string, error?: any): void;
}

export interface GeneratorConfig {
    reportCacheTimeout: number;
    maxCacheSize: number;
    defaultFormat: string;
}

export interface ReportMetadata {
    reportType?: string;
    generatedAt?: number;
    cacheKey?: string;
    nextReviewDate?: number;
    actionPlanVersion?: string;
    reportVersion?: string;
    analysisScope?: any;
    dataQuality?: any;
    confidenceLevel?: number;
    nextScheduledAnalysis?: number;
    analysisOptions?: any;
    dataVolume?: any;
}

export interface AnalysisResult {
    overallEffectivenessScore: number;
    detailedAnalysis: DetailedAnalysis;
    keyMetrics: KeyMetrics;
    trends?: TrendAnalysis;
    recommendations: Recommendation[];
    metadata: AnalysisMetadata;
    dataQuality: any;
}

export interface DetailedAnalysis {
    usage: UsageAnalysis;
    engagement: EngagementAnalysis;
    satisfaction: SatisfactionAnalysis;
    effectiveness: EffectivenessAnalysis;
}

export interface KeyMetrics {
    usage: UsageMetrics;
    engagement: EngagementMetrics;
    satisfaction: SatisfactionMetrics;
}

export interface UsageMetrics {
    totalSessions: number;
    [key: string]: any;
}

export interface EngagementMetrics {
    interactionRate: number;
    [key: string]: any;
}

export interface SatisfactionMetrics {
    averageRating: number;
    [key: string]: any;
}

export interface UsageAnalysis {
    summary: UsageSummary;
    details: UsageDetails;
    insights: Insight[];
}

export interface EngagementAnalysis {
    summary: EngagementSummary;
    details: EngagementDetails;
    insights: Insight[];
}

export interface SatisfactionAnalysis {
    summary: SatisfactionSummary;
    details: SatisfactionDetails;
    insights: Insight[];
}

export interface EffectivenessAnalysis {
    classification: string;
    [key: string]: any;
}

export interface UsageSummary {
    [key: string]: any;
}

export interface UsageDetails {
    [key: string]: any;
}

export interface EngagementSummary {
    [key: string]: any;
}

export interface EngagementDetails {
    [key: string]: any;
}

export interface SatisfactionSummary {
    [key: string]: any;
}

export interface SatisfactionDetails {
    [key: string]: any;
}

export interface Insight {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
}

export interface TrendAnalysis {
    usage: UsageTrends;
    satisfaction: SatisfactionTrends;
}

export interface UsageTrends {
    sessionGrowth?: TrendData;
}

export interface SatisfactionTrends {
    ratingTrend?: TrendData;
}

export interface TrendData {
    trend: 'stable' | 'increasing' | 'decreasing';
    [key: string]: any;
}

export interface Recommendation {
    title: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    [key: string]: any;
}

export interface AnalysisMetadata {
    confidenceLevel: number;
    analysisOptions?: any;
    dataVolume?: any;
}

export interface ExecutiveReport {
    title: string;
    summary: ExecutiveSummary;
    metrics: ExecutiveMetrics;
    trends: ExecutiveTrends | null;
    actionItems: string[];
    metadata: ReportMetadata;
}

export interface ExecutiveSummary {
    overallScore: number;
    classification: string;
    keyFindings: string[];
    criticalIssues: CriticalIssue[];
    topRecommendations: Recommendation[];
}

export interface ExecutiveMetrics {
    totalSessions: number;
    userSatisfaction: number;
    [key: string]: any;
}

export interface ExecutiveTrends {
    [key: string]: any;
}

export interface CriticalIssue {
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    impact: string;
}

export interface TechnicalReport {
    title: string;
    analysisDetails: AnalysisResult;
    technicalFindings: TechnicalFinding[];
    metadata: ReportMetadata;
}

export interface TechnicalFinding {
    category: string;
    findings: string[];
    recommendations: string[];
}

export interface ComprehensiveReport {
    title: string;
    executive: ExecutiveSummary;
    technical: TechnicalReport;
    fullAnalysis: AnalysisResult;
    metadata: ReportMetadata;
}

export class HelpReportGenerator {
    private analyzer: HelpEffectivenessAnalyzer;
    private config: GeneratorConfig;
    private reportCache: Map<string, any>;

    constructor(analyzer: HelpEffectivenessAnalyzer) {
        this.analyzer = analyzer;
        this.config = {
            reportCacheTimeout: 30 * 60 * 1000, // 30分
            maxCacheSize: 50,
            defaultFormat: 'json'
        };
        this.reportCache = new Map();
    }

    /**
     * エグゼクティブレポートを生成
     * @param options - 生成オプション
     * @returns エグゼクティブレポート
     */
    async generateExecutiveReport(options: any = {}): Promise<ExecutiveReport> {
        try {
            const analysis = await this.analyzer.analyzeEffectiveness(options);
            
            const report: ExecutiveReport = {
                title: 'ヘルプシステム効果測定レポート（エグゼクティブサマリー）',
                summary: this.generateExecutiveSummary(analysis),
                metrics: this.extractExecutiveMetrics(analysis),
                trends: this.generateExecutiveTrends(analysis.trends),
                actionItems: this.generateActionItems(analysis.recommendations),
                metadata: this.createReportMetadata('executive', analysis)
            };

            this.cacheReport(report, options);
            return report;
        } catch (error) {
            this.analyzer.loggingSystem.error('HelpReportGenerator', 'Executive report generation failed', error);
            throw error;
        }
    }

    /**
     * テクニカルレポートを生成
     * @param options - 生成オプション
     * @returns テクニカルレポート
     */
    async generateTechnicalReport(options: any = {}): Promise<TechnicalReport> {
        try {
            const analysis = await this.analyzer.analyzeEffectiveness(options);
            
            const report: TechnicalReport = {
                title: 'ヘルプシステム効果測定レポート（技術詳細）',
                analysisDetails: analysis,
                technicalFindings: this.generateTechnicalFindings(analysis),
                metadata: this.createReportMetadata('technical', analysis)
            };

            this.cacheReport(report, options);
            return report;
        } catch (error) {
            this.analyzer.loggingSystem.error('HelpReportGenerator', 'Technical report generation failed', error);
            throw error;
        }
    }

    /**
     * 包括的レポートを生成
     * @param options - 生成オプション
     * @returns 包括的レポート
     */
    async generateComprehensiveReport(options: any = {}): Promise<ComprehensiveReport> {
        try {
            const analysis = await this.analyzer.analyzeEffectiveness(options);
            
            const report: ComprehensiveReport = {
                title: 'ヘルプシステム効果測定レポート（包括版）',
                executive: this.generateExecutiveSummary(analysis),
                technical: await this.generateTechnicalReport(options),
                fullAnalysis: analysis,
                metadata: this.createReportMetadata('comprehensive', analysis)
            };

            this.cacheReport(report, options);
            return report;
        } catch (error) {
            this.analyzer.loggingSystem.error('HelpReportGenerator', 'Comprehensive report generation failed', error);
            throw error;
        }
    }

    /**
     * レポートをエクスポート
     * @param report - エクスポートするレポート
     * @param format - フォーマット（'json', 'csv', 'html'）
     * @returns エクスポートされたデータ
     */
    exportReport(report: any, format: string = 'json'): string {
        try {
            switch (format.toLowerCase()) {
                case 'json':
                    return JSON.stringify(report, null, 2);
                case 'csv':
                    return this.convertToCSV(report);
                case 'html':
                    return this.convertToHTML(report);
                default:
                    this.analyzer.loggingSystem.warn('HelpReportGenerator', `Unknown export format: ${format}, using JSON`);
                    return JSON.stringify(report, null, 2);
            }
        } catch (error) {
            this.analyzer.loggingSystem.error('HelpReportGenerator', 'Report export failed', error);
            throw error;
        }
    }

    /**
     * エグゼクティブサマリーを生成
     * @param analysis - 分析結果
     * @returns エグゼクティブサマリー
     */
    private generateExecutiveSummary(analysis: AnalysisResult): ExecutiveSummary {
        const classification = analysis.detailedAnalysis.effectiveness.classification;
        
        return {
            overallScore: analysis.overallEffectivenessScore,
            classification: classification,
            keyFindings: this.extractKeyFindings(analysis),
            criticalIssues: this.identifyCriticalIssues(analysis),
            topRecommendations: analysis.recommendations.slice(0, 3)
        };
    }

    /**
     * エグゼクティブメトリクスを抽出
     * @param analysis - 分析結果
     * @returns エグゼクティブメトリクス
     */
    private extractExecutiveMetrics(analysis: AnalysisResult): ExecutiveMetrics {
        return {
            totalSessions: analysis.keyMetrics.usage.totalSessions,
            userSatisfaction: analysis.keyMetrics.satisfaction.averageRating,
            interactionRate: analysis.keyMetrics.engagement.interactionRate
        };
    }

    /**
     * エグゼクティブトレンドを生成
     * @param trends - トレンド分析
     * @returns エグゼクティブトレンド
     */
    private generateExecutiveTrends(trends?: TrendAnalysis): ExecutiveTrends | null {
        if (!trends) return null;
        
        return {
            sessionGrowth: trends.usage.sessionGrowth?.trend || 'stable',
            satisfactionTrend: trends.satisfaction.ratingTrend?.trend || 'stable'
        };
    }

    /**
     * アクションアイテムを生成
     * @param recommendations - 推奨事項
     * @returns アクションアイテム
     */
    private generateActionItems(recommendations: Recommendation[]): string[] {
        return recommendations
            .filter(rec => rec.priority === 'high')
            .map(rec => rec.title)
            .slice(0, 5);
    }

    /**
     * テクニカル発見事項を生成
     * @param analysis - 分析結果
     * @returns テクニカル発見事項
     */
    private generateTechnicalFindings(analysis: AnalysisResult): TechnicalFinding[] {
        const findings: TechnicalFinding[] = [];
        
        // 使用状況の発見事項
        findings.push({
            category: '使用状況',
            findings: analysis.detailedAnalysis.usage.insights.map(i => i.message),
            recommendations: analysis.recommendations
                .filter(r => r.title.includes('使用') || r.title.includes('利用'))
                .map(r => r.description)
        });
        
        // エンゲージメントの発見事項
        findings.push({
            category: 'エンゲージメント',
            findings: analysis.detailedAnalysis.engagement.insights.map(i => i.message),
            recommendations: analysis.recommendations
                .filter(r => r.title.includes('エンゲージ') || r.title.includes('参加'))
                .map(r => r.description)
        });
        
        // 満足度の発見事項
        findings.push({
            category: '満足度',
            findings: analysis.detailedAnalysis.satisfaction.insights.map(i => i.message),
            recommendations: analysis.recommendations
                .filter(r => r.title.includes('満足') || r.title.includes('評価'))
                .map(r => r.description)
        });
        
        return findings;
    }

    /**
     * 重要な発見事項を抽出
     * @param analysis - 分析結果
     * @returns 重要な発見事項
     */
    private extractKeyFindings(analysis: AnalysisResult): string[] {
        const findings: string[] = [];
        
        // 全体効果スコアに基づく発見
        if (analysis.overallEffectivenessScore >= 80) {
            findings.push('ヘルプシステムは高い効果を示しています');
        } else if (analysis.overallEffectivenessScore >= 60) {
            findings.push('ヘルプシステムは中程度の効果を示しています');
        } else {
            findings.push('ヘルプシステムの効果に改善の余地があります');
        }
        
        // 使用状況の発見
        const highUsageInsights = analysis.detailedAnalysis.usage.insights
            .filter(i => i.severity === 'high');
        if (highUsageInsights.length > 0) {
            findings.push(highUsageInsights[0].message);
        }
        
        // エンゲージメントの発見
        const highEngagementInsights = analysis.detailedAnalysis.engagement.insights
            .filter(i => i.severity === 'high');
        if (highEngagementInsights.length > 0) {
            findings.push(highEngagementInsights[0].message);
        }
        
        return findings.slice(0, 5);
    }

    /**
     * 重要な問題を特定
     * @param analysis - 分析結果
     * @returns 重要な問題
     */
    private identifyCriticalIssues(analysis: AnalysisResult): CriticalIssue[] {
        const issues: CriticalIssue[] = [];
        
        // 高重要度のインサイトから問題を特定
        const allInsights = [
            ...analysis.detailedAnalysis.usage.insights,
            ...analysis.detailedAnalysis.engagement.insights,
            ...analysis.detailedAnalysis.satisfaction.insights
        ];
        
        const criticalInsights = allInsights.filter(i => i.severity === 'high');
        
        criticalInsights.forEach(insight => {
            issues.push({
                issue: insight.message,
                severity: 'high',
                impact: insight.type === 'usage' ? '利用率への影響' : 
                       insight.type === 'engagement' ? 'エンゲージメントへの影響' :
                       '満足度への影響'
            });
        });
        
        return issues.slice(0, 3);
    }

    /**
     * レポートメタデータを作成
     * @param reportType - レポートタイプ
     * @param analysis - 分析結果
     * @returns レポートメタデータ
     */
    private createReportMetadata(reportType: string, analysis: AnalysisResult): ReportMetadata {
        return {
            reportType: reportType,
            generatedAt: Date.now(),
            confidenceLevel: analysis.metadata.confidenceLevel,
            analysisOptions: analysis.metadata.analysisOptions,
            dataVolume: analysis.metadata.dataVolume,
            reportVersion: '1.0.0'
        };
    }

    /**
     * レポートをキャッシュ
     * @param report - レポート
     * @param options - オプション
     */
    private cacheReport(report: any, options: any): void {
        try {
            const cacheKey = this.generateCacheKey(options);
            
            // キャッシュサイズ制限
            if (this.reportCache.size >= this.config.maxCacheSize) {
                const firstKey = this.reportCache.keys().next().value;
                this.reportCache.delete(firstKey);
            }
            
            this.reportCache.set(cacheKey, {
                report: report,
                timestamp: Date.now()
            });
            
            this.analyzer.loggingSystem.info('HelpReportGenerator', `Report cached with key: ${cacheKey}`);
        } catch (error) {
            this.analyzer.loggingSystem.error('HelpReportGenerator', 'Report caching failed', error);
        }
    }

    /**
     * キャッシュキーを生成
     * @param options - オプション
     * @returns キャッシュキー
     */
    private generateCacheKey(options: any): string {
        return `report_${JSON.stringify(options)}_${Date.now()}`;
    }

    /**
     * CSVフォーマットに変換
     * @param report - レポート
     * @returns CSV文字列
     */
    private convertToCSV(report: any): string {
        // 簡易的なCSV変換実装
        const rows: string[] = [];
        rows.push('Item,Value');
        
        if (report.summary) {
            rows.push(`Overall Score,${report.summary.overallScore || 'N/A'}`);
            rows.push(`Classification,${report.summary.classification || 'N/A'}`);
        }
        
        if (report.metrics) {
            Object.entries(report.metrics).forEach(([key, value]) => {
                rows.push(`${key},${value}`);
            });
        }
        
        return rows.join('\n');
    }

    /**
     * HTMLフォーマットに変換
     * @param report - レポート
     * @returns HTML文字列
     */
    private convertToHTML(report: any): string {
        let html = '<html><head><title>Help System Report</title></head><body>';
        html += `<h1>${report.title || 'Help System Report'}</h1>`;
        
        if (report.summary) {
            html += '<h2>Summary</h2>';
            html += `<p>Overall Score: ${report.summary.overallScore || 'N/A'}</p>`;
            html += `<p>Classification: ${report.summary.classification || 'N/A'}</p>`;
        }
        
        if (report.metrics) {
            html += '<h2>Metrics</h2>';
            html += '<ul>';
            Object.entries(report.metrics).forEach(([key, value]) => {
                html += `<li>${key}: ${value}</li>`;
            });
            html += '</ul>';
        }
        
        html += '</body></html>';
        return html;
    }

    /**
     * キャッシュをクリア
     */
    clearCache(): void {
        this.reportCache.clear();
        this.analyzer.loggingSystem.info('HelpReportGenerator', 'Report cache cleared');
    }
}

export default HelpReportGenerator;