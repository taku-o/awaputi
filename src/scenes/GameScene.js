import { Scene } from '../core/Scene.js';
import { GameInputManager } from './GameInputManager.js';
import { FloatingTextManager } from '../ui/FloatingTextManager.js';

/**
 * ゲームシーン
 */
export class GameScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.isPaused = false;
        this.inputManager = new GameInputManager(gameEngine.canvas, this);
        this.floatingTextManager = new FloatingTextManager();
        
        // ビジュアルフィードバック用
        this.dragVisualization = {
            isActive: false,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            targetBubble: null,
            forceIndicator: 0,
            particles: [],
            duration: 0,
            intensity: 1
        };
        
        // UI状態管理
        this.uiState = {
            showingDetailedInfo: false,
            lastComboDisplayTime: 0,
            comboFlashTimer: 0,
            hpFlashTimer: 0,
            timeWarningActive: false,
            scoreAnimationTimer: 0,
            lastScore: 0
        };
        
        // パフォーマンス表示用
        this.performanceMetrics = {
            fps: 60,
            frameCount: 0,
            lastFpsUpdate: Date.now(),
            bubbleCount: 0,
            showMetrics: false
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
        
        // UI状態をリセット
        this.uiState = {
            showingDetailedInfo: false,
            lastComboDisplayTime: 0,
            comboFlashTimer: 0,
            hpFlashTimer: 0,
            timeWarningActive: false,
            scoreAnimationTimer: 0,
            lastScore: 0
        };
        
        // フローティングテキストをクリア
        this.floatingTextManager.clear();
        
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
        
        // ゲーム開始メッセージ
        const canvas = this.gameEngine.canvas;
        this.floatingTextManager.addAnimatedText(
            canvas.width / 2, 
            canvas.height / 2, 
            'GAME START!', 
            'explosive'
        );
        
        console.log('Game scene started');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        this.resetDragVisualization();
        this.floatingTextManager.clear();
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
                
                // アイテム効果の通知
                const canvas = this.gameEngine.canvas;
                this.floatingTextManager.addEffectText(
                    canvas.width / 2,
                    100,
                    `Score x${item.effect.value}`,
                    'bonus'
                );
            }
        });
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // パフォーマンス測定
        this.updatePerformanceMetrics(deltaTime);
        
        if (this.isPaused || this.gameEngine.isGameOver) {
            // ポーズ中でもフローティングテキストは更新
            this.floatingTextManager.update(deltaTime);
            return;
        }
        
        // 時間経過（時間停止中は除く）
        if (!this.gameEngine.isTimeStopActive()) {
            this.gameEngine.timeRemaining -= deltaTime;
            
            if (this.gameEngine.timeRemaining <= 0) {
                this.gameEngine.timeRemaining = 0;
                this.gameOver();
                return;
            }
            
            // 時間警告
            this.checkTimeWarning();
        }
        
        // UI状態の更新
        this.updateUIState(deltaTime);
        
        // 泡の更新
        this.gameEngine.bubbleManager.update(deltaTime);
        
        // ドラッグビジュアライゼーションの更新
        this.updateDragVisualization(deltaTime);
        
        // フローティングテキストの更新
        this.floatingTextManager.update(deltaTime);
        
        // スコア変化の監視
        this.checkScoreChange();
        
        // ゲームオーバー判定
        if (this.gameEngine.playerData.currentHP <= 0) {
            this.gameOver();
        }
    }
    
    /**
     * パフォーマンス測定の更新
     */
    updatePerformanceMetrics(deltaTime) {
        this.performanceMetrics.frameCount++;
        const now = Date.now();
        
        if (now - this.performanceMetrics.lastFpsUpdate >= 1000) {
            this.performanceMetrics.fps = this.performanceMetrics.frameCount;
            this.performanceMetrics.frameCount = 0;
            this.performanceMetrics.lastFpsUpdate = now;
            this.performanceMetrics.bubbleCount = this.gameEngine.bubbleManager.getBubbleCount();
        }
    }
    
    /**
     * UI状態の更新
     */
    updateUIState(deltaTime) {
        // コンボフラッシュタイマー
        if (this.uiState.comboFlashTimer > 0) {
            this.uiState.comboFlashTimer -= deltaTime;
        }
        
        // HPフラッシュタイマー
        if (this.uiState.hpFlashTimer > 0) {
            this.uiState.hpFlashTimer -= deltaTime;
        }
        
        // スコアアニメーションタイマー
        if (this.uiState.scoreAnimationTimer > 0) {
            this.uiState.scoreAnimationTimer -= deltaTime;
        }
    }
    
    /**
     * 時間警告チェック
     */
    checkTimeWarning() {
        const timeRemaining = this.gameEngine.timeRemaining;
        
        // 30秒以下で警告
        if (timeRemaining <= 30000 && !this.uiState.timeWarningActive) {
            this.uiState.timeWarningActive = true;
            const canvas = this.gameEngine.canvas;
            this.floatingTextManager.addEffectText(
                canvas.width / 2,
                canvas.height / 2 - 50,
                'TIME WARNING!',
                'shock'
            );
        }
        
        // 10秒以下で緊急警告
        if (timeRemaining <= 10000 && timeRemaining > 9000) {
            const canvas = this.gameEngine.canvas;
            this.floatingTextManager.addEffectText(
                canvas.width / 2,
                canvas.height / 2,
                'HURRY UP!',
                'explosive'
            );
        }
    }
    
    /**
     * スコア変化チェック
     */
    checkScoreChange() {
        const currentScore = this.gameEngine.playerData.currentScore;
        if (currentScore !== this.uiState.lastScore) {
            this.uiState.scoreAnimationTimer = 500; // 0.5秒間アニメーション
            this.uiState.lastScore = currentScore;
        }
    }
    
    /**
     * スコア獲得時の処理
     */
    onScoreGained(score, x, y, multiplier = 1) {
        // フローティングテキストでスコア表示
        this.floatingTextManager.addScoreText(x, y, score, multiplier);
        
        // コンボチェック
        const combo = this.gameEngine.scoreManager.combo;
        if (combo > 1) {
            this.onComboAchieved(combo, x, y + 30);
        }
    }
    
    /**
     * コンボ達成時の処理
     */
    onComboAchieved(combo, x, y) {
        this.floatingTextManager.addComboText(x, y, combo);
        this.uiState.comboFlashTimer = 1000;
        this.uiState.lastComboDisplayTime = Date.now();
    }
    
    /**
     * ダメージ受信時の処理
     */
    onDamageTaken(damage, source = 'unknown') {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        // フローティングテキストでダメージ表示
        this.floatingTextManager.addDamageText(
            canvas.width / 2,
            canvas.height / 2,
            damage
        );
        
        // 新しいダメージエフェクト
        this.gameEngine.createDamageEffect(damage, source);
        
        // HPフラッシュ効果
        this.uiState.hpFlashTimer = 1000;
        
        // 低HP警告
        if (playerData.currentHP <= playerData.maxHP * 0.25) {
            this.floatingTextManager.addEffectText(
                canvas.width / 2,
                canvas.height / 2 + 50,
                'LOW HP!',
                'shock'
            );
        }
    }
    
    /**
     * 回復時の処理
     */
    onHealed(heal) {
        const canvas = this.gameEngine.canvas;
        this.floatingTextManager.addHealText(
            canvas.width / 2,
            canvas.height / 2,
            heal
        );
        
        // 新しい回復エフェクト
        this.gameEngine.createHealEffect(heal);
    }
    
    /**
     * 特殊効果発動時の処理
     */
    onSpecialEffect(effectType, x, y) {
        const effectMessages = {
            rainbow: 'BONUS TIME!',
            clock: 'TIME STOP!',
            electric: 'SHOCKED!',
            spiky: 'CHAIN REACTION!',
            poison: 'POISONED!',
            pink: 'HEALED!'
        };
        
        const message = effectMessages[effectType] || 'SPECIAL EFFECT!';;
        const type = effectType === 'rainbow' ? 'bonus' : 
                    effectType === 'clock' ? 'timeStop' :
                    effectType === 'electric' ? 'shock' :
                    effectType === 'spiky' ? 'chain' : 'normal';
        
        this.floatingTextManager.addEffectText(x, y, message, type);
        
        // 追加の視覚・音響効果は既にGameEngineの各start*メソッドで処理済み
    }
    
    /**
     * 描画処理
     */
    render(context) {
        const canvas = this.gameEngine.canvas;
        
        // 背景グラデーション
        this.renderBackground(context);
        
        // 泡を描画
        this.gameEngine.bubbleManager.render(context);
        
        // ドラッグビジュアライゼーションを描画
        this.renderDragVisualization(context);
        
        // フローティングテキストを描画
        this.floatingTextManager.render(context);
        
        // UI を描画
        this.renderEnhancedUI(context);
        
        // パフォーマンス情報（デバッグ用）
        if (this.performanceMetrics.showMetrics) {
            this.renderPerformanceMetrics(context);
        }
        
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
     * 背景グラデーション描画
     */
    renderBackground(context) {
        const canvas = this.gameEngine.canvas;
        
        // 時間に基づくグラデーション
        const timeRatio = this.gameEngine.timeRemaining / 300000; // 5分
        const topColor = timeRatio > 0.5 ? '#000033' : timeRatio > 0.25 ? '#330000' : '#660000';
        const bottomColor = timeRatio > 0.5 ? '#000011' : timeRatio > 0.25 ? '#110000' : '#220000';
        
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ボーナスタイム時のオーバーレイ
        if (this.gameEngine.bonusTimeRemaining > 0) {
            const alpha = 0.1 + 0.1 * Math.sin(Date.now() * 0.01);
            context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // 時間停止時のオーバーレイ
        if (this.gameEngine.timeStopRemaining > 0) {
            context.fillStyle = 'rgba(0, 100, 200, 0.1)';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    /**
     * 改良されたUI描画
     */
    renderEnhancedUI(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        
        // スコア（アニメーション付き）
        const scoreScale = this.uiState.scoreAnimationTimer > 0 ? 1.2 : 1;
        context.save();
        context.scale(scoreScale, scoreScale);
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 28px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 4;
        context.fillText(`スコア: ${playerData.currentScore.toLocaleString()}`, 20 / scoreScale, 20 / scoreScale);
        context.restore();
        
        // 残り時間（色分け）
        const minutes = Math.floor(this.gameEngine.timeRemaining / 60000);
        const seconds = Math.floor((this.gameEngine.timeRemaining % 60000) / 1000);
        const timeColor = this.gameEngine.timeRemaining > 30000 ? '#FFFFFF' : 
                         this.gameEngine.timeRemaining > 10000 ? '#FFFF00' : '#FF0000';
        
        context.fillStyle = timeColor;
        context.font = 'bold 24px Arial';
        if (this.gameEngine.timeRemaining <= 10000) {
            // 緊急時は点滅
            const flash = Math.sin(Date.now() * 0.01) > 0;
            if (flash) {
                context.fillText(`時間: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 60);
            }
        } else {
            context.fillText(`時間: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 60);
        }
        
        // HP表示（改良版）
        const hpRatio = playerData.currentHP / playerData.maxHP;
        const hpFlash = this.uiState.hpFlashTimer > 0;
        const hpColor = hpFlash ? '#FFFFFF' : 
                       hpRatio > 0.5 ? '#00FF00' : 
                       hpRatio > 0.25 ? '#FFFF00' : '#FF0000';
        
        context.fillStyle = hpColor;
        context.font = 'bold 22px Arial';
        context.fillText(`HP: ${playerData.currentHP}/${playerData.maxHP}`, 20, 100);
        
        // HPバー（グラデーション）
        const hpBarX = 20;
        const hpBarY = 130;
        const hpBarWidth = 250;
        const hpBarHeight = 25;
        
        // HPバー背景
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // HPバーグラデーション
        const hpGradient = context.createLinearGradient(hpBarX, 0, hpBarX + hpBarWidth, 0);
        if (hpRatio > 0.5) {
            hpGradient.addColorStop(0, '#00FF00');
            hpGradient.addColorStop(1, '#88FF88');
        } else if (hpRatio > 0.25) {
            hpGradient.addColorStop(0, '#FFFF00');
            hpGradient.addColorStop(1, '#FFAA00');
        } else {
            hpGradient.addColorStop(0, '#FF0000');
            hpGradient.addColorStop(1, '#FF4444');
        }
        
        context.fillStyle = hpGradient;
        context.fillRect(hpBarX, hpBarY, hpBarWidth * hpRatio, hpBarHeight);
        
        // HPバー枠線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // コンボ表示（改良版）
        const combo = this.gameEngine.scoreManager.combo;
        if (combo > 1) {
            const comboFlash = this.uiState.comboFlashTimer > 0;
            const comboScale = comboFlash ? 1.5 : 1;
            const comboAlpha = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
            
            context.save();
            context.globalAlpha = comboAlpha;
            context.scale(comboScale, comboScale);
            
            // コンボテキストのグラデーション
            const comboGradient = context.createLinearGradient(0, 0, 0, 50);
            comboGradient.addColorStop(0, '#FFD700');
            comboGradient.addColorStop(1, '#FF8C00');
            
            context.fillStyle = comboGradient;
            context.font = `bold ${36 + Math.min(combo * 2, 20)}px Arial`;
            context.textAlign = 'center';
            context.strokeStyle = '#000000';
            context.lineWidth = 3;
            context.strokeText(`${combo} COMBO!`, (canvas.width / 2) / comboScale, 120 / comboScale);
            context.fillText(`${combo} COMBO!`, (canvas.width / 2) / comboScale, 120 / comboScale);
            context.restore();
        }
        
        // ボーナス情報
        if (this.gameEngine.bonusTimeRemaining > 0) {
            const bonusSeconds = Math.ceil(this.gameEngine.bonusTimeRemaining / 1000);
            context.fillStyle = '#FFD700';
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.fillText(`BONUS: ${bonusSeconds}s (x${this.gameEngine.scoreMultiplier})`, canvas.width / 2, 160);
        }
        
        // 時間停止情報
        if (this.gameEngine.timeStopRemaining > 0) {
            const stopSeconds = Math.ceil(this.gameEngine.timeStopRemaining / 1000);
            context.fillStyle = '#00AAFF';
            context.font = 'bold 18px Arial';
            context.textAlign = 'center';
            context.fillText(`TIME STOP: ${stopSeconds}s`, canvas.width / 2, 180);
        }
        
        // 改良されたギブアップボタン
        this.renderGiveUpButton(context);
        
        // 詳細情報ボタン
        this.renderInfoButton(context);
        
        // 詳細情報パネル
        if (this.uiState.showingDetailedInfo) {
            this.renderDetailedInfoPanel(context);
        }
        
        context.restore();
    }
    
    /**
     * ギブアップボタン描画
     */
    renderGiveUpButton(context) {
        const canvas = this.gameEngine.canvas;
        const buttonX = canvas.width - 130;
        const buttonY = 20;
        const buttonWidth = 110;
        const buttonHeight = 45;
        
        // ボタングラデーション
        const buttonGradient = context.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        buttonGradient.addColorStop(0, '#CC0000');
        buttonGradient.addColorStop(1, '#880000');
        
        context.fillStyle = buttonGradient;
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // ボタン枠線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // ボタンテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur = 2;
        context.fillText('ギブアップ', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    }
    
    /**
     * 情報ボタン描画
     */
    renderInfoButton(context) {
        const canvas = this.gameEngine.canvas;
        const buttonX = canvas.width - 60;
        const buttonY = 80;
        const buttonSize = 40;
        
        // 円形ボタン
        context.fillStyle = this.uiState.showingDetailedInfo ? '#0066CC' : '#333333';
        context.beginPath();
        context.arc(buttonX + buttonSize / 2, buttonY + buttonSize / 2, buttonSize / 2, 0, Math.PI * 2);
        context.fill();
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.stroke();
        
        // 情報アイコン
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('i', buttonX + buttonSize / 2, buttonY + buttonSize / 2);
    }
    
    /**
     * 詳細情報パネル描画
     */
    renderDetailedInfoPanel(context) {
        const canvas = this.gameEngine.canvas;
        const panelX = canvas.width - 300;
        const panelY = 130;
        const panelWidth = 280;
        const panelHeight = 200;
        
        // パネル背景
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // パネル内容
        context.fillStyle = '#FFFFFF';
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        let infoY = panelY + 15;
        const lineHeight = 18;
        
        const bubbleCount = this.gameEngine.bubbleManager.getBubbleCount();
        const stageConfig = this.gameEngine.stageManager.getCurrentStage();
        const stageName = stageConfig ? stageConfig.name : 'Unknown';
        
        context.fillText(`ステージ: ${stageName}`, panelX + 10, infoY);
        infoY += lineHeight;
        context.fillText(`泡数: ${bubbleCount}/${this.gameEngine.bubbleManager.maxBubbles}`, panelX + 10, infoY);
        infoY += lineHeight;
        context.fillText(`総AP: ${this.gameEngine.playerData.ap.toLocaleString()}`, panelX + 10, infoY);
        infoY += lineHeight;
        context.fillText(`総TAP: ${this.gameEngine.playerData.tap.toLocaleString()}`, panelX + 10, infoY);
        infoY += lineHeight;
        
        if (this.performanceMetrics.showMetrics) {
            infoY += 10;
            context.fillText(`FPS: ${this.performanceMetrics.fps}`, panelX + 10, infoY);
            infoY += lineHeight;
            context.fillText(`テキスト数: ${this.floatingTextManager.getTextCount()}`, panelX + 10, infoY);
        }
    }
    
    /**
     * パフォーマンス指標描画
     */
    renderPerformanceMetrics(context) {
        const canvas = this.gameEngine.canvas;
        
        context.save();
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(canvas.width - 150, canvas.height - 100, 140, 90);
        
        context.fillStyle = '#00FF00';
        context.font = '12px monospace';
        context.textAlign = 'left';
        
        let y = canvas.height - 85;
        context.fillText(`FPS: ${this.performanceMetrics.fps}`, canvas.width - 140, y);
        y += 15;
        context.fillText(`Bubbles: ${this.performanceMetrics.bubbleCount}`, canvas.width - 140, y);
        y += 15;
        context.fillText(`Texts: ${this.floatingTextManager.getTextCount()}`, canvas.width - 140, y);
        y += 15;
        context.fillText(`Particles: ${this.dragVisualization.particles.length}`, canvas.width - 140, y);
        
        context.restore();
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
            context.fillStyle = `rgba(${red}, ${green}, 0, 0.9)`;
            context.font = 'bold 16px Arial';
            context.textAlign = 'center';
            context.shadowColor = 'rgba(0, 0, 0, 0.8)';
            context.shadowOffsetX = 1;
            context.shadowOffsetY = 1;
            context.shadowBlur = 2;
            context.fillText(
                `${this.dragVisualization.forceIndicator.toFixed(1)}x`,
                current.x,
                current.y - 25
            );
        }
        
        // ターゲット泡のハイライト
        if (this.dragVisualization.targetBubble) {
            const bubble = this.dragVisualization.targetBubble;
            context.strokeStyle = '#FFFF00';
            context.lineWidth = 4;
            context.setLineDash([4, 4]);
            context.beginPath();
            context.arc(bubble.x, bubble.y, bubble.size + 8, 0, Math.PI * 2);
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
        this.dragVisualization.duration = 0;
        this.dragVisualization.intensity = 1;
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
     * スワイプエフェクトを作成
     */
    createSwipeEffect(startPos, endPos, direction) {
        const particleCount = 20;
        const pathLength = Math.sqrt(
            Math.pow(endPos.x - startPos.x, 2) + 
            Math.pow(endPos.y - startPos.y, 2)
        );
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / (particleCount - 1);
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;
            
            this.dragVisualization.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                size: 3 + Math.random() * 4,
                color: `hsl(${200 + Math.random() * 60}, 100%, 50%)`,
                life: 800,
                maxLife: 800,
                alpha: 1
            });
        }
        
        // フローティングテキスト
        this.floatingTextManager.addAnimatedText(
            (startPos.x + endPos.x) / 2,
            (startPos.y + endPos.y) / 2,
            'SWIPE!',
            'special'
        );
    }
    
    /**
     * ピンチエフェクトを作成
     */
    createPinchEffect(center, scale) {
        const particleCount = 30;
        const angleStep = (Math.PI * 2) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = i * angleStep;
            const radius = 50 * scale;
            const x = center.x + Math.cos(angle) * radius;
            const y = center.y + Math.sin(angle) * radius;
            
            this.dragVisualization.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 100 * (scale - 1),
                vy: Math.sin(angle) * 100 * (scale - 1),
                size: 2 + Math.random() * 3,
                color: `hsl(${280 + Math.random() * 40}, 100%, 50%)`,
                life: 1000,
                maxLife: 1000,
                alpha: 1
            });
        }
    }
    
    /**
     * 放射状バーストエフェクトを作成
     */
    createRadialBurstEffect(position, radius) {
        const particleCount = 40;
        const angleStep = (Math.PI * 2) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = i * angleStep + Math.random() * 0.2;
            const speed = 150 + Math.random() * 100;
            
            this.dragVisualization.particles.push({
                x: position.x,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 4,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                life: 1200,
                maxLife: 1200,
                alpha: 1
            });
        }
        
        // フローティングテキスト
        this.floatingTextManager.addAnimatedText(
            position.x,
            position.y - 30,
            'BURST!',
            'combo'
        );
    }
    
    /**
     * 長押しエフェクトを作成
     */
    createLongPressEffect(position) {
        const rings = 3;
        
        for (let ring = 0; ring < rings; ring++) {
            const delay = ring * 200;
            
            setTimeout(() => {
                const particleCount = 20;
                const angleStep = (Math.PI * 2) / particleCount;
                const radius = 30 + ring * 20;
                
                for (let i = 0; i < particleCount; i++) {
                    const angle = i * angleStep;
                    const x = position.x + Math.cos(angle) * radius;
                    const y = position.y + Math.sin(angle) * radius;
                    
                    this.dragVisualization.particles.push({
                        x: x,
                        y: y,
                        vx: 0,
                        vy: -20,
                        size: 3 + Math.random() * 2,
                        color: `hsl(${60 + ring * 30}, 100%, 50%)`,
                        life: 1500,
                        maxLife: 1500,
                        alpha: 1
                    });
                }
            }, delay);
        }
        
        // フローティングテキスト
        this.floatingTextManager.addAnimatedText(
            position.x,
            position.y - 40,
            'POWER!',
            'special'
        );
    }
    
    /**
     * ドラッグビジュアライゼーションを更新（時間経過）
     */
    updateDragVisualization(deltaTime) {
        if (!this.dragVisualization.isActive) {
            return;
        }
        
        // ドラッグの持続時間による視覚効果の調整
        this.dragVisualization.duration += deltaTime;
        
        // 長時間ドラッグしている場合の視覚的なフィードバック
        if (this.dragVisualization.duration > 2000) { // 2秒以上
            this.dragVisualization.intensity = Math.min(2, this.dragVisualization.intensity + deltaTime / 1000);
        }
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
     * ゲームオーバー画面を描画
     */
    renderGameOver(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ゲームオーバーテキスト
        const gameOverGradient = context.createLinearGradient(0, 150, 0, 250);
        gameOverGradient.addColorStop(0, '#FF6666');
        gameOverGradient.addColorStop(1, '#CC0000');
        
        context.fillStyle = gameOverGradient;
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 6;
        context.fillText('GAME OVER', canvas.width / 2, 200);
        
        // 最終スコア
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.fillText(`最終スコア: ${this.gameEngine.playerData.currentScore.toLocaleString()}`, canvas.width / 2, 280);
        
        // 獲得AP
        const earnedAP = Math.floor(this.gameEngine.playerData.currentScore / 100);
        context.font = '24px Arial';
        context.fillStyle = '#FFFF99';
        context.fillText(`獲得AP: ${earnedAP}`, canvas.width / 2, 320);
        
        // 操作説明
        context.font = '20px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('クリックまたはEnterでメニューに戻る', canvas.width / 2, 380);
        
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
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 4;
        context.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
        
        // 再開方法
        context.font = '20px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('ESCまたはPキーで再開', canvas.width / 2, canvas.height / 2 + 50);
        
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
                case 'KeyI':
                    this.toggleDetailedInfo();
                    break;
                case 'KeyF':
                    this.togglePerformanceMetrics();
                    break;
            }
        } else if (event.type === 'click') {
            // UI要素のクリック判定
            this.handleUIClick(event);
        }
        
        // InputManagerに委譲
        this.inputManager.handleInput?.(event);
    }
    
    /**
     * UIクリック処理
     */
    handleUIClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // ギブアップボタン
        const giveUpButtonX = canvas.width - 130;
        const giveUpButtonY = 20;
        const giveUpButtonWidth = 110;
        const giveUpButtonHeight = 45;
        
        if (x >= giveUpButtonX && x <= giveUpButtonX + giveUpButtonWidth && 
            y >= giveUpButtonY && y <= giveUpButtonY + giveUpButtonHeight) {
            this.gameOver();
            return;
        }
        
        // 情報ボタン
        const infoButtonX = canvas.width - 60;
        const infoButtonY = 80;
        const infoButtonSize = 40;
        
        const distToInfo = Math.sqrt(
            Math.pow(x - (infoButtonX + infoButtonSize / 2), 2) + 
            Math.pow(y - (infoButtonY + infoButtonSize / 2), 2)
        );
        
        if (distToInfo <= infoButtonSize / 2) {
            this.toggleDetailedInfo();
            return;
        }
    }
    
    /**
     * 詳細情報表示の切り替え
     */
    toggleDetailedInfo() {
        this.uiState.showingDetailedInfo = !this.uiState.showingDetailedInfo;
    }
    
    /**
     * パフォーマンス表示の切り替え
     */
    togglePerformanceMetrics() {
        this.performanceMetrics.showMetrics = !this.performanceMetrics.showMetrics;
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
                this.gameEngine.playerData.highScores[stageId] = {
                    score: finalScore,
                    date: new Date().toISOString()
                };
                console.log(`New high score for ${stageId}: ${finalScore}`);
                
                // 新記録通知
                this.floatingTextManager.addAnimatedText(
                    this.gameEngine.canvas.width / 2,
                    this.gameEngine.canvas.height / 2 - 100,
                    'NEW RECORD!',
                    'explosive'
                );
            }
        }
        
        // データを保存
        this.gameEngine.playerData.save();
        
        console.log(`Game over. Final score: ${finalScore}, Earned AP: ${earnedAP}`);
    }
}