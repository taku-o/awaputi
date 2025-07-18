/**
 * スコア管理クラス
 */
export class ScoreManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.combo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // 2秒でコンボリセット
        this.scoreMultipliers = []; // アイテムによるスコア倍率
    }
    
    /**
     * スコアを追加（泡をクリック/ポップした時）
     */
    addScore(bubble, x, y) {
        const baseScore = this.calculateBaseScore(bubble);
        let finalScore = baseScore;
        let totalMultiplier = 1;
        
        // コンボボーナス
        let comboMultiplier = 1;
        if (this.combo > 1) {
            comboMultiplier = Math.min(1 + (this.combo - 1) * 0.1, 3.0); // 最大3倍
            finalScore = Math.floor(finalScore * comboMultiplier);
            totalMultiplier *= comboMultiplier;
        }
        
        // 特殊効果による倍率適用（ボーナスタイムなど）
        const specialMultiplier = this.gameEngine.getScoreMultiplier();
        if (specialMultiplier > 1) {
            finalScore = Math.floor(finalScore * specialMultiplier);
            totalMultiplier *= specialMultiplier;
        }
        
        // アイテム効果による倍率適用
        const itemMultiplier = this.getItemScoreMultiplier();
        if (itemMultiplier > 1) {
            finalScore = Math.floor(finalScore * itemMultiplier);
            totalMultiplier *= itemMultiplier;
        }
        
        // 年齢ボーナス（破裂直前の泡ほど高得点）
        const ageBonus = this.calculateAgeBonus(bubble);
        finalScore = Math.floor(finalScore * ageBonus);
        if (ageBonus > 1) {
            totalMultiplier *= ageBonus;
        }
        
        // プレイヤーデータにスコア追加
        this.gameEngine.playerData.addScore(finalScore);
        
        // フローティングテキスト表示（GameSceneに通知）
        this.notifyScoreGained(finalScore, x, y, totalMultiplier);
        
        console.log(`Score added: ${finalScore} (base: ${baseScore}, multiplier: ${totalMultiplier.toFixed(2)})`);
    }
    
    /**
     * 基本スコアを計算
     */
    calculateBaseScore(bubble) {
        const baseScores = {
            'normal': 10,
            'stone': 25,
            'iron': 50,
            'diamond': 100,
            'rainbow': 500,
            'pink': 30,
            'clock': 200,
            'electric': 15,
            'poison': 5,
            'spiky': 75,
            'cracked': 20,
            'escaping': 40,
            'boss': 1000,
            'score': 300
        };
        
        return baseScores[bubble.type] || 10;
    }
    
    /**
     * 年齢ボーナスを計算
     */
    calculateAgeBonus(bubble) {
        const ageRatio = bubble.age / bubble.maxAge;
        
        if (ageRatio >= 0.9) {
            return 3.0; // 破裂直前は3倍
        } else if (ageRatio >= 0.7) {
            return 2.0; // 危険状態は2倍
        } else if (ageRatio >= 0.5) {
            return 1.5; // 中盤は1.5倍
        } else {
            return 1.0; // 新しい泡は等倍
        }
    }
    
    /**
     * アイテムによるスコア倍率を取得
     */
    getItemScoreMultiplier() {
        let multiplier = 1;
        
        this.scoreMultipliers.forEach(mult => {
            multiplier *= mult;
        });
        
        return multiplier;
    }
    
    /**
     * アイテムスコア倍率を追加
     */
    addScoreMultiplier(multiplier) {
        this.scoreMultipliers.push(multiplier);
        console.log(`Score multiplier added: ${multiplier}x (total: ${this.getItemScoreMultiplier()}x)`);
    }
    
    /**
     * スコア獲得をGameSceneに通知
     */
    notifyScoreGained(score, x, y, multiplier) {
        // GameSceneのonScoreGainedメソッドを呼び出し
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        if (gameScene && typeof gameScene.onScoreGained === 'function') {
            gameScene.onScoreGained(score, x, y, multiplier);
        }
    }
    
    /**
     * コンボを更新
     */
    updateCombo(x, y) {
        this.combo++;
        this.comboTimer = 0;
        
        // 一定のコンボ数でボーナス
        if (this.combo % 10 === 0) {
            const bonusScore = this.combo * 10;
            this.gameEngine.playerData.addScore(bonusScore);
            
            // ボーナス通知
            this.notifyComboBonus(bonusScore, x, y, this.combo);
        }
        
        // GameSceneに通知
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        if (gameScene && typeof gameScene.onComboAchieved === 'function') {
            gameScene.onComboAchieved(this.combo, x, y);
        }
    }
    
    /**
     * コンボボーナス通知
     */
    notifyComboBonus(bonusScore, x, y, combo) {
        const gameScene = this.gameEngine.sceneManager.getCurrentScene();
        if (gameScene && gameScene.floatingTextManager) {
            gameScene.floatingTextManager.addEffectText(
                x, y - 50,
                `COMBO BONUS! +${bonusScore}`,
                'bonus'
            );
        }
    }
    
    /**
     * コンボをリセット
     */
    resetCombo() {
        if (this.combo > 0) {
            console.log(`Combo ended at ${this.combo}`);
        }
        this.combo = 0;
        this.comboTimer = 0;
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // コンボタイマーの更新
        if (this.combo > 0) {
            this.comboTimer += deltaTime;
            
            if (this.comboTimer >= this.comboTimeout) {
                this.resetCombo();
            }
        }
    }
    
    /**
     * 現在のコンボ数を取得
     */
    getCurrentCombo() {
        return this.combo;
    }
    
    /**
     * コンボ倍率を取得
     */
    getComboMultiplier() {
        if (this.combo <= 1) return 1;
        return Math.min(1 + (this.combo - 1) * 0.1, 3.0);
    }
    
    /**
     * 総合倍率を取得
     */
    getTotalMultiplier() {
        let total = 1;
        
        // コンボ倍率
        total *= this.getComboMultiplier();
        
        // 特殊効果倍率
        total *= this.gameEngine.getScoreMultiplier();
        
        // アイテム倍率
        total *= this.getItemScoreMultiplier();
        
        return total;
    }
    
    /**
     * スコア倍率をリセット（ゲーム開始時）
     */
    resetMultipliers() {
        this.scoreMultipliers = [];
        this.resetCombo();
    }
    
    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return {
            combo: this.combo,
            comboMultiplier: this.getComboMultiplier(),
            itemMultiplier: this.getItemScoreMultiplier(),
            specialMultiplier: this.gameEngine.getScoreMultiplier(),
            totalMultiplier: this.getTotalMultiplier(),
            comboTimer: this.comboTimer
        };
    }
}