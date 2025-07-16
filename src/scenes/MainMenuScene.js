import { Scene } from '../core/SceneManager.js';

/**
 * メインメニューシーン
 */
export class MainMenuScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.selectedMenuIndex = 0;
        this.menuItems = [
            { id: 'start', label: 'ゲーム開始', action: () => this.startGame() },
            { id: 'settings', label: '設定', action: () => this.openSettings() },
            { id: 'userInfo', label: 'ユーザー情報', action: () => this.openUserInfo() }
        ];
        this.showingUsernameInput = false;
        this.showingSettings = false;
        this.showingUserInfo = false;
        this.usernameInput = '';
        this.isEditingUsername = false;
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.selectedMenuIndex = 0;
        this.showingUsernameInput = false;
        this.showingSettings = false;
        this.showingUserInfo = false;
        this.isEditingUsername = false;
        
        // 初回起動時にユーザー名が未設定の場合、ユーザー名入力を表示
        if (!this.gameEngine.playerData.username) {
            this.showUsernameInput();
        }
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 特に更新処理は不要
    }
    
    /**
     * 描画処理
     */
    render(context) {
        const canvas = this.gameEngine.canvas;
        
        // 背景
        context.fillStyle = '#001122';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.showingUsernameInput) {
            this.renderUsernameInput(context);
        } else if (this.showingSettings) {
            this.renderSettings(context);
        } else if (this.showingUserInfo) {
            this.renderUserInfo(context);
        } else {
            this.renderMainMenu(context);
        }
    }
    
    /**
     * メインメニューを描画
     */
    renderMainMenu(context) {
        const canvas = this.gameEngine.canvas;
        
        // タイトル
        context.save();
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('BubblePop', canvas.width / 2, 150);
        
        // サブタイトル
        context.font = '20px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('泡割りゲーム', canvas.width / 2, 190);
        context.restore();
        
        // プレイヤー情報表示
        if (this.gameEngine.playerData.username) {
            context.save();
            context.fillStyle = '#AAAAAA';
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.fillText(`プレイヤー: ${this.gameEngine.playerData.username}`, canvas.width / 2, 230);
            context.restore();
        }
        
        // メニュー項目
        this.renderMenuItems(context);
        
        // 操作説明
        this.renderControls(context);
    }
    
    /**
     * メニュー項目を描画
     */
    renderMenuItems(context) {
        const canvas = this.gameEngine.canvas;
        const startY = 280;
        const itemHeight = 50;
        const itemWidth = 300;
        const itemX = (canvas.width - itemWidth) / 2;
        
        this.menuItems.forEach((item, index) => {
            const y = startY + index * (itemHeight + 20);
            const isSelected = index === this.selectedMenuIndex;
            
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
    }
    
    /**
     * ユーザー名入力画面を描画
     */
    renderUsernameInput(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const title = this.isEditingUsername ? 'ユーザー名変更' : 'ユーザー名登録';
        context.fillText(title, canvas.width / 2, 200);
        
        // 説明文
        context.font = '18px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('ユーザー名を入力してください（最大10文字）', canvas.width / 2, 240);
        
        // 入力ボックス
        const inputWidth = 400;
        const inputHeight = 50;
        const inputX = (canvas.width - inputWidth) / 2;
        const inputY = 280;
        
        context.fillStyle = '#FFFFFF';
        context.fillRect(inputX, inputY, inputWidth, inputHeight);
        
        context.strokeStyle = '#0066CC';
        context.lineWidth = 3;
        context.strokeRect(inputX, inputY, inputWidth, inputHeight);
        
        // 入力テキスト
        context.fillStyle = '#000000';
        context.font = '20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        const displayText = this.usernameInput + (Date.now() % 1000 < 500 ? '|' : ''); // カーソル点滅
        context.fillText(displayText, inputX + 10, inputY + inputHeight / 2);
        
        // ボタン
        this.renderUsernameInputButtons(context);
        
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('文字を入力してEnterで決定、ESCでキャンセル', canvas.width / 2, 450);
        
        context.restore();
    }
    
    /**
     * ユーザー名入力のボタンを描画
     */
    renderUsernameInputButtons(context) {
        const canvas = this.gameEngine.canvas;
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonY = 360;
        
        // OKボタン
        const okButtonX = canvas.width / 2 - buttonWidth - 10;
        context.fillStyle = this.usernameInput.length > 0 ? '#00AA00' : '#666666';
        context.fillRect(okButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(okButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('OK', okButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // キャンセルボタン
        const cancelButtonX = canvas.width / 2 + 10;
        context.fillStyle = '#AA0000';
        context.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.fillText('キャンセル', cancelButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    }
    
    /**
     * 設定画面を描画
     */
    renderSettings(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('設定', canvas.width / 2, 150);
        
        // 設定項目（将来実装予定）
        context.font = '18px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('音量設定やその他のオプションは今後実装予定です', canvas.width / 2, 250);
        
        // ユーザー名変更ボタン
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = 300;
        
        context.fillStyle = '#0066CC';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.fillText('ユーザー名変更', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // 戻るボタン
        const backButtonY = 380;
        context.fillStyle = '#666666';
        context.fillRect(buttonX, backButtonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, backButtonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.fillText('戻る', buttonX + buttonWidth / 2, backButtonY + buttonHeight / 2);
        
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = '14px Arial';
        context.fillText('クリックまたはESCで戻る', canvas.width / 2, 480);
        
        context.restore();
    }
    
    /**
     * ユーザー情報画面を描画
     */
    renderUserInfo(context) {
        const canvas = this.gameEngine.canvas;
        const playerData = this.gameEngine.playerData;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('ユーザー情報', canvas.width / 2, 120);
        
        // ユーザー情報
        context.font = '20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const infoX = 150;
        let infoY = 180;
        const lineHeight = 35;
        
        context.fillText(`プレイヤー名: ${playerData.username || '未設定'}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`所持AP: ${playerData.ap}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`総TAP: ${playerData.tap}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`開放済みステージ: ${playerData.unlockedStages.length}`, infoX, infoY);
        infoY += lineHeight;
        
        context.fillText(`所持アイテム: ${playerData.ownedItems.length}`, infoX, infoY);
        infoY += lineHeight;
        
        // ハイスコア表示
        context.fillText('ハイスコア:', infoX, infoY);
        infoY += lineHeight;
        
        context.font = '16px Arial';
        context.fillStyle = '#CCCCCC';
        
        if (Object.keys(playerData.highScores).length > 0) {
            Object.entries(playerData.highScores).forEach(([stage, score]) => {
                const stageName = this.gameEngine.stageManager.getStageConfig(stage)?.name || stage;
                context.fillText(`  ${stageName}: ${score}`, infoX + 20, infoY);
                infoY += 25;
            });
        } else {
            context.fillText('  まだ記録がありません', infoX + 20, infoY);
        }
        
        // 戻るボタン
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = canvas.height - 100;
        
        context.fillStyle = '#666666';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('戻る', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = '14px Arial';
        context.fillText('クリックまたはESCで戻る', canvas.width / 2, canvas.height - 40);
        
        context.restore();
    }
    
    /**
     * 操作説明を描画
     */
    renderControls(context) {
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
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (this.showingUsernameInput) {
            this.handleUsernameInput(event);
        } else if (this.showingSettings) {
            this.handleSettingsInput(event);
        } else if (this.showingUserInfo) {
            this.handleUserInfoInput(event);
        } else {
            this.handleMainMenuInput(event);
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
                    // ゲーム終了（ブラウザでは実際には何もしない）
                    console.log('ゲーム終了');
                    break;
            }
        } else if (event.type === 'click') {
            this.handleMainMenuClick(event);
        }
    }
    
    /**
     * メインメニューのクリック処理
     */
    handleMainMenuClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const startY = 280;
        const itemHeight = 50;
        const itemWidth = 300;
        const itemX = (canvas.width - itemWidth) / 2;
        
        // メニュー項目のクリック判定
        this.menuItems.forEach((item, index) => {
            const itemY = startY + index * (itemHeight + 20);
            
            if (x >= itemX && x <= itemX + itemWidth && y >= itemY && y <= itemY + itemHeight) {
                this.selectedMenuIndex = index;
                this.selectMenuItem();
            }
        });
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
                    this.usernameInput = this.usernameInput.slice(0, -1);
                    break;
                default:
                    // 文字入力
                    if (event.key.length === 1 && this.usernameInput.length < 10) {
                        // 英数字、ひらがな、カタカナ、漢字のみ許可
                        if (/[a-zA-Z0-9ぁ-んァ-ヶ一-龯]/.test(event.key)) {
                            this.usernameInput += event.key;
                        }
                    }
                    break;
            }
        } else if (event.type === 'click') {
            this.handleUsernameInputClick(event);
        }
    }
    
    /**
     * ユーザー名入力のクリック処理
     */
    handleUsernameInputClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonY = 360;
        
        // OKボタン
        const okButtonX = canvas.width / 2 - buttonWidth - 10;
        if (x >= okButtonX && x <= okButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.confirmUsername();
            return;
        }
        
        // キャンセルボタン
        const cancelButtonX = canvas.width / 2 + 10;
        if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.cancelUsernameInput();
            return;
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
            this.handleSettingsClick(event);
        }
    }
    
    /**
     * 設定画面のクリック処理
     */
    handleSettingsClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (canvas.width - buttonWidth) / 2;
        
        // ユーザー名変更ボタン
        const changeUsernameButtonY = 300;
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= changeUsernameButtonY && y <= changeUsernameButtonY + buttonHeight) {
            this.changeUsername();
            return;
        }
        
        // 戻るボタン
        const backButtonY = 380;
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= backButtonY && y <= backButtonY + buttonHeight) {
            this.closeSettings();
            return;
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
            this.handleUserInfoClick(event);
        }
    }
    
    /**
     * ユーザー情報画面のクリック処理
     */
    handleUserInfoClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = canvas.height - 100;
        
        // 戻るボタン
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.closeUserInfo();
        }
    }
    
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
        // ユーザー名が未設定の場合は設定を促す
        if (!this.gameEngine.playerData.username) {
            this.showUsernameInput();
            return;
        }
        
        // ステージ選択画面に遷移
        this.sceneManager.switchScene('stageSelect');
    }
    
    /**
     * 設定画面を開く
     */
    openSettings() {
        this.showingSettings = true;
    }
    
    /**
     * 設定画面を閉じる
     */
    closeSettings() {
        this.showingSettings = false;
    }
    
    /**
     * ユーザー情報画面を開く
     */
    openUserInfo() {
        this.showingUserInfo = true;
    }
    
    /**
     * ユーザー情報画面を閉じる
     */
    closeUserInfo() {
        this.showingUserInfo = false;
    }
    
    /**
     * ユーザー名入力を表示
     */
    showUsernameInput() {
        this.showingUsernameInput = true;
        this.usernameInput = this.gameEngine.playerData.username || '';
        this.isEditingUsername = !!this.gameEngine.playerData.username;
    }
    
    /**
     * ユーザー名変更
     */
    changeUsername() {
        this.showingSettings = false;
        this.showUsernameInput();
    }
    
    /**
     * ユーザー名を確定
     */
    confirmUsername() {
        if (this.usernameInput.length === 0) {
            return;
        }
        
        this.gameEngine.playerData.username = this.usernameInput;
        this.gameEngine.playerData.save();
        this.showingUsernameInput = false;
        this.usernameInput = '';
        
        console.log(`Username set to: ${this.gameEngine.playerData.username}`);
    }
    
    /**
     * ユーザー名入力をキャンセル
     */
    cancelUsernameInput() {
        // 初回登録の場合はキャンセルできない
        if (!this.gameEngine.playerData.username && !this.isEditingUsername) {
            return;
        }
        
        this.showingUsernameInput = false;
        this.usernameInput = '';
        
        if (this.showingSettings) {
            this.showingSettings = true;
        }
    }
}