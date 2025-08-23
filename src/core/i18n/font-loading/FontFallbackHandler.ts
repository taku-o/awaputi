// 型定義
export interface FontFallbackConfig {
    development?: {
        verboseLogging?: boolean;
    };
    customFallbacks?: Record<string, string[]>;
    enableSystemDetection?: boolean;
    cacheSystemFonts?: boolean;
}

export interface FallbackInfo {
    language: string;
    originalFont: string | null;
    fallbackChain: string[];
    appliedAt: number;
    fallbackUsed?: string;
    detectionMethod?: string;
}

export interface FallbackStats {
    totalApplied: number;
    byLanguage: Record<string, number>;
    systemFontsCount: number;
    availableSystemFonts: string[];
    lastRefreshed: number;
    detectionTime: number;
}

export interface FontAvailabilityResult {
    font: string;
    available: boolean;
    detectionMethod: string;
    confidence: number;
}

/**
 * フォントフォールバックハンドラー
 * 言語別のフォントフォールバックチェーンを管理し、システムフォントを検出
 */
export class FontFallbackHandler {
    private config: FontFallbackConfig;
    private fallbackChains: Record<string, string[]>;
    private systemFonts: Set<string>;
    private appliedFallbacks: Map<HTMLElement, FallbackInfo>;
    private fontDetectionCache: Map<string, boolean>;

    constructor(config: FontFallbackConfig = {}) {
        this.config = {
            development: {
                verboseLogging: false
            },
            enableSystemDetection: true,
            cacheSystemFonts: true,
            ...config
        };

        this.fallbackChains = this.initializeFallbackChains();
        this.systemFonts = new Set<string>();
        this.appliedFallbacks = new Map<HTMLElement, FallbackInfo>();
        this.fontDetectionCache = new Map<string, boolean>();

        // 初期化時にシステムフォントを検出
        if (this.config.enableSystemDetection) {
            this.refreshSystemFonts();
        }

        console.log('FontFallbackHandler initialized');
    }

    /**
     * フォールバックチェーンを初期化
     */
    private initializeFallbackChains(): Record<string, string[]> {
        const defaultChains = {
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

        // カスタムフォールバックがある場合はマージ
        if (this.config.customFallbacks) {
            return { ...defaultChains, ...this.config.customFallbacks };
        }

        return defaultChains;
    }

    /**
     * システムフォントを検出
     */
    private detectSystemFonts(): Set<string> {
        const systemFonts = new Set<string>();
        const detectionStart = performance.now();

        const testFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
            'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS',
            'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic',
            'PingFang SC', 'Microsoft YaHei', 'SimHei',
            'PingFang TC', 'Microsoft JhengHei', 'PMingLiU',
            'Apple SD Gothic Neo', 'Malgun Gothic', 'Dotum',
            'Noto Sans', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC',
            'Noto Sans KR', 'Noto Sans Arabic', 'Roboto', 'Open Sans'
        ];

        testFonts.forEach(font => {
            if (this.isFontAvailable(font)) {
                systemFonts.add(font);
            }
        });

        const detectionTime = performance.now() - detectionStart;
        
        if (this.config.development?.verboseLogging) {
            console.log(`[FontFallbackHandler] System font detection completed in ${detectionTime.toFixed(2)}ms`);
            console.log(`[FontFallbackHandler] Detected fonts:`, Array.from(systemFonts));
        }

        return systemFonts;
    }

    /**
     * フォントが利用可能かチェック
     */
    private isFontAvailable(fontName: string): boolean {
        // キャッシュをチェック
        if (this.config.cacheSystemFonts && this.fontDetectionCache.has(fontName)) {
            return this.fontDetectionCache.get(fontName)!;
        }

        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
                return false;
            }

            const text = 'abcdefghijklmnopqrstuvwxyz0123456789';

            // ベースライン測定（monospaceフォント）
            context.font = '72px monospace';
            const baseline = context.measureText(text).width;

            // テストフォントで測定
            context.font = `72px '${fontName}', monospace`;
            const variation = context.measureText(text).width;
            
            const available = baseline !== variation;

            // キャッシュに保存
            if (this.config.cacheSystemFonts) {
                this.fontDetectionCache.set(fontName, available);
            }

            return available;

        } catch (error) {
            console.warn(`[FontFallbackHandler] Font availability check failed for ${fontName}:`, error);
            return false;
        }
    }

    /**
     * 言語用のフォールバックチェーンを取得
     */
    getFallbackChain(language: string): string[] {
        const chain = this.fallbackChains[language] || this.fallbackChains['default'];

        // システムで利用可能なフォントのみをフィルタ
        return chain.filter(font => {
            if (font === 'sans-serif' || font === 'serif' || font === 'monospace') {
                return true;
            }
            return this.systemFonts.has(font);
        });
    }

    /**
     * 要素にフォールバックを適用
     */
    applyFallback(element: HTMLElement, language: string, originalFont: string | null = null): boolean {
        if (!element) {
            return false;
        }

        try {
            const fallbackChain = this.getFallbackChain(language);
            const fontStack = originalFont ? [originalFont, ...fallbackChain] : fallbackChain;
            const fontFamily = fontStack.join(', ');

            element.style.fontFamily = fontFamily;
            
            // 適用情報を記録
            this.appliedFallbacks.set(element, {
                language: language,
                originalFont: originalFont,
                fallbackChain: fallbackChain,
                appliedAt: Date.now(),
                fallbackUsed: fontFamily,
                detectionMethod: 'manual'
            });

            if (this.config.development?.verboseLogging) {
                console.log(`[FontFallbackHandler] Applied fallback for ${language}: ${fontFamily}`);
            }

            return true;

        } catch (error) {
            console.error(`[FontFallbackHandler] Failed to apply fallback to element:`, error);
            return false;
        }
    }

    /**
     * セレクターにマッチする要素群にフォールバックを適用
     */
    applyFallbackToElements(selector: string, language: string, originalFont: string | null = null): number {
        try {
            const elements = document.querySelectorAll(selector);
            let appliedCount = 0;

            elements.forEach(element => {
                if (this.applyFallback(element as HTMLElement, language, originalFont)) {
                    appliedCount++;
                }
            });

            if (this.config.development?.verboseLogging) {
                console.log(`[FontFallbackHandler] Applied fallback to ${appliedCount}/${elements.length} elements`);
            }

            return appliedCount;

        } catch (error) {
            console.error(`[FontFallbackHandler] Failed to apply fallback to elements with selector "${selector}":`, error);
            return 0;
        }
    }

    /**
     * 言語用のシステムフォントを取得
     */
    getSystemFontForLanguage(language: string): string {
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

    /**
     * 言語に最適なフォントを取得
     */
    getBestFontForLanguage(language: string, preferredFonts: string[] = []): string {
        // 優先フォントから利用可能なものを探す
        const availablePreferred = preferredFonts.filter(font => this.systemFonts.has(font));
        if (availablePreferred.length > 0) {
            return availablePreferred[0];
        }

        // システムフォントから最適なものを取得
        return this.getSystemFontForLanguage(language);
    }

    /**
     * フォントスタックを検証し、利用可能なフォントのみに修正
     */
    validateFontStack(fontStack: string, language: string): string {
        try {
            const fonts = fontStack.split(',').map(f => f.trim().replace(/['"]/g, ''));
            const validFonts: string[] = [];

            fonts.forEach(font => {
                if (font === 'sans-serif' || font === 'serif' || font === 'monospace') {
                    validFonts.push(font);
                } else if (this.systemFonts.has(font)) {
                    validFonts.push(font);
                }
            });

            // 有効なフォントがない場合はフォールバックを追加
            if (validFonts.length === 0) {
                const fallback = this.getSystemFontForLanguage(language);
                validFonts.push(fallback);
            }

            return validFonts.join(', ');

        } catch (error) {
            console.warn(`[FontFallbackHandler] Font stack validation failed:`, error);
            return this.getSystemFontForLanguage(language);
        }
    }

    /**
     * フォントの詳細な可用性を取得
     */
    getFontAvailabilityDetails(fonts: string[]): FontAvailabilityResult[] {
        return fonts.map(font => ({
            font: font,
            available: this.isFontAvailable(font),
            detectionMethod: 'canvas',
            confidence: this.systemFonts.has(font) ? 1.0 : 0.0
        }));
    }

    /**
     * 要素のフォールバック情報を取得
     */
    getFallbackInfo(element: HTMLElement): FallbackInfo | null {
        return this.appliedFallbacks.get(element) || null;
    }

    /**
     * フォールバック履歴をクリア
     */
    clearFallbackHistory(): void {
        this.appliedFallbacks.clear();
        
        if (this.config.development?.verboseLogging) {
            console.log('[FontFallbackHandler] Fallback history cleared');
        }
    }

    /**
     * 統計情報を取得
     */
    getStats(): FallbackStats {
        const stats: FallbackStats = {
            totalApplied: this.appliedFallbacks.size,
            byLanguage: {},
            systemFontsCount: this.systemFonts.size,
            availableSystemFonts: Array.from(this.systemFonts),
            lastRefreshed: Date.now(),
            detectionTime: 0
        };

        // 言語別統計を計算
        for (const [element, info] of this.appliedFallbacks.entries()) {
            const lang = info.language;
            if (!stats.byLanguage[lang]) {
                stats.byLanguage[lang] = 0;
            }
            stats.byLanguage[lang]++;
        }

        return stats;
    }

    /**
     * システムフォントを再検出
     */
    refreshSystemFonts(): number {
        const detectionStart = performance.now();
        this.systemFonts = this.detectSystemFonts();
        const detectionTime = performance.now() - detectionStart;

        // キャッシュをクリア
        this.fontDetectionCache.clear();

        if (this.config.development?.verboseLogging) {
            console.log(`[FontFallbackHandler] Refreshed system fonts in ${detectionTime.toFixed(2)}ms:`, Array.from(this.systemFonts));
        }
        
        return this.systemFonts.size;
    }

    /**
     * カスタムフォールバックチェーンを追加
     */
    addCustomFallbackChain(language: string, fallbackChain: string[]): void {
        this.fallbackChains[language] = fallbackChain;
        
        if (this.config.development?.verboseLogging) {
            console.log(`[FontFallbackHandler] Added custom fallback chain for ${language}:`, fallbackChain);
        }
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<FontFallbackConfig>): void {
        this.config = { ...this.config, ...config };
        
        if (config.customFallbacks) {
            this.fallbackChains = { ...this.fallbackChains, ...config.customFallbacks };
        }

        console.log('[FontFallbackHandler] Configuration updated');
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): {
        config: FontFallbackConfig;
        fallbackChains: Record<string, string[]>;
        systemFonts: string[];
        appliedFallbacksCount: number;
        cacheSize: number;
        stats: FallbackStats;
    } {
        return {
            config: this.config,
            fallbackChains: this.fallbackChains,
            systemFonts: Array.from(this.systemFonts),
            appliedFallbacksCount: this.appliedFallbacks.size,
            cacheSize: this.fontDetectionCache.size,
            stats: this.getStats()
        };
    }
}

// シングルトンインスタンス
let fontFallbackHandlerInstance: FontFallbackHandler | null = null;

/**
 * FontFallbackHandlerのシングルトンインスタンスを取得
 */
export function getFontFallbackHandler(): FontFallbackHandler {
    if (!fontFallbackHandlerInstance) {
        fontFallbackHandlerInstance = new FontFallbackHandler();
    }
    return fontFallbackHandlerInstance;
}