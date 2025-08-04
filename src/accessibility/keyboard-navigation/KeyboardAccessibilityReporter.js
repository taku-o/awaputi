/**
 * KeyboardAccessibilityReporter
 * キーボードアクセシビリティテスト結果の報告と分析機能を提供
 * - テスト結果の編集と報告
 * - 問題の分類と優先順位付け
 * - アクセシビリティ準拠スコア計算
 * - レポート生成とフォーマット
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class KeyboardAccessibilityReporter {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            generateDetailedReports: true,
            includeRecommendations: true,
            exportFormats: ['html', 'json'],
            scoringWeights: {
                critical: 10,
                high: 7,
                medium: 4,
                low: 1
            },
            ...config
        };
        
        // テスト結果データ
        this.testResults = {
            overall: {
                score: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                timestamp: null
            },
            suiteResults: {},
            issues: [],
            recommendations: [],
            statistics: {}
        };
        
        // 問題分類定義
        this.issueCategories = {
            'focus-management': {
                name: 'フォーカス管理',
                weight: 0.25,
                description: 'フォーカス順序、表示、復元に関する問題'
            },
            'keyboard-traps': {
                name: 'キーボードトラップ',
                weight: 0.30,
                description: 'キーボードナビゲーションの障害'
            },
            'shortcut-conflicts': {
                name: 'ショートカット競合',
                weight: 0.15,
                description: 'ブラウザやシステムとのキー競合'
            },
            'custom-controls': {
                name: 'カスタムコントロール',
                weight: 0.20,
                description: 'ARIA要素とゲームコントロールの問題'
            },
            'navigation-patterns': {
                name: 'ナビゲーションパターン',
                weight: 0.10,
                description: 'ランドマーク、見出し、リストナビゲーション'
            }
        };
        
        // 推奨事項テンプレート
        this.recommendationTemplates = {
            'focus-visibility': {
                priority: 'high',
                template: 'フォーカス表示を改善してください',
                details: 'すべてのフォーカス可能要素に明確なフォーカスインジケーターを提供する'
            },
            'keyboard-trap': {
                priority: 'critical',
                template: 'キーボードトラップを修正してください',
                details: 'すべてのインタラクティブ要素でキーボードナビゲーションを可能にする'
            },
            'shortcut-conflict': {
                priority: 'medium',
                template: 'ショートカットキーの競合を解決してください',
                details: 'ブラウザの標準ショートカットと競合しないキーの組み合わせを使用する'
            },
            'aria-missing': {
                priority: 'high',
                template: 'ARIA属性を追加してください',
                details: 'カスタムコントロールに適切なARIA属性と状態を提供する'
            }
        };
        
        console.log('KeyboardAccessibilityReporter initialized');
    }
    
    /**
     * テスト結果の処理と分析
     */
    processTestResults(results) {
        try {
            this.testResults = {
                ...this.testResults,
                ...results,
                timestamp: new Date().toISOString()
            };
            
            // 問題の分類
            this.categorizeIssues();
            
            // アクセシビリティスコアの計算
            this.calculateAccessibilityScore();
            
            // 推奨事項の生成
            this.generateRecommendations();
            
            // 統計情報の更新
            this.updateStatistics();
            
            console.log('Test results processed successfully');
            return this.testResults;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'TEST_RESULTS_PROCESSING_ERROR', {
                component: 'KeyboardAccessibilityReporter'
            });
            return null;
        }
    }
    
    /**
     * 問題の分類と優先順位付け
     */
    categorizeIssues() {
        const categorizedIssues = {
            'focus-management': [],
            'keyboard-traps': [],
            'shortcut-conflicts': [],
            'custom-controls': [],
            'navigation-patterns': []
        };
        
        try {
            // すべてのテストスイートから問題を収集
            Object.values(this.testResults.suiteResults).forEach(suite => {
                if (suite.issues) {
                    suite.issues.forEach(issue => {
                        const category = this.determineIssueCategory(issue);
                        const prioritizedIssue = this.prioritizeIssue(issue, category);
                        
                        if (categorizedIssues[category]) {
                            categorizedIssues[category].push(prioritizedIssue);
                        }
                    });
                }
            });
            
            // 各カテゴリ内で優先順位でソート
            Object.keys(categorizedIssues).forEach(category => {
                categorizedIssues[category].sort((a, b) => {
                    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
            });
            
            this.testResults.categorizedIssues = categorizedIssues;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ISSUE_CATEGORIZATION_ERROR', {
                component: 'KeyboardAccessibilityReporter'
            });
        }
    }
    
    /**
     * 問題のカテゴリ決定
     */
    determineIssueCategory(issue) {
        const categoryKeywords = {
            'focus-management': ['focus', 'tab-order', 'visibility', 'restoration'],
            'keyboard-traps': ['trap', 'infinite', 'escape', 'modal'],
            'shortcut-conflicts': ['shortcut', 'conflict', 'accesskey', 'browser'],
            'custom-controls': ['aria', 'custom', 'game', 'canvas', 'widget'],
            'navigation-patterns': ['landmark', 'heading', 'list', 'table', 'navigation']
        };
        
        const issueText = (issue.type + ' ' + issue.message + ' ' + (issue.details || '')).toLowerCase();
        
        // キーワードマッチングでカテゴリを決定
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => issueText.includes(keyword))) {
                return category;
            }
        }
        
        // デフォルトカテゴリ
        return 'focus-management';
    }
    
    /**
     * 問題の優先順位付け
     */
    prioritizeIssue(issue, category) {
        let priority = issue.severity || 'medium';
        
        // 重要度の調整
        const criticalKeywords = ['trap', 'not accessible', 'missing handler'];
        const highKeywords = ['focus', 'aria', 'visibility'];
        const mediumKeywords = ['conflict', 'order', 'contrast'];
        
        const issueText = (issue.type + ' ' + issue.message).toLowerCase();
        
        if (criticalKeywords.some(keyword => issueText.includes(keyword))) {
            priority = 'critical';
        } else if (highKeywords.some(keyword => issueText.includes(keyword))) {
            priority = priority === 'low' ? 'medium' : priority;
        }
        
        return {
            ...issue,
            priority,
            category,
            impact: this.calculateIssueImpact(issue, category),
            wcagReference: this.getWCAGReference(issue)
        };
    }
    
    /**
     * 問題の影響度計算
     */
    calculateIssueImpact(issue, category) {
        const baseImpact = this.config.scoringWeights[issue.severity] || 1;
        const categoryWeight = this.issueCategories[category]?.weight || 0.1;
        
        return Math.round(baseImpact * categoryWeight * 10) / 10;
    }
    
    /**
     * WCAG参照の取得
     */
    getWCAGReference(issue) {
        const wcagMappings = {
            'focus': '2.4.3 Focus Order, 2.4.7 Focus Visible',
            'tab-order': '2.4.3 Focus Order',
            'keyboard-trap': '2.1.2 No Keyboard Trap',
            'shortcut': '2.1.4 Character Key Shortcuts',
            'aria': '4.1.2 Name, Role, Value',
            'visibility': '2.4.7 Focus Visible',
            'restoration': '2.4.3 Focus Order'
        };
        
        const issueText = (issue.type + ' ' + issue.message).toLowerCase();
        
        for (const [keyword, reference] of Object.entries(wcagMappings)) {
            if (issueText.includes(keyword)) {
                return reference;
            }
        }
        
        return 'WCAG 2.1 AA';
    }
    
    /**
     * アクセシビリティスコアの計算
     */
    calculateAccessibilityScore() {
        try {
            const suiteScores = Object.values(this.testResults.suiteResults).map(suite => suite.score || 0);
            const totalPassed = Object.values(this.testResults.suiteResults).reduce((sum, suite) => sum + (suite.passed || 0), 0);
            const totalFailed = Object.values(this.testResults.suiteResults).reduce((sum, suite) => sum + (suite.failed || 0), 0);
            const totalWarnings = Object.values(this.testResults.suiteResults).reduce((sum, suite) => sum + (suite.warnings || 0), 0);
            
            // 基本スコア計算
            const baseScore = suiteScores.length > 0 ? 
                Math.round(suiteScores.reduce((sum, score) => sum + score, 0) / suiteScores.length) : 0;
            
            // 問題による減点計算
            let deductions = 0;
            if (this.testResults.categorizedIssues) {
                Object.values(this.testResults.categorizedIssues).forEach(categoryIssues => {
                    categoryIssues.forEach(issue => {
                        deductions += issue.impact || 1;
                    });
                });
            }
            
            // 最終スコア計算（0-100の範囲）
            const finalScore = Math.max(0, Math.min(100, baseScore - deductions));
            
            this.testResults.overall = {
                score: Math.round(finalScore),
                passed: totalPassed,
                failed: totalFailed,
                warnings: totalWarnings,
                deductions: Math.round(deductions * 10) / 10,
                timestamp: new Date().toISOString()
            };
            
            // スコアレベルの決定
            this.testResults.overall.level = this.determineScoreLevel(finalScore);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SCORE_CALCULATION_ERROR', {
                component: 'KeyboardAccessibilityReporter'
            });
        }
    }
    
    /**
     * スコアレベルの決定
     */
    determineScoreLevel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 60) return 'Poor';
        return 'Critical';
    }
    
    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        try {
            // 問題に基づく推奨事項
            if (this.testResults.categorizedIssues) {
                Object.entries(this.testResults.categorizedIssues).forEach(([category, issues]) => {
                    if (issues.length > 0) {
                        const categoryRecommendation = this.generateCategoryRecommendation(category, issues);
                        if (categoryRecommendation) {
                            recommendations.push(categoryRecommendation);
                        }
                    }
                });
            }
            
            // スコアベースの推奨事項
            const scoreRecommendations = this.generateScoreBasedRecommendations();
            recommendations.push(...scoreRecommendations);
            
            // 優先順位でソート
            recommendations.sort((a, b) => {
                const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            
            this.testResults.recommendations = recommendations;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'RECOMMENDATION_GENERATION_ERROR', {
                component: 'KeyboardAccessibilityReporter'
            });
        }
    }
    
    /**
     * カテゴリ別推奨事項の生成
     */
    generateCategoryRecommendation(category, issues) {
        const categoryInfo = this.issueCategories[category];
        if (!categoryInfo) return null;
        
        const criticalIssues = issues.filter(issue => issue.priority === 'critical').length;
        const highIssues = issues.filter(issue => issue.priority === 'high').length;
        
        let priority = 'medium';
        if (criticalIssues > 0) priority = 'critical';
        else if (highIssues > 0) priority = 'high';
        
        return {
            category: category,
            priority: priority,
            title: `${categoryInfo.name}の改善`,
            description: categoryInfo.description,
            issueCount: issues.length,
            criticalCount: criticalIssues,
            highCount: highIssues,
            actions: this.generateCategoryActions(category, issues),
            impact: `${categoryInfo.name}の問題を解決することで、キーボードユーザーの操作性が向上します`
        };
    }
    
    /**
     * カテゴリ別アクション生成
     */
    generateCategoryActions(category, issues) {
        const actionMaps = {
            'focus-management': [
                'すべてのフォーカス可能要素に明確なフォーカスインジケーターを追加',
                '論理的なタブ順序を確保',
                'フォーカス復元機能を実装'
            ],
            'keyboard-traps': [
                'モーダル内でのフォーカス包含を実装',
                'Escapeキーによる脱出ルートを提供',
                '無限ループの除去'
            ],
            'shortcut-conflicts': [
                'ブラウザショートカットと競合しないキーの組み合わせを使用',
                'アクセスキーの見直し',
                'ユーザーカスタマイズオプションの提供'
            ],
            'custom-controls': [
                'ARIA属性の追加と適切な状態管理',
                'キーボードイベントハンドラーの実装',
                'ゲームコントロールのアクセシビリティ向上'
            ],
            'navigation-patterns': [
                'ランドマークの適切な使用',
                '見出し構造の改善',
                'スキップリンクの実装'
            ]
        };
        
        return actionMaps[category] || ['アクセシビリティの改善を検討'];
    }
    
    /**
     * スコアベース推奨事項の生成
     */
    generateScoreBasedRecommendations() {
        const recommendations = [];
        const score = this.testResults.overall.score;
        
        if (score < 60) {
            recommendations.push({
                priority: 'critical',
                title: '緊急対応が必要',
                description: 'キーボードアクセシビリティに重大な問題があります',
                actions: [
                    '最も深刻な問題から優先的に対応',
                    'アクセシビリティ専門家に相談',
                    '段階的な改善計画の策定'
                ]
            });
        } else if (score < 80) {
            recommendations.push({
                priority: 'high',
                title: '継続的な改善が推奨',
                description: 'アクセシビリティの向上により良いユーザー体験を提供できます',
                actions: [
                    '問題の優先順位に基づいた修正',
                    '定期的なアクセシビリティテストの実施',
                    'ユーザーフィードバックの収集'
                ]
            });
        }
        
        return recommendations;
    }
    
    /**
     * 統計情報の更新
     */
    updateStatistics() {
        try {
            const stats = {
                totalIssues: 0,
                issuesByPriority: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                },
                issuesByCategory: {},
                testCoverage: {
                    totalTests: this.testResults.overall.passed + this.testResults.overall.failed,
                    passRate: 0
                },
                wcagCompliance: {
                    level: this.testResults.overall.level,
                    score: this.testResults.overall.score
                }
            };
            
            // 問題統計の計算
            if (this.testResults.categorizedIssues) {
                Object.entries(this.testResults.categorizedIssues).forEach(([category, issues]) => {
                    stats.issuesByCategory[category] = issues.length;
                    stats.totalIssues += issues.length;
                    
                    issues.forEach(issue => {
                        stats.issuesByPriority[issue.priority]++;
                    });
                });
            }
            
            // 合格率の計算
            if (stats.testCoverage.totalTests > 0) {
                stats.testCoverage.passRate = Math.round(
                    (this.testResults.overall.passed / stats.testCoverage.totalTests) * 100
                );
            }
            
            this.testResults.statistics = stats;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STATISTICS_UPDATE_ERROR', {
                component: 'KeyboardAccessibilityReporter'
            });
        }
    }
    
    /**
     * 詳細レポートの生成
     */
    generateDetailedReport() {
        if (!this.config.generateDetailedReports) return null;
        
        try {
            const report = {
                metadata: {
                    title: 'キーボードアクセシビリティテスト報告書',
                    timestamp: this.testResults.timestamp || new Date().toISOString(),
                    version: '1.0',
                    generator: 'KeyboardAccessibilityReporter'
                },
                executive_summary: {
                    overall_score: this.testResults.overall.score,
                    level: this.testResults.overall.level,
                    total_issues: this.testResults.statistics.totalIssues,
                    critical_issues: this.testResults.statistics.issuesByPriority.critical,
                    pass_rate: this.testResults.statistics.testCoverage.passRate
                },
                detailed_results: {
                    suite_results: this.testResults.suiteResults,
                    categorized_issues: this.testResults.categorizedIssues,
                    statistics: this.testResults.statistics
                },
                recommendations: this.testResults.recommendations,
                appendix: {
                    test_configuration: this.config,
                    wcag_references: this.generateWCAGReferences()
                }
            };
            
            console.log('Detailed report generated successfully');
            return report;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'REPORT_GENERATION_ERROR', {
                component: 'KeyboardAccessibilityReporter'
            });
            return null;
        }
    }
    
    /**
     * WCAG参照情報の生成
     */
    generateWCAGReferences() {
        return {
            '2.1.1': 'Keyboard: すべての機能がキーボードから利用可能',
            '2.1.2': 'No Keyboard Trap: キーボードトラップの回避',
            '2.1.4': 'Character Key Shortcuts: 文字キーショートカット',
            '2.4.3': 'Focus Order: フォーカス順序',
            '2.4.7': 'Focus Visible: フォーカスの可視化',
            '4.1.2': 'Name, Role, Value: 名前、役割、値'
        };
    }
    
    /**
     * HTMLレポートの生成
     */
    generateHTMLReport() {
        const report = this.generateDetailedReport();
        if (!report) return null;
        
        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score { font-size: 2em; font-weight: bold; color: ${this.getScoreColor(report.executive_summary.overall_score)}; }
        .section { margin-bottom: 30px; }
        .issue { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .critical { border-left: 4px solid #d32f2f; }
        .high { border-left: 4px solid #ff9800; }
        .medium { border-left: 4px solid #ffc107; }
        .low { border-left: 4px solid #4caf50; }
        .recommendation { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.metadata.title}</h1>
        <p>生成日時: ${new Date(report.metadata.timestamp).toLocaleString('ja-JP')}</p>
        <div class="score">総合スコア: ${report.executive_summary.overall_score}/100 (${report.executive_summary.level})</div>
    </div>
    
    <div class="section">
        <h2>実行概要</h2>
        <p>合格率: ${report.executive_summary.pass_rate}%</p>
        <p>総問題数: ${report.executive_summary.total_issues}</p>
        <p>重要な問題: ${report.executive_summary.critical_issues}</p>
    </div>
    
    <div class="section">
        <h2>推奨事項</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.title} (優先度: ${rec.priority})</h3>
                <p>${rec.description}</p>
                ${rec.actions ? `<ul>${rec.actions.map(action => `<li>${action}</li>`).join('')}</ul>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
        
        return html;
    }
    
    /**
     * スコア色の取得
     */
    getScoreColor(score) {
        if (score >= 90) return '#4caf50';
        if (score >= 80) return '#8bc34a';
        if (score >= 70) return '#ffc107';
        if (score >= 60) return '#ff9800';
        return '#d32f2f';
    }
    
    /**
     * JSONレポートの生成
     */
    generateJSONReport() {
        return JSON.stringify(this.generateDetailedReport(), null, 2);
    }
    
    // パブリックAPI
    
    /**
     * 現在の結果の取得
     */
    getResults() {
        return this.testResults;
    }
    
    /**
     * 問題の取得（フィルタリング可能）
     */
    getIssues(filters = {}) {
        let issues = [];
        
        if (this.testResults.categorizedIssues) {
            Object.values(this.testResults.categorizedIssues).forEach(categoryIssues => {
                issues.push(...categoryIssues);
            });
        }
        
        // フィルタリング
        if (filters.priority) {
            issues = issues.filter(issue => issue.priority === filters.priority);
        }
        
        if (filters.category) {
            issues = issues.filter(issue => issue.category === filters.category);
        }
        
        return issues;
    }
    
    /**
     * 推奨事項の取得
     */
    getRecommendations(priority = null) {
        if (!priority) return this.testResults.recommendations;
        
        return this.testResults.recommendations.filter(rec => rec.priority === priority);
    }
    
    /**
     * 統計情報の取得
     */
    getStatistics() {
        return this.testResults.statistics;
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('KeyboardAccessibilityReporter configuration updated');
    }
    
    /**
     * 結果のクリア
     */
    clearResults() {
        this.testResults = {
            overall: {
                score: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                timestamp: null
            },
            suiteResults: {},
            issues: [],
            recommendations: [],
            statistics: {}
        };
        
        console.log('Test results cleared');
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying KeyboardAccessibilityReporter...');
        this.clearResults();
        console.log('KeyboardAccessibilityReporter destroyed');
    }
}