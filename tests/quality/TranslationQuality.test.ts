/**
 * 翻訳品質テストスイート
 * - 各言語の翻訳精度テスト
 * - 文化的適切性テスト
 * - UI表示品質テスト
 * - ユーザビリティテスト
 */
// import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
// テスト対象言語
const SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
const TRANSLATION_CATEGORIES = ['common', 'menu', 'game', 'settings', 'errors', 'achievements', 'help'];
/**
 * 翻訳ファイル読み込みヘルパー
 */
async function loadTranslationFile(language: string, category: string) {
  const filePath = path.join(projectRoot, 'src', 'locales', language, `${category}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}
/**
 * 全翻訳ファイル読み込み
 */
async function loadAllTranslations() {
  const translations: Record<string, any> = {};
  
  for (const language of SUPPORTED_LANGUAGES) {
    translations[language] = {};
    for (const category of TRANSLATION_CATEGORIES) {
      translations[language][category] = await loadTranslationFile(language, category);
    }
  }
  
  return translations;
}
/**
 * 翻訳キー抽出（ネストされたオブジェクト対応）
 */
function extractTranslationKeys(obj: any, prefix = '') {
  const keys: any[] = [];
  
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'meta') continue; // メタデータをスキップ
      
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys.push(...extractTranslationKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
}
describe('翻訳品質テスト', () => {
  let translations: any;
  
  beforeAll(async () => {
    translations = await loadAllTranslations();
  });
  describe('翻訳精度テスト', () => {
    test('基準言語（日本語）の翻訳ファイルが存在する', async () => {
      for (const category of TRANSLATION_CATEGORIES) {
        expect(translations.ja[category]).toBeTruthy();
        expect(translations.ja[category].translations).toBeTruthy();
      }
    });
    test('全言語で翻訳ファイルが存在する', async () => {
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of TRANSLATION_CATEGORIES) {
          expect(translations[language][category]).toBeTruthy();
          expect(translations[language][category].translations).toBeTruthy();
        }
      }
    });
    test('翻訳キーの整合性チェック', async () => {
      const baseLanguage = 'ja';
      
      for (const category of TRANSLATION_CATEGORIES) {
        const baseKeys = extractTranslationKeys(translations[baseLanguage][category].translations);
        for (const language of SUPPORTED_LANGUAGES) {
          if (language === baseLanguage) continue;
          
          const targetKeys = extractTranslationKeys(translations[language][category].translations);
          // 基準言語にあるキーが対象言語にもあることを確認
          for (const key of baseKeys) {
            expect(targetKeys).toContain(key);
          }
          
          // 余分なキーがないことを確認
          const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
          if (extraKeys.length > 0) {
            console.warn(`${language}/${category}.json に余分なキーがあります:`, extraKeys);
          }
        }
      }
    });
    test('翻訳値が空でないことを確認', async () => {
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of TRANSLATION_CATEGORIES) {
          const categoryData = translations[language][category];
          if (!categoryData || !categoryData.translations) continue;
          
          const keys = extractTranslationKeys(categoryData.translations);
          for (const key of keys) {
            const value = getNestedValue(categoryData.translations, key);
            expect(value).toBeTruthy();
            expect(typeof value).toBe('string');
            expect(value.trim()).not.toBe('');
          }
        }
      }
    });
  });
  describe('文化的適切性テスト', () => {
    test('日本語の敬語使用チェック', async () => {
      const jaTranslations = translations.ja;
      
      // メニューやヘルプでの敬語使用をチェック
      const menuTranslations = jaTranslations.menu?.translations || {};
      const helpTranslations = jaTranslations.help?.translations || {};
      
      // 基本的な敬語表現の存在チェック
      const politePatterns = [/です$/, /ます$/, /ください$/, /いたします$/];
      let politeCount = 0;
      let totalCount = 0;
      
      const checkPolite = (obj: any) => {
        for (const [, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            totalCount++;
            if(politePatterns.some(pattern => pattern.test(value))) {
              politeCount++;
            }
          } else if (typeof value === 'object' && value !== null) {
            checkPolite(value);
          }
        }
      };
      
      checkPolite(menuTranslations);
      checkPolite(helpTranslations);
      if (totalCount > 0) {
        const politeRatio = politeCount / totalCount;
        expect(politeRatio).toBeGreaterThan(0.5); // 50%以上で敬語を使用
      }
    });
    test('英語の文法チェック', async () => {
      const enTranslations = translations.en;
      
      for (const category of TRANSLATION_CATEGORIES) {
        const categoryData = enTranslations[category];
        if (!categoryData || !categoryData.translations) continue;
        
        const keys = extractTranslationKeys(categoryData.translations);
        for (const key of keys) {
          const value = getNestedValue(categoryData.translations, key);
          if (typeof value !== 'string') continue;
          
          // 基本的な英語文法チェック
          // 文の開始は大文字
          if (value.length > 0 && /^[a-z]/.test(value)) {
            // 特殊なケース（小文字で始まる固有名詞など）を除く
            if (!key.includes('username') && !key.includes('email')) {
              console.warn(`${category}.${key}: 英語文は大文字で始まるべきです - "${value}"`);
            }
          }
          
          // スペースの二重使用チェック
          if (value.includes('  ')) {
            console.warn(`${category}.${key}: 不要なスペースがあります - "${value}"`);
          }
        }
      }
    });
    test('中国語の繁体字・簡体字チェック', async () => {
      const zhCNTranslations = translations['zh-CN'];
      const zhTWTranslations = translations['zh-TW'];
      
      // 簡体字・繁体字の基本的な違いをチェック
      // const traditionalChars = ['國', '華', '學', '時', '過', '來'];
      const simplifiedChars = ['国', '华', '学', '时', '过', '来'];
      
      for (const category of TRANSLATION_CATEGORIES) {
        const cnData = zhCNTranslations[category];
        const twData = zhTWTranslations[category];
        
        if (!cnData?.translations || !twData?.translations) continue;
        
        const cnKeys = extractTranslationKeys(cnData.translations);
        for (const key of cnKeys) {
          const cnValue = getNestedValue(cnData.translations, key);
          const twValue = getNestedValue(twData.translations, key);
          if (typeof cnValue === 'string' && typeof twValue === 'string') {
            // 簡体字に簡体字文字が含まれていることを確認
            const hasSimplified = simplifiedChars.some(char => cnValue.includes(char));
            // const hasTraditional = traditionalChars.some(char => twValue.includes(char));
            if (cnValue === twValue && hasSimplified) {
              console.warn(`${category}.${key}: 簡体字と繁体字が同じです - "${cnValue}"`);
            }
          }
        }
      }
    });
  });
  describe('UI表示品質テスト', () => {
    test('文字長チェック', async () => {
      const maxLengths = {
        button: 20,
        menu: 30,
        title: 50,
        description: 200,
        error: 100
      };
      
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of TRANSLATION_CATEGORIES) {
          const categoryData = translations[language][category];
          if (!categoryData || !categoryData.translations) continue;
          
          const keys = extractTranslationKeys(categoryData.translations);
          for (const key of keys) {
            const value = getNestedValue(categoryData.translations, key);
            if (typeof value !== 'string') continue;
            
            // キーの種類に基づいて最大長をチェック
            let maxLength = 200; // デフォルト
            if (key.includes('button')) maxLength = maxLengths.button;
            else if (key.includes('menu')) maxLength = maxLengths.menu;
            else if (key.includes('title')) maxLength = maxLengths.title;
            else if(key.includes('error')) maxLength = maxLengths.error;
            
            if (value.length > maxLength) {
              console.warn(`${language}/${category}.${key}: 文字数が長すぎます (${value.length}文字) - "${value.substring(0, 50)}..."`);
            }
          }
        }
      }
    });
    test('HTMLタグの不正使用チェック', async () => {
      const dangerousTags = ['<script', '<iframe', '<object', '<embed', '<link', '<meta'];
      
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of TRANSLATION_CATEGORIES) {
          const categoryData = translations[language][category];
          if (!categoryData || !categoryData.translations) continue;
          
          const keys = extractTranslationKeys(categoryData.translations);
          for (const key of keys) {
            const value = getNestedValue(categoryData.translations, key);
            if (typeof value !== 'string') continue;
            
            for (const tag of dangerousTags) {
              expect(value.toLowerCase()).not.toContain(tag);
            }
          }
        }
      }
    });
    test('パラメータプレースホルダーの整合性', async () => {
      const parameterPattern = /\{\{(\w+)\}\}/g;
      const baseLanguage = 'ja';
      
      for (const category of TRANSLATION_CATEGORIES) {
        const baseData = translations[baseLanguage][category];
        if (!baseData || !baseData.translations) continue;
        
        const baseKeys = extractTranslationKeys(baseData.translations);
        for (const key of baseKeys) {
          const baseValue = getNestedValue(baseData.translations, key);
          if (typeof baseValue !== 'string') continue;
          
          const baseParams = Array.from(baseValue.matchAll(parameterPattern)).map(m => m[1]);
          if (baseParams.length === 0) continue;
          
          for (const language of SUPPORTED_LANGUAGES) {
            if (language === baseLanguage) continue;
            
            const targetValue = getNestedValue(translations[language][category]?.translations || {}, key);
            if (typeof targetValue !== 'string') continue;
            
            const targetParams = Array.from(targetValue.matchAll(parameterPattern)).map(m => m[1]);
            // パラメータの数と名前が一致することを確認
            expect(targetParams.sort()).toEqual(baseParams.sort());
          }
        }
      }
    });
  });
  describe('メタデータ品質テスト', () => {
    test('翻訳メタデータの存在確認', async () => {
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of TRANSLATION_CATEGORIES) {
          const categoryData = translations[language][category];
          if (!categoryData) continue;
          
          expect(categoryData.meta).toBeTruthy();
          expect(categoryData.meta.language).toBe(language);
          expect(categoryData.meta.version).toBeTruthy();
          expect(categoryData.meta.lastUpdated).toBeTruthy();
        }
      }
    });
    test('翻訳完成度の妥当性チェック', async () => {
      for (const language of SUPPORTED_LANGUAGES) {
        for (const category of TRANSLATION_CATEGORIES) {
          const categoryData = translations[language][category];
          if (!categoryData || !categoryData.meta) continue;
          
          const completeness = categoryData.meta.completeness;
          
          if (typeof completeness === 'number') {
            expect(completeness).toBeGreaterThanOrEqual(0);
            expect(completeness).toBeLessThanOrEqual(100);
            // 日本語と英語は100%完成を期待
            if (language === 'ja' || language === 'en') {
              expect(completeness).toBe(100);
            }
          }
        }
      }
    });
  });
});
/**
 * ネストされたオブジェクトから値を取得
 */
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
/**
 * 翻訳品質レポート生成
 */
export async function generateTranslationQualityReport() {
  console.log('📊 翻訳品質レポート生成中...');
  const translations = await loadAllTranslations();
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      supportedLanguages: SUPPORTED_LANGUAGES,
      categories: TRANSLATION_CATEGORIES,
      totalFiles: 0,
      completedFiles: 0,
      issues: []
    },
    languages: {} as any,
    recommendations: []
  };
  
  for (const language of SUPPORTED_LANGUAGES) {
    report.languages[language] = {
      completeness: 0,
      quality: 0,
      keyCount: 0,
      issues: [] as any[],
      categories: {}
    };
    
    let totalKeys = 0;
    let translatedKeys = 0;
    let qualityScore = 100;
    
    for (const category of TRANSLATION_CATEGORIES) {
      const categoryData = translations[language][category];
      report.summary.totalFiles++;
      
      if (categoryData && categoryData.translations) {
        report.summary.completedFiles++;
        
        const keys = extractTranslationKeys(categoryData.translations);
        const categoryKeys = keys.length;
        
        totalKeys += categoryKeys;
        translatedKeys += categoryKeys;
        
        report.languages[language].categories[category] = {
          keyCount: categoryKeys,
          completeness: categoryData.meta?.completeness || 100,
          quality: categoryData.meta?.quality || 90,
          lastUpdated: categoryData.meta?.lastUpdated
        };
      } else {
        report.languages[language].issues.push(`Missing category: ${category}`);
        qualityScore -= 10;
      }
    }
    
    report.languages[language].completeness = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0;
    report.languages[language].quality = qualityScore;
    report.languages[language].keyCount = totalKeys;
  }
  
  // レポートをファイルに保存
  const reportPath = path.join(projectRoot, 'reports', 'translation-quality-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log('✅ 翻訳品質レポート生成完了');
  console.log(`📄 レポートファイル: ${reportPath}`);
  return report;
}
export default {
  loadTranslationFile,
  loadAllTranslations,
  extractTranslationKeys,
  generateTranslationQualityReport
};