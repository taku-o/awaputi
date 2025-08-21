/**
 * エフェクト関連計算の専門クラス
 * 
 * パーティクル数、アニメーション時間、効果強度計算を統一的に管理します。
 * 既存のエフェクト関連の計算ロジックを統合しています。
 */

// 型定義
interface EffectsConfig { particles: {
        maxCoun,t: number,
        poolSize: number,
        quality: number,
        baseIntensity: number,
    lifetimeMultiplier: number };
    screen: { shakeIntensity: number,
        flashDuration: number,
        zoomSensitivity: number,
    transitionDuration: number };
    animations: { duration: number,
        easing: string,
        scaleFactor: number,
    fadeSpeed: number };
    bubbleEffects: { popIntensity: number,
        chainRadius: number,
        explosionScale: number,
    trailLength: number }

interface Position { x: number,
    y: number  }

interface Color { r: number,
    g: number,
    b: number,
    a: number }

interface ShakeSettings { amplitude: number,
    frequency: number,
    duration: number,
    easing?: string }

interface EffectModifier { type: 'multiply' | 'add' | 'power' | 'clamp',
    value?: number,
    min?: number,
    max?: number }

interface TrajectoryOptions { steps?: number,
    gravity?: number,
    wind?: number,
    randomness?: number }

interface PerformanceState { fps?: number,
    particleCount?: number,
    memoryUsage?: number,
    cpuUsage?: number }

interface PerformanceOptimization { particleQuality: number,
    animationQuality: number,
    effectsEnabled: boolean,
    maxParticles: number,
    skipFrames: number  }

interface EffectContext { isCombo?: boolean,
    comboCount?: number,
    isBossStage?: boolean,
    remainingTime?: number }

interface EffectsConfigProvider { getEffectsConfig(): EffectsConfig }

interface EffectModifiers { countMultiplier?: number,
    countBonus?: number,
    durationMultiplier?: number,
    durationBonus?: number }
export class EffectsCalculator {
    private effectsConfig: EffectsConfigProvider | null,
    private, defaultEffectsConfig: EffectsConfig',

    constructor(effectsConfig: EffectsConfigProvider | null = null) {
        this.effectsConfig = effectsConfig,
        
        // デフォルトのエフェクト設定（EffectsConfigが利用できない場合のフォールバック）
        this.defaultEffectsConfig = {
            particles: {
                maxCount: 500,
                poolSize: 100,
                quality: 1.0,
    baseIntensity: 1.0 }
                lifetimeMultiplier: 1.0 
    };
            screen: { shakeIntensity: 1.0,
                flashDuration: 200,
                zoomSensitivity: 1.0,
    transitionDuration: 300 };
            animations: { duration: 300,''
                easing: 'easeOut',
                scaleFactor: 1.0,
    fadeSpeed: 1.0  };
            bubbleEffects: { popIntensity: 1.0,
                chainRadius: 120,
                explosionScale: 1.0,
    trailLength: 1.0 
    };
        console.log('EffectsCalculator, initialized');
    }
    
    /**
     * エフェクト設定を取得'
     */''
    getEffectsConfig()';
        if(this.effectsConfig && typeof, this.effectsConfig.getEffectsConfig === 'function) { return this.effectsConfig.getEffectsConfig() }'
        return this.defaultEffectsConfig;
    }
    
    /**
     * パーティクル数を計算
     */
    calculateParticleCount(effectType: string, intensity: number = 1.0, modifiers: EffectModifiers = {}): number { const config = this.getEffectsConfig(),
        
        // エフェクトタイプ別の基本パーティクル数
        const baseParticleCounts = {
            bubble_pop: 8,
            bubble_chain: 15,
            bubble_explosion: 25,
            screen_shake: 0,
            score_popup: 3,
            combo_effect: 12,
            special_bubble: 20,
            boss_damage: 30,
            power_up: 18,
    background_ambient: 5 };
        const baseCount = baseParticleCounts[effectType] || 10;
        
        // 強度による調整
        let particleCount = Math.floor(baseCount * intensity);
        
        // 品質設定による調整
        particleCount = Math.floor(particleCount * config.particles.quality);
        
        // 修正値を適用
        if (modifiers.countMultiplier) { particleCount = Math.floor(particleCount * modifiers.countMultiplier) }
        
        if (modifiers.countBonus) { particleCount += modifiers.countBonus }
        
        // 最大数制限
        const maxCount = config.particles.maxCount;
        return Math.min(Math.max(0, particleCount), maxCount);
    }
    
    /**
     * アニメーション時間を計算
     */
    calculateAnimationDuration(effectType: string, complexity: number = 1.0, modifiers: EffectModifiers = { ): number {
        const config = this.getEffectsConfig(),
        
        // エフェクトタイプ別の基本時間
        const baseDurations = {
            bubble_pop: 300,
            bubble_chain: 500,
            bubble_explosion: 800,
            screen_shake: 200,
            score_popup: 1000,
            combo_effect: 600,
            special_bubble: 1200,
            boss_damage: 400,
            power_up: 1500,
            ui_transition: 250,
            fade_in: 400,
    fade_out: 300  };
        const baseDuration = baseDurations[effectType] || config.animations.duration;
        
        // 複雑度による調整（複雑なほど長時間）
        let duration = Math.floor(baseDuration * (0.5 + complexity * 0.5);
        
        // 修正値を適用
        if (modifiers.durationMultiplier) { duration = Math.floor(duration * modifiers.durationMultiplier) }
        
        if (modifiers.durationBonus) { duration += modifiers.durationBonus }
        
        // 最小・最大時間制限
        return Math.min(Math.max(50, duration), 5000);
    }
    
    /**
     * 効果強度を計算
     */
    calculateEffectIntensity(baseIntensity: number, modifiers: EffectModifier[] = []): number { let intensity = baseIntensity,
        
        // 修正値を順次適用
        for (const modifier of modifiers) {

            switch(modifier.type) {''
                case 'multiply':,
                    intensity *= modifier.value,

                    break,
                case 'add':,
                    intensity += modifier.value,

                    break,
                case 'power':',
                    intensity = Math.pow(intensity, modifier.value),

                    break,
                case 'clamp':,
                    intensity = Math.min(Math.max(intensity, modifier.min || 0), modifier.max || 1),
                    break }
                default: }
                    console.warn(`Unknown, modifier type: ${modifier.type}`});
            }
        }
        
        // 最終的な範囲制限
        return Math.min(Math.max(0, intensity), 10);
    }
    
    /**
     * 画面シェイク強度を計算
     */
    calculateScreenShake(shakeType: string, intensity: number = 1.0, options: { easing?: string } = { ): ShakeSettings {
        const config = this.getEffectsConfig(),
        
        // シェイクタイプ別の設定
        const shakeSettings = { }
            bubble_pop: { amplitude: 2, frequency: 8, duration: 150  },
            bubble_chain: { amplitude: 4, frequency: 12, duration: 300  },
            boss_hit: { amplitude: 8, frequency: 6, duration: 500  },
            explosion: { amplitude: 12, frequency: 10, duration: 400  },
            power_up: { amplitude: 3, frequency: 15, duration: 600  },
            damage: { amplitude: 6, frequency: 8, duration: 200  };
        
        const baseSetting = shakeSettings[shakeType] || shakeSettings.bubble_pop;
        
        // 強度による調整
        const amplitude = baseSetting.amplitude * intensity * config.screen.shakeIntensity;
        const frequency = baseSetting.frequency;
        const duration = baseSetting.duration;
        
        return { amplitude: Math.min(amplitude, 20), // 最大振幅制限
            frequency,
            duration: Math.min(duration, 1000), // 最大時間制限' };

            easing: options.easing || 'easeOut' 
    }
    
    /**
     * パーティクルの軌道を計算'
     */''
    calculateParticleTrajectory(startPos: Position, endPos: Position | null = null, trajectoryType: string = 'linear', options: TrajectoryOptions = { ): Position[] {
        const { steps = 10,
            gravity = 0.5,
            wind = 0,
            randomness = 0.1 } = options;
        
        const trajectory = [];
        
        // 終了位置が指定されていない場合はランダムに設定
        if(!endPos) {
            const angle = Math.random() * Math.PI * 2,
            const distance = 50 + Math.random() * 100,
            endPos = {
                x: startPos.x + Math.cos(angle) * distance }
                y: startPos.y + Math.sin(angle) * distance 
    }
        
        for(let, i = 0; i <= steps; i++) {
        
            const t = i / steps,
            let x, y,

            switch(trajectoryType) {''
                case 'linear':',
                    x = startPos.x + (endPos.x - startPos.x) * t,
                    y = startPos.y + (endPos.y - startPos.y) * t,
                    break,

                case 'arc':',
                    x = startPos.x + (endPos.x - startPos.x) * t,
                    y = startPos.y + (endPos.y - startPos.y) * t - Math.sin(t * Math.PI) * 50,
                    break,

                case 'spiral':,
                    const angle = t * Math.PI * 4,
                    const radius = 30 * (1 - t),

                    x = startPos.x + (endPos.x - startPos.x) * t + Math.cos(angle) * radius,
                    y = startPos.y + (endPos.y - startPos.y) * t + Math.sin(angle) * radius,
                    break,

                case 'explosion':,
                    const explosionAngle = (i / steps) * Math.PI * 2,
                    const explosionDistance = t * 100,
                    x = startPos.x + Math.cos(explosionAngle) * explosionDistance,
                    y = startPos.y + Math.sin(explosionAngle) * explosionDistance,
                    break,
                    
                default: x = startPos.x + (endPos.x - startPos.x) * t  }
                    y = startPos.y + (endPos.y - startPos.y) * t; }
            }
            
            // 重力効果
            y += gravity * t * t * 20;
            
            // 風効果
            x += wind * t * 10;
            
            // ランダム性
            if(randomness > 0) {
                x += (Math.random() - 0.5) * randomness * 20 }
                y += (Math.random() - 0.5) * randomness * 20; }
            }

            trajectory.push({ x: Math.floor(x), y: Math.floor(y  });
        }
        
        return trajectory;
    }
    
    /**
     * 色の遷移を計算'
     */''
    calculateColorTransition(startColor: Color, endColor: Color, progress: number, blendMode: string = 'linear): Color { const t = Math.min(Math.max(progress, 0), 1),
        
        let r, g, b, a,

        switch(blendMode) {

            case 'linear':,
                r = Math.floor(startColor.r + (endColor.r - startColor.r) * t),
                g = Math.floor(startColor.g + (endColor.g - startColor.g) * t),

                b = Math.floor(startColor.b + (endColor.b - startColor.b) * t),
                a = startColor.a + (endColor.a - startColor.a) * t,
                break,

            case 'ease_in':,
                const easeT = t * t,
                r = Math.floor(startColor.r + (endColor.r - startColor.r) * easeT),
                g = Math.floor(startColor.g + (endColor.g - startColor.g) * easeT),

                b = Math.floor(startColor.b + (endColor.b - startColor.b) * easeT),
                a = startColor.a + (endColor.a - startColor.a) * easeT,
                break,

            case 'ease_out':,
                const easeOutT = 1 - Math.pow(1 - t, 2),
                r = Math.floor(startColor.r + (endColor.r - startColor.r) * easeOutT),
                g = Math.floor(startColor.g + (endColor.g - startColor.g) * easeOutT),
                b = Math.floor(startColor.b + (endColor.b - startColor.b) * easeOutT),
                a = startColor.a + (endColor.a - startColor.a) * easeOutT,
                break,
                
            default: r = Math.floor(startColor.r + (endColor.r - startColor.r) * t),
                g = Math.floor(startColor.g + (endColor.g - startColor.g) * t),
                b = Math.floor(startColor.b + (endColor.b - startColor.b) * t),
         }
                a = startColor.a + (endColor.a - startColor.a) * t; }
        }
        
        return { r: Math.min(Math.max(r, 0), 255),
            g: Math.min(Math.max(g, 0), 255),
            b: Math.min(Math.max(b, 0), 255) };
            a: Math.min(Math.max(a, 0), 1); }
        }
    
    /**
     * エフェクトの優先度を計算
     */
    calculateEffectPriority(effectType: string, context: EffectContext = { ): number {
        // エフェクトタイプ別の基本優先度
        const basePriorities = {
            boss_damage: 100,
            explosion: 90,
            special_bubble: 80,
            combo_effect: 70,
            bubble_chain: 60,
            power_up: 50,
            bubble_pop: 40,
            score_popup: 30,
            screen_shake: 20,
    background_ambient: 10  };
        let priority = basePriorities[effectType] || 50;
        
        // コンテキストによる調整
        if (context.isCombo && context.comboCount > 5) { priority += 20, // 高コンボ時は優先度アップ }
        
        if (context.isBossStage) { priority += 15, // ボスステージでは優先度アップ }
        
        if(context.remainingTime < 10000) {
        
            // 10秒未満
        
        }
            priority += 10; // 時間切れ間近では優先度アップ }
        }
        
        return priority;
    }
    
    /**
     * パフォーマンス最適化のための設定を計算
     */
    calculatePerformanceOptimization(performanceState: PerformanceState): PerformanceOptimization { const { fps = 60,
            particleCount = 0,
            memoryUsage = 0.5,
            cpuUsage = 0.5 } = performanceState;
        
        const optimization = { particleQuality: 1.0,
            animationQuality: 1.0,
            effectsEnabled: true,
            maxParticles: 500,
    skipFrames: 0  };
        // FPSが低い場合の最適化
        if(fps < 30) {
            optimization.particleQuality = 0.5,
            optimization.animationQuality = 0.7,
            optimization.maxParticles = 200 }
            optimization.skipFrames = 1; }
        } else if (fps < 45) { optimization.particleQuality = 0.7,
            optimization.animationQuality = 0.8,
            optimization.maxParticles = 300 }
        
        // メモリ使用量が高い場合の最適化
        if(memoryUsage > 0.8) {
            optimization.maxParticles = Math.floor(optimization.maxParticles * 0.6) }
            optimization.particleQuality *= 0.8; }
        }
        
        // CPU使用量が高い場合の最適化
        if(cpuUsage > 0.8) {
            optimization.animationQuality *= 0.7 }
            optimization.skipFrames = Math.max(optimization.skipFrames, 1); }
        }
        
        // 極端に重い場合はエフェクトを無効化
        if (fps < 15 || memoryUsage > 0.9 || cpuUsage > 0.9) { optimization.effectsEnabled = false }
        
        return optimization;
    }
    
    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): { hasEffectsConfig: boolean, effectsConfig: EffectsConfig,, version: string } { return { hasEffectsConfig: !!this.effectsConfig,''
            effectsConfig: this.getEffectsConfig('}

            version: '1.0.0' 
    }
}

// シングルトンインスタンス)
let effectsCalculatorInstance: EffectsCalculator | null = null);
/**
 * EffectsCalculatorのシングルトンインスタンスを取得
 */)
export function getEffectsCalculator(): EffectsCalculator { if (!effectsCalculatorInstance) {''
        effectsCalculatorInstance = new EffectsCalculator(' }''