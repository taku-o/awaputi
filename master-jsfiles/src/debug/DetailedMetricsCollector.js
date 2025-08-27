/**
 * Detailed Metrics Collector
 * 詳細なパフォーマンスメトリクス収集システム
 */

export class DetailedMetricsCollector {
    constructor(monitor) {
        this.monitor = monitor;
        this.gameEngine = monitor.gameEngine;
        
        // 拡張メトリクス
        this.extendedMetrics = {
            rendering: new RenderingMetrics(),
            memory: new MemoryMetrics(),
            game: new GameMetrics(),
            audio: new AudioMetrics(),
            network: new NetworkMetrics(),
            system: new SystemMetrics()
        };
        
        // プロファイリングデータ
        this.profilingData = {
            renderPipeline: new Map(),
            memoryAllocations: [],
            gameLoopBreakdown: new Map(),
            webGLCalls: [],
            audioProcessing: new Map()
        };
        
        // 統計追跡
        this.statisticsTracking = {
            sampleCount: 0,
            lastSampleTime: 0,
            averageCollectionTime: 0,
            peakCollectionTime: 0,
            errorCount: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.setupWebGLProfiler();
        this.setupMemoryTracker();
        this.setupGameLoopProfiler();
        this.setupAudioProfiler();
        this.setupNetworkMonitor();
        
        console.log('[DetailedMetricsCollector] Enhanced metrics collection initialized');
    }

    /**
     * 全詳細メトリクスの収集
     */
    collectDetailedMetrics() {
        const startTime = performance.now();
        
        try {
            this.collectRenderingDetails();
            this.collectMemoryDetails();
            this.collectGameDetails();
            this.collectAudioDetails();
            this.collectNetworkDetails();
            this.collectSystemDetails();
            
            this.updateStatistics(startTime);
            
        } catch (error) {
            this.statisticsTracking.errorCount++;
            console.error('[DetailedMetricsCollector] Collection error:', error);
            throw error;
        }
    }

    /**
     * レンダリング詳細メトリクス収集
     */
    collectRenderingDetails() {
        const renderMetrics = this.extendedMetrics.rendering;
        const canvas = this.gameEngine?.canvas;
        
        if (!canvas) return;

        // WebGL統計の詳細収集
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            this.collectWebGLMetrics(gl, renderMetrics);
        }

        // Canvas 2D統計
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
            this.collectCanvas2DMetrics(ctx2d, renderMetrics);
        }

        // レンダリングパイプライン分析
        this.analyzeRenderPipeline(renderMetrics);
        
        // フレームバッファ分析
        this.collectFramebufferMetrics(renderMetrics);
        
        renderMetrics.timestamp = Date.now();
    }

    /**
     * WebGLメトリクス収集
     */
    collectWebGLMetrics(gl, renderMetrics) {
        // 描画統計
        renderMetrics.drawCalls = this.estimateDrawCalls();
        renderMetrics.triangles = this.estimateTriangleCount();
        renderMetrics.vertices = this.estimateVertexCount();
        
        // テクスチャ統計
        renderMetrics.textureBindings = this.countTextureBindings();
        renderMetrics.textureMemory = this.estimateTextureMemory();
        renderMetrics.textureUploads = this.countTextureUploads();
        
        // シェーダー統計
        renderMetrics.shaderSwitches = this.countShaderSwitches();
        renderMetrics.uniformUpdates = this.countUniformUpdates();
        
        // WebGL状態変更
        renderMetrics.stateChanges = this.countStateChanges();
        renderMetrics.blendModeChanges = this.countBlendModeChanges();
        
        // バッファ統計
        renderMetrics.bufferUploads = this.countBufferUploads();
        renderMetrics.bufferMemory = this.estimateBufferMemory();
        
        // パフォーマンス指標
        renderMetrics.gpuUtilization = this.estimateGPUUtilization();
        renderMetrics.fillRateUtilization = this.estimateFillRateUtilization();
    }

    /**
     * Canvas 2Dメトリクス収集
     */
    collectCanvas2DMetrics(ctx, renderMetrics) {
        // 2D描画統計
        renderMetrics.canvas2D = {
            operations: this.count2DOperations(),
            imageDraws: this.countImageDraws(),
            pathOperations: this.countPathOperations(),
            textOperations: this.countTextOperations(),
            transformations: this.countTransformations(),
            compositeOperations: this.countCompositeOperations()
        };
    }

    /**
     * メモリ詳細メトリクス収集
     */
    collectMemoryDetails() {
        const memoryMetrics = this.extendedMetrics.memory;
        
        // JavaScript ヒープメモリ
        if (performance.memory) {
            memoryMetrics.heap = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                utilization: performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize
            };
        }

        // メモリ配置パターン分析
        this.analyzeMemoryAllocationPatterns(memoryMetrics);
        
        // ガベージコレクション分析
        this.analyzeGCPatterns(memoryMetrics);
        
        // オブジェクトプール統計
        this.collectObjectPoolMetrics(memoryMetrics);
        
        // GPU メモリ推定
        this.estimateGPUMemoryUsage(memoryMetrics);
        
        // メモリリーク検出
        this.detectMemoryLeaks(memoryMetrics);
        
        memoryMetrics.timestamp = Date.now();
    }

    /**
     * メモリ配置パターン分析
     */
    analyzeMemoryAllocationPatterns(memoryMetrics) {
        const currentUsed = performance.memory?.usedJSHeapSize || 0;
        const history = this.monitor.historyManager.data.memory.slice(-10);
        
        if (history.length >= 3) {
            const allocations = [];
            for (let i = 1; i < history.length; i++) {
                const diff = history[i].used - history[i - 1].used;
                if (diff > 0) {
                    allocations.push({
                        size: diff,
                        timestamp: history[i].timestamp,
                        rate: diff / (history[i].timestamp - history[i - 1].timestamp)
                    });
                }
            }

            memoryMetrics.allocationPattern = {
                frequency: allocations.length,
                averageSize: allocations.reduce((sum, a) => sum + a.size, 0) / Math.max(1, allocations.length),
                peakSize: Math.max(0, ...allocations.map(a => a.size)),
                averageRate: allocations.reduce((sum, a) => sum + a.rate, 0) / Math.max(1, allocations.length),
                trend: this.calculateMemoryTrend(history)
            };
        }
    }

    /**
     * ガベージコレクション分析
     */
    analyzeGCPatterns(memoryMetrics) {
        const history = this.monitor.historyManager.data.memory.slice(-20);
        const gcEvents = [];
        
        for (let i = 1; i < history.length; i++) {
            const currentUsed = history[i].used;
            const previousUsed = history[i - 1].used;
            const timeDiff = history[i].timestamp - history[i - 1].timestamp;
            
            // 大きなメモリ減少をGCイベントと判定
            if (previousUsed - currentUsed > 5 * 1024 * 1024) { // 5MB以上の減少
                gcEvents.push({
                    timestamp: history[i].timestamp,
                    freedMemory: previousUsed - currentUsed,
                    duration: timeDiff,
                    beforeGC: previousUsed,
                    afterGC: currentUsed
                });
            }
        }

        memoryMetrics.garbageCollection = {
            eventCount: gcEvents.length,
            totalFreed: gcEvents.reduce((sum, gc) => sum + gc.freedMemory, 0),
            averageFreed: gcEvents.length > 0 ? gcEvents.reduce((sum, gc) => sum + gc.freedMemory, 0) / gcEvents.length : 0,
            frequency: gcEvents.length > 0 ? (history.length > 0 ? gcEvents.length / (history[history.length - 1].timestamp - history[0].timestamp) * 60000 : 0) : 0, // per minute
            efficiency: gcEvents.length > 0 ? gcEvents.reduce((sum, gc) => sum + gc.freedMemory / gc.beforeGC, 0) / gcEvents.length : 0
        };
    }

    /**
     * ゲーム詳細メトリクス収集
     */
    collectGameDetails() {
        const gameMetrics = this.extendedMetrics.game;
        
        // エンティティ詳細統計
        this.collectEntityMetrics(gameMetrics);
        
        // 物理シミュレーション統計
        this.collectPhysicsMetrics(gameMetrics);
        
        // イベントシステム統計
        this.collectEventSystemMetrics(gameMetrics);
        
        // ゲームループ分析
        this.analyzeGameLoop(gameMetrics);
        
        // スコアリングシステム統計
        this.collectScoringMetrics(gameMetrics);
        
        gameMetrics.timestamp = Date.now();
    }

    /**
     * エンティティメトリクス収集
     */
    collectEntityMetrics(gameMetrics) {
        const bubbleManager = this.gameEngine?.bubbleManager;
        const particleManager = this.gameEngine?.enhancedParticleManager;
        const effectManager = this.gameEngine?.enhancedEffectManager;

        gameMetrics.entities = {
            bubbles: {
                total: bubbleManager?.getActiveBubbleCount?.() || 0,
                byType: this.getBubbleCountByType(bubbleManager),
                spawned: this.getBubblesSpawnedThisFrame(),
                destroyed: this.getBubblesDestroyedThisFrame(),
                averageLifetime: this.getAverageBubbleLifetime()
            },
            particles: {
                total: particleManager?.getActiveParticleCount?.() || 0,
                bySystem: this.getParticleCountBySystem(particleManager),
                spawned: this.getParticlesSpawnedThisFrame(),
                destroyed: this.getParticlesDestroyedThisFrame(),
                poolUtilization: this.getParticlePoolUtilization(particleManager)
            },
            effects: {
                total: effectManager?.getActiveEffectCount?.() || 0,
                byType: this.getEffectCountByType(effectManager),
                active: this.getActiveEffects(),
                queued: this.getQueuedEffects()
            }
        };
    }

    /**
     * 物理シミュレーション統計
     */
    collectPhysicsMetrics(gameMetrics) {
        gameMetrics.physics = {
            collisionChecks: this.getCollisionChecksPerFrame(),
            collisionHits: this.getCollisionHitsPerFrame(),
            bounces: this.getBouncesPerFrame(),
            physicsSteps: this.getPhysicsStepsPerFrame(),
            averageStepTime: this.getAveragePhysicsStepTime(),
            spatialOptimization: this.getSpatialOptimizationStats()
        };
    }

    /**
     * オーディオ詳細メトリクス収集
     */
    collectAudioDetails() {
        const audioMetrics = this.extendedMetrics.audio;
        const audioManager = this.gameEngine?.audioManager;
        
        if (!audioManager) return;

        // オーディオコンテキスト統計
        this.collectAudioContextMetrics(audioMetrics);
        
        // サウンド再生統計
        this.collectSoundPlaybackMetrics(audioMetrics);
        
        // オーディオ処理統計
        this.collectAudioProcessingMetrics(audioMetrics);
        
        audioMetrics.timestamp = Date.now();
    }

    /**
     * ネットワーク詳細メトリクス収集
     */
    collectNetworkDetails() {
        const networkMetrics = this.extendedMetrics.network;
        
        // 接続情報
        if (navigator.connection) {
            networkMetrics.connection = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }

        // リソース読み込み統計
        this.collectResourceLoadingMetrics(networkMetrics);
        
        // キャッシュ統計
        this.collectCacheMetrics(networkMetrics);
        
        networkMetrics.timestamp = Date.now();
    }

    /**
     * システム詳細メトリクス収集
     */
    collectSystemDetails() {
        const systemMetrics = this.extendedMetrics.system;
        
        // デバイス情報詳細
        systemMetrics.device = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            hardwareConcurrency: navigator.hardwareConcurrency || 1,
            deviceMemory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0
        };

        // ブラウザ機能検出
        systemMetrics.capabilities = {
            webgl: this.detectWebGLSupport(),
            webgl2: this.detectWebGL2Support(),
            webassembly: this.detectWebAssemblySupport(),
            serviceWorker: 'serviceWorker' in navigator,
            webWorker: typeof Worker !== 'undefined',
            indexedDB: 'indexedDB' in window,
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            gamepad: 'getGamepads' in navigator
        };

        // パフォーマンス API 情報
        systemMetrics.performanceAPI = {
            timing: !!performance.timing,
            navigation: !!performance.navigation,
            memory: !!performance.memory,
            observer: typeof PerformanceObserver !== 'undefined'
        };

        systemMetrics.timestamp = Date.now();
    }

    // WebGL プロファイラー設定
    setupWebGLProfiler() {
        const canvas = this.gameEngine?.canvas;
        if (!canvas) return;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;

        // WebGL呼び出しのプロキシを設定（開発モードのみ）
        if (process.env.NODE_ENV === 'development') {
            this.proxyWebGLCalls(gl);
        }
    }

    // メモリ追跡設定
    setupMemoryTracker() {
        // メモリ割り当て追跡（開発モードのみ）
        if (process.env.NODE_ENV === 'development') {
            this.setupMemoryAllocationTracking();
        }
    }

    // ゲームループプロファイラー設定
    setupGameLoopProfiler() {
        if (!this.gameEngine) return;

        // ゲームループの各段階を監視
        this.profileGameLoopStages();
    }

    // オーディオプロファイラー設定
    setupAudioProfiler() {
        const audioManager = this.gameEngine?.audioManager;
        if (!audioManager) return;

        // オーディオ処理の監視を設定
        this.profileAudioProcessing(audioManager);
    }

    // ネットワーク監視設定
    setupNetworkMonitor() {
        // Resource Timing API の監視
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'resource') {
                            this.processResourceTiming(entry);
                        }
                    });
                });
                observer.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('[DetailedMetricsCollector] PerformanceObserver setup failed:', error);
            }
        }
    }

    // ヘルパーメソッド（推定・計算系）
    estimateDrawCalls() {
        const bubbleCount = this.gameEngine?.bubbleManager?.getActiveBubbleCount?.() || 0;
        const particleCount = this.gameEngine?.enhancedParticleManager?.getActiveParticleCount?.() || 0;
        const effectCount = this.gameEngine?.enhancedEffectManager?.getActiveEffectCount?.() || 0;
        
        // バッチング効率を考慮した推定
        return Math.ceil(bubbleCount / 20) + Math.ceil(particleCount / 100) + effectCount * 2;
    }

    estimateTriangleCount() {
        const bubbleCount = this.gameEngine?.bubbleManager?.getActiveBubbleCount?.() || 0;
        const particleCount = this.gameEngine?.enhancedParticleManager?.getActiveParticleCount?.() || 0;
        
        // 各バブル：円 = 多角形 ≈ 16三角形、各パーティクル：2三角形（quad）
        return bubbleCount * 16 + particleCount * 2;
    }

    estimateVertexCount() {
        return this.estimateTriangleCount() * 3; // 1三角形 = 3頂点
    }

    calculateMemoryTrend(history) {
        if (history.length < 2) return 'stable';
        
        const recent = history.slice(-5);
        const older = history.slice(-10, -5);
        
        if (recent.length === 0 || older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, h) => sum + h.used, 0) / recent.length;
        const olderAvg = older.reduce((sum, h) => sum + h.used, 0) / older.length;
        
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    // プラットフォーム検出メソッド
    detectWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    detectWebGL2Support() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }

    detectWebAssemblySupport() {
        return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
    }

    // 統計更新
    updateStatistics(startTime) {
        const collectionTime = performance.now() - startTime;
        
        this.statisticsTracking.sampleCount++;
        this.statisticsTracking.lastSampleTime = Date.now();
        
        this.statisticsTracking.averageCollectionTime = 
            (this.statisticsTracking.averageCollectionTime * (this.statisticsTracking.sampleCount - 1) + collectionTime) / 
            this.statisticsTracking.sampleCount;
        
        this.statisticsTracking.peakCollectionTime = Math.max(
            this.statisticsTracking.peakCollectionTime, 
            collectionTime
        );
    }

    // パブリックAPI
    getExtendedMetrics() {
        return {
            rendering: this.extendedMetrics.rendering.toJSON(),
            memory: this.extendedMetrics.memory.toJSON(),
            game: this.extendedMetrics.game.toJSON(),
            audio: this.extendedMetrics.audio.toJSON(),
            network: this.extendedMetrics.network.toJSON(),
            system: this.extendedMetrics.system.toJSON()
        };
    }

    getProfilingData() {
        return {
            renderPipeline: Object.fromEntries(this.profilingData.renderPipeline),
            memoryAllocations: this.profilingData.memoryAllocations,
            gameLoopBreakdown: Object.fromEntries(this.profilingData.gameLoopBreakdown),
            webGLCalls: this.profilingData.webGLCalls.slice(-100), // 最新100件
            audioProcessing: Object.fromEntries(this.profilingData.audioProcessing)
        };
    }

    getCollectionStatistics() {
        return { ...this.statisticsTracking };
    }

    // クリーンアップ
    destroy() {
        // プロファイリングデータのクリア
        this.profilingData.renderPipeline.clear();
        this.profilingData.memoryAllocations = [];
        this.profilingData.gameLoopBreakdown.clear();
        this.profilingData.webGLCalls = [];
        this.profilingData.audioProcessing.clear();
        
        console.log('[DetailedMetricsCollector] Destroyed');
    }

    // プレースホルダーメソッド（実装は各ゲーム固有システムに依存）
    getBubbleCountByType() { return {}; }
    getBubblesSpawnedThisFrame() { return 0; }
    getBubblesDestroyedThisFrame() { return 0; }
    getAverageBubbleLifetime() { return 0; }
    getParticleCountBySystem() { return {}; }
    getParticlesSpawnedThisFrame() { return 0; }
    getParticlesDestroyedThisFrame() { return 0; }
    getParticlePoolUtilization() { return 0; }
    getEffectCountByType() { return {}; }
    getActiveEffects() { return 0; }
    getQueuedEffects() { return 0; }
    getCollisionChecksPerFrame() { return 0; }
    getCollisionHitsPerFrame() { return 0; }
    getBouncesPerFrame() { return 0; }
    getPhysicsStepsPerFrame() { return 0; }
    getAveragePhysicsStepTime() { return 0; }
    getSpatialOptimizationStats() { return {}; }
    collectAudioContextMetrics() {}
    collectSoundPlaybackMetrics() {}
    collectAudioProcessingMetrics() {}
    collectResourceLoadingMetrics() {}
    collectCacheMetrics() {}
    collectObjectPoolMetrics() {}
    estimateGPUMemoryUsage() {}
    detectMemoryLeaks() {}
    analyzeRenderPipeline() {}
    collectFramebufferMetrics() {}
    countTextureBindings() { return 0; }
    estimateTextureMemory() { return 0; }
    countTextureUploads() { return 0; }
    countShaderSwitches() { return 0; }
    countUniformUpdates() { return 0; }
    countStateChanges() { return 0; }
    countBlendModeChanges() { return 0; }
    countBufferUploads() { return 0; }
    estimateBufferMemory() { return 0; }
    estimateGPUUtilization() { return 0; }
    estimateFillRateUtilization() { return 0; }
    count2DOperations() { return 0; }
    countImageDraws() { return 0; }
    countPathOperations() { return 0; }
    countTextOperations() { return 0; }
    countTransformations() { return 0; }
    countCompositeOperations() { return 0; }
    analyzeGameLoop() {}
    collectScoringMetrics() {}
    collectEventSystemMetrics() {}
    proxyWebGLCalls() {}
    setupMemoryAllocationTracking() {}
    profileGameLoopStages() {}
    profileAudioProcessing() {}
    processResourceTiming() {}
}

/**
 * 拡張レンダリングメトリクス
 */
class RenderingMetrics {
    constructor() {
        this.drawCalls = 0;
        this.triangles = 0;
        this.vertices = 0;
        this.textureBindings = 0;
        this.textureMemory = 0;
        this.textureUploads = 0;
        this.shaderSwitches = 0;
        this.uniformUpdates = 0;
        this.stateChanges = 0;
        this.blendModeChanges = 0;
        this.bufferUploads = 0;
        this.bufferMemory = 0;
        this.gpuUtilization = 0;
        this.fillRateUtilization = 0;
        this.canvas2D = {};
        this.timestamp = Date.now();
    }

    toJSON() { return { ...this }; }
}

/**
 * 拡張メモリメトリクス
 */
class MemoryMetrics {
    constructor() {
        this.heap = {};
        this.allocationPattern = {};
        this.garbageCollection = {};
        this.objectPools = {};
        this.gpuMemory = {};
        this.leaks = {};
        this.timestamp = Date.now();
    }

    toJSON() { return { ...this }; }
}

/**
 * 拡張ゲームメトリクス
 */
class GameMetrics {
    constructor() {
        this.entities = {};
        this.physics = {};
        this.events = {};
        this.gameLoop = {};
        this.scoring = {};
        this.timestamp = Date.now();
    }

    toJSON() { return { ...this }; }
}

/**
 * オーディオメトリクス
 */
class AudioMetrics {
    constructor() {
        this.context = {};
        this.playback = {};
        this.processing = {};
        this.timestamp = Date.now();
    }

    toJSON() { return { ...this }; }
}

/**
 * ネットワークメトリクス
 */
class NetworkMetrics {
    constructor() {
        this.connection = {};
        this.resources = {};
        this.cache = {};
        this.timestamp = Date.now();
    }

    toJSON() { return { ...this }; }
}

/**
 * システムメトリクス
 */
class SystemMetrics {
    constructor() {
        this.device = {};
        this.capabilities = {};
        this.performanceAPI = {};
        this.timestamp = Date.now();
    }

    toJSON() { return { ...this }; }
}

export default DetailedMetricsCollector;