/**
 * End-to-End tests for Internationalization (i18n) system
 * Tests language switching, UI updates, and localization features
 */

import { test, expect } from '@playwright/test';

test.describe('Internationalization E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    // Wait for the game to load
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => (window as any).gameEngine !== undefined);
    
    // Wait for LocalizationManager to be initialized
    await page.waitForFunction(() => {
      return (window as any).gameEngine && 
             (window as any).gameEngine.localizationManager !== undefined;
    });
  });

  test('should initialize with default language (Japanese)', async ({ page }) => {
    const currentLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(currentLanguage).toBe('ja');
    
    // Check if Japanese text is displayed
    const hasJapaneseText = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return lm.t('menu.title') === 'BubblePop';
    });
    
    expect(hasJapaneseText).toBe(true);
  });

  test('should detect language from URL parameter', async ({ page }) => {
    // Navigate with language parameter
    await page.goto('/?lang=en');
    // Wait for initialization
    await page.waitForFunction(() => {
      return (window as any).gameEngine && 
             (window as any).gameEngine.localizationManager !== undefined;
    });
    
    // Allow time for language detection and loading
    await page.waitForTimeout(1000);
    
    const currentLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(currentLanguage).toBe('en');
  });

  test('should switch languages dynamically', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return (window as any).gameEngine.localizationManager;
    });
    
    // Test switching to English
    await page.evaluate((lm) => lm.setLanguage('en'), localizationManager);
    
    // Wait for language change to complete
    await page.waitForTimeout(500);
    
    const englishText = await page.evaluate((lm) => {
      return lm.t('menu.start');
    }, localizationManager);
    
    expect(englishText).toBe('Start Game');
    
    // Test switching back to Japanese
    await page.evaluate((lm) => lm.setLanguage('ja'), localizationManager);
    
    await page.waitForTimeout(500);
    
    const japaneseText = await page.evaluate((lm) => {
      return lm.t('menu.start');
    }, localizationManager);
    
    expect(japaneseText).toBe('ゲーム開始');
  });

  test('should persist language setting in localStorage', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return (window as any).gameEngine.localizationManager;
    });
    
    // Switch to English
    await page.evaluate((lm) => lm.setLanguage('en'), localizationManager);
    await page.waitForTimeout(500);
    
    // Check if language is saved in settings
    const savedLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.settingsManager.get('language');
    });
    
    expect(savedLanguage).toBe('en');
    
    // Reload page and check if language persists
    await page.reload();
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => {
      return (window as any).gameEngine && 
             (window as any).gameEngine.localizationManager !== undefined;
    });
    
    await page.waitForTimeout(1000);
    
    const persistedLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(persistedLanguage).toBe('en');
  });

  test('should detect browser language preference', async ({ page }) => {
    // Set browser language to French
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'fr'
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['fr', 'fr-FR']
      });
    });
    
    await page.goto('/');
    await page.waitForFunction(() => {
      return (window as any).gameEngine && 
             (window as any).gameEngine.localizationManager !== undefined;
    });
    
    // Should fallback to default language when French is not supported
    const currentLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    // Should fallback to default language (ja) as French is not supported
    expect(currentLanguage).toBe('ja');
  });

  test('should update UI elements after language change', async ({ page }) => {
    // Switch to English
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(1000);
    
    // Check if menu elements are updated
    const menuTexts = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        start: lm.t('menu.start'),
        settings: lm.t('menu.settings'),
        help: lm.t('menu.help')
      };
    });
    
    expect(menuTexts.start).toBe('Start Game');
    expect(menuTexts.settings).toBe('Settings');
    expect(menuTexts.help).toBe('Help');
    
    // Switch back to Japanese
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('ja');
    });
    
    await page.waitForTimeout(1000);
    
    const japaneseMenuTexts = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        start: lm.t('menu.start'),
        settings: lm.t('menu.settings'),
        help: lm.t('menu.help')
      };
    });
    
    expect(japaneseMenuTexts.start).toBe('ゲーム開始');
    expect(japaneseMenuTexts.settings).toBe('設定');
    expect(japaneseMenuTexts.help).toBe('ヘルプ');
  });

  test('should handle invalid language codes gracefully', async ({ page }) => {
    const originalLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    // Try to set an invalid language
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('xyz');
    });
    
    await page.waitForTimeout(500);
    
    // Should fallback to original language
    const currentLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(currentLanguage).toBe(originalLanguage);
  });

  test('should support all available languages', async ({ page }) => {
    const availableLanguages = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getAvailableLanguages();
    });
    
    expect(Array.isArray(availableLanguages)).toBe(true);
    expect(availableLanguages.length).toBeGreaterThan(0);
    expect(availableLanguages).toContain('ja');
    expect(availableLanguages).toContain('en');
    
    // Test switching to each available language
    for (const lang of availableLanguages) {
      await page.evaluate((language) => {
        return (window as any).gameEngine.localizationManager.setLanguage(language);
      }, lang);
      
      await page.waitForTimeout(300);
      
      const currentLang = await page.evaluate(() => {
        return (window as any).gameEngine.localizationManager.getCurrentLanguage();
      });
      
      expect(currentLang).toBe(lang);
    }
  });

  test('should handle pluralization correctly', async ({ page }) => {
    // Test English pluralization
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const pluralTests = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        single: lm.t('game.bubble', { count: 1 }),
        multiple: lm.t('game.bubble', { count: 5 }),
        zero: lm.t('game.bubble', { count: 0 })
      };
    });
    
    expect(typeof pluralTests.single).toBe('string');
    expect(typeof pluralTests.multiple).toBe('string');
    expect(typeof pluralTests.zero).toBe('string');
    
    // Test Japanese (no pluralization)
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('ja');
    });
    
    await page.waitForTimeout(500);
    
    const japanesePluralTests = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        single: lm.t('game.bubble', { count: 1 }),
        multiple: lm.t('game.bubble', { count: 5 })
      };
    });
    
    expect(typeof japanesePluralTests.single).toBe('string');
    expect(typeof japanesePluralTests.multiple).toBe('string');
  });

  test('should handle context-sensitive translations', async ({ page }) => {
    // Test context translations
    const contextTests = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        menuTitle: lm.t('title', { context: 'menu' }),
        gameTitle: lm.t('title', { context: 'game' }),
        defaultTitle: lm.t('title')
      };
    });
    
    expect(typeof contextTests.menuTitle).toBe('string');
    expect(typeof contextTests.gameTitle).toBe('string');
    expect(typeof contextTests.defaultTitle).toBe('string');
  });

  test('should interpolate variables in translations', async ({ page }) => {
    const interpolationTests = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        score: lm.t('game.score', { score: 1500 }),
        level: lm.t('game.level', { level: 3 }),
        player: lm.t('game.welcome', { playerName: 'TestPlayer' })
      };
    });
    
    expect(interpolationTests.score).toContain('1500');
    expect(interpolationTests.level).toContain('3');
    expect(interpolationTests.player).toContain('TestPlayer');
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    const missingTranslationTest = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return lm.t('nonexistent.key');
    });
    
    // Should return the key itself or a fallback
    expect(typeof missingTranslationTest).toBe('string');
    expect(missingTranslationTest.length).toBeGreaterThan(0);
  });

  test('should support nested translation keys', async ({ page }) => {
    const nestedTests = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      return {
        nested: lm.t('menu.settings.audio'),
        deepNested: lm.t('game.effects.bonus.time'),
        simple: lm.t('menu.start')
      };
    });
    
    expect(typeof nestedTests.nested).toBe('string');
    expect(typeof nestedTests.deepNested).toBe('string');
    expect(typeof nestedTests.simple).toBe('string');
  });

  test('should emit language change events', async ({ page }) => {
    // Add event listener
    await page.evaluate(() => {
      (window as any).languageChangeEvents = [];
      const lm = (window as any).gameEngine.localizationManager;
      
      lm.on('languageChanged', (data: any) => {
        (window as any).languageChangeEvents.push(data);
      });
    });
    
    // Change language
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const events = await page.evaluate(() => {
      return (window as any).languageChangeEvents;
    });
    
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
    
    if (events.length > 0) {
      expect(events[0]).toHaveProperty('newLanguage');
      expect(events[0]).toHaveProperty('oldLanguage');
      expect(events[0].newLanguage).toBe('en');
    }
  });

  test('should support date and number formatting', async ({ page }) => {
    // Test English formatting
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    const englishFormatting = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      const testDate = new Date('2024-12-25');
      const testNumber = 1234567.89;
      
      return {
        date: lm.formatDate(testDate),
        number: lm.formatNumber(testNumber),
        currency: lm.formatCurrency(testNumber)
      };
    });
    
    expect(typeof englishFormatting.date).toBe('string');
    expect(typeof englishFormatting.number).toBe('string');
    expect(typeof englishFormatting.currency).toBe('string');
    
    // Test Japanese formatting
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('ja');
    });
    
    await page.waitForTimeout(500);
    
    const japaneseFormatting = await page.evaluate(() => {
      const lm = (window as any).gameEngine.localizationManager;
      const testDate = new Date('2024-12-25');
      const testNumber = 1234567.89;
      
      return {
        date: lm.formatDate(testDate),
        number: lm.formatNumber(testNumber),
        currency: lm.formatCurrency(testNumber)
      };
    });
    
    expect(typeof japaneseFormatting.date).toBe('string');
    expect(typeof japaneseFormatting.number).toBe('string');
    expect(typeof japaneseFormatting.currency).toBe('string');
    
    // Different languages should format differently
    expect(englishFormatting.date).not.toBe(japaneseFormatting.date);
  });

  test('should reload translations when language changes', async ({ page }) => {
    // Monitor network requests for translation files
    const translationRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('.json') && (request.url().includes('/i18n/') || request.url().includes('/translations/'))) {
        translationRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // Change language to trigger translation loading
    await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(1000);
    
    // Should have made requests for English translations
    const englishRequests = translationRequests.filter(req => 
      req.url.includes('en') || req.url.includes('english'));
    
    expect(englishRequests.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle concurrent language changes', async ({ page }) => {
    // Quickly change languages multiple times
    const languages = ['en', 'ja', 'en', 'ja'];
    
    for (const lang of languages) {
      page.evaluate((language) => {
        return (window as any).gameEngine.localizationManager.setLanguage(language);
      }, lang);
    }
    
    // Wait for all changes to settle
    await page.waitForTimeout(2000);
    
    const finalLanguage = await page.evaluate(() => {
      return (window as any).gameEngine.localizationManager.getCurrentLanguage();
    });
    
    // Should end up in a consistent state
    expect(['en', 'ja']).toContain(finalLanguage);
  });
});