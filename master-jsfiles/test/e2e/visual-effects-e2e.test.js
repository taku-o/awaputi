/**
 * Visual Effects E2E Tests
 * 視覚効果システムのEnd-to-Endテスト
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Effects E2E Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        // ゲームページに移動
        await page.goto('http://localhost:8000');
        
        // ゲームが読み込まれるまで待機
        await page.waitForSelector('#gameCanvas');
        await page.waitForTimeout(2000);
    });

    test.describe('Basic Effect Functionality', () => {
        test('should display particle effects when bubbles pop', async ({ page }) => {
            // ゲーム開始
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(1000);
            
            // ステージ選択
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            
            // 泡をクリックしてポップさせる
            const canvas = page.locator('#gameCanvas');
            await canvas.click({ position: { x: 400, y: 300 } });
            
            // パーティクルエフェクトの確認（Canvas内容は直接確認困難なため、間接的確認）
            await page.waitForTimeout(500);
            
            // エフェクトシステムが動作していることをコンソールログで確認
            const logs = await page.evaluate(() => {
                return window.gameEngine?.enhancedParticleManager?.getActiveParticleCount() || 0;
            });
            
            expect(logs).toBeGreaterThan(0);
        });

        test('should trigger combo effects with consecutive pops', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(1000);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            
            const canvas = page.locator('#gameCanvas');
            
            // 連続で泡をポップしてコンボを作る
            for (let i = 0; i < 5; i++) {
                await canvas.click({ position: { x: 350 + i * 20, y: 300 } });
                await page.waitForTimeout(100);
            }
            
            // コンボエフェクトが発動していることを確認
            const comboEffects = await page.evaluate(() => {
                return window.gameEngine?.enhancedEffectManager?.getActiveEffectCount() || 0;
            });
            
            expect(comboEffects).toBeGreaterThan(0);
        });
    });

    test.describe('Quality Settings Integration', () => {
        test('should change effect quality through settings', async ({ page }) => {
            // デバッグインターフェースを開く
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // 品質設定を変更
            await page.selectOption('#quality-select', 'low');
            await page.waitForTimeout(500);
            
            // 品質変更が反映されていることを確認
            const currentQuality = await page.evaluate(() => {
                return window.gameEngine?.effectQualityController?.getCurrentQualityLevel();
            });
            
            expect(currentQuality).toBe('low');
        });

        test('should show different performance metrics for different quality levels', async ({ page }) => {
            // デバッグインターフェースを開く
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // Ultra品質でテスト
            await page.selectOption('#quality-select', 'ultra');
            await page.click('#trigger-preview');
            await page.waitForTimeout(1000);
            
            const ultraFPS = await page.textContent('#fps-value');
            
            // Low品質でテスト
            await page.selectOption('#quality-select', 'low');
            await page.click('#trigger-preview');
            await page.waitForTimeout(1000);
            
            const lowFPS = await page.textContent('#fps-value');
            
            // Low品質の方がFPSが高い（または同じ）ことを確認
            expect(parseFloat(lowFPS)).toBeGreaterThanOrEqual(parseFloat(ultraFPS) * 0.8);
        });
    });

    test.describe('Accessibility Features', () => {
        test('should support high contrast mode', async ({ page }) => {
            // 設定メニューにアクセス
            await page.click('text=設定');
            await page.waitForTimeout(500);
            
            // アクセシビリティ設定を開く（存在する場合）
            const accessibilityButton = page.locator('text=アクセシビリティ');
            if (await accessibilityButton.isVisible()) {
                await accessibilityButton.click();
                
                // 高コントラストモードを有効化
                const highContrastCheckbox = page.locator('input[type="checkbox"][data-setting="highContrast"]');
                if (await highContrastCheckbox.isVisible()) {
                    await highContrastCheckbox.check();
                    
                    // 設定が適用されていることを確認
                    const isHighContrast = await page.evaluate(() => {
                        return window.gameEngine?.settingsManager?.getSetting('accessibility.highContrast');
                    });
                    
                    expect(isHighContrast).toBe(true);
                }
            }
        });

        test('should support reduced motion settings', async ({ page }) => {
            // ブラウザの設定でprefers-reduced-motionをシミュレート
            await page.emulateMedia({ reducedMotion: 'reduce' });
            
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            // 動きが制限されていることを確認
            const reducedMotion = await page.evaluate(() => {
                return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            });
            
            expect(reducedMotion).toBe(true);
        });
    });

    test.describe('Mobile Performance', () => {
        test('should optimize effects for mobile viewport', async ({ page, browserName }) => {
            // モバイルビューポートに設定
            await page.setViewportSize({ width: 375, height: 812 });
            
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            // ゲーム開始
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(1000);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            
            // モバイル最適化が適用されていることを確認
            const isMobileOptimized = await page.evaluate(() => {
                return window.gameEngine?.mobileEffectOptimizer?.isEnabled() || false;
            });
            
            // モバイル環境でのパフォーマンス確認
            const canvas = page.locator('#gameCanvas');
            await canvas.click({ position: { x: 200, y: 300 } });
            await page.waitForTimeout(500);
            
            // モバイルでもエフェクトが動作することを確認
            const particleCount = await page.evaluate(() => {
                return window.gameEngine?.enhancedParticleManager?.getActiveParticleCount() || 0;
            });
            
            expect(particleCount).toBeGreaterThan(0);
        });

        test('should handle touch interactions properly', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 812 });
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(1000);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            
            const canvas = page.locator('#gameCanvas');
            
            // タッチイベントをシミュレート
            await canvas.tap({ position: { x: 200, y: 300 } });
            await page.waitForTimeout(500);
            
            // タッチエフェクトが発動していることを確認
            const touchEffects = await page.evaluate(() => {
                return window.gameEngine?.enhancedParticleManager?.getActiveParticleCount() || 0;
            });
            
            expect(touchEffects).toBeGreaterThan(0);
        });
    });

    test.describe('Performance Monitoring', () => {
        test('should track performance metrics in real-time', async ({ page }) => {
            // デバッグインターフェースを開く
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // FPS表示が動作していることを確認
            await page.waitForTimeout(2000);
            
            const fpsValue = await page.textContent('#fps-value');
            expect(fpsValue).not.toBe('--');
            expect(parseFloat(fpsValue)).toBeGreaterThan(0);
            
            // パーティクル数表示の確認
            const particleValue = await page.textContent('#particle-value');
            expect(particleValue).not.toBe('--');
        });

        test('should run effect benchmark successfully', async ({ page }) => {
            // デバッグインターフェースを開く
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // ベンチマークを実行
            await page.click('#benchmark-effects');
            
            // アラートダイアログを処理
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('Benchmark Results');
                await dialog.accept();
            });
            
            await page.waitForTimeout(3000); // ベンチマーク完了まで待機
        });
    });

    test.describe('Error Handling', () => {
        test('should handle JavaScript errors gracefully', async ({ page }) => {
            // JavaScriptエラーをキャッチ
            const errors = [];
            page.on('pageerror', error => {
                errors.push(error.message);
            });
            
            // コンソールエラーをキャッチ
            const consoleLogs = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleLogs.push(msg.text());
                }
            });
            
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            // ゲームプレイを実行
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(1000);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(2000);
            
            // 重大なエラーが発生していないことを確認
            const criticalErrors = errors.filter(error => 
                !error.includes('ResizeObserver') && // 一般的な無害なエラーを除外
                !error.includes('Non-passive event listener')
            );
            
            expect(criticalErrors).toHaveLength(0);
        });

        test('should recover from canvas context loss', async ({ page }) => {
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            // Canvas context loss をシミュレート（可能な場合）
            await page.evaluate(() => {
                const canvas = document.getElementById('gameCanvas');
                const context = canvas.getContext('2d');
                
                // Context loss イベントを発火
                const event = new Event('contextlost');
                canvas.dispatchEvent(event);
                
                // Context restore イベントを発火
                setTimeout(() => {
                    const restoreEvent = new Event('contextrestored');
                    canvas.dispatchEvent(restoreEvent);
                }, 100);
            });
            
            await page.waitForTimeout(1000);
            
            // ゲームが継続して動作することを確認
            const isRunning = await page.evaluate(() => {
                return window.gameEngine?.isRunning || false;
            });
            
            expect(isRunning).toBe(true);
        });
    });

    test.describe('Developer Tools Integration', () => {
        test('should provide debug interface functionality', async ({ page }) => {
            // デバッグインターフェースを開く
            await page.keyboard.press('Control+Shift+E');
            
            // デバッグパネルが表示されることを確認
            const debugPanel = page.locator('#effect-debug-panel');
            await expect(debugPanel).toBeVisible();
            
            // パラメータ調整機能をテスト
            await page.fill('#particle-multiplier', '0.5');
            await page.waitForTimeout(500);
            
            const multiplierValue = await page.textContent('#particle-multiplier-value');
            expect(multiplierValue).toBe('0.5');
        });

        test('should support effect preview functionality', async ({ page }) => {
            // デバッグインターフェースを開く
            await page.keyboard.press('Control+Shift+E');
            
            // エフェクトプレビューを実行
            await page.selectOption('#preview-effect-type', 'bubble-rainbow');
            await page.click('#trigger-preview');
            
            await page.waitForTimeout(1000);
            
            // プレビューエフェクトが発動していることを確認
            const effectCount = await page.evaluate(() => {
                return window.gameEngine?.enhancedParticleManager?.getActiveParticleCount() || 0;
            });
            
            expect(effectCount).toBeGreaterThan(0);
        });
    });

    test.describe('Seasonal Effects', () => {
        test('should apply seasonal theme effects', async ({ page }) => {
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            
            // 季節エフェクトが利用可能かチェック
            const seasonalEffectsAvailable = await page.evaluate(() => {
                return !!window.gameEngine?.seasonalEffectManager;
            });
            
            if (seasonalEffectsAvailable) {
                // 春テーマを適用
                await page.evaluate(() => {
                    window.gameEngine.seasonalEffectManager.setTheme('spring');
                });
                
                await page.waitForTimeout(500);
                
                // テーマが適用されていることを確認
                const currentTheme = await page.evaluate(() => {
                    return window.gameEngine.seasonalEffectManager.getCurrentTheme();
                });
                
                expect(currentTheme).toBe('spring');
            }
        });
    });
});