/**
 * AccessibilityAuditor - Comprehensive accessibility auditing system
 * Handles category-based validation and issue classification
 */
export class AccessibilityAuditor {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            auditCategories: ['perceivable', 'operable', 'understandable', 'robust'],
            quickAuditTests: ['altText', 'colorContrast', 'keyboardNavigation', 'nameRoleValue'],
            autoAudit: false,
            auditInterval: 300000, // 5 minutes
            issueThreshold: {
                critical: 0,
                high: 5,
                medium: 10,
                low: 20
            },
            ...config
        };

        // Audit state management
        this.auditState = {
            running: false,
            lastAudit: null,
            currentCategory: null,
            results: new Map(),
            history: []
        };

        // Category definitions
        this.categories = {
            perceivable: {
                name: 'Perceivable',
                description: 'Information must be presentable in ways users can perceive',
                guidelines: {
                    '1.1': { name: 'Text Alternatives', tests: ['altText', 'imageLabels', 'decorativeImages'] },
                    '1.2': { name: 'Time-based Media', tests: ['audioControl'] },
                    '1.3': { name: 'Adaptable', tests: ['headingStructure', 'meaningfulSequence', 'sensoryCues'] },
                    '1.4': { name: 'Distinguishable', tests: ['colorContrast', 'textResize'] }
                }
            },
            operable: {
                name: 'Operable',
                description: 'User interface components must be operable',
                guidelines: {
                    '2.1': { name: 'Keyboard Accessible', tests: ['keyboardNavigation', 'noKeyboardTrap'] },
                    '2.2': { name: 'Enough Time', tests: [] },
                    '2.3': { name: 'Seizures', tests: [] },
                    '2.4': { name: 'Navigable', tests: ['bypassBlocks', 'pageTitle', 'focusOrder', 'linkPurpose'] },
                    '2.5': { name: 'Input Modalities', tests: [] }
                }
            },
            understandable: {
                name: 'Understandable',
                description: 'Information and UI operation must be understandable',
                guidelines: {
                    '3.1': { name: 'Readable', tests: ['languageOfPage'] },
                    '3.2': { name: 'Predictable', tests: ['onFocus', 'onInput', 'consistentNavigation'] },
                    '3.3': { name: 'Input Assistance', tests: ['errorIdentification', 'labelsInstructions'] }
                }
            },
            robust: {
                name: 'Robust',
                description: 'Content must be robust enough for various assistive technologies',
                guidelines: {
                    '4.1': { name: 'Compatible', tests: ['parsing', 'nameRoleValue', 'statusMessages'] }
                }
            }
        };

        // Issue classification system
        this.issueClassifier = {
            critical: ['missing-alt', 'keyboard-trap', 'no-accessible-name'],
            high: ['low-contrast', 'missing-keyboard-handler', 'invalid-aria'],
            medium: ['missing-label', 'positive-tabindex', 'decorative-not-marked'],
            low: ['long-alt-text', 'redundant-aria', 'minor-contrast']
        };

        // Audit timers
        this.auditTimer = null;
        this.ruleEngine = null;
    }

    /**
     * Initialize auditor with rule engine
     */
    initialize(ruleEngine) {
        this.ruleEngine = ruleEngine;
        
        if (this.config.autoAudit) {
            this.startAutoAudit();
        }
    }

    /**
     * Run full accessibility audit
     */
    async runFullAudit(options = {}) {
        if (this.auditState.running) {
            console.warn('AccessibilityAuditor: Audit already in progress');
            return null;
        }

        this.auditState.running = true;
        this.auditState.lastAudit = Date.now();

        const auditResults = {
            timestamp: Date.now(),
            categories: {},
            summary: {
                totalIssues: 0,
                criticalIssues: 0,
                highIssues: 0,
                mediumIssues: 0,
                lowIssues: 0,
                overallScore: 0
            },
            recommendations: []
        };

        try {
            // Audit each category
            for (const category of this.config.auditCategories) {
                const categoryResult = await this.auditCategory(category, options);
                auditResults.categories[category] = categoryResult;
                
                // Update summary
                this.updateAuditSummary(auditResults.summary, categoryResult);
            }

            // Calculate overall score
            auditResults.summary.overallScore = this.calculateOverallScore(auditResults.categories);
            
            // Generate recommendations
            auditResults.recommendations = this.generateRecommendations(auditResults);

            // Store results
            this.auditState.results.set(Date.now(), auditResults);
            this.auditState.history.push(auditResults);
            
            // Limit history size
            if (this.auditState.history.length > 100) {
                this.auditState.history.shift();
            }

            return auditResults;
        } finally {
            this.auditState.running = false;
            this.auditState.currentCategory = null;
        }
    }

    /**
     * Run quick audit with essential tests
     */
    async runQuickAudit() {
        const quickResults = {
            timestamp: Date.now(),
            issues: [],
            warnings: [],
            passed: 0,
            failed: 0,
            tests: {}
        };

        for (const testName of this.config.quickAuditTests) {
            try {
                if (!this.ruleEngine) {
                    console.error('AccessibilityAuditor: Rule engine not initialized');
                    continue;
                }

                const testResult = await this.ruleEngine.runTest(testName);
                quickResults.tests[testName] = testResult;

                if (testResult.passed) {
                    quickResults.passed++;
                } else {
                    quickResults.failed++;
                    quickResults.issues.push(...(testResult.issues || []));
                }

                if (testResult.warnings) {
                    quickResults.warnings.push(...testResult.warnings);
                }
            } catch (error) {
                console.error(`AccessibilityAuditor: Quick test ${testName} failed:`, error);
            }
        }

        return quickResults;
    }

    /**
     * Audit a specific category
     */
    async auditCategory(categoryId, options = {}) {
        const category = this.categories[categoryId];
        if (!category) {
            console.warn(`AccessibilityAuditor: Unknown category ${categoryId}`);
            return null;
        }

        this.auditState.currentCategory = categoryId;

        const categoryResult = {
            id: categoryId,
            name: category.name,
            description: category.description,
            guidelines: {},
            issues: [],
            warnings: [],
            score: 0,
            passed: 0,
            failed: 0
        };

        // Audit each guideline in the category
        for (const [guidelineId, guideline] of Object.entries(category.guidelines)) {
            const guidelineResult = await this.auditGuideline(guidelineId, guideline, options);
            categoryResult.guidelines[guidelineId] = guidelineResult;

            // Aggregate results
            categoryResult.issues.push(...guidelineResult.issues);
            categoryResult.warnings.push(...guidelineResult.warnings);
            categoryResult.passed += guidelineResult.passed;
            categoryResult.failed += guidelineResult.failed;
        }

        // Calculate category score
        const totalTests = categoryResult.passed + categoryResult.failed;
        categoryResult.score = totalTests > 0 ? (categoryResult.passed / totalTests) * 100 : 100;

        return categoryResult;
    }

    /**
     * Audit a specific guideline
     */
    async auditGuideline(guidelineId, guideline, options = {}) {
        const guidelineResult = {
            id: guidelineId,
            name: guideline.name,
            tests: {},
            issues: [],
            warnings: [],
            passed: 0,
            failed: 0
        };

        // Run each test in the guideline
        for (const testName of guideline.tests) {
            try {
                if (!this.ruleEngine) {
                    console.error('AccessibilityAuditor: Rule engine not initialized');
                    continue;
                }

                const testResult = await this.ruleEngine.runTest(testName, options);
                guidelineResult.tests[testName] = testResult;

                if (testResult.passed) {
                    guidelineResult.passed++;
                } else {
                    guidelineResult.failed++;
                    // Classify and add issues
                    const classifiedIssues = this.classifyIssues(testResult.issues || []);
                    guidelineResult.issues.push(...classifiedIssues);
                }

                if (testResult.warnings) {
                    guidelineResult.warnings.push(...testResult.warnings);
                }
            } catch (error) {
                console.error(`AccessibilityAuditor: Test ${testName} failed:`, error);
                guidelineResult.failed++;
            }
        }

        return guidelineResult;
    }

    /**
     * Classify issues by severity
     */
    classifyIssues(issues) {
        return issues.map(issue => {
            const classified = { ...issue };
            
            // Determine severity based on issue type
            if (!classified.severity) {
                classified.severity = this.determineSeverity(issue);
            }

            // Add classification metadata
            classified.classification = {
                category: this.getIssueCategory(issue),
                impact: this.assessImpact(issue),
                effort: this.estimateFixEffort(issue)
            };

            return classified;
        });
    }

    /**
     * Determine issue severity
     */
    determineSeverity(issue) {
        const issueType = this.getIssueType(issue);
        
        for (const [severity, types] of Object.entries(this.issueClassifier)) {
            if (types.includes(issueType)) {
                return severity;
            }
        }
        
        return 'medium'; // Default severity
    }

    /**
     * Get issue type identifier
     */
    getIssueType(issue) {
        const issueText = issue.issue.toLowerCase();
        
        if (issueText.includes('missing alt')) return 'missing-alt';
        if (issueText.includes('keyboard trap')) return 'keyboard-trap';
        if (issueText.includes('no accessible name')) return 'no-accessible-name';
        if (issueText.includes('insufficient color contrast')) return 'low-contrast';
        if (issueText.includes('missing keyboard')) return 'missing-keyboard-handler';
        if (issueText.includes('invalid aria')) return 'invalid-aria';
        if (issueText.includes('missing label')) return 'missing-label';
        if (issueText.includes('positive tabindex')) return 'positive-tabindex';
        
        return 'general-issue';
    }

    /**
     * Get issue category
     */
    getIssueCategory(issue) {
        const guideline = issue.guideline || '';
        
        if (guideline.startsWith('1.')) return 'perceivable';
        if (guideline.startsWith('2.')) return 'operable';
        if (guideline.startsWith('3.')) return 'understandable';
        if (guideline.startsWith('4.')) return 'robust';
        
        return 'general';
    }

    /**
     * Assess issue impact
     */
    assessImpact(issue) {
        const severity = issue.severity || 'medium';
        const impacts = {
            critical: 'blocks-functionality',
            high: 'significant-barrier',
            medium: 'moderate-barrier',
            low: 'minor-inconvenience'
        };
        
        return impacts[severity] || 'unknown';
    }

    /**
     * Estimate fix effort
     */
    estimateFixEffort(issue) {
        const issueType = this.getIssueType(issue);
        const effortMap = {
            'missing-alt': 'low',
            'keyboard-trap': 'high',
            'no-accessible-name': 'medium',
            'low-contrast': 'medium',
            'missing-keyboard-handler': 'high',
            'invalid-aria': 'low',
            'missing-label': 'low',
            'positive-tabindex': 'low'
        };
        
        return effortMap[issueType] || 'medium';
    }

    /**
     * Update audit summary
     */
    updateAuditSummary(summary, categoryResult) {
        summary.totalIssues += categoryResult.issues.length;
        
        categoryResult.issues.forEach(issue => {
            switch (issue.severity) {
                case 'critical':
                    summary.criticalIssues++;
                    break;
                case 'high':
                    summary.highIssues++;
                    break;
                case 'medium':
                    summary.mediumIssues++;
                    break;
                case 'low':
                    summary.lowIssues++;
                    break;
            }
        });
    }

    /**
     * Calculate overall accessibility score
     */
    calculateOverallScore(categories) {
        let totalScore = 0;
        let categoryCount = 0;
        
        for (const category of Object.values(categories)) {
            if (category && typeof category.score === 'number') {
                totalScore += category.score;
                categoryCount++;
            }
        }
        
        return categoryCount > 0 ? totalScore / categoryCount : 0;
    }

    /**
     * Generate recommendations based on audit results
     */
    generateRecommendations(auditResults) {
        const recommendations = [];
        
        // Critical issues recommendations
        if (auditResults.summary.criticalIssues > 0) {
            recommendations.push({
                priority: 'critical',
                message: 'Address critical accessibility issues immediately',
                action: 'Fix all issues blocking functionality for users with disabilities'
            });
        }
        
        // Category-specific recommendations
        for (const [categoryId, category] of Object.entries(auditResults.categories)) {
            if (category.score < 80) {
                recommendations.push({
                    priority: 'high',
                    message: `Improve ${category.name} accessibility (current score: ${category.score.toFixed(1)}%)`,
                    action: `Focus on ${categoryId} guidelines to enhance user experience`
                });
            }
        }
        
        // General recommendations
        if (auditResults.summary.overallScore < 90) {
            recommendations.push({
                priority: 'medium',
                message: 'Schedule regular accessibility audits',
                action: 'Set up automated testing and manual reviews'
            });
        }
        
        return recommendations;
    }

    /**
     * Start automatic auditing
     */
    startAutoAudit() {
        if (this.auditTimer) {
            clearInterval(this.auditTimer);
        }
        
        this.auditTimer = setInterval(async () => {
            if (!this.auditState.running) {
                await this.runQuickAudit();
            }
        }, this.config.auditInterval);
    }

    /**
     * Stop automatic auditing
     */
    stopAutoAudit() {
        if (this.auditTimer) {
            clearInterval(this.auditTimer);
            this.auditTimer = null;
        }
    }

    /**
     * Get audit history
     */
    getAuditHistory(limit = 10) {
        return this.auditState.history.slice(-limit);
    }

    /**
     * Get latest audit results
     */
    getLatestResults() {
        if (this.auditState.history.length === 0) {
            return null;
        }
        return this.auditState.history[this.auditState.history.length - 1];
    }

    /**
     * Check if issues exceed threshold
     */
    checkIssueThreshold() {
        const latest = this.getLatestResults();
        if (!latest) return false;
        
        const summary = latest.summary;
        return (
            summary.criticalIssues > this.config.issueThreshold.critical ||
            summary.highIssues > this.config.issueThreshold.high ||
            summary.mediumIssues > this.config.issueThreshold.medium ||
            summary.lowIssues > this.config.issueThreshold.low
        );
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        
        // Restart auto audit if interval changed
        if (newConfig.auditInterval && this.config.autoAudit) {
            this.startAutoAudit();
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.stopAutoAudit();
        this.auditState.results.clear();
        this.auditState.history = [];
    }
}