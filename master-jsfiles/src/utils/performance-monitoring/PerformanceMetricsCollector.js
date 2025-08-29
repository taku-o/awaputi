/**
 * PerformanceMetricsCollector - Collects and manages performance metrics data
 * 
 * This component is part of the PerformanceDataAnalyzer split implementation following
 * the Main Controller Pattern. It handles all metrics collection and data management
 * functionality previously contained in the main PerformanceDataAnalyzer class.
 * 
 * Responsibilities:
 * - Collect performance metrics from various sources
 * - Manage analysis history and data retention
 * - Handle calibration sample collection
 * - Maintain performance baselines and historical data
 * 
 * @class PerformanceMetricsCollector
 * @memberof PerformanceMonitoring
 * @since 1.0.0
 * @author BubblePop Team
 * 
 * @example
 * const collector = new PerformanceMetricsCollector(mainController);
 * collector.addToAnalysisHistory(timestamp, metrics);
 * const history = collector.getAnalysisHistory();
 */
export class PerformanceMetricsCollector {
    /**
     * Creates a new PerformanceMetricsCollector instance
     * 
     * @param {PerformanceDataAnalyzer} mainController - Reference to the main controller
     * @throws {Error} When mainController is not provided
     */
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // Analysis history specific to metrics collection
        this.analysisHistory = [];
        this.calibrationSamples = [];
        
        console.log('[PerformanceMetricsCollector] Metrics collection component initialized');
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
     * Update performance baseline collection
     * @param {Map} metrics - Performance metrics
     */
    updatePerformanceBaseline(metrics) {
        if (!this.mainController.baselineCalibrated) {
            // Collect calibration samples
            this.calibrationSamples.push(new Map(metrics));
            
            if (this.calibrationSamples.length >= this.mainController.calibrationTarget) {
                this.calibrateBaseline();
            }
        } else if (this.mainController.analysisConfig.adaptiveThresholds) {
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
            this.mainController.performanceBaseline.set(metricId, sum / count);
        }
        
        this.mainController.baselineCalibrated = true;
        this.calibrationSamples = []; // Free memory
        
        console.log('[PerformanceMetricsCollector] Performance baseline calibrated');
    }
    
    /**
     * Update adaptive baseline
     * @param {Map} metrics - Current metrics
     */
    updateAdaptiveBaseline(metrics) {
        const alpha = 0.1; // Smoothing factor
        
        for (const [metricId, value] of metrics) {
            if (typeof value === 'number') {
                const baseline = this.mainController.performanceBaseline.get(metricId) || value;
                const newBaseline = alpha * value + (1 - alpha) * baseline;
                this.mainController.performanceBaseline.set(metricId, newBaseline);
            }
        }
    }
    
    /**
     * Validate metrics data
     * @param {Map} metrics - Metrics to validate
     * @returns {boolean} True if valid
     */
    validateMetrics(metrics) {
        if (!(metrics instanceof Map)) {
            console.warn('[PerformanceMetricsCollector] Invalid metrics format - expected Map');
            return false;
        }
        
        let hasValidMetrics = false;
        for (const [metricId, value] of metrics) {
            if (typeof value === 'number' && !isNaN(value)) {
                hasValidMetrics = true;
                break;
            }
        }
        
        if (!hasValidMetrics) {
            console.warn('[PerformanceMetricsCollector] No valid numeric metrics found');
            return false;
        }
        
        return true;
    }
    
    /**
     * Normalize metrics data
     * @param {Map} metrics - Raw metrics data
     * @returns {Map} Normalized metrics
     */
    normalizeMetrics(metrics) {
        const normalized = new Map();
        
        for (const [metricId, value] of metrics) {
            if (typeof value === 'number' && !isNaN(value)) {
                // Apply metric-specific normalization
                let normalizedValue = value;
                
                switch (metricId) {
                    case 'fps':
                        // Ensure FPS is within reasonable bounds
                        normalizedValue = Math.max(0, Math.min(240, value));
                        break;
                    case 'memory_used':
                        // Ensure memory is positive
                        normalizedValue = Math.max(0, value);
                        break;
                    case 'frame_time':
                        // Ensure frame time is positive
                        normalizedValue = Math.max(0, value);
                        break;
                    case 'network_latency':
                        // Ensure latency is positive
                        normalizedValue = Math.max(0, value);
                        break;
                    default:
                        // Default normalization - just ensure it's a valid number
                        normalizedValue = isFinite(value) ? value : 0;
                }
                
                normalized.set(metricId, normalizedValue);
            }
        }
        
        return normalized;
    }
    
    /**
     * Create data point for collection
     * @param {number} timestamp - Timestamp
     * @param {Map} metrics - Metrics data
     * @returns {object} Data point object
     */
    createDataPoint(timestamp, metrics) {
        return {
            timestamp,
            metrics: new Map(metrics),
            collectedAt: Date.now(),
            collector: 'PerformanceMetricsCollector'
        };
    }
    
    /**
     * Get collection statistics
     * @returns {object} Collection statistics
     */
    getCollectionStats() {
        return {
            historySize: this.analysisHistory.length,
            calibrationSamples: this.calibrationSamples.length,
            calibrationComplete: this.mainController.baselineCalibrated,
            calibrationProgress: this.calibrationSamples.length / this.mainController.calibrationTarget,
            oldestDataPoint: this.analysisHistory.length > 0 ? this.analysisHistory[0].timestamp : null,
            newestDataPoint: this.analysisHistory.length > 0 ? this.analysisHistory[this.analysisHistory.length - 1].timestamp : null
        };
    }
    
    /**
     * Clear collection data
     */
    clearData() {
        this.analysisHistory = [];
        this.calibrationSamples = [];
        console.log('[PerformanceMetricsCollector] Collection data cleared');
    }
    
    /**
     * Get analysis history
     * @returns {Array} Analysis history array
     */
    getAnalysisHistory() {
        return [...this.analysisHistory];
    }
    
    /**
     * Export metrics data
     * @param {number} timeWindow - Time window for export (optional)
     * @returns {object} Exported data
     */
    exportData(timeWindow = null) {
        let dataToExport = this.analysisHistory;
        
        if (timeWindow) {
            const cutoff = Date.now() - timeWindow;
            dataToExport = this.analysisHistory.filter(point => point.timestamp >= cutoff);
        }
        
        return {
            exportedAt: Date.now(),
            timeWindow,
            dataPoints: dataToExport.length,
            data: dataToExport.map(point => ({
                timestamp: point.timestamp,
                metrics: Object.fromEntries(point.metrics)
            }))
        };
    }
    
    /**
     * Import metrics data
     * @param {object} importData - Data to import
     * @returns {boolean} Success status
     */
    importData(importData) {
        try {
            if (!importData.data || !Array.isArray(importData.data)) {
                console.warn('[PerformanceMetricsCollector] Invalid import data format');
                return false;
            }
            
            const importedPoints = importData.data.map(point => ({
                timestamp: point.timestamp,
                metrics: new Map(Object.entries(point.metrics))
            }));
            
            this.analysisHistory.push(...importedPoints);
            
            // Sort by timestamp
            this.analysisHistory.sort((a, b) => a.timestamp - b.timestamp);
            
            // Keep within limits
            const maxHistory = 1000;
            if (this.analysisHistory.length > maxHistory) {
                this.analysisHistory = this.analysisHistory.slice(-maxHistory);
            }
            
            console.log(`[PerformanceMetricsCollector] Imported ${importedPoints.length} data points`);
            return true;
            
        } catch (error) {
            console.error('[PerformanceMetricsCollector] Import failed:', error);
            return false;
        }
    }
    
    /**
     * Cleanup collector resources
     */
    destroy() {
        this.analysisHistory = [];
        this.calibrationSamples = [];
        console.log('[PerformanceMetricsCollector] Collector destroyed');
    }
}