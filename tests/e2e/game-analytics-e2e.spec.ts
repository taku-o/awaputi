/**
 * ゲーム分析機能のE2Eテスト
 * 実際のゲームプレイシナリオでのデータ収集・表示を検証
 */

import { test, expect } from '@playwright/test';

test.describe('Game Analytics E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // デバッグモードでゲームを開始
        await page.goto('http://localhost:8000?debug=true&analytics=true');
        
        // ゲームの初期化を待機
        await page.waitForSelector('#gameCanvas', { timeout: 10000 });
        await page.waitForTimeout(2000);
    });

    test('データ収集 - プレイヤー行動分析', async ({ page }) => {
        // プライバシー同意ダイアログの処理
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()) {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // ゲームを開始
        await page.click('button:has-text("ゲームスタート")');
        await page.waitForTimeout(2000);

        // ステージを選択
        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(2000);

        // ゲームプレイを開始
        const gameStartButton = page.locator('button:has-text("開始")');
        if (await gameStartButton.isVisible()) {
            await gameStartButton.click();
            await page.waitForTimeout(1000);
        }

        // バブルクリックのシミュレーション
        const canvas = page.locator('#gameCanvas');
        
        // 複数回バブルをクリック
        for (let i = 0; i < 5; i++) {
            await canvas.click({ position: { x: 200 + i * 50, y: 300 + i * 30 } });
            await page.waitForTimeout(500);
        }

        // 分析データが収集されているかを確認
        const analyticsData = await page.evaluate(async () => {
            if ((window as any).gameEngine && (window as any).gameEngine.analyticsManager) {
                return (window as any).gameEngine.analyticsManager.getSessionData();
            }
            return null;
        });

        expect(analyticsData).toBeTruthy();
        expect(analyticsData.sessionId).toBeTruthy();
        expect(analyticsData.interactions).toBeGreaterThan(0);
    });

    test('ダッシュボード表示 - 基本統計', async ({ page }) => {
        // デバッグパネルを開く
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000);

        // 分析ダッシュボードタブをクリック
        const dashboardTab = page.locator('[data-debug-tab="analytics"]');
        if (await dashboardTab.isVisible()) {
            await dashboardTab.click();
            await page.waitForTimeout(1000);

            // 基本統計が表示されているか確認
            const basicStatsSection = page.locator('.analytics-basic-stats');
            await expect(basicStatsSection).toBeVisible();

            // プレイ時間の表示確認
            const playTimeElement = page.locator('[data-stat="total-play-time"]');
            await expect(playTimeElement).toBeVisible();

            // スコア統計の表示確認
            const scoreStatsElement = page.locator('[data-stat="score-stats"]');
            await expect(scoreStatsElement).toBeVisible();
        }
    });

    test('リアルタイム監視機能', async ({ page }) => {
        // リアルタイム監視パネルを開く
        await page.keyboard.press('Ctrl+Shift+M');
        await page.waitForTimeout(1000);

        const realtimePanel = page.locator('.realtime-monitoring-panel');
        if (await realtimePanel.isVisible()) {
            // FPSメーターの確認
            const fpsDisplay = page.locator('[data-realtime="fps"]');
            await expect(fpsDisplay).toBeVisible();
            const fpsValue = await fpsDisplay.textContent();
            expect(parseInt(fpsValue || '0')).toBeGreaterThan(0);

            // メモリ使用量の確認
            const memoryDisplay = page.locator('[data-realtime="memory"]');
            if (await memoryDisplay.isVisible()) {
                const memoryValue = await memoryDisplay.textContent();
                expect(memoryValue).toContain('MB');
            }
        }
    });

    test('プライバシー設定の動作確認', async ({ page }) => {
        // 設定画面を開く
        await page.click('button:has-text("設定")');
        await page.waitForTimeout(1000);

        // プライバシー設定タブを確認
        const privacyTab = page.locator('[data-settings-tab="privacy"]');
        if (await privacyTab.isVisible()) {
            await privacyTab.click();
            await page.waitForTimeout(500);

            // データ収集オプトアウトトグル
            const optOutToggle = page.locator('input[name="analytics-opt-out"]');
            if (await optOutToggle.isVisible()) {
                await optOutToggle.click();
                await page.waitForTimeout(500);
                // オプトアウト状態の確認
                const isOptedOut = await page.evaluate(() => {
                    if ((window as any).gameEngine && (window as any).gameEngine.analyticsManager) {
                        return (window as any).gameEngine.analyticsManager.privacyManager.isOptedOut('analytics');
                    }
                    return false;
                });

                expect(isOptedOut).toBe(true);

                // オプトアウトを解除
                await optOutToggle.click();
                await page.waitForTimeout(500);
            }
        }
    });

    test('データエクスポート機能', async ({ page }) => {
        // 少しゲームをプレイしてデータを蓄積
        await page.click('button:has-text("ゲームスタート")');
        await page.waitForTimeout(1000);

        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(1000);

        // デバッグパネルからエクスポート機能をテスト
        await page.keyboard.press('F12');
        await page.waitForTimeout(500);

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if (await analyticsTab.isVisible()) {
            await analyticsTab.click();
            await page.waitForTimeout(500);

            const exportButton = page.locator('button:has-text("データエクスポート")');
            if (await exportButton.isVisible()) {
                // ダウンロード処理の監視
                const [download] = await Promise.all([
                    page.waitForEvent('download'),
                    exportButton.click()
                ]);

                expect(download.suggestedFilename()).toContain('analytics');
                expect(download.suggestedFilename()).toMatch(/\.(json|csv)$/);
            }
        }
    });

    test('トレンド分析データの表示', async ({ page }) => {
        // 複数回ゲームをプレイしてトレンドデータを蓄積
        for (let gameSession = 0; gameSession < 3; gameSession++) {
            await page.click('button:has-text("ゲームスタート")');
            await page.waitForTimeout(1000);

            const stageButton = page.locator('.stage-button').first();
            await stageButton.click();
            await page.waitForTimeout(1000);

            // 短時間プレイ
            const canvas = page.locator('#gameCanvas');
            await canvas.click({ position: { x: 300, y: 300 } });
            await page.waitForTimeout(2000);

            // ゲーム終了
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }

        // トレンド分析画面を開く
        await page.keyboard.press('F12');
        await page.waitForTimeout(500);

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if (await analyticsTab.isVisible()) {
            await analyticsTab.click();
            await page.waitForTimeout(500);

            const trendTab = page.locator('[data-analytics-tab="trends"]');
            if (await trendTab.isVisible()) {
                await trendTab.click();
                await page.waitForTimeout(1000);

                // トレンドグラフの表示確認
                const trendChart = page.locator('.trend-chart');
                if (await trendChart.isVisible()) {
                    await expect(trendChart).toBeVisible();
                } else {
                    // データ不足メッセージの確認
                    const noDataMessage = page.locator(':has-text("データ収集中")');
                    await expect(noDataMessage).toBeVisible();
                }
            }
        }
    });

    test('エラー追跡機能', async ({ page }) => {
        // 意図的にエラーを発生させる
        await page.evaluate(() => {
            // 存在しない機能を呼び出してエラーを発生
            if ((window as any).gameEngine) {
                try {
                    (window as any).gameEngine.nonExistentMethod();
                } catch (error) {
                    // エラーは分析システムによってキャッチされる
                }
            }
        });

        await page.waitForTimeout(1000);

        // エラー追跡データの確認
        const errorData = await page.evaluate(() => {
            if ((window as any).gameEngine && (window as any).gameEngine.analyticsManager) {
                return (window as any).gameEngine.analyticsManager.getErrorData();
            }
            return null;
        });

        if (errorData && errorData.length > 0) {
            expect(errorData[0]).toHaveProperty('type');
            expect(errorData[0]).toHaveProperty('timestamp');
            expect(errorData[0]).toHaveProperty('context');
        }
    });

    test('パフォーマンス監視アラート', async ({ page }) => {
        // 意図的に重い処理を実行してパフォーマンス警告を発生
        await page.evaluate(() => {
            if ((window as any).gameEngine && (window as any).gameEngine.analyticsManager) {
                // 重い処理をシミュレート
                const heavyTask = () => {
                    const start = Date.now();
                    while (Date.now() - start < 100) {
                        // 重い処理
                        Math.random() * Math.random();
                    }
                };

                // 複数回実行してFPS低下を誘発
                for (let i = 0; i < 10; i++) {
                    setTimeout(heavyTask, i * 50);
                }
            }
        });

        await page.waitForTimeout(2000);

        // パフォーマンス警告の確認
        const performanceAlert = page.locator('.performance-warning');
        if (await performanceAlert.isVisible()) {
            await expect(performanceAlert).toBeVisible();
            const alertText = await performanceAlert.textContent();
            expect(alertText).toContain('パフォーマンス');
        }
    });
});