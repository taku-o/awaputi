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
        
        // ビジュアルフィードバック用
        this.dragVisualization = {
            isActive: false,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            targetBubble: null,
            forceIndicator: 0,
            particles: []
        };
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
        
        // ドラッグビジュアライゼーションをリセット
        this.resetDragVisualization();
        
        console.log('Game scene started');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        this.resetDragVisualization();
        console.log('Game scene exited');
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
     * 更新処理
     */
    update(deltaTime) {
        if (this.isPaused || this.gameEngine.isGameOver) {
            return;
        }
        
        // 時間経過（時間停止中は除く）
        if (!this.gameEngine.isTimeStopped()) {
            this.gameEngine.timeRemaining -= deltaTime;
            
            if (this.gameEngine.timeRemaining <= 0) {
                this.gameEngine.timeRemaining = 0;
                this.gameOver();
                return;
            }
        }
        
        // 泡の更新
        this.gameEngine.bubbleManager.update(deltaTime);
        
        // ドラッグビジュアライゼーションの更新
        this.updateDragVisualization(deltaTime);
        
        // ゲームオーバー判定
        if (this.gameEngine.playerData.currentHP <= 0) {
            this.gameOver();
        }
    }
    
    /**
     * ドラッグビジュアライゼーションの更新
     */
    updateDragVisualization(deltaTime) {
        // パーティクルの更新
        this.dragVisualization.particles = this.dragVisualization.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
        
        // フォースインジケーターの更新
        if (this.dragVisualization.isActive) {
            const dx = this.dragVisualization.currentPosition.x - this.dragVisualization.startPosition.x;
            const dy = this.dragVisualization.currentPosition.y - this.dragVisualization.startPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.dragVisualization.forceIndicator = Math.min(distance / 50, 10); // 最大10倍
        }
    }
    
    /**
     * 描画処理
     */
    render(context) {
        const canvas = this.gameEngine.canvas;
        
        // 背景
        context.fillStyle = '#000011';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 泡を描画
        this.gameEngine.bubbleManager.render(context);
        
        // ドラッグビジュアライゼーションを描画
        this.renderDragVisualization(context);
        
        // UI を描画
        this.renderUI(context);
        
        // ゲームオーバー画面
        if (this.gameEngine.isGameOver) {
            this.renderGameOver(context);
        }
        
        // ポーズ画面
        if (this.isPaused) {
            this.renderPause(context);
        }
    }
    
    /**
     * ドラッグビジュアライゼーションを描画
     */
    renderDragVisualization(context) {
        if (!this.dragVisualization.isActive) return;
        
        context.save();
        
        const start = this.dragVisualization.startPosition;
        const current = this.dragVisualization.currentPosition;
        
        // ドラッグライン
        const dx = current.x - start.x;
        const dy = current.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            // ライン色を力の強さで変更
            const forceRatio = Math.min(distance / 200, 1);
            const red = Math.floor(255 * forceRatio);
            const green = Math.floor(255 * (1 - forceRatio));
            
            context.strokeStyle = `rgb(${red}, ${green}, 0)`;
            context.lineWidth = 3 + forceRatio * 3;
            context.setLineDash([5, 5]);
            
            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(current.x, current.y);
            context.stroke();
            
            // 矢印ヘッド
            const angle = Math.atan2(dy, dx);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;
            
            context.setLineDash([]);
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(current.x, current.y);
            context.lineTo(
                current.x - arrowLength * Math.cos(angle - arrowAngle),
                current.y - arrowLength * Math.sin(angle - arrowAngle)
            );
            context.moveTo(current.x, current.y);
            context.lineTo(
                current.x - arrowLength * Math.cos(angle + arrowAngle),
                current.y - arrowLength * Math.sin(angle + arrowAngle)
            );
            context.stroke();
            
            // フォースインジケーター
            context.fillStyle = `rgba(${red}, ${green}, 0, 0.7)`;
            context.font = 'bold 14px Arial';
            context.textAlign = 'center';
            context.fillText(
                `${this.dragVisualization.forceIndicator.toFixed(1)}x`,
                current.x,
                current.y - 20
            );
        }
        
        // ターゲット泡のハイライト
        if (this.dragVisualization.targetBubble) {
            const bubble = this.dragVisualization.targetBubble;
            context.strokeStyle = '#FFFF00';
            context.lineWidth = 3;
            context.setLineDash([3, 3]);
            context.beginPath();
            context.arc(bubble.x, bubble.y, bubble.size + 5, 0, Math.PI * 2);
            context.stroke();
        }
        
        // パーティクル効果
        this.dragVisualization.particles.forEach(particle => {
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });
        
        context.restore();
    }
    
    /**
     * パーティクルを生成
     */
    createDragParticles(x, y, force) {
        const particleCount = Math.floor(force / 2);
        
        for (let i = 0; i < particleCount; i++) {
            this.dragVisualization.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
                life: 1000,
                maxLife: 1000,
                alpha: 1
            });
        }
    }
    
    /**
     * ドラッグビジュアライゼーションをリセット
     */
    resetDragVisualization() {
        this.dragVisualization.isActive = false;
        this.dragVisualization.targetBubble = null;
        this.dragVisualization.particles = [];
        this.dragVisualization.forceIndicator = 0;
    }
    
    /**
     * ドラッグビジュアライゼーションを開始
     */
    startDragVisualization(startPos, targetBubble) {
        this.dragVisualization.isActive = true;
        this.dragVisualization.startPosition = { ...startPos };
        this.dragVisualization.currentPosition = { ...startPos };
        this.dragVisualization.targetBubble = targetBubble;
    }
    
    /**
     * ドラッグビジュアライゼーションを更新
     */
    updateDragVisualizationPosition(currentPos) {
        if (this.dragVisualization.isActive) {
            this.dragVisualization.currentPosition = { ...currentPos };
        }
    }
    
    /**
     * UI を描画
     */
    renderUI(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        
        // スコア
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 24px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(`スコア: ${playerData.currentScore.toLocaleString()}`, 20, 20);
        
        // 残り時間
        const minutes = Math.floor(this.gameEngine.timeRemaining / 60000);
        const seconds = Math.floor((this.gameEngine.timeRemaining % 60000) / 1000);
        context.fillText(`時間: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 55);
        
        // HP
        const hpRatio = playerData.currentHP / playerData.maxHP;
        const hpColor = hpRatio > 0.5 ? '#00FF00' : hpRatio > 0.25 ? '#FFFF00' : '#FF0000';
        
        context.fillStyle = hpColor;
        context.fillText(`HP: ${playerData.currentHP}/${playerData.maxHP}`, 20, 90);
        
        // HP バー
        const hpBarX = 20;
        const hpBarY = 125;
        const hpBarWidth = 200;
        const hpBarHeight = 20;
        
        context.fillStyle = '#333333';
        context.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        context.fillStyle = hpColor;
        context.fillRect(hpBarX, hpBarY, hpBarWidth * hpRatio, hpBarHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // コンボ
        const combo = this.gameEngine.scoreManager.combo;
        if (combo > 1) {
            context.fillStyle = '#FFD700';
            context.font = 'bold 32px Arial';
            context.textAlign = 'center';
            context.fillText(`${combo} COMBO!`, canvas.width / 2, 100);
        }
        
        // ギブアップボタン
        const buttonX = canvas.width - 120;
        const buttonY = 20;
        const buttonWidth = 100;
        const buttonHeight = 40;
        
        context.fillStyle = '#AA0000';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('ギブアップ', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        context.restore();
    }
    
    /**
     * ゲームオーバー画面を描画
     */
    renderGameOver(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ゲームオーバーテキスト
        context.fillStyle = '#FF6666';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('GAME OVER', canvas.width / 2, 200);
        
        // 最終スコア
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.fillText(`最終スコア: ${this.gameEngine.playerData.currentScore.toLocaleString()}`, canvas.width / 2, 280);
        
        // 操作説明
        context.font = '20px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('クリックまたはEnterでメニューに戻る', canvas.width / 2, 350);
        
        context.restore();
    }
    
    /**
     * ポーズ画面を描画
     */
    renderPause(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ポーズテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
        
        context.restore();
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (this.gameEngine.isGameOver) {
            if (event.type === 'click' || (event.type === 'keydown' && event.code === 'Enter')) {
                // メニューに戻る
                this.sceneManager.switchScene('menu');
                return;
            }
        }
        
        if (event.type === 'keydown') {
            switch (event.code) {
                case 'Escape':
                    this.togglePause();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        } else if (event.type === 'click') {
            // ギブアップボタンのクリック判定
            const canvas = this.gameEngine.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const buttonX = canvas.width - 120;
            const buttonY = 20;
            const buttonWidth = 100;
            const buttonHeight = 40;
            
            if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
                this.gameOver();
                return;
            }
        }
        
        // InputManagerに委譲
        this.inputManager.handleInput?.(event);
    }
    
    /**
     * ポーズ切り替え
     */
    togglePause() {
        if (!this.gameEngine.isGameOver) {
            this.isPaused = !this.isPaused;
            console.log(this.isPaused ? 'Game paused' : 'Game resumed');
        }
    }
    
    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.gameEngine.isGameOver = true;
        
        // スコアをAPとTAPに変換
        const finalScore = this.gameEngine.playerData.currentScore;
        const earnedAP = Math.floor(finalScore / 100); // 100点で1AP
        
        this.gameEngine.playerData.ap += earnedAP;
        this.gameEngine.playerData.tap += earnedAP;
        
        // ハイスコア更新
        const currentStage = this.gameEngine.stageManager.getCurrentStage();
        if (currentStage) {
            const stageId = currentStage.id;
            const currentHighScore = this.gameEngine.playerData.highScores[stageId];
            
            if (!currentHighScore || finalScore > currentHighScore) {
                this.gameEngine.playerData.highScores[stageId] = finalScore;
                console.log(`New high score for ${stageId}: ${finalScore}`);
            }
        }
        
        // データを保存
        this.gameEngine.playerData.save();
        
        console.log(`Game over. Final score: ${finalScore}, Earned AP: ${earnedAP}`);
    }
}

/**
 * ゲーム専用入力管理クラス
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
        const targetBubble = this.gameEngine.bubbleManager.handleDragStart(startPosition.x, startPosition.y);
        
        // ビジュアルフィードバックを開始
        this.gameScene.startDragVisualization(startPosition, targetBubble);
    }
    
    /**
     * ドラッグ移動処理
     */
    notifyDragMove(currentPosition) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // ビジュアルフィードバックを更新
        this.gameScene.updateDragVisualizationPosition(currentPosition);
    }
    
    /**
     * ドラッグ終了処理
     */
    notifyDragEnd(startPosition, endPosition, dragVector) {
        if (this.gameScene.isPaused || this.gameEngine.isGameOver || this.gameEngine.inputDisabled) {
            return;
        }
        
        // 泡を吹き飛ばす処理
        const success = this.gameEngine.bubbleManager.handleDragEnd(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
        
        if (success) {
            // パーティクル効果を生成
            const force = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
            this.gameScene.createDragParticles(endPosition.x, endPosition.y, force / 10);
        }
        
        // ビジュアルフィードバックをリセット
        this.gameScene.resetDragVisualization();
    }
}