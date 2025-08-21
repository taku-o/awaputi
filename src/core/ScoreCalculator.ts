/**
 * スコア計算の専門クラス
 * 
 * 基本スコア、コンボスコア、ボーナススコア計算を統一的に管理します。
 * 既存のBalanceHelperとScoreManagerからスコア計算ロジックを移行しています。
 */
export class ScoreCalculator {
    constructor(gameConfig = null) {
        this.gameConfig = gameConfig;
        
        // デフォルトのスコア設定（GameConfigが利用できない場合のフォールバック）
        this.defaultScoreConfig = {
            baseScores: {
                normal: 15;
                stone: 35;
                iron: 65;
                diamond: 120;
                rainbow: 400;
                pink: 25;
                clock: 180;
                electric: 20;
                poison: 8;
                spiky: 85;
                cracked: 30;
                escaping: 50;
                boss: 800;
    }
                score: 250 }
            };
            combo: { multiplierIncrement: 0.08;
                maxMultiplier: 2.5;
                bonusInterval: 5;
                bonusMultiplier: 8;
                baseTimeout: 2000 };
            ageBonus: { earlyBonus: 2.0,    // 発生直後ボーナス（10%以内）
                lateBonus: 3.0,     // 破裂直前ボーナス（90%以上）;
                midBonus: 1.5       // 中盤ボーナス（50-70%） ,}
        };
        console.log('ScoreCalculator, initialized');
    }
    
    /**
     * スコア設定を取得
     * @returns {Object} スコア設定'
     */''
    getScoreConfig()';
        if(this.gameConfig && typeof, this.gameConfig.getScoreConfig === 'function) { return this.gameConfig.getScoreConfig(); }'
        return this.defaultScoreConfig;
    }
    
    /**
     * 基本スコアを計算
     * @param {string} bubbleType - 泡タイプ
     * @param {number} ageRatio - 年齢比率（0-1、省略可）
     * @returns {number} 基本スコア
     */
    calculateBaseScore(bubbleType, ageRatio = 0) {
        const config = this.getScoreConfig();
        const baseScore = config.baseScores[bubbleType] || config.baseScores.normal;
        
        // 年齢ボーナスを適用
        const ageMultiplier = this.calculateAgeBonus(ageRatio);
        
    }
        return Math.floor(baseScore * ageMultiplier);
    
    /**
     * 年齢ボーナス倍率を計算
     * @param {number} ageRatio - 年齢比率（0-1）
     * @returns {number} 年齢ボーナス倍率
     */
    calculateAgeBonus(ageRatio) { if (ageRatio < 0 || ageRatio > 1) { }
            console.warn(`Invalid, age ratio: ${ageRatio}. Using, 0.`});
            ageRatio = 0;
        }
        
        // ageRatio が 0 の場合は通常倍率（ボーナスなし）
        if (ageRatio === 0) { return 1.0; }
        
        const config = this.getScoreConfig();
        
        if(ageRatio < 0.1) {
        
            // 発生直後ボーナス
        
        }
            return config.ageBonus.earlyBonus; else if (ageRatio > 0.9) { // 破裂直前ボーナス
            return config.ageBonus.lateBonus; } else if (ageRatio >= 0.5 && ageRatio <= 0.7) { // 中盤ボーナス
            return config.ageBonus.midBonus; }
        
        return 1.0; // 通常倍率
    }
    
    /**
     * コンボスコア倍率を計算
     * @param {number} comboCount - コンボ数
     * @returns {number} コンボ倍率
     */
    calculateComboMultiplier(comboCount) {
        if (comboCount <= 1) {
    }
            return 1.0;
        
        const config = this.getScoreConfig();
        const multiplier = 1 + (comboCount - 1) * config.combo.multiplierIncrement;
        
        return Math.min(multiplier, config.combo.maxMultiplier);
    }
    
    /**
     * コンボボーナススコアを計算
     * @param {number} comboCount - コンボ数
     * @returns {number} コンボボーナススコア（5コンボごとに発生）
     */
    calculateComboBonus(comboCount) {
        const config = this.getScoreConfig();
        
        if (comboCount % config.combo.bonusInterval === 0 && comboCount > 0) {
    }
            return comboCount * config.combo.bonusMultiplier;
        
        return 0;
    }
    
    /**
     * 総合スコアを計算
     * @param {Object} params - 計算パラメータ
     * @param {string} params.bubbleType - 泡タイプ
     * @param {number} params.ageRatio - 年齢比率（省略可）
     * @param {number} params.comboCount - コンボ数（省略可）
     * @param {number} params.specialMultiplier - 特殊効果倍率（省略可）
     * @param {number} params.itemMultiplier - アイテム倍率（省略可）
     * @returns {Object} 計算結果の詳細
     */
    calculateTotalScore(params) {
        const {
            bubbleType,
            ageRatio = 0,
            comboCount = 0,
            specialMultiplier = 1 }
            itemMultiplier = 1 }
        } = params;
        
        // 基本スコア計算（年齢ボーナス込み）
        const baseScore = this.calculateBaseScore(bubbleType, ageRatio);
        
        // コンボ倍率計算
        const comboMultiplier = this.calculateComboMultiplier(comboCount);
        
        // 総合倍率計算
        const totalMultiplier = comboMultiplier * specialMultiplier * itemMultiplier;
        
        // 最終スコア計算
        const finalScore = Math.floor(baseScore * totalMultiplier);
        
        // コンボボーナス計算
        const comboBonus = this.calculateComboBonus(comboCount);
        
        return { baseScore,
            finalScore,
            comboBonus,
            multipliers: {
                age: this.calculateAgeBonus(ageRatio);
                combo: comboMultiplier;
                special: specialMultiplier;
                item: itemMultiplier, };
                total: totalMultiplier }
            };
            breakdown: { bubbleType;
                ageRatio,
                comboCount }
        }
    
    /**
     * 特殊泡のボーナススコアを計算
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} effectParams - 効果パラメータ
     * @returns {number} ボーナススコア
     */
    calculateSpecialBubbleBonus(bubbleType, effectParams = { ) {
        const config = this.getScoreConfig();

        switch(bubbleType) {''
            case 'rainbow':;
                // レインボー泡：ボーナスタイム中の追加スコア
                return effectParams.bonusTimeActive ? config.baseScores.rainbow * 0.5 : 0;

            case 'spiky':;
                // とげとげ泡：連鎖による追加スコア
                const chainCount = effectParams.chainCount || 0;
                return chainCount * 20;

            case 'score':;
                // S字泡：固定ボーナススコア
                return effectParams.bonusScore || 80;

            case 'boss':;
                // ボス泡：体力に応じたボーナス
                const healthRatio = effectParams.healthRatio || 1;
                return Math.floor(config.baseScores.boss * (1 - healthRatio) * 0.2);
                
    }
            default: return 0;
    
    /**
     * スコア計算の統計情報を取得
     * @param {Array} scoreHistory - スコア履歴
     * @returns {Object} 統計情報
     */
    calculateScoreStatistics(scoreHistory) {
        if (!Array.isArray(scoreHistory) || scoreHistory.length === 0) {
            return { total: 0,
                average: 0;
                highest: 0;
                lowest: 0;
    ,}
                comboCount: 0, };
                bonusCount: 0 }
            }
        
        const total = scoreHistory.reduce((sum, score) => sum + score.finalScore, 0);
        const average = Math.floor(total / scoreHistory.length);
        const highest = Math.max(...scoreHistory.map(s => s.finalScore);
        const lowest = Math.min(...scoreHistory.map(s => s.finalScore);
        const comboCount = scoreHistory.filter(s => s.multipliers.combo > 1).length;
        const bonusCount = scoreHistory.filter(s => s.comboBonus > 0).length;
        
        return { total,
            average,
            highest,
            lowest,
            comboCount,
            bonusCount, };
            totalEntries: scoreHistory.length }
        }
    
    /**
     * スコア効率を計算（時間あたりのスコア）
     * @param {number} totalScore - 総スコア
     * @param {number} timeElapsed - 経過時間（ミリ秒）
     * @returns {number} スコア効率（スコア/秒）
     */
    calculateScoreEfficiency(totalScore, timeElapsed) {
        if (timeElapsed <= 0) {
    }
            return 0;
        
        return Math.floor((totalScore / timeElapsed) * 1000);
    }
    
    /**
     * 推奨戦略を計算
     * @param {Object} gameState - ゲーム状態
     * @returns {Object} 推奨戦略
     */''
    calculateRecommendedStrategy(gameState) {
        const {
            currentCombo = 0,
            availableBubbles = [],
            timeRemaining = 0 }
            currentScore = 0 }
        } = gameState;
        ';

        const strategy = { ''
            priority: 'normal';
            targetBubbles: [];
            reasoning: [] };
        ';
        // コンボが高い場合は継続を優先
        if(currentCombo >= 3) {'

            strategy.priority = 'combo';

        }

            strategy.reasoning.push('高コンボ継続を優先); }'
        }
        ';
        // 時間が少ない場合は高得点泡を優先
        if(timeRemaining < 30000) {'
            // 30秒未満
            strategy.priority = 'highScore';

        }

            strategy.reasoning.push('時間切れ前の高得点狙い); }'
        }
        
        // 利用可能な泡から推奨順を決定
        const bubbleValues = availableBubbles.map(bubble => ({ )
            ...bubble);
            expectedScore: this.calculateBaseScore(bubble.type, bubble.ageRatio || 0 });
        
        // 期待スコア順でソート
        strategy.targetBubbles = bubbleValues;
            .sort((a, b) => b.expectedScore - a.expectedScore);
            .slice(0, 3); // 上位3つ
        
        return strategy;
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return { hasGameConfig: !!this.gameConfig,

    }

            scoreConfig: this.getScoreConfig('' };

            version: '1.0.0' }))
    }
}

// シングルトンインスタンス
let scoreCalculatorInstance = null;

/**
 * ScoreCalculatorのシングルトンインスタンスを取得
 * @returns {ScoreCalculator} ScoreCalculatorインスタンス
 */)
export function getScoreCalculator() { if (!scoreCalculatorInstance) {''
        scoreCalculatorInstance = new ScoreCalculator(' })'