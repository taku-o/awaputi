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
        
        // Enhanced stability analysis
        this.stabilityAnalysis = {
            frameTimeBuffer: [], // Detailed frame time tracking
            performanceSnapshots: [], // Performance state snapshots
            issueHistory: [], // Detected performance issues
            predictionModel: {
                weights: { fps: 0.4, variance: 0.3, memory: 0.2, trend: 0.1 },
                confidence: 0.5
            }
        };
        
        // Performance predictions
        this.performancePredictions = {
            nextFrameTime: 16.67,
            expectedFPS: 60,
            memoryGrowthRate: 0,
            stabilityForecast: 'stable',
            confidenceLevel: 0.5
        };
        
        // Performance thresholds for warnings
        this.performanceThresholds = {
            criticalFPS: 30,
            warningFPS: 45,
            maxFrameVariance: 10,
            maxMemoryGrowth: 0.1, // 10% per minute
            stabilityThreshold: 0.7
        };
        
        this.stats = {
            currentFPS: 60,
            averageFPS: 60,
            frameTime: 16.67,
            droppedFrames: 0,
            optimizationCount: 0,
            lastOptimization: null,
            // Enhanced stability metrics
            frameTimeVariance: 0,
            stabilityScore: 1.0,
            performanceHealthScore: 1.0,
            predictionAccuracy: 0,
            // Detailed performance breakdown
            renderTime: 0,
            updateTime: 0,
            totalProcessingTime: 0,
            memoryPressureLevel: 0,
            // Historical tracking for predictions
            performanceTrend: 'stable', // 'improving', 'degrading', 'stable'
            stabilityTrend: 'stable',
            issuesPredicted: 0,
            issuesActual: 0
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
        const startProcessingTime = performance.now();
        
        if (this.lastFrameTime) {
            const frameTime = currentTime - this.lastFrameTime;
            this.frameTimeHistory.push(frameTime);
            
            if (this.frameTimeHistory.length > this.maxHistorySize) {
                this.frameTimeHistory.shift();
            }
            
            // Enhanced statistics update
            this.stats.frameTime = frameTime;
            this.stats.currentFPS = 1000 / frameTime;
            this.stats.averageFPS = 1000 / (this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length);
            
            // Enhanced frame drop detection with severity classification
            if (frameTime > this.targetFrameTime * 2.0) {
                this.stats.droppedFrames++;
                this.recordPerformanceIssue('severe_frame_drop', { frameTime, threshold: this.targetFrameTime * 2.0 });
            } else if (frameTime > this.targetFrameTime * 1.5) {
                this.stats.droppedFrames++;
                this.recordPerformanceIssue('moderate_frame_drop', { frameTime, threshold: this.targetFrameTime * 1.5 });
            }
            
            // Enhanced stability analysis
            if (this.frameTimeHistory.length >= 10) {
                const stabilityInfo = this.analyzeFrameStability();
                this.stats.frameTimeVariance = stabilityInfo.variance;
                this.stats.stabilityScore = stabilityInfo.stabilityScore;
                this.stats.performanceTrend = stabilityInfo.trend;
                
                // Update stability trend
                this.updateStabilityTrend(stabilityInfo);
            }
            
            // Predictive analysis (every 5 seconds to avoid overhead)
            if (currentTime - this.lastOptimizationTime > 5000) {
                const prediction = this.predictPerformanceIssues();
                this.stats.performanceHealthScore = prediction.healthScore;
                
                // Update performance trend based on predictions
                this.updatePerformanceTrend(prediction);
                
                // Proactive optimization based on predictions
                if (prediction.healthScore < 0.4) {
                    this.recordPerformanceIssue('predicted_performance_degradation', { 
                        healthScore: prediction.healthScore,
                        confidence: prediction.confidence 
                    });
                    
                    if (this.adaptiveMode) {
                        this.performProactiveOptimization(prediction);
                    }
                }
            }
            
            // Standard adaptive optimization
            if (this.adaptiveMode && currentTime - this.lastOptimizationTime > this.optimizationInterval) {
                this.performAdaptiveOptimization();
                this.lastOptimizationTime = currentTime;
            }
            
            // Memory pressure monitoring
            this.updateMemoryPressureLevel();
        }
        
        this.lastFrameTime = currentTime;
        this.stats.totalProcessingTime = performance.now() - startProcessingTime;
    }
    
    /**
     * Record performance issue for tracking and analysis
     * @param {string} issueType - Type of performance issue
     * @param {object} details - Additional details
     */
    recordPerformanceIssue(issueType, details) {
        const issue = {
            type: issueType,
            timestamp: Date.now(),
            details: details,
            currentFPS: this.stats.currentFPS,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
        };
        
        this.stabilityAnalysis.issueHistory.push(issue);
        
        // Keep only recent issues (last 50)
        if (this.stabilityAnalysis.issueHistory.length > 50) {
            this.stabilityAnalysis.issueHistory.shift();
        }
        
        console.log(`[PerformanceOptimizer] Performance issue recorded: ${issueType}`, details);
    }
    
    /**
     * Update stability trend based on recent analysis
     * @param {object} stabilityInfo - Current stability analysis
     */
    updateStabilityTrend(stabilityInfo) {
        const recentSnapshots = this.stabilityAnalysis.performanceSnapshots.slice(-5);
        
        if (recentSnapshots.length < 3) {
            this.stats.stabilityTrend = 'insufficient_data';
            return;
        }
        
        const avgStability = recentSnapshots.reduce((sum, snapshot) => 
            sum + (snapshot.metrics.stabilityScore || 0.5), 0) / recentSnapshots.length;
        
        const currentStability = stabilityInfo.stabilityScore;
        
        if (currentStability > avgStability + 0.1) {
            this.stats.stabilityTrend = 'improving';
        } else if (currentStability < avgStability - 0.1) {
            this.stats.stabilityTrend = 'degrading';
        } else {
            this.stats.stabilityTrend = 'stable';
        }
    }
    
    /**
     * Update performance trend based on predictions
     * @param {object} prediction - Performance prediction results
     */
    updatePerformanceTrend(prediction) {
        if (prediction.healthScore > 0.8) {
            this.stats.performanceTrend = 'excellent';
        } else if (prediction.healthScore > 0.6) {
            this.stats.performanceTrend = 'good';
        } else if (prediction.healthScore > 0.4) {
            this.stats.performanceTrend = 'concerning';
        } else {
            this.stats.performanceTrend = 'critical';
        }
    }
    
    /**
     * Perform proactive optimization based on predictions
     * @param {object} prediction - Performance prediction results
     */
    performProactiveOptimization(prediction) {
        console.log('[PerformanceOptimizer] Performing proactive optimization based on predictions');
        
        if (prediction.memoryIssueRisk > 0.7) {
            // Proactive memory management
            if (window.gc && typeof window.gc === 'function') {
                window.gc();
            }
            console.log('[PerformanceOptimizer] Proactive memory cleanup triggered');
        }
        
        if (prediction.performanceDegradationRisk > 0.8) {
            // Aggressive quality reduction
            this.degradePerformance();
            console.log('[PerformanceOptimizer] Proactive quality reduction triggered');
        } else if (prediction.performanceDegradationRisk > 0.6) {
            // Moderate optimization
            if (this.performanceLevel === 'high') {
                this.setPerformanceLevel('medium');
            }
            console.log('[PerformanceOptimizer] Proactive quality adjustment triggered');
        }
        
        // Update optimization count for proactive actions
        this.stats.optimizationCount++;
        this.stats.lastOptimization = {
            level: this.performanceLevel,
            time: Date.now(),
            reason: `Proactive: Health ${Math.round(prediction.healthScore * 100)}%`,
            type: 'proactive'
        };
    }
    
    /**
     * Update memory pressure level
     */
    updateMemoryPressureLevel() {
        if (!performance.memory) {
            this.stats.memoryPressureLevel = 0;
            return;
        }
        
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        const usage = used / limit;
        
        if (usage > 0.9) {
            this.stats.memoryPressureLevel = 5; // Critical
        } else if (usage > 0.8) {
            this.stats.memoryPressureLevel = 4; // High
        } else if (usage > 0.6) {
            this.stats.memoryPressureLevel = 3; // Moderate
        } else if (usage > 0.4) {
            this.stats.memoryPressureLevel = 2; // Low
        } else {
            this.stats.memoryPressureLevel = 1; // Minimal
        }
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
     * Enhanced frame stability analysis
     * @returns {object} 詳細な安定性分析結果
     */
    analyzeFrameStability() {
        const variance = this.calculateFrameTimeVariance();
        const frameCount = this.frameTimeHistory.length;
        
        if (frameCount < 10) {
            return {
                stabilityScore: 1.0,
                variance: 0,
                trend: 'insufficient_data',
                confidence: 0.1
            };
        }
        
        // Stability score calculation (0-1, higher is better)
        const maxAcceptableVariance = 5.0; // 5ms
        const stabilityScore = Math.max(0, 1 - (variance / maxAcceptableVariance));
        
        // Trend analysis using linear regression
        const trend = this.calculatePerformanceTrend();
        
        // Confidence based on data quantity and consistency
        const confidence = Math.min(1.0, frameCount / 60) * (stabilityScore > 0.5 ? 1.0 : 0.5);
        
        // Update internal tracking
        this.stats.frameTimeVariance = variance;
        this.stats.stabilityScore = stabilityScore;
        this.stabilityAnalysis.frameTimeBuffer = [...this.frameTimeHistory];
        
        return {
            stabilityScore,
            variance,
            trend,
            confidence,
            frameCount,
            recommendations: this.generateStabilityRecommendations(stabilityScore, variance, trend)
        };
    }
    
    /**
     * Calculate performance trend using linear regression
     * @returns {string} Trend direction ('improving', 'degrading', 'stable')
     */
    calculatePerformanceTrend() {
        if (this.frameTimeHistory.length < 10) return 'insufficient_data';
        
        const recentFrames = this.frameTimeHistory.slice(-30); // Last 30 frames
        const n = recentFrames.length;
        
        if (n < 5) return 'stable';
        
        // Simple linear regression to detect trend
        const xSum = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
        const ySum = recentFrames.reduce((sum, time) => sum + time, 0);
        const xySum = recentFrames.reduce((sum, time, index) => sum + (time * index), 0);
        const xxSum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares
        
        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        
        // Classify trend based on slope
        if (Math.abs(slope) < 0.1) return 'stable';
        return slope > 0 ? 'degrading' : 'improving';
    }
    
    /**
     * Generate stability recommendations
     * @param {number} stabilityScore - Current stability score
     * @param {number} variance - Frame time variance
     * @param {string} trend - Performance trend
     * @returns {string[]} Recommendations
     */
    generateStabilityRecommendations(stabilityScore, variance, trend) {
        const recommendations = [];
        
        if (stabilityScore < 0.5) {
            recommendations.push('Critical stability issue detected - consider reducing quality settings');
        } else if (stabilityScore < 0.7) {
            recommendations.push('Stability concerns detected - monitor performance closely');
        }
        
        if (variance > 10) {
            recommendations.push('High frame time variance - check for background processes');
        }
        
        if (trend === 'degrading') {
            recommendations.push('Performance degradation trend detected - proactive optimization recommended');
        } else if (trend === 'improving') {
            recommendations.push('Performance improving - consider gradually increasing quality');
        }
        
        return recommendations;
    }
    
    /**
     * Predictive performance issue detection
     * @returns {object} Prediction results
     */
    predictPerformanceIssues() {
        const currentMetrics = this.gatherPerformanceMetrics();
        const prediction = this.runPredictionModel(currentMetrics);
        
        // Update prediction accuracy based on past predictions vs reality
        this.updatePredictionAccuracy(prediction);
        
        // Store prediction for future validation
        this.storePredictionSnapshot(prediction);
        
        return prediction;
    }
    
    /**
     * Gather comprehensive performance metrics
     * @returns {object} Current performance state
     */
    gatherPerformanceMetrics() {
        const memoryInfo = this.checkMemoryUsage();
        const stabilityInfo = this.analyzeFrameStability();
        
        return {
            fps: this.stats.averageFPS,
            frameVariance: stabilityInfo.variance,
            stabilityScore: stabilityInfo.stabilityScore,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
            memoryLimit: performance.memory ? performance.memory.jsHeapSizeLimit : 0,
            droppedFrames: this.stats.droppedFrames,
            timestamp: Date.now(),
            trend: stabilityInfo.trend
        };
    }
    
    /**
     * Run prediction model
     * @param {object} metrics - Current performance metrics
     * @returns {object} Prediction results
     */
    runPredictionModel(metrics) {
        const weights = this.stabilityAnalysis.predictionModel.weights;
        
        // Normalize metrics to 0-1 scale
        const normalizedFPS = Math.min(1, metrics.fps / this.targetFPS);
        const normalizedVariance = Math.max(0, 1 - (metrics.frameVariance / 20));
        const normalizedMemory = metrics.memoryLimit > 0 ? 
            Math.max(0, 1 - (metrics.memoryUsage / metrics.memoryLimit)) : 1;
        
        // Trend impact
        const trendImpact = metrics.trend === 'improving' ? 1.1 : 
                           metrics.trend === 'degrading' ? 0.9 : 1.0;
        
        // Calculate overall health score
        const healthScore = (
            normalizedFPS * weights.fps +
            normalizedVariance * weights.variance +
            normalizedMemory * weights.memory +
            trendImpact * weights.trend
        );
        
        // Predict specific issues
        const predictions = {
            healthScore,
            nextFrameStability: this.predictNextFrameStability(metrics),
            memoryIssueRisk: this.predictMemoryIssueRisk(metrics),
            performanceDegradationRisk: this.predictPerformanceDegradationRisk(metrics),
            recommendedActions: this.generatePredictiveRecommendations(healthScore, metrics),
            confidence: this.calculatePredictionConfidence(metrics),
            timestamp: Date.now()
        };
        
        // Update internal predictions
        this.performancePredictions = {
            nextFrameTime: 1000 / Math.max(30, this.stats.averageFPS * 0.95),
            expectedFPS: Math.max(30, this.stats.averageFPS * 0.95),
            memoryGrowthRate: this.calculateMemoryGrowthRate(),
            stabilityForecast: healthScore > 0.7 ? 'stable' : healthScore > 0.4 ? 'concerning' : 'critical',
            confidenceLevel: predictions.confidence
        };
        
        return predictions;
    }
    
    /**
     * Predict next frame stability
     * @param {object} metrics - Current metrics
     * @returns {number} Predicted stability (0-1)
     */
    predictNextFrameStability(metrics) {
        const recentVariance = this.calculateFrameTimeVariance();
        const baseStability = metrics.stabilityScore;
        
        // Factor in trend
        let trendAdjustment = 0;
        if (metrics.trend === 'improving') trendAdjustment = 0.05;
        else if (metrics.trend === 'degrading') trendAdjustment = -0.05;
        
        return Math.max(0, Math.min(1, baseStability + trendAdjustment));
    }
    
    /**
     * Predict memory issue risk
     * @param {object} metrics - Current metrics
     * @returns {number} Risk level (0-1)
     */
    predictMemoryIssueRisk(metrics) {
        if (!metrics.memoryLimit) return 0.1; // Unknown risk
        
        const memoryUsageRatio = metrics.memoryUsage / metrics.memoryLimit;
        const growthRate = this.calculateMemoryGrowthRate();
        
        // High usage or rapid growth indicates risk
        let riskScore = memoryUsageRatio;
        if (growthRate > 0.05) riskScore += 0.3; // 5% growth per check is concerning
        
        return Math.min(1, riskScore);
    }
    
    /**
     * Predict performance degradation risk
     * @param {object} metrics - Current metrics
     * @returns {number} Risk level (0-1)
     */
    predictPerformanceDegradationRisk(metrics) {
        const fpsRatio = metrics.fps / this.targetFPS;
        const varianceImpact = Math.min(1, metrics.frameVariance / 15);
        const trendImpact = metrics.trend === 'degrading' ? 0.4 : 0;
        
        return Math.min(1, (1 - fpsRatio) + varianceImpact + trendImpact);
    }
    
    /**
     * Calculate memory growth rate
     * @returns {number} Growth rate per minute
     */
    calculateMemoryGrowthRate() {
        const snapshots = this.stabilityAnalysis.performanceSnapshots;
        if (snapshots.length < 2) return 0;
        
        const recent = snapshots.slice(-5); // Last 5 snapshots
        if (recent.length < 2) return 0;
        
        const firstSnapshot = recent[0];
        const lastSnapshot = recent[recent.length - 1];
        const timeDiff = (lastSnapshot.timestamp - firstSnapshot.timestamp) / 1000 / 60; // minutes
        
        if (timeDiff <= 0 || !firstSnapshot.memoryUsage || !lastSnapshot.memoryUsage) return 0;
        
        const memoryDiff = lastSnapshot.memoryUsage - firstSnapshot.memoryUsage;
        const growthRate = memoryDiff / firstSnapshot.memoryUsage / timeDiff;
        
        return Math.max(0, growthRate);
    }
    
    /**
     * Generate predictive recommendations
     * @param {number} healthScore - Overall health score
     * @param {object} metrics - Current metrics
     * @returns {string[]} Recommendations
     */
    generatePredictiveRecommendations(healthScore, metrics) {
        const recommendations = [];
        
        if (healthScore < 0.3) {
            recommendations.push('Critical: Immediate performance intervention required');
            recommendations.push('Reduce quality settings to minimum');
            recommendations.push('Clear memory caches');
        } else if (healthScore < 0.6) {
            recommendations.push('Warning: Performance degradation predicted');
            recommendations.push('Consider reducing particle effects');
            recommendations.push('Monitor memory usage closely');
        } else if (healthScore > 0.8 && this.performanceLevel !== 'high') {
            recommendations.push('Performance headroom available');
            recommendations.push('Consider increasing quality settings');
        }
        
        if (this.predictMemoryIssueRisk(metrics) > 0.7) {
            recommendations.push('High memory pressure predicted - schedule cleanup');
        }
        
        if (metrics.trend === 'degrading') {
            recommendations.push('Performance trend is concerning - proactive optimization needed');
        }
        
        return recommendations;
    }
    
    /**
     * Calculate prediction confidence
     * @param {object} metrics - Current metrics
     * @returns {number} Confidence level (0-1)
     */
    calculatePredictionConfidence(metrics) {
        let confidence = this.stabilityAnalysis.predictionModel.confidence;
        
        // More data = higher confidence
        const dataPoints = this.frameTimeHistory.length;
        if (dataPoints > 60) confidence += 0.2;
        else if (dataPoints > 30) confidence += 0.1;
        
        // Stable trends = higher confidence
        if (metrics.trend === 'stable') confidence += 0.1;
        
        // Consistent performance = higher confidence
        if (metrics.stabilityScore > 0.8) confidence += 0.1;
        
        return Math.min(1, confidence);
    }
    
    /**
     * Update prediction accuracy based on past predictions
     * @param {object} prediction - Current prediction
     */
    updatePredictionAccuracy(prediction) {
        // Compare with actual performance from previous predictions
        const snapshots = this.stabilityAnalysis.performanceSnapshots;
        if (snapshots.length < 2) return;
        
        const previousSnapshot = snapshots[snapshots.length - 2];
        if (!previousSnapshot.prediction) return;
        
        const actualHealthScore = this.gatherPerformanceMetrics().fps / this.targetFPS;
        const predictedHealthScore = previousSnapshot.prediction.healthScore;
        
        const accuracy = 1 - Math.abs(actualHealthScore - predictedHealthScore);
        
        // Update model confidence
        this.stabilityAnalysis.predictionModel.confidence = 
            (this.stabilityAnalysis.predictionModel.confidence * 0.9) + (accuracy * 0.1);
        
        this.stats.predictionAccuracy = accuracy;
    }
    
    /**
     * Store prediction snapshot for future validation
     * @param {object} prediction - Prediction results
     */
    storePredictionSnapshot(prediction) {
        const snapshot = {
            timestamp: Date.now(),
            metrics: this.gatherPerformanceMetrics(),
            prediction: prediction
        };
        
        this.stabilityAnalysis.performanceSnapshots.push(snapshot);
        
        // Keep only recent snapshots (last 100)
        if (this.stabilityAnalysis.performanceSnapshots.length > 100) {
            this.stabilityAnalysis.performanceSnapshots.shift();
        }
    }
    
    /**
     * Get detailed performance analysis
     * @returns {object} Comprehensive performance analysis
     */
    getDetailedPerformanceMetrics() {
        const stability = this.analyzeFrameStability();
        const prediction = this.predictPerformanceIssues();
        const currentMetrics = this.gatherPerformanceMetrics();
        
        return {
            current: currentMetrics,
            stability: stability,
            prediction: prediction,
            trends: {
                performance: this.stats.performanceTrend,
                stability: this.stats.stabilityTrend,
                memoryGrowth: this.calculateMemoryGrowthRate()
            },
            health: {
                overall: prediction.healthScore,
                stability: stability.stabilityScore,
                performance: currentMetrics.fps / this.targetFPS,
                memory: currentMetrics.memoryLimit > 0 ? 
                    1 - (currentMetrics.memoryUsage / currentMetrics.memoryLimit) : 1
            },
            recommendations: [
                ...stability.recommendations,
                ...prediction.recommendedActions
            ]
        };
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