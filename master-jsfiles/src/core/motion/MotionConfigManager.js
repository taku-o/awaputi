/**
 * MotionConfigManager
 * モーション設定管理、カテゴリ別設定、前庭安全ガイドライン
 */
export class MotionConfigManager {
    constructor(motionManager) {
        this.motionManager = motionManager;
        this.visualAccessibilityManager = motionManager.visualAccessibilityManager;
        this.accessibilityManager = motionManager.accessibilityManager;
        this.gameEngine = motionManager.gameEngine;
        
        // 設定管理の初期化
        this.config = motionManager.config;
        this.userPreferences = motionManager.userPreferences;
        this.hazardPatterns = motionManager.hazardPatterns;
        
        // 設定変更リスナー
        this.configListeners = new Set();
        
        console.log('[MotionConfigManager] Component initialized');
    }
    
    /**
     * システム設定の検出
     */
    detectSystemPreferences() {
        if (!this.config.respectSystemPreference) return;
        
        try {
            if (window.matchMedia) {
                const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                
                if (reducedMotionQuery.matches) {
                    this.config.globalReducedMotion = true;
                    this.motionManager.currentLevel = 'reduced';
                    console.log('System reduced motion preference detected');
                }
                
                // 変更を監視
                reducedMotionQuery.addEventListener('change', (e) => {
                    this.handleSystemPreferenceChange(e.matches);
                });
            }
        } catch (error) {
            console.warn('Failed to detect motion preferences:', error);
        }
    }
    
    /**
     * システム設定変更の処理
     */
    handleSystemPreferenceChange(reducedMotion) {
        this.config.globalReducedMotion = reducedMotion;
        
        if (reducedMotion) {
            this.motionManager.setMotionLevel('reduced');
        } else {
            this.motionManager.setMotionLevel(this.userPreferences.motionLevel);
        }
        
        this.notifyConfigListeners('systemPreference', { reducedMotion });
        console.log(`System motion preference changed: ${reducedMotion ? 'reduced' : 'normal'}`);
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('motionManager_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // カスタム強度の復元
                if (preferences.customIntensities) {
                    this.userPreferences.customIntensities = new Map(preferences.customIntensities);
                }
                
                console.log('Motion preferences loaded:', this.userPreferences);
            }
        } catch (error) {
            console.warn('Failed to load motion preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const toSave = {
                ...this.userPreferences,
                customIntensities: Array.from(this.userPreferences.customIntensities.entries())
            };
            
            localStorage.setItem('motionManager_preferences', JSON.stringify(toSave));
            console.log('Motion preferences saved');
        } catch (error) {
            console.warn('Failed to save motion preferences:', error);
        }
    }
    
    /**
     * モーションレベルの設定
     */
    setMotionLevel(level) {
        if (!this.config.motionLevels[level]) {
            console.warn(`Invalid motion level: ${level}`);
            return false;
        }
        
        const previousLevel = this.motionManager.currentLevel;
        this.motionManager.currentLevel = level;
        this.userPreferences.motionLevel = level;
        
        // カテゴリ設定の更新
        this.updateCategorySettings(level);
        
        // 設定の保存
        this.saveUserPreferences();
        
        // リスナーに通知
        this.notifyConfigListeners('motionLevel', { 
            previous: previousLevel, 
            current: level 
        });
        
        console.log(`Motion level changed: ${previousLevel} → ${level}`);
        return true;
    }
    
    /**
     * カテゴリ設定の更新
     */
    updateCategorySettings(level) {
        const settings = this.getLevelSettings(level);
        
        Object.keys(this.config.motionCategories).forEach(category => {
            if (settings[category]) {
                Object.assign(this.config.motionCategories[category], settings[category]);
            }
        });
    }
    
    /**
     * レベル別設定の取得
     */
    getLevelSettings(level) {
        const settings = {
            none: {
                transitions: { enabled: false, intensity: 0, duration: 0 },
                transforms: { enabled: false, intensity: 0, duration: 0 },
                parallax: { enabled: false, intensity: 0, duration: 0 },
                particles: { enabled: false, intensity: 0, duration: 0 },
                camera: { enabled: false, intensity: 0, duration: 0 },
                ui: { enabled: false, intensity: 0, duration: 0 },
                game: { enabled: false, intensity: 0, duration: 0 },
                background: { enabled: false, intensity: 0, duration: 0 }
            },
            essential: {
                transitions: { enabled: true, intensity: 0.3, duration: 0.5 },
                transforms: { enabled: false, intensity: 0, duration: 0 },
                parallax: { enabled: false, intensity: 0, duration: 0 },
                particles: { enabled: false, intensity: 0, duration: 0 },
                camera: { enabled: false, intensity: 0, duration: 0 },
                ui: { enabled: true, intensity: 0.5, duration: 0.5 },
                game: { enabled: true, intensity: 0.3, duration: 0.5 },
                background: { enabled: false, intensity: 0, duration: 0 }
            },
            reduced: {
                transitions: { enabled: true, intensity: 0.6, duration: 0.7 },
                transforms: { enabled: true, intensity: 0.4, duration: 0.7 },
                parallax: { enabled: false, intensity: 0, duration: 0 },
                particles: { enabled: true, intensity: 0.3, duration: 0.7 },
                camera: { enabled: false, intensity: 0, duration: 0 },
                ui: { enabled: true, intensity: 0.8, duration: 0.7 },
                game: { enabled: true, intensity: 0.6, duration: 0.7 },
                background: { enabled: true, intensity: 0.2, duration: 0.7 }
            },
            normal: {
                transitions: { enabled: true, intensity: 1.0, duration: 1.0 },
                transforms: { enabled: true, intensity: 1.0, duration: 1.0 },
                parallax: { enabled: true, intensity: 0.5, duration: 1.0 },
                particles: { enabled: true, intensity: 0.8, duration: 1.0 },
                camera: { enabled: true, intensity: 0.3, duration: 1.0 },
                ui: { enabled: true, intensity: 1.0, duration: 1.0 },
                game: { enabled: true, intensity: 0.9, duration: 1.0 },
                background: { enabled: true, intensity: 0.6, duration: 1.0 }
            },
            enhanced: {
                transitions: { enabled: true, intensity: 1.5, duration: 1.2 },
                transforms: { enabled: true, intensity: 1.5, duration: 1.2 },
                parallax: { enabled: true, intensity: 1.0, duration: 1.2 },
                particles: { enabled: true, intensity: 1.5, duration: 1.2 },
                camera: { enabled: true, intensity: 0.8, duration: 1.2 },
                ui: { enabled: true, intensity: 1.2, duration: 1.2 },
                game: { enabled: true, intensity: 1.3, duration: 1.2 },
                background: { enabled: true, intensity: 1.0, duration: 1.2 }
            }
        };
        
        return settings[level] || settings.normal;
    }
    
    /**
     * カテゴリ別設定の取得
     */
    getCategoryConfig(category) {
        return this.config.motionCategories[category] || null;
    }
    
    /**
     * カテゴリ別設定の更新
     */
    setCategoryConfig(category, config) {
        if (!this.config.motionCategories[category]) {
            console.warn(`Invalid motion category: ${category}`);
            return false;
        }
        
        const previousConfig = { ...this.config.motionCategories[category] };
        Object.assign(this.config.motionCategories[category], config);
        
        this.notifyConfigListeners('categoryConfig', {
            category,
            previous: previousConfig,
            current: this.config.motionCategories[category]
        });
        
        return true;
    }
    
    /**
     * 段階的制御設定の更新
     */
    updateGranularControls(controls) {
        const previousControls = { ...this.userPreferences.granularControls };
        Object.assign(this.userPreferences.granularControls, controls);
        
        // 設定の保存
        this.saveUserPreferences();
        
        this.notifyConfigListeners('granularControls', {
            previous: previousControls,
            current: this.userPreferences.granularControls
        });
        
        console.log('Granular motion controls updated:', this.userPreferences.granularControls);
    }
    
    /**
     * 選択的モーション軽減設定の更新
     */
    updateSelectiveReduction(reductions) {
        const previousReductions = { ...this.userPreferences.selectiveReduction };
        Object.assign(this.userPreferences.selectiveReduction, reductions);
        
        // 設定の保存
        this.saveUserPreferences();
        
        this.notifyConfigListeners('selectiveReduction', {
            previous: previousReductions,
            current: this.userPreferences.selectiveReduction
        });
        
        console.log('Selective motion reduction updated:', this.userPreferences.selectiveReduction);
    }
    
    /**
     * 前庭安全ガイドラインの検証
     */
    validateVestibularSafety(animationParams) {
        if (!this.config.vestibularSafety) return true;
        
        const guidelines = this.config.vestibularGuidelines;
        const violations = [];
        
        // 回転速度チェック
        if (animationParams.rotationSpeed > guidelines.maxRotationSpeed) {
            violations.push({
                type: 'rotation_speed',
                value: animationParams.rotationSpeed,
                limit: guidelines.maxRotationSpeed
            });
        }
        
        // スケール変更チェック
        if (animationParams.scaleChange > guidelines.maxScaleChange) {
            violations.push({
                type: 'scale_change',
                value: animationParams.scaleChange,
                limit: guidelines.maxScaleChange
            });
        }
        
        // パララックス距離チェック
        if (animationParams.parallaxDistance > guidelines.maxParallaxDistance) {
            violations.push({
                type: 'parallax_distance',
                value: animationParams.parallaxDistance,
                limit: guidelines.maxParallaxDistance
            });
        }
        
        // 点滅頻度チェック
        if (animationParams.flashingRate > guidelines.flashingThreshold) {
            violations.push({
                type: 'flashing_rate',
                value: animationParams.flashingRate,
                limit: guidelines.flashingThreshold
            });
        }
        
        if (violations.length > 0) {
            this.motionManager.stats.vestibularWarnings++;
            console.warn('Vestibular safety violations detected:', violations);
            return false;
        }
        
        return true;
    }
    
    /**
     * 危険なパターンの検出
     */
    detectHazardousPattern(pattern, value) {
        const hazard = this.hazardPatterns[pattern];
        if (!hazard) return false;
        
        const wasDetected = hazard.detected;
        hazard.detected = value > hazard.threshold;
        
        if (hazard.detected && !wasDetected) {
            this.notifyConfigListeners('hazardDetected', { pattern, value, threshold: hazard.threshold });
            console.warn(`Hazardous motion pattern detected: ${pattern} (${value} > ${hazard.threshold})`);
        }
        
        return hazard.detected;
    }
    
    /**
     * 設定リスナーの追加
     */
    addConfigListener(listener) {
        this.configListeners.add(listener);
    }
    
    /**
     * 設定リスナーの削除
     */
    removeConfigListener(listener) {
        this.configListeners.delete(listener);
    }
    
    /**
     * 設定変更の通知
     */
    notifyConfigListeners(type, data) {
        this.configListeners.forEach(listener => {
            try {
                listener(type, data);
            } catch (error) {
                console.error('Config listener error:', error);
            }
        });
    }
    
    /**
     * 設定の統計情報取得
     */
    getConfigStats() {
        return {
            currentLevel: this.motionManager.currentLevel,
            globalReducedMotion: this.config.globalReducedMotion,
            vestibularSafety: this.config.vestibularSafety,
            enabledCategories: Object.entries(this.config.motionCategories)
                .filter(([_, config]) => config.enabled)
                .map(([category]) => category),
            hazardDetections: Object.entries(this.hazardPatterns)
                .filter(([_, hazard]) => hazard.detected)
                .map(([pattern]) => pattern)
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        this.configListeners.clear();
        
        console.log('[MotionConfigManager] Component destroyed');
    }
}