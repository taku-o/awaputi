import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
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
    await page.waitForFunction(() => window.gameEngine !== undefined);
    
    // Wait for LocalizationManager to be initialized
    await page.waitForFunction(() => {
      return window.gameEngine && 
             window.gameEngine.localizationManager !== undefined;
    });
  });

  test('should initialize with default language (Japanese)', async ({ page }) => {
    const currentLanguage = await page.evaluate(() => {
      return window.gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(currentLanguage).toBe('ja');
    
    // Check if Japanese text is displayed
    const hasJapaneseText = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      return lm.t('menu.title') === 'BubblePop';
    });
    
    expect(hasJapaneseText).toBe(true;
  });

  test('should detect language from URL parameter', async ({ page }) => {
    // Navigate with language parameter
    await page.goto('/?lang=en');
    
    // Wait for initialization
    await page.waitForFunction(() => {
      return window.gameEngine && 
             window.gameEngine.localizationManager !== undefined;
    });
    
    // Allow time for language detection and loading
    await page.waitForTimeout(1000);
    
    const currentLanguage = await page.evaluate(() => {
      return window.gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(currentLanguage).toBe('en');
  });

  test('should switch languages dynamically', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
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
      return window.gameEngine.localizationManager;
    });
    
    // Switch to English
    await page.evaluate((lm) => lm.setLanguage('en'), localizationManager);
    await page.waitForTimeout(500);
    
    // Check if language is saved in settings
    const savedLanguage = await page.evaluate(() => {
      return window.gameEngine.settingsManager.get('language');
    });
    
    expect(savedLanguage).toBe('en');
    
    // Reload page and check if language persists
    await page.reload();
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => {
      return window.gameEngine && 
             window.gameEngine.localizationManager !== undefined;
    });
    
    const currentLanguage = await page.evaluate(() => {
      return window.gameEngine.localizationManager.getCurrentLanguage();
    });
    
    expect(currentLanguage).toBe('en');
  });

  test('should handle translation parameters correctly', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Test parameter interpolation
    const translationWithParams = await page.evaluate((lm) => {
      // Add a test translation with parameters
      lm.addTranslations('en', {
        'test.greeting': 'Hello, {{name}}!'
      });
      
      return lm.t('test.greeting', { name: 'World' });
    }, localizationManager);
    
    expect(translationWithParams).toBe('Hello, World!');
  });

  test('should fallback to default language for missing translations', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Add translation only in Japanese
    await page.evaluate((lm) => {
      lm.addTranslations('ja', {
        'test.japanese.only': '日本語のみ'
      });
    }, localizationManager);
    
    // Switch to English
    await page.evaluate((lm) => lm.setLanguage('en'), localizationManager);
    await page.waitForTimeout(500);
    
    // Try to get Japanese-only translation - should fallback
    const fallbackResult = await page.evaluate((lm) => {
      return lm.t('test.japanese.only');
    }, localizationManager);
    
    // Should return the key if not found in fallback language
    expect(fallbackResult).toBe('test.japanese.only');
  });

  test('should handle array translations correctly', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Test array translation
    const helpControls = await page.evaluate((lm) => {
      return lm.ta('help.controls');
    }, localizationManager);
    
    expect(Array.isArray(helpControls).toBe(true;
    expect(helpControls.length).toBeGreaterThan(0);
    expect(helpControls[0]).toContain('クリック');
  });

  test('should provide correct language information', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Test language info for Japanese
    const japaneseInfo = await page.evaluate((lm) => {
      return lm.getLanguageInfo('ja');
    }, localizationManager);
    
    expect(japaneseInfo.native).toBe('日本語');
    expect(japaneseInfo.english).toBe('Japanese');
    
    // Test language info for English
    const englishInfo = await page.evaluate((lm) => {
      return lm.getLanguageInfo('en');
    }, localizationManager);
    
    expect(englishInfo.native).toBe('English');
    expect(englishInfo.english).toBe('English');
  });

  test('should handle cultural adaptation correctly', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Test cultural adaptation for Japanese
    const japaneseCultural = await page.evaluate((lm) => {
      return lm.getCulturalAdaptation('ja');
    }, localizationManager);
    
    expect(japaneseCultural.isRTL).toBe(false;
    expect(japaneseCultural.textDirection).toBe('ltr');
    expect(japaneseCultural.dateFormat).toBe('YYYY年MM月DD日');
    
    // Test RTL language detection
    await page.evaluate((lm) => {
      return lm.setLanguage('ar');
    }, localizationManager);
    
    const arabicCultural = await page.evaluate((lm) => {
      return lm.getCulturalAdaptation('ar');
    }, localizationManager);
    
    expect(arabicCultural.isRTL).toBe(true;
    expect(arabicCultural.textDirection).toBe('rtl');
  });

  test('should provide translation statistics', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    const stats = await page.evaluate((lm) => {
      return lm.getStats();
    }, localizationManager);
    
    expect(stats.currentLanguage).toBe('ja');
    expect(Array.isArray(stats.availableLanguages)).toBe(true;
    expect(stats.availableLanguages.includes('ja')).toBe(true;
    expect(stats.availableLanguages.includes('en')).toBe(true;
    expect(typeof stats.translationCounts).toBe('object');
    expect(stats.translationCounts.ja).toBeGreaterThan(0);
    expect(stats.translationCounts.en).toBeGreaterThan(0);
  });

  test('should validate translations correctly', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    const validationResults = await page.evaluate((lm) => {
      return lm.validateTranslations();
    }, localizationManager);
    
    expect(typeof validationResults).toBe('object');
    
    // Check if English validation results exist
    if (validationResults.en) {
      expect(Array.isArray(validationResults.en.missing)).toBe(true;
      expect(Array.isArray(validationResults.en.extra)).toBe(true;
      expect(typeof validationResults.en.total).toBe('number');
      expect(typeof validationResults.en.coverage).toBe('number');
    }
  });

  test('should handle accessibility translations', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Test accessibility-specific translation
    const a11yTranslation = await page.evaluate((lm) => {
      return lm.ta11y('accessibility.manager.title');
    }, localizationManager);
    
    expect(typeof a11yTranslation).toBe('string');
    expect(a11yTranslation).toBe('アクセシビリティ設定');
    
    // Switch to English and test
    await page.evaluate((lm) => lm.setLanguage('en'), localizationManager);
    await page.waitForTimeout(500);
    
    const englishA11yTranslation = await page.evaluate((lm) => {
      return lm.ta11y('accessibility.manager.title');
    }, localizationManager);
    
    expect(englishA11yTranslation).toBe('Accessibility Settings');
  });

  test('should handle number, date, and currency formatting', async ({ page }) => {
    const localizationManager = await page.evaluateHandle(() => {
      return window.gameEngine.localizationManager;
    });
    
    // Test number formatting for Japanese
    const japaneseNumber = await page.evaluate((lm) => {
      return lm.formatCulturalText(12345.67, 'number', 'ja');
    }, localizationManager);
    
    expect(japaneseNumber).toBe('12,345.67');
    
    // Test date formatting for Japanese
    const testDate = new Date('2025-01-15');
    const japaneseDate = await page.evaluate((lm, date) => {
      return lm.formatCulturalText(date, 'date', 'ja');
    }, localizationManager, testDate.toISOString());
    
    expect(japaneseDate).toContain('2025');
    
    // Test currency formatting
    const japaneseCurrency = await page.evaluate((lm) => {
      return lm.formatCulturalText(1000, 'currency', 'ja');
    }, localizationManager);
    
    expect(japaneseCurrency).toContain('USD');
  });

  test('should handle language change events', async ({ page }) => {
    let eventFired = false;
    
    // Set up language change listener
    await page.evaluate(() => {
      window.testLanguageChangeEvent = false;
      
      window.gameEngine.localizationManager.addLanguageChangeListener(
        (newLang, oldLang) => {
          window.testLanguageChangeEvent = { newLang, oldLang };
        }
      );
    });
    
    // Trigger language change
    await page.evaluate(() => {
      return window.gameEngine.localizationManager.setLanguage('en');
    });
    
    await page.waitForTimeout(500);
    
    // Check if event was fired
    const eventData = await page.evaluate(() => {
      return window.testLanguageChangeEvent;
    });
    
    expect(eventData).toBeTruthy();
    expect(eventData.newLang).toBe('en');
    expect(eventData.oldLang).toBe('ja');
  });

  test('should load external translation files asynchronously', async ({ page }) => {
    // This test verifies that the TranslationLoader works correctly
    const loadResult = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      // Try to load a language that hasn't been loaded yet
      const result = await lm.loadLanguageData('zh-CN');
      return result;
    });
    
    // The result depends on whether zh-CN translation files exist
    // For now, we just verify the method doesn't throw an error
    expect(typeof loadResult).toBe('boolean');
  });

  test('should handle font loading for different languages', async ({ page }) => {
    const fontLoadingResult = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      try {
        // Test font loading for Japanese
        await lm.loadFontsForLanguage('ja');
        
        // Get font stack
        const fontStack = lm.getFontStack('primary');
        
        return {
          success: true,
          fontStack: fontStack
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    expect(fontLoadingResult.success).toBe(true;
    expect(typeof fontLoadingResult.fontStack).toBe('string');
  });

  test('should maintain performance standards', async ({ page }) => {
    const performanceTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test translation retrieval performance
      const start = performance.now();
      
      // Perform 100 translation lookups
      for (let i = 0; i < 100; i++) {
        lm.t('menu.title');
        lm.t('menu.start');
        lm.t('game.score');
        lm.t('settings.title');
        lm.t('error.generic');
      }
      
      const end = performance.now();
      const averageTime = (end - start) / 500; // 500 total lookups
      
      return averageTime;
    });
    
    // Each translation should take less than 1ms on average
    expect(performanceTest).toBeLessThan(1);
  });

  test('should cleanup properly', async ({ page }) => {
    const cleanupResult = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      try {
        // Add some test data
        lm.addAccessibilityTranslations('test', { 'test.key': 'test value' });
        
        // Cleanup
        lm.cleanup();
        
        // Verify cleanup
        const stats = lm.getAccessibilityStats();
        
        return {
          success: true,
          accessibilityTranslationsCleared: Object.keys(stats.accessibilityTranslations).length === 0
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    expect(cleanupResult.success).toBe(true;
  });
});

test.describe('Multi-language UI Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
  });

  test('should update UI elements when language changes', async ({ page }) => {
    // This test would require actual UI elements to verify
    // Since the game uses Canvas rendering, we test the underlying translation system
    
    const uiUpdateTest = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      // Simulate UI element update
      const menuScene = window.gameEngine.sceneManager.scenes.get('menu');
      
      if (menuScene && menuScene.updateMenuLabels) {
        // Switch to English
        await lm.setLanguage('en');
        
        // Update menu labels
        menuScene.updateMenuLabels();
        
        // Verify translations are in English
        const startButtonText = lm.t('menu.start');
        const settingsButtonText = lm.t('menu.settings');
        
        return {
          success: true,
          startButton: startButtonText,
          settingsButton: settingsButtonText
        };
      }
      
      return { success: false, reason: 'Menu scene not available' };
    });
    
    if (uiUpdateTest.success) {
      expect(uiUpdateTest.startButton).toBe('Start Game');
      expect(uiUpdateTest.settingsButton).toBe('Settings');
    }
  });

  test('should handle game state preservation during language changes', async ({ page }) => {
    const statePreservationTest = await page.evaluate(async () => {
      const gameEngine = window.gameEngine;
      const lm = gameEngine.localizationManager;
      
      // Simulate some game state
      const initialState = {
        currentScene: gameEngine.sceneManager.currentScene,
        language: lm.getCurrentLanguage()
      };
      
      // Change language
      await lm.setLanguage('en');
      
      const afterLanguageChange = {
        currentScene: gameEngine.sceneManager.currentScene,
        language: lm.getCurrentLanguage()
      };
      
      return {
        initialState,
        afterLanguageChange,
        scenePreserved: initialState.currentScene === afterLanguageChange.currentScene,
        languageChanged: initialState.language !== afterLanguageChange.language
      };
    });
    
    expect(statePreservationTest.scenePreserved).toBe(true;
    expect(statePreservationTest.languageChanged).toBe(true;
  });
});

test.describe('Localization Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
  });

  test('should handle invalid language codes gracefully', async ({ page }) => {
    const errorHandlingTest = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      try {
        // Try to set an invalid language
        const result = await lm.setLanguage('invalid-lang');
        
        // Should still have a valid current language
        const currentLang = lm.getCurrentLanguage();
        
        return {
          success: true,
          setLanguageResult: result,
          currentLanguage: currentLang,
          languageStillValid: ['ja', 'en'].includes(currentLang
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    expect(errorHandlingTest.success).toBe(true;
    expect(errorHandlingTest.setLanguageResult).toBe(false;
    expect(errorHandlingTest.languageStillValid).toBe(true;
  });

  test('should handle missing translation keys gracefully', async ({ page }) => {
    const missingKeyTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Try to get a non-existent translation
      const result = lm.t('non.existent.key');
      
      return {
        result: result,
        isString: typeof result === 'string',
        isOriginalKey: result === 'non.existent.key'
      };
    });
    
    expect(missingKeyTest.isString).toBe(true;
    expect(missingKeyTest.isOriginalKey).toBe(true;
  });
});