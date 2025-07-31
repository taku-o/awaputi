/**
 * PWA Test Framework
 * PWA機能の包括的テストフレームワーク
 * 
 * 主要機能:
 * - Service Worker テスト
 * - インストールフロー テスト
 * - オフライン機能 テスト
 * - アイコン表示 テスト
 * - キャッシュ機能 テスト
 */

export class PWATestFramework {
    constructor() {
        this.testResults = [];
        this.testSuite = new Map();
        this.timeouts = new Map();
        this.mockData = new Map();
        
        // テスト設定
        this.config = {
            defaultTimeout: 10000,
            retryAttempts: 3,
            verbose: true,
            
            // テスト対象URL
            baseUrl: window.location.origin,
            manifestUrl: '/manifest.json',
            serviceWorkerUrl: '/sw.js',
            
            // 期待される設定値
            expectedConfig: {
                appName: 'BubblePop',
                themeColor: '#4CAF50',
                backgroundColor: '#ffffff',
                displayMode: 'standalone',
                orientation: 'portrait-primary'
            }
        };
        
        // テスト状態
        this.state = {
            isRunning: false,
            currentTest: null,
            startTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0
        };
        
        console.log('[PWATestFramework] PWAテストフレームワーク初期化完了');
    }
    
    /**
     * 全テストスイートの実行
     */
    async runAllTests() {
        console.log('[PWATestFramework] 全PWAテスト開始');
        this.startTestSession();
        
        try {
            // 基本PWA機能テスト
            await this.runBasicPWATests();
            
            // Service Worker テスト
            await this.runServiceWorkerTests();
            
            // インストールテスト
            await this.runInstallationTests();
            
            // オフライン機能テスト
            await this.runOfflineTests();
            
            // アイコン・UI テスト
            await this.runIconAndUITests();
            
            // パフォーマンステスト
            await this.runPerformanceTests();
            
            // ブラウザ互換性テスト
            await this.runBrowserCompatibilityTests();
            
        } catch (error) {
            this.logError('テストスイート実行エラー', error);
        } finally {
            this.endTestSession();
        }
        
        return this.generateTestReport();
    }
    
    /**
     * 基本PWA機能テスト
     */
    async runBasicPWATests() {
        console.log('[PWATestFramework] 基本PWA機能テスト開始');
        
        await this.runTest('manifest-exists', 'App Manifest存在確認', async () => {
            const manifestLink = document.querySelector('link[rel="manifest"]');
            this.assert(manifestLink !== null, 'manifest linkタグが存在すること');
            
            const manifestUrl = manifestLink.href;
            const response = await fetch(manifestUrl);
            this.assert(response.ok, 'manifestファイルが正常に読み込めること');
            
            const manifest = await response.json();
            this.assert(manifest.name === this.config.expectedConfig.appName, 'アプリ名が正しいこと');
            this.assert(manifest.theme_color === this.config.expectedConfig.themeColor, 'テーマカラーが正しいこと');
            
            return { manifestData: manifest };
        });
        
        await this.runTest('service-worker-support', 'Service Worker サポート確認', async () => {
            this.assert('serviceWorker' in navigator, 'Service Workerがサポートされていること');
            
            // Service Worker登録状況確認
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                this.assert(registration.active !== null, 'Service Workerがアクティブであること');
                return { registrationScope: registration.scope };
            }
            
            return { status: 'no-registration' };
        });
        
        await this.runTest('pwa-meta-tags', 'PWA メタタグ確認', async () => {
            const requiredMetaTags = [
                { name: 'viewport', expected: 'width=device-width' },
                { name: 'theme-color', expected: this.config.expectedConfig.themeColor },
                { name: 'apple-mobile-web-app-capable', expected: 'yes' },
                { name: 'mobile-web-app-capable', expected: 'yes' }
            ];
            
            for (const tag of requiredMetaTags) {
                const element = document.querySelector(`meta[name="${tag.name}"]`);
                this.assert(element !== null, `${tag.name} メタタグが存在すること`);
                
                if (tag.expected) {
                    this.assert(element.content.includes(tag.expected), 
                        `${tag.name} の値が期待値を含むこと`);
                }
            }
            
            return { checkedTags: requiredMetaTags.length };
        });
        
        await this.runTest('display-mode-detection', '表示モード検出', async () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
            const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
            const isBrowser = window.matchMedia('(display-mode: browser)').matches;
            
            // iOS Safari検出
            const isIOSStandalone = window.navigator.standalone === true;
            
            return {
                displayMode: {
                    standalone: isStandalone,
                    fullscreen: isFullscreen,
                    minimalUI: isMinimalUI,
                    browser: isBrowser,
                    iosStandalone: isIOSStandalone
                },
                currentMode: isStandalone ? 'standalone' : 
                            isFullscreen ? 'fullscreen' :
                            isMinimalUI ? 'minimal-ui' : 'browser'
            };
        });
    }
    
    /**
     * Service Worker テスト
     */
    async runServiceWorkerTests() {
        console.log('[PWATestFramework] Service Workerテスト開始');
        
        await this.runTest('service-worker-registration', 'Service Worker 登録テスト', async () => {
            const registration = await navigator.serviceWorker.register(this.config.serviceWorkerUrl);
            this.assert(registration !== null, 'Service Workerが登録されること');
            
            // 登録完了を待つ
            await this.waitForServiceWorkerState(registration, 'activated');
            
            return { 
                scope: registration.scope,
                state: registration.active?.state,
                scriptURL: registration.active?.scriptURL
            };
        });
        
        await this.runTest('service-worker-caching', 'Service Worker キャッシュテスト', async () => {
            // キャッシュ作成テスト
            const cacheName = 'pwa-test-cache';
            const cache = await caches.open(cacheName);
            
            const testUrl = '/test-cache-resource';
            const testResponse = new Response('test data', {
                headers: { 'Content-Type': 'text/plain' }
            });
            
            await cache.put(testUrl, testResponse);
            
            // キャッシュ取得テスト
            const cachedResponse = await cache.match(testUrl);
            this.assert(cachedResponse !== undefined, 'キャッシュからリソースが正常に取得できること');
            
            const cachedText = await cachedResponse.text();
            this.assert(cachedText === 'test data', 'キャッシュされたデータが正しいこと');
            
            // クリーンアップ
            await caches.delete(cacheName);
            
            return { cacheTest: 'passed' };
        });
        
        await this.runTest('service-worker-messaging', 'Service Worker メッセージング', async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration || !registration.active) {
                throw new Error('アクティブなService Workerが見つかりません');
            }
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Service Workerからの応答がタイムアウトしました'));
                }, 5000);
                
                // メッセージ受信リスナー
                const messageHandler = (event) => {
                    if (event.data && event.data.type === 'TEST_RESPONSE') {
                        clearTimeout(timeout);
                        navigator.serviceWorker.removeEventListener('message', messageHandler);
                        resolve({
                            messageReceived: true,
                            response: event.data.payload
                        });
                    }
                };
                
                navigator.serviceWorker.addEventListener('message', messageHandler);
                
                // テストメッセージ送信
                registration.active.postMessage({
                    type: 'TEST_MESSAGE',
                    payload: { test: 'data' }
                });
            });
        });
        
        await this.runTest('service-worker-update', 'Service Worker 更新テスト', async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error('Service Worker登録が見つかりません');
            }
            
            // 手動更新チェック
            await registration.update();
            
            return {
                updateChecked: true,
                hasWaiting: registration.waiting !== null,
                hasInstalling: registration.installing !== null
            };
        });
    }
    
    /**
     * インストールテスト
     */
    async runInstallationTests() {
        console.log('[PWATestFramework] インストールテスト開始');
        
        await this.runTest('install-prompt-detection', 'インストールプロンプト検出', async () => {
            // beforeinstallpromptイベントのシミュレーション（テスト環境用）
            const mockEvent = {
                preventDefault: () => {},
                prompt: async () => ({ outcome: 'dismissed' }),
                platforms: ['web'],
                userChoice: Promise.resolve({ outcome: 'dismissed' })
            };
            
            // PWAManagerからインストール可能状態を確認
            if (window.pwaManager) {
                const canInstall = window.pwaManager.canInstall();
                const pwaState = window.pwaManager.getPWAState();
                
                return {
                    canInstall: canInstall,
                    installPromptAvailable: pwaState.installPromptAvailable,
                    isInstalled: pwaState.isInstalled,
                    isStandalone: pwaState.isStandalone
                };
            }
            
            return { pwaManagerNotAvailable: true };
        });
        
        await this.runTest('installation-criteria', 'インストール要件確認', async () => {
            const criteria = {
                manifest: false,
                serviceWorker: false,
                https: false,
                responsive: false,
                offline: false
            };
            
            // Manifest確認
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                try {
                    const response = await fetch(manifestLink.href);
                    const manifest = await response.json();
                    criteria.manifest = !!(manifest.name && manifest.icons && manifest.start_url);
                } catch (e) {
                    criteria.manifest = false;
                }
            }
            
            // Service Worker確認
            criteria.serviceWorker = 'serviceWorker' in navigator;
            
            // HTTPS確認
            criteria.https = location.protocol === 'https:' || location.hostname === 'localhost';
            
            // レスポンシブ確認
            const viewport = document.querySelector('meta[name="viewport"]');
            criteria.responsive = viewport !== null;
            
            // オフライン機能確認（基本的な確認）
            criteria.offline = 'caches' in window && criteria.serviceWorker;
            
            const installable = Object.values(criteria).every(v => v);
            
            return { criteria, installable };
        });
    }
    
    /**
     * オフライン機能テスト
     */
    async runOfflineTests() {
        console.log('[PWATestFramework] オフライン機能テスト開始');
        
        await this.runTest('cache-storage-test', 'キャッシュストレージテスト', async () => {
            const testCacheName = 'offline-test-cache';
            const testUrl = '/offline-test-resource';
            const testData = 'offline test data';
            
            // キャッシュ作成
            const cache = await caches.open(testCacheName);
            await cache.put(testUrl, new Response(testData));
            
            // キャッシュからの取得テスト
            const cachedResponse = await cache.match(testUrl);
            this.assert(cachedResponse !== undefined, 'キャッシュされたリソースが取得できること');
            
            const cachedText = await cachedResponse.text();
            this.assert(cachedText === testData, 'キャッシュデータが正しいこと');
            
            // クリーンアップ
            await caches.delete(testCacheName);
            
            return { cacheOperationSuccess: true };
        });
        
        await this.runTest('offline-fallback-test', 'オフラインフォールバックテスト', async () => {
            // Service Workerがネットワークエラー時のフォールバック機能をテスト
            const testUrl = '/non-existent-resource-for-fallback-test';
            
            try {
                const response = await fetch(testUrl);
                // Service Workerがフォールバックレスポンスを返すかテスト
                const responseText = await response.text();
                
                return {
                    fallbackWorking: response.ok,
                    responseSize: responseText.length,
                    contentType: response.headers.get('content-type')
                };
            } catch (error) {
                // ネットワークエラーの場合、Service Workerのフォールバックが働いているかチェック
                return {
                    fallbackWorking: false,
                    error: error.message
                };
            }
        });
        
        await this.runTest('offline-data-persistence', 'オフラインデータ永続化テスト', async () => {
            const testKey = 'pwa-offline-test-data';
            const testData = {
                timestamp: Date.now(),
                testValue: 'offline-persistence-test'
            };
            
            // LocalStorage テスト
            localStorage.setItem(testKey, JSON.stringify(testData));
            const retrievedData = JSON.parse(localStorage.getItem(testKey));
            this.assert(retrievedData.testValue === testData.testValue, 'LocalStorageでデータが永続化されること');
            
            // IndexedDB テスト (基本的な確認)
            const indexedDBSupported = 'indexedDB' in window;
            
            // クリーンアップ
            localStorage.removeItem(testKey);
            
            return {
                localStorageWorking: true,
                indexedDBSupported: indexedDBSupported,
                testDataSize: JSON.stringify(testData).length
            };
        });
    }
    
    /**
     * アイコン・UI テスト
     */
    async runIconAndUITests() {
        console.log('[PWATestFramework] アイコン・UIテスト開始');
        
        await this.runTest('icon-loading-test', 'アイコン読み込みテスト', async () => {
            const iconTests = [];
            
            // Manifest内のアイコンをテスト
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                const response = await fetch(manifestLink.href);
                const manifest = await response.json();
                
                for (const icon of manifest.icons || []) {
                    try {
                        const iconResponse = await fetch(icon.src);
                        iconTests.push({
                            src: icon.src,
                            sizes: icon.sizes,
                            loaded: iconResponse.ok,
                            size: iconResponse.headers.get('content-length') || 'unknown'
                        });
                    } catch (error) {
                        iconTests.push({
                            src: icon.src,
                            sizes: icon.sizes,
                            loaded: false,
                            error: error.message
                        });
                    }
                }
            }
            
            // Apple Touch Icon テスト
            const appleIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
            for (const appleIcon of appleIcons) {
                try {
                    const iconResponse = await fetch(appleIcon.href);
                    iconTests.push({
                        src: appleIcon.href,
                        type: 'apple-touch-icon',
                        sizes: appleIcon.sizes || 'unknown',
                        loaded: iconResponse.ok
                    });
                } catch (error) {
                    iconTests.push({
                        src: appleIcon.href,
                        type: 'apple-touch-icon',
                        loaded: false,
                        error: error.message
                    });
                }
            }
            
            const allLoaded = iconTests.every(test => test.loaded);
            
            return {
                iconTests: iconTests,
                totalIcons: iconTests.length,
                allIconsLoaded: allLoaded,
                loadSuccessRate: iconTests.filter(t => t.loaded).length / iconTests.length
            };
        });
        
        await this.runTest('favicon-test', 'ファビコンテスト', async () => {
            const faviconTests = [];
            
            // 各ファビコンの読み込みテスト
            const faviconSelectors = [
                'link[rel="icon"][sizes="32x32"]',
                'link[rel="icon"][sizes="16x16"]',
                'link[rel="shortcut icon"]',
                'link[rel="icon"][type="image/svg+xml"]'
            ];
            
            for (const selector of faviconSelectors) {
                const faviconLink = document.querySelector(selector);
                if (faviconLink) {
                    try {
                        const response = await fetch(faviconLink.href);
                        faviconTests.push({
                            selector: selector,
                            href: faviconLink.href,
                            loaded: response.ok,
                            contentType: response.headers.get('content-type')
                        });
                    } catch (error) {
                        faviconTests.push({
                            selector: selector,
                            href: faviconLink.href,
                            loaded: false,
                            error: error.message
                        });
                    }
                }
            }
            
            return {
                faviconTests: faviconTests,
                totalFavicons: faviconTests.length,
                allFaviconsLoaded: faviconTests.every(t => t.loaded)
            };
        });
        
        await this.runTest('splash-screen-test', 'スプラッシュスクリーンテスト', async () => {
            const splashScreens = document.querySelectorAll('link[rel="apple-touch-startup-image"]');
            const splashTests = [];
            
            for (const splash of splashScreens) {
                try {
                    const response = await fetch(splash.href);
                    splashTests.push({
                        href: splash.href,
                        media: splash.media,
                        loaded: response.ok,
                        size: response.headers.get('content-length') || 'unknown'
                    });
                } catch (error) {
                    splashTests.push({
                        href: splash.href,
                        media: splash.media,
                        loaded: false,
                        error: error.message
                    });
                }
            }
            
            return {
                splashScreens: splashTests,
                totalSplashScreens: splashTests.length,
                allSplashScreensLoaded: splashTests.every(t => t.loaded)
            };
        });
    }
    
    /**
     * パフォーマンステスト
     */
    async runPerformanceTests() {
        console.log('[PWATestFramework] パフォーマンステスト開始');
        
        await this.runTest('manifest-load-performance', 'Manifest読み込み性能テスト', async () => {
            const startTime = performance.now();
            
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (!manifestLink) {
                throw new Error('Manifestが見つかりません');
            }
            
            const response = await fetch(manifestLink.href);
            const manifest = await response.json();
            
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            return {
                loadTime: loadTime,
                manifestSize: JSON.stringify(manifest).length,
                performance: loadTime < 100 ? 'excellent' : 
                           loadTime < 300 ? 'good' : 
                           loadTime < 1000 ? 'acceptable' : 'poor'
            };
        });
        
        await this.runTest('service-worker-startup-performance', 'Service Worker起動性能テスト', async () => {
            const startTime = performance.now();
            
            // Service Worker登録またはアクティベーション時間を測定
            const registration = await navigator.serviceWorker.getRegistration();
            
            if (!registration) {
                // 新規登録の測定
                const newRegistration = await navigator.serviceWorker.register(this.config.serviceWorkerUrl);
                await this.waitForServiceWorkerState(newRegistration, 'activated');
            }
            
            const endTime = performance.now();
            const startupTime = endTime - startTime;
            
            return {
                startupTime: startupTime,
                performance: startupTime < 500 ? 'excellent' :
                           startupTime < 1000 ? 'good' :
                           startupTime < 2000 ? 'acceptable' : 'poor',
                hasRegistration: registration !== null
            };
        });
        
        await this.runTest('cache-performance-test', 'キャッシュ性能テスト', async () => {
            const testCacheName = 'performance-test-cache';
            const testData = 'x'.repeat(1024); // 1KB のテストデータ
            
            // キャッシュ書き込み性能テスト
            const writeStartTime = performance.now();
            const cache = await caches.open(testCacheName);
            
            const writePromises = [];
            for (let i = 0; i < 10; i++) {
                writePromises.push(
                    cache.put(`/test-${i}`, new Response(testData))
                );
            }
            
            await Promise.all(writePromises);
            const writeEndTime = performance.now();
            const writeTime = writeEndTime - writeStartTime;
            
            // キャッシュ読み込み性能テスト
            const readStartTime = performance.now();
            const readPromises = [];
            for (let i = 0; i < 10; i++) {
                readPromises.push(cache.match(`/test-${i}`));
            }
            
            await Promise.all(readPromises);
            const readEndTime = performance.now();
            const readTime = readEndTime - readStartTime;
            
            // クリーンアップ
            await caches.delete(testCacheName);
            
            return {
                writeTime: writeTime,
                readTime: readTime,
                writePerformance: writeTime < 100 ? 'excellent' : 
                                writeTime < 300 ? 'good' : 
                                writeTime < 1000 ? 'acceptable' : 'poor',
                readPerformance: readTime < 50 ? 'excellent' :
                               readTime < 100 ? 'good' :
                               readTime < 300 ? 'acceptable' : 'poor'
            };
        });
    }
    
    /**
     * ブラウザ互換性テスト
     */
    async runBrowserCompatibilityTests() {
        console.log('[PWATestFramework] ブラウザ互換性テスト開始');
        
        await this.runTest('browser-feature-support', 'ブラウザ機能サポート確認', async () => {
            const features = {
                serviceWorker: 'serviceWorker' in navigator,
                cacheAPI: 'caches' in window,
                pushAPI: 'PushManager' in window,
                notificationAPI: 'Notification' in window,
                installPrompt: 'BeforeInstallPromptEvent' in window,
                backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
                webShare: 'share' in navigator,
                badgeAPI: 'setAppBadge' in navigator,
                fullscreen: 'requestFullscreen' in document.documentElement,
                vibrate: 'vibrate' in navigator,
                deviceMotion: 'DeviceMotionEvent' in window,
                screenOrientation: 'screen' in window && 'orientation' in window.screen,
                webGL: (() => {
                    try {
                        const canvas = document.createElement('canvas');
                        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                    } catch (e) {
                        return false;
                    }
                })()
            };
            
            const supportedFeatures = Object.values(features).filter(v => v).length;
            const totalFeatures = Object.keys(features).length;
            const supportPercentage = (supportedFeatures / totalFeatures) * 100;
            
            return {
                features: features,
                supportedFeatures: supportedFeatures,
                totalFeatures: totalFeatures,
                supportPercentage: supportPercentage,
                browserCompatibility: supportPercentage >= 80 ? 'excellent' :
                                    supportPercentage >= 60 ? 'good' :
                                    supportPercentage >= 40 ? 'acceptable' : 'poor'
            };
        });
        
        await this.runTest('user-agent-detection', 'ユーザーエージェント検出', async () => {
            const userAgent = navigator.userAgent;
            const platform = navigator.platform;
            
            // ブラウザ検出
            const browsers = {
                chrome: /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent),
                firefox: /Firefox/i.test(userAgent),
                safari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
                edge: /Edge/i.test(userAgent),
                opera: /Opera/i.test(userAgent)
            };
            
            // OS検出
            const os = {
                windows: /Windows/i.test(userAgent),
                mac: /Mac/i.test(userAgent),
                linux: /Linux/i.test(userAgent),
                android: /Android/i.test(userAgent),
                ios: /iPhone|iPad|iPod/i.test(userAgent)
            };
            
            // デバイス検出
            const device = {
                mobile: /Mobile/i.test(userAgent),
                tablet: /Tablet|iPad/i.test(userAgent),
                desktop: !(/Mobile|Tablet|iPad/i.test(userAgent))
            };
            
            return {
                userAgent: userAgent,
                platform: platform,
                browsers: browsers,
                os: os,
                device: device,
                detectedBrowser: Object.keys(browsers).find(b => browsers[b]) || 'unknown',
                detectedOS: Object.keys(os).find(o => os[o]) || 'unknown',
                detectedDevice: Object.keys(device).find(d => device[d]) || 'unknown'
            };
        });
    }
    
    /**
     * 個別テストの実行
     */
    async runTest(testId, testName, testFunction) {
        this.state.currentTest = testId;
        const startTime = performance.now();
        
        console.log(`[PWATestFramework] テスト開始: ${testName}`);
        
        try {
            const result = await Promise.race([
                testFunction(),
                this.createTimeout(this.config.defaultTimeout)
            ]);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const testResult = {
                id: testId,
                name: testName,
                status: 'passed',
                duration: duration,
                result: result,
                timestamp: new Date().toISOString()
            };
            
            this.testResults.push(testResult);
            this.state.passedTests++;
            
            console.log(`[PWATestFramework] テスト合格: ${testName} (${duration.toFixed(2)}ms)`);
            
            return testResult;
            
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const testResult = {
                id: testId,
                name: testName,
                status: 'failed',
                duration: duration,
                error: {
                    message: error.message,
                    stack: error.stack
                },
                timestamp: new Date().toISOString()
            };
            
            this.testResults.push(testResult);
            this.state.failedTests++;
            
            console.error(`[PWATestFramework] テスト失敗: ${testName} - ${error.message}`);
            
            return testResult;
        }
    }
    
    /**
     * アサーション
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    
    /**
     * Service Worker状態待機
     */
    async waitForServiceWorkerState(registration, targetState) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Service Worker ${targetState} 状態へのタイムアウト`));
            }, 10000);
            
            const checkState = () => {
                if (registration.active && registration.active.state === targetState) {
                    clearTimeout(timeout);
                    resolve(registration);
                } else if (registration.installing) {
                    registration.installing.addEventListener('statechange', checkState);
                } else if (registration.waiting) {
                    registration.waiting.addEventListener('statechange', checkState);
                }
            };
            
            checkState();
        });
    }
    
    /**
     * タイムアウト作成
     */
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`テストタイムアウト: ${ms}ms`));
            }, ms);
        });
    }
    
    /**
     * テストセッション開始
     */
    startTestSession() {
        this.state.isRunning = true;
        this.state.startTime = Date.now();
        this.state.totalTests = 0;
        this.state.passedTests = 0;
        this.state.failedTests = 0;
        this.state.skippedTests = 0;
        this.testResults = [];
        
        console.log('[PWATestFramework] テストセッション開始');
    }
    
    /**
     * テストセッション終了
     */
    endTestSession() {
        this.state.isRunning = false;
        this.state.currentTest = null;
        this.state.totalTests = this.testResults.length;
        
        const duration = Date.now() - this.state.startTime;
        
        console.log(`[PWATestFramework] テストセッション完了 - 実行時間: ${duration}ms`);
        console.log(`[PWATestFramework] 結果: ${this.state.passedTests}件合格, ${this.state.failedTests}件失敗, ${this.state.skippedTests}件スキップ`);
    }
    
    /**
     * テストレポート生成
     */
    generateTestReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.state.startTime;
        
        const report = {
            summary: {
                totalTests: this.state.totalTests,
                passedTests: this.state.passedTests,
                failedTests: this.state.failedTests,
                skippedTests: this.state.skippedTests,
                successRate: this.state.totalTests > 0 ? 
                    (this.state.passedTests / this.state.totalTests) * 100 : 0,
                totalDuration: totalDuration,
                averageDuration: this.state.totalTests > 0 ? 
                    totalDuration / this.state.totalTests : 0
            },
            
            details: this.testResults,
            
            environment: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                language: navigator.language,
                languages: navigator.languages,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                screenResolution: `${screen.width}x${screen.height}`,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestamp: new Date().toISOString()
            },
            
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }
    
    /**
     * 推奨事項生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 失敗したテストに基づく推奨事項
        const failedTests = this.testResults.filter(t => t.status === 'failed');
        
        for (const test of failedTests) {
            if (test.id === 'manifest-exists') {
                recommendations.push({
                    category: 'manifest',
                    priority: 'high',
                    message: 'App Manifestファイルを作成または修正してください'
                });
            }
            
            if (test.id === 'service-worker-registration') {
                recommendations.push({
                    category: 'service-worker',
                    priority: 'high',
                    message: 'Service Workerの登録を確認してください'
                });
            }
            
            if (test.id === 'icon-loading-test') {
                recommendations.push({
                    category: 'icons',
                    priority: 'medium',
                    message: '一部のアイコンが読み込めません。パスを確認してください'
                });
            }
        }
        
        // 成功率に基づく推奨事項
        if (this.state.totalTests > 0) {
            const successRate = (this.state.passedTests / this.state.totalTests) * 100;
            
            if (successRate < 50) {
                recommendations.push({
                    category: 'general',
                    priority: 'critical',
                    message: 'PWA機能に重大な問題があります。基本設定を見直してください'
                });
            } else if (successRate < 80) {
                recommendations.push({
                    category: 'general',
                    priority: 'medium',
                    message: 'PWA機能の改善余地があります。失敗したテストを確認してください'
                });
            } else if (successRate >= 95) {
                recommendations.push({
                    category: 'general',
                    priority: 'info',
                    message: 'PWA機能は良好に動作しています！'
                });
            }
        }
        
        return recommendations;
    }
    
    /**
     * エラーログ
     */
    logError(message, error) {
        console.error(`[PWATestFramework] ${message}:`, error);
    }
    
    /**
     * テスト結果のHTML出力
     */
    generateHTMLReport() {
        const report = this.generateTestReport();
        
        const html = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PWA テストレポート</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
                .stat-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
                .passed { color: #28a745; }
                .failed { color: #dc3545; }
                .skipped { color: #ffc107; }
                .test-results { margin-bottom: 30px; }
                .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; }
                .test-item.failed { border-left-color: #dc3545; }
                .test-name { font-weight: bold; margin-bottom: 10px; }
                .test-duration { color: #666; font-size: 0.9em; }
                .error-details { background: #fee; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.9em; }
                .recommendations { margin-top: 30px; }
                .recommendation { background: #e7f3ff; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #007bff; }
                .recommendation.high { border-left-color: #dc3545; background: #ffeaea; }
                .recommendation.critical { border-left-color: #721c24; background: #f8d7da; }
                .environment { margin-top: 30px; background: #f8f9fa; padding: 15px; border-radius: 6px; }
                .environment pre { margin: 0; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PWA テストレポート</h1>
                    <p>実行日時: ${new Date(report.environment.timestamp).toLocaleString('ja-JP')}</p>
                </div>
                
                <div class="summary">
                    <div class="stat-card">
                        <div class="stat-value">${report.summary.totalTests}</div>
                        <div>総テスト数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value passed">${report.summary.passedTests}</div>
                        <div>合格</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value failed">${report.summary.failedTests}</div>
                        <div>失敗</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${report.summary.successRate.toFixed(1)}%</div>
                        <div>成功率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${report.summary.totalDuration.toFixed(0)}ms</div>
                        <div>実行時間</div>
                    </div>
                </div>
                
                <div class="test-results">
                    <h2>テスト結果詳細</h2>
                    ${report.details.map(test => `
                        <div class="test-item ${test.status}">
                            <div class="test-name">${test.name}</div>
                            <div class="test-duration">実行時間: ${test.duration.toFixed(2)}ms</div>
                            ${test.status === 'failed' ? `
                                <div class="error-details">
                                    <strong>エラー:</strong> ${test.error.message}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="recommendations">
                    <h2>推奨事項</h2>
                    ${report.recommendations.map(rec => `
                        <div class="recommendation ${rec.priority}">
                            <strong>[${rec.priority.toUpperCase()}]</strong> ${rec.message}
                        </div>
                    `).join('')}
                </div>
                
                <div class="environment">
                    <h2>実行環境</h2>
                    <pre>${JSON.stringify(report.environment, null, 2)}</pre>
                </div>
            </div>
        </body>
        </html>
        `;
        
        return html;
    }
}

// グローバル関数として利用可能にする
window.PWATestFramework = PWATestFramework;

// 簡単にテストを実行するためのヘルパー関数
window.runPWATests = async function() {
    const framework = new PWATestFramework();
    const report = await framework.runAllTests();
    
    console.log('PWAテスト完了:', report);
    
    return report;
};

console.log('[PWATestFramework] PWAテストフレームワーク読み込み完了');