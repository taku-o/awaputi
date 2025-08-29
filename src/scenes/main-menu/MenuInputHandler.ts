import { getErrorHandler  } from '../../utils/ErrorHandler.js';
import type { MenuItem } from '../../types/game';

// インターフェース定義
interface MenuItemWithLabel extends MenuItem { 
    label: string;
}

interface Coordinates { 
    x: number;
    y: number;
}

interface ClickableSlider { 
    x: number;
    y: number;
    width: number;
    height: number;
    settingKey: string;
}

interface ClickableButton { 
    x: number;
    y: number;
    width: number;
    height: number;
    settingKey?: string;
    isEnabled?: boolean;
    langCode?: string;
    qualityCode?: string;
}

interface ClickableElements { 
    volumeSliders?: ClickableSlider[];
    toggleButtons?: ClickableButton[];
    languageButtons?: ClickableButton[];
    qualityButtons?: ClickableButton[];
}

interface SettingsCallbacks { 
    onChangeUsername: () => void;
    onShowDataClear: () => void;
    onShowControlsHelp: () => void;
    onCloseSettings: () => void;
}

/**
 * Menu Input Handler
 * メニュー全体の入力処理と統制を担当
 */
export class MenuInputHandler {
    public gameEngine: any;
    public errorHandler: any;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * メインメニューのクリック処理
     */
    handleMainMenuClick(coordinates: Coordinates): boolean {
        try {
            // メニュー項目の判定とアクション実行
            return this.processMenuItemClick(coordinates);
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_CLICK_ERROR', {
                context: 'MenuInputHandler.handleMainMenuClick',
                coordinates
            });
            return false;
        }
    }
    
    /**
     * キーボード入力処理
     */
    handleKeyboard(event: KeyboardEvent): boolean {
        try {
            switch (event.key) {
                case 'ArrowUp':
                    return this.handleMenuNavigation(-1);
                case 'ArrowDown':
                    return this.handleMenuNavigation(1);
                case 'Enter':
                    return this.handleMenuSelection();
                case 'Escape':
                    return this.handleMenuEscape();
                default:
                    return false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'KEYBOARD_INPUT_ERROR', {
                context: 'MenuInputHandler.handleKeyboard',
                key: event.key
            });
            return false;
        }
    }
    
    /**
     * メニューナビゲーション処理
     */
    private handleMenuNavigation(direction: number): boolean {
        try {
            const currentIndex = this.gameEngine.selectedMenuIndex || 0;
            const maxIndex = this.gameEngine.menuItems?.length || 0;
            
            let newIndex = currentIndex + direction;
            if (newIndex < 0) newIndex = maxIndex - 1;
            if (newIndex >= maxIndex) newIndex = 0;
            
            this.gameEngine.selectedMenuIndex = newIndex;
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_NAVIGATION_ERROR', {
                context: 'MenuInputHandler.handleMenuNavigation',
                direction
            });
            return false;
        }
    }
    
    /**
     * メニュー選択処理
     */
    private handleMenuSelection(): boolean {
        try {
            const selectedIndex = this.gameEngine.selectedMenuIndex || 0;
            const menuItems = this.gameEngine.menuItems;
            
            if (menuItems && menuItems[selectedIndex]) {
                const selectedItem = menuItems[selectedIndex];
                return this.executeMenuAction(selectedItem);
            }
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_SELECTION_ERROR', {
                context: 'MenuInputHandler.handleMenuSelection'
            });
            return false;
        }
    }
    
    /**
     * エスケープキー処理
     */
    private handleMenuEscape(): boolean {
        try {
            // メニューの状態に応じてアクション実行
            if (this.gameEngine.currentDialog) {
                this.gameEngine.currentDialog = null;
                return true;
            }
            
            // ゲーム終了
            if (this.gameEngine.exitGame) {
                this.gameEngine.exitGame();
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_ESCAPE_ERROR', {
                context: 'MenuInputHandler.handleMenuEscape'
            });
            return false;
        }
    }
    
    /**
     * メニュー項目クリック処理
     */
    private processMenuItemClick(coordinates: Coordinates): boolean {
        try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement;
            const menuItems = this.gameEngine.menuItems;
            
            if (!menuItems) return false;
            
            const menuStartY = 250;
            const menuItemHeight = 50;
            const centerX = canvas.width / 2;
            const menuWidth = 400;
            
            for (let i = 0; i < menuItems.length; i++) {
                const itemY = menuStartY + i * menuItemHeight;
                
                // クリック範囲判定
                if (coordinates.x >= centerX - menuWidth / 2 &&
                    coordinates.x <= centerX + menuWidth / 2 &&
                    coordinates.y >= itemY - 20 &&
                    coordinates.y <= itemY + 20) {
                    
                    this.gameEngine.selectedMenuIndex = i;
                    return this.executeMenuAction(menuItems[i]);
                }
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_ITEM_CLICK_ERROR', {
                context: 'MenuInputHandler.processMenuItemClick',
                coordinates
            });
            return false;
        }
    }
    
    /**
     * メニューアクション実行
     */
    private executeMenuAction(menuItem: MenuItem): boolean {
        try {
            if (menuItem.action && typeof menuItem.action === 'function') {
                menuItem.action();
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'MENU_ACTION_ERROR', {
                context: 'MenuInputHandler.executeMenuAction',
                menuItem: menuItem.id || 'unknown'
            });
            return false;
        }
    }
    
    /**
     * 設定画面のクリック処理
     */
    handleSettingsClick(coordinates: Coordinates, clickableElements: ClickableElements, callbacks: SettingsCallbacks): boolean {
        try {
            // スライダーのクリック判定
            if (clickableElements.volumeSliders) {
                for (const slider of clickableElements.volumeSliders) {
                    if (this.isPointInRect(coordinates, slider)) {
                        return this.handleSliderClick(coordinates, slider);
                    }
                }
            }
            
            // ボタンのクリック判定
            if (clickableElements.toggleButtons) {
                for (const button of clickableElements.toggleButtons) {
                    if (this.isPointInRect(coordinates, button)) {
                        return this.handleButtonClick(button, callbacks);
                    }
                }
            }
            
            // 言語ボタンのクリック判定
            if (clickableElements.languageButtons) {
                for (const button of clickableElements.languageButtons) {
                    if (this.isPointInRect(coordinates, button)) {
                        return this.handleLanguageButtonClick(button);
                    }
                }
            }
            
            // 品質ボタンのクリック判定
            if (clickableElements.qualityButtons) {
                for (const button of clickableElements.qualityButtons) {
                    if (this.isPointInRect(coordinates, button)) {
                        return this.handleQualityButtonClick(button);
                    }
                }
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_CLICK_ERROR', {
                context: 'MenuInputHandler.handleSettingsClick',
                coordinates
            });
            return false;
        }
    }
    
    /**
     * 矩形内の点判定
     */
    private isPointInRect(point: Coordinates, rect: { x: number; y: number; width: number; height: number; }): boolean {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
    
    /**
     * スライダークリック処理
     */
    private handleSliderClick(coordinates: Coordinates, slider: ClickableSlider): boolean {
        try {
            const relativeX = coordinates.x - slider.x;
            const ratio = Math.max(0, Math.min(1, relativeX / slider.width));
            
            if (this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.updateSetting(slider.settingKey, ratio);
                return true;
            }
            
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'SLIDER_CLICK_ERROR', {
                context: 'MenuInputHandler.handleSliderClick',
                slider: slider.settingKey
            });
            return false;
        }
    }
    
    /**
     * ボタンクリック処理
     */
    private handleButtonClick(button: ClickableButton, callbacks: SettingsCallbacks): boolean {
        try {
            if (!button.settingKey) return false;
            
            switch (button.settingKey) {
                case 'changeUsername':
                    callbacks.onChangeUsername();
                    return true;
                case 'showDataClear':
                    callbacks.onShowDataClear();
                    return true;
                case 'showControlsHelp':
                    callbacks.onShowControlsHelp();
                    return true;
                case 'closeSettings':
                    callbacks.onCloseSettings();
                    return true;
                default:
                    // 設定の切り替え
                    if (this.gameEngine.settingsManager) {
                        const currentValue = this.gameEngine.settingsManager.getSetting(button.settingKey);
                        this.gameEngine.settingsManager.updateSetting(button.settingKey, !currentValue);
                        return true;
                    }
                    return false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'BUTTON_CLICK_ERROR', {
                context: 'MenuInputHandler.handleButtonClick',
                button: button.settingKey
            });
            return false;
        }
    }
    
    /**
     * 言語ボタンクリック処理
     */
    private handleLanguageButtonClick(button: ClickableButton): boolean {
        try {
            if (button.langCode && this.gameEngine.i18nManager) {
                this.gameEngine.i18nManager.changeLanguage(button.langCode);
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'LANGUAGE_BUTTON_CLICK_ERROR', {
                context: 'MenuInputHandler.handleLanguageButtonClick',
                langCode: button.langCode
            });
            return false;
        }
    }
    
    /**
     * 品質ボタンクリック処理
     */
    private handleQualityButtonClick(button: ClickableButton): boolean {
        try {
            if (button.qualityCode && this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.updateSetting('quality', button.qualityCode);
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'QUALITY_BUTTON_CLICK_ERROR', {
                context: 'MenuInputHandler.handleQualityButtonClick',
                qualityCode: button.qualityCode
            });
            return false;
        }
    }
}