/**
 * SEOメタタグ管理クラス
 * 
 * 動的なメタタグ管理と多言語対応を提供
 */
import { SEOConfig, getBaseUrl, getLocalizedUrl, getSocialImageUrl } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';
import { 
    createMetaTag, 
    sanitizeMetaContent, 
    normalizeLanguageCode,
    truncateText,
    normalizeUrl,
    debounce,
    measurePerformance
} from './SEOUtils.js';

export class SEOMetaManager {
    constructor(localizationManager = null, gameConfig = null) {
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
     * @private
     */
    _initialize() {
        try {
            // 既存のメタタグを収集
            this._collectExistingMetaTags();
            
            // 動的メタハンドラーの登録
            this._registerDynamicHandlers();
            
            // 言語変更リスナーの設定
            if (this.localizationManager) {
                this.localizationManager.addLanguageChangeListener((newLang) => {
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
            seoErrorHandler.handle(error, 'metaManagerInit');
        }
    }
    
    /**
     * メタタグの更新
     * @param {Object} context 更新コンテキスト
     * @returns {Promise<void>}
     */
    @measurePerformance('SEOMetaManager')
    async updateMetaTags(context = {}) {
        if (!this.initialized) {
            seoLogger.warn('SEOMetaManager not initialized');
            return;
        }
        
        // デバウンスされた更新を実行
        this.debouncedUpdate(context);
    }
    
    /**
     * 実際のメタタグ更新処理
     * @private
     */
    async _performUpdate(context) {
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
            seoErrorHandler.handle(error, 'metaTagUpdate', context);
        }
    }
    
    /**
     * メタデータの生成
     * @private
     */
    async _generateMetadata(context) {
        const metadata = {
            language: this.currentLang,
            url: this._generateUrl(context),
            timestamp: Date.now()
        };
        
        // タイトルの生成
        metadata.title = await this._generateTitle(context);
        
        // 説明文の生成
        metadata.description = await this._generateDescription(context);
        
        // キーワードの生成
        metadata.keywords = await this._generateKeywords(context);
        
        // ソーシャル画像の選択
        metadata.image = await this._selectSocialImage(context);
        
        // 追加のメタデータ
        metadata.author = SEOConfig.metadata.author;
        metadata.siteName = this._getLocalizedSiteName();
        metadata.type = context.type || 'website';
        
        return metadata;
    }
    
    /**
     * タイトルの生成
     * @private
     */
    async _generateTitle(context) {
        let title = '';
        
        if (context.title) {
            title = context.title;
        } else if (context.pageKey && this.localizationManager) {
            title = this.localizationManager.t(`seo.titles.${context.pageKey}`);
        } else {
            title = this._getLocalizedSiteName();
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
     * @private
     */
    async _generateDescription(context) {
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
            description = await this._enhanceDescriptionWithGameState(description, context.gameState);
        }
        
        // 長さ制限（155文字推奨）
        return truncateText(description, 155);
    }
    
    /**
     * キーワードの生成
     * @private
     */
    async _generateKeywords(context) {
        const baseKeywords = SEOConfig.metadata.keywords[this.currentLang] || 
                           SEOConfig.metadata.keywords.ja;
        
        if (context.additionalKeywords) {
            return `${baseKeywords},${context.additionalKeywords.join(',')}`;
        }
        
        return baseKeywords;
    }
    
    /**
     * ソーシャル画像の選択
     * @private
     */
    async _selectSocialImage(context) {
        // カスタム画像が指定されている場合
        if (context.image) {
            return normalizeUrl(context.image);
        }
        
        // ゲーム状態に基づく動的画像生成
        if (context.gameState && this.dynamicMetaHandlers.has('socialImage')) {
            const handler = this.dynamicMetaHandlers.get('socialImage');
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
     * @private
     */
    _updateBasicMetaTags(metadata) {
        // タイトル
        document.title = metadata.title;
        
        // 説明
        this._updateMetaTag('description', metadata.description);
        
        // キーワード
        this._updateMetaTag('keywords', metadata.keywords);
        
        // 作者
        this._updateMetaTag('author', metadata.author);
        
        // 言語
        document.documentElement.lang = metadata.language;
        this._updateMetaTag('language', metadata.language);
    }
    
    /**
     * Open Graphタグの更新
     * @private
     */
    _updateOpenGraphTags(metadata) {
        const ogTags = {
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
                    this._addMetaTag(property, value);
                });
            } else {
                this._updateMetaTag(property, content);
            }
        });
    }
    
    /**
     * Twitter Cardタグの更新
     * @private
     */
    _updateTwitterCardTags(metadata) {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': truncateText(metadata.title, 70), // Twitter制限
            'twitter:description': truncateText(metadata.description, 200), // Twitter制限
            'twitter:image': this._getTwitterImage(metadata),
            'twitter:image:alt': `${metadata.siteName} - ${metadata.title}`
        };
        
        // サイトのTwitterアカウントがある場合
        if (SEOConfig.socialAccounts?.twitter) {
            twitterTags['twitter:site'] = SEOConfig.socialAccounts.twitter;
        }
        
        // タグの更新
        Object.entries(twitterTags).forEach(([property, content]) => {
            this._updateMetaTag(property, content);
        });
    }
    
    /**
     * Canonical URLの更新
     * @private
     */
    _updateCanonicalUrl(metadata) {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        
        canonical.href = normalizeUrl(metadata.url);
    }
    
    /**
     * hreflangタグの更新
     * @private
     */
    _updateHreflangTags(metadata) {
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
     * @private
     */
    _updateMetaTag(property, content) {
        if (!content) return;
        
        const selector = property.startsWith('og:') || property.startsWith('article:') 
            ? `meta[property="${property}"]`
            : `meta[name="${property}"]`;
        
        let meta = document.querySelector(selector);
        
        if (!meta) {
            meta = createMetaTag(property, content);
            if (meta) {
                document.head.appendChild(meta);
            }
        } else {
            meta.content = sanitizeMetaContent(content);
        }
    }
    
    /**
     * メタタグの追加
     * @private
     */
    _addMetaTag(property, content) {
        const meta = createMetaTag(property, content);
        if (meta) {
            document.head.appendChild(meta);
        }
    }
    
    /**
     * メタタグの削除
     * @private
     */
    _removeMetaTags(property) {
        const selector = property.startsWith('og:') || property.startsWith('article:')
            ? `meta[property="${property}"]`
            : `meta[name="${property}"]`;
        
        const tags = document.querySelectorAll(selector);
        tags.forEach(tag => tag.remove());
    }
    
    /**
     * 既存メタタグの収集
     * @private
     */
    _collectExistingMetaTags() {
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
     * @private
     */
    _registerDynamicHandlers() {
        // ソーシャル画像の動的生成ハンドラー
        this.registerDynamicHandler('socialImage', async (gameState) => {
            if (!gameState || !gameState.score) return null;
            
            // スコアに基づく画像選択のロジック
            if (gameState.score > 100000) {
                return getSocialImageUrl('openGraph', 'highScore');
            } else if (gameState.combo > 50) {
                return getSocialImageUrl('openGraph', 'combo');
            }
            
            return null;
        });
        
        // タイトルの動的生成ハンドラー
        this.registerDynamicHandler('title', async (gameState) => {
            if (!gameState) return null;
            
            if (gameState.achievement) {
                return `${gameState.achievement} 達成！`;
            }
            
            return null;
        });
    }
    
    /**
     * 動的ハンドラーの登録
     * @param {string} type 
     * @param {Function} handler 
     */
    registerDynamicHandler(type, handler) {
        this.dynamicMetaHandlers.set(type, handler);
    }
    
    /**
     * ローカライズされたサイト名の取得
     * @private
     */
    _getLocalizedSiteName() {
        if (this.localizationManager) {
            return this.localizationManager.t('seo.siteName', SEOConfig.siteName);
        }
        
        return this.currentLang === 'ja' ? SEOConfig.siteNameJa : SEOConfig.siteName;
    }
    
    /**
     * タグラインの取得
     * @private
     */
    async _getTagline() {
        if (this.localizationManager) {
            return this.localizationManager.t('seo.tagline');
        }
        
        const taglines = {
            ja: '泡を割って高スコアを目指そう！',
            en: 'Pop bubbles and aim for high scores!'
        };
        
        return taglines[this.currentLang] || taglines.ja;
    }
    
    /**
     * ゲーム状態で説明文を強化
     * @private
     */
    async _enhanceDescriptionWithGameState(description, gameState) {
        const additions = [];
        
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
     * @private
     */
    _generateUrl(context) {
        const path = context.path || window.location.pathname;
        return getLocalizedUrl(this.currentLang, path);
    }
    
    /**
     * Open Graphロケールの取得
     * @private
     */
    _getOGLocale(lang = this.currentLang) {
        const localeMap = {
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
     * @private
     */
    _getTwitterImage(metadata) {
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
     * @private
     */
    _updateCache(metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
            if (typeof value === 'string') {
                this.metaCache.set(key, value);
            }
        });
    }
    
    /**
     * 検証レポートの生成
     * @returns {Object}
     */
    generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            issues: [],
            warnings: [],
            metadata: {}
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
    cleanup() {
        this.metaCache.clear();
        this.dynamicMetaHandlers.clear();
        
        if (this.debouncedUpdate) {
            this.debouncedUpdate.cancel?.();
        }
        
        seoLogger.info('SEOMetaManager cleaned up');
    }
}