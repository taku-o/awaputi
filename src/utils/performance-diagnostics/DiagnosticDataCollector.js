/**
 * DiagnosticDataCollector - Diagnostic data collection and monitoring functionality
 * Part of the PerformanceDiagnostics split implementation
 */

export class DiagnosticDataCollector {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Data collection state
        this.collecting = false;
        this.samples = [];
        this.metrics = {};
        this.startTime = null;
        this.endTime = null;
        this.collectionInterval = null;
        this.lastFrameTime = null;
        
        console.log('[DiagnosticDataCollector] Data collector component initialized');
    }
    
    /**
     * Start diagnostic data collection
     * @param {Object} options - Collection options
     */
    async start(options) {
        this.collecting = true;
        this.samples = [];
        this.metrics = {};
        this.startTime = performance.now();

        // 定期的なデータ収集
        this.collectionInterval = setInterval(() => {
            this.collectSample();
        }, 100); // 100ms間隔

        console.log('[DiagnosticDataCollector] Diagnostic data collection started');
    }

    /**
     * Stop diagnostic data collection
     * @returns {Object} Collected data
     */
    async stop() {
        this.collecting = false;
        this.endTime = performance.now();

        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }

        console.log(`[DiagnosticDataCollector] Data collection stopped. Collected ${this.samples.length} samples`);

        return {
            samples: this.samples,
            metrics: this.metrics,
            startTime: this.startTime,
            endTime: this.endTime,
            collectionDuration: this.endTime - this.startTime
        };
    }

    /**
     * Collect a single data sample
     */
    collectSample() {
        if (!this.collecting) return;

        const timestamp = performance.now();
        const sample = {
            timestamp,
            complete: true,
            frameRate: this.getCurrentFrameRate(),
            memoryUsage: this.getCurrentMemoryUsage(),
            renderTime: this.getCurrentRenderTime(),
            networkLatency: this.getCurrentNetworkLatency(),
            inputLag: this.getCurrentInputLag()
        };

        this.samples.push(sample);

        // メトリクス統計の更新
        this.updateMetricsStatistics(sample);
    }

    /**
     * Get current frame rate
     * @returns {number} Current frame rate
     */
    getCurrentFrameRate() {
        // 現在のフレームレートを取得（簡易実装）
        if (this.lastFrameTime) {
            const frameTime = performance.now() - this.lastFrameTime;
            this.lastFrameTime = performance.now();
            return frameTime > 0 ? 1000 / frameTime : 0;
        }
        this.lastFrameTime = performance.now();
        return 60; // デフォルト値
    }

    /**
     * Get current memory usage
     * @returns {number} Current memory usage in bytes
     */
    getCurrentMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    /**
     * Get current render time
     * @returns {number} Current render time in milliseconds
     */
    getCurrentRenderTime() {
        // レンダリング時間の測定（模擬実装）
        return Math.random() * 20 + 5; // 5-25ms
    }

    /**
     * Get current network latency
     * @returns {number} Current network latency in milliseconds
     */
    getCurrentNetworkLatency() {
        // ネットワークレイテンシの測定（模擬実装）
        return Math.random() * 100 + 10; // 10-110ms
    }

    /**
     * Get current input lag
     * @returns {number} Current input lag in milliseconds
     */
    getCurrentInputLag() {
        // 入力遅延の測定（模擬実装）
        return Math.random() * 30 + 5; // 5-35ms
    }

    /**
     * Update metrics statistics with new sample
     * @param {Object} sample - Sample data
     */
    updateMetricsStatistics(sample) {
        for (const [key, value] of Object.entries(sample)) {
            if (key === 'timestamp' || key === 'complete') continue;

            if (!this.metrics[key]) {
                this.metrics[key] = {
                    values: [],
                    min: value,
                    max: value,
                    sum: 0,
                    count: 0
                };
            }

            const metric = this.metrics[key];
            metric.values.push(value);
            metric.min = Math.min(metric.min, value);
            metric.max = Math.max(metric.max, value);
            metric.sum += value;
            metric.count++;
            metric.average = metric.sum / metric.count;

            // 最新100値のみ保持
            if (metric.values.length > 100) {
                metric.values.shift();
            }
        }
    }

    /**
     * Collect comprehensive diagnostic data
     * @param {Object} options - Collection options
     * @returns {Object} Collected diagnostic data
     */
    async collectDiagnosticData(options) {
        console.log('[DiagnosticDataCollector] Collecting diagnostic data...');
        
        await this.start(options);
        
        // データ収集期間の待機
        await new Promise(resolve => setTimeout(resolve, options.duration));
        
        const collectedData = await this.stop();
        
        return {
            rawData: collectedData,
            summary: this.summarizeCollectedData(collectedData)
        };
    }

    /**
     * Summarize collected data
     * @param {Object} data - Collected data
     * @returns {Object} Data summary
     */
    summarizeCollectedData(data) {
        return {
            duration: data.collectionDuration,
            sampleCount: data.samples.length,
            metricsCollected: Object.keys(data.metrics).length,
            timeRange: {
                start: data.startTime,
                end: data.endTime
            },
            dataQuality: this.assessDataQuality(data)
        };
    }

    /**
     * Assess data quality
     * @param {Object} data - Collected data
     * @returns {Object} Data quality assessment
     */
    assessDataQuality(data) {
        const completeness = data.samples.filter(s => s.complete).length / data.samples.length;
        const consistency = this.calculateDataConsistency(data.samples);
        
        return {
            completeness: completeness,
            consistency: consistency,
            overall: (completeness + consistency) / 2,
            issues: this.identifyDataQualityIssues(data)
        };
    }

    /**
     * Calculate data consistency
     * @param {Array} samples - Data samples
     * @returns {number} Consistency score (0-1)
     */
    calculateDataConsistency(samples) {
        // データの一貫性を計算
        if (samples.length < 2) return 1.0;
        
        let consistencyScore = 0;
        const expectedInterval = samples[1].timestamp - samples[0].timestamp;
        
        for (let i = 1; i < samples.length; i++) {
            const actualInterval = samples[i].timestamp - samples[i - 1].timestamp;
            const deviation = Math.abs(actualInterval - expectedInterval) / expectedInterval;
            consistencyScore += Math.max(0, 1 - deviation);
        }
        
        return consistencyScore / (samples.length - 1);
    }

    /**
     * Identify data quality issues
     * @param {Object} data - Collected data
     * @returns {Array} Array of identified issues
     */
    identifyDataQualityIssues(data) {
        const issues = [];
        
        // 欠損データの検出
        const incompleteSamples = data.samples.filter(s => !s.complete);
        if (incompleteSamples.length > data.samples.length * 0.1) {
            issues.push({
                type: 'missing_data',
                severity: 'medium',
                description: `${incompleteSamples.length} incomplete samples detected`,
                impact: 'May affect analysis accuracy'
            });
        }
        
        // 異常な時間間隔の検出
        const timeGaps = this.detectTimeGaps(data.samples);
        if (timeGaps.length > 0) {
            issues.push({
                type: 'time_gaps',
                severity: 'low',
                description: `${timeGaps.length} time gaps detected`,
                impact: 'May indicate system overload during collection'
            });
        }
        
        return issues;
    }

    /**
     * Detect time gaps in samples
     * @param {Array} samples - Data samples
     * @returns {Array} Array of detected time gaps
     */
    detectTimeGaps(samples) {
        const gaps = [];
        const expectedInterval = 100; // 100ms expected interval
        
        for (let i = 1; i < samples.length; i++) {
            const interval = samples[i].timestamp - samples[i - 1].timestamp;
            if (interval > expectedInterval * 2) {
                gaps.push({
                    start: samples[i - 1].timestamp,
                    end: samples[i].timestamp,
                    duration: interval
                });
            }
        }
        
        return gaps;
    }

    /**
     * Get collection status
     * @returns {Object} Collection status
     */
    getCollectionStatus() {
        return {
            collecting: this.collecting,
            sampleCount: this.samples.length,
            collectionDuration: this.collecting && this.startTime ? 
                performance.now() - this.startTime : 0,
            metricsCount: Object.keys(this.metrics).length
        };
    }

    /**
     * Clear collected data
     */
    clearData() {
        this.samples = [];
        this.metrics = {};
        this.startTime = null;
        this.endTime = null;
        
        console.log('[DiagnosticDataCollector] Collected data cleared');
    }

    /**
     * Configure data collector
     * @param {Object} config - Configuration options
     */
    configure(config) {
        if (config.collectionInterval !== undefined) {
            // Collection interval will be applied on next start
            console.log(`[DiagnosticDataCollector] Collection interval updated: ${config.collectionInterval}ms`);
        }
        
        if (config.maxSamples !== undefined) {
            // Update sample retention limit
            this.maxSamples = config.maxSamples;
            console.log(`[DiagnosticDataCollector] Max samples updated: ${config.maxSamples}`);
        }
    }

    /**
     * Cleanup data collector resources
     */
    destroy() {
        if (this.collecting) {
            this.stop();
        }
        
        this.clearData();
        console.log('[DiagnosticDataCollector] Data collector destroyed');
    }
}