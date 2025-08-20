/**
 * GameUIManager - ゲームUI管理システム
 * 
 * UI状態、フィードバック、アニメーション、フローティングテキストなどの専門的な管理を行います
 */

import { GameControlButtons } from './GameControlButtons.js';''
import { ConfirmationDialog } from './ConfirmationDialog.js';''
import { ScaledCoordinateManager } from '../../utils/ScaledCoordinateManager.js';''
import { UIPositionCalculator } from '../../utils/UIPositionCalculator.js';''
import { ScaledRenderingContext } from '../../utils/ScaledRenderingContext.js';''
import { CoordinateSystemDebugger } from '../../utils/CoordinateSystemDebugger.js';''
import { FloatingTextManager } from '../../managers/FloatingTextManager.js';''
import { ResponsiveCanvasManager } from '../../managers/ResponsiveCanvasManager.js';''
import { SceneManager } from '../../managers/SceneManager.js';''
import { GameScene } from '../GameScene.js';''
import { GameStateManager } from './GameStateManager.js';

// Type definitions
interface UIState { showingDetailedInfo: boolean,
    lastComboDisplayTime: number,
    comboFlashTimer: number,
    hpFlashTimer: number,
    timeWarningActive: boolean,
    scoreAnimationTimer: number,
    lastScore: number; }
}

interface GameState { isGameStarted: boolean,
    isGameOver: boolean,
    isPaused: boolean,
    isPreGame: boolean; }
}

interface PlayerData { currentHP: number,
    maxHP: number,
    currentScore: number; }
}

interface TimeWarnings { timeWarning: boolean,
    urgentWarning: boolean,
    message: string | null; }
}

interface Item { effect: {
        type: string,
        value: number; }
    };
}

// Extended GameEngine interface
interface GameEngine { canvas: HTMLCanvasElement,
    responsiveCanvasManager?: ResponsiveCanvasManager;
    sceneManager?: SceneManager;
    playerData: PlayerData,
    scoreManager: {
        getCombo(): number, }
    };
    bubbleManager: { getBubbleCount(): number, }
    };
    gameStateManager?: GameStateManager;
    isGameOver: boolean,
    timeRemaining: number,
    bonusTimeRemaining: number,
    timeStopRemaining: number,
    scoreMultiplier: number,
    screenShakeRemaining: number,
    screenShakeIntensity: number,
    handleGiveUp?(): void;
    handleRestart?(): void;
}

export class GameUIManager {
    private gameEngine: GameEngine;
    private floatingTextManager: FloatingTextManager;
    private uiState: UIState;
    private lastGameState: GameState;
    // UI Components
    private gameControlButtons: GameControlButtons;
    private confirmationDialog: ConfirmationDialog;
    // Coordinate system components
    public scaledCoordinateManager: ScaledCoordinateManager,
    public uiPositionCalculator: UIPositionCalculator,
    private scaledRenderingContext: ScaledRenderingContext | null = null;
    private coordinateDebugger?: CoordinateSystemDebugger;

    constructor(gameEngine: GameEngine, floatingTextManager: FloatingTextManager) {

        this.gameEngine = gameEngine;
        this.floatingTextManager = floatingTextManager;
        
        // スケーリング座標システムを初期化
        this.initializeCoordinateSystem();
        
        // UI状態管理
        this.uiState = {
            showingDetailedInfo: false,
            lastComboDisplayTime: 0,
            comboFlashTimer: 0,
            hpFlashTimer: 0,
            timeWarningActive: false,
            scoreAnimationTimer: 0,

    }
    }
            lastScore: 0 }
        },
        
        // ゲーム状態監視（ボタン表示制御用）
        this.lastGameState = { isGameStarted: false,
            isGameOver: false,
            isPaused: false,
            isPreGame: true }
        },
        
        // ゲームコントロールボタンとダイアログを初期化
        this.initializeControlButtons();
    }
    
    /**
     * スケーリング座標システムを初期化
     */
    private initializeCoordinateSystem(): void { try {
            // ResponsiveCanvasManagerから座標システムを取得
            const responsiveCanvasManager = this.gameEngine? .responsiveCanvasManager;'
            '';
            if(responsiveCanvasManager') {
                // 既存のScaledCoordinateManagerを使用
            }
                this.scaledCoordinateManager = responsiveCanvasManager.scaledCoordinateManager; }
            } else {  : undefined'
                // フォールバック: 独自にScaledCoordinateManagerを作成''
                console.warn('GameUIManager: ResponsiveCanvasManager not available, creating fallback coordinate system'); }
                this.scaledCoordinateManager = new ScaledCoordinateManager(null); }
            }
            ';
            // UIPositionCalculatorを初期化''
            this.uiPositionCalculator = new UIPositionCalculator(this.scaledCoordinateManager');
            
            // ScaledRenderingContextは描画時に初期化
            this.scaledRenderingContext = null;
            ';
            // デバッグユーティリティを初期化（開発時のみ）''
            if (window.location.search.includes('debug=true'') || localStorage.getItem('coordinateDebug'') === 'true') { this.coordinateDebugger = new CoordinateSystemDebugger(
                    this.scaledCoordinateManager,);
                    this.uiPositionCalculator)';
                    null // InputCoordinateConverter は必要に応じて後で設定'';
                ');''
                console.log('Coordinate system debugger initialized. Press Ctrl+Shift+C to toggle.');' }'
            } catch (error') { ''
            console.error('GameUIManager: Failed to initialize coordinate system', error);
            // フォールバック処理'
            this.scaledCoordinateManager = new ScaledCoordinateManager(null);''
            this.uiPositionCalculator = new UIPositionCalculator(this.scaledCoordinateManager');
            this.scaledRenderingContext = null;
            ';
            // デバッグユーティリティ（フォールバック）''
            if (window.location.search.includes('debug=true'') || localStorage.getItem('coordinateDebug'') === 'true') {
                this.coordinateDebugger = new CoordinateSystemDebugger(;
                    this.scaledCoordinateManager,);
                    this.uiPositionCalculator);
                    null;
                ); }
            }
        }
    }
    
    /**
     * ScaledRenderingContextを取得（遅延初期化）
     * @param context - キャンバスコンテキスト
     * @returns スケーリング対応コンテキスト
     */
    private getScaledRenderingContext(context: CanvasRenderingContext2D): ScaledRenderingContext { if (!this.scaledRenderingContext || this.scaledRenderingContext.getOriginalContext() !== context) {
            this.scaledRenderingContext = new ScaledRenderingContext(context, this.scaledCoordinateManager); }
        }
        return this.scaledRenderingContext;
    }
    
    /**
     * コントロールボタンとダイアログの初期化
     */
    private initializeControlButtons(): void { this.gameControlButtons = new GameControlButtons(this.gameEngine, this);
        this.confirmationDialog = new ConfirmationDialog(this.gameEngine); }
    }
    
    /**
     * コントロールボタンのレンダリング
     * @param context - 描画コンテキスト
     */
    private renderControlButtons(context: CanvasRenderingContext2D): void { // ダイアログが表示されている場合はボタンを無効にする
        const dialogVisible = this.confirmationDialog.isVisible();
        this.gameControlButtons.setButtonsEnabled(!dialogVisible);
        
        // ボタンのレンダリング
        this.gameControlButtons.render(context);
        
        // ダイアログのレンダリング（ボタンの上に描画）
        this.confirmationDialog.render(context); }
    }
    
    /**
     * コントロールボタンのクリック処理
     * @param x - X座標
     * @param y - Y座標
     * @param event - マウス/タッチイベント（オプション）
     * @returns クリックが処理されたかどうか
     */
    public handleControlButtonClick(x: number, y: number, event: Event | null = null): boolean { // まずダイアログのクリック処理を試行
        if(this.confirmationDialog.handleClick(x, y) {
            
        }
            return true; }
        }
        
        // ダイアログが表示されている場合はボタンクリックを無視
        if(this.confirmationDialog.isVisible() { return false; }
        }
        
        // ボタンのクリック処理（イベントを渡して座標変換を有効化）
        const buttonType = this.gameControlButtons.handleClick(x, y, event);
        if(buttonType) {
            this.showConfirmationDialog(buttonType);
        }
            return true; }
        }
        
        return false;
    }
    
    /**
     * マウス位置の更新（ホバー状態管理）
     * @param x - X座標
     * @param y - Y座標
     * @param event - マウスイベント（オプション）
     */
    public updateMousePosition(x: number, y: number, event: MouseEvent | null = null): void { // マウス使用時はキーボードナビゲーションをクリア
        this.gameControlButtons.clearKeyboardFocus();
        
        // イベントを渡して座標変換を有効化
        this.gameControlButtons.updateMousePosition(x, y, event);
        this.confirmationDialog.updateMousePosition(x, y, event); }
    }
    
    /**
     * キーボードイベント処理
     * @param event - キーボードイベント
     * @returns イベントが処理されたかどうか'
     */''
    public handleKeyboard(event: KeyboardEvent | string'): boolean { // 文字列の場合は下位互換性のための処理''
        if(typeof event === 'string') {
            
        }
            return this.confirmationDialog.handleKeyboard(event); }
        }
        
        // ダイアログが表示されている場合はダイアログに委譲
        if(this.confirmationDialog.isVisible() { return this.confirmationDialog.handleKeyboard(event); }
        }
        
        // ボタンのキーボードナビゲーション処理
        return this.gameControlButtons.handleKeyboardNavigation(event);
    }
    
    /**
     * タッチ開始処理
     * @param x - X座標
     * @param y - Y座標
     * @returns タッチが処理されたかどうか
     */
    public handleTouchStart(x: number, y: number): boolean { // まずダイアログのタッチ処理を試行
        if(this.confirmationDialog.handleClick(x, y) {
            
        }
            return true; }
        }
        
        // ダイアログが表示されている場合はボタンタッチを無視
        if(this.confirmationDialog.isVisible() { return false; }
        }
        
        // ボタンのタッチ開始処理
        const touchedButton = this.gameControlButtons.handleTouchStart(x, y);
        return touchedButton !== null;
    }
    
    /**
     * タッチ終了処理
     * @param x - X座標
     * @param y - Y座標
     * @returns タッチが処理されたかどうか
     */
    public handleTouchEnd(x: number, y: number): boolean { // ダイアログが表示されている場合は何もしない
        if(this.confirmationDialog.isVisible() {
            
        }
            return false; }
        }
        
        // ボタンのタッチ終了処理
        const completedButton = this.gameControlButtons.handleTouchEnd(x, y);
        if(completedButton) {
            this.showConfirmationDialog(completedButton);
        }
            return true; }
        }
        
        return false;
    }
    
    /**
     * タッチキャンセル処理
     */'
    public handleTouchCancel(): void { ''
        this.gameControlButtons.handleTouchCancel(''';
     * @param type - ダイアログタイプ（'giveUp' または 'restart'）)'
     */')'
    public showConfirmationDialog(type: 'giveUp' | 'restart''): void {''
        if(type === 'giveUp'') {'
            this.confirmationDialog.show(')';
                'giveUp');
                () => this.executeGiveUp(),';
                () => this.cancelAction()';
        }'
            ');' }'
        } else if (type === 'restart'') { this.confirmationDialog.show(')'
                'restart');
                () => this.executeRestart(),
                () => this.cancelAction(); }
        }
    }
    
    /**
     * 確認ダイアログの非表示
     */
    public hideConfirmationDialog(): void { this.confirmationDialog.hide(); }
    }
    
    /**
     * Give Up機能の実行'
     */''
    private executeGiveUp('')';
        if(this.gameEngine && typeof this.gameEngine.handleGiveUp === 'function') {'
            '';
            this.gameEngine.handleGiveUp('')';
            console.log('Give Up executed - returning to main menu');''
            if (this.gameEngine.sceneManager') {'
        }'
                this.gameEngine.sceneManager.switchScene('menu'); }
            }
        }
    }
    
    /**
     * Restart機能の実行'
     */''
    private executeRestart('')';
        if(this.gameEngine && typeof this.gameEngine.handleRestart === 'function') {'
            '';
            this.gameEngine.handleRestart('')';
            console.log('Restart executed - resetting game state');
            if (this.gameEngine.gameStateManager) {
        }
                this.gameEngine.gameStateManager.resetGame(); }
            }
        }
    }
    
    /**
     * アクションのキャンセル'
     */''
    private cancelAction('')';
        console.log('Action cancelled');
    }
    
    /**
     * UI状態のリセット
     */
    public resetUIState(): void { this.uiState = {
            showingDetailedInfo: false,
            lastComboDisplayTime: 0,
            comboFlashTimer: 0,
            hpFlashTimer: 0,
            timeWarningActive: false,
            scoreAnimationTimer: 0,
            lastScore: 0 }
        },
        
        this.floatingTextManager.clear();
    }
    
    /**
     * UI状態の更新
     * @param deltaTime - 経過時間
     */
    public updateUIState(deltaTime: number): void { // ゲーム状態の監視とボタン表示状態の更新
        this.updateGameStateAndButtons();
        
        // コンボフラッシュタイマー
        if(this.uiState.comboFlashTimer > 0) {
            
        }
            this.uiState.comboFlashTimer -= deltaTime; }
        }
        
        // HPフラッシュタイマー
        if (this.uiState.hpFlashTimer > 0) { this.uiState.hpFlashTimer -= deltaTime; }
        }
        
        // スコアアニメーションタイマー
        if (this.uiState.scoreAnimationTimer > 0) { this.uiState.scoreAnimationTimer -= deltaTime; }
        }
        
        // フローティングテキストの更新
        this.floatingTextManager.update(deltaTime);
    }
    
    /**
     * ゲーム状態の監視とボタン表示状態の更新
     */
    private updateGameStateAndButtons(): void { // 現在のゲーム状態を取得
        const currentGameState = this.getCurrentGameState();
        
        // 状態が変化した場合のみボタン表示を更新
        if(this.hasGameStateChanged(currentGameState) {
            
        }
            this.gameControlButtons.updateButtonVisibility(currentGameState); }
            this.lastGameState = { ...currentGameState };
        }
    }
    
    /**
     * 現在のゲーム状態を取得
     * @returns ゲーム状態オブジェクト
     */
    private getCurrentGameState(): GameState { // GameSceneから状態を取得
        const scene = this.gameEngine.sceneManager? .getCurrentScene() as GameScene;
        
        // GameStateManagerから正しい状態を取得
        const stateManager = scene?.stateManager;
        const gameStats = stateManager?.getGameStats();
        
        return { : undefined
            isGameStarted: gameStats? .isGameStarted || false, : undefined;
            isGameOver: this.gameEngine.isGameOver || false,
            isPaused: scene? .isPaused || false, : undefined };
            isPreGame: !(gameStats? .isGameStarted || false); }
        };
    }
    
    /**
     * ゲーム状態が変化したかどうかを確認
     * @param currentState - 現在の状態
     * @returns 変化があったかどうか
     */ : undefined
    private hasGameStateChanged(currentState: GameState): boolean { return (
            this.lastGameState.isGameStarted !== currentState.isGameStarted ||;
            this.lastGameState.isGameOver !== currentState.isGameOver ||;
            this.lastGameState.isPaused !== currentState.isPaused ||;
            this.lastGameState.isPreGame !== currentState.isPreGame;
        ); }
    }
    
    /**
     * ゲーム開始メッセージの表示'
     */''
    public showGameStartMessage(''';
            'GAME START!', ')';
            'explosive');
    }
    
    /**
     * アイテム効果通知の表示
     * @param item - アイテム情報'
     */''
    public showItemEffectNotification(item: Item'): void { ''
        if(item.effect.type === 'scoreMultiplier') {
            const canvas = this.gameEngine.canvas;
            this.floatingTextManager.addEffectText(;
                canvas.width / 2,)';
                100)'';
                `Score x${item.effect.value')`,'
        }'
                'bonus' }
            });
        }
    }
    
    /**
     * スコア変化の処理
     * @param newScore - 新しいスコア
     */
    public onScoreChanged(newScore: number): void { if (newScore !== this.uiState.lastScore) {
            this.uiState.lastScore = newScore;
            this.uiState.scoreAnimationTimer = 300; // 0.3秒間アニメーション }
        }
    }
    
    /**
     * ダメージ受けた時のUI処理
     * @param damage - ダメージ量
     */
    public onPlayerDamaged(damage: number): void { this.uiState.hpFlashTimer = 500; // 0.5秒間フラッシュ
        
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        // ダメージ表示
        this.floatingTextManager.addDamageText(;
            canvas.width / 2);
            canvas.height / 2,);
            damage);
        ';
        // 低HP警告''
        if(playerData.currentHP <= playerData.maxHP * 0.25') {
            this.floatingTextManager.addEffectText(;
                canvas.width / 2)';
                canvas.height / 2 + 50,'';
                'LOW HP!',');
        }'
                'shock'); }
        }
    }
    
    /**
     * 回復時のUI処理
     * @param heal - 回復量
     */
    public onPlayerHealed(heal: number): void { const canvas = this.gameEngine.canvas;
        this.floatingTextManager.addHealText(;
            canvas.width / 2);
            canvas.height / 2,);
            heal); }
    }
    
    /**
     * 特殊効果のUI処理
     * @param effectType - エフェクトタイプ
     * @param x - X座標
     * @param y - Y座標'
     */''
    public onSpecialEffect(effectType: string, x: number, y: number'): void {'
        const effectMessages: { [key: string]: string } = { ''
            rainbow: 'BONUS TIME!','';
            clock: 'TIME STOP!','';
            electric: 'SHOCKED!','';
            spiky: 'CHAIN REACTION!','';
            poison: 'POISONED!','';
            pink: 'HEALED!' }
        },'
        '';
        const message = effectMessages[effectType] || 'SPECIAL EFFECT!';''
        const type = effectType === 'rainbow' ? 'bonus' : '';
                    effectType === 'clock' ? 'timeStop' :'';
                    effectType === 'electric' ? 'shock' :'';
                    effectType === 'spiky' ? 'chain' : 'normal';
        
        this.floatingTextManager.addEffectText(x, y, message, type);
    }
    
    /**
     * 時間警告の表示
     * @param warnings - 警告情報
     */
    public showTimeWarnings(warnings: TimeWarnings): void { const canvas = this.gameEngine.canvas;'
        '';
        if(warnings.timeWarning && !this.uiState.timeWarningActive') {
            this.uiState.timeWarningActive = true;
            this.floatingTextManager.addEffectText(;
                canvas.width / 2)';
                canvas.height / 2 - 50,'';
                'TIME WARNING!',');
        }'
                'shock'); }
        }'
        '';
        if(warnings.urgentWarning') {
            this.floatingTextManager.addEffectText(;
                canvas.width / 2)';
                canvas.height / 2,'';
                'HURRY UP!',');
        }'
                'explosive'); }
        }
    }
    
    /**
     * コンボ表示の更新
     * @param combo - コンボ数
     */
    public updateComboDisplay(combo: number): void { if (combo > 1) {
            this.uiState.comboFlashTimer = 200; // 0.2秒間フラッシュ
            this.uiState.lastComboDisplayTime = Date.now(); }
        }
    }
    
    /**
     * 改良されたUI描画
     * @param context - 描画コンテキスト
     */
    public renderEnhancedUI(context: CanvasRenderingContext2D): void { const canvas = this.gameEngine.canvas;
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
        if(this.uiState.showingDetailedInfo) {
            
        }
            this.renderDetailedInfo(context); }
        }
        
        context.restore();
    }
    
    /**
     * アニメーション付きスコア描画
     * @param context - 描画コンテキスト
     * @param playerData - プレイヤーデータ
     */'
    private renderAnimatedScore(context: CanvasRenderingContext2D, playerData: PlayerData): void { try {''
            const scaledContext = this.getScaledRenderingContext(context');''
            const scorePosition = this.uiPositionCalculator.getStatusPosition('score');
            
            const scoreScale = this.uiState.scoreAnimationTimer > 0 ? 1.2 : 1;
            ';
            scaledContext.save();''
            context.scale(scoreScale, scoreScale');''
            context.fillStyle = '#FFFFFF';''
            context.textAlign = 'left';''
            context.textBaseline = 'top';''
            context.shadowColor = 'rgba(0, 0, 0, 0.8')';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 4;
            ';
            // スケーリング対応フォント設定''
            scaledContext.setScaledFont(28, 'bold Arial');
            
            // スケーリング対応座標でテキストを描画
            const baseX = scorePosition.x / this.scaledCoordinateManager.getScaleFactor() / scoreScale;
            const baseY = scorePosition.y / this.scaledCoordinateManager.getScaleFactor() / scoreScale; }
            scaledContext.fillText(`スコア: ${playerData.currentScore.toLocaleString(})}`, baseX, baseY);
            ';
            // デバッグ用エレメントトラッキング''
            if(this.coordinateDebugger') {'
                ';
            }'
                this.coordinateDebugger.trackElement('score', scorePosition.x, scorePosition.y, 150, 30, '#4CAF50'); }
            }
            ';
            scaledContext.restore();''
        } catch (error') { ''
            console.warn('GameUIManager: renderAnimatedScore failed, using fallback', error);
            // フォールバック: 元の実装
            const scoreScale = this.uiState.scoreAnimationTimer > 0 ? 1.2 : 1;'
            context.save();''
            context.scale(scoreScale, scoreScale');''
            context.fillStyle = '#FFFFFF';''
            context.font = 'bold 28px Arial';''
            context.textAlign = 'left';''
            context.textBaseline = 'top';''
            context.shadowColor = 'rgba(0, 0, 0, 0.8')';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 4; }
            context.fillText(`スコア: ${playerData.currentScore.toLocaleString(})}`, 20 / scoreScale, 20 / scoreScale);
            context.restore();
        }
    }
    
    /**
     * 時間表示の描画
     * @param context - 描画コンテキスト
     */'
    private renderTimeDisplay(context: CanvasRenderingContext2D): void { try {''
            const scaledContext = this.getScaledRenderingContext(context');''
            const timePosition = this.uiPositionCalculator.getStatusPosition('time');
            ';
            const minutes = Math.floor(this.gameEngine.timeRemaining / 60000);''
            const seconds = Math.floor((this.gameEngine.timeRemaining % 60000) / 1000');''
            const timeColor = this.gameEngine.timeRemaining > 30000 ? '#FFFFFF' : '';
                             this.gameEngine.timeRemaining > 10000 ? '#FFFF00' : '#FF0000';
            ';
            context.fillStyle = timeColor;''
            context.textAlign = 'left';''
            context.textBaseline = 'top';''
            context.shadowColor = 'rgba(0, 0, 0, 0.8')';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 4;
            ';
            // スケーリング対応フォント設定''
            scaledContext.setScaledFont(24, 'bold Arial');'
            ' }'
            const timeText = `時間: ${minutes}:${seconds.toString(').padStart(2, '0'})}`;
            
            if(this.gameEngine.timeRemaining <= 10000) {
            
                // 緊急時は点滅
                const flash = Math.sin(Date.now() * 0.01) > 0;
                if (flash) {
                    const baseX = timePosition.x / this.scaledCoordinateManager.getScaleFactor();
                    const baseY = timePosition.y / this.scaledCoordinateManager.getScaleFactor();
            
            }
                    scaledContext.fillText(timeText, baseX, baseY); }
                }
            } else {  const baseX = timePosition.x / this.scaledCoordinateManager.getScaleFactor();
                const baseY = timePosition.y / this.scaledCoordinateManager.getScaleFactor(); }'
                scaledContext.fillText(timeText, baseX, baseY);' }'
            } catch (error') { ''
            console.warn('GameUIManager: renderTimeDisplay failed, using fallback', error);
            // フォールバック: 元の実装'
            const minutes = Math.floor(this.gameEngine.timeRemaining / 60000);''
            const seconds = Math.floor((this.gameEngine.timeRemaining % 60000) / 1000');''
            const timeColor = this.gameEngine.timeRemaining > 30000 ? '#FFFFFF' : '';
                             this.gameEngine.timeRemaining > 10000 ? '#FFFF00' : '#FF0000';
            ';
            context.fillStyle = timeColor;''
            context.font = 'bold 24px Arial';
            
            if(this.gameEngine.timeRemaining <= 10000) {
            
                const flash = Math.sin(Date.now() * 0.01) > 0;
            
            }'
                if (flash) {' }'
                    context.fillText(`時間: ${minutes):${seconds.toString(').padStart(2, '0'})}`, 20, 60);
                }'
            } else { ' }'
                context.fillText(`時間: ${minutes):${seconds.toString(').padStart(2, '0'})}`, 20, 60);
            }
        }
    }
    
    /**
     * HP表示の描画
     * @param context - 描画コンテキスト
     * @param playerData - プレイヤーデータ
     */'
    private renderHPDisplay(context: CanvasRenderingContext2D, playerData: PlayerData): void { try {''
            const scaledContext = this.getScaledRenderingContext(context');''
            const hpPosition = this.uiPositionCalculator.getStatusPosition('hp'');
            
            const hpRatio = playerData.currentHP / playerData.maxHP;'
            const hpFlash = this.uiState.hpFlashTimer > 0;''
            const hpColor = hpFlash ? '#FFFFFF' : '';
                           hpRatio > 0.5 ? '#00FF00' : '';
                           hpRatio > 0.25 ? '#FFFF00' : '#FF0000';
            ';
            context.fillStyle = hpColor;''
            context.textAlign = 'left';''
            context.textBaseline = 'top';''
            context.shadowColor = 'rgba(0, 0, 0, 0.8')';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 4;
            ';
            // スケーリング対応フォント設定''
            scaledContext.setScaledFont(22, 'bold Arial');
            
            const baseX = hpPosition.x / this.scaledCoordinateManager.getScaleFactor();
            const baseY = hpPosition.y / this.scaledCoordinateManager.getScaleFactor(); }
            scaledContext.fillText(`HP: ${playerData.currentHP}/${ playerData.maxHP)`, baseX, baseY);
            
            // HPバー（グラデーション） }'
            this.renderHPBar(context, hpRatio});''
        } catch (error') { ''
            console.warn('GameUIManager: renderHPDisplay failed, using fallback', error');
            // フォールバック: 元の実装
            const hpRatio = playerData.currentHP / playerData.maxHP;'
            const hpFlash = this.uiState.hpFlashTimer > 0;''
            const hpColor = hpFlash ? '#FFFFFF' : '';
                           hpRatio > 0.5 ? '#00FF00' : '';
                           hpRatio > 0.25 ? '#FFFF00' : '#FF0000';
            ';
            context.fillStyle = hpColor;''
            context.font = 'bold 22px Arial'; }
            context.fillText(`HP: ${playerData.currentHP}/${ playerData.maxHP)`, 20, 100);
            
            // HPバー（グラデーション） }
            this.renderHPBar(context, hpRatio});
        }
    }
    
    /**
     * HPバーの描画
     * @param context - 描画コンテキスト
     * @param hpRatio - HP比率
     */'
    private renderHPBar(context: CanvasRenderingContext2D, hpRatio: number): void { try {''
            const scaledContext = this.getScaledRenderingContext(context');''
            const hpPosition = this.uiPositionCalculator.getStatusPosition('hp');
            
            // HPバーの位置をHP表示の下に配置'
            const baseBarX = hpPosition.x / this.scaledCoordinateManager.getScaleFactor();''
            const baseBarY = (hpPosition.y / this.scaledCoordinateManager.getScaleFactor()') + 30;
            const baseBarWidth = 250;
            const baseBarHeight = 25;
            ';
            // HPバー背景''
            context.fillStyle = 'rgba(255, 255, 255, 0.2')';
            scaledContext.fillRect(baseBarX, baseBarY, baseBarWidth, baseBarHeight);
            
            // HPバーグラデーション（スケーリング対応）
            const scaledBarPosition = this.scaledCoordinateManager.getScaledPosition(baseBarX, baseBarY);
            const scaledBarSize = this.scaledCoordinateManager.getScaledSize(baseBarWidth, baseBarHeight);
            ';
            const hpGradient = context.createLinearGradient(scaledBarPosition.x, 0, scaledBarPosition.x + scaledBarSize.width, 0);''
            if(hpRatio > 0.5') {'
                '';
                hpGradient.addColorStop(0, '#00FF00'');'
            }'
                hpGradient.addColorStop(1, '#88FF88');' }'
            } else if (hpRatio > 0.25') { ''
                hpGradient.addColorStop(0, '#FFFF00'');''
                hpGradient.addColorStop(1, '#FFAA00''); }'
            } else {  ''
                hpGradient.addColorStop(0, '#FF0000'');' }'
                hpGradient.addColorStop(1, '#FF4444'); }
            }
            ';
            context.fillStyle = hpGradient;''
            scaledContext.fillRect(baseBarX, baseBarY, baseBarWidth * hpRatio, baseBarHeight');
            ';
            // HPバー枠線''
            context.strokeStyle = '#FFFFFF';
            scaledContext.setScaledLineWidth(2);'
            scaledContext.strokeRect(baseBarX, baseBarY, baseBarWidth, baseBarHeight);''
        } catch (error') { ''
            console.warn('GameUIManager: renderHPBar failed, using fallback', error');
            // フォールバック: 元の実装
            const hpBarX = 20;
            const hpBarY = 130;
            const hpBarWidth = 250;
            const hpBarHeight = 25;'
            '';
            context.fillStyle = 'rgba(255, 255, 255, 0.2')';
            context.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
            ';
            const hpGradient = context.createLinearGradient(hpBarX, 0, hpBarX + hpBarWidth, 0);''
            if(hpRatio > 0.5') {'
                '';
                hpGradient.addColorStop(0, '#00FF00'');'
            }'
                hpGradient.addColorStop(1, '#88FF88');' }'
            } else if (hpRatio > 0.25') { ''
                hpGradient.addColorStop(0, '#FFFF00'');''
                hpGradient.addColorStop(1, '#FFAA00''); }'
            } else {  ''
                hpGradient.addColorStop(0, '#FF0000'');' }'
                hpGradient.addColorStop(1, '#FF4444'); }
            }
            ';
            context.fillStyle = hpGradient;''
            context.fillRect(hpBarX, hpBarY, hpBarWidth * hpRatio, hpBarHeight');'
            '';
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        }
    }
    
    /**
     * コンボ表示の描画
     * @param context - 描画コンテキスト
     */
    private renderComboDisplay(context: CanvasRenderingContext2D): void { try {
            const combo = this.gameEngine.scoreManager.getCombo();
            if(combo > 1) {
                const scaledContext = this.getScaledRenderingContext(context);'
                const canvasInfo = this.scaledCoordinateManager.getCanvasInfo();''
                const margins = this.uiPositionCalculator.getResponsiveMargins(''';
                context.fillStyle = comboFlash ? '#FFFF00' : '#FFFFFF';''
                context.textAlign = 'right';')'
                context.textBaseline = 'top';')'
                context.shadowColor = 'rgba(0, 0, 0, 0.8')';
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.shadowBlur = 4;
                ';
                // スケーリング対応フォント設定''
                scaledContext.setScaledFont(20, 'bold Arial');
            }
                 }'
                scaledContext.fillText(`コンボ: ${combo)`, baseX, baseY});''
            } catch (error') { ''
            console.warn('GameUIManager: renderComboDisplay failed, using fallback', error);
            // フォールバック: 元の実装'
            const combo = this.gameEngine.scoreManager.getCombo();''
            if(combo > 1') {'
                const comboFlash = this.uiState.comboFlashTimer > 0;''
                context.fillStyle = comboFlash ? '#FFFF00' : '#FFFFFF';''
                context.font = 'bold 20px Arial';'
            }'
                context.textAlign = 'right'; }
                context.fillText(`コンボ: ${combo)`, this.gameEngine.canvas.width - 20, 20});
            }
        }
    }
    
    /**
     * 特殊効果状態表示の描画
     * @param context - 描画コンテキスト
     */
    private renderSpecialEffectsStatus(context: CanvasRenderingContext2D): void { try {'
            const scaledContext = this.getScaledRenderingContext(context);''
            const margins = this.uiPositionCalculator.getResponsiveMargins('')';
            const hpPosition = this.uiPositionCalculator.getStatusPosition('hp');''
            let baseY = (hpPosition.y / this.scaledCoordinateManager.getScaleFactor()') + 60; // HPバーの下
            const baseX = margins.left;
            const lineSpacing = 25;'
            '';
            context.textAlign = 'left';''
            context.textBaseline = 'top';''
            context.shadowColor = 'rgba(0, 0, 0, 0.8')';
            context.shadowOffsetX = 1;
            context.shadowOffsetY = 1;
            context.shadowBlur = 2;
            ';
            // スケーリング対応フォント設定''
            scaledContext.setScaledFont(18, 'bold Arial');
            ';
            // ボーナスタイム表示''
            if(this.gameEngine.bonusTimeRemaining > 0') {'
                '';
                context.fillStyle = '#FFD700';
            }
                const bonusSeconds = Math.ceil(this.gameEngine.bonusTimeRemaining / 1000); }
                scaledContext.fillText(`ボーナスタイム: ${bonusSeconds)秒`, baseX, baseY});
                baseY += lineSpacing;
            }
            ';
            // 時間停止表示''
            if(this.gameEngine.timeStopRemaining > 0') {'
                '';
                context.fillStyle = '#00BFFF';
            }
                const stopSeconds = Math.ceil(this.gameEngine.timeStopRemaining / 1000); }
                scaledContext.fillText(`時間停止: ${stopSeconds)秒`, baseX, baseY});
                baseY += lineSpacing;
            }
            ';
            // スコア倍率表示''
            if(this.gameEngine.scoreMultiplier > 1') {'
                ';
            }'
                context.fillStyle = '#FF69B4'; }'
                scaledContext.fillText(`スコア倍率: x${this.gameEngine.scoreMultiplier)`, baseX, baseY});''
            } catch (error') { ''
            console.warn('GameUIManager: renderSpecialEffectsStatus failed, using fallback', error);
            // フォールバック: 元の実装
            let statusY = 170;'
            '';
            if(this.gameEngine.bonusTimeRemaining > 0') {'
                '';
                context.fillStyle = '#FFD700';''
                context.font = 'bold 18px Arial';''
                context.textAlign = 'left';
            }
                const bonusSeconds = Math.ceil(this.gameEngine.bonusTimeRemaining / 1000); }
                context.fillText(`ボーナスタイム: ${bonusSeconds)秒`, 20, statusY});
                statusY += 25;
            }'
            '';
            if(this.gameEngine.timeStopRemaining > 0') {'
                '';
                context.fillStyle = '#00BFFF';''
                context.font = 'bold 18px Arial';
            }
                const stopSeconds = Math.ceil(this.gameEngine.timeStopRemaining / 1000); }
                context.fillText(`時間停止: ${stopSeconds)秒`, 20, statusY});
                statusY += 25;
            }'
            '';
            if(this.gameEngine.scoreMultiplier > 1') {'
                '';
                context.fillStyle = '#FF69B4';'
            }'
                context.font = 'bold 18px Arial'; }
                context.fillText(`スコア倍率: x${this.gameEngine.scoreMultiplier)`, 20, statusY});
            }
        }
    }
    
    /**
     * 詳細情報の描画
     * @param context - 描画コンテキスト'
     */''
    private renderDetailedInfo(context: CanvasRenderingContext2D'): void { const canvas = this.gameEngine.canvas;
        ';
        // 半透明背景''
        context.fillStyle = 'rgba(0, 0, 0, 0.7')';''
        context.fillRect(canvas.width - 300, 0, 300, 200');
        ';
        // 詳細情報テキスト''
        context.fillStyle = '#FFFFFF';''
        context.font = '14px Arial';''
        context.textAlign = 'left';
        
        const info = [}
            `泡の数: ${this.gameEngine.bubbleManager.getBubbleCount(})}`,
            `コンボ: ${this.gameEngine.scoreManager.getCombo(})}`,
            `スコア倍率: x${this.gameEngine.scoreMultiplier}`,
            `ボーナス時間: ${this.gameEngine.bonusTimeRemaining}ms`,]
            `時間停止: ${this.gameEngine.timeStopRemaining}ms`]
        ];
        
        info.forEach((text, index) => { context.fillText(text, canvas.width - 290, 20 + index * 20); }
        };
    }
    
    /**
     * フローティングテキストの描画
     * @param context - 描画コンテキスト
     */
    public renderFloatingText(context: CanvasRenderingContext2D): void { this.floatingTextManager.render(context); }
    }
    
    /**
     * 詳細情報表示の切り替え
     */
    public toggleDetailedInfo(): void { this.uiState.showingDetailedInfo = !this.uiState.showingDetailedInfo; }
    }
    
    /**
     * UI状態の取得
     * @returns UI状態'
     */''
    public getUIState(');