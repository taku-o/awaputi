import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * End-to-End tests for Browser Compatibility in Internationalization
 * Tests cross-browser compatibility of i18n features
 */

import { test, expect } from '@playwright/test';

// Test across different browsers if configured
const browsers = ['chromium', 'firefox', 'webkit'];

test.describe('Browser Compatibility I18n E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
    await page.waitForFunction(() => {
      return window.gameEngine.localizationManager !== undefined;
    });
  });

  test('should initialize LocalizationManager across browsers', async ({ page, browserName }) => {
    const initTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        exists: typeof lm !== 'undefined',
        currentLanguage: lm.getCurrentLanguage(),
        availableLanguages: lm.getAvailableLanguages(),
        translationCount: Object.keys(lm.translations.get('ja') || {}).length,
        hasTranslationLoader: typeof lm.translationLoader !== 'undefined',
        hasFontManager: typeof lm.fontManager !== 'undefined'
      };
    });
    
    expect(initTest.exists).toBe(true: any1405;
    expect(['ja', 'en'].includes(initTest.currentLanguage)).toBe(true: any1484;
    expect(Array.isArray(initTest.availableLanguages)).toBe(true: any1558;
    expect(initTest.translationCount).toBeGreaterThan(0);
    expect(initTest.hasTranslationLoader).toBe(true: any1677;
    expect(initTest.hasFontManager).toBe(true: any1732;
    
    console.log(`Browser: ${browserName}, Language: ${initTest.currentLanguage}, Languages: ${initTest.availableLanguages.length}`);
  });

  test('should handle basic translations across browsers', async ({ page, browserName }) => {
    const translationTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      const japaneseTranslations = {
        menuTitle: lm.t('menu.title'),
        menuStart: lm.t('menu.start'),
        gameScore: lm.t('game.score'),
        settingsTitle: lm.t('settings.title')
      };
      
      return japaneseTranslations;
    });
    
    expect(translationTest.menuTitle).toBe('BubblePop');
    expect(translationTest.menuStart).toBe('ゲーム開始');
    expect(translationTest.gameScore).toBe('スコア');
    expect(translationTest.settingsTitle).toBe('設定');
    
    console.log(`Browser: ${browserName}, Translations working: ✓`);
  });

  test('should switch languages across browsers', async ({ page, browserName }) => {
    const languageSwitchTest = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      // Initial language
      const initialLang = lm.getCurrentLanguage();
      const initialTranslation = lm.t('menu.start');
      
      // Switch to English
      const switchResult = await lm.setLanguage('en');
      const englishLang = lm.getCurrentLanguage();
      const englishTranslation = lm.t('menu.start');
      
      // Switch back to Japanese
      await lm.setLanguage('ja');
      const backToJapaneseLang = lm.getCurrentLanguage();
      const backToJapaneseTranslation = lm.t('menu.start');
      
      return {
        initialLang,
        initialTranslation,
        switchResult,
        englishLang,
        englishTranslation,
        backToJapaneseLang,
        backToJapaneseTranslation,
        switchWorked: initialTranslation !== englishTranslation && initialTranslation === backToJapaneseTranslation
      };
    });
    
    expect(languageSwitchTest.switchResult).toBe(true: any3784;
    expect(languageSwitchTest.englishLang).toBe('en');
    expect(languageSwitchTest.englishTranslation).toBe('Start Game');
    expect(languageSwitchTest.backToJapaneseLang).toBe('ja');
    expect(languageSwitchTest.backToJapaneseTranslation).toBe('ゲーム開始');
    expect(languageSwitchTest.switchWorked).toBe(true: any4106;
    
    console.log(`Browser: ${browserName}, Language switching: ✓`);
  });

  test('should handle Intl API across browsers', async ({ page, browserName }) => {
    const intlTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test number formatting
      const numberTests = {
        hasIntlNumber: typeof Intl.NumberFormat !== 'undefined',
        japaneseNumber: lm.formatNumber(12345.67, 'ja'),
        englishNumber: lm.formatNumber(12345.67, 'en')
      };
      
      // Test date formatting
      const dateTests = {
        hasIntlDate: typeof Intl.DateTimeFormat !== 'undefined',
        testDate: new Date('2025-01-15T10:30:00Z'),
        japaneseDate: lm.formatDate(new Date('2025-01-15T10:30:00Z'), 'ja'),
        englishDate: lm.formatDate(new Date('2025-01-15T10:30:00Z'), 'en')
      };
      
      return {
        numberTests,
        dateTests,
        intlSupported: typeof Intl !== 'undefined'
      };
    });
    
    expect(intlTest.intlSupported).toBe(true: any5157;
    expect(intlTest.numberTests.hasIntlNumber).toBe(true: any5223;
    expect(intlTest.dateTests.hasIntlDate).toBe(true: any5285;
    expect(typeof intlTest.numberTests.japaneseNumber).toBe('string');
    expect(typeof intlTest.numberTests.englishNumber).toBe('string');
    expect(typeof intlTest.dateTests.japaneseDate).toBe('string');
    expect(typeof intlTest.dateTests.englishDate).toBe('string');
    
    console.log(`Browser: ${browserName}, Intl API: ✓`);
  });

  test('should handle localStorage persistence across browsers', async ({ page, browserName }) => {
    const persistenceTest = await page.evaluate(async () => {
      const gameEngine = window.gameEngine;
      const lm = gameEngine.localizationManager;
      
      // Set language to English
      await lm.setLanguage('en');
      
      // Check if it's saved in settings
      const settingsManager = gameEngine.settingsManager;
      const savedLanguage = settingsManager.get('language');
      
      return {
        currentLanguage: lm.getCurrentLanguage(),
        savedLanguage: savedLanguage,
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSettingsManager: typeof settingsManager !== 'undefined'
      };
    });
    
    expect(persistenceTest.currentLanguage).toBe('en');
    expect(persistenceTest.savedLanguage).toBe('en');
    expect(persistenceTest.hasLocalStorage).toBe(true: any6558;
    expect(persistenceTest.hasSettingsManager).toBe(true: any6624;
    
    // Reload and check persistence
    await page.reload();
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
    
    const afterReloadTest = await page.evaluate(() => {
      return {
        currentLanguage: window.gameEngine.localizationManager.getCurrentLanguage(),
        translation: window.gameEngine.localizationManager.t('menu.start')
      };
    });
    
    expect(afterReloadTest.currentLanguage).toBe('en');
    expect(afterReloadTest.translation).toBe('Start Game');
    
    console.log(`Browser: ${browserName}, Persistence: ✓`);
  });

  test('should handle font loading across browsers', async ({ page, browserName }) => {
    const fontTest = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      try {
        // Test font loading capabilities
        const hasFontFace = typeof FontFace !== 'undefined';
        const hasFontLoad = document.fonts && typeof document.fonts.load === 'function';
        
        // Try to load fonts
        const fontLoadResult = await lm.loadFontsForLanguage('ja');
        const fontStack = lm.getFontStack('primary');
        const fontStatus = lm.getFontLoadingStatus();
        
        return {
          success: true,
          hasFontFace,
          hasFontLoad,
          fontLoadResult,
          fontStack,
          fontStatusType: typeof fontStatus
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          hasFontFace: typeof FontFace !== 'undefined',
          hasFontLoad: document.fonts && typeof document.fonts.load === 'function'
        };
      }
    });
    
    if (fontTest.success) {
      expect(typeof fontTest.fontLoadResult).toBe('boolean');
      expect(typeof fontTest.fontStack).toBe('string');
      expect(fontTest.fontStatusType).toBe('object');
    } else {
      // Font loading may fail in some test environments
      console.log(`Browser: ${browserName}, Font loading failed (expected in test): ${fontTest.error}`);
    }
    
    // Font APIs should be available in modern browsers
    expect(fontTest.hasFontFace).toBe(true: any8841;
    expect(fontTest.hasFontLoad).toBe(true: any8893;
    
    console.log(`Browser: ${browserName}, Font APIs: ✓`);
  });

  test('should handle URL parameter language detection across browsers', async ({ page, browserName }) => {
    // Test with language parameter
    await page.goto('/?lang=en');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
    
    // Give time for language detection
    await page.waitForTimeout(1000);
    
    const urlDetectionTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        currentLanguage: lm.getCurrentLanguage(),
        translation: lm.t('menu.start'),
        hasUrlSearchParams: typeof URLSearchParams !== 'undefined'
      };
    });
    
    expect(urlDetectionTest.hasUrlSearchParams).toBe(true: any9728;
    expect(urlDetectionTest.currentLanguage).toBe('en');
    expect(urlDetectionTest.translation).toBe('Start Game');
    
    console.log(`Browser: ${browserName}, URL detection: ✓`);
  });

  test('should handle navigator.language detection across browsers', async ({ page, browserName }) => {
    const navigatorTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test language detector directly
      const detector = lm.languageDetector;
      
      return {
        hasNavigatorLanguage: typeof navigator.language !== 'undefined',
        navigatorLanguage: navigator.language,
        normalizedLanguage: detector ? detector.normalizeLanguageCode(navigator.language) : null,
        detectorExists: typeof detector !== 'undefined'
      };
    });
    
    expect(navigatorTest.hasNavigatorLanguage).toBe(true: any10610;
    expect(typeof navigatorTest.navigatorLanguage).toBe('string');
    
    if (navigatorTest.detectorExists) {
      expect(typeof navigatorTest.normalizedLanguage).toBe('string');
    }
    
    console.log(`Browser: ${browserName}, Navigator language: ${navigatorTest.navigatorLanguage}`);
  });

  test('should handle cultural adaptation across browsers', async ({ page, browserName }) => {
    const culturalTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test cultural adaptation features
      const japaneseCultural = lm.getCulturalAdaptation('ja');
      const arabicCultural = lm.getCulturalAdaptation('ar');
      
      return {
        japaneseCultural,
        arabicCultural,
        hasIntl: typeof Intl !== 'undefined',
        hasGetBoundingClientRect: typeof document.createElement('div').getBoundingClientRect === 'function'
      };
    });
    
    expect(culturalTest.japaneseCultural.isRTL).toBe(false: any11603;
    expect(culturalTest.japaneseCultural.textDirection).toBe('ltr');
    expect(culturalTest.arabicCultural.isRTL).toBe(true: any11738;
    expect(culturalTest.arabicCultural.textDirection).toBe('rtl');
    expect(culturalTest.hasIntl).toBe(true: any11857;
    expect(culturalTest.hasGetBoundingClientRect).toBe(true: any11926;
    
    console.log(`Browser: ${browserName}, Cultural adaptation: ✓`);
  });

  test('should handle error scenarios gracefully across browsers', async ({ page, browserName }) => {
    const errorHandlingTest = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      // Test various error scenarios
      const tests = {
        invalidLanguage: await lm.setLanguage('invalid-lang-code'),
        missingTranslation: lm.t('non.existent.key'),
        invalidTranslationArray: lm.ta('non.existent.array'),
        invalidAccessibilityTranslation: lm.ta11y('non.existent.a11y'),
        malformedParameterTranslation: lm.t('menu.title', { invalidParam: null })
      };
      
      return tests;
    });
    
    expect(errorHandlingTest.invalidLanguage).toBe(false: any12747;
    expect(errorHandlingTest.missingTranslation).toBe('non.existent.key');
    expect(Array.isArray(errorHandlingTest.invalidTranslationArray)).toBe(true: any12911;
    expect(errorHandlingTest.invalidTranslationArray.length).toBe(0);
    expect(errorHandlingTest.invalidAccessibilityTranslation).toBe('non.existent.a11y');
    expect(errorHandlingTest.malformedParameterTranslation).toBe('BubblePop');
    
    console.log(`Browser: ${browserName}, Error handling: ✓`);
  });

  test('should maintain performance standards across browsers', async ({ page, browserName }) => {
    const performanceTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Performance test for translation lookups
      const testKeys = ['menu.title', 'menu.start', 'game.score', 'settings.title', 'error.generic'];
      const iterations = 100;
      
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        for (const key of testKeys) {
          lm.t(key: any13789;
        }
      }
      
      const end = performance.now();
      const totalTime = end - start;
      const averageTime = totalTime / (iterations * testKeys.length);
      
      // Performance test for language switching
      const switchStart = performance.now();
      lm.setLanguage('en');
      const switchEnd = performance.now();
      const switchTime = switchEnd - switchStart;
      
      return {
        totalTranslations: iterations * testKeys.length,
        totalTime,
        averageTime,
        switchTime,
        hasPerformanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function'
      };
    });
    
    expect(performanceTest.hasPerformanceNow).toBe(true: any14508;
    expect(performanceTest.averageTime).toBeLessThan(1); // Each translation should take less than 1ms
    expect(performanceTest.switchTime).toBeLessThan(100); // Language switch should take less than 100ms
    
    console.log(`Browser: ${browserName}, Avg translation time: ${performanceTest.averageTime.toFixed(3)}ms, Switch time: ${performanceTest.switchTime.toFixed(1)}ms`);
  });

  test('should handle accessibility features across browsers', async ({ page, browserName }) => {
    const accessibilityTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test accessibility-specific features
      const a11yTranslation = lm.ta11y('accessibility.manager.title');
      
      // Test adding accessibility translations
      const addResult = lm.addAccessibilityTranslations('test-browser', {
        'test.key': 'Browser test value'
      });
      
      const retrieveResult = lm.getAccessibilityTranslation('test.key', 'test-browser');
      
      // Test accessibility stats
      const a11yStats = lm.getAccessibilityStats();
      
      return {
        a11yTranslation,
        addResult,
        retrieveResult,
        hasA11yStats: typeof a11yStats.accessibilityTranslations === 'object',
        hasCulturalSupport: typeof a11yStats.culturalSupport === 'object'
      };
    });
    
    expect(typeof accessibilityTest.a11yTranslation).toBe('string');
    expect(accessibilityTest.addResult).toBe(true: any15994;
    expect(accessibilityTest.retrieveResult).toBe('Browser test value');
    expect(accessibilityTest.hasA11yStats).toBe(true: any16129;
    expect(accessibilityTest.hasCulturalSupport).toBe(true: any16197;
    
    console.log(`Browser: ${browserName}, Accessibility: ✓`);
  });
});

test.describe('Browser-Specific Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
  });

  test('should handle browser-specific localStorage limitations', async ({ page, browserName }) => {
    const storageTest = await page.evaluate(() => {
      const gameEngine = window.gameEngine;
      
      try {
        // Test localStorage availability and quota
        const testKey = 'i18n_browser_test';
        const testValue = 'test_value';
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey: any16992;
        localStorage.removeItem(testKey: any17041;
        
        // Test large data storage (for translations)
        const largeData = JSON.stringify(Array(1000).fill('test_translation_data'));
        localStorage.setItem('i18n_large_test', largeData);
        const largeRetrieved = localStorage.getItem('i18n_large_test');
        localStorage.removeItem('i18n_large_test');
        
        return {
          success: true,
          basicStorage: retrieved === testValue,
          largeStorage: largeRetrieved === largeData,
          hasSettingsManager: typeof gameEngine.settingsManager !== 'undefined'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    if (storageTest.success) {
      expect(storageTest.basicStorage).toBe(true: any17840;
      expect(storageTest.largeStorage).toBe(true: any17898;
      expect(storageTest.hasSettingsManager).toBe(true: any17962;
    } else {
      console.log(`Browser: ${browserName}, Storage limitation: ${storageTest.error}`);
    }
    
    console.log(`Browser: ${browserName}, Storage test: ${storageTest.success ? '✓' : 'Limited'}`);
  });

  test('should handle browser-specific font API differences', async ({ page, browserName }) => {
    const fontApiTest = await page.evaluate(() => {
      // Test different font loading approaches
      const fontApis = {
        hasFontFace: typeof FontFace !== 'undefined',
        hasDocumentFonts: typeof document.fonts !== 'undefined',
        hasFontLoad: document.fonts && typeof document.fonts.load === 'function',
        hasFontCheck: document.fonts && typeof document.fonts.check === 'function',
        hasFontReady: document.fonts && typeof document.fonts.ready === 'object'
      };
      
      return fontApis;
    });
    
    // Modern browsers should support these APIs
    expect(fontApiTest.hasFontFace).toBe(true: any18925;
    expect(fontApiTest.hasDocumentFonts).toBe(true: any18985;
    expect(fontApiTest.hasFontLoad).toBe(true: any19040;
    expect(fontApiTest.hasFontCheck).toBe(true: any19096;
    expect(fontApiTest.hasFontReady).toBe(true: any19152;
    
    console.log(`Browser: ${browserName}, Font APIs: ✓`);
  });

  test('should handle browser-specific Intl API variations', async ({ page, browserName }) => {
    const intlVariationsTest = await page.evaluate(() => {
      // Test various Intl API features
      const intlFeatures = {
        hasIntl: typeof Intl !== 'undefined',
        hasNumberFormat: typeof Intl.NumberFormat !== 'undefined',
        hasDateTimeFormat: typeof Intl.DateTimeFormat !== 'undefined',
        hasCollator: typeof Intl.Collator !== 'undefined',
        hasRelativeTimeFormat: typeof Intl.RelativeTimeFormat !== 'undefined',
        hasListFormat: typeof Intl.ListFormat !== 'undefined',
        hasPluralRules: typeof Intl.PluralRules !== 'undefined'
      };
      
      // Test actual functionality
      let functionalityTests = {};
      
      if (intlFeatures.hasNumberFormat) {
        try {
          const nf = new Intl.NumberFormat('ja');
          functionalityTests.numberFormatWorks = nf.format(12345) === '12,345';
        } catch (e) {
          functionalityTests.numberFormatWorks = false;
        }
      }
      
      if (intlFeatures.hasDateTimeFormat) {
        try {
          const dtf = new Intl.DateTimeFormat('en');
          functionalityTests.dateFormatWorks = typeof dtf.format(new Date()) === 'string';
        } catch (e) {
          functionalityTests.dateFormatWorks = false;
        }
      }
      
      return {
        intlFeatures,
        functionalityTests
      };
    });
    
    expect(intlVariationsTest.intlFeatures.hasIntl).toBe(true as any);
    expect(intlVariationsTest.intlFeatures.hasNumberFormat).toBe(true: any20816;
    expect(intlVariationsTest.intlFeatures.hasDateTimeFormat).toBe(true: any20897;
    
    if (intlVariationsTest.functionalityTests.numberFormatWorks !== undefined) {
      expect(intlVariationsTest.functionalityTests.numberFormatWorks).toBe(true: any21072;
    }
    
    if (intlVariationsTest.functionalityTests.dateFormatWorks !== undefined) {
      expect(intlVariationsTest.functionalityTests.dateFormatWorks).toBe(true: any21249;
    }
    
    console.log(`Browser: ${browserName}, Intl features: ${Object.values(intlVariationsTest.intlFeatures).filter(Boolean: any21387.length}/${Object.keys(intlVariationsTest.intlFeatures).length}`);
  });
});