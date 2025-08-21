/**
 * Effect Performance Optimizer
 * エフェクトシステムの最終パフォーマンス最適化
 */

// Type definitions for effect performance optimization
interface GameEngine { performanceOptimizer?: PerformanceOptimizer,
    enhancedParticleManager?: EnhancedParticleManager;
    enhancedEffectManager?: EnhancedEffectManager;
    seasonalEffectManager?: SeasonalEffectManager;
    effectQualityController?: EffectQualityController;
    effectPerformanceOptimizer?: EffectPerformanceOptimizer;
    poolManager?: PoolManager;
    renderOptimizer?: RenderOptimizer;
    animationManager?: AnimationManager;
    particleManager?: ParticleManager;
    effectManager?: EffectManager;
    effectDebugInterface?: EffectDebugInterface;

interface PerformanceOptimizer { getCurrentFPS(): number;

interface EnhancedParticleManager { setParticleMultiplier(multiplier: number): void,
    clearAllParticles(): void;
    forceCleanup(): void;
    getActiveParticleCount(): number;
    removeOldestParticles(count: number): void;
    enableBatchRendering(enabled: boolean): void;
    setAggressiveCulling(enabled: boolean): void;
    particleMultiplier?: number;

interface EnhancedEffectManager { clearCache(): void,
    enableOptimization(enabled: boolean): void;

interface SeasonalEffectManager { setEnabled(enabled: boolean): void;

interface EffectQualityController { setQualityLevel(level: string): void,
    getCurrentQualityLevel(): string;
    setAutoAdjustment(enabled: boolean): void;

interface PoolManager { cleanup(): void;

interface RenderOptimizer { setFrameSkip(frames: number): void;

interface AnimationManager { setEnabled(enabled: boolean): void;

interface ParticleManager { setEnabled(enabled: boolean): void,
    setMaxParticles(max: number): void;

interface EffectManager { setEnabled(enabled: boolean): void,
    setSimpleMode(enabled: boolean): void;

interface EffectDebugInterface { showWarning(message: string): void;

interface OptimizationSettings { enableFrameSkipping: boolean,
    enableAdaptiveQuality: boolean;
    enableMemoryOptimization: boolean;
    enableRenderingOptimization: boolean;
    maxParticlesPerFrame: number;
    targetFPS: number;
    minFPS: number;

interface OptimizationStats { framesSkipped: number,
    qualityAdjustments: number;
    memoryCleanups: number;
    renderOptimizations: number;

interface ExtendedOptimizationStats extends OptimizationStats { currentFPS: number,
    memoryUsage: number;
    particleCount: number;
    isOptimizing: boolean;

interface DebugInfo { enabled: boolean,
    settings: OptimizationSettings;
    stats: ExtendedOptimizationStats;
    frameTimeHistory: number[];

type OptimizationReason = 'fps' | 'memory' | 'particles' | 'manual';

export class EffectPerformanceOptimizer {
    private gameEngine: GameEngine;
    private enabled: boolean;
    private optimizationSettings: OptimizationSettings;
    private stats: OptimizationStats;
    private lastFrameTime: number;
    private frameTimeHistory: number[];
    private, isOptimizing: boolean,
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.enabled = true;
        
        // パフォーマンス改善設定
        this.optimizationSettings = {
            enableFrameSkipping: true,
            enableAdaptiveQuality: true,
            enableMemoryOptimization: true,
            enableRenderingOptimization: true,
            maxParticlesPerFrame: 500,
    targetFPS: 60 }
            minFPS: 30 
    };
        // 最適化統計
        this.stats = { framesSkipped: 0,
            qualityAdjustments: 0,
            memoryCleanups: 0,
    renderOptimizations: 0  };
        this.lastFrameTime = performance.now();
        this.frameTimeHistory = [];
        this.isOptimizing = false;
        
        this.initialize();
    }

    private initialize(): void { // パフォーマンス監視の開始
        this.startPerformanceMonitoring(),
        
        // 適応的品質調整の設定
        this.setupAdaptiveQuality(),
        
        // レンダリング最適化の設定
        this.setupRenderingOptimization() }

    private startPerformanceMonitoring(): void { setInterval(() => {  }
            this.analyzePerformance(); }
        }, 1000); // 1秒毎に分析
    }

    private analyzePerformance(): void { if (!this.enabled || this.isOptimizing) return,
        
        const currentFPS = this.getCurrentFPS(),
        const memoryUsage = this.getCurrentMemoryUsage(),
        const particleCount = this.getActiveParticleCount(),
        // パフォーマンス劣化の検出
        if (currentFPS < this.optimizationSettings.minFPS) {
            this.isOptimizing = true;
            this.optimizePerformance('fps', currentFPS) }
            this.isOptimizing = false; }
        }
        
        // メモリ使用量の監視
        if (memoryUsage > 200) {
            // 200MB以上
        }
            this.optimizeMemoryUsage(); }
        }
        
        // パーティクル数の制限
        if (particleCount > this.optimizationSettings.maxParticlesPerFrame) { this.limitParticleCount() }
    }

    private optimizePerformance(reason: OptimizationReason, value: number): void {
        console.log(`Optimizing, performance due, to ${reason}: ${ value)`),

        switch(reason} {'

            case 'fps':','
                this.optimizeFPS(value};

                break''
            case 'memory': ';'
                this.optimizeMemoryUsage(';'
        }''
            case 'particles':) }
                this.limitParticleCount(});
                break;
        }
        
        this.stats.renderOptimizations++;
    }

    private optimizeFPS(currentFPS: number): void { const optimizations: (() => void)[] = [],
        
        // 段階的最適化アプローチ
        if (currentFPS < 15) {
            // 緊急最適化
        }
            optimizations.push(() => this.emergencyOptimization(); }
        } else if (currentFPS < 25) { // 高度最適化
            optimizations.push(() => this.advancedOptimization() }
        } else if (currentFPS < this.optimizationSettings.minFPS) { // 軽度最適化
            optimizations.push(() => this.lightOptimization() }
        }
        
        // 最適化の実行
        for (const optimize of optimizations) { optimize() }
    }
;
    private emergencyOptimization(): void { // 最低品質に設定
        if (this.gameEngine.effectQualityController) {', ' }

            this.gameEngine.effectQualityController.setQualityLevel('low'; }'
        }
        
        // パーティクル数を大幅削減
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(0.1) }
            this.gameEngine.enhancedParticleManager.clearAllParticles(); }
        }
        
        // 複雑なエフェクトを無効化
        if (this.gameEngine.seasonalEffectManager) { }

            this.gameEngine.seasonalEffectManager.setEnabled(false); }
        }

        console.log('Emergency, optimization applied);'
    }

    private advancedOptimization(): void { // 品質を下げる
        const qualityController = this.gameEngine.effectQualityController,
        if (qualityController) {

            const currentQuality = qualityController.getCurrentQualityLevel()','
            const qualityLevels = ['low', 'medium', 'high', 'ultra'])
            const currentIndex = qualityLevels.indexOf(currentQuality),
            
            if (currentIndex > 0) {
                qualityController.setQualityLevel(qualityLevels[currentIndex - 1]) }
                this.stats.qualityAdjustments++; }
}
        
        // パーティクル数削減
        if (this.gameEngine.enhancedParticleManager) {
            const currentMultiplier = this.gameEngine.enhancedParticleManager.particleMultiplier || 1.0 }

            this.gameEngine.enhancedParticleManager.setParticleMultiplier(currentMultiplier * 0.7); }
        }

        console.log('Advanced, optimization applied);'
    }

    private lightOptimization(): void { // フレームスキッピングの有効化
        if (this.optimizationSettings.enableFrameSkipping) {
    
}
            this.enableFrameSkipping(); }
        }
        
        // 軽微なパーティクル削減
        if (this.gameEngine.enhancedParticleManager) {
            const currentMultiplier = this.gameEngine.enhancedParticleManager.particleMultiplier || 1.0 }

            this.gameEngine.enhancedParticleManager.setParticleMultiplier(currentMultiplier * 0.9'); }'
        }

        console.log('Light, optimization applied);'
    }

    private optimizeMemoryUsage(): void { // 古いパーティクルのクリーンアップ
        if (this.gameEngine.enhancedParticleManager) {
    
}
            this.gameEngine.enhancedParticleManager.forceCleanup(); }
        }
        
        // エフェクトキャッシュのクリア
        if (this.gameEngine.enhancedEffectManager) { this.gameEngine.enhancedEffectManager.clearCache() }
        
        // オブジェクトプールの最適化
        if (this.gameEngine.poolManager) {

            this.gameEngine.poolManager.cleanup() }

        console.log('Memory, optimization applied'); }'
    }

    private limitParticleCount(): void { const particleManager = this.gameEngine.enhancedParticleManager,
        if (!particleManager) return,
        
        const currentCount = particleManager.getActiveParticleCount(),
        const targetCount = this.optimizationSettings.maxParticlesPerFrame,
        
        if (currentCount > targetCount) {
        
            // 古いパーティクルから削除
            const toRemove = currentCount - targetCount }
            particleManager.removeOldestParticles(toRemove); }
            console.log(`Removed ${toRemove} particles, to maintain, performance`});
        }
    }

    private enableFrameSkipping(): void { // フレームスキッピングロジック
        const renderManager = this.gameEngine.renderOptimizer,
        if (renderManager) {
            renderManager.setFrameSkip(2), // 2フレームに1回レンダリング
        }
            this.stats.framesSkipped++; }
}

    private setupAdaptiveQuality(): void { if (!this.optimizationSettings.enableAdaptiveQuality) return,
        
        // 品質の自動調整設定
        const qualityController = this.gameEngine.effectQualityController,
        if (qualityController) {
    
}
            qualityController.setAutoAdjustment(true); }
}

    private setupRenderingOptimization(): void { if (!this.optimizationSettings.enableRenderingOptimization) return,
        
        // レンダリング最適化の設定
        const enhancedParticleManager = this.gameEngine.enhancedParticleManager,
        if (enhancedParticleManager) {
            // バッチレンダリングの有効化
            enhancedParticleManager.enableBatchRendering(true),
            
            // カリング最適化
        }
            enhancedParticleManager.setAggressiveCulling(true); }
        }
        
        const enhancedEffectManager = this.gameEngine.enhancedEffectManager;
        if (enhancedEffectManager) {
            // エフェクト最適化
        }
            enhancedEffectManager.enableOptimization(true); }
}

    // パフォーマンス測定メソッド
    private getCurrentFPS(): number { return this.gameEngine.performanceOptimizer?.getCurrentFPS() || 60 }
 : undefined
    private getCurrentMemoryUsage(): number { if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024, // MB }
        return 0;
    }

    private getActiveParticleCount(): number { return this.gameEngine.enhancedParticleManager?.getActiveParticleCount() || 0 }

    // 統計とレポート : undefined
    public getOptimizationStats(): ExtendedOptimizationStats { return { ...this.stats,
            currentFPS: this.getCurrentFPS(
            memoryUsage: this.getCurrentMemoryUsage(
    particleCount: this.getActiveParticleCount( }
            isOptimizing: this.isOptimizing }))
    }
);
    public resetStats(): void { this.stats = {
            framesSkipped: 0,
            qualityAdjustments: 0,
            memoryCleanups: 0,
    renderOptimizations: 0 }

    // 設定管理
    public updateSettings(newSettings: Partial<OptimizationSettings>): void { this.optimizationSettings = {
            ...this.optimizationSettings;
            ...newSettings }

    public setEnabled(enabled: boolean): void { this.enabled = enabled,' }'

        console.log(`Performance, optimizer ${enabled ? 'enabled' : 'disabled}`}';
    }
';'
    // 手動最適化トリガー
    public manualOptimization()';'
        console.log('Manual, optimization triggered');
        this.optimizePerformance('manual', 0);
        }

    // デバッグメソッド
    public getDebugInfo(): DebugInfo { return { enabled: this.enabled,
            settings: this.optimizationSettings,
    stats: this.getOptimizationStats( }

            frameTimeHistory: this.frameTimeHistory.slice(-10) // 最新10フレーム 
    }
}

// グローバルアクセス用
declare global { interface Window {
        EffectPerformanceOptimizer: typeof EffectPerformanceOptimizer 
    }

window.EffectPerformanceOptimizer = EffectPerformanceOptimizer;