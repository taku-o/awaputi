/**
 * ゲーム設定クラス
 * 
 * 既存のBALANCE_CONFIGからゲーム設定を移行し、
 * スコア、ステージ、アイテム、泡設定のアクセサメソッドを提供します。
 */

import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { BALANCE_CONFIG } from './GameBalance.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';

class GameConfig {
    constructor() {
        this.configManager = getConfigurationManager();
        this._initialize();
    }

    /**
     * 初期化処理 - BALANCE_CONFIGからの設定移行
     * @private
     */
    _initialize() {
        try {
            // スコア設定の移行
            this._migrateScoreConfig();
            
            // ステージ設定の移行
            this._migrateStageConfig();
            
            // アイテム設定の移行
            this._migrateItemConfig();
            
            // 泡設定の移行
            this._migrateBubbleConfig();
            
            // 検証ルールの設定
            this._setupValidationRules();
            
            console.log('[GameConfig] 初期化完了');
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'GameConfig._initialize'
            });
        }
    }

    /**
     * スコア設定の移行
     * @private
     */
    _migrateScoreConfig() {
        const scoring = BALANCE_CONFIG.scoring;
        
        // 基本スコア
        for (const [bubbleType, score] of Object.entries(scoring.baseScores)) {
            this.configManager.set('game', `scoring.baseScores.${bubbleType}`, score);
        }
        
        // コンボ設定
        for (const [key, value] of Object.entries(scoring.combo)) {
            this.configManager.set('game', `scoring.combo.${key}`, value);
        }
        
        // 年齢ボーナス
        for (const [key, value] of Object.entries(scoring.ageBonus)) {
            this.configManager.set('game', `scoring.ageBonus.${key}`, value);
        }
    }

    /**
     * ステージ設定の移行
     * @private
     */
    _migrateStageConfig() {
        const stages = BALANCE_CONFIG.stages;
        
        // 開放条件
        for (const [stageId, requirement] of Object.entries(stages.unlockRequirements)) {
            this.configManager.set('game', `stages.unlockRequirements.${stageId}`, requirement);
        }
        
        // 難易度設定
        for (const [stageId, settings] of Object.entries(stages.difficulty)) {
            this.configManager.set('game', `stages.difficulty.${stageId}.spawnRate`, settings.spawnRate);
            this.configManager.set('game', `stages.difficulty.${stageId}.maxBubbles`, settings.maxBubbles);
        }
    }

    /**
     * アイテム設定の移行
     * @private
     */
    _migrateItemConfig() {
        const items = BALANCE_CONFIG.items;
        
        // 基本コスト
        for (const [itemId, cost] of Object.entries(items.baseCosts)) {
            this.configManager.set('game', `items.baseCosts.${itemId}`, cost);
        }
        
        // コスト倍率
        this.configManager.set('game', 'items.costMultiplier', items.costMultiplier);
        
        // 効果値
        for (const [itemId, effect] of Object.entries(items.effects)) {
            this.configManager.set('game', `items.effects.${itemId}`, effect);
        }
        
        // 最大レベル
        for (const [itemId, maxLevel] of Object.entries(items.maxLevels)) {
            this.configManager.set('game', `items.maxLevels.${itemId}`, maxLevel);
        }
    }

    /**
     * 泡設定の移行
     * @private
     */
    _migrateBubbleConfig() {
        const bubbles = BALANCE_CONFIG.bubbles;
        
        // 生存時間
        for (const [bubbleType, maxAge] of Object.entries(bubbles.maxAge)) {
            this.configManager.set('game', `bubbles.maxAge.${bubbleType}`, maxAge);
        }
        
        // 耐久値
        for (const [bubbleType, health] of Object.entries(bubbles.health)) {
            this.configManager.set('game', `bubbles.health.${bubbleType}`, health);
        }
        
        // 特殊効果
        for (const [bubbleType, effects] of Object.entries(bubbles.specialEffects)) {
            for (const [effectKey, effectValue] of Object.entries(effects)) {
                this.configManager.set('game', `bubbles.specialEffects.${bubbleType}.${effectKey}`, effectValue);
            }
        }
    }

    /**
     * 検証ルールの設定
     * @private
     */
    _setupValidationRules() {
        // スコア設定の検証ルール
        this.configManager.setValidationRule('game', 'scoring.combo.multiplierIncrement', {
            type: 'number',
            min: 0.01,
            max: 0.5
        });
        
        this.configManager.setValidationRule('game', 'scoring.combo.maxMultiplier', {
            type: 'number',
            min: 1,
            max: 10
        });
        
        // ステージ設定の検証ルール
        this.configManager.setValidationRule('game', 'stages.difficulty.*.spawnRate', {
            type: 'number',
            min: 0.5,
            max: 5.0
        });
        
        this.configManager.setValidationRule('game', 'stages.difficulty.*.maxBubbles', {
            type: 'number',
            min: 5,
            max: 100
        });
        
        // アイテム設定の検証ルール
        this.configManager.setValidationRule('game', 'items.costMultiplier', {
            type: 'number',
            min: 1.0,
            max: 3.0
        });
    }

    /**
     * スコア設定を取得
     * @returns {Object} スコア設定
     */
    getScoreConfig() {
        return {
            baseScores: this._getConfigObject('game', 'scoring.baseScores'),
            combo: this._getConfigObject('game', 'scoring.combo'),
            ageBonus: this._getConfigObject('game', 'scoring.ageBonus')
        };
    }

    /**
     * 特定の泡タイプの基本スコアを取得
     * @param {string} bubbleType - 泡タイプ
     * @returns {number} 基本スコア
     */
    getBubbleBaseScore(bubbleType) {
        return this.configManager.get('game', `scoring.baseScores.${bubbleType}`, 15);
    }

    /**
     * コンボ設定を取得
     * @returns {Object} コンボ設定
     */
    getComboConfig() {
        return this._getConfigObject('game', 'scoring.combo');
    }

    /**
     * 年齢ボーナス設定を取得
     * @returns {Object} 年齢ボーナス設定
     */
    getAgeBonusConfig() {
        return this._getConfigObject('game', 'scoring.ageBonus');
    }

    /**
     * ステージ設定を取得
     * @returns {Object} ステージ設定
     */
    getStageConfig() {
        return {
            unlockRequirements: this._getConfigObject('game', 'stages.unlockRequirements'),
            difficulty: this._getConfigObject('game', 'stages.difficulty')
        };
    }

    /**
     * 特定のステージの難易度設定を取得
     * @param {string} stageId - ステージID
     * @returns {Object} 難易度設定
     */
    getStageDifficulty(stageId) {
        return {
            spawnRate: this.configManager.get('game', `stages.difficulty.${stageId}.spawnRate`, 1.5),
            maxBubbles: this.configManager.get('game', `stages.difficulty.${stageId}.maxBubbles`, 20)
        };
    }

    /**
     * ステージの開放条件を取得
     * @param {string} stageId - ステージID
     * @returns {number} 開放条件（必要TAP）
     */
    getStageUnlockRequirement(stageId) {
        return this.configManager.get('game', `stages.unlockRequirements.${stageId}`, 0);
    }

    /**
     * アイテム設定を取得
     * @returns {Object} アイテム設定
     */
    getItemConfig() {
        return {
            baseCosts: this._getConfigObject('game', 'items.baseCosts'),
            costMultiplier: this.configManager.get('game', 'items.costMultiplier', 1.3),
            effects: this._getConfigObject('game', 'items.effects'),
            maxLevels: this._getConfigObject('game', 'items.maxLevels')
        };
    }

    /**
     * 特定のアイテムの基本コストを取得
     * @param {string} itemId - アイテムID
     * @returns {number} 基本コスト
     */
    getItemBaseCost(itemId) {
        return this.configManager.get('game', `items.baseCosts.${itemId}`, 100);
    }

    /**
     * 特定のアイテムの効果値を取得
     * @param {string} itemId - アイテムID
     * @returns {number|Object} 効果値
     */
    getItemEffect(itemId) {
        return this.configManager.get('game', `items.effects.${itemId}`, 1);
    }

    /**
     * 特定のアイテムの最大レベルを取得
     * @param {string} itemId - アイテムID
     * @returns {number} 最大レベル
     */
    getItemMaxLevel(itemId) {
        return this.configManager.get('game', `items.maxLevels.${itemId}`, 1);
    }

    /**
     * 泡設定を取得
     * @returns {Object} 泡設定
     */
    getBubbleConfig() {
        return {
            maxAge: this._getConfigObject('game', 'bubbles.maxAge'),
            health: this._getConfigObject('game', 'bubbles.health'),
            specialEffects: this._getConfigObject('game', 'bubbles.specialEffects')
        };
    }

    /**
     * 特定の泡タイプの生存時間を取得
     * @param {string} bubbleType - 泡タイプ
     * @returns {number} 生存時間（ミリ秒）
     */
    getBubbleMaxAge(bubbleType) {
        return this.configManager.get('game', `bubbles.maxAge.${bubbleType}`, 12000);
    }

    /**
     * 特定の泡タイプの耐久値を取得
     * @param {string} bubbleType - 泡タイプ
     * @returns {number} 耐久値
     */
    getBubbleHealth(bubbleType) {
        return this.configManager.get('game', `bubbles.health.${bubbleType}`, 1);
    }

    /**
     * 特定の泡タイプの特殊効果を取得
     * @param {string} bubbleType - 泡タイプ
     * @returns {Object} 特殊効果
     */
    getBubbleSpecialEffects(bubbleType) {
        return this._getConfigObject('game', `bubbles.specialEffects.${bubbleType}`);
    }

    /**
     * 設定オブジェクトを取得するヘルパーメソッド
     * @private
     * @param {string} category - 設定カテゴリ
     * @param {string} prefix - 設定キープレフィックス
     * @returns {Object} 設定オブジェクト
     */
    _getConfigObject(category, prefix) {
        try {
            const result = {};
            const allSettings = this.configManager.getCategory(category);
            
            for (const [key, value] of Object.entries(allSettings)) {
                if (key.startsWith(`${prefix}.`)) {
                    const subKey = key.substring(prefix.length + 1);
                    
                    // ネストされたオブジェクトを処理
                    if (subKey.includes('.')) {
                        const parts = subKey.split('.');
                        let current = result;
                        
                        for (let i = 0; i < parts.length - 1; i++) {
                            if (!current[parts[i]]) {
                                current[parts[i]] = {};
                            }
                            current = current[parts[i]];
                        }
                        
                        current[parts[parts.length - 1]] = value;
                    } else {
                        result[subKey] = value;
                    }
                }
            }
            
            return result;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'GameConfig._getConfigObject',
                category,
                prefix
            });
            return {};
        }
    }

    /**
     * スコア計算（BalanceHelperからの移行）
     * @param {string} bubbleType - 泡タイプ
     * @param {number} ageRatio - 年齢比率（0-1）
     * @returns {number} 計算されたスコア
     */
    calculateScore(bubbleType, ageRatio = 0) {
        try {
            const baseScore = this.getBubbleBaseScore(bubbleType);
            let multiplier = 1;
            
            // 年齢ボーナス適用
            const ageBonus = this.getAgeBonusConfig();
            if (ageRatio < 0.1) {
                multiplier = ageBonus.earlyBonus || 2.0;
            } else if (ageRatio > 0.9) {
                multiplier = ageBonus.lateBonus || 3.0;
            } else if (ageRatio >= 0.5 && ageRatio <= 0.7) {
                multiplier = ageBonus.midBonus || 1.5;
            }
            
            return Math.floor(baseScore * multiplier);
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'GameConfig.calculateScore',
                bubbleType,
                ageRatio
            });
            return 15; // デフォルト値
        }
    }

    /**
     * コンボ倍率計算（BalanceHelperからの移行）
     * @param {number} comboCount - コンボ数
     * @returns {number} コンボ倍率
     */
    calculateComboMultiplier(comboCount) {
        try {
            if (comboCount <= 1) return 1;
            
            const comboConfig = this.getComboConfig();
            return Math.min(
                1 + (comboCount - 1) * (comboConfig.multiplierIncrement || 0.08),
                comboConfig.maxMultiplier || 2.5
            );
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'GameConfig.calculateComboMultiplier',
                comboCount
            });
            return 1; // デフォルト値
        }
    }

    /**
     * アイテムコスト計算（BalanceHelperからの移行）
     * @param {string} itemId - アイテムID
     * @param {number} currentLevel - 現在のレベル
     * @returns {number} 計算されたコスト
     */
    calculateItemCost(itemId, currentLevel) {
        try {
            const baseCost = this.getItemBaseCost(itemId);
            const multiplier = this.configManager.get('game', 'items.costMultiplier', 1.3);
            return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'GameConfig.calculateItemCost',
                itemId,
                currentLevel
            });
            return 100; // デフォルト値
        }
    }

    /**
     * ステージ開放チェック（BalanceHelperからの移行）
     * @param {string} stageId - ステージID
     * @param {number} playerTAP - プレイヤーのTAP値
     * @returns {boolean} 開放状態
     */
    isStageUnlocked(stageId, playerTAP) {
        try {
            const requirement = this.getStageUnlockRequirement(stageId);
            return !requirement || playerTAP >= requirement;
        } catch (error) {
            ErrorHandler.handleError(error, {
                context: 'GameConfig.isStageUnlocked',
                stageId,
                playerTAP
            });
            return false; // デフォルト値
        }
    }
}

// シングルトンインスタンス
let instance = null;

/**
 * GameConfigのシングルトンインスタンスを取得
 * @returns {GameConfig} インスタンス
 */
function getGameConfig() {
    if (!instance) {
        instance = new GameConfig();
    }
    return instance;
}

export {
    GameConfig,
    getGameConfig
};