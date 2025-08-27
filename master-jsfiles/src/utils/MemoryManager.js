import { LeakDetector } from './memory-manager/LeakDetector.js';
import { ProactiveCleanupManager } from './memory-manager/ProactiveCleanupManager.js';
import { MemoryUsageAnalyzer } from './memory-manager/MemoryUsageAnalyzer.js';

/**
 * Intelligent Memory Management System (Refactored)
 * インテリジェントメモリ管理システム - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - LeakDetector: メモリリーク検出
 * - ProactiveCleanupManager: プロアクティブクリーンアップ
 * - MemoryUsageAnalyzer: 使用パターン解析
 */
export class MemoryManager {
    constructor(config = {}) {
        // Basic tracking
        this.trackedObjects = new WeakMap();
        
        // Initialize sub-components
        this._initializeSubComponents(config);
        
        // Main statistics
        this.stats = {
            objectsCreated: 0,
            objectsDestroyed: 0,
            timersCreated: 0,
            timersCleared: 0,
            listenersAdded: 0,
            listenersRemoved: 0,
            
            // Component-aggregated stats
            memoryLeaksDetected: 0,
            memoryLeaksSuspected: 0,
            proactiveCleanups: 0,
            memoryPressureEvents: 0,
            cleanupEfficiency: 1.0,
            
            // Current state
            currentMemoryPressure: 0,
            leakRiskLevel: 'low',
            memoryHealthScore: 1.0
        };
        
        // Main cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.performIntelligentCleanup();
        }, config.cleanupInterval || 30000);
        
        this.bindMethods();
        this.initializeMemoryMonitoring();
        
        console.log('[MemoryManager] Intelligent memory management system initialized with sub-components');
    }
    
    /**
     * Initialize sub-component systems
     * @private
     */
    _initializeSubComponents(config) {
        // Initialize leak detector
        this.leakDetector = new LeakDetector({
            enabled: config.leakDetectionEnabled !== undefined ? config.leakDetectionEnabled : true,
            sensitivity: config.leakDetectionSensitivity || 'medium',
            analysisWindow: config.leakAnalysisWindow || 60000
        });
        
        // Initialize cleanup manager
        this.cleanupManager = new ProactiveCleanupManager({
            enabled: config.cleanupEnabled !== undefined ? config.cleanupEnabled : true,
            mode: config.cleanupMode || 'adaptive',
            baseInterval: config.cleanupInterval || 30000
        });
        
        // Initialize usage analyzer
        this.usageAnalyzer = new MemoryUsageAnalyzer({
            enabled: config.analysisEnabled !== undefined ? config.analysisEnabled : true,
            analysisInterval: config.analysisInterval || 5000
        });
    }
    
    /**
     * Perform intelligent cleanup using all sub-components
     * @returns {object} Cleanup results
     */
    performIntelligentCleanup() {
        try {
            // Get current memory state
            const memoryInfo = this._getCurrentMemoryInfo();
            
            // Record usage for analysis
            this.usageAnalyzer.recordUsage(
                memoryInfo.used,
                memoryInfo.total,
                { source: 'cleanup_trigger' }
            );
            
            // Perform leak detection
            const leakResults = this.leakDetector.performLeakDetection();
            
            // Execute cleanup with context
            const cleanupContext = {
                memoryPressure: memoryInfo.pressure,
                leakRisk: leakResults.overallRisk,
                trend: this.usageAnalyzer.getCurrentPatterns().trendDirection
            };
            
            const cleanupResults = this.cleanupManager.performIntelligentCleanup(cleanupContext);
            
            // Update aggregated statistics
            this._updateAggregatedStats(leakResults, cleanupResults);
            
            return {
                timestamp: Date.now(),
                memoryInfo,
                leakDetection: leakResults,
                cleanup: cleanupResults,
                recommendations: this._generateRecommendations(memoryInfo, leakResults)
            };
            
        } catch (error) {
            console.error('[MemoryManager] Intelligent cleanup failed:', error);
            return { performed: false, error: error.message };
        }
    }
    
    /**
     * Track object for memory management
     * @param {*} obj - Object to track
     * @param {string} type - Object type
     * @param {number} estimatedSize - Estimated size in bytes
     */
    trackObject(obj, type = 'unknown', estimatedSize = 0) {
        const metadata = {
            type,
            estimatedSize,
            createdAt: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        };
        
        this.trackedObjects.set(obj, metadata);
        this.stats.objectsCreated++;
        
        // Track with leak detector
        this.leakDetector.trackObjectCreation(type, estimatedSize, metadata);
        
        return metadata.id;
    }
    
    /**
     * Track timer creation
     * @param {number} timerId - Timer ID
     * @param {string} type - Timer type
     */
    trackTimer(timerId, type = 'timeout') {
        this.stats.timersCreated++;
        this.cleanupManager.registerTimer(timerId, type);
    }
    
    /**
     * Track event listener
     * @param {EventTarget} target - Event target
     * @param {string} event - Event name
     * @param {Function} listener - Event listener
     */
    trackEventListener(target, event, listener) {
        this.stats.listenersAdded++;
        this.cleanupManager.registerEventListener(target, event, listener);
    }
    
    /**
     * Add to image cache
     * @param {string} key - Cache key
     * @param {HTMLImageElement} image - Image element
     * @param {number} estimatedSize - Estimated size
     */
    addToImageCache(key, image, estimatedSize = 0) {
        this.cleanupManager.addToImageCache(key, image, estimatedSize);
        this.trackObject(image, 'cached_image', estimatedSize);
    }
    
    /**
     * Add to audio cache
     * @param {string} key - Cache key
     * @param {HTMLAudioElement} audio - Audio element
     * @param {number} estimatedSize - Estimated size
     */
    addToAudioCache(key, audio, estimatedSize = 0) {
        this.cleanupManager.addToAudioCache(key, audio, estimatedSize);
        this.trackObject(audio, 'cached_audio', estimatedSize);
    }
    
    /**
     * Register custom cleanup function
     * @param {string} name - Cleanup name
     * @param {Function} cleanupFn - Cleanup function
     * @param {number} priority - Priority level
     */
    registerCleanupFunction(name, cleanupFn, priority = 5) {
        this.cleanupManager.registerCustomCleanup(name, cleanupFn, priority);
    }
    
    /**
     * Report suspected memory leak
     * @param {string} source - Leak source
     * @param {string} description - Description
     * @param {number} confidence - Confidence level
     * @param {object} evidence - Supporting evidence
     */
    reportSuspectedLeak(source, description, confidence = 0.5, evidence = {}) {
        this.stats.memoryLeaksSuspected++;
        return this.leakDetector.reportSuspectedLeak(source, description, confidence, evidence);
    }
    
    /**
     * Get comprehensive memory statistics
     * @returns {object} Memory statistics
     */
    getMemoryStats() {
        const leakStats = this.leakDetector.getStats();
        const cleanupStats = this.cleanupManager.getStats();
        const analysisStats = this.usageAnalyzer.getStats();
        const memoryInfo = this._getCurrentMemoryInfo();
        
        return {
            overall: {
                ...this.stats,
                memoryHealthScore: this._calculateHealthScore(memoryInfo, leakStats)
            },
            memory: memoryInfo,
            memoryUsage: memoryInfo.current || memoryInfo.used || this.stats.memoryUsage || 0,  // GameEngineInitializer.jsで期待される
            leakDetection: leakStats,
            cleanup: cleanupStats,
            analysis: analysisStats,
            predictions: this.usageAnalyzer.predictUsage(60000) // 1 minute prediction
        };
    }
    
    /**
     * Get current risk assessment
     * @returns {object} Risk assessment
     */
    getRiskAssessment() {
        const leakRisk = this.leakDetector.getRiskAssessment();
        const usageAnalysis = this.usageAnalyzer.performAnalysis();
        const memoryInfo = this._getCurrentMemoryInfo();
        
        // Combine risk factors
        let overallRisk = 'low';
        const riskFactors = [];
        
        if (memoryInfo.pressure > 0.9) {
            overallRisk = 'critical';
            riskFactors.push('critical_memory_pressure');
        } else if (leakRisk.risk === 'critical' || usageAnalysis.risk?.level === 'critical') {
            overallRisk = 'critical';
            riskFactors.push('critical_leak_or_usage_risk');
        } else if (memoryInfo.pressure > 0.8 || leakRisk.risk === 'medium' || usageAnalysis.risk?.level === 'high') {
            overallRisk = 'high';
            riskFactors.push('high_pressure_or_risk');
        } else if (memoryInfo.pressure > 0.6 || leakRisk.risk === 'low' && usageAnalysis.risk?.level === 'medium') {
            overallRisk = 'medium';
            riskFactors.push('moderate_pressure_or_risk');
        }
        
        return {
            overall: overallRisk,
            factors: riskFactors,
            memoryPressure: memoryInfo.pressure,
            leakRisk: leakRisk.risk,
            usageRisk: usageAnalysis.risk?.level || 'unknown',
            recommendations: this._generateRecommendations(memoryInfo, leakRisk, usageAnalysis)
        };
    }
    
    /**
     * Get memory-related warnings
     * @returns {string[]} Array of warning messages
     */
    getWarnings() {
        const warnings = [];
        const riskAssessment = this.getRiskAssessment();
        const memoryInfo = this._getCurrentMemoryInfo();
        
        // Memory pressure warnings
        if (memoryInfo.pressure > 0.9) {
            warnings.push('Critical memory pressure detected');
        } else if (memoryInfo.pressure > 0.8) {
            warnings.push('High memory pressure detected');
        } else if (memoryInfo.pressure > 0.6) {
            warnings.push('Moderate memory pressure detected');
        }
        
        // Leak warnings
        if (riskAssessment.leakRisk === 'critical') {
            warnings.push('Critical memory leak risk detected');
        } else if (riskAssessment.leakRisk === 'high' || riskAssessment.leakRisk === 'medium') {
            warnings.push('Memory leak risk detected');
        }
        
        // Usage warnings
        if (riskAssessment.usageRisk === 'critical') {
            warnings.push('Critical memory usage pattern detected');
        } else if (riskAssessment.usageRisk === 'high') {
            warnings.push('High memory usage pattern detected');
        }
        
        // Leak detection stats warnings
        if (this.stats.memoryLeaksDetected > 0) {
            warnings.push(`${this.stats.memoryLeaksDetected} memory leak(s) detected`);
        }
        
        if (this.stats.memoryLeaksSuspected > 5) {
            warnings.push(`${this.stats.memoryLeaksSuspected} suspected memory leaks`);
        }
        
        return warnings;
    }
    
    /**
     * Force immediate cleanup
     * @param {string} strategy - Cleanup strategy
     * @returns {object} Cleanup results
     */
    forceCleanup(strategy = 'aggressive') {
        const memoryInfo = this._getCurrentMemoryInfo();
        const context = {
            memoryPressure: memoryInfo.pressure,
            forced: true,
            strategy
        };
        
        return this.cleanupManager.forceCleanup(strategy, context);
    }
    
    /**
     * Cleanup and destroy the memory manager
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Final cleanup
        this.cleanupManager.forceCleanup('comprehensive');
        
        // Reset state
        this.trackedObjects = new WeakMap();
        
        console.log('[MemoryManager] Memory manager destroyed');
    }
    
    // Private methods
    
    /**
     * Get current memory information
     * @private
     */
    _getCurrentMemoryInfo() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.jsHeapSizeLimit;
            return {
                used,
                total,
                pressure: used / total,
                available: total - used
            };
        }
        
        return {
            used: 0,
            total: 0,
            pressure: 0,
            available: 0
        };
    }
    
    /**
     * Update aggregated statistics from sub-components
     * @private
     */
    _updateAggregatedStats(leakResults, cleanupResults) {
        // Update from leak detection
        if (leakResults.overallRisk === 'critical' || leakResults.overallRisk === 'high') {
            this.stats.memoryLeaksDetected++;
        }
        
        // Update from cleanup
        if (cleanupResults.performed) {
            this.stats.proactiveCleanups++;
            this.stats.cleanupEfficiency = cleanupResults.efficiency || this.stats.cleanupEfficiency;
        }
        
        // Update current state
        const memoryInfo = this._getCurrentMemoryInfo();
        this.stats.currentMemoryPressure = memoryInfo.pressure;
        
        // Update leak risk level
        const riskAssessment = this.getRiskAssessment();
        this.stats.leakRiskLevel = riskAssessment.overall;
        
        // Calculate health score
        this.stats.memoryHealthScore = this._calculateHealthScore(memoryInfo, leakResults);
    }
    
    /**
     * Calculate memory health score
     * @private
     */
    _calculateHealthScore(memoryInfo, leakResults) {
        let score = 1.0;
        
        // Penalize high memory pressure
        score -= Math.max(0, memoryInfo.pressure - 0.6) * 0.5;
        
        // Penalize leak risks
        if (leakResults.overallRisk === 'critical') score -= 0.4;
        else if (leakResults.overallRisk === 'high') score -= 0.2;
        else if (leakResults.overallRisk === 'medium') score -= 0.1;
        
        // Penalize low cleanup efficiency
        score -= Math.max(0, 1.0 - this.stats.cleanupEfficiency) * 0.2;
        
        return Math.max(0, Math.min(1.0, score));
    }
    
    /**
     * Generate recommendations based on current state
     * @private
     */
    _generateRecommendations(memoryInfo, leakResults, usageAnalysis = null) {
        const recommendations = [];
        
        if (memoryInfo.pressure > 0.9) {
            recommendations.push('Execute emergency cleanup immediately');
        } else if (memoryInfo.pressure > 0.8) {
            recommendations.push('Schedule aggressive cleanup');
        } else if (memoryInfo.pressure > 0.6) {
            recommendations.push('Increase cleanup frequency');
        }
        
        if (leakResults.overallRisk === 'critical') {
            recommendations.push('Investigate memory leaks immediately');
        } else if (leakResults.overallRisk === 'high') {
            recommendations.push('Monitor memory leaks closely');
        }
        
        if (this.stats.cleanupEfficiency < 0.5) {
            recommendations.push('Review cleanup strategies for better efficiency');
        }
        
        return recommendations;
    }
    
    /**
     * Bind methods to maintain context
     * @private
     */
    bindMethods() {
        this.performIntelligentCleanup = this.performIntelligentCleanup.bind(this);
    }
    
    /**
     * Initialize memory monitoring
     * @private
     */
    initializeMemoryMonitoring() {
        // Start periodic memory usage recording
        setInterval(() => {
            const memoryInfo = this._getCurrentMemoryInfo();
            this.usageAnalyzer.recordUsage(memoryInfo.used, memoryInfo.total);
            
            // Record memory pressure events
            if (memoryInfo.pressure > 0.8) {
                this.leakDetector.recordMemoryPressure(
                    memoryInfo.pressure,
                    'periodic_monitoring',
                    { memoryInfo }
                );
            }
        }, 5000); // Every 5 seconds
    }
}

// Singleton pattern support
let instance = null;

/**
 * Get singleton instance of MemoryManager
 * @param {object} config - Configuration options
 * @returns {MemoryManager} MemoryManager instance
 */
export function getMemoryManager(config = {}) {
    if (!instance) {
        instance = new MemoryManager(config);
    }
    return instance;
}

/**
 * Reset singleton instance (for testing)
 */
export function resetMemoryManager() {
    if (instance) {
        instance.destroy();
        instance = null;
    }
}

// Export for compatibility
export default MemoryManager;