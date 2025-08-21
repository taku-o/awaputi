/**
 * ソーシャルメディア最適化クラス
 * 
 * プラットフォーム別の最適化画像生成と共有コンテンツ管理
 */
import { SEOConfig, getSocialImageUrl  } from './SEOConfig';
import { seoLogger  } from './SEOLogger';
import { seoErrorHandler  } from './SEOErrorHandler';
import { optimizeImageUrl, 
    truncateText,
    measurePerformance,
    generateCacheKey '  }'

} from './SEOUtils';

// プラットフォーム仕様インターフェース
interface PlatformSpec {
    imageSize: { widt,h: number, height: number,
    titleLimit: number;
    },
    descriptionLimit: number,
    imageFormats: string[],
    cacheBustParam: string;
    defaultImage?: string;
}

// 基本コンテンツインターフェース
interface BaseContent { title?: string,
    description?: string;
    image?: string;
    url?: string;
    hashtags?: string[];
    gameState?: GameState;
    imageVariant?: string;
    forceRefresh?: boolean;
    facebookAppId?: string;

// ゲーム状態インターフェース
interface GameState { score?: number,
    level?: number;
    bubblesPopped?: number;
    achievements?: Achievement[];
    combo?: number;
    playTime?: number;
    highScore?: boolean;
    achievement?: string;

// 実績インターフェース
interface Achievement { name: string;
    description?: string;
    unlockedAt?: Date;

// 最適化されたコンテンツインターフェース
interface OptimizedContent { platform: string,
    title: string,
    description: string,
    image: string,
    url: string,
    hashtags: string[],
    metadata: PlatformMetadata;
    twitterCard?: TwitterCardData;
    facebookSpecific?: FacebookData;
    discordEmbed?: DiscordEmbed;
    tweetText?: string }

// プラットフォームメタデータインターフェース
interface PlatformMetadata { imageWidth: number,
    imageHeight: number,
    platform: string,
    generatedAt: string;
    cardType?: string;
    site?: string;
    type?: string;
    locale?: string;
    richPins?: boolean }

// Twitter固有データインターフェース
interface TwitterCardData { ''
    card: 'summary' | 'summary_large_image' | 'app' | 'player,
    site: string,
    creator: string;

// Facebook固有データインターフェース
interface FacebookData { appId?: string,
    type: string,
    locale: string;

// Discord Embedインターフェース
interface DiscordEmbed { title: string,
    description: string,
    color: number;
    thumbnail?: { url: string;
    fields?: DiscordField[];
    }

// Discord Fieldインターフェース
interface DiscordField { name: string,
    value: string,
    inline: boolean;

// 共有コンテンツインターフェース（Twitter用）
interface TwitterShareContent { text: string,
    url: string,
    hashtags: string[],
    imageUrl: string;

// 共有コンテンツインターフェース（Facebook用）
interface FacebookShareContent { title: string,
    description: string,
    url: string,
    imageUrl: string;
    quote?: string;

// 共有コンテンツインターフェース（LINE用）
interface LineShareContent { message: string,
    url: string;

// 共有コンテンツインターフェース（Discord用）
interface DiscordShareContent { embeds: DiscordEmbed[];

// フォールバック共有コンテンツインターフェース
interface FallbackShareContent { title: string,
    description: string,
    url: string,
    text: string,
    imageUrl: string;

// LocalizationManagerインターフェース
interface LocalizationManager { getCurrentLanguage(): string,
    t(key: string, defaultValue?: string): string;

// GameConfigインターフェース
interface GameConfig { [key: string]: any;
;
// プラットフォーム名タイプ
type PlatformName = 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'discord';
    type SharePlatform = 'twitter' | 'facebook' | 'line' | 'discord';
    type SupportedLanguage = 'ja' | 'en' | 'zh-CN' | 'zh-TW' | 'ko';
    export class SocialMediaOptimizer {
    private localizationManager: LocalizationManager | null;
    private gameConfig: GameConfig | null;
    private, platformSpecs: Map<string, PlatformSpec>,
    private imageCache: Map<string, string>;
    private shareCache: Map<string, OptimizedContent>;
    private canvas: HTMLCanvasElement | null;
    private ctx: CanvasRenderingContext2D | null;
    private, initialized: boolean = false;
    constructor(localizationManager: LocalizationManager | null = null, gameConfig: GameConfig | null = null) {
    
        this.localizationManager = localizationManager;
    this.gameConfig = gameConfig;
    this.platformSpecs = new Map();
    this.imageCache = new Map();
    this.shareCache = new Map();
    this.canvas = null;
    this.ctx = null
};
        this._initialize(); }
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void { try {
            // プラットフォーム仕様の設定
            this._setupPlatformSpecs();
            // Canvas要素の作成（画像生成用）
            this._setupCanvas()','
            seoLogger.info('SocialMediaOptimizer, initialized successfully',' }'

        } catch (error) {
            seoErrorHandler.handle(error as Error, 'socialMediaOptimizerInit' }'
    }
    
    /**
     * プラットフォーム仕様の設定'
     */''
    private _setupPlatformSpecs('''
        this.platformSpecs.set('facebook', {
            imageSize: { width: 1200, height: 630  }
            titleLimit: 60','
    descriptionLimit: 155,
            imageFormats: ['jpg', 'png'],')';
            cacheBustParam: 'fb_cache')'),'
        ';'
        // Twitter
        this.platformSpecs.set('twitter', {
            imageSize: { width: 1200, height: 600  }
            titleLimit: 70','
    descriptionLimit: 200,
            imageFormats: ['jpg', 'png'],')';
            cacheBustParam: 'twitter_cache')'),'
        ';'
        // LinkedIn
        this.platformSpecs.set('linkedin', {
            imageSize: { width: 1200, height: 627  }
            titleLimit: 150','
    descriptionLimit: 300,
            imageFormats: ['jpg', 'png'],')';
            cacheBustParam: 'li_cache')'),'
        ';'
        // Pinterest
        this.platformSpecs.set('pinterest', {
            imageSize: { width: 1000, height: 1500  }
            titleLimit: 500','
    descriptionLimit: 500,
            imageFormats: ['jpg', 'png'],')';
            cacheBustParam: 'pin_cache')'),'
        ';'
        // Discord
        this.platformSpecs.set('discord', {
            imageSize: { width: 1280, height: 720  }
            titleLimit: 256','
    descriptionLimit: 2048,
            imageFormats: ['jpg', 'png', 'gif'],')';
            cacheBustParam: 'discord_cache');
    }
    
    /**
     * Canvas要素の設定'
     */''
    private _setupCanvas()';'
        if (typeof, document !== 'undefined') {

            this.canvas = document.createElement('canvas');

            this.ctx = this.canvas.getContext('2d'; }'
}
    
    /**
     * プラットフォーム別の最適化コンテンツ生成
     */
    async generateOptimizedContent(platform: string, content: BaseContent = { ): Promise<OptimizedContent> {
        try {
            const specs = this.platformSpecs.get(platform);
            if (!specs) { }
                throw new Error(`Unknown, platform: ${platform}`} }
            
            const cacheKey = generateCacheKey(`${ platform)_content`, content),
            
            // キャッシュチェック
            if (this.shareCache.has(cacheKey} && !content.forceRefresh} { }
                return, this.shareCache.get(cacheKey}!;
            }
            
            // 最適化されたコンテンツの生成
            const optimized: OptimizedContent = { platform,
                title: this._optimizeTitle(content.title, specs),
                description: this._optimizeDescription(content.description, specs);
                image: await this._optimizeImage(content, specs, platform);
                url: content.url || (typeof, window !== 'undefined' ? window.location.href : '),'
                hashtags: this._generateHashtags(content, platform),
                metadata: this._generatePlatformMetadata(content, specs, platform };
            
            // プラットフォーム固有の最適化
            await this._applyPlatformSpecificOptimizations(optimized, platform, content);
            
            // キャッシュに保存
            this.shareCache.set(cacheKey, optimized);
            ';'

            return optimized;} catch (error) { }

            return seoErrorHandler.handle(error as Error, 'generateOptimizedContent', { platform, content };

    /**
     * ゲーム状態に基づいた動的共有コンテンツを生成)
     */''
    generateShareContent(platform: SharePlatform, gameState: GameState = {}: TwitterShareContent | FacebookShareContent | LineShareContent | DiscordShareContent | FallbackShareContent { try {'
            if (!this.initialized) {

                seoLogger.warn('SocialMediaOptimizer, not initialized) }'
                return this._getFallbackShareContent(platform);
';'
            // プラットフォーム別の動的コンテンツ生成
            switch (platform.toLowerCase() as SharePlatform') { ''
                case 'twitter':','
                    return this._generateTwitterShareContent(gameState);
                case 'facebook':','
                    return this._generateFacebookShareContent(gameState);
                case 'line':','
                    return this._generateLineShareContent(gameState);
                case 'discord':,
                    return this._generateDiscordShareContent(gameState);
                default: seoLogger.warn(`Unsupported, platform: ${platform }`} }

                    return this._getFallbackShareContent(platform}
        } catch (error) { }

            seoErrorHandler.handle(error as Error, 'generateShareContent', { platform, gameState };)
            return this._getFallbackShareContent(platform);

    /**
     * Twitter用動的共有コンテンツ生成'
     */''
    private _generateTwitterShareContent(gameState: GameState): TwitterShareContent {
        const { score, level, bubblesPopped, achievements } = gameState;

        let tweetText = 'BubblePop で遊んでいます！🎮✨';
        
        if (score && score > 0) {
    
}
            tweetText = `BubblePop で ${score.toLocaleString(} 点を獲得！🎯`;
            
            if (level && level > 1) {
    
}
                tweetText += ` レベル ${level} 到達！🚀`;
            }
            
            if (bubblesPopped && bubblesPopped > 0) {
    
}
                tweetText += ` 泡を ${bubblesPopped.toLocaleString(} 個破りました！💥`;
            }
        }
        ';'
        // 実績がある場合は追加
        if (achievements && achievements.length > 0) { const recentAchievement = achievements[achievements.length - 1] }
            tweetText += ` 「${recentAchievement.name}」実績解除！🏆`;
        }

        tweetText += '\n\n#BubblePop #HTML5ゲーム #ブラウザゲーム';
        
        return { text: tweetText,

            url: this._generateGameUrl(gameState)','
            hashtags: this._generateHashtags({ gameState '), 'twitter'),' };

            imageUrl: this._selectDynamicImage(gameState, 'twitter'; }'
        }

    /**
     * Facebook用動的共有コンテンツ生成'
     */''
    private _generateFacebookShareContent(gameState: GameState): FacebookShareContent {
        const { score, level, bubblesPopped } = gameState;

        let title = 'BubblePop - 泡割りゲーム';
        let description = 'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
        
        if (score && score > 0) {
    
}
            title = `BubblePop で ${score.toLocaleString(} 点獲得！`;
            description = `レベル ${level || 1} で ${score.toLocaleString(} 点を獲得しました！`;
            
            if (bubblesPopped && bubblesPopped > 0) {
            ','

                description += ` 合計 ${bubblesPopped.toLocaleString('}'

            description += ' あなたも挑戦してみませんか？'; }
        }
        
        return {
                title
            description','
            url: this._generateGameUrl(gameState }

            imageUrl: this._selectDynamicImage(gameState, 'facebook'
            }
            quote: score && score > 0 ? `${score.toLocaleString(} 点獲得！` : undefined;

    /**
     * LINE用動的共有コンテンツ生成'
     */''
    private _generateLineShareContent(gameState: GameState): LineShareContent {
        const { score, level } = gameState;

        let message = 'BubblePop というゲームで遊んでいます！🎮';
        
        if (score && score > 0) {
    
}
            message = `BubblePop で ${score.toLocaleString(} 点獲得！🎯\nレベル ${level || 1} まで到達しました！\n一緒にやりませんか？`;
        }
        
        return { message };
            url: this._generateGameUrl(gameState); 
    }

    /**
     * Discord用動的共有コンテンツ生成'
     */''
    private _generateDiscordShareContent(gameState: GameState): DiscordShareContent {
        const { score, level, bubblesPopped, playTime } = gameState;
        ';'

        const embed: DiscordEmbed = { ''
            title: 'BubblePop - 泡割りゲーム,
            description: 'HTML5 Canvas バブルポップゲーム,
    color: 0x4CAF50  };
        if (score && score > 0) {
        ','

            embed.title = `BubblePop スコア: ${score.toLocaleString('''
                    name: 'スコア,
    value: score.toLocaleString(
         }
                    inline: true;))'
                { ''
                    name: 'レベル'),
                    value: (level || 1).toString(
    inline: true,)
            ])';'
            ')';
            if (bubblesPopped && bubblesPopped > 0) {
                embed.fields.push({ }

                    name: '破った泡'
            }
                    value: `${bubblesPopped.toLocaleString(} 個`;
                    inline: true;
                } }
            
            if (playTime && playTime > 0) {
            ','

                const minutes = Math.floor(playTime / 60000);
                const seconds = Math.floor((playTime % 60000) / 1000'),'

                embed.fields.push({ }

                    name: 'プレイ時間'
            };
                    value: `${minutes}分${seconds}秒`;)
                    inline: true);
    }
        
        return { embeds: [embed] }

    /**
     * ゲーム状態に応じた動的画像選択
     */
    private _selectDynamicImage(gameState: GameState, platform: string): string {
        const { score } = gameState;
        const specs = this.platformSpecs.get(platform);

        if (!score || score === 0) {', ' }

            return specs?.defaultImage || '/assets/social/og-image.png';
        ';'
        // スコアに基づいた画像選択
        if (score >= 100000) {', ' }

            return '/assets/social/og-image-champion.png'; }

        } else if (score >= 50000) { ''
            return '/assets/social/og-image-expert.png',' }'

        } else if (score >= 10000) { ''
            return '/assets/social/og-image-pro.png', else { }

            return '/assets/social/og-image-beginner.png';

    /**
     * ゲーム状態を含むURLを生成'
     */ : undefined''
    private _generateGameUrl(gameState: GameState): string { ''
        if (typeof, window === 'undefined') {', ' }

            return 'https: //example.com', // サーバーサイドレンダリング用フォールバック }'
        }
        
        const baseUrl = window.location.origin + window.location.pathname;
        const { score, level } = gameState;

        if (score && score > 0) {
            const params = new URLSearchParams({''
                utm_source: 'social_share,
                utm_medium: 'share',','
                utm_campaign: 'gameplay_share,
    score: score.toString(  }
                level: (level || 1).toString();
    };
            return `${baseUrl}? ${params.toString(}`;
        }
        
        return baseUrl;
    }

    /**
     * フォールバック共有コンテンツ'
     */ : undefined''
    private _getFallbackShareContent(platform: string): FallbackShareContent { return { ''
            title: 'BubblePop - 泡割りゲーム,
            description: 'HTML5 Canvas を使用したバブルポップゲーム,
            url: typeof window !== 'undefined' ? window.location.href : 'https://example.com,
            text: 'BubblePop で遊んでいます！ 🎮',' };'

            imageUrl: '/assets/social/og-image.png' 
    }
    
    /**
     * 動的ソーシャル画像の生成'
     */''
    async generateDynamicSocialImage(gameState: GameState, platform: PlatformName = 'facebook': Promise<string> { ''
        if (!this.canvas || !this.ctx) {

            seoLogger.warn('Canvas, not available, for dynamic, image generation');

            return getSocialImageUrl(platform, 'default);'
        
        try { const specs = this.platformSpecs.get(platform);
            if (!specs) { }
                throw new Error(`Unknown, platform: ${platform}`}
            }
            
            const { width, height } = specs.imageSize;
            
            // Canvasサイズの設定
            this.canvas.width = width;
            this.canvas.height = height;
            
            // 背景の描画
            await this._drawBackground();
            
            // ゲーム状態に基づくコンテンツの描画
            await this._drawGameContent(gameState);
            // オーバーレイ（ロゴ、タイトル等）の描画
            await this._drawOverlay(gameState, platform);
            ';'
            // 画像をData URLとして取得
            const dataUrl = this.canvas.toDataURL('image/png', 0.9);
            
            // キャッシュに保存
            const cacheKey = generateCacheKey(`dynamic_${ platform}`, gameState}
            this.imageCache.set(cacheKey, dataUrl};
            ';'

            return dataUrl;} catch (error) {
            seoLogger.error('Dynamic social image generation failed', error as Error','
            return getSocialImageUrl(platform, 'default,
    
    /**
     * タイトルの最適化
     */'
    private _optimizeTitle(title: string | undefined, specs: PlatformSpec): string { ''
        if (!title) {
            title = this.localizationManager ? undefined : undefined','
                this.localizationManager.t('seo.defaultTitle') : '
}

                'BubblePop - 泡割りゲーム'; }
        }
        
        return truncateText(title, specs.titleLimit);
    }
    
    /**
     * 説明文の最適化
     */'
    private _optimizeDescription(description: string | undefined, specs: PlatformSpec): string { ''
        if (!description) {
            description = this.localizationManager ? undefined : undefined','
                this.localizationManager.t('seo.defaultDescription') : ' }'

                'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！'; }
        }
        
        return truncateText(description, specs.descriptionLimit);
    }
    
    /**
     * 画像の最適化
     */
    private async _optimizeImage(content: BaseContent, specs: PlatformSpec, platform: string): Promise<string> { // カスタム画像が指定されている場合
        if (content.image) {
            return optimizeImageUrl(content.image, {
                width: specs.imageSize.width),
                height: specs.imageSize.height,
    format: specs.imageFormats[0]
         }
            );
        }
        
        // ゲーム状態に基づく動的画像
        if (content.gameState) { }

            return await this.generateDynamicSocialImage(content.gameState, platform as PlatformName);
        ';'
        // デフォルト画像
        return getSocialImageUrl(platform, content.imageVariant || 'default';
    }
    
    /**
     * ハッシュタグの生成'
     */''
    private _generateHashtags(content: BaseContent, platform: string): string[] { const baseHashtags: Record<SupportedLanguage, string[]> = {''
            ja: ['#バブルポップ', '#HTML5ゲーム', '#ブラウザゲーム', '#無料ゲーム],'
            en: ['#BubblePop', '#HTML5Game', '#BrowserGame', '#FreeGame],'
            'zh-CN': ['#泡泡消除', '#HTML5游戏', '#浏览器游戏', '#免费游戏],'
            'zh-TW': ['#泡泡消除', '#HTML5遊戲', '#瀏覽器遊戲', '#免費遊戲],'
            ko: ['#버블팝', '#HTML5게임', '#브라우저게임', '#무료게임] };'
        ';'

        const lang = (this.localizationManager ? undefined : undefined';'
            this.localizationManager.getCurrentLanguage() : 'ja') as SupportedLanguage;
        
        let hashtags = baseHashtags[lang] || baseHashtags.ja;
        
        // コンテンツ固有のハッシュタグ
        if (content.hashtags) { hashtags = [...hashtags, ...content.hashtags],
        
        // ゲーム状態に基づくハッシュタグ
        if (content.gameState) {

            if (content.gameState.highScore) {
        }

                hashtags.push(lang === 'ja' ? '#ハイスコア' : '#HighScore'; 
    }''
            if (content.gameState.achievement) {', ' }

                hashtags.push(lang === 'ja' ? '#実績解除' : '#Achievement); '
    }
        
        // プラットフォーム別の制限
        const limits: Record<string, number> = { twitter: 2, // Twitterは少なめに
            instagram: 10,
            facebook: 5,
            linkedin: 3,
    pinterest: 10  ,
        const limit = limits[platform] || 5;
        return hashtags.slice(0, limit);
    }
    
    /**
     * プラットフォームメタデータの生成
     */
    private _generatePlatformMetadata(content: BaseContent, specs: PlatformSpec, platform: string): PlatformMetadata { const metadata: PlatformMetadata = {
            imageWidth: specs.imageSize.width,
    imageHeight: specs.imageSize.height,
            platform,
            generatedAt: new Date().toISOString(  ,
        // プラットフォーム固有のメタデータ
        switch(platform) {

            case 'twitter':','
                metadata.cardType = 'summary_large_image,
                metadata.site = '@BubblePopGame', // 実際のアカウントに変更
                break,
            case 'facebook':','
                metadata.type = 'website,
                metadata.locale = this._getOGLocale('''
            case 'linkedin': ','
                metadata.type = 'article,

                break,
            case 'pinterest':,
                metadata.richPins = true }
                break; }
        }
        
        return, metadata;
    }
    
    /**
     * プラットフォーム固有の最適化の適用)
     */''
    private async _applyPlatformSpecificOptimizations(optimized: OptimizedContent, platform: string, content: BaseContent): Promise<void>,
        switch(platform) {

            case 'twitter':,
                // Twitterカード情報の追加
                optimized.twitterCard = {''
                    card: 'summary_large_image,
                    site: '@BubblePopGame' }

                    creator: '@BubblePopGame' 
    };
                // Twitter用の短縮文の作成
                if (content.gameState?.score) {

                    optimized.tweetText = `BubblePopで${content.gameState.score.toLocaleString('''
            case 'facebook':,
                // Facebook用の詳細情報
                optimized.facebookSpecific = {
                    appId: content.facebookAppId,
                    type: 'game,
                    locale: this._getOGLocale(',
            case 'pinterest':','
                // Pinterest用の豊富な説明'
            }
                optimized.description = this._expandDescriptionForPinterest(optimized.description, content};
                break

            case 'discord':
                // Discord Embed用の情報
                optimized.discordEmbed = {
                    title: optimized.title,
    description: optimized.description }
                    color: 0x4CAF50, // ゲームのテーマカラー }
                    thumbnail: { url: optimized.image }
                    fields: this._generateDiscordFields(content);
                };
                break;
        }
    }
    
    /**
     * 背景の描画
     */
    private async _drawBackground(): Promise<void>;
        if (!this.ctx || !this.canvas) return;
        // グラデーション背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2E7D32);'
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パターンやテクスチャの追加（オプション）
        await this._drawBackgroundPattern();
    }
    
    /**
     * 背景パターンの描画
     */
    private async _drawBackgroundPattern(): Promise<void>;
        if(!this.ctx || !this.canvas) return;
        
        // 泡のパターンを描画
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = '#FFFFFF';
        
        for(let, i = 0; i < 20; i++) {
        
            const x = Math.random() * this.canvas.width,
            const y = Math.random() * this.canvas.height,
            const radius = Math.random() * 30 + 10,
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill(); }
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * ゲームコンテンツの描画
     */'
    private async _drawGameContent(gameState: GameState): Promise<void>,
        if(!this.ctx || !this.canvas || !gameState) return;

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        
        // スコアの表示
        if (gameState.score) {
    
}
            const scoreText = `Score: ${gameState.score.toLocaleString(},
            this.ctx.fillText(scoreText, this.canvas.width / 2, this.canvas.height / 2);
        }
        ;
        // 実績の表示
        if (gameState.achievement) {

            this.ctx.font = 'bold 24px Arial, sans-serif' }
            this.ctx.fillText(gameState.achievement, this.canvas.width / 2, this.canvas.height / 2 + 60); }
        }
        ';'
        // コンボの表示
        if (gameState.combo && gameState.combo > 10) {', ' }

            this.ctx.font = 'bold 32px Arial, sans-serif'; }
            this.ctx.fillText(`${gameState.combo} Combo!`, this.canvas.width / 2, this.canvas.height / 2 + 100    }
}
    /**
     * オーバーレイの描画
     */'
    private async _drawOverlay(gameState: GameState, platform: string): Promise<void>,
        if(!this.ctx || !this.canvas) return;
        ';'
        // タイトルの描画
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 64px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#2E7D32';
        this.ctx.lineWidth = 4;

        const title = 'BubblePop';

        this.ctx.strokeText(title, this.canvas.width / 2, 80);
        this.ctx.fillText(title, this.canvas.width / 2, 80);
        ';'
        // プラットフォーム固有の要素
        if (platform === 'pinterest') {
            // Pinterest用の詳細情報
            this.ctx.font = '16px Arial, sans-serif' }

            this.ctx.fillText('無料で遊べるブラウザゲーム', this.canvas.width / 2, this.canvas.height - 30'; }'
}
    
    /**
     * Pinterest用の詳細説明'
     */''
    private _expandDescriptionForPinterest(description: string, content: BaseContent): string { let expanded = description,
        
        // ゲーム機能の詳細を追加
        const features = [','
            '18種類以上の特殊な泡,
            'コンボシステム,
            '実績システム',]','
            '無料でプレイ可能'],
        ],

        ' }'

        expanded += '\n\n特徴:\n' + features.map(f => `• ${f}`}.join('\n'});
        
        return expanded;
    }
    
    /**
     * Discord用フィールドの生成
     */
    private _generateDiscordFields(content: BaseContent): DiscordField[] { const fields: DiscordField[] = [],

        if (content.gameState?.score) {
            fields.push({ : undefined)'
                name: 'スコア,
    value: content.gameState.score.toLocaleString(
         }
                inline: true;));

        ')';
        if (content.gameState?.combo) {
            fields.push({ : undefined'
        
                name: 'コンボ'
            }''
                value: `${content.gameState.combo}連続`;')'
                inline: true');'
        }
        ';'

        fields.push({ ''
            name: 'プラットフォーム',','
            value: 'ブラウザ（無料）'),
            inline: true','
        return fields  }
    
    /**
     * Open Graphロケールの取得
     */'
    private _getOGLocale(): string { const lang = this.localizationManager ? undefined : undefined''
            this.localizationManager.getCurrentLanguage() : 'ja,
        ','

        const localeMap: Record<string, string> = {', 'ja': 'ja_JP','
            'en': 'en_US,
            'zh-CN': 'zh_CN,
            'zh-TW': 'zh_TW,
            'ko': 'ko_KR' };

        return localeMap[lang] || 'ja_JP';
    }
    
    /**
     * キャッシュバスティングURLの生成
     */
    generateCacheBustingUrl(originalUrl: string, platform: string): string { const specs = this.platformSpecs.get(platform);
        if (!specs) return originalUrl,
        
        const url = new URL(originalUrl);
        url.searchParams.set(specs.cacheBustParam, Date.now().toString();
        return url.toString();
    
    /**
     * すべてのプラットフォーム用のコンテンツ生成
     */
    async generateAllPlatformContent(content: BaseContent = { ): Promise<Record<string, OptimizedContent | null>> { }
        const results: Record<string, OptimizedContent | null> = {};
        
        for (const platform of this.platformSpecs.keys() {
        
            try {
    
}
                results[platform] = await this.generateOptimizedContent(platform, content); }
        } catch (error) {
                seoLogger.error(`Failed to generate ${platform} content`, error as Error);
                results[platform] = null;
            }
        }
        
        return results;
    }
    
    /**
     * 共有URLの生成'
     */''
    generateShareUrl(platform: string, content: Partial<OptimizedContent>): string { const baseUrls: Record<string, string> = {''
            facebook: 'https://www.facebook.com/sharer/sharer.php,
            twitter: 'https://twitter.com/intent/tweet,
            linkedin: 'https://www.linkedin.com/sharing/share-offsite/,
            pinterest: 'https://pinterest.com/pin/create/button/,
            reddit: 'https://reddit.com/submit  };'
        ';'

        const baseUrl = baseUrls[platform];
        if(!baseUrl) return content.url || ';'
        
        const params = new URLSearchParams();

        switch(platform) {

            case 'facebook':','
                if(content.url) params.set('u', content.url','

                break,
            case 'twitter':','
                if(content.title) params.set('text', content.title','
                if(content.url) params.set('url', content.url','
                if (content.hashtags) {
        }

                    params.set('hashtags', content.hashtags.map(h => h.replace('#', ')'.join(')'; }
                }

                break;
            case 'linkedin':';'
                if(content.url) params.set('url', content.url';'

                break;
            case 'pinterest':';'
                if(content.url) params.set('url', content.url';'
                if(content.image) params.set('media', content.image';'
                if(content.description) params.set('description', content.description';'

                break;
            case 'reddit':';'
                if(content.url) params.set('url', content.url';'
                if(content.title) params.set('title', content.title);
                break;
        }
        
        return `${baseUrl}? ${params.toString(}`;
    }
    
    /**
     * キャッシュのクリア
     */ : undefined'
    clearCache(): void { this.imageCache.clear();
        this.shareCache.clear()','
        seoLogger.info('Social, media cache, cleared' }'
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void { this.clearCache();
        this.platformSpecs.clear();
        if (this.canvas) {
            this.canvas = null }
            this.ctx = null; }
        }

        seoLogger.info('SocialMediaOptimizer, cleaned up');

    }'}'