/**
 * GameUIManager - ゲームUI管理システム
 * 
 * UI状態、フィードバック、アニメーション、フローティングテキストなどの専門的な管理を行います
 */

import { GameControlButtons } from './GameControlButtons.js';
import { ConfirmationDialog } from './ConfirmationDialog.js';

export class GameUIManager {
    constructor(gameEngine, floatingTextManager) {
        this.gameEngine = gameEngine;
        this.floatingTextManager = floatingTextManager;
        
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
        
        // ゲーム状態監視（ボタン表示制御用）
        this.lastGameState = {
            isGameStarted: false,
            isGameOver: false,
            isPaused: false,
            isPreGame: true
        };
        
        // ゲームコントロールボタンとダイアログを初期化
        this.initializeControlButtons();
    }
    
    /**
     * コントロールボタンとダイアログの初期化
     */
    initializeControlButtons() {
        this.gameControlButtons = new GameControlButtons(this.gameEngine, this);
        this.confirmationDialog = new ConfirmationDialog(this.gameEngine);
    }
    
    /**
     * コントロールボタンのレンダリング
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderControlButtons(context) {
        // ダイアログが表示されている場合はボタンを無効にする
        const dialogVisible = this.confirmationDialog.isVisible();
        this.gameControlButtons.setButtonsEnabled(!dialogVisible);
        
        // ボタンのレンダリング
        this.gameControlButtons.render(context);
        
        // ダイアログのレンダリング（ボタンの上に描画）
        this.confirmationDialog.render(context);
    }
    
    /**
     * コントロールボタンのクリック処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} クリックが処理されたかどうか
     */
    handleControlButtonClick(x, y) {
        // まずダイアログのクリック処理を試行
        if (this.confirmationDialog.handleClick(x, y)) {
            return true;
        }
        
        // ダイアログが表示されている場合はボタンクリックを無視
        if (this.confirmationDialog.isVisible()) {
            return false;
        }
        
        // ボタンのクリック処理
        const buttonType = this.gameControlButtons.handleClick(x, y);
        if (buttonType) {
            this.showConfirmationDialog(buttonType);
            return true;
        }
        
        return false;
    }
    
    /**
     * マウス位置の更新（ホバー状態管理）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    updateMousePosition(x, y) {
        this.gameControlButtons.updateMousePosition(x, y);
        this.confirmationDialog.updateMousePosition(x, y);
    }
    
    /**
     * 確認ダイアログの表示
     * @param {string} type - ダイアログタイプ（'giveUp' または 'restart'）
     */
    showConfirmationDialog(type) {
        if (type === 'giveUp') {
            this.confirmationDialog.show(
                'giveUp',
                () => this.executeGiveUp(),
                () => this.cancelAction()
            );
        } else if (type === 'restart') {
            this.confirmationDialog.show(
                'restart',
                () => this.executeRestart(),
                () => this.cancelAction()
            );
        }
    }
    
    /**
     * 確認ダイアログの非表示
     */
    hideConfirmationDialog() {
        this.confirmationDialog.hide();
    }
    
    /**
     * Give Up機能の実行
     */
    executeGiveUp() {
        // ゲームエンジンのGive Up処理を呼び出し
        if (this.gameEngine && typeof this.gameEngine.handleGiveUp === 'function') {
            this.gameEngine.handleGiveUp();
        } else {
            // フォールバック: メインメニューに戻る
            console.log('Give Up executed - returning to main menu');
            if (this.gameEngine.sceneManager) {
                this.gameEngine.sceneManager.switchScene('menu');
            }
        }
    }
    
    /**
     * Restart機能の実行
     */
    executeRestart() {
        // ゲームエンジンのRestart処理を呼び出し
        if (this.gameEngine && typeof this.gameEngine.handleRestart === 'function') {
            this.gameEngine.handleRestart();
        } else {
            // フォールバック: ゲーム状態をリセット
            console.log('Restart executed - resetting game state');
            if (this.gameEngine.gameStateManager) {
                this.gameEngine.gameStateManager.resetGame();
            }
        }
    }
    
    /**
     * アクションのキャンセル
     */
    cancelAction() {
        // キャンセル時は特に何もしない（ダイアログが閉じるだけ）
        console.log('Action cancelled');
    }
    
    /**
     * キーボード処理
     * @param {string} key - キー名
     * @returns {boolean} キーが処理されたかどうか
     */
    handleKeyboard(key) {
        return this.confirmationDialog.handleKeyboard(key);
    }
    
    /**
     * UI状態のリセット
     */
    resetUIState() {
        this.uiState = {
            showingDetailedInfo: false,
            lastComboDisplayTime: 0,
            comboFlashTimer: 0,
            hpFlashTimer: 0,
            timeWarningActive: false,
            scoreAnimationTimer: 0,
            lastScore: 0
        };
        
        this.floatingTextManager.clear();
    }
    
    /**
     * UI状態の更新
     * @param {number} deltaTime - 経過時間
     */
    updateUIState(deltaTime) {
        // ゲーム状態の監視とボタン表示状態の更新
        this.updateGameStateAndButtons();
        
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
        
        // フローティングテキストの更新
        this.floatingTextManager.update(deltaTime);
    }
    
    /**
     * ゲーム状態の監視とボタン表示状態の更新
     */
    updateGameStateAndButtons() {
        // 現在のゲーム状態を取得
        const currentGameState = this.getCurrentGameState();
        
        // 状態が変化した場合のみボタン表示を更新
        if (this.hasGameStateChanged(currentGameState)) {
            this.gameControlButtons.updateButtonVisibility(currentGameState);
            this.lastGameState = { ...currentGameState };
        }
    }
    
    /**
     * 現在のゲーム状態を取得
     * @returns {Object} ゲーム状態オブジェクト
     */
    getCurrentGameState() {
        // GameSceneから状態を取得
        const scene = this.gameEngine.sceneManager?.getCurrentScene();
        
        // GameStateManagerから正しい状態を取得
        const stateManager = scene?.stateManager;
        const gameStats = stateManager?.getGameStats();
        
        return {
            isGameStarted: gameStats?.isGameStarted || false,
            isGameOver: this.gameEngine.isGameOver || false,
            isPaused: scene?.isPaused || false,
            isPreGame: !(gameStats?.isGameStarted || false)
        };
    }
    
    /**
     * ゲーム状態が変化したかどうかを確認
     * @param {Object} currentState - 現在の状態
     * @returns {boolean} 変化があったかどうか
     */
    hasGameStateChanged(currentState) {
        return (
            this.lastGameState.isGameStarted !== currentState.isGameStarted ||
            this.lastGameState.isGameOver !== currentState.isGameOver ||
            this.lastGameState.isPaused !== currentState.isPaused ||
            this.lastGameState.isPreGame !== currentState.isPreGame
        );
    }
    
    /**
     * ゲーム開始メッセージの表示
     */
    showGameStartMessage() {
        const canvas = this.gameEngine.canvas;
        this.floatingTextManager.addAnimatedText(
            canvas.width / 2, 
            canvas.height / 2, 
            'GAME START!', 
            'explosive'
        );
    }
    
    /**
     * アイテム効果通知の表示
     * @param {Object} item - アイテム情報
     */
    showItemEffectNotification(item) {
        if (item.effect.type === 'scoreMultiplier') {
            const canvas = this.gameEngine.canvas;
            this.floatingTextManager.addEffectText(
                canvas.width / 2,
                100,
                `Score x${item.effect.value}`,
                'bonus'
            );
        }
    }
    
    /**
     * スコア変化の処理
     * @param {number} newScore - 新しいスコア
     */
    onScoreChanged(newScore) {
        if (newScore !== this.uiState.lastScore) {
            this.uiState.lastScore = newScore;
            this.uiState.scoreAnimationTimer = 300; // 0.3秒間アニメーション
        }
    }
    
    /**
     * ダメージ受けた時のUI処理
     * @param {number} damage - ダメージ量
     */
    onPlayerDamaged(damage) {
        this.uiState.hpFlashTimer = 500; // 0.5秒間フラッシュ
        
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        // ダメージ表示
        this.floatingTextManager.addDamageText(
            canvas.width / 2,
            canvas.height / 2,
            damage
        );
        
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
     * 回復時のUI処理
     * @param {number} heal - 回復量
     */
    onPlayerHealed(heal) {
        const canvas = this.gameEngine.canvas;
        this.floatingTextManager.addHealText(
            canvas.width / 2,
            canvas.height / 2,
            heal
        );
    }
    
    /**
     * 特殊効果のUI処理
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
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
        
        const message = effectMessages[effectType] || 'SPECIAL EFFECT!';
        const type = effectType === 'rainbow' ? 'bonus' : 
                    effectType === 'clock' ? 'timeStop' :
                    effectType === 'electric' ? 'shock' :
                    effectType === 'spiky' ? 'chain' : 'normal';
        
        this.floatingTextManager.addEffectText(x, y, message, type);
    }
    
    /**
     * 時間警告の表示
     * @param {Object} warnings - 警告情報
     */
    showTimeWarnings(warnings) {
        const canvas = this.gameEngine.canvas;
        
        if (warnings.timeWarning && !this.uiState.timeWarningActive) {
            this.uiState.timeWarningActive = true;
            this.floatingTextManager.addEffectText(
                canvas.width / 2,
                canvas.height / 2 - 50,
                'TIME WARNING!',
                'shock'
            );
        }
        
        if (warnings.urgentWarning) {
            this.floatingTextManager.addEffectText(
                canvas.width / 2,
                canvas.height / 2,
                'HURRY UP!',
                'explosive'
            );
        }
    }
    
    /**
     * コンボ表示の更新
     * @param {number} combo - コンボ数
     */
    updateComboDisplay(combo) {
        if (combo > 1) {
            this.uiState.comboFlashTimer = 200; // 0.2秒間フラッシュ
            this.uiState.lastComboDisplayTime = Date.now();
        }
    }
    
    /**
     * 改良されたUI描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderEnhancedUI(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        context.save();
        
        // スコア（アニメーション付き）
        this.renderAnimatedScore(context, playerData);
        
        // 残り時間（色分け）
        this.renderTimeDisplay(context);
        
        // HP表示（改良版）
        this.renderHPDisplay(context, playerData);
        
        // コンボ表示
        this.renderComboDisplay(context);
        
        // 特殊効果状態表示
        this.renderSpecialEffectsStatus(context);
        
        // ゲームコントロールボタンとダイアログ
        this.renderControlButtons(context);
        
        // 詳細情報表示
        if (this.uiState.showingDetailedInfo) {
            this.renderDetailedInfo(context);
        }
        
        context.restore();
    }
    
    /**
     * アニメーション付きスコア描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {Object} playerData - プレイヤーデータ
     */
    renderAnimatedScore(context, playerData) {
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
    }
    
    /**
     * 時間表示の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderTimeDisplay(context) {
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
    }
    
    /**
     * HP表示の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {Object} playerData - プレイヤーデータ
     */
    renderHPDisplay(context, playerData) {
        const hpRatio = playerData.currentHP / playerData.maxHP;
        const hpFlash = this.uiState.hpFlashTimer > 0;
        const hpColor = hpFlash ? '#FFFFFF' : 
                       hpRatio > 0.5 ? '#00FF00' : 
                       hpRatio > 0.25 ? '#FFFF00' : '#FF0000';
        
        context.fillStyle = hpColor;
        context.font = 'bold 22px Arial';
        context.fillText(`HP: ${playerData.currentHP}/${playerData.maxHP}`, 20, 100);
        
        // HPバー（グラデーション）
        this.renderHPBar(context, hpRatio);
    }
    
    /**
     * HPバーの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {number} hpRatio - HP比率
     */
    renderHPBar(context, hpRatio) {
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
    }
    
    /**
     * コンボ表示の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderComboDisplay(context) {
        const combo = this.gameEngine.scoreManager.getCombo();
        if (combo > 1) {
            const comboFlash = this.uiState.comboFlashTimer > 0;
            context.fillStyle = comboFlash ? '#FFFF00' : '#FFFFFF';
            context.font = 'bold 20px Arial';
            context.textAlign = 'right';
            context.fillText(`コンボ: ${combo}`, this.gameEngine.canvas.width - 20, 20);
        }
    }
    
    /**
     * 特殊効果状態表示の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderSpecialEffectsStatus(context) {
        let statusY = 170;
        
        // ボーナスタイム表示
        if (this.gameEngine.bonusTimeRemaining > 0) {
            context.fillStyle = '#FFD700';
            context.font = 'bold 18px Arial';
            context.textAlign = 'left';
            const bonusSeconds = Math.ceil(this.gameEngine.bonusTimeRemaining / 1000);
            context.fillText(`ボーナスタイム: ${bonusSeconds}秒`, 20, statusY);
            statusY += 25;
        }
        
        // 時間停止表示
        if (this.gameEngine.timeStopRemaining > 0) {
            context.fillStyle = '#00BFFF';
            context.font = 'bold 18px Arial';
            const stopSeconds = Math.ceil(this.gameEngine.timeStopRemaining / 1000);
            context.fillText(`時間停止: ${stopSeconds}秒`, 20, statusY);
            statusY += 25;
        }
        
        // スコア倍率表示
        if (this.gameEngine.scoreMultiplier > 1) {
            context.fillStyle = '#FF69B4';
            context.font = 'bold 18px Arial';
            context.fillText(`スコア倍率: x${this.gameEngine.scoreMultiplier}`, 20, statusY);
        }
    }
    
    /**
     * 詳細情報の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderDetailedInfo(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(canvas.width - 300, 0, 300, 200);
        
        // 詳細情報テキスト
        context.fillStyle = '#FFFFFF';
        context.font = '14px Arial';
        context.textAlign = 'left';
        
        const info = [
            `泡の数: ${this.gameEngine.bubbleManager.getBubbleCount()}`,
            `コンボ: ${this.gameEngine.scoreManager.getCombo()}`,
            `スコア倍率: x${this.gameEngine.scoreMultiplier}`,
            `ボーナス時間: ${this.gameEngine.bonusTimeRemaining}ms`,
            `時間停止: ${this.gameEngine.timeStopRemaining}ms`
        ];
        
        info.forEach((text, index) => {
            context.fillText(text, canvas.width - 290, 20 + index * 20);
        });
    }
    
    /**
     * フローティングテキストの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderFloatingText(context) {
        this.floatingTextManager.render(context);
    }
    
    /**
     * 詳細情報表示の切り替え
     */
    toggleDetailedInfo() {
        this.uiState.showingDetailedInfo = !this.uiState.showingDetailedInfo;
    }
    
    /**
     * UI状態の取得
     * @returns {Object} UI状態
     */
    getUIState() {
        return { ...this.uiState };
    }
}