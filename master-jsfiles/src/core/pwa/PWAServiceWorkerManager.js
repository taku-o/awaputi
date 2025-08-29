/**
 * PWAServiceWorkerManager
 * Service Worker登録、更新、ライフサイクル管理、キャッシュ戦略を担当
 */
export class PWAServiceWorkerManager {
    constructor(pwaManager) {
        this.pwaManager = pwaManager;
        this.registration = null;
        this.isRegistering = false;
        this.updateAvailable = false;
    }

    /**
     * Service Workerの登録
     * @returns {Promise<boolean>} 登録成功可否
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[PWAServiceWorkerManager] Service Worker not supported');
            return false;
        }

        if (this.isRegistering) {
            console.log('[PWAServiceWorkerManager] Registration already in progress');
            return false;
        }

        try {
            this.isRegistering = true;
            console.log('[PWAServiceWorkerManager] Registering Service Worker...');

            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            this.registration = registration;
            console.log('[PWAServiceWorkerManager] Service Worker registered successfully:', registration.scope);

            // Service Workerの状態監視開始
            this.monitorServiceWorkerState();

            return true;
        } catch (error) {
            console.error('[PWAServiceWorkerManager] Service Worker registration failed:', error);
            return false;
        } finally {
            this.isRegistering = false;
        }
    }

    /**
     * Service Worker状態の監視
     */
    monitorServiceWorkerState() {
        if (!this.registration) {
            return;
        }

        // 更新チェック
        this.registration.addEventListener('updatefound', () => {
            const newWorker = this.registration.installing;
            if (newWorker) {
                console.log('[PWAServiceWorkerManager] New Service Worker found');
                this.handleServiceWorkerUpdate();

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[PWAServiceWorkerManager] New Service Worker installed');
                        this.updateAvailable = true;
                        this.pwaManager.showUpdateNotification();
                    }
                });
            }
        });

        // コントローラー変更の監視
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWAServiceWorkerManager] Service Worker controller changed');
            this.pwaManager.suggestPageReload();
        });

        // メッセージリスナー
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event);
        });
    }

    /**
     * Service Worker更新の処理
     */
    handleServiceWorkerUpdate() {
        console.log('[PWAServiceWorkerManager] Service Worker update detected');
        this.updateAvailable = true;
        this.pwaManager.showUpdateNotification();
    }

    /**
     * Service Worker更新の適用
     */
    applyServiceWorkerUpdate() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ action: 'SKIP_WAITING' });
        }
    }

    /**
     * アップデートチェック
     * @returns {Promise<boolean>} アップデート有無
     */
    async checkForUpdates() {
        if (!this.registration) {
            return false;
        }

        try {
            await this.registration.update();
            return this.updateAvailable;
        } catch (error) {
            console.error('[PWAServiceWorkerManager] Update check failed:', error);
            return false;
        }
    }

    /**
     * Service Workerメッセージの処理
     * @param {MessageEvent} event メッセージイベント
     */
    handleServiceWorkerMessage(event) {
        const { data } = event;
        
        if (!data || !data.type) {
            return;
        }

        console.log('[PWAServiceWorkerManager] Received message:', data.type);

        switch (data.type) {
            case 'CACHE_UPDATED':
                this.handleCacheUpdate(data);
                break;
            case 'OFFLINE_READY':
                this.handleOfflineReady(data);
                break;
            case 'SYNC_AVAILABLE':
                this.handleSyncAvailable(data);
                break;
            case 'UPDATE_AVAILABLE':
                this.handleUpdateMessage(data);
                break;
            default:
                console.log('[PWAServiceWorkerManager] Unknown message type:', data.type);
        }
    }

    /**
     * キャッシュ更新の処理
     * @param {Object} data メッセージデータ
     */
    handleCacheUpdate(data) {
        console.log('[PWAServiceWorkerManager] Cache updated:', data);
        // キャッシュ更新通知をPWAManagerに送信
        this.pwaManager.handleCacheUpdate?.(data);
    }

    /**
     * オフライン準備完了の処理
     * @param {Object} data メッセージデータ
     */
    handleOfflineReady(data) {
        console.log('[PWAServiceWorkerManager] Offline mode ready');
        this.pwaManager.offlineCapability = true;
    }

    /**
     * 同期利用可能の処理
     * @param {Object} data メッセージデータ
     */
    handleSyncAvailable(data) {
        console.log('[PWAServiceWorkerManager] Background sync available');
        // バックグラウンド同期の設定
        this.setupBackgroundSync();
    }

    /**
     * 更新メッセージの処理
     * @param {Object} data メッセージデータ
     */
    handleUpdateMessage(data) {
        console.log('[PWAServiceWorkerManager] Update message received:', data);
        this.updateAvailable = true;
        this.pwaManager.showUpdateNotification();
    }

    /**
     * バックグラウンド同期の設定
     */
    setupBackgroundSync() {
        if (!this.registration || !this.registration.sync) {
            console.warn('[PWAServiceWorkerManager] Background sync not supported');
            return;
        }

        // データ同期の登録
        this.registration.sync.register('sync-data').then(() => {
            console.log('[PWAServiceWorkerManager] Background sync registered');
        }).catch((error) => {
            console.error('[PWAServiceWorkerManager] Background sync registration failed:', error);
        });
    }

    /**
     * Service Workerにメッセージ送信
     * @param {Object} message 送信メッセージ
     * @returns {Promise<Object>} レスポンス
     */
    async postMessage(message) {
        if (!this.registration || !this.registration.active) {
            throw new Error('Service Worker not available');
        }

        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            
            messageChannel.port1.onmessage = (event) => {
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data);
                }
            };

            this.registration.active.postMessage(message, [messageChannel.port2]);
        });
    }

    /**
     * キャッシュの管理
     * @param {string} action アクション ('clear', 'update', 'status')
     * @param {Object} options オプション
     * @returns {Promise<Object>} 結果
     */
    async manageCache(action, options = {}) {
        try {
            const result = await this.postMessage({
                type: 'CACHE_MANAGEMENT',
                action: action,
                options: options
            });

            console.log(`[PWAServiceWorkerManager] Cache ${action} completed:`, result);
            return result;
        } catch (error) {
            console.error(`[PWAServiceWorkerManager] Cache ${action} failed:`, error);
            throw error;
        }
    }

    /**
     * オフラインリソースの事前キャッシュ
     * @param {Array} resources リソースURL配列
     * @returns {Promise<boolean>} キャッシュ成功可否
     */
    async precacheResources(resources) {
        try {
            const result = await this.postMessage({
                type: 'PRECACHE_RESOURCES',
                resources: resources
            });

            console.log('[PWAServiceWorkerManager] Resources precached:', result);
            return true;
        } catch (error) {
            console.error('[PWAServiceWorkerManager] Precaching failed:', error);
            return false;
        }
    }

    /**
     * Service Worker統計の取得
     * @returns {Promise<Object>} 統計データ
     */
    async getServiceWorkerStats() {
        try {
            const result = await this.postMessage({
                type: 'GET_STATS'
            });

            return {
                registration: !!this.registration,
                active: !!this.registration?.active,
                updateAvailable: this.updateAvailable,
                scope: this.registration?.scope,
                ...result
            };
        } catch (error) {
            console.error('[PWAServiceWorkerManager] Failed to get stats:', error);
            return {
                registration: !!this.registration,
                active: !!this.registration?.active,
                updateAvailable: this.updateAvailable,
                scope: this.registration?.scope,
                error: error.message
            };
        }
    }

    /**
     * Service Workerの登録解除
     * @returns {Promise<boolean>} 解除成功可否
     */
    async unregisterServiceWorker() {
        if (!this.registration) {
            return true;
        }

        try {
            const result = await this.registration.unregister();
            if (result) {
                console.log('[PWAServiceWorkerManager] Service Worker unregistered successfully');
                this.registration = null;
                this.updateAvailable = false;
            }
            return result;
        } catch (error) {
            console.error('[PWAServiceWorkerManager] Service Worker unregistration failed:', error);
            return false;
        }
    }

    /**
     * アプリマニフェストのチェック
     * @returns {Promise<Object>} マニフェスト情報
     */
    async checkAppManifest() {
        try {
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (!manifestLink) {
                throw new Error('Manifest link not found');
            }

            const response = await fetch(manifestLink.href);
            if (!response.ok) {
                throw new Error(`Failed to fetch manifest: ${response.status}`);
            }

            const manifest = await response.json();
            console.log('[PWAServiceWorkerManager] App manifest loaded:', manifest);

            return {
                valid: true,
                manifest: manifest,
                url: manifestLink.href
            };
        } catch (error) {
            console.error('[PWAServiceWorkerManager] Manifest check failed:', error);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * マニフェストの動的作成
     * @param {Object} config アプリ設定
     * @returns {Object} 作成されたマニフェスト
     */
    createAppManifest(config) {
        const manifest = {
            name: config.name || 'BubblePop Game',
            short_name: config.shortName || 'BubblePop',
            description: config.description || 'HTML5バブルポップパズルゲーム',
            start_url: config.startUrl || '/',
            display: config.display || 'standalone',
            theme_color: config.themeColor || '#4CAF50',
            background_color: config.backgroundColor || '#ffffff',
            orientation: config.orientation || 'portrait',
            scope: config.scope || '/',
            icons: config.icons || [
                {
                    src: '/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: '/icons/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ],
            categories: config.categories || ['games', 'entertainment'],
            lang: config.lang || 'ja',
            dir: config.dir || 'ltr'
        };

        console.log('[PWAServiceWorkerManager] Manifest created:', manifest);
        return manifest;
    }

    /**
     * 定期的な更新チェックの開始
     * @param {number} interval チェック間隔（ミリ秒）
     */
    startUpdateCheck(interval = 3600000) { // デフォルト1時間
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
        }

        this.updateCheckInterval = setInterval(async () => {
            console.log('[PWAServiceWorkerManager] Performing periodic update check');
            await this.checkForUpdates();
        }, interval);

        console.log(`[PWAServiceWorkerManager] Periodic update check started (${interval}ms interval)`);
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
        }

        // Service Workerイベントリスナーの削除
        if (this.registration) {
            this.registration.removeEventListener('updatefound', this.handleServiceWorkerUpdate);
        }

        console.log('[PWAServiceWorkerManager] Cleanup completed');
    }
}