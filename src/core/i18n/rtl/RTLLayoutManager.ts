import { getErrorHandler } from '../../../utils/ErrorHandler.js';''
import { getRTLLanguageDetector } from './RTLLanguageDetector.js';

// インターフェース定義
interface LayoutSettings { autoFlipEnabled: boolean,
    preserveImageOrientation: boolean,
    handleScrollbars: boolean,
    adaptAnimations: boolean,
    responsiveBreakpoints: ResponsiveBreakpoints;
    }
}

interface ResponsiveBreakpoints { mobile: number,
    tablet: number,
    desktop: number; }
}

interface ComponentSettings { flipHorizontal: boolean,
    preserveIcons: boolean,
    adaptAnimations: boolean, }
    customRules: { [selector: string]: string }
}
';
interface CurrentLayout { ''
    direction: 'ltr' | 'rtl',
    language: string | null,
    appliedElements: WeakSet<HTMLElement>,
    styleSheet: HTMLStyleElement | null; }
}

interface ApplyRTLOptions { componentType?: string;
    preserveContent?: boolean;
    adaptAnimations?: boolean; }
    customRules?: { [selector: string]: string }
}

interface OriginalStyles { [property: string]: string, }
}

interface ExtendedHTMLElement extends HTMLElement { _rtlOriginalStyles?: OriginalStyles;
    _rtlApplied?: boolean; }
}

interface AnimationKeyframes { [percentage: string]: {
        [property: string]: string | number, }
    };
}
';
interface LayoutChangeEventDetail { ''
    newDirection: 'ltr' | 'rtl','';
    oldDirection: 'ltr' | 'rtl',
    language: string | null,
    timestamp: string; }
}
';
interface LayoutStats { ''
    currentDirection: 'ltr' | 'rtl',
    currentLanguage: string | null,
    appliedElementsCount: string | number,
    supportedComponents: number,
    flipProperties: number,
    preserveProperties: number; }
}

/**
 * RTL対応レイアウト管理システム - RTL言語のUI配置とレイアウト制御
 */
export class RTLLayoutManager {
    private rtlDetector: any;
    private layoutSettings: LayoutSettings;
    private flipProperties: Map<string, string>;
    private preserveProperties: Set<string>;
    private componentSettings: Map<string, ComponentSettings>;
    private currentLayout: CurrentLayout;
    constructor() {
';
        '';
        this.rtlDetector = getRTLLanguageDetector(''';
            ['left', 'right'],'';
            ['right', 'left'],'';
            ['margin-left', 'margin-right'],'';
            ['margin-right', 'margin-left'],'';
            ['padding-left', 'padding-right'],'';
            ['padding-right', 'padding-left'],'';
            ['border-left', 'border-right'],'';
            ['border-right', 'border-left'],'';
            ['border-left-width', 'border-right-width'],'';
            ['border-right-width', 'border-left-width'],'';
            ['border-left-color', 'border-right-color'],'';
            ['border-right-color', 'border-left-color'],'';
            ['border-left-style', 'border-right-style'],'';
            ['border-right-style', 'border-left-style'],'';
            ['border-top-left-radius', 'border-top-right-radius'],'';
            ['border-top-right-radius', 'border-top-left-radius'],'';
            ['border-bottom-left-radius', 'border-bottom-right-radius'],'';
            ['border-bottom-right-radius', 'border-bottom-left-radius'],'';
            ['text-align: left', 'text-align: right'],'';
            ['text-align: right', 'text-align: left'],'';
            ['float: left', 'float: right'],'';
            ['float: right', 'float: left'],'';
            ['clear: left', 'clear: right'],'';
            ['clear: right', 'clear: left']')';
        ]');
        
        // 反転しないプロパティ（例外）'
        this.preserveProperties = new Set(['';
            'width','';
            'height','';
            'top','';
            'bottom','';
            'font-size','';
            'line-height','';
            'color','';
            'background-color','';
            'z-index',']';
            'opacity''])';
        ]');
        
        // RTL固有のコンポーネント設定'
        this.componentSettings = new Map(['';
            ['menu', {
                flipHorizontal: true,
                preserveIcons: true,
                adaptAnimations: true,';
                customRules: {''
                    'dropdown': 'flip-origin',';
    }
    }'
                    'tooltip': 'flip-position' }]
                }]'
            }],''
            ['navigation', { flipHorizontal: true,
                preserveIcons: false,
                adaptAnimations: true,';
                customRules: {''
                    'breadcrumb': 'reverse-order','';
                    'pagination': 'flip-arrows' }]
                }]'
            }],''
            ['form', { flipHorizontal: true,
                preserveIcons: true,
                adaptAnimations: false,';
                customRules: {''
                    'label': 'align-right','';
                    'input': 'text-right' }]
                }]'
            }],''
            ['dialog', { flipHorizontal: true,
                preserveIcons: true,);
                adaptAnimations: true)';
                customRules: {''
                    'close-button': 'flip-position','';
                    'action-buttons': 'reverse-order' }]
                }]'
            )]'';
        ]');
        
        // 現在のレイアウト状態'
        this.currentLayout = { ''
            direction: 'ltr',';
            language: null,'';
            appliedElements: new WeakSet('')';
        console.log('RTLLayoutManager initialized''), }
    }
    
    /**
     * レイアウト方向を設定'
     */''
    setLayoutDirection(direction: 'ltr' | 'rtl', language: string | null = null'): boolean { try {''
            if (direction !== 'ltr' && direction !== 'rtl') { }
                throw new Error(`Invalid layout direction: ${direction)`});
            }
            
            const previousDirection = this.currentLayout.direction;
            this.currentLayout.direction = direction;
            this.currentLayout.language = language;
            
            // ドキュメント全体に方向を適用
            this.applyDocumentDirection(direction);
            
            // 動的スタイルシートを更新
            this.updateDynamicStyleSheet(direction, language);
            ';
            // レイアウト変更イベントを発火''
            this.dispatchLayoutChangeEvent(direction, previousDirection, language');'
            '';
            console.log(`Layout direction changed to: ${direction} (${language || 'default')`});
            return true;
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'RTL_LAYOUT_ERROR', {)
                direction: direction,);
                language: language); }
            });
            return false;
        }
    }
    
    /**
     * 要素にRTLレイアウトを適用
     */'
    applyRTLLayout(element: HTMLElement, options: ApplyRTLOptions = { ): boolean {''
        if (!element || this.currentLayout.appliedElements.has(element)') {
            return false; }
        }
        ';
        const { ''
            componentType = 'generic',
            preserveContent = true,
            adaptAnimations = this.layoutSettings.adaptAnimations }
            customRules = {}
        } = options;
        
        try { const extElement = element as ExtendedHTMLElement;
            
            // 要素の現在のスタイルを保存
            const originalStyles = this.saveElementStyles(element);
            
            // 基本RTL設定を適用
            this.applyBasicRTLStyles(element);
            
            // コンポーネント固有の設定を適用
            this.applyComponentSpecificRTL(element, componentType, customRules);
            
            // 子要素の処理
            if(!preserveContent) {
                
            }
                this.processChildElements(element, componentType); }
            }
            
            // アニメーション調整
            if (adaptAnimations) { this.adaptElementAnimations(element); }
            }
            
            // 元のスタイル情報を保存
            extElement._rtlOriginalStyles = originalStyles;
            extElement._rtlApplied = true;
            
            // 適用済み要素として記録
            this.currentLayout.appliedElements.add(element);
            
            return true;
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'RTL_ELEMENT_APPLICATION_ERROR', {)
                element: element.tagName,);
                componentType: componentType); }
            });
            return false;
        }
    }
    
    /**
     * RTLレイアウトを除去
     */
    removeRTLLayout(element: HTMLElement): boolean { const extElement = element as ExtendedHTMLElement;
        
        if(!element || !extElement._rtlApplied) {
        
            
        
        }
            return false; }
        }
        
        try { // 保存されたスタイルを復元
            if(extElement._rtlOriginalStyles) {'
                ';
            }'
                this.restoreElementStyles(element, extElement._rtlOriginalStyles'); }
            }
            ';
            // RTL固有のクラスを削除''
            element.classList.remove('rtl-layout', 'rtl-component'');''
            element.removeAttribute('dir'');
            ';
            // 子要素の処理''
            const children = element.querySelectorAll('[dir="rtl"]');
            children.forEach(child => {  )
                const childExt = child as ExtendedHTMLElement);
                if (childExt._rtlApplied) { }
                    this.removeRTLLayout(child as HTMLElement); }
                }
            });
            
            // メタデータクリーンアップ
            delete extElement._rtlOriginalStyles;
            delete extElement._rtlApplied;
            
            // 適用済みセットから削除
            this.currentLayout.appliedElements.delete(element);
            
            return true;
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'RTL_LAYOUT_REMOVAL_ERROR', {)
                element: element.tagName); }
            });
            return false;
        }
    }
    
    /**
     * レスポンシブRTLレイアウト'
     */''
    applyResponsiveRTL(element: HTMLElement, breakpoints: ResponsiveBreakpoints | null = null'): string { const responsive = breakpoints || this.layoutSettings.responsiveBreakpoints;
        const currentWidth = window.innerWidth;'
        '';
        let deviceClass: 'mobile' | 'tablet' | 'desktop' = 'desktop','';
        if(currentWidth <= responsive.mobile') {'
            ';
        }'
            deviceClass = 'mobile';' }'
        } else if (currentWidth <= responsive.tablet') { ''
            deviceClass = 'tablet'; }
        }
        
        // デバイス固有のRTL設定を適用
        element.classList.add(`rtl-${ deviceClass)`);
        ';
        // デバイス別の調整''
        switch(deviceClass') {'
            '';
            case 'mobile':'';
                this.applyMobileRTL(element');'
                break;''
            case 'tablet':'';
                this.applyTabletRTL(element');'
                break;'
        }'
            case 'desktop': }
                this.applyDesktopRTL(element});
                break;
        }
        
        return deviceClass;
    }
    
    /**
     * CSS文字列をRTL用に変換
     */
    convertCSSToRTL(cssText: string): string { let rtlCSS = cssText;
        
        // プロパティを反転
        for(const [ltrProp, rtlProp] of this.flipProperties) {'
            ';
        }'
            const ltrRegex = new RegExp(ltrProp.replace(/[.*+? ^${)(')|[\]\\]/g, '\\$&''), 'g'); }
            rtlCSS = rtlCSS.replace(ltrRegex, rtlProp});
        }
         : undefined;
        // 数値の反転（transform: translateX など）
        rtlCSS = rtlCSS.replace(/translateX\((-?\d+(?:\.\d+)? )([^)]*)\)/g, (match, value, unit) => {  }
            return `translateX(${-parseFloat(value})}${unit})`;
        });
        ';
        // transform-origin の調整 : undefined''
        rtlCSS = rtlCSS.replace(/transform-origin:\s*(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)? %?)/g, (match, x, y') => {  ''
            if(x.includes('%') { }
                const percentage = 100 - parseFloat(x); : undefined }
                return `transform-origin: ${percentage}% ${y}`;
            }
            return match;
        });
        
        return rtlCSS;
    }
    
    /**
     * アニメーションをRTL用に調整
     */
    adaptAnimationForRTL(animationName: string, keyframes: AnimationKeyframes): AnimationKeyframes {
        const rtlKeyframes: AnimationKeyframes = {}
        Object.entries(keyframes).forEach(([percentage, rules]) => {  }
            const rtlRules: { [property: string]: string | number } = {}'
            Object.entries(rules).forEach(([property, value]) => {  if(this.flipProperties.has(property) {''
                    const flippedProperty = this.flipProperties.get(property')!; }'
                    rtlRules[flippedProperty] = value;' }'
                } else if (property === 'transform' && typeof value === 'string') { // transform プロパティの調整
                    rtlRules[property] = value.replace(/translateX\((-? \d+[^)]*)\)/g, (match, val) => { '
                        const numericValue = parseFloat(val); : undefined' }'
                        const unit = val.replace(/^-?\d+(?:\.\d+')? /, ''); }
                        return `translateX(${-numericValue}${unit})`;
                    });
                } else { rtlRules[property] = value; }
                }
            });
            ';
            rtlKeyframes[percentage] = rtlRules;''
        }');
        
        return rtlKeyframes;
    }
    
    /**
     * 内部メソッド群
     */'
     : undefined'';
    private applyDocumentDirection(direction: 'ltr' | 'rtl''): void { document.documentElement.style.direction = direction;''
        document.documentElement.setAttribute('dir', direction');'
        document.body.style.direction = direction;''
        document.body.setAttribute('dir', direction');
        ';
        // ルート要素にクラス追加''
        document.documentElement.classList.toggle('rtl-document', direction === 'rtl'');''
        document.body.classList.toggle('rtl-body', direction === 'rtl''); }
    }'
    '';
    private updateDynamicStyleSheet(direction: 'ltr' | 'rtl', language: string | null): void { // 既存の動的スタイルシートを削除
        if(this.currentLayout.styleSheet) {'
            '';
            this.currentLayout.styleSheet.remove('')';
        const style = document.createElement('style'');''
        style.id = 'rtl-dynamic-styles';'
        '';
        let css = '';'
        '';
        if (direction === 'rtl') {
            css += this.generateRTLBaseCSS();
            if (language) {
        }
                css += this.generateLanguageSpecificCSS(language); }
            }
        }
        
        style.textContent = css;
        document.head.appendChild(style);
        this.currentLayout.styleSheet = style;
    }
    
    private generateRTLBaseCSS(): string { return `
            .rtl-layout {
                direction: rtl,
                text-align: right, }
            }
            
            .rtl-layout .rtl-component { direction: rtl; }
            }
            
            .rtl-layout input,
            .rtl-layout textarea,
            .rtl-layout select { text-align: right, }
            }
            
            .rtl-layout .rtl-flip-horizontal { transform: scaleX(-1); }
            }
            
            .rtl-layout .rtl-preserve-content { direction: ltr,
                text-align: left, }
            }
        `;
    }
    ';
    private generateLanguageSpecificCSS(language: string): string { const settings = this.rtlDetector.getRTLSettings(language);''
        if (!settings') return '';
        ';
        return `' }'
            .rtl-layout[lang="${language}"] {
                font-family: ${settings.fontFamily}
                font-size: ${settings.fontSize}
                line-height: ${settings.lineHeight}
                word-spacing: ${settings.wordSpacing}
                letter-spacing: ${settings.letterSpacing}
            }
        `;
    }"
    "";
    private applyBasicRTLStyles(element: HTMLElement"): void { ""
        element.style.direction = 'rtl';''
        element.setAttribute('dir', 'rtl'');''
        element.classList.add('rtl-layout', 'rtl-component'); }
    }
    
    private applyComponentSpecificRTL(element: HTMLElement, componentType: string, customRules: { [selector: string]: string ): void {
        const settings = this.componentSettings.get(componentType);
        if (!settings) return;
        ';
        // 水平反転''
        if(settings.flipHorizontal') {'
            ';
        }'
            element.classList.add('rtl-flip-horizontal'); }
        }
        ';
        // アイコン保持''
        if(settings.preserveIcons') {'
            '';
            const icons = element.querySelectorAll('.icon, .fa, [class*="icon-"]');'
        }'
            icons.forEach(icon => { ');' }'
                icon.classList.add('rtl-preserve-content'); }
            });
        }
        
        // カスタムルール適用
        Object.entries(settings.customRules).forEach(([selector, rule]) => {  const targets = element.querySelectorAll(selector); }
            targets.forEach(target => {); }
                target.classList.add(`rtl-rule-${rule}`);
            });
        });
        
        // 追加のカスタムルール
        Object.entries(customRules).forEach(([selector, rule]) => {  const targets = element.querySelectorAll(selector); }
            targets.forEach(target => {); }
                target.classList.add(`rtl-custom-${rule}`);
            });
        });
    }
    
    private processChildElements(element: HTMLElement, componentType: string): void { const children = element.children;
        for(let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            this.applyRTLLayout(child, {)
                componentType: componentType,);
        }
                preserveContent: false); }
        }
    }
    ';
    private adaptElementAnimations(element: HTMLElement): void { ''
        const computedStyle = window.getComputedStyle(element');
        const animationName = computedStyle.animationName;'
        '';
        if(animationName && animationName !== 'none') {
            
        }
            // アニメーション名にRTLサフィックスを追加 }
            element.style.animationName = `${animationName}-rtl`;
        }
    }'
    '';
    private applyMobileRTL(element: HTMLElement'): void { ''
        element.style.padding = '10px';''
        element.style.fontSize = '14px'; }
    }'
    '';
    private applyTabletRTL(element: HTMLElement'): void { ''
        element.style.padding = '15px';''
        element.style.fontSize = '16px'; }
    }'
    '';
    private applyDesktopRTL(element: HTMLElement'): void { ''
        element.style.padding = '20px';''
        element.style.fontSize = '18px'; }
    }
    ';
    private saveElementStyles(element: HTMLElement): OriginalStyles { ''
        const computedStyle = window.getComputedStyle(element'); }
        const styles: OriginalStyles = {}
        // 主要なスタイルプロパティを保存'
        const properties = ['';
            'direction', 'textAlign', 'marginLeft', 'marginRight','';
            'paddingLeft', 'paddingRight', 'left', 'right',']';
            'transform', 'transformOrigin'];
        ];
        
        properties.forEach(prop => {  ); }
            styles[prop] = computedStyle.getPropertyValue(prop); }
        });
        
        return styles;
    }
    
    private restoreElementStyles(element: HTMLElement, originalStyles: OriginalStyles): void { Object.entries(originalStyles).forEach(([property, value]) => {  }'
            (element.style as any)[property] = value;' }'
        }');
    }'
    '';
    private dispatchLayoutChangeEvent(newDirection: 'ltr' | 'rtl', oldDirection: 'ltr' | 'rtl', language: string | null'): void { ''
        const event = new CustomEvent<LayoutChangeEventDetail>('rtlLayoutChange', {
            detail: {
                newDirection: newDirection,
                oldDirection: oldDirection,
                language: language);
                timestamp: new Date().toISOString(); }
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * 公開API
     */
    
    /**
     * 現在のレイアウト方向を取得'
     */''
    getCurrentDirection('): 'ltr' | 'rtl' { return this.currentLayout.direction; }
    }
    
    /**
     * 現在のレイアウト言語を取得
     */
    getCurrentLanguage(): string | null { return this.currentLayout.language; }
    }
    
    /**
     * レイアウト設定を更新
     */'
    updateSettings(newSettings: Partial<LayoutSettings>): void { ''
        Object.assign(this.layoutSettings, newSettings');''
        console.log('RTL layout settings updated:', newSettings); }
    }
    
    /**
     * コンポーネント設定を追加
     */
    addComponentSettings(componentType: string, settings: ComponentSettings): void { this.componentSettings.set(componentType, settings); }
        console.log(`Component settings added for: ${componentType)`});
    }
    
    /**
     * 統計情報を取得'
     */''
    getStats(''';
            appliedElementsCount: this.currentLayout.appliedElements ? 'WeakSet' : 0,
            supportedComponents: this.componentSettings.size,
            flipProperties: this.flipProperties.size,
            preserveProperties: this.preserveProperties.size;
        },
    }
}

// シングルトンインスタンス)
let rtlLayoutManagerInstance: RTLLayoutManager | null = null);
/**
 * RTLLayoutManagerのシングルトンインスタンスを取得
 */'
export function getRTLLayoutManager(): RTLLayoutManager { if (!rtlLayoutManagerInstance) {''
        rtlLayoutManagerInstance = new RTLLayoutManager(' })