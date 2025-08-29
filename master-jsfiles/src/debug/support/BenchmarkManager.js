import { BaseComponent } from '../BaseComponent.js';

/**
 * BenchmarkManager - ベンチマーク実行・スイート管理コンポーネント
 */
export class BenchmarkManager extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'BenchmarkManager');
        this.benchmarkSuite = null;
        this.benchmarkHistory = [];
        this.maxHistorySize = 50;
    }

    async _doInitialize() {
        this.benchmarkSuite = new BenchmarkSuite(this.mainController.gameEngine);
    }

    /**
     * ベンチマークを実行
     * @param {Array} benchmarkNames - 実行するベンチマーク名
     * @returns {Object} ベンチマーク結果
     */
    async runBenchmarks(benchmarkNames = null) {
        if (this.mainController.isRunning) {
            throw new Error('Benchmarks are already running');
        }
        
        try {
            this.mainController.isRunning = true;
            const results = await this.benchmarkSuite.runBenchmarks(benchmarkNames);
            
            // 履歴に追加
            this.addToHistory(results);
            
            return results;
        } finally {
            this.mainController.isRunning = false;
        }
    }

    /**
     * ベンチマーク結果を履歴に追加
     * @private
     */
    addToHistory(results) {
        const historyEntry = {
            timestamp: Date.now(),
            results: results
        };
        
        this.benchmarkHistory.unshift(historyEntry);
        
        // 履歴サイズ制限
        if (this.benchmarkHistory.length > this.maxHistorySize) {
            this.benchmarkHistory = this.benchmarkHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * ベンチマーク履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} ベンチマーク履歴
     */
    getBenchmarkHistory(limit = 10) {
        return this.benchmarkHistory.slice(0, limit);
    }

    /**
     * ベンチマーク履歴をクリア
     */
    clearBenchmarkHistory() {
        this.benchmarkHistory = [];
    }

    /**
     * 利用可能なベンチマーク名を取得
     * @returns {Array} ベンチマーク名配列
     */
    getAvailableBenchmarks() {
        return this.benchmarkSuite ? this.benchmarkSuite.getAvailableBenchmarks() : [];
    }

    /**
     * ベンチマーク結果を分析
     * @param {Object} results - ベンチマーク結果
     * @returns {Object} 分析結果
     */
    analyzeBenchmarkResults(results) {
        const analysis = {
            overallHealth: this.calculateOverallHealth(results),
            bottlenecks: this.identifyBottlenecks(results),
            improvements: this.suggestImprovements(results)
        };
        
        return analysis;
    }

    /**
     * 全体的な健全性を計算
     * @private
     */
    calculateOverallHealth(results) {
        const benchmarks = Object.values(results);
        const successCount = benchmarks.filter(b => b.success).length;
        const totalCount = benchmarks.length;
        
        if (totalCount === 0) return 'unknown';
        
        const successRate = successCount / totalCount;
        
        if (successRate >= 0.9) return 'excellent';
        if (successRate >= 0.7) return 'good';
        if (successRate >= 0.5) return 'fair';
        return 'poor';
    }

    /**
     * ボトルネックを特定
     * @private
     */
    identifyBottlenecks(results) {
        const bottlenecks = [];
        
        // レンダリングパフォーマンス
        if (results.rendering?.estimatedFPS < 30) {
            bottlenecks.push({
                area: 'rendering',
                severity: 'high',
                description: 'FPS below 30'
            });
        }
        
        // メモリ使用量
        if (results.memoryAllocation?.memoryAllocated > 50 * 1024 * 1024) { // 50MB
            bottlenecks.push({
                area: 'memory',
                severity: 'medium',
                description: 'High memory allocation detected'
            });
        }
        
        // 物理演算
        if (results.bubblePhysics?.avgTimePerFrame > 16.67) {
            bottlenecks.push({
                area: 'physics',
                severity: 'medium',
                description: 'Physics calculation exceeds frame budget'
            });
        }
        
        return bottlenecks;
    }

    /**
     * 改善提案を生成
     * @private
     */
    suggestImprovements(results) {
        const suggestions = [];
        
        const bottlenecks = this.identifyBottlenecks(results);
        
        bottlenecks.forEach(bottleneck => {
            switch (bottleneck.area) {
                case 'rendering':
                    suggestions.push({
                        area: 'rendering',
                        suggestion: 'Reduce particle count or enable performance mode',
                        priority: 'high'
                    });
                    break;
                case 'memory':
                    suggestions.push({
                        area: 'memory',
                        suggestion: 'Implement object pooling for frequently created objects',
                        priority: 'medium'
                    });
                    break;
                case 'physics':
                    suggestions.push({
                        area: 'physics',
                        suggestion: 'Optimize collision detection or reduce active bubble count',
                        priority: 'medium'
                    });
                    break;
            }
        });
        
        return suggestions;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.benchmarkSuite?.destroy();
        this.benchmarkHistory = [];
        super.cleanup();
    }
}

/**
 * Benchmark Suite
 * パフォーマンステスト実行システム
 */
class BenchmarkSuite {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.benchmarks = new Map();
        this.setupBenchmarks();
    }

    setupBenchmarks() {
        this.benchmarks.set('rendering', this.benchmarkRendering.bind(this));
        this.benchmarks.set('bubblePhysics', this.benchmarkBubblePhysics.bind(this));
        this.benchmarks.set('particleEffects', this.benchmarkParticleEffects.bind(this));
        this.benchmarks.set('memoryAllocation', this.benchmarkMemoryAllocation.bind(this));
        this.benchmarks.set('audioProcessing', this.benchmarkAudioProcessing.bind(this));
    }

    getAvailableBenchmarks() {
        return Array.from(this.benchmarks.keys());
    }

    async runBenchmarks(benchmarkNames = null) {
        const targets = benchmarkNames || Array.from(this.benchmarks.keys());
        const results = {};

        for (const name of targets) {
            const benchmark = this.benchmarks.get(name);
            if (benchmark) {
                try {
                    results[name] = await benchmark();
                } catch (error) {
                    results[name] = {
                        error: error.message,
                        success: false
                    };
                }
            }
        }

        return results;
    }

    async benchmarkRendering() {
        const iterations = 60;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            
            if (this.gameEngine?.render) {
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        this.gameEngine.render();
                        resolve();
                    });
                });
            }
            
            times.push(performance.now() - start);
        }

        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        return {
            avgRenderTime: avgTime,
            minRenderTime: minTime,
            maxRenderTime: maxTime,
            estimatedFPS: 1000 / avgTime,
            success: true
        };
    }

    async benchmarkBubblePhysics() {
        const bubbleManager = this.gameEngine?.bubbleManager;
        if (!bubbleManager) {
            throw new Error('BubbleManager not available');
        }

        const mockDataManager = this.gameEngine?.testSupportTools?.getMockDataManager();
        const testBubbles = mockDataManager ? 
            mockDataManager.generateMockBubbles(100) : [];
        
        const start = performance.now();
        
        // 物理演算シミュレーション
        for (let frame = 0; frame < 60; frame++) {
            testBubbles.forEach(bubble => {
                // 簡単な物理演算
                bubble.x += bubble.velocity.x;
                bubble.y += bubble.velocity.y;
                bubble.age += 16.67; // 60FPS想定
                
                // 境界チェック
                if (bubble.x < 0 || bubble.x > 800) bubble.velocity.x *= -1;
                if (bubble.y < 0 || bubble.y > 600) bubble.velocity.y *= -1;
            });
        }
        
        const totalTime = performance.now() - start;
        
        return {
            totalTime: totalTime,
            bubblesProcessed: testBubbles.length,
            framesProcessed: 60,
            avgTimePerFrame: totalTime / 60,
            avgTimePerBubble: totalTime / (testBubbles.length * 60),
            success: true
        };
    }

    async benchmarkParticleEffects() {
        const particleManager = this.gameEngine?.enhancedParticleManager;
        if (!particleManager) {
            return { error: 'ParticleManager not available', success: false };
        }

        const start = performance.now();
        
        // パーティクルエフェクトを大量生成
        for (let i = 0; i < 50; i++) {
            if (particleManager.createBubbleDestructionEffect) {
                particleManager.createBubbleDestructionEffect(
                    Math.random() * 800,
                    Math.random() * 600,
                    'normal'
                );
            }
        }
        
        const generationTime = performance.now() - start;
        
        // 更新処理のベンチマーク
        const updateStart = performance.now();
        for (let frame = 0; frame < 60; frame++) {
            if (particleManager.update) {
                particleManager.update(16.67);
            }
        }
        const updateTime = performance.now() - updateStart;
        
        return {
            generationTime: generationTime,
            updateTime: updateTime,
            totalTime: generationTime + updateTime,
            effectsGenerated: 50,
            framesUpdated: 60,
            success: true
        };
    }

    async benchmarkMemoryAllocation() {
        if (!performance.memory) {
            return { error: 'Memory API not available', success: false };
        }

        const initialMemory = performance.memory.usedJSHeapSize;
        const mockDataManager = this.gameEngine?.testSupportTools?.getMockDataManager();
        
        const start = performance.now();
        
        // 大量のオブジェクト生成
        const allocations = [];
        for (let i = 0; i < 1000; i++) {
            const bubbles = mockDataManager ? 
                mockDataManager.generateMockBubbles(10) : [];
            allocations.push(bubbles);
        }
        
        const allocationTime = performance.now() - start;
        const peakMemory = performance.memory.usedJSHeapSize;
        
        // クリーンアップ
        allocations.length = 0;
        
        // ガベージコレクションを促す
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        
        return {
            allocationTime: allocationTime,
            initialMemory: initialMemory,
            peakMemory: peakMemory,
            finalMemory: finalMemory,
            memoryAllocated: peakMemory - initialMemory,
            memoryReleased: peakMemory - finalMemory,
            objectsAllocated: 10000,
            success: true
        };
    }

    async benchmarkAudioProcessing() {
        const audioManager = this.gameEngine?.audioManager;
        if (!audioManager) {
            return { error: 'AudioManager not available', success: false };
        }

        const start = performance.now();
        
        // 音声処理のシミュレーション
        for (let i = 0; i < 100; i++) {
            // 音声エフェクトの処理をシミュレート
            if (audioManager.playEffect) {
                // 実際の音声再生はしない（テスト用）
                const effectName = ['pop', 'combo', 'bonus'][i % 3];
                // audioManager.playEffect(effectName); // コメントアウトして処理時間のみ測定
            }
        }
        
        const processingTime = performance.now() - start;
        
        return {
            processingTime: processingTime,
            effectsProcessed: 100,
            avgTimePerEffect: processingTime / 100,
            success: true
        };
    }

    destroy() {
        this.benchmarks.clear();
    }
}