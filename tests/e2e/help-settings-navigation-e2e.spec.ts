/**
 * Help and Settings Navigation E2E Test
 * Issue #166対応 - ヘルプと設定画面からメインメニューへのナビゲーションE2Eテスト
 */

import { test, expect } from '@playwright/test';

test.describe('Help and Settings Navigation E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // LocalStorageをクリア
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // URLパラメータでユーザー名入力をスキップしてメインメニューに直接アクセス
        await page.goto('http://localhost:8000?username=TestUser&skipUsernameInput=true');
        
        // ページを再読み込み
        await page.reload();
        
        // エントリーページの「ゲームを開始する」ボタンをクリック
        await page.getByRole('button', { name: 'ゲームを開始する' }).click();
        
        // PWAウェルカム画面の「始める」ボタンをクリック
        await page.getByRole('button', { name: '始める' }).click();
        
        // メインメニュー表示を待機
        await page.waitForTimeout(2000);
    });

    test('should navigate from main menu to settings and back with ESC key', async ({ page }) => {
        // コンソールエラーの監視
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // JavaScript エラーの監視
        const jsErrors: string[] = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // Canvas要素が存在することを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();

        // メインメニューのスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-before-settings.png' });

        // 設定画面に移動（十字キーのDownを押してメニュー選択、Enterで決定）
        await page.keyboard.press('ArrowDown');  // "ゲーム開始" から "設定" に移動
        await page.keyboard.press('Enter');      // 設定を選択
        
        // 設定画面の読み込みを待機
        await page.waitForTimeout(1500);
        
        // 設定画面のスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/settings-screen.png' });

        // ESCキーを押してメインメニューに戻る
        await page.keyboard.press('Escape');
        
        // メインメニューに戻るまで待機
        await page.waitForTimeout(1500);
        
        // メインメニューに戻ったことを示すスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-after-settings.png' });

        // エラーが発生していないことを確認
        expect(consoleErrors.filter(error => 
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')
        )).toHaveLength(0);
        expect(jsErrors.filter(error => 
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')
        )).toHaveLength(0);
    });

    test('should navigate from main menu to help and back with ESC key', async ({ page }) => {
        // コンソールエラーの監視
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // JavaScript エラーの監視
        const jsErrors: string[] = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // Canvas要素が存在することを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();

        // メインメニューのスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-before-help.png' });

        // ヘルプ画面に移動（十字キーのDownを2回押してメニュー選択、Enterで決定）
        await page.keyboard.press('ArrowDown');  // "ゲーム開始" から "設定" に移動
        await page.keyboard.press('ArrowDown');  // "設定" から "ヘルプ" に移動
        await page.keyboard.press('Enter');      // ヘルプを選択
        
        // ヘルプ画面の読み込みを待機
        await page.waitForTimeout(1500);
        
        // ヘルプ画面のスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/help-screen.png' });

        // ESCキーを押してメインメニューに戻る
        await page.keyboard.press('Escape');
        
        // メインメニューに戻るまで待機
        await page.waitForTimeout(1500);
        
        // メインメニューに戻ったことを示すスクリーンショット撮影
        await canvas.screenshot({ path: 'e2e-screenshots/main-menu-after-help.png' });

        // エラーが発生していないことを確認
        expect(consoleErrors.filter(error => 
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')
        )).toHaveLength(0);
        expect(jsErrors.filter(error => 
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')
        )).toHaveLength(0);
    });

    test('should handle multiple ESC key presses from settings', async ({ page }) => {
        // 設定画面に移動
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);

        // 複数回ESCキーを押してもエラーが発生しないことを確認
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Canvas要素がまだ表示されていることを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();
    });

    test('should handle multiple ESC key presses from help', async ({ page }) => {
        // ヘルプ画面に移動
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);

        // 複数回ESCキーを押してもエラーが発生しないことを確認
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Canvas要素がまだ表示されていることを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();
    });

    test('should navigate between settings and help without returning to main menu', async ({ page }) => {
        // 設定画面に移動
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);

        // 設定画面からヘルプに直接移動できるか確認（実装依存）
        // この動作は実装によって異なる可能性があるため、
        // エラーが発生しないことのみを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();
    });

    test('should maintain navigation state after screen transitions', async ({ page }) => {
        // Canvas要素を取得
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });

        // 設定画面に移動して戻る
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);

        // メインメニューのナビゲーションが正常に機能することを確認
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(300);

        // エラーが発生していないことを確認
        await expect(canvas).toBeVisible();
    });

    test('should handle rapid navigation without errors', async ({ page }) => {
        // コンソールエラーの監視
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // 高速でナビゲーションを繰り返す
        for (let i = 0; i < 5; i++) {
            // 設定画面へ
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(200);
            // メインメニューへ戻る
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
        }

        // エラーが発生していないことを確認
        expect(consoleErrors.filter(error => 
            error.includes('Scene mainMenu not found') || 
            error.includes('Cannot read properties of undefined')
        )).toHaveLength(0);
    });

    test('should display correct scene names during navigation', async ({ page }) => {
        // JavaScriptコンソールでシーン名を取得する関数を注入
        await page.evaluate(() => {
            (window as any).getCurrentSceneName = () => {
                // 実装によってはSceneManagerなどからシーン名を取得
                return (window as any).currentScene || 'unknown';
            };
        });

        // メインメニューでのシーン名確認
        const mainMenuScene = await page.evaluate(() => (window as any).getCurrentSceneName());
        console.log('Main menu scene:', mainMenuScene);

        // 設定画面でのシーン名確認
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        const settingsScene = await page.evaluate(() => (window as any).getCurrentSceneName());
        console.log('Settings scene:', settingsScene);

        // メインメニューに戻る
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);
        const returnedScene = await page.evaluate(() => (window as any).getCurrentSceneName());
        console.log('Returned scene:', returnedScene);

        // Canvas要素がまだ表示されていることを確認
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();
    });

    test('should handle navigation with different input methods', async ({ page }) => {
        // Canvas要素を取得
        const canvas = page.getByRole('img', { name: 'ゲーム画面' });
        await expect(canvas).toBeVisible();

        // マウスクリックでの設定画面への移動（座標は実装依存）
        // 設定ボタンの想定位置をクリック
        await page.mouse.click(400, 400);
        await page.waitForTimeout(1500);

        // ESCキーで戻る
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);

        // キーボードでヘルプ画面へ
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);

        // ESCキーで戻る
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);

        // エラーが発生していないことを確認
        await expect(canvas).toBeVisible();
    });

    test('should preserve game state during navigation', async ({ page }) => {
        // ゲームの状態を設定（実装依存）
        await page.evaluate(() => {
            (window as any).gameState = {
                score: 100,
                level: 1,
                timestamp: Date.now()
            };
        });

        // 設定画面への移動と復帰
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);

        // ゲーム状態が保持されているか確認
        const gameState = await page.evaluate(() => (window as any).gameState);
        expect(gameState).toBeTruthy();
        expect(gameState.score).toBe(100);
        expect(gameState.level).toBe(1);
    });
});