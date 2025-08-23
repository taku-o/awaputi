import { getErrorHandler } from '../../utils/ErrorHandler.js';

// Types
type ErrorHandler = ReturnType<typeof getErrorHandler>;

/**
 * パーティクル基本プロパティ
 */
export interface ParticlePosition {
    x: number;
    y: number;
}

/**
 * パーティクル速度
 */
export interface ParticleVelocity {
    vx: number;
    vy: number;
}

/**
 * パーティクル見た目プロパティ
 */
export interface ParticleAppearance {
    size: number;
    color: string;
    alpha: number;
    rotation: number;
    rotationSpeed: number;
    scale: number;
    scaleSpeed: number;
}

/**
 * パーティクル物理プロパティ
 */
export interface ParticlePhysics {
    gravity: number;
    friction: number;
    bounce: number;
}

/**
 * パーティクルライフサイクル
 */
export interface ParticleLifecycle {
    life: number;
    maxLife: number;
    isActive: boolean;
}

/**
 * パーティクル特殊プロパティ
 */
export interface ParticleSpecialProperties {
    pulseSpeed: number;
    trail: ParticleTrailPoint[];
    maxTrailLength: number;
    zIndex: number;
}

/**
 * パーティクルトレイルポイント
 */
export interface ParticleTrailPoint {
    x: number;
    y: number;
    alpha: number;
}

/**
 * パーティクルタイプ
 */
export type ParticleType = 'circle' | 'star' | 'lightning' | 'spike' | 'diamond' | 'explosion' | 'cloud' | 'ripple';

/**
 * パーティクルオブジェクト
 */
export interface Particle extends
    ParticlePosition,
    ParticleVelocity,
    ParticleAppearance,
    ParticlePhysics,
    ParticleLifecycle,
    ParticleSpecialProperties {
    id: number;
    type: ParticleType;
}

/**
 * ライフサイクル統計
 */
export interface LifecycleStats {
    created: number;
    destroyed: number;
    poolHits: number;
    poolMisses: number;
    maxActiveParticles: number;
}

export interface BubbleParticleConfig {
    count: number;
    speed: number;
    size: number;
    life: number;
}

export interface StarParticleConfig {
    count: number;
    speed: number;
    size: number;
    life: number;
}

export interface MemoryUtilization {
    poolSize: number;
    maxPoolSize: number;
    poolUsagePercent: string;
}

export interface ExtendedLifecycleStats extends LifecycleStats {
    currentPoolSize: number;
    poolEfficiency: number;
    memoryUtilization: MemoryUtilization;
}

/**
 * バブル設定
 */
export interface BubbleConfig {
    count: number;
    speed: number;
    size: number;
    life: number;
}

/**
 * スター設定
 */
export interface StarConfig {
    count: number;
    speed: number;
    size: number;
    life: number;
}

/**
 * パーティクル設定
 */
export interface ParticleConfig {
    bubble: BubbleConfig;
    star: StarConfig;
}

/**
 * パーティクルマネージャーインターフェース
 */
export interface ParticleManagerInterface {
    poolSize: number;
    renderer: {
        getBubbleColors(bubbleType: string): string[];
    };
}

/**
 * ParticleLifecycleManager
 * パーティクルの生成・破棄・メモリ管理・ライフサイクル制御を担当
 */
export class ParticleLifecycleManager {
    private readonly particleManager: ParticleManagerInterface;
    private readonly errorHandler: ErrorHandler;
    // パーティクルプール
    private particlePool: Particle[];
    private particleId: number;
    // ライフサイクル統計
    private lifecycleStats: LifecycleStats;

    constructor(particleManager: ParticleManagerInterface) {
        this.particleManager = particleManager;
        this.errorHandler = getErrorHandler();
        this.particlePool = [];
        this.particleId = 0;
        this.lifecycleStats = {
            created: 0,
            destroyed: 0,
            poolHits: 0,
            poolMisses: 0,
            maxActiveParticles: 0
        };
        console.log('[ParticleLifecycleManager] Lifecycle manager initialized');
    }

    /**
     * パーティクルプールを初期化
     */
    initializePool(poolSize: number): void {
        this.particlePool = [];
        for (let i = 0; i < poolSize; i++) {
            this.particlePool.push(this.createParticle());
        }
        
        console.log(`[ParticleLifecycleManager] Pool initialized with ${poolSize} particles`);
    }

    /**
     * パーティクルオブジェクトを作成
     */
    createParticle(): Particle {
        return {
            id: this.particleId++,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 0,
            color: '#FFFFFF',
            life: 0,
            maxLife: 0,
            alpha: 1,
            rotation: 0,
            rotationSpeed: 0,
            scale: 1,
            scaleSpeed: 0,
            gravity: 0,
            friction: 1,
            bounce: 0,
            type: 'circle',
            isActive: false,
            // 特殊プロパティ
            pulseSpeed: 0,
            trail: [],
            maxTrailLength: 0,
            zIndex: 0
        };
    }

    /**
     * プールからパーティクルを取得
     */
    getParticleFromPool(): Particle {
        if (this.particlePool.length > 0) {
            const particle = this.particlePool.pop()!;
            this.resetParticle(particle);
            particle.isActive = true;
            particle.id = this.particleId++;
            this.lifecycleStats.poolHits++;
            return particle;
        }
        
        // プールが空の場合は新規作成
        const particle = this.createParticle();
        particle.isActive = true;
        particle.id = this.particleId++;
        this.lifecycleStats.poolMisses++;
        this.lifecycleStats.created++;
        return particle;
    }

    /**
     * パーティクルをプールに戻す
     */
    returnParticleToPool(particle: Particle): void {
        particle.isActive = false;
        particle.trail = [];
        
        if (this.particlePool.length < this.particleManager.poolSize) {
            this.particlePool.push(particle);
        }
        
        this.lifecycleStats.destroyed++;
    }

    /**
     * パーティクルをリセット
     */
    resetParticle(particle: Particle): void {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.size = 0;
        particle.color = '#FFFFFF';
        particle.life = 0;
        particle.maxLife = 0;
        particle.alpha = 1;
        particle.rotation = 0;
        particle.rotationSpeed = 0;
        particle.scale = 1;
        particle.scaleSpeed = 0;
        particle.gravity = 0;
        particle.friction = 1;
        particle.bounce = 0;
        particle.type = 'circle';
        particle.pulseSpeed = 0;
        particle.trail = [];
        particle.maxTrailLength = 0;
        particle.zIndex = 0;
    }

    /**
     * 泡ポップエフェクト用パーティクルを生成
     */
    createBubblePopParticles(
        x: number,
        y: number,
        bubbleType: string,
        bubbleSize: number,
        config: ParticleConfig,
        quality: number
    ): Particle[] {
        const particles: Particle[] = [];
        
        try {
            const bubbleConfig = config.bubble;
            const colors = this.particleManager.renderer.getBubbleColors(bubbleType);
            
            // 品質に基づいてパーティクル数を調整
            const baseParticleCount = Math.floor(bubbleSize / 5) + bubbleConfig.count;
            const particleCount = Math.floor(baseParticleCount * quality);
            
            for (let i = 0; i < particleCount; i++) {
                const particle = this.getParticleFromPool();
                
                // 基本プロパティ
                particle.x = x + (Math.random() - 0.5) * bubbleSize * 0.5;
                particle.y = y + (Math.random() - 0.5) * bubbleSize * 0.5;
                
                // 速度（放射状に飛び散る）
                const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
                const speed = bubbleConfig.speed * (0.5 + Math.random() * 0.5) * quality;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                
                // 見た目
                particle.size = bubbleConfig.size * (0.5 + Math.random() * 0.5) * quality;
                particle.color = colors[Math.floor(Math.random() * colors.length)];
                particle.life = bubbleConfig.life * (0.8 + Math.random() * 0.4);
                particle.maxLife = particle.life;
                particle.alpha = 1;
                
                // 物理
                particle.gravity = 20 + Math.random() * 30;
                particle.friction = 0.98;
                particle.bounce = 0.3 + Math.random() * 0.4;
                
                // アニメーション
                particle.rotation = Math.random() * Math.PI * 2;
                particle.rotationSpeed = (Math.random() - 0.5) * 10;
                particle.scale = 1;
                particle.scaleSpeed = -0.8 / (particle.life / 1000);
                particle.type = 'circle';

                particles.push(particle);
            }
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'PARTICLE_ERROR', {
                operation: 'createBubblePopParticles',
                component: 'ParticleLifecycleManager'
            });
        }
        
        return particles;
    }

    /**
     * 虹色きらめきパーティクルを生成
     */
    createRainbowSparkles(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const sparkleCount = 15;
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        for (let i = 0; i < sparkleCount; i++) {
            const particle = this.getParticleFromPool();
            particle.x = x + (Math.random() - 0.5) * size;
            particle.y = y + (Math.random() - 0.5) * size;
            particle.vx = (Math.random() - 0.5) * 80;
            particle.vy = (Math.random() - 0.5) * 80;
            particle.size = 3 + Math.random() * 2;
            particle.color = colors[Math.floor(Math.random() * colors.length)];
            particle.life = 1200;
            particle.maxLife = particle.life;
            particle.gravity = -10; // 上向きに浮く
            particle.friction = 0.95;
            particle.type = 'star';
            particle.pulseSpeed = 5 + Math.random() * 5;
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * 電気スパークパーティクルを生成
     */
    createElectricSparks(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const sparkCount = 20;
        
        for (let i = 0; i < sparkCount; i++) {
            const particle = this.getParticleFromPool();
            particle.x = x;
            particle.y = y;
            particle.vx = (Math.random() - 0.5) * 200;
            particle.vy = (Math.random() - 0.5) * 200;
            particle.size = 1 + Math.random() * 2;
            particle.color = Math.random() > 0.5 ? '#FFFF00' : '#00FFFF';
            particle.life = 300 + Math.random() * 200;
            particle.maxLife = particle.life;
            particle.type = 'lightning';
            particle.maxTrailLength = 5;
            particle.trail = [];
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * スパイク爆発パーティクルを生成
     */
    createSpikeExplosion(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const spikeCount = 8;
        
        for (let i = 0; i < spikeCount; i++) {
            const particle = this.getParticleFromPool();
            const angle = (Math.PI * 2 * i) / spikeCount;
            const speed = 120 + Math.random() * 80;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 3 + Math.random() * 2;
            particle.color = '#FF4500';
            particle.life = 600;
            particle.maxLife = particle.life;
            particle.gravity = 30;
            particle.friction = 0.95;
            particle.type = 'spike';
            particle.rotation = angle;
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * ダイヤモンドの破片パーティクルを生成
     */
    createDiamondShards(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const shardCount = 12;
        
        for (let i = 0; i < shardCount; i++) {
            const particle = this.getParticleFromPool();
            particle.x = x + (Math.random() - 0.5) * size * 0.3;
            particle.y = y + (Math.random() - 0.5) * size * 0.3;
            particle.vx = (Math.random() - 0.5) * 120;
            particle.vy = (Math.random() - 0.5) * 120;
            particle.size = 2 + Math.random() * 3;
            particle.color = Math.random() > 0.3 ? '#FFFFFF' : '#E6E6FA';
            particle.life = 1000 + Math.random() * 500;
            particle.maxLife = particle.life;
            particle.type = 'diamond';
            particle.rotationSpeed = (Math.random() - 0.5) * 15;
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * ボス爆発パーティクルを生成
     */
    createBossExplosion(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const explosionCount = 30;
        
        for (let i = 0; i < explosionCount; i++) {
            const particle = this.getParticleFromPool();
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            
            particle.x = x + (Math.random() - 0.5) * size;
            particle.y = y + (Math.random() - 0.5) * size;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 4 + Math.random() * 4;
            particle.color = ['#8B0000', '#DC143C', '#FF0000'][Math.floor(Math.random() * 3)];
            particle.life = 1500 + Math.random() * 1000;
            particle.maxLife = particle.life;
            particle.type = 'explosion';
            particle.maxTrailLength = 3;
            particle.trail = [];
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * 毒の雲パーティクルを生成
     */
    createPoisonCloud(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const cloudCount = 10;
        
        for (let i = 0; i < cloudCount; i++) {
            const particle = this.getParticleFromPool();
            particle.x = x + (Math.random() - 0.5) * size;
            particle.y = y + (Math.random() - 0.5) * size;
            particle.vx = (Math.random() - 0.5) * 30;
            particle.vy = (Math.random() - 0.5) * 30;
            particle.size = 5 + Math.random() * 8;
            particle.color = Math.random() > 0.5 ? '#32CD32' : '#00FF00';
            particle.life = 2000 + Math.random() * 1000;
            particle.maxLife = particle.life;
            particle.type = 'cloud';
            particle.pulseSpeed = 2;
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * 時間の波紋パーティクルを生成
     */
    createTimeRipple(x: number, y: number, size: number): Particle[] {
        const particles: Particle[] = [];
        const rippleCount = 5;
        
        for (let i = 0; i < rippleCount; i++) {
            const particle = this.getParticleFromPool();
            particle.x = x;
            particle.y = y;
            particle.vx = 0;
            particle.vy = 0;
            particle.size = size;
            particle.color = '#FFD700';
            particle.life = 1000 + i * 200;
            particle.maxLife = particle.life;
            particle.type = 'ripple';
            particle.scaleSpeed = 2;
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * コンボエフェクト用パーティクルを生成
     */
    createComboParticles(
        x: number,
        y: number,
        comboCount: number,
        config: ParticleConfig,
        quality: number
    ): Particle[] {
        const particles: Particle[] = [];
        
        try {
            const starConfig = config.star;
            const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'];
            
            // 品質に基づいてパーティクル数を調整
            const baseStarCount = Math.min(comboCount, starConfig.count * 2);
            const starCount = Math.floor(baseStarCount * quality);
            
            for (let i = 0; i < starCount; i++) {
                const particle = this.getParticleFromPool();
                const angle = (Math.PI * 2 * i) / starCount;
                const radius = 30 + comboCount * 2;
                const speed = starConfig.speed * (0.6 + Math.random() * 0.4) * quality;
                
                particle.x = x + Math.cos(angle) * radius;
                particle.y = y + Math.sin(angle) * radius;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                particle.size = starConfig.size * (0.75 + Math.random() * 0.5) * quality;
                particle.color = colors[Math.min(Math.floor(comboCount / 5), colors.length - 1)];
                particle.life = starConfig.life * (0.8 + Math.random() * 0.4);
                particle.maxLife = particle.life;
                particle.gravity = -20;
                particle.friction = 0.97;
                particle.type = 'star';
                particle.rotationSpeed = (Math.random() - 0.5) * 10;

                particles.push(particle);
            }
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'PARTICLE_ERROR', {
                operation: 'createComboParticles',
                component: 'ParticleLifecycleManager'
            });
        }
        
        return particles;
    }

    /**
     * パーティクル更新処理
     */
    updateParticles(particles: Particle[], deltaTime: number): Particle[] {
        const deltaSeconds = deltaTime / 1000;
        const activeParticles: Particle[] = [];
        
        particles.forEach(particle => {
            if (!particle.isActive) return;
            
            // 生存時間の更新
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                this.returnParticleToPool(particle);
                return;
            }
            
            // 物理更新
            this.updatePhysics(particle, deltaSeconds);
            
            // 見た目の更新
            this.updateAppearance(particle, deltaSeconds);
            
            // トレイル更新
            this.updateTrail(particle);
            
            activeParticles.push(particle);
        });
        
        // 統計更新
        this.lifecycleStats.maxActiveParticles = Math.max(
            this.lifecycleStats.maxActiveParticles,
            activeParticles.length
        );
        
        return activeParticles;
    }

    /**
     * 物理更新
     */
    updatePhysics(particle: Particle, deltaSeconds: number): void {
        // 重力の適用
        particle.vy += particle.gravity * deltaSeconds;
        
        // 摩擦の適用
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        
        // 位置更新
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        
        // 境界での跳ね返り
        if (particle.bounce > 0) {
            if (particle.y > 600 && particle.vy > 0) {
                particle.vy *= -particle.bounce;
                particle.y = 600;
            }
        }
    }

    /**
     * 見た目の更新
     */
    updateAppearance(particle: Particle, deltaSeconds: number): void {
        const lifeRatio = particle.life / particle.maxLife;
        
        // 透明度（フェードアウト）
        particle.alpha = lifeRatio;
        
        // スケール
        particle.scale += particle.scaleSpeed * deltaSeconds;
        particle.scale = Math.max(0.1, particle.scale);
        
        // 回転
        particle.rotation += particle.rotationSpeed * deltaSeconds;
        
        // パルス効果
        if (particle.pulseSpeed > 0) {
            const pulse = Math.sin(Date.now() * 0.001 * particle.pulseSpeed) * 0.3 + 1;
            particle.scale *= pulse;
        }
    }

    /**
     * トレイル更新
     */
    updateTrail(particle: Particle): void {
        if (particle.maxTrailLength > 0) {
            particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
            
            if (particle.trail.length > particle.maxTrailLength) {
                particle.trail.shift();
            }
        }
    }

    /**
     * プールサイズを変更
     */
    resizePool(newSize: number): void {
        if (this.particlePool.length > newSize) {
            // プールサイズが小さくなった場合は余分なパーティクルを削除
            this.particlePool.splice(newSize);
        } else if (this.particlePool.length < newSize) {
            // プールサイズが大きくなった場合は新しいパーティクルを追加
            const addCount = newSize - this.particlePool.length;
            for (let i = 0; i < addCount; i++) {
                this.particlePool.push(this.createParticle());
            }
        }
        
        console.log(`[ParticleLifecycleManager] Pool resized to ${newSize}`);
    }

    /**
     * 全パーティクルをクリア
     */
    clearAllParticles(particles: Particle[]): void {
        particles.forEach(particle => {
            this.returnParticleToPool(particle);
        });
        
        console.log('[ParticleLifecycleManager] All particles cleared');
    }

    /**
     * ライフサイクル統計を取得
     */
    getLifecycleStats(): ExtendedLifecycleStats {
        return {
            ...this.lifecycleStats,
            currentPoolSize: this.particlePool.length,
            poolEfficiency: this.lifecycleStats.poolHits / 
                           (this.lifecycleStats.poolHits + this.lifecycleStats.poolMisses) * 100,
            memoryUtilization: {
                poolSize: this.particlePool.length,
                maxPoolSize: this.particleManager.poolSize,
                poolUsagePercent: ((this.particleManager.poolSize - this.particlePool.length) / 
                                 this.particleManager.poolSize * 100).toFixed(1)
            }
        };
    }

    /**
     * メモリ使用量の最適化
     */
    optimizeMemoryUsage(): void {
        // 不要なパーティクルオブジェクトを削除
        const targetPoolSize = Math.min(this.particleManager.poolSize, this.particlePool.length);
        if (this.particlePool.length > targetPoolSize) {
            this.particlePool.splice(targetPoolSize);
        }
        
        // 統計をリセット
        if (this.lifecycleStats.created > 10000) {
            this.lifecycleStats.created = Math.floor(this.lifecycleStats.created * 0.1);
            this.lifecycleStats.destroyed = Math.floor(this.lifecycleStats.destroyed * 0.1);
            this.lifecycleStats.poolHits = Math.floor(this.lifecycleStats.poolHits * 0.1);
            this.lifecycleStats.poolMisses = Math.floor(this.lifecycleStats.poolMisses * 0.1);
        }

        console.log('[ParticleLifecycleManager] Memory usage optimized');
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.particlePool = [];
        this.lifecycleStats = {
            created: 0,
            destroyed: 0,
            poolHits: 0,
            poolMisses: 0,
            maxActiveParticles: 0
        };
        console.log('[ParticleLifecycleManager] Cleanup completed');
    }
}