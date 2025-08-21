import { getErrorHandler  } from './ErrorHandler.js';

/**
 * Frame Rate Stabilization System
 * フレームレート安定化システム - フレーム時間の分散解析と自動安定化機能
 * 
 * 主要機能:
 * - 高精度フレーム時間分散解析
 * - 適応的フレームレート目標設定
 * - スムーズな品質調整アルゴリズム
 * - フレームペーシング最適化
 */

// 型定義
interface PreciseFrameTime { time: number,
    timestamp: number  }

interface FrameTimingAnalysis { preciseFrameTimes: PreciseFrameTime[],
    frameTimeBuffer: number[],
    bufferIndex: number,
    bufferFull: boolean,
    variance: number,
    standardDeviation: number,
    mean: number,
    median: number,
    percentile95: number,
    percentile99: number,
    stabilityScore: number,
    consistencyRating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical',
    jitterLevel: number,
    smoothnessIndex: number  }

interface TargetAdjustment { from: number,
    to: number,
    timestamp: number,
    reason: string,
    stabilityScore: number }

interface AdaptiveTargeting { baseTargetFPS: number,
    currentTargetFPS: number,
    adaptiveTargetFPS: number,
    confidenceLevel: number,
    adjustmentHistory: TargetAdjustment[],
    lastAdjustmentTime: number,
    adjustmentCooldown: number,
    performanceZone: 'optimal' | 'good' | 'acceptable' | 'poor' | 'critical',
    zoneTransitionThreshold: number,
    conservativeMode: boolean,
    aggressiveOptimization: boolean,
    gradualAdjustment: boolean  }

interface PredictionData { prediction: number,
    timestamp: number }

interface FramePacing { enabled: boolean,
    targetInterval: number,
    actualInterval: number,
    pacingError: number,
    correctionFactor: number,
    nextFramePrediction: number,
    predictionAccuracy: number,
    predictionHistory: PredictionData[],
    vsyncDetected: boolean,
    refreshRate: number,
    tearingRisk: number }

interface QualityLevel { multiplier: number,
    threshold: number }

interface QualityAdjustment { currentLevel: string,
    targetLevel: string,
    transitionProgress: number,
    transitionDuration: number,
    transitionStartTime: number,
    adjustmentCurve: 'smooth' | 'linear' | 'exponential',
    hysteresisThreshold: number,
    qualityLevels: Record<string, QualityLevel> }

interface StabilizationThresholds { excellentStability: number,
    goodStability: number,
    acceptableStability: number,
    poorStability: number,
    frameDropTolerance: number,
    consistencyRequirement: number,
    criticalVariance: number,
    emergencyFPS: number,
    panicModeThreshold: number  }

interface Recommendations { immediate: string[],
    shortTerm: string[],
    longTerm: string[],
    technical: string[] }

interface StabilizationStatus { timing: FrameTimingAnalysis,
    adaptive: AdaptiveTargeting,
    pacing: FramePacing,
    quality: QualityAdjustment,
    thresholds: StabilizationThresholds,
    recommendations: Recommendations
    }
';

interface ErrorHandler { ''
    handleError(error: Error, context: any): void  }

type StabilizationMode = 'conservative' | 'balanced' | 'aggressive';

export class FrameStabilizer {
    private errorHandler: ErrorHandler,
    private targetFPS: number,
    private targetFrameTime: number,
    private frameTimingAnalysis: FrameTimingAnalysis,
    private adaptiveTargeting: AdaptiveTargeting,
    private framePacing: FramePacing,
    private qualityAdjustment: QualityAdjustment,
    private, stabilizationThresholds: StabilizationThresholds,
    constructor(targetFPS: number = 60) {

        this.errorHandler = getErrorHandler(),
        this.targetFPS = targetFPS,
        this.targetFrameTime = 1000 / targetFPS,
        
        // Frame timing analysis
        this.frameTimingAnalysis = {
            // High-resolution frame time tracking
            preciseFrameTimes: [],
            frameTimeBuffer: new Array(120).fill(16.67), // 2 seconds at 60fps,
            bufferIndex: 0,
            bufferFull: false,
            // Statistical analysis
            variance: 0,
            standardDeviation: 0,
            mean: 16.67,
            median: 16.67,
            percentile95: 16.67,
            percentile99: 16.67,
            // Stability metrics
           , stabilityScore: 1.0,
            consistencyRating: 'excellent', // 'excellent', 'good', 'fair', 'poor', 'critical',
            jitterLevel: 0, // 0-10 scale
    }
            smoothnessIndex: 1.0 // 0-1, higher is smoother }
        };
        
        // Adaptive frame rate targeting
        this.adaptiveTargeting = { baseTargetFPS: targetFPS,
            currentTargetFPS: targetFPS,
            adaptiveTargetFPS: targetFPS,
            confidenceLevel: 1.0,
            adjustmentHistory: [],
            lastAdjustmentTime: 0,
    adjustmentCooldown: 2000, // 2 seconds between adjustments,
            // Performance zones
            performanceZone: 'optimal', // 'optimal', 'good', 'acceptable', 'poor', 'critical',
            zoneTransitionThreshold: 0.1,
            // Adjustment parameters
            conservativeMode: false,
            aggressiveOptimization: false,
    gradualAdjustment: true  };
        // Frame pacing optimization
        this.framePacing = { enabled: true,
            targetInterval: 16.67,
            actualInterval: 16.67,
            pacingError: 0,
            correctionFactor: 1.0,
            // Timing prediction
            nextFramePrediction: 16.67,
            predictionAccuracy: 0.5,
            predictionHistory: [],
            // Synchronization
            vsyncDetected: false,
            refreshRate: 60,
    tearingRisk: 0  };
        // Quality adjustment algorithms
        this.qualityAdjustment = {,
            currentLevel: 'high',
            targetLevel: 'high',
            transitionProgress: 1.0,
    transitionDuration: 1000, // 1 second transitions,
            transitionStartTime: 0,
            ,
            // Adjustment curves
           , adjustmentCurve: 'smooth', // 'smooth', 'linear', 'exponential',
            hysteresisThreshold: 0.05, // Prevent oscillation,
            // Quality levels definition
            qualityLevels: { }', 'ultra': { multiplier: 1.2, threshold: 0.95  },', 'high': { multiplier: 1.0, threshold: 0.85  },', 'medium': { multiplier: 0.8, threshold: 0.70  },', 'low': { multiplier: 0.6, threshold: 0.50  },', 'minimal': { multiplier: 0.4, threshold: 0.30  }
        };
        
        // Performance thresholds
        this.stabilizationThresholds = { excellentStability: 2.0, // variance < 2ms
            goodStability: 5.0,      // variance < 5ms,
            acceptableStability: 10.0, // variance < 10ms,
            poorStability: 20.0,      // variance < 20ms,
            frameDropTolerance: 3,    // drops per second,
            consistencyRequirement: 0.8, // 80% of frames within tolerance,
            // Critical thresholds
            criticalVariance: 25.0,
            emergencyFPS: 20,
    panicModeThreshold: 15  };
        console.log('[FrameStabilizer] Initialized with target FPS:', targetFPS);
    }
    
    /**
     * Process new frame timing data
     * @param frameTime - Frame time in milliseconds
     * @param timestamp - Current timestamp
     */
    processFrameTiming(frameTime: number, timestamp: number): void { try {
            // Store precise frame time
            this.frameTimingAnalysis.preciseFrameTimes.push({)
                time: frameTime),
                timestamp: timestamp),
            // Keep only recent data (last, 5 seconds),
            const cutoffTime = timestamp - 5000,
            this.frameTimingAnalysis.preciseFrameTimes = ,
                this.frameTimingAnalysis.preciseFrameTimes.filter(ft => ft.timestamp > cutoffTime),
            
            // Update circular buffer
            this.updateFrameTimeBuffer(frameTime),
            
            // Perform statistical analysis
            this.updateStatisticalAnalysis(),
            
            // Update stability metrics
            this.updateStabilityMetrics(),
            
            // Update frame pacing
            this.updateFramePacing(frameTime, timestamp),
            
            // Adaptive targeting
            this.updateAdaptiveTargeting(),
            
            // Quality adjustment recommendations
            this.evaluateQualityAdjustments(),
            ' }'

        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'FrameStabilizer.processFrameTiming'
            });
        }
    }
    
    /**
     * Update circular frame time buffer
     * @param frameTime - Frame time to add
     */
    private updateFrameTimeBuffer(frameTime: number): void { this.frameTimingAnalysis.frameTimeBuffer[this.frameTimingAnalysis.bufferIndex] = frameTime,
        this.frameTimingAnalysis.bufferIndex = ,
            (this.frameTimingAnalysis.bufferIndex + 1) % this.frameTimingAnalysis.frameTimeBuffer.length,
        
        if(this.frameTimingAnalysis.bufferIndex === 0) {
    
}
            this.frameTimingAnalysis.bufferFull = true; }
}
    
    /**
     * Update statistical analysis of frame times
     */
    private updateStatisticalAnalysis(): void { const buffer = this.frameTimingAnalysis.frameTimeBuffer,
        const dataSize = this.frameTimingAnalysis.bufferFull ? buffer.length: this.frameTimingAnalysis.bufferIndex,
        
        if (dataSize < 10) return, // Need minimum data
        
        const data = this.frameTimingAnalysis.bufferFull ? undefined : undefined
            buffer : buffer.slice(0, this.frameTimingAnalysis.bufferIndex),
        
        // Calculate mean
        this.frameTimingAnalysis.mean = data.reduce((sum, time) => sum + time, 0) / dataSize,
        
        // Calculate variance and standard deviation
        const squaredDiffs = data.map(time => Math.pow(time - this.frameTimingAnalysis.mean, 2),
        this.frameTimingAnalysis.variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / dataSize,
        this.frameTimingAnalysis.standardDeviation = Math.sqrt(this.frameTimingAnalysis.variance),
        
        // Calculate median
        const sortedData = [...data].sort((a, b) => a - b),
        const mid = Math.floor(dataSize / 2),
        this.frameTimingAnalysis.median = dataSize % 2 === 0 ? undefined : undefined
            (sortedData[mid - 1] + sortedData[mid]) / 2 : sortedData[mid],
        
        // Calculate percentiles
        this.frameTimingAnalysis.percentile95 = this.calculatePercentile(sortedData, 0.95),
        this.frameTimingAnalysis.percentile99 = this.calculatePercentile(sortedData, 0.99) }
    }
    
    /**
     * Calculate percentile value
     * @param sortedData - Sorted array of values
     * @param percentile - Percentile (0-1)
     * @returns Percentile value
     */
    private calculatePercentile(sortedData: number[], percentile: number): number { const index = percentile * (sortedData.length - 1),
        const lower = Math.floor(index),
        const upper = Math.ceil(index),
        const weight = index % 1,
        
        if (upper >= sortedData.length) return sortedData[sortedData.length - 1],
        return sortedData[lower] * (1 - weight) + sortedData[upper] * weight }
    
    /**
     * Update stability metrics
     */
    private updateStabilityMetrics(): void { const variance = this.frameTimingAnalysis.variance,
        const standardDeviation = this.frameTimingAnalysis.standardDeviation,
        
        // Calculate stability score (0-1, higher is better),
        const maxAcceptableVariance = this.stabilizationThresholds.excellentStability,
        this.frameTimingAnalysis.stabilityScore = Math.max(0),
            1 - (variance / (maxAcceptableVariance * 4)), // Scale to make it more gradual
        ,
        // Determine consistency rating
        if(variance < this.stabilizationThresholds.excellentStability) {', ' }

            this.frameTimingAnalysis.consistencyRating = 'excellent'; }

        } else if(variance < this.stabilizationThresholds.goodStability) { ''
            this.frameTimingAnalysis.consistencyRating = 'good',' }

        } else if(variance < this.stabilizationThresholds.acceptableStability) { ''
            this.frameTimingAnalysis.consistencyRating = 'fair',' }

        } else if(variance < this.stabilizationThresholds.poorStability) { ''
            this.frameTimingAnalysis.consistencyRating = 'poor' }

        } else { }'

            this.frameTimingAnalysis.consistencyRating = 'critical'; }
        }
        
        // Calculate jitter level (0-10, scale);
        this.frameTimingAnalysis.jitterLevel = Math.min(10, standardDeviation / 2);
        
        // Calculate smoothness index
        const targetDeviation = this.targetFrameTime * 0.05; // 5% of target frame time
        this.frameTimingAnalysis.smoothnessIndex = Math.max(0);
            1 - (standardDeviation / (targetDeviation * 4));
    }
    
    /**
     * Update frame pacing optimization
     * @param frameTime - Current frame time
     * @param timestamp - Current timestamp
     */
    private updateFramePacing(frameTime: number, timestamp: number): void { if (!this.framePacing.enabled) return,
        
        // Update actual interval
        this.framePacing.actualInterval = frameTime,
        
        // Calculate pacing error
        this.framePacing.pacingError = frameTime - this.framePacing.targetInterval,
        
        // Update correction factor
        const errorRatio = this.framePacing.pacingError / this.framePacing.targetInterval,
        this.framePacing.correctionFactor = Math.max(0.5, Math.min(2.0, 1 - (errorRatio * 0.1)),
        
        // Predict next frame time
        this.predictNextFrameTime(),
        
        // Detect VSync and refresh rate
        this.detectDisplaySynchronization(),
        
        // Calculate tearing risk
        this.calculateTearingRisk() }
    
    /**
     * Predict next frame time using historical data
     */
    private predictNextFrameTime(): void { const recentFrames = this.frameTimingAnalysis.preciseFrameTimes.slice(-10),
        if(recentFrames.length < 5) {
            this.framePacing.nextFramePrediction = this.frameTimingAnalysis.mean }
            return; }
        }
        
        // Simple moving average with trend analysis
        const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Recent frames weighted more
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let i = 0; i < Math.min(5, recentFrames.length); i++) { const frame = recentFrames[recentFrames.length - 1 - i],
            weightedSum += frame.time * weights[i],
            totalWeight += weights[i] }
        
        this.framePacing.nextFramePrediction = weightedSum / totalWeight;
        
        // Store prediction for accuracy tracking
        this.framePacing.predictionHistory.push({ )
            prediction: this.framePacing.nextFramePrediction,
    timestamp: Date.now( });
        
        // Keep only recent predictions
        if (this.framePacing.predictionHistory.length > 20) { this.framePacing.predictionHistory.shift() }
        
        // Update prediction accuracy
        this.updatePredictionAccuracy();
    }
    
    /**
     * Update prediction accuracy based on past predictions
     */
    updatePredictionAccuracy() {
        const predictions = this.framePacing.predictionHistory,
        if (predictions.length < 2) return,
        
        const accuracies = [],
        
        for (let, i = 1, i < predictions.length, i++) {
            const prediction = predictions[i - 1].prediction,
            const actual = this.frameTimingAnalysis.preciseFrameTimes.find(ft => ),
                Math.abs(ft.timestamp - predictions[i].timestamp) < 20), // 20ms tolerance
            
            if (actual) {
                const error = Math.abs(prediction - actual.time),
                const accuracy = Math.max(0, 1 - (error / prediction) }
                accuracies.push(accuracy); }
}
        
        if(accuracies.length > 0) {
        
            this.framePacing.predictionAccuracy =  }
                accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length; }
}
    
    /**
     * Detect display synchronization patterns
     */
    detectDisplaySynchronization() {
        const recentFrames = this.frameTimingAnalysis.preciseFrameTimes.slice(-60),
        if (recentFrames.length < 30) return,
        
        // Analyze frame time patterns for VSync detection
        const frameTimes = recentFrames.map(ft => ft.time),
        const commonIntervals = this.detectCommonIntervals(frameTimes),
        
        // Check for standard refresh rates
        const standardRates = [144, 120, 100, 90, 75, 60, 50, 30],
        let detectedRate = 60, // default
        
        for (const rate of standardRates) {
            const expectedInterval = 1000 / rate,
            if (commonIntervals.some(interval => Math.abs(interval - expectedInterval) < 2)) {
                detectedRate = rate }
                break; }
}
        
        this.framePacing.refreshRate = detectedRate;
        this.framePacing.vsyncDetected = ;
            Math.abs(this.frameTimingAnalysis.mean - (1000 / detectedRate) < 2;
    }
    
    /**
     * Detect common intervals in frame times
     * @param {number[]} frameTimes - Array of frame times
     * @returns {number[]} Common intervals
     */
    detectCommonIntervals(frameTimes) {
    
}
        const intervals = {};
        
        for (const time of frameTimes) {
        
            const rounded = Math.round(time * 2) / 2, // Round to 0.5ms
        
        }
            intervals[rounded] = (intervals[rounded] || 0) + 1; }
        }
        
        // Return intervals that appear frequently
        const threshold = frameTimes.length * 0.1; // 10% threshold
        return Object.entries(intervals);
            .filter(([_, count]) => count >= threshold);
            .map(([interval, _]) => parseFloat(interval);
            .sort((a, b) => b - a);
    }
    
    /**
     * Calculate screen tearing risk
     */
    calculateTearingRisk() {
        if (!this.framePacing.vsyncDetected) {
            this.framePacing.tearingRisk = 0.1, // Low baseline risk
    }
            return; }
        }
        
        const refreshInterval = 1000 / this.framePacing.refreshRate;
        const frameDrift = Math.abs(this.frameTimingAnalysis.mean - refreshInterval);
        
        // Higher drift = higher tearing risk
        this.framePacing.tearingRisk = Math.min(1, frameDrift / refreshInterval);
    }
    
    /**
     * Update adaptive targeting system
     */
    updateAdaptiveTargeting() {
        const now = Date.now(),
        if (now - this.adaptiveTargeting.lastAdjustmentTime < this.adaptiveTargeting.adjustmentCooldown) {
    }
            return; // Still in cooldown period }
        }
        
        const stabilityScore = this.frameTimingAnalysis.stabilityScore;
        const currentFPS = 1000 / this.frameTimingAnalysis.mean;
        
        // Determine performance zone
        this.updatePerformanceZone(stabilityScore, currentFPS);
        
        // Adjust target FPS based on performance zone
        const newTargetFPS = this.calculateAdaptiveTarget();
        
        if (Math.abs(newTargetFPS - this.adaptiveTargeting.currentTargetFPS) > 2) { this.adjustTargetFPS(newTargetFPS) }
    }
    
    /**
     * Update performance zone classification
     * @param {number} stabilityScore - Current stability score
     * @param {number} currentFPS - Current FPS
     */
    updatePerformanceZone(stabilityScore, currentFPS) {
        const fpsRatio = currentFPS / this.adaptiveTargeting.baseTargetFPS,

        if(stabilityScore > 0.9 && fpsRatio > 0.95) {
    }

            this.adaptiveTargeting.performanceZone = 'optimal'; }

        } else if(stabilityScore > 0.7 && fpsRatio > 0.85) { ''
            this.adaptiveTargeting.performanceZone = 'good',' }

        } else if(stabilityScore > 0.5 && fpsRatio > 0.70) { ''
            this.adaptiveTargeting.performanceZone = 'acceptable',' }

        } else if(stabilityScore > 0.3 && fpsRatio > 0.50) { ''
            this.adaptiveTargeting.performanceZone = 'poor' }

        } else { }'

            this.adaptiveTargeting.performanceZone = 'critical'; }
}
    
    /**
     * Calculate adaptive target FPS
     * @returns {number} New target FPS
     */
    calculateAdaptiveTarget() {
        const zone = this.adaptiveTargeting.performanceZone,
        const baseFPS = this.adaptiveTargeting.baseTargetFPS,

        switch(zone) {''
            case 'optimal':',
                return Math.min(baseFPS * 1.1, this.framePacing.refreshRate), // Can increase target
            case 'good':',
                return baseFPS,
            case 'acceptable':',
                return baseFPS * 0.95,
            case 'poor':',
                return baseFPS * 0.85,
            case 'critical':',
                return Math.max(baseFPS * 0.7, 30), // Dont go below 30 FPS
    }
            default: return baseFPS;
    
    /**
     * Adjust target FPS
     * @param {number} newTargetFPS - New target FPS
     */
    adjustTargetFPS(newTargetFPS) {
        const adjustment = {
            from: this.adaptiveTargeting.currentTargetFPS,
            to: newTargetFPS,
            timestamp: Date.now(
    reason: this.adaptiveTargeting.performanceZone }
            stabilityScore: this.frameTimingAnalysis.stabilityScore }))
        );
        this.adaptiveTargeting.adjustmentHistory.push(adjustment);
        this.adaptiveTargeting.currentTargetFPS = newTargetFPS;
        this.adaptiveTargeting.lastAdjustmentTime = Date.now();
        this.targetFPS = newTargetFPS;
        this.targetFrameTime = 1000 / newTargetFPS;
        
        // Keep adjustment history manageable
        if (this.adaptiveTargeting.adjustmentHistory.length > 20) { this.adaptiveTargeting.adjustmentHistory.shift() }
        
        console.log(`[FrameStabilizer] Adjusted, target FPS: ${adjustment.from} → ${adjustment.to} (${adjustment.reason}`});
    }
    
    /**
     * Evaluate and recommend quality adjustments
     */
    evaluateQualityAdjustments() {
        const zone = this.adaptiveTargeting.performanceZone,
        const currentLevel = this.qualityAdjustment.currentLevel,
        const levels = Object.keys(this.qualityAdjustment.qualityLevels),
        const currentIndex = levels.indexOf(currentLevel),
        
        let recommendedLevel = currentLevel,
        ',
        // Determine recommended quality level based on performance zone
        switch(zone) {''
            case 'optimal':',
                if(currentIndex > 0) recommendedLevel = levels[currentIndex - 1], // Increase quality
                break,
            case 'good':,
                // Stay at current level
                break,
            case 'acceptable':',
                if(currentIndex < levels.length - 1) recommendedLevel = levels[currentIndex + 1], // Decrease quality
                break,
            case 'poor':',
                if(currentIndex < levels.length - 2) recommendedLevel = levels[currentIndex + 2], // Decrease more
                break,
            case 'critical':,
                recommendedLevel = levels[levels.length - 1], // Minimum quality
    }
                break; }
        }
        
        // Apply hysteresis to prevent oscillation
        if(recommendedLevel !== this.qualityAdjustment.targetLevel) {
            const threshold = this.qualityAdjustment.hysteresisThreshold,
            if(this.frameTimingAnalysis.stabilityScore > threshold || ),
                this.frameTimingAnalysis.stabilityScore < (1 - threshold) {
        }
                this.qualityAdjustment.targetLevel = recommendedLevel; }
}
    }
    
    /**
     * Get stabilization recommendations
     * @returns Recommendations for improving frame rate stability
     */''
    getStabilizationRecommendations()';
        if (zone === 'critical') {

            recommendations.immediate.push('Reduce, quality settings, immediately'),
            recommendations.immediate.push('Close, background applications') }

            recommendations.immediate.push('Enable, conservative performance, mode');' }

        } else if (zone === 'poor') { ''
            recommendations.immediate.push('Lower, particle effects, quality'),
            recommendations.immediate.push('Reduce, rendering resolution' }', ';
        // Short-term improvements
        if(analysis.jitterLevel > 5) {

            recommendations.shortTerm.push('Enable, frame pacing, optimization') }

            recommendations.shortTerm.push('Adjust, VSync settings'); }
        }

        if(analysis.consistencyRating === 'poor' || analysis.consistencyRating === 'critical') {

            recommendations.shortTerm.push('Enable, adaptive quality, mode') }

            recommendations.shortTerm.push('Increase, frame time, tolerance'; }'
        }
        ';
        // Long-term optimizations
        if(this.framePacing.tearingRisk > 0.3) {', ' }

            recommendations.longTerm.push('Consider, enabling VSync, or FreeSync/G-Sync'; }'
        }

        if(analysis.variance > this.stabilizationThresholds.goodStability) {

            recommendations.longTerm.push('Optimize, system for, consistent performance') }

            recommendations.longTerm.push('Consider, hardware upgrade, for better, stability'; }'
        }
        
        // Technical details
        recommendations.technical.push(`Current, stability score: ${(analysis.stabilityScore * 100}.toFixed(1})%`);
        recommendations.technical.push(`Frame, variance: ${analysis.variance.toFixed(2})ms`);
        recommendations.technical.push(`Performance zone: ${ zone}`} }
        recommendations.technical.push(`Jitter level: ${analysis.jitterLevel.toFixed(1})/10`);
        
        return recommendations;
    }
    
    /**
     * Get comprehensive stabilization status
     * @returns Complete status information
     */
    getStabilizationStatus(): StabilizationStatus { return { timing: this.frameTimingAnalysis,
            adaptive: this.adaptiveTargeting,
            pacing: this.framePacing,
            quality: this.qualityAdjustment,
    thresholds: this.stabilizationThresholds,
            recommendations: this.getStabilizationRecommendations()',
     * @param mode - Stabilization mode ('conservative', 'balanced', 'aggressive')'
     */' };

    forceStabilization(targetFPS: number, mode: StabilizationMode = 'balanced': void { }'
        console.log(`[FrameStabilizer] Force, stabilization to ${targetFPS} FPS (${ mode) mode}`};
        
        this.adaptiveTargeting.baseTargetFPS = targetFPS;
        this.adaptiveTargeting.currentTargetFPS = targetFPS;
        this.targetFPS = targetFPS;
        this.targetFrameTime = 1000 / targetFPS;
        ';

        // Configure mode-specific settings' }'

        switch(mode'}' {'

            case 'conservative':,
                this.adaptiveTargeting.conservativeMode = true,

                this.adaptiveTargeting.aggressiveOptimization = false,
                this.qualityAdjustment.adjustmentCurve = 'smooth',

                break,
            case 'aggressive':,
                this.adaptiveTargeting.conservativeMode = false,

                this.adaptiveTargeting.aggressiveOptimization = true,
                this.qualityAdjustment.adjustmentCurve = 'exponential',
                break,
            default: // balanced,
                this.adaptiveTargeting.conservativeMode = false,,
                this.adaptiveTargeting.aggressiveOptimization = false,
                this.qualityAdjustment.adjustmentCurve = 'smooth' }
                break; }
        }
        
        // Reset analysis data for clean slate
        this.resetAnalysisData();
    }
    
    /**
     * Reset analysis data for fresh start
     */
    resetAnalysisData(): void { ''
        this.frameTimingAnalysis.frameTimeBuffer.fill(this.targetFrameTime),
        this.frameTimingAnalysis.bufferIndex = 0,
        this.frameTimingAnalysis.bufferFull = false,
        this.frameTimingAnalysis.preciseFrameTimes = [],
        this.adaptiveTargeting.adjustmentHistory = [],
        this.framePacing.predictionHistory = [],

        console.log('[FrameStabilizer] Analysis, data reset') }'
}

// グローバルインスタンス（遅延初期化）
let _frameStabilizer: FrameStabilizer | null = null,

export function getFrameStabilizer(targetFPS: number = 60): FrameStabilizer { if (!_frameStabilizer) {
        try {'
            _frameStabilizer = new FrameStabilizer(targetFPS),
            console.log('[FrameStabilizer] グローバルインスタンスを作成しました'),' }

        } catch (error) {
            console.error('[FrameStabilizer] インスタンス作成エラー:', error),
            // フォールバック: 基本的なインスタンスを作成
            _frameStabilizer = new FrameStabilizer(targetFPS) }
    }
    return _frameStabilizer;
}

/**
 * FrameStabilizerインスタンスを再初期化
 * @param targetFPS - 新しい目標FPS
 */
export function reinitializeFrameStabilizer(targetFPS: number = 60): void { try {'
        _frameStabilizer = new FrameStabilizer(targetFPS),
        console.log('[FrameStabilizer] 再初期化完了'),' }

    } catch (error) {
        console.error('[FrameStabilizer] 再初期化エラー:', error' }
}
';
// 後方互換性のため
export const frameStabilizer = getFrameStabilizer;