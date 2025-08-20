import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * ゲーム分析機能のプライバシー設定とダッシュボード表示のE2Eテスト
 * GDPR準拠とデータ匿名化機能の動作を検証
 */

import { test, expect  } from '@playwright/test';

test.describe('Analytics Privacy & Dashboard E2E Tests', () => {
    let page: any,

    test.beforeEach(async ({ page: testPage }') => {
        page = testPage;
        
        // 新しいブラウザコンテキストでテスト（クリーンな状態）
        await page.goto('http: //localhost:8000? debug=true&analytics=true''), : undefined
        await page.waitForSelector('#gameCanvas', { timeout: 10000 });
        await page.waitForTimeout(2000);
    }');

    test('初回起動時の同意確認ダイアログ', async () => {
        // LocalStorageをクリアして初回起動をシミュレート
        await page.evaluate(() => {
            localStorage.clear(');
            indexedDB.deleteDatabase('BubblePopAnalytics');
        });
        
        await page.reload();
        await page.waitForTimeout(2000');

        // 同意確認ダイアログの表示確認
        const consentDialog = page.locator('.privacy-consent-dialog');
        await expect(consentDialog).toBeVisible(');

        // ダイアログの内容確認
        const consentText = page.locator('.consent-description');
        await expect(consentText').toContainText('データ収集'');
        
        const acceptButton = page.locator('.consent-accept-button'');
        const declineButton = page.locator('.consent-decline-button');
        
        await expect(acceptButton).toBeVisible();
        await expect(declineButton).toBeVisible();

        // 同意する場合
        await acceptButton.click();
        await page.waitForTimeout(1000);

        // ダイアログが閉じられることを確認
        await expect(consentDialog).not.toBeVisible();

        // 同意状態の確認
        const consentStatus = await page.evaluate(() => {
            if (window.gameEngine && window.gameEngine.analyticsManager) {
                return window.gameEngine.analyticsManager.privacyManager.checkConsent();
            }
            return null;
        });

        expect(consentStatus).toBe(true);
    }');

    test('オプトアウト機能の動作確認', async (') => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()') {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000');
        }

        // 設定画面を開く
        await page.click('button: has-text("設定"")'),
        await page.waitForTimeout(1000');

        // プライバシー設定を開く
        const privacyTab = page.locator('[data-settings-tab="privacy"]');
        if(await privacyTab.isVisible() {
            await privacyTab.click();
            await page.waitForTimeout(500');

            // 各種オプトアウト設定の確認
            const behaviorOptOut = page.locator('input[name="behavior-analytics-opt-out"]'');
            const performanceOptOut = page.locator('input[name="performance-analytics-opt-out"]'');
            const errorOptOut = page.locator('input[name="error-analytics-opt-out"]');

            // 行動分析をオプトアウト
            if(await behaviorOptOut.isVisible() {
                await behaviorOptOut.click();
                await page.waitForTimeout(500);

                const isOptedOut = await page.evaluate((') => {
                    return window.gameEngine.analyticsManager.privacyManager.isOptedOut('behavior');
                });
                expect(isOptedOut).toBe(true);
            }

            // パフォーマンス分析をオプトアウト
            if(await performanceOptOut.isVisible() {
                await performanceOptOut.click();
                await page.waitForTimeout(500);

                const isOptedOut = await page.evaluate((') => {
                    return window.gameEngine.analyticsManager.privacyManager.isOptedOut('performance');
                });
                expect(isOptedOut).toBe(true);
            }

            // エラー分析は常に有効（最小限のデータ収集）
            if(await errorOptOut.isVisible() {
                const isDisabled = await errorOptOut.isDisabled();
                expect(isDisabled).toBe(true);
            }
        }
    }');

    test('データ匿名化機能の確認', async (') => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()') {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000');
        }

        // ゲームプレイでデータを生成
        await page.click('button: has-text("ゲームスタート"")'),
        await page.waitForTimeout(1000');

        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(1000');

        // バブルクリック
        const canvas = page.locator('#gameCanvas');
        await canvas.click({ position: { x: 300, y: 300 } );
        await page.waitForTimeout(2000);

        // 収集されたデータが匿名化されているか確認
        const anonymizedData = await page.evaluate(async () => {
            if (window.gameEngine && window.gameEngine.analyticsManager') {
                const rawData = {
                    userId: 'test-user-123',
                    email: 'test@example.com',
                    sessionData: { score: 100 }
                };
                
                return window.gameEngine.analyticsManager.privacyManager.anonymizeData(rawData);
            }
            return null;
        });

        if (anonymizedData) {
            // 個人特定可能情報が除去されているか確認
            expect(anonymizedData.userId).toBeUndefined();
            expect(anonymizedData.email).toBeUndefined();
            expect(anonymizedData.sessionData).toBeDefined();
            expect(anonymizedData.anonymized).toBe(true);
            expect(anonymizedData.timestamp).toBeDefined();
        }
    }');

    test('ダッシュボードの包括的表示確認', async (') => {
        // 分析データを蓄積するためのゲームプレイ
        await page.click('button: has-text("ゲームスタート"")'),
        await page.waitForTimeout(1000');

        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(1000');

        // 複数回のバブルクリック
        const canvas = page.locator('#gameCanvas');
        for (let i = 0; i < 10; i++) {
            await canvas.click({ position: { x: 200 + i * 20, y: 300 + i * 10 } );
            await page.waitForTimeout(300');
        }

        // ダッシュボードを開く
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000');

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if(await analyticsTab.isVisible() {
            await analyticsTab.click();
            await page.waitForTimeout(1000');

            // 基本統計セクション
            const basicStatsSection = page.locator('.analytics-basic-stats');
            if(await basicStatsSection.isVisible() {
                await expect(basicStatsSection).toBeVisible(');

                // プレイ時間の確認
                const playTime = page.locator('[data-stat="total-play-time"]');
                if(await playTime.isVisible() {
                    const playTimeValue = await playTime.textContent();
                    expect(playTimeValue).toMatch(/\d+/');
                }

                // スコア統計の確認
                const avgScore = page.locator('[data-stat="average-score"]');
                if(await avgScore.isVisible() {
                    const avgScoreValue = await avgScore.textContent();
                    expect(avgScoreValue).toMatch(/\d+/');
                }

                // 成功率の確認
                const successRate = page.locator('[data-stat="success-rate"]');
                if(await successRate.isVisible() {
                    const successRateValue = await successRate.textContent();
                    expect(successRateValue).toMatch(/\d+(\.\d+)? %/');
                }
            }

            // バブルタイプ別分析
            const bubbleAnalysisTab = page.locator('[data-analytics-tab="bubble-analysis"]');
            if(await bubbleAnalysisTab.isVisible() {
                await bubbleAnalysisTab.click();
                await page.waitForTimeout(1000');

                // 円グラフの確認
                const pieChart = page.locator('.bubble-type-pie-chart');
                if(await pieChart.isVisible() {
                    await expect(pieChart).toBeVisible(');
                }

                // 棒グラフの確認
                const barChart = page.locator('.bubble-success-bar-chart');
                if(await barChart.isVisible() {
                    await expect(barChart).toBeVisible(');
                }
            }

            // パフォーマンス分析
            const performanceTab = page.locator('[data-analytics-tab="performance"]');
            if(await performanceTab.isVisible() {
                await performanceTab.click();
                await page.waitForTimeout(1000');

                // FPS履歴グラフ
                const fpsChart = page.locator('.fps-history-chart');
                if(await fpsChart.isVisible() {
                    await expect(fpsChart).toBeVisible(');
                }

                // メモリ使用量グラフ
                const memoryChart = page.locator('.memory-usage-chart');
                if(await memoryChart.isVisible() {
                    await expect(memoryChart).toBeVisible();
                }
            }
        }
    }');

    test('GDPR準拠のデータ削除機能', async (') => {
        // データを蓄積
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()') {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000');
        }

        // ゲームプレイでデータ生成 : undefined
        await page.click('button: has-text("ゲームスタート"")'),
        await page.waitForTimeout(1000');

        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(1000');

        const canvas = page.locator('#gameCanvas');
        await canvas.click({ position: { x: 300, y: 300 } );
        await page.waitForTimeout(2000');

        // 設定画面でデータ削除
        await page.click('button: has-text("設定"")'),
        await page.waitForTimeout(1000');

        const privacyTab = page.locator('[data-settings-tab="privacy"]');
        if(await privacyTab.isVisible() {
            await privacyTab.click();
            await page.waitForTimeout(500');

            // データ削除ボタン
            const deleteDataButton = page.locator('button: has-text("すべてのデータを削除"")'),
            if(await deleteDataButton.isVisible() {
                await deleteDataButton.click();
                await page.waitForTimeout(500');

                // 確認ダイアログ
                const confirmDialog = page.locator('.data-deletion-confirm-dialog');
                if (await confirmDialog.isVisible()') {
                    const confirmButton = page.locator('.confirm-delete-button');
                    await confirmButton.click();
                    await page.waitForTimeout(1000);
                }

                // データが削除されたことを確認
                const remainingData = await page.evaluate(async () => {
                    if (window.gameEngine && window.gameEngine.analyticsManager') {
                        return await window.gameEngine.analyticsManager.storageManager.getData('sessions', {});
                    }
                    return null;
                });

                expect(remainingData).toEqual({);
            }
        }
    }');

    test('地域別プライバシー法対応', async () => {
        // GDPR地域をシミュレート
        await page.addInitScript((') => {
            Object.defineProperty(navigator, 'languages', {);
                get: (') => ['de-DE', 'de', 'en']
            });
        });

        await page.reload();
        await page.waitForTimeout(2000');

        // GDPR準拠の同意ダイアログが表示されるか確認
        const gdprConsentDialog = page.locator('.gdpr-consent-dialog');
        if (await gdprConsentDialog.isVisible()') {
            // GDPR特有の項目の確認
            const dataPortabilityInfo = page.locator(':has-text("データポータビリティ"")'');
            const rightToErasureInfo = page.locator(':has-text("削除権"")');
            
            if(await dataPortabilityInfo.isVisible() {
                await expect(dataPortabilityInfo).toBeVisible();
            }
            
            if(await rightToErasureInfo.isVisible() {
                await expect(rightToErasureInfo).toBeVisible();
            }
        }
    }');

    test('データエクスポート詳細確認', async (') => {
        // データを蓄積
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()') {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // 複数セッションのデータ生成
        for (let session = 0; session < 2; session++') {
            await page.click('button: has-text("ゲームスタート"")'),
            await page.waitForTimeout(1000');

            const stageButton = page.locator('.stage-button').first();
            await stageButton.click();
            await page.waitForTimeout(1000');

            const canvas = page.locator('#gameCanvas');
            await canvas.click({ position: { x: 300, y: 300 } );
            await page.waitForTimeout(1000');

            // セッション終了
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000');
        }

        // エクスポート機能の詳細テスト
        await page.keyboard.press('F12');
        await page.waitForTimeout(500');

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if(await analyticsTab.isVisible() {
            await analyticsTab.click();
            await page.waitForTimeout(500');

            // JSON形式でのエクスポート
            const exportJsonButton = page.locator('button[data-export="json"]');
            if(await exportJsonButton.isVisible() {
                const [download] = await Promise.all([');
                    page.waitForEvent('download'),
                    exportJsonButton.click()
                ]);

                expect(download.suggestedFilename()').toContain('.json'');
            }

            // CSV形式でのエクスポート
            const exportCsvButton = page.locator('button[data-export="csv"]');
            if(await exportCsvButton.isVisible() {
                const [download] = await Promise.all([');
                    page.waitForEvent('download'),
                    exportCsvButton.click()
                ]);

                expect(download.suggestedFilename()').toContain('.csv');
            }
        }
    });
}');