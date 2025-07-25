/**
 * ゲームバランス設定
 * 
 * このファイルはゲームバランス調整のための設定値を集約しています。
 * プレイヤーフィードバックに基づいて調整を行う際は、このファイルを参照してください。
 * 
 * 注意: このファイルは互換性のために維持されていますが、新しいコードでは
 * ConfigurationManagerとGameConfigを使用することを推奨します。
 * 
 * @deprecated 新しい設定システムに移行してください
 */

/**
 * 元のゲームバランス設定
 * 互換性レイヤーが参照する基本設定
 */
export const ORIGINAL_BALANCE_CONFIG = {
    scoring: {
        baseScores: {
            normal: 15,
            stone: 25,
            iron: 40,
            diamond: 60,
            boss: 100,
            pink: 20,
            poison: 30,
            spiky: 35
        },
        combo: {
            multiplierIncrement: 0.08,
            maxMultiplier: 2.5
        },
        ageBonus: {
            earlyBonus: 2.0,
            midBonus: 1.5,
            lateBonus: 3.0
        }
    },
    stages: {
        unlockRequirements: {
            hard: 500,
            veryHard: 2000,
            special: 5000,
            nightmare: 10000
        },
        difficulty: {
            tutorial: {
                spawnRate: 0.8,
                maxBubbles: 10
            },
            normal: {
                spawnRate: 1.0,
                maxBubbles: 15
            },
            hard: {
                spawnRate: 1.5,
                maxBubbles: 20
            },
            veryHard: {
                spawnRate: 2.0,
                maxBubbles: 25
            },
            special: {
                spawnRate: 2.5,
                maxBubbles: 30
            },
            nightmare: {
                spawnRate: 3.0,
                maxBubbles: 35
            }
        }
    },
    items: {
        baseCosts: {
            scoreMultiplier: 75,
            timeExtension: 50,
            bubbleSlower: 60,
            extraLife: 100,
            reset: 25
        },
        costMultiplier: 1.3,
        effects: {
            scoreMultiplier: 1.3,
            timeExtension: 10000,
            bubbleSlower: 0.7,
            extraLife: 1,
            reset: 1
        },
        maxLevels: {
            scoreMultiplier: 5,
            timeExtension: 3,
            bubbleSlower: 4,
            extraLife: 2,
            reset: 1
        }
    },
    bubbles: {
        maxAge: {
            normal: 12000,
            stone: 15000,
            iron: 18000,
            diamond: 20000,
            boss: 25000,
            pink: 10000,
            poison: 8000,
            spiky: 14000
        },
        health: {
            normal: 1,
            stone: 2,
            iron: 3,
            diamond: 4,
            boss: 5,
            pink: 1,
            poison: 1,
            spiky: 2
        },
        specialEffects: {
            pink: {
                healAmount: 25
            },
            poison: {
                damageAmount: 10
            },
            spiky: {
                chainRadius: 120,
                chainDamage: 15
            }
        }
    },
    changelog: [
        {
            version: '1.0.0',
            date: '2024-01-01',
            changes: ['初期バランス設定']
        }
    ]
};

/**
 * 元のBalanceHelperクラス
 * 互換性レイヤーが参照する基本実装
 */
export class OriginalBalanceHelper {
    /**
     * スコア計算
     * @param {string} bubbleType - 泡タイプ
     * @param {number} ageRatio - 年齢比率（0-1）
     * @returns {number} 計算されたスコア
     */
    static calculateScore(bubbleType, ageRatio = 0) {
        const baseScore = ORIGINAL_BALANCE_CONFIG.scoring.baseScores[bubbleType] || 15;
        let multiplier = 1;
        
        // 年齢ボーナス適用
        if (ageRatio < 0.1) {
            multiplier = ORIGINAL_BALANCE_CONFIG.scoring.ageBonus.earlyBonus;
        } else if (ageRatio > 0.9) {
            multiplier = ORIGINAL_BALANCE_CONFIG.scoring.ageBonus.lateBonus;
        } else if (ageRatio >= 0.5 && ageRatio <= 0.7) {
            multiplier = ORIGINAL_BALANCE_CONFIG.scoring.ageBonus.midBonus;
        }
        
        return Math.floor(baseScore * multiplier);
    }
    
    /**
     * コンボ倍率計算
     * @param {number} comboCount - コンボ数
     * @returns {number} コンボ倍率
     */
    static calculateComboMultiplier(comboCount) {
        if (comboCount <= 1) return 1;
        
        const config = ORIGINAL_BALANCE_CONFIG.scoring.combo;
        return Math.min(
            1 + (comboCount - 1) * config.multiplierIncrement,
            config.maxMultiplier
        );
    }
    
    /**
     * アイテムコスト計算
     * @param {string} itemId - アイテムID
     * @param {number} currentLevel - 現在のレベル
     * @returns {number} 計算されたコスト
     */
    static calculateItemCost(itemId, currentLevel) {
        const baseCost = ORIGINAL_BALANCE_CONFIG.items.baseCosts[itemId] || 100;
        const multiplier = ORIGINAL_BALANCE_CONFIG.items.costMultiplier;
        return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
    }
    
    /**
     * ステージ開放チェック
     * @param {string} stageId - ステージID
     * @param {number} playerTAP - プレイヤーのTAP値
     * @returns {boolean} 開放状態
     */
    static isStageUnlocked(stageId, playerTAP) {
        const requirement = ORIGINAL_BALANCE_CONFIG.stages.unlockRequirements[stageId];
        return !requirement || playerTAP >= requirement;
    }
}

// 互換性レイヤーからエクスポートされたオブジェクトを再エクスポート
export { BALANCE_CONFIG, BalanceHelper } from '../core/GameBalanceCompatibility.js';

// 新しいAPIも同時にエクスポート（移行を促進）
export { getGameConfig } from '../config/GameConfig.js';
export { getConfigurationManager } from '../core/ConfigurationManager.js';