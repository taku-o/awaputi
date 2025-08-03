import { getConfigurationManager } from './ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getBrowserCompatibility } from '../utils/BrowserCompatibility.js';

/**
 * Progressive Web App Manager
 * PWA機能の統合管理システム - Service Worker、オフライン機能、インストール管理
 * 
 * 主要機能:
 * - Service Worker の管理と更新
 * - オフライン機能とキャッシュ戦略
 * - PWA インストールプロンプト管理
 * - App Manifest の動的管理
 * - ネットワーク状態監視とオフライン対応
 * - データ同期システム
 */
export class PWAManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        this.browserCompatibility = getBrowserCompatibility();
        
        // PWA基本設定
        this.pwaConfig = {
            enabled: true,
            
            // Service Worker設定
            serviceWorker: {
                enabled: true,
                scriptPath: '/sw.js',
                scope: '/',
                updateCheckInterval: 300000, // 5分間隔で更新チェック
                skipWaiting: true,
                clientsClaim: true
            },
            
            // インストール設定
            installation: {
                enabled: true,
                deferPrompt: null,
                autoPrompt: false,
                promptDelay: 5000, // 5秒後にプロンプト表示
                maxPromptCount: 3,
                promptCount: 0,
                userChoice: null
            },
            
            // オフライン設定
            offline: {
                enabled: true,
                enabledFeatures: ['gameplay', 'settings', 'statistics'],
                disabledFeatures: ['multiplayer', 'achievements_sync'],
                dataSync: true,
                syncRetryAttempts: 3,
                syncRetryDelay: 5000
            },
            
            // キャッシュ設定
            cache: {
                version: '1.1.0-pwa',
                strategies: {
                    static: 'cache-first',
                    dynamic: 'network-first',
                    api: 'network-only'
                },
                
                // キャッシュ対象
                staticAssets: [
                    '/',
                    '/index.html',
                    '/test.html',
                    '/src/',
                    '/assets/',
                    '/styles/'
                ],
                
                // キャッシュサイズ制限
                limits: {
                    staticCache: 50, // MB
                    dynamicCache: 20, // MB
                    apiCache: 5, // MB
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7日間
                }
            }
        };
        
        // PWA状態管理
        this.pwaState = {
            isInstalled: false,
            isStandalone: false,
            hasServiceWorker: false,
            isOnline: navigator.onLine,
            installPromptAvailable: false,
            
            // Service Worker状態
            serviceWorkerState: {
                registration: null,
                active: null,
                installing: null,
                waiting: null,
                controller: null,
                updateAvailable: false
            },
            
            // ネットワーク状態
            networkState: {
                online: navigator.onLine,
                connectionType: 'unknown',
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false
            },
            
            // データ同期状態
            syncState: {
                enabled: true,
                pending: [],
                inProgress: false,
                lastSync: null,
                syncQueue: new Map(),
                conflicts: []
            }
        };
        
        // PWA機能検出
        this.features = {
            serviceWorkerSupported: 'serviceWorker' in navigator,
            manifestSupported: 'manifest' in document.createElement('link'),
            notificationSupported: 'Notification' in window,
            installPromptSupported: 'BeforeInstallPromptEvent' in window,
            backgroundSyncSupported: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            pushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
            badgeSupported: 'setAppBadge' in navigator || 'ExperimentalBadge' in window
        };
        
        // イベントリスナー
        this.eventListeners = new Map();
        
        // セッション開始時間を記録（統計用）
        this.sessionStartTime = Date.now();
        
        console.log('[PWAManager] PWA Manager初期化完了');
        console.log('[PWAManager] サポート機能:', this.features);
    }
    
    /**
     * PWAマネージャーの初期化
     */
    async initialize() {
        try {
            console.log('[PWAManager] PWA機能を初期化中...');
            
            // PWA状態の検出
            this.detectPWAState();
            
            // Service Worker の登録
            if (this.features.serviceWorkerSupported && this.pwaConfig.serviceWorker.enabled) {
                await this.registerServiceWorker();
            }
            
            // App Manifest の確認
            await this.checkAppManifest();
            
            // インストールプロンプトの設定
            this.setupInstallPrompt();
            
            // ネットワーク監視の開始
            this.startNetworkMonitoring();
            
            // データ同期システムの初期化
            this.initializeDataSync();
            
            // PWAイベントリスナーの設定
            this.setupPWAEventListeners();
            
            // 定期更新チェックの開始
            this.startUpdateCheck();
            
            console.log('[PWAManager] PWA機能初期化完了');
            
        } catch (error) {
            this.errorHandler.logError(error, {
                context: 'PWAManager.initialize',
                severity: 'high'
            });
        }
    }
    
    /**
     * PWA状態の検出
     */
    detectPWAState() {
        // インストール状態の検出
        this.pwaState.isInstalled = this.checkIfInstalled();
        
        // スタンドアロンモードの検出
        this.pwaState.isStandalone = this.checkIfStandalone();
        
        // Service Worker の状態確認
        this.pwaState.hasServiceWorker = navigator.serviceWorker.controller !== null;
        
        console.log('[PWAManager] PWA状態検出完了:', {
            installed: this.pwaState.isInstalled,
            standalone: this.pwaState.isStandalone,
            hasServiceWorker: this.pwaState.hasServiceWorker
        });
    }
    
    /**
     * インストール状態をチェック
     */
    checkIfInstalled() {
        // スタンドアロンモードまたはTWAで起動している場合
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        
        // Navigator standalone（主にiOS Safari）
        if (window.navigator.standalone === true) {
            return true;
        }
        
        // Chrome/Edge のインストール検出
        if (window.chrome && window.chrome.webstore) {
            return false;
        }
        
        return false;
    }
    
    /**
     * スタンドアロンモードをチェック
     */
    checkIfStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }
    
    /**
     * Service Worker の登録
     */
    async registerServiceWorker() {
        try {
            console.log('[PWAManager] Service Worker登録中...');
            
            const registration = await navigator.serviceWorker.register(
                this.pwaConfig.serviceWorker.scriptPath,
                {
                    scope: this.pwaConfig.serviceWorker.scope,
                    updateViaCache: 'none'
                }
            );
            
            this.pwaState.serviceWorkerState.registration = registration;
            
            // Service Worker状態の監視
            this.monitorServiceWorkerState(registration);
            
            // 更新チェック
            await this.checkForUpdates(registration);
            
            console.log('[PWAManager] Service Worker登録完了:', registration);
            
        } catch (error) {
            console.error('[PWAManager] Service Worker登録失敗:', error);
            this.errorHandler.logError(error, {
                context: 'PWAManager.registerServiceWorker'
            });
        }
    }
    
    /**
     * Service Worker状態の監視
     */
    monitorServiceWorkerState(registration) {
        const updateState = () => {
            this.pwaState.serviceWorkerState.active = registration.active;
            this.pwaState.serviceWorkerState.installing = registration.installing;
            this.pwaState.serviceWorkerState.waiting = registration.waiting;
            this.pwaState.serviceWorkerState.controller = navigator.serviceWorker.controller;
        };
        
        updateState();
        
        // 状態変更の監視
        registration.addEventListener('updatefound', () => {
            console.log('[PWAManager] Service Worker更新検出');
            this.pwaState.serviceWorkerState.updateAvailable = true;
            updateState();
            
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.addEventListener('statechange', () => {
                    updateState();
                    
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('[PWAManager] Service Worker更新利用可能');
                            this.handleServiceWorkerUpdate();
                        }
                    }
                });
            }
        });
        
        // Controller変更の監視
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWAManager] Service Worker controller変更');
            updateState();
            
            // ページリロードの提案
            this.suggestPageReload();
        });
    }
    
    /**
     * Service Worker更新の処理
     */
    handleServiceWorkerUpdate() {
        // ユーザーに更新を通知
        this.showUpdateNotification();
        
        // 自動更新が有効な場合
        if (this.pwaConfig.serviceWorker.skipWaiting) {
            this.applyServiceWorkerUpdate();
        }
    }
    
    /**
     * Service Worker更新の適用
     */
    applyServiceWorkerUpdate() {
        const registration = this.pwaState.serviceWorkerState.registration;
        
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }
    
    /**
     * ページリロードの提案
     */
    suggestPageReload() {
        // ゲームエンジンに通知
        if (this.gameEngine && this.gameEngine.onPWAUpdateAvailable) {
            this.gameEngine.onPWAUpdateAvailable();
        }
        
        // UI通知（実装は後で追加）
        console.log('[PWAManager] アプリの更新が利用可能です');
    }
    
    /**
     * 更新通知の表示
     */
    showUpdateNotification() {
        // 通知APIが利用可能な場合
        if (this.features.notificationSupported && Notification.permission === 'granted') {
            new Notification('アプリの更新', {
                body: 'ゲームの新しいバージョンが利用可能です',
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/badge-72x72.png',
                tag: 'app-update'
            });
        }
        
        // ゲーム内通知
        if (this.gameEngine && this.gameEngine.showNotification) {
            this.gameEngine.showNotification({
                title: 'アプリの更新',
                message: '新しいバージョンが利用可能です',
                type: 'info',
                actions: [
                    { label: '更新', action: () => this.applyServiceWorkerUpdate() },
                    { label: '後で', action: () => {} }
                ]
            });
        }
    }
    
    /**
     * 更新チェック
     */
    async checkForUpdates(registration) {
        try {
            await registration.update();
            console.log('[PWAManager] 更新チェック完了');
        } catch (error) {
            console.warn('[PWAManager] 更新チェック失敗:', error);
        }
    }
    
    /**
     * App Manifest の確認
     */
    async checkAppManifest() {
        try {
            // Manifest要素の存在確認
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (!manifestLink) {
                console.warn('[PWAManager] App Manifestが見つかりません');
                await this.createAppManifest();
                return;
            }
            
            // Manifestの読み込み確認
            const manifestUrl = manifestLink.href;
            const response = await fetch(manifestUrl);
            
            if (response.ok) {
                const manifest = await response.json();
                console.log('[PWAManager] App Manifest確認完了:', manifest);
            } else {
                console.error('[PWAManager] App Manifest読み込み失敗');
                await this.createAppManifest();
            }
            
        } catch (error) {
            console.error('[PWAManager] App Manifest確認エラー:', error);
            await this.createAppManifest();
        }
    }
    
    /**
     * App Manifest の作成
     */
    async createAppManifest() {
        console.log('[PWAManager] App Manifestを作成中...');
        
        const manifest = {
            name: 'BubblePop Game',
            short_name: 'BubblePop',
            description: 'HTML5 Canvas バブルポップゲーム',
            start_url: '/',
            display: 'standalone',
            orientation: 'portrait-primary',
            theme_color: '#4CAF50',
            background_color: '#ffffff',
            categories: ['games', 'entertainment'],
            lang: 'ja',
            
            icons: [
                {
                    src: '/assets/icons/icon-72x72.png',
                    sizes: '72x72',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-96x96.png',
                    sizes: '96x96',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-128x128.png',
                    sizes: '128x128',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-144x144.png',
                    sizes: '144x144',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-152x152.png',
                    sizes: '152x152',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-384x384.png',
                    sizes: '384x384',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/assets/icons/icon-maskable-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'maskable'
                },
                {
                    src: '/assets/icons/icon-maskable-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable'
                }
            ],
            
            shortcuts: [
                {
                    name: 'クイックプレイ',
                    short_name: 'プレイ',
                    description: '即座にゲームを開始',
                    url: '/?action=quickplay',
                    icons: [
                        {
                            src: '/assets/icons/shortcut-play.png',
                            sizes: '96x96'
                        }
                    ]
                },
                {
                    name: '統計',
                    short_name: '統計',
                    description: 'プレイ統計を表示',
                    url: '/?action=stats',
                    icons: [
                        {
                            src: '/assets/icons/shortcut-stats.png',
                            sizes: '96x96'
                        }
                    ]
                }
            ],
            
            screenshots: [
                {
                    src: '/assets/screenshots/game-portrait.png',
                    sizes: '540x720',
                    type: 'image/png',
                    form_factor: 'narrow'
                },
                {
                    src: '/assets/screenshots/game-landscape.png',
                    sizes: '720x540',
                    type: 'image/png',
                    form_factor: 'wide'
                }
            ]
        };
        
        // 動的にmanifest linkを追加
        const existingLink = document.querySelector('link[rel="manifest"]');
        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
            document.head.appendChild(link);
            
            console.log('[PWAManager] App Manifest動的作成完了');
        }
    }
    
    /**
     * インストールプロンプトの設定
     */
    setupInstallPrompt() {
        if (!this.features.installPromptSupported) {
            console.log('[PWAManager] インストールプロンプトはサポートされていません');
            return;
        }
        
        // beforeinstallpromptイベントの処理
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('[PWAManager] インストールプロンプト利用可能');
            
            // デフォルトプロンプトを防ぐ
            event.preventDefault();
            
            // プロンプトを保存
            this.pwaConfig.installation.deferPrompt = event;
            this.pwaState.installPromptAvailable = true;
            
            // 自動プロンプトが有効な場合
            if (this.pwaConfig.installation.autoPrompt) {
                setTimeout(() => {
                    this.showInstallPrompt();
                }, this.pwaConfig.installation.promptDelay);
            }
            
            // ゲームエンジンに通知
            if (this.gameEngine && this.gameEngine.onInstallPromptAvailable) {
                this.gameEngine.onInstallPromptAvailable();
            }
        });
        
        // インストール完了イベント
        window.addEventListener('appinstalled', (event) => {
            console.log('[PWAManager] アプリがインストールされました');
            this.pwaState.isInstalled = true;
            this.pwaConfig.installation.deferPrompt = null;
            this.pwaState.installPromptAvailable = false;
            
            // ゲームエンジンに通知
            if (this.gameEngine && this.gameEngine.onAppInstalled) {
                this.gameEngine.onAppInstalled();
            }
            
            // インストール完了の統計記録
            this.recordInstallEvent('completed');
        });
    }
    
    /**
     * インストールプロンプトの表示
     */
    async showInstallPrompt() {
        if (!this.pwaConfig.installation.deferPrompt) {
            console.log('[PWAManager] インストールプロンプトは利用できません');
            return false;
        }
        
        // プロンプト回数制限チェック
        if (this.pwaConfig.installation.promptCount >= this.pwaConfig.installation.maxPromptCount) {
            console.log('[PWAManager] インストールプロンプト回数制限に達しました');
            return false;
        }
        
        try {
            // プロンプト表示前の分析データ収集
            const promptAnalytics = {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                platform: this.browserCompatibility.deviceInfo?.platform || 'unknown',
                pageUrl: window.location.href,
                sessionDuration: Date.now() - (this.sessionStartTime || Date.now()),
                previousAttempts: this.pwaConfig.installation.promptCount,
                gameState: this.gameEngine ? this.gameEngine.getCurrentSceneName() : 'unknown'
            };
            
            // プロンプトを表示
            this.pwaConfig.installation.deferPrompt.prompt();
            this.pwaConfig.installation.promptCount++;
            
            // ユーザーの選択を待つ
            const { outcome } = await this.pwaConfig.installation.deferPrompt.userChoice;
            this.pwaConfig.installation.userChoice = outcome;
            
            // 完了時のanalyticsデータ更新
            promptAnalytics.outcome = outcome;
            promptAnalytics.responseTime = Date.now() - promptAnalytics.timestamp;
            
            console.log('[PWAManager] インストールプロンプト結果:', outcome);
            
            // 詳細統計記録
            this.recordInstallEvent(outcome, promptAnalytics);
            
            // ユーザー体験の向上: 結果に応じた適切なフィードバック
            if (outcome === 'accepted') {
                this.showInstallSuccessMessage();
            } else if (outcome === 'dismissed') {
                this.handleInstallDismissal();
            }
            
            // プロンプトをクリア
            this.pwaConfig.installation.deferPrompt = null;
            this.pwaState.installPromptAvailable = false;
            
            return outcome === 'accepted';
            
        } catch (error) {
            console.error('[PWAManager] インストールプロンプトエラー:', error);
            // エラー時の統計記録
            this.recordInstallEvent('error', { error: error.message });
            return false;
        }
    }
    
    /**
     * インストール成功メッセージの表示
     */
    showInstallSuccessMessage() {
        if (this.gameEngine && this.gameEngine.showNotification) {
            this.gameEngine.showNotification({
                title: 'インストールありがとうございます！',
                message: 'ホーム画面からアプリを起動できます',
                type: 'success',
                duration: 5000
            });
        }
    }
    
    /**
     * インストール拒否時の処理
     */
    handleInstallDismissal() {
        // 次回プロンプト表示の遅延
        const nextPromptDelay = Math.min(
            this.pwaConfig.installation.promptDelay * Math.pow(2, this.pwaConfig.installation.promptCount),
            24 * 60 * 60 * 1000 // 最大24時間
        );
        
        // 遅延時間を記録
        localStorage.setItem('pwa_next_prompt_time', Date.now() + nextPromptDelay);
        
        console.log('[PWAManager] 次回プロンプト表示予定:', new Date(Date.now() + nextPromptDelay));
    }
    
    /**
     * インストールイベントの記録
     */
    recordInstallEvent(event, analytics = {}) {
        // 基本統計データ
        const eventData = {
            event: event,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            platform: this.browserCompatibility.deviceInfo?.platform || 'unknown',
            ...analytics
        };
        
        // 統計記録（StatisticsManagerがある場合）
        if (this.gameEngine && this.gameEngine.statisticsManager) {
            this.gameEngine.statisticsManager.recordEvent('pwa_install', eventData);
        }
        
        // ローカルストレージにも保存（分析用）
        const installHistory = JSON.parse(localStorage.getItem('pwa_install_history') || '[]');
        installHistory.push(eventData);
        
        // 履歴は最大50件まで保持
        if (installHistory.length > 50) {
            installHistory.splice(0, installHistory.length - 50);
        }
        
        localStorage.setItem('pwa_install_history', JSON.stringify(installHistory));
        
        console.log('[PWAManager] インストールイベント記録:', eventData);
    }
    
    /**
     * ネットワーク監視の開始
     */
    startNetworkMonitoring() {
        // オンライン/オフライン状態の監視
        window.addEventListener('online', () => {
            console.log('[PWAManager] ネットワーク接続復旧');
            this.pwaState.networkState.online = true;
            this.pwaState.isOnline = true;
            this.handleNetworkStateChange(true);
        });
        
        window.addEventListener('offline', () => {
            console.log('[PWAManager] ネットワーク接続断');
            this.pwaState.networkState.online = false;
            this.pwaState.isOnline = false;
            this.handleNetworkStateChange(false);
        });
        
        // ネットワーク情報の監視（Connection APIが利用可能な場合）
        if (navigator.connection) {
            this.updateNetworkInfo();
            
            navigator.connection.addEventListener('change', () => {
                this.updateNetworkInfo();
            });
        }
    }
    
    /**
     * ネットワーク情報の更新
     */
    updateNetworkInfo() {
        if (!navigator.connection) return;
        
        const connection = navigator.connection;
        
        this.pwaState.networkState = {
            ...this.pwaState.networkState,
            connectionType: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false
        };
        
        console.log('[PWAManager] ネットワーク情報更新:', this.pwaState.networkState);
    }
    
    /**
     * ネットワーク状態変更の処理
     */
    handleNetworkStateChange(isOnline) {
        if (isOnline) {
            // オンライン復帰時の処理
            this.handleNetworkRecovery();
        } else {
            // オフライン時の処理
            this.handleNetworkLoss();
        }
        
        // ゲームエンジンに通知
        if (this.gameEngine && this.gameEngine.onNetworkStateChange) {
            this.gameEngine.onNetworkStateChange(isOnline);
        }
    }
    
    /**
     * ネットワーク復帰時の処理
     */
    async handleNetworkRecovery() {
        console.log('[PWAManager] ネットワーク復帰処理開始');
        
        // データ同期の開始
        if (this.pwaConfig.offline.dataSync) {
            await this.startDataSync();
        }
        
        // Service Worker更新チェック
        if (this.pwaState.serviceWorkerState.registration) {
            await this.checkForUpdates(this.pwaState.serviceWorkerState.registration);
        }
        
        // オフライン時に蓄積されたデータの送信
        await this.syncOfflineData();
    }
    
    /**
     * ネットワーク断絶時の処理
     */
    handleNetworkLoss() {
        console.log('[PWAManager] オフライン移行処理開始');
        
        // オフライン機能の有効化
        this.enableOfflineFeatures();
        
        // 現在の状態を保存
        this.saveOfflineState();
        
        // ユーザーに通知
        this.showOfflineNotification();
    }
    
    /**
     * オフライン機能の有効化
     */
    enableOfflineFeatures() {
        // オフライン時に利用可能な機能を有効化
        const enabledFeatures = this.pwaConfig.offline.enabledFeatures;
        const disabledFeatures = this.pwaConfig.offline.disabledFeatures;
        
        // 機能別の詳細制御
        const offlineConfig = {
            enabled: enabledFeatures,
            disabled: disabledFeatures,
            
            // 機能別の設定
            gameplay: {
                enabled: enabledFeatures.includes('gameplay'),
                saveLocalScore: true,
                cacheAssets: true,
                limitedBubbleTypes: ['normal', 'stone', 'rainbow', 'pink'] // オフライン時は基本的な泡のみ
            },
            
            settings: {
                enabled: enabledFeatures.includes('settings'),
                allowLocalChanges: true,
                syncOnReconnect: true
            },
            
            statistics: {
                enabled: enabledFeatures.includes('statistics'),
                trackOfflineStats: true,
                queueForSync: true
            },
            
            achievements: {
                enabled: !disabledFeatures.includes('achievements_sync'),
                localProcessing: true,
                syncRequired: true
            }
        };
        
        // ゲームエンジンの設定を更新
        if (this.gameEngine) {
            if (this.gameEngine.setOfflineMode) {
                this.gameEngine.setOfflineMode(offlineConfig);
            }
            
            // 各マネージャーへの個別通知
            if (this.gameEngine.bubbleManager) {
                this.gameEngine.bubbleManager.setOfflineMode(offlineConfig.gameplay);
            }
            
            if (this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.setOfflineMode(offlineConfig.settings);
            }
            
            if (this.gameEngine.statisticsManager) {
                this.gameEngine.statisticsManager.setOfflineMode(offlineConfig.statistics);
            }
            
            if (this.gameEngine.achievementManager) {
                this.gameEngine.achievementManager.setOfflineMode(offlineConfig.achievements);
            }
        }
        
        // オフライン状態のUI更新
        this.updateOfflineUI(true);
        
        console.log('[PWAManager] オフライン機能有効化:', offlineConfig);
    }
    
    /**
     * オフライン状態のUI更新
     */
    updateOfflineUI(isOffline) {
        // オフライン状態インジケータの表示/非表示
        if (isOffline) {
            this.showOfflineIndicator();
            this.disableOnlineOnlyFeatures();
        } else {
            this.hideOfflineIndicator();
            this.enableOnlineOnlyFeatures();
        }
        
        // ゲーム内UIの更新
        if (this.gameEngine && this.gameEngine.updateNetworkStatusUI) {
            this.gameEngine.updateNetworkStatusUI(!isOffline);
        }
    }
    
    /**
     * オンライン限定機能の無効化
     */
    disableOnlineOnlyFeatures() {
        const onlineOnlyElements = document.querySelectorAll('[data-require-online="true"]');
        onlineOnlyElements.forEach(element => {
            element.disabled = true;
            element.classList.add('offline-disabled');
            element.title = 'この機能はオンライン時のみ利用できます';
        });
        
        console.log('[PWAManager] オンライン限定機能を無効化:', onlineOnlyElements.length);
    }
    
    /**
     * オンライン限定機能の有効化
     */
    enableOnlineOnlyFeatures() {
        const onlineOnlyElements = document.querySelectorAll('[data-require-online="true"]');
        onlineOnlyElements.forEach(element => {
            element.disabled = false;
            element.classList.remove('offline-disabled');
            element.title = '';
        });
        
        console.log('[PWAManager] オンライン限定機能を有効化:', onlineOnlyElements.length);
    }
    
    /**
     * オフライン状態の保存
     */
    saveOfflineState() {
        const offlineState = {
            timestamp: Date.now(),
            gameState: this.gameEngine ? this.gameEngine.getCurrentState() : null,
            userProgress: this.gameEngine ? this.gameEngine.getUserProgress() : null
        };
        
        localStorage.setItem('pwa_offline_state', JSON.stringify(offlineState));
        console.log('[PWAManager] オフライン状態保存完了');
    }
    
    /**
     * オフライン通知の表示
     */
    showOfflineNotification() {
        // ユーザーフレンドリーな通知
        const offlineFeatures = this.pwaConfig.offline.enabledFeatures;
        const availableFeatures = offlineFeatures.map(feature => {
            switch (feature) {
                case 'gameplay': return 'ゲームプレイ';
                case 'settings': return '設定変更';
                case 'statistics': return '統計表示';
                default: return feature;
            }
        }).join('、');
        
        if (this.gameEngine && this.gameEngine.showNotification) {
            this.gameEngine.showNotification({
                title: 'オフラインモード',
                message: `ネットワーク接続がありません。${availableFeatures}は引き続き利用できます。`,
                type: 'info',
                duration: 6000,
                actions: [
                    {
                        label: 'OK',
                        action: () => this.acknowledgeOfflineMode()
                    }
                ]
            });
        }
        
        // ブラウザ通知も表示（権限がある場合）
        if (this.features.notificationSupported && Notification.permission === 'granted') {
            new Notification('BubblePop - オフラインモード', {
                body: `ネットワーク接続がありません。基本機能は利用できます。`,
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/badge-72x72.png',
                tag: 'offline-mode'
            });
        }
        
        console.log('[PWAManager] オフライン通知表示:', { availableFeatures });
    }
    
    /**
     * オフラインモードの承認
     */
    acknowledgeOfflineMode() {
        // ユーザーがオフラインモードを承認したことを記録
        localStorage.setItem('pwa_offline_acknowledged', Date.now().toString());
        console.log('[PWAManager] オフラインモード承認');
    }
    
    /**
     * データ同期システムの初期化
     */
    initializeDataSync() {
        if (!this.pwaConfig.offline.dataSync) return;
        
        // 同期キューの初期化
        this.pwaState.syncState.syncQueue = new Map();
        
        // 保留中の同期データの読み込み
        this.loadPendingSyncData();
        
        console.log('[PWAManager] データ同期システム初期化完了');
    }
    
    /**
     * 保留中の同期データの読み込み
     */
    loadPendingSyncData() {
        try {
            const pendingData = localStorage.getItem('pwa_pending_sync');
            if (pendingData) {
                const data = JSON.parse(pendingData);
                this.pwaState.syncState.pending = data || [];
                console.log('[PWAManager] 保留同期データ読み込み:', this.pwaState.syncState.pending.length);
            }
        } catch (error) {
            console.error('[PWAManager] 保留同期データ読み込みエラー:', error);
        }
    }
    
    /**
     * データ同期の開始
     */
    async startDataSync() {
        if (this.pwaState.syncState.inProgress) {
            console.log('[PWAManager] データ同期は既に進行中です');
            return;
        }
        
        this.pwaState.syncState.inProgress = true;
        console.log('[PWAManager] データ同期開始');
        
        try {
            // 保留データの同期
            await this.syncPendingData();
            
            // 最新データの取得
            await this.fetchLatestData();
            
            this.pwaState.syncState.lastSync = Date.now();
            console.log('[PWAManager] データ同期完了');
            
        } catch (error) {
            console.error('[PWAManager] データ同期エラー:', error);
        } finally {
            this.pwaState.syncState.inProgress = false;
        }
    }
    
    /**
     * 保留データの同期
     */
    async syncPendingData() {
        const pending = this.pwaState.syncState.pending;
        
        for (const data of pending) {
            try {
                await this.syncDataItem(data);
                
                // 成功した項目を削除
                const index = pending.indexOf(data);
                if (index > -1) {
                    pending.splice(index, 1);
                }
                
            } catch (error) {
                console.error('[PWAManager] データ項目同期エラー:', error);
                
                // リトライ回数を増やす
                data.retryCount = (data.retryCount || 0) + 1;
                
                // リトライ上限に達した場合は削除
                if (data.retryCount >= this.pwaConfig.offline.syncRetryAttempts) {
                    const index = pending.indexOf(data);
                    if (index > -1) {
                        pending.splice(index, 1);
                        console.warn('[PWAManager] データ項目同期諦め:', data);
                    }
                }
            }
        }
        
        // 保留データを保存
        localStorage.setItem('pwa_pending_sync', JSON.stringify(pending));
    }
    
    /**
     * データ項目の同期
     */
    async syncDataItem(dataItem) {
        // ここで実際のAPI呼び出しを行う
        // 例: await fetch('/api/sync', { method: 'POST', body: JSON.stringify(dataItem) });
        
        console.log('[PWAManager] データ項目同期:', dataItem.type);
        
        // 模擬的な同期処理
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90%の成功率
                    resolve();
                } else {
                    reject(new Error('同期失敗'));
                }
            }, 100);
        });
    }
    
    /**
     * 最新データの取得
     */
    async fetchLatestData() {
        // サーバーから最新データを取得
        console.log('[PWAManager] 最新データ取得中...');
        
        // 実際の実装では、ここでAPIからデータを取得
        // 例: const response = await fetch('/api/latest-data');
        
        return true;
    }
    
    /**
     * オフラインデータの同期
     */
    async syncOfflineData() {
        try {
            const offlineState = localStorage.getItem('pwa_offline_state');
            if (!offlineState) return;
            
            const state = JSON.parse(offlineState);
            console.log('[PWAManager] オフラインデータ同期中...', state);
            
            // オフライン時のデータをサーバーに送信
            await this.uploadOfflineState(state);
            
            // オフライン状態をクリア
            localStorage.removeItem('pwa_offline_state');
            
        } catch (error) {
            console.error('[PWAManager] オフラインデータ同期エラー:', error);
        }
    }
    
    /**
     * オフライン状態のアップロード
     */
    async uploadOfflineState(state) {
        // 実際の実装では、ここでサーバーにデータを送信
        console.log('[PWAManager] オフライン状態アップロード完了');
        return true;
    }
    
    /**
     * PWAイベントリスナーの設定
     */
    setupPWAEventListeners() {
        // Service Workerからのメッセージ
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event);
        });
        
        // ページの可視性変更
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // ページ読み込み完了
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });
    }
    
    /**
     * Service Workerメッセージの処理
     */
    handleServiceWorkerMessage(event) {
        const { type, payload } = event.data || {};
        
        switch (type) {
            case 'CACHE_UPDATED':
                console.log('[PWAManager] キャッシュ更新通知:', payload);
                break;
                
            case 'OFFLINE_READY':
                console.log('[PWAManager] オフライン準備完了');
                break;
                
            case 'UPDATE_AVAILABLE':
                console.log('[PWAManager] アップデート利用可能');
                this.handleServiceWorkerUpdate();
                break;
                
            default:
                console.log('[PWAManager] Service Workerメッセージ:', event.data);
        }
    }
    
    /**
     * ページ可視性変更の処理
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // ページが表示された時
            console.log('[PWAManager] ページ表示');
            
            // 更新チェック
            if (this.pwaState.serviceWorkerState.registration) {
                this.checkForUpdates(this.pwaState.serviceWorkerState.registration);
            }
        } else {
            // ページが非表示になった時
            console.log('[PWAManager] ページ非表示');
            
            // 現在の状態を保存
            this.saveCurrentState();
        }
    }
    
    /**
     * ページ読み込み完了の処理
     */
    handlePageLoad() {
        console.log('[PWAManager] ページ読み込み完了');
        
        // PWA関連のUI要素を表示
        this.showPWAUI();
        
        // 初回実行時の処理
        this.handleFirstRun();
    }
    
    /**
     * 現在の状態を保存
     */
    saveCurrentState() {
        if (this.gameEngine && this.gameEngine.saveCurrentState) {
            this.gameEngine.saveCurrentState();
        }
    }
    
    /**
     * PWA UI の表示
     */
    showPWAUI() {
        // インストールボタンの表示/非表示
        if (this.pwaState.installPromptAvailable && !this.pwaState.isInstalled) {
            this.showInstallButton();
        } else {
            this.hideInstallButton();
        }
        
        // オフライン状態の表示
        if (!this.pwaState.isOnline) {
            this.showOfflineIndicator();
        }
    }
    
    /**
     * インストールボタンの表示
     */
    showInstallButton() {
        // UI実装は後で追加
        console.log('[PWAManager] インストールボタン表示');
    }
    
    /**
     * インストールボタンの非表示
     */
    hideInstallButton() {
        // UI実装は後で追加
        console.log('[PWAManager] インストールボタン非表示');
    }
    
    /**
     * オフライン状態インジケータの表示
     */
    showOfflineIndicator() {
        // 既存のオフラインインジケータを削除
        this.hideOfflineIndicator();
        
        // オフライン状態インジケータを作成
        const indicator = document.createElement('div');
        indicator.id = 'pwa-offline-indicator';
        indicator.className = 'pwa-offline-indicator';
        indicator.innerHTML = `
            <div class="offline-icon">📴</div>
            <div class="offline-text">オフライン</div>
        `;
        
        // スタイルを設定
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b35;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: pwaSlideIn 0.3s ease-out;
        `;
        
        // アニメーションCSS追加
        if (!document.getElementById('pwa-offline-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-offline-styles';
            styles.textContent = `
                @keyframes pwaSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes pwaSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                
                .pwa-offline-indicator:hover {
                    background: #e55a2b;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // クリックでより詳細な情報を表示
        indicator.addEventListener('click', () => {
            this.showOfflineDetails();
        });
        
        document.body.appendChild(indicator);
        console.log('[PWAManager] オフライン状態インジケータ表示');
    }
    
    /**
     * オフライン状態インジケータを非表示
     */
    hideOfflineIndicator() {
        const indicator = document.getElementById('pwa-offline-indicator');
        if (indicator) {
            indicator.style.animation = 'pwaSlideOut 0.3s ease-in';
            setTimeout(() => {
                indicator.remove();
            }, 300);
            console.log('[PWAManager] オフライン状態インジケータ非表示');
        }
    }
    
    /**
     * オフライン詳細情報を表示
     */
    showOfflineDetails() {
        const enabledFeatures = this.pwaConfig.offline.enabledFeatures;
        const disabledFeatures = this.pwaConfig.offline.disabledFeatures;
        
        if (this.gameEngine && this.gameEngine.showNotification) {
            this.gameEngine.showNotification({
                title: 'オフラインモード詳細',
                message: `
                    利用可能: ${enabledFeatures.join('、')}
                    利用不可: ${disabledFeatures.join('、')}
                    
                    ネットワーク復旧時に自動的にデータが同期されます。
                `,
                type: 'info',
                duration: 8000
            });
        }
    }
    
    /**
     * 初回実行時の処理
     */
    handleFirstRun() {
        const isFirstRun = !localStorage.getItem('pwa_initialized');
        
        if (isFirstRun) {
            console.log('[PWAManager] 初回実行');
            
            // 初回実行フラグを設定
            localStorage.setItem('pwa_initialized', 'true');
            
            // 初回実行時の処理
            this.showWelcomeMessage();
            
            // 権限要求（通知など）
            this.requestPermissions();
        }
    }
    
    /**
     * ウェルカムメッセージの表示
     */
    showWelcomeMessage() {
        if (this.gameEngine && this.gameEngine.showNotification) {
            this.gameEngine.showNotification({
                title: 'BubblePop へようこそ！',
                message: 'ホーム画面に追加してより快適にプレイできます',
                type: 'info',
                duration: 8000
            });
        }
    }
    
    /**
     * 権限の要求
     */
    async requestPermissions() {
        // 通知権限の要求
        if (this.features.notificationSupported && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                console.log('[PWAManager] 通知権限:', permission);
            } catch (error) {
                console.error('[PWAManager] 通知権限要求エラー:', error);
            }
        }
    }
    
    /**
     * 定期更新チェックの開始
     */
    startUpdateCheck() {
        if (!this.pwaConfig.serviceWorker.updateCheckInterval) return;
        
        setInterval(async () => {
            if (this.pwaState.serviceWorkerState.registration) {
                await this.checkForUpdates(this.pwaState.serviceWorkerState.registration);
            }
        }, this.pwaConfig.serviceWorker.updateCheckInterval);
        
        console.log('[PWAManager] 定期更新チェック開始');
    }
    
    // Public API Methods
    
    /**
     * PWA状態の取得
     */
    getPWAState() {
        return {
            ...this.pwaState,
            features: this.features,
            config: this.pwaConfig
        };
    }
    
    /**
     * インストール可能状態の確認
     */
    canInstall() {
        return this.pwaState.installPromptAvailable && !this.pwaState.isInstalled;
    }
    
    /**
     * 手動インストールプロンプト
     */
    async promptInstall() {
        return await this.showInstallPrompt();
    }
    
    /**
     * オフライン状態の確認
     */
    isOffline() {
        return !this.pwaState.isOnline;
    }
    
    /**
     * データの同期追加
     */
    addToSyncQueue(data) {
        if (!this.pwaConfig.offline.dataSync) return;
        
        this.pwaState.syncState.pending.push({
            ...data,
            timestamp: Date.now(),
            retryCount: 0
        });
        
        // ローカルストレージに保存
        localStorage.setItem('pwa_pending_sync', JSON.stringify(this.pwaState.syncState.pending));
        
        // オンラインの場合は即座に同期
        if (this.pwaState.isOnline) {
            this.startDataSync();
        }
    }
    
    /**
     * PWA設定の更新
     */
    updateConfig(config) {
        Object.assign(this.pwaConfig, config);
        console.log('[PWAManager] 設定更新:', config);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // イベントリスナーの削除
        this.eventListeners.forEach((listener, event) => {
            window.removeEventListener(event, listener);
        });
        
        this.eventListeners.clear();
        
        console.log('[PWAManager] クリーンアップ完了');
    }
}

// グローバルインスタンス（遅延初期化）
let _pwaManager = null;

/**
 * PWAManagerのグローバルインスタンスを取得
 */
export function getPWAManager(gameEngine = null) {
    if (!_pwaManager) {
        _pwaManager = new PWAManager(gameEngine);
        console.log('[PWAManager] グローバルインスタンスを作成しました');
    }
    return _pwaManager;
}

/**
 * PWAManagerインスタンスを再初期化
 */
export function reinitializePWAManager(gameEngine = null) {
    if (_pwaManager) {
        _pwaManager.cleanup();
    }
    _pwaManager = new PWAManager(gameEngine);
    console.log('[PWAManager] 再初期化完了');
    return _pwaManager;
}

// 後方互換性のため
export const pwaManager = getPWAManager;