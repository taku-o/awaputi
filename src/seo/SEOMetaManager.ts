/**
 * SEOメタタグ管理クラス
 * 
 * 動的なメタタグ管理と多言語対応を提供
 */
import { SEOConfig, getBaseUrl, getLocalizedUrl, getSocialImageUrl, LanguageCode } from './SEOConfig';
import { seoLogger } from './SEOLogger';
import { seoErrorHandler } from './SEOErrorHandler';
import { 
    createMetaTag, 
    sanitizeMetaContent, 
    normalizeLanguageCode,
    truncateText,
    normalizeUrl,
    debounce,
    measurePerformance
} from './SEOUtils';

// メタデータコンテキストインターフェース
interface MetadataContext {
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
    keywords?: string;
    additionalKeywords?: string[];
    pageKey?: string;
    pageType?: string;
    type?: string;
    path?: string;
    image?: string;
    imageVariant?: 'default' | 'landscape' | 'portrait' | 'summary' | 'summaryLarge';
    twitterImage?: string;
    includeTagline?: boolean;
    extended?: boolean;
    gameState?: GameState;
    forceRefresh?: boolean;
    language?: string;
}

// ゲーム状態インターフェース
interface GameState {
    scene?: string;
    score?: number;
    highScore?: number;
    level?: number;
    playTime?: number;
    bubblesPopped?: number;
    combo?: number;
    achievement?: string;
    totalPlays?: number;
}

// 動的コンテンツインターフェース
interface DynamicContent {
    gameState?: string;
    currentScore?: number;
    level?: number;
    playingTime?: number;
    bubblesPopped?: number;
}

// メタデータインターフェース
interface Metadata {
    language: LanguageCode;
    url: string;
    timestamp: number;
    title: string;
    description: string;
    keywords: string;
    image: string;
    author: string;
    siteName: string;
    type: string;
    twitterImage?: string;
    path?: string;
}

// ローカライズされたメタデータインターフェース
interface LocalizedMetadata {
    language: string;
    title: string;
    description: string;
    keywords: string;
    siteName: string;
    locale: string;
    direction: string;
    charset: string;
}

// LocalizationManager インターフェース
interface LocalizationManager {
    getCurrentLanguage(): string;
    addLanguageChangeListener(callback: (lang: string) => void): void;
    t(key: string, defaultValue?: string): string;
    get(key: string, params?: Record<string, any>): string;
    getTextDirection?(): string;
}

// GameConfig インターフェース
interface GameConfig {
    [key: string]: any;
}

// 検証レポートインターフェース
interface ValidationReport {
    timestamp: string;
    issues: string[];
    warnings: string[];
    metadata: Record<string, string>;
    isValid: boolean;
}

// 動的メタハンドラー型
type DynamicMetaHandler = (gameState: GameState) => Promise<string | null>;

export class SEOMetaManager {
    private localizationManager: LocalizationManager | null;
    private gameConfig: GameConfig | null;
    private baseUrl: string;
    private currentLang: LanguageCode;
    private metaCache: Map<string, string>;
    private dynamicMetaHandlers: Map<string, DynamicMetaHandler>;
    private initialized: boolean;
    private debouncedUpdate: (context: MetadataContext) => void;
    private currentLanguage?: string;
    
    constructor(localizationManager: LocalizationManager | null = null, gameConfig: GameConfig | null = null) {
        this.localizationManager = localizationManager;
        this.gameConfig = gameConfig;
        this.baseUrl = getBaseUrl();
        this.currentLang = SEOConfig.defaultLanguage;
        this.metaCache = new Map();
        this.dynamicMetaHandlers = new Map();
        this.initialized = false;
        
        // デバウンスされたメタタグ更新関数
        this.debouncedUpdate = debounce(this._performUpdate.bind(this), 300);
        
        this._initialize();
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void {
        try {
            // 既存のメタタグを収集
            this._collectExistingMetaTags();
            
            // 動的メタハンドラーの登録
            this._registerDynamicHandlers();
            
            // 言語変更リスナーの設定
            if (this.localizationManager) {
                this.localizationManager.addLanguageChangeListener((newLang: string) => {
                    this.currentLang = normalizeLanguageCode(newLang);
                    this.updateMetaTags({ language: newLang });
                });
                
                this.currentLang = normalizeLanguageCode(
                    this.localizationManager.getCurrentLanguage()
                );
            }
            
            this.initialized = true;
            seoLogger.info('SEOMetaManager initialized successfully');
        } catch (error) {
            seoErrorHandler.handle(error as Error, 'metaManagerInit');
        }
    }
    
    /**
     * メタタグの更新
     */
    async updateMetaTags(context: MetadataContext = {}): Promise<void> {
        if (!this.initialized) {
            seoLogger.warn('SEOMetaManager not initialized');
            return;
        }
        
        // デバウンスされた更新を実行
        this.debouncedUpdate(context);
    }

    /**
     * ゲーム状態に基づいた動的コンテンツでメタタグを更新
     */
    async updateDynamicContent(dynamicContent: DynamicContent): Promise<void> {
        try {
            if (!this.initialized) {
                seoLogger.warn('SEOMetaManager not initialized');
                return;
            }

            // ゲーム状態をコンテキストに統合
            const enhancedContext: MetadataContext = {
                ...dynamicContent,
                gameState: {
                    scene: dynamicContent.gameState || 'menu',
                    score: dynamicContent.currentScore || 0,
                    level: dynamicContent.level || 1,
                    playTime: dynamicContent.playingTime || 0,
                    bubblesPopped: dynamicContent.bubblesPopped || 0
                }
            };

            // 動的メタデータ生成
            const metadata = await this._generateDynamicMetadata(enhancedContext);

            // メタタグ更新
            await this.updateMetaTags(metadata);

            // ソーシャルメディア用の画像URL更新
            if (dynamicContent.currentScore && dynamicContent.currentScore > 0) {
                await this._updateSocialImageForScore(dynamicContent.currentScore);
            }

            seoLogger.info('Dynamic content updated successfully', enhancedContext);
        } catch (error) {
            seoErrorHandler.handle(error as Error, 'updateDynamicContent', { dynamicContent });
        }
    }

    /**
     * ゲーム状態に基づいた動的メタデータ生成
     */
    private async _generateDynamicMetadata(context: MetadataContext): Promise<MetadataContext> {
        const gameSession = context.gameState!;
        
        // 動的タイトル生成
        let dynamicTitle = await this._getLocalizedTitle();
        if (gameSession.score && gameSession.score > 0) {
            const scoreText = this.localizationManager ? 
                this.localizationManager.get('seo.titleWithScore', { score: gameSession.score.toLocaleString() }) :
                `スコア ${gameSession.score.toLocaleString()}`;
            dynamicTitle = `${dynamicTitle} - ${scoreText}`;
        }

        // 動的説明文生成
        let dynamicDescription = await this._getLocalizedDescription(context);
        if (gameSession.scene === 'game' && gameSession.score && gameSession.score > 0) {
            const gameplayText = this.localizationManager ?
                this.localizationManager.get('seo.gameplayDescription', {
                    score: gameSession.score.toLocaleString(),
                    bubbles: gameSession.bubblesPopped?.toLocaleString() || '0',
                    level: gameSession.level || 1
                }) :
                `現在スコア: ${gameSession.score.toLocaleString()}、レベル ${gameSession.level || 1}`;
            dynamicDescription = `${dynamicDescription} ${gameplayText}`;
        }

        return {
            title: dynamicTitle,
            description: dynamicDescription,
            gameState: gameSession,
            path: this._generateUrl({})
        };
    }

    /**
     * スコアに基づいたソーシャル画像の更新
     */
    private async _updateSocialImageForScore(score: number): Promise<void> {
        try {
            // スコアランクに基づいて画像を選択
            let imageUrl = '/assets/social/og-image.png'; // デフォルト
            
            if (score >= 100000) {
                imageUrl = '/assets/social/og-image-champion.png';
            } else if (score >= 50000) {
                imageUrl = '/assets/social/og-image-expert.png';
            } else if (score >= 10000) {
                imageUrl = '/assets/social/og-image-pro.png';
            }

            // Open Graph画像の更新
            this._updateMetaTag('property', 'og:image', imageUrl);
            this._updateMetaTag('name', 'twitter:image', imageUrl);

            seoLogger.debug('Social image updated for score', { score, imageUrl });
        } catch (error) {
            seoErrorHandler.handle(error as Error, '_updateSocialImageForScore', { score });
        }
    }

    /**
     * 言語変更時の処理
     */
    updateLanguage(newLanguage: string): void {
        try {
            this.currentLanguage = newLanguage;
            
            // キャッシュをクリア
            this.metaCache.clear();
            
            // メタタグを再生成・更新
            this.updateMetaTags({ forceRefresh: true });
            
            seoLogger.info(`SEOMetaManager language updated to ${newLanguage}`);
        } catch (error) {
            seoErrorHandler.handle(error as Error, 'updateLanguage', { newLanguage });
        }
    }
    
    /**
     * LocalizationManagerとの統合強化
     */
    async getLocalizedMetadata(context: MetadataContext = {}): Promise<LocalizedMetadata> {
        try {
            if (!this.localizationManager) {
                return this._generateFallbackMetadata(context);
            }
            
            const currentLang = this.localizationManager.getCurrentLanguage();
            
            return {
                language: currentLang,
                title: await this._getLocalizedTitle(context),
                description: await this._getLocalizedDescription(context),
                keywords: await this._getLocalizedKeywords(context),
                siteName: await this._getLocalizedSiteName(),
                locale: this._getOGLocale(),
                direction: this._getTextDirection(),
                charset: 'UTF-8'
            };
        } catch (error) {
            return seoErrorHandler.handle(error as Error, 'getLocalizedMetadata', context);
        }
    }
    
    /**
     * ローカライズされたタイトル生成
     */
    private async _getLocalizedTitle(context: MetadataContext = {}): Promise<string> {
        if (!this.localizationManager) {
            return context.title || 'BubblePop - 泡割りゲーム';
        }
        
        // コンテキスト固有のタイトルキー
        if (context.titleKey) {
            return this.localizationManager.t(context.titleKey);
        }
        
        // ページタイプ別のタイトル
        if (context.pageType) {
            const titleKey = `seo.titles.${context.pageType}`;
            const pageTitle = this.localizationManager.t(titleKey);
            if (pageTitle !== titleKey) { // 翻訳が存在する場合
                return pageTitle;
            }
        }
        
        // デフォルトタイトル
        const baseTitle = this.localizationManager.t('seo.title') || 'BubblePop';
        const subtitle = this.localizationManager.t('seo.subtitle') || '泡割りゲーム';
        
        return `${baseTitle} - ${subtitle}`;
    }
    
    /**
     * ローカライズされた説明文生成
     */
    private async _getLocalizedDescription(context: MetadataContext = {}): Promise<string> {
        if (!this.localizationManager) {
            return context.description || 'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
        }
        
        // コンテキスト固有の説明キー
        if (context.descriptionKey) {
            return this.localizationManager.t(context.descriptionKey);
        }
        
        // ページタイプ別の説明
        if (context.pageType) {
            const descKey = `seo.descriptions.${context.pageType}`;
            const pageDesc = this.localizationManager.t(descKey);
            if (pageDesc !== descKey) { // 翻訳が存在する場合
                return pageDesc;
            }
        }
        
        // ゲーム状態による動的説明
        if (context.gameState) {
            return await this._enhanceDescriptionWithGameState(context.gameState);
        }
        
        // デフォルト説明
        return this.localizationManager.t('seo.description') || 
            'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
    }
    
    /**
     * ローカライズされたキーワード生成
     */
    private async _getLocalizedKeywords(context: MetadataContext): Promise<string> {
        if (!this.localizationManager) {
            return context.keywords || 'バブルポップ,ゲーム,HTML5,ブラウザゲーム,無料';
        }
        
        const lang = this.localizationManager.getCurrentLanguage();
        
        // 基本キーワード
        const baseKeywords = this.localizationManager.t('seo.keywords') || '';
        
        // 言語固有のキーワード
        const langKeywords = this.localizationManager.t(`seo.keywords.${lang}`) || '';
        
        // ページタイプ固有のキーワード
        let pageKeywords = '';
        if (context.pageType) {
            pageKeywords = this.localizationManager.t(`seo.keywords.${context.pageType}`) || '';
        }
        
        // キーワードの結合
        const keywordParts = [baseKeywords, langKeywords, pageKeywords].filter(k => k);
        return keywordParts.join(',');
    }
    
    /**
     * テキスト方向の取得
     */
    private _getTextDirection(): string {
        if (!this.localizationManager) {
            return 'ltr';
        }
        
        return this.localizationManager.getTextDirection ? 
            this.localizationManager.getTextDirection() : 'ltr';
    }
    
    /**
     * フォールバックメタデータの生成
     */
    private _generateFallbackMetadata(context: MetadataContext): LocalizedMetadata {
        return {
            language: 'ja',
            title: context.title || 'BubblePop - 泡割りゲーム',
            description: context.description || 'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！',
            keywords: context.keywords || 'バブルポップ,ゲーム,HTML5,ブラウザゲーム,無料',
            siteName: 'BubblePop',
            locale: 'ja_JP',
            direction: 'ltr',
            charset: 'UTF-8'
        };
    }
    
    /**
     * 実際のメタタグ更新処理
     */
    private async _performUpdate(context: MetadataContext): Promise<void> {
        try {
            const startTime = performance.now();
            
            // メタデータの生成
            const metadata = await this._generateMetadata(context);
            
            // 基本メタタグの更新
            this._updateBasicMetaTags(metadata);
            
            // Open Graphタグの更新
            this._updateOpenGraphTags(metadata);
            
            // Twitter Cardタグの更新
            this._updateTwitterCardTags(metadata);
            
            // Canonical URLの更新
            this._updateCanonicalUrl(metadata);
            
            // hreflangタグの更新
            this._updateHreflangTags(metadata);
            
            // キャッシュの更新
            this._updateCache(metadata);
            
            const duration = performance.now() - startTime;
            seoLogger.performance('metaTagUpdate', duration, {
                tagsUpdated: Object.keys(metadata).length
            });
            
        } catch (error) {
            seoErrorHandler.handle(error as Error, 'metaTagUpdate', context);
        }
    }
    
    /**
     * メタデータの生成
     */
    private async _generateMetadata(context: MetadataContext): Promise<Metadata> {
        const metadata: Metadata = {
            language: this.currentLang,
            url: this._generateUrl(context),
            timestamp: Date.now(),
            title: '',
            description: '',
            keywords: '',
            image: '',
            author: SEOConfig.metadata.author,
            siteName: await this._getLocalizedSiteName(),
            type: context.type || 'website',
            path: context.path
        };
        
        // タイトルの生成
        metadata.title = await this._generateTitle(context);
        
        // 説明文の生成
        metadata.description = await this._generateDescription(context);
        
        // キーワードの生成
        metadata.keywords = await this._generateKeywords(context);
        
        // ソーシャル画像の選択
        metadata.image = await this._selectSocialImage(context);
        
        return metadata;
    }
    
    /**
     * タイトルの生成
     */
    private async _generateTitle(context: MetadataContext): Promise<string> {
        let title = '';
        
        if (context.title) {
            title = context.title;
        } else if (context.pageKey && this.localizationManager) {
            title = this.localizationManager.t(`seo.titles.${context.pageKey}`);
        } else {
            title = await this._getLocalizedSiteName();
        }
        
        // タグラインの追加
        if (context.includeTagline !== false) {
            const tagline = await this._getTagline();
            if (tagline) {
                title = `${title} - ${tagline}`;
            }
        }
        
        // 長さ制限（60文字推奨）
        return truncateText(title, 60);
    }
    
    /**
     * 説明文の生成
     */
    private async _generateDescription(context: MetadataContext): Promise<string> {
        let description = '';
        
        if (context.description) {
            description = context.description;
        } else if (context.pageKey && this.localizationManager) {
            description = this.localizationManager.t(`seo.descriptions.${context.pageKey}`);
        } else {
            const descKey = context.extended ? 'extendedDescription' : 'defaultDescription';
            description = SEOConfig.metadata[descKey][this.currentLang] || 
                         SEOConfig.metadata[descKey].ja;
        }
        
        // ゲーム状態の情報を追加
        if (context.gameState) {
            description = await this._enhanceDescriptionWithGameState(context.gameState);
        }
        
        // 長さ制限（155文字推奨）
        return truncateText(description, 155);
    }
    
    /**
     * キーワードの生成
     */
    private async _generateKeywords(context: MetadataContext): Promise<string> {
        const baseKeywords = SEOConfig.metadata.keywords[this.currentLang] || 
                           SEOConfig.metadata.keywords.ja;
        
        if (context.additionalKeywords) {
            return `${baseKeywords},${context.additionalKeywords.join(',')}`;
        }
        
        return baseKeywords;
    }
    
    /**
     * ソーシャル画像の選択
     */
    private async _selectSocialImage(context: MetadataContext): Promise<string> {
        // カスタム画像が指定されている場合
        if (context.image) {
            return normalizeUrl(context.image);
        }
        
        // ゲーム状態に基づく動的画像生成
        if (context.gameState && this.dynamicMetaHandlers.has('socialImage')) {
            const handler = this.dynamicMetaHandlers.get('socialImage')!;
            const dynamicImage = await handler(context.gameState);
            if (dynamicImage) {
                return dynamicImage;
            }
        }
        
        // デフォルト画像の選択
        const variant = context.imageVariant || 'default';
        return getSocialImageUrl('openGraph', variant);
    }
    
    /**
     * 基本メタタグの更新
     */
    private _updateBasicMetaTags(metadata: Metadata): void {
        // タイトル
        document.title = metadata.title || 'BubblePop - 泡を割って高スコアを目指そう！';
        
        // 説明
        this._updateMetaTag('name', 'description', metadata.description);
        
        // キーワード
        this._updateMetaTag('name', 'keywords', metadata.keywords);
        
        // 作者
        this._updateMetaTag('name', 'author', metadata.author);
        
        // 言語
        document.documentElement.lang = metadata.language;
        this._updateMetaTag('name', 'language', metadata.language);
    }
    
    /**
     * Open Graphタグの更新
     */
    private _updateOpenGraphTags(metadata: Metadata): void {
        const ogTags: Record<string, string | string[] | number> = {
            'og:title': metadata.title,
            'og:description': metadata.description,
            'og:image': metadata.image,
            'og:image:alt': `${metadata.siteName} - ${metadata.title}`,
            'og:url': metadata.url,
            'og:type': metadata.type,
            'og:site_name': metadata.siteName,
            'og:locale': this._getOGLocale()
        };
        
        // 画像のサイズ情報
        if (metadata.image.includes('og-image')) {
            ogTags['og:image:width'] = SEOConfig.socialImages.openGraph.width;
            ogTags['og:image:height'] = SEOConfig.socialImages.openGraph.height;
        }
        
        // 代替言語
        const altLocales = SEOConfig.supportedLanguages
            .filter(lang => lang !== this.currentLang)
            .map(lang => this._getOGLocale(lang));
        
        if (altLocales.length > 0) {
            ogTags['og:locale:alternate'] = altLocales;
        }
        
        // タグの更新
        Object.entries(ogTags).forEach(([property, content]) => {
            if (Array.isArray(content)) {
                // 複数値の場合は既存を削除して追加
                this._removeMetaTags(property);
                content.forEach(value => {
                    this._addMetaTag(property, String(value));
                });
            } else {
                this._updateMetaTag('property', property, String(content));
            }
        });
    }
    
    /**
     * Twitter Cardタグの更新
     */
    private _updateTwitterCardTags(metadata: Metadata): void {
        const twitterTags: Record<string, string> = {
            'twitter:card': 'summary_large_image',
            'twitter:title': truncateText(metadata.title, 70), // Twitter制限
            'twitter:description': truncateText(metadata.description, 200), // Twitter制限
            'twitter:image': this._getTwitterImage(metadata),
            'twitter:image:alt': `${metadata.siteName} - ${metadata.title}`
        };
        
        // サイトのTwitterアカウントがある場合
        if ((SEOConfig as any).socialAccounts?.twitter) {
            twitterTags['twitter:site'] = (SEOConfig as any).socialAccounts.twitter;
        }
        
        // タグの更新
        Object.entries(twitterTags).forEach(([property, content]) => {
            this._updateMetaTag('name', property, content);
        });
    }
    
    /**
     * Canonical URLの更新
     */
    private _updateCanonicalUrl(metadata: Metadata): void {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        
        (canonical as HTMLLinkElement).href = normalizeUrl(metadata.url);
    }
    
    /**
     * hreflangタグの更新
     */
    private _updateHreflangTags(metadata: Metadata): void {
        // 既存のhreflangタグを削除
        const existing = document.querySelectorAll('link[rel="alternate"][hreflang]');
        existing.forEach(tag => tag.remove());
        
        // 各言語のhreflangタグを追加
        SEOConfig.supportedLanguages.forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = getLocalizedUrl(lang, metadata.path || '');
            document.head.appendChild(link);
        });
        
        // x-defaultタグ
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = getLocalizedUrl(SEOConfig.defaultLanguage, metadata.path || '');
        document.head.appendChild(defaultLink);
    }
    
    /**
     * メタタグの更新
     */
    private _updateMetaTag(attributeName: 'name' | 'property', property: string, content: string): void {
        if (!content) return;
        
        const selector = `meta[${attributeName}="${property}"]`;
        
        let meta = document.querySelector(selector);
        
        if (!meta) {
            meta = createMetaTag(property, content);
            if (meta) {
                document.head.appendChild(meta);
            }
        } else {
            meta.setAttribute('content', sanitizeMetaContent(content));
        }
    }
    
    /**
     * メタタグの追加
     */
    private _addMetaTag(property: string, content: string): void {
        const meta = createMetaTag(property, content);
        if (meta) {
            document.head.appendChild(meta);
        }
    }
    
    /**
     * メタタグの削除
     */
    private _removeMetaTags(property: string): void {
        const selector = property.startsWith('og:') || property.startsWith('article:')
            ? `meta[property="${property}"]`
            : `meta[name="${property}"]`;
        
        const tags = document.querySelectorAll(selector);
        tags.forEach(tag => tag.remove());
    }
    
    /**
     * 既存メタタグの収集
     */
    private _collectExistingMetaTags(): void {
        const metaTags = document.querySelectorAll('meta[name], meta[property]');
        
        metaTags.forEach(tag => {
            const property = tag.getAttribute('property') || tag.getAttribute('name');
            const content = tag.getAttribute('content');
            
            if (property && content) {
                this.metaCache.set(property, content);
            }
        });
        
        seoLogger.info('Collected existing meta tags', {
            count: this.metaCache.size
        });
    }
    
    /**
     * 動的メタハンドラーの登録
     */
    private _registerDynamicHandlers(): void {
        // ソーシャル画像の動的生成ハンドラー
        this.registerDynamicHandler('socialImage', async (gameState: GameState) => {
            if (!gameState || !gameState.score) return null;
            
            // スコアに基づく画像選択のロジック
            if (gameState.score > 100000) {
                return getSocialImageUrl('openGraph', 'default');
            } else if (gameState.combo && gameState.combo > 50) {
                return getSocialImageUrl('openGraph', 'default');
            }
            
            return null;
        });
        
        // タイトルの動的生成ハンドラー
        this.registerDynamicHandler('title', async (gameState: GameState) => {
            if (!gameState) return null;
            
            if (gameState.achievement) {
                return `${gameState.achievement} 達成！`;
            }
            
            return null;
        });
    }
    
    /**
     * 動的ハンドラーの登録
     */
    registerDynamicHandler(type: string, handler: DynamicMetaHandler): void {
        this.dynamicMetaHandlers.set(type, handler);
    }
    
    /**
     * ローカライズされたサイト名の取得
     */
    private async _getLocalizedSiteName(): Promise<string> {
        if (this.localizationManager) {
            return this.localizationManager.t('seo.siteName', SEOConfig.siteName);
        }
        
        return this.currentLang === 'ja' ? SEOConfig.siteNameJa : SEOConfig.siteName;
    }
    
    /**
     * タグラインの取得
     */
    private async _getTagline(): Promise<string> {
        if (this.localizationManager) {
            return this.localizationManager.t('seo.tagline');
        }
        
        const taglines: Record<string, string> = {
            ja: '泡を割って高スコアを目指そう！',
            en: 'Pop bubbles and aim for high scores!'
        };
        
        return taglines[this.currentLang] || taglines.ja;
    }
    
    /**
     * ゲーム状態で説明文を強化
     */
    private async _enhanceDescriptionWithGameState(gameState: GameState): Promise<string> {
        let description = await this._getLocalizedDescription({});
        const additions: string[] = [];
        
        if (gameState.highScore) {
            additions.push(`最高スコア: ${gameState.highScore.toLocaleString()}`);
        }
        
        if (gameState.totalPlays) {
            additions.push(`${gameState.totalPlays}回プレイ済み`);
        }
        
        if (additions.length > 0) {
            return `${description} ${additions.join('、')}`;
        }
        
        return description;
    }
    
    /**
     * URLの生成
     */
    private _generateUrl(context: MetadataContext = {}): string {
        const path = context.path || (typeof window !== 'undefined' ? window.location.pathname : '/');
        return getLocalizedUrl(this.currentLang, path);
    }
    
    /**
     * Open Graphロケールの取得
     */
    private _getOGLocale(lang: LanguageCode = this.currentLang): string {
        const localeMap: Record<LanguageCode, string> = {
            'ja': 'ja_JP',
            'en': 'en_US',
            'zh-CN': 'zh_CN',
            'zh-TW': 'zh_TW',
            'ko': 'ko_KR'
        };
        
        return localeMap[lang] || 'ja_JP';
    }
    
    /**
     * Twitter用画像の取得
     */
    private _getTwitterImage(metadata: Metadata): string {
        // Twitter専用画像がある場合
        if (metadata.twitterImage) {
            return metadata.twitterImage;
        }
        
        // Twitter Card用の画像を使用
        const twitterImageUrl = getSocialImageUrl('twitter', 'summaryLarge');
        
        // Open Graph画像をフォールバック
        return twitterImageUrl || metadata.image;
    }
    
    /**
     * キャッシュの更新
     */
    private _updateCache(metadata: Metadata): void {
        Object.entries(metadata).forEach(([key, value]) => {
            if (typeof value === 'string') {
                this.metaCache.set(key, value);
            }
        });
    }
    
    /**
     * 検証レポートの生成
     */
    generateValidationReport(): ValidationReport {
        const report: ValidationReport = {
            timestamp: new Date().toISOString(),
            issues: [],
            warnings: [],
            metadata: {},
            isValid: false
        };
        
        // 必須タグのチェック
        const requiredTags = [
            'description',
            'og:title',
            'og:description',
            'og:image',
            'twitter:card'
        ];
        
        requiredTags.forEach(tag => {
            const value = this.metaCache.get(tag);
            if (!value) {
                report.issues.push(`Missing required tag: ${tag}`);
            } else {
                report.metadata[tag] = value;
            }
        });
        
        // 長さチェック
        const title = document.title;
        if (title.length > 60) {
            report.warnings.push(`Title too long: ${title.length} characters (recommended: 60)`);
        }
        
        const description = this.metaCache.get('description');
        if (description && description.length > 155) {
            report.warnings.push(`Description too long: ${description.length} characters (recommended: 155)`);
        }
        
        report.isValid = report.issues.length === 0;
        
        seoLogger.validation('metaTags', report.isValid, report.issues);
        
        return report;
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void {
        this.metaCache.clear();
        this.dynamicMetaHandlers.clear();
        
        if (this.debouncedUpdate) {
            (this.debouncedUpdate as any).cancel?.();
        }
        
        seoLogger.info('SEOMetaManager cleaned up');
    }
}