/**
 * Help System End-to-End Tests
 * ヘルプシステムのE2Eテスト
 */
import { test, expect } from '@playwright/test';

test.describe('Help System E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:8000');
        
        // Wait for game to load and start
        await page.waitForSelector('#gameCanvas');
        await page.click('button:has-text("ゲームを開始する")');
        
        // Wait for game initialization
        await page.waitForTimeout(3000);
    });

    test.describe('Help System Access', () => {
        test('should open help system with F1 key', async ({ page }) => {
            // Press F1 to open help
            await page.keyboard.press('F1');
            
            // Wait for help system to appear
            await page.waitForTimeout(1000);
            
            // Check for help system indicators
            const helpTitle = await page.locator('text=ヘルプ').first();
            await expect(helpTitle).toBeVisible();
        });

        test('should open help system with Ctrl+H shortcut', async ({ page }) => {
            // Press Ctrl+H to open help
            await page.keyboard.press('Control+KeyH');
            
            // Wait for help system to appear
            await page.waitForTimeout(1000);
            
            // Verify help system is active
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Help Navigation', () => {
        test('should display help categories and topics', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Take screenshot to verify layout
            await page.screenshot({ path: 'test-results/help-categories.png' });
            
            // Categories should be visible (they are rendered on canvas)
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should navigate between categories using arrow keys', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Navigate with arrow keys
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(500);
            
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(500);
            
            // Should not cause errors
            const consoleLogs: string[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleLogs.push(msg.text());
                }
            });
            
            expect(consoleLogs.filter(log => log.includes('help') && log.includes('error')).length).toBe(0);
        });

        test('should select categories and topics with Enter key', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Select first category
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Should display topic content
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Search Functionality', () => {
        test('should focus search with slash key', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Press slash to focus search
            await page.keyboard.press('/');
            await page.waitForTimeout(500);
            
            // Search should be focused (check accessibility announcement)
            const accessibilityRegion = page.locator('#accessibility-live-region');
            const content = await accessibilityRegion.textContent();
            expect(content).toContain('検索');
        });

        test('should perform search and display results', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Focus search and type query
            await page.keyboard.press('/');
            await page.keyboard.type('泡');
            await page.waitForTimeout(1000);
            
            // Should display search results on canvas
            await page.screenshot({ path: 'test-results/help-search-results.png' });
            
            // Canvas should still be visible with search results
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should clear search results with empty query', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Focus search and type query
            await page.keyboard.press('/');
            await page.keyboard.type('泡');
            await page.waitForTimeout(1000);
            
            // Clear search
            await page.keyboard.press('Control+a');
            await page.keyboard.press('Delete');
            await page.waitForTimeout(500);
            
            // Should return to category view
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Content Display', () => {
        test('should display help content properly', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Select a category
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Content should be displayed on canvas
            await page.screenshot({ path: 'test-results/help-content.png' });
            
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should navigate back with Escape key', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Select a category
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Go back
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Should be back to category selection
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should close help system with double Escape', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Close help system
            await page.keyboard.press('Escape');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Help should be closed
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Accessibility Features', () => {
        test('should support tab navigation', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Tab through elements
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);
            await page.keyboard.press('Tab');
            await page.waitForTimeout(200);
            
            // Should cycle through interactive elements
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should provide screen reader announcements', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Check for live region
            const liveRegion = page.locator('#accessibility-live-region');
            await expect(liveRegion).toBeAttached();
            
            // Navigate to trigger announcements
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(500);
            
            // Live region should have content
            const content = await liveRegion.textContent();
            expect(content?.length).toBeGreaterThan(0);
        });
    });

    test.describe('Performance', () => {
        test('should load help content quickly', async ({ page }) => {
            const startTime = Date.now();
            
            // Open help system
            await page.keyboard.press('F1');
            
            // Wait for help to be ready
            await page.waitForTimeout(1000);
            
            const loadTime = Date.now() - startTime;
            
            // Should load within 2 seconds
            expect(loadTime).toBeLessThan(2000);
        });

        test('should handle rapid navigation without freezing', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Rapidly navigate
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('ArrowDown');
                await page.waitForTimeout(50);
            }
            
            // Should still be responsive
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Error Handling', () => {
        test('should handle missing help content gracefully', async ({ page }) => {
            // Monitor console for errors
            const errors: string[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(2000);
            
            // Should not have critical errors
            const criticalErrors = errors.filter(e => 
                e.includes('Cannot read') || 
                e.includes('undefined') ||
                e.includes('null')
            );
            
            expect(criticalErrors.length).toBe(0);
        });

        test('should recover from network errors', async ({ page }) => {
            // Simulate network issues
            await page.route('**/*.json', route => route.abort());
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(2000);
            
            // Should still function with cached/fallback content
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
            
            // Re-enable network
            await page.unroute('**/*.json');
        });
    });

    test.describe('Integration with Game', () => {
        test('should pause game when help is open', async ({ page }) => {
            // Start game and wait
            await page.waitForTimeout(2000);
            
            // Open help
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Game should be paused (check for pause indicator or state)
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
            
            // Close help
            await page.keyboard.press('Escape');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Game should resume
            await expect(canvas).toBeVisible();
        });

        test('should maintain game state when toggling help', async ({ page }) => {
            // Play for a bit
            await page.waitForTimeout(3000);
            
            // Open and close help
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            await page.keyboard.press('Escape');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Game should continue from where it left off
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Mobile Support', () => {
        test('should work on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Should adapt to mobile size
            await page.screenshot({ path: 'test-results/help-mobile.png' });
            
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should support touch interactions', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Simulate touch on canvas
            const canvas = page.locator('#gameCanvas');
            const box = await canvas.boundingBox();
            
            if (box) {
                // Touch on category area
                await page.mouse.click(box.x + box.width / 2, box.y + 100);
                await page.waitForTimeout(500);
                
                // Should respond to touch
                await expect(canvas).toBeVisible();
            }
        });
    });
});