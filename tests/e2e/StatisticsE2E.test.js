/**
 * 統計機能E2E（End-to-End）テスト
 * Playwrightを使用した統計データ収集・表示・エクスポート・インポートの全フローテスト
 * レスポンシブ表示とアクセシビリティ機能のE2Eテスト
 */

import { test, expect } from '@playwright/test';

// テスト設定
const TEST_CONFIG = {
    baseURL: 'http://localhost:8000',
    timeout: 30000,
    screenshots: true,
    video: 'retain-on-failure'
};

// テスト用のゲームプレイシミュレーション関数
const GameplaySimulator = {
    /**
     * 基本的なゲームプレイをシミュレーション
     */
    async simulateBasicGameplay(page, duration = 30000) {
        // ゲーム開始
        await page.click('[data-testid="start-game-button"]');
        await page.waitForSelector('[data-testid="game-canvas"]');

        const canvas = page.locator('[data-testid="game-canvas"]');
        const startTime = Date.now();

        // 指定時間内でバブルをクリック
        while (Date.now() - startTime < duration) {
            // バブルが存在する場合はクリック
            const bubbles = page.locator('.bubble');
            const bubbleCount = await bubbles.count();
            
            if (bubbleCount > 0) {
                const randomIndex = Math.floor(Math.random() * bubbleCount);
                await bubbles.nth(randomIndex).click();
            }

            await page.waitForTimeout(100); // 100ms待機
        }

        // ゲーム終了
        await page.keyboard.press('Escape');
        await page.waitForSelector('[data-testid="game-over-screen"]');
    },

    /**
     * 高スコアゲームプレイをシミュレーション
     */
    async simulateHighScoreGameplay(page) {
        await page.click('[data-testid="start-game-button"]');
        await page.waitForSelector('[data-testid="game-canvas"]');

        // より集中的なプレイ（高精度、高コンボ）
        for (let i = 0; i < 50; i++) {
            const specialBubbles = page.locator('.bubble.rainbow, .bubble.golden');
            const normalBubbles = page.locator('.bubble.normal');

            // 特殊バブルを優先的にクリック
            const specialCount = await specialBubbles.count();
            if (specialCount > 0) {
                await specialBubbles.first().click();
            } else {
                const normalCount = await normalBubbles.count();
                if (normalCount > 0) {
                    await normalBubbles.first().click();
                }
            }

            await page.waitForTimeout(50); // 高速プレイ
        }

        await page.keyboard.press('Escape');
        await page.waitForSelector('[data-testid="game-over-screen"]');
    },

    /**
     * 複数ゲームセッションをシミュレーション
     */
    async simulateMultipleSessions(page, sessionCount = 3) {
        for (let i = 0; i < sessionCount; i++) {
            await this.simulateBasicGameplay(page, 15000);
            
            // セッション間の休憩
            await page.waitForTimeout(2000);
            
            // 次のゲームを開始
            if (i < sessionCount - 1) {
                await page.click('[data-testid="play-again-button"]');
            }
        }
    }
};

// アクセシビリティテスト用ヘルパー
const AccessibilityHelper = {
    /**
     * キーボードナビゲーションをテスト
     */
    async testKeyboardNavigation(page) {
        // Tabキーでのナビゲーション
        await page.keyboard.press('Tab');
        const firstFocusable = await page.locator(':focus');
        await expect(firstFocusable).toBeVisible();

        // 矢印キーでのナビゲーション
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowRight');
        
        // Enterキーでの選択
        await page.keyboard.press('Enter');
    },

    /**
     * スクリーンリーダー対応をテスト
     */
    async testScreenReaderSupport(page) {
        // ARIA属性の確認
        const statisticsSection = page.locator('[role="main"]');
        await expect(statisticsSection).toHaveAttribute('aria-label');

        // ライブリージョンの確認
        const liveRegion = page.locator('[aria-live="polite"]');
        await expect(liveRegion).toBeVisible();

        // 見出し構造の確認
        const headings = page.locator('h1, h2, h3, h4, h5, h6');
        const headingCount = await headings.count();
        expect(headingCount).toBeGreaterThan(0);
    },

    /**
     * 高コントラストモードをテスト
     */
    async testHighContrastMode(page) {
        // 高コントラストモードを有効化
        await page.keyboard.press('Control+Shift+H');
        
        // 高コントラストスタイルが適用されることを確認
        const body = page.locator('body');
        await expect(body).toHaveClass(/high-contrast/);

        // テキストのコントラスト比を確認（簡易チェック）
        const textElement = page.locator('.statistics-text').first();
        const styles = await textElement.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                color: computed.color,
                backgroundColor: computed.backgroundColor
            };
        });

        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
    }
};

// レスポンシブテスト用ヘルパー
const ResponsiveHelper = {
    viewports: {
        mobile: { width: 375, height: 667 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1200, height: 800 },
        large: { width: 1920, height: 1080 }
    },

    /**
     * 各ビューポートでレスポンシブ表示をテスト
     */
    async testResponsiveDisplay(page, testFunc) {
        for (const [device, viewport] of Object.entries(this.viewports)) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(500); // レイアウト調整を待機

            console.log(`Testing on ${device} (${viewport.width}x${viewport.height})`);
            await testFunc(page, device);
        }
    }
};

test.describe('統計機能E2Eテスト', () => {
    test.beforeEach(async ({ page }) => {
        // テスト開始前の初期化
        await page.goto(TEST_CONFIG.baseURL);
        await page.waitForLoadState('networkidle');
        
        // LocalStorageをクリア
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test.describe('基本的な統計データ収集フロー', () => {
        test('ゲームプレイから統計表示までの完全フロー', async ({ page }) => {
            // 1. ゲームプレイ
            await GameplaySimulator.simulateBasicGameplay(page);
            
            // 2. 統計画面に移動
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            // 3. 統計データが表示されることを確認
            const gameStats = page.locator('[data-testid="game-play-stats"]');
            await expect(gameStats).toBeVisible();
            
            const totalGames = page.locator('[data-testid="total-games"]');
            await expect(totalGames).toContainText('1');
            
            const totalScore = page.locator('[data-testid="total-score"]');
            await expect(totalScore).not.toContainText('0');
            
            // 4. グラフが表示されることを確認
            const chartCanvas = page.locator('[data-testid="statistics-chart"]');
            await expect(chartCanvas).toBeVisible();
        });

        test('複数ゲームセッションの統計蓄積', async ({ page }) => {
            // 3回のゲームセッションを実行
            await GameplaySimulator.simulateMultipleSessions(page, 3);
            
            // 統計画面で結果確認
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            const totalGames = page.locator('[data-testid="total-games"]');
            await expect(totalGames).toContainText('3');
            
            // 平均統計が計算されていることを確認
            const averageScore = page.locator('[data-testid="average-score"]');
            await expect(averageScore).not.toContainText('0');
            
            const averageSessionTime = page.locator('[data-testid="average-session-time"]');
            await expect(averageSessionTime).toBeVisible();
        });

        test('リアルタイム統計更新', async ({ page }) => {
            // 統計画面を開いておく
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            // 初期値を記録
            const initialGames = await page.locator('[data-testid="total-games"]').textContent();
            
            // 新しいゲームをプレイ
            await page.click('[data-testid="back-to-menu-button"]');
            await GameplaySimulator.simulateBasicGameplay(page);
            
            // 統計画面に戻る
            await page.click('[data-testid="user-info-button"]');
            
            // 統計が更新されていることを確認
            const updatedGames = await page.locator('[data-testid="total-games"]').textContent();
            expect(parseInt(updatedGames)).toBeGreaterThan(parseInt(initialGames));
        });
    });

    test.describe('統計データ表示と可視化', () => {
        test('各種統計チャートの表示', async ({ page }) => {
            // テストデータの準備
            await GameplaySimulator.simulateHighScoreGameplay(page);
            
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            // 棒グラフの確認
            await page.click('[data-testid="bar-chart-tab"]');
            const barChart = page.locator('[data-testid="bar-chart-canvas"]');
            await expect(barChart).toBeVisible();
            
            // 線グラフの確認
            await page.click('[data-testid="line-chart-tab"]');
            const lineChart = page.locator('[data-testid="line-chart-canvas"]');
            await expect(lineChart).toBeVisible();
            
            // 円グラフの確認
            await page.click('[data-testid="pie-chart-tab"]');
            const pieChart = page.locator('[data-testid="pie-chart-canvas"]');
            await expect(pieChart).toBeVisible();
        });

        test('期間フィルター機能', async ({ page }) => {
            // 複数セッションでデータを蓄積
            await GameplaySimulator.simulateMultipleSessions(page, 5);
            
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            // 期間フィルターの選択
            const filterSelect = page.locator('[data-testid="period-filter"]');
            
            // 今日のデータ
            await filterSelect.selectOption('today');
            await page.waitForSelector('[data-testid="filtered-stats"]');
            
            // 今週のデータ
            await filterSelect.selectOption('thisWeek');
            await page.waitForTimeout(1000);
            
            // 全期間のデータ
            await filterSelect.selectOption('allTime');
            await page.waitForTimeout(1000);
            
            // フィルター適用後もチャートが表示されることを確認
            const chart = page.locator('[data-testid="statistics-chart"]');
            await expect(chart).toBeVisible();
        });

        test('統計詳細表示の切り替え', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            // サマリー表示
            await page.click('[data-testid="summary-view-button"]');
            const summarySection = page.locator('[data-testid="summary-section"]');
            await expect(summarySection).toBeVisible();
            
            // 詳細表示
            await page.click('[data-testid="detailed-view-button"]');
            const detailedSection = page.locator('[data-testid="detailed-section"]');
            await expect(detailedSection).toBeVisible();
            
            // トレンド表示
            await page.click('[data-testid="trend-view-button"]');
            const trendSection = page.locator('[data-testid="trend-section"]');
            await expect(trendSection).toBeVisible();
        });
    });

    test.describe('データエクスポート・インポート機能', () => {
        test('JSON形式でのエクスポート・インポート', async ({ page }) => {
            // テストデータの作成
            await GameplaySimulator.simulateMultipleSessions(page, 3);
            
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            // エクスポート機能のテスト
            await page.click('[data-testid="export-button"]');
            await page.waitForSelector('[data-testid="export-dialog"]');
            
            await page.selectOption('[data-testid="export-format"]', 'json');
            
            // ダウンロードの開始
            const downloadPromise = page.waitForEvent('download');
            await page.click('[data-testid="download-button"]');
            const download = await downloadPromise;
            
            expect(download.suggestedFilename()).toContain('.json');
            
            // ダウンロードされたファイルの内容確認
            const downloadPath = await download.path();
            expect(downloadPath).toBeTruthy();
        });

        test('CSV形式でのエクスポート', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            
            await page.click('[data-testid="user-info-button"]');
            await page.click('[data-testid="export-button"]');
            
            await page.selectOption('[data-testid="export-format"]', 'csv');
            
            const downloadPromise = page.waitForEvent('download');
            await page.click('[data-testid="download-button"]');
            const download = await downloadPromise;
            
            expect(download.suggestedFilename()).toContain('.csv');
        });

        test('データインポート機能', async ({ page }) => {
            // 元のデータを作成
            await GameplaySimulator.simulateBasicGameplay(page);
            
            await page.click('[data-testid="user-info-button"]');
            const originalGames = await page.locator('[data-testid="total-games"]').textContent();
            
            // データをクリア
            await page.click('[data-testid="settings-button"]');
            await page.click('[data-testid="clear-data-button"]');
            await page.click('[data-testid="confirm-clear-button"]');
            
            // データがクリアされたことを確認
            await page.reload();
            await page.click('[data-testid="user-info-button"]');
            const clearedGames = await page.locator('[data-testid="total-games"]').textContent();
            expect(clearedGames).toBe('0');
            
            // インポート機能のテスト
            await page.click('[data-testid="import-button"]');
            await page.waitForSelector('[data-testid="import-dialog"]');
            
            // テスト用のJSONデータをアップロード
            const testData = {
                gamePlayStats: { totalGames: 5, totalScore: 25000 },
                scoreStats: { totalScore: 25000, highestScore: 7500 },
                bubbleStats: { totalPopped: 500, accuracy: 0.85 },
                comboStats: { maxCombo: 15, averageCombo: 8 }
            };
            
            // ファイル入力をシミュレーション
            const fileInput = page.locator('[data-testid="file-input"]');
            await fileInput.setInputFiles({
                name: 'test-statistics.json',
                mimeType: 'application/json',
                buffer: Buffer.from(JSON.stringify(testData))
            });
            
            await page.click('[data-testid="import-confirm-button"]');
            await page.waitForSelector('[data-testid="import-success-message"]');
            
            // インポートされたデータが反映されることを確認
            await page.reload();
            await page.click('[data-testid="user-info-button"]');
            const importedGames = await page.locator('[data-testid="total-games"]').textContent();
            expect(importedGames).toBe('5');
        });
    });

    test.describe('レスポンシブ表示テスト', () => {
        test('モバイル表示での統計機能', async ({ page }) => {
            await page.setViewportSize(ResponsiveHelper.viewports.mobile);
            
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // モバイル用レイアウトが適用されることを確認
            const mobileLayout = page.locator('[data-testid="mobile-statistics-layout"]');
            await expect(mobileLayout).toBeVisible();
            
            // スワイプナビゲーションのテスト
            const chartArea = page.locator('[data-testid="chart-area"]');
            await chartArea.swipe({ dx: -100, dy: 0 }); // 左スワイプ
            
            // タブナビゲーションがモバイル用に変更されることを確認
            const mobileTabNav = page.locator('[data-testid="mobile-tab-nav"]');
            await expect(mobileTabNav).toBeVisible();
        });

        test('タブレット表示での統計機能', async ({ page }) => {
            await page.setViewportSize(ResponsiveHelper.viewports.tablet);
            
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // タブレット用レイアウトの確認
            const tabletLayout = page.locator('[data-testid="tablet-statistics-layout"]');
            await expect(tabletLayout).toBeVisible();
            
            // 2カラムレイアウトの確認
            const leftColumn = page.locator('[data-testid="stats-left-column"]');
            const rightColumn = page.locator('[data-testid="stats-right-column"]');
            await expect(leftColumn).toBeVisible();
            await expect(rightColumn).toBeVisible();
        });

        test('デスクトップ表示での統計機能', async ({ page }) => {
            await page.setViewportSize(ResponsiveHelper.viewports.desktop);
            
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // デスクトップ用レイアウトの確認
            const desktopLayout = page.locator('[data-testid="desktop-statistics-layout"]');
            await expect(desktopLayout).toBeVisible();
            
            // フルサイズのチャート表示
            const fullChart = page.locator('[data-testid="full-size-chart"]');
            await expect(fullChart).toBeVisible();
            
            // サイドバー表示
            const sidebar = page.locator('[data-testid="statistics-sidebar"]');
            await expect(sidebar).toBeVisible();
        });

        test('レスポンシブチャート表示', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            await ResponsiveHelper.testResponsiveDisplay(page, async (page, device) => {
                const chart = page.locator('[data-testid="statistics-chart"]');
                await expect(chart).toBeVisible();
                
                // デバイスごとのチャートサイズ確認
                const chartSize = await chart.boundingBox();
                expect(chartSize.width).toBeGreaterThan(0);
                expect(chartSize.height).toBeGreaterThan(0);
                
                // フォントサイズの調整確認
                const chartLabels = page.locator('[data-testid="chart-labels"]');
                const fontSize = await chartLabels.evaluate(el => 
                    window.getComputedStyle(el).fontSize
                );
                expect(fontSize).toBeTruthy();
            });
        });
    });

    test.describe('アクセシビリティ機能テスト', () => {
        test('キーボードナビゲーション', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // キーボードナビゲーションのテスト
            await AccessibilityHelper.testKeyboardNavigation(page);
            
            // フォーカス表示の確認
            const focusedElement = page.locator(':focus');
            await expect(focusedElement).toHaveClass(/focus-visible/);
        });

        test('スクリーンリーダー対応', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            await AccessibilityHelper.testScreenReaderSupport(page);
            
            // 統計データの読み上げテキスト確認
            const screenReaderText = page.locator('[data-testid="screen-reader-stats"]');
            await expect(screenReaderText).toBeVisible();
            
            const textContent = await screenReaderText.textContent();
            expect(textContent).toContain('総ゲーム数');
            expect(textContent).toContain('最高スコア');
        });

        test('高コントラストモード', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            await AccessibilityHelper.testHighContrastMode(page);
            
            // 高コントラストでのチャート表示確認
            const chart = page.locator('[data-testid="statistics-chart"]');
            await expect(chart).toBeVisible();
        });

        test('大きなフォントサイズ対応', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // 大きなフォントモードを有効化
            await page.keyboard.press('Control+='); // フォントサイズ拡大
            await page.keyboard.press('Control+=');
            
            // レイアウトが崩れないことを確認
            const statisticsSection = page.locator('[data-testid="statistics-section"]');
            await expect(statisticsSection).toBeVisible();
            
            // テキストが読みやすいサイズになることを確認
            const largeText = page.locator('[data-testid="large-font-text"]');
            const fontSize = await largeText.evaluate(el => 
                window.getComputedStyle(el).fontSize
            );
            expect(parseFloat(fontSize)).toBeGreaterThan(16);
        });

        test('色覚サポート機能', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // 色覚サポートモードを有効化
            await page.click('[data-testid="accessibility-settings"]');
            await page.selectOption('[data-testid="color-blind-support"]', 'deuteranopia');
            await page.click('[data-testid="apply-settings"]');
            
            // パターンサポートが適用されることを確認
            const patternChart = page.locator('[data-testid="pattern-chart"]');
            await expect(patternChart).toBeVisible();
            
            // シンボルサポートの確認
            const symbolLegend = page.locator('[data-testid="symbol-legend"]');
            await expect(symbolLegend).toBeVisible();
        });
    });

    test.describe('パフォーマンス・安定性テスト', () => {
        test('大量データでの表示性能', async ({ page }) => {
            // 大量のゲームデータを生成
            await page.evaluate(() => {
                const largeStats = {
                    gamePlayStats: { 
                        totalGames: 1000, 
                        totalPlayTime: 3600000 * 100,
                        averageSessionTime: 3600000 
                    },
                    scoreStats: { 
                        totalScore: 5000000, 
                        highestScore: 50000,
                        scoreHistory: Array.from({length: 1000}, () => Math.random() * 10000)
                    },
                    bubbleStats: { 
                        totalPopped: 100000, 
                        accuracy: 0.85 
                    },
                    timeSeries: {
                        daily: new Map(Array.from({length: 365}, (_, i) => [
                            `2024-01-${String(i + 1).padStart(2, '0')}`,
                            { games: Math.floor(Math.random() * 10), score: Math.random() * 10000 }
                        ]))
                    }
                };
                localStorage.setItem('awaputi_statistics', JSON.stringify(largeStats));
            });
            
            // 統計表示の読み込み時間を測定
            const startTime = Date.now();
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            const loadTime = Date.now() - startTime;
            
            console.log('Large data load time:', loadTime, 'ms');
            
            // 5秒以内に読み込まれることを確認
            expect(loadTime).toBeLessThan(5000);
            
            // チャートが正常に描画されることを確認
            const chart = page.locator('[data-testid="statistics-chart"]');
            await expect(chart).toBeVisible();
        });

        test('長時間の統計収集安定性', async ({ page }) => {
            const sessionDuration = 60000; // 1分間のテスト
            const startTime = Date.now();
            
            // 長時間のゲームプレイをシミュレーション
            await page.click('[data-testid="start-game-button"]');
            await page.waitForSelector('[data-testid="game-canvas"]');
            
            while (Date.now() - startTime < sessionDuration) {
                // ランダムなゲームアクション
                const actions = ['click', 'drag', 'special'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                
                try {
                    switch (action) {
                        case 'click':
                            const bubbles = page.locator('.bubble');
                            const count = await bubbles.count();
                            if (count > 0) {
                                await bubbles.first().click();
                            }
                            break;
                        case 'drag':
                            const canvas = page.locator('[data-testid="game-canvas"]');
                            await canvas.dragTo(canvas, {
                                sourcePosition: { x: 100, y: 100 },
                                targetPosition: { x: 200, y: 200 }
                            });
                            break;
                        case 'special':
                            await page.keyboard.press('Space'); // 特殊アクション
                            break;
                    }
                } catch (error) {
                    // エラーは無視して継続
                }
                
                await page.waitForTimeout(100);
            }
            
            // ゲームを終了して統計を確認
            await page.keyboard.press('Escape');
            await page.click('[data-testid="user-info-button"]');
            
            // 統計データが正常に収集されていることを確認
            const totalGames = page.locator('[data-testid="total-games"]');
            await expect(totalGames).not.toContainText('0');
            
            // プレイ時間が記録されていることを確認
            const playTime = page.locator('[data-testid="total-play-time"]');
            await expect(playTime).toBeVisible();
        });

        test('メモリリーク検出', async ({ page }) => {
            // 初期メモリ使用量を記録
            const initialMemory = await page.evaluate(() => {
                return performance.memory ? performance.memory.usedJSHeapSize : 0;
            });
            
            // 複数回の統計表示・非表示を繰り返す
            for (let i = 0; i < 10; i++) {
                await page.click('[data-testid="user-info-button"]');
                await page.waitForSelector('[data-testid="statistics-section"]');
                
                await page.click('[data-testid="back-to-menu-button"]');
                await page.waitForTimeout(500);
            }
            
            // 最終メモリ使用量を確認
            const finalMemory = await page.evaluate(() => {
                if (window.gc) window.gc(); // ガベージコレクション実行
                return performance.memory ? performance.memory.usedJSHeapSize : 0;
            });
            
            const memoryIncrease = finalMemory - initialMemory;
            console.log('Memory increase:', memoryIncrease / (1024 * 1024), 'MB');
            
            // メモリ増加が50MB以下であることを確認
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });
    });

    test.describe('エラーハンドリングと復旧', () => {
        test('統計データ破損からの復旧', async ({ page }) => {
            // 正常な統計データを作成
            await GameplaySimulator.simulateBasicGameplay(page);
            
            // 統計データを意図的に破損させる
            await page.evaluate(() => {
                localStorage.setItem('awaputi_statistics', 'invalid_json_data');
            });
            
            // 統計画面を開く
            await page.click('[data-testid="user-info-button"]');
            
            // エラー復旧メッセージが表示されることを確認
            const recoveryMessage = page.locator('[data-testid="data-recovery-message"]');
            await expect(recoveryMessage).toBeVisible();
            
            // デフォルト統計が表示されることを確認
            const defaultStats = page.locator('[data-testid="default-statistics"]');
            await expect(defaultStats).toBeVisible();
        });

        test('ネットワークエラー時の挙動', async ({ page }) => {
            // ネットワークを無効化
            await page.route('**/*', route => route.abort());
            
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // オフライン表示が出ることを確認
            const offlineMessage = page.locator('[data-testid="offline-message"]');
            await expect(offlineMessage).toBeVisible();
            
            // ローカルデータが表示されることを確認
            const localStats = page.locator('[data-testid="local-statistics"]');
            await expect(localStats).toBeVisible();
        });

        test('ストレージ容量不足時の挙動', async ({ page }) => {
            // LocalStorageの容量制限をシミュレーション
            await page.evaluate(() => {
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = function(key, value) {
                    if (key.includes('statistics')) {
                        throw new Error('QuotaExceededError');
                    }
                    return originalSetItem.call(this, key, value);
                };
            });
            
            await GameplaySimulator.simulateBasicGameplay(page);
            await page.click('[data-testid="user-info-button"]');
            
            // ストレージエラーメッセージが表示されることを確認
            const storageError = page.locator('[data-testid="storage-error-message"]');
            await expect(storageError).toBeVisible();
            
            // 代替保存方式が提案されることを確認
            const alternativeStorage = page.locator('[data-testid="alternative-storage-option"]');
            await expect(alternativeStorage).toBeVisible();
        });
    });

    test.describe('統合ワークフローテスト', () => {
        test('完全なゲームプレイ・統計・エクスポートワークフロー', async ({ page }) => {
            // 1. 複数ゲームセッション
            await GameplaySimulator.simulateMultipleSessions(page, 3);
            
            // 2. 統計確認
            await page.click('[data-testid="user-info-button"]');
            await page.waitForSelector('[data-testid="statistics-section"]');
            
            const totalGames = await page.locator('[data-testid="total-games"]').textContent();
            expect(parseInt(totalGames)).toBe(3);
            
            // 3. 期間フィルター適用
            await page.selectOption('[data-testid="period-filter"]', 'today');
            await page.waitForTimeout(1000);
            
            // 4. エクスポート実行
            await page.click('[data-testid="export-button"]');
            const downloadPromise = page.waitForEvent('download');
            await page.click('[data-testid="download-button"]');
            const download = await downloadPromise;
            
            expect(download.suggestedFilename()).toContain('.json');
            
            // 5. データクリア・インポートテスト
            await page.click('[data-testid="settings-button"]');
            await page.click('[data-testid="clear-data-button"]');
            await page.click('[data-testid="confirm-clear-button"]');
            
            // 6. インポート実行（簡略版）
            await page.click('[data-testid="import-button"]');
            // ... インポート処理 ...
            
            console.log('Complete workflow test passed');
        });

        test('マルチデバイス・アクセシビリティ統合テスト', async ({ page }) => {
            await GameplaySimulator.simulateBasicGameplay(page);
            
            await ResponsiveHelper.testResponsiveDisplay(page, async (page, device) => {
                await page.click('[data-testid="user-info-button"]');
                
                // アクセシビリティ機能のテスト
                if (device === 'desktop') {
                    await AccessibilityHelper.testKeyboardNavigation(page);
                    await AccessibilityHelper.testHighContrastMode(page);
                }
                
                // レスポンシブ統計表示の確認
                const stats = page.locator('[data-testid="responsive-statistics"]');
                await expect(stats).toBeVisible();
                
                await page.click('[data-testid="back-to-menu-button"]');
            });
        });
    });
});

// テスト用ヘルパー関数とユーティリティ
const E2ETestHelper = {
    /**
     * スクリーンショットを撮影
     */
    async takeScreenshot(page, name) {
        if (TEST_CONFIG.screenshots) {
            await page.screenshot({ 
                path: `tests/screenshots/${name}_${Date.now()}.png`,
                fullPage: true 
            });
        }
    },

    /**
     * テスト用データの生成
     */
    generateTestStatistics() {
        return {
            gamePlayStats: { totalGames: 10, totalPlayTime: 600000 },
            scoreStats: { totalScore: 50000, highestScore: 8000 },
            bubbleStats: { totalPopped: 500, accuracy: 0.88 },
            comboStats: { maxCombo: 20, averageCombo: 12 }
        };
    },

    /**
     * パフォーマンス測定
     */
    async measurePerformance(page, action) {
        const startTime = Date.now();
        await action();
        const endTime = Date.now();
        return endTime - startTime;
    },

    /**
     * アクセシビリティ監査（簡易版）
     */
    async auditAccessibility(page) {
        // WCAG基本チェック
        const issues = [];
        
        // 画像のalt属性チェック
        const imagesWithoutAlt = await page.locator('img:not([alt])').count();
        if (imagesWithoutAlt > 0) {
            issues.push(`${imagesWithoutAlt} images without alt text`);
        }
        
        // 見出し階層チェック
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        // ... 見出し階層の検証ロジック ...
        
        return issues;
    }
};

export { GameplaySimulator, AccessibilityHelper, ResponsiveHelper, E2ETestHelper };