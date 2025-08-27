import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectQualityController } from './EffectQualityController.js';

/**
 * エフェクトパフォーマンス監視クラス
 * 
 * リアルタイムパフォーマンス監視とリソースクリーンアップ、
 * エフェクトカリングを行います。
 */
export class EffectPerformanceMonitor {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.qualityController = getEffectQualityController();
        
        // パフォーマンス監視設定
        this.monitoringEnabled = true;
        this.monitoringInterval = 500; // 0.5秒間隔
        this.lastMonitoringTime = 0;
        
        // フレームレート測定
        this.frameTimestamps = [];
        this.frameRateBuffer = [];
        this.frameRateBufferSize = 60;
        this.currentFrameRate = 60;
        
        // メモリ使用量監視
        this.memoryCheckInterval = 2000; // 2秒間隔
        this.lastMemoryCheck = 0;
        this.memoryUsageHistory = [];
        this.memoryThreshold = 100 * 1024 * 1024; // 100MB
        
        // レンダリング統計
        this.renderStats = {
            particlesRendered: 0,
            effectsRendered: 0,
            drawCalls: 0,
            lastResetTime: 0
        };
        
        // カリング統計
        this.cullingStats = {
            totalEffects: 0,
            culledEffects: 0,
            visibleEffects: 0,
            offScreenEffects: 0
        };
        
        // パフォーマンス警告
        this.warningThresholds = {
            lowFrameRate: 30,
            highMemoryUsage: 80 * 1024 * 1024, // 80MB
            maxDrawCalls: 1000,
            maxActiveParticles: 300
        };
        
        // 最適化設定
        this.optimizationSettings = {
            cullOffScreen: true,
            cullDistance: 50, // 画面外50px以上はカリング
            maxVisibleParticles: 200,
            reduceQualityThreshold: 25, // 25FPS以下で品質低下
            emergencyCleanupThreshold: 20 // 20FPS以下で緊急クリーンアップ
        };
        
        // エフェクト管理
        this.activeEffects = new Map();
        this.effectPools = new Map();
        this.cleanupQueue = [];
        
        this._initializePerformanceAPI();
    }
    
    /**
     * Performance APIの初期化
     * @private
     */
    _initializePerformanceAPI() {
        try {
            // Performance Observerの設定（利用可能な場合）
            if (typeof PerformanceObserver !== 'undefined') {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    for (const entry of entries) {
                        if (entry.entryType === 'measure' && entry.name.startsWith('effect-')) {
                            this._recordEffectPerformance(entry);
                        }
                    }
                });
                
                this.performanceObserver.observe({ entryTypes: ['measure'] });
            }
        } catch (error) {
            console.warn('Performance Observer not available:', error.message);
        }
    }
    
    /**
     * フレーム開始時の測定
     */
    startFrame() {
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
     * @param {number} currentTime - 現在時刻
     */
    update(currentTime) {
        if (!this.monitoringEnabled) return;
        
        // 品質コントローラーの更新
        this.qualityController.updatePerformanceMetrics(
            currentTime, 
            this.currentFrameRate, 
            this._getCurrentMemoryUsage()
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
     * @param {number} currentTime - 現在時刻
     * @private
     */
    _performPerformanceCheck(currentTime) {
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
     * @param {number} frameRate - 現在のフレームレート
     * @private
     */
    _handleLowFrameRate(frameRate) {
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
     * @param {number} drawCalls - ドローコール数
     * @private
     */
    _handleHighDrawCalls(drawCalls) {
        console.warn(`High draw calls detected: ${drawCalls}`);
        
        // バッチング最適化の提案
        this._suggestBatchingOptimization();
    }
    
    /**
     * 高パーティクル数の処理
     * @param {number} particleCount - パーティクル数
     * @private
     */
    _handleHighParticleCount(particleCount) {
        console.warn(`High particle count detected: ${particleCount}`);
        
        // パーティクル削減の実行
        this._reduceParticleCount();
    }
    
    /**
     * メモリ使用量のチェック
     * @private
     */
    _checkMemoryUsage() {
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
     * @param {number} memoryUsage - メモリ使用量
     * @private
     */
    _handleHighMemoryUsage(memoryUsage) {
        console.warn(`High memory usage detected: ${(memoryUsage / 1024 / 1024).toFixed(1)} MB`);
        
        // ガベージコレクションの提案
        this._scheduleCleanup();
    }
    
    /**
     * 緊急最適化のチェック
     * @private
     */
    _checkEmergencyOptimization() {
        if (this.currentFrameRate < this.optimizationSettings.emergencyCleanupThreshold) {
            console.warn('Emergency optimization triggered due to extremely low frame rate');
            this._performEmergencyCleanup();
        }
    }
    
    /**
     * 緊急クリーンアップの実行
     * @private
     */
    _performEmergencyCleanup() {
        // すべての装飾的エフェクトを停止
        this.activeEffects.forEach((effect, id) => {
            if (effect.priority === 'decorative') {
                this.cleanupQueue.push(id);
            }
        });
        
        // 品質を最低に設定
        this.qualityController.setQualityLevel('low');
        
        // ガベージコレクションを促進
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * エフェクトカリングの実行
     * @param {Array} effects - エフェクト配列
     * @param {Object} viewport - ビューポート情報
     * @returns {Array} カリング後のエフェクト配列
     */
    cullEffects(effects, viewport) {
        if (!this.optimizationSettings.cullOffScreen) {
            return effects;
        }
        
        const culledEffects = [];
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
     * @param {Object} effect - エフェクト
     * @param {Object} viewport - ビューポート
     * @param {number} margin - マージン
     * @returns {boolean} ビューポート内か
     * @private
     */
    _isEffectInViewport(effect, viewport, margin = 0) {
        return effect.x + effect.width >= viewport.x - margin &&
               effect.x <= viewport.x + viewport.width + margin &&
               effect.y + effect.height >= viewport.y - margin &&
               effect.y <= viewport.y + viewport.height + margin;
    }
    
    /**
     * エフェクトが画面外かチェック
     * @param {Object} effect - エフェクト
     * @param {Object} viewport - ビューポート
     * @returns {boolean} 画面外か
     * @private
     */
    _isEffectOffScreen(effect, viewport) {
        return effect.x + effect.width < viewport.x ||
               effect.x > viewport.x + viewport.width ||
               effect.y + effect.height < viewport.y ||
               effect.y > viewport.y + viewport.height;
    }
    
    /**
     * 現在のメモリ使用量を取得
     * @returns {number|null} メモリ使用量（バイト）
     * @private
     */
    _getCurrentMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return null;
    }
    
    /**
     * レンダリング統計の記録
     * @param {string} type - 統計タイプ
     * @param {number} count - カウント
     */
    recordRenderStats(type, count = 1) {
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
     * @param {string} effectId - エフェクトID（オプション）
     */
    _scheduleCleanup(effectId = null) {
        if (effectId) {
            this.cleanupQueue.push(effectId);
        } else {
            // 古いエフェクトをクリーンアップキューに追加
            const now = performance.now();
            this.activeEffects.forEach((effect, id) => {
                if (now - effect.createdTime > 10000) { // 10秒以上古い
                    this.cleanupQueue.push(id);
                }
            });
        }
    }
    
    /**
     * クリーンアップキューの処理
     * @private
     */
    _processCleanupQueue() {
        while (this.cleanupQueue.length > 0) {
            const effectId = this.cleanupQueue.shift();
            this._cleanupEffect(effectId);
        }
    }
    
    /**
     * エフェクトのクリーンアップ
     * @param {string} effectId - エフェクトID
     * @private
     */
    _cleanupEffect(effectId) {
        if (this.activeEffects.has(effectId)) {
            const effect = this.activeEffects.get(effectId);
            
            // プールに戻す
            if (effect.poolable && this.effectPools.has(effect.type)) {
                this.effectPools.get(effect.type).push(effect);
            }
            
            this.activeEffects.delete(effectId);
        }
    }
    
    /**
     * バッチング最適化の提案
     * @private
     */
    _suggestBatchingOptimization() {
        console.log('Suggesting batching optimization for draw calls');
        // 実際のバッチング実装は各レンダラーで行う
    }
    
    /**
     * パーティクル数の削減
     * @private
     */
    _reduceParticleCount() {
        // 優先度の低いパーティクルから削減
        const effects = Array.from(this.activeEffects.values());
        const decorativeEffects = effects.filter(e => e.priority === 'decorative');
        
        const toRemove = Math.min(decorativeEffects.length, 50);
        for (let i = 0; i < toRemove; i++) {
            this.cleanupQueue.push(decorativeEffects[i].id);
        }
    }
    
    /**
     * パフォーマンス統計の取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
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
     * @param {PerformanceEntry} entry - パフォーマンスエントリ
     * @private
     */
    _recordEffectPerformance(entry) {
        // パフォーマンス測定結果の記録
        if (entry.duration > 16.67) { // 60FPS基準
            console.warn(`Slow effect detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
    }
    
    /**
     * 監視の有効/無効設定
     * @param {boolean} enabled - 監視を有効にするか
     */
    setMonitoringEnabled(enabled) {
        this.monitoringEnabled = enabled;
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
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
let performanceMonitorInstance = null;

/**
 * EffectPerformanceMonitorのシングルトンインスタンスを取得
 * @returns {EffectPerformanceMonitor} シングルトンインスタンス
 */
export function getEffectPerformanceMonitor() {
    if (!performanceMonitorInstance) {
        performanceMonitorInstance = new EffectPerformanceMonitor();
    }
    return performanceMonitorInstance;
}