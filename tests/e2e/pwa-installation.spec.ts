/**
 * PWA Installation E2E Test
 * PWAインストールフローのE2Eテスト
 */

import { test, expect } from '@playwright/test';

test.describe('PWA Installation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // PWAテスト用の設定
        await page.goto('/');
        
        // Service Worker登録を待つ
        await page.waitForFunction(() => 'serviceWorker' in navigator);
        
        // PWAManagerの初期化を待つ  
        await page.waitForFunction(() => (window as any).pwaManager !== undefined);
    });

    test('should have valid PWA manifest', async ({ page }) => {
        // Manifestリンクの存在確認
        const manifestLink = await page.locator('link[rel="manifest"]');
        await expect(manifestLink).toBeVisible();
        
        // Manifestファイルの読み込み確認
        const manifestHref = await manifestLink.getAttribute('href');
        if (!manifestHref) throw new Error('Manifest href not found');
        
        const manifestResponse = await page.request.get(manifestHref);
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
        const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
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
                active: registration?.active !== null,
                scope: registration?.scope,
                state: registration?.active?.state
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
        if (!manifestHref) throw new Error('Manifest href not found');
        
        const manifestResponse = await page.request.get(manifestHref);
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
        expect(appleIcons.length).toBeGreaterThan(0);
    });

    test('should handle beforeinstallprompt event', async ({ page }) => {
        // installプロンプトイベントのハンドリング確認
        const hasInstallButton = await page.evaluate(() => {
            const pwaManager = (window as any).pwaManager;
            return pwaManager && pwaManager.deferredPrompt !== null;
        });
        
        // Desktop環境でのみインストールプロンプトが表示される
        if (hasInstallButton) {
            // インストールボタンの表示確認
            const installButton = page.locator('[data-testid="pwa-install-button"]');
            await expect(installButton).toBeVisible();
        }
    });

    test('should cache essential assets', async ({ page }) => {
        // キャッシュストレージの確認
        const cacheNames = await page.evaluate(async () => {
            return await caches.keys();
        });
        
        expect(cacheNames.length).toBeGreaterThan(0);
        
        // 必須アセットのキャッシュ確認
        const cachedUrls = await page.evaluate(async () => {
            const urls: string[] = [];
            for (const cacheName of await caches.keys()) {
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();
                urls.push(...requests.map(req => req.url));
            }
            return urls;
        });
        
        // 重要なアセットがキャッシュされているか確認
        expect(cachedUrls.some(url => url.includes('index.html') || url.endsWith('/'))).toBeTruthy();
        expect(cachedUrls.some(url => url.includes('.js'))).toBeTruthy();
        expect(cachedUrls.some(url => url.includes('.css'))).toBeTruthy();
    });

    test('should work offline after installation', async ({ page, context }) => {
        // まず全てのアセットをロード
        await page.waitForLoadState('networkidle');
        
        // オフラインモードに切り替え
        await context.setOffline(true);
        
        // ページをリロード
        await page.reload();
        
        // オフラインでも動作することを確認
        await expect(page.locator('body')).toBeVisible();
        
        // 基本的な要素が表示されることを確認
        await expect(page.locator('#gameCanvas')).toBeVisible();
        
        // オンラインに戻す
        await context.setOffline(false);
    });

    test('should handle app installation flow', async ({ page }) => {
        // インストール可能な場合のフローテスト
        const canInstall = await page.evaluate(() => {
            return (window as any).pwaManager && (window as any).pwaManager.deferredPrompt !== null;
        });
        
        if (canInstall) {
            // インストールボタンをクリック
            await page.click('[data-testid="pwa-install-button"]');
            
            // インストールダイアログのモック（実際のプロンプトはテストできない）
            const installAttempted = await page.evaluate(() => {
                const pwaManager = (window as any).pwaManager;
                return pwaManager.promptInstall !== undefined;
            });
            
            expect(installAttempted).toBeTruthy();
        }
    });

    test('should update service worker when available', async ({ page }) => {
        // Service Worker更新のチェック
        const updateAvailable = await page.evaluate(async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) return false;
            
            // 更新をチェック
            await registration.update();
            
            return registration.waiting !== null || registration.installing !== null;
        });
        
        // 更新がある場合の処理確認
        if (updateAvailable) {
            // 更新通知の表示確認
            const updateNotification = page.locator('[data-testid="sw-update-notification"]');
            await expect(updateNotification).toBeVisible();
        }
    });

    test('should handle push notification permission', async ({ page, context }) => {
        // 通知権限の確認
        const permission = await page.evaluate(() => {
            return Notification.permission;
        });
        
        // 権限が未決定の場合
        if (permission === 'default') {
            // 通知許可ボタンの確認
            const notificationButton = page.locator('[data-testid="enable-notifications"]');
            
            if (await notificationButton.isVisible()) {
                // 権限リクエストのモック
                await context.grantPermissions(['notifications']);
                
                // ボタンクリック
                await notificationButton.click();
                
                // 権限が付与されたことを確認
                const newPermission = await page.evaluate(() => {
                    return Notification.permission;
                });
                
                expect(['granted', 'denied']).toContain(newPermission);
            }
        }
    });

    test('should have proper app shortcuts', async ({ page }) => {
        // Manifestからショートカットを取得
        const manifestLink = await page.locator('link[rel="manifest"]');
        const manifestHref = await manifestLink.getAttribute('href');
        if (!manifestHref) throw new Error('Manifest href not found');
        
        const manifestResponse = await page.request.get(manifestHref);
        const manifest = await manifestResponse.json();
        
        // ショートカットの存在確認
        if (manifest.shortcuts) {
            expect(manifest.shortcuts.length).toBeGreaterThan(0);
            
            // 各ショートカットの検証
            for (const shortcut of manifest.shortcuts) {
                expect(shortcut.name).toBeDefined();
                expect(shortcut.url).toBeDefined();
                
                // アイコンがある場合の確認
                if (shortcut.icons) {
                    for (const icon of shortcut.icons) {
                        const iconResponse = await page.request.get(icon.src);
                        expect(iconResponse.ok()).toBeTruthy();
                    }
                }
            }
        }
    });

    test('should have proper theme and colors', async ({ page }) => {
        // ステータスバーの色確認（メタタグ）
        const statusBarStyle = await page.getAttribute('meta[name="apple-mobile-web-app-status-bar-style"]', 'content');
        expect(['default', 'black', 'black-translucent']).toContain(statusBarStyle);
        
        // CSS変数でのテーマカラー確認
        const themeColors = await page.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            return {
                primary: styles.getPropertyValue('--primary-color'),
                secondary: styles.getPropertyValue('--secondary-color'),
                background: styles.getPropertyValue('--background-color')
            };
        });
        
        // 色が定義されているか確認
        if (themeColors.primary) {
            expect(themeColors.primary).toBeTruthy();
            expect(themeColors.secondary).toBeTruthy();
            expect(themeColors.background).toBeTruthy();
        }
    });

    test('should handle app badge updates', async ({ page }) => {
        // Badge APIのサポート確認
        const badgeSupported = await page.evaluate(() => {
            return 'setAppBadge' in navigator;
        });
        
        if (badgeSupported) {
            // バッジ設定のテスト
            await page.evaluate(async () => {
                await (navigator as any).setAppBadge(5);
            });
            
            // バッジクリアのテスト
            await page.evaluate(async () => {
                await (navigator as any).clearAppBadge();
            });
            
            // エラーが発生しないことを確認
            const errors = await page.evaluate(() => {
                return (window as any).__pwaErrors || [];
            });
            
            expect(errors.length).toBe(0);
        }
    });

    test('should persist data across sessions', async ({ page, context }) => {
        // データを保存
        await page.evaluate(() => {
            localStorage.setItem('pwa-test-data', 'test-value');
            sessionStorage.setItem('pwa-session-data', 'session-value');
        });
        
        // 新しいページで確認
        const newPage = await context.newPage();
        await newPage.goto('/');
        
        // LocalStorageは永続化される
        const localData = await newPage.evaluate(() => {
            return localStorage.getItem('pwa-test-data');
        });
        expect(localData).toBe('test-value');
        
        // SessionStorageは新しいタブでは空
        const sessionData = await newPage.evaluate(() => {
            return sessionStorage.getItem('pwa-session-data');
        });
        expect(sessionData).toBeNull();
        
        await newPage.close();
    });

    test('should handle deep links properly', async ({ page }) => {
        // ディープリンクのテスト
        const deepLinks = [
            '/#/game',
            '/#/settings',
            '/#/help',
            '/#/stats'
        ];
        
        for (const link of deepLinks) {
            await page.goto(link);
            await page.waitForLoadState('networkidle');
            
            // ページが正しくロードされることを確認
            await expect(page.locator('body')).toBeVisible();
            
            // エラーが発生していないことを確認
            const errors = await page.evaluate(() => {
                return (window as any).__jsErrors || [];
            });
            
            expect(errors.length).toBe(0);
        }
    });

    test('should have responsive design for different devices', async ({ page }) => {
        // 異なるデバイスサイズでのテスト
        const devices = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const device of devices) {
            await page.setViewportSize({ width: device.width, height: device.height });
            await page.waitForTimeout(500);
            
            // レイアウトが正しく表示されることを確認
            await expect(page.locator('#gameCanvas')).toBeVisible();
            
            // ビューポートメタタグが機能していることを確認
            const viewport = await page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            });
            
            expect(viewport.width).toBeLessThanOrEqual(device.width);
            expect(viewport.height).toBeLessThanOrEqual(device.height);
        }
    });
});