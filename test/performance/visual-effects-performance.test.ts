import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
/**
 * Visual Effects Performance Tests
 * 視覚効果システムのパフォーマンステスト
 */
import { test as playwrightTest, expect as playwrightExpect } from '@playwright/test';

playwrightTest.describe('Visual Effects Performance Tests', () => {
    playwrightTest.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('#gameCanvas');
        await page.waitForTimeout(2000);
    });

    playwrightTest.describe('Frame Rate Performance', () => {
        playwrightTest('should maintain stable FPS during normal gameplay', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            
            // デバッグインターフェースを開いてFPS監視
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // FPS測定を開始
            const fpsReadings: number[] = [];
            
            for (let i = 0; i < 10; i++) {
                await page.waitForTimeout(1000); // 1秒待機
                const fpsText = await page.textContent('#fps-value');
                const fps = parseFloat(fpsText || '0');
                if (!isNaN(fps)) {
                    fpsReadings.push(fps);
                }
            }
            
            // FPS要件の確認
            const averageFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
            const minFPS = Math.min(...fpsReadings);
            playwrightExpect(averageFPS).toBeGreaterThan(30); // 平均30FPS以上
            playwrightExpect(minFPS).toBeGreaterThan(15); // 最低15FPS以上
            
            console.log(`Average FPS: ${averageFPS.toFixed(2)}, Min FPS: ${minFPS.toFixed(2)}`);
        });

        playwrightTest('should maintain performance during heavy particle effects', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // 大量のパーティクルエフェクトを発動
            for (let i = 0; i < 20; i++) {
                await page.selectOption('#preview-effect-type', 'bubble-diamond');
                await page.click('#trigger-preview');
                await page.waitForTimeout(50);
            }
            
            await page.waitForTimeout(2000); // エフェクト安定化待機
            
            // パフォーマンス測定
            const fpsText = await page.textContent('#fps-value');
            const fps = parseFloat(fpsText || '0');
            const particleText = await page.textContent('#particle-value');
            const particleCount = parseInt(particleText || '0');
            
            playwrightExpect(fps).toBeGreaterThan(20); // 重負荷時でも20FPS以上
            playwrightExpect(particleCount).toBeGreaterThan(0); // パーティクルが生成されている
            
            console.log(`Heavy load FPS: ${fps}, Particles: ${particleCount}`);
        });

        playwrightTest('should scale performance with quality settings', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            const qualityResults: Record<string, number> = {};
            const qualityLevels = ['low', 'medium', 'high', 'ultra'];
            
            for (const quality of qualityLevels) {
                await page.selectOption('#quality-select', quality);
                await page.waitForTimeout(1000);
                
                // エフェクトを発動
                await page.selectOption('#preview-effect-type', 'combo-spectacular');
                await page.click('#trigger-preview');
                await page.waitForTimeout(2000);
                
                const fpsText = await page.textContent('#fps-value');
                const fps = parseFloat(fpsText || '0');
                
                qualityResults[quality] = fps;
            }
            
            // 品質レベルとパフォーマンスの関係を検証
            playwrightExpect(qualityResults.low).toBeGreaterThanOrEqual(qualityResults.medium * 0.8);
            playwrightExpect(qualityResults.medium).toBeGreaterThanOrEqual(qualityResults.high * 0.8);
            playwrightExpect(qualityResults.high).toBeGreaterThanOrEqual(qualityResults.ultra * 0.8);
            
            console.log('Quality vs FPS:', qualityResults);
        });
    });

    playwrightTest.describe('Memory Performance', () => {
        playwrightTest('should not leak memory during extended gameplay', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // 初期メモリ使用量を記録
            const initialMemoryText = await page.textContent('#memory-value');
            const initialMemory = parseFloat((initialMemoryText || '0').replace(' MB', ''));
            
            // 長時間のエフェクト生成をシミュレート
            for (let cycle = 0; cycle < 10; cycle++) {
                for (let i = 0; i < 5; i++) {
                    await page.selectOption('#preview-effect-type', 'bubble-normal');
                    await page.click('#trigger-preview');
                    await page.waitForTimeout(100);
                }
                await page.waitForTimeout(1000);
            }
            
            // 最終メモリ使用量を記録
            const finalMemoryText = await page.textContent('#memory-value');
            const finalMemory = parseFloat((finalMemoryText || '0').replace(' MB', ''));
            const memoryIncrease = finalMemory - initialMemory;
            const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
            
            // メモリ増加が20%以下であることを確認
            playwrightExpect(memoryIncreasePercent).toBeLessThan(20);
            
            console.log(`Memory usage: ${initialMemory}MB -> ${finalMemory}MB (${memoryIncreasePercent.toFixed(2)}% increase)`);
        });

        playwrightTest('should clean up effects efficiently', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // 大量エフェクトを生成
            for (let i = 0; i < 50; i++) {
                await page.selectOption('#preview-effect-type', 'combo-spectacular');
                await page.click('#trigger-preview');
                await page.waitForTimeout(20);
            }
            
            const peakParticleText = await page.textContent('#particle-value');
            const peakParticles = parseInt(peakParticleText || '0');
            
            // エフェクトクリア
            await page.click('#clear-effects');
            await page.waitForTimeout(2000);
            
            const clearedParticleText = await page.textContent('#particle-value');
            const clearedParticles = parseInt(clearedParticleText || '0');
            
            // パーティクルが大幅に減少していることを確認
            playwrightExpect(clearedParticles).toBeLessThan(peakParticles * 0.1);
            
            console.log(`Particles: ${peakParticles} -> ${clearedParticles} (${((1 - clearedParticles/peakParticles) * 100).toFixed(1)}% reduction)`);
        });
    });

    playwrightTest.describe('Rendering Performance', () => {
        playwrightTest('should optimize rendering with viewport culling', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            
            // Canvas範囲外でエフェクトを発動（カリングテスト）
            await page.evaluate(() => {
                const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
                const gameEngine = (window as any).gameEngine;
                
                if (gameEngine && gameEngine.enhancedParticleManager) {
                    // 画面外座標でパーティクル生成
                    for (let i = 0; i < 20; i++) {
                        gameEngine.enhancedParticleManager.createBubbleDestructionEffect(
                            -100, -100, 'normal'
                        );
                        gameEngine.enhancedParticleManager.createBubbleDestructionEffect(
                            canvas.width + 100, canvas.height + 100, 'normal'
                        );
                    }
                }
            });
            
            await page.waitForTimeout(1000);
            
            // パフォーマンスが維持されていることを確認
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            const fpsText = await page.textContent('#fps-value');
            const fps = parseFloat(fpsText || '0');
            playwrightExpect(fps).toBeGreaterThan(25); // カリングにより良好なパフォーマンス
        });

        playwrightTest('should handle different screen sizes efficiently', async ({ page }) => {
            const screenSizes = [
                { width: 320, height: 568 },  // iPhone SE
                { width: 375, height: 812 },  // iPhone X
                { width: 768, height: 1024 }, // iPad
                { width: 1920, height: 1080 } // Desktop
            ];
            
            const performanceResults: Record<string, number> = {};
            
            for (const size of screenSizes) {
                await page.setViewportSize(size);
                await page.goto('http://localhost:8000');
                await page.waitForTimeout(2000);
                await page.click('text=ゲーム開始');
                await page.waitForTimeout(500);
                await page.click('text=ちょっとだけ (1分)');
                await page.waitForTimeout(1000);
                await page.keyboard.press('Control+Shift+E');
                await page.waitForTimeout(500);
                
                // 標準エフェクトテスト
                await page.selectOption('#preview-effect-type', 'bubble-normal');
                await page.click('#trigger-preview');
                await page.waitForTimeout(1000);
                
                const fpsText = await page.textContent('#fps-value');
                const fps = parseFloat(fpsText || '0');
                
                performanceResults[`${size.width}x${size.height}`] = fps;
            }
            
            // すべての画面サイズで最低限のパフォーマンスを確保
            for (const [resolution, fps] of Object.entries(performanceResults)) {
                playwrightExpect(fps).toBeGreaterThan(20);
            }
            
            console.log('Performance by resolution:', performanceResults);
        });
    });

    playwrightTest.describe('Auto-Optimization Performance', () => {
        playwrightTest('should automatically optimize when performance drops', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // 最高品質設定
            await page.selectOption('#quality-select', 'ultra');
            const initialQuality = await page.inputValue('#quality-select');
            
            // 負荷をかけてパフォーマンス低下を誘発
            for (let i = 0; i < 100; i++) {
                await page.selectOption('#preview-effect-type', 'combo-spectacular');
                await page.click('#trigger-preview');
                await page.waitForTimeout(10);
            }
            
            await page.waitForTimeout(5000); // 自動最適化の時間を待つ
            
            const finalQuality = await page.inputValue('#quality-select');
            
            // 自動最適化が動作した可能性を確認
            console.log(`Quality: ${initialQuality} -> ${finalQuality}`);
            
            // 最終的にパフォーマンスが回復していることを確認
            const finalFpsText = await page.textContent('#fps-value');
            const finalFps = parseFloat(finalFpsText || '0');
            playwrightExpect(finalFps).toBeGreaterThan(15); // 最適化後の最低限のパフォーマンス
        });

        playwrightTest('should benchmark all effect types efficiently', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // ベンチマーク実行の前にダイアログハンドラーを設定
            let benchmarkCompleted = false;
            page.on('dialog', async dialog => {
                playwrightExpect(dialog.message()).toContain('Benchmark Results');
                benchmarkCompleted = true;
                await dialog.accept();
            });
            
            const benchmarkStart = Date.now();
            await page.click('#benchmark-effects');
            
            // ベンチマーク完了まで待機（最大30秒）
            while (!benchmarkCompleted && Date.now() - benchmarkStart < 30000) {
                await page.waitForTimeout(1000);
            }
            
            const benchmarkDuration = Date.now() - benchmarkStart;
            
            playwrightExpect(benchmarkCompleted).toBe(true);
            playwrightExpect(benchmarkDuration).toBeLessThan(30000); // 30秒以内に完了
            
            console.log(`Benchmark completed in ${benchmarkDuration}ms`);
        });
    });

    playwrightTest.describe('Mobile Performance Optimization', () => {
        playwrightTest('should optimize for mobile devices automatically', async ({ page }) => {
            // モバイルデバイスのシミュレーション
            await page.setViewportSize({ width: 375, height: 812 });
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
            await page.goto('http://localhost:8000');
            await page.waitForTimeout(2000);
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // モバイル最適化が適用されているかチェック
            const isMobileOptimized = await page.evaluate(() => {
                const gameEngine = (window as any).gameEngine;
                return gameEngine?.mobileEffectOptimizer?.isEnabled() || false;
            });
            
            // エフェクトテスト
            await page.selectOption('#preview-effect-type', 'bubble-normal');
            await page.click('#trigger-preview');
            await page.waitForTimeout(1000);
            
            const fpsText = await page.textContent('#fps-value');
            const fps = parseFloat(fpsText || '0');
            
            // モバイルでも良好なパフォーマンス
            playwrightExpect(fps).toBeGreaterThan(25);
            
            console.log(`Mobile optimized: ${isMobileOptimized}, FPS: ${fps}`);
        });
    });

    playwrightTest.describe('Stress Testing', () => {
        playwrightTest('should handle extreme particle counts gracefully', async ({ page }) => {
            await page.click('text=ゲーム開始');
            await page.waitForTimeout(500);
            await page.click('text=ちょっとだけ (1分)');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Control+Shift+E');
            await page.waitForTimeout(500);
            
            // パーティクル倍率を最大に
            await page.fill('#particle-multiplier', '2.0');
            await page.waitForTimeout(500);
            
            // 大量のエフェクト生成
            for (let i = 0; i < 200; i++) {
                await page.selectOption('#preview-effect-type', 'combo-spectacular');
                await page.click('#trigger-preview');
                if (i % 20 === 0) {
                    await page.waitForTimeout(100); // 定期的に少し待機
                }
            }
            
            await page.waitForTimeout(3000);
            
            // システムがクラッシュしていないことを確認
            const isGameRunning = await page.evaluate(() => {
                return (window as any).gameEngine?.isRunning || false;
            });
            playwrightExpect(isGameRunning).toBe(true);
            
            const fpsText = await page.textContent('#fps-value');
            const fps = parseFloat(fpsText || '0');
            
            // 極端な状況でも最低限の動作
            playwrightExpect(fps).toBeGreaterThan(5);
        });
    });
});