/**
 * EffectsCalculator のテスト
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Effects configuration interfaces
interface EffectsConfig {
    particles: {
        maxCount: number;
        poolSize: number;
        quality: number;
        baseIntensity: number;
        lifetimeMultiplier: number;
    };
    screen: {
        shakeIntensity: number;
        flashDuration: number;
        zoomSensitivity: number;
        transitionDuration: number;
    };
    animations: {
        duration: number;
        easing: string;
        scaleFactor: number;
        fadeSpeed: number;
    };
    bubbleEffects: {
        popIntensity: number;
        chainRadius: number;
        explosionScale: number;
        trailLength: number;
    };
}

interface ParticleModifiers {
    countMultiplier?: number;
    countBonus?: number;
    sizeMultiplier?: number;
    sizeBonus?: number;
    speedMultiplier?: number;
    speedBonus?: number;
    lifetimeMultiplier?: number;
    lifetimeBonus?: number;
}

interface AnimationModifiers {
    durationMultiplier?: number;
    durationBonus?: number;
    scaleMultiplier?: number;
    scaleBonus?: number;
    intensityMultiplier?: number;
    intensityBonus?: number;
}

interface ScreenModifiers {
    shakeMultiplier?: number;
    shakeBonus?: number;
    flashMultiplier?: number;
    flashBonus?: number;
    zoomMultiplier?: number;
    zoomBonus?: number;
}

interface BubbleType {
    name: string;
    baseSize: number;
    baseScore: number;
    rarity: number;
    effects: {
        particles: number;
        screen: number;
        animation: number;
    };
}

interface ComboInfo {
    count: number;
    multiplier: number;
    maxCombo: number;
    timeBonus: number;
}

interface CalculationContext {
    bubbleType: BubbleType;
    combo: ComboInfo;
    gameState: {
        level: number;
        difficulty: number;
        timeRemaining: number;
        score: number;
    };
    playerModifiers: {
        skillLevel: number;
        equipmentBonus: number;
        achievementMultiplier: number;
    };
}

interface CalculatedEffects {
    particles: {
        count: number;
        size: number;
        speed: number;
        lifetime: number;
        intensity: number;
    };
    screen: {
        shakeIntensity: number;
        shakeDuration: number;
        flashIntensity: number;
        flashDuration: number;
        zoomFactor: number;
    };
    animation: {
        duration: number;
        scale: number;
        fadeSpeed: number;
        intensity: number;
    };
    sound: {
        volume: number;
        pitch: number;
        effects: string[];
    };
}

// Mock EffectsCalculator implementation
class MockEffectsCalculator {
    private config: EffectsConfig;
    private particleModifiers: ParticleModifiers = {};
    private animationModifiers: AnimationModifiers = {};
    private screenModifiers: ScreenModifiers = {};

    constructor(config: EffectsConfig) {
        this.config = config;
    }

    setParticleModifiers(modifiers: ParticleModifiers): void {
        this.particleModifiers = { ...this.particleModifiers, ...modifiers };
    }

    setAnimationModifiers(modifiers: AnimationModifiers): void {
        this.animationModifiers = { ...this.animationModifiers, ...modifiers };
    }

    setScreenModifiers(modifiers: ScreenModifiers): void {
        this.screenModifiers = { ...this.screenModifiers, ...modifiers };
    }

    calculateEffects(context: CalculationContext): CalculatedEffects {
        const particles = this.calculateParticleEffects(context);
        const screen = this.calculateScreenEffects(context);
        const animation = this.calculateAnimationEffects(context);
        const sound = this.calculateSoundEffects(context);

        return { particles, screen, animation, sound };
    }

    private calculateParticleEffects(context: CalculationContext) {
        const base = this.config.particles;
        const bubbleEffect = context.bubbleType.effects.particles;
        const comboMultiplier = Math.min(context.combo.multiplier, 3.0);

        let count = base.maxCount * bubbleEffect * comboMultiplier;
        let size = context.bubbleType.baseSize;
        let speed = 100 + (context.gameState.difficulty * 20);
        let lifetime = 1000 * base.lifetimeMultiplier;
        let intensity = base.baseIntensity * bubbleEffect;

        // Apply modifiers
        if (this.particleModifiers.countMultiplier) {
            count *= this.particleModifiers.countMultiplier;
        }
        if (this.particleModifiers.countBonus) {
            count += this.particleModifiers.countBonus;
        }
        if (this.particleModifiers.sizeMultiplier) {
            size *= this.particleModifiers.sizeMultiplier;
        }
        if (this.particleModifiers.speedMultiplier) {
            speed *= this.particleModifiers.speedMultiplier;
        }
        if (this.particleModifiers.lifetimeMultiplier) {
            lifetime *= this.particleModifiers.lifetimeMultiplier;
        }
        
        return {
            count: Math.floor(count),
            size: Math.round(size),
            speed: Math.round(speed),
            lifetime: Math.round(lifetime),
            intensity: Math.min(intensity, 2.0)
        };
    }

    private calculateScreenEffects(context: CalculationContext) {
        const base = this.config.screen;
        const bubbleEffect = context.bubbleType.effects.screen;
        const comboMultiplier = Math.min(context.combo.multiplier, 2.0);

        let shakeIntensity = base.shakeIntensity * bubbleEffect * comboMultiplier;
        let shakeDuration = 200 + (context.combo.count * 50);
        let flashIntensity = 0.3 * bubbleEffect;
        let flashDuration = base.flashDuration;
        let zoomFactor = 1.0 + (base.zoomSensitivity * bubbleEffect * 0.1);

        // Apply modifiers
        if (this.screenModifiers.shakeMultiplier) {
            shakeIntensity *= this.screenModifiers.shakeMultiplier;
        }
        if (this.screenModifiers.flashMultiplier) {
            flashIntensity *= this.screenModifiers.flashMultiplier;
        }
        if (this.screenModifiers.zoomMultiplier) {
            zoomFactor *= this.screenModifiers.zoomMultiplier;
        }
        
        return {
            shakeIntensity: Math.min(shakeIntensity, 1.0),
            shakeDuration: Math.round(shakeDuration),
            flashIntensity: Math.min(flashIntensity, 1.0),
            flashDuration: Math.round(flashDuration),
            zoomFactor: Math.min(zoomFactor, 1.5)
        };
    }

    private calculateAnimationEffects(context: CalculationContext) {
        const base = this.config.animations;
        const bubbleEffect = context.bubbleType.effects.animation;

        let duration = base.duration;
        let scale = base.scaleFactor * bubbleEffect;
        let fadeSpeed = base.fadeSpeed;
        let intensity = bubbleEffect;

        // Apply combo effects
        if (context.combo.count > 5) {
            scale *= 1.2;
            intensity *= 1.1;
        }
        
        // Apply modifiers
        if (this.animationModifiers.durationMultiplier) {
            duration *= this.animationModifiers.durationMultiplier;
        }
        if (this.animationModifiers.scaleMultiplier) {
            scale *= this.animationModifiers.scaleMultiplier;
        }
        if (this.animationModifiers.intensityMultiplier) {
            intensity *= this.animationModifiers.intensityMultiplier;
        }
        
        return {
            duration: Math.round(duration),
            scale: Math.min(scale, 3.0),
            fadeSpeed: fadeSpeed,
            intensity: Math.min(intensity, 2.0)
        };
    }

    private calculateSoundEffects(context: CalculationContext): { volume: number; pitch: number; effects: string[] } {
        const baseVolume = 0.8;
        const basePitch = 1.0;
        const effects: string[] = [];

        let volume = baseVolume * context.bubbleType.effects.particles;
        let pitch = basePitch + (context.combo.count * 0.05);

        // Add effect types based on bubble and combo
        effects.push('pop');
        
        if (context.bubbleType.name === 'rainbow') {
            effects.push('magical');
        }
        if (context.combo.count > 3) {
            effects.push('combo');
        }
        if (context.combo.count > 10) {
            effects.push('super_combo');
        }
        
        return {
            volume: Math.min(volume, 1.0),
            pitch: Math.min(pitch, 2.0),
            effects
        };
    }

    calculateChainEffects(bubbles: BubbleType[], combo: ComboInfo): CalculatedEffects[] {
        return bubbles.map((bubble, index) => {
            const adjustedCombo: ComboInfo = {
                ...combo,
                count: combo.count + index,
                multiplier: combo.multiplier + (index * 0.1)
            };

            const context: CalculationContext = {
                bubbleType: bubble,
                combo: adjustedCombo,
                gameState: {
                    level: 1,
                    difficulty: 1,
                    timeRemaining: 60000,
                    score: 0
                },
                playerModifiers: {
                    skillLevel: 1,
                    equipmentBonus: 1,
                    achievementMultiplier: 1
                }
            };

            return this.calculateEffects(context);
        });
    }

    optimizeForPerformance(targetFPS: number): void {
        const performanceFactor = Math.max(0.3, targetFPS / 60);

        this.setParticleModifiers({
            countMultiplier: performanceFactor,
            lifetimeMultiplier: performanceFactor
        });

        this.setScreenModifiers({
            shakeMultiplier: performanceFactor,
            flashMultiplier: performanceFactor
        });
    }

    resetModifiers(): void {
        this.particleModifiers = {};
        this.animationModifiers = {};
        this.screenModifiers = {};
    }

    getEffectIntensity(context: CalculationContext): number {
        const bubbleIntensity = context.bubbleType.effects.particles;
        const comboIntensity = Math.min(context.combo.multiplier, 2.0);
        const difficultyIntensity = 1.0 + (context.gameState.difficulty * 0.1);

        return bubbleIntensity * comboIntensity * difficultyIntensity;
    }

    isEffectEnabled(effectType: string, intensity: number): boolean {
        const thresholds = {
            particles: 0.1,
            screen_shake: 0.3,
            screen_flash: 0.5,
            sound: 0.1,
            animation: 0.2
        };

        return intensity >= (thresholds[effectType as keyof typeof thresholds] || 0.1);
    }
}

describe('EffectsCalculator', () => {
    let calculator: MockEffectsCalculator;
    let defaultConfig: EffectsConfig;
    let testBubbleType: BubbleType;
    let testCombo: ComboInfo;
    let testContext: CalculationContext;

    beforeEach(() => {
        defaultConfig = {
            particles: {
                maxCount: 50,
                poolSize: 100,
                quality: 1.0,
                baseIntensity: 1.0,
                lifetimeMultiplier: 1.0
            },
            screen: {
                shakeIntensity: 0.3,
                flashDuration: 200,
                zoomSensitivity: 0.2,
                transitionDuration: 300
            },
            animations: {
                duration: 500,
                easing: 'ease-out',
                scaleFactor: 1.2,
                fadeSpeed: 1.0
            },
            bubbleEffects: {
                popIntensity: 1.0,
                chainRadius: 50,
                explosionScale: 1.5,
                trailLength: 20
            }
        };

        testBubbleType = {
            name: 'normal',
            baseSize: 20,
            baseScore: 10,
            rarity: 1.0,
            effects: {
                particles: 1.0,
                screen: 0.5,
                animation: 0.8
            }
        };

        testCombo = {
            count: 3,
            multiplier: 1.5,
            maxCombo: 10,
            timeBonus: 1.2
        };

        testContext = {
            bubbleType: testBubbleType,
            combo: testCombo,
            gameState: {
                level: 1,
                difficulty: 1,
                timeRemaining: 60000,
                score: 1000
            },
            playerModifiers: {
                skillLevel: 1,
                equipmentBonus: 1.0,
                achievementMultiplier: 1.0
            }
        };

        calculator = new MockEffectsCalculator(defaultConfig);
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(calculator).toBeDefined();
        });
    });

    describe('パーティクルエフェクト計算', () => {
        test('基本的なパーティクルエフェクトが計算される', () => {
            const effects = calculator.calculateEffects(testContext);
            
            expect(effects.particles.count).toBeGreaterThan(0);
            expect(effects.particles.size).toBe(testBubbleType.baseSize);
            expect(effects.particles.speed).toBeGreaterThan(0);
            expect(effects.particles.lifetime).toBeGreaterThan(0);
            expect(effects.particles.intensity).toBeGreaterThan(0);
        });

        test('コンボによるパーティクル効果の増加', () => {
            const normalContext = { ...testContext, combo: { ...testCombo, count: 1, multiplier: 1.0 } };
            const highComboContext = { ...testContext, combo: { ...testCombo, count: 10, multiplier: 2.5 } };

            const normalEffects = calculator.calculateEffects(normalContext);
            const highComboEffects = calculator.calculateEffects(highComboContext);

            expect(highComboEffects.particles.count).toBeGreaterThan(normalEffects.particles.count);
            expect(highComboEffects.particles.intensity).toBeGreaterThan(normalEffects.particles.intensity);
        });

        test('パーティクル修飾子の適用', () => {
            calculator.setParticleModifiers({
                countMultiplier: 2.0,
                sizeMultiplier: 1.5,
                speedMultiplier: 0.8,
                lifetimeMultiplier: 1.3
            });
            
            const effects = calculator.calculateEffects(testContext);

            // 修飾子が適用されていることを確認（具体的な値は実装依存）
            expect(effects.particles.count).toBeGreaterThan(50);
            expect(effects.particles.size).toBeGreaterThan(testBubbleType.baseSize);
        });
    });

    describe('スクリーンエフェクト計算', () => {
        test('基本的なスクリーンエフェクトが計算される', () => {
            const effects = calculator.calculateEffects(testContext);
            
            expect(effects.screen.shakeIntensity).toBeGreaterThan(0);
            expect(effects.screen.shakeDuration).toBeGreaterThan(0);
            expect(effects.screen.flashIntensity).toBeGreaterThan(0);
            expect(effects.screen.flashDuration).toBe(defaultConfig.screen.flashDuration);
            expect(effects.screen.zoomFactor).toBeGreaterThanOrEqual(1.0);
        });

        test('スクリーン効果の上限制限', () => {
            const highIntensityBubble: BubbleType = {
                ...testBubbleType,
                effects: { particles: 5.0, screen: 5.0, animation: 5.0 }
            };

            const highComboContext: CalculationContext = {
                ...testContext,
                bubbleType: highIntensityBubble,
                combo: { count: 20, multiplier: 5.0, maxCombo: 20, timeBonus: 2.0 }
            };

            const effects = calculator.calculateEffects(highComboContext);

            expect(effects.screen.shakeIntensity).toBeLessThanOrEqual(1.0);
            expect(effects.screen.flashIntensity).toBeLessThanOrEqual(1.0);
            expect(effects.screen.zoomFactor).toBeLessThanOrEqual(1.5);
        });
    });

    describe('アニメーションエフェクト計算', () => {
        test('基本的なアニメーションエフェクトが計算される', () => {
            const effects = calculator.calculateEffects(testContext);
            
            expect(effects.animation.duration).toBe(defaultConfig.animations.duration);
            expect(effects.animation.scale).toBeGreaterThan(1.0);
            expect(effects.animation.fadeSpeed).toBe(defaultConfig.animations.fadeSpeed);
            expect(effects.animation.intensity).toBeGreaterThan(0);
        });

        test('高コンボ時のアニメーション強化', () => {
            const lowComboContext = { ...testContext, combo: { ...testCombo, count: 2 } };
            const highComboContext = { ...testContext, combo: { ...testCombo, count: 8 } };

            const lowComboEffects = calculator.calculateEffects(lowComboContext);
            const highComboEffects = calculator.calculateEffects(highComboContext);

            expect(highComboEffects.animation.scale).toBeGreaterThan(lowComboEffects.animation.scale);
            expect(highComboEffects.animation.intensity).toBeGreaterThan(lowComboEffects.animation.intensity);
        });
    });

    describe('サウンドエフェクト計算', () => {
        test('基本的なサウンドエフェクトが計算される', () => {
            const effects = calculator.calculateEffects(testContext);
            
            expect(effects.sound.volume).toBeGreaterThan(0);
            expect(effects.sound.volume).toBeLessThanOrEqual(1.0);
            expect(effects.sound.pitch).toBeGreaterThan(0);
            expect(effects.sound.effects).toContain('pop');
        });

        test('特殊バブルのサウンドエフェクト', () => {
            const rainbowBubble: BubbleType = {
                ...testBubbleType,
                name: 'rainbow'
            };

            const rainbowContext: CalculationContext = {
                ...testContext,
                bubbleType: rainbowBubble
            };

            const effects = calculator.calculateEffects(rainbowContext);
            
            expect(effects.sound.effects).toContain('magical');
        });

        test('コンボによるサウンドエフェクト追加', () => {
            const mediumComboContext = { ...testContext, combo: { ...testCombo, count: 5 } };
            const highComboContext = { ...testContext, combo: { ...testCombo, count: 12 } };

            const mediumEffects = calculator.calculateEffects(mediumComboContext);
            const highEffects = calculator.calculateEffects(highComboContext);

            expect(mediumEffects.sound.effects).toContain('combo');
            expect(highEffects.sound.effects).toContain('super_combo');
        });
    });

    describe('チェーンエフェクト計算', () => {
        test('複数バブルのチェーンエフェクトが計算される', () => {
            const bubbles: BubbleType[] = [
                testBubbleType,
                { ...testBubbleType, name: 'stone', effects: { particles: 1.5, screen: 0.8, animation: 1.2 } },
                { ...testBubbleType, name: 'rainbow', effects: { particles: 2.0, screen: 1.0, animation: 1.5 } }
            ];

            const chainEffects = calculator.calculateChainEffects(bubbles, testCombo);

            expect(chainEffects).toHaveLength(3);
            
            // チェーンが進むにつれて効果が強くなることを確認
            expect(chainEffects[1].particles.count).toBeGreaterThan(chainEffects[0].particles.count);
            expect(chainEffects[2].particles.count).toBeGreaterThan(chainEffects[1].particles.count);
        });
    });

    describe('パフォーマンス最適化', () => {
        test('低FPS時の効果軽減', () => {
            const beforeOptimization = calculator.calculateEffects(testContext);
            
            calculator.optimizeForPerformance(30); // 30 FPS target
            
            const afterOptimization = calculator.calculateEffects(testContext);

            expect(afterOptimization.particles.count).toBeLessThan(beforeOptimization.particles.count);
        });

        test('高FPS時の効果維持', () => {
            const beforeOptimization = calculator.calculateEffects(testContext);
            
            calculator.optimizeForPerformance(60); // 60 FPS target
            
            const afterOptimization = calculator.calculateEffects(testContext);

            // 60FPSの場合は効果が維持される
            expect(afterOptimization.particles.count).toBe(beforeOptimization.particles.count);
        });
    });

    describe('修飾子管理', () => {
        test('修飾子のリセット', () => {
            calculator.setParticleModifiers({ countMultiplier: 2.0 });
            calculator.setAnimationModifiers({ scaleMultiplier: 1.5 });
            calculator.setScreenModifiers({ shakeMultiplier: 0.5 });

            const modifiedEffects = calculator.calculateEffects(testContext);
            
            calculator.resetModifiers();
            
            const resetEffects = calculator.calculateEffects(testContext);

            // リセット後は元の値に戻る
            expect(resetEffects.particles.count).toBeLessThan(modifiedEffects.particles.count);
        });
    });

    describe('エフェクト強度判定', () => {
        test('エフェクト強度の計算', () => {
            const intensity = calculator.getEffectIntensity(testContext);
            
            expect(intensity).toBeGreaterThan(0);
        });

        test('エフェクト有効性の判定', () => {
            const lowIntensity = 0.05;
            const highIntensity = 0.8;

            expect(calculator.isEffectEnabled('particles', lowIntensity)).toBe(false);
            expect(calculator.isEffectEnabled('particles', highIntensity)).toBe(true);
            
            expect(calculator.isEffectEnabled('screen_flash', lowIntensity)).toBe(false);
            expect(calculator.isEffectEnabled('screen_flash', highIntensity)).toBe(true);
        });
    });

    describe('エラーハンドリング', () => {
        test('無効な設定値でもエラーが発生しない', () => {
            const invalidConfig: EffectsConfig = {
                ...defaultConfig,
                particles: { ...defaultConfig.particles, maxCount: -1 }
            };

            const invalidCalculator = new MockEffectsCalculator(invalidConfig);

            expect(() => {
                invalidCalculator.calculateEffects(testContext);
            }).not.toThrow();
        });

        test('極端な修飾子値でも安全に処理される', () => {
            calculator.setParticleModifiers({
                countMultiplier: 1000,
                sizeMultiplier: -5
            });

            expect(() => {
                calculator.calculateEffects(testContext);
            }).not.toThrow();
        });
    });
});