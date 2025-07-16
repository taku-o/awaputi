/**
 * プレイヤーデータクラス
 */
export class PlayerData {
    constructor(gameEngine = null) {
        this.gameEngine = gameEngine;
        this.username = '';
        this.currentHP = 100;
        this.maxHP = 100;
        this.currentScore = 0;
        this.ap = 0;
        this.tap = 0;
        this.combo = 0;
        this.highScores = {};
        this.unlockedStages = ['tutorial', 'normal'];
        this.ownedItems = [];
    }
    
    /**
     * スコアを追加
     */
    addScore(points) {
        this.currentScore += points;
        this.updateUI();
    }
    
    /**
     * ダメージを受ける
     */
    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
        this.updateUI();
        
        if (this.currentHP <= 0) {
            // 復活アイテムをチェック
            if (this.gameEngine && this.gameEngine.itemManager && this.gameEngine.itemManager.useRevival()) {
                console.log('Revival item activated!');
                return false; // 復活したのでゲームオーバーではない
            }
            return true; // ゲームオーバー
        }
        return false;
    }
    
    /**
     * HPを回復
     */
    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
        this.updateUI();
    }
    
    /**
     * UIを更新
     */
    updateUI() {
        const scoreElement = document.getElementById('score');
        const hpElement = document.getElementById('hp');
        
        if (scoreElement) {
            scoreElement.textContent = this.currentScore;
        }
        
        if (hpElement) {
            hpElement.textContent = this.currentHP;
        }
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.currentHP = this.maxHP;
        this.currentScore = 0;
        this.combo = 0;
        this.updateUI();
    }
    
    /**
     * データを保存
     */
    save() {
        const data = {
            username: this.username,
            ap: this.ap,
            tap: this.tap,
            highScores: this.highScores,
            unlockedStages: this.unlockedStages,
            ownedItems: this.ownedItems
        };
        
        localStorage.setItem('bubblePop_playerData', JSON.stringify(data));
    }
    
    /**
     * データを読み込み
     */
    load() {
        const savedData = localStorage.getItem('bubblePop_playerData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.username = data.username || '';
            this.ap = data.ap || 0;
            this.tap = data.tap || 0;
            this.highScores = data.highScores || {};
            this.unlockedStages = data.unlockedStages || ['tutorial', 'normal'];
            this.ownedItems = data.ownedItems || [];
        }
    }
}