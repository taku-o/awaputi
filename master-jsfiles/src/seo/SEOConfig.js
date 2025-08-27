/**
 * SEO設定管理
 * 
 * SEO関連の全設定を管理する中央設定ファイル
 */
export const SEOConfig = {
    // 基本設定
    baseUrl: 'https://bubblepop-game.com', // 本番環境のURLに更新する必要があります
    siteName: 'BubblePop',
    siteNameJa: 'バブルポップ',
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
    
    // メタデータ設定
    metadata: {
        author: 'BubblePop Game Team',
        keywords: {
            ja: 'ゲーム,泡,アクション,HTML5,Canvas,バブル,パズル,カジュアル',
            en: 'game,bubble,action,HTML5,Canvas,puzzle,casual,arcade'
        },
        defaultDescription: {
            ja: 'BubblePop - 泡を割って高スコアを目指すアクションゲーム',
            en: 'BubblePop - Pop bubbles and aim for high scores in this action game'
        },
        extendedDescription: {
            ja: 'HTML5 Canvas を使用したバブルポップゲーム。18種類以上の特殊な泡を駆使して、高スコアを目指そう！シンプルな操作で誰でも楽しめる中毒性の高いアクションゲーム。',
            en: 'A bubble popping game built with HTML5 Canvas. Master over 18 types of special bubbles and aim for high scores! An addictive action game with simple controls that anyone can enjoy.'
        }
    },
    
    // ソーシャルメディア画像設定
    socialImages: {
        openGraph: {
            default: '/assets/social/og-image.png',
            landscape: '/assets/social/og-image-landscape.png',
            portrait: '/assets/social/og-image-portrait.png',
            width: 1200,
            height: 630
        },
        twitter: {
            default: '/assets/social/twitter-card.png',
            summary: '/assets/social/twitter-summary.png',
            summaryLarge: '/assets/social/twitter-summary-large.png',
            width: 1200,
            height: 600
        },
        linkedin: {
            default: '/assets/social/linkedin-share.png',
            width: 1200,
            height: 627
        },
        pinterest: {
            default: '/assets/social/pinterest-share.png',
            width: 1000,
            height: 1500
        },
        fallback: '/assets/screenshots/game-portrait.png'
    },
    
    // 構造化データ設定
    structuredData: {
        organization: {
            name: 'BubblePop Game Team',
            url: 'https://bubblepop-game.com',
            logo: 'https://bubblepop-game.com/assets/icons/icon-512x512.png',
            sameAs: [
                // ソーシャルメディアプロファイルURLを追加
            ]
        },
        game: {
            name: 'BubblePop',
            alternateName: '泡割りゲーム',
            genre: ['Action', 'Casual', 'Arcade', 'Puzzle'],
            platform: ['Web Browser', 'PWA'],
            operatingSystem: ['Any'],
            contentRating: 'Everyone',
            inLanguage: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
            isAccessibleForFree: true,
            applicationCategory: 'Game',
            offers: {
                price: '0',
                priceCurrency: 'JPY'
            }
        },
        webApplication: {
            applicationCategory: 'GameApplication',
            permissions: ['storage', 'notifications'],
            browserRequirements: 'Requires JavaScript',
            memoryRequirements: '2GB',
            storageRequirements: '50MB'
        }
    },
    
    // robots.txt設定
    robots: {
        userAgent: '*',
        allow: ['/', '/assets/', '/help/'],
        disallow: ['/src/', '/test*', '/debug*', '/*.log', '/.git/', '/node_modules/'],
        crawlDelay: 0,
        sitemapUrl: '/sitemap.xml'
    },
    
    // sitemap設定
    sitemap: {
        changeFrequency: {
            home: 'weekly',
            help: 'monthly',
            assets: 'yearly'
        },
        priority: {
            home: 1.0,
            help: 0.8,
            languageVariants: 0.7,
            assets: 0.3
        }
    },
    
    // ファビコン設定
    favicon: {
        sizes: [16, 32, 48, 96, 144, 192, 256, 512],
        appleTouchIcon: [57, 60, 72, 76, 114, 120, 144, 152, 180],
        msTile: [70, 144, 150, 310],
        androidChrome: [36, 48, 72, 96, 144, 192, 256, 384, 512]
    },
    
    // パフォーマンス設定
    performance: {
        imagOptimization: {
            quality: 85,
            formats: ['webp', 'png', 'jpg'],
            lazyLoad: true
        },
        caching: {
            socialImages: 604800, // 7日間（秒）
            structuredData: 86400, // 1日（秒）
            metaTags: 3600 // 1時間（秒）
        }
    },
    
    // エラーハンドリング設定
    errorHandling: {
        missingImage: {
            useDefault: true,
            logError: true
        },
        invalidStructuredData: {
            useFallback: true,
            minimalSchema: true
        },
        metaTagFailure: {
            ensureBasicTags: true,
            logToConsole: true
        }
    }
};

// 環境別URL設定
export function getBaseUrl() {
    if (typeof window === 'undefined') {
        return SEOConfig.baseUrl;
    }
    
    const { protocol, host } = window.location;
    
    // 本番環境
    if (host === 'bubblepop-game.com' || host === 'www.bubblepop-game.com') {
        return `${protocol}//${host}`;
    }
    
    // 開発環境
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return `${protocol}//${host}`;
    }
    
    // その他の環境
    return `${protocol}//${host}`;
}

// 言語別URL生成
export function getLocalizedUrl(lang = SEOConfig.defaultLanguage, path = '') {
    const baseUrl = getBaseUrl();
    
    if (lang === SEOConfig.defaultLanguage) {
        return `${baseUrl}${path}`;
    }
    
    return `${baseUrl}/${lang}${path}`;
}

// ソーシャルメディア画像URL生成
export function getSocialImageUrl(platform = 'openGraph', variant = 'default') {
    const baseUrl = getBaseUrl();
    const imagePath = SEOConfig.socialImages[platform]?.[variant] || SEOConfig.socialImages.fallback;
    
    return `${baseUrl}${imagePath}`;
}