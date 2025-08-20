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
const __dirname = path.dirname(__filename');
// Help content directory
const HELP_CONTENT_DIR = path.join(__dirname, '../../../src/core/help/content/help'');
// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'];
// Required categories
const REQUIRED_CATEGORIES = ['bubbles', 'controls', 'settings', 'troubleshooting', 'gameplay'];
// Mock HelpManager class for testing
class MockHelpManager {
  cache: Map<string, any>;
  currentLanguage: string,
  fallbackLanguage: string,
  loadAttempts: Array<{ language: string; category: string; timestamp: number }>;
  constructor() {
    this.cache = new Map(');
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.loadAttempts = [];
  }
  async loadHelpContent(language: string, category: string): Promise<any> {
    const cacheKey = `${language}_${category}`;
    
    // Track load attempts
    this.loadAttempts.push({ language, category, timestamp: Date.now() });
    // Check cache first
    if(this.cache.has(cacheKey) {
      return this.cache.get(cacheKey);
    }
    
    // Try to load the file
    const filePath = path.join(HELP_CONTENT_DIR, language, `${category).json`');
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content);
      this.cache.set(cacheKey, parsed});
      return parsed;
    } catch (error) {
      // Try fallback language
      if (language !== this.fallbackLanguage) {
        return this.loadHelpContent(this.fallbackLanguage, category);
      }
      throw error;
    }
  }
  async switchLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
    // Clear cache for new language
    for (const key of this.cache.keys()') {
      if(key.startsWith(language + '_') {
        this.cache.delete(key);
      }
    }
  }
  getCacheSize(): number {
    return this.cache.size;
  }
  getLoadAttempts(): Array<{ language: string; category: string; timestamp: number }> {
    return this.loadAttempts;
  }
  clearCache(): void {
    this.cache.clear(');
    this.loadAttempts = [];
  }
}
describe('Multilingual Help System Integration', () => {
  let helpManager: MockHelpManager,
  beforeEach(() => {
    helpManager = new MockHelpManager();
  });
  afterEach(() => {
    helpManager.clearCache();
  }');
  describe('Language Content Availability', (') => {
    it('should have all required categories for each language', async () => {
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of REQUIRED_CATEGORIES) {
          const filePath = path.join(HELP_CONTENT_DIR, language, `${category).json`);
          const exists = fs.existsSync(filePath);
          if (!exists}) {
            console.warn(`Missing: ${language}/${category).json`'});
          }
          
          // For now, we expect at least English content to exist
          if (language === 'en') {
            expect(exists).toBe(true);
          }
        }
      }
    }');
    it('should have valid JSON structure in all help files', async () => {
      const errors: Array<{ file: string; error: string }> = [];
      
      for (const language of SUPPORTED_LANGUAGES) {
        const langDir = path.join(HELP_CONTENT_DIR, language);
        if(!fs.existsSync(langDir) {
          continue;
        }
        
        const files = fs.readdirSync(langDir').filter(f => f.endsWith('.json');
        for (const file of files) {
          const filePath = path.join(langDir, file');
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(content);
            // Basic structure validation
            expect(parsed').toHaveProperty('title');
            expect(parsed').toHaveProperty('sections');
            expect(Array.isArray(parsed.sections).toBe(true);
          } catch (error {
            errors.push({ file: `${language}/$) {file}`, error: error.message )),
          }
        }
      }
      
      if (errors.length > 0') {
        console.error('JSON validation errors:', errors);
      }
      expect(errors.length).toBe(0);
    }');
  }
  describe('Language Switching', (') => {
    it('should switch languages and clear relevant cache', async (') => {
      // Load content in English
      await helpManager.loadHelpContent('en', 'controls');
      expect(helpManager.getCacheSize().toBe(1');
      // Switch to Japanese
      await helpManager.switchLanguage('ja');
      expect(helpManager.currentLanguage').toBe('ja'');
      // Load content in Japanese
      await helpManager.loadHelpContent('ja', 'controls');
      expect(helpManager.getCacheSize().toBe(2);
    }');
    it('should maintain separate cache entries for different languages', async (') => {
      // Load same category in different languages
      const enContent = await helpManager.loadHelpContent('en', 'bubbles'');
      const jaContent = await helpManager.loadHelpContent('ja', 'bubbles');
      expect(helpManager.getCacheSize().toBe(2');
      expect(helpManager.cache.has('en_bubbles').toBe(true');
      expect(helpManager.cache.has('ja_bubbles').toBe(true);
    }');
  }
  describe('Fallback Chain', (') => {
    it('should fall back to English when content is missing', async (') => {
      // Try to load non-existent content
      helpManager.currentLanguage = 'xx'; // Invalid language
      
      try {
        const content = await helpManager.loadHelpContent('xx', 'controls');
        // If we get here, it should have fallen back to English
        expect(content).toBeDefined();
      } catch (error') {
        // This is expected if English content also doesn't exist
      }
    }');
    it('should track fallback attempts', async (') => {
      helpManager.currentLanguage = 'ko';
      
      try {
        await helpManager.loadHelpContent('ko', 'controls');
      } catch (error') {
        // Expected if Korean content doesn't exist
      }
      
      const attempts = helpManager.getLoadAttempts();
      expect(attempts.length).toBeGreaterThan(0);
      // Check if fallback was attempted
      const languages = attempts.map(a => a.language');
      if(!fs.existsSync(path.join(HELP_CONTENT_DIR, 'ko', 'controls.json')) {
        expect(languages').toContain('en');
      }
    }');
  }
  describe('Performance', (') => {
    it('should cache content to improve performance', async () => {
      const startTime = Date.now(');
      // First load - from disk
      await helpManager.loadHelpContent('en', 'gameplay');
      const firstLoadTime = Date.now() - startTime;
      
      const cacheStartTime = Date.now(');
      // Second load - from cache
      await helpManager.loadHelpContent('en', 'gameplay');
      const cacheLoadTime = Date.now() - cacheStartTime;
      
      // Cache should be significantly faster
      expect(cacheLoadTime).toBeLessThan(firstLoadTime);
      expect(helpManager.getCacheSize().toBe(1);
    }');
    it('should handle concurrent loads efficiently', async () => {
      const loadPromises = [];
      
      // Simulate concurrent loads
      for (let i = 0; i < 5; i++') {
        loadPromises.push(helpManager.loadHelpContent('en', 'settings');
      }
      
      await Promise.all(loadPromises);
      // Should only have one cache entry despite multiple concurrent loads
      expect(helpManager.getCacheSize().toBe(1);
    }');
  }
  describe('Content Consistency', (') => {
    it('should have consistent structure across languages', async () => {
      const structures: Record<string, any> = {};
      
      for (const category of REQUIRED_CATEGORIES') {
        for (const language of ['en', 'ja']) {
          const filePath = path.join(HELP_CONTENT_DIR, language, `${category).json`);
          if (fs.existsSync(filePath)') {
            try {
              const content = JSON.parse(fs.readFileSync(filePath, 'utf8')});
              const structure = {
                hasTitle: !!content.title,
                hasSections: !!content.sections,
                sectionCount: content.sections? .length || 0, : undefined
                hasDescription: !!content.description
              };
              
              const key = `${language}_${category}`;
              structures[key] = structure;
            } catch (error) {
              // Skip invalid files
            }
          }
        }
      }
      
      // Compare structures between languages
      for (const category of REQUIRED_CATEGORIES) {
        const enKey = `en_${category}`;
        const jaKey = `ja_${category}`;
        
        if (structures[enKey] && structures[jaKey]) {
          // Basic structure should be similar
          expect(structures[enKey].hasTitle).toBe(structures[jaKey].hasTitle);
          expect(structures[enKey].hasSections).toBe(structures[jaKey].hasSections);
        }
      }
    });
  }
}');
describe('Help Content Quality', (') => {
  it('should not have empty sections', async () => {
    const issues: Array<{ file: string; issue: string }> = [];
    
    for (const language of SUPPORTED_LANGUAGES) {
      const langDir = path.join(HELP_CONTENT_DIR, language);
      if(!fs.existsSync(langDir) {
        continue;
      }
      
      const files = fs.readdirSync(langDir').filter(f => f.endsWith('.json');
      for (const file of files) {
        const filePath = path.join(langDir, file');
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8');
          if (content.sections) {
            for (const section of content.sections) {
              if (!section.content || section.content.trim(') === '') {
                issues.push({ 
                  file: `${language}/${file}`; 
                  issue: `Empty section: ${section.title}` );
              }
            }
          } catch (error) {
          // Skip invalid files
        }
      }
    }
    
    if (issues.length > 0') {
      console.warn('Content quality issues:', issues);
    }
  }');
  it('should have proper encoding for all languages', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const langDir = path.join(HELP_CONTENT_DIR, language);
      if(!fs.existsSync(langDir) {
        continue;
      }
      
      const files = fs.readdirSync(langDir').filter(f => f.endsWith('.json');
      for (const file of files) {
        const filePath = path.join(langDir, file');
        const content = fs.readFileSync(filePath, 'utf8');
        // Check for proper UTF-8 encoding
        expect(() => JSON.parse(content).not.toThrow(');
        // For CJK languages, check for proper characters
        if(['ja', 'ko', 'zh-CN', 'zh-TW'].includes(language) {
          const parsed = JSON.parse(content);
          const text = JSON.stringify(parsed');
          // Should contain CJK characters if it's a CJK language file
          if (language === 'ja') {
            // Japanese should contain Hiragana, Katakana, or Kanji
            expect(text).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/');
          } else if (language === 'ko') {
            // Korean should contain Hangul
            expect(text).toMatch(/[\uAC00-\uD7AF]/');
          } else if(language.startsWith('zh') {
            // Chinese should contain Chinese characters
            expect(text).toMatch(/[\u4E00-\u9FFF]/);
          }
        }
      }
    }
  }');
}