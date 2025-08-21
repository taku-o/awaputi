import { ParticleManager  } from './ParticleManager.js';
import { BubbleEffectRenderer  } from './renderers/BubbleEffectRenderer.js';
import { ComboEffectRenderer  } from './renderers/ComboEffectRenderer.js';
import { SpecialEffectRenderer  } from './renderers/SpecialEffectRenderer.js';
import { SeasonalEffectRenderer  } from './renderers/SeasonalEffectRenderer.js';
import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { getEffectQualityController  } from './EffectQualityController.js';
import { getEffectPerformanceMonitor  } from './EffectPerformanceMonitor.js';
';
// サブコンポーネントのインポート
import { ParticleRenderingEngine  } from './enhanced-particle-manager/ParticleRenderingEngine.js';
import { ParticleQualityManager  } from './enhanced-particle-manager/ParticleQualityManager.js';
import { ParticlePhysicsEngine  } from './enhanced-particle-manager/ParticlePhysicsEngine.js';

// Type definitions for Enhanced Particle Manager
interface Particle { x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    alpha: number,
    life: number,
    maxLife: number,
    type: string,
    active: boolean,
    gravityAffected: boolean,
    hasTrail: boolean,
    rotation: number,
    rotationSpeed: number,
    mass: number  }

interface ParticleOptions { size?: number,
    color?: string,
    alpha?: number,
    life?: number,
    type?: string,
    gravityAffected?: boolean,
    hasTrail?: boolean,
    rotation?: number,
    rotationSpeed?: number,
    mass?: number }

interface QualitySettings { particleMultiplier: number,
    sizeMultiplier: number,
    colorComplexity: string,
    physicsEnabled: boolean,
    batchRenderingEnabled: boolean,
    aggressiveCullingEnabled: boolean  }

interface OptimizationSettings { cullingMargin: number,
    maxParticles: number,
    performanceThreshold: number }

interface PerformanceMetrics { totalParticles: number,
    backgroundParticles: number,
    currentQuality: string,
    complexityLevel: string }

interface CurrentSettings { qualityLevel: string,
    qualitySettings: QualitySettings,
    optimizationSettings: OptimizationSettings,
    backgroundEnabled: boolean,
    backgroundDensity: number,
    backgroundTheme: string }

type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// External dependencies interfaces
interface ErrorHandler { handleError(error: Error, context?: any): void }

interface EffectQualityController { getCurrentQualityLevel(): string }

interface EffectPerformanceMonitor { getCurrentFPS?(): number }

// Renderer interfaces
interface EffectRenderer { render?(context: CanvasRenderingContext2D, deltaTime: number): void 
// Sub-component interfaces
interface ParticleRenderingEngineInterface { renderParticle(context: CanvasRenderingContext2D, particle: Particle): void,
    renderTrailParticle(context: CanvasRenderingContext2D, particle: Particle): void,
    enableBatchRendering(): void }

interface ParticleQualityManagerInterface { setQualityLevel(level: QualityLevel): void,
    getCurrentQualityLevel(): QualityLevel,
    adjustParticleCount(baseCount: number): number,
    adjustParticleSize(baseSize: number): number,
    enableBatchRendering(): void,
    enableAggressiveCulling(): void,
    disableAggressiveCulling(): void,
    setColorPalettes(paletteName: string): void,
    setPhysicsEnhancements(enabled: boolean): void,
    getCurrentQualitySettings(): QualitySettings,
    getOptimizationSettings(): OptimizationSettings,
    getComplexityLevel(): string,
    adjustQualityBasedOnPerformance(fps: number): void }

interface ParticlePhysicsEngineInterface { enableSmoothTransitions(enabled: boolean): void,
    setTimingProfiles(profiles: any): void,
    enableBackground(enabled: boolean, density?: number, theme?: string): void,
    addMagneticField(x: number, y: number, strength: number, radius: number): void,
    setWindForce(x: number, y: number): void,
    updateBackgroundParticles(deltaTime: number, width: number, height: number): void,
    getBackgroundParticles(): Particle[],
    backgroundEnabled: boolean,
    backgroundDensity: number,
    backgroundTheme: string,
    backgroundParticles: Particle[]
     }

/**
 * 強化されたパーティクル管理クラス (Main, Controller Pattern)
 * 既存のParticleManagerを拡張し、より多様で魅力的な視覚効果を実現
 * 
 * Main Controller Pattern適用：
 * - ParticleRenderingEngine: レンダリング処理とパーティクル描画
 * - ParticleQualityManager: 品質制御と最適化設定管理
 * -, ParticlePhysicsEngine: 物理演算とアニメーション処理
 * - 既存Renderer群: 泡・コンボ・特殊・季節限定効果
 */
export class EnhancedParticleManager extends ParticleManager { // サブコンポーネント
    private renderingEngine: ParticleRenderingEngineInterface,
    private qualityManager: ParticleQualityManagerInterface,
    private physicsEngine: ParticlePhysicsEngineInterface,
    // 外部依存システム
    private qualityController: EffectQualityController,
    private performanceMonitor: EffectPerformanceMonitor,
    // パフォーマンス監視用
    private lastPerformanceCheck: number | null = null,
    // 既存エフェクトレンダラー
    private bubbleRenderer: EffectRenderer,
    private comboRenderer: EffectRenderer,
    private specialRenderer: EffectRenderer,
    private, seasonalRenderer: EffectRenderer,
    // Particles array (from base class, but typed),
    protected particles: Particle[] = [],

    constructor() {

        super(),
        
        // サブコンポーネントの初期化
        this.renderingEngine = new ParticleRenderingEngine(null as any, this) as ParticleRenderingEngineInterface,
        this.qualityManager = new ParticleQualityManager() as any as ParticleQualityManagerInterface,
        this.physicsEngine = new ParticlePhysicsEngine() as any as ParticlePhysicsEngineInterface,
        
        // 外部依存システム
        this.qualityController = getEffectQualityController(),
        this.performanceMonitor = getEffectPerformanceMonitor(),
        
        // 既存エフェクトレンダラーの初期化
        this.bubbleRenderer = new BubbleEffectRenderer(this),
        this.comboRenderer = new ComboEffectRenderer(this),
        this.specialRenderer = new SpecialEffectRenderer(this),
        this.seasonalRenderer = new SeasonalEffectRenderer(this),

        ' }

    }

        console.log('[EnhancedParticleManager] Main, Controller Pattern初期化完了'); }'
    }
    
    // ========================================
    // 品質管理API - Quality Managerにデリゲート
    // ========================================
    
    setQualityLevel(level: QualityLevel): void { this.qualityManager.setQualityLevel(level) }
    
    getCurrentQualityLevel(): QualityLevel { return this.qualityManager.getCurrentQualityLevel() }
    
    adjustParticleCount(baseCount: number): number { return this.qualityManager.adjustParticleCount(baseCount) }
    
    adjustParticleSize(baseSize: number): number { return this.qualityManager.adjustParticleSize(baseSize) }
    ';

    enableBatchRendering(): void { this.qualityManager.enableBatchRendering(),
        this.renderingEngine.enableBatchRendering()',
        console.log('[EnhancedParticleManager] バッチレンダリングを有効化しました') }', ';

    enableAggressiveCulling(): void { ''
        this.qualityManager.enableAggressiveCulling()',
        console.log('[EnhancedParticleManager] アグレッシブカリングを有効化しました') }'
    
    setAggressiveCulling(enabled: boolean): void { if (enabled) {
            this.qualityManager.enableAggressiveCulling() }

        } else { }'

            this.qualityManager.disableAggressiveCulling() }

        console.log(`[EnhancedParticleManager] アグレッシブカリングを${enabled ? '有効化' : '無効化}しました`});
    }
    
    setColorPalettes(paletteName: string): void { this.qualityManager.setColorPalettes(paletteName) }
    
    setPhysicsEnhancements(enabled: boolean): void { this.qualityManager.setPhysicsEnhancements(enabled) }
    
    getActiveParticleCount(): number { // ParticleManagerの基本メソッドを使用
        return this.getParticleCount() }
    ';

    enableSmoothTransitions(enabled: boolean): void { ''
        this.physicsEngine.enableSmoothTransitions(enabled),' }'

        console.log(`[EnhancedParticleManager] スムーズトランジションを${enabled ? '有効化' : '無効化}しました`}';
    }
    ';

    setTimingProfiles(profiles: any): void { ''
        this.physicsEngine.setTimingProfiles(profiles),
        console.log('[EnhancedParticleManager] タイミングプロファイルを設定しました') }
    
    // ========================================
    // 物理演算API - Physics Engineにデリゲート
    // ========================================

    enableBackground(enabled: boolean, density: number = 0.1, theme: string = 'default): void { this.physicsEngine.enableBackground(enabled, density, theme) }'
    
    setBackgroundDensity(density: number): void { this.physicsEngine.enableBackground(true, density, this.physicsEngine.backgroundTheme) }
    
    setBackgroundTheme(theme: string): void { this.physicsEngine.enableBackground(true, this.physicsEngine.backgroundDensity, theme) }
    
    addMagneticField(x: number, y: number, strength: number, radius: number): void { this.physicsEngine.addMagneticField(x, y, strength, radius) }
    
    setWindForce(x: number, y: number): void { this.physicsEngine.setWindForce(x, y) }
    
    // ========================================
    // レンダリングAPI - Rendering Engineにデリゲート
    // ========================================
    
    renderParticle(context: CanvasRenderingContext2D, particle: Particle): void { this.renderingEngine.renderParticle(context, particle) }
    
    renderTrailParticle(context: CanvasRenderingContext2D, particle: Particle): void { this.renderingEngine.renderTrailParticle(context, particle) }
    
    // ========================================
    // 統合レンダリング - Base class + サブコンポーネント
    // ========================================
    
    render(context: CanvasRenderingContext2D, deltaTime: number): void { try {
            // 基底クラスのレンダリング
            super.render(context, deltaTime),
            
            // 背景パーティクルの更新と描画
            this._renderBackgroundParticles(context, deltaTime),
            
            // パフォーマンス監視
            this._monitorPerformance() } catch (error) { getErrorHandler()',
                context: 'EnhancedParticleManager.render' });
        }
    }
    
    /**
     * 背景パーティクルのレンダリング
     */
    private _renderBackgroundParticles(context: CanvasRenderingContext2D, deltaTime: number): void { try {
            if (!this.physicsEngine.backgroundEnabled) return,
            
            // 背景パーティクルの更新
            this.physicsEngine.updateBackgroundParticles(deltaTime, context.canvas.width, context.canvas.height),
            
            // 背景パーティクルの描画
            const backgroundParticles = this.physicsEngine.getBackgroundParticles(),
            backgroundParticles.forEach(particle => { ) }
                this.renderingEngine.renderParticle(context, particle); }
            });
            ';

        } catch (error) { getErrorHandler()',
                context: 'EnhancedParticleManager._renderBackgroundParticles' }';
        }
    }
    
    /**
     * パフォーマンス監視'
     */''
    private _monitorPerformance()';
            if(this.performanceMonitor && typeof, this.performanceMonitor.getCurrentFPS === 'function' {', ' }

                currentFPS = this.performanceMonitor.getCurrentFPS() }

            } else if (typeof, window !== 'undefined' && window.performance && window.performance.now) { // フォールバック: 簡易FPS計算
                const now = window.performance.now(),
                if(this.lastPerformanceCheck) {
                    const deltaTime = now - this.lastPerformanceCheck }
                    currentFPS = Math.min(60, 1000 / deltaTime); }
                }
                this.lastPerformanceCheck = now;
            }
            
            this.qualityManager.adjustQualityBasedOnPerformance(currentFPS);
            ';

        } catch (error) { getErrorHandler()',
                context: 'EnhancedParticleManager._monitorPerformance' });
        }
    }
    
    // ========================================
    // パーティクル生成API（既存メソッドの拡張）
    // ========================================
    
    createParticle(x: number, y: number, vx: number, vy: number, options: ParticleOptions = { ): Particle | null {
        try {
            // 品質に基づいたパーティクル調整
            const adjustedSize = this.qualityManager.adjustParticleSize(options.size || 2) }
            const adjustedOptions = { ...options, size: adjustedSize  }
            // 基底クラスのcreateParticleメソッドを呼び出し
            const particle = super.createParticle ? undefined : undefined
                super.createParticle(x, y, vx, vy, adjustedOptions) as Particle :;
                this._createEnhancedParticle(x, y, vx, vy, adjustedOptions);
                
            return particle;
            ';

        } catch (error) { getErrorHandler()',
                context: 'EnhancedParticleManager.createParticle' }';
            return null;
    
    /**
     * 拡張パーティクル生成（フォールバック）'
     */''
    private _createEnhancedParticle(x: number, y: number, vx: number, vy: number, options: ParticleOptions): Particle { const particle: Particle = {
            x, y, vx, vy,
            size: options.size || 2,
            color: options.color || '#ffffff',
            alpha: options.alpha || 1.0,
    life: options.life || 1000,
            maxLife: options.life || 1000,
            type: options.type || 'basic',
            active: true,
            gravityAffected: options.gravityAffected !== false,
            hasTrail: options.hasTrail || false,
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || 0,
    mass: options.mass || 1  };
        // パーティクル配列に追加（基底クラスのparticles配列があれば使用）
        this.particles.push(particle);
        
        return particle;
    }
    
    // ========================================
    // Issue #106対応: テスト互換性メソッド
    // ========================================
    
    clearAllParticles(): void { // 基底クラスのクリア
        if(super.clearAllParticles) {

            super.clearAllParticles() }

        console.log('[EnhancedParticleManager] 全パーティクルをクリアしました'); }'
    }
    
    // ========================================
    // Enhanced API - 追加機能
    // ========================================
    
    /**
     * パーティクル倍率の設定
     */
    setParticleMultiplier?(multiplier: number): void { // 実装詳細は品質管理システムに依存 
        console.log(`[EnhancedParticleManager] パーティクル倍率を${multiplier}に設定`});
    }
    
    /**
     * レンダリング頻度の設定
     */
    setRenderFrequency?(frequency: number): void {
        console.log(`[EnhancedParticleManager] レンダリング頻度を${frequency}に設定`});
    }
    
    /**
     * カリングマージンの設定
     */
    setCullingMargin?(margin: number): void {
        console.log(`[EnhancedParticleManager] カリングマージンを${margin}に設定`});
    }
    
    /**
     * 強制クリーンアップ
     */
    forceCleanup?(): number { const cleanedCount = this.particles.length,
        this.clearAllParticles() }
        console.log(`[EnhancedParticleManager] ${cleanedCount}個のパーティクルをクリーンアップ`});
        return cleanedCount;
    }
    
    // ========================================
    // ユーティリティAPI
    // ========================================
    
    getCurrentSettings(): CurrentSettings { return { qualityLevel: this.qualityManager.getCurrentQualityLevel(
            qualitySettings: this.qualityManager.getCurrentQualitySettings(),
            optimizationSettings: this.qualityManager.getOptimizationSettings(),
            backgroundEnabled: this.physicsEngine.backgroundEnabled,
    backgroundDensity: this.physicsEngine.backgroundDensity };
            backgroundTheme: this.physicsEngine.backgroundTheme 
    }
    
    getPerformanceMetrics(): PerformanceMetrics { const backgroundCount = this.physicsEngine.backgroundParticles.length,
        const totalParticles = this.particles.length + backgroundCount,
        
        return { totalParticles,
            backgroundParticles: backgroundCount,
    currentQuality: this.qualityManager.getCurrentQualityLevel(),' };

            complexityLevel: this.qualityManager.getComplexityLevel() }'