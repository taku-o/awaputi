import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Main Menu Renderer
 * メインメニューの描画処理を担当
 */
export class MainMenuRenderer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * メインメニューを描画
     */
    renderMainMenu(context, selectedMenuIndex, menuItems) {
        try {
            const canvas = this.gameEngine.canvas;
            
            // ベース座標系（800x600）を使用してタイトルを中央に配置
            const baseWidth = 800;
            const baseHeight = 600;
            
            // Canvas実際の解像度からベース座標系への変換比率
            const scaleX = canvas.width / baseWidth;
            const scaleY = canvas.height / baseHeight;
            
            // タイトル
            context.save();
            context.fillStyle = '#FFFFFF';
            context.font = `bold ${48 * scaleY}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('BubblePop', (baseWidth / 2) * scaleX, 150 * scaleY);
            
            // サブタイトル
            context.font = `${20 * scaleY}px Arial`;
            context.fillStyle = '#CCCCCC';
            context.fillText('泡割りゲーム', (baseWidth / 2) * scaleX, 190 * scaleY);
            context.restore();
            
            // プレイヤー情報表示
            if (this.gameEngine.playerData.username) {
                context.save();
                context.fillStyle = '#AAAAAA';
                context.font = `${16 * scaleY}px Arial`;
                context.textAlign = 'center';
                context.fillText(`プレイヤー: ${this.gameEngine.playerData.username}`, (baseWidth / 2) * scaleX, 230 * scaleY);
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
            const canvas = this.gameEngine.canvas;
            
            // ベース座標系（800x600）を使用
            const baseWidth = 800;
            const startY = 280;
            const itemHeight = 50;
            const itemWidth = 300;
            const itemX = (baseWidth - itemWidth) / 2;
            
            menuItems.forEach((item, index) => {
                const y = startY + index * (itemHeight + 20);
                const isSelected = index === selectedMenuIndex;
                
                context.save();
                
                // 背景
                context.fillStyle = isSelected ? '#0066CC' : '#333333';
                context.fillRect(itemX, y, itemWidth, itemHeight);
                
                // 枠線
                context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
                context.lineWidth = 2;
                context.strokeRect(itemX, y, itemWidth, itemHeight);
                
                // テキスト
                context.fillStyle = '#FFFFFF';
                context.font = 'bold 20px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(item.label, itemX + itemWidth / 2, y + itemHeight / 2);
                
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
            
            context.save();
            context.fillStyle = '#AAAAAA';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            
            const controlsY = canvas.height - 40;
            context.fillText('↑↓: 選択  Enter: 決定  ESC: 終了', canvas.width / 2, controlsY);
            context.fillText('クリックでも操作できます', canvas.width / 2, controlsY + 20);
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuRenderer.renderControls'
            });
        }
    }
}