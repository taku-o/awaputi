import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * アクセシビリティ設定統合管理クラス
 * SettingsManagerとアクセシビリティシステムを統合し、
 * リアルタイム設定更新とプロファイル管理を提供
 */
export class AccessibilitySettingsIntegrator {
    constructor(settingsManager, accessibilityManager) {
        this.settingsManager = settingsManager;
        this.accessibilityManager = accessibilityManager;
        
        this.state = {
            initialized: false,
            syncEnabled: true,
            profilesAvailable: []
        };
        
        // アクセシビリティ設定のデフォルト値
        this.defaultAccessibilitySettings = {
            // 視覚アクセシビリティ
            visual: {
                highContrast: {
                    enabled: false,
                    level: 'aa',
                    customColors: null
                },
                colorBlindness: {
                    enabled: false,
                    type: 'none',
                    usePatterns: true,
                    useShapes: true
                },
                motion: {
                    reduced: false,
                    level: 'none',
                    alternativeEffects: true
                },
                textScaling: {
                    enabled: false,
                    scale: 1.0,
                    minScale: 0.8,
                    maxScale: 2.0
                }
            },
            
            // 音響アクセシビリティ
            audio: {
                visualFeedback: {
                    enabled: false,
                    intensity: 'medium',
                    type: 'flash'
                },
                captions: {
                    enabled: false,
                    position: 'bottom',
                    size: 'medium',
                    background: true
                },
                vibration: {
                    enabled: false,
                    intensity: 0.5,
                    customPatterns: new Map()
                }
            },
            
            // キーボードアクセシビリティ
            keyboard: {
                navigationMode: '2d',
                focusVisible: true,
                skipLinks: true,
                customShortcuts: new Map()
            },
            
            // 認知アクセシビリティ
            cognitive: {
                simplification: {
                    enabled: false,
                    level: 'basic'
                },
                help: {
                    contextual: true,
                    tooltips: true,
                    tutorials: true
                }
            }
        };
        
        // 設定プロファイル
        this.accessibilityProfiles = new Map([
            ['default', this.defaultAccessibilitySettings],
            ['high-contrast', this.createHighContrastProfile()],
            ['motion-sensitive', this.createMotionSensitiveProfile()],
            ['color-blind-friendly', this.createColorBlindFriendlyProfile()],
            ['hearing-impaired', this.createHearingImpairedProfile()],
            ['motor-impaired', this.createMotorImpairedProfile()]
        ]);
        
        console.log('AccessibilitySettingsIntegrator initialized');
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            console.log('Initializing accessibility settings integration...');
            
            // 設定システムとの統合
            await this.integrateWithSettingsSystem();
            
            // 既存設定の読み込み
            await this.loadExistingSettings();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // プロファイルの初期化
            await this.initializeProfiles();
            
            this.state.initialized = true;
            console.log('Accessibility settings integration initialized successfully');
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'initialize',
                component: 'AccessibilitySettingsIntegrator'
            });
            return false;
        }
    }
    
    /**
     * 設定システムとの統合
     */
    async integrateWithSettingsSystem() {
        if (!this.settingsManager) {
            console.warn('SettingsManager not available, using local storage fallback');
            return;
        }
        
        // アクセシビリティ設定セクションを登録
        this.settingsManager.registerSection?.('accessibility', {
            name: 'アクセシビリティ',
            description: 'アクセシビリティ機能の設定',
            icon: '♿',
            priority: 10
        });
        
        // 設定項目の登録
        this.registerAccessibilitySettings();
    }
    
    /**
     * アクセシビリティ設定項目の登録
     */
    registerAccessibilitySettings() {
        const settings = [
            // 視覚設定
            {
                key: 'accessibility.visual.highContrast.enabled',
                name: 'ハイコントラストモード',
                type: 'boolean',
                default: false,
                description: '画面要素を高コントラストで表示'
            },
            {
                key: 'accessibility.visual.colorBlindness.enabled',
                name: '色覚異常サポート',
                type: 'boolean',
                default: false,
                description: '色覚異常に配慮した表示'
            },
            {
                key: 'accessibility.visual.colorBlindness.type',
                name: '色覚異常タイプ',
                type: 'select',
                options: ['none', 'protanopia', 'deuteranopia', 'tritanopia'],
                default: 'none',
                description: '対応する色覚異常のタイプ'
            },
            {
                key: 'accessibility.visual.motion.reduced',
                name: 'アニメーション軽減',
                type: 'boolean',
                default: false,
                description: 'アニメーションと動きを軽減'
            },
            {
                key: 'accessibility.visual.textScaling.scale',
                name: 'テキストサイズ',
                type: 'range',
                min: 0.8,
                max: 2.0,
                step: 0.1,
                default: 1.0,
                description: 'テキストの拡大率'
            },
            
            // 音響設定
            {
                key: 'accessibility.audio.visualFeedback.enabled',
                name: '視覚的音響フィードバック',
                type: 'boolean',
                default: false,
                description: '音響効果を視覚的に表示'
            },
            {
                key: 'accessibility.audio.vibration.enabled',
                name: '触覚フィードバック',
                type: 'boolean',
                default: false,
                description: 'バイブレーション機能を使用'
            },
            {
                key: 'accessibility.audio.vibration.intensity',
                name: '触覚強度',
                type: 'range',
                min: 0.0,
                max: 1.0,
                step: 0.1,
                default: 0.5,
                description: 'バイブレーションの強度'
            },
            
            // キーボード設定
            {
                key: 'accessibility.keyboard.focusVisible',
                name: 'フォーカス表示',
                type: 'boolean',
                default: true,
                description: 'キーボードフォーカスを視覚的に表示'
            },
            {
                key: 'accessibility.keyboard.navigationMode',
                name: 'ナビゲーションモード',
                type: 'select',
                options: ['1d', '2d', 'custom'],
                default: '2d',
                description: 'キーボードナビゲーションのモード'
            }
        ];
        
        // 各設定項目を登録
        settings.forEach(setting => {
            this.settingsManager.registerSetting?.(setting.key, {
                name: setting.name,
                type: setting.type,
                default: setting.default,
                description: setting.description,
                options: setting.options,
                min: setting.min,
                max: setting.max,
                step: setting.step,
                onChange: (value) => this.handleSettingChange(setting.key, value)
            });
        });
        
        console.log('Accessibility settings registered');
    }
    
    /**
     * 既存設定の読み込み
     */
    async loadExistingSettings() {
        try {
            let currentSettings = {};
            
            if (this.settingsManager) {
                // SettingsManagerから設定を読み込み
                currentSettings = this.settingsManager.getAll?.() || {};
            }
            
            // アクセシビリティ設定を統合
            const accessibilitySettings = this.mergeSettings(
                this.defaultAccessibilitySettings,
                currentSettings.accessibility || {}
            );
            
            // AccessibilityManagerに設定を適用
            if (this.accessibilityManager) {
                await this.accessibilityManager.applyConfiguration({
                    visual: accessibilitySettings.visual,
                    audio: accessibilitySettings.audio,
                    keyboard: accessibilitySettings.keyboard,
                    cognitive: accessibilitySettings.cognitive
                });
            }
            
            console.log('Existing accessibility settings loaded and applied');
        } catch (error) {
            console.warn('Failed to load existing settings:', error);
        }
    }
    
    /**
     * 設定のマージ
     */
    mergeSettings(defaultSettings, userSettings) {
        const merged = JSON.parse(JSON.stringify(defaultSettings));
        
        const mergeObject = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeObject(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        
        mergeObject(merged, userSettings);
        return merged;
    }
    
    /**
     * 設定変更の処理
     */
    async handleSettingChange(settingKey, newValue) {
        if (!this.state.syncEnabled) return;
        
        try {
            console.log(`Accessibility setting changed: ${settingKey} = ${newValue}`);
            
            // 設定キーを解析してアクセシビリティ設定を更新
            const keyParts = settingKey.split('.');
            if (keyParts[0] !== 'accessibility') return;
            
            // AccessibilityManagerの設定を更新
            await this.updateAccessibilityConfiguration(keyParts.slice(1), newValue);
            
            // 設定変更を保存
            await this.saveSettings();
            
            // 設定変更イベントを発行
            this.emitSettingChangeEvent(settingKey, newValue);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'handleSettingChange',
                settingKey,
                newValue
            });
        }
    }
    
    /**
     * アクセシビリティ設定の更新
     */
    async updateAccessibilityConfiguration(keyPath, value) {
        if (!this.accessibilityManager) return;
        
        const config = this.accessibilityManager.getConfiguration();
        
        // 設定パスに従って値を更新
        let target = config;
        for (let i = 0; i < keyPath.length - 1; i++) {
            if (!target[keyPath[i]]) target[keyPath[i]] = {};
            target = target[keyPath[i]];
        }
        target[keyPath[keyPath.length - 1]] = value;
        
        // 設定を適用
        await this.accessibilityManager.applyConfiguration(config);
    }
    
    /**
     * アクセシビリティプロファイルの作成
     */
    createHighContrastProfile() {
        return {
            ...this.defaultAccessibilitySettings,
            visual: {
                ...this.defaultAccessibilitySettings.visual,
                highContrast: {
                    enabled: true,
                    level: 'aaa',
                    customColors: {
                        background: '#000000',
                        foreground: '#FFFFFF',
                        accent: '#FFFF00'
                    }
                },
                textScaling: {
                    enabled: true,
                    scale: 1.2
                }
            }
        };
    }
    
    createMotionSensitiveProfile() {
        return {
            ...this.defaultAccessibilitySettings,
            visual: {
                ...this.defaultAccessibilitySettings.visual,
                motion: {
                    reduced: true,
                    level: 'minimal',
                    alternativeEffects: true
                }
            }
        };
    }
    
    createColorBlindFriendlyProfile() {
        return {
            ...this.defaultAccessibilitySettings,
            visual: {
                ...this.defaultAccessibilitySettings.visual,
                colorBlindness: {
                    enabled: true,
                    type: 'deuteranopia',
                    usePatterns: true,
                    useShapes: true
                }
            }
        };
    }
    
    createHearingImpairedProfile() {
        return {
            ...this.defaultAccessibilitySettings,
            audio: {
                ...this.defaultAccessibilitySettings.audio,
                visualFeedback: {
                    enabled: true,
                    intensity: 'high',
                    type: 'flash'
                },
                captions: {
                    enabled: true,
                    position: 'bottom',
                    size: 'large',
                    background: true
                },
                vibration: {
                    enabled: true,
                    intensity: 0.8
                }
            }
        };
    }
    
    createMotorImpairedProfile() {
        return {
            ...this.defaultAccessibilitySettings,
            keyboard: {
                ...this.defaultAccessibilitySettings.keyboard,
                navigationMode: '1d',
                focusVisible: true,
                skipLinks: true
            },
            cognitive: {
                ...this.defaultAccessibilitySettings.cognitive,
                simplification: {
                    enabled: true,
                    level: 'basic'
                },
                help: {
                    contextual: true,
                    tooltips: true,
                    tutorials: true
                }
            }
        };
    }
    
    /**
     * プロファイルの適用
     */
    async applyProfile(profileName) {
        const profile = this.accessibilityProfiles.get(profileName);
        if (!profile) {
            console.warn(`Unknown accessibility profile: ${profileName}`);
            return false;
        }
        
        try {
            // プロファイル設定をSettingsManagerに適用
            if (this.settingsManager) {
                await this.applyProfileToSettings(profile);
            }
            
            // AccessibilityManagerに直接適用
            if (this.accessibilityManager) {
                await this.accessibilityManager.applyConfiguration(profile);
            }
            
            console.log(`Accessibility profile applied: ${profileName}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'applyProfile',
                profileName
            });
            return false;
        }
    }
    
    /**
     * プロファイル設定をSettingsManagerに適用
     */
    async applyProfileToSettings(profile) {
        const flattenSettings = (obj, prefix = '') => {
            const flattened = {};
            for (const key in obj) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Map)) {
                    Object.assign(flattened, flattenSettings(obj[key], newKey));
                } else {
                    flattened[newKey] = obj[key];
                }
            }
            return flattened;
        };
        
        const flatProfile = flattenSettings(profile, 'accessibility');
        
        for (const [key, value] of Object.entries(flatProfile)) {
            this.settingsManager.set?.(key, value);
        }
    }
    
    /**
     * カスタムプロファイルの作成
     */
    createCustomProfile(name, baseProfile = 'default') {
        const base = this.accessibilityProfiles.get(baseProfile);
        if (!base) {
            console.warn(`Unknown base profile: ${baseProfile}`);
            return null;
        }
        
        const customProfile = JSON.parse(JSON.stringify(base));
        this.accessibilityProfiles.set(name, customProfile);
        
        console.log(`Custom accessibility profile created: ${name}`);
        return customProfile;
    }
    
    /**
     * プロファイルのエクスポート
     */
    exportProfile(profileName) {
        const profile = this.accessibilityProfiles.get(profileName);
        if (!profile) return null;
        
        return {
            name: profileName,
            version: '1.0',
            created: new Date().toISOString(),
            profile: profile
        };
    }
    
    /**
     * プロファイルのインポート
     */
    importProfile(profileData) {
        try {
            if (!profileData.name || !profileData.profile) {
                throw new Error('Invalid profile data format');
            }
            
            this.accessibilityProfiles.set(profileData.name, profileData.profile);
            console.log(`Accessibility profile imported: ${profileData.name}`);
            return true;
        } catch (error) {
            console.warn('Failed to import profile:', error);
            return false;
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // SettingsManagerからの設定変更通知
        if (this.settingsManager) {
            this.settingsManager.addEventListener?.('settingChanged', (event) => {
                if (event.key.startsWith('accessibility.')) {
                    this.handleSettingChange(event.key, event.newValue);
                }
            });
        }
        
        // AccessibilityManagerからの設定変更通知
        if (this.accessibilityManager) {
            this.accessibilityManager.addEventListener?.('configurationApplied', (event) => {
                this.handleAccessibilityConfigChange(event.config);
            });
        }
    }
    
    /**
     * アクセシビリティ設定変更の処理
     */
    handleAccessibilityConfigChange(config) {
        // 設定をSettingsManagerに同期
        if (this.settingsManager && this.state.syncEnabled) {
            this.syncConfigToSettings(config);
        }
    }
    
    /**
     * 設定のSettingsManagerへの同期
     */
    syncConfigToSettings(config) {
        const flatten = (obj, prefix = 'accessibility') => {
            for (const key in obj) {
                const settingKey = `${prefix}.${key}`;
                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Map)) {
                    flatten(obj[key], settingKey);
                } else {
                    this.settingsManager.set?.(settingKey, obj[key]);
                }
            }
        };
        
        flatten(config);
    }
    
    /**
     * プロファイルの初期化
     */
    async initializeProfiles() {
        this.state.profilesAvailable = Array.from(this.accessibilityProfiles.keys());
        console.log('Available accessibility profiles:', this.state.profilesAvailable);
    }
    
    /**
     * 設定変更イベントの発行
     */
    emitSettingChangeEvent(settingKey, newValue) {
        // カスタムイベントを発行
        const event = new CustomEvent('accessibilitySettingChanged', {
            detail: { key: settingKey, value: newValue }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 設定の保存
     */
    async saveSettings() {
        if (this.settingsManager) {
            await this.settingsManager.save?.();
        }
    }
    
    /**
     * 利用可能なプロファイル一覧の取得
     */
    getAvailableProfiles() {
        return Array.from(this.accessibilityProfiles.keys()).map(name => ({
            name,
            displayName: this.getProfileDisplayName(name),
            description: this.getProfileDescription(name)
        }));
    }
    
    /**
     * プロファイル表示名の取得
     */
    getProfileDisplayName(profileName) {
        const displayNames = {
            'default': 'デフォルト',
            'high-contrast': 'ハイコントラスト',
            'motion-sensitive': 'モーション軽減',
            'color-blind-friendly': '色覚異常対応',
            'hearing-impaired': '聴覚障害対応',
            'motor-impaired': '運動障害対応'
        };
        
        return displayNames[profileName] || profileName;
    }
    
    /**
     * プロファイル説明の取得
     */
    getProfileDescription(profileName) {
        const descriptions = {
            'default': '標準的なアクセシビリティ設定です',
            'high-contrast': '高コントラスト表示でより見やすくします',
            'motion-sensitive': 'アニメーションを軽減し、動きに敏感な方に配慮します',
            'color-blind-friendly': '色覚異常の方に配慮した色使いとパターンを使用します',
            'hearing-impaired': '聴覚障害の方向けに視覚的フィードバックを強化します',
            'motor-impaired': '運動障害の方向けにキーボード操作を最適化します'
        };
        
        return descriptions[profileName] || 'カスタムプロファイルです';
    }
    
    /**
     * 現在の設定状態の取得
     */
    getCurrentSettings() {
        if (this.accessibilityManager) {
            return this.accessibilityManager.getConfiguration();
        }
        return this.defaultAccessibilitySettings;
    }
    
    /**
     * 同期の有効/無効切り替え
     */
    setSyncEnabled(enabled) {
        this.state.syncEnabled = enabled;
        console.log(`Settings sync ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return {
            component: 'AccessibilitySettingsIntegrator',
            state: { ...this.state },
            profilesCount: this.accessibilityProfiles.size,
            availableProfiles: this.getAvailableProfiles(),
            currentSettings: this.getCurrentSettings(),
            integrationStatus: {
                settingsManager: !!this.settingsManager,
                accessibilityManager: !!this.accessibilityManager,
                initialized: this.state.initialized,
                syncEnabled: this.state.syncEnabled
            }
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AccessibilitySettingsIntegrator...');
        
        // イベントリスナーの削除
        if (this.settingsManager) {
            this.settingsManager.removeEventListener?.('settingChanged');
        }
        
        if (this.accessibilityManager) {
            this.accessibilityManager.removeEventListener?.('configurationApplied');
        }
        
        // 参照のクリア
        this.settingsManager = null;
        this.accessibilityManager = null;
        this.accessibilityProfiles.clear();
        
        this.state.initialized = false;
        console.log('AccessibilitySettingsIntegrator destroyed');
    }
}