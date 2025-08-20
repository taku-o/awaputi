/**
 * InterfaceSimplifier
 * 
 * インターフェース簡素化実行システム機能を担当
 * UI Transformation Engine Patternの一部として設計
 * 
 * **Features**:
 * - Dynamic DOM manipulation and style injection
 * - Rule-based UI element simplification
 * - Reversible transformation operations
 * - Real-time mutation observation and adaptation
 * 
 * @module InterfaceSimplifier
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface SimplificationRules { hideElements: HideElementsRules,
    animations: AnimationRules,
    effects: EffectRules,
    typography: TypographyRules,
    colors: ColorRules,
    layout: LayoutRules;
    }
}

export interface HideElementsRules { decorative: string[],
    secondary: string[],
    advanced: string[],
    nonEssential: string[]; }
}

export interface AnimationRules { disable: string[],
    reduce: AnimationReductionConfig;
    }
}

export interface AnimationReductionConfig { duration: string,
    easing: string; }
}

export interface EffectRules { disable: string[],
    reduce: Record<string, string>, }
}

export interface TypographyRules { simplify: Record<string, string>,
    sizes: Record<string, string>, }
}

export interface ColorRules { highContrast: Record<string, string>,
    monochrome: Record<string, string>, }
}

export interface LayoutRules { simplify: Record<string, string>,
    grid: Record<string, string>, }
}

export interface SimplificationOptions { highContrast?: boolean;
    monochrome?: boolean;
    largeText?: boolean;
    reduceAnimations?: boolean;
    reduceEffects?: boolean;
    reduceImages?: boolean;
    simplifyLayout?: boolean;
    simplifyNavigation?: boolean;
    customSelectors?: string[];
    preserveElements?: string[]; }
}

export interface SimplificationOperation { type: OperationType,
    target?: ElementCategory;
    parameters?: Record<string, any>;
    priority?: number;
    reversible?: boolean; }
}

export interface ActiveSimplification { level: SimplificationLevel,
    options: SimplificationOptions,
    operations: OperationResult[],
    timestamp: number; }
}

export interface OperationResult { success: boolean,
    operation: OperationType,
    category?: ElementCategory;
    elementsAffected?: number;
    elements?: HTMLElement[];
    styleElement?: HTMLStyleElement;
    error?: string; }
}

export interface OriginalState { element: HTMLElement,
    property: string,
    value: string; }
}

export interface SimplificationResult { success: boolean,
    id?: string;
    operationsApplied?: number;
    details?: OperationResult[];
    error?: string; }
}

export interface RevertResult { success: boolean,
    operationsReverted?: number;
    error?: string; }
}

export interface RevertAllResult { success: boolean,
    revertedSimplifications: number,
    results: RevertResult[];
    }
}

export interface SimplificationStats { activeSimplifications: number,
    totalOperations: number,
    originalStatesStored: number,
    observedElements: number; }
}

export interface StyleInjection { id: string,
    css: string,
    element: HTMLStyleElement,
    timestamp: number; }
}

export interface ElementMatch { element: HTMLElement,
    selector: string,
    category: ElementCategory,
    affectedProperties: string[]; }
}

export interface TransformationContext { level: SimplificationLevel,
    options: SimplificationOptions,
    targetElements: Set<HTMLElement>,
    appliedStyles: Map<string, StyleInjection>,
    preservedElements: Set<HTMLElement>;
    }
}

export interface ValidationResult { isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[];
    }
}

export interface ValidationError { field: string,
    message: string,
    code: string; }
}

export interface ValidationWarning { field: string,
    message: string,
    suggestion: string; }
}

// 列挙型
export type SimplificationLevel = 'none' | 'minimal' | 'moderate' | 'significant' | 'extreme';'
export type OperationType = '';
    | 'hideElements' '';
    | 'disableAnimations' '';
    | 'reduceAnimations' '';
    | 'disableEffects' '';
    | 'reduceEffects' '';
    | 'simplifyTypography' '';
    | 'simplifyColors' '';
    | 'simplifyLayout' '';
    | 'applyHighContrast' '';
    | 'applyMonochrome' '';
    | 'increaseFontSize';''
export type ElementCategory = 'decorative' | 'secondary' | 'advanced' | 'nonEssential';

// 定数
export const DEFAULT_SIMPLIFICATION_RULES: SimplificationRules = { hideElements: {'
        decorative: ['';
            '.decoration', '.ornament', '.fancy-border',']';
            '.background-pattern', '.visual-flair', '.aesthetic-element'];
        ],';
        secondary: ['';
            '.secondary-info', '.extra-details', '.bonus-content',']';
            '.advertisement', '.promotion', '.sidebar-info'];
        ],';
        advanced: ['';
            '.advanced-controls', '.expert-settings', '.debug-info',']';
            '.developer-tools', '.admin-panel', '.power-user-features'];
        ],';
        nonEssential: ['';
            '.social-media', '.share-buttons', '.rating-widget',']';
            '.recommendation', '.trending', '.related-content'];
        ] }
    },'
    animations: { disable: [']'
            'animation', 'transition', 'transform'];
        ],';
        reduce: {''
            duration: '0.1s','';
            easing: 'linear' }
        }
    },'
    effects: { disable: [''
            'box-shadow', 'text-shadow', 'filter',']';
            'backdrop-filter', 'clip-path'];
        ],';
        reduce: {''
            'box-shadow': 'none','';
            'text-shadow': 'none','';
            'filter': 'none' }
        }
    },'
    typography: { simplify: {''
            'font-family': 'Arial, sans-serif','';
            'font-weight': 'normal','';
            'text-decoration': 'none' }
        },'
        sizes: { ''
            'font-size': '14px','';
            'line-height': '1.5' }
        }
    },'
    colors: { highContrast: {''
            'color': '#000000','';
            'background-color': '#ffffff','';
            'border-color': '#666666' }
        },'
        monochrome: { ''
            filter: 'grayscale(100%')' }
        }
    },'
    layout: { simplify: {''
            'padding': '8px','';
            'margin': '4px','';
            'border-radius': '0px','';
            'border': '1px solid #ccc' }
        },'
        grid: { ''
            'display': 'block','';
            'float': 'none','';
            'position': 'static' }
        }
    }
} as const;

export const OPERATION_PRIORITIES: Record<OperationType, number> = { hideElements: 1,
    disableAnimations: 2,
    reduceAnimations: 3,
    disableEffects: 4,
    reduceEffects: 5,
    simplifyTypography: 6,
    simplifyColors: 7,
    simplifyLayout: 8,
    applyHighContrast: 9,
    applyMonochrome: 10,
    increaseFontSize: 11 }
} as const,

export const CSS_TEMPLATES = { DISABLE_ANIMATIONS: `
        *, *::before, *::after {
            animation-duration: 0.01ms !important,
            animation-iteration-count: 1 !important,
            transition-duration: 0.01ms !important,
            scroll-behavior: auto !important, }
        }
    `,
    REDUCE_ANIMATIONS: `;
        *, *::before, *::after { animation-duration: 0.1s !important,
            transition-duration: 0.1s !important,
            transition-timing-function: linear !important, }
        }
    `,
    DISABLE_EFFECTS: `;
        * { box-shadow: none !important,
            text-shadow: none !important,
            filter: none !important,
            backdrop-filter: none !important,
            clip-path: none !important, }
        }
    `,
    REDUCE_EFFECTS: `;
        * { box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            text-shadow: none !important,
            filter: none !important; }
        }
    `,
    SIMPLIFY_TYPOGRAPHY: `;
        * { font-family: Arial, sans-serif !important;
            font-weight: normal !important,
            text-decoration: none !important,
            font-style: normal !important, }
        }
    `,
    SIMPLIFY_COLORS: `;
        * { background-image: none !important,
            background-gradient: none !important, }
        }
    `,
    SIMPLIFY_LAYOUT: `;
        * { border-radius: 0 !important,
            padding: 8px !important,
            margin: 4px !important; }
        }
    `,
    HIGH_CONTRAST: `;
        * { color: #000000 !important,
            background-color: #ffffff !important,
            border-color: #666666 !important, }
        }
        
        a, button { color: #0000ff !important; }
        }
        
        a:visited { color: #800080 !important; }
        }
    `,
    MONOCHROME: `;
        * { filter: grayscale(100%) !important; }
        }
    `,
    LARGE_TEXT: `;
        * { font-size: 18px !important,
            line-height: 1.6 !important, }
        }
        
        h1 { font-size: 28px !important, }
        h2 { font-size: 24px !important, }
        h3 { font-size: 20px !important, }
    `;
} as const;

// ユーティリティ関数
export function validateSimplificationOptions(options: Partial<SimplificationOptions>): ValidationResult { const errors: ValidationError[] = [],
    const warnings: ValidationWarning[] = [],
    
    // カスタムセレクタの検証
    if(options.customSelectors) {
        options.customSelectors.forEach((selector, index) => { 
    }
            try { }'
                document.querySelector(selector);' }'
            } catch (error') { errors.push({ })
                    field: `customSelectors[${index}]`)'
                    message: `Invalid CSS selector: ${selector}`,')'
                    code: 'INVALID_SELECTOR'),
                });
            }
        });
    }
    
    // 保存要素セレクタの検証
    if(options.preserveElements) {
        options.preserveElements.forEach((selector, index) => { 
    }
            try { }'
                document.querySelector(selector);' }'
            } catch (error') { errors.push({ })
                    field: `preserveElements[${index}]`)'
                    message: `Invalid CSS selector: ${selector}`,')'
                    code: 'INVALID_PRESERVE_SELECTOR'),
                });
            }
        });
    }
    ';
    // オプションの組み合わせチェック''
    if(options.highContrast && options.monochrome') {'
        warnings.push({''
            field: 'options',')';
            message: 'High contrast and monochrome options may conflict',');
    }'
            suggestion: 'Consider using only one color modification option'); }
    }
    
    return { isValid: errors.length === 0,
        errors, };
        warnings }
    };
}
';
export function generateStyleId(operationType: OperationType): string { ' }'
    return `simplification-${operationType.toLowerCase().replace(/([A-Z]')/g, '-$1'})}`;
}

export function sortOperationsByPriority(operations: SimplificationOperation[]): SimplificationOperation[] { return [...operations].sort((a, b) => { 
        const priorityA = OPERATION_PRIORITIES[a.type] || 999;
        const priorityB = OPERATION_PRIORITIES[b.type] || 999; }
        return priorityA - priorityB; }
    });
}
';
export function isElementVisible(element: HTMLElement): boolean { ''
    const style = window.getComputedStyle(element');''
    return style.display !== 'none' && '';
           style.visibility !== 'hidden' && '';
           style.opacity !== '0'; }
}

export function findAffectedElements(selectors: string[]): ElementMatch[] { const matches: ElementMatch[] = [],
    
    selectors.forEach(selector => { )
        try {);
            const elements = document.querySelectorAll(selector);'
            elements.forEach(element => {);''
                if(element instanceof HTMLElement') {
                    matches.push({)
                        element)';
                        selector,';
                }'
                        category: 'decorative', // デフォルト') }'
                        affectedProperties: ['display']); }
                    });
                }
            });
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
        }
    });
    
    return matches;
}

export class InterfaceSimplifier {
    private activeSimplifications: Map<string, ActiveSimplification>;
    private simplificationRules: SimplificationRules;
    private originalStates: Map<string, OriginalState>;
    private observedElements: Set<HTMLElement>;
    private mutationObserver: MutationObserver;
    private appliedStyles: Map<string, StyleInjection>;

    constructor() {

        this.activeSimplifications = new Map();
        this.simplificationRules = JSON.parse(JSON.stringify(DEFAULT_SIMPLIFICATION_RULES);
        this.originalStates = new Map();
        this.observedElements = new Set();
        this.appliedStyles = new Map();
        

    }
    }
        this.setupMutationObserver(); }
    }

    /**
     * Mutation Observerを設定
     */'
    private setupMutationObserver(): void { this.mutationObserver = new MutationObserver((mutations) => { ''
            mutations.forEach(mutation => {');''
                if(mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {);
                }
                        if (node.nodeType === Node.ELEMENT_NODE) { }
                            this.applyActiveSimplifications(node as HTMLElement); }
                        }
                    });
                }'
            });''
        }');'
'';
        if(typeof document !== 'undefined') {
            this.mutationObserver.observe(document.body, {)
                childList: true,);
        }
                subtree: true); }
        }
    }

    /**
     * 簡素化を適用
     */
    applySimplification(level: SimplificationLevel, options: SimplificationOptions = { ): SimplificationResult { }
        const simplificationId = `simplification_${Date.now(})}`;
        
        try { // オプションの検証
            const validation = validateSimplificationOptions(options);'
            if (!validation.isValid) {' }'
                throw new Error(`Invalid options: ${validation.errors.map(e => e.message').join(', '})}`);
            }
            
            const operations = this.getSimplificationOperations(level, options);
            const sortedOperations = sortOperationsByPriority(operations);
            const appliedOperations: OperationResult[] = [],

            sortedOperations.forEach(operation => {  );
                const result = this.executeOperation(operation);
                if (result.success) { }
                    appliedOperations.push(result); }
                }
            });

            // アクティブな簡素化を記録
            this.activeSimplifications.set(simplificationId, { level)
                options,);
                operations: appliedOperations),
                timestamp: Date.now(); }
            });

            return { success: true,
                id: simplificationId,
                operationsApplied: appliedOperations.length, };
                details: appliedOperations }
            },'
'';
        } catch (error') { ''
            console.error('Simplification failed:', error);
            return { success: false, };
                error: (error as Error).message }
            },
        }
    }

    /**
     * 簡素化操作を取得
     */
    private getSimplificationOperations(level: SimplificationLevel, options: SimplificationOptions): SimplificationOperation[] { const operations: SimplificationOperation[] = [],'
'';
        switch(level') {'
            '';
            case 'minimal':;
        }'
                operations.push(') }'
                    { type: 'hideElements', target: 'decorative' }')''
                    { type: 'reduceAnimations' )''
                ');
                break;'
'';
            case 'moderate':';
                operations.push(' }'
                    { type: 'hideElements', target: 'decorative' },')'
                    { type: 'hideElements', target: 'secondary' },')'
                    { type: 'disableAnimations' }')''
                    { type: 'reduceEffects' )''
                ');
                break;'
'';
            case 'significant':';
                operations.push(' }'
                    { type: 'hideElements', target: 'decorative' },''
                    { type: 'hideElements', target: 'secondary' },''
                    { type: 'hideElements', target: 'advanced' },')'
                    { type: 'disableAnimations' },')'
                    { type: 'disableEffects' }')''
                    { type: 'simplifyTypography' )''
                ');
                break;'
'';
            case 'extreme':';
                operations.push(' }'
                    { type: 'hideElements', target: 'decorative' },''
                    { type: 'hideElements', target: 'secondary' },''
                    { type: 'hideElements', target: 'advanced' },''
                    { type: 'hideElements', target: 'nonEssential' },''
                    { type: 'disableAnimations' },''
                    { type: 'disableEffects' },')'
                    { type: 'simplifyTypography' },')'
                    { type: 'simplifyColors' }')''
                    { type: 'simplifyLayout' )
                );
                break; }
        }
';
        // カスタムオプションを追加''
        if(options.highContrast') {'
            ';
        }'
            operations.push({ type: 'applyHighContrast' ); }
        }'
'';
        if(options.monochrome') {'
            ';
        }'
            operations.push({ type: 'applyMonochrome' ); }
        }'
'';
        if(options.largeText') {'
            ';
        }'
            operations.push({ type: 'increaseFontSize' ); }
        }

        return operations;
    }

    /**
     * 操作を実行
     */'
    private executeOperation(operation: SimplificationOperation): OperationResult { try {''
            switch(operation.type') {'
                '';
                case 'hideElements':'';
                    return this.hideElements(operation.target!');'
'';
                case 'disableAnimations':'';
                    return this.disableAnimations(''';
                case 'reduceAnimations':'';
                    return this.reduceAnimations(''';
                case 'disableEffects':'';
                    return this.disableEffects(''';
                case 'reduceEffects':'';
                    return this.reduceEffects(''';
                case 'simplifyTypography':'';
                    return this.simplifyTypography(''';
                case 'simplifyColors':'';
                    return this.simplifyColors(''';
                case 'simplifyLayout':'';
                    return this.simplifyLayout(''';
                case 'applyHighContrast':'';
                    return this.applyHighContrast(''';
                case 'applyMonochrome':'';
                    return this.applyMonochrome('')';
                case 'increaseFontSize':);
                    return this.increaseFontSize();

            }
                default: }
                    throw new Error(`Unknown operation: ${operation.type)`}),
            } catch (error) { return { success: false,
                operation: operation.type, };
                error: (error as Error).message }
            },
        }
    }

    /**
     * 要素を非表示
     */'
    private hideElements(category: ElementCategory): OperationResult { const selectors = this.simplificationRules.hideElements[category];''
        if (!selectors') {' }'
            return { success: false, operation: 'hideElements', error: 'Unknown category' }
        }

        const hiddenElements: HTMLElement[] = [],
        selectors.forEach(selector => {  );
            const elements = document.querySelectorAll(selector);'
            elements.forEach(element => {);''
                if(element instanceof HTMLElement') {'
                    '';
                    this.saveOriginalState(element, 'display'');''
                    element.style.display = 'none';
                }
                    hiddenElements.push(element); }
                    this.observedElements.add(element); }
                }'
            });''
        }');
';
        return { success: true,''
            operation: 'hideElements',
            category,
            elementsAffected: hiddenElements.length, };
            elements: hiddenElements }
        },
    }

    /**
     * アニメーションを無効化'
     */''
    private disableAnimations('')';
        const styleElement = this.createOrUpdateGlobalStyle('disable-animations', CSS_TEMPLATES.DISABLE_ANIMATIONS');
';
        return { success: true,''
            operation: 'disableAnimations', };
            styleElement }
        };
    }

    /**
     * アニメーションを軽減'
     */''
    private reduceAnimations('')';
        const styleElement = this.createOrUpdateGlobalStyle('reduce-animations', CSS_TEMPLATES.REDUCE_ANIMATIONS');
';
        return { success: true,''
            operation: 'reduceAnimations', };
            styleElement }
        };
    }

    /**
     * 視覚効果を無効化'
     */''
    private disableEffects('')';
        const styleElement = this.createOrUpdateGlobalStyle('disable-effects', CSS_TEMPLATES.DISABLE_EFFECTS');
';
        return { success: true,''
            operation: 'disableEffects', };
            styleElement }
        };
    }

    /**
     * 視覚効果を軽減'
     */''
    private reduceEffects('')';
        const styleElement = this.createOrUpdateGlobalStyle('reduce-effects', CSS_TEMPLATES.REDUCE_EFFECTS');
';
        return { success: true,''
            operation: 'reduceEffects', };
            styleElement }
        };
    }

    /**
     * タイポグラフィを簡素化'
     */''
    private simplifyTypography('')';
        const styleElement = this.createOrUpdateGlobalStyle('simplify-typography', CSS_TEMPLATES.SIMPLIFY_TYPOGRAPHY');
';
        return { success: true,''
            operation: 'simplifyTypography', };
            styleElement }
        };
    }

    /**
     * 色彩を簡素化'
     */''
    private simplifyColors('')';
        const styleElement = this.createOrUpdateGlobalStyle('simplify-colors', CSS_TEMPLATES.SIMPLIFY_COLORS');
';
        return { success: true,''
            operation: 'simplifyColors', };
            styleElement }
        };
    }

    /**
     * レイアウトを簡素化'
     */''
    private simplifyLayout('')';
        const styleElement = this.createOrUpdateGlobalStyle('simplify-layout', CSS_TEMPLATES.SIMPLIFY_LAYOUT');
';
        return { success: true,''
            operation: 'simplifyLayout', };
            styleElement }
        };
    }

    /**
     * 高コントラストを適用'
     */''
    private applyHighContrast('')';
        const styleElement = this.createOrUpdateGlobalStyle('high-contrast', CSS_TEMPLATES.HIGH_CONTRAST');
';
        return { success: true,''
            operation: 'applyHighContrast', };
            styleElement }
        };
    }

    /**
     * モノクロームを適用'
     */''
    private applyMonochrome('')';
        const styleElement = this.createOrUpdateGlobalStyle('monochrome', CSS_TEMPLATES.MONOCHROME');
';
        return { success: true,''
            operation: 'applyMonochrome', };
            styleElement }
        };
    }

    /**
     * フォントサイズを拡大'
     */''
    private increaseFontSize('')';
        const styleElement = this.createOrUpdateGlobalStyle('large-text', CSS_TEMPLATES.LARGE_TEXT');
';
        return { success: true,''
            operation: 'increaseFontSize', };
            styleElement }
        };
    }

    /**
     * グローバルスタイルを作成または更新
     */
    private createOrUpdateGlobalStyle(id: string, css: string): HTMLStyleElement { const styleId = generateStyleId(id as OperationType);
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;'
        '';
        if(!styleElement') {'
            '';
            styleElement = document.createElement('style');
            styleElement.id = styleId;
        }
            document.head.appendChild(styleElement); }
        }
        
        styleElement.textContent = css;
        
        // スタイル注入を記録
        this.appliedStyles.set(styleId, { id: styleId)
            css,);
            element: styleElement),
            timestamp: Date.now(); }
        });
        
        return styleElement;
    }

    /**
     * 元の状態を保存
     */
    private saveOriginalState(element: HTMLElement, property: string): void {
        const key = `${element.tagName}_${element.className}_${property}`;
        if(!this.originalStates.has(key) {
            this.originalStates.set(key, {)
                element,);
                property);
        }
                value: element.style[property as any] || window.getComputedStyle(element)[property as any] }
            }),
        }
    }

    /**
     * 簡素化を元に戻す
     */'
    revertSimplification(simplificationId: string): RevertResult { const simplification = this.activeSimplifications.get(simplificationId);''
        if (!simplification') {' }'
            return { success: false, error: 'Simplification not found' }
        }

        try { let revertedOperations = 0;

            simplification.operations.forEach(operation => { );
                if(this.revertOperation(operation) { }
                    revertedOperations++; }
                }
            });

            this.activeSimplifications.delete(simplificationId);

            return { success: true, };
                operationsReverted: revertedOperations }
            },

        } catch (error) { return { success: false, };
                error: (error as Error).message }
            },
        }
    }

    /**
     * 操作を元に戻す
     */'
    private revertOperation(operation: OperationResult): boolean { try {''
            switch(operation.operation') {'
                '';
                case 'hideElements':';
                    operation.elements? .forEach(element => { ')
            }'
                        element.style.display = ''); }
                        this.observedElements.delete(element); }
                    });
                    return true;
 : undefined;
                default:;
                    // グローバルスタイルを削除
                    if(operation.styleElement) {
                        const styleId = operation.styleElement.id,
                        operation.styleElement.remove();
                        this.appliedStyles.delete(styleId);
                    }
                        return true; }
                    }'
                    return false;''
            } catch (error') { ''
            console.error('Failed to revert operation:', error);
            return false; }
        }
    }

    /**
     * 全ての簡素化を元に戻す
     */
    revertAllSimplifications(): RevertAllResult { const simplificationIds = Array.from(this.activeSimplifications.keys();
        const results: RevertResult[] = [],

        simplificationIds.forEach(id => { ); }'
            results.push(this.revertSimplification(id);' }'
        }');
';
        // グローバルスタイルを全て削除''
        document.querySelectorAll('style[id^="simplification-"]').forEach(style => {  ); }
            style.remove(); }
        });

        // 記録をクリア
        this.appliedStyles.clear();
        this.observedElements.clear();

        return { success: true,
            revertedSimplifications: results.filter(r = > r.success).length };
            results }
        };
    }

    /**
     * アクティブな簡素化に新しい要素を適用
     */'
    private applyActiveSimplifications(element: HTMLElement): void { this.activeSimplifications.forEach(simplification => { ')'
            simplification.operations.forEach(operation => {');''
                if(operation.operation === 'hideElements' && operation.category) {
                    const selectors = this.simplificationRules.hideElements[operation.category];
                    selectors.forEach(selector => {)'
                        try {);''
                            if (element.matches && element.matches(selector)') {''
                                this.saveOriginalState(element, 'display'');'
                }'
                                element.style.display = 'none'; }
                                this.observedElements.add(element); }
                            } catch (error) {
                            console.warn(`Invalid selector: ${selector}`, error);
                        }
                    });
                }
            });
        });
    }

    /**
     * アクティブな簡素化を取得
     */
    getActiveSimplifications(): Array<{ id: string } & ActiveSimplification> { return Array.from(this.activeSimplifications.entries().map(([id, simplification]) => ({
            id);
            ...simplification }
        });
    }

    /**
     * 適用されたスタイルを取得
     */
    getAppliedStyles(): StyleInjection[] { return Array.from(this.appliedStyles.values(); }
    }

    /**
     * 元の状態を取得
     */
    getOriginalStates(): OriginalState[] { return Array.from(this.originalStates.values(); }
    }

    /**
     * 簡素化統計を取得
     */
    getStats(): SimplificationStats { const active = this.activeSimplifications.size;
        const totalOperations = Array.from(this.activeSimplifications.values();
            .reduce((sum, s) => sum + s.operations.length, 0);

        return { activeSimplifications: active,
            totalOperations,
            originalStatesStored: this.originalStates.size, };
            observedElements: this.observedElements.size }
        },
    }

    /**
     * 簡素化ルールを更新
     */
    updateSimplificationRules(newRules: Partial<SimplificationRules>): void { Object.assign(this.simplificationRules, newRules); }
    }

    /**
     * 簡素化ルールを取得
     */
    getSimplificationRules(): SimplificationRules { return JSON.parse(JSON.stringify(this.simplificationRules); }
    }

    /**
     * 特定レベルの簡素化が適用されているか確認
     */
    hasSimplificationLevel(level: SimplificationLevel): boolean { return Array.from(this.activeSimplifications.values()
            .some(simplification => simplification.level === level); }
    }

    /**
     * 特定操作が適用されているか確認
     */
    hasOperationType(operationType: OperationType): boolean { return Array.from(this.activeSimplifications.values()
            .some(simplification => );
                simplification.operations.some(op => op.operation === operationType); }
    }

    /**
     * クリーンアップ
     */
    destroy(): void { this.revertAllSimplifications();
        
        if(this.mutationObserver) {
        
            
        
        }
            this.mutationObserver.disconnect(); }
        }

        this.activeSimplifications.clear();
        this.originalStates.clear();'
        this.observedElements.clear();''
        this.appliedStyles.clear(');