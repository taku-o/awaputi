/**
 * サイトマップ生成クラス
 * 
 * 動的なsitemap.xml生成機能を提供
 */
import { SEOConfig, getBaseUrl, getLocalizedUrl, LanguageCode } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';
import { normalizeUrl, measurePerformance } from './SEOUtils.js';

// URL情報インターフェース
interface UrlData {
    loc: string;
    priority: number;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    lastmod: string;
    hreflang?: string;
}

// 動的URL生成関数型
type DynamicUrlGenerator = (options?: any) => Promise<UrlData[]>;

// サイトマップ生成オプションインターフェース
interface SitemapGenerationOptions {
    forceRegenerate?: boolean;
    includeAssets?: boolean;
    includeDynamic?: boolean;
    [key: string]: any;
}

// サイトマップサマリーインターフェース
interface SitemapSummary {
    totalUrls: number;
    lastGenerated: Date | null;
    urlsByPriority: Record<string, number>;
    urlsByChangeFreq: Record<string, number>;
    supportedLanguages: number;
    dynamicGenerators: number;
}

// サイトマップ検証結果インターフェース
interface SitemapValidationResult {
    isValid: boolean;
    issues: string[];
    warnings: string[];
    urlCount: number;
    duplicateCount: number;
}

// LocalizationManager インターフェース
interface LocalizationManager {
    getCurrentLanguage(): string;
    t(key: string, defaultValue?: string): string;
}

// File System Access API拡張インターフェース
interface ExtendedWindow extends Window {
    showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{
            description: string;
            accept: Record<string, string[]>;
        }>;
    }) => Promise<FileSystemFileHandle>;
}

// FileSystemFileHandle インターフェース
interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

// FileSystemWritableFileStream インターフェース
interface FileSystemWritableFileStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
}

export class SitemapGenerator {
    private localizationManager: LocalizationManager | null;
    private baseUrl: string;
    private urls: Map<string, UrlData>;
    private staticUrls: UrlData[];
    private dynamicUrlGenerators: Map<string, DynamicUrlGenerator>;
    private lastGenerated: Date | null;
    private hasStatsPages: boolean = false;
    
    constructor(localizationManager: LocalizationManager | null = null) {
        this.localizationManager = localizationManager;
        this.baseUrl = getBaseUrl();
        this.urls = new Map();
        this.staticUrls = [];
        this.dynamicUrlGenerators = new Map();
        this.lastGenerated = null;
        this._initialize();
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void {
        try {
            // 静的URLの登録
            this._registerStaticUrls();
            // 動的URL生成関数の登録
            this._registerDynamicGenerators();
            seoLogger.info('SitemapGenerator initialized successfully');
        } catch (error) {
            seoErrorHandler.handle(error as Error, 'sitemapGeneratorInit');
        }
    }
    
    /**
     * サイトマップの生成
     */
    async generateSitemap(options: SitemapGenerationOptions = {}): Promise<string> {
        try {
            const startTime = performance.now();
            
            // URLセットのクリア
            this.urls.clear();
            
            // 静的URLの追加
            await this._addStaticUrls();
            
            // 動的URLの追加
            await this._addDynamicUrls(options);
            
            // 多言語URLの追加
            await this._addMultilingualUrls();
            
            // XMLの生成
            const xml = this._generateXML();
            
            // 生成時刻の記録
            this.lastGenerated = new Date();
            
            const duration = performance.now() - startTime;
            seoLogger.performance('sitemapGeneration', duration, {
                urlCount: this.urls.size
            });
            
            return xml;
        } catch (error) {
            return seoErrorHandler.handle(error as Error, 'sitemapGeneration', options);
        }
    }
    
    /**
     * サイトマップファイルの書き込み
     */
    async writeSitemapFile(options: SitemapGenerationOptions = {}): Promise<void> {
        try {
            const xml = await this.generateSitemap(options);
            const extWindow = window as ExtendedWindow;
            
            // ファイルシステムAPIが利用可能かチェック
            if (typeof window !== 'undefined' && extWindow.showSaveFilePicker) {
                // File System Access API(Chrome等)
                const fileHandle = await extWindow.showSaveFilePicker({
                    suggestedName: 'sitemap.xml',
                    types: [{
                        description: 'XML files',
                        accept: { 'application/xml': ['.xml'] }
                    }]
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(xml);
                await writable.close();
                
                seoLogger.info('Sitemap file saved successfully');
            } else {
                // フォールバック: データURLでダウンロード
                const blob = new Blob([xml], { type: 'application/xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sitemap.xml';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                seoLogger.info('Sitemap file downloaded');
            }
        } catch (error) {
            seoErrorHandler.handle(error as Error, 'sitemapFileWrite', options);
        }
    }
    
    /**
     * 静的URLの登録
     */
    private _registerStaticUrls(): void {
        // 基本的なページ
        this.staticUrls = [
            {
                loc: '/',
                priority: SEOConfig.sitemap.priority.home,
                changefreq: SEOConfig.sitemap.changeFrequency.home,
                lastmod: new Date().toISOString().split('T')[0]
            },
            {
                loc: '/help/',
                priority: SEOConfig.sitemap.priority.help,
                changefreq: SEOConfig.sitemap.changeFrequency.help,
                lastmod: new Date().toISOString().split('T')[0]
            }
        ];
        
        // アセットページ（重要な画像など）
        const importantAssets = [
            '/assets/screenshots/game-portrait.png',
            '/assets/screenshots/game-landscape-1.png',
            '/assets/social/og-image.png',
            '/assets/icons/icon-512x512.png'
        ];
        
        importantAssets.forEach(asset => {
            this.staticUrls.push({
                loc: asset,
                priority: SEOConfig.sitemap.priority.assets,
                changefreq: SEOConfig.sitemap.changeFrequency.assets,
                lastmod: new Date().toISOString().split('T')[0]
            });
        });
    }
    
    /**
     * 動的URL生成関数の登録
     */
    private _registerDynamicGenerators(): void {
        // ヘルプページ
        this.registerDynamicGenerator('helpPages', async () => {
            const helpPages: UrlData[] = [];
            
            // 基本ヘルプページ
            const basicHelp = [
                'tutorial',
                'gameplay',
                'scoring',
                'special-bubbles',
                'achievements',
                'settings'
            ];
            
            basicHelp.forEach(page => {
                helpPages.push({
                    loc: `/help/${page}/`,
                    priority: 0.7,
                    changefreq: 'monthly',
                    lastmod: new Date().toISOString().split('T')[0]
                });
            });
            
            return helpPages;
        });
        
        // ゲーム統計ページ（将来的な実装用）
        this.registerDynamicGenerator('statsPages', async () => {
            const statsPages: UrlData[] = [];
            
            // 統計ページがある場合
            if (this.hasStatsPages) {
                statsPages.push({
                    loc: '/stats/',
                    priority: 0.6,
                    changefreq: 'weekly',
                    lastmod: new Date().toISOString().split('T')[0]
                });
            }
            
            return statsPages;
        });
    }
    
    /**
     * 動的URL生成関数の登録
     */
    registerDynamicGenerator(name: string, generator: DynamicUrlGenerator): void {
        this.dynamicUrlGenerators.set(name, generator);
    }
    
    /**
     * 静的URLの追加
     */
    private async _addStaticUrls(): Promise<void> {
        this.staticUrls.forEach(urlData => {
            const fullUrl = normalizeUrl(`${this.baseUrl}${urlData.loc}`);
            this.urls.set(fullUrl, {
                ...urlData,
                loc: fullUrl
            });
        });
    }
    
    /**
     * 動的URLの追加
     */
    private async _addDynamicUrls(options: SitemapGenerationOptions): Promise<void> {
        for (const [name, generator] of this.dynamicUrlGenerators) {
            try {
                const urls = await generator(options);
                if (Array.isArray(urls)) {
                    urls.forEach(urlData => {
                        const fullUrl = normalizeUrl(`${this.baseUrl}${urlData.loc}`);
                        this.urls.set(fullUrl, {
                            ...urlData,
                            loc: fullUrl
                        });
                    });
                }
            } catch (error) {
                seoLogger.error(`Dynamic URL generation failed for ${name}`, error as Error);
            }
        }
    }
    
    /**
     * 多言語URLの追加
     */
    private async _addMultilingualUrls(): Promise<void> {
        if (!this.localizationManager) {
            return;
        }
        
        const baseUrls = Array.from(this.urls.keys());
        
        SEOConfig.supportedLanguages.forEach(lang => {
            if (lang === SEOConfig.defaultLanguage) {
                return; // デフォルト言語は既に追加済み
            }
            
            baseUrls.forEach(baseUrl => {
                const urlData = this.urls.get(baseUrl)!;
                
                // 言語固有のURLを生成
                const path = urlData.loc.replace(this.baseUrl, '');
                const localizedUrl = getLocalizedUrl(lang, path);
                
                this.urls.set(localizedUrl, {
                    ...urlData,
                    loc: localizedUrl,
                    priority: SEOConfig.sitemap.priority.languageVariants,
                    hreflang: lang
                });
            });
        });
    }
    
    /**
     * XMLの生成
     */
    private _generateXML(): string {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
        xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
        
        // URLをソート（優先度とURLでソート）
        const sortedUrls = Array.from(this.urls.values()).sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return a.loc.localeCompare(b.loc);
        });
        
        sortedUrls.forEach(urlData => {
            xml += '  <url>\n';
            xml += `    <loc>${this._escapeXml(urlData.loc)}</loc>\n`;
            
            if (urlData.lastmod) {
                xml += `    <lastmod>${urlData.lastmod}</lastmod>\n`;
            }
            
            if (urlData.changefreq) {
                xml += `    <changefreq>${urlData.changefreq}</changefreq>\n`;
            }
            
            if (urlData.priority) {
                xml += `    <priority>${urlData.priority.toFixed(1)}</priority>\n`;
            }
            
            // hreflang代替リンク
            if (urlData.hreflang) {
                xml = this._addHreflangLinks(xml, urlData);
            }
            
            xml += '  </url>\n';
        });
        
        xml += '</urlset>\n';
        
        return xml;
    }
    
    /**
     * hreflangリンクの追加
     */
    private _addHreflangLinks(xml: string, urlData: UrlData): string {
        const path = urlData.loc.replace(this.baseUrl, '').replace(/^\/[a-z-]+/, '');
        
        SEOConfig.supportedLanguages.forEach(lang => {
            const hrefUrl = getLocalizedUrl(lang, path);
            xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${this._escapeXml(hrefUrl)}" />\n`;
        });
        
        // x-default
        const defaultUrl = getLocalizedUrl(SEOConfig.defaultLanguage, path);
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${this._escapeXml(defaultUrl)}" />\n`;
        
        return xml;
    }
    
    /**
     * XMLエスケープ
     */
    private _escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * サイトマップのサマリー取得
     */
    getSummary(): SitemapSummary {
        const urlsByPriority: Record<string, number> = {};
        const urlsByChangeFreq: Record<string, number> = {};
        
        Array.from(this.urls.values()).forEach(urlData => {
            // 優先度別
            const priority = urlData.priority?.toString() || 'undefined';
            urlsByPriority[priority] = (urlsByPriority[priority] || 0) + 1;
            
            // 更新頻度別
            const changefreq = urlData.changefreq || 'undefined';
            urlsByChangeFreq[changefreq] = (urlsByChangeFreq[changefreq] || 0) + 1;
        });
        
        return {
            totalUrls: this.urls.size,
            lastGenerated: this.lastGenerated,
            urlsByPriority,
            urlsByChangeFreq,
            supportedLanguages: SEOConfig.supportedLanguages.length,
            dynamicGenerators: this.dynamicUrlGenerators.size
        };
    }
    
    /**
     * サイトマップの検証
     */
    validateSitemap(): SitemapValidationResult {
        const issues: string[] = [];
        const warnings: string[] = [];
        
        // URL数の制限チェック（50,000URL制限）
        if (this.urls.size > 50000) {
            issues.push(`Too many URLs: ${this.urls.size} (limit: 50,000)`);
        }
        
        // 重複URLのチェック
        const urlCounts = new Map<string, number>();
        Array.from(this.urls.keys()).forEach(url => {
            urlCounts.set(url, (urlCounts.get(url) || 0) + 1);
        });
        
        const duplicates = Array.from(urlCounts.entries())
            .filter(([url, count]) => count > 1)
            .map(([url]) => url);
        
        if (duplicates.length > 0) {
            issues.push(`Duplicate URLs found: ${duplicates.length}`);
        }
        
        // 優先度の範囲チェック
        Array.from(this.urls.values()).forEach(urlData => {
            if (urlData.priority && (urlData.priority < 0 || urlData.priority > 1)) {
                warnings.push(`Invalid priority ${urlData.priority} for ${urlData.loc}`);
            }
        });
        
        // 更新頻度の有効性チェック
        const validChangeFreqs: string[] = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        Array.from(this.urls.values()).forEach(urlData => {
            if (urlData.changefreq && !validChangeFreqs.includes(urlData.changefreq)) {
                warnings.push(`Invalid changefreq ${urlData.changefreq} for ${urlData.loc}`);
            }
        });
        
        const isValid = issues.length === 0;
        
        seoLogger.validation('sitemap', isValid, issues);
        
        return {
            isValid,
            issues,
            warnings,
            urlCount: this.urls.size,
            duplicateCount: duplicates.length
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void {
        this.urls.clear();
        this.dynamicUrlGenerators.clear();
        seoLogger.info('SitemapGenerator cleaned up');
    }
}