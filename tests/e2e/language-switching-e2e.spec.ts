/**
 * 言語切り替えE2Eテスト
 * 
 * 動的言語切り替え機能の包括的なE2Eテストを実装
 * WCAG 2.1 AA準拠のアクセシビリティ要件を含む
 */

import { test, expect } from '@playwright/test';

// テスト設定
const TEST_URL = 'http://localhost:8000';
const SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
const DEFAULT_TIMEOUT = 30000;

// テストヘルパー関数
async function waitForLocalizationReady(page: any) {
    await page.waitForFunction(() => {
        return (window as any).gameEngine && 
               (window as any).gameEngine.localizationManager && 
               (window as any).gameEngine.localizationManager.getCurrentLanguage();
    }, { timeout: DEFAULT_TIMEOUT });
}

async function changeLanguage(page: any, language: string) {
    // 設定画面を開く
    await page.keyboard.press('s');
    await page.waitForTimeout(500);
    
    // 言語選択ドロップダウンを見つける
    const languageSelector = await page.$('#language-selector');
    if (languageSelector) {
        await languageSelector.selectOption(language);
    } else {
        // フォールバック: キーボードナビゲーション
        const currentLang = await page.evaluate(() => 
            (window as any).gameEngine.localizationManager.getCurrentLanguage());
        const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLang);
        const targetIndex = SUPPORTED_LANGUAGES.indexOf(language);
        const diff = targetIndex - currentIndex;
        
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                await page.keyboard.press('ArrowDown');
                await page.waitForTimeout(100);
            }
        } else {
            for (let i = 0; i < Math.abs(diff); i++) {
                await page.keyboard.press('ArrowUp');
                await page.waitForTimeout(100);
            }
        }
        await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(1000);
}

async function validateUITranslation(page: any, language: string) {
    // UI要素の翻訳確認
    const menuButton = await page.$('button[data-i18n="menu.start"]');
    if (menuButton) {
        const buttonText = await menuButton.textContent();
        
        switch (language) {
            case 'ja':
                expect(buttonText).toContain('ゲーム開始');
                break;
            case 'en':
                expect(buttonText).toContain('Start Game');
                break;
            case 'zh-CN':
                expect(buttonText).toContain('开始游戏');
                break;
            case 'zh-TW':
                expect(buttonText).toContain('開始遊戲');
                break;
            case 'ko':
                expect(buttonText).toContain('게임 시작');
                break;
        }
    }
}

test.describe('Language Switching E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
        await waitForLocalizationReady(page);
        await page.waitForTimeout(2000);
    });

    test.describe('Basic Language Switching', () => {
        test('should switch to all supported languages', async ({ page }) => {
            for (const language of SUPPORTED_LANGUAGES) {
                await changeLanguage(page, language);
                
                // 言語変更の確認
                const currentLang = await page.evaluate(() => 
                    (window as any).gameEngine.localizationManager.getCurrentLanguage());
                expect(currentLang).toBe(language);
                
                // UI要素の翻訳確認
                await validateUITranslation(page, language);
                
                await page.waitForTimeout(1000);
            }
        });

        test('should persist language preference across page reloads', async ({ page }) => {
            // 言語を中国語に変更
            await changeLanguage(page, 'zh-CN');
            
            // ページをリロード
            await page.reload();
            await waitForLocalizationReady(page);
            
            // 言語設定が保持されているか確認
            const currentLang = await page.evaluate(() => 
                (window as any).gameEngine.localizationManager.getCurrentLanguage());
            expect(currentLang).toBe('zh-CN');
            
            // UI翻訳の確認
            await validateUITranslation(page, 'zh-CN');
        });

        test('should handle language switching during gameplay', async ({ page }) => {
            // ゲーム開始
            const startButton = page.locator('button:has-text("ゲーム開始")');
            if (await startButton.isVisible()) {
                await startButton.click();
                await page.waitForTimeout(2000);
            }
            
            // ゲーム中に言語を変更
            await changeLanguage(page, 'en');
            
            // ゲーム内UI要素の翻訳確認
            const scoreLabel = page.locator('[data-i18n*="score"]').first();
            if (await scoreLabel.isVisible()) {
                const labelText = await scoreLabel.textContent();
                expect(labelText).toContain('Score');
            }
            
            // ゲーム状態が保持されているか確認
            const gameCanvas = page.locator('#gameCanvas');
            await expect(gameCanvas).toBeVisible();
        });
    });

    test.describe('Dynamic Content Translation', () => {
        test('should translate dynamic game messages', async ({ page }) => {
            // 言語を英語に設定
            await changeLanguage(page, 'en');
            
            // ゲーム開始
            const startButton = page.locator('button:has-text("Start Game")');
            if (await startButton.isVisible()) {
                await startButton.click();
                await page.waitForTimeout(1000);
            }
            
            // 動的メッセージの翻訳確認
            const notifications = page.locator('.notification, .toast, .message');
            if (await notifications.first().isVisible()) {
                const messageText = await notifications.first().textContent();
                // 英語メッセージが表示されることを確認
                expect(messageText).toMatch(/[a-zA-Z]/);
            }
        });

        test('should translate error messages', async ({ page }) => {
            // 言語を韓国語に設定
            await changeLanguage(page, 'ko');
            
            // エラー状況を意図的に作成
            await page.evaluate(() => {
                if ((window as any).gameEngine && (window as any).gameEngine.errorHandler) {
                    (window as any).gameEngine.errorHandler.showError('TEST_ERROR');
                }
            });
            
            await page.waitForTimeout(1000);
            
            // エラーメッセージの翻訳確認
            const errorMessage = page.locator('.error-message, .alert-error');
            if (await errorMessage.isVisible()) {
                const messageText = await errorMessage.textContent();
                // 韓国語文字が含まれることを確認
                expect(messageText).toMatch(/[ㄱ-ㅎ가-힣]/);
            }
        });
    });

    test.describe('Font and Typography Support', () => {
        test('should load appropriate fonts for each language', async ({ page }) => {
            const fontTests = [
                { lang: 'ja', expectedFont: 'Noto Sans JP' },
                { lang: 'zh-CN', expectedFont: 'Noto Sans SC' },
                { lang: 'zh-TW', expectedFont: 'Noto Sans TC' },
                { lang: 'ko', expectedFont: 'Noto Sans KR' }
            ];
            
            for (const { lang, expectedFont } of fontTests) {
                await changeLanguage(page, lang);
                
                // フォント適用の確認
                const mainContent = page.locator('body, .main-content');
                const fontFamily = await mainContent.evaluate((el) => {
                    return window.getComputedStyle(el).fontFamily;
                });
                
                expect(fontFamily).toContain(expectedFont);
                await page.waitForTimeout(500);
            }
        });

        test('should handle text direction correctly', async ({ page }) => {
            // 各言語での文字方向確認
            for (const language of SUPPORTED_LANGUAGES) {
                await changeLanguage(page, language);
                
                const bodyElement = page.locator('body');
                const direction = await bodyElement.evaluate((el) => {
                    return window.getComputedStyle(el).direction;
                });
                
                // 現在サポートしている言語は全て左から右
                expect(direction).toBe('ltr');
            }
        });
    });

    test.describe('Performance and Loading', () => {
        test('should load translations efficiently', async ({ page }) => {
            const startTime = Date.now();
            
            // 複数言語を素早く切り替え
            for (const language of SUPPORTED_LANGUAGES) {
                await changeLanguage(page, language);
                
                // 翻訳が適用されるまでの時間を測定
                await page.waitForFunction(() => {
                    const currentLang = (window as any).gameEngine?.localizationManager?.getCurrentLanguage();
                    return currentLang === language;
                }, { timeout: 5000 });
            }
            
            const totalTime = Date.now() - startTime;
            
            // 全言語切り替えが30秒以内に完了することを確認
            expect(totalTime).toBeLessThan(30000);
        });

        test('should cache translations for better performance', async ({ page }) => {
            // 言語を切り替えて戻す
            await changeLanguage(page, 'en');
            await changeLanguage(page, 'ja');
            
            const startTime = Date.now();
            await changeLanguage(page, 'en'); // 2回目の切り替え
            
            const switchTime = Date.now() - startTime;
            
            // キャッシュ効果で高速切り替えを確認
            expect(switchTime).toBeLessThan(2000);
        });
    });

    test.describe('Accessibility and Internationalization', () => {
        test('should announce language changes to screen readers', async ({ page }) => {
            // aria-live領域の確認
            const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]');
            
            await changeLanguage(page, 'en');
            await page.waitForTimeout(500);
            
            if (await liveRegion.isVisible()) {
                const announcement = await liveRegion.textContent();
                expect(announcement).toContain('Language changed');
            }
        });

        test('should maintain keyboard navigation in all languages', async ({ page }) => {
            for (const language of ['ja', 'en', 'zh-CN']) {
                await changeLanguage(page, language);
                
                // キーボードナビゲーションのテスト
                await page.keyboard.press('Tab');
                await page.waitForTimeout(100);
                
                const focusedElement = page.locator(':focus');
                await expect(focusedElement).toBeVisible();
            }
        });

        test('should handle IME input correctly', async ({ page }) => {
            // 日本語入力モードでのテスト
            await changeLanguage(page, 'ja');
            
            const searchBox = page.locator('input[type="search"], input[type="text"]').first();
            if (await searchBox.isVisible()) {
                await searchBox.focus();
                
                // IME入力のシミュレーション
                await searchBox.type('こんにちは');
                const inputValue = await searchBox.inputValue();
                expect(inputValue).toBe('こんにちは');
            }
        });
    });

    test.describe('Fallback and Error Handling', () => {
        test('should fallback to default language for missing translations', async ({ page }) => {
            // 存在しない翻訳キーのテスト
            const missingKey = await page.evaluate(() => {
                if ((window as any).gameEngine?.localizationManager) {
                    return (window as any).gameEngine.localizationManager.translate('NONEXISTENT_KEY');
                }
                return null;
            });
            
            // フォールバック値が返されることを確認
            expect(missingKey).toBeTruthy();
        });

        test('should handle invalid language codes gracefully', async ({ page }) => {
            // 無効な言語コードでの切り替えテスト
            await page.evaluate(() => {
                if ((window as any).gameEngine?.localizationManager) {
                    (window as any).gameEngine.localizationManager.setLanguage('invalid-lang');
                }
            });
            
            await page.waitForTimeout(1000);
            
            // デフォルト言語にフォールバックされることを確認
            const currentLang = await page.evaluate(() => 
                (window as any).gameEngine?.localizationManager?.getCurrentLanguage());
            expect(SUPPORTED_LANGUAGES).toContain(currentLang);
        });

        test('should maintain functionality when translation files fail to load', async ({ page }) => {
            // ネットワークエラーをシミュレート
            await page.route('**/locales/**', route => route.abort());
            
            await page.reload();
            await page.waitForTimeout(3000);
            
            // ゲームが依然として動作することを確認
            const gameCanvas = page.locator('#gameCanvas');
            await expect(gameCanvas).toBeVisible();
            
            // ネットワークを復元
            await page.unroute('**/locales/**');
        });
    });

    test.describe('Mobile and Responsive Behavior', () => {
        test('should handle language switching on mobile devices', async ({ page }) => {
            // モバイルビューポートに設定
            await page.setViewportSize({ width: 375, height: 667 });
            
            for (const language of ['ja', 'en', 'zh-CN']) {
                await changeLanguage(page, language);
                
                // モバイルでの表示確認
                const mobileMenu = page.locator('.mobile-menu, .hamburger-menu');
                if (await mobileMenu.isVisible()) {
                    await mobileMenu.click();
                    await page.waitForTimeout(500);
                    
                    // メニュー項目の翻訳確認
                    const menuItems = page.locator('.menu-item');
                    const itemCount = await menuItems.count();
                    expect(itemCount).toBeGreaterThan(0);
                }
            }
        });

        test('should adapt text layout for different languages', async ({ page }) => {
            // 長いテキストを含む言語での表示テスト
            await changeLanguage(page, 'zh-TW');
            
            const longTextElements = page.locator('[data-i18n*="description"], .description');
            if (await longTextElements.first().isVisible()) {
                const textElement = longTextElements.first();
                const boundingBox = await textElement.boundingBox();
                
                // テキストが画面からはみ出していないことを確認
                expect(boundingBox?.width).toBeLessThanOrEqual(800);
            }
        });
    });
});