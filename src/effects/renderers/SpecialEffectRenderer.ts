import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Special effect configuration interface
 */
interface SpecialEffectConfig { name: string,
    particleCount: number,
    colors: string[],
    duration: number,
    priority: number }
}

/**
 * Special effects map interface
 */
interface SpecialEffects { [key: string]: SpecialEffectConfig,
    }
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
    rotationSpeed?: number;
    scaleSpeed?: number;
    maxTrailLength?: number; }
    trail?: Array<{ x: number; y: number }>;
    pulseSpeed?: number;
    vortexCenter?: { x: number; y: number }
    vortexStrength?: number;
}

/**
 * Particle manager interface
 */
interface ParticleManager { particles: Particle[],
    getParticleFromPool(): Particle;
    shouldRenderEffect(effectType: string, priority: number): boolean,
    adjustParticleCount(count: number): number,
    getEffectIntensityMultiplier(): number }
}

/**
 * 特殊効果専用レンダラー
 * 一般的なパーティクル効果や特殊演出を管理
 */
export class SpecialEffectRenderer {
    private particleManager: ParticleManager;
    private specialEffects: SpecialEffects';
'';
    constructor(particleManager: ParticleManager') {
        this.particleManager = particleManager;
        
        // 特殊効果の定義
        this.specialEffects = {
            // 基本効果
            explosion: {''
                name: '爆発',';
                particleCount: 20,'';
                colors: ['#FF4500', '#FF6347', '#FF8C00', '#FFA500'],
                duration: 1200,
    }
    }
                priority: 6 }
            },'
            implosion: { ''
                name: '内破',';
                particleCount: 15,'';
                colors: ['#4B0082', '#8A2BE2', '#9932CC', '#BA55D3'],
                duration: 800,
                priority: 5 }
            },'
            vortex: { ''
                name: '渦',';
                particleCount: 25,'';
                colors: ['#00CED1', '#20B2AA', '#48D1CC', '#00FFFF'],
                duration: 2000,
                priority: 7 }
            },
            
            // エネルギー効果
            energy_discharge: { ''
                name: 'エネルギー放出',';
                particleCount: 30,'';
                colors: ['#00FF00', '#32CD32', '#7FFF00', '#ADFF2F'],
                duration: 1500,
                priority: 8 }
            },'
            plasma_wave: { ''
                name: 'プラズマ波',';
                particleCount: 18,'';
                colors: ['#FF00FF', '#DA70D6', '#EE82EE', '#DDA0DD'],
                duration: 1000,
                priority: 7 }
            },
            
            // 魔法効果
            magic_circle: { ''
                name: '魔法陣',';
                particleCount: 12,'';
                colors: ['#4169E1', '#6495ED', '#87CEEB', '#B0E0E6'],
                duration: 3000,
                priority: 9 }
            },'
            teleport: { ''
                name: 'テレポート',';
                particleCount: 16,'';
                colors: ['#9370DB', '#8B008B', '#9400D3', '#9932CC'],
                duration: 1200,
                priority: 8 }
            },
            
            // 自然効果
            wind_gust: { ''
                name: '突風',';
                particleCount: 22,'';
                colors: ['#F0F8FF', '#E6E6FA', '#D3D3D3', '#C0C0C0'],
                duration: 1800,
                priority: 4 }
            },'
            fire_burst: { ''
                name: '炎上',';
                particleCount: 28,'';
                colors: ['#DC143C', '#B22222', '#FF0000', '#FF4500'],
                duration: 2200,
                priority: 7 }
            },'
            ice_shatter: { ''
                name: '氷砕',';
                particleCount: 20,'';
                colors: ['#B0E0E6', '#ADD8E6', '#87CEEB', '#E0FFFF'],
                duration: 1600,
                priority: 6 }
            }
        },'
        '';
        console.log('[SpecialEffectRenderer] 初期化完了');
    }
    
    /**
     * 特殊効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - 効果タイプ
     * @param {number} intensity - 強度 (0.1-2.0)
     */
    createSpecialEffect(x: number, y: number, effectType: string, intensity: number = 1.0): void { try {
            const effectConfig = this.specialEffects[effectType];
            if (!effectConfig) { }
                console.warn(`[SpecialEffectRenderer] 未知の効果タイプ: ${effectType)`});
                return;
            }
            
            // 品質チェック
            if(!this.particleManager.shouldRenderEffect(effectType, effectConfig.priority) {
                this.createSimplifiedSpecialEffect(x, y, effectType, intensity);
            }
                return; }
            }
            ;
            // 効果タイプ別の処理
            switch(effectType') {'
                '';
                case 'explosion':'';
                    this.createExplosionEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'implosion':'';
                    this.createImplosionEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'vortex':'';
                    this.createVortexEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'energy_discharge':'';
                    this.createEnergyDischargeEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'plasma_wave':'';
                    this.createPlasmaWaveEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'magic_circle':'';
                    this.createMagicCircleEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'teleport':'';
                    this.createTeleportEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'wind_gust':'';
                    this.createWindGustEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'fire_burst':'';
                    this.createFireBurstEffect(x, y, intensity, effectConfig');'
                    break;''
                case 'ice_shatter':;
                    this.createIceShatterEffect(x, y, intensity, effectConfig);
                    break;
                default:;
                    this.createGenericSpecialEffect(x, y, effectType, intensity, effectConfig);
            }
                    break; }'
            } catch (error) { ''
            getErrorHandler(').handleError(error, 'SPECIAL_EFFECT_ERROR', {')'
                context: 'SpecialEffectRenderer.createSpecialEffect') }
            });
        }
    }
    
    /**
     * 爆発効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {Object} config - 設定
     */
    createExplosionEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig): void { const adjustedCount = this.particleManager.adjustParticleCount(config.particleCount * intensity);
        const intensityMultiplier = this.particleManager.getEffectIntensityMultiplier();
        
        for(let i = 0; i < adjustedCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const speed = (80 + Math.random() * 120) * intensity * intensityMultiplier;
            const distance = Math.random() * 20 * intensity;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = (2 + Math.random() * 6) * intensity * intensityMultiplier;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.life = config.duration * (0.7 + Math.random() * 0.6);
            particle.maxLife = particle.life;
            particle.alpha = 0.8 + Math.random() * 0.2;
            particle.gravity = 30;'
            particle.friction = 0.92;''
            particle.bounce = 0.2 + Math.random()';
            particle.type = 'explosion';)
            particle.rotationSpeed = (Math.random() - 0.5) * 15;
            particle.scaleSpeed = -0.8 / (particle.life / 1000);
            particle.maxTrailLength = Math.floor(3 * intensity);
            particle.trail = [];
            
        
        }
            this.particleManager.particles.push(particle); }
        }
        
        // 中心の白い閃光
        this.createCenterFlash(x, y, intensity);
    }
    
    /**
     * 内破効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {Object} config - 設定
     */
    createImplosionEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig): void { const adjustedCount = this.particleManager.adjustParticleCount(config.particleCount * intensity);
        
        // 第一段階: 外側から内側へ収束
        for(let i = 0; i < adjustedCount; i++) {
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / adjustedCount + Math.random() * 0.5;
            const startRadius = 100 + Math.random() * 50;
            const speed = 150 * intensity;
            
            particle.x = x + Math.cos(angle) * startRadius;
            particle.y = y + Math.sin(angle) * startRadius;
            particle.vx = -Math.cos(angle) * speed;
            particle.vy = -Math.sin(angle) * speed;
            particle.size = (1 + Math.random() * 3) * intensity;''
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length')];
            particle.life = config.duration * 0.6;
            particle.maxLife = particle.life;
            particle.alpha = 0.7;
            particle.gravity = 0;'
            particle.friction = 0.98;''
            particle.type = 'glow_circle';
            particle.pulseSpeed = 8;
            
        }
            this.particleManager.particles.push(particle); }
        }
        
        // 第二段階: 中心からの爆発（遅延）
        setTimeout(() => {  this.createExplosionEffect(x, y, intensity * 0.8, {)
                ...config);''
                particleCount: Math.floor(config.particleCount * 0.6'),' }'
                colors: ['#FFFFFF', '#E6E6FA', '#D3D3D3'] }
            });
        }, config.duration * 0.4);
    }
    
    /**
     * 渦効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {Object} config - 設定
     */
    createVortexEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig): void { const adjustedCount = this.particleManager.adjustParticleCount(config.particleCount * intensity);
        
        for(let i = 0; i < adjustedCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / adjustedCount;
            const radius = 20 + (i / adjustedCount) * 80 * intensity;
            const spiralSpeed = 60 + intensity * 40;
            
            particle.x = x + Math.cos(angle) * radius;
            particle.y = y + Math.sin(angle) * radius;
            particle.vx = Math.cos(angle + Math.PI / 2) * spiralSpeed;
            particle.vy = Math.sin(angle + Math.PI / 2) * spiralSpeed;
            particle.size = (2 + Math.random() * 3) * intensity;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.life = config.duration * (0.8 + Math.random() * 0.4);'
            particle.maxLife = particle.life;''
            particle.alpha = 0.6 + Math.random(''';
            particle.type = 'advanced_circle';
            particle.rotationSpeed = 10;
            particle.maxTrailLength = 5;
            particle.trail = [];
            
        
        }
            // 渦の収束力を追加（カスタム物理） }
            particle.vortexCenter = { x, y };
            particle.vortexStrength = intensity;)
            );
            this.particleManager.particles.push(particle);
        }
    }
    
    /**
     * エネルギー放出効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {Object} config - 設定
     */
    createEnergyDischargeEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig): void { const adjustedCount = this.particleManager.adjustParticleCount(config.particleCount * intensity);
        
        // ランダムな方向へのエネルギー放射
        for(let i = 0; i < adjustedCount; i++) {
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const speed = (100 + Math.random() * 80) * intensity;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = (2 + Math.random() * 4) * intensity;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];''
            particle.life = config.duration * (0.6 + Math.random() * 0.8');
            particle.maxLife = particle.life;
            particle.alpha = 0.9;
            particle.gravity = 0;'
            particle.friction = 0.96;''
            particle.type = 'energy_orb';
            particle.pulseSpeed = 12;
            particle.maxTrailLength = 6;
            particle.trail = [];
            
        }
            this.particleManager.particles.push(particle); }
        }
        
        // 中心のエネルギーコア
        this.createEnergyCore(x, y, intensity, config.colors[0]);
    }
    
    /**
     * プラズマ波効果（未実装メソッド）
     */''
    createPlasmaWaveEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig'): void { // TODO: 将来実装予定
        this.createGenericSpecialEffect(x, y, 'plasma_wave', intensity, config) }
    }
    
    /**
     * テレポート効果（未実装メソッド）'
     */''
    createTeleportEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig'): void { // TODO: 将来実装予定
        this.createGenericSpecialEffect(x, y, 'teleport', intensity, config) }
    }
    
    /**
     * 突風効果（未実装メソッド）'
     */''
    createWindGustEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig'): void { // TODO: 将来実装予定
        this.createGenericSpecialEffect(x, y, 'wind_gust', intensity, config) }
    }
    
    /**
     * 炎上効果（未実装メソッド）'
     */''
    createFireBurstEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig'): void { // TODO: 将来実装予定
        this.createGenericSpecialEffect(x, y, 'fire_burst', intensity, config) }
    }
    
    /**
     * 氷砕効果（未実装メソッド）'
     */''
    createIceShatterEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig'): void { // TODO: 将来実装予定
        this.createGenericSpecialEffect(x, y, 'ice_shatter', intensity, config) }
    }
    
    /**
     * 魔法陣効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {Object} config - 設定
     */
    createMagicCircleEffect(x: number, y: number, intensity: number, config: SpecialEffectConfig): void { const adjustedCount = this.particleManager.adjustParticleCount(config.particleCount * intensity);
        
        // 複数の同心円を作成
        for(let ring = 0; ring < 3; ring++) {
            const ringRadius = (30 + ring * 25) * intensity;
            const ringParticles = Math.floor(adjustedCount / 3);
            
            for (let i = 0; i < ringParticles; i++) {
                const particle = this.particleManager.getParticleFromPool();
                
                const angle = (Math.PI * 2 * i) / ringParticles;
                const radius = ringRadius + Math.sin(Date.now() * 0.005 + ring) * 5;
                
                particle.x = x + Math.cos(angle) * radius;
                particle.y = y + Math.sin(angle) * radius;
                particle.vx = Math.cos(angle + Math.PI / 2) * 20;
                particle.vy = Math.sin(angle + Math.PI / 2) * 20;
                particle.size = (1 + Math.random() * 2) * intensity;
                particle.color = config.colors[ring % config.colors.length];''
                particle.life = config.duration * (1 + ring * 0.2');
                particle.maxLife = particle.life;
                particle.alpha = 0.8 - ring * 0.2;
                particle.gravity = 0;'
                particle.friction = 0.999;''
                particle.type = 'magic_sparkle';
                particle.pulseSpeed = 6 - ring;
                
        }
                this.particleManager.particles.push(particle); }
            }
        }
        
        // 中央の魔法文字（装飾的なパーティクル）
        this.createMagicSymbols(x, y, intensity, config.colors);
    }
    
    /**
     * 中心の閃光を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     */
    createCenterFlash(x: number, y: number, intensity: number): void { ''
        const particle = this.particleManager.getParticleFromPool(''';
        particle.color = '#FFFFFF';
        particle.life = 200;
        particle.maxLife = particle.life;
        particle.alpha = 1.0;
        particle.gravity = 0;'
        particle.friction = 1;''
        particle.type = 'glow_circle';
        particle.scaleSpeed = -4;)
        );
        this.particleManager.particles.push(particle); }
    }
    
    /**
     * エネルギーコアを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {string} color - 色
     */
    createEnergyCore(x: number, y: number, intensity: number, color: string): void { for (let i = 0; i < 3; i++) {
            const particle = this.particleManager.getParticleFromPool();
            
            particle.x = x;
            particle.y = y;
            particle.vx = 0;'
            particle.vy = 0;''
            particle.size = (20 - i * 5') * intensity;''
            particle.color = i === 0 ? '#FFFFFF' : color;
            particle.life = 800 + i * 200;
            particle.maxLife = particle.life;
            particle.alpha = 0.9 - i * 0.2;
            particle.gravity = 0;'
            particle.friction = 1;''
            particle.type = 'energy_orb';
            particle.pulseSpeed = 8 + i * 2;
            particle.scaleSpeed = -0.5;
            
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 魔法文字を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} intensity - 強度
     * @param {Array} colors - 色配列
     */
    createMagicSymbols(x: number, y: number, intensity: number, colors: string[]): void { for (let i = 0; i < 6; i++) {
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / 6;
            const distance = 15 * intensity;
            ';'
            particle.x = x + Math.cos(angle) * distance;''
            particle.y = y + Math.sin(angle') * distance;
            particle.vx = 0;
            particle.vy = 0;
            particle.size = 3 * intensity;
            particle.color = colors[i % colors.length];
            particle.life = 2000;
            particle.maxLife = particle.life;
            particle.alpha = 0.9;
            particle.gravity = 0;'
            particle.friction = 1;''
            particle.type = 'diamond';
            particle.rotationSpeed = 5;
            particle.pulseSpeed = 3;
            
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 汎用特殊効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - 効果タイプ
     * @param {number} intensity - 強度
     * @param {Object} config - 設定
     */
    createGenericSpecialEffect(x: number, y: number, effectType: string, intensity: number, config: SpecialEffectConfig): void { const adjustedCount = this.particleManager.adjustParticleCount(config.particleCount * intensity);
        
        for(let i = 0; i < adjustedCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / adjustedCount + Math.random() * 0.5;
            const speed = (50 + Math.random() * 100) * intensity;
            
            particle.x = x + (Math.random() - 0.5) * 20;
            particle.y = y + (Math.random() - 0.5) * 20;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = (2 + Math.random() * 4) * intensity;
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            particle.life = config.duration * (0.7 + Math.random() * 0.6);'
            particle.maxLife = particle.life;''
            particle.alpha = 0.7 + Math.random()';
            particle.type = 'advanced_circle';)
            particle.rotationSpeed = (Math.random() - 0.5) * 10;
            
        
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 簡略化された特殊効果（低品質用）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - 効果タイプ
     * @param {number} intensity - 強度
     */
    createSimplifiedSpecialEffect(x: number, y: number, effectType: string, intensity: number): void { const config = this.specialEffects[effectType];
        if (!config) return;
        
        const simpleCount = Math.max(3, Math.floor(config.particleCount * 0.3 * intensity);
        
        for(let i = 0; i < simpleCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / simpleCount;
            const speed = 60 * intensity;
            
            particle.x = x;
            particle.y = y;'
            particle.vx = Math.cos(angle) * speed;''
            particle.vy = Math.sin(angle') * speed;
            particle.size = 3 * intensity;
            particle.color = config.colors[0];
            particle.life = config.duration * 0.6;
            particle.maxLife = particle.life;
            particle.alpha = 0.7;
            particle.gravity = 15;'
            particle.friction = 0.95;''
            particle.type = 'circle';
            
        
        }
            this.particleManager.particles.push(particle); }
        }
    }
    
    /**
     * 利用可能な特殊効果のリストを取得
     * @returns {Array} 効果名のリスト
     */
    getAvailableEffects(): string[] { return Object.keys(this.specialEffects); }
    }
    
    /**
     * 特殊効果の情報を取得
     * @param {string} effectType - 効果タイプ
     * @returns {Object|null} 効果情報'
     */''
    getEffectInfo(effectType: string'): SpecialEffectConfig | null { return this.specialEffects[effectType] || null; }'
    }''
}