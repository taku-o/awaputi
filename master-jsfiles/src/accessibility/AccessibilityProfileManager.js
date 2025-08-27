/**
 * AccessibilityProfileManager - アクセシビリティプロファイル管理システム
 * ユーザープロファイル管理・クイック切り替え・プロファイル共有
 * 障害タイプ別プリセット・機械学習推奨システム
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class AccessibilityProfileManager {
    constructor(accessibilityManager) {
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
        this.presetProfiles = {
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
                    errorRecovery: true,
                    memoryAids: true,
                    distractionReduction: true,
                    clearLanguage: true,
                    progressIndicators: true,
                    autoSave: true
                },
                features: {
                    guidedTutorials: true,
                    stepByStepInstructions: true,
                    confirmationDialogs: true
                }
            },
            
            elderlyFriendly: {
                id: 'elderly-friendly',
                name: '高齢者向け',
                description: '高齢者の方が使いやすい設定',
                icon: '👴',
                category: 'general',
                settings: {
                    textScaling: 1.3,
                    colorContrast: 'enhanced',
                    largeButtons: true,
                    slowAnimations: true,
                    extraSpacing: true,
                    clearFonts: true,
                    timingAdjustments: 'extended',
                    tooltipDelay: 2000
                },
                features: {
                    largeClickTargets: true,
                    simplifiedNavigation: true,
                    voiceInstructions: true
                }
            },
            
            gamingOptimized: {
                id: 'gaming-optimized',
                name: 'ゲーミング最適化',
                description: 'ゲームプレイに最適化された設定',
                icon: '🎮',
                category: 'gaming',
                settings: {
                    gameControls: 'enhanced',
                    keyboardShortcuts: 'gaming',
                    responseTime: 'fast',
                    visualFeedback: 'immediate',
                    soundCues: 'detailed',
                    customizableControls: true,
                    pauseOnFocusLoss: true
                },
                features: {
                    gameSpecificSettings: true,
                    performanceMode: true,
                    competitiveMode: false
                }
            },
            
            minimumCompliance: {
                id: 'minimum-compliance',
                name: '最小限準拠',
                description: 'WCAG AA最小限の準拠設定',
                icon: '✅',
                category: 'compliance',
                settings: {
                    colorContrast: 'normal',
                    textScaling: 1.0,
                    keyboardNavigation: true,
                    altText: true,
                    focusIndicators: true,
                    skipLinks: true
                },
                compliance: {
                    wcagLevel: 'AA',
                    section508: true,
                    ada: true
                }
            }
        };
        
        // ユーザープロファイル
        this.userProfiles = new Map();
        this.currentProfile = null;
        this.activeProfileId = null;
        
        // プロファイル使用統計
        this.profileStats = {
            usageHistory: [],
            preferences: new Map(),
            effectiveness: new Map(),
            switchingPatterns: [],
            sessionData: {
                startTime: Date.now(),
                profileSwitches: 0,
                settingsModified: 0
            }
        };
        
        // 推奨システム
        this.recommendationEngine = {
            enabled: true,
            learningData: new Map(),
            behaviorPatterns: [],
            confidenceThreshold: 0.7,
            lastRecommendation: null
        };
        
        // 同期状態
        this.syncState = {
            enabled: false,
            lastSync: null,
            pendingChanges: new Set(),
            conflicts: []
        };
        
        console.log('AccessibilityProfileManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            this.loadUserProfiles();
            this.loadProfileStats();
            this.setupAutoSave();
            this.initializeRecommendationEngine();
            this.detectSystemProfile();
            
            console.log('AccessibilityProfileManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_PROFILE_MANAGER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ユーザープロファイルの読み込み
     */
    loadUserProfiles() {
        try {
            const saved = localStorage.getItem('accessibilityProfiles');
            if (saved) {
                const profilesData = JSON.parse(saved);
                
                profilesData.forEach(profileData => {
                    this.userProfiles.set(profileData.id, profileData);
                });
                
                console.log(`Loaded ${this.userProfiles.size} user profiles`);
            }
            
            // アクティブプロファイルの復元
            const activeProfileId = localStorage.getItem('activeAccessibilityProfile');
            if (activeProfileId) {
                this.activateProfile(activeProfileId);
            }
            
        } catch (error) {
            console.warn('Failed to load user profiles:', error);
        }
    }
    
    /**
     * プロファイル統計の読み込み
     */
    loadProfileStats() {
        try {
            const saved = localStorage.getItem('accessibilityProfileStats');
            if (saved) {
                const statsData = JSON.parse(saved);
                Object.assign(this.profileStats, statsData);
                
                // Mapオブジェクトの復元
                if (statsData.preferences) {
                    this.profileStats.preferences = new Map(statsData.preferences);
                }
                if (statsData.effectiveness) {
                    this.profileStats.effectiveness = new Map(statsData.effectiveness);
                }
            }
        } catch (error) {
            console.warn('Failed to load profile stats:', error);
        }
    }
    
    /**
     * システムプロファイルの検出
     */
    detectSystemProfile() {
        const systemPreferences = this.detectSystemPreferences();
        
        if (systemPreferences.reducedMotion) {
            this.recommendProfile('visual-impairment', 'システム設定でモーション軽減が有効です');
        }
        
        if (systemPreferences.highContrast) {
            this.recommendProfile('visual-impairment', 'システム設定で高コントラストが有効です');
        }
        
        if (systemPreferences.largeText) {
            this.recommendProfile('elderly-friendly', 'システム設定で大きなテキストが有効です');
        }
    }
    
    /**
     * システム設定の検出
     */
    detectSystemPreferences() {
        const preferences = {};
        
        try {
            // モーション軽減
            preferences.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            // 高コントラスト
            preferences.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
            
            // 色の好み
            preferences.colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            
            // 透明度の軽減
            preferences.reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
            
        } catch (error) {
            console.warn('Failed to detect system preferences:', error);
        }
        
        return preferences;
    }
    
    /**
     * プロファイルの作成
     */
    createProfile(profileData) {
        const profile = {
            id: profileData.id || this.generateProfileId(),
            name: profileData.name,
            description: profileData.description || '',
            icon: profileData.icon || '⚙️',
            category: profileData.category || 'custom',
            settings: { ...profileData.settings },
            metadata: {
                createdAt: Date.now(),
                lastModified: Date.now(),
                createdBy: 'user',
                version: '1.0',
                usage: {
                    activationCount: 0,
                    totalTime: 0,
                    effectiveness: 0
                }
            },
            tags: profileData.tags || [],
            isCustom: true
        };
        
        this.userProfiles.set(profile.id, profile);
        this.saveUserProfiles();
        
        console.log(`Profile created: ${profile.name} (${profile.id})`);
        
        // イベント発火
        this.accessibilityManager?.eventSystem?.emit('profileCreated', {
            profile,
            timestamp: Date.now()
        });
        
        return profile.id;
    }
    
    /**
     * プロファイルの更新
     */
    updateProfile(profileId, updates) {
        const profile = this.userProfiles.get(profileId);
        if (!profile) {
            console.warn(`Profile not found: ${profileId}`);
            return false;
        }
        
        // 更新可能フィールドのみ更新
        const allowedFields = ['name', 'description', 'icon', 'settings', 'tags'];
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                if (field === 'settings') {
                    Object.assign(profile.settings, updates.settings);
                } else {
                    profile[field] = updates[field];
                }
            }
        });
        
        profile.metadata.lastModified = Date.now();
        
        this.saveUserProfiles();
        
        console.log(`Profile updated: ${profile.name} (${profileId})`);
        
        // アクティブプロファイルの場合は再適用
        if (this.activeProfileId === profileId) {
            this.applyProfile(profileId);
        }
        
        return true;
    }
    
    /**
     * プロファイルの削除
     */
    deleteProfile(profileId) {
        const profile = this.userProfiles.get(profileId);
        if (!profile) {
            console.warn(`Profile not found: ${profileId}`);
            return false;
        }
        
        // プリセットプロファイルは削除不可
        if (!profile.isCustom) {
            console.warn(`Cannot delete preset profile: ${profileId}`);
            return false;
        }
        
        this.userProfiles.delete(profileId);
        
        // アクティブプロファイルの場合はデフォルトに戻す
        if (this.activeProfileId === profileId) {
            this.activateProfile('default');
        }
        
        this.saveUserProfiles();
        
        console.log(`Profile deleted: ${profile.name} (${profileId})`);
        
        return true;
    }
    
    /**
     * プロファイルの有効化
     */
    activateProfile(profileId) {
        // プリセットプロファイルのチェック
        let profile = this.userProfiles.get(profileId);
        if (!profile && this.presetProfiles[profileId]) {
            profile = this.presetProfiles[profileId];
        }
        
        if (!profile) {
            console.warn(`Profile not found: ${profileId}`);
            return false;
        }
        
        const previousProfileId = this.activeProfileId;
        
        // プロファイルの適用
        this.applyProfile(profileId);
        
        // 状態の更新
        this.activeProfileId = profileId;
        this.currentProfile = profile;
        
        // 使用統計の更新
        this.updateProfileUsage(profileId, previousProfileId);
        
        // 保存
        localStorage.setItem('activeAccessibilityProfile', profileId);
        
        console.log(`Profile activated: ${profile.name} (${profileId})`);
        
        // イベント発火
        this.accessibilityManager?.eventSystem?.emit('profileActivated', {
            profileId,
            profile,
            previousProfileId,
            timestamp: Date.now()
        });
        
        return true;
    }
    
    /**
     * プロファイルの適用
     */
    applyProfile(profileId) {
        let profile = this.userProfiles.get(profileId);
        if (!profile && this.presetProfiles[profileId]) {
            profile = this.presetProfiles[profileId];
        }
        
        if (!profile) return false;
        
        // アクセシビリティマネージャーに設定を適用
        if (this.accessibilityManager && profile.settings) {
            Object.entries(profile.settings).forEach(([settingKey, settingValue]) => {
                this.accessibilityManager.applySetting(settingKey, settingValue);
            });
        }
        
        return true;
    }
    
    /**
     * プロファイル使用統計の更新
     */
    updateProfileUsage(currentProfileId, previousProfileId) {
        const now = Date.now();
        
        // 前のプロファイルの使用時間を記録
        if (previousProfileId && this.profileStats.sessionData.profileStartTime) {
            const usageTime = now - this.profileStats.sessionData.profileStartTime;
            
            // 効果測定データの更新
            this.updateProfileEffectiveness(previousProfileId, usageTime);
        }
        
        // 新しいプロファイルの開始時間を記録
        this.profileStats.sessionData.profileStartTime = now;
        this.profileStats.sessionData.profileSwitches++;
        
        // 切り替えパターンの記録
        if (previousProfileId) {
            this.profileStats.switchingPatterns.push({
                from: previousProfileId,
                to: currentProfileId,
                timestamp: now,
                sessionTime: now - this.profileStats.sessionData.startTime
            });
        }
        
        // 使用履歴の更新
        this.profileStats.usageHistory.push({
            profileId: currentProfileId,
            activatedAt: now,
            sessionId: this.generateSessionId()
        });
        
        // 履歴サイズの制限
        if (this.profileStats.usageHistory.length > 1000) {
            this.profileStats.usageHistory = this.profileStats.usageHistory.slice(-500);
        }
        
        this.saveProfileStats();
    }
    
    /**
     * プロファイル効果の測定
     */
    updateProfileEffectiveness(profileId, usageTime) {
        const effectiveness = this.profileStats.effectiveness.get(profileId) || {
            totalUsageTime: 0,
            activationCount: 0,
            averageSessionTime: 0,
            userSatisfaction: 0,
            taskCompletionRate: 0
        };
        
        effectiveness.totalUsageTime += usageTime;
        effectiveness.activationCount++;
        effectiveness.averageSessionTime = effectiveness.totalUsageTime / effectiveness.activationCount;
        
        // 効果スコアの計算（簡易版）
        const sessionScore = this.calculateSessionScore(usageTime);
        effectiveness.userSatisfaction = (effectiveness.userSatisfaction * 0.8) + (sessionScore * 0.2);
        
        this.profileStats.effectiveness.set(profileId, effectiveness);
    }
    
    /**
     * セッションスコアの計算
     */
    calculateSessionScore(usageTime) {
        // 使用時間から効果を推定（長すぎず短すぎない時間が良い）
        const idealTime = 300000; // 5分
        const timeFactor = Math.max(0, 1 - Math.abs(usageTime - idealTime) / idealTime);
        
        // その他の要因（エラー率、操作効率など）も考慮可能
        return Math.min(100, timeFactor * 100);
    }
    
    /**
     * プロファイル推奨システム
     */
    recommendProfile(profileId, reason) {
        if (!this.config.autoRecommendation) return;
        
        const recommendation = {
            profileId,
            reason,
            confidence: this.calculateRecommendationConfidence(profileId),
            timestamp: Date.now(),
            context: this.getCurrentContext()
        };
        
        if (recommendation.confidence >= this.recommendationEngine.confidenceThreshold) {
            this.showProfileRecommendation(recommendation);
        }
        
        this.recommendationEngine.lastRecommendation = recommendation;
    }
    
    /**
     * 推奨度の計算
     */
    calculateRecommendationConfidence(profileId) {
        let confidence = 0.5; // ベースライン
        
        // システム設定との一致度
        const systemPreferences = this.detectSystemPreferences();
        const profile = this.presetProfiles[profileId];
        
        if (profile) {
            if (systemPreferences.reducedMotion && profile.settings.motionReduction) {
                confidence += 0.2;
            }
            if (systemPreferences.highContrast && profile.settings.colorContrast === 'high') {
                confidence += 0.2;
            }
        }
        
        // 過去の使用履歴
        const effectiveness = this.profileStats.effectiveness.get(profileId);
        if (effectiveness && effectiveness.userSatisfaction > 70) {
            confidence += 0.1;
        }
        
        return Math.min(1.0, confidence);
    }
    
    /**
     * 現在のコンテキストの取得
     */
    getCurrentContext() {
        return {
            currentTime: Date.now(),
            gameState: this.gameEngine?.getCurrentState?.() || null,
            activeScene: this.gameEngine?.currentScene || null,
            userAgent: navigator.userAgent,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            inputMethods: this.detectInputMethods()
        };
    }
    
    /**
     * 入力方法の検出
     */
    detectInputMethods() {
        const methods = [];
        
        // タッチデバイス
        if ('ontouchstart' in window) {
            methods.push('touch');
        }
        
        // ゲームパッド
        if (navigator.getGamepads && navigator.getGamepads().some(gp => gp)) {
            methods.push('gamepad');
        }
        
        // キーボード（常にありと仮定）
        methods.push('keyboard');
        
        // マウス
        methods.push('mouse');
        
        return methods;
    }
    
    /**
     * プロファイル推奨の表示
     */
    showProfileRecommendation(recommendation) {
        const profile = this.presetProfiles[recommendation.profileId] || 
                       this.userProfiles.get(recommendation.profileId);
        
        if (!profile) return;
        
        const notification = document.createElement('div');
        notification.className = 'profile-recommendation';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 1.2rem; margin-right: 0.5rem;">${profile.icon}</span>
                <strong>プロファイル推奨</strong>
            </div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${recommendation.reason}</p>
            <p style="margin: 0 0 1rem 0; font-weight: 600;">${profile.name}</p>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer;">
                    後で
                </button>
                <button onclick="accessibilityProfileManager.activateProfile('${profile.id}'); this.parentElement.parentElement.remove();"
                        style="background: rgba(255,255,255,0.9); border: none; color: #3498db; padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer; font-weight: 600;">
                    適用する
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 10秒後に自動削除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 10000);
        
        console.log(`Profile recommendation shown: ${profile.name}`);
    }
    
    /**
     * 機械学習による使用パターン分析
     */
    analyzeUsagePatterns() {
        const patterns = [];
        const history = this.profileStats.usageHistory;
        
        if (history.length < 10) return patterns; // データ不足
        
        // 時間帯別の使用傾向
        const timePatterns = this.analyzeTimePatterns(history);
        patterns.push(...timePatterns);
        
        // セッション長による傾向
        const sessionPatterns = this.analyzeSessionPatterns(history);
        patterns.push(...sessionPatterns);
        
        // 切り替えパターン
        const switchingPatterns = this.analyzeSwitchingPatterns();
        patterns.push(...switchingPatterns);
        
        return patterns;
    }
    
    /**
     * 時間帯パターンの分析
     */
    analyzeTimePatterns(history) {
        const timeSlots = {};
        
        history.forEach(usage => {
            const hour = new Date(usage.activatedAt).getHours();
            const timeSlot = Math.floor(hour / 4); // 4時間単位
            timeSlots[timeSlot] = timeSlots[timeSlot] || [];
            timeSlots[timeSlot].push(usage.profileId);
        });
        
        const patterns = [];
        Object.entries(timeSlots).forEach(([slot, profiles]) => {
            const profileCounts = {};
            profiles.forEach(profile => {
                profileCounts[profile] = (profileCounts[profile] || 0) + 1;
            });
            
            const mostUsed = Object.entries(profileCounts)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (mostUsed && mostUsed[1] > 2) {
                patterns.push({
                    type: 'timePreference',
                    timeSlot: parseInt(slot),
                    profileId: mostUsed[0],
                    confidence: mostUsed[1] / profiles.length
                });
            }
        });
        
        return patterns;
    }
    
    /**
     * 自動保存の設定
     */
    setupAutoSave() {
        if (this.config.autoSaveInterval > 0) {
            setInterval(() => {
                this.saveUserProfiles();
                this.saveProfileStats();
            }, this.config.autoSaveInterval);
        }
    }
    
    /**
     * プロファイルのエクスポート
     */
    exportProfile(profileId) {
        const profile = this.userProfiles.get(profileId);
        if (!profile) {
            console.warn(`Profile not found for export: ${profileId}`);
            return null;
        }
        
        const exportData = {
            profile: { ...profile },
            metadata: {
                exportedAt: Date.now(),
                exportedBy: 'AccessibilityProfileManager',
                version: '1.0'
            },
            stats: this.profileStats.effectiveness.get(profileId) || null
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * プロファイルのインポート
     */
    importProfile(profileData) {
        try {
            let data;
            if (typeof profileData === 'string') {
                data = JSON.parse(profileData);
            } else {
                data = profileData;
            }
            
            if (!data.profile) {
                throw new Error('Invalid profile data');
            }
            
            const profile = data.profile;
            
            // IDの重複チェック
            if (this.userProfiles.has(profile.id)) {
                profile.id = this.generateProfileId();
            }
            
            // インポート用のメタデータ更新
            profile.metadata = {
                ...profile.metadata,
                importedAt: Date.now(),
                originalId: data.profile.id
            };
            
            this.userProfiles.set(profile.id, profile);
            this.saveUserProfiles();
            
            console.log(`Profile imported: ${profile.name} (${profile.id})`);
            return profile.id;
            
        } catch (error) {
            console.error('Failed to import profile:', error);
            return null;
        }
    }
    
    /**
     * プロファイルID生成
     */
    generateProfileId() {
        return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * セッションID生成
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 推奨エンジンの初期化
     */
    initializeRecommendationEngine() {
        if (!this.config.autoRecommendation) return;
        
        // 過去のデータから学習
        this.recommendationEngine.behaviorPatterns = this.analyzeUsagePatterns();
        
        console.log(`Recommendation engine initialized with ${this.recommendationEngine.behaviorPatterns.length} patterns`);
    }
    
    /**
     * ユーザープロファイルの保存
     */
    saveUserProfiles() {
        try {
            const profilesArray = Array.from(this.userProfiles.values());
            localStorage.setItem('accessibilityProfiles', JSON.stringify(profilesArray));
        } catch (error) {
            console.warn('Failed to save user profiles:', error);
        }
    }
    
    /**
     * プロファイル統計の保存
     */
    saveProfileStats() {
        try {
            const statsData = {
                ...this.profileStats,
                preferences: Array.from(this.profileStats.preferences.entries()),
                effectiveness: Array.from(this.profileStats.effectiveness.entries())
            };
            
            localStorage.setItem('accessibilityProfileStats', JSON.stringify(statsData));
        } catch (error) {
            console.warn('Failed to save profile stats:', error);
        }
    }
    
    // パブリックAPI
    
    /**
     * 全プロファイルの取得
     */
    getAllProfiles() {
        const profiles = [];
        
        // プリセットプロファイル
        Object.values(this.presetProfiles).forEach(profile => {
            profiles.push({ ...profile, isPreset: true });
        });
        
        // ユーザープロファイル
        this.userProfiles.forEach(profile => {
            profiles.push({ ...profile, isPreset: false });
        });
        
        return profiles;
    }
    
    /**
     * プロファイルの取得
     */
    getProfile(profileId) {
        return this.userProfiles.get(profileId) || this.presetProfiles[profileId] || null;
    }
    
    /**
     * アクティブプロファイルの取得
     */
    getActiveProfile() {
        return this.currentProfile;
    }
    
    /**
     * プロファイル統計の取得
     */
    getProfileStats(profileId = null) {
        if (profileId) {
            return {
                usage: this.profileStats.usageHistory.filter(h => h.profileId === profileId),
                effectiveness: this.profileStats.effectiveness.get(profileId),
                preferences: this.profileStats.preferences.get(profileId)
            };
        }
        
        return {
            ...this.profileStats,
            preferences: Object.fromEntries(this.profileStats.preferences),
            effectiveness: Object.fromEntries(this.profileStats.effectiveness)
        };
    }
    
    /**
     * プロファイル推奨の取得
     */
    getRecommendations() {
        const patterns = this.analyzeUsagePatterns();
        const recommendations = [];
        
        patterns.forEach(pattern => {
            if (pattern.confidence >= this.recommendationEngine.confidenceThreshold) {
                recommendations.push({
                    profileId: pattern.profileId,
                    reason: this.generateRecommendationReason(pattern),
                    confidence: pattern.confidence,
                    type: pattern.type
                });
            }
        });
        
        return recommendations;
    }
    
    /**
     * 推奨理由の生成
     */
    generateRecommendationReason(pattern) {
        switch (pattern.type) {
            case 'timePreference':
                return `この時間帯によく使用されています`;
            case 'sessionLength':
                return `類似のセッション長でよく使用されています`;
            case 'switching':
                return `このプロファイルからよく切り替えられています`;
            default:
                return `使用パターンに基づく推奨です`;
        }
    }
    
    /**
     * クイックプロファイルの取得
     */
    getQuickProfiles() {
        // よく使われるプロファイルを効果順にソート
        const profileEffectiveness = Array.from(this.profileStats.effectiveness.entries())
            .sort(([,a], [,b]) => b.userSatisfaction - a.userSatisfaction)
            .slice(0, 5);
        
        return profileEffectiveness.map(([profileId]) => this.getProfile(profileId))
            .filter(profile => profile !== null);
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.profileManager) {
            Object.assign(this.config, config.profileManager);
        }
        
        console.log('AccessibilityProfileManager configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`AccessibilityProfileManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AccessibilityProfileManager...');
        
        // 最終保存
        this.saveUserProfiles();
        this.saveProfileStats();
        
        // データのクリア
        this.userProfiles.clear();
        this.profileStats.usageHistory = [];
        this.profileStats.switchingPatterns = [];
        
        console.log('AccessibilityProfileManager destroyed');
    }
}

// 未実装メソッドの追加
Object.assign(AccessibilityProfileManager.prototype, {
    analyzeSessionPatterns() {
        return [];
    },
    
    analyzeSwitchingPatterns() {
        return [];
    }
});

// グローバル参照（推奨通知用）
if (typeof window !== 'undefined') {
    window.accessibilityProfileManager = null;
}