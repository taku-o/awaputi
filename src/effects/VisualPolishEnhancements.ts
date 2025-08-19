/**
 * Visual Polish Enhancements
 * 視覚効果の最終的な仕上げと品質改善
 */

// Type definitions for visual polish and enhancement systems
interface GameEngine {
    enhancedEffectManager?: EnhancedEffectManager;
    enhancedParticleManager?: EnhancedParticleManager;
    animationManager?: AnimationManager;
}

interface EnhancedEffectManager {
    setTransitionSmoothing(enabled: boolean, duration: number): void;
    setGradientProfiles(profiles: GradientProfiles): void;
}

interface EnhancedParticleManager {
    enableSmoothTransitions(enabled: boolean): void;
    setTimingProfiles(profiles: TimingProfiles): void;
    setColorPalettes(palettes: ColorPalettes): void;
    setPhysicsEnhancements(enhancements: PhysicsEnhancements): void;
}

interface AnimationManager {
    setEasingFunctions(functions: EasingFunctions): void;
    setSubtleAnimations(animations: SubtleAnimations): void;
}

interface PolishSettings {
    smoothTransitions: boolean;
    enhancedTiming: boolean;
    refinedColors: boolean;
    improvedPhysics: boolean;
    subtleAnimations: boolean;
}

interface TimingProfile {
    duration: number;
    fadeStart?: number;
    scaleStart?: number;
    particleDelay?: number;
}

interface ComboTimingProfile {
    basic: { duration: number; intensity: number };
    enhanced: { duration: number; intensity: number };
    spectacular: { duration: number; intensity: number };
}

interface ScreenEffectsProfile {
    flash: { duration: number; fadeOut: number };
    shake: { duration: number; intensity: number };
}

interface TimingProfiles {
    bubble_pop: TimingProfile;
    combo_effect: ComboTimingProfile;
    screen_effects: ScreenEffectsProfile;
}

interface EasingFunction {
    (t: number): number;
}

interface EasingFunctions {
    easeOutQuart: EasingFunction;
    easeInOutCubic: EasingFunction;
    easeOutElastic: EasingFunction;
    easeOutBounce: EasingFunction;
}

interface ColorPalettes {
    bubble_effects: {
        normal: string[];
        rainbow: string[];
        electric: string[];
        spiky: string[];
        diamond: string[];
    };
    combo_effects: {
        basic: string[];
        enhanced: string[];
        spectacular: string[];
    };
    seasonal: {
        spring: string[];
        summer: string[];
        autumn: string[];
        winter: string[];
    };
}

interface GradientProfile {
    type: 'radial' | 'linear';
    colors: string[];
    stops: number[];
}

interface GradientProfiles {
    bubble_destruction: GradientProfile;
    combo_glow: GradientProfile;
    screen_flash: GradientProfile;
}

interface PhysicsProfile {
    gravity?: number;
    airResistance?: number;
    bounce?: number;
    spin?: boolean;
    tumble?: boolean;
    floatiness?: number;
    wobble?: number;
    surface_tension?: number;
    wave_propagation?: boolean;
    energy_conservation?: boolean;
    momentum_transfer?: boolean;
}

interface PhysicsEnhancements {
    particle_physics: PhysicsProfile;
    bubble_physics: PhysicsProfile;
    effect_physics: PhysicsProfile;
}

interface SubtleAnimation {
    enabled: boolean;
    amplitude?: number;
    frequency?: number;
    phase_offset?: number;
    scale_range?: [number, number];
    duration?: number;
    opacity_range?: [number, number];
    delay?: number;
    intensity_range?: [number, number];
    easing?: string;
}

interface SubtleAnimations {
    idle_floating: SubtleAnimation;
    breathing_effect: SubtleAnimation;
    shimmer_effect: SubtleAnimation;
    glow_pulse: SubtleAnimation;
}

type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

interface QualityProfile {
    smoothTransitions: boolean;
    enhancedTiming: boolean;
    refinedColors: boolean;
    improvedPhysics: boolean;
    subtleAnimations: boolean;
}

export class VisualPolishEnhancements {
    private gameEngine: GameEngine;
    private enabled: boolean;
    private polishSettings: PolishSettings;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.enabled = true;
        
        // 仕上げ設定
        this.polishSettings = {
            smoothTransitions: true,
            enhancedTiming: true,
            refinedColors: true,
            improvedPhysics: true,
            subtleAnimations: true
        };
        
        this.initialize();
    }

    private initialize(): void {
        this.setupTransitionSmoothing();
        this.setupTimingEnhancements();
        this.setupColorRefinements();
        this.setupPhysicsImprovements();
        this.setupSubtleAnimations();
    }

    private setupTransitionSmoothing(): void {
        if (!this.polishSettings.smoothTransitions) return;
        
        // エフェクト遷移の滑らかさを改善
        const enhancedEffectManager = this.gameEngine.enhancedEffectManager;
        if (enhancedEffectManager) {
            enhancedEffectManager.setTransitionSmoothing(true, 300); // 300ms duration
        }
        
        // パーティクル遷移の改善
        const enhancedParticleManager = this.gameEngine.enhancedParticleManager;
        if (enhancedParticleManager) {
            enhancedParticleManager.enableSmoothTransitions(true);
        }
    }

    private setupTimingEnhancements(): void {
        if (!this.polishSettings.enhancedTiming) return;
        
        // エフェクトタイミングの最適化
        this.setupOptimalEffectTimings();
        
        // アニメーションカーブの改善
        this.setupImprovedEasing();
    }

    private setupOptimalEffectTimings(): void {
        const timingProfiles: TimingProfiles = {
            bubble_pop: {
                duration: 800,
                fadeStart: 0.6,
                scaleStart: 0.0,
                particleDelay: 50
            },
            combo_effect: {
                basic: { duration: 1000, intensity: 1.0 },
                enhanced: { duration: 1500, intensity: 1.5 },
                spectacular: { duration: 2000, intensity: 2.0 }
            },
            screen_effects: {
                flash: { duration: 150, fadeOut: 300 },
                shake: { duration: 400, intensity: 8 }
            }
        };
        
        // タイミングプロファイルを適用
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setTimingProfiles(timingProfiles);
        }
    }

    private setupImprovedEasing(): void {
        // 高品質なイージング関数
        const easingFunctions: EasingFunctions = {
            easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),
            easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeOutElastic: (t: number): number => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
            },
            easeOutBounce: (t: number): number => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) {
                    return n1 * t * t;
                } else if (t < 2 / d1) {
                    return n1 * (t -= 1.5 / d1) * t + 0.75;
                } else if (t < 2.5 / d1) {
                    return n1 * (t -= 2.25 / d1) * t + 0.9375;
                } else {
                    return n1 * (t -= 2.625 / d1) * t + 0.984375;
                }
            }
        };
        
        // アニメーションマネージャーにイージング関数を設定
        if (this.gameEngine.animationManager) {
            this.gameEngine.animationManager.setEasingFunctions(easingFunctions);
        }
    }

    private setupColorRefinements(): void {
        if (!this.polishSettings.refinedColors) return;
        
        // 洗練されたカラーパレット
        const refinedColorPalettes: ColorPalettes = {
            bubble_effects: {
                normal: ['#4A90E2', '#7B68EE', '#9370DB'],
                rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F39C12', '#E74C3C', '#9B59B6'],
                electric: ['#00D4FF', '#0099CC', '#0066FF', '#FFFFFF'],
                spiky: ['#FF4757', '#FF3838', '#FF6B6B'],
                diamond: ['#C7ECEE', '#DCEDC1', '#FFD93D', '#6BCF7F']
            },
            combo_effects: {
                basic: ['#FFD700', '#FFA500', '#FF8C00'],
                enhanced: ['#FF69B4', '#FF1493', '#DC143C'],
                spectacular: ['#00FF7F', '#00CED1', '#1E90FF', '#9400D3', '#FF69B4']
            },
            seasonal: {
                spring: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD'],
                summer: ['#FFD700', '#FF7F50', '#32CD32', '#00CED1'],
                autumn: ['#FF8C00', '#DC143C', '#B8860B', '#8B4513'],
                winter: ['#B0C4DE', '#AFEEEE', '#F0F8FF', '#E0E6F8']
            }
        };
        
        // カラーパレットを適用
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setColorPalettes(refinedColorPalettes);
        }
        
        // グラデーション効果の改善
        this.setupGradientEnhancements();
    }

    private setupGradientEnhancements(): void {
        const gradientProfiles: GradientProfiles = {
            bubble_destruction: {
                type: 'radial',
                colors: ['rgba(255, 255, 255, 0.8)', 'rgba(100, 150, 255, 0.6)', 'rgba(50, 100, 200, 0.2)'],
                stops: [0, 0.5, 1.0]
            },
            combo_glow: {
                type: 'radial',
                colors: ['rgba(255, 215, 0, 0.9)', 'rgba(255, 140, 0, 0.5)', 'rgba(255, 69, 0, 0.1)'],
                stops: [0, 0.6, 1.0]
            },
            screen_flash: {
                type: 'linear',
                colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.0)'],
                stops: [0, 0.3, 1.0]
            }
        };
        
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.setGradientProfiles(gradientProfiles);
        }
    }

    private setupPhysicsImprovements(): void {
        if (!this.polishSettings.improvedPhysics) return;
        
        // より自然な物理挙動
        const physicsEnhancements: PhysicsEnhancements = {
            particle_physics: {
                gravity: 0.3,
                airResistance: 0.95,
                bounce: 0.7,
                spin: true,
                tumble: true
            },
            bubble_physics: {
                floatiness: 0.8,
                wobble: 0.2,
                surface_tension: 0.1
            },
            effect_physics: {
                wave_propagation: true,
                energy_conservation: true,
                momentum_transfer: true
            }
        };
        
        // 物理設定を適用
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setPhysicsEnhancements(physicsEnhancements);
        }
    }

    private setupSubtleAnimations(): void {
        if (!this.polishSettings.subtleAnimations) return;
        
        // 繊細なアニメーション効果
        const subtleAnimations: SubtleAnimations = {
            idle_floating: {
                enabled: true,
                amplitude: 2,
                frequency: 0.01,
                phase_offset: Math.PI / 4
            },
            breathing_effect: {
                enabled: true,
                scale_range: [0.98, 1.02],
                duration: 3000
            },
            shimmer_effect: {
                enabled: true,
                opacity_range: [0.7, 1.0],
                duration: 2000,
                delay: 500
            },
            glow_pulse: {
                enabled: true,
                intensity_range: [0.5, 1.2],
                duration: 1500,
                easing: 'easeInOutSine'
            }
        };
        
        // アニメーション設定を適用
        if (this.gameEngine.animationManager) {
            this.gameEngine.animationManager.setSubtleAnimations(subtleAnimations);
        }
    }

    // 動的品質調整
    public adjustVisualQuality(qualityLevel: QualityLevel): void {
        const qualityProfiles: Record<QualityLevel, QualityProfile> = {
            low: {
                smoothTransitions: false,
                enhancedTiming: false,
                refinedColors: false,
                improvedPhysics: false,
                subtleAnimations: false
            },
            medium: {
                smoothTransitions: true,
                enhancedTiming: false,
                refinedColors: true,
                improvedPhysics: false,
                subtleAnimations: false
            },
            high: {
                smoothTransitions: true,
                enhancedTiming: true,
                refinedColors: true,
                improvedPhysics: true,
                subtleAnimations: false
            },
            ultra: {
                smoothTransitions: true,
                enhancedTiming: true,
                refinedColors: true,
                improvedPhysics: true,
                subtleAnimations: true
            }
        };
        
        const profile = qualityProfiles[qualityLevel] || qualityProfiles.medium;
        this.polishSettings = { ...this.polishSettings, ...profile };
        
        // 設定を再適用
        this.applyPolishSettings();
    }

    private applyPolishSettings(): void {
        if (this.polishSettings.smoothTransitions) {
            this.setupTransitionSmoothing();
        }
        
        if (this.polishSettings.enhancedTiming) {
            this.setupTimingEnhancements();
        }
        
        if (this.polishSettings.refinedColors) {
            this.setupColorRefinements();
        }
        
        if (this.polishSettings.improvedPhysics) {
            this.setupPhysicsImprovements();
        }
        
        if (this.polishSettings.subtleAnimations) {
            this.setupSubtleAnimations();
        }
    }

    // パフォーマンス最適化用メソッド
    public optimizeForPerformance(): void {
        // パフォーマンス重視の設定
        this.polishSettings = {
            smoothTransitions: false,
            enhancedTiming: false,
            refinedColors: false,
            improvedPhysics: false,
            subtleAnimations: false
        };
        
        this.applyPolishSettings();
    }

    // 品質重視用メソッド
    public optimizeForQuality(): void {
        // 品質重視の設定
        this.polishSettings = {
            smoothTransitions: true,
            enhancedTiming: true,
            refinedColors: true,
            improvedPhysics: true,
            subtleAnimations: true
        };
        
        this.applyPolishSettings();
    }

    // 設定管理
    public getPolishSettings(): PolishSettings {
        return { ...this.polishSettings };
    }

    public setPolishSetting(key: keyof PolishSettings, value: boolean): void {
        if (key in this.polishSettings) {
            this.polishSettings[key] = value;
            this.applyPolishSettings();
        }
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        
        if (!enabled) {
            this.optimizeForPerformance();
        }
    }

    public isEnabled(): boolean {
        return this.enabled;
    }
}

// グローバルアクセス用
declare global {
    interface Window {
        VisualPolishEnhancements: typeof VisualPolishEnhancements;
    }
}

window.VisualPolishEnhancements = VisualPolishEnhancements;