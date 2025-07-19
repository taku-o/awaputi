/**
 * パフォーマンス最適化システム
 * 60FPS維持のための動的最適化機能を提供
 */
export class PerformanceOptimizer {
    constructor() {
        this.targetFPS = 60;
        this.targetFrameTime = 1000 / this.targetFPS; // 16.67ms
        this.frameTimeHistory = [];
        this.maxHistorySize = 30;
        
        this.settings = {
            maxBubbles: 20,
            maxParticles: 500,
            particleQuality: 1.0, // 0.1 - 1.0
            renderQuality: 1.0,   // 0.5 - 1.0
            effectQuality: 1.0,   // 0.1 - 1.0
            audioQuality: 1.0,    // 0.1 - 1.0
            enableShadows: true,
            enableBlur: true,
            enableAntiAliasing: true
        };
        
        this.originalSettings = { ...this.settings };
        
        this.performanceLevel = 'high'; // 'low', 'medium', 'high'
        this.adaptiveMode = true;
        this.lastOptimizationTime = 0;
        this.optimizationInterval = 1000; // 1秒ごとに最適化チェック
        
        this.stats = {
            currentFPS: 60,
            averageFPS: 60,
            frameTime: 16.67,
            droppedFrames: 0,
            optimizationCount: 0,
            lastOptimization: null
        };
    }
    
    /**
     * フレーム開始時の処理
     * @param {number} currentTime - 現在時刻
     */
    startFrame(currentTime) {
        if (this.lastFrameTime) {
            const frameTime = currentTime - this.lastFrameTime;
            this.frameTimeHistory.push(frameTime);
            
            if (this.frameTimeHistory.length > this.maxHistorySize) {
                this.frameTimeHistory.shift();
            }
            
            // 統計更新
            this.stats.frameTime = frameTime;
            this.stats.currentFPS = 1000 / frameTime;
            this.stats.averageFPS = 1000 / (this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length);
            
            // フレームドロップ検出
            if (frameTime > this.targetFrameTime * 1.5) {
                this.stats.droppedFrames++;
            }
            
            // 適応的最適化
            if (this.adaptiveMode && currentTime - this.lastOptimizationTime > this.optimizationInterval) {
                this.performAdaptiveOptimization();
                this.lastOptimizationTime = currentTime;
            }
        }
        
        this.lastFrameTime = currentTime;
    }
    
    /**
     * 適応的最適化を実行
     */
    performAdaptiveOptimization() {
        const avgFPS = this.stats.averageFPS;
        const targetFPS = this.targetFPS;
        
        if (avgFPS < targetFPS * 0.8) { // 48 FPS以下
            this.degradePerformance();
        } else if (avgFPS > targetFPS * 0.95 && this.performanceLevel !== 'high') { // 57 FPS以上
            this.improvePerformance();
        }
    }
    
    /**
     * パフォーマンスを下げる（品質を落とす）
     */
    degradePerformance() {
        if (this.performanceLevel === 'high') {
            this.setPerformanceLevel('medium');
        } else if (this.performanceLevel === 'medium') {
            this.setPerformanceLevel('low');
        }
    }
    
    /**
     * パフォーマンスを上げる（品質を上げる）
     */
    improvePerformance() {
        if (this.performanceLevel === 'low') {
            this.setPerformanceLevel('medium');
        } else if (this.performanceLevel === 'medium') {
            this.setPerformanceLevel('high');
        }
    }
    
    /**
     * パフォーマンスレベルを設定
     * @param {string} level - パフォーマンスレベル
     */
    setPerformanceLevel(level) {
        this.performanceLevel = level;
        
        switch (level) {
            case 'low':
                this.settings = {
                    maxBubbles: 10,
                    maxParticles: 100,
                    particleQuality: 0.3,
                    renderQuality: 0.7,
                    effectQuality: 0.2,
                    audioQuality: 0.5,
                    enableShadows: false,
                    enableBlur: false,
                    enableAntiAliasing: false
                };
                break;
                
            case 'medium':
                this.settings = {
                    maxBubbles: 15,
                    maxParticles: 300,
                    particleQuality: 0.6,
                    renderQuality: 0.85,
                    effectQuality: 0.6,
                    audioQuality: 0.8,
                    enableShadows: false,
                    enableBlur: true,
                    enableAntiAliasing: false
                };
                break;
                
            case 'high':
                this.settings = { ...this.originalSettings };
                break;
        }
        
        this.stats.optimizationCount++;
        this.stats.lastOptimization = {
            level: level,
            time: Date.now(),
            reason: `FPS: ${Math.round(this.stats.averageFPS)}`
        };
        
        console.log(`Performance level changed to: ${level} (FPS: ${Math.round(this.stats.averageFPS)})`);
    }
    
    /**
     * バブル数制限を取得
     * @returns {number} 最大バブル数
     */
    getMaxBubbles() {
        return this.settings.maxBubbles;
    }
    
    /**
     * パーティクル数制限を取得
     * @returns {number} 最大パーティクル数
     */
    getMaxParticles() {
        return this.settings.maxParticles;
    }
    
    /**
     * パーティクル品質を取得
     * @returns {number} パーティクル品質 (0.1-1.0)
     */
    getParticleQuality() {
        return this.settings.particleQuality;
    }
    
    /**
     * レンダリング品質を取得
     * @returns {number} レンダリング品質 (0.5-1.0)
     */
    getRenderQuality() {
        return this.settings.renderQuality;
    }
    
    /**
     * エフェクト品質を取得
     * @returns {number} エフェクト品質 (0.1-1.0)
     */
    getEffectQuality() {
        return this.settings.effectQuality;
    }
    
    /**
     * 音声品質を取得
     * @returns {number} 音声品質 (0.1-1.0)
     */
    getAudioQuality() {
        return this.settings.audioQuality;
    }
    
    /**
     * 影エフェクトが有効か
     * @returns {boolean} 影エフェクトの有効性
     */
    areShadowsEnabled() {
        return this.settings.enableShadows;
    }
    
    /**
     * ブラーエフェクトが有効か
     * @returns {boolean} ブラーエフェクトの有効性
     */
    isBlurEnabled() {
        return this.settings.enableBlur;
    }
    
    /**
     * アンチエイリアシングが有効か
     * @returns {boolean} アンチエイリアシングの有効性
     */
    isAntiAliasingEnabled() {
        return this.settings.enableAntiAliasing;
    }
    
    /**
     * レンダリングコンテキストを最適化
     * @param {CanvasRenderingContext2D} context - コンテキスト
     */
    optimizeRenderingContext(context) {
        // アンチエイリアシング設定
        context.imageSmoothingEnabled = this.isAntiAliasingEnabled();
        
        if (context.imageSmoothingEnabled) {
            context.imageSmoothingQuality = this.getRenderQuality() > 0.8 ? 'high' : 'medium';
        }
        
        // レンダリング品質に基づくスケール調整
        const quality = this.getRenderQuality();
        if (quality < 1.0) {
            context.scale(quality, quality);
        }
    }
    
    /**
     * アニメーション更新頻度を調整
     * @param {number} deltaTime - デルタタイム
     * @returns {number} 調整されたデルタタイム
     */
    adjustUpdateFrequency(deltaTime) {
        const quality = this.getEffectQuality();
        
        if (quality < 0.5) {
            // 低品質時は更新頻度を下げる
            return deltaTime * 2;
        } else if (quality < 0.8) {
            return deltaTime * 1.5;
        }
        
        return deltaTime;
    }
    
    /**
     * パーティクルを間引く
     * @param {Array} particles - パーティクル配列
     * @returns {Array} 間引かれたパーティクル配列
     */
    cullParticles(particles) {
        const maxParticles = this.getMaxParticles();
        const quality = this.getParticleQuality();
        
        if (particles.length <= maxParticles) {
            if (quality >= 1.0) {
                return particles;
            }
            
            // 品質に基づいて間引く
            const step = Math.ceil(1 / quality);
            return particles.filter((_, index) => index % step === 0);
        }
        
        // 数が多すぎる場合は最新のもので制限
        return particles.slice(-maxParticles);
    }
    
    /**
     * エフェクトの実行可否を判定
     * @param {string} effectType - エフェクトタイプ
     * @returns {boolean} 実行可能か
     */
    shouldRunEffect(effectType) {
        const quality = this.getEffectQuality();
        
        switch (effectType) {
            case 'particle':
                return quality > 0.1;
            case 'shadow':
                return this.areShadowsEnabled() && quality > 0.3;
            case 'blur':
                return this.isBlurEnabled() && quality > 0.5;
            case 'glow':
                return quality > 0.7;
            case 'reflection':
                return quality > 0.8;
            default:
                return quality > 0.5;
        }
    }
    
    /**
     * 音声エフェクトの実行可否を判定
     * @param {string} audioType - 音声タイプ
     * @returns {boolean} 実行可能か
     */
    shouldPlayAudio(audioType) {
        const quality = this.getAudioQuality();
        
        switch (audioType) {
            case 'sfx':
                return quality > 0.1;
            case 'ambient':
                return quality > 0.3;
            case 'music':
                return quality > 0.5;
            case 'voice':
                return quality > 0.7;
            default:
                return quality > 0.5;
        }
    }
    
    /**
     * フレーム間の処理負荷を分散
     * @param {Array} tasks - タスク配列
     * @param {number} maxTimePerFrame - フレームあたりの最大処理時間(ms)
     * @returns {object} 実行結果
     */
    distributeWorkload(tasks, maxTimePerFrame = 8) {
        const startTime = performance.now();
        const completedTasks = [];
        const remainingTasks = [...tasks];
        
        while (remainingTasks.length > 0) {
            const currentTime = performance.now();
            
            if (currentTime - startTime >= maxTimePerFrame) {
                break; // 時間切れ
            }
            
            const task = remainingTasks.shift();
            try {
                if (typeof task === 'function') {
                    const result = task();
                    completedTasks.push(result);
                } else {
                    completedTasks.push(task);
                }
            } catch (error) {
                console.error('Task execution error:', error);
            }
        }
        
        return {
            completed: completedTasks,
            remaining: remainingTasks,
            processingTime: performance.now() - startTime
        };
    }
    
    /**
     * 動的品質調整を有効/無効化
     * @param {boolean} enabled - 有効性
     */
    setAdaptiveMode(enabled) {
        this.adaptiveMode = enabled;
        
        if (!enabled) {
            this.setPerformanceLevel('high');
        }
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns {object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            performanceLevel: this.performanceLevel,
            adaptiveMode: this.adaptiveMode,
            settings: { ...this.settings }
        };
    }
    
    /**
     * 詳細なパフォーマンス分析
     * @returns {object} 分析結果
     */
    analyzePerformance() {
        const avgFPS = this.stats.averageFPS;
        const targetFPS = this.targetFPS;
        const frameTimeVariance = this.calculateFrameTimeVariance();
        
        const analysis = {
            fpsRatio: avgFPS / targetFPS,
            isStable: frameTimeVariance < 5, // 5ms以下の分散は安定
            recommendation: 'none',
            issues: []
        };
        
        if (avgFPS < targetFPS * 0.8) {
            analysis.recommendation = 'lower_quality';
            analysis.issues.push('Low FPS detected');
        } else if (avgFPS > targetFPS * 0.95 && this.performanceLevel !== 'high') {
            analysis.recommendation = 'raise_quality';
            analysis.issues.push('Performance headroom available');
        }
        
        if (!analysis.isStable) {
            analysis.issues.push('Unstable frame timing');
        }
        
        if (this.stats.droppedFrames > 10) {
            analysis.issues.push('High frame drop count');
        }
        
        return analysis;
    }
    
    /**
     * フレーム時間の分散を計算
     * @returns {number} 分散値
     */
    calculateFrameTimeVariance() {
        if (this.frameTimeHistory.length < 2) return 0;
        
        const mean = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        const variance = this.frameTimeHistory.reduce((acc, time) => {
            return acc + Math.pow(time - mean, 2);
        }, 0) / this.frameTimeHistory.length;
        
        return Math.sqrt(variance);
    }
    
    /**
     * パフォーマンス警告を取得
     * @returns {string[]} 警告メッセージ
     */
    getWarnings() {
        const warnings = [];
        const analysis = this.analyzePerformance();
        
        if (analysis.fpsRatio < 0.8) {
            warnings.push(`Low FPS: ${Math.round(this.stats.averageFPS)}/${this.targetFPS}`);
        }
        
        if (!analysis.isStable) {
            warnings.push('Unstable frame timing detected');
        }
        
        if (this.stats.droppedFrames > 20) {
            warnings.push(`High frame drops: ${this.stats.droppedFrames}`);
        }
        
        const memoryWarning = this.checkMemoryUsage();
        if (memoryWarning) {
            warnings.push(memoryWarning);
        }
        
        return warnings;
    }
    
    /**
     * メモリ使用量をチェック
     * @returns {string|null} 警告メッセージ
     */
    checkMemoryUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            
            if (used > limit * 0.8) {
                return `High memory usage: ${Math.round(used / 1024 / 1024)}MB`;
            }
        }
        
        return null;
    }
    
    /**
     * Canvas リサイズ時の処理
     * @param {object} canvasInfo - Canvas情報
     */
    onCanvasResize(canvasInfo) {
        console.log('PerformanceOptimizer: Canvas resized to', canvasInfo.actualWidth, 'x', canvasInfo.actualHeight);
        
        // Canvas サイズに基づいてパフォーマンス設定を調整
        const totalPixels = canvasInfo.actualWidth * canvasInfo.actualHeight;
        const basePixels = 800 * 600; // 基準解像度
        
        // 解像度に基づいてパフォーマンスレベルを自動調整
        if (totalPixels > basePixels * 2) {
            // 高解像度の場合はパフォーマンスを少し下げる
            if (this.performanceLevel === 'high') {
                this.degradePerformance();
            }
        } else if (totalPixels < basePixels * 0.5) {
            // 低解像度の場合はパフォーマンスを上げる
            if (this.performanceLevel === 'low') {
                this.improvePerformance();
            }
        }
    }

    /**
     * 最適化システムをリセット
     */
    reset() {
        this.frameTimeHistory = [];
        this.stats.droppedFrames = 0;
        this.stats.optimizationCount = 0;
        this.stats.lastOptimization = null;
        this.setPerformanceLevel('high');
    }
}

// グローバルインスタンス（遅延初期化）
let _performanceOptimizer = null;

export function getPerformanceOptimizer() {
    if (!_performanceOptimizer) {
        _performanceOptimizer = new PerformanceOptimizer();
    }
    return _performanceOptimizer;
}

// 後方互換性のため
export const performanceOptimizer = getPerformanceOptimizer;