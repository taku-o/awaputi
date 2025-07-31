/**
 * BubblePop Game Service Worker
 * PWA機能のためのService Worker実装
 */

// キャッシュ設定
const CACHE_CONFIG = {
    version: '1.1.0-pwa',
    staticCacheName: 'bubblepop-static-v1.1.0-pwa',
    dynamicCacheName: 'bubblepop-dynamic-v1.1.0-pwa',
    apiCacheName: 'bubblepop-api-v1.1.0-pwa',
    
    // キャッシュ戦略
    strategies: {
        static: 'cache-first',      // 静的ファイル（JS、CSS、アイコン等）
        dynamic: 'network-first',   // 動的コンテンツ
        api: 'network-only',        // API呼び出し
        icons: 'cache-first',       // PWAアイコン（長期キャッシュ）
        screenshots: 'cache-first'  // スクリーンショット（オンデマンド読み込み）
    },
    
    // キャッシュサイズ制限（PWA対応で増量）
    limits: {
        staticCache: 100 * 1024 * 1024,  // 100MB（PWAアセット増加に対応）
        dynamicCache: 20 * 1024 * 1024,  // 20MB
        apiCache: 5 * 1024 * 1024,       // 5MB
        iconCache: 30 * 1024 * 1024,     // 30MB（PWAアイコン専用）
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30日間（PWAアセットは長期保持）
    },
    
    // 新しいキャッシュ戦略設定
    cacheStrategies: {
        // 高優先度（即座にキャッシュ）
        highPriority: [
            /^\/$/,                           // ルートページ
            /^\/index\.html$/,                // メインページ
            /^\/manifest\.json$/,             // PWA manifest
            /^\/assets\/icons\/icon-.*\.png$/, // PWAアイコン
            /^\/favicon.*\.png$/,             // ファビコン
            /^\/apple-touch-icon.*\.png$/     // Apple Touch Icons
        ],
        
        // 中優先度（使用時にキャッシュ）
        mediumPriority: [
            /^\/src\/core\//,                 // コアJS
            /^\/src\/scenes\//,               // シーン
            /^\/src\/managers\//,             // マネージャー
            /^\/src\/config\//                // 設定
        ],
        
        // 低優先度（オンデマンド）
        lowPriority: [
            /^\/assets\/screenshots\//,       // スクリーンショット
            /^\/assets\/splash-screens\//,    // スプラッシュスクリーン
            /^\/src\/utils\//                 // ユーティリティ
        ]
    }
};;

// 静的リソースリスト
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/test.html',
    '/manifest.json',
    
    // メインJSファイル
    '/src/core/GameEngine.js',
    '/src/core/SceneManager.js',
    '/src/core/InputManager.js',
    '/src/core/ConfigurationManager.js',
    '/src/core/PlayerData.js',
    '/src/core/StageManager.js',
    '/src/core/EnhancedTouchManager.js',
    '/src/core/AdvancedResponsiveLayoutManager.js',
    '/src/core/PWAManager.js',
    
    // シーンファイル
    '/src/scenes/MainMenuScene.js',
    '/src/scenes/StageSelectScene.js',
    '/src/scenes/GameScene.js',
    '/src/scenes/ShopScene.js',
    '/src/scenes/UserInfoScene.js',
    '/src/scenes/GameInputManager.js',
    
    // マネージャー
    '/src/managers/BubbleManager.js',
    '/src/managers/ScoreManager.js',
    '/src/managers/StatisticsManager.js',
    '/src/managers/AchievementManager.js',
    '/src/managers/FloatingTextManager.js',
    '/src/managers/EffectManager.js',
    '/src/managers/AudioManager.js',
    
    // バブル関連
    '/src/bubbles/Bubble.js',
    
    // 設定ファイル
    '/src/config/GameConfig.js',
    '/src/config/GameBalance.js',
    '/src/config/AudioConfig.js',
    '/src/config/EffectsConfig.js',
    '/src/config/PerformanceConfig.js',
    
    // ユーティリティ
    '/src/utils/PerformanceOptimizer.js',
    '/src/utils/RenderOptimizer.js',
    '/src/utils/MemoryManager.js',
    '/src/utils/ErrorHandler.js',
    '/src/utils/BrowserCompatibility.js',
    '/src/utils/ResponsiveCanvasManager.js',
    '/src/utils/SettingsManager.js',
    '/src/core/LocalizationManager.js',
    '/src/utils/KeyboardShortcutManager.js',
    '/src/utils/Analytics.js',
    '/src/utils/MobilePerformanceOptimizer.js',
    '/src/utils/ObjectPool.js',
    
    // PWA Icons - Standard
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    
    // PWA Icons - Maskable
    '/assets/icons/icon-maskable-192x192.png',
    '/assets/icons/icon-maskable-512x512.png',
    
    // PWA Shortcut Icons
    '/assets/icons/shortcut-play.png',
    '/assets/icons/shortcut-stats.png',
    '/assets/icons/shortcut-settings.png',
    '/assets/icons/shortcut-achievements.png',
    
    // Apple Touch Icons
    '/apple-touch-icon-57x57.png',
    '/apple-touch-icon-60x60.png',
    '/apple-touch-icon-72x72.png',
    '/apple-touch-icon-76x76.png',
    '/apple-touch-icon-114x114.png',
    '/apple-touch-icon-120x120.png',
    '/apple-touch-icon-144x144.png',
    '/apple-touch-icon-152x152.png',
    '/apple-touch-icon-180x180.png',
    
    // Favicons
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/favicon-48x48.png',
    '/favicon.ico',
    
    // Apple Splash Screens (重要なもののみ、全22個は多すぎるためメジャーデバイスのみ)
    '/assets/splash-screens/apple-splash-375x812.png',  // iPhone X/XS/11 Pro
    '/assets/splash-screens/apple-splash-390x844.png',  // iPhone 12/13 mini
    '/assets/splash-screens/apple-splash-393x852.png',  // iPhone 14/15
    '/assets/splash-screens/apple-splash-414x896.png',  // iPhone XR/XS Max/11/12/13/14 Plus
    '/assets/splash-screens/apple-splash-430x932.png',  // iPhone 14 Pro Max/15 Pro Max
    '/assets/splash-screens/apple-splash-768x1024.png', // iPad
    '/assets/splash-screens/apple-splash-834x1194.png', // iPad Air
    '/assets/splash-screens/apple-splash-1024x1366.png', // iPad Pro 12.9"
    
    // Screenshots (プリロードしない、必要時のみ読み込み)
    // '/assets/screenshots/' files are loaded on demand
    
    // CSS（実在するもののみ）
    '/styles/main.css'
];;

// ネットワーク優先のパターン
const NETWORK_FIRST_PATTERNS = [
    /\/api\//,
    /\/data\//,
    /\.json$/
];

// キャッシュ優先のパターン
const CACHE_FIRST_PATTERNS = [
    /\.js$/,
    /\.css$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.svg$/,
    /\.woff$/,
    /\.woff2$/
];

// Service Worker インストール
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] インストール開始');
    
    event.waitUntil(
        (async () => {
            try {
                // 静的キャッシュの作成
                const staticCache = await caches.open(CACHE_CONFIG.staticCacheName);
                
                // 静的リソースをキャッシュ（存在チェック付き）
                const validAssets = [];
                for (const asset of STATIC_ASSETS) {
                    try {
                        const response = await fetch(asset);
                        if (response.ok) {
                            validAssets.push(asset);
                        } else {
                            console.warn(`[ServiceWorker] アセット見つからず: ${asset}`);
                        }
                    } catch (error) {
                        console.warn(`[ServiceWorker] アセット確認エラー: ${asset}`, error);
                    }
                }
                
                await staticCache.addAll(validAssets);
                console.log('[ServiceWorker] 静的リソースキャッシュ完了:', validAssets.length);
                
                // クライアントに通知
                await postMessageToClients({
                    type: 'CACHE_UPDATED',
                    payload: {
                        cached: validAssets.length,
                        total: STATIC_ASSETS.length
                    }
                });
                
                // すぐにアクティブ化
                if (CACHE_CONFIG.skipWaiting) {
                    self.skipWaiting();
                }
                
            } catch (error) {
                console.error('[ServiceWorker] インストールエラー:', error);
            }
        })()
    );
});

// Service Worker アクティブ化
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] アクティブ化開始');
    
    event.waitUntil(
        (async () => {
            try {
                // 古いキャッシュの削除
                await cleanupOldCaches();
                
                // すべてのクライアントを制御
                if (CACHE_CONFIG.clientsClaim) {
                    await self.clients.claim();
                }
                
                console.log('[ServiceWorker] アクティブ化完了');
                
                // クライアントに通知
                await postMessageToClients({
                    type: 'OFFLINE_READY',
                    payload: { timestamp: Date.now() }
                });
                
            } catch (error) {
                console.error('[ServiceWorker] アクティブ化エラー:', error);
            }
        })()
    );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 外部リソースは処理しない
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // 特定のリクエストは無視（Service Worker自体、chrome-extension等）
    if (url.pathname.startsWith('/sw.js') || 
        url.protocol.startsWith('chrome-extension') ||
        url.pathname.startsWith('/_')) {
        return;
    }
    
    // PWA対応の改善されたリクエスト処理
    event.respondWith(handlePWARequest(request));
};);

// メッセージイベントの処理
self.addEventListener('message', (event) => {
    const { type, payload } = event.data || {};
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_ASSET':
            cacheAsset(payload.url, payload.cacheName);
            break;
            
        case 'CLEAR_CACHE':
            clearCache(payload.cacheName);
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
            
        default:
            console.log('[ServiceWorker] 未知のメッセージ:', event.data);
    }
});

// バックグラウンド同期（サポートされている場合）
if ('sync' in self.registration) {
    self.addEventListener('sync', (event) => {
        console.log('[ServiceWorker] バックグラウンド同期:', event.tag);
        
        if (event.tag === 'game-data-sync') {
            event.waitUntil(syncGameData());
        }
    });
}

// プッシュ通知（サポートされている場合）
if ('push' in self.registration) {
    self.addEventListener('push', (event) => {
        console.log('[ServiceWorker] プッシュ通知受信');
        
        const options = {
            body: event.data ? event.data.text() : 'BubblePop からの通知',
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
            tag: 'bubblepop-notification',
            requireInteraction: false,
            actions: [
                {
                    action: 'play',
                    title: 'プレイ',
                    icon: '/assets/icons/action-play.png'
                },
                {
                    action: 'dismiss',
                    title: '閉じる'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification('BubblePop', options)
        );
    });
    
    self.addEventListener('notificationclick', (event) => {
        console.log('[ServiceWorker] 通知クリック:', event.action);
        
        event.notification.close();
        
        if (event.action === 'play') {
            // ゲームを開く
            event.waitUntil(
                self.clients.openWindow('/?action=quickplay')
            );
        }
    });
}

/**
 * リクエスト戦略の決定
 */
function getRequestStrategy(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // ネットワーク優先のパターン
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(pathname))) {
        return 'network-first';
    }
    
    // キャッシュ優先のパターン
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(pathname))) {
        return 'cache-first';
    }
    
    // HTMLファイルはネットワーク優先
    if (pathname.endsWith('.html') || pathname === '/') {
        return 'network-first';
    }
    
    // デフォルトはキャッシュ優先
    return 'cache-first';
}

/**
 * リクエストの処理
 */
async function handleRequest(request, strategy) {
    try {
        switch (strategy) {
            case 'cache-first':
                return await cacheFirstStrategy(request);
                
            case 'network-first':
                return await networkFirstStrategy(request);
                
            case 'network-only':
                return await networkOnlyStrategy(request);
                
            case 'cache-only':
                return await cacheOnlyStrategy(request);
                
            default:
                return await networkFirstStrategy(request);
        }
    } catch (error) {
        console.error('[ServiceWorker] リクエスト処理エラー:', error);
        return await getOfflineFallback(request);
    }
}

/**
 * PWA特化のリクエスト戦略決定
 * @param {Request} request 
 * @returns {string} 適用すべき戦略
 */
function getPWAStrategy(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // 高優先度リソース（Cache First）
    for (const pattern of CACHE_CONFIG.cacheStrategies.highPriority) {
        if (pattern.test(pathname)) {
            return 'cache-first';
        }
    }
    
    // 中優先度リソース（Stale While Revalidate）
    for (const pattern of CACHE_CONFIG.cacheStrategies.mediumPriority) {
        if (pattern.test(pathname)) {
            return 'stale-while-revalidate';
        }
    }
    
    // 低優先度リソース（Network First）
    for (const pattern of CACHE_CONFIG.cacheStrategies.lowPriority) {
        if (pattern.test(pathname)) {
            return 'network-first';
        }
    }
    
    // API呼び出し
    if (pathname.startsWith('/api/')) {
        return 'network-only';
    }
    
    // デフォルト戦略
    return 'network-first';
}

/**
 * Stale While Revalidate戦略
 * キャッシュがあれば即座に返し、同時にネットワークから更新
 */
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(CACHE_CONFIG.staticCacheName);
    
    // キャッシュから即座に応答
    const cachedResponse = await cache.match(request);
    
    // バックグラウンドでネットワークから更新
    const networkResponsePromise = fetch(request)
        .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
                // 新しいレスポンスをキャッシュ
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
                console.log(`[ServiceWorker] バックグラウンド更新: ${request.url}`);
            }
            return networkResponse;
        })
        .catch(error => {
            console.log(`[ServiceWorker] バックグラウンド更新失敗: ${request.url}`, error);
            return null;
        });
    
    // キャッシュがあれば即座に返す
    if (cachedResponse) {
        console.log(`[ServiceWorker] キャッシュから応答: ${request.url}`);
        // バックグラウンド更新は続行
        networkResponsePromise.catch(() => {}); // エラーを無視
        return cachedResponse;
    }
    
    // キャッシュがない場合はネットワークを待つ
    console.log(`[ServiceWorker] ネットワークから取得: ${request.url}`);
    return await networkResponsePromise || await getOfflineFallback(request);
}

/**
 * 改善されたリクエストハンドラー（PWA対応）
 */
async function handlePWARequest(request) {
    try {
        const strategy = getPWAStrategy(request);
        
        switch (strategy) {
            case 'cache-first':
                return await cacheFirstStrategy(request);
                
            case 'network-first':
                return await networkFirstStrategy(request);
                
            case 'network-only':
                return await networkOnlyStrategy(request);
                
            case 'cache-only':
                return await cacheOnlyStrategy(request);
                
            case 'stale-while-revalidate':
                return await staleWhileRevalidateStrategy(request);
                
            default:
                return await networkFirstStrategy(request);
        }
    } catch (error) {
        console.error('[ServiceWorker] PWAリクエスト処理エラー:', error);
        return await getOfflineFallback(request);
    }
}

/**
 * キャッシュ優先戦略
 */
async function cacheFirstStrategy(request) {
    const cachedResponse = await getCachedResponse(request);
    
    if (cachedResponse) {
        // バックグラウンドで更新
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    // キャッシュにない場合はネットワークから取得
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await cacheResponse(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return await getOfflineFallback(request);
    }
}

/**
 * ネットワーク優先戦略
 */
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await cacheResponse(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await getCachedResponse(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return await getOfflineFallback(request);
    }
}

/**
 * ネットワークのみ戦略
 */
async function networkOnlyStrategy(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return await getOfflineFallback(request);
    }
}

/**
 * キャッシュのみ戦略
 */
async function cacheOnlyStrategy(request) {
    const cachedResponse = await getCachedResponse(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    return await getOfflineFallback(request);
}

/**
 * キャッシュからレスポンスを取得
 */
async function getCachedResponse(request) {
    const cacheNames = [
        CACHE_CONFIG.staticCacheName,
        CACHE_CONFIG.dynamicCacheName,
        CACHE_CONFIG.apiCacheName
    ];
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(request);
        
        if (response) {
            // TTL チェック
            if (await isResponseValid(response)) {
                return response;
            } else {
                // 期限切れのキャッシュを削除
                await cache.delete(request);
            }
        }
    }
    
    return null;
}

/**
 * レスポンスをキャッシュ
 */
async function cacheResponse(request, response) {
    const url = new URL(request.url);
    let cacheName;
    
    // キャッシュ名の決定
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        cacheName = CACHE_CONFIG.staticCacheName;
    } else if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        cacheName = CACHE_CONFIG.apiCacheName;
    } else {
        cacheName = CACHE_CONFIG.dynamicCacheName;
    }
    
    try {
        const cache = await caches.open(cacheName);
        
        // TTL情報を追加
        const responseWithTTL = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                ...response.headers,
                'sw-cache-timestamp': Date.now().toString()
            }
        });
        
        await cache.put(request, responseWithTTL);
        
        // キャッシュサイズ制限の確認
        await enforceMaxCacheSize(cacheName);
        
    } catch (error) {
        console.error('[ServiceWorker] キャッシュ保存エラー:', error);
    }
}

/**
 * バックグラウンドでキャッシュを更新
 */
async function updateCacheInBackground(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            await cacheResponse(request, response);
        }
    } catch (error) {
        // バックグラウンド更新は失敗しても問題なし
        console.log('[ServiceWorker] バックグラウンド更新失敗（正常）:', error.message);
    }
}

/**
 * レスポンスの有効性チェック
 */
async function isResponseValid(response) {
    const cacheTimestamp = response.headers.get('sw-cache-timestamp');
    
    if (!cacheTimestamp) {
        return true; // タイムスタンプがない場合は有効とみなす
    }
    
    const age = Date.now() - parseInt(cacheTimestamp, 10);
    return age < CACHE_CONFIG.limits.maxAge;
}

/**
 * オフライン時のフォールバック
 */
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // HTMLページの場合
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
        // メインページまたはオフラインページを返す
        const cachedPage = await getCachedResponse(new Request('/'));
        if (cachedPage) {
            return cachedPage;
        }
        
        // オフライン専用ページを返す（作成されている場合）
        const offlinePage = await getCachedResponse(new Request('/offline.html'));
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // その他のリソース
    return new Response('オフライン', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}

/**
 * キャッシュサイズ制限の実施
 */
async function enforceMaxCacheSize(cacheName) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    let limit;
    switch (cacheName) {
        case CACHE_CONFIG.staticCacheName:
            limit = CACHE_CONFIG.limits.staticCache;
            break;
        case CACHE_CONFIG.dynamicCacheName:
            limit = CACHE_CONFIG.limits.dynamicCache;
            break;
        case CACHE_CONFIG.apiCacheName:
            limit = CACHE_CONFIG.limits.apiCache;
            break;
        default:
            // 新しいキャッシュタイプに対応
            if (cacheName.includes('icon')) {
                limit = CACHE_CONFIG.limits.iconCache;
            } else {
                limit = CACHE_CONFIG.limits.staticCache; // デフォルト
            }
            break;
    }
    
    // より正確なサイズ計算（Response content-lengthを使用）
    let totalSize = 0;
    const entries = [];
    
    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const size = parseInt(response.headers.get('content-length')) || 10000; // fallback 10KB
            const lastModified = response.headers.get('last-modified') || new Date().toISOString();
            entries.push({
                request,
                size,
                lastModified: new Date(lastModified),
                url: request.url
            });
            totalSize += size;
        }
    }
    
    if (totalSize > limit) {
        // 使用頻度とアクセス時間を考慮したLRU + 重要度ベースのクリーンアップ
        const deleteTarget = totalSize - (limit * 0.8); // 80%まで削減
        let deletedSize = 0;
        
        // 重要度による保護（PWA必須ファイル）
        const protectedPatterns = [
            /\/$/,                          // ルート
            /\/index\.html$/,               // メインページ
            /\/manifest\.json$/,            // PWA manifest
            /\/assets\/icons\/icon-192x192\.png$/, // 必須PWAアイコン
            /\/assets\/icons\/icon-512x512\.png$/, // 必須PWAアイコン
            /\/src\/core\/GameEngine\.js$/  // コアエンジン
        ];
        
        // 削除候補を優先度順にソート
        const sortedEntries = entries
            .filter(entry => !protectedPatterns.some(pattern => pattern.test(entry.url)))
            .sort((a, b) => {
                // 1. 古いファイルを優先削除
                const timeDiff = a.lastModified - b.lastModified;
                if (Math.abs(timeDiff) > 24 * 60 * 60 * 1000) { // 1日以上の差
                    return timeDiff;
                }
                
                // 2. サイズの大きいファイルを優先削除
                return b.size - a.size;
            });
        
        console.log(`[ServiceWorker] キャッシュサイズ制限: ${totalSize}bytes > ${limit}bytes`);
        console.log(`[ServiceWorker] 削除目標: ${deleteTarget}bytes`);
        
        for (const entry of sortedEntries) {
            if (deletedSize >= deleteTarget) break;
            
            await cache.delete(entry.request);
            deletedSize += entry.size;
            console.log(`[ServiceWorker] 削除: ${entry.url} (${entry.size}bytes)`);
        }
        
        console.log(`[ServiceWorker] キャッシュクリーンアップ完了: ${deletedSize}bytes削除 (${cacheName})`);
    } else {
        console.log(`[ServiceWorker] キャッシュサイズ正常: ${totalSize}bytes <= ${limit}bytes (${cacheName})`);
    }
}

/**
 * 古いキャッシュの削除
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentVersion = CACHE_CONFIG.version;
    
    // 現在有効なキャッシュ名のパターン
    const currentCachePatterns = [
        CACHE_CONFIG.staticCacheName,
        CACHE_CONFIG.dynamicCacheName,
        CACHE_CONFIG.apiCacheName,
        // 動的に生成される可能性のあるキャッシュも含める
        `bubblepop-icons-v${currentVersion}`,
        `bubblepop-screenshots-v${currentVersion}`
    ];
    
    // BubblePop関連の古いキャッシュを特定
    const oldCacheNames = cacheNames.filter(cacheName => {
        // BubblePopプロジェクト関連のキャッシュのみ対象
        if (!cacheName.startsWith('bubblepop-')) {
            return false;
        }
        
        // 現在のバージョンのキャッシュは保持
        if (currentCachePatterns.includes(cacheName)) {
            return false;
        }
        
        // バージョン情報を含むキャッシュの場合、古いバージョンかチェック
        const versionMatch = cacheName.match(/v(\d+\.\d+\.\d+(?:-\w+)?)/);
        if (versionMatch) {
            const cacheVersion = versionMatch[1];
            if (cacheVersion === currentVersion) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`[ServiceWorker] キャッシュクリーンアップ開始`);
    console.log(`[ServiceWorker] 現在のバージョン: ${currentVersion}`);
    console.log(`[ServiceWorker] 検出されたキャッシュ: ${cacheNames.length}個`);
    console.log(`[ServiceWorker] 削除対象: ${oldCacheNames.length}個`);
    
    if (oldCacheNames.length > 0) {
        console.log(`[ServiceWorker] 削除対象キャッシュ:`, oldCacheNames);
    }
    
    // 古いキャッシュを並列削除
    const deletePromises = oldCacheNames.map(async (cacheName) => {
        try {
            const deleted = await caches.delete(cacheName);
            if (deleted) {
                console.log(`[ServiceWorker] キャッシュ削除成功: ${cacheName}`);
            }
            return deleted;
        } catch (error) {
            console.error(`[ServiceWorker] キャッシュ削除エラー: ${cacheName}`, error);
            return false;
        }
    });
    
    const results = await Promise.all(deletePromises);
    const deletedCount = results.filter(Boolean).length;
    
    if (deletedCount > 0) {
        console.log(`[ServiceWorker] 古いキャッシュ削除完了: ${deletedCount}件`);
        
        // クライアントに更新完了を通知
        await postMessageToClients({
            type: 'CACHE_UPDATED',
            message: `キャッシュ更新完了 (${deletedCount}件の古いキャッシュを削除)`,
            version: currentVersion,
            deletedCaches: oldCacheNames
        });
    } else {
        console.log(`[ServiceWorker] 削除すべき古いキャッシュなし`);
    }
    
    return deletedCount;
}

/**
 * 特定のアセットをキャッシュ
 */
async function cacheAsset(url, cacheName = CACHE_CONFIG.dynamicCacheName) {
    try {
        const cache = await caches.open(cacheName);
        await cache.add(url);
        console.log(`[ServiceWorker] アセットキャッシュ完了: ${url}`);
    } catch (error) {
        console.error(`[ServiceWorker] アセットキャッシュエラー: ${url}`, error);
    }
}

/**
 * キャッシュのクリア
 */
async function clearCache(cacheName) {
    if (cacheName) {
        const deleted = await caches.delete(cacheName);
        console.log(`[ServiceWorker] キャッシュクリア: ${cacheName} (${deleted ? '成功' : '失敗'})`);
    } else {
        // すべてのキャッシュをクリア
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map(name => caches.delete(name));
        await Promise.all(deletePromises);
        console.log('[ServiceWorker] 全キャッシュクリア完了');
    }
}

/**
 * キャッシュ状態の取得
 */
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        status[cacheName] = {
            entries: requests.length,
            urls: requests.map(req => req.url)
        };
    }
    
    return {
        caches: status,
        timestamp: Date.now(),
        version: CACHE_CONFIG.version
    };
}

/**
 * ゲームデータの同期
 */
async function syncGameData() {
    try {
        console.log('[ServiceWorker] ゲームデータ同期開始');
        
        // ローカルストレージから保留データを取得
        const pending = await getStorageData('pwa_pending_sync');
        
        if (pending && pending.length > 0) {
            // APIに送信（実際の実装では適切なエンドポイントを使用）
            for (const data of pending) {
                try {
                    const response = await fetch('/api/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (response.ok) {
                        console.log('[ServiceWorker] データ同期完了:', data.type);
                    }
                } catch (error) {
                    console.error('[ServiceWorker] データ同期エラー:', error);
                }
            }
            
            // 同期完了後にデータをクリア
            await setStorageData('pwa_pending_sync', []);
        }
        
        console.log('[ServiceWorker] ゲームデータ同期完了');
        
    } catch (error) {
        console.error('[ServiceWorker] ゲームデータ同期失敗:', error);
        throw error; // 再試行のため
    }
}

/**
 * ストレージデータの取得（Service Worker内での実装）
 */
async function getStorageData(key) {
    // IndexedDBまたはCache APIを使用してデータを取得
    // 簡略化のため、ここでは模擬実装
    return [];
}

/**
 * ストレージデータの設定（Service Worker内での実装）
 */
async function setStorageData(key, data) {
    // IndexedDBまたはCache APIを使用してデータを保存
    // 簡略化のため、ここでは模擬実装
    return true;
}

/**
 * クライアントへのメッセージ送信
 */
async function postMessageToClients(message) {
    try {
        const clients = await self.clients.matchAll();
        
        if (clients.length === 0) {
            console.log('[ServiceWorker] No clients available for messaging');
            return;
        }
        
        console.log(`[ServiceWorker] Sending message to ${clients.length} client(s):`, message.type);
        
        clients.forEach(client => {
            try {
                client.postMessage(message);
            } catch (error) {
                console.error('[ServiceWorker] Failed to send message to client:', error);
            }
        });
    } catch (error) {
        console.error('[ServiceWorker] Failed to get clients for messaging:', error);
    }
}

console.log('[ServiceWorker] Service Worker読み込み完了:', CACHE_CONFIG.version);