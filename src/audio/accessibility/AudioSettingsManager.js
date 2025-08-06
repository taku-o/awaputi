/**
 * Audio Settings Manager Component
 * 
 * アクセシビリティ設定・設定管理を担当
 * AudioAccessibilitySupport のサブコンポーネント
 */

import { getConfigurationManager } from '../../core/ConfigurationManager.js';
import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class AudioSettingsManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // 設定のキー定義
        this.settingsKeys = {
            VISUAL_FEEDBACK: 'audioAccessibility.visualFeedback',
            CAPTIONING: 'audioAccessibility.captioning', 
            COLOR_INDICATION: 'audioAccessibility.colorIndication',
            PATTERN_RECOGNITION: 'audioAccessibility.patternRecognition',
            HIGH_CONTRAST: 'audioAccessibility.highContrast',
            LARGE_FONTS: 'audioAccessibility.largeFonts',
            REDUCE_MOTION: 'audioAccessibility.reduceMotion',
            HAPTIC_FEEDBACK: 'audioAccessibility.hapticFeedback',
            VIBRATION_INTENSITY: 'audioAccessibility.vibrationIntensity',
            DESCRIPTION_ENABLED: 'audioAccessibility.descriptionEnabled',
            DESCRIPTION_SPEED: 'audioAccessibility.descriptionSpeed',
            DESCRIPTION_VOLUME: 'audioAccessibility.descriptionVolume',
            DESCRIPTION_DETAIL_LEVEL: 'audioAccessibility.descriptionDetailLevel',
            CUE_SPATIAL_AUDIO: 'audioAccessibility.cueSpatialAudio',
            CUE_FREQUENCY_MAPPING: 'audioAccessibility.cueFrequencyMapping'
        };
        
        // デフォルト設定
        this.defaultSettings = {
            visualFeedback: false,
            captioning: false,
            colorIndication: false,
            patternRecognition: false,
            highContrast: false,
            largeFonts: false,
            reduceMotion: false,
            hapticFeedback: false,
            vibrationIntensity: 0.8,
            descriptionEnabled: false,
            descriptionSpeed: 1.0,
            descriptionVolume: 0.8,
            descriptionDetailLevel: 'normal',
            cueSpatialAudio: false,
            cueFrequencyMapping: true,
            notificationTimeout: 5000,
            captionFontSize: 16,
            captionPosition: 'bottom'
        };
        
        // 現在の設定
        this.currentSettings = { ...this.defaultSettings };
        
        // 設定変更リスナー
        this.changeListeners = new Set();
        
        // 設定の検証ルール
        this.validationRules = new Map();
        this.initializeValidationRules();
        
        // 設定の初期化
        this.initializeSettings();
    }

    /**
     * 設定の初期化
     */
    async initializeSettings() {
        try {
            // 保存済み設定の読み込み
            await this.loadSettings();
            
            // ブラウザのアクセシビリティ設定を検出
            await this.detectBrowserAccessibilitySettings();
            
            // 設定の適用
            this.applySettings();
            
            console.log('Audio accessibility settings initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'AudioSettingsManager.initializeSettings',
                severity: 'medium'
            });
            
            // フォールバック: デフォルト設定を使用
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    /**
     * 検証ルールの初期化
     */
    initializeValidationRules() {
        this.validationRules.set('vibrationIntensity', {
            validate: (value) => typeof value === 'number' && value >= 0 && value <= 1,
            message: 'Vibration intensity must be between 0 and 1'
        });
        
        this.validationRules.set('descriptionSpeed', {
            validate: (value) => typeof value === 'number' && value >= 0.5 && value <= 2.0,
            message: 'Description speed must be between 0.5 and 2.0'
        });
        
        this.validationRules.set('descriptionVolume', {
            validate: (value) => typeof value === 'number' && value >= 0 && value <= 1,
            message: 'Description volume must be between 0 and 1'
        });
        
        this.validationRules.set('descriptionDetailLevel', {
            validate: (value) => ['minimal', 'normal', 'detailed'].includes(value),
            message: 'Description detail level must be minimal, normal, or detailed'
        });
        
        this.validationRules.set('captionFontSize', {
            validate: (value) => typeof value === 'number' && value >= 12 && value <= 32,
            message: 'Caption font size must be between 12 and 32'
        });
        
        this.validationRules.set('captionPosition', {
            validate: (value) => ['top', 'middle', 'bottom'].includes(value),
            message: 'Caption position must be top, middle, or bottom'
        });
        
        this.validationRules.set('notificationTimeout', {
            validate: (value) => typeof value === 'number' && value >= 1000 && value <= 30000,
            message: 'Notification timeout must be between 1000 and 30000 milliseconds'
        });
    }

    /**
     * 設定の読み込み
     */
    async loadSettings() {
        try {
            // ConfigurationManagerから設定を取得
            const savedSettings = {};
            
            for (const [settingName, configKey] of Object.entries(this.settingsKeys)) {
                try {
                    const value = this.configManager.get(configKey);
                    if (value !== undefined) {
                        const camelCaseKey = this.toCamelCase(settingName);
                        savedSettings[camelCaseKey] = value;
                    }
                } catch (error) {
                    // 個別設定の読み込みエラーは警告レベル
                    console.warn(`Failed to load setting ${configKey}:`, error);
                }
            }
            
            // LocalStorageからも読み込み（フォールバック）
            const localSettings = this.loadFromLocalStorage();
            
            // 設定をマージ（ConfigurationManager > LocalStorage > Default）
            this.currentSettings = {
                ...this.defaultSettings,
                ...localSettings,
                ...savedSettings
            };
            
        } catch (error) {
            console.error('Failed to load audio accessibility settings:', error);
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    /**
     * LocalStorageからの設定読み込み
     * @returns {Object} 読み込まれた設定
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('audioAccessibilitySettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load settings from localStorage:', error);
            return {};
        }
    }

    /**
     * ブラウザのアクセシビリティ設定検出
     */
    async detectBrowserAccessibilitySettings() {
        try {
            // prefer-reduced-motion の検出
            if (window.matchMedia) {
                const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                if (reducedMotionQuery.matches) {
                    this.currentSettings.reduceMotion = true;
                }
                
                // リスナーを追加してリアルタイム変更に対応
                reducedMotionQuery.addEventListener('change', (e) => {
                    this.updateSetting('reduceMotion', e.matches);
                });
            }
            
            // prefer-contrast の検出
            if (window.matchMedia) {
                const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
                if (highContrastQuery.matches) {
                    this.currentSettings.highContrast = true;
                }
                
                highContrastQuery.addEventListener('change', (e) => {
                    this.updateSetting('highContrast', e.matches);
                });
            }
            
            // VibrationAPI のサポート検出
            if (!('vibrate' in navigator)) {
                this.currentSettings.hapticFeedback = false;
            }
            
            // SpeechSynthesis のサポート検出
            if (!('speechSynthesis' in window)) {
                this.currentSettings.descriptionEnabled = false;
            }
            
        } catch (error) {
            console.warn('Failed to detect browser accessibility settings:', error);
        }
    }

    /**
     * 設定の保存
     */
    async saveSettings() {
        try {
            // ConfigurationManagerに保存
            for (const [settingName, configKey] of Object.entries(this.settingsKeys)) {
                const camelCaseKey = this.toCamelCase(settingName);
                const value = this.currentSettings[camelCaseKey];
                
                if (value !== undefined) {
                    this.configManager.set(configKey, value);
                }
            }
            
            // LocalStorageにもバックアップ保存
            this.saveToLocalStorage();
            
            console.log('Audio accessibility settings saved');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'AudioSettingsManager.saveSettings',
                severity: 'medium'
            });
        }
    }

    /**
     * LocalStorageへの設定保存
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('audioAccessibilitySettings', JSON.stringify(this.currentSettings));
        } catch (error) {
            console.warn('Failed to save settings to localStorage:', error);
        }
    }

    /**
     * 単一設定の更新
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     * @param {boolean} save - 即座に保存するかどうか
     */
    async updateSetting(key, value, save = true) {
        // 検証の実行
        if (!this.validateSetting(key, value)) {
            throw new Error(`Invalid value for setting ${key}: ${value}`);
        }
        
        const oldValue = this.currentSettings[key];
        this.currentSettings[key] = value;
        
        // 設定の適用
        this.applySingleSetting(key, value);
        
        // 保存
        if (save) {
            await this.saveSettings();
        }
        
        // リスナーに通知
        this.notifySettingChanged(key, value, oldValue);
    }

    /**
     * 複数設定の一括更新
     * @param {Object} settings - 更新する設定オブジェクト
     * @param {boolean} save - 即座に保存するかどうか
     */
    async updateSettings(settings, save = true) {
        const changedSettings = {};
        
        // 各設定を検証・適用
        for (const [key, value] of Object.entries(settings)) {
            if (this.validateSetting(key, value)) {
                const oldValue = this.currentSettings[key];
                this.currentSettings[key] = value;
                changedSettings[key] = { oldValue, newValue: value };
                
                this.applySingleSetting(key, value);
            } else {
                console.warn(`Invalid setting value ignored: ${key} = ${value}`);
            }
        }
        
        // 保存
        if (save && Object.keys(changedSettings).length > 0) {
            await this.saveSettings();
        }
        
        // リスナーに通知
        this.notifySettingsChanged(changedSettings);
    }

    /**
     * 設定の検証
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     * @returns {boolean} 有効かどうか
     */
    validateSetting(key, value) {
        const rule = this.validationRules.get(key);
        
        if (rule) {
            if (!rule.validate(value)) {
                console.error(`Validation failed for ${key}: ${rule.message}`);
                return false;
            }
        }
        
        // 基本的な型チェック
        const expectedType = typeof this.defaultSettings[key];
        if (expectedType !== 'undefined' && typeof value !== expectedType) {
            console.error(`Type mismatch for ${key}: expected ${expectedType}, got ${typeof value}`);
            return false;
        }
        
        return true;
    }

    /**
     * 設定の適用
     */
    applySettings() {
        for (const [key, value] of Object.entries(this.currentSettings)) {
            this.applySingleSetting(key, value);
        }
    }

    /**
     * 単一設定の適用
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     */
    applySingleSetting(key, value) {
        try {
            switch (key) {
                case 'visualFeedback':
                    if (this.mainController.feedbackManager) {
                        this.mainController.feedbackManager.updateFeedbackSettings({ visualEnabled: value });
                    }
                    break;
                    
                case 'captioning':
                    if (this.mainController.feedbackManager) {
                        this.mainController.feedbackManager.updateFeedbackSettings({ captionEnabled: value });
                    }
                    break;
                    
                case 'colorIndication':
                    if (this.mainController.feedbackManager) {
                        this.mainController.feedbackManager.updateFeedbackSettings({ colorIndicatorEnabled: value });
                    }
                    break;
                    
                case 'hapticFeedback':
                    if (this.mainController.feedbackManager) {
                        this.mainController.feedbackManager.updateFeedbackSettings({ vibrationEnabled: value });
                    }
                    break;
                    
                case 'descriptionEnabled':
                    if (this.mainController.descriptionManager) {
                        this.mainController.descriptionManager.updateSettings({ enabled: value });
                    }
                    break;
                    
                case 'descriptionSpeed':
                    if (this.mainController.descriptionManager) {
                        this.mainController.descriptionManager.updateSettings({ speed: value });
                    }
                    break;
                    
                case 'descriptionVolume':
                    if (this.mainController.descriptionManager) {
                        this.mainController.descriptionManager.updateSettings({ volume: value });
                    }
                    break;
                    
                case 'descriptionDetailLevel':
                    if (this.mainController.descriptionManager) {
                        this.mainController.descriptionManager.updateSettings({ detailLevel: value });
                    }
                    break;
                    
                case 'patternRecognition':
                    if (this.mainController.cueManager) {
                        this.mainController.cueManager.updateSettings({ patternRecognition: value });
                    }
                    break;
                    
                case 'cueSpatialAudio':
                    if (this.mainController.cueManager) {
                        this.mainController.cueManager.updateSettings({ spatialAudio: value });
                    }
                    break;
                    
                case 'cueFrequencyMapping':
                    if (this.mainController.cueManager) {
                        this.mainController.cueManager.updateSettings({ frequencyMapping: value });
                    }
                    break;
                    
                case 'highContrast':
                case 'largeFonts':
                case 'reduceMotion':
                    if (this.mainController.feedbackManager) {
                        this.mainController.feedbackManager.updateFeedbackSettings({ [key]: value });
                    }
                    break;
            }
        } catch (error) {
            console.error(`Failed to apply setting ${key}:`, error);
        }
    }

    /**
     * 設定リセット
     * @param {Array<string>} keys - リセットするキー（未指定の場合は全て）
     */
    async resetSettings(keys = null) {
        if (keys) {
            // 指定されたキーのみリセット
            const resetValues = {};
            keys.forEach(key => {
                if (this.defaultSettings.hasOwnProperty(key)) {
                    resetValues[key] = this.defaultSettings[key];
                }
            });
            await this.updateSettings(resetValues);
        } else {
            // 全設定をリセット
            this.currentSettings = { ...this.defaultSettings };
            this.applySettings();
            await this.saveSettings();
            this.notifySettingsChanged({});
        }
    }

    /**
     * 設定変更リスナーの追加
     * @param {Function} listener - リスナー関数
     */
    addChangeListener(listener) {
        this.changeListeners.add(listener);
    }

    /**
     * 設定変更リスナーの削除
     * @param {Function} listener - リスナー関数
     */
    removeChangeListener(listener) {
        this.changeListeners.delete(listener);
    }

    /**
     * 単一設定変更の通知
     * @param {string} key - 変更されたキー
     * @param {*} newValue - 新しい値
     * @param {*} oldValue - 古い値
     */
    notifySettingChanged(key, newValue, oldValue) {
        const event = {
            type: 'single',
            key: key,
            newValue: newValue,
            oldValue: oldValue,
            timestamp: Date.now()
        };
        
        this.changeListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Settings change listener error:', error);
            }
        });
    }

    /**
     * 複数設定変更の通知
     * @param {Object} changedSettings - 変更された設定
     */
    notifySettingsChanged(changedSettings) {
        const event = {
            type: 'multiple',
            changes: changedSettings,
            currentSettings: { ...this.currentSettings },
            timestamp: Date.now()
        };
        
        this.changeListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Settings change listener error:', error);
            }
        });
    }

    /**
     * 現在の設定取得
     * @returns {Object} 現在の設定
     */
    getSettings() {
        return { ...this.currentSettings };
    }

    /**
     * 特定設定の取得
     * @param {string} key - 設定キー
     * @returns {*} 設定値
     */
    getSetting(key) {
        return this.currentSettings[key];
    }

    /**
     * 設定のエクスポート
     * @returns {string} JSON形式の設定
     */
    exportSettings() {
        return JSON.stringify({
            version: '1.0.0',
            timestamp: Date.now(),
            settings: this.currentSettings
        }, null, 2);
    }

    /**
     * 設定のインポート
     * @param {string} jsonString - JSON形式の設定
     */
    async importSettings(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.settings && typeof data.settings === 'object') {
                await this.updateSettings(data.settings);
                console.log('Settings imported successfully');
            } else {
                throw new Error('Invalid settings format');
            }
        } catch (error) {
            throw new Error(`Failed to import settings: ${error.message}`);
        }
    }

    /**
     * 状態の取得
     * @returns {Object} 現在の状態
     */
    getStatus() {
        return {
            initialized: true,
            settingsCount: Object.keys(this.currentSettings).length,
            changeListenersCount: this.changeListeners.size,
            lastSaved: this.lastSaved || null,
            settings: { ...this.currentSettings }
        };
    }

    /**
     * キャメルケース変換
     * @param {string} str - 変換する文字列
     * @returns {string} キャメルケース文字列
     */
    toCamelCase(str) {
        return str.toLowerCase().split('_').map((word, index) => {
            return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
        }).join('');
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.changeListeners.clear();
        this.validationRules.clear();
    }
}