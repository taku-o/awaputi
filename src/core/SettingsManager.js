import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from './ConfigurationManager.js';
import { getSettingsNotificationSystem } from './SettingsNotificationSystem.js';

/**
 * 設定管理クラス - ゲーム設定の統合管理
 * ConfigurationManagerと統合された新しい設定システム
 */
export class SettingsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.configManager = getConfigurationManager();
        this.notificationSystem = getSettingsNotificationSystem();
        this.listeners = new Map();
        
        // 設定の検証ルール
        this.validationRules = {
            masterVolume: { type: 'number', min: 0, max: 1 },
            sfxVolume: { type: 'number', min: 0, max: 1 },
            bgmVolume: { type: 'number', min: 0, max: 1 },
            language: { type: 'string', enum: ['ja', 'en'] },
            quality: { type: 'string', enum: ['low', 'medium', 'high', 'auto'] },
            accessibility: {
                type: 'object',
                properties: {
                    highContrast: { type: 'boolean' },
                    reducedMotion: { type: 'boolean' },
                    largeText: { type: 'boolean' },
                    screenReader: { type: 'boolean' },
                    colorBlindSupport: { type: 'boolean' }
                }
            },
            controls: {
                type: 'object',
                properties: {
                    keyboardEnabled: { type: 'boolean' },
                    mouseEnabled: { type: 'boolean' },
                    touchEnabled: { type: 'boolean' }
                }
            }
        };
        
        // ConfigurationManagerに検証ルールとデフォルト値を設定
        this._setupConfigurationManager();
        
        this.load();
    }
    
    /**
     * デフォルト設定を取得
     */
    getDefaultSettings() {
        return {
            // 音響設定
            masterVolume: 0.7,
            sfxVolume: 0.8,
            bgmVolume: 0.5,
            isMuted: false,
            
            // 言語設定
            language: this.detectSystemLanguage(),
            
            // 品質設定
            quality: 'auto',
            
            // アクセシビリティ設定
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                largeText: false,
                screenReader: false,
                colorBlindSupport: false
            },
            
            // 操作設定
            controls: {
                keyboardEnabled: true,
                mouseEnabled: true,
                touchEnabled: true
            },
            
            // キーボードショートカット
            keyboardShortcuts: {
                pause: ['Space'],
                menu: ['Escape'],
                fullscreen: ['KeyF'],
                mute: ['KeyM'],
                settings: ['KeyS'],
                help: ['KeyH', 'F1']
            },
            
            // UI設定
            ui: {
                showFPS: false,
                showDebugInfo: false,
                animationSpeed: 1.0,
                uiScale: 1.0
            },
            
            // ソーシャル共有設定
            social: {
                enableSharing: true,
                autoPromptHighScore: true,
                autoPromptAchievements: true,
                defaultPlatform: 'auto', // 'auto', 'twitter', 'facebook', 'native'
                includeScreenshot: true,
                screenshotQuality: 'high', // 'low', 'medium', 'high'
                privacyLevel: 'public', // 'public', 'friends', 'private'
                customMessage: '',
                showWatermark: true
            },
            
            // 通知設定
            notifications: {
                challenges: {
                    enabled: true,
                    newChallenge: true,
                    challengeComplete: true,
                    dailyReminder: true,
                    weeklyReminder: true
                },
                achievements: {
                    enabled: true,
                    unlocked: true,
                    progress: false,
                    rare: true
                },
                leaderboard: {
                    enabled: true,
                    newRecord: true,
                    rankChange: false
                },
                system: {
                    enabled: true,
                    updates: true,
                    maintenance: true
                }
            }
        };
    }
    
    /**
     * システム言語を検出
     */
    detectSystemLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        
        // 日本語の場合
        if (browserLang.startsWith('ja')) {
            return 'ja';
        }
        
        // デフォルトは英語
        return 'en';
    }
    
    /**
     * ConfigurationManagerのセットアップ
     * @private
     */
    _setupConfigurationManager() {
        const defaultSettings = this.getDefaultSettings();
        
        // 音響設定
        this._setupSettingsCategory('audio', {
            masterVolume: defaultSettings.masterVolume,
            sfxVolume: defaultSettings.sfxVolume,
            bgmVolume: defaultSettings.bgmVolume,
            isMuted: defaultSettings.isMuted
        }, {
            masterVolume: this.validationRules.masterVolume,
            sfxVolume: this.validationRules.sfxVolume,
            bgmVolume: this.validationRules.bgmVolume,
            isMuted: { type: 'boolean' }
        });
        
        // UI設定
        this._setupSettingsCategory('ui', {
            language: defaultSettings.language,
            quality: defaultSettings.quality,
            ...defaultSettings.ui
        }, {
            language: { 
                type: 'string', 
                validator: (value) => ['ja', 'en'].includes(value)
            },
            quality: { 
                type: 'string', 
                validator: (value) => ['low', 'medium', 'high', 'auto'].includes(value)
            },
            showFPS: { type: 'boolean' },
            showDebugInfo: { type: 'boolean' },
            animationSpeed: { type: 'number', min: 0.1, max: 3.0 },
            uiScale: { type: 'number', min: 0.5, max: 2.0 }
        });
        
        // アクセシビリティ設定
        this._setupSettingsCategory('accessibility', defaultSettings.accessibility, {
            highContrast: { type: 'boolean' },
            reducedMotion: { type: 'boolean' },
            largeText: { type: 'boolean' },
            screenReader: { type: 'boolean' },
            colorBlindSupport: { type: 'boolean' }
        });
        
        // コントロール設定
        this._setupSettingsCategory('controls', defaultSettings.controls, {
            keyboardEnabled: { type: 'boolean' },
            mouseEnabled: { type: 'boolean' },
            touchEnabled: { type: 'boolean' }
        });
        
        // キーボードショートカット設定
        this._setupSettingsCategory('keyboard', defaultSettings.keyboardShortcuts, {});
        
        // ソーシャル共有設定
        this._setupSettingsCategory('social', defaultSettings.social, {
            enableSharing: { type: 'boolean' },
            autoPromptHighScore: { type: 'boolean' },
            autoPromptAchievements: { type: 'boolean' },
            defaultPlatform: { 
                type: 'string', 
                validator: (value) => ['auto', 'twitter', 'facebook', 'native'].includes(value)
            },
            includeScreenshot: { type: 'boolean' },
            screenshotQuality: { 
                type: 'string', 
                validator: (value) => ['low', 'medium', 'high'].includes(value)
            },
            privacyLevel: { 
                type: 'string', 
                validator: (value) => ['public', 'friends', 'private'].includes(value)
            },
            customMessage: { type: 'string' },
            showWatermark: { type: 'boolean' }
        });
        
        // 通知設定
        this._setupSettingsCategory('notifications', defaultSettings.notifications, {});
    }
    
    /**
     * 設定カテゴリをセットアップ
     * @private
     */
    _setupSettingsCategory(category, defaultValues, validationRules) {
        for (const [key, value] of Object.entries(defaultValues)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // ネストされたオブジェクトの場合
                for (const [subKey, subValue] of Object.entries(value)) {
                    this.configManager.setDefaultValue(category, `${key}.${subKey}`, subValue);
                    // 実際の値も設定
                    this.configManager.set(category, `${key}.${subKey}`, subValue);
                    if (validationRules[subKey]) {
                        this.configManager.setValidationRule(category, `${key}.${subKey}`, validationRules[subKey]);
                    }
                }
            } else {
                this.configManager.setDefaultValue(category, key, value);
                // 実際の値も設定
                this.configManager.set(category, key, value);
                if (validationRules[key]) {
                    this.configManager.setValidationRule(category, key, validationRules[key]);
                }
            }
        }
    }

    /**
     * 設定を取得
     */
    get(key) {
        try {
            const { category, settingKey } = this._parseSettingKey(key);
            
            // ConfigurationManagerから取得を試行
            const value = this.configManager.get(category, settingKey);
            if (value !== null && value !== undefined) {
                return value;
            }
            
            // フォールバック: 従来の方式で取得
            return this._getLegacyValue(key);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'get',
                key: key
            });
            return this._getLegacyValue(key);
        }
    }
    
    /**
     * 従来の方式で設定値を取得（フォールバック用）
     * @private
     */
    _getLegacyValue(key) {
        const keys = key.split('.');
        let value = this.settings || this.getDefaultSettings();
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    /**
     * 設定キーをカテゴリと設定キーに分解
     * @private
     */
    _parseSettingKey(key) {
        // 音響設定
        if (['masterVolume', 'sfxVolume', 'bgmVolume', 'isMuted'].includes(key)) {
            return { category: 'audio', settingKey: key };
        }
        
        // UI設定
        if (['language', 'quality'].includes(key) || key.startsWith('ui.')) {
            const settingKey = key.startsWith('ui.') ? key.substring(3) : key;
            return { category: 'ui', settingKey };
        }
        
        // アクセシビリティ設定
        if (key.startsWith('accessibility.')) {
            return { category: 'accessibility', settingKey: key.substring(14) };
        }
        
        // コントロール設定
        if (key.startsWith('controls.')) {
            return { category: 'controls', settingKey: key.substring(9) };
        }
        
        // キーボードショートカット
        if (key.startsWith('keyboardShortcuts.')) {
            return { category: 'keyboard', settingKey: key.substring(18) };
        }
        
        // デフォルト: ui カテゴリ
        return { category: 'ui', settingKey: key };
    }
    
    /**
     * 設定を更新
     */
    set(key, value) {
        try {
            const { category, settingKey } = this._parseSettingKey(key);
            
            // ConfigurationManagerで設定を更新
            const success = this.configManager.set(category, settingKey, value);
            
            if (success) {
                // 従来のsettingsオブジェクトも更新（互換性のため）
                this._updateLegacySettings(key, value);
                
                // 変更を通知
                const oldValue = this._getLegacyValue(key);
                this.notifyChange(key, value, oldValue);
                
                // 設定を保存
                this.save();
                
                return true;
            } else {
                // ConfigurationManagerでの設定が失敗した場合、従来の方式で試行
                return this._setLegacyValue(key, value);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'set',
                key: key,
                value: value
            });
            return this._setLegacyValue(key, value);
        }
    }
    
    /**
     * 従来の方式で設定値を更新（フォールバック用）
     * @private
     */
    _setLegacyValue(key, value) {
        try {
            // 入力値を検証
            const validation = this.validateSetting(key, value);
            if (!validation.isValid) {
                throw new Error(`Invalid setting value for ${key}: ${validation.errors.join(', ')}`);
            }
            
            // 設定を更新
            const keys = key.split('.');
            let target = this.settings || this.getDefaultSettings();
            
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!(k in target) || typeof target[k] !== 'object') {
                    target[k] = {};
                }
                target = target[k];
            }
            
            const lastKey = keys[keys.length - 1];
            const oldValue = target[lastKey];
            target[lastKey] = validation.sanitizedValue;
            
            // 変更を通知
            this.notifyChange(key, validation.sanitizedValue, oldValue);
            
            // 設定を保存
            this.save();
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: '_setLegacyValue',
                key: key,
                value: value
            });
            return false;
        }
    }
    
    /**
     * 従来のsettingsオブジェクトを更新
     * @private
     */
    _updateLegacySettings(key, value) {
        if (!this.settings) {
            this.settings = this.getDefaultSettings();
        }
        
        const keys = key.split('.');
        let target = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in target) || typeof target[k] !== 'object') {
                target[k] = {};
            }
            target = target[k];
        }
        
        const lastKey = keys[keys.length - 1];
        target[lastKey] = value;
    }
    
    /**
     * 設定値を検証
     */
    validateSetting(key, value) {
        const topLevelKey = key.split('.')[0];
        const rule = this.validationRules[topLevelKey];
        
        if (!rule) {
            return { isValid: true, sanitizedValue: value };
        }
        
        return getErrorHandler().validateInput(value, rule.type, rule);
    }
    
    /**
     * 複数の設定を一括更新
     */
    setMultiple(settings) {
        const results = {};
        
        for (const [key, value] of Object.entries(settings)) {
            results[key] = this.set(key, value);
        }
        
        return results;
    }
    
    /**
     * 設定をリセット
     */
    reset(key = null) {
        try {
            if (key) {
                // 特定の設定をリセット
                const defaultValue = this.getDefaultValue(key);
                if (defaultValue !== undefined) {
                    this.set(key, defaultValue);
                }
            } else {
                // 全設定をリセット
                this.configManager.reset();
                this.settings = this.getDefaultSettings();
                
                // ConfigurationManagerも再セットアップ
                this._setupConfigurationManager();
                
                this.save();
                this.notifyChange('*', this.settings, null);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'reset',
                key: key
            });
        }
    }
    
    /**
     * デフォルト値を取得
     */
    getDefaultValue(key) {
        const keys = key.split('.');
        let value = this.getDefaultSettings();
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    /**
     * 設定変更リスナーを追加
     */
    addListener(key, callback, options = {}) {
        try {
            // 新しい通知システムを使用
            const listenerId = this.notificationSystem.addListener(key, callback, {
                ...options,
                context: options.context || 'SettingsManager'
            });
            
            // 従来のリスナーシステムにも追加（互換性のため）
            if (!this.listeners.has(key)) {
                this.listeners.set(key, new Set());
            }
            this.listeners.get(key).add(callback);
            
            // ConfigurationManagerの監視機能も使用
            const { category, settingKey } = this._parseSettingKey(key);
            const watchId = this.configManager.watch(category, settingKey, (newValue, oldValue) => {
                // 直接コールバックを呼び出し（重複通知を避けるため）
                callback(newValue, oldValue, key);
            });
            
            // 監視IDを保存（削除時に使用）
            if (!this.configWatchers) {
                this.configWatchers = new Map();
            }
            this.configWatchers.set(`${key}_${callback}`, watchId);
            
            return listenerId;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'addListener',
                key: key
            });
            return null;
        }
    }
    
    /**
     * 設定変更リスナーを削除
     */
    removeListener(key, callback) {
        try {
            // 従来のリスナーシステムから削除
            if (this.listeners.has(key)) {
                this.listeners.get(key).delete(callback);
            }
            
            // ConfigurationManagerの監視も解除
            if (this.configWatchers) {
                const watcherKey = `${key}_${callback}`;
                const watchId = this.configWatchers.get(watcherKey);
                if (watchId) {
                    this.configManager.unwatch(watchId);
                    this.configWatchers.delete(watcherKey);
                }
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'removeListener',
                key: key
            });
        }
    }
    
    /**
     * リスナーIDでリスナーを削除
     */
    removeListenerById(listenerId) {
        return this.notificationSystem.removeListener(listenerId);
    }
    
    /**
     * 設定変更を通知
     */
    notifyChange(key, newValue, oldValue) {
        // 新しい通知システムを使用
        this.notificationSystem.notifyChange(key, newValue, oldValue, {
            source: 'SettingsManager',
            timestamp: Date.now()
        });
        
        // 従来のリスナーシステムにも通知（互換性のため）
        this._notifyLegacyListeners(key, newValue, oldValue);
        
        // ゲームエンジンに設定変更を適用
        this.applySettingChange(key, newValue, oldValue);
    }
    
    /**
     * 従来のリスナーシステムに通知
     * @private
     */
    _notifyLegacyListeners(key, newValue, oldValue) {
        // 特定のキーのリスナーに通知
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                        operation: 'notifyChange',
                        key: key,
                        callback: callback.name
                    });
                }
            });
        }
        
        // 全体変更リスナーに通知
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                        operation: 'notifyChange',
                        key: '*',
                        callback: callback.name
                    });
                }
            });
        }
    }
    
    /**
     * 設定変更をゲームエンジンに適用
     */
    applySettingChange(key, newValue, oldValue) {
        try {
            switch (key) {
                case 'masterVolume':
                case 'sfxVolume':
                case 'bgmVolume':
                    if (this.gameEngine.audioManager) {
                        const volumeType = key.replace('Volume', '');
                        this.gameEngine.audioManager.setVolume(volumeType, newValue);
                    }
                    break;
                    
                case 'isMuted':
                    if (this.gameEngine.audioManager) {
                        if (newValue) {
                            this.gameEngine.audioManager.stopAllSounds();
                        }
                    }
                    break;
                    
                case 'language':
                    // 言語変更の処理（非同期）
                    this.applyLanguageChange(newValue).catch(error => {
                        console.error('Language change failed:', error);
                    });
                    break;
                    
                case 'quality':
                    // 品質設定の変更
                    this.applyQualityChange(newValue);
                    break;
                    
                case 'accessibility.highContrast':
                    this.applyHighContrastMode(newValue);
                    break;
                    
                case 'accessibility.reducedMotion':
                    this.applyReducedMotionMode(newValue);
                    break;
                    
                case 'accessibility.largeText':
                    this.applyLargeTextMode(newValue);
                    break;
                    
                case 'ui.uiScale':
                    this.applyUIScale(newValue);
                    break;
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'applySettingChange',
                key: key,
                newValue: newValue
            });
        }
    }
    
    /**
     * 言語変更を適用（非同期）
     */
    async applyLanguageChange(language) {
        try {
            // ローカライゼーションマネージャーで言語を設定（非同期）
            if (this.gameEngine.localizationManager) {
                const success = await this.gameEngine.localizationManager.setLanguage(language);
                if (success) {
                    console.log(`Language successfully changed to: ${language}`);
                } else {
                    console.warn(`Failed to change language to: ${language}`);
                }
            }
        } catch (error) {
            console.error('Language change error:', error);
        }
    }
    
    /**
     * 品質設定を適用
     */
    applyQualityChange(quality) {
        if (this.gameEngine.performanceOptimizer) {
            switch (quality) {
                case 'low':
                    this.gameEngine.performanceOptimizer.setQualityLevel('low');
                    break;
                case 'medium':
                    this.gameEngine.performanceOptimizer.setQualityLevel('medium');
                    break;
                case 'high':
                    this.gameEngine.performanceOptimizer.setQualityLevel('high');
                    break;
                case 'auto':
                    this.gameEngine.performanceOptimizer.enableAutoQuality();
                    break;
            }
        }
        
        console.log(`Quality setting changed to: ${quality}`);
    }
    
    /**
     * ハイコントラストモードを適用
     */
    applyHighContrastMode(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        console.log(`High contrast mode: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * モーション軽減モードを適用
     */
    applyReducedMotionMode(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
        }
        
        // パフォーマンス最適化にも反映
        if (this.gameEngine.performanceOptimizer) {
            this.gameEngine.performanceOptimizer.setReducedMotion(enabled);
        }
        
        console.log(`Reduced motion mode: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 大きなテキストモードを適用
     */
    applyLargeTextMode(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.add('large-text');
        } else {
            body.classList.remove('large-text');
        }
        
        console.log(`Large text mode: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * UIスケールを適用
     */
    applyUIScale(scale) {
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            gameUI.style.transform = `scale(${scale})`;
            gameUI.style.transformOrigin = 'top left';
        }
        
        console.log(`UI scale changed to: ${scale}`);
    }
    
    /**
     * 設定を保存
     */
    save() {
        try {
            // 従来の設定データを保存
            if (this.settings) {
                const settingsData = JSON.stringify(this.settings);
                localStorage.setItem('bubblePop_settings', settingsData);
            }
            
            // ConfigurationManagerの設定も保存
            this._saveConfigurationManagerData();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STORAGE_ERROR', {
                operation: 'save',
                data: 'settings'
            });
        }
    }
    
    /**
     * ConfigurationManagerのデータを保存
     * @private
     */
    _saveConfigurationManagerData() {
        try {
            const configData = {
                ui: this.configManager.getCategory('ui'),
                audio: this.configManager.getCategory('audio'),
                accessibility: this.configManager.getCategory('accessibility'),
                controls: this.configManager.getCategory('controls'),
                keyboard: this.configManager.getCategory('keyboard')
            };
            
            localStorage.setItem('bubblePop_configManager', JSON.stringify(configData));
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STORAGE_ERROR', {
                operation: '_saveConfigurationManagerData'
            });
        }
    }
    
    /**
     * 設定を読み込み
     */
    load() {
        try {
            // 従来の設定データを読み込み
            const settingsData = localStorage.getItem('bubblePop_settings');
            if (settingsData) {
                const loadedSettings = JSON.parse(settingsData);
                
                // デフォルト設定とマージ
                this.settings = this.mergeSettings(this.getDefaultSettings(), loadedSettings);
            } else {
                this.settings = this.getDefaultSettings();
            }
            
            // ConfigurationManagerのデータを読み込み
            this._loadConfigurationManagerData();
            
            // 読み込み後に設定を適用
            this.applyAllSettings();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STORAGE_ERROR', {
                operation: 'load',
                data: 'settings'
            });
            
            // エラーの場合はデフォルト設定を使用
            this.settings = this.getDefaultSettings();
        }
    }
    
    /**
     * ConfigurationManagerのデータを読み込み
     * @private
     */
    _loadConfigurationManagerData() {
        try {
            const configData = localStorage.getItem('bubblePop_configManager');
            if (configData) {
                const loadedConfig = JSON.parse(configData);
                
                // 各カテゴリのデータをConfigurationManagerに設定
                for (const [category, settings] of Object.entries(loadedConfig)) {
                    for (const [key, value] of Object.entries(settings)) {
                        this.configManager.set(category, key, value);
                    }
                }
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'STORAGE_ERROR', {
                operation: '_loadConfigurationManagerData'
            });
        }
    }
    
    /**
     * 設定をマージ
     */
    mergeSettings(defaultSettings, loadedSettings) {
        const merged = { ...defaultSettings };
        
        for (const [key, value] of Object.entries(loadedSettings)) {
            if (key in defaultSettings) {
                if (typeof defaultSettings[key] === 'object' && defaultSettings[key] !== null) {
                    merged[key] = { ...defaultSettings[key], ...value };
                } else {
                    merged[key] = value;
                }
            }
        }
        
        return merged;
    }
    
    /**
     * 全設定を適用
     */
    applyAllSettings() {
        // 音響設定
        this.applySettingChange('masterVolume', this.settings.masterVolume);
        this.applySettingChange('sfxVolume', this.settings.sfxVolume);
        this.applySettingChange('bgmVolume', this.settings.bgmVolume);
        
        // 言語設定
        this.applySettingChange('language', this.settings.language);
        
        // 品質設定
        this.applySettingChange('quality', this.settings.quality);
        
        // アクセシビリティ設定
        this.applySettingChange('accessibility.highContrast', this.settings.accessibility.highContrast);
        this.applySettingChange('accessibility.reducedMotion', this.settings.accessibility.reducedMotion);
        this.applySettingChange('accessibility.largeText', this.settings.accessibility.largeText);
        
        // UI設定
        this.applySettingChange('ui.uiScale', this.settings.ui.uiScale);
    }
    
    /**
     * 設定のエクスポート
     */
    export() {
        return JSON.stringify(this.settings, null, 2);
    }
    
    /**
     * 設定のインポート
     */
    import(settingsJson) {
        try {
            const importedSettings = JSON.parse(settingsJson);
            this.settings = this.mergeSettings(this.getDefaultSettings(), importedSettings);
            this.save();
            this.applyAllSettings();
            this.notifyChange('*', this.settings, null);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'import',
                data: settingsJson
            });
            return false;
        }
    }
    
    /**
     * 設定の統計情報を取得
     */
    getStats() {
        return {
            totalSettings: Object.keys(this.settings).length,
            listeners: this.listeners.size,
            language: this.settings.language,
            quality: this.settings.quality,
            accessibility: Object.values(this.settings.accessibility).filter(Boolean).length,
            lastModified: localStorage.getItem('bubblePop_settings_timestamp') || 'unknown'
        };
    }
    
    /**
     * ConfigurationManagerとの統合状態を取得
     */
    getIntegrationStatus() {
        return {
            configManagerActive: !!this.configManager,
            watchersCount: this.configWatchers ? this.configWatchers.size : 0,
            categoriesInConfig: this.configManager ? [
                'ui', 'audio', 'accessibility', 'controls', 'keyboard'
            ].map(cat => ({
                category: cat,
                settingsCount: Object.keys(this.configManager.getCategory(cat)).length
            })) : [],
            legacySettingsCount: this.settings ? Object.keys(this.settings).length : 0
        };
    }
    
    /**
     * 設定の同期状態をチェック
     */
    checkSyncStatus() {
        const status = {
            synchronized: true,
            differences: []
        };
        
        try {
            // 主要設定の同期状態をチェック
            const keyMappings = [
                { legacy: 'masterVolume', config: { category: 'audio', key: 'masterVolume' } },
                { legacy: 'sfxVolume', config: { category: 'audio', key: 'sfxVolume' } },
                { legacy: 'bgmVolume', config: { category: 'audio', key: 'bgmVolume' } },
                { legacy: 'language', config: { category: 'ui', key: 'language' } },
                { legacy: 'quality', config: { category: 'ui', key: 'quality' } }
            ];
            
            for (const mapping of keyMappings) {
                const legacyValue = this._getLegacyValue(mapping.legacy);
                const configValue = this.configManager.get(mapping.config.category, mapping.config.key);
                
                if (legacyValue !== configValue) {
                    status.synchronized = false;
                    status.differences.push({
                        key: mapping.legacy,
                        legacyValue,
                        configValue
                    });
                }
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'checkSyncStatus'
            });
            status.synchronized = false;
        }
        
        return status;
    }
    
    /**
     * 設定を強制同期
     */
    forceSynchronization() {
        try {
            // 従来の設定をConfigurationManagerに同期
            if (this.settings) {
                this._syncLegacyToConfig();
            }
            
            // ConfigurationManagerの設定を従来の形式に同期
            this._syncConfigToLegacy();
            
            // 保存
            this.save();
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'SETTINGS_ERROR', {
                operation: 'forceSynchronization'
            });
            return false;
        }
    }
    
    /**
     * 従来の設定をConfigurationManagerに同期
     * @private
     */
    _syncLegacyToConfig() {
        const mappings = [
            { legacy: 'masterVolume', config: { category: 'audio', key: 'masterVolume' } },
            { legacy: 'sfxVolume', config: { category: 'audio', key: 'sfxVolume' } },
            { legacy: 'bgmVolume', config: { category: 'audio', key: 'bgmVolume' } },
            { legacy: 'isMuted', config: { category: 'audio', key: 'isMuted' } },
            { legacy: 'language', config: { category: 'ui', key: 'language' } },
            { legacy: 'quality', config: { category: 'ui', key: 'quality' } }
        ];
        
        for (const mapping of mappings) {
            const value = this._getLegacyValue(mapping.legacy);
            if (value !== undefined) {
                this.configManager.set(mapping.config.category, mapping.config.key, value);
            }
        }
        
        // ネストされた設定の同期
        if (this.settings.accessibility) {
            for (const [key, value] of Object.entries(this.settings.accessibility)) {
                this.configManager.set('accessibility', key, value);
            }
        }
        
        if (this.settings.controls) {
            for (const [key, value] of Object.entries(this.settings.controls)) {
                this.configManager.set('controls', key, value);
            }
        }
        
        if (this.settings.ui) {
            for (const [key, value] of Object.entries(this.settings.ui)) {
                this.configManager.set('ui', key, value);
            }
        }
    }
    
    /**
     * ConfigurationManagerの設定を従来の形式に同期
     * @private
     */
    _syncConfigToLegacy() {
        if (!this.settings) {
            this.settings = this.getDefaultSettings();
        }
        
        // 音響設定
        const audioConfig = this.configManager.getCategory('audio');
        for (const [key, value] of Object.entries(audioConfig)) {
            if (key in this.settings) {
                this.settings[key] = value;
            }
        }
        
        // UI設定
        const uiConfig = this.configManager.getCategory('ui');
        for (const [key, value] of Object.entries(uiConfig)) {
            if (key === 'language' || key === 'quality') {
                this.settings[key] = value;
            } else if (this.settings.ui) {
                this.settings.ui[key] = value;
            }
        }
        
        // アクセシビリティ設定
        const accessibilityConfig = this.configManager.getCategory('accessibility');
        if (this.settings.accessibility) {
            Object.assign(this.settings.accessibility, accessibilityConfig);
        }
        
        // コントロール設定
        const controlsConfig = this.configManager.getCategory('controls');
        if (this.settings.controls) {
            Object.assign(this.settings.controls, controlsConfig);
        }
    }
    
    /**
     * コンポーネント監視を追加
     * @param {string} componentName - コンポーネント名
     * @param {Object} component - コンポーネントオブジェクト
     * @param {Array} watchedSettings - 監視する設定のリスト
     * @returns {string} 監視ID
     */
    addComponentWatcher(componentName, component, watchedSettings) {
        return this.notificationSystem.addComponentWatcher(componentName, component, watchedSettings);
    }
    
    /**
     * コンポーネント監視を削除
     * @param {string} watcherId - 監視ID
     * @returns {boolean} 削除成功フラグ
     */
    removeComponentWatcher(watcherId) {
        return this.notificationSystem.removeComponentWatcher(watcherId);
    }
    
    /**
     * 通知システムの統計情報を取得
     * @returns {Object} 統計情報
     */
    getNotificationStats() {
        return this.notificationSystem.getStats();
    }
    
    /**
     * アクティブなリスナー情報を取得
     * @returns {Object} リスナー情報
     */
    getActiveListeners() {
        return this.notificationSystem.getActiveListeners();
    }
    
    /**
     * アクティブなコンポーネント監視情報を取得
     * @returns {Array} 監視情報
     */
    getActiveWatchers() {
        return this.notificationSystem.getActiveWatchers();
    }
    
    /**
     * 通知履歴を取得
     * @param {number} limit - 取得する履歴の数
     * @returns {Array} 通知履歴
     */
    getNotificationHistory(limit = 50) {
        return this.notificationSystem.getNotificationHistory(limit);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // 従来のリスナーをクリア
        this.listeners.clear();
        
        // ConfigurationManagerの監視をクリア
        if (this.configWatchers) {
            for (const watchId of this.configWatchers.values()) {
                this.configManager.unwatch(watchId);
            }
            this.configWatchers.clear();
        }
        
        // 通知システムをクリーンアップ
        this.notificationSystem.cleanup();
    }
}