/**
 * バランス設定検証システム - BalanceConfigurationValidator
 * 
 * ゲームバランス設定値の妥当性を検証し、
 * 論理的整合性とゲームプレイの品質を保証します。
 */

import { getErrorHandler } from './ErrorHandler.js';

export class BalanceConfigurationValidator {
    constructor() {
        this.errorHandler = getErrorHandler();
        
        // 検証ルール定義
        this.validationRules = new Map();
        
        // 検証履歴
        this.validationHistory = [];
        
        // エラー統計
        this.errorStats = {
            totalValidations: 0,
            failedValidations: 0,
            errorsByType: new Map(),
            errorsByBubbleType: new Map()
        };
        
        // 検証ルールを初期化
        this._initializeValidationRules();
        
        console.log('[BalanceConfigurationValidator] 初期化完了');
    }
    
    /**
     * 検証ルールを初期化
     * @private
     */
    _initializeValidationRules() {
        // 泡設定の検証ルール
        this._initializeBubbleValidationRules();
        
        // スコア設定の検証ルール
        this._initializeScoreValidationRules();
        
        // ステージ設定の検証ルール
        this._initializeStageValidationRules();
        
        // アイテム設定の検証ルール
        this._initializeItemValidationRules();
    }
    
    /**
     * 泡設定の検証ルールを初期化
     * @private
     */
    _initializeBubbleValidationRules() {
        // 基本的な数値範囲
        this.validationRules.set('bubble.health', {
            type: 'number',
            min: 1,
            max: 20,
            description: 'Bubble health must be between 1 and 20',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.size', {
            type: 'number',
            min: 20,
            max: 150,
            description: 'Bubble size must be between 20 and 150 pixels',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.maxAge', {
            type: 'number',
            min: 3000,
            max: 60000,
            description: 'Bubble max age must be between 3 and 60 seconds',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.score', {
            type: 'number',
            min: 1,
            max: 2000,
            description: 'Bubble score must be between 1 and 2000',
            category: 'bubble'
        });
        
        // 特殊効果の検証ルール
        this.validationRules.set('bubble.healAmount', {
            type: 'number',
            min: 5,
            max: 100,
            description: 'Heal amount must be between 5 and 100',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.damageAmount', {
            type: 'number',
            min: 1,
            max: 50,
            description: 'Damage amount must be between 1 and 50',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.shakeIntensity', {
            type: 'number',
            min: 5,
            max: 50,
            description: 'Shake intensity must be between 5 and 50',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.disableDuration', {
            type: 'number',
            min: 500,
            max: 5000,
            description: 'Disable duration must be between 0.5 and 5 seconds',
            category: 'bubble'
        });
        
        this.validationRules.set('bubble.bonusTimeMs', {
            type: 'number',
            min: 2000,
            max: 15000,
            description: 'Bonus time must be between 2 and 15 seconds',
            category: 'bubble'
        });
    }
    
    /**
     * スコア設定の検証ルールを初期化
     * @private
     */
    _initializeScoreValidationRules() {
        this.validationRules.set('score.baseScore', {
            type: 'number',
            min: 1,
            max: 2000,
            description: 'Base score must be between 1 and 2000',
            category: 'score'
        });
        
        this.validationRules.set('score.comboMultiplier', {
            type: 'number',
            min: 1.0,
            max: 10.0,
            description: 'Combo multiplier must be between 1.0 and 10.0',
            category: 'score'
        });
        
        this.validationRules.set('score.ageBonus', {
            type: 'number',
            min: 1.0,
            max: 5.0,
            description: 'Age bonus must be between 1.0 and 5.0',
            category: 'score'
        });
    }
    
    /**
     * ステージ設定の検証ルールを初期化
     * @private
     */
    _initializeStageValidationRules() {
        this.validationRules.set('stage.spawnRate', {
            type: 'number',
            min: 0.1,
            max: 10.0,
            description: 'Spawn rate must be between 0.1 and 10.0',
            category: 'stage'
        });
        
        this.validationRules.set('stage.maxBubbles', {
            type: 'number',
            min: 5,
            max: 100,
            description: 'Max bubbles must be between 5 and 100',
            category: 'stage'
        });
        
        this.validationRules.set('stage.unlockRequirement', {
            type: 'number',
            min: 0,
            max: 100000,
            description: 'Unlock requirement must be between 0 and 100000',
            category: 'stage'
        });
    }
    
    /**
     * アイテム設定の検証ルールを初期化
     * @private
     */
    _initializeItemValidationRules() {
        this.validationRules.set('item.baseCost', {
            type: 'number',
            min: 10,
            max: 1000,
            description: 'Item base cost must be between 10 and 1000',
            category: 'item'
        });
        
        this.validationRules.set('item.costMultiplier', {
            type: 'number',
            min: 1.0,
            max: 3.0,
            description: 'Cost multiplier must be between 1.0 and 3.0',
            category: 'item'
        });
        
        this.validationRules.set('item.maxLevel', {
            type: 'number',
            min: 1,
            max: 10,
            description: 'Max level must be between 1 and 10',
            category: 'item'
        });
    }
    
    /**
     * 泡設定を検証
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} config - 泡設定
     * @returns {Object} 検証結果
     */
    validateBubbleConfig(bubbleType, config) {
        const validationId = `bubble_${bubbleType}_${Date.now()}`;
        const startTime = Date.now();
        
        try {
            this.errorStats.totalValidations++;
            
            const errors = [];
            const warnings = [];
            
            // 基本プロパティの検証
            if (config.health !== undefined) {
                const healthValidation = this._validateProperty('bubble.health', config.health);
                if (!healthValidation.isValid) {
                    errors.push({
                        property: 'health',
                        value: config.health,
                        error: healthValidation.error,
                        rule: 'bubble.health'
                    });
                }
            }
            
            if (config.size !== undefined) {
                const sizeValidation = this._validateProperty('bubble.size', config.size);
                if (!sizeValidation.isValid) {
                    errors.push({
                        property: 'size',
                        value: config.size,
                        error: sizeValidation.error,
                        rule: 'bubble.size'
                    });
                }
            }
            
            if (config.maxAge !== undefined) {
                const maxAgeValidation = this._validateProperty('bubble.maxAge', config.maxAge);
                if (!maxAgeValidation.isValid) {
                    errors.push({
                        property: 'maxAge',
                        value: config.maxAge,
                        error: maxAgeValidation.error,
                        rule: 'bubble.maxAge'
                    });
                }
            }
            
            if (config.score !== undefined) {
                const scoreValidation = this._validateProperty('bubble.score', config.score);
                if (!scoreValidation.isValid) {
                    errors.push({
                        property: 'score',
                        value: config.score,
                        error: scoreValidation.error,
                        rule: 'bubble.score'
                    });
                }
            }
            
            // 特殊効果の検証
            const specialEffectErrors = this._validateSpecialEffects(bubbleType, config);
            errors.push(...specialEffectErrors);
            
            // 論理的整合性の検証
            const logicalValidation = this._validateBubbleLogicalConsistency(bubbleType, config);
            errors.push(...logicalValidation.errors);
            warnings.push(...logicalValidation.warnings);
            
            // 結果を記録
            const result = {
                validationId,
                bubbleType,
                isValid: errors.length === 0,
                errors,
                warnings,
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
            
            // 統計を更新
            if (!result.isValid) {
                this.errorStats.failedValidations++;
                this._updateErrorStats(bubbleType, errors);
            }
            
            // 履歴に記録
            this.validationHistory.push(result);
            this._cleanupHistory();
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_ERROR', {
                context: 'BalanceConfigurationValidator.validateBubbleConfig',
                bubbleType,
                config
            });
            
            return {
                validationId,
                bubbleType,
                isValid: false,
                errors: [{ error: 'Validation failed due to internal error', details: error.message }],
                warnings: [],
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * スコア設定を検証
     * @param {Object} scoreConfig - スコア設定
     * @returns {Object} 検証結果
     */
    validateScoreConfig(scoreConfig) {
        const validationId = `score_${Date.now()}`;
        const startTime = Date.now();
        
        try {
            this.errorStats.totalValidations++;
            
            const errors = [];
            const warnings = [];
            
            // 基本スコアの検証
            if (scoreConfig.baseScores) {
                for (const [bubbleType, baseScore] of Object.entries(scoreConfig.baseScores)) {
                    const validation = this._validateProperty('score.baseScore', baseScore);
                    if (!validation.isValid) {
                        errors.push({
                            property: `baseScores.${bubbleType}`,
                            value: baseScore,
                            error: validation.error,
                            rule: 'score.baseScore'
                        });
                    }
                }
            }
            
            // コンボ設定の検証
            if (scoreConfig.combo) {
                if (scoreConfig.combo.maxMultiplier !== undefined) {
                    const validation = this._validateProperty('score.comboMultiplier', scoreConfig.combo.maxMultiplier);
                    if (!validation.isValid) {
                        errors.push({
                            property: 'combo.maxMultiplier',
                            value: scoreConfig.combo.maxMultiplier,
                            error: validation.error,
                            rule: 'score.comboMultiplier'
                        });
                    }
                }
            }
            
            // 年齢ボーナスの検証
            if (scoreConfig.ageBonus) {
                for (const [bonusType, bonusValue] of Object.entries(scoreConfig.ageBonus)) {
                    const validation = this._validateProperty('score.ageBonus', bonusValue);
                    if (!validation.isValid) {
                        errors.push({
                            property: `ageBonus.${bonusType}`,
                            value: bonusValue,
                            error: validation.error,
                            rule: 'score.ageBonus'
                        });
                    }
                }
            }
            
            // 論理的整合性の検証
            const logicalValidation = this._validateScoreLogicalConsistency(scoreConfig);
            errors.push(...logicalValidation.errors);
            warnings.push(...logicalValidation.warnings);
            
            const result = {
                validationId,
                isValid: errors.length === 0,
                errors,
                warnings,
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
            
            if (!result.isValid) {
                this.errorStats.failedValidations++;
            }
            
            this.validationHistory.push(result);
            this._cleanupHistory();
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_ERROR', {
                context: 'BalanceConfigurationValidator.validateScoreConfig',
                scoreConfig
            });
            
            return {
                validationId,
                isValid: false,
                errors: [{ error: 'Validation failed due to internal error' }],
                warnings: [],
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * ステージ設定を検証
     * @param {Object} stageConfig - ステージ設定
     * @returns {Object} 検証結果
     */
    validateStageConfig(stageConfig) {
        const validationId = `stage_${Date.now()}`;
        const startTime = Date.now();
        
        try {
            this.errorStats.totalValidations++;
            
            const errors = [];
            const warnings = [];
            
            // スポーン率の検証
            if (stageConfig.spawnRate !== undefined) {
                const validation = this._validateProperty('stage.spawnRate', stageConfig.spawnRate);
                if (!validation.isValid) {
                    errors.push({
                        property: 'spawnRate',
                        value: stageConfig.spawnRate,
                        error: validation.error,
                        rule: 'stage.spawnRate'
                    });
                }
            }
            
            // 最大泡数の検証
            if (stageConfig.maxBubbles !== undefined) {
                const validation = this._validateProperty('stage.maxBubbles', stageConfig.maxBubbles);
                if (!validation.isValid) {
                    errors.push({
                        property: 'maxBubbles',
                        value: stageConfig.maxBubbles,
                        error: validation.error,
                        rule: 'stage.maxBubbles'
                    });
                }
            }
            
            // 開放条件の検証
            if (stageConfig.unlockRequirement !== undefined) {
                const validation = this._validateProperty('stage.unlockRequirement', stageConfig.unlockRequirement);
                if (!validation.isValid) {
                    errors.push({
                        property: 'unlockRequirement',
                        value: stageConfig.unlockRequirement,
                        error: validation.error,
                        rule: 'stage.unlockRequirement'
                    });
                }
            }
            
            const result = {
                validationId,
                isValid: errors.length === 0,
                errors,
                warnings,
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
            
            if (!result.isValid) {
                this.errorStats.failedValidations++;
            }
            
            this.validationHistory.push(result);
            this._cleanupHistory();
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_ERROR', {
                context: 'BalanceConfigurationValidator.validateStageConfig',
                stageConfig
            });
            
            return {
                validationId,
                isValid: false,
                errors: [{ error: 'Validation failed due to internal error' }],
                warnings: [],
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * アイテム設定を検証
     * @param {Object} itemConfig - アイテム設定
     * @returns {Object} 検証結果
     */
    validateItemConfig(itemConfig) {
        const validationId = `item_${Date.now()}`;
        const startTime = Date.now();
        
        try {
            this.errorStats.totalValidations++;
            
            const errors = [];
            const warnings = [];
            
            // 基本コストの検証
            if (itemConfig.baseCost !== undefined) {
                const validation = this._validateProperty('item.baseCost', itemConfig.baseCost);
                if (!validation.isValid) {
                    errors.push({
                        property: 'baseCost',
                        value: itemConfig.baseCost,
                        error: validation.error,
                        rule: 'item.baseCost'
                    });
                }
            }
            
            // コスト倍率の検証
            if (itemConfig.costMultiplier !== undefined) {
                const validation = this._validateProperty('item.costMultiplier', itemConfig.costMultiplier);
                if (!validation.isValid) {
                    errors.push({
                        property: 'costMultiplier',
                        value: itemConfig.costMultiplier,
                        error: validation.error,
                        rule: 'item.costMultiplier'
                    });
                }
            }
            
            // 最大レベルの検証
            if (itemConfig.maxLevel !== undefined) {
                const validation = this._validateProperty('item.maxLevel', itemConfig.maxLevel);
                if (!validation.isValid) {
                    errors.push({
                        property: 'maxLevel',
                        value: itemConfig.maxLevel,
                        error: validation.error,
                        rule: 'item.maxLevel'
                    });
                }
            }
            
            const result = {
                validationId,
                isValid: errors.length === 0,
                errors,
                warnings,
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
            
            if (!result.isValid) {
                this.errorStats.failedValidations++;
            }
            
            this.validationHistory.push(result);
            this._cleanupHistory();
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_ERROR', {
                context: 'BalanceConfigurationValidator.validateItemConfig',
                itemConfig
            });
            
            return {
                validationId,
                isValid: false,
                errors: [{ error: 'Validation failed due to internal error' }],
                warnings: [],
                executionTime: Date.now() - startTime,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * プロパティを検証
     * @param {string} ruleKey - ルールキー
     * @param {*} value - 検証する値
     * @returns {Object} 検証結果
     * @private
     */
    _validateProperty(ruleKey, value) {
        const rule = this.validationRules.get(ruleKey);
        if (!rule) {
            return { isValid: true, error: null };
        }
        
        // 型チェック
        if (rule.type && typeof value !== rule.type) {
            return {
                isValid: false,
                error: `Expected ${rule.type}, got ${typeof value}`
            };
        }
        
        // 数値範囲チェック
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                return {
                    isValid: false,
                    error: `Value ${value} is below minimum ${rule.min}`
                };
            }
            if (rule.max !== undefined && value > rule.max) {
                return {
                    isValid: false,
                    error: `Value ${value} is above maximum ${rule.max}`
                };
            }
        }
        
        return { isValid: true, error: null };
    }
    
    /**
     * 特殊効果を検証
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} config - 設定
     * @returns {Array} エラーリスト
     * @private
     */
    _validateSpecialEffects(bubbleType, config) {
        const errors = [];
        
        switch (bubbleType) {
            case 'pink':
                if (config.healAmount !== undefined) {
                    const validation = this._validateProperty('bubble.healAmount', config.healAmount);
                    if (!validation.isValid) {
                        errors.push({
                            property: 'healAmount',
                            value: config.healAmount,
                            error: validation.error,
                            rule: 'bubble.healAmount'
                        });
                    }
                }
                break;
                
            case 'poison':
                if (config.damageAmount !== undefined) {
                    const validation = this._validateProperty('bubble.damageAmount', config.damageAmount);
                    if (!validation.isValid) {
                        errors.push({
                            property: 'damageAmount',
                            value: config.damageAmount,
                            error: validation.error,
                            rule: 'bubble.damageAmount'
                        });
                    }
                }
                break;
                
            case 'electric':
                if (config.shakeIntensity !== undefined) {
                    const validation = this._validateProperty('bubble.shakeIntensity', config.shakeIntensity);
                    if (!validation.isValid) {
                        errors.push({
                            property: 'shakeIntensity',
                            value: config.shakeIntensity,
                            error: validation.error,
                            rule: 'bubble.shakeIntensity'
                        });
                    }
                }
                if (config.disableDuration !== undefined) {
                    const validation = this._validateProperty('bubble.disableDuration', config.disableDuration);
                    if (!validation.isValid) {
                        errors.push({
                            property: 'disableDuration',
                            value: config.disableDuration,
                            error: validation.error,
                            rule: 'bubble.disableDuration'
                        });
                    }
                }
                break;
                
            case 'rainbow':
                if (config.bonusTimeMs !== undefined) {
                    const validation = this._validateProperty('bubble.bonusTimeMs', config.bonusTimeMs);
                    if (!validation.isValid) {
                        errors.push({
                            property: 'bonusTimeMs',
                            value: config.bonusTimeMs,
                            error: validation.error,
                            rule: 'bubble.bonusTimeMs'
                        });
                    }
                }
                break;
        }
        
        return errors;
    }
    
    /**
     * 泡の論理的整合性を検証
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} config - 設定
     * @returns {Object} 検証結果
     * @private
     */
    _validateBubbleLogicalConsistency(bubbleType, config) {
        const errors = [];
        const warnings = [];
        
        // ボス泡は通常の泡より強くあるべき
        if (bubbleType === 'boss') {
            if (config.health !== undefined && config.health <= 1) {
                warnings.push({
                    property: 'health',
                    message: 'Boss bubble health should be greater than normal bubble health (1)'
                });
            }
            if (config.score !== undefined && config.score <= 15) {
                warnings.push({
                    property: 'score',
                    message: 'Boss bubble score should be significantly higher than normal bubble score (15)'
                });
            }
        }
        
        // 硬い泡（stone, iron, diamond）は健康値が段階的に増加すべき
        const hardBubbleHealthOrder = { stone: 2, iron: 3, diamond: 4 };
        if (bubbleType in hardBubbleHealthOrder) {
            const expectedMinHealth = hardBubbleHealthOrder[bubbleType];
            if (config.health !== undefined && config.health < expectedMinHealth) {
                warnings.push({
                    property: 'health',
                    message: `${bubbleType} bubble health should be at least ${expectedMinHealth}`
                });
            }
        }
        
        // 特殊効果泡の効果値が適切な範囲内か
        if (bubbleType === 'pink' && config.healAmount !== undefined) {
            if (config.healAmount > 50) {
                warnings.push({
                    property: 'healAmount',
                    message: 'High heal amount may make the game too easy'
                });
            }
        }
        
        if (bubbleType === 'poison' && config.damageAmount !== undefined) {
            if (config.damageAmount > 25) {
                warnings.push({
                    property: 'damageAmount',
                    message: 'High damage amount may make the game too difficult'
                });
            }
        }
        
        return { errors, warnings };
    }
    
    /**
     * スコアの論理的整合性を検証
     * @param {Object} scoreConfig - スコア設定
     * @returns {Object} 検証結果
     * @private
     */
    _validateScoreLogicalConsistency(scoreConfig) {
        const errors = [];
        const warnings = [];
        
        // 基本スコアの順序性チェック
        if (scoreConfig.baseScores) {
            const scores = scoreConfig.baseScores;
            
            // 硬い泡は通常の泡よりスコアが高いべき
            if (scores.normal && scores.stone && scores.stone <= scores.normal) {
                warnings.push({
                    property: 'baseScores.stone',
                    message: 'Stone bubble score should be higher than normal bubble score'
                });
            }
            
            if (scores.stone && scores.iron && scores.iron <= scores.stone) {
                warnings.push({
                    property: 'baseScores.iron',
                    message: 'Iron bubble score should be higher than stone bubble score'
                });
            }
            
            if (scores.iron && scores.diamond && scores.diamond <= scores.iron) {
                warnings.push({
                    property: 'baseScores.diamond',
                    message: 'Diamond bubble score should be higher than iron bubble score'
                });
            }
            
            // ボス泡は最高スコアであるべき
            if (scores.boss) {
                const maxRegularScore = Math.max(
                    scores.normal || 0,
                    scores.stone || 0,
                    scores.iron || 0,
                    scores.diamond || 0
                );
                if (scores.boss <= maxRegularScore * 5) {
                    warnings.push({
                        property: 'baseScores.boss',
                        message: 'Boss bubble score should be significantly higher than regular bubbles'
                    });
                }
            }
        }
        
        return { errors, warnings };
    }
    
    /**
     * エラー統計を更新
     * @param {string} bubbleType - 泡タイプ
     * @param {Array} errors - エラーリスト
     * @private
     */
    _updateErrorStats(bubbleType, errors) {
        // 泡タイプ別エラー統計
        const currentCount = this.errorStats.errorsByBubbleType.get(bubbleType) || 0;
        this.errorStats.errorsByBubbleType.set(bubbleType, currentCount + 1);
        
        // エラータイプ別統計
        for (const error of errors) {
            const errorType = error.rule || 'unknown';
            const currentCount = this.errorStats.errorsByType.get(errorType) || 0;
            this.errorStats.errorsByType.set(errorType, currentCount + 1);
        }
    }
    
    /**
     * 履歴をクリーンアップ（古いエントリを削除）
     * @private
     */
    _cleanupHistory() {
        if (this.validationHistory.length > 1000) {
            this.validationHistory.splice(0, 500); // 古い500エントリを削除
        }
    }
    
    /**
     * 検証統計を取得
     * @returns {Object} 統計情報
     */
    getValidationStats() {
        const successRate = this.errorStats.totalValidations > 0 
            ? ((this.errorStats.totalValidations - this.errorStats.failedValidations) / this.errorStats.totalValidations) * 100 
            : 0;
        
        return {
            totalValidations: this.errorStats.totalValidations,
            failedValidations: this.errorStats.failedValidations,
            successRate: `${successRate.toFixed(2)}%`,
            errorsByType: Object.fromEntries(this.errorStats.errorsByType),
            errorsByBubbleType: Object.fromEntries(this.errorStats.errorsByBubbleType),
            recentValidations: this.validationHistory.slice(-10)
        };
    }
    
    /**
     * 検証履歴を取得
     * @returns {Array} 検証履歴
     */
    getValidationHistory() {
        return [...this.validationHistory];
    }
    
    /**
     * カスタム検証ルールを追加
     * @param {string} ruleKey - ルールキー
     * @param {Object} rule - ルール定義
     */
    addValidationRule(ruleKey, rule) {
        this.validationRules.set(ruleKey, rule);
        console.log(`[BalanceConfigurationValidator] カスタムルール追加: ${ruleKey}`);
    }
    
    /**
     * 検証ルールを取得
     * @param {string} ruleKey - ルールキー
     * @returns {Object|null} ルール定義
     */
    getValidationRule(ruleKey) {
        return this.validationRules.get(ruleKey) || null;
    }
    
    /**
     * 全検証ルールを取得
     * @returns {Object} 全ルール定義
     */
    getAllValidationRules() {
        return Object.fromEntries(this.validationRules);
    }
}

// シングルトンインスタンス
let instance = null;

/**
 * BalanceConfigurationValidatorのシングルトンインスタンスを取得
 * @returns {BalanceConfigurationValidator} インスタンス
 */
export function getBalanceConfigurationValidator() {
    if (!instance) {
        instance = new BalanceConfigurationValidator();
    }
    return instance;
}