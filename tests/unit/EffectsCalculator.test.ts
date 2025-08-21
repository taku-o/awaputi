/**
 * EffectsCalculator のテスト
 */
import { jest, describe, test, expect, beforeEach  } from '@jest/globals';
import { EffectsCalculator  } from '../../src/core/EffectsCalculator.js';
// Effects configuration interfaces
interface EffectsConfig {
    particles: {
        maxCoun;t: number,
        poolSize: number,
        quality: number,
        baseIntensity: number,
        lifetimeMultiplier: number
    },
    screen: {
        shakeIntensity: number,
        flashDuration: number,
        zoomSensitivity: number,
        transitionDuration: number
    },
    animations: {
        duration: number,
        easing: string,
        scaleFactor: number,
        fadeSpeed: number
    },
    bubbleEffects: {
        popIntensity: number,
        chainRadius: number,
        explosionScale: number,
        trailLength: number,
    };
}
interface ParticleModifiers {
    countMultiplier?: number;
    countBonus?: number;
}
interface AnimationModifiers {
    durationMultiplier?: number;
    durationBonus?: number;
}
interface IntensityModifier {
    type: string,
    value?: number;
    min?: number;
    max?: number;
}
interface Position {
    x: number,
    y: number,
}
interface TrajectoryOptions {
    steps: number,
    gravity?: number;
    wind?: number;
    randomness?: number;
}
interface Color {
    r: number,
    g: number,
    b: number,
    a: number,
}
interface ScreenShake {
    amplitude: number,
    frequency: number,
    duration: number,
    easing: string,
}
interface ShakeOptions {
    easing?: string;
}
interface EffectContext {
    isCombo?: boolean;
    comboCount?: number;
    isBossStage?: boolean;
    remainingTime?: number;
}
interface PerformanceMetrics {
    fps: number,
    particleCount: number,
    memoryUsage: number,
    cpuUsage: number,
}
interface PerformanceOptimization {
    particleQuality: number,
    animationQuality: number,
    effectsEnabled: boolean,
    maxParticles: number,
    skipFrames: number,
}
interface DebugInfo {
    hasEffectsConfig: boolean,
    effectsConfig: EffectsConfig | null,
    version: string,
}
// モックEffectsConfig
class MockEffectsConfig {
    getEffectsConfig('): EffectsConfig {
        return {
            particles: {
                maxCount: 500,
                poolSize: 100,
                quality: 1.0,
                baseIntensity: 1.0,
                lifetimeMultiplier: 1.0
            },
            screen: {
                shakeIntensity: 1.0,
                flashDuration: 200,
                zoomSensitivity: 1.0,
                transitionDuration: 300
            },
            animations: {
                duration: 300,
                easing: 'easeOut',
                scaleFactor: 1.0,
                fadeSpeed: 1.0
            },
            bubbleEffects: {
                popIntensity: 1.0,
                chainRadius: 120,
                explosionScale: 1.0,
                trailLength: 1.0
            }
        };
    }
}
describe('EffectsCalculator', () => {
    let calculator: EffectsCalculator,
    let mockEffectsConfig: MockEffectsConfig,
    
    beforeEach(() => {
        mockEffectsConfig = new MockEffectsConfig();
        calculator = new EffectsCalculator(mockEffectsConfig);
    }');
    describe('基本機能', (') => {
        test('should initialize correctly', () => {
            expect(calculator).toBeInstanceOf(EffectsCalculator);
            expect(calculator.getDebugInfo().hasEffectsConfig).toBe(true);
        }');
        test('should work without EffectsConfig', () => {
            const calculatorWithoutConfig = new EffectsCalculator();
            expect(calculatorWithoutConfig.getDebugInfo().hasEffectsConfig).toBe(false');
            // デフォルト設定で動作することを確認
            const particleCount = calculatorWithoutConfig.calculateParticleCount('bubble_pop');
            expect(particleCount).toBe(8);
        }');
    }
    describe('パーティクル数計算', (') => {
        test('should calculate particle count correctly', (') => {
            expect(calculator.calculateParticleCount('bubble_pop').toBe(8');
            expect(calculator.calculateParticleCount('bubble_chain').toBe(15');
            expect(calculator.calculateParticleCount('bubble_explosion').toBe(25');
            expect(calculator.calculateParticleCount('boss_damage').toBe(30);
        }');
        test('should apply intensity modifier', (') => {
            expect(calculator.calculateParticleCount('bubble_pop', 0.5).toBe(4');
            expect(calculator.calculateParticleCount('bubble_pop', 2.0).toBe(16);
        }');
        test('should apply quality modifier', () => {
            // 品質を0.5に設定したモック
            const lowQualityConfig = {
                getEffectsConfig: ('): EffectsConfig => ({
                    particles: { maxCount: 500, poolSize: 100, quality: 0.5, baseIntensity: 1.0, lifetimeMultiplier: 1.0 },
                    screen: { shakeIntensity: 1.0, flashDuration: 200, zoomSensitivity: 1.0, transitionDuration: 300 },
                    animations: { duration: 300, easing: 'easeOut', scaleFactor: 1.0, fadeSpeed: 1.0 },
                    bubbleEffects: { popIntensity: 1.0, chainRadius: 120, explosionScale: 1.0, trailLength: 1.0 }
    });
            };
            const lowQualityCalculator = new EffectsCalculator(lowQualityConfig');
            expect(lowQualityCalculator.calculateParticleCount('bubble_pop').toBe(4); // 8 * 0.5
        }');
        test('should apply modifiers correctly', (') => {
            const modifiers: ParticleModifiers = {
                countMultiplier: 1.5,
                countBonus: 3
            };
            
            const result = calculator.calculateParticleCount('bubble_pop', 1.0, modifiers);
            expect(result).toBe(15); // (8 * 1.5) + 3
        }');
        test('should respect max count limit', (') => {
            const result = calculator.calculateParticleCount('bubble_pop', 100); // 非常に高い強度
            expect(result).toBeLessThanOrEqual(500); // maxCount制限
        }');
        test('should handle unknown effect type', (') => {
            expect(calculator.calculateParticleCount('unknown_effect').toBe(10); // デフォルト値
        }');
    }
    describe('アニメーション時間計算', (') => {
        test('should calculate animation duration correctly', (') => {
            expect(calculator.calculateAnimationDuration('bubble_pop').toBe(300); // 300 * (0.5 + 1.0 * 0.5') = 300
            expect(calculator.calculateAnimationDuration('bubble_chain').toBe(500); // 500 * (0.5 + 1.0 * 0.5') = 500
            expect(calculator.calculateAnimationDuration('screen_shake').toBe(200); // 200 * (0.5 + 1.0 * 0.5) = 200
        }');
        test('should apply complexity modifier', (') => {
            expect(calculator.calculateAnimationDuration('bubble_pop', 0.0).toBe(150'); // 300 * 0.5
            expect(calculator.calculateAnimationDuration('bubble_pop', 1.0).toBe(300); // 300 * 1.0
        }');
        test('should apply modifiers correctly', (') => {
            const modifiers: AnimationModifiers = {
                durationMultiplier: 1.5,
                durationBonus: 100
            };
            
            const result = calculator.calculateAnimationDuration('bubble_pop', 1.0, modifiers);
            expect(result).toBe(550); // (300 * 1.5) + 100
        }');
        test('should respect time limits', (') => {
            const modifiers: AnimationModifiers = { durationMultiplier: 20 }; // 非常に高い倍率
            const result = calculator.calculateAnimationDuration('bubble_pop', 1.0, modifiers);
            expect(result).toBeLessThanOrEqual(5000'); // 最大時間制限
            
            const shortResult = calculator.calculateAnimationDuration('bubble_pop', 0.01);
            expect(shortResult).toBeGreaterThanOrEqual(50); // 最小時間制限
        }');
        test('should handle unknown effect type', (') => {
            const result = calculator.calculateAnimationDuration('unknown_effect');
            expect(result).toBe(300); // デフォルト設定の300 * (0.5 + 1.0 * 0.5) = 300
        }');
    }
    describe('効果強度計算', (') => {
        test('should calculate effect intensity correctly', (') => {
            const modifiers: IntensityModifier[] = [
                { type: 'multiply', value: 2.0 },
                { type: 'add', value: 0.5 }
            ];
            
            const result = calculator.calculateEffectIntensity(1.0, modifiers);
            expect(result).toBe(2.5); // (1.0 * 2.0) + 0.5
        }');
        test('should handle power modifier', (') => {
            const modifiers: IntensityModifier[] = [{ type: 'power', value: 2 }];
            const result = calculator.calculateEffectIntensity(2.0, modifiers);
            expect(result).toBe(4.0); // 2.0^2
        }');
        test('should handle clamp modifier', (') => {
            const modifiers: IntensityModifier[] = [{ type: 'clamp', min: 0.5, max: 1.5 }];
            
            expect(calculator.calculateEffectIntensity(0.2, modifiers).toBe(0.5); // クランプ最小値
            expect(calculator.calculateEffectIntensity(2.0, modifiers).toBe(1.5); // クランプ最大値
            expect(calculator.calculateEffectIntensity(1.0, modifiers).toBe(1.0); // 範囲内
        }');
        test('should handle unknown modifier type', (') => {
            const modifiers: IntensityModifier[] = [{ type: 'unknown', value: 5 }];
            const result = calculator.calculateEffectIntensity(1.0, modifiers);
            expect(result).toBe(1.0); // 変更されない
        }');
        test('should respect final limits', () => {
            const result = calculator.calculateEffectIntensity(15.0, []); // 範囲外の値
            expect(result).toBeLessThanOrEqual(10); // 最大値制限
            
            const negativeResult = calculator.calculateEffectIntensity(-5.0, []);
            expect(negativeResult).toBeGreaterThanOrEqual(0); // 最小値制限
        }');
    }
    describe('画面シェイク計算', (') => {
        test('should calculate screen shake correctly', (') => {
            const shake: ScreenShake = calculator.calculateScreenShake('bubble_pop'),
            expect(shake.amplitude).toBe(2);
            expect(shake.frequency).toBe(8);
            expect(shake.duration).toBe(150);
            expect(shake.easing').toBe('easeOut');
        }');
        test('should apply intensity modifier', (') => {
            const shake: ScreenShake = calculator.calculateScreenShake('bubble_pop', 2.0);
            expect(shake.amplitude).toBe(4); // 2 * 2.0 * 1.0
        }');
        test('should handle different shake types', (') => {
            const explosionShake: ScreenShake = calculator.calculateScreenShake('explosion'),
            expect(explosionShake.amplitude).toBe(12);
            expect(explosionShake.duration).toBe(400');
            const bossShake: ScreenShake = calculator.calculateScreenShake('boss_hit'),
            expect(bossShake.amplitude).toBe(8);
            expect(bossShake.duration).toBe(500);
        }');
        test('should respect amplitude and duration limits', (') => {
            const shake: ScreenShake = calculator.calculateScreenShake('explosion', 10.0); // 非常に高い強度
            expect(shake.amplitude).toBeLessThanOrEqual(20); // 最大振幅制限
            expect(shake.duration).toBeLessThanOrEqual(1000); // 最大時間制限
        }');
        test('should handle custom easing', (') => {
            const shake: ScreenShake = calculator.calculateScreenShake('bubble_pop', 1.0, { easing: 'easeIn' });
            expect(shake.easing').toBe('easeIn');
        }');
        test('should handle unknown shake type', (') => {
            const shake: ScreenShake = calculator.calculateScreenShake('unknown'),
            expect(shake.amplitude).toBe(2); // デフォルト値
            expect(shake.frequency).toBe(8);
            expect(shake.duration).toBe(150);
        }');
    }
    describe('パーティクル軌道計算', (') => {
        test('should calculate linear trajectory', (') => {
            const start: Position = { x: 0, y: 0 };
            const end: Position = { x: 100, y: 100 };
            const trajectory: Position[] = calculator.calculateParticleTrajectory(start, end, 'linear', { 
                steps: 4, 
                gravity: 0.5, 
                wind: 0, 
                randomness: 0 // ランダム性を無効化),
            });
            expect(trajectory).toHaveLength(5); // steps + 1
            expect(trajectory[0]).toEqual({ x: 0, y: 0 ),
            expect(trajectory[4]).toEqual({ x: 100, y: 110 ); // 重力効果込み (100 + 0.5 * 1 * 1 * 20 = 110');
        }
        test('should calculate arc trajectory', (') => {
            const start: Position = { x: 0, y: 0 };
            const end: Position = { x: 100, y: 0 };
            const trajectory: Position[] = calculator.calculateParticleTrajectory(start, end, 'arc', { steps: 2 });
            expect(trajectory).toHaveLength(3);
            expect(trajectory[1].y).toBeLessThan(0); // アーク効果で上に
        }');
        test('should handle missing end position', (') => {
            const start: Position = { x: 50, y: 50 };
            const trajectory: Position[] = calculator.calculateParticleTrajectory(start, null, 'linear', { 
                steps: 2, 
                gravity: 0, 
                wind: 0, 
                randomness: 0 // ランダム性を無効化),
            });
            expect(trajectory).toHaveLength(3);
            expect(trajectory[0].x).toBe(50);
            expect(trajectory[0].y).toBe(50);
            // 終了位置はランダムに生成されるが、開始位置は固定
            expect(trajectory[2].x).not.toBe(50);
        }');
        test('should apply gravity and wind effects', (') => {
            const start: Position = { x: 0, y: 0 };
            const end: Position = { x: 0, y: 0 };
            const trajectory: Position[] = calculator.calculateParticleTrajectory(start, end, 'linear', {
                steps: 2,
                gravity: 2.0,
                wind: 1.0),
            });
            // 重力で下に、風で横に移動
            expect(trajectory[2].y).toBeGreaterThan(0);
            expect(trajectory[2].x).toBeGreaterThan(0);
        }');
    }
    describe('色遷移計算', (') => {
        test('should calculate linear color transition', (') => {
            const startColor: Color = { r: 0, g: 0, b: 0, a: 0 };
            const endColor: Color = { r: 255, g: 255, b: 255, a: 1 };
            
            const midColor: Color = calculator.calculateColorTransition(startColor, endColor, 0.5, 'linear');
            expect(midColor).toEqual({ r: 127, g: 127, b: 127, a: 0.5 )'),
            const endResult: Color = calculator.calculateColorTransition(startColor, endColor, 1.0, 'linear');
            expect(endResult).toEqual({ r: 255, g: 255, b: 255, a: 1 )'),
        }
        test('should handle ease_in blend mode', (') => {
            const startColor: Color = { r: 0, g: 0, b: 0, a: 0 };
            const endColor: Color = { r: 100, g: 100, b: 100, a: 1 };
            
            const result: Color = calculator.calculateColorTransition(startColor, endColor, 0.5, 'ease_in');
            expect(result.r).toBe(25); // 100 * 0.5^2
        }');
        test('should handle ease_out blend mode', (') => {
            const startColor: Color = { r: 0, g: 0, b: 0, a: 0 };
            const endColor: Color = { r: 100, g: 100, b: 100, a: 1 };
            
            const result: Color = calculator.calculateColorTransition(startColor, endColor, 0.5, 'ease_out');
            expect(result.r).toBe(75); // 100 * (1 - (1-0.5)^2);
        }');
        test('should clamp color values', (') => {
            const startColor: Color = { r: 200, g: 200, b: 200, a: 0.8 };
            const endColor: Color = { r: 300, g: -50, b: 100, a: 1.5 }; // 範囲外の値
            
            const result: Color = calculator.calculateColorTransition(startColor, endColor, 1.0, 'linear');
            expect(result.r).toBe(255); // 最大値制限
            expect(result.g).toBe(0);   // 最小値制限
            expect(result.a).toBe(1);   // 最大値制限
        }');
        test('should clamp progress value', (') => {
            const startColor: Color = { r: 0, g: 0, b: 0, a: 0 };
            const endColor: Color = { r: 100, g: 100, b: 100, a: 1 };
            
            const overResult: Color = calculator.calculateColorTransition(startColor, endColor, 1.5, 'linear');
            expect(overResult).toEqual({ r: 100, g: 100, b: 100, a: 1 )'),
            const underResult: Color = calculator.calculateColorTransition(startColor, endColor, -0.5, 'linear');
            expect(underResult).toEqual({ r: 0, g: 0, b: 0, a: 0 ),
        }
    }');
    describe('エフェクト優先度計算', (') => {
        test('should calculate basic priority correctly', (') => {
            expect(calculator.calculateEffectPriority('boss_damage').toBe(100');
            expect(calculator.calculateEffectPriority('explosion').toBe(90');
            expect(calculator.calculateEffectPriority('bubble_pop').toBe(40');
            expect(calculator.calculateEffectPriority('background_ambient').toBe(10);
        }');
        test('should apply combo bonus', (') => {
            const context: EffectContext = { isCombo: true, comboCount: 10 };
            const priority = calculator.calculateEffectPriority('bubble_pop', context);
            expect(priority).toBe(60); // 40 + 20
        }');
        test('should apply boss stage bonus', (') => {
            const context: EffectContext = { isBossStage: true };
            const priority = calculator.calculateEffectPriority('bubble_pop', context);
            expect(priority).toBe(55); // 40 + 15
        }');
        test('should apply time pressure bonus', (') => {
            const context: EffectContext = { remainingTime: 5000 }; // 5秒
            const priority = calculator.calculateEffectPriority('bubble_pop', context);
            expect(priority).toBe(50); // 40 + 10
        }');
        test('should apply multiple bonuses', (') => {
            const context: EffectContext = {
                isCombo: true,
                comboCount: 8,
                isBossStage: true,
                remainingTime: 3000
            };
            const priority = calculator.calculateEffectPriority('bubble_pop', context);
            expect(priority).toBe(85); // 40 + 20 + 15 + 10
        }');
        test('should handle unknown effect type', (') => {
            expect(calculator.calculateEffectPriority('unknown').toBe(50); // デフォルト値
        }');
    }
    describe('パフォーマンス最適化', (') => {
        test('should provide default optimization for good performance', () => {
            const optimization: PerformanceOptimization = calculator.calculatePerformanceOptimization({
                fps: 60,
                particleCount: 100,
                memoryUsage: 0.3,
                cpuUsage: 0.3),
            });
            expect(optimization.particleQuality).toBe(1.0);
            expect(optimization.animationQuality).toBe(1.0);
            expect(optimization.effectsEnabled).toBe(true);
            expect(optimization.maxParticles).toBe(500);
            expect(optimization.skipFrames).toBe(0);
        }');
        test('should optimize for low FPS', () => {
            const optimization: PerformanceOptimization = calculator.calculatePerformanceOptimization({
                fps: 25,
                particleCount: 300,
                memoryUsage: 0.5,
                cpuUsage: 0.5),
            });
            expect(optimization.particleQuality).toBe(0.5);
            expect(optimization.animationQuality).toBe(0.7);
            expect(optimization.maxParticles).toBe(200);
            expect(optimization.skipFrames).toBe(1);
        }');
        test('should optimize for high memory usage', () => {
            const optimization: PerformanceOptimization = calculator.calculatePerformanceOptimization({
                fps: 60,
                particleCount: 400,
                memoryUsage: 0.9,
                cpuUsage: 0.3),
            });
            expect(optimization.maxParticles).toBe(300); // 500 * 0.6
            expect(optimization.particleQuality).toBe(0.8);
        }');
        test('should optimize for high CPU usage', () => {
            const optimization: PerformanceOptimization = calculator.calculatePerformanceOptimization({
                fps: 60,
                particleCount: 200,
                memoryUsage: 0.3,
                cpuUsage: 0.9),
            });
            expect(optimization.animationQuality).toBe(0.7);
            expect(optimization.skipFrames).toBe(1);
        }');
        test('should disable effects for extreme conditions', () => {
            const optimization: PerformanceOptimization = calculator.calculatePerformanceOptimization({
                fps: 10,
                particleCount: 500,
                memoryUsage: 0.95,
                cpuUsage: 0.95),
            });
            expect(optimization.effectsEnabled).toBe(false);
        }');
    }
    describe('デバッグ機能', (') => {
        test('should provide debug information', () => {
            const debugInfo: DebugInfo = calculator.getDebugInfo(),
            expect(debugInfo').toHaveProperty('hasEffectsConfig');
            expect(debugInfo').toHaveProperty('effectsConfig');
            expect(debugInfo').toHaveProperty('version');
            expect(debugInfo.hasEffectsConfig).toBe(true);
            expect(debugInfo.version').toBe('1.0.0');
        });
    }
}');