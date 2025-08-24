import { getErrorHandler } from '../utils/ErrorHandler.js';
import { MotionConfigManager } from './motion/MotionConfigManager.js';
import { AnimationController } from './motion/AnimationController.js';
import { VestibularSafetyManager } from './motion/VestibularSafetyManager.js';

export interface MotionConfig {
    enabled: boolean;
    globalReducedMotion: boolean;
    respectSystemPreference: boolean;
    vestibularSafety: boolean;
    motionLevels: { [key: string]: string };
    motionCategories: { [key: string]: MotionCategory };
    vestibularGuidelines: VestibularGuidelines;
}

export interface MotionCategory {
    enabled: boolean;
    intensity: number;
    duration: number;
}

export interface VestibularGuidelines {
    maxRotationSpeed: number;
    maxScaleChange: number;
    maxParallaxDistance: number;
    flashingThreshold: number;
    autoplayPause: number;
}

export interface PerformanceMonitor {
    frameRate: number;
    droppedFrames: number;
    animationCount: number;
    lastFrameTime: number;
}

export interface MotionStats {
    animationsControlled: number;
    animationsPaused: number;
    animationsReduced: number;
    vestibularWarnings: number;
    performanceAdjustments: number;
    sessionStart: number;
    motionLevel: string;
    vestibularSafety: boolean;
    autoReduceOnPerformance: boolean;
    customIntensities: Map<string, number>;
    flashingSensitivity: string;
    parallaxSensitivity: string;
    granularControls: GranularControls;
    selectiveReduction: SelectiveReduction;
}

export interface GranularControls {
    animationIntensity: number;
    transitionSpeed: number;
    effectsLevel: number;
    particleDensity: number;
    cameraMovement: number;
    backgroundMotion: number;
}

export interface SelectiveReduction {
    disableRotation: boolean;
    disableScaling: boolean;
    disableParallax: boolean;
    disableParticles: boolean;
    disableCameraShake: boolean;
    disableBackgroundAnimation: boolean;
}

export interface HazardPattern {
    threshold: number;
    detected: boolean;
}

/**
 * MotionManager (Main Controller)
 * モーション管理システムの軽量オーケストレーター
 * Main Controller Patternによる軽量化実装
 */
export class MotionManager {
    private visualAccessibilityManager: any;
    private accessibilityManager: any;
    private gameEngine: any;
    private config: MotionConfig;
    private currentLevel: string;
    private activeAnimations: Map<string, any>;
    private pausedAnimations: Set<string>;
    private animationObservers: Map<string, any>;
    private performanceMonitor: PerformanceMonitor;
    private stats: MotionStats;
    private hazardPatterns: { [key: string]: HazardPattern };
    private configManager: MotionConfigManager;
    private animationController: AnimationController;
    private vestibularSafetyManager: VestibularSafetyManager;

    constructor(visualAccessibilityManager: any) {
        this.visualAccessibilityManager = visualAccessibilityManager;
        this.accessibilityManager = visualAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // モーション設定
        this.config = {
            enabled: true,
            globalReducedMotion: false,
            respectSystemPreference: true,
            vestibularSafety: true,
            motionLevels: {
                none: 'すべてのアニメーションを無効',
                essential: '重要なアニメーションのみ',
                reduced: '軽減されたアニメーション',
                normal: '通常のアニメーション',
                enhanced: '強化されたアニメーション'
            },
            motionCategories: {
                transitions: { enabled: true, intensity: 1.0, duration: 1.0 },
                transforms: { enabled: true, intensity: 1.0, duration: 1.0 },
                parallax: { enabled: true, intensity: 0.5, duration: 1.0 },
                particles: { enabled: true, intensity: 0.8, duration: 1.0 },
                camera: { enabled: true, intensity: 0.3, duration: 1.0 },
                ui: { enabled: true, intensity: 1.0, duration: 1.0 },
                game: { enabled: true, intensity: 0.9, duration: 1.0 },
                background: { enabled: true, intensity: 0.6, duration: 1.0 }
            },
            vestibularGuidelines: {
                maxRotationSpeed: 360, // 度/秒
                maxScaleChange: 2.0,
                maxParallaxDistance: 100, // ピクセル
                flashingThreshold: 3, // 回/秒
                autoplayPause: 5000 // 5秒で自動停止
            }
        };
        
        // 現在の状態
        this.currentLevel = 'normal';
        this.activeAnimations = new Map();
        this.pausedAnimations = new Set();
        this.animationObservers = new Map();
        
        // パフォーマンス監視
        this.performanceMonitor = {
            frameRate: 60,
            droppedFrames: 0,
            animationCount: 0,
            lastFrameTime: 0
        };
        
        // 統計情報
        this.stats = {
            animationsControlled: 0,
            animationsPaused: 0,
            animationsReduced: 0,
            vestibularWarnings: 0,
            performanceAdjustments: 0,
            sessionStart: Date.now(),
            motionLevel: 'normal',
            vestibularSafety: true,
            autoReduceOnPerformance: true,
            customIntensities: new Map(),
            flashingSensitivity: 'medium',
            parallaxSensitivity: 'medium',
            granularControls: {
                animationIntensity: 1.0,
                transitionSpeed: 1.0,
                effectsLevel: 1.0,
                particleDensity: 1.0,
                cameraMovement: 0.5,
                backgroundMotion: 0.8
            },
            selectiveReduction: {
                disableRotation: false,
                disableScaling: false,
                disableParallax: false,
                disableParticles: false,
                disableCameraShake: false,
                disableBackgroundAnimation: false
            }
        };
        
        // 危険なモーションパターンの検出
        this.hazardPatterns = {
            rapidFlashing: { threshold: 3, detected: false },
            rapidRotation: { threshold: 720, detected: false },
            extremeZoom: { threshold: 3.0, detected: false },
            violentShaking: { threshold: 20, detected: false }
        };
        
        // サブコンポーネントの初期化（依存注入）
        this.configManager = new MotionConfigManager(this);
        this.animationController = new AnimationController(this);
        this.vestibularSafetyManager = new VestibularSafetyManager(this);

        console.log('[MotionManager] Main Controller initialized with sub-components');
        this.initialize();
    }

    /**
     * システム初期化
     */
    async initialize(): Promise<void> {
        try {
            console.log('[MotionManager] Initializing motion management system...');
            
            // システムのモーション設定を確認
            await this.detectSystemMotionPreferences();
            
            // サブコンポーネントの初期化
            await this.configManager.initialize();
            await this.animationController.initialize();
            await this.vestibularSafetyManager.initialize();
            
            // パフォーマンス監視を開始
            this.startPerformanceMonitoring();
            
            // 危険パターン監視を開始
            this.startHazardPatternMonitoring();
            
            console.log('[MotionManager] Initialization completed successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'MOTION_MANAGER_INIT_ERROR', {
                component: 'MotionManager',
                operation: 'initialize'
            });
            throw error;
        }
    }

    /**
     * システムのモーション設定を検出
     */
    async detectSystemMotionPreferences(): Promise<void> {
        try {
            // prefers-reduced-motion メディアクエリを確認
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (prefersReducedMotion.matches && this.config.respectSystemPreference) {
                console.log('[MotionManager] System prefers reduced motion, applying settings');
                await this.setMotionLevel('reduced');
            }
            
            // メディアクエリの変更を監視
            prefersReducedMotion.addEventListener('change', (event) => {
                if (this.config.respectSystemPreference) {
                    this.setMotionLevel(event.matches ? 'reduced' : 'normal');
                }
            });
            
            // バッテリー状態による自動調整
            if ('getBattery' in navigator) {
                try {
                    const battery = await (navigator as any).getBattery();
                    if (battery.level < 0.2) { // バッテリー残量20%未満
                        console.log('[MotionManager] Low battery detected, reducing motion');
                        await this.setMotionLevel('reduced');
                    }
                } catch (error) {
                    console.warn('[MotionManager] Battery API not available');
                }
            }
            
        } catch (error) {
            console.warn('[MotionManager] Failed to detect system preferences:', error);
        }
    }

    /**
     * モーションレベルを設定
     */
    async setMotionLevel(level: string): Promise<void> {
        if (!this.config.motionLevels[level]) {
            throw new Error(`Invalid motion level: ${level}`);
        }
        
        const oldLevel = this.currentLevel;
        this.currentLevel = level;
        
        console.log(`[MotionManager] Motion level changed: ${oldLevel} → ${level}`);
        
        // レベルに応じた設定を適用
        await this.applyMotionLevel(level);
        
        // 統計を更新
        this.stats.motionLevel = level;
        
        // イベントを発火
        this.notifyMotionLevelChange(oldLevel, level);
    }

    /**
     * モーションレベルを適用
     */
    async applyMotionLevel(level: string): Promise<void> {
        const reductionMap: { [key: string]: number } = {
            'none': 0,
            'essential': 0.2,
            'reduced': 0.5,
            'normal': 1.0,
            'enhanced': 1.5
        };
        
        const intensityMultiplier = reductionMap[level] || 1.0;
        
        // 各カテゴリの設定を更新
        for (const category in this.config.motionCategories) {
            const categoryConfig = this.config.motionCategories[category];
            
            if (level === 'none') {
                categoryConfig.enabled = false;
            } else {
                categoryConfig.enabled = true;
                categoryConfig.intensity = intensityMultiplier;
            }
        }
        
        // 既存のアニメーションに適用
        await this.animationController.applyIntensityChanges(intensityMultiplier);
        
        // CSS変数を更新
        this.updateCSSVariables();
    }

    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring(): void {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            frameCount++;
            
            if (deltaTime >= 1000) { // 1秒ごとに計算
                const fps = Math.round((frameCount * 1000) / deltaTime);
                this.performanceMonitor.frameRate = fps;
                this.performanceMonitor.animationCount = this.activeAnimations.size;
                
                // パフォーマンスが低下している場合は自動調整
                if (fps < 30 && this.stats.autoReduceOnPerformance) {
                    this.handleLowPerformance();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }

    /**
     * 低パフォーマンス時の処理
     */
    async handleLowPerformance(): Promise<void> {
        console.warn('[MotionManager] Low performance detected, reducing motion complexity');
        
        if (this.currentLevel === 'enhanced') {
            await this.setMotionLevel('normal');
        } else if (this.currentLevel === 'normal') {
            await this.setMotionLevel('reduced');
        }
        
        // パフォーマンス調整統計を更新
        this.stats.performanceAdjustments++;
    }

    /**
     * 危険パターン監視を開始
     */
    startHazardPatternMonitoring(): void {
        // フラッシング検出
        this.monitorFlashing();
        
        // 回転速度監視
        this.monitorRotationSpeed();
        
        // ズーム変化監視
        this.monitorZoomChanges();
        
        // シェイク検出
        this.monitorShaking();
    }

    /**
     * フラッシング監視
     */
    monitorFlashing(): void {
        let flashCount = 0;
        let lastBrightness = this.getCurrentBrightness();
        
        setInterval(() => {
            const currentBrightness = this.getCurrentBrightness();
            const brightnessDelta = Math.abs(currentBrightness - lastBrightness);
            
            if (brightnessDelta > 0.3) { // 30%以上の明度変化
                flashCount++;
            }
            
            // 3秒間で閾値を超えた場合
            if (flashCount >= this.hazardPatterns.rapidFlashing.threshold) {
                this.handleHazardousPattern('rapidFlashing');
                flashCount = 0;
            }
            
            lastBrightness = currentBrightness;
        }, 1000);
    }

    /**
     * アニメーションの登録
     */
    registerAnimation(id: string, animation: any): void {
        this.activeAnimations.set(id, animation);
        this.stats.animationsControlled++;
        
        // 前庭安全性チェック
        if (this.config.vestibularSafety) {
            this.vestibularSafetyManager.validateAnimation(animation);
        }
    }

    /**
     * アニメーションの削除
     */
    unregisterAnimation(id: string): void {
        this.activeAnimations.delete(id);
        this.pausedAnimations.delete(id);
    }

    /**
     * 全アニメーションの一時停止
     */
    pauseAllAnimations(): void {
        for (const [id, animation] of this.activeAnimations) {
            if (animation.pause && typeof animation.pause === 'function') {
                animation.pause();
                this.pausedAnimations.add(id);
            }
        }
        
        this.stats.animationsPaused += this.pausedAnimations.size;
    }

    /**
     * 全アニメーションの再開
     */
    resumeAllAnimations(): void {
        for (const id of this.pausedAnimations) {
            const animation = this.activeAnimations.get(id);
            if (animation && animation.resume && typeof animation.resume === 'function') {
                animation.resume();
            }
        }
        
        this.pausedAnimations.clear();
    }

    /**
     * CSS変数を更新
     */
    updateCSSVariables(): void {
        const root = document.documentElement;
        
        // グローバル設定
        root.style.setProperty('--motion-enabled', this.config.enabled ? '1' : '0');
        root.style.setProperty('--motion-reduced', this.config.globalReducedMotion ? '1' : '0');
        
        // カテゴリ別設定
        for (const [category, config] of Object.entries(this.config.motionCategories)) {
            root.style.setProperty(`--motion-${category}-enabled`, config.enabled ? '1' : '0');
            root.style.setProperty(`--motion-${category}-intensity`, config.intensity.toString());
            root.style.setProperty(`--motion-${category}-duration`, config.duration.toString());
        }
        
        // 粒度制御
        const controls = this.stats.granularControls;
        root.style.setProperty('--animation-intensity', controls.animationIntensity.toString());
        root.style.setProperty('--transition-speed', controls.transitionSpeed.toString());
        root.style.setProperty('--effects-level', controls.effectsLevel.toString());
    }

    /**
     * 危険パターンの処理
     */
    handleHazardousPattern(patternType: string): void {
        console.warn(`[MotionManager] Hazardous pattern detected: ${patternType}`);
        
        this.hazardPatterns[patternType].detected = true;
        this.stats.vestibularWarnings++;
        
        // 自動的に安全な設定に切り替え
        switch (patternType) {
            case 'rapidFlashing':
                this.config.motionCategories.transitions.intensity *= 0.5;
                break;
            case 'rapidRotation':
                this.stats.selectiveReduction.disableRotation = true;
                break;
            case 'extremeZoom':
                this.stats.selectiveReduction.disableScaling = true;
                break;
            case 'violentShaking':
                this.stats.selectiveReduction.disableCameraShake = true;
                break;
        }
        
        this.updateCSSVariables();
        
        // ユーザーに通知（アクセシビリティマネージャー経由）
        if (this.visualAccessibilityManager && this.visualAccessibilityManager.notifyMotionWarning) {
            this.visualAccessibilityManager.notifyMotionWarning(patternType);
        }
    }

    /**
     * モーションレベル変更通知
     */
    notifyMotionLevelChange(oldLevel: string, newLevel: string): void {
        const event = new CustomEvent('motionLevelChange', {
            detail: { oldLevel, newLevel }
        });
        window.dispatchEvent(event);
    }

    /**
     * 現在の明度を取得（簡易実装）
     */
    getCurrentBrightness(): number {
        // 実際の実装ではCanvas解析などを使用
        return Math.random(); // プレースホルダー
    }

    /**
     * 回転速度監視
     */
    monitorRotationSpeed(): void {
        // 実装のプレースホルダー
    }

    /**
     * ズーム変化監視
     */
    monitorZoomChanges(): void {
        // 実装のプレースホルダー
    }

    /**
     * シェイク検出
     */
    monitorShaking(): void {
        // 実装のプレースホルダー
    }

    /**
     * 統計情報を取得
     */
    getStats(): MotionStats {
        return { ...this.stats };
    }

    /**
     * 診断情報を取得
     */
    getDiagnostics(): any {
        return {
            config: this.config,
            currentLevel: this.currentLevel,
            activeAnimations: this.activeAnimations.size,
            pausedAnimations: this.pausedAnimations.size,
            performanceMonitor: this.performanceMonitor,
            hazardPatterns: this.hazardPatterns,
            stats: this.stats
        };
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<MotionConfig>): void {
        Object.assign(this.config, newConfig);
        this.updateCSSVariables();
        console.log('[MotionManager] Configuration updated');
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        // アクティブなアニメーションをすべて停止
        this.pauseAllAnimations();
        
        // サブコンポーネントをクリーンアップ
        if (this.configManager) {
            this.configManager.destroy();
        }
        if (this.animationController) {
            this.animationController.destroy();
        }
        if (this.vestibularSafetyManager) {
            this.vestibularSafetyManager.destroy();
        }
        
        // データをクリア
        this.activeAnimations.clear();
        this.pausedAnimations.clear();
        this.animationObservers.clear();
        
        console.log('[MotionManager] Destroyed successfully');
    }
}

// シングルトンインスタンス
let motionManagerInstance: MotionManager | null = null;

/**
 * MotionManagerシングルトンインスタンスの取得
 */
export function getMotionManager(): MotionManager | null {
    return motionManagerInstance;
}

/**
 * MotionManagerシングルトンインスタンスの作成
 */
export function createMotionManager(visualAccessibilityManager: any): MotionManager {
    if (!motionManagerInstance) {
        motionManagerInstance = new MotionManager(visualAccessibilityManager);
    }
    return motionManagerInstance;
}