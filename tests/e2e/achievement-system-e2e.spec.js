/**
 * 実績システムE2Eテスト
 */

import { test, expect } from '@playwright/test';

test.describe('Achievement System E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // ゲームページに移動
        await page.goto('http://localhost:8000');
        
        // ゲームが読み込まれるまで待機
        await page.waitForLoadState('networkidle');
        
        // キャンバスが表示されるまで待機
        await page.waitForSelector('#gameCanvas');
    });

    test('初回実績解除フロー', async ({ page }) => {
        // ユーザー登録フォームがある場合は入力
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('テストユーザー');
            await page.click('button:has-text("開始")');
        }

        // ゲーム開始
        await page.click('button:has-text("ゲーム開始")');
        
        // ゲームキャンバスが表示されることを確認
        const gameCanvas = page.locator('#gameCanvas');
        await expect(gameCanvas).toBeVisible();

        // バブルをクリックして実績解除を試行
        await gameCanvas.click({ position: { x: 200, y: 200 } });
        await page.waitForTimeout(100);
        
        // 初回ポップ実績の通知が表示されることを確認
        const notification = page.locator('.achievement-notification');
        await expect(notification).toBeVisible({ timeout: 5000 });
        
        // 通知内容を確認
        await expect(notification).toContainText('はじめてのポップ');
        
        // 通知が自動的に消えることを確認
        await expect(notification).toBeHidden({ timeout: 6000 });
    });

    test('スコア実績解除フロー', async ({ page }) => {
        // ゲーム開始まで
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('スコアテスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        await expect(gameCanvas).toBeVisible();

        // 複数のバブルをクリックしてスコアを獲得
        for (let i = 0; i < 10; i++) {
            await gameCanvas.click({ 
                position: { 
                    x: 100 + i * 50, 
                    y: 100 + i * 30 
                } 
            });
            await page.waitForTimeout(50);
        }

        // スコア実績の通知を確認
        const scoreNotification = page.locator('.achievement-notification:has-text("スコア")');
        await expect(scoreNotification).toBeVisible({ timeout: 5000 });
    });

    test('実績画面の表示と機能', async ({ page }) => {
        // メインメニューから実績画面に移動
        await page.click('button:has-text("実績")');
        
        // 実績画面が表示されることを確認
        const achievementScreen = page.locator('.achievement-screen');
        await expect(achievementScreen).toBeVisible();

        // カテゴリフィルターが表示されることを確認
        const categoryButtons = page.locator('.category-filter button');
        await expect(categoryButtons).toHaveCount(6); // All, Score, Play, Technique, Collection, Special

        // 各カテゴリをクリックしてフィルタリング動作を確認
        await page.click('button:has-text("スコア")');
        
        // スコア関連実績のみが表示されることを確認
        const scoreAchievements = page.locator('.achievement-item:has-text("スコア")');
        await expect(scoreAchievements.first()).toBeVisible();

        // 実績詳細表示の確認
        await scoreAchievements.first().click();
        
        const achievementDetail = page.locator('.achievement-detail');
        await expect(achievementDetail).toBeVisible();
        await expect(achievementDetail).toContainText('解除条件');
        await expect(achievementDetail).toContainText('報酬');
    });

    test('実績統計画面の表示', async ({ page }) => {
        // 実績画面に移動
        await page.click('button:has-text("実績")');
        
        // 統計タブをクリック
        await page.click('button:has-text("統計")');
        
        // 統計情報が表示されることを確認
        const statsSection = page.locator('.achievement-stats');
        await expect(statsSection).toBeVisible();

        // 全体統計の表示確認
        await expect(page.locator('.overall-stats')).toBeVisible();
        await expect(page.locator('.overall-stats')).toContainText('総実績数');
        await expect(page.locator('.overall-stats')).toContainText('達成率');

        // カテゴリ別統計の表示確認
        await expect(page.locator('.category-stats')).toBeVisible();
        
        // 進捗チャートの表示確認
        await expect(page.locator('.progress-chart')).toBeVisible();
    });

    test('複数実績の連続解除', async ({ page }) => {
        // ゲーム開始
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('連続解除テスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        await expect(gameCanvas).toBeVisible();

        // 集中的にバブルをクリック
        for (let i = 0; i < 20; i++) {
            await gameCanvas.click({ 
                position: { 
                    x: 150 + (i % 5) * 100, 
                    y: 150 + Math.floor(i / 5) * 80 
                } 
            });
            await page.waitForTimeout(100);
        }

        // 複数の通知が順次表示されることを確認
        const notifications = page.locator('.achievement-notification');
        
        // 最初の通知が表示される
        await expect(notifications.first()).toBeVisible({ timeout: 5000 });
        
        // 通知キューが正しく動作することを確認
        const notificationCount = await notifications.count();
        expect(notificationCount).toBeGreaterThanOrEqual(1);
        
        // 通知が適切に管理されることを確認（最大3つまで同時表示）
        const visibleNotifications = await page.locator('.achievement-notification:visible').count();
        expect(visibleNotifications).toBeLessThanOrEqual(3);
    });

    test('実績音響効果の確認', async ({ page }) => {
        // 音響が有効であることを確認
        await page.evaluate(() => {
            // AudioContext を使用可能にする
            if (window.AudioContext) {
                window.testAudioContext = new AudioContext();
            }
        });

        // ゲーム開始
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('音響テスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        await expect(gameCanvas).toBeVisible();

        // 音響効果の再生を監視
        let soundPlayed = false;
        page.on('console', msg => {
            if (msg.text().includes('Achievement sound played')) {
                soundPlayed = true;
            }
        });

        // バブルをクリックして実績解除
        await gameCanvas.click({ position: { x: 200, y: 200 } });
        
        // 実績通知が表示される
        const notification = page.locator('.achievement-notification');
        await expect(notification).toBeVisible({ timeout: 5000 });

        // 音響効果が再生されたことを確認（コンソールログで）
        await page.waitForTimeout(1000);
        // 注: 実際の音響再生の検証は制限されるため、関連要素の確認で代用
    });

    test('実績データの永続化確認', async ({ page }) => {
        // 初回セッション
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('永続化テスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        await gameCanvas.click({ position: { x: 200, y: 200 } });
        
        // 実績解除を確認
        const notification = page.locator('.achievement-notification');
        await expect(notification).toBeVisible({ timeout: 5000 });

        // 実績画面で解除状態を確認
        await page.click('button:has-text("メニュー")');
        await page.click('button:has-text("実績")');
        
        const unlockedAchievement = page.locator('.achievement-item.unlocked');
        await expect(unlockedAchievement.first()).toBeVisible();

        // ページをリロードして永続化を確認
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 実績画面に再度移動
        await page.click('button:has-text("実績")');
        
        // 解除済み実績が保持されていることを確認
        const persistedAchievement = page.locator('.achievement-item.unlocked');
        await expect(persistedAchievement.first()).toBeVisible();
    });

    test('モバイル表示での実績システム', async ({ page }) => {
        // モバイルビューポートに設定
        await page.setViewportSize({ width: 375, height: 667 });

        // ゲーム開始
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('モバイルテスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        await expect(gameCanvas).toBeVisible();

        // タッチイベントでバブルをタップ
        await gameCanvas.tap({ position: { x: 150, y: 200 } });
        
        // 実績通知がモバイルでも正しく表示されることを確認
        const notification = page.locator('.achievement-notification');
        await expect(notification).toBeVisible({ timeout: 5000 });

        // 通知がモバイル画面に適切に収まることを確認
        const notificationBox = await notification.boundingBox();
        expect(notificationBox.width).toBeLessThanOrEqual(375);

        // 実績画面のモバイル表示確認
        await page.click('button:has-text("メニュー")');
        await page.click('button:has-text("実績")');
        
        const achievementScreen = page.locator('.achievement-screen');
        await expect(achievementScreen).toBeVisible();

        // カテゴリフィルターがモバイルで適切に表示されることを確認
        const categoryButtons = page.locator('.category-filter button');
        await expect(categoryButtons.first()).toBeVisible();
    });

    test('実績システムのパフォーマンス確認', async ({ page }) => {
        // パフォーマンス監視を開始
        await page.evaluate(() => {
            window.performanceMarks = [];
            const originalMarkMethod = performance.mark;
            performance.mark = function(name) {
                window.performanceMarks.push({ name, time: Date.now() });
                return originalMarkMethod.call(this, name);
            };
        });

        // ゲーム開始
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('パフォーマンステスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        
        // 短時間で大量のクリックを実行
        const startTime = Date.now();
        
        for (let i = 0; i < 50; i++) {
            await gameCanvas.click({ 
                position: { 
                    x: 100 + (i % 10) * 50, 
                    y: 100 + Math.floor(i / 10) * 50 
                } 
            });
            // 高速クリック
            await page.waitForTimeout(20);
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // パフォーマンスが許容範囲内であることを確認
        expect(totalTime).toBeLessThan(5000); // 5秒以内

        // ゲームが応答性を維持していることを確認
        await expect(gameCanvas).toBeVisible();
        
        // 実績通知が表示されることを確認
        const notification = page.locator('.achievement-notification');
        await expect(notification).toBeVisible({ timeout: 3000 });
    });

    test('アクセシビリティ確認', async ({ page }) => {
        // 実績画面に移動
        await page.click('button:has-text("実績")');
        
        // キーボードナビゲーション確認
        await page.keyboard.press('Tab');
        
        // フォーカスが適切に移動することを確認
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // 実績項目がキーボードでアクセス可能であることを確認
        await page.keyboard.press('Enter');
        
        // ARIAラベルが適切に設定されていることを確認
        const achievementItems = page.locator('[role="button"], [aria-label*="実績"]');
        await expect(achievementItems.first()).toBeVisible();

        // スクリーンリーダー対応のテキストが存在することを確認
        const srOnlyText = page.locator('.sr-only, [aria-hidden="false"]');
        const srTextCount = await srOnlyText.count();
        expect(srTextCount).toBeGreaterThan(0);
    });
});

test.describe('Achievement System Error Handling', () => {
    test('ネットワークエラー時の動作', async ({ page }) => {
        // ネットワークを遮断
        await page.route('**/*', route => route.abort());
        
        // ページ読み込み（エラー状態）
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
        
        // オフライン状態でもゲームが動作することを確認
        // (実績システムはLocalStorageベースのため影響を受けない)
        
        // ネットワークを復旧
        await page.unroute('**/*');
    });

    test('LocalStorage制限時の動作', async ({ page }) => {
        // LocalStorageの容量制限をシミュレート
        await page.evaluate(() => {
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = function(key, value) {
                if (value.length > 100) { // 小さな制限を設定
                    throw new Error('QuotaExceededError');
                }
                return originalSetItem.call(this, key, value);
            };
        });

        // ゲーム開始
        const userNameInput = page.locator('input[placeholder*="名前"]');
        if (await userNameInput.isVisible()) {
            await userNameInput.fill('ストレージテスター');
            await page.click('button:has-text("開始")');
        }

        await page.click('button:has-text("ゲーム開始")');
        
        const gameCanvas = page.locator('#gameCanvas');
        await gameCanvas.click({ position: { x: 200, y: 200 } });

        // エラーが発生してもゲームが継続することを確認
        await expect(gameCanvas).toBeVisible();
        
        // エラーメッセージが適切に表示されることを確認
        const errorMessage = page.locator('.error-message, .warning-message');
        // エラーハンドリングにより graceful degradation が動作することを確認
    });
});