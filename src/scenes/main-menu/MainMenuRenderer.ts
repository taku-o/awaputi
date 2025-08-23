import { getErrorHandler  } from '../../utils/ErrorHandler.js';
import { CoordinateCalculator  } from '../../utils/CoordinateCalculator.js';
import type { MenuItem } from '../../types/game';

// インターフェース定義
interface MenuItemWithLabel extends MenuItem { 
    label: string;
}

interface PlayerData {
    username: string;
}

/**
 * Main Menu Renderer
 * メインメニューの描画処理を担当
 */
export class MainMenuRenderer {
    public gameEngine: any;
    public errorHandler: any;
    public coordinateCalculator: CoordinateCalculator | null;
    
    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.coordinateCalculator = null;
    }
    
    /**
     * 座標計算機を初期化または更新
     */
    updateCoordinateCalculator(): void {
        const canvas = this.gameEngine.canvas as HTMLCanvasElement;
        // Transform scaleの影響を考慮して実際の表示サイズを使用
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;
        
        if (!this.coordinateCalculator) {
            this.coordinateCalculator = new CoordinateCalculator(displayWidth, displayHeight, 800, 600);
        } else {
            this.coordinateCalculator.updateCanvasDimensions(displayWidth, displayHeight);
        }
    }
    
    /**
     * キャンバスリサイズ時の処理
     */
    handleResize(): void {
        this.updateCoordinateCalculator();
    }
    
    /**
     * メインメニューを描画
     */
    renderMainMenu(context: CanvasRenderingContext2D, selectedMenuIndex: number, menuItems: MenuItemWithLabel[]): void {
        try {
            this.updateCoordinateCalculator();
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            
            // 背景描画
            this.renderBackground(context);
            
            // タイトル描画
            this.renderTitle(context);
            
            // ユーザー名表示
            this.renderUsername(context);
            
            // メニュー項目描画
            this.renderMenuItems(context, selectedMenuIndex, menuItems);
            
            // フッター情報描画
            this.renderFooter(context);
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_RENDER_ERROR', {
                context: 'MainMenuRenderer.renderMainMenu'
            });
        }
    }
    
    /**
     * 背景を描画
     */
    renderBackground(context: CanvasRenderingContext2D): void {
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            
            // グラデーション背景
            const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#003366');
            
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        } catch (error) {
            this.errorHandler.handleError(error, 'BACKGROUND_RENDER_ERROR', {
                context: 'MainMenuRenderer.renderBackground'
            });
        }
    }
    
    /**
     * タイトルを描画
     */
    renderTitle(context: CanvasRenderingContext2D): void {
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            
            context.save();
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 64px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // タイトル位置を中央に設定
            const centerX = canvas.width / 2;
            const titleY = 120;
            
            context.fillText('BubblePop', centerX, titleY);
            
            // サブタイトル
            context.font = '24px Arial';
            context.fillStyle = '#CCCCCC';
            context.fillText('バブルポップゲーム', centerX, titleY + 60);
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'TITLE_RENDER_ERROR', {
                context: 'MainMenuRenderer.renderTitle'
            });
        }
    }
    
    /**
     * ユーザー名を描画
     */
    renderUsername(context: CanvasRenderingContext2D): void {
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            const playerData = this.gameEngine.playerData as PlayerData;
            
            if (playerData && playerData.username) {
                context.save();
                context.fillStyle = '#FFFF99';
                context.font = '18px Arial';
                context.textAlign = 'right';
                context.textBaseline = 'top';
                
                context.fillText(`プレイヤー: ${playerData.username}`, canvas.width - 20, 20);
                context.restore();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'USERNAME_RENDER_ERROR', {
                context: 'MainMenuRenderer.renderUsername'
            });
        }
    }
    
    /**
     * メニュー項目を描画
     */
    renderMenuItems(context: CanvasRenderingContext2D, selectedMenuIndex: number, menuItems: MenuItemWithLabel[]): void {
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            
            context.save();
            const menuStartY = 250;
            const menuItemHeight = 50;
            const centerX = canvas.width / 2;
            
            menuItems.forEach((item, index) => {
                const itemY = menuStartY + index * menuItemHeight;
                const isSelected = index === selectedMenuIndex;
                
                // メニューアイテムの背景
                if (isSelected) {
                    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    context.fillRect(centerX - 200, itemY - 20, 400, 40);
                }
                
                // メニューアイテムのテキスト
                context.fillStyle = isSelected ? '#FFFF99' : '#FFFFFF';
                context.font = isSelected ? 'bold 24px Arial' : '20px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                
                context.fillText(item.label, centerX, itemY);
            });
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_ITEMS_RENDER_ERROR', {
                context: 'MainMenuRenderer.renderMenuItems'
            });
        }
    }
    
    /**
     * フッター情報を描画
     */
    renderFooter(context: CanvasRenderingContext2D): void {
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            
            context.save();
            context.fillStyle = '#888888';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            
            context.fillText('↑↓キー: 選択 | Enter: 決定 | ESC: 終了', canvas.width / 2, canvas.height - 20);
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'FOOTER_RENDER_ERROR', {
                context: 'MainMenuRenderer.renderFooter'
            });
        }
    }
}