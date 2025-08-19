import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectQualityController } from './EffectQualityController.js';

// Type definitions for performance monitoring
interface FrameRateBuffer {
    timestamps: number[];
    rates: number[];
    bufferSize: number;
    currentRate: number;
}

interface MemoryUsageHistory {
    timestamp: number;
    usage: number;
}

interface RenderStats {
    particlesRendered: number;
    effectsRendered: number;
    drawCalls: number;
    lastResetTime: number;
}

interface CullingStats {
    totalEffects: number;
    culledEffects: number;
    visibleEffects: number;
    offScreenEffects: number;
}

interface WarningThresholds {
    lowFrameRate: number;
    highMemoryUsage: number;
    maxDrawCalls: number;
    maxActiveParticles: number;
}

interface OptimizationSettings {
    cullOffScreen: boolean;
    cullDistance: number;
    maxVisibleParticles: number;
    reduceQualityThreshold: number;
    emergencyCleanupThreshold: number;
}

interface PerformanceStats {
    frameRate: number;
    memoryUsage: number | null;
    renderStats: RenderStats;
    cullingStats: CullingStats;
    activeEffects: number;
    cleanupQueueSize: number;
    qualityLevel: string;
}

type RenderStatsType = 'particle' | 'effect' | 'drawCall';

// Effect interface for culling operations
interface Effect {
    x: number;
    y: number;
    width: number;
    height: number;
    priority?: 'decorative' | 'important' | 'critical';
    poolable?: boolean;
    type?: string;
    id?: string;
    createdTime?: number;
}

// Viewport interface for culling
interface Viewport {
    x: number;
    y: number;
    width: number;
    height: number;
}

// External dependencies interfaces
interface ErrorHandler {
    handleError(error: Error, context?: any): void;
}

interface EffectQualityController {
    updatePerformanceMetrics(currentTime: number, frameRate: number, memoryUsage?: number): void;
    getActiveEffectCounts(): { particles: number; effects: number };
    getCurrentQualityLevel(): string;
    setQualityLevel(level: string): void;
}

// Browser performance memory interface
interface PerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

// Extended Performance interface
interface ExtendedPerformance extends Performance {
    memory?: PerformanceMemory;
}

declare const performance: ExtendedPerformance;

/**
 * エフェクトパフォーマンス監視クラス
 * 
 * リアルタイムパフォーマンス監視とリソースクリーンアップ、
 * エフェクトカリングを行います。
 */
export class EffectPerformanceMonitor {
    private errorHandler: ErrorHandler;
    private qualityController: EffectQualityController;
    
    // パフォーマンス監視設定
    private monitoringEnabled: boolean = true;
    private monitoringInterval: number = 500; // 0.5秒間隔
    private lastMonitoringTime: number = 0;
    
    // フレームレート測定
    private frameTimestamps: number[] = [];
    private frameRateBuffer: number[] = [];
    private readonly frameRateBufferSize: number = 60;
    private currentFrameRate: number = 60;
    
    // メモリ使用量監視
    private memoryCheckInterval: number = 2000; // 2秒間隔
    private lastMemoryCheck: number = 0;
    private memoryUsageHistory: MemoryUsageHistory[] = [];
    private readonly memoryThreshold: number = 100 * 1024 * 1024; // 100MB
    
    // レンダリング統計
    private renderStats: RenderStats = {
        particlesRendered: 0,
        effectsRendered: 0,
        drawCalls: 0,
        lastResetTime: 0
    };
    
    // カリング統計
    private cullingStats: CullingStats = {
        totalEffects: 0,
        culledEffects: 0,
        visibleEffects: 0,
        offScreenEffects: 0
    };
    
    // パフォーマンス警告
    private readonly warningThresholds: WarningThresholds = {
        lowFrameRate: 30,
        highMemoryUsage: 80 * 1024 * 1024, // 80MB
        maxDrawCalls: 1000,
        maxActiveParticles: 300
    };
    
    // 最適化設定
    private optimizationSettings: OptimizationSettings = {
        cullOffScreen: true,
        cullDistance: 50, // 画面外50px以上はカリング
        maxVisibleParticles: 200,
        reduceQualityThreshold: 25, // 25FPS以下で品質低下
        emergencyCleanupThreshold: 20 // 20FPS以下で緊急クリーンアップ
    };
    
    // エフェクト管理
    private activeEffects: Map<string, Effect> = new Map();
    private effectPools: Map<string, Effect[]> = new Map();
    private cleanupQueue: string[] = [];
    
    private performanceObserver: PerformanceObserver | null = null;

    constructor() {
        this.errorHandler = getErrorHandler();
        this.qualityController = getEffectQualityController();
        
        this._initializePerformanceAPI();
    }
    
    /**
     * Performance APIの初期化
     */
    private _initializePerformanceAPI(): void {
        try {
            // Performance Observerの設定（利用可能な場合）
            if (typeof PerformanceObserver !== 'undefined') {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    for (const entry of entries) {
                        if (entry.entryType === 'measure' && entry.name.startsWith('effect-')) {
                            this._recordEffectPerformance(entry as PerformanceMeasure);
                        }
                    }
                });
                
                this.performanceObserver.observe({ entryTypes: ['measure'] });
            }
        } catch (error) {
            console.warn('Performance Observer not available:', (error as Error).message);
        }
    }
    
    /**
     * フレーム開始時の測定
     */
    startFrame(): void {
        const now = performance.now();
        this.frameTimestamps.push(now);
        
        // フレームレートの計算
        if (this.frameTimestamps.length > 1) {
            const timeDiff = now - this.frameTimestamps[this.frameTimestamps.length - 2];
            const frameRate = 1000 / timeDiff;
            
            this.frameRateBuffer.push(frameRate);
            if (this.frameRateBuffer.length > this.frameRateBufferSize) {
                this.frameRateBuffer.shift();
            }
            
            // 平均フレームレートの計算
            this.currentFrameRate = this.frameRateBuffer.reduce((sum, rate) => sum + rate, 0) / this.frameRateBuffer.length;
        }
        
        // 古いタイムスタンプの削除
        if (this.frameTimestamps.length > this.frameRateBufferSize) {
            this.frameTimestamps.shift();
        }
        
        // レンダリング統計のリセット
        if (now - this.renderStats.lastResetTime > 1000) {
            this.renderStats.particlesRendered = 0;
            this.renderStats.effectsRendered = 0;
            this.renderStats.drawCalls = 0;
            this.renderStats.lastResetTime = now;
        }
    }
    
    /**
     * パフォーマンス監視の更新
     */
    update(currentTime: number): void {
        if (!this.monitoringEnabled) return;
        
        // 品質コントローラーの更新
        const memoryUsage = this._getCurrentMemoryUsage();
        this.qualityController.updatePerformanceMetrics(
            currentTime, 
            this.currentFrameRate, 
            memoryUsage || undefined
        );
        
        // 定期監視
        if (currentTime - this.lastMonitoringTime > this.monitoringInterval) {
            this._performPerformanceCheck(currentTime);
            this.lastMonitoringTime = currentTime;
        }
        
        // メモリチェック
        if (currentTime - this.lastMemoryCheck > this.memoryCheckInterval) {
            this._checkMemoryUsage();
            this.lastMemoryCheck = currentTime;
        }
        
        // 緊急最適化チェック
        this._checkEmergencyOptimization();
        
        // クリーンアップキューの処理
        this._processCleanupQueue();
    }
    
    /**
     * パフォーマンスチェックの実行
     */
    private _performPerformanceCheck(currentTime: number): void {
        const stats = this.getPerformanceStats();
        
        // フレームレート警告
        if (stats.frameRate < this.warningThresholds.lowFrameRate) {
            this._handleLowFrameRate(stats.frameRate);
        }
        
        // ドローコール警告
        if (this.renderStats.drawCalls > this.warningThresholds.maxDrawCalls) {
            this._handleHighDrawCalls(this.renderStats.drawCalls);
        }
        
        // パーティクル数警告
        const activeParticles = this.qualityController.getActiveEffectCounts().particles;
        if (activeParticles > this.warningThresholds.maxActiveParticles) {
            this._handleHighParticleCount(activeParticles);
        }
    }
    
    /**
     * 低フレームレートの処理
     */
    private _handleLowFrameRate(frameRate: number): void {
        console.warn(`Low frame rate detected: ${frameRate.toFixed(1)} FPS`);
        
        // 品質低下の提案
        if (frameRate < this.optimizationSettings.reduceQualityThreshold) {
            const currentQuality = this.qualityController.getCurrentQualityLevel();
            if (currentQuality !== 'low') {
                console.log('Suggesting quality reduction due to low frame rate');
                // 自動調整が有効な場合は品質コントローラーが処理
            }
        }
    }
    
    /**
     * 高ドローコール数の処理
     */
    private _handleHighDrawCalls(drawCalls: number): void {
        console.warn(`High draw calls detected: ${drawCalls}`);
        
        // バッチング最適化の提案
        this._suggestBatchingOptimization();
    }
    
    /**
     * 高パーティクル数の処理
     */
    private _handleHighParticleCount(particleCount: number): void {
        console.warn(`High particle count detected: ${particleCount}`);
        
        // パーティクル削減の実行
        this._reduceParticleCount();
    }
    
    /**
     * メモリ使用量のチェック
     */
    private _checkMemoryUsage(): void {
        const memoryUsage = this._getCurrentMemoryUsage();
        if (!memoryUsage) return;
        
        this.memoryUsageHistory.push({
            timestamp: performance.now(),
            usage: memoryUsage
        });
        
        // 履歴の制限
        if (this.memoryUsageHistory.length > 60) {
            this.memoryUsageHistory.shift();
        }
        
        // メモリ警告
        if (memoryUsage > this.warningThresholds.highMemoryUsage) {
            this._handleHighMemoryUsage(memoryUsage);
        }
    }
    
    /**
     * 高メモリ使用量の処理
     */
    private _handleHighMemoryUsage(memoryUsage: number): void {
        console.warn(`High memory usage detected: ${(memoryUsage / 1024 / 1024).toFixed(1)} MB`);
        
        // ガベージコレクションの提案
        this._scheduleCleanup();
    }
    
    /**
     * 緊急最適化のチェック
     */
    private _checkEmergencyOptimization(): void {
        if (this.currentFrameRate < this.optimizationSettings.emergencyCleanupThreshold) {
            console.warn('Emergency optimization triggered due to extremely low frame rate');
            this._performEmergencyCleanup();
        }
    }
    
    /**
     * 緊急クリーンアップの実行
     */
    private _performEmergencyCleanup(): void {
        // すべての装飾的エフェクトを停止
        this.activeEffects.forEach((effect, id) => {
            if (effect.priority === 'decorative') {
                this.cleanupQueue.push(id);
            }
        });
        
        // 品質を最低に設定
        this.qualityController.setQualityLevel('low');
        
        // ガベージコレクションを促進
        if ((window as any).gc) {
            (window as any).gc();
        }
    }
    
    /**
     * エフェクトカリングの実行
     */
    cullEffects(effects: Effect[], viewport: Viewport): Effect[] {
        if (!this.optimizationSettings.cullOffScreen) {
            return effects;
        }
        
        const culledEffects: Effect[] = [];
        const cullDistance = this.optimizationSettings.cullDistance;
        
        this.cullingStats.totalEffects = effects.length;
        this.cullingStats.culledEffects = 0;
        this.cullingStats.offScreenEffects = 0;
        
        for (const effect of effects) {
            const inViewport = this._isEffectInViewport(effect, viewport, cullDistance);
            
            if (inViewport) {
                culledEffects.push(effect);
            } else {
                this.cullingStats.culledEffects++;
                if (this._isEffectOffScreen(effect, viewport)) {
                    this.cullingStats.offScreenEffects++;
                }
            }
        }
        
        this.cullingStats.visibleEffects = culledEffects.length;
        
        return culledEffects;
    }
    
    /**
     * エフェクトがビューポート内かチェック
     */
    private _isEffectInViewport(effect: Effect, viewport: Viewport, margin: number = 0): boolean {
        return effect.x + effect.width >= viewport.x - margin &&
               effect.x <= viewport.x + viewport.width + margin &&
               effect.y + effect.height >= viewport.y - margin &&
               effect.y <= viewport.y + viewport.height + margin;
    }
    
    /**
     * エフェクトが画面外かチェック
     */
    private _isEffectOffScreen(effect: Effect, viewport: Viewport): boolean {
        return effect.x + effect.width < viewport.x ||
               effect.x > viewport.x + viewport.width ||
               effect.y + effect.height < viewport.y ||
               effect.y > viewport.y + viewport.height;
    }
    
    /**
     * 現在のメモリ使用量を取得
     */
    private _getCurrentMemoryUsage(): number | null {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return null;
    }
    
    /**
     * レンダリング統計の記録
     */
    recordRenderStats(type: RenderStatsType, count: number = 1): void {
        switch (type) {
            case 'particle':
                this.renderStats.particlesRendered += count;
                break;
            case 'effect':
                this.renderStats.effectsRendered += count;
                break;
            case 'drawCall':
                this.renderStats.drawCalls += count;
                break;
        }
    }
    
    /**
     * クリーンアップのスケジュール
     */
    private _scheduleCleanup(effectId?: string): void {
        if (effectId) {
            this.cleanupQueue.push(effectId);
        } else {
            // 古いエフェクトをクリーンアップキューに追加
            const now = performance.now();
            this.activeEffects.forEach((effect, id) => {
                if (effect.createdTime && now - effect.createdTime > 10000) { // 10秒以上古い
                    this.cleanupQueue.push(id);
                }
            });
        }
    }
    
    /**
     * クリーンアップキューの処理
     */
    private _processCleanupQueue(): void {
        while (this.cleanupQueue.length > 0) {
            const effectId = this.cleanupQueue.shift();
            if (effectId) {
                this._cleanupEffect(effectId);
            }
        }
    }
    
    /**
     * エフェクトのクリーンアップ
     */
    private _cleanupEffect(effectId: string): void {
        if (this.activeEffects.has(effectId)) {
            const effect = this.activeEffects.get(effectId)!;
            
            // プールに戻す
            if (effect.poolable && effect.type && this.effectPools.has(effect.type)) {
                this.effectPools.get(effect.type)!.push(effect);
            }
            
            this.activeEffects.delete(effectId);
        }
    }
    
    /**
     * バッチング最適化の提案
     */
    private _suggestBatchingOptimization(): void {
        console.log('Suggesting batching optimization for draw calls');
        // 実際のバッチング実装は各レンダラーで行う
    }
    
    /**
     * パーティクル数の削減
     */
    private _reduceParticleCount(): void {
        // 優先度の低いパーティクルから削減
        const effects = Array.from(this.activeEffects.values());
        const decorativeEffects = effects.filter(e => e.priority === 'decorative');
        
        const toRemove = Math.min(decorativeEffects.length, 50);
        for (let i = 0; i < toRemove; i++) {
            const effect = decorativeEffects[i];
            if (effect.id) {
                this.cleanupQueue.push(effect.id);
            }
        }
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats(): PerformanceStats {
        return {
            frameRate: this.currentFrameRate,
            memoryUsage: this._getCurrentMemoryUsage(),
            renderStats: { ...this.renderStats },
            cullingStats: { ...this.cullingStats },
            activeEffects: this.activeEffects.size,
            cleanupQueueSize: this.cleanupQueue.length,
            qualityLevel: this.qualityController.getCurrentQualityLevel()
        };
    }
    
    /**
     * エフェクトパフォーマンスの記録
     */
    private _recordEffectPerformance(entry: PerformanceMeasure): void {
        // パフォーマンス測定結果の記録
        if (entry.duration > 16.67) { // 60FPS基準
            console.warn(`Slow effect detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
    }
    
    /**
     * 監視の有効/無効設定
     */
    setMonitoringEnabled(enabled: boolean): void {
        this.monitoringEnabled = enabled;
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose(): void {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        this.frameTimestamps = [];
        this.frameRateBuffer = [];
        this.memoryUsageHistory = [];
        this.activeEffects.clear();
        this.effectPools.clear();
        this.cleanupQueue = [];
    }
}

// シングルトンインスタンスの作成と管理
let performanceMonitorInstance: EffectPerformanceMonitor | null = null;

/**
 * EffectPerformanceMonitorのシングルトンインスタンスを取得
 */
export function getEffectPerformanceMonitor(): EffectPerformanceMonitor {
    if (!performanceMonitorInstance) {
        performanceMonitorInstance = new EffectPerformanceMonitor();
    }
    return performanceMonitorInstance;
}