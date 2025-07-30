/**
 * Benchmark Suite
 * ゲームコンポーネントの包括的パフォーマンステストシステム
 */

export class BenchmarkSuite {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.benchmarks = new Map();
        this.baselines = new Map();
        this.results = new Map();
        this.isRunning = false;
        this.currentBenchmark = null;
        
        this.initialize();
    }

    initialize() {
        this.setupBenchmarks();
        this.loadBaselines();
        this.setupPerformanceObserver();
    }

    setupBenchmarks() {
        // 基本パフォーマンステスト
        this.benchmarks.set('rendering', {
            name: 'Rendering Performance',
            category: 'graphics',
            description: 'レンダリングパフォーマンスの測定',
            test: this.benchmarkRendering.bind(this),
            baseline: { avgFrameTime: 16.67, minFPS: 45 }
        });

        this.benchmarks.set('bubblePhysics', {
            name: 'Bubble Physics',
            category: 'physics',
            description: 'バブル物理演算のパフォーマンス',
            test: this.benchmarkBubblePhysics.bind(this),
            baseline: { avgTimePerBubble: 0.1, maxBubbles: 100 }
        });

        this.benchmarks.set('particleEffects', {
            name: 'Particle Effects',
            category: 'effects',
            description: 'パーティクルエフェクトのパフォーマンス',
            test: this.benchmarkParticleEffects.bind(this),
            baseline: { avgUpdateTime: 2.0, maxParticles: 500 }
        });

        this.benchmarks.set('memoryAllocation', {
            name: 'Memory Allocation',
            category: 'memory',
            description: 'メモリ割り当てパフォーマンス',
            test: this.benchmarkMemoryAllocation.bind(this),
            baseline: { allocationRate: 1000, gcFrequency: 5 }
        });

        this.benchmarks.set('audioProcessing', {
            name: 'Audio Processing',
            category: 'audio',
            description: '音声処理のパフォーマンス',
            test: this.benchmarkAudioProcessing.bind(this),
            baseline: { latency: 100, concurrentSources: 10 }
        });

        this.benchmarks.set('inputLatency', {
            name: 'Input Latency',
            category: 'input',
            description: '入力応答性の測定',
            test: this.benchmarkInputLatency.bind(this),
            baseline: { avgLatency: 50, maxLatency: 100 }
        });

        this.benchmarks.set('sceneTransition', {
            name: 'Scene Transition',
            category: 'system',
            description: 'シーン遷移のパフォーマンス',
            test: this.benchmarkSceneTransition.bind(this),
            baseline: { transitionTime: 500, memoryCleanup: 95 }
        });

        this.benchmarks.set('dataProcessing', {
            name: 'Data Processing',
            category: 'data',
            description: 'データ処理のパフォーマンス',
            test: this.benchmarkDataProcessing.bind(this),
            baseline: { processingRate: 10000, serializationTime: 100 }
        });

        // ストレステスト
        this.benchmarks.set('stressTest', {
            name: 'Stress Test',
            category: 'stress',
            description: '高負荷時のシステム安定性',
            test: this.benchmarkStressTest.bind(this),
            baseline: { stabilityScore: 90, recoveryTime: 2000 }
        });

        this.benchmarks.set('memoryStress', {
            name: 'Memory Stress',
            category: 'stress',
            description: 'メモリ負荷テスト',
            test: this.benchmarkMemoryStress.bind(this),
            baseline: { maxMemoryUsage: 200, leakRate: 0 }
        });
    }

    loadBaselines() {
        // LocalStorageからベースライン値を読み込み
        try {
            const stored = localStorage.getItem('benchmarkBaselines');
            if (stored) {
                const baselines = JSON.parse(stored);
                Object.entries(baselines).forEach(([name, baseline]) => {
                    this.baselines.set(name, baseline);
                });
            }
        } catch (error) {
            console.warn('Failed to load benchmark baselines:', error);
        }
    }

    saveBaselines() {
        try {
            const baselines = Object.fromEntries(this.baselines);
            localStorage.setItem('benchmarkBaselines', JSON.stringify(baselines));
        } catch (error) {
            console.warn('Failed to save benchmark baselines:', error);
        }
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name.startsWith('benchmark-')) {
                        this.recordPerformanceEntry(entry);
                    }
                });
            });

            this.performanceObserver.observe({ 
                entryTypes: ['measure', 'navigation', 'resource'] 
            });
        }
    }

    recordPerformanceEntry(entry) {
        if (this.currentBenchmark) {
            if (!this.currentBenchmark.performanceEntries) {
                this.currentBenchmark.performanceEntries = [];
            }
            this.currentBenchmark.performanceEntries.push({
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime,
                timestamp: Date.now()
            });
        }
    }

    // メインベンチマーク実行メソッド
    async runBenchmarks(benchmarkNames = null, options = {}) {
        if (this.isRunning) {
            throw new Error('Benchmarks are already running');
        }

        this.isRunning = true;
        const startTime = performance.now();
        
        try {
            const targets = benchmarkNames || Array.from(this.benchmarks.keys());
            const results = {};
            
            console.log(`Starting benchmark suite: ${targets.length} tests`);
            
            for (const name of targets) {
                const benchmark = this.benchmarks.get(name);
                if (!benchmark) {
                    console.warn(`Unknown benchmark: ${name}`);
                    continue;
                }

                console.log(`Running benchmark: ${benchmark.name}`);
                this.currentBenchmark = { name, startTime: performance.now() };
                
                try {
                    performance.mark(`benchmark-${name}-start`);
                    const result = await benchmark.test(options);
                    performance.mark(`benchmark-${name}-end`);
                    performance.measure(`benchmark-${name}`, 
                        `benchmark-${name}-start`, `benchmark-${name}-end`);

                    results[name] = {
                        ...result,
                        benchmark: benchmark,
                        timestamp: Date.now(),
                        executionTime: performance.now() - this.currentBenchmark.startTime,
                        success: result.success !== false
                    };

                    // ベースラインとの比較
                    results[name].comparison = this.compareWithBaseline(name, result);

                } catch (error) {
                    results[name] = {
                        success: false,
                        error: {
                            message: error.message,
                            stack: error.stack
                        },
                        benchmark: benchmark,
                        timestamp: Date.now()
                    };
                } finally {
                    this.currentBenchmark = null;
                }
            }

            const totalTime = performance.now() - startTime;
            const suiteResult = {
                results: results,
                summary: this.generateSummary(results),
                totalExecutionTime: totalTime,
                timestamp: Date.now(),
                environment: this.captureEnvironment()
            };

            this.results.set(Date.now(), suiteResult);
            return suiteResult;

        } finally {
            this.isRunning = false;
        }
    }

    compareWithBaseline(name, result) {
        const baseline = this.baselines.get(name) || this.benchmarks.get(name)?.baseline;
        if (!baseline) {
            return { status: 'no_baseline' };
        }

        const comparison = {
            baseline: baseline,
            current: result,
            status: 'pass',
            details: {},
            overallScore: 100
        };

        let totalScore = 0;
        let criteriaCount = 0;

        // ベースラインの各基準と比較
        Object.entries(baseline).forEach(([key, baselineValue]) => {
            if (result[key] !== undefined) {
                const currentValue = result[key];
                const ratio = currentValue / baselineValue;
                
                let score = 100;
                let status = 'pass';
                
                // パフォーマンス指標の種類に応じて評価
                if (key.includes('Time') || key.includes('Latency')) {
                    // 時間系: 短いほど良い
                    if (ratio > 1.2) {
                        status = 'fail';
                        score = Math.max(0, 100 - (ratio - 1) * 100);
                    } else if (ratio > 1.1) {
                        status = 'warning';
                        score = Math.max(50, 100 - (ratio - 1) * 200);
                    }
                } else if (key.includes('FPS') || key.includes('Rate')) {
                    // レート系: 高いほど良い
                    if (ratio < 0.8) {
                        status = 'fail';
                        score = Math.max(0, ratio * 100);
                    } else if (ratio < 0.9) {
                        status = 'warning';
                        score = Math.max(50, ratio * 100);
                    }
                } else if (key.includes('Memory') || key.includes('Usage')) {
                    // メモリ系: 少ないほど良い（ただし機能によっては多くても良い場合がある）
                    if (ratio > 1.5) {
                        status = 'fail';
                        score = Math.max(0, 100 - (ratio - 1) * 50);
                    } else if (ratio > 1.3) {
                        status = 'warning';
                        score = Math.max(50, 100 - (ratio - 1) * 100);
                    }
                }

                comparison.details[key] = {
                    baseline: baselineValue,
                    current: currentValue,
                    ratio: ratio,
                    score: score,
                    status: status
                };

                totalScore += score;
                criteriaCount++;

                if (status === 'fail') {
                    comparison.status = 'fail';
                } else if (status === 'warning' && comparison.status === 'pass') {
                    comparison.status = 'warning';
                }
            }
        });

        comparison.overallScore = criteriaCount > 0 ? totalScore / criteriaCount : 100;
        return comparison;
    }

    generateSummary(results) {
        const summary = {
            total: Object.keys(results).length,
            passed: 0,
            failed: 0,
            warnings: 0,
            categories: {},
            performance: {
                avgExecutionTime: 0,
                totalExecutionTime: 0,
                regressions: [],
                improvements: []
            }
        };

        let totalExecutionTime = 0;

        Object.entries(results).forEach(([name, result]) => {
            const category = result.benchmark?.category || 'other';
            
            if (!summary.categories[category]) {
                summary.categories[category] = { passed: 0, failed: 0, warnings: 0 };
            }

            if (result.success) {
                if (result.comparison?.status === 'fail') {
                    summary.failed++;
                    summary.categories[category].failed++;
                    summary.performance.regressions.push(name);
                } else if (result.comparison?.status === 'warning') {
                    summary.warnings++;
                    summary.categories[category].warnings++;
                } else {
                    summary.passed++;
                    summary.categories[category].passed++;
                    
                    if (result.comparison?.overallScore > 110) {
                        summary.performance.improvements.push(name);
                    }
                }
            } else {
                summary.failed++;
                summary.categories[category].failed++;
            }

            totalExecutionTime += result.executionTime || 0;
        });

        summary.performance.totalExecutionTime = totalExecutionTime;
        summary.performance.avgExecutionTime = totalExecutionTime / summary.total;

        return summary;
    }

    captureEnvironment() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            hardwareConcurrency: navigator.hardwareConcurrency,
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null,
            screen: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio
            },
            timestamp: Date.now()
        };
    }

    // 個別ベンチマークメソッド
    async benchmarkRendering(options = {}) {
        const iterations = options.iterations || 120; // 2秒分のフレーム
        const canvas = this.gameEngine?.canvas;
        const ctx = canvas?.getContext('2d');
        
        if (!canvas || !ctx) {
            throw new Error('Canvas not available for rendering benchmark');
        }

        const frameTimes = [];
        const renderTimes = [];
        let droppedFrames = 0;
        const targetFrameTime = 16.67; // 60 FPS

        for (let i = 0; i < iterations; i++) {
            const frameStart = performance.now();
            
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    const renderStart = performance.now();
                    
                    // 簡単な描画処理をシミュレート
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // 複数の図形を描画
                    for (let j = 0; j < 50; j++) {
                        ctx.beginPath();
                        ctx.arc(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            Math.random() * 20 + 10,
                            0, Math.PI * 2
                        );
                        ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
                        ctx.fill();
                    }
                    
                    const renderEnd = performance.now();
                    const frameEnd = performance.now();
                    
                    const frameTime = frameEnd - frameStart;
                    const renderTime = renderEnd - renderStart;
                    
                    frameTimes.push(frameTime);
                    renderTimes.push(renderTime);
                    
                    if (frameTime > targetFrameTime * 1.5) {
                        droppedFrames++;
                    }
                    
                    resolve();
                });
            });
        }

        const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
        const minFrameTime = Math.min(...frameTimes);
        const maxFrameTime = Math.max(...frameTimes);
        const fps = 1000 / avgFrameTime;

        return {
            avgFrameTime: avgFrameTime,
            avgRenderTime: avgRenderTime,
            minFrameTime: minFrameTime,
            maxFrameTime: maxFrameTime,
            fps: fps,
            minFPS: 1000 / maxFrameTime,
            maxFPS: 1000 / minFrameTime,
            droppedFrames: droppedFrames,
            frameStability: (iterations - droppedFrames) / iterations,
            success: true
        };
    }

    async benchmarkBubblePhysics(options = {}) {
        const bubbleCount = options.bubbleCount || 100;
        const iterations = options.iterations || 60;
        
        // モックバブルデータ生成
        const bubbles = [];
        for (let i = 0; i < bubbleCount; i++) {
            bubbles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 20 + 10,
                mass: Math.random() * 2 + 1
            });
        }

        const updateTimes = [];
        const collisionCounts = [];

        for (let frame = 0; frame < iterations; frame++) {
            const startTime = performance.now();
            let collisions = 0;

            // 物理演算シミュレーション
            bubbles.forEach((bubble, i) => {
                // 位置更新
                bubble.x += bubble.vx;
                bubble.y += bubble.vy;

                // 境界チェック
                if (bubble.x < bubble.radius || bubble.x > 800 - bubble.radius) {
                    bubble.vx *= -0.8;
                    bubble.x = Math.max(bubble.radius, Math.min(800 - bubble.radius, bubble.x));
                }
                if (bubble.y < bubble.radius || bubble.y > 600 - bubble.radius) {
                    bubble.vy *= -0.8;
                    bubble.y = Math.max(bubble.radius, Math.min(600 - bubble.radius, bubble.y));
                }

                // 他のバブルとの衝突チェック（簡易版）
                for (let j = i + 1; j < bubbles.length; j++) {
                    const other = bubbles[j];
                    const dx = bubble.x - other.x;
                    const dy = bubble.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < bubble.radius + other.radius) {
                        collisions++;
                        
                        // 簡単な衝突応答
                        const overlap = bubble.radius + other.radius - distance;
                        const separationX = (dx / distance) * overlap * 0.5;
                        const separationY = (dy / distance) * overlap * 0.5;
                        
                        bubble.x += separationX;
                        bubble.y += separationY;
                        other.x -= separationX;
                        other.y -= separationY;
                    }
                }
            });

            const endTime = performance.now();
            updateTimes.push(endTime - startTime);
            collisionCounts.push(collisions);
        }

        const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;
        const avgCollisions = collisionCounts.reduce((sum, count) => sum + count, 0) / collisionCounts.length;
        const avgTimePerBubble = avgUpdateTime / bubbleCount;

        return {
            bubbleCount: bubbleCount,
            avgUpdateTime: avgUpdateTime,
            avgTimePerBubble: avgTimePerBubble,
            avgCollisions: avgCollisions,
            maxUpdateTime: Math.max(...updateTimes),
            minUpdateTime: Math.min(...updateTimes),
            totalCollisions: collisionCounts.reduce((sum, count) => sum + count, 0),
            success: true
        };
    }

    async benchmarkParticleEffects(options = {}) {
        const particleManager = this.gameEngine?.enhancedParticleManager;
        if (!particleManager) {
            return { success: false, error: 'ParticleManager not available' };
        }

        const effectCount = options.effectCount || 50;
        const updateFrames = options.updateFrames || 60;

        const generationTimes = [];
        const updateTimes = [];
        let totalParticles = 0;

        // エフェクト生成のベンチマーク
        for (let i = 0; i < effectCount; i++) {
            const startTime = performance.now();
            
            if (particleManager.createBubbleDestructionEffect) {
                particleManager.createBubbleDestructionEffect(
                    Math.random() * 800,
                    Math.random() * 600,
                    'normal'
                );
            }
            
            generationTimes.push(performance.now() - startTime);
        }

        // 更新処理のベンチマーク
        for (let frame = 0; frame < updateFrames; frame++) {
            const startTime = performance.now();
            
            if (particleManager.update) {
                particleManager.update(16.67);
            }
            
            updateTimes.push(performance.now() - startTime);
            
            if (particleManager.getActiveParticleCount) {
                totalParticles = Math.max(totalParticles, particleManager.getActiveParticleCount());
            }
        }

        const avgGenerationTime = generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length;
        const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;

        return {
            effectCount: effectCount,
            avgGenerationTime: avgGenerationTime,
            avgUpdateTime: avgUpdateTime,
            maxUpdateTime: Math.max(...updateTimes),
            totalParticles: totalParticles,
            avgParticlesPerFrame: totalParticles / updateFrames,
            generationRate: effectCount / (generationTimes.reduce((sum, time) => sum + time, 0) / 1000),
            success: true
        };
    }

    async benchmarkMemoryAllocation(options = {}) {
        if (!performance.memory) {
            return { success: false, error: 'Memory API not available' };
        }

        const iterations = options.iterations || 1000;
        const objectSize = options.objectSize || 100; // オブジェクト数

        const initialMemory = performance.memory.usedJSHeapSize;
        const allocationTimes = [];
        const memorySnapshots = [];

        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            
            // オブジェクト配列を作成（ガベージコレクション負荷をシミュレート）
            const objects = [];
            for (let j = 0; j < objectSize; j++) {
                objects.push({
                    id: Math.random().toString(36),
                    data: new Array(100).fill(Math.random()),
                    timestamp: Date.now(),
                    nested: {
                        value: Math.random(),
                        array: new Array(50).fill(0)
                    }
                });
            }
            
            allocationTimes.push(performance.now() - startTime);
            memorySnapshots.push(performance.memory.usedJSHeapSize);
            
            // オブジェクトを破棄
            objects.length = 0;
        }

        const finalMemory = performance.memory.usedJSHeapSize;
        const peakMemory = Math.max(...memorySnapshots);
        const avgAllocationTime = allocationTimes.reduce((sum, time) => sum + time, 0) / allocationTimes.length;
        const memoryLeakage = finalMemory - initialMemory;

        // ガベージコレクションを促す
        if (window.gc) {
            window.gc();
        }

        const postGCMemory = performance.memory.usedJSHeapSize;

        return {
            iterations: iterations,
            objectSize: objectSize,
            avgAllocationTime: avgAllocationTime,
            initialMemory: initialMemory,
            peakMemory: peakMemory,
            finalMemory: finalMemory,
            postGCMemory: postGCMemory,
            memoryLeakage: memoryLeakage,
            memoryEfficiency: (postGCMemory - initialMemory) / (peakMemory - initialMemory),
            allocationRate: (iterations * objectSize) / (allocationTimes.reduce((sum, time) => sum + time, 0) / 1000),
            success: true
        };
    }

    async benchmarkAudioProcessing(options = {}) {
        const audioManager = this.gameEngine?.audioManager;
        if (!audioManager) {
            return { success: false, error: 'AudioManager not available' };
        }

        const effectCount = options.effectCount || 100;
        const processingTimes = [];
        let successCount = 0;

        for (let i = 0; i < effectCount; i++) {
            const startTime = performance.now();
            
            try {
                // 音声エフェクトの処理をシミュレート
                const effectName = ['pop', 'combo', 'bonus', 'warning'][i % 4];
                
                // 実際の音声再生は避けて処理時間のみ測定
                if (audioManager.preloadEffect) {
                    await audioManager.preloadEffect(effectName);
                }
                
                successCount++;
            } catch (error) {
                // エラーは記録するが継続
            }
            
            processingTimes.push(performance.now() - startTime);
        }

        const avgProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        const maxProcessingTime = Math.max(...processingTimes);
        const minProcessingTime = Math.min(...processingTimes);

        return {
            effectCount: effectCount,
            successCount: successCount,
            avgProcessingTime: avgProcessingTime,
            maxProcessingTime: maxProcessingTime,
            minProcessingTime: minProcessingTime,
            successRate: successCount / effectCount,
            processingRate: effectCount / (processingTimes.reduce((sum, time) => sum + time, 0) / 1000),
            latency: avgProcessingTime,
            success: true
        };
    }

    async benchmarkInputLatency(options = {}) {
        const inputManager = this.gameEngine?.inputManager;
        if (!inputManager) {
            return { success: false, error: 'InputManager not available' };
        }

        const testCount = options.testCount || 50;
        const latencies = [];

        for (let i = 0; i < testCount; i++) {
            const eventTime = performance.now();
            let handledTime = null;

            // モックイベントの作成
            const mockEvent = {
                type: 'click',
                clientX: Math.random() * 800,
                clientY: Math.random() * 600,
                timestamp: eventTime,
                preventDefault: () => {},
                stopPropagation: () => {}
            };

            // イベントハンドリング時間の測定
            const handler = () => {
                handledTime = performance.now();
            };

            inputManager.addEventListener('click', handler);
            
            // イベント処理をシミュレート
            if (inputManager.handleEvent) {
                inputManager.handleEvent(mockEvent);
            }

            inputManager.removeEventListener('click', handler);

            if (handledTime) {
                latencies.push(handledTime - eventTime);
            }

            // 次のテストまで少し待機
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const avgLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
        const maxLatency = Math.max(...latencies);
        const minLatency = Math.min(...latencies);

        return {
            testCount: testCount,
            avgLatency: avgLatency,
            maxLatency: maxLatency,
            minLatency: minLatency,
            latencyVariance: this.calculateVariance(latencies),
            responseRate: latencies.length / testCount,
            success: true
        };
    }

    async benchmarkSceneTransition(options = {}) {
        const sceneManager = this.gameEngine?.sceneManager;
        if (!sceneManager) {
            return { success: false, error: 'SceneManager not available' };
        }

        const transitions = options.transitions || 10;
        const transitionTimes = [];
        const memoryUsages = [];

        const availableScenes = sceneManager.getAvailableScenes?.() || ['menu', 'game', 'settings'];
        if (availableScenes.length < 2) {
            return { success: false, error: 'Not enough scenes for transition test' };
        }

        for (let i = 0; i < transitions; i++) {
            const fromScene = availableScenes[i % availableScenes.length];
            const toScene = availableScenes[(i + 1) % availableScenes.length];

            const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const startTime = performance.now();

            try {
                if (sceneManager.transitionTo) {
                    await sceneManager.transitionTo(toScene);
                }
            } catch (error) {
                console.warn(`Scene transition failed: ${fromScene} -> ${toScene}`, error);
                continue;
            }

            const endTime = performance.now();
            const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

            transitionTimes.push(endTime - startTime);
            memoryUsages.push(endMemory - startMemory);

            // 次の遷移まで少し待機
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const avgTransitionTime = transitionTimes.reduce((sum, time) => sum + time, 0) / transitionTimes.length;
        const avgMemoryIncrease = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;

        return {
            transitions: transitions,
            avgTransitionTime: avgTransitionTime,
            maxTransitionTime: Math.max(...transitionTimes),
            minTransitionTime: Math.min(...transitionTimes),
            avgMemoryIncrease: avgMemoryIncrease,
            totalMemoryIncrease: memoryUsages.reduce((sum, mem) => sum + mem, 0),
            memoryEfficiency: avgMemoryIncrease < 1000000, // 1MB未満なら効率的
            success: true
        };
    }

    async benchmarkDataProcessing(options = {}) {
        const dataSize = options.dataSize || 10000;
        const operations = options.operations || ['serialize', 'deserialize', 'filter', 'sort'];

        // テストデータ生成
        const testData = [];
        for (let i = 0; i < dataSize; i++) {
            testData.push({
                id: i,
                value: Math.random() * 1000,
                category: Math.floor(Math.random() * 10),
                timestamp: Date.now() - Math.random() * 86400000,
                data: {
                    nested: Math.random().toString(36),
                    array: new Array(10).fill(0).map(() => Math.random())
                }
            });
        }

        const results = {};

        for (const operation of operations) {
            const startTime = performance.now();
            let result;

            switch (operation) {
                case 'serialize':
                    result = JSON.stringify(testData);
                    break;
                case 'deserialize':
                    const serialized = JSON.stringify(testData);
                    result = JSON.parse(serialized);
                    break;
                case 'filter':
                    result = testData.filter(item => item.value > 500);
                    break;
                case 'sort':
                    result = [...testData].sort((a, b) => a.value - b.value);
                    break;
                case 'group':
                    result = testData.reduce((groups, item) => {
                        const key = item.category;
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(item);
                        return groups;
                    }, {});
                    break;
            }

            const endTime = performance.now();
            results[operation] = {
                duration: endTime - startTime,
                rate: dataSize / ((endTime - startTime) / 1000),
                resultSize: Array.isArray(result) ? result.length : Object.keys(result).length
            };
        }

        const totalTime = Object.values(results).reduce((sum, result) => sum + result.duration, 0);
        const avgRate = Object.values(results).reduce((sum, result) => sum + result.rate, 0) / operations.length;

        return {
            dataSize: dataSize,
            operations: operations,
            totalTime: totalTime,
            avgRate: avgRate,
            results: results,
            processingRate: (dataSize * operations.length) / (totalTime / 1000),
            success: true
        };
    }

    async benchmarkStressTest(options = {}) {
        const duration = options.duration || 30000; // 30秒
        const stressLevel = options.stressLevel || 'medium';
        
        const stressConfig = {
            low: { bubbles: 50, particles: 100, effects: 5 },
            medium: { bubbles: 100, particles: 300, effects: 10 },
            high: { bubbles: 200, particles: 500, effects: 20 },
            extreme: { bubbles: 500, particles: 1000, effects: 50 }
        };

        const config = stressConfig[stressLevel] || stressConfig.medium;
        const startTime = performance.now();
        const metrics = {
            frameRates: [],
            memoryUsages: [],
            errorCount: 0,
            recoveryCount: 0
        };

        let testInterval;
        let isStable = true;

        try {
            // ストレス負荷を開始
            testInterval = setInterval(() => {
                try {
                    // FPS測定
                    const fps = this.gameEngine?.performanceOptimizer?.getCurrentFPS?.() || 0;
                    metrics.frameRates.push(fps);

                    // メモリ使用量測定
                    if (performance.memory) {
                        metrics.memoryUsages.push(performance.memory.usedJSHeapSize / 1024 / 1024);
                    }

                    // システム負荷をかける
                    this.applyStressLoad(config);

                    // 安定性チェック
                    if (fps < 20) {
                        isStable = false;
                        metrics.recoveryCount++;
                    }

                } catch (error) {
                    metrics.errorCount++;
                }
            }, 100);

            // 指定時間待機
            await new Promise(resolve => setTimeout(resolve, duration));

        } finally {
            if (testInterval) {
                clearInterval(testInterval);
            }
        }

        const avgFPS = metrics.frameRates.reduce((sum, fps) => sum + fps, 0) / metrics.frameRates.length;
        const minFPS = Math.min(...metrics.frameRates);
        const avgMemory = metrics.memoryUsages.reduce((sum, mem) => sum + mem, 0) / metrics.memoryUsages.length;
        const maxMemory = Math.max(...metrics.memoryUsages);

        const stabilityScore = ((metrics.frameRates.length - metrics.errorCount) / metrics.frameRates.length) * 100;

        return {
            duration: duration,
            stressLevel: stressLevel,
            avgFPS: avgFPS,
            minFPS: minFPS,
            avgMemory: avgMemory,
            maxMemory: maxMemory,
            errorCount: metrics.errorCount,
            recoveryCount: metrics.recoveryCount,
            stabilityScore: stabilityScore,
            isStable: isStable,
            success: true
        };
    }

    applyStressLoad(config) {
        // ストレス負荷をシミュレート
        const dummyArrays = [];
        for (let i = 0; i < config.bubbles; i++) {
            dummyArrays.push(new Array(100).fill(Math.random()));
        }

        // CPU負荷をかける計算
        let sum = 0;
        for (let i = 0; i < config.particles; i++) {
            sum += Math.sin(Math.random() * Math.PI);
        }

        // DOM操作のシミュレート
        if (document.body) {
            for (let i = 0; i < config.effects && i < 10; i++) {
                const div = document.createElement('div');
                div.style.display = 'none';
                document.body.appendChild(div);
                document.body.removeChild(div);
            }
        }
    }

    async benchmarkMemoryStress(options = {}) {
        if (!performance.memory) {
            return { success: false, error: 'Memory API not available' };
        }

        const duration = options.duration || 10000; // 10秒
        const allocationSize = options.allocationSize || 1000000; // 1MB相当
        
        const initialMemory = performance.memory.usedJSHeapSize;
        const memorySnapshots = [];
        const allocations = [];
        let leakDetected = false;

        const startTime = performance.now();
        
        const allocateMemory = () => {
            const allocation = new Array(allocationSize).fill(Math.random());
            allocations.push(allocation);
            memorySnapshots.push(performance.memory.usedJSHeapSize);
            
            // 古い割り当てを解放（リークをシミュレート）
            if (allocations.length > 10) {
                allocations.shift();
            }
        };

        // メモリ割り当てを繰り返す
        const allocationInterval = setInterval(allocateMemory, 500);

        await new Promise(resolve => setTimeout(resolve, duration));
        clearInterval(allocationInterval);

        // ガベージコレクションを促す
        if (window.gc) {
            window.gc();
        }

        const finalMemory = performance.memory.usedJSHeapSize;
        const peakMemory = Math.max(...memorySnapshots);
        const memoryIncrease = finalMemory - initialMemory;
        const memoryGrowthRate = memoryIncrease / (duration / 1000); // bytes per second

        // リーク検出（単純なヒューリスティック）
        if (memoryIncrease > allocationSize * 2) {
            leakDetected = true;
        }

        // 全ての割り当てをクリア
        allocations.length = 0;

        return {
            duration: duration,
            initialMemory: initialMemory / 1024 / 1024, // MB
            finalMemory: finalMemory / 1024 / 1024,
            peakMemory: peakMemory / 1024 / 1024,
            memoryIncrease: memoryIncrease / 1024 / 1024,
            memoryGrowthRate: memoryGrowthRate / 1024 / 1024, // MB/s
            allocationCount: memorySnapshots.length,
            leakDetected: leakDetected,
            maxMemoryUsage: peakMemory / 1024 / 1024,
            success: true
        };
    }

    // ユーティリティメソッド
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
    }

    // ベースライン管理
    updateBaseline(benchmarkName, results) {
        if (results.success) {
            this.baselines.set(benchmarkName, {
                ...results,
                timestamp: Date.now(),
                environment: this.captureEnvironment()
            });
            this.saveBaselines();
        }
    }

    getBaseline(benchmarkName) {
        return this.baselines.get(benchmarkName);
    }

    // レポート生成
    generateReport(results) {
        return {
            summary: results.summary,
            environment: results.environment,
            timestamp: results.timestamp,
            benchmarks: Object.entries(results.results).map(([name, result]) => ({
                name: name,
                category: result.benchmark?.category,
                success: result.success,
                executionTime: result.executionTime,
                comparison: result.comparison,
                keyMetrics: this.extractKeyMetrics(result)
            })),
            recommendations: this.generateRecommendations(results)
        };
    }

    extractKeyMetrics(result) {
        const keyMetrics = {};
        
        // 各ベンチマークから重要なメトリクスを抽出
        ['fps', 'avgFrameTime', 'avgUpdateTime', 'avgLatency', 'stabilityScore', 'memoryUsage'].forEach(key => {
            if (result[key] !== undefined) {
                keyMetrics[key] = result[key];
            }
        });

        return keyMetrics;
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        Object.entries(results.results).forEach(([name, result]) => {
            if (result.comparison?.status === 'fail') {
                recommendations.push({
                    type: 'performance',
                    benchmark: name,
                    issue: `Performance regression detected in ${name}`,
                    priority: 'high',
                    suggestion: this.getSuggestionForBenchmark(name, result)
                });
            } else if (result.comparison?.status === 'warning') {
                recommendations.push({
                    type: 'warning',
                    benchmark: name,
                    issue: `Performance degradation in ${name}`,
                    priority: 'medium',
                    suggestion: this.getSuggestionForBenchmark(name, result)
                });
            }
        });

        return recommendations;
    }

    getSuggestionForBenchmark(name, result) {
        const suggestions = {
            rendering: 'Consider reducing draw calls or optimizing shader usage',
            bubblePhysics: 'Optimize collision detection algorithm or reduce bubble count',
            particleEffects: 'Reduce particle count or optimize update logic',
            memoryAllocation: 'Implement object pooling to reduce GC pressure',
            audioProcessing: 'Preload audio files or reduce concurrent audio sources',
            inputLatency: 'Optimize event handling or reduce input processing complexity'
        };

        return suggestions[name] || 'Review implementation for performance bottlenecks';
    }

    // 結果の取得
    getResults(limit = 10) {
        const allResults = Array.from(this.results.entries())
            .sort(([a], [b]) => b - a) // 新しい順
            .slice(0, limit);
        
        return allResults.map(([timestamp, result]) => ({
            timestamp,
            ...result
        }));
    }

    getLatestResults() {
        const latest = Math.max(...this.results.keys());
        return this.results.get(latest);
    }

    // クリーンアップ
    destroy() {
        this.isRunning = false;
        this.benchmarks.clear();
        this.baselines.clear();
        this.results.clear();
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
    }
}

// グローバルアクセス用（デバッグ目的）
window.BenchmarkSuite = BenchmarkSuite;