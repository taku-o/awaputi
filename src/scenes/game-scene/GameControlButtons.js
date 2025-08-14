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
                size: { width: 120, height: 40 },
                style: {
                    backgroundColor: '#FF6B6B',
                    textColor: '#FFFFFF',
                    borderColor: '#FF5252',
                    hoverColor: '#FF8A80'
                }
            },
            restart: {
                text: 'ゲーム再開始',
                size: { width: 120, height: 40 },
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
        
        // ボタン位置を計算
        this.updateButtonPositions();
    }
    
    /**
     * ボタン位置の更新（レスポンシブ対応）
     */
    updateButtonPositions() {
        const canvas = this.gameEngine.canvas;
        const margin = 10;  // 上と右のマージン
        const buttonSpacing = 10;
        
        // ResponsiveCanvasManagerを使用して適切な座標を取得
        let giveUpX, giveUpY, restartX, restartY;
        
        if (this.gameEngine.responsiveCanvasManager && typeof this.gameEngine.responsiveCanvasManager.getScaledCoordinates === 'function') {
            // ResponsiveCanvasManagerから正しい基準サイズを取得
            const canvasInfo = this.gameEngine.responsiveCanvasManager.getCanvasInfo();
            const baseWidth = canvasInfo ? canvasInfo.baseWidth : canvas.width;
            const baseHeight = canvasInfo ? canvasInfo.baseHeight : canvas.height;
            
            // 右上角の基準座標を計算（正しい基準サイズで）
            const baseGiveUpX = baseWidth - this.buttonConfig.giveUp.size.width - margin;
            const baseGiveUpY = 5;  // 上端にぴったり近づける
            const baseRestartX = baseWidth - this.buttonConfig.restart.size.width - margin;
            const baseRestartY = 5 + this.buttonConfig.giveUp.size.height + buttonSpacing;
            
            // ResponsiveCanvasManagerでスケール座標を取得
            const scaledGiveUp = this.gameEngine.responsiveCanvasManager.getScaledCoordinates(baseGiveUpX, baseGiveUpY);
            const scaledRestart = this.gameEngine.responsiveCanvasManager.getScaledCoordinates(baseRestartX, baseRestartY);
            
            giveUpX = scaledGiveUp.x;
            giveUpY = scaledGiveUp.y;
            restartX = scaledRestart.x;
            restartY = scaledRestart.y;
            
            console.log('Button positions - Base:', { baseGiveUpX, baseGiveUpY }, 'Scaled:', { giveUpX, giveUpY });
        } else {
            // フォールバック: 左上に配置（デバッグ用）
            giveUpX = margin;
            giveUpY = margin + 80;
            restartX = margin;
            restartY = margin + 80 + this.buttonConfig.giveUp.size.height + buttonSpacing;
            
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
        
        // ホバー状態の更新
        this.buttonState.hoveredButton = null;
        if (this.isButtonClicked(x, y, 'giveUp')) {
            this.buttonState.hoveredButton = 'giveUp';
        } else if (this.isButtonClicked(x, y, 'restart')) {
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
        
        if (this.isButtonClicked(x, y, 'giveUp')) {
            return 'giveUp';
        } else if (this.isButtonClicked(x, y, 'restart')) {
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
        
        return {
            x: config.position.x,
            y: config.position.y,
            width: config.size.width,
            height: config.size.height
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
        
        // Give Upボタンの描画
        this.renderButton(context, 'giveUp');
        
        // Restartボタンの描画
        this.renderButton(context, 'restart');
        
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
        return { ...this.buttonState };
    }
}