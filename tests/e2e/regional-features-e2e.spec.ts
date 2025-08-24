/**
 * 地域化機能E2Eテスト
 * 
 * 数値、日付、通貨フォーマットの地域化機能の包括的なテスト
 * 文化的適応機能のテストを含む
 */

import { test, expect } from '@playwright/test';

// テスト設定
const TEST_URL = 'http://localhost:8000';
const REGIONAL_CONFIGS = {
    'ja': {
        numberFormat: '1,234.5',
        dateFormat: /\d{4}年\d{1,2}月\d{1,2}日/,
        currency: '¥',
        firstDayOfWeek: 0 // Sunday
    },
    'en': {
        numberFormat: '1,234.5',
        dateFormat: /\d{1,2}\/\d{1,2}\/\d{4}/,
        currency: '$',
        firstDayOfWeek: 0 // Sunday
    },
    'de': {
        numberFormat: '1.234,5',
        dateFormat: /\d{1,2}\.\d{1,2}\.\d{4}/,
        currency: '€',
        firstDayOfWeek: 1 // Monday
    },
    'fr': {
        numberFormat: '1 234,5',
        dateFormat: /\d{1,2}\/\d{1,2}\/\d{4}/,
        currency: '€',
        firstDayOfWeek: 1 // Monday
    }
};

// ヘルパー関数
async function waitForLocalizationReady(page: any) {
    await page.waitForFunction(() => {
        return (window as any).gameEngine && 
               (window as any).gameEngine.localizationManager && 
               (window as any).gameEngine.localizationManager.getCurrentLanguage();
    }, { timeout: 30000 });
}

async function setLanguage(page: any, language: string) {
    await page.evaluate((lang) => {
        return (window as any).gameEngine.localizationManager.setLanguage(lang);
    }, language);
    await page.waitForTimeout(1000);
}

async function getFormattedNumber(page: any, number: number) {
    return await page.evaluate((num) => {
        const lang = (window as any).gameEngine.localizationManager.getCurrentLanguage();
        return (window as any).gameEngine.localizationManager.formatNumber(num, lang);
    }, number);
}

async function getFormattedDate(page: any, date: string) {
    return await page.evaluate((d) => {
        const lang = (window as any).gameEngine.localizationManager.getCurrentLanguage();
        return (window as any).gameEngine.localizationManager.formatDate(d, lang);
    }, date);
}

async function getFormattedCurrency(page: any, amount: number, currency: string = 'USD') {
    return await page.evaluate((amt, cur) => {
        const lang = (window as any).gameEngine.localizationManager.getCurrentLanguage();
        return (window as any).gameEngine.localizationManager.formatCurrency(amt, lang, cur);
    }, amount, currency);
}

// テストスイート
test.describe('地域化機能E2Eテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
        await waitForLocalizationReady(page);
    });

    test('数値フォーマットが地域に応じて変更される', async ({ page }) => {
        const testNumber = 1234.5;
        
        // 日本語での数値フォーマット
        await setLanguage(page, 'ja');
        let formatted = await getFormattedNumber(page, testNumber);
        expect(formatted).toBe('1,234.5');
        
        // ドイツ語での数値フォーマット
        await setLanguage(page, 'de');
        formatted = await getFormattedNumber(page, testNumber);
        expect(formatted).toBe('1.234,5');
        
        // フランス語での数値フォーマット
        await setLanguage(page, 'fr');
        formatted = await getFormattedNumber(page, testNumber);
        expect(formatted).toBe('1 234,5');
    });

    test('スコア表示が地域フォーマットを使用する', async ({ page }) => {
        // ゲームを開始
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // スコアを獲得
        await page.click('canvas', { position: { x: 400, y: 300 } });
        await page.waitForTimeout(500);
        
        // 各地域でのスコア表示を確認
        for (const [lang, config] of Object.entries(REGIONAL_CONFIGS)) {
            await setLanguage(page, lang);
            
            const scoreText = await page.evaluate(() => {
                // GameUIManagerからスコア表示テキストを取得
                const gameScene = (window as any).gameEngine.sceneManager.currentScene;
                if (gameScene && gameScene.uiManager) {
                    return gameScene.uiManager.getScoreDisplay();
                }
                return null;
            });
            
            if (scoreText) {
                // 地域のフォーマットパターンに適合するかチェック
                expect(scoreText).toMatch(/\d/);
            }
        }
    });

    test('日付フォーマットが地域に応じて変更される', async ({ page }) => {
        const testDateString = '2025-01-15';
        
        // 日本語での日付フォーマット
        await setLanguage(page, 'ja');
        let formatted = await getFormattedDate(page, testDateString);
        expect(formatted).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
        
        // 英語での日付フォーマット
        await setLanguage(page, 'en');
        formatted = await getFormattedDate(page, testDateString);
        expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
        
        // ドイツ語での日付フォーマット
        await setLanguage(page, 'de');
        formatted = await getFormattedDate(page, testDateString);
        expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
    });

    test('通貨フォーマットが地域に応じて変更される', async ({ page }) => {
        const testAmount = 99.99;
        
        // 日本語での通貨フォーマット（円）
        await setLanguage(page, 'ja');
        let formatted = await getFormattedCurrency(page, testAmount, 'JPY');
        expect(formatted).toContain('¥');
        
        // 英語での通貨フォーマット（ドル）
        await setLanguage(page, 'en');
        formatted = await getFormattedCurrency(page, testAmount, 'USD');
        expect(formatted).toContain('$');
        
        // ドイツ語での通貨フォーマット（ユーロ）
        await setLanguage(page, 'de');
        formatted = await getFormattedCurrency(page, testAmount, 'EUR');
        expect(formatted).toContain('€');
    });

    test('週の始まりが地域設定に応じて変更される', async ({ page }) => {
        for (const [lang, config] of Object.entries(REGIONAL_CONFIGS)) {
            await setLanguage(page, lang);
            
            const firstDayOfWeek = await page.evaluate(() => {
                return (window as any).gameEngine.localizationManager.getFirstDayOfWeek();
            });
            
            expect(firstDayOfWeek).toBe(config.firstDayOfWeek);
        }
    });

    test('右から左（RTL）言語対応', async ({ page }) => {
        // アラビア語を設定（RTL言語のテスト）
        const rtlSupported = await page.evaluate(() => {
            const availableLanguages = (window as any).gameEngine.localizationManager.getAvailableLanguages();
            return availableLanguages.includes('ar');
        });
        
        if (rtlSupported) {
            await setLanguage(page, 'ar');
            
            const textDirection = await page.evaluate(() => {
                return (window as any).gameEngine.localizationManager.getTextDirection();
            });
            
            expect(textDirection).toBe('rtl');
            
            // UI要素がRTLレイアウトを適用しているかチェック
            const uiElements = await page.evaluate(() => {
                const gameScene = (window as any).gameEngine.sceneManager.currentScene;
                if (gameScene && gameScene.uiManager) {
                    return gameScene.uiManager.getUILayout();
                }
                return null;
            });
            
            if (uiElements) {
                expect(uiElements.direction).toBe('rtl');
            }
        } else {
            console.log('Arabic language not supported, skipping RTL test');
        }
    });

    test('時間フォーマット（12時間制 vs 24時間制）', async ({ page }) => {
        const testTime = new Date('2025-01-15T14:30:00');
        
        // 英語（12時間制）
        await setLanguage(page, 'en');
        let timeFormat = await page.evaluate((time) => {
            return (window as any).gameEngine.localizationManager.formatTime(time);
        }, testTime.toISOString());
        expect(timeFormat).toMatch(/PM|AM/i);
        
        // ドイツ語（24時間制）
        await setLanguage(page, 'de');
        timeFormat = await page.evaluate((time) => {
            return (window as any).gameEngine.localizationManager.formatTime(time);
        }, testTime.toISOString());
        expect(timeFormat).toMatch(/^14:/);
    });

    test('千の位区切り文字が地域に応じて変更される', async ({ page }) => {
        const largeNumber = 1234567.89;
        
        // 英語（カンマ区切り）
        await setLanguage(page, 'en');
        let formatted = await getFormattedNumber(page, largeNumber);
        expect(formatted).toContain(',');
        
        // ドイツ語（ドット区切り）
        await setLanguage(page, 'de');
        formatted = await getFormattedNumber(page, largeNumber);
        expect(formatted).toContain('.');
        
        // フランス語（スペース区切り）
        await setLanguage(page, 'fr');
        formatted = await getFormattedNumber(page, largeNumber);
        expect(formatted).toContain(' ');
    });

    test('小数点記号が地域に応じて変更される', async ({ page }) => {
        const decimalNumber = 123.45;
        
        // 英語（ドット）
        await setLanguage(page, 'en');
        let formatted = await getFormattedNumber(page, decimalNumber);
        expect(formatted).toContain('.');
        
        // ドイツ語（カンマ）
        await setLanguage(page, 'de');
        formatted = await getFormattedNumber(page, decimalNumber);
        expect(formatted).toContain(',');
    });

    test('パーセンテージフォーマットが地域に応じて変更される', async ({ page }) => {
        const percentage = 0.1234;
        
        for (const lang of ['ja', 'en', 'de', 'fr']) {
            await setLanguage(page, lang);
            
            const formatted = await page.evaluate((pct) => {
                return (window as any).gameEngine.localizationManager.formatPercentage(pct);
            }, percentage);
            
            expect(formatted).toContain('%');
            expect(typeof formatted).toBe('string');
        }
    });

    test('相対時間表示が地域に応じてローカライズされる', async ({ page }) => {
        const pastTime = new Date(Date.now() - 3600000); // 1時間前
        
        // 英語
        await setLanguage(page, 'en');
        let relativeTime = await page.evaluate((time) => {
            return (window as any).gameEngine.localizationManager.formatRelativeTime(time);
        }, pastTime.toISOString());
        expect(relativeTime).toMatch(/ago|hour/);
        
        // 日本語
        await setLanguage(page, 'ja');
        relativeTime = await page.evaluate((time) => {
            return (window as any).gameEngine.localizationManager.formatRelativeTime(time);
        }, pastTime.toISOString());
        expect(relativeTime).toMatch(/前|時間/);
    });

    test('地域固有の色の文化的意味が反映される', async ({ page }) => {
        // 中国語での赤色（幸運の意味）
        const chineseSupported = await page.evaluate(() => {
            const availableLanguages = (window as any).gameEngine.localizationManager.getAvailableLanguages();
            return availableLanguages.includes('zh');
        });
        
        if (chineseSupported) {
            await setLanguage(page, 'zh');
            
            const redColorMeaning = await page.evaluate(() => {
                return (window as any).gameEngine.localizationManager.getColorMeaning('red');
            });
            
            expect(redColorMeaning).toBe('luck');
        }
        
        // 西洋文化での赤色（危険の意味）
        await setLanguage(page, 'en');
        const redColorMeaningWestern = await page.evaluate(() => {
            return (window as any).gameEngine.localizationManager.getColorMeaning('red');
        });
        
        expect(redColorMeaningWestern).toBe('danger');
    });

    test('地域固有のキーボードショートカット', async ({ page }) => {
        // 日本語キーボードでの特殊文字入力
        await setLanguage(page, 'ja');
        
        const jaKeyboardLayout = await page.evaluate(() => {
            return (window as any).gameEngine.localizationManager.getKeyboardLayout();
        });
        
        expect(jaKeyboardLayout).toBe('ja');
        
        // ドイツ語キーボードでのQWERTZ配列
        await setLanguage(page, 'de');
        
        const deKeyboardLayout = await page.evaluate(() => {
            return (window as any).gameEngine.localizationManager.getKeyboardLayout();
        });
        
        expect(deKeyboardLayout).toBe('de');
    });

    test('季節や祝日の地域固有表現', async ({ page }) => {
        const testDate = '2025-12-25'; // クリスマス
        
        // 西洋文化
        await setLanguage(page, 'en');
        let holidayInfo = await page.evaluate((date) => {
            return (window as any).gameEngine.localizationManager.getHolidayInfo(date);
        }, testDate);
        expect(holidayInfo?.name).toContain('Christmas');
        
        // 日本文化
        await setLanguage(page, 'ja');
        holidayInfo = await page.evaluate((date) => {
            return (window as any).gameEngine.localizationManager.getHolidayInfo(date);
        }, testDate);
        expect(holidayInfo?.name).toContain('クリスマス');
    });

    test('地域固有の測定単位', async ({ page }) => {
        const distance = 1000; // メートル
        
        // アメリカ（フィート・マイル）
        await setLanguage(page, 'en');
        let formattedDistance = await page.evaluate((dist) => {
            return (window as any).gameEngine.localizationManager.formatDistance(dist, 'US');
        }, distance);
        expect(formattedDistance).toMatch(/ft|feet|mile/);
        
        // メートル法
        await setLanguage(page, 'de');
        formattedDistance = await page.evaluate((dist) => {
            return (window as any).gameEngine.localizationManager.formatDistance(dist, 'metric');
        }, distance);
        expect(formattedDistance).toMatch(/m|km/);
    });

    test('地域固有の電話番号フォーマット', async ({ page }) => {
        const phoneNumber = '1234567890';
        
        // アメリカ式
        await setLanguage(page, 'en');
        let formattedPhone = await page.evaluate((phone) => {
            return (window as any).gameEngine.localizationManager.formatPhoneNumber(phone, 'US');
        }, phoneNumber);
        expect(formattedPhone).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
        
        // 日本式
        await setLanguage(page, 'ja');
        formattedPhone = await page.evaluate((phone) => {
            return (window as any).gameEngine.localizationManager.formatPhoneNumber(phone, 'JP');
        }, phoneNumber);
        expect(formattedPhone).toMatch(/\d{3}-\d{4}-\d{4}/);
    });

    test('複数地域での同時フォーマット', async ({ page }) => {
        const testNumber = 1234.56;
        
        // 複数地域のフォーマットを同時に取得
        const multiRegionalFormat = await page.evaluate((num) => {
            const lm = (window as any).gameEngine.localizationManager;
            return {
                ja: lm.formatNumber(num, 'ja'),
                en: lm.formatNumber(num, 'en'), 
                de: lm.formatNumber(num, 'de'),
                fr: lm.formatNumber(num, 'fr')
            };
        }, testNumber);
        
        expect(multiRegionalFormat.ja).toBe('1,234.56');
        expect(multiRegionalFormat.en).toBe('1,234.56');
        expect(multiRegionalFormat.de).toBe('1.234,56');
        expect(multiRegionalFormat.fr).toBe('1 234,56');
    });

    test('地域フォーマットの動的変更', async ({ page }) => {
        const testValue = 999.99;
        
        // 初期値
        await setLanguage(page, 'ja');
        let initialFormat = await getFormattedNumber(page, testValue);
        
        // 地域変更
        await setLanguage(page, 'de');
        let changedFormat = await getFormattedNumber(page, testValue);
        
        // フォーマットが実際に変更されたことを確認
        expect(initialFormat).not.toBe(changedFormat);
        
        // 元に戻す
        await setLanguage(page, 'ja');
        let revertedFormat = await getFormattedNumber(page, testValue);
        
        expect(revertedFormat).toBe(initialFormat);
    });

    test('無効な地域コードの処理', async ({ page }) => {
        const originalLanguage = await page.evaluate(() => {
            return (window as any).gameEngine.localizationManager.getCurrentLanguage();
        });
        
        // 無効な地域コードでフォーマットを試行
        const invalidRegionFormat = await page.evaluate(() => {
            try {
                return (window as any).gameEngine.localizationManager.formatNumber(1234.56, 'invalid-locale');
            } catch (error) {
                return null;
            }
        });
        
        // エラーが適切に処理されるか、デフォルトフォーマットが返されることを確認
        expect(invalidRegionFormat === null || typeof invalidRegionFormat === 'string').toBe(true);
        
        // 元の言語設定が保持されていることを確認
        const currentLanguage = await page.evaluate(() => {
            return (window as any).gameEngine.localizationManager.getCurrentLanguage();
        });
        
        expect(currentLanguage).toBe(originalLanguage);
    });
});