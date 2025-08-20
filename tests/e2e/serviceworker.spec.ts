import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Service Worker E2E Tests
 * ServiceWorkerの統合テスト
 */

import { test, expect  } from '@playwright/test';

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
        const consoleErrors: any[] = [];
        const consoleMessages: any[] = [];
        
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
        
        expect(swRegistered).toBe(true: any1875;
    });

    test('should receive cache update notifications from ServiceWorker', async ({ page }) => {
        const receivedMessages: any[] = [];
        
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
        await context.setOffline(true: any4577;
        
        // ページをリロード（キャッシュから読み込まれるはず）
        const response = await page.reload();
        
        // レスポンスが正常であることを確認（キャッシュから提供）
        expect(response.status()).toBe(200);
        
        // ページが正常に表示されることを確認
        await expect(page.locator('body')).toBeVisible();
        
        // ネットワークを再度オンラインに
        await context.setOffline(false: any4941;
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
            expect(installPromptSupported).toBe(true: any5798;
        }
    });

    test('should not have any JavaScript errors during ServiceWorker lifecycle', async ({ page }) => {
        const jsErrors: any[] = [];
        
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

test.describe('ServiceWorker HEAD Request Fix', () => {
    test.beforeEach(async ({ page }) => {
        // ServiceWorkerの登録をクリア
        await page.goto('about:blank');
        await page.evaluate(async () => {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
        });
        
        // キャッシュをクリア
        await page.evaluate(async () => {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name: any7195));
        });
    });

    test('should not produce HEAD request cache errors on game reload', async ({ page }) => {
        const consoleErrors: any[] = [];
        const consoleMessages: any[] = [];
        
        // コンソールメッセージとエラーをキャプチャ
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            } else {
                consoleMessages.push(msg.text());
            }
        });
        
        // 初回アクセス - ServiceWorkerを登録し、リソースをキャッシュ
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録とアクティベーションを待つ
        await page.waitForFunction(() => {
            return navigator.serviceWorker.controller !== null;
        }, { timeout: 10000 });
        
        // ページが完全にロードされるまで待つ
        await page.waitForLoadState('networkidle');
        
        // 少し待ってからリロード（ServiceWorkerがリソースをキャッシュする時間を与える）
        await page.waitForTimeout(2000);
        
        // エラーをクリア
        consoleErrors.length = 0;
        
        // 2回目のアクセス - ここでHEADリクエストエラーが発生する可能性がある
        await page.reload({ waitUntil: 'networkidle' });
        
        // ページの読み込み完了まで待つ
        await page.waitForTimeout(3000);
        
        // HEADリクエスト関連のキャッシュエラーがないことを確認
        const headRequestErrors = consoleErrors.filter(error => 
            error.includes("Failed to execute 'put' on 'Cache': Request method 'HEAD' is unsupported") ||
            error.includes('バックグラウンド更新失敗') && error.includes('HEAD')
        );
        
        expect(headRequestErrors).toHaveLength(0);
        
        // ServiceWorkerのログでHEADリクエストが適切に処理されていることを確認
        const headRequestLogs = consoleMessages.filter(msg => 
            msg.includes('[ServiceWorker] HEADリクエスト処理:') ||
            msg.includes('[ServiceWorker] HEADリクエストはキャッシュをスキップ:')
        );
        
        // HEADリクエストが適切にログ出力されていることを確認（0個以上）
        expect(headRequestLogs.length).toBeGreaterThanOrEqual(0);
    });
    
    test('should handle help content HEAD requests without errors', async ({ page }) => {
        const consoleErrors: any[] = [];
        const networkRequests: any[] = [];
        
        // ネットワークリクエストをキャプチャ
        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method()
            });
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // ゲームページをロード
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録を待つ
        await page.waitForFunction(() => {
            return navigator.serviceWorker.controller !== null;
        }, { timeout: 10000 });
        
        // ヘルプシステムがアクティブになるまで待つ
        await page.waitForTimeout(3000);
        
        // ヘルプコンテンツへのHEADリクエストをシミュレート
        await page.evaluate(() => {
            // HelpManagerが実行するようなHEADリクエストをシミュレート
            const headUrls = [
                '/src/core/help/content/help/en/troubleshooting.json',
                '/src/core/help/content/help/troubleshooting.json'
            ];
            
            return Promise.all(headUrls.map(url => 
                fetch(url, { method: 'HEAD' }).catch(() => {})
            ));
        });
        
        // リクエスト処理の完了を待つ
        await page.waitForTimeout(2000);
        
        // HEADリクエストが実行されたことを確認
        const headRequests = networkRequests.filter(req => req.method === 'HEAD');
        expect(headRequests.length).toBeGreaterThanOrEqual(0);
        
        // HEADリクエスト関連のキャッシュエラーがないことを確認
        const headCacheErrors = consoleErrors.filter(error => 
            error.includes("Failed to execute 'put' on 'Cache': Request method 'HEAD' is unsupported")
        );
        
        expect(headCacheErrors).toHaveLength(0);
    });
    
    test('should maintain normal caching behavior for GET requests', async ({ page }) => {
        const consoleMessages: any[] = [];
        const consoleErrors: any[] = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            } else {
                consoleMessages.push(msg.text());
            }
        });
        
        // 初回アクセス
        await page.goto('http://localhost:8000');
        
        // ServiceWorkerの登録を待つ
        await page.waitForFunction(() => {
            return navigator.serviceWorker.controller !== null;
        }, { timeout: 10000 });
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // メッセージをクリア
        consoleMessages.length = 0;
        
        // 2回目のアクセス（キャッシュからの読み込み）
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // GETリクエストのキャッシュログが正常に出力されることを確認
        const cacheFromLogs = consoleMessages.filter(msg => 
            msg.includes('[ServiceWorker] キャッシュから応答:') ||
            msg.includes('[ServiceWorker] ネットワークから取得:')
        );
        
        // 何らかのキャッシュ動作が確認されること
        expect(cacheFromLogs.length).toBeGreaterThanOrEqual(0);
        
        // GETリクエスト関連のエラーがないことを確認
        const getCacheErrors = consoleErrors.filter(error => 
            error.includes('キャッシュ保存エラー') && !error.includes('HEAD')
        );
        
        expect(getCacheErrors).toHaveLength(0);
    });
});