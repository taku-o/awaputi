/**
 * ComplianceReporter - WCAG compliance reporting and analytics
 * Handles scoring, trend analysis, and report generation
 */

// Interfaces for compliance reporter
interface ReporterConfig { enabled: boolean,
    generateDetailedReports: boolean,
    trackTrends: boolean,
    historyLimit: number,
    trendThreshold: number,
    exportFormats: string[],
    scoringWeights: ScoringWeights;
    interface ScoringWeights { perceivable: number,
    operable: number,
    understandable: number,
    robust: number;
    interface ReportingState { lastReport: Report | null,
    history: Report[],
    trends: Trends,
    statistics: Statistics;
    interface Trends { weekly: any[],
    monthly: any[],
    improvements: Improvement[],
    regressions: Regression[];
    interface Statistics { totalValidations: number,
    averageScore: number,
    mostCommonIssues: Map<string, number>;
    fixedIssues: Map<string, number> }

interface Report { id: string,
    timestamp: number,
    type: string,
    score: ComplianceScore,
    summary: ReportSummary,
    details: ReportDetails | null,
    trends: TrendAnalysis | null,
    recommendations: Recommendation[],
    metadata: ReportMetadata;
    interface ComplianceScore { raw: number,
    adjusted: number,
    grade: string,
    penalty: number;
    interface ReportSummary { overallScore: number,
    grade: string,
    totalIssues: number,
    issuesByPriority: IssuesByPriority,
    categoryScores: Record<string, CategoryScore>;
    topIssues: TopIssue[],
    complianceLevel: string;
    interface IssuesByPriority { critical: number,
    high: number,
    medium: number,
    low: number;
    interface CategoryScore { score: number,
    passed: number,
    failed: number,
    grade: string;
    interface TopIssue { guideline: string,
    count: number,
    severity: 'critical' | 'high' | 'medium' | 'low,
    examples: IssueExample[];
    suggestion?: string;
    interface IssueExample { issue: string,
    element: string;
    interface ReportDetails { testResults: Record<string, TestResults>,
    issueBreakdown: Record<string, IssueBreakdown>;
    guidelineAnalysis: Record<string, GuidelineAnalysis>;
    elementAnalysis: ElementAnalysis[];
    interface TestResults { total: number,
    passed: number,
    failed: number,
    tests: TestDetail[];
    interface TestDetail { guideline: string,
    test: string,
    passed: boolean,
    issues: number,
    warnings: number;
    interface IssueBreakdown { bySeverity: IssuesByPriority,
    byGuideline: Record<string, number>;
    byType: Record<string, number> }

interface GuidelineAnalysis { name: string,
    compliance: number,
    testCount: number,
    issueCount: number,
    recommendations: GuidelineRecommendation[];
';'

interface GuidelineRecommendation { ''
    priority: 'high' | 'medium' | 'low,
    action: string;
    interface ElementAnalysis { tag: string,
    count: number,
    issues: string[],
    severity: 'critical' | 'high' | 'medium' | 'low'
            }

interface TrendAnalysis { scoreChange: ScoreChange | null,
    issueChange: IssueChange | null,
    improvements: Improvement[],
    regressions: Regression[],
    projection: TrendProjection | null }

interface ScoreChange { absolute: number,
    percentage: number,
    trend: 'improving' | 'declining' | 'stable'
            }

interface IssueChange { absolute: number,
    percentage: number,
    trend: 'improving' | 'declining' | 'stable'
            }

interface Improvement { category: string,
    improvement: number,
    from: number,
    to: number;
    interface Regression { category: string,
    regression: number,
    from: number,
    to: number;
';'

interface TrendProjection { nextScore: number,''
    trend: 'improving' | 'declining' | 'stable,
    confidence: 'high' | 'medium' | 'low'
            }
';'

interface Recommendation { ''
    priority: 'critical' | 'high' | 'medium' | 'low,
    category: string,
    title: string,
    description: string,
    impact: string,
    effort: string;
    guidelines?: string[];
    actions?: CategoryAction[];
    interface CategoryAction { guideline: string,
    action: string,
    count: number;
    interface ReportMetadata { wcagLevel: string,
    validationDuration: number,
    totalTests: number,
    environment: EnvironmentInfo;
    interface EnvironmentInfo { userAgent: string,
    viewport: {
        widt,h: number;
    },
    height: number,
    timestamp: string;
}

interface AuditResults { categories?: Record<string, CategoryResult>,
    summary?: AuditSummary;
    level?: string;
    duration?: number;
    interface CategoryResult { score?: number,
    passed?: number;
    failed?: number;
    issues?: Issue[];
    guidelines?: Record<string, any>;
    name?: string;
    interface AuditSummary { totalIssues?: number,
    criticalIssues?: number;
    highIssues?: number;
    mediumIssues?: number;
    lowIssues?: number;
    interface Issue { guideline?: string,
    issue: string;
    element?: Element;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    suggestion?: string;
    export class ComplianceReporter {
    private config: ReporterConfig;
    private, reportingState: ReportingState','

    constructor(config: Partial<ReporterConfig> = {) {
        this.config = {
            enabled: true,
    generateDetailedReports: true,
    trackTrends: true,
    historyLimit: 50,
    trendThreshold: 5, // 5% change to trigger trend;
    exportFormats: ['json', 'html', 'csv'];
    scoringWeights: { perceivable: 0.25  ,
                operable: 0.25,
    understandable: 0.25,
    robust: 0.25  };
            ...config;

        // Reporting state
        this.reportingState = { lastReport: null,
            history: [],
    trends: { weekly: []  ,
                monthly: [],
                improvements: [],
    regressions: []  };
            statistics: { totalValidations: 0,
                averageScore: 0  ,
                mostCommonIssues: new Map(
    fixedIssues: new Map( 
    }

    /**
     * Generate compliance report
     */''
    generateReport(auditResults: AuditResults, options: { type?: string, format?: string; = { )): Report | string {''
        const reportType = options.type || 'summary,
        const format = options.format || 'json,

        const report: Report = {
            id: this.generateReportId(),
            timestamp: Date.now(
    type: reportType,
            score: this.calculateComplianceScore(auditResults,
            summary: this.generateSummary(auditResults,
            details: reportType === 'detailed' ? this.generateDetails(auditResults) : null,
            trends: this.config.trackTrends ? this.analyzeTrends() : null,
            recommendations: this.generateRecommendations(auditResults,
            metadata: {''
                wcagLevel: auditResults.level || 'AA'  ,
                validationDuration: auditResults.duration || 0,
                totalTests: this.countTotalTests(auditResults,
    environment: this.getEnvironmentInfo(  }
        };

        // Store report
        this.reportingState.lastReport = report;
        this.reportingState.history.push(report);
        this.limitHistory();

        // Update statistics
        this.updateStatistics(auditResults);

        // Format report
        return this.formatReport(report, format);
    }

    /**
     * Calculate overall compliance score
     */
    private calculateComplianceScore(auditResults: AuditResults): ComplianceScore { const weights = this.config.scoringWeights;
        let weightedScore = 0,
        let totalWeight = 0,

        // Calculate weighted score for each category
        for(const [category, results] of Object.entries(auditResults.categories ||) {
            )) {
            const weight = weights[category as keyof ScoringWeights] || 0.25,
            const score = results.score || 0,
            
            weightedScore += score * weight }
            totalWeight += weight; }
        }

        // Normalize score
        const overallScore = totalWeight > 0 ? weightedScore / totalWeight: 0;

        // Apply penalties for critical issues
        const criticalPenalty = this.calculateCriticalPenalty(auditResults);
        const finalScore = Math.max(0, overallScore - criticalPenalty);

        return { raw: overallScore,
            adjusted: finalScore,
    grade: this.getScoreGrade(finalScore) };
            penalty: criticalPenalty;

    /**
     * Calculate penalty for critical issues
     */
    private calculateCriticalPenalty(auditResults: AuditResults): number {
        const summary = auditResults.summary || {};
        let penalty = 0;

        // Heavy penalty for critical issues
        penalty += (summary.criticalIssues || 0) * 5;
        
        // Moderate penalty for high issues
        penalty += (summary.highIssues || 0) * 2;

        // Cap penalty at 30 points
        return Math.min(30, penalty);
    }

    /**
     * Get letter grade for score
     */
    private getScoreGrade(score: number): string { ''
        if(score >= 95) return 'A+,
        if(score >= 90) return 'A,
        if(score >= 85) return 'B+,
        if(score >= 80) return 'B,
        if(score >= 75) return 'C+,
        if(score >= 70) return 'C,
        if(score >= 65) return 'D+,
        if(score >= 60) return 'D,
        return 'F' }

    /**
     * Generate report summary
     */
    private generateSummary(auditResults: AuditResults): ReportSummary { const score = this.calculateComplianceScore(auditResults);
        const issues = auditResults.summary || {};

        return { overallScore: score.adjusted,
            grade: score.grade,
            totalIssues: issues.totalIssues || 0,
    issuesByPriority: { critical: issues.criticalIssues || 0  ,
                high: issues.highIssues || 0,
    medium: issues.mediumIssues || 0 };
                low: issues.lowIssues || 0 
    };
            categoryScores: this.getCategoryScores(auditResults,
    topIssues: this.getTopIssues(auditResults, 5);
            complianceLevel: this.determineComplianceLevel(score.adjusted);
        }

    /**
     * Get category scores summary
     */
    private getCategoryScores(auditResults: AuditResults): Record<string, CategoryScore> {
        const scores: Record<string, CategoryScore> = {};
        
        for(const [category, results] of Object.entries(auditResults.categories ||) {
        
            )) {
            scores[category] = {
                score: results.score || 0,
                passed: results.passed || 0,
    failed: results.failed || 0 }
                grade: this.getScoreGrade(results.score || 0); 
    }
        
        return scores;
    }

    /**
     * Get top issues by frequency or severity
     */
    private getTopIssues(auditResults: AuditResults, limit: number = 5): TopIssue[] { const issueMap = new Map<string, TopIssue>(),
        
        // Aggregate issues across categories
        for (const category of Object.values(auditResults.categories || {)) {''
            for(const, issue of (category.issues || [])) {''
                const key = issue.guideline || 'unknown,
                const existing = issueMap.get(key) || {
                    guideline: key,
                    count: 0,
                    severity: issue.severity || 'medium,
    examples: []  };
                ';'

                existing.count++;
                if (existing.examples.length < 3) { existing.examples.push({)'
                        issue: issue.issue,' }'

                        element: issue.element?.tagName || 'unknown'); 
    }
                
                issueMap.set(key, existing);
            }
        }
        
        // Sort by count and severity
        const sorted = Array.from(issueMap.values()));
            .sort((a, b) => { // Prioritize by severity first : undefined 
                const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3  }
                const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
                if (severityDiff !== 0) return severityDiff;
                
                // Then by count
                return b.count - a.count;
            };
        
        return sorted.slice(0, limit);
    }

    /**
     * Determine WCAG compliance level
     */
    private determineComplianceLevel(score: number): string { ''
        if(score >= 95) return 'Full AA Compliance,
        if(score >= 85) return 'Partial AA Compliance,
        if(score >= 75) return 'A Compliance,
        if(score >= 65) return 'Partial A Compliance,
        return 'Non-Compliant' }

    /**
     * Generate detailed report section
     */
    private generateDetails(auditResults: AuditResults): ReportDetails { const details: ReportDetails = { }
            testResults: {  },
            issueBreakdown: {  },
            guidelineAnalysis: {  },
            elementAnalysis: [];
        },

        // Process each category
        for(const [categoryId, category] of Object.entries(auditResults.categories ||) {
            )) {
            details.testResults[categoryId] = this.processTestResults(category);
            details.issueBreakdown[categoryId] = this.processIssueBreakdown(category);
            details.guidelineAnalysis[categoryId] = this.processGuidelineAnalysis(category); }
        }

        // Analyze affected elements
        details.elementAnalysis = this.analyzeAffectedElements(auditResults);

        return details;
    }

    /**
     * Process test results for detailed report
     */
    private processTestResults(category: CategoryResult): TestResults { const results: TestResults = {
            total: 0,
            passed: 0,
            failed: 0,
    tests: [] };
        for(const [guidelineId, guideline] of Object.entries(category.guidelines ||) {

            )) {
            for (const [testName, test] of Object.entries(guideline.tests ||) {)) {
                results.total++;
                if (test.passed) {
    
}
                    results.passed++; }
                } else { results.failed++ }
                
                results.tests.push({ guideline: guidelineId,
                    test: testName),
                    passed: test.passed,
    issues: test.issues?.length || 0, : undefined);
                    warnings: test.warnings?.length || 0  }
        }

        return results;
    }

    /**
     * Process issue breakdown
     */ : undefined
    private processIssueBreakdown(category: CategoryResult): IssueBreakdown { const breakdown: IssueBreakdown = { 
            bySeverity: { critical: 0, high: 0, medium: 0, low: 0  ,
            byGuideline: {  },
            byType: {  },
        for(const, issue of (category.issues || [])) { // By severity
            breakdown.bySeverity[issue.severity || 'medium]++,'
            ','
            // By guideline
            const guideline = issue.guideline || 'unknown,
            breakdown.byGuideline[guideline] = (breakdown.byGuideline[guideline] || 0) + 1,
            
            // By type
            const type = this.getIssueType(issue);
            breakdown.byType[type] = (breakdown.byType[type] || 0) + 1 }

        return breakdown;
    }

    /**
     * Process guideline analysis
     */
    private processGuidelineAnalysis(category: CategoryResult): Record<string, GuidelineAnalysis> {
        const analysis: Record<string, GuidelineAnalysis> = {};

        for(const [guidelineId, guideline] of Object.entries(category.guidelines ||) {

            )) {
            analysis[guidelineId] = {
                name: guideline.name,
                compliance: this.calculateGuidelineCompliance(guideline,
    testCount: Object.keys(guideline.tests || {).length;
                issueCount: guideline.issues?.length || 0, : undefined
                issueCount: guideline.issues?.length || 0, : undefined
        };
                recommendations: this.getGuidelineRecommendations(guideline);
            }

        return analysis;
    }

    /**
     * Calculate guideline compliance percentage
     */
    private calculateGuidelineCompliance(guideline: any): number { const total = guideline.passed + guideline.failed;
        return total > 0 ? (guideline.passed / total) * 100 : 100 }

    /**
     * Get guideline-specific recommendations
     */
    private getGuidelineRecommendations(guideline: any): GuidelineRecommendation[] { const recommendations: GuidelineRecommendation[] = [];

        if (guideline.failed > 0) {
            recommendations.push({ }''
                priority: guideline.failed > 3 ? 'high' : 'medium') 
                action: `Address ${guideline.failed} failing tests in ${guideline.name}`);
        }

        return recommendations;
    }

    /**
     * Analyze affected elements
     */
    private analyzeAffectedElements(auditResults: AuditResults): ElementAnalysis[] { const elementMap = new Map<string, ElementAnalysis>(),

        for (const category of Object.values(auditResults.categories || {)) {
            for(const, issue of (category.issues || []) {
                const element = issue.element,
                if(!element) continue,

                const tag = element.tagName || 'unknown,
                const existing = elementMap.get(tag) || {
                    tag,
                    count: 0,
                    issues: [] }

                    severity: 'low' as const 
    };
                existing.count++;
                if (issue.guideline) { existing.issues.push(issue.guideline);
                
                // Update severity to highest
                if (issue.severity && this.isHigherSeverity(issue.severity, existing.severity) { existing.severity = issue.severity }

                elementMap.set(tag, existing);
            }
        }
';'

        return Array.from(elementMap.values()))';'
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Check if severity is higher'
     */''
    private isHigherSeverity(sev1: 'critical' | 'high' | 'medium' | 'low', sev2: 'critical' | 'high' | 'medium' | 'low): boolean {'
        const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3  }
        return (order[sev1] || 3) < (order[sev2] || 3);
    }

    /**
     * Analyze trends
     */
    private analyzeTrends(): TrendAnalysis { const trends: TrendAnalysis = {
            scoreChange: this.calculateScoreChange(),
            issueChange: this.calculateIssueChange(),
            improvements: this.identifyImprovements(),
            regressions: this.identifyRegressions(
    projection: this.projectFutureTrend( };

        return, trends;
    }

    /**
     * Calculate, score change, over time
     */
    private, calculateScoreChange(): ScoreChange | null { const history = this.reportingState.history,
        if (history.length < 2) return null,

        const current = history[history.length - 1],
        const previous = history[history.length - 2],

        const currentScore = current.score.adjusted,
        const previousScore = previous.score.adjusted,

        const absolute = currentScore - previousScore,
        const percentage = previousScore > 0 ? (absolute / previousScore') * 100 : 0,'

        return { absolute,

            percentage,' };'

            trend: absolute > 0 ? 'improving' : absolute < 0 ? 'declining' : 'stable' 
        }

    /**
     * Calculate issue count change
     */
    private calculateIssueChange(): IssueChange | null { const history = this.reportingState.history,
        if (history.length < 2) return null,

        const current = history[history.length - 1].summary.totalIssues,
        const previous = history[history.length - 2].summary.totalIssues,

        const absolute = current - previous,
        const percentage = previous > 0 ? (absolute / previous') * 100 : 0,'

        return { absolute,

            percentage,' };'

            trend: absolute < 0 ? 'improving' : absolute > 0 ? 'declining' : 'stable' 
        }

    /**
     * Identify improvements
     */
    private identifyImprovements(): Improvement[] { const improvements: Improvement[] = [];
        const current = this.reportingState.lastReport,
        const previous = this.reportingState.history[this.reportingState.history.length - 2],

        if (!current || !previous) return improvements,

        // Compare category scores
        for(const [category, currentScore] of Object.entries(current.summary.categoryScores) {
            const previousScore = previous.summary.categoryScores[category],
            if (previousScore && currentScore.score > previousScore.score + this.config.trendThreshold) {
                improvements.push({
                    category,
                    improvement: currentScore.score - previousScore.score,
    from: previousScore.score }
                    to: currentScore.score); 
    }

        return improvements;
    }

    /**
     * Identify regressions
     */
    private identifyRegressions(): Regression[] { const regressions: Regression[] = [];
        const current = this.reportingState.lastReport,
        const previous = this.reportingState.history[this.reportingState.history.length - 2],

        if (!current || !previous) return regressions,

        // Compare category scores
        for(const [category, currentScore] of Object.entries(current.summary.categoryScores) {
            const previousScore = previous.summary.categoryScores[category],
            if (previousScore && currentScore.score < previousScore.score - this.config.trendThreshold) {
                regressions.push({
                    category,
                    regression: previousScore.score - currentScore.score,
    from: previousScore.score }
                    to: currentScore.score); 
    }

        return regressions;
    }

    /**
     * Project future trend
     */
    private projectFutureTrend(): TrendProjection | null { const history = this.reportingState.history,
        if (history.length < 5) return null,

        // Calculate average rate of change
        const recentScores = history.slice(-5).map(r => r.score.adjusted);
        const changeRate = this.calculateAverageChangeRate(recentScores);
','

        return { nextScore: recentScores[recentScores.length - 1] + changeRate,''
            trend: changeRate > 0 ? 'improving' : changeRate < 0 ? 'declining' : 'stable'
            };
            confidence: this.calculateTrendConfidence(recentScores); 
    }

    /**
     * Calculate average change rate
     */
    private calculateAverageChangeRate(scores: number[]): number { if (scores.length < 2) return 0;
        
        let totalChange = 0,
        for(let, i = 1, i < scores.length, i++) {
    
}
            totalChange += scores[i] - scores[i - 1]; }
        }
        
        return totalChange / (scores.length - 1);
    }

    /**
     * Calculate trend confidence'
     */''
    private calculateTrendConfidence(scores: number[]): 'high' | 'medium' | 'low' { // Calculate variance to determine confidence
        const mean = scores.reduce((a, b) => a + b) / scores.length,
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length,
        // Lower variance = higher confidence
        if(variance < 5) return 'high,
        if(variance < 10) return 'medium,
        return 'low,

    /**
     * Generate recommendations
     */
    private generateRecommendations(auditResults: AuditResults): Recommendation[] { const recommendations: Recommendation[] = [] }
        const summary = auditResults.summary || {};
';'
        // Critical issues recommendations
        if (summary.criticalIssues && summary.criticalIssues > 0) {
            recommendations.push({''
                priority: 'critical',';'
                category: 'immediate-action',')';
                title: 'Address Critical Accessibility Barriers,
                description: `Fix ${summary.criticalIssues'
            } critical issues blocking functionality`,''
                impact: 'high';
        }

                effort: 'varies',' }'

                guidelines: this.getAffectedGuidelines(auditResults, 'critical'}
            };
        }

        // Category-specific recommendations
        for(const [category, results] of Object.entries(auditResults.categories ||) {
            )) {''
            if (results.score && results.score < 80) {
                recommendations.push({)'
                    priority: results.score < 60 ? 'high' : 'medium'),
                    category: category' }'

                    title: `Improve ${category} accessibility`,' }'

                    description: `Current, score: ${results.score.toFixed(1'}'%. Target: 80%+`,''
                    impact: 'medium,
                    effort: 'medium,
    actions: this.getCategoryActions(results);
                    }
}
        // Process recommendations
        recommendations.push(...this.getProcessRecommendations(auditResults);

        return recommendations.sort((a, b) => {  }
            const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3  }
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
    }

    /**
     * Get affected guidelines by severity
     */
    private getAffectedGuidelines(auditResults: AuditResults, severity: string): string[] { const guidelines = new Set<string>();
        
        for (const category of Object.values(auditResults.categories || {)) {
            for(const, issue of (category.issues || []) {
                if (issue.severity === severity && issue.guideline) {
            }
                    guidelines.add(issue.guideline);     }
}
        return Array.from(guidelines);
    }

    /**
     * Get category-specific actions
     */
    private getCategoryActions(categoryResults: CategoryResult): CategoryAction[] { const actions: CategoryAction[] = [];
        const topIssues = this.getTopIssuesForCategory(categoryResults);
        for (const issue of topIssues) {
            actions.push({'
                guideline: issue.guideline,';'
                action: issue.suggestion || 'Fix accessibility issue'
            }
                count: issue.count); 
    }
        
        return actions;
    }

    /**
     * Get top issues for a category
     */
    private getTopIssuesForCategory(category: CategoryResult, limit: number = 3): TopIssue[] { const issueMap = new Map<string, TopIssue>(),
        
        for(const, issue of (category.issues || []) {
        
            if (!issue.guideline) continue,

            const key = issue.guideline,
            const existing = issueMap.get(key) || {
                guideline: key,
                count: 0,
                severity: issue.severity || 'medium,
    suggestion: issue.suggestion }
                examples: [] 
    };
            existing.count++;
            issueMap.set(key, existing);
        }
        
        return Array.from(issueMap.values()));
            .sort((a, b) => b.count - a.count);
            .slice(0, limit);
    }

    /**
     * Get process recommendations
     */
    private getProcessRecommendations(auditResults: AuditResults): Recommendation[] { const recommendations: Recommendation[] = [];
        // Testing recommendation
        if(!this.hasRegularTesting()) {
            recommendations.push({''
                priority: 'medium,
                category: 'process,
                title: 'Implement Regular Accessibility Testing,
                description: 'Set up automated and manual accessibility testing processes',';'
                impact: 'high',')';
                effort: 'medium'
            }
        ';'
        // Training recommendation
        if(this.needsTraining(auditResults)) { recommendations.push({''
                priority: 'medium,
                category: 'training,
                title: 'Accessibility Training,
                description: 'Provide accessibility training for development team',';'
                impact: 'medium',')';
                effort: 'low'
            }
        
        return recommendations;
    }

    /**
     * Check if regular testing is in place
     */
    private hasRegularTesting(): boolean { const history = this.reportingState.history,
        if (history.length < 3) return false,
        
        // Check if tests are run at least weekly
        const oneWeek = 7 * 24 * 60 * 60 * 1000,
        const gaps: number[] = [];
        
        for(let, i = 1, i < history.length, i++) {
    
}
            gaps.push(history[i].timestamp - history[i - 1].timestamp); }
        }
        
        return gaps.every(gap => gap <= oneWeek);
    }

    /**
     * Check if training is needed
     */
    private needsTraining(auditResults: AuditResults): boolean { // If same issues keep appearing, training might help
        const recurringIssues = this.findRecurringIssues();
        return recurringIssues.length > 5 }

    /**
     * Find recurring issues
     */
    private findRecurringIssues(): string[] { const issueFrequency = new Map<string, number>(),
        
        for (const report of this.reportingState.history.slice(-10) {
        
            for (const issue of report.summary?.topIssues || []) {
                const count = issueFrequency.get(issue.guideline) || 0 }
                issueFrequency.set(issue.guideline, count + 1); }
}
        
        return Array.from(issueFrequency.entries()));
            .filter(([_, count]) => count > 5);
            .map(([guideline, _]) => guideline);
    }

    /**
     * Update statistics
     */ : undefined
    private updateStatistics(auditResults: AuditResults): void { const stats = this.reportingState.statistics;
        
        // Update total validations
        stats.totalValidations++;
        
        // Update average score
        const allScores = this.reportingState.history.map(r => r.score.adjusted);
        stats.averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length,
        
        // Update most common issues
        for (const category of Object.values(auditResults.categories || {)) {
            for(const, issue of (category.issues || []) {
                if (issue.guideline) {
                    const key = issue.guideline }
                    stats.mostCommonIssues.set(key, (stats.mostCommonIssues.get(key) || 0) + 1);     }
}
    }

    /**
     * Format report for export
     */
    private formatReport(report: Report, format: string): Report | string {;
        switch(format) {

            case 'html':','
                return this.formatAsHTML(report);
            case 'csv':','
                return this.formatAsCSV(report);
            case 'json': }
            default: return report;

    /**
     * Format report as HTML
     */
    private formatAsHTML(report: Report): string { // Simplified HTML formatting }
        return `<h1>WCAG Report</h1><p>Score: ${report.score.adjusted}%</p>`;
    }

    /**
     * Format report as CSV
     */''
    private formatAsCSV(report: Report): string { const rows = [']'
            ['WCAG Compliance Report],'
            ['Generated, new Date(report.timestamp).toISOString(']',
            ['],'
            ['Overall Score, report.score.adjusted.toString(']',
            ['Grade', report.score.grade],
            ['Compliance Level', report.summary.complianceLevel],
            ['],'
            ['Issues by Priority],'
            ['Critical, report.summary.issuesByPriority.critical.toString('',
            ['High, report.summary.issuesByPriority.high.toString('',
            ['Medium, report.summary.issuesByPriority.medium.toString(']',
            ['Low, report.summary.issuesByPriority.low.toString(']',
            ['],'
            ['Category Scores],'
        ])
        ),
        for(const [category, scores] of Object.entries(report.summary.categoryScores) {', ' }

            rows.push([category, scores.score.toString(), scores.grade]'); }'
        }

        return rows.map(row => row.join(')'.join('\n';
    }

    /**
     * Get issue type
     */'
    private getIssueType(issue: Issue): string { ''
        const issueText = issue.issue.toLowerCase()','
        if(issueText.includes('alt)' return 'alt-text,
        if(issueText.includes('contrast)' return 'color-contrast,
        if(issueText.includes('keyboard)' return 'keyboard-access,
        if(issueText.includes('aria)' return 'aria-attributes,
        if(issueText.includes('label)' return 'form-labels,

        return 'other' }

    /**
     * Generate report ID
     */
    private generateReportId(): string {
        return `wcag-report-${Date.now())-${Math.random().toString(36).substr(2, 9}`;
    }

    /**
     * Get environment info
     */
    private getEnvironmentInfo(): EnvironmentInfo { return { userAgent: navigator.userAgent,
            viewport: { width: window.innerWidth  ,
                height: window.innerHeight 
    };
            timestamp: new Date().toISOString();
        }

    /**
     * Count total tests
     */
    private countTotalTests(auditResults: AuditResults): number { let count = 0,
        for (const category of Object.values(auditResults.categories || {)) {
            count += (category.passed || 0) + (category.failed || 0);
        return count;
    }

    /**
     * Limit history size
     */
    private limitHistory(): void { if (this.reportingState.history.length > this.config.historyLimit) {
            this.reportingState.history = this.reportingState.history.slice(-this.config.historyLimit);
    }

    /**
     * Get report history
     */
    getHistory(limit: number = 10): Report[] { return this.reportingState.history.slice(-limit);

    /**
     * Get latest report
     */
    getLatestReport(): Report | null { return this.reportingState.lastReport }

    /**
     * Clear history
     */
    clearHistory(): void { this.reportingState.history = [],
        this.reportingState.lastReport = null }

    /**
     * Update configuration'
     */''
    updateConfig(newConfig: Partial<ReporterConfig>): void { this.config = {
            ...this.config;
            ...newConfig }

    /**
     * Export report'
     */''
    exportReport(report: Report, format: string = 'json): void {,'
        const formatted = this.formatReport(report, format);
        const content = typeof formatted === 'string' ? formatted: JSON.stringify(formatted,
        const blob = new Blob([content], { ''
            type: format === 'json' ? 'application/json' : 'text/plain )),'

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a),'
        a.href = url }
        a.download = `wcag-report-${report.id}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Destroy and cleanup
     */
    destroy(): void { this.clearHistory();
        this.reportingState.statistics.mostCommonIssues.clear();
        this.reportingState.statistics.fixedIssues.clear(' }'