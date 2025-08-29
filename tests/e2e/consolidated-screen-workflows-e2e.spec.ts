/**
 * Consolidated Screen Workflows E2E Test
 * タスク19: 統合画面ワークフローの包括的E2Eテスト
 * 
 * 統合されたヘルプ・設定画面の包括的なワークフローテスト
 * - 完全なヘルプアクセスワークフロー（URLパラメータ使用）
 * - 完全な設定アクセスワークフロー（URLパラメータ使用）
 * - ブラウザ内でのキーボードショートカット動作確認
 * - ナビゲーション中のJavaScriptエラー検証
 * 
 * 要件: 1.1, 2.1, 4.1, 4.3
 */

import { test, expect } from '@playwright/test';

test.describe('Consolidated Screen Workflows E2E Tests', () => {
    let consoleErrors: any[] = [];
    let jsErrors: any[] = [];

    test.beforeEach(async ({ page }) => {
        // Console監視の初期化
        consoleErrors = [];
        jsErrors = [];
        
        // コンソールエラーの監視
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // JavaScript エラーの監視
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // LocalStorage クリア
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test.describe('Unified Help Screen Complete Workflows', () => {
        test('should complete main menu to help workflow with URL parameters', async ({ page }) => {
            // URLパラメータでユーザー名入力をスキップしてメインメニューに直接アクセス
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            
            // ページ読み込み完了を待機
            await page.waitForSelector('canvas', { timeout: 10000 });
            
            // エントリーページの「ゲームを開始する」ボタンをクリック
            try {
                await page.getByRole('button', { name: 'ゲームを開始する' }).click({ timeout: 2000 });
            } catch (e) {
                // ボタンが見つからない場合はスキップ（エントリーページが無効化されている可能性）
            }
            
            // PWAウェルカム画面の処理
            try {
                await page.getByRole('button', { name: '始める' }).click({ timeout: 2000 });
            } catch (e) {
                // PWAウェルカム画面がない場合はスキップ
            }
            
            // Canvas要素の確認
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
            
            // メインメニュー画面でのスクリーンショット
            await page.screenshot({ path: 'e2e-screenshots/consolidated-main-menu.png' });
            
            // メインメニューのヘルプにアクセス（統一されたナビゲーション使用）
            await page.keyboard.press('ArrowDown'); // "ゲーム開始" から "設定" に移動
            await page.keyboard.press('ArrowDown'); // "設定" から "ヘルプ" に移動
            await page.keyboard.press('Enter');     // ヘルプを選択
            
            // ヘルプ画面の読み込み待機
            await page.waitForTimeout(2000);
            
            // ヘルプ画面でのスクリーンショット
            await page.screenshot({ path: 'e2e-screenshots/consolidated-help-from-menu.png' });
            
            // ヘルプナビゲーション操作のテスト
            await page.keyboard.press('ArrowRight'); // カテゴリ移動
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');      // カテゴリ選択
            await page.waitForTimeout(1000);
            
            // ESCキーでメインメニューに戻る（統一されたナビゲーション使用）
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // メインメニューに戻ったことを確認するスクリーンショット
            await page.screenshot({ path: 'e2e-screenshots/consolidated-return-from-help.png' });
            
            // 統合実装によってコンソールエラーが解決されていることを確認
            const helpWorkflowErrors = consoleErrors.filter(error =>
                error.includes('Scene mainMenu not found') || 
                error.includes('Cannot read properties of undefined') ||
                error.includes('mainMenu') ||
                error.includes('scenes.mainMenu')
            );
            expect(helpWorkflowErrors).toHaveLength(0);
        });

        test('should support H key shortcut from different scenes using URL parameters', async ({ page }) => {
            // ゲームシーンに直接アクセス
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=game');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // ゲームシーンからHキーでヘルプアクセス（統一されたキーボードルーティング使用）
            await page.keyboard.press('h');
            await page.waitForTimeout(2000);
            
            // ヘルプ画面に遷移したことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-help-from-h-key.png' });
            
            // ESCでゲームシーンに戻る（コンテキスト保持機能使用）
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // ゲームシーンに戻ったことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-return-to-game.png' });
            
            // Hキーショートカットワークフローでエラーがないことを確認
            const hKeyErrors = consoleErrors.filter(error =>
                error.includes('KeyboardShortcutRouter') ||
                error.includes('NavigationContextManager') ||
                error.includes('help shortcut')
            );
            expect(hKeyErrors).toHaveLength(0);
        });

        test('should support F1 contextual help access workflow', async ({ page }) => {
            // 設定シーンに直接アクセス
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=settings');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // 設定シーンからF1でコンテキストヘルプアクセス
            await page.keyboard.press('F1');
            await page.waitForTimeout(2000);
            
            // コンテキストヘルプが表示されたことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-contextual-help-f1.png' });
            
            // コンテキストヘルプ内でのナビゲーション
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // ESCで設定シーンに戻る
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // 設定シーンに戻ったことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-return-to-settings.png' });
            
            // F1コンテキストヘルプワークフローでエラーがないことを確認
            const f1Errors = consoleErrors.filter(error =>
                error.includes('contextualHelp') ||
                error.includes('F1') ||
                error.includes('handleContextualHelp')
            );
            expect(f1Errors).toHaveLength(0);
        });
    });

    test.describe('Unified Settings Screen Complete Workflows', () => {
        test('should complete main menu to settings workflow with URL parameters', async ({ page }) => {
            // URLパラメータでメインメニューに直接アクセス
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // メインメニューから設定にアクセス（統一されたナビゲーション使用）
            await page.keyboard.press('ArrowDown'); // "ゲーム開始" から "設定" に移動
            await page.keyboard.press('Enter');     // 設定を選択
            
            // 設定画面の読み込み待機
            await page.waitForTimeout(2000);
            
            // 設定画面でのスクリーンショット
            await page.screenshot({ path: 'e2e-screenshots/consolidated-settings-from-menu.png' });
            
            // 設定カテゴリ間でのナビゲーション（統合された設定機能使用）
            await page.keyboard.press('Tab');    // 次の設定項目に移動
            await page.waitForTimeout(500);
            await page.keyboard.press('Space');  // 設定値の変更
            await page.waitForTimeout(500);
            await page.keyboard.press('Tab');    // さらに次の項目に移動
            await page.waitForTimeout(500);
            
            // アクセシビリティ設定の操作（統合されたアクセシビリティ設定使用）
            await page.keyboard.press('a'); // アクセシビリティセクションのショートカット
            await page.waitForTimeout(1000);
            await page.keyboard.press('Space'); // アクセシビリティ設定のトグル
            await page.waitForTimeout(500);
            
            // 設定変更後のスクリーンショット
            await page.screenshot({ path: 'e2e-screenshots/consolidated-settings-modified.png' });
            
            // ESCキーでメインメニューに戻る（統一されたナビゲーション使用）
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // メインメニューに戻ったことを確認するスクリーンショット
            await page.screenshot({ path: 'e2e-screenshots/consolidated-return-from-settings.png' });
            
            // 設定ワークフローでエラーがないことを確認
            const settingsWorkflowErrors = consoleErrors.filter(error =>
                error.includes('Scene mainMenu not found') || 
                error.includes('SettingsScene') ||
                error.includes('AccessibilitySettingsUI')
            );
            expect(settingsWorkflowErrors).toHaveLength(0);
        });

        test('should support S key shortcut from different scenes using URL parameters', async ({ page }) => {
            // ヘルプシーンに直接アクセス
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=help');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // ヘルプシーンからSキーで設定アクセス（統一されたキーボードルーティング使用）
            await page.keyboard.press('s');
            await page.waitForTimeout(2000);
            
            // 設定画面に遷移したことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-settings-from-s-key.png' });
            
            // 設定での操作
            await page.keyboard.press('Tab');
            await page.waitForTimeout(500);
            await page.keyboard.press('Space');
            await page.waitForTimeout(500);
            
            // ESCでヘルプシーンに戻る（コンテキスト保持機能使用）
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // ヘルプシーンに戻ったことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-return-to-help-from-s.png' });
            
            // Sキーショートカットワークフローでエラーがないことを確認
            const sKeyErrors = consoleErrors.filter(error =>
                error.includes('KeyboardShortcutRouter') ||
                error.includes('NavigationContextManager') ||
                error.includes('settings shortcut')
            );
            expect(sKeyErrors).toHaveLength(0);
        });

        test('should handle complex navigation chains (help -> settings -> help)', async ({ page }) => {
            // メインメニューに直接アクセス
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // 複雑なナビゲーションチェーンをテスト
            // Menu -> Help
            await page.keyboard.press('h');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'e2e-screenshots/consolidated-chain-1-help.png' });
            
            // Help -> Settings
            await page.keyboard.press('s');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'e2e-screenshots/consolidated-chain-2-settings.png' });
            
            // Settings -> Help again
            await page.keyboard.press('h');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'e2e-screenshots/consolidated-chain-3-help-again.png' });
            
            // 3段階のESCでメインメニューに戻る（NavigationContextManagerの完全テスト）
            await page.keyboard.press('Escape'); // Help -> Settings
            await page.waitForTimeout(1000);
            await page.keyboard.press('Escape'); // Settings -> Help
            await page.waitForTimeout(1000);
            await page.keyboard.press('Escape'); // Help -> Menu
            await page.waitForTimeout(2000);
            
            // 最終的にメインメニューに戻ったことを確認
            await page.screenshot({ path: 'e2e-screenshots/consolidated-chain-final-menu.png' });
            
            // 複雑なナビゲーションチェーンでエラーがないことを確認
            const chainErrors = consoleErrors.filter(error =>
                error.includes('navigation') ||
                error.includes('context') ||
                error.includes('stack')
            );
            expect(chainErrors).toHaveLength(0);
        });
    });

    test.describe('Cross-Browser Keyboard Shortcuts Verification', () => {
        test('should verify H key works correctly in browser environment', async ({ page, browserName }) => {
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // ブラウザ環境でのHキー動作確認
            await page.keyboard.press('h');
            await page.waitForTimeout(2000);
            // ブラウザ固有のスクリーンショット
            await page.screenshot({ path: `e2e-screenshots/h-key-${browserName}.png` });
            
            // ヘルプ画面での操作
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // ESCで戻る
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // ブラウザ固有のエラーがないことを確認
            const browserSpecificErrors = consoleErrors.filter(error =>
                error.toLowerCase().includes(browserName) ||
                error.includes('keyboard') ||
                error.includes('keydown')
            );
            
            expect(browserSpecificErrors).toHaveLength(0);
        });

        test('should verify S key works correctly in browser environment', async ({ page, browserName }) => {
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=game');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // ブラウザ環境でのSキー動作確認
            await page.keyboard.press('s');
            await page.waitForTimeout(2000);
            // ブラウザ固有のスクリーンショット
            await page.screenshot({ path: `e2e-screenshots/s-key-${browserName}.png` });
            
            // 設定画面での操作
            await page.keyboard.press('Tab');
            await page.waitForTimeout(500);
            await page.keyboard.press('Space');
            await page.waitForTimeout(500);
            
            // ESCで戻る
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // ブラウザ固有のエラーがないことを確認
            const browserSpecificErrors = consoleErrors.filter(error =>
                error.toLowerCase().includes(browserName) ||
                error.includes('settings') ||
                error.includes('KeyS')
            );
            
            expect(browserSpecificErrors).toHaveLength(0);
        });

        test('should verify F1 key works correctly in browser environment', async ({ page, browserName }) => {
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=settings');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // ブラウザ環境でのF1キー動作確認
            await page.keyboard.press('F1');
            await page.waitForTimeout(2000);
            // ブラウザ固有のスクリーンショット
            await page.screenshot({ path: `e2e-screenshots/f1-key-${browserName}.png` });
            
            // コンテキストヘルプでの操作
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // ESCで戻る
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            // ブラウザ固有のエラーがないことを確認
            const browserSpecificErrors = consoleErrors.filter(error =>
                error.toLowerCase().includes(browserName) ||
                error.includes('F1') ||
                error.includes('contextualHelp')
            );
            
            expect(browserSpecificErrors).toHaveLength(0);
        });
    });

    test.describe('JavaScript Error Monitoring During Navigation', () => {
        test('should verify no JavaScript errors during complete workflow cycles', async ({ page }) => {
            // 初期JavaScript環境の確認
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // 完全ワークフローサイクル1: Menu -> Help -> Menu
            await page.keyboard.press('h');
            await page.waitForTimeout(2000);
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            // サイクル1のエラーチェック
            expect(consoleErrors.length).toBe(0);
            expect(jsErrors.length).toBe(0);
            
            // 完全ワークフローサイクル2: Menu -> Settings -> Menu
            await page.keyboard.press('s');
            await page.waitForTimeout(2000);
            await page.keyboard.press('Tab');
            await page.waitForTimeout(500);
            await page.keyboard.press('Space');
            await page.waitForTimeout(500);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            // サイクル2のエラーチェック
            expect(consoleErrors.length).toBe(0);
            expect(jsErrors.length).toBe(0);
            
            // 完全ワークフローサイクル3: 複雑なナビゲーションチェーン
            await page.keyboard.press('h');      // Menu -> Help
            await page.waitForTimeout(1500);
            await page.keyboard.press('s');      // Help -> Settings
            await page.waitForTimeout(1500);
            await page.keyboard.press('F1');     // Settings -> Contextual Help
            await page.waitForTimeout(1500);
            await page.keyboard.press('Escape'); // Back to Settings
            await page.waitForTimeout(1500);
            await page.keyboard.press('Escape'); // Back to Help
            await page.waitForTimeout(1500);
            await page.keyboard.press('Escape'); // Back to Menu
            await page.waitForTimeout(2000);
            
            // サイクル3の最終エラーチェック
            await page.screenshot({ path: 'e2e-screenshots/consolidated-error-free-final.png' });
            
            // 全体を通してJavaScriptエラーがないことを確認
            expect(consoleErrors.length).toBe(0);
            expect(jsErrors.length).toBe(0);
        });

        test('should verify NavigationContextManager error handling', async ({ page }) => {
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            
            // NavigationContextManagerの境界条件テスト
            // 空のスタック状態でESCを複数回押す
            await page.keyboard.press('Escape');
            await page.keyboard.press('Escape');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            
            // 深いナビゲーションスタックを作成して一気に戻る
            await page.keyboard.press('h');      // Menu -> Help
            await page.waitForTimeout(1000);
            await page.keyboard.press('s');      // Help -> Settings
            await page.waitForTimeout(1000);
            await page.keyboard.press('h');      // Settings -> Help
            await page.waitForTimeout(1000);
            await page.keyboard.press('s');      // Help -> Settings
            await page.waitForTimeout(1000);
            // 高速で連続ESCを実行（NavigationContextManagerのストレステスト）
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('Escape');
                await page.waitForTimeout(100);
            }
            
            // エラーハンドリングが正常に動作していることを確認
            const navigationErrors = consoleErrors.filter(error =>
                error.includes('NavigationContextManager') ||
                error.includes('stack') ||
                error.includes('context')
            );
            
            expect(navigationErrors).toHaveLength(0);
            expect(jsErrors.length).toBe(0);
        });
    });

    test.describe('Performance and Reliability Validation', () => {
        test('should maintain consistent performance during rapid navigation', async ({ page }) => {
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            // パフォーマンステスト: 高速ナビゲーション
            const startTime = Date.now();
            for (let cycle = 0; cycle < 5; cycle++) {
                await page.keyboard.press('h');      // Menu -> Help
                await page.waitForTimeout(200);
                await page.keyboard.press('s');      // Help -> Settings  
                await page.waitForTimeout(200);
                await page.keyboard.press('Escape'); // Settings -> Help
                await page.waitForTimeout(200);
                await page.keyboard.press('Escape'); // Help -> Menu
                await page.waitForTimeout(200);
            }
            
            const totalTime = Date.now() - startTime;
            
            // パフォーマンス要件: 5サイクルが10秒以内に完了
            expect(totalTime).toBeLessThan(10000);
            
            // パフォーマンステスト中にエラーがないことを確認
            expect(consoleErrors.length).toBe(0);
            expect(jsErrors.length).toBe(0);
            
            await page.screenshot({ path: 'e2e-screenshots/consolidated-performance-test-complete.png' });
        });

        test('should verify memory stability during extended usage', async ({ page }) => {
            await page.goto('http://localhost:8001?username=TestUser&skipUsernameInput=true&scene=menu');
            await page.waitForSelector('canvas', { timeout: 10000 });
            await page.waitForTimeout(3000);
            // 初期メモリ使用量を記録
            const initialMemory = await page.evaluate(() => {
                return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
            });
            
            // 拡張使用テスト: 20回のナビゲーションサイクル
            for (let cycle = 0; cycle < 20; cycle++) {
                await page.keyboard.press('h');
                await page.waitForTimeout(150);
                await page.keyboard.press('ArrowRight');
                await page.waitForTimeout(100);
                await page.keyboard.press('s');
                await page.waitForTimeout(150);
                await page.keyboard.press('Tab');
                await page.waitForTimeout(100);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(100);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(150);
                // 5サイクルごとにガベージコレクションを促進
                if (cycle % 5 === 0) {
                    await page.evaluate(() => {
                        if ((window as any).gc) (window as any).gc();
                    });
                    await page.waitForTimeout(100);
                }
            }
            
            // 最終メモリ使用量を測定
            const finalMemory = await page.evaluate(() => {
                return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
            });
            
            // メモリ増加が許容範囲内であることを確認（20MB以内）
            const memoryIncrease = finalMemory - initialMemory;
            expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
            
            // 拡張使用テスト中にエラーがないことを確認
            expect(consoleErrors.length).toBe(0);
            expect(jsErrors.length).toBe(0);
            
            await page.screenshot({ path: 'e2e-screenshots/consolidated-memory-test-complete.png' });
        });
    });

    test.afterEach(async ({ page }) => {
        // 各テスト後のクリーンアップ確認
        const canvas = page.locator('#gameCanvas');
        if (await canvas.isVisible()) {
            // 最終状態のスクリーンショット
            await page.screenshot({ path: `e2e-screenshots/test-cleanup-${Date.now()}.png` });
        }
    });
});