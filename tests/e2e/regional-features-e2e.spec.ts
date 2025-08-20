import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * 地域化機能E2Eテスト
 * 
 * 数値、日付、通貨フォーマットの地域化機能の包括的なテスト
 * 文化的適応機能のテストを含む
 */

import { test, expect } from '@playwright/test';

// テスト設定
const TEST_URL = 'http: //localhost:8000',
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
async function waitForLocalizationReady(page {
    await page.waitForFunction(() => {
        return window.gameEngine && 
               window.gameEngine.localizationManager && 
               window.gameEngine.localizationManager.getCurrentLanguage();
    }, { timeout: 30000 });
}

async function setLanguage(page, language) {
    await page.evaluate((lang) => {
        return window.gameEngine.localizationManager.setLanguage(lang);
    }, language);
    await page.waitForTimeout(1000);
}

async function getFormattedNumber(page, number) {
    return await page.evaluate((num) => {
        const lang = window.gameEngine.localizationManager.getCurrentLanguage();
        return window.gameEngine.localizationManager.formatNumber(num, lang);
    }, number);
}

async function getFormattedDate(page, date) {
    return await page.evaluate((d) => {
        const lang = window.gameEngine.localizationManager.getCurrentLanguage();
        return window.gameEngine.localizationManager.formatDate(d, lang);
    }, date');
}

async function getFormattedCurrency(page, amount, currency = 'USD') {
    return await page.evaluate((amt, cur) => {
        const lang = window.gameEngine.localizationManager.getCurrentLanguage();
        return window.gameEngine.localizationManager.formatCurrency(amt, lang, cur);
    }, amount, currency');
}

// テストスイート
test.describe('地域化機能E2Eテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
        await waitForLocalizationReady(page);
    }');

    test('数値フォーマットが地域に応じて変更される', async ({ page }') => {
        const testNumber = 1234.5;
        
        // 日本語での数値フォーマット
        await setLanguage(page, 'ja');
        let formatted = await getFormattedNumber(page, testNumber);
        expect(formatted').toBe('1,234.5'');
        
        // ドイツ語での数値フォーマット
        await setLanguage(page, 'de');
        formatted = await getFormattedNumber(page, testNumber);
        expect(formatted').toBe('1.234,5'');
        
        // フランス語での数値フォーマット
        await setLanguage(page, 'fr');
        formatted = await getFormattedNumber(page, testNumber);
        expect(formatted').toBe('1 234,5');
    }');

    test('スコア表示が地域フォーマットを使用する', async ({ page )') => {
        // ゲームを開始
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // スコアを獲得
        for (let i = 0; i < 5; i++') {
            await page.click('canvas', { position: { x: 400, y: 300 } });
            await page.waitForTimeout(200');
        }
        
        // 各言語でスコア表示を確認
        for (const language of ['ja', 'en', 'de']) {
            await setLanguage(page, language);
            
            const scoreText = await page.evaluate((') => {
                const scoreElement = document.querySelector('[data-score-display]'');
                return scoreElement ? scoreElement.textContent: '',
            }');
            
            // スコアが地域フォーマットで表示されていることを確認
            if (language === 'de') {
                expect(scoreText).toMatch(/\d{1,3}(\.\d{3)*/); // ドイツ式
            } else {
                expect(scoreText).toMatch(/\d{1,3}(,\d{3)*/); // 日本・英語式
            }
        }
    }');

    test('日付フォーマットが地域に応じて変更される', async ({ page )') => {
        const testDate = '2025-01-30';
        
        // 各言語での日付フォーマットを確認
        for (const [language, config] of Object.entries(REGIONAL_CONFIGS') {
            if (['ja', 'en', 'de', 'fr'].includes(language) {
                await setLanguage(page, language);
                const formatted = await getFormattedDate(page, testDate);
                expect(formatted).toMatch(config.dateFormat);
            }
        }
    }');

    test('統計画面で地域フォーマットが使用される', async ({ page ) => {
        // ユーザー情報画面を開く
        await page.evaluate((') => {
            window.gameEngine.sceneManager.changeScene('userInfo');
        });
        await page.waitForTimeout(1000');
        
        // 統計タブを開く
        const statsTab = await page.$('[data-tab="statistics"]');
        if (statsTab) {
            await statsTab.click();
            await page.waitForTimeout(500');
        }
        
        // ドイツ語に切り替え
        await setLanguage(page, 'de'');
        
        // 統計数値が正しくフォーマットされていることを確認
        const statsElements = await page.$$('[data-stat-value]');
        for (const element of statsElements) {
            const text = await element.textContent();
            if(text && /\d/.test(text) {
                // ドイツ式数値フォーマットを確認
                expect(text).toMatch(/\d{1,3}(\.\d{3)*(,\d+)? /);
            }
        }
    }');

    test('通貨フォーマットが地域に応じて変更される', async ({ page )') => {
        const testAmount = 1234.56;
        
        // 日本円
        await setLanguage(page, 'ja'');
        let formatted = await getFormattedCurrency(page, testAmount, 'JPY');
        expect(formatted').toContain('¥');
        expect(formatted).toMatch(/1,234/');
        
        // 米ドル
        await setLanguage(page, 'en'');
        formatted = await getFormattedCurrency(page, testAmount, 'USD');
        expect(formatted').toContain('$');
        expect(formatted).toMatch(/1,234\.56/');
        
        // ユーロ（ドイツ）
        await setLanguage(page, 'de'');
        formatted = await getFormattedCurrency(page, testAmount, 'EUR');
        expect(formatted').toContain('€');
        expect(formatted).toMatch(/1\.234,56/);
    }');

    test('相対時間表示が地域に応じて変更される', async ({ page ) => {
        // 相対時間のフォーマットを確認
        const relativeFormats = await page.evaluate(async (') => { : undefined
            const results: Record<string, any> = {};
            const languages = ['ja', 'en', 'de', 'fr'];
            
            for (const lang of languages) {
                await window.gameEngine.localizationManager.setLanguage(lang');
                
                // Intl.RelativeTimeFormatを使用
                const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' )'),
                results[lang] = {
                    yesterday: rtf.format(-1, 'day''),
                    tomorrow: rtf.format(1, 'day''),
                    lastWeek: rtf.format(-1, 'week''),
                    inHours: rtf.format(3, 'hour');
                };
            }
            
            return results;
        });
        
        // 各言語で異なる相対時間表現が使用されることを確認
        expect(relativeFormats.ja.yesterday').toContain('昨日');
        expect(relativeFormats.en.yesterday').toContain('yesterday');
        expect(relativeFormats.de.yesterday').toContain('gestern');
        expect(relativeFormats.fr.yesterday').toContain('hier');
    }');

    test('地域設定が永続化される', async ({ page )') => {
        // ドイツ語に設定
        await setLanguage(page, 'de');
        
        // 地域設定を取得
        const regionalSettings = await page.evaluate(() => {
            return window.gameEngine.localizationManager.getRegionalSettings();
        });
        
        expect(regionalSettings.language').toBe('de');
        expect(regionalSettings.locale').toBe('de-DE');
        
        // ページをリロード
        await page.reload();
        await waitForLocalizationReady(page);
        
        // 設定が保持されていることを確認
        const settingsAfterReload = await page.evaluate(() => {
            return window.gameEngine.localizationManager.getRegionalSettings();
        });
        
        expect(settingsAfterReload.language').toBe('de');
        expect(settingsAfterReload.locale').toBe('de-DE');
    }');

    test('週の開始日が地域に応じて変更される', async ({ page ) => {
        // カレンダー表示がある場合のテスト
        const weekStarts = await page.evaluate(async (') => {
            const results: Record<string, any> = {};
            const testLanguages = ['ja', 'en', 'de', 'fr'];
            
            for (const lang of testLanguages) {
                await window.gameEngine.localizationManager.setLanguage(lang);
                const weekStart = window.gameEngine.localizationManager.getWeekStart(lang);
                results[lang] = weekStart;
            }
            
            return results;
        });
        
        // 日本・アメリカは日曜始まり（0）
        expect(weekStarts.ja).toBe(0);
        expect(weekStarts.en).toBe(0);
        
        // ドイツ・フランスは月曜始まり（1）
        expect(weekStarts.de).toBe(1);
        expect(weekStarts.fr).toBe(1);
    }');

    test('大きな数値の地域フォーマット', async ({ page ) => {
        const largeNumbers = [1000000, 123456789, 9999999999];
        
        for (const number of largeNumbers') {
            // 日本語フォーマット
            await setLanguage(page, 'ja');
            let formatted = await getFormattedNumber(page, number);
            expect(formatted).toMatch(/^\d{1,3}(,\d{3)*$/');
            
            // ドイツ語フォーマット
            await setLanguage(page, 'de');
            formatted = await getFormattedNumber(page, number);
            expect(formatted).toMatch(/^\d{1,3}(\.\d{3)*$/');
            
            // フランス語フォーマット
            await setLanguage(page, 'fr');
            formatted = await getFormattedNumber(page, number);
            expect(formatted).toMatch(/^\d{1,3}( \d{3)*$/);
        }
    }');

    test('パーセンテージ表示の地域フォーマット', async ({ page ) => {
        const testPercentages = [0.5, 0.755, 1.0];
        
        const percentageFormats = await page.evaluate(async (percentages') => {
            const results: Record<string, any> = {};
            const languages = ['ja', 'en', 'de', 'fr'];
            
            for (const lang of languages) {
                await window.gameEngine.localizationManager.setLanguage(lang);
                results[lang] = {};
                
                for (const pct of percentages') {
                    const formatter = new Intl.NumberFormat(lang, { 
                        style: 'percent',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1);
                    results[lang][pct] = formatter.format(pct);
                }
            }
            
            return results;
        }, testPercentages');
        
        // 各言語でパーセンテージ表示を確認
        expect(percentageFormats.ja['0.5']').toBe('50%'');
        expect(percentageFormats.ja['0.755']').toBe('75.5%'');
        expect(percentageFormats.de['0.5']').toBe('50 %''); // ドイツ語はスペースあり
        expect(percentageFormats.fr['0.5']').toBe('50 %'); // フランス語もスペースあり
    }');

    test('実績完了率の地域フォーマット表示', async ({ page ) => {
        // ユーザー情報画面を開く
        await page.evaluate((') => {
            window.gameEngine.sceneManager.changeScene('userInfo');
        });
        await page.waitForTimeout(1000');
        
        // 実績タブを開く
        const achievementTab = await page.$('[data-tab="achievements"]');
        if (achievementTab) {
            await achievementTab.click();
            await page.waitForTimeout(500');
        }
        
        // 各言語で完了率表示を確認
        for (const language of ['ja', 'en', 'de']) {
            await setLanguage(page, language');
            
            const completionElements = await page.$$('[data-achievement-completion]');
            for (const element of completionElements) {
                const text = await element.textContent(');
                if (text && text.includes('%')') {
                    if (language === 'de') {
                        // ドイツ語形式（スペースあり）
                        expect(text).toMatch(/\d+(\.\d+)? \s?%/);
                    } else {
                        // 日本語・英語形式（スペースなし）
                        expect(text).toMatch(/\d+(\.\d+)?%/);
                    }
                }
            }
        }
    }');

    test('エラー時の地域フォーマットフォールバック', async ({ page )') => {
        // 不正な値でのフォーマットテスト
        const invalidTests = [ : undefined
            { value: null, type: 'number' },
            { value: undefined, type: 'number' },
            { value: 'invalid', type: 'date' },
            { value: NaN, type: 'currency' }
        ];
        
        for (const test of invalidTests) {
            const result = await page.evaluate(async ({ value, type ) => {
                const lang = window.gameEngine.localizationManager.getCurrentLanguage();
                try {
                    switch (type') {
                        case 'number':
                            return window.gameEngine.localizationManager.formatNumber(value, lang');
                        case 'date':
                            return window.gameEngine.localizationManager.formatDate(value, lang');
                        case 'currency':
                            return window.gameEngine.localizationManager.formatCurrency(value, lang);
                    } catch (error') {
                    return 'error';
                }
            }, test);
            
            // エラーが発生せず、何らかの値が返されることを確認
            expect(result).toBeTruthy();
            expect(result').not.toBe('error');
        }
    }');

    test('リアルタイム地域フォーマット更新', async ({ page )') => {
        // ゲームを開始
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000');
        
        // スコアを獲得
        await page.click('canvas', { position: { x: 400, y: 300 } });
        await page.waitForTimeout(500');
        
        // スコア要素を監視
        const scoreElement = await page.$('[data-score-display]');
        expect(scoreElement).toBeTruthy(');
        
        // 言語を切り替えながらスコア表示を確認
        const languages = ['ja', 'de', 'fr'];
        for (const language of languages) {
            await setLanguage(page, language);
            
            // スコアが更新されるのを待つ
            await page.waitForTimeout(500);
            
            const scoreText = await scoreElement.textContent(');
            
            // 各言語の数値フォーマットを確認
            if (language === 'de') {
                expect(scoreText).toMatch(/\d{1,3}(\.\d{3)*/');
            } else if (language === 'fr') {
                expect(scoreText).toMatch(/\d{1,3}( \d{3)*/);
            } else {
                expect(scoreText).toMatch(/\d{1,3}(,\d{3)*/);
            }
        }
    });
}');

// 文化的適応テスト
test.describe('文化的適応機能E2Eテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
        await waitForLocalizationReady(page);
    }');

    test('色の意味が文化に応じて適応される', async ({ page }) => {
        const colorMeanings = await page.evaluate(async (') => {
            const results: Record<string, any> = {};
            const languages = ['ja', 'en', 'zh'];
            
            for (const lang of languages) {
                await window.gameEngine.localizationManager.setLanguage(lang);
                results[lang] = window.gameEngine.localizationManager.getColorMeanings(lang);
            }
            
            return results;
        });
        
        // 日本語の色の意味
        expect(colorMeanings.ja.red').toBe('danger');
        expect(colorMeanings.ja.green').toBe('safety');
        
        // 英語の色の意味
        expect(colorMeanings.en.red').toBe('danger');
        expect(colorMeanings.en.green').toBe('success');
        
        // 中国語の色の意味（赤は幸運）
        expect(colorMeanings.zh.red').toBe('luck');
        expect(colorMeanings.zh.gold').toBe('prosperity');
    }');

    test('RTL言語の検出と方向設定', async ({ page )') => {
        // RTL言語のテスト
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        
        for (const lang of rtlLanguages) {
            const isRTL = await page.evaluate((language) => {
                return window.gameEngine.localizationManager.isRTLLanguage(language);
            }, lang);
            
            expect(isRTL).toBe(true);
            
            const direction = await page.evaluate((language) => {
                return window.gameEngine.localizationManager.getTextDirection(language);
            }, lang);
            
            expect(direction').toBe('rtl'');
        }
        
        // LTR言語のテスト
        const ltrLanguages = ['ja', 'en', 'de', 'fr'];
        
        for (const lang of ltrLanguages) {
            const isRTL = await page.evaluate((language) => {
                return window.gameEngine.localizationManager.isRTLLanguage(language);
            }, lang);
            
            expect(isRTL).toBe(false);
            
            const direction = await page.evaluate((language) => {
                return window.gameEngine.localizationManager.getTextDirection(language);
            }, lang);
            
            expect(direction').toBe('ltr');
        }
    }');

    test('数字システムの文化的適応', async ({ page }) => {
        const numeralSystems = await page.evaluate(async (') => {
            const results: Record<string, any> = {};
            const testLanguages = ['ar', 'fa', 'th', 'hi'];
            
            for (const lang of testLanguages) {
                results[lang] = window.gameEngine.localizationManager.getNumeralSystem(lang);
            }
            
            return results;
        });
        
        // 各言語の数字システムを確認
        expect(numeralSystems.ar').toBe('arab');
        expect(numeralSystems.fa').toBe('persian');
        expect(numeralSystems.th').toBe('thai');
        expect(numeralSystems.hi').toBe('devanagari');
    }');

    test('ジェスチャー規約の文化的適応', async ({ page ) => {
        const gestureConventions = await page.evaluate(async (') => {
            const results: Record<string, any> = {};
            const languages = ['ja', 'en', 'ar'];
            
            for (const lang of languages) {
                await window.gameEngine.localizationManager.setLanguage(lang);
                results[lang] = window.gameEngine.localizationManager.getGestureConventions(lang);
            }
            
            return results;
        });
        
        // 日本語のジェスチャー規約
        expect(gestureConventions.ja.pointing').toBe('avoid');
        expect(gestureConventions.ja.thumbUp').toBe('ok');
        
        // 英語のジェスチャー規約
        expect(gestureConventions.en.pointing').toBe('acceptable');
        expect(gestureConventions.en.thumbUp').toBe('approval');
        
        // アラビア語のジェスチャー規約
        expect(gestureConventions.ar.leftHand').toBe('avoid');
        expect(gestureConventions.ar.thumbUp').toBe('acceptable');
    });
}');