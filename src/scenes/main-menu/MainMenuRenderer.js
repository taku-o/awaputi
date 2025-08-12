import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { CoordinateCalculator } from '../../utils/CoordinateCalculator.js';

/**
 * Main Menu Renderer
 * メインメニューの描画処理を担当
 */
export class MainMenuRenderer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.coordinateCalculator = null;
    }
    
    /**
     * 座標計算機を初期化または更新
     */
    updateCoordinateCalculator() {
        const canvas = this.gameEngine.canvas;
        if (!this.coordinateCalculator) {
            this.coordinateCalculator = new CoordinateCalculator(canvas.width, canvas.height, 1920, 1080);
        } else {
            this.coordinateCalculator.updateCanvasDimensions(canvas.width, canvas.height);
        }
    }
    
    /**
     * メインメニューを描画
     */
    renderMainMenu(context, selectedMenuIndex, menuItems) {
        try {
            const canvas = this.gameEngine.canvas;
            
            // 座標計算機を更新
            this.updateCoordinateCalculator();
            const calc = this.coordinateCalculator;
            
            // タイトル
            context.save();
            context.fillStyle = '#FFFFFF';
            const titleFontSize = calc.scaleFontSize(72);
            context.font = `bold ${titleFontSize}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            const titleY = calc.toCanvasCoordinates(0, 150).y;
            const titleText = 'BubblePop';
            const titleX = calc.getTextCenterX(context, titleText);
            
            // テキスト境界の検証
            if (!calc.validateTextBounds(context, titleText, titleX, titleY)) {
                // テキストが切れる場合はフォントサイズを調整
                context.font = `bold ${titleFontSize * 0.8}px Arial`;
            }
            
            context.fillText(titleText, canvas.width / 2, titleY);
            
            // サブタイトル
            const subtitleFontSize = calc.scaleFontSize(28);
            context.font = `${subtitleFontSize}px Arial`;
            context.fillStyle = '#CCCCCC';
            const subtitleY = calc.toCanvasCoordinates(0, 220).y;
            context.fillText('泡割りゲーム', canvas.width / 2, subtitleY);
            context.restore();
            
            // プレイヤー情報表示
            if (this.gameEngine.playerData.username) {
                context.save();
                context.fillStyle = '#AAAAAA';
                const playerFontSize = calc.scaleFontSize(20);
                context.font = `${playerFontSize}px Arial`;
                context.textAlign = 'center';
                const playerY = calc.toCanvasCoordinates(0, 280).y;
                context.fillText(`プレイヤー: ${this.gameEngine.playerData.username}`, canvas.width / 2, playerY);
                context.restore();
            }
            
            // メニュー項目
            this.renderMenuItems(context, selectedMenuIndex, menuItems);
            
            // 操作説明
            this.renderControls(context);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuRenderer.renderMainMenu'
            });
        }
    }
    
    /**
     * メニュー項目を描画
     */
    renderMenuItems(context, selectedMenuIndex, menuItems) {
        try {
            const calc = this.coordinateCalculator;
            
            // ベース座標系での寸法定義
            const baseItemWidth = 400;
            const baseItemHeight = 60;
            const baseStartY = 350;
            const baseSpacing = 20;
            
            // Canvas座標系に変換
            const itemSize = calc.toCanvasSize(baseItemWidth, baseItemHeight);
            const itemX = calc.getCenterX(baseItemWidth);
            
            menuItems.forEach((item, index) => {
                const baseY = baseStartY + index * (baseItemHeight + baseSpacing);
                const canvasY = calc.toCanvasCoordinates(0, baseY).y;
                const isSelected = index === selectedMenuIndex;
                
                context.save();
                
                // 背景
                context.fillStyle = isSelected ? '#0066CC' : '#333333';
                context.fillRect(itemX, canvasY, itemSize.width, itemSize.height);
                
                // 枠線
                context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
                context.lineWidth = calc.uniformScale * 2;
                context.strokeRect(itemX, canvasY, itemSize.width, itemSize.height);
                
                // テキスト
                context.fillStyle = '#FFFFFF';
                const menuFontSize = calc.scaleFontSize(24);
                context.font = `bold ${menuFontSize}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(
                    item.label, 
                    itemX + itemSize.width / 2, 
                    canvasY + itemSize.height / 2
                );
                
                context.restore();
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuRenderer.renderMenuItems'
            });
        }
    }
    
    /**
     * 操作説明を描画
     */
    renderControls(context) {
        try {
            const canvas = this.gameEngine.canvas;
            const calc = this.coordinateCalculator;
            
            context.save();
            context.fillStyle = '#AAAAAA';
            const controlFontSize = calc.scaleFontSize(16);
            context.font = `${controlFontSize}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            
            // 画面下部からの固定マージン
            const bottomMargin = calc.toCanvasSize(0, 60).height;
            const controlsY = canvas.height - bottomMargin;
            const lineSpacing = calc.toCanvasSize(0, 25).height;
            
            context.fillText('↑↓: 選択  Enter: 決定  ESC: 終了', canvas.width / 2, controlsY);
            context.fillText('クリックでも操作できます', canvas.width / 2, controlsY + lineSpacing);
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuRenderer.renderControls'
            });
        }
    }
}