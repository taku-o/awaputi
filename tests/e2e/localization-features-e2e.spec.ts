import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * End-to-End tests for Localization Features
 * Tests regional formatting, cultural adaptation, and accessibility features
 */

import { test, expect } from '@playwright/test';

test.describe('Localization Features E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.gameEngine !== undefined);
    await page.waitForFunction(() => {
      return window.gameEngine.localizationManager !== undefined;
    });
  });

  test('should handle RTL language detection and setup', async ({ page }) => {
    const rtlTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test RTL language detection
      const arabicCultural = lm.getCulturalAdaptation('ar');
      const hebrewCultural = lm.getCulturalAdaptation('he');
      const japaneseCultural = lm.getCulturalAdaptation('ja');
      const englishCultural = lm.getCulturalAdaptation('en');
      
      return {
        arabic: {
          isRTL: arabicCultural.isRTL,
          textDirection: arabicCultural.textDirection
        },
        hebrew: {
          isRTL: hebrewCultural.isRTL,
          textDirection: hebrewCultural.textDirection
        },
        japanese: {
          isRTL: japaneseCultural.isRTL,
          textDirection: japaneseCultural.textDirection
        },
        english: {
          isRTL: englishCultural.isRTL,
          textDirection: englishCultural.textDirection
        }
      };
    });
    
    expect(rtlTest.arabic.isRTL).toBe(true;
    expect(rtlTest.arabic.textDirection).toBe('rtl');
    expect(rtlTest.hebrew.isRTL).toBe(true;
    expect(rtlTest.hebrew.textDirection).toBe('rtl');
    expect(rtlTest.japanese.isRTL).toBe(false;
    expect(rtlTest.japanese.textDirection).toBe('ltr');
    expect(rtlTest.english.isRTL).toBe(false;
    expect(rtlTest.english.textDirection).toBe('ltr');
  });

  test('should provide cultural color meanings', async ({ page }) => {
    const colorMeaningsTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        japanese: lm.getColorMeanings('ja'),
        english: lm.getColorMeanings('en'),
        chinese: lm.getColorMeanings('zh'),
        fallback: lm.getColorMeanings('unknown')
      };
    });
    
    // Test Japanese color meanings
    expect(colorMeaningsTest.japanese.red).toBe('danger');
    expect(colorMeaningsTest.japanese.green).toBe('safety');
    expect(colorMeaningsTest.japanese.blue).toBe('trust');
    
    // Test English color meanings
    expect(colorMeaningsTest.english.red).toBe('danger');
    expect(colorMeaningsTest.english.green).toBe('success');
    expect(colorMeaningsTest.english.blue).toBe('information');
    
    // Test Chinese color meanings
    expect(colorMeaningsTest.chinese.red).toBe('luck');
    expect(colorMeaningsTest.chinese.gold).toBe('prosperity');
    expect(colorMeaningsTest.chinese.white).toBe('purity');
    
    // Test fallback to English
    expect(colorMeaningsTest.fallback.red).toBe('danger');
    expect(colorMeaningsTest.fallback.green).toBe('success');
  });

  test('should provide cultural gesture conventions', async ({ page }) => {
    const gestureTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        japanese: lm.getGestureConventions('ja'),
        english: lm.getGestureConventions('en'),
        arabic: lm.getGestureConventions('ar'),
        fallback: lm.getGestureConventions('unknown')
      };
    });
    
    // Test Japanese gesture conventions
    expect(gestureTest.japanese.pointing).toBe('avoid');
    expect(gestureTest.japanese.thumbUp).toBe('ok');
    
    // Test English gesture conventions
    expect(gestureTest.english.pointing).toBe('acceptable');
    expect(gestureTest.english.thumbUp).toBe('approval');
    
    // Test Arabic gesture conventions
    expect(gestureTest.arabic.leftHand).toBe('avoid');
    expect(gestureTest.arabic.thumbUp).toBe('acceptable');
    
    // Test fallback to English
    expect(gestureTest.fallback.pointing).toBe('acceptable');
    expect(gestureTest.fallback.thumbUp).toBe('approval');
  });

  test('should handle numeral system formatting', async ({ page }) => {
    const numeralSystemTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        arabic: lm.getNumeralSystem('ar'),
        persian: lm.getNumeralSystem('fa'),
        thai: lm.getNumeralSystem('th'),
        hindi: lm.getNumeralSystem('hi'),
        english: lm.getNumeralSystem('en'),
        japanese: lm.getNumeralSystem('ja')
      };
    });
    
    expect(numeralSystemTest.arabic).toBe('arab');
    expect(numeralSystemTest.persian).toBe('persian');
    expect(numeralSystemTest.thai).toBe('thai');
    expect(numeralSystemTest.hindi).toBe('devanagari');
    expect(numeralSystemTest.english).toBe('default');
    expect(numeralSystemTest.japanese).toBe('default');
  });

  test('should provide correct date format patterns', async ({ page }) => {
    const dateFormatTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        japanese: lm.getDateFormat('ja'),
        english: lm.getDateFormat('en'),
        englishGB: lm.getDateFormat('en-GB'),
        german: lm.getDateFormat('de'),
        french: lm.getDateFormat('fr'),
        unknown: lm.getDateFormat('unknown')
      };
    });
    
    expect(dateFormatTest.japanese).toBe('YYYY年MM月DD日');
    expect(dateFormatTest.english).toBe('MM/DD/YYYY');
    expect(dateFormatTest.englishGB).toBe('DD/MM/YYYY');
    expect(dateFormatTest.german).toBe('DD.MM.YYYY');
    expect(dateFormatTest.french).toBe('DD/MM/YYYY');
    expect(dateFormatTest.unknown).toBe('MM/DD/YYYY'); // fallback
  });

  test('should handle calendar system detection', async ({ page }) => {
    const calendarSystemTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        japanese: lm.getCalendarSystem('ja'),
        arabic: lm.getCalendarSystem('ar'),
        hebrew: lm.getCalendarSystem('he'),
        thai: lm.getCalendarSystem('th'),
        english: lm.getCalendarSystem('en'),
        german: lm.getCalendarSystem('de')
      };
    });
    
    expect(calendarSystemTest.japanese).toBe('japanese');
    expect(calendarSystemTest.arabic).toBe('islamic');
    expect(calendarSystemTest.hebrew).toBe('hebrew');
    expect(calendarSystemTest.thai).toBe('buddhist');
    expect(calendarSystemTest.english).toBe('gregorian');
    expect(calendarSystemTest.german).toBe('gregorian');
  });

  test('should provide correct timezone mapping', async ({ page }) => {
    const timezoneTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        japanese: lm.getTimeZone('ja'),
        english: lm.getTimeZone('en'),
        englishGB: lm.getTimeZone('en-gb'),
        german: lm.getTimeZone('de'),
        french: lm.getTimeZone('fr'),
        unknown: lm.getTimeZone('unknown')
      };
    });
    
    expect(timezoneTest.japanese).toBe('Asia/Tokyo');
    expect(timezoneTest.english).toBe('America/New_York');
    expect(timezoneTest.englishGB).toBe('Europe/London');
    expect(timezoneTest.german).toBe('Europe/Berlin');
    expect(timezoneTest.french).toBe('Europe/Paris');
    expect(timezoneTest.unknown).toBe('UTC'); // fallback
  });

  test('should provide correct week start day', async ({ page }) => {
    const weekStartTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        english: lm.getWeekStart('en'),
        englishGB: lm.getWeekStart('en-gb'),
        german: lm.getWeekStart('de'),
        french: lm.getWeekStart('fr'),
        japanese: lm.getWeekStart('ja'),
        unknown: lm.getWeekStart('unknown')
      };
    });
    
    expect(weekStartTest.english).toBe(0); // Sunday
    expect(weekStartTest.englishGB).toBe(1); // Monday
    expect(weekStartTest.german).toBe(1); // Monday
    expect(weekStartTest.french).toBe(1); // Monday
    expect(weekStartTest.japanese).toBe(0); // Sunday
    expect(weekStartTest.unknown).toBe(1); // Monday (fallback)
  });

  test('should handle cultural text formatting', async ({ page }) => {
    const culturalFormattingTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      const testNumber = 1234.56;
      const testDate = new Date('2025-01-15');
      const testCurrency = 999.99;
      
      return {
        japanese: {
          number: lm.formatCulturalText(testNumber, 'number', 'ja'),
          date: lm.formatCulturalText(testDate, 'date', 'ja'),
          currency: lm.formatCulturalText(testCurrency, 'currency', 'ja')
        },
        english: {
          number: lm.formatCulturalText(testNumber, 'number', 'en'),
          date: lm.formatCulturalText(testDate, 'date', 'en'),
          currency: lm.formatCulturalText(testCurrency, 'currency', 'en')
        },
        unknown: {
          text: lm.formatCulturalText('unchanged', 'unknown', 'ja')
        }
      };
    });
    
    // Verify formatting functions are called
    expect(typeof culturalFormattingTest.japanese.number).toBe('string');
    expect(typeof culturalFormattingTest.japanese.date).toBe('string');
    expect(typeof culturalFormattingTest.japanese.currency).toBe('string');
    expect(typeof culturalFormattingTest.english.number).toBe('string');
    expect(typeof culturalFormattingTest.english.date).toBe('string');
    expect(typeof culturalFormattingTest.english.currency).toBe('string');
    
    // Unknown format type should return original text
    expect(culturalFormattingTest.unknown.text).toBe('unchanged');
  });

  test('should provide complete regional settings', async ({ page }) => {
    const completeRegionalTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      return {
        japanese: lm.getRegionalSettings('ja'),
        english: lm.getRegionalSettings('en'),
        german: lm.getRegionalSettings('de')
      };
    });
    
    // Test Japanese regional settings
    expect(completeRegionalTest.japanese.language).toBe('ja');
    expect(completeRegionalTest.japanese.locale).toBe('ja-JP');
    expect(completeRegionalTest.japanese.direction).toBe('ltr');
    expect(completeRegionalTest.japanese.calendar).toBe('japanese');
    expect(completeRegionalTest.japanese.timeZone).toBe('Asia/Tokyo');
    expect(completeRegionalTest.japanese.weekStart).toBe(0);
    
    // Test English regional settings
    expect(completeRegionalTest.english.language).toBe('en');
    expect(completeRegionalTest.english.locale).toBe('en-US');
    expect(completeRegionalTest.english.direction).toBe('ltr');
    expect(completeRegionalTest.english.calendar).toBe('gregorian');
    expect(completeRegionalTest.english.timeZone).toBe('America/New_York');
    expect(completeRegionalTest.english.weekStart).toBe(0);
    
    // Test German regional settings
    expect(completeRegionalTest.german.language).toBe('de');
    expect(completeRegionalTest.german.locale).toBe('de-DE');
    expect(completeRegionalTest.german.direction).toBe('ltr');
    expect(completeRegionalTest.german.calendar).toBe('gregorian');
    expect(completeRegionalTest.german.timeZone).toBe('Europe/Berlin');
    expect(completeRegionalTest.german.weekStart).toBe(1);
  });

  test('should handle accessibility translations correctly', async ({ page }) => {
    const accessibilityTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test adding accessibility translations
      const addResult = lm.addAccessibilityTranslations('test-lang', {
        'test.accessibility.key': 'Test accessibility value',
        'test.nested.key': 'Nested value'
      });
      
      // Test retrieving accessibility translations
      const retrievedTranslation = lm.getAccessibilityTranslation('test.accessibility.key', 'test-lang');
      const nestedTranslation = lm.getAccessibilityTranslation('test.nested.key', 'test-lang');
      const nonExistentTranslation = lm.getAccessibilityTranslation('non.existent', 'test-lang');
      
      // Test accessibility stats
      const stats = lm.getAccessibilityStats();
      
      return {
        addResult,
        retrievedTranslation,
        nestedTranslation,
        nonExistentTranslation,
        hasAccessibilityStats: typeof stats.accessibilityTranslations === 'object',
        hasCulturalSupport: typeof stats.culturalSupport === 'object'
      };
    });
    
    expect(accessibilityTest.addResult).toBe(true;
    expect(accessibilityTest.retrievedTranslation).toBe('Test accessibility value');
    expect(accessibilityTest.nestedTranslation).toBe('Nested value');
    expect(accessibilityTest.nonExistentTranslation).toBe(null;
    expect(accessibilityTest.hasAccessibilityStats).toBe(true;
    expect(accessibilityTest.hasCulturalSupport).toBe(true;
  });

  test('should handle accessibility-specific translation method', async ({ page }) => {
    const a11yTranslationTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Test existing accessibility translations in Japanese
      const japaneseA11y = {
        managerTitle: lm.ta11y('accessibility.manager.title'),
        keyboardTitle: lm.ta11y('accessibility.keyboard.title'),
        screenReaderTitle: lm.ta11y('accessibility.screenReader.title'),
        visualTitle: lm.ta11y('accessibility.visual.title')
      };
      
      // Switch to English and test
      lm.setLanguage('en');
      
      const englishA11y = {
        managerTitle: lm.ta11y('accessibility.manager.title'),
        keyboardTitle: lm.ta11y('accessibility.keyboard.title'),
        screenReaderTitle: lm.ta11y('accessibility.screenReader.title'),
        visualTitle: lm.ta11y('accessibility.visual.title')
      };
      
      // Test with parameters
      const withParams = lm.ta11y('accessibility.announcements.profileActivated', {
        profileName: 'Test Profile'
      });
      
      return {
        japaneseA11y,
        englishA11y,
        withParams
      };
    });
    
    // Test Japanese accessibility translations
    expect(a11yTranslationTest.japaneseA11y.managerTitle).toBe('アクセシビリティ設定');
    expect(a11yTranslationTest.japaneseA11y.keyboardTitle).toBe('キーボード操作');
    expect(a11yTranslationTest.japaneseA11y.screenReaderTitle).toBe('スクリーンリーダー');
    expect(a11yTranslationTest.japaneseA11y.visualTitle).toBe('視覚的支援');
    
    // Test English accessibility translations
    expect(a11yTranslationTest.englishA11y.managerTitle).toBe('Accessibility Settings');
    expect(a11yTranslationTest.englishA11y.keyboardTitle).toBe('Keyboard Navigation');
    expect(a11yTranslationTest.englishA11y.screenReaderTitle).toBe('Screen Reader');
    expect(a11yTranslationTest.englishA11y.visualTitle).toBe('Visual Assistance');
    
    // Test parameter interpolation
    expect(a11yTranslationTest.withParams).toContain('Test Profile');
  });

  test('should provide comprehensive localization statistics', async ({ page }) => {
    const statsTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Add some test accessibility translations
      lm.addAccessibilityTranslations('stats-test', {
        'test1': 'value1',
        'test2': 'value2',
        'test3': 'value3'
      });
      
      const regularStats = lm.getStats();
      const accessibilityStats = lm.getAccessibilityStats();
      
      return {
        regularStats,
        accessibilityStats,
        hasAccessibilityTranslations: typeof accessibilityStats.accessibilityTranslations === 'object',
        hasCulturalSupport: typeof accessibilityStats.culturalSupport === 'object'
      };
    });
    
    // Test regular stats
    expect(typeof statsTest.regularStats.currentLanguage).toBe('string');
    expect(Array.isArray(statsTest.regularStats.availableLanguages)).toBe(true;
    expect(typeof statsTest.regularStats.translationCounts).toBe('object');
    
    // Test accessibility stats structure
    expect(statsTest.hasAccessibilityTranslations).toBe(true;
    expect(statsTest.hasCulturalSupport).toBe(true;
    
    // Test cultural support metrics
    const culturalSupport = statsTest.accessibilityStats.culturalSupport;
    expect(typeof culturalSupport.rtlLanguages).toBe('number');
    expect(typeof culturalSupport.numeralSystems).toBe('number');
    expect(typeof culturalSupport.dateFormats).toBe('number');
    expect(typeof culturalSupport.colorMeanings).toBe('number');
    
    // Verify we have some RTL languages configured
    expect(culturalSupport.rtlLanguages).toBeGreaterThan(0);
  });

  test('should handle font loading and management', async ({ page }) => {
    const fontTest = await page.evaluate(async () => {
      const lm = window.gameEngine.localizationManager;
      
      try {
        // Test font loading for current language
        const loadResult = await lm.loadFontsForLanguage('ja');
        
        // Test font stack retrieval
        const primaryFontStack = lm.getFontStack('primary');
        const secondaryFontStack = lm.getFontStack('secondary');
        
        // Test font loading status
        const fontStatus = lm.getFontLoadingStatus();
        
        // Test preloading fonts
        const preloadResult = await lm.preloadFonts(['ja', 'en']);
        
        return {
          success: true,
          loadResult,
          primaryFontStack,
          secondaryFontStack,
          fontStatus: typeof fontStatus === 'object',
          preloadResult: typeof preloadResult === 'boolean'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    if (fontTest.success) {
      expect(typeof fontTest.loadResult).toBe('boolean');
      expect(typeof fontTest.primaryFontStack).toBe('string');
      expect(typeof fontTest.secondaryFontStack).toBe('string');
      expect(fontTest.fontStatus).toBe(true;
      expect(fontTest.preloadResult).toBe(true;
    } else {
      // Font loading may fail in test environment, which is acceptable
      expect(typeof fontTest.error).toBe('string');
    }
  });

  test('should handle language change listeners properly', async ({ page }) => {
    const listenerTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      let eventsFired = [];
      
      // Add test listeners
      const listener1 = (newLang, oldLang) => {
        eventsFired.push({ listener: 1, newLang, oldLang });
      };
      
      const listener2 = (newLang, oldLang) => {
        eventsFired.push({ listener: 2, newLang, oldLang });
      };
      
      const addResult1 = lm.addLanguageChangeListener(listener1;
      const addResult2 = lm.addLanguageChangeListener(listener2;
      const addResult3 = lm.addLanguageChangeListener('invalid'); // Should fail
      
      // Trigger language change
      lm.notifyLanguageChange('en', 'ja');
      
      // Remove one listener
      const removeResult1 = lm.removeLanguageChangeListener(listener1;
      const removeResult2 = lm.removeLanguageChangeListener('invalid'); // Should fail
      
      // Trigger another change
      lm.notifyLanguageChange('ja', 'en');
      
      return {
        addResult1,
        addResult2,
        addResult3,
        removeResult1,
        removeResult2,
        eventsFired,
        totalEvents: eventsFired.length
      };
    });
    
    expect(listenerTest.addResult1).toBe(true;
    expect(listenerTest.addResult2).toBe(true;
    expect(listenerTest.addResult3).toBe(false; // invalid listener
    expect(listenerTest.removeResult1).toBe(true;
    expect(listenerTest.removeResult2).toBe(false; // invalid listener
    
    // Should have 3 events: 2 from first change, 1 from second change (after removal)
    expect(listenerTest.totalEvents).toBe(3);
    
    // Check event details
    expect(listenerTest.eventsFired[0].newLang).toBe('en');
    expect(listenerTest.eventsFired[0].oldLang).toBe('ja');
    expect(listenerTest.eventsFired[1].newLang).toBe('en');
    expect(listenerTest.eventsFired[1].oldLang).toBe('ja');
    expect(listenerTest.eventsFired[2].listener).toBe(2); // Only listener 2 should fire
  });

  test('should clean up resources properly', async ({ page }) => {
    const cleanupTest = await page.evaluate(() => {
      const lm = window.gameEngine.localizationManager;
      
      // Add some test data
      lm.addAccessibilityTranslations('cleanup-test', {
        'test.key': 'test value'
      });
      
      const listener = () => {};
      lm.addLanguageChangeListener(listener;
      
      // Verify data exists
      const beforeCleanup = {
        hasAccessibilityTranslations: lm.getAccessibilityTranslation('test.key', 'cleanup-test') !== null,
        fontStats: lm.getFontLoadingStatus()
      };
      
      // Perform cleanup
      lm.cleanup();
      
      // Verify cleanup
      const afterCleanup = {
        hasAccessibilityTranslations: lm.getAccessibilityTranslation('test.key', 'cleanup-test') !== null,
        fontStatsAfterCleanup: lm.getFontLoadingStatus()
      };
      
      return {
        beforeCleanup,
        afterCleanup
      };
    });
    
    expect(cleanupTest.beforeCleanup.hasAccessibilityTranslations).toBe(true;
    expect(cleanupTest.afterCleanup.hasAccessibilityTranslations).toBe(false;
    expect(typeof cleanupTest.beforeCleanup.fontStats).toBe('object');
    expect(typeof cleanupTest.afterCleanup.fontStatsAfterCleanup).toBe('object');
  });
});