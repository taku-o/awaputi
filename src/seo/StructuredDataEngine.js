/**
 * 構造化データエンジン
 * 
 * JSON-LD形式の構造化データを生成・管理
 */
import { SEOConfig, getBaseUrl, getLocalizedUrl, getSocialImageUrl } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';
import { 
    generateJsonLd, 
    normalizeLanguageCode,
    validateSchema,
    measurePerformance
} from './SEOUtils.js';

export class StructuredDataEngine {
    constructor(localizationManager = null, gameConfig = null) {
        this.localizationManager = localizationManager;
        this.gameConfig = gameConfig;
        this.baseUrl = getBaseUrl();
        this.currentLang = SEOConfig.defaultLanguage;
        this.schemas = new Map();
        this.schemaCache = new Map();
        this.initialized = false;
        
        this._initialize();
    }
    
    /**
     * 初期化処理
     * @private
     */
    _initialize() {
        try {
            // 言語設定の初期化
            if (this.localizationManager) {
                this.currentLang = normalizeLanguageCode(
                    this.localizationManager.getCurrentLanguage()
                );
                
                // 言語変更リスナー
                this.localizationManager.addLanguageChangeListener((newLang) => {
                    this.currentLang = normalizeLanguageCode(newLang);
                    this.clearCache();
                });
            }
            
            // スキーマ生成関数の登録
            this._registerSchemaGenerators();
            
            this.initialized = true;
            seoLogger.info('StructuredDataEngine initialized successfully');
        } catch (error) {
            seoErrorHandler.handle(error, 'structuredDataInit');
        }
    }
    
    /**
     * 包括的な構造化データの生成
     * @param {Object} context 
     * @returns {Promise<Array>}
     */
    async generateStructuredData(context = {}) {
        if (!this.initialized) {
            seoLogger.warn('StructuredDataEngine not initialized');
            return [];
        }
        
        try {
            const schemas = [];
            
            // VideoGameスキーマ
            const videoGame = await this.generateVideoGameSchema(context);
            if (videoGame) schemas.push(videoGame);
            
            // Organizationスキーマ
            const organization = await this.generateOrganizationSchema(context);
            if (organization) schemas.push(organization);
            
            // WebApplicationスキーマ
            const webApp = await this.generateWebApplicationSchema(context);
            if (webApp) schemas.push(webApp);
            
            // BreadcrumbListスキーマ（ページ固有）
            if (context.breadcrumbs) {
                const breadcrumbs = await this.generateBreadcrumbSchema(context.breadcrumbs);
                if (breadcrumbs) schemas.push(breadcrumbs);
            }
            
            // Eventスキーマ（イベント開催時）
            if (context.event) {
                const event = await this.generateEventSchema(context.event);
                if (event) schemas.push(event);
            }
            
            return schemas;
        } catch (error) {
            return seoErrorHandler.handle(error, 'structuredDataGeneration', { context });
        }
    }

    /**
     * ゲームプレイデータに基づいて構造化データを更新
     * @param {Object} gameplayData - ゲームプレイデータ
     */
    async updateGameplayData(gameplayData) {
        try {
            if (!this.initialized) {
                seoLogger.warn('StructuredDataEngine not initialized');
                return;
            }

            // 現在の VideoGame スキーマを取得
            const currentSchema = await this.generateVideoGameSchema();
            
            // ゲームプレイデータを組み込んだ拡張スキーマを生成
            const enhancedSchema = {
                ...currentSchema,
                // ゲームプレイ統計を追加
                additionalProperty: [
                    {
                        "@type": "PropertyValue",
                        "name": "currentHighScore",
                        "value": gameplayData.score || 0
                    },
                    {
                        "@type": "PropertyValue", 
                        "name": "totalBubblesPopped",
                        "value": gameplayData.bubblesPopped || 0
                    },
                    {
                        "@type": "PropertyValue",
                        "name": "currentLevel",
                        "value": gameplayData.level || 1
                    },
                    {
                        "@type": "PropertyValue",
                        "name": "playTime",
                        "value": gameplayData.playTime || 0
                    }
                ],
                // プレイヤー活動の証拠として最終更新時刻を更新
                dateModified: new Date().toISOString()
            };

            // インタラクション統計が存在する場合は追加
            if (gameplayData.score > 0) {
                enhancedSchema.interactionStatistic = {
                    "@type": "InteractionCounter",
                    "interactionType": "http://schema.org/PlayAction",
                    "userInteractionCount": gameplayData.bubblesPopped || 0
                };
            }

            // 動的にスキーマを更新
            await this._updateSchemaInDOM('VideoGame', enhancedSchema);

            seoLogger.info('Gameplay data updated in structured data', gameplayData);
        } catch (error) {
            seoErrorHandler.handle(error, 'updateGameplayData', { gameplayData });
        }
    }

    /**
     * DOM内の特定のスキーマを更新
     * @param {string} schemaType - スキーマタイプ
     * @param {Object} newSchema - 新しいスキーマデータ
     */
    async _updateSchemaInDOM(schemaType, newSchema) {
        try {
            // 既存のスクリプトタグを検索
            const existingScript = document.querySelector(`script[type="application/ld+json"][data-schema="${schemaType}"]`);
            
            if (existingScript) {
                // 既存のスキーマを更新
                existingScript.textContent = JSON.stringify(newSchema, null, 2);
                seoLogger.debug(`Updated ${schemaType} schema in DOM`);
            } else {
                // 新しいスクリプトタグを作成
                const scriptTag = document.createElement('script');
                scriptTag.type = 'application/ld+json';
                scriptTag.setAttribute('data-schema', schemaType);
                scriptTag.textContent = JSON.stringify(newSchema, null, 2);
                
                // 構造化データ注入ポイントに追加
                const injectionPoint = document.getElementById('structured-data-injection-point');
                if (injectionPoint) {
                    injectionPoint.appendChild(scriptTag);
                    seoLogger.debug(`Added ${schemaType} schema to DOM`);
                }
            }
        } catch (error) {
            seoErrorHandler.handle(error, '_updateSchemaInDOM', { schemaType });
        }
    }
    
    /**
     * VideoGameスキーマの生成
     * @param {Object} context 
     * @returns {Promise<Object>}
     */
    async generateVideoGameSchema(context = {}) {
        const cacheKey = `videoGame:${this.currentLang}`;
        
        // キャッシュチェック
        if (this.schemaCache.has(cacheKey) && !context.forceRefresh) {
            return this.schemaCache.get(cacheKey);
        }
        
        try {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'VideoGame',
                '@id': `${this.baseUrl}#game`,
                name: await this._getLocalizedGameName(),
                alternateName: SEOConfig.structuredData.game.alternateName,
                description: await this._getLocalizedGameDescription(),
                genre: SEOConfig.structuredData.game.genre,
                gamePlatform: SEOConfig.structuredData.game.platform,
                operatingSystem: SEOConfig.structuredData.game.operatingSystem,
                applicationCategory: SEOConfig.structuredData.game.applicationCategory,
                contentRating: SEOConfig.structuredData.game.contentRating,
                inLanguage: SEOConfig.structuredData.game.inLanguage,
                isAccessibleForFree: SEOConfig.structuredData.game.isAccessibleForFree,
                numberOfPlayers: {
                    '@type': 'QuantitativeValue',
                    value: 1
                },
                playMode: 'SinglePlayer',
                publisher: {
                    '@type': 'Organization',
                    '@id': `${this.baseUrl}#organization`
                },
                offers: {
                    '@type': 'Offer',
                    price: SEOConfig.structuredData.game.offers.price,
                    priceCurrency: SEOConfig.structuredData.game.offers.priceCurrency,
                    availability: 'https://schema.org/InStock'
                }
            };
            
            // スクリーンショット
            const screenshots = await this._getScreenshots();
            if (screenshots.length > 0) {
                schema.screenshot = screenshots;
            }
            
            // ゲームプレイ動画
            const video = await this._getGameplayVideo();
            if (video) {
                schema.video = video;
            }
            
            // 集計評価（将来的な実装用）
            const rating = await this._getAggregateRating();
            if (rating) {
                schema.aggregateRating = rating;
            }
            
            // ゲームのヒントやコツ
            const gameTips = await this._getGameTips();
            if (gameTips.length > 0) {
                schema.gameTip = gameTips;
            }
            
            // キャッシュに保存
            this.schemaCache.set(cacheKey, schema);
            
            return schema;
        } catch (error) {
            return seoErrorHandler.handle(error, 'videoGameSchema', { context });
        }
    }
    
    /**
     * Organizationスキーマの生成
     * @param {Object} context 
     * @returns {Promise<Object>}
     */
    async generateOrganizationSchema(context = {}) {
        const cacheKey = 'organization';
        
        if (this.schemaCache.has(cacheKey) && !context.forceRefresh) {
            return this.schemaCache.get(cacheKey);
        }
        
        try {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': `${this.baseUrl}#organization`,
                name: SEOConfig.structuredData.organization.name,
                url: SEOConfig.structuredData.organization.url,
                logo: {
                    '@type': 'ImageObject',
                    url: SEOConfig.structuredData.organization.logo,
                    width: 512,
                    height: 512
                },
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    availableLanguage: SEOConfig.supportedLanguages
                }
            };
            
            // ソーシャルメディアプロファイル
            if (SEOConfig.structuredData.organization.sameAs?.length > 0) {
                schema.sameAs = SEOConfig.structuredData.organization.sameAs;
            }
            
            // 開発チーム情報
            if (context.includeMembers) {
                schema.member = await this._getTeamMembers();
            }
            
            this.schemaCache.set(cacheKey, schema);
            
            return schema;
        } catch (error) {
            return seoErrorHandler.handle(error, 'organizationSchema', { context });
        }
    }
    
    /**
     * WebApplicationスキーマの生成
     * @param {Object} context 
     * @returns {Promise<Object>}
     */
    async generateWebApplicationSchema(context = {}) {
        const cacheKey = `webApp:${this.currentLang}`;
        
        if (this.schemaCache.has(cacheKey) && !context.forceRefresh) {
            return this.schemaCache.get(cacheKey);
        }
        
        try {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                '@id': `${this.baseUrl}#webapp`,
                name: await this._getLocalizedGameName(),
                url: this.baseUrl,
                applicationCategory: SEOConfig.structuredData.webApplication.applicationCategory,
                operatingSystem: 'Any',
                permissions: SEOConfig.structuredData.webApplication.permissions,
                browserRequirements: SEOConfig.structuredData.webApplication.browserRequirements,
                memoryRequirements: SEOConfig.structuredData.webApplication.memoryRequirements,
                storageRequirements: SEOConfig.structuredData.webApplication.storageRequirements,
                softwareVersion: await this._getAppVersion(),
                datePublished: await this._getPublishDate(),
                dateModified: await this._getLastModified(),
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'JPY'
                }
            };
            
            // インストール方法
            if (context.includePWAInfo) {
                schema.installUrl = this.baseUrl;
                schema.potentialAction = {
                    '@type': 'InstallAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: this.baseUrl,
                        actionPlatform: [
                            'http://schema.org/DesktopWebPlatform',
                            'http://schema.org/MobileWebPlatform',
                            'http://schema.org/IOSPlatform',
                            'http://schema.org/AndroidPlatform'
                        ]
                    }
                };
            }
            
            this.schemaCache.set(cacheKey, schema);
            
            return schema;
        } catch (error) {
            return seoErrorHandler.handle(error, 'webApplicationSchema', { context });
        }
    }
    
    /**
     * BreadcrumbListスキーマの生成
     * @param {Array} breadcrumbs 
     * @returns {Promise<Object>}
     */
    async generateBreadcrumbSchema(breadcrumbs) {
        if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
            return null;
        }
        
        try {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbs.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@id': `${this.baseUrl}${item.url}`,
                        name: item.name
                    }
                }))
            };
            
            return schema;
        } catch (error) {
            return seoErrorHandler.handle(error, 'breadcrumbSchema', { breadcrumbs });
        }
    }
    
    /**
     * Eventスキーマの生成
     * @param {Object} eventData 
     * @returns {Promise<Object>}
     */
    async generateEventSchema(eventData) {
        if (!eventData) return null;
        
        try {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: eventData.name,
                description: eventData.description,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                eventStatus: 'https://schema.org/EventScheduled',
                eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
                location: {
                    '@type': 'VirtualLocation',
                    url: this.baseUrl
                },
                organizer: {
                    '@type': 'Organization',
                    '@id': `${this.baseUrl}#organization`
                },
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'JPY',
                    availability: 'https://schema.org/InStock',
                    validFrom: eventData.startDate
                }
            };
            
            // イベント画像
            if (eventData.image) {
                schema.image = eventData.image;
            }
            
            // パフォーマー（特別ゲスト等）
            if (eventData.performers) {
                schema.performer = eventData.performers;
            }
            
            return schema;
        } catch (error) {
            return seoErrorHandler.handle(error, 'eventSchema', { eventData });
        }
    }
    
    /**
     * スキーマの挿入または更新
     * @param {Array|Object} schemas 
     */
    async insertOrUpdateSchemas(schemas) {
        const schemaArray = Array.isArray(schemas) ? schemas : [schemas];
        
        // 既存のスクリプトタグを削除
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => {
            if (script.textContent.includes('@context')) {
                script.remove();
            }
        });
        
        // 新しいスキーマを挿入
        schemaArray.forEach(schema => {
            if (!schema || typeof schema !== 'object') return;
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = generateJsonLd(schema);
            document.head.appendChild(script);
        });
        
        seoLogger.info('Structured data updated', {
            count: schemaArray.length
        });
    }
    
    /**
     * スキーマ生成関数の登録
     * @private
     */
    _registerSchemaGenerators() {
        // カスタムスキーマジェネレーターを登録可能にする
        this.schemas.set('VideoGame', this.generateVideoGameSchema.bind(this));
        this.schemas.set('Organization', this.generateOrganizationSchema.bind(this));
        this.schemas.set('WebApplication', this.generateWebApplicationSchema.bind(this));
        this.schemas.set('BreadcrumbList', this.generateBreadcrumbSchema.bind(this));
        this.schemas.set('Event', this.generateEventSchema.bind(this));
    }
    
    /**
     * ローカライズされたゲーム名の取得
     * @private
     */
    async _getLocalizedGameName() {
        if (this.localizationManager) {
            return this.localizationManager.t('game.name', SEOConfig.structuredData.game.name);
        }
        
        return SEOConfig.structuredData.game.name;
    }
    
    /**
     * ローカライズされたゲーム説明の取得
     * @private
     */
    async _getLocalizedGameDescription() {
        if (this.localizationManager) {
            return this.localizationManager.t('game.description');
        }
        
        return SEOConfig.metadata.extendedDescription[this.currentLang] || 
               SEOConfig.metadata.extendedDescription.ja;
    }
    
    /**
     * スクリーンショットURLの取得
     * @private
     */
    async _getScreenshots() {
        const screenshots = [];
        const baseScreenshots = [
            '/assets/screenshots/game-portrait.png',
            '/assets/screenshots/game-landscape-1.png',
            '/assets/screenshots/game-landscape-2.png',
            '/assets/screenshots/gameplay-1.png',
            '/assets/screenshots/gameplay-2.png'
        ];
        
        baseScreenshots.forEach(path => {
            screenshots.push({
                '@type': 'ImageObject',
                url: `${this.baseUrl}${path}`,
                caption: 'BubblePop ゲームプレイ画面'
            });
        });
        
        return screenshots;
    }
    
    /**
     * ゲームプレイ動画の取得
     * @private
     */
    async _getGameplayVideo() {
        // 将来的な実装用
        if (SEOConfig.gameplayVideoUrl) {
            return {
                '@type': 'VideoObject',
                name: 'BubblePop ゲームプレイ動画',
                description: 'BubblePopの実際のゲームプレイを紹介',
                thumbnailUrl: `${this.baseUrl}/assets/video/thumbnail.jpg`,
                uploadDate: await this._getPublishDate(),
                contentUrl: SEOConfig.gameplayVideoUrl
            };
        }
        
        return null;
    }
    
    /**
     * 集計評価の取得
     * @private
     */
    async _getAggregateRating() {
        // 将来的な実装用（レビューシステム実装後）
        if (this.gameConfig?.reviews?.enabled) {
            return {
                '@type': 'AggregateRating',
                ratingValue: '4.5',
                bestRating: '5',
                worstRating: '1',
                ratingCount: '128'
            };
        }
        
        return null;
    }
    
    /**
     * ゲームのヒントの取得
     * @private
     */
    async _getGameTips() {
        const tips = [];
        
        if (this.localizationManager) {
            // ローカライズされたヒントを取得
            const tipKeys = [
                'tips.combo',
                'tips.special_bubbles',
                'tips.timing',
                'tips.strategy'
            ];
            
            tipKeys.forEach(key => {
                const tip = this.localizationManager.t(key);
                if (tip && tip !== key) {
                    tips.push(tip);
                }
            });
        } else {
            // デフォルトのヒント
            tips.push(
                'コンボを繋げて高スコアを狙おう！',
                '特殊な泡の効果を活用しよう',
                'タイミングを見計らって効率的に泡を割ろう'
            );
        }
        
        return tips;
    }
    
    /**
     * チームメンバー情報の取得
     * @private
     */
    async _getTeamMembers() {
        // 開発チームの情報（プライバシーに配慮）
        return [
            {
                '@type': 'Person',
                name: 'Development Team',
                jobTitle: 'Game Developer'
            }
        ];
    }
    
    /**
     * アプリバージョンの取得
     * @private
     */
    async _getAppVersion() {
        return this.gameConfig?.version || '1.0.0';
    }
    
    /**
     * 公開日の取得
     * @private
     */
    async _getPublishDate() {
        return this.gameConfig?.publishDate || '2024-01-01';
    }
    
    /**
     * 最終更新日の取得
     * @private
     */
    async _getLastModified() {
        return new Date().toISOString().split('T')[0];
    }
    
    /**
     * スキーマの検証
     * @param {Object} schema 
     * @returns {Object}
     */
    validateSchema(schema) {
        const requiredFields = {
            VideoGame: ['@type', 'name', 'description'],
            Organization: ['@type', 'name', 'url'],
            WebApplication: ['@type', 'name', 'url'],
            BreadcrumbList: ['@type', 'itemListElement'],
            Event: ['@type', 'name', 'startDate', 'location']
        };
        
        const schemaType = schema['@type'];
        const required = requiredFields[schemaType] || ['@type'];
        
        const validation = validateSchema(schema, {
            required,
            properties: {
                '@context': { type: 'string' },
                '@type': { type: 'string' },
                '@id': { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                url: { type: 'string' }
            }
        });
        
        seoLogger.validation(`structuredData.${schemaType}`, validation.isValid, validation.errors);
        
        return validation;
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache() {
        this.schemaCache.clear();
        seoLogger.info('Structured data cache cleared');
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.schemas.clear();
        this.schemaCache.clear();
        seoLogger.info('StructuredDataEngine cleaned up');
    }
}