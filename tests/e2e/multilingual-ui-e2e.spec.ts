/**
 * End-to-End tests for Multi-language UI Operations
 * Tests user interface interactions in different languages
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-language UI Operations E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => (window as any).gameEngine !== undefined);
    await page.waitForFunction(() => {
      return (window as any).gameEngine.localizationManager !== undefined;
    });
  });

  test('should navigate menu in Japanese', async ({ page }) => {
    // Ensure we're in Japanese
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('ja');
    });
    
    await page.waitForTimeout(500);
    
    // Test menu navigation
    const menuTest = await page.evaluate(() => {
      const gameEngine = (window as any).gameEngine;
      const lm = gameEngine.localizationManager;
      
      // Get Japanese menu texts
      const menuTexts = {
        title: lm.t('menu.title'),
        start: lm.t('menu.start'),
        settings: lm.t('menu.settings'),
        userInfo: lm.t('menu.userInfo')
      };
      
      return menuTexts;
    });
    
    expect(menuTest.title).toBe('BubblePop');
    expect(menuTest.start).toBe('ゲーム開始');
    expect(menuTest.settings).toBe('設定');
    expect(menuTest.userInfo).toBe('ユーザー情報');
  });

  test('should navigate menu in English', async ({ page }) => {
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const menuTest = await page.evaluate(() => {
      const gameEngine = (window as any).gameEngine;
      const lm = gameEngine.localizationManager;
      
      const menuTexts = {
        title: lm.t('menu.title'),
        start: lm.t('menu.start'),
        settings: lm.t('menu.settings'),
        userInfo: lm.t('menu.userInfo')
      };
      
      return menuTexts;
    });
    
    expect(menuTest.title).toBe('BubblePop');
    expect(menuTest.start).toBe('Start Game');
    expect(menuTest.settings).toBe('Settings');
    expect(menuTest.userInfo).toBe('User Info');
  });

  test('should display game UI elements in correct language', async ({ page }) => {
    // Test game UI in Japanese
    const japaneseGameUI = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        score: lm.t('game.score'),
        hp: lm.t('game.hp'),
        time: lm.t('game.time'),
        combo: lm.t('game.combo'),
        pause: lm.t('game.pause'),
        gameOver: lm.t('game.gameOver')
      };
    });
    
    expect(japaneseGameUI.score).toBe('スコア');
    expect(japaneseGameUI.hp).toBe('HP');
    expect(japaneseGameUI.time).toBe('残り時間');
    expect(japaneseGameUI.combo).toBe('コンボ');
    expect(japaneseGameUI.pause).toBe('一時停止');
    expect(japaneseGameUI.gameOver).toBe('ゲームオーバー');
    
    // Switch to English and test
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishGameUI = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        score: lm.t('game.score'),
        hp: lm.t('game.hp'),
        time: lm.t('game.time'),
        combo: lm.t('game.combo'),
        pause: lm.t('game.pause'),
        gameOver: lm.t('game.gameOver')
      };
    });
    
    expect(englishGameUI.score).toBe('Score');
    expect(englishGameUI.hp).toBe('HP');
    expect(englishGameUI.time).toBe('Time Left');
    expect(englishGameUI.combo).toBe('Combo');
    expect(englishGameUI.pause).toBe('Pause');
    expect(englishGameUI.gameOver).toBe('Game Over');
  });

  test('should display settings UI in correct language', async ({ page }) => {
    // Test settings UI in Japanese
    const japaneseSettingsUI = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('settings.title'),
        audio: lm.t('settings.audio'),
        masterVolume: lm.t('settings.masterVolume'),
        language: lm.t('settings.language'),
        quality: lm.t('settings.quality'),
        accessibility: lm.t('settings.accessibility'),
        back: lm.t('settings.back'),
        apply: lm.t('settings.apply')
      };
    });
    
    expect(japaneseSettingsUI.title).toBe('設定');
    expect(japaneseSettingsUI.audio).toBe('音響設定');
    expect(japaneseSettingsUI.masterVolume).toBe('マスター音量');
    expect(japaneseSettingsUI.language).toBe('言語');
    expect(japaneseSettingsUI.quality).toBe('品質設定');
    expect(japaneseSettingsUI.accessibility).toBe('アクセシビリティ');
    expect(japaneseSettingsUI.back).toBe('戻る');
    expect(japaneseSettingsUI.apply).toBe('適用');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishSettingsUI = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('settings.title'),
        audio: lm.t('settings.audio'),
        masterVolume: lm.t('settings.masterVolume'),
        language: lm.t('settings.language'),
        quality: lm.t('settings.quality'),
        accessibility: lm.t('settings.accessibility'),
        back: lm.t('settings.back'),
        apply: lm.t('settings.apply')
      };
    });
    
    expect(englishSettingsUI.title).toBe('Settings');
    expect(englishSettingsUI.audio).toBe('Audio Settings');
    expect(englishSettingsUI.masterVolume).toBe('Master Volume');
    expect(englishSettingsUI.language).toBe('Language');
    expect(englishSettingsUI.quality).toBe('Quality');
    expect(englishSettingsUI.accessibility).toBe('Accessibility');
    expect(englishSettingsUI.back).toBe('Back');
    expect(englishSettingsUI.apply).toBe('Apply');
  });

  test('should display user info UI in correct language', async ({ page }) => {
    // Test user info UI in Japanese
    const japaneseUserInfoUI = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('userInfo.title'),
        playerName: lm.t('userInfo.playerName'),
        ap: lm.t('userInfo.ap'),
        tap: lm.t('userInfo.tap'),
        unlockedStages: lm.t('userInfo.unlockedStages'),
        ownedItems: lm.t('userInfo.ownedItems'),
        highScores: lm.t('userInfo.highScores'),
        noRecords: lm.t('userInfo.noRecords')
      };
    });
    
    expect(japaneseUserInfoUI.title).toBe('ユーザー情報');
    expect(japaneseUserInfoUI.playerName).toBe('プレイヤー名');
    expect(japaneseUserInfoUI.ap).toBe('所持AP');
    expect(japaneseUserInfoUI.tap).toBe('総TAP');
    expect(japaneseUserInfoUI.unlockedStages).toBe('開放済みステージ');
    expect(japaneseUserInfoUI.ownedItems).toBe('所持アイテム');
    expect(japaneseUserInfoUI.highScores).toBe('ハイスコア');
    expect(japaneseUserInfoUI.noRecords).toBe('まだ記録がありません');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishUserInfoUI = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('userInfo.title'),
        playerName: lm.t('userInfo.playerName'),
        ap: lm.t('userInfo.ap'),
        tap: lm.t('userInfo.tap'),
        unlockedStages: lm.t('userInfo.unlockedStages'),
        ownedItems: lm.t('userInfo.ownedItems'),
        highScores: lm.t('userInfo.highScores'),
        noRecords: lm.t('userInfo.noRecords')
      };
    });
    
    expect(englishUserInfoUI.title).toBe('User Information');
    expect(englishUserInfoUI.playerName).toBe('Player Name');
    expect(englishUserInfoUI.ap).toBe('AP');
    expect(englishUserInfoUI.tap).toBe('Total AP');
    expect(englishUserInfoUI.unlockedStages).toBe('Unlocked Stages');
    expect(englishUserInfoUI.ownedItems).toBe('Owned Items');
    expect(englishUserInfoUI.highScores).toBe('High Scores');
    expect(englishUserInfoUI.noRecords).toBe('No records yet');
  });

  test('should display help content in correct language', async ({ page }) => {
    // Test help content in Japanese
    const japaneseHelp = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('help.title'),
        basicControls: lm.t('help.basicControls'),
        gameTips: lm.t('help.gameTips'),
        bubbleTypes: lm.t('help.bubbleTypes'),
        controls: lm.ta('help.controls'),
        tips: lm.ta('help.tips')
      };
    });
    
    expect(japaneseHelp.title).toBe('操作説明');
    expect(japaneseHelp.basicControls).toBe('基本操作');
    expect(japaneseHelp.gameTips).toBe('ゲームのコツ');
    expect(Array.isArray(japaneseHelp.controls)).toBe(true);
    expect(Array.isArray(japaneseHelp.tips)).toBe(true);
    expect(japaneseHelp.controls[0]).toContain('クリック');
    expect(japaneseHelp.tips[0]).toContain('泡は時間が経つと');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishHelp = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('help.title'),
        basicControls: lm.t('help.basicControls'),
        gameTips: lm.t('help.gameTips'),
        bubbleTypes: lm.t('help.bubbleTypes'),
        controls: lm.ta('help.controls'),
        tips: lm.ta('help.tips')
      };
    });
    
    expect(englishHelp.title).toBe('Controls');
    expect(englishHelp.basicControls).toBe('Basic Controls');
    expect(englishHelp.gameTips).toBe('Game Tips');
    expect(Array.isArray(englishHelp.controls)).toBe(true);
    expect(Array.isArray(englishHelp.tips)).toBe(true);
    expect(englishHelp.controls[0]).toContain('Click');
    expect(englishHelp.tips[0]).toContain('Bubbles become dangerous');
  });

  test('should display error messages in correct language', async ({ page }) => {
    // Test error messages in Japanese
    const japaneseErrors = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        generic: lm.t('error.generic'),
        reload: lm.t('error.reload'),
        canvasNotSupported: lm.t('error.canvasNotSupported'),
        audioNotSupported: lm.t('error.audioNotSupported'),
        storageNotSupported: lm.t('error.storageNotSupported')
      };
    });
    
    expect(japaneseErrors.generic).toBe('エラーが発生しました');
    expect(japaneseErrors.reload).toBe('再読み込み');
    expect(japaneseErrors.canvasNotSupported).toContain('Canvas API');
    expect(japaneseErrors.audioNotSupported).toContain('音声機能');
    expect(japaneseErrors.storageNotSupported).toContain('データの保存');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishErrors = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        generic: lm.t('error.generic'),
        reload: lm.t('error.reload'),
        canvasNotSupported: lm.t('error.canvasNotSupported'),
        audioNotSupported: lm.t('error.audioNotSupported'),
        storageNotSupported: lm.t('error.storageNotSupported')
      };
    });
    
    expect(englishErrors.generic).toBe('An error occurred');
    expect(englishErrors.reload).toBe('Reload');
    expect(englishErrors.canvasNotSupported).toContain('Canvas API');
    expect(englishErrors.audioNotSupported).toContain('Audio features');
    expect(englishErrors.storageNotSupported).toContain('Data storage');
  });

  test('should display confirmation dialogs in correct language', async ({ page }) => {
    // Test confirmation dialogs in Japanese
    const japaneseConfirms = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        yes: lm.t('confirm.yes'),
        no: lm.t('confirm.no'),
        ok: lm.t('confirm.ok'),
        cancel: lm.t('confirm.cancel')
      };
    });
    
    expect(japaneseConfirms.yes).toBe('はい');
    expect(japaneseConfirms.no).toBe('いいえ');
    expect(japaneseConfirms.ok).toBe('OK');
    expect(japaneseConfirms.cancel).toBe('キャンセル');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishConfirms = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        yes: lm.t('confirm.yes'),
        no: lm.t('confirm.no'),
        ok: lm.t('confirm.ok'),
        cancel: lm.t('confirm.cancel')
      };
    });
    
    expect(englishConfirms.yes).toBe('Yes');
    expect(englishConfirms.no).toBe('No');
    expect(englishConfirms.ok).toBe('OK');
    expect(englishConfirms.cancel).toBe('Cancel');
  });

  test('should display special effects text in correct language', async ({ page }) => {
    // Test special effects in Japanese
    const japaneseEffects = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        bonusTime: lm.t('effect.bonusTime'),
        timeStop: lm.t('effect.timeStop'),
        electric: lm.t('effect.electric'),
        operationDisabled: lm.t('effect.operationDisabled'),
        scoreDouble: lm.t('effect.scoreDouble')
      };
    });
    
    expect(japaneseEffects.bonusTime).toBe('ボーナスタイム');
    expect(japaneseEffects.timeStop).toBe('時間停止');
    expect(japaneseEffects.electric).toBe('ビリビリ');
    expect(japaneseEffects.operationDisabled).toBe('操作不能!');
    expect(japaneseEffects.scoreDouble).toBe('スコア2倍!');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishEffects = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        bonusTime: lm.t('effect.bonusTime'),
        timeStop: lm.t('effect.timeStop'),
        electric: lm.t('effect.electric'),
        operationDisabled: lm.t('effect.operationDisabled'),
        scoreDouble: lm.t('effect.scoreDouble')
      };
    });
    
    expect(englishEffects.bonusTime).toBe('Bonus Time');
    expect(englishEffects.timeStop).toBe('Time Stop');
    expect(englishEffects.electric).toBe('Electric');
    expect(englishEffects.operationDisabled).toBe('Controls Disabled!');
    expect(englishEffects.scoreDouble).toBe('Score x2!');
  });

  test('should handle data clear dialog in correct language', async ({ page }) => {
    // Test data clear dialog in Japanese
    const japaneseDataClear = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('dataClear.title'),
        warning: lm.t('dataClear.warning'),
        irreversible: lm.t('dataClear.irreversible'),
        items: lm.ta('dataClear.items'),
        execute: lm.t('dataClear.execute'),
        cancel: lm.t('dataClear.cancel')
      };
    });
    
    expect(japaneseDataClear.title).toBe('データクリア確認');
    expect(japaneseDataClear.warning).toBe('すべてのデータが削除されます。');
    expect(japaneseDataClear.irreversible).toBe('この操作は取り消せません。');
    expect(Array.isArray(japaneseDataClear.items)).toBe(true);
    expect(japaneseDataClear.items[0]).toBe('ユーザー名');
    expect(japaneseDataClear.execute).toBe('削除実行');
    expect(japaneseDataClear.cancel).toBe('キャンセル');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishDataClear = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('dataClear.title'),
        warning: lm.t('dataClear.warning'),
        irreversible: lm.t('dataClear.irreversible'),
        items: lm.ta('dataClear.items'),
        execute: lm.t('dataClear.execute'),
        cancel: lm.t('dataClear.cancel')
      };
    });
    
    expect(englishDataClear.title).toBe('Confirm Data Clear');
    expect(englishDataClear.warning).toBe('All data will be deleted.');
    expect(englishDataClear.irreversible).toBe('This operation cannot be undone.');
    expect(Array.isArray(englishDataClear.items)).toBe(true);
    expect(englishDataClear.items[0]).toBe('Username');
    expect(englishDataClear.execute).toBe('Delete');
    expect(englishDataClear.cancel).toBe('Cancel');
  });

  test('should handle username registration dialog in correct language', async ({ page }) => {
    // Test username registration in Japanese
    const japaneseUsername = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        register: lm.t('username.register'),
        change: lm.t('username.change'),
        prompt: lm.t('username.prompt'),
        inputHelp: lm.t('username.inputHelp'),
        ok: lm.t('username.ok'),
        cancel: lm.t('username.cancel')
      };
    });
    
    expect(japaneseUsername.register).toBe('ユーザー名登録');
    expect(japaneseUsername.change).toBe('ユーザー名変更');
    expect(japaneseUsername.prompt).toContain('ユーザー名を入力');
    expect(japaneseUsername.inputHelp).toContain('Enter');
    expect(japaneseUsername.ok).toBe('OK');
    expect(japaneseUsername.cancel).toBe('キャンセル');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishUsername = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        register: lm.t('username.register'),
        change: lm.t('username.change'),
        prompt: lm.t('username.prompt'),
        inputHelp: lm.t('username.inputHelp'),
        ok: lm.t('username.ok'),
        cancel: lm.t('username.cancel')
      };
    });
    
    expect(englishUsername.register).toBe('Register Username');
    expect(englishUsername.change).toBe('Change Username');
    expect(englishUsername.prompt).toContain('Enter username');
    expect(englishUsername.inputHelp).toContain('Enter');
    expect(englishUsername.ok).toBe('OK');
    expect(englishUsername.cancel).toBe('Cancel');
  });

  test('should display keyboard shortcuts in correct language', async ({ page }) => {
    // Test keyboard shortcuts in Japanese
    const japaneseShortcuts = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('shortcuts.title'),
        pause: lm.t('shortcuts.pause'),
        menu: lm.t('shortcuts.menu'),
        fullscreen: lm.t('shortcuts.fullscreen'),
        mute: lm.t('shortcuts.mute'),
        settings: lm.t('shortcuts.settings'),
        help: lm.t('shortcuts.help')
      };
    });
    
    expect(japaneseShortcuts.title).toBe('キーボードショートカット');
    expect(japaneseShortcuts.pause).toBe('一時停止');
    expect(japaneseShortcuts.menu).toBe('メニュー');
    expect(japaneseShortcuts.fullscreen).toBe('フルスクリーン');
    expect(japaneseShortcuts.mute).toBe('ミュート');
    expect(japaneseShortcuts.settings).toBe('設定');
    expect(japaneseShortcuts.help).toBe('ヘルプ');
    
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishShortcuts = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        title: lm.t('shortcuts.title'),
        pause: lm.t('shortcuts.pause'),
        menu: lm.t('shortcuts.menu'),
        fullscreen: lm.t('shortcuts.fullscreen'),
        mute: lm.t('shortcuts.mute'),
        settings: lm.t('shortcuts.settings'),
        help: lm.t('shortcuts.help')
      };
    });
    
    expect(englishShortcuts.title).toBe('Keyboard Shortcuts');
    expect(englishShortcuts.pause).toBe('Pause');
    expect(englishShortcuts.menu).toBe('Menu');
    expect(englishShortcuts.fullscreen).toBe('Fullscreen');
    expect(englishShortcuts.mute).toBe('Mute');
    expect(englishShortcuts.settings).toBe('Settings');
    expect(englishShortcuts.help).toBe('Help');
  });
});

test.describe('Regional Localization Features E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => (window as any).gameEngine !== undefined);
  });

  test('should format numbers according to locale', async ({ page }) => {
    const numberFormatTest = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      const testNumber = 12345.67;
      
      return {
        japanese: lm.formatNumber(testNumber, 'ja'),
        english: lm.formatNumber(testNumber, 'en'),
        englishGB: lm.formatNumber(testNumber, 'en-GB'),
        german: lm.formatNumber(testNumber, 'de')
      };
    });
    
    expect(numberFormatTest.japanese).toBe('12,345.67');
    expect(numberFormatTest.english).toBe('12,345.67');
    // The exact format may vary based on browser implementation
    expect(typeof numberFormatTest.englishGB).toBe('string');
    expect(typeof numberFormatTest.german).toBe('string');
  });

  test('should format dates according to locale', async ({ page }) => {
    const dateFormatTest = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      const testDate = new Date('2025-01-15T10:30:00Z');
      
      return {
        japanese: lm.formatDate(testDate, 'ja'),
        english: lm.formatDate(testDate, 'en'),
        englishGB: lm.formatDate(testDate, 'en-GB'),
        german: lm.formatDate(testDate, 'de')
      };
    });
    
    // Date formatting results may vary based on timezone and browser
    expect(typeof dateFormatTest.japanese).toBe('string');
    expect(typeof dateFormatTest.english).toBe('string');
    expect(typeof dateFormatTest.englishGB).toBe('string');
    expect(typeof dateFormatTest.german).toBe('string');
    
    // All should contain the year 2025
    expect(dateFormatTest.japanese).toContain('2025');
    expect(dateFormatTest.english).toContain('2025');
  });

  test('should format currency according to locale', async ({ page }) => {
    const currencyFormatTest = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      const amount = 1234.56;
      
      return {
        usdJapanese: lm.formatCurrency(amount, 'ja', 'USD'),
        usdEnglish: lm.formatCurrency(amount, 'en', 'USD'),
        jpyJapanese: lm.formatCurrency(amount, 'ja', 'JPY'),
        eurGerman: lm.formatCurrency(amount, 'de', 'EUR')
      };
    });
    
    // Currency formatting should include currency symbols or codes
    expect(currencyFormatTest.usdJapanese).toContain('$');
    expect(currencyFormatTest.usdEnglish).toContain('$');
    expect(currencyFormatTest.jpyJapanese).toContain('¥');
    expect(currencyFormatTest.eurGerman).toContain('€');
  });

  test('should provide correct regional settings', async ({ page }) => {
    const regionalSettingsTest = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      
      return {
        japanese: lm.getRegionalSettings('ja'),
        english: lm.getRegionalSettings('en'),
        englishGB: lm.getRegionalSettings('en-gb'),
        german: lm.getRegionalSettings('de')
      };
    });
    
    // Test Japanese settings
    expect(regionalSettingsTest.japanese.language).toBe('ja');
    expect(regionalSettingsTest.japanese.direction).toBe('ltr');
    expect(regionalSettingsTest.japanese.locale).toBe('ja-JP');
    
    // Test English settings
    expect(regionalSettingsTest.english.language).toBe('en');
    expect(regionalSettingsTest.english.direction).toBe('ltr');
    expect(regionalSettingsTest.english.locale).toBe('en-US');
    
    // Test English GB settings
    expect(regionalSettingsTest.englishGB.language).toBe('en-gb');
    expect(regionalSettingsTest.englishGB.locale).toBe('en-GB');
    
    // Test German settings
    expect(regionalSettingsTest.german.language).toBe('de');
    expect(regionalSettingsTest.german.locale).toBe('de-DE');
  });
});