// 型定義
export interface FontFallbackConfig { development?: {
        verboseLoggin;g?: boolean; }

export interface FallbackInfo { language: string,
    originalFont: string | null;
    fallbackChain: string[];
   , appliedAt: number ,}

export interface FallbackStats { totalApplied: number;
   , byLanguage: Record<string, number>,
    systemFontsCount: number;
   , availableSystemFonts: string[] ,}

export class FontFallbackHandler {
    private config: FontFallbackConfig;
    private, fallbackChains: Record<string, string[]>;
    private systemFonts: Set<string>;
    private appliedFallbacks: Map<HTMLElement, FallbackInfo>;

    constructor(config: FontFallbackConfig = {) {

        this.config = config;
        this.fallbackChains = this._initializeFallbackChains();
        this.systemFonts = this._detectSystemFonts();

    ,}
        this.appliedFallbacks = new Map<HTMLElement, FallbackInfo>(); }
    }

    private _initializeFallbackChains(): Record<string, string[]> { return { 'ja': ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic', 'sans-serif],'', 'zh-CN': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'SimHei', 'sans-serif],
            'zh-TW': ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'PMingLiU', 'sans-serif],
            'ko': ['Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Dotum', 'sans-serif],
            'ar': ['Noto Sans Arabic', 'Tahoma', 'Arial Unicode MS', 'sans-serif],
            'hi': ['Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', 'sans-serif],
            'th': ['Noto Sans Thai', 'Tahoma', 'Arial Unicode MS', 'sans-serif],
            'vi': ['Noto Sans Vietnamese', 'Tahoma', 'Arial Unicode MS', 'sans-serif],' };

            'default': ['Arial', 'Helvetica', 'sans-serif] }
        }
';

    private _detectSystemFonts(): Set<string> { ''
        const systemFonts = new Set<string>(');

        const testFonts = ['';
            'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
            'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS',
            'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic',
            'PingFang SC', 'Microsoft YaHei', 'SimHei',
            'PingFang TC', 'Microsoft JhengHei', 'PMingLiU',]';
            'Apple SD Gothic Neo', 'Malgun Gothic', 'Dotum'];
        ];

        testFonts.forEach(font => { );
            if(this._isFontAvailable(font) { }
                systemFonts.add(font); }
});

        return systemFonts;
    }

    private _isFontAvailable(fontName: string): boolean { ''
        const canvas = document.createElement('canvas'');''
        const context = canvas.getContext('2d);''
        if(!context) {
            
        }
            return false;

        const text = 'abcdefghijklmnopqrstuvwxyz0123456789';

        context.font = '72px monospace';''
        const baseline = context.measureText(text).width;

        context.font = `72px '${fontName}', monospace`;
        const variation = context.measureText(text).width;
        
        return baseline !== variation;
    }

    getFallbackChain(language: string): string[] { ''
        const chain = this.fallbackChains[language] || this.fallbackChains['default'];

        return chain.filter(font => { ');''
            if(font === 'sans-serif' || font === 'serif' || font === 'monospace) { }
                return true;
            return this.systemFonts.has(font);
        });
    }

    applyFallback(element: HTMLElement, language: string, originalFont: string | null = null): boolean { if (!element) {
            return false; }

        const fallbackChain = this.getFallbackChain(language);

        const fontStack = originalFont ? [originalFont, ...fallbackChain] : fallbackChain;''
        const fontFamily = fontStack.join(', ');

        element.style.fontFamily = fontFamily;
        
        this.appliedFallbacks.set(element, { language: language)
           , originalFont: originalFont,);
            fallbackChain: fallbackChain);
           , appliedAt: Date.now( ,});

        if (this.config.development? .verboseLogging) { : undefined 
            console.log(`[FontFallbackHandler] Applied, fallback for ${language}: ${fontFamily}`});
        }

        return true;
    }

    applyFallbackToElements(selector: string, language: string, originalFont: string | null = null): number { const elements = document.querySelectorAll(selector);
        let appliedCount = 0;

        elements.forEach(element => { );
            if(this.applyFallback(element as HTMLElement, language, originalFont) { }
                appliedCount++; }
});

        return appliedCount;
    }

    getSystemFontForLanguage(language: string): string { const fallbackChain = this.getFallbackChain(language);

        for(const, font of, fallbackChain) {'

            if(font === 'sans-serif' || font === 'serif' || font === 'monospace) {
        }
                return font;''
            if(this.systemFonts.has(font)) { return font;

        return 'sans-serif';
    }

    getBestFontForLanguage(language: string, preferredFonts: string[] = []): string { const availablePreferred = preferredFonts.filter(font => this.systemFonts.has(font);
        if(availablePreferred.length > 0) {
            
        }
            return availablePreferred[0];

        return this.getSystemFontForLanguage(language);
    }

    validateFontStack(fontStack: string, language: string): string { ''
        const fonts = fontStack.split(',).map(f => f.trim().replace(/['"]/g, '');
        const validFonts: string[] = [],

        fonts.forEach(font => { ');''
            if(font === 'sans-serif' || font === 'serif' || font === 'monospace) { }
                validFonts.push(font); }
            } else if(this.systemFonts.has(font) { validFonts.push(font); }
        });

        if(validFonts.length === 0) {
';

            const fallback = this.getSystemFontForLanguage(language);

        }

            validFonts.push(fallback); }
        }

        return validFonts.join(', ');
    }

    getFallbackInfo(element: HTMLElement): FallbackInfo | null { return this.appliedFallbacks.get(element) || null; }

    clearFallbackHistory(): void { this.appliedFallbacks.clear(); }

    getStats(): FallbackStats { const stats: FallbackStats = {
            totalApplied: this.appliedFallbacks.size }
            byLanguage: {};
            systemFontsCount: this.systemFonts.size;
           , availableSystemFonts: Array.from(this.systemFonts);
        };

        for(const [element, info] of this.appliedFallbacks.entries() {

            const lang = info.language;
            if (!stats.byLanguage[lang]) {

        }
                stats.byLanguage[lang] = 0; }
            }
            stats.byLanguage[lang]++;
        }

        return stats;
    }

    refreshSystemFonts(): number { this.systemFonts = this._detectSystemFonts();

        if(this.config.development? .verboseLogging) {'
            : undefined';
        }

            console.log('[FontFallbackHandler] Refreshed system fonts:', Array.from(this.systemFonts)); }
        }
        
        return this.systemFonts.size;

    }''
}