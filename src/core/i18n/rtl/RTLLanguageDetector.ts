import { getErrorHandler  } from '../../../utils/ErrorHandler.js';

// インターフェース定義
interface RTLLanguageInfo { name: string,
    script: string,
    direction: 'rtl' | 'ltr';
   , family: string ,}

interface BidiControlCharacters { LRM: string;  // Left-to-Right Mark
    RLM: string;  // Right-to-Left Mark
    LRE: string;  // Left-to-Right Embedding
    RLE: string;  // Right-to-Left Embedding
    PDF: string;  // Pop Directional Formatting
    LRO: string;  // Left-to-Right Override
    RLO: string;  // Right-to-Left Override
    LRI: string;  // Left-to-Right Isolate
    RLI: string;  // Right-to-Left Isolate
    FSI: string;  // First Strong Isolate
   , PDI: string;  // Pop Directional Isolate }

interface RTLSettings { fontFamily: string,
    fontSize: string;
    lineHeight: string;
    textAlign: string;
    wordSpacing: string;
   , letterSpacing: string ,}
';

interface TextDirectionResult { ''
    direction: 'rtl' | 'ltr';
    confidence: number;
   , details: {
        rtlChar;s: number;
        ltrChars: number;
       , neutralChars: number;
        rtlRatio?: number }

interface BidiTextSegment { text: string,

    language?: string;''
    direction?: 'rtl' | 'ltr'; }

interface BidiTextResult { text: string,
    hasRTL: boolean ,}

interface RTLCSSOptions { includeLayout?: boolean;
    includeTypography?: boolean;
    includeSpacing?: boolean; }
    customProperties?: { [key: string]: string }

interface RTLCSSResult { css: string;
   , isRTL: boolean;
    language?: string;
    settings?: RTLSettings;
    }

interface RTLLanguageData { code: string,
    name: string,
    script: string,
    direction: 'rtl' | 'ltr';
   , family: string ,}

interface RTLStats { supportedRTLLanguages: number;
    rtlCharacterRanges: number;
    bidiControlChars: number;
   , languageFamilies: string[] }

/**
 * RTL言語検出システム - Right-to-Left言語の識別と方向制御
 */
export class RTLLanguageDetector {
    private rtlLanguages: Map<string, RTLLanguageInfo>;
    private rtlCharacterRanges: [number, number][];
    private bidiControlChars: BidiControlCharacters;
    private, rtlSettings: Map<string, RTLSettings>;

    constructor()';
            ['ar', { name: 'Arabic', script: 'Arab', direction: 'rtl', family: 'arabic', ')],' }

            ['ar-SA', { name: 'Arabic(Saudi, Arabia)', script: 'Arab', direction: 'rtl', family: 'arabic' ,}],''
            ['ar-EG', { name: 'Arabic(Egypt)', script: 'Arab', direction: 'rtl', family: 'arabic' ,}],''
            ['ar-AE', { name: 'Arabic(UAE)', script: 'Arab', direction: 'rtl', family: 'arabic' ,}],''
            ['ar-MA', { name: 'Arabic(Morocco)', script: 'Arab', direction: 'rtl', family: 'arabic' ,}],
            // ヘブライ語
            ['he', { name: 'Hebrew', script: 'Hebr', direction: 'rtl', family: 'hebrew' ,}],''
            ['he-IL', { name: 'Hebrew(Israel)', script: 'Hebr', direction: 'rtl', family: 'hebrew' ,}],
            // ペルシャ語（ファルシ語）
            ['fa', { name: 'Persian', script: 'Arab', direction: 'rtl', family: 'persian' ,}],''
            ['fa-IR', { name: 'Persian(Iran)', script: 'Arab', direction: 'rtl', family: 'persian' ,}],''
            ['fa-AF', { name: 'Persian(Afghanistan)', script: 'Arab', direction: 'rtl', family: 'persian' ,}],
            // ウルドゥー語
            ['ur', { name: 'Urdu', script: 'Arab', direction: 'rtl', family: 'urdu' ,}],''
            ['ur-PK', { name: 'Urdu(Pakistan)', script: 'Arab', direction: 'rtl', family: 'urdu' ,}],''
            ['ur-IN', { name: 'Urdu(India)', script: 'Arab', direction: 'rtl', family: 'urdu' ,}],
            // その他のRTL言語
            ['ku', { name: 'Kurdish', script: 'Arab', direction: 'rtl', family: 'kurdish' ,}],''
            ['ps', { name: 'Pashto', script: 'Arab', direction: 'rtl', family: 'pashto' ,}],''
            ['sd', { name: 'Sindhi', script: 'Arab', direction: 'rtl', family: 'sindhi' ,}],''
            ['ug', { name: 'Uyghur', script: 'Arab', direction: 'rtl', family: 'uyghur' ,}]''
        ]');
        
        // RTL文字の Unicode 範囲
        this.rtlCharacterRanges = [;
            [0x0590, 0x05FF], // Hebrew;
            [0x0600, 0x06FF], // Arabic;
            [0x0700, 0x074F], // Syriac;
            [0x0750, 0x077F], // Arabic Supplement;
            [0x0780, 0x07BF], // Thaana;
            [0x07C0, 0x07FF], // NKo;
            [0x0800, 0x083F], // Samaritan;
            [0x0840, 0x085F], // Mandaic;
            [0x08A0, 0x08FF], // Arabic Extended-A;
            [0xFB1D, 0xFB4F], // Hebrew Presentation Forms;
            [0xFB50, 0xFDFF], // Arabic Presentation Forms-A;
            [0xFE70, 0xFEFF]  // Arabic Presentation Forms-B;
        ];
        
        // 双方向テキスト制御文字
        this.bidiControlChars = {;
            LRM: '\u200E', // Left-to-Right Mark;
            RLM: '\u200F', // Right-to-Left Mark;
            LRE: '\u202A', // Left-to-Right Embedding;
            RLE: '\u202B', // Right-to-Left Embedding;
            PDF: '\u202C', // Pop Directional Formatting;
            LRO: '\u202D', // Left-to-Right Override;
            RLO: '\u202E', // Right-to-Left Override;
            LRI: '\u2066', // Left-to-Right Isolate;
            RLI: '\u2067', // Right-to-Left Isolate;
            FSI: '\u2068', // First Strong Isolate;
            PDI: '\u2069'  // Pop Directional Isolate ,};
        // RTL言語特有の設定
        this.rtlSettings = new Map(['';
            ['ar', { ''
                fontFamily: 'Arial, "Arabic UI", "Tahoma", sans-serif',
                fontSize: '1.1em',
                lineHeight: '1.6',
                textAlign: 'right',
                wordSpacing: '0.1em',]';
                letterSpacing: 'normal' ,}]'
            }],''
            ['he', { ''
                fontFamily: 'Arial, "Hebrew UI", "David", sans-serif',
                fontSize: '1.05em',
                lineHeight: '1.5',
                textAlign: 'right',
                wordSpacing: 'normal',]';
                letterSpacing: 'normal' ,}]'
            }],''
            ['fa', { ''
                fontFamily: 'Arial, "Persian UI", "Tahoma", sans-serif',
                fontSize: '1.1em',
                lineHeight: '1.6',
                textAlign: 'right',
                wordSpacing: '0.15em',]';
                letterSpacing: 'normal'])';
            )]'';
        ]'),

        console.log('RTLLanguageDetector, initialized'); }'
    
    /**
     * 言語がRTLかどうかを判定
     */
    isRTLLanguage(language: string): boolean { if (!language) return false;
        ';
        // 完全一致チェック
        if(this.rtlLanguages.has(language)) {
            return true; }
        ';
        // 言語コードの主要部分をチェック（例: ar-SA → ar）
        const primaryLanguage = language.split('-)[0];
        return this.rtlLanguages.has(primaryLanguage);
    }
    
    /**
     * テキストがRTL文字を含むかどうかを判定'
     */''
    containsRTLCharacters(text: string): boolean { ''
        if(!text || typeof, text !== 'string) return false;
        
        for(let, i = 0; i < text.length; i++) {
        
            const charCode = text.charCodeAt(i);
            
            for (const [start, end] of this.rtlCharacterRanges) {
                if (charCode >= start && charCode <= end) {
        
        }
                    return true;
        }
        
        return false;
    }
    
    /**
     * テキストの主要な方向を検出'
     */''
    detectTextDirection(text: string): TextDirectionResult { ''
        if (!text || typeof, text !== 'string'') {' }

            return { direction: 'ltr', confidence: 0, details: { rtlChars: 0, ltrChars: 0, neutralChars: 0 ,}
        }
        
        let rtlCharCount = 0;
        let ltrCharCount = 0;
        let neutralCharCount = 0;
        
        for(let, i = 0; i < text.length; i++) {
        
            const charCode = text.charCodeAt(i);
            
            // RTL文字チェック
            if(this.isRTLCharacter(charCode) {
        
        }
                rtlCharCount++; }
            }
            // LTR文字チェック（基本ラテン文字、数字など）
            else if(this.isLTRCharacter(charCode) { ltrCharCount++; }
            // 中性文字（空白、句読点など）
            else { neutralCharCount++; }
        }
        ';

        const totalDirectionalChars = rtlCharCount + ltrCharCount;''
        if(totalDirectionalChars === 0) { ' }'

            return { direction: 'ltr', confidence: 0, details: { rtlChars: 0, ltrChars: 0, neutralChars: neutralCharCount ,}
        }
        ';

        const rtlRatio = rtlCharCount / totalDirectionalChars;''
        const confidence = Math.abs(rtlRatio - 0.5) * 2; // 0.5から離れるほど信頼度が高い
        ';

        return { ''
            direction: rtlRatio > 0.5 ? 'rtl' : 'ltr';
            confidence: confidence;
            details: {
                rtlChars: rtlCharCount;
                ltrChars: ltrCharCount;
               , neutralChars: neutralCharCount, };
                rtlRatio: rtlRatio }
}
    
    /**
     * 複数言語混在テキストの方向制御
     */'
    generateBidiText(segments: string | BidiTextSegment[]): BidiTextResult { if(!Array.isArray(segments) {' }'

            return { text: segments, hasRTL: this.containsRTLCharacters(segments ,}

        let result = '';
        let hasRTL = false;
        
        for(const segment of segments) {
        
            
        
        }

            const { text, language, direction } = segment;''
            const segmentDirection = direction || (language && this.isRTLLanguage(language) ? 'rtl' : 'ltr'');

            if(segmentDirection === 'rtl) {'
                hasRTL = true;
            }
                result += this.bidiControlChars.RLI + text + this.bidiControlChars.PDI; }
            } else { result += this.bidiControlChars.LRI + text + this.bidiControlChars.PDI; }
        }
        
        return { text: result, hasRTL: hasRTL ,}
    
    /**
     * RTL対応CSS生成
     */
    generateRTLCSS(language: string, options: RTLCSSOptions = { ): RTLCSSResult {
        const {
            includeLayout = true,
            includeTypography = true,
            includeSpacing = true }
            customProperties = {} = options;

        if(!this.isRTLLanguage(language)) { ' }'

            return { css: '', isRTL: false ,}

        const settings = this.rtlSettings.get(language.split('-)[0]') || this.rtlSettings.get('ar);
        const css: string[] = [],
        // 基本方向設定
        if(includeLayout) {'

            css.push('direction: rtl;'');

        }

            css.push('text-align: right;); }'
        }
        
        // タイポグラフィ設定
        if(includeTypography && settings) {
            css.push(`font-family: ${settings.fontFamily);`);
            css.push(`font-size: ${settings.fontSize);`);''
            css.push(`line-height: ${settings.lineHeight};`'};

            ';

        }

            if(settings.wordSpacing !== 'normal) {' }

                css.push(`word-spacing: ${settings.wordSpacing};`'});

            }''
            if(settings.letterSpacing !== 'normal) {'
                
            }
                css.push(`letter-spacing: ${settings.letterSpacing};`});
            }
        }
        ';
        // 間隔設定
        if(includeSpacing) {'

            css.push('margin-right: 0;'');''
            css.push('margin-left: auto;'');''
            css.push('padding-right: inherit;'');

        }

            css.push('padding-left: 0;); }'
        }
        
        // カスタムプロパティ
        Object.entries(customProperties).forEach(([property, value]) => {  }
            css.push(`${property}: ${value};`);''
        }');
        ';

        return { ''
            css: css.join(', ');
            isRTL: true;
           , language: language, };
            settings: settings }
        }
    
    /**
     * DOM要素にRTL設定を適用
     */
    applyRTLToElement(element: HTMLElement, language: string, options: RTLCSSOptions = { ): boolean {
        if(!element || !this.isRTLLanguage(language) {
            
        }
            return false;

        ';

        try {'
            const rtlCSS = this.generateRTLCSS(language, options);
            ';
            // CSS プロパティを適用
            element.style.direction = 'rtl';''
            element.style.textAlign = 'right';''
            element.setAttribute('dir', 'rtl'');''
            element.setAttribute('lang', language);
            ';
            // 追加のスタイル適用
            if(rtlCSS.settings) {
                element.style.fontFamily = rtlCSS.settings.fontFamily;
                element.style.fontSize = rtlCSS.settings.fontSize;
            }
                element.style.lineHeight = rtlCSS.settings.lineHeight; }
            }
            ';
            // RTLクラスを追加
            element.classList.add('rtl-content'');''
            element.classList.add(`rtl-${language.split('-'})[0]}`);
            
            return true;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'RTL_APPLICATION_ERROR', {)
                element: element.tagName,);
                language: language ,});
            return false;
    
    /**
     * RTL言語の入力処理
     */'
    handleRTLInput(inputElement: HTMLInputElement | HTMLTextAreaElement, language: string): (() => void) | void { ''
        if(!inputElement || !this.isRTLLanguage(language)) {
            return; }
        ';
        // 入力方向設定
        inputElement.style.direction = 'rtl';''
        inputElement.style.textAlign = 'right';''
        inputElement.setAttribute('dir', 'rtl);
        
        // 入力イベントリスナー
        const handleInput = (event: Event): void => {  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
            const text = target.value;
            const direction = this.detectTextDirection(text);
            // 動的方向調整
            if(direction.confidence > 0.7) {
                
            }

                target.style.direction = direction.direction;' }'

                target.style.textAlign = direction.direction === 'rtl' ? 'right' : 'left'; }
};

        inputElement.addEventListener('input', handleInput);''
        inputElement.addEventListener('paste', handleInput);
        ';
        // クリーンアップ関数を返す
        return (') => {  ''
            inputElement.removeEventListener('input', handleInput);' }

            inputElement.removeEventListener('paste', handleInput); }
        }
    
    /**
     * ヘルパー関数群
     */
    
    private isRTLCharacter(charCode: number): boolean { for (const [start, end] of this.rtlCharacterRanges) {
            if(charCode >= start && charCode <= end) {
                
            }
                return true;
        return false;
    }
    
    private isLTRCharacter(charCode: number): boolean { // 基本ラテン文字
        if (charCode >= 0x0041 && charCode <= 0x005A) return true; // A-Z
        if (charCode >= 0x0061 && charCode <= 0x007A) return true; // a-z
        
        // 数字
        if (charCode >= 0x0030 && charCode <= 0x0039) return true; // 0-9
        
        // 拡張ラテン文字
        if (charCode >= 0x00C0 && charCode <= 0x00FF) return true; // Latin-1 Supplement
        if (charCode >= 0x0100 && charCode <= 0x017F) return true; // Latin Extended-A
        if (charCode >= 0x0180 && charCode <= 0x024F) return true; // Latin Extended-B
        
        // キリル文字
        if (charCode >= 0x0400 && charCode <= 0x04FF) return true; // Cyrillic
        
        // ギリシャ文字
        if (charCode >= 0x0370 && charCode <= 0x03FF) return true; // Greek
        
        return false; }
    
    /**
     * RTL言語情報を取得
     */
    getRTLLanguageInfo(language: string): RTLLanguageInfo | null { const info = this.rtlLanguages.get(language);''
        if(info) return info;
        ';
        // 主要言語コードで再検索
        const primaryLanguage = language.split('-)[0];
        return this.rtlLanguages.get(primaryLanguage) || null; }
    
    /**
     * サポートするRTL言語一覧を取得
     */
    getSupportedRTLLanguages(): RTLLanguageData[] { return Array.from(this.rtlLanguages.entries().map(([code, info]) => ({
            code: code;
            name: info.name;
            script: info.script;
            direction: info.direction);
           , family: info.family ,}
        });
    }
    
    /**
     * 双方向制御文字を取得
     */
    getBidiControlCharacters(): BidiControlCharacters {
        return { ...this.bidiControlChars;
    }
    
    /**
     * RTL設定を取得'
     */''
    getRTLSettings(language: string): RTLSettings | null { ''
        const primaryLanguage = language.split('-)[0];
        return this.rtlSettings.get(primaryLanguage) || null; }
    
    /**
     * 統計情報を取得
     */
    getStats(): RTLStats { return { supportedRTLLanguages: this.rtlLanguages.size,
            rtlCharacterRanges: this.rtlCharacterRanges.length;
            bidiControlChars: Object.keys(this.bidiControlChars).length;
           , languageFamilies: Array.from(new, Set(), };
                Array.from(this.rtlLanguages.values().map(info => info.family); }
        }
}

// シングルトンインスタンス
let rtlLanguageDetectorInstance: RTLLanguageDetector | null = null,

/**
 * RTLLanguageDetectorのシングルトンインスタンスを取得
 */
export function getRTLLanguageDetector(): RTLLanguageDetector { if (!rtlLanguageDetectorInstance) {''
        rtlLanguageDetectorInstance = new RTLLanguageDetector(' })'