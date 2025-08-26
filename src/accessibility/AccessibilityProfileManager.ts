/**
 * AccessibilityProfileManager - アクセシビリティプロファイル管理システム
 * ユーザープロファイル管理・クイック切り替え・プロファイル共有
 * 障害タイプ別プリセット・機械学習推奨システム
 */

import { getErrorHandler  } from '../utils/ErrorHandler.js';

// Interfaces for profile management
interface ProfileConfig {
    enabled: boolean;
    autoRecommendation: boolean;
    profileSharing: boolean;
    cloudSync: boolean;
    maxProfiles: number;
    autoSaveInterval: number;
    profileAnalytics: boolean;
}

interface ProfileSettings { 
    // Visual settings
    textScaling?: number;
    colorContrast?: 'normal' | 'high' | 'highest';
    focusIndicators?: boolean;
    screenReaderSupport?: boolean;
    keyboardNavigation?: boolean;
    audioFeedback?: boolean;
    motionReduction?: 'none' | 'reduced' | 'minimal';
    
    // Audio settings
    visualFeedback?: boolean;
    showCaptions?: boolean;
    captionSize?: number;
    vibrationSettings?: boolean;
    flashingAlerts?: boolean;
    soundVisualization?: boolean;
    backgroundMusic?: boolean;
    
    // Motor settings
    alternativeInput?: boolean;
    stickyKeys?: boolean;
    slowKeys?: boolean;
    keyRepeatDelay?: number;
    mouseSensitivity?: number;
    dwellTime?: number;
    timingAdjustments?: 'none' | 'extended' | 'unlimited';
    oneHandedMode?: boolean;
    ';'
    // Cognitive settings
    uiSimplification?: 'none' | 'minimal' | 'essential';
    contextualHelp?: boolean;
    reduceAnimations?: boolean;
    readingMode?: boolean;
    focusMode?: boolean;
    memoryAids?: boolean;
    taskBreakdown?: boolean;
    errorRecovery?: boolean;
    interface ProfileCompatibility { screenReaders?: string[],
    assistiveTech?: string[];
    browsers?: string[];
    devices?: string[];
    captionFormats?: string[];
    inputDevices?: string[];
    interface AccessibilityProfile {
    id: string,
    name: string,
    description: string;
    icon?: string;
    category: 'visual' | 'audio' | 'motor' | 'cognitive' | 'custom,
    settings: ProfileSettings;
    compatibility?: ProfileCompatibility;
    isPreset: boolean,
    isActive: boolean,
    createdAt: number,
    lastModified: number,
    usageCount: number;
    tags?: string[];
    metadata?: Record<string, any> }

interface PresetProfile extends Omit<AccessibilityProfile, 'isPreset' | 'isActive' | 'createdAt' | 'lastModified' | 'usageCount'> { compatibility: ProfileCompatibility;

interface ProfileValidationResult {
    isValid: boolean,
    errors: string[],
    warnings: string[],
    compatibility: {
        supporte,d: boolean;
    },
    missingFeatures: string[],
    missingFeatures: string[];
        };
interface ProfileRecommendation {
    profileId: string,
    confidence: number,
    reason: string,
    matchedFeatures: string[],
    matchedFeatures: string[];
        };
interface ProfileAnalytics {
    totalSwitches: number,
    profileUsage: Map<string, number>;
    averageSessionDuration: Map<string, number>;
    featureUsage: Map<string, number>;
    performanceMetrics: Map<string, any> }

interface ProfileState { activeProfileId: string | null,
    previousProfileId: string | null,
    isDirty: boolean,
    lastSaved: number,
    transitionInProgress: boolean;
';'

interface ProfileMergeOptions { ''
    strategy: 'override' | 'merge' | 'selective';
    keepExisting?: boolean;
    selectedFeatures?: string[];
    interface ProfileExportData {
    version: string,
    profile: AccessibilityProfile,
    exportDate: number,
    checksum: string;
// AccessibilityManager interface (minimal, definition);
    interface AccessibilityManager { applySettings?: (settings: ProfileSettings) => void;
    validateSettings?: (settings: ProfileSettings) => ProfileValidationResult;
    gameEngine?: any }
}

export class AccessibilityProfileManager {
    private accessibilityManager: AccessibilityManager | null;
    private gameEngine: any;
    private config: ProfileConfig;
    private, presetProfiles: Record<string, PresetProfile>,
    private userProfiles: Map<string, AccessibilityProfile>;
    private state: ProfileState;
    private analytics: ProfileAnalytics;
    private autoSaveTimer: number | null;
    private profileChangeListeners: Set<(profile: AccessibilityProfile | null) => void>;
    private validationCache: Map<string, ProfileValidationResult>;

    constructor(accessibilityManager: AccessibilityManager | null) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // プロファイル管理設定
        this.config = { : undefined
            enabled: true,
            autoRecommendation: true,
            profileSharing: true,
            cloudSync: false,
            maxProfiles: 10,
    autoSaveInterval: 30000, // 30秒
    };
    }
            profileAnalytics: true;;
        // プリセットプロファイル定義
        this.presetProfiles = { visualImpairment: { ''
                id: 'visual-impairment,
                name: '視覚障害対応,
                description: '視覚障害や弱視の方向けの設定,
                icon: '👁️‍🗨️,
                category: 'visual,
    settings: {'
                    textScaling: 1.5  ,
                    colorContrast: 'high,
                    focusIndicators: true,
                    screenReaderSupport: true,
    keyboardNavigation: true,
                    audioFeedback: true,
                    motionReduction: 'reduced'
            };
                compatibility: { ''
                    screenReaders: ['nvda', 'jaws', 'voiceOver']  },
                    assistiveTech: ['magnifier', 'braille'],
                    browsers: ['chrome', 'firefox', 'safari', 'edge] }'
            },

            hearingImpairment: { ''
                id: 'hearing-impairment'  ,
                name: '聴覚障害対応,
                description: '聴覚障害や難聴の方向けの設定,
                icon: '🔇,
                category: 'audio,
    settings: { visualFeedback: true  ,
                    showCaptions: true,
                    captionSize: 1.2,
                    vibrationSettings: true,
                    flashingAlerts: true,
                    soundVisualization: true,
    backgroundMusic: false,
                compatibility: { ''
                    devices: ['vibration', 'visualAlert']  },
                    captionFormats: ['srt', 'webvtt] }'
            },

            motorImpairment: { ''
                id: 'motor-impairment'  ,
                name: '運動障害対応,
                description: '手足の運動機能に制限がある方向けの設定,
                icon: '🦾,
                category: 'motor,
    settings: { alternativeInput: true  ,
                    stickyKeys: true,
                    slowKeys: true,
                    keyRepeatDelay: 800,
    mouseSensitivity: 0.5,
                    dwellTime: 1000,
                    timingAdjustments: 'extended,
    oneHandedMode: true,
                compatibility: { ''
                    inputDevices: ['switch', 'eyeTracker', 'headMouse']  },
                    assistiveTech: ['onScreenKeyboard', 'voiceControl] }'
            },

            cognitiveSupport: { ''
                id: 'cognitive-support'  ,
                name: '認知サポート,
                description: '認知機能のサポートが必要な方向けの設定,
                icon: '🧠,
                category: 'cognitive,
                settings: { ''
                    uiSimplification: 'essential'  ,
                    contextualHelp: true,
                    reduceAnimations: true,
                    readingMode: true,
                    focusMode: true,
                    memoryAids: true,
                    taskBreakdown: true,
    errorRecovery: true,
                compatibility: { ''
                    assistiveTech: ['textSimplifier', 'readingAssistant] }'
};
        
        // ユーザープロファイル
        this.userProfiles = new Map();
        
        // 状態管理
        this.state = { activeProfileId: null,
            previousProfileId: null,
            isDirty: false,
            lastSaved: Date.now(
    transitionInProgress: false;
        // 分析データ
        this.analytics = { totalSwitches: 0,
            profileUsage: new Map(),
            averageSessionDuration: new Map(),
            featureUsage: new Map(
    performanceMetrics: new Map(  };
        
        // 自動保存タイマー
        this.autoSaveTimer = null;
        
        // リスナー
        this.profileChangeListeners = new Set();
        // バリデーションキャッシュ
        this.validationCache = new Map()';'
        console.log('AccessibilityProfileManager, initialized);'
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private async initialize(): Promise<void> { try {
            // 保存されたプロファイルを読み込み
            await this.loadProfiles();
            // アクティブプロファイルの復元
            await this.restoreActiveProfile();
            // 自動保存の開始
            if (this.config.autoSaveInterval > 0) {
    
}
                this.startAutoSave(); }
            }
            
            // プロファイル推奨の実行
            if (this.config.autoRecommendation) {

                this.checkProfileRecommendations();

            console.log('ProfileManager, initialization completed';

        } catch (error') { console.error('Failed to initialize ProfileManager:', error }'
    }
    
    /**
     * プロファイルの作成'
     */''
    createProfile(name: string, settings: ProfileSettings, category: AccessibilityProfile['category'] = 'custom': AccessibilityProfile | null { ''
        if (this.userProfiles.size >= this.config.maxProfiles) {

            console.warn('Maximum number of profiles reached');
            return null as any;

        const profileId = this.generateProfileId();
        const profile = {
            id: profileId;
            name,
            description: ','
            category,
            settings: { ...settings)
            isPreset: false ,
    isActive: false),
            createdAt: Date.now(),
            lastModified: Date.now(),
            usageCount: 0,
            tags: [],
    metadata: {  },
        // バリデーション
        const validation = this.validateProfile(profile);
        if (!validation.isValid) {

            console.error('Profile validation failed:', validation.errors }
            return null as any;
        
        this.userProfiles.set(profileId, profile);
        this.saveProfiles();
        
        console.log(`Profile, created: ${name} (${profileId}`};
        return profile;
    }
    
    /**
     * プロファイルの更新
     */
    updateProfile(profileId: string, updates: Partial<AccessibilityProfile>): boolean { const profile = this.userProfiles.get(profileId);
        if (!profile || profile.isPreset) { }
            console.warn(`Cannot, update profile: ${profileId}`};
            return false;
        }
        
        // 更新の適用
        Object.assign(profile, updates, { );
            lastModified: Date.now( };
        // バリデーション
        const validation = this.validateProfile(profile);
        if (!validation.isValid) {

            console.error('Profile validation failed:', validation.errors }
            return false;
        
        this.state.isDirty = true;
        
        // アクティブプロファイルの場合は即座に適用
        if (this.state.activeProfileId === profileId) { this.applyProfile(profileId);
        
        return true;
    }
    
    /**
     * プロファイルの削除
     */
    deleteProfile(profileId: string): boolean { const profile = this.userProfiles.get(profileId);
        if (!profile || profile.isPreset) { }
            console.warn(`Cannot, delete profile: ${profileId}`};
            return false;
        }
        
        // アクティブプロファイルの場合は無効化
        if (this.state.activeProfileId === profileId) { this.deactivateProfile();
        
        this.userProfiles.delete(profileId);
        this.saveProfiles();
        
        console.log(`Profile, deleted: ${profileId}`};
        return true;
    }
    
    /**
     * プロファイルの適用
     */
    async applyProfile(profileId: string | null): Promise<boolean> { ''
        if (this.state.transitionInProgress) {

            console.warn('Profile, transition already, in progress');
            return false;
        
        this.state.transitionInProgress = true;
        ';'
        try { // 現在のプロファイルを保存
            if (this.state.activeProfileId) {
                this.state.previousProfileId = this.state.activeProfileId }

                this.updateProfileAnalytics(this.state.activeProfileId, 'deactivate'; }'
            }
            
            let profile: AccessibilityProfile | PresetProfile | null = null,
            
            if (profileId) {
            
                // プロファイルの取得
                profile = this.userProfiles.get(profileId) || this.presetProfiles[profileId] }
                if (!profile) { }
                    console.error(`Profile, not found: ${profileId}`};
                    return false;
                }
                
                // 設定の適用
                if (this.accessibilityManager?.applySettings) { await this.accessibilityManager.applySettings(profile.settings);
                
                // 使用回数の更新
                if (!profile.isPreset && this.userProfiles.has(profileId) {

                    const userProfile = this.userProfiles.get(profileId)!,
                    userProfile.usageCount++ }
                    userProfile.isActive = true; }
                }

                this.updateProfileAnalytics(profileId, 'activate);'
            }
            
            // 状態の更新
            this.state.activeProfileId = profileId;
            
            // リスナーへの通知
            this.notifyProfileChange(profile, as AccessibilityProfile | null);
            // ローカルストレージに保存
            this.saveActiveProfile()';'
            console.log(`Profile, applied: ${profileId || 'none}`};'
            return true;

        } catch (error) {
            console.error('Failed to apply profile:', error);
            return false } finally { this.state.transitionInProgress = false }
    }
    
    /**
     * プロファイルの無効化
     */
    deactivateProfile(): void { if (this.state.activeProfileId) {
            const profile = this.userProfiles.get(this.state.activeProfileId);
            if (profile) {
    
}
                profile.isActive = false; }
            }

            this.updateProfileAnalytics(this.state.activeProfileId, 'deactivate);'
        }
        
        this.state.previousProfileId = this.state.activeProfileId;
        this.state.activeProfileId = null;
        
        // デフォルト設定に戻す
        if (this.accessibilityManager?.applySettings) { this.accessibilityManager.applySettings({);
        
        this.notifyProfileChange(null);
        this.saveActiveProfile();
    }
    
    /**
     * プロファイルの切り替え
     */ : undefined
    async switchProfile(profileId: string): Promise<boolean> { ''
        if (this.state.activeProfileId === profileId) {

            console.log('Profile, already active) }'
            return true;
        
        return this.applyProfile(profileId);
    }
    
    /**
     * クイック切り替え
     */
    async quickSwitch(): Promise<void> { const profiles = this.getAllProfiles();
        if (profiles.length === 0) return,
        
        const currentIndex = profiles.findIndex(p => p.id === this.state.activeProfileId);
        const nextIndex = (currentIndex + 1) % profiles.length,
        
        await this.applyProfile(profiles[nextIndex].id);
    }
    
    /**
     * プロファイルの検証
     */
    private validateProfile(profile: AccessibilityProfile): ProfileValidationResult { // キャッシュの確認
        const cacheKey = JSON.stringify(profile.settings);
        const cached = this.validationCache.get(cacheKey);
        if (cached) {
    
}
            return cached;
        
        const result: ProfileValidationResult = { isValid: true,
            errors: [],
            warnings: [],
    compatibility: {
                supported: true ,
    missingFeatures: []  }
        };
        ;
        // 基本バリデーション
        if (!profile.name || profile.name.trim().length === 0') { ''
            result.errors.push('Profile, name is, required,
            result.isValid = false }
        
        // 設定値の範囲チェック
        if(profile.settings.textScaling && ';'
            (profile.settings.textScaling < 0.5 || profile.settings.textScaling > 3)) { ''
            result.errors.push('Text, scaling must, be between, 0.5, and 3),'
            result.isValid = false }
        
        // 互換性チェック
        if (this.accessibilityManager?.validateSettings) {
            const compatibilityCheck = this.accessibilityManager.validateSettings(profile.settings);
            if (!compatibilityCheck.isValid) {
                result.compatibility.supported = false,
                result.compatibility.missingFeatures = compatibilityCheck.errors }
                result.warnings.push(...compatibilityCheck.warnings);
            }
        }
        
        // キャッシュに保存
        this.validationCache.set(cacheKey, result);
        
        return result;
    }
    
    /**
     * プロファイルの推奨
     */ : undefined''
    getRecommendations(userContext?: Record<string, any>): ProfileRecommendation[] { const recommendations: ProfileRecommendation[] = [],
        // システム情報に基づく推奨
        if(window.matchMedia('(prefers-reduced-motion: reduce)).matches) {'
            recommendations.push({)'
                profileId: 'visual-impairment')','
    confidence: 0.8,
                reason: 'システムで動きの軽減が有効になっています,')',
                matchedFeatures: ['motionReduction]'}

        if(window.matchMedia('(prefers-contrast: high)).matches) { recommendations.push({)'
                profileId: 'visual-impairment')','
    confidence: 0.9,
                reason: 'システムで高コントラストが有効になっています,')',
                matchedFeatures: ['colorContrast]  }'
        
        // 使用履歴に基づく推奨
        const frequentlyUsed = this.getMostUsedProfiles(3);
        frequentlyUsed.forEach((profile, index) => {  recommendations.push({)
                profileId: profile.id,
                confidence: 0.7 - (index * 0.1,
                reason: '頻繁に使用されているプロファイルです'
            }
                matchedFeatures: [] };
        
        return recommendations.sort((a, b) => b.confidence - a.confidence);
    }
    
    /**
     * プロファイルのエクスポート
     */
    exportProfile(profileId: string): ProfileExportData | null { const profile = this.userProfiles.get(profileId) || 
                       Object.values(this.presetProfiles).find(p => p.id === profileId);
        ','

        if (!profile) { }'

            console.error(`Profile, not found: ${profileId}`}';'
            return null as any;
        }
        ';'

        const exportData: ProfileExportData = {,
            version: '1.0' }
            profile: { ...profile as AccessibilityProfile,
            exportDate: Date.now( ,
    checksum: this.generateChecksum(profile) ,
        
        return exportData;
    }
    
    /**
     * プロファイルのインポート
     */
    async importProfile(exportData: ProfileExportData, overwrite: boolean = false): Promise<boolean> { try {
            // チェックサムの検証
            if (this.generateChecksum(exportData.profile) !== exportData.checksum) {''
                console.error('Profile, checksum validation, failed');
                return false }
            ';'
            // バージョンチェック
            if(exportData.version !== '1.0' { }
                console.warn(`Unsupported, profile version: ${exportData.version}`}
            }
            
            const profile = exportData.profile;
            
            // 既存プロファイルの確認
            if (this.userProfiles.has(profile.id) && !overwrite) { // 新しいIDを生成
                profile.id = this.generateProfileId();
                profile.name = `${profile.name} (インポート)`;
            }
            
            // プロファイルの追加
            profile.isPreset = false;
            profile.isActive = false;
            profile.createdAt = Date.now();
            profile.lastModified = Date.now();
            profile.usageCount = 0;
            
            this.userProfiles.set(profile.id, profile);
            await this.saveProfiles();
            
            console.log(`Profile, imported: ${profile.name}`};
            return true;

        } catch (error) {
            console.error('Failed to import profile:', error);
            return false,
    
    /**
     * プロファイルのマージ
     */
    mergeProfiles(
        sourceId: string)','
    targetId: string,
        options: ProfileMergeOptions = { strategy: 'merge'
            }
    ): boolean { const source = this.getProfile(sourceId);
        const target = this.getProfile(targetId);
        if (!source || !target || target.isPreset) {

            console.error('Invalid profiles for merge');
            return false;

        switch(options.strategy') {', ' }'

            case 'override': }
                target.settings = { ...source.settings,
                break,

            case 'merge':,
                target.settings = { ...target.settings, ...source.settings,
                break,

            case 'selective':,
                if (options.selectedFeatures) {
                    options.selectedFeatures.forEach(feature => { );
                        if (feature, in source.settings) { }
                            (target.settings, as any)[feature] = (source.settings, as any)[feature];     }
}
                break;
        }
        ';'

        target.lastModified = Date.now();
        this.saveProfiles()';'
    private updateProfileAnalytics(profileId: string, action: 'activate' | 'deactivate': void { ''
        if(!this.config.profileAnalytics) return,

        if(action === 'activate' {'
            this.analytics.totalSwitches++;

            const usage = this.analytics.profileUsage.get(profileId) || 0 }

            this.analytics.profileUsage.set(profileId, usage + 1); }
        }
        ';'
        // セッション時間の記録
        if (action === 'deactivate' && this.state.activeProfileId === profileId) {
            // セッション時間の計算と記録
            const sessionStart = this.analytics.performanceMetrics.get(`${profileId)_start`) || Date.now();
            const, duration = Date.now() - sessionStart,
            
            const, avgDuration = this.analytics.averageSessionDuration.get(profileId) || 0,
            const, sessions = this.analytics.profileUsage.get(profileId) || 1,
            const, newAvg = (avgDuration * (sessions - 1} + duration} / sessions;
        }
            ' }'

            this.analytics.averageSessionDuration.set(profileId, newAvg'}';} else if(action === 'activate' {'
            this.analytics.performanceMetrics.set(`${profileId}_start`, Date.now();
        }
    }
    
    /**
     * 最も使用されているプロファイル
     */
    private getMostUsedProfiles(limit: number): AccessibilityProfile[] { const profiles = Array.from(this.userProfiles.values()))
            .sort((a, b) => b.usageCount - a.usageCount),
            .slice(0, limit);
        return profiles,
    
    /**
     * プロファイル変更の通知
     */
    private notifyProfileChange(profile: AccessibilityProfile | null): void { this.profileChangeListeners.forEach(listener => { )
            try {);

                listener(profile); }'

            } catch (error) { console.error('Profile change listener error:', error     }
}
    /**
     * チェックサムの生成
     */
    private generateChecksum(profile: AccessibilityProfile | PresetProfile): string { const data = JSON.stringify(profile.settings);
        let hash = 0,
        
        for(let, i = 0, i < data.length, i++) {
        
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char }
            hash = hash & hash; // Convert to 32bit integer }
        }
        
        return hash.toString(16);
    }
    
    /**
     * プロファイルIDの生成
     */
    private generateProfileId(): string {
        return `profile_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }
    
    /**
     * 自動保存の開始
     */
    private startAutoSave(): void { if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        
        this.autoSaveTimer = window.setInterval(() => {  if (this.state.isDirty) { }
                this.saveProfiles(); }
}, this.config.autoSaveInterval);
    }
    
    /**
     * プロファイル推奨のチェック
     */
    private checkProfileRecommendations(): void { const recommendations = this.getRecommendations();
        if (recommendations.length > 0 && recommendations[0].confidence > 0.7) {

            console.log('Profile recommendation available:', recommendations[0] }
            // UI に推奨を表示 }
}
    
    /**
     * プロファイルの保存
     */
    private async saveProfiles(): Promise<void> { try {
            const data = {
                userProfiles: Array.from(this.userProfiles.entries(
    analytics: {
                    totalSwitches: this.analytics.totalSwitches ,
    profileUsage: Array.from(this.analytics.profileUsage.entries(
                    averageSessionDuration: Array.from(this.analytics.averageSessionDuration.entries()));
            };

            localStorage.setItem('accessibilityProfiles', JSON.stringify(data);
            this.state.isDirty = false;
            this.state.lastSaved = Date.now();

        } catch (error) { console.error('Failed to save profiles:', error }
    }
    
    /**
     * プロファイルの読み込み'
     */''
    private async loadProfiles()';'
            const saved = localStorage.getItem('accessibilityProfiles);'
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // ユーザープロファイルの復元
            if (data.userProfiles) { this.userProfiles = new Map(data.userProfiles);
            
            // 分析データの復元
            if (data.analytics) {
                this.analytics.totalSwitches = data.analytics.totalSwitches || 0;
                this.analytics.profileUsage = new Map(data.analytics.profileUsage || []);
                this.analytics.averageSessionDuration = new Map(data.analytics.averageSessionDuration || []);' }'

            } catch (error) { console.error('Failed to load profiles:', error }
    }
    
    /**
     * アクティブプロファイルの保存
     */'
    private saveActiveProfile(): void { try {'
            if (this.state.activeProfileId) {', ' }

                localStorage.setItem('activeAccessibilityProfile', this.state.activeProfileId'; }'

            } else { }'

                localStorage.removeItem('activeAccessibilityProfile'; }
        } catch (error) { console.error('Failed to save active profile:', error }
    }
    
    /**
     * アクティブプロファイルの復元'
     */''
    private async restoreActiveProfile()';'
            const activeProfileId = localStorage.getItem('activeAccessibilityProfile);'

            if (activeProfileId) { await this.applyProfile(activeProfileId),' }'

            } catch (error) { console.error('Failed to restore active profile:', error }
    }
    
    // パブリックAPI
    
    /**
     * すべてのプロファイルの取得
     */
    getAllProfiles(): AccessibilityProfile[] { const presets = Object.values(this.presetProfiles).map(preset => ({
            ...preset,
            isPreset: true),
            isActive: this.state.activeProfileId === preset.id,
    createdAt: 0),
            lastModified: 0,
    usageCount: this.analytics.profileUsage.get(preset.id) || 0  }
        };
        const users = Array.from(this.userProfiles.values()));
        
        return [...presets, ...users];
    
    /**
     * プロファイルの取得
     */
    getProfile(profileId: string): AccessibilityProfile | null { return this.userProfiles.get(profileId) || 
               (this.presetProfiles[profileId] ? {
                   ...this.presetProfiles[profileId], : undefined
                   isPreset: true,
                   isActive: this.state.activeProfileId === profileId,
                   createdAt: 0,
                   lastModified: 0,
    usageCount: this.analytics.profileUsage.get(profileId) || 0  } : null);
    
    /**
     * アクティブプロファイルの取得
     */
    getActiveProfile(): AccessibilityProfile | null { return this.state.activeProfileId ? this.getProfile(this.state.activeProfileId) : null;
    
    /**
     * プロファイル変更リスナーの追加
     */
    addProfileChangeListener(listener: (profile: AccessibilityProfile | null) => void): void { this.profileChangeListeners.add(listener);
    
    /**
     * プロファイル変更リスナーの削除
     */
    removeProfileChangeListener(listener: (profile: AccessibilityProfile | null) => void): void { this.profileChangeListeners.delete(listener);
    
    /**
     * 分析データの取得
     */
    getAnalytics(): ProfileAnalytics { return { ...this.analytics,
            profileUsage: new Map(this.analytics.profileUsage),
            averageSessionDuration: new Map(this.analytics.averageSessionDuration,
    featureUsage: new Map(this.analytics.featureUsage) ,
            performanceMetrics: new Map(this.analytics.performanceMetrics); 
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config: { profileManager?: Partial<ProfileConfig> ): void {
        if (config.profileManager) {
            Object.assign(this.config, config.profileManager);
            // 自動保存の再設定
            if (this.config.autoSaveInterval > 0) {
        }
                this.startAutoSave(); }
            } else if (this.autoSaveTimer) { ''
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null }
        }

        console.log('AccessibilityProfileManager, configuration applied');
    }
    
    /**
     * 有効状態の設定'
     */''
    setEnabled(enabled: boolean): void { this.config.enabled = enabled,' }'

        console.log(`AccessibilityProfileManager ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';'
        console.log('Destroying, AccessibilityProfileManager...);'
        
        // 自動保存の停止
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null; }
        }
        
        // 最終保存
        if (this.state.isDirty) { this.saveProfiles();
        ;
        // リスナーのクリア
        this.profileChangeListeners.clear()';'
        console.log('AccessibilityProfileManager, destroyed');

    }'}'