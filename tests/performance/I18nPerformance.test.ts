import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { performance } from 'perf_hooks';
/**
 * 多言語対応パフォーマンステスト
 * - 言語切り替え速度テスト
 * - 翻訳読み込み速度テスト
 * - メモリ使用量テスト
 * - 全体的なパフォーマンス影響テスト
 */

// テスト設定
const PERFORMANCE_THRESHOLDS = {
  languageSwitch: 500,    // ms - 言語切り替え時間
  translationLoad: 200,   // ms - 翻訳読み込み時間
  memoryIncrease: 20,     // % - メモリ使用量増加率
  batchTranslation: 100   // ms - 大量翻訳処理時間
};

const TEST_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
const TEST_ITERATIONS = 10;

describe('多言語対応パフォーマンステスト', () => {
  let localizationManager: any;
  let initialMemory: number;
  
  beforeAll(async () => {
    // メモリ使用量の初期値を記録
    if (typeof process !== 'undefined' && process.memoryUsage) {
      initialMemory = process.memoryUsage().heapUsed;
    }
    
    // LocalizationManagerの初期化
    try {
      const { LocalizationManager } = await import('../../src/core/LocalizationManager.js');
      localizationManager = new LocalizationManager();
      await localizationManager.initialize();
    } catch (error: any) {
      console.warn('LocalizationManager not available, using mock:', error.message);
      // モック実装
      localizationManager = {
        initialize: jest.fn().mockResolvedValue(undefined),
        setLanguage: jest.fn().mockImplementation(async (lang: string) => {
          await new Promise(resolve => setTimeout(resolve, 50)); // 50ms遅延
          return lang;
        }),
        getCurrentLanguage: jest.fn().mockReturnValue('ja'),
        t: jest.fn().mockImplementation((key: string) => `translated_${key}`),
        tMultiple: jest.fn().mockImplementation((keys: string[]) => {
          return keys.reduce((acc: any, key: string) => {
            acc[key] = `translated_${key}`;
            return acc;
          }, {});
        }),
        preloadLanguages: jest.fn().mockResolvedValue(undefined),
        clearCache: jest.fn(),
        getTranslationCache: jest.fn().mockReturnValue(new Map()),
        getCacheStats: jest.fn().mockReturnValue({
          size: 100,
          hitRate: 0.85,
          memoryUsage: 1024 * 1024
        })
      };
    }
  });

  describe('言語切り替えパフォーマンス', () => {
    test('単一言語切り替え速度', async () => {
      const startTime = performance.now();
      await localizationManager.setLanguage('en');
      const endTime = performance.now();
      
      const switchTime = endTime - startTime;
      expect(switchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch);
      
      console.log(`言語切り替え時間: ${switchTime.toFixed(2)}ms`);
    });

    test('連続言語切り替え速度', async () => {
      const results: number[] = [];
      
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const lang = TEST_LANGUAGES[i % TEST_LANGUAGES.length];
        
        const startTime = performance.now();
        await localizationManager.setLanguage(lang);
        const endTime = performance.now();
        
        results.push(endTime - startTime);
      }
      
      const averageTime = results.reduce((a, b) => a + b, 0) / results.length;
      const maxTime = Math.max(...results);
      
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch);
      expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch * 1.5);
      
      console.log(`連続切り替え平均時間: ${averageTime.toFixed(2)}ms, 最大時間: ${maxTime.toFixed(2)}ms`);
    });

    test('全言語プリロード性能', async () => {
      const startTime = performance.now();
      await localizationManager.preloadLanguages(TEST_LANGUAGES);
      const endTime = performance.now();
      
      const preloadTime = endTime - startTime;
      expect(preloadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.translationLoad * TEST_LANGUAGES.length);
      
      console.log(`全言語プリロード時間: ${preloadTime.toFixed(2)}ms`);
    });
  });

  describe('翻訳処理パフォーマンス', () => {
    test('単一キー翻訳速度', () => {
      const testKeys = Array.from({ length: 100 }, (_, i) => `test.key.${i}`);
      
      const startTime = performance.now();
      testKeys.forEach(key => {
        localizationManager.t(key);
      });
      const endTime = performance.now();
      
      const translationTime = endTime - startTime;
      expect(translationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.translationLoad);
      
      console.log(`100個のキー翻訳時間: ${translationTime.toFixed(2)}ms`);
    });

    test('バッチ翻訳処理速度', () => {
      const testKeys = Array.from({ length: 1000 }, (_, i) => `batch.key.${i}`);
      
      const startTime = performance.now();
      const results = localizationManager.tMultiple(testKeys);
      const endTime = performance.now();
      
      const batchTime = endTime - startTime;
      expect(batchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.batchTranslation * 10);
      expect(Object.keys(results)).toHaveLength(testKeys.length);
      
      console.log(`1000個のバッチ翻訳時間: ${batchTime.toFixed(2)}ms`);
    });

    test('複雑なキー構造翻訳速度', () => {
      const complexKeys = [
        'game.ui.buttons.start',
        'game.ui.buttons.pause',
        'game.ui.score.current',
        'game.ui.score.best',
        'game.messages.level.complete',
        'game.messages.level.failed',
        'settings.graphics.quality',
        'settings.audio.volume',
        'help.tutorial.basic',
        'help.tutorial.advanced'
      ];
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        complexKeys.forEach(key => {
          localizationManager.t(key);
        });
      }
      
      const endTime = performance.now();
      const complexTime = endTime - startTime;
      
      expect(complexTime).toBeLessThan(PERFORMANCE_THRESHOLDS.translationLoad * 2);
      
      console.log(`複雑キー翻訳時間: ${complexTime.toFixed(2)}ms`);
    });
  });

  describe('キャッシュ性能', () => {
    test('翻訳キャッシュ効率', () => {
      const testKey = 'cache.performance.test';
      
      // 初回翻訳（キャッシュミス）
      const startTime1 = performance.now();
      localizationManager.t(testKey);
      const endTime1 = performance.now();
      const firstCallTime = endTime1 - startTime1;
      
      // 2回目翻訳（キャッシュヒット）
      const startTime2 = performance.now();
      localizationManager.t(testKey);
      const endTime2 = performance.now();
      const cachedCallTime = endTime2 - startTime2;
      
      // キャッシュヒットは初回より早くないといけない
      expect(cachedCallTime).toBeLessThan(firstCallTime);
      
      console.log(`初回: ${firstCallTime.toFixed(2)}ms, キャッシュ: ${cachedCallTime.toFixed(2)}ms`);
    });

    test('キャッシュメモリ使用量', () => {
      const initialStats = localizationManager.getCacheStats();
      
      // 大量の翻訳キーを処理してキャッシュを増やす
      const largeKeySet = Array.from({ length: 5000 }, (_, i) => `memory.test.${i}`);
      largeKeySet.forEach(key => localizationManager.t(key));
      
      const finalStats = localizationManager.getCacheStats();
      
      const memoryIncrease = finalStats.memoryUsage - initialStats.memoryUsage;
      const increaseRatio = (memoryIncrease / initialStats.memoryUsage) * 100;
      
      expect(increaseRatio).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryIncrease * 5); // 大量データなので5倍許容
      expect(finalStats.hitRate).toBeGreaterThan(0.7); // 70%以上のヒット率
      
      console.log(`メモリ増加: ${(memoryIncrease / 1024).toFixed(2)}KB (${increaseRatio.toFixed(1)}%)`);
      console.log(`キャッシュヒット率: ${(finalStats.hitRate * 100).toFixed(1)}%`);
    });

    test('キャッシュクリーンアップ効果', () => {
      const beforeCleanup = localizationManager.getCacheStats();
      
      localizationManager.clearCache();
      
      const afterCleanup = localizationManager.getCacheStats();
      
      expect(afterCleanup.size).toBeLessThan(beforeCleanup.size);
      expect(afterCleanup.memoryUsage).toBeLessThan(beforeCleanup.memoryUsage);
      
      console.log(`クリーンアップ前: ${beforeCleanup.size}エントリ, ${(beforeCleanup.memoryUsage / 1024).toFixed(2)}KB`);
      console.log(`クリーンアップ後: ${afterCleanup.size}エントリ, ${(afterCleanup.memoryUsage / 1024).toFixed(2)}KB`);
    });
  });

  describe('大量データ処理性能', () => {
    test('同時多言語処理', async () => {
      const testKeys = Array.from({ length: 100 }, (_, i) => `concurrent.test.${i}`);
      
      const startTime = performance.now();
      
      // 全言語で同時に翻訳処理
      const promises = TEST_LANGUAGES.map(async (lang) => {
        await localizationManager.setLanguage(lang);
        return testKeys.map(key => localizationManager.t(key));
      });
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const concurrentTime = endTime - startTime;
      
      expect(concurrentTime).toBeLessThan(PERFORMANCE_THRESHOLDS.batchTranslation * TEST_LANGUAGES.length);
      
      console.log(`同時多言語処理時間: ${concurrentTime.toFixed(2)}ms`);
    });

    test('リアルタイム言語切り替えシミュレーション', async () => {
      const switchCount = 50;
      const keysPerSwitch = 10;
      
      const startTime = performance.now();
      
      for (let i = 0; i < switchCount; i++) {
        const lang = TEST_LANGUAGES[i % TEST_LANGUAGES.length];
        await localizationManager.setLanguage(lang);
        
        // 各言語で翻訳処理
        for (let j = 0; j < keysPerSwitch; j++) {
          localizationManager.t(`realtime.test.${j}`);
        }
      }
      
      const endTime = performance.now();
      const realtimeTime = endTime - startTime;
      
      const averagePerSwitch = realtimeTime / switchCount;
      
      expect(averagePerSwitch).toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch);
      
      console.log(`リアルタイム切り替え総時間: ${realtimeTime.toFixed(2)}ms`);
      console.log(`1回あたり平均時間: ${averagePerSwitch.toFixed(2)}ms`);
    });
  });

  describe('メモリリーク検出', () => {
    test('長時間実行時のメモリ安定性', async () => {
      let currentMemory: number;
      
      if (typeof process !== 'undefined' && process.memoryUsage) {
        currentMemory = process.memoryUsage().heapUsed;
      } else {
        currentMemory = 0;
      }
      
      // 長時間の処理をシミュレート
      for (let cycle = 0; cycle < 10; cycle++) {
        // 各サイクルで全言語処理
        for (const lang of TEST_LANGUAGES) {
          await localizationManager.setLanguage(lang);
          
          // 大量の翻訳処理
          for (let i = 0; i < 100; i++) {
            localizationManager.t(`leak.test.cycle.${cycle}.item.${i}`);
          }
        }
        
        // 定期的なキャッシュクリーンアップ
        if (cycle % 3 === 0) {
          localizationManager.clearCache();
        }
      }
      
      let finalMemory: number;
      if (typeof process !== 'undefined' && process.memoryUsage) {
        finalMemory = process.memoryUsage().heapUsed;
      } else {
        finalMemory = 0;
      }
      
      const memoryIncrease = finalMemory - currentMemory;
      const increasePercent = (memoryIncrease / currentMemory) * 100;
      
      // メモリ増加が許容範囲内かチェック
      expect(increasePercent).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryIncrease * 2);
      
      console.log(`長時間実行後のメモリ増加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);
    });
  });

  afterAll(() => {
    if (localizationManager && localizationManager.clearCache) {
      localizationManager.clearCache();
    }
  });
});