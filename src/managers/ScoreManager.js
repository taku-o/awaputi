/**
 * スコア管理クラス
 */
export class ScoreManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.combo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // 2秒でコンボリセット
    }
    
    /**
     * スコアを追加
     */
    addScore(baseScore) {
        let finalScore = baseScore;
        
        // コンボボーナス
        if (this.combo > 1) {
            const comboMultiplier = Math.min(1 + (this.combo - 1) * 0.1, 3.0); // 最大3倍
            finalScore = Math.floor(baseScore * comboMultiplier);
        }
        
        // 特殊効果による倍率適用（ボーナスタイムなど）
        const specialMultiplier = this.gameEngine.getScoreMultiplier();
        finalScore = Math.floor(finalScore * specialMultiplier);
        
        // アイテム効果による倍率適用
        const itemMultiplier = this.gameEngine.itemManager.getEffectValue('scoreMultiplier');
        finalScore = Math.floor(finalScore * itemMultiplier);
        
        this.gameEngine.playerData.addScore(finalScore);
    }
    
    /**
     * コンボを更新
     */
    updateCombo() {
        this.combo++;
        this.comboTimer = 0;
    }
    
    /**
     * コンボをリセット
     */
    resetCombo() {
        this.combo = 0;
        this.comboTimer = 0;
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
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
}