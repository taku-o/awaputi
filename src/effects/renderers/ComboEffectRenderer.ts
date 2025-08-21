import { getErrorHandler  } from '../../utils/ErrorHandler.js';

/**
 * Combo tier configuration interface
 */
interface ComboTier { minCombo: number,
    maxCombo: number,
    name: string,
    particleCount: number,
    colors: string[],
    effects: string[],
    screenEffects: string[],
    priority: number  }

/**
 * Combo tiers interface
 */
interface ComboTiers { [key: string]: ComboTier }

/**
 * Combo tier with key interface
 */
interface ComboTierWithKey extends ComboTier { key: string }

/**
 * Combo break effect configuration
 */
interface ComboBreakEffect { fadeParticleCount: number,
    fadeColor: string,
    fadeDuration: number  }

/**
 * Particle interface
 */
interface Particle { x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    life: number,
    maxLife: number,
    alpha: number,
    gravity: number,
    friction: number,
    bounce?: number,
    type: string,
    rotation?: number,
    rotationSpeed?: number,
    scale?: number,
    scaleSpeed?: number,
    maxTrailLength?: number }
    trail?: Array<{ x: number,, y: number }>;
    pulseSpeed?: number;
}

/**
 * Quality settings interface
 */
interface QualitySettings {
    complexityLevel: number }

/**
 * Particle manager interface
 */
interface ParticleManager { particles: Particle[],
    getParticleFromPool(): Particle,
    shouldRenderEffect(effectType: string, priority: number): boolean,
    adjustParticleCount(count: number): number,
    getEffectIntensityMultiplier(): number,
    getCurrentQualitySettings(): QualitySettings }

/**
 * コンボ効果専用レンダラー
 * コンボ数に応じて段階的に強化される視覚効果を管理
 */
export class ComboEffectRenderer {
    private particleManager: ParticleManager,
    private comboTiers: ComboTiers,
    private effectQueue: any[],
    private isProcessingQueue: boolean,
    private, comboBreakEffect: ComboBreakEffect',

    constructor(particleManager: ParticleManager) {
        this.particleManager = particleManager,
        
        // コンボ段階の定義
        this.comboTiers = {
            basic: { // 2-5コンボ
                minCombo: 2,
    maxCombo: 5,
                name: '基本',
                particleCount: 8,
                colors: ['#FFD700', '#FFA500],
                effects: ['golden_particles', 'sparkle'],
                screenEffects: [] }
                priority: 5 
    };
            enhanced: { // 6-10コンボ
                minCombo: 6,
    maxCombo: 10,
                name: '強化',
                particleCount: 15,
                colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF4500],
                effects: ['golden_particles', 'enhanced_sparkle', 'screen_flash'],
                screenEffects: ['flash'],
    priority: 7  };
            spectacular: { // 11+コンボ
                minCombo: 11,
    maxCombo: Infinity,
                name: '絶大',
                particleCount: 25,
                colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3],
                effects: ['rainbow_burst', 'screen_shake', 'screen_zoom', 'magical_explosion'],
                screenEffects: ['shake', 'zoom', 'rainbow_flash'],
                priority: 10  }
        };
        // コンボ演出のキューイング
        this.effectQueue = [];
        this.isProcessingQueue = false;
        
        // コンボブレイク時の演出
        this.comboBreakEffect = { fadeParticleCount: 5,''
            fadeColor: '#666666',
    fadeDuration: 800  };
        console.log('[ComboEffectRenderer] 初期化完了');
    }
    
    /**
     * 強化されたコンボ効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     * @param {string} comboType - コンボタイプ'
     */''
    createEnhancedComboEffect(x: number, y: number, comboCount: number, comboType: string = 'normal': void { try {'
            const tier = this.getComboTier(comboCount),
            if(!tier) return,
            ',
            // 品質チェック
            if(!this.particleManager.shouldRenderEffect('combo', tier.priority) {
                this.createSimplifiedComboEffect(x, y, comboCount) }
                return; }
            }
            
            // メインコンボ演出
            this.createMainComboParticles(x, y, comboCount, tier);
            
            // 段階別追加効果
            tier.effects.forEach(effectType => {  ) }
                this.createComboSpecialEffect(x, y, effectType, comboCount, tier); }
            });
            
            // 画面効果（必要に応じて）
            if (tier.screenEffects.length > 0) { this.triggerScreenEffects(tier.screenEffects, comboCount) }
            
            // コンボマルチプライヤー表示
            this.createComboMultiplierIndicator(x, y, comboCount, tier);
            ';

        } catch (error) { getErrorHandler().handleError(error, 'COMBO_EFFECT_ERROR', {''
                context: 'ComboEffectRenderer.createEnhancedComboEffect'
            });
        }
    }
    
    /**
     * コンボ段階を取得
     * @param {number} comboCount - コンボ数
     * @returns {Object|null} コンボ段階情報
     */
    getComboTier(comboCount: number): ComboTierWithKey | null { for(const [key, tier] of Object.entries(this.comboTiers) {
            if (comboCount >= tier.minCombo && comboCount <= tier.maxCombo) { }
                return { ...tier, key };
        return null;
    }
    
    /**
     * メインコンボパーティクルを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     * @param {Object} tier - コンボ段階
     */
    createMainComboParticles(x: number, y: number, comboCount: number, tier: ComboTierWithKey): void { const adjustedCount = this.particleManager.adjustParticleCount(tier.particleCount),
        const intensityMultiplier = this.particleManager.getEffectIntensityMultiplier(),
        
        for(let, i = 0, i < adjustedCount, i++) {
        
            const particle = this.particleManager.getParticleFromPool(),
            
            // 螺旋状配置
            const angle = (Math.PI * 2 * i) / adjustedCount + (Date.now() * 0.001),
            const radius = 40 + (i / adjustedCount) * 60 + Math.sin(angle * 3) * 15,
            const spiralOffset = (i / adjustedCount) * Math.PI * 4,
            
            particle.x = x + Math.cos(angle + spiralOffset) * radius,
            particle.y = y + Math.sin(angle + spiralOffset) * radius,
            
            // 動的な速度（中心に向かって収束後拡散）
            const convergencePhase = Math.min(1, i / (adjustedCount * 0.3),
            if (convergencePhase < 1) {
                // 収束フェーズ
                particle.vx = -Math.cos(angle) * 80 * convergencePhase }
                particle.vy = -Math.sin(angle) * 80 * convergencePhase; }
            } else {  // 拡散フェーズ
                const speed = (60 + Math.random() * 40) * intensityMultiplier,
                particle.vx = Math.cos(angle) * speed }
                particle.vy = Math.sin(angle) * speed - 30; // 上向きバイアス }
            }
            
            // 外観（段階に応じて変化）
            particle.size = (3 + Math.random() * 4) * intensityMultiplier;
            particle.color = tier.colors[Math.floor(Math.random() * tier.colors.length)];
            
            // ライフタイム（段階に応じて延長）
            const baseLifetime = 1000 + tier.priority * 200;
            particle.life = baseLifetime + Math.random() * baseLifetime * 0.5;
            particle.maxLife = particle.life;
            particle.alpha = 0.9 + Math.random()';
            particle.gravity = tier.key === 'spectacular' ? -10 : 15; // 絶大コンボは浮遊)
            particle.friction = 0.96 + Math.random() * 0.02;
            particle.bounce = 0.1 + Math.random() * 0.3;
            
            // アニメーション
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 15 * tier.priority;
            particle.scale = 0.5 + Math.random() * 0.5;
            particle.scaleSpeed = 0.5 / (particle.life / 1000);
            // パーティクルタイプ（段階に応じて高級化）
            particle.type = this.selectComboParticleType(tier, i, adjustedCount);
            particle.pulseSpeed = 4 + tier.priority;
            ';
            // トレイル効果（高段階のみ）
            if(tier.key === 'spectacular' {'
                particle.maxTrailLength = 6 }
                particle.trail = []; }
            }
            
            this.particleManager.particles.push(particle);
        }
    }
    
    /**
     * コンボパーティクルタイプを選択
     * @param {Object} tier - コンボ段階
     * @param {number} index - インデックス
     * @param {number} totalCount - 総数
     * @returns {string} パーティクルタイプ
     */
    selectComboParticleType(tier: ComboTierWithKey, index: number, totalCount: number): string { const qualitySettings = this.particleManager.getCurrentQualitySettings(),
        const ratio = index / totalCount,

        switch(tier.key) {

            case 'basic':',
                if(qualitySettings.complexityLevel >= 2) {
        }

                    return ratio < 0.7 ? 'star' : 'advanced_circle';
                return 'star';

            case 'enhanced':
                if(qualitySettings.complexityLevel >= 3) {

                    if(ratio < 0.4) return 'glow_circle',
                    if(ratio < 0.8) return 'star' }

                    return 'diamond';
                return ratio < 0.6 ? 'star' : 'advanced_circle';

            case 'spectacular':
                if(qualitySettings.complexityLevel >= 3) {

                    if(ratio < 0.3) return 'energy_orb',
                    if(ratio < 0.6) return 'magic_sparkle',
                    if(ratio < 0.9) return 'glow_circle' }

                    return 'plasma_burst';
                return ratio < 0.5 ? 'glow_circle' : 'star';

            default: return 'star';
    
    /**
     * コンボ特殊効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - 効果タイプ
     * @param {number} comboCount - コンボ数
     * @param {Object} tier - コンボ段階
     */'
    createComboSpecialEffect(x: number, y: number, effectType: string, comboCount: number, tier: ComboTierWithKey): void { ''
        switch(effectType) {

            case 'golden_particles':',
                this.createGoldenParticles(x, y, comboCount),

                break,
            case 'sparkle':',
                this.createComboSparkle(x, y, comboCount),

                break,
            case 'enhanced_sparkle':',
                this.createEnhancedSparkle(x, y, comboCount),

                break,
            case 'rainbow_burst':',
                this.createRainbowBurst(x, y, comboCount),

                break,
            case 'magical_explosion':,
                this.createMagicalExplosion(x, y, comboCount) }
                break; }
}
    
    /**
     * 黄金パーティクル効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     */
    createGoldenParticles(x: number, y: number, comboCount: number): void { const goldenCount = this.particleManager.adjustParticleCount(5 + comboCount),
        
        for(let, i = 0, i < goldenCount, i++) {
        
            const particle = this.particleManager.getParticleFromPool(),
            
            const angle = Math.random() * Math.PI * 2,
            const distance = Math.random() * 80,
            
            particle.x = x + Math.cos(angle) * distance,
            particle.y = y + Math.sin(angle) * distance,
            particle.vx = (Math.random() - 0.5) * 60,
            particle.vy = (Math.random() - 0.5) * 60 - 40,

            particle.size = 2 + Math.random() * 3,
            particle.color = Math.random() > 0.5 ? '#FFD700' : '#FFA500',
            particle.life = 1500 + Math.random() * 500,

            particle.maxLife = particle.life,
            particle.alpha = 0.8 + Math.random('',
            particle.type = 'advanced_circle',
            particle.pulseSpeed = 6)
            ) }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * コンボスパークル効果（未実装）
     */
    createComboSparkle(x: number, y: number, comboCount: number): void { // TODO: 将来実装予定
        this.createGoldenParticles(x, y, comboCount }
    
    /**
     * 強化スパークル効果（未実装）
     */
    createEnhancedSparkle(x: number, y: number, comboCount: number): void { // TODO: 将来実装予定
        this.createGoldenParticles(x, y, comboCount }
    
    /**
     * 虹色バースト効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     */
    createRainbowBurst(x: number, y: number, comboCount: number): void { ''
        const rainbowCount = this.particleManager.adjustParticleCount(20),
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3],
        
        for(let, i = 0, i < rainbowCount, i++) {
        
            const particle = this.particleManager.getParticleFromPool(),
            
            const angle = (Math.PI * 2 * i) / rainbowCount,
            const speed = 100 + Math.random() * 50,
            
            particle.x = x,
            particle.y = y,
            particle.vx = Math.cos(angle) * speed,

            particle.vy = Math.sin(angle) * speed,
            particle.size = 3 + Math.random('',
            particle.type = 'magic_sparkle',
            particle.pulseSpeed = 8,
            particle.maxTrailLength = 4,
            particle.trail = [])
            ) }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * 魔法爆発効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     */
    createMagicalExplosion(x: number, y: number, comboCount: number): void { const explosionCount = this.particleManager.adjustParticleCount(15),
        
        // 内側から外側への波状展開
        for(let, wave = 0, wave < 3, wave++) {
            setTimeout(() => { 
                const waveCount = Math.floor(explosionCount / 3),
                
                for (let, i = 0, i < waveCount, i++) {
                    const particle = this.particleManager.getParticleFromPool(),
                    
                    const angle = Math.random() * Math.PI * 2,
                    const speed = 80 + wave * 40 + Math.random() * 60,
                    
                    particle.x = x,
                    particle.y = y,
                    particle.vx = Math.cos(angle) * speed,
                    particle.vy = Math.sin(angle) * speed,
                    particle.size = 4 + Math.random()',
                    particle.color = wave === 0 ? '#FFFFFF' : (wave === 1 ? '#FFD700' : '#FF69B4'),
                    particle.life = 1800 - wave * 200,
                    particle.maxLife = particle.life,
                    particle.alpha = 1.0 - wave * 0.2,
                    particle.gravity = 20,

                    particle.friction = 0.92,
                    particle.type = 'energy_orb',
                    particle.pulseSpeed = 10 - wave * 2 }
                     }
                    this.particleManager.particles.push(particle); }
}, wave * 150);
        }
    }
    
    /**
     * コンボマルチプライヤー表示
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     * @param {Object} tier - コンボ段階
     */
    createComboMultiplierIndicator(x: number, y: number, comboCount: number, tier: ComboTierWithKey): void { // 数字パーティクル（テキスト表示の代替として視覚的表現）
        const digitCount = comboCount.toString().length,
        
        for(let, i = 0, i < digitCount, i++) {
        
            const particle = this.particleManager.getParticleFromPool(),
            
            particle.x = x - (digitCount * 15) / 2 + i * 15,
            particle.y = y - 40,
            particle.vx = (Math.random() - 0.5) * 20,
            particle.vy = -60 - Math.random('',
            particle.type = 'star',
            particle.scale = 1.5,
            particle.scaleSpeed = -0.5,
            particle.pulseSpeed = 5,', ') }

            this.particleManager.particles.push(particle); }
        }
        ';
        // マルチプライヤー強調リング
        if(tier.key === 'spectacular' {'
            for (let, i = 0, i < 8, i++) {
                const particle = this.particleManager.getParticleFromPool(),
                
                const angle = (Math.PI * 2 * i) / 8,
                const radius = 50,
                
                particle.x = x + Math.cos(angle) * radius,
                particle.y = y + Math.sin(angle) * radius,

                particle.vx = Math.cos(angle) * 30,
                particle.vy = Math.sin(angle) * 30,

                particle.size = 3,
                particle.color = '#FFFFFF',
                particle.life = 1000,
                particle.maxLife = particle.life,
                particle.alpha = 0.8,
                particle.gravity = 0,

                particle.friction = 0.99,
                particle.type = 'diamond',
                particle.rotationSpeed = 20 }
                this.particleManager.particles.push(particle); }
}
    }
    
    /**
     * 画面効果をトリガー
     * @param {Array} effects - 効果リスト
     * @param {number} comboCount - コンボ数
     */
    triggerScreenEffects(effects: string[], comboCount: number): void { // このメソッドは実際の画面効果システムと連携する必要がある
        // ここでは効果の種類を記録するのみ
        effects.forEach(effect => {) }
            console.log(`[ComboEffectRenderer] 画面効果トリガー: ${effect}, コンボ数: ${comboCount}`});
        });
    }
    
    /**
     * コンボブレイク効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} lastComboCount - 最後のコンボ数
     */
    createComboBreakEffect(x: number, y: number, lastComboCount: number): void { if (lastComboCount < 2) return, // 2コンボ未満はブレイク演出なし
        
        try {
            const breakCount = this.particleManager.adjustParticleCount(this.comboBreakEffect.fadeParticleCount),
            
            for(let, i = 0, i < breakCount, i++) {
            
                const particle = this.particleManager.getParticleFromPool(),
                
                const angle = Math.random() * Math.PI * 2,
                const distance = Math.random() * 60,
                
                particle.x = x + Math.cos(angle) * distance,
                particle.y = y + Math.sin(angle) * distance,
                particle.vx = (Math.random() - 0.5) * 40,
                particle.vy = (Math.random() - 0.5) * 40 + 20, // 下向きバイアス
                particle.size = 2 + Math.random('',
                particle.type = 'circle',
                particle.scaleSpeed = -1)
                ) }
                this.particleManager.particles.push(particle); }
            }
            
            console.log(`[ComboEffectRenderer] コンボブレイク演出: ${lastComboCount}コンボ終了`});
            ';

        } catch (error) { getErrorHandler().handleError(error, 'COMBO_BREAK_ERROR', {''
                context: 'ComboEffectRenderer.createComboBreakEffect'
            }';
        }
    }
    
    /**
     * 簡略化されたコンボ効果（低品質用）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     */'
    createSimplifiedComboEffect(x: number, y: number, comboCount: number): void { ''
        const simpleCount = Math.min(5, comboCount),
        const color = comboCount >= 11 ? '#FF69B4' : (comboCount >= 6 ? '#FF8C00' : '#FFD700'),
        
        for(let, i = 0, i < simpleCount, i++) {
        
            const particle = this.particleManager.getParticleFromPool(),
            
            const angle = (Math.PI * 2 * i) / simpleCount,
            particle.x = x + Math.cos(angle) * 30,
            particle.y = y + Math.sin(angle) * 30,

            particle.vx = Math.cos(angle) * 50,
            particle.vy = Math.sin(angle) * 50,
            particle.size = 3,
            particle.color = color,
            particle.life = 800,
            particle.maxLife = particle.life,
            particle.alpha = 0.8,
            particle.gravity = 15,

            particle.friction = 0.95,
            particle.type = 'star' }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * コンボ進捗表示効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} currentCombo - 現在のコンボ数
     * @param {number} nextTierThreshold - 次の段階の閾値
     */
    createComboProgressEffect(x: number, y: number, currentCombo: number, nextTierThreshold: number): void { if (nextTierThreshold === Infinity) return,
        
        const progress = (currentCombo - 1) / (nextTierThreshold - 1),
        const progressParticles = Math.floor(progress * 8),
        
        for(let, i = 0, i < progressParticles, i++) {
        
            const particle = this.particleManager.getParticleFromPool(),
            
            const angle = (Math.PI * 2 * i) / 8,
            const radius = 25,
            ',

            particle.x = x + Math.cos(angle) * radius,
            particle.y = y + Math.sin(angle) * radius,
            particle.vx = 0,
            particle.vy = 0,

            particle.size = 2,
            particle.color = '#00FF00',
            particle.life = 500,
            particle.maxLife = particle.life,
            particle.alpha = 0.7,
            particle.gravity = 0,

            particle.friction = 1,
            particle.type = 'circle',
            particle.pulseSpeed = 4 }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * パフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */'
    getPerformanceStats(): object { return { ''
            comboTiers: Object.keys(this.comboTiers).length,
            effectQueueLength: this.effectQueue.length,
    isProcessingQueue: this.isProcessingQueue,
            availableEffects: [',
                'golden_particles', 'sparkle', 'enhanced_sparkle', ]',
                'rainbow_burst', 'magical_explosion', 'combo_break'] };
            ].length }
        }'}