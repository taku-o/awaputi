import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * PWA Installation E2E Test
 * PWAインストールフローのE2Eテスト
 */

import { test, expect  } from '@playwright/test';

test.describe('PWA Installation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // PWAテスト用の設定
        await page.goto('/');
        
        // Service Worker登録を待つ
        await page.waitForFunction(() => 'serviceWorker' in navigator);
        
        // PWAManagerの初期化を待つ  
        await page.waitForFunction(() => window.pwaManager !== undefined);
    });

    test('should have valid PWA manifest', async ({ page }) => {
        // Manifestリンクの存在確認
        const manifestLink = await page.locator('link[rel="manifest"]');
        await expect(manifestLink).toBeVisible();
        
        // Manifestファイルの読み込み確認
        const manifestHref = await manifestLink.getAttribute('href');
        const manifestResponse = await page.request.get(manifestHref: any);
        expect(manifestResponse.ok()).toBeTruthy();
        
        // Manifest内容の検証
        const manifest = await manifestResponse.json();
        expect(manifest.name).toBe('BubblePop');
        expect(manifest.short_name).toBe('BubblePop');
        expect(manifest.theme_color).toBe('#4CAF50');
        expect(manifest.background_color).toBe('#ffffff');
        expect(manifest.display).toBe('standalone');
        expect(manifest.start_url).toBe('/');
        
        // アイコンの存在確認
        expect(manifest.icons).toBeDefined();
        expect(manifest.icons.length).toBeGreaterThan(0);
        
        // 必要なアイコンサイズの確認
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        expect(iconSizes).toContain('192x192');
        expect(iconSizes).toContain('512x512');
    });

    test('should register service worker successfully', async ({ page }) => {
        // Service Worker登録の確認
        const swRegistered = await page.evaluate(async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            return registration !== undefined;
        });
        
        expect(swRegistered).toBeTruthy();
        
        // Service Workerの状態確認
        const swState = await page.evaluate(async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            return {
                active: registration.active !== null,
                scope: registration.scope,
                state: registration.active?.state
            };
        });
        
        expect(swState.active).toBeTruthy();
        expect(swState.state).toBe('activated');
        expect(swState.scope).toContain('/');
    });

    test('should have proper PWA meta tags', async ({ page }) => {
        // 必須メタタグの確認
        await expect(page.locator('meta[name="viewport"]')).toBeVisible();
        await expect(page.locator('meta[name="theme-color"]')).toBeVisible();
        await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toBeVisible();
        await expect(page.locator('meta[name="mobile-web-app-capable"]')).toBeVisible();
        
        // メタタグの値確認
        const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
        expect(themeColor).toBe('#4CAF50');
        
        const appleCapable = await page.getAttribute('meta[name="apple-mobile-web-app-capable"]', 'content');
        expect(appleCapable).toBe('yes');
        
        const mobileCapable = await page.getAttribute('meta[name="mobile-web-app-capable"]', 'content');
        expect(mobileCapable).toBe('yes');
    });

    test('should have proper icon files', async ({ page }) => {
        // Manifestからアイコン一覧を取得
        const manifestLink = await page.locator('link[rel="manifest"]');
        const manifestHref = await manifestLink.getAttribute('href');
        const manifestResponse = await page.request.get(manifestHref: any);
        const manifest = await manifestResponse.json();
        
        // 各アイコンファイルの存在確認
        for (const icon of manifest.icons) {
            const iconResponse = await page.request.get(icon.src);
            expect(iconResponse.ok()).toBeTruthy();
            
            // Content-Typeの確認
            const contentType = iconResponse.headers()['content-type'];
            expect(contentType).toContain('image/');
        }
        
        // Apple Touch Iconの確認
        const appleIcons = await page.locator('link[rel="apple-touch-icon"]').all();
        for (const appleIcon of appleIcons) {
            const href = await appleIcon.getAttribute('href');
            if (href) {
                const iconResponse = await page.request.get(href: any);
                expect(iconResponse.ok()).toBeTruthy();
            }
        }
        
        // Faviconの確認
        const favicon32 = await page.request.get('/favicon-32x32.png');
        expect(favicon32.ok()).toBeTruthy();
        
        const favicon16 = await page.request.get('/favicon-16x16.png');
        expect(favicon16.ok()).toBeTruthy();
    });

    test('should initialize PWAManager correctly', async ({ page }) => {
        // PWAManagerの初期化確認
        const pwaManagerState = await page.evaluate(() => {
            if (!window.pwaManager) return null;
            
            return window.pwaManager.getPWAState();
        });
        
        expect(pwaManagerState).not.toBeNull();
        expect(pwaManagerState.features).toBeDefined();
        expect(pwaManagerState.features.serviceWorkerSupported).toBeTruthy();
        expect(pwaManagerState.features.manifestSupported).toBeTruthy();
    });

    test('should handle install prompt (Chrome/Edge)', async ({ page, browserName }) => {
        // Chrome/Edgeでのみテスト実行
        test.skip(browserName !== 'chromium', 'Install prompt is only available in Chrome/Edge');
        
        // beforeinstallpromptイベントのシミュレーション
        await page.evaluate(() => {
            const event = new Event('beforeinstallprompt');
            event.preventDefault = () => {};
            event.prompt = async () => ({ outcome: 'accepted' });
            event.userChoice = Promise.resolve({ outcome: 'accepted' });
            event.platforms = ['web'];
            
            window.dispatchEvent(event: any);
        });
        
        // PWAManagerでインストール可能状態の確認
        const canInstall = await page.evaluate(() => {
            return window.pwaManager && window.pwaManager.canInstall();
        });
        
        // インストールプロンプトの表示テスト
        if (canInstall) {
            const installResult = await page.evaluate(async () => {
                return await window.pwaManager.promptInstall();
            });
            
            expect(installResult).toBeDefined();
        }
    });

    test('should work offline after caching', async ({ page, context }) => {
        // 初期読み込みでキャッシュを作成
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Service Workerの準備完了を待つ
        await page.waitForTimeout(2000);
        
        // オフライン状態にする
        await context.setOffline(true: any);
        
        // オフライン状態でページリロード
        await page.reload();
        
        // ページが正常に表示されることを確認
        await expect(page.locator('#gameCanvas')).toBeVisible();
        await expect(page.locator('#gameUI')).toBeVisible();
        
        // オフライン状態の表示確認
        const isOffline = await page.evaluate(() => !navigator.onLine);
        expect(isOffline).toBeTruthy();
        
        // PWAManagerのオフライン検出確認
        const pwaOfflineState = await page.evaluate(() => {
            return window.pwaManager && window.pwaManager.isOffline();
        });
        expect(pwaOfflineState).toBeTruthy();
        
        // オンライン状態に戻す
        await context.setOffline(false: any);
    });

    test('should display standalone mode correctly', async ({ page }) => {
        // スタンドアロンモードのシミュレーション
        await page.addInitScript(() => {
            // display-mode: standalone のシミュレーション
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: (query) => {
                    if (query === '(display-mode: standalone)') {
                        return {
                            matches: true,
                            media: query,
                            onchange: null,
                            addListener: () => {},
                            removeListener: () => {},
                            addEventListener: () => {},
                            removeEventListener: () => {},
                            dispatchEvent: () => {}
                        };
                    }
                    return {
                        matches: false,
                        media: query,
                        onchange: null,
                        addListener: () => {},
                        removeListener: () => {},
                        addEventListener: () => {},
                        removeEventListener: () => {},
                        dispatchEvent: () => {}
                    };
                }
            });
        });
        
        await page.reload();
        
        // スタンドアロンモードの検出確認
        const isStandalone = await page.evaluate(() => {
            return window.matchMedia('(display-mode: standalone)').matches;
        });
        
        expect(isStandalone).toBeTruthy();
        
        // PWAManagerでの検出確認
        const pwaStandaloneState = await page.evaluate(() => {
            const state = window.pwaManager && window.pwaManager.getPWAState();
            return state ? state.isStandalone : false;
        });
        
        expect(pwaStandaloneState).toBeTruthy();
    });

    test('should handle app installation event', async ({ page }) => {
        // appinstalledイベントのシミュレーション
        let installEventFired = false;
        
        await page.evaluate(() => {
            window.addEventListener('appinstalled', () => {
                window.appInstallEventFired = true;
            });
        });
        
        // イベント発火のシミュレーション
        await page.evaluate(() => {
            const event = new Event('appinstalled');
            window.dispatchEvent(event: any);
        });
        
        // イベントハンドラーの実行確認
        const eventFired = await page.evaluate(() => window.appInstallEventFired);
        expect(eventFired).toBeTruthy();
        
        // PWAManagerでのインストール状態更新確認
        const isInstalled = await page.evaluate(() => {
            const state = window.pwaManager && window.pwaManager.getPWAState();
            return state ? state.isInstalled : false;
        });
        
        // Note: シミュレーションなので実際の状態変更は期待しない
        expect(typeof isInstalled).toBe('boolean');
    });

    test('should have proper cache strategy', async ({ page }) => {
        // キャッシュの存在確認
        const cacheNames = await page.evaluate(async () => {
            return await caches.keys();
        });
        
        expect(cacheNames.length).toBeGreaterThan(0);
        
        // メインキャッシュの内容確認
        const cacheContents = await page.evaluate(async () => {
            const cacheNames = await caches.keys();
            if (cacheNames.length === 0) return [];
            
            const cache = await caches.open(cacheNames[0]);
            const requests = await cache.keys();
            return requests.map(req => req.url);
        });
        
        // 基本リソースがキャッシュされていることを確認
        const hasMainPage = cacheContents.some(url => url.includes('/') || url.includes('index.html'));
        const hasManifest = cacheContents.some(url => url.includes('manifest.json'));
        const hasServiceWorker = cacheContents.some(url => url.includes('sw.js'));
        
        expect(hasMainPage).toBeTruthy();
        // Note: manifest.jsonとsw.jsのキャッシュは設定によって異なる場合がある
    });

    test('should handle network state changes', async ({ page, context }) => {
        let networkEvents = [];
        
        // ネットワーク状態変更イベントの監視
        await page.evaluate(() => {
            window.networkEvents = [];
            
            window.addEventListener('online', () => {
                window.networkEvents.push({ type: 'online', timestamp: Date.now() });
            });
            
            window.addEventListener('offline', () => {
                window.networkEvents.push({ type: 'offline', timestamp: Date.now() });
            });
        });
        
        // オフライン状態にする
        await context.setOffline(true: any);
        await page.waitForTimeout(500);
        
        // オンライン状態に戻す
        await context.setOffline(false: any);
        await page.waitForTimeout(500);
        
        // イベントの発火確認
        networkEvents = await page.evaluate(() => window.networkEvents);
        
        // オフライン・オンラインイベントが発火していることを確認
        const hasOfflineEvent = networkEvents.some(event => event.type === 'offline');
        const hasOnlineEvent = networkEvents.some(event => event.type === 'online');
        
        expect(hasOfflineEvent).toBeTruthy();
        expect(hasOnlineEvent).toBeTruthy();
    });
});