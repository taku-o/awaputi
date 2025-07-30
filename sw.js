/**
 * BubblePop Game Service Worker
 * PWA機能のためのService Worker実装
 */

// キャッシュ設定
const CACHE_CONFIG = {
    version: '1.0.0',
    staticCacheName: 'bubblepop-static-v1.0.0',
    dynamicCacheName: 'bubblepop-dynamic-v1.0.0',
    apiCacheName: 'bubblepop-api-v1.0.0',
    
    // キャッシュ戦略
    strategies: {
        static: 'cache-first',
        dynamic: 'network-first',
        api: 'network-only'
    },
    
    // キャッシュサイズ制限
    limits: {
        staticCache: 50 * 1024 * 1024, // 50MB
        dynamicCache: 20 * 1024 * 1024, // 20MB
        apiCache: 5 * 1024 * 1024, // 5MB
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7日間
    }
};

// 静的リソースリスト
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/test.html',
    
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
    
    // アセット（実在するもののみ）
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    
    // CSS（実在するもののみ）
    '/styles/main.css'
];

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
    
    // リクエストタイプに応じた戦略を選択
    const strategy = getRequestStrategy(request);
    
    event.respondWith(handleRequest(request, strategy));
});

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
            return;
    }
    
    // サイズ計算は概算（実装簡略化）
    const estimatedSize = requests.length * 10000; // 10KB per request (概算)
    
    if (estimatedSize > limit) {
        // 古いエントリから削除（FIFO）
        const deleteCount = Math.ceil(requests.length * 0.2); // 20%削除
        
        for (let i = 0; i < deleteCount && i < requests.length; i++) {
            await cache.delete(requests[i]);
        }
        
        console.log(`[ServiceWorker] キャッシュクリーンアップ: ${deleteCount}件削除 (${cacheName})`);
    }
}

/**
 * 古いキャッシュの削除
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [
        CACHE_CONFIG.staticCacheName,
        CACHE_CONFIG.dynamicCacheName,
        CACHE_CONFIG.apiCacheName
    ];
    
    const deletePromises = cacheNames
        .filter(cacheName => !currentCaches.includes(cacheName))
        .map(cacheName => caches.delete(cacheName));
    
    const deleted = await Promise.all(deletePromises);
    const deletedCount = deleted.filter(Boolean).length;
    
    if (deletedCount > 0) {
        console.log(`[ServiceWorker] 古いキャッシュ削除: ${deletedCount}件`);
    }
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
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
        client.postMessage(message);
    });
}

console.log('[ServiceWorker] Service Worker読み込み完了:', CACHE_CONFIG.version);