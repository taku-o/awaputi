/**
 * ColorBlindnessSimulator - Color vision deficiency simulation and accessibility impact assessment
 * Simulates various types of color blindness and provides alternative color suggestions
 */
export class ColorBlindnessSimulator {
    constructor(config = {}) {
        this.config = {
            enableSimulation: true,
            includePartialColorBlindness: true,
            generateSuggestions: true,
            accurateSimulation: true,
            ...config
        };

        // 色覚異常の種類定義
        this.colorBlindnessTypes = {
            protanopia: {
                name: '第一色覚異常（赤色盲）',
                description: '赤色の識別が困難',
                prevalence: '男性1.3%、女性0.02%',
                matrix: [
                    [0.567, 0.433, 0],
                    [0.558, 0.442, 0],
                    [0, 0.242, 0.758]
                ]
            },
            deuteranopia: {
                name: '第二色覚異常（緑色盲）',
                description: '緑色の識別が困難',
                prevalence: '男性1.2%、女性0.01%',
                matrix: [
                    [0.625, 0.375, 0],
                    [0.7, 0.3, 0],
                    [0, 0.3, 0.7]
                ]
            },
            tritanopia: {
                name: '第三色覚異常（青色盲）',
                description: '青色の識別が困難',
                prevalence: '男女0.002%',
                matrix: [
                    [0.95, 0.05, 0],
                    [0, 0.433, 0.567],
                    [0, 0.475, 0.525]
                ]
            },
            protanomaly: {
                name: '第一色覚異常（軽度）',
                description: '赤色の識別が軽度困難',
                prevalence: '男性1.0%、女性0.03%',
                matrix: [
                    [0.817, 0.183, 0],
                    [0.333, 0.667, 0],
                    [0, 0.125, 0.875]
                ]
            },
            deuteranomaly: {
                name: '第二色覚異常（軽度）',
                description: '緑色の識別が軽度困難',
                prevalence: '男性4.9%、女性0.38%',
                matrix: [
                    [0.8, 0.2, 0],
                    [0.258, 0.742, 0],
                    [0, 0.142, 0.858]
                ]
            },
            tritanomaly: {
                name: '第三色覚異常（軽度）',
                description: '青色の識別が軽度困難',
                prevalence: '男女0.01%',
                matrix: [
                    [0.967, 0.033, 0],
                    [0, 0.733, 0.267],
                    [0, 0.183, 0.817]
                ]
            }
        };

        // シミュレーション結果キャッシュ
        this.simulationCache = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;

        // パフォーマンスメトリクス
        this.performanceMetrics = {
            simulationTimes: [],
            cacheHitRate: 0,
            totalSimulations: 0
        };

        this.initialized = false;
    }

    /**
     * Initialize simulator
     */
    initialize() {
        if (this.initialized) return true;

        console.log('ColorBlindnessSimulator: Initializing...');
        
        try {
            this.simulationCache.clear();
            this.resetPerformanceMetrics();
            
            this.initialized = true;
            console.log('ColorBlindnessSimulator: Initialized successfully');
            return true;
        } catch (error) {
            console.error('ColorBlindnessSimulator: Initialization error:', error);
            return false;
        }
    }

    /**
     * Simulate color blindness for a given color
     */
    simulateColorBlindness(color, type = 'deuteranopia') {
        if (!this.initialized) {
            throw new Error('ColorBlindnessSimulator must be initialized first');
        }

        const startTime = performance.now();

        try {
            // キャッシュチェック
            const cacheKey = this.generateCacheKey(color, type);
            const cachedResult = this.simulationCache.get(cacheKey);
            if (cachedResult) {
                this.cacheHits++;
                this.updatePerformanceMetrics(performance.now() - startTime, true);
                return cachedResult;
            }
            this.cacheMisses++;

            // 色覚異常タイプの取得
            const colorBlindnessType = this.colorBlindnessTypes[type];
            if (!colorBlindnessType) {
                throw new Error(`Unknown color blindness type: ${type}`);
            }

            // 色変換の実行
            const normalizedColor = this.normalizeColor(color);
            const simulatedColor = this.applyColorTransformation(normalizedColor, colorBlindnessType.matrix);

            // 結果をキャッシュに保存
            this.simulationCache.set(cacheKey, simulatedColor);

            this.updatePerformanceMetrics(performance.now() - startTime, false);
            return simulatedColor;

        } catch (error) {
            console.error('ColorBlindnessSimulator: Simulation error:', error);
            throw error;
        }
    }

    /**
     * Transform colors using color blindness matrix
     */
    transformColors(colors, type = 'deuteranopia') {
        return colors.map(color => this.simulateColorBlindness(color, type));
    }

    /**
     * Assess accessibility impact of color blindness
     */
    assessAccessibilityImpact(foregroundColor, backgroundColor, options = {}) {
        const assessmentOptions = {
            includeAllTypes: true,
            calculateDifferences: true,
            generateRecommendations: true,
            ...options
        };

        const assessment = {
            originalColors: { foreground: foregroundColor, background: backgroundColor },
            simulations: {},
            impact: {},
            recommendations: [],
            overallRisk: 'low'
        };

        try {
            const typesToTest = assessmentOptions.includeAllTypes 
                ? Object.keys(this.colorBlindnessTypes)
                : ['deuteranopia', 'protanopia']; // 最も一般的な色覚異常

            let totalImpact = 0;
            let significantIssues = 0;

            typesToTest.forEach(type => {
                const simulatedForeground = this.simulateColorBlindness(foregroundColor, type);
                const simulatedBackground = this.simulateColorBlindness(backgroundColor, type);

                assessment.simulations[type] = {
                    foreground: simulatedForeground,
                    background: simulatedBackground,
                    type: this.colorBlindnessTypes[type]
                };

                if (assessmentOptions.calculateDifferences) {
                    const colorDifference = this.calculateColorDifference(
                        foregroundColor, simulatedForeground, backgroundColor, simulatedBackground
                    );

                    assessment.impact[type] = {
                        colorDifference,
                        significantChange: colorDifference.maxDifference > 20,
                        visibilityImpact: this.calculateVisibilityImpact(colorDifference),
                        riskLevel: this.determineRiskLevel(colorDifference)
                    };

                    totalImpact += colorDifference.maxDifference;
                    if (colorDifference.maxDifference > 20) {
                        significantIssues++;
                    }
                }
            });

            // 全体的なリスクレベルの決定
            assessment.overallRisk = this.calculateOverallRisk(totalImpact, significantIssues, typesToTest.length);

            // 推奨事項の生成
            if (assessmentOptions.generateRecommendations) {
                assessment.recommendations = this.generateColorBlindnessRecommendations(assessment);
            }

            return assessment;

        } catch (error) {
            console.error('ColorBlindnessSimulator: Impact assessment error:', error);
            throw error;
        }
    }

    /**
     * Suggest alternative colors for better accessibility
     */
    suggestAlternativeColors(originalColors, options = {}) {
        const suggestionOptions = {
            maintainBranding: true,
            targetContrast: 4.5,
            minimizeChange: true,
            includeMultipleOptions: true,
            ...options
        };

        const suggestions = {
            alternatives: [],
            reasoning: [],
            confidence: 0
        };

        try {
            // 各色覚異常タイプでの問題を分析
            const problemAreas = this.identifyProblemAreas(originalColors);

            // 代替色の生成
            const colorAlternatives = this.generateColorAlternatives(
                originalColors, 
                problemAreas, 
                suggestionOptions
            );

            suggestions.alternatives = colorAlternatives;
            suggestions.reasoning = this.generateAlternativeReasoning(problemAreas, colorAlternatives);
            suggestions.confidence = this.calculateSuggestionConfidence(colorAlternatives);

            return suggestions;

        } catch (error) {
            console.error('ColorBlindnessSimulator: Alternative color suggestion error:', error);
            throw error;
        }
    }

    // Private helper methods

    /**
     * Apply color transformation matrix
     */
    applyColorTransformation(color, matrix) {
        const { r, g, b, a = 255 } = color;
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        
        const newR = matrix[0][0] * rNorm + matrix[0][1] * gNorm + matrix[0][2] * bNorm;
        const newG = matrix[1][0] * rNorm + matrix[1][1] * gNorm + matrix[1][2] * bNorm;
        const newB = matrix[2][0] * rNorm + matrix[2][1] * gNorm + matrix[2][2] * bNorm;
        
        return {
            r: Math.round(Math.max(0, Math.min(255, newR * 255))),
            g: Math.round(Math.max(0, Math.min(255, newG * 255))),
            b: Math.round(Math.max(0, Math.min(255, newB * 255))),
            a
        };
    }

    /**
     * Normalize color input
     */
    normalizeColor(color) {
        if (typeof color === 'object' && color.r !== undefined) {
            return { r: color.r, g: color.g, b: color.b, a: color.a || 255 };
        }
        
        if (typeof color === 'string') {
            return this.parseColorString(color);
        }
        
        throw new Error('Invalid color format');
    }

    /**
     * Parse color string to RGB
     */
    parseColorString(colorStr) {
        // 簡略化された色文字列パーサー
        const hex = colorStr.replace('#', '');
        if (hex.length === 6) {
            return {
                r: parseInt(hex.substr(0, 2), 16),
                g: parseInt(hex.substr(2, 2), 16),
                b: parseInt(hex.substr(4, 2), 16),
                a: 255
            };
        }
        
        const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3]),
                a: rgbMatch[4] ? Math.round(parseFloat(rgbMatch[4]) * 255) : 255
            };
        }
        
        throw new Error(`Unsupported color format: ${colorStr}`);
    }

    /**
     * Calculate color difference between original and simulated colors
     */
    calculateColorDifference(originalFg, simulatedFg, originalBg, simulatedBg) {
        const fgDiff = this.calculateRgbDifference(originalFg, simulatedFg);
        const bgDiff = this.calculateRgbDifference(originalBg, simulatedBg);
        
        return {
            foregroundDifference: fgDiff,
            backgroundDifference: bgDiff,
            maxDifference: Math.max(fgDiff, bgDiff),
            averageDifference: (fgDiff + bgDiff) / 2
        };
    }

    /**
     * Calculate RGB color difference
     */
    calculateRgbDifference(color1, color2) {
        const deltaR = color1.r - color2.r;
        const deltaG = color1.g - color2.g;
        const deltaB = color1.b - color2.b;
        
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    }

    /**
     * Calculate visibility impact
     */
    calculateVisibilityImpact(colorDifference) {
        if (colorDifference.maxDifference > 50) return 'high';
        if (colorDifference.maxDifference > 20) return 'medium';
        return 'low';
    }

    /**
     * Determine risk level
     */
    determineRiskLevel(colorDifference) {
        if (colorDifference.maxDifference > 60) return 'critical';
        if (colorDifference.maxDifference > 40) return 'high';
        if (colorDifference.maxDifference > 20) return 'medium';
        return 'low';
    }

    /**
     * Calculate overall risk
     */
    calculateOverallRisk(totalImpact, significantIssues, totalTypes) {
        const averageImpact = totalImpact / totalTypes;
        const issueRatio = significantIssues / totalTypes;
        
        if (averageImpact > 40 || issueRatio > 0.5) return 'high';
        if (averageImpact > 20 || issueRatio > 0.25) return 'medium';
        return 'low';
    }

    /**
     * Generate cache key
     */
    generateCacheKey(color, type) {
        const normalizedColor = this.normalizeColor(color);
        return `${normalizedColor.r},${normalizedColor.g},${normalizedColor.b},${normalizedColor.a}:${type}`;
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(simulationTime, fromCache) {
        this.performanceMetrics.totalSimulations++;
        
        if (!fromCache) {
            this.performanceMetrics.simulationTimes.push(simulationTime);
        }
        
        const totalRequests = this.cacheHits + this.cacheMisses;
        this.performanceMetrics.cacheHitRate = totalRequests > 0 
            ? (this.cacheHits / totalRequests) * 100 
            : 0;
    }

    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            simulationTimes: [],
            cacheHitRate: 0,
            totalSimulations: 0
        };
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }

    // Placeholder methods for complex features
    identifyProblemAreas(colors) { return []; }
    generateColorAlternatives(colors, problems, options) { return []; }
    generateAlternativeReasoning(problems, alternatives) { return []; }
    calculateSuggestionConfidence(alternatives) { return 0.75; }
    
    generateColorBlindnessRecommendations(assessment) {
        const recommendations = [];
        
        if (assessment.overallRisk === 'high') {
            recommendations.push({
                category: 'Critical',
                priority: 'high',
                title: 'Address color blindness accessibility issues',
                description: 'High impact on color blind users detected',
                actions: [
                    'Use patterns or shapes in addition to color',
                    'Increase contrast between colors',
                    'Test with color blindness simulation tools'
                ]
            });
        }
        
        return recommendations;
    }

    /**
     * Get supported color blindness types
     */
    getSupportedTypes() {
        return Object.keys(this.colorBlindnessTypes).map(key => ({
            key,
            ...this.colorBlindnessTypes[key]
        }));
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const times = this.performanceMetrics.simulationTimes;
        const avgTime = times.length > 0 
            ? times.reduce((a, b) => a + b, 0) / times.length 
            : 0;
        
        return {
            totalSimulations: this.performanceMetrics.totalSimulations,
            averageSimulationTime: avgTime,
            cacheHitRate: this.performanceMetrics.cacheHitRate,
            cacheSize: this.simulationCache.size
        };
    }

    /**
     * Clear simulation cache
     */
    clearCache() {
        this.simulationCache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        console.log('ColorBlindnessSimulator: Cache cleared');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        console.log('ColorBlindnessSimulator: Configuration updated');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.clearCache();
        this.resetPerformanceMetrics();
        this.initialized = false;
        console.log('ColorBlindnessSimulator: Destroyed');
    }
}