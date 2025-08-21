import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// インターフェース定義
interface CanvasInfo { scale: number,
    displayWidth: number,
    displayHeight: number,
    actualWidth: number,
    actualHeight: number,
    pixelRatio?: number  }

interface Coordinates { x: number,
    y: number }

interface BaseCoordinates { x: number,
    y: number }

interface Layout { title: Coordinates,
    description: Coordinates,
    inputBox: {
        ,x: number,
        y: number,
        width: number,
    height: number };
    buttons: { ok: {
            x: number,
            y: number,
            width: number,
    height: number };
        cancel: { x: number,
            y: number,
            width: number,
    height: number };
    helpText: Coordinates;
    }

interface CacheStats { canvasInfoCached: boolean,
    canvasInfoCacheAge: number,
    coordinateCacheSize: number,
    coordinateCacheMaxSize: number  }

/**
 * Username Input Manager
 * ユーザー名入力機能の管理を担当
 */
export class UsernameInputManager {
    public gameEngine: any,
    public, errorHandler: any,
    public usernameInput: string,
    public isEditingUsername: boolean,
    
    // Performance optimization: Canvas info cache
    private _canvasInfoCache: CanvasInfo | null,
    private _canvasInfoCacheTime: number,
    private _cacheValidDuration: number,
    // Coordinate transformation cache
    private, _coordinateCache: Map<string, Coordinates>,
    private _maxCacheSize: number,
    constructor(gameEngine: any) {
',

        this.gameEngine = gameEngine,
        this.errorHandler = getErrorHandler('',
        this.usernameInput = ',
        this.isEditingUsername = false
        
        // Performance, optimization: Canvas, info cache, this._canvasInfoCache = null,
        this._canvasInfoCacheTime = 0,
        this._cacheValidDuration = 16, // ~1, frame at, 60fps
        
        // Coordinate, transformation cache)
        this._coordinateCache = new Map(),

     }
        this._maxCacheSize = 50; }
    }
    /**
     * ResponsiveCanvasManagerから座標情報を安全に取得
     */
    getCanvasInfo(): CanvasInfo | null { const now = performance.now(),
        // Return cached canvas info if still valid
        if (this._canvasInfoCache && (now - this._canvasInfoCacheTime) < this._cacheValidDuration) {
            return this._canvasInfoCache }
';

        try { const responsiveCanvasManager = this.gameEngine.responsiveCanvasManager,
            if(responsiveCanvasManager && typeof, responsiveCanvasManager.getCanvasInfo === 'function' {'

                const canvasInfo = responsiveCanvasManager.getCanvasInfo()',
                if (canvasInfo && typeof, canvasInfo.scale === 'number' && canvasInfo.scale > 0) {
                    // Cache the canvas info
                    this._canvasInfoCache = canvasInfo,
                    this._canvasInfoCacheTime = now }
                    return canvasInfo; catch (error) {
            if(this.gameEngine.debug) {', ' }

                console.warn('ResponsiveCanvasManager access failed:', error); }
}
        
        // Clear cache on failure
        this._canvasInfoCache = null;
        this._canvasInfoCacheTime = 0;
        return null;
    }

    /**
     * ベース座標をCanvas座標に変換
     */
    transformCoordinates(baseX: number, baseY: number, canvasInfo: CanvasInfo): Coordinates | null { if (!canvasInfo) return null,

        // Create cache key }
        const cacheKey = `${baseX},${baseY},${canvasInfo.scale}`;
        
        // Check cache first
        if(this._coordinateCache.has(cacheKey) { return this._coordinateCache.get(cacheKey)! }

        // Calculate transformation
        const { scale } = canvasInfo;
        const result: Coordinates = { x: baseX * scale,
            y: baseY * scale  };
        // Cache result (with, size limit);
        if(this._coordinateCache.size >= this._maxCacheSize) {
            // Remove oldest entry (first, added),
            const firstKey = this._coordinateCache.keys().next().value }
            this._coordinateCache.delete(firstKey); }
        }
        this._coordinateCache.set(cacheKey, result);

        return result;
    }

    /**
     * 座標境界チェック
     */
    validateCoordinates(x: number, y: number, canvasInfo: CanvasInfo): boolean { if (!canvasInfo) return false }
        const { actualWidth, actualHeight } = canvasInfo;
        return x >= 0 && x <= actualWidth && y >= 0 && y <= actualHeight;
    }

    /**
     * デバッグ用座標情報ログ
     */
    logCoordinateDebug(context: string, canvasInfo: CanvasInfo | null, transformedCoords: any): void { ''
        if(this.gameEngine.debug) {

            console.log('Username input coordinate debug:', {
                canvasInfo: {
         }

                    scale: canvasInfo?.scale, : undefined', '
                    displaySize: canvasInfo ? `${canvasInfo.displayWidth}x${canvasInfo.displayHeight}` : 'N/A',''
                    actualSize: canvasInfo ? `${canvasInfo.actualWidth}x${canvasInfo.actualHeight}` : 'N/A')
                    pixelRatio: canvasInfo?.pixelRatio;
                }, : undefined
                transformedCoordinates: transformedCoords);
                fallbackMode: !canvasInfo);
    }

    /**
     * バッチ座標変換（パフォーマンス最適化）
     */
    transformCoordinatesBatch(coordinates: BaseCoordinates[], canvasInfo: CanvasInfo): Coordinates[] { if(!canvasInfo || !Array.isArray(coordinates) return [],
        
        return coordinates.map(coord => ),
            this.transformCoordinates(coord.x, coord.y, canvasInfo).filter((result): result is Coordinates => result !== null) }

    /**
     * キャッシュクリア（リサイズ時などに使用）
     */
    clearCache(): void { this._canvasInfoCache = null,
        this._canvasInfoCacheTime = 0,
        this._coordinateCache.clear() }

    /**
     * キャッシュ統計取得（デバッグ用）
     */
    getCacheStats(): CacheStats { return { canvasInfoCached: !!this._canvasInfoCache,
            canvasInfoCacheAge: this._canvasInfoCacheTime > 0 ? performance.now() - this._canvasInfoCacheTime : 0,
            coordinateCacheSize: this._coordinateCache.size };
            coordinateCacheMaxSize: this._maxCacheSize 
    }
    
    /**
     * ユーザー名入力画面を描画
     */
    renderUsernameInput(context: CanvasRenderingContext2D): void { try {
            const canvasInfo = this.getCanvasInfo(),
            
            if(canvasInfo) {
    
}
                this.renderWithResponsiveCoordinates(context, canvasInfo); }

            } else { this.renderWithFallbackCoordinates(context),' }'

            } catch (error) { this.errorHandler.handleError(error, 'RENDER_ERROR', {''
                context: 'UsernameInputManager.renderUsernameInput'
            }';
        }
    }

    /**
     * ResponsiveCanvasManager座標システムを使用した描画
     */'
    renderWithResponsiveCoordinates(context: CanvasRenderingContext2D, canvasInfo: CanvasInfo): void { ''
        if(this.gameEngine.debug) {', ' }

            console.log('Using, ResponsiveCanvasManager coordinate, system'); }
        }

        // ベース座標系でのレイアウト定義
        const BASE_WIDTH = 800;
        const BASE_HEIGHT = 600;
        const LAYOUT: Layout = {
            title: { x: 400, y: 200  },
            description: { x: 400, y: 240  },
            inputBox: { x: 200, y: 280, width: 400, height: 50  },
            buttons: {
                ok: { x: 290, y: 360, width: 100, height: 40  },
                cancel: { x: 410, y: 360, width: 100, height: 40  },
            helpText: { x: 400, y: 450  };
        // デバッグログ出力
        this.logCoordinateDebug('context', canvasInfo, LAYOUT';
';
        // 半透明オーバーレイ（Canvas全体をカバー）
        context.save()';
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvasInfo.actualWidth, canvasInfo.actualHeight);

        // タイトルの描画
        const titleCoords = this.transformCoordinates(LAYOUT.title.x, LAYOUT.title.y, canvasInfo);
        if(titleCoords && this.validateCoordinates(titleCoords.x, titleCoords.y, canvasInfo)) { ''
            context.fillStyle = '#FFFFFF' }

            context.font = `bold ${32 * canvasInfo.scale}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            const title = this.isEditingUsername ? 'ユーザー名変更' : 'ユーザー名登録';
            context.fillText(title, titleCoords.x, titleCoords.y);
        }

        // 説明文の描画
        const descCoords = this.transformCoordinates(LAYOUT.description.x, LAYOUT.description.y, canvasInfo);
        if(descCoords && this.validateCoordinates(descCoords.x, descCoords.y, canvasInfo)) {
            context.font = `${18 * canvasInfo.scale}px Arial`;
            context.fillStyle = '#CCCCCC';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('ユーザー名を入力してください（最大10文字）', descCoords.x, descCoords.y);
        }

        // 入力ボックスの描画
        this.renderInputBoxWithResponsiveCoords(context, canvasInfo, LAYOUT);

        // ボタンの描画（新しいResponsive座標システム使用）
        this.renderButtonsWithResponsiveCoords(context, canvasInfo, LAYOUT);

        // ヘルプテキストの描画
        const helpCoords = this.transformCoordinates(LAYOUT.helpText.x, LAYOUT.helpText.y, canvasInfo);
        if(helpCoords && this.validateCoordinates(helpCoords.x, helpCoords.y, canvasInfo)) { ''
            context.fillStyle = '#AAAAAA' }

            context.font = `${14 * canvasInfo.scale}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('文字を入力してEnterで決定、ESCでキャンセル', helpCoords.x, helpCoords.y);
        }

        context.restore();
    }

    /**
     * フォールバック座標システムを使用した描画
     */'
    renderWithFallbackCoordinates(context: CanvasRenderingContext2D): void { ''
        if(this.gameEngine.debug) {', ' }

            console.warn('ResponsiveCanvasManager not available, using fallback coordinates'); }'
        }

        const canvas = this.gameEngine.canvas as HTMLCanvasElement;
        
        // Canvas実際の解像度を取得
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // ベース座標系（800x600）からCanvas座標系への変換比率
        const scaleX = canvasWidth / 800;
        const scaleY = canvasHeight / 600;
        
        // ベース座標系でのレイアウト
        const baseWidth = 800;
        const baseHeight = 600;
        // 半透明オーバーレイ
        context.save()';
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        ';
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = `bold ${32 * Math.min(scaleX, scaleY'}'px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const title = this.isEditingUsername ? 'ユーザー名変更' : 'ユーザー名登録';
        context.fillText(title, (baseWidth / 2) * scaleX, 200 * scaleY);
        ';
        // 説明文
        context.font = `${18 * Math.min(scaleX, scaleY'}'px Arial`;
        context.fillStyle = '#CCCCCC';
        context.fillText('ユーザー名を入力してください（最大10文字）', (baseWidth / 2) * scaleX, 240 * scaleY);
        
        // 入力ボックス
        this.renderInputBox(context, scaleX, scaleY);
        // ボタン
        this.renderUsernameInputButtons(context, scaleX, scaleY);
        ';
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = `${14 * Math.min(scaleX, scaleY'}'px Arial`;
        context.textAlign = 'center';
        context.fillText('文字を入力してEnterで決定、ESCでキャンセル', (baseWidth / 2) * scaleX, 450 * scaleY);
        
        context.restore();
    }
    
    /**
     * 入力ボックスを描画
     */
    renderInputBox(context: CanvasRenderingContext2D, scaleX: number, scaleY: number): void { try {
            const baseWidth = 800,
            const inputWidth = 400,

            const inputHeight = 50,
            const inputX = (baseWidth - inputWidth') / 2,
            const inputY = 280,
            
            // Canvas座標系での入力ボックス
            const scaledInputX = inputX * scaleX,
            const scaledInputY = inputY * scaleY,
            const scaledInputWidth = inputWidth * scaleX,
            const scaledInputHeight = inputHeight * scaleY,

            context.fillStyle = '#FFFFFF',
            context.fillRect(scaledInputX, scaledInputY, scaledInputWidth, scaledInputHeight),

            context.strokeStyle = '#0066CC',

            context.lineWidth = 3 * Math.min(scaleX, scaleY),
            context.strokeRect(scaledInputX, scaledInputY, scaledInputWidth, scaledInputHeight),
            ',
            // 入力テキスト
            context.fillStyle = '#000000',' }

            context.font = `${20 * Math.min(scaleX, scaleY'}'px Arial`;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            const displayText = this.usernameInput + (Date.now() % 1000 < 500 ? '|' : '); // カーソル点滅
            context.fillText(displayText, scaledInputX + 10 * scaleX, scaledInputY + scaledInputHeight / 2);'} catch (error) { this.errorHandler.handleError(error, 'RENDER_ERROR', {''
                context: 'UsernameInputManager.renderInputBox'
            });
        }
    }

    /**
     * ResponsiveCanvasManager座標システムを使用した入力ボックス描画
     */
    renderInputBoxWithResponsiveCoords(context: CanvasRenderingContext2D, canvasInfo: CanvasInfo, layout: Layout): void { try {
            const inputCoords = this.transformCoordinates(layout.inputBox.x, layout.inputBox.y, canvasInfo),
            const inputWidth = layout.inputBox.width * canvasInfo.scale,
            const inputHeight = layout.inputBox.height * canvasInfo.scale,
            
            if(!inputCoords || !this.validateCoordinates(inputCoords.x, inputCoords.y, canvasInfo) {
            ',

                if(this.gameEngine.debug) {
    
}

                    console.warn('Invalid input box coordinates, skipping render'); }
                }
                return;
            }
            ';
            // 入力ボックス背景
            context.fillStyle = '#FFFFFF';
            context.fillRect(inputCoords.x, inputCoords.y, inputWidth, inputHeight);
            ';
            // 入力ボックス枠線
            context.strokeStyle = '#0066CC';

            context.lineWidth = 3 * canvasInfo.scale;
            context.strokeRect(inputCoords.x, inputCoords.y, inputWidth, inputHeight);
            ';
            // 入力テキスト
            context.fillStyle = '#000000';

            context.font = `${20 * canvasInfo.scale}px Arial`;
            context.textAlign = 'left';
            context.textBaseline = 'middle';

            const displayText = this.usernameInput + (Date.now() % 1000 < 500 ? '|' : '); // カーソル点滅
            const textX = inputCoords.x + (10 * canvasInfo.scale);
            const textY = inputCoords.y + inputHeight / 2;
            ';

            context.fillText(displayText, textX, textY);'} catch (error) { this.errorHandler.handleError(error, 'RENDER_ERROR', {''
                context: 'UsernameInputManager.renderInputBoxWithResponsiveCoords'
            });
        }
    }
    
    /**
     * ユーザー名入力のボタンを描画
     */
    renderUsernameInputButtons(context: CanvasRenderingContext2D, scaleX: number, scaleY: number): void { try {
            // ベース座標系でのボタン位置・サイズ
            const baseWidth = 800,
            const buttonWidth = 100,
            const buttonHeight = 40,
            const buttonY = 360,
            
            // Canvas座標系でのボタン位置・サイズ
            const scaledButtonWidth = buttonWidth * scaleX,
            const scaledButtonHeight = buttonHeight * scaleY,
            const scaledButtonY = buttonY * scaleY,
            // OKボタン（Canvas座標系）
            const okButtonX = (baseWidth / 2 - buttonWidth - 10') * scaleX,
            context.fillStyle = this.usernameInput.length > 0 ? '#00AA00' : '#666666',
            context.fillRect(okButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight),

            context.strokeStyle = '#FFFFFF',

            context.lineWidth = 2 * Math.min(scaleX, scaleY),
            context.strokeRect(okButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight),

            context.fillStyle = '#FFFFFF',' }

            context.font = `bold ${16 * Math.min(scaleX, scaleY'}'px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('OK', okButtonX + scaledButtonWidth / 2, scaledButtonY + scaledButtonHeight / 2';
            ';
            // キャンセルボタン（Canvas座標系）
            const cancelButtonX = (baseWidth / 2 + 10') * scaleX;
            context.fillStyle = '#AA0000';
            context.fillRect(cancelButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight);

            context.strokeStyle = '#FFFFFF';

            context.lineWidth = 2 * Math.min(scaleX, scaleY);
            context.strokeRect(cancelButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight);

            context.fillStyle = '#FFFFFF';
            context.fillText('キャンセル', cancelButtonX + scaledButtonWidth / 2, scaledButtonY + scaledButtonHeight / 2';} catch (error) { this.errorHandler.handleError(error, 'RENDER_ERROR', {''
                context: 'UsernameInputManager.renderUsernameInputButtons'
            });
        }
    }

    /**
     * ResponsiveCanvasManager座標システムを使用したボタン描画
     */
    renderButtonsWithResponsiveCoords(context: CanvasRenderingContext2D, canvasInfo: CanvasInfo, layout: Layout): void { try {
            // OKボタンの描画
            const okCoords = this.transformCoordinates(layout.buttons.ok.x, layout.buttons.ok.y, canvasInfo),
            const okWidth = layout.buttons.ok.width * canvasInfo.scale,
            const okHeight = layout.buttons.ok.height * canvasInfo.scale,

            if(okCoords && this.validateCoordinates(okCoords.x, okCoords.y, canvasInfo)) {
                // OKボタン背景
                context.fillStyle = this.usernameInput.length > 0 ? '#00AA00' : '#666666',
                context.fillRect(okCoords.x, okCoords.y, okWidth, okHeight),
                ',
                // OKボタン枠線
                context.strokeStyle = '#FFFFFF',

                context.lineWidth = 2 * canvasInfo.scale,
                context.strokeRect(okCoords.x, okCoords.y, okWidth, okHeight),
                ',
                // OKボタンテキスト
                context.fillStyle = '#FFFFFF' }

                context.font = `bold ${16 * canvasInfo.scale}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('OK', okCoords.x + okWidth / 2, okCoords.y + okHeight / 2);
            }
            
            // キャンセルボタンの描画
            const cancelCoords = this.transformCoordinates(layout.buttons.cancel.x, layout.buttons.cancel.y, canvasInfo);
            const cancelWidth = layout.buttons.cancel.width * canvasInfo.scale;
            const cancelHeight = layout.buttons.cancel.height * canvasInfo.scale;

            if(cancelCoords && this.validateCoordinates(cancelCoords.x, cancelCoords.y, canvasInfo)) { // キャンセルボタン背景
                context.fillStyle = '#AA0000',
                context.fillRect(cancelCoords.x, cancelCoords.y, cancelWidth, cancelHeight),
                ',
                // キャンセルボタン枠線
                context.strokeStyle = '#FFFFFF',

                context.lineWidth = 2 * canvasInfo.scale,
                context.strokeRect(cancelCoords.x, cancelCoords.y, cancelWidth, cancelHeight),
                ',
                // キャンセルボタンテキスト
                context.fillStyle = '#FFFFFF' }

                context.font = `bold ${16 * canvasInfo.scale}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('キャンセル', cancelCoords.x + cancelWidth / 2, cancelCoords.y + cancelHeight / 2';} catch (error) { this.errorHandler.handleError(error, 'RENDER_ERROR', {''
                context: 'UsernameInputManager.renderButtonsWithResponsiveCoords'
            }';
        }
    }
    
    /**
     * ユーザー名を設定'
     */''
    setUsernameInput(username: string): void { ''
        this.usernameInput = username || ',
        this.isEditingUsername = !!username }
    
    /**
     * 文字入力処理
     */
    handleTextInput(key: string): boolean { if (key.length === 1 && this.usernameInput.length < 10) {
            // 英数字、ひらがな、カタカナ、漢字、ハイフン、アンダースコア、ピリオドを許可
            if(/[a-zA-Z0-9ぁ-んァ-ヶ一-龯\-_.　]/.test(key) {
                this.usernameInput += key }
                return true;
        return false;
    }
    
    /**
     * バックスペース処理
     */
    handleBackspace(): boolean { if (this.usernameInput.length > 0) {
            this.usernameInput = this.usernameInput.slice(0, -1),
            return true }
        return false;
    }
    
    /**
     * ユーザー名を取得
     */
    getUsernameInput(): string { return this.usernameInput }
    
    /**
     * 入力をクリア
     */''
    clearInput('';
        this.usernameInput = ';
        this.isEditingUsername = false;
    }
    
    /**
     * ユーザー名確定
     */)
    confirmUsername(): boolean { if (this.usernameInput.length === 0) {
            return false }
        
        this.gameEngine.playerData.username = this.usernameInput;
        this.gameEngine.playerData.save();
        console.log(`Username, set to: ${ this.gameEngine.playerData.username)`},

        this.clearInput('} }''