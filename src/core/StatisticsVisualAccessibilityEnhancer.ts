// 型定義
interface ContrastConfig {
    enabled: boolean;
    level: 'normal' | 'high' | 'maximum';
    ratio: {
        normal: number;
        high: number;
        maximum: number;
    };
    backgroundColor: string;
    textColor: string;
    accentColor: string;
}

interface FontSizeConfig {
    enabled: boolean;
    scale: number;
    minSize: number;
    maxSize: number;
    lineHeight: number;
    letterSpacing: number;
}

interface ColorSupportConfig {
    enabled: boolean;
    colorBlindnessType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
    patternSupport: boolean;
    shapeSupport: boolean;
    symbolSupport: boolean;
    textureSupport: boolean;
}

interface MagnificationConfig {
    enabled: boolean;
    level: number;
    followFocus: boolean;
    smoothTransition: boolean;
    zoomArea: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface FocusConfig {
    enabled: boolean;
    thickness: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
    radius: number;
    offset: number;
    animation: boolean;
}

interface MotionConfig {
    reducedMotion: boolean;
    animationDuration: number;
    transitionDuration: number;
    parallaxDisabled: boolean;
    autoplayDisabled: boolean;
}

interface AccessibilityConfig {
    contrast: ContrastConfig;
    fontSize: FontSizeConfig;
    colorSupport: ColorSupportConfig;
    magnification: MagnificationConfig;
    focus: FocusConfig;
    motion: MotionConfig;
}

interface ColorPalette {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    grid: string;
}

/**
 * 統計表示視覚的アクセシビリティ強化クラス
 * ハイコントラスト、大きなフォント、色覚サポート、拡大表示機能を提供する
 */
export class StatisticsVisualAccessibilityEnhancer {
    private canvas: HTMLCanvasElement;
    private uiContainer: HTMLElement;
    private chartRenderer: any;
    private config: AccessibilityConfig;
    private colorPalettes: { [key: string]: ColorPalette };
    private patterns: { [key: string]: string };
    private symbols: { [key: string]: string };
    private cssVariables: Map<string, string>;
    private styleSheets: Map<string, any>;
    private dynamicStyleElement: HTMLStyleElement | null;
    private magnifierElement: HTMLElement | null;
    private focusIndicator: HTMLElement | null;

    constructor(canvas: HTMLCanvasElement, uiContainer: HTMLElement, chartRenderer: any) {
        this.canvas = canvas;
        this.uiContainer = uiContainer;
        this.chartRenderer = chartRenderer;
        
        // 視覚アクセシビリティ設定
        this.config = {
            contrast: {
                enabled: false,
                level: 'normal',
                ratio: {
                    normal: 4.5,
                    high: 7.0,
                    maximum: 21.0
                },
                backgroundColor: '#ffffff',
                textColor: '#000000',
                accentColor: '#0066cc'
            },
            fontSize: {
                enabled: false,
                scale: 1.0,
                minSize: 12,
                maxSize: 48,
                lineHeight: 1.4,
                letterSpacing: 0
            },
            colorSupport: {
                enabled: true,
                colorBlindnessType: 'none',
                patternSupport: true,
                shapeSupport: true,
                symbolSupport: true,
                textureSupport: true
            },
            magnification: {
                enabled: false,
                level: 1.0,
                followFocus: true,
                smoothTransition: true,
                zoomArea: { x: 0, y: 0, width: 200, height: 200 }
            },
            focus: {
                enabled: true,
                thickness: 3,
                color: '#4A90E2',
                style: 'solid',
                radius: 4,
                offset: 2,
                animation: true
            },
            motion: {
                reducedMotion: false,
                animationDuration: 300,
                transitionDuration: 200,
                parallaxDisabled: false,
                autoplayDisabled: false
            }
        };
        
        // カラーパレット管理
        this.colorPalettes = {
            normal: {
                primary: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
                secondary: ['#34495e', '#95a5a6', '#1abc9c', '#e67e22', '#8e44ad'],
                background: '#ffffff',
                text: '#2c3e50',
                grid: '#ecf0f1'
            },
            highContrast: {
                primary: ['#000000', '#ffffff', '#ffff00', '#ff00ff', '#00ffff'],
                secondary: ['#808080', '#c0c0c0', '#008000', '#800080', '#008080'],
                background: '#ffffff',
                text: '#000000',
                grid: '#808080'
            },
            protanopia: {
                primary: ['#1f4e79', '#8c2d04', '#2d5a27', '#b2670e', '#5d4e75'],
                secondary: ['#34495e', '#7f6a52', '#1a7e76', '#c7791f', '#7a4f74'],
                background: '#ffffff',
                text: '#2c3e50',
                grid: '#ecf0f1'
            },
            deuteranopia: {
                primary: ['#1f4e79', '#8c2d04', '#2d5a27', '#b2670e', '#5d4e75'],
                secondary: ['#34495e', '#7f6a52', '#1a7e76', '#c7791f', '#7a4f74'],
                background: '#ffffff',
                text: '#2c3e50',
                grid: '#ecf0f1'
            },
            tritanopia: {
                primary: ['#c41e3a', '#2ecc71', '#e67e22', '#8e44ad', '#1abc9c'],
                secondary: ['#7f8c8d', '#27ae60', '#d68910', '#7d3c98', '#148f77'],
                background: '#ffffff',
                text: '#2c3e50',
                grid: '#ecf0f1'
            },
            monochrome: {
                primary: ['#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'],
                secondary: ['#202020', '#606060', '#a0a0a0', '#e0e0e0', '#f8f8f8'],
                background: '#ffffff',
                text: '#000000',
                grid: '#d0d0d0'
            }
        };
        
        // パターンとシンボル定義
        this.patterns = {
            solid: 'solid',
            dots: 'dots',
            diagonal: 'diagonal',
            vertical: 'vertical',
            horizontal: 'horizontal',
            cross: 'cross',
            diamond: 'diamond',
            circle: 'circle'
        };

        this.symbols = {
            circle: '●',
            square: '■',
            triangle: '▲',
            diamond: '◆',
            star: '★',
            plus: '✚',
            cross: '✖',
            arrow: '➤'
        };
        
        // CSS変数とスタイル管理
        this.cssVariables = new Map();
        this.styleSheets = new Map();
        
        // 動的スタイル要素
        this.dynamicStyleElement = null;
        
        // 拡大鏡要素
        this.magnifierElement = null;
        
        // フォーカス表示要素
        this.focusIndicator = null;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void {
        this.detectSystemPreferences();
        this.createDynamicStyleElement();
        this.setupCSSVariables();
        this.createMagnifier();
        this.createFocusIndicator();
        this.applyInitialSettings();
        this.bindEvents();
    }
    
    /**
     * システム設定の検出
     */
    private detectSystemPreferences(): void {
        // ハイコントラストの検出
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.config.contrast.enabled = true;
            this.config.contrast.level = 'high';
        }
        
        // 大きなフォントサイズの検出
        if (window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches) {
            this.config.fontSize.enabled = true;
            this.config.fontSize.scale = 1.25;
        }
        
        // アニメーション削減の検出
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.config.motion.reducedMotion = true;
            this.config.motion.animationDuration = 0;
            this.config.motion.transitionDuration = 0;
        }
        
        // 色彩の検出
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.config.contrast.backgroundColor = '#000000';
            this.config.contrast.textColor = '#ffffff';
        }
    }
    
    /**
     * 動的スタイル要素の作成
     */
    private createDynamicStyleElement(): void {
        this.dynamicStyleElement = document.createElement('style');
        this.dynamicStyleElement.id = 'statistics-visual-accessibility';
        document.head.appendChild(this.dynamicStyleElement);
    }
    
    /**
     * CSS変数の設定
     */
    private setupCSSVariables(): void {
        this.cssVariables.set('--accessibility-font-scale', this.config.fontSize.scale.toString());
        this.cssVariables.set('--accessibility-line-height', this.config.fontSize.lineHeight.toString());
        this.cssVariables.set('--accessibility-letter-spacing', `${this.config.fontSize.letterSpacing}px`);
        this.cssVariables.set('--accessibility-focus-color', this.config.focus.color);
        this.cssVariables.set('--accessibility-focus-thickness', `${this.config.focus.thickness}px`);
        this.cssVariables.set('--accessibility-animation-duration', `${this.config.motion.animationDuration}ms`);
        this.cssVariables.set('--accessibility-transition-duration', `${this.config.motion.transitionDuration}ms`);
        
        // CSS変数をDOMに適用
        const root = document.documentElement;
        this.cssVariables.forEach((value, key) => {
            root.style.setProperty(key, value);
        });
    }
    
    /**
     * 拡大鏡の作成
     */
    private createMagnifier(): void {
        this.magnifierElement = document.createElement('div');
        this.magnifierElement.className = 'accessibility-magnifier';
        this.magnifierElement.style.cssText = `
            position: fixed;
            width: 200px;
            height: 200px;
            border: 2px solid #4A90E2;
            border-radius: 50%;
            background: white;
            pointer-events: none;
            z-index: 10000;
            display: none;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        const magnifierCanvas = document.createElement('canvas');
        magnifierCanvas.width = 200;
        magnifierCanvas.height = 200;
        magnifierCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            transform-origin: center;
        `;
        
        this.magnifierElement.appendChild(magnifierCanvas);
        document.body.appendChild(this.magnifierElement);
    }
    
    /**
     * フォーカス表示の作成
     */
    private createFocusIndicator(): void {
        this.focusIndicator = document.createElement('div');
        this.focusIndicator.className = 'accessibility-focus-indicator';
        this.focusIndicator.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 9999;
            display: none;
            border: ${this.config.focus.thickness}px ${this.config.focus.style} ${this.config.focus.color};
            border-radius: ${this.config.focus.radius}px;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.8), 0 0 8px rgba(74,144,226,0.4);
            transition: all var(--accessibility-transition-duration) ease;
        `;
        
        document.body.appendChild(this.focusIndicator);
    }
    
    /**
     * 初期設定の適用
     */
    private applyInitialSettings(): void {
        this.updateContrastSettings();
        this.updateFontSettings();
        this.updateColorSupport();
        this.updateMotionSettings();
        this.generateAccessibilityStyles();
    }
    
    /**
     * コントラスト設定の更新
     */
    private updateContrastSettings(): void {
        const palette = this.getCurrentColorPalette();
        this.cssVariables.set('--accessibility-bg-color', palette.background);
        this.cssVariables.set('--accessibility-text-color', palette.text);
        this.cssVariables.set('--accessibility-grid-color', palette.grid);
        
        // CSS変数の更新
        const root = document.documentElement;
        this.cssVariables.forEach((value, key) => {
            root.style.setProperty(key, value);
        });
        
        // body要素にクラス追加
        document.body.classList.toggle('high-contrast', this.config.contrast.enabled);
        document.body.classList.toggle('maximum-contrast', this.config.contrast.level === 'maximum');
    }
    
    /**
     * フォント設定の更新
     */
    private updateFontSettings(): void {
        this.cssVariables.set('--accessibility-font-scale', this.config.fontSize.scale.toString());
        this.cssVariables.set('--accessibility-line-height', this.config.fontSize.lineHeight.toString());
        this.cssVariables.set('--accessibility-letter-spacing', `${this.config.fontSize.letterSpacing}px`);
        
        const root = document.documentElement;
        this.cssVariables.forEach((value, key) => {
            root.style.setProperty(key, value);
        });

        document.body.classList.toggle('large-font', this.config.fontSize.enabled);
        document.body.classList.toggle('extra-large-font', this.config.fontSize.scale >= 1.5);
    }
    
    /**
     * 色覚サポートの更新
     */
    private updateColorSupport(): void {
        const colorBlindClasses = ['protanopia', 'deuteranopia', 'tritanopia', 'monochrome'];
        colorBlindClasses.forEach(cls => {
            document.body.classList.remove(cls);
        });

        if (this.config.colorSupport.colorBlindnessType !== 'none') {
            document.body.classList.add(this.config.colorSupport.colorBlindnessType);
        }
        
        // パターンサポートの適用
        document.body.classList.toggle('pattern-support', this.config.colorSupport.patternSupport);
        document.body.classList.toggle('shape-support', this.config.colorSupport.shapeSupport);
        document.body.classList.toggle('symbol-support', this.config.colorSupport.symbolSupport);
        document.body.classList.toggle('texture-support', this.config.colorSupport.textureSupport);
    }
    
    /**
     * モーション設定の更新
     */
    private updateMotionSettings(): void {
        this.cssVariables.set('--accessibility-animation-duration', `${this.config.motion.animationDuration}ms`);
        this.cssVariables.set('--accessibility-transition-duration', `${this.config.motion.transitionDuration}ms`);
        
        const root = document.documentElement;
        this.cssVariables.forEach((value, key) => {
            root.style.setProperty(key, value);
        });

        document.body.classList.toggle('reduced-motion', this.config.motion.reducedMotion);
        document.body.classList.toggle('no-parallax', this.config.motion.parallaxDisabled);
        document.body.classList.toggle('no-autoplay', this.config.motion.autoplayDisabled);
    }
    
    /**
     * 現在のカラーパレットの取得
     */
    private getCurrentColorPalette(): ColorPalette {
        if (this.config.contrast.enabled && this.config.contrast.level === 'high') {
            return this.colorPalettes.highContrast;
        }

        if (this.config.colorSupport.colorBlindnessType !== 'none') {
            return this.colorPalettes[this.config.colorSupport.colorBlindnessType] || this.colorPalettes.normal;
        }
        
        return this.colorPalettes.normal;
    }
    
    /**
     * アクセシビリティスタイルの生成
     */
    private generateAccessibilityStyles(): void {
        const styles = `
            /* ベーススタイル */
            .statistics-container {
                font-size: calc(1rem * var(--accessibility-font-scale));
                line-height: var(--accessibility-line-height);
                letter-spacing: var(--accessibility-letter-spacing);
                color: var(--accessibility-text-color);
                background-color: var(--accessibility-bg-color);
            }
            
            /* ハイコントラストモード */
            .high-contrast .statistics-text {
                color: #000000;
                background-color: #ffffff;
                font-weight: 600;
            }
            
            .high-contrast .statistics-border {
                border-color: #000000;
                border-width: 2px;
            }
            
            .maximum-contrast .statistics-text {
                color: #000000;
                background-color: #ffffff;
                font-weight: 700;
                text-shadow: 1px 1px 0 #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff;
            }
            
            /* 大きなフォント */
            .large-font .statistics-title {
                font-size: calc(1.5rem * var(--accessibility-font-scale));
            }
            
            .large-font .statistics-value {
                font-size: calc(2rem * var(--accessibility-font-scale));
                font-weight: 600;
            }
            
            .extra-large-font .statistics-container {
                padding: 24px;
            }
            
            .extra-large-font .statistics-spacing {
                margin: 16px 0;
            }
            
            /* フォーカス表示 */
            .focus-visible {
                outline: var(--accessibility-focus-thickness) solid var(--accessibility-focus-color);
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3);
            }
            
            .high-contrast .focus-visible {
                outline-color: #000000;
                background-color: #ffff00;
                color: #000000;
            }
            
            /* アニメーション削減 */
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            .reduced-motion .chart-animation {
                animation: none !important;
            }
            
            .reduced-motion .chart-transition {
                transition: none !important;
            }
            
            /* 拡大機能 */
            .magnification-enabled {
                cursor: zoom-in;
            }
            
            .magnification-active {
                cursor: zoom-out;
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .large-font .statistics-container {
                    font-size: calc(0.9rem * var(--accessibility-font-scale));
                }
                
                .extra-large-font .statistics-container {
                    padding: 16px;
                }
            }
            
            @media (max-width: 480px) {
                .large-font .statistics-value {
                    font-size: calc(1.5rem * var(--accessibility-font-scale));
                }
                
                .accessibility-magnifier {
                    width: 150px !important;
                    height: 150px !important;
                }
            }
        `;
        
        if (this.dynamicStyleElement) {
            this.dynamicStyleElement.textContent = styles;
        }
    }
    
    /**
     * イベントバインディング
     */
    private bindEvents(): void {
        // システム設定変更の監視
        if (window.matchMedia) {
            window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
                if (e.matches) {
                    this.enableHighContrast();
                } else {
                    this.disableHighContrast();
                }
            });

            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                this.config.motion.reducedMotion = e.matches;
                this.updateMotionSettings();
            });

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (e.matches) {
                    this.config.contrast.backgroundColor = '#000000';
                    this.config.contrast.textColor = '#ffffff';
                } else {
                    this.config.contrast.backgroundColor = '#ffffff';
                    this.config.contrast.textColor = '#000000';
                }
                this.updateContrastSettings();
            });
        }
        
        // 拡大機能のイベント
        if (this.config.magnification.enabled) {
            this.bindMagnificationEvents();
        }
        
        // フォーカス表示のイベント
        this.bindFocusEvents();
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    /**
     * 拡大機能のイベントバインディング
     */
    private bindMagnificationEvents(): void {
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', this.handleMagnifierMove.bind(this));
            this.canvas.addEventListener('mouseenter', this.showMagnifier.bind(this));
            this.canvas.addEventListener('mouseleave', this.hideMagnifier.bind(this));
            this.canvas.addEventListener('click', this.toggleMagnification.bind(this));
        }
    }
    
    /**
     * フォーカス表示のイベントバインディング
     */
    private bindFocusEvents(): void {
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
    }
    
    /**
     * キーダウンハンドラー
     */
    private handleKeyDown(event: KeyboardEvent): void {
        // アクセシビリティ機能のキーボードショートカット
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '+':
                case '=':
                    event.preventDefault();
                    this.increaseFontSize();
                    break;
                case '-':
                    event.preventDefault();
                    this.decreaseFontSize();
                    break;
                case '0':
                    event.preventDefault();
                    this.resetFontSize();
                    break;
                case 'h':
                    if (event.shiftKey) {
                        event.preventDefault();
                        this.toggleHighContrast();
                    }
                    break;
                case 'm':
                    if (event.shiftKey) {
                        event.preventDefault();
                        this.toggleMagnification();
                    }
                    break;
            }
        }
    }
    
    /**
     * 拡大鏡移動ハンドラー
     */
    private handleMagnifierMove(event: MouseEvent): void {
        if (!this.config.magnification.enabled || !this.magnifierElement) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 拡大鏡の位置を更新
        this.magnifierElement.style.left = `${event.clientX + 20}px`;
        this.magnifierElement.style.top = `${event.clientY - 120}px`;
        
        // 拡大鏡の内容を更新
        this.updateMagnifierContent(x, y);
    }
    
    /**
     * 拡大鏡の表示
     */
    private showMagnifier(): void {
        if (this.config.magnification.enabled && this.magnifierElement) {
            this.magnifierElement.style.display = 'block';
        }
    }
    
    /**
     * 拡大鏡の非表示
     */
    private hideMagnifier(): void {
        if (this.magnifierElement) {
            this.magnifierElement.style.display = 'none';
        }
    }
    
    /**
     * 拡大鏡の内容更新
     */
    private updateMagnifierContent(x: number, y: number): void {
        const magnifierCanvas = this.magnifierElement?.querySelector('canvas');
        if (!magnifierCanvas) return;

        const ctx = magnifierCanvas.getContext('2d');
        if (!ctx) return;

        const magnification = this.config.magnification.level;
        
        // 元のCanvasから画像データを取得
        const sourceX = Math.max(0, x - 50);
        const sourceY = Math.max(0, y - 50);
        const sourceWidth = Math.min(100, this.canvas.width - sourceX);
        const sourceHeight = Math.min(100, this.canvas.height - sourceY);
        
        try {
            const canvasContext = this.canvas.getContext('2d');
            if (!canvasContext) return;

            const imageData = canvasContext.getImageData(sourceX, sourceY, sourceWidth, sourceHeight);
            
            // 拡大して描画
            ctx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
            ctx.imageSmoothingEnabled = false;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = sourceWidth;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.putImageData(imageData, 0, 0);
                ctx.drawImage(
                    tempCanvas,
                    0, 0, sourceWidth, sourceHeight,
                    0, 0, magnifierCanvas.width, magnifierCanvas.height
                );
            }
            
            // 十字線を描画
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(magnifierCanvas.width / 2, 0);
            ctx.lineTo(magnifierCanvas.width / 2, magnifierCanvas.height);
            ctx.moveTo(0, magnifierCanvas.height / 2);
            ctx.lineTo(magnifierCanvas.width, magnifierCanvas.height / 2);
            ctx.stroke();
        } catch (error) {
            // Canvas読み取りエラーの場合（CORS等）
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('拡大表示', magnifierCanvas.width / 2, magnifierCanvas.height / 2);
        }
    }
    
    /**
     * 拡大モードの切り替え
     */
    private toggleMagnification(): void {
        this.config.magnification.enabled = !this.config.magnification.enabled;
        
        if (this.config.magnification.enabled) {
            this.bindMagnificationEvents();
            document.body.classList.add('magnification-enabled');
        } else {
            this.hideMagnifier();
            document.body.classList.remove('magnification-enabled');
        }
    }
    
    /**
     * フォーカスインハンドラー
     */
    private handleFocusIn(event: FocusEvent): void {
        if (!this.config.focus.enabled) return;
        
        const element = event.target as HTMLElement;
        this.showFocusIndicator(element);
    }
    
    /**
     * フォーカスアウトハンドラー
     */
    private handleFocusOut(): void {
        this.hideFocusIndicator();
    }
    
    /**
     * フォーカス表示の表示
     */
    private showFocusIndicator(element: HTMLElement): void {
        if (!this.focusIndicator) return;

        const rect = element.getBoundingClientRect();
        this.focusIndicator.style.display = 'block';
        this.focusIndicator.style.left = `${rect.left + window.scrollX - this.config.focus.offset}px`;
        this.focusIndicator.style.top = `${rect.top + window.scrollY - this.config.focus.offset}px`;
        this.focusIndicator.style.width = `${rect.width + (this.config.focus.offset * 2)}px`;
        this.focusIndicator.style.height = `${rect.height + (this.config.focus.offset * 2)}px`;

        if (this.config.focus.animation) {
            this.focusIndicator.style.animation = 'focus-pulse 1s ease-in-out infinite alternate';
        }
    }
    
    /**
     * フォーカス表示の非表示
     */
    private hideFocusIndicator(): void {
        if (this.focusIndicator) {
            this.focusIndicator.style.display = 'none';
            this.focusIndicator.style.animation = '';
        }
    }
    
    /**
     * ハイコントラストモードの有効化
     */
    private enableHighContrast(): void {
        this.config.contrast.level = 'high';
        this.updateContrastSettings();
        this.announceChange('ハイコントラストモードを有効にしました');
    }
    
    /**
     * ハイコントラストモードの無効化
     */
    private disableHighContrast(): void {
        this.config.contrast.level = 'normal';
        this.updateContrastSettings();
        this.announceChange('ハイコントラストモードを無効にしました');
    }
    
    /**
     * ハイコントラストモードの切り替え
     */
    private toggleHighContrast(): void {
        if (this.config.contrast.enabled) {
            this.disableHighContrast();
        } else {
            this.enableHighContrast();
        }
    }
    
    /**
     * フォントサイズの増加
     */
    private increaseFontSize(): void {
        this.config.fontSize.scale = Math.min(3.0, this.config.fontSize.scale + 0.1);
        this.config.fontSize.enabled = this.config.fontSize.scale > 1.0;
        this.updateFontSettings();
        this.announceChange(`フォントサイズを${Math.round(this.config.fontSize.scale * 100)}%に変更しました`);
    }
    
    /**
     * フォントサイズの減少
     */
    private decreaseFontSize(): void {
        this.config.fontSize.scale = Math.max(0.8, this.config.fontSize.scale - 0.1);
        this.config.fontSize.enabled = this.config.fontSize.scale !== 1.0;
        this.updateFontSettings();
        this.announceChange(`フォントサイズを${Math.round(this.config.fontSize.scale * 100)}%に変更しました`);
    }
    
    /**
     * フォントサイズのリセット
     */
    private resetFontSize(): void {
        this.config.fontSize.scale = 1.0;
        this.config.fontSize.enabled = false;
        this.updateFontSettings();
        this.announceChange('フォントサイズをリセットしました');
    }
    
    /**
     * 色覚サポートの設定
     */
    setColorBlindnessSupport(type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome'): void {
        this.config.colorSupport.colorBlindnessType = type;
        this.updateColorSupport();
        
        const typeNames: { [key: string]: string } = {
            'none': '通常',
            'protanopia': '第一色覚異常（プロタノピア）',
            'deuteranopia': '第二色覚異常（デューテラノピア）',
            'tritanopia': '第三色覚異常（トリタノピア）',
            'monochrome': 'モノクローム'
        };
        
        this.announceChange(`色覚サポートを${typeNames[type]}に設定しました`);
    }
    
    /**
     * チャートの色とパターンの適用
     */
    applyChartAccessibility(chartData: any): any {
        const palette = this.getCurrentColorPalette();
        const accessibleData = JSON.parse(JSON.stringify(chartData));
        
        // 色の適用
        if (accessibleData.datasets) {
            accessibleData.datasets.forEach((dataset: any, index: number) => {
                dataset.backgroundColor = palette.primary[index % palette.primary.length];
                dataset.borderColor = palette.primary[index % palette.primary.length];
                
                // パターンの適用
                if (this.config.colorSupport.patternSupport) {
                    dataset.pattern = this.getPatternForIndex(index);
                }
                
                // シンボルの適用
                if (this.config.colorSupport.symbolSupport) {
                    dataset.pointStyle = this.getSymbolForIndex(index);
                }
            });
        }
        
        return accessibleData;
    }
    
    /**
     * インデックスに対応したパターンの取得
     */
    private getPatternForIndex(index: number): string {
        const patterns = Object.keys(this.patterns);
        return patterns[index % patterns.length];
    }
    
    /**
     * インデックスに対応したシンボルの取得
     */
    private getSymbolForIndex(index: number): string {
        const symbols = Object.values(this.symbols);
        return symbols[index % symbols.length];
    }
    
    /**
     * 変更の通知
     */
    private announceChange(message: string): void {
        // スクリーンリーダー向けの通知
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
        
        // 音声合成による通知
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9;
            utterance.volume = 0.3;
            speechSynthesis.speak(utterance);
        }
    }
    
    /**
     * アクセシビリティ設定の取得
     */
    getAccessibilitySettings(): AccessibilityConfig {
        return {
            contrast: { ...this.config.contrast },
            fontSize: { ...this.config.fontSize },
            colorSupport: { ...this.config.colorSupport },
            magnification: { ...this.config.magnification },
            focus: { ...this.config.focus },
            motion: { ...this.config.motion }
        };
    }
    
    /**
     * アクセシビリティ設定の更新
     */
    updateAccessibilitySettings(newConfig: Partial<AccessibilityConfig>): void {
        Object.assign(this.config, newConfig);
        this.updateContrastSettings();
        this.updateFontSettings();
        this.updateColorSupport();
        this.updateMotionSettings();
        this.generateAccessibilityStyles();
        this.announceChange('アクセシビリティ設定を更新しました');
    }
    
    /**
     * アクセシビリティ統計の取得
     */
    getAccessibilityStatistics() {
        return {
            contrastEnabled: this.config.contrast.enabled,
            contrastLevel: this.config.contrast.level,
            fontScale: this.config.fontSize.scale,
            colorBlindnessSupport: this.config.colorSupport.colorBlindnessType,
            magnificationEnabled: this.config.magnification.enabled,
            reducedMotion: this.config.motion.reducedMotion,
            focusIndicatorEnabled: this.config.focus.enabled,
            patternSupportEnabled: this.config.colorSupport.patternSupport,
            symbolSupportEnabled: this.config.colorSupport.symbolSupport
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        // イベントリスナーの削除
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMagnifierMove);
            this.canvas.removeEventListener('mouseenter', this.showMagnifier);
            this.canvas.removeEventListener('mouseleave', this.hideMagnifier);
            this.canvas.removeEventListener('click', this.toggleMagnification);
        }

        document.removeEventListener('focusin', this.handleFocusIn);
        document.removeEventListener('focusout', this.handleFocusOut);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // DOM要素の削除
        if (this.dynamicStyleElement && this.dynamicStyleElement.parentNode) {
            this.dynamicStyleElement.parentNode.removeChild(this.dynamicStyleElement);
        }
        
        if (this.magnifierElement && this.magnifierElement.parentNode) {
            this.magnifierElement.parentNode.removeChild(this.magnifierElement);
        }
        
        if (this.focusIndicator && this.focusIndicator.parentNode) {
            this.focusIndicator.parentNode.removeChild(this.focusIndicator);
        }
        
        // CSS変数のクリア
        this.cssVariables.clear();
        this.styleSheets.clear();
    }
}