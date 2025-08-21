import { getErrorHandler  } from '../../../utils/ErrorHandler.js';

interface ColorSettings { lucky: string[],
    unlucky: string[],
    preferred: string[],
    avoided: string[];
    interface NumberSettings { lucky: number[],
    unlucky: number[],
    preferred: number[],
    symbolism: { [key: number]: string,
    symbolism: { [key: number]: string;
         },
interface GestureSettings { pointing?: string,
    beckoning?: string;
    thumbsUp?: string;
    okSign?: string;
    showingSole?: string;
    bowing?: string;
    giftReceiving?: string;
    receiving?: string;
    handshake?: string;
';'

interface LayoutSettings { ''
    readingOrder: 'left-to-right-top-to-bottom' | 'right-to-left' | 'top-to-bottom-right-to-left' | 'top-to-bottom-left-to-right,
    preferredAlignment: 'left' | 'right' | 'center,
    whitespaceImportance: 'low' | 'medium' | 'high,
    hierarchyStyle: 'subtle' | 'clear' | 'traditional' | 'strict'
            }
';'

interface CommunicationSettings { ''
    directness: 'direct' | 'moderate' | 'indirect' | 'very-indirect,
    politenessLevel: 'medium' | 'high' | 'very-high,
    contextDependency: 'low' | 'high' | 'very-high';
    silenceComfort?: 'high';
    hospitalityImportance?: 'very-high';
    faceImportance?: 'very-high';
    hierarchyImportance?: 'very-high';
    individualismImportance?: 'high' }

interface CulturalSettings { colors: ColorSettings,
    numbers: NumberSettings,
    gestures: GestureSettings,
    layout: LayoutSettings,
    communication: CommunicationSettings;
    interface CulturalTaboos { visual: string[],
    behavioral: string[],
    content: string[],
    interaction: string[];
    interface CurrentCulture { language: string,
    region: string | null,
    cultureKey: string,
    settings: CulturalSettings,
    appliedAt: string;
';'

interface TabooWarning { type: string,''
    severity: 'medium' | 'high,
    suggestion: string;
    culturalContext?: string;
    interface TabooValidationResult { valid: boolean,
    warnings: TabooWarning[];
    culture?: string;

/**
 * 文化的適応システム - 地域文化に応じたUI・UX調整
 */
export class CulturalAdaptationSystem {
    private culturalSettings: Map<string, CulturalSettings>;
    private culturalTaboos: Map<string, CulturalTaboos> };
    private gestureInterpretations: Map<string, { [key: string]: string,>;
    private currentCulture: CurrentCulture | null,
    private, appliedAdaptations: Set<string>','

    constructor('''
            ['ja', { colors: {]'
                    lucky: ['#FF0000', '#FFD700', '#FFFFFF], // 赤、金、白,'
                    unlucky: ['#000000', '#800080], // 黒、紫,'
                    preferred: ['#FF69B4', '#87CEEB', '#98FB98], // 桜色、空色、若草色,'
                    avoided: ['#8B4513', '#2F4F4F] // 茶色、暗い青緑 },' };
                numbers: { lucky: [7, 8],
                    unlucky: [4, 9], // 死、苦  },
                    preferred: [3, 5, 7],
                    symbolism: { ''
                        4: '死（し）を連想'  ,
                        8: '末広がりで縁起が良い,
                        9: '苦（く）を連想'
            }
                };
                gestures: { ''
                    pointing: 'avoid-direct', // 直接指差しを避ける  },
                    beckoning: 'palm-down', // 手のひらを下にして招く,
                    thumbsUp: 'positive', // 親指立ては肯定的,
                    okSign: 'money-symbol' // OKサインはお金を表す  };
                layout: { ''
                    readingOrder: 'top-to-bottom-right-to-left'  ,
                    preferredAlignment: 'center,
                    whitespaceImportance: 'high', // 余白の重要性が高い,
                    hierarchyStyle: 'subtle' // 控えめな階層表現  };
                communication: { ''
                    directness: 'indirect', // 間接的コミュニケーション  },
                    politenessLevel: 'high', // 高い敬語レベル,
                    contextDependency: 'high', // 高コンテキスト文化,
                    silenceComfort: 'high' // 沈黙への耐性が高い  }
            }];
            ;
            // アラビア文化
            ['ar', { colors: {]'
                    lucky: ['#008000', '#FFFFFF', '#FFD700], // 緑、白、金,'
                    unlucky: ['#FF0000', '#000000], // 赤、黒（文脈による）,'
                    preferred: ['#0066CC', '#228B22', '#DAA520], // 青、緑、金,'
                    avoided: ['#FF69B4', '#800080] // ピンク、紫 },' };
                numbers: { lucky: [7, 9],
                    unlucky: [13]  ,
    preferred: [3, 7, 9],
                    symbolism: { ''
                        7: '神聖な数字'  ,
                        9: '完全性を表す,
                        13: '不吉な数字'
            }
                };
                gestures: { ''
                    pointing: 'use-full-hand', // 全手で指示  },
                    beckoning: 'palm-up', // 手のひらを上にして招く,
                    thumbsUp: 'offensive', // 親指立ては侮辱的,
                    showingSole: 'offensive' // 足の裏を見せるのは侮辱的  };
                layout: { ''
                    readingOrder: 'right-to-left'  ,
                    preferredAlignment: 'right,
                    whitespaceImportance: 'medium,
                    hierarchyStyle: 'clear' // 明確な階層表現  ,
                communication: { ''
                    directness: 'moderate', // 中程度の直接性  },
                    politenessLevel: 'high', // 高い礼儀レベル,
                    contextDependency: 'high', // 高コンテキスト文化,
                    hospitalityImportance: 'very-high' // おもてなしの重要性が非常に高い  }
            }];
            ;
            // 中国文化
            ['zh', { colors: {]'
                    lucky: ['#FF0000', '#FFD700', '#FF8C00], // 赤、金、オレンジ,'
                    unlucky: ['#FFFFFF', '#000000], // 白、黒（葬儀を連想）,'
                    preferred: ['#DC143C', '#FF6347', '#FFD700], // 深紅、朱色、金,'
                    avoided: ['#FFFFFF', '#808080] // 白、グレー },' };
                numbers: { lucky: [6, 8, 9],
                    unlucky: [4] ,
    preferred: [2, 3, 6, 8, 9],
                    symbolism: {''
                        4: '死を意味する音' ,
                        6: '順調を意味,
                        8: '発財（金運）を意味,
                        9: '長久（永続）を意味'
            }
                };
                gestures: { ''
                    pointing: 'avoid-single-finger', // 一本指での指差しを避ける  },
                    beckoning: 'palm-down', // 手のひらを下にして招く,
                    bowing: 'respectful', // お辞儀は敬意を表す,
                    giftReceiving: 'both-hands' // 両手で受け取る  ,
                layout: { ''
                    readingOrder: 'top-to-bottom-left-to-right' ,
                    preferredAlignment: 'center,
                    whitespaceImportance: 'medium,
                    hierarchyStyle: 'traditional' // 伝統的階層表現  ,
                communication: { ''
                    directness: 'indirect', // 間接的コミュニケーション  },
                    politenessLevel: 'very-high', // 非常に高い礼儀レベル,
                    contextDependency: 'very-high', // 非常に高コンテキスト文化,
                    faceImportance: 'very-high' // 面子の重要性が非常に高い  }
            }];
            ;
            // 韓国文化
            ['ko', { colors: {]'
                    lucky: ['#FF0000', '#0066CC', '#FFFFFF], // 赤、青、白,'
                    unlucky: ['#000000', '#FFD700], // 黒、金（葬儀色）,'
                    preferred: ['#FF1493', '#4169E1', '#32CD32], // 深いピンク、ロイヤルブルー、ライムグリーン,'
                    avoided: ['#000000', '#8B4513] // 黒、茶色 },' };
                numbers: { lucky: [7, 8],
                    unlucky: [4] ,
    preferred: [3, 7, 8, 9],
                    symbolism: {''
                        4: '死を意味' ,
                        7: '幸運の数字,
                        8: '繁栄を意味'
            }
                };
                gestures: { ''
                    pointing: 'avoid-direct', // 直接指差しを避ける  },
                    beckoning: 'palm-down', // 手のひらを下にして招く,
                    bowing: 'essential', // お辞儀は必須,
                    receiving: 'both-hands' // 両手で受け取る  ,
                layout: { ''
                    readingOrder: 'left-to-right-top-to-bottom' ,
                    preferredAlignment: 'left,
                    whitespaceImportance: 'high,
                    hierarchyStyle: 'strict' // 厳格な階層表現  ,
                communication: { ''
                    directness: 'very-indirect', // 非常に間接的  },
                    politenessLevel: 'very-high', // 非常に高い敬語レベル,
                    contextDependency: 'very-high', // 非常に高コンテキスト文化,
                    hierarchyImportance: 'very-high' // 階層の重要性が非常に高い  }
            }];
            ;
            // 西欧文化（デフォルト）
            ['en', { colors: {]'
                    lucky: ['#008000', '#0066CC', '#FFD700], // 緑、青、金,'
                    unlucky: ['#000000], // 黒,'
                    preferred: ['#FF0000', '#0066CC', '#008000], // 赤、青、緑,'
                    avoided: []  } },
                numbers: { lucky: [7],
                    unlucky: [13] ,
    preferred: [1, 3, 7, 10],
                    symbolism: {''
                        7: 'lucky number' ,
                        13: 'unlucky number'
            }
                };
                gestures: { ''
                    pointing: 'acceptable', // 指差しは受け入れられる  },
                    beckoning: 'palm-up', // 手のひらを上にして招く,
                    thumbsUp: 'very-positive', // 親指立ては非常に肯定的,
                    handshake: 'standard' // 握手は標準的  ,
                layout: { ''
                    readingOrder: 'left-to-right-top-to-bottom' ,
                    preferredAlignment: 'left,
                    whitespaceImportance: 'medium,
                    hierarchyStyle: 'clear' // 明確な階層表現  }'
                communication: { ''
                    directness: 'direct', // 直接的コミュニケーション  },
                    politenessLevel: 'medium', // 中程度の礼儀レベル,
                    contextDependency: 'low', // 低コンテキスト文化,
                    individualismImportance: 'high' // 個人主義の重要性が高い  }
            }]']');
        // 地域別タブー情報
        this.culturalTaboos = new Map<string, CulturalTaboos>([']'
            ['ja', { ]'
                visual: ['pointing-directly', 'showing-soles', 'number-4-emphasis],'
                behavioral: ['loud-speaking', 'public-affection', 'shoes-indoors],'
                content: ['death-imagery', 'explicit-comparison', 'individual-praise],'
                interaction: ['interrupting', 'direct-disagreement', 'immediate-response-pressure] }'

            }],''
            ['ar', { ]'
                visual: ['left-hand-use', 'showing-soles', 'crossed-legs],'
                behavioral: ['alcohol-reference', 'pork-imagery', 'inappropriate-touching],'
                content: ['religious-imagery', 'gambling-promotion', 'inappropriate-clothing],'
                interaction: ['rushing-conversation', 'ignoring-hierarchy', 'public-criticism] }'

            }],''
            ['zh', { ]'
                visual: ['white-flowers', 'clocks-as-gifts', 'number-4-prominence],'
                behavioral: ['public-criticism', 'loss-of-face', 'ignoring-age-hierarchy],'
                content: ['political-references', 'taiwan-independence', 'historical-sensitivity],'
                interaction: ['direct-confrontation', 'public-correction', 'ignoring-seniority] }'

            }],''
            ['ko', { ]'
                visual: ['writing-names-in-red', 'number-4-use', 'inappropriate-positioning],'
                behavioral: ['ignoring-age-hierarchy', 'improper-bowing', 'using-wrong-hand],'
                content: ['japan-praise', 'historical-insensitivity', 'hierarchy-disrespect],'
                interaction: ['informal-language', 'ignoring-status', 'direct-refusal] }'

            }]']');
        
        // ジェスチャー解釈データベース
        this.gestureInterpretations = new Map<string, { [key: string]: string,>([''
            ['pointing', { ', 'ja': 'rude-avoid-direct','
                'ar': 'use-full-hand,
                'zh': 'avoid-single-finger,
                'ko': 'very-rude',]','
                'en': 'acceptable' }]'
            }],''
            ['thumbs-up', { ', 'ja': 'positive','
                'ar': 'offensive,
                'zh': 'positive,
                'ko': 'positive',]','
                'en': 'very-positive' }]'
            }],''
            ['ok-sign', { ', 'ja': 'money-symbol','
                'ar': 'offensive,
                'zh': 'negative,
                'ko': 'money-symbol',]','
                'en': 'ok-good' }]'
            }],''
            ['beckoning', { ', 'ja': 'palm-down-polite','
                'ar': 'palm-up,
                'zh': 'palm-down,
                'ko': 'palm-down-respectful',]','
                'en': 'palm-up-casual' }]
            }]
        ]';'
        
        // 現在の文化的設定
        this.currentCulture = null;
        this.appliedAdaptations = new Set()';'
        console.log('CulturalAdaptationSystem, initialized');
    }
    
    /**
     * 文化的適応を設定'
     */''
    setCulturalAdaptation(language: string, region: string | null = null): boolean { try { }

            const cultureKey = region ? `${language}-${region}` : language;
            const primaryLanguage = language.split('-)[0];'
            
            // 文化設定を取得
            let culturalSettings = this.culturalSettings.get(cultureKey) || ';'
                                 this.culturalSettings.get(primaryLanguage) ||';'
                                 this.culturalSettings.get('en'; // デフォルト'

            if (!culturalSettings) {', ' }

                throw new Error('Cultural, settings not, found'; }'
            }
            
            this.currentCulture = { language: language,
                region: region,
                cultureKey: cultureKey,
                settings: culturalSettings,
    appliedAt: new Date().toISOString(  ,
            
            // 文化的適応を適用
            this.applyGlobalCulturalAdaptations();
            
            console.log(`Cultural, adaptation set, for: ${cultureKey}`};
            return true;
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CULTURAL_ADAPTATION_ERROR', {)
                language: language,','
                region: region',' }'

            }');'
            return false;
    
    /**
     * 色の文化的適応'
     */''
    adaptColors(element: HTMLElement, colorUsage: string = 'general'): boolean { }

        if(!this.currentCulture || this.appliedAdaptations.has(`color-${element.id || 'anonymous}`}}' { return false }', ';

        try { const colorSettings = this.currentCulture.settings.colors,
            const computedStyle = window.getComputedStyle(element);
            // 現在の色を分析
            const currentBgColor = computedStyle.backgroundColor,
            const currentTextColor = computedStyle.color,
            // 不適切な色を検出して調整
            if(this.isColorInappropriate(currentBgColor, 'background)' {''
                const appropriateColor = this.suggestAppropriateColor('background', colorUsage','
                element.style.backgroundColor = appropriateColor }

            if(this.isColorInappropriate(currentTextColor, 'text)' { ''
                const appropriateColor = this.suggestAppropriateColor('text', colorUsage','
                element.style.color = appropriateColor }
            ';'
            // 幸運な色を強調
            if(colorUsage === 'accent' || colorUsage === 'important' { }

                const luckyColor = this.getLuckyColor();

            this.appliedAdaptations.add(`color-${element.id || 'anonymous}`}';
            return true;
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'COLOR_ADAPTATION_ERROR', {)
                element: element.tagName),
                colorUsage: colorUsage,);
            return false;
    
    /**
     * 数字の文化的適応
     */
    adaptNumbers(element: HTMLElement): boolean { if (!this.currentCulture) return false,
        
        try {
            const numberSettings = this.currentCulture.settings.numbers,
            const textContent = element.textContent || element.innerHTML,
            
            // 不適切な数字を検出
            let adaptedContent = textContent,
            ','

            numberSettings.unlucky.forEach(unluckyNumber => { );
                const regex = new RegExp(`\\b${unluckyNumber)\\b`, 'g'),
                if (regex.test(adaptedContent) {
                    // 不吉な数字を代替案に置換
                    const, alternative = this.suggestAlternativeNumber(unluckyNumber);
                    adaptedContent = adaptedContent.replace(regex, `${alternative}`};
                    ';'

                    // 警告クラスを追加
                }

                    element.classList.add('cultural-number-adapted');' }'

                    element.setAttribute('data-original-number', unluckyNumber.toString());' }'

                    element.setAttribute('data-alternative-number', alternative.toString();
                }
            };
            
            // 幸運な数字を強調
            numberSettings.lucky.forEach(luckyNumber => {  ),' }'

                const regex = new RegExp(`\\b${luckyNumber}\\b`, 'g'};' }'

                adaptedContent = adaptedContent.replace(regex'}'''
                    `<span class="cultural-lucky-number">${luckyNumber}</span>`);
            };
            
            if (adaptedContent !== textContent) {
            
                element.innerHTML = adaptedContent }
                return true;
            
            return false;
            ";"
        } catch (error) { getErrorHandler().handleError(error, 'NUMBER_ADAPTATION_ERROR', {)
                element: element.tagName  }';'
            return false;
    
    /**
     * ジェスチャー・アイコンの文化的適応
     */'
    adaptGestures(element: HTMLElement): boolean { ''
        if(!this.currentCulture) return false,
        ','

        try {'
            const gestureElements = element.querySelectorAll('[data-gesture], .gesture-icon, .emoji,
            let adaptationsApplied = 0,

            gestureElements.forEach(gestureEl => { '),'
                const gestureType = gestureEl.getAttribute('data-gesture) || ,'
                                 this.detectGestureType(gestureEl, as HTMLElement);
                if (gestureType) {
                ','

                    const interpretation = this.getGestureInterpretation(gestureType);
                    if (interpretation.includes('offensive') || interpretation.includes('rude) {'
                        // 不適切なジェスチャーを代替案に置換
                        const alternative = this.suggestAlternativeGesture(gestureType);

                        this.replaceGestureElement(gestureEl as HTMLElement, alternative); }

                        adaptationsApplied++;' }'

                    } else if (interpretation.includes('avoid') || interpretation.includes('inappropriate)' { // 避けるべきジェスチャーを隠すか警告を表示
                        gestureEl.classList.add('cultural-gesture-warning');
                        gestureEl.setAttribute('title', '文化的に不適切な可能性があります),'
                        adaptationsApplied++ }
}';'
            
            return adaptationsApplied > 0;
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'GESTURE_ADAPTATION_ERROR', {)
                element: element.tagName  ,
            return false;
    
    /**
     * レイアウトの文化的適応
     */
    adaptLayout(element: HTMLElement): boolean { if (!this.currentCulture) return false,
        
        try {
            const layoutSettings = this.currentCulture.settings.layout,
            ','
            // 読み順に応じた調整
            switch(layoutSettings.readingOrder) {

                case 'right-to-left':','
                    element.style.direction = 'rtl,
                    element.style.textAlign = 'right,

                    break,
                case 'top-to-bottom-right-to-left':','
                    element.classList.add('vertical-text');
                    element.style.writingMode = 'vertical-rl,

                    break,
                case 'left-to-right-top-to-bottom':','
                default: element.style.direction = 'ltr,
                    element.style.textAlign = layoutSettings.preferredAlignment
             }
                    break; }
            }
            ';'
            // 余白の重要性に応じた調整
            switch(layoutSettings.whitespaceImportance) {

                case 'high':','
                    element.style.padding = '20px,
                    element.style.margin = '15px 0,

                    break,
                case 'medium':','
                    element.style.padding = '12px,
                    element.style.margin = '10px 0,

                    break,
                case 'low':','
                    element.style.padding = '6px,
                    element.style.margin = '5px 0' }
                    break; }
            }
            ';'
            // 階層表現スタイル
            switch(layoutSettings.hierarchyStyle) {

                case 'subtle':','
                    element.classList.add('subtle-hierarchy');
                    break,
                case 'traditional':','
                    element.classList.add('traditional-hierarchy');
                    break,
                case 'strict':','
                    element.classList.add('strict-hierarchy');
                    break,
                case 'clear':','
                default: element.classList.add('clear-hierarchy' }
                    break; }
            }
            
            return true;
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'LAYOUT_ADAPTATION_ERROR', {)
                element: element.tagName  }';'
            return false;
    
    /**
     * コミュニケーションスタイルの適応
     */'
    adaptCommunicationStyle(element: HTMLElement): boolean { ''
        if(!this.currentCulture) return false,
        
        try {
            const commSettings = this.currentCulture.settings.communication,
            ','
            // 直接性レベルに応じた調整
            if(commSettings.directness === 'indirect' || commSettings.directness === 'very-indirect' {'
                // 間接的表現に調整
            }

                this.softenDirectLanguage(element); }
            }
            ';'
            // 礼儀レベルに応じた調整
            if(commSettings.politenessLevel === 'high' || commSettings.politenessLevel === 'very-high' {', ' }

                this.increasePolitenessLevel(element); }
            }
            ';'
            // コンテキスト依存度に応じた調整
            if (commSettings.contextDependency === 'high' || commSettings.contextDependency === 'very-high) { this.addContextualInformation(element) }'
            
            return true;
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'COMMUNICATION_ADAPTATION_ERROR', {''
                element: element.tagName',' }'

            }');'
            return false;
    
    /**
     * タブー検証'
     */''
    validateAgainstTaboos(content: string, contentType: 'visual' | 'behavioral' | 'content' | 'interaction' | 'general' = 'general': TabooValidationResult { }

        if(!this.currentCulture) return { valid: true, warnings: []  }''
        const cultureKey = this.currentCulture.language.split('-)[0];'
        const taboos = this.culturalTaboos.get(cultureKey);

        if(!taboos) return { valid: true, warnings: []  }

        const warnings: TabooWarning[] = [],
        const relevantTaboos = contentType === 'general' ? undefined : undefined
            [...taboos.visual, ...taboos.behavioral, ...taboos.content, ...taboos.interaction] :;
            taboos[contentType] || [];
        
        relevantTaboos.forEach(taboo => {  );
            if (this.detectTabooViolation(content, taboo) {
                warnings.push({)
                    type: taboo,
    severity: this.getTabooSeverity(taboo),
                    suggestion: this.getTabooAlternative(taboo),
                    culturalContext: this.getTabooContext(taboo); 
    }
            }
        };
        
        return { valid: warnings.length === 0,
            warnings: warnings,
            culture: this.currentCulture.cultureKey 
    }
    
    /**
     * ヘルパー関数群
     */
    ';'
    private applyGlobalCulturalAdaptations(): void { // ドキュメント全体にカルチャクラスを追加
        document.body.classList.add(`culture-${this.currentCulture!.cultureKey)`),
        document.documentElement.setAttribute('data-culture', this.currentCulture!.cultureKey','
        
        // 基本的なCSSカスタムプロパティを設定
        const, root = document.documentElement,
        const, colors = this.currentCulture!.settings.colors,

        root.style.setProperty('--cultural-primary-color', colors.preferred[0] || '#0066CC');
        root.style.setProperty('--cultural-secondary-color', colors.preferred[1] || '#008000'};
        root.style.setProperty('--cultural-accent-color', colors.lucky[0] || '#FFD700};'
        
        // 文化的スタイルシートを動的に追加 }
        this.injectCulturalCSS(}
    }

    private injectCulturalCSS()';'
        const existingStyle = document.getElementById('cultural-adaptation-styles);'
        if (existingStyle) {

            existingStyle.remove()','
        const style = document.createElement('style');
        style.id = 'cultural-adaptation-styles,
        style.textContent = this.generateCulturalCSS();
        document.head.appendChild(style); }
    }

    private generateCulturalCSS(): string { const cultureKey = this.currentCulture!.cultureKey,
        const settings = this.currentCulture!.settings,
        
        return ` }
            .culture-${cultureKey} .cultural-lucky-number {
                color: ${settings.colors.lucky[0]}
                font-weight: bold,
                text-shadow: 0 0 2px ${settings.colors.lucky[0]}40 }
            
            .culture-${cultureKey} .cultural-number-adapted { position: relative,
            ';'

            .culture-${cultureKey} .cultural-number-adapted::after { ''
                content: "📝,
                position: absolute,
                top: -5px,
    right: -5px,
                font-size: 10px,
                opacity: 0.7  }
            
            .culture-${cultureKey} .cultural-gesture-warning { opacity: 0.6,
    filter: grayscale(0.5 }
            
            .culture-${cultureKey} .subtle-hierarchy h1
            .culture-${cultureKey} .subtle-hierarchy h2,
            .culture-${cultureKey} .subtle-hierarchy h3 { font-weight: normal,
                margin-bottom: 1.5em }
            
            .culture-${cultureKey} .traditional-hierarchy {
                border-left: 3px solid ${settings.colors.preferred[0]}
                padding-left: 15px }
            
            .culture-${cultureKey} .strict-hierarchy {
                border: 1px solid ${settings.colors.preferred[1]},
                padding: 10px,
                margin-left: 20px }
        `;
    }
    
    private isColorInappropriate(color: string, usage: string): boolean { if (!color || !this.currentCulture) return false,
        
        const inappropriateColors = this.currentCulture.settings.colors.avoided || [],
        const unluckyColors = this.currentCulture.settings.colors.unlucky || [],
        
        return inappropriateColors.some(badColor => this.colorsMatch(color, badColor) ||,
               unluckyColors.some(unluckyColor => this.colorsMatch(color, unluckyColor);
    }
    
    private colorsMatch(color1: string, color2: string): boolean { // 簡単な色比較（実際の実装ではより精密な比較が必要）
        return color1.toLowerCase() === color2.toLowerCase();
    
    private suggestAppropriateColor(usage: string, context: string): string { const colors = this.currentCulture!.settings.colors,"

        switch(usage) {"

            case 'background':','
                return colors.preferred[2] || '#FFFFFF,
            case 'text':','
                return colors.preferred[0] || '#000000,
            case 'accent':','
                return colors.lucky[0] || '#FFD700' }

            default: return colors.preferred[0] || '#0066CC,

    private getLuckyColor('';
        return, this.currentCulture!.settings.colors.lucky[0] || '#FFD700';
    }
    );
    private suggestAlternativeNumber(unluckyNumber: number): number { const preferredNumbers = this.currentCulture!.settings.numbers.preferred,
        // 不吉な数字に最も近い好ましい数字を返す
        return preferredNumbers.find(num => Math.abs(num - unluckyNumber) <= 2) || ,
               preferredNumbers[0] || ,
               unluckyNumber + 1 }
    }

    private getGestureInterpretation(gestureType: string): string { ''
        const cultureKey = this.currentCulture!.language.split('-'[0],
        const interpretations = this.gestureInterpretations.get(gestureType);
        return interpretations ? interpretations[cultureKey] || interpretations['en] : 'neutral' }'

    private detectGestureType(element: HTMLElement): string | null { const classList = element.className,
        const content = element.textContent || element.innerHTML,

        if (classList.includes('thumbs-up') || content.includes('👍)' return 'thumbs-up,
        if (classList.includes('ok-sign') || content.includes('👌)' return 'ok-sign,
        if (classList.includes('pointing') || content.includes('👉)' return 'pointing,
        if (classList.includes('beckoning') || content.includes('👋)' return 'beckoning,
        
        return null }
    
    private detectTabooViolation(content: string, taboo: string): boolean { // 簡略化したタブー検出ロジック
        const contentLower = content.toLowerCase();
        switch(taboo) {

            case 'number-4-emphasis':','
                return /\b4\b/.test(content) && this.currentCulture!.language.startsWith('ja');
            case 'death-imagery':','
                return /death|skull|grave/.test(contentLower);
            case 'left-hand-use':','
                return /left.hand/.test(contentLower) && this.currentCulture!.language.startsWith('ar) }'
            default: return false,

    private getTabooSeverity(taboo: string): 'medium' | 'high' { ''
        const highSeverityTaboos = ['death-imagery', 'religious-imagery', 'offensive-gestures],'
        return highSeverityTaboos.includes(taboo) ? 'high' : 'medium' }

    private getTabooAlternative(taboo: string): string {'
        const alternatives: { [key: string]: string, = { ', 'number-4-emphasis': '数字の5や7を使用することを検討してください','
            'death-imagery': 'より前向きなイメージを使用してください,
            'left-hand-use': '右手の使用を示すイメージを使用してください' 
     },
        return alternatives[taboo] || '文化的により適切な代替案を検討してください';
    }

    private getTabooContext(taboo: string): string { // Mock implementation
        return ' }'

    private suggestAlternativeGesture(gestureType: string): string { // Mock implementation
        return 'alternative-gesture' }

    private replaceGestureElement(element: HTMLElement, alternative: string): void { // Mock implementation
        element.setAttribute('data-gesture', alternative);
    
    private softenDirectLanguage(element: HTMLElement): void { // Mock implementation }
    
    private increasePolitenessLevel(element: HTMLElement): void { // Mock implementation }
    
    private addContextualInformation(element: HTMLElement): void { // Mock implementation }
    
    /**
     * 公開API
     */
    
    /**
     * 現在の文化設定を取得
     */
    getCurrentCulture(): CurrentCulture | null { return this.currentCulture }
    
    /**
     * サポートする文化を取得
     */
    getSupportedCultures(): string[] { return Array.from(this.culturalSettings.keys()));
    
    /**
     * 要素に包括的な文化的適応を適用
     */
    applyComprehensiveAdaptation(element: HTMLElement): boolean { if (!element || !this.currentCulture) return false,
        
        let adaptationsApplied = 0,
        
        if(this.adaptColors(element) adaptationsApplied++;
        if(this.adaptNumbers(element) adaptationsApplied++;
        if(this.adaptGestures(element) adaptationsApplied++;
        if(this.adaptLayout(element) adaptationsApplied++;
        if(this.adaptCommunicationStyle(element) adaptationsApplied++;
        
        return adaptationsApplied > 0 }
    
    /**
     * 統計情報を取得
     */
    getStats(): { supportedCultures: number,
        currentCulture: string | null ,
        appliedAdaptations: number,
        gestureInterpretations: number,
    culturalTaboos: number, { return { supportedCultures: this.culturalSettings.size,
            currentCulture: this.currentCulture ? this.currentCulture.cultureKey : null,
            appliedAdaptations: this.appliedAdaptations.size,
            gestureInterpretations: this.gestureInterpretations.size,
    culturalTaboos: Array.from(this.culturalTaboos.values( ,
                .reduce(())sum, taboos) => sum + Object.values(taboos).reduce((s, arr) => s + arr.length, 0), 0);     }
}
// シングルトンインスタンス
let culturalAdaptationSystemInstance: CulturalAdaptationSystem | null = null,

/**
 * CulturalAdaptationSystemのシングルトンインスタンスを取得
 */
export function getCulturalAdaptationSystem(): CulturalAdaptationSystem { if (!culturalAdaptationSystemInstance) {''
        culturalAdaptationSystemInstance = new CulturalAdaptationSystem(' }''