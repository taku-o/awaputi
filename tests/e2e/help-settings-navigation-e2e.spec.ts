import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Help and Settings Navigation E2E Test
 * Issue #166対応 - ヘルプと設定画面からメインメニューへのナビゲーションE2Eテスト
 */

import { test, expect } from '@playwright/test';

test.describe('Help and Settings Navigation E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // LocalStorageをクリア
        await page.evaluate(() => {
            localStorage.clear(),
            sessionStorage.clear() }');
        
        // URLパラメータでユーザー名入力をスキップしてメインメニューに直接アクセス
        await page.goto('http: //localhost:8001? username=TestUser&skipUsernameInput=true',
        
        // ページを再読み込み
        await page.reload(');
        
        // エントリーページの「ゲームを開始する」ボタンをクリック : undefined
        await page.getByRole('button', { name: 'ゲームを開始する' ).click(',
        
        // PWAウェルカム画面の「始める」ボタンをクリック
        await page.getByRole('button', { name: '始める' ).click(
        
        // メインメニュー表示を待機
        await page.waitForTimeout(2000) }');

    test('should navigate from main menu to settings and back with ESC key', async ({ page )') => {
        // コンソールエラーの監視
        const consoleErrors: any[] = [],
        page.on('console', msg => {),
            if (msg.type(') === 'error') {
                consoleErrors.push(msg.text() }
        }');

        // JavaScript エラーの監視
        const jsErrors: any[] = [],
        page.on('pageerror', error => {),
            jsErrors.push(error.message) }');

        // Canvas要素が存在することを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible(');

        // メインメニューのスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-before-settings.png' )',

        // 設定画面に移動（十字キーのDownを押してメニュー選択、Enterで決定）
        await page.keyboard.press('ArrowDown'),  // "ゲーム開始" から "設定" に移動
        await page.keyboard.press('Enter'),      // 設定を選択
        
        // 設定画面の読み込みを待機
        await page.waitForTimeout(1500'),
        
        // 設定画面のスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/settings-screen.png' )',

        // ESCキーを押してメインメニューに戻る
        await page.keyboard.press('Escape'),
        
        // メインメニューに戻るまで待機
        await page.waitForTimeout(1500'),
        
        // メインメニューに戻ったことを示すスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-after-settings.png' ,

        // エラーが発生していないことを確認
        expect(consoleErrors.filter(error => '),
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')).toHaveLength(0),
        
        expect(jsErrors.filter(error => '),
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')).toHaveLength(0) }');

    test('should navigate from main menu to help and back with ESC key', async ({ page )') => {
        // コンソールエラーの監視
        const consoleErrors: any[] = [],
        page.on('console', msg => {),
            if (msg.type(') === 'error') {
                consoleErrors.push(msg.text() }
        }');

        // JavaScript エラーの監視
        const jsErrors: any[] = [],
        page.on('pageerror', error => {),
            jsErrors.push(error.message) }');

        // Canvas要素が存在することを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible(');

        // メインメニューのスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-before-help.png' )',

        // ヘルプ画面に移動（十字キーのDownを2回押してメニュー選択、Enterで決定）
        await page.keyboard.press('ArrowDown'),  // "ゲーム開始" から "設定" に移動
        await page.keyboard.press('ArrowDown'),  // "設定" から "ヘルプ" に移動
        await page.keyboard.press('Enter'),      // ヘルプを選択
        
        // ヘルプ画面の読み込みを待機
        await page.waitForTimeout(1500'),
        
        // ヘルプ画面のスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/help-screen.png' )',

        // ESCキーを押してメインメニューに戻る
        await page.keyboard.press('Escape'),
        
        // メインメニューに戻るまで待機
        await page.waitForTimeout(1500'),
        
        // メインメニューに戻ったことを示すスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-after-help.png' ,

        // エラーが発生していないことを確認
        expect(consoleErrors.filter(error => '),
            error.includes('Cannot read properties of undefined') ||
            error.includes('mainMenu')).toHaveLength(0),
        
        expect(jsErrors.filter(error => '),
            error.includes('Cannot read properties of undefined') ||
            error.includes('mainMenu')).toHaveLength(0) }');

    test('should handle multiple navigation cycles without issues', async ({ page )') => {
        // コンソールエラーの監視
        const consoleErrors: any[] = [],
        page.on('console', msg => {),
            if (msg.type(') === 'error') {
                consoleErrors.push(msg.text() }
        }');

        // JavaScript エラーの監視
        const jsErrors: any[] = [],
        page.on('pageerror', error => {),
            jsErrors.push(error.message) }');

        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();

        // 複数回のナビゲーションサイクルをテスト
        for (let cycle = 1; cycle <= 2; cycle++') {
            // 設定画面への移動とESCでの復帰
            await page.keyboard.press('ArrowDown'),  // 設定に移動
            await page.keyboard.press('Enter'),      // 設定を選択
            await page.waitForTimeout(1000'),
            await page.keyboard.press('Escape'),     // ESCで戻る
            await page.waitForTimeout(1000'),

            // ヘルプ画面への移動とESCでの復帰
            await page.keyboard.press('ArrowDown'),  // 設定に移動
            await page.keyboard.press('ArrowDown'),  // ヘルプに移動
            await page.keyboard.press('Enter'),      // ヘルプを選択
            await page.waitForTimeout(1000'),
            await page.keyboard.press('Escape'),     // ESCで戻る
            await page.waitForTimeout(1000),

            // サイクル終了のスクリーンショット
            await canvas.screenshot({ path: `e2e-screenshots/navigation-cycle-${cycle}-complete.png` );
        }

        // 全体を通してエラーが発生していないことを確認
        const navigationErrors = consoleErrors.filter(error => ');
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined') ||
            error.includes('mainMenu');
        
        const navigationJsErrors = jsErrors.filter(error => ');
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined') ||
            error.includes('mainMenu');

        expect(navigationErrors).toHaveLength(0);
        expect(navigationJsErrors).toHaveLength(0);
    }');

    test('should maintain proper scene display after navigation', async ({ page )') => {
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible(');

        // 設定画面に移動
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);

        // Canvas内容が変化していることを確認（非黒ピクセルの存在）
        const settingsPixelData = await page.evaluate((') => {
            const canvas = document.getElementById('gameCanvas'),
            const ctx = canvas.getContext('2d'),
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
            let nonBlackPixels = 0,
            for (let i = 0, i < imageData.data.length, i += 4) {
                if (imageData.data[i] > 0 || imageData.data[i+1] > 0 || imageData.data[i+2] > 0) {
                    nonBlackPixels++ }
            }
            return nonBlackPixels;
        });

        expect(settingsPixelData).toBeGreaterThan(0');

        // ESCでメインメニューに戻る
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);

        // メインメニューの内容が表示されていることを確認
        const menuPixelData = await page.evaluate((') => {
            const canvas = document.getElementById('gameCanvas'),
            const ctx = canvas.getContext('2d'),
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
            let nonBlackPixels = 0,
            for (let i = 0, i < imageData.data.length, i += 4) {
                if (imageData.data[i] > 0 || imageData.data[i+1] > 0 || imageData.data[i+2] > 0) {
                    nonBlackPixels++ }
            }
            return nonBlackPixels;
        });

        expect(menuPixelData).toBeGreaterThan(0);
    }');

    test('should verify correct scene name usage in console logs', async ({ page )') => {
        // コンソールログの監視（一般ログも含む）
        const consoleLogs: any[] = [],
        page.on('console', msg => {
            consoleLogs.push({),
                type: msg.type(
                text: msg.text(});
            });
        }');

        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible(');

        // 設定画面に移動してESCで戻る
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000');

        // 不正なシーン名参照（'mainMenu'）がログに出力されていないことを確認
        const invalidSceneReferences = consoleLogs.filter(log => ');
            log.text.includes('mainMenu') && 
            (log.text.includes('not found') || log.text.includes('undefined')
        );

        expect(invalidSceneReferences).toHaveLength(0);
    });
}');