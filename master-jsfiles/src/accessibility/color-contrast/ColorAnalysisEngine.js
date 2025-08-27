/**
 * ColorAnalysisEngine - Comprehensive color analysis and accessibility assessment
 * Handles color palette evaluation, usage pattern analysis, and recommendation generation
 */
export class ColorAnalysisEngine {
    constructor(config = {}) {
        this.config = {
            enableDetailedAnalysis: true,
            includeImages: false,
            autoGenerateRecommendations: true,
            analysisDepth: 'comprehensive', // 'quick', 'standard', 'comprehensive'
            saveAnalysisHistory: true,
            ...config
        };

        // 分析結果の保存
        this.analysisResults = new Map();
        this.analysisHistory = [];
        
        // 統計データ
        this.statistics = {
            totalElements: 0,
            analyzedElements: 0,
            contrastIssues: 0,
            colorBlindnessIssues: 0,
            averageContrast: 0,
            wcagComplianceRate: 0
        };

        // パフォーマンスメトリクス
        this.performanceMetrics = {
            analysisTimes: [],
            elementProcessingRate: 0,
            cacheHitRate: 0
        };

        this.initialized = false;
    }

    /**
     * Initialize analysis engine
     */
    initialize() {
        if (this.initialized) return true;

        console.log('ColorAnalysisEngine: Initializing...');
        
        try {
            this.resetAnalysisData();
            this.initialized = true;
            console.log('ColorAnalysisEngine: Initialized successfully');
            return true;
        } catch (error) {
            console.error('ColorAnalysisEngine: Initialization error:', error);
            return false;
        }
    }

    /**
     * Analyze color palette of elements
     */
    async analyzeColorPalette(elements, options = {}) {
        if (!this.initialized) {
            throw new Error('ColorAnalysisEngine must be initialized first');
        }

        const analysisStartTime = performance.now();
        const paletteOptions = {
            groupSimilarColors: true,
            includeRareColors: false,
            calculateDominance: true,
            ...options
        };

        try {
            const colorMap = new Map();
            const colorUsage = new Map();
            const colorCombinations = new Map();

            for (const element of elements) {
                const styles = window.getComputedStyle(element);
                const colors = this.extractElementColors(element, styles);
                
                // 色の使用頻度を記録
                colors.forEach(color => {
                    const colorKey = this.normalizeColorKey(color);
                    colorUsage.set(colorKey, (colorUsage.get(colorKey) || 0) + 1);
                    colorMap.set(colorKey, color);
                });

                // 色の組み合わせを記録
                if (colors.length >= 2) {
                    const combo = this.createColorCombinationKey(colors);
                    colorCombinations.set(combo, (colorCombinations.get(combo) || 0) + 1);
                }
            }

            // パレット分析結果を生成
            const palette = {
                colors: Array.from(colorMap.values()),
                colorUsage: Object.fromEntries(colorUsage),
                colorCombinations: Object.fromEntries(colorCombinations),
                dominantColors: this.findDominantColors(colorUsage, 10),
                colorHarmony: this.analyzeColorHarmony(Array.from(colorMap.values())),
                diversity: this.calculateColorDiversity(colorMap),
                timestamp: Date.now()
            };

            // 分析時間を記録
            const analysisTime = performance.now() - analysisStartTime;
            this.performanceMetrics.analysisTimes.push(analysisTime);

            return palette;

        } catch (error) {
            console.error('ColorAnalysisEngine: Palette analysis error:', error);
            throw error;
        }
    }

    /**
     * Evaluate color accessibility across elements
     */
    async evaluateColorAccessibility(elements, contrastCalculator) {
        const evaluationStartTime = performance.now();
        const accessibilityResults = {
            compliantElements: [],
            nonCompliantElements: [],
            warnings: [],
            statistics: {},
            recommendations: []
        };

        try {
            let totalContrast = 0;
            let contrastCount = 0;

            for (const element of elements) {
                const styles = window.getComputedStyle(element);
                const textContent = element.textContent?.trim();
                
                if (!textContent || textContent.length === 0) continue;

                // 要素の色分析
                const analysis = await this.analyzeElementColors(element, styles, contrastCalculator);
                
                if (analysis) {
                    if (analysis.wcagCompliant) {
                        accessibilityResults.compliantElements.push(analysis);
                    } else {
                        accessibilityResults.nonCompliantElements.push(analysis);
                    }

                    if (analysis.contrastRatio) {
                        totalContrast += analysis.contrastRatio;
                        contrastCount++;
                    }

                    // 警告の収集
                    if (analysis.warnings && analysis.warnings.length > 0) {
                        accessibilityResults.warnings.push(...analysis.warnings);
                    }
                }
            }

            // 統計の計算
            accessibilityResults.statistics = {
                totalElements: elements.length,
                compliantElements: accessibilityResults.compliantElements.length,
                nonCompliantElements: accessibilityResults.nonCompliantElements.length,
                complianceRate: elements.length > 0 
                    ? (accessibilityResults.compliantElements.length / elements.length) * 100 
                    : 0,
                averageContrast: contrastCount > 0 ? totalContrast / contrastCount : 0,
                warningCount: accessibilityResults.warnings.length
            };

            // 推奨事項の生成
            if (this.config.autoGenerateRecommendations) {
                accessibilityResults.recommendations = this.generateAccessibilityRecommendations(
                    accessibilityResults
                );
            }

            // 分析履歴に保存
            if (this.config.saveAnalysisHistory) {
                this.analysisHistory.push({
                    type: 'accessibility_evaluation',
                    results: accessibilityResults,
                    timestamp: evaluationStartTime,
                    duration: performance.now() - evaluationStartTime
                });
            }

            return accessibilityResults;

        } catch (error) {
            console.error('ColorAnalysisEngine: Accessibility evaluation error:', error);
            throw error;
        }
    }

    /**
     * Assess color usage patterns
     */
    assessColorUsage(elements, options = {}) {
        const usageOptions = {
            detectPatterns: true,
            analyzeContext: true,
            includeSemantics: true,
            ...options
        };

        const usageAnalysis = {
            patterns: [],
            contexts: new Map(),
            semanticUsage: new Map(),
            inconsistencies: [],
            recommendations: []
        };

        try {
            const colorContextMap = new Map();

            // 要素ごとの色使用パターンを分析
            elements.forEach(element => {
                const context = this.determineElementContext(element);
                const colors = this.extractElementColors(element, window.getComputedStyle(element));
                
                colors.forEach(color => {
                    const colorKey = this.normalizeColorKey(color);
                    if (!colorContextMap.has(colorKey)) {
                        colorContextMap.set(colorKey, new Set());
                    }
                    colorContextMap.get(colorKey).add(context);
                });
            });

            // パターンの検出
            if (usageOptions.detectPatterns) {
                usageAnalysis.patterns = this.detectUsagePatterns(colorContextMap);
            }

            // コンテキスト分析
            if (usageOptions.analyzeContext) {
                usageAnalysis.contexts = this.analyzeColorContexts(colorContextMap);
            }

            // セマンティック使用の分析
            if (usageOptions.includeSemantics) {
                usageAnalysis.semanticUsage = this.analyzeSemanticColorUsage(elements);
            }

            // 一貫性チェック
            usageAnalysis.inconsistencies = this.detectColorInconsistencies(colorContextMap);

            // 使用パターンに基づく推奨事項
            usageAnalysis.recommendations = this.generateUsageRecommendations(usageAnalysis);

            return usageAnalysis;

        } catch (error) {
            console.error('ColorAnalysisEngine: Usage assessment error:', error);
            throw error;
        }
    }

    // Private helper methods

    /**
     * Extract colors from element and styles
     */
    extractElementColors(element, styles) {
        const colors = [];
        
        try {
            // テキスト色
            const textColor = styles.color;
            if (textColor && textColor !== 'transparent') {
                colors.push(this.parseColor(textColor));
            }

            // 背景色
            const bgColor = styles.backgroundColor;
            if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
                colors.push(this.parseColor(bgColor));
            }

            // ボーダー色
            const borderColor = styles.borderColor;
            if (borderColor && borderColor !== 'transparent') {
                colors.push(this.parseColor(borderColor));
            }

            // その他の装飾色（アウトライン、シャドウなど）
            const outlineColor = styles.outlineColor;
            if (outlineColor && outlineColor !== 'transparent') {
                colors.push(this.parseColor(outlineColor));
            }

        } catch (error) {
            console.warn('Color extraction failed for element:', error);
        }

        return colors.filter(color => color !== null);
    }

    /**
     * Analyze individual element colors
     */
    async analyzeElementColors(element, styles, contrastCalculator) {
        try {
            const textContent = element.textContent?.trim();
            if (!textContent) return null;

            const foregroundColor = this.parseColor(styles.color);
            const backgroundColor = this.parseColor(styles.backgroundColor);
            
            if (!foregroundColor || !backgroundColor) return null;

            // コントラスト分析
            const contrastResult = contrastCalculator.analyzeColorPair(
                foregroundColor,
                backgroundColor,
                parseFloat(styles.fontSize),
                this.parseFontWeight(styles.fontWeight)
            );

            return {
                element,
                textContent: textContent.substring(0, 100),
                foregroundColor,
                backgroundColor,
                contrastRatio: contrastResult.contrastRatio,
                wcagCompliant: contrastResult.wcagValidation.passes,
                wcagLevel: contrastResult.wcagValidation.level,
                isLargeText: contrastResult.textProperties.isLargeText,
                warnings: this.generateElementWarnings(contrastResult),
                recommendations: contrastResult.recommendations,
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn('Element color analysis failed:', error);
            return null;
        }
    }

    /**
     * Parse color string to RGB object
     */
    parseColor(colorStr) {
        if (!colorStr || colorStr === 'transparent') return null;

        try {
            // 簡略化された色パーサー
            if (colorStr.startsWith('#')) {
                const hex = colorStr.replace('#', '');
                if (hex.length === 6) {
                    return {
                        r: parseInt(hex.substr(0, 2), 16),
                        g: parseInt(hex.substr(2, 2), 16),
                        b: parseInt(hex.substr(4, 2), 16)
                    };
                }
            }

            // rgb(r,g,b)形式
            const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                return {
                    r: parseInt(rgbMatch[1]),
                    g: parseInt(rgbMatch[2]),
                    b: parseInt(rgbMatch[3])
                };
            }

            return null;
        } catch (error) {
            console.warn('Color parsing failed:', colorStr, error);
            return null;
        }
    }

    /**
     * Parse font weight
     */
    parseFontWeight(fontWeight) {
        if (typeof fontWeight === 'number') return fontWeight;
        
        const weightMap = {
            'normal': 400,
            'bold': 700,
            'lighter': 300,
            'bolder': 600
        };
        
        return weightMap[fontWeight] || parseInt(fontWeight) || 400;
    }

    /**
     * Normalize color to string key
     */
    normalizeColorKey(color) {
        if (!color) return 'transparent';
        return `rgb(${color.r},${color.g},${color.b})`;
    }

    /**
     * Create color combination key
     */
    createColorCombinationKey(colors) {
        return colors.map(c => this.normalizeColorKey(c)).sort().join('|');
    }

    /**
     * Find dominant colors in usage map
     */
    findDominantColors(colorUsage, limit = 10) {
        return Array.from(colorUsage.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([color, count]) => ({ color, count }));
    }

    /**
     * Analyze color harmony
     */
    analyzeColorHarmony(colors) {
        // 色調和の基本分析（簡略版）
        return {
            harmonyType: 'mixed',
            harmonyScore: 0.75,
            suggestions: ['More consistent color temperature', 'Better saturation balance']
        };
    }

    /**
     * Calculate color diversity
     */
    calculateColorDiversity(colorMap) {
        const uniqueColors = colorMap.size;
        return {
            uniqueColors,
            diversityScore: Math.min(uniqueColors / 20, 1.0),
            complexity: uniqueColors > 15 ? 'high' : uniqueColors > 8 ? 'medium' : 'low'
        };
    }

    /**
     * Determine element context
     */
    determineElementContext(element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className || '';
        
        // 基本的なコンテキスト判定
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
        if (tagName === 'button' || className.includes('button')) return 'button';
        if (tagName === 'a' || className.includes('link')) return 'link';
        if (className.includes('nav')) return 'navigation';
        if (className.includes('menu')) return 'menu';
        
        return 'content';
    }

    /**
     * Generate element-specific warnings
     */
    generateElementWarnings(contrastResult) {
        const warnings = [];
        
        if (!contrastResult.wcagValidation.passes) {
            warnings.push({
                type: 'contrast_failure',
                message: `WCAG ${contrastResult.wcagValidation.level} compliance failed`,
                severity: 'error'
            });
        }

        if (contrastResult.contrastRatio < 3.0) {
            warnings.push({
                type: 'critical_contrast',
                message: 'Critically low contrast ratio',
                severity: 'critical'
            });
        }

        return warnings;
    }

    /**
     * Generate accessibility recommendations
     */
    generateAccessibilityRecommendations(results) {
        const recommendations = [];

        if (results.statistics.complianceRate < 80) {
            recommendations.push({
                category: 'Critical',
                priority: 'high',
                title: 'Improve overall color contrast',
                description: `Only ${results.statistics.complianceRate.toFixed(1)}% of elements meet WCAG standards`,
                actions: [
                    'Review color palette for better contrast ratios',
                    'Consider darker text colors or lighter backgrounds',
                    'Test with automated accessibility tools'
                ]
            });
        }

        if (results.warnings.length > 10) {
            recommendations.push({
                category: 'Warnings',
                priority: 'medium',
                title: 'Address color accessibility warnings',
                description: `${results.warnings.length} warnings found`,
                actions: [
                    'Review specific element warnings',
                    'Implement consistent color standards',
                    'Create accessibility guidelines for design team'
                ]
            });
        }

        return recommendations;
    }

    /**
     * Reset analysis data
     */
    resetAnalysisData() {
        this.analysisResults.clear();
        this.statistics = {
            totalElements: 0,
            analyzedElements: 0,
            contrastIssues: 0,
            colorBlindnessIssues: 0,
            averageContrast: 0,
            wcagComplianceRate: 0
        };
        this.performanceMetrics = {
            analysisTimes: [],
            elementProcessingRate: 0,
            cacheHitRate: 0
        };
    }

    /**
     * Get analysis statistics
     */
    getAnalysisStatistics() {
        return {
            ...this.statistics,
            performanceMetrics: this.performanceMetrics,
            historyCount: this.analysisHistory.length,
            cacheSize: this.analysisResults.size
        };
    }

    // Placeholder methods for complex analysis features
    detectUsagePatterns(colorContextMap) { return []; }
    analyzeColorContexts(colorContextMap) { return new Map(); }
    analyzeSemanticColorUsage(elements) { return new Map(); }
    detectColorInconsistencies(colorContextMap) { return []; }
    generateUsageRecommendations(usageAnalysis) { return []; }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        console.log('ColorAnalysisEngine: Configuration updated');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.resetAnalysisData();
        this.analysisHistory = [];
        this.initialized = false;
        console.log('ColorAnalysisEngine: Destroyed');
    }
}