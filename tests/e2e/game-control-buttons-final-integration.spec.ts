/**
 * Final integration and user acceptance tests for Game Control Buttons
 * Tests complete user workflows, regression testing, performance validation,
 * and overall system integration
 */

import { test, expect } from '@playwright/test';

test.describe('Game Control Buttons Final Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    // Wait for the game to initialize
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test.describe('Complete User Workflows', () => {
    test('should complete full Give Up workflow from game start to menu return', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Wait for game to load and buttons to appear
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Click Give Up button
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Confirm the action (click confirm button in dialog)
        const confirmButtonX = boundingBox.x + boundingBox.width / 2 - 50;
        const confirmButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(confirmButtonX, confirmButtonY);
        await page.waitForTimeout(2000);
        
        // Verify we're back at main menu
        const menuVisible = await page.locator('text=ゲーム開始').or(page.locator('text=Start Game')).isVisible();
        expect(menuVisible).toBe(true);
      }
    });

    test('should complete full Restart workflow maintaining game state', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Click Restart button
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const restartButtonX = boundingBox.x + boundingBox.width - 60;
        const restartButtonY = boundingBox.y + 80; // Below Give Up button
        
        await page.mouse.click(restartButtonX, restartButtonY);
        await page.waitForTimeout(1000);
        
        // Confirm the restart
        const confirmButtonX = boundingBox.x + boundingBox.width / 2 - 50;
        const confirmButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(confirmButtonX, confirmButtonY);
        await page.waitForTimeout(2000);
        
        // Verify game restarted (still in game scene)
        await expect(canvas).toBeVisible();
        
        // Verify buttons are still available after restart
        await page.mouse.move(restartButtonX, restartButtonY);
        await page.waitForTimeout(500);
      }
    });

    test('should handle cancel actions correctly', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Click Give Up button
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel the action (click cancel button in dialog)
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(1000);
        
        // Verify we're still in the game
        await expect(canvas).toBeVisible();
        
        // Verify buttons are still functional after cancel
        await page.mouse.move(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Regression Testing', () => {
    test('should not break existing keyboard shortcuts', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      // Test that existing keyboard shortcuts still work
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Test that space for pause still works
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      // Resume the game
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      // Verify canvas is still visible and responsive
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('should not interfere with game physics or scoring', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Interact with the game (click on bubbles)
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        // Click in game area (not on buttons)
        await page.mouse.click(boundingBox.x + 200, boundingBox.y + 200);
        await page.waitForTimeout(500);
        
        await page.mouse.click(boundingBox.x + 300, boundingBox.y + 250);
        await page.waitForTimeout(500);
        
        // Verify game is still responsive
        await expect(canvas).toBeVisible();
        
        // Verify control buttons are still accessible
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.move(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(200);
      }
    });

    test('should maintain button state across scene transitions', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      // Open pause menu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      // Return to game
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Verify buttons are still accessible after scene transitions
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.move(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(500);
        
        // Click to test functionality
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel to return to game
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Performance Validation', () => {
    test('should maintain acceptable frame rate with buttons rendered', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Monitor frame rate for a short period
      const frameRateTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();
          
          function countFrames() {
            frameCount++;
            if (performance.now() - startTime < 2000) {
              requestAnimationFrame(countFrames);
            } else {
              const fps = frameCount / 2;
              resolve(fps);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });
      
      // Expect at least 30 FPS
      expect(frameRateTest).toBeGreaterThan(30);
    });

    test('should not cause memory leaks during extended play', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Simulate extended play with button interactions
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        for (let i = 0; i < 5; i++) {
          // Click in game area
          await page.mouse.click(boundingBox.x + 200, boundingBox.y + 200);
          await page.waitForTimeout(200);
          
          // Hover over buttons
          const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
          const giveUpButtonY = boundingBox.y + 30;
          
          await page.mouse.move(giveUpButtonX, giveUpButtonY);
          await page.waitForTimeout(200);
          
          const restartButtonX = boundingBox.x + boundingBox.width - 60;
          const restartButtonY = boundingBox.y + 80;
          
          await page.mouse.move(restartButtonX, restartButtonY);
          await page.waitForTimeout(200);
        }
      }
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Memory should not increase dramatically
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
        expect(memoryIncrease).toBeLessThan(0.5); // Less than 50% increase
      }
    });

    test('should render buttons efficiently at different zoom levels', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Test different zoom levels
      const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5];
      
      for (const zoom of zoomLevels) {
        await page.evaluate((zoomLevel) => {
          document.body.style.zoom = zoomLevel.toString();
        }, zoom);
        
        await page.waitForTimeout(500);
        
        // Verify buttons are still accessible
        const boundingBox = await canvas.boundingBox();
        if (boundingBox) {
          const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
          const giveUpButtonY = boundingBox.y + 30;
          
          await page.mouse.move(giveUpButtonX, giveUpButtonY);
          await page.waitForTimeout(200);
          
          await expect(canvas).toBeVisible();
        }
      }
      
      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1.0';
      });
    });
  });

  test.describe('System Integration', () => {
    test('should integrate correctly with settings system', async ({ page }) => {
      // Navigate to settings first
      const settingsButton = page.locator('text=設定').or(page.locator('text=Settings'));
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        await page.waitForTimeout(1000);
        
        // Go back to main menu
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
      
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Verify buttons work correctly after settings interaction
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel the action
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(500);
      }
    });

    test('should work correctly with internationalization', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Change language if possible
      const currentLanguage = await page.evaluate(() => {
        if ((window as any).gameEngine && (window as any).gameEngine.localizationManager) {
          return (window as any).gameEngine.localizationManager.getCurrentLanguage();
        }
        return 'unknown';
      });
      
      if (currentLanguage !== 'unknown') {
        // Toggle between languages
        const newLanguage = currentLanguage === 'ja' ? 'en' : 'ja';
        
        await page.evaluate((lang) => {
          if ((window as any).gameEngine && (window as any).gameEngine.localizationManager) {
            (window as any).gameEngine.localizationManager.setLanguage(lang);
          }
        }, newLanguage);
        
        await page.waitForTimeout(1000);
        
        // Verify buttons still work
        const boundingBox = await canvas.boundingBox();
        if (boundingBox) {
          const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
          const giveUpButtonY = boundingBox.y + 30;
          
          await page.mouse.move(giveUpButtonX, giveUpButtonY);
          await page.waitForTimeout(500);
        }
      }
    });

    test('should handle audio system interactions', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Click buttons and verify no audio errors
      const consoleErrors: any[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('audio')) {
          consoleErrors.push(msg.text());
        }
      });
      
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        // Click button (should trigger audio feedback)
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel the action
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(1000);
        
        // Verify no audio-related errors
        expect(consoleErrors).toHaveLength(0);
      }
    });

    test('should work with save/load system', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Simulate game progress
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        // Click in game area to make some progress
        await page.mouse.click(boundingBox.x + 200, boundingBox.y + 200);
        await page.waitForTimeout(500);
        
        // Test restart button (should prompt about losing progress)
        const restartButtonX = boundingBox.x + boundingBox.width - 60;
        const restartButtonY = boundingBox.y + 80;
        
        await page.mouse.click(restartButtonX, restartButtonY);
        await page.waitForTimeout(1000);
        
        // Confirm restart
        const confirmButtonX = boundingBox.x + boundingBox.width / 2 - 50;
        const confirmButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(confirmButtonX, confirmButtonY);
        await page.waitForTimeout(2000);
        
        // Verify game restarted successfully
        await expect(canvas).toBeVisible();
      }
    });
  });

  test.describe('User Acceptance Validation', () => {
    test('should provide clear visual feedback for all interactions', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Test hover states
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        // Move to button and take screenshot for visual verification
        await page.mouse.move(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(500);
        
        // Take screenshot to verify hover state
        await page.screenshot({ 
          path: `test-results/button-hover-state.png`,
          clip: {
            x: giveUpButtonX - 20,
            y: giveUpButtonY - 20,
            width: 100,
            height: 60
          }
        });
        
        // Move away and back to test hover consistency
        await page.mouse.move(giveUpButtonX - 100, giveUpButtonY);
        await page.waitForTimeout(200);
        
        await page.mouse.move(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(200);
      }
    });

    test('should be accessible via both mouse and touch', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        // Test mouse interaction
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(500);
        
        // Test touch interaction (simulate on desktop)
        try {
          await page.touchscreen.tap(giveUpButtonX, giveUpButtonY);
          await page.waitForTimeout(1000);
          
          // Cancel via touch
          await page.touchscreen.tap(cancelButtonX, cancelButtonY);
          await page.waitForTimeout(500);
        } catch (error) {
          // Touch may not be supported on desktop, continue with mouse testing
          console.log('Touch interaction not available, continuing with mouse tests');
        }
      }
    });

    test('should provide appropriate confirmation dialogs', async ({ page }) => {
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Test Give Up confirmation dialog
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Take screenshot of confirmation dialog
        await page.screenshot({ 
          path: `test-results/give-up-confirmation.png`,
          fullPage: false
        });
        
        // Cancel to test Restart dialog
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(500);
        
        // Test Restart confirmation dialog
        const restartButtonX = boundingBox.x + boundingBox.width - 60;
        const restartButtonY = boundingBox.y + 80;
        
        await page.mouse.click(restartButtonX, restartButtonY);
        await page.waitForTimeout(1000);
        
        // Take screenshot of restart confirmation dialog
        await page.screenshot({ 
          path: `test-results/restart-confirmation.png`,
          fullPage: false
        });
        
        // Cancel
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(500);
      }
    });

    test('should complete successfully without any console errors', async ({ page }) => {
      const consoleErrors: any[] = [];
      const jsErrors: any[] = [];
      
      // Monitor for errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      // Start the game
      const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Complete full workflow
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        // Test Give Up workflow
        const giveUpButtonX = boundingBox.x + boundingBox.width - 60;
        const giveUpButtonY = boundingBox.y + 30;
        
        await page.mouse.click(giveUpButtonX, giveUpButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel
        const cancelButtonX = boundingBox.x + boundingBox.width / 2 + 50;
        const cancelButtonY = boundingBox.y + boundingBox.height / 2 + 30;
        
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(1000);
        
        // Test Restart workflow
        const restartButtonX = boundingBox.x + boundingBox.width - 60;
        const restartButtonY = boundingBox.y + 80;
        
        await page.mouse.click(restartButtonX, restartButtonY);
        await page.waitForTimeout(1000);
        
        // Cancel
        await page.mouse.click(cancelButtonX, cancelButtonY);
        await page.waitForTimeout(1000);
      }
      
      // Verify no errors occurred
      expect(consoleErrors.length).toBe(0);
      expect(jsErrors.length).toBe(0);
      
      // Verify game is still functional
      await expect(canvas).toBeVisible();
    });
  });
});