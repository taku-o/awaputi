/**
 * PerformanceThresholdManager - Manages performance baselines and thresholds
 * Part of the PerformanceDataAnalyzer split implementation
 */

// Type definitions
interface ThresholdValues { min?: number;
    target: number;
    max?: number;
    critical: number;
   , warning: number ,}

interface ThresholdConfig { adaptiveThresholds: boolean;
   , staticThresholds: Map<string, ThresholdValues>;
    dynamicThresholds: Map<string, ThresholdValues>;
    violationSensitivity: number;
   , adaptationRate: number ,}

interface BaselinePoint { timestamp: number;
   , value: number }

interface BaselineStats { count: number;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    p25: number;
    p75: number;
    p95: number;
    p90?: number;
   , updated: number }

interface ThresholdViolation { timestamp: number;
    metricId: string;
    value: number;
    thresholds: ThresholdValues;
   , type: 'critical_low' | 'warning_low' | 'critical_high' | 'warning_high',
    severity: 'critical' | 'warning' | 'high' | 'medium' | 'low';
   , deviation: number ,}

interface ViolationStats { total: number;
    recent: number;
   , by_severity: Record<string, number>;
    by_metric: Record<string, number>;
    rate_per_minute: number ,}

interface ExportedData { timestamp: number;
    config: ThresholdConfig;
   , baselineStats: Record<string, BaselineStats>;
    violations: ThresholdViolation[];
   , violationCounters: Record<string, number> }

interface ImportData { config?: Partial<ThresholdConfig>;
    baselineStats?: Record<string, BaselineStats>;
    violations?: ThresholdViolation[];
    violationCounters?: Record<string, number>; }

interface MainController {
    errorHandler: any;
}

export class PerformanceThresholdManager {
    private mainController: MainController;
    private errorHandler: any;
    private thresholdConfig: ThresholdConfig;
    private violations: ThresholdViolation[];
    private, violationCounters: Map<string, number>;
    private baselineHistory: Map<string, BaselinePoint[]>;
    private baselineStats: Map<string, BaselineStats>;

    constructor(mainController: MainController) {

        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // Threshold configuration
        this.thresholdConfig = {
            adaptiveThresholds: true;
            staticThresholds: new Map();
            dynamicThresholds: new Map();
           , violationSensitivity: 0.8;
    ,}
            adaptationRate: 0.1 }
        };
        // Threshold violations tracking
        this.violations = [];
        this.violationCounters = new Map();
        
        // Baseline management
        this.baselineHistory = new Map();
        this.baselineStats = new Map();

        this.initializeDefaultThresholds()';
        console.log('[PerformanceThresholdManager] Threshold, management component, initialized');
    }
    
    /**
     * Initialize default thresholds'
     */''
    private initializeDefaultThresholds(''';
        this.thresholdConfig.staticThresholds.set('fps', { min: 30,
            target: 60);
            max: 120)';
           , critical: 15,')';
            warning: 45)'),

        this.thresholdConfig.staticThresholds.set('frame_time', {
            min: 8,      // ~120 FPS;
            target: 16.67, // 60 FPS;
            max: 33.33,   // 30 FPS);
            critical: 66.67, // 15 FPS')';
            warning: 22.22   // 45 FPS)'),

        this.thresholdConfig.staticThresholds.set('memory_used', {
            min: 50,     // MB;
            target: 200,  // MB;
            max: 1000,   // MB);
            critical: 2000, // MB')';
            warning: 800    // MB)'),

        this.thresholdConfig.staticThresholds.set('network_latency', {)
            min: 0);
           , target: 50,   // ms;
            max: 200,     // ms;
            critical: 1000, // ms);
            warning: 300    // ms);
        // Initialize dynamic thresholds to match static ones
        for(const [metricId, thresholds] of this.thresholdConfig.staticThresholds) {
            
        }
            this.thresholdConfig.dynamicThresholds.set(metricId, { ...thresholds ); }
    }
    
    /**
     * Update baseline and thresholds
     * @param metricId - Metric identifier
     * @param value - Current metric value
     */''
    updateBaseline(metricId: string, value: number): void { ''
        if(typeof, value !== 'number' || !isFinite(value) return;
        
        // Track baseline history
        if(!this.baselineHistory.has(metricId) {
            
        }
            this.baselineHistory.set(metricId, []); }
        }
        
        const history = this.baselineHistory.get(metricId)!;
        history.push({ timestamp: Date.now(), value });
        
        // Keep reasonable history size
        if (history.length > 1000) { history.shift(); }
        
        // Update baseline statistics
        this.updateBaselineStats(metricId, history);
        
        // Update dynamic thresholds if adaptive mode is enabled
        if (this.thresholdConfig.adaptiveThresholds) { this.updateDynamicThresholds(metricId, value); }
    }
    
    /**
     * Update baseline statistics
     * @param metricId - Metric identifier
     * @param history - Baseline history
     */
    private updateBaselineStats(metricId: string, history: BaselinePoint[]): void { if (history.length === 0) return;
        
        const values = history.map(h => h.value);
        const stats: BaselineStats = {
            count: values.length;
            mean: this.calculateMean(values);
            median: this.calculateMedian(values);
            std: Math.sqrt(this.calculateVariance(values);
            min: Math.min(...values);
            max: Math.max(...values);
           , p25: this.calculatePercentile(values, 25),
            p75: this.calculatePercentile(values, 75),
            p90: this.calculatePercentile(values, 90),
            p95: this.calculatePercentile(values, 95),
            updated: Date.now() ,}
        };
        
        this.baselineStats.set(metricId, stats);
    }
    
    /**
     * Update dynamic thresholds based on baseline
     * @param metricId - Metric identifier
     * @param currentValue - Current value
     */
    private updateDynamicThresholds(metricId: string, currentValue: number): void { const stats = this.baselineStats.get(metricId);
        if (!stats) return;
        
        const dynamicThresholds = this.thresholdConfig.dynamicThresholds.get(metricId);
        const staticThresholds = this.thresholdConfig.staticThresholds.get(metricId);
        
        if (!dynamicThresholds || !staticThresholds) return;
        
        const adaptationRate = this.thresholdConfig.adaptationRate;
        
        // Calculate adaptive thresholds based on metric type
        let newThresholds: Partial<ThresholdValues>,

        switch(metricId) {'

            case 'fps':'';
                newThresholds = this.calculateFPSThresholds(stats, staticThresholds);

                break;''
            case 'frame_time':'';
                newThresholds = this.calculateFrameTimeThresholds(stats, staticThresholds);

                break;''
            case 'memory_used':'';
                newThresholds = this.calculateMemoryThresholds(stats, staticThresholds);

                break;''
            case 'network_latency':;
                newThresholds = this.calculateNetworkThresholds(stats, staticThresholds);
                break;
            default:;
        ,}
                newThresholds = this.calculateGenericThresholds(stats, staticThresholds); }
        }
        ';
        // Apply exponential smoothing to threshold updates
        for(const [key, newValue] of Object.entries(newThresholds)) { ''
            if(dynamicThresholds[key, as keyof, ThresholdValues] !== undefined && typeof, newValue === 'number) {'
                
            }
                (dynamicThresholds, as any)[key] = adaptationRate * newValue + (1 - adaptationRate) * (dynamicThresholds, as any)[key]; }
}
    }
    
    /**
     * Calculate FPS-specific thresholds
     * @param stats - Baseline statistics
     * @param staticThresholds - Static thresholds
     * @returns New thresholds
     */
    private calculateFPSThresholds(stats: BaselineStats, staticThresholds: ThresholdValues): Partial<ThresholdValues> { // For FPS, use percentiles to set thresholds
        return { target: Math.max(staticThresholds.min || 0, stats.p75),
            warning: Math.max(staticThresholds.critical, stats.p25), };
            critical: Math.max(staticThresholds.critical, stats.p25 * 0.5); }
        }
    
    /**
     * Calculate frame time specific thresholds
     * @param stats - Baseline statistics
     * @param staticThresholds - Static thresholds
     * @returns New thresholds
     */
    private calculateFrameTimeThresholds(stats: BaselineStats, staticThresholds: ThresholdValues): Partial<ThresholdValues> { // For frame time, lower is better
        return { target: Math.min(staticThresholds.max || Infinity, stats.p25),
            warning: Math.min(staticThresholds.warning, stats.p75), };
            critical: Math.min(staticThresholds.critical, stats.p95); }
        }
    
    /**
     * Calculate memory specific thresholds
     * @param stats - Baseline statistics
     * @param staticThresholds - Static thresholds
     * @returns New thresholds
     */
    private calculateMemoryThresholds(stats: BaselineStats, staticThresholds: ThresholdValues): Partial<ThresholdValues> { // For memory, allow for some growth but set reasonable limits
        return { target: Math.min(staticThresholds.max || Infinity, stats.p75 * 1.2),
            warning: Math.min(staticThresholds.warning, (stats.p90 || stats.p95) * 1.5), };
            critical: Math.min(staticThresholds.critical, stats.max * 2); }
        }
    
    /**
     * Calculate network specific thresholds
     * @param stats - Baseline statistics
     * @param staticThresholds - Static thresholds
     * @returns New thresholds
     */
    private calculateNetworkThresholds(stats: BaselineStats, staticThresholds: ThresholdValues): Partial<ThresholdValues> { // For network latency, account for variance
        return { target: Math.min(staticThresholds.max || Infinity, stats.p75 + stats.std),
            warning: Math.min(staticThresholds.warning, (stats.p90 || stats.p95) + stats.std * 2), };
            critical: Math.min(staticThresholds.critical, stats.p95 + stats.std * 3); }
        }
    
    /**
     * Calculate generic thresholds
     * @param stats - Baseline statistics
     * @param staticThresholds - Static thresholds
     * @returns New thresholds
     */
    private calculateGenericThresholds(stats: BaselineStats, staticThresholds: ThresholdValues): Partial<ThresholdValues> { return { target: stats.median,
            warning: stats.p75 + stats.std, };
            critical: stats.p95 + stats.std * 2 }
        }
    
    /**
     * Check for threshold violations
     * @param metricId - Metric identifier
     * @param value - Current value
     * @returns Violation info or null
     */
    checkThresholdViolation(metricId: string, value: number): ThresholdViolation | null { ''
        const thresholds = this.thresholdConfig.dynamicThresholds.get(metricId);''
        if (!thresholds || typeof, value !== 'number'') return null;

        let violationType: ThresholdViolation['type] | null = null,
        let violationSeverity: ThresholdViolation['severity] = 'low',
        // Check for violations based on metric type
        switch(metricId) {'

            case 'fps':'';
                if(value < thresholds.critical) {''
                    violationType = 'critical_low';

        }

                    violationSeverity = 'critical';' }

                } else if(value < thresholds.warning) { ''
                    violationType = 'warning_low';''
                    violationSeverity = 'warning'; }
                break;

            case 'frame_time':'';
            case 'memory_used':'';
            case 'network_latency':'';
                if(value > thresholds.critical) {'

                    violationType = 'critical_high';

                }

                    violationSeverity = 'critical';' }

                } else if(value > thresholds.warning) { ''
                    violationType = 'warning_high';''
                    violationSeverity = 'warning'; }
                break;
        }
        
        if(violationType) {
        
            const violation: ThresholdViolation = {
                timestamp: Date.now();
                metricId,
        
        }
                value, }
                thresholds: { ...thresholds;
                type: violationType;
                severity: violationSeverity;
               , deviation: this.calculateDeviation(value, thresholds, metricId);
            };
            
            this.recordViolation(violation);
            return violation;
        }
        
        return null;
    }
    
    /**
     * Calculate deviation from threshold
     * @param value - Current value
     * @param thresholds - Threshold values
     * @param metricId - Metric identifier
     * @returns Deviation percentage
     */
    private calculateDeviation(value: number, thresholds: ThresholdValues, metricId: string): number { let referenceValue: number,

        switch(metricId) {'

            case 'fps':';
                referenceValue = value < thresholds.critical ? thresholds.critical: thresholds.warning,
                return(referenceValue - value) / referenceValue;

            case 'frame_time':'';
            case 'memory_used':'';
            case 'network_latency':;
                referenceValue = value > thresholds.critical ? thresholds.critical: thresholds.warning,
                return (value - referenceValue) / referenceValue
                
        
            default: return 0;
    
    /**
     * Record threshold violation
     * @param violation - Violation details
     */
    private recordViolation(violation: ThresholdViolation): void { this.violations.push(violation);
        
        // Keep violations history manageable
        if(this.violations.length > 1000) {
            
        ,}
            this.violations.shift(); }
        }
        
        // Update violation counters
        const counterId = `${violation.metricId}_${violation.severity}`;
        this.violationCounters.set(counterId, (this.violationCounters.get(counterId) || 0) + 1);
        
        console.log(`[PerformanceThresholdManager] Threshold, violation: ${violation.metricId} (${violation.severity}`});
    }
    
    /**
     * Get current thresholds for metric
     * @param metricId - Metric identifier
     * @returns Current thresholds
     */
    getThresholds(metricId: string): ThresholdValues | null { return this.thresholdConfig.dynamicThresholds.get(metricId) || null; }
    
    /**
     * Get baseline statistics for metric
     * @param metricId - Metric identifier
     * @returns Baseline statistics
     */
    getBaselineStats(metricId: string): BaselineStats | null { return this.baselineStats.get(metricId) || null; }
    
    /**
     * Get recent violations
     * @param timeWindow - Time window in milliseconds
     * @returns Recent violations
     */
    getRecentViolations(timeWindow: number = 300000): ThresholdViolation[] { // 5 minutes default
        const cutoff = Date.now() - timeWindow;
        return this.violations.filter(v => v.timestamp >= cutoff);
    
    /**
     * Get violation statistics
     * @returns Violation statistics
     */
    getViolationStats(): ViolationStats { const recentViolations = this.getRecentViolations();
        const stats: ViolationStats = {
            total: this.violations.length;
           , recent: recentViolations.length, }
            by_severity: {};
            by_metric: {};
            rate_per_minute: recentViolations.length / 5 // last 5 minutes;
        },
        
        // Count by severity
        for(const, violation of, recentViolations) {
            stats.by_severity[violation.severity] = (stats.by_severity[violation.severity] || 0) + 1;
        }
            stats.by_metric[violation.metricId] = (stats.by_metric[violation.metricId] || 0) + 1; }
        }
        
        return stats;
    }
    
    /**
     * Reset violation history
     */
    resetViolations(): void { this.violations = [];''
        this.violationCounters.clear()';
        console.log('[PerformanceThresholdManager] Violation, history reset'); }'
    
    /**
     * Configure threshold settings
     * @param config - Configuration options
     */'
    configure(config: Partial<ThresholdConfig>): void { ''
        Object.assign(this.thresholdConfig, config);''
        console.log('[PerformanceThresholdManager] Configuration, updated'); }'
    
    /**
     * Export threshold data
     * @returns Exported data
     */
    exportData(): ExportedData { return { timestamp: Date.now(),
            config: this.thresholdConfig;
            baselineStats: Object.fromEntries(this.baselineStats);
           , violations: this.violations.slice(-100), // Last 100 violations };
            violationCounters: Object.fromEntries(this.violationCounters); }
        }
    
    /**
     * Import threshold data
     * @param data - Data to import
     * @returns Success status
     */
    importData(data: ImportData): boolean { try {
            if(data.config) {
                
            }
                Object.assign(this.thresholdConfig, data.config); }
            }
            
            if (data.baselineStats) { this.baselineStats = new Map(Object.entries(data.baselineStats); }
            
            if (data.violations && Array.isArray(data.violations) { this.violations.push(...data.violations);
            
            if(data.violationCounters) {
            ';

                ';

            }

                this.violationCounters = new Map(Object.entries(data.violationCounters)); }
            }

            console.log('[PerformanceThresholdManager] Data, imported successfully);
            return true;

        } catch (error') {
            console.error('[PerformanceThresholdManager] Import failed:', error);
            return false;
    
    // Mathematical utility functions
    private calculateMean(values: number[]): number { return values.reduce((sum, val) => sum + val, 0) / values.length;
    
    private calculateMedian(values: number[]): number { const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    
    private calculateVariance(values: number[]): number { const mean = this.calculateMean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    private calculatePercentile(values: number[], percentile: number): number { const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    
    /**
     * Cleanup threshold manager resources
     */
    destroy(): void { this.violations = [];
        this.violationCounters.clear();
        this.baselineHistory.clear();
        this.baselineStats.clear();
        this.thresholdConfig.staticThresholds.clear();''
        this.thresholdConfig.dynamicThresholds.clear()';
        console.log('[PerformanceThresholdManager] Threshold, manager destroyed''); }

    }''
}