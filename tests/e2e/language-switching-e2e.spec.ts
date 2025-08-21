import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * 言語切り替えE2Eテスト
 * 
 * 動的言語切り替え機能の包括的なE2Eテストを実装
 * WCAG 2.1 AA準拠のアクセシビリティ要件を含む
 */

import { test, expect  } from '@playwright/test';

// テスト設定
const TEST_URL = 'http: //localhost:8000',
const SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
const DEFAULT_TIMEOUT = 30000;

// テストヘルパー関数
async function waitForLocalizationReady(page {
    await page.waitForFunction(() => {
        return window.gameEngine && 
               window.gameEngine.localizationManager && 
               window.gameEngine.localizationManager.getCurrentLanguage() }, { timeout: DEFAULT_TIMEOUT,);
}

async function changeLanguage(page, language') {'
    // 設定画面を開く
    await page.keyboard.press('s'),
    await page.waitForTimeout(500'),'
    
    // 言語選択ドロップダウンを見つける
    const languageSelector = await page.$('#language-selector'),
    if (languageSelector) {
        await languageSelector.selectOption(language) } else {
        // フォールバック: キーボードナビゲーション
        const currentLang = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage(),
        const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLang),
        const targetIndex = SUPPORTED_LANGUAGES.indexOf(language),
        const diff = targetIndex - currentIndex,
        
        if (diff > 0) {
            for (let i = 0, i < diff, i++') {'
                await page.keyboard.press('ArrowDown'),
                await page.waitForTimeout(100) }
        } else {
            for (let i = 0, i < Math.abs(diff, i++') {'
                await page.keyboard.press('ArrowUp'),
                await page.waitForTimeout(100') }'
        }
        await page.keyboard.press('Enter');
    }
    
    // 言語変更の完了を待つ
    await page.waitForTimeout(1000');'
}

// テストスイート
test.describe('言語切り替えE2Eテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL),
        await waitForLocalizationReady(page) }');'

    test('基本的な言語切り替えが正しく動作する', async ({ page }) => {
        // 初期言語の確認
        const initialLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage(),
        expect(initialLanguage').toBe('ja'),'
        
        // 英語に切り替え
        await changeLanguage(page, 'en'),
        
        // 言語が変更されたことを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage(),
        expect(currentLanguage').toBe('en'),'
        
        // UIテキストが英語になっていることを確認
        const startButtonText = await page.evaluate((') => {'
            const button = document.querySelector('[data-action="start-game"]'),
            return button ? button.textContent: null;);
        expect(startButtonText').toContain('Start Game');'
    }');'

    test('すべての対応言語で切り替えが可能', async ({ page ) => {
        for (const language of SUPPORTED_LANGUAGES) {
            await changeLanguage(page, language),
            
            const currentLanguage = await page.evaluate(() => 
                window.gameEngine.localizationManager.getCurrentLanguage(),
            expect(currentLanguage).toBe(language),
            
            // 言語情報の取得
            const languageInfo = await page.evaluate((lang) => 
                window.gameEngine.localizationManager.getLanguageInfo(lang,
                language,
            expect(languageInfo).toBeTruthy(),
            expect(languageInfo.native).toBeTruthy() }
    }');'

    test('言語切り替え後もゲーム状態が保持される', async ({ page )') => {'
        // ゲームを開始
        await page.keyboard.press('Enter'),
        await page.waitForTimeout(1000'),'
        
        // スコアを獲得（泡をクリック）
        await page.click('canvas', { position: { x: 400, y: 300 } });
        await page.waitForTimeout(500);
        
        // 現在のスコアを記録
        const scoreBefore = await page.evaluate(() => 
            window.gameEngine.sceneManager.currentScene? .scoreManager?.getScore() || 0
        );
        expect(scoreBefore).toBeGreaterThan(0');'
        
        // 言語を切り替え
        await changeLanguage(page, 'en');
        
        // スコアが保持されていることを確認
        const scoreAfter = await page.evaluate(() => 
            window.gameEngine.sceneManager.currentScene?.scoreManager?.getScore() || 0
        );
        expect(scoreAfter).toBe(scoreBefore);
    }');'

    test('ブラウザリロード後も言語設定が保持される', async ({ page )') => {'
        // 英語に切り替え
        await changeLanguage(page, 'en'),
        
        // ページをリロード
        await page.reload(),
        await waitForLocalizationReady(page),
        
        // 言語設定が保持されていることを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage(),
        expect(currentLanguage').toBe('en') }');

    test('URLパラメータでの言語指定が機能する', async ({ page ) => {
        // URLパラメータで言語を指定してアクセス
        await page.goto(`${TEST_URL}?lang=en`);
        await waitForLocalizationReady(page);
        
        // 指定した言語が適用されていることを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage();
        expect(currentLanguage').toBe('en');'
    }');'

    test('存在しない言語コードの場合はフォールバックが機能する', async ({ page ) => {
        // 存在しない言語コードを指定
        await page.goto(`${TEST_URL}?lang=invalid`);
        await waitForLocalizationReady(page);
        
        // デフォルト言語にフォールバックすることを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage()
        ');'
        expect(['ja', 'en']).toContain(currentLanguage);
    }');'

    test('言語切り替え時のアニメーションが適切に動作する', async ({ page )') => {'
        // 初期状態のスクリーンショット : undefined
        await page.screenshot({ path: 'screenshots/language-switch-before.png' }');'
        
        // 言語を切り替え
        await changeLanguage(page, 'en');
        
        // アニメーション中のスクリーンショット
        await page.screenshot({ path: 'screenshots/language-switch-during.png' ,
        
        // アニメーション完了後のスクリーンショット
        await page.waitForTimeout(1000'),'
        await page.screenshot({ path: 'screenshots/language-switch-after.png' ,
        
        // UI要素が正しく更新されていることを確認
        const isUIUpdated = await page.evaluate((') => {'
            const elements = document.querySelectorAll('[data-i18n]'),
            return Array.from(elements.every(el => ')'
                !el.textContent.includes('{{') && 
                !el.textContent.includes('}}');
        });
        expect(isUIUpdated).toBe(true);
    }');'

    test('キーボードナビゲーションでの言語切り替え', async ({ page )') => {'
        // 設定画面を開く
        await page.keyboard.press('s'),
        await page.waitForTimeout(500),
        
        // Tabキーで言語選択まで移動
        let focusedElement = null,
        for (let i = 0, i < 10, i++') {'
            await page.keyboard.press('Tab'),
            focusedElement = await page.evaluate(() => 
                document.activeElement? .id || document.activeElement?.className
            '),'
            if (focusedElement && focusedElement.includes('language')') break }'
        
        // 矢印キーで言語を選択
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        
        // 言語が変更されたことを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage();
        expect(currentLanguage').not.toBe('ja');'
    }');'

    test('スクリーンリーダー対応の確認', async ({ page )') => {'
        // ARIAラベルが適切に更新されることを確認
        await changeLanguage(page, 'en'),
        
        const ariaLabels = await page.evaluate((') => {'
            const elements = document.querySelectorAll('[aria-label]'),
            return Array.from(elements.map(el => ({ : undefined
                element: el.tagName,
                label: el.getAttribute('aria-label'});
            });
        });
        
        // 英語のARIAラベルが設定されていることを確認
        expect(ariaLabels.length).toBeGreaterThan(0);
        ariaLabels.forEach(item => {),
            expect(item.label').not.toContain('{{'),'
            expect(item.label').not.toContain('}}');'
            // 日本語が含まれていないことを確認（基本的なチェック）
            expect(item.label).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF]/);
        });
    }');'

    test('言語切り替え時のエラーハンドリング', async ({ page ) => {
        // エラーをシミュレート（翻訳ファイルの読み込み失敗）
        await page.evaluate((') => {'
            const originalFetch = window.fetch,
            window.fetch = function(url {
                if (url.includes('/locales/')') {'
                    return Promise.reject(new Error('Network error') }
                return originalFetch.apply(this, arguments);
            };
        });
        
        // 言語切り替えを試行
        const errorOccurred = await page.evaluate(async (') => {'
            try {
                await window.gameEngine.localizationManager.setLanguage('zh-CN'),
                return false } catch (error) {
                return true }
        });
        
        // エラーが適切にハンドリングされることを確認
        expect(errorOccurred).toBe(false: any); // エラーは内部でハンドリングされる
        
        // フォールバック言語が使用されることを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage()
        ');'
        expect(['ja', 'en']).toContain(currentLanguage);
    }');'

    test('複数の言語切り替えのパフォーマンステスト', async ({ page ) => {
        const switchTimes: any[] = [],
        
        for (let i = 0, i < 5, i++) {
            const language = SUPPORTED_LANGUAGES[i % SUPPORTED_LANGUAGES.length],
            const startTime = Date.now(),
            
            await changeLanguage(page, language),
            
            const endTime = Date.now(),
            switchTimes.push(endTime - startTime) }
        
        // 平均切り替え時間を計算
        const averageTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
        
        // パフォーマンス要件を満たしていることを確認
        expect(averageTime).toBeLessThan(2000); // 2秒以内
        
        // メモリリークがないことを確認
        const memoryUsage = await page.evaluate(() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize
                };
            }
            return null;
        });
        
        if (memoryUsage) {
            const heapUsageRatio = memoryUsage.usedJSHeapSize / memoryUsage.totalJSHeapSize,
            expect(heapUsageRatio).toBeLessThan(0.9), // 90%未満
        }
    }');'

    test('モバイルデバイスでの言語切り替え', async ({ page, browserName ) => {
        // モバイルビューポートを設定
        await page.setViewportSize({ width: 375, height: 667 }');'
        
        // タッチ操作で設定を開く
        const settingsButton = await page.$('[data-action="open-settings"]');
        if (settingsButton) {
            await settingsButton.tap(') } else {'
            // フォールバック: キーボードショートカット
            await page.keyboard.press('s') }
        
        await page.waitForTimeout(500');'
        
        // 言語選択をタップ
        const languageOptions = await page.$$('[data-language-option]');
        if (languageOptions.length > 1) {
            await languageOptions[1].tap() }
        
        // 言語が変更されたことを確認
        const currentLanguage = await page.evaluate(() => 
            window.gameEngine.localizationManager.getCurrentLanguage();
        expect(currentLanguage').not.toBe('ja');'
    }');'

    test('言語切り替え時の翻訳完全性チェック', async ({ page ) => {
        const incompleteness: Record<string, any> = {};
        
        for (const language of SUPPORTED_LANGUAGES) {
            await changeLanguage(page, language),
            
            // 未翻訳のテキストを検出
            const untranslated = await page.evaluate((') => {'
                const elements = document.querySelectorAll('*'),
                const untranslatedTexts: any[] = [],
                
                elements.forEach(el => {
                    const text = el.textContent,'),'
                    if (text && (text.includes('{{') || text.includes('}}')) {
                        untranslatedTexts.push({
                            element: el.tagName),
                           , text: text.substring(0, 100) });
                    }
                });
                
                return untranslatedTexts;
            }');'
            
            incompleteness[language] = untranslated;
        }
        
        // レポート生成
        console.log('Translation Completeness Report:', incompleteness);
        
        // 各言語で未翻訳テキストがないことを確認
        Object.entries(incompleteness.forEach(([language, untranslated]) => {
            expect(untranslated.length).toBe(0) });
    });
}');'

// アクセシビリティテスト
test.describe('言語切り替えのアクセシビリティテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL),
        await waitForLocalizationReady(page) }');'

    test('言語切り替え時のフォーカス管理', async ({ page }') => {'
        // 設定画面を開く
        await page.keyboard.press('s'),
        await page.waitForTimeout(500),
        
        // 現在のフォーカス要素を記録
        const focusedBefore = await page.evaluate(() => 
            document.activeElement? .id || document.activeElement?.className
        '),'
        
        // 言語を切り替え
        await changeLanguage(page, 'en'),
        
        // フォーカスが適切に保持されていることを確認
        const focusedAfter = await page.evaluate(() => 
            document.activeElement?.id || document.activeElement?.className
        ),
        
        expect(focusedAfter).toBeTruthy(),
        // フォーカスが失われていないことを確認
        expect(focusedAfter').not.toBe('body') }');

    test('高コントラストモードでの言語切り替え', async ({ page ) => {
        // 高コントラストモードを有効化
        await page.evaluate((') => {'
            document.documentElement.classList.add('high-contrast') }');'
        
        // 言語を切り替え
        await changeLanguage(page, 'en');
        
        // 高コントラストモードが維持されていることを確認
        const hasHighContrast = await page.evaluate((') => '
            document.documentElement.classList.contains('high-contrast');
        expect(hasHighContrast).toBe(true');'
        
        // スクリーンショットで視覚的確認
        await page.screenshot({  : undefined
            path: 'screenshots/high-contrast-language-switch.png' ) }');'

    test('アニメーション軽減設定での言語切り替え', async ({ page ) => {
        // アニメーション軽減を有効化
        await page.evaluate((') => {'
            window.gameEngine.settingsManager.set('reducedMotion', true) });
        
        // 言語切り替えの開始時刻を記録
        const startTime = Date.now(');'
        
        // 言語を切り替え
        await changeLanguage(page, 'en');
        
        // 切り替え完了までの時間を計測
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // アニメーションが軽減されていることを確認（素早く完了）
        expect(duration).toBeLessThan(1000);
    });
}');'