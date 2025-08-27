import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { getRTLLanguageDetector } from './RTLLanguageDetector.js';

/**
 * RTL対応レイアウト管理システム - RTL言語のUI配置とレイアウト制御
 */
export class RTLLayoutManager {
    constructor() {
        this.rtlDetector = getRTLLanguageDetector();
        
        // レイアウト設定
        this.layoutSettings = {
            autoFlipEnabled: true,
            preserveImageOrientation: true,
            handleScrollbars: true,
            adaptAnimations: true,
            responsiveBreakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200
            }
        };
        
        // 反転対象となるCSSプロパティのマッピング
        this.flipProperties = new Map([
            ['left', 'right'],
            ['right', 'left'],
            ['margin-left', 'margin-right'],
            ['margin-right', 'margin-left'],
            ['padding-left', 'padding-right'],
            ['padding-right', 'padding-left'],
            ['border-left', 'border-right'],
            ['border-right', 'border-left'],
            ['border-left-width', 'border-right-width'],
            ['border-right-width', 'border-left-width'],
            ['border-left-color', 'border-right-color'],
            ['border-right-color', 'border-left-color'],
            ['border-left-style', 'border-right-style'],
            ['border-right-style', 'border-left-style'],
            ['border-top-left-radius', 'border-top-right-radius'],
            ['border-top-right-radius', 'border-top-left-radius'],
            ['border-bottom-left-radius', 'border-bottom-right-radius'],
            ['border-bottom-right-radius', 'border-bottom-left-radius'],
            ['text-align: left', 'text-align: right'],
            ['text-align: right', 'text-align: left'],
            ['float: left', 'float: right'],
            ['float: right', 'float: left'],
            ['clear: left', 'clear: right'],
            ['clear: right', 'clear: left']
        ]);
        
        // 反転しないプロパティ（例外）
        this.preserveProperties = new Set([
            'width',
            'height',
            'top',
            'bottom',
            'font-size',
            'line-height',
            'color',
            'background-color',
            'z-index',
            'opacity'
        ]);
        
        // RTL固有のコンポーネント設定
        this.componentSettings = new Map([
            ['menu', {
                flipHorizontal: true,
                preserveIcons: true,
                adaptAnimations: true,
                customRules: {
                    'dropdown': 'flip-origin',
                    'tooltip': 'flip-position'
                }
            }],
            ['navigation', {
                flipHorizontal: true,
                preserveIcons: false,
                adaptAnimations: true,
                customRules: {
                    'breadcrumb': 'reverse-order',
                    'pagination': 'flip-arrows'
                }
            }],
            ['form', {
                flipHorizontal: true,
                preserveIcons: true,
                adaptAnimations: false,
                customRules: {
                    'label': 'align-right',
                    'input': 'text-right'
                }
            }],
            ['dialog', {
                flipHorizontal: true,
                preserveIcons: true,
                adaptAnimations: true,
                customRules: {
                    'close-button': 'flip-position',
                    'action-buttons': 'reverse-order'
                }
            }]
        ]);
        
        // 現在のレイアウト状態
        this.currentLayout = {
            direction: 'ltr',
            language: null,
            appliedElements: new WeakSet(),
            styleSheet: null
        };
        
        console.log('RTLLayoutManager initialized');
    }
    
    /**
     * レイアウト方向を設定
     */
    setLayoutDirection(direction, language = null) {
        try {
            if (direction !== 'ltr' && direction !== 'rtl') {
                throw new Error(`Invalid layout direction: ${direction}`);
            }
            
            const previousDirection = this.currentLayout.direction;
            this.currentLayout.direction = direction;
            this.currentLayout.language = language;
            
            // ドキュメント全体に方向を適用
            this.applyDocumentDirection(direction);
            
            // 動的スタイルシートを更新
            this.updateDynamicStyleSheet(direction, language);
            
            // レイアウト変更イベントを発火
            this.dispatchLayoutChangeEvent(direction, previousDirection, language);
            
            console.log(`Layout direction changed to: ${direction} (${language || 'default'})`);
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'RTL_LAYOUT_ERROR', {
                direction: direction,
                language: language
            });
            return false;
        }
    }
    
    /**
     * 要素にRTLレイアウトを適用
     */
    applyRTLLayout(element, options = {}) {
        if (!element || this.currentLayout.appliedElements.has(element)) {
            return false;
        }
        
        const {
            componentType = 'generic',
            preserveContent = true,
            adaptAnimations = this.layoutSettings.adaptAnimations,
            customRules = {}
        } = options;
        
        try {
            // 要素の現在のスタイルを保存
            const originalStyles = this.saveElementStyles(element);
            
            // 基本RTL設定を適用
            this.applyBasicRTLStyles(element);
            
            // コンポーネント固有の設定を適用
            this.applyComponentSpecificRTL(element, componentType, customRules);
            
            // 子要素の処理
            if (!preserveContent) {
                this.processChildElements(element, componentType);
            }
            
            // アニメーション調整
            if (adaptAnimations) {
                this.adaptElementAnimations(element);
            }
            
            // 元のスタイル情報を保存
            element._rtlOriginalStyles = originalStyles;
            element._rtlApplied = true;
            
            // 適用済み要素として記録
            this.currentLayout.appliedElements.add(element);
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'RTL_ELEMENT_APPLICATION_ERROR', {
                element: element.tagName,
                componentType: componentType
            });
            return false;
        }
    }
    
    /**
     * RTLレイアウトを除去
     */
    removeRTLLayout(element) {
        if (!element || !element._rtlApplied) {
            return false;
        }
        
        try {
            // 保存されたスタイルを復元
            if (element._rtlOriginalStyles) {
                this.restoreElementStyles(element, element._rtlOriginalStyles);
            }
            
            // RTL固有のクラスを削除
            element.classList.remove('rtl-layout', 'rtl-component');
            element.removeAttribute('dir');
            
            // 子要素の処理
            const children = element.querySelectorAll('[dir="rtl"]');
            children.forEach(child => {
                if (child._rtlApplied) {
                    this.removeRTLLayout(child);
                }
            });
            
            // メタデータクリーンアップ
            delete element._rtlOriginalStyles;
            delete element._rtlApplied;
            
            // 適用済みセットから削除
            this.currentLayout.appliedElements.delete(element);
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'RTL_LAYOUT_REMOVAL_ERROR', {
                element: element.tagName
            });
            return false;
        }
    }
    
    /**
     * レスポンシブRTLレイアウト
     */
    applyResponsiveRTL(element, breakpoints = null) {
        const responsive = breakpoints || this.layoutSettings.responsiveBreakpoints;
        const currentWidth = window.innerWidth;
        
        let deviceClass = 'desktop';
        if (currentWidth <= responsive.mobile) {
            deviceClass = 'mobile';
        } else if (currentWidth <= responsive.tablet) {
            deviceClass = 'tablet';
        }
        
        // デバイス固有のRTL設定を適用
        element.classList.add(`rtl-${deviceClass}`);
        
        // デバイス別の調整
        switch (deviceClass) {
            case 'mobile':
                this.applyMobileRTL(element);
                break;
            case 'tablet':
                this.applyTabletRTL(element);
                break;
            case 'desktop':
                this.applyDesktopRTL(element);
                break;
        }
        
        return deviceClass;
    }
    
    /**
     * CSS文字列をRTL用に変換
     */
    convertCSSToRTL(cssText) {
        let rtlCSS = cssText;
        
        // プロパティを反転
        for (const [ltrProp, rtlProp] of this.flipProperties) {
            const ltrRegex = new RegExp(ltrProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            rtlCSS = rtlCSS.replace(ltrRegex, rtlProp);
        }
        
        // 数値の反転（transform: translateX など）
        rtlCSS = rtlCSS.replace(/translateX\((-?\d+(?:\.\d+)?)([^)]*)\)/g, (match, value, unit) => {
            return `translateX(${-parseFloat(value)}${unit})`;
        });
        
        // transform-origin の調整
        rtlCSS = rtlCSS.replace(/transform-origin:\s*(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)/g, (match, x, y) => {
            if (x.includes('%')) {
                const percentage = 100 - parseFloat(x);
                return `transform-origin: ${percentage}% ${y}`;
            }
            return match;
        });
        
        return rtlCSS;
    }
    
    /**
     * アニメーションをRTL用に調整
     */
    adaptAnimationForRTL(animationName, keyframes) {
        const rtlKeyframes = {};
        
        Object.entries(keyframes).forEach(([percentage, rules]) => {
            const rtlRules = {};
            
            Object.entries(rules).forEach(([property, value]) => {
                if (this.flipProperties.has(property)) {
                    rtlRules[this.flipProperties.get(property)] = value;
                } else if (property === 'transform' && typeof value === 'string') {
                    // transform プロパティの調整
                    rtlRules[property] = value.replace(/translateX\((-?\d+[^)]*)\)/g, (match, val) => {
                        const numericValue = parseFloat(val);
                        const unit = val.replace(/^-?\d+(?:\.\d+)?/, '');
                        return `translateX(${-numericValue}${unit})`;
                    });
                } else {
                    rtlRules[property] = value;
                }
            });
            
            rtlKeyframes[percentage] = rtlRules;
        });
        
        return rtlKeyframes;
    }
    
    /**
     * 内部メソッド群
     */
    
    applyDocumentDirection(direction) {
        document.documentElement.style.direction = direction;
        document.documentElement.setAttribute('dir', direction);
        document.body.style.direction = direction;
        document.body.setAttribute('dir', direction);
        
        // ルート要素にクラス追加
        document.documentElement.classList.toggle('rtl-document', direction === 'rtl');
        document.body.classList.toggle('rtl-body', direction === 'rtl');
    }
    
    updateDynamicStyleSheet(direction, language) {
        // 既存の動的スタイルシートを削除
        if (this.currentLayout.styleSheet) {
            this.currentLayout.styleSheet.remove();
        }
        
        // 新しいスタイルシートを作成
        const style = document.createElement('style');
        style.id = 'rtl-dynamic-styles';
        
        let css = '';
        
        if (direction === 'rtl') {
            css += this.generateRTLBaseCSS();
            if (language) {
                css += this.generateLanguageSpecificCSS(language);
            }
        }
        
        style.textContent = css;
        document.head.appendChild(style);
        this.currentLayout.styleSheet = style;
    }
    
    generateRTLBaseCSS() {
        return `
            .rtl-layout {
                direction: rtl;
                text-align: right;
            }
            
            .rtl-layout .rtl-component {
                direction: rtl;
            }
            
            .rtl-layout input,
            .rtl-layout textarea,
            .rtl-layout select {
                text-align: right;
            }
            
            .rtl-layout .rtl-flip-horizontal {
                transform: scaleX(-1);
            }
            
            .rtl-layout .rtl-preserve-content {
                direction: ltr;
                text-align: left;
            }
        `;
    }
    
    generateLanguageSpecificCSS(language) {
        const settings = this.rtlDetector.getRTLSettings(language);
        if (!settings) return '';
        
        return `
            .rtl-layout[lang="${language}"] {
                font-family: ${settings.fontFamily};
                font-size: ${settings.fontSize};
                line-height: ${settings.lineHeight};
                word-spacing: ${settings.wordSpacing};
                letter-spacing: ${settings.letterSpacing};
            }
        `;
    }
    
    applyBasicRTLStyles(element) {
        element.style.direction = 'rtl';
        element.setAttribute('dir', 'rtl');
        element.classList.add('rtl-layout', 'rtl-component');
    }
    
    applyComponentSpecificRTL(element, componentType, customRules) {
        const settings = this.componentSettings.get(componentType);
        if (!settings) return;
        
        // 水平反転
        if (settings.flipHorizontal) {
            element.classList.add('rtl-flip-horizontal');
        }
        
        // アイコン保持
        if (settings.preserveIcons) {
            const icons = element.querySelectorAll('.icon, .fa, [class*="icon-"]');
            icons.forEach(icon => {
                icon.classList.add('rtl-preserve-content');
            });
        }
        
        // カスタムルール適用
        Object.entries(settings.customRules).forEach(([selector, rule]) => {
            const targets = element.querySelectorAll(selector);
            targets.forEach(target => {
                target.classList.add(`rtl-rule-${rule}`);
            });
        });
        
        // 追加のカスタムルール
        Object.entries(customRules).forEach(([selector, rule]) => {
            const targets = element.querySelectorAll(selector);
            targets.forEach(target => {
                target.classList.add(`rtl-custom-${rule}`);
            });
        });
    }
    
    processChildElements(element, componentType) {
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this.applyRTLLayout(child, {
                componentType: componentType,
                preserveContent: false
            });
        }
    }
    
    adaptElementAnimations(element) {
        const computedStyle = window.getComputedStyle(element);
        const animationName = computedStyle.animationName;
        
        if (animationName && animationName !== 'none') {
            // アニメーション名にRTLサフィックスを追加
            element.style.animationName = `${animationName}-rtl`;
        }
    }
    
    applyMobileRTL(element) {
        element.style.padding = '10px';
        element.style.fontSize = '14px';
    }
    
    applyTabletRTL(element) {
        element.style.padding = '15px';
        element.style.fontSize = '16px';
    }
    
    applyDesktopRTL(element) {
        element.style.padding = '20px';
        element.style.fontSize = '18px';
    }
    
    saveElementStyles(element) {
        const computedStyle = window.getComputedStyle(element);
        const styles = {};
        
        // 主要なスタイルプロパティを保存
        const properties = [
            'direction', 'textAlign', 'marginLeft', 'marginRight',
            'paddingLeft', 'paddingRight', 'left', 'right',
            'transform', 'transformOrigin'
        ];
        
        properties.forEach(prop => {
            styles[prop] = computedStyle[prop];
        });
        
        return styles;
    }
    
    restoreElementStyles(element, originalStyles) {
        Object.entries(originalStyles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }
    
    dispatchLayoutChangeEvent(newDirection, oldDirection, language) {
        const event = new CustomEvent('rtlLayoutChange', {
            detail: {
                newDirection: newDirection,
                oldDirection: oldDirection,
                language: language,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * 公開API
     */
    
    /**
     * 現在のレイアウト方向を取得
     */
    getCurrentDirection() {
        return this.currentLayout.direction;
    }
    
    /**
     * 現在のレイアウト言語を取得
     */
    getCurrentLanguage() {
        return this.currentLayout.language;
    }
    
    /**
     * レイアウト設定を更新
     */
    updateSettings(newSettings) {
        Object.assign(this.layoutSettings, newSettings);
        console.log('RTL layout settings updated:', newSettings);
    }
    
    /**
     * コンポーネント設定を追加
     */
    addComponentSettings(componentType, settings) {
        this.componentSettings.set(componentType, settings);
        console.log(`Component settings added for: ${componentType}`);
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            currentDirection: this.currentLayout.direction,
            currentLanguage: this.currentLayout.language,
            appliedElementsCount: this.currentLayout.appliedElements ? 'WeakSet' : 0,
            supportedComponents: this.componentSettings.size,
            flipProperties: this.flipProperties.size,
            preserveProperties: this.preserveProperties.size
        };
    }
}

// シングルトンインスタンス
let rtlLayoutManagerInstance = null;

/**
 * RTLLayoutManagerのシングルトンインスタンスを取得
 */
export function getRTLLayoutManager() {
    if (!rtlLayoutManagerInstance) {
        rtlLayoutManagerInstance = new RTLLayoutManager();
    }
    return rtlLayoutManagerInstance;
}