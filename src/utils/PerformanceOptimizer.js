import { getPerformanceConfig } from '../config/PerformanceConfig.js';
import { getErrorHandler } from './ErrorHandler.js';
import { getFrameStabilizer } from './FrameStabilizer.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

// 新しいサブコンポーネントのインポート
import { PerformanceAnalyzer } from './performance-optimizer/PerformanceAnalyzer.js';
import { PerformanceAdaptiveController } from './performance-optimizer/PerformanceAdaptiveController.js';
import { PerformanceStabilizerIntegrator } from './performance-optimizer/PerformanceStabilizerIntegrator.js';

/**
 * パフォーマンス最適化システム（リファクタリング版）
 * 60FPS維持のための動的最適化機能を提供
 * サブコンポーネント化により保守性と可読性を向上
 */
export class PerformanceOptimizer {
    constructor() {
        try {
            // 設定とエラーハンドラー初期化
            this.performanceConfig = getPerformanceConfig();
            this.errorHandler = getErrorHandler();
            
            // 設定から初期値を取得
            this._initializeFromConfig();
            
            // 基本フレーム処理データ
            this.frameTimeHistory = [];
            this.lastFrameTime = null;
            this.lastOptimizationTime = 0;
            
            // ログ制御用
            this.lastLoggedStabilizerZone = null;
            
            // Frame Stabilizer統合
            this.frameStabilizer = getFrameStabilizer(this.targetFPS);
            
            // サブコンポーネント初期化
            this._initializeSubComponents();
            
            // 基本統計（サブコンポーネントから集約）
            this.stats = this._initializeStats();
            
            // 設定変更の監視
            this._setupConfigWatchers();
            
            console.log('[PerformanceOptimizer] サブコンポーネント統合版で初期化完了');
            
        } catch (error) {
            if (this.errorHandler && this.errorHandler.handleError) {
                this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', {
                    component: 'PerformanceOptimizer',
                    operation: 'constructor'
                });
            } else {
                console.error('[PerformanceOptimizer] Failed to initialize:', error);
            }
            this._setFallbackSettings();
        }
    }
    
    /**
     * サブコンポーネントを初期化
     * @private
     */
    _initializeSubComponents() {
        try {
            const componentConfig = {
                maxHistorySize: this.maxHistorySize,
                targetFPS: this.targetFPS,
                performanceLevel: this.performanceLevel
            };
            
            // フレーム解析コンポーネント
            this.analyzer = new PerformanceAnalyzer(componentConfig);
            
            // 適応制御コンポーネント
            this.adaptiveController = new PerformanceAdaptiveController(componentConfig);
            this.adaptiveController.setPerformanceLevel(this.performanceLevel);
            this.adaptiveController.setAdaptiveMode(this.adaptiveMode);
            
            // 安定化統合コンポーネント
            this.stabilizerIntegrator = new PerformanceStabilizerIntegrator(componentConfig);
            
            console.log('[PerformanceOptimizer] All sub-components initialized successfully');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', {
                component: 'PerformanceOptimizer',
                operation: 'initializeSubComponents'
            });
            throw error;
        }
    }
    
    /**
     * 統計オブジェクトを初期化
     * @private
     * @returns {object} 初期統計
     */
    _initializeStats() {
        return {
            currentFPS: 60,
            averageFPS: 60,
            frameTime: 16.67,
            droppedFrames: 0,
            optimizationCount: 0,
            lastOptimization: null,
            
            // サブコンポーネントから取得する項目
            frameTimeVariance: 0,
            stabilityScore: 1.0,
            performanceHealthScore: 1.0,
            predictionAccuracy: 0,
            
            // 処理時間内訳
            renderTime: 0,
            updateTime: 0,
            totalProcessingTime: 0,
            memoryPressureLevel: 0,
            
            // トレンド（サブコンポーネントから集約）
            performanceTrend: 'stable',
            stabilityTrend: 'stable',
            issuesPredicted: 0,
            issuesActual: 0
        };
    }
    
    /**
     * 設定から初期値を設定
     * @private
     */
    _initializeFromConfig() {
        try {
            const optimizationConfig = this.performanceConfig.getOptimizationConfig();
            const qualityConfig = this.performanceConfig.getQualityConfig();
            
            this.targetFPS = optimizationConfig ? optimizationConfig.targetFPS || 60 : 60;
            this.targetFrameTime = 1000 / this.targetFPS;
            this.maxHistorySize = optimizationConfig ? optimizationConfig.maxHistorySize || 30 : 30;
            this.performanceLevel = optimizationConfig ? optimizationConfig.performanceLevel || "medium" : "medium";
            this.adaptiveMode = optimizationConfig ? (optimizationConfig.adaptiveMode !== undefined ? optimizationConfig.adaptiveMode : true) : true;
            this.optimizationInterval = optimizationConfig ? optimizationConfig.optimizationInterval || 1000 : 1000;
            
            this.settings = {
                maxBubbles: optimizationConfig.maxBubbles,
                maxParticles: optimizationConfig.maxParticles,
                renderQuality: qualityConfig.renderQuality,
                particleQuality: qualityConfig.particleQuality,
                effectQuality: qualityConfig.effectQuality,
                audioQuality: qualityConfig.audioQuality,
                shadowsEnabled: qualityConfig.enableShadows,
                blurEnabled: qualityConfig.enableBlur,
                antiAliasingEnabled: qualityConfig.enableAntiAliasing
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to initialize from config' });
            this._setFallbackSettings();
        }
    }
    
    /**
     * フォールバック設定を適用
     * @private
     */
    _setFallbackSettings() {
        try {
            // ConfigurationManagerから設定を取得を試行
            const configManager = getConfigurationManager();
            
            this.targetFPS = configManager.get('performance', 'optimization.targetFPS', 60);
            this.targetFrameTime = 1000 / this.targetFPS;
            this.maxHistorySize = configManager.get('performance', 'optimization.maxHistorySize', 120);
            this.performanceLevel = configManager.get('performance', 'optimization.performanceLevel', 'medium');
            this.adaptiveMode = configManager.get('performance', 'optimization.adaptiveMode', true);
            this.optimizationInterval = configManager.get('performance', 'optimization.optimizationInterval', 1000);
            
            this.settings = {
                maxBubbles: configManager.get('performance', 'optimization.maxBubbles', 50),
                maxParticles: configManager.get('performance', 'optimization.maxParticles', 200),
                renderQuality: configManager.get('performance', 'quality.renderQuality', 0.8),
                particleQuality: configManager.get('performance', 'quality.particleQuality', 0.8),
                effectQuality: configManager.get('performance', 'quality.effectQuality', 0.8),
                audioQuality: configManager.get('performance', 'quality.audioQuality', 0.8),
                shadowsEnabled: configManager.get('performance', 'quality.enableShadows', false),
                blurEnabled: configManager.get('performance', 'quality.enableBlur', false),
                antiAliasingEnabled: configManager.get('performance', 'quality.enableAntiAliasing', false)
            };
            
            console.log('[PerformanceOptimizer] Using ConfigurationManager fallback settings');
        } catch (error) {
            // 最終フォールバック
            this.targetFPS = 60;
            this.targetFrameTime = 16.67;
            this.maxHistorySize = 120;
            this.performanceLevel = 'medium';
            this.adaptiveMode = true;
            this.optimizationInterval = 1000;
            
            this.settings = {
                maxBubbles: 50,
                maxParticles: 200,
                renderQuality: 0.8,
                particleQuality: 0.8,
                effectQuality: 0.8,
                audioQuality: 0.8,
                shadowsEnabled: false,
                blurEnabled: false,
                antiAliasingEnabled: false
            };
            
            console.warn('[PerformanceOptimizer] Using hard-coded fallback settings due to configuration error:', error);
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        try {
            // 設定監視のメソッドが存在しない場合はスキップ
            console.log('[PerformanceOptimizer] Configuration watchers setup skipped (methods not available)');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to setup config watchers' });
        }
    }
    
    /**
     * フレーム開始処理（メインエントリポイント）
     * @param {number} currentTime - 現在時刻
     */
    startFrame(currentTime) {
        try {
            // フレーム時間計算
            const frameTime = this.lastFrameTime ? currentTime - this.lastFrameTime : this.targetFrameTime;
            this.lastFrameTime = currentTime;
            
            // フレーム時間をアナライザーに記録
            this.analyzer.recordFrameTime(frameTime);
            
            // 基本統計更新
            this._updateBasicStats(frameTime);
            
            // 適応最適化（間隔チェック付き）
            if (this.adaptiveMode && currentTime - this.lastOptimizationTime > this.optimizationInterval) {
                this._performOptimization(currentTime);
            }
            
            // Frame Stabilizer統合
            this._integrateFrameStabilizer();
            
            // 統計をサブコンポーネントから集約
            this._aggregateStats();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Error in startFrame' });
        }
    }

    /**
     * 更新頻度を調整（テスト互換性のため）
     * Issue #106: テストで期待されるメソッド
     */
    adjustUpdateFrequency(deltaTime) {
        try {
            // フレームレートに基づいてデルタタイムを調整
            const targetFrameTime = 1000 / this.targetFPS;
            const adjustmentFactor = Math.min(deltaTime / targetFrameTime, 2); // 最大2倍まで
            
            // パフォーマンスレベルに基づく調整
            const performanceFactor = this.stats.performanceLevel >= 0.8 ? 1 : 0.5;
            
            return deltaTime * adjustmentFactor * performanceFactor;
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', {
                component: 'PerformanceOptimizer',
                operation: 'adjustUpdateFrequency'
            });
            return deltaTime; // フォールバック
        }
    }
    
    /**
     * 最適化を実行
     * @private
     * @param {number} currentTime - 現在時刻
     */
    _performOptimization(currentTime) {
        try {
            // アナライザーから安定性分析を取得
            const stabilityAnalysis = this.analyzer.analyzeFrameStability();
            
            // パフォーマンス予測を実行
            const prediction = this.analyzer.predictPerformanceIssues();
            
            // 適応制御を実行
            const adaptiveResult = this.adaptiveController.performAdaptiveOptimization({
                stabilityScore: stabilityAnalysis.stabilityScore,
                variance: stabilityAnalysis.variance,
                trend: stabilityAnalysis.trend
            });
            
            // 積極最適化（必要な場合）
            if (prediction.overallRisk > 0.6) {
                const proactiveResult = this.adaptiveController.performProactiveOptimization(prediction);
                
                if (proactiveResult.optimized) {
                    console.log(`[PerformanceOptimizer] Proactive optimization applied: ${proactiveResult.actions.join(', ')}`);
                }
            }
            
            // 最適化時刻更新
            this.lastOptimizationTime = currentTime;
            
            // 統計更新
            if (adaptiveResult.optimized) {
                this.stats.optimizationCount++;
                this.stats.lastOptimization = {
                    time: currentTime,
                    level: adaptiveResult.level,
                    reason: adaptiveResult.reason,
                    type: 'adaptive'
                };
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to perform optimization' });
        }
    }
    
    /**
     * Frame Stabilizerとの統合
     * @private
     */
    _integrateFrameStabilizer() {
        try {
            if (!this.frameStabilizer) return;
            
            const stabilizerStatus = this.frameStabilizer.getStabilizationStatus();
            if (stabilizerStatus) {
                const integrationResult = this.stabilizerIntegrator.integrateStabilizerRecommendations(stabilizerStatus);
                
                if (integrationResult.integrated) {
                    // ログ出力頻度を制御（前回と異なるゾーンの場合のみ）
                    if (this.lastLoggedStabilizerZone !== integrationResult.currentZone) {
                        console.log(`[PerformanceOptimizer] Stabilizer integration completed: ${integrationResult.currentZone} zone`);
                        this.lastLoggedStabilizerZone = integrationResult.currentZone;
                    }
                }
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to integrate frame stabilizer' });
        }
    }
    
    /**
     * 基本統計を更新
     * @private
     * @param {number} frameTime - フレーム時間
     */
    _updateBasicStats(frameTime) {
        try {
            // フレーム時間履歴更新
            this.frameTimeHistory.push(frameTime);
            if (this.frameTimeHistory.length > this.maxHistorySize) {
                this.frameTimeHistory.shift();
            }
            
            // FPS計算
            this.stats.frameTime = frameTime;
            this.stats.currentFPS = Math.round(1000 / frameTime);
            
            // 平均FPS計算（最近のフレーム基準）
            if (this.frameTimeHistory.length >= 10) {
                const recentFrames = this.frameTimeHistory.slice(-60); // 1秒分
                const avgFrameTime = recentFrames.reduce((sum, ft) => sum + ft, 0) / recentFrames.length;
                this.stats.averageFPS = Math.round(1000 / avgFrameTime);
            }
            
            // ドロップフレーム検出
            if (frameTime > this.targetFrameTime * 1.5) {
                this.stats.droppedFrames++;
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to update basic stats' });
        }
    }
    
    /**
     * サブコンポーネントから統計を集約
     * @private
     */
    _aggregateStats() {
        try {
            // アナライザーから統計取得
            const analyzerStats = this.analyzer.getStats();
            this.stats.frameTimeVariance = analyzerStats.frameTimeVariance;
            this.stats.stabilityScore = analyzerStats.stabilityScore;
            this.stats.performanceTrend = analyzerStats.performanceTrend;
            
            // 適応コントローラーから設定取得
            const controllerSettings = this.adaptiveController.getSettings();
            this.performanceLevel = controllerSettings.performanceLevel;
            
            // 健全性スコア計算
            this.stats.performanceHealthScore = this._calculateHealthScore();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to aggregate stats' });
        }
    }
    
    /**
     * パフォーマンス健全性スコアを計算
     * @private
     * @returns {number} 健全性スコア（0-1）
     */
    _calculateHealthScore() {
        try {
            const fpsScore = Math.min(1, this.stats.currentFPS / this.targetFPS);
            const stabilityScore = this.stats.stabilityScore;
            const varianceScore = Math.max(0, 1 - this.stats.frameTimeVariance / 10);
            
            return (fpsScore * 0.4 + stabilityScore * 0.4 + varianceScore * 0.2);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to calculate health score' });
            return 0.5;
        }
    }
    
    // =============================================================================
    // 公開APIメソッド（後方互換性維持）
    // =============================================================================
    
    /**
     * パフォーマンス統計を取得
     * @returns {object} 統計データ
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 詳細なパフォーマンス分析を取得
     * @returns {object} 詳細分析結果
     */
    analyzePerformance() {
        try {
            const stabilityAnalysis = this.analyzer.analyzeFrameStability();
            const frameStabilityAnalysis = this.stabilizerIntegrator.getFrameStabilityAnalysis();
            const prediction = this.analyzer.predictPerformanceIssues();
            
            return {
                timestamp: Date.now(),
                basic: this.getStats(),
                stability: stabilityAnalysis,
                frameStability: frameStabilityAnalysis,
                prediction: prediction,
                performance: {
                    level: this.performanceLevel,
                    adaptiveMode: this.adaptiveMode,
                    settings: { ...this.settings }
                }
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to analyze performance' });
            return { error: true, timestamp: Date.now() };
        }
    }
    
    /**
     * 詳細パフォーマンスメトリクスを取得
     * @returns {object} 詳細メトリクス
     */
    getDetailedPerformanceMetrics() {
        try {
            const analyzerDetails = this.analyzer.getDetailedAnalysis();
            const controllerSettings = this.adaptiveController.getSettings();
            const stabilizerSettings = this.stabilizerIntegrator.getIntegrationSettings();
            
            return {
                timestamp: Date.now(),
                analyzer: analyzerDetails,
                controller: controllerSettings,
                stabilizer: stabilizerSettings,
                overall: this.getStats()
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to get detailed metrics' });
            return { error: true, timestamp: Date.now() };
        }
    }
    
    /**
     * フレーム安定性分析を取得（統合版）
     * @returns {object} 統合された安定性分析
     */
    getFrameStabilityAnalysis() {
        try {
            return this.stabilizerIntegrator.getFrameStabilityAnalysis();
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to get frame stability analysis' });
            return { error: true, timestamp: Date.now() };
        }
    }
    
    /**
     * 強制フレーム安定化
     * @param {number} targetFPS - 目標FPS
     * @param {string} mode - 安定化モード
     * @returns {object} 安定化結果
     */
    forceFrameStabilization(targetFPS, mode = 'balanced') {
        try {
            return this.stabilizerIntegrator.forceFrameStabilization(targetFPS, mode);
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to force frame stabilization' });
            return { forced: false, error: true };
        }
    }
    
    /**
     * パフォーマンスレベルを設定
     * @param {string} level - パフォーマンスレベル
     */
    setPerformanceLevel(level) {
        try {
            this.performanceLevel = level;
            this.adaptiveController.setPerformanceLevel(level);
            
            // 設定をPerformanceConfigに反映
            this.performanceConfig.setPerformanceLevel(level);
            
            console.log(`[PerformanceOptimizer] Performance level set to: ${level}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to set performance level' });
        }
    }
    
    /**
     * 適応モードを設定
     * @param {boolean} enabled - 適応モード有効フラグ
     */
    setAdaptiveMode(enabled) {
        try {
            this.adaptiveMode = enabled;
            this.adaptiveController.setAdaptiveMode(enabled);
            
            console.log(`[PerformanceOptimizer] Adaptive mode ${enabled ? 'enabled' : 'disabled'}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to set adaptive mode' });
        }
    }
    
    // =============================================================================
    // 設定取得メソッド（後方互換性維持）
    // =============================================================================
    
    getMaxBubbles() { return this.settings.maxBubbles; }
    getMaxParticles() { return this.settings.maxParticles; }
    getRenderQuality() { return this.settings.renderQuality; }
    getParticleQuality() { return this.settings.particleQuality; }
    getEffectQuality() { return this.settings.effectQuality; }
    getAudioQuality() { return this.settings.audioQuality; }
    getShadowsEnabled() { return this.settings.shadowsEnabled; }
    getBlurEnabled() { return this.settings.blurEnabled; }
    getAntiAliasingEnabled() { return this.settings.antiAliasingEnabled; }
    
    // 後方互換性のためのエイリアス
    areShadowsEnabled() { return this.getShadowsEnabled(); }
    isBlurEnabled() { return this.getBlurEnabled(); }
    isAntiAliasingEnabled() { return this.getAntiAliasingEnabled(); }
    
    // =============================================================================
    // 設定変更メソッド（後方互換性維持）
    // =============================================================================
    
    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.targetFrameTime = 1000 / fps;
        this.performanceConfig.setTargetFPS(fps);
    }
    
    setMaxBubbles(count) {
        this.settings.maxBubbles = count;
        this.performanceConfig.setMaxBubbles(count);
    }
    
    setMaxParticles(count) {
        this.settings.maxParticles = count;
        this.performanceConfig.setMaxParticles(count);
    }
    
    setRenderQuality(quality) {
        this.settings.renderQuality = quality;
        this.performanceConfig.setRenderQuality(quality);
    }
    
    setParticleQuality(quality) {
        this.settings.particleQuality = quality;
        this.performanceConfig.setParticleQuality(quality);
    }
    
    setEffectQuality(quality) {
        this.settings.effectQuality = quality;
        this.performanceConfig.setEffectQuality(quality);
    }
    
    setAudioQuality(quality) {
        this.settings.audioQuality = quality;
        this.performanceConfig.setAudioQuality(quality);
    }
    
    setShadowsEnabled(enabled) {
        this.settings.shadowsEnabled = enabled;
        this.performanceConfig.setShadowsEnabled(enabled);
    }
    
    setBlurEnabled(enabled) {
        this.settings.blurEnabled = enabled;
        this.performanceConfig.setBlurEnabled(enabled);
    }
    
    setAntiAliasingEnabled(enabled) {
        this.settings.antiAliasingEnabled = enabled;
        this.performanceConfig.setAntiAliasingEnabled(enabled);
    }
    
    // =============================================================================
    // テスト・管理用メソッド
    // =============================================================================
    
    /**
     * 設定と連携してリセット
     */
    reset() {
        try {
            // 統計をリセット
            this.stats = this._initializeStats();
            
            // フレーム履歴をクリア
            this.frameTimeHistory = [];
            this.lastFrameTime = null;
            this.lastOptimizationTime = 0;
            
            // 設定を再読み込み
            this._initializeFromConfig();
            
            // サブコンポーネントをリセット（可能な場合）
            if (this.analyzer && typeof this.analyzer.reset === 'function') {
                this.analyzer.reset();
            }
            if (this.adaptiveController && typeof this.adaptiveController.reset === 'function') {
                this.adaptiveController.reset();
            }
            
            console.log('[PerformanceOptimizer] Reset completed');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to reset PerformanceOptimizer' });
        }
    }
    
    /**
     * 設定と同期
     */
    syncWithConfig() {
        try {
            this._initializeFromConfig();
            console.log('[PerformanceOptimizer] Synchronized with config');
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to sync with config' });
        }
    }
    
    /**
     * 現在の設定を取得
     * @returns {object} 現在の設定
     */
    getCurrentConfig() {
        return {
            targetFPS: this.targetFPS,
            performanceLevel: this.performanceLevel,
            adaptiveMode: this.adaptiveMode,
            settings: { ...this.settings }
        };
    }
    
    /**
     * Canvasリサイズ時の処理
     * @param {object} canvasInfo - Canvas情報
     */
    onCanvasResize(canvasInfo) {
        try {
            if (!canvasInfo) return;
            
            const { width, height, scale } = canvasInfo;
            const totalPixels = width * height * (scale || 1);
            const pixelThreshold = 1920 * 1080; // Full HD基準
            
            // 高解像度の場合はパフォーマンス調整を検討
            if (totalPixels > pixelThreshold * 1.5) {
                console.log('[PerformanceOptimizer] High resolution detected, considering performance adjustment');
                // 必要に応じて品質を調整
                if (this.adaptiveMode && this.performanceLevel === 'high') {
                    this.setPerformanceLevel('medium');
                }
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', { component: 'PerformanceOptimizer', context: 'Failed to handle canvas resize' });
        }
    }
    
    // =============================================================================
    // ユーティリティメソッド（後方互換性維持）
    // =============================================================================
    
    shouldRunEffect(effectType) {
        const quality = this.getEffectQuality();
        if (quality === 'off') return false;
        if (quality === 'low' && effectType === 'advanced') return false;
        return true;
    }
    
    shouldPlayAudio(audioType) {
        const quality = this.getAudioQuality();
        if (quality === 'off') return false;
        if (quality === 'low' && audioType === 'effect') return false;
        return true;
    }
    
    checkMemoryUsage() {
        if (performance.memory) {
            const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.jsHeapSizeLimit,
                percentage: Math.round(usage * 100),
                status: usage > 0.8 ? 'critical' : usage > 0.6 ? 'high' : 'normal'
            };
        }
        return { status: 'unknown' };
    }
    
    getWarnings() {
        const warnings = [];
        
        if (this.stats.currentFPS < 30) {
            warnings.push('FPSが30を下回っています');
        }
        
        if (this.stats.stabilityScore < 0.5) {
            warnings.push('フレーム安定性が低下しています');
        }
        
        if (this.stats.frameTimeVariance > 10) {
            warnings.push('フレーム時間のばらつきが大きいです');
        }
        
        const memoryStatus = this.checkMemoryUsage();
        if (memoryStatus.status === 'critical') {
            warnings.push('メモリ使用量が危険レベルです');
        }
        
        return warnings;
    }
}

// シングルトンパターンの維持
let _performanceOptimizer = null;

/**
 * PerformanceOptimizerのシングルトンインスタンスを取得
 * @returns {PerformanceOptimizer} インスタンス
 */
export function getPerformanceOptimizer() {
    if (!_performanceOptimizer) {
        _performanceOptimizer = new PerformanceOptimizer();
    }
    return _performanceOptimizer;
}

/**
 * PerformanceOptimizerを再初期化（テスト用）
 * @returns {PerformanceOptimizer} 新しいインスタンス
 */
export function reinitializePerformanceOptimizer() {
    _performanceOptimizer = null;
    return getPerformanceOptimizer();
}

// デフォルトエクスポート（後方互換性）
export default PerformanceOptimizer;