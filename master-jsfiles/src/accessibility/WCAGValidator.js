/**
 * WCAGValidator - Main Controller for WCAG 2.1 AA compliance
 * Orchestrates rule engine, auditor, and reporter components
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { WCAGRuleEngine } from './wcag-validation/WCAGRuleEngine.js';
import { AccessibilityAuditor } from './wcag-validation/AccessibilityAuditor.js';
import { ComplianceReporter } from './wcag-validation/ComplianceReporter.js';

export class WCAGValidator {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // WCAG検証設定
        this.config = {
            enabled: true,
            level: 'AA', // A, AA, AAA
            version: '2.1',
            realTimeValidation: true,
            autoFix: false,
            reportGeneration: true,
            trendAnalysis: true
        };
        
        // 検証結果の保持
        this.results = {
            lastValidation: null,
            overallScore: 0,
            categoryScores: {},
            issues: [],
            warnings: [],
            passedTests: [],
            failedTests: [],
            history: [],
            trends: {
                weekly: [],
                monthly: [],
                improvements: [],
                regressions: []
            }
        };
        
        // 統計情報
        this.stats = {
            totalValidations: 0,
            averageScore: 0,
            mostCommonIssues: new Map(),
            fixedIssues: new Map()
        };
        
        // Initialize sub-components
        this.ruleEngine = new WCAGRuleEngine({
            enabled: this.config.enabled,
            level: this.config.level,
            autoFixEnabled: this.config.autoFix
        });
        
        this.auditor = new AccessibilityAuditor({
            enabled: this.config.enabled,
            autoAudit: this.config.realTimeValidation
        });
        
        this.reporter = new ComplianceReporter({
            enabled: this.config.reportGeneration,
            trackTrends: this.config.trendAnalysis
        });
        
        // 自動検証タイマー
        this.validationTimer = null;
        this.validationInterval = 60000; // 1分ごと
        
        this.initialized = false;
    }
    
    /**
     * 初期化
     */
    initialize() {
        if (this.initialized) return;
        
        // Initialize sub-components
        this.auditor.initialize(this.ruleEngine);
        
        // 保存された履歴を読み込み
        this.loadValidationHistory();
        
        // イベントのバインド
        this.bindEvents();
        
        // リアルタイム監視の設定
        if (this.config.realTimeValidation) {
            this.setupRealTimeMonitoring();
        }
        
        this.initialized = true;
        console.log('WCAGValidator initialized');
    }
    
    /**
     * 完全なWCAG検証を実行
     */
    async runFullValidation() {
        console.log('Running full WCAG validation...');
        this.results.lastValidation = Date.now();
        this.stats.totalValidations++;
        
        try {
            // Run full audit
            const auditResults = await this.auditor.runFullAudit({
                level: this.config.level
            });
            
            if (!auditResults) {
                console.error('WCAGValidator: Audit failed');
                return null;
            }
            
            // Process results
            this.processAuditResults(auditResults);
            
            // Generate report
            const report = this.reporter.generateReport(auditResults, {
                type: 'detailed',
                format: 'json'
            });
            
            // Update trends
            this.updateTrends();
            
            // Save results
            this.saveValidationResults();
            
            // Notify completion
            this.notifyValidationComplete(report);
            
            return report;
        } catch (error) {
            console.error('WCAGValidator: Full validation error:', error);
            getErrorHandler().logError('WCAG validation failed', { error });
            return null;
        }
    }
    
    /**
     * Process audit results
     */
    processAuditResults(auditResults) {
        // Clear previous results
        this.results.issues = [];
        this.results.warnings = [];
        this.results.passedTests = [];
        this.results.failedTests = [];
        
        // Process each category
        for (const [categoryId, category] of Object.entries(auditResults.categories)) {
            this.results.categoryScores[categoryId] = category.score;
            
            // Collect issues and warnings
            this.results.issues.push(...category.issues);
            this.results.warnings.push(...category.warnings);
            
            // Track test results
            for (const guideline of Object.values(category.guidelines)) {
                for (const [testName, test] of Object.entries(guideline.tests)) {
                    if (test.passed) {
                        this.results.passedTests.push(testName);
                    } else {
                        this.results.failedTests.push(testName);
                    }
                }
            }
        }
        
        // Calculate overall score
        this.results.overallScore = auditResults.summary.overallScore;
        
        // Update statistics
        this.updateStatistics(auditResults);
    }
    
    /**
     * Update statistics
     */
    updateStatistics(auditResults) {
        // Update average score
        const allScores = this.results.history
            .map(h => h.overallScore)
            .concat(this.results.overallScore);
        this.stats.averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        
        // Track most common issues
        for (const issue of this.results.issues) {
            const guideline = issue.guideline || 'unknown';
            this.stats.mostCommonIssues.set(
                guideline,
                (this.stats.mostCommonIssues.get(guideline) || 0) + 1
            );
        }
    }
    
    /**
     * カテゴリーの検証
     */
    async validateCategory(categoryId) {
        return await this.auditor.auditCategory(categoryId);
    }
    
    /**
     * ガイドラインの検証
     */
    async validateGuideline(categoryId, guidelineId, guideline) {
        return await this.auditor.auditGuideline(guidelineId, guideline);
    }
    
    /**
     * 個別テストの実行
     */
    async runTest(testName, level) {
        return await this.ruleEngine.runTest(testName, { level });
    }
    
    /**
     * Quick validation
     */
    async runQuickValidation() {
        return await this.auditor.runQuickAudit();
    }
    
    /**
     * Generate validation report
     */
    generateValidationReport(type = 'summary', format = 'json') {
        const auditResults = {
            categories: this.results.categoryScores,
            summary: {
                overallScore: this.results.overallScore,
                totalIssues: this.results.issues.length,
                criticalIssues: this.results.issues.filter(i => i.severity === 'critical').length,
                highIssues: this.results.issues.filter(i => i.severity === 'high').length,
                mediumIssues: this.results.issues.filter(i => i.severity === 'medium').length,
                lowIssues: this.results.issues.filter(i => i.severity === 'low').length
            }
        };
        
        return this.reporter.generateReport(auditResults, { type, format });
    }
    
    /**
     * リアルタイム監視の設定
     */
    setupRealTimeMonitoring() {
        // DOM変更の監視
        if (typeof MutationObserver !== 'undefined') {
            this.observer = new MutationObserver((mutations) => {
                this.scheduleRevalidation();
            });
            
            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['alt', 'aria-label', 'aria-labelledby', 'role']
            });
        }
        
        // 定期的な検証
        this.validationTimer = setInterval(() => {
            this.runQuickValidation();
        }, this.validationInterval);
    }
    
    /**
     * 再検証のスケジュール
     */
    scheduleRevalidation() {
        if (this.revalidationTimeout) {
            clearTimeout(this.revalidationTimeout);
        }
        
        this.revalidationTimeout = setTimeout(() => {
            this.runQuickValidation();
        }, 5000); // 5秒後に実行
    }
    
    /**
     * トレンドの更新
     */
    updateTrends() {
        const now = Date.now();
        const score = this.results.overallScore;
        
        // 週次トレンド
        this.results.trends.weekly.push({
            timestamp: now,
            score,
            issues: this.results.failedTests.length
        });
        
        // 過去30日のデータのみ保持
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        this.results.trends.weekly = this.results.trends.weekly.filter(entry => entry.timestamp > thirtyDaysAgo);
        
        // 改善/悪化の検出
        if (this.results.trends.weekly.length >= 2) {
            const current = this.results.trends.weekly[this.results.trends.weekly.length - 1];
            const previous = this.results.trends.weekly[this.results.trends.weekly.length - 2];
            
            const scoreDiff = current.score - previous.score;
            if (Math.abs(scoreDiff) >= 5) { // 5%以上の変化
                const trend = {
                    timestamp: now,
                    type: scoreDiff > 0 ? 'improvement' : 'regression',
                    scoreDiff,
                    previousScore: previous.score,
                    currentScore: current.score
                };
                
                if (scoreDiff > 0) {
                    this.results.trends.improvements.push(trend);
                } else {
                    this.results.trends.regressions.push(trend);
                }
            }
        }
    }
    
    /**
     * 検証結果の保存
     */
    saveValidationResults() {
        try {
            const historyEntry = {
                timestamp: this.results.lastValidation,
                overallScore: this.results.overallScore,
                categoryScores: { ...this.results.categoryScores },
                failedTestsCount: this.results.failedTests.length,
                passedTestsCount: this.results.passedTests.length,
                warningsCount: this.results.warnings.length
            };
            
            this.results.history.unshift(historyEntry);
            
            // 履歴を最新50件に制限
            if (this.results.history.length > 50) {
                this.results.history = this.results.history.slice(0, 50);
            }
            
            // LocalStorageに保存
            localStorage.setItem('wcagValidator_results', JSON.stringify({
                history: this.results.history,
                trends: this.results.trends,
                stats: this.stats
            }));
            
        } catch (error) {
            console.warn('Failed to save WCAG validation results:', error);
        }
    }
    
    /**
     * 検証履歴の読み込み
     */
    loadValidationHistory() {
        try {
            const saved = localStorage.getItem('wcagValidator_results');
            if (saved) {
                const data = JSON.parse(saved);
                this.results.history = data.history || [];
                this.results.trends = data.trends || { weekly: [], monthly: [], improvements: [], regressions: [] };
                this.stats = data.stats || { totalValidations: 0, averageScore: 0, mostCommonIssues: new Map(), fixedIssues: new Map() };
            }
        } catch (error) {
            console.warn('Failed to load WCAG validation history:', error);
        }
    }
    
    /**
     * イベントバインド
     */
    bindEvents() {
        // アクセシビリティマネージャーのイベントを監視
        if (this.accessibilityManager?.eventSystem) {
            this.accessibilityManager.eventSystem.on('accessibility-change', () => {
                this.scheduleRevalidation();
            });
            
            this.accessibilityManager.eventSystem.on('screen-reader-enabled', () => {
                this.runQuickValidation();
            });
        }
    }
    
    /**
     * 検証完了の通知
     */
    notifyValidationComplete(report) {
        if (this.accessibilityManager?.eventSystem) {
            this.accessibilityManager.eventSystem.emit('wcag-validation-complete', {
                score: report.score.adjusted,
                issues: this.results.issues.length,
                warnings: this.results.warnings.length,
                report
            });
        }
    }
    
    /**
     * 検証レベルの設定
     */
    setValidationLevel(level) {
        if (['A', 'AA', 'AAA'].includes(level)) {
            this.config.level = level;
            this.ruleEngine.updateConfig({ level });
            console.log(`WCAG validation level set to ${level}`);
        }
    }
    
    /**
     * リアルタイム検証の切り替え
     */
    toggleRealTimeValidation(enabled) {
        this.config.realTimeValidation = enabled;
        
        if (enabled) {
            this.setupRealTimeMonitoring();
        } else {
            if (this.observer) {
                this.observer.disconnect();
            }
            if (this.validationTimer) {
                clearInterval(this.validationTimer);
            }
        }
    }
    
    /**
     * 検証結果の取得
     */
    getValidationResults() {
        return {
            lastValidation: this.results.lastValidation,
            overallScore: this.results.overallScore,
            categoryScores: this.results.categoryScores,
            issues: this.results.issues,
            warnings: this.results.warnings,
            passedTests: this.results.passedTests.length,
            failedTests: this.results.failedTests.length
        };
    }
    
    /**
     * スコア履歴の取得
     */
    getScoreHistory() {
        return this.results.history.map(entry => ({
            timestamp: entry.timestamp,
            score: entry.overallScore
        }));
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
        
        // Update sub-components
        this.ruleEngine.updateConfig({
            enabled: this.config.enabled,
            level: this.config.level,
            autoFixEnabled: this.config.autoFix
        });
        
        this.auditor.updateConfig({
            enabled: this.config.enabled,
            autoAudit: this.config.realTimeValidation
        });
        
        this.reporter.updateConfig({
            enabled: this.config.reportGeneration,
            trackTrends: this.config.trendAnalysis
        });
    }
    
    /**
     * 有効/無効の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        
        if (!enabled) {
            this.toggleRealTimeValidation(false);
        }
        
        this.applyConfig({ enabled });
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // リアルタイム監視の停止
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.validationTimer) {
            clearInterval(this.validationTimer);
        }
        
        if (this.revalidationTimeout) {
            clearTimeout(this.revalidationTimeout);
        }
        
        // Sub-components cleanup
        this.ruleEngine.destroy();
        this.auditor.destroy();
        this.reporter.destroy();
        
        // 結果の保存
        this.saveValidationResults();
        
        console.log('WCAGValidator destroyed');
    }
}