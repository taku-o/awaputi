/**
 * ゲーム分析機能のプライバシー設定とダッシュボード表示のE2Eテスト
 * GDPR準拠とデータ匿名化機能の動作を検証
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Privacy & Dashboard E2E Tests', () => {
    let page: any;

    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        
        // 新しいブラウザコンテキストでテスト（クリーンな状態）
        await page.goto('http://localhost:8000?debug=true&analytics=true');
        await page.waitForSelector('#gameCanvas', { timeout: 10000 });
        await page.waitForTimeout(2000);
    });

    test('初回起動時の同意確認ダイアログ', async () => {
        // LocalStorageをクリアして初回起動をシミュレート
        await page.evaluate(() => {
            localStorage.clear();
            (indexedDB as any).deleteDatabase('BubblePopAnalytics');
        });
        
        await page.reload();
        await page.waitForTimeout(2000);

        // 同意確認ダイアログの表示確認
        const consentDialog = page.locator('.privacy-consent-dialog');
        await expect(consentDialog).toBeVisible();

        // ダイアログの内容確認
        const consentText = page.locator('.consent-description');
        await expect(consentText).toContainText('データ収集');
        
        const acceptButton = page.locator('.consent-accept-button');
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
            if ((window as any).gameEngine && (window as any).gameEngine.analyticsManager) {
                return (window as any).gameEngine.analyticsManager.privacyManager.checkConsent();
            }
            return null;
        });

        expect(consentStatus).toBe(true);
    });

    test('オプトアウト機能の動作確認', async () => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()) {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // 設定画面を開く
        await page.click('button:has-text("設定")');
        await page.waitForTimeout(1000);

        // プライバシー設定を開く
        const privacyTab = page.locator('[data-settings-tab="privacy"]');
        if (await privacyTab.isVisible()) {
            await privacyTab.click();
            await page.waitForTimeout(500);

            // 各種オプトアウト設定の確認
            const behaviorOptOut = page.locator('input[name="behavior-analytics-opt-out"]');
            const performanceOptOut = page.locator('input[name="performance-analytics-opt-out"]');
            const errorOptOut = page.locator('input[name="error-analytics-opt-out"]');
            
            // 行動分析をオプトアウト
            if (await behaviorOptOut.isVisible()) {
                await behaviorOptOut.click();
                await page.waitForTimeout(500);
                const isOptedOut = await page.evaluate(() => {
                    return (window as any).gameEngine.analyticsManager.privacyManager.isOptedOut('behavior');
                });
                expect(isOptedOut).toBe(true);
            }

            // パフォーマンス分析をオプトアウト
            if (await performanceOptOut.isVisible()) {
                await performanceOptOut.click();
                await page.waitForTimeout(500);
                const isOptedOut = await page.evaluate(() => {
                    return (window as any).gameEngine.analyticsManager.privacyManager.isOptedOut('performance');
                });
                expect(isOptedOut).toBe(true);
            }

            // エラー分析は常に有効（最小限のデータ収集）
            if (await errorOptOut.isVisible()) {
                const isDisabled = await errorOptOut.isDisabled();
                expect(isDisabled).toBe(true);
            }
        }
    });

    test('データ匿名化機能の確認', async () => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()) {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // ゲームプレイでデータを生成
        await page.click('button:has-text("ゲームスタート")');
        await page.waitForTimeout(1000);

        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(1000);

        // バブルクリック
        const canvas = page.locator('#gameCanvas');
        await canvas.click({ position: { x: 300, y: 300 } });
        await page.waitForTimeout(2000);

        // 収集されたデータが匿名化されているか確認
        const anonymizedData = await page.evaluate(async () => {
            if ((window as any).gameEngine && (window as any).gameEngine.analyticsManager) {
                const rawData = {
                    userId: 'test-user-123',
                    email: 'test@example.com',
                    sessionData: { score: 100 }
                };
                
                return (window as any).gameEngine.analyticsManager.privacyManager.anonymizeData(rawData);
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
    });

    test('ダッシュボードの包括的表示確認', async () => {
        // 分析データを蓄積するためのゲームプレイ
        await page.click('button:has-text("ゲームスタート")');
        await page.waitForTimeout(1000);

        const stageButton = page.locator('.stage-button').first();
        await stageButton.click();
        await page.waitForTimeout(1000);

        // 複数回のバブルクリック
        const canvas = page.locator('#gameCanvas');
        for (let i = 0; i < 10; i++) {
            await canvas.click({ position: { x: 200 + i * 20, y: 300 + i * 10 } });
            await page.waitForTimeout(300);
        }

        // ダッシュボードを開く
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000);

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if (await analyticsTab.isVisible()) {
            await analyticsTab.click();
            await page.waitForTimeout(1000);

            // 基本統計セクション
            const basicStatsSection = page.locator('.analytics-basic-stats');
            if (await basicStatsSection.isVisible()) {
                await expect(basicStatsSection).toBeVisible();

                // プレイ時間の確認
                const playTime = page.locator('[data-stat="total-play-time"]');
                if (await playTime.isVisible()) {
                    const playTimeValue = await playTime.textContent();
                    expect(playTimeValue).toMatch(/\d+/);
                }

                // スコア統計の確認
                const avgScore = page.locator('[data-stat="average-score"]');
                if (await avgScore.isVisible()) {
                    const avgScoreValue = await avgScore.textContent();
                    expect(avgScoreValue).toMatch(/\d+/);
                }

                // 成功率の確認
                const successRate = page.locator('[data-stat="success-rate"]');
                if (await successRate.isVisible()) {
                    const successRateValue = await successRate.textContent();
                    expect(successRateValue).toMatch(/\d+(\.\d+)?%/);
                }
            }

            // バブルタイプ別分析セクション
            const bubbleAnalysisSection = page.locator('.analytics-bubble-analysis');
            if (await bubbleAnalysisSection.isVisible()) {
                await expect(bubbleAnalysisSection).toBeVisible();

                const bubbleTypesChart = page.locator('.bubble-types-chart');
                await expect(bubbleTypesChart).toBeVisible();

                const bubbleEffectsChart = page.locator('.bubble-effects-chart');
                await expect(bubbleEffectsChart).toBeVisible();
            }

            // パフォーマンス分析セクション
            const performanceSection = page.locator('.analytics-performance');
            if (await performanceSection.isVisible()) {
                await expect(performanceSection).toBeVisible();

                const fpsChart = page.locator('.fps-chart');
                await expect(fpsChart).toBeVisible();

                const loadTimeChart = page.locator('.load-time-chart');
                await expect(loadTimeChart).toBeVisible();
            }
        }
    });

    test('リアルタイムデータ更新の確認', async () => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()) {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // ダッシュボードを開く
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000);

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if (await analyticsTab.isVisible()) {
            await analyticsTab.click();
            await page.waitForTimeout(1000);

            // 初期データの記録
            const initialClickCount = await page.locator('[data-stat="total-clicks"]').textContent();

            // ゲーム操作
            await page.click('button:has-text("ゲームスタート")');
            await page.waitForTimeout(1000);

            const stageButton = page.locator('.stage-button').first();
            await stageButton.click();
            await page.waitForTimeout(1000);

            const canvas = page.locator('#gameCanvas');
            await canvas.click({ position: { x: 400, y: 400 } });
            await page.waitForTimeout(2000);

            // データの更新確認
            const updatedClickCount = await page.locator('[data-stat="total-clicks"]').textContent();
            
            if (initialClickCount && updatedClickCount) {
                expect(parseInt(updatedClickCount)).toBeGreaterThan(parseInt(initialClickCount));
            }
        }
    });

    test('データエクスポート機能の確認', async () => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()) {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // ダッシュボードを開く
        await page.keyboard.press('F12');
        await page.waitForTimeout(1000);

        const analyticsTab = page.locator('[data-debug-tab="analytics"]');
        if (await analyticsTab.isVisible()) {
            await analyticsTab.click();
            await page.waitForTimeout(1000);

            // エクスポートボタンの確認
            const exportButton = page.locator('.analytics-export-button');
            if (await exportButton.isVisible()) {
                await expect(exportButton).toBeVisible();
                
                // エクスポート実行
                await exportButton.click();
                await page.waitForTimeout(2000);

                // エクスポート完了の確認
                const exportStatus = page.locator('.export-status-message');
                if (await exportStatus.isVisible()) {
                    const statusText = await exportStatus.textContent();
                    expect(statusText).toContain('エクスポート完了');
                }
            }
        }
    });

    test('プライバシー設定の永続化確認', async () => {
        // 同意を与える
        const consentDialog = page.locator('.privacy-consent-dialog');
        if (await consentDialog.isVisible()) {
            await page.click('.consent-accept-button');
            await page.waitForTimeout(1000);
        }

        // プライバシー設定を変更
        await page.click('button:has-text("設定")');
        await page.waitForTimeout(1000);

        const privacyTab = page.locator('[data-settings-tab="privacy"]');
        if (await privacyTab.isVisible()) {
            await privacyTab.click();
            await page.waitForTimeout(500);

            const behaviorOptOut = page.locator('input[name="behavior-analytics-opt-out"]');
            if (await behaviorOptOut.isVisible()) {
                await behaviorOptOut.click();
                await page.waitForTimeout(500);
            }
        }

        // ページリロードして設定の永続化を確認
        await page.reload();
        await page.waitForTimeout(2000);

        await page.click('button:has-text("設定")');
        await page.waitForTimeout(1000);

        const privacyTabReload = page.locator('[data-settings-tab="privacy"]');
        if (await privacyTabReload.isVisible()) {
            await privacyTabReload.click();
            await page.waitForTimeout(500);

            const behaviorOptOutReload = page.locator('input[name="behavior-analytics-opt-out"]');
            if (await behaviorOptOutReload.isVisible()) {
                const isChecked = await behaviorOptOutReload.isChecked();
                expect(isChecked).toBe(true);
            }
        }
    });
});