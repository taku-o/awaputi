/**
 * PerformanceReportGenerator - Generates performance insights and reports
 * Part of the PerformanceDataAnalyzer split implementation
 */

export class PerformanceReportGenerator {
    constructor(mainController) {
        this.mainController = mainController;
        this.errorHandler = mainController.errorHandler;
        
        // Insights storage
        this.insights = [];
        
        // Initialize insight generators
        this.initializeInsightGenerators();
        
        console.log('[PerformanceReportGenerator] Report generation component initialized');
    }
    
    /**
     * Initialize insight generators
     */
    initializeInsightGenerators() {
        this.insightGenerators = new Map();
        
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
                    history: this.mainController.metricsCollector.getAnalysisHistory(),
                    trends: this.mainController.dataProcessor.getAllTrends(),
                    anomalies: this.mainController.anomalies || [],
                    baseline: this.mainController.performanceBaseline,
                    stats: this.mainController.dataProcessor.getAllStatisticalData()
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
                console.warn(`[PerformanceReportGenerator] Insight generation failed for ${generatorId}:`, error);
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
                suggestions: ['reduce_graphics_quality', 'optimize_rendering'],
                severity: this.calculateSeverity(fps, fpsBaseline, 'fps'),
                metrics: { current: fps, baseline: fpsBaseline, ratio: fps / fpsBaseline }
            });
        }
        
        // Check for memory bottlenecks
        const memoryTrend = trends.get('memory_used');
        if (memoryTrend && memoryTrend.trend === 'increasing') {
            const memoryUsed = metrics.get('memory_used');
            const memoryBaseline = baseline.get('memory_used');
            
            insights.push({
                type: 'bottleneck',
                category: 'memory',
                title: 'Memory Usage Bottleneck',
                description: 'Memory usage is consistently increasing',
                impact: 'medium',
                suggestions: ['memory_cleanup', 'check_memory_leaks'],
                severity: memoryUsed && memoryBaseline ? this.calculateSeverity(memoryUsed, memoryBaseline, 'memory') : 'medium',
                metrics: { 
                    current: memoryUsed, 
                    baseline: memoryBaseline,
                    trend: memoryTrend.trend,
                    confidence: memoryTrend.confidence 
                }
            });
        }
        
        // Check for frame time bottlenecks
        const frameTime = metrics.get('frame_time');
        const frameTimeBaseline = baseline.get('frame_time');
        if (frameTime && frameTimeBaseline && frameTime > frameTimeBaseline * 1.5) {
            insights.push({
                type: 'bottleneck',
                category: 'rendering',
                title: 'Frame Time Bottleneck',
                description: `Frame time (${frameTime.toFixed(2)}ms) is significantly above baseline`,
                impact: 'high',
                suggestions: ['optimize_rendering', 'reduce_complexity'],
                severity: this.calculateSeverity(frameTime, frameTimeBaseline, 'frame_time'),
                metrics: { current: frameTime, baseline: frameTimeBaseline, ratio: frameTime / frameTimeBaseline }
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
        const { stats, metrics, baseline } = analysisData;
        
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
                suggestions: ['increase_graphics_quality', 'enable_advanced_features'],
                severity: 'low',
                metrics: { p95_fps: descriptiveStats.fps.p95, threshold: 55 }
            });
        }
        
        // Check for memory optimization opportunities
        if (descriptiveStats.memory_used) {
            const memoryEfficiency = descriptiveStats.memory_used.mean / descriptiveStats.memory_used.max;
            if (memoryEfficiency < 0.7) {
                insights.push({
                    type: 'optimization',
                    category: 'memory',
                    title: 'Memory Optimization Opportunity',
                    description: 'Memory usage patterns suggest optimization potential',
                    impact: 'medium',
                    suggestions: ['memory_pooling', 'optimize_allocations'],
                    severity: 'low',
                    metrics: { efficiency: memoryEfficiency, threshold: 0.7 }
                });
            }
        }
        
        // Check for network optimization opportunities
        const networkLatency = metrics.get('network_latency');
        const networkBaseline = baseline.get('network_latency');
        if (networkLatency && networkBaseline && networkLatency < networkBaseline * 0.8) {
            insights.push({
                type: 'optimization',
                category: 'network',
                title: 'Network Performance Opportunity',
                description: 'Network conditions allow for enhanced features',
                impact: 'low',
                suggestions: ['enable_network_features', 'increase_sync_frequency'],
                severity: 'low',
                metrics: { current: networkLatency, baseline: networkBaseline, ratio: networkLatency / networkBaseline }
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
                    suggestions: ['investigate_performance', 'restart_application'],
                    severity: 'high',
                    metrics: { confidence: trendData.confidence, trend: trendData.trend, metric: metricId }
                });
            }
            
            if (metricId === 'memory_used' && trendData.trend === 'increasing' && trendData.confidence > 0.8) {
                insights.push({
                    type: 'degradation',
                    category: 'memory',
                    title: 'Memory Degradation Detected',
                    description: `Memory usage is consistently increasing with ${(trendData.confidence * 100).toFixed(1)}% confidence`,
                    impact: 'medium',
                    suggestions: ['memory_cleanup', 'investigate_leaks'],
                    severity: 'medium',
                    metrics: { confidence: trendData.confidence, trend: trendData.trend, metric: metricId }
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
                suggestions: ['emergency_mode', 'restart_application'],
                severity: 'critical',
                metrics: { anomaly_count: recentAnomalies.length, time_window: 30000 }
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
                suggestions: ['memory_cleanup', 'close_unused_features'],
                severity: this.calculateSeverity(memoryUsed, memoryBaseline, 'memory'),
                metrics: { current: memoryUsed, baseline: memoryBaseline, ratio: memoryUsed / memoryBaseline }
            });
        }
        
        // Check CPU utilization (if available)
        const cpuUsage = metrics.get('cpu_usage');
        if (cpuUsage && cpuUsage > 80) {
            insights.push({
                type: 'resource',
                category: 'cpu',
                title: 'High CPU Utilization',
                description: `CPU usage (${cpuUsage.toFixed(1)}%) is very high`,
                impact: 'high',
                suggestions: ['reduce_cpu_load', 'optimize_algorithms'],
                severity: cpuUsage > 90 ? 'high' : 'medium',
                metrics: { current: cpuUsage, threshold: 80 }
            });
        }
        
        // Check network utilization
        const networkLatency = metrics.get('network_latency');
        const networkBaseline = baseline.get('network_latency');
        if (networkLatency && networkBaseline && networkLatency > networkBaseline * 2) {
            insights.push({
                type: 'resource',
                category: 'network',
                title: 'High Network Latency',
                description: `Network latency (${networkLatency.toFixed(1)}ms) is significantly elevated`,
                impact: 'medium',
                suggestions: ['check_network', 'reduce_network_load'],
                severity: this.calculateSeverity(networkLatency, networkBaseline, 'network'),
                metrics: { current: networkLatency, baseline: networkBaseline, ratio: networkLatency / networkBaseline }
            });
        }
        
        return insights;
    }
    
    /**
     * Calculate severity based on metric deviation
     * @param {number} current - Current value
     * @param {number} baseline - Baseline value
     * @param {string} metricType - Type of metric
     * @returns {string} Severity level
     */
    calculateSeverity(current, baseline, metricType) {
        if (!baseline || baseline === 0) return 'medium';
        
        const ratio = current / baseline;
        
        switch (metricType) {
            case 'fps':
                if (ratio < 0.5) return 'critical';
                if (ratio < 0.7) return 'high';
                if (ratio < 0.9) return 'medium';
                return 'low';
                
            case 'frame_time':
            case 'memory':
            case 'network':
                if (ratio > 3) return 'critical';
                if (ratio > 2) return 'high';
                if (ratio > 1.5) return 'medium';
                return 'low';
                
            default:
                return 'medium';
        }
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
     * Get insights by type
     * @param {string} type - Insight type
     * @returns {Array} Filtered insights
     */
    getInsightsByType(type) {
        return this.insights.filter(insight => insight.type === type);
    }
    
    /**
     * Get insights by severity
     * @param {string} severity - Severity level
     * @returns {Array} Filtered insights
     */
    getInsightsBySeverity(severity) {
        return this.insights.filter(insight => insight.severity === severity);
    }
    
    /**
     * Generate comprehensive report
     * @returns {object} Comprehensive performance report
     */
    generateReport() {
        const recentInsights = this.getRecentInsights();
        const criticalInsights = this.getInsightsBySeverity('critical');
        const highInsights = this.getInsightsBySeverity('high');
        
        return {
            timestamp: Date.now(),
            summary: {
                total_insights: this.insights.length,
                recent_insights: recentInsights.length,
                critical_issues: criticalInsights.length,
                high_priority_issues: highInsights.length,
                categories: this.getInsightCategorySummary()
            },
            insights: {
                recent: recentInsights,
                critical: criticalInsights,
                high_priority: highInsights,
                by_category: this.groupInsightsByCategory(recentInsights)
            },
            recommendations: this.generateRecommendations(recentInsights)
        };
    }
    
    /**
     * Get insight category summary
     * @returns {object} Category summary
     */
    getInsightCategorySummary() {
        const summary = {};
        for (const insight of this.insights) {
            summary[insight.category] = (summary[insight.category] || 0) + 1;
        }
        return summary;
    }
    
    /**
     * Group insights by category
     * @param {Array} insights - Insights to group
     * @returns {object} Grouped insights
     */
    groupInsightsByCategory(insights) {
        const grouped = {};
        for (const insight of insights) {
            if (!grouped[insight.category]) {
                grouped[insight.category] = [];
            }
            grouped[insight.category].push(insight);
        }
        return grouped;
    }
    
    /**
     * Generate recommendations based on insights
     * @param {Array} insights - Recent insights
     * @returns {Array} Recommendations
     */
    generateRecommendations(insights) {
        const recommendations = [];
        const suggestionCounts = {};
        
        // Count suggestion frequencies
        for (const insight of insights) {
            for (const suggestion of insight.suggestions || []) {
                suggestionCounts[suggestion] = (suggestionCounts[suggestion] || 0) + 1;
            }
        }
        
        // Generate top recommendations
        const sortedSuggestions = Object.entries(suggestionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        for (const [suggestion, count] of sortedSuggestions) {
            recommendations.push({
                action: suggestion,
                frequency: count,
                priority: count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low',
                description: this.getRecommendationDescription(suggestion)
            });
        }
        
        return recommendations;
    }
    
    /**
     * Get recommendation description
     * @param {string} suggestion - Suggestion key
     * @returns {string} Human-readable description
     */
    getRecommendationDescription(suggestion) {
        const descriptions = {
            'reduce_graphics_quality': 'Consider reducing graphics quality settings to improve performance',
            'optimize_rendering': 'Review rendering pipeline for optimization opportunities',
            'memory_cleanup': 'Perform memory cleanup and garbage collection',
            'check_memory_leaks': 'Investigate potential memory leaks',
            'investigate_performance': 'Conduct detailed performance analysis',
            'restart_application': 'Consider restarting the application to reset performance state',
            'emergency_mode': 'Switch to emergency performance mode',
            'increase_graphics_quality': 'System performance allows for higher graphics settings',
            'enable_advanced_features': 'Performance headroom available for advanced features',
            'close_unused_features': 'Close or disable unused features to free resources'
        };
        
        return descriptions[suggestion] || `Execute action: ${suggestion}`;
    }
    
    /**
     * Clear insights data
     */
    clearInsights() {
        this.insights = [];
        console.log('[PerformanceReportGenerator] Insights data cleared');
    }
    
    /**
     * Export insights data
     * @returns {object} Exported insights
     */
    exportInsights() {
        return {
            timestamp: Date.now(),
            insights: this.insights,
            generators: Object.fromEntries(this.insightGenerators)
        };
    }
    
    /**
     * Cleanup generator resources
     */
    destroy() {
        this.insights = [];
        this.insightGenerators.clear();
        console.log('[PerformanceReportGenerator] Generator destroyed');
    }
}