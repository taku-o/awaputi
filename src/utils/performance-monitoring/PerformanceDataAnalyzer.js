/**
 * PerformanceDataAnalyzer - Main Controller for Performance Analysis System
 * 
 * This is the main controller class that coordinates specialized sub-components
 * following the Main Controller Pattern. It was refactored from a large monolithic
 * class (2,871 words) into this lightweight orchestrator (876 words) plus four
 * specialized components to meet MCP tool compatibility requirements.
 * 
 * Architecture:
 * - Main Controller Pattern: Maintains public API while delegating to sub-components
 * - Dependency Injection: Sub-components receive main controller reference
 * - Backward Compatibility: All existing methods preserved through delegation
 * - File Size Optimization: 69% size reduction while maintaining functionality
 * 
 * Sub-components:
 * - PerformanceMetricsCollector: Metrics collection and data management
 * - PerformanceDataProcessor: Statistical processing and trend analysis  
 * - PerformanceReportGenerator: Insight generation and reporting
 * - PerformanceThresholdManager: Baseline calibration and threshold management
 * 
 * @class PerformanceDataAnalyzer
 * @memberof PerformanceMonitoring
 * @since 1.0.0
 * @author BubblePop Team
 * @version 2.0.0 - Refactored with Main Controller Pattern
 * 
 * @example
 * // Usage remains identical to the original monolithic class
 * const analyzer = new PerformanceDataAnalyzer(performanceMonitoringSystem);
 * analyzer.addToAnalysisHistory(timestamp, metrics);
 * const insights = await analyzer.generateInsights();
 * 
 * @see {@link PerformanceMetricsCollector} For metrics collection functionality
 * @see {@link PerformanceDataProcessor} For data processing and analysis
 * @see {@link PerformanceReportGenerator} For insight generation and reporting
 * @see {@link PerformanceThresholdManager} For threshold management
 */

import { PerformanceMetricsCollector } from './PerformanceMetricsCollector.js';
import { PerformanceDataProcessor } from './PerformanceDataProcessor.js';
import { PerformanceReportGenerator } from './PerformanceReportGenerator.js';
import { PerformanceThresholdManager } from './PerformanceThresholdManager.js';

export class PerformanceDataAnalyzer {
    constructor(performanceMonitoringSystem) {
        this.performanceMonitoringSystem = performanceMonitoringSystem;
        this.errorHandler = performanceMonitoringSystem?.errorHandler || console;
        
        // Analysis configuration
        this.analysisConfig = {
            trendAnalysisWindow: 300000, // 5 minutes
            anomalyDetectionSensitivity: 0.8,
            statisticalWindow: 60000, // 1 minute
            insightGenerationInterval: 60000, // 1 minute
            performanceBaseline: new Map(),
            adaptiveThresholds: true
        };
        
        // Performance baseline data (shared with components)
        this.performanceBaseline = new Map();
        this.baselineCalibrated = false;
        this.calibrationTarget = 100; // samples needed
        
        // Anomalies tracking (used by report generator)
        this.anomalies = [];
        
        // Initialize trend analyzers (used by data processor)
        this.trendAnalyzers = new Map();
        this.initializeTrendAnalyzers();
        
        // Initialize sub-components
        this.metricsCollector = new PerformanceMetricsCollector(this);
        this.dataProcessor = new PerformanceDataProcessor(this);
        this.reportGenerator = new PerformanceReportGenerator(this);
        this.thresholdManager = new PerformanceThresholdManager(this);
        
        console.log('[PerformanceDataAnalyzer] Performance data analysis system initialized with sub-components');
    }
    
    /**
     * Initialize trend analyzers (shared configuration)
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
     * Analyze performance data - Main public API method
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    async analyzePerformanceData(timestamp, metrics) {
        try {
            // Delegate to metrics collector
            this.metricsCollector.addToAnalysisHistory(timestamp, metrics);
            this.metricsCollector.updatePerformanceBaseline(metrics);
            
            // Delegate to data processor
            this.dataProcessor.performTrendAnalysis(timestamp, metrics);
            this.dataProcessor.processStatisticalData(timestamp, metrics);
            
            // Update threshold manager
            for (const [metricId, value] of metrics) {
                this.thresholdManager.updateBaseline(metricId, value);
                const violation = this.thresholdManager.checkThresholdViolation(metricId, value);
                if (violation) {
                    // Convert threshold violations to anomalies for compatibility
                    this.anomalies.push({
                        timestamp: violation.timestamp,
                        metricId: violation.metricId,
                        value: violation.value,
                        severity: violation.severity,
                        score: violation.deviation,
                        type: 'threshold_violation'
                    });
                }
            }
            
            // Detect additional anomalies
            this.detectAnomalies(timestamp, metrics);
            
            // Delegate to report generator
            await this.reportGenerator.generateInsights(timestamp, metrics);
            
        } catch (error) {
            this.errorHandler.handleError?.(error, {
                context: 'PerformanceDataAnalyzer.analyzePerformanceData'
            }) || console.error('Analysis error:', error);
        }
    }
    
    /**
     * Detect anomalies using baseline comparison
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
                        severity: this.calculateAnomalySeverity(anomalyScore),
                        type: 'baseline_deviation'
                    };
                    
                    this.anomalies.push(anomaly);
                    
                    // Keep anomalies history manageable
                    if (this.anomalies.length > 100) {
                        this.anomalies.shift();
                    }
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
        const deviation = Math.abs(value - baseline) / baseline;
        
        const metricWeights = {
            'fps': 2.0,
            'memory_used': 1.5,
            'frame_time': 2.0,
            'network_latency': 1.2,
            'input_lag': 1.8
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
    
    // PUBLIC API DELEGATION METHODS (maintain backward compatibility)
    
    /**
     * Add data to analysis history (delegated)
     */
    addToAnalysisHistory(timestamp, metrics) {
        return this.metricsCollector.addToAnalysisHistory(timestamp, metrics);
    }
    
    /**
     * Perform trend analysis (delegated)
     */
    performTrendAnalysis(timestamp, metrics) {
        return this.dataProcessor.performTrendAnalysis(timestamp, metrics);
    }
    
    /**
     * Generate insights (delegated)
     */
    async generateInsights(timestamp, metrics) {
        return this.reportGenerator.generateInsights(timestamp, metrics);
    }
    
    /**
     * Get analysis results
     */
    getAnalysisResults() {
        return {
            trends: Object.fromEntries(this.dataProcessor.getAllTrends()),
            anomalies: this.anomalies.slice(-20),
            insights: this.reportGenerator.getRecentInsights(),
            statistics: Object.fromEntries(this.dataProcessor.getAllStatisticalData()),
            baseline: Object.fromEntries(this.performanceBaseline),
            calibrated: this.baselineCalibrated,
            thresholds: this.thresholdManager.exportData()
        };
    }
    
    /**
     * Get trend analysis data
     */
    getTrendData(metricId) {
        return this.dataProcessor.getTrendData(metricId);
    }
    
    /**
     * Get recent insights
     */
    getRecentInsights(category = null) {
        return this.reportGenerator.getRecentInsights(category);
    }
    
    /**
     * Configure analyzer
     */
    configure(config) {
        Object.assign(this.analysisConfig, config);
        
        // Propagate configuration to sub-components
        if (config.thresholds) {
            this.thresholdManager.configure(config.thresholds);
        }
        
        console.log('[PerformanceDataAnalyzer] Configuration updated');
    }
    
    /**
     * Export complete analysis data
     */
    exportData() {
        return {
            timestamp: Date.now(),
            config: this.analysisConfig,
            baseline: Object.fromEntries(this.performanceBaseline),
            anomalies: this.anomalies,
            metrics: this.metricsCollector.exportData(),
            statistics: Object.fromEntries(this.dataProcessor.getAllStatisticalData()),
            insights: this.reportGenerator.exportInsights(),
            thresholds: this.thresholdManager.exportData()
        };
    }
    
    /**
     * Import analysis data
     */
    importData(data) {
        try {
            if (data.config) {
                Object.assign(this.analysisConfig, data.config);
            }
            
            if (data.baseline) {
                this.performanceBaseline = new Map(Object.entries(data.baseline));
                this.baselineCalibrated = true;
            }
            
            if (data.anomalies) {
                this.anomalies = data.anomalies;
            }
            
            // Import to sub-components
            if (data.metrics) {
                this.metricsCollector.importData(data.metrics);
            }
            
            if (data.thresholds) {
                this.thresholdManager.importData(data.thresholds);
            }
            
            console.log('[PerformanceDataAnalyzer] Data imported successfully');
            return true;
            
        } catch (error) {
            console.error('[PerformanceDataAnalyzer] Import failed:', error);
            return false;
        }
    }
    
    /**
     * Cleanup analyzer resources
     */
    destroy() {
        // Destroy sub-components
        this.metricsCollector?.destroy();
        this.dataProcessor?.destroy();
        this.reportGenerator?.destroy();
        this.thresholdManager?.destroy();
        
        // Clear local data
        this.anomalies = [];
        this.performanceBaseline.clear();
        this.trendAnalyzers.clear();
        
        console.log('[PerformanceDataAnalyzer] Main analyzer and sub-components destroyed');
    }
}