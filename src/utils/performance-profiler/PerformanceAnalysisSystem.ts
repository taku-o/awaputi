/**
 * Performance Analysis System
 * パフォーマンス分析システム - 分析とレポート生成
 */

// Type definitions for analysis system
interface AnalysisThresholds {
    fps: ThresholdLevels;
    frameTime: ThresholdLevels;
    memory: ThresholdLevels;
    responseTime: ThresholdLevels;
}

interface ThresholdLevels {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
}

interface AllMetrics {
    frame?: FrameMetricsData;
    memory?: MemoryMetricsData;
    render?: RenderMetricsData;
    network?: NetworkMetricsData;
    interaction?: InteractionMetricsData;
    resource?: ResourceMetricsData;
    custom?: CustomMetricsData;
}

interface FrameMetricsData {
    current?: { fps: number; frameTime: number };
    average?: { fps: number; frameTime: number };
    performance?: { jankPercentage: number; jankFrames: number; smoothFrames: number };
    history?: FrameMetric[];
}

interface FrameMetric {
    frameNumber: number;
    timestamp: number;
    frameTime: number;
    fps: number;
    jank: number;
}

interface MemoryMetricsData {
    current?: { used: number; total: number; pressure: number; available: number };
    trends?: { growthRate: number; peakUsage: number; averageUsage: number };
    gc?: { frequency: number; totalReclaimed: number; averageReclaimed: number };
    history?: MemoryMetric[];
}

interface MemoryMetric {
    timestamp: number;
    used: number;
    total: number;
    limit: number;
    pressure: number;
    available: number;
    gc: { detected: boolean; reclaimed: number };
}

interface RenderMetricsData {
    statistics?: {
        totalRenders: number;
        paintEvents: number;
        customMeasures: number;
        averageDuration: number;
        maxDuration: number;
        minDuration: number;
    };
    recent?: RenderMetric[];
}

interface RenderMetric {
    timestamp: number;
    type: string;
    name: string;
    startTime: number;
    endTime?: number;
    duration: number;
}

interface NetworkMetricsData {
    summary?: {
        totalRequests: number;
        totalTransfer: number;
        averageDuration: number;
        byType: Record<string, NetworkResourceType>;
    };
    timing?: {
        averageDNS: number;
        averageTCP: number;
        averageRequest: number;
        averageResponse: number;
    };
    recent?: NetworkMetric[];
}

interface NetworkResourceType {
    count: number;
    totalSize: number;
    totalTime: number;
}

interface NetworkMetric {
    timestamp: number;
    name: string;
    type: string;
    startTime: number;
    duration: number;
    transferSize: number;
    encodedBodySize: number;
    decodedBodySize: number;
    timing: NetworkTiming;
}

interface NetworkTiming {
    dns: number;
    tcp: number;
    ssl: number;
    request: number;
    response: number;
    total: number;
}

interface InteractionMetricsData {
    summary?: {
        totalInteractions: number;
        averageResponseTime: number;
        maxResponseTime: number;
        minResponseTime: number;
        byType: Record<string, InteractionTypeStats>;
    };
    recent?: InteractionMetric[];
}

interface InteractionTypeStats {
    count: number;
    totalResponseTime: number;
    averageResponseTime: number;
}

interface InteractionMetric {
    timestamp: number;
    type: string;
    target: string;
    responseTime: number;
    coordinates: { x: number; y: number } | null;
}

interface ResourceMetricsData {
    current?: {
        dom?: { nodes: number; images: number; scripts: number; stylesheets: number };
        storage?: {
            localStorage?: { used?: number; available?: string; error?: string };
            sessionStorage?: { used?: number; available?: string; error?: string };
        };
        cache?: { estimated: string };
    };
    trends?: {
        domGrowth: number;
        storageGrowth: number;
    };
    history?: ResourceMetric[];
}

interface ResourceMetric {
    timestamp: number;
    dom: { nodes: number; images: number; scripts: number; stylesheets: number };
    storage: {
        localStorage: { used?: number; available?: string; error?: string };
        sessionStorage: { used?: number; available?: string; error?: string };
    };
    cache: { estimated: string };
}

interface CustomMetricsData {
    [metricName: string]: {
        current: number;
        count: number;
        recent: CustomMetric[];
        statistics: { min: number; max: number; average: number; sum: number };
    };
}

interface CustomMetric {
    timestamp: number;
    name: string;
    value: number;
    metadata: Record<string, any>;
}

// Analysis result types
interface PerformanceAnalysis {
    timestamp: number;
    overall: OverallAnalysis;
    frame: FrameAnalysis;
    memory: MemoryAnalysis;
    render: RenderAnalysis;
    network: NetworkAnalysis;
    interaction: InteractionAnalysis;
    resource: ResourceAnalysis;
    custom: CustomAnalysis;
    bottlenecks: PerformanceBottleneck[];
    recommendations: PerformanceRecommendation[];
}

interface OverallAnalysis {
    score: number;
    grade: string;
    breakdown: {
        frame: number;
        memory: number;
        render: number;
        network: number;
        interaction: number;
    };
    healthStatus: string;
}

interface FrameAnalysis {
    status?: string;
    currentFPS: number;
    averageFPS: number;
    stability: number;
    jankLevel: number;
    assessment: string;
    trends: string;
}

interface MemoryAnalysis {
    status?: string;
    currentUsage: number;
    pressureLevel: number;
    growthRate: number;
    gcEfficiency: number;
    leakRisk: string;
    recommendations: string[];
}

interface RenderAnalysis {
    status?: string;
    averageRenderTime: number;
    renderEfficiency: number;
    bottlenecks: string[];
    paintFrequency: number;
    customMeasures: number;
}

interface NetworkAnalysis {
    status?: string;
    totalRequests: number;
    totalTransfer: number;
    averageLatency: number;
    networkEfficiency: number;
    resourceBreakdown: Record<string, NetworkResourceType>;
    bottlenecks: string[];
}

interface InteractionAnalysis {
    status?: string;
    totalInteractions: number;
    averageResponseTime: number;
    responsiveness: string;
    interactionTypes: Record<string, InteractionTypeStats>;
    slowInteractions: boolean;
}

interface ResourceAnalysis {
    status?: string;
    domComplexity: number;
    domGrowth: number;
    storageUsage: number;
    storageGrowth: number;
    resourceHealth: ResourceHealthAssessment;
}

interface ResourceHealthAssessment {
    status: string;
    issues: string[];
}

interface CustomAnalysis {
    status?: string;
    [metricName: string]: any;
}

interface PerformanceBottleneck {
    type: string;
    severity: string;
    description: string;
    impact: string;
    metrics: Record<string, any>;
}

interface PerformanceRecommendation {
    category: string;
    priority: string;
    title: string;
    description: string;
    actions: string[];
}

// Report types
interface ReportTemplate {
    name: string;
    sections: string[];
    format: string;
}

interface ReportData {
    metadata: ReportMetadata;
    overall?: OverallAnalysis;
    frame?: FrameAnalysis;
    memory?: MemoryAnalysis;
    render?: RenderAnalysis;
    network?: NetworkAnalysis;
    interaction?: InteractionAnalysis;
    resource?: ResourceAnalysis;
    custom?: CustomAnalysis;
    bottlenecks?: PerformanceBottleneck[];
    recommendations?: PerformanceRecommendation[];
    [key: string]: any;
}

interface ReportMetadata {
    generatedAt: string;
    template: string;
    version: string;
}

interface ExportResult {
    filename: string;
    size: number;
    format: string;
}

/**
 * Performance Analyzer
 * パフォーマンス分析器 - 収集されたメトリクスの分析
 */
export class PerformanceAnalyzer {
    private analysisHistory: PerformanceAnalysis[];
    private maxHistorySize: number;
    private analysisThresholds: AnalysisThresholds;

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

    async initialize(): Promise<void> {
        console.log('Performance Analyzer initialized');
    }

    analyzeMetrics(allMetrics: AllMetrics): PerformanceAnalysis {
        const timestamp = Date.now();
        const analysis: PerformanceAnalysis = {
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

    private analyzeOverallPerformance(allMetrics: AllMetrics): OverallAnalysis {
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

    private analyzeFrameMetrics(frameMetrics?: FrameMetricsData): FrameAnalysis {
        if (!frameMetrics) return { status: 'no_data', currentFPS: 0, averageFPS: 0, stability: 0, jankLevel: 0, assessment: 'unknown', trends: 'unknown' };

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

    private analyzeMemoryMetrics(memoryMetrics?: MemoryMetricsData): MemoryAnalysis {
        if (!memoryMetrics) return { status: 'no_data', currentUsage: 0, pressureLevel: 0, growthRate: 0, gcEfficiency: 0, leakRisk: 'unknown', recommendations: [] };

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

    private analyzeRenderMetrics(renderMetrics?: RenderMetricsData): RenderAnalysis {
        if (!renderMetrics) return { status: 'no_data', averageRenderTime: 0, renderEfficiency: 0, bottlenecks: [], paintFrequency: 0, customMeasures: 0 };

        const stats = renderMetrics.statistics || {};

        return {
            averageRenderTime: stats.averageDuration || 0,
            renderEfficiency: this.calculateRenderEfficiency(stats),
            bottlenecks: this.identifyRenderBottlenecks(renderMetrics),
            paintFrequency: stats.paintEvents || 0,
            customMeasures: stats.customMeasures || 0
        };
    }

    private analyzeNetworkMetrics(networkMetrics?: NetworkMetricsData): NetworkAnalysis {
        if (!networkMetrics) return { status: 'no_data', totalRequests: 0, totalTransfer: 0, averageLatency: 0, networkEfficiency: 0, resourceBreakdown: {}, bottlenecks: [] };

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

    private analyzeInteractionMetrics(interactionMetrics?: InteractionMetricsData): InteractionAnalysis {
        if (!interactionMetrics) return { status: 'no_data', totalInteractions: 0, averageResponseTime: 0, responsiveness: 'unknown', interactionTypes: {}, slowInteractions: false };

        const summary = interactionMetrics.summary || {};

        return {
            totalInteractions: summary.totalInteractions || 0,
            averageResponseTime: summary.averageResponseTime || 0,
            responsiveness: this.assessResponsiveness(summary.averageResponseTime),
            interactionTypes: summary.byType || {},
            slowInteractions: summary.maxResponseTime > 100
        };
    }

    private analyzeResourceMetrics(resourceMetrics?: ResourceMetricsData): ResourceAnalysis {
        if (!resourceMetrics) return { status: 'no_data', domComplexity: 0, domGrowth: 0, storageUsage: 0, storageGrowth: 0, resourceHealth: { status: 'unknown', issues: [] } };

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

    private analyzeCustomMetrics(customMetrics?: CustomMetricsData): CustomAnalysis {
        if (!customMetrics || Object.keys(customMetrics).length === 0) {
            return { status: 'no_data' };
        }

        const analysis: CustomAnalysis = {};
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

    private identifyBottlenecks(allMetrics: AllMetrics): PerformanceBottleneck[] {
        const bottlenecks: PerformanceBottleneck[] = [];

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

    private generateRecommendations(allMetrics: AllMetrics): PerformanceRecommendation[] {
        const recommendations: PerformanceRecommendation[] = [];

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
    private calculateFrameScore(frameMetrics?: FrameMetricsData): number {
        if (!frameMetrics?.average?.fps) return 0;
        const fps = frameMetrics.average.fps;
        if (fps >= this.analysisThresholds.fps.excellent) return 1.0;
        if (fps >= this.analysisThresholds.fps.good) return 0.8;
        if (fps >= this.analysisThresholds.fps.warning) return 0.6;
        if (fps >= this.analysisThresholds.fps.critical) return 0.4;
        return 0.2;
    }

    private calculateMemoryScore(memoryMetrics?: MemoryMetricsData): number {
        if (!memoryMetrics?.current?.pressure) return 1.0;
        const pressure = memoryMetrics.current.pressure;
        return Math.max(0, 1 - pressure);
    }

    private calculateRenderScore(renderMetrics?: RenderMetricsData): number {
        if (!renderMetrics?.statistics?.averageDuration) return 1.0;
        const renderTime = renderMetrics.statistics.averageDuration;
        if (renderTime <= this.analysisThresholds.frameTime.excellent) return 1.0;
        if (renderTime <= this.analysisThresholds.frameTime.good) return 0.8;
        if (renderTime <= this.analysisThresholds.frameTime.warning) return 0.6;
        return 0.4;
    }

    private calculateNetworkScore(networkMetrics?: NetworkMetricsData): number {
        if (!networkMetrics?.summary?.averageDuration) return 1.0;
        const avgDuration = networkMetrics.summary.averageDuration;
        return Math.max(0, 1 - (avgDuration / 2000)); // Normalize to 2s max
    }

    private calculateInteractionScore(interactionMetrics?: InteractionMetricsData): number {
        if (!interactionMetrics?.summary?.averageResponseTime) return 1.0;
        const responseTime = interactionMetrics.summary.averageResponseTime;
        if (responseTime <= this.analysisThresholds.responseTime.excellent) return 1.0;
        if (responseTime <= this.analysisThresholds.responseTime.good) return 0.8;
        if (responseTime <= this.analysisThresholds.responseTime.warning) return 0.6;
        return 0.4;
    }

    private scoreToGrade(score: number): string {
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

    private determineHealthStatus(score: number): string {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'warning';
        return 'critical';
    }

    private calculateFrameStability(frameMetrics: FrameMetricsData): number {
        const history = frameMetrics.history || [];
        if (history.length < 2) return 1.0;

        const frameTimes = history.map(f => f.frameTime);
        const average = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const variance = frameTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / frameTimes.length;
        const standardDeviation = Math.sqrt(variance);

        return Math.max(0, 1 - (standardDeviation / average));
    }

    private assessFramePerformance(avgFPS: number, jankPercentage: number): string {
        if (avgFPS >= 55 && jankPercentage < 5) return 'excellent';
        if (avgFPS >= 45 && jankPercentage < 10) return 'good';
        if (avgFPS >= 30 && jankPercentage < 20) return 'acceptable';
        return 'poor';
    }

    private analyzeFrameTrends(history?: FrameMetric[]): string {
        if (!history || history.length < 3) return 'insufficient_data';

        const recentFPS = history.slice(-3).map(f => f.fps);
        const trend = recentFPS[2] - recentFPS[0];

        if (trend > 5) return 'improving';
        if (trend < -5) return 'declining';
        return 'stable';
    }

    private assessMemoryLeakRisk(growthRate: number, gcFrequency: number): string {
        if (growthRate > 1000 && gcFrequency < 2) return 'high';
        if (growthRate > 500) return 'medium';
        return 'low';
    }

    private generateMemoryRecommendations(current: any, trends: any, gc: any): string[] {
        const recommendations: string[] = [];

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

    private calculateRenderEfficiency(stats: any): number {
        const { averageDuration, maxDuration, minDuration } = stats;
        if (!averageDuration) return 1.0;

        const consistency = minDuration > 0 ? minDuration / maxDuration : 0;
        const performance = Math.max(0, 1 - (averageDuration / 50)); // 50ms as baseline

        return (consistency + performance) / 2;
    }

    private identifyRenderBottlenecks(renderMetrics: RenderMetricsData): string[] {
        const bottlenecks: string[] = [];
        const stats = renderMetrics.statistics || {};

        if (stats.averageDuration > 30) {
            bottlenecks.push('Long average render time');
        }
        if (stats.maxDuration > 100) {
            bottlenecks.push('Render spikes detected');
        }

        return bottlenecks;
    }

    private calculateNetworkEfficiency(timing: any): number {
        const { averageDNS, averageTCP, averageRequest, averageResponse } = timing;
        const total = averageDNS + averageTCP + averageRequest + averageResponse;
        
        if (total === 0) return 1.0;
        
        // Good efficiency if response time is majority of total time
        return averageResponse / total;
    }

    private identifyNetworkBottlenecks(timing: any): string[] {
        const bottlenecks: string[] = [];

        if (timing.averageDNS > 100) bottlenecks.push('Slow DNS resolution');
        if (timing.averageTCP > 200) bottlenecks.push('Slow connection establishment');
        if (timing.averageRequest > 500) bottlenecks.push('Slow request processing');
        if (timing.averageResponse > 1000) bottlenecks.push('Slow server response');

        return bottlenecks;
    }

    private assessResponsiveness(averageResponseTime: number): string {
        if (averageResponseTime <= 16) return 'excellent';
        if (averageResponseTime <= 50) return 'good';
        if (averageResponseTime <= 100) return 'acceptable';
        return 'poor';
    }

    private assessResourceHealth(current: any, trends: any): ResourceHealthAssessment {
        const issues: string[] = [];

        if (current.dom?.nodes > 5000) issues.push('High DOM complexity');
        if (trends.domGrowth > 100) issues.push('DOM growing rapidly');
        if (current.storage?.localStorage?.used > 5000000) issues.push('High storage usage');

        return {
            status: issues.length === 0 ? 'good' : issues.length < 2 ? 'warning' : 'critical',
            issues
        };
    }

    private calculateTrend(recentData: CustomMetric[]): string {
        if (!recentData || recentData.length < 2) return 'stable';

        const values = recentData.map(d => d.value);
        const first = values[0];
        const last = values[values.length - 1];
        const change = (last - first) / first;

        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    private calculateVariability(recentData: CustomMetric[]): number {
        if (!recentData || recentData.length < 2) return 0;

        const values = recentData.map(d => d.value);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length;

        return Math.sqrt(variance) / average; // Coefficient of variation
    }

    private assessCustomMetric(metric: any): string {
        const variability = this.calculateVariability(metric.recent);
        
        if (variability > 0.5) return 'high_variability';
        if (variability > 0.2) return 'moderate_variability';
        return 'stable';
    }

    private recordAnalysis(analysis: PerformanceAnalysis): void {
        this.analysisHistory.push(analysis);

        if (this.analysisHistory.length > this.maxHistorySize) {
            this.analysisHistory.shift();
        }
    }

    getAnalysisHistory(): PerformanceAnalysis[] {
        return [...this.analysisHistory];
    }

    getLatestAnalysis(): PerformanceAnalysis | null {
        return this.analysisHistory[this.analysisHistory.length - 1] || null;
    }
}

/**
 * Performance Reporter
 * パフォーマンスレポーター - レポート生成とエクスポート
 */
export class PerformanceReporter {
    private reportTemplates: Map<string, ReportTemplate>;

    constructor() {
        this.reportTemplates = new Map();
        this.setupDefaultTemplates();
    }

    async initialize(): Promise<void> {
        console.log('Performance Reporter initialized');
    }

    private setupDefaultTemplates(): void {
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

    generateReport(analysisData: PerformanceAnalysis, templateName: string = 'summary', options: Record<string, any> = {}): string {
        const template = this.reportTemplates.get(templateName);
        if (!template) {
            throw new Error(`Unknown report template: ${templateName}`);
        }

        const reportData: ReportData = {
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

    private generateTextReport(data: ReportData, sections: string[]): string {
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

    private generateJSONReport(data: ReportData, sections: string[]): string {
        const filteredData: Record<string, any> = { metadata: data.metadata };
        
        sections.forEach(section => {
            if (data[section]) {
                filteredData[section] = data[section];
            }
        });

        return JSON.stringify(filteredData, null, 2);
    }

    private generateHTMLReport(data: ReportData, sections: string[]): string {
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

    private generateOverallSection(overall?: OverallAnalysis): string {
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

    private generateBottlenecksSection(bottlenecks?: PerformanceBottleneck[]): string {
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

    private generateRecommendationsSection(recommendations?: PerformanceRecommendation[]): string {
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

    private generateFrameSection(frame?: FrameAnalysis): string {
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

    private generateMemorySection(memory?: MemoryAnalysis): string {
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

    private generateOverallSectionHTML(overall?: OverallAnalysis): string {
        if (!overall) return '';

        const statusClass = overall.healthStatus === 'excellent' ? 'good' : 
                          overall.healthStatus === 'critical' ? 'critical' : 'warning';

        return `<div class="section">
    <h2>Overall Performance</h2>
    <div class="metric">Score: ${overall.score.toFixed(2)}/1.00 (Grade: ${overall.grade})</div>
    <div class="metric ${statusClass}">Health Status: ${overall.healthStatus.toUpperCase()}</div>
</div>`;
    }

    exportReport(reportContent: string, format: string, filename?: string): ExportResult {
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

    getAvailableTemplates(): string[] {
        return Array.from(this.reportTemplates.keys());
    }

    addCustomTemplate(name: string, template: ReportTemplate): void {
        this.reportTemplates.set(name, template);
    }
}

/**
 * Performance Dashboard
 * パフォーマンスダッシュボード - リアルタイム表示
 */
export class PerformanceDashboard {
    private dashboardElement: HTMLElement | null;
    private updateInterval: NodeJS.Timeout | null;
    private isVisible: boolean;

    constructor() {
        this.dashboardElement = null;
        this.updateInterval = null;
        this.isVisible = false;
    }

    async initialize(): Promise<void> {
        this.createDashboardElement();
        console.log('Performance Dashboard initialized');
    }

    private createDashboardElement(): void {
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

    show(): void {
        if (this.dashboardElement) {
            this.dashboardElement.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide(): void {
        if (this.dashboardElement) {
            this.dashboardElement.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateDisplay(analysisData: PerformanceAnalysis): void {
        if (!this.dashboardElement || !this.isVisible) return;

        const overall = analysisData.overall || {} as OverallAnalysis;
        const frame = analysisData.frame || {} as FrameAnalysis;
        const memory = analysisData.memory || {} as MemoryAnalysis;

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

    private getStatusColor(status: string): string {
        switch (status) {
            case 'excellent': return '#00ff00';
            case 'good': return '#88ff88';
            case 'warning': return '#ffaa00';
            case 'critical': return '#ff0000';
            default: return '#ffffff';
        }
    }

    startAutoUpdate(analysisCallback: () => PerformanceAnalysis | null, interval: number = 1000): void {
        this.updateInterval = setInterval(() => {
            if (this.isVisible && analysisCallback) {
                const analysisData = analysisCallback();
                if (analysisData) {
                    this.updateDisplay(analysisData);
                }
            }
        }, interval);
    }

    stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    destroy(): void {
        this.stopAutoUpdate();
        if (this.dashboardElement && this.dashboardElement.parentNode) {
            this.dashboardElement.parentNode.removeChild(this.dashboardElement);
        }
    }
}