/**
 * UIComplexityAnalyzer
 * 
 * UI複雑度分析システム機能を担当
 * Complexity Analysis Engine Patternの一部として設計
 * 
 * **Features**:
 * - Multi-dimensional UI complexity measurement
 * - Real-time DOM analysis and monitoring
 * - Adaptive complexity thresholds and recommendations
 * - Performance-optimized analysis algorithms
 * 
 * @module UIComplexityAnalyzer
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface ComplexityMetrics {
    elementCount: ElementCountMetric;
    interactionCount: InteractionCountMetric;
    informationDensity: InformationDensityMetric;
    visualComplexity: VisualComplexityMetric;
    cognitiveLoad: CognitiveLoadMetric;
}

export interface ElementCountMetric {
    total: number;
    visible: number;
    score: number;
}

export interface InteractionCountMetric {
    total: number;
    visible: number;
    score: number;
}

export interface InformationDensityMetric {
    textLength: number;
    visibleArea: number;
    density: number;
    score: number;
}

export interface VisualComplexityMetric {
    colors: number;
    fonts: number;
    borders: number;
    shadows: number;
    score: number;
}

export interface CognitiveLoadMetric {
    hierarchyDepth: number;
    informationTypes: number;
    animationCount: number;
    overlayCount: number;
    score: number;
}

export interface ComplexityThresholds {
    elementCount: ThresholdLevels;
    interactionCount: ThresholdLevels;
    informationDensity: ThresholdLevels;
    visualComplexity: ThresholdLevels;
    cognitiveLoad: ThresholdLevels;
}

export interface ThresholdLevels {
    low: number;
    medium: number;
    high: number;
    extreme: number;
}

export interface ComplexityWeightings {
    elementCount: number;
    interactionCount: number;
    informationDensity: number;
    visualComplexity: number;
    cognitiveLoad: number;
}

export interface AnalysisResult {
    timestamp: number;
    metrics: ComplexityMetrics;
    overallComplexity: OverallComplexity;
    recommendations: Recommendation[];
    analysisTime: number;
}

export interface OverallComplexity {
    score: number;
    level: ComplexityLevel;
    breakdown: ComplexityBreakdown;
}

export interface ComplexityBreakdown {
    elementCount: number;
    interactionCount: number;
    informationDensity: number;
    visualComplexity: number;
    cognitiveLoad: number;
}

export interface Recommendation {
    type: RecommendationType;
    priority: RecommendationPriority;
    message: string;
    action: RecommendationAction;
    impact?: ImpactLevel;
    effort?: EffortLevel;
    confidence?: number;
}

export interface ComplexityStats {
    totalAnalyses: number;
    averageComplexity: number;
    currentMetrics: ComplexityMetrics;
    recentTrend: TrendDirection;
    performanceStats: PerformanceStats;
    complexityDistribution?: ComplexityDistribution;
    historicalPeaks?: HistoricalPeak[];
}

export interface PerformanceStats {
    averageAnalysisTime: number;
    maxAnalysisTime?: number;
    minAnalysisTime?: number;
    memoryUsage?: number;
}

export interface ComplexityDistribution {
    low: number;
    medium: number;
    high: number;
    extreme: number;
}

export interface HistoricalPeak {
    timestamp: number;
    complexity: number;
    context: string;
}

export interface CurrentMetrics extends ComplexityMetrics {
    overall: OverallComplexity;
    lastAnalysis?: number;
}

export interface VisibilityContext {
    visibleElements: number;
    screenArea: number;
    viewportRatio: number;
    scrollPosition: number;
}

export interface AnalysisConfig {
    enableRealTimeAnalysis: boolean;
    analysisDelay: number;
    historyLimit: number;
    performanceMonitoring: boolean;
    detailedBreakdown: boolean;
}

export interface ElementClassification {
    interactive: HTMLElement[];
    visual: HTMLElement[];
    textual: HTMLElement[];
    decorative: HTMLElement[];
    structural: HTMLElement[];
}

export interface ComplexityFactors {
    layout: LayoutComplexity;
    content: ContentComplexity;
    interaction: InteractionComplexity;
    visual: VisualComplexityFactors;
    navigation: NavigationComplexity;
}

export interface LayoutComplexity {
    nesting: number;
    positioning: number;
    responsiveness: number;
    grid: number;
}

export interface ContentComplexity {
    textDensity: number;
    mediaDensity: number;
    informationVariety: number;
    updateFrequency: number;
}

export interface InteractionComplexity {
    inputTypes: number;
    actionComplexity: number;
    feedbackComplexity: number;
    stateManagement: number;
}

export interface VisualComplexityFactors {
    colorPalette: number;
    typography: number;
    spacing: number;
    effects: number;
}

export interface NavigationComplexity {
    menuDepth: number;
    pathVariety: number;
    breadcrumbs: number;
    contextSwitching: number;
}

// 列挙型
export type ComplexityLevel = 'low' | 'medium' | 'high' | 'extreme';
export type RecommendationType = 
    | 'element_reduction'
    | 'interaction_simplification'
    | 'information_spacing'
    | 'visual_simplification'
    | 'cognitive_reduction'
    | 'layout_optimization'
    | 'content_restructuring';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationAction = 
    | 'hide_non_essential_elements'
    | 'simplify_interactions'
    | 'increase_spacing'
    | 'unify_visual_elements'
    | 'progressive_disclosure'
    | 'reduce_nesting'
    | 'consolidate_content';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';
export type ImpactLevel = 'low' | 'medium' | 'high';
export type EffortLevel = 'minimal' | 'moderate' | 'significant' | 'major';

// 定数
export const DEFAULT_THRESHOLDS: ComplexityThresholds = {
    elementCount: {
        low: 10,
        medium: 25,
        high: 50,
        extreme: 100
    },
    interactionCount: {
        low: 5,
        medium: 15,
        high: 30,
        extreme: 50
    },
    informationDensity: {
        low: 0.3,
        medium: 0.6,
        high: 0.8,
        extreme: 1.0
    },
    visualComplexity: {
        low: 0.2,
        medium: 0.5,
        high: 0.7,
        extreme: 0.9
    },
    cognitiveLoad: {
        low: 0.3,
        medium: 0.6,
        high: 0.8,
        extreme: 1.0
    }
} as const;

export const DEFAULT_WEIGHTINGS: ComplexityWeightings = {
    elementCount: 0.2,
    interactionCount: 0.25,
    informationDensity: 0.2,
    visualComplexity: 0.15,
    cognitiveLoad: 0.2
} as const;

export const INTERACTIVE_SELECTORS = [
    'button',
    'input',
    'select',
    'textarea',
    'a[href]',
    '[onclick]',
    '[tabindex]',
    '[role="button"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="tab"]',
    '[contenteditable]'
] as const;

export const INFORMATION_TYPE_SELECTORS = {
    headings: 'h1, h2, h3, h4, h5, h6',
    paragraphs: 'p',
    lists: 'ul, ol, dl',
    tables: 'table',
    forms: 'form',
    images: 'img',
    videos: 'video',
    canvas: 'canvas',
    gameInfo: '.score, .timer, .status, .health, .level',
    buttons: '.button, button',
    navigation: '.menu, .nav, nav, [role="navigation"]'
} as const;

export const OVERLAY_SELECTORS = [
    '.modal',
    '.popup',
    '.tooltip',
    '.overlay',
    '.dropdown',
    '[role="dialog"]',
    '[aria-modal="true"]',
    '[role="tooltip"]',
    '[role="alertdialog"]'
] as const;

export const ANALYSIS_CONFIG: AnalysisConfig = {
    enableRealTimeAnalysis: true,
    analysisDelay: 500,
    historyLimit: 100,
    performanceMonitoring: true,
    detailedBreakdown: false
} as const;

export const COMPLEXITY_SCORE_MAPPING = {
    low: { min: 0, max: 0.3 },
    medium: { min: 0.3, max: 0.6 },
    high: { min: 0.6, max: 0.8 },
    extreme: { min: 0.8, max: 1.0 }
} as const;

// ユーティリティ関数
export function isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           rect.width > 0 &&
           rect.height > 0;
}

export function calculateElementArea(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.width * rect.height;
}

export function classifyElements(container: HTMLElement): ElementClassification {
    const elements = Array.from(container.querySelectorAll('*')) as HTMLElement[];
    
    return {
        interactive: elements.filter(el => isInteractiveElement(el)),
        visual: elements.filter(el => hasVisualEffects(el)),
        textual: elements.filter(el => hasTextContent(el)),
        decorative: elements.filter(el => isDecorativeElement(el)),
        structural: elements.filter(el => isStructuralElement(el))
    };
}

export function isInteractiveElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return INTERACTIVE_SELECTORS.some(selector => {
        try {
            return element.matches(selector);
        } catch {
            return false;
        }
    }) || element.hasAttribute('onclick') || element.tabIndex >= 0;
}

export function hasVisualEffects(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.boxShadow !== 'none' ||
           style.textShadow !== 'none' ||
           style.filter !== 'none' ||
           style.backdropFilter !== 'none';
}

export function hasTextContent(element: HTMLElement): boolean {
    return (element.textContent?.trim().length || 0) > 0;
}

export function isDecorativeElement(element: HTMLElement): boolean {
    const classNames = element.className.toLowerCase();
    return classNames.includes('decoration') ||
           classNames.includes('ornament') ||
           classNames.includes('visual-flair') ||
           element.hasAttribute('aria-hidden');
}

export function isStructuralElement(element: HTMLElement): boolean {
    const structuralTags = ['div', 'section', 'article', 'header', 'footer', 'main', 'aside'];
    return structuralTags.includes(element.tagName.toLowerCase());
}

export function getComplexityLevel(score: number): ComplexityLevel {
    if (score < COMPLEXITY_SCORE_MAPPING.medium.min) return 'low';
    if (score < COMPLEXITY_SCORE_MAPPING.high.min) return 'medium';
    if (score < COMPLEXITY_SCORE_MAPPING.extreme.min) return 'high';
    return 'extreme';
}

export function normalizeScore(value: number, max: number): number {
    return Math.min(value / max, 1.0);
}

export function calculateTrend(values: number[]): TrendDirection {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-5);
    if (recent.length < 2) return 'stable';
    
    const trend = recent[recent.length - 1] - recent[0];
    const variance = calculateVariance(recent);
    if (variance > 0.05) return 'volatile';
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
}

export function calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

export class UIComplexityAnalyzer {
    private complexityMetrics: ComplexityMetrics;
    private analysisHistory: AnalysisResult[];
    private thresholds: ComplexityThresholds;
    private weightings: ComplexityWeightings;
    private mutationObserver: MutationObserver;
    private intersectionObserver: IntersectionObserver;
    private analysisTimer?: number;
    private config: AnalysisConfig;
    
    constructor(config: Partial<AnalysisConfig> = {}) {
        this.config = { ...ANALYSIS_CONFIG, ...config };
        
        this.complexityMetrics = {
            elementCount: { total: 0, visible: 0, score: 0 },
            interactionCount: { total: 0, visible: 0, score: 0 },
            informationDensity: { textLength: 0, visibleArea: 0, density: 0, score: 0 },
            visualComplexity: { colors: 0, fonts: 0, borders: 0, shadows: 0, score: 0 },
            cognitiveLoad: { hierarchyDepth: 0, informationTypes: 0, animationCount: 0, overlayCount: 0, score: 0 }
        };
        
        this.analysisHistory = [];
        this.thresholds = { ...DEFAULT_THRESHOLDS };
        this.weightings = { ...DEFAULT_WEIGHTINGS };
        
        this.setupObserver();
    }
    /**
     * 観察者を設定
     */
    private setupObserver(): void {
        // Mutation ObserverでDOM変更を監視
        this.mutationObserver = new MutationObserver(() => {
            if (this.config.enableRealTimeAnalysis) {
                this.scheduleComplexityAnalysis();
            }
        });
        
        // Intersection Observerで表示要素を監視
        this.intersectionObserver = new IntersectionObserver((entries) => {
            this.updateVisibilityMetrics(entries);
        });
        
        this.startObserving();
    }

    /**
     * 監視を開始
     */
    private startObserving(): void {
        if (typeof document !== 'undefined' && document.body) {
            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'hidden']
            });
        }
    }

    /**
     * 複雑度分析をスケジュール
     */
    private scheduleComplexityAnalysis(): void {
        if (this.analysisTimer) {
            window.clearTimeout(this.analysisTimer);
        }
        
        this.analysisTimer = window.setTimeout(() => {
            this.analyzeComplexity();
        }, this.config.analysisDelay);
    }

    /**
     * UI複雑度を分析
     */
    analyzeComplexity(container: HTMLElement = document.body): AnalysisResult | null {
        if (!container) return null;
        
        const startTime = performance.now();
        try {
            // 各メトリックを計算
            this.complexityMetrics = {
                elementCount: this.calculateElementCount(container),
                interactionCount: this.calculateInteractionCount(container),
                informationDensity: this.calculateInformationDensity(container),
                visualComplexity: this.calculateVisualComplexity(container),
                cognitiveLoad: this.calculateCognitiveLoad(container)
            };
            
            // 総合複雑度スコアを計算
            const overallComplexity = this.calculateOverallComplexity();
            
            // 分析結果を記録
            const analysis: AnalysisResult = {
                timestamp: Date.now(),
                metrics: { ...this.complexityMetrics },
                overallComplexity,
                recommendations: this.generateRecommendations(),
                analysisTime: performance.now() - startTime
            };
            
            this.analysisHistory.push(analysis);
            
            // 履歴サイズを制限
            if (this.analysisHistory.length > this.config.historyLimit) {
                this.analysisHistory = this.analysisHistory.slice(-Math.floor(this.config.historyLimit / 2));
            }
            
            return analysis;

        } catch (error) {
            console.error('Complexity analysis failed:', error);
            return null;
        }
    }

    /**
     * 要素数を計算
     */
    private calculateElementCount(container: HTMLElement): ElementCountMetric {
        const elements = Array.from(container.querySelectorAll('*')) as HTMLElement[];
        const visibleElements = elements.filter(el => isElementVisible(el));
        return {
            total: elements.length,
            visible: visibleElements.length,
            score: normalizeScore(visibleElements.length, this.thresholds.elementCount.extreme)
        };
    }

    /**
     * インタラクション数を計算
     */
    private calculateInteractionCount(container: HTMLElement): InteractionCountMetric {
        const interactiveElements = Array.from(
            container.querySelectorAll(INTERACTIVE_SELECTORS.join(','))
        ) as HTMLElement[];
        
        const visibleInteractive = interactiveElements.filter(el => isElementVisible(el));
        return {
            total: interactiveElements.length,
            visible: visibleInteractive.length,
            score: normalizeScore(visibleInteractive.length, this.thresholds.interactionCount.extreme)
        };
    }

    /**
     * 情報密度を計算
     */
    private calculateInformationDensity(container: HTMLElement): InformationDensityMetric {
        const textElements = Array.from(
            container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th')
        ) as HTMLElement[];
        
        let totalTextLength = 0;
        let visibleArea = 0;
        
        textElements.forEach(el => {
            if (isElementVisible(el)) {
                totalTextLength += (el.textContent?.length || 0);
                visibleArea += calculateElementArea(el);
            }
        });
        
        const density = visibleArea > 0 ? (totalTextLength / visibleArea) * 1000 : 0;
        
        return {
            textLength: totalTextLength,
            visibleArea,
            density,
            score: normalizeScore(density, 10)
        };
    }

    /**
     * 視覚的複雑さを計算
     */
    private calculateVisualComplexity(container: HTMLElement): VisualComplexityMetric {
        const elements = Array.from(container.querySelectorAll('*')) as HTMLElement[];
        const colorVariety = new Set<string>();
        const fontVariety = new Set<string>();
        let borderCount = 0;
        let shadowCount = 0;
        
        elements.forEach(el => {
            if (!isElementVisible(el)) return;

            const style = window.getComputedStyle(el);
            
            // 色の多様性
            if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
                colorVariety.add(style.color);
            }
            
            if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                colorVariety.add(style.backgroundColor);
            }
            
            // フォントの多様性
            if (style.fontFamily) {
                fontVariety.add(style.fontFamily);
            }
            
            // ボーダーの数
            if (style.border && style.border !== 'none' && style.borderWidth !== '0px') {
                borderCount++;
            }
            
            // シャドウの数
            if (style.boxShadow && style.boxShadow !== 'none') {
                shadowCount++;
            }
        });
        
        // 総合的な視覚複雑度スコア
        const score = (
            normalizeScore(colorVariety.size, 20) * 0.3 +
            normalizeScore(fontVariety.size, 10) * 0.2 +
            normalizeScore(borderCount, 50) * 0.25 +
            normalizeScore(shadowCount, 20) * 0.25
        );
        
        return {
            colors: colorVariety.size,
            fonts: fontVariety.size,
            borders: borderCount,
            shadows: shadowCount,
            score
        };
    }

    /**
     * 認知負荷を計算
     */
    private calculateCognitiveLoad(container: HTMLElement): CognitiveLoadMetric {
        const factors = {
            hierarchyDepth: this.calculateHierarchyDepth(container),
            informationTypes: this.countInformationTypes(container),
            animationCount: this.countAnimations(container),
            overlayCount: this.countOverlays(container)
        };
        
        // 認知負荷スコアを計算
        const score = (
            normalizeScore(factors.hierarchyDepth, 10) * 0.3 +
            normalizeScore(factors.informationTypes, 15) * 0.3 +
            normalizeScore(factors.animationCount, 10) * 0.2 +
            normalizeScore(factors.overlayCount, 5) * 0.2
        );
        
        return {
            ...factors,
            score
        };
    }

    /**
     * 階層の深さを計算
     */
    private calculateHierarchyDepth(container: HTMLElement): number {
        let maxDepth = 0;
        
        const traverse = (element: HTMLElement, depth: number): void => {
            maxDepth = Math.max(maxDepth, depth);
            Array.from(element.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    traverse(child, depth + 1);
                }
            });
        };
        
        traverse(container, 0);
        return maxDepth;
    }

    /**
     * 情報タイプ数を計算
     */
    private countInformationTypes(container: HTMLElement): number {
        let typeCount = 0;
        
        Object.values(INFORMATION_TYPE_SELECTORS).forEach(selector => {
            if (container.querySelector(selector)) {
                typeCount++;
            }
        });
        
        return typeCount;
    }

    /**
     * アニメーション数を計算
     */
    private countAnimations(container: HTMLElement): number {
        const animatedElements = container.querySelectorAll(
            '[style*="animation"], [class*="animate"], [class*="transition"]'
        );
        return animatedElements.length;
    }

    /**
     * オーバーレイ数を計算
     */
    private countOverlays(container: HTMLElement): number {
        let overlayCount = 0;
        
        OVERLAY_SELECTORS.forEach(selector => {
            overlayCount += container.querySelectorAll(selector).length;
        });
        
        return overlayCount;
    }

    /**
     * 総合複雑度を計算
     */
    private calculateOverallComplexity(): OverallComplexity {
        const metrics = this.complexityMetrics;
        const weights = this.weightings;
        
        const weightedScore = (
            metrics.elementCount.score * weights.elementCount +
            metrics.interactionCount.score * weights.interactionCount +
            metrics.informationDensity.score * weights.informationDensity +
            metrics.visualComplexity.score * weights.visualComplexity +
            metrics.cognitiveLoad.score * weights.cognitiveLoad
        );
        
        return {
            score: weightedScore,
            level: getComplexityLevel(weightedScore),
            breakdown: {
                elementCount: metrics.elementCount.score * weights.elementCount,
                interactionCount: metrics.interactionCount.score * weights.interactionCount,
                informationDensity: metrics.informationDensity.score * weights.informationDensity,
                visualComplexity: metrics.visualComplexity.score * weights.visualComplexity,
                cognitiveLoad: metrics.cognitiveLoad.score * weights.cognitiveLoad
            }
        };
    }

    /**
     * 推奨事項を生成
     */
    private generateRecommendations(): Recommendation[] {
        const recommendations: Recommendation[] = [];
        const metrics = this.complexityMetrics;
        
        // 要素数に基づく推奨
        if (metrics.elementCount.score > 0.7) {
            recommendations.push({
                type: 'element_reduction',
                priority: 'high',
                message: '表示要素数が多すぎます。重要でない要素を非表示にすることを推奨します。',
                action: 'hide_non_essential_elements',
                impact: 'high',
                effort: 'moderate',
                confidence: 0.9
            });
        }
        
        // インタラクション数に基づく推奨
        if (metrics.interactionCount.score > 0.7) {
            recommendations.push({
                type: 'interaction_simplification',
                priority: 'medium',
                message: 'インタラクティブ要素が多すぎます。主要な操作のみに集中することを推奨します。',
                action: 'simplify_interactions',
                impact: 'medium',
                effort: 'significant',
                confidence: 0.8
            });
        }
        
        // 情報密度に基づく推奨
        if (metrics.informationDensity.score > 0.8) {
            recommendations.push({
                type: 'information_spacing',
                priority: 'medium',
                message: '情報密度が高すぎます。テキストの間隔を広げることを推奨します。',
                action: 'increase_spacing',
                impact: 'medium',
                effort: 'minimal',
                confidence: 0.7
            });
        }
        
        // 視覚的複雑さに基づく推奨
        if (metrics.visualComplexity.score > 0.7) {
            recommendations.push({
                type: 'visual_simplification',
                priority: 'medium',
                message: '視覚的要素が複雑すぎます。色やフォントの統一を推奨します。',
                action: 'unify_visual_elements',
                impact: 'medium',
                effort: 'moderate',
                confidence: 0.8
            });
        }
        
        // 認知負荷に基づく推奨
        if (metrics.cognitiveLoad.score > 0.8) {
            recommendations.push({
                type: 'cognitive_reduction',
                priority: 'high',
                message: '認知負荷が高すぎます。段階的な情報開示を推奨します。',
                action: 'progressive_disclosure',
                impact: 'high',
                effort: 'major',
                confidence: 0.9
            });
        }
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * 可視性メトリクスを更新
     */
    private updateVisibilityMetrics(entries: IntersectionObserverEntry[]): void {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.scheduleComplexityAnalysis();
            }
        });
    }
    /**
     * 分析履歴を取得
     */
    getAnalysisHistory(limit: number = 10): AnalysisResult[] {
        return this.analysisHistory.slice(-limit);
    }

    /**
     * 現在のメトリクスを取得
     */
    getCurrentMetrics(): CurrentMetrics { return { ...this.complexityMetrics,
            overall: this.calculateOverallComplexity() };
            lastAnalysis: this.analysisHistory[this.analysisHistory.length - 1]?.timestamp 
    }

    /**
     * 重み付けを更新
     */
    updateWeightings(newWeightings: Partial<ComplexityWeightings>): void {
        Object.assign(this.weightings, newWeightings);
    }

    /**
     * 閾値を更新
     */
    updateThresholds(newThresholds: Partial<ComplexityThresholds>): void {
        Object.assign(this.thresholds, newThresholds);
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<AnalysisConfig>): void {
        Object.assign(this.config, newConfig);
        if (newConfig.enableRealTimeAnalysis !== undefined) {
            if (newConfig.enableRealTimeAnalysis) {
                this.startObserving();
            } else {
                this.mutationObserver.disconnect();
            }
        }
    }

    /**
     * 統計情報を取得
     */
    getStats(): ComplexityStats {
        const recentAnalyses = this.analysisHistory.slice(-10);
        const avgComplexity = recentAnalyses.length > 0
            ? recentAnalyses.reduce((sum, analysis) => sum + analysis.overallComplexity.score, 0) / recentAnalyses.length
            : 0;
        
        const complexityScores = this.analysisHistory.map(a => a.overallComplexity.score);
        
        // 複雑度分布を計算
        const distribution = {
            low: complexityScores.filter(s => s < 0.3).length,
            medium: complexityScores.filter(s => s >= 0.3 && s < 0.6).length,
            high: complexityScores.filter(s => s >= 0.6 && s < 0.8).length,
            extreme: complexityScores.filter(s => s >= 0.8).length
        };
        
        // 履歴ピークを特定
        const peaks: HistoricalPeak[] = [];
        
        for (let i = 1; i < this.analysisHistory.length - 1; i++) {
            const current = this.analysisHistory[i];
            const prev = this.analysisHistory[i - 1];
            const next = this.analysisHistory[i + 1];
            
            if (current.overallComplexity.score > prev.overallComplexity.score &&
                current.overallComplexity.score > next.overallComplexity.score &&
                current.overallComplexity.score > 0.7) {
                peaks.push({
                    timestamp: current.timestamp,
                    complexity: current.overallComplexity.score,
                    context: current.overallComplexity.level
                });
            }
        }
        
        return {
            totalAnalyses: this.analysisHistory.length,
            averageComplexity: avgComplexity,
            currentMetrics: this.complexityMetrics,
            recentTrend: calculateTrend(complexityScores),
            performanceStats: {
                averageAnalysisTime: recentAnalyses.length > 0
                    ? recentAnalyses.reduce((sum, analysis) => sum + analysis.analysisTime, 0) / recentAnalyses.length
                    : 0,
                maxAnalysisTime: Math.max(...recentAnalyses.map(a => a.analysisTime)),
                minAnalysisTime: Math.min(...recentAnalyses.map(a => a.analysisTime))
            },
            complexityDistribution: distribution,
            historicalPeaks: peaks.slice(-5) // 最新5件のピーク
        };
    }

    /**
     * 複雑度トレンドを計算
     */
    calculateComplexityTrend(): TrendDirection {
        const scores = this.analysisHistory.map(analysis => analysis.overallComplexity.score);
        return calculateTrend(scores);
    }

    /**
     * 強制分析実行
     */
    forceAnalysis(): AnalysisResult | null {
        return this.analyzeComplexity();
    }

    /**
     * 分析をリセット
     */
    resetAnalysis(): void {
        this.analysisHistory = [];
        this.complexityMetrics = {
            elementCount: { total: 0, visible: 0, score: 0 },
            interactionCount: { total: 0, visible: 0, score: 0 },
            informationDensity: { textLength: 0, visibleArea: 0, density: 0, score: 0 },
            visualComplexity: { colors: 0, fonts: 0, borders: 0, shadows: 0, score: 0 },
            cognitiveLoad: { hierarchyDepth: 0, informationTypes: 0, animationCount: 0, overlayCount: 0, score: 0 }
        };
    }

    /**
     * 特定要素の複雑度分析
     */
    analyzeElement(element: HTMLElement): Partial<ComplexityMetrics> {
        return {
            elementCount: this.calculateElementCount(element),
            interactionCount: this.calculateInteractionCount(element),
            informationDensity: this.calculateInformationDensity(element),
            visualComplexity: this.calculateVisualComplexity(element),
            cognitiveLoad: this.calculateCognitiveLoad(element)
        };
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.mutationObserver?.disconnect();
        this.intersectionObserver?.disconnect();
        if (this.analysisTimer) {
            window.clearTimeout(this.analysisTimer);
        }
        
        this.analysisHistory = [];
    }
}