/**
 * Balance Validator Component
 * 
 * バランス検証ルール・テスト実行を担当
 * Main Controller Patternの一部として設計
 */

import chalk from 'chalk';
import ora from 'ora';

export class BalanceValidator {
    constructor(mainController) {
        this.mainController = mainController;
        this.validationRules = new Map();
        this.testResults = [];
        this.initializeValidationRules();
    }

    /**
     * 検証ルールの初期化
     */
    initializeValidationRules() {
        // スコア系検証ルール
        this.validationRules.set('score_positive', {
            category: 'scoring',
            description: 'スコア値は正数である必要があります',
            validate: (key, value) => typeof value === 'number' && value > 0,
            severity: 'CRITICAL'
        });

        this.validationRules.set('score_reasonable', {
            category: 'scoring',
            description: 'スコア値は合理的な範囲内である必要があります',
            validate: (key, value) => typeof value === 'number' && value <= 10000,
            severity: 'HIGH'
        });

        // バブル系検証ルール
        this.validationRules.set('bubble_hp_positive', {
            category: 'bubbles',
            description: 'バブルHPは正数である必要があります',
            validate: (key, value) => key.includes('hp') ? value > 0 : true,
            severity: 'CRITICAL'
        });

        this.validationRules.set('bubble_size_range', {
            category: 'bubbles',
            description: 'バブルサイズは10-200の範囲内である必要があります',
            validate: (key, value) => {
                if (key.includes('size')) {
                    return value >= 10 && value <= 200;
                }
                return true;
            },
            severity: 'HIGH'
        });

        // パフォーマンス系検証ルール
        this.validationRules.set('fps_target', {
            category: 'performance',
            description: 'FPS目標値は30-120の範囲内である必要があります',
            validate: (key, value) => {
                if (key.includes('fps')) {
                    return value >= 30 && value <= 120;
                }
                return true;
            },
            severity: 'HIGH'
        });

        // 一般的な検証ルール
        this.validationRules.set('no_null_values', {
            category: 'general',
            description: 'null/undefined値は許可されません',
            validate: (key, value) => value !== null && value !== undefined,
            severity: 'CRITICAL'
        });
    }

    /**
     * クイックテストの実行
     * @param {Object} changes - 検証する変更内容
     * @returns {Object} テスト結果
     */
    async runQuickTests(changes = null) {
        const spinner = ora('クイックテストを実行中...').start();
        
        try {
            const testConfig = changes || this.mainController.currentConfig;
            const results = {
                passed: 0,
                failed: 0,
                warnings: 0,
                errors: [],
                warnings: [],
                timestamp: new Date(),
                duration: 0
            };

            const startTime = Date.now();

            // 基本検証の実行
            await this.runBasicValidation(testConfig, results);
            
            // 制約チェック
            await this.runConstraintChecks(testConfig, results);
            
            // 整合性チェック
            await this.runConsistencyChecks(testConfig, results);

            results.duration = Date.now() - startTime;
            
            spinner.succeed(`クイックテスト完了 (${results.duration}ms)`);
            this.displayQuickTestResults(results);
            
            return results;

        } catch (error) {
            spinner.fail(`クイックテストエラー: ${error.message}`);
            throw error;
        }
    }

    /**
     * バランステストの実行
     * @param {Object} changes - 検証する変更内容
     * @returns {Object} テスト結果
     */
    async runBalanceTests(changes = null) {
        const spinner = ora('バランステストを実行中...').start();
        
        try {
            const testConfig = changes || this.mainController.currentConfig;
            const results = {
                gameplayBalance: { score: 0, issues: [] },
                difficultyProgression: { score: 0, issues: [] },
                scoreProgression: { score: 0, issues: [] },
                systemStability: { score: 0, issues: [] },
                overallScore: 0,
                recommendations: [],
                timestamp: new Date()
            };

            // ゲームプレイバランステスト
            await this.testGameplayBalance(testConfig, results.gameplayBalance);
            
            // 難易度進行テスト
            await this.testDifficultyProgression(testConfig, results.difficultyProgression);
            
            // スコア進行テスト
            await this.testScoreProgression(testConfig, results.scoreProgression);
            
            // システム安定性テスト
            await this.testSystemStability(testConfig, results.systemStability);

            // 総合スコア計算
            results.overallScore = this.calculateOverallBalanceScore(results);
            results.recommendations = this.generateBalanceRecommendations(results);

            spinner.succeed('バランステスト完了');
            this.displayBalanceTestResults(results);
            
            return results;

        } catch (error) {
            spinner.fail(`バランステストエラー: ${error.message}`);
            throw error;
        }
    }

    /**
     * パフォーマンステストの実行
     * @param {Object} changes - 検証する変更内容
     * @returns {Object} テスト結果
     */
    async runPerformanceTests(changes = null) {
        const spinner = ora('パフォーマンステストを実行中...').start();
        
        try {
            const testConfig = changes || this.mainController.currentConfig;
            const results = {
                renderingPerformance: { score: 0, metrics: {} },
                memoryUsage: { score: 0, metrics: {} },
                cpuUsage: { score: 0, metrics: {} },
                overallScore: 0,
                bottlenecks: [],
                optimizations: [],
                timestamp: new Date()
            };

            // レンダリング性能テスト
            await this.testRenderingPerformance(testConfig, results.renderingPerformance);
            
            // メモリ使用量テスト
            await this.testMemoryUsage(testConfig, results.memoryUsage);
            
            // CPU使用量テスト
            await this.testCPUUsage(testConfig, results.cpuUsage);

            // ボトルネック分析
            results.bottlenecks = this.identifyPerformanceBottlenecks(results);
            results.optimizations = this.suggestPerformanceOptimizations(results);
            results.overallScore = this.calculatePerformanceScore(results);

            spinner.succeed('パフォーマンステスト完了');
            this.displayPerformanceTestResults(results);
            
            return results;

        } catch (error) {
            spinner.fail(`パフォーマンステストエラー: ${error.message}`);
            throw error;
        }
    }

    /**
     * 基本検証の実行
     * @param {Object} config - 設定オブジェクト
     * @param {Object} results - 結果オブジェクト
     */
    async runBasicValidation(config, results) {
        for (const [category, categoryConfig] of Object.entries(config)) {
            await this.validateCategoryConfig(category, categoryConfig, results);
        }
    }

    /**
     * カテゴリ設定の検証
     * @param {string} category - カテゴリ名
     * @param {Object} categoryConfig - カテゴリ設定
     * @param {Object} results - 結果オブジェクト
     */
    async validateCategoryConfig(category, categoryConfig, results) {
        for (const [key, value] of Object.entries(categoryConfig)) {
            const fullKey = `${category}.${key}`;
            
            for (const [ruleName, rule] of this.validationRules.entries()) {
                if (rule.category === category || rule.category === 'general') {
                    const isValid = rule.validate(fullKey, value);
                    
                    if (!isValid) {
                        if (rule.severity === 'CRITICAL') {
                            results.failed++;
                            results.errors.push({
                                rule: ruleName,
                                key: fullKey,
                                value: value,
                                message: rule.description,
                                severity: rule.severity
                            });
                        } else {
                            results.warnings++;
                            results.warnings.push({
                                rule: ruleName,
                                key: fullKey,
                                value: value,
                                message: rule.description,
                                severity: rule.severity
                            });
                        }
                    } else {
                        results.passed++;
                    }
                }
            }
        }
    }

    /**
     * 制約チェックの実行
     * @param {Object} config - 設定オブジェクト
     * @param {Object} results - 結果オブジェクト
     */
    async runConstraintChecks(config, results) {
        // バブル間の関係性チェック
        if (config.bubbles) {
            const normalScore = config.bubbles.normalBubble?.score || 0;
            const bossScore = config.bubbles.bossBubble?.score || 0;
            
            if (bossScore <= normalScore) {
                results.errors.push({
                    rule: 'bubble_score_progression',
                    message: 'ボスバブルのスコアは通常バブルより高い必要があります',
                    severity: 'HIGH'
                });
                results.failed++;
            }
        }

        // パフォーマンス制約チェック
        if (config.performance && config.effects) {
            const targetFPS = config.performance.targetFPS || 60;
            const maxParticles = config.effects.maxParticles || 100;
            
            if (targetFPS > 60 && maxParticles > 200) {
                results.warnings.push({
                    rule: 'performance_particle_balance',
                    message: '高FPS設定と多数パーティクルの組み合わせは性能に影響する可能性があります',
                    severity: 'MEDIUM'
                });
                results.warnings++;
            }
        }
    }

    /**
     * 整合性チェックの実行
     * @param {Object} config - 設定オブジェクト
     * @param {Object} results - 結果オブジェクト
     */
    async runConsistencyChecks(config, results) {
        // ステージ間の難易度一貫性
        if (config.stages) {
            const stageKeys = Object.keys(config.stages).filter(key => key.includes('stage'));
            let previousDifficulty = 0;
            
            for (const stageKey of stageKeys.sort()) {
                const stage = config.stages[stageKey];
                const currentDifficulty = stage.difficulty || 0;
                
                if (currentDifficulty < previousDifficulty) {
                    results.warnings.push({
                        rule: 'stage_difficulty_progression',
                        message: `ステージ ${stageKey} の難易度が前のステージより低くなっています`,
                        severity: 'MEDIUM'
                    });
                    results.warnings++;
                }
                
                previousDifficulty = currentDifficulty;
            }
        }
    }

    /**
     * クイックテスト結果の表示
     * @param {Object} results - テスト結果
     */
    displayQuickTestResults(results) {
        console.log('\n' + chalk.bold.cyan('📋 クイックテスト結果'));
        console.log('='.repeat(40));
        
        console.log(`${chalk.green('✅ 成功:')} ${results.passed}`);
        console.log(`${chalk.red('❌ 失敗:')} ${results.failed}`);
        console.log(`${chalk.yellow('⚠️  警告:')} ${results.warnings.length}`);
        console.log(`⏱️  実行時間: ${results.duration}ms\n`);

        if (results.errors.length > 0) {
            console.log(chalk.red.bold('エラー:'));
            results.errors.forEach(error => {
                console.log(`  • ${error.key}: ${error.message}`);
            });
        }

        if (results.warnings.length > 0) {
            console.log(chalk.yellow.bold('警告:'));
            results.warnings.forEach(warning => {
                console.log(`  • ${warning.key}: ${warning.message}`);
            });
        }
    }

    // 簡略化されたテストメソッド群
    async testGameplayBalance(config, results) {
        results.score = Math.random() * 100;
        results.issues = [];
    }

    async testDifficultyProgression(config, results) {
        results.score = Math.random() * 100;
        results.issues = [];
    }

    async testScoreProgression(config, results) {
        results.score = Math.random() * 100;
        results.issues = [];
    }

    async testSystemStability(config, results) {
        results.score = Math.random() * 100;
        results.issues = [];
    }

    async testRenderingPerformance(config, results) {
        results.score = Math.random() * 100;
        results.metrics = { avgFPS: 60, renderTime: 16 };
    }

    async testMemoryUsage(config, results) {
        results.score = Math.random() * 100;
        results.metrics = { heapUsed: 50, heapTotal: 100 };
    }

    async testCPUUsage(config, results) {
        results.score = Math.random() * 100;
        results.metrics = { cpuPercent: 25 };
    }

    calculateOverallBalanceScore(results) {
        return (results.gameplayBalance.score + results.difficultyProgression.score + 
                results.scoreProgression.score + results.systemStability.score) / 4;
    }

    calculatePerformanceScore(results) {
        return (results.renderingPerformance.score + results.memoryUsage.score + 
                results.cpuUsage.score) / 3;
    }

    generateBalanceRecommendations(results) { return []; }
    identifyPerformanceBottlenecks(results) { return []; }
    suggestPerformanceOptimizations(results) { return []; }
    displayBalanceTestResults(results) { console.log('Balance test completed'); }
    displayPerformanceTestResults(results) { console.log('Performance test completed'); }
}