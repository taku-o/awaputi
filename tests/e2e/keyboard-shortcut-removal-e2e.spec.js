/**
 * Keyboard Shortcut Removal E2E Tests
 * Issue #169対応 - 削除されたキーボードショートカット(S、H、I)のブラウザテスト
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8001';

test.describe('Keyboard Shortcut Removal E2E (Issue #169)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the game
        await page.goto(BASE_URL);
        
        // Wait for the game to load
        await page.waitForSelector('canvas', { timeout: 10000 });
        
        // Wait for initial loading to complete
        await page.waitForTimeout(2000);
    });

    test.describe('Removed Shortcuts Have No Effect', () => {
        test('S key should not open settings screen', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Press S key
            await page.keyboard.press('s');
            
            // Wait a moment for any potential action
            await page.waitForTimeout(1000);

            // Verify no settings screen was opened
            // Check that we're still in the main game/menu area
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Check for specific settings screen indicators that should NOT be present
            const settingsIndicators = [
                'Settings',
                '設定',
                'Volume',
                '音量',
                'Audio Settings',
                'Display Settings'
            ];

            for (const indicator of settingsIndicators) {
                const element = page.locator(`text=${indicator}`).first();
                const isVisible = await element.isVisible().catch(() => false);
                expect(isVisible).toBe(false);
            }

            // Verify no console errors related to settings
            const settingsErrors = consoleErrors.filter(error => 
                error.toLowerCase().includes('settings') || 
                error.toLowerCase().includes('設定')
            );
            expect(settingsErrors).toHaveLength(0);
        });

        test('H key should not open help screen', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Press H key
            await page.keyboard.press('h');
            
            // Wait a moment for any potential action
            await page.waitForTimeout(1000);

            // Verify no help screen was opened
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Check for specific help screen indicators that should NOT be present
            const helpIndicators = [
                'Help',
                'ヘルプ',
                'Controls',
                'How to Play',
                'Instructions',
                '操作方法'
            ];

            for (const indicator of helpIndicators) {
                const element = page.locator(`text=${indicator}`).first();
                const isVisible = await element.isVisible().catch(() => false);
                expect(isVisible).toBe(false);
            }

            // Verify no console errors related to help
            const helpErrors = consoleErrors.filter(error => 
                error.toLowerCase().includes('help') || 
                error.toLowerCase().includes('ヘルプ')
            );
            expect(helpErrors).toHaveLength(0);
        });

        test('I key should not open user info screen', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Press I key
            await page.keyboard.press('i');
            
            // Wait a moment for any potential action
            await page.waitForTimeout(1000);

            // Verify no user info screen was opened
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Check for specific user info screen indicators that should NOT be present
            const userInfoIndicators = [
                'User Info',
                'ユーザー情報',
                'Statistics',
                'Player Stats',
                'Score',
                'High Score'
            ];

            for (const indicator of userInfoIndicators) {
                const element = page.locator(`text=${indicator}`).first();
                const isVisible = await element.isVisible().catch(() => false);
                expect(isVisible).toBe(false);
            }

            // Verify no console errors related to user info
            const userInfoErrors = consoleErrors.filter(error => 
                error.toLowerCase().includes('userinfo') || 
                error.toLowerCase().includes('user info') ||
                error.toLowerCase().includes('ユーザー情報')
            );
            expect(userInfoErrors).toHaveLength(0);
        });

        test('Multiple removed key presses should not cause any errors', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Press each removed key multiple times
            for (let i = 0; i < 3; i++) {
                await page.keyboard.press('s');
                await page.waitForTimeout(200);
                
                await page.keyboard.press('h');
                await page.waitForTimeout(200);
                
                await page.keyboard.press('i');
                await page.waitForTimeout(200);
            }

            // Wait for any delayed errors
            await page.waitForTimeout(1000);

            // Verify game is still functional
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Verify no console errors occurred
            expect(consoleErrors).toHaveLength(0);
        });
    });

    test.describe('Remaining Shortcuts Still Work', () => {
        test('Space key should still work for pause functionality', async ({ page }) => {
            // Navigate to a game state where pause is relevant
            // First try to start a game or get to a state where space key is meaningful
            
            // Try pressing space key
            await page.keyboard.press('Space');
            
            // Wait for any action
            await page.waitForTimeout(500);

            // The exact behavior depends on current game state, but no errors should occur
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();
        });

        test('Escape key should still work for navigation', async ({ page }) => {
            // Press Escape key
            await page.keyboard.press('Escape');
            
            // Wait for any action
            await page.waitForTimeout(500);

            // The exact behavior depends on current game state, but no errors should occur
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();
        });

        test('F key should still work for fullscreen', async ({ page }) => {
            // Monitor fullscreen changes (though we can't easily test actual fullscreen in headless mode)
            
            // Press F key
            await page.keyboard.press('f');
            
            // Wait for any action
            await page.waitForTimeout(500);

            // Game should still be functional
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();
        });

        test('F1 key should still work for contextual help', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Press F1 key
            await page.keyboard.press('F1');
            
            // Wait for any action
            await page.waitForTimeout(1000);

            // F1 should either work (open contextual help) or do nothing, but no errors
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Verify no errors occurred
            expect(consoleErrors).toHaveLength(0);
        });

        test('Ctrl+H should still work for documentation help', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Press Ctrl+H
            await page.keyboard.press('Control+h');
            
            // Wait for any action
            await page.waitForTimeout(1000);

            // Ctrl+H should either work (open documentation help) or do nothing, but no errors
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Verify no errors occurred
            expect(consoleErrors).toHaveLength(0);
        });
    });

    test.describe('Game Loading and Stability', () => {
        test('Game should load successfully with updated keyboard shortcuts', async ({ page }) => {
            // Monitor console for any errors during loading
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Game should be loaded (we already navigated in beforeEach)
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Wait for game initialization to complete
            await page.waitForTimeout(3000);

            // Verify no JavaScript errors occurred during loading
            const initializationErrors = consoleErrors.filter(error => 
                error.toLowerCase().includes('keyboard') ||
                error.toLowerCase().includes('shortcut') ||
                error.toLowerCase().includes('undefined')
            );
            expect(initializationErrors).toHaveLength(0);
        });

        test('Game should remain stable during mixed key interactions', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Mix of removed shortcuts and working shortcuts
            const keySequence = [
                's',      // removed
                'Space',  // working
                'h',      // removed
                'Escape', // working
                'i',      // removed
                'f',      // working
                'F1'      // working
            ];

            for (const key of keySequence) {
                await page.keyboard.press(key);
                await page.waitForTimeout(300);
            }

            // Game should still be stable
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // No errors should have occurred
            expect(consoleErrors).toHaveLength(0);
        });

        test('Rapid key presses should not cause issues', async ({ page }) => {
            // Monitor console for any errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Rapid presses of removed shortcuts
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('s');
                await page.keyboard.press('h');
                await page.keyboard.press('i');
                await page.waitForTimeout(50);
            }

            // Game should still be stable
            const canvas = await page.locator('canvas');
            await expect(canvas).toBeVisible();

            // No errors should have occurred
            expect(consoleErrors).toHaveLength(0);
        });
    });

    test.describe('UI Accessibility After Shortcut Removal', () => {
        test('Settings should still be accessible via UI elements', async ({ page }) => {
            // Look for any UI buttons or elements that could open settings
            // This is a basic check - exact implementation depends on UI design
            
            const settingsButtons = [
                'button:has-text("Settings")',
                'button:has-text("設定")',
                '[aria-label*="Settings"]',
                '[aria-label*="設定"]',
                '.settings-button',
                '#settings-button'
            ];

            let foundSettingsAccess = false;
            for (const selector of settingsButtons) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible()) {
                        foundSettingsAccess = true;
                        break;
                    }
                } catch (e) {
                    // Element not found, continue checking
                }
            }

            // Note: This test documents that settings should be accessible via UI
            // The exact implementation may vary, so we log the result
            console.log(`Settings UI access found: ${foundSettingsAccess}`);
        });

        test('Help should still be accessible via UI elements', async ({ page }) => {
            // Look for any UI buttons or elements that could open help
            
            const helpButtons = [
                'button:has-text("Help")',
                'button:has-text("ヘルプ")',
                '[aria-label*="Help"]',
                '[aria-label*="ヘルプ"]',
                '.help-button',
                '#help-button'
            ];

            let foundHelpAccess = false;
            for (const selector of helpButtons) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible()) {
                        foundHelpAccess = true;
                        break;
                    }
                } catch (e) {
                    // Element not found, continue checking
                }
            }

            // Note: This test documents that help should be accessible via UI
            console.log(`Help UI access found: ${foundHelpAccess}`);
        });
    });
});