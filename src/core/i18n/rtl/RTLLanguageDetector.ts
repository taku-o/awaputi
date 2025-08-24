import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// インターフェース定義
export interface RTLLanguageInfo {
    name: string;
    script: string;
    direction: 'rtl' | 'ltr';
    family: string;
}

export interface BidiControlCharacters {
    LRM: string;  // Left-to-Right Mark
    RLM: string;  // Right-to-Left Mark
    LRE: string;  // Left-to-Right Embedding
    RLE: string;  // Right-to-Left Embedding
    PDF: string;  // Pop Directional Formatting
    LRO: string;  // Left-to-Right Override
    RLO: string;  // Right-to-Left Override
    LRI: string;  // Left-to-Right Isolate
    RLI: string;  // Right-to-Left Isolate
    FSI: string;  // First Strong Isolate
    PDI: string;  // Pop Directional Isolate
}

export interface RTLSettings {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    textAlign: string;
    wordSpacing: string;
    letterSpacing: string;
}

export interface TextDirectionResult {
    direction: 'rtl' | 'ltr';
    confidence: number;
    details: {
        rtlChars: number;
        ltrChars: number;
        neutralChars: number;
        rtlRatio?: number;
    };
}

export interface BidiTextSegment {
    text: string;
    language?: string;
    direction?: 'rtl' | 'ltr';
}

export interface BidiTextResult {
    text: string;
    hasRTL: boolean;
    segments?: BidiTextSegment[];
}

export interface RTLCSSOptions {
    includeLayout?: boolean;
    includeTypography?: boolean;
    includeSpacing?: boolean;
    customProperties?: { [key: string]: string };
}

export interface RTLCSSResult {
    css: string;
    isRTL: boolean;
    language?: string;
    settings?: RTLSettings;
}

export interface RTLLanguageData {
    code: string;
    name: string;
    script: string;
    direction: 'rtl' | 'ltr';
    family: string;
}

export interface RTLStats {
    supportedRTLLanguages: number;
    rtlCharacterRanges: number;
    bidiControlChars: number;
    languageFamilies: string[];
}

/**
 * RTL言語検出システム - Right-to-Left言語の識別と方向制御
 */
export class RTLLanguageDetector {
    private rtlLanguages: Map<string, RTLLanguageInfo>;
    private rtlCharacterRanges: [number, number][];
    private bidiControlChars: BidiControlCharacters;
    private rtlSettings: Map<string, RTLSettings>;

    constructor() {
        // RTL言語の定義
        this.rtlLanguages = new Map([
            // アラビア語
            ['ar', { name: 'Arabic', script: 'Arab', direction: 'rtl', family: 'arabic' }],
            ['ar-SA', { name: 'Arabic (Saudi Arabia)', script: 'Arab', direction: 'rtl', family: 'arabic' }],
            ['ar-EG', { name: 'Arabic (Egypt)', script: 'Arab', direction: 'rtl', family: 'arabic' }],
            ['ar-AE', { name: 'Arabic (UAE)', script: 'Arab', direction: 'rtl', family: 'arabic' }],
            ['ar-MA', { name: 'Arabic (Morocco)', script: 'Arab', direction: 'rtl', family: 'arabic' }],
            
            // ヘブライ語
            ['he', { name: 'Hebrew', script: 'Hebr', direction: 'rtl', family: 'hebrew' }],
            ['he-IL', { name: 'Hebrew (Israel)', script: 'Hebr', direction: 'rtl', family: 'hebrew' }],
            
            // ペルシャ語（ファルシ語）
            ['fa', { name: 'Persian', script: 'Arab', direction: 'rtl', family: 'persian' }],
            ['fa-IR', { name: 'Persian (Iran)', script: 'Arab', direction: 'rtl', family: 'persian' }],
            ['fa-AF', { name: 'Persian (Afghanistan)', script: 'Arab', direction: 'rtl', family: 'persian' }],
            
            // ウルドゥー語
            ['ur', { name: 'Urdu', script: 'Arab', direction: 'rtl', family: 'urdu' }],
            ['ur-PK', { name: 'Urdu (Pakistan)', script: 'Arab', direction: 'rtl', family: 'urdu' }],
            ['ur-IN', { name: 'Urdu (India)', script: 'Arab', direction: 'rtl', family: 'urdu' }],
            
            // その他のRTL言語
            ['ku', { name: 'Kurdish', script: 'Arab', direction: 'rtl', family: 'kurdish' }],
            ['ps', { name: 'Pashto', script: 'Arab', direction: 'rtl', family: 'pashto' }],
            ['sd', { name: 'Sindhi', script: 'Arab', direction: 'rtl', family: 'sindhi' }],
            ['ug', { name: 'Uyghur', script: 'Arab', direction: 'rtl', family: 'uyghur' }]
        ]);
        
        // RTL文字の Unicode 範囲
        this.rtlCharacterRanges = [
            [0x0590, 0x05FF], // Hebrew
            [0x0600, 0x06FF], // Arabic
            [0x0700, 0x074F], // Syriac
            [0x0750, 0x077F], // Arabic Supplement
            [0x0780, 0x07BF], // Thaana
            [0x07C0, 0x07FF], // NKo
            [0x0800, 0x083F], // Samaritan
            [0x0840, 0x085F], // Mandaic
            [0x08A0, 0x08FF], // Arabic Extended-A
            [0xFB1D, 0xFB4F], // Hebrew Presentation Forms
            [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
            [0xFE70, 0xFEFF]  // Arabic Presentation Forms-B
        ];
        
        // 双方向テキスト制御文字
        this.bidiControlChars = {
            LRM: '\u200E', // Left-to-Right Mark
            RLM: '\u200F', // Right-to-Left Mark
            LRE: '\u202A', // Left-to-Right Embedding
            RLE: '\u202B', // Right-to-Left Embedding
            PDF: '\u202C', // Pop Directional Formatting
            LRO: '\u202D', // Left-to-Right Override
            RLO: '\u202E', // Right-to-Left Override
            LRI: '\u2066', // Left-to-Right Isolate
            RLI: '\u2067', // Right-to-Left Isolate
            FSI: '\u2068', // First Strong Isolate
            PDI: '\u2069'  // Pop Directional Isolate
        };
        
        // RTL言語特有の設定
        this.rtlSettings = new Map([
            ['ar', {
                fontFamily: 'Arial, "Arabic UI", "Tahoma", sans-serif',
                fontSize: '1.1em',
                lineHeight: '1.6',
                textAlign: 'right',
                wordSpacing: '0.1em',
                letterSpacing: 'normal'
            }],
            ['he', {
                fontFamily: 'Arial, "Hebrew UI", "David", sans-serif',
                fontSize: '1.05em',
                lineHeight: '1.5',
                textAlign: 'right',
                wordSpacing: 'normal',
                letterSpacing: 'normal'
            }],
            ['fa', {
                fontFamily: 'Arial, "Persian UI", "Tahoma", sans-serif',
                fontSize: '1.1em',
                lineHeight: '1.6',
                textAlign: 'right',
                wordSpacing: '0.15em',
                letterSpacing: 'normal'
            }]
        ]);

        console.log('RTLLanguageDetector initialized');
    }

    /**
     * 言語がRTLかどうかを判定
     */
    isRTLLanguage(language: string): boolean {
        if (!language) return false;
        
        // 完全一致チェック
        if (this.rtlLanguages.has(language)) {
            return true;
        }
        
        // 言語コードの主要部分をチェック（例: ar-SA → ar）
        const primaryLanguage = language.split('-')[0];
        return this.rtlLanguages.has(primaryLanguage);
    }
    
    /**
     * テキストがRTL文字を含むかどうかを判定
     */
    containsRTLCharacters(text: string): boolean {
        if (!text || typeof text !== 'string') return false;
        
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            for (const [start, end] of this.rtlCharacterRanges) {
                if (charCode >= start && charCode <= end) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * テキストの方向を検出
     */
    detectTextDirection(text: string): TextDirectionResult {
        if (!text || typeof text !== 'string') {
            return {
                direction: 'ltr',
                confidence: 0,
                details: {
                    rtlChars: 0,
                    ltrChars: 0,
                    neutralChars: 0,
                    rtlRatio: 0
                }
            };
        }
        
        let rtlChars = 0;
        let ltrChars = 0;
        let neutralChars = 0;
        
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            
            // RTL文字をチェック
            let isRTL = false;
            for (const [start, end] of this.rtlCharacterRanges) {
                if (charCode >= start && charCode <= end) {
                    rtlChars++;
                    isRTL = true;
                    break;
                }
            }
            
            if (!isRTL) {
                // LTR文字（ラテン文字、数字など）をチェック
                if ((charCode >= 0x0041 && charCode <= 0x005A) || // A-Z
                    (charCode >= 0x0061 && charCode <= 0x007A) || // a-z
                    (charCode >= 0x0030 && charCode <= 0x0039)) { // 0-9
                    ltrChars++;
                } else {
                    neutralChars++;
                }
            }
        }
        
        const totalDirectionalChars = rtlChars + ltrChars;
        const rtlRatio = totalDirectionalChars > 0 ? rtlChars / totalDirectionalChars : 0;
        
        const direction: 'rtl' | 'ltr' = rtlRatio > 0.5 ? 'rtl' : 'ltr';
        const confidence = Math.abs(rtlRatio - 0.5) * 2; // 0.5から離れるほど確信度が高い
        
        return {
            direction,
            confidence: Math.round(confidence * 100) / 100,
            details: {
                rtlChars,
                ltrChars,
                neutralChars,
                rtlRatio: Math.round(rtlRatio * 100) / 100
            }
        };
    }
    
    /**
     * 双方向テキスト制御文字を取得
     */
    getBidiControlCharacters(): BidiControlCharacters {
        return { ...this.bidiControlChars };
    }
    
    /**
     * RTL言語の設定を取得
     */
    getRTLSettings(language: string): RTLSettings | null {
        if (this.rtlSettings.has(language)) {
            return { ...this.rtlSettings.get(language)! };
        }
        
        // 言語コードの主要部分をチェック
        const primaryLanguage = language.split('-')[0];
        if (this.rtlSettings.has(primaryLanguage)) {
            return { ...this.rtlSettings.get(primaryLanguage)! };
        }
        
        return null;
    }
    
    /**
     * RTL言語情報を取得
     */
    getRTLLanguageInfo(language: string): RTLLanguageInfo | null {
        if (this.rtlLanguages.has(language)) {
            return { ...this.rtlLanguages.get(language)! };
        }
        
        // 言語コードの主要部分をチェック
        const primaryLanguage = language.split('-')[0];
        if (this.rtlLanguages.has(primaryLanguage)) {
            return { ...this.rtlLanguages.get(primaryLanguage)! };
        }
        
        return null;
    }
    
    /**
     * サポートされているRTL言語の一覧を取得
     */
    getSupportedRTLLanguages(): RTLLanguageData[] {
        return Array.from(this.rtlLanguages.entries()).map(([code, info]) => ({
            code,
            ...info
        }));
    }
    
    /**
     * RTL用CSSを生成
     */
    generateRTLCSS(language: string, options: RTLCSSOptions = {}): RTLCSSResult {
        const {
            includeLayout = true,
            includeTypography = true,
            includeSpacing = true,
            customProperties = {}
        } = options;
        
        const isRTL = this.isRTLLanguage(language);
        const settings = this.getRTLSettings(language);
        
        if (!isRTL || !settings) {
            return {
                css: '',
                isRTL: false,
                language
            };
        }
        
        let css = '';
        
        if (includeLayout) {
            css += `
                direction: rtl;
                unicode-bidi: embed;
            `;
        }
        
        if (includeTypography && settings) {
            css += `
                font-family: ${settings.fontFamily};
                font-size: ${settings.fontSize};
                line-height: ${settings.lineHeight};
                text-align: ${settings.textAlign};
            `;
        }
        
        if (includeSpacing && settings) {
            css += `
                word-spacing: ${settings.wordSpacing};
                letter-spacing: ${settings.letterSpacing};
            `;
        }
        
        // カスタムプロパティを追加
        for (const [property, value] of Object.entries(customProperties)) {
            css += `${property}: ${value};\n`;
        }
        
        return {
            css: css.trim(),
            isRTL: true,
            language,
            settings
        };
    }
    
    /**
     * 双方向テキストの処理
     */
    processBidiText(text: string): BidiTextResult {
        if (!text || typeof text !== 'string') {
            return {
                text: '',
                hasRTL: false,
                segments: []
            };
        }
        
        const hasRTL = this.containsRTLCharacters(text);
        const direction = this.detectTextDirection(text);
        
        // 簡易的なセグメンテーション
        const segments: BidiTextSegment[] = [{
            text,
            direction: direction.direction
        }];
        
        return {
            text,
            hasRTL,
            segments
        };
    }
    
    /**
     * RTL文字列の整形
     */
    formatRTLText(text: string, language: string): string {
        if (!this.isRTLLanguage(language) || !this.containsRTLCharacters(text)) {
            return text;
        }
        
        // 基本的な双方向テキストマークを追加
        const { RLM, LRM } = this.bidiControlChars;
        
        // 数字やLTR文字の前後にマークを追加（簡易実装）
        let formatted = text.replace(/(\d+)/g, `${LRM}$1${RLM}`);
        
        return formatted;
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): RTLStats {
        const languageFamilies = Array.from(new Set(
            Array.from(this.rtlLanguages.values()).map(info => info.family)
        ));
        
        return {
            supportedRTLLanguages: this.rtlLanguages.size,
            rtlCharacterRanges: this.rtlCharacterRanges.length,
            bidiControlChars: Object.keys(this.bidiControlChars).length,
            languageFamilies
        };
    }
    
    /**
     * RTL言語サポートを追加
     */
    addRTLLanguageSupport(code: string, info: RTLLanguageInfo, settings?: RTLSettings): void {
        this.rtlLanguages.set(code, info);
        
        if (settings) {
            this.rtlSettings.set(code, settings);
        }
        
        console.log(`Added RTL support for language: ${code}`);
    }
    
    /**
     * RTL言語サポートを削除
     */
    removeRTLLanguageSupport(code: string): boolean {
        const removed = this.rtlLanguages.delete(code);
        this.rtlSettings.delete(code);
        
        if (removed) {
            console.log(`Removed RTL support for language: ${code}`);
        }
        
        return removed;
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        // 特にクリーンアップは不要（すべてプリミティブデータ）
        console.log('RTLLanguageDetector cleaned up');
    }
}

// シングルトンインスタンス
let rtlLanguageDetectorInstance: RTLLanguageDetector | null = null;

/**
 * RTLLanguageDetectorのシングルトンインスタンスを取得
 */
export function getRTLLanguageDetector(): RTLLanguageDetector {
    if (!rtlLanguageDetectorInstance) {
        rtlLanguageDetectorInstance = new RTLLanguageDetector();
    }
    return rtlLanguageDetectorInstance;
}