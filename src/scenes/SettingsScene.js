import { Scene } from '../core/Scene.js';

/**
 * 設定画面シーン
 * ソーシャル共有設定、プライバシー設定、通知設定を管理
 */
export class SettingsScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // 設定カテゴリと現在選択中のカテゴリ
        this.categories = ['general', 'social', 'privacy', 'notifications', 'accessibility'];
        this.categoryLabels = ['一般', 'ソーシャル', 'プライバシー', '通知', 'アクセシビリティ'];
        this.currentCategory = 'social';
        this.selectedCategoryIndex = 1; // ソーシャルから開始
        
        // 現在選択中の設定項目
        this.selectedSettingIndex = 0;
        
        // 設定項目の定義
        this.settingItems = this.initializeSettingItems();
        
        // UI状態
        this.isEditingValue = false;
        this.tempValue = null;
        this.showingConfirmDialog = false;
        this.confirmDialogData = null;
        
        // レイアウト設定
        this.layout = {
            categoryWidth: 200,
            settingsPadding: 20,
            itemHeight: 60,
            titleHeight: 40
        };
    }
    
    /**
     * 設定項目の初期化
     */
    initializeSettingItems() {
        return {
            general: [
                { key: 'ui.language', label: '言語', type: 'select', options: [
                    { value: 'ja', label: '日本語' },
                    { value: 'en', label: 'English' }
                ]},
                { key: 'ui.quality', label: '画質', type: 'select', options: [
                    { value: 'low', label: '低' },
                    { value: 'medium', label: '中' },
                    { value: 'high', label: '高' },
                    { value: 'auto', label: '自動' }
                ]},
                { key: 'audio.masterVolume', label: 'マスター音量', type: 'slider', min: 0, max: 1, step: 0.1 },
                { key: 'audio.sfxVolume', label: '効果音音量', type: 'slider', min: 0, max: 1, step: 0.1 },
                { key: 'audio.bgmVolume', label: 'BGM音量', type: 'slider', min: 0, max: 1, step: 0.1 }
            ],
            social: [
                { key: 'social.enableSharing', label: 'ソーシャル共有を有効化', type: 'toggle', description: 'スコアや実績の共有機能を有効にします' },
                { key: 'social.autoPromptHighScore', label: 'ハイスコア時の自動プロンプト', type: 'toggle', description: 'ハイスコアを達成した時に自動的に共有画面を表示します' },
                { key: 'social.autoPromptAchievements', label: '実績解除時の自動プロンプト', type: 'toggle', description: '実績を解除した時に自動的に共有画面を表示します' },
                { key: 'social.defaultPlatform', label: 'デフォルト共有先', type: 'select', options: [
                    { value: 'auto', label: '自動選択' },
                    { value: 'twitter', label: 'Twitter/X' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'native', label: 'システム標準' }
                ]},
                { key: 'social.includeScreenshot', label: 'スクリーンショットを含む', type: 'toggle', description: '共有時にゲーム画面のスクリーンショットを含めます' },
                { key: 'social.screenshotQuality', label: 'スクリーンショット画質', type: 'select', options: [
                    { value: 'low', label: '低（軽量）' },
                    { value: 'medium', label: '中（標準）' },
                    { value: 'high', label: '高（高品質）' }
                ]},
                { key: 'social.showWatermark', label: 'ウォーターマークを表示', type: 'toggle', description: 'スクリーンショットにゲーム名を表示します' },
                { key: 'social.customMessage', label: 'カスタムメッセージ', type: 'text', description: '共有時のデフォルトメッセージをカスタマイズできます' }
            ],
            privacy: [
                { key: 'social.privacyLevel', label: '共有レベル', type: 'select', options: [
                    { value: 'public', label: '公開（すべてのユーザー）' },
                    { value: 'friends', label: 'フレンドのみ' },
                    { value: 'private', label: 'プライベート（共有しない）' }
                ], description: 'どの範囲まで情報を共有するかを設定します' },
                { key: 'privacy.dataCollection', label: 'データ収集を許可', type: 'toggle', description: 'ゲーム改善のための匿名データ収集を許可します' },
                { key: 'privacy.analytics', label: '使用状況分析を許可', type: 'toggle', description: 'プレイ統計の分析を許可します' },
                { key: 'privacy.crashReports', label: 'クラッシュレポートの送信', type: 'toggle', description: 'エラー発生時の情報を開発者に送信します' }
            ],
            notifications: [
                { key: 'notifications.challenges.enabled', label: 'チャレンジ通知', type: 'toggle', description: 'チャレンジ関連の通知を受け取ります' },
                { key: 'notifications.challenges.newChallenge', label: '新しいチャレンジ', type: 'toggle', description: '新しいチャレンジが追加された時に通知します' },
                { key: 'notifications.challenges.challengeComplete', label: 'チャレンジ完了', type: 'toggle', description: 'チャレンジを完了した時に通知します' },
                { key: 'notifications.challenges.dailyReminder', label: 'デイリーリマインダー', type: 'toggle', description: '毎日決まった時間にチャレンジを促します' },
                { key: 'notifications.achievements.enabled', label: '実績通知', type: 'toggle', description: '実績関連の通知を受け取ります' },
                { key: 'notifications.achievements.unlocked', label: '実績解除通知', type: 'toggle', description: '実績を解除した時に通知します' },
                { key: 'notifications.achievements.progress', label: '進捗通知', type: 'toggle', description: '実績の進捗状況を定期的に通知します' },
                { key: 'notifications.leaderboard.enabled', label: 'ランキング通知', type: 'toggle', description: 'ランキング関連の通知を受け取ります' },
                { key: 'notifications.leaderboard.newRecord', label: '新記録通知', type: 'toggle', description: '自己ベストを更新した時に通知します' }
            ],
            accessibility: [
                { key: 'accessibility.highContrast', label: 'ハイコントラスト', type: 'toggle', description: 'より見やすい高コントラスト表示にします' },
                { key: 'accessibility.reducedMotion', label: 'アニメーション削減', type: 'toggle', description: 'アニメーションや動きを削減します' },
                { key: 'accessibility.largeText', label: '大きな文字', type: 'toggle', description: 'UI の文字サイズを大きくします' },
                { key: 'accessibility.screenReader', label: 'スクリーンリーダー対応', type: 'toggle', description: 'スクリーンリーダーでの読み上げに対応します' },
                { key: 'accessibility.colorBlindSupport', label: '色覚サポート', type: 'toggle', description: '色覚に配慮した表示にします' }
            ]
        };
    }
    
    /**
     * シーン開始時の処理
     */
    enter() {
        this.currentCategory = 'social';
        this.selectedCategoryIndex = 1;
        this.selectedSettingIndex = 0;
        this.isEditingValue = false;
        this.showingConfirmDialog = false;
        console.log('[SettingsScene] 設定画面に入りました');
    }
    
    /**
     * シーン終了時の処理
     */
    exit() {
        // 変更を保存
        this.saveSettings();
        console.log('[SettingsScene] 設定画面を終了します');
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 必要に応じて動的な処理を追加
    }
    
    /**
     * 描画処理
     */
    render(context) {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // 背景
        context.fillStyle = '#f8f9fa';
        context.fillRect(0, 0, width, height);
        
        // タイトル
        this.renderTitle(context, width);
        
        // カテゴリ一覧（左側）
        this.renderCategories(context, height);
        
        // 設定項目（右側）
        this.renderSettings(context, width, height);
        
        // 確認ダイアログ
        if (this.showingConfirmDialog) {
            this.renderConfirmDialog(context, width, height);
        }
        
        // 操作説明
        this.renderHelp(context, width, height);
    }
    
    /**
     * タイトル描画
     */
    renderTitle(context, width) {
        // Transform行列のスケールを考慮した中央位置
        const transform = context.getTransform();
        const centerX = (width / 2) / transform.a;
        
        context.fillStyle = '#2c3e50';
        context.font = 'bold 24px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('設定', centerX, 40);
        
        // 区切り線
        context.strokeStyle = '#bdc3c7';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(50, 60);
        context.lineTo(width - 50, 60);
        context.stroke();
    }
    
    /**
     * カテゴリ一覧描画
     */
    renderCategories(context, height) {
        const startY = 80;
        const categoryHeight = 50;
        
        for (let i = 0; i < this.categories.length; i++) {
            const y = startY + i * categoryHeight;
            const isSelected = i === this.selectedCategoryIndex;
            
            // 背景
            if (isSelected) {
                context.fillStyle = '#3498db';
            } else {
                context.fillStyle = '#ecf0f1';
            }
            
            context.fillRect(10, y, this.layout.categoryWidth, categoryHeight - 5);
            
            // テキスト
            context.fillStyle = isSelected ? '#ffffff' : '#2c3e50';
            context.font = '16px Arial, sans-serif';
            context.textAlign = 'left';
            context.fillText(this.categoryLabels[i], 20, y + categoryHeight / 2 + 5);
        }
    }
    
    /**
     * 設定項目描画
     */
    renderSettings(context, width, height) {
        const startX = this.layout.categoryWidth + 30;
        const startY = 80;
        const settingsWidth = width - startX - 20;
        const currentItems = this.settingItems[this.currentCategory] || [];
        
        // カテゴリタイトル
        context.fillStyle = '#2c3e50';
        context.font = 'bold 20px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(this.categoryLabels[this.selectedCategoryIndex], startX, startY + 25);
        
        // 設定項目
        const itemStartY = startY + 50;
        for (let i = 0; i < currentItems.length; i++) {
            const item = currentItems[i];
            const y = itemStartY + i * this.layout.itemHeight;
            const isSelected = i === this.selectedSettingIndex && !this.showingConfirmDialog;
            
            this.renderSettingItem(context, item, startX, y, settingsWidth, isSelected);
        }
    }
    
    /**
     * 個別設定項目描画
     */
    renderSettingItem(context, item, x, y, width, isSelected) {
        const itemHeight = this.layout.itemHeight - 10;
        
        // 背景
        if (isSelected) {
            context.fillStyle = '#e8f4fd';
            context.fillRect(x, y, width, itemHeight);
        }
        
        // ラベル
        context.fillStyle = '#2c3e50';
        context.font = '16px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(item.label, x + 10, y + 25);
        
        // 説明（ある場合）
        if (item.description) {
            context.fillStyle = '#7f8c8d';
            context.font = '12px Arial, sans-serif';
            context.fillText(item.description, x + 10, y + 42);
        }
        
        // 現在の値を取得
        const currentValue = this.gameEngine.settingsManager.get(item.key);
        
        // 値の表示
        this.renderSettingValue(context, item, currentValue, x + width - 200, y, 180, isSelected);
    }
    
    /**
     * 設定値の描画
     */
    renderSettingValue(context, item, value, x, y, width, isSelected) {
        const height = 30;
        const centerY = y + 20;
        
        switch (item.type) {
            case 'toggle':
                this.renderToggle(context, value, x + width - 60, centerY, isSelected);
                break;
                
            case 'select':
                this.renderSelect(context, item, value, x, centerY, width, isSelected);
                break;
                
            case 'slider':
                this.renderSlider(context, item, value, x, centerY, width, isSelected);
                break;
                
            case 'text':
                this.renderTextInput(context, value, x, centerY, width, isSelected);
                break;
        }
    }
    
    /**
     * トグルスイッチ描画
     */
    renderToggle(context, value, x, y, isSelected) {
        const width = 50;
        const height = 24;
        const toggleX = x - width / 2;
        const toggleY = y - height / 2;
        
        // 背景
        context.fillStyle = value ? '#2ecc71' : '#bdc3c7';
        context.fillRect(toggleX, toggleY, width, height);
        
        // つまみ
        const knobX = value ? toggleX + width - 22 : toggleX + 2;
        context.fillStyle = '#ffffff';
        context.fillRect(knobX, toggleY + 2, 20, height - 4);
        
        // 選択時の枠線
        if (isSelected) {
            context.strokeStyle = '#3498db';
            context.lineWidth = 2;
            context.strokeRect(toggleX - 2, toggleY - 2, width + 4, height + 4);
        }
    }
    
    /**
     * セレクトボックス描画
     */
    renderSelect(context, item, value, x, y, width, isSelected) {
        const height = 30;
        const selectY = y - height / 2;
        
        // 背景
        context.fillStyle = '#ffffff';
        context.fillRect(x, selectY, width, height);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, selectY, width, height);
        
        // 現在の値のラベル
        const selectedOption = item.options.find(opt => opt.value === value);
        const displayText = selectedOption ? selectedOption.label : value;
        
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        context.fillText(displayText, x + 10, y + 5);
        
        // ドロップダウン矢印
        context.fillStyle = '#7f8c8d';
        context.fillText('▼', x + width - 20, y + 5);
    }
    
    /**
     * スライダー描画
     */
    renderSlider(context, item, value, x, y, width, isSelected) {
        const sliderWidth = width - 60;
        const sliderHeight = 6;
        const sliderY = y - sliderHeight / 2;
        
        // スライダーの背景
        context.fillStyle = '#bdc3c7';
        context.fillRect(x, sliderY, sliderWidth, sliderHeight);
        
        // スライダーの進行部分
        const progress = (value - (item.min || 0)) / ((item.max || 1) - (item.min || 0));
        context.fillStyle = '#3498db';
        context.fillRect(x, sliderY, sliderWidth * progress, sliderHeight);
        
        // つまみ
        const knobX = x + sliderWidth * progress - 8;
        const knobY = y - 8;
        context.fillStyle = isSelected ? '#2980b9' : '#3498db';
        context.fillRect(knobX, knobY, 16, 16);
        
        // 値の表示
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'right';
        context.fillText(Math.round(value * 100) / 100, x + width, y + 5);
    }
    
    /**
     * テキスト入力描画
     */
    renderTextInput(context, value, x, y, width, isSelected) {
        const height = 30;
        const inputY = y - height / 2;
        
        // 背景
        context.fillStyle = '#ffffff';
        context.fillRect(x, inputY, width, height);
        
        // 枠線
        context.strokeStyle = isSelected ? '#3498db' : '#bdc3c7';
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(x, inputY, width, height);
        
        // テキスト
        context.fillStyle = '#2c3e50';
        context.font = '14px Arial, sans-serif';
        context.textAlign = 'left';
        
        const displayText = this.isEditingValue ? (this.tempValue || '') : (value || '未設定');
        const maxWidth = width - 20;
        
        // テキストが長すぎる場合は省略
        let truncatedText = displayText;
        if (context.measureText(displayText).width > maxWidth) {
            truncatedText = displayText.substring(0, 20) + '...';
        }
        
        context.fillText(truncatedText, x + 10, y + 5);
        
        // 編集中のカーソル
        if (isSelected && this.isEditingValue) {
            const textWidth = context.measureText(this.tempValue || '').width;
            context.strokeStyle = '#2c3e50';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(x + 10 + textWidth, y - 10);
            context.lineTo(x + 10 + textWidth, y + 10);
            context.stroke();
        }
    }
    
    /**
     * 確認ダイアログ描画
     */
    renderConfirmDialog(context, width, height) {
        // オーバーレイ
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, width, height);
        
        // ダイアログ
        const dialogWidth = 400;
        const dialogHeight = 200;
        const dialogX = (width - dialogWidth) / 2;
        const dialogY = (height - dialogHeight) / 2;
        
        context.fillStyle = '#ffffff';
        context.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        context.strokeStyle = '#bdc3c7';
        context.lineWidth = 1;
        context.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // メッセージ
        context.fillStyle = '#2c3e50';
        context.font = '16px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText(
            this.confirmDialogData?.message || '設定を変更しますか？',
            dialogX + dialogWidth / 2,
            dialogY + 80
        );
        
        // ボタン
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonY = dialogY + dialogHeight - 60;
        
        // キャンセルボタン
        context.fillStyle = '#95a5a6';
        context.fillRect(dialogX + 80, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.fillText('キャンセル', dialogX + 80 + buttonWidth / 2, buttonY + 22);
        
        // OKボタン
        context.fillStyle = '#3498db';
        context.fillRect(dialogX + dialogWidth - 160, buttonY, buttonWidth, buttonHeight);
        context.fillStyle = '#ffffff';
        context.fillText('OK', dialogX + dialogWidth - 160 + buttonWidth / 2, buttonY + 22);
    }
    
    /**
     * 操作説明描画
     */
    renderHelp(context, width, height) {
        const helpY = height - 40;
        
        context.fillStyle = '#7f8c8d';
        context.font = '12px Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText(
            '↑↓: 項目選択  ←→: カテゴリ切り替え  Enter: 設定変更  Esc: 戻る',
            width / 2,
            helpY
        );
    }
    
    /**
     * 入力処理
     */
    handleInput(event) {
        if (event.type === 'keydown') {
            this.handleKeyInput(event);
        } else if (event.type === 'click' || event.type === 'touchstart') {
            this.handleMouseInput(event);
        }
    }
    
    /**
     * キーボード入力処理
     */
    handleKeyInput(event) {
        if (this.showingConfirmDialog) {
            this.handleConfirmDialogInput(event);
            return;
        }
        
        if (this.isEditingValue) {
            this.handleEditingInput(event);
            return;
        }
        
        switch (event.key) {
            case 'ArrowUp':
                this.selectedSettingIndex = Math.max(0, this.selectedSettingIndex - 1);
                break;
                
            case 'ArrowDown':
                const maxIndex = (this.settingItems[this.currentCategory] || []).length - 1;
                this.selectedSettingIndex = Math.min(maxIndex, this.selectedSettingIndex + 1);
                break;
                
            case 'ArrowLeft':
                this.selectedCategoryIndex = Math.max(0, this.selectedCategoryIndex - 1);
                this.switchCategory();
                break;
                
            case 'ArrowRight':
                this.selectedCategoryIndex = Math.min(this.categories.length - 1, this.selectedCategoryIndex + 1);
                this.switchCategory();
                break;
                
            case 'Enter':
                this.activateCurrentSetting();
                break;
                
            case 'Escape':
                this.goBack();
                break;
        }
    }
    
    /**
     * マウス入力処理
     */
    handleMouseInput(event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // カテゴリクリック判定
        if (x < this.layout.categoryWidth + 10) {
            const categoryIndex = Math.floor((y - 80) / 50);
            if (categoryIndex >= 0 && categoryIndex < this.categories.length) {
                this.selectedCategoryIndex = categoryIndex;
                this.switchCategory();
            }
        }
        
        // 設定項目クリック判定
        else if (x > this.layout.categoryWidth + 30) {
            const itemStartY = 130;
            const itemIndex = Math.floor((y - itemStartY) / this.layout.itemHeight);
            const maxIndex = (this.settingItems[this.currentCategory] || []).length - 1;
            
            if (itemIndex >= 0 && itemIndex <= maxIndex) {
                this.selectedSettingIndex = itemIndex;
                this.activateCurrentSetting();
            }
        }
    }
    
    /**
     * カテゴリ切り替え
     */
    switchCategory() {
        this.currentCategory = this.categories[this.selectedCategoryIndex];
        this.selectedSettingIndex = 0;
    }
    
    /**
     * 現在の設定項目を有効化
     */
    activateCurrentSetting() {
        const currentItems = this.settingItems[this.currentCategory] || [];
        const item = currentItems[this.selectedSettingIndex];
        
        if (!item) return;
        
        const currentValue = this.gameEngine.settingsManager.get(item.key);
        
        switch (item.type) {
            case 'toggle':
                this.gameEngine.settingsManager.set(item.key, !currentValue);
                break;
                
            case 'select':
                this.cycleSelectValue(item, currentValue);
                break;
                
            case 'slider':
                this.adjustSliderValue(item, currentValue);
                break;
                
            case 'text':
                this.startTextEditing(currentValue);
                break;
        }
    }
    
    /**
     * セレクト値のサイクル
     */
    cycleSelectValue(item, currentValue) {
        const currentIndex = item.options.findIndex(opt => opt.value === currentValue);
        const nextIndex = (currentIndex + 1) % item.options.length;
        const newValue = item.options[nextIndex].value;
        
        this.gameEngine.settingsManager.set(item.key, newValue);
    }
    
    /**
     * スライダー値の調整
     */
    adjustSliderValue(item, currentValue) {
        const step = item.step || 0.1;
        const min = item.min || 0;
        const max = item.max || 1;
        const newValue = Math.min(max, currentValue + step);
        
        this.gameEngine.settingsManager.set(item.key, newValue);
    }
    
    /**
     * テキスト編集開始
     */
    startTextEditing(currentValue) {
        this.isEditingValue = true;
        this.tempValue = currentValue || '';
    }
    
    /**
     * 編集中の入力処理
     */
    handleEditingInput(event) {
        switch (event.key) {
            case 'Enter':
                this.finishTextEditing();
                break;
                
            case 'Escape':
                this.cancelTextEditing();
                break;
                
            case 'Backspace':
                this.tempValue = this.tempValue.slice(0, -1);
                break;
                
            default:
                if (event.key.length === 1) {
                    this.tempValue += event.key;
                }
                break;
        }
    }
    
    /**
     * テキスト編集完了
     */
    finishTextEditing() {
        const currentItems = this.settingItems[this.currentCategory] || [];
        const item = currentItems[this.selectedSettingIndex];
        
        if (item) {
            this.gameEngine.settingsManager.set(item.key, this.tempValue);
        }
        
        this.isEditingValue = false;
        this.tempValue = null;
    }
    
    /**
     * テキスト編集キャンセル
     */
    cancelTextEditing() {
        this.isEditingValue = false;
        this.tempValue = null;
    }
    
    /**
     * 確認ダイアログ入力処理
     */
    handleConfirmDialogInput(event) {
        switch (event.key) {
            case 'Enter':
                this.confirmDialogData?.onConfirm?.();
                this.closeConfirmDialog();
                break;
                
            case 'Escape':
                this.confirmDialogData?.onCancel?.();
                this.closeConfirmDialog();
                break;
        }
    }
    
    /**
     * 確認ダイアログを閉じる
     */
    closeConfirmDialog() {
        this.showingConfirmDialog = false;
        this.confirmDialogData = null;
    }
    
    /**
     * 設定保存
     */
    saveSettings() {
        try {
            this.gameEngine.settingsManager.save();
            console.log('[SettingsScene] 設定を保存しました');
        } catch (error) {
            console.error('[SettingsScene] 設定保存エラー:', error);
        }
    }
    
    /**
     * 戻る処理
     */
    goBack() {
        if (this.isEditingValue) {
            this.cancelTextEditing();
        } else if (this.showingConfirmDialog) {
            this.closeConfirmDialog();
        } else {
            // メインメニューに戻る
            try {
                if (!this.gameEngine.sceneManager) {
                    console.error('SceneManager not available');
                    return;
                }
                const success = this.gameEngine.sceneManager.switchScene('menu');
                if (!success) {
                    console.error('Failed to navigate to main menu, attempting fallback');
                    // フォールバックロジックや用户通知をここに追加可能
                }
            } catch (error) {
                console.error('Error navigating to main menu:', error);
            }
        }
    }
}