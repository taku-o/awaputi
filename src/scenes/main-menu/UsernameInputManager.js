import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Username Input Manager
 * ユーザー名入力機能の管理を担当
 */
export class UsernameInputManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.usernameInput = '';
        this.isEditingUsername = false;
    }
    /**
     * ResponsiveCanvasManagerから座標情報を安全に取得
     */
    getCanvasInfo() {
        try {
            const responsiveCanvasManager = this.gameEngine.responsiveCanvasManager;
            if (responsiveCanvasManager && typeof responsiveCanvasManager.getCanvasInfo === 'function') {
                const canvasInfo = responsiveCanvasManager.getCanvasInfo();
                if (canvasInfo && typeof canvasInfo.scale === 'number' && canvasInfo.scale > 0) {
                    return canvasInfo;
                }
            }
        } catch (error) {
            if (this.gameEngine.debug) {
                console.warn('ResponsiveCanvasManager access failed:', error);
            }
        }
        return null;
    }

    /**
     * ベース座標をCanvas座標に変換
     */
    transformCoordinates(baseX, baseY, canvasInfo) {
        if (!canvasInfo) return null;

        const { scale } = canvasInfo;
        return {
            x: baseX * scale,
            y: baseY * scale
        };
    }

    /**
     * 座標境界チェック
     */
    validateCoordinates(x, y, canvasInfo) {
        if (!canvasInfo) return false;
        
        const { actualWidth, actualHeight } = canvasInfo;
        return x >= 0 && x <= actualWidth && y >= 0 && y <= actualHeight;
    }

    /**
     * デバッグ用座標情報ログ
     */
    logCoordinateDebug(context, canvasInfo, transformedCoords) {
        if (this.gameEngine.debug) {
            console.log('Username input coordinate debug:', {
                canvasInfo: {
                    scale: canvasInfo?.scale,
                    displaySize: canvasInfo ? `${canvasInfo.displayWidth}x${canvasInfo.displayHeight}` : 'N/A',
                    actualSize: canvasInfo ? `${canvasInfo.actualWidth}x${canvasInfo.actualHeight}` : 'N/A',
                    pixelRatio: canvasInfo?.pixelRatio
                },
                transformedCoordinates: transformedCoords,
                fallbackMode: !canvasInfo
            });
        }
    }
    
    /**
     * ユーザー名入力画面を描画
     */
    renderUsernameInput(context) {
        try {
            const canvasInfo = this.getCanvasInfo();
            
            if (canvasInfo) {
                this.renderWithResponsiveCoordinates(context, canvasInfo);
            } else {
                this.renderWithFallbackCoordinates(context);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'UsernameInputManager.renderUsernameInput'
            });
        }
    }

    /**
     * ResponsiveCanvasManager座標システムを使用した描画
     */
    renderWithResponsiveCoordinates(context, canvasInfo) {
        if (this.gameEngine.debug) {
            console.log('Using ResponsiveCanvasManager coordinate system');
        }

        // ベース座標系でのレイアウト定義
        const BASE_WIDTH = 800;
        const BASE_HEIGHT = 600;
        const LAYOUT = {
            title: { x: 400, y: 200 },
            description: { x: 400, y: 240 },
            inputBox: { x: 200, y: 280, width: 400, height: 50 },
            buttons: {
                ok: { x: 290, y: 360, width: 100, height: 40 },
                cancel: { x: 410, y: 360, width: 100, height: 40 }
            },
            helpText: { x: 400, y: 450 }
        };

        // デバッグログ出力
        this.logCoordinateDebug(context, canvasInfo, LAYOUT);

        // 半透明オーバーレイ（Canvas全体をカバー）
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvasInfo.actualWidth, canvasInfo.actualHeight);

        // タイトルの描画
        const titleCoords = this.transformCoordinates(LAYOUT.title.x, LAYOUT.title.y, canvasInfo);
        if (titleCoords && this.validateCoordinates(titleCoords.x, titleCoords.y, canvasInfo)) {
            context.fillStyle = '#FFFFFF';
            context.font = `bold ${32 * canvasInfo.scale}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            const title = this.isEditingUsername ? 'ユーザー名変更' : 'ユーザー名登録';
            context.fillText(title, titleCoords.x, titleCoords.y);
        }

        // 説明文の描画
        const descCoords = this.transformCoordinates(LAYOUT.description.x, LAYOUT.description.y, canvasInfo);
        if (descCoords && this.validateCoordinates(descCoords.x, descCoords.y, canvasInfo)) {
            context.font = `${18 * canvasInfo.scale}px Arial`;
            context.fillStyle = '#CCCCCC';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('ユーザー名を入力してください（最大10文字）', descCoords.x, descCoords.y);
        }

        // TODO: 入力ボックス、ボタン、ヘルプテキスト（次のタスクで実装）
        // 一時的に従来の描画メソッドを呼び出し
        const tempScaleX = canvasInfo.actualWidth / 800;
        const tempScaleY = canvasInfo.actualHeight / 600;
        this.renderInputBox(context, tempScaleX, tempScaleY);
        this.renderUsernameInputButtons(context, tempScaleX, tempScaleY);

        // ヘルプテキストの描画
        const helpCoords = this.transformCoordinates(LAYOUT.helpText.x, LAYOUT.helpText.y, canvasInfo);
        if (helpCoords && this.validateCoordinates(helpCoords.x, helpCoords.y, canvasInfo)) {
            context.fillStyle = '#AAAAAA';
            context.font = `${14 * canvasInfo.scale}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('文字を入力してEnterで決定、ESCでキャンセル', helpCoords.x, helpCoords.y);
        }

        context.restore();
    }

    /**
     * フォールバック座標システムを使用した描画
     */
    renderWithFallbackCoordinates(context) {
        if (this.gameEngine.debug) {
            console.warn('ResponsiveCanvasManager not available, using fallback coordinates');
        }

        const canvas = this.gameEngine.canvas;
        
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
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = `bold ${32 * Math.min(scaleX, scaleY)}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const title = this.isEditingUsername ? 'ユーザー名変更' : 'ユーザー名登録';
        context.fillText(title, (baseWidth / 2) * scaleX, 200 * scaleY);
        
        // 説明文
        context.font = `${18 * Math.min(scaleX, scaleY)}px Arial`;
        context.fillStyle = '#CCCCCC';
        context.fillText('ユーザー名を入力してください（最大10文字）', (baseWidth / 2) * scaleX, 240 * scaleY);
        
        // 入力ボックス
        this.renderInputBox(context, scaleX, scaleY);
        
        // ボタン
        this.renderUsernameInputButtons(context, scaleX, scaleY);
        
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = `${14 * Math.min(scaleX, scaleY)}px Arial`;
        context.textAlign = 'center';
        context.fillText('文字を入力してEnterで決定、ESCでキャンセル', (baseWidth / 2) * scaleX, 450 * scaleY);
        
        context.restore();
    }
    
    /**
     * 入力ボックスを描画
     */
    renderInputBox(context, scaleX, scaleY) {
        try {
            const baseWidth = 800;
            const inputWidth = 400;
            const inputHeight = 50;
            const inputX = (baseWidth - inputWidth) / 2;
            const inputY = 280;
            
            // Canvas座標系での入力ボックス
            const scaledInputX = inputX * scaleX;
            const scaledInputY = inputY * scaleY;
            const scaledInputWidth = inputWidth * scaleX;
            const scaledInputHeight = inputHeight * scaleY;
            
            context.fillStyle = '#FFFFFF';
            context.fillRect(scaledInputX, scaledInputY, scaledInputWidth, scaledInputHeight);
            
            context.strokeStyle = '#0066CC';
            context.lineWidth = 3 * Math.min(scaleX, scaleY);
            context.strokeRect(scaledInputX, scaledInputY, scaledInputWidth, scaledInputHeight);
            
            // 入力テキスト
            context.fillStyle = '#000000';
            context.font = `${20 * Math.min(scaleX, scaleY)}px Arial`;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            const displayText = this.usernameInput + (Date.now() % 1000 < 500 ? '|' : ''); // カーソル点滅
            context.fillText(displayText, scaledInputX + 10 * scaleX, scaledInputY + scaledInputHeight / 2);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'UsernameInputManager.renderInputBox'
            });
        }
    }
    
    /**
     * ユーザー名入力のボタンを描画
     */
    renderUsernameInputButtons(context, scaleX, scaleY) {
        try {
            // ベース座標系でのボタン位置・サイズ
            const baseWidth = 800;
            const buttonWidth = 100;
            const buttonHeight = 40;
            const buttonY = 360;
            
            // Canvas座標系でのボタン位置・サイズ
            const scaledButtonWidth = buttonWidth * scaleX;
            const scaledButtonHeight = buttonHeight * scaleY;
            const scaledButtonY = buttonY * scaleY;
            
            // OKボタン（Canvas座標系）
            const okButtonX = (baseWidth / 2 - buttonWidth - 10) * scaleX;
            context.fillStyle = this.usernameInput.length > 0 ? '#00AA00' : '#666666';
            context.fillRect(okButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight);
            
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2 * Math.min(scaleX, scaleY);
            context.strokeRect(okButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight);
            
            context.fillStyle = '#FFFFFF';
            context.font = `bold ${16 * Math.min(scaleX, scaleY)}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('OK', okButtonX + scaledButtonWidth / 2, scaledButtonY + scaledButtonHeight / 2);
            
            // キャンセルボタン（Canvas座標系）
            const cancelButtonX = (baseWidth / 2 + 10) * scaleX;
            context.fillStyle = '#AA0000';
            context.fillRect(cancelButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight);
            
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2 * Math.min(scaleX, scaleY);
            context.strokeRect(cancelButtonX, scaledButtonY, scaledButtonWidth, scaledButtonHeight);
            
            context.fillStyle = '#FFFFFF';
            context.fillText('キャンセル', cancelButtonX + scaledButtonWidth / 2, scaledButtonY + scaledButtonHeight / 2);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'UsernameInputManager.renderUsernameInputButtons'
            });
        }
    }
    
    /**
     * ユーザー名を設定
     */
    setUsernameInput(username) {
        this.usernameInput = username || '';
        this.isEditingUsername = !!username;
    }
    
    /**
     * 文字入力処理
     */
    handleTextInput(key) {
        if (key.length === 1 && this.usernameInput.length < 10) {
            // 英数字、ひらがな、カタカナ、漢字、ハイフン、アンダースコア、ピリオドを許可
            if (/[a-zA-Z0-9ぁ-んァ-ヶ一-龯\-_.　]/.test(key)) {
                this.usernameInput += key;
                return true;
            }
        }
        return false;
    }
    
    /**
     * バックスペース処理
     */
    handleBackspace() {
        if (this.usernameInput.length > 0) {
            this.usernameInput = this.usernameInput.slice(0, -1);
            return true;
        }
        return false;
    }
    
    /**
     * ユーザー名を取得
     */
    getUsernameInput() {
        return this.usernameInput;
    }
    
    /**
     * 入力をクリア
     */
    clearInput() {
        this.usernameInput = '';
        this.isEditingUsername = false;
    }
    
    /**
     * ユーザー名確定
     */
    confirmUsername() {
        if (this.usernameInput.length === 0) {
            return false;
        }
        
        this.gameEngine.playerData.username = this.usernameInput;
        this.gameEngine.playerData.save();
        console.log(`Username set to: ${this.gameEngine.playerData.username}`);
        
        this.clearInput();
        return true;
    }
}