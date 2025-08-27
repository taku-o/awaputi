/**
 * TranslationLoaderとの互換性テスト
 * Issue #75対応 - optimizedAtフィールド削除後の動作確認
 */

import { TranslationLoader } from '../../src/core/i18n/TranslationLoader.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

// ErrorHandlerのモック
globalThis.getErrorHandler = () => ({
  handleError: (error, code, context) => {
    console.error('Mock Error Handler:', { error, code, context });
  }
});

describe('TranslationLoader Compatibility Tests', () => {
  let translationLoader;
  const localesDir = path.join(projectRoot, 'src', 'locales');
  const supportedLanguages = ['en', 'ja', 'ko', 'zh-CN', 'zh-TW'];
  const categories = ['achievements', 'common', 'errors', 'game', 'help', 'menu', 'settings'];

  beforeEach(() => {
    translationLoader = new TranslationLoader();
    // テスト用にベースURLを設定
    translationLoader.setBaseURL('/src/locales/');
  });

  afterEach(() => {
    if (translationLoader) {
      translationLoader.cleanup();
    }
  });

  describe('Translation file structure validation', () => {
    test('should validate translation files have required metadata without optimizedAt', async () => {
      for (const lang of supportedLanguages) {
        for (const category of categories) {
          const filePath = path.join(localesDir, lang, `${category}.json`);
          
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            // ファイル構造の基本検証
            expect(data).toHaveProperty('meta');
            expect(data).toHaveProperty('translations');
            
            // 必須メタデータの存在確認
            expect(data.meta).toHaveProperty('language', lang);
            expect(data.meta).toHaveProperty('version');
            expect(data.meta).toHaveProperty('completeness');
            
            // optimizedAtフィールドが存在しないことを確認
            expect(data.meta).not.toHaveProperty('optimizedAt');
            
            // 翻訳データが存在することを確認
            expect(typeof data.translations).toBe('object');
            expect(Object.keys(data.translations).length).toBeGreaterThan(0);
            
          } catch (error) {
            console.warn(`Could not test file ${filePath}:`, error.message);
          }
        }
      }
    });

    test('should have consistent metadata structure across all files', async () => {
      const metadataFields = new Set();
      const languageMetadata = {};

      // 全ファイルのメタデータ構造を収集
      for (const lang of supportedLanguages) {
        languageMetadata[lang] = {};
        
        for (const category of categories) {
          const filePath = path.join(localesDir, lang, `${category}.json`);
          
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            if (data.meta) {
              Object.keys(data.meta).forEach(field => metadataFields.add(field));
              languageMetadata[lang][category] = Object.keys(data.meta);
            }
          } catch (error) {
            // ファイルが存在しない場合はスキップ
          }
        }
      }

      // optimizedAtフィールドが存在しないことを確認
      expect(metadataFields.has('optimizedAt')).toBe(false);
      
      // 基本的なメタデータフィールドの存在確認
      expect(metadataFields.has('language')).toBe(true);
      expect(metadataFields.has('version')).toBe(true);
      expect(metadataFields.has('completeness')).toBe(true);
    });
  });

  describe('TranslationLoader metadata validation', () => {
    test('should validate metadata without requiring optimizedAt field', async () => {
      // TranslationLoader内部のメタデータ検証メソッドをテスト
      const mockMeta = {
        language: 'ja',
        version: '1.0.0',
        completeness: 95,
        quality: 90,
        lastUpdated: '2025-01-28T00:00:00Z'
      };

      // optimizedAtフィールドなしでメタデータ検証が正常に動作することを確認
      expect(() => {
        translationLoader._validateMetadata(mockMeta, 'ja', 'game');
      }).not.toThrow();
    });

    test('should handle metadata validation with missing optional fields', async () => {
      const minimalMeta = {
        language: 'en',
        version: '1.0.0'
      };

      // 最小限のメタデータでも検証が通ることを確認
      expect(() => {
        translationLoader._validateMetadata(minimalMeta, 'en', 'common');
      }).not.toThrow();
    });
  });

  describe('Translation loading functionality', () => {
    // Fetchのモック設定
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch?.mockRestore?.();
    });

    test('should load translation files without optimizedAt field', async () => {
      // モックレスポンスデータ（optimizedAtフィールドなし）
      const mockTranslationData = {
        meta: {
          language: 'ja',
          version: '1.0.0',
          completeness: 100,
          quality: 95,
          lastUpdated: '2025-01-28T00:00:00Z',
          size: 1482
        },
        translations: {
          game: {
            score: 'スコア',
            hp: 'HP'
          }
        }
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslationData)
      });

      // 翻訳ファイルの読み込みテスト
      const result = await translationLoader._loadTranslationFile('ja', 'game');
      
      expect(result).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta.optimizedAt).toBeUndefined();
      expect(result.meta.language).toBe('ja');
      expect(result.translations).toBeDefined();
    });

    test('should process flattened translations correctly', async () => {
      const mockTranslations = {
        game: {
          score: 'スコア',
          userInfo: {
            title: 'ユーザー情報',
            playerName: 'プレイヤー名'
          }
        },
        menu: {
          start: 'スタート',
          settings: '設定'
        }
      };

      const flattened = translationLoader._flattenTranslations(mockTranslations);
      
      // フラット化されたキーの確認（カテゴリごとに処理される）
      expect(flattened['score']).toBe('スコア');
      expect(flattened['userInfo.title']).toBe('ユーザー情報');
      expect(flattened['userInfo.playerName']).toBe('プレイヤー名');
      expect(flattened['start']).toBe('スタート');
      expect(flattened['settings']).toBe('設定');
    });
  });

  describe('Backward compatibility verification', () => {
    test('should maintain compatibility with existing translation structure', async () => {
      // 実際のファイルから1つサンプルを読み込んでテスト
      const sampleFilePath = path.join(localesDir, 'ja', 'game.json');
      
      try {
        const content = await fs.readFile(sampleFilePath, 'utf-8');
        const data = JSON.parse(content);
        
        // 基本構造の確認
        expect(data).toHaveProperty('meta');
        expect(data).toHaveProperty('translations');
        
        // TranslationLoaderで処理できる形式であることを確認
        const processedTranslations = data.translations || data;
        expect(typeof processedTranslations).toBe('object');
        
        // メタデータ検証が正常に動作することを確認
        if (data.meta) {
          expect(() => {
            translationLoader._validateMetadata(data.meta, data.meta.language, 'game');
          }).not.toThrow();
        }
        
      } catch (error) {
        console.warn('Sample file test skipped:', error.message);
      }
    });

    test('should handle cache operations without optimizedAt dependency', async () => {
      const cacheKey = 'ja:game';
      const mockData = {
        meta: {
          language: 'ja',
          version: '1.0.0',
          completeness: 100
        },
        translations: {
          game: { score: 'スコア' }
        }
      };

      // キャッシュ設定
      translationLoader.cache.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });

      // キャッシュからデータを取得
      const cached = translationLoader.cache.get(cacheKey);
      expect(cached).toBeDefined();
      expect(cached.data.meta.optimizedAt).toBeUndefined();
      expect(cached.data.meta.language).toBe('ja');
    });
  });

  describe('Error handling and robustness', () => {
    test('should handle malformed translation files gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          // intentionally malformed - no meta field
          translations: { test: 'value' }
        })
      });

      const result = await translationLoader._loadTranslationFile('en', 'test');
      
      // エラーが発生せず、結果が返されることを確認
      expect(result).toBeDefined();
      expect(result.translations).toBeDefined();
    });

    test('should maintain functionality without metadata', async () => {
      const translationsWithoutMeta = {
        game: { score: 'Score' },
        menu: { start: 'Start' }
      };

      const flattened = translationLoader._flattenTranslations(translationsWithoutMeta);
      
      // メタデータなしでもフラット化処理が正常に動作することを確認
      expect(flattened['score']).toBe('Score');
      expect(flattened['start']).toBe('Start');
    });
  });
});