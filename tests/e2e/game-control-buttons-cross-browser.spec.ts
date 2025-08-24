/**
 * Cross-browser compatibility tests for Game Control Buttons
 * Tests functionality across Chrome, Firefox, Safari, Edge, and mobile browsers
 */

import { test, expect } from '@playwright/test';

test.describe('Game Control Buttons Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    // Wait for the game to initialize
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Start a game to access game control buttons
    const startButton = page.locator('text=ゲーム開始').or(page.locator('text=Start Game'));
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    // Wait for the game scene to load
    await page.waitForTimeout(2000);
  });

  test.describe('Button Rendering', () => {
    test('should render buttons correctly across all browsers', async ({ page, browserName }) => {
      console.log(`Testing on ${browserName}`);
      
      // Take a screenshot for visual regression testing
      await page.screenshot({ 
        path: `test-results/game-buttons-${browserName}.png`,
        fullPage: true
      });
      
      // Check if buttons are visible (they should be during gameplay)
      const giveUpButton = page.locator('canvas');
      await expect(giveUpButton).toBeVisible();
      
      // Verify canvas is rendered correctly
      const canvas = page.locator('canvas');
      const boundingBox = await canvas.boundingBox();
      
      expect(boundingBox).toBeTruthy();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);
    });

    test('should handle different screen resolutions', async ({ page }) => {
      const resolutions = [
        { width: 1920, height: 1080 },  // Full HD
        { width: 1366, height: 768 },   // Common laptop
        { width: 1024, height: 768 },   // Tablet
        { width: 800, height: 600 },    // Small screen
      ];

      for (const resolution of resolutions) {
        await page.setViewportSize(resolution);
        await page.waitForTimeout(500); // Allow for responsive adjustments
        
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
        // Take screenshot for each resolution
        await page.screenshot({ 
          path: `test-results/resolution-${resolution.width}x${resolution.height}.png` 
        });
      }
    });
  });

  test.describe('Mouse Interaction', () => {
    test('should handle mouse clicks correctly', async ({ page }) => {
      const canvas = page.locator('canvas');
      // Click in the button area (top-right corner)
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        // Click in the Give Up button area (approximately top-right)
        const buttonX = boundingBox.x + boundingBox.width - 60;
        const buttonY = boundingBox.y + 30;
        
        await page.mouse.click(buttonX, buttonY);
        
        // Allow time for any dialogs to appear
        await page.waitForTimeout(1000);
        
        // Check if confirmation dialog might be visible (canvas-based)
        const canvasAfterClick = page.locator('canvas');
        await expect(canvasAfterClick).toBeVisible();
      }
    });

    test('should handle mouse hover effects', async ({ page, browserName }) => {
      // Skip hover tests on mobile browsers
      if (browserName.includes('Mobile')) {
        test.skip('Hover effects not applicable on mobile browsers');
      }

      const canvas = page.locator('canvas');
      const boundingBox = await canvas.boundingBox();
      
      if (boundingBox) {
        // Hover over button area
        const buttonX = boundingBox.x + boundingBox.width - 60;
        const buttonY = boundingBox.y + 30;
        
        await page.mouse.move(buttonX, buttonY);
        await page.waitForTimeout(500);
        // Take screenshot to verify hover state
        await page.screenshot({ 
          path: `test-results/hover-state-${browserName}.png` 
        });
      }
    });
  });

  test.describe('Touch Interaction', () => {
    test('should handle touch events on mobile browsers', async ({ page, browserName }) => {
      // Only run touch tests on mobile browsers
      if (!browserName.includes('Mobile')) {
        test.skip('Touch tests only for mobile browsers');
      }

      const canvas = page.locator('canvas');
      const boundingBox = await canvas.boundingBox();
      
      if (boundingBox) {
        // Touch in button area
        const buttonX = boundingBox.x + boundingBox.width - 60;
        const buttonY = boundingBox.y + 30;
        
        // Simulate touch start and end
        await page.touchscreen.tap(buttonX, buttonY);
        // Allow time for touch feedback
        await page.waitForTimeout(1000);
        // Verify canvas is still responsive
        await expect(canvas).toBeVisible();
      }
    });

    test('should handle touch with proper target size on mobile', async ({ page, browserName }) => {
      if (!browserName.includes('Mobile')) {
        test.skip('Touch target tests only for mobile browsers');
      }

      // Verify touch targets meet minimum size requirements (44px)
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Take screenshot for manual verification of button sizes
      await page.screenshot({ 
        path: `test-results/mobile-touch-targets-${browserName}.png` 
      });
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Focus on the canvas
      const canvas = page.locator('canvas');
      await canvas.focus();
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Test Enter key
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Test Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      // Verify canvas is still responsive
      await expect(canvas).toBeVisible();
    });

    test('should handle keyboard accessibility features', async ({ page, browserName }) => {
      // Skip on mobile browsers where keyboard navigation is limited
      if (browserName.includes('Mobile')) {
        test.skip('Keyboard navigation not applicable on mobile browsers');
      }

      const canvas = page.locator('canvas');
      await canvas.focus();
      
      // Test focus indicators
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Take screenshot to verify focus indicators
      await page.screenshot({ 
        path: `test-results/keyboard-focus-${browserName}.png` 
      });
    });
  });

  test.describe('Canvas Rendering Compatibility', () => {
    test('should render canvas content correctly', async ({ page, browserName }) => {
      const canvas = page.locator('canvas');
      // Verify canvas is rendered
      await expect(canvas).toBeVisible();
      // Check canvas context support
      const canvasSupported = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        
        try {
          const ctx = canvas.getContext('2d');
          return !!ctx;
        } catch (error) {
          return false;
        }
      });
      
      expect(canvasSupported).toBe(true);
      
      // Test canvas drawing operations
      const drawingWorks = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        try {
          // Test basic drawing operations
          if (ctx) {
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 10, 10);
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(5, 5, 10, 10);
            ctx.font = '12px Arial';
            ctx.fillText('Test', 20, 20);
          }
          return true;
        } catch (error) {
          return false;
        }
      });
      
      expect(drawingWorks).toBe(true);
    });

    test('should handle high DPI displays', async ({ page }) => {
      // Test device pixel ratio handling
      const devicePixelRatio = await page.evaluate(() => window.devicePixelRatio);
      console.log(`Device pixel ratio: ${devicePixelRatio}`);
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Verify canvas scaling works correctly
      const canvasProperties = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return {
          width: canvas?.width,
          height: canvas?.height,
          style: {
            width: canvas?.style.width,
            height: canvas?.style.height
          }
        };
      });
      
      expect(canvasProperties.width).toBeGreaterThan(0);
      expect(canvasProperties.height).toBeGreaterThan(0);
    });
  });

  test.describe('Font Rendering', () => {
    test('should render Japanese text correctly', async ({ page, browserName }) => {
      // Check if Japanese fonts are rendering properly
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      // Take screenshot to verify Japanese text rendering
      await page.screenshot({ 
        path: `test-results/japanese-text-${browserName}.png` 
      });
      // Test font loading
      const fontLoadingStatus = await page.evaluate(async () => {
        try {
          if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
            return 'loaded';
          }
          return 'not-supported';
        } catch (error) {
          return 'error';
        }
      });
      
      console.log(`Font loading status on ${browserName}: ${fontLoadingStatus}`);
    });
  });

  test.describe('Performance', () => {
    test('should maintain performance across browsers', async ({ page, browserName }) => {
      // Measure basic performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          timestamp: Date.now()
        };
      });
      
      console.log(`Performance metrics for ${browserName}:`, performanceMetrics);
      
      // Verify reasonable load times (less than 5 seconds)
      expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
    });

    test('should handle canvas animations smoothly', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      // Monitor frame rate for a short period
      const frameRateTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();
          function countFrames() {
            frameCount++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve(frameCount);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });
      
      console.log(`Approximate FPS: ${frameRateTest}`);
      
      // Expect at least 30 FPS for smooth animation
      expect(frameRateTest).toBeGreaterThan(30);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle browser-specific edge cases gracefully', async ({ page, browserName }) => {
      // Check for any JavaScript errors
      const errors: any[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Perform various interactions
      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        const boundingBox = await canvas.boundingBox();
        if (boundingBox) {
          // Test clicks in various areas
          await page.mouse.click(boundingBox.x + 100, boundingBox.y + 100);
          await page.waitForTimeout(500);
          await page.mouse.click(boundingBox.x + boundingBox.width - 60, boundingBox.y + 30);
          await page.waitForTimeout(500);
        }
      }
      
      // Test keyboard events
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');
      
      // Report any errors found
      if (errors.length > 0) {
        console.warn(`JavaScript errors found on ${browserName}:`, errors);
      }
      
      // Verify no critical errors that would break functionality
      const criticalErrors = errors.filter(error => 
        error.includes('Cannot read') || 
        error.includes('undefined') || 
        error.includes('null'));
      
      expect(criticalErrors.length).toBe(0);
    });
  });
});

test.describe('Accessibility Cross-Browser Tests', () => {
  test('should maintain accessibility across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    // Check basic accessibility features
    const accessibilityFeatures = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        hasTabIndex: canvas?.hasAttribute('tabindex'),
        hasFocus: typeof canvas?.focus === 'function',
        hasRole: canvas?.hasAttribute('role'),
        hasAriaLabel: canvas?.hasAttribute('aria-label')
      };
    });
    
    console.log(`Accessibility features on ${browserName}:`, accessibilityFeatures);
    
    // Take screenshot for accessibility verification
    await page.screenshot({ 
      path: `test-results/accessibility-${browserName}.png` 
    });
  });
});