/**
 * ゲームバランス設定
 * 
 * このファイルはゲームバランス調整のための設定値を集約しています。
 * プレイヤーフィードバックに基づいて調整を行う際は、このファイルを参照してください。
 */

const BALANCE_CONFIG = {
    // スコアシステム
    scoring: {
        // 基本スコア（泡の種類別）
        baseScores: {
            normal: 15,    // 基本泡
            stone: 35,     // 石泡（2回クリック）
            iron: 65,      // 鉄泡（3回クリック）
            diamond: 120,  // ダイヤ泡（4回クリック）
            rainbow: 400,  // 虹泡（ボーナスタイム）
            pink: 25,      // ピンク泡（HP回復）
            clock: 180,    // 時計泡（時間停止）
            electric: 20,  // ビリビリ泡（操作不能）
            poison: 8,     // 毒泡（ダメージ）
            spiky: 85,     // とげとげ泡（連鎖）
            cracked: 30,   // ひび割れ泡（早期破裂）
            escaping: 50,  // 逃げる泡
            boss: 800,     // ボス泡
            score: 250     // S字泡（追加スコア）
        },
        
        // コンボシステム
        combo: {
            multiplierIncrement: 0.08,  // コンボ1つあたりの倍率増加
            maxMultiplier: 2.5,         // 最大コンボ倍率
            bonusInterval: 5,           // ボーナス発生間隔（5コンボごと）
            bonusMultiplier: 8,         // ボーナススコア倍率
            baseTimeout: 2000           // 基本タイムアウト時間（ms）
        },
        
        // 年齢ボーナス
        ageBonus: {
            earlyBonus: 2.0,    // 発生直後ボーナス（10%以内）
            lateBonus: 3.0,     // 破裂直前ボーナス（90%以上）
            midBonus: 1.5       // 中盤ボーナス（50-70%）
        }
    },
    
    // ステージ設定
    stages: {
        // TAP開放条件（大幅緩和）
        unlockRequirements: {
            hard: 500,        // 1000 -> 500
            veryHard: 2000,   // 5000 -> 2000
            special: 5000,    // 10000 -> 5000
            nightmare: 12000, // 25000 -> 12000
            chaos: 25000,     // 50000 -> 25000
            ultimate: 50000,  // 100000 -> 50000
            allIn: 100000,    // 200000 -> 100000
            boss: 35000       // 75000 -> 35000
        },
        
        // 難易度調整（spawn rate と max bubbles を緩和）
        difficulty: {
            tutorial: { spawnRate: 1.0, maxBubbles: 10 },
            normal: { spawnRate: 1.5, maxBubbles: 20 },
            hard: { spawnRate: 1.6, maxBubbles: 22 },      // 1.8/25 -> 1.6/22
            veryHard: { spawnRate: 1.8, maxBubbles: 28 },  // 2.0/30 -> 1.8/28
            special: { spawnRate: 2.0, maxBubbles: 32 },   // 2.2/35 -> 2.0/32
            nightmare: { spawnRate: 2.3, maxBubbles: 38 }, // 2.5/40 -> 2.3/38
            chaos: { spawnRate: 2.7, maxBubbles: 42 },     // 3.0/45 -> 2.7/42
            ultimate: { spawnRate: 3.2, maxBubbles: 48 },  // 3.5/50 -> 3.2/48
            allIn: { spawnRate: 3.6, maxBubbles: 55 },     // 4.0/60 -> 3.6/55
            boss: { spawnRate: 1.8, maxBubbles: 28 }       // 2.0/30 -> 1.8/28
        }
    },
    
    // アイテムシステム
    items: {
        // 基本コスト（安価に調整）
        baseCosts: {
            scoreMultiplier: 75,  // 100 -> 75
            revival: 150,         // 200 -> 150
            rareRate: 100,        // 150 -> 100
            hpBoost: 60,          // 80 -> 60
            timeExtension: 90,    // 120 -> 90
            comboBoost: 80,       // 新規追加
            reset: 30             // 50 -> 30
        },
        
        // レベルアップコスト倍率（緩和）
        costMultiplier: 1.3,  // 1.5 -> 1.3
        
        // 効果値
        effects: {
            scoreMultiplier: 1.3,  // 1.5 -> 1.3（レベルごとに+0.3倍）
            rareRate: 1.3,         // 1.5 -> 1.3（レベルごとに+0.3倍）
            hpBoost: 25,           // 20 -> 25
            timeExtension: 45000,  // 30000 -> 45000（45秒）
            comboBoost: 1.5        // 新規追加
        },
        
        // 最大レベル（拡張）
        maxLevels: {
            scoreMultiplier: 5,
            revival: 2,        // 1 -> 2
            rareRate: 4,       // 3 -> 4
            hpBoost: 6,        // 5 -> 6
            timeExtension: 4,  // 3 -> 4
            comboBoost: 3,     // 新規追加
            reset: 1
        }
    },
    
    // 泡の設定
    bubbles: {
        // 生存時間（全体的に少し延長）
        maxAge: {
            normal: 12000,    // 10000 -> 12000
            stone: 16000,     // 15000 -> 16000
            iron: 20000,      // 変更なし
            diamond: 22000,   // 25000 -> 22000
            pink: 10000,      // 8000 -> 10000
            poison: 14000,    // 12000 -> 14000
            spiky: 13000,     // 12000 -> 13000
            rainbow: 16000,   // 15000 -> 16000
            clock: 20000,     // 18000 -> 20000
            score: 9000,      // 8000 -> 9000
            electric: 13000,  // 12000 -> 13000
            escaping: 16000,  // 15000 -> 16000
            cracked: 6000,    // 5000 -> 6000
            boss: 35000       // 30000 -> 35000
        },
        
        // 耐久値
        health: {
            normal: 1,
            stone: 2,
            iron: 3,
            diamond: 4,  // 5 -> 4
            boss: 8      // 10 -> 8
        },
        
        // 特殊効果の調整
        specialEffects: {
            pink: { healAmount: 25 },           // 20 -> 25
            poison: { damageAmount: 8 },        // 10 -> 8
            spiky: { chainRadius: 120 },        // 150 -> 120
            rainbow: { bonusTimeMs: 8000 },     // 10000 -> 8000
            clock: { timeStopMs: 2500 },        // 3000 -> 2500
            score: { bonusScore: 80 },          // 100 -> 80
            electric: { 
                shakeIntensity: 15,             // 20 -> 15
                disableDuration: 1500           // 2000 -> 1500
            },
            escaping: { 
                escapeSpeed: 180,               // 200 -> 180
                escapeRadius: 90                // 100 -> 90
            }
        }
    },
    
    // バランス調整の履歴とメモ
    changelog: [
        {
            version: '1.0.0',
            date: '2024-01-XX',
            changes: [
                'ステージ開放条件を大幅緩和（TAP要件を約50%削減）',
                'アイテムコストを全体的に削減（15-40%安価に）',
                'コンボシステムを改善（5コンボごとにボーナス、最大倍率2.5倍）',
                '泡の基本スコアを調整（全体的に15-30%向上）',
                '泡の生存時間を延長（プレイヤーに余裕を提供）',
                '特殊泡の効果を調整（バランス改善）',
                '新アイテム「コンボ強化」を追加'
            ],
            reasoning: [
                'プレイヤーフィードバックで進歩が遅すぎるとの指摘',
                'アイテムが高すぎて購入機会が少ない',
                'コンボシステムが報酬不足',
                '基本スコアが低くて達成感が不足',
                'ゲームテンポが速すぎて対応困難'
            ]
        }
    ]
};

/**
 * バランス設定を適用するヘルパー関数
 */
class BalanceHelper {
    /**
     * スコア計算にバランス設定を適用
     */
    static calculateScore(bubbleType, ageRatio = 0) {
        const baseScore = BALANCE_CONFIG.scoring.baseScores[bubbleType] || 15;
        let multiplier = 1;
        
        // 年齢ボーナス適用
        if (ageRatio < 0.1) {
            multiplier = BALANCE_CONFIG.scoring.ageBonus.earlyBonus;
        } else if (ageRatio > 0.9) {
            multiplier = BALANCE_CONFIG.scoring.ageBonus.lateBonus;
        } else if (ageRatio >= 0.5 && ageRatio <= 0.7) {
            multiplier = BALANCE_CONFIG.scoring.ageBonus.midBonus;
        }
        
        return Math.floor(baseScore * multiplier);
    }
    
    /**
     * コンボ倍率を計算
     */
    static calculateComboMultiplier(comboCount) {
        if (comboCount <= 1) return 1;
        
        const config = BALANCE_CONFIG.scoring.combo;
        return Math.min(
            1 + (comboCount - 1) * config.multiplierIncrement,
            config.maxMultiplier
        );
    }
    
    /**
     * アイテムコストを計算
     */
    static calculateItemCost(itemId, currentLevel) {
        const baseCost = BALANCE_CONFIG.items.baseCosts[itemId] || 100;
        const multiplier = BALANCE_CONFIG.items.costMultiplier;
        return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
    }
    
    /**
     * ステージ開放チェック
     */
    static isStageUnlocked(stageId, playerTAP) {
        const requirement = BALANCE_CONFIG.stages.unlockRequirements[stageId];
        return !requirement || playerTAP >= requirement;
    }
}

module.exports = {
    BALANCE_CONFIG,
    BalanceHelper
};