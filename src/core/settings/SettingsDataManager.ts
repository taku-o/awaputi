/**
 * SettingsDataManager
 * デフォルト設定生成、データ構造管理、設定カテゴリ管理、レガシー値処理を担当
 */

// 型定義
export interface SettingsManager { configManager: ConfigManager
    }
}

export interface ConfigManager { setDefaultValue(key: string, value: any): void,
    set(category: string, key: string, value: any): void,
    setValidationRule(key: string, rule: ValidationRule): void,
    get(key: string): any,
    getDefault(key: string): any, }
}

export interface ValidationRule { type: string,
    min?: number;
    max?: number;
    values?: any[];
    required?: boolean; }
}

export interface ValidationRules { [key: string]: ValidationRule,
    }
}

export interface AccessibilitySettings { highContrast: boolean,
    reducedMotion: boolean,
    largeText: boolean,
    screenReader: boolean,
    colorBlindSupport: boolean,
    fontSize: FontSize,
    contrastLevel: ContrastLevel,
    keyboardNavigation: boolean,
    voiceGuidance: boolean,
    subtitles: boolean,
    profiles: AccessibilityProfile,
    importExport: boolean }
}

export interface ControlsSettings { keyboardEnabled: boolean,
    mouseEnabled: boolean,
    touchEnabled: boolean }
}

export interface KeyboardShortcuts { pause: string[],
    menu: string[],
    settings: string[],
    help: string[] }
}

export interface UISettings { showFPS: boolean,
    showDebugInfo: boolean,
    animationSpeed: number,
    uiScale: number }
}

export interface SocialSettings { enableSharing: boolean,
    autoPromptHighScore: boolean,
    autoPromptAchievements: boolean,
    defaultPlatform: SocialPlatform,
    includeScreenshot: boolean,
    screenshotQuality: ScreenshotQuality,
    privacyLevel: PrivacyLevel,
    customMessage: string,
    showWatermark: boolean }
}

export interface NotificationSettings { 'challenges.enabled': boolean;''
    'challenges.newChallenge': boolean;''
    'challenges.challengeComplete': boolean;''
    'challenges.dailyReminder': boolean;''
    'challenges.weeklyReminder': boolean;''
    'achievements.enabled': boolean;''
    'achievements.unlocked': boolean;''
    'achievements.progress': boolean;''
    'achievements.rare': boolean;''
    'leaderboard.enabled': boolean;''
    'leaderboard.newRecord': boolean;''
    'leaderboard.rankChange': boolean;''
    'system.enabled': boolean;''
    'system.updates': boolean;''
    'system.maintenance': boolean; }
}

export interface PrivacySettings { dataCollection: boolean,
    analytics: boolean,
    crashReports: boolean }
}

export interface DefaultSettings { masterVolume: number,
    sfxVolume: number,
    bgmVolume: number,
    isMuted: boolean,
    language: string,
    quality: QualitySetting,
    accessibility: AccessibilitySettings,
    controls: ControlsSettings,
    keyboardShortcuts: KeyboardShortcuts,
    ui: UISettings,
    social: SocialSettings,
    notifications: NotificationSettings,
    privacy: PrivacySettings
    }
}

export interface ParsedSettingKey { category: string,
    settingName: string,
    fullKey: string,
    isLegacy: boolean }
}

export interface ValidationResult { isValid: boolean,
    errors: string[] }
}

export interface SettingsCount { total: number,
    categories: number }
}

export interface DataManagerStats { totalSettings: number,
    categoriesCount: number,
    systemLanguage: string,
    defaultsGenerated: boolean,
    structureValid: boolean }
}

export interface LegacyKeyMap { [key: string]: string, }
}
';
// 列挙型
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';''
export type ContrastLevel = 'normal' | 'high' | 'maximum';''
export type AccessibilityProfile = 'default' | 'visual' | 'motor' | 'cognitive' | 'hearing';''
export type QualitySetting = 'auto' | 'low' | 'medium' | 'high' | 'ultra';''
export type SocialPlatform = 'auto' | 'twitter' | 'facebook' | 'native';''
export type ScreenshotQuality = 'low' | 'medium' | 'high';''
export type PrivacyLevel = 'public' | 'friends' | 'private';

export class SettingsDataManager {
    private settingsManager: SettingsManager;
    private configManager: ConfigManager;
    private validationRules: ValidationRules';
'';
    constructor(settingsManager: SettingsManager') {
        this.settingsManager = settingsManager;
        this.configManager = settingsManager.configManager;
        
        // 検証ルール（SettingsValidatorと同期）
    }
    }
        this.validationRules = {' }'
            masterVolume: { type: 'number', min: 0, max: 1 },''
            sfxVolume: { type: 'number', min: 0, max: 1 },''
            bgmVolume: { type: 'number', min: 0, max: 1 }
        };'
        '';
        console.log('[SettingsDataManager] Component initialized');
    }
    
    /**
     * デフォルト設定を生成
     * @returns デフォルト設定オブジェクト
     */
    getDefaultSettings(): DefaultSettings { return { // 音響設定
            masterVolume: 0.7,
            sfxVolume: 0.8,
            bgmVolume: 0.5,
            isMuted: false,
            ;
            // 言語設定
            language: this.detectSystemLanguage(''';
            quality: 'auto',
            
            // アクセシビリティ設定
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                largeText: false,
                screenReader: false,
                colorBlindSupport: false,'';
                fontSize: 'medium','';
                contrastLevel: 'normal',
                keyboardNavigation: true,
                voiceGuidance: false,';
                subtitles: false,'';
                profiles: 'default', };
                importExport: false }
            },
            
            // 操作設定
            controls: { keyboardEnabled: true,
                mouseEnabled: true,
                touchEnabled: true })
            })
            // キーボードショートカット（Issue #170で削除されたもの以外）
            keyboardShortcuts: { ''
                pause: ['Space'],'';
                menu: ['Escape'],')';
                // 注記: fullscreen (KeyF)、mute (KeyM') は削除済み（Issue #170）'
                // これらの機能は設定画面UIから利用できます
                settings: ['KeyS'],'';
                help: ['KeyH', 'F1'] }
            },
            
            // UI設定
            ui: { showFPS: false,
                showDebugInfo: false,
                animationSpeed: 1.0,
                uiScale: 1.0 }
            },
            
            // ソーシャル共有設定
            social: { enableSharing: true,
                autoPromptHighScore: true,
                autoPromptAchievements: true,'';
                defaultPlatform: 'auto', // 'auto', 'twitter', 'facebook', 'native'';
                includeScreenshot: true,'';
                screenshotQuality: 'high', // 'low', 'medium', 'high''';
                privacyLevel: 'public', // 'public', 'friends', 'private''';
                customMessage: '',
                showWatermark: true }
            },
            
            // 通知設定（平坦化構造）
            notifications: { ''
                'challenges.enabled': true,'';
                'challenges.newChallenge': true,'';
                'challenges.challengeComplete': true,'';
                'challenges.dailyReminder': true,'';
                'challenges.weeklyReminder': true,'';
                'achievements.enabled': true,'';
                'achievements.unlocked': true,'';
                'achievements.progress': false,'';
                'achievements.rare': true,'';
                'leaderboard.enabled': true,'';
                'leaderboard.newRecord': true,'';
                'leaderboard.rankChange': false,'';
                'system.enabled': true,'';
                'system.updates': true,'';
                'system.maintenance': true }
            },

            // プライバシー設定
            privacy: { dataCollection: true,
                analytics: true,
                crashReports: true }
            }
        },
    }
    
    /**
     * システム言語を検出
     * @returns 検出された言語コード
     */
    detectSystemLanguage(): string { ''
        const browserLang = navigator.language || (navigator as any').userLanguage || 'en';
        ';
        // 日本語の場合
        if (browserLang.startsWith('ja')') {''
            return 'ja'; }
        }
        ';
        // デフォルトは英語
        return 'en';
    }
    
    /**
     * 設定カテゴリをセットアップ
     * @param category カテゴリ名
     * @param defaultValues デフォルト値
     * @param validationRules 検証ルール
     */
    setupSettingsCategory(category: string, defaultValues: Record<string, any>, validationRules: ValidationRules): void { try {
            // ConfigurationManagerにカテゴリを設定
            for(const [key, value] of Object.entries(defaultValues) { }
                const fullKey = `${category}.${key}`;
                
                // デフォルト値を設定（正しいメソッド名を使用）
                this.configManager.setDefaultValue(fullKey, value);
                
                // カテゴリと設定値を初期化（カテゴリが確実に作成されるようにする）
                this.configManager.set(category, key, value);
                
                // 検証ルールを設定
                if(validationRules[key]) {
                    ';'
                }'
                    this.configManager.setValidationRule(fullKey, validationRules[key]'); }
                }
            }'
            '';
            console.log(`[SettingsDataManager] Category '${category')' setup completed with ${Object.keys(defaultValues}).length} settings`);''
        } catch (error) { ' }'
            console.error(`[SettingsDataManager] Failed to setup category '${category}':`, error);
            throw error;
        }
    }
    
    /**
     * 設定キーを解析
     * @param key 設定キー
     * @returns 解析結果 {category, settingName, fullKey}'
     */''
    parseSettingKey(key: string'): ParsedSettingKey { ''
        const parts = key.split('.');'
        '';
        if(parts.length === 1') {'
            '';
            // レガシーキー形式（例: 'masterVolume'）'
            return { ''
                category: 'legacy',
                settingName: key,
        }
                fullKey: key, };
                isLegacy: true }'
            };''
        } else if (parts.length === 2') { ''
            // 新しい形式（例: 'audio.masterVolume'）
            return { category: parts[0],
                settingName: parts[1],
                fullKey: key, };
                isLegacy: false }
            },'
        } else {  ''
            // ネストされた形式（例: 'accessibility.highContrast'）'
            return { category: parts[0],''
                settingName: parts.slice(1').join('.'), }
                fullKey: key, };
                isLegacy: false }
            },
        }
    }
    
    /**
     * レガシー値を取得（後方互換性のため）
     * @param key レガシーキー
     * @returns 設定値'
     */''
    getLegacyValue(key: string'): any { // レガシーキーを新しい形式にマッピング
        const legacyKeyMap: LegacyKeyMap = {''
            masterVolume: 'audio.masterVolume','';
            sfxVolume: 'audio.sfxVolume','';
            bgmVolume: 'audio.bgmVolume','';
            isMuted: 'audio.isMuted','';
            language: 'ui.language','';
            quality: 'ui.quality','';
            showFPS: 'ui.showFPS','';
            showDebugInfo: 'ui.showDebugInfo','';
            animationSpeed: 'ui.animationSpeed','';
            uiScale: 'ui.uiScale' }
        },
        
        const newKey = legacyKeyMap[key];
        if (newKey) { return this.configManager.get(newKey); }
        }
        
        // マッピングがない場合は直接アクセス
        return this.configManager.get(key);
    }
    
    /**
     * 設定のデフォルト値を取得
     * @param key 設定キー
     * @returns デフォルト値
     */
    getDefaultValue(key: string): any { const parsed = this.parseSettingKey(key);
        
        if(parsed.isLegacy) {
        
            // レガシーキーの場合はレガシー値を取得
            const legacyValue = this.getLegacyValue(key);
            if (legacyValue !== undefined) {
        
        }
                return legacyValue; }
            }
        }
        
        // ConfigurationManagerからデフォルト値を取得
        return this.configManager.getDefault(key);
    }
    
    /**
     * 設定をマージ
     * @param defaultSettings デフォルト設定
     * @param loadedSettings 読み込まれた設定
     * @returns マージされた設定
     */''
    mergeSettings(defaultSettings: Record<string, any>, loadedSettings: Record<string, any>'): Record<string, any> { ''
        if (!loadedSettings || typeof loadedSettings !== 'object') { }
            return { ...defaultSettings };
        }
        
        const merged = { ...defaultSettings };
        
        // 深いマージを実行
        for(const [key, value] of Object.entries(loadedSettings) {
            '';
            if (key in defaultSettings') {''
                if (typeof value === 'object' && value !== null && '';
                    typeof defaultSettings[key] === 'object' && defaultSettings[key] !== null &&;
                    !Array.isArray(value) && !Array.isArray(defaultSettings[key]) {
                    // オブジェクトの場合は再帰的にマージ
        }
                    merged[key] = this.mergeSettings(defaultSettings[key], value); }
                } else {  // プリミティブ値の場合は上書き }
                    merged[key] = value; }
                }
            }
        }
        
        return merged;
    }
    
    /**
     * 設定データの整合性を検証
     * @param settings 設定オブジェクト
     * @returns 検証結果 {isValid, errors}
     */''
    validateSettingsStructure(settings: any'): ValidationResult { const errors: string[] = [],''
        const requiredCategories = ['accessibility', 'controls', 'ui', 'social', 'notifications'];'
        '';
        if(!settings || typeof settings !== 'object'') {'
            ';'
        }'
            errors.push('Settings must be a valid object'); }
            return { isValid: false, errors };
        }
        
        // 必須カテゴリの存在確認
        for (const category of requiredCategories) { if(!(category in settings) {' }'
                errors.push(`Missing required category: ${category)`'});''
            } else if (typeof settings[category] !== 'object' || settings[category] === null') { ' }'
                errors.push(`Category '${category')' must be an object`});
            }
        }
        
        return { isValid: errors.length = == 0 };
            errors }
        };
    }
    
    /**
     * 統計情報を取得
     * @returns データ管理統計
     */
    getStats(): DataManagerStats { const defaultSettings = this.getDefaultSettings();
        const settingsCount = this._countSettings(defaultSettings);
        
        return { totalSettings: settingsCount.total,
            categoriesCount: settingsCount.categories,
            systemLanguage: this.detectSystemLanguage(),
            defaultsGenerated: true, };
            structureValid: true }
        },
    }
    
    /**
     * 設定数を再帰的にカウント
     * @param obj 設定オブジェクト
     * @param categories カテゴリセット
     * @returns カウント結果
     * @private
     */
    private _countSettings(obj: Record<string, any>, categories: Set<string> = new Set(): SettingsCount { let total = 0;'
        '';
        for (const [key, value] of Object.entries(obj)') {''
            if(typeof value === 'object' && value !== null && !Array.isArray(value) {'
                categories.add(key);''
                const subCount = this._countSettings(value, categories');
            }
                total += subCount.total; }
            } else { total++; }
            }
        }
        
        return { total, };
            categories: categories.size }
        },'
    }''
}