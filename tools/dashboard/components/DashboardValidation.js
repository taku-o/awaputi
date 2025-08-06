/**
 * Dashboard Validation Component
 * 
 * 設定の検証と影響分析を担当
 * Main Controller Patternの一部として設計
 */

export class DashboardValidation {
    constructor(mainController) {
        this.mainController = mainController;
        this.validationStatus = {
            consistency: 'pending',
            balance: 'pending',
            type: 'pending'
        };
        this.validationResults = {};
    }

    /**
     * 検証ステータスの更新
     */
    async updateValidationStatus() {
        const configData = this.mainController.dataManager.configData;
        if (!configData) return;

        // 整合性チェック
        this.validationStatus.consistency = await this.validateConsistency(configData);
        
        // バランスチェック
        this.validationStatus.balance = await this.validateBalance(configData);
        
        // 型チェック
        this.validationStatus.type = await this.validateTypes(configData);
        
        return this.validationStatus;
    }

    /**
     * 整合性の検証
     */
    async validateConsistency(configData) {
        const errors = [];
        
        // スコア設定の整合性チェック
        if (configData.scoring) {
            if (configData.scoring.comboMultiplier < 1) {
                errors.push('コンボ倍率は1以上である必要があります');
            }
            if (configData.scoring.maxCombo < 10) {
                errors.push('最大コンボ数は10以上である必要があります');
            }
        }

        // バブル設定の整合性チェック
        if (configData.bubbles) {
            const totalWeight = Object.values(configData.bubbles.types || {})
                .reduce((sum, type) => sum + (type.weight || 0), 0);
            
            if (Math.abs(totalWeight - 100) > 0.1) {
                errors.push(`バブルタイプの重み合計が100%ではありません: ${totalWeight}%`);
            }
            
            if (configData.bubbles.maxBubbles < 1) {
                errors.push('最大バブル数は1以上である必要があります');
            }
        }

        // ステージ設定の整合性チェック
        if (configData.stages && configData.stages.unlockRequirements) {
            const requirements = configData.stages.unlockRequirements;
            let previousScore = 0;
            
            for (const [stage, req] of Object.entries(requirements)) {
                if (req.minScore <= previousScore) {
                    errors.push(`${stage}の解放スコアが前のステージ以下です`);
                }
                previousScore = req.minScore;
            }
        }

        this.validationResults.consistency = errors;
        return errors.length === 0 ? 'valid' : 'error';
    }

    /**
     * バランスの検証
     */
    async validateBalance(configData) {
        const warnings = [];
        
        // スコアバランスのチェック
        if (configData.scoring) {
            const baseScore = configData.scoring.baseScore || 10;
            const timeBonus = configData.scoring.timeBonus || 100;
            
            if (timeBonus > baseScore * 20) {
                warnings.push('タイムボーナスが基本スコアに対して高すぎる可能性があります');
            }
        }

        // バブルバランスのチェック
        if (configData.bubbles) {
            const spawnRate = configData.bubbles.spawnRate || 1000;
            const maxBubbles = configData.bubbles.maxBubbles || 30;
            
            if (spawnRate < 500 && maxBubbles > 50) {
                warnings.push('スポーン率が高く、最大バブル数も多いため、パフォーマンスに影響する可能性があります');
            }
        }

        // パフォーマンス設定のチェック
        if (configData.performance) {
            const particleLimit = configData.performance.particleLimit || 1000;
            const targetFPS = configData.performance.targetFPS || 60;
            
            if (particleLimit > 2000 && targetFPS >= 60) {
                warnings.push('パーティクル数が多く、高FPSを維持するのが困難な可能性があります');
            }
        }

        this.validationResults.balance = warnings;
        return warnings.length === 0 ? 'valid' : 'warning';
    }

    /**
     * 型の検証
     */
    async validateTypes(configData) {
        const errors = [];
        
        const validateType = (value, expectedType, path) => {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            
            if (actualType !== expectedType) {
                errors.push(`${path}: 期待される型 ${expectedType}, 実際の型 ${actualType}`);
            }
        };

        // 型定義
        const typeDefinitions = {
            'scoring.baseScore': 'number',
            'scoring.comboMultiplier': 'number',
            'scoring.timeBonus': 'number',
            'scoring.perfectBonus': 'number',
            'scoring.chainBonus': 'number',
            'scoring.maxCombo': 'number',
            'bubbles.normalSize': 'number',
            'bubbles.specialSize': 'number',
            'bubbles.bossSize': 'number',
            'bubbles.spawnRate': 'number',
            'bubbles.maxBubbles': 'number',
            'stages.totalStages': 'number',
            'stages.difficultyProgression': 'string',
            'performance.targetFPS': 'number',
            'performance.particleLimit': 'number',
            'performance.autoQuality': 'boolean',
            'performance.renderScale': 'number'
        };

        // 型チェックの実行
        for (const [path, expectedType] of Object.entries(typeDefinitions)) {
            const value = this.getValueByPath(configData, path);
            if (value !== undefined) {
                validateType(value, expectedType, path);
            }
        }

        this.validationResults.type = errors;
        return errors.length === 0 ? 'valid' : 'error';
    }

    /**
     * 影響分析の実行
     */
    async analyzeImpact() {
        const configData = this.mainController.dataManager.configData;
        if (!configData) return null;

        const analysis = {
            timestamp: new Date(),
            impacts: [],
            recommendations: []
        };

        // スコアシステムへの影響
        if (configData.scoring) {
            const scoreImpact = this.analyzeScoreImpact(configData.scoring);
            if (scoreImpact) analysis.impacts.push(scoreImpact);
        }

        // ゲームプレイへの影響
        if (configData.bubbles) {
            const gameplayImpact = this.analyzeGameplayImpact(configData.bubbles);
            if (gameplayImpact) analysis.impacts.push(gameplayImpact);
        }

        // パフォーマンスへの影響
        if (configData.performance) {
            const performanceImpact = this.analyzePerformanceImpact(configData.performance);
            if (performanceImpact) analysis.impacts.push(performanceImpact);
        }

        // 推奨事項の生成
        analysis.recommendations = this.generateRecommendations(analysis.impacts);

        return analysis;
    }

    /**
     * スコアへの影響分析
     */
    analyzeScoreImpact(scoringConfig) {
        const baseScore = scoringConfig.baseScore || 10;
        const comboMultiplier = scoringConfig.comboMultiplier || 1.5;
        const maxCombo = scoringConfig.maxCombo || 100;
        
        const maxPossibleScore = baseScore * Math.pow(comboMultiplier, maxCombo);
        
        return {
            category: 'スコアシステム',
            severity: maxPossibleScore > 1000000 ? 'high' : 'medium',
            description: `最大理論スコア: ${Math.floor(maxPossibleScore).toLocaleString()}`,
            details: [
                `基本スコア: ${baseScore}`,
                `コンボ倍率: ${comboMultiplier}x`,
                `最大コンボ: ${maxCombo}`
            ]
        };
    }

    /**
     * ゲームプレイへの影響分析
     */
    analyzeGameplayImpact(bubblesConfig) {
        const spawnRate = bubblesConfig.spawnRate || 1000;
        const maxBubbles = bubblesConfig.maxBubbles || 30;
        const bubbleTypes = Object.keys(bubblesConfig.types || {}).length;
        
        const difficulty = (1000 / spawnRate) * maxBubbles * bubbleTypes;
        
        return {
            category: 'ゲームプレイ',
            severity: difficulty > 100 ? 'high' : 'medium',
            description: `難易度指数: ${difficulty.toFixed(2)}`,
            details: [
                `スポーン間隔: ${spawnRate}ms`,
                `最大バブル数: ${maxBubbles}`,
                `バブル種類: ${bubbleTypes}種`
            ]
        };
    }

    /**
     * パフォーマンスへの影響分析
     */
    analyzePerformanceImpact(performanceConfig) {
        const targetFPS = performanceConfig.targetFPS || 60;
        const particleLimit = performanceConfig.particleLimit || 1000;
        const renderScale = performanceConfig.renderScale || 1.0;
        
        const load = (particleLimit / 1000) * (targetFPS / 30) * renderScale;
        
        return {
            category: 'パフォーマンス',
            severity: load > 4 ? 'high' : 'medium',
            description: `負荷指数: ${load.toFixed(2)}`,
            details: [
                `目標FPS: ${targetFPS}`,
                `パーティクル上限: ${particleLimit}`,
                `レンダースケール: ${renderScale}`
            ]
        };
    }

    /**
     * 推奨事項の生成
     */
    generateRecommendations(impacts) {
        const recommendations = [];
        
        impacts.forEach(impact => {
            if (impact.severity === 'high') {
                switch (impact.category) {
                    case 'スコアシステム':
                        recommendations.push({
                            category: impact.category,
                            priority: 'high',
                            message: 'スコアの増加率が高すぎる可能性があります。コンボ倍率または最大コンボ数の調整を検討してください。'
                        });
                        break;
                    
                    case 'ゲームプレイ':
                        recommendations.push({
                            category: impact.category,
                            priority: 'high',
                            message: 'ゲームの難易度が高すぎる可能性があります。スポーン率または最大バブル数の調整を検討してください。'
                        });
                        break;
                    
                    case 'パフォーマンス':
                        recommendations.push({
                            category: impact.category,
                            priority: 'high',
                            message: 'パフォーマンスへの負荷が高い設定です。パーティクル数の削減または目標FPSの調整を検討してください。'
                        });
                        break;
                }
            }
        });
        
        return recommendations;
    }

    /**
     * 設定比較
     */
    compareConfigurations(config1, config2) {
        const differences = [];
        
        const compareRecursive = (obj1, obj2, path = '') => {
            const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
            
            for (const key of allKeys) {
                const newPath = path ? `${path}.${key}` : key;
                const value1 = obj1?.[key];
                const value2 = obj2?.[key];
                
                if (typeof value1 === 'object' && typeof value2 === 'object' && 
                    value1 !== null && value2 !== null && !Array.isArray(value1)) {
                    compareRecursive(value1, value2, newPath);
                } else if (value1 !== value2) {
                    differences.push({
                        path: newPath,
                        oldValue: value1,
                        newValue: value2,
                        type: value1 === undefined ? 'added' : value2 === undefined ? 'removed' : 'changed'
                    });
                }
            }
        };
        
        compareRecursive(config1, config2);
        return differences;
    }

    /**
     * 検証レポートの生成
     */
    generateValidationReport() {
        return {
            timestamp: new Date(),
            status: this.validationStatus,
            results: this.validationResults,
            summary: {
                totalErrors: (this.validationResults.consistency?.length || 0) + 
                           (this.validationResults.type?.length || 0),
                totalWarnings: this.validationResults.balance?.length || 0,
                overallStatus: this.getOverallStatus()
            }
        };
    }

    /**
     * 全体ステータスの取得
     */
    getOverallStatus() {
        if (this.validationStatus.consistency === 'error' || 
            this.validationStatus.type === 'error') {
            return 'error';
        }
        if (this.validationStatus.balance === 'warning') {
            return 'warning';
        }
        return 'valid';
    }

    /**
     * 整合性ステータスの取得
     */
    getConsistencyStatus() {
        return this.validationStatus.consistency;
    }

    /**
     * パスによる値の取得
     */
    getValueByPath(obj, path) {
        return path.split('.').reduce((curr, key) => curr?.[key], obj);
    }

    /**
     * ステータス取得
     */
    getStatus() {
        return {
            validationStatus: this.validationStatus,
            hasErrors: this.getOverallStatus() === 'error',
            hasWarnings: this.getOverallStatus() === 'warning',
            lastValidation: new Date()
        };
    }
}