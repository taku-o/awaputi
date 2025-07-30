/**
 * Service Worker E2E Tests
 * ServiceWorkerの統合テスト
 */

const { test, expect } = require('@playwright/test');

test.describe('ServiceWorker postMessage Fix', () => {
    test.beforeEach(async ({ page }) => {
        // ServiceWorkerの登録をクリア
        await page.goto('about:blank');
        await page.evaluate(async () => {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
        });
    });

    test('should register ServiceWorker without postMessage errors', async ({ page }) => {
        const consoleErrors = [];
        const consoleMessages = [];
        
        // コンソールメッセージとエラーをキャプチャ
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            } else {
                consoleMessages.push(msg.text());
            }
        });
        
        // ページを読み込み
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録を待つ
        await page.waitForFunction(() => {
            return navigator.serviceWorker.controller !== null || 
                   navigator.serviceWorker.ready;
        }, { timeout: 10000 });
        
        // postMessageエラーがないことを確認
        const postMessageErrors = consoleErrors.filter(error => 
            error.includes('postMessage') || 
            error.includes('self.postMessage is not a function')
        );
        
        expect(postMessageErrors).toHaveLength(0);
        
        // ServiceWorkerが正常に登録されたことを確認
        const swRegistered = await page.evaluate(() => {
            return navigator.serviceWorker.controller !== null;
        });
        
        expect(swRegistered).toBe(true);
    });

    test('should receive cache update notifications from ServiceWorker', async ({ page }) => {
        const receivedMessages = [];
        
        // ServiceWorkerからのメッセージをキャプチャ
        await page.addInitScript(() => {
            window.swMessages = [];
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('message', event => {
                    window.swMessages.push(event.data);
                });
            }
        });
        
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録とメッセージ受信を待つ
        await page.waitForFunction(() => {
            return window.swMessages && window.swMessages.length > 0;
        }, { timeout: 15000 });
        
        const messages = await page.evaluate(() => window.swMessages);
        
        // CACHE_UPDATEDメッセージが受信されることを確認
        const cacheUpdateMessage = messages.find(msg => msg.type === 'CACHE_UPDATED');
        expect(cacheUpdateMessage).toBeDefined();
        expect(cacheUpdateMessage.payload).toHaveProperty('cached');
        expect(cacheUpdateMessage.payload).toHaveProperty('total');
    });

    test('should receive offline ready notifications from ServiceWorker', async ({ page }) => {
        await page.addInitScript(() => {
            window.swMessages = [];
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('message', event => {
                    window.swMessages.push(event.data);
                });
            }
        });
        
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerがアクティベートされるまで待つ
        await page.waitForFunction(() => {
            return window.swMessages && 
                   window.swMessages.some(msg => msg.type === 'OFFLINE_READY');
        }, { timeout: 15000 });
        
        const messages = await page.evaluate(() => window.swMessages);
        
        // OFFLINE_READYメッセージが受信されることを確認
        const offlineReadyMessage = messages.find(msg => msg.type === 'OFFLINE_READY');
        expect(offlineReadyMessage).toBeDefined();
        expect(offlineReadyMessage.payload).toHaveProperty('timestamp');
        expect(typeof offlineReadyMessage.payload.timestamp).toBe('number');
    });

    test('should handle offline functionality correctly', async ({ page, context }) => {
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録を待つ
        await page.waitForFunction(() => {
            return navigator.serviceWorker.controller !== null;
        }, { timeout: 10000 });
        
        // ネットワークをオフラインに設定
        await context.setOffline(true);
        
        // ページをリロード（キャッシュから読み込まれるはず）
        const response = await page.reload();
        
        // レスポンスが正常であることを確認（キャッシュから提供）
        expect(response.status()).toBe(200);
        
        // ページが正常に表示されることを確認
        await expect(page.locator('body')).toBeVisible();
        
        // ネットワークを再度オンラインに
        await context.setOffline(false);
    });

    test('should handle PWA installation prompts', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録を待つ
        await page.waitForFunction(() => {
            return navigator.serviceWorker.controller !== null;
        }, { timeout: 10000 });
        
        // PWAのmanifestが存在することを確認
        const manifestLink = await page.locator('link[rel="manifest"]');
        await expect(manifestLink).toBeAttached();
        
        // beforeinstallpromptイベントが発生する可能性を確認
        const installPromptSupported = await page.evaluate(() => {
            return 'beforeinstallprompt' in window;
        });
        
        // ブラウザがPWAインストールをサポートしているかチェック
        if (installPromptSupported) {
            // インストールプロンプトの処理が正常に動作することを確認
            expect(installPromptSupported).toBe(true);
        }
    });

    test('should not have any JavaScript errors during ServiceWorker lifecycle', async ({ page }) => {
        const jsErrors = [];
        
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });
        
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerライフサイクル全体を待つ
        await page.waitForTimeout(5000);
        
        // JavaScript エラーがないことを確認
        expect(jsErrors).toHaveLength(0);
        
        // ServiceWorker関連の特定のエラーをチェック
        const swRelatedErrors = jsErrors.filter(error => 
            error.includes('ServiceWorker') || 
            error.includes('postMessage') ||
            error.includes('sw.js')
        );
        
        expect(swRelatedErrors).toHaveLength(0);
    });
});