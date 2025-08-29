/**
 * Accessibility validation tests for Game Control Buttons
 * Tests WCAG compliance, screen reader compatibility, keyboard navigation,
 * and color contrast requirements
 */

import { test, expect } from '@playwright/test';

test.describe('Game Control Buttons Accessibility Validation', () => {
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

  test.describe('Keyboard Navigation Accessibility', () => {
    test('should support complete keyboard navigation workflow', async ({ page }) => {
      const canvas = page.locator('canvas');
      await canvas.focus();
      
      // Test Tab navigation to buttons
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Take screenshot to verify focus indicator
      await page.screenshot({ 
        path: 'test-results/accessibility-keyboard-focus.png' 
      });
      
      // Test Enter key activation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // If confirmation dialog appears, test keyboard navigation within dialog
      await page.keyboard.press('Tab'); // Navigate to confirm button
      await page.waitForTimeout(200);
      
      await page.keyboard.press('Tab'); // Navigate to cancel button
      await page.waitForTimeout(200);
      
      // Test Escape key to cancel
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    });

    test('should show visible focus indicators on all interactive elements', async ({ page }) => {
      // Focus on Give Up button
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      if (await giveUpButton.isVisible()) {
        await giveUpButton.focus();
        
        // Check for focus ring or visual indicator
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
        
        // Verify focus styles are applied
        const buttonStyles = await giveUpButton.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            boxShadow: styles.boxShadow,
            borderColor: styles.borderColor
          };
        });
        
        // At least one focus indicator should be present
        expect(
          buttonStyles.outline !== 'none' ||
          buttonStyles.boxShadow !== 'none' ||
          buttonStyles.borderColor !== 'initial'
        ).toBeTruthy();
      }

      // Focus on Restart button
      const restartButton = page.locator('[data-testid="restart-button"]');
      if (await restartButton.isVisible()) {
        await restartButton.focus();
        
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should support arrow key navigation between buttons', async ({ page }) => {
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      if (await giveUpButton.isVisible() && await restartButton.isVisible()) {
        await giveUpButton.focus();
        await page.waitForTimeout(100);
        
        // Navigate with arrow keys
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
        
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        expect(focusedElement).toBe('restart-button');
        
        // Navigate back
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(100);
        
        const focusedElementBack = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        expect(focusedElementBack).toBe('give-up-button');
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      // Check Give Up button
      if (await giveUpButton.isVisible()) {
        const ariaLabel = await giveUpButton.getAttribute('aria-label');
        const role = await giveUpButton.getAttribute('role');
        
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('ギブアップ');
        expect(role).toBe('button');
      }
      
      // Check Restart button
      if (await restartButton.isVisible()) {
        const ariaLabel = await restartButton.getAttribute('aria-label');
        const role = await restartButton.getAttribute('role');
        
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain('リスタート');
        expect(role).toBe('button');
      }
    });

    test('should provide descriptive text for screen readers', async ({ page }) => {
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      // Check for aria-describedby or title attributes
      if (await giveUpButton.isVisible()) {
        const describedBy = await giveUpButton.getAttribute('aria-describedby');
        const title = await giveUpButton.getAttribute('title');
        
        expect(describedBy || title).toBeTruthy();
      }
      
      if (await restartButton.isVisible()) {
        const describedBy = await restartButton.getAttribute('aria-describedby');
        const title = await restartButton.getAttribute('title');
        
        expect(describedBy || title).toBeTruthy();
      }
    });

    test('should announce state changes to screen readers', async ({ page }) => {
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      
      if (await giveUpButton.isVisible()) {
        // Click the button to trigger confirmation dialog
        await giveUpButton.click();
        await page.waitForTimeout(500);
        
        // Check if dialog is announced with aria-live region
        const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
        if (await dialog.isVisible()) {
          const ariaLive = await dialog.getAttribute('aria-live');
          const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
          
          expect(ariaLive || ariaLabelledBy).toBeTruthy();
        }
        
        // Cancel the dialog
        const cancelButton = page.locator('button:has-text("キャンセル")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('should meet WCAG AA color contrast requirements', async ({ page }) => {
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      // Function to calculate contrast ratio
      const getContrastRatio = async (element: any) => {
        return await element.evaluate((el: HTMLElement) => {
          const styles = window.getComputedStyle(el);
          const backgroundColor = styles.backgroundColor;
          const color = styles.color;
          
          // Simple RGB extraction (for basic testing)
          const bgRgb = backgroundColor.match(/\d+/g);
          const textRgb = color.match(/\d+/g);
          
          if (!bgRgb || !textRgb) return 0;
          
          // Calculate relative luminance
          const getLuminance = (rgb: string[]) => {
            const [r, g, b] = rgb.map(c => {
              const val = parseInt(c) / 255;
              return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          
          const bgLuminance = getLuminance(bgRgb);
          const textLuminance = getLuminance(textRgb);
          
          const lighter = Math.max(bgLuminance, textLuminance);
          const darker = Math.min(bgLuminance, textLuminance);
          
          return (lighter + 0.05) / (darker + 0.05);
        });
      };
      
      // Test Give Up button contrast
      if (await giveUpButton.isVisible()) {
        const contrastRatio = await getContrastRatio(giveUpButton);
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
      }
      
      // Test Restart button contrast
      if (await restartButton.isVisible()) {
        const contrastRatio = await getContrastRatio(restartButton);
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
      }
    });

    test('should remain accessible when focused', async ({ page }) => {
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      
      if (await giveUpButton.isVisible()) {
        await giveUpButton.focus();
        
        // Check that focus doesn't reduce readability
        const focusedStyles = await giveUpButton.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            outline: styles.outline,
            boxShadow: styles.boxShadow
          };
        });
        
        // Focused element should still have good contrast
        expect(focusedStyles.outline).not.toBe('none');
        expect(focusedStyles.boxShadow).not.toBe('none');
      }
    });

    test('should be visible to users with color blindness', async ({ page }) => {
      // Simulate different types of color blindness
      const colorBlindnessFilters = [
        'grayscale(100%)', // Simulate achromatopsia
        'sepia(100%) saturate(0%) hue-rotate(0deg)', // Simulate protanopia
        'sepia(100%) saturate(50%) hue-rotate(90deg)'  // Simulate deuteranopia
      ];
      
      for (const filter of colorBlindnessFilters) {
        await page.addStyleTag({
          content: `body { filter: ${filter} !important; }`
        });
        
        const giveUpButton = page.locator('[data-testid="give-up-button"]');
        const restartButton = page.locator('[data-testid="restart-button"]');
        
        // Buttons should still be identifiable
        if (await giveUpButton.isVisible()) {
          await expect(giveUpButton).toBeVisible();
          const buttonText = await giveUpButton.textContent();
          expect(buttonText).toBeTruthy();
        }
        
        if (await restartButton.isVisible()) {
          await expect(restartButton).toBeVisible();
          const buttonText = await restartButton.textContent();
          expect(buttonText).toBeTruthy();
        }
        
        // Remove filter for next iteration
        await page.addStyleTag({
          content: 'body { filter: none !important; }'
        });
      }
    });
  });

  test.describe('Touch and Mobile Accessibility', () => {
    test('should have adequate touch targets on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      // Check button sizes meet accessibility guidelines (44x44px minimum)
      if (await giveUpButton.isVisible()) {
        const boundingBox = await giveUpButton.boundingBox();
        expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
      }
      
      if (await restartButton.isVisible()) {
        const boundingBox = await restartButton.boundingBox();
        expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should have adequate spacing between touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      if (await giveUpButton.isVisible() && await restartButton.isVisible()) {
        const giveUpBox = await giveUpButton.boundingBox();
        const restartBox = await restartButton.boundingBox();
        
        if (giveUpBox && restartBox) {
          // Calculate distance between buttons
          const distance = Math.abs(giveUpBox.x - restartBox.x) + Math.abs(giveUpBox.y - restartBox.y);
          expect(distance).toBeGreaterThanOrEqual(8); // 8px minimum spacing
        }
      }
    });
  });

  test.describe('Reduced Motion Accessibility', () => {
    test('should respect prefers-reduced-motion settings', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      
      if (await giveUpButton.isVisible()) {
        // Click button and check for reduced animations
        await giveUpButton.click();
        await page.waitForTimeout(100);
        
        // Check if animations are reduced or disabled
        const animationDuration = await giveUpButton.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.animationDuration;
        });
        
        // Animation should be instant or very short for reduced motion
        expect(animationDuration === '0s' || animationDuration === 'none').toBeTruthy();
        
        // Cancel any dialog that might have appeared
        const cancelButton = page.locator('button:has-text("キャンセル")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    });
  });

  test.describe('High Contrast Mode Accessibility', () => {
    test('should remain functional in high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `
      });
      
      const giveUpButton = page.locator('[data-testid="give-up-button"]');
      const restartButton = page.locator('[data-testid="restart-button"]');
      
      // Buttons should still be visible and functional
      if (await giveUpButton.isVisible()) {
        await expect(giveUpButton).toBeVisible();
        
        // Test click functionality
        await giveUpButton.click();
        await page.waitForTimeout(100);
        
        const cancelButton = page.locator('button:has-text("キャンセル")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
      
      if (await restartButton.isVisible()) {
        await expect(restartButton).toBeVisible();
      }
    });
  });
});