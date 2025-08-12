import { Scene } from '../core/Scene.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

// サブコンポーネントのインポート
import { MainMenuRenderer } from './main-menu/MainMenuRenderer.js';
import { UsernameInputManager } from './main-menu/UsernameInputManager.js';
import { SettingsRenderer } from './main-menu/SettingsRenderer.js';
import { MainMenuDialogManager } from './main-menu/MainMenuDialogManager.js';
import { MenuInputHandler } from './main-menu/MenuInputHandler.js';

/**
 * メインメニューシーン (Refactored)
 * 既存のMainMenuSceneを拡張し、サブコンポーネントに責任を分離
 * 
 * サブコンポーネント化により責任を分離：
 * - MainMenuRenderer: メインメニュー、メニュー項目、操作説明の描画
 * - UsernameInputManager: ユーザー名入力画面の管理と描画
 * - SettingsRenderer: 設定画面の描画とUI要素管理
 * - DialogManager: 確認ダイアログ、ヘルプ画面の管理
 * - MenuInputHandler: 入力処理とクリック判定の統制
 */
export class MainMenuScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.errorHandler = getErrorHandler();
        
        // 基本メニュー設定
        this.selectedMenuIndex = 0;
        this.menuItems = [
            { id: 'start', key: 'menu.start', action: () => this.startGame() },
            { id: 'settings', key: 'menu.settings', action: () => this.openSettings() },
            { id: 'userInfo', key: 'menu.userInfo', action: () => this.openUserInfo() },
            { id: 'help', key: 'menu.help', action: () => this.openHelp() }
        ];
        
        // 表示状態管理
        this.showingUsernameInput = false;
        this.showingSettings = false;
        this.showingUserInfo = false;
        this.showingDataClearConfirmation = false;
        this.showingControlsHelp = false;
        
        // サブコンポーネントの初期化
        this._initializeSubComponents();
        
        // 初期設定
        this.updateMenuLabels();
    }
    
    /**
     * サブコンポーネントの初期化
     */
    _initializeSubComponents() {
        try {
            this.mainMenuRenderer = new MainMenuRenderer(this.gameEngine);
            this.usernameInputManager = new UsernameInputManager(this.gameEngine);
            this.settingsRenderer = new SettingsRenderer(this.gameEngine);
            this.dialogManager = new MainMenuDialogManager(this.gameEngine);
            this.menuInputHandler = new MenuInputHandler(this.gameEngine);
            
            console.log('[MainMenuScene] サブコンポーネントを初期化しました');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuScene._initializeSubComponents'
            });
        }
    }
    
    /**
     * メニューラベルを現在の言語で更新
     */
    updateMenuLabels() {
        try {
            const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
            
            this.menuItems.forEach(item => {
                item.label = t(item.key);
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuScene.updateMenuLabels'
            });
        }
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        try {
            this.selectedMenuIndex = 0;
            this.showingUsernameInput = false;
            this.showingSettings = false;
            this.showingUserInfo = false;
            this.showingDataClearConfirmation = false;
            this.showingControlsHelp = false;
            
            // メニューラベルを現在の言語で更新
            this.updateMenuLabels();
            
            // リサイズハンドラーを登録
            if (this.gameEngine.responsiveCanvas) {
                this.resizeCallback = () => {
                    if (this.renderer) {
                        this.renderer.handleResize();
                    }
                };
                this.gameEngine.responsiveCanvas.onResizeCallbacks.push(this.resizeCallback);
            }
            
            // Playwright テスト用の裏道チェック
            const testUsername = localStorage.getItem('testUsername');
            const skipUsernameInput = localStorage.getItem('skipUsernameInput');
            
            if (testUsername && skipUsernameInput === 'true') {
                // テスト用ユーザー名を設定
                this.gameEngine.playerData.username = testUsername;
                this.gameEngine.playerData.save();
                console.log('[Test Mode] Username auto-set:', testUsername);
                
                // localStorageをクリア（一回限りの処理）
                localStorage.removeItem('testUsername');
                localStorage.removeItem('skipUsernameInput');
            }
            // 初回起動時にユーザー名が未設定の場合、ユーザー名入力を表示
            else if (!this.gameEngine.playerData.username) {
                this.showUsernameInput();
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuScene.enter'
            });
        }
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        try {
            // リサイズハンドラーを削除
            if (this.gameEngine.responsiveCanvas && this.resizeCallback) {
                const index = this.gameEngine.responsiveCanvas.onResizeCallbacks.indexOf(this.resizeCallback);
                if (index > -1) {
                    this.gameEngine.responsiveCanvas.onResizeCallbacks.splice(index, 1);
                }
                this.resizeCallback = null;
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuScene.exit'
            });
        }
    }
    
    update(deltaTime) {
        // 特に更新処理は不要
    }
    
    /**
     * 描画処理
     */
    render(context) {
        try {
            const canvas = this.gameEngine.canvas;
            
            // 背景
            context.fillStyle = '#001122';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            if (this.showingUsernameInput) {
                this.usernameInputManager.renderUsernameInput(context);
            } else if (this.showingDataClearConfirmation) {
                this.dialogManager.renderDataClearConfirmation(context);
            } else if (this.showingControlsHelp) {
                this.dialogManager.renderControlsHelp(context);
            } else if (this.showingSettings) {
                this.settingsRenderer.renderSettings(context);
            } else if (this.showingUserInfo) {
                this.dialogManager.renderUserInfo(context);
            } else {
                this.mainMenuRenderer.renderMainMenu(context, this.selectedMenuIndex, this.menuItems);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuScene.render'
            });
        }
    }
    
    /**
     * 入力処理（統制）
     */
    handleInput(event) {
        try {
            if (this.showingUsernameInput) {
                this.handleUsernameInput(event);
            } else if (this.showingDataClearConfirmation) {
                this.handleDataClearConfirmationInput(event);
            } else if (this.showingControlsHelp) {
                this.handleControlsHelpInput(event);
            } else if (this.showingSettings) {
                this.handleSettingsInput(event);
            } else if (this.showingUserInfo) {
                this.handleUserInfoInput(event);
            } else {
                this.handleMainMenuInput(event);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'MainMenuScene.handleInput'
            });
        }
    }
    
    /**
     * メインメニューの入力処理
     */
    handleMainMenuInput(event) {
        if (event.type === 'keydown') {
            switch (event.code) {
                case 'ArrowUp':
                    this.moveSelection(-1);
                    break;
                case 'ArrowDown':
                    this.moveSelection(1);
                    break;
                case 'Enter':
                    this.selectMenuItem();
                    break;
                case 'Escape':
                    console.log('ゲーム終了');
                    break;
            }
        } else if (event.type === 'click') {
            this.menuInputHandler.handleMainMenuClick(
                event, 
                this.selectedMenuIndex, 
                this.menuItems, 
                (index) => {
                    this.selectedMenuIndex = index;
                    this.selectMenuItem();
                }
            );
        }
    }
    
    /**
     * ユーザー名入力の入力処理
     */
    handleUsernameInput(event) {
        if (event.type === 'keydown') {
            switch (event.code) {
                case 'Enter':
                    this.confirmUsername();
                    break;
                case 'Escape':
                    this.cancelUsernameInput();
                    break;
                case 'Backspace':
                    this.usernameInputManager.handleBackspace();
                    break;
                default:
                    if (event.key.length === 1) {
                        this.usernameInputManager.handleTextInput(event.key);
                    }
                    break;
            }
        } else if (event.type === 'click') {
            this.menuInputHandler.handleUsernameInputClick(
                event,
                () => this.confirmUsername(),
                () => this.cancelUsernameInput()
            );
        }
    }
    
    /**
     * 設定画面の入力処理
     */
    handleSettingsInput(event) {
        if (event.type === 'keydown') {
            if (event.code === 'Escape') {
                this.closeSettings();
            }
        } else if (event.type === 'click') {
            const clickableElements = this.settingsRenderer.getClickableElements();
            const settingsCallbacks = {
                onChangeUsername: () => this.changeUsername(),
                onShowDataClear: () => this.showDataClearConfirmation(),
                onShowControlsHelp: () => this.showControlsHelp(),
                onCloseSettings: () => this.closeSettings()
            };
            
            this.menuInputHandler.handleSettingsClick(event, clickableElements, settingsCallbacks);
        }
    }
    
    /**
     * データクリア確認画面の入力処理
     */
    handleDataClearConfirmationInput(event) {
        if (event.type === 'keydown') {
            if (event.code === 'Escape') {
                this.cancelDataClear();
            }
        } else if (event.type === 'click') {
            this.menuInputHandler.handleDataClearConfirmationClick(
                event,
                () => this.executeDataClear(),
                () => this.cancelDataClear()
            );
        }
    }
    
    /**
     * 操作説明画面の入力処理
     */
    handleControlsHelpInput(event) {
        if (event.type === 'keydown') {
            if (event.code === 'Escape') {
                this.closeControlsHelp();
            }
        } else if (event.type === 'click') {
            this.menuInputHandler.handleBackButtonClick(
                event,
                () => this.closeControlsHelp(),
                this.gameEngine.canvas.height - 80
            );
        }
    }
    
    /**
     * ユーザー情報画面の入力処理
     */
    handleUserInfoInput(event) {
        if (event.type === 'keydown') {
            if (event.code === 'Escape') {
                this.closeUserInfo();
            }
        } else if (event.type === 'click') {
            this.menuInputHandler.handleBackButtonClick(
                event,
                () => this.closeUserInfo()
            );
        }
    }
    
    // ========================================
    // メニュー操作メソッド
    // ========================================
    
    /**
     * 選択を移動
     */
    moveSelection(direction) {
        this.selectedMenuIndex += direction;
        
        if (this.selectedMenuIndex < 0) {
            this.selectedMenuIndex = this.menuItems.length - 1;
        } else if (this.selectedMenuIndex >= this.menuItems.length) {
            this.selectedMenuIndex = 0;
        }
    }
    
    /**
     * メニュー項目を選択
     */
    selectMenuItem() {
        if (this.selectedMenuIndex >= 0 && this.selectedMenuIndex < this.menuItems.length) {
            this.menuItems[this.selectedMenuIndex].action();
        }
    }
    
    /**
     * ゲーム開始
     */
    startGame() {
        if (!this.gameEngine.playerData.username) {
            this.showUsernameInput();
            return;
        }
        
        this.gameEngine.sceneManager.switchScene('stageSelect');
    }
    
    /**
     * 設定画面を開く
     */
    openSettings() {
        this.gameEngine.sceneManager.switchScene('settings');
    }
    
    /**
     * ユーザー情報画面を開く
     */
    openUserInfo() {
        this.showingUserInfo = true;
    }
    
    /**
     * ヘルプ画面を開く
     */
    openHelp() {
        this.gameEngine.sceneManager.switchScene('help');
    }
    
    // ========================================
    // ダイアログ管理メソッド
    // ========================================
    
    /**
     * ユーザー名入力を表示
     */
    showUsernameInput() {
        this.showingUsernameInput = true;
        this.usernameInputManager.setUsernameInput(this.gameEngine.playerData.username);
    }
    
    /**
     * ユーザー名を確定
     */
    confirmUsername() {
        if (this.usernameInputManager.confirmUsername()) {
            this.showingUsernameInput = false;
        }
    }
    
    /**
     * ユーザー名入力をキャンセル
     */
    cancelUsernameInput() {
        if (!this.gameEngine.playerData.username && !this.usernameInputManager.isEditingUsername) {
            return;
        }
        
        this.showingUsernameInput = false;
        this.usernameInputManager.clearInput();
        
        if (this.showingSettings) {
            this.showingSettings = true;
        }
    }
    
    /**
     * ユーザー名変更
     */
    changeUsername() {
        this.showingSettings = false;
        this.showUsernameInput();
    }
    
    /**
     * 設定画面を閉じる
     */
    closeSettings() {
        this.showingSettings = false;
    }
    
    /**
     * ユーザー情報画面を閉じる
     */
    closeUserInfo() {
        this.showingUserInfo = false;
    }
    
    /**
     * データクリア確認画面を表示
     */
    showDataClearConfirmation() {
        this.showingSettings = false;
        this.showingDataClearConfirmation = true;
    }
    
    /**
     * データクリアを実行
     */
    executeDataClear() {
        if (this.dialogManager.executeDataClear()) {
            this.showingDataClearConfirmation = false;
            this.showUsernameInput();
        }
    }
    
    /**
     * データクリアをキャンセル
     */
    cancelDataClear() {
        this.showingDataClearConfirmation = false;
        this.showingSettings = true;
    }
    
    /**
     * 操作説明画面を表示
     */
    showControlsHelp() {
        this.showingSettings = false;
        this.showingControlsHelp = true;
    }
    
    /**
     * 操作説明画面を閉じる
     */
    closeControlsHelp() {
        this.showingControlsHelp = false;
        this.showingSettings = true;
    }
}