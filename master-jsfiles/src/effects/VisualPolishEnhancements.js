/**
 * Visual Polish Enhancements
 * 視覚効果の最終的な仕上げと品質改善
 */

export class VisualPolishEnhancements {
    constructor(gameEngine) {
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

    initialize() {
        this.setupTransitionSmoothing();
        this.setupTimingEnhancements();
        this.setupColorRefinements();
        this.setupPhysicsImprovements();
        this.setupSubtleAnimations();
    }

    setupTransitionSmoothing() {
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

    setupTimingEnhancements() {
        if (!this.polishSettings.enhancedTiming) return;
        
        // エフェクトタイミングの最適化
        this.setupOptimalEffectTimings();
        
        // アニメーションカーブの改善
        this.setupImprovedEasing();
    }

    setupOptimalEffectTimings() {
        const timingProfiles = {
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

    setupImprovedEasing() {
        // 高品質なイージング関数
        const easingFunctions = {
            easeOutQuart: t => 1 - Math.pow(1 - t, 4),
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeOutElastic: t => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
            },
            easeOutBounce: t => {
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

    setupColorRefinements() {
        if (!this.polishSettings.refinedColors) return;
        
        // 洗練されたカラーパレット
        const refinedColorPalettes = {
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

    setupGradientEnhancements() {
        const gradientProfiles = {
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

    setupPhysicsImprovements() {
        if (!this.polishSettings.improvedPhysics) return;
        
        // より自然な物理挙動
        const physicsEnhancements = {
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

    setupSubtleAnimations() {
        if (!this.polishSettings.subtleAnimations) return;
        
        // 繊細なアニメーション効果
        const subtleAnimations = {
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
    adjustVisualQuality(qualityLevel) {
        const qualityProfiles = {
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

    applyPolishSettings() {
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
    optimizeForPerformance() {
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
    optimizeForQuality() {
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
    getPolishSettings() {
        return { ...this.polishSettings };
    }

    setPolishSetting(key, value) {
        if (key in this.polishSettings) {
            this.polishSettings[key] = value;
            this.applyPolishSettings();
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            this.optimizeForPerformance();
        }
    }

    isEnabled() {
        return this.enabled;
    }
}

// グローバルアクセス用
window.VisualPolishEnhancements = VisualPolishEnhancements;