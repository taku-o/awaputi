import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * 多言語ゲームプレイE2Eテスト
 * 
 * ゲームプレイ中の多言語対応機能の包括的なテスト
 * 実際のゲームシナリオでの言語切り替えと表示を確認
 */

import { test, expect } from '@playwright/test';

// テスト設定
const TEST_URL = 'http: //localhost:8000',
const GAME_LANGUAGES = ['ja', 'en'];
const BUBBLE_SPAWN_WAIT = 2000;
const GAME_OVER_WAIT = 3000;

// ヘルパー関数
async function waitForLocalizationReady(page {
    await page.waitForFunction(() => {
        return window.gameEngine && 
               window.gameEngine.localizationManager && 
               window.gameEngine.localizationManager.getCurrentLanguage() }, { timeout: 30000 }');'
}

async function startGame(page {
    // メインメニューからゲームを開始
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000'),'
    
    // ステージ選択（最初のステージ）
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000) }

async function changeLanguageInGame(page, language') {'
    // ゲーム中に設定を開く
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500'),'
    
    // 設定メニューを選択
    await page.keyboard.press('s');
    await page.waitForTimeout(500);
    // 言語を変更
    await page.evaluate((lang) => {
        return window.gameEngine.localizationManager.setLanguage(lang) }, language);
    
    await page.waitForTimeout(1000');'
    
    // 設定を閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500');'
    
    // ゲームに戻る
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
}

async function getGameText(page, selector) {
    const element = await page.$(selector),
    if (!element) return null,
    return await element.textContent() }

async function simulateGameOver(page {
    // HPを0にしてゲームオーバーをシミュレート
    await page.evaluate((') => {'
        if (window.gameEngine.sceneManager.currentScene.name === 'game') {
            const gameScene = window.gameEngine.sceneManager.currentScene,
            if (gameScene.hp !== undefined) {
                gameScene.hp = 0,
                gameScene.checkGameOver() }
        }
    };
    await page.waitForTimeout(GAME_OVER_WAIT');'
}

// テストスイート
test.describe('多言語ゲームプレイE2Eテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
        await waitForLocalizationReady(page) }');'

    test('ゲーム開始時のUI要素が正しく翻訳される', async ({ page } => {
        for (const language of GAME_LANGUAGES) {
            // 言語を設定
            await page.evaluate((lang) => {
                return window.gameEngine.localizationManager.setLanguage(lang) }, language);
            await page.waitForTimeout(1000);
            
            // メインメニューのテキストを確認
            const titleText = await page.evaluate((') => {'
                const lm = window.gameEngine.localizationManager,
                return lm.t('menu.title') };
            
            const startText = await page.evaluate((') => {'
                const lm = window.gameEngine.localizationManager,
                return lm.t('menu.start') }');'
            
            if (language === 'ja') {
                expect(titleText').toBe('BubblePop'),'
                expect(startText').toBe('ゲーム開始') } else if (language === 'en') {'
                expect(titleText').toBe('BubblePop'),'
                expect(startText').toBe('Start Game') }'
        }
    }');'

    test('ゲーム中のHUD要素が多言語対応している', async ({ page ) => {
        await startGame(page);
        // 各言語でHUD要素を確認
        for (const language of GAME_LANGUAGES) {
            await changeLanguageInGame(page, language);
            // HUD要素の翻訳を確認
            const hudTexts = await page.evaluate((') => {'
                const lm = window.gameEngine.localizationManager,
                return {
                    score: lm.t('game.score',
                    hp: lm.t('game.hp',
                    time: lm.t('game.time',
                    combo: lm.t('game.combo'}
                };)');'
            
            if (language === 'ja') {
                expect(hudTexts.score').toBe('スコア'),'
                expect(hudTexts.hp').toBe('HP'),'
                expect(hudTexts.time').toBe('残り時間'),'
                expect(hudTexts.combo').toBe('コンボ') } else if (language === 'en') {'
                expect(hudTexts.score').toBe('Score'),'
                expect(hudTexts.hp').toBe('HP'),'
                expect(hudTexts.time').toBe('Time Left'),'
                expect(hudTexts.combo').toBe('Combo') }'
        }
    }');'

    test('特殊効果の通知が多言語で表示される', async ({ page ) => {
        await startGame(page'),'
        
        // 特殊効果をトリガー
        const effectTests = [
            { type: 'bonusTime', key: 'effect.bonusTime' },
            { type: 'timeStop', key: 'effect.timeStop' },
            { type: 'electric', key: 'effect.electric' }
        ];
        
        for (const effect of effectTests) {
            for (const language of GAME_LANGUAGES) {
                await changeLanguageInGame(page, language);
                // 効果をトリガー
                await page.evaluate((effectType) => {
                    const gameScene = window.gameEngine.sceneManager.currentScene,
                    if (gameScene && gameScene.effectManager) {
                        switch (effectType') {'
                            case 'bonusTime':
                                gameScene.effectManager.startBonusTime('),'
                                break,
                            case 'timeStop':
                                gameScene.effectManager.startTimeStop('),'
                                break,
                            case 'electric':
                                gameScene.effectManager.startElectricEffect();
                                break }
                    }
                }, effect.type);
                
                await page.waitForTimeout(500);
                
                // 効果のテキストを確認
                const effectText = await page.evaluate((key) => {
                    return window.gameEngine.localizationManager.t(key) }, effect.key');'
                
                if (language === 'ja') {
                    switch (effect.type') {'
                        case 'bonusTime':
                            expect(effectText').toBe('ボーナスタイム'),'
                            break,
                        case 'timeStop':
                            expect(effectText').toBe('時間停止'),'
                            break,
                        case 'electric':
                            expect(effectText').toBe('ビリビリ'),'
                            break }
                } else if (language === 'en') {
                    switch (effect.type') {'
                        case 'bonusTime':
                            expect(effectText').toBe('Bonus Time'),'
                            break,
                        case 'timeStop':
                            expect(effectText').toBe('Time Stop'),'
                            break,
                        case 'electric':
                            expect(effectText').toBe('Electric'),'
                            break }
                }
            }
        }
    }');'

    test('ゲームオーバー画面が多言語対応している', async ({ page ) => {
        await startGame(page);
        for (const language of GAME_LANGUAGES) {
            // 言語を設定
            await changeLanguageInGame(page, language);
            // ゲームオーバーをトリガー
            await simulateGameOver(page);
            // ゲームオーバーテキストを確認
            const gameOverTexts = await page.evaluate((') => {'
                const lm = window.gameEngine.localizationManager,
                return {
                    gameOver: lm.t('game.gameOver',
                    finalScore: lm.t('game.finalScore',
                    clickToRestart: lm.t('game.clickToRestart'}
                };)');'
            
            if (language === 'ja') {
                expect(gameOverTexts.gameOver').toBe('ゲームオーバー'),'
                expect(gameOverTexts.finalScore').toBe('最終スコア'),'
                expect(gameOverTexts.clickToRestart').toBe('クリックして再開') } else if (language === 'en') {'
                expect(gameOverTexts.gameOver').toBe('Game Over'),'
                expect(gameOverTexts.finalScore').toBe('Final Score'),'
                expect(gameOverTexts.clickToRestart').toBe('Click to restart') }'
            
            // メインメニューに戻る
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }
    }');'

    test('ポーズメニューが多言語対応している', async ({ page ) => {
        await startGame(page);
        for (const language of GAME_LANGUAGES) {
            await changeLanguageInGame(page, language'),'
            
            // ポーズメニューを開く
            await page.keyboard.press('p');
            await page.waitForTimeout(500);
            // ポーズメニューのテキストを確認
            const pauseTexts = await page.evaluate((') => {'
                const lm = window.gameEngine.localizationManager,
                return {
                    pause: lm.t('game.pause',
                    resume: lm.t('game.resume',
                    giveUp: lm.t('game.giveUp'}
                };);
            }');'
            
            if (language === 'ja') {
                expect(pauseTexts.pause').toBe('一時停止'),'
                expect(pauseTexts.resume').toBe('再開'),'
                expect(pauseTexts.giveUp').toBe('ギブアップ') } else if (language === 'en') {'
                expect(pauseTexts.pause').toBe('Pause'),'
                expect(pauseTexts.resume').toBe('Resume'),'
                expect(pauseTexts.giveUp').toBe('Give Up') }'
            
            // ポーズを解除
            await page.keyboard.press('p');
            await page.waitForTimeout(500);
        }
    }');'

    test('バブル説明が多言語で表示される', async ({ page )') => {'
        // ヘルプ画面を開く
        await page.keyboard.press('h');
        await page.waitForTimeout(500);
        for (const language of GAME_LANGUAGES) {
            await page.evaluate((lang) => {
                return window.gameEngine.localizationManager.setLanguage(lang) }, language);
            await page.waitForTimeout(500);
            
            // バブルタイプの説明を確認
            const bubbleHelp = await page.evaluate((') => {'
                return window.gameEngine.localizationManager.t('help.bubbles') }');'
            
            if (language === 'ja') {
                expect(bubbleHelp').toContain('普通(青')'),
                expect(bubbleHelp').toContain('石(灰')'),
                expect(bubbleHelp').toContain('ピンク(回復')') } else if (language === 'en') {
                expect(bubbleHelp').toContain('Normal(blue'),'
                expect(bubbleHelp').toContain('Stone(gray'),'
                expect(bubbleHelp').toContain('Pink(heal') }'
        }
        
        // ヘルプを閉じる
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    }');'

    test('スコア数値が地域フォーマットで表示される', async ({ page ) => {
        await startGame(page);
        // スコアを獲得
        for (let i = 0, i < 10, i++') {'
            await page.click('canvas', { 
                position: { ,
                    x: 200 + Math.random() * 400 },
                    y: 200 + Math.random() * 200 
                } 
            };
            await page.waitForTimeout(200');'
        }
        
        // 各言語でスコア表示を確認
        const scoreFormats: Record<string, any> = {};
        for (const language of ['ja', 'en']) {
            await changeLanguageInGame(page, language);
            const scoreText = await page.evaluate((') => {'
                const scoreElement = document.querySelector('[data-testid="score-display"]');
                if (scoreElement) {
                    return scoreElement.textContent }
                // フォールバック: Canvas上のテキストを読み取る
                const gameScene = window.gameEngine.sceneManager.currentScene;
                return gameScene? .scoreManager?.getScore()?.toLocaleString(') || '0';'
            };
            
            scoreFormats[language] = scoreText;
        }
        
        // 数値フォーマットが適用されていることを確認
        Object.values(scoreFormats.forEach(score => {);
            expect(score).toMatch(/\d{1,3}(\d{3}*/);
        }
    }');'

    test('コンボメッセージが多言語で表示される', async ({ page } => {
        await startGame(page);
        for (const language of GAME_LANGUAGES) {
            await changeLanguageInGame(page, language);
            // コンボを作成（連続クリック）
            for (let i = 0, i < 5, i++') {'
                await page.click('canvas', {  : undefined
                    position: { x: 400, y: 300 } ),
                await page.waitForTimeout(100);
            }
            
            // コンボメッセージを確認
            const comboText = await page.evaluate(() => {
                const gameScene = window.gameEngine.sceneManager.currentScene,
                const combo = gameScene? .scoreManager?.getCombo(') || 0,'
                return { : undefined
                    combo: combo,
                    text: window.gameEngine.localizationManager.t('game.combo'}
                };);
            
            expect(comboText.combo).toBeGreaterThan(0');'
            
            if (language === 'ja') {
                expect(comboText.text').toBe('コンボ') } else if (language === 'en') {'
                expect(comboText.text').toBe('Combo') }'
            
            // コンボをリセット
            await page.waitForTimeout(2000);
        }
    }');'

    test('エラーメッセージが多言語で表示される', async ({ page ) => {
        // Canvas非対応をシミュレート
        await page.evaluate(() => {
            // Canvas APIを一時的に無効化
            window._originalCanvas = HTMLCanvasElement.prototype.getContext,
            HTMLCanvasElement.prototype.getContext = function() {
                return null }
        };
        
        // ページをリロードしてエラーを発生させる
        await page.reload();
        await page.waitForTimeout(1000);
        
        for (const language of GAME_LANGUAGES) {
            await page.evaluate((lang) => {
                if (window.gameEngine && window.gameEngine.localizationManager) {
                    window.gameEngine.localizationManager.setLanguage(lang) }
            }, language);
            
            await page.waitForTimeout(500);
            
            // エラーメッセージを確認
            const errorMessage = await page.evaluate((') => {'
                const errorElement = document.querySelector('[data-error-message]');
                if (errorElement) {
                    return errorElement.textContent }
                // フォールバック
                if (window.gameEngine && window.gameEngine.localizationManager') {'
                    return window.gameEngine.localizationManager.t('error.canvasNotSupported') }
                return null;
            };
            
            if (errorMessage') {'
                if (language === 'ja') {
                    expect(errorMessage').toContain('Canvas API'),'
                    expect(errorMessage').toContain('対応していません') } else if (language === 'en') {'
                    expect(errorMessage').toContain('Canvas API'),'
                    expect(errorMessage').toContain('not support') }'
            }
        }
        
        // Canvas APIを復元
        await page.evaluate(() => {
            if (window._originalCanvas) {
                HTMLCanvasElement.prototype.getContext = window._originalCanvas }
        }
    }');'

    test('ゲーム内通知が適切な言語で表示される', async ({ page } => {
        await startGame(page);
        // 通知タイプのリスト
        const notifications = [
            { 
                action: async () => {
                    // ピンクバブルでHP回復
                    await page.evaluate(() => {
                        const gameScene = window.gameEngine.sceneManager.currentScene,
                        if (gameScene) {
                            gameScene.hp = Math.min(gameScene.maxHP, gameScene.hp + 10'),'
                            gameScene.showNotification('hp_recovered') }
                    }');'
                },
                jaText: 'HP回復',
                enText: 'HP Recovered'
            },
            {
                action: async () => {
                    // 新記録達成
                    await page.evaluate(() => {
                        const gameScene = window.gameEngine.sceneManager.currentScene,
                        if (gameScene && gameScene.scoreManager') {'
                            gameScene.scoreManager.score = 999999,
                            gameScene.showNotification('new_record') }
                    }');'
                },
                jaText: '新記録',
                enText: 'New Record'
            }
        ];
        
        for (const notification of notifications) {
            for (const language of GAME_LANGUAGES) {
                await changeLanguageInGame(page, language);
                // 通知をトリガー
                await notification.action();
                await page.waitForTimeout(500);
                // 通知テキストを確認（実装に応じて調整）
                const notificationVisible = await page.evaluate((') => {'
                    // 通知要素を探す
                    const notifications = document.querySelectorAll('[data-notification]');
                    return notifications.length > 0 };
                
                if (notificationVisible) {
                    const notificationText = await page.evaluate((') => {'
                        const notification = document.querySelector('[data-notification]');
                        return notification ? notification.textContent: '}'),
                    
                    if (language === 'ja') {
                        expect(notificationText).toContain(notification.jaText') } else if (language === 'en') {'
                        expect(notificationText).toContain(notification.enText) }
                }
            }
        }
    }');'

    test('キーボードショートカットのヘルプが多言語対応', async ({ page ) => {
        await startGame(page);
        for (const language of GAME_LANGUAGES) {
            await changeLanguageInGame(page, language'),'
            
            // ヘルプを表示
            await page.keyboard.press('? ');
            await page.waitForTimeout(500);
            // ショートカットの説明を確認
            const shortcuts = await page.evaluate((') => {'
                const lm = window.gameEngine.localizationManager,
                return { : undefined
                    pause: lm.t('shortcuts.pause',
                    menu: lm.t('shortcuts.menu',
                    mute: lm.t('shortcuts.mute',
                    help: lm.t('shortcuts.help'}
                };)');'
            
            if (language === 'ja') {
                expect(shortcuts.pause').toBe('一時停止'),'
                expect(shortcuts.menu').toBe('メニュー'),'
                expect(shortcuts.mute').toBe('ミュート'),'
                expect(shortcuts.help').toBe('ヘルプ') } else if (language === 'en') {'
                expect(shortcuts.pause').toBe('Pause'),'
                expect(shortcuts.menu').toBe('Menu'),'
                expect(shortcuts.mute').toBe('Mute'),'
                expect(shortcuts.help').toBe('Help') }'
            
            // ヘルプを閉じる
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        }
    }
}');'