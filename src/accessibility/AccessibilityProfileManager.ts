/**
 * AccessibilityProfileManager - アクセシビリティプロファイル管理システム
 * ユーザープロファイル管理・クイック切り替え・プロファイル共有
 * 障害タイプ別プリセット・機械学習推奨システム
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

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
    
    // Cognitive settings
    uiSimplification?: 'none' | 'minimal' | 'essential';
    contextualHelp?: boolean;
    reduceAnimations?: boolean;
    readingMode?: boolean;
    focusMode?: boolean;
    memoryAids?: boolean;
    taskBreakdown?: boolean;
    errorRecovery?: boolean;
}

interface ProfileCompatibility {
    screenReaders?: string[];
    assistiveTech?: string[];
    browsers?: string[];
    devices?: string[];
    captionFormats?: string[];
    inputDevices?: string[];
}

interface AccessibilityProfile {
    id: string;
    name: string;
    description: string;
    icon?: string;
    category: 'visual' | 'audio' | 'motor' | 'cognitive' | 'custom';
    settings: ProfileSettings;
    compatibility?: ProfileCompatibility;
    isPreset: boolean;
    isActive: boolean;
    createdAt: number;
    lastModified: number;
    usageCount: number;
    tags?: string[];
    metadata?: Record<string, any>;
}

interface PresetProfile extends Omit<AccessibilityProfile, 'isPreset' | 'isActive' | 'createdAt' | 'lastModified' | 'usageCount'> {
    compatibility: ProfileCompatibility;
}

interface ProfileState {
    activeProfileId: string | null;
    profiles: AccessibilityProfile[];
    presets: Record<string, PresetProfile>;
    recommendations: AccessibilityProfile[];
}

interface ProfileAnalytics {
    profileSwitches: number;
    settingsModified: number;
    averageSessionDuration: number;
    mostUsedSettings: Record<string, number>;
    effectiveness: Record<string, number>;
}

interface ProfileSharingData {
    profileId: string;
    name: string;
    description: string;
    settings: ProfileSettings;
    compatibility: ProfileCompatibility;
    tags: string[];
    author?: string;
    rating?: number;
}

interface MLRecommendation {
    profileId: string;
    confidence: number;
    reason: string;
    basedOn: string[];
}

export class AccessibilityProfileManager {
    private config: ProfileConfig;
    private state: ProfileState;
    private analytics: ProfileAnalytics;
    private autoSaveTimer: number | null;
    private accessibilityManager: any;
    private gameEngine: any;
    private errorHandler: any;

    constructor(accessibilityManager: any) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // プロファイル管理設定
        this.config = {
            enabled: true,
            autoRecommendation: true,
            profileSharing: true,
            cloudSync: false,
            maxProfiles: 10,
            autoSaveInterval: 30000, // 30秒
            profileAnalytics: true
        };
        
        // プリセットプロファイル定義
        const presetProfiles: Record<string, PresetProfile> = {
            visualImpairment: {
                id: 'visual-impairment',
                name: '視覚障害対応',
                description: '視覚障害や弱視の方向けの設定',
                icon: '👁️‍🗨️',
                category: 'visual',
                settings: {
                    textScaling: 1.5,
                    colorContrast: 'high',
                    focusIndicators: true,
                    screenReaderSupport: true,
                    keyboardNavigation: true,
                    audioFeedback: true,
                    motionReduction: 'reduced'
                },
                compatibility: {
                    screenReaders: ['nvda', 'jaws', 'voiceOver'],
                    assistiveTech: ['magnifier', 'braille'],
                    browsers: ['chrome', 'firefox', 'safari', 'edge']
                }
            },
            
            hearingImpairment: {
                id: 'hearing-impairment',
                name: '聴覚障害対応',
                description: '聴覚障害や難聴の方向けの設定',
                icon: '🔇',
                category: 'audio',
                settings: {
                    visualFeedback: true,
                    showCaptions: true,
                    captionSize: 1.2,
                    vibrationSettings: true,
                    flashingAlerts: true,
                    soundVisualization: true,
                    backgroundMusic: false
                },
                compatibility: {
                    devices: ['vibration', 'visualAlert'],
                    captionFormats: ['srt', 'webvtt']
                }
            },
            
            motorImpairment: {
                id: 'motor-impairment',
                name: '運動障害対応',
                description: '手足の運動機能に制限がある方向けの設定',
                icon: '🦾',
                category: 'motor',
                settings: {
                    alternativeInput: true,
                    stickyKeys: true,
                    slowKeys: true,
                    keyRepeatDelay: 800,
                    mouseSensitivity: 0.5,
                    dwellTime: 1000,
                    timingAdjustments: 'extended',
                    oneHandedMode: true
                },
                compatibility: {
                    inputDevices: ['switch', 'eyeTracker', 'headMouse'],
                    assistiveTech: ['onScreenKeyboard', 'voiceControl']
                }
            },
            
            cognitiveSupport: {
                id: 'cognitive-support',
                name: '認知サポート',
                description: '認知機能のサポートが必要な方向けの設定',
                icon: '🧠',
                category: 'cognitive',
                settings: {
                    uiSimplification: 'essential',
                    contextualHelp: true,
                    reduceAnimations: true,
                    readingMode: true,
                    focusMode: true,
                    memoryAids: true,
                    taskBreakdown: true,
                    errorRecovery: true
                },
                compatibility: {
                    browsers: ['chrome', 'firefox', 'safari', 'edge']
                }
            }
        };
        
        // プロファイル状態
        this.state = {
            activeProfileId: null,
            profiles: [],
            presets: presetProfiles,
            recommendations: []
        };
        
        // アナリティクス
        this.analytics = {
            profileSwitches: 0,
            settingsModified: 0,
            averageSessionDuration: 0,
            mostUsedSettings: {},
            effectiveness: {}
        };
        
        // その他の初期化
        this.autoSaveTimer = null;
        this.errorHandler = getErrorHandler();
        
        this.initializeProfiles();
    }

    /**
     * プロファイルシステムの初期化
     */
    initializeProfiles() {
        try {
            // プリセットプロファイルの読み込み
            this.loadPresetProfiles();
            
            // 保存済みプロファイルの読み込み
            this.loadUserProfiles();
            
            // 最後に使用したプロファイルの復元
            this.restoreLastProfile();
            
            // 自動保存の開始
            if (this.config.enabled && this.config.autoSaveInterval > 0) {
                this.startAutoSave();
            }
            
            // 初期推奨プロファイルの生成
            if (this.config.autoRecommendation) {
                this.generateRecommendations();
            }
            
            console.log('AccessibilityProfileManager: 初期化完了');
        } catch (error) {
            console.error('AccessibilityProfileManager: 初期化エラー', error);
            this.errorHandler.logError('プロファイル初期化エラー', error);
        }
    }

    /**
     * プリセットプロファイルの読み込み
     */
    loadPresetProfiles() {
        Object.entries(this.state.presets).forEach(([key, preset]) => {
            const profile: AccessibilityProfile = {
                ...preset,
                isPreset: true,
                isActive: false,
                createdAt: Date.now(),
                lastModified: Date.now(),
                usageCount: 0
            };
            this.state.profiles.push(profile);
        });
    }

    /**
     * ユーザープロファイルの読み込み
     */
    loadUserProfiles() {
        try {
            const savedProfiles = localStorage.getItem('accessibility-profiles');
            if (savedProfiles) {
                const profiles = JSON.parse(savedProfiles);
                profiles.forEach((profile: AccessibilityProfile) => {
                    if (!profile.isPreset) {
                        this.state.profiles.push(profile);
                    }
                });
            }
        } catch (error) {
            console.error('ユーザープロファイル読み込みエラー:', error);
        }
    }

    /**
     * 最後に使用したプロファイルの復元
     */
    restoreLastProfile() {
        try {
            const lastProfileId = localStorage.getItem('last-accessibility-profile');
            if (lastProfileId) {
                const profile = this.state.profiles.find(p => p.id === lastProfileId);
                if (profile) {
                    this.activateProfile(lastProfileId);
                }
            }
        } catch (error) {
            console.error('プロファイル復元エラー:', error);
        }
    }

    /**
     * プロファイルの作成
     */
    createProfile(name: string, settings: ProfileSettings, category: AccessibilityProfile['category'] = 'custom'): AccessibilityProfile | null {
        if (this.state.profiles.length >= this.config.maxProfiles) {
            console.warn('プロファイル数が上限に達しています');
            return null;
        }

        const newProfile: AccessibilityProfile = {
            id: `profile-${Date.now()}`,
            name,
            description: '',
            category,
            settings,
            isPreset: false,
            isActive: false,
            createdAt: Date.now(),
            lastModified: Date.now(),
            usageCount: 0,
            tags: []
        };

        this.state.profiles.push(newProfile);
        this.saveProfiles();

        // アナリティクス記録
        if (this.config.profileAnalytics) {
            this.analytics.settingsModified++;
        }

        console.log(`プロファイル作成: ${name}`);
        return newProfile;
    }

    /**
     * プロファイルの更新
     */
    updateProfile(profileId: string, updates: Partial<AccessibilityProfile>): boolean {
        const profile = this.state.profiles.find(p => p.id === profileId);
        if (!profile || profile.isPreset) {
            console.warn('プロファイルが見つからないか、プリセットプロファイルです');
            return false;
        }

        Object.assign(profile, updates, {
            lastModified: Date.now()
        });

        this.saveProfiles();

        // アクティブプロファイルの場合は設定を適用
        if (profile.isActive && profile.settings) {
            this.applyProfileSettings(profile.settings);
        }

        // アナリティクス記録
        if (this.config.profileAnalytics) {
            this.analytics.settingsModified++;
        }

        return true;
    }

    /**
     * プロファイルの削除
     */
    deleteProfile(profileId: string): boolean {
        const index = this.state.profiles.findIndex(p => p.id === profileId);
        if (index === -1 || this.state.profiles[index].isPreset) {
            console.warn('プロファイルが見つからないか、プリセットプロファイルです');
            return false;
        }

        // アクティブプロファイルの場合は非アクティブ化
        if (this.state.profiles[index].isActive) {
            this.deactivateProfile();
        }

        this.state.profiles.splice(index, 1);
        this.saveProfiles();

        console.log(`プロファイル削除: ${profileId}`);
        return true;
    }

    /**
     * プロファイルのアクティブ化
     */
    activateProfile(profileId: string): boolean {
        const profile = this.state.profiles.find(p => p.id === profileId);
        if (!profile) {
            console.warn('プロファイルが見つかりません');
            return false;
        }

        // 現在のプロファイルを非アクティブ化
        this.state.profiles.forEach(p => p.isActive = false);

        // 新しいプロファイルをアクティブ化
        profile.isActive = true;
        profile.usageCount++;
        this.state.activeProfileId = profileId;

        // 設定を適用
        this.applyProfileSettings(profile.settings);

        // 最後に使用したプロファイルとして保存
        localStorage.setItem('last-accessibility-profile', profileId);

        // アナリティクス記録
        if (this.config.profileAnalytics) {
            this.analytics.profileSwitches++;
        }

        console.log(`プロファイルアクティブ化: ${profile.name}`);
        return true;
    }

    /**
     * プロファイルの非アクティブ化
     */
    deactivateProfile() {
        this.state.profiles.forEach(p => p.isActive = false);
        this.state.activeProfileId = null;

        // デフォルト設定に戻す
        this.applyDefaultSettings();

        localStorage.removeItem('last-accessibility-profile');
        console.log('プロファイル非アクティブ化');
    }

    /**
     * プロファイル設定の適用
     */
    private applyProfileSettings(settings: ProfileSettings) {
        if (!this.accessibilityManager) return;

        // ビジュアル設定
        if (settings.textScaling !== undefined) {
            this.accessibilityManager.setTextScaling?.(settings.textScaling);
        }
        if (settings.colorContrast !== undefined) {
            this.accessibilityManager.setColorContrast?.(settings.colorContrast);
        }
        if (settings.focusIndicators !== undefined) {
            this.accessibilityManager.setFocusIndicators?.(settings.focusIndicators);
        }
        if (settings.screenReaderSupport !== undefined) {
            this.accessibilityManager.setScreenReaderSupport?.(settings.screenReaderSupport);
        }
        if (settings.keyboardNavigation !== undefined) {
            this.accessibilityManager.setKeyboardNavigation?.(settings.keyboardNavigation);
        }
        if (settings.audioFeedback !== undefined) {
            this.accessibilityManager.setAudioFeedback?.(settings.audioFeedback);
        }
        if (settings.motionReduction !== undefined) {
            this.accessibilityManager.setMotionReduction?.(settings.motionReduction);
        }

        // オーディオ設定
        if (settings.visualFeedback !== undefined) {
            this.accessibilityManager.setVisualFeedback?.(settings.visualFeedback);
        }
        if (settings.showCaptions !== undefined) {
            this.accessibilityManager.setShowCaptions?.(settings.showCaptions);
        }
        if (settings.captionSize !== undefined) {
            this.accessibilityManager.setCaptionSize?.(settings.captionSize);
        }
        if (settings.vibrationSettings !== undefined) {
            this.accessibilityManager.setVibrationSettings?.(settings.vibrationSettings);
        }
        if (settings.flashingAlerts !== undefined) {
            this.accessibilityManager.setFlashingAlerts?.(settings.flashingAlerts);
        }
        if (settings.soundVisualization !== undefined) {
            this.accessibilityManager.setSoundVisualization?.(settings.soundVisualization);
        }

        // モーター設定
        if (settings.alternativeInput !== undefined) {
            this.accessibilityManager.setAlternativeInput?.(settings.alternativeInput);
        }
        if (settings.stickyKeys !== undefined) {
            this.accessibilityManager.setStickyKeys?.(settings.stickyKeys);
        }
        if (settings.slowKeys !== undefined) {
            this.accessibilityManager.setSlowKeys?.(settings.slowKeys);
        }
        if (settings.keyRepeatDelay !== undefined) {
            this.accessibilityManager.setKeyRepeatDelay?.(settings.keyRepeatDelay);
        }
        if (settings.mouseSensitivity !== undefined) {
            this.accessibilityManager.setMouseSensitivity?.(settings.mouseSensitivity);
        }
        if (settings.dwellTime !== undefined) {
            this.accessibilityManager.setDwellTime?.(settings.dwellTime);
        }
        if (settings.timingAdjustments !== undefined) {
            this.accessibilityManager.setTimingAdjustments?.(settings.timingAdjustments);
        }

        // コグニティブ設定
        if (settings.uiSimplification !== undefined) {
            this.accessibilityManager.setUISimplification?.(settings.uiSimplification);
        }
        if (settings.contextualHelp !== undefined) {
            this.accessibilityManager.setContextualHelp?.(settings.contextualHelp);
        }
        if (settings.reduceAnimations !== undefined) {
            this.accessibilityManager.setReduceAnimations?.(settings.reduceAnimations);
        }
        if (settings.readingMode !== undefined) {
            this.accessibilityManager.setReadingMode?.(settings.readingMode);
        }
        if (settings.focusMode !== undefined) {
            this.accessibilityManager.setFocusMode?.(settings.focusMode);
        }
        if (settings.memoryAids !== undefined) {
            this.accessibilityManager.setMemoryAids?.(settings.memoryAids);
        }
        if (settings.taskBreakdown !== undefined) {
            this.accessibilityManager.setTaskBreakdown?.(settings.taskBreakdown);
        }
        if (settings.errorRecovery !== undefined) {
            this.accessibilityManager.setErrorRecovery?.(settings.errorRecovery);
        }
    }

    /**
     * デフォルト設定の適用
     */
    private applyDefaultSettings() {
        const defaultSettings: ProfileSettings = {
            textScaling: 1.0,
            colorContrast: 'normal',
            focusIndicators: false,
            screenReaderSupport: false,
            keyboardNavigation: true,
            audioFeedback: false,
            motionReduction: 'none',
            visualFeedback: false,
            showCaptions: false,
            captionSize: 1.0,
            vibrationSettings: false,
            flashingAlerts: false,
            soundVisualization: false,
            backgroundMusic: true,
            alternativeInput: false,
            stickyKeys: false,
            slowKeys: false,
            keyRepeatDelay: 500,
            mouseSensitivity: 1.0,
            dwellTime: 0,
            timingAdjustments: 'none',
            oneHandedMode: false,
            uiSimplification: 'none',
            contextualHelp: false,
            reduceAnimations: false,
            readingMode: false,
            focusMode: false,
            memoryAids: false,
            taskBreakdown: false,
            errorRecovery: false
        };

        this.applyProfileSettings(defaultSettings);
    }

    /**
     * プロファイルのクイック切り替え
     */
    quickSwitch(direction: 'next' | 'previous' = 'next') {
        const currentIndex = this.state.activeProfileId
            ? this.state.profiles.findIndex(p => p.id === this.state.activeProfileId)
            : -1;

        let nextIndex: number;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % this.state.profiles.length;
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = this.state.profiles.length - 1;
        }

        const nextProfile = this.state.profiles[nextIndex];
        if (nextProfile) {
            this.activateProfile(nextProfile.id);
        }
    }

    /**
     * プロファイルのインポート
     */
    importProfile(profileData: ProfileSharingData): AccessibilityProfile | null {
        const newProfile = this.createProfile(
            profileData.name,
            profileData.settings,
            'custom'
        );

        if (newProfile) {
            newProfile.description = profileData.description;
            newProfile.compatibility = profileData.compatibility;
            newProfile.tags = profileData.tags;
            newProfile.metadata = {
                imported: true,
                author: profileData.author,
                rating: profileData.rating
            };

            this.saveProfiles();
            console.log(`プロファイルインポート: ${profileData.name}`);
        }

        return newProfile;
    }

    /**
     * プロファイルのエクスポート
     */
    exportProfile(profileId: string): ProfileSharingData | null {
        const profile = this.state.profiles.find(p => p.id === profileId);
        if (!profile) {
            console.warn('プロファイルが見つかりません');
            return null;
        }

        const exportData: ProfileSharingData = {
            profileId: profile.id,
            name: profile.name,
            description: profile.description,
            settings: profile.settings,
            compatibility: profile.compatibility || {},
            tags: profile.tags || [],
            author: 'current-user',
            rating: 0
        };

        console.log(`プロファイルエクスポート: ${profile.name}`);
        return exportData;
    }

    /**
     * 機械学習による推奨プロファイル生成
     */
    generateRecommendations() {
        const recommendations: MLRecommendation[] = [];

        // ユーザーの行動パターンを分析（仮実装）
        const userBehavior = this.analyzeUserBehavior();

        // 各プリセットプロファイルに対してマッチングスコアを計算
        Object.values(this.state.presets).forEach(preset => {
            const confidence = this.calculateProfileMatch(preset, userBehavior);
            if (confidence > 0.5) {
                recommendations.push({
                    profileId: preset.id,
                    confidence,
                    reason: this.getRecommendationReason(preset, userBehavior),
                    basedOn: userBehavior.indicators
                });
            }
        });

        // 推奨プロファイルをソート
        recommendations.sort((a, b) => b.confidence - a.confidence);

        // 上位3つを推奨として設定
        this.state.recommendations = recommendations.slice(0, 3).map(rec => {
            const preset = this.state.presets[rec.profileId];
            return {
                ...preset,
                isPreset: true,
                isActive: false,
                createdAt: Date.now(),
                lastModified: Date.now(),
                usageCount: 0,
                metadata: {
                    recommendation: rec
                }
            };
        });

        console.log(`推奨プロファイル生成: ${recommendations.length}件`);
    }

    /**
     * ユーザー行動の分析
     */
    private analyzeUserBehavior(): any {
        // 仮実装：実際にはゲームプレイデータから分析
        return {
            indicators: ['frequent-pausing', 'zoom-usage', 'keyboard-preference'],
            patterns: {
                inputMethod: 'keyboard',
                responseTime: 1500,
                errorRate: 0.15,
                zoomUsage: true,
                pauseFrequency: 'high'
            }
        };
    }

    /**
     * プロファイルマッチング度の計算
     */
    private calculateProfileMatch(profile: PresetProfile, userBehavior: any): number {
        // 仮実装：実際には複雑なマッチングアルゴリズム
        const indicators = userBehavior.indicators || [];
        let score = 0;

        // カテゴリ別のマッチング
        switch (profile.category) {
            case 'visual':
                if (indicators.includes('zoom-usage')) score += 0.3;
                if (indicators.includes('high-contrast-preference')) score += 0.3;
                if (userBehavior.patterns?.zoomUsage) score += 0.2;
                break;
            case 'motor':
                if (indicators.includes('keyboard-preference')) score += 0.3;
                if (indicators.includes('slow-response')) score += 0.3;
                if (userBehavior.patterns?.inputMethod === 'keyboard') score += 0.2;
                break;
            case 'cognitive':
                if (indicators.includes('frequent-pausing')) score += 0.3;
                if (indicators.includes('help-usage')) score += 0.3;
                if (userBehavior.patterns?.pauseFrequency === 'high') score += 0.2;
                break;
        }

        // エラー率による補正
        if (userBehavior.patterns?.errorRate > 0.1) {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    /**
     * 推奨理由の生成
     */
    private getRecommendationReason(profile: PresetProfile, userBehavior: any): string {
        const reasons: string[] = [];

        switch (profile.category) {
            case 'visual':
                if (userBehavior.patterns?.zoomUsage) {
                    reasons.push('画面拡大機能の使用頻度が高い');
                }
                break;
            case 'motor':
                if (userBehavior.patterns?.inputMethod === 'keyboard') {
                    reasons.push('キーボード操作を多用している');
                }
                if (userBehavior.patterns?.responseTime > 1000) {
                    reasons.push('反応時間が長め');
                }
                break;
            case 'cognitive':
                if (userBehavior.patterns?.pauseFrequency === 'high') {
                    reasons.push('頻繁にゲームを一時停止している');
                }
                if (userBehavior.patterns?.errorRate > 0.1) {
                    reasons.push('操作ミスが多い');
                }
                break;
        }

        return reasons.join('、');
    }

    /**
     * プロファイルの検索
     */
    searchProfiles(query: string, filters?: { category?: string; tags?: string[] }): AccessibilityProfile[] {
        let results = this.state.profiles;

        // テキスト検索
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                (p.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        // カテゴリフィルタ
        if (filters?.category) {
            results = results.filter(p => p.category === filters.category);
        }

        // タグフィルタ
        if (filters?.tags && filters.tags.length > 0) {
            results = results.filter(p =>
                filters.tags!.some(tag => (p.tags || []).includes(tag))
            );
        }

        return results;
    }

    /**
     * プロファイルの保存
     */
    private saveProfiles() {
        try {
            const userProfiles = this.state.profiles.filter(p => !p.isPreset);
            localStorage.setItem('accessibility-profiles', JSON.stringify(userProfiles));
        } catch (error) {
            console.error('プロファイル保存エラー:', error);
            this.errorHandler.logError('プロファイル保存エラー', error);
        }
    }

    /**
     * 自動保存の開始
     */
    private startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = window.setInterval(() => {
            this.saveProfiles();
            this.saveAnalytics();
        }, this.config.autoSaveInterval);
    }

    /**
     * 自動保存の停止
     */
    private stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * アナリティクスの保存
     */
    private saveAnalytics() {
        if (!this.config.profileAnalytics) return;

        try {
            localStorage.setItem('accessibility-profile-analytics', JSON.stringify(this.analytics));
        } catch (error) {
            console.error('アナリティクス保存エラー:', error);
        }
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<ProfileConfig>) {
        this.config = { ...this.config, ...newConfig };

        // 自動保存設定の更新
        if (newConfig.autoSaveInterval !== undefined || newConfig.enabled !== undefined) {
            if (this.config.enabled && this.config.autoSaveInterval > 0) {
                this.startAutoSave();
            } else {
                this.stopAutoSave();
            }
        }
    }

    /**
     * 現在のプロファイルを取得
     */
    getCurrentProfile(): AccessibilityProfile | null {
        if (!this.state.activeProfileId) return null;
        return this.state.profiles.find(p => p.id === this.state.activeProfileId) || null;
    }

    /**
     * すべてのプロファイルを取得
     */
    getAllProfiles(): AccessibilityProfile[] {
        return [...this.state.profiles];
    }

    /**
     * 推奨プロファイルを取得
     */
    getRecommendations(): AccessibilityProfile[] {
        return [...this.state.recommendations];
    }

    /**
     * アナリティクス情報を取得
     */
    getAnalytics(): ProfileAnalytics {
        return { ...this.analytics };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopAutoSave();
        this.saveProfiles();
        this.saveAnalytics();
        
        console.log('AccessibilityProfileManager: クリーンアップ完了');
    }
}