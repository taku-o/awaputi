/**
 * Memory Usage Pattern Analyzer
 * メモリ使用パターン解析システム - 使用パターンの分析とトレンド予測
 */
export class MemoryUsageAnalyzer {
    constructor(config = {}) {
        // Configuration
        this.enabled = config.enabled !== undefined ? config.enabled : true;
        this.analysisInterval = config.analysisInterval || 5000; // 5 seconds
        this.historySize = config.historySize || 200; // Keep 200 data points
        
        // Usage tracking
        this.usageHistory = [];
        this.currentUsage = {
            used: 0,
            total: 0,
            pressure: 0,
            timestamp: Date.now()
        };
        
        // Pattern analysis
        this.patterns = {
            growthRate: 0,
            peakUsage: 0,
            averageUsage: 0,
            volatility: 0,
            trendDirection: 'stable', // 'growing', 'shrinking', 'stable'
            lastTrendAnalysis: 0,
            cycleDetected: false,
            cycleLength: 0
        };
        
        // Trend detection
        this.trendAnalysis = {
            shortTerm: { samples: 10, trend: 'stable', confidence: 0 },
            mediumTerm: { samples: 30, trend: 'stable', confidence: 0 },
            longTerm: { samples: 60, trend: 'stable', confidence: 0 }
        };
        
        // Performance prediction
        this.predictions = {
            nextPeak: 0,
            timeToLimit: Infinity,
            recommendedAction: 'none',
            confidence: 0
        };
        
        // Statistics
        this.stats = {
            analysisCount: 0,
            trendsDetected: new Map(),
            predictionsCorrect: 0,
            predictionsFailed: 0,
            averageAccuracy: 0
        };
        
        // Start continuous analysis
        this.lastAnalysis = 0;
        this._startContinuousAnalysis();
    }
    
    /**
     * Record memory usage sample
     * @param {number} used - Used memory in bytes
     * @param {number} total - Total memory limit in bytes
     * @param {object} metadata - Additional metadata
     */
    recordUsage(used, total, metadata = {}) {
        if (!this.enabled) return;
        
        const timestamp = Date.now();
        const pressure = total > 0 ? used / total : 0;
        
        const sample = {
            used,
            total,
            pressure,
            timestamp,
            metadata
        };
        
        this.usageHistory.push(sample);
        this.currentUsage = sample;
        
        // Maintain history size
        if (this.usageHistory.length > this.historySize) {
            this.usageHistory.shift();
        }
        
        // Update patterns immediately for critical situations
        if (pressure > 0.9) {
            this._updatePatterns();
        }
    }
    
    /**
     * Perform comprehensive usage analysis
     * @returns {object} Analysis results
     */
    performAnalysis() {
        if (!this.enabled || this.usageHistory.length < 5) {
            return { analysis: 'insufficient_data' };
        }
        
        const now = Date.now();
        this.lastAnalysis = now;
        this.stats.analysisCount++;
        
        try {
            // Update all patterns
            this._updatePatterns();
            
            // Perform trend analysis
            const trends = this._analyzeTrends();
            
            // Detect cycles
            const cycles = this._detectCycles();
            
            // Generate predictions
            const predictions = this._generatePredictions();
            
            // Calculate risk assessment
            const risk = this._assessRisk();
            
            const analysis = {
                timestamp: now,
                currentUsage: { ...this.currentUsage },
                patterns: { ...this.patterns },
                trends,
                cycles,
                predictions,
                risk,
                recommendations: this._generateRecommendations(risk)
            };
            
            return analysis;
            
        } catch (error) {
            console.error('[MemoryUsageAnalyzer] Analysis failed:', error);
            return { analysis: 'error', error: error.message };
        }
    }
    
    /**
     * Get current usage patterns
     * @returns {object} Current patterns
     */
    getCurrentPatterns() {
        return { ...this.patterns };
    }
    
    /**
     * Get usage trend for specified timeframe
     * @param {number} timeframe - Timeframe in milliseconds
     * @returns {object} Trend analysis
     */
    getTrend(timeframe = 300000) { // 5 minutes default
        const now = Date.now();
        const relevantSamples = this.usageHistory.filter(
            sample => now - sample.timestamp <= timeframe
        );
        
        if (relevantSamples.length < 2) {
            return { trend: 'unknown', confidence: 0 };
        }
        
        const first = relevantSamples[0];
        const last = relevantSamples[relevantSamples.length - 1];
        
        const change = last.pressure - first.pressure;
        const timeSpan = last.timestamp - first.timestamp;
        const rate = change / (timeSpan / 1000); // Change per second
        
        let trend = 'stable';
        if (Math.abs(rate) > 0.001) { // Significant change threshold
            trend = rate > 0 ? 'growing' : 'shrinking';
        }
        
        // Calculate confidence based on sample size and consistency
        const confidence = Math.min(1.0, relevantSamples.length / 20);
        
        return { trend, rate, confidence, samples: relevantSamples.length };
    }
    
    /**
     * Predict future memory usage
     * @param {number} futureTime - Time in the future (milliseconds)
     * @returns {object} Prediction
     */
    predictUsage(futureTime = 60000) { // 1 minute default
        if (this.usageHistory.length < 10) {
            return { prediction: 'insufficient_data' };
        }
        
        const trend = this.getTrend();
        const currentPressure = this.currentUsage.pressure;
        
        // Simple linear prediction based on current trend
        const futurePressure = currentPressure + (trend.rate * futureTime / 1000);
        
        // Apply pattern-based adjustments
        let adjustedPrediction = futurePressure;
        
        // If cycles detected, adjust for cyclical behavior
        if (this.patterns.cycleDetected && this.patterns.cycleLength > 0) {
            const cyclePosition = (Date.now() % this.patterns.cycleLength) / this.patterns.cycleLength;
            const cycleAdjustment = Math.sin(cyclePosition * 2 * Math.PI) * 0.1;
            adjustedPrediction += cycleAdjustment;
        }
        
        // Apply volatility bounds
        const volatilityMargin = this.patterns.volatility * 0.5;
        
        return {
            prediction: Math.max(0, Math.min(1, adjustedPrediction)),
            confidence: trend.confidence * 0.8, // Reduce confidence for future predictions
            range: {
                min: Math.max(0, adjustedPrediction - volatilityMargin),
                max: Math.min(1, adjustedPrediction + volatilityMargin)
            },
            basedOn: {
                trend: trend.trend,
                rate: trend.rate,
                cycles: this.patterns.cycleDetected,
                volatility: this.patterns.volatility
            }
        };
    }
    
    /**
     * Get comprehensive statistics
     * @returns {object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            historySize: this.usageHistory.length,
            currentPressure: this.currentUsage.pressure,
            lastAnalysis: this.lastAnalysis,
            patterns: { ...this.patterns }
        };
    }
    
    /**
     * Reset analyzer state
     */
    reset() {
        this.usageHistory = [];
        this.patterns = {
            growthRate: 0,
            peakUsage: 0,
            averageUsage: 0,
            volatility: 0,
            trendDirection: 'stable',
            lastTrendAnalysis: 0,
            cycleDetected: false,
            cycleLength: 0
        };
        this.stats = {
            analysisCount: 0,
            trendsDetected: new Map(),
            predictionsCorrect: 0,
            predictionsFailed: 0,
            averageAccuracy: 0
        };
    }
    
    // Private methods
    
    /**
     * Start continuous analysis
     * @private
     */
    _startContinuousAnalysis() {
        setInterval(() => {
            if (Date.now() - this.lastAnalysis > this.analysisInterval) {
                this._updatePatterns();
            }
        }, this.analysisInterval);
    }
    
    /**
     * Update usage patterns
     * @private
     */
    _updatePatterns() {
        if (this.usageHistory.length < 3) return;
        
        const recent = this.usageHistory.slice(-30); // Last 30 samples
        
        // Calculate average usage
        this.patterns.averageUsage = recent.reduce((sum, sample) => 
            sum + sample.pressure, 0) / recent.length;
        
        // Calculate peak usage
        this.patterns.peakUsage = Math.max(...recent.map(s => s.pressure));
        
        // Calculate volatility (standard deviation)
        const variance = recent.reduce((sum, sample) => 
            sum + Math.pow(sample.pressure - this.patterns.averageUsage, 2), 0) / recent.length;
        this.patterns.volatility = Math.sqrt(variance);
        
        // Calculate growth rate
        if (recent.length >= 2) {
            const first = recent[0];
            const last = recent[recent.length - 1];
            const timeSpan = last.timestamp - first.timestamp;
            
            if (timeSpan > 0) {
                this.patterns.growthRate = 
                    (last.pressure - first.pressure) / (timeSpan / 1000);
            }
        }
        
        // Update trend direction
        this._updateTrendDirection();
        
        this.patterns.lastTrendAnalysis = Date.now();
    }
    
    /**
     * Update trend direction
     * @private
     */
    _updateTrendDirection() {
        const rate = this.patterns.growthRate;
        
        if (Math.abs(rate) < 0.001) {
            this.patterns.trendDirection = 'stable';
        } else if (rate > 0) {
            this.patterns.trendDirection = 'growing';
        } else {
            this.patterns.trendDirection = 'shrinking';
        }
        
        // Track trend detection statistics
        const count = this.stats.trendsDetected.get(this.patterns.trendDirection) || 0;
        this.stats.trendsDetected.set(this.patterns.trendDirection, count + 1);
    }
    
    /**
     * Analyze trends for different timeframes
     * @private
     */
    _analyzeTrends() {
        const trends = {};
        
        for (const [timeframe, config] of Object.entries(this.trendAnalysis)) {
            trends[timeframe] = this.getTrend(config.samples * this.analysisInterval);
        }
        
        return trends;
    }
    
    /**
     * Detect cyclical patterns
     * @private
     */
    _detectCycles() {
        if (this.usageHistory.length < 20) {
            return { detected: false };
        }
        
        const samples = this.usageHistory.slice(-60); // Last 60 samples
        const pressures = samples.map(s => s.pressure);
        
        // Simple cycle detection using autocorrelation
        let bestCycleLength = 0;
        let bestCorrelation = 0;
        
        for (let lag = 5; lag < samples.length / 2; lag++) {
            const correlation = this._calculateAutocorrelation(pressures, lag);
            
            if (correlation > bestCorrelation && correlation > 0.7) {
                bestCorrelation = correlation;
                bestCycleLength = lag * this.analysisInterval;
            }
        }
        
        const detected = bestCorrelation > 0.7;
        
        if (detected) {
            this.patterns.cycleDetected = true;
            this.patterns.cycleLength = bestCycleLength;
        }
        
        return {
            detected,
            cycleLength: bestCycleLength,
            correlation: bestCorrelation,
            confidence: Math.min(1.0, bestCorrelation)
        };
    }
    
    /**
     * Calculate autocorrelation for cycle detection
     * @private
     */
    _calculateAutocorrelation(data, lag) {
        if (lag >= data.length - 1) return 0;
        
        const n = data.length - lag;
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < n; i++) {
            numerator += (data[i] - mean) * (data[i + lag] - mean);
        }
        
        for (let i = 0; i < data.length; i++) {
            denominator += Math.pow(data[i] - mean, 2);
        }
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    /**
     * Generate predictions based on patterns
     * @private
     */
    _generatePredictions() {
        const current = this.currentUsage.pressure;
        const rate = this.patterns.growthRate;
        
        // Predict next peak
        let nextPeak = current;
        if (rate > 0) {
            nextPeak = current + (rate * 60); // Next minute
        } else {
            nextPeak = this.patterns.peakUsage * 1.1; // 10% above current peak
        }
        
        // Predict time to memory limit
        let timeToLimit = Infinity;
        if (rate > 0.001) { // Significant growth
            timeToLimit = (1.0 - current) / rate * 1000; // Time in milliseconds
        }
        
        // Determine recommended action
        let recommendedAction = 'none';
        if (current > 0.9) {
            recommendedAction = 'immediate_cleanup';
        } else if (current > 0.8 || rate > 0.01) {
            recommendedAction = 'schedule_cleanup';
        } else if (current > 0.6 && this.patterns.trendDirection === 'growing') {
            recommendedAction = 'monitor_closely';
        }
        
        // Calculate prediction confidence
        const confidence = Math.max(0, Math.min(1.0, 
            this.usageHistory.length / 50 * (1 - this.patterns.volatility)
        ));
        
        this.predictions = {
            nextPeak,
            timeToLimit,
            recommendedAction,
            confidence
        };
        
        return { ...this.predictions };
    }
    
    /**
     * Assess memory risk level
     * @private
     */
    _assessRisk() {
        const current = this.currentUsage.pressure;
        const rate = this.patterns.growthRate;
        const volatility = this.patterns.volatility;
        
        let riskLevel = 'low';
        let riskScore = 0;
        
        // Current usage risk
        if (current > 0.9) riskScore += 0.4;
        else if (current > 0.8) riskScore += 0.3;
        else if (current > 0.7) riskScore += 0.2;
        else if (current > 0.6) riskScore += 0.1;
        
        // Growth rate risk
        if (rate > 0.02) riskScore += 0.3; // Very fast growth
        else if (rate > 0.01) riskScore += 0.2; // Fast growth
        else if (rate > 0.005) riskScore += 0.1; // Moderate growth
        
        // Volatility risk
        if (volatility > 0.3) riskScore += 0.2; // High volatility
        else if (volatility > 0.2) riskScore += 0.1; // Moderate volatility
        
        // Time to limit risk
        if (this.predictions.timeToLimit < 60000) riskScore += 0.3; // Less than 1 minute
        else if (this.predictions.timeToLimit < 300000) riskScore += 0.2; // Less than 5 minutes
        else if (this.predictions.timeToLimit < 900000) riskScore += 0.1; // Less than 15 minutes
        
        // Determine risk level
        if (riskScore >= 0.7) riskLevel = 'critical';
        else if (riskScore >= 0.5) riskLevel = 'high';
        else if (riskScore >= 0.3) riskLevel = 'medium';
        
        return {
            level: riskLevel,
            score: riskScore,
            factors: {
                currentUsage: current,
                growthRate: rate,
                volatility: volatility,
                timeToLimit: this.predictions.timeToLimit
            }
        };
    }
    
    /**
     * Generate recommendations based on risk assessment
     * @private
     */
    _generateRecommendations(risk) {
        const recommendations = [];
        
        if (risk.level === 'critical') {
            recommendations.push('Execute emergency cleanup immediately');
            recommendations.push('Reduce memory-intensive operations');
            recommendations.push('Consider increasing cleanup frequency');
        } else if (risk.level === 'high') {
            recommendations.push('Schedule aggressive cleanup');
            recommendations.push('Monitor memory usage closely');
            recommendations.push('Review memory allocation patterns');
        } else if (risk.level === 'medium') {
            recommendations.push('Schedule standard cleanup');
            recommendations.push('Optimize cache usage');
        } else {
            recommendations.push('Continue normal monitoring');
        }
        
        // Pattern-specific recommendations
        if (this.patterns.volatility > 0.2) {
            recommendations.push('Investigate causes of memory volatility');
        }
        
        if (this.patterns.cycleDetected) {
            recommendations.push('Optimize for detected memory usage cycles');
        }
        
        return recommendations;
    }
}