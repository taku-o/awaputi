import { Scene  } from '../core/Scene.js';
import { getErrorHandler  } from '../utils/ErrorHandler.js';
import type { MenuItem, MainMenuScene as IMainMenuScene } from '../types/game';
';'
// サブコンポーネントのインポート
import { MainMenuRenderer  } from './main-menu/MainMenuRenderer.js';
import { UsernameInputManager  } from './main-menu/UsernameInputManager.js';
import { MainMenuDialogManager  } from './main-menu/MainMenuDialogManager.js';
import { MenuInputHandler  } from './main-menu/MenuInputHandler.js';

/**
 * メインメニューシーン (Refactored)
 * 既存のMainMenuSceneを拡張し、サブコンポーネントに責任を分離
 * 
 * サブコンポーネント化により責任を分離：
 * - MainMenuRenderer: メインメニュー、メニュー項目、操作説明の描画
 * - UsernameInputManager: ユーザー名入力画面の管理と描画
 * - SettingsRenderer: 設定画面の描画とUI要素管理
 * - DialogManager: 確認ダイアログ、ヘルプ画面の管理
 * -, MenuInputHandler: 入力処理とクリック判定の統制
 */
export class MainMenuScene extends Scene implements IMainMenuScene { public errorHandler: any;
    public selectedMenuIndex: number = 0;
    public menuItems: MenuItem[];
    public showingUsernameInput: boolean = false;
    public showingUserInfo: boolean = false;
    public showingDataClearConfirmation: boolean = false;
    public showingControlsHelp: boolean = false;
    public resizeCallback: (() => void) | undefined = undefined;
    
    // Sub-components
    public mainMenuRenderer: any;
    public usernameInputManager: any;
    public dialogManager: any;
    public menuInputHandler: any;

    constructor(gameEngine: any) {
','

        super(gameEngine);
        this.errorHandler = getErrorHandler()';'
            { id: 'start', key: 'menu.start', action: () => this.startGame()'
            { id: 'shop', key: 'menu.shop', action: () => this.openShop()'
            { id: 'settings', key: 'menu.settings', action: () => this.openSettings()

     }
    }

            { id: 'userInfo', key: 'menu.userInfo', action: () => this.openUserInfo()  }

            { id: 'help', key: 'menu.help', action: () => this.openHelp()  }
        ];
        
        // 表示状態管理
        this.showingUsernameInput = false;
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
    private _initializeSubComponents(): void { try {
            this.mainMenuRenderer = new MainMenuRenderer(this.gameEngine);
            this.usernameInputManager = new UsernameInputManager(this.gameEngine);
            this.dialogManager = new MainMenuDialogManager(this.gameEngine);
            this.menuInputHandler = new MenuInputHandler(this.gameEngine);

            console.log('[MainMenuScene] サブコンポーネントを初期化しました'),' }'

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene._initializeSubComponents'
            };
        }
    }
    
    /**
     * メニューラベルを現在の言語で更新
     */
    updateMenuLabels(): void { try {
            const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
            this.menuItems.forEach(item => { ) }
                item.label = t(item.key); }

            };'} catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.updateMenuLabels'
            };
        }
    }
    
    /**
     * シーン開始時の処理
     */
    enter(): void { super.enter();
        try {
            this.selectedMenuIndex = 0;
            this.showingUsernameInput = false;
            this.showingUserInfo = false;
            this.showingDataClearConfirmation = false;
            this.showingControlsHelp = false;
            
            // メニューラベルを現在の言語で更新
            this.updateMenuLabels();
            // リサイズハンドラーを登録
            if (this.gameEngine.responsiveCanvas) {

                this.resizeCallback = () => { }

                    if(this.mainMenuRenderer && typeof; this.mainMenuRenderer.handleResize === 'function' { }'
                        this.mainMenuRenderer.handleResize(); }
};
                this.gameEngine.responsiveCanvas.onResizeCallbacks.push(this.resizeCallback);
            }
            ';'
            // Playwright テスト用の裏道チェック
            const testUsername = localStorage.getItem('testUsername');
            const skipUsernameInput = localStorage.getItem('skipUsernameInput');

            if(testUsername && skipUsernameInput === 'true' {'
                // テスト用ユーザー名を設定
                this.gameEngine.playerData.username = testUsername,
                this.gameEngine.playerData.save()','
                console.log('[Test Mode] Username auto-set:', testUsername','
                ','
                // localStorageをクリア（一回限りの処理）
                localStorage.removeItem('testUsername') }

                localStorage.removeItem('skipUsernameInput'; }'
            }
            // 初回起動時にユーザー名が未設定の場合、ユーザー名入力を表示
            else if (!this.gameEngine.playerData.username) { this.showUsernameInput(),' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.enter'
            };
        }
    }
    
    /**
     * シーン終了時の処理
     */
    exit(): void { super.exit();
        try {
            // リサイズハンドラーを削除
            if (this.gameEngine.responsiveCanvas && this.resizeCallback) {
                const index = this.gameEngine.responsiveCanvas.onResizeCallbacks.indexOf(this.resizeCallback);
                if (index > -1) {
            }
                    this.gameEngine.responsiveCanvas.onResizeCallbacks.splice(index, 1); }
                }
                this.resizeCallback = undefined;'} catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.exit'
            };
        }
    }
    
    /**
     * 更新処理
     */
    update(__deltaTime: number): void { // 特に更新処理は不要 }
    
    /**
     * 描画処理
     */''
    render(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas,
            ','
            // 背景
            context.fillStyle = '#001122',
            context.fillRect(0, 0, canvas.width, canvas.height);
            if (this.showingUsernameInput) {
    
}
                this.usernameInputManager.renderUsernameInput(context); }
            } else if (this.showingDataClearConfirmation) { this.dialogManager.renderDataClearConfirmation(context) } else if (this.showingControlsHelp) { this.dialogManager.renderControlsHelp(context) } else if (this.showingUserInfo) { this.dialogManager.renderUserInfo(context) }

            } else { this.mainMenuRenderer.renderMainMenu(context, this.selectedMenuIndex, this.menuItems),' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.render'
            };
        }
    }
    
    /**
     * 入力処理（統制）
     */
    handleInput(event: Event): boolean | void { try {
            if (this.showingUsernameInput) {
    
}
                this.handleUsernameInput(event); }
            } else if (this.showingDataClearConfirmation) { this.handleDataClearConfirmationInput(event) } else if (this.showingControlsHelp) { this.handleControlsHelpInput(event) } else if (this.showingUserInfo) { this.handleUserInfoInput(event) }

            } else { this.handleMainMenuInput(event),' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.handleInput'
            }';'
        }
    }
    
    /**
     * メインメニューの入力処理'
     */''
    handleMainMenuInput(event: Event): void { const keyboardEvent = event as KeyboardEvent,
        const mouseEvent = event as MouseEvent,

        if (event.type === 'keydown''

            switch(keyboardEvent.code) {''
                case 'ArrowUp':','
                    this.moveSelection(-1);
                    break,
                case 'ArrowDown':','
                    this.moveSelection(1);
                    break,
                case 'Enter':','
                    this.selectMenuItem()','
                case 'Escape':')',
                    console.log('ゲーム終了') }
                    break; }

            }'} else if(event.type === 'click' { this.menuInputHandler.handleMainMenuClick('
                mouseEvent,
                this.selectedMenuIndex);
                this.menuItems),
                (index: number) => { 
                    this.selectedMenuIndex = index  }
                    this.selectMenuItem(); }
                }
    }
    
    /**
     * ユーザー名入力の入力処理'
     */''
    handleUsernameInput(event: Event): void { const keyboardEvent = event as KeyboardEvent,
        const mouseEvent = event as MouseEvent,

        if (event.type === 'keydown''

            switch(keyboardEvent.code) {''
                case 'Enter':','
                    this.confirmUsername('''
                case 'Escape': ','
                    this.cancelUsernameInput()','
                case 'Backspace':),
                    this.usernameInputManager.handleBackspace();
                    break,
                default:','
                    if (keyboardEvent.key.length === 1) {
            }

                        this.usernameInputManager.handleTextInput(keyboardEvent.key) }
                    }
                    break;

            }'} else if (event.type === 'click) { this.menuInputHandler.handleUsernameInputClick()'
                mouseEvent,
                () => this.confirmUsername();
                () => this.cancelUsernameInput() }
}
    
    /**
     * データクリア確認画面の入力処理'
     */''
    handleDataClearConfirmationInput(event: Event): void { const keyboardEvent = event as KeyboardEvent,
        const mouseEvent = event as MouseEvent,

        if (event.type === 'keydown') {

            if(keyboardEvent.code === 'Escape' { }

                this.cancelDataClear() }

        } else if (event.type === 'click) { this.menuInputHandler.handleDataClearConfirmationClick()'
                mouseEvent,
                () => this.executeDataClear();
                () => this.cancelDataClear() }
}
    
    /**
     * 操作説明画面の入力処理'
     */''
    handleControlsHelpInput(event: Event): void { const keyboardEvent = event as KeyboardEvent,
        const mouseEvent = event as MouseEvent,

        if (event.type === 'keydown') {

            if(keyboardEvent.code === 'Escape' { }

                this.closeControlsHelp() }

        } else if (event.type === 'click) { this.menuInputHandler.handleBackButtonClick()'
                mouseEvent,
                () => this.closeControlsHelp();
                this.gameEngine.canvas.height - 80) }
}
    
    /**
     * ユーザー情報画面の入力処理'
     */''
    handleUserInfoInput(event: Event): void { const keyboardEvent = event as KeyboardEvent,
        const mouseEvent = event as MouseEvent,

        if (event.type === 'keydown') {

            if(keyboardEvent.code === 'Escape' { }

                this.closeUserInfo() }

        } else if (event.type === 'click) { this.menuInputHandler.handleBackButtonClick()'
                mouseEvent,
                () => this.closeUserInfo() }
}
    
    // ========================================
    // メニュー操作メソッド
    // ========================================
    
    /**
     * 選択を移動
     */
    moveSelection(direction: number): void { this.selectedMenuIndex += direction,
        
        if (this.selectedMenuIndex < 0) {
    
}
            this.selectedMenuIndex = this.menuItems.length - 1; }
        } else if (this.selectedMenuIndex >= this.menuItems.length) { this.selectedMenuIndex = 0 }
    }
    
    /**
     * メニュー項目を選択
     */
    selectMenuItem(): void { if (this.selectedMenuIndex >= 0 && this.selectedMenuIndex < this.menuItems.length) {
            this.menuItems[this.selectedMenuIndex].action() }
    }
    
    /**
     * ゲーム開始
     */
    startGame(): void { if (!this.gameEngine.playerData.username) {''
            this.showUsernameInput()';'
        this.gameEngine.sceneManager.switchScene('stageSelect' }'
    
    /**
     * 設定画面を開く
     * NavigationContextManagerを使用してコンテキストを管理'
     */''
    openSettings('''
                accessMethod: 'menu_click',
                sourceScene: 'MainMenuScene);'
            }''

            const success = this.gameEngine.sceneManager.switchScene('settings', contextData);

            if (!success) {', ' }

                console.error('[MainMenuScene] Failed, to switch, to settings, scene'); }
            }

            console.log('[MainMenuScene] Settings, opened from, menu');
        } catch (error) { console.error('[MainMenuScene] Error opening settings:', error);
            this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.openSettings'
            };
        }
    }
    
    /**
     * ユーザー情報画面を開く
     */
    openUserInfo(): void { this.showingUserInfo = true }
    
    /**
     * ショップ画面を開く'
     */''
    openShop()';'
            const success = this.gameEngine.sceneManager.switchScene('shop';
            if (!success) {

                console.error('[MainMenuScene] Failed, to switch, to shop, scene') }

                // フォールバック: エラーメッセージ表示' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.openShop'
            }';'
        }
    }
    
    /**
     * ヘルプ画面を開く
     * NavigationContextManagerを使用してコンテキストを管理'
     */''
    openHelp('''
                accessMethod: 'menu_click',
                sourceScene: 'MainMenuScene',
    standard: true // 標準ヘルプモード);
            }'

            const success = this.gameEngine.sceneManager.switchScene('help', contextData);

            if (!success) {', ' }

                console.error('[MainMenuScene] Failed, to switch, to help, scene'); }
            }

            console.log('[MainMenuScene] Help, opened from, menu');
        } catch (error) { console.error('[MainMenuScene] Error opening help:', error);
            this.errorHandler.handleError(error, {)'
                context: 'MainMenuScene.openHelp'
            };
        }
    }
    
    // ========================================
    // ダイアログ管理メソッド
    // ========================================
    
    /**
     * ユーザー名入力を表示
     */
    showUsernameInput(): void { this.showingUsernameInput = true;
        this.usernameInputManager.setUsernameInput(this.gameEngine.playerData.username) }
    
    /**
     * ユーザー名を確定
     */
    confirmUsername(): void { if (this.usernameInputManager.confirmUsername() {
            this.showingUsernameInput = false }
    }
    
    /**
     * ユーザー名入力をキャンセル
     */
    cancelUsernameInput(): void { if (!this.gameEngine.playerData.username && !this.usernameInputManager.isEditingUsername) {
            return }
        
        this.showingUsernameInput = false;
        this.usernameInputManager.clearInput();
    }
    
    /**
     * ユーザー名変更
     */
    changeUsername(): void { this.showUsernameInput() }
    
    /**
     * ユーザー情報画面を閉じる
     */
    closeUserInfo(): void { this.showingUserInfo = false }
    
    /**
     * データクリア確認画面を表示
     */
    showDataClearConfirmation(): void { this.showingDataClearConfirmation = true }
    
    /**
     * データクリアを実行
     */
    executeDataClear(): void { if (this.dialogManager.executeDataClear() {
            this.showingDataClearConfirmation = false;
            this.showUsernameInput() }
    }
    
    /**
     * データクリアをキャンセル
     */
    cancelDataClear(): void { this.showingDataClearConfirmation = false }
    
    /**
     * 操作説明画面を表示
     */
    showControlsHelp(): void { this.showingControlsHelp = true }
    
    /**
     * 操作説明画面を閉じる
     */''
    closeControlsHelp();