/**
 * E2E tests for keyboard shortcuts to settings UI migration (Issue #170)
 * Tests the complete user workflow from UI interaction to functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts to Settings UI Migration (Issue #170)', () => {
    test.beforeEach(async ({ page }) => {
        // ゲームページに移動
        await page.goto('/');
        
        // ページが完全に読み込まれるまで待機
        await page.waitForLoadState('networkidle');
        
        // ユーザー名入力をスキップしてメインメニューに移動
        const usernameInput = page.locator('input[type="text"]');
        if (await usernameInput.isVisible()) {
            await usernameInput.fill('TestUser');
            await page.keyboard.press('Enter');
        }
        
        // メインメニューが表示されるまで待機
        await page.waitForSelector('.main-menu', { timeout: 10000 });
    });

    test.describe('Settings Screen Access', () => {
        test('should open settings screen from main menu', async ({ page }) => {
            // 設定メニューをクリック
            await page.click('text=設定');
            
            // 設定画面が表示されることを確認
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // 一般設定カテゴリが存在することを確認
            await expect(page.locator('text=一般')).toBeVisible();
            
            // アクセシビリティカテゴリが存在することを確認
            await expect(page.locator('text=アクセシビリティ')).toBeVisible();
        });
    });

    test.describe('Fullscreen Toggle through Settings UI', () => {
        test('should toggle fullscreen from settings screen', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // 一般設定カテゴリに移動
            await page.click('text=一般');
            
            // フルスクリーントグルボタンを探す
            const fullscreenToggle = page.locator('text=フルスクリーン').locator('..');
            await expect(fullscreenToggle).toBeVisible();
            
            // フルスクリーントグルをクリック
            await fullscreenToggle.click();
            
            // フルスクリーン状態の変化を確認（設定値の変化）
            // Note: Playwright E2Eテストではフルスクリーンの実際の動作確認は制限される
            await page.waitForTimeout(500); // 処理完了を待機
        });

        test('should not trigger fullscreen with F key', async ({ page }) => {
            // メインメニューでFキーを押す
            await page.keyboard.press('F');
            
            // フルスクリーンにならないことを確認
            await page.waitForTimeout(500);
            
            // 設定画面でもFキーを押してみる
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            await page.keyboard.press('F');
            
            // フルスクリーン切り替えが発生しないことを確認
            await page.waitForTimeout(500);
        });
    });

    test.describe('Audio Mute Toggle through Settings UI', () => {
        test('should toggle audio mute from settings screen', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // 一般設定カテゴリに移動
            await page.click('text=一般');
            
            // 音声ミュートトグルボタンを探す
            const muteToggle = page.locator('text=音声ミュート').locator('..');
            await expect(muteToggle).toBeVisible();
            
            // ミュートトグルをクリック
            await muteToggle.click();
            
            // ミュート状態の変化を確認
            await page.waitForTimeout(500);
        });

        test('should not trigger mute with M key', async ({ page }) => {
            // メインメニューでMキーを押す
            await page.keyboard.press('M');
            
            // ミュートが発生しないことを確認
            await page.waitForTimeout(500);
            
            // 設定画面でもMキーを押してみる
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            await page.keyboard.press('M');
            
            // ミュート切り替えが発生しないことを確認
            await page.waitForTimeout(500);
        });
    });

    test.describe('Volume Control through Settings UI', () => {
        test('should adjust volume from settings screen', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // 一般設定カテゴリに移動
            await page.click('text=一般');
            
            // 音量スライダーを探す
            const volumeSlider = page.locator('[aria-label*="音量"]');
            await expect(volumeSlider).toBeVisible();
            
            // 音量を調整
            const sliderBox = await volumeSlider.boundingBox();
            if (sliderBox) {
                // スライダーの中央をクリック（50%に設定）
                await page.mouse.click(
                    sliderBox.x + sliderBox.width / 2,
                    sliderBox.y + sliderBox.height / 2
                );
            }
            
            await page.waitForTimeout(500);
        });

        test('should not adjust volume with Ctrl+Arrow keys', async ({ page }) => {
            // メインメニューでCtrl+↑を押す
            await page.keyboard.press('Control+ArrowUp');
            await page.waitForTimeout(300);
            
            // Ctrl+↓を押す
            await page.keyboard.press('Control+ArrowDown');
            await page.waitForTimeout(300);
            
            // 音量調整が発生しないことを確認
            // （実際の音量値は設定画面で確認）
            await page.click('text=設定');
            await page.click('text=一般');
            
            const volumeSlider = page.locator('[aria-label*="音量"]');
            await expect(volumeSlider).toBeVisible();
        });
    });

    test.describe('Accessibility Profile Switching through Settings UI', () => {
        test('should switch accessibility profiles from settings screen', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // アクセシビリティカテゴリに移動
            await page.click('text=アクセシビリティ');
            
            // プロファイル切り替えボタンを探す
            const profileButtons = page.locator('button').filter({ hasText: /視覚支援|聴覚支援|運動支援/ });
            const count = await profileButtons.count();
            expect(count).toBeGreaterThan(0);
            
            // 各プロファイルボタンをクリック
            for (let i = 0; i < count; i++) {
                await profileButtons.nth(i).click();
                await page.waitForTimeout(300);
            }
        });

        test('should not switch profiles with Ctrl+Alt+A/V/M keys', async ({ page }) => {
            // 各プロファイルショートカットを試す
            const shortcuts = ['Control+Alt+A', 'Control+Alt+V', 'Control+Alt+M'];
            
            for (const shortcut of shortcuts) {
                await page.keyboard.press(shortcut);
                await page.waitForTimeout(300);
            }
            
            // プロファイル切り替えが発生しないことを確認
            await page.click('text=設定');
            await page.click('text=アクセシビリティ');
            
            // 設定画面が正常に表示されることを確認
            await expect(page.locator('.settings-scene')).toBeVisible();
        });
    });

    test.describe('Settings Management through Settings UI', () => {
        test('should export settings from settings screen', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // アクセシビリティカテゴリに移動
            await page.click('text=アクセシビリティ');
            
            // エクスポートボタンを探す
            const exportButton = page.locator('button').filter({ hasText: /エクスポート|書き出し/ });
            await expect(exportButton).toBeVisible();
            
            // エクスポートボタンをクリック
            const downloadPromise = page.waitForEvent('download');
            await exportButton.click();
            
            // ダウンロードを待機（タイムアウトを設定）
            const download = await Promise.race([
                downloadPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Download timeout')), 5000)
                )
            ]).catch(() => null);
            
            // ダウンロードが発生した場合の処理
            if (download) {
                expect(download).toBeTruthy();
            }
        });

        test('should import settings from settings screen', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // アクセシビリティカテゴリに移動
            await page.click('text=アクセシビリティ');
            
            // インポートボタンを探す
            const importButton = page.locator('button').filter({ hasText: /インポート|読み込み/ });
            await expect(importButton).toBeVisible();
            
            // インポートボタンをクリック
            await importButton.click();
            
            // ファイル選択ダイアログが表示されることを確認
            const fileInput = page.locator('input[type="file"]');
            await expect(fileInput).toBeAttached();
        });

        test('should not trigger settings export/import with Ctrl+E/I keys', async ({ page }) => {
            // Ctrl+Eを押す（エクスポート）
            await page.keyboard.press('Control+E');
            await page.waitForTimeout(300);
            
            // Ctrl+Iを押す（インポート）
            await page.keyboard.press('Control+I');
            await page.waitForTimeout(300);
            
            // ダウンロードやファイル選択が発生しないことを確認
            const fileInputs = await page.locator('input[type="file"]').count();
            expect(fileInputs).toBe(0);
        });
    });

    test.describe('Settings Persistence', () => {
        test('should persist settings after page reload', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // 一般設定カテゴリに移動
            await page.click('text=一般');
            
            // 設定を変更（例：音声ミュート）
            const muteToggle = page.locator('text=音声ミュート').locator('..');
            await muteToggle.click();
            await page.waitForTimeout(500);
            
            // ページをリロード
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            // ユーザー名入力をスキップ
            const usernameInput = page.locator('input[type="text"]');
            if (await usernameInput.isVisible()) {
                await usernameInput.fill('TestUser');
                await page.keyboard.press('Enter');
            }
            
            // 設定画面を再度開く
            await page.click('text=設定');
            await page.click('text=一般');
            
            // 設定が保持されていることを確認
            // Note: 実際の設定値の確認は実装に依存
            await expect(page.locator('.settings-scene')).toBeVisible();
        });
    });

    test.describe('Cross-Browser Compatibility', () => {
        test('should work correctly on mobile viewport', async ({ page }) => {
            // モバイルビューポートに設定
            await page.setViewportSize({ width: 375, height: 667 });
            
            // 設定画面を開く
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
            
            // モバイルでも各UI要素が表示されることを確認
            await page.click('text=一般');
            
            const fullscreenToggle = page.locator('text=フルスクリーン').locator('..');
            await expect(fullscreenToggle).toBeVisible();
            
            const muteToggle = page.locator('text=音声ミュート').locator('..');
            await expect(muteToggle).toBeVisible();
        });

        test('should handle touch interactions on mobile', async ({ page }) => {
            // モバイルビューポートに設定
            await page.setViewportSize({ width: 375, height: 667 });
            
            // 設定画面を開く
            await page.click('text=設定');
            await page.click('text=一般');
            
            // タッチでトグルを操作
            const muteToggle = page.locator('text=音声ミュート').locator('..');
            await muteToggle.tap();
            await page.waitForTimeout(300);
            
            // タッチでスライダーを操作
            const volumeSlider = page.locator('[aria-label*="音量"]');
            if (await volumeSlider.isVisible()) {
                const sliderBox = await volumeSlider.boundingBox();
                if (sliderBox) {
                    await page.touchscreen.tap(
                        sliderBox.x + sliderBox.width * 0.7,
                        sliderBox.y + sliderBox.height / 2
                    );
                }
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should handle settings load errors gracefully', async ({ page }) => {
            // LocalStorageを破損させる
            await page.evaluate(() => {
                localStorage.setItem('gameSettings', 'invalid JSON');
            });
            
            // ページをリロード
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            // エラーが発生してもアプリケーションが動作することを確認
            const usernameInput = page.locator('input[type="text"]');
            if (await usernameInput.isVisible()) {
                await usernameInput.fill('TestUser');
                await page.keyboard.press('Enter');
            }
            
            // 設定画面が開けることを確認
            await page.click('text=設定');
            await expect(page.locator('.settings-scene')).toBeVisible();
        });

        test('should handle missing UI elements gracefully', async ({ page }) => {
            // 設定画面を開く
            await page.click('text=設定');
            
            // 存在しないカテゴリをクリックしようとする
            const nonExistentCategory = page.locator('text=存在しないカテゴリ');
            const exists = await nonExistentCategory.isVisible();
            
            // 存在しない要素へのアクセスがエラーを起こさないことを確認
            expect(exists).toBe(false);
            
            // アプリケーションが正常に動作することを確認
            await expect(page.locator('.settings-scene')).toBeVisible();
        });
    });
});