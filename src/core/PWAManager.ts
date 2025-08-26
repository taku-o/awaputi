import { getConfigurationManager } from './ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getBrowserCompatibility } from '../utils/BrowserCompatibility.js';
import { PWAServiceWorkerManager } from './pwa/PWAServiceWorkerManager.js';
import { PWAInstallationManager } from './pwa/PWAInstallationManager.js';

/**
 * Progressive Web App Manager（Main Controller）
 * PWA機能の統合管理システム - Service Worker、オフライン機能、インストール管理
 */

interface PWAConfig {
    serviceWorker: {
        enabled: boolean;
        scriptPath: string;
        scope: string;
        updateCheckInterval: number;
    };
    installation: {
        enabled: boolean;
        autoPrompt: boolean;
        promptDelay: number;
    };
    offline: {
        enabled: boolean;
        cacheStrategy: string;
        fallbackPages: string[];
    };
    sync: {
        enabled: boolean;
        retryInterval: number;
    };
}

interface PWAState {
    isOnline: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
    serviceWorkerReady: boolean;
    offlineCapability: boolean;
    updateAvailable: boolean;
}

interface PWAStats {
    initializationTime: number;
    serviceWorkerRegistrationTime: number;
    offlineEvents: number;
    onlineEvents: number;
    installPrompts: number;
    lastUpdateCheck: number;
}

interface NetworkInfo {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
}

interface GameEngine {
    enableOnlineFeatures?: () => void;
    disableOnlineFeatures?: () => void;
    getGameState?: () => any;
    getUserProgress?: () => any;
    syncOfflineData?: (state: any) => Promise<void>;
}

export class PWAManager {
    private gameEngine: GameEngine | null;
    // private configManager: any;
    private errorHandler: any;
    // private browserCompatibility: any;
    private config: PWAConfig;
    private state: PWAState;
    private stats: PWAStats;
    private serviceWorkerManager: PWAServiceWorkerManager;
    private installationManager: PWAInstallationManager;
    // private networkInfo: NetworkInfo;

    constructor(gameEngine?: GameEngine) {
        this.gameEngine = gameEngine || null;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        this.browserCompatibility = getBrowserCompatibility();

        // 設定
        this.config = {
            serviceWorker: {
                enabled: true,
                scriptPath: '/sw.js',
                scope: '/',
                updateCheckInterval: 300000 // 5分
            },
            installation: {
                enabled: true,
                autoPrompt: false,
                promptDelay: 5000
            },
            offline: {
                enabled: true,
                cacheStrategy: 'cacheFirst',
                fallbackPages: ['/offline.html']
            },
            sync: {
                enabled: true,
                retryInterval: 60000 // 1分
            }
        };

        // PWA状態
        this.state = {
            isOnline: navigator.onLine,
            isInstalled: false,
            isStandalone: false,
            serviceWorkerReady: false,
            offlineCapability: false,
            updateAvailable: false
        };

        // パフォーマンス統計
        this.stats = {
            initializationTime: 0,
            serviceWorkerRegistrationTime: 0,
            offlineEvents: 0,
            onlineEvents: 0,
            installPrompts: 0,
            lastUpdateCheck: 0
        };

        this.networkInfo = {};

        // サブコンポーネントの初期化
        this.serviceWorkerManager = new PWAServiceWorkerManager(this);
        this.installationManager = new PWAInstallationManager(this);

        console.log('[PWAManager] Main Controller initialized');
    }

    /**
     * PWAシステムの初期化
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('[PWAManager] Initializing PWA system...');
            const startTime = performance.now();

            // PWAサポートのチェック
            if (!this.isPWASupported()) {
                console.warn('[PWAManager] PWA not supported in this browser');
                return false;
            }

            // PWA状態の検出
            this.detectPWAState();

            // Service Workerの登録
            if (this.config.serviceWorker.enabled) {
                const swStartTime = performance.now();
                const swRegistered = await this.serviceWorkerManager.registerServiceWorker();
                this.stats.serviceWorkerRegistrationTime = performance.now() - swStartTime;

                if (swRegistered) {
                    this.state.serviceWorkerReady = true;
                    console.log('[PWAManager] Service Worker registered successfully');
                } else {
                    console.warn('[PWAManager] Service Worker registration failed');
                }
            }

            // インストールプロンプトの設定
            if (this.config.installation.enabled) {
                this.installationManager.setupInstallPrompt();
            }

            // ネットワーク監視の開始
            this.startNetworkMonitoring();

            // PWAイベントリスナーの設定
            this.setupPWAEventListeners();

            // 更新チェックの開始
            this.serviceWorkerManager.startUpdateCheck(this.config.serviceWorker.updateCheckInterval);

            this.stats.initializationTime = performance.now() - startTime;
            console.log(`[PWAManager] Initialized successfully in ${this.stats.initializationTime.toFixed(2)}ms`);

            return true;
        } catch (error) {
            this.handleError(error, 'INITIALIZATION_ERROR');
            return false;
        }
    }

    /**
     * PWAサポートのチェック
     */
    isPWASupported(): boolean {
        return 'serviceWorker' in navigator && 'caches' in window;
    }

    /**
     * PWA状態の検出
     */
    detectPWAState(): void {
        // インストール状態の検出
        this.state.isInstalled = this.installationManager.isAppInstalled();
        // スタンドアローンモードの検出
        this.state.isStandalone = this.installationManager.isStandaloneMode();

        console.log('[PWAManager] PWA state detected:', this.state);
    }

    /**
     * ネットワーク監視の開始
     */
    startNetworkMonitoring(): void {
        window.addEventListener('online', () => {
            this.handleNetworkStateChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleNetworkStateChange(false);
        });

        // 初期ネットワーク状態の更新
        this.updateNetworkInfo();
    }

    /**
     * ネットワーク状態変更の処理
     */
    handleNetworkStateChange(isOnline: boolean): void {
        console.log(`[PWAManager] Network state changed: ${isOnline ? 'online' : 'offline'}`);
        
        const previousState = this.state.isOnline;
        this.state.isOnline = isOnline;

        if (isOnline && !previousState) {
            this.handleNetworkRecovery();
        } else if (!isOnline && previousState) {
            this.handleNetworkLoss();
        }

        this.updateNetworkInfo();
    }

    /**
     * ネットワーク復旧の処理
     */
    handleNetworkRecovery(): void {
        console.log('[PWAManager] Network recovered');
        this.stats.onlineEvents++;
        
        // オンライン限定機能の有効化
        this.enableOnlineOnlyFeatures();
        
        // オフライン通知の非表示
        this.hideOfflineIndicator();
        
        // 保留中データの同期
        this.syncPendingData();
    }

    /**
     * ネットワーク断絶の処理
     */
    handleNetworkLoss(): void {
        console.log('[PWAManager] Network lost');
        this.stats.offlineEvents++;
        
        // オフライン機能の有効化
        this.enableOfflineFeatures();
        
        // オフライン通知の表示
        this.showOfflineIndicator();
        
        // オンライン限定機能の無効化
        this.disableOnlineOnlyFeatures();
    }

    /**
     * ネットワーク情報の更新
     */
    updateNetworkInfo(): void {
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            this.networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
    }

    /**
     * オフライン機能の有効化
     */
    enableOfflineFeatures(): void {
        console.log('[PWAManager] Enabling offline features');
        
        // オフラインUI要素の表示
        this.updateOfflineUI();
        
        // オフライン用データの準備
        this.saveOfflineState();
    }

    /**
     * オンライン限定機能の有効化
     */
    enableOnlineOnlyFeatures(): void {
        console.log('[PWAManager] Enabling online-only features');
        
        // オンライン機能の復有
        this.gameEngine?.enableOnlineFeatures?.();
    }

    /**
     * オンライン限定機能の無効化
     */
    disableOnlineOnlyFeatures(): void {
        console.log('[PWAManager] Disabling online-only features');
        
        // オンライン機能の無効化
        this.gameEngine?.disableOnlineFeatures?.();
    }

    /**
     * オフラインUIの更新
     */
    updateOfflineUI(): void {
        document.body.classList.toggle('offline-mode', !this.state.isOnline);
    }

    /**
     * オフライン状態の保存
     */
    saveOfflineState(): void {
        const offlineState = {
            timestamp: Date.now(),
            gameState: this.gameEngine?.getGameState?.() || {},
            userProgress: this.gameEngine?.getUserProgress?.() || {}
        };

        localStorage.setItem('pwa_offline_state', JSON.stringify(offlineState));
    }

    /**
     * 保留中データの同期
     */
    async syncPendingData(): Promise<void> {
        try {
            console.log('[PWAManager] Syncing pending data');
            
            // オフライン状態の取得
            const offlineState = localStorage.getItem('pwa_offline_state');
            if (offlineState) {
                const state = JSON.parse(offlineState);
                await this.gameEngine?.syncOfflineData?.(state);
                localStorage.removeItem('pwa_offline_state');
            }
        } catch (error) {
            this.handleError(error, 'SYNC_ERROR');
        }
    }

    /**
     * オフライン表示器の表示
     */
    showOfflineIndicator(): void {
        let indicator = document.getElementById('pwa-offline-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pwa-offline-indicator';

            indicator.innerHTML = `
                <span class="offline-icon">📶</span>
                <span class="offline-text">オフラインモード</span>
            `;

            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: #FF9800;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                z-index: 1001;
                display: flex;
                align-items: center;
                gap: 8px;
            `;

            document.body.appendChild(indicator);
        }

        indicator.style.display = 'flex';
        console.log('[PWAManager] Offline indicator shown');
    }

    /**
     * オフライン表示器の非表示
     */
    hideOfflineIndicator(): void {
        const indicator = document.getElementById('pwa-offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        console.log('[PWAManager] Offline indicator hidden');
    }

    /**
     * PWAイベントリスナーの設定
     */
    setupPWAEventListeners(): void {
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // ページロード
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });
    }

    /**
     * ページ可視性変更の処理
     */
    handleVisibilityChange(): void {
        if (document.visibilityState === 'visible') {
            console.log('[PWAManager] Page became visible');
            
            // 更新チェック
            this.serviceWorkerManager.checkForUpdates();
            // 状態同期
            this.syncPendingData();
        } else {
            console.log('[PWAManager] Page became hidden');
            
            // 現在状態の保存
            this.saveCurrentState();
        }
    }

    /**
     * ページロードの処理
     */
    handlePageLoad(): void {
        console.log('[PWAManager] Page loaded');
        this.stats.lastUpdateCheck = Date.now();
    }

    /**
     * 現在状態の保存
     */
    saveCurrentState(): void {
        const currentState = {
            pwaState: this.state,
            timestamp: Date.now()
        };

        sessionStorage.setItem('pwa_current_state', JSON.stringify(currentState));
    }

    /**
     * 更新通知の表示
     */
    showUpdateNotification(): void {
        console.log('[PWAManager] Showing update notification');

        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';

        notification.innerHTML = `
            <div class="pwa-update-content">
                <span class="pwa-update-text">新しいバージョンが利用可能です</span>
                <button class="pwa-update-apply">更新</button>
                <button class="pwa-update-dismiss">後で</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2196F3;
            color: white;
            padding: 16px;
            border-radius: 8px;
            z-index: 1002;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;

        notification.querySelector('.pwa-update-apply')?.addEventListener('click', () => {
            this.serviceWorkerManager.applyServiceWorkerUpdate();
            document.body.removeChild(notification);
        });

        notification.querySelector('.pwa-update-dismiss')?.addEventListener('click', () => {
            document.body.removeChild(notification);
        });

        document.body.appendChild(notification);
    }

    /**
     * ページリロード提案
     */
    suggestPageReload(): void {
        console.log('[PWAManager] Suggesting page reload');

        if (confirm('アプリが更新されました。最新バージョンを利用するためにページを再読み込みしますか？')) {
            window.location.reload();
        }
    }

    /**
     * PWA状態の取得
     */
    getPWAState(): any {
        return {
            ...this.state,
            canInstall: this.installationManager.canInstall(),
            installStats: this.installationManager.getInstallStats(),
            serviceWorkerStats: this.serviceWorkerManager.getServiceWorkerStats()
        };
    }

    /**
     * インストール可能性のチェック
     */
    canInstall(): boolean {
        return this.installationManager.canInstall();
    }

    /**
     * インストールプロンプトの表示
     */
    async promptInstall(): Promise<boolean> {
        return await this.installationManager.promptInstall();
    }

    /**
     * オフライン状態のチェック
     */
    isOffline(): boolean {
        return !this.state.isOnline;
    }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<PWAConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('[PWAManager] Configuration updated');
    }

    /**
     * 統計情報の取得
     */
    getStats(): any {
        return {
            ...this.stats,
            serviceWorkerStats: this.serviceWorkerManager.getServiceWorkerStats(),
            installStats: this.installationManager.getInstallStats(),
            currentState: this.state
        };
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        // サブコンポーネントのクリーンアップ
        this.serviceWorkerManager.cleanup();
        this.installationManager.cleanup();

        const indicator = document.getElementById('pwa-offline-indicator');
        if (indicator) {
            indicator.remove();
        }

        console.log('[PWAManager] Cleanup completed');
    }

    /**
     * エラーハンドリング
     */
    handleError(error: any, context: string, data: any = {}): void {
        if (this.errorHandler) {
            this.errorHandler.handleError(error, context, {
                component: 'PWAManager',
                ...data
            });
        } else {
            console.error(`[PWAManager] ${context}:`, error, data);
        }
    }
}

// シングルトンインスタンス
let pwaManagerInstance: PWAManager | null = null;

/**
 * PWAManagerシングルトンインスタンスの取得
 */
export function getPWAManager(): PWAManager | null {
    if (!pwaManagerInstance) {
        pwaManagerInstance = new PWAManager();
    }
    return pwaManagerInstance;
}