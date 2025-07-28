/**
 * ColorContrastAnalyzer - リアルタイム色コントラスト分析システム
 * WCAG準拠コントラスト比計算・色覚異常シミュレーション・改善提案
 * 包括的な視覚アクセシビリティ検証とレポート生成
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class ColorContrastAnalyzer {
    constructor(accessibilityManager) {
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
        
        // WCAGコントラスト基準
        this.wcagStandards = {
            A: {
                normalText: 3.0,
                largeText: 3.0
            },
            AA: {
                normalText: 4.5,
                largeText: 3.0
            },
            AAA: {
                normalText: 7.0,
                largeText: 4.5
            }
        };
        
        // 色覚異常シミュレーション設定
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
        
        // 分析結果
        this.results = {
            overall: {
                score: 0,
                totalElements: 0,
                passedElements: 0,
                failedElements: 0,
                warnings: 0,
                timestamp: null
            },
            contrastIssues: [],
            colorBlindnessIssues: [],
            recommendations: [],
            elementAnalysis: new Map(),
            statisticsReport: {
                averageContrast: 0,
                lowestContrast: 21,
                highestContrast: 0,
                colorPairs: new Map()
            }
        };
        
        // 色情報キャッシュ
        this.colorCache = new Map();
        
        // 監視システム
        this.monitoring = {
            enabled: false,
            mutationObserver: null,
            resizeObserver: null,
            animationFrameId: null,
            analysisQueue: [],
            throttleDelay: 100
        };
        
        // パフォーマンス指標
        this.performance = {
            analysisTime: [],
            elementsPerSecond: 0,
            cacheHitRate: 0,
            totalAnalyses: 0
        };
        
        // 統計情報
        this.stats = {
            totalAnalyses: 0,
            contrastIssuesFound: 0,
            colorBlindnessIssuesFound: 0,
            elementsAnalyzed: 0,
            cacheSize: 0,
            sessionStart: Date.now()
        };
        
        console.log('ColorContrastAnalyzer initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            this.setupRealtimeMonitoring();
            this.loadAnalysisHistory();
            this.bindEvents();
            
            // 初回分析の実行
            if (this.config.enabled) {
                setTimeout(() => this.runFullAnalysis(), 1000);
            }
            
            console.log('ColorContrastAnalyzer initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'COLOR_CONTRAST_ANALYZER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 包括的色コントラスト分析実行
     */
    async runFullAnalysis() {
        const startTime = performance.now();
        console.log('Starting comprehensive color contrast analysis...');
        
        try {
            this.results.overall.timestamp = new Date().toISOString();
            this.results.contrastIssues = [];
            this.results.colorBlindnessIssues = [];
            this.results.elementAnalysis.clear();
            
            // すべてのテキスト要素の分析
            const textElements = this.getTextElements();
            console.log(`Analyzing ${textElements.length} text elements...`);
            
            let passedCount = 0;
            let failedCount = 0;
            let warningsCount = 0;
            
            for (const element of textElements) {
                const analysis = await this.analyzeElementContrast(element);
                
                if (analysis) {
                    this.results.elementAnalysis.set(element, analysis);
                    
                    if (analysis.passed) {
                        passedCount++;
                    } else {
                        failedCount++;
                        this.results.contrastIssues.push(analysis);
                    }
                    
                    if (analysis.warnings.length > 0) {
                        warningsCount += analysis.warnings.length;
                    }
                }
            }
            
            // 色覚異常シミュレーション
            if (this.config.colorBlindnessSimulation) {
                await this.runColorBlindnessAnalysis();
            }
            
            // 統計レポートの生成
            this.generateStatisticsReport();
            
            // 推奨事項の生成
            this.generateRecommendations();
            
            // 結果の更新
            this.results.overall.totalElements = textElements.length;
            this.results.overall.passedElements = passedCount;
            this.results.overall.failedElements = failedCount;
            this.results.overall.warnings = warningsCount;
            this.results.overall.score = textElements.length > 0 ? 
                Math.round((passedCount / textElements.length) * 100) : 100;
            
            const endTime = performance.now();
            const analysisTime = endTime - startTime;
            this.performance.analysisTime.push(analysisTime);
            this.performance.elementsPerSecond = textElements.length / (analysisTime / 1000);
            this.stats.totalAnalyses++;
            
            console.log(`Color contrast analysis completed in ${analysisTime.toFixed(2)}ms`);
            console.log(`Overall contrast score: ${this.results.overall.score}%`);
            
            // イベント発火
            this.accessibilityManager?.eventSystem?.emit('colorContrastAnalysisCompleted', {
                results: this.results,
                analysisTime,
                elementsAnalyzed: textElements.length
            });
            
            return this.results;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'COLOR_CONTRAST_ANALYSIS_ERROR', {
                operation: 'runFullAnalysis'
            });
            return null;
        }
    }
    
    /**
     * 個別要素のコントラスト分析
     */
    async analyzeElementContrast(element) {
        try {
            const styles = window.getComputedStyle(element);
            const textContent = element.textContent?.trim();
            
            if (!textContent || textContent.length === 0) {
                return null;
            }
            
            // 色情報の取得
            const foregroundColor = this.parseColor(styles.color);
            const backgroundColor = this.getEffectiveBackgroundColor(element);
            
            if (!foregroundColor || !backgroundColor) {
                return null;
            }
            
            // コントラスト比の計算
            const contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);
            
            // テキストサイズとフォント重量の分析
            const fontSize = parseFloat(styles.fontSize);
            const fontWeight = this.parseFontWeight(styles.fontWeight);
            const isLargeText = this.isLargeText(fontSize, fontWeight);
            
            // WCAG基準の判定
            const wcagRequirement = this.getWcagRequirement(isLargeText);
            const passed = contrastRatio >= wcagRequirement;
            
            // 警告の生成
            const warnings = [];
            if (contrastRatio < wcagRequirement * 1.2) {
                warnings.push({
                    type: 'low-contrast-warning',
                    message: `コントラスト比が基準に近い値です: ${contrastRatio.toFixed(2)}:1`,
                    severity: 'warning'
                });
            }
            
            // 色覚異常での可視性チェック
            const colorBlindnessIssues = this.checkColorBlindnessVisibility(
                foregroundColor, backgroundColor, textContent
            );
            
            const analysis = {
                element,
                textContent: textContent.substring(0, 100), // 最初の100文字
                foregroundColor,
                backgroundColor,
                contrastRatio,
                isLargeText,
                wcagRequirement,
                passed,
                warnings,
                colorBlindnessIssues,
                fontSize,
                fontWeight,
                timestamp: Date.now()
            };
            
            // キャッシュに保存
            const cacheKey = this.generateCacheKey(foregroundColor, backgroundColor);
            this.colorCache.set(cacheKey, {
                contrastRatio,
                timestamp: Date.now()
            });
            
            return analysis;
            
        } catch (error) {
            console.warn('Element contrast analysis failed:', error);
            return null;
        }
    }
    
    /**
     * テキスト要素の取得
     */
    getTextElements() {
        const allElements = document.querySelectorAll('*');
        const textElements = [];
        
        for (const element of allElements) {
            const textContent = element.textContent?.trim();
            const hasChildren = element.children.length > 0;
            
            // テキストを含み、子要素がない要素、または直接のテキストノードを持つ要素
            if (textContent && textContent.length > 0) {
                const hasDirectTextNode = Array.from(element.childNodes).some(
                    node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                );
                
                if (!hasChildren || hasDirectTextNode) {
                    const styles = window.getComputedStyle(element);
                    
                    // 非表示要素を除外
                    if (styles.display !== 'none' && 
                        styles.visibility !== 'hidden' &&
                        styles.opacity !== '0') {
                        textElements.push(element);
                    }
                }
            }
        }
        
        return textElements;
    }
    
    /**
     * 色文字列の解析
     */
    parseColor(colorStr) {
        if (!colorStr || colorStr === 'transparent') return null;
        
        // キャッシュをチェック
        if (this.colorCache.has(colorStr)) {
            const cached = this.colorCache.get(colorStr);
            if (Date.now() - cached.timestamp < 300000) { // 5分キャッシュ
                return cached.color;
            }
        }
        
        let color = null;
        
        // rgb(), rgba()形式
        const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbaMatch) {
            color = {
                r: parseInt(rgbaMatch[1]),
                g: parseInt(rgbaMatch[2]),
                b: parseInt(rgbaMatch[3]),
                a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
            };
        }
        
        // 16進数形式
        const hexMatch = colorStr.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
        if (hexMatch) {
            const hex = hexMatch[1];
            if (hex.length === 3) {
                color = {
                    r: parseInt(hex[0] + hex[0], 16),
                    g: parseInt(hex[1] + hex[1], 16),
                    b: parseInt(hex[2] + hex[2], 16),
                    a: 1
                };
            } else {
                color = {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16),
                    a: 1
                };
            }
        }
        
        // HSL形式
        const hslMatch = colorStr.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
        if (hslMatch) {
            const h = parseInt(hslMatch[1]);
            const s = parseInt(hslMatch[2]) / 100;
            const l = parseInt(hslMatch[3]) / 100;
            const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
            color = this.hslToRgb(h, s, l, a);
        }
        
        // 名前付き色
        if (!color) {
            color = this.parseNamedColor(colorStr);
        }
        
        // キャッシュに保存
        if (color) {
            this.colorCache.set(colorStr, {
                color,
                timestamp: Date.now()
            });
        }
        
        return color;
    }
    
    /**
     * 効果的な背景色の取得
     */
    getEffectiveBackgroundColor(element) {
        let currentElement = element;
        let backgroundColor = null;
        
        // 親要素を遡って最初の不透明な背景色を見つける
        while (currentElement && currentElement !== document.body.parentElement) {
            const styles = window.getComputedStyle(currentElement);
            const bgColor = this.parseColor(styles.backgroundColor);
            
            if (bgColor && bgColor.a > 0) {
                if (!backgroundColor) {
                    backgroundColor = bgColor;
                } else {
                    // 透明度を考慮した色の合成
                    backgroundColor = this.blendColors(bgColor, backgroundColor);
                }
                
                if (bgColor.a >= 1.0) {
                    break; // 完全に不透明な背景が見つかった
                }
            }
            
            currentElement = currentElement.parentElement;
        }
        
        // デフォルト背景色（白）
        if (!backgroundColor) {
            backgroundColor = { r: 255, g: 255, b: 255, a: 1 };
        }
        
        return backgroundColor;
    }
    
    /**
     * 色の合成（アルファブレンディング）
     */
    blendColors(foreground, background) {
        const alpha = foreground.a;
        const invAlpha = 1 - alpha;
        
        return {
            r: Math.round(foreground.r * alpha + background.r * invAlpha),
            g: Math.round(foreground.g * alpha + background.g * invAlpha),
            b: Math.round(foreground.b * alpha + background.b * invAlpha),
            a: Math.min(1, foreground.a + background.a * invAlpha)
        };
    }
    
    /**
     * コントラスト比の計算
     */
    calculateContrastRatio(color1, color2) {
        const l1 = this.getRelativeLuminance(color1);
        const l2 = this.getRelativeLuminance(color2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    /**
     * 相対輝度の計算
     */
    getRelativeLuminance(color) {
        const { r, g, b } = color;
        
        const rsRGB = r / 255;
        const gsRGB = g / 255;
        const bsRGB = b / 255;
        
        const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    }
    
    /**
     * HSLからRGBへの変換
     */
    hslToRgb(h, s, l, a = 1) {
        h = h / 360;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a
        };
    }
    
    /**
     * 名前付き色の解析
     */
    parseNamedColor(colorName) {
        const namedColors = {
            'black': { r: 0, g: 0, b: 0, a: 1 },
            'white': { r: 255, g: 255, b: 255, a: 1 },
            'red': { r: 255, g: 0, b: 0, a: 1 },
            'green': { r: 0, g: 128, b: 0, a: 1 },
            'blue': { r: 0, g: 0, b: 255, a: 1 },
            'yellow': { r: 255, g: 255, b: 0, a: 1 },
            'cyan': { r: 0, g: 255, b: 255, a: 1 },
            'magenta': { r: 255, g: 0, b: 255, a: 1 },
            'gray': { r: 128, g: 128, b: 128, a: 1 },
            'grey': { r: 128, g: 128, b: 128, a: 1 }
        };
        
        return namedColors[colorName.toLowerCase()] || null;
    }
    
    /**
     * フォント重量の解析
     */
    parseFontWeight(fontWeight) {
        const weights = {
            'normal': 400,
            'bold': 700,
            'bolder': 800,
            'lighter': 300
        };
        
        return weights[fontWeight] || parseInt(fontWeight) || 400;
    }
    
    /**
     * 大きなテキストの判定
     */
    isLargeText(fontSize, fontWeight) {
        // 18px以上、または14px以上かつ太字
        return fontSize >= 18.5 || (fontSize >= 14 && fontWeight >= 700);
    }
    
    /**
     * WCAG要件の取得
     */
    getWcagRequirement(isLargeText) {
        const standard = this.wcagStandards[this.config.wcagLevel];
        return isLargeText ? standard.largeText : standard.normalText;
    }
    
    /**
     * キャッシュキーの生成
     */
    generateCacheKey(color1, color2) {
        return `${color1.r},${color1.g},${color1.b},${color1.a}-${color2.r},${color2.g},${color2.b},${color2.a}`;
    }
    
    /**
     * 色覚異常シミュレーション分析
     */
    async runColorBlindnessAnalysis() {
        console.log('Running color blindness simulation analysis...');
        
        for (const [element, analysis] of this.results.elementAnalysis) {
            if (!analysis.passed) continue; // 既に問題のある要素はスキップ
            
            for (const [type, config] of Object.entries(this.colorBlindnessTypes)) {
                const simulatedForeground = this.simulateColorBlindness(analysis.foregroundColor, config.matrix);
                const simulatedBackground = this.simulateColorBlindness(analysis.backgroundColor, config.matrix);
                
                const simulatedContrast = this.calculateContrastRatio(simulatedForeground, simulatedBackground);
                
                if (simulatedContrast < analysis.wcagRequirement) {
                    this.results.colorBlindnessIssues.push({
                        element,
                        colorBlindnessType: type,
                        typeName: config.name,
                        originalContrast: analysis.contrastRatio,
                        simulatedContrast,
                        requiredContrast: analysis.wcagRequirement,
                        severity: 'warning',
                        suggestion: `${config.name}の方には識別が困難な可能性があります`
                    });
                    
                    this.stats.colorBlindnessIssuesFound++;
                }
            }
        }
    }
    
    /**
     * 色覚異常シミュレーション
     */
    simulateColorBlindness(color, matrix) {
        const { r, g, b, a } = color;
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
     * 色覚異常での可視性チェック
     */
    checkColorBlindnessVisibility(foregroundColor, backgroundColor, textContent) {
        const issues = [];
        
        // 色に依存した情報の検出
        const colorDependentWords = ['赤', '緑', '青', '黄', '紫', 'red', 'green', 'blue', 'yellow', 'purple'];
        const hasColorDependentInfo = colorDependentWords.some(word => 
            textContent.toLowerCase().includes(word)
        );
        
        if (hasColorDependentInfo) {
            issues.push({
                type: 'color-dependent-info',
                message: '色に依存した情報が含まれています',
                severity: 'warning',
                suggestion: '色以外の方法（形、位置、テキスト）でも情報を伝達してください'
            });
        }
        
        // 色相の類似性チェック
        const foregroundHue = this.rgbToHsl(foregroundColor.r, foregroundColor.g, foregroundColor.b).h;
        const backgroundHue = this.rgbToHsl(backgroundColor.r, backgroundColor.g, backgroundColor.b).h;
        const hueDifference = Math.abs(foregroundHue - backgroundHue);
        
        if (hueDifference < 30 || hueDifference > 330) { // 色相が近い
            issues.push({
                type: 'similar-hue',
                message: '色相が類似しているため、色覚異常の方には識別が困難な可能性があります',
                severity: 'warning',
                suggestion: 'より対照的な色相を使用するか、明度差を大きくしてください'
            });
        }
        
        return issues;
    }
    
    /**
     * RGBからHSLへの変換
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    
    /**
     * 統計レポートの生成
     */
    generateStatisticsReport() {
        const contrasts = Array.from(this.results.elementAnalysis.values())
            .map(analysis => analysis.contrastRatio)
            .filter(ratio => !isNaN(ratio));
        
        if (contrasts.length > 0) {
            this.results.statisticsReport.averageContrast = 
                contrasts.reduce((sum, ratio) => sum + ratio, 0) / contrasts.length;
            this.results.statisticsReport.lowestContrast = Math.min(...contrasts);
            this.results.statisticsReport.highestContrast = Math.max(...contrasts);
        }
        
        // 色ペアの頻度分析
        const colorPairs = new Map();
        for (const analysis of this.results.elementAnalysis.values()) {
            const pairKey = this.generateCacheKey(analysis.foregroundColor, analysis.backgroundColor);
            const count = colorPairs.get(pairKey) || 0;
            colorPairs.set(pairKey, count + 1);
        }
        
        this.results.statisticsReport.colorPairs = colorPairs;
        this.stats.elementsAnalyzed = this.results.elementAnalysis.size;
    }
    
    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 低コントラスト問題
        if (this.results.contrastIssues.length > 0) {
            recommendations.push({
                category: 'Color Contrast',
                priority: 'high',
                title: 'コントラスト比の改善',
                description: `${this.results.contrastIssues.length}個の要素でコントラスト比が不十分です`,
                suggestions: [
                    'テキスト色を濃くする',
                    '背景色を薄くする',
                    'より対照的な色の組み合わせを使用する'
                ]
            });
        }
        
        // 色覚異常対応
        if (this.results.colorBlindnessIssues.length > 0) {
            recommendations.push({
                category: 'Color Blindness',
                priority: 'medium',
                title: '色覚異常への対応',
                description: `${this.results.colorBlindnessIssues.length}個の要素で色覚異常の方への配慮が必要です`,
                suggestions: [
                    '色以外の識別方法を併用する（形、パターン、位置）',
                    'より明度差の大きい色を使用する',
                    '色に依存した情報表現を避ける'
                ]
            });
        }
        
        // 平均コントラストが低い場合
        if (this.results.statisticsReport.averageContrast < 7.0) {
            recommendations.push({
                category: 'Overall Accessibility',
                priority: 'medium',
                title: '全体的なコントラストの向上',
                description: `平均コントラスト比: ${this.results.statisticsReport.averageContrast.toFixed(2)}:1`,
                suggestions: [
                    'デザインシステム全体でのコントラスト基準の見直し',
                    'カラーパレットの最適化',
                    'WCAG AAA基準（7:1）の採用を検討'
                ]
            });
        }
        
        this.results.recommendations = recommendations;
    }
    
    /**
     * リアルタイム監視の設定
     */
    setupRealtimeMonitoring() {
        if (!this.config.realTimeAnalysis) return;
        
        // DOM変更の監視
        this.monitoring.mutationObserver = new MutationObserver((mutations) => {
            let shouldAnalyze = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && 
                     ['style', 'class'].includes(mutation.attributeName))) {
                    shouldAnalyze = true;
                }
            });
            
            if (shouldAnalyze) {
                this.scheduleAnalysis();
            }
        });
        
        this.monitoring.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // ウィンドウリサイズの監視
        this.monitoring.resizeObserver = new ResizeObserver(() => {
            this.scheduleAnalysis();
        });
        
        this.monitoring.resizeObserver.observe(document.body);
        
        this.monitoring.enabled = true;
        console.log('Real-time color contrast monitoring enabled');
    }
    
    /**
     * 分析のスケジューリング
     */
    scheduleAnalysis() {
        if (this.monitoring.analysisTimeout) {
            clearTimeout(this.monitoring.analysisTimeout);
        }
        
        this.monitoring.analysisTimeout = setTimeout(() => {
            this.runQuickAnalysis();
        }, this.monitoring.throttleDelay);
    }
    
    /**
     * 簡易分析の実行
     */
    async runQuickAnalysis() {
        console.log('Running quick color contrast analysis...');
        
        // 最近変更された要素のみを分析
        const recentlyModified = document.querySelectorAll('[style], .recently-modified');
        
        for (const element of recentlyModified) {
            if (element.textContent?.trim()) {
                const analysis = await this.analyzeElementContrast(element);
                if (analysis && !analysis.passed) {
                    // 新しい問題が見つかった場合のみ通知
                    this.accessibilityManager?.eventSystem?.emit('contrastIssueDetected', {
                        element,
                        analysis,
                        timestamp: Date.now()
                    });
                }
            }
        }
    }
    
    /**
     * イベントバインディング
     */
    bindEvents() {
        // ページ読み込み完了後の分析
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.runFullAnalysis(), 1000);
            });
        }
        
        // ゲームイベントでの分析
        if (this.gameEngine) {
            this.gameEngine.addEventListener?.('sceneChanged', () => {
                setTimeout(() => this.runQuickAnalysis(), 500);
            });
        }
    }
    
    /**
     * 分析履歴の読み込み
     */
    loadAnalysisHistory() {
        try {
            const saved = localStorage.getItem('colorContrastAnalyzer_results');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(this.stats, data.stats || {});
            }
        } catch (error) {
            console.warn('Failed to load analysis history:', error);
        }
    }
    
    /**
     * 分析結果の保存
     */
    saveAnalysisResults() {
        try {
            const dataToSave = {
                stats: this.stats,
                cacheSize: this.colorCache.size,
                timestamp: Date.now()
            };
            
            localStorage.setItem('colorContrastAnalyzer_results', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save analysis results:', error);
        }
    }
    
    // パブリックAPI
    
    /**
     * WCAG レベルの設定
     */
    setWcagLevel(level) {
        if (['A', 'AA', 'AAA'].includes(level)) {
            this.config.wcagLevel = level;
            console.log(`WCAG level set to ${level}`);
            return true;
        }
        return false;
    }
    
    /**
     * リアルタイム分析の切り替え
     */
    toggleRealTimeAnalysis(enabled) {
        this.config.realTimeAnalysis = enabled;
        
        if (enabled && !this.monitoring.enabled) {
            this.setupRealtimeMonitoring();
        } else if (!enabled && this.monitoring.enabled) {
            this.monitoring.mutationObserver?.disconnect();
            this.monitoring.resizeObserver?.disconnect();
            this.monitoring.enabled = false;
        }
        
        console.log(`Real-time color contrast analysis ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 特定要素のコントラスト分析
     */
    async analyzeElement(element) {
        return await this.analyzeElementContrast(element);
    }
    
    /**
     * 色覚異常シミュレーション結果の取得
     */
    getColorBlindnessSimulation(type) {
        if (!this.colorBlindnessTypes[type]) {
            console.warn(`Unknown color blindness type: ${type}`);
            return null;
        }
        
        return this.results.colorBlindnessIssues.filter(issue => 
            issue.colorBlindnessType === type
        );
    }
    
    /**
     * 分析結果の取得
     */
    getAnalysisResults() {
        return {
            ...this.results,
            performance: this.performance,
            stats: this.stats
        };
    }
    
    /**
     * 詳細レポートの生成
     */
    generateDetailedReport() {
        const report = {
            summary: {
                overallScore: this.results.overall.score,
                totalElements: this.results.overall.totalElements,
                issuesFound: this.results.contrastIssues.length,
                averageContrast: this.results.statisticsReport.averageContrast,
                timestamp: this.results.overall.timestamp
            },
            contrastIssues: this.results.contrastIssues,
            colorBlindnessIssues: this.results.colorBlindnessIssues,
            recommendations: this.results.recommendations,
            statistics: this.results.statisticsReport,
            performance: this.performance
        };
        
        console.log('Color Contrast Analysis Report:', report);
        return report;
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.colorContrast) {
            Object.assign(this.config, config.colorContrast);
            
            if (config.colorContrast.realTimeAnalysis !== undefined) {
                this.toggleRealTimeAnalysis(config.colorContrast.realTimeAnalysis);
            }
        }
        
        console.log('ColorContrastAnalyzer configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        
        if (enabled) {
            this.runFullAnalysis();
        } else {
            this.toggleRealTimeAnalysis(false);
        }
        
        console.log(`ColorContrastAnalyzer ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying ColorContrastAnalyzer...');
        
        // 監視の停止
        if (this.monitoring.mutationObserver) {
            this.monitoring.mutationObserver.disconnect();
        }
        
        if (this.monitoring.resizeObserver) {
            this.monitoring.resizeObserver.disconnect();
        }
        
        if (this.monitoring.analysisTimeout) {
            clearTimeout(this.monitoring.analysisTimeout);
        }
        
        // 結果の保存
        this.saveAnalysisResults();
        
        // データのクリア
        this.results.elementAnalysis.clear();
        this.colorCache.clear();
        this.results.contrastIssues = [];
        this.results.colorBlindnessIssues = [];
        
        console.log('ColorContrastAnalyzer destroyed');
    }
}