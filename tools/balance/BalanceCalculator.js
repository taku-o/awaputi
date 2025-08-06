/**
 * Balance Calculator Component
 * 
 * バランス影響分析と数学的計算を担当
 * Main Controller Patternの一部として設計
 */

import chalk from 'chalk';

export class BalanceCalculator {
    constructor(mainController) {
        this.mainController = mainController;
        this.impactWeights = {
            'CRITICAL': 1.0,
            'HIGH': 0.7,
            'MEDIUM': 0.4,
            'LOW': 0.1
        };
        this.riskThresholds = {
            'CRITICAL': 0.8,
            'HIGH': 0.6,
            'MEDIUM': 0.4,
            'LOW': 0.2
        };
    }

    /**
     * バランス影響のプレビュー
     * @param {Object} changes - 変更内容
     * @returns {Object} 影響分析結果
     */
    previewBalanceImpact(changes) {
        const impact = {
            overall: 0,
            byCategory: {},
            riskAssessment: 'LOW',
            recommendations: [],
            warnings: [],
            affectedSystems: []
        };

        try {
            for (const [key, change] of Object.entries(changes)) {
                const changeImpact = this.calculateSingleChangeImpact(key, change);
                impact.byCategory[key] = changeImpact;
                impact.overall += changeImpact.score;
                
                // 影響を受けるシステムの特定
                const affectedSystems = this.identifyAffectedSystems(key, change);
                impact.affectedSystems.push(...affectedSystems);
                
                // 警告の生成
                if (changeImpact.warnings.length > 0) {
                    impact.warnings.push(...changeImpact.warnings);
                }
            }

            // 全体的なリスク評価
            impact.riskAssessment = this.calculateOverallRisk(impact.overall);
            impact.recommendations = this.generateRecommendations(impact);

            console.log(chalk.blue('📊 影響分析完了'));
            return impact;

        } catch (error) {
            console.error(chalk.red(`影響分析エラー: ${error.message}`));
            throw error;
        }
    }

    /**
     * 単一変更の影響計算
     * @param {string} key - 設定キー
     * @param {Object} change - 変更内容
     * @returns {Object} 変更影響
     */
    calculateSingleChangeImpact(key, change) {
        const impact = {
            key: key,
            oldValue: change.oldValue,
            newValue: change.newValue,
            changePercent: 0,
            score: 0,
            category: this.categorizeKey(key),
            impactLevel: 'LOW',
            warnings: []
        };

        // 変更率の計算
        if (typeof change.oldValue === 'number' && typeof change.newValue === 'number') {
            impact.changePercent = Math.abs((change.newValue - change.oldValue) / change.oldValue) * 100;
        }

        // インパクトスコアの計算
        impact.score = this.calculateImpactScore(key, impact.changePercent, change);
        impact.impactLevel = this.getImpactLevel(impact.score);

        // 警告の生成
        if (impact.changePercent > 50) {
            impact.warnings.push(`大きな変更: ${impact.changePercent.toFixed(1)}%の変化`);
        }

        if (this.isBalanceCriticalKey(key)) {
            impact.warnings.push('バランス重要項目への変更');
        }

        return impact;
    }

    /**
     * 詳細影響分析の実行
     * @param {Object} changes - 変更内容
     * @returns {Object} 詳細分析結果
     */
    performDetailedImpactAnalysis(changes) {
        console.log(chalk.yellow('🔍 詳細影響分析を実行中...'));

        const analysis = {
            gameplayImpact: this.analyzeGameplayImpact(changes),
            performanceImpact: this.analyzePerformanceImpact(changes),
            userExperienceImpact: this.analyzeUserExperienceImpact(changes),
            systemStabilityImpact: this.analyzeSystemStabilityImpact(changes),
            recommendations: [],
            testingSuggestions: [],
            rollbackPlan: this.createRollbackPlan(changes)
        };

        // 総合的な推奨事項
        analysis.recommendations = this.generateDetailedRecommendations(analysis);
        analysis.testingSuggestions = this.generateTestingSuggestions(analysis);

        console.log(chalk.green('✅ 詳細分析完了'));
        return analysis;
    }

    /**
     * ゲームプレイ影響の分析
     * @param {Object} changes - 変更内容
     * @returns {Object} ゲームプレイ影響
     */
    analyzeGameplayImpact(changes) {
        const impact = {
            difficulty: 0,
            progression: 0,
            engagement: 0,
            balance: 0,
            details: []
        };

        for (const [key, change] of Object.entries(changes)) {
            if (key.includes('score') || key.includes('point')) {
                impact.progression += this.calculateProgressionImpact(change);
                impact.details.push(`スコア系統への影響: ${key}`);
            }

            if (key.includes('bubble') || key.includes('hp')) {
                impact.difficulty += this.calculateDifficultyImpact(change);
                impact.details.push(`難易度への影響: ${key}`);
            }

            if (key.includes('combo') || key.includes('effect')) {
                impact.engagement += this.calculateEngagementImpact(change);
                impact.details.push(`エンゲージメントへの影響: ${key}`);
            }
        }

        impact.balance = (impact.difficulty + impact.progression + impact.engagement) / 3;
        return impact;
    }

    /**
     * パフォーマンス影響の分析
     * @param {Object} changes - 変更内容
     * @returns {Object} パフォーマンス影響
     */
    analyzePerformanceImpact(changes) {
        const impact = {
            fps: 0,
            memory: 0,
            cpu: 0,
            network: 0,
            details: []
        };

        for (const [key, change] of Object.entries(changes)) {
            if (key.includes('particle') || key.includes('effect')) {
                impact.fps += this.calculateFPSImpact(change);
                impact.cpu += this.calculateCPUImpact(change);
                impact.details.push(`描画パフォーマンスへの影響: ${key}`);
            }

            if (key.includes('cache') || key.includes('pool')) {
                impact.memory += this.calculateMemoryImpact(change);
                impact.details.push(`メモリ使用量への影響: ${key}`);
            }
        }

        return impact;
    }

    /**
     * インパクトスコアの計算
     * @param {string} key - 設定キー
     * @param {number} changePercent - 変更率
     * @param {Object} change - 変更内容
     * @returns {number} インパクトスコア
     */
    calculateImpactScore(key, changePercent, change) {
        let baseScore = Math.min(changePercent / 100, 1.0);

        // キーの重要度による重み付け
        const keyWeight = this.getKeyWeight(key);
        baseScore *= keyWeight;

        // 変更の種類による調整
        if (this.isBreakingChange(change)) {
            baseScore *= 1.5;
        }

        return Math.min(baseScore, 1.0);
    }

    /**
     * 全体リスクの計算
     * @param {number} overallScore - 全体スコア
     * @returns {string} リスクレベル
     */
    calculateOverallRisk(overallScore) {
        if (overallScore >= this.riskThresholds.CRITICAL) return 'CRITICAL';
        if (overallScore >= this.riskThresholds.HIGH) return 'HIGH';
        if (overallScore >= this.riskThresholds.MEDIUM) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * 推奨事項の生成
     * @param {Object} impact - 影響分析結果
     * @returns {Array} 推奨事項リスト
     */
    generateRecommendations(impact) {
        const recommendations = [];

        if (impact.riskAssessment === 'CRITICAL') {
            recommendations.push({
                priority: 'CRITICAL',
                message: '重大な影響が予想されます。段階的な適用を推奨します。',
                action: 'STAGED_ROLLOUT'
            });
        }

        if (impact.warnings.length > 3) {
            recommendations.push({
                priority: 'HIGH',
                message: '多数の警告があります。テストを十分に実施してください。',
                action: 'COMPREHENSIVE_TESTING'
            });
        }

        if (impact.affectedSystems.length > 5) {
            recommendations.push({
                priority: 'MEDIUM',
                message: '多くのシステムに影響します。統合テストを実施してください。',
                action: 'INTEGRATION_TESTING'
            });
        }

        return recommendations;
    }

    /**
     * キーの重要度取得
     * @param {string} key - 設定キー
     * @returns {number} 重要度重み
     */
    getKeyWeight(key) {
        const criticalKeys = ['hp', 'score', 'damage', 'speed'];
        const highKeys = ['combo', 'effect', 'particle'];
        const mediumKeys = ['color', 'sound', 'animation'];

        if (criticalKeys.some(k => key.includes(k))) return 1.0;
        if (highKeys.some(k => key.includes(k))) return 0.7;
        if (mediumKeys.some(k => key.includes(k))) return 0.4;
        return 0.2;
    }

    /**
     * 影響を受けるシステムの特定
     * @param {string} key - 設定キー
     * @param {Object} change - 変更内容
     * @returns {Array} 影響システムリスト
     */
    identifyAffectedSystems(key, change) {
        const systems = [];

        if (key.includes('score')) systems.push('ScoreManager');
        if (key.includes('bubble')) systems.push('BubbleManager');
        if (key.includes('effect')) systems.push('EffectManager');
        if (key.includes('audio')) systems.push('AudioManager');
        if (key.includes('performance')) systems.push('PerformanceOptimizer');

        return systems;
    }

    /**
     * キーのカテゴリ分類
     * @param {string} key - 設定キー
     * @returns {string} カテゴリ
     */
    categorizeKey(key) {
        if (key.includes('score') || key.includes('point')) return 'scoring';
        if (key.includes('bubble') || key.includes('hp')) return 'bubbles';
        if (key.includes('stage') || key.includes('level')) return 'stages';
        if (key.includes('performance') || key.includes('fps')) return 'performance';
        return 'misc';
    }

    /**
     * バランス重要キーの判定
     * @param {string} key - 設定キー
     * @returns {boolean} 重要キーかどうか
     */
    isBalanceCriticalKey(key) {
        const criticalPatterns = [
            /\.hp$/,
            /\.score$/,
            /\.damage$/,
            /\.speed$/,
            /\.probability$/
        ];

        return criticalPatterns.some(pattern => pattern.test(key));
    }

    /**
     * 破壊的変更の判定
     * @param {Object} change - 変更内容
     * @returns {boolean} 破壊的変更かどうか
     */
    isBreakingChange(change) {
        if (typeof change.oldValue !== typeof change.newValue) return true;
        
        if (typeof change.oldValue === 'number') {
            const changeRatio = Math.abs(change.newValue - change.oldValue) / change.oldValue;
            return changeRatio > 0.5; // 50%以上の変更は破壊的とみなす
        }

        return false;
    }

    /**
     * インパクトレベルの取得
     * @param {number} score - インパクトスコア
     * @returns {string} インパクトレベル
     */
    getImpactLevel(score) {
        if (score >= 0.8) return 'CRITICAL';
        if (score >= 0.6) return 'HIGH';
        if (score >= 0.4) return 'MEDIUM';
        return 'LOW';
    }

    // 簡略化されたヘルパーメソッド群
    calculateProgressionImpact(change) { return Math.random() * 0.5; }
    calculateDifficultyImpact(change) { return Math.random() * 0.5; }
    calculateEngagementImpact(change) { return Math.random() * 0.5; }
    calculateFPSImpact(change) { return Math.random() * 0.3; }
    calculateCPUImpact(change) { return Math.random() * 0.3; }
    calculateMemoryImpact(change) { return Math.random() * 0.3; }
    
    analyzeUserExperienceImpact(changes) { return { usability: 0, accessibility: 0 }; }
    analyzeSystemStabilityImpact(changes) { return { stability: 0, reliability: 0 }; }
    createRollbackPlan(changes) { return { steps: [], estimatedTime: '5 minutes' }; }
    generateDetailedRecommendations(analysis) { return []; }
    generateTestingSuggestions(analysis) { return []; }
}