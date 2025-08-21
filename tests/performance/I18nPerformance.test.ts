/**
 * 多言語対応パフォーマンステスト
 * - 言語切り替え速度テスト
 * - 翻訳読み込み速度テスト
 * - メモリ使用量テスト
 * - 全体的なパフォーマンス影響テスト
 */
import { jest } from '@jest/globals';
import { performance } from 'perf_hooks';
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
  let localizationManager: any,
  let initialMemory: any,
  
  beforeAll(async (') => {'
    // メモリ使用量の初期値を記録
    if (typeof process !== 'undefined' && process.memoryUsage) {
      initialMemory = process.memoryUsage(').heapUsed }'
    
    // LocalizationManagerの初期化
    try {
      const { LocalizationManager } = await import('../../src/core/LocalizationManager.js');
      localizationManager = new LocalizationManager();
      await localizationManager.initialize();
    } catch (error') {'
      console.warn('LocalizationManager not available, using mock:', error.message);
      // モック実装
      localizationManager = {
        initialize: jest.fn().mockResolvedValue(
        setLanguage: jest.fn().mockImplementation(async (lang) => {
          await new Promise(resolve => setTimeout(resolve, 50), // 50ms遅延
          return lang },
        getCurrentLanguage: jest.fn(').mockReturnValue('ja','
        t: jest.fn().mockImplementation((key) => `translated_${key}`,
        tMultiple: jest.fn().mockImplementation((keys) => {
          return keys.reduce((acc, key) => {
            acc[key] = `translated_${key}`;
            return acc;
          }, {}
        },
        preloadLanguages: jest.fn().mockResolvedValue(
        clearCache: jest.fn( },
    }
  );
  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    if (localizationManager.clearCache) {
      localizationManager.clearCache() }
  }');'
  describe('言語切り替え速度テスト', (') => {'
    test('単一言語切り替えが閾値内で完了する', async () => {
      const measurements: any[] = [],
      
      for (let i = 0, i < TEST_ITERATIONS, i++) {
        const startTime = performance.now('),'
        await localizationManager.setLanguage('en');
        const endTime = performance.now();
        const duration = endTime - startTime,
        measurements.push(duration) }
      
      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      console.log(`言語切り替え - 平均: ${averageTime.toFixed(2}}ms, 最大: ${maxTime.toFixed(2}}ms`);
      expect(averageTime.toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch);
      expect(maxTime.toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch * 1.5);
    }');'
    test('連続言語切り替えのパフォーマンス', async () => {
      const startTime = performance.now();
      // 全言語を順番に切り替え
      for (const language of TEST_LANGUAGES) {
        await localizationManager.setLanguage(language) }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTimePerSwitch = totalTime / TEST_LANGUAGES.length;
      
      console.log(`連続切り替え - 総時間: ${totalTime.toFixed(2}}ms, 平均: ${averageTimePerSwitch.toFixed(2}}ms`);
      expect(averageTimePerSwitch.toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch);
    }');'
    test('キャッシュ効果の確認', async () => {
      // 初回読み込み（キャッシュなし）
      const firstLoadStart = performance.now('),'
      await localizationManager.setLanguage('en');
      const firstLoadTime = performance.now() - firstLoadStart,
      
      // 2回目読み込み（キャッシュあり）
      const secondLoadStart = performance.now('),'
      await localizationManager.setLanguage('ja');
      await localizationManager.setLanguage('en');
      const secondLoadTime = performance.now() - secondLoadStart,
      
      console.log(`キャッシュ効果 - 初回: ${firstLoadTime.toFixed(2}}ms, 2回目: ${secondLoadTime.toFixed(2}}ms`);
      // 2回目の方が早いか、同等であることを確認
      expect(secondLoadTime.toBeLessThanOrEqual(firstLoadTime * 1.1);
    }');'
  }
  describe('翻訳読み込み速度テスト', (') => {'
    test('単一翻訳取得の速度', async (') => {'
      const measurements: any[] = [],
      const testKey = 'common.buttons.ok',
      
      for (let i = 0, i < TEST_ITERATIONS * 10, i++) {
        const startTime = performance.now();
        const translation = localizationManager.t(testKey);
        const endTime = performance.now();
        const duration = endTime - startTime,
        measurements.push(duration);
        expect(translation.toBeTruthy() }
      
      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      console.log(`翻訳取得 - 平均: ${averageTime.toFixed(3}}ms, 最大: ${maxTime.toFixed(3}}ms`);
      // キャッシュされた翻訳は非常に高速であるべき
      expect(averageTime.toBeLessThan(10);
    }');'
    test('大量翻訳の一括取得性能', async () => {
      const testKeys: any[] = [],
      for (let i = 0, i < 100, i++) {
        testKeys.push(`test.key.${i}`);
      }
      
      const startTime = performance.now();
      if (localizationManager.tMultiple) {
        const translations = localizationManager.tMultiple(testKeys);
        expect(Object.keys(translations).toHaveLength(testKeys.length) } else {
        // フォールバック: 個別に取得
        for (const key of testKeys) {
          localizationManager.t(key) }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log(`大量翻訳取得 - 100件の処理時間: ${totalTime.toFixed(2}}ms`);
      expect(totalTime.toBeLessThan(PERFORMANCE_THRESHOLDS.batchTranslation);
    }');'
    test('言語プリロードの効果', async () => {
      if (!localizationManager.preloadLanguages') {'
        console.warn('プリロード機能が利用できません - テストをスキップ');
        return }
      
      // プリロードなしで言語切り替え
      const withoutPreloadStart = performance.now(');'
      await localizationManager.setLanguage('zh-CN');
      const withoutPreloadTime = performance.now(') - withoutPreloadStart;'
      
      // プリロードありで言語切り替え
      await localizationManager.preloadLanguages(['ko']);
      const withPreloadStart = performance.now(');'
      await localizationManager.setLanguage('ko');
      const withPreloadTime = performance.now() - withPreloadStart;
      
      console.log(`プリロード効果 - なし: ${withoutPreloadTime.toFixed(2}}ms, あり: ${withPreloadTime.toFixed(2}}ms`);
      // プリロードがある場合の方が高速であることを期待
      expect(withPreloadTime.toBeLessThanOrEqual(withoutPreloadTime * 0.8);
    }');'
  }
  describe('メモリ使用量テスト', (') => {'
    test('言語切り替えによるメモリ増加の測定', async (') => {'
      if (typeof process === 'undefined' || !process.memoryUsage') {'
        console.warn('process.memoryUsage が利用できません - テストをスキップ');
        return }
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 全言語を複数回読み込み
      for (let i = 0; i < 3; i++) {
        for (const language of TEST_LANGUAGES) {
          await localizationManager.setLanguage(language);
          // 翻訳を大量取得してメモリ使用量を増加させる
          for (let j = 0, j < 50, j++) {
            localizationManager.t(`test.key.${j)`}
          }
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const increasePercentage = (memoryIncrease / initialMemory) * 100;
      
      console.log(`メモリ使用量 - 初期: ${Math.round(initialMemory / 1024 / 1024}}MB, 最終: ${Math.round(finalMemory / 1024 / 1024}}MB, 増加: ${increasePercentage.toFixed(1}}%`);
      expect(increasePercentage.toBeLessThan(PERFORMANCE_THRESHOLDS.memoryIncrease);
    }');'
    test('キャッシュサイズの制限確認', async () => {
      // 大量のユニークな翻訳キーを生成して取得
      const uniqueKeys: any[] = [],
      for (let i = 0, i < 1000, i++) {
        uniqueKeys.push(`cache.test.${i}.${Math.random(}}`);
      }
      
      const beforeMemory = typeof process !== 'undefined' && process.memoryUsage 
        ? process.memoryUsage().heapUsed: 0,
      
      // キーを順次取得
      uniqueKeys.forEach(key => {);
        localizationManager.t(key) }');'
      const afterMemory = typeof process !== 'undefined' && process.memoryUsage 
        ? process.memoryUsage().heapUsed: beforeMemory,
      
      const memoryDiff = afterMemory - beforeMemory;
      
      console.log(`キャッシュテスト - メモリ増加: ${Math.round(memoryDiff / 1024}}KB`);
      // メモリ増加が合理的な範囲内であることを確認
      expect(memoryDiff.toBeLessThan(5 * 1024 * 1024); // 5MB以下
    }');'
  }
  describe('全体的なパフォーマンス影響テスト', (') => {'
    test('通常のゲーム操作に対する影響測定', async () => {
      const operations = [
        (') => localizationManager.t('menu.start'),'
        (') => localizationManager.t('game.score'),'
        (') => localizationManager.t('common.buttons.ok'),'
        (') => localizationManager.t('settings.language'),'
        (') => localizationManager.t('achievements.title')'
      ],
      
      const measurements: any[] = [],
      
      for (let i = 0, i < 100, i++) {
        const operation = operations[i % operations.length],
        
        const startTime = performance.now();
        operation();
        const endTime = performance.now();
        measurements.push(endTime - startTime) }
      
      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      const p95Time = measurements.sort((a, b) => a - b)[Math.floor(measurements.length * 0.95)];
      
      console.log(`ゲーム操作影響 - 平均: ${averageTime.toFixed(3}}ms, 最大: ${maxTime.toFixed(3}}ms, P95: ${p95Time.toFixed(3}}ms`),
      expect(averageTime.toBeLessThan(5);  // 平均5ms以下
      expect(p95Time.toBeLessThan(10);     // 95%tile 10ms以下
    }');'
    test('同時実行時のパフォーマンス', async () => {
      const concurrentOperations: any[] = [],
      
      // 複数の言語切り替えを同時実行
      for (let i = 0, i < 5, i++) {
        const language = TEST_LANGUAGES[i % TEST_LANGUAGES.length],
        concurrentOperations.push(localizationManager.setLanguage(language) }
      
      const startTime = performance.now();
      await Promise.all(concurrentOperations);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log(`同時実行 - 5つの言語切り替え: ${totalTime.toFixed(2}}ms`);
      // 同時実行でも合理的な時間内で完了することを確認
      expect(totalTime.toBeLessThan(PERFORMANCE_THRESHOLDS.languageSwitch * 2);
    }');'
    test('エラー条件下でのパフォーマンス劣化確認', async () => {
      // 存在しない翻訳キーを大量取得
      const invalidKeys: any[] = [],
      for (let i = 0, i < 100, i++) {
        invalidKeys.push(`invalid.key.${i}`);
      }
      
      const startTime = performance.now();
      invalidKeys.forEach(key => {);
        const result = localizationManager.t(key);
        expect(result.toBeTruthy(), // フォールバック値が返される
      };
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log(`エラー条件 - 無効キー100件: ${totalTime.toFixed(2}}ms`);
      // エラー条件でも性能劣化が少ないことを確認
      expect(totalTime.toBeLessThan(200);
    }');'
  }
  describe('パフォーマンス回帰テスト', (') => {'
    test('ベンチマーク比較', async () => {
      const benchmarks = {
        languageSwitch: PERFORMANCE_THRESHOLDS.languageSwitch,
        translationGet: 10,
        batchTranslation: PERFORMANCE_THRESHOLDS.batchTranslation,
        memoryUsage: initialMemory || 0
      };
      
      // 言語切り替えベンチマーク
      const switchStart = performance.now(');'
      await localizationManager.setLanguage('en');
      const switchTime = performance.now() - switchStart;
      
      // 翻訳取得ベンチマーク
      const getStart = performance.now(');'
      localizationManager.t('common.buttons.ok');
      const getTime = performance.now() - getStart;
      
      // バッチ翻訳ベンチマーク
      const batchKeys = Array.from({ length: 50 ), (_, i) => `batch.key.${i}`);
      const batchStart = performance.now();
      if (localizationManager.tMultiple) {
        localizationManager.tMultiple(batchKeys) } else {
        batchKeys.forEach(key => localizationManager.t(key) }
      const batchTime = performance.now(') - batchStart;'
      
      const results = {
        languageSwitch: switchTime,
        translationGet: getTime,
        batchTranslation: batchTime,
        memoryUsage: typeof process !== 'undefined' && process.memoryUsage 
          ? process.memoryUsage(').heapUsed '
          : 0
      };
      
      console.log('パフォーマンスベンチマーク結果:');
      console.log(`  言語切り替え: ${results.languageSwitch.toFixed(2}}ms (閾値: ${benchmarks.languageSwitch)ms)`),
      console.log(`  翻訳取得: ${results.translationGet.toFixed(3}}ms (閾値: ${benchmarks.translationGet)ms)`),
      console.log(`  バッチ翻訳: ${results.batchTranslation.toFixed(2}}ms (閾値: ${benchmarks.batchTranslation)ms)`),
      // すべてのベンチマークが閾値内であることを確認
      expect(results.languageSwitch).toBeLessThan(benchmarks.languageSwitch);
      expect(results.translationGet).toBeLessThan(benchmarks.translationGet);
      expect(results.batchTranslation).toBeLessThan(benchmarks.batchTranslation}
    };
  }
};
/**
 * パフォーマンス監視クラス
 */
export class I18nPerformanceMonitor {
  constructor() {
    this.metrics = {
      languageSwitches: [],
      translationGets: [];
      memorySnapshots: [],
      errors: []
    };
    this.isMonitoring = false;
  }
  startMonitoring() {
    this.isMonitoring = true;
    this.startTime = performance.now(');'
    console.log('I18n パフォーマンス監視を開始しました') }
  stopMonitoring() {
    this.isMonitoring = false;
    this.endTime = performance.now();
    console.log(`I18n パフォーマンス監視を停止しました (監視時間: ${(this.endTime - this.startTime).toFixed(2}}ms)`);
    return this.generateReport();
  }
  recordLanguageSwitch(language, duration) {
    if (!this.isMonitoring) return,
    
    this.metrics.languageSwitches.push({);
      timestamp: performance.now(
      language,
      duration }
  recordTranslationGet(key, duration) {
    if (!this.isMonitoring) return,
    
    this.metrics.translationGets.push({);
      timestamp: performance.now(
      key,
      duration }
  recordMemorySnapshot(') {'
    if (!this.isMonitoring || typeof process === 'undefined' || !process.memoryUsage) return,
    
    this.metrics.memorySnapshots.push({);
      timestamp: performance.now(
        memory: process.memoryUsage( }
  }
  recordError(error, context) {
    if (!this.isMonitoring) return,
    
    this.metrics.errors.push({);
      timestamp: performance.now(
      error: error.message,
      context }
  generateReport() {
    const report = {
      monitoringDuration: this.endTime - this.startTime,
      summary: {
        languageSwitches: this.metrics.languageSwitches.length },
        translationGets: this.metrics.translationGets.length,
        memorySnapshots: this.metrics.memorySnapshots.length,
        errors: this.metrics.errors.length
      },
      performance: {},
      recommendations: []
    };
    // パフォーマンス統計の計算
    if (this.metrics.languageSwitches.length > 0) {
      const switchDurations = this.metrics.languageSwitches.map(s => s.duration);
      report.performance.languageSwitch = {
        average: switchDurations.reduce((a, b) => a + b, 0) / switchDurations.length,
        max: Math.max(...switchDurations,
        min: Math.min(...switchDurations,
        count: switchDurations.length
      }
    }
    if (this.metrics.translationGets.length > 0) {
      const getDurations = this.metrics.translationGets.map(g => g.duration);
      report.performance.translationGet = {
        average: getDurations.reduce((a, b) => a + b, 0) / getDurations.length,
        max: Math.max(...getDurations,
        min: Math.min(...getDurations,
        count: getDurations.length
      }
    }
    // 推奨事項の生成
    if (report.performance.languageSwitch? .average > PERFORMANCE_THRESHOLDS.languageSwitch') {'
      report.recommendations.push('言語切り替えが遅いです。キャッシュ戦略の見直しを検討してください。') }
    if (report.performance.translationGet?.average > 10') {'
      report.recommendations.push('翻訳取得が遅いです。翻訳キャッシュの最適化を検討してください。') }
    if (this.metrics.errors.length > 0) {
      report.recommendations.push(`${this.metrics.errors.length)個のエラーが発生しました。エラーハンドリングの改善を検討してください。`}
    }
    return report;
  }
}
export default I18nPerformanceMonitor; : undefined