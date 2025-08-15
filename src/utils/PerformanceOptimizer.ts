import { getPerformanceConfig } from '../config/PerformanceConfig.js';
import { getErrorHandler } from './ErrorHandler.js';
import { getFrameStabilizer } from './FrameStabilizer.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

// 新しいサブコンポーネントのインポート
import { PerformanceAnalyzer } from './performance-optimizer/PerformanceAnalyzer.js';
import { PerformanceAdaptiveController } from './performance-optimizer/PerformanceAdaptiveController.js';
import { PerformanceStabilizerIntegrator } from './performance-optimizer/PerformanceStabilizerIntegrator.js';

// Type definitions
interface PerformanceStats {
    currentFPS: number;
    averageFPS: number;
    frameTime: number;
    droppedFrames: number;
    optimizationCount: number;
    lastOptimization: Date | null;
    
    // サブコンポーネントから取得する項目
    frameTimeVariance: number;
    stabilityScore: number;
    performanceHealthScore: number;
    predictionAccuracy: number;
    
    // 処理時間内訳
    renderTime: number;
    updateTime: number;
    totalProcessingTime: number;
    memoryPressureLevel: number;
    
    // トレンド
    performanceTrend: 'improving' | 'stable' | 'degrading';
    stabilityTrend: 'improving' | 'stable' | 'degrading';
    issuesPredicted: number;
    issuesActual: number;
}

interface PerformanceSettings {
    maxBubbles: number;
    maxParticles: number;
    renderQuality: number;
    particleQuality: number;
    shadowsEnabled: boolean;
    antialiasing: boolean;
    backgroundEffects: boolean;
    audioProcessing: boolean;
}

interface ComponentConfig {
    maxHistorySize: number;
    targetFPS: number;
    performanceLevel: 'low' | 'medium' | 'high';
}

type PerformanceLevel = 'low' | 'medium' | 'high';

/**
 * パフォーマンス最適化システム（リファクタリング版）
 * 60FPS維持のための動的最適化機能を提供
 * サブコンポーネント化により保守性と可読性を向上
 */
export class PerformanceOptimizer {
    private performanceConfig: any;
    private errorHandler: any;
    
    // 基本設定
    public targetFPS: number;
    public targetFrameTime: number;
    public maxHistorySize: number;
    public performanceLevel: PerformanceLevel;
    public adaptiveMode: boolean;
    public optimizationInterval: number;
    
    // フレーム処理データ
    private frameTimeHistory: number[];
    private lastFrameTime: number | null;
    private lastOptimizationTime: number;
    
    // ログ制御用
    private lastLoggedStabilizerZone: string | null;
    
    // 統合コンポーネント
    private frameStabilizer: any;
    
    // サブコンポーネント
    private analyzer: PerformanceAnalyzer;
    private adaptiveController: PerformanceAdaptiveController;
    private stabilizerIntegrator: PerformanceStabilizerIntegrator;
    
    // 統計とアップデート設定
    public stats: PerformanceStats;
    public settings: PerformanceSettings;
    
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
     */
    private _initializeSubComponents(): void {
        try {
            const componentConfig: ComponentConfig = {
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
     */
    private _initializeStats(): PerformanceStats {
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
     */
    private _initializeFromConfig(): void {
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
                maxBubbles: optimizationConfig.maxBubbles || 50,
                maxParticles: optimizationConfig.maxParticles || 100,
                renderQuality: qualityConfig.renderQuality || 1.0,
                particleQuality: qualityConfig.particleQuality || 1.0,
                shadowsEnabled: qualityConfig.shadowsEnabled || false,
                antialiasing: qualityConfig.antialiasing || false,
                backgroundEffects: qualityConfig.backgroundEffects || true,
                audioProcessing: qualityConfig.audioProcessing || true
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', {
                component: 'PerformanceOptimizer',
                operation: 'initializeFromConfig'
            });
            this._setFallbackSettings();
        }
    }
    
    /**
     * フォールバック設定を適用
     */
    private _setFallbackSettings(): void {
        this.targetFPS = 60;
        this.targetFrameTime = 16.67;
        this.maxHistorySize = 30;
        this.performanceLevel = "medium";
        this.adaptiveMode = true;
        this.optimizationInterval = 1000;
        
        this.settings = {
            maxBubbles: 50,
            maxParticles: 100,
            renderQuality: 1.0,
            particleQuality: 1.0,
            shadowsEnabled: false,
            antialiasing: false,
            backgroundEffects: true,
            audioProcessing: true
        };
    }
    
    /**
     * 設定変更の監視を設定
     */
    private _setupConfigWatchers(): void {
        // Configuration change monitoring implementation would go here
        // This is a placeholder for the actual implementation
        console.log('[PerformanceOptimizer] Config watchers set up (placeholder)');
    }
    
    /**
     * フレーム時間を記録し最適化を実行
     */
    recordFrameTime(frameTime: number): void {
        try {
            this.frameTimeHistory.push(frameTime);
            if (this.frameTimeHistory.length > this.maxHistorySize) {
                this.frameTimeHistory.shift();
            }
            
            // サブコンポーネントに委譲
            this.analyzer.recordFrameTime(frameTime);
            
            const currentTime = performance.now();
            if (currentTime - this.lastOptimizationTime > this.optimizationInterval) {
                this.optimize();
                this.lastOptimizationTime = currentTime;
            }
            
            this.lastFrameTime = frameTime;
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', {
                component: 'PerformanceOptimizer',
                operation: 'recordFrameTime',
                frameTime
            });
        }
    }
    
    /**
     * パフォーマンス最適化を実行
     */
    optimize(): void {
        try {
            // サブコンポーネントから分析結果を取得
            const analysis = this.analyzer.getAnalysis();
            
            // 適応制御による設定調整
            const adjustments = this.adaptiveController.calculateAdjustments(analysis);
            
            // 設定適用
            this._applyAdjustments(adjustments);
            
            // Frame Stabilizer統合
            this.stabilizerIntegrator.integrateWithStabilizer(this.frameStabilizer, analysis);
            
            // 統計更新
            this.stats.optimizationCount++;
            this.stats.lastOptimization = new Date();
            
            console.log('[PerformanceOptimizer] Optimization completed', adjustments);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'PERFORMANCE_ERROR', {
                component: 'PerformanceOptimizer',
                operation: 'optimize'
            });
        }
    }
    
    /**
     * 最適化調整を適用
     */
    private _applyAdjustments(adjustments: any): void {
        if (adjustments.settings) {
            Object.assign(this.settings, adjustments.settings);
        }
        
        if (adjustments.performanceLevel) {
            this.performanceLevel = adjustments.performanceLevel;
        }
    }
    
    /**
     * 現在の統計を取得
     */
    getStats(): PerformanceStats {
        // サブコンポーネントから最新統計を集約
        const analysisStats = this.analyzer.getStats();
        const controllerStats = this.adaptiveController.getStats();
        const stabilizerStats = this.stabilizerIntegrator.getStats();
        
        return {
            ...this.stats,
            ...analysisStats,
            ...controllerStats,
            ...stabilizerStats
        };
    }
    
    /**
     * 現在の設定を取得
     */
    getSettings(): PerformanceSettings {
        return { ...this.settings };
    }
    
    /**
     * パフォーマンスレベルを設定
     */
    setPerformanceLevel(level: PerformanceLevel): void {
        this.performanceLevel = level;
        if (this.adaptiveController) {
            this.adaptiveController.setPerformanceLevel(level);
        }
    }
    
    /**
     * 適応モードを切り替え
     */
    setAdaptiveMode(enabled: boolean): void {
        this.adaptiveMode = enabled;
        if (this.adaptiveController) {
            this.adaptiveController.setAdaptiveMode(enabled);
        }
    }
}