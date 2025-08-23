import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// インターフェース定義
interface CanvasInfo { 
    scale: number;
    displayWidth: number;
    displayHeight: number;
    actualWidth: number;
    actualHeight: number;
    pixelRatio?: number;
}

interface Coordinates { 
    x: number;
    y: number;
}

interface BaseCoordinates { 
    x: number;
    y: number;
}

interface Layout { 
    title: Coordinates;
    description: Coordinates;
    inputBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    buttons: { 
        ok: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        cancel: { 
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
    helpText: Coordinates;
}

interface CacheStats { 
    canvasInfoCached: boolean;
    canvasInfoCacheAge: number;
    coordinateCacheSize: number;
    coordinateCacheMaxSize: number;
}

/**
 * Username Input Manager
 * ユーザー名入力機能の管理を担当
 */
export class UsernameInputManager {
    public gameEngine: any;
    public errorHandler: any;
    public usernameInput: string;
    public isEditingUsername: boolean;
    
    // Performance optimization: Canvas info cache
    private canvasInfoCache: CanvasInfo | null;
    private canvasInfoCacheTimestamp: number;
    private coordinateCache: Map<string, BaseCoordinates>;
    private readonly CACHE_EXPIRATION_TIME = 1000; // 1秒
    private readonly MAX_COORDINATE_CACHE_SIZE = 100;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.usernameInput = '';
        this.isEditingUsername = false;
        
        // Initialize cache
        this.canvasInfoCache = null;
        this.canvasInfoCacheTimestamp = 0;
        this.coordinateCache = new Map();
    }
    
    /**
     * ユーザー名入力開始
     */
    startUsernameInput(): void {
        try {
            this.isEditingUsername = true;
            this.usernameInput = this.gameEngine.playerData?.username || '';
            
            // フォーカスを設定
            this.setupInputFocus();
        } catch (error) {
            this.errorHandler.handleError(error, 'USERNAME_INPUT_START_ERROR', {
                context: 'UsernameInputManager.startUsernameInput'
            });
        }
    }
    
    /**
     * ユーザー名入力終了
     */
    stopUsernameInput(): void {
        try {
            this.isEditingUsername = false;
            this.cleanupInputFocus();
        } catch (error) {
            this.errorHandler.handleError(error, 'USERNAME_INPUT_STOP_ERROR', {
                context: 'UsernameInputManager.stopUsernameInput'
            });
        }
    }
    
    /**
     * ユーザー名入力画面を描画
     */
    renderUsernameInput(context: CanvasRenderingContext2D): void {
        try {
            const layout = this.calculateLayout();
            
            // 半透明オーバーレイ
            this.renderOverlay(context);
            
            // タイトル
            this.renderTitle(context, layout);
            
            // 説明文
            this.renderDescription(context, layout);
            
            // 入力ボックス
            this.renderInputBox(context, layout);
            
            // ボタン
            this.renderButtons(context, layout);
            
            // ヘルプテキスト
            this.renderHelpText(context, layout);
        } catch (error) {
            this.errorHandler.handleError(error, 'USERNAME_INPUT_RENDER_ERROR', {
                context: 'UsernameInputManager.renderUsernameInput'
            });
        }
    }
    
    /**
     * レイアウト計算
     */
    private calculateLayout(): Layout {
        try {
            const canvasInfo = this.getCanvasInfo();
            const baseCoords = this.getBaseCoordinates();
            
            return {
                title: {
                    x: baseCoords.x,
                    y: baseCoords.y - 100
                },
                description: {
                    x: baseCoords.x,
                    y: baseCoords.y - 50
                },
                inputBox: {
                    x: baseCoords.x - 150,
                    y: baseCoords.y - 20,
                    width: 300,
                    height: 40
                },
                buttons: {
                    ok: {
                        x: baseCoords.x - 100,
                        y: baseCoords.y + 50,
                        width: 80,
                        height: 35
                    },
                    cancel: {
                        x: baseCoords.x + 20,
                        y: baseCoords.y + 50,
                        width: 80,
                        height: 35
                    }
                },
                helpText: {
                    x: baseCoords.x,
                    y: baseCoords.y + 120
                }
            };
        } catch (error) {
            this.errorHandler.handleError(error, 'LAYOUT_CALCULATION_ERROR', {
                context: 'UsernameInputManager.calculateLayout'
            });
            // フォールバック値を返す
            return this.getDefaultLayout();
        }
    }
    
    /**
     * キャンバス情報を取得（キャッシュ付き）
     */
    private getCanvasInfo(): CanvasInfo {
        const now = Date.now();
        
        if (this.canvasInfoCache && (now - this.canvasInfoCacheTimestamp) < this.CACHE_EXPIRATION_TIME) {
            return this.canvasInfoCache;
        }
        
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            const context = canvas.getContext('2d');
            const transform = context?.getTransform();
            
            const canvasInfo: CanvasInfo = {
                scale: transform?.a || 1,
                displayWidth: canvas.clientWidth || canvas.width,
                displayHeight: canvas.clientHeight || canvas.height,
                actualWidth: canvas.width,
                actualHeight: canvas.height,
                pixelRatio: window.devicePixelRatio || 1
            };
            
            // キャッシュ更新
            this.canvasInfoCache = canvasInfo;
            this.canvasInfoCacheTimestamp = now;
            
            return canvasInfo;
        } catch (error) {
            this.errorHandler.handleError(error, 'CANVAS_INFO_ERROR', {
                context: 'UsernameInputManager.getCanvasInfo'
            });
            // フォールバック値
            return {
                scale: 1,
                displayWidth: 800,
                displayHeight: 600,
                actualWidth: 800,
                actualHeight: 600,
                pixelRatio: 1
            };
        }
    }
    
    /**
     * ベース座標計算
     */
    private getBaseCoordinates(): BaseCoordinates {
        const cacheKey = 'base_coordinates';
        
        if (this.coordinateCache.has(cacheKey)) {
            return this.coordinateCache.get(cacheKey)!;
        }
        
        try {
            const canvasInfo = this.getCanvasInfo();
            const baseCoords: BaseCoordinates = {
                x: canvasInfo.actualWidth / 2,
                y: canvasInfo.actualHeight / 2
            };
            
            // キャッシュサイズ制限
            if (this.coordinateCache.size >= this.MAX_COORDINATE_CACHE_SIZE) {
                const firstKey = this.coordinateCache.keys().next().value;
                this.coordinateCache.delete(firstKey);
            }
            
            this.coordinateCache.set(cacheKey, baseCoords);
            return baseCoords;
        } catch (error) {
            this.errorHandler.handleError(error, 'BASE_COORDINATES_ERROR', {
                context: 'UsernameInputManager.getBaseCoordinates'
            });
            return { x: 400, y: 300 }; // フォールバック
        }
    }
    
    /**
     * オーバーレイ描画
     */
    private renderOverlay(context: CanvasRenderingContext2D): void {
        try {
            const canvasInfo = this.getCanvasInfo();
            
            context.save();
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvasInfo.actualWidth, canvasInfo.actualHeight);
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'OVERLAY_RENDER_ERROR', {
                context: 'UsernameInputManager.renderOverlay'
            });
        }
    }
    
    /**
     * タイトル描画
     */
    private renderTitle(context: CanvasRenderingContext2D, layout: Layout): void {
        try {
            context.save();
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 28px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('ユーザー名設定', layout.title.x, layout.title.y);
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'TITLE_RENDER_ERROR', {
                context: 'UsernameInputManager.renderTitle'
            });
        }
    }
    
    /**
     * 説明文描画
     */
    private renderDescription(context: CanvasRenderingContext2D, layout: Layout): void {
        try {
            context.save();
            context.fillStyle = '#CCCCCC';
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('ゲームで使用するユーザー名を入力してください', layout.description.x, layout.description.y);
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'DESCRIPTION_RENDER_ERROR', {
                context: 'UsernameInputManager.renderDescription'
            });
        }
    }
    
    /**
     * 入力ボックス描画
     */
    private renderInputBox(context: CanvasRenderingContext2D, layout: Layout): void {
        try {
            const inputBox = layout.inputBox;
            
            context.save();
            
            // 背景
            context.fillStyle = '#FFFFFF';
            context.fillRect(inputBox.x, inputBox.y, inputBox.width, inputBox.height);
            
            // 枠線
            context.strokeStyle = this.isEditingUsername ? '#4CAF50' : '#999999';
            context.lineWidth = 2;
            context.strokeRect(inputBox.x, inputBox.y, inputBox.width, inputBox.height);
            
            // テキスト
            context.fillStyle = '#000000';
            context.font = '18px Arial';
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            
            const displayText = this.usernameInput || 'ユーザー名を入力';
            const textColor = this.usernameInput ? '#000000' : '#999999';
            context.fillStyle = textColor;
            context.fillText(displayText, inputBox.x + 10, inputBox.y + inputBox.height / 2);
            
            // カーソル
            if (this.isEditingUsername && Math.floor(Date.now() / 500) % 2 === 0) {
                const textWidth = context.measureText(this.usernameInput).width;
                context.strokeStyle = '#000000';
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(inputBox.x + 10 + textWidth, inputBox.y + 8);
                context.lineTo(inputBox.x + 10 + textWidth, inputBox.y + inputBox.height - 8);
                context.stroke();
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'INPUT_BOX_RENDER_ERROR', {
                context: 'UsernameInputManager.renderInputBox'
            });
        }
    }
    
    /**
     * ボタン描画
     */
    private renderButtons(context: CanvasRenderingContext2D, layout: Layout): void {
        try {
            // OKボタン
            this.renderButton(context, layout.buttons.ok, 'OK', '#4CAF50', '#FFFFFF');
            
            // キャンセルボタン
            this.renderButton(context, layout.buttons.cancel, 'キャンセル', '#999999', '#FFFFFF');
        } catch (error) {
            this.errorHandler.handleError(error, 'BUTTONS_RENDER_ERROR', {
                context: 'UsernameInputManager.renderButtons'
            });
        }
    }
    
    /**
     * 個別ボタン描画
     */
    private renderButton(context: CanvasRenderingContext2D, button: { x: number; y: number; width: number; height: number; }, text: string, bgColor: string, textColor: string): void {
        try {
            context.save();
            
            // 背景
            context.fillStyle = bgColor;
            context.fillRect(button.x, button.y, button.width, button.height);
            
            // 枠線
            context.strokeStyle = textColor;
            context.lineWidth = 1;
            context.strokeRect(button.x, button.y, button.width, button.height);
            
            // テキスト
            context.fillStyle = textColor;
            context.font = 'bold 14px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, button.x + button.width / 2, button.y + button.height / 2);
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'BUTTON_RENDER_ERROR', {
                context: 'UsernameInputManager.renderButton',
                buttonText: text
            });
        }
    }
    
    /**
     * ヘルプテキスト描画
     */
    private renderHelpText(context: CanvasRenderingContext2D, layout: Layout): void {
        try {
            context.save();
            context.fillStyle = '#999999';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('3-20文字で入力してください | ESCでキャンセル', layout.helpText.x, layout.helpText.y);
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, 'HELP_TEXT_RENDER_ERROR', {
                context: 'UsernameInputManager.renderHelpText'
            });
        }
    }
    
    /**
     * クリック処理
     */
    handleClick(coordinates: Coordinates): boolean {
        try {
            const layout = this.calculateLayout();
            
            // OKボタンクリック
            if (this.isPointInRect(coordinates, layout.buttons.ok)) {
                return this.handleOkClick();
            }
            
            // キャンセルボタンクリック
            if (this.isPointInRect(coordinates, layout.buttons.cancel)) {
                return this.handleCancelClick();
            }
            
            // 入力ボックスクリック
            if (this.isPointInRect(coordinates, layout.inputBox)) {
                this.startUsernameInput();
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'CLICK_HANDLE_ERROR', {
                context: 'UsernameInputManager.handleClick',
                coordinates
            });
            return false;
        }
    }
    
    /**
     * キーボード入力処理
     */
    handleKeyInput(event: KeyboardEvent): boolean {
        try {
            if (!this.isEditingUsername) return false;
            
            switch (event.key) {
                case 'Enter':
                    return this.handleOkClick();
                case 'Escape':
                    return this.handleCancelClick();
                case 'Backspace':
                    this.usernameInput = this.usernameInput.slice(0, -1);
                    return true;
                default:
                    if (event.key.length === 1 && this.usernameInput.length < 20) {
                        this.usernameInput += event.key;
                        return true;
                    }
                    return false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'KEY_INPUT_ERROR', {
                context: 'UsernameInputManager.handleKeyInput',
                key: event.key
            });
            return false;
        }
    }
    
    /**
     * OKボタン処理
     */
    private handleOkClick(): boolean {
        try {
            if (this.usernameInput.trim().length >= 3 && this.usernameInput.trim().length <= 20) {
                if (this.gameEngine.playerData) {
                    this.gameEngine.playerData.username = this.usernameInput.trim();
                }
                this.stopUsernameInput();
                return true;
            } else {
                // 無効な入力の警告表示
                console.warn('ユーザー名は3-20文字で入力してください');
                return false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'OK_CLICK_ERROR', {
                context: 'UsernameInputManager.handleOkClick'
            });
            return false;
        }
    }
    
    /**
     * キャンセルボタン処理
     */
    private handleCancelClick(): boolean {
        try {
            this.stopUsernameInput();
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'CANCEL_CLICK_ERROR', {
                context: 'UsernameInputManager.handleCancelClick'
            });
            return false;
        }
    }
    
    /**
     * 点が矩形内にあるかチェック
     */
    private isPointInRect(point: Coordinates, rect: { x: number; y: number; width: number; height: number; }): boolean {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
    
    /**
     * 入力フォーカス設定
     */
    private setupInputFocus(): void {
        // 実装は必要に応じて
    }
    
    /**
     * 入力フォーカス解除
     */
    private cleanupInputFocus(): void {
        // 実装は必要に応じて
    }
    
    /**
     * デフォルトレイアウトを取得
     */
    private getDefaultLayout(): Layout {
        return {
            title: { x: 400, y: 200 },
            description: { x: 400, y: 250 },
            inputBox: { x: 250, y: 280, width: 300, height: 40 },
            buttons: {
                ok: { x: 300, y: 350, width: 80, height: 35 },
                cancel: { x: 420, y: 350, width: 80, height: 35 }
            },
            helpText: { x: 400, y: 420 }
        };
    }
    
    /**
     * キャッシュ統計情報取得
     */
    getCacheStats(): CacheStats {
        return {
            canvasInfoCached: this.canvasInfoCache !== null,
            canvasInfoCacheAge: Date.now() - this.canvasInfoCacheTimestamp,
            coordinateCacheSize: this.coordinateCache.size,
            coordinateCacheMaxSize: this.MAX_COORDINATE_CACHE_SIZE
        };
    }
    
    /**
     * キャッシュクリア
     */
    clearCache(): void {
        this.canvasInfoCache = null;
        this.canvasInfoCacheTimestamp = 0;
        this.coordinateCache.clear();
    }
}