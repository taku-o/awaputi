import { getErrorHandler } from '../../utils/ErrorHandler.js';''
import { CoordinateCalculator } from '../../utils/CoordinateCalculator.js';''
import type { MenuItem } from '../../types/game';

// インターフェース定義
interface MenuItemWithLabel extends MenuItem { label: string }

interface PlayerData {
    username: string;
}

/**
 * Main Menu Renderer
 * メインメニューの描画処理を担当
 */
export class MainMenuRenderer {
    public gameEngine: any,
    public errorHandler: any,
    public coordinateCalculator: CoordinateCalculator | null,

    constructor(gameEngine: any) {

        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();

    ,}
        this.coordinateCalculator = null; }
    }
    
    /**
     * 座標計算機を初期化または更新
     */
    updateCoordinateCalculator(): void { const canvas = this.gameEngine.canvas as HTMLCanvasElement;
        // Transform scaleの影響を考慮して実際の表示サイズを使用
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;
        
        if(!this.coordinateCalculator) {
        
            
        
        }
            this.coordinateCalculator = new CoordinateCalculator(displayWidth, displayHeight, 800, 600); }
        } else { this.coordinateCalculator.updateCanvasDimensions(displayWidth, displayHeight); }
    }
    
    /**
     * キャンバスリサイズ時の処理
     */
    handleResize(): void { this.updateCoordinateCalculator(); }
    
    /**
     * メインメニューを描画
     */
    renderMainMenu(context: CanvasRenderingContext2D, selectedMenuIndex: number, menuItems: MenuItemWithLabel[]): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            
            // Canvas状態の保存（エラー時の復旧用）
            context.save();
            
            // 座標計算機を更新
            this.updateCoordinateCalculator();
            const calc = this.coordinateCalculator!;
            
            // タイトル
            context.save();
            // フォント読み込みのフォールバック処理
            const titleFontSize = calc.scaleFontSize(60);

            const titleFonts = [' }'

                `bold ${titleFontSize}px 'Noto Sans JP', Arial, sans-serif`,
                `bold ${titleFontSize}px Arial, sans-serif`]
                `bold ${titleFontSize}px sans-serif`]
            ];
            
            let fontSet = false;
            for(const, font of, titleFonts) {
                try {
                    context.font = font;
                    fontSet = true;
            }
                    break; }
                } catch (e) { // フォント設定エラーを無視して次のフォントを試す }
            }

            if(!fontSet) {
                
            }
                context.font = `bold ${titleFontSize}px sans-serif`;
            }

            context.fillStyle = '#FFFFFF';''
            context.textAlign = 'center';''
            context.textBaseline = 'middle';

            const titleY = calc.toCanvasCoordinates(0, 80).y;''
            const titleText = 'BubblePop';
            const titleX = calc.getTextCenterX(context, titleText);
            
            // テキスト境界の検証
            if(!calc.validateTextBounds(context, titleText, titleX, titleY) {
                // テキストが切れる場合はフォントサイズを調整
            }
                const smallerFontSize = titleFontSize * 0.8; }
                context.font = `bold ${smallerFontSize}px Arial, sans-serif`;
            }
            
            context.fillText(titleText, titleX, titleY);
            // サブタイトル
            const subtitleFontSize = calc.scaleFontSize(22);

            context.font = `${subtitleFontSize}px Arial`;''
            context.fillStyle = '#CCCCCC';''
            const subtitleY = calc.toCanvasCoordinates(0, 120).y;''
            const subtitleX = calc.getTextCenterX(context, '泡割りゲーム'');''
            context.fillText('泡割りゲーム', subtitleX, subtitleY);
            context.restore();
            
            // プレイヤー情報表示
            const playerData = this.gameEngine.playerData as PlayerData;
            if(playerData.username) { context.save()';
                context.fillStyle = '#AAAAAA';' }

                const playerFontSize = calc.scaleFontSize(16); }

                context.font = `${playerFontSize}px Arial`;''
                context.textAlign = 'center';
                const playerY = calc.toCanvasCoordinates(0, 160).y;
                const playerText = `プレイヤー: ${playerData.username}`;
                const playerX = calc.getTextCenterX(context, playerText);
                context.fillText(playerText, playerX, playerY);
                context.restore();
            }
            
            // メニュー項目
            this.renderMenuItems(context, selectedMenuIndex, menuItems);
            
            // 操作説明
            this.renderControls(context);
            
            // Canvas状態の復元
            context.restore();
        } catch (error) { // エラー発生時もCanvas状態を復元
            try {
                context.restore();' }'

            } catch (restoreError) { // 復元エラーは無視 }

            this.errorHandler.handleError(error, 'RENDER_ERROR', { ')'
                context: 'MainMenuRenderer.renderMainMenu);
                canvasWidth: this.gameEngine.canvas? .width, : undefined);
                canvasHeight: this.gameEngine.canvas? .height ,});
        }
    }
    
    /**
     * メニュー項目を描画
     */ : undefined
    renderMenuItems(context: CanvasRenderingContext2D, selectedMenuIndex: number, menuItems: MenuItemWithLabel[]): void { try {
            const calc = this.coordinateCalculator!;
            
            // ベース座標系での寸法定義
            const baseItemWidth = 400;
            const baseItemHeight = 45;
            const baseStartY = 200;
            const baseSpacing = 10;
            
            // Canvas座標系に変換
            const itemSize = calc.toCanvasSize(baseItemWidth, baseItemHeight);
            const itemX = calc.getCenterX(baseItemWidth);
            
            menuItems.forEach((item, index) => { 
                const baseY = baseStartY + index * (baseItemHeight + baseSpacing);
                const canvasY = calc.toCanvasCoordinates(0, baseY).y;
                const isSelected = index === selectedMenuIndex;

                context.save()';
                context.fillStyle = isSelected ? '#0066CC' : '#333333';')'
                context.fillRect(itemX, canvasY, itemSize.width, itemSize.height);
                ';
                // 枠線
                context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';

                context.lineWidth = calc.uniformScale * 2;''
                context.strokeRect(itemX, canvasY, itemSize.width, itemSize.height);
                ';
                // テキスト
                context.fillStyle = '#FFFFFF';' }

                const menuFontSize = calc.scaleFontSize(20); }

                context.font = `bold ${menuFontSize}px Arial`;''
                context.textAlign = 'center';''
                context.textBaseline = 'middle';
                context.fillText(;
                    item.label);
                    itemX + itemSize.width / 2, );
                    canvasY + itemSize.height / 2);
                
                context.restore();

            });''
        } catch (error) { this.errorHandler.handleError(error, 'RENDER_ERROR', {)'
                context: 'MainMenuRenderer.renderMenuItems' ,});
        }
    }
    
    /**
     * 操作説明を描画
     */
    renderControls(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            const calc = this.coordinateCalculator!;

            context.save()';
            context.fillStyle = '#AAAAAA';')'
            const controlFontSize = calc.scaleFontSize(16); }

            context.font = `${controlFontSize}px Arial`;''
            context.textAlign = 'center';''
            context.textBaseline = 'bottom';
            
            // 画面下部からの固定マージン
            const bottomMargin = calc.toCanvasSize(0, 60).height;
            const controlsY = canvas.height - bottomMargin;''
            const lineSpacing = calc.toCanvasSize(0, 25).height;

            const controlText1 = '↑↓: 選択  Enter: 決定  ESC: 終了',
            const controlText2 = 'クリックでも操作できます';
            const controlX1 = calc.getTextCenterX(context, controlText1);
            const controlX2 = calc.getTextCenterX(context, controlText2);
            context.fillText(controlText1, controlX1, controlsY);
            context.fillText(controlText2, controlX2, controlsY + lineSpacing);
            ';

            context.restore();''
        } catch (error) {
            this.errorHandler.handleError(error, 'RENDER_ERROR', {)'
                context: 'MainMenuRenderer.renderControls),' }

            }');
        }

    }''
}