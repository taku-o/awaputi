import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * コントラスト管理クラス
 * WCAG AAA準拠の動的コントラスト調整とカスタムカラースキーム管理
 */
export class ContrastManager {
    constructor(visualAccessibilityManager) {
        this.visualAccessibilityManager = visualAccessibilityManager;
        this.accessibilityManager = visualAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // コントラスト設定
        this.config = {
            enabled: false,
            level: 'aa', // 'aa', 'aaa'
            autoDetection: true,
            realTimeValidation: true,
            customSchemes: {
                enabled: true,
                userDefined: new Map(),
                presets: new Map()
            },
            thresholds: {
                aa: {
                    normal: 4.5,    // WCAG AA normal text
                    large: 3.0      // WCAG AA large text (18pt+ or 14pt+ bold)
                },
                aaa: {
                    normal: 7.0,    // WCAG AAA normal text
                    large: 4.5      // WCAG AAA large text
                }
            },
            enhancement: {
                shadowSupport: true,
                outlineSupport: true,
                backgroundBlur: true,
                gradientSupport: false // 複雑なグラデーションを無効化
            }
        };
        
        // カラーパレット
        this.colorPalettes = new Map([
            ['high-contrast-dark', {
                name: 'ハイコントラスト（ダーク）',
                background: '#000000',
                surface: '#1a1a1a',
                primary: '#ffffff',
                secondary: '#ffff00',
                accent: '#00ff00',
                error: '#ff0000',
                warning: '#ff8800',
                success: '#00ff00',
                text: {
                    primary: '#ffffff',
                    secondary: '#ffff00',
                    disabled: '#888888'
                },
                game: {
                    bubble: {
                        normal: '#ffffff',
                        special: '#ffff00',
                        dangerous: '#ff0000',
                        bonus: '#00ff00'
                    },
                    ui: {
                        score: '#ffffff',
                        timer: '#ffff00',
                        hp: '#ff0000'
                    }
                }
            }],
            ['high-contrast-light', {
                name: 'ハイコントラスト（ライト）',
                background: '#ffffff',
                surface: '#f5f5f5',
                primary: '#000000',
                secondary: '#0000ff',
                accent: '#800080',
                error: '#cc0000',
                warning: '#cc6600',
                success: '#006600',
                text: {
                    primary: '#000000',
                    secondary: '#0000ff',
                    disabled: '#666666'
                },
                game: {
                    bubble: {
                        normal: '#000000',
                        special: '#0000ff',
                        dangerous: '#cc0000',
                        bonus: '#006600'
                    },
                    ui: {
                        score: '#000000',
                        timer: '#0000ff',
                        hp: '#cc0000'
                    }
                }
            }],
            ['enhanced-contrast', {
                name: '強化コントラスト',
                background: '#1e1e1e',
                surface: '#2d2d2d',
                primary: '#e1e1e1',
                secondary: '#4dabf7',
                accent: '#69db7c',
                error: '#ff6b6b',
                warning: '#ffd43b',
                success: '#51cf66',
                text: {
                    primary: '#f8f9fa',
                    secondary: '#ced4da',
                    disabled: '#868e96'
                },
                game: {
                    bubble: {
                        normal: '#e1e1e1',
                        special: '#4dabf7',
                        dangerous: '#ff6b6b',
                        bonus: '#51cf66'
                    },
                    ui: {
                        score: '#f8f9fa',
                        timer: '#ffd43b',
                        hp: '#ff6b6b'
                    }
                }
            }]
        ]);
        
        // 現在のスキーム
        this.currentScheme = null;
        this.originalStyles = new Map();
        this.appliedElements = new Set();
        
        // コントラスト計算キャッシュ
        this.contrastCache = new Map();
        this.validationResults = new Map();
        
        // CSS変数とセレクター
        this.cssVariables = new Map();
        this.dynamicStyleSheet = null;
        
        // 統計情報
        this.stats = {
            validationChecks: 0,
            violationsFound: 0,
            violationsFixed: 0,
            schemeChanges: 0,
            elementsModified: 0,
            sessionStart: Date.now()
        };
        
        // ユーザー設定
        this.userPreferences = {
            preferredScheme: 'auto',
            contrastLevel: 'aa',
            autoEnhancement: true,
            customColors: new Map(),
            enableAnimations: false
        };
        
        console.log('ContrastManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // システム設定の検出
            this.detectSystemPreferences();
            
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // 動的スタイルシートの作成
            this.createDynamicStyleSheet();
            
            // CSS変数の初期化
            this.initializeCSSVariables();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 初期コントラスト検証
            if (this.config.realTimeValidation) {
                this.performInitialValidation();
            }
            
            console.log('ContrastManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'CONTRAST_MANAGER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * システム設定の検出
     */
    detectSystemPreferences() {
        if (!this.config.autoDetection) return;
        
        try {
            // ハイコントラストモードの検出
            if (window.matchMedia) {
                const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
                const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
                
                if (highContrastQuery.matches || forcedColorsQuery.matches) {
                    this.config.enabled = true;
                    this.config.level = 'aaa';
                    console.log('System high contrast mode detected');
                }
                
                // 変更を監視
                highContrastQuery.addEventListener('change', (e) => {
                    if (e.matches) {
                        this.enableHighContrast('aaa');
                    }
                });
                
                forcedColorsQuery.addEventListener('change', (e) => {
                    if (e.matches) {
                        this.enableHighContrast('aaa');
                    }
                });
            }
            
            // カラースキームの検出
            if (window.matchMedia) {
                const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                this.preferredColorScheme = darkSchemeQuery.matches ? 'dark' : 'light';
                
                darkSchemeQuery.addEventListener('change', (e) => {
                    this.preferredColorScheme = e.matches ? 'dark' : 'light';
                    if (this.config.enabled) {
                        this.updateSchemeBasedOnPreference();
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to detect system preferences:', error);
        }
    }
    
    /**
     * 設定に基づくスキーム更新
     */
    updateSchemeBasedOnPreference() {
        const schemeName = this.preferredColorScheme === 'dark' ? 
            'high-contrast-dark' : 'high-contrast-light';
        this.applyColorScheme(schemeName);
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('contrastManager_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // カスタムカラーの復元
                if (preferences.customColors) {
                    this.userPreferences.customColors = new Map(preferences.customColors);
                }
            }
        } catch (error) {
            console.warn('Failed to load contrast preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                customColors: Array.from(this.userPreferences.customColors.entries())
            };
            
            localStorage.setItem('contrastManager_preferences', 
                JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save contrast preferences:', error);
        }
    }
    
    /**
     * 動的スタイルシートの作成
     */
    createDynamicStyleSheet() {
        this.dynamicStyleSheet = document.createElement('style');
        this.dynamicStyleSheet.id = 'contrast-manager-styles';
        this.dynamicStyleSheet.textContent = `
            /* 基本的なハイコントラストスタイル */
            .high-contrast {
                --contrast-enhanced: true;
            }
            
            .high-contrast * {
                text-shadow: none !important;
                box-shadow: none !important;
            }
            
            .high-contrast.enhanced-shadows * {
                text-shadow: 1px 1px 0px currentColor !important;
            }
            
            .high-contrast.enhanced-outlines * {
                outline: 1px solid currentColor;
                outline-offset: 1px;
            }
            
            /* ゲーム要素の特別扱い */
            .high-contrast canvas {
                filter: contrast(1.5) brightness(1.1);
            }
            
            .high-contrast .bubble {
                stroke-width: 2px !important;
                stroke: currentColor !important;
            }
            
            /* アニメーション制御 */
            .high-contrast.no-animations * {
                animation: none !important;
                transition: none !important;
            }
            
            /* フォーカス強化 */
            .high-contrast *:focus {
                outline: 3px solid var(--focus-color, #ffff00) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 5px rgba(255, 255, 0, 0.3) !important;
            }
        `;
        document.head.appendChild(this.dynamicStyleSheet);
    }
    
    /**
     * CSS変数の初期化
     */
    initializeCSSVariables() {
        const root = document.documentElement;
        
        // 基本的なコントラスト変数
        this.cssVariables.set('--contrast-ratio-aa', '4.5');
        this.cssVariables.set('--contrast-ratio-aaa', '7.0');
        this.cssVariables.set('--focus-color', '#ffff00');
        this.cssVariables.set('--error-color', '#ff0000');
        this.cssVariables.set('--success-color', '#00ff00');
        this.cssVariables.set('--warning-color', '#ff8800');
        
        // CSS変数を適用
        for (const [variable, value] of this.cssVariables) {
            root.style.setProperty(variable, value);
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // DOM変更の監視
        if (this.config.realTimeValidation) {
            this.observeDOM();
        }
        
        // ウィンドウリサイズ時の再検証
        window.addEventListener('resize', () => {
            this.debounce(() => {
                this.validateCurrentElements();
            }, 500)();
        });
        
        // フォーカス変更時の検証
        document.addEventListener('focusin', (event) => {
            if (this.config.enabled) {
                this.validateElement(event.target);
            }
        });
    }
    
    /**
     * DOM変更の監視
     */
    observeDOM() {
        this.domObserver = new MutationObserver((mutations) => {
            if (!this.config.enabled) return;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.validateElement(node);
                        }
                    });
                }
                
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || 
                     mutation.attributeName === 'class')) {
                    this.validateElement(mutation.target);
                }
            });
        });
        
        this.domObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    /**
     * 初期コントラスト検証
     */
    performInitialValidation() {
        const elements = document.querySelectorAll('*');
        let violationCount = 0;
        
        elements.forEach(element => {
            if (this.hasTextContent(element)) {
                const result = this.validateElement(element);
                if (result && !result.passed) {
                    violationCount++;
                }
            }
        });
        
        console.log(`Initial contrast validation: ${violationCount} violations found`);
        this.stats.violationsFound += violationCount;
    }
    
    /**
     * 要素にテキストコンテンツがあるかチェック
     */
    hasTextContent(element) {
        const text = element.textContent?.trim();
        return text && text.length > 0 && 
               window.getComputedStyle(element).display !== 'none';
    }
    
    /**
     * 要素のコントラスト検証
     */
    validateElement(element) {
        if (!element || !this.hasTextContent(element)) {
            return null;
        }
        
        try {
            const styles = window.getComputedStyle(element);
            const textColor = this.parseColor(styles.color);
            const backgroundColor = this.getEffectiveBackgroundColor(element);
            
            if (!textColor || !backgroundColor) {
                return null;
            }
            
            const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
            const fontSize = parseFloat(styles.fontSize);
            const fontWeight = parseInt(styles.fontWeight) || 400;
            const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
            
            const threshold = this.getContrastThreshold(isLargeText);
            const passed = contrastRatio >= threshold;
            
            const result = {
                element,
                textColor,
                backgroundColor,
                contrastRatio,
                threshold,
                passed,
                isLargeText,
                fontSize,
                fontWeight
            };
            
            // キャッシュに保存
            this.validationResults.set(element, result);
            this.stats.validationChecks++;
            
            // 違反の場合は自動修正を試行
            if (!passed && this.userPreferences.autoEnhancement) {
                this.enhanceElementContrast(element, result);
            }
            
            return result;
        } catch (error) {
            console.warn('Contrast validation error:', error);
            return null;
        }
    }
    
    /**
     * 効果的な背景色の取得
     */
    getEffectiveBackgroundColor(element) {
        let currentElement = element;
        
        while (currentElement && currentElement !== document.body) {
            const styles = window.getComputedStyle(currentElement);
            const bgColor = this.parseColor(styles.backgroundColor);
            
            if (bgColor && bgColor.a > 0) {
                return bgColor;
            }
            
            currentElement = currentElement.parentElement;
        }
        
        // デフォルトは白背景
        return { r: 255, g: 255, b: 255, a: 1 };
    }
    
    /**
     * 色文字列の解析
     */
    parseColor(colorString) {
        if (!colorString || colorString === 'transparent') {
            return null;
        }
        
        // キャッシュチェック
        if (this.contrastCache.has(colorString)) {
            return this.contrastCache.get(colorString);
        }
        
        let color = null;
        
        // RGB/RGBA形式
        const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbMatch) {
            color = {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3]),
                a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
            };
        }
        
        // HEX形式
        const hexMatch = colorString.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
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
        
        // 色名
        if (!color) {
            const tempDiv = document.createElement('div');
            tempDiv.style.color = colorString;
            document.body.appendChild(tempDiv);
            const computedColor = window.getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);
            
            if (computedColor !== colorString) {
                return this.parseColor(computedColor);
            }
        }
        
        if (color) {
            this.contrastCache.set(colorString, color);
        }
        
        return color;
    }
    
    /**
     * コントラスト比の計算
     */
    calculateContrastRatio(color1, color2) {
        const l1 = this.getLuminance(color1);
        const l2 = this.getLuminance(color2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    /**
     * 輝度の計算
     */
    getLuminance(color) {
        const { r, g, b } = color;
        
        // sRGB値を線形RGB値に変換
        const toLinear = (value) => {
            const normalized = value / 255;
            return normalized <= 0.03928 
                ? normalized / 12.92 
                : Math.pow((normalized + 0.055) / 1.055, 2.4);
        };
        
        const linearR = toLinear(r);
        const linearG = toLinear(g);
        const linearB = toLinear(b);
        
        // ITU-R BT.709の係数で輝度を計算
        return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
    }
    
    /**
     * コントラスト閾値の取得
     */
    getContrastThreshold(isLargeText) {
        const level = this.config.level;
        return isLargeText 
            ? this.config.thresholds[level].large 
            : this.config.thresholds[level].normal;
    }
    
    /**
     * 要素のコントラスト強化
     */
    enhanceElementContrast(element, validationResult) {
        if (!validationResult || validationResult.passed) {
            return;
        }
        
        try {
            // 元のスタイルを保存
            if (!this.originalStyles.has(element)) {
                this.originalStyles.set(element, {
                    color: element.style.color,
                    backgroundColor: element.style.backgroundColor,
                    textShadow: element.style.textShadow,
                    outline: element.style.outline
                });
            }
            
            // コントラストを改善する色を計算
            const improvedColors = this.calculateImprovedColors(
                validationResult.textColor,
                validationResult.backgroundColor,
                validationResult.threshold
            );
            
            // 改善された色を適用
            if (improvedColors.textColor) {
                element.style.color = this.colorToString(improvedColors.textColor);
            }
            
            if (improvedColors.backgroundColor) {
                element.style.backgroundColor = this.colorToString(improvedColors.backgroundColor);
            }
            
            // 必要に応じて追加の強化を適用
            if (this.config.enhancement.shadowSupport) {
                element.style.textShadow = '1px 1px 0px rgba(0,0,0,0.8)';
            }
            
            if (this.config.enhancement.outlineSupport) {
                element.style.outline = '1px solid rgba(255,255,255,0.5)';
                element.style.outlineOffset = '1px';
            }
            
            this.appliedElements.add(element);
            this.stats.elementsModified++;
            this.stats.violationsFixed++;
            
        } catch (error) {
            console.warn('Failed to enhance element contrast:', error);
        }
    }
    
    /**
     * 改善された色の計算
     */
    calculateImprovedColors(textColor, backgroundColor, threshold) {
        const currentRatio = this.calculateContrastRatio(textColor, backgroundColor);
        
        if (currentRatio >= threshold) {
            return { textColor: null, backgroundColor: null };
        }
        
        // テキスト色を調整して目標比率を達成
        const targetRatio = threshold * 1.1; // 10%のマージンを追加
        
        // 背景色の輝度
        const bgLuminance = this.getLuminance(backgroundColor);
        
        // 目標のテキスト輝度を計算
        let targetTextLuminance;
        if (bgLuminance > 0.5) {
            // 明るい背景 -> 暗いテキスト
            targetTextLuminance = (bgLuminance + 0.05) / targetRatio - 0.05;
        } else {
            // 暗い背景 -> 明るいテキスト
            targetTextLuminance = targetRatio * (bgLuminance + 0.05) - 0.05;
        }
        
        // 輝度を色に変換
        const improvedTextColor = this.luminanceToColor(targetTextLuminance, textColor);
        
        return {
            textColor: improvedTextColor,
            backgroundColor: null // 背景色は変更しない
        };
    }
    
    /**
     * 輝度から色への変換
     */
    luminanceToColor(targetLuminance, baseColor) {
        const { r, g, b, a } = baseColor;
        
        // 簡単な方法：RGB値を等しく調整
        const currentLuminance = this.getLuminance(baseColor);
        const ratio = Math.sqrt(targetLuminance / currentLuminance);
        
        return {
            r: Math.max(0, Math.min(255, Math.round(r * ratio))),
            g: Math.max(0, Math.min(255, Math.round(g * ratio))),
            b: Math.max(0, Math.min(255, Math.round(b * ratio))),
            a
        };
    }
    
    /**
     * 色オブジェクトを文字列に変換
     */
    colorToString(color) {
        const { r, g, b, a } = color;
        return a < 1 
            ? `rgba(${r}, ${g}, ${b}, ${a})`
            : `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * 現在の要素の検証
     */
    validateCurrentElements() {
        const elements = document.querySelectorAll('*');
        let violations = 0;
        
        elements.forEach(element => {
            if (this.hasTextContent(element)) {
                const result = this.validateElement(element);
                if (result && !result.passed) {
                    violations++;
                }
            }
        });
        
        return violations;
    }
    
    /**
     * デバウンス関数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // パブリックAPI
    
    /**
     * ハイコントラストモードの有効化
     */
    enableHighContrast(level = 'aa') {
        this.config.enabled = true;
        this.config.level = level;
        
        document.body.classList.add('high-contrast');
        
        // アニメーション制御
        if (!this.userPreferences.enableAnimations) {
            document.body.classList.add('no-animations');
        }
        
        // 影とアウトラインの強化
        if (this.config.enhancement.shadowSupport) {
            document.body.classList.add('enhanced-shadows');
        }
        
        if (this.config.enhancement.outlineSupport) {
            document.body.classList.add('enhanced-outlines');
        }
        
        // カラースキームの適用
        const schemeName = this.userPreferences.preferredScheme === 'auto' 
            ? (this.preferredColorScheme === 'dark' ? 'high-contrast-dark' : 'high-contrast-light')
            : this.userPreferences.preferredScheme;
        
        this.applyColorScheme(schemeName);
        
        // 全要素の検証と修正
        this.validateCurrentElements();
        
        this.stats.schemeChanges++;
        console.log(`High contrast mode enabled (${level})`);
    }
    
    /**
     * ハイコントラストモードの無効化
     */
    disableHighContrast() {
        this.config.enabled = false;
        
        document.body.classList.remove('high-contrast', 'no-animations', 
            'enhanced-shadows', 'enhanced-outlines');
        
        // 適用された修正を元に戻す
        this.revertAllEnhancements();
        
        // カラースキームを削除
        this.removeColorScheme();
        
        console.log('High contrast mode disabled');
    }
    
    /**
     * カラースキームの適用
     */
    applyColorScheme(schemeName) {
        const scheme = this.colorPalettes.get(schemeName);
        if (!scheme) {
            console.warn(`Color scheme not found: ${schemeName}`);
            return;
        }
        
        this.currentScheme = scheme;
        const root = document.documentElement;
        
        // CSS変数の設定
        root.style.setProperty('--bg-primary', scheme.background);
        root.style.setProperty('--bg-surface', scheme.surface);
        root.style.setProperty('--color-primary', scheme.primary);
        root.style.setProperty('--color-secondary', scheme.secondary);
        root.style.setProperty('--color-accent', scheme.accent);
        root.style.setProperty('--color-error', scheme.error);
        root.style.setProperty('--color-warning', scheme.warning);
        root.style.setProperty('--color-success', scheme.success);
        root.style.setProperty('--text-primary', scheme.text.primary);
        root.style.setProperty('--text-secondary', scheme.text.secondary);
        root.style.setProperty('--text-disabled', scheme.text.disabled);
        
        // ゲーム要素用の変数
        root.style.setProperty('--bubble-normal', scheme.game.bubble.normal);
        root.style.setProperty('--bubble-special', scheme.game.bubble.special);
        root.style.setProperty('--bubble-dangerous', scheme.game.bubble.dangerous);
        root.style.setProperty('--bubble-bonus', scheme.game.bubble.bonus);
        root.style.setProperty('--ui-score', scheme.game.ui.score);
        root.style.setProperty('--ui-timer', scheme.game.ui.timer);
        root.style.setProperty('--ui-hp', scheme.game.ui.hp);
        
        console.log(`Applied color scheme: ${scheme.name}`);
    }
    
    /**
     * カラースキームの削除
     */
    removeColorScheme() {
        if (!this.currentScheme) return;
        
        const root = document.documentElement;
        const variables = [
            '--bg-primary', '--bg-surface', '--color-primary', '--color-secondary',
            '--color-accent', '--color-error', '--color-warning', '--color-success',
            '--text-primary', '--text-secondary', '--text-disabled',
            '--bubble-normal', '--bubble-special', '--bubble-dangerous', '--bubble-bonus',
            '--ui-score', '--ui-timer', '--ui-hp'
        ];
        
        variables.forEach(variable => {
            root.style.removeProperty(variable);
        });
        
        this.currentScheme = null;
    }
    
    /**
     * すべての強化を元に戻す
     */
    revertAllEnhancements() {
        for (const element of this.appliedElements) {
            const originalStyle = this.originalStyles.get(element);
            if (originalStyle) {
                element.style.color = originalStyle.color || '';
                element.style.backgroundColor = originalStyle.backgroundColor || '';
                element.style.textShadow = originalStyle.textShadow || '';
                element.style.outline = originalStyle.outline || '';
            }
        }
        
        this.appliedElements.clear();
        this.originalStyles.clear();
    }
    
    /**
     * カスタムカラースキームの作成
     */
    createCustomScheme(name, colors) {
        this.colorPalettes.set(name, {
            name,
            ...colors,
            isCustom: true
        });
        
        console.log(`Custom color scheme created: ${name}`);
    }
    
    /**
     * コントラスト比のチェック
     */
    checkContrastRatio(textColor, backgroundColor) {
        const color1 = typeof textColor === 'string' ? this.parseColor(textColor) : textColor;
        const color2 = typeof backgroundColor === 'string' ? this.parseColor(backgroundColor) : backgroundColor;
        
        if (!color1 || !color2) {
            return null;
        }
        
        const ratio = this.calculateContrastRatio(color1, color2);
        return {
            ratio,
            passesAA: ratio >= 4.5,
            passesAAA: ratio >= 7.0,
            passesAALarge: ratio >= 3.0,
            passesAAALarge: ratio >= 4.5
        };
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.visual?.contrast) {
            Object.assign(this.config, config.visual.contrast);
        }
        
        console.log('ContrastManager configuration applied');
    }
    
    /**
     * 利用可能なカラースキームの取得
     */
    getAvailableSchemes() {
        return Array.from(this.colorPalettes.entries()).map(([key, scheme]) => ({
            key,
            name: scheme.name,
            isCustom: scheme.isCustom || false
        }));
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return {
            timestamp: new Date().toISOString(),
            configuration: {
                enabled: this.config.enabled,
                level: this.config.level,
                currentScheme: this.currentScheme?.name || null
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                validationRate: this.stats.validationChecks / (sessionDuration / 1000),
                fixRate: this.stats.violationsFound > 0 ? 
                    this.stats.violationsFixed / this.stats.violationsFound : 0
            },
            validation: {
                elementsValidated: this.validationResults.size,
                currentViolations: this.validateCurrentElements(),
                cacheSize: this.contrastCache.size
            },
            userPreferences: this.userPreferences
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
            this.enableHighContrast(this.userPreferences.contrastLevel);
        } else {
            this.disableHighContrast();
        }
        
        console.log(`ContrastManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying ContrastManager...');
        
        // ハイコントラストモードを無効化
        this.disableHighContrast();
        
        // DOM監視の停止
        if (this.domObserver) {
            this.domObserver.disconnect();
        }
        
        // スタイルシートの削除
        if (this.dynamicStyleSheet && this.dynamicStyleSheet.parentNode) {
            this.dynamicStyleSheet.parentNode.removeChild(this.dynamicStyleSheet);
        }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.contrastCache.clear();
        this.validationResults.clear();
        this.originalStyles.clear();
        this.appliedElements.clear();
        this.cssVariables.clear();
        this.colorPalettes.clear();
        
        console.log('ContrastManager destroyed');
    }
}