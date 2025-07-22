import { Scene } from '../core/Scene.js';

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
        this.showingDataClearConfirmation = false;
        this.showingControlsHelp = false;
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
        this.showingDataClearConfirmation = false;
        this.showingControlsHelp = false;
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
        } else if (this.showingDataClearConfirmation) {
            this.renderDataClearConfirmation(context);
        } else if (this.showingControlsHelp) {
            this.renderControlsHelp(context);
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
        
        // ベース座標系（800x600）を使用
        const baseWidth = 800;
        const startY = 280;
        const itemHeight = 50;
        const itemWidth = 300;
        const itemX = (baseWidth - itemWidth) / 2;
        
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
        
        // ベース座標系（800x600）を使用
        const baseWidth = 800;
        const baseHeight = 600;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, baseWidth, baseHeight);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const title = this.isEditingUsername ? 'ユーザー名変更' : 'ユーザー名登録';
        context.fillText(title, baseWidth / 2, 200);
        
        // 説明文
        context.font = '18px Arial';
        context.fillStyle = '#CCCCCC';
        context.fillText('ユーザー名を入力してください（最大10文字）', baseWidth / 2, 240);
        
        // 入力ボックス
        const inputWidth = 400;
        const inputHeight = 50;
        const inputX = (baseWidth - inputWidth) / 2;
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
        
        // ベース座標系（800x600）を使用
        const baseWidth = 800;
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonY = 360;
        
        // OKボタン
        const okButtonX = baseWidth / 2 - buttonWidth - 10;
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
        const cancelButtonX = baseWidth / 2 + 10;
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
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(t('settings.title'), canvas.width / 2, 80);
        
        // 設定セクション
        this.renderAudioSettings(context, t);
        this.renderLanguageSettings(context, t);
        this.renderQualitySettings(context, t);
        this.renderAccessibilitySettings(context, t);
        
        // アクションボタン
        this.renderSettingsActions(context, t);
        
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(t('menu.controls'), canvas.width / 2, canvas.height - 40);
        
        context.restore();
    }
    
    /**
     * 音響設定を描画
     */
    renderAudioSettings(context, t) {
        const canvas = this.gameEngine.canvas;
        const settings = this.gameEngine.settingsManager;
        
        // セクションタイトル
        context.fillStyle = '#FFFF99';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText(t('settings.audio'), 50, 130);
        
        let y = 160;
        const lineHeight = 30;
        
        // マスター音量
        this.renderVolumeSlider(context, 50, y, 300, 20, 
            t('settings.masterVolume'), 
            settings.get('masterVolume'), 
            'masterVolume');
        y += lineHeight;
        
        // 効果音音量
        this.renderVolumeSlider(context, 50, y, 300, 20, 
            t('settings.sfxVolume'), 
            settings.get('sfxVolume'), 
            'sfxVolume');
        y += lineHeight;
        
        // BGM音量
        this.renderVolumeSlider(context, 50, y, 300, 20, 
            t('settings.bgmVolume'), 
            settings.get('bgmVolume'), 
            'bgmVolume');
        y += lineHeight;
        
        // ミュートボタン
        this.renderToggleButton(context, 50, y, 100, 25, 
            t('settings.mute'), 
            settings.get('isMuted'), 
            'isMuted');
    }
    
    /**
     * 言語設定を描画
     */
    renderLanguageSettings(context, t) {
        const canvas = this.gameEngine.canvas;
        const settings = this.gameEngine.settingsManager;
        const currentLang = settings.get('language');
        
        // セクションタイトル
        context.fillStyle = '#99FFFF';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText(t('settings.language'), 400, 130);
        
        // 言語選択ボタン
        const languages = [
            { code: 'ja', name: '日本語' },
            { code: 'en', name: 'English' }
        ];
        
        let y = 160;
        languages.forEach(lang => {
            const isSelected = currentLang === lang.code;
            this.renderLanguageButton(context, 400, y, 150, 25, 
                lang.name, lang.code, isSelected);
            y += 30;
        });
    }
    
    /**
     * 品質設定を描画
     */
    renderQualitySettings(context, t) {
        const canvas = this.gameEngine.canvas;
        const settings = this.gameEngine.settingsManager;
        const currentQuality = settings.get('quality');
        
        // セクションタイトル
        context.fillStyle = '#FFCC99';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText(t('settings.quality'), 50, 280);
        
        // 品質選択ボタン
        const qualities = [
            { code: 'auto', name: t('quality.auto') },
            { code: 'high', name: t('quality.high') },
            { code: 'medium', name: t('quality.medium') },
            { code: 'low', name: t('quality.low') }
        ];
        
        let x = 50;
        qualities.forEach(quality => {
            const isSelected = currentQuality === quality.code;
            this.renderQualityButton(context, x, 310, 80, 25, 
                quality.name, quality.code, isSelected);
            x += 90;
        });
    }
    
    /**
     * アクセシビリティ設定を描画
     */
    renderAccessibilitySettings(context, t) {
        const canvas = this.gameEngine.canvas;
        const settings = this.gameEngine.settingsManager;
        
        // セクションタイトル
        context.fillStyle = '#CCFFCC';
        context.font = 'bold 20px Arial';
        context.textAlign = 'left';
        context.fillText(t('settings.accessibility'), 400, 280);
        
        let y = 310;
        const lineHeight = 30;
        
        // アクセシビリティオプション
        const accessibilityOptions = [
            { key: 'accessibility.highContrast', label: t('accessibility.highContrast') },
            { key: 'accessibility.reducedMotion', label: t('accessibility.reducedMotion') },
            { key: 'accessibility.largeText', label: t('accessibility.largeText') }
        ];
        
        accessibilityOptions.forEach(option => {
            this.renderToggleButton(context, 400, y, 200, 25, 
                option.label, 
                settings.get(option.key), 
                option.key);
            y += lineHeight;
        });
    }
    
    /**
     * 設定アクションボタンを描画
     */
    renderSettingsActions(context, t) {
        const canvas = this.gameEngine.canvas;
        const buttonWidth = 120;
        const buttonHeight = 35;
        const buttonY = canvas.height - 120;
        
        // ユーザー名変更ボタン
        this.renderSettingsButton(context, 50, buttonY, buttonWidth, buttonHeight, 
            t('username.change'), '#0066CC');
        
        // データクリアボタン
        this.renderSettingsButton(context, 180, buttonY, buttonWidth, buttonHeight, 
            t('dataClear.title'), '#CC6600');
        
        // 操作説明ボタン
        this.renderSettingsButton(context, 310, buttonY, buttonWidth, buttonHeight, 
            t('help.title'), '#006600');
        
        // 戻るボタン
        this.renderSettingsButton(context, canvas.width - buttonWidth - 50, buttonY, 
            buttonWidth, buttonHeight, t('settings.back'), '#666666');
    }
    
    /**
     * 音量スライダーを描画
     */
    renderVolumeSlider(context, x, y, width, height, label, value, settingKey) {
        // ラベル
        context.fillStyle = '#FFFFFF';
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.fillText(label, x, y - 5);
        
        // スライダー背景
        context.fillStyle = '#333333';
        context.fillRect(x, y, width, height);
        
        // スライダー枠線
        context.strokeStyle = '#666666';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
        
        // スライダー値
        const fillWidth = width * value;
        context.fillStyle = '#0066CC';
        context.fillRect(x, y, fillWidth, height);
        
        // 値表示
        context.fillStyle = '#FFFFFF';
        context.font = '14px Arial';
        context.textAlign = 'right';
        context.fillText(`${Math.round(value * 100)}%`, x + width + 30, y + height - 3);
        
        // クリック領域を記録
        this.volumeSliders = this.volumeSliders || [];
        this.volumeSliders.push({
            x, y, width, height, settingKey, value
        });
    }
    
    /**
     * トグルボタンを描画
     */
    renderToggleButton(context, x, y, width, height, label, isEnabled, settingKey) {
        // ボタン背景
        context.fillStyle = isEnabled ? '#00AA00' : '#666666';
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // ラベル
        context.fillStyle = '#FFFFFF';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, x + width / 2, y + height / 2);
        
        // クリック領域を記録
        this.toggleButtons = this.toggleButtons || [];
        this.toggleButtons.push({
            x, y, width, height, settingKey, isEnabled
        });
    }
    
    /**
     * 言語ボタンを描画
     */
    renderLanguageButton(context, x, y, width, height, label, langCode, isSelected) {
        // ボタン背景
        context.fillStyle = isSelected ? '#0066CC' : '#333333';
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // ラベル
        context.fillStyle = '#FFFFFF';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, x + width / 2, y + height / 2);
        
        // クリック領域を記録
        this.languageButtons = this.languageButtons || [];
        this.languageButtons.push({
            x, y, width, height, langCode, isSelected
        });
    }
    
    /**
     * 品質ボタンを描画
     */
    renderQualityButton(context, x, y, width, height, label, qualityCode, isSelected) {
        // ボタン背景
        context.fillStyle = isSelected ? '#CC6600' : '#333333';
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = isSelected ? '#FFFFFF' : '#666666';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // ラベル
        context.fillStyle = '#FFFFFF';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, x + width / 2, y + height / 2);
        
        // クリック領域を記録
        this.qualityButtons = this.qualityButtons || [];
        this.qualityButtons.push({
            x, y, width, height, qualityCode, isSelected
        });
    }
    
    /**
     * 設定ボタンを描画
     */
    renderSettingsButton(context, x, y, width, height, text, color) {
        // ボタン背景
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
        
        // ボタン枠線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        
        // ボタンテキスト
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 18px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x + width / 2, y + height / 2);
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
        
        // レスポンシブCanvasマネージャーの座標変換を使用
        let coords;
        if (this.gameEngine.responsiveCanvasManager) {
            coords = this.gameEngine.responsiveCanvasManager.screenToCanvas(event.clientX, event.clientY);
        } else {
            // フォールバック: 従来の方法
            const rect = canvas.getBoundingClientRect();
            coords = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }
        
        const x = coords.x;
        const y = coords.y;
        
        // ベース座標系（800x600）を使用
        const baseWidth = 800;
        const startY = 280;
        const itemHeight = 50;
        const itemWidth = 300;
        const itemX = (baseWidth - itemWidth) / 2;
        
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
        
        // レスポンシブCanvasマネージャーの座標変換を使用
        let coords;
        if (this.gameEngine.responsiveCanvasManager) {
            coords = this.gameEngine.responsiveCanvasManager.screenToCanvas(event.clientX, event.clientY);
        } else {
            // フォールバック: 従来の方法
            const rect = canvas.getBoundingClientRect();
            coords = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }
        
        const x = coords.x;
        const y = coords.y;
        
        // ベース座標系（800x600）を使用
        const baseWidth = 800;
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonY = 360;
        
        // OKボタン
        const okButtonX = baseWidth / 2 - buttonWidth - 10;
        if (x >= okButtonX && x <= okButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.confirmUsername();
            return;
        }
        
        // キャンセルボタン
        const cancelButtonX = baseWidth / 2 + 10;
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
        
        // 音量スライダーのクリック処理
        if (this.volumeSliders) {
            for (const slider of this.volumeSliders) {
                if (x >= slider.x && x <= slider.x + slider.width && 
                    y >= slider.y && y <= slider.y + slider.height) {
                    const newValue = Math.max(0, Math.min(1, (x - slider.x) / slider.width));
                    this.gameEngine.settingsManager.set(slider.settingKey, newValue);
                    return;
                }
            }
        }
        
        // トグルボタンのクリック処理
        if (this.toggleButtons) {
            for (const button of this.toggleButtons) {
                if (x >= button.x && x <= button.x + button.width && 
                    y >= button.y && y <= button.y + button.height) {
                    this.gameEngine.settingsManager.set(button.settingKey, !button.isEnabled);
                    return;
                }
            }
        }
        
        // 言語ボタンのクリック処理
        if (this.languageButtons) {
            for (const button of this.languageButtons) {
                if (x >= button.x && x <= button.x + button.width && 
                    y >= button.y && y <= button.y + button.height) {
                    this.gameEngine.settingsManager.set('language', button.langCode);
                    return;
                }
            }
        }
        
        // 品質ボタンのクリック処理
        if (this.qualityButtons) {
            for (const button of this.qualityButtons) {
                if (x >= button.x && x <= button.x + button.width && 
                    y >= button.y && y <= button.y + button.height) {
                    this.gameEngine.settingsManager.set('quality', button.qualityCode);
                    return;
                }
            }
        }
        
        // アクションボタンのクリック処理
        const buttonWidth = 120;
        const buttonHeight = 35;
        const buttonY = canvas.height - 120;
        
        // ユーザー名変更ボタン
        if (x >= 50 && x <= 50 + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.changeUsername();
            return;
        }
        
        // データクリアボタン
        if (x >= 180 && x <= 180 + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.showDataClearConfirmation();
            return;
        }
        
        // 操作説明ボタン
        if (x >= 310 && x <= 310 + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.showControlsHelp();
            return;
        }
        
        // 戻るボタン
        const backButtonX = canvas.width - buttonWidth - 50;
        if (x >= backButtonX && x <= backButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
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
        this.gameEngine.sceneManager.switchScene('stageSelect');
    }
    
    /**
     * 設定画面を開く
     */
    openSettings() {
        this.showingSettings = true;
        
        // クリック領域配列をクリア
        this.volumeSliders = [];
        this.toggleButtons = [];
        this.languageButtons = [];
        this.qualityButtons = [];
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
    
    /**
     * データクリア確認画面を表示
     */
    showDataClearConfirmation() {
        this.showingSettings = false;
        this.showingDataClearConfirmation = true;
    }
    
    /**
     * データクリア確認画面を描画
     */
    renderDataClearConfirmation(context) {
        const canvas = this.gameEngine.canvas;
        
        // 半透明オーバーレイ
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 警告アイコン
        context.fillStyle = '#FF6666';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('⚠️', canvas.width / 2, 150);
        
        // タイトル
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 28px Arial';
        context.fillText('データクリア確認', canvas.width / 2, 200);
        
        // 警告メッセージ
        context.font = '18px Arial';
        context.fillStyle = '#FFCCCC';
        context.fillText('すべてのデータが削除されます。', canvas.width / 2, 250);
        context.fillText('この操作は取り消せません。', canvas.width / 2, 280);
        
        // 削除されるデータの詳細
        context.font = '16px Arial';
        context.fillStyle = '#CCCCCC';
        context.textAlign = 'left';
        const detailX = 200;
        let detailY = 320;
        const lineHeight = 25;
        
        context.fillText('• ユーザー名', detailX, detailY);
        detailY += lineHeight;
        context.fillText('• 所持AP・TAP', detailX, detailY);
        detailY += lineHeight;
        context.fillText('• ハイスコア記録', detailX, detailY);
        detailY += lineHeight;
        context.fillText('• 開放済みステージ', detailX, detailY);
        detailY += lineHeight;
        context.fillText('• 所持アイテム', detailX, detailY);
        
        // ボタン
        const buttonWidth = 120;
        const buttonHeight = 45;
        const buttonY = 450;
        
        // 削除実行ボタン
        const deleteButtonX = canvas.width / 2 - buttonWidth - 15;
        context.fillStyle = '#CC0000';
        context.fillRect(deleteButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(deleteButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('削除実行', deleteButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // キャンセルボタン
        const cancelButtonX = canvas.width / 2 + 15;
        context.fillStyle = '#666666';
        context.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
        
        context.fillStyle = '#FFFFFF';
        context.fillText('キャンセル', cancelButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // 操作説明
        context.fillStyle = '#AAAAAA';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('ESCでキャンセル', canvas.width / 2, canvas.height - 40);
        
        context.restore();
    }
    
    /**
     * 操作説明画面を表示
     */
    showControlsHelp() {
        this.showingSettings = false;
        this.showingControlsHelp = true;
    }
    
    /**
     * 操作説明画面を描画
     */
    renderControlsHelp(context) {
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
        context.fillText('操作説明', canvas.width / 2, 80);
        
        // 操作説明内容
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const leftX = 100;
        const rightX = 450;
        let leftY = 130;
        let rightY = 130;
        const lineHeight = 30;
        
        // 左列：基本操作
        context.fillStyle = '#FFFF99';
        context.font = 'bold 20px Arial';
        context.fillText('基本操作', leftX, leftY);
        leftY += 35;
        
        context.fillStyle = '#CCCCCC';
        context.font = '16px Arial';
        context.fillText('• クリック/タップ: 泡を割る', leftX, leftY);
        leftY += lineHeight;
        context.fillText('• ドラッグ: 泡を吹き飛ばす', leftX, leftY);
        leftY += lineHeight;
        context.fillText('• ↑↓キー: メニュー選択', leftX, leftY);
        leftY += lineHeight;
        context.fillText('• Enter: 決定', leftX, leftY);
        leftY += lineHeight;
        context.fillText('• ESC: 戻る/終了', leftX, leftY);
        leftY += lineHeight;
        context.fillText('• S: ショップ（ステージ選択時）', leftX, leftY);
        
        // 右列：ゲームのコツ
        context.fillStyle = '#99FFFF';
        context.font = 'bold 20px Arial';
        context.fillText('ゲームのコツ', rightX, rightY);
        rightY += 35;
        
        context.fillStyle = '#CCCCCC';
        context.font = '16px Arial';
        context.fillText('• 泡は時間が経つと危険になる', rightX, rightY);
        rightY += lineHeight;
        context.fillText('• 連続で割るとコンボボーナス', rightX, rightY);
        rightY += lineHeight;
        context.fillText('• ピンクの泡でHP回復', rightX, rightY);
        rightY += lineHeight;
        context.fillText('• 毒の泡は避けよう', rightX, rightY);
        rightY += lineHeight;
        context.fillText('• 硬い泡は複数回クリック', rightX, rightY);
        rightY += lineHeight;
        context.fillText('• 特殊泡は画面外に逃がせる', rightX, rightY);
        
        // 泡の種類説明
        context.fillStyle = '#FFCC99';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.fillText('泡の種類', canvas.width / 2, 380);
        
        context.font = '14px Arial';
        context.textAlign = 'left';
        const bubbleInfoY = 410;
        const bubbleLineHeight = 20;
        
        context.fillStyle = '#CCCCCC';
        context.fillText('普通(青) 石(灰) 鉄(茶) ダイヤ(白) ピンク(回復) 毒(緑) とげとげ(連鎖) 虹色(ボーナス) 時計(時停) S字(得点) ビリビリ(妨害) 逃げる(移動)', leftX, bubbleInfoY);
        
        // 戻るボタン
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = canvas.height - 80;
        
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
        
        context.restore();
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
            this.handleDataClearConfirmationClick(event);
        }
    }
    
    /**
     * データクリア確認画面のクリック処理
     */
    handleDataClearConfirmationClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const buttonWidth = 120;
        const buttonHeight = 45;
        const buttonY = 450;
        
        // 削除実行ボタン
        const deleteButtonX = canvas.width / 2 - buttonWidth - 15;
        if (x >= deleteButtonX && x <= deleteButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.executeDataClear();
            return;
        }
        
        // キャンセルボタン
        const cancelButtonX = canvas.width / 2 + 15;
        if (x >= cancelButtonX && x <= cancelButtonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.cancelDataClear();
            return;
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
            this.handleControlsHelpClick(event);
        }
    }
    
    /**
     * 操作説明画面のクリック処理
     */
    handleControlsHelpClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = canvas.height - 80;
        
        // 戻るボタン
        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            this.closeControlsHelp();
        }
    }
    
    /**
     * データクリアを実行
     */
    executeDataClear() {
        // プレイヤーデータをリセット
        this.gameEngine.playerData.username = '';
        this.gameEngine.playerData.ap = 0;
        this.gameEngine.playerData.tap = 0;
        this.gameEngine.playerData.highScores = {};
        this.gameEngine.playerData.unlockedStages = ['tutorial', 'normal'];
        this.gameEngine.playerData.ownedItems = [];
        
        // ローカルストレージからも削除
        localStorage.removeItem('bubblePop_playerData');
        
        console.log('All player data has been cleared');
        
        // 確認画面を閉じてメインメニューに戻る
        this.showingDataClearConfirmation = false;
        
        // ユーザー名が削除されたので、ユーザー名入力画面を表示
        this.showUsernameInput();
    }
    
    /**
     * データクリアをキャンセル
     */
    cancelDataClear() {
        this.showingDataClearConfirmation = false;
        this.showingSettings = true;
    }
    
    /**
     * 操作説明画面を閉じる
     */
    closeControlsHelp() {
        this.showingControlsHelp = false;
        this.showingSettings = true;
    }
}