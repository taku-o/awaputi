/**
 * GamePerformanceMonitor - ゲームパフォーマンス監視システム
 * 
 * FPS測定、パフォーマンスメトリクス収集、最適化提案などの専門的な処理を行います
 */

export class GamePerformanceMonitor {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // パフォーマンス測定
        this.performanceMetrics = {
            fps: 60,
            frameCount: 0,
            lastFpsUpdate: Date.now(),
            bubbleCount: 0,
            showMetrics: false,
            averageFps: 60,
            minFps: 60,
            maxFps: 60,
            frameHistory: [],
            maxHistorySize: 100
        };
        
        // パフォーマンス閾値
        this.performanceThresholds = {
            minAcceptableFps: 30,
            targetFps: 60,
            maxBubbleCount: 100,
            memoryWarningThreshold: 50 * 1024 * 1024, // 50MB
            frameTimeWarning: 33.33 // 30FPS未満の警告
        };
        
        // 最適化フラグ
        this.optimizations = {
            reducedEffects: false,
            reducedParticles: false,
            simplifiedRendering: false,
            lowQualityMode: false
        };
        
        // 統計情報
        this.statistics = {
            totalFrames: 0,
            totalGameTime: 0,
            performanceWarnings: 0,
            optimizationTriggers: 0,
            averageUpdateTime: 0,
            averageRenderTime: 0
        };
    }
    
    /**
     * パフォーマンス監視の開始
     */
    startMonitoring() {
        this.performanceMetrics.lastFpsUpdate = Date.now();
        this.performanceMetrics.frameCount = 0;
        this.statistics.totalFrames = 0;
        this.statistics.totalGameTime = 0;
        
        console.log('[GamePerformanceMonitor] Monitoring started');
    }
    
    /**
     * パフォーマンス監視の停止
     */
    stopMonitoring() {
        console.log('[GamePerformanceMonitor] Monitoring stopped');
        this.logPerformanceSummary();
    }
    
    /**
     * パフォーマンス測定の更新
     * @param {number} deltaTime - 経過時間
     */
    updatePerformanceMetrics(deltaTime) {
        const updateStartTime = performance.now();
        
        this.performanceMetrics.frameCount++;
        this.statistics.totalFrames++;
        this.statistics.totalGameTime += deltaTime;
        
        const now = Date.now();
        
        // FPS計算（1秒ごと）
        if (now - this.performanceMetrics.lastFpsUpdate >= 1000) {
            this.calculateFPS();
            this.updateBubbleCount();
            this.checkPerformanceThresholds();
            this.updateFrameHistory();
            
            this.performanceMetrics.lastFpsUpdate = now;
        }
        
        // 更新時間の測定
        const updateEndTime = performance.now();
        this.updateAverageUpdateTime(updateEndTime - updateStartTime);
    }
    
    /**
     * FPS計算
     */
    calculateFPS() {
        const currentFps = this.performanceMetrics.frameCount;
        this.performanceMetrics.fps = currentFps;
        this.performanceMetrics.frameCount = 0;
        
        // FPS統計の更新
        this.performanceMetrics.minFps = Math.min(this.performanceMetrics.minFps, currentFps);
        this.performanceMetrics.maxFps = Math.max(this.performanceMetrics.maxFps, currentFps);
        
        // 平均FPSの計算
        this.updateAverageFPS(currentFps);
    }
    
    /**
     * 平均FPSの更新
     * @param {number} currentFps - 現在のFPS
     */
    updateAverageFPS(currentFps) {
        const history = this.performanceMetrics.frameHistory;
        history.push(currentFps);
        
        if (history.length > this.performanceMetrics.maxHistorySize) {
            history.shift();
        }
        
        const sum = history.reduce((a, b) => a + b, 0);
        this.performanceMetrics.averageFps = sum / history.length;
    }
    
    /**
     * フレーム履歴の更新
     */
    updateFrameHistory() {
        const frameTime = 1000 / this.performanceMetrics.fps;
        this.performanceMetrics.frameHistory.push(frameTime);
        
        if (this.performanceMetrics.frameHistory.length > this.performanceMetrics.maxHistorySize) {
            this.performanceMetrics.frameHistory.shift();
        }
    }
    
    /**
     * 泡の数を更新
     */
    updateBubbleCount() {
        this.performanceMetrics.bubbleCount = this.gameEngine.bubbleManager.getBubbleCount();
    }
    
    /**
     * 平均更新時間の更新
     * @param {number} updateTime - 更新時間
     */
    updateAverageUpdateTime(updateTime) {
        const alpha = 0.1; // 平滑化係数
        this.statistics.averageUpdateTime = 
            this.statistics.averageUpdateTime * (1 - alpha) + updateTime * alpha;
    }
    
    /**
     * 平均描画時間の更新
     * @param {number} renderTime - 描画時間
     */
    updateAverageRenderTime(renderTime) {
        const alpha = 0.1; // 平滑化係数
        this.statistics.averageRenderTime = 
            this.statistics.averageRenderTime * (1 - alpha) + renderTime * alpha;
    }
    
    /**
     * パフォーマンス閾値のチェック
     */
    checkPerformanceThresholds() {
        const fps = this.performanceMetrics.fps;
        const bubbleCount = this.performanceMetrics.bubbleCount;
        
        // FPS警告
        if (fps < this.performanceThresholds.minAcceptableFps) {
            this.handleLowFPS(fps);
        }
        
        // 泡の数警告
        if (bubbleCount > this.performanceThresholds.maxBubbleCount) {
            this.handleHighBubbleCount(bubbleCount);
        }
        
        // メモリ使用量チェック（可能な場合）
        this.checkMemoryUsage();
    }
    
    /**
     * 低FPSの処理
     * @param {number} fps - 現在のFPS
     */
    handleLowFPS(fps) {
        this.statistics.performanceWarnings++;
        console.warn(`[GamePerformanceMonitor] Low FPS detected: ${fps}`);
        
        // 自動最適化の実行
        if (!this.optimizations.reducedEffects) {
            this.enableReducedEffects();
        } else if (!this.optimizations.reducedParticles) {
            this.enableReducedParticles();
        } else if (!this.optimizations.lowQualityMode) {
            this.enableLowQualityMode();
        }
    }
    
    /**
     * 高泡数の処理
     * @param {number} bubbleCount - 泡の数
     */
    handleHighBubbleCount(bubbleCount) {
        console.warn(`[GamePerformanceMonitor] High bubble count: ${bubbleCount}`);
        
        // 泡の自動削除またはエフェクト軽減
        if (!this.optimizations.reducedEffects) {
            this.enableReducedEffects();
        }
    }
    
    /**
     * メモリ使用量チェック
     */
    checkMemoryUsage() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            if (memInfo.usedJSHeapSize > this.performanceThresholds.memoryWarningThreshold) {
                console.warn(`[GamePerformanceMonitor] High memory usage: ${memInfo.usedJSHeapSize / 1024 / 1024}MB`);
                this.triggerMemoryCleanup();
            }
        }
    }
    
    /**
     * 軽減エフェクトの有効化
     */
    enableReducedEffects() {
        this.optimizations.reducedEffects = true;
        this.statistics.optimizationTriggers++;
        console.log('[GamePerformanceMonitor] Reduced effects enabled');
    }
    
    /**
     * 軽減パーティクルの有効化
     */
    enableReducedParticles() {
        this.optimizations.reducedParticles = true;
        this.statistics.optimizationTriggers++;
        console.log('[GamePerformanceMonitor] Reduced particles enabled');
    }
    
    /**
     * 簡略化レンダリングの有効化
     */
    enableSimplifiedRendering() {
        this.optimizations.simplifiedRendering = true;
        this.statistics.optimizationTriggers++;
        console.log('[GamePerformanceMonitor] Simplified rendering enabled');
    }
    
    /**
     * 低品質モードの有効化
     */
    enableLowQualityMode() {
        this.optimizations.lowQualityMode = true;
        this.statistics.optimizationTriggers++;
        console.log('[GamePerformanceMonitor] Low quality mode enabled');
    }
    
    /**
     * メモリクリーンアップの実行
     */
    triggerMemoryCleanup() {
        // 未使用リソースのクリーンアップ
        this.gameEngine.bubbleManager.cleanupDestroyedBubbles();
        
        // ガベージコレクションの促進（ヒント）
        if ('gc' in window) {
            window.gc();
        }
        
        console.log('[GamePerformanceMonitor] Memory cleanup triggered');
    }
    
    /**
     * パフォーマンス最適化のリセット
     */
    resetOptimizations() {
        this.optimizations = {
            reducedEffects: false,
            reducedParticles: false,
            simplifiedRendering: false,
            lowQualityMode: false
        };
        
        console.log('[GamePerformanceMonitor] Optimizations reset');
    }
    
    /**
     * パフォーマンスメトリクス描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderPerformanceMetrics(context) {
        if (!this.performanceMetrics.showMetrics) return;
        
        const canvas = this.gameEngine.canvas;
        const x = canvas.width - 200;
        const y = 20;
        
        // 背景
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(x - 10, y - 10, 190, 150);
        
        // テキスト設定
        context.fillStyle = '#FFFFFF';
        context.font = '12px monospace';
        context.textAlign = 'left';
        
        // メトリクス表示
        const metrics = [
            `FPS: ${this.performanceMetrics.fps}`,
            `Avg FPS: ${this.performanceMetrics.averageFps.toFixed(1)}`,
            `Min FPS: ${this.performanceMetrics.minFps}`,
            `Max FPS: ${this.performanceMetrics.maxFps}`,
            `Bubbles: ${this.performanceMetrics.bubbleCount}`,
            `Update: ${this.statistics.averageUpdateTime.toFixed(2)}ms`,
            `Render: ${this.statistics.averageRenderTime.toFixed(2)}ms`,
            `Warnings: ${this.statistics.performanceWarnings}`,
            `Optimizations: ${this.statistics.optimizationTriggers}`
        ];
        
        metrics.forEach((metric, index) => {
            context.fillText(metric, x, y + index * 15);
        });
        
        // 最適化状態
        if (Object.values(this.optimizations).some(opt => opt)) {
            context.fillStyle = '#FFAA00';
            context.fillText('Optimized', x, y + metrics.length * 15);
        }
    }
    
    /**
     * パフォーマンスサマリーのログ出力
     */
    logPerformanceSummary() {
        console.log('[GamePerformanceMonitor] Performance Summary:');
        console.log(`  Total Frames: ${this.statistics.totalFrames}`);
        console.log(`  Total Game Time: ${(this.statistics.totalGameTime / 1000).toFixed(2)}s`);
        console.log(`  Average FPS: ${this.performanceMetrics.averageFps.toFixed(1)}`);
        console.log(`  Min FPS: ${this.performanceMetrics.minFps}`);
        console.log(`  Max FPS: ${this.performanceMetrics.maxFps}`);
        console.log(`  Performance Warnings: ${this.statistics.performanceWarnings}`);
        console.log(`  Optimization Triggers: ${this.statistics.optimizationTriggers}`);
        console.log(`  Average Update Time: ${this.statistics.averageUpdateTime.toFixed(2)}ms`);
        console.log(`  Average Render Time: ${this.statistics.averageRenderTime.toFixed(2)}ms`);
    }
    
    /**
     * パフォーマンス表示の切り替え
     */
    toggleMetricsDisplay() {
        this.performanceMetrics.showMetrics = !this.performanceMetrics.showMetrics;
    }
    
    /**
     * パフォーマンス推奨事項の取得
     * @returns {Array} 推奨事項配列
     */
    getPerformanceRecommendations() {
        const recommendations = [];
        
        if (this.performanceMetrics.averageFps < this.performanceThresholds.targetFps) {
            recommendations.push('FPSが目標値を下回っています。エフェクトや泡の数を減らすことを推奨します。');
        }
        
        if (this.performanceMetrics.bubbleCount > this.performanceThresholds.maxBubbleCount * 0.8) {
            recommendations.push('泡の数が多くなっています。パフォーマンスに影響する可能性があります。');
        }
        
        if (this.statistics.averageUpdateTime > 16.67) {
            recommendations.push('更新処理に時間がかかっています。処理の最適化を推奨します。');
        }
        
        if (this.statistics.averageRenderTime > 16.67) {
            recommendations.push('描画処理に時間がかかっています。描画の最適化を推奨します。');
        }
        
        return recommendations;
    }
    
    /**
     * パフォーマンス統計の取得
     * @returns {Object} 統計情報
     */
    getPerformanceStats() {
        return {
            metrics: { ...this.performanceMetrics },
            statistics: { ...this.statistics },
            optimizations: { ...this.optimizations },
            thresholds: { ...this.performanceThresholds },
            recommendations: this.getPerformanceRecommendations()
        };
    }
    
    /**
     * パフォーマンス設定の更新
     * @param {Object} settings - 設定オブジェクト
     */
    updateSettings(settings) {
        if (settings.showMetrics !== undefined) {
            this.performanceMetrics.showMetrics = settings.showMetrics;
        }
        
        if (settings.thresholds) {
            Object.assign(this.performanceThresholds, settings.thresholds);
        }
        
        console.log('[GamePerformanceMonitor] Settings updated');
    }
}