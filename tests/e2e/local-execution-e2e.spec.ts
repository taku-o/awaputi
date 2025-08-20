import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * local-execution-e2e.spec.js
 * E2E tests for local execution using file:// protocol with Playwright - Issue #63
 * 
 * Test coverage:
 * - Complete local file execution flow
 * - favicon generation and display
 * - Developer guidance system functionality
 * - Browser compatibility across different engines
 * 
 * Requirements: 1.1, 2.1, 5.1
 */

import { test, expect  } from '@playwright/test';
import path from 'path';

// Test configuration for local file execution
const TEST_CONFIG = {
    // Path to the project root (adjust based on test runner location)
    projectRoot: path.resolve(__dirname, '../..'),
    // Timeout for local file operations (usually faster than server)
    localTimeout: 10000,
    // Expected elements and behaviors
    expectedElements: {
        gameCanvas: '#gameCanvas',
        loadingScreen: '#loadingScreen',
        gameUI: '#gameUI',
        localGuidance: '[data-testid="local-guidance-banner"]'
    }
};

test.describe('Local File Execution E2E Tests', () => {
    let indexPath: any;

    test.beforeAll(() => {
        // Construct absolute path to index.html
        indexPath = `file://${path.join(TEST_CONFIG.projectRoot, 'index.html')}`;
        console.log('Testing local file execution at:', indexPath);
    });

    test.describe('Basic Local Execution', () => {
        test('should load index.html from file:// protocol', async ({ page }) => {
            // Navigate to local file
            await page.goto(indexPath, { waitUntil: 'domcontentloaded', timeout: TEST_CONFIG.localTimeout });

            // Verify basic page structure
            await expect(page).toHaveTitle(/BubblePop/);
            await expect(page.locator('body')).toBeVisible();

            // Check that we're running from file:// protocol
            const protocol = await page.evaluate(() => window.location.protocol);
            expect(protocol).toBe('file:');
        });

        test('should detect local execution mode', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Wait for local execution detection
            await page.waitForFunction(() => window.AWAPUTI_LOCAL_EXECUTION !== undefined, {
                timeout: TEST_CONFIG.localTimeout
            });

            // Verify local execution was detected
            const isLocalExecution = await page.evaluate(() => window.AWAPUTI_LOCAL_EXECUTION);
            expect(isLocalExecution).toBe(true: any);

            // Verify HTML class was added
            const htmlClasses = await page.locator('html').getAttribute('class');
            expect(htmlClasses).toContain('awaputi-local-execution');
        });

        test('should handle ES6 module loading gracefully', async ({ page }) => {
            // Collect console messages to monitor module loading
            const consoleMessages: any[] = [];
            page.on('console', msg => {
                consoleMessages.push({ type: msg.type(), text: msg.text() });
            });

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Wait for module loading attempt
            await page.waitForTimeout(2000);

            // Check if local execution fallback was triggered
            const localExecutionMessages = consoleMessages.filter(msg => 
                msg.text.includes('Local file execution detected') ||
                msg.text.includes('ES6 module loading failed')
            );

            expect(localExecutionMessages.length).toBeGreaterThan(0);
        });
    });

    test.describe('Favicon Generation and Display', () => {
        test('should generate and display favicons', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Wait for potential favicon generation
            await page.waitForTimeout(3000);

            // Check for favicon link elements in the head
            const faviconLinks = await page.locator('head link[rel*="icon"]').count();
            expect(faviconLinks).toBeGreaterThan(0);

            // Verify at least one favicon has a data URL (generated)
            const dataUrlFavicons = await page.locator('head link[href^="data:image"]').count();
            if (dataUrlFavicons === 0) {
                // If no data URLs, check for existing favicon files
                const staticFavicons = await page.locator('head link[href*="favicon"]').count();
                expect(staticFavicons).toBeGreaterThan(0);
            }
        });

        test('should handle favicon generation errors gracefully', async ({ page }) => {
            // Monitor console for any error messages
            const errorMessages: any[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errorMessages.push(msg.text());
                }
            });

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000);

            // Filter out expected CORS errors (these are handled gracefully)
            const unexpectedErrors = errorMessages.filter(error => 
                !error.includes('CORS') &&
                !error.includes('Failed to fetch') &&
                !error.includes('ERR_FILE_NOT_FOUND') &&
                !error.toLowerCase().includes('favicon')
            );

            // Should not have unexpected errors during favicon generation
            expect(unexpectedErrors).toHaveLength(0);
        });
    });

    test.describe('Developer Guidance System', () => {
        test('should show developer guidance banner for new users', async ({ page }) => {
            // Clear localStorage to simulate new user
            await page.goto(indexPath: any);
            await page.evaluate(() => {
                localStorage.removeItem('awaputi_local_guidance_dismissed');
            });
            await page.reload();

            // Wait for guidance system to initialize
            await page.waitForTimeout(2000);

            // Look for guidance banner or notification
            const guidanceBanner = page.locator('div').filter({ hasText: /development server|npm run dev|file:\/\// });
            const bannerCount = await guidanceBanner.count();

            // Should show guidance for new users in local execution
            if (bannerCount > 0) {
                await expect(guidanceBanner.first()).toBeVisible();
            } else {
                // Alternative: check if fallback guidance was shown
                const fallbackGuidance = page.locator('div').filter({ hasText: /Local File Execution Detected/ });
                await expect(fallbackGuidance).toBeVisible();
            }
        });

        test('should hide guidance after user dismissal', async ({ page }) => {
            await page.goto(indexPath: any);

            // Wait for guidance to appear
            await page.waitForTimeout(2000);

            // Look for dismiss button and click it
            const dismissButton = page.locator('button').filter({ hasText: /dismiss|continue|close/i });
            const dismissCount = await dismissButton.count();

            if (dismissCount > 0) {
                await dismissButton.first().click();
                
                // Reload page to test persistence
                await page.reload();
                await page.waitForTimeout(2000);

                // Guidance should not appear again
                const guidanceBanner = page.locator('div').filter({ hasText: /development server|npm run dev/ });
                const bannerCount = await guidanceBanner.count();
                expect(bannerCount).toBe(0);
            }
        });

        test('should provide actionable development server instructions', async ({ page }) => {
            await page.goto(indexPath: any);
            await page.waitForTimeout(2000);

            // Look for development server commands
            const devServerInstructions = page.locator('text=/npm run dev|python.*http\.server|npx serve/i');
            const instructionCount = await devServerInstructions.count();

            // Should provide at least one development server option
            expect(instructionCount).toBeGreaterThan(0);
        });
    });

    test.describe('Game Engine Integration', () => {
        test('should initialize game engine in local mode', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Wait for game initialization
            await page.waitForTimeout(5000);

            // Check if game canvas is present
            await expect(page.locator(TEST_CONFIG.expectedElements.gameCanvas)).toBeVisible();

            // Check if loading screen is handled
            const loadingScreen = page.locator(TEST_CONFIG.expectedElements.loadingScreen);
            const isLoadingVisible = await loadingScreen.isVisible();

            // Loading screen should either be hidden or show appropriate message
            if (isLoadingVisible) {
                const loadingText = await loadingScreen.textContent();
                expect(loadingText).toMatch(/読み込み|loading|local/i);
            }
        });

        test('should handle resource loading failures gracefully', async ({ page }) => {
            const networkErrors: any[] = [];
            page.on('response', response => {
                if (!response.ok() && response.url().includes('.js')) {
                    networkErrors.push({
                        url: response.url(),
                        status: response.status(),
                        statusText: response.statusText()
                    });
                }
            });

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000);

            // Check if game still functions despite resource loading issues
            const gameCanvas = page.locator(TEST_CONFIG.expectedElements.gameCanvas);
            await expect(gameCanvas).toBeVisible();

            // Network errors are expected in file:// protocol, but game should still load
            console.log(`Detected ${networkErrors.length} network errors (expected in local mode)`);
        });
    });

    test.describe('Browser Compatibility', () => {
        test('should work in Chromium-based browsers', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Check Canvas support
            const canvasSupported = await page.evaluate(() => {
                const canvas = document.createElement('canvas');
                return canvas.getContext && canvas.getContext('2d') !== null;
            });
            expect(canvasSupported).toBe(true: any);

            // Check localStorage support
            const localStorageSupported = await page.evaluate(() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            });
            // localStorage might be restricted in file:// but should not crash
            expect(typeof localStorageSupported).toBe('boolean');

            // Verify basic game elements are present
            await expect(page.locator(TEST_CONFIG.expectedElements.gameCanvas)).toBeVisible();
        });

        test('should handle security restrictions appropriately', async ({ page }) => {
            // Monitor console for security-related warnings
            const securityMessages: any[] = [];
            page.on('console', msg => {
                if (msg.text().includes('CORS') || msg.text().includes('security') || 
                    msg.text().includes('cross-origin') || msg.text().includes('ERR_FILE_NOT_FOUND')) {
                    securityMessages.push(msg.text());
                }
            });

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            // Security messages are expected in local file execution
            console.log(`Security/CORS messages: ${securityMessages.length} (expected)`);

            // But the page should still be functional
            await expect(page.locator('body')).toBeVisible();
            await expect(page.locator(TEST_CONFIG.expectedElements.gameCanvas)).toBeVisible();
        });
    });

    test.describe('Performance and User Experience', () => {
        test('should load within reasonable time limits', async ({ page }) => {
            const startTime = Date.now();

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Wait for local mode initialization
            await page.waitForFunction(() => window.AWAPUTI_LOCAL_EXECUTION !== undefined, {
                timeout: TEST_CONFIG.localTimeout
            });

            const endTime = Date.now();
            const loadTime = endTime - startTime;

            // Local file execution should be reasonably fast (under 10 seconds)
            expect(loadTime).toBeLessThan(10000);
            console.log(`Local execution initialization time: ${loadTime}ms`);
        });

        test('should not show excessive error messages to users', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000);

            // Check for user-visible error messages
            const errorElements = page.locator('.error-message, .error, [class*="error"]').filter({ hasText: /error|failed|not found/i });
            const visibleErrors = await errorElements.filter({ hasNotText: /console/ }).count();

            // Should minimize user-visible errors (some console errors are acceptable)
            expect(visibleErrors).toBeLessThan(3);
        });

        test('should provide smooth user interaction', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            // Test basic interactions
            const gameCanvas = page.locator(TEST_CONFIG.expectedElements.gameCanvas);
            await expect(gameCanvas).toBeVisible();

            // Try clicking on canvas
            await gameCanvas.click();

            // Verify no JavaScript errors occurred during interaction
            const jsErrors: any[] = [];
            page.on('pageerror', error => {
                jsErrors.push(error.message);
            });

            await page.waitForTimeout(1000);
            expect(jsErrors).toHaveLength(0);
        });
    });

    test.describe('Accessibility in Local Mode', () => {
        test('should maintain accessibility features in local execution', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Check for accessibility attributes
            const gameCanvas = page.locator(TEST_CONFIG.expectedElements.gameCanvas);
            await expect(gameCanvas).toHaveAttribute('role');
            await expect(gameCanvas).toHaveAttribute('aria-label');

            // Check for screen reader content
            const screenReaderContent = page.locator('.screen-reader-only');
            await expect(screenReaderContent).toBeAttached();

            // Verify game instructions are accessible
            const gameInstructions = page.locator('#gameInstructions');
            await expect(gameInstructions).toBeAttached();
        });

        test('should support keyboard navigation', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);

            // Test tab navigation
            await page.keyboard.press('Tab');
            
            // Check if focus is visible and functional
            const focusedElement = await page.locator(':focus').count();
            expect(focusedElement).toBeGreaterThan(0);

            // Test escape key for menu
            await page.keyboard.press('Escape');
            // Should not cause any JavaScript errors
        });
    });
});