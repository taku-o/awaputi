/**
 * PerformanceThresholdManager - Manages performance baselines and thresholds
 * Part of the PerformanceDataAnalyzer split implementation
 */

export class PerformanceThresholdManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // Threshold configuration
        this.thresholdConfig = {
            adaptiveThresholds: true,
            staticThresholds: new Map(),
            dynamicThresholds: new Map(),
            violationSensitivity: 0.8,
            adaptationRate: 0.1
        };
        
        // Threshold violations tracking
        this.violations = [];
        this.violationCounters = new Map();
        
        // Baseline management
        this.baselineHistory = new Map();
        this.baselineStats = new Map();
        
        this.initializeDefaultThresholds();
        
        console.log('[PerformanceThresholdManager] Threshold management component initialized');
    }
    
    /**
     * Initialize default thresholds
     */
    initializeDefaultThresholds() {
        // Static performance thresholds
        this.thresholdConfig.staticThresholds.set('fps', {
            min: 30,
            target: 60,
            max: 120,
            critical: 15,
            warning: 45
        });
        
        this.thresholdConfig.staticThresholds.set('frame_time', {
            min: 8,      // ~120 FPS
            target: 16.67, // 60 FPS
            max: 33.33,   // 30 FPS
            critical: 66.67, // 15 FPS
            warning: 22.22   // 45 FPS
        });
        
        this.thresholdConfig.staticThresholds.set('memory_used', {
            min: 50,     // MB
            target: 200,  // MB
            max: 1000,   // MB
            critical: 2000, // MB
            warning: 800    // MB
        });
        
        this.thresholdConfig.staticThresholds.set('network_latency', {
            min: 0,
            target: 50,   // ms
            max: 200,     // ms
            critical: 1000, // ms
            warning: 300    // ms
        });
        
        // Initialize dynamic thresholds to match static ones
        for (const [metricId, thresholds] of this.thresholdConfig.staticThresholds) {
            this.thresholdConfig.dynamicThresholds.set(metricId, { ...thresholds });
        }
    }
    
    /**
     * Update baseline and thresholds
     * @param {string} metricId - Metric identifier
     * @param {number} value - Current metric value
     */
    updateBaseline(metricId, value) {
        if (typeof value !== 'number' || !isFinite(value)) return;
        
        // Track baseline history
        if (!this.baselineHistory.has(metricId)) {
            this.baselineHistory.set(metricId, []);
        }
        
        const history = this.baselineHistory.get(metricId);
        history.push({ timestamp: Date.now(), value });
        
        // Keep reasonable history size
        if (history.length > 1000) {
            history.shift();
        }
        
        // Update baseline statistics
        this.updateBaselineStats(metricId, history);
        
        // Update dynamic thresholds if adaptive mode is enabled
        if (this.thresholdConfig.adaptiveThresholds) {
            this.updateDynamicThresholds(metricId, value);
        }
    }
    
    /**
     * Update baseline statistics
     * @param {string} metricId - Metric identifier
     * @param {Array} history - Baseline history
     */
    updateBaselineStats(metricId, history) {
        if (history.length === 0) return;
        
        const values = history.map(h => h.value);
        const stats = {
            count: values.length,
            mean: this.calculateMean(values),
            median: this.calculateMedian(values),
            std: Math.sqrt(this.calculateVariance(values)),
            min: Math.min(...values),
            max: Math.max(...values),
            p25: this.calculatePercentile(values, 25),
            p75: this.calculatePercentile(values, 75),
            p95: this.calculatePercentile(values, 95),
            updated: Date.now()
        };
        
        this.baselineStats.set(metricId, stats);
    }
    
    /**
     * Update dynamic thresholds based on baseline
     * @param {string} metricId - Metric identifier
     * @param {number} currentValue - Current value
     */
    updateDynamicThresholds(metricId, currentValue) {
        const stats = this.baselineStats.get(metricId);
        if (!stats) return;
        
        const dynamicThresholds = this.thresholdConfig.dynamicThresholds.get(metricId);
        const staticThresholds = this.thresholdConfig.staticThresholds.get(metricId);
        
        if (!dynamicThresholds || !staticThresholds) return;
        
        const adaptationRate = this.thresholdConfig.adaptationRate;
        
        // Calculate adaptive thresholds based on metric type
        let newThresholds;
        
        switch (metricId) {
            case 'fps':
                newThresholds = this.calculateFPSThresholds(stats, staticThresholds);
                break;
            case 'frame_time':
                newThresholds = this.calculateFrameTimeThresholds(stats, staticThresholds);
                break;
            case 'memory_used':
                newThresholds = this.calculateMemoryThresholds(stats, staticThresholds);
                break;
            case 'network_latency':
                newThresholds = this.calculateNetworkThresholds(stats, staticThresholds);
                break;
            default:
                newThresholds = this.calculateGenericThresholds(stats, staticThresholds);
        }
        
        // Apply exponential smoothing to threshold updates
        for (const [key, newValue] of Object.entries(newThresholds)) {
            if (dynamicThresholds[key] !== undefined) {
                dynamicThresholds[key] = adaptationRate * newValue + (1 - adaptationRate) * dynamicThresholds[key];
            }
        }
    }
    
    /**
     * Calculate FPS-specific thresholds
     * @param {object} stats - Baseline statistics
     * @param {object} staticThresholds - Static thresholds
     * @returns {object} New thresholds
     */
    calculateFPSThresholds(stats, staticThresholds) {
        // For FPS, use percentiles to set thresholds
        return {
            target: Math.max(staticThresholds.min, stats.p75),
            warning: Math.max(staticThresholds.critical, stats.p25),
            critical: Math.max(staticThresholds.critical, stats.p25 * 0.5)
        };
    }
    
    /**
     * Calculate frame time specific thresholds
     * @param {object} stats - Baseline statistics
     * @param {object} staticThresholds - Static thresholds
     * @returns {object} New thresholds
     */
    calculateFrameTimeThresholds(stats, staticThresholds) {
        // For frame time, lower is better
        return {
            target: Math.min(staticThresholds.max, stats.p25),
            warning: Math.min(staticThresholds.warning, stats.p75),
            critical: Math.min(staticThresholds.critical, stats.p95)
        };
    }
    
    /**
     * Calculate memory specific thresholds
     * @param {object} stats - Baseline statistics
     * @param {object} staticThresholds - Static thresholds
     * @returns {object} New thresholds
     */
    calculateMemoryThresholds(stats, staticThresholds) {
        // For memory, allow for some growth but set reasonable limits
        return {
            target: Math.min(staticThresholds.max, stats.p75 * 1.2),
            warning: Math.min(staticThresholds.warning, stats.p90 * 1.5),
            critical: Math.min(staticThresholds.critical, stats.max * 2)
        };
    }
    
    /**
     * Calculate network specific thresholds
     * @param {object} stats - Baseline statistics
     * @param {object} staticThresholds - Static thresholds
     * @returns {object} New thresholds
     */
    calculateNetworkThresholds(stats, staticThresholds) {
        // For network latency, account for variance
        const variance = stats.std * stats.std;
        return {
            target: Math.min(staticThresholds.max, stats.p75 + stats.std),
            warning: Math.min(staticThresholds.warning, stats.p90 + stats.std * 2),
            critical: Math.min(staticThresholds.critical, stats.p95 + stats.std * 3)
        };
    }
    
    /**
     * Calculate generic thresholds
     * @param {object} stats - Baseline statistics
     * @param {object} staticThresholds - Static thresholds
     * @returns {object} New thresholds
     */
    calculateGenericThresholds(stats, staticThresholds) {
        return {
            target: stats.median,
            warning: stats.p75 + stats.std,
            critical: stats.p95 + stats.std * 2
        };
    }
    
    /**
     * Check for threshold violations
     * @param {string} metricId - Metric identifier
     * @param {number} value - Current value
     * @returns {object|null} Violation info or null
     */
    checkThresholdViolation(metricId, value) {
        const thresholds = this.thresholdConfig.dynamicThresholds.get(metricId);
        if (!thresholds || typeof value !== 'number') return null;
        
        let violationType = null;
        let violationSeverity = 'none';
        
        // Check for violations based on metric type
        switch (metricId) {
            case 'fps':
                if (value < thresholds.critical) {
                    violationType = 'critical_low';
                    violationSeverity = 'critical';
                } else if (value < thresholds.warning) {
                    violationType = 'warning_low';
                    violationSeverity = 'warning';
                }
                break;
                
            case 'frame_time':
            case 'memory_used':
            case 'network_latency':
                if (value > thresholds.critical) {
                    violationType = 'critical_high';
                    violationSeverity = 'critical';
                } else if (value > thresholds.warning) {
                    violationType = 'warning_high';
                    violationSeverity = 'warning';
                }
                break;
        }
        
        if (violationType) {
            const violation = {
                timestamp: Date.now(),
                metricId,
                value,
                thresholds: { ...thresholds },
                type: violationType,
                severity: violationSeverity,
                deviation: this.calculateDeviation(value, thresholds, metricId)
            };
            
            this.recordViolation(violation);
            return violation;
        }
        
        return null;
    }
    
    /**
     * Calculate deviation from threshold
     * @param {number} value - Current value
     * @param {object} thresholds - Threshold values
     * @param {string} metricId - Metric identifier
     * @returns {number} Deviation percentage
     */
    calculateDeviation(value, thresholds, metricId) {
        let referenceValue;
        
        switch (metricId) {
            case 'fps':
                referenceValue = value < thresholds.critical ? thresholds.critical : thresholds.warning;
                return (referenceValue - value) / referenceValue;
                
            case 'frame_time':
            case 'memory_used':
            case 'network_latency':
                referenceValue = value > thresholds.critical ? thresholds.critical : thresholds.warning;
                return (value - referenceValue) / referenceValue;
                
            default:
                return 0;
        }
    }
    
    /**
     * Record threshold violation
     * @param {object} violation - Violation details
     */
    recordViolation(violation) {
        this.violations.push(violation);
        
        // Keep violations history manageable
        if (this.violations.length > 1000) {
            this.violations.shift();
        }
        
        // Update violation counters
        const counterId = `${violation.metricId}_${violation.severity}`;
        this.violationCounters.set(counterId, (this.violationCounters.get(counterId) || 0) + 1);
        
        console.log(`[PerformanceThresholdManager] Threshold violation: ${violation.metricId} (${violation.severity})`);
    }
    
    /**
     * Get current thresholds for metric
     * @param {string} metricId - Metric identifier
     * @returns {object|null} Current thresholds
     */
    getThresholds(metricId) {
        return this.thresholdConfig.dynamicThresholds.get(metricId) || null;
    }
    
    /**
     * Get baseline statistics for metric
     * @param {string} metricId - Metric identifier
     * @returns {object|null} Baseline statistics
     */
    getBaselineStats(metricId) {
        return this.baselineStats.get(metricId) || null;
    }
    
    /**
     * Get recent violations
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Array} Recent violations
     */
    getRecentViolations(timeWindow = 300000) { // 5 minutes default
        const cutoff = Date.now() - timeWindow;
        return this.violations.filter(v => v.timestamp >= cutoff);
    }
    
    /**
     * Get violation statistics
     * @returns {object} Violation statistics
     */
    getViolationStats() {
        const recentViolations = this.getRecentViolations();
        const stats = {
            total: this.violations.length,
            recent: recentViolations.length,
            by_severity: {},
            by_metric: {},
            rate_per_minute: recentViolations.length / 5 // last 5 minutes
        };
        
        // Count by severity
        for (const violation of recentViolations) {
            stats.by_severity[violation.severity] = (stats.by_severity[violation.severity] || 0) + 1;
            stats.by_metric[violation.metricId] = (stats.by_metric[violation.metricId] || 0) + 1;
        }
        
        return stats;
    }
    
    /**
     * Reset violation history
     */
    resetViolations() {
        this.violations = [];
        this.violationCounters.clear();
        console.log('[PerformanceThresholdManager] Violation history reset');
    }
    
    /**
     * Configure threshold settings
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.thresholdConfig, config);
        console.log('[PerformanceThresholdManager] Configuration updated');
    }
    
    /**
     * Export threshold data
     * @returns {object} Exported data
     */
    exportData() {
        return {
            timestamp: Date.now(),
            config: this.thresholdConfig,
            baselineStats: Object.fromEntries(this.baselineStats),
            violations: this.violations.slice(-100), // Last 100 violations
            violationCounters: Object.fromEntries(this.violationCounters)
        };
    }
    
    /**
     * Import threshold data
     * @param {object} data - Data to import
     * @returns {boolean} Success status
     */
    importData(data) {
        try {
            if (data.config) {
                Object.assign(this.thresholdConfig, data.config);
            }
            
            if (data.baselineStats) {
                this.baselineStats = new Map(Object.entries(data.baselineStats));
            }
            
            if (data.violations && Array.isArray(data.violations)) {
                this.violations.push(...data.violations);
            }
            
            if (data.violationCounters) {
                this.violationCounters = new Map(Object.entries(data.violationCounters));
            }
            
            console.log('[PerformanceThresholdManager] Data imported successfully');
            return true;
            
        } catch (error) {
            console.error('[PerformanceThresholdManager] Import failed:', error);
            return false;
        }
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
    
    /**
     * Cleanup threshold manager resources
     */
    destroy() {
        this.violations = [];
        this.violationCounters.clear();
        this.baselineHistory.clear();
        this.baselineStats.clear();
        this.thresholdConfig.staticThresholds.clear();
        this.thresholdConfig.dynamicThresholds.clear();
        console.log('[PerformanceThresholdManager] Threshold manager destroyed');
    }
}