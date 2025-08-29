/**
 * ComplianceReporter - WCAG compliance reporting and analytics
 * Handles scoring, trend analysis, and report generation
 */
export class ComplianceReporter {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            generateDetailedReports: true,
            trackTrends: true,
            historyLimit: 50,
            trendThreshold: 5, // 5% change to trigger trend
            exportFormats: ['json', 'html', 'csv'],
            scoringWeights: {
                perceivable: 0.25,
                operable: 0.25,
                understandable: 0.25,
                robust: 0.25
            },
            ...config
        };

        // Reporting state
        this.reportingState = {
            lastReport: null,
            history: [],
            trends: {
                weekly: [],
                monthly: [],
                improvements: [],
                regressions: []
            },
            statistics: {
                totalValidations: 0,
                averageScore: 0,
                mostCommonIssues: new Map(),
                fixedIssues: new Map()
            }
        };


    }

    /**
     * Generate compliance report
     */
    generateReport(auditResults, options = {}) {
        const reportType = options.type || 'summary';
        const format = options.format || 'json';

        const report = {
            id: this.generateReportId(),
            timestamp: Date.now(),
            type: reportType,
            score: this.calculateComplianceScore(auditResults),
            summary: this.generateSummary(auditResults),
            details: reportType === 'detailed' ? this.generateDetails(auditResults) : null,
            trends: this.config.trackTrends ? this.analyzeTrends() : null,
            recommendations: this.generateRecommendations(auditResults),
            metadata: {
                wcagLevel: auditResults.level || 'AA',
                validationDuration: auditResults.duration || 0,
                totalTests: this.countTotalTests(auditResults),
                environment: this.getEnvironmentInfo()
            }
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
    calculateComplianceScore(auditResults) {
        const weights = this.config.scoringWeights;
        let weightedScore = 0;
        let totalWeight = 0;

        // Calculate weighted score for each category
        for (const [category, results] of Object.entries(auditResults.categories || {})) {
            const weight = weights[category] || 0.25;
            const score = results.score || 0;
            
            weightedScore += score * weight;
            totalWeight += weight;
        }

        // Normalize score
        const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

        // Apply penalties for critical issues
        const criticalPenalty = this.calculateCriticalPenalty(auditResults);
        const finalScore = Math.max(0, overallScore - criticalPenalty);

        return {
            raw: overallScore,
            adjusted: finalScore,
            grade: this.getScoreGrade(finalScore),
            penalty: criticalPenalty
        };
    }

    /**
     * Calculate penalty for critical issues
     */
    calculateCriticalPenalty(auditResults) {
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
    getScoreGrade(score) {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 75) return 'C+';
        if (score >= 70) return 'C';
        if (score >= 65) return 'D+';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Generate report summary
     */
    generateSummary(auditResults) {
        const score = this.calculateComplianceScore(auditResults);
        const issues = auditResults.summary || {};

        return {
            overallScore: score.adjusted,
            grade: score.grade,
            totalIssues: issues.totalIssues || 0,
            issuesByPriority: {
                critical: issues.criticalIssues || 0,
                high: issues.highIssues || 0,
                medium: issues.mediumIssues || 0,
                low: issues.lowIssues || 0
            },
            categoryScores: this.getCategoryScores(auditResults),
            topIssues: this.getTopIssues(auditResults, 5),
            complianceLevel: this.determineComplianceLevel(score.adjusted)
        };
    }

    /**
     * Get category scores summary
     */
    getCategoryScores(auditResults) {
        const scores = {};
        
        for (const [category, results] of Object.entries(auditResults.categories || {})) {
            scores[category] = {
                score: results.score || 0,
                passed: results.passed || 0,
                failed: results.failed || 0,
                grade: this.getScoreGrade(results.score || 0)
            };
        }
        
        return scores;
    }

    /**
     * Get top issues by frequency or severity
     */
    getTopIssues(auditResults, limit = 5) {
        const issueMap = new Map();
        
        // Aggregate issues across categories
        for (const category of Object.values(auditResults.categories || {})) {
            for (const issue of (category.issues || [])) {
                const key = issue.guideline || 'unknown';
                const existing = issueMap.get(key) || {
                    guideline: key,
                    count: 0,
                    severity: issue.severity,
                    examples: []
                };
                
                existing.count++;
                if (existing.examples.length < 3) {
                    existing.examples.push({
                        issue: issue.issue,
                        element: issue.element?.tagName || 'unknown'
                    });
                }
                
                issueMap.set(key, existing);
            }
        }
        
        // Sort by count and severity
        const sorted = Array.from(issueMap.values())
            .sort((a, b) => {
                // Prioritize by severity first
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
                if (severityDiff !== 0) return severityDiff;
                
                // Then by count
                return b.count - a.count;
            });
        
        return sorted.slice(0, limit);
    }

    /**
     * Determine WCAG compliance level
     */
    determineComplianceLevel(score) {
        if (score >= 95) return 'Full AA Compliance';
        if (score >= 85) return 'Partial AA Compliance';
        if (score >= 75) return 'A Compliance';
        if (score >= 65) return 'Partial A Compliance';
        return 'Non-Compliant';
    }

    /**
     * Generate detailed report section
     */
    generateDetails(auditResults) {
        const details = {
            testResults: {},
            issueBreakdown: {},
            guidelineAnalysis: {},
            elementAnalysis: {}
        };

        // Process each category
        for (const [categoryId, category] of Object.entries(auditResults.categories || {})) {
            details.testResults[categoryId] = this.processTestResults(category);
            details.issueBreakdown[categoryId] = this.processIssueBreakdown(category);
            details.guidelineAnalysis[categoryId] = this.processGuidelineAnalysis(category);
        }

        // Analyze affected elements
        details.elementAnalysis = this.analyzeAffectedElements(auditResults);

        return details;
    }

    /**
     * Process test results for detailed report
     */
    processTestResults(category) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };

        for (const [guidelineId, guideline] of Object.entries(category.guidelines || {})) {
            for (const [testName, test] of Object.entries(guideline.tests || {})) {
                results.total++;
                if (test.passed) {
                    results.passed++;
                } else {
                    results.failed++;
                }
                
                results.tests.push({
                    guideline: guidelineId,
                    test: testName,
                    passed: test.passed,
                    issues: test.issues?.length || 0,
                    warnings: test.warnings?.length || 0
                });
            }
        }

        return results;
    }

    /**
     * Process issue breakdown
     */
    processIssueBreakdown(category) {
        const breakdown = {
            bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
            byGuideline: {},
            byType: {}
        };

        for (const issue of (category.issues || [])) {
            // By severity
            breakdown.bySeverity[issue.severity || 'medium']++;
            
            // By guideline
            const guideline = issue.guideline || 'unknown';
            breakdown.byGuideline[guideline] = (breakdown.byGuideline[guideline] || 0) + 1;
            
            // By type
            const type = this.getIssueType(issue);
            breakdown.byType[type] = (breakdown.byType[type] || 0) + 1;
        }

        return breakdown;
    }

    /**
     * Process guideline analysis
     */
    processGuidelineAnalysis(category) {
        const analysis = {};

        for (const [guidelineId, guideline] of Object.entries(category.guidelines || {})) {
            analysis[guidelineId] = {
                name: guideline.name,
                compliance: this.calculateGuidelineCompliance(guideline),
                testCount: Object.keys(guideline.tests || {}).length,
                issueCount: guideline.issues?.length || 0,
                recommendations: this.getGuidelineRecommendations(guideline)
            };
        }

        return analysis;
    }

    /**
     * Calculate guideline compliance percentage
     */
    calculateGuidelineCompliance(guideline) {
        const total = guideline.passed + guideline.failed;
        return total > 0 ? (guideline.passed / total) * 100 : 100;
    }

    /**
     * Get guideline-specific recommendations
     */
    getGuidelineRecommendations(guideline) {
        const recommendations = [];
        
        if (guideline.failed > 0) {
            recommendations.push({
                priority: guideline.failed > 3 ? 'high' : 'medium',
                action: `Address ${guideline.failed} failing tests in ${guideline.name}`
            });
        }

        return recommendations;
    }

    /**
     * Analyze affected elements
     */
    analyzeAffectedElements(auditResults) {
        const elementMap = new Map();

        for (const category of Object.values(auditResults.categories || {})) {
            for (const issue of (category.issues || [])) {
                const element = issue.element;
                if (!element) continue;

                const tag = element.tagName || 'unknown';
                const existing = elementMap.get(tag) || {
                    tag,
                    count: 0,
                    issues: [],
                    severity: 'low'
                };

                existing.count++;
                existing.issues.push(issue.guideline);
                
                // Update severity to highest
                if (this.isHigherSeverity(issue.severity, existing.severity)) {
                    existing.severity = issue.severity;
                }

                elementMap.set(tag, existing);
            }
        }

        return Array.from(elementMap.values())
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Check if severity is higher
     */
    isHigherSeverity(sev1, sev2) {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[sev1] || 3) < (order[sev2] || 3);
    }

    /**
     * Analyze trends
     */
    analyzeTrends() {
        const trends = {
            scoreChange: this.calculateScoreChange(),
            issueChange: this.calculateIssueChange(),
            improvements: this.identifyImprovements(),
            regressions: this.identifyRegressions(),
            projection: this.projectFutureTrend()
        };

        return trends;
    }

    /**
     * Calculate score change over time
     */
    calculateScoreChange() {
        const history = this.reportingState.history;
        if (history.length < 2) return null;

        const current = history[history.length - 1];
        const previous = history[history.length - 2];

        return {
            absolute: current.score.adjusted - previous.score.adjusted,
            percentage: ((current.score.adjusted - previous.score.adjusted) / previous.score.adjusted) * 100,
            trend: current.score.adjusted > previous.score.adjusted ? 'improving' : 'declining'
        };
    }

    /**
     * Calculate issue count change
     */
    calculateIssueChange() {
        const history = this.reportingState.history;
        if (history.length < 2) return null;

        const current = history[history.length - 1].summary.totalIssues;
        const previous = history[history.length - 2].summary.totalIssues;

        return {
            absolute: current - previous,
            percentage: previous > 0 ? ((current - previous) / previous) * 100 : 0,
            trend: current < previous ? 'improving' : 'declining'
        };
    }

    /**
     * Identify improvements
     */
    identifyImprovements() {
        const improvements = [];
        const current = this.reportingState.lastReport;
        const previous = this.reportingState.history[this.reportingState.history.length - 2];

        if (!current || !previous) return improvements;

        // Compare category scores
        for (const [category, currentScore] of Object.entries(current.summary.categoryScores)) {
            const previousScore = previous.summary.categoryScores[category];
            if (previousScore && currentScore.score > previousScore.score + this.config.trendThreshold) {
                improvements.push({
                    category,
                    improvement: currentScore.score - previousScore.score,
                    from: previousScore.score,
                    to: currentScore.score
                });
            }
        }

        return improvements;
    }

    /**
     * Identify regressions
     */
    identifyRegressions() {
        const regressions = [];
        const current = this.reportingState.lastReport;
        const previous = this.reportingState.history[this.reportingState.history.length - 2];

        if (!current || !previous) return regressions;

        // Compare category scores
        for (const [category, currentScore] of Object.entries(current.summary.categoryScores)) {
            const previousScore = previous.summary.categoryScores[category];
            if (previousScore && currentScore.score < previousScore.score - this.config.trendThreshold) {
                regressions.push({
                    category,
                    regression: previousScore.score - currentScore.score,
                    from: previousScore.score,
                    to: currentScore.score
                });
            }
        }

        return regressions;
    }

    /**
     * Project future trend
     */
    projectFutureTrend() {
        const history = this.reportingState.history;
        if (history.length < 5) return null;

        // Calculate average rate of change
        const recentScores = history.slice(-5).map(r => r.score.adjusted);
        const changeRate = this.calculateAverageChangeRate(recentScores);

        return {
            nextScore: recentScores[recentScores.length - 1] + changeRate,
            trend: changeRate > 0 ? 'improving' : changeRate < 0 ? 'declining' : 'stable',
            confidence: this.calculateTrendConfidence(recentScores)
        };
    }

    /**
     * Calculate average change rate
     */
    calculateAverageChangeRate(scores) {
        if (scores.length < 2) return 0;
        
        let totalChange = 0;
        for (let i = 1; i < scores.length; i++) {
            totalChange += scores[i] - scores[i - 1];
        }
        
        return totalChange / (scores.length - 1);
    }

    /**
     * Calculate trend confidence
     */
    calculateTrendConfidence(scores) {
        // Calculate variance to determine confidence
        const mean = scores.reduce((a, b) => a + b) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        
        // Lower variance = higher confidence
        if (variance < 5) return 'high';
        if (variance < 10) return 'medium';
        return 'low';
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(auditResults) {
        const recommendations = [];
        const summary = auditResults.summary || {};

        // Critical issues recommendations
        if (summary.criticalIssues > 0) {
            recommendations.push({
                priority: 'critical',
                category: 'immediate-action',
                title: 'Address Critical Accessibility Barriers',
                description: `Fix ${summary.criticalIssues} critical issues blocking functionality`,
                impact: 'high',
                effort: 'varies',
                guidelines: this.getAffectedGuidelines(auditResults, 'critical')
            });
        }

        // Category-specific recommendations
        for (const [category, results] of Object.entries(auditResults.categories || {})) {
            if (results.score < 80) {
                recommendations.push({
                    priority: results.score < 60 ? 'high' : 'medium',
                    category: category,
                    title: `Improve ${category} accessibility`,
                    description: `Current score: ${results.score.toFixed(1)}%. Target: 80%+`,
                    impact: 'medium',
                    effort: 'medium',
                    actions: this.getCategoryActions(results)
                });
            }
        }

        // Process recommendations
        recommendations.push(...this.getProcessRecommendations(auditResults));

        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Get affected guidelines by severity
     */
    getAffectedGuidelines(auditResults, severity) {
        const guidelines = new Set();
        
        for (const category of Object.values(auditResults.categories || {})) {
            for (const issue of (category.issues || [])) {
                if (issue.severity === severity) {
                    guidelines.add(issue.guideline);
                }
            }
        }
        
        return Array.from(guidelines);
    }

    /**
     * Get category-specific actions
     */
    getCategoryActions(categoryResults) {
        const actions = [];
        const topIssues = this.getTopIssuesForCategory(categoryResults);
        
        for (const issue of topIssues) {
            actions.push({
                guideline: issue.guideline,
                action: issue.suggestion || 'Fix accessibility issue',
                count: issue.count
            });
        }
        
        return actions;
    }

    /**
     * Get top issues for a category
     */
    getTopIssuesForCategory(category, limit = 3) {
        const issueMap = new Map();
        
        for (const issue of (category.issues || [])) {
            const key = issue.guideline;
            const existing = issueMap.get(key) || {
                guideline: key,
                count: 0,
                suggestion: issue.suggestion
            };
            existing.count++;
            issueMap.set(key, existing);
        }
        
        return Array.from(issueMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Get process recommendations
     */
    getProcessRecommendations(auditResults) {
        const recommendations = [];
        
        // Testing recommendation
        if (!this.hasRegularTesting()) {
            recommendations.push({
                priority: 'medium',
                category: 'process',
                title: 'Implement Regular Accessibility Testing',
                description: 'Set up automated and manual accessibility testing processes',
                impact: 'high',
                effort: 'medium'
            });
        }
        
        // Training recommendation
        if (this.needsTraining(auditResults)) {
            recommendations.push({
                priority: 'medium',
                category: 'training',
                title: 'Accessibility Training',
                description: 'Provide accessibility training for development team',
                impact: 'medium',
                effort: 'low'
            });
        }
        
        return recommendations;
    }

    /**
     * Check if regular testing is in place
     */
    hasRegularTesting() {
        const history = this.reportingState.history;
        if (history.length < 3) return false;
        
        // Check if tests are run at least weekly
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const gaps = [];
        
        for (let i = 1; i < history.length; i++) {
            gaps.push(history[i].timestamp - history[i - 1].timestamp);
        }
        
        return gaps.every(gap => gap <= oneWeek);
    }

    /**
     * Check if training is needed
     */
    needsTraining(auditResults) {
        // If same issues keep appearing, training might help
        const recurringIssues = this.findRecurringIssues();
        return recurringIssues.length > 5;
    }

    /**
     * Find recurring issues
     */
    findRecurringIssues() {
        const issueFrequency = new Map();
        
        for (const report of this.reportingState.history.slice(-10)) {
            for (const issue of report.summary?.topIssues || []) {
                const count = issueFrequency.get(issue.guideline) || 0;
                issueFrequency.set(issue.guideline, count + 1);
            }
        }
        
        return Array.from(issueFrequency.entries())
            .filter(([_, count]) => count > 5)
            .map(([guideline, _]) => guideline);
    }

    /**
     * Update statistics
     */
    updateStatistics(auditResults) {
        const stats = this.reportingState.statistics;
        
        // Update total validations
        stats.totalValidations++;
        
        // Update average score
        const allScores = this.reportingState.history.map(r => r.score.adjusted);
        stats.averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        
        // Update most common issues
        for (const category of Object.values(auditResults.categories || {})) {
            for (const issue of (category.issues || [])) {
                const key = issue.guideline;
                stats.mostCommonIssues.set(key, (stats.mostCommonIssues.get(key) || 0) + 1);
            }
        }
    }

    /**
     * Format report for export
     */
    formatReport(report, format) {
        switch (format) {
            case 'html':
                return this.formatAsHTML(report);
            case 'csv':
                return this.formatAsCSV(report);
            case 'json':
            default:
                return report;
        }
    }

    /**
     * Format report as HTML
     */
    formatAsHTML(report) {
        // Simplified HTML formatting
        return `<h1>WCAG Report</h1><p>Score: ${report.score.adjusted}%</p>`;
    }

    /**
     * Format report as CSV
     */
    formatAsCSV(report) {
        const rows = [
            ['WCAG Compliance Report'],
            ['Generated', new Date(report.timestamp).toISOString()],
            [''],
            ['Overall Score', report.score.adjusted],
            ['Grade', report.score.grade],
            ['Compliance Level', report.summary.complianceLevel],
            [''],
            ['Issues by Priority'],
            ['Critical', report.summary.issuesByPriority.critical],
            ['High', report.summary.issuesByPriority.high],
            ['Medium', report.summary.issuesByPriority.medium],
            ['Low', report.summary.issuesByPriority.low],
            [''],
            ['Category Scores']
        ];
        
        for (const [category, scores] of Object.entries(report.summary.categoryScores)) {
            rows.push([category, scores.score, scores.grade]);
        }
        
        return rows.map(row => row.join(',')).join('\n');
    }

    /**
     * Get issue type
     */
    getIssueType(issue) {
        const issueText = issue.issue.toLowerCase();
        
        if (issueText.includes('alt')) return 'alt-text';
        if (issueText.includes('contrast')) return 'color-contrast';
        if (issueText.includes('keyboard')) return 'keyboard-access';
        if (issueText.includes('aria')) return 'aria-attributes';
        if (issueText.includes('label')) return 'form-labels';
        
        return 'other';
    }

    /**
     * Generate report ID
     */
    generateReportId() {
        return `wcag-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get environment info
     */
    getEnvironmentInfo() {
        return {
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Limit history size
     */
    limitHistory() {
        if (this.reportingState.history.length > this.config.historyLimit) {
            this.reportingState.history = this.reportingState.history.slice(-this.config.historyLimit);
        }
    }

    /**
     * Get report history
     */
    getHistory(limit = 10) {
        return this.reportingState.history.slice(-limit);
    }

    /**
     * Get latest report
     */
    getLatestReport() {
        return this.reportingState.lastReport;
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.reportingState.history = [];
        this.reportingState.lastReport = null;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }

    /**
     * Export report
     */
    exportReport(report, format = 'json') {
        const formatted = this.formatReport(report, format);
        const blob = new Blob([formatted], { 
            type: format === 'json' ? 'application/json' : 'text/plain' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wcag-report-${report.id}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.clearHistory();
        this.reportingState.statistics.mostCommonIssues.clear();
        this.reportingState.statistics.fixedIssues.clear();
    }
}