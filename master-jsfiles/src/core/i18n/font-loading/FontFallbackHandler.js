export class FontFallbackHandler {
    constructor(config = {}) {
        this.config = config;
        this.fallbackChains = this._initializeFallbackChains();
        this.systemFonts = this._detectSystemFonts();
        this.appliedFallbacks = new Map();
    }

    _initializeFallbackChains() {
        return {
            'ja': ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic', 'sans-serif'],
            'zh-CN': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'SimHei', 'sans-serif'],
            'zh-TW': ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'PMingLiU', 'sans-serif'],
            'ko': ['Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Dotum', 'sans-serif'],
            'ar': ['Noto Sans Arabic', 'Tahoma', 'Arial Unicode MS', 'sans-serif'],
            'hi': ['Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', 'sans-serif'],
            'th': ['Noto Sans Thai', 'Tahoma', 'Arial Unicode MS', 'sans-serif'],
            'vi': ['Noto Sans Vietnamese', 'Tahoma', 'Arial Unicode MS', 'sans-serif'],
            'default': ['Arial', 'Helvetica', 'sans-serif']
        };
    }

    _detectSystemFonts() {
        const systemFonts = new Set();
        const testFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
            'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS',
            'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic',
            'PingFang SC', 'Microsoft YaHei', 'SimHei',
            'PingFang TC', 'Microsoft JhengHei', 'PMingLiU',
            'Apple SD Gothic Neo', 'Malgun Gothic', 'Dotum'
        ];

        testFonts.forEach(font => {
            if (this._isFontAvailable(font)) {
                systemFonts.add(font);
            }
        });

        return systemFonts;
    }

    _isFontAvailable(fontName) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        context.font = '72px monospace';
        const baseline = context.measureText(text).width;
        
        context.font = `72px '${fontName}', monospace`;
        const variation = context.measureText(text).width;
        
        return baseline !== variation;
    }

    getFallbackChain(language) {
        const chain = this.fallbackChains[language] || this.fallbackChains['default'];
        
        return chain.filter(font => {
            if (font === 'sans-serif' || font === 'serif' || font === 'monospace') {
                return true;
            }
            return this.systemFonts.has(font);
        });
    }

    applyFallback(element, language, originalFont = null) {
        if (!element) {
            return false;
        }

        const fallbackChain = this.getFallbackChain(language);
        const fontStack = originalFont ? [originalFont, ...fallbackChain] : fallbackChain;
        const fontFamily = fontStack.join(', ');

        element.style.fontFamily = fontFamily;
        
        this.appliedFallbacks.set(element, {
            language: language,
            originalFont: originalFont,
            fallbackChain: fallbackChain,
            appliedAt: Date.now()
        });

        if (this.config.development?.verboseLogging) {
            console.log(`[FontFallbackHandler] Applied fallback for ${language}: ${fontFamily}`);
        }

        return true;
    }

    applyFallbackToElements(selector, language, originalFont = null) {
        const elements = document.querySelectorAll(selector);
        let appliedCount = 0;

        elements.forEach(element => {
            if (this.applyFallback(element, language, originalFont)) {
                appliedCount++;
            }
        });

        return appliedCount;
    }

    getSystemFontForLanguage(language) {
        const fallbackChain = this.getFallbackChain(language);
        
        for (const font of fallbackChain) {
            if (font === 'sans-serif' || font === 'serif' || font === 'monospace') {
                return font;
            }
            if (this.systemFonts.has(font)) {
                return font;
            }
        }

        return 'sans-serif';
    }

    getBestFontForLanguage(language, preferredFonts = []) {
        const availablePreferred = preferredFonts.filter(font => this.systemFonts.has(font));
        if (availablePreferred.length > 0) {
            return availablePreferred[0];
        }

        return this.getSystemFontForLanguage(language);
    }

    validateFontStack(fontStack, language) {
        const fonts = fontStack.split(',').map(f => f.trim().replace(/['"]/g, ''));
        const validFonts = [];

        fonts.forEach(font => {
            if (font === 'sans-serif' || font === 'serif' || font === 'monospace') {
                validFonts.push(font);
            } else if (this.systemFonts.has(font)) {
                validFonts.push(font);
            }
        });

        if (validFonts.length === 0) {
            const fallback = this.getSystemFontForLanguage(language);
            validFonts.push(fallback);
        }

        return validFonts.join(', ');
    }

    getFallbackInfo(element) {
        return this.appliedFallbacks.get(element) || null;
    }

    clearFallbackHistory() {
        this.appliedFallbacks.clear();
    }

    getStats() {
        const stats = {
            totalApplied: this.appliedFallbacks.size,
            byLanguage: {},
            systemFontsCount: this.systemFonts.size,
            availableSystemFonts: Array.from(this.systemFonts)
        };

        for (const [element, info] of this.appliedFallbacks.entries()) {
            const lang = info.language;
            if (!stats.byLanguage[lang]) {
                stats.byLanguage[lang] = 0;
            }
            stats.byLanguage[lang]++;
        }

        return stats;
    }

    refreshSystemFonts() {
        this.systemFonts = this._detectSystemFonts();
        
        if (this.config.development?.verboseLogging) {
            console.log('[FontFallbackHandler] Refreshed system fonts:', Array.from(this.systemFonts));
        }
        
        return this.systemFonts.size;
    }
}