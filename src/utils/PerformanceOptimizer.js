import { getPerformanceConfig } from '../config/PerformanceConfig.js';
import { getErrorHandler } from './ErrorHandler.js';

/**
 * パフォーマンス最適化システム
 * 60FPS維持のための動的最適化機能を提供
 * 新しいPerformanceConfigシステムと統合
 */
export class PerformanceOptimizer {
    constructor() {
        this.performanceConfig = getPerformanceConfig();
        this.errorHandler = getErrorHandler();
        
        // 設定から初期値を取得
        this._initializeFromConfig();
        
        this.frameTimeHistory = [];
        this.lastFrameTime = null;
        this.lastOptimizationTime = 0;
        
        this.stats = {
            currentFPS: 60,
            averageFPS: 60,
            frameTime: 16.67,
            droppedFrames: 0,
            optimizationCount: 0,
            lastOptimization: null
        };
        
        // 設定変更の監視
        this._setupConfigWatchers();
        
        console.log('[PerformanceOptimizer] 新しい設定システムで初期化完了');
    }
    
    /**
     * 設定から初期値を設定
     * @private
     */
    _initializeFromConfig() {
        try {
            const optimizationConfig = this.performanceConfig.getOptimizationConfig();
            const qualityConfig = this.performanceConfig.getQualityConfig();
            
            this.targetFPS = optimizationConfig.targetFPS;
            this.targetFrameTime = 1000 / this.targetFPS;
            this.maxHistorySize = optimizationConfig.maxHistorySize;
            this.performanceLevel = optimizationConfig.performanceLevel;
            this.adaptiveMode = optimizationConfig.adaptiveMode;
            this.optimizationInterval = optimizationConfig.optimizationInterval;
            
            this.settings = {
                maxBubbles: optimizationConfig.maxBubbles,
                maxParticles: optimizationConfig.maxParticles,
                particleQuality: qualityConfig.particleQuality,
                renderQuality: qualityConfig.renderQuality,
                effectQuality: qualityConfig.effectQuality,
                audioQuality: qualityConfig.audioQuality,
                enableShadows: qualityConfig.enableShadows,
                enableBlur: qualityConfig.enableBlur,
                enableAntiAliasing: qualityConfig.enableAntiAliasing
            };
            
            this.originalSettings = { ...this.settings };
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer._initializeFromConfig'
            });
            
            // フォールバック設定
            this._setFallbackSettings();
        }
    }
    
    /**
     * フォールバック設定を適用
     * @private
     */
    _setFallbackSettings() {
        this.targetFPS = 60;
        this.targetFrameTime = 1000 / this.targetFPS;
        this.maxHistorySize = 30;
        this.performanceLevel = 'high';
        this.adaptiveMode = true;
        this.optimizationInterval = 1000;
        
        this.settings = {
            maxBubbles: 20,
            maxParticles: 500,
            particleQuality: 1.0,
            renderQuality: 1.0,
            effectQuality: 1.0,
            audioQuality: 1.0,
            enableShadows: true,
            enableBlur: true,
            enableAntiAliasing: true
        };
        
        this.originalSettings = { ...this.settings };
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        try {
            this._isUpdatingFromConfig = false; // 循環参照防止フラグ
            
            // 設定変更時の自動更新（循環参照を防ぐ）
            this.performanceConfig.configManager.watch('performance', 'optimization.targetFPS', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.targetFPS = newValue;
                    this.targetFrameTime = 1000 / this.targetFPS;
                    console.log(`[PerformanceOptimizer] 目標FPSを${newValue}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'optimization.adaptiveMode', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.adaptiveMode = newValue;
                    console.log(`[PerformanceOptimizer] 適応モードを${newValue ? '有効' : '無効'}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'optimization.performanceLevel', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this._setPerformanceLevelInternal(newValue);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'optimization.maxBubbles', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.maxBubbles = newValue;
                    console.log(`[PerformanceOptimizer] 最大バブル数を${newValue}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'optimization.maxParticles', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.maxParticles = newValue;
                    console.log(`[PerformanceOptimizer] 最大パーティクル数を${newValue}に更新`);
                }
            });
            
            // 品質設定の監視
            this.performanceConfig.configManager.watch('performance', 'quality.renderQuality', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.renderQuality = newValue;
                    console.log(`[PerformanceOptimizer] レンダリング品質を${newValue}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'quality.particleQuality', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.particleQuality = newValue;
                    console.log(`[PerformanceOptimizer] パーティクル品質を${newValue}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'quality.effectQuality', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.effectQuality = newValue;
                    console.log(`[PerformanceOptimizer] エフェクト品質を${newValue}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'quality.audioQuality', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.audioQuality = newValue;
                    console.log(`[PerformanceOptimizer] 音声品質を${newValue}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'quality.enableShadows', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.enableShadows = newValue;
                    console.log(`[PerformanceOptimizer] 影エフェクトを${newValue ? '有効' : '無効'}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'quality.enableBlur', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.enableBlur = newValue;
                    console.log(`[PerformanceOptimizer] ブラーエフェクトを${newValue ? '有効' : '無効'}に更新`);
                }
            });
            
            this.performanceConfig.configManager.watch('performance', 'quality.enableAntiAliasing', (newValue) => {
                if (!this._isUpdatingFromConfig) {
                    this.settings.enableAntiAliasing = newValue;
                    console.log(`[PerformanceOptimizer] アンチエイリアシングを${newValue ? '有効' : '無効'}に更新`);
                }
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer._setupConfigWatchers'
            });
        }
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
        try {
            if (!['low', 'medium', 'high'].includes(level)) {
                throw new Error(`無効なパフォーマンスレベル: ${level}`);
            }
            
            this._isUpdatingFromConfig = true; // 循環参照防止
            
            this.performanceLevel = level;
            
            // 新しい設定システムを使用してプリセットを適用
            const success = this.performanceConfig.applyQualityPreset(level);
            
            if (success) {
                // 設定を再読み込み
                this._reloadSettingsFromConfig();
                
                this.stats.optimizationCount++;
                this.stats.lastOptimization = {
                    level: level,
                    time: Date.now(),
                    reason: `FPS: ${Math.round(this.stats.averageFPS)}`
                };
                
                console.log(`[PerformanceOptimizer] パフォーマンスレベルを${level}に変更 (FPS: ${Math.round(this.stats.averageFPS)})`);
            } else {
                // フォールバック: 従来の方式
                this._setPerformanceLevelFallback(level);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setPerformanceLevel'
            });
            
            // エラー時のフォールバック
            this._setPerformanceLevelFallback(level);
        } finally {
            this._isUpdatingFromConfig = false; // フラグをリセット
        }
    }
    
    /**
     * 内部用パフォーマンスレベル設定（循環参照なし）
     * @param {string} level - パフォーマンスレベル
     * @private
     */
    _setPerformanceLevelInternal(level) {
        try {
            if (!['low', 'medium', 'high'].includes(level)) {
                return;
            }
            
            this.performanceLevel = level;
            this._reloadSettingsFromConfig();
            
            console.log(`[PerformanceOptimizer] パフォーマンスレベルを${level}に内部更新`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer._setPerformanceLevelInternal'
            });
        }
    }
    
    /**
     * 設定から現在の値を再読み込み
     * @private
     */
    _reloadSettingsFromConfig() {
        try {
            const optimizationConfig = this.performanceConfig.getOptimizationConfig();
            const qualityConfig = this.performanceConfig.getQualityConfig();
            
            this.settings = {
                maxBubbles: optimizationConfig.maxBubbles,
                maxParticles: optimizationConfig.maxParticles,
                particleQuality: qualityConfig.particleQuality,
                renderQuality: qualityConfig.renderQuality,
                effectQuality: qualityConfig.effectQuality,
                audioQuality: qualityConfig.audioQuality,
                enableShadows: qualityConfig.enableShadows,
                enableBlur: qualityConfig.enableBlur,
                enableAntiAliasing: qualityConfig.enableAntiAliasing
            };
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer._reloadSettingsFromConfig'
            });
        }
    }
    
    /**
     * フォールバック用のパフォーマンスレベル設定
     * @param {string} level - パフォーマンスレベル
     * @private
     */
    _setPerformanceLevelFallback(level) {
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
            reason: `FPS: ${Math.round(this.stats.averageFPS)} (fallback)`
        };
        
        console.log(`[PerformanceOptimizer] フォールバック方式でパフォーマンスレベルを${level}に変更`);
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
        try {
            this._isUpdatingFromConfig = true; // 循環参照防止
            
            this.adaptiveMode = enabled;
            
            // 新しい設定システムに反映
            this.performanceConfig.setAdaptiveModeEnabled(enabled);
            
            if (!enabled) {
                this.setPerformanceLevel('high');
            }
            
            console.log(`[PerformanceOptimizer] 適応モードを${enabled ? '有効' : '無効'}に設定`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setAdaptiveMode'
            });
        } finally {
            this._isUpdatingFromConfig = false; // フラグをリセット
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
     * 設定システムとの同期
     * 設定が外部から変更された場合に呼び出す
     */
    syncWithConfig() {
        try {
            console.log('[PerformanceOptimizer] 設定システムと同期中...');
            this._initializeFromConfig();
            console.log('[PerformanceOptimizer] 設定システムとの同期完了');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.syncWithConfig'
            });
        }
    }
    
    /**
     * 目標FPSを動的に変更
     * @param {number} fps - 新しい目標FPS
     */
    setTargetFPS(fps) {
        try {
            this._isUpdatingFromConfig = true; // 循環参照防止
            
            const success = this.performanceConfig.setTargetFPS(fps);
            if (success) {
                this.targetFPS = fps;
                this.targetFrameTime = 1000 / fps;
                console.log(`[PerformanceOptimizer] 目標FPSを${fps}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setTargetFPS'
            });
        } finally {
            this._isUpdatingFromConfig = false; // フラグをリセット
        }
    }
    
    /**
     * 最大バブル数を動的に変更
     * @param {number} count - 新しい最大バブル数
     */
    setMaxBubbles(count) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setMaxBubbles(count);
            if (success) {
                this.settings.maxBubbles = count;
                console.log(`[PerformanceOptimizer] 最大バブル数を${count}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setMaxBubbles'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * 最大パーティクル数を動的に変更
     * @param {number} count - 新しい最大パーティクル数
     */
    setMaxParticles(count) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setMaxParticles(count);
            if (success) {
                this.settings.maxParticles = count;
                console.log(`[PerformanceOptimizer] 最大パーティクル数を${count}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setMaxParticles'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * レンダリング品質を動的に変更
     * @param {number} quality - 新しいレンダリング品質 (0.5-1.0)
     */
    setRenderQuality(quality) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setRenderQuality(quality);
            if (success) {
                this.settings.renderQuality = quality;
                console.log(`[PerformanceOptimizer] レンダリング品質を${quality}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setRenderQuality'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * パーティクル品質を動的に変更
     * @param {number} quality - 新しいパーティクル品質 (0.1-1.0)
     */
    setParticleQuality(quality) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setParticleQuality(quality);
            if (success) {
                this.settings.particleQuality = quality;
                console.log(`[PerformanceOptimizer] パーティクル品質を${quality}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setParticleQuality'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * エフェクト品質を動的に変更
     * @param {number} quality - 新しいエフェクト品質 (0.1-1.0)
     */
    setEffectQuality(quality) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setEffectQuality(quality);
            if (success) {
                this.settings.effectQuality = quality;
                console.log(`[PerformanceOptimizer] エフェクト品質を${quality}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setEffectQuality'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * 音声品質を動的に変更
     * @param {number} quality - 新しい音声品質 (0.1-1.0)
     */
    setAudioQuality(quality) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setAudioQuality(quality);
            if (success) {
                this.settings.audioQuality = quality;
                console.log(`[PerformanceOptimizer] 音声品質を${quality}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setAudioQuality'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * 影エフェクトの有効状態を動的に変更
     * @param {boolean} enabled - 影エフェクトの有効状態
     */
    setShadowsEnabled(enabled) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setShadowsEnabled(enabled);
            if (success) {
                this.settings.enableShadows = enabled;
                console.log(`[PerformanceOptimizer] 影エフェクトを${enabled ? '有効' : '無効'}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setShadowsEnabled'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * ブラーエフェクトの有効状態を動的に変更
     * @param {boolean} enabled - ブラーエフェクトの有効状態
     */
    setBlurEnabled(enabled) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setBlurEnabled(enabled);
            if (success) {
                this.settings.enableBlur = enabled;
                console.log(`[PerformanceOptimizer] ブラーエフェクトを${enabled ? '有効' : '無効'}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setBlurEnabled'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * アンチエイリアシングの有効状態を動的に変更
     * @param {boolean} enabled - アンチエイリアシングの有効状態
     */
    setAntiAliasingEnabled(enabled) {
        try {
            this._isUpdatingFromConfig = true;
            const success = this.performanceConfig.setAntiAliasingEnabled(enabled);
            if (success) {
                this.settings.enableAntiAliasing = enabled;
                console.log(`[PerformanceOptimizer] アンチエイリアシングを${enabled ? '有効' : '無効'}に変更`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.setAntiAliasingEnabled'
            });
        } finally {
            this._isUpdatingFromConfig = false;
        }
    }
    
    /**
     * 設定システムから現在の設定を取得
     * @returns {Object} 現在の設定
     */
    getCurrentConfig() {
        try {
            return {
                optimization: this.performanceConfig.getOptimizationConfig(),
                quality: this.performanceConfig.getQualityConfig(),
                limits: this.performanceConfig.getResourceLimitConfig()
            };
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.getCurrentConfig'
            });
            return null;
        }
    }
    
    /**
     * 最適化システムをリセット
     */
    reset() {
        try {
            this.frameTimeHistory = [];
            this.stats.droppedFrames = 0;
            this.stats.optimizationCount = 0;
            this.stats.lastOptimization = null;
            this.setPerformanceLevel('high');
            
            console.log('[PerformanceOptimizer] システムをリセットしました');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceOptimizer.reset'
            });
        }
    }
}

// グローバルインスタンス（遅延初期化）
let _performanceOptimizer = null;

export function getPerformanceOptimizer() {
    if (!_performanceOptimizer) {
        try {
            _performanceOptimizer = new PerformanceOptimizer();
            console.log('[PerformanceOptimizer] グローバルインスタンスを作成しました');
        } catch (error) {
            console.error('[PerformanceOptimizer] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _performanceOptimizer = new PerformanceOptimizer();
        }
    }
    return _performanceOptimizer;
}

/**
 * PerformanceOptimizerインスタンスを再初期化
 * 設定システムが更新された場合に使用
 */
export function reinitializePerformanceOptimizer() {
    try {
        if (_performanceOptimizer) {
            console.log('[PerformanceOptimizer] インスタンスを再初期化中...');
            _performanceOptimizer.syncWithConfig();
        } else {
            _performanceOptimizer = new PerformanceOptimizer();
        }
        console.log('[PerformanceOptimizer] 再初期化完了');
    } catch (error) {
        console.error('[PerformanceOptimizer] 再初期化エラー:', error);
    }
}

// 後方互換性のため
export const performanceOptimizer = getPerformanceOptimizer;