/**
 * ColorContrastAnalyzer - Main Controller for color contrast analysis system
 * Orchestrates contrast calculation, color analysis, and color blindness simulation
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { ContrastCalculator } from './color-contrast/ContrastCalculator.js';
import { ColorAnalysisEngine } from './color-contrast/ColorAnalysisEngine.js';
import { ColorBlindnessSimulator } from './color-contrast/ColorBlindnessSimulator.js';

export class ColorContrastAnalyzer {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // 色コントラスト設定
        this.config = {
            enabled: true,
            realTimeAnalysis: true,
            wcagLevel: 'AA', // A, AA, AAA
            includeImages: false,
            autoFix: false,
            colorBlindnessSimulation: true,
            detailedReporting: true
        };

        // Initialize sub-components
        this.contrastCalculator = new ContrastCalculator({
            wcagLevel: this.config.wcagLevel,
            enableCache: true,
            highPrecision: false
        });

        this.colorAnalysisEngine = new ColorAnalysisEngine({
            enableDetailedAnalysis: this.config.detailedReporting,
            includeImages: this.config.includeImages,
            autoGenerateRecommendations: true,
            analysisDepth: 'comprehensive'
        });

        this.colorBlindnessSimulator = new ColorBlindnessSimulator({
            enableSimulation: this.config.colorBlindnessSimulation,
            includePartialColorBlindness: true,
            generateSuggestions: true,
            accurateSimulation: true
        });
        
        // 分析結果の保存
        this.results = {
            lastAnalysis: null,
            contrastIssues: [],
            colorBlindnessIssues: [],
            recommendations: [],
            statisticsReport: null
        };
        
        // 分析状態
        this.state = {
            analyzing: false,
            realTimeEnabled: false,
            lastAnalysisTime: null,
            analyzeScheduled: false
        };
        
        // イベントハンドラー
        this.eventHandlers = {
            styleChanged: null,
            domChanged: null,
            resize: null
        };
        
        // パフォーマンス監視
        this.performance = {
            analysisCount: 0,
            averageAnalysisTime: 0,
            lastAnalysisTime: 0
        };

        console.log('ColorContrastAnalyzer initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // Initialize sub-components
            const initResults = [
                this.contrastCalculator.initialize(),
                this.colorAnalysisEngine.initialize(),
                this.colorBlindnessSimulator.initialize()
            ];

            if (!initResults.every(result => result)) {
                throw new Error('Failed to initialize sub-components');
            }

            this.setupEventHandlers();
            
            console.log('ColorContrastAnalyzer initialized successfully');
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'COLOR_CONTRAST_ANALYZER_ERROR', {
                operation: 'initialize'
            });
            return false;
        }
    }
    
    /**
     * Full contrast analysis using analysis engine
     */
    async runFullAnalysis() {
        if (this.state.analyzing) {
            console.warn('Analysis already in progress');
            return this.results.lastAnalysis;
        }
        
        const analysisStartTime = performance.now();
        this.state.analyzing = true;
        
        try {
            console.log('Starting full color contrast analysis...');
            
            // Get text elements for analysis
            const textElements = this.getTextElements();
            console.log(`Found ${textElements.length} text elements to analyze`);
            
            // Use analysis engine for comprehensive evaluation
            const accessibilityResults = await this.colorAnalysisEngine.evaluateColorAccessibility(
                textElements,
                this.contrastCalculator
            );
            
            this.results.contrastIssues = accessibilityResults.nonCompliantElements;
            this.results.recommendations = accessibilityResults.recommendations;
            
            // Run color blindness analysis if enabled
            if (this.config.colorBlindnessSimulation) {
                await this.runColorBlindnessAnalysis();
            }
            
            // Generate statistics report
            this.generateStatisticsReport(accessibilityResults);
            
            // Save analysis results
            this.results.lastAnalysis = {
                timestamp: Date.now(),
                elementCount: textElements.length,
                issues: this.results.contrastIssues.length,
                recommendations: this.results.recommendations.length,
                colorBlindnessIssues: this.results.colorBlindnessIssues.length,
                statistics: this.results.statisticsReport
            };
            
            const analysisTime = performance.now() - analysisStartTime;
            this.updatePerformanceMetrics(analysisTime);
            
            console.log(`Analysis completed in ${analysisTime.toFixed(2)}ms`);
            console.log(`Found ${this.results.contrastIssues.length} contrast issues`);
            
            return this.results.lastAnalysis;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'COLOR_CONTRAST_ANALYZER_ERROR', {
                operation: 'runFullAnalysis'
            });
            return null;
        } finally {
            this.state.analyzing = false;
            this.state.lastAnalysisTime = Date.now();
        }
    }

    /**
     * Analyze element contrast using sub-components
     */
    async analyzeElementContrast(element) {
        try {
            const styles = window.getComputedStyle(element);
            const textContent = element.textContent?.trim();
            
            if (!textContent || textContent.length === 0) {
                return null;
            }
            
            // Use analysis engine for element analysis
            return await this.colorAnalysisEngine.analyzeElementColors(
                element, 
                styles, 
                this.contrastCalculator
            );
            
        } catch (error) {
            console.warn('Element contrast analysis failed:', error);
            return null;
        }
    }
    
    /**
     * Run color blindness analysis using simulator
     */
    async runColorBlindnessAnalysis() {
        try {
            this.results.colorBlindnessIssues = [];
            
            for (const issue of this.results.contrastIssues) {
                if (issue.foregroundColor && issue.backgroundColor) {
                    // Use color blindness simulator for impact assessment
                    const impact = this.colorBlindnessSimulator.assessAccessibilityImpact(
                        issue.foregroundColor,
                        issue.backgroundColor
                    );
                    
                    if (impact.overallRisk === 'high' || impact.overallRisk === 'medium') {
                        this.results.colorBlindnessIssues.push({
                            element: issue.element,
                            impact,
                            recommendations: impact.recommendations
                        });
                    }
                }
            }
            
            console.log(`Color blindness analysis found ${this.results.colorBlindnessIssues.length} issues`);
            
        } catch (error) {
            console.error('Color blindness analysis failed:', error);
        }
    }

    /**
     * Quick analysis for real-time monitoring
     */
    async runQuickAnalysis() {
        if (this.state.analyzing) return null;
        
        try {
            const textElements = this.getTextElements().slice(0, 50); // Limit for performance
            
            // Use analysis engine for quick evaluation
            const quickResults = await this.colorAnalysisEngine.evaluateColorAccessibility(
                textElements,
                this.contrastCalculator
            );
            
            return {
                elementCount: textElements.length,
                issues: quickResults.nonCompliantElements.length,
                complianceRate: quickResults.statistics.complianceRate,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('Quick analysis failed:', error);
            return null;
        }
    }

    /**
     * Get color blindness simulation for specific colors
     */
    getColorBlindnessSimulation(foregroundColor, backgroundColor) {
        try {
            return this.colorBlindnessSimulator.assessAccessibilityImpact(
                foregroundColor,
                backgroundColor,
                { includeAllTypes: true, generateRecommendations: true }
            );
        } catch (error) {
            console.error('Color blindness simulation failed:', error);
            return null;
        }
    }

    /**
     * Get analysis results
     */
    getAnalysisResults() {
        return {
            ...this.results,
            performance: this.performance,
            state: this.state
        };
    }

    // Helper methods

    /**
     * Get all text elements in the document
     */
    getTextElements() {
        const elements = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    const text = node.textContent?.trim();
                    if (text && text.length > 0 && node.children.length === 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            elements.push(node);
        }
        
        return elements;
    }

    /**
     * Generate statistics report using analysis results
     */
    generateStatisticsReport(analysisResults) {
        this.results.statisticsReport = {
            totalElements: analysisResults.statistics.totalElements,
            compliantElements: analysisResults.statistics.compliantElements,
            complianceRate: analysisResults.statistics.complianceRate,
            averageContrast: analysisResults.statistics.averageContrast,
            wcagLevel: this.config.wcagLevel,
            colorBlindnessIssues: this.results.colorBlindnessIssues.length,
            timestamp: Date.now()
        };
    }

    /**
     * Setup event handlers for real-time monitoring
     */
    setupEventHandlers() {
        if (this.config.realTimeAnalysis) {
            this.setupRealtimeMonitoring();
        }
    }

    /**
     * Setup real-time monitoring
     */
    setupRealtimeMonitoring() {
        // Throttled analysis scheduling
        this.eventHandlers.styleChanged = () => {
            this.scheduleAnalysis();
        };

        // Monitor style changes
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.eventHandlers.styleChanged);
        }
    }

    /**
     * Schedule analysis with throttling
     */
    scheduleAnalysis() {
        if (this.state.analyzeScheduled) return;
        
        this.state.analyzeScheduled = true;
        setTimeout(() => {
            this.runQuickAnalysis();
            this.state.analyzeScheduled = false;
        }, 1000);
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(analysisTime) {
        this.performance.analysisCount++;
        this.performance.lastAnalysisTime = analysisTime;
        this.performance.averageAnalysisTime = 
            (this.performance.averageAnalysisTime * (this.performance.analysisCount - 1) + analysisTime) 
            / this.performance.analysisCount;
    }

    /**
     * Generate detailed report
     */
    generateDetailedReport() {
        return {
            summary: this.results.statisticsReport,
            contrastIssues: this.results.contrastIssues,
            colorBlindnessIssues: this.results.colorBlindnessIssues,
            recommendations: this.results.recommendations,
            performance: this.performance,
            subComponentReports: {
                calculator: this.contrastCalculator.getPerformanceReport(),
                analysisEngine: this.colorAnalysisEngine.getAnalysisStatistics(),
                simulator: this.colorBlindnessSimulator.getPerformanceReport()
            },
            timestamp: Date.now()
        };
    }

    /**
     * Toggle real-time analysis
     */
    toggleRealTimeAnalysis() {
        this.config.realTimeAnalysis = !this.config.realTimeAnalysis;
        this.state.realTimeEnabled = this.config.realTimeAnalysis;
        
        if (this.config.realTimeAnalysis) {
            this.setupRealtimeMonitoring();
        }
        
        console.log(`Real-time analysis ${this.config.realTimeAnalysis ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set WCAG level
     */
    setWcagLevel(level) {
        if (['A', 'AA', 'AAA'].includes(level)) {
            this.config.wcagLevel = level;
            this.contrastCalculator.updateConfig({ wcagLevel: level });
            console.log(`WCAG level set to ${level}`);
        }
    }

    /**
     * Apply configuration
     */
    applyConfig(config) {
        if (config.colorContrast) {
            Object.assign(this.config, config.colorContrast);
            
            // Update sub-component configurations
            this.contrastCalculator.updateConfig({
                wcagLevel: this.config.wcagLevel
            });
            
            this.colorAnalysisEngine.updateConfig({
                includeImages: this.config.includeImages,
                enableDetailedAnalysis: this.config.detailedReporting
            });
            
            this.colorBlindnessSimulator.updateConfig({
                enableSimulation: this.config.colorBlindnessSimulation
            });
        }
        
        console.log('ColorContrastAnalyzer configuration applied');
    }

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`ColorContrastAnalyzer ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        console.log('Destroying ColorContrastAnalyzer...');
        
        // Destroy sub-components
        if (this.contrastCalculator) {
            this.contrastCalculator.destroy();
        }
        if (this.colorAnalysisEngine) {
            this.colorAnalysisEngine.destroy();
        }
        if (this.colorBlindnessSimulator) {
            this.colorBlindnessSimulator.destroy();
        }
        
        // Remove event handlers
        if (this.eventHandlers.styleChanged && typeof window !== 'undefined') {
            window.removeEventListener('resize', this.eventHandlers.styleChanged);
        }
        
        // Clear results
        this.results = {
            lastAnalysis: null,
            contrastIssues: [],
            colorBlindnessIssues: [],
            recommendations: [],
            statisticsReport: null
        };
        
        console.log('ColorContrastAnalyzer destroyed');
    }
}