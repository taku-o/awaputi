/**
 * PerformanceDiagnostics - Main Controller for performance diagnostics system
 * Refactored to use the Main Controller Pattern with sub-components
 * パフォーマンスボトルネック特定と自動診断システム
 * Requirements: 7.2, 7.4
 */

import { DiagnosticDataCollector } from './performance-diagnostics/DiagnosticDataCollector.js';
import { DiagnosticAnalyzer } from './performance-diagnostics/DiagnosticAnalyzer.js';
import { DiagnosticReporter } from './performance-diagnostics/DiagnosticReporter.js';

export class PerformanceDiagnostics {
    constructor() {
        // Initialize sub-components with dependency injection
        this.dataCollector = new DiagnosticDataCollector(this);
        this.analyzer = new DiagnosticAnalyzer(this);
        this.reporter = new DiagnosticReporter(this);
        
        this.initialized = false;
        
        this.initializeDiagnostics();
        
        console.log('[PerformanceDiagnostics] Main controller initialized successfully');
    }

    async initializeDiagnostics() {
        try {
            // Initialize sub-components
            await this.analyzer.initialize();
            await this.reporter.initialize();
            
            this.initialized = true;
            console.log('[PerformanceDiagnostics] Main controller initialized successfully');
        } catch (error) {
            console.error('[PerformanceDiagnostics] Failed to initialize:', error);
            throw error;
        }
    }

    async runComprehensiveDiagnosis(options = {}) {
        if (!this.initialized) {
            throw new Error('PerformanceDiagnostics not initialized');
        }

        const diagnosticSession = {
            id: Date.now(),
            startTime: performance.now(),
            options: {
                duration: options.duration || 30000, // 30秒
                includeBottleneckAnalysis: options.includeBottleneckAnalysis !== false,
                includeAnomalyDetection: options.includeAnomalyDetection !== false,
                includeRootCauseAnalysis: options.includeRootCauseAnalysis !== false,
                generateRecommendations: options.generateRecommendations !== false,
                detailLevel: options.detailLevel || 'comprehensive', // basic, standard, comprehensive
                ...options
            },
            results: {}
        };

        try {
            // データ収集期間 - delegated to data collector
            const collectedData = await this.dataCollector.collectDiagnosticData(diagnosticSession.options);
            
            // 各種分析の実行 - delegated to analyzer
            const analysisResults = await this.analyzer.runAnalyses(collectedData, diagnosticSession.options);
            
            // 推奨事項生成 - delegated to reporter
            if (diagnosticSession.options.generateRecommendations) {
                analysisResults.recommendations = await this.reporter.generateRecommendations(analysisResults);
            }
            
            // 結果の統合
            diagnosticSession.results = {
                dataCollection: collectedData.summary,
                bottlenecks: analysisResults.bottlenecks,
                anomalies: analysisResults.anomalies,
                rootCauses: analysisResults.rootCauses,
                recommendations: analysisResults.recommendations,
                overallAssessment: await this.analyzer.generateOverallAssessment(analysisResults)
            };

            diagnosticSession.endTime = performance.now();
            diagnosticSession.duration = diagnosticSession.endTime - diagnosticSession.startTime;

            // 診断レポート生成 - delegated to reporter
            const report = await this.reporter.generateReport(diagnosticSession);
            
            return {
                session: diagnosticSession,
                report: report
            };

        } catch (error) {
            console.error('[PerformanceDiagnostics] Comprehensive diagnosis failed:', error);
            throw error;
        }
    }

    // ===== DELEGATED METHODS - Maintain backward compatibility =====
    
    /**
     * Collect diagnostic data - delegated to data collector
     * @param {Object} options - Collection options
     * @returns {Object} Collected data
     */
    async collectDiagnosticData(options) {
        return await this.dataCollector.collectDiagnosticData(options);
    }

    /**
     * Run analyses - delegated to analyzer
     * @param {Object} collectedData - Collected data
     * @param {Object} options - Analysis options
     * @returns {Object} Analysis results
     */
    async runAnalyses(collectedData, options) {
        return await this.analyzer.runAnalyses(collectedData, options);
    }

    /**
     * Generate overall assessment - delegated to analyzer
     * @param {Object} analysisResults - Analysis results
     * @returns {Object} Overall assessment
     */
    async generateOverallAssessment(analysisResults) {
        return await this.analyzer.generateOverallAssessment(analysisResults);
    }

    // ===== PUBLIC API METHODS - Enhanced with sub-component functionality =====
    
    /**
     * Quick diagnosis with basic analysis
     * @param {string} targetMetric - Optional target metric to focus on
     * @returns {Object} Quick diagnosis results
     */
    async quickDiagnosis(targetMetric = null) {
        const options = {
            duration: 5000, // 5秒
            detailLevel: 'basic',
            includeRootCauseAnalysis: false
        };

        if (targetMetric) {
            options.focusMetric = targetMetric;
        }

        return await this.runComprehensiveDiagnosis(options);
    }

    /**
     * Identify bottlenecks only
     * @param {number} duration - Collection duration in milliseconds
     * @returns {Array} Identified bottlenecks
     */
    async identifyBottlenecks(duration = 10000) {
        const collectedData = await this.dataCollector.collectDiagnosticData({ duration });
        return await this.analyzer.identifyBottlenecks(collectedData);
    }

    /**
     * Detect anomalies only
     * @param {number} duration - Collection duration in milliseconds
     * @returns {Array} Detected anomalies
     */
    async detectAnomalies(duration = 15000) {
        const collectedData = await this.dataCollector.collectDiagnosticData({ duration });
        return await this.analyzer.detectAnomalies(collectedData);
    }

    /**
     * Main diagnosis API - alias for runComprehensiveDiagnosis
     * @param {Object} options - Diagnosis options
     * @returns {Object} Diagnosis results
     */
    async diagnose(options = {}) {
        return await this.runComprehensiveDiagnosis(options);
    }

    /**
     * Get current system health assessment
     * @returns {Object} System health assessment
     */
    async getSystemHealth() {
        const quickResult = await this.quickDiagnosis();
        return quickResult.session.results.overallAssessment;
    }

    /**
     * Get performance recommendations
     * @returns {Array} Performance recommendations
     */
    async getRecommendations() {
        const result = await this.runComprehensiveDiagnosis({ duration: 10000 });
        return result.session.results.recommendations;
    }

    /**
     * Get diagnostic capabilities
     * @returns {Object} Available diagnostic capabilities
     */
    getDiagnosticCapabilities() {
        return {
            dataCollection: this.dataCollector.getCollectionStatus ? 
                this.dataCollector.getCollectionStatus() : { available: true },
            analysis: this.analyzer.getAnalysisCapabilities ? 
                this.analyzer.getAnalysisCapabilities() : { available: true },
            reporting: this.reporter.getReportingCapabilities ? 
                this.reporter.getReportingCapabilities() : { available: true }
        };
    }

    /**
     * Configure diagnostic components
     * @param {Object} config - Configuration options
     */
    configure(config) {
        if (config.dataCollection) {
            this.dataCollector.configure(config.dataCollection);
        }
        
        if (config.analysis) {
            this.analyzer.configure(config.analysis);
        }
        
        if (config.reporting) {
            this.reporter.configure(config.reporting);
        }
        
        console.log('[PerformanceDiagnostics] Configuration updated');
    }

    /**
     * Get component references for advanced usage
     * @returns {Object} Component references
     */
    getComponents() {
        return {
            dataCollector: this.dataCollector,
            analyzer: this.analyzer,
            reporter: this.reporter
        };
    }

    /**
     * Cleanup diagnostic system
     */
    destroy() {
        try {
            // Destroy sub-components
            if (this.dataCollector.destroy) {
                this.dataCollector.destroy();
            }
            
            if (this.analyzer.destroy) {
                this.analyzer.destroy();
            }
            
            if (this.reporter.destroy) {
                this.reporter.destroy();
            }
            
            this.initialized = false;
            console.log('[PerformanceDiagnostics] Main controller destroyed');
        } catch (error) {
            console.error('[PerformanceDiagnostics] Error during cleanup:', error);
        }
    }
}

// Singleton instance
let performanceDiagnosticsInstance = null;

/**
 * Get PerformanceDiagnostics singleton instance
 * @returns {PerformanceDiagnostics} Diagnostics instance
 */
export function getPerformanceDiagnostics() {
    if (!performanceDiagnosticsInstance) {
        performanceDiagnosticsInstance = new PerformanceDiagnostics();
    }
    return performanceDiagnosticsInstance;
}

export default PerformanceDiagnostics;