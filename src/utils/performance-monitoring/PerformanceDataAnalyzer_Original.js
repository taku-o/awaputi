/**
 * PerformanceDataAnalyzer - Performance data analysis component
 * Handles performance data analysis, trend analysis, statistical processing, and performance insights generation
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class PerformanceDataAnalyzer {
    constructor(performanceMonitoringSystem) {
        this.performanceMonitoringSystem = performanceMonitoringSystem;
        this.errorHandler = getErrorHandler();
        
        // Analysis configuration
        this.analysisConfig = {
            trendAnalysisWindow: 300000, // 5 minutes
            anomalyDetectionSensitivity: 0.8,
            statisticalWindow: 60000, // 1 minute
            insightGenerationInterval: 60000, // 1 minute
            performanceBaseline: new Map(),
            adaptiveThresholds: true
        };
        
        // Analysis state
        this.analysisHistory = [];
        this.trends = new Map();
        this.anomalies = [];
        this.insights = [];
        this.statisticalData = new Map();
        
        // Baseline performance data
        this.performanceBaseline = new Map();
        this.baselineCalibrated = false;
        this.calibrationSamples = [];
        this.calibrationTarget = 100; // samples needed
        
        // Trend analysis
        this.trendAnalyzers = new Map();
        this.initializeTrendAnalyzers();
        
        // Statistical processors
        this.statisticalProcessors = new Map();
        this.initializeStatisticalProcessors();
        
        // Insight generators
        this.insightGenerators = new Map();
        this.initializeInsightGenerators();
        
        console.log('[PerformanceDataAnalyzer] Performance data analysis component initialized');
    }
    
    /**
     * Initialize trend analyzers
     */
    initializeTrendAnalyzers() {
        // FPS trend analyzer
        this.trendAnalyzers.set('fps', {
            type: 'moving_average',
            window: 30,
            sensitivity: 0.1,
            history: [],
            trend: 'stable'
        });
        
        // Memory usage trend analyzer
        this.trendAnalyzers.set('memory_used', {
            type: 'linear_regression',
            window: 50,
            sensitivity: 0.05,
            history: [],
            trend: 'stable'
        });
        
        // Frame time variance analyzer
        this.trendAnalyzers.set('frame_variance', {
            type: 'exponential_smoothing',
            alpha: 0.3,
            window: 20,
            history: [],
            trend: 'stable'
        });
        
        // Network latency analyzer
        this.trendAnalyzers.set('network_latency', {
            type: 'moving_average',
            window: 15,
            sensitivity: 0.2,
            history: [],
            trend: 'stable'
        });
    }
    
    /**
     * Initialize statistical processors
     */
    initializeStatisticalProcessors() {
        // Descriptive statistics processor
        this.statisticalProcessors.set('descriptive', {
            metrics: ['fps', 'memory_used', 'frame_time', 'network_latency'],
            calculate: (data) => this.calculateDescriptiveStats(data)
        });
        
        // Correlation analysis processor
        this.statisticalProcessors.set('correlation', {
            metricPairs: [
                ['fps', 'frame_time'],
                ['memory_used', 'frame_variance'],
                ['network_latency', 'response_time']
            ],
            calculate: (data) => this.calculateCorrelations(data)
        });
        
        // Performance distribution processor
        this.statisticalProcessors.set('distribution', {
            metrics: ['fps', 'frame_time'],
            calculate: (data) => this.calculateDistributions(data)
        });
        
        // Outlier detection processor
        this.statisticalProcessors.set('outliers', {
            metrics: ['fps', 'memory_used', 'frame_time'],
            method: 'iqr', // interquartile range
            calculate: (data) => this.detectOutliers(data)
        });
    }
    
    /**
     * Initialize insight generators
     */
    initializeInsightGenerators() {
        // Performance bottleneck detector
        this.insightGenerators.set('bottlenecks', {
            priority: 'high',
            frequency: 30000, // 30 seconds
            lastGenerated: 0,
            generate: (data) => this.generateBottleneckInsights(data)
        });
        
        // Optimization opportunities detector
        this.insightGenerators.set('optimization', {
            priority: 'medium',
            frequency: 60000, // 1 minute
            lastGenerated: 0,
            generate: (data) => this.generateOptimizationInsights(data)
        });
        
        // Performance degradation detector
        this.insightGenerators.set('degradation', {
            priority: 'high',
            frequency: 15000, // 15 seconds
            lastGenerated: 0,
            generate: (data) => this.generateDegradationInsights(data)
        });
        
        // Resource utilization analyzer
        this.insightGenerators.set('resources', {
            priority: 'medium',
            frequency: 45000, // 45 seconds
            lastGenerated: 0,
            generate: (data) => this.generateResourceInsights(data)
        });
    }
    
    /**
     * Analyze performance data
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    async analyzePerformanceData(timestamp, metrics) {
        try {
            // Add to analysis history
            this.addToAnalysisHistory(timestamp, metrics);
            
            // Update baseline if needed
            this.updatePerformanceBaseline(metrics);
            
            // Perform trend analysis
            this.performTrendAnalysis(timestamp, metrics);
            
            // Detect anomalies
            this.detectAnomalies(timestamp, metrics);
            
            // Process statistical data
            this.processStatisticalData(timestamp, metrics);
            
            // Generate insights
            await this.generateInsights(timestamp, metrics);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceDataAnalyzer.analyzePerformanceData'
            });
        }
    }
    
    /**
     * Add data to analysis history
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    addToAnalysisHistory(timestamp, metrics) {
        const dataPoint = {
            timestamp,
            metrics: new Map(metrics)
        };
        
        this.analysisHistory.push(dataPoint);
        
        // Keep history manageable
        const maxHistory = 1000;
        if (this.analysisHistory.length > maxHistory) {
            this.analysisHistory.shift();
        }
    }
    
    /**
     * Update performance baseline
     * @param {Map} metrics - Performance metrics
     */
    updatePerformanceBaseline(metrics) {
        if (!this.baselineCalibrated) {
            // Collect calibration samples
            this.calibrationSamples.push(new Map(metrics));
            
            if (this.calibrationSamples.length >= this.calibrationTarget) {
                this.calibrateBaseline();
            }
        } else if (this.analysisConfig.adaptiveThresholds) {
            // Continuously update baseline with exponential smoothing
            this.updateAdaptiveBaseline(metrics);
        }
    }
    
    /**
     * Calibrate performance baseline
     */
    calibrateBaseline() {
        const metricSums = new Map();
        const metricCounts = new Map();
        
        // Calculate average values for each metric
        for (const sample of this.calibrationSamples) {
            for (const [metricId, value] of sample) {
                if (typeof value === 'number') {
                    metricSums.set(metricId, (metricSums.get(metricId) || 0) + value);
                    metricCounts.set(metricId, (metricCounts.get(metricId) || 0) + 1);
                }
            }
        }
        
        // Set baseline values
        for (const [metricId, sum] of metricSums) {
            const count = metricCounts.get(metricId);
            this.performanceBaseline.set(metricId, sum / count);
        }
        
        this.baselineCalibrated = true;
        this.calibrationSamples = []; // Free memory
        
        console.log('[PerformanceDataAnalyzer] Performance baseline calibrated');
    }
    
    /**
     * Update adaptive baseline
     * @param {Map} metrics - Current metrics
     */
    updateAdaptiveBaseline(metrics) {
        const alpha = 0.1; // Smoothing factor
        
        for (const [metricId, value] of metrics) {
            if (typeof value === 'number') {
                const baseline = this.performanceBaseline.get(metricId) || value;
                const newBaseline = alpha * value + (1 - alpha) * baseline;
                this.performanceBaseline.set(metricId, newBaseline);
            }
        }
    }
    
    /**
     * Perform trend analysis
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    performTrendAnalysis(timestamp, metrics) {
        for (const [metricId, analyzer] of this.trendAnalyzers) {
            const value = metrics.get(metricId);
            if (value === undefined) continue;
            
            try {
                // Add to analyzer history
                analyzer.history.push({ timestamp, value });
                
                // Keep window size
                if (analyzer.history.length > analyzer.window) {
                    analyzer.history.shift();
                }
                
                // Calculate trend
                analyzer.trend = this.calculateTrend(analyzer);
                
                // Store trend data
                this.trends.set(metricId, {
                    trend: analyzer.trend,
                    confidence: this.calculateTrendConfidence(analyzer),
                    timestamp,
                    analyzer: analyzer.type
                });
                
            } catch (error) {
                console.warn(`[PerformanceDataAnalyzer] Trend analysis failed for ${metricId}:`, error);
            }
        }
    }
    
    /**
     * Calculate trend for analyzer
     * @param {object} analyzer - Trend analyzer
     * @returns {string} Trend direction
     */
    calculateTrend(analyzer) {
        if (analyzer.history.length < 3) return 'stable';
        
        switch (analyzer.type) {
            case 'moving_average':
                return this.calculateMovingAverageTrend(analyzer);
            case 'linear_regression':
                return this.calculateLinearRegressionTrend(analyzer);
            case 'exponential_smoothing':
                return this.calculateExponentialSmoothingTrend(analyzer);
            default:
                return 'stable';
        }
    }
    
    /**
     * Calculate moving average trend
     * @param {object} analyzer - Trend analyzer
     * @returns {string} Trend direction
     */
    calculateMovingAverageTrend(analyzer) {
        const halfWindow = Math.floor(analyzer.window / 2);
        const recent = analyzer.history.slice(-halfWindow);
        const older = analyzer.history.slice(-analyzer.window, -halfWindow);
        
        if (recent.length === 0 || older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, h) => sum + h.value, 0) / older.length;
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (Math.abs(change) < analyzer.sensitivity) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }
    
    /**
     * Calculate linear regression trend
     * @param {object} analyzer - Trend analyzer
     * @returns {string} Trend direction
     */
    calculateLinearRegressionTrend(analyzer) {
        const data = analyzer.history.map((h, i) => ({ x: i, y: h.value }));
        const slope = this.calculateLinearRegressionSlope(data);
        
        if (Math.abs(slope) < analyzer.sensitivity) return 'stable';
        return slope > 0 ? 'increasing' : 'decreasing';
    }
    
    /**
     * Calculate linear regression slope
     * @param {Array} data - Data points with x, y values
     * @returns {number} Slope value
     */
    calculateLinearRegressionSlope(data) {
        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + d.x, 0);
        const sumY = data.reduce((sum, d) => sum + d.y, 0);
        const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
        const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }
    
    /**
     * Calculate exponential smoothing trend
     * @param {object} analyzer - Trend analyzer
     * @returns {string} Trend direction
     */
    calculateExponentialSmoothingTrend(analyzer) {
        if (analyzer.history.length < 2) return 'stable';
        
        let smoothed = analyzer.history[0].value;
        for (let i = 1; i < analyzer.history.length; i++) {
            smoothed = analyzer.alpha * analyzer.history[i].value + (1 - analyzer.alpha) * smoothed;
        }
        
        const current = analyzer.history[analyzer.history.length - 1].value;
        const change = (current - smoothed) / smoothed;
        
        if (Math.abs(change) < analyzer.sensitivity) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }
    
    /**
     * Calculate trend confidence
     * @param {object} analyzer - Trend analyzer
     * @returns {number} Confidence score (0-1)
     */
    calculateTrendConfidence(analyzer) {
        if (analyzer.history.length < 3) return 0;
        
        // Calculate variance in trend direction
        const values = analyzer.history.map(h => h.value);
        const variance = this.calculateVariance(values);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const coefficientOfVariation = Math.sqrt(variance) / mean;
        
        // Lower variance = higher confidence
        return Math.max(0, 1 - coefficientOfVariation);
    }
    
    /**
     * Detect anomalies in performance data
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    detectAnomalies(timestamp, metrics) {
        if (!this.baselineCalibrated) return;
        
        for (const [metricId, value] of metrics) {
            if (typeof value !== 'number') continue;
            
            const baseline = this.performanceBaseline.get(metricId);
            if (baseline === undefined) continue;
            
            try {
                const anomalyScore = this.calculateAnomalyScore(metricId, value, baseline);
                
                if (anomalyScore > this.analysisConfig.anomalyDetectionSensitivity) {
                    const anomaly = {
                        timestamp,
                        metricId,
                        value,
                        baseline,
                        score: anomalyScore,
                        severity: this.calculateAnomalySeverity(anomalyScore)
                    };
                    
                    this.anomalies.push(anomaly);
                    
                    // Keep anomalies history manageable
                    if (this.anomalies.length > 100) {
                        this.anomalies.shift();
                    }
                    
                    console.log(`[PerformanceDataAnalyzer] Anomaly detected: ${metricId} (score: ${anomalyScore.toFixed(2)})`);
                }
                
            } catch (error) {
                console.warn(`[PerformanceDataAnalyzer] Anomaly detection failed for ${metricId}:`, error);
            }
        }
    }
    
    /**
     * Calculate anomaly score
     * @param {string} metricId - Metric ID
     * @param {number} value - Current value
     * @param {number} baseline - Baseline value
     * @returns {number} Anomaly score (0-1)
     */
    calculateAnomalyScore(metricId, value, baseline) {
        // Calculate relative deviation from baseline
        const deviation = Math.abs(value - baseline) / baseline;
        
        // Apply metric-specific scaling
        const metricWeights = {
            'fps': 2.0,           // FPS drops are critical
            'memory_used': 1.5,   // Memory increases are important
            'frame_time': 2.0,    // Frame time spikes are critical
            'network_latency': 1.2, // Network issues are noticeable
            'input_lag': 1.8      // Input lag is very noticeable
        };
        
        const weight = metricWeights[metricId] || 1.0;
        return Math.min(1.0, deviation * weight);
    }
    
    /**
     * Calculate anomaly severity
     * @param {number} score - Anomaly score
     * @returns {string} Severity level
     */
    calculateAnomalySeverity(score) {
        if (score >= 0.9) return 'critical';
        if (score >= 0.7) return 'high';
        if (score >= 0.5) return 'medium';
        return 'low';
    }
    
    /**
     * Process statistical data
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    processStatisticalData(timestamp, metrics) {
        // Get recent data for statistical analysis
        const recentData = this.getRecentAnalysisData(this.analysisConfig.statisticalWindow);
        
        for (const [processorId, processor] of this.statisticalProcessors) {
            try {
                const stats = processor.calculate(recentData);
                this.statisticalData.set(processorId, {
                    timestamp,
                    stats,
                    dataPoints: recentData.length
                });
                
            } catch (error) {
                console.warn(`[PerformanceDataAnalyzer] Statistical processing failed for ${processorId}:`, error);
            }
        }
    }
    
    /**
     * Get recent analysis data
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Array} Recent data points
     */
    getRecentAnalysisData(timeWindow) {
        const now = Date.now();
        return this.analysisHistory.filter(point => 
            now - point.timestamp < timeWindow
        );
    }
    
    /**
     * Calculate descriptive statistics
     * @param {Array} data - Data points
     * @returns {object} Descriptive statistics
     */
    calculateDescriptiveStats(data) {
        const stats = {};
        
        for (const processor of this.statisticalProcessors.get('descriptive').metrics) {
            const values = data.map(point => point.metrics.get(processor))
                              .filter(val => typeof val === 'number');
            
            if (values.length === 0) continue;
            
            stats[processor] = {
                count: values.length,
                mean: this.calculateMean(values),
                median: this.calculateMedian(values),
                std: Math.sqrt(this.calculateVariance(values)),
                min: Math.min(...values),
                max: Math.max(...values),
                p25: this.calculatePercentile(values, 25),
                p75: this.calculatePercentile(values, 75),
                p95: this.calculatePercentile(values, 95)
            };
        }
        
        return stats;
    }
    
    /**
     * Calculate correlations between metrics
     * @param {Array} data - Data points
     * @returns {object} Correlation matrix
     */
    calculateCorrelations(data) {
        const correlations = {};
        
        for (const [metric1, metric2] of this.statisticalProcessors.get('correlation').metricPairs) {
            const values1 = data.map(point => point.metrics.get(metric1))
                               .filter(val => typeof val === 'number');
            const values2 = data.map(point => point.metrics.get(metric2))
                               .filter(val => typeof val === 'number');
            
            if (values1.length === values2.length && values1.length > 1) {
                correlations[`${metric1}_${metric2}`] = this.calculateCorrelation(values1, values2);
            }
        }
        
        return correlations;
    }
    
    /**
     * Calculate distributions for metrics
     * @param {Array} data - Data points
     * @returns {object} Distribution data
     */
    calculateDistributions(data) {
        const distributions = {};
        
        for (const metricId of this.statisticalProcessors.get('distribution').metrics) {
            const values = data.map(point => point.metrics.get(metricId))
                              .filter(val => typeof val === 'number');
            
            if (values.length > 10) {
                distributions[metricId] = this.calculateHistogram(values, 10);
            }
        }
        
        return distributions;
    }
    
    /**
     * Detect outliers in metrics
     * @param {Array} data - Data points
     * @returns {object} Outlier data
     */
    detectOutliers(data) {
        const outliers = {};
        
        for (const metricId of this.statisticalProcessors.get('outliers').metrics) {
            const values = data.map(point => point.metrics.get(metricId))
                              .filter(val => typeof val === 'number');
            
            if (values.length > 4) {
                outliers[metricId] = this.detectIQROutliers(values);
            }
        }
        
        return outliers;
    }
    
    /**
     * Generate performance insights
     * @param {number} timestamp - Current timestamp
     * @param {Map} metrics - Current metrics
     */
    async generateInsights(timestamp, metrics) {
        for (const [generatorId, generator] of this.insightGenerators) {
            try {
                // Check if it's time to generate insights
                if (timestamp - generator.lastGenerated < generator.frequency) {
                    continue;
                }
                
                const insights = await generator.generate({
                    timestamp,
                    metrics,
                    history: this.analysisHistory,
                    trends: this.trends,
                    anomalies: this.anomalies,
                    baseline: this.performanceBaseline,
                    stats: this.statisticalData
                });
                
                if (insights && insights.length > 0) {
                    this.insights.push(...insights.map(insight => ({
                        ...insight,
                        timestamp,
                        generator: generatorId,
                        priority: generator.priority
                    })));
                    
                    generator.lastGenerated = timestamp;
                }
                
            } catch (error) {
                console.warn(`[PerformanceDataAnalyzer] Insight generation failed for ${generatorId}:`, error);
            }
        }
        
        // Keep insights history manageable
        if (this.insights.length > 200) {
            this.insights.splice(0, this.insights.length - 200);
        }
    }
    
    /**
     * Generate bottleneck insights
     * @param {object} analysisData - Analysis data
     * @returns {Array} Bottleneck insights
     */
    generateBottleneckInsights(analysisData) {
        const insights = [];
        const { metrics, trends, baseline } = analysisData;
        
        // Check for FPS bottlenecks
        const fps = metrics.get('fps');
        const fpsBaseline = baseline.get('fps');
        if (fps && fpsBaseline && fps < fpsBaseline * 0.8) {
            insights.push({
                type: 'bottleneck',
                category: 'rendering',
                title: 'FPS Performance Bottleneck',
                description: `Current FPS (${fps.toFixed(1)}) is significantly below baseline (${fpsBaseline.toFixed(1)})`,
                impact: 'high',
                suggestions: ['reduce_graphics_quality', 'optimize_rendering']
            });
        }
        
        // Check for memory bottlenecks
        const memoryTrend = trends.get('memory_used');
        if (memoryTrend && memoryTrend.trend === 'increasing') {
            insights.push({
                type: 'bottleneck',
                category: 'memory',
                title: 'Memory Usage Bottleneck',
                description: 'Memory usage is consistently increasing',
                impact: 'medium',
                suggestions: ['memory_cleanup', 'check_memory_leaks']
            });
        }
        
        return insights;
    }
    
    /**
     * Generate optimization insights
     * @param {object} analysisData - Analysis data
     * @returns {Array} Optimization insights
     */
    generateOptimizationInsights(analysisData) {
        const insights = [];
        const { stats } = analysisData;
        
        const descriptiveStats = stats.get('descriptive')?.stats;
        if (!descriptiveStats) return insights;
        
        // Check for FPS optimization opportunities
        if (descriptiveStats.fps && descriptiveStats.fps.p95 > 55) {
            insights.push({
                type: 'optimization',
                category: 'rendering',
                title: 'FPS Optimization Opportunity',
                description: 'System can handle higher graphics quality settings',
                impact: 'low',
                suggestions: ['increase_graphics_quality', 'enable_advanced_features']
            });
        }
        
        return insights;
    }
    
    /**
     * Generate degradation insights
     * @param {object} analysisData - Analysis data
     * @returns {Array} Degradation insights
     */
    generateDegradationInsights(analysisData) {
        const insights = [];
        const { trends, anomalies } = analysisData;
        
        // Check for performance degradation trends
        for (const [metricId, trendData] of trends) {
            if (metricId === 'fps' && trendData.trend === 'decreasing' && trendData.confidence > 0.7) {
                insights.push({
                    type: 'degradation',
                    category: 'performance',
                    title: 'FPS Degradation Detected',
                    description: `FPS is showing a decreasing trend with ${(trendData.confidence * 100).toFixed(1)}% confidence`,
                    impact: 'high',
                    suggestions: ['investigate_performance', 'restart_application']
                });
            }
        }
        
        // Check for recent anomalies indicating degradation
        const recentAnomalies = anomalies.filter(a => 
            Date.now() - a.timestamp < 30000 && a.severity === 'critical'
        );
        
        if (recentAnomalies.length >= 3) {
            insights.push({
                type: 'degradation',
                category: 'stability',
                title: 'Performance Instability Detected',
                description: `Multiple critical anomalies detected in the last 30 seconds`,
                impact: 'critical',
                suggestions: ['emergency_mode', 'restart_application']
            });
        }
        
        return insights;
    }
    
    /**
     * Generate resource utilization insights
     * @param {object} analysisData - Analysis data
     * @returns {Array} Resource insights
     */
    generateResourceInsights(analysisData) {
        const insights = [];
        const { metrics, baseline } = analysisData;
        
        // Check memory utilization
        const memoryUsed = metrics.get('memory_used');
        const memoryBaseline = baseline.get('memory_used');
        if (memoryUsed && memoryBaseline && memoryUsed > memoryBaseline * 1.5) {
            insights.push({
                type: 'resource',
                category: 'memory',
                title: 'High Memory Utilization',
                description: `Memory usage (${memoryUsed.toFixed(1)}MB) is 50% above baseline`,
                impact: 'medium',
                suggestions: ['memory_cleanup', 'close_unused_features']
            });
        }
        
        return insights;
    }
    
    // Utility mathematical functions
    calculateMean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }
    
    calculateVariance(values) {
        const mean = this.calculateMean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
    
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    calculateCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        const meanX = this.calculateMean(x.slice(0, n));
        const meanY = this.calculateMean(y.slice(0, n));
        
        let numerator = 0;
        let sumXSquared = 0;
        let sumYSquared = 0;
        
        for (let i = 0; i < n; i++) {
            const deltaX = x[i] - meanX;
            const deltaY = y[i] - meanY;
            numerator += deltaX * deltaY;
            sumXSquared += deltaX * deltaX;
            sumYSquared += deltaY * deltaY;
        }
        
        const denominator = Math.sqrt(sumXSquared * sumYSquared);
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    calculateHistogram(values, bins) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binWidth = (max - min) / bins;
        const histogram = new Array(bins).fill(0);
        
        for (const value of values) {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
            histogram[binIndex]++;
        }
        
        return {
            bins: histogram,
            binWidth,
            min,
            max
        };
    }
    
    detectIQROutliers(values) {
        const q1 = this.calculatePercentile(values, 25);
        const q3 = this.calculatePercentile(values, 75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        return {
            outliers: values.filter(val => val < lowerBound || val > upperBound),
            bounds: { lower: lowerBound, upper: upperBound },
            iqr
        };
    }
    
    /**
     * Get analysis results
     * @returns {object} Analysis results
     */
    getAnalysisResults() {
        return {
            trends: Object.fromEntries(this.trends),
            anomalies: this.anomalies.slice(-20), // Last 20 anomalies
            insights: this.insights.slice(-50), // Last 50 insights
            statistics: Object.fromEntries(this.statisticalData),
            baseline: Object.fromEntries(this.performanceBaseline),
            calibrated: this.baselineCalibrated
        };
    }
    
    /**
     * Get trend analysis data
     * @param {string} metricId - Metric ID
     * @returns {object} Trend data
     */
    getTrendData(metricId) {
        return this.trends.get(metricId) || null;
    }
    
    /**
     * Get recent insights
     * @param {string} category - Insight category filter
     * @returns {Array} Recent insights
     */
    getRecentInsights(category = null) {
        const recent = this.insights.slice(-20);
        return category ? recent.filter(i => i.category === category) : recent;
    }
    
    /**
     * Configure analyzer
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.analysisConfig, config);
        console.log('[PerformanceDataAnalyzer] Configuration updated');
    }
    
    /**
     * Cleanup analyzer resources
     */
    destroy() {
        this.analysisHistory = [];
        this.trends.clear();
        this.anomalies = [];
        this.insights = [];
        this.statisticalData.clear();
        this.performanceBaseline.clear();
        this.calibrationSamples = [];
        
        console.log('[PerformanceDataAnalyzer] Analyzer destroyed');
    }
}