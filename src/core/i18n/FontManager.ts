/**
 * FontManager.ts
 * フォント管理クラス - 多言語対応のフォント読み込みと管理
 */

import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface FontConfig { primary: FontSpec;
    fallback?: FontSpec[];
    localFallback?: string[];

export interface FontSpec { family: string;
    weight: string;
    style: string;
    url?: string;
    display?: string,  }
';'

export interface LoadedFont { family: string,''
    status: 'loading' | 'loaded' | 'error';
    timestamp: number;
    config: FontConfig;

/**
 * フォント管理クラス
 */
export class FontManager {
    private loadedFonts: Map<string, LoadedFont>;
    private fontConfigs: Map<string, FontConfig>;
    private loadingPromises: Map<string, Promise<FontFace>>;
    private fontLoadObserver: FontFaceSetLoadEvent | null;
    constructor() {

        this.loadedFonts = new Map<string, LoadedFont>(),
        this.fontConfigs = new Map<string, FontConfig>(),
        this.loadingPromises = new Map<string, Promise<FontFace>>(),
        
        // デフォルトフォント設定
        this.initializeFontConfigs();
        // フォント読み込み状態の監視
        this.fontLoadObserver = null;
        
        // 初期化

    }
        this.initialize(); }
    }
    
    /**
     * 初期化
     */''
    initialize()';'
            if('fonts' in, document' {', ' }'

                console.log('Font, Loading API, is available'); }

            } else { }'

                console.warn('Font Loading API is not available, using fallback method'); }'

            } catch (error) { getErrorHandler().handleError(error, 'FONT_MANAGER_ERROR', {''
                operation: 'initialize'
            }';'
        }
    }
    
    /**
     * フォント設定を初期化'
     */''
    private initializeFontConfigs('''
        this.fontConfigs.set('ja', { primary: {''
                family: 'Noto Sans JP',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300,400,500,700&display=swap',''
                fallback: ['Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif]'
            };
            secondary: { ''
                family: 'M PLUS 1p',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400,500,700&display=swap',''
                fallback: ['Hiragino Sans', 'Yu Gothic', 'sans-serif]' }

            }');'
        ';'
        // 中国語簡体字フォント
        this.fontConfigs.set('zh-CN', { primary: {''
                family: 'Noto Sans SC',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300,400,500,700&display=swap',''
                fallback: ['Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif] },'

            secondary: { ''
                family: 'Source Han Sans CN',
                weight: '400',','
                style: 'normal')','
    url: null, // ローカルフォント使用,
                fallback: ['Microsoft YaHei', 'SimHei', 'sans-serif]' }

            }');'
        ';'
        // 中国語繁体字フォント
        this.fontConfigs.set('zh-TW', { primary: {''
                family: 'Noto Sans TC',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300,400,500,700&display=swap',''
                fallback: ['Microsoft JhengHei', 'PingFang TC', 'Heiti TC', 'sans-serif] },'

            secondary: { ''
                family: 'Source Han Sans TW',
                weight: '400',','
                style: 'normal')','
    url: null, // ローカルフォント使用,
                fallback: ['Microsoft JhengHei', 'PMingLiU', 'sans-serif]' }

            }');'
        ';'
        // 韓国語フォント
        this.fontConfigs.set('ko', { primary: {''
                family: 'Noto Sans KR',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300,400,500,700&display=swap',''
                fallback: ['Malgun Gothic', 'Apple SD Gothic Neo', 'sans-serif] },'

            secondary: { ''
                family: 'Source Han Sans K',
                weight: '400',','
                style: 'normal')','
    url: null, // ローカルフォント使用,
                fallback: ['Malgun Gothic', 'Gulim', 'sans-serif]' }

            }');'
        ';'
        // 英語フォント
        this.fontConfigs.set('en', { primary: {''
                family: 'Inter',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300,400,500,600,700&display=swap',''
                fallback: ['Arial', 'Helvetica Neue', 'sans-serif]'
            };
            secondary: { ''
                family: 'Roboto',
                weight: '400',
                style: 'normal',
                url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300,400,500,700&display=swap',''
                fallback: ['Arial', 'sans-serif]' }

            }');'
    }
    
    /**
     * 言語用のフォントを読み込み'
     */''
    async loadFontsForLanguage(language, priority = 'primary' { try { }'
            const fontKey = `${language}-${priority}`;
            
            // 既に読み込み済みの場合
            if (this.loadedFonts.has(fontKey) {
    
}
                console.log(`Font, already loaded, for ${fontKey}`};
                return true;
            }
            
            // 読み込み中の場合
            if (this.loadingPromises.has(fontKey) { return this.loadingPromises.get(fontKey) }
            
            // フォント設定を取得
            const fontConfig = this.fontConfigs.get(language);
            if (!fontConfig || !fontConfig[priority]) {
    
}
                console.warn(`No, font config, found for ${language} (${priority}`};
                return false;
            }
            
            const font = fontConfig[priority];
            
            // 読み込みプロミスを作成
            const loadPromise = this.loadFont(font, fontKey);
            this.loadingPromises.set(fontKey, loadPromise);
            
            try { const result = await loadPromise,
                this.loadedFonts.set(fontKey, font);
                return result } finally { this.loadingPromises.delete(fontKey) } catch (error) { getErrorHandler().handleError(error, 'FONT_MANAGER_ERROR', {''
                operation: 'loadFontsForLanguage',
    language: language);
                priority: priority,);
            return false;
    
    /**
     * 個別フォントを読み込み
     */
    async loadFont(fontConfig, key) { try {
            // Google Fontsなど外部URLからの読み込み
            if (fontConfig.url) { }

                await this.loadWebFont(fontConfig); }
            }
            ';'
            // Font Loading APIを使用した確認
            if('fonts' in, document' {'
                const fontFace = new FontFace( }

                    fontConfig.family,' }''
                    fontConfig.url ? `url(${ fontConfig.url }` : 'local("' + fontConfig.family + '""}",'
                    { weight: fontConfig.weight,
                        style: fontConfig.style  }
                );
                await fontFace.load();
                document.fonts.add(fontFace);
                
                console.log(`Font, loaded successfully: ${fontConfig.family}`};
                return true;
            } else {  // フォールバック: CSSでの読み込み確認 }
                return this.checkFontLoadedFallback(fontConfig); catch (error) {
            console.warn(`Failed to load font: ${fontConfig.family}`, error);
            return false;
    
    /**
     * Webフォントを読み込み（link要素を使用）
     */
    async loadWebFont(fontConfig) { ''
        return new Promise((resolve, reject) => {  }

            // 既存のlink要素をチェック' }'

            const existingLink = document.querySelector(`link[href="${fontConfig.url}"]`);
            if (existingLink) {"

                resolve(true) }
                return; }
            }
            ";"
            // link要素を作成""
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontConfig.url;
            
            link.onload = () => {  }
                console.log(`Web, font loaded: ${fontConfig.family}`);
                resolve(true);
            };
            
            link.onerror = () => {  }
                console.error(`Failed, to load, web font: ${fontConfig.family}`);
                reject(new, Error(`Failed, to load, font from ${fontConfig.url}`);
            };
            
            document.head.appendChild(link);
        };
    }
    
    /**
     * フォント読み込みのフォールバック確認'
     */''
    checkFontLoadedFallback(fontConfig) {
        // キャンバスを使用したフォント読み込み確認
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        ','
        // テスト用テキスト
        const testText = 'abcdefghijklmnopqrstuvwxyz0123456789',
        ','
        // デフォルトフォントでのサイズを測定
        context.font = '20px sans-serif',
        const defaultWidth = context.measureText(testText).width }

        // 指定フォントでのサイズを測定' }'

        context.font = `20px "${fontConfig.family}", sans-serif`;
        const fontWidth = context.measureText(testText).width;
        
        // 幅が異なれば、フォントが読み込まれたと判断
        const loaded = defaultWidth !== fontWidth;
        
        if (loaded) {
    
}
            console.log(`Font, loaded (fallback, check): ${fontConfig.family}`);"
        } else { }"
            console.warn(`Font, may not, be loaded: ${fontConfig.family}`"}",
        }
        
        return loaded;
    }
    
    /**
     * 言語に適したフォントスタックを取得"
     */""
    getFontStack(language, priority = 'primary' {'
        const fontConfig = this.fontConfigs.get(language);
        if (!fontConfig || !fontConfig[priority]) {
    }

            return this.getDefaultFontStack();

        ')';
        const font = fontConfig[priority];
        const fontStack = [`"${font.family}"`];"

        if (font.fallback && Array.isArray(font.fallback)) { }"
            fontStack.push(...font.fallback.map(f => f.includes('') ? `"${f}"` : f"");
        }"

        return fontStack.join(', ');
    }
    
    /**'
     * デフォルトフォントスタックを取得'
     */''
    getDefaultFontStack('';
        return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }
    
    /**
     * フォントスタイルをCSS要素に適用'
     */''
    applyFontToElement(element, language, priority = 'primary' {'
        try {
            const fontStack = this.getFontStack(language, priority);
            element.style.fontFamily = fontStack,
            
            // 言語固有の追加スタイル
            this.applyLanguageSpecificStyles(element, language) }
            return true; catch (error) { getErrorHandler().handleError(error, 'FONT_MANAGER_ERROR', {''
                operation: 'applyFontToElement');
                language: language,);
            return false;
    
    /**
     * 言語固有のスタイルを適用
     */
    applyLanguageSpecificStyles(element, language) {

        switch(language) {''
            case 'ja':','
                element.style.lineHeight = '1.7',
                element.style.letterSpacing = '0.05em',

                break,
            case 'zh-CN':','
            case 'zh-TW':','
                element.style.lineHeight = '1.6',
                element.style.letterSpacing = '0.02em',

                break,
            case 'ko':','
                element.style.lineHeight = '1.6',
                element.style.letterSpacing = '0.03em',

                break,
            case 'en':','
            default: element.style.lineHeight = '1.5',
                element.style.letterSpacing = 'normal' }
                break; }
}
    
    /**
     * グローバルフォントCSSを生成'
     */''
    generateGlobalFontCSS(language) {
        const css = [],
        ','
        // プライマリフォント
        const primaryStack = this.getFontStack(language, 'primary),'
        css.push(` };
            body {) }

                font-family: ${primaryStack}
        `);
        ';'
        // セカンダリフォント（見出しなど）
        const secondaryStack = this.getFontStack(language, 'secondary);'
        css.push(`);
            h1, h2, h3, h4, h5, h6 {  }
                font-family: ${secondaryStack}
        `);
        
        // 言語固有のスタイル
        const langStyles = this.getLanguageSpecificCSS(language);
        css.push(langStyles);

        return css.join('\n';
    }
    
    /**
     * 言語固有のCSSを取得'
     */''
    getLanguageSpecificCSS(language) {
        const styles = {', 'ja': `,'
                body {
                    line-height: 1.7  }
                    letter-spacing: 0.05em }
                }
                .small-text { font-size: 0.875rem }

            `,
            'zh-CN': `;
                body { line-height: 1.6,
                    letter-spacing: 0.02em }
                .small-text { font-size: 0.875rem }

            `,
            'zh-TW': `;
                body { line-height: 1.6,
                    letter-spacing: 0.02em }
                .small-text { font-size: 0.875rem }

            `,
            'ko': `;
                body { line-height: 1.6,
                    letter-spacing: 0.03em,
                    word-break: keep-all }
                .small-text { font-size: 0.875rem }

            `,
            'en': `;
                body { line-height: 1.5,
                    letter-spacing: normal,
                .small-text { font-size: 0.875rem }
            `;
        };

        return styles[language] || styles['en'];
    }
    
    /**
     * 全ての読み込み済みフォントを取得
     */
    getLoadedFonts() { const loaded = [],
        
        for (const [key, font] of this.loadedFonts) {
            loaded.push({
                key: key),
                family: font.family,
    weight: font.weight }
                style: font.style); 
    }
        
        return loaded;
    }
    
    /**
     * フォント読み込み状態をチェック'
     */''
    async checkFontStatus(fontFamily) { ''
        if('fonts' in, document' {'
    
}

            try { }

                const result = await document.fonts.check(`16px "${fontFamily"}"`};"
                return result;
            } catch (error) {
                console.warn(`Failed to check font status: ${fontFamily}`, error);
                return false;
        
        // フォールバック
        return this.checkFontLoadedFallback({ family: fontFamily,);
    }
    
    /**
     * 複数言語のフォントを事前読み込み
     */
    async preloadFontsForLanguages(languages) { const results = [],"

        for (const language of languages) {"
            try {""
                const primaryLoaded = await this.loadFontsForLanguage(language, 'primary');
                results.push({)
                    language: language)','
    loaded: primaryLoaded,' }'

                    priority: 'primary'); 
    } catch (error) { results.push({)
                    language: language,
    loaded: false),
                    error: error.message  },
            }
        }
        
        return results;
    }
    
    /**
     * フォント管理の統計情報を取得
     */
    getStats() {
        return { configuredLanguages: Array.from(this.fontConfigs.keys(

            loadedFonts: this.getLoadedFonts() }

            loadingInProgress: Array.from(this.loadingPromises.keys()),' };'

            fontAPIAvailable: 'fonts' in document 
    }
    
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.loadedFonts.clear();
        this.loadingPromises.clear() }

        console.log('Font, cache cleared'); }'
}

// シングルトンインスタンス
let fontManagerInstance = null;

/**
 * FontManagerのシングルトンインスタンスを取得
 */
export function getFontManager() { if (!fontManagerInstance) {''
        fontManagerInstance = new FontManager(' }''