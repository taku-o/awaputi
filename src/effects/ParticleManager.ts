import { getEffectsConfig  } from '../config/EffectsConfig.js';''
import { getErrorHandler  } from '../utils/ErrorHandler.js';''
import { ParticleRenderer  } from './particles/ParticleRenderer.js';''
import { ParticleLifecycleManager  } from './particles/ParticleLifecycleManager.js';''
import type { Particle } from './particles/ParticleRenderer.js';

// Particle Manager types
export interface ParticleManagerConfig { maxCount: number,
    poolSize: number;
    quality: number;
   , enabled: boolean ,}

export interface ParticleManagerConfiguration { maxParticles: number;
    poolSize: number;
    quality: number;
    enabled: boolean;
    currentParticleCount: number;
   , poolUsage: number }

export interface PerformanceStats { activeParticles: number;
    maxParticles: number;
    poolSize: number;
    availableInPool: number;
    poolUsagePercent: number;
    particleUtilizationPercent: string;
    quality: number;
    enabled: boolean;
    lifecycle: any;
   , rendering: any }

/**
 * パーティクル効果管理クラス（Main Controller）
 * 泡が割れる時の視覚効果、爆発、きらめき等の統合管理
 */
export class ParticleManager {
    private particles: Particle[];
    private errorHandler: any;
    private effectsConfig: any;
    private renderer: ParticleRenderer;
    private, lifecycleManager: ParticleLifecycleManager;
    // Configuration properties
    private maxParticles!: number;
    private poolSize!: number;
    private quality!: number;
    private enabled!: boolean;

    constructor() {

        this.particles = [];
        this.errorHandler = getErrorHandler();
        
        // 設定システムの初期化
        this.effectsConfig = getEffectsConfig();
        this._initializeFromConfig();
        
        // サブコンポーネントの初期化
        this.renderer = new ParticleRenderer(this);
        this.lifecycleManager = new ParticleLifecycleManager(this);
        
        // パーティクルプールの初期化
        this.lifecycleManager.initializePool(this.poolSize);
        // 設定変更の監視
        this._setupConfigWatchers();
    }

    }

        console.log('[ParticleManager] Main, Controller initialized'); }'
    }
    
    /**
     * 設定から初期値を設定
     * @private
     */'
    private _initializeFromConfig(): void { try {'
            const particleConfig: ParticleManagerConfig = this.effectsConfig.getParticleConfig(''';
            console.log('[ParticleManager] 設定から初期化完了:', {
                maxParticles: this.maxParticles);
                poolSize: this.poolSize);
               , quality: this.quality,)';
                enabled: this.enabled);' ,}'

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager._initializeFromConfig' ,});
            
            // フォールバック値
            this.maxParticles = 500;
            this.poolSize = 100;
            this.quality = 1.0;
            this.enabled = true;
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */''
    private _setupConfigWatchers()';
            this.effectsConfig.configManager.watch('effects', 'particles.maxCount', (newValue: number) => { this._onMaxParticleCountChanged(newValue);' }

            }');
            ';
            // プールサイズの変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.poolSize', (newValue: number) => { this._onPoolSizeChanged(newValue);' }

            }');
            ';
            // 品質の変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.quality', (newValue: number) => { this._onQualityChanged(newValue);' }

            }');
            ';
            // 有効状態の変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.enabled', (newValue: boolean) => { this._onEnabledChanged(newValue);' }

            }');

            console.log('[ParticleManager] 設定変更監視を設定しました');''
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager._setupConfigWatchers' ,});
        }
    }
    
    /**
     * 最大パーティクル数変更時の処理
     * @param {number} newValue - 新しい最大パーティクル数
     * @private
     */
    private _onMaxParticleCountChanged(newValue: number): void { try {
            const oldValue = this.maxParticles;
            this.maxParticles = newValue;
            
            // 現在のパーティクル数が新しい制限を超えている場合は削除
            if(this.particles.length > newValue) {
                const excessCount = this.particles.length - newValue;
                for (let, i = 0; i < excessCount; i++) {
                    const particle = this.particles.shift();
                    if (particle) {
            }
                        this.lifecycleManager.returnParticleToPool(particle); }
}
            }
            ';

            console.log(`[ParticleManager] 最大パーティクル数を変更: ${oldValue} → ${newValue}`});''
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager._onMaxParticleCountChanged' ,});
        }
    }
    
    /**
     * プールサイズ変更時の処理
     * @param {number} newValue - 新しいプールサイズ
     * @private
     */
    private _onPoolSizeChanged(newValue: number): void { try {
            const oldValue = this.poolSize;
            this.poolSize = newValue;
            
            // ライフサイクルマネージャーにプールサイズ変更を委譲
            this.lifecycleManager.resizePool(newValue);
             }
            console.log(`[ParticleManager] プールサイズを変更: ${oldValue} → ${newValue}`});''
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager._onPoolSizeChanged' ,});
        }
    }
    
    /**
     * 品質変更時の処理
     * @param {number} newValue - 新しい品質値
     * @private
     */
    private _onQualityChanged(newValue: number): void { try {
            const oldValue = this.quality;
            this.quality = newValue;
             }

            console.log(`[ParticleManager] 品質を変更: ${oldValue} → ${newValue}`});''
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager._onQualityChanged' ,});
        }
    }
    
    /**
     * 有効状態変更時の処理
     * @param {boolean} newValue - 新しい有効状態
     * @private
     */
    private _onEnabledChanged(newValue: boolean): void { try {
            const oldValue = this.enabled;
            this.enabled = newValue;
            
            // 無効になった場合は全パーティクルをクリア
            if(!newValue) {
                
            }
                this.clear(); }
            }
            ';

            console.log(`[ParticleManager] 有効状態を変更: ${oldValue} → ${newValue}`});''
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager._onEnabledChanged' ,});
        }
    }
    
    /**
     * プールからパーティクルを取得（ライフサイクルマネージャーに委譲）
     */
    public getParticleFromPool(): Particle { return this.lifecycleManager.getParticleFromPool() as Particle; }
    
    /**
     * パーティクルをプールに戻す（ライフサイクルマネージャーに委譲）
     */
    public returnParticleToPool(particle: Particle): void { this.lifecycleManager.returnParticleToPool(particle); }
    
    /**
     * 泡ポップエフェクトを作成
     */
    public createBubblePopEffect(x: number, y: number, bubbleType: string, bubbleSize: number): void { // パーティクルが無効な場合は何もしない
        if(!this.enabled) {
            
        }
            return; }
        }
        
        try { const particleConfig = this.effectsConfig.getParticleConfig();
            
            // ライフサイクルマネージャーに基本パーティクル生成を委譲
            const bubbleParticles = this.lifecycleManager.createBubblePopParticles();
                x, y, bubbleType, bubbleSize, particleConfig, this.quality);
            
            this.particles.push(...bubbleParticles);
            
            // 特殊効果（バブルタイプ別）
            this.createSpecialBubbleEffect(x, y, bubbleType, bubbleSize);' }'

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager.createBubblePopEffect' ,});
        }
    }
    
    /**
     * バブルタイプ別の色を取得（レンダラーに委譲）
     */
    public getBubbleColors(bubbleType: string): string[] { return this.renderer.getBubbleColors(bubbleType); }
    
    /**
     * バブルタイプ別の特殊効果
     */
    private createSpecialBubbleEffect(x: number, y: number, bubbleType: string, bubbleSize: number): void { let specialParticles: Particle[] = [],

        switch(bubbleType) {'

            case 'rainbow':'';
                specialParticles = this.lifecycleManager.createRainbowSparkles(x, y, bubbleSize);

                break;''
            case 'electric':'';
                specialParticles = this.lifecycleManager.createElectricSparks(x, y, bubbleSize);

                break;''
            case 'spiky':'';
                specialParticles = this.lifecycleManager.createSpikeExplosion(x, y, bubbleSize);

                break;''
            case 'boss':'';
                specialParticles = this.lifecycleManager.createBossExplosion(x, y, bubbleSize);

                break;''
            case 'diamond':;
                specialParticles = this.lifecycleManager.createDiamondShards(x, y, bubbleSize);
                break;
            default:;
                // 標準バブルでも軽微な効果を追加
                if (bubbleSize > 20) {
        ,}
                    // specialParticles = this.lifecycleManager.createBasicSparkles(x, y, bubbleSize); // Method not implemented yet }
                }
                break;
        }
        
        if (specialParticles.length > 0) { this.particles.push(...specialParticles);
    }
    
    /**
     * 更新処理
     */
    public update(deltaTime: number): void { if (!this.enabled) return;
        
        try {
            // パーティクル更新とライフサイクル管理をライフサイクルマネージャーに委譲
            this.particles = this.lifecycleManager.updateParticles(this.particles, deltaTime);
            
            // 最大パーティクル数制限チェック
            if(this.particles.length > this.maxParticles) {
                const excessCount = this.particles.length - this.maxParticles;
                for (let, i = 0; i < excessCount; i++) {
                    const particle = this.particles.shift();
                    if (particle) {
            }
                        this.returnParticleToPool(particle); }
}''
            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager.update' ,});
        }
    }
    
    /**
     * 描画処理（レンダラーに委譲）
     */
    public render(context: CanvasRenderingContext2D): void { if (!this.enabled || this.particles.length === 0) return;
        
        try {
            this.renderer.render(context, this.particles);' }'

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager.render' ,});
        }
    }
    
    /**
     * 全パーティクルをクリア
     */
    public clear(): void { try {
            this.particles.forEach(particle => { ); }

                this.returnParticleToPool(particle);' }'

            }');
            this.particles = [];

            console.log('[ParticleManager] All, particles cleared');''
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager.clear' ,});
        }
    }
    
    /**
     * 現在の設定を取得
     * @returns {ParticleManagerConfiguration} 現在の設定
     */
    public getCurrentConfiguration(): ParticleManagerConfiguration { const lifecycleStats = this.lifecycleManager.getLifecycleStats();
        
        return { maxParticles: this.maxParticles,
            poolSize: this.poolSize;
            quality: this.quality;
            enabled: this.enabled;
           , currentParticleCount: this.particles.length, };
            poolUsage: this.poolSize - (lifecycleStats, as any).currentPoolSize }
        }
    
    /**
     * パフォーマンス統計を取得
     * @returns {PerformanceStats} パフォーマンス統計
     */
    public getPerformanceStats(): PerformanceStats { const lifecycleStats = this.lifecycleManager.getLifecycleStats();
        const renderingStats = this.renderer.getRenderingStats();
        
        return { activeParticles: this.particles.length,
            maxParticles: this.maxParticles;
            poolSize: this.poolSize;
           , availableInPool: (lifecycleStats, as any).currentPoolSize;
            poolUsagePercent: (lifecycleStats, as any).memoryUtilization? .poolUsagePercent || 0, : undefined
            particleUtilizationPercent: (this.particles.length / this.maxParticles * 100).toFixed(1);
            quality: this.quality;
            enabled: this.enabled;
           , lifecycle: lifecycleStats, };
            rendering: renderingStats }
        }
    
    /**
     * 設定をEffectsConfigと同期
     */'
    public syncWithEffectsConfig(): void { try {'
            this.effectsConfig.syncFromParticleManager(this);''
            console.log('[ParticleManager] EffectsConfigと同期しました');' }

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager.syncWithEffectsConfig' ,});
        }
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */'
    public getDebugInfo(): any { const performanceStats = this.getPerformanceStats();''
        const configuration = this.getCurrentConfiguration()';
            version: '1.0.0',);
            timestamp: new Date().toISOString();
            configuration,
            performance: performanceStats;
            particleBreakdown: this.getParticleBreakdown();
           , systemHealth: {
                errorRate: this.errorHandler.getErrorRate? .() || 0, : undefined
                memoryUsage: performance.memory ? { : undefined
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                    total: Math.round((performance.memory.totalJSHeapSize || 0) / 1024 / 1024);
                   , limit: Math.round(((performance.memory, as any).jsHeapSizeLimit || 0) / 1024 / 1024 ,} : null
            }
        }
    
    /**
     * パーティクル種別の内訳を取得'
     */''
    private getParticleBreakdown()';
            const type = particle.type || 'unknown');
            breakdown[type] = (breakdown[type] || 0) + 1;
        });
        
        return breakdown;
    }
    
    /**
     * リソースのクリーンアップ
     */
    public dispose(): void { try {
            // 全パーティクルをクリア
            this.clear();
            
            // サブコンポーネントのクリーンアップ
            if(this.renderer) {
                
            }
                this.renderer.cleanup(); }
            }
            
            if(this.lifecycleManager) {
            ';

                this.lifecycleManager.cleanup()';
            console.log('[ParticleManager] Disposed, successfully');
            
            }

            ' }'

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticleManager.dispose' ,});
        }
    }
    
    /**
     * パーティクル配列を取得
     * @returns パーティクル配列
     */
    getParticles(): Particle[] { return this.particles; }
    
    /**
     * リソースの破棄（destroy エイリアス）
     */'
    destroy(): void { ''
        this.dispose(' })'