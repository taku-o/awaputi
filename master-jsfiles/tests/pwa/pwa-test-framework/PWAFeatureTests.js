/**
 * PWAFeatureTests - Basic PWA features, Service Worker, and installation tests
 * Part of the PWATestFramework split implementation
 */

export class PWAFeatureTests {
    constructor(mainFramework) {
        this.mainFramework = mainFramework;
        this.executor = mainFramework.executor;
        
        console.log('[PWAFeatureTests] Feature tests component initialized');
    }
    
    /**
     * Run basic PWA feature tests
     */
    async runBasicPWATests() {
        console.log('[PWAFeatureTests] Starting basic PWA feature tests');
        
        await this.executor.runTest('manifest-exists', 'App Manifest existence check', async () => {
            const manifestLink = document.querySelector('link[rel="manifest"]');
            this.executor.assert(manifestLink !== null, 'manifest link tag should exist');
            
            const manifestUrl = manifestLink.href;
            const response = await fetch(manifestUrl);
            this.executor.assert(response.ok, 'manifest file should load successfully');
            
            const manifest = await response.json();
            this.executor.assert(manifest.name === this.mainFramework.config.expectedConfig.appName, 'App name should be correct');
            this.executor.assert(manifest.theme_color === this.mainFramework.config.expectedConfig.themeColor, 'Theme color should be correct');
            
            return { manifestData: manifest };
        });
        
        await this.executor.runTest('service-worker-support', 'Service Worker support check', async () => {
            this.executor.assert('serviceWorker' in navigator, 'Service Worker should be supported');
            
            // Check Service Worker registration status
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                this.executor.assert(registration.active !== null, 'Service Worker should be active');
                return { registrationScope: registration.scope };
            }
            
            return { status: 'no-registration' };
        });
        
        await this.executor.runTest('pwa-meta-tags', 'PWA meta tags check', async () => {
            const requiredMetaTags = [
                { name: 'viewport', expected: 'width=device-width' },
                { name: 'theme-color', expected: this.mainFramework.config.expectedConfig.themeColor },
                { name: 'apple-mobile-web-app-capable', expected: 'yes' },
                { name: 'mobile-web-app-capable', expected: 'yes' }
            ];
            
            for (const tag of requiredMetaTags) {
                const element = document.querySelector(`meta[name="${tag.name}"]`);
                this.executor.assert(element !== null, `${tag.name} meta tag should exist`);
                
                if (tag.expected) {
                    this.executor.assert(element.content.includes(tag.expected), 
                        `${tag.name} value should contain expected value`);
                }
            }
            
            return { checkedTags: requiredMetaTags.length };
        });
        
        await this.executor.runTest('display-mode-detection', 'Display mode detection', async () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
            const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
            const isBrowser = window.matchMedia('(display-mode: browser)').matches;
            
            // iOS Safari detection
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
     * Run Service Worker tests
     */
    async runServiceWorkerTests() {
        console.log('[PWAFeatureTests] Starting Service Worker tests');
        
        await this.executor.runTest('service-worker-registration', 'Service Worker registration test', async () => {
            const registration = await navigator.serviceWorker.register(this.mainFramework.config.serviceWorkerUrl);
            this.executor.assert(registration !== null, 'Service Worker should be registered');
            
            // Wait for registration completion
            await this.executor.waitForServiceWorkerState(registration, 'activated');
            
            return { 
                scope: registration.scope,
                state: registration.active?.state,
                scriptURL: registration.active?.scriptURL
            };
        });
        
        await this.executor.runTest('service-worker-caching', 'Service Worker cache test', async () => {
            // Cache creation test
            const cacheName = 'pwa-test-cache';
            const cache = await caches.open(cacheName);
            
            const testUrl = '/test-cache-resource';
            const testResponse = new Response('test data', {
                headers: { 'Content-Type': 'text/plain' }
            });
            
            await cache.put(testUrl, testResponse);
            
            // Cache retrieval test
            const cachedResponse = await cache.match(testUrl);
            this.executor.assert(cachedResponse !== undefined, 'Resource should be retrieved from cache successfully');
            
            const cachedText = await cachedResponse.text();
            this.executor.assert(cachedText === 'test data', 'Cached data should be correct');
            
            // Cleanup
            await caches.delete(cacheName);
            
            return { cacheTest: 'passed' };
        });
        
        await this.executor.runTest('service-worker-messaging', 'Service Worker messaging', async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration || !registration.active) {
                throw new Error('No active Service Worker found');
            }
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Service Worker response timeout'));
                }, 5000);
                
                // Message receive listener
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
                
                // Send test message
                registration.active.postMessage({
                    type: 'TEST_MESSAGE',
                    payload: { test: 'data' }
                });
            });
        });
        
        await this.executor.runTest('service-worker-update', 'Service Worker update test', async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error('Service Worker registration not found');
            }
            
            // Manual update check
            await registration.update();
            
            return {
                updateChecked: true,
                hasWaiting: registration.waiting !== null,
                hasInstalling: registration.installing !== null
            };
        });
    }
    
    /**
     * Run installation tests
     */
    async runInstallationTests() {
        console.log('[PWAFeatureTests] Starting installation tests');
        
        await this.executor.runTest('install-prompt-detection', 'Install prompt detection', async () => {
            // beforeinstallprompt event simulation (for test environment)
            const mockEvent = {
                preventDefault: () => {},
                prompt: async () => ({ outcome: 'dismissed' }),
                platforms: ['web'],
                userChoice: Promise.resolve({ outcome: 'dismissed' })
            };
            
            // Check installable state from PWAManager
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
        
        await this.executor.runTest('installation-criteria', 'Installation criteria check', async () => {
            const criteria = {
                manifest: false,
                serviceWorker: false,
                https: false,
                responsive: false,
                offline: false
            };
            
            // Manifest check
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
            
            // Service Worker check
            criteria.serviceWorker = 'serviceWorker' in navigator;
            
            // HTTPS check
            criteria.https = location.protocol === 'https:' || location.hostname === 'localhost';
            
            // Responsive check
            const viewport = document.querySelector('meta[name="viewport"]');
            criteria.responsive = viewport !== null;
            
            // Offline functionality check (basic check)
            criteria.offline = 'caches' in window && criteria.serviceWorker;
            
            const installable = Object.values(criteria).every(v => v);
            
            return { criteria, installable };
        });
    }
    
    /**
     * Run icon and UI tests
     */
    async runIconAndUITests() {
        console.log('[PWAFeatureTests] Starting icon and UI tests');
        
        await this.executor.runTest('icon-loading-test', 'Icon loading test', async () => {
            const iconTests = [];
            
            // Test icons in manifest
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
            
            // Apple Touch Icon test
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
        
        await this.executor.runTest('favicon-test', 'Favicon test', async () => {
            const faviconTests = [];
            
            // Test each favicon loading
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
        
        await this.executor.runTest('splash-screen-test', 'Splash screen test', async () => {
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
     * Run browser compatibility tests
     */
    async runBrowserCompatibilityTests() {
        console.log('[PWAFeatureTests] Starting browser compatibility tests');
        
        await this.executor.runTest('browser-feature-support', 'Browser feature support check', async () => {
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
        
        await this.executor.runTest('user-agent-detection', 'User agent detection', async () => {
            const userAgent = navigator.userAgent;
            const platform = navigator.platform;
            
            // Browser detection
            const browsers = {
                chrome: /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent),
                firefox: /Firefox/i.test(userAgent),
                safari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
                edge: /Edge/i.test(userAgent),
                opera: /Opera/i.test(userAgent)
            };
            
            // OS detection
            const os = {
                windows: /Windows/i.test(userAgent),
                mac: /Mac/i.test(userAgent),
                linux: /Linux/i.test(userAgent),
                android: /Android/i.test(userAgent),
                ios: /iPhone|iPad|iPod/i.test(userAgent)
            };
            
            // Device detection
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
}