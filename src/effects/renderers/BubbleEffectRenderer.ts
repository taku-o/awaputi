import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Bubble effect configuration interface
 */
interface BubbleEffectConfig { baseParticleCount: number,
    colors: string[],
    specialEffects: string[],
    priority: number; }
}

/**
 * Bubble effect configs map interface
 */
interface BubbleEffectConfigs { [key: string]: BubbleEffectConfig,
    }
}

/**
 * Bubble effect options interface
 */
interface BubbleEffectOptions { intensity?: number;
    multiplier?: number;
    customColors?: string[]; }
}

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
    bounce?: number;
    type: string,
    rotation?: number;
    rotationSpeed?: number;
    scale?: number;
    scaleSpeed?: number;
    maxTrailLength?: number; }
    trail?: Array<{ x: number; y: number }>;
    pulseSpeed?: number;
}

/**
 * Quality settings interface
 */
interface QualitySettings { complexityLevel: number; }
}

/**
 * Particle manager interface
 */
interface ParticleManager { particles: Particle[],
    getParticleFromPool(): Particle;
    shouldRenderEffect(effectType: string, priority: number): boolean,
    adjustParticleCount(count: number): number,
    getEffectIntensityMultiplier(): number;
    getCurrentQualitySettings(): QualitySettings;
    }
}

/**
 * バブル破壊効果専用レンダラー
 * バブルタイプ別の特殊な破壊エフェクトを管理
 */
export class BubbleEffectRenderer {
    private particleManager: ParticleManager;
    private bubbleEffectConfigs: BubbleEffectConfigs';
'';
    constructor(particleManager: ParticleManager') {
        this.particleManager = particleManager;
        
        // バブルタイプ別の基本設定
        this.bubbleEffectConfigs = {
            normal: {'
                baseParticleCount: 15,'';
                colors: ['#4A90E2', '#7ED321', '#50E3C2', '#A8E6CF', '#C7CEEA'],'';
                specialEffects: ['sparkle', 'ripple'],
    }
    }
                priority: 5 }
            },'
            stone: { baseParticleCount: 20,''
                colors: ['#8E8E93', '#C7C7CC', '#EFEFF4', '#D3D3D3'],'';
                specialEffects: ['debris', 'dust'],
                priority: 6 }
            },'
            iron: { baseParticleCount: 25,''
                colors: ['#8B4513', '#A0522D', '#CD853F', '#D2691E'],'';
                specialEffects: ['sparks', 'metal_shards'],
                priority: 7 }
            },'
            diamond: { baseParticleCount: 30,''
                colors: ['#E6E6FA', '#F8F8FF', '#FFFFFF', '#E0E0E0', '#C0C0C0'],'';
                specialEffects: ['prismatic', 'brilliance', 'reflection'],
                priority: 8 }
            },'
            rainbow: { baseParticleCount: 40,''
                colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],'';
                specialEffects: ['color_burst', 'magical_sparkles', 'rainbow_trail'],
                priority: 9 }
            },'
            electric: { baseParticleCount: 35,''
                colors: ['#FFFF00', '#00FFFF', '#FFFFFF', '#E6E6FA'],'';
                specialEffects: ['lightning', 'electric_arcs', 'static_discharge'],
                priority: 8 }
            },'
            boss: { baseParticleCount: 50,''
                colors: ['#8B0000', '#DC143C', '#FF0000', '#FF4500'],'';
                specialEffects: ['massive_explosion', 'shockwave', 'fire_burst'],
                priority: 10 }
            }
        },'
        '';
        console.log('[BubbleEffectRenderer] 初期化完了');
    }
    
    /**
     * 高度なバブル破壊効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} options - 追加オプション
     */
    createAdvancedBubbleEffect(x: number, y: number, bubbleType: string, bubbleSize: number, options: BubbleEffectOptions = { ): void {
        try {
            const config = this.bubbleEffectConfigs[bubbleType] || this.bubbleEffectConfigs.normal;
            
            // 品質に応じて効果を調整
            if(!this.particleManager.shouldRenderEffect(bubbleType, config.priority) {
                // 低品質の場合は簡略化されたエフェクトのみ
                this.createSimplifiedBubbleEffect(x, y, bubbleType, bubbleSize);
            }
                return; }
            }
            
            // メインパーティクル効果
            this.createMainBubbleParticles(x, y, config, bubbleSize, options);
            
            // 特殊効果の追加
            config.specialEffects.forEach(effectType => {  ); }
                this.createSpecialBubbleEffect(x, y, effectType, bubbleSize, config); }
            });
            
            // バブルタイプ別の個別処理
            this.createTypeSpecificEffect(x, y, bubbleType, bubbleSize, options);
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'BUBBLE_EFFECT_ERROR', {')'
                context: 'BubbleEffectRenderer.createAdvancedBubbleEffect'); }
            });
        }
    }
    
    /**
     * メインパーティクル効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} config - 設定
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} options - オプション
     */
    createMainBubbleParticles(x: number, y: number, config: BubbleEffectConfig, bubbleSize: number, options: BubbleEffectOptions): void { const baseCount = Math.floor(bubbleSize / 3) + config.baseParticleCount;
        const adjustedCount = this.particleManager.adjustParticleCount(baseCount);
        const intensityMultiplier = this.particleManager.getEffectIntensityMultiplier();
        
        for(let i = 0; i < adjustedCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            // 基本配置 - より自然な拡散
            const angle = (Math.PI * 2 * i) / adjustedCount + (Math.random() - 0.5) * 0.8;
            const distance = (Math.random() * 0.7 + 0.3) * bubbleSize * 0.6;
            
            particle.x = x + Math.cos(angle) * distance * Math.random();
            particle.y = y + Math.sin(angle) * distance * Math.random();
            
            // 物理特性 - より多様な速度
            const speed = (60 + Math.random() * 80) * intensityMultiplier;
            const velocityAngle = angle + (Math.random() - 0.5) * 0.6;
            particle.vx = Math.cos(velocityAngle) * speed * (0.5 + Math.random() * 0.5);
            particle.vy = Math.sin(velocityAngle) * speed * (0.5 + Math.random() * 0.5);
            
            // 外観 - サイズのバリエーション増加
            const sizeVariation = 0.3 + Math.random() * 0.7;
            particle.size = (2 + Math.random() * 4) * intensityMultiplier * sizeVariation;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            // ライフタイム - より多様な継続時間
            particle.life = (800 + Math.random() * 600) * (0.8 + Math.random() * 0.4);
            particle.maxLife = particle.life;
            particle.alpha = 0.9 + Math.random() * 0.1;
            
            // 物理パラメータ
            particle.gravity = 15 + Math.random() * 25;
            particle.friction = 0.97 + Math.random() * 0.02;
            particle.bounce = 0.2 + Math.random() * 0.5;
            
            // アニメーション
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 12;
            particle.scale = 0.8 + Math.random() * 0.4;
            particle.scaleSpeed = -0.5 / (particle.life / 1000);
            
            // エフェクトタイプ
            particle.type = this.selectParticleType(config, i, adjustedCount);
            
        
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * パーティクルタイプを選択
     * @param {Object} config - 設定
     * @param {number} index - インデックス
     * @param {number} totalCount - 総数
     * @returns {string} パーティクルタイプ
     */
    selectParticleType(config: BubbleEffectConfig, index: number, totalCount: number): string { const ratio = index / totalCount;
        const qualitySettings = this.particleManager.getCurrentQualitySettings();
        
        if(qualitySettings.complexityLevel >= 3) {
        ';
            // 高品質: 多様なタイプを使用''
            if (ratio < 0.3') return 'glow_circle';''
            if (ratio < 0.6') return 'advanced_circle';''
            if (ratio < 0.8') return 'trail_particle';'
        
        }'
            return 'star'; }'
        } else if (qualitySettings.complexityLevel >= 2) { // 中品質: 基本的な拡張タイプ''
            if (ratio < 0.5') return 'advanced_circle';''
            return 'circle'; }'
        } else {  // 低品質: 基本タイプのみ' }'
            return 'circle'; }
        }
    }
    
    /**
     * 特殊バブル効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - 効果タイプ
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} config - 設定
     */'
    createSpecialBubbleEffect(x: number, y: number, effectType: string, bubbleSize: number, config: BubbleEffectConfig): void { ''
        switch(effectType') {'
            '';
            case 'sparkle':'';
                this.createSparkleEffect(x, y, bubbleSize, config');'
                break;''
            case 'ripple':'';
                this.createRippleEffect(x, y, bubbleSize, config');'
                break;''
            case 'debris':'';
                this.createDebrisEffect(x, y, bubbleSize, config');'
                break;''
            case 'dust':'';
                this.createDustEffect(x, y, bubbleSize, config');'
                break;''
            case 'sparks':'';
                this.createSparksEffect(x, y, bubbleSize, config');'
                break;''
            case 'metal_shards':'';
                this.createMetalShardsEffect(x, y, bubbleSize, config');'
                break;''
            case 'prismatic':'';
                this.createPrismaticEffect(x, y, bubbleSize, config');'
                break;''
            case 'brilliance':'';
                this.createBrillianceEffect(x, y, bubbleSize, config');'
                break;''
            case 'color_burst':'';
                this.createColorBurstEffect(x, y, bubbleSize, config');'
                break;''
            case 'magical_sparkles':'';
                this.createMagicalSparklesEffect(x, y, bubbleSize, config');'
                break;''
            case 'lightning':'';
                this.createLightningEffect(x, y, bubbleSize, config');'
                break;''
            case 'electric_arcs':'';
                this.createElectricArcsEffect(x, y, bubbleSize, config');'
                break;''
            case 'massive_explosion':'';
                this.createMassiveExplosionEffect(x, y, bubbleSize, config');'
                break;''
            case 'shockwave':;
                this.createShockwaveEffect(x, y, bubbleSize, config);
        }
                break; }
        }
    }
    
    /**
     * きらめき効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} config - 設定
     */
    createSparkleEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { const sparkleCount = this.particleManager.adjustParticleCount(8);
        
        for(let i = 0; i < sparkleCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * bubbleSize;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = (Math.random() - 0.5) * 40;'
            particle.vy = (Math.random() - 0.5) * 40 - 20;''
            particle.size = 1 + Math.random('')';
            particle.color = '#FFFFFF';)
            particle.life = 1000 + Math.random() * 500;'
            particle.maxLife = particle.life;''
            particle.alpha = 0.8 + Math.random('')';
            particle.type = 'star';)
            particle.pulseSpeed = 8 + Math.random() * 4;
            
        
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 波紋効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} config - 設定
     */
    createRippleEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { const rippleCount = this.particleManager.adjustParticleCount(3);
        
        for(let i = 0; i < rippleCount; i++) {
        ';
            '';
            const particle = this.particleManager.getParticleFromPool(''';
            particle.type = 'ripple';
            particle.scaleSpeed = 3;)
            );
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * がれき効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} config - 設定
     */
    createDebrisEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { const debrisCount = this.particleManager.adjustParticleCount(12);
        
        for(let i = 0; i < debrisCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            particle.x = x + (Math.random() - 0.5) * bubbleSize * 0.5;
            particle.y = y + (Math.random() - 0.5) * bubbleSize * 0.5;
            particle.vx = (Math.random() - 0.5) * 100;
            particle.vy = (Math.random() - 0.5) * 100;
            particle.size = 2 + Math.random() * 4;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.life = 1200 + Math.random() * 800;
            particle.maxLife = particle.life;
            particle.alpha = 0.8;
            particle.gravity = 80;'
            particle.friction = 0.95;''
            particle.bounce = 0.4 + Math.random('')';
            particle.type = 'hexagon';)
            particle.rotationSpeed = (Math.random() - 0.5) * 20;
            
        
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * ダスト効果（未実装）
     */
    createDustEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createDebrisEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * 火花効果（未実装）
     */
    createSparksEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createElectricArcsEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * 金属片効果（未実装）
     */
    createMetalShardsEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createDebrisEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * プリズム効果（未実装）
     */
    createPrismaticEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createSparkleEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * ブリリアンス効果（未実装）
     */
    createBrillianceEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createSparkleEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * カラーバースト効果（未実装）
     */
    createColorBurstEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createRainbowSpiral(x, y, bubbleSize); }
    }
    
    /**
     * 魔法の輝き効果（未実装）
     */
    createMagicalSparklesEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createSparkleEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * 稲妻効果（未実装）
     */
    createLightningEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createElectricArcsEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * 衝撃波効果（未実装）
     */
    createShockwaveEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { // TODO: 将来実装予定
        this.createRippleEffect(x, y, bubbleSize, config); }
    }
    
    /**
     * 電気アーク効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} config - 設定
     */
    createElectricArcsEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { const arcCount = this.particleManager.adjustParticleCount(6);
        
        for(let i = 0; i < arcCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / arcCount;
            const distance = bubbleSize * (1 + Math.random();
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * 150;
            particle.vy = Math.sin(angle) * 150;'
            particle.size = 2;''
            particle.color = Math.random(') > 0.5 ? '#FFFF00' : '#00FFFF';''
            particle.life = 300 + Math.random(''';
            particle.type = 'lightning';
            particle.maxTrailLength = 8;
            particle.trail = [];)
            );
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 大規模爆発効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} config - 設定
     */
    createMassiveExplosionEffect(x: number, y: number, bubbleSize: number, config: BubbleEffectConfig): void { const explosionCount = this.particleManager.adjustParticleCount(40);
        
        for(let i = 0; i < explosionCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            const distance = Math.random() * bubbleSize;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 3 + Math.random() * 8;'
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];''
            particle.life = 1500 + Math.random(''';
            particle.type = 'explosion';
            particle.maxTrailLength = 5;
            particle.trail = [];
            particle.pulseSpeed = 3;)
            );
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * バブルタイプ別の個別効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} options - オプション
     */'
    createTypeSpecificEffect(x: number, y: number, bubbleType: string, bubbleSize: number, options: BubbleEffectOptions): void { ''
        switch(bubbleType') {'
            '';
            case 'diamond':'';
                this.createDiamondRefraction(x, y, bubbleSize');'
                break;''
            case 'rainbow':'';
                this.createRainbowSpiral(x, y, bubbleSize');'
                break;''
            case 'electric':'';
                this.createElectricPulse(x, y, bubbleSize');'
                break;''
            case 'boss':;
                this.createBossDeathEffect(x, y, bubbleSize);
        }
                break; }
        }
    }
    
    /**
     * ダイヤモンド屈折効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     */
    createDiamondRefraction(x: number, y: number, bubbleSize: number): void { const refractionCount = this.particleManager.adjustParticleCount(12);
        
        for(let i = 0; i < refractionCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / refractionCount;
            particle.x = x + Math.cos(angle) * bubbleSize * 0.3;
            particle.y = y + Math.sin(angle) * bubbleSize * 0.3;
            particle.vx = Math.cos(angle) * 80;'
            particle.vy = Math.sin(angle) * 80;''
            particle.size = 1 + Math.random('')';
            particle.color = ['#FFFFFF', '#E6E6FA', '#F0F8FF'][Math.floor(Math.random() * 3')];
            particle.life = 1200;
            particle.maxLife = particle.life;
            particle.alpha = 0.8;
            particle.gravity = 10;'
            particle.friction = 0.99;''
            particle.type = 'diamond';
            particle.rotationSpeed = 15;
            
        
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 虹スパイラル効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} bubbleSize - バブルサイズ
     */'
    createRainbowSpiral(x: number, y: number, bubbleSize: number): void { ''
        const spiralCount = this.particleManager.adjustParticleCount(20');''
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        for(let i = 0; i < spiralCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / spiralCount * 3; // 3回転
            const radius = (i / spiralCount) * bubbleSize;
            
            particle.x = x + Math.cos(angle) * radius;
            particle.y = y + Math.sin(angle) * radius;
            particle.vx = Math.cos(angle + Math.PI / 2) * 60;'
            particle.vy = Math.sin(angle + Math.PI / 2) * 60;''
            particle.size = 2 + Math.random(''';
            particle.type = 'star';
            particle.pulseSpeed = 6;)
            );
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 電気パルス効果（未実装）
     */
    createElectricPulse(x: number, y: number, bubbleSize: number): void { // TODO: 将来実装予定
        this.createElectricArcsEffect(x, y, bubbleSize, this.bubbleEffectConfigs.electric); }
    }
    
    /**
     * ボス死亡効果（未実装）
     */
    createBossDeathEffect(x: number, y: number, bubbleSize: number): void { // TODO: 将来実装予定
        this.createMassiveExplosionEffect(x, y, bubbleSize, this.bubbleEffectConfigs.boss); }
    }
    
    /**
     * 簡略化されたバブル効果（低品質用）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     */
    createSimplifiedBubbleEffect(x: number, y: number, bubbleType: string, bubbleSize: number): void { const config = this.bubbleEffectConfigs[bubbleType] || this.bubbleEffectConfigs.normal;
        const simpleCount = Math.max(3, Math.floor(config.baseParticleCount * 0.3);
        
        for(let i = 0; i < simpleCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / simpleCount;
            const speed = 40 + Math.random() * 40;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 2 + Math.random() * 2;'
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];''
            particle.life = 600 + Math.random(''';
            particle.type = 'circle';)'
            ');
        }'
            this.particleManager.particles.push(particle'); }
        }'
    }''
}