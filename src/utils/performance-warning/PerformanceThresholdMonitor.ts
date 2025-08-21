/**
 * PerformanceThresholdMonitor - Performance threshold monitoring component
 * Handles real-time performance tracking, threshold violation detection, and monitoring configuration
 */

import { getErrorHandler  } from '../../core/ErrorHandler.js';

// 型定義
interface PerformanceThresholds { fps: { critica,l: number,
        warning: number,
        good: number,
    excellent: number,
    frameTime: { critical: number,
        warning: number;
    },
        good: number,
    excellent: number,
    memory: { critical: number,
        warning: number;
    },
        good: number,
    excellent: number,
    stability: { critical: number,
        warning: number;
    },
        good: number,
    excellent: number,
    variance: { critical: number,
        warning: number;
    },
        good: number,
    excellent: number,
    excellent: number;
        };
interface MonitoringConfig { enabled: boolean,
    interval: number,
    lastCheck: number,
    metricsBuffer: MetricsData[],
    bufferSize: number,
    bufferSize: number;
        };
interface ViolationTracking { active: Map<string, ViolationData>,
    history: ViolationHistoryEntry[],
    cooldowns: Map<string, number>;
    consecutiveCounts: Map<string, number> }

interface MetricsData { timestamp: number,
    fps: number,
    frameTime: number,
    memory: MemoryInfo,
    stability: number,
    variance: number;
    memoryHealthScore?: number;
    leakRisk?: string;
    stabilityScore?: number;
    performanceZone?: string;
    jitterLevel?: number }

interface MemoryInfo { used: number,
    total: number;
    limit?: number;
    pressure: number;
    interface ViolationData { id: string,
    severity: string,
    firstDetected: number,
    lastDetected: number,
    count: number,
    data: any,
    resolved: boolean;
    escalated?: boolean;
    escalatedAt?: number;
    interface ViolationHistoryEntry extends ViolationData { resolvedAt: number,
    duration: number;
    interface MonitoringStats { activeViolations: number,
    totalViolationsDetected: number,
    metricsBufferSize: number,
    monitoringEnabled: boolean,
    lastCheck: number,
    thresholds: PerformanceThresholds;
    export class PerformanceThresholdMonitor {
    private performanceWarningSystem: any;
    private errorHandler: any;
    private thresholds: PerformanceThresholds;
    private monitoring: MonitoringConfig;
    private violations: ViolationTracking;
    private, monitoringInterval: NodeJS.Timeout | null = null;
    constructor(performanceWarningSystem: any) {

        this.performanceWarningSystem = performanceWarningSystem;
    this.errorHandler = getErrorHandler();
        
        // Performance thresholds configuration
        this.thresholds = {
            fps: { critical: 20  ,
                warning: 30,
    good: 45 }
                excellent: 55 
    };
            frameTime: { critical: 50, // 50ms
                warning: 33, // 33ms  },
                good: 22, // 22ms;
                excellent: 18 // 18ms  };
            memory: { critical: 0.95, // 95% of limit
                warning: 0.8,   // 80% of limit  },
                good: 0.6,      // 60% of limit;
                excellent: 0.4  // 40% of limit  };
            stability: { critical: 0.3,  // 30% stability score
                warning: 0.5,   // 50% stability score  },
                good: 0.7,      // 70% stability score;
                excellent: 0.9  // 90% stability score  };
            variance: { critical: 20,   // 20ms variance
                warning: 10,    // 10ms variance  },
                good: 5,        // 5ms variance;
                excellent: 2    // 2ms variance  }
        };
        // Monitoring state
        this.monitoring = { enabled: true,
            interval: 1000, // 1 second;
            lastCheck: 0,
            metricsBuffer: [],
    bufferSize: 60 // 1 minute of data  };
        // Violation tracking
        this.violations = { active: new Map(
            history: [],
    cooldowns: new Map(
            consecutiveCounts: new Map()','
        console.log('[PerformanceThresholdMonitor] Threshold, monitoring component, initialized') }'
    
    /**
     * Start performance monitoring
     */
    startMonitoring(): void { if (!this.monitoring.enabled) return,
        
        this.monitoringInterval = setInterval(() => {  }

            this.checkPerformanceMetrics();' }'

        }, this.monitoring.interval';'

        console.log('[PerformanceThresholdMonitor] Performance, monitoring started');
    }
    
    /**
     * Stop performance monitoring
     */'
    stopMonitoring(): void { if (this.monitoringInterval) {''
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null }

        console.log('[PerformanceThresholdMonitor] Performance monitoring stopped);'
    }
    
    /**
     * Check performance metrics and detect threshold violations
     */
    checkPerformanceMetrics(): void { try {
            const now = Date.now();
            this.monitoring.lastCheck = now,
            
            // Get performance metrics from various sources
            const metrics = this.gatherPerformanceMetrics();
            // Add to metrics buffer
            this.monitoring.metricsBuffer.push({)
                timestamp: now ),
                ...metrics),
            
            // Keep buffer size manageable
            if (this.monitoring.metricsBuffer.length > this.monitoring.bufferSize) {
    
}
                this.monitoring.metricsBuffer.shift(); }
            }
            
            // Analyze metrics for threshold violations
            this.analyzeMetricsForViolations(metrics');'

        } catch (error) { this.errorHandler.handleError(error, {')'
                context: 'PerformanceThresholdMonitor.checkPerformanceMetrics'
                }
}
    /**
     * Gather performance metrics from available sources
     * @returns {object} Performance metrics
     */
    gatherPerformanceMetrics(): MetricsData { const metrics: MetricsData = {
            fps: 60,
    frameTime: 16.67 }
            memory: { used: 0, total: 0, pressure: 0  ,
            stability: 1.0,
            variance: 0,
    timestamp: Date.now();
        };
        
        try { // Try to get metrics from PerformanceOptimizer
            if ((window, as any).getPerformanceOptimizer) {
                const optimizer = (window, as any).getPerformanceOptimizer();
                if (optimizer && optimizer.getStats) {
                    const stats = optimizer.getStats();
                    metrics.fps = stats.averageFPS || stats.currentFPS || 60,
                    metrics.frameTime = stats.frameTime || 16.67,
                    metrics.stability = stats.stabilityScore || 1.0 }
                    metrics.variance = stats.frameTimeVariance || 0; }
}
            
            // Get memory information
            if ((performance, as any).memory) { const memInfo = (performance, as any).memory,
                metrics.memory = {
                    used: memInfo.usedJSHeapSize,
                    total: memInfo.totalJSHeapSize,
                    limit: memInfo.jsHeapSizeLimit,
    pressure: memInfo.jsHeapSizeLimit > 0 ? undefined : undefined
                        memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit : 0 }
            
            // Try to get metrics from MemoryManager
            if ((window, as any).getMemoryManager) { const memoryManager = (window, as any).getMemoryManager();
                if (memoryManager && memoryManager.getStats) {

                    const memStats = memoryManager.getStats(' }'

                    metrics.leakRisk = memStats.leakRiskLevel || 'low'; }
}
            );
            // Try to get metrics from FrameStabilizer)
            if ((window, as any).getFrameStabilizer) { const stabilizer = (window, as any).getFrameStabilizer();
                if (stabilizer && stabilizer.getStabilizationStatus) {

                    const status = stabilizer.getStabilizationStatus(',
                    metrics.performanceZone = status.adaptive?.performanceZone || 'optimal' }
                    metrics.jitterLevel = status.timing?.jitterLevel || 0; }'}')'
            } catch (error) { // Fallback to basic metrics if integration fails
            console.warn('[PerformanceThresholdMonitor] Failed to gather advanced metrics, using fallbacks') }'
        
        return metrics;
    }
    
    /**
     * Analyze metrics for threshold violations
     * @param {object} metrics - Current performance metrics
     */ : undefined
    analyzeMetricsForViolations(metrics: MetricsData): void { // Check FPS violations
        this.checkFPSViolations(metrics.fps);
        // Check memory violations
        this.checkMemoryViolations(metrics.memory);
        // Check stability violations
        this.checkStabilityViolations(metrics.stability || metrics.stabilityScore);
        // Check variance violations
        this.checkVarianceViolations(metrics.variance);
        // Check for performance zone violations
        if (metrics.performanceZone) {
    
}
            this.checkPerformanceZoneViolations(metrics.performanceZone); }
        }
        
        // Check for memory leak violations
        if (metrics.leakRisk) { this.checkMemoryLeakViolations(metrics.leakRisk);
        
        // Check for jitter violations
        if (metrics.jitterLevel !== undefined) { this.checkJitterViolations(metrics.jitterLevel);
    }
    
    /**
     * Check FPS-related threshold violations
     * @param {number} fps - Current FPS
     */
    checkFPSViolations(fps: number): void { const thresholds = this.thresholds.fps,

        if (fps < thresholds.critical) {

            this.recordViolation('fps_critical', 'critical', {''
                metric: 'fps),'
                value: fps','
    threshold: thresholds.critical,' }'

                severity: 'critical');' 
    } else if (fps < thresholds.warning) { ''
            this.recordViolation('fps_warning', 'warning', {''
                metric: 'fps),'
                value: fps','
    threshold: thresholds.warning,'),
                severity: 'warning')'
            }

        } else {  // Clear violations if performance improves
            this.clearViolation('fps_critical'),' }'

            this.clearViolation('fps_warning'; }'
}
    
    /**
     * Check memory-related threshold violations
     * @param {object} memory - Memory metrics
     */
    checkMemoryViolations(memory: MemoryInfo): void { if (!memory || !memory.pressure) return,
        
        const thresholds = this.thresholds.memory,

        if (memory.pressure > thresholds.critical) {

            this.recordViolation('memory_critical', 'critical', {''
                metric: 'memory_pressure,
    value: memory.pressure,
                threshold: thresholds.critical,
                severity: 'critical,
    details: {
                    used: memory.used ,
    total: memory.total  }
                    limit: memory.limit) 
    }';} else if (memory.pressure > thresholds.warning) { ''
            this.recordViolation('memory_warning', 'warning', {''
                metric: 'memory_pressure,
    value: memory.pressure,
                threshold: thresholds.warning,
                severity: 'warning,
    details: {
                    used: memory.used) ,
                    total: memory.total','
    limit: memory.limit'
            }

                }');'
        } else {
            this.clearViolation('memory_critical'),' }'

            this.clearViolation('memory_warning'; }'
}
    
    /**
     * Check stability-related threshold violations
     * @param {number} stability - Stability score (0-1)
     */
    checkStabilityViolations(stability: number | undefined): void { if (stability === undefined) return,
        
        const thresholds = this.thresholds.stability,

        if (stability < thresholds.critical) {

            this.recordViolation('stability_critical', 'critical', {''
                metric: 'stability_score),'
                value: stability','
    threshold: thresholds.critical,' }'

                severity: 'critical');' 
    } else if (stability < thresholds.warning) { ''
            this.recordViolation('stability_warning', 'warning', {''
                metric: 'stability_score),'
                value: stability','
    threshold: thresholds.warning,'),
                severity: 'warning')'
            }

        } else {
            this.clearViolation('stability_critical'),' }'

            this.clearViolation('stability_warning'; }'
}
    
    /**
     * Check frame time variance threshold violations
     * @param {number} variance - Frame time variance in ms
     */
    checkVarianceViolations(variance: number | undefined): void { if (variance === undefined) return,
        
        const thresholds = this.thresholds.variance,

        if (variance > thresholds.critical) {

            this.recordViolation('variance_critical', 'critical', {''
                metric: 'frame_variance),'
                value: variance','
    threshold: thresholds.critical,' }'

                severity: 'critical');' 
    } else if (variance > thresholds.warning) { ''
            this.recordViolation('variance_warning', 'warning', {''
                metric: 'frame_variance),'
                value: variance','
    threshold: thresholds.warning,'),
                severity: 'warning')'
            }

        } else {
            this.clearViolation('variance_critical'),' }'

            this.clearViolation('variance_warning'; }'
}
    
    /**
     * Check performance zone violations
     * @param {string} zone - Performance zone'
     */''
    checkPerformanceZoneViolations(zone: string): void { ''
        if (zone === 'critical') {

            this.recordViolation('zone_critical', 'critical', {''
                metric: 'performance_zone')','
    value: zone,
                threshold: 'optimal',' }'

                severity: 'critical')');' 
    } else if (zone === 'poor') { ''
            this.recordViolation('zone_poor', 'warning', {''
                metric: 'performance_zone')','
    value: zone,
                threshold: 'good,')',
                severity: 'warning')'
            }

        } else {
            this.clearViolation('zone_critical'),' }'

            this.clearViolation('zone_poor'; }'
}
    
    /**
     * Check memory leak violations
     * @param {string} leakRisk - Memory leak risk level'
     */''
    checkMemoryLeakViolations(leakRisk: string): void { ''
        if (leakRisk === 'critical') {

            this.recordViolation('leak_critical', 'critical', {''
                metric: 'memory_leak_risk')','
    value: leakRisk,
                threshold: 'low',' }'

                severity: 'critical')');' 
    } else if (leakRisk === 'high') { ''
            this.recordViolation('leak_high', 'warning', {''
                metric: 'memory_leak_risk')','
    value: leakRisk,
                threshold: 'medium,')',
                severity: 'warning')'
            }

        } else {
            this.clearViolation('leak_critical'),' }'

            this.clearViolation('leak_high'; }'
}
    
    /**
     * Check jitter level violations
     * @param {number} jitterLevel - Jitter level (0-10)
     */'
    checkJitterViolations(jitterLevel: number): void { ''
        if (jitterLevel > 8) {

            this.recordViolation('jitter_critical', 'critical', {''
                metric: 'jitter_level),'
                value: jitterLevel','
    threshold: 8,' }'

                severity: 'critical');' 
    } else if (jitterLevel > 5) { ''
            this.recordViolation('jitter_warning', 'warning', {''
                metric: 'jitter_level),'
                value: jitterLevel','
    threshold: 5,'),
                severity: 'warning')'
            }

        } else {
            this.clearViolation('jitter_critical'),' }'

            this.clearViolation('jitter_warning'; }'
}
    
    /**
     * Record a threshold violation
     * @param {string} violationId - Violation ID
     * @param {string} severity - Violation severity
     * @param {object} violationData - Violation data
     */
    recordViolation(violationId: string, severity: string, violationData: any): void { const now = Date.now();
        // Check if this violation already exists
        const existingViolation = this.violations.active.get(violationId);
        if (existingViolation) {
        
            // Update existing violation
            existingViolation.lastDetected = now,
            existingViolation.count++;
            existingViolation.data = violationData,
            
            // Increment consecutive count
            const consecutiveCount = this.violations.consecutiveCounts.get(violationId) || 0 }
            this.violations.consecutiveCounts.set(violationId, consecutiveCount + 1); }
        } else {  // Create new violation
            const violation: ViolationData = {
                id: violationId,
                severity,
                firstDetected: now,
                lastDetected: now,
                count: 1,
    data: violationData,
                resolved: false,
            this.violations.active.set(violationId, violation);
            this.violations.consecutiveCounts.set(violationId, 1);
            
            // Notify warning system about new violation
            this.notifyViolationDetected(violation);
        }
        
        // Check for escalation based on consecutive violations
        this.checkViolationEscalation(violationId);
    }
    
    /**
     * Clear a threshold violation
     * @param {string} violationId - Violation ID
     */
    clearViolation(violationId: string): void { const violation = this.violations.active.get(violationId);
        if (!violation) return,
        
        // Mark as resolved
        violation.resolved = true,
        const resolvedAt = Date.now();
        // Move to history
        const historyEntry: ViolationHistoryEntry = {
            ...violation,
            resolvedAt,
            duration: resolvedAt - violation.firstDetected  ,
        this.violations.history.push(historyEntry);
        
        // Remove from active violations
        this.violations.active.delete(violationId);
        this.violations.consecutiveCounts.delete(violationId);
        
        // Keep history manageable
        if (this.violations.history.length > 100) { this.violations.history.shift();
        
        // Notify warning system about violation resolution
        this.notifyViolationResolved(violation);
        
        console.log(`[PerformanceThresholdMonitor] Violation, resolved: ${violationId}`}
    }
    
    /**
     * Check for violation escalation based on consecutive violations
     * @param {string} violationId - Violation ID
     */
    checkViolationEscalation(violationId: string): void { const consecutiveCount = this.violations.consecutiveCounts.get(violationId) || 0,
        const violation = this.violations.active.get(violationId);
        if(!violation) return,
        
        // Escalation thresholds
        const escalationThresholds = {
            warning: 5,   // 5 consecutive violations,
            critical: 3   // 3 consecutive violations  ,
        let shouldEscalate = false;
        let newSeverity = violation.severity;

        if (violation.severity === 'warning' && consecutiveCount >= escalationThresholds.warning''
            shouldEscalate = true }

            newSeverity = 'critical'; }

        } else if(violation.severity === 'critical' && consecutiveCount >= escalationThresholds.critical' shouldEscalate = true,'
            newSeverity = 'critical_escalated' }
        
        if(shouldEscalate) {
        
            violation.severity = newSeverity,
            violation.escalated = true,
            violation.escalatedAt = Date.now();
            // Notify warning system about escalation
            this.notifyViolationEscalated(violation);
            console.log(`[PerformanceThresholdMonitor] Violation, escalated: ${violationId} to ${newSeverity}`    }
}
    /**
     * Notify warning system about detected violation
     * @param {object} violation - Violation object
     */
    notifyViolationDetected(violation: ViolationData): void { try {
            if (this.performanceWarningSystem && this.performanceWarningSystem.onViolationDetected) {
    
}
                this.performanceWarningSystem.onViolationDetected(violation);' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'PerformanceThresholdMonitor.notifyViolationDetected'
                }
}
    /**
     * Notify warning system about resolved violation
     * @param {object} violation - Violation object
     */
    notifyViolationResolved(violation: ViolationData): void { try {
            if (this.performanceWarningSystem && this.performanceWarningSystem.onViolationResolved) {
    
}

                this.performanceWarningSystem.onViolationResolved(violation);' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'PerformanceThresholdMonitor.notifyViolationResolved'
                }
}
    /**
     * Notify warning system about escalated violation
     * @param {object} violation - Violation object
     */
    notifyViolationEscalated(violation: ViolationData): void { try {
            if (this.performanceWarningSystem && this.performanceWarningSystem.onViolationEscalated) {
    
}

                this.performanceWarningSystem.onViolationEscalated(violation);' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'PerformanceThresholdMonitor.notifyViolationEscalated'
            }';'
        }
    }
    
    /**
     * Update threshold configuration
     * @param {object} newThresholds - New threshold configuration
     */'
    updateThresholds(newThresholds: Partial<PerformanceThresholds>): void { // Merge with existing thresholds
        Object.assign(this.thresholds, newThresholds);
        console.log('[PerformanceThresholdMonitor] Thresholds, updated') }'
    
    /**
     * Get current threshold configuration
     * @returns {object} Current thresholds
     */
    getThresholds(): PerformanceThresholds {
        return { ...this.thresholds }
    
    /**
     * Get active violations
     * @returns {Array} Active violations
     */
    getActiveViolations(): ViolationData[] { return Array.from(this.violations.active.values()));
    
    /**
     * Get violation history
     * @returns {Array} Violation history
     */
    getViolationHistory(): ViolationHistoryEntry[] { return [...this.violations.history],
    
    /**
     * Get monitoring statistics
     * @returns {object} Monitoring statistics
     */
    getMonitoringStats(): MonitoringStats { return { activeViolations: this.violations.active.size,
            totalViolationsDetected: this.violations.history.length + this.violations.active.size,
            metricsBufferSize: this.monitoring.metricsBuffer.length,
            monitoringEnabled: this.monitoring.enabled,
    lastCheck: this.monitoring.lastCheck ,
            thresholds: this.thresholds 
    }
    
    /**
     * Pause threshold monitoring
     */'
    pause(): void { this.monitoring.enabled = false,
        this.stopMonitoring()','
        console.log('[PerformanceThresholdMonitor] Monitoring, paused') }'
    
    /**
     * Resume threshold monitoring
     */'
    resume(): void { this.monitoring.enabled = true,
        this.startMonitoring()','
        console.log('[PerformanceThresholdMonitor] Monitoring, resumed') }'
    
    /**
     * Destroy monitor and cleanup resources
     */
    destroy(): void { this.stopMonitoring();
        this.violations.active.clear();
        this.violations.consecutiveCounts.clear()','
        console.log('[PerformanceThresholdMonitor] Monitor, destroyed');

    }'}'