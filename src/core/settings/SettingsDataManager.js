/**
 * SettingsDataManager
 * デフォルト設定生成、データ構造管理、設定カテゴリ管理、レガシー値処理を担当
 */
export class SettingsDataManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.configManager = settingsManager.configManager;
        
        // 検証ルール（SettingsValidatorと同期）
        this.validationRules = {
            masterVolume: { type: 'number', min: 0, max: 1 },
            sfxVolume: { type: 'number', min: 0, max: 1 },
            bgmVolume: { type: 'number', min: 0, max: 1 }
        };
        
        console.log('[SettingsDataManager] Component initialized');
    }
    
    /**
     * デフォルト設定を生成
     * @returns {Object} デフォルト設定オブジェクト
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
            
            // 通知設定（平坦化構造）
            notifications: {
                'challenges.enabled': true,
                'challenges.newChallenge': true,
                'challenges.challengeComplete': true,
                'challenges.dailyReminder': true,
                'challenges.weeklyReminder': true,
                'achievements.enabled': true,
                'achievements.unlocked': true,
                'achievements.progress': false,
                'achievements.rare': true,
                'leaderboard.enabled': true,
                'leaderboard.newRecord': true,
                'leaderboard.rankChange': false,
                'system.enabled': true,
                'system.updates': true,
                'system.maintenance': true
            }
        };
    }
    
    /**
     * システム言語を検出
     * @returns {string} 検出された言語コード
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
     * 設定カテゴリをセットアップ
     * @param {string} category カテゴリ名
     * @param {Object} defaultValues デフォルト値
     * @param {Object} validationRules 検証ルール
     */
    setupSettingsCategory(category, defaultValues, validationRules) {
        try {
            // ConfigurationManagerにカテゴリを設定
            for (const [key, value] of Object.entries(defaultValues)) {
                const fullKey = `${category}.${key}`;
                
                // デフォルト値を設定（正しいメソッド名を使用）
                this.configManager.setDefaultValue(fullKey, value);
                
                // カテゴリと設定値を初期化（カテゴリが確実に作成されるようにする）
                this.configManager.set(category, key, value);
                
                // 検証ルールを設定
                if (validationRules[key]) {
                    this.configManager.setValidationRule(fullKey, validationRules[key]);
                }
            }
            
            console.log(`[SettingsDataManager] Category '${category}' setup completed with ${Object.keys(defaultValues).length} settings`);
        } catch (error) {
            console.error(`[SettingsDataManager] Failed to setup category '${category}':`, error);
            throw error;
        }
    }
    
    /**
     * 設定キーを解析
     * @param {string} key 設定キー
     * @returns {Object} 解析結果 {category, settingName, fullKey}
     */
    parseSettingKey(key) {
        const parts = key.split('.');
        
        if (parts.length === 1) {
            // レガシーキー形式（例: 'masterVolume'）
            return {
                category: 'legacy',
                settingName: key,
                fullKey: key,
                isLegacy: true
            };
        } else if (parts.length === 2) {
            // 新しい形式（例: 'audio.masterVolume'）
            return {
                category: parts[0],
                settingName: parts[1],
                fullKey: key,
                isLegacy: false
            };
        } else {
            // ネストされた形式（例: 'accessibility.highContrast'）
            return {
                category: parts[0],
                settingName: parts.slice(1).join('.'),
                fullKey: key,
                isLegacy: false
            };
        }
    }
    
    /**
     * レガシー値を取得（後方互換性のため）
     * @param {string} key レガシーキー
     * @returns {*} 設定値
     */
    getLegacyValue(key) {
        // レガシーキーを新しい形式にマッピング
        const legacyKeyMap = {
            masterVolume: 'audio.masterVolume',
            sfxVolume: 'audio.sfxVolume',
            bgmVolume: 'audio.bgmVolume',
            isMuted: 'audio.isMuted',
            language: 'ui.language',
            quality: 'ui.quality',
            showFPS: 'ui.showFPS',
            showDebugInfo: 'ui.showDebugInfo',
            animationSpeed: 'ui.animationSpeed',
            uiScale: 'ui.uiScale'
        };
        
        const newKey = legacyKeyMap[key];
        if (newKey) {
            return this.configManager.get(newKey);
        }
        
        // マッピングがない場合は直接アクセス
        return this.configManager.get(key);
    }
    
    /**
     * 設定のデフォルト値を取得
     * @param {string} key 設定キー
     * @returns {*} デフォルト値
     */
    getDefaultValue(key) {
        const parsed = this.parseSettingKey(key);
        
        if (parsed.isLegacy) {
            // レガシーキーの場合はレガシー値を取得
            const legacyValue = this.getLegacyValue(key);
            if (legacyValue !== undefined) {
                return legacyValue;
            }
        }
        
        // ConfigurationManagerからデフォルト値を取得
        return this.configManager.getDefault(key);
    }
    
    /**
     * 設定をマージ
     * @param {Object} defaultSettings デフォルト設定
     * @param {Object} loadedSettings 読み込まれた設定
     * @returns {Object} マージされた設定
     */
    mergeSettings(defaultSettings, loadedSettings) {
        if (!loadedSettings || typeof loadedSettings !== 'object') {
            return { ...defaultSettings };
        }
        
        const merged = { ...defaultSettings };
        
        // 深いマージを実行
        for (const [key, value] of Object.entries(loadedSettings)) {
            if (key in defaultSettings) {
                if (typeof value === 'object' && value !== null && 
                    typeof defaultSettings[key] === 'object' && defaultSettings[key] !== null &&
                    !Array.isArray(value) && !Array.isArray(defaultSettings[key])) {
                    // オブジェクトの場合は再帰的にマージ
                    merged[key] = this.mergeSettings(defaultSettings[key], value);
                } else {
                    // プリミティブ値の場合は上書き
                    merged[key] = value;
                }
            }
        }
        
        return merged;
    }
    
    /**
     * 設定データの整合性を検証
     * @param {Object} settings 設定オブジェクト
     * @returns {Object} 検証結果 {isValid, errors}
     */
    validateSettingsStructure(settings) {
        const errors = [];
        const requiredCategories = ['accessibility', 'controls', 'ui', 'social', 'notifications'];
        
        if (!settings || typeof settings !== 'object') {
            errors.push('Settings must be a valid object');
            return { isValid: false, errors };
        }
        
        // 必須カテゴリの存在確認
        for (const category of requiredCategories) {
            if (!(category in settings)) {
                errors.push(`Missing required category: ${category}`);
            } else if (typeof settings[category] !== 'object' || settings[category] === null) {
                errors.push(`Category '${category}' must be an object`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} データ管理統計
     */
    getStats() {
        const defaultSettings = this.getDefaultSettings();
        const settingsCount = this._countSettings(defaultSettings);
        
        return {
            totalSettings: settingsCount.total,
            categoriesCount: settingsCount.categories,
            systemLanguage: this.detectSystemLanguage(),
            defaultsGenerated: true,
            structureValid: true
        };
    }
    
    /**
     * 設定数を再帰的にカウント
     * @param {Object} obj 設定オブジェクト
     * @returns {Object} カウント結果
     * @private
     */
    _countSettings(obj, categories = new Set()) {
        let total = 0;
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                categories.add(key);
                const subCount = this._countSettings(value, categories);
                total += subCount.total;
            } else {
                total++;
            }
        }
        
        return {
            total,
            categories: categories.size
        };
    }
}