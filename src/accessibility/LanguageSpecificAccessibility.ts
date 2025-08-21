/**
 * LanguageSpecificAccessibility - 言語固有のアクセシビリティ機能
 * RTL言語サポート、言語固有キーボードショートカット、文化的に適応したアクセシビリティ
 */

import { getErrorHandler  } from '../utils/ErrorHandler.js';

// Interfaces for language-specific accessibility
interface LanguageAccessibilityConfig { enabled: boolean;
    autoDetectLanguage: boolean;
    adaptKeyboardLayouts: boolean;
    culturalMetaphors: boolean;
    rtlSupport: boolean;
    bidirectionalText: boolean;

interface KeyboardLayout { name: string;
    shortcuts: Record<string, string>;
    navigationKeys: Record<string, string>;
    direction?: 'ltr' | 'rtl' }

interface KeyboardLayouts { [language: string]: KeyboardLayout;

interface CulturalMetaphor { directions: {
        nex,t: string;
        previous: string;
        forward: string;
    backward: string;
    gestures: Record<string, string>;
    colors: Record<string, string>;
}

interface CulturalMetaphors { [language: string]: CulturalMetaphor;

interface RTLAdaptation { applied: boolean;
    elements: Set<HTMLElement>;
    originalStyles: Map<HTMLElement, {
        textAlign?: string;
        direction?: string;>;
}

interface NavigationKeyMapping { [key: string]: string;
';'

interface LanguageInfo { language: string,''
    direction: 'ltr' | 'rtl';
    isRTL: boolean;
    keyboardLayout: string;
    culturalMetaphors: CulturalMetaphor | Record<string, never> }

interface ElementDescription { type?: string,
    text?: string;
    action?: string;
    status?: string;
    description?: string;

// AccessibilityManager interface (minimal, definition);
interface AccessibilityManager { gameEngine?: any,
    localizationManager?: {
        getCurrentLanguag,e: () => string;
        ta11y: (key: string) => string | undefined  }
    };
    keyboardAccessibilityManager?: any;
    gameContentDescriber?: { updateGestureDescriptions: (gestures: Record<string, string>) => void }
    };
    eventSystem?: { ''
        emit: (event: string, data: any') => void  }'
    }

export class LanguageSpecificAccessibility {
    private accessibilityManager: AccessibilityManager | null';'
    private gameEngine: any';'
    private localizationManager: AccessibilityManager['localizationManager'];
    private config: LanguageAccessibilityConfig';'
    private rtlLanguages: string[]';'
    private currentDirection: 'ltr' | 'rtl';
    private keyboardLayouts: KeyboardLayouts;
    private culturalMetaphors: CulturalMetaphors;
    private currentLanguage: string;
    private currentLayout: KeyboardLayout | null;
    private currentMetaphors: CulturalMetaphor | null;
    private, rtlAdaptation: RTLAdaptation;
    private navigationKeyMapping?: NavigationKeyMapping,
    private keyboardEventHandler?: (event: KeyboardEvent) => void;

    constructor(accessibilityManager: AccessibilityManager | null) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        this.localizationManager = accessibilityManager?.localizationManager;
        
        // 言語固有設定
        this.config = { : undefined
            enabled: true;
            autoDetectLanguage: true;
            adaptKeyboardLayouts: true;
            culturalMetaphors: true;
    rtlSupport: true;
            bidirectionalText: true;
        ;
        // RTL言語サポート
        this.rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'arc'];
        this.currentDirection = 'ltr';
        
        // 言語固有キーボードレイアウト
        this.keyboardLayouts = { ''
            // QWERTY(英語)', 'en': {''
                name: 'QWERTY';
                shortcuts: {', 'pause': 'KeyP';'
                    'menu': 'KeyM',
                    'help': 'KeyH',
                    'settings': 'KeyS',
                    'fullscreen': 'F11' },

                navigationKeys: { ', 'up': 'ArrowUp';'
                    'down': 'ArrowDown',
                    'left': 'ArrowLeft',
                    'right': 'ArrowRight',
                    'select': 'Enter',
                    'back': 'Escape' 
    },

            // QWERTZ(ドイツ語)', 'de': { ''
                name: 'QWERTZ';
                shortcuts: {', 'pause': 'KeyP';'
                    'menu': 'KeyM',
                    'hilfe': 'KeyH',
                    'einstellungen': 'KeyE',
                    'vollbild': 'F11' },

                navigationKeys: { ', 'hoch': 'ArrowUp';'
                    'runter': 'ArrowDown',
                    'links': 'ArrowLeft',
                    'rechts': 'ArrowRight',
                    'auswahl': 'Enter',
                    'zurueck': 'Escape' 
    },

            // AZERTY(フランス語)', 'fr': { ''
                name: 'AZERTY';
                shortcuts: {', 'pause': 'KeyP';'
                    'menu': 'KeyM',
                    'aide': 'KeyA',
                    'parametres': 'KeyP',
                    'pleinEcran': 'F11' },

                navigationKeys: { ', 'haut': 'ArrowUp';'
                    'bas': 'ArrowDown',
                    'gauche': 'ArrowLeft',
                    'droite': 'ArrowRight',
                    'selection': 'Enter',
                    'retour': 'Escape' 
    },
            // 日本語キーボード
            'ja': { ''
                name: 'JIS';
                shortcuts: {', 'ポーズ': 'KeyP';'
                    'メニュー': 'KeyM',
                    'ヘルプ': 'KeyH',
                    '設定': 'KeyS',
                    'フルスクリーン': 'F11' },

                navigationKeys: { ', '上': 'ArrowUp';'
                    '下': 'ArrowDown',
                    '左': 'ArrowLeft',
                    '右': 'ArrowRight',
                    '決定': 'Enter',
                    '戻る': 'Escape' 
    },
            // アラビア語キーボード
            'ar': { ''
                name: 'Arabic';
                shortcuts: {', 'ايقاف': 'KeyP';'
                    'قائمة': 'KeyM',
                    'مساعدة': 'KeyH',
                    'اعدادات': 'KeyS',
                    'ملء الشاشة': 'F11' },

                navigationKeys: {;
                    'فوق': 'ArrowUp',
                    'تحت': 'ArrowDown',
                    'يسار': 'ArrowLeft', // Note: في RTL، يسار يعني right;
                    'يمين': 'ArrowRight', // Note: في RTL، يمين يعني left;
                    'اختيار': 'Enter',
                    'رجوع': 'Escape' 
    },''
                direction: 'rtl';
            },
            // ヘブライ語キーボード
            'he': { ''
                name: 'Hebrew';
                shortcuts: {', 'השהיה': 'KeyP';'
                    'תפריט': 'KeyM',
                    'עזרה': 'KeyH',
                    'הגדרות': 'KeyS',
                    'מסך מלא': 'F11' },

                navigationKeys: { ', 'למעלה': 'ArrowUp';'
                    'למטה': 'ArrowDown',
                    'שמאל': 'ArrowLeft',
                    'ימין': 'ArrowRight',
                    'בחירה': 'Enter',
                    'חזור': 'Escape' 
    },''
                direction: 'rtl';
    },
        
        // 文化的アクセシビリティメタファー
        this.culturalMetaphors = {;
            'en': {'
                directions: {''
                    next: 'next';
                    previous: 'previous';
                    forward: 'forward';
                    backward: 'backward'
            };
                gestures: { ''
                    thumbUp: 'approve';
                    pointing: 'select'
            };
                colors: { ''
                    red: 'error';
                    green: 'success';
                    blue: 'information';
                    yellow: 'warning'
            }
            };
            'ja': { directions: {''
                    next: '次へ';
                    previous: '前へ';
                    forward: '進む';
                    backward: '戻る'
            };
                gestures: { ''
                    thumbUp: '良い';
                    pointing: '指示（避ける）'
            };
                colors: { ''
                    red: '危険';
                    green: '安全';
                    blue: '信頼';
                    yellow: '注意'
            }
            };
            'ar': { directions: {''
                    next: 'التالي';
                    previous: 'السابق';
                    forward: 'إلى الأمام';
                    backward: 'إلى الخلف'
            };
                gestures: { ''
                    thumbUp: 'موافق';
                    leftHand: 'تجنب';
                    pointing: 'اختيار'
            };
                colors: { ''
                    red: 'خطر';
                    green: 'آمان';
                    blue: 'معلومات';
                    yellow: 'تحذير'
            }
            };
            'zh': { directions: {''
                    next: '下一个';
                    previous: '上一个';
                    forward: '前進';
                    backward: '後退'
            };
                gestures: { ''
                    thumbUp: '好';
                    pointing: '指向'
            };
                colors: { ''
                    red: '幸运';
                    green: '成功';
                    gold: '繁荣';
                    white: '纯洁'
            }
};
        ';'
        // 現在の言語設定
        this.currentLanguage = 'ja';
        this.currentLayout = null;
        this.currentMetaphors = null;
        
        // RTL適応状態  
        this.rtlAdaptation = { applied: false;
            elements: new Set(
            originalStyles: new Map()','
        console.log('LanguageSpecificAccessibility, initialized');
        this.initialize() }'
    
    /**
     * 初期化
     */
    private initialize(): void { try {
            this.detectCurrentLanguage();
            this.applyLanguageSpecificSettings();
            this.setupKeyboardLayoutSupport();
            this.initializeCulturalMetaphors()','
            console.log('LanguageSpecificAccessibility, initialized successfully') }'

        } catch (error) { getErrorHandler()?.handleError(error, 'LANGUAGE_ACCESSIBILITY_ERROR', { : undefined''
                operation: 'initialize'
            };
        }
    }
    
    /**
     * 現在の言語を検出
     */
    private detectCurrentLanguage(): void { if (this.config.autoDetectLanguage) {
            // LocalizationManagerから言語を取得
            if (this.localizationManager) {

                this.currentLanguage = this.localizationManager.getCurrentLanguage() }

                this.currentLanguage = navigator.language.split('-'[0]; }'
}
        
        console.log(`Detected, language: ${this.currentLanguage}`};
    }
    
    /**
     * 言語固有設定の適用
     */
    private applyLanguageSpecificSettings(): void { // RTL言語の場合の特別処理
        if (this.isRTLLanguage(this.currentLanguage) {
    
}
            this.applyRTLSupport(); }
        }
        
        // キーボードレイアウトの適用
        this.applyKeyboardLayout(this.currentLanguage);
        
        // 文化的メタファーの適用
        this.applyCulturalMetaphors(this.currentLanguage);
    }
    
    /**
     * RTL言語判定
     */
    isRTLLanguage(language: string): boolean { return this.rtlLanguages.includes(language) }
    
    /**
     * RTLサポートの適用
     */
    private applyRTLSupport(): void { ''
        if(!this.config.rtlSupport) return,

        this.currentDirection = 'rtl';
        ','
        // HTML要素の direction 属性を設定
        document.documentElement.dir = 'rtl',
        document.documentElement.lang = this.currentLanguage,
        
        // ゲームCanvas要素のRTL適応
        this.applyRTLToGameElements();
        // キーボードナビゲーションの方向を反転
        this.adaptNavigationForRTL()','
        console.log('RTL, support applied') }'
    
    /**
     * ゲーム要素のRTL適応'
     */''
    private applyRTLToGameElements()';'
        const canvas = document.querySelector('canvas';
        if (canvas, instanceof HTMLCanvasElement) {
            // CSS transformでRTL適応（必要に応じて）
            canvas.style.direction = 'rtl' }

            this.rtlAdaptation.elements.add(canvas); }
        }
        ';'
        // UI要素のRTL適応
        const uiElements = document.querySelectorAll('.ui-element, .menu-item, .button);'
        uiElements.forEach(element => {  );
            if (element, instanceof HTMLElement) {
                this.rtlAdaptation.originalStyles.set(element, {
            };
                    textAlign: element.style.textAlign) }

                    direction: element.style.direction),' }'

                }');'

                element.style.direction = 'rtl';
                element.style.textAlign = 'right';
                this.rtlAdaptation.elements.add(element);
            }
        };
    }
    
    /**
     * RTL用ナビゲーション適応'
     */''
    private adaptNavigationForRTL('''
            'ArrowLeft': 'right',  // RTLでは左キーは右へ;
            'ArrowRight': 'left',  // RTLでは右キーは左へ  ;
            'ArrowUp': 'up',
            'ArrowDown': 'down';
        };

        ')';
        console.log('Navigation, adapted for, RTL');
    }
    
    /**
     * キーボードレイアウトの適用'
     */''
    private applyKeyboardLayout(language: string): void { ''
        this.currentLayout = this.keyboardLayouts[language] || this.keyboardLayouts['en'];
        
        if (this.accessibilityManager?.keyboardAccessibilityManager) {
        
            // KeyboardAccessibilityManagerに言語固有のショートカットを適用
        
        }
            this.updateKeyboardShortcuts(); }
        }
         : undefined
        console.log(`Applied, keyboard layout: ${this.currentLayout.name}`};
    }
    
    /**
     * キーボードショートカットの更新
     * 統一されたKeyboardShortcutRouterを使用
     */
    private updateKeyboardShortcuts(): void { if (!this.currentLayout) return,
        
        const shortcuts = this.currentLayout.shortcuts,
        const navigationKeys = this.currentLayout.navigationKeys,
        
        try {
            // KeyboardShortcutRouterまたはCoreKeyboardShortcutManagerを使用
            const keyboardManager = this.gameEngine?.keyboardShortcutManager,
            
            if (keyboardManager) {
            
                // 既存のショートカットを言語固有の設定で更新
                Object.entries(shortcuts).forEach(([action, key]) => { 
                    // アクション名を統一されたシステムのものにマッピング
                    const unifiedAction = this.mapToUnifiedAction(action) }
                    if (unifiedAction && keyboardManager.updateShortcut) { }
                        keyboardManager.updateShortcut(unifiedAction, key); }
};
                 : undefined';'
                console.log(`Keyboard, shortcuts updated, for language: ${this.currentLanguage}`}';'

            } else { }'

                console.warn('KeyboardShortcutManager, not available, for language-specific, updates');' }'

            } catch (error) { console.error('Failed to update keyboard shortcuts:', error','
            getErrorHandler()?.handleError(error, 'LANGUAGE_ACCESSIBILITY_ERROR', { : undefined''
                operation: 'updateKeyboardShortcuts');
                language: this.currentLanguage  }';'
        }
    }
    
    /**
     * 言語固有のアクション名を統一されたアクション名にマッピング'
     */''
    private mapToUnifiedAction(languageAction: string): string | null { const actionMapping: Record<string, string> = {'
            // 英語
            'help': 'help',
            'settings': 'settings',
            'pause': 'pause',
            'menu': 'menu',
            'fullscreen': 'fullscreen',
            // ドイツ語
            'hilfe': 'help',
            'einstellungen': 'settings',
            'vollbild': 'fullscreen',
            // フランス語
            'aide': 'help',
            'parametres': 'settings',
            'pleinEcran': 'fullscreen',
            // 日本語
            'ヘルプ': 'help',
            '設定': 'settings',
            'ポーズ': 'pause',
            'メニュー': 'menu',
            'フルスクリーン': 'fullscreen',
            // アラビア語
            'مساعدة': 'help',
            'اعدادات': 'settings',
            'ايقاف': 'pause',
            'قائمة': 'menu',
            'ملء الشاشة': 'fullscreen',
            // ヘブライ語
            'עזרה': 'help',
            'הגדרות': 'settings',
            'השהיה': 'pause',
            'תפריט': 'menu',
            'מסך מלא': 'fullscreen' };
        
        return actionMapping[languageAction] || null;
    }
    
    /**
     * キーボードレイアウトサポートの設定
     * 統一されたキーボードショートカットシステムとの統合'
     */''
    private setupKeyboardLayoutSupport()';'
            if(typeof, document !== 'undefined' {'

                this.keyboardEventHandler = this.handleLanguageSpecificKeyboard.bind(this) }

                document.addEventListener('keydown'; this.keyboardEventHandler'; }'
            }
            ';'
            // GameEngineのキーボードマネージャーとの統合確認
            if (this.gameEngine && this.gameEngine.keyboardShortcutManager) {', ' }

                console.log('Integrated, with unified, keyboard shortcut, system'); }
            }

            console.log('Keyboard, layout support, initialized');
        } catch (error) { console.error('Failed to setup keyboard layout support:', error','
            getErrorHandler()?.handleError(error, 'LANGUAGE_ACCESSIBILITY_ERROR', { : undefined''
                operation: 'setupKeyboardLayoutSupport'
            };
        }
    }
    
    /**
     * 言語固有のキーボード処理
     */
    private handleLanguageSpecificKeyboard(event: KeyboardEvent): void { try {
            // RTL言語での方向キー処理の調整
            if (this.isRTLLanguage(this.currentLanguage) {
    
}
                this.handleRTLKeyboardNavigation(event); }
            }
            
            // 言語固有のキーボード配置での調整
            if (this.currentLayout && this.config.adaptKeyboardLayouts) { this.adjustForKeyboardLayout(event),' }'

            } catch (error) { console.error('Language-specific keyboard handling error:', error }
    }
    
    /**
     * RTL言語での方向キー処理'
     */''
    private handleRTLKeyboardNavigation(event: KeyboardEvent): void { // RTL言語では左右の方向キーの意味が逆になる
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight) {'
            // この処理は統一されたナビゲーションシステムで処理されるべき
        }
            // ここでは言語固有の調整のみを行う }
            console.debug(`RTL, navigation adjustment, for ${event.key} in ${this.currentLanguage}`};
        }
    }
    
    /**
     * キーボードレイアウトでの調整
     */
    private adjustForKeyboardLayout(event: KeyboardEvent): void { // 言語固有のキーマッピング調整
        // 実際の調整は統一されたキーボードシステムが行う }
        console.debug(`Keyboard, layout adjustment, for ${event.code} in ${this.currentLanguage}`};
    }
    
    /**
     * 文化的メタファーの初期化
     */''
    private initializeCulturalMetaphors()';'
        console.log('Cultural, metaphors initialized');
    }
    
    /**
     * 文化的メタファーの適用'
     */''
    private applyCulturalMetaphors(language: string): void { ''
        this.currentMetaphors = this.culturalMetaphors[language] || this.culturalMetaphors['en'];
        
        // UI要素の文化的適応
        this.adaptUIForCulture() }
        console.log(`Applied, cultural metaphors, for: ${language}`};
    }
    
    /**
     * UI の文化的適応
     */
    private adaptUIForCulture(): void { ''
        if(!this.currentMetaphors) return,
        
        // 色の意味に基づく適応
        const colorMeanings = this.currentMetaphors.colors,
        // CSS カスタムプロパティで色の意味を設定
        document.documentElement.style.setProperty('--error-color', this.getColorForMeaning('error)',
        document.documentElement.style.setProperty('--success-color', this.getColorForMeaning('success)',
        document.documentElement.style.setProperty('--warning-color', this.getColorForMeaning('warning)',
        document.documentElement.style.setProperty('--info-color', this.getColorForMeaning('information),'
        
        // ジェスチャーガイドラインの更新
        this.updateGestureGuidelines() }
    
    /**
     * 意味に対応する色の取得
     */''
    private getColorForMeaning(meaning: string): string { const colorMap: Record<string, string> = {', 'error': '#ff0000','
            'success': '#00ff00',
            'warning': '#ffff00',
            'information': '#0000ff' };

        return colorMap[meaning] || '#000000';
    }
    
    /**
     * ジェスチャーガイドラインの更新
     */
    private updateGestureGuidelines(): void { if (!this.currentMetaphors) return,
        
        const gestures = this.currentMetaphors.gestures,
        
        // スクリーンリーダー用の説明を更新
        if (this.accessibilityManager?.gameContentDescriber) {
    
}
            this.accessibilityManager.gameContentDescriber.updateGestureDescriptions(gestures); }
}
    
    /**
     * 双方向テキストサポート
     */ : undefined
    setupBidirectionalTextSupport(): void { ''
        if(!this.config.bidirectionalText) return,
        ','
        // Unicode双方向アルゴリズムの適用
        const textElements = document.querySelectorAll('p, span, div, label),'
        
        textElements.forEach(element => { );
            if (element, instanceof HTMLElement && element.textContent) {

                if(this.containsMixedDirectionText(element.textContent)) {
            }

                    element.style.unicodeBidi = 'embed'; }

                    element.dir = 'auto'; }
}
        };
    }
    
    /**
     * 混合方向テキストの検出
     */
    private containsMixedDirectionText(text: string): boolean { if (!text) return false,
        
        const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/,
        const ltrPattern = /[A-Za-z]/,
        
        return rtlPattern.test(text) && ltrPattern.test(text) }
    
    /**
     * 言語固有のアクセシビリティ説明'
     */''
    getLanguageSpecificDescription(element: ElementDescription, context?: any): string { ''
        const metaphors = this.currentMetaphors || this.culturalMetaphors['en'],
        const language = this.currentLanguage,
        ','
        // 要素タイプに基づく説明生成
        switch(element.type) {

            case 'button':','
                return this.getButtonDescription(element, metaphors);
            case 'navigation':','
                return this.getNavigationDescription(element, metaphors);
            case 'status':,
                return this.getStatusDescription(element, metaphors);
            default:
}
                return this.getGenericDescription(element, metaphors);
    
    /**
     * ボタン説明の生成'
     */''
    private getButtonDescription(element: ElementDescription, metaphors: CulturalMetaphor): string { ''
        const action = element.action || 'action',
        const direction = metaphors.directions,

        if (this.currentLanguage === 'ja') { }

            return `${element.text}ボタン - ${action}を実行します`;} else if(this.currentLanguage === 'ar' {'
            return `زر ${element.text} - لتنفيذ ${action}`;
        } else {  }
            return `${element.text} button - performs ${action}`;
    
    /**
     * ナビゲーション説明の生成'
     */''
    private getNavigationDescription(element: ElementDescription, metaphors: CulturalMetaphor): string { const directions = metaphors.directions,

        if (this.currentLanguage === 'ja') { }

            return `ナビゲーション: ${directions.next}は右矢印、${directions.previous}は左矢印`;} else if(this.currentLanguage === 'ar' {'
            return `التنقل: ${directions.next} السهم الأيمن، ${directions.previous} السهم الأيسر`;
        } else {  }
            return `Navigation: ${directions.next} with right arrow, ${directions.previous} with left arrow`;
    
    /**
     * ステータス説明の生成'
     */''
    private getStatusDescription(element: ElementDescription, metaphors: CulturalMetaphor): string { const colors = metaphors.colors,
        const status = element.status,

        if (status === 'error') {', ' }

            return this.localizationManager?.ta11y('accessibility.status.error') || 'Error status'; }

        } else if (status === 'success') { ''
            return this.localizationManager?.ta11y('accessibility.status.success') || 'Success status' }
         : undefined
        return `Status: ${status}`,
    }
    
    /**
     * 汎用説明の生成'
     */''
    private getGenericDescription(element: ElementDescription, metaphors: CulturalMetaphor): string { ''
        return element.description || element.text || 'Interactive element' }
    
    /**
     * 言語変更時の処理
     */
    onLanguageChange(newLanguage: string): void { const oldLanguage = this.currentLanguage,
        this.currentLanguage = newLanguage;
        
        // RTL状態のリセット
        if (this.isRTLLanguage(oldLanguage) !== this.isRTLLanguage(newLanguage) {
            this.resetRTLAdaptation() }
        ;
        // 新しい言語設定の適用
        this.applyLanguageSpecificSettings()';'
        this.accessibilityManager?.eventSystem?.emit('languageChanged', {
                oldLanguage
            newLanguage, : undefined
            isRTL: this.isRTLLanguage(newLanguage  };
        console.log(`Language, changed from ${oldLanguage} to ${newLanguage}`};
    }
    
    /**
     * RTL適応のリセット
     */'
    private resetRTLAdaptation(): void { ''
        if(!this.rtlAdaptation.applied) return,
        ','
        // HTML要素のリセット
        document.documentElement.dir = 'ltr',
        
        // 適応された要素のリセット
        this.rtlAdaptation.elements.forEach(element => { );
            const originalStyle = this.rtlAdaptation.originalStyles.get(element);
            if (originalStyle) {', ' }

                element.style.textAlign = originalStyle.textAlign || '; }'

                element.style.direction = originalStyle.direction || '; }'
};
        
        // 状態のクリア
        this.rtlAdaptation.applied = false;
        this.rtlAdaptation.elements.clear();
        this.rtlAdaptation.originalStyles.clear('';
        this.currentDirection = 'ltr';, ')';
        console.log('RTL, adaptation reset');
    }
    
    /**
     * キーボードレイアウト情報の取得'
     */''
    getKeyboardLayoutInfo(language: string | null = null): KeyboardLayout { const lang = language || this.currentLanguage,
        return this.keyboardLayouts[lang] || this.keyboardLayouts['en'] }
    
    /**
     * 文化的メタファー情報の取得'
     */''
    getCulturalMetaphors(language: string | null = null): CulturalMetaphor { const lang = language || this.currentLanguage,
        return this.culturalMetaphors[lang] || this.culturalMetaphors['en'] }
    
    /**
     * サポート言語一覧の取得
     */
    getSupportedLanguages(): string[] { return Object.keys(this.keyboardLayouts) }
    
    /**
     * RTL言語一覧の取得
     */
    getRTLLanguages(): string[] { return [...this.rtlLanguages],
    
    /**
     * 現在の言語情報の取得
     */
    getCurrentLanguageInfo(): LanguageInfo { return { language: this.currentLanguage,

            direction: this.currentDirection,
            isRTL: this.isRTLLanguage(this.currentLanguage),' };'

            keyboardLayout: this.currentLayout?.name || 'Unknown', : undefined 
            culturalMetaphors: this.currentMetaphors || {}
    
    /**
     * 設定の適用
     */
    applyConfig(config: { languageSpecific?: Partial<LanguageAccessibilityConfig> ): void {
        if (config.languageSpecific) {', ' }

            Object.assign(this.config, config.languageSpecific); }
        }

        console.log('LanguageSpecificAccessibility, configuration applied);'
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void { this.config.enabled = enabled,
        
        if (!enabled) {
    
}
            this.resetRTLAdaptation(); }

        } else { }'

            this.applyLanguageSpecificSettings() }

        console.log(`LanguageSpecificAccessibility ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';'
        console.log('Destroying, LanguageSpecificAccessibility...');
        ';'
        // RTL適応のリセット
        this.resetRTLAdaptation()';'
        if (this.keyboardEventHandler && typeof, document !== 'undefined') {', ' }

            document.removeEventListener('keydown', this.keyboardEventHandler'; }'
        }

        console.log('LanguageSpecificAccessibility, destroyed');

    }'}'