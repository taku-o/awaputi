/**
 * Effect Performance Optimizer
 * エフェクトシステムの最終パフォーマンス最適化
 */

export class EffectPerformanceOptimizer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enabled = true;
        
        // パフォーマンス改善設定
        this.optimizationSettings = {
            enableFrameSkipping: true,
            enableAdaptiveQuality: true,
            enableMemoryOptimization: true,
            enableRenderingOptimization: true,
            maxParticlesPerFrame: 500,
            targetFPS: 60,
            minFPS: 30
        };
        
        // 最適化統計
        this.stats = {
            framesSkipped: 0,
            qualityAdjustments: 0,
            memoryCleanups: 0,
            renderOptimizations: 0
        };
        
        this.lastFrameTime = performance.now();
        this.frameTimeHistory = [];
        this.isOptimizing = false;
        
        this.initialize();
    }

    initialize() {
        // パフォーマンス監視の開始
        this.startPerformanceMonitoring();
        
        // 適応的品質調整の設定
        this.setupAdaptiveQuality();
        
        // レンダリング最適化の設定
        this.setupRenderingOptimization();
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            this.analyzePerformance();
        }, 1000); // 1秒毎に分析
    }

    analyzePerformance() {
        if (!this.enabled || this.isOptimizing) return;
        
        const currentFPS = this.getCurrentFPS();
        const memoryUsage = this.getCurrentMemoryUsage();
        const particleCount = this.getActiveParticleCount();
        
        // パフォーマンス劣化の検出
        if (currentFPS < this.optimizationSettings.minFPS) {
            this.isOptimizing = true;
            this.optimizePerformance('fps', currentFPS);
            this.isOptimizing = false;
        }
        
        // メモリ使用量の監視
        if (memoryUsage > 200) { // 200MB以上
            this.optimizeMemoryUsage();
        }
        
        // パーティクル数の制限
        if (particleCount > this.optimizationSettings.maxParticlesPerFrame) {
            this.limitParticleCount();
        }
    }

    optimizePerformance(reason, value) {
        console.log(`Optimizing performance due to ${reason}: ${value}`);
        
        switch (reason) {
            case 'fps':
                this.optimizeFPS(value);
                break;
            case 'memory':
                this.optimizeMemoryUsage();
                break;
            case 'particles':
                this.limitParticleCount();
                break;
        }
        
        this.stats.renderOptimizations++;
    }

    optimizeFPS(currentFPS) {
        const optimizations = [];
        
        // 段階的最適化アプローチ
        if (currentFPS < 15) {
            // 緊急最適化
            optimizations.push(() => this.emergencyOptimization());
        } else if (currentFPS < 25) {
            // 高度最適化
            optimizations.push(() => this.advancedOptimization());
        } else if (currentFPS < this.optimizationSettings.minFPS) {
            // 軽度最適化
            optimizations.push(() => this.lightOptimization());
        }
        
        // 最適化の実行
        for (const optimize of optimizations) {
            optimize();
        }
    }

    emergencyOptimization() {
        // 最低品質に設定
        if (this.gameEngine.effectQualityController) {
            this.gameEngine.effectQualityController.setQualityLevel('low');
        }
        
        // パーティクル数を大幅削減
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(0.1);
            this.gameEngine.enhancedParticleManager.clearAllParticles();
        }
        
        // 複雑なエフェクトを無効化
        if (this.gameEngine.seasonalEffectManager) {
            this.gameEngine.seasonalEffectManager.setEnabled(false);
        }
        
        console.log('Emergency optimization applied');
    }

    advancedOptimization() {
        // 品質を下げる
        const qualityController = this.gameEngine.effectQualityController;
        if (qualityController) {
            const currentQuality = qualityController.getCurrentQualityLevel();
            const qualityLevels = ['low', 'medium', 'high', 'ultra'];
            const currentIndex = qualityLevels.indexOf(currentQuality);
            
            if (currentIndex > 0) {
                qualityController.setQualityLevel(qualityLevels[currentIndex - 1]);
                this.stats.qualityAdjustments++;
            }
        }
        
        // パーティクル数削減
        if (this.gameEngine.enhancedParticleManager) {
            const currentMultiplier = this.gameEngine.enhancedParticleManager.particleMultiplier || 1.0;
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(currentMultiplier * 0.7);
        }
        
        console.log('Advanced optimization applied');
    }

    lightOptimization() {
        // フレームスキッピングの有効化
        if (this.optimizationSettings.enableFrameSkipping) {
            this.enableFrameSkipping();
        }
        
        // 軽微なパーティクル削減
        if (this.gameEngine.enhancedParticleManager) {
            const currentMultiplier = this.gameEngine.enhancedParticleManager.particleMultiplier || 1.0;
            this.gameEngine.enhancedParticleManager.setParticleMultiplier(currentMultiplier * 0.9);
        }
        
        console.log('Light optimization applied');
    }

    optimizeMemoryUsage() {
        // 古いパーティクルのクリーンアップ
        if (this.gameEngine.enhancedParticleManager) {
            this.gameEngine.enhancedParticleManager.forceCleanup();
        }
        
        // エフェクトキャッシュのクリア
        if (this.gameEngine.enhancedEffectManager) {
            this.gameEngine.enhancedEffectManager.clearCache();
        }
        
        // オブジェクトプールの最適化
        if (this.gameEngine.poolManager) {
            this.gameEngine.poolManager.cleanup();
        }
        
        this.stats.memoryCleanups++;
        console.log('Memory optimization applied');
    }

    limitParticleCount() {
        const particleManager = this.gameEngine.enhancedParticleManager;
        if (!particleManager) return;
        
        const currentCount = particleManager.getActiveParticleCount();
        const targetCount = this.optimizationSettings.maxParticlesPerFrame;
        
        if (currentCount > targetCount) {
            // 古いパーティクルから削除
            const toRemove = currentCount - targetCount;
            particleManager.removeOldestParticles(toRemove);
            console.log(`Removed ${toRemove} particles to maintain performance`);
        }
    }

    enableFrameSkipping() {
        // フレームスキッピングロジック
        const renderManager = this.gameEngine.renderOptimizer;
        if (renderManager) {
            renderManager.setFrameSkip(2); // 2フレームに1回レンダリング
            this.stats.framesSkipped++;
        }
    }

    setupAdaptiveQuality() {
        if (!this.optimizationSettings.enableAdaptiveQuality) return;
        
        // 品質の自動調整設定
        const qualityController = this.gameEngine.effectQualityController;
        if (qualityController) {
            qualityController.setAutoAdjustment(true);
        }
    }

    setupRenderingOptimization() {
        if (!this.optimizationSettings.enableRenderingOptimization) return;
        
        // レンダリング最適化の設定
        const enhancedParticleManager = this.gameEngine.enhancedParticleManager;
        if (enhancedParticleManager) {
            // バッチレンダリングの有効化
            enhancedParticleManager.enableBatchRendering(true);
            
            // カリング最適化
            enhancedParticleManager.setAggressiveCulling(true);
        }
        
        const enhancedEffectManager = this.gameEngine.enhancedEffectManager;
        if (enhancedEffectManager) {
            // エフェクト最適化
            enhancedEffectManager.enableOptimizedRendering(true);
        }
    }

    // パフォーマンス測定メソッド
    getCurrentFPS() {
        return this.gameEngine.performanceOptimizer?.getCurrentFPS() || 60;
    }

    getCurrentMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    getActiveParticleCount() {
        return this.gameEngine.enhancedParticleManager?.getActiveParticleCount() || 0;
    }

    // 統計とレポート
    getOptimizationStats() {
        return {
            ...this.stats,
            currentFPS: this.getCurrentFPS(),
            memoryUsage: this.getCurrentMemoryUsage(),
            particleCount: this.getActiveParticleCount(),
            isOptimizing: this.isOptimizing
        };
    }

    resetStats() {
        this.stats = {
            framesSkipped: 0,
            qualityAdjustments: 0,
            memoryCleanups: 0,
            renderOptimizations: 0
        };
    }

    // 設定管理
    updateSettings(newSettings) {
        this.optimizationSettings = {
            ...this.optimizationSettings,
            ...newSettings
        };
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`Performance optimizer ${enabled ? 'enabled' : 'disabled'}`);
    }

    // 手動最適化トリガー
    manualOptimization() {
        console.log('Manual optimization triggered');
        this.optimizePerformance('manual', 'user_request');
    }

    // デバッグメソッド
    getDebugInfo() {
        return {
            enabled: this.enabled,
            settings: this.optimizationSettings,
            stats: this.getOptimizationStats(),
            frameTimeHistory: this.frameTimeHistory.slice(-10) // 最新10フレーム
        };
    }
}

// グローバルアクセス用
window.EffectPerformanceOptimizer = EffectPerformanceOptimizer;