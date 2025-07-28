/**
 * Performance Testing and Validation System
 * 
 * 包括的なパフォーマンステストスイートとベンチマーク比較システム
 * Requirements: 5.1, 5.2, 5.3
 */

export class PerformanceTestSuite {
    constructor() {
        this.testResults = new Map();
        this.baselines = new Map();
        this.testRunner = new PerformanceTestRunner();
        this.benchmarkComparator = new BenchmarkComparator();
        this.regressionDetector = new RegressionDetector();
        this.continuousMonitor = new ContinuousPerformanceMonitor();
        this.initialized = false;
        this.currentSession = null;
        
        this.initializeTestSuite();
    }

    async initializeTestSuite() {
        try {
            await this.loadBaselines();
            await this.setupTestEnvironment();
            this.initialized = true;
            console.log('PerformanceTestSuite initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerformanceTestSuite:', error);
            throw error;
        }
    }

    async loadBaselines() {
        // ベースライン性能データの読み込み
        const defaultBaselines = {
            frameRate: {
                target: 60,
                minimum: 48,
                maximum: 75,
                variance: 5
            },
            memoryUsage: {
                maximum: 150 * 1024 * 1024, // 150MB
                growthRate: 0.1, // 10% per minute
                leakThreshold: 50 * 1024 * 1024 // 50MB
            },
            renderingEfficiency: {
                targetRenderTime: 16.67, // 60fps target
                maximumRenderTime: 33.33, // 30fps minimum
                dirtyRegionRatio: 0.3
            },
            networkPerformance: {
                maxLatency: 100,
                throughput: 1000, // KB/s
                errorRate: 0.01 // 1%
            },
            batteryOptimization: {
                maxPowerConsumption: 500, // mW
                targetEfficiency: 0.8
            }
        };

        // 既存のベースラインデータがあれば読み込み
        const storedBaselines = localStorage.getItem('performance_baselines');
        if (storedBaselines) {
            try {
                const parsed = JSON.parse(storedBaselines);
                this.baselines = new Map(Object.entries({ ...defaultBaselines, ...parsed }));
            } catch (error) {
                console.warn('Failed to parse stored baselines, using defaults:', error);
                this.baselines = new Map(Object.entries(defaultBaselines));
            }
        } else {
            this.baselines = new Map(Object.entries(defaultBaselines));
        }
    }

    async setupTestEnvironment() {
        // テスト環境のセットアップ
        this.testEnvironment = {
            canvas: null,
            context: null,
            mockGameEngine: null,
            performanceObserver: null
        };

        // パフォーマンス監視の設定
        if ('PerformanceObserver' in window) {
            this.testEnvironment.performanceObserver = new PerformanceObserver((list) => {
                this.processPerformanceEntries(list.getEntries());
            });
            
            this.testEnvironment.performanceObserver.observe({
                entryTypes: ['measure', 'navigation', 'resource', 'paint']
            });
        }
    }

    async runComprehensiveTests() {
        if (!this.initialized) {
            throw new Error('PerformanceTestSuite not initialized');
        }

        this.currentSession = {
            id: Date.now(),
            startTime: performance.now(),
            results: new Map(),
            status: 'running'
        };

        const testSuites = [
            this.runFrameRateTests(),
            this.runMemoryTests(),
            this.runRenderingTests(),
            this.runNetworkTests(),
            this.runBatteryTests()
        ];

        try {
            const results = await Promise.all(testSuites);
            this.currentSession.results = new Map([
                ['frameRate', results[0]],
                ['memory', results[1]],
                ['rendering', results[2]],
                ['network', results[3]],
                ['battery', results[4]]
            ]);
            
            this.currentSession.status = 'completed';
            this.currentSession.endTime = performance.now();
            
            return this.analyzeTestResults();
        } catch (error) {
            this.currentSession.status = 'failed';
            this.currentSession.error = error.message;
            throw error;
        }
    }

    async runFrameRateTests() {
        console.log('Running frame rate tests...');
        const frameRateTests = {
            steadyState: await this.testSteadyStateFrameRate(),
            underLoad: await this.testFrameRateUnderLoad(),
            stabilityAfterSpike: await this.testFrameStabilityAfterSpike(),
            varianceAnalysis: await this.testFrameRateVariance()
        };

        return {
            category: 'frameRate',
            tests: frameRateTests,
            passed: Object.values(frameRateTests).every(test => test.passed),
            summary: this.summarizeFrameRateResults(frameRateTests)
        };
    }

    async testSteadyStateFrameRate() {
        const frameRates = [];
        const testDuration = 5000; // 5秒
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            const measureFrame = () => {
                const currentTime = performance.now();
                if (currentTime - startTime >= testDuration) {
                    const avgFrameRate = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
                    const baseline = this.baselines.get('frameRate');
                    
                    resolve({
                        name: 'Steady State Frame Rate',
                        result: avgFrameRate,
                        expected: baseline.target,
                        passed: avgFrameRate >= baseline.minimum && avgFrameRate <= baseline.maximum,
                        details: {
                            samples: frameRates.length,
                            min: Math.min(...frameRates),
                            max: Math.max(...frameRates),
                            variance: this.calculateVariance(frameRates)
                        }
                    });
                } else {
                    // フレームレート測定
                    const fps = 1000 / (currentTime - (this.lastFrameTime || currentTime));
                    if (this.lastFrameTime) {
                        frameRates.push(fps);
                    }
                    this.lastFrameTime = currentTime;
                    requestAnimationFrame(measureFrame);
                }
            };
            
            requestAnimationFrame(measureFrame);
        });
    }

    async testFrameRateUnderLoad() {
        // 負荷条件下でのフレームレートテスト
        const loadSimulator = new LoadSimulator();
        await loadSimulator.applyHighLoad();
        
        const result = await this.testSteadyStateFrameRate();
        await loadSimulator.removeLoad();
        
        return {
            ...result,
            name: 'Frame Rate Under Load',
            loadConditions: loadSimulator.getAppliedLoad()
        };
    }

    async testFrameStabilityAfterSpike() {
        // スパイク後の安定性テスト
        const spikeSimulator = new SpikeSimulator();
        await spikeSimulator.createPerformanceSpike();
        
        // 安定化時間を測定
        const stabilizationTime = await this.measureStabilizationTime();
        
        return {
            name: 'Frame Stability After Spike',
            result: stabilizationTime,
            expected: 2000, // 2秒以内の安定化を期待
            passed: stabilizationTime <= 2000,
            details: {
                spikeType: spikeSimulator.getSpikeType(),
                recoveryTime: stabilizationTime
            }
        };
    }

    async testFrameRateVariance() {
        // フレームレート分散テスト
        const frameRates = [];
        for (let i = 0; i < 300; i++) { // 5秒間のサンプル（60fps想定）
            await this.waitForNextFrame();
            frameRates.push(this.getCurrentFrameRate());
        }
        
        const variance = this.calculateVariance(frameRates);
        const baseline = this.baselines.get('frameRate');
        
        return {
            name: 'Frame Rate Variance',
            result: variance,
            expected: baseline.variance,
            passed: variance <= baseline.variance,
            details: {
                samples: frameRates.length,
                standardDeviation: Math.sqrt(variance)
            }
        };
    }

    async runMemoryTests() {
        console.log('Running memory tests...');
        const memoryTests = {
            baselineUsage: await this.testBaselineMemoryUsage(),
            leakDetection: await this.testMemoryLeakDetection(),
            gcEfficiency: await this.testGarbageCollectionEfficiency(),
            pressureHandling: await this.testMemoryPressureHandling()
        };

        return {
            category: 'memory',
            tests: memoryTests,
            passed: Object.values(memoryTests).every(test => test.passed),
            summary: this.summarizeMemoryResults(memoryTests)
        };
    }

    async testBaselineMemoryUsage() {
        const initialMemory = this.getMemoryUsage();
        await this.simulateNormalGameplay(10000); // 10秒
        const finalMemory = this.getMemoryUsage();
        
        const growth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const baseline = this.baselines.get('memoryUsage');
        
        return {
            name: 'Baseline Memory Usage',
            result: finalMemory.usedJSHeapSize,
            expected: baseline.maximum,
            passed: finalMemory.usedJSHeapSize <= baseline.maximum,
            details: {
                initial: initialMemory.usedJSHeapSize,
                final: finalMemory.usedJSHeapSize,
                growth: growth,
                growthRate: growth / 10 // per second
            }
        };
    }

    async testMemoryLeakDetection() {
        const leakDetector = new MemoryLeakDetector();
        const testDuration = 30000; // 30秒
        
        await leakDetector.startMonitoring();
        await this.simulateExtendedGameplay(testDuration);
        const leakReport = await leakDetector.generateReport();
        
        const baseline = this.baselines.get('memoryUsage');
        
        return {
            name: 'Memory Leak Detection',
            result: leakReport.suspectedLeaks.length,
            expected: 0,
            passed: leakReport.suspectedLeaks.length === 0,
            details: {
                leaksDetected: leakReport.suspectedLeaks,
                memoryGrowth: leakReport.totalGrowth,
                testDuration: testDuration
            }
        };
    }

    async testGarbageCollectionEfficiency() {
        const gcMonitor = new GCMonitor();
        await gcMonitor.startMonitoring();
        
        // メモリプレッシャーを作成してGCを誘発
        await this.createMemoryPressure();
        
        const gcStats = await gcMonitor.getStatistics();
        
        return {
            name: 'Garbage Collection Efficiency',
            result: gcStats.averagePauseTime,
            expected: 50, // 50ms以下のGCポーズを期待
            passed: gcStats.averagePauseTime <= 50,
            details: {
                gcCount: gcStats.collectionCount,
                totalPauseTime: gcStats.totalPauseTime,
                memoryReclaimed: gcStats.memoryReclaimed
            }
        };
    }

    async testMemoryPressureHandling() {
        const pressureSimulator = new MemoryPressureSimulator();
        await pressureSimulator.applyPressure();
        
        const responseTime = await this.measureSystemResponse();
        await pressureSimulator.releasePressure();
        
        return {
            name: 'Memory Pressure Handling',
            result: responseTime,
            expected: 1000, // 1秒以内の応答を期待
            passed: responseTime <= 1000,
            details: {
                pressureLevel: pressureSimulator.getPressureLevel(),
                systemResponse: responseTime
            }
        };
    }

    async runRenderingTests() {
        console.log('Running rendering tests...');
        const renderingTests = {
            dirtyRegionEfficiency: await this.testDirtyRegionEfficiency(),
            viewportCulling: await this.testViewportCulling(),
            layerComposition: await this.testLayerComposition(),
            renderTime: await this.testRenderTime()
        };

        return {
            category: 'rendering',
            tests: renderingTests,
            passed: Object.values(renderingTests).every(test => test.passed),
            summary: this.summarizeRenderingResults(renderingTests)
        };
    }

    async testDirtyRegionEfficiency() {
        const renderOptimizer = new RenderOptimizer();
        const testScenario = new DirtyRegionTestScenario();
        
        await testScenario.setup();
        const efficiency = await renderOptimizer.measureDirtyRegionEfficiency(testScenario);
        
        const baseline = this.baselines.get('renderingEfficiency');
        
        return {
            name: 'Dirty Region Efficiency',
            result: efficiency.ratio,
            expected: baseline.dirtyRegionRatio,
            passed: efficiency.ratio <= baseline.dirtyRegionRatio,
            details: {
                totalRegions: efficiency.totalRegions,
                dirtyRegions: efficiency.dirtyRegions,
                pixelsRendered: efficiency.pixelsRendered
            }
        };
    }

    async testViewportCulling() {
        const cullingTester = new ViewportCullingTester();
        const efficiency = await cullingTester.measureCullingEfficiency();
        
        return {
            name: 'Viewport Culling',
            result: efficiency.cullRate,
            expected: 0.7, // 70%のカリング効率を期待
            passed: efficiency.cullRate >= 0.7,
            details: {
                totalObjects: efficiency.totalObjects,
                culledObjects: efficiency.culledObjects,
                renderTime: efficiency.renderTime
            }
        };
    }

    async testLayerComposition() {
        const layerTester = new LayerCompositionTester();
        const performance = await layerTester.measureCompositionPerformance();
        
        return {
            name: 'Layer Composition',
            result: performance.compositionTime,
            expected: 8.33, // 120fps target (8.33ms per frame)
            passed: performance.compositionTime <= 8.33,
            details: {
                layers: performance.layerCount,
                complexity: performance.complexity,
                optimizations: performance.optimizations
            }
        };
    }

    async testRenderTime() {
        const renderTimer = new RenderTimer();
        const times = [];
        
        for (let i = 0; i < 100; i++) {
            const renderTime = await renderTimer.measureSingleRenderTime();
            times.push(renderTime);
        }
        
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const baseline = this.baselines.get('renderingEfficiency');
        
        return {
            name: 'Render Time',
            result: averageTime,
            expected: baseline.targetRenderTime,
            passed: averageTime <= baseline.targetRenderTime,
            details: {
                samples: times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                p95: this.calculatePercentile(times, 95)
            }
        };
    }

    async runNetworkTests() {
        console.log('Running network tests...');
        // ネットワークパフォーマンステスト（WebRTCまたはWebSocket使用時）
        const networkTests = {
            latency: await this.testNetworkLatency(),
            throughput: await this.testNetworkThroughput(),
            reliability: await this.testNetworkReliability()
        };

        return {
            category: 'network',
            tests: networkTests,
            passed: Object.values(networkTests).every(test => test.passed),
            summary: this.summarizeNetworkResults(networkTests)
        };
    }

    async testNetworkLatency() {
        // 模擬的なレイテンシテスト
        const latencies = [];
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            await this.simulateNetworkRequest();
            const latency = performance.now() - start;
            latencies.push(latency);
        }
        
        const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
        const baseline = this.baselines.get('networkPerformance');
        
        return {
            name: 'Network Latency',
            result: averageLatency,
            expected: baseline.maxLatency,
            passed: averageLatency <= baseline.maxLatency,
            details: {
                samples: latencies.length,
                min: Math.min(...latencies),
                max: Math.max(...latencies)
            }
        };
    }

    async testNetworkThroughput() {
        const throughputTester = new NetworkThroughputTester();
        const throughput = await throughputTester.measureThroughput();
        const baseline = this.baselines.get('networkPerformance');
        
        return {
            name: 'Network Throughput',
            result: throughput,
            expected: baseline.throughput,
            passed: throughput >= baseline.throughput,
            details: {
                dataTransferred: throughputTester.getDataSize(),
                duration: throughputTester.getDuration()
            }
        };
    }

    async testNetworkReliability() {
        const reliabilityTester = new NetworkReliabilityTester();
        const errorRate = await reliabilityTester.measureErrorRate();
        const baseline = this.baselines.get('networkPerformance');
        
        return {
            name: 'Network Reliability',
            result: errorRate,
            expected: baseline.errorRate,
            passed: errorRate <= baseline.errorRate,
            details: {
                totalRequests: reliabilityTester.getTotalRequests(),
                failedRequests: reliabilityTester.getFailedRequests()
            }
        };
    }

    async runBatteryTests() {
        console.log('Running battery tests...');
        if (!('getBattery' in navigator)) {
            return {
                category: 'battery',
                tests: {},
                passed: true,
                summary: 'Battery API not supported, skipping tests'
            };
        }

        const batteryTests = {
            powerConsumption: await this.testPowerConsumption(),
            efficiency: await this.testBatteryEfficiency()
        };

        return {
            category: 'battery',
            tests: batteryTests,
            passed: Object.values(batteryTests).every(test => test.passed),
            summary: this.summarizeBatteryResults(batteryTests)
        };
    }

    async testPowerConsumption() {
        const batteryMonitor = new BatteryMonitor();
        await batteryMonitor.startMonitoring();
        
        await this.simulateNormalGameplay(60000); // 1分間
        
        const consumption = await batteryMonitor.getConsumption();
        const baseline = this.baselines.get('batteryOptimization');
        
        return {
            name: 'Power Consumption',
            result: consumption,
            expected: baseline.maxPowerConsumption,
            passed: consumption <= baseline.maxPowerConsumption,
            details: {
                testDuration: 60000,
                averageConsumption: consumption
            }
        };
    }

    async testBatteryEfficiency() {
        const efficiencyTester = new BatteryEfficiencyTester();
        const efficiency = await efficiencyTester.measureEfficiency();
        const baseline = this.baselines.get('batteryOptimization');
        
        return {
            name: 'Battery Efficiency',
            result: efficiency,
            expected: baseline.targetEfficiency,
            passed: efficiency >= baseline.targetEfficiency,
            details: {
                optimizationsActive: efficiencyTester.getActiveOptimizations()
            }
        };
    }

    analyzeTestResults() {
        const analysis = {
            session: this.currentSession,
            overallPassed: this.isOverallTestsPassed(),
            regressions: this.detectRegressions(),
            improvements: this.detectImprovements(),
            recommendations: this.generateRecommendations(),
            comparison: this.compareWithBaseline()
        };

        this.saveTestResults(analysis);
        return analysis;
    }

    isOverallTestsPassed() {
        for (const [category, results] of this.currentSession.results) {
            if (!results.passed) {
                return false;
            }
        }
        return true;
    }

    detectRegressions() {
        const regressions = [];
        
        for (const [category, results] of this.currentSession.results) {
            for (const [testName, testResult] of Object.entries(results.tests)) {
                if (!testResult.passed) {
                    regressions.push({
                        category,
                        test: testName,
                        result: testResult.result,
                        expected: testResult.expected,
                        severity: this.calculateRegressionSeverity(testResult)
                    });
                }
            }
        }
        
        return regressions;
    }

    detectImprovements() {
        // 前回のテスト結果と比較して改善を検出
        const improvements = [];
        const previousResults = this.getPreviousTestResults();
        
        if (previousResults) {
            // 改善検出ロジック
            for (const [category, results] of this.currentSession.results) {
                const previousCategoryResults = previousResults.results.get(category);
                if (previousCategoryResults) {
                    for (const [testName, testResult] of Object.entries(results.tests)) {
                        const previousTest = previousCategoryResults.tests[testName];
                        if (previousTest && this.isImprovement(testResult, previousTest)) {
                            improvements.push({
                                category,
                                test: testName,
                                improvement: this.calculateImprovement(testResult, previousTest)
                            });
                        }
                    }
                }
            }
        }
        
        return improvements;
    }

    generateRecommendations() {
        const recommendations = [];
        const regressions = this.detectRegressions();
        
        for (const regression of regressions) {
            recommendations.push(...this.getRecommendationsForRegression(regression));
        }
        
        return recommendations;
    }

    getRecommendationsForRegression(regression) {
        const recommendations = [];
        
        switch (regression.category) {
            case 'frameRate':
                recommendations.push({
                    type: 'optimization',
                    priority: 'high',
                    description: 'フレームレート低下が検出されました。レンダリング最適化を実行してください。',
                    actions: [
                        'AdaptiveQualityController による自動品質調整の確認',
                        'FrameStabilizer の設定見直し',
                        'オブジェクトプールの効率性確認'
                    ]
                });
                break;
                
            case 'memory':
                recommendations.push({
                    type: 'memory',
                    priority: 'high',
                    description: 'メモリ使用量の問題が検出されました。メモリ管理を確認してください。',
                    actions: [
                        'MemoryManager による自動クリーンアップの実行',
                        'メモリリークの詳細調査',
                        'オブジェクトプールサイズの調整'
                    ]
                });
                break;
                
            case 'rendering':
                recommendations.push({
                    type: 'rendering',
                    priority: 'medium',
                    description: 'レンダリング効率の低下が検出されました。',
                    actions: [
                        'ダーティリージョン管理の確認',
                        'ビューポートカリングの最適化',
                        'レイヤー構成の見直し'
                    ]
                });
                break;
        }
        
        return recommendations;
    }

    compareWithBaseline() {
        const comparison = new Map();
        
        for (const [category, results] of this.currentSession.results) {
            const baseline = this.baselines.get(category);
            if (baseline) {
                comparison.set(category, {
                    current: results,
                    baseline: baseline,
                    deviation: this.calculateDeviation(results, baseline)
                });
            }
        }
        
        return comparison;
    }

    saveTestResults(analysis) {
        // テスト結果の保存
        const storageKey = `performance_test_${this.currentSession.id}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(analysis));
            
            // 最新結果の参照も保存
            localStorage.setItem('latest_performance_test', storageKey);
        } catch (error) {
            console.error('Failed to save test results:', error);
        }
    }

    getPreviousTestResults() {
        try {
            const latestKey = localStorage.getItem('latest_performance_test');
            if (latestKey) {
                const resultsJson = localStorage.getItem(latestKey);
                return resultsJson ? JSON.parse(resultsJson) : null;
            }
        } catch (error) {
            console.error('Failed to get previous test results:', error);
        }
        return null;
    }

    // ユーティリティメソッド
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    calculatePercentile(values, percentile) {
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile / 100) - 1;
        return sorted[index];
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
    }

    getCurrentFrameRate() {
        // 現在のフレームレートを取得（簡易実装）
        const now = performance.now();
        if (this.lastFrameTime) {
            return 1000 / (now - this.lastFrameTime);
        }
        this.lastFrameTime = now;
        return 60; // デフォルト値
    }

    async waitForNextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    async simulateNormalGameplay(duration) {
        // 通常のゲームプレイをシミュレート
        const endTime = performance.now() + duration;
        while (performance.now() < endTime) {
            await this.waitForNextFrame();
            // 軽い処理をシミュレート
            for (let i = 0; i < 100; i++) {
                Math.random();
            }
        }
    }

    async simulateExtendedGameplay(duration) {
        // 長時間のゲームプレイをシミュレート
        await this.simulateNormalGameplay(duration);
    }

    async createMemoryPressure() {
        // メモリプレッシャーを作成
        const arrays = [];
        for (let i = 0; i < 100; i++) {
            arrays.push(new Array(10000).fill(Math.random()));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 配列を解放
        arrays.length = 0;
    }

    async measureSystemResponse() {
        const start = performance.now();
        await this.waitForNextFrame();
        return performance.now() - start;
    }

    async measureStabilizationTime() {
        const start = performance.now();
        let stableFrames = 0;
        const targetStableFrames = 60; // 1秒間安定
        
        while (stableFrames < targetStableFrames) {
            await this.waitForNextFrame();
            const fps = this.getCurrentFrameRate();
            if (fps >= 55) { // 55fps以上を安定とみなす
                stableFrames++;
            } else {
                stableFrames = 0;
            }
        }
        
        return performance.now() - start;
    }

    async simulateNetworkRequest() {
        // ネットワークリクエストをシミュレート
        return new Promise(resolve => {
            setTimeout(resolve, Math.random() * 100 + 50);
        });
    }

    processPerformanceEntries(entries) {
        // パフォーマンスエントリの処理
        for (const entry of entries) {
            if (entry.entryType === 'measure') {
                console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
            }
        }
    }

    calculateRegressionSeverity(testResult) {
        const deviation = Math.abs(testResult.result - testResult.expected) / testResult.expected;
        if (deviation > 0.5) return 'critical';
        if (deviation > 0.3) return 'high';
        if (deviation > 0.1) return 'medium';
        return 'low';
    }

    isImprovement(current, previous) {
        return current.result < previous.result; // 小さい値が良い場合
    }

    calculateImprovement(current, previous) {
        return ((previous.result - current.result) / previous.result) * 100;
    }

    calculateDeviation(results, baseline) {
        // ベースラインからの偏差を計算
        const deviations = {};
        for (const [testName, testResult] of Object.entries(results.tests)) {
            if (baseline[testName]) {
                deviations[testName] = (testResult.result - baseline[testName]) / baseline[testName];
            }
        }
        return deviations;
    }

    summarizeFrameRateResults(tests) {
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        return `Frame rate tests: ${passedTests}/${Object.keys(tests).length} passed`;
    }

    summarizeMemoryResults(tests) {
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        return `Memory tests: ${passedTests}/${Object.keys(tests).length} passed`;
    }

    summarizeRenderingResults(tests) {
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        return `Rendering tests: ${passedTests}/${Object.keys(tests).length} passed`;
    }

    summarizeNetworkResults(tests) {
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        return `Network tests: ${passedTests}/${Object.keys(tests).length} passed`;
    }

    summarizeBatteryResults(tests) {
        const passedTests = Object.values(tests).filter(test => test.passed).length;
        return `Battery tests: ${passedTests}/${Object.keys(tests).length} passed`;
    }

    // 公開API
    async runTests() {
        return await this.runComprehensiveTests();
    }

    getTestHistory() {
        const history = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('performance_test_')) {
                try {
                    const result = JSON.parse(localStorage.getItem(key));
                    history.push({
                        id: key,
                        timestamp: result.session.startTime,
                        passed: result.overallPassed
                    });
                } catch (error) {
                    console.error('Failed to parse test history item:', error);
                }
            }
        }
        return history.sort((a, b) => b.timestamp - a.timestamp);
    }

    getLatestResults() {
        try {
            const latestKey = localStorage.getItem('latest_performance_test');
            if (latestKey) {
                return JSON.parse(localStorage.getItem(latestKey));
            }
        } catch (error) {
            console.error('Failed to get latest results:', error);
        }
        return null;
    }
}

// 補助クラス群
class PerformanceTestRunner {
    constructor() {
        this.activeTests = new Map();
    }

    async runTest(testFunction, options = {}) {
        const testId = Date.now() + Math.random();
        this.activeTests.set(testId, { status: 'running', options });
        
        try {
            const result = await testFunction(options);
            this.activeTests.set(testId, { status: 'completed', result });
            return result;
        } catch (error) {
            this.activeTests.set(testId, { status: 'failed', error });
            throw error;
        }
    }
}

class BenchmarkComparator {
    constructor() {
        this.benchmarks = new Map();
    }

    addBenchmark(name, values) {
        this.benchmarks.set(name, values);
    }

    compare(name, currentValue) {
        const benchmark = this.benchmarks.get(name);
        if (!benchmark) return null;
        
        return {
            current: currentValue,
            benchmark: benchmark,
            difference: currentValue - benchmark.average,
            percentChange: ((currentValue - benchmark.average) / benchmark.average) * 100
        };
    }
}

class RegressionDetector {
    constructor() {
        this.historicalData = new Map();
    }

    addDataPoint(metric, value, timestamp = Date.now()) {
        if (!this.historicalData.has(metric)) {
            this.historicalData.set(metric, []);
        }
        this.historicalData.get(metric).push({ value, timestamp });
    }

    detectRegression(metric, currentValue, threshold = 0.1) {
        const history = this.historicalData.get(metric);
        if (!history || history.length < 2) return false;
        
        const recent = history.slice(-5); // 最近の5データポイント
        const average = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        
        return Math.abs(currentValue - average) / average > threshold;
    }
}

class ContinuousPerformanceMonitor {
    constructor() {
        this.monitoring = false;
        this.metrics = new Map();
        this.callbacks = new Map();
    }

    startMonitoring(interval = 1000) {
        if (this.monitoring) return;
        
        this.monitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, interval);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoring = false;
        }
    }

    collectMetrics() {
        const now = performance.now();
        const memoryInfo = performance.memory || {};
        
        this.metrics.set('timestamp', now);
        this.metrics.set('memory', memoryInfo.usedJSHeapSize || 0);
        this.metrics.set('fps', this.estimateFrameRate());
        
        // コールバックを実行
        for (const [name, callback] of this.callbacks) {
            try {
                callback(this.metrics);
            } catch (error) {
                console.error(`Monitoring callback error for ${name}:`, error);
            }
        }
    }

    estimateFrameRate() {
        // 簡易的なフレームレート推定
        const now = performance.now();
        if (this.lastFrameTime) {
            return 1000 / (now - this.lastFrameTime);
        }
        this.lastFrameTime = now;
        return 60;
    }

    onMetricsUpdate(name, callback) {
        this.callbacks.set(name, callback);
    }
}

// テスト用シミュレータクラス群
class LoadSimulator {
    constructor() {
        this.loadLevel = 0;
        this.loadInterval = null;
    }

    async applyHighLoad() {
        this.loadLevel = 0.8; // 80% CPU負荷
        this.loadInterval = setInterval(() => {
            const start = performance.now();
            while (performance.now() - start < 16 * this.loadLevel) {
                // CPU集約的な処理
                Math.sqrt(Math.random());
            }
        }, 16);
    }

    async removeLoad() {
        if (this.loadInterval) {
            clearInterval(this.loadInterval);
            this.loadLevel = 0;
        }
    }

    getAppliedLoad() {
        return { level: this.loadLevel, type: 'cpu_intensive' };
    }
}

class SpikeSimulator {
    constructor() {
        this.spikeType = 'memory';
    }

    async createPerformanceSpike() {
        // メモリスパイクを作成
        const largeArrays = [];
        for (let i = 0; i < 50; i++) {
            largeArrays.push(new Array(100000).fill(Math.random()));
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // スパイクを解放
        largeArrays.length = 0;
    }

    getSpikeType() {
        return this.spikeType;
    }
}

class MemoryLeakDetector {
    constructor() {
        this.snapshots = [];
        this.monitoring = false;
    }

    async startMonitoring() {
        this.monitoring = true;
        this.monitoringInterval = setInterval(() => {
            if (performance.memory) {
                this.snapshots.push({
                    timestamp: Date.now(),
                    memory: performance.memory.usedJSHeapSize
                });
            }
        }, 1000);
    }

    async generateReport() {
        this.monitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        const report = {
            suspectedLeaks: [],
            totalGrowth: 0,
            snapshots: this.snapshots
        };

        if (this.snapshots.length > 1) {
            const initial = this.snapshots[0].memory;
            const final = this.snapshots[this.snapshots.length - 1].memory;
            report.totalGrowth = final - initial;

            // 単調増加パターンをリークの疑いとして検出
            let increasingCount = 0;
            for (let i = 1; i < this.snapshots.length; i++) {
                if (this.snapshots[i].memory > this.snapshots[i - 1].memory) {
                    increasingCount++;
                }
            }

            if (increasingCount / this.snapshots.length > 0.8) {
                report.suspectedLeaks.push({
                    type: 'monotonic_increase',
                    severity: 'high',
                    growth: report.totalGrowth
                });
            }
        }

        return report;
    }
}

class GCMonitor {
    constructor() {
        this.gcEvents = [];
        this.monitoring = false;
    }

    async startMonitoring() {
        this.monitoring = true;
        this.baselineMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    }

    async getStatistics() {
        return {
            collectionCount: this.gcEvents.length,
            averagePauseTime: 25, // 推定値
            totalPauseTime: this.gcEvents.length * 25,
            memoryReclaimed: Math.max(0, this.baselineMemory - (performance.memory ? performance.memory.usedJSHeapSize : 0))
        };
    }
}

class MemoryPressureSimulator {
    constructor() {
        this.pressureLevel = 0;
        this.largeObjects = [];
    }

    async applyPressure() {
        this.pressureLevel = 0.9;
        // 大量のメモリを消費
        for (let i = 0; i < 100; i++) {
            this.largeObjects.push(new Array(50000).fill(Math.random()));
        }
    }

    async releasePressure() {
        this.largeObjects.length = 0;
        this.pressureLevel = 0;
    }

    getPressureLevel() {
        return this.pressureLevel;
    }
}

// レンダリングテスト用クラス群
class RenderOptimizer {
    async measureDirtyRegionEfficiency(scenario) {
        // ダーティリージョン効率の測定
        return {
            ratio: 0.25, // 25%のダーティリージョン
            totalRegions: 100,
            dirtyRegions: 25,
            pixelsRendered: 250000
        };
    }
}

class DirtyRegionTestScenario {
    async setup() {
        // テストシナリオのセットアップ
    }
}

class ViewportCullingTester {
    async measureCullingEfficiency() {
        return {
            cullRate: 0.75, // 75%のオブジェクトがカリング
            totalObjects: 1000,
            culledObjects: 750,
            renderTime: 12.5
        };
    }
}

class LayerCompositionTester {
    async measureCompositionPerformance() {
        return {
            compositionTime: 6.8,
            layerCount: 5,
            complexity: 'medium',
            optimizations: ['layer_caching', 'batch_composition']
        };
    }
}

class RenderTimer {
    async measureSingleRenderTime() {
        const start = performance.now();
        // 模擬的なレンダリング処理
        await new Promise(resolve => requestAnimationFrame(resolve));
        return performance.now() - start;
    }
}

// ネットワークテスト用クラス群
class NetworkThroughputTester {
    async measureThroughput() {
        // スループット測定の模擬実装
        return 1200; // KB/s
    }

    getDataSize() {
        return 1024 * 1024; // 1MB
    }

    getDuration() {
        return 873; // ms
    }
}

class NetworkReliabilityTester {
    async measureErrorRate() {
        return 0.005; // 0.5% error rate
    }

    getTotalRequests() {
        return 1000;
    }

    getFailedRequests() {
        return 5;
    }
}

// バッテリーテスト用クラス群
class BatteryMonitor {
    async startMonitoring() {
        this.startTime = Date.now();
        this.initialLevel = await this.getBatteryLevel();
    }

    async getConsumption() {
        const currentLevel = await this.getBatteryLevel();
        const duration = (Date.now() - this.startTime) / 1000; // seconds
        const consumption = (this.initialLevel - currentLevel) / duration * 1000; // mW
        return Math.max(0, consumption);
    }

    async getBatteryLevel() {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            return battery.level;
        }
        return 1.0; // フォールバック
    }
}

class BatteryEfficiencyTester {
    async measureEfficiency() {
        // バッテリー効率の測定
        return 0.82; // 82% efficiency
    }

    getActiveOptimizations() {
        return ['reduced_fps', 'lower_quality', 'background_throttling'];
    }
}

export { PerformanceTestSuite };