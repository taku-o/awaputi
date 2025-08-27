/**
 * ColorContrastAnalyzer - Main Controller for color contrast analysis system
 * Orchestrates contrast calculation, color analysis, and color blindness simulation
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { ContrastCalculator } from './color-contrast/ContrastCalculator.js';
import { ColorAnalysisEngine } from './color-contrast/ColorAnalysisEngine.js';
import { ColorBlindnessSimulator } from './color-contrast/ColorBlindnessSimulator.js';

// Interfaces for color contrast analysis
interface ColorContrastConfig {
    enabled: boolean;
    realTimeAnalysis: boolean;
    wcagLevel: 'A' | 'AA' | 'AAA';
    includeImages: boolean;
    autoFix: boolean;
    colorBlindnessSimulation: boolean;
    detailedReporting: boolean;
}

interface AnalysisResults {
    lastAnalysis: AnalysisReport | null;
    contrastIssues: ContrastIssue[];
    colorBlindnessIssues: ColorBlindnessIssue[];
    recommendations: Recommendation[];
    statisticsReport: StatisticsReport | null;
}

interface AnalysisReport {
    timestamp: number;
    totalElements: number;
    elementsAnalyzed: number;
    issuesFound: number;
    wcagLevel: string;
    passRate: number;
    criticalIssues: number;
    warnings: number;
}

interface ContrastIssue {
    id: string;
    element: HTMLElement | null;
    selector: string;
    foregroundColor: string;
    backgroundColor: string;
    contrastRatio: number;
    requiredRatio: number;
    wcagLevel: string;
    severity: 'critical' | 'warning' | 'info';
    suggestion?: ColorSuggestion;
}

interface ColorBlindnessIssue {
    id: string;
    element: HTMLElement | null;
    selector: string;
    colorPair: { foreground: string; background: string };
    affectedTypes: ColorBlindnessType[];
    severity: 'critical' | 'warning' | 'info';
    description: string;
}

interface ColorBlindnessType {
    type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly';
    name: string;
    prevalence: number;
}

interface Recommendation {
    id: string;
    type: 'contrast' | 'colorBlindness' | 'general';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedElements: string[];
    suggestedFix?: ColorFix;
}

interface ColorSuggestion {
    foreground?: string;
    background?: string;
    contrastRatio: number;
    improvement: number;
}

interface ColorFix {
    type: 'color' | 'filter' | 'pattern';
    value: string;
    cssProperty: string;
}

interface StatisticsReport {
    timestamp: number;
    summary: {
        totalContrast: number;
        passedContrast: number;
        failedContrast: number;
        colorBlindnessSafe: number;
        colorBlindnessRisks: number;
    };
    byLevel: Record<string, number>;
    bySeverity: Record<string, number>;
    byColorType: Record<string, number>;
}

interface AnalysisState {
    analyzing: boolean;
    realTimeEnabled: boolean;
    lastAnalysisTime: number | null;
    analyzeScheduled: boolean;
}

interface EventHandlers {
    styleChanged: (() => void) | null;
    domChanged: (() => void) | null;
    resize: (() => void) | null;
}

interface PerformanceMetrics {
    analysisCount: number;
    averageAnalysisTime: number;
    lastAnalysisTime: number;
}

interface AnalysisOptions {
    skipCache?: boolean;
    includeInvisible?: boolean;
    deepScan?: boolean;
    maxElements?: number;
}

export class ColorContrastAnalyzer {
    private config: ColorContrastConfig;
    private results: AnalysisResults;
    private state: AnalysisState;
    private eventHandlers: EventHandlers;
    private performance: PerformanceMetrics;
    private contrastCalculator: ContrastCalculator;
    private colorAnalysisEngine: ColorAnalysisEngine;
    private colorBlindnessSimulator: ColorBlindnessSimulator;
    private accessibilityManager: any;
    private gameEngine: any;
    private errorHandler: any;
    private realTimeTimer: number | null = null;

    constructor(accessibilityManager: any) {
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

        this.errorHandler = getErrorHandler();
        console.log('ColorContrastAnalyzer initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void {
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
            
            // 初回分析の実行
            if (this.config.enabled) {
                setTimeout(() => this.analyzeFullPage(), 1000);
            }
            
            console.log('ColorContrastAnalyzer: 初期化完了');
        } catch (error) {
            console.error('ColorContrastAnalyzer: 初期化エラー', error);
            this.errorHandler.logError('Color contrast initialization error', error);
        }
    }
    
    /**
     * イベントハンドラーの設定
     */
    private setupEventHandlers(): void {
        // Style change observer
        if (this.config.realTimeAnalysis) {
            this.eventHandlers.styleChanged = () => this.handleStyleChange();
            this.eventHandlers.domChanged = () => this.handleDOMChange();
            this.eventHandlers.resize = () => this.handleResize();
            
            this.startRealTimeMonitoring();
        }
    }
    
    /**
     * ページ全体の分析
     */
    async analyzeFullPage(options: AnalysisOptions = {}): Promise<AnalysisReport | null> {
        if (this.state.analyzing) {
            console.warn('Analysis already in progress');
            return null;
        }

        console.log('Starting full page color contrast analysis...');
        this.state.analyzing = true;
        const startTime = performance.now();

        try {
            // Reset previous results
            this.results.contrastIssues = [];
            this.results.colorBlindnessIssues = [];
            this.results.recommendations = [];

            // Get all elements to analyze
            const elements = this.getElementsToAnalyze(options);
            const totalElements = elements.length;
            
            console.log(`Found ${totalElements} elements to analyze`);

            // Analyze each element
            let issuesFound = 0;
            let criticalIssues = 0;
            let warnings = 0;

            for (const element of elements) {
                const result = await this.analyzeElement(element);
                
                if (result) {
                    if (result.contrastIssue) {
                        this.results.contrastIssues.push(result.contrastIssue);
                        issuesFound++;
                        
                        if (result.contrastIssue.severity === 'critical') {
                            criticalIssues++;
                        } else if (result.contrastIssue.severity === 'warning') {
                            warnings++;
                        }
                    }
                    
                    if (result.colorBlindnessIssues?.length > 0) {
                        this.results.colorBlindnessIssues.push(...result.colorBlindnessIssues);
                    }
                }
            }

            // Generate recommendations
            this.results.recommendations = this.generateRecommendations();

            // Generate statistics
            this.results.statisticsReport = this.generateStatisticsReport();

            // Create analysis report
            const report: AnalysisReport = {
                timestamp: Date.now(),
                totalElements: totalElements,
                elementsAnalyzed: totalElements,
                issuesFound: issuesFound,
                wcagLevel: this.config.wcagLevel,
                passRate: totalElements > 0 ? ((totalElements - issuesFound) / totalElements) * 100 : 100,
                criticalIssues: criticalIssues,
                warnings: warnings
            };

            this.results.lastAnalysis = report;
            this.state.lastAnalysisTime = Date.now();

            // Update performance metrics
            const analysisTime = performance.now() - startTime;
            this.updatePerformanceMetrics(analysisTime);

            console.log(`Analysis completed in ${analysisTime.toFixed(2)}ms`);
            console.log(`Found ${issuesFound} contrast issues (${criticalIssues} critical)`);

            return report;
        } catch (error) {
            console.error('Error during color contrast analysis:', error);
            this.errorHandler.logError('Color contrast analysis error', error);
            return null;
        } finally {
            this.state.analyzing = false;
        }
    }
    
    /**
     * 個別要素の分析
     */
    private async analyzeElement(element: HTMLElement): Promise<any> {
        try {
            const styles = window.getComputedStyle(element);
            
            // Skip invisible elements
            if (styles.display === 'none' || styles.visibility === 'hidden') {
                return null;
            }

            // Get colors
            const foregroundColor = styles.color;
            const backgroundColor = this.getBackgroundColor(element);
            
            if (!foregroundColor || !backgroundColor) {
                return null;
            }

            const result: any = {};

            // Calculate contrast ratio
            const contrastRatio = this.contrastCalculator.calculateContrastRatio(
                foregroundColor,
                backgroundColor
            );

            // Check WCAG compliance
            const isLargeText = this.isLargeText(element, styles);
            const requiredRatio = this.getRequiredContrastRatio(isLargeText);
            
            if (contrastRatio < requiredRatio) {
                result.contrastIssue = {
                    id: `contrast-${Date.now()}-${Math.random()}`,
                    element: element,
                    selector: this.generateSelector(element),
                    foregroundColor: foregroundColor,
                    backgroundColor: backgroundColor,
                    contrastRatio: contrastRatio,
                    requiredRatio: requiredRatio,
                    wcagLevel: this.config.wcagLevel,
                    severity: contrastRatio < requiredRatio * 0.7 ? 'critical' : 'warning',
                    suggestion: this.generateColorSuggestion(foregroundColor, backgroundColor, requiredRatio)
                };
            }

            // Color blindness simulation
            if (this.config.colorBlindnessSimulation) {
                const colorBlindnessResults = this.colorBlindnessSimulator.analyzeColorPair(
                    foregroundColor,
                    backgroundColor
                );
                
                if (colorBlindnessResults.issues.length > 0) {
                    result.colorBlindnessIssues = colorBlindnessResults.issues.map((issue: any) => ({
                        id: `colorblind-${Date.now()}-${Math.random()}`,
                        element: element,
                        selector: this.generateSelector(element),
                        colorPair: { foreground: foregroundColor, background: backgroundColor },
                        affectedTypes: issue.affectedTypes,
                        severity: issue.severity,
                        description: issue.description
                    }));
                }
            }

            return result;
        } catch (error) {
            console.error('Error analyzing element:', error);
            return null;
        }
    }
    
    /**
     * Get elements to analyze
     */
    private getElementsToAnalyze(options: AnalysisOptions): HTMLElement[] {
        const selector = '*';
        const elements = document.querySelectorAll(selector);
        const elementsArray = Array.from(elements) as HTMLElement[];
        
        // Filter elements
        return elementsArray.filter(el => {
            // Skip certain elements
            if (['SCRIPT', 'STYLE', 'META', 'LINK', 'BR', 'HR'].includes(el.tagName)) {
                return false;
            }
            
            // Check if element has text content
            const hasText = el.textContent?.trim().length > 0;
            
            // Include images if configured
            const isImage = el.tagName === 'IMG';
            const includeImage = this.config.includeImages && isImage;
            
            return hasText || includeImage;
        }).slice(0, options.maxElements || 1000); // Limit for performance
    }
    
    /**
     * Get background color of element
     */
    private getBackgroundColor(element: HTMLElement): string | null {
        let el: HTMLElement | null = element;
        let backgroundColor = '';
        
        while (el) {
            const styles = window.getComputedStyle(el);
            const bg = styles.backgroundColor;
            
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                backgroundColor = bg;
                break;
            }
            
            el = el.parentElement;
        }
        
        // Default to white if no background found
        return backgroundColor || '#ffffff';
    }
    
    /**
     * Check if text is large
     */
    private isLargeText(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;
        
        // WCAG 2.1 criteria for large text
        return fontSize >= 18 || (fontSize >= 14 && isBold);
    }
    
    /**
     * Get required contrast ratio based on WCAG level
     */
    private getRequiredContrastRatio(isLargeText: boolean): number {
        const requirements: Record<string, { normal: number; large: number }> = {
            'A': { normal: 3, large: 3 },
            'AA': { normal: 4.5, large: 3 },
            'AAA': { normal: 7, large: 4.5 }
        };
        
        const level = this.config.wcagLevel;
        return isLargeText ? requirements[level].large : requirements[level].normal;
    }
    
    /**
     * Generate CSS selector for element
     */
    private generateSelector(element: HTMLElement): string {
        if (element.id) {
            return `#${element.id}`;
        }
        
        const path: string[] = [];
        let el: HTMLElement | null = element;
        
        while (el && el.tagName !== 'BODY') {
            let selector = el.tagName.toLowerCase();
            
            if (el.className) {
                selector += '.' + el.className.split(' ').join('.');
            }
            
            path.unshift(selector);
            el = el.parentElement;
        }
        
        return path.join(' > ');
    }
    
    /**
     * Generate color suggestion
     */
    private generateColorSuggestion(foreground: string, background: string, requiredRatio: number): ColorSuggestion {
        const suggestion = this.contrastCalculator.suggestColors(
            foreground,
            background,
            requiredRatio
        );
        
        return {
            foreground: suggestion.foreground,
            background: suggestion.background,
            contrastRatio: suggestion.contrastRatio,
            improvement: suggestion.contrastRatio - this.contrastCalculator.calculateContrastRatio(foreground, background)
        };
    }
    
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations(): Recommendation[] {
        const recommendations: Recommendation[] = [];
        
        // Contrast recommendations
        if (this.results.contrastIssues.length > 0) {
            const criticalCount = this.results.contrastIssues.filter(i => i.severity === 'critical').length;
            
            if (criticalCount > 0) {
                recommendations.push({
                    id: 'rec-contrast-critical',
                    type: 'contrast',
                    priority: 'high',
                    title: 'Fix Critical Contrast Issues',
                    description: `${criticalCount} elements have critically low contrast ratios that fail WCAG standards`,
                    affectedElements: this.results.contrastIssues
                        .filter(i => i.severity === 'critical')
                        .map(i => i.selector)
                        .slice(0, 5)
                });
            }
        }
        
        // Color blindness recommendations
        if (this.results.colorBlindnessIssues.length > 0) {
            recommendations.push({
                id: 'rec-colorblind',
                type: 'colorBlindness',
                priority: 'medium',
                title: 'Consider Color Blind Users',
                description: `${this.results.colorBlindnessIssues.length} color combinations may be problematic for color blind users`,
                affectedElements: this.results.colorBlindnessIssues
                    .map(i => i.selector)
                    .slice(0, 5),
                suggestedFix: {
                    type: 'pattern',
                    value: 'Use patterns or icons in addition to color',
                    cssProperty: 'background-pattern'
                }
            });
        }
        
        return recommendations;
    }
    
    /**
     * Generate statistics report
     */
    private generateStatisticsReport(): StatisticsReport {
        const totalContrast = this.results.contrastIssues.length;
        const colorBlindnessRisks = this.results.colorBlindnessIssues.length;
        
        return {
            timestamp: Date.now(),
            summary: {
                totalContrast: totalContrast,
                passedContrast: 0, // TODO: Track passed elements
                failedContrast: totalContrast,
                colorBlindnessSafe: 0, // TODO: Track safe combinations
                colorBlindnessRisks: colorBlindnessRisks
            },
            byLevel: {
                'A': this.results.contrastIssues.filter(i => i.wcagLevel === 'A').length,
                'AA': this.results.contrastIssues.filter(i => i.wcagLevel === 'AA').length,
                'AAA': this.results.contrastIssues.filter(i => i.wcagLevel === 'AAA').length
            },
            bySeverity: {
                'critical': this.results.contrastIssues.filter(i => i.severity === 'critical').length,
                'warning': this.results.contrastIssues.filter(i => i.severity === 'warning').length,
                'info': this.results.contrastIssues.filter(i => i.severity === 'info').length
            },
            byColorType: {
                'protanopia': this.results.colorBlindnessIssues.filter(i => 
                    i.affectedTypes.some(t => t.type === 'protanopia')
                ).length,
                'deuteranopia': this.results.colorBlindnessIssues.filter(i => 
                    i.affectedTypes.some(t => t.type === 'deuteranopia')
                ).length,
                'tritanopia': this.results.colorBlindnessIssues.filter(i => 
                    i.affectedTypes.some(t => t.type === 'tritanopia')
                ).length
            }
        };
    }
    
    /**
     * Start real-time monitoring
     */
    private startRealTimeMonitoring(): void {
        if (!this.config.realTimeAnalysis) return;
        
        this.state.realTimeEnabled = true;
        
        // Monitor style changes
        const observer = new MutationObserver((mutations) => {
            const hasRelevantChange = mutations.some(mutation => {
                return mutation.type === 'attributes' && 
                       (mutation.attributeName === 'style' || 
                        mutation.attributeName === 'class');
            });
            
            if (hasRelevantChange) {
                this.scheduleAnalysis();
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            subtree: true
        });
        
        console.log('Real-time color contrast monitoring started');
    }
    
    /**
     * Schedule analysis with debouncing
     */
    private scheduleAnalysis(): void {
        if (this.realTimeTimer) {
            clearTimeout(this.realTimeTimer);
        }
        
        this.realTimeTimer = window.setTimeout(() => {
            this.analyzeFullPage({ skipCache: true });
        }, 500);
    }
    
    /**
     * Handle style changes
     */
    private handleStyleChange(): void {
        this.scheduleAnalysis();
    }
    
    /**
     * Handle DOM changes
     */
    private handleDOMChange(): void {
        this.scheduleAnalysis();
    }
    
    /**
     * Handle window resize
     */
    private handleResize(): void {
        // Resize might affect text size calculations
        this.scheduleAnalysis();
    }
    
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics(analysisTime: number): void {
        this.performance.analysisCount++;
        this.performance.lastAnalysisTime = analysisTime;
        
        // Calculate running average
        const prevAvg = this.performance.averageAnalysisTime;
        const count = this.performance.analysisCount;
        this.performance.averageAnalysisTime = (prevAvg * (count - 1) + analysisTime) / count;
    }
    
    /**
     * Get current analysis results
     */
    getResults(): AnalysisResults {
        return { ...this.results };
    }
    
    /**
     * Get last analysis report
     */
    getLastReport(): AnalysisReport | null {
        return this.results.lastAnalysis;
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ColorContrastConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // Update sub-components
        if (this.contrastCalculator) {
            this.contrastCalculator.updateConfig({
                wcagLevel: this.config.wcagLevel
            });
        }
        
        if (this.colorAnalysisEngine) {
            this.colorAnalysisEngine.updateConfig({
                includeImages: this.config.includeImages,
                enableDetailedAnalysis: this.config.detailedReporting
            });
        }
        
        if (this.colorBlindnessSimulator) {
            this.colorBlindnessSimulator.updateConfig({
                enableSimulation: this.config.colorBlindnessSimulation
            });
        }
    }
    
    /**
     * Cleanup and destroy
     */
    destroy(): void {
        // Stop real-time monitoring
        this.state.realTimeEnabled = false;
        
        if (this.realTimeTimer) {
            clearTimeout(this.realTimeTimer);
        }
        
        // Cleanup sub-components
        this.contrastCalculator?.destroy();
        this.colorAnalysisEngine?.destroy();
        this.colorBlindnessSimulator?.destroy();
        
        console.log('ColorContrastAnalyzer destroyed');
    }
}