import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Settings Renderer
 * 設定画面の描画処理を担当
 */
export class SettingsRenderer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.volumeSliders = [];
        this.toggleButtons = [];
        this.languageButtons = [];
        this.qualityButtons = [];
    }
    
    /**
     * 設定画面を描画
     */
    renderSettings(context) {
        try {
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
            
            // UI要素配列をクリア
            this.clearUIElements();
            
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderSettings'
            });
        }
    }
    
    /**
     * UI要素配列をクリア
     */
    clearUIElements() {
        this.volumeSliders = [];
        this.toggleButtons = [];
        this.languageButtons = [];
        this.qualityButtons = [];
    }
    
    /**
     * 音響設定を描画
     */
    renderAudioSettings(context, t) {
        try {
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderAudioSettings'
            });
        }
    }
    
    /**
     * 言語設定を描画
     */
    renderLanguageSettings(context, t) {
        try {
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderLanguageSettings'
            });
        }
    }
    
    /**
     * 品質設定を描画
     */
    renderQualitySettings(context, t) {
        try {
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderQualitySettings'
            });
        }
    }
    
    /**
     * アクセシビリティ設定を描画
     */
    renderAccessibilitySettings(context, t) {
        try {
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderAccessibilitySettings'
            });
        }
    }
    
    /**
     * 設定アクションボタンを描画
     */
    renderSettingsActions(context, t) {
        try {
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderSettingsActions'
            });
        }
    }
    
    /**
     * 音量スライダーを描画
     */
    renderVolumeSlider(context, x, y, width, height, label, value, settingKey) {
        try {
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
            this.volumeSliders.push({
                x, y, width, height, settingKey, value
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderVolumeSlider'
            });
        }
    }
    
    /**
     * トグルボタンを描画
     */
    renderToggleButton(context, x, y, width, height, label, isEnabled, settingKey) {
        try {
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
            this.toggleButtons.push({
                x, y, width, height, settingKey, isEnabled
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderToggleButton'
            });
        }
    }
    
    /**
     * 言語ボタンを描画
     */
    renderLanguageButton(context, x, y, width, height, label, langCode, isSelected) {
        try {
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
            this.languageButtons.push({
                x, y, width, height, langCode, isSelected
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderLanguageButton'
            });
        }
    }
    
    /**
     * 品質ボタンを描画
     */
    renderQualityButton(context, x, y, width, height, label, qualityCode, isSelected) {
        try {
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
            this.qualityButtons.push({
                x, y, width, height, qualityCode, isSelected
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderQualityButton'
            });
        }
    }
    
    /**
     * 設定ボタンを描画
     */
    renderSettingsButton(context, x, y, width, height, text, color) {
        try {
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
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'SettingsRenderer.renderSettingsButton'
            });
        }
    }
    
    /**
     * クリック領域データを取得
     */
    getClickableElements() {
        return {
            volumeSliders: this.volumeSliders,
            toggleButtons: this.toggleButtons,
            languageButtons: this.languageButtons,
            qualityButtons: this.qualityButtons
        };
    }
}