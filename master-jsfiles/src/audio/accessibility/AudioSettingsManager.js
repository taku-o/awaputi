/**
 * Audio Settings Manager
 * 
 * アクセシビリティ設定・永続化機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Settings loading and persistence
 * - Configuration change monitoring
 * - High contrast mode support
 * - Large fonts accessibility feature
 * - Real-time settings application
 * 
 * @module AudioSettingsManager
 * Created: Phase G.2 (Issue #103)
 */

export class AudioSettingsManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.configManager = mainController.configManager;
        
        // アクセシビリティ設定
        this.settings = {
            visualFeedback: false,
            captioning: false,
            colorIndication: false,
            patternRecognition: false,
            highContrast: false,
            largeFonts: false,
            reduceMotion: false,
            hapticFeedback: false, // 触覚フィードバック設定
            vibrationIntensity: 0.8 // 振動強度
        };
    }

    /**
     * 設定を読み込み
     */
    loadSettings() {
        Object.keys(this.settings).forEach(key => {
            const value = this.configManager.get(`audio.accessibility.${key}`);
            if (value !== undefined) {
                this.settings[key] = value;
            }
        });
        
        this.applySettings();
    }

    /**
     * 設定を適用
     */
    applySettings() {
        // 視覚的フィードバック
        if (this.settings.visualFeedback) {
            this.mainController.audioDescriptionManager.notificationContainer.style.display = 'block';
            this.mainController.audioFeedbackManager.updateColorIndicatorVisibility(this.settings.colorIndication);
        } else {
            this.mainController.audioDescriptionManager.notificationContainer.style.display = 'none';
            this.mainController.audioFeedbackManager.updateColorIndicatorVisibility(false);
        }
        
        // 字幕
        if (this.settings.captioning) {
            // 字幕機能は個別に表示制御
        }
        
        // 高コントラスト
        if (this.settings.highContrast) {
            this.applyHighContrastMode();
        }
        
        // 大きなフォント
        if (this.settings.largeFonts) {
            this.applyLargeFonts();
        }
        
        // パターン認識
        this.mainController.audioCueManager.patternRecognition.enabled = this.settings.patternRecognition;
        
        // 触覚フィードバック設定
        if (this.mainController.audioFeedbackManager) {
            this.mainController.audioFeedbackManager.hapticSettings.enabled = this.settings.hapticFeedback;
            this.mainController.audioFeedbackManager.hapticSettings.vibrationIntensity = this.settings.vibrationIntensity;
        }
    }

    /**
     * 高コントラストモードを適用
     */
    applyHighContrastMode() {
        const style = document.createElement('style');
        style.id = 'audio-accessibility-high-contrast';
        style.textContent = `
            .audio-accessibility-notifications .notification {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 2px solid #ffffff !important;
            }
            .audio-accessibility-captions {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 2px solid #ffffff !important;
            }
        `;
        
        // 既存のスタイルを削除してから追加
        const existingStyle = document.getElementById('audio-accessibility-high-contrast');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        if (this.settings.highContrast) {
            document.head.appendChild(style);
        }
    }

    /**
     * 大きなフォントを適用
     */
    applyLargeFonts() {
        const style = document.createElement('style');
        style.id = 'audio-accessibility-large-fonts';
        style.textContent = `
            .audio-accessibility-notifications .notification {
                font-size: 18px !important;
            }
            .audio-accessibility-captions {
                font-size: 22px !important;
            }
        `;
        
        // 既存のスタイルを削除してから追加
        const existingStyle = document.getElementById('audio-accessibility-large-fonts');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        if (this.settings.largeFonts) {
            document.head.appendChild(style);
        }
    }

    /**
     * 設定変更を監視
     */
    setupConfigWatchers() {
        Object.keys(this.settings).forEach(key => {
            this.configManager.watch('audio', `accessibility.${key}`, (newValue) => {
                this.settings[key] = newValue;
                this.applySettings();
            });
        });
        
        // 触覚フィードバック設定の監視
        this.configManager.watch('audio', 'accessibility.hapticFeedback', (newValue) => {
            this.settings.hapticFeedback = newValue;
            if (this.mainController.audioFeedbackManager) {
                this.mainController.audioFeedbackManager.hapticSettings.enabled = newValue;
                this.mainController.audioFeedbackManager.updateVibrationManagerSettings();
            }
        });
        
        this.configManager.watch('audio', 'accessibility.vibrationIntensity', (newValue) => {
            this.settings.vibrationIntensity = newValue;
            if (this.mainController.audioFeedbackManager) {
                this.mainController.audioFeedbackManager.hapticSettings.vibrationIntensity = newValue;
                this.mainController.audioFeedbackManager.updateVibrationManagerSettings();
            }
        });
    }

    /**
     * 設定値を更新
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     */
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.configManager.set(`audio.accessibility.${key}`, value);
            this.applySettings();
            
            console.log(`Audio accessibility setting updated: ${key} = ${value}`);
        }
    }

    /**
     * 設定値を取得
     * @param {string} key - 設定キー
     * @returns {*} 設定値
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * 全設定を取得
     * @returns {Object} 全設定
     */
    getAllSettings() {
        return { ...this.settings };
    }

    /**
     * 設定をリセット
     */
    resetSettings() {
        const defaultSettings = {
            visualFeedback: false,
            captioning: false,
            colorIndication: false,
            patternRecognition: false,
            highContrast: false,
            largeFonts: false,
            reduceMotion: false,
            hapticFeedback: false,
            vibrationIntensity: 0.8
        };
        
        Object.assign(this.settings, defaultSettings);
        
        // 設定を永続化
        Object.keys(this.settings).forEach(key => {
            this.configManager.set(`audio.accessibility.${key}`, this.settings[key]);
        });
        
        this.applySettings();
        console.log('Audio accessibility settings reset to defaults');
    }

    /**
     * 設定をエクスポート
     * @returns {Object} エクスポート用設定データ
     */
    exportSettings() {
        return {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            settings: { ...this.settings }
        };
    }

    /**
     * 設定をインポート
     * @param {Object} settingsData - インポートする設定データ
     * @returns {boolean} インポート成功かどうか
     */
    importSettings(settingsData) {
        try {
            if (!settingsData.settings) {
                throw new Error('Invalid settings data structure');
            }
            
            // 有効な設定のみをインポート
            Object.keys(settingsData.settings).forEach(key => {
                if (key in this.settings) {
                    this.settings[key] = settingsData.settings[key];
                    this.configManager.set(`audio.accessibility.${key}`, this.settings[key]);
                }
            });
            
            this.applySettings();
            console.log('Audio accessibility settings imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    /**
     * 設定の検証
     * @param {Object} settings - 検証する設定
     * @returns {Object} 検証結果
     */
    validateSettings(settings) {
        const errors = [];
        const warnings = [];
        
        Object.keys(settings).forEach(key => {
            if (!(key in this.settings)) {
                warnings.push(`Unknown setting: ${key}`);
                return;
            }
            
            const value = settings[key];
            
            // 型チェック
            switch (key) {
                case 'vibrationIntensity':
                    if (typeof value !== 'number' || value < 0 || value > 1) {
                        errors.push(`${key} must be a number between 0 and 1`);
                    }
                    break;
                default:
                    if (typeof value !== 'boolean') {
                        errors.push(`${key} must be a boolean value`);
                    }
                    break;
            }
        });
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * リソースの解放
     */
    dispose() {
        // スタイルシートを削除
        const highContrastStyle = document.getElementById('audio-accessibility-high-contrast');
        if (highContrastStyle) {
            highContrastStyle.remove();
        }
        
        const largeFontsStyle = document.getElementById('audio-accessibility-large-fonts');
        if (largeFontsStyle) {
            largeFontsStyle.remove();
        }
        
        console.log('AudioSettingsManager disposed');
    }
}