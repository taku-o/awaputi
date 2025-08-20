import { getErrorHandler } from '../../utils/ErrorHandler.js';

// Types
type ErrorHandler = ReturnType<typeof getErrorHandler>;

// Export interfaces for particle physics
export interface PhysicsSettings { gravity: number,
    friction: number,
    bounce: number,
    airResistance: number,
    collisionDetection: boolean,
    magneticFields: MagneticField[],
    windForce: Vector2D
    }
}

export interface AnimationSettings { interpolation: boolean,
    easingEnabled: boolean,
    smoothRotation: boolean,
    smoothScaling: boolean }
}

export interface MagneticField { x: number,
    y: number,
    strength: number,
    radius: number,
    radiusSquared: number }
}

export interface Vector2D { x: number,
    y: number }
}

export interface Boundaries { left: number,
    right: number,
    top: number,
    bottom: number }
}

export interface TrailPoint { x: number,
    y: number,
    alpha?: number }
}

export interface PulsationConfig { speed: number,
    amplitude: number }
}

export interface Particle { x: number,
    y: number,
    vx: number,
    vy: number,
    size?: number;
    color?: string;
    life: number,
    maxLife: number,
    alpha: number,
    active: boolean,
    type: string,
    rotation?: number;
    rotationSpeed?: number;
    baseScale?: number;
    currentScale?: number;
    pulsation?: PulsationConfig;
    gravityAffected?: boolean;
    hasTrail?: boolean;
    trail?: TrailPoint[];
    trailLength?: number;
    mass?: number; }
}
';'
export interface BackgroundParticle extends Particle { ''
    type: 'background',
    gravityAffected: false }
}'
'';
export type BackgroundTheme = 'default' | 'stars' | 'snow' | 'sakura' | 'ocean';

export interface TimingProfiles { [key: string]: any }
}

/**
 * Particle Physics Engine
 * パーティクル物理演算エンジン - 物理シミュレーション、アニメーション、相互作用
 */
export class ParticlePhysicsEngine {
    private errorHandler: ErrorHandler;
    // 物理演算設定
    private physicsSettings: PhysicsSettings;
    // アニメーション設定
    private animationSettings: AnimationSettings;
    // 背景パーティクル管理
    private backgroundParticles: BackgroundParticle[];
    private backgroundEnabled: boolean;
    private backgroundDensity: number;
    private backgroundTheme: BackgroundTheme;
    // タイミングプロファイル
    private timingProfiles?: TimingProfiles;

    constructor() {
';'
        '';
        this.errorHandler = getErrorHandler(''';
        this.backgroundTheme = 'default';'
        ';
    }'
    })'
        console.log('[ParticlePhysicsEngine] パーティクル物理演算エンジンを初期化しました'); }
    }
    
    /**
     * パーティクルの物理更新
     */
    updateParticlePhysics(particle: Particle, deltaTime: number): void { try {
            if (!particle.active) return;
            
            // 重力適用
            if(particle.gravityAffected !== false) {
                
            }
                particle.vy += this.physicsSettings.gravity * deltaTime; }
            }
            
            // 風力適用
            if(this.physicsSettings.windForce.x || this.physicsSettings.windForce.y) {
                particle.vx += this.physicsSettings.windForce.x * deltaTime * 0.01;
            }
                particle.vy += this.physicsSettings.windForce.y * deltaTime * 0.01; }
            }
            
            // 磁場効果
            this.applyMagneticFields(particle, deltaTime);
            
            // 空気抵抗
            particle.vx *= this.physicsSettings.airResistance;
            particle.vy *= this.physicsSettings.airResistance;
            
            // 位置更新
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // 軌跡更新
            this.updateParticleTrail(particle);
            
            // 回転更新
            if (particle.rotation !== undefined) { particle.rotation += (particle.rotationSpeed || 0) * deltaTime; }
            }
            
            // スケール更新（パルセーション効果）
            if(particle.pulsation) {
                const time = Date.now() * 0.001;
            }
                particle.currentScale = (particle.baseScale || 1) * (1 + Math.sin(time * particle.pulsation.speed) * particle.pulsation.amplitude);' }'
            } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.updateParticlePhysics') }
            });
        }
    }
    
    /**
     * 磁場効果を適用
     */
    applyMagneticFields(particle: Particle, deltaTime: number): void { try {
            this.physicsSettings.magneticFields.forEach(field => { 
                const dx = field.x - particle.x;)
                const dy = field.y - particle.y;)
                const distanceSquared = dx * dx + dy * dy;
                );
                if(distanceSquared < field.radiusSquared) {
                    const force = field.strength / Math.max(distanceSquared, 100);
                }
                    particle.vx += dx * force * deltaTime; }
                    particle.vy += dy * force * deltaTime; }
                }'
            });''
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.applyMagneticFields') }
            });
        }
    }
    
    /**
     * パーティクルの軌跡を更新
     */
    updateParticleTrail(particle: Particle): void { try {
            if(particle.hasTrail) {
                if (!particle.trail) {
            }
                    particle.trail = []; }
                }
                
                particle.trail.push({ x: particle.x, y: particle.y ),
                
                // 軌跡の長さを制限
                const maxTrailLength = particle.trailLength || 10;
                if(particle.trail.length > maxTrailLength) {
                    
                }
                    particle.trail.shift(); }
                }''
            } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.updateParticleTrail') }
            });
        }
    }
    
    /**
     * 衝突検出と処理
     */
    handleCollisions(particles: Particle[], boundaries?: Boundaries): void { try {
            if (!this.physicsSettings.collisionDetection) return;
            
            particles.forEach(particle => { )
                // 境界との衝突);
                if (boundaries) { }
                    this.handleBoundaryCollision(particle, boundaries); }
                }
                
                // パーティクル間の衝突
                particles.forEach(otherParticle => {  );
                    if (particle !== otherParticle && particle.active && otherParticle.active) { }
                        this.handleParticleCollision(particle, otherParticle); }
                    }
                });
            });''
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.handleCollisions') }
            });
        }
    }
    
    /**
     * 境界との衝突処理
     */
    handleBoundaryCollision(particle: Particle, boundaries: Boundaries): void { try { }
            const { left, right, top, bottom } = boundaries;
            const radius = particle.size || 2;
            
            // 左右の境界
            if(particle.x - radius < left) {
                particle.x = left + radius;
            }
                particle.vx *= -this.physicsSettings.bounce; }
            } else if (particle.x + radius > right) { particle.x = right - radius;
                particle.vx *= -this.physicsSettings.bounce; }
            }
            
            // 上下の境界
            if(particle.y - radius < top) {
                particle.y = top + radius;
            }
                particle.vy *= -this.physicsSettings.bounce; }
            } else if (particle.y + radius > bottom) { particle.y = bottom - radius;
                particle.vy *= -this.physicsSettings.bounce;
                
                // 地面での摩擦
                particle.vx *= this.physicsSettings.friction;' }'
            } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.handleBoundaryCollision') }
            });
        }
    }
    
    /**
     * パーティクル間の衝突処理
     */
    handleParticleCollision(particle1: Particle, particle2: Particle): void { try {
            const dx = particle2.x - particle1.x;
            const dy = particle2.y - particle1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (particle1.size || 2) + (particle2.size || 2);
            
            if(distance < minDistance && distance > 0) {
            
                // 正規化ベクトル
                const nx = dx / distance;
                const ny = dy / distance;
                
                // 相対速度
                const dvx = particle2.vx - particle1.vx;
                const dvy = particle2.vy - particle1.vy;
                
                // 相対速度の法線成分
                const dvn = dvx * nx + dvy * ny;
                
                // 衝突していない場合（分離中）
                if (dvn > 0) return;
                
                // 質量を考慮した衝突応答
                const mass1 = particle1.mass || 1;
                const mass2 = particle2.mass || 1;
                const impulse = 2 * dvn / (mass1 + mass2);
                
                particle1.vx += impulse * mass2 * nx;
                particle1.vy += impulse * mass2 * ny;
                particle2.vx -= impulse * mass1 * nx;
                particle2.vy -= impulse * mass1 * ny;
                
                // パーティクルを分離
                const overlap = minDistance - distance;
                const separationX = overlap * 0.5 * nx;
                const separationY = overlap * 0.5 * ny;
                
                particle1.x -= separationX;
                particle1.y -= separationY;
                particle2.x += separationX;
            
            }
                particle2.y += separationY;' }'
            } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.handleParticleCollision') }
            });
        }
    }
    
    /**
     * 背景パーティクルを更新
     */
    updateBackgroundParticles(deltaTime: number, canvasWidth: number, canvasHeight: number): void { try {
            if (!this.backgroundEnabled) return;
            
            // 新しい背景パーティクルの生成
            if(this.backgroundParticles.length < canvasWidth * canvasHeight * this.backgroundDensity * 0.0001) {
                
            }
                this.createBackgroundParticle(canvasWidth, canvasHeight); }
            }
            
            // 既存の背景パーティクルを更新
            this.backgroundParticles = this.backgroundParticles.filter(particle => {  );
                this.updateParticlePhysics(particle, deltaTime);
                
                // ライフタイム減少
                particle.life -= deltaTime;
                particle.alpha = Math.max(0, particle.life / particle.maxLife);
                
                // 画面外に出たか寿命が尽きた場合は削除
                return particle.life > 0 && ;
                       particle.x > -50 && particle.x < canvasWidth + 50 && }
                       particle.y > -50 && particle.y < canvasHeight + 50; }
            });
            '';
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.updateBackgroundParticles') }
            });
        }
    }
    
    /**
     * 背景パーティクルを作成
     */
    createBackgroundParticle(canvasWidth: number, canvasHeight: number): void { try {
            const particle: BackgroundParticle = {
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 2 + 0.5,
                color: this.getBackgroundParticleColor(),
                alpha: Math.random() * 0.3 + 0.1,';
                life: Math.random() * 5000 + 2000,'';
                maxLife: Math.random(''';
                type: 'background',
                gravityAffected: false })
            })
            )';
            this.backgroundParticles.push(particle);''
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.createBackgroundParticle') }
            });
        }
    }
    
    /**
     * 背景パーティクルの色を取得'
     */''
    getBackgroundParticleColor(''';
            default: ['#ffffff', '#cccccc', '#aaaaaa'],'';
            stars: ['#ffffff', '#ffffcc', '#ccccff'],'';
            snow: ['#ffffff', '#f0f8ff', '#e6e6fa'],'';
            sakura: ['#ffb7c5', '#ffc0cb', '#fff0f5'],'';
            ocean: ['#87ceeb', '#add8e6', '#b0e0e6'];
        };
        
        const colors = themes[this.backgroundTheme] || themes.default;)
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 磁場を追加
     */
    addMagneticField(x: number, y: number, strength: number, radius: number): void { try {
            this.physicsSettings.magneticFields.push({)
                x, y, strength, radius,);
                radiusSquared: radius * radius),
             }'
            console.log(`[ParticlePhysicsEngine] 磁場を追加: (${x}, ${y)}), 強度: ${strength}`);''
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.addMagneticField') }
            });
        }
    }
    
    /**
     * 風力を設定
     */
    setWindForce(x: number, y: number): void { try { }
            this.physicsSettings.windForce = { x, y };'
            console.log(`[ParticlePhysicsEngine] 風力を設定: (${x}, ${y)`});''
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'ParticlePhysicsEngine.setWindForce'),' }'
            }');
        }
    }
    
    /**
     * 背景パーティクルを有効化'
     */''
    enableBackground(enabled: boolean, density: number = 0.1, theme: BackgroundTheme = 'default'): void { this.backgroundEnabled = enabled;
        this.backgroundDensity = density;
        this.backgroundTheme = theme;'
        '';
        if(!enabled') {
            
        }
            this.backgroundParticles = []; }
        }'
        '';
        console.log(`[ParticlePhysicsEngine] 背景パーティクル: ${enabled ? '有効' : '無効')`});
    }
    
    /**
     * 背景パーティクルを取得
     */
    getBackgroundParticles(): BackgroundParticle[] { return this.backgroundParticles; }
    }
    
    /**
     * スムーズトランジションを有効化'
     */''
    enableSmoothTransitions(enabled: boolean'): void { this.animationSettings.interpolation = enabled;'
        this.animationSettings.easingEnabled = enabled;' }'
        console.log(`[ParticlePhysicsEngine] スムーズトランジション: ${enabled ? '有効' : '無効')`});
    }
    
    /**
     * タイミングプロファイルを設定'
     */''
    setTimingProfiles(profiles: TimingProfiles'): void { this.timingProfiles = profiles;''
        console.log('[ParticlePhysicsEngine] タイミングプロファイルを設定しました:', profiles); }
    }
    
    /**
     * 物理設定を更新'
     */''
    updatePhysicsSettings(newSettings: Partial<PhysicsSettings>'): void {'
        this.physicsSettings = { ...this.physicsSettings, ...newSettings };''
        console.log('[ParticlePhysicsEngine] 物理設定を更新しました'');'
    }''
}