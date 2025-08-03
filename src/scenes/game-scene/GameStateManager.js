/**
 * GameStateManager - ゲーム状態管理システム
 * 
 * ゲームの開始、終了、ポーズ、状態変更などの中核的な状態管理を専門的に処理します
 */

export class GameStateManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isPaused = false;
        
        // 状態管理
        this.gameState = {
            isInitialized: false,
            isGameStarted: false,
            gameStartTime: 0,
            lastUpdateTime: 0
        };
    }
    
    /**
     * ゲーム開始処理
     */
    startGame() {
        // ゲーム状態をリセット
        this.gameEngine.playerData.reset();
        this.gameEngine.scoreManager.resetCombo();
        this.gameEngine.bubbleManager.clearAllBubbles();
        this.gameEngine.isGameOver = false;
        this.isPaused = false;
        
        // アイテム効果を適用
        this.applyItemEffects();
        
        // 特殊効果をリセット
        this.resetSpecialEffects();
        
        // 状態管理の更新
        this.gameState.isGameStarted = true;
        this.gameState.gameStartTime = Date.now();
        this.gameState.lastUpdateTime = Date.now();
        
        console.log('Game started');
    }
    
    /**
     * ゲーム終了処理
     */
    endGame() {
        this.gameState.isGameStarted = false;
        console.log('Game ended');
    }
    
    /**
     * ゲームリセット処理
     */
    resetGame() {
        this.endGame();
        this.startGame();
    }
    
    /**
     * ポーズ状態の切り替え
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
    }
    
    /**
     * ポーズ設定
     * @param {boolean} paused - ポーズ状態
     */
    setPaused(paused) {
        this.isPaused = paused;
    }
    
    /**
     * アイテム効果を適用
     */
    applyItemEffects() {
        const itemManager = this.gameEngine.itemManager;
        
        // スコア倍率アップアイテム
        itemManager.ownedItems.forEach(itemId => {
            const item = itemManager.getItem(itemId);
            if (item && item.effect.type === 'scoreMultiplier') {
                this.gameEngine.scoreManager.addScoreMultiplier(item.effect.value);
                console.log(`Score multiplier applied: ${item.effect.value}x`);
            }
        });
    }
    
    /**
     * 特殊効果をリセット
     */
    resetSpecialEffects() {
        this.gameEngine.bonusTimeRemaining = 0;
        this.gameEngine.timeStopRemaining = 0;
        this.gameEngine.scoreMultiplier = 1;
        this.gameEngine.screenShakeRemaining = 0;
        this.gameEngine.screenShakeIntensity = 0;
        this.gameEngine.inputDisabled = false;
    }
    
    /**
     * ゲーム状態の更新
     * @param {number} deltaTime - 経過時間
     */
    updateGameState(deltaTime) {
        if (this.isPaused || this.gameEngine.isGameOver) {
            return;
        }
        
        // 時間経過（時間停止中は除く）
        if (!this.gameEngine.isTimeStopActive()) {
            this.gameEngine.timeRemaining -= deltaTime;
            
            if (this.gameEngine.timeRemaining <= 0) {
                this.gameEngine.timeRemaining = 0;
                this.triggerGameOver();
                return;
            }
        }
        
        // ゲームオーバー判定
        if (this.gameEngine.playerData.currentHP <= 0) {
            this.triggerGameOver();
        }
        
        this.gameState.lastUpdateTime = Date.now();
    }
    
    /**
     * ゲームオーバーの発動
     */
    triggerGameOver() {
        this.gameEngine.isGameOver = true;
        this.endGame();
        
        console.log('Game Over triggered');
    }
    
    /**
     * 泡破壊時の処理
     * @param {Object} bubble - 破壊された泡
     * @param {number} points - 獲得ポイント
     */
    onBubbleDestroyed(bubble, points) {
        // スコア更新
        this.gameEngine.scoreManager.addScore(points);
        
        // 特殊効果の判定
        if (bubble.type === 'rainbow') {
            this.gameEngine.startBonusTime();
        } else if (bubble.type === 'clock') {
            this.gameEngine.startTimeStop();
        }
    }
    
    /**
     * ダメージ受けた時の処理
     * @param {number} damage - ダメージ量
     */
    onPlayerDamaged(damage) {
        const playerData = this.gameEngine.playerData;
        playerData.currentHP = Math.max(0, playerData.currentHP - damage);
        
        console.log(`Player took ${damage} damage. HP: ${playerData.currentHP}/${playerData.maxHP}`);
        
        // 低HP警告
        if (playerData.currentHP <= playerData.maxHP * 0.25 && playerData.currentHP > 0) {
            console.log('Low HP warning!');
        }
    }
    
    /**
     * 回復時の処理
     * @param {number} heal - 回復量
     */
    onPlayerHealed(heal) {
        const playerData = this.gameEngine.playerData;
        const oldHP = playerData.currentHP;
        playerData.currentHP = Math.min(playerData.maxHP, playerData.currentHP + heal);
        const actualHeal = playerData.currentHP - oldHP;
        
        console.log(`Player healed ${actualHeal}. HP: ${playerData.currentHP}/${playerData.maxHP}`);
        
        return actualHeal;
    }
    
    /**
     * 特殊効果発動時の処理
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    onSpecialEffect(effectType, x, y) {
        console.log(`Special effect triggered: ${effectType} at (${x}, ${y})`);
        
        switch (effectType) {
            case 'rainbow':
                this.gameEngine.startBonusTime();
                break;
            case 'clock':
                this.gameEngine.startTimeStop();
                break;
            case 'electric':
                // 電気効果の処理
                break;
            case 'spiky':
                // 連鎖効果の処理
                break;
            case 'poison':
                // 毒効果の処理
                break;
            case 'pink':
                // 回復効果の処理
                this.onPlayerHealed(10);
                break;
        }
    }
    
    /**
     * スコア変化チェック
     * @returns {boolean} スコアが変化したかどうか
     */
    checkScoreChange() {
        const currentScore = this.gameEngine.playerData.currentScore;
        if (currentScore !== this.gameState.lastScore) {
            this.gameState.lastScore = currentScore;
            return true;
        }
        return false;
    }
    
    /**
     * 時間警告チェック
     * @returns {Object} 警告情報
     */
    checkTimeWarning() {
        const timeRemaining = this.gameEngine.timeRemaining;
        const warnings = {
            timeWarning: false,
            urgentWarning: false,
            message: null
        };
        
        // 30秒以下で警告
        if (timeRemaining <= 30000 && timeRemaining > 29000) {
            warnings.timeWarning = true;
            warnings.message = 'TIME WARNING!';
        }
        
        // 10秒以下で緊急警告
        if (timeRemaining <= 10000 && timeRemaining > 9000) {
            warnings.urgentWarning = true;
            warnings.message = 'HURRY UP!';
        }
        
        return warnings;
    }
    
    /**
     * ゲーム統計の取得
     * @returns {Object} ゲーム統計
     */
    getGameStats() {
        return {
            isGameStarted: this.gameState.isGameStarted,
            isPaused: this.isPaused,
            isGameOver: this.gameEngine.isGameOver,
            gameTime: this.gameState.isGameStarted ? Date.now() - this.gameState.gameStartTime : 0,
            timeRemaining: this.gameEngine.timeRemaining,
            score: this.gameEngine.playerData.currentScore,
            hp: this.gameEngine.playerData.currentHP,
            maxHP: this.gameEngine.playerData.maxHP,
            bubbleCount: this.gameEngine.bubbleManager.getBubbleCount(),
            comboCount: this.gameEngine.scoreManager.getCombo()
        };
    }
    
    /**
     * ゲーム状態の検証
     * @returns {boolean} 状態が有効かどうか
     */
    validateGameState() {
        const playerData = this.gameEngine.playerData;
        
        // 基本的な状態チェック
        if (playerData.currentHP < 0) {
            console.warn('Invalid HP detected, triggering game over');
            this.triggerGameOver();
            return false;
        }
        
        if (this.gameEngine.timeRemaining < 0) {
            console.warn('Invalid time remaining detected');
            this.gameEngine.timeRemaining = 0;
            this.triggerGameOver();
            return false;
        }
        
        return true;
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            gameState: this.gameState,
            isPaused: this.isPaused,
            isGameOver: this.gameEngine.isGameOver,
            gameStats: this.getGameStats()
        };
    }
}