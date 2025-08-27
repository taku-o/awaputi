import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Menu Input Handler
 * メニュー全体の入力処理と統制を担当
 */
export class MenuInputHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * メインメニューのクリック処理
     */
    handleMainMenuClick(event, selectedMenuIndex, menuItems, onSelectCallback) {
        try {
            const canvas = this.gameEngine.canvas;
            const coords = this.getClickCoordinates(event);
            const x = coords.x;
            const y = coords.y;
            
            // Canvas実際の解像度を取得
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // ベース座標系（800x600）からCanvas座標系への変換比率
            const scaleX = canvasWidth / 800;
            const scaleY = canvasHeight / 600;
            
            // ベース座標系でのメニュー項目位置
            const baseWidth = 800;
            const startY = 280;
            const itemHeight = 50;
            const itemWidth = 300;
            const itemX = (baseWidth - itemWidth) / 2;
            
            // Canvas座標系でのメニュー項目位置
            const scaledItemX = itemX * scaleX;
            const scaledItemWidth = itemWidth * scaleX;
            const scaledItemHeight = itemHeight * scaleY;
            const scaledStartY = startY * scaleY;
            
            // メニュー項目のクリック判定
            for (let index = 0; index < menuItems.length; index++) {
                const itemY = scaledStartY + index * (scaledItemHeight + 20 * scaleY);
                
                if (x >= scaledItemX && x <= scaledItemX + scaledItemWidth && 
                    y >= itemY && y <= itemY + scaledItemHeight) {
                    onSelectCallback(index);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.handleMainMenuClick'
            });
            return false;
        }
    }
    
    /**
     * ユーザー名入力のクリック処理
     */
    handleUsernameInputClick(event, onConfirmCallback, onCancelCallback) {
        try {
            const canvas = this.gameEngine.canvas;
            const coords = this.getClickCoordinates(event);
            const x = coords.x;
            const y = coords.y;
            
            // Canvas実際の解像度を取得
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // ベース座標系（800x600）からCanvas座標系への変換比率
            const scaleX = canvasWidth / 800;
            const scaleY = canvasHeight / 600;
            
            // ベース座標系でのボタン位置
            const baseWidth = 800;
            const buttonWidth = 100;
            const buttonHeight = 40;
            const buttonY = 360;
            
            // Canvas座標系でのボタン位置
            const scaledButtonWidth = buttonWidth * scaleX;
            const scaledButtonHeight = buttonHeight * scaleY;
            const scaledButtonY = buttonY * scaleY;
            
            // OKボタン（Canvas座標系）
            const okButtonX = (baseWidth / 2 - buttonWidth - 10) * scaleX;
            if (x >= okButtonX && x <= okButtonX + scaledButtonWidth && 
                y >= scaledButtonY && y <= scaledButtonY + scaledButtonHeight) {
                onConfirmCallback();
                return true;
            }
            
            // キャンセルボタン（Canvas座標系）
            const cancelButtonX = (baseWidth / 2 + 10) * scaleX;
            if (x >= cancelButtonX && x <= cancelButtonX + scaledButtonWidth && 
                y >= scaledButtonY && y <= scaledButtonY + scaledButtonHeight) {
                onCancelCallback();
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.handleUsernameInputClick'
            });
            return false;
        }
    }
    
    /**
     * 設定画面のクリック処理
     */
    handleSettingsClick(event, clickableElements, settingsCallbacks) {
        try {
            const coords = this.getClickCoordinates(event);
            const x = coords.x;
            const y = coords.y;
            
            // 音量スライダーのクリック処理
            if (clickableElements.volumeSliders) {
                for (const slider of clickableElements.volumeSliders) {
                    if (x >= slider.x && x <= slider.x + slider.width && 
                        y >= slider.y && y <= slider.y + slider.height) {
                        const newValue = Math.max(0, Math.min(1, (x - slider.x) / slider.width));
                        this.gameEngine.settingsManager.set(slider.settingKey, newValue);
                        return true;
                    }
                }
            }
            
            // トグルボタンのクリック処理
            if (clickableElements.toggleButtons) {
                for (const button of clickableElements.toggleButtons) {
                    if (x >= button.x && x <= button.x + button.width && 
                        y >= button.y && y <= button.y + button.height) {
                        this.gameEngine.settingsManager.set(button.settingKey, !button.isEnabled);
                        return true;
                    }
                }
            }
            
            // 言語ボタンのクリック処理
            if (clickableElements.languageButtons) {
                for (const button of clickableElements.languageButtons) {
                    if (x >= button.x && x <= button.x + button.width && 
                        y >= button.y && y <= button.y + button.height) {
                        this.gameEngine.settingsManager.set('language', button.langCode);
                        return true;
                    }
                }
            }
            
            // 品質ボタンのクリック処理
            if (clickableElements.qualityButtons) {
                for (const button of clickableElements.qualityButtons) {
                    if (x >= button.x && x <= button.x + button.width && 
                        y >= button.y && y <= button.y + button.height) {
                        this.gameEngine.settingsManager.set('quality', button.qualityCode);
                        return true;
                    }
                }
            }
            
            // アクションボタンのクリック処理
            return this.handleSettingsActionButtons(x, y, settingsCallbacks);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.handleSettingsClick'
            });
            return false;
        }
    }
    
    /**
     * 設定アクションボタンのクリック処理
     */
    handleSettingsActionButtons(x, y, callbacks) {
        try {
            const canvas = this.gameEngine.canvas;
            const buttonWidth = 120;
            const buttonHeight = 35;
            const buttonY = canvas.height - 120;
            
            // ユーザー名変更ボタン
            if (x >= 50 && x <= 50 + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
                callbacks.onChangeUsername();
                return true;
            }
            
            // データクリアボタン
            if (x >= 180 && x <= 180 + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
                callbacks.onShowDataClear();
                return true;
            }
            
            // 操作説明ボタン
            if (x >= 310 && x <= 310 + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
                callbacks.onShowControlsHelp();
                return true;
            }
            
            // 戻るボタン
            const backButtonX = canvas.width - buttonWidth - 50;
            if (x >= backButtonX && x <= backButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
                callbacks.onCloseSettings();
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.handleSettingsActionButtons'
            });
            return false;
        }
    }
    
    /**
     * データクリア確認画面のクリック処理
     */
    handleDataClearConfirmationClick(event, onDeleteCallback, onCancelCallback) {
        try {
            const canvas = this.gameEngine.canvas;
            const coords = this.getClickCoordinates(event);
            const x = coords.x;
            const y = coords.y;
            
            const buttonWidth = 120;
            const buttonHeight = 45;
            const buttonY = 450;
            
            // 削除実行ボタン
            const deleteButtonX = canvas.width / 2 - buttonWidth - 15;
            if (x >= deleteButtonX && x <= deleteButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                onDeleteCallback();
                return true;
            }
            
            // キャンセルボタン
            const cancelButtonX = canvas.width / 2 + 15;
            if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                onCancelCallback();
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.handleDataClearConfirmationClick'
            });
            return false;
        }
    }
    
    /**
     * 戻るボタンのクリック処理（汎用）
     */
    handleBackButtonClick(event, onBackCallback, buttonY = null) {
        try {
            const canvas = this.gameEngine.canvas;
            const coords = this.getClickCoordinates(event);
            const x = coords.x;
            const y = coords.y;
            
            const buttonWidth = 150;
            const buttonHeight = 40;
            const buttonX = (canvas.width - buttonWidth) / 2;
            const targetY = buttonY || canvas.height - 100;
            
            // 戻るボタン
            if (x >= buttonX && x <= buttonX + buttonWidth && 
                y >= targetY && y <= targetY + buttonHeight) {
                onBackCallback();
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.handleBackButtonClick'
            });
            return false;
        }
    }
    
    /**
     * クリック座標を取得
     */
    getClickCoordinates(event) {
        try {
            const canvas = this.gameEngine.canvas;
            
            // レスポンシブCanvasマネージャーの座標変換を使用
            if (this.gameEngine.responsiveCanvasManager) {
                return this.gameEngine.responsiveCanvasManager.screenToCanvas(event.clientX, event.clientY);
            } else {
                // フォールバック: 従来の方法
                const rect = canvas.getBoundingClientRect();
                return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MenuInputHandler.getClickCoordinates'
            });
            return { x: 0, y: 0 };
        }
    }
}