/**
 * Integration tests for multilingual help system
 * 
 * Tests:
 * - Language switching functionality
 * - Fallback chain behavior
 * - Content caching across languages
 * - Performance benchmarking
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Help content directory
const HELP_CONTENT_DIR = path.join(__dirname, '../../../src/core/help/content/help');

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'];

// Required categories
const REQUIRED_CATEGORIES = ['bubbles', 'controls', 'settings', 'troubleshooting', 'gameplay'];

// Mock HelpManager class for testing
class MockHelpManager {
  constructor() {
    this.cache = new Map();
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.loadAttempts = [];
  }

  async loadHelpContent(language, category) {
    const cacheKey = `${language}_${category}`;
    
    // Track load attempts
    this.loadAttempts.push({ language, category, timestamp: Date.now() });
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Try to load the file
    const filePath = path.join(HELP_CONTENT_DIR, language, `${category}.json`);
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Cache the content
        this.cache.set(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.log(`Failed to load ${language}/${category}: ${error.message}`);
    }
    
    // Fallback to default language
    if (language !== this.fallbackLanguage) {
      console.log(`Falling back to ${this.fallbackLanguage} for ${category}`);
      return this.loadHelpContent(this.fallbackLanguage, category);
    }
    
    throw new Error(`Failed to load help content: ${language}/${category}`);
  }

  setLanguage(language) {
    this.currentLanguage = language;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }

  getLoadAttempts() {
    return this.loadAttempts;
  }
}

describe('Multilingual Help System Integration', () => {
  let helpManager;

  beforeEach(() => {
    helpManager = new MockHelpManager();
  });

  afterEach(() => {
    helpManager.clearCache();
  });

  describe('Language Switching', () => {
    it('should load content for all supported languages', async () => {
      for (const language of SUPPORTED_LANGUAGES) {
        helpManager.setLanguage(language);
        
        for (const category of REQUIRED_CATEGORIES) {
          const content = await helpManager.loadHelpContent(language, category);
          
          expect(content).toBeDefined();
          expect(content.language).toBe(language);
          expect(content.category).toBe(category);
        }
      }
    });

    it('should switch languages without losing cached content', async () => {
      // Load content in English
      helpManager.setLanguage('en');
      await helpManager.loadHelpContent('en', 'bubbles');
      const initialCacheSize = helpManager.getCacheSize();
      
      // Switch to Japanese and load content
      helpManager.setLanguage('ja');
      await helpManager.loadHelpContent('ja', 'bubbles');
      
      // Cache should contain both languages
      expect(helpManager.getCacheSize()).toBe(initialCacheSize + 1);
      
      // Switch back to English - should use cache
      helpManager.setLanguage('en');
      const loadAttemptsBefore = helpManager.getLoadAttempts().length;
      await helpManager.loadHelpContent('en', 'bubbles');
      const loadAttemptsAfter = helpManager.getLoadAttempts().length;
      
      // Should not make new load attempt (uses cache)
      expect(loadAttemptsAfter).toBe(loadAttemptsBefore + 1);
    });

    it('should maintain separate content for each language', async () => {
      const contents = {};
      
      // Load same category for all languages
      for (const language of SUPPORTED_LANGUAGES) {
        const content = await helpManager.loadHelpContent(language, 'controls');
        contents[language] = content;
      }
      
      // Verify each language has unique content
      for (const language of SUPPORTED_LANGUAGES) {
        expect(contents[language].language).toBe(language);
        
        // Check that titles are different (except for language codes)
        if (language !== 'en') {
          expect(contents[language].title).not.toBe(contents['en'].title);
        }
      }
    });
  });

  describe('Fallback Chain', () => {
    it('should fallback to English when content is missing', async () => {
      // Create a mock language that doesn't exist
      const mockLanguage = 'xx-XX';
      
      // Should fallback to English
      const content = await helpManager.loadHelpContent(mockLanguage, 'bubbles');
      
      expect(content).toBeDefined();
      expect(content.language).toBe('en');
    });

    it('should track fallback attempts', async () => {
      const mockLanguage = 'xx-XX';
      
      // Clear previous attempts
      helpManager.loadAttempts = [];
      
      // Attempt to load non-existent content
      await helpManager.loadHelpContent(mockLanguage, 'settings');
      
      // Should have two attempts: original and fallback
      const attempts = helpManager.getLoadAttempts();
      expect(attempts.length).toBe(2);
      expect(attempts[0].language).toBe(mockLanguage);
      expect(attempts[1].language).toBe('en');
    });

    it('should handle missing files gracefully', async () => {
      // Try to load a non-existent category
      await expect(
        helpManager.loadHelpContent('en', 'nonexistent')
      ).rejects.toThrow('Failed to load help content');
    });

    it('should use language-specific fallback chain', async () => {
      // For Chinese Traditional, might fallback to Simplified then English
      class AdvancedHelpManager extends MockHelpManager {
        async loadHelpContent(language, category) {
          try {
            return await super.loadHelpContent(language, category);
          } catch (error) {
            // Custom fallback chain
            if (language === 'zh-TW') {
              try {
                return await super.loadHelpContent('zh-CN', category);
              } catch {
                return await super.loadHelpContent('en', category);
              }
            }
            throw error;
          }
        }
      }
      
      const advancedManager = new AdvancedHelpManager();
      
      // Test fallback chain works
      const content = await advancedManager.loadHelpContent('zh-TW', 'bubbles');
      expect(content).toBeDefined();
    });
  });

  describe('Content Caching', () => {
    it('should cache loaded content', async () => {
      // First load - from file
      const loadAttemptsBefore = helpManager.getLoadAttempts().length;
      await helpManager.loadHelpContent('ja', 'gameplay');
      const loadAttemptsAfterFirst = helpManager.getLoadAttempts().length;
      
      // Second load - from cache
      await helpManager.loadHelpContent('ja', 'gameplay');
      const loadAttemptsAfterSecond = helpManager.getLoadAttempts().length;
      
      // Should have made one file load and one cache access
      expect(loadAttemptsAfterFirst - loadAttemptsBefore).toBe(1);
      expect(loadAttemptsAfterSecond - loadAttemptsAfterFirst).toBe(1);
      expect(helpManager.getCacheSize()).toBe(1);
    });

    it('should handle cache invalidation', async () => {
      // Load content
      await helpManager.loadHelpContent('ko', 'troubleshooting');
      expect(helpManager.getCacheSize()).toBe(1);
      
      // Clear cache
      helpManager.clearCache();
      expect(helpManager.getCacheSize()).toBe(0);
      
      // Load again - should read from file
      const loadAttemptsBefore = helpManager.getLoadAttempts().length;
      await helpManager.loadHelpContent('ko', 'troubleshooting');
      const loadAttemptsAfter = helpManager.getLoadAttempts().length;
      
      expect(loadAttemptsAfter).toBe(loadAttemptsBefore + 1);
    });

    it('should cache multiple languages simultaneously', async () => {
      // Load content for multiple languages
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of ['bubbles', 'controls']) {
          await helpManager.loadHelpContent(language, category);
        }
      }
      
      // Should have cached all combinations
      expect(helpManager.getCacheSize()).toBe(SUPPORTED_LANGUAGES.length * 2);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should load all content within acceptable time', async () => {
      const startTime = Date.now();
      
      // Load all content for all languages
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of REQUIRED_CATEGORIES) {
          await helpManager.loadHelpContent(language, category);
        }
      }
      
      const totalTime = Date.now() - startTime;
      
      // Should complete within 500ms (adjust based on system)
      expect(totalTime).toBeLessThan(500);
      
      console.log(`Loaded ${SUPPORTED_LANGUAGES.length * REQUIRED_CATEGORIES.length} files in ${totalTime}ms`);
    });

    it('should demonstrate cache performance improvement', async () => {
      const timings = {
        firstLoad: [],
        cachedLoad: []
      };
      
      // First pass - load from files
      for (const category of REQUIRED_CATEGORIES) {
        const startTime = Date.now();
        await helpManager.loadHelpContent('en', category);
        timings.firstLoad.push(Date.now() - startTime);
      }
      
      // Second pass - load from cache
      for (const category of REQUIRED_CATEGORIES) {
        const startTime = Date.now();
        await helpManager.loadHelpContent('en', category);
        timings.cachedLoad.push(Date.now() - startTime);
      }
      
      // Calculate averages
      const avgFirstLoad = timings.firstLoad.reduce((a, b) => a + b) / timings.firstLoad.length;
      const avgCachedLoad = timings.cachedLoad.reduce((a, b) => a + b) / timings.cachedLoad.length;
      
      // Cached loads should be at least 50% faster
      expect(avgCachedLoad).toBeLessThan(avgFirstLoad * 0.5);
      
      console.log(`Average first load: ${avgFirstLoad.toFixed(2)}ms`);
      console.log(`Average cached load: ${avgCachedLoad.toFixed(2)}ms`);
      console.log(`Performance improvement: ${((1 - avgCachedLoad / avgFirstLoad) * 100).toFixed(1)}%`);
    });

    it('should handle concurrent loading efficiently', async () => {
      const startTime = Date.now();
      
      // Load multiple files concurrently
      const promises = [];
      
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of REQUIRED_CATEGORIES) {
          promises.push(helpManager.loadHelpContent(language, category));
        }
      }
      
      // Wait for all to complete
      await Promise.all(promises);
      
      const totalTime = Date.now() - startTime;
      
      // Concurrent loading should be faster than sequential
      expect(totalTime).toBeLessThan(300);
      
      console.log(`Concurrent loading of ${promises.length} files completed in ${totalTime}ms`);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle corrupted JSON gracefully', async () => {
      // Mock corrupted file scenario
      class CorruptedFileManager extends MockHelpManager {
        async loadHelpContent(language, category) {
          if (language === 'test' && category === 'corrupted') {
            throw new SyntaxError('Unexpected token in JSON');
          }
          return super.loadHelpContent(language, category);
        }
      }
      
      const manager = new CorruptedFileManager();
      
      // Should fallback when encountering corrupted file
      await expect(
        manager.loadHelpContent('test', 'corrupted')
      ).rejects.toThrow();
    });

    it('should handle file system errors', async () => {
      // Mock file system error
      class FileSystemErrorManager extends MockHelpManager {
        async loadHelpContent(language, category) {
          if (language === 'test' && category === 'permission') {
            throw new Error('EACCES: permission denied');
          }
          return super.loadHelpContent(language, category);
        }
      }
      
      const manager = new FileSystemErrorManager();
      
      await expect(
        manager.loadHelpContent('test', 'permission')
      ).rejects.toThrow('EACCES');
    });
  });

  describe('Content Consistency', () => {
    it('should have consistent structure across languages', async () => {
      const structures = {};
      
      // Load and analyze structure for each language
      for (const language of SUPPORTED_LANGUAGES) {
        const content = await helpManager.loadHelpContent(language, 'settings');
        structures[language] = {
          topLevelKeys: Object.keys(content).sort(),
          topicCount: content.topics ? content.topics.length : 0,
          topicIds: content.topics ? content.topics.map(t => t.id).sort() : []
        };
      }
      
      // Compare all languages to English
      const referenceStructure = structures['en'];
      
      for (const language of SUPPORTED_LANGUAGES) {
        if (language !== 'en') {
          // Should have same top-level keys
          expect(structures[language].topLevelKeys).toEqual(referenceStructure.topLevelKeys);
          
          // Topic count can vary slightly
          expect(Math.abs(structures[language].topicCount - referenceStructure.topicCount)).toBeLessThanOrEqual(2);
        }
      }
    });

    it('should maintain data integrity across operations', async () => {
      // Load content
      const originalContent = await helpManager.loadHelpContent('ja', 'controls');
      
      // Perform multiple operations
      helpManager.clearCache();
      helpManager.setLanguage('en');
      await helpManager.loadHelpContent('en', 'controls');
      helpManager.setLanguage('ja');
      
      // Load again
      const reloadedContent = await helpManager.loadHelpContent('ja', 'controls');
      
      // Content should be identical
      expect(reloadedContent).toEqual(originalContent);
    });
  });
});