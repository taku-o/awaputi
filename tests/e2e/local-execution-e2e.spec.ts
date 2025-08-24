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

import { test, expect } from '@playwright/test';
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
    let indexPath: string;

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
            await page.waitForFunction(() => (window as any).AWAPUTI_LOCAL_EXECUTION !== undefined, {
                timeout: TEST_CONFIG.localTimeout
            });

            // Verify local execution was detected
            const isLocalExecution = await page.evaluate(() => (window as any).AWAPUTI_LOCAL_EXECUTION);
            expect(isLocalExecution).toBe(true);

            // Verify HTML class was added
            const htmlClasses = await page.locator('html').getAttribute('class');
            expect(htmlClasses).toContain('awaputi-local-execution');
        });

        test('should handle ES6 module loading gracefully', async ({ page }) => {
            // Collect console messages to monitor module loading
            const consoleMessages: { type: string; text: string }[] = [];
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
            expect(dataUrlFavicons).toBeGreaterThan(0);
        });

        test('should generate correct favicon sizes', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            // Check specific favicon sizes
            const favicon16 = await page.locator('link[sizes="16x16"]').count();
            const favicon32 = await page.locator('link[sizes="32x32"]').count();
            const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').count();

            expect(favicon16).toBeGreaterThan(0);
            expect(favicon32).toBeGreaterThan(0);
            expect(appleTouchIcon).toBeGreaterThan(0);
        });
    });

    test.describe('Developer Guidance System', () => {
        test('should show local execution guidance banner', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            
            // Wait for guidance banner
            await page.waitForSelector(TEST_CONFIG.expectedElements.localGuidance, {
                timeout: TEST_CONFIG.localTimeout
            });

            // Verify banner is visible
            const banner = page.locator(TEST_CONFIG.expectedElements.localGuidance);
            await expect(banner).toBeVisible();

            // Check banner content
            const bannerText = await banner.textContent();
            expect(bannerText).toContain('local file');
        });

        test('should allow dismissing guidance banner', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            
            // Wait for guidance banner
            await page.waitForSelector(TEST_CONFIG.expectedElements.localGuidance);

            // Find and click dismiss button
            const dismissButton = page.locator('[data-testid="dismiss-guidance"]');
            await expect(dismissButton).toBeVisible();
            await dismissButton.click();

            // Verify banner is hidden
            await expect(page.locator(TEST_CONFIG.expectedElements.localGuidance)).toBeHidden();
        });

        test('should remember guidance dismissal', async ({ page }) => {
            // First visit - dismiss banner
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector(TEST_CONFIG.expectedElements.localGuidance);
            await page.click('[data-testid="dismiss-guidance"]');

            // Reload page
            await page.reload({ waitUntil: 'domcontentloaded' });

            // Banner should not appear
            await page.waitForTimeout(2000);
            const bannerVisible = await page.locator(TEST_CONFIG.expectedElements.localGuidance).isVisible();
            expect(bannerVisible).toBe(false);
        });
    });

    test.describe('Game Functionality in Local Mode', () => {
        test('should initialize game engine', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            
            // Wait for game initialization
            await page.waitForFunction(() => (window as any).gameEngine !== undefined, {
                timeout: TEST_CONFIG.localTimeout
            });

            // Verify game engine is initialized
            const gameEngineInitialized = await page.evaluate(() => {
                return (window as any).gameEngine && typeof (window as any).gameEngine.init === 'function';
            });
            expect(gameEngineInitialized).toBe(true);
        });

        test('should display game canvas', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            
            // Wait for canvas
            await page.waitForSelector(TEST_CONFIG.expectedElements.gameCanvas, {
                timeout: TEST_CONFIG.localTimeout
            });

            // Verify canvas is visible and has dimensions
            const canvas = page.locator(TEST_CONFIG.expectedElements.gameCanvas);
            await expect(canvas).toBeVisible();

            const dimensions = await canvas.boundingBox();
            expect(dimensions?.width).toBeGreaterThan(0);
            expect(dimensions?.height).toBeGreaterThan(0);
        });

        test('should handle local storage in file:// protocol', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Test localStorage availability
            const localStorageAvailable = await page.evaluate(() => {
                try {
                    const testKey = '__awaputi_test__';
                    localStorage.setItem(testKey, 'test');
                    const result = localStorage.getItem(testKey) === 'test';
                    localStorage.removeItem(testKey);
                    return result;
                } catch {
                    return false;
                }
            });

            expect(localStorageAvailable).toBe(true);
        });
    });

    test.describe('Cross-Browser Compatibility', () => {
        test('should work in Chromium-based browsers', async ({ page, browserName }) => {
            test.skip(browserName !== 'chromium', 'Chromium-only test');
            
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector(TEST_CONFIG.expectedElements.gameCanvas);
            
            // Chromium-specific checks
            const hasChromiumFeatures = await page.evaluate(() => {
                return 'chrome' in window || 'opr' in window;
            });
            
            // Should work regardless of Chromium features
            await expect(page.locator(TEST_CONFIG.expectedElements.gameCanvas)).toBeVisible();
        });

        test('should work in Firefox', async ({ page, browserName }) => {
            test.skip(browserName !== 'firefox', 'Firefox-only test');
            
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector(TEST_CONFIG.expectedElements.gameCanvas);
            
            // Firefox-specific checks
            const hasFirefoxFeatures = await page.evaluate(() => {
                return 'InstallTrigger' in window;
            });
            
            // Should work regardless of Firefox features
            await expect(page.locator(TEST_CONFIG.expectedElements.gameCanvas)).toBeVisible();
        });

        test('should work in WebKit/Safari', async ({ page, browserName }) => {
            test.skip(browserName !== 'webkit', 'WebKit-only test');
            
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector(TEST_CONFIG.expectedElements.gameCanvas);
            
            // WebKit-specific checks
            const hasWebKitFeatures = await page.evaluate(() => {
                return 'webkitRequestAnimationFrame' in window;
            });
            
            // Should work regardless of WebKit features
            await expect(page.locator(TEST_CONFIG.expectedElements.gameCanvas)).toBeVisible();
        });
    });

    test.describe('Error Handling', () => {
        test('should handle CORS errors gracefully', async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', error => {
                errors.push(error.message);
            });

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            // Check that no CORS errors occurred
            const corsErrors = errors.filter(err => 
                err.includes('CORS') || 
                err.includes('Cross-Origin') ||
                err.includes('blocked by CORS policy')
            );
            
            expect(corsErrors).toHaveLength(0);
        });

        test('should handle missing resources', async ({ page }) => {
            const failedRequests: string[] = [];
            
            page.on('requestfailed', request => {
                failedRequests.push(request.url());
            });

            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            // Game should still initialize despite any missing resources
            const gameInitialized = await page.evaluate(() => (window as any).gameEngine !== undefined);
            expect(gameInitialized).toBe(true);
        });
    });

    test.describe('Progressive Enhancement', () => {
        test('should provide basic functionality without JavaScript', async ({ page }) => {
            // Disable JavaScript
            await page.setJavaScriptEnabled(false);
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });

            // Check for noscript content
            const noscriptContent = await page.locator('noscript').textContent();
            expect(noscriptContent).toBeTruthy();

            // Re-enable JavaScript for other tests
            await page.setJavaScriptEnabled(true);
        });

        test('should enhance progressively with JavaScript', async ({ page }) => {
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            
            // Wait for progressive enhancement
            await page.waitForFunction(() => {
                return document.body.classList.contains('js-enabled') || 
                       (window as any).gameEngine !== undefined;
            }, { timeout: TEST_CONFIG.localTimeout });

            // Verify enhancement occurred
            const enhanced = await page.evaluate(() => {
                return document.body.classList.contains('js-enabled') ||
                       document.documentElement.classList.contains('awaputi-loaded');
            });
            
            expect(enhanced).toBe(true);
        });
    });

    test.describe('Performance in Local Mode', () => {
        test('should load quickly from local filesystem', async ({ page }) => {
            const startTime = Date.now();
            
            await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector(TEST_CONFIG.expectedElements.gameCanvas);
            
            const loadTime = Date.now() - startTime;
            
            // Local file should load very quickly (under 5 seconds)
            expect(loadTime).toBeLessThan(5000);
        });

        test('should not make external network requests', async ({ page }) => {
            const externalRequests: string[] = [];
            
            page.on('request', request => {
                const url = request.url();
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    externalRequests.push(url);
                }
            });

            await page.goto(indexPath, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);

            // Should have minimal or no external requests
            console.log('External requests made:', externalRequests);
            
            // Filter out expected external resources (like CDNs for fonts)
            const unexpectedRequests = externalRequests.filter(url => 
                !url.includes('fonts.googleapis.com') &&
                !url.includes('fonts.gstatic.com')
            );
            
            expect(unexpectedRequests).toHaveLength(0);
        });
    });
});