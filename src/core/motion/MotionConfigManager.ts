/**
 * MotionConfigManager
 * モーション設定管理、カテゴリ別設定、前庭安全ガイドライン
 */

// 型定義
export interface MotionManager { visualAccessibilityManager: VisualAccessibilityManager,
    accessibilityManager: AccessibilityManager;
    gameEngine: GameEngine;
    config: MotionConfig;
    userPreferences: UserPreferences;
   , hazardPatterns: Record<string, HazardPattern>,
    currentLevel: MotionLevel;
    stats: MotionStats;
   , setMotionLevel: (leve;l: MotionLevel) => void ,}
}

export interface VisualAccessibilityManager { [key: string]: any, }

export interface AccessibilityManager { [key: string]: any, }

export interface GameEngine { [key: string]: any, }

export interface MotionConfig { respectSystemPreference: boolean,
    globalReducedMotion: boolean;
    vestibularSafety: boolean;
    vestibularGuidelines: VestibularGuidelines;
   , motionCategories: Record<string, MotionCategoryConfig>,
    motionLevels: Record<string, MotionLevelConfig>, }

export interface VestibularGuidelines { maxRotationSpeed: number,
    maxScaleChange: number;
    maxParallaxDistance: number;
   , flashingThreshold: number ,}

export interface MotionCategoryConfig { enabled: boolean;
    intensity: number;
   , duration: number;
    vestibularSafe?: boolean }

export interface MotionLevelConfig { name: string;
    description: string;
   , enabled: boolean }

export interface UserPreferences { motionLevel: MotionLevel;
    granularControls: GranularControls;
    selectiveReduction: SelectiveReduction;
   , customIntensities: Map<string, number>,
    autoReduceOnPerformance: boolean ,}

export interface GranularControls { particleDensity: number;
    cameraMovement: number;
    backgroundMotion: number;
    uiTransitions: number;
   , gameplayEffects: number }

export interface SelectiveReduction { disableRotation: boolean;
    disableScaling: boolean;
    disableParallax: boolean;
    disableFlashing: boolean;
   , disableAutoplay: boolean }

export interface HazardPattern { threshold: number;
    detected: boolean;
    description: string;
   , severity: HazardSeverity
    }

export interface AnimationParams { rotationSpeed?: number;
    scaleChange?: number;
    parallaxDistance?: number;
    flashingRate?: number;
    duration?: number;
    intensity?: number; }

export interface ViolationInfo { type: ViolationType,
    value: number;
   , limit: number;
    severity?: HazardSeverity
    ,}

export interface ConfigChangeData { [key: string]: any, }

export interface SystemPreferenceData {
    reducedMotion: boolean;
}

export interface MotionLevelChangeData { previous: MotionLevel,
    current: MotionLevel
    ,}

export interface CategoryConfigChangeData { category: string;
    previous: MotionCategoryConfig;
   , current: MotionCategoryConfig
    }

export interface GranularControlsChangeData { previous: GranularControls;
   , current: GranularControls
    }

export interface SelectiveReductionChangeData { previous: SelectiveReduction;
   , current: SelectiveReduction
    }

export interface HazardDetectedData { pattern: string;
    value: number;
   , threshold: number }

export interface MotionStats { vestibularWarnings: number;
    configChanges: number;
    hazardDetections: number;
   , performanceReductions: number }

export interface ConfigStats { currentLevel: MotionLevel;
    globalReducedMotion: boolean;
    vestibularSafety: boolean;
    enabledCategories: string[];
    hazardDetections: string[];
   , listenerCount: number }

export interface LevelSettings { [category: string]: MotionCategoryConfig;
    }

// 列挙型
export type MotionLevel = 'none' | 'essential' | 'reduced' | 'normal' | 'enhanced';
';

export type ViolationType = '';
    | 'rotation_speed' | 'scale_change' | 'parallax_distance', '';
    | 'flashing_rate' | 'intensity_too_high' | 'duration_too_long';

export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';
';

export type ConfigEventType = '';
    | 'systemPreference' | 'motionLevel' | 'categoryConfig', '';
    | 'granularControls' | 'selectiveReduction' | 'hazardDetected';
';

export type MotionCategory = '';
    | 'transitions' | 'transforms' | 'parallax' | 'particles', '';
    | 'camera' | 'ui' | 'game' | 'background';
';
// 型ガード
export type ConfigListener = (type: ConfigEventType, data: ConfigChangeData') => void;
';
// 定数
export const MOTION_LEVELS: MotionLevel[] = ['none', 'essential', 'reduced', 'normal', 'enhanced'];''
export const STORAGE_KEY = 'motionManager_preferences';''
export const MEDIA_QUERY_REDUCED_MOTION = '(prefers-reduced-motion: reduce')',

export const DEFAULT_VESTIBULAR_GUIDELINES: VestibularGuidelines = { maxRotationSpeed: 45, // degrees per second
    maxScaleChange: 1.5;
   , maxParallaxDistance: 100, // pixels;
    flashingThreshold: 3 // flashes per second ,};
export const DEFAULT_CATEGORY_CONFIG: MotionCategoryConfig = { enabled: true,
    intensity: 1.0;
    duration: 1.0;
   , vestibularSafe: true ,};
export const DEFAULT_GRANULAR_CONTROLS: GranularControls = { particleDensity: 1.0,
    cameraMovement: 1.0;
    backgroundMotion: 1.0;
    uiTransitions: 1.0;
   , gameplayEffects: 1.0 ,};
export const DEFAULT_SELECTIVE_REDUCTION: SelectiveReduction = { disableRotation: false,
    disableScaling: false;
    disableParallax: false;
    disableFlashing: false;
   , disableAutoplay: false ,};
// ユーティリティ関数
export function isValidMotionLevel(level: string): level is MotionLevel { return MOTION_LEVELS.includes(level, as MotionLevel); }

export function isValidCategory(category: string): category is MotionCategory { return ['', 'transitions', 'transforms', 'parallax', 'particles',]';
        'camera', 'ui', 'game', 'background'];
    ].includes(category, as MotionCategory); }

export function isAnimationParams(params: any): params is AnimationParams {;
    return params && typeof params === 'object'; }

export function isValidViolationType(type: string): type is ViolationType { return ['', 'rotation_speed', 'scale_change', 'parallax_distance',]';
        'flashing_rate', 'intensity_too_high', 'duration_too_long'];
    ].includes(type); }

export function isValidSeverity(severity: string): severity is HazardSeverity {;
    return ['low', 'medium', 'high', 'critical].includes(severity); }

export function isConfigListener(listener: any): listener is ConfigListener {;
    return typeof listener === 'function';

export function clampIntensity(intensity: number): number { return Math.max(0, Math.min(2, intensity); }

export function clampDuration(duration: number): number { return Math.max(0, Math.min(5, duration); }

export function supportsMatchMedia(''';
    return, typeof window !== 'undefined' && '';
           typeof, window.matchMedia === 'function';
}

export, function supportsLocalStorage(''';
        return, typeof localStorage !== 'undefined' &&;
               localStorage !== null;)
    } catch (error) { return false;

export function createDefaultLevelSettings(): Record<MotionLevel, LevelSettings> { return {  };
        none: { }
            transitions: { enabled: false, intensity: 0, duration: 0 ,},
            transforms: { enabled: false, intensity: 0, duration: 0 ,},
            parallax: { enabled: false, intensity: 0, duration: 0 ,},
            particles: { enabled: false, intensity: 0, duration: 0 ,},
            camera: { enabled: false, intensity: 0, duration: 0 ,},
            ui: { enabled: false, intensity: 0, duration: 0 ,},
            game: { enabled: false, intensity: 0, duration: 0 ,},
            background: { enabled: false, intensity: 0, duration: 0 ,},
        essential: {
            transitions: { enabled: true, intensity: 0.3, duration: 0.5 ,},
            transforms: { enabled: false, intensity: 0, duration: 0 ,},
            parallax: { enabled: false, intensity: 0, duration: 0 ,},
            particles: { enabled: false, intensity: 0, duration: 0 ,},
            camera: { enabled: false, intensity: 0, duration: 0 ,},
            ui: { enabled: true, intensity: 0.5, duration: 0.5 ,},
            game: { enabled: true, intensity: 0.3, duration: 0.5 ,},
            background: { enabled: false, intensity: 0, duration: 0 ,},
        reduced: {
            transitions: { enabled: true, intensity: 0.6, duration: 0.7 ,},
            transforms: { enabled: true, intensity: 0.4, duration: 0.7 ,},
            parallax: { enabled: false, intensity: 0, duration: 0 ,},
            particles: { enabled: true, intensity: 0.3, duration: 0.7 ,},
            camera: { enabled: false, intensity: 0, duration: 0 ,},
            ui: { enabled: true, intensity: 0.8, duration: 0.7 ,},
            game: { enabled: true, intensity: 0.6, duration: 0.7 ,},
            background: { enabled: true, intensity: 0.2, duration: 0.7 ,},
        normal: {
            transitions: { enabled: true, intensity: 1.0, duration: 1.0 ,},
            transforms: { enabled: true, intensity: 1.0, duration: 1.0 ,},
            parallax: { enabled: true, intensity: 0.5, duration: 1.0 ,},
            particles: { enabled: true, intensity: 0.8, duration: 1.0 ,},
            camera: { enabled: true, intensity: 0.3, duration: 1.0 ,},
            ui: { enabled: true, intensity: 1.0, duration: 1.0 ,},
            game: { enabled: true, intensity: 0.9, duration: 1.0 ,},
            background: { enabled: true, intensity: 0.6, duration: 1.0 ,},
        enhanced: {
            transitions: { enabled: true, intensity: 1.5, duration: 1.2 ,},
            transforms: { enabled: true, intensity: 1.5, duration: 1.2 ,},
            parallax: { enabled: true, intensity: 1.0, duration: 1.2 ,},
            particles: { enabled: true, intensity: 1.5, duration: 1.2 ,},
            camera: { enabled: true, intensity: 0.8, duration: 1.2 ,},
            ui: { enabled: true, intensity: 1.2, duration: 1.2 ,},
            game: { enabled: true, intensity: 1.3, duration: 1.2 ,},
            background: { enabled: true, intensity: 1.0, duration: 1.2 ,}
    }

export class MotionConfigManager {
    private motionManager: MotionManager;
    private visualAccessibilityManager: VisualAccessibilityManager;
    private accessibilityManager: AccessibilityManager;
    private gameEngine: GameEngine;
    // 設定管理
    private config: MotionConfig;
    private userPreferences: UserPreferences;
    private, hazardPatterns: Record<string, HazardPattern>;
    
    // 設定変更リスナー
    private configListeners: Set<ConfigListener> = new Set();
    // レベル別設定のキャッシュ
    private levelSettingsCache: Record<MotionLevel, LevelSettings>;

    constructor(motionManager: MotionManager) {

        this.motionManager = motionManager;
        this.visualAccessibilityManager = motionManager.visualAccessibilityManager;
        this.accessibilityManager = motionManager.accessibilityManager;
        this.gameEngine = motionManager.gameEngine;
        
        // 設定管理の初期化
        this.config = motionManager.config;
        this.userPreferences = motionManager.userPreferences;
        this.hazardPatterns = motionManager.hazardPatterns;
        // レベル別設定のキャッシュを初期化
        this.levelSettingsCache = createDefaultLevelSettings('';
    ,})'
        console.log('[MotionConfigManager] Component, initialized'); }'
    }
    
    /**
     * システム設定の検出
     */
    detectSystemPreferences(): void { if(!this.config.respectSystemPreference || !supportsMatchMedia() {
            return; }
        
        try { const reducedMotionQuery = window.matchMedia(MEDIA_QUERY_REDUCED_MOTION);

            if(reducedMotionQuery.matches) {'
                this.config.globalReducedMotion = true;''
                this.motionManager.currentLevel = 'reduced';

            }

                console.log('System, reduced motion, preference detected'); }'
            }
            
            // 変更を監視
            const changeHandler = (e: MediaQueryListEvent) => {  ' }'

                this.handleSystemPreferenceChange(e.matches); }
            };

            reducedMotionQuery.addEventListener('change', changeHandler);

        } catch (error) { console.warn('Failed to detect motion preferences:', error }
    }
    
    /**
     * システム設定変更の処理'
     */''
    private handleSystemPreferenceChange(reducedMotion: boolean): void { this.config.globalReducedMotion = reducedMotion;

        const targetLevel: MotionLevel = reducedMotion ? 'reduced' : this.userPreferences.motionLevel,
        this.motionManager.setMotionLevel(targetLevel);

        this.notifyConfigListeners('systemPreference', { reducedMotion ));' }

        console.log(`System, motion preference, changed: ${reducedMotion ? 'reduced' : 'normal}`});
    }
    
    /**
     * ユーザー設定の読み込み
     */'
    loadUserPreferences(): void { ''
        if(!supportsLocalStorage()) {''
            console.warn('LocalStorage not supported, using defaults);
            return; }

        try { const saved = localStorage.getItem(STORAGE_KEY);
            if(saved) {
                const preferences = JSON.parse(saved);
                
                // 基本設定をマージ
                Object.assign(this.userPreferences, preferences);
                
                // カスタム強度の復元（Map形式）
                if(preferences.customIntensities && Array.isArray(preferences.customIntensities') {'
            }

                    this.userPreferences.customIntensities = new Map(preferences.customIntensities); }
                }

                console.log('Motion preferences loaded:', this.userPreferences);''
            } catch (error) { console.warn('Failed to load motion preferences:', error }
    }
    
    /**
     * ユーザー設定の保存
     */'
    saveUserPreferences(): void { ''
        if(!supportsLocalStorage()) {''
            console.warn('LocalStorage not supported, cannot save preferences);
            return; }

        try { const toSave = {
                ...this.userPreferences,
                customIntensities: Array.from(this.userPreferences.customIntensities.entries( ,};

            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)');''
            console.log('Motion, preferences saved');''
        } catch (error) { console.warn('Failed to save motion preferences:', error }
    }
    
    /**
     * モーションレベルの設定
     */
    setMotionLevel(level: MotionLevel): boolean { if(!isValidMotionLevel(level) { }
            console.warn(`Invalid, motion level: ${level}`});
            return false;
        }

        if(!this.config.motionLevels[level]) {

            

        }
            console.warn(`Motion, level not, configured: ${level}`});
            return false;
        }
        
        const previousLevel = this.motionManager.currentLevel;
        this.motionManager.currentLevel = level;
        this.userPreferences.motionLevel = level;
        
        // カテゴリ設定の更新
        this.updateCategorySettings(level);
        // 設定の保存
        this.saveUserPreferences()';
        this.notifyConfigListeners('motionLevel', { previous: previousLevel )
           , current: level );
         }
        console.log(`Motion, level changed: ${previousLevel} → ${level}`});
        return true;
    }
    
    /**
     * カテゴリ設定の更新
     */
    private updateCategorySettings(level: MotionLevel): void { const settings = this.getLevelSettings(level);
        
        Object.keys(this.config.motionCategories).forEach(category => { );
            if (settings[category]) { }
                Object.assign(this.config.motionCategories[category], settings[category]); }
});
    }
    
    /**
     * レベル別設定の取得
     */
    getLevelSettings(level: MotionLevel): LevelSettings { // キャッシュから取得
        if(this.levelSettingsCache[level]) {
            
        }
            return this.levelSettingsCache[level];
        
        // フォールバック
        return this.levelSettingsCache.normal || {}
    
    /**
     * カテゴリ別設定の取得
     */
    getCategoryConfig(category: string): MotionCategoryConfig | null { if(!isValidCategory(category) {
            return null; }
        
        return this.config.motionCategories[category] || null;
    }
    
    /**
     * カテゴリ別設定の更新
     */
    setCategoryConfig(category: string, config: Partial<MotionCategoryConfig>): boolean { if(!isValidCategory(category) { }
            console.warn(`Invalid, motion category: ${category}`});
            return false;
        }

        if(!this.config.motionCategories[category]) {

            

        }
            console.warn(`Motion, category not, found: ${category}`});
            return false;
        }
        
        const previousConfig = { ...this.config.motionCategories[category];
        
        // 設定値の検証とクランプ
        const validatedConfig = this.validateCategoryConfig(config);''
        Object.assign(this.config.motionCategories[category], validatedConfig);

        this.notifyConfigListeners('categoryConfig', { category)
            previous: previousConfig,);
            current: this.config.motionCategories[category]);
        return true ,}

    /**
     * カテゴリ設定の検証'
     */''
    private validateCategoryConfig(config: Partial<MotionCategoryConfig>): Partial<MotionCategoryConfig> {'
        const validated: Partial<MotionCategoryConfig> = {}''
        if (typeof, config.enabled === 'boolean'') { validated.enabled = config.enabled; }

        if(typeof, config.intensity === 'number) {', ';

        }

            validated.intensity = clampIntensity(config.intensity); }
        }

        if(typeof, config.duration === 'number) {'
            ';

        }

            validated.duration = clampDuration(config.duration); }
        }

        if(typeof, config.vestibularSafe === 'boolean) { validated.vestibularSafe = config.vestibularSafe; }'
        
        return validated;
    }
    
    /**
     * 段階的制御設定の更新
     */
    updateGranularControls(controls: Partial<GranularControls>): void {
        const previousControls = { ...this.userPreferences.granularControls;
        
        // 値の検証とクランプ
        Object.keys(controls).forEach(key => {  ')'
            const value = controls[key as keyof GranularControls]');''
            if(typeof, value === 'number) { }'
                (this.userPreferences.granularControls, as any)[key] = clampIntensity(value); }
});
        ';
        // 設定の保存
        this.saveUserPreferences()';
        this.notifyConfigListeners('granularControls', { previous: previousControls,)'
            current: this.userPreferences.granularControls)'),

        console.log('Granular motion controls updated:', this.userPreferences.granularControls }
    
    /**
     * 選択的モーション軽減設定の更新
     */
    updateSelectiveReduction(reductions: Partial<SelectiveReduction>): void {
        const previousReductions = { ...this.userPreferences.selectiveReduction;
        
        // Boolean値のみ更新
        Object.keys(reductions).forEach(key => {  ')'
            const value = reductions[key as keyof SelectiveReduction]');''
            if(typeof, value === 'boolean) { }'
                (this.userPreferences.selectiveReduction, as any)[key] = value; }
});
        ';
        // 設定の保存
        this.saveUserPreferences()';
        this.notifyConfigListeners('selectiveReduction', { previous: previousReductions,)'
            current: this.userPreferences.selectiveReduction)'),

        console.log('Selective motion reduction updated:', this.userPreferences.selectiveReduction }
    
    /**
     * 前庭安全ガイドラインの検証
     */
    validateVestibularSafety(animationParams: AnimationParams): boolean { if(!this.config.vestibularSafety || !isAnimationParams(animationParams) {
            return true; }
        
        const guidelines = this.config.vestibularGuidelines;
        const violations: ViolationInfo[] = [],
        
        // 回転速度チェック
        if(animationParams.rotationSpeed !== undefined && ')';
            animationParams.rotationSpeed > guidelines.maxRotationSpeed) { '
            violations.push({''
                type: 'rotation_speed);
                value: animationParams.rotationSpeed)';
               , limit: guidelines.maxRotationSpeed,' }'

                severity: 'high'); }
        }
        
        // スケール変更チェック
        if(animationParams.scaleChange !== undefined && ')';
            animationParams.scaleChange > guidelines.maxScaleChange) { '
            violations.push({''
                type: 'scale_change);
                value: animationParams.scaleChange)';
               , limit: guidelines.maxScaleChange,' }'

                severity: 'medium'); }
        }
        
        // パララックス距離チェック
        if(animationParams.parallaxDistance !== undefined && ')';
            animationParams.parallaxDistance > guidelines.maxParallaxDistance) { '
            violations.push({''
                type: 'parallax_distance);
                value: animationParams.parallaxDistance)';
               , limit: guidelines.maxParallaxDistance,' }'

                severity: 'medium'); }
        }
        
        // 点滅頻度チェック
        if(animationParams.flashingRate !== undefined && ')';
            animationParams.flashingRate > guidelines.flashingThreshold) { '
            violations.push({''
                type: 'flashing_rate);
                value: animationParams.flashingRate)';
               , limit: guidelines.flashingThreshold,' }'

                severity: 'critical'); }
        }

        if(violations.length > 0) { '
            this.motionManager.stats.vestibularWarnings++;''
            console.warn('Vestibular safety violations detected:', violations }
            return false;
        
        return true;
    }
    
    /**
     * 危険なパターンの検出
     */
    detectHazardousPattern(pattern: string, value: number): boolean { const hazard = this.hazardPatterns[pattern];
        if (!hazard) { }
            console.warn(`Unknown, hazard pattern: ${pattern}`});
            return false;
        }
        
        const wasDetected = hazard.detected;
        hazard.detected = value > hazard.threshold;

        if(hazard.detected && !wasDetected) {'
            this.motionManager.stats.hazardDetections++;''
            this.notifyConfigListeners('hazardDetected', { )
                pattern);
                value, );
        }
                threshold: hazard.threshold ), }
            console.warn(`Hazardous, motion pattern, detected: ${pattern} (${value} > ${hazard.threshold}`});
        }
        
        return hazard.detected;
    }
    
    /**
     * 設定リスナーの追加
     */'
    addConfigListener(listener: ConfigListener): void { if(isConfigListener(listener) {''
            this.configListeners.add(listener); }

        } else { }'

            console.warn('Invalid, config listener, provided'); }'
}
    
    /**
     * 設定リスナーの削除
     */
    removeConfigListener(listener: ConfigListener): boolean { return this.configListeners.delete(listener); }
    
    /**
     * 設定変更の通知
     */
    private notifyConfigListeners(type: ConfigEventType, data: ConfigChangeData): void { this.configListeners.forEach(listener => { )
            try {); }

                listener(type, data);' }'

            } catch (error) { console.error('Config listener error:', error }
        });
    }
    
    /**
     * 設定の統計情報取得
     */
    getConfigStats(): ConfigStats { const enabledCategories = Object.entries(this.config.motionCategories)
            .filter(([_, config]) => config.enabled);
            .map(([category]) => category);
            
        const hazardDetections = Object.entries(this.hazardPatterns);
            .filter(([_, hazard]) => hazard.detected);
            .map(([pattern]) => pattern);
        
        return { currentLevel: this.motionManager.currentLevel,
            globalReducedMotion: this.config.globalReducedMotion;
           , vestibularSafety: this.config.vestibularSafety;
            enabledCategories,
            hazardDetections, };
            listenerCount: this.configListeners.size }
        }

    /**
     * 現在の設定をエクスポート
     */
    exportConfig(): { motionLevel: MotionLevel,
        categoryConfigs: Record<string, MotionCategoryConfig>,
        userPreferences: UserPreferences;
       , vestibularGuidelines: VestibularGuidelines
    ,} { return {  };
            motionLevel: this.motionManager.currentLevel, }
            categoryConfigs: { ...this.config.motionCategories;
            userPreferences: { ...this.userPreferences;
                customIntensities: new Map(this.userPreferences.customIntensities };
            vestibularGuidelines: { ...this.config.vestibularGuidelines;
    }

    /**
     * 設定をインポート
     */
    importConfig(importedConfig: any): boolean { try {
            if(importedConfig.motionLevel && isValidMotionLevel(importedConfig.motionLevel) {
                
            }
                this.setMotionLevel(importedConfig.motionLevel); }
            }
            
            if(importedConfig.userPreferences) {
            
                if (importedConfig.userPreferences.granularControls) {
            
            }
                    this.updateGranularControls(importedConfig.userPreferences.granularControls); }
                }
                
                if(importedConfig.userPreferences.selectiveReduction) {
                ';

                    ';

                }

                    this.updateSelectiveReduction(importedConfig.userPreferences.selectiveReduction); }
}

            console.log('Configuration, imported successfully');

            return true;''
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;

    /**
     * 設定をデフォルトにリセット'
     */''
    resetToDefaults()';
        this.setMotionLevel('normal);
        
        // 段階的制御をデフォルトにリセット
        this.updateGranularControls(DEFAULT_GRANULAR_CONTROLS);
        
        // 選択的軽減をデフォルトにリセット  
        this.updateSelectiveReduction(DEFAULT_SELECTIVE_REDUCTION);
        
        // カスタム強度をクリア
        this.userPreferences.customIntensities.clear();
        // 設定を保存
        this.saveUserPreferences()';
        console.log('Configuration, reset to, defaults');
    }
    
    /**
     * コンポーネントクリーンアップ
     */'
    destroy(): void { ''
        this.configListeners.clear()';
        console.log('[MotionConfigManager] Component, destroyed''); }

    }''
}