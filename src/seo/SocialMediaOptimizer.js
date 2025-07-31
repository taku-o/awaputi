/**
 * ソーシャルメディア最適化クラス
 * 
 * プラットフォーム別の最適化画像生成と共有コンテンツ管理
 */
import { SEOConfig, getSocialImageUrl } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';
import { 
    optimizeImageUrl, 
    truncateText, 
    measurePerformance,
    generateCacheKey 
} from './SEOUtils.js';

export class SocialMediaOptimizer {
    constructor(localizationManager = null, gameConfig = null) {
        this.localizationManager = localizationManager;
        this.gameConfig = gameConfig;
        this.platformSpecs = new Map();
        this.imageCache = new Map();
        this.shareCache = new Map();
        this.canvas = null;
        this.ctx = null;
        
        this._initialize();
    }
    
    /**
     * 初期化処理
     * @private
     */
    _initialize() {
        try {
            // プラットフォーム仕様の設定
            this._setupPlatformSpecs();
            
            // Canvas要素の作成（画像生成用）
            this._setupCanvas();
            
            seoLogger.info('SocialMediaOptimizer initialized successfully');
        } catch (error) {
            seoErrorHandler.handle(error, 'socialMediaOptimizerInit');
        }
    }
    
    /**
     * プラットフォーム仕様の設定
     * @private
     */
    _setupPlatformSpecs() {
        // Facebook/Open Graph
        this.platformSpecs.set('facebook', {
            imageSize: { width: 1200, height: 630 },
            titleLimit: 60,
            descriptionLimit: 155,
            imageFormats: ['jpg', 'png'],
            cacheBustParam: 'fb_cache'
        });
        
        // Twitter
        this.platformSpecs.set('twitter', {
            imageSize: { width: 1200, height: 600 },
            titleLimit: 70,
            descriptionLimit: 200,
            imageFormats: ['jpg', 'png'],
            cacheBustParam: 'twitter_cache'
        });
        
        // LinkedIn
        this.platformSpecs.set('linkedin', {
            imageSize: { width: 1200, height: 627 },
            titleLimit: 150,
            descriptionLimit: 300,
            imageFormats: ['jpg', 'png'],
            cacheBustParam: 'li_cache'
        });
        
        // Pinterest
        this.platformSpecs.set('pinterest', {
            imageSize: { width: 1000, height: 1500 },
            titleLimit: 500,
            descriptionLimit: 500,
            imageFormats: ['jpg', 'png'],
            cacheBustParam: 'pin_cache'
        });
        
        // Discord
        this.platformSpecs.set('discord', {
            imageSize: { width: 1280, height: 720 },
            titleLimit: 256,
            descriptionLimit: 2048,
            imageFormats: ['jpg', 'png', 'gif'],
            cacheBustParam: 'discord_cache'
        });
    }
    
    /**
     * Canvas要素の設定
     * @private
     */
    _setupCanvas() {
        if (typeof document !== 'undefined') {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }
    }
    
    /**
     * プラットフォーム別の最適化コンテンツ生成
     * @param {string} platform 
     * @param {Object} content 
     * @returns {Promise<Object>}
     */
    @measurePerformance('SocialMediaOptimizer')
    async generateOptimizedContent(platform, content = {}) {
        try {
            const specs = this.platformSpecs.get(platform);
            if (!specs) {
                throw new Error(`Unknown platform: ${platform}`);
            }
            
            const cacheKey = generateCacheKey(`${platform}_content`, content);
            
            // キャッシュチェック
            if (this.shareCache.has(cacheKey) && !content.forceRefresh) {
                return this.shareCache.get(cacheKey);
            }
            
            // 最適化されたコンテンツの生成
            const optimized = {
                platform,
                title: this._optimizeTitle(content.title, specs),
                description: this._optimizeDescription(content.description, specs),
                image: await this._optimizeImage(content, specs, platform),
                url: content.url || window.location.href,
                hashtags: this._generateHashtags(content, platform),
                metadata: this._generatePlatformMetadata(content, specs, platform)
            };
            
            // プラットフォーム固有の最適化
            await this._applyPlatformSpecificOptimizations(optimized, platform, content);
            
            // キャッシュに保存
            this.shareCache.set(cacheKey, optimized);
            
            return optimized;
        } catch (error) {
            return seoErrorHandler.handle(error, 'generateOptimizedContent', { platform, content });
        }
    }

    /**
     * ゲーム状態に基づいた動的共有コンテンツを生成
     * @param {string} platform - プラットフォーム名 ('twitter', 'facebook', 'line', 'discord')
     * @param {Object} gameState - ゲーム状態データ
     * @returns {Object} 動的共有コンテンツ
     */
    generateShareContent(platform, gameState = {}) {
        try {
            if (!this.initialized) {
                seoLogger.warn('SocialMediaOptimizer not initialized');
                return this._getFallbackShareContent(platform);
            }

            const { score, level, bubblesPopped, achievements } = gameState;
            
            // プラットフォーム別の動的コンテンツ生成
            switch (platform.toLowerCase()) {
                case 'twitter':
                    return this._generateTwitterShareContent(gameState);
                
                case 'facebook':
                    return this._generateFacebookShareContent(gameState);
                
                case 'line':
                    return this._generateLineShareContent(gameState);
                
                case 'discord':
                    return this._generateDiscordShareContent(gameState);
                
                default:
                    seoLogger.warn(`Unsupported platform: ${platform}`);
                    return this._getFallbackShareContent(platform);
            }
        } catch (error) {
            seoErrorHandler.handle(error, 'generateShareContent', { platform, gameState });
            return this._getFallbackShareContent(platform);
        }
    }

    /**
     * Twitter用動的共有コンテンツ生成
     * @param {Object} gameState - ゲーム状態
     * @returns {Object} Twitter共有コンテンツ
     */
    _generateTwitterShareContent(gameState) {
        const { score, level, bubblesPopped, achievements } = gameState;
        
        let tweetText = 'BubblePop で遊んでいます！🎮✨';
        
        if (score > 0) {
            tweetText = `BubblePop で ${score.toLocaleString()} 点を獲得！🎯`;
            
            if (level > 1) {
                tweetText += ` レベル ${level} 到達！🚀`;
            }
            
            if (bubblesPopped > 0) {
                tweetText += ` 泡を ${bubblesPopped.toLocaleString()} 個破りました！💥`;
            }
        }
        
        // 実績がある場合は追加
        if (achievements && achievements.length > 0) {
            const recentAchievement = achievements[achievements.length - 1];
            tweetText += ` 「${recentAchievement.name}」実績解除！🏆`;
        }
        
        tweetText += '\n\n#BubblePop #HTML5ゲーム #ブラウザゲーム';
        
        return {
            text: tweetText,
            url: this._generateGameUrl(gameState),
            hashtags: this._generateHashtags(gameState),
            imageUrl: this._selectDynamicImage(gameState, 'twitter')
        };
    }

    /**
     * Facebook用動的共有コンテンツ生成
     * @param {Object} gameState - ゲーム状態
     * @returns {Object} Facebook共有コンテンツ
     */
    _generateFacebookShareContent(gameState) {
        const { score, level, bubblesPopped } = gameState;
        
        let title = 'BubblePop - 泡割りゲーム';
        let description = 'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
        
        if (score > 0) {
            title = `BubblePop で ${score.toLocaleString()} 点獲得！`;
            description = `レベル ${level || 1} で ${score.toLocaleString()} 点を獲得しました！`;
            
            if (bubblesPopped > 0) {
                description += ` 合計 ${bubblesPopped.toLocaleString()} 個の泡を破りました。`;
            }
            
            description += ' あなたも挑戦してみませんか？';
        }
        
        return {
            title,
            description,
            url: this._generateGameUrl(gameState),
            imageUrl: this._selectDynamicImage(gameState, 'facebook'),
            quote: score > 0 ? `${score.toLocaleString()} 点獲得！` : undefined
        };
    }

    /**
     * LINE用動的共有コンテンツ生成
     * @param {Object} gameState - ゲーム状態
     * @returns {Object} LINE共有コンテンツ
     */
    _generateLineShareContent(gameState) {
        const { score, level } = gameState;
        
        let message = 'BubblePop というゲームで遊んでいます！🎮';
        
        if (score > 0) {
            message = `BubblePop で ${score.toLocaleString()} 点獲得！🎯\nレベル ${level || 1} まで到達しました！\n一緒にやりませんか？`;
        }
        
        return {
            message,
            url: this._generateGameUrl(gameState)
        };
    }

    /**
     * Discord用動的共有コンテンツ生成
     * @param {Object} gameState - ゲーム状態
     * @returns {Object} Discord共有コンテンツ
     */
    _generateDiscordShareContent(gameState) {
        const { score, level, bubblesPopped, playTime } = gameState;
        
        const embed = {
            title: 'BubblePop - 泡割りゲーム',
            description: 'HTML5 Canvas バブルポップゲーム',
            color: 0x4CAF50,
            url: this._generateGameUrl(gameState),
            image: {
                url: this._selectDynamicImage(gameState, 'discord')
            },
            timestamp: new Date().toISOString()
        };
        
        if (score > 0) {
            embed.title = `BubblePop スコア: ${score.toLocaleString()} 点！`;
            embed.fields = [
                {
                    name: 'スコア',
                    value: score.toLocaleString(),
                    inline: true
                },
                {
                    name: 'レベル',
                    value: level || 1,
                    inline: true
                }
            ];
            
            if (bubblesPopped > 0) {
                embed.fields.push({
                    name: '破った泡',
                    value: `${bubblesPopped.toLocaleString()} 個`,
                    inline: true
                });
            }
            
            if (playTime > 0) {
                const minutes = Math.floor(playTime / 60000);
                const seconds = Math.floor((playTime % 60000) / 1000);
                embed.fields.push({
                    name: 'プレイ時間',
                    value: `${minutes}分${seconds}秒`,
                    inline: true
                });
            }
        }
        
        return { embeds: [embed] };
    }

    /**
     * ゲーム状態に応じた動的画像選択
     * @param {Object} gameState - ゲーム状態
     * @param {string} platform - プラットフォーム
     * @returns {string} 画像URL
     */
    _selectDynamicImage(gameState, platform) {
        const { score } = gameState;
        const specs = this.platformSpecs[platform];
        
        if (!score || score === 0) {
            return specs?.defaultImage || '/assets/social/og-image.png';
        }
        
        // スコアに基づいた画像選択
        if (score >= 100000) {
            return '/assets/social/og-image-champion.png';
        } else if (score >= 50000) {
            return '/assets/social/og-image-expert.png';
        } else if (score >= 10000) {
            return '/assets/social/og-image-pro.png';
        } else {
            return '/assets/social/og-image-beginner.png';
        }
    }

    /**
     * ゲーム状態を含むURLを生成
     * @param {Object} gameState - ゲーム状態
     * @returns {string} ゲームURL
     */
    _generateGameUrl(gameState) {
        const baseUrl = window.location.origin + window.location.pathname;
        const { score, level } = gameState;
        
        if (score > 0) {
            const params = new URLSearchParams({
                utm_source: 'social_share',
                utm_medium: 'share',
                utm_campaign: 'gameplay_share',
                score: score.toString(),
                level: (level || 1).toString()
            });
            return `${baseUrl}?${params.toString()}`;
        }
        
        return baseUrl;
    }

    /**
     * フォールバック共有コンテンツ
     * @param {string} platform - プラットフォーム
     * @returns {Object} フォールバック共有コンテンツ
     */
    _getFallbackShareContent(platform) {
        return {
            title: 'BubblePop - 泡割りゲーム',
            description: 'HTML5 Canvas を使用したバブルポップゲーム',
            url: window.location.href,
            text: 'BubblePop で遊んでいます！ 🎮',
            imageUrl: '/assets/social/og-image.png'
        };
    }
    
    /**
     * 動的ソーシャル画像の生成
     * @param {Object} gameState 
     * @param {string} platform 
     * @returns {Promise<string>}
     */
    async generateDynamicSocialImage(gameState, platform = 'facebook') {
        if (!this.canvas || !this.ctx) {
            seoLogger.warn('Canvas not available for dynamic image generation');
            return getSocialImageUrl(platform, 'default');
        }
        
        try {
            const specs = this.platformSpecs.get(platform);
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
            
            // 画像をData URLとして取得
            const dataUrl = this.canvas.toDataURL('image/png', 0.9);
            
            // キャッシュに保存
            const cacheKey = generateCacheKey(`dynamic_${platform}`, gameState);
            this.imageCache.set(cacheKey, dataUrl);
            
            return dataUrl;
        } catch (error) {
            seoLogger.error('Dynamic social image generation failed', error);
            return getSocialImageUrl(platform, 'default');
        }
    }
    
    /**
     * タイトルの最適化
     * @private
     */
    _optimizeTitle(title, specs) {
        if (!title) {
            title = this.localizationManager ? 
                this.localizationManager.t('seo.defaultTitle') : 
                'BubblePop - 泡割りゲーム';
        }
        
        return truncateText(title, specs.titleLimit);
    }
    
    /**
     * 説明文の最適化
     * @private
     */
    _optimizeDescription(description, specs) {
        if (!description) {
            description = this.localizationManager ? 
                this.localizationManager.t('seo.defaultDescription') : 
                'HTML5 Canvas を使用したバブルポップゲーム。泡を割って高スコアを目指そう！';
        }
        
        return truncateText(description, specs.descriptionLimit);
    }
    
    /**
     * 画像の最適化
     * @private
     */
    async _optimizeImage(content, specs, platform) {
        // カスタム画像が指定されている場合
        if (content.image) {
            return optimizeImageUrl(content.image, {
                width: specs.imageSize.width,
                height: specs.imageSize.height,
                format: specs.imageFormats[0]
            });
        }
        
        // ゲーム状態に基づく動的画像
        if (content.gameState) {
            return await this.generateDynamicSocialImage(content.gameState, platform);
        }
        
        // デフォルト画像
        return getSocialImageUrl(platform, content.imageVariant || 'default');
    }
    
    /**
     * ハッシュタグの生成
     * @private
     */
    _generateHashtags(content, platform) {
        const baseHashtags = {
            ja: ['#バブルポップ', '#HTML5ゲーム', '#ブラウザゲーム', '#無料ゲーム'],
            en: ['#BubblePop', '#HTML5Game', '#BrowserGame', '#FreeGame']
        };
        
        const lang = this.localizationManager ? 
            this.localizationManager.getCurrentLanguage() : 'ja';
        
        let hashtags = baseHashtags[lang] || baseHashtags.ja;
        
        // コンテンツ固有のハッシュタグ
        if (content.hashtags) {
            hashtags = [...hashtags, ...content.hashtags];
        }
        
        // ゲーム状態に基づくハッシュタグ
        if (content.gameState) {
            if (content.gameState.highScore) {
                hashtags.push(lang === 'ja' ? '#ハイスコア' : '#HighScore');
            }
            if (content.gameState.achievement) {
                hashtags.push(lang === 'ja' ? '#実績解除' : '#Achievement');
            }
        }
        
        // プラットフォーム別の制限
        const limits = {
            twitter: 2, // Twitterは少なめに
            instagram: 10,
            facebook: 5,
            linkedin: 3,
            pinterest: 10
        };
        
        const limit = limits[platform] || 5;
        return hashtags.slice(0, limit);
    }
    
    /**
     * プラットフォームメタデータの生成
     * @private
     */
    _generatePlatformMetadata(content, specs, platform) {
        const metadata = {
            imageWidth: specs.imageSize.width,
            imageHeight: specs.imageSize.height,
            platform,
            generatedAt: new Date().toISOString()
        };
        
        // プラットフォーム固有のメタデータ
        switch (platform) {
            case 'twitter':
                metadata.cardType = 'summary_large_image';
                metadata.site = '@BubblePopGame'; // 実際のアカウントに変更
                break;
            case 'facebook':
                metadata.type = 'website';
                metadata.locale = this._getOGLocale();
                break;
            case 'linkedin':
                metadata.type = 'article';
                break;
            case 'pinterest':
                metadata.richPins = true;
                break;
        }
        
        return metadata;
    }
    
    /**
     * プラットフォーム固有の最適化の適用
     * @private
     */
    async _applyPlatformSpecificOptimizations(optimized, platform, content) {
        switch (platform) {
            case 'twitter':
                // Twitterカード情報の追加
                optimized.twitterCard = {
                    card: 'summary_large_image',
                    site: '@BubblePopGame',
                    creator: '@BubblePopGame'
                };
                
                // Twitter用の短縮文の作成
                if (content.gameState?.score) {
                    optimized.tweetText = `BubblePopで${content.gameState.score.toLocaleString()}点達成！ ${optimized.url}`;
                }
                break;
                
            case 'facebook':
                // Facebook用の詳細情報
                optimized.facebookSpecific = {
                    appId: content.facebookAppId,
                    type: 'game',
                    locale: this._getOGLocale()
                };
                break;
                
            case 'pinterest':
                // Pinterest用の豊富な説明
                optimized.description = this._expandDescriptionForPinterest(optimized.description, content);
                break;
                
            case 'discord':
                // Discord Embed用の情報
                optimized.discordEmbed = {
                    title: optimized.title,
                    description: optimized.description,
                    color: 0x4CAF50, // ゲームのテーマカラー
                    thumbnail: { url: optimized.image },
                    fields: this._generateDiscordFields(content)
                };
                break;
        }
    }
    
    /**
     * 背景の描画
     * @private
     */
    async _drawBackground() {
        // グラデーション背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2E7D32');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パターンやテクスチャの追加（オプション）
        await this._drawBackgroundPattern();
    }
    
    /**
     * 背景パターンの描画
     * @private
     */
    async _drawBackgroundPattern() {
        // 泡のパターンを描画
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = '#FFFFFF';
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 30 + 10;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * ゲームコンテンツの描画
     * @private
     */
    async _drawGameContent(gameState) {
        if (!gameState) return;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        
        // スコアの表示
        if (gameState.score) {
            const scoreText = `Score: ${gameState.score.toLocaleString()}`;
            this.ctx.fillText(scoreText, this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // 実績の表示
        if (gameState.achievement) {
            this.ctx.font = 'bold 24px Arial, sans-serif';
            this.ctx.fillText(gameState.achievement, this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
        
        // コンボの表示
        if (gameState.combo && gameState.combo > 10) {
            this.ctx.font = 'bold 32px Arial, sans-serif';
            this.ctx.fillText(`${gameState.combo} Combo!`, this.canvas.width / 2, this.canvas.height / 2 + 100);
        }
    }
    
    /**
     * オーバーレイの描画
     * @private
     */
    async _drawOverlay(gameState, platform) {
        // タイトルの描画
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 64px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#2E7D32';
        this.ctx.lineWidth = 4;
        
        const title = 'BubblePop';
        this.ctx.strokeText(title, this.canvas.width / 2, 80);
        this.ctx.fillText(title, this.canvas.width / 2, 80);
        
        // プラットフォーム固有の要素
        if (platform === 'pinterest') {
            // Pinterest用の詳細情報
            this.ctx.font = '16px Arial, sans-serif';
            this.ctx.fillText('無料で遊べるブラウザゲーム', this.canvas.width / 2, this.canvas.height - 30);
        }
    }
    
    /**
     * Pinterest用の詳細説明
     * @private
     */
    _expandDescriptionForPinterest(description, content) {
        let expanded = description;
        
        // ゲーム機能の詳細を追加
        const features = [
            '18種類以上の特殊な泡',
            'コンボシステム',
            '実績システム',
            '無料でプレイ可能'
        ];
        
        expanded += '\n\n特徴:\n' + features.map(f => `• ${f}`).join('\n');
        
        return expanded;
    }
    
    /**
     * Discord用フィールドの生成
     * @private
     */
    _generateDiscordFields(content) {
        const fields = [];
        
        if (content.gameState?.score) {
            fields.push({
                name: 'スコア',
                value: content.gameState.score.toLocaleString(),
                inline: true
            });
        }
        
        if (content.gameState?.combo) {
            fields.push({
                name: 'コンボ',
                value: `${content.gameState.combo}連続`,
                inline: true
            });
        }
        
        fields.push({
            name: 'プラットフォーム',
            value: 'ブラウザ（無料）',
            inline: true
        });
        
        return fields;
    }
    
    /**
     * Open Graphロケールの取得
     * @private
     */
    _getOGLocale() {
        const lang = this.localizationManager ? 
            this.localizationManager.getCurrentLanguage() : 'ja';
        
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
     * キャッシュバスティングURLの生成
     * @param {string} originalUrl 
     * @param {string} platform 
     * @returns {string}
     */
    generateCacheBustingUrl(originalUrl, platform) {
        const specs = this.platformSpecs.get(platform);
        if (!specs) return originalUrl;
        
        const url = new URL(originalUrl);
        url.searchParams.set(specs.cacheBustParam, Date.now().toString());
        
        return url.toString();
    }
    
    /**
     * すべてのプラットフォーム用のコンテンツ生成
     * @param {Object} content 
     * @returns {Promise<Object>}
     */
    async generateAllPlatformContent(content = {}) {
        const results = {};
        
        for (const platform of this.platformSpecs.keys()) {
            try {
                results[platform] = await this.generateOptimizedContent(platform, content);
            } catch (error) {
                seoLogger.error(`Failed to generate ${platform} content`, error);
                results[platform] = null;
            }
        }
        
        return results;
    }
    
    /**
     * 共有URLの生成
     * @param {string} platform 
     * @param {Object} content 
     * @returns {string}
     */
    generateShareUrl(platform, content) {
        const baseUrls = {
            facebook: 'https://www.facebook.com/sharer/sharer.php',
            twitter: 'https://twitter.com/intent/tweet',
            linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
            pinterest: 'https://pinterest.com/pin/create/button/',
            reddit: 'https://reddit.com/submit'
        };
        
        const baseUrl = baseUrls[platform];
        if (!baseUrl) return content.url;
        
        const params = new URLSearchParams();
        
        switch (platform) {
            case 'facebook':
                params.set('u', content.url);
                break;
            case 'twitter':
                params.set('text', content.title);
                params.set('url', content.url);
                if (content.hashtags) {
                    params.set('hashtags', content.hashtags.map(h => h.replace('#', '')).join(','));
                }
                break;
            case 'linkedin':
                params.set('url', content.url);
                break;
            case 'pinterest':
                params.set('url', content.url);
                params.set('media', content.image);
                params.set('description', content.description);
                break;
            case 'reddit':
                params.set('url', content.url);
                params.set('title', content.title);
                break;
        }
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache() {
        this.imageCache.clear();
        this.shareCache.clear();
        seoLogger.info('Social media cache cleared');
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.clearCache();
        this.platformSpecs.clear();
        
        if (this.canvas) {
            this.canvas = null;
            this.ctx = null;
        }
        
        seoLogger.info('SocialMediaOptimizer cleaned up');
    }
}