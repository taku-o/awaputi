/**
 * ゲームコントロールボタン管理クラス
 * Give Up（ギブアップ）とRestart（ゲーム再開始）ボタンを管理
 */
export class GameControlButtons {
    constructor(gameEngine, uiManager) {
        this.gameEngine = gameEngine;
        this.uiManager = uiManager;
        
        // ボタン設定
        this.buttonConfig = {
            giveUp: {
                text: 'ギブアップ',
                size: { width: 100, height: 35 },
                style: {
                    backgroundColor: '#FF6B6B',
                    textColor: '#FFFFFF',
                    borderColor: '#FF5252',
                    hoverColor: '#FF8A80'
                }
            },
            restart: {
                text: 'ゲーム再開始',
                size: { width: 100, height: 35 },
                style: {
                    backgroundColor: '#4CAF50',
                    textColor: '#FFFFFF',
                    borderColor: '#45A049',
                    hoverColor: '#66BB6A'
                }
            }
        };
        
        // ボタン状態
        this.buttonState = {
            enabled: true,
            hoveredButton: null,
            lastMousePosition: { x: 0, y: 0 }
        };
        
        // ボタン表示状態（ゲーム状態に応じて制御）
        this.buttonVisibility = {
            giveUp: false,   // 初期状態では非表示
            restart: false   // 初期状態では非表示
        };
        
        // アクセシビリティ状態
        this.accessibilityState = {
            focusedButton: null,    // 現在フォーカスされているボタン
            keyboardNavigation: false  // キーボードナビゲーション中かどうか
        };
        
        // ボタン位置を計算
        this.updateButtonPositions();
    }
    
    /**
     * ボタン位置の更新（レスポンシブ対応）
     */
    updateButtonPositions() {
        const canvas = this.gameEngine.canvas;
        const rightMargin = 5;   // 右側のマージン（上のマージンと統一）
        const topMargin = 5;     // 上側のマージン（5pxに戻す）
        const buttonSpacing = 10;
        
        // ResponsiveCanvasManagerを使用して適切な座標を取得
        let giveUpX, giveUpY, restartX, restartY;
        
        if (this.gameEngine.responsiveCanvasManager && typeof this.gameEngine.responsiveCanvasManager.getScaledCoordinates === 'function') {
            // ResponsiveCanvasManagerから正しい基準サイズを取得
            const canvasInfo = this.gameEngine.responsiveCanvasManager.getCanvasInfo();
            const baseWidth = canvasInfo ? canvasInfo.baseWidth : canvas.width;
            const baseHeight = canvasInfo ? canvasInfo.baseHeight : canvas.height;
            
            // 右上角の基準座標を計算（正しい基準サイズで）
            const baseGiveUpX = baseWidth - this.buttonConfig.giveUp.size.width - rightMargin;
            const baseGiveUpY = topMargin;
            const baseRestartX = baseWidth - this.buttonConfig.restart.size.width - rightMargin;
            const baseRestartY = topMargin + this.buttonConfig.giveUp.size.height + buttonSpacing;
            
            // ResponsiveCanvasManagerでスケール座標を取得
            const scaledGiveUp = this.gameEngine.responsiveCanvasManager.getScaledCoordinates(baseGiveUpX, baseGiveUpY);
            const scaledRestart = this.gameEngine.responsiveCanvasManager.getScaledCoordinates(baseRestartX, baseRestartY);
            
            giveUpX = scaledGiveUp.x;
            giveUpY = scaledGiveUp.y;
            restartX = scaledRestart.x;
            restartY = scaledRestart.y;
            
            console.log('Button dimensions:', { 
                width: this.buttonConfig.giveUp.size.width,
                height: this.buttonConfig.giveUp.size.height 
            });
            console.log('Canvas info:', { baseWidth, actualWidth: canvas.width });
            console.log('Button positions - Base:', { baseGiveUpX, baseGiveUpY }, 'Scaled:', { giveUpX, giveUpY });
            // ボタンサイズもスケールする必要がある
            const scaledButtonWidth = this.buttonConfig.giveUp.size.width * canvasInfo.scale;
            const scaledButtonHeight = this.buttonConfig.giveUp.size.height * canvasInfo.scale;
            
            console.log('Button right edge (scaled):', giveUpX + scaledButtonWidth);
            console.log('Scaled button size:', { width: scaledButtonWidth, height: scaledButtonHeight });
        } else {
            // フォールバック: 左上に配置（デバッグ用）
            giveUpX = rightMargin;
            giveUpY = topMargin + 80;
            restartX = rightMargin;
            restartY = topMargin + 80 + this.buttonConfig.giveUp.size.height + buttonSpacing;
            
            console.warn('ResponsiveCanvasManager not available, using fallback coordinates');
        }
        
        // ボタン位置を設定
        this.buttonConfig.giveUp.position = { x: giveUpX, y: giveUpY };
        this.buttonConfig.restart.position = { x: restartX, y: restartY };
        
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Final button positions:', {
            giveUp: this.buttonConfig.giveUp.position,
            restart: this.buttonConfig.restart.position
        });
    }
    
    /**
     * ボタンの有効/無効を設定
     * @param {boolean} enabled - 有効フラグ
     */
    setButtonsEnabled(enabled) {
        this.buttonState.enabled = enabled;
        this.buttonState.hoveredButton = null;
    }
    
    /**
     * ゲーム状態に基づいてボタンの表示状態を更新
     * @param {Object} gameState - ゲーム状態
     * @param {boolean} gameState.isGameStarted - ゲーム開始フラグ
     * @param {boolean} gameState.isGameOver - ゲームオーバーフラグ
     * @param {boolean} gameState.isPaused - ポーズフラグ
     * @param {boolean} gameState.isPreGame - ゲーム開始前フラグ
     */
    updateButtonVisibility(gameState) {
        const { isGameStarted = false, isGameOver = false, isPaused = false, isPreGame = false } = gameState;
        
        // Give Upボタンの表示条件: (ゲーム進行中 OR ポーズ中) AND ゲームオーバーでない AND ゲーム開始前でない
        this.buttonVisibility.giveUp = (isGameStarted && !isGameOver && !isPreGame);
        
        // Restartボタンの表示条件: (ゲーム進行中 OR ポーズ中 OR ゲームオーバー) AND ゲーム開始前でない
        this.buttonVisibility.restart = ((isGameStarted && !isPreGame) || isGameOver) && !isPreGame;
    }
    
    /**
     * 指定されたボタンが表示状態かどうかを確認
     * @param {string} buttonType - ボタンタイプ ('giveUp' または 'restart')
     * @returns {boolean} 表示状態
     */
    isButtonVisible(buttonType) {
        return this.buttonVisibility[buttonType] || false;
    }
    
    /**
     * キーボードナビゲーション処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    handleKeyboardNavigation(event) {
        if (!this.buttonState.enabled) {
            return false;
        }
        
        const visibleButtons = this.getVisibleButtons();
        if (visibleButtons.length === 0) {
            return false;
        }
        
        switch (event.key) {
            case 'Tab':
                this.accessibilityState.keyboardNavigation = true;
                const direction = event.shiftKey ? -1 : 1;
                this.navigateButtons(direction, visibleButtons);
                event.preventDefault();
                return true;
                
            case 'Enter':
            case ' ':  // スペースキー
                if (this.accessibilityState.focusedButton) {
                    this.handleButtonActivation(this.accessibilityState.focusedButton);
                    event.preventDefault();
                    return true;
                }
                break;
                
            case 'Escape':
                this.clearKeyboardFocus();
                return true;
        }
        
        return false;
    }
    
    /**
     * 表示されているボタンの一覧を取得
     * @returns {string[]} 表示されているボタンタイプの配列
     */
    getVisibleButtons() {
        const buttons = [];
        if (this.isButtonVisible('giveUp')) buttons.push('giveUp');
        if (this.isButtonVisible('restart')) buttons.push('restart');
        return buttons;
    }
    
    /**
     * ボタン間のナビゲーション
     * @param {number} direction - 方向 (1: 次へ, -1: 前へ)
     * @param {string[]} visibleButtons - 表示されているボタンの配列
     */
    navigateButtons(direction, visibleButtons) {
        if (visibleButtons.length === 0) return;
        
        let currentIndex = -1;
        if (this.accessibilityState.focusedButton) {
            currentIndex = visibleButtons.indexOf(this.accessibilityState.focusedButton);
        }
        
        const nextIndex = (currentIndex + direction + visibleButtons.length) % visibleButtons.length;
        this.setKeyboardFocus(visibleButtons[nextIndex]);
    }
    
    /**
     * キーボードフォーカスを設定
     * @param {string} buttonType - フォーカスするボタンタイプ
     */
    setKeyboardFocus(buttonType) {
        this.accessibilityState.focusedButton = buttonType;
        this.accessibilityState.keyboardNavigation = true;
    }
    
    /**
     * キーボードフォーカスをクリア
     */
    clearKeyboardFocus() {
        this.accessibilityState.focusedButton = null;
        this.accessibilityState.keyboardNavigation = false;
    }
    
    /**
     * ボタンアクティベーション処理
     * @param {string} buttonType - アクティベートするボタンタイプ
     */
    handleButtonActivation(buttonType) {
        if (this.isButtonVisible(buttonType)) {
            // UIManagerのボタンクリック処理を呼び出し
            if (this.uiManager && typeof this.uiManager.showConfirmationDialog === 'function') {
                this.uiManager.showConfirmationDialog(buttonType);
            }
        }
    }
    
    /**
     * マウス座標の更新（ホバー状態管理用）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    updateMousePosition(x, y) {
        this.buttonState.lastMousePosition = { x, y };
        
        if (!this.buttonState.enabled) {
            this.buttonState.hoveredButton = null;
            return;
        }
        
        // ホバー状態の更新（表示されているボタンのみ）
        this.buttonState.hoveredButton = null;
        if (this.isButtonVisible('giveUp') && this.isButtonClicked(x, y, 'giveUp')) {
            this.buttonState.hoveredButton = 'giveUp';
        } else if (this.isButtonVisible('restart') && this.isButtonClicked(x, y, 'restart')) {
            this.buttonState.hoveredButton = 'restart';
        }
    }
    
    /**
     * クリック処理
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {string|null} クリックされたボタンタイプ
     */
    handleClick(x, y) {
        if (!this.buttonState.enabled) {
            return null;
        }
        
        // 表示されているボタンのみクリック処理
        if (this.isButtonVisible('giveUp') && this.isButtonClicked(x, y, 'giveUp')) {
            return 'giveUp';
        } else if (this.isButtonVisible('restart') && this.isButtonClicked(x, y, 'restart')) {
            return 'restart';
        }
        
        return null;
    }
    
    /**
     * ボタンがクリックされたかの判定
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} buttonType - ボタンタイプ
     * @returns {boolean} クリック判定結果
     */
    isButtonClicked(x, y, buttonType) {
        const config = this.buttonConfig[buttonType];
        if (!config || !config.position) {
            return false;
        }
        
        const bounds = this.getButtonBounds(buttonType);
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    /**
     * ボタンの境界情報を取得
     * @param {string} buttonType - ボタンタイプ
     * @returns {Object} 境界情報
     */
    getButtonBounds(buttonType) {
        const config = this.buttonConfig[buttonType];
        if (!config || !config.position) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        
        // スケールファクターを取得
        let scaleFactor = 1;
        if (this.gameEngine.responsiveCanvasManager) {
            const canvasInfo = this.gameEngine.responsiveCanvasManager.getCanvasInfo();
            scaleFactor = canvasInfo ? canvasInfo.scale : 1;
        }
        
        return {
            x: config.position.x,
            y: config.position.y,
            width: config.size.width * scaleFactor,
            height: config.size.height * scaleFactor
        };
    }
    
    /**
     * ボタンの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    render(context) {
        if (!this.buttonState.enabled) {
            return;
        }
        
        // キャンバスサイズが変更された場合の位置更新
        this.updateButtonPositions();
        
        context.save();
        
        // Give Upボタンの描画（表示状態の場合のみ）
        if (this.isButtonVisible('giveUp')) {
            this.renderButton(context, 'giveUp');
        }
        
        // Restartボタンの描画（表示状態の場合のみ）
        if (this.isButtonVisible('restart')) {
            this.renderButton(context, 'restart');
        }
        
        context.restore();
    }
    
    /**
     * 個別ボタンの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {string} buttonType - ボタンタイプ
     */
    renderButton(context, buttonType) {
        const config = this.buttonConfig[buttonType];
        const isHovered = this.buttonState.hoveredButton === buttonType;
        const isFocused = this.accessibilityState.focusedButton === buttonType;
        const bounds = this.getButtonBounds(buttonType);
        
        if (bounds.width === 0 || bounds.height === 0) {
            return;
        }
        
        // ボタン背景色
        const backgroundColor = isHovered ? config.style.hoverColor : config.style.backgroundColor;
        
        // ボタンの背景描画
        context.fillStyle = backgroundColor;
        context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // ボタンの枠線描画
        context.strokeStyle = config.style.borderColor;
        context.lineWidth = 2;
        context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // キーボードフォーカス表示
        if (isFocused && this.accessibilityState.keyboardNavigation) {
            this.renderFocusIndicator(context, bounds);
        }
        
        // ボタンテキストの描画
        context.fillStyle = config.style.textColor;
        context.font = 'bold 14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 影効果
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur = 2;
        
        const textX = bounds.x + bounds.width / 2;
        const textY = bounds.y + bounds.height / 2;
        context.fillText(config.text, textX, textY);
        
        // 影効果をクリア
        context.shadowColor = 'transparent';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    }
    
    /**
     * フォーカスインジケーターの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {Object} bounds - ボタンの境界情報
     */
    renderFocusIndicator(context, bounds) {
        const focusOffset = 3;
        const focusLineWidth = 3;
        
        context.save();
        context.strokeStyle = '#007BFF'; // アクセシブルな青色
        context.lineWidth = focusLineWidth;
        context.setLineDash([5, 3]); // 点線スタイル
        
        // フォーカス枠を描画
        context.strokeRect(
            bounds.x - focusOffset,
            bounds.y - focusOffset,
            bounds.width + focusOffset * 2,
            bounds.height + focusOffset * 2
        );
        
        context.restore();
    }
    
    /**
     * ボタンの設定を取得
     * @returns {Object} ボタン設定
     */
    getButtonConfig() {
        return { ...this.buttonConfig };
    }
    
    /**
     * ボタンの状態を取得
     * @returns {Object} ボタン状態
     */
    getButtonState() {
        return { 
            ...this.buttonState,
            visibility: { ...this.buttonVisibility }
        };
    }
}