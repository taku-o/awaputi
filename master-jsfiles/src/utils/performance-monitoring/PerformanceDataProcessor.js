/**
 * PerformanceDataProcessor - Processes and analyzes performance data
 * Part of the PerformanceDataAnalyzer split implementation
 */

export class PerformanceDataProcessor {
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // Trend analysis data
        this.trends = new Map();
        
        // Statistical processing data
        this.statisticalData = new Map();
        
        // Initialize processors
        this.initializeStatisticalProcessors();
        
        console.log('[PerformanceDataProcessor] Data processing component initialized');
    }
    
    /**
     * Initialize statistical processors
     */
    initializeStatisticalProcessors() {
        // Descriptive statistics processor
        this.statisticalProcessors = new Map();
        
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
     * Perform trend analysis
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    performTrendAnalysis(timestamp, metrics) {
        for (const [metricId, analyzer] of this.mainController.trendAnalyzers) {
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
                console.warn(`[PerformanceDataProcessor] Trend analysis failed for ${metricId}:`, error);
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
     * Process statistical data
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    processStatisticalData(timestamp, metrics) {
        // Get recent data for statistical analysis
        const recentData = this.mainController.metricsCollector.getRecentAnalysisData(
            this.mainController.analysisConfig.statisticalWindow
        );
        
        for (const [processorId, processor] of this.statisticalProcessors) {
            try {
                const stats = processor.calculate(recentData);
                this.statisticalData.set(processorId, {
                    timestamp,
                    stats,
                    dataPoints: recentData.length
                });
                
            } catch (error) {
                console.warn(`[PerformanceDataProcessor] Statistical processing failed for ${processorId}:`, error);
            }
        }
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
    
    // Mathematical utility functions
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
     * Get trend analysis data
     * @param {string} metricId - Metric ID
     * @returns {object} Trend data
     */
    getTrendData(metricId) {
        return this.trends.get(metricId) || null;
    }
    
    /**
     * Get all trends
     * @returns {Map} All trend data
     */
    getAllTrends() {
        return new Map(this.trends);
    }
    
    /**
     * Get statistical data
     * @param {string} processorId - Processor ID
     * @returns {object} Statistical data
     */
    getStatisticalData(processorId) {
        return this.statisticalData.get(processorId) || null;
    }
    
    /**
     * Get all statistical data
     * @returns {Map} All statistical data
     */
    getAllStatisticalData() {
        return new Map(this.statisticalData);
    }
    
    /**
     * Clear processing data
     */
    clearData() {
        this.trends.clear();
        this.statisticalData.clear();
        console.log('[PerformanceDataProcessor] Processing data cleared');
    }
    
    /**
     * Cleanup processor resources
     */
    destroy() {
        this.trends.clear();
        this.statisticalData.clear();
        this.statisticalProcessors.clear();
        console.log('[PerformanceDataProcessor] Processor destroyed');
    }
}