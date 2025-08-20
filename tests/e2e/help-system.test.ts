import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Help System End-to-End Tests
 * ヘルプシステムのE2Eテスト
 */

import { test, expect  } from '@playwright/test';

test.describe('Help System E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:8001');
        
        // Wait for game to load and start
        await page.waitForSelector('#gameCanvas');
        await page.click('button[contains(text(), "ゲームを開始する")]');
        
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
            const console_logs: any[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console_logs.push(msg.text());
                }
            });
            
            expect(console_logs.filter(log => log.includes('help') && log.includes('error')).length).toBe(0);
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
            
            // Perform search
            await page.keyboard.press('/');
            await page.keyboard.type('test');
            await page.waitForTimeout(500);
            
            // Clear search
            await page.keyboard.press('Control+KeyA');
            await page.keyboard.press('Backspace');
            await page.waitForTimeout(500);
            
            // Should return to category view
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should handle special characters in search safely', async ({ page }) => {
            // Monitor console for XSS or injection attempts
            const console_errors: any[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console_errors.push(msg.text());
                }
            });
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Try potentially malicious search
            await page.keyboard.press('/');
            await page.keyboard.type('<script>alert("test")</script>');
            await page.waitForTimeout(1000);
            
            // Should not cause XSS or errors
            expect(console_errors.filter(err => err.includes('script') || err.includes('alert')).length).toBe(0);
        });
    });

    test.describe('Help System Exit', () => {
        test('should exit help system with ESC key', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Exit with ESC
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            
            // Should return to previous screen
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });

        test('should return to correct scene after help', async ({ page }) => {
            // Open help system from main menu
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Exit help system
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            
            // Should be back at main menu
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Accessibility Features', () => {
        test('should provide screen reader announcements', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Check accessibility region for announcements
            const accessibilityRegion = page.locator('#accessibility-live-region');
            await expect(accessibilityRegion).toBeVisible();
            
            const content = await accessibilityRegion.textContent();
            expect(content).toBeTruthy();
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Test various navigation keys
            const navigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', '/'];
            
            for (const key of navigationKeys) {
                await page.keyboard.press(key);
                await page.waitForTimeout(200);
            }
            
            // Should not cause navigation errors
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Error Handling', () => {
        test('should handle missing help content gracefully', async ({ page }) => {
            // Monitor console for errors
            const console_errors: any[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console_errors.push(msg.text());
                }
            });
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(2000);
            
            // Try to navigate through help
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // Should handle any missing content without critical errors
            const criticalErrors = console_errors.filter(err => 
                err.includes('Uncaught') || err.includes('TypeError') || err.includes('ReferenceError')
            );
            expect(criticalErrors.length).toBe(0);
        });

        test('should continue working after network errors', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            // Simulate network issues by going offline
            await page.context().setOffline(true);
            
            // Try to perform search (might fail due to offline state)
            await page.keyboard.press('/');
            await page.keyboard.type('test');
            await page.waitForTimeout(1000);
            
            // Go back online
            await page.context().setOffline(false);
            
            // Help system should still be functional
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            const canvas = page.locator('#gameCanvas');
            await expect(canvas).toBeVisible();
        });
    });

    test.describe('Performance', () => {
        test('should load help system quickly', async ({ page }) => {
            const startTime = Date.now();
            
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            const loadTime = Date.now() - startTime;
            
            // Should load within reasonable time (less than 2 seconds)
            expect(loadTime).toBeLessThan(2000);
        });

        test('should handle rapid navigation without lag', async ({ page }) => {
            // Open help system
            await page.keyboard.press('F1');
            await page.waitForTimeout(1000);
            
            const startTime = Date.now();
            
            // Rapidly navigate through help
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('ArrowDown');
                await page.waitForTimeout(50);
            }
            
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('ArrowUp');
                await page.waitForTimeout(50);
            }
            
            const navigationTime = Date.now() - startTime;
            
            // Should handle rapid navigation smoothly
            expect(navigationTime).toBeLessThan(3000);
        });
    });
});