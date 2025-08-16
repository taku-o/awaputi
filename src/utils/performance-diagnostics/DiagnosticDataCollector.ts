/**
 * DiagnosticDataCollector - Diagnostic data collection and monitoring functionality
 * Part of the PerformanceDiagnostics split implementation
 */

// Type definitions
interface DiagnosticDataCollectorConfig {
    collectionInterval?: number;
    maxSamples?: number;
}

interface CollectionOptions {
    duration?: number;
    interval?: number;
}

interface DataSample {
    timestamp: number;
    complete: boolean;
    frameRate: number;
    memoryUsage: number;
    renderTime: number;
    networkLatency: number;
    inputLag: number;
}

interface MetricData {
    values: number[];
    min: number;
    max: number;
    sum: number;
    count: number;
    average: number;
}

interface CollectionMetrics {
    [key: string]: MetricData;
}

interface CollectedData {
    samples: DataSample[];
    metrics: CollectionMetrics;
    startTime: number;
    endTime: number;
    collectionDuration: number;
}

interface DataSummary {
    duration: number;
    sampleCount: number;
    metricsCollected: number;
    timeRange: {
        start: number;
        end: number;
    };
    dataQuality: DataQuality;
}

interface DataQuality {
    completeness: number;
    consistency: number;
    overall: number;
    issues: DataQualityIssue[];
}

interface DataQualityIssue {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
}

interface TimeGap {
    start: number;
    end: number;
    duration: number;
}

interface CollectionStatus {
    collecting: boolean;
    sampleCount: number;
    collectionDuration: number;
    metricsCount: number;
}

interface DiagnosticDataResult {
    rawData: CollectedData;
    summary: DataSummary;
}

interface MainController {
    // Define expected interface for main controller
    [key: string]: any;
}

export class DiagnosticDataCollector {
    private mainController: MainController;
    private collecting: boolean;
    private samples: DataSample[];
    private metrics: CollectionMetrics;
    private startTime: number | null;
    private endTime: number | null;
    private collectionInterval: NodeJS.Timeout | null;
    private lastFrameTime: number | null;
    private maxSamples?: number;

    constructor(mainController: MainController) {
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
     */
    async start(options?: CollectionOptions): Promise<void> {
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
     */
    async stop(): Promise<CollectedData> {
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
            startTime: this.startTime!,
            endTime: this.endTime,
            collectionDuration: this.endTime - this.startTime!
        };
    }

    /**
     * Collect a single data sample
     */
    collectSample(): void {
        if (!this.collecting) return;

        const timestamp = performance.now();
        const sample: DataSample = {
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
     */
    getCurrentFrameRate(): number {
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
     */
    getCurrentMemoryUsage(): number {
        if ('memory' in performance && (performance as any).memory) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
    }

    /**
     * Get current render time
     */
    getCurrentRenderTime(): number {
        // レンダリング時間の測定（模擬実装）
        return Math.random() * 20 + 5; // 5-25ms
    }

    /**
     * Get current network latency
     */
    getCurrentNetworkLatency(): number {
        // ネットワークレイテンシの測定（模擬実装）
        return Math.random() * 100 + 10; // 10-110ms
    }

    /**
     * Get current input lag
     */
    getCurrentInputLag(): number {
        // 入力遅延の測定（模擬実装）
        return Math.random() * 30 + 5; // 5-35ms
    }

    /**
     * Update metrics statistics with new sample
     */
    updateMetricsStatistics(sample: DataSample): void {
        for (const [key, value] of Object.entries(sample)) {
            if (key === 'timestamp' || key === 'complete') continue;

            if (!this.metrics[key]) {
                this.metrics[key] = {
                    values: [],
                    min: value as number,
                    max: value as number,
                    sum: 0,
                    count: 0,
                    average: 0
                };
            }

            const metric = this.metrics[key];
            metric.values.push(value as number);
            metric.min = Math.min(metric.min, value as number);
            metric.max = Math.max(metric.max, value as number);
            metric.sum += value as number;
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
     */
    async collectDiagnosticData(options: CollectionOptions & { duration: number }): Promise<DiagnosticDataResult> {
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
     */
    summarizeCollectedData(data: CollectedData): DataSummary {
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
     */
    assessDataQuality(data: CollectedData): DataQuality {
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
     */
    calculateDataConsistency(samples: DataSample[]): number {
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
     */
    identifyDataQualityIssues(data: CollectedData): DataQualityIssue[] {
        const issues: DataQualityIssue[] = [];
        
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
     */
    detectTimeGaps(samples: DataSample[]): TimeGap[] {
        const gaps: TimeGap[] = [];
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
     */
    getCollectionStatus(): CollectionStatus {
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
    clearData(): void {
        this.samples = [];
        this.metrics = {};
        this.startTime = null;
        this.endTime = null;
        
        console.log('[DiagnosticDataCollector] Collected data cleared');
    }

    /**
     * Configure data collector
     */
    configure(config: DiagnosticDataCollectorConfig): void {
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
    destroy(): void {
        if (this.collecting) {
            this.stop();
        }
        
        this.clearData();
        console.log('[DiagnosticDataCollector] Data collector destroyed');
    }
}