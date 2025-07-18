import { errorHandler } from '../utils/ErrorHandler.js';

/**
 * 設定管理クラス - ゲーム設定の統合管理
 */
export class SettingsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.settings = this.getDefaultSettings();
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
     * 設定を取得
     */
    get(key) {
        const keys = key.split('.');
        let value = this.settings;
        
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
     * 設定を更新
     */
    set(key, value) {
        try {
            // 入力値を検証
            const validation = this.validateSetting(key, value);
            if (!validation.isValid) {
                throw new Error(`Invalid setting value for ${key}: ${validation.errors.join(', ')}`);
            }
            
            // 設定を更新
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
            const oldValue = target[lastKey];
            target[lastKey] = validation.sanitizedValue;
            
            // 変更を通知
            this.notifyChange(key, validation.sanitizedValue, oldValue);
            
            // 設定を保存
            this.save();
            
            return true;
        } catch (error) {
            errorHandler.handleError(error, 'SETTINGS_ERROR', {
                operation: 'set',
                key: key,
                value: value
            });
            return false;
        }
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
        
        return errorHandler.validateInput(value, rule.type, rule);
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
        if (key) {
            // 特定の設定をリセット
            const defaultValue = this.getDefaultValue(key);
            if (defaultValue !== undefined) {
                this.set(key, defaultValue);
            }
        } else {
            // 全設定をリセット
            this.settings = this.getDefaultSettings();
            this.save();
            this.notifyChange('*', this.settings, null);
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
    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    }
    
    /**
     * 設定変更リスナーを削除
     */
    removeListener(key, callback) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(callback);
        }
    }
    
    /**
     * 設定変更を通知
     */
    notifyChange(key, newValue, oldValue) {
        // 特定のキーのリスナーに通知
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    errorHandler.handleError(error, 'SETTINGS_ERROR', {
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
                    errorHandler.handleError(error, 'SETTINGS_ERROR', {
                        operation: 'notifyChange',
                        key: '*',
                        callback: callback.name
                    });
                }
            });
        }
        
        // ゲームエンジンに設定変更を適用
        this.applySettingChange(key, newValue, oldValue);
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
                    // 言語変更の処理
                    this.applyLanguageChange(newValue);
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
            errorHandler.handleError(error, 'SETTINGS_ERROR', {
                operation: 'applySettingChange',
                key: key,
                newValue: newValue
            });
        }
    }
    
    /**
     * 言語変更を適用
     */
    applyLanguageChange(language) {
        // 言語設定をHTMLに反映
        document.documentElement.lang = language;
        
        // ローカライゼーションマネージャーに通知
        if (this.gameEngine.localizationManager) {
            this.gameEngine.localizationManager.setLanguage(language);
        }
        
        console.log(`Language changed to: ${language}`);
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
            const settingsData = JSON.stringify(this.settings);
            localStorage.setItem('bubblePop_settings', settingsData);
        } catch (error) {
            errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'save',
                data: 'settings'
            });
        }
    }
    
    /**
     * 設定を読み込み
     */
    load() {
        try {
            const settingsData = localStorage.getItem('bubblePop_settings');
            if (settingsData) {
                const loadedSettings = JSON.parse(settingsData);
                
                // デフォルト設定とマージ
                this.settings = this.mergeSettings(this.getDefaultSettings(), loadedSettings);
                
                // 読み込み後に設定を適用
                this.applyAllSettings();
            }
        } catch (error) {
            errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'load',
                data: 'settings'
            });
            
            // エラーの場合はデフォルト設定を使用
            this.settings = this.getDefaultSettings();
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
            errorHandler.handleError(error, 'SETTINGS_ERROR', {
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
     * クリーンアップ
     */
    cleanup() {
        this.listeners.clear();
    }
}