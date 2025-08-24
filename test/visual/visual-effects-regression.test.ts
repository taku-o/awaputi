import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Visual Effects Regression Tests
 * 視覚効果の外観一貫性テスト
 */
import { test as playwrightTest, expect as playwrightExpect } from '@playwright/test';
import path from 'path';

playwrightTest.describe('Visual Effects Regression Tests', () => {
    playwrightTest.beforeEach(async ({ page }) => {
        // テストの一貫性のため固定ビューポート
        await page.setViewportSize({ width: 800, height: 600 });
        await page.goto('http://localhost:8000');
        await page.waitForSelector('#gameCanvas');
        await page.waitForTimeout(2000);
        
        // アニメーションを無効化して一貫した結果を得る
        await page.addStyleTag({
            content: `
                *, *::before, *::after {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                }
            `
        });
    });

    playwrightTest.describe('Menu Visual Consistency', () => {
        playwrightTest('main menu should match visual baseline', async ({ page }) => {
            // メインメニューのスクリーンショット
            await playwrightExpect(page).toHaveScreenshot('main-menu-baseline.png', {
                fullPage: true,
                threshold: 0.2
            });
        });

        playwrightTest('stage select menu should match visual baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(1000);
            
            await playwrightExpect(page).toHaveScreenshot('stage-select-baseline.png', {
                fullPage: true,
                threshold: 0.2
            });
        });
    });

    playwrightTest.describe('Game Scene Visual Consistency', () => {
        playwrightTest('game scene initial state should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            
            // ゲーム開始直後の状態
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('game-scene-initial.png', {
                threshold: 0.3
            });
        });

        playwrightTest('bubble effects should have consistent appearance', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            
            // デバッグインターフェースを使用してエフェクトを発動
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 通常の泡エフェクト
            await page.selectOption('#preview-effect-type', 'bubble-normal');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('bubble-normal-effect.png', {
                threshold: 0.4
            });
        });

        playwrightTest('rainbow bubble effects should have consistent appearance', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // レインボー泡エフェクト
            await page.selectOption('#preview-effect-type', 'bubble-rainbow');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('bubble-rainbow-effect.png', {
                threshold: 0.4
            });
        });

        playwrightTest('electric bubble effects should have consistent appearance', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // エレクトリック泡エフェクト
            await page.selectOption('#preview-effect-type', 'bubble-electric');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('bubble-electric-effect.png', {
                threshold: 0.4
            });
        });
    });

    playwrightTest.describe('Combo Effects Visual Consistency', () => {
        playwrightTest('basic combo effects should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 基本コンボエフェクト
            await page.selectOption('#preview-effect-type', 'combo-basic');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('combo-basic-effect.png', {
                threshold: 0.4
            });
        });

        playwrightTest('enhanced combo effects should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 強化コンボエフェクト
            await page.selectOption('#preview-effect-type', 'combo-enhanced');
            await page.click('#trigger-preview');
            await page.waitForTimeout(300); // より長い待機
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('combo-enhanced-effect.png', {
                threshold: 0.4
            });
        });

        playwrightTest('spectacular combo effects should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 派手なコンボエフェクト
            await page.selectOption('#preview-effect-type', 'combo-spectacular');
            await page.click('#trigger-preview');
            await page.waitForTimeout(400); // さらに長い待機
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('combo-spectacular-effect.png', {
                threshold: 0.5 // より高い閾値
            });
        });
    });

    playwrightTest.describe('Screen Effects Visual Consistency', () => {
        playwrightTest('screen flash effect should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // スクリーンフラッシュエフェクト
            await page.selectOption('#preview-effect-type', 'screen-flash');
            await page.click('#trigger-preview');
            await page.waitForTimeout(100); // フラッシュの瞬間をキャプチャ
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('screen-flash-effect.png', {
                threshold: 0.6 // フラッシュは変動が大きいため高い閾値
            });
        });
    });

    playwrightTest.describe('Quality Level Visual Consistency', () => {
        playwrightTest('low quality effects should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 低品質設定
            await page.selectOption('#quality-select', 'low');
            await page.waitForTimeout(500);
            await page.selectOption('#preview-effect-type', 'bubble-normal');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('effects-quality-low.png', {
                threshold: 0.3
            });
        });

        playwrightTest('high quality effects should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 高品質設定
            await page.selectOption('#quality-select', 'high');
            await page.waitForTimeout(500);
            await page.selectOption('#preview-effect-type', 'bubble-normal');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('effects-quality-high.png', {
                threshold: 0.3
            });
        });

        playwrightTest('ultra quality effects should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(300);
            
            // 最高品質設定
            await page.selectOption('#quality-select', 'ultra');
            await page.waitForTimeout(500);
            await page.selectOption('#preview-effect-type', 'bubble-normal');
            await page.click('#trigger-preview');
            await page.waitForTimeout(200);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('effects-quality-ultra.png', {
                threshold: 0.3
            });
        });
    });

    playwrightTest.describe('Mobile Visual Consistency', () => {
        playwrightTest('mobile layout should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 812 });
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            await playwrightExpect(page).toHaveScreenshot('mobile-main-menu.png', {
                fullPage: true,
                threshold: 0.2
            });
        });

        playwrightTest('mobile game scene should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 812 });
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            
            await playwrightExpect(page.locator('#gameCanvas')).toHaveScreenshot('mobile-game-scene.png', {
                threshold: 0.3
            });
        });
    });

    playwrightTest.describe('Accessibility Visual Consistency', () => {
        playwrightTest('high contrast mode should match baseline', async ({ page }) => {
            // 高コントラストモードのシミュレーション
            await page.emulateMedia({ colorScheme: 'dark' });
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            // 高コントラストスタイルを適用
            await page.addStyleTag({
                content: `
                    body { filter: contrast(150%) brightness(120%); }
                    canvas { border: 2px solid #ffffff; }
                `
            });
            
            await playwrightExpect(page).toHaveScreenshot('high-contrast-menu.png', {
                fullPage: true,
                threshold: 0.3
            });
        });
    });

    playwrightTest.describe('Debug Interface Visual Consistency', () => {
        playwrightTest('debug interface should match baseline', async ({ page }) => {
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // デバッグパネルのみをキャプチャ
            await playwrightExpect(page.locator('#effect-debug-panel')).toHaveScreenshot('debug-interface.png', {
                threshold: 0.2
            });
        });

        playwrightTest('debug interface with metrics should match baseline', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1500);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(1000); // メトリクスが更新されるまで待機
            
            // メトリクス付きデバッグパネル
            await playwrightExpect(page.locator('#effect-debug-panel')).toHaveScreenshot('debug-interface-with-metrics.png', {
                threshold: 0.3 // メトリクス値は変動するため高い閾値
            });
        });
    });
});

// テスト設定
playwrightTest.describe.configure({ mode: 'parallel' }); // 並列実行を有効化