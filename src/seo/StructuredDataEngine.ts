/**
 * 構造化データエンジン
 * 
 * JSON-LD形式の構造化データを生成・管理
 */
import { SEOConfig, getBaseUrl, getLocalizedUrl, getSocialImageUrl, LanguageCode } from './SEOConfig';''
import { seoLogger } from './SEOLogger';''
import { seoErrorHandler } from './SEOErrorHandler';
import { generateJsonLd, 
    normalizeLanguageCode,
    validateSchema,';
    measurePerformance' }'
} from './SEOUtils';

// 基本スキーマインターフェース'
interface BaseSchema { ''
    '@context': string;''
    '@type': string;
    [key: string]: any, }
}

// VideoGameスキーマインターフェース'
interface VideoGameSchema extends BaseSchema { ''
    '@type': 'VideoGame';
    name: string,
    description: string,
    url: string,
    image: string,
    applicationCategory: string,
    operatingSystem: string[],
    genre: string[],
    inLanguage: string[],
    isAccessibleForFree: boolean,
    dateModified?: string;
    additionalProperty?: PropertyValue[];
    interactionStatistic?: InteractionCounter;
    }
}

// PropertyValueインターフェース'
interface PropertyValue { ''
    '@type': 'PropertyValue';
    name: string,
    value: string | number; }
}

// InteractionCounterインターフェース'
interface InteractionCounter { ''
    '@type': 'InteractionCounter';
    interactionType: string,
    userInteractionCount: number; }
}

// Organizationスキーマインターフェース'
interface OrganizationSchema extends BaseSchema { ''
    '@type': 'Organization';
    name: string,
    url: string,
    logo: string,
    sameAs: string[]; }
}

// WebApplicationスキーマインターフェース'
interface WebApplicationSchema extends BaseSchema { ''
    '@type': 'WebApplication';
    name: string,
    description: string,
    url: string,
    applicationCategory: string,
    operatingSystem: string[],
    browserRequirements: string; }
}

// BreadcrumbListスキーマインターフェース'
interface BreadcrumbListSchema extends BaseSchema { ''
    '@type': 'BreadcrumbList';
    itemListElement: ListItem[];
    }
}

// ListItemインターフェース'
interface ListItem { ''
    '@type': 'ListItem';
    position: number,
    name: string,
    item: string; }
}

// Eventスキーマインターフェース'
interface EventSchema extends BaseSchema { ''
    '@type': 'Event';
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    location: string,
    organizer: OrganizationSchema;
    }
}

// ゲームプレイデータインターフェース
interface GameplayData { score?: number;
    bubblesPopped?: number;
    level?: number;
    playTime?: number;
    achievements?: string[];
    combo?: number; }
}

// コンテキストインターフェース
interface StructuredDataContext {
    breadcrumbs?: Array<{ name: string; url: string }>;
    event?: { name: string,
        description: string,
        startDate: string,
        endDate: string,
        location: string; }
    };
    pageType?: string;
    gameState?: any;
}

// LocalizationManager インターフェース
interface LocalizationManager { getCurrentLanguage(): string;
    addLanguageChangeListener(callback: (lang: string) => void): void;
    t(key: string, defaultValue?: string): string;
    get(key: string, params?: Record<string, any>): string; }
}

// GameConfig インターフェース
interface GameConfig { [key: string]: any, }
}

// スキーマ生成関数型
type SchemaGenerator = (context?: any) => Promise<BaseSchema | null>;

export class StructuredDataEngine {
    private localizationManager: LocalizationManager | null;
    private gameConfig: GameConfig | null;
    private baseUrl: string;
    private currentLang: LanguageCode;
    private schemas: Map<string, SchemaGenerator>;
    private schemaCache: Map<string, BaseSchema>;
    private initialized: boolean;
    constructor(localizationManager: LocalizationManager | null = null, gameConfig: GameConfig | null = null) {
    
        this.localizationManager = localizationManager;
        this.gameConfig = gameConfig;
        this.baseUrl = getBaseUrl();
        this.currentLang = SEOConfig.defaultLanguage;
        this.schemas = new Map();
        this.schemaCache = new Map();
        this.initialized = false;
        
    
    }
    }
        this._initialize(); }
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void { try {
            // 言語設定の初期化
            if(this.localizationManager) {
                this.currentLang = normalizeLanguageCode(;
                    this.localizationManager.getCurrentLanguage();
                
                // 言語変更リスナー
                this.localizationManager.addLanguageChangeListener((newLang: string) => { 
            }
                    this.currentLang = normalizeLanguageCode(newLang); }
                    this.clearCache(); }
                });
            }
            ';
            // スキーマ生成関数の登録''
            this._registerSchemaGenerators('')';
            seoLogger.info('StructuredDataEngine initialized successfully');''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'structuredDataInit'); }
        }
    }
    
    /**
     * 包括的な構造化データの生成
     */'
    async generateStructuredData(context: StructuredDataContext = {}): Promise<BaseSchema[]> { ''
        if(!this.initialized') {'
            '';
            seoLogger.warn('StructuredDataEngine not initialized');
        }
            return []; }
        }
        
        try { const schemas: BaseSchema[] = [],
            
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
            if(context.breadcrumbs) {
                const breadcrumbs = await this.generateBreadcrumbSchema(context.breadcrumbs);
            }
                if (breadcrumbs) schemas.push(breadcrumbs); }
            }
            
            // Eventスキーマ（イベント開催時）
            if(context.event) {
                const event = await this.generateEventSchema(context.event);
            }
                if (event) schemas.push(event); }
            }
            ';
            return schemas;''
        } catch (error') { ' }'
            return seoErrorHandler.handle(error as Error, 'structuredDataGeneration', { context });
        }
    }

    /**
     * ゲームプレイデータに基づいて構造化データを更新
     */'
    async updateGameplayData(gameplayData: GameplayData): Promise<void> { try {''
            if(!this.initialized') {'
                '';
                seoLogger.warn('StructuredDataEngine not initialized');
            }
                return; }
            }

            // 現在の VideoGame スキーマを取得'
            const currentSchema = await this.generateVideoGameSchema();''
            if (!currentSchema') return;
            
            // ゲームプレイデータを組み込んだ拡張スキーマを生成
            const enhancedSchema: VideoGameSchema = { ...currentSchema,
                // ゲームプレイ統計を追加'
                additionalProperty: [{''
                        "@type": "PropertyValue","";
                        "name": "currentHighScore","";
                        "value": gameplayData.score || 0 }
                    },"
                    { ""
                        "@type": "PropertyValue", "";
                        "name": "totalBubblesPopped","";
                        "value": gameplayData.bubblesPopped || 0 }
                    },"
                    { ""
                        "@type": "PropertyValue","";
                        "name": "currentLevel","";
                        "value": gameplayData.level || 1 }
                    },"
                    { ""
                        "@type": "PropertyValue","";
                        "name": "playTime","";
                        "value": gameplayData.playTime || 0 }]
                    }]
                ],
                // プレイヤー活動の証拠として最終更新時刻を更新
                dateModified: new Date().toISOString(),
            };
";
            // インタラクション統計が存在する場合は追加""
            if(gameplayData.score && gameplayData.score > 0") {"
                enhancedSchema.interactionStatistic = {""
                    "@type": "InteractionCounter","";
                    "interactionType": "http://schema.org/PlayAction",";
            }"
                    "userInteractionCount": gameplayData.bubblesPopped || 0 }
                };
            }
";
            // 動的にスキーマを更新""
            await this._updateSchemaInDOM('VideoGame', enhancedSchema');'
'';
            seoLogger.info('Gameplay data updated in structured data', gameplayData);''
        } catch (error') { ' }'
            seoErrorHandler.handle(error as Error, 'updateGameplayData', { gameplayData });
        }
    }

    /**
     * DOM内の特定のスキーマを更新'
     */''
    private async _updateSchemaInDOM(schemaType: string, newSchema: BaseSchema'): Promise<void> { try {'
            // 既存のスクリプトタグを検索''
            const existingScript = document.querySelector(`script[type="application/ld+json"][data-schema="${schemaType")"]`);
            
            if(existingScript) {
            
                // 既存のスキーマを更新
            
            }"
                existingScript.textContent = JSON.stringify(newSchema, null, 2);" }"
                seoLogger.debug(`Updated ${schemaType) schema in DOM`"});"
            } else {  // 新しいスクリプトタグを作成""
                const scriptTag = document.createElement('script'');''
                scriptTag.type = 'application/ld+json';''
                scriptTag.setAttribute('data-schema', schemaType);''
                scriptTag.textContent = JSON.stringify(newSchema, null, 2');
                ';
                // 構造化データ注入ポイントに追加''
                const injectionPoint = document.getElementById('structured-data-injection-point');
                if (injectionPoint) { }
                    injectionPoint.appendChild(scriptTag); }
                    seoLogger.debug(`Added ${schemaType) schema to DOM`});
                } else {  // フォールバック: headに追加 }
                    document.head.appendChild(scriptTag); }
                    seoLogger.debug(`Added ${schemaType) schema to head`});'
                }''
            } catch (error') { ' }'
            seoErrorHandler.handle(error as Error, '_updateSchemaInDOM', { schemaType });
        }
    }
    
    /**
     * VideoGameスキーマの生成
     */
    async generateVideoGameSchema(context: StructuredDataContext = {}): Promise<VideoGameSchema | null> { try { }
            const cacheKey = `videoGame_${this.currentLang}`;
            
            if(this.schemaCache.has(cacheKey) {
            ';
                ';
            }'
                return this.schemaCache.get(cacheKey') as VideoGameSchema; }
            }
            ';
            const schema: VideoGameSchema = { ''
                '@context': 'https://schema.org','';
                '@type': 'VideoGame','';
                name: this._getLocalizedText('game.name', SEOConfig.structuredData.game.name'),'';
                description: this._getLocalizedText('game.description', 'HTML5 Canvas を使用したバブルポップゲーム'),'';
                url: getLocalizedUrl(this.currentLang'),'';
                image: getSocialImageUrl('openGraph'),
                applicationCategory: SEOConfig.structuredData.game.applicationCategory,
                operatingSystem: SEOConfig.structuredData.game.operatingSystem,
                genre: SEOConfig.structuredData.game.genre,
                inLanguage: SEOConfig.structuredData.game.inLanguage,
                isAccessibleForFree: SEOConfig.structuredData.game.isAccessibleForFree }
            },
            
            this.schemaCache.set(cacheKey, schema);'
            return schema;''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'generateVideoGameSchema', context);
            return null; }
        }
    }
    
    /**
     * Organizationスキーマの生成'
     */''
    async generateOrganizationSchema(context: StructuredDataContext = {}'): Promise<OrganizationSchema | null> { try {'
            const schema: OrganizationSchema = {''
                '@context': 'https://schema.org','';
                '@type': 'Organization',
                name: SEOConfig.structuredData.organization.name,
                url: SEOConfig.structuredData.organization.url,
                logo: SEOConfig.structuredData.organization.logo,
                sameAs: SEOConfig.structuredData.organization.sameAs }
            },
            ';
            return schema;''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'generateOrganizationSchema', context);
            return null; }
        }
    }
    
    /**
     * WebApplicationスキーマの生成'
     */''
    async generateWebApplicationSchema(context: StructuredDataContext = {}'): Promise<WebApplicationSchema | null> { try {'
            const schema: WebApplicationSchema = {''
                '@context': 'https://schema.org','';
                '@type': 'WebApplication','';
                name: this._getLocalizedText('app.name', SEOConfig.siteName'),'';
                description: this._getLocalizedText('app.description', 'BubblePop Web Application''),
                url: this.baseUrl,';
                applicationCategory: SEOConfig.structuredData.webApplication.applicationCategory,'';
                operatingSystem: ['Any'],
                browserRequirements: SEOConfig.structuredData.webApplication.browserRequirements }
            },
            ';
            return schema;''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'generateWebApplicationSchema', context);
            return null; }
        }
    }
    
    /**
     * BreadcrumbListスキーマの生成
     */'
    async generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): Promise<BreadcrumbListSchema | null> { try {''
            const itemListElement: ListItem[] = breadcrumbs.map((crumb, index') => ({''
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.name)';
                item: crumb.url' }'
            }'),
            ';
            const schema: BreadcrumbListSchema = { ''
                '@context': 'https://schema.org','';
                '@type': 'BreadcrumbList',
                itemListElement }
            };
            ';
            return schema;''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'generateBreadcrumbSchema', breadcrumbs);
            return null; }
        }
    }
    
    /**
     * Eventスキーマの生成
     */
    async generateEventSchema(eventData: { name: string,
        description: string,
        startDate: string,);
        endDate: string);
        location: string; }
    }): Promise<EventSchema | null>;'
        try { const organizer = await this.generateOrganizationSchema();''
            if (!organizer') return null;
            ';
            const schema: EventSchema = {''
                '@context': 'https://schema.org','';
                '@type': 'Event',
                name: eventData.name,
                description: eventData.description,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                location: eventData.location,
                organizer: organizer }
            },
            ';
            return schema;''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'generateEventSchema', eventData);
            return null; }
        }
    }
    
    /**
     * スキーマ生成関数の登録'
     */''
    private _registerSchemaGenerators('')';
        this.schemas.set('videoGame', this.generateVideoGameSchema.bind(this)');''
        this.schemas.set('organization', this.generateOrganizationSchema.bind(this)');''
        this.schemas.set('webApplication', this.generateWebApplicationSchema.bind(this);
    }
    
    /**
     * ローカライズされたテキストの取得
     */
    private _getLocalizedText(key: string, fallback: string): string { if (this.localizationManager) {
            return this.localizationManager.t(key, fallback); }
        }
        return fallback;
    }
    
    /**
     * キャッシュのクリア
     */'
    clearCache(): void { ''
        this.schemaCache.clear('')';
        seoLogger.info('StructuredDataEngine cache cleared'); }
    }
    
    /**
     * リソースのクリーンアップ
     */'
    cleanup(): void { this.schemas.clear();''
        this.schemaCache.clear('')';
        seoLogger.info('StructuredDataEngine cleaned up''); }'
    }''
}