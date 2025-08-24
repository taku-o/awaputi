import { getErrorHandler } from '../utils/ErrorHandler';

/**
 * 色覚サポート設定インターフェース
 */
interface ColorBlindnessSupportConfig {
    enabled: boolean;
    colorBlindnessType: ColorBlindnessType;
    severity: 'mild' | 'moderate' | 'complete';
    enhancements: {
        patterns: boolean;
        shapes: boolean;
        textures: boolean;
        labels: boolean;
        borders: boolean;
        animations: boolean;
    };
    simulation: {
        enabled: boolean;
        type: ColorBlindnessType;
    };
}

/**
 * 色覚タイプ
 */
type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

/**
 * 色覚タイプ情報インターフェース
 */
interface ColorBlindnessTypeInfo {
    name: string;
    description: string;
    affectedColors: string[];
    prevalence: number;
    matrix: number[][];
}

/**
 * ビジュアルパターン情報インターフェース
 */
interface VisualPatternInfo {
    name: string;
    svg: string;
    description: string;
}

/**
 * ゲーム要素マッピングインターフェース
 */
interface GameElementMapping {
    pattern: string;
    shape: string;
    color: string;
}

/**
 * 要素拡張情報インターフェース
 */
interface ElementEnhancement {
    element: HTMLElement;
    type: string;
    originalStyle: {
        backgroundColor: string;
        border: string;
        backgroundImage: string;
    };
    appliedEnhancements: string[];
}

/**
 * ユーザー設定インターフェース
 */
interface UserPreferences {
    colorBlindnessType: ColorBlindnessType;
    preferredPatterns: string[];
    preferredShapes: string[];
    patternIntensity: 'low' | 'medium' | 'high';
    enableLabels: boolean;
    enableBorders: boolean;
    enableAnimations: boolean;
    customMappings: Map<string, GameElementMapping>;
}

/**
 * 統計情報インターフェース
 */
interface ColorBlindnessStats {
    elementsEnhanced: number;
    patternsApplied: number;
    shapesApplied: number;
    labelsAdded: number;
    detectionTime: number;
    sessionStart: number;
}

/**
 * 色覚サポートクラス
 * 色覚多様性に対応した包括的なビジュアル支援システム
 */
export class ColorBlindnessSupport {
    private visualAccessibilityManager: any;
    private accessibilityManager: any;
    private gameEngine: any;
    private config: ColorBlindnessSupportConfig;
    private colorBlindnessTypes: Record<ColorBlindnessType, ColorBlindnessTypeInfo>;
    private visualPatterns: Map<string, VisualPatternInfo>;
    private shapeEnhancements: Map<string, Record<string, string>>;
    private gameElementMapping: Map<string, GameElementMapping>;
    private enhancedElements: Map<HTMLElement, ElementEnhancement>;
    private patternElements: Set<HTMLElement>;
    private dynamicStyleSheet: HTMLStyleElement | null;
    private stats: ColorBlindnessStats;
    private userPreferences: UserPreferences;
    private domObserver: MutationObserver | null = null;

    constructor(visualAccessibilityManager: any) {
        this.visualAccessibilityManager = visualAccessibilityManager;
        this.accessibilityManager = visualAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // 色覚支援設定
        this.config = {
            enabled: false,
            colorBlindnessType: 'none',
            severity: 'complete',
            enhancements: {
                patterns: true,
                shapes: true,
                textures: true,
                labels: true,
                borders: true,
                animations: true
            },
            simulation: {
                enabled: false,
                type: 'protanopia'
            }
        };
        
        // 色覚タイプ定義
        this.colorBlindnessTypes = {
            none: {
                name: '通常視覚',
                description: '色覚支援なし',
                affectedColors: [],
                prevalence: 0,
                matrix: []
            },
            protanopia: {
                name: '1型色覚（プロタノピア）',
                description: '赤色の知覚が困難',
                affectedColors: ['red', 'green'],
                prevalence: 0.01,
                matrix: [
                    [0.567, 0.433, 0],
                    [0.558, 0.442, 0],
                    [0, 0.242, 0.758]
                ]
            },
            deuteranopia: {
                name: '2型色覚（デューテラノピア）',
                description: '緑色の知覚が困難',
                affectedColors: ['red', 'green'],
                prevalence: 0.01,
                matrix: [
                    [0.625, 0.375, 0],
                    [0.7, 0.3, 0],
                    [0, 0.3, 0.7]
                ]
            },
            tritanopia: {
                name: '3型色覚（トリタノピア）',
                description: '青色の知覚が困難',
                affectedColors: ['blue', 'yellow'],
                prevalence: 0.0001,
                matrix: [
                    [0.95, 0.05, 0],
                    [0, 0.433, 0.567],
                    [0, 0.475, 0.525]
                ]
            },
            achromatopsia: {
                name: '全色盲（アクロマトプシア）',
                description: 'すべての色の知覚が困難',
                affectedColors: ['all'],
                prevalence: 0.00003,
                matrix: [
                    [0.299, 0.587, 0.114],
                    [0.299, 0.587, 0.114],
                    [0.299, 0.587, 0.114]
                ]
            }
        };
        
        // パターン定義
        this.visualPatterns = new Map([
            ['dots', {
                name: 'ドット',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><circle cx="4" cy="4" r="2" fill="currentColor"/></svg>',
                description: '円形のドットパターン'
            }],
            ['stripes-horizontal', {
                name: '横縞',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect x="0" y="0" width="8" height="2" fill="currentColor"/><rect x="0" y="4" width="8" height="2" fill="currentColor"/></svg>',
                description: '水平方向の縞模様'
            }],
            ['stripes-vertical', {
                name: '縦縞',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect x="0" y="0" width="2" height="8" fill="currentColor"/><rect x="4" y="0" width="2" height="8" fill="currentColor"/></svg>',
                description: '垂直方向の縞模様'
            }],
            ['stripes-diagonal', {
                name: '斜め縞',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><path d="M0,8 L8,0 L8,2 L2,8 Z M0,6 L6,0 L8,0 L8,4 L4,8 L0,8 Z" fill="currentColor"/></svg>',
                description: '対角線方向の縞模様'
            }],
            ['checkerboard', {
                name: 'チェッカー',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect x="0" y="0" width="4" height="4" fill="currentColor"/><rect x="4" y="4" width="4" height="4" fill="currentColor"/></svg>',
                description: 'チェッカーボードパターン'
            }],
            ['crosshatch', {
                name: 'クロスハッチ',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><path d="M0,0 L8,8 M8,0 L0,8" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
                description: '交差するハッチングパターン'
            }],
            ['triangles', {
                name: '三角形',
                svg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><polygon points="4,1 7,7 1,7" fill="currentColor"/></svg>',
                description: '三角形パターン'
            }]
        ]);
        
        // 形状強化定義
        this.shapeEnhancements = new Map([
            ['circle', {
                border: '3px solid',
                padding: '2px'
            }],
            ['square', {
                border: '2px solid',
                'border-radius': '2px',
                padding: '2px'
            }],
            ['diamond', {
                'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                border: '2px solid'
            }],
            ['triangle', {
                'clip-path': 'polygon(50% 0%, 0% 100%, 100% 100%)',
                border: '2px solid'
            }],
            ['star', {
                'clip-path': 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                border: '2px solid'
            }],
            ['hexagon', {
                'clip-path': 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                border: '2px solid'
            }]
        ]);
        
        // ゲーム要素のマッピング
        this.gameElementMapping = new Map([
            ['bubble-normal', { pattern: 'dots', shape: 'circle', color: '#4a90e2' }],
            ['bubble-stone', { pattern: 'crosshatch', shape: 'square', color: '#666666' }],
            ['bubble-iron', { pattern: 'stripes-horizontal', shape: 'square', color: '#888888' }],
            ['bubble-diamond', { pattern: 'triangles', shape: 'diamond', color: '#e1e1e1' }],
            ['bubble-rainbow', { pattern: 'stripes-diagonal', shape: 'star', color: '#ff6b6b' }],
            ['bubble-pink', { pattern: 'dots', shape: 'hexagon', color: '#ff8cc8' }],
            ['bubble-clock', { pattern: 'checkerboard', shape: 'circle', color: '#ffd93d' }],
            ['bubble-electric', { pattern: 'stripes-vertical', shape: 'triangle', color: '#6bcf7f' }],
            ['bubble-poison', { pattern: 'crosshatch', shape: 'diamond', color: '#a855f7' }],
            ['bubble-spiky', { pattern: 'triangles', shape: 'star', color: '#f97316' }],
            ['bubble-escaping', { pattern: 'stripes-diagonal', shape: 'circle', color: '#06b6d4' }],
            ['bubble-boss', { pattern: 'checkerboard', shape: 'hexagon', color: '#dc2626' }],
            ['bubble-golden', { pattern: 'dots', shape: 'star', color: '#eab308' }],
            ['bubble-frozen', { pattern: 'stripes-horizontal', shape: 'hexagon', color: '#0ea5e9' }],
            ['bubble-magnetic', { pattern: 'crosshatch', shape: 'circle', color: '#7c3aed' }],
            ['bubble-explosive', { pattern: 'triangles', shape: 'diamond', color: '#ef4444' }],
            ['bubble-phantom', { pattern: 'stripes-vertical', shape: 'square', color: '#64748b' }],
            ['bubble-multiplier', { pattern: 'checkerboard', shape: 'triangle', color: '#10b981' }]
        ]);
        
        // 適用済み要素の管理
        this.enhancedElements = new Map();
        this.patternElements = new Set();
        this.dynamicStyleSheet = null;
        
        // 統計情報
        this.stats = {
            elementsEnhanced: 0,
            patternsApplied: 0,
            shapesApplied: 0,
            labelsAdded: 0,
            detectionTime: 0,
            sessionStart: Date.now()
        };
        
        // ユーザー設定
        this.userPreferences = {
            colorBlindnessType: 'none',
            preferredPatterns: ['dots', 'stripes-horizontal'],
            preferredShapes: ['circle', 'square'],
            patternIntensity: 'medium',
            enableLabels: true,
            enableBorders: true,
            enableAnimations: false,
            customMappings: new Map()
        };
        
        console.log('ColorBlindnessSupport initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void {
        try {
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // 動的スタイルシートの作成
            this.createDynamicStyleSheet();
            
            // パターンの生成
            this.generatePatterns();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 自動検出の実行
            this.performAutoDetection();
            
            console.log('ColorBlindnessSupport initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error as Error, {
                context: 'ColorBlindnessSupport.initialize',
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ユーザー設定の読み込み
     */
    private loadUserPreferences(): void {
        try {
            const saved = localStorage.getItem('colorBlindnessSupport_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // カスタムマッピングの復元
                if (preferences.customMappings) {
                    this.userPreferences.customMappings = new Map(preferences.customMappings);
                }
                
                // 設定を適用
                if (this.userPreferences.colorBlindnessType !== 'none') {
                    this.config.enabled = true;
                    this.config.colorBlindnessType = this.userPreferences.colorBlindnessType;
                }
            }
        } catch (error) {
            console.warn('Failed to load color blindness support preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    private saveUserPreferences(): void {
        try {
            const preferences = {
                ...this.userPreferences,
                customMappings: Array.from(this.userPreferences.customMappings.entries())
            };
            
            localStorage.setItem('colorBlindnessSupport_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save color blindness support preferences:', error);
        }
    }
    
    /**
     * 動的スタイルシートの作成
     */
    private createDynamicStyleSheet(): void {
        this.dynamicStyleSheet = document.createElement('style');
        this.dynamicStyleSheet.id = 'color-blindness-support-styles';
        this.dynamicStyleSheet.textContent = `
            /* 色覚サポートの基本スタイル */
            .color-blind-support {
                --pattern-opacity: 0.7;
                --border-width: 2px;
                --label-bg: rgba(0, 0, 0, 0.8);
                --label-color: white;
            }
            
            /* パターン適用要素 */
            .cb-pattern {
                position: relative;
                background-blend-mode: overlay;
            }
            
            .cb-pattern::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: var(--pattern-opacity);
                pointer-events: none;
                z-index: 1;
            }
            
            /* 形状強化 */
            .cb-shape-enhanced {
                position: relative;
                border-width: var(--border-width);
                border-style: solid;
                border-color: currentColor;
            }
            
            /* ラベル */
            .cb-label {
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--label-bg);
                color: var(--label-color);
                font-size: 10px;
                font-weight: bold;
                padding: 2px 4px;
                border-radius: 2px;
                white-space: nowrap;
                z-index: 10;
                pointer-events: none;
            }
            
            /* アニメーション効果 */
            .cb-animated {
                animation: colorBlindPulse 2s infinite ease-in-out;
            }
            
            @keyframes colorBlindPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            /* 特定のゲーム要素用スタイル */
            .bubble.cb-enhanced {
                stroke-width: 3px;
                stroke-dasharray: 4,2;
            }
            
            .game-ui.cb-enhanced {
                border: 2px solid currentColor;
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
            }
            
            /* デバッグ用シミュレーション */
            .cb-simulation-active {
                filter: var(--colorblind-filter);
            }
            
            /* 高コントラストモードとの統合 */
            .high-contrast .cb-pattern::before {
                opacity: 1;
            }
            
            .high-contrast .cb-label {
                background: #000;
                color: #fff;
                border: 1px solid #fff;
            }
        `;
        document.head.appendChild(this.dynamicStyleSheet);
    }
    
    /**
     * パターンの生成
     */
    private generatePatterns(): void {
        for (const [patternName, pattern] of this.visualPatterns) {
            this.createPatternStyle(patternName, pattern);
        }
        console.log('Visual patterns generated');
    }
    
    /**
     * パターンスタイルの作成
     */
    private createPatternStyle(patternName: string, pattern: VisualPatternInfo): void {
        if (!this.dynamicStyleSheet) return;
        
        const className = `cb-pattern-${patternName}`;
        const rule = `
            .${className}::before {
                background-image: url("${pattern.svg}");
                background-repeat: repeat;
                background-size: 8px 8px;
            }
        `;
        
        this.dynamicStyleSheet.textContent += rule;
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // DOM変更の監視
        this.observeDOM();
        
        // ゲーム状態変更の監視
        if (this.gameEngine) {
            this.gameEngine.addEventListener?.('bubbleSpawned', (event: any) => {
                this.enhanceGameElement(event.bubble);
            });
            
            this.gameEngine.addEventListener?.('sceneChanged', (event: any) => {
                this.enhanceSceneElements(event.newScene);
            });
        }
    }
    
    /**
     * DOM変更の監視
     */
    private observeDOM(): void {
        this.domObserver = new MutationObserver((mutations) => {
            if (!this.config.enabled) return;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.analyzeAndEnhanceElement(node as HTMLElement);
                        }
                    });
                }
            });
        });
        
        this.domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 自動検出の実行
     */
    private performAutoDetection(): void {
        const startTime = performance.now();
        try {
            // システム設定の確認
            this.checkSystemSettings();
        } catch (error) {
            console.warn('Auto-detection failed:', error);
        } finally {
            this.stats.detectionTime = performance.now() - startTime;
        }
    }
    
    /**
     * システム設定の確認
     */
    private checkSystemSettings(): void {
        // ブラウザやOSの設定を確認
        if (window.matchMedia) {
            // forced-colors（ハイコントラストモード）の場合は色覚支援も有効化
            const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
            if (forcedColorsQuery.matches) {
                console.log('Forced colors detected, enabling color blindness support');
                this.enable('deuteranopia'); // 最も一般的なタイプを設定
            }
        }
    }
    
    /**
     * 要素の分析と強化
     */
    private analyzeAndEnhanceElement(element: HTMLElement): void {
        if (this.enhancedElements.has(element)) {
            return; // 既に処理済み
        }
        
        const elementType = this.determineElementType(element);
        if (elementType) {
            this.enhanceElement(element, elementType);
        }
    }
    
    /**
     * 要素タイプの判定
     */
    private determineElementType(element: HTMLElement): string | null {
        // クラス名による判定
        for (const className of element.classList) {
            if (className.startsWith('bubble-')) {
                return className;
            }
        }
        
        // タグ名による判定
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'canvas' && element.classList.contains('game-canvas')) {
            return 'game-canvas';
        }
        
        // データ属性による判定
        const colorRole = element.getAttribute('data-color-role');
        if (colorRole) {
            return colorRole;
        }
        
        return null;
    }
    
    /**
     * 要素の強化
     */
    private enhanceElement(element: HTMLElement, elementType: string): void {
        const mapping = this.gameElementMapping.get(elementType) || 
                       this.userPreferences.customMappings.get(elementType);
        
        if (!mapping) {
            return;
        }
        
        const enhancement: ElementEnhancement = {
            element,
            type: elementType,
            originalStyle: {
                backgroundColor: element.style.backgroundColor,
                border: element.style.border,
                backgroundImage: element.style.backgroundImage
            },
            appliedEnhancements: []
        };
        
        // パターンの適用
        if (this.config.enhancements.patterns && mapping.pattern) {
            this.applyPattern(element, mapping.pattern);
            enhancement.appliedEnhancements.push('pattern');
            this.stats.patternsApplied++;
        }
        
        // 形状の適用
        if (this.config.enhancements.shapes && mapping.shape) {
            this.applyShape(element, mapping.shape);
            enhancement.appliedEnhancements.push('shape');
            this.stats.shapesApplied++;
        }
        
        // ボーダーの適用
        if (this.config.enhancements.borders) {
            this.applyBorder(element);
            enhancement.appliedEnhancements.push('border');
        }
        
        // ラベルの適用
        if (this.config.enhancements.labels && this.userPreferences.enableLabels) {
            this.applyLabel(element, elementType);
            enhancement.appliedEnhancements.push('label');
            this.stats.labelsAdded++;
        }
        
        // アニメーションの適用
        if (this.config.enhancements.animations && this.userPreferences.enableAnimations) {
            this.applyAnimation(element);
            enhancement.appliedEnhancements.push('animation');
        }
        
        this.enhancedElements.set(element, enhancement);
        this.stats.elementsEnhanced++;
    }
    
    /**
     * パターンの適用
     */
    private applyPattern(element: HTMLElement, patternName: string): void {
        element.classList.add('cb-pattern', `cb-pattern-${patternName}`);
        this.patternElements.add(element);
    }
    
    /**
     * 形状の適用
     */
    private applyShape(element: HTMLElement, shapeName: string): void {
        const shapeEnhancement = this.shapeEnhancements.get(shapeName);
        if (shapeEnhancement) {
            element.classList.add('cb-shape-enhanced');
            Object.entries(shapeEnhancement).forEach(([property, value]) => {
                element.style.setProperty(property, value);
            });
        }
    }
    
    /**
     * ボーダーの適用
     */
    private applyBorder(element: HTMLElement): void {
        if (!element.style.border) {
            element.style.border = '2px solid currentColor';
        }
    }
    
    /**
     * ラベルの適用
     */
    private applyLabel(element: HTMLElement, elementType: string): void {
        const label = document.createElement('div');
        label.className = 'cb-label';
        label.textContent = this.getLabelText(elementType);
        label.setAttribute('aria-hidden', 'true');
        
        // 相対位置指定が必要
        if (window.getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(label);
    }
    
    /**
     * ラベルテキストの取得
     */
    private getLabelText(elementType: string): string {
        const labelMap: Record<string, string> = {
            'bubble-normal': '通常',
            'bubble-stone': '石',
            'bubble-iron': '鉄',
            'bubble-diamond': 'ダイヤ',
            'bubble-rainbow': '虹',
            'bubble-pink': 'ピンク',
            'bubble-clock': '時計',
            'bubble-electric': '電気',
            'bubble-poison': '毒',
            'bubble-spiky': 'トゲ',
            'bubble-escaping': '逃避',
            'bubble-boss': 'ボス',
            'bubble-golden': '金',
            'bubble-frozen': '氷',
            'bubble-magnetic': '磁石',
            'bubble-explosive': '爆発',
            'bubble-phantom': 'ファントム',
            'bubble-multiplier': '倍率'
        };
        
        return labelMap[elementType] || elementType;
    }
    
    /**
     * アニメーションの適用
     */
    private applyAnimation(element: HTMLElement): void {
        element.classList.add('cb-animated');
    }
    
    /**
     * ゲーム要素の強化
     */
    private enhanceGameElement(element: HTMLElement): void {
        if (!this.config.enabled) return;
        
        this.analyzeAndEnhanceElement(element);
    }
    
    /**
     * シーン要素の強化
     */
    private enhanceSceneElements(scene: any): void {
        if (!this.config.enabled) return;
        
        // シーン内のすべての要素を強化
        const elements = scene.container?.querySelectorAll('*') || [];
        elements.forEach((element: HTMLElement) => {
            this.analyzeAndEnhanceElement(element);
        });
    }
    
    /**
     * 色覚シミュレーションの適用
     */
    applyColorBlindnessSimulation(type: ColorBlindnessType): void {
        const cbType = this.colorBlindnessTypes[type];
        if (!cbType || type === 'none') return;
        
        // SVGフィルターを作成
        const filterId = `colorblind-filter-${type}`;
        let svgFilter = document.getElementById(filterId) as SVGElement;
        
        if (!svgFilter) {
            svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
            svgFilter.id = filterId;
            svgFilter.style.cssText = 'position: absolute; width: 0; height: 0;';
            svgFilter.innerHTML = `
                <defs>
                    <filter id="${filterId}">
                        <feColorMatrix type="matrix" values="${cbType.matrix.flat().join(' ')}"/>
                    </filter>
                </defs>
            `;
            document.body.appendChild(svgFilter);
        }
        
        // フィルターを適用
        const root = document.documentElement;
        root.style.setProperty('--colorblind-filter', `url(#${filterId})`);
        document.body.classList.add('cb-simulation-active');
        
        this.config.simulation.enabled = true;
        this.config.simulation.type = type;
        
        console.log(`Color blindness simulation applied: ${cbType.name}`);
    }
    
    /**
     * シミュレーションの削除
     */
    removeColorBlindnessSimulation(): void {
        document.body.classList.remove('cb-simulation-active');
        document.documentElement.style.removeProperty('--colorblind-filter');
        
        this.config.simulation.enabled = false;
        
        console.log('Color blindness simulation removed');
    }
    
    // パブリックAPI
    
    /**
     * 色覚サポートの有効化
     */
    enable(colorBlindnessType: ColorBlindnessType = 'deuteranopia'): void {
        if (!this.colorBlindnessTypes[colorBlindnessType]) {
            console.warn(`Unknown color blindness type: ${colorBlindnessType}`);
            return;
        }
        
        this.config.enabled = true;
        this.config.colorBlindnessType = colorBlindnessType;
        this.userPreferences.colorBlindnessType = colorBlindnessType;
        
        document.body.classList.add('color-blind-support');
        
        // 既存の要素を強化
        this.enhanceAllElements();
        
        this.saveUserPreferences();
        console.log(`Color blindness support enabled: ${this.colorBlindnessTypes[colorBlindnessType].name}`);
    }
    
    /**
     * 色覚サポートの無効化
     */
    disable(): void {
        this.config.enabled = false;
        this.userPreferences.colorBlindnessType = 'none';
        
        document.body.classList.remove('color-blind-support');
        
        // 強化を削除
        this.removeAllEnhancements();
        
        // シミュレーションも削除
        this.removeColorBlindnessSimulation();
        
        this.saveUserPreferences();
        console.log('Color blindness support disabled');
    }
    
    /**
     * すべての要素の強化
     */
    private enhanceAllElements(): void {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            this.analyzeAndEnhanceElement(element as HTMLElement);
        });
    }
    
    /**
     * すべての強化を削除
     */
    private removeAllEnhancements(): void {
        for (const [element, enhancement] of this.enhancedElements) {
            // クラスを削除
            element.classList.remove('cb-pattern', 'cb-shape-enhanced', 'cb-animated');
            
            // パターンクラスを削除
            for (const patternName of this.visualPatterns.keys()) {
                element.classList.remove(`cb-pattern-${patternName}`);
            }
            
            // 元のスタイルを復元
            Object.entries(enhancement.originalStyle).forEach(([property, value]) => {
                if (value) {
                    (element.style as any)[property] = value;
                } else {
                    element.style.removeProperty(property);
                }
            });
            
            // ラベルを削除
            const labels = element.querySelectorAll('.cb-label');
            labels.forEach(label => label.remove());
        }
        
        this.enhancedElements.clear();
        this.patternElements.clear();
    }
    
    /**
     * カスタムマッピングの追加
     */
    addCustomMapping(elementType: string, mapping: GameElementMapping): void {
        this.userPreferences.customMappings.set(elementType, mapping);
        this.saveUserPreferences();
        console.log(`Custom mapping added for ${elementType}:`, mapping);
    }
    
    /**
     * 利用可能な色覚タイプの取得
     */
    getAvailableTypes(): Array<{
        key: string;
        name: string;
        description: string;
        prevalence: number;
    }> {
        return Object.entries(this.colorBlindnessTypes)
            .filter(([key]) => key !== 'none')
            .map(([key, type]) => ({
                key,
                name: type.name,
                description: type.description,
                prevalence: type.prevalence
            }));
    }
    
    /**
     * 利用可能なパターンの取得
     */
    getAvailablePatterns(): Array<{
        key: string;
        name: string;
        description: string;
    }> {
        return Array.from(this.visualPatterns.entries()).map(([key, pattern]) => ({
            key,
            name: pattern.name,
            description: pattern.description
        }));
    }
    
    /**
     * 利用可能な形状の取得
     */
    getAvailableShapes(): string[] {
        return Array.from(this.shapeEnhancements.keys());
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config: any): void {
        if (config.visual?.colorBlindness) {
            Object.assign(this.config, config.visual.colorBlindness);
        }
        console.log('ColorBlindnessSupport configuration applied');
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo(): any {
        return {
            enabled: this.config.enabled,
            type: this.config.colorBlindnessType,
            enhancedElements: this.enhancedElements.size,
            patternElements: this.patternElements.size,
            availablePatterns: this.visualPatterns.size,
            availableShapes: this.shapeEnhancements.size,
            stats: this.stats,
            simulation: this.config.simulation
        };
    }
    
    /**
     * レポートの生成
     */
    generateReport(): any {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return {
            timestamp: new Date().toISOString(),
            configuration: {
                enabled: this.config.enabled,
                type: this.config.colorBlindnessType,
                enhancements: this.config.enhancements
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                enhancementRate: this.stats.elementsEnhanced / (sessionDuration / 1000)
            },
            userPreferences: {
                ...this.userPreferences,
                customMappings: Array.from(this.userPreferences.customMappings.entries())
            },
            elements: {
                enhanced: this.enhancedElements.size,
                patterns: this.patternElements.size
            }
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void {
        if (enabled) {
            this.enable(this.userPreferences.colorBlindnessType || 'deuteranopia');
        } else {
            this.disable();
        }
        console.log(`ColorBlindnessSupport ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        console.log('Destroying ColorBlindnessSupport...');
        
        // 色覚サポートを無効化
        this.disable();
        
        // DOM監視の停止
        if (this.domObserver) {
            this.domObserver.disconnect();
        }
        
        // スタイルシートの削除
        if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) {
            this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet);
        }
        
        // SVGフィルターの削除
        const filters = document.querySelectorAll('svg[id^="colorblind-filter-"]');
        filters.forEach(filter => filter.remove());
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.enhancedElements.clear();
        this.patternElements.clear();
        this.gameElementMapping.clear();
        this.visualPatterns.clear();
        this.shapeEnhancements.clear();
        
        console.log('ColorBlindnessSupport destroyed');
    }
}