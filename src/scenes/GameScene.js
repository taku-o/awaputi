import { Scene } from '../core/SceneManager.js';
import { InputManager } from '../core/InputManager.js';

/**
 * ゲームシーン
 */
export class GameScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.isPaused = false;
        this.inputManager = new GameInputManager(gameEngine.canvas, this);
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        // ゲーム状態をリセット
        this.gameEngine.playerData.reset();
        this.gameEngine.scoreManager.resetCombo();
        this.gameEngine.bubbleManager.clearAllBubbles();
        this.gameEngine.isGameOver = false;
        this.isPaused = false;
        
        // アイテム効果を適用
        this.applyItemEffects();
        
        // 特殊効果をリセット
        this.gameEngine.bonusTimeRemaining = 0;
        this.gameEngine.timeStopRemaining = 0;
        this.gameEngine.scoreMultiplier = 1;
        this.gameEngine.screenShakeRemaining = 0;
        this.gameEngine.screenShakeIntensity = 0;
        this.gameEngine.inputDisabled = false;
        
        console.log('Game scene started');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        console.log('Game scene exited');
    }
    
    /**
     * アイテム効果を適用
     */
    applyItemEffects() {
        const itemManager = this.gameEngine.itemManager;
        
        // HP増加効果を適用
        const hpBoost = itemManager.getEffectValue('hpBoost');
        this.gameEngine.playerData.maxHP = 100 + hpBoost;
        this.gameEngine.playerData.currentHP = this.gameEngine.playerData.maxHP;
        
        // 時間延長効果を適用
        const timeExtension = itemManager.getEffectValue('timeExtension');
        this.gameEngine.timeRemaining = 300000 + timeExtension; // 基本5分 + 延長時間
        
        console.log(`Item effects applied: HP+${hpBoost}, Time+${timeExtension/1000}s`);
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        if (this.isPaused || this.gameEngine.isGameOver) return;
        
        // 特殊効果の更新
        this.gameEngine.updateSpecialEffects(deltaTime);
        
        // 時間更新（時間停止中は時間を進めない）
        if (this.gameEngine.timeStopRemaining <= 0) {
            this.gameEngine.timeRemaining -= deltaTime;
        }
        this.updateTimeDisplay();
        
        // ボスイベントのチェック
        this.gameEngine.stageManager.checkBossEvents(this.gameEngine.timeRemaining);
        
        // ゲームオーバー判定
        if (this.gameEngine.timeRemaining <= 0 || this.gameEngine.playerData.currentHP <= 0) {
            this.gameOver();
            return;
        }
        
        // システム更新（時間停止中は泡の更新を停止）
        this.gameEngine.scoreManager.update(deltaTime);
        if (this.gameEngine.timeStopRemaining <= 0) {
            this.gameEngine.bubbleManager.update(deltaTime);
        }
    }
    
    /**
     * 描画処理
     */
    render(context) {
        context.save();
        
        // 画面揺れ効果
        if (this.gameEngine.isScreenShakeActive()) {
            const shakeX = (Math.random() - 0.5) * this.gameEngine.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.gameEngine.screenShakeIntensity;
            context.translate(shakeX, shakeY);
        }
        
        // 画面クリア
        context.fillStyle = '#001122';
        context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        
        // 特殊効果の背景表示
        this.renderSpecialEffectBackground(context);
        
        // 泡を描画
        this.gameEngine.bubbleManager.render(context);
        
        // コンボ表示
        if (this.gameEngine.scoreManager.getCurrentCombo() > 1) {
            this.renderCombo(context);
        }
        
        // 特殊効果の表示
        this.renderSpecialEffects(context);
        
        // ポーズ画面
        if (this.isPaused) {
            this.renderPauseScreen(context);
        }
        
        // ゲームオーバー画面
        if (this.gameEngine.isGameOver) {
            this.renderGameOver(context);
        }
        
        context.restore();
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (event.type === 'keydown') {
            switch (event.code) {
                case 'Escape':
                    if (this.gameEngine.isGameOver) {
                        this.sceneManager.switchScene('stageSelect');
                    } else {
                        this.togglePause();
                    }
                    break;
                case 'Space':
                    if (this.isPaused) {
                        this.togglePause();
                    }
                    break;
            }
        } else if (event.type === 'click' || event.type === 'touchstart') {
            if (this.gameEngine.isGameOver) {
                this.sceneManager.switchScene('stageSelect');
                return;
            }
            
            if (this.isPaused) {
                this.togglePause();
                return;
            }
            
            if (this.gameEngine.inputDisabled) return;
            
            const rect = this.gameEngine.canvas.getBoundingClientRect();
            let x, y;
            
            if (event.type === 'click') {
                x = event.clientX - rect.left;
                y = event.clientY - rect.top;
            } else {
                const touch = event.touches[0];
                x = touch.clientX - rect.left;
                y = touch.clientY - rect.top;
            }
            
            this.gameEngine.bubbleManager.handleClick(x, y);
        } else if (event.type === 'mousemove' || event.type === 'touchmove') {
            if (this.isPaused || this.gameEngine.isGameOver) return;
            
            const rect = this.gameEngine.canvas.getBoundingClientRect();
            let x, y;
            
            if (event.type === 'mousemove') {
                x = event.clientX - rect.left;
                y = event.clientY - rect.top;
            } else {
                const touch = event.touches[0];
                x = touch.clientX - rect.left;
                y = touch.clientY - rect.top;
            }
            
            this.gameEngine.bubbleManager.updateMousePosition(x, y);
        }
    }
    
    /**
     * ポーズ切り替え
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? 'Game paused' : 'Game resumed');
    }
    
    /**
     * 時間表示を更新
     */
    updateTimeDisplay() {
        const timeElement = document.getElementById('time');
        if (timeElement) {
            const minutes = Math.floor(this.gameEngine.timeRemaining / 60000);
            const seconds = Math.floor((this.gameEngine.timeRemaining % 60000) / 1000);
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * コンボ表示
     */
    renderCombo(context) {
        const combo = this.gameEngine.scoreManager.getCurrentCombo();
        context.save();
        
        context.fillStyle = '#FFD700';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        context.fillText(`${combo} COMBO!`, this.gameEngine.canvas.width / 2, 50);
        
        context.restore();
    }
    
    /**
     * 特殊効果の背景表示
     */
    renderSpecialEffectBackground(context) {
        context.save();
        
        // ボーナスタイム中の背景効果
        if (this.gameEngine.isBonusTimeActive()) {
            const alpha = 0.1 + 0.1 * Math.sin(Date.now() / 200); // 点滅効果
            context.fillStyle = `rgba(255, 105, 180, ${alpha})`;
            context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        }
        
        // 時間停止中の背景効果
        if (this.gameEngine.isTimeStopActive()) {
            const alpha = 0.15 + 0.1 * Math.sin(Date.now() / 150); // 点滅効果
            context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        }
        
        context.restore();
    }
    
    /**
     * 特殊効果の表示
     */
    renderSpecialEffects(context) {
        context.save();
        
        // ボーナスタイム表示
        if (this.gameEngine.isBonusTimeActive()) {
            context.fillStyle = '#FF69B4';
            context.font = 'bold 20px Arial';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.gameEngine.bonusTimeRemaining / 1000);
            context.fillText(`ボーナスタイム: ${remainingSeconds}s`, 10, 10);
            context.fillText('スコア2倍!', 10, 35);
        }
        
        // 時間停止表示
        if (this.gameEngine.isTimeStopActive()) {
            context.fillStyle = '#FFD700';
            context.font = 'bold 20px Arial';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.gameEngine.timeStopRemaining / 1000);
            const yOffset = this.gameEngine.isBonusTimeActive() ? 70 : 10;
            context.fillText(`時間停止: ${remainingSeconds}s`, 10, yOffset);
        }
        
        // 画面揺れ表示
        if (this.gameEngine.isScreenShakeActive()) {
            context.fillStyle = '#FFFF00';
            context.font = 'bold 20px Arial';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.gameEngine.screenShakeRemaining / 1000);
            let yOffset = 10;
            if (this.gameEngine.isBonusTimeActive()) yOffset += 60;
            if (this.gameEngine.isTimeStopActive()) yOffset += 35;
            
            context.fillText(`ビリビリ: ${remainingSeconds}s`, 10, yOffset);
            context.fillText('操作不能!', 10, yOffset + 25);
        }
        
        context.restore();
    }
    
    /**
     * ポーズ画面
     */
    renderPauseScreen(context) {
        context.save();
        
        // 半透明オーバーレイ
        context.fillStyle = 'rgba(0,0,0,0.7)';
        context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        
        // ポーズテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        context.fillText('PAUSE', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 - 50);
        
        context.font = '18px Arial';
        context.fillText('スペースキーまたはクリックで再開', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 + 20);
        context.fillText('ESCでステージ選択に戻る', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 + 50);
        
        context.restore();
    }
    
    /**
     * ゲームオーバー画面
     */
    renderGameOver(context) {
        context.save();
        
        // 半透明オーバーレイ
        context.fillStyle = 'rgba(0,0,0,0.7)';
        context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        
        // ゲームオーバーテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        context.fillText('GAME OVER', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 - 50);
        
        context.font = 'bold 24px Arial';
        context.fillText(`最終スコア: ${this.gameEngine.playerData.currentScore}`, this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 + 20);
        
        context.font = '18px Arial';
        context.fillText('クリックしてステージ選択に戻る', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 + 60);
        
        context.restore();
    }
    
    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.gameEngine.isGameOver = true;
        
        // ステージ完了処理
        this.gameEngine.stageManager.completeStage(this.gameEngine.playerData.currentScore);
        
        console.log('Game Over');
    }
}

/**
 * ゲーム用入力管理クラス
 */
class GameInputManager extends InputManager {
    constructor(canvas, gameScene) {
        super(canvas);
        this.gameScene = gameScene;
        this.gameEngine = gameScene.gameEngine;
    }
    
    /**
     * クリック処理
     */
    notifyClick(position) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 泡のクリック処理
        this.gameEngine.bubbleManager.handleClick(position.x, position.y);
    }
    
    /**
     * ポインター移動処理
     */
    notifyPointerMove(position) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver) {
            return;
        }
        
        // マウス位置の更新
        this.gameEngine.bubbleManager.updateMousePosition(position.x, position.y);
    }
    
    /**
     * ドラッグ開始処理
     */
    notifyDragStart(startPosition) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // ドラッグ対象の泡を検索
        this.gameEngine.bubbleManager.handleDragStart(startPosition.x, startPosition.y);
    }
    
    /**
     * ドラッグ移動処理
     */
    notifyDragMove(currentPosition) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // ドラッグ中の視覚的フィードバック（将来実装）
        // 現在は特に処理なし
    }
    
    /**
     * ドラッグ終了処理
     */
    notifyDragEnd(startPosition, endPosition, dragVector) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 泡を吹き飛ばす処理
        this.gameEngine.bubbleManager.handleDragEnd(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
    }
}