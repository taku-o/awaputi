/**
 * SEO国際化管理クラス
 * 
 * hreflangタグ生成とLocalizationManagerとの統合機能を提供
 */
import { SEOConfig, getBaseUrl, getLocalizedUrl } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';
import { 
    normalizeUrl, 
    measurePerformance,
    generateCacheKey 
} from './SEOUtils.js';

export class SEOI18nManager {
    constructor(localizationManager = null, seoMetaManager = null) {
        this.localizationManager = localizationManager;
        this.seoMetaManager = seoMetaManager;
        this.baseUrl = getBaseUrl();
        this.hreflangCache = new Map();
        this.localizedMetaCache = new Map();
        this.supportedLanguages = SEOConfig.supportedLanguages;
        this.defaultLanguage = SEOConfig.defaultLanguage;
        
        this._initialize();
    }
    
    /**
     * 初期化処理
     * @private
     */
    _initialize() {
        try {
            // 言語設定の検証
            this._validateLanguageConfiguration();
            
            // LocalizationManagerのイベントリスナー登録
            if (this.localizationManager) {
                this.localizationManager.addLanguageChangeListener((newLang) => {
                    this._onLanguageChange(newLang);
                });
            }
            
            seoLogger.info('SEOI18nManager initialized successfully');
        } catch (error) {
            seoErrorHandler.handle(error, 'seoi18nManagerInit');
        }
    }
    
    /**
     * hreflangタグの生成
     * @param {string} currentPath - 現在のページパス
     * @param {Object} options - オプション設定
     * @returns {Promise<string>}
     */
    @measurePerformance('SEOI18nManager')
    async generateHreflangTags(currentPath = '/', options = {}) {
        try {
            const cacheKey = generateCacheKey('hreflang', { currentPath, ...options });
            
            // キャッシュチェック
            if (this.hreflangCache.has(cacheKey) && !options.forceRefresh) {
                return this.hreflangCache.get(cacheKey);
            }
            
            let hreflangTags = '    <!-- hreflang links -->\n';
            
            // サポートされている各言語のhreflangタグを生成
            for (const lang of this.supportedLanguages) {
                const localizedUrl = this._generateLocalizedUrl(lang, currentPath);
                const langCode = this._getHreflangCode(lang);
                
                hreflangTags += `    <link rel="alternate" hreflang="${langCode}" href="${localizedUrl}" />\n`;
            }
            
            // x-default（デフォルト言語フォールバック）
            const defaultUrl = this._generateLocalizedUrl(this.defaultLanguage, currentPath);
            hreflangTags += `    <link rel="alternate" hreflang="x-default" href="${defaultUrl}" />\n`;
            
            // キャッシュに保存
            this.hreflangCache.set(cacheKey, hreflangTags);
            
            return hreflangTags;
        } catch (error) {
            return seoErrorHandler.handle(error, 'generateHreflangTags', { currentPath, options });
        }
    }
    
    /**
     * 多言語対応メタタグの生成
     * @param {Object} content - コンテンツ情報
     * @returns {Promise<Object>}
     */
    async generateLocalizedMetaTags(content = {}) {
        try {
            const currentLang = this.localizationManager ? 
                this.localizationManager.getCurrentLanguage() : this.defaultLanguage;
            
            const cacheKey = generateCacheKey('localized_meta', { currentLang, ...content });
            
            // キャッシュチェック
            if (this.localizedMetaCache.has(cacheKey) && !content.forceRefresh) {
                return this.localizedMetaCache.get(cacheKey);
            }
            
            const localizedMeta = {
                language: currentLang,
                title: await this._getLocalizedTitle(content),
                description: await this._getLocalizedDescription(content),
                keywords: await this._getLocalizedKeywords(content),
                ogTitle: await this._getLocalizedOGTitle(content),
                ogDescription: await this._getLocalizedOGDescription(content),
                twitterTitle: await this._getLocalizedTwitterTitle(content),
                twitterDescription: await this._getLocalizedTwitterDescription(content),
                locale: this._getOGLocale(currentLang),
                direction: this._getTextDirection(currentLang),
                regionalMeta: await this._getRegionalMetadata(currentLang)
            };
            
            // キャッシュに保存
            this.localizedMetaCache.set(cacheKey, localizedMeta);
            
            return localizedMeta;
        } catch (error) {
            return seoErrorHandler.handle(error, 'generateLocalizedMetaTags', content);
        }
    }
    
    /**
     * 地域固有のメタデータ生成
     * @param {string} language - 言語コード
     * @returns {Promise<Object>}
     */
    async _getRegionalMetadata(language) {
        const regional = {
            currency: 'JPY',
            timezone: 'Asia/Tokyo',
            countryCode: 'JP',
            region: 'Asia'
        };
        
        // 言語別の地域設定
        switch (language) {
            case 'en':
                regional.currency = 'USD';
                regional.timezone = 'America/New_York';
                regional.countryCode = 'US';
                regional.region = 'North America';
                break;
            case 'zh-CN':
                regional.currency = 'CNY';
                regional.timezone = 'Asia/Shanghai';
                regional.countryCode = 'CN';
                regional.region = 'Asia';
                break;
            case 'zh-TW':
                regional.currency = 'TWD';
                regional.timezone = 'Asia/Taipei';
                regional.countryCode = 'TW';
                regional.region = 'Asia';
                break;
            case 'ko':
                regional.currency = 'KRW';
                regional.timezone = 'Asia/Seoul';
                regional.countryCode = 'KR';
                regional.region = 'Asia';
                break;
            default:
                // デフォルトは日本
                break;
        }
        
        return regional;
    }
    
    /**
     * 言語固有の構造化データ生成
     * @param {string} language - 言語コード
     * @param {Object} gameData - ゲームデータ
     * @returns {Promise<Object>}
     */
    async generateLocalizedStructuredData(language, gameData = {}) {
        try {
            const structuredData = {
                '@context': 'https://schema.org',
                '@type': 'VideoGame',
                name: await this._getLocalizedGameName(language),
                description: await this._getLocalizedGameDescription(language),
                genre: await this._getLocalizedGenre(language),
                gamePlatform: ['Web Browser', 'Progressive Web App'],
                operatingSystem: ['Any'],
                applicationCategory: 'Game',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: (await this._getRegionalMetadata(language)).currency,
                    availability: 'https://schema.org/InStock'
                },
                inLanguage: language,
                contentRating: await this._getLocalizedContentRating(language),
                keywords: await this._getLocalizedKeywords({ language }),
                creator: {
                    '@type': 'Organization',
                    name: 'BubblePop Development Team',
                    url: this.baseUrl
                },
                datePublished: '2024-01-01',
                dateModified: new Date().toISOString().split('T')[0]
            };
            
            // 言語固有の追加情報
            if (gameData.screenshots) {
                structuredData.screenshot = gameData.screenshots.map(url => 
                    normalizeUrl(`${this.baseUrl}${url}`)
                );
            }
            
            if (gameData.video) {
                structuredData.trailer = {
                    '@type': 'VideoObject',
                    name: await this._getLocalizedTrailerTitle(language),
                    description: await this._getLocalizedTrailerDescription(language),
                    url: normalizeUrl(`${this.baseUrl}${gameData.video}`)
                };
            }
            
            return structuredData;
        } catch (error) {
            return seoErrorHandler.handle(error, 'generateLocalizedStructuredData', { language, gameData });
        }
    }
    
    /**
     * 全言語用のサイトマップ生成
     * @param {Array} baseUrls - ベースURL一覧
     * @returns {Promise<string>}
     */
    async generateMultilingualSitemap(baseUrls = ['/']) {
        try {
            let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
            sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
            
            for (const basePath of baseUrls) {
                // メインURL（デフォルト言語）
                const mainUrl = normalizeUrl(`${this.baseUrl}${basePath}`);
                sitemap += '  <url>\n';
                sitemap += `    <loc>${this._escapeXml(mainUrl)}</loc>\n`;
                sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
                sitemap += '    <changefreq>weekly</changefreq>\n';
                sitemap += '    <priority>1.0</priority>\n';
                
                // 各言語のhreflangリンク
                for (const lang of this.supportedLanguages) {
                    const localizedUrl = this._generateLocalizedUrl(lang, basePath);
                    const hreflangCode = this._getHreflangCode(lang);
                    sitemap += `    <xhtml:link rel="alternate" hreflang="${hreflangCode}" href="${this._escapeXml(localizedUrl)}" />\n`;
                }
                
                // x-default
                const defaultUrl = this._generateLocalizedUrl(this.defaultLanguage, basePath);
                sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${this._escapeXml(defaultUrl)}" />\n`;
                sitemap += '  </url>\n';
                
                // 各言語バージョンのURL
                for (const lang of this.supportedLanguages) {
                    if (lang === this.defaultLanguage) continue; // メインURLで既に処理済み
                    
                    const localizedUrl = this._generateLocalizedUrl(lang, basePath);
                    sitemap += '  <url>\n';
                    sitemap += `    <loc>${this._escapeXml(localizedUrl)}</loc>\n`;
                    sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
                    sitemap += '    <changefreq>weekly</changefreq>\n';
                    sitemap += '    <priority>0.8</priority>\n';
                    sitemap += '  </url>\n';
                }
            }
            
            sitemap += '</urlset>\n';
            return sitemap;
        } catch (error) {
            return seoErrorHandler.handle(error, 'generateMultilingualSitemap', { baseUrls });
        }
    }
    
    /**
     * ローカライズされたタイトルの取得
     * @private
     */
    async _getLocalizedTitle(content) {
        if (!this.localizationManager) {
            return content.title || 'BubblePop - 泡割りゲーム';
        }
        
        if (content.titleKey) {
            return this.localizationManager.t(content.titleKey);
        }
        
        const baseTitle = this.localizationManager.t('seo.title') || 'BubblePop';
        const subtitle = this.localizationManager.t('seo.subtitle') || '泡割りゲーム';
        
        return `${baseTitle} - ${subtitle}`;
    }
    
    /**
     * ローカライズされた説明文の取得
     * @private
     */
    async _getLocalizedDescription(content) {
        if (!this.localizationManager) {
            return content.description || 'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
        }
        
        if (content.descriptionKey) {
            return this.localizationManager.t(content.descriptionKey);
        }
        
        return this.localizationManager.t('seo.description') || 
            'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
    }
    
    /**
     * ローカライズされたキーワードの取得
     * @private
     */
    async _getLocalizedKeywords(content) {
        if (!this.localizationManager) {
            return 'バブルポップ,ゲーム,HTML5,ブラウザゲーム,無料';
        }
        
        const lang = content.language || this.localizationManager.getCurrentLanguage();
        
        const keywordSets = {
            ja: 'バブルポップ,ゲーム,HTML5,ブラウザゲーム,無料,泡割り,パズル',
            en: 'bubble pop,game,HTML5,browser game,free,puzzle,casual',
            'zh-CN': '泡泡射击,游戏,HTML5,浏览器游戏,免费,益智',
            'zh-TW': '泡泡射擊,遊戲,HTML5,瀏覽器遊戲,免費,益智',
            ko: '버블팝,게임,HTML5,브라우저게임,무료,퍼즐'
        };
        
        return keywordSets[lang] || keywordSets.ja;
    }
    
    /**
     * ローカライズされたOGタイトルの取得
     * @private
     */
    async _getLocalizedOGTitle(content) {
        const title = await this._getLocalizedTitle(content);
        return title;
    }
    
    /**
     * ローカライズされたOG説明文の取得
     * @private
     */
    async _getLocalizedOGDescription(content) {
        const description = await this._getLocalizedDescription(content);
        return description;
    }
    
    /**
     * ローカライズされたTwitterタイトルの取得
     * @private
     */
    async _getLocalizedTwitterTitle(content) {
        const title = await this._getLocalizedTitle(content);
        return title.length > 70 ? title.substring(0, 67) + '...' : title;
    }
    
    /**
     * ローカライズされたTwitter説明文の取得
     * @private
     */
    async _getLocalizedTwitterDescription(content) {
        const description = await this._getLocalizedDescription(content);
        return description.length > 200 ? description.substring(0, 197) + '...' : description;
    }
    
    /**
     * ゲーム名の多言語対応
     * @private
     */
    async _getLocalizedGameName(language) {
        const gameNames = {
            ja: 'BubblePop - 泡割りゲーム',
            en: 'BubblePop - Bubble Popping Game',
            'zh-CN': 'BubblePop - 泡泡射击游戏',
            'zh-TW': 'BubblePop - 泡泡射擊遊戲',
            ko: 'BubblePop - 버블팝 게임'
        };
        
        return gameNames[language] || gameNames.ja;
    }
    
    /**
     * ゲーム説明の多言語対応
     * @private
     */
    async _getLocalizedGameDescription(language) {
        const descriptions = {
            ja: 'HTML5 Canvas を使用したバブルポップゲーム。18種類以上の特殊な泡を割って高スコアを目指そう！',
            en: 'A bubble popping game built with HTML5 Canvas. Pop over 18 types of special bubbles to achieve high scores!',
            'zh-CN': '使用 HTML5 Canvas 构建的泡泡射击游戏。射击超过18种特殊泡泡，争取高分！',
            'zh-TW': '使用 HTML5 Canvas 構建的泡泡射擊遊戲。射擊超過18種特殊泡泡，爭取高分！',
            ko: 'HTML5 Canvas로 제작된 버블팝 게임. 18가지 이상의 특수 버블을 터뜨려 높은 점수를 달성하세요!'
        };
        
        return descriptions[language] || descriptions.ja;
    }
    
    /**
     * ジャンルの多言語対応
     * @private
     */
    async _getLocalizedGenre(language) {
        const genres = {
            ja: 'パズル・アクション',
            en: 'Puzzle & Action',
            'zh-CN': '益智动作',
            'zh-TW': '益智動作',
            ko: '퍼즐 액션'
        };
        
        return genres[language] || genres.ja;
    }
    
    /**
     * コンテンツレーティングの多言語対応
     * @private
     */
    async _getLocalizedContentRating(language) {
        const ratings = {
            ja: 'CERO:A（全年齢対象）',
            en: 'ESRB:E（Everyone）',
            'zh-CN': '全年龄',
            'zh-TW': '全年齡',
            ko: '전연령'
        };
        
        return ratings[language] || ratings.ja;
    }
    
    /**
     * 予告動画タイトルの多言語対応
     * @private
     */
    async _getLocalizedTrailerTitle(language) {
        const titles = {
            ja: 'BubblePop ゲームプレイ動画',
            en: 'BubblePop Gameplay Video',
            'zh-CN': 'BubblePop 游戏演示视频',
            'zh-TW': 'BubblePop 遊戲演示影片',
            ko: 'BubblePop 게임플레이 동영상'
        };
        
        return titles[language] || titles.ja;
    }
    
    /**
     * 予告動画説明の多言語対応
     * @private
     */
    async _getLocalizedTrailerDescription(language) {
        const descriptions = {
            ja: 'BubblePopのゲームプレイをご紹介します。様々な泡を割って高スコアを目指しましょう！',
            en: 'Watch BubblePop gameplay! Pop various bubbles and aim for high scores!',
            'zh-CN': '观看 BubblePop 游戏演示！射击各种泡泡，争取高分！',
            'zh-TW': '觀看 BubblePop 遊戲演示！射擊各種泡泡，爭取高分！',
            ko: 'BubblePop 게임플레이를 확인하세요! 다양한 버블을 터뜨려 높은 점수를 달성하세요!'
        };
        
        return descriptions[language] || descriptions.ja;
    }
    
    /**
     * 多言語対応URLの生成
     * @private
     */
    _generateLocalizedUrl(language, path) {
        return getLocalizedUrl(language, path);
    }
    
    /**
     * hreflang言語コードの取得
     * @private
     */
    _getHreflangCode(language) {
        // ISO 639-1準拠の言語コード
        const hreflangMap = {
            'ja': 'ja',
            'en': 'en',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko'
        };
        
        return hreflangMap[language] || language;
    }
    
    /**
     * Open Graphロケールの取得
     * @private
     */
    _getOGLocale(language) {
        const localeMap = {
            'ja': 'ja_JP',
            'en': 'en_US',
            'zh-CN': 'zh_CN',
            'zh-TW': 'zh_TW',
            'ko': 'ko_KR'
        };
        
        return localeMap[language] || 'ja_JP';
    }
    
    /**
     * テキスト方向の取得
     * @private
     */
    _getTextDirection(language) {
        if (this.localizationManager) {
            return this.localizationManager.isRTLLanguage(language) ? 'rtl' : 'ltr';
        }
        
        // RTL言語（アラビア語、ヘブライ語など）のチェック
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    }
    
    /**
     * 言語設定の検証
     * @private
     */
    _validateLanguageConfiguration() {
        if (!this.supportedLanguages || this.supportedLanguages.length === 0) {
            throw new Error('No supported languages configured');
        }
        
        if (!this.supportedLanguages.includes(this.defaultLanguage)) {
            throw new Error(`Default language ${this.defaultLanguage} not in supported languages`);
        }
    }
    
    /**
     * 言語変更時の処理
     * @private
     */
    _onLanguageChange(newLanguage) {
        try {
            // キャッシュをクリア
            this.localizedMetaCache.clear();
            
            // SEOMetaManagerに言語変更を通知
            if (this.seoMetaManager && typeof this.seoMetaManager.updateLanguage === 'function') {
                this.seoMetaManager.updateLanguage(newLanguage);
            }
            
            seoLogger.info(`Language changed to ${newLanguage}, SEO caches cleared`);
        } catch (error) {
            seoLogger.error('Error handling language change', error);
        }
    }
    
    /**
     * XMLエスケープ
     * @private
     */
    _escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * SEO国際化の検証
     * @returns {Object}
     */
    validateI18nSEO() {
        const issues = [];
        const warnings = [];
        
        // サポート言語の確認
        if (this.supportedLanguages.length < 2) {
            warnings.push('Only one language supported - multilingual SEO may not be effective');
        }
        
        // LocalizationManagerの統合確認
        if (!this.localizationManager) {
            warnings.push('LocalizationManager not integrated - some features may be limited');
        }
        
        // デフォルト言語の確認
        if (!this.defaultLanguage || !this.supportedLanguages.includes(this.defaultLanguage)) {
            issues.push('Invalid default language configuration');
        }
        
        // BaseURLの確認
        if (!this.baseUrl || !this.baseUrl.startsWith('http')) {
            issues.push('Invalid base URL configuration');
        }
        
        const isValid = issues.length === 0;
        
        seoLogger.validation('i18nSEO', isValid, issues);
        
        return {
            isValid,
            issues,
            warnings,
            supportedLanguages: this.supportedLanguages.length,
            defaultLanguage: this.defaultLanguage,
            hasLocalizationManager: !!this.localizationManager
        };
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache() {
        this.hreflangCache.clear();
        this.localizedMetaCache.clear();
        seoLogger.info('SEOI18nManager cache cleared');
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.clearCache();
        
        // LocalizationManagerのイベントリスナー削除
        if (this.localizationManager && typeof this.localizationManager.removeLanguageChangeListener === 'function') {
            this.localizationManager.removeLanguageChangeListener(this._onLanguageChange);
        }
        
        seoLogger.info('SEOI18nManager cleaned up');
    }
}