/**
 * Error Detection System
 * エラー検出システム - パフォーマンスエラーの検出、分類、監視
 */

/**
 * Performance Error Detector
 * パフォーマンスエラー検出器 - 各種パフォーマンス問題の検出
 */
export class PerformanceErrorDetector {
    constructor() {
        this.detectors = new Map();
        this.monitoringEnabled = true;
        this.detectionThresholds = {
            frameRate: { critical: 15, warning: 30, target: 60 },
            memory: { critical: 0.9, warning: 0.8, target: 0.5 },
            rendering: { critical: 50, warning: 30, target: 16.67 },
            network: { critical: 10000, warning: 5000, target: 1000 },
            javascript: { critical: 100, warning: 50, target: 10 },
            resource: { critical: 20000, warning: 10000, target: 2000 }
        };
        this.errorCallbacks = [];
        this.monitoringInterval = null;
        this.performanceBaseline = null;
    }

    async initialize() {
        console.log('Initializing Performance Error Detector...');
        
        this.detectors.set('frameRate', new FrameRateErrorDetector(this.detectionThresholds.frameRate));
        this.detectors.set('memory', new MemoryErrorDetector(this.detectionThresholds.memory));
        this.detectors.set('rendering', new RenderingErrorDetector(this.detectionThresholds.rendering));
        this.detectors.set('network', new NetworkErrorDetector(this.detectionThresholds.network));
        this.detectors.set('javascript', new JavaScriptErrorDetector(this.detectionThresholds.javascript));
        this.detectors.set('resource', new ResourceErrorDetector(this.detectionThresholds.resource));

        for (const [name, detector] of this.detectors) {
            await detector.initialize();
            detector.onError((error) => this.handleDetectedError(name, error));
        }

        await this.establishPerformanceBaseline();
        this.startMonitoring();
        
        console.log('Performance Error Detector initialized successfully');
    }

    async establishPerformanceBaseline() {
        console.log('Establishing performance baseline...');
        
        const measurements = [];
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            await this.performBenchmarkTask();
            const duration = performance.now() - start;
            measurements.push(duration);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.performanceBaseline = {
            averageTaskTime: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            minTaskTime: Math.min(...measurements),
            maxTaskTime: Math.max(...measurements),
            standardDeviation: this.calculateStandardDeviation(measurements),
            timestamp: Date.now()
        };

        console.log('Performance baseline established:', this.performanceBaseline);
    }

    async performBenchmarkTask() {
        // Simple benchmark task for baseline measurement
        const iterations = 1000;
        let sum = 0;
        for (let i = 0; i < iterations; i++) {
            sum += Math.sqrt(i) * Math.random();
        }
        return sum;
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        const variance = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }

    startMonitoring() {
        if (!this.monitoringEnabled || this.monitoringInterval) return;

        this.monitoringInterval = setInterval(() => {
            this.performDetectionCycle();
        }, 1000); // Check every second

        console.log('Performance monitoring started');
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('Performance monitoring stopped');
    }

    async performDetectionCycle() {
        for (const [name, detector] of this.detectors) {
            try {
                await detector.detect();
            } catch (error) {
                console.error(`Detection failed for ${name}:`, error);
            }
        }
    }

    handleDetectedError(detectorName, error) {
        const enrichedError = {
            ...error,
            detector: detectorName,
            timestamp: Date.now(),
            baseline: this.performanceBaseline
        };

        console.warn(`Performance error detected by ${detectorName}:`, enrichedError);
        
        this.errorCallbacks.forEach(callback => {
            try {
                callback(enrichedError);
            } catch (err) {
                console.error('Error callback failed:', err);
            }
        });
    }

    onErrorDetected(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        Object.assign(this.detectionThresholds, newThresholds);
        
        for (const [name, detector] of this.detectors) {
            if (this.detectionThresholds[name]) {
                detector.updateThresholds(this.detectionThresholds[name]);
            }
        }
    }

    getDetectionStatus() {
        const status = {
            monitoring: this.monitoringEnabled,
            baseline: this.performanceBaseline,
            detectors: {}
        };

        for (const [name, detector] of this.detectors) {
            status.detectors[name] = detector.getStatus();
        }

        return status;
    }
}

/**
 * Performance Error Classifier
 * パフォーマンスエラー分類器 - エラーの分類と優先度設定
 */
export class PerformanceErrorClassifier {
    constructor() {
        this.classificationRules = new Map();
        this.severityCalculator = new ErrorSeverityCalculator();
        this.patternAnalyzer = new ErrorPatternAnalyzer();
        this.initialized = false;
    }

    async initialize() {
        console.log('Initializing Performance Error Classifier...');
        
        this.setupClassificationRules();
        await this.severityCalculator.initialize();
        await this.patternAnalyzer.initialize();
        
        this.initialized = true;
        console.log('Performance Error Classifier initialized successfully');
    }

    setupClassificationRules() {
        // Frame rate related errors
        this.classificationRules.set('frameRate', {
            category: 'performance',
            subcategory: 'rendering',
            priority: 'high',
            recoverable: true,
            degradationOptions: ['quality', 'effects', 'resolution']
        });

        // Memory related errors
        this.classificationRules.set('memory', {
            category: 'resource',
            subcategory: 'memory',
            priority: 'critical',
            recoverable: true,
            degradationOptions: ['cleanup', 'cache', 'objects']
        });

        // Rendering related errors
        this.classificationRules.set('rendering', {
            category: 'performance',
            subcategory: 'graphics',
            priority: 'high',
            recoverable: true,
            degradationOptions: ['quality', 'effects', 'particles']
        });

        // Network related errors
        this.classificationRules.set('network', {
            category: 'connectivity',
            subcategory: 'network',
            priority: 'medium',
            recoverable: false,
            degradationOptions: ['offline', 'retry', 'cache']
        });

        // JavaScript errors
        this.classificationRules.set('javascript', {
            category: 'code',
            subcategory: 'execution',
            priority: 'critical',
            recoverable: false,
            degradationOptions: ['fallback', 'disable']
        });

        // Resource loading errors
        this.classificationRules.set('resource', {
            category: 'resource',
            subcategory: 'loading',
            priority: 'medium',
            recoverable: true,
            degradationOptions: ['retry', 'fallback', 'cache']
        });
    }

    async classify(detectedError) {
        if (!this.initialized) {
            throw new Error('Classifier not initialized');
        }

        const baseClassification = this.classificationRules.get(detectedError.detector) || {
            category: 'unknown',
            subcategory: 'unclassified',
            priority: 'low',
            recoverable: false,
            degradationOptions: []
        };

        // Calculate severity
        const severity = await this.severityCalculator.calculate(detectedError);
        
        // Analyze patterns
        const patterns = await this.patternAnalyzer.analyze(detectedError);
        
        // Create classified error
        const classifiedError = {
            ...detectedError,
            classification: {
                ...baseClassification,
                severity,
                patterns,
                classifiedAt: Date.now(),
                confidence: this.calculateClassificationConfidence(detectedError, patterns)
            }
        };

        console.log('Error classified:', classifiedError);
        return classifiedError;
    }

    calculateClassificationConfidence(error, patterns) {
        let confidence = 0.5; // Base confidence

        // Increase confidence based on clear error indicators
        if (error.metrics && Object.keys(error.metrics).length > 0) {
            confidence += 0.2;
        }

        // Increase confidence based on pattern recognition
        if (patterns.recognized) {
            confidence += 0.2;
        }

        // Increase confidence based on baseline comparison
        if (error.baseline) {
            confidence += 0.1;
        }

        return Math.min(1.0, confidence);
    }

    getClassificationRules() {
        return new Map(this.classificationRules);
    }

    updateClassificationRule(detector, rule) {
        this.classificationRules.set(detector, rule);
    }
}

/**
 * Error Severity Calculator
 * エラー重要度計算器 - エラーの重要度を数値化
 */
class ErrorSeverityCalculator {
    constructor() {
        this.severityWeights = {
            impact: 0.4,
            frequency: 0.3,
            userExperience: 0.2,
            recoverability: 0.1
        };
    }

    async initialize() {
        console.log('Error Severity Calculator initialized');
    }

    async calculate(error) {
        const impact = this.calculateImpact(error);
        const frequency = this.calculateFrequency(error);
        const userExperience = this.calculateUserExperienceImpact(error);
        const recoverability = this.calculateRecoverability(error);

        const weightedScore = 
            impact * this.severityWeights.impact +
            frequency * this.severityWeights.frequency +
            userExperience * this.severityWeights.userExperience +
            recoverability * this.severityWeights.recoverability;

        return {
            score: weightedScore,
            level: this.scoresToLevel(weightedScore),
            components: { impact, frequency, userExperience, recoverability }
        };
    }

    calculateImpact(error) {
        // Calculate impact based on error type and metrics
        if (error.detector === 'memory' && error.metrics?.usage > 0.9) return 1.0;
        if (error.detector === 'frameRate' && error.metrics?.fps < 15) return 0.9;
        if (error.detector === 'javascript') return 0.8;
        if (error.detector === 'rendering' && error.metrics?.renderTime > 50) return 0.7;
        return 0.5;
    }

    calculateFrequency(error) {
        // Simplified frequency calculation
        const now = Date.now();
        const timeSinceLastError = now - (error.lastOccurrence || 0);
        
        if (timeSinceLastError < 1000) return 1.0; // Very frequent
        if (timeSinceLastError < 5000) return 0.7; // Frequent
        if (timeSinceLastError < 30000) return 0.4; // Occasional
        return 0.2; // Rare
    }

    calculateUserExperienceImpact(error) {
        // Calculate user experience impact
        switch (error.detector) {
            case 'frameRate': return 0.9; // Direct visual impact
            case 'rendering': return 0.8; // Visual quality impact
            case 'memory': return 0.6; // Indirect impact
            case 'network': return 0.7; // Feature availability impact
            case 'javascript': return 0.5; // Functionality impact
            case 'resource': return 0.4; // Content availability impact
            default: return 0.3;
        }
    }

    calculateRecoverability(error) {
        // Higher score means harder to recover (worse)
        switch (error.detector) {
            case 'javascript': return 0.9; // Hard to recover
            case 'memory': return 0.7; // Moderate recovery difficulty
            case 'network': return 0.6; // Depends on connectivity
            case 'frameRate': return 0.4; // Usually recoverable
            case 'rendering': return 0.3; // Usually recoverable
            case 'resource': return 0.2; // Often recoverable
            default: return 0.5;
        }
    }

    scoresToLevel(score) {
        if (score >= 0.8) return 'critical';
        if (score >= 0.6) return 'high';
        if (score >= 0.4) return 'medium';
        return 'low';
    }
}

/**
 * Error Pattern Analyzer
 * エラーパターン分析器 - エラーのパターンと傾向を分析
 */
class ErrorPatternAnalyzer {
    constructor() {
        this.errorHistory = [];
        this.patterns = new Map();
        this.maxHistorySize = 100;
    }

    async initialize() {
        console.log('Error Pattern Analyzer initialized');
    }

    async analyze(error) {
        this.addToHistory(error);
        
        const patterns = {
            recognized: false,
            type: 'unknown',
            confidence: 0,
            trend: this.analyzeTrend(),
            clustering: this.analyzeClustering(),
            correlation: this.analyzeCorrelation(error)
        };

        // Simple pattern recognition
        if (this.errorHistory.length >= 3) {
            const recentErrors = this.errorHistory.slice(-3);
            const sameDetector = recentErrors.every(e => e.detector === error.detector);
            
            if (sameDetector) {
                patterns.recognized = true;
                patterns.type = 'recurring';
                patterns.confidence = 0.8;
            }
        }

        return patterns;
    }

    addToHistory(error) {
        this.errorHistory.push({
            detector: error.detector,
            timestamp: error.timestamp,
            severity: error.classification?.severity?.level || 'unknown'
        });

        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }

    analyzeTrend() {
        if (this.errorHistory.length < 5) return 'insufficient_data';
        
        const recent = this.errorHistory.slice(-5);
        const timestamps = recent.map(e => e.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (avgInterval < 5000) return 'increasing';
        if (avgInterval > 30000) return 'decreasing';
        return 'stable';
    }

    analyzeClustering() {
        if (this.errorHistory.length < 5) return { clustered: false };
        
        const detectorCounts = {};
        this.errorHistory.forEach(error => {
            detectorCounts[error.detector] = (detectorCounts[error.detector] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(detectorCounts));
        const totalCount = this.errorHistory.length;
        
        return {
            clustered: maxCount / totalCount > 0.6,
            dominantDetector: Object.keys(detectorCounts).find(key => detectorCounts[key] === maxCount)
        };
    }

    analyzeCorrelation(error) {
        const timeWindow = 10000; // 10 seconds
        const recentErrors = this.errorHistory.filter(
            e => error.timestamp - e.timestamp < timeWindow
        );
        
        const correlatedDetectors = new Set(
            recentErrors.map(e => e.detector).filter(d => d !== error.detector)
        );
        
        return {
            hasCorrelation: correlatedDetectors.size > 0,
            correlatedWith: Array.from(correlatedDetectors)
        };
    }
}

// Specific Error Detectors
export class FrameRateErrorDetector {
    constructor(thresholds) {
        this.thresholds = thresholds;
        this.frameHistory = [];
        this.errorCallbacks = [];
        this.lastFrameTime = performance.now();
    }

    async initialize() {
        console.log('Frame Rate Error Detector initialized');
    }

    async detect() {
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;
        const fps = 1000 / frameTime;
        
        this.frameHistory.push({ fps, timestamp: currentTime });
        if (this.frameHistory.length > 60) {
            this.frameHistory.shift();
        }
        
        this.lastFrameTime = currentTime;
        
        if (fps < this.thresholds.critical) {
            this.triggerError('critical', fps, frameTime);
        } else if (fps < this.thresholds.warning) {
            this.triggerError('warning', fps, frameTime);
        }
    }

    triggerError(level, fps, frameTime) {
        const error = {
            type: 'frame_rate',
            level,
            metrics: { fps, frameTime },
            timestamp: Date.now()
        };
        
        this.errorCallbacks.forEach(callback => callback(error));
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        this.thresholds = newThresholds;
    }

    getStatus() {
        const recentFrames = this.frameHistory.slice(-10);
        const avgFps = recentFrames.length > 0 ? 
            recentFrames.reduce((sum, frame) => sum + frame.fps, 0) / recentFrames.length : 0;
            
        return {
            enabled: true,
            averageFps: avgFps,
            thresholds: this.thresholds,
            historySize: this.frameHistory.length
        };
    }
}

export class MemoryErrorDetector {
    constructor(thresholds) {
        this.thresholds = thresholds;
        this.errorCallbacks = [];
        this.lastCheck = Date.now();
    }

    async initialize() {
        console.log('Memory Error Detector initialized');
    }

    async detect() {
        if (!performance.memory) return;
        
        const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        
        if (usage > this.thresholds.critical) {
            this.triggerError('critical', usage);
        } else if (usage > this.thresholds.warning) {
            this.triggerError('warning', usage);
        }
        
        this.lastCheck = Date.now();
    }

    triggerError(level, usage) {
        const error = {
            type: 'memory',
            level,
            metrics: { 
                usage,
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.jsHeapSizeLimit
            },
            timestamp: Date.now()
        };
        
        this.errorCallbacks.forEach(callback => callback(error));
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        this.thresholds = newThresholds;
    }

    getStatus() {
        const currentUsage = performance.memory ? 
            performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit : 0;
            
        return {
            enabled: true,
            currentUsage,
            thresholds: this.thresholds,
            lastCheck: this.lastCheck
        };
    }
}

// Additional simplified detector classes
export class RenderingErrorDetector {
    constructor(thresholds) {
        this.thresholds = thresholds;
        this.errorCallbacks = [];
    }

    async initialize() {
        console.log('Rendering Error Detector initialized');
    }

    async detect() {
        // Simplified rendering error detection
        // In real implementation, this would measure actual render times
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        this.thresholds = newThresholds;
    }

    getStatus() {
        return { enabled: true, thresholds: this.thresholds };
    }
}

export class NetworkErrorDetector {
    constructor(thresholds) {
        this.thresholds = thresholds;
        this.errorCallbacks = [];
    }

    async initialize() {
        console.log('Network Error Detector initialized');
    }

    async detect() {
        // Simplified network error detection
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        this.thresholds = newThresholds;
    }

    getStatus() {
        return { enabled: true, thresholds: this.thresholds };
    }
}

export class JavaScriptErrorDetector {
    constructor(thresholds) {
        this.thresholds = thresholds;
        this.errorCallbacks = [];
    }

    async initialize() {
        console.log('JavaScript Error Detector initialized');
    }

    async detect() {
        // Simplified JavaScript error detection
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        this.thresholds = newThresholds;
    }

    getStatus() {
        return { enabled: true, thresholds: this.thresholds };
    }
}

export class ResourceErrorDetector {
    constructor(thresholds) {
        this.thresholds = thresholds;
        this.errorCallbacks = [];
    }

    async initialize() {
        console.log('Resource Error Detector initialized');
    }

    async detect() {
        // Simplified resource error detection
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    updateThresholds(newThresholds) {
        this.thresholds = newThresholds;
    }

    getStatus() {
        return { enabled: true, thresholds: this.thresholds };
    }
}