/**
 * Performance Analysis System
 * パフォーマンス分析システム - 分析とレポート生成
 */

/**
 * Performance Analyzer
 * パフォーマンス分析器 - 収集されたメトリクスの分析
 */
export class PerformanceAnalyzer {
    constructor() {
        this.analysisHistory = [];
        this.maxHistorySize = 50;
        this.analysisThresholds = {
            fps: { excellent: 55, good: 45, warning: 30, critical: 15 },
            frameTime: { excellent: 16.67, good: 22.22, warning: 33.33, critical: 66.67 },
            memory: { excellent: 0.3, good: 0.5, warning: 0.7, critical: 0.9 },
            responseTime: { excellent: 16, good: 50, warning: 100, critical: 200 }
        };
    }

    async initialize() {
        console.log('Performance Analyzer initialized');
    }

    analyzeMetrics(allMetrics) {
        const timestamp = Date.now();
        const analysis = {
            timestamp,
            overall: this.analyzeOverallPerformance(allMetrics),
            frame: this.analyzeFrameMetrics(allMetrics.frame),
            memory: this.analyzeMemoryMetrics(allMetrics.memory),
            render: this.analyzeRenderMetrics(allMetrics.render),
            network: this.analyzeNetworkMetrics(allMetrics.network),
            interaction: this.analyzeInteractionMetrics(allMetrics.interaction),
            resource: this.analyzeResourceMetrics(allMetrics.resource),
            custom: this.analyzeCustomMetrics(allMetrics.custom),
            bottlenecks: this.identifyBottlenecks(allMetrics),
            recommendations: this.generateRecommendations(allMetrics)
        };

        this.recordAnalysis(analysis);
        return analysis;
    }

    analyzeOverallPerformance(allMetrics) {
        const scores = {
            frame: this.calculateFrameScore(allMetrics.frame),
            memory: this.calculateMemoryScore(allMetrics.memory),
            render: this.calculateRenderScore(allMetrics.render),
            network: this.calculateNetworkScore(allMetrics.network),
            interaction: this.calculateInteractionScore(allMetrics.interaction)
        };

        const weightedScore = (
            scores.frame * 0.3 +
            scores.memory * 0.25 +
            scores.render * 0.2 +
            scores.network * 0.15 +
            scores.interaction * 0.1
        );

        return {
            score: weightedScore,
            grade: this.scoreToGrade(weightedScore),
            breakdown: scores,
            healthStatus: this.determineHealthStatus(weightedScore)
        };
    }

    analyzeFrameMetrics(frameMetrics) {
        if (!frameMetrics) return { status: 'no_data' };

        const current = frameMetrics.current || {};
        const average = frameMetrics.average || {};
        const performance = frameMetrics.performance || {};

        return {
            currentFPS: current.fps || 0,
            averageFPS: average.fps || 0,
            stability: this.calculateFrameStability(frameMetrics),
            jankLevel: performance.jankPercentage || 0,
            assessment: this.assessFramePerformance(average.fps, performance.jankPercentage),
            trends: this.analyzeFrameTrends(frameMetrics.history)
        };
    }

    analyzeMemoryMetrics(memoryMetrics) {
        if (!memoryMetrics) return { status: 'no_data' };

        const current = memoryMetrics.current || {};
        const trends = memoryMetrics.trends || {};
        const gc = memoryMetrics.gc || {};

        return {
            currentUsage: current.used || 0,
            pressureLevel: current.pressure || 0,
            growthRate: trends.growthRate || 0,
            gcEfficiency: gc.frequency > 0 ? gc.averageReclaimed / current.used : 1,
            leakRisk: this.assessMemoryLeakRisk(trends.growthRate, gc.frequency),
            recommendations: this.generateMemoryRecommendations(current, trends, gc)
        };
    }

    analyzeRenderMetrics(renderMetrics) {
        if (!renderMetrics) return { status: 'no_data' };

        const stats = renderMetrics.statistics || {};

        return {
            averageRenderTime: stats.averageDuration || 0,
            renderEfficiency: this.calculateRenderEfficiency(stats),
            bottlenecks: this.identifyRenderBottlenecks(renderMetrics),
            paintFrequency: stats.paintEvents || 0,
            customMeasures: stats.customMeasures || 0
        };
    }

    analyzeNetworkMetrics(networkMetrics) {
        if (!networkMetrics) return { status: 'no_data' };

        const summary = networkMetrics.summary || {};
        const timing = networkMetrics.timing || {};

        return {
            totalRequests: summary.totalRequests || 0,
            totalTransfer: summary.totalTransfer || 0,
            averageLatency: summary.averageDuration || 0,
            networkEfficiency: this.calculateNetworkEfficiency(timing),
            resourceBreakdown: summary.byType || {},
            bottlenecks: this.identifyNetworkBottlenecks(timing)
        };
    }

    analyzeInteractionMetrics(interactionMetrics) {
        if (!interactionMetrics) return { status: 'no_data' };

        const summary = interactionMetrics.summary || {};

        return {
            totalInteractions: summary.totalInteractions || 0,
            averageResponseTime: summary.averageResponseTime || 0,
            responsiveness: this.assessResponsiveness(summary.averageResponseTime),
            interactionTypes: summary.byType || {},
            slowInteractions: summary.maxResponseTime > 100
        };
    }

    analyzeResourceMetrics(resourceMetrics) {
        if (!resourceMetrics) return { status: 'no_data' };

        const current = resourceMetrics.current || {};
        const trends = resourceMetrics.trends || {};

        return {
            domComplexity: current.dom?.nodes || 0,
            domGrowth: trends.domGrowth || 0,
            storageUsage: current.storage?.localStorage?.used || 0,
            storageGrowth: trends.storageGrowth || 0,
            resourceHealth: this.assessResourceHealth(current, trends)
        };
    }

    analyzeCustomMetrics(customMetrics) {
        if (!customMetrics || Object.keys(customMetrics).length === 0) {
            return { status: 'no_data' };
        }

        const analysis = {};
        for (const [name, metric] of Object.entries(customMetrics)) {
            analysis[name] = {
                current: metric.current,
                trend: this.calculateTrend(metric.recent),
                variability: this.calculateVariability(metric.recent),
                alertLevel: this.assessCustomMetric(metric)
            };
        }

        return analysis;
    }

    identifyBottlenecks(allMetrics) {
        const bottlenecks = [];

        // Frame rate bottlenecks
        if (allMetrics.frame?.performance?.jankPercentage > 10) {
            bottlenecks.push({
                type: 'frame_drops',
                severity: 'high',
                description: 'Frequent frame drops detected',
                impact: 'Visual stuttering',
                metrics: { jankPercentage: allMetrics.frame.performance.jankPercentage }
            });
        }

        // Memory bottlenecks
        if (allMetrics.memory?.current?.pressure > 0.8) {
            bottlenecks.push({
                type: 'memory_pressure',
                severity: 'critical',
                description: 'High memory pressure',
                impact: 'Risk of crashes',
                metrics: { pressure: allMetrics.memory.current.pressure }
            });
        }

        // Network bottlenecks
        if (allMetrics.network?.timing?.averageResponse > 1000) {
            bottlenecks.push({
                type: 'slow_network',
                severity: 'medium',
                description: 'Slow network responses',
                impact: 'Poor user experience',
                metrics: { averageResponse: allMetrics.network.timing.averageResponse }
            });
        }

        // Interaction bottlenecks
        if (allMetrics.interaction?.summary?.averageResponseTime > 100) {
            bottlenecks.push({
                type: 'slow_interactions',
                severity: 'medium',
                description: 'Slow interaction responses',
                impact: 'Unresponsive interface',
                metrics: { averageResponseTime: allMetrics.interaction.summary.averageResponseTime }
            });
        }

        return bottlenecks;
    }

    generateRecommendations(allMetrics) {
        const recommendations = [];

        // Frame performance recommendations
        const frameAnalysis = this.analyzeFrameMetrics(allMetrics.frame);
        if (frameAnalysis.currentFPS < 45) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Improve Frame Rate',
                description: 'Consider reducing visual effects or optimizing rendering',
                actions: ['Reduce particle count', 'Lower graphics quality', 'Optimize shaders']
            });
        }

        // Memory recommendations
        const memoryAnalysis = this.analyzeMemoryMetrics(allMetrics.memory);
        if (memoryAnalysis.pressureLevel > 0.7) {
            recommendations.push({
                category: 'memory',
                priority: 'high',
                title: 'Reduce Memory Usage',
                description: 'High memory pressure detected',
                actions: ['Clear unused caches', 'Optimize object pooling', 'Review memory leaks']
            });
        }

        // Network recommendations
        const networkAnalysis = this.analyzeNetworkMetrics(allMetrics.network);
        if (networkAnalysis.averageLatency > 500) {
            recommendations.push({
                category: 'network',
                priority: 'medium',
                title: 'Optimize Network Requests',
                description: 'Network latency is affecting performance',
                actions: ['Enable compression', 'Use CDN', 'Implement caching']
            });
        }

        return recommendations;
    }

    // Helper methods
    calculateFrameScore(frameMetrics) {
        if (!frameMetrics?.average?.fps) return 0;
        const fps = frameMetrics.average.fps;
        if (fps >= this.analysisThresholds.fps.excellent) return 1.0;
        if (fps >= this.analysisThresholds.fps.good) return 0.8;
        if (fps >= this.analysisThresholds.fps.warning) return 0.6;
        if (fps >= this.analysisThresholds.fps.critical) return 0.4;
        return 0.2;
    }

    calculateMemoryScore(memoryMetrics) {
        if (!memoryMetrics?.current?.pressure) return 1.0;
        const pressure = memoryMetrics.current.pressure;
        return Math.max(0, 1 - pressure);
    }

    calculateRenderScore(renderMetrics) {
        if (!renderMetrics?.statistics?.averageDuration) return 1.0;
        const renderTime = renderMetrics.statistics.averageDuration;
        if (renderTime <= this.analysisThresholds.frameTime.excellent) return 1.0;
        if (renderTime <= this.analysisThresholds.frameTime.good) return 0.8;
        if (renderTime <= this.analysisThresholds.frameTime.warning) return 0.6;
        return 0.4;
    }

    calculateNetworkScore(networkMetrics) {
        if (!networkMetrics?.summary?.averageDuration) return 1.0;
        const avgDuration = networkMetrics.summary.averageDuration;
        return Math.max(0, 1 - (avgDuration / 2000)); // Normalize to 2s max
    }

    calculateInteractionScore(interactionMetrics) {
        if (!interactionMetrics?.summary?.averageResponseTime) return 1.0;
        const responseTime = interactionMetrics.summary.averageResponseTime;
        if (responseTime <= this.analysisThresholds.responseTime.excellent) return 1.0;
        if (responseTime <= this.analysisThresholds.responseTime.good) return 0.8;
        if (responseTime <= this.analysisThresholds.responseTime.warning) return 0.6;
        return 0.4;
    }

    scoreToGrade(score) {
        if (score >= 0.9) return 'A+';
        if (score >= 0.8) return 'A';
        if (score >= 0.7) return 'B+';
        if (score >= 0.6) return 'B';
        if (score >= 0.5) return 'C+';
        if (score >= 0.4) return 'C';
        if (score >= 0.3) return 'D+';
        if (score >= 0.2) return 'D';
        return 'F';
    }

    determineHealthStatus(score) {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'warning';
        return 'critical';
    }

    calculateFrameStability(frameMetrics) {
        const history = frameMetrics.history || [];
        if (history.length < 2) return 1.0;

        const frameTimes = history.map(f => f.frameTime);
        const average = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const variance = frameTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / frameTimes.length;
        const standardDeviation = Math.sqrt(variance);

        return Math.max(0, 1 - (standardDeviation / average));
    }

    assessFramePerformance(avgFPS, jankPercentage) {
        if (avgFPS >= 55 && jankPercentage < 5) return 'excellent';
        if (avgFPS >= 45 && jankPercentage < 10) return 'good';
        if (avgFPS >= 30 && jankPercentage < 20) return 'acceptable';
        return 'poor';
    }

    analyzeFrameTrends(history) {
        if (!history || history.length < 3) return 'insufficient_data';

        const recentFPS = history.slice(-3).map(f => f.fps);
        const trend = recentFPS[2] - recentFPS[0];

        if (trend > 5) return 'improving';
        if (trend < -5) return 'declining';
        return 'stable';
    }

    assessMemoryLeakRisk(growthRate, gcFrequency) {
        if (growthRate > 1000 && gcFrequency < 2) return 'high';
        if (growthRate > 500) return 'medium';
        return 'low';
    }

    generateMemoryRecommendations(current, trends, gc) {
        const recommendations = [];

        if (current.pressure > 0.8) {
            recommendations.push('Immediate cleanup required');
        }
        if (trends.growthRate > 1000) {
            recommendations.push('Check for memory leaks');
        }
        if (gc.frequency > 10) {
            recommendations.push('Reduce object allocation rate');
        }

        return recommendations;
    }

    calculateRenderEfficiency(stats) {
        const { averageDuration, maxDuration, minDuration } = stats;
        if (!averageDuration) return 1.0;

        const consistency = minDuration > 0 ? minDuration / maxDuration : 0;
        const performance = Math.max(0, 1 - (averageDuration / 50)); // 50ms as baseline

        return (consistency + performance) / 2;
    }

    identifyRenderBottlenecks(renderMetrics) {
        const bottlenecks = [];
        const stats = renderMetrics.statistics || {};

        if (stats.averageDuration > 30) {
            bottlenecks.push('Long average render time');
        }
        if (stats.maxDuration > 100) {
            bottlenecks.push('Render spikes detected');
        }

        return bottlenecks;
    }

    calculateNetworkEfficiency(timing) {
        const { averageDNS, averageTCP, averageRequest, averageResponse } = timing;
        const total = averageDNS + averageTCP + averageRequest + averageResponse;
        
        if (total === 0) return 1.0;
        
        // Good efficiency if response time is majority of total time
        return averageResponse / total;
    }

    identifyNetworkBottlenecks(timing) {
        const bottlenecks = [];

        if (timing.averageDNS > 100) bottlenecks.push('Slow DNS resolution');
        if (timing.averageTCP > 200) bottlenecks.push('Slow connection establishment');
        if (timing.averageRequest > 500) bottlenecks.push('Slow request processing');
        if (timing.averageResponse > 1000) bottlenecks.push('Slow server response');

        return bottlenecks;
    }

    assessResponsiveness(averageResponseTime) {
        if (averageResponseTime <= 16) return 'excellent';
        if (averageResponseTime <= 50) return 'good';
        if (averageResponseTime <= 100) return 'acceptable';
        return 'poor';
    }

    assessResourceHealth(current, trends) {
        const issues = [];

        if (current.dom?.nodes > 5000) issues.push('High DOM complexity');
        if (trends.domGrowth > 100) issues.push('DOM growing rapidly');
        if (current.storage?.localStorage?.used > 5000000) issues.push('High storage usage');

        return {
            status: issues.length === 0 ? 'good' : issues.length < 2 ? 'warning' : 'critical',
            issues
        };
    }

    calculateTrend(recentData) {
        if (!recentData || recentData.length < 2) return 'stable';

        const values = recentData.map(d => d.value);
        const first = values[0];
        const last = values[values.length - 1];
        const change = (last - first) / first;

        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    calculateVariability(recentData) {
        if (!recentData || recentData.length < 2) return 0;

        const values = recentData.map(d => d.value);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length;

        return Math.sqrt(variance) / average; // Coefficient of variation
    }

    assessCustomMetric(metric) {
        const variability = this.calculateVariability(metric.recent);
        
        if (variability > 0.5) return 'high_variability';
        if (variability > 0.2) return 'moderate_variability';
        return 'stable';
    }

    recordAnalysis(analysis) {
        this.analysisHistory.push(analysis);

        if (this.analysisHistory.length > this.maxHistorySize) {
            this.analysisHistory.shift();
        }
    }

    getAnalysisHistory() {
        return [...this.analysisHistory];
    }

    getLatestAnalysis() {
        return this.analysisHistory[this.analysisHistory.length - 1] || null;
    }
}

/**
 * Performance Reporter
 * パフォーマンスレポーター - レポート生成とエクスポート
 */
export class PerformanceReporter {
    constructor() {
        this.reportTemplates = new Map();
        this.setupDefaultTemplates();
    }

    async initialize() {
        console.log('Performance Reporter initialized');
    }

    setupDefaultTemplates() {
        this.reportTemplates.set('summary', {
            name: 'Performance Summary',
            sections: ['overall', 'bottlenecks', 'recommendations'],
            format: 'text'
        });

        this.reportTemplates.set('detailed', {
            name: 'Detailed Performance Report',
            sections: ['overall', 'frame', 'memory', 'render', 'network', 'interaction', 'bottlenecks', 'recommendations'],
            format: 'text'
        });

        this.reportTemplates.set('technical', {
            name: 'Technical Analysis Report',
            sections: ['metrics', 'analysis', 'trends', 'recommendations'],
            format: 'json'
        });
    }

    generateReport(analysisData, templateName = 'summary', options = {}) {
        const template = this.reportTemplates.get(templateName);
        if (!template) {
            throw new Error(`Unknown report template: ${templateName}`);
        }

        const reportData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                template: template.name,
                version: '1.0.0'
            },
            ...analysisData
        };

        switch (template.format) {
            case 'text':
                return this.generateTextReport(reportData, template.sections);
            case 'json':
                return this.generateJSONReport(reportData, template.sections);
            case 'html':
                return this.generateHTMLReport(reportData, template.sections);
            default:
                return this.generateTextReport(reportData, template.sections);
        }
    }

    generateTextReport(data, sections) {
        let report = `Performance Analysis Report\n`;
        report += `Generated: ${data.metadata.generatedAt}\n`;
        report += `Template: ${data.metadata.template}\n\n`;

        if (sections.includes('overall')) {
            report += this.generateOverallSection(data.overall);
        }

        if (sections.includes('bottlenecks')) {
            report += this.generateBottlenecksSection(data.bottlenecks);
        }

        if (sections.includes('recommendations')) {
            report += this.generateRecommendationsSection(data.recommendations);
        }

        if (sections.includes('frame')) {
            report += this.generateFrameSection(data.frame);
        }

        if (sections.includes('memory')) {
            report += this.generateMemorySection(data.memory);
        }

        return report;
    }

    generateJSONReport(data, sections) {
        const filteredData = { metadata: data.metadata };
        
        sections.forEach(section => {
            if (data[section]) {
                filteredData[section] = data[section];
            }
        });

        return JSON.stringify(filteredData, null, 2);
    }

    generateHTMLReport(data, sections) {
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin-bottom: 20px; }
        .metric { margin: 5px 0; }
        .good { color: green; }
        .warning { color: orange; }
        .critical { color: red; }
    </style>
</head>
<body>
    <h1>Performance Analysis Report</h1>
    <p>Generated: ${data.metadata.generatedAt}</p>
`;

        if (sections.includes('overall')) {
            html += this.generateOverallSectionHTML(data.overall);
        }

        html += '</body></html>';
        return html;
    }

    generateOverallSection(overall) {
        if (!overall) return '';

        return `=== OVERALL PERFORMANCE ===
Score: ${overall.score.toFixed(2)}/1.00 (Grade: ${overall.grade})
Health Status: ${overall.healthStatus.toUpperCase()}

Breakdown:
- Frame Performance: ${overall.breakdown.frame.toFixed(2)}
- Memory Efficiency: ${overall.breakdown.memory.toFixed(2)}
- Render Performance: ${overall.breakdown.render.toFixed(2)}
- Network Performance: ${overall.breakdown.network.toFixed(2)}
- Interaction Responsiveness: ${overall.breakdown.interaction.toFixed(2)}

`;
    }

    generateBottlenecksSection(bottlenecks) {
        if (!bottlenecks || bottlenecks.length === 0) {
            return `=== BOTTLENECKS ===
No significant bottlenecks detected.

`;
        }

        let section = `=== BOTTLENECKS ===\n`;
        bottlenecks.forEach((bottleneck, index) => {
            section += `${index + 1}. ${bottleneck.description}
   Type: ${bottleneck.type}
   Severity: ${bottleneck.severity.toUpperCase()}
   Impact: ${bottleneck.impact}
   
`;
        });

        return section;
    }

    generateRecommendationsSection(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return `=== RECOMMENDATIONS ===
No specific recommendations at this time.

`;
        }

        let section = `=== RECOMMENDATIONS ===\n`;
        recommendations.forEach((rec, index) => {
            section += `${index + 1}. ${rec.title} (${rec.priority} priority)
   Category: ${rec.category}
   Description: ${rec.description}
   Actions: ${rec.actions.join(', ')}
   
`;
        });

        return section;
    }

    generateFrameSection(frame) {
        if (!frame || frame.status === 'no_data') {
            return `=== FRAME PERFORMANCE ===
No frame data available.

`;
        }

        return `=== FRAME PERFORMANCE ===
Current FPS: ${frame.currentFPS.toFixed(1)}
Average FPS: ${frame.averageFPS.toFixed(1)}
Stability: ${(frame.stability * 100).toFixed(1)}%
Jank Level: ${frame.jankLevel.toFixed(1)}%
Assessment: ${frame.assessment.toUpperCase()}
Trend: ${frame.trends}

`;
    }

    generateMemorySection(memory) {
        if (!memory || memory.status === 'no_data') {
            return `=== MEMORY PERFORMANCE ===
No memory data available.

`;
        }

        return `=== MEMORY PERFORMANCE ===
Current Usage: ${(memory.currentUsage / 1024 / 1024).toFixed(1)} MB
Pressure Level: ${(memory.pressureLevel * 100).toFixed(1)}%
Growth Rate: ${memory.growthRate.toFixed(0)} bytes/sec
GC Efficiency: ${(memory.gcEfficiency * 100).toFixed(1)}%
Leak Risk: ${memory.leakRisk.toUpperCase()}

`;
    }

    generateOverallSectionHTML(overall) {
        if (!overall) return '';

        const statusClass = overall.healthStatus === 'excellent' ? 'good' : 
                          overall.healthStatus === 'critical' ? 'critical' : 'warning';

        return `<div class="section">
    <h2>Overall Performance</h2>
    <div class="metric">Score: ${overall.score.toFixed(2)}/1.00 (Grade: ${overall.grade})</div>
    <div class="metric ${statusClass}">Health Status: ${overall.healthStatus.toUpperCase()}</div>
</div>`;
    }

    exportReport(reportContent, format, filename) {
        const timestamp = new Date().toISOString().split('T')[0];
        const exportFilename = filename || `performance-report-${timestamp}`;

        if (typeof document !== 'undefined') {
            // Browser environment
            const blob = new Blob([reportContent], { 
                type: format === 'json' ? 'application/json' : 'text/plain' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportFilename}.${format === 'json' ? 'json' : 'txt'}`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // Node.js environment
            console.log('Report generated:', reportContent);
        }

        return {
            filename: exportFilename,
            size: reportContent.length,
            format: format
        };
    }

    getAvailableTemplates() {
        return Array.from(this.reportTemplates.keys());
    }

    addCustomTemplate(name, template) {
        this.reportTemplates.set(name, template);
    }
}

/**
 * Performance Dashboard
 * パフォーマンスダッシュボード - リアルタイム表示
 */
export class PerformanceDashboard {
    constructor() {
        this.dashboardElement = null;
        this.updateInterval = null;
        this.isVisible = false;
    }

    async initialize() {
        this.createDashboardElement();
        console.log('Performance Dashboard initialized');
    }

    createDashboardElement() {
        if (typeof document === 'undefined') return;

        this.dashboardElement = document.createElement('div');
        this.dashboardElement.id = 'performance-dashboard';
        this.dashboardElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
        `;

        document.body.appendChild(this.dashboardElement);
    }

    show() {
        if (this.dashboardElement) {
            this.dashboardElement.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.dashboardElement) {
            this.dashboardElement.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateDisplay(analysisData) {
        if (!this.dashboardElement || !this.isVisible) return;

        const overall = analysisData.overall || {};
        const frame = analysisData.frame || {};
        const memory = analysisData.memory || {};

        const html = `
            <div><strong>Performance Dashboard</strong></div>
            <div>Overall: ${overall.grade || 'N/A'} (${(overall.score * 100).toFixed(0) || 0}%)</div>
            <div>FPS: ${frame.currentFPS?.toFixed(1) || 'N/A'}</div>
            <div>Memory: ${memory.currentUsage ? (memory.currentUsage / 1024 / 1024).toFixed(1) + ' MB' : 'N/A'}</div>
            <div>Pressure: ${memory.pressureLevel ? (memory.pressureLevel * 100).toFixed(0) + '%' : 'N/A'}</div>
            <div>Status: <span style="color: ${this.getStatusColor(overall.healthStatus)}">${overall.healthStatus || 'unknown'}</span></div>
        `;

        this.dashboardElement.innerHTML = html;
    }

    getStatusColor(status) {
        switch (status) {
            case 'excellent': return '#00ff00';
            case 'good': return '#88ff88';
            case 'warning': return '#ffaa00';
            case 'critical': return '#ff0000';
            default: return '#ffffff';
        }
    }

    startAutoUpdate(analysisCallback, interval = 1000) {
        this.updateInterval = setInterval(() => {
            if (this.isVisible && analysisCallback) {
                const analysisData = analysisCallback();
                if (analysisData) {
                    this.updateDisplay(analysisData);
                }
            }
        }, interval);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    destroy() {
        this.stopAutoUpdate();
        if (this.dashboardElement && this.dashboardElement.parentNode) {
            this.dashboardElement.parentNode.removeChild(this.dashboardElement);
        }
    }
}