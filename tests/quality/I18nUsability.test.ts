/**
 * 多言語対応ユーザビリティテスト
 * - 言語切り替えの使いやすさ
 * - UI表示の自然さ
 * - レスポンス時間
 * - ユーザー体験の品質
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';

// DOM環境のセットアップ
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="gameCanvas"></canvas></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
(global as any).CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
(global as any).localStorage = dom.window.localStorage;
(global as any).sessionStorage = dom.window.sessionStorage;
(global as any).navigator = dom.window.navigator;

describe('多言語対応ユーザビリティテスト', () => {
  let localizationManager: any;
  let gameEngine: any;
  
  beforeEach(async () => {
    // LocalizationManagerをモックまたは実際のインスタンスを使用
    const { LocalizationManager } = await import('../../src/core/LocalizationManager.js');
    localizationManager = new LocalizationManager();
    
    // GameEngineのセットアップ（必要に応じて）
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const { GameEngine } = await import('../../src/core/GameEngine.js');
      gameEngine = new GameEngine(canvas);
    }
    
    // ローカルストレージをクリア
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('言語切り替えの使いやすさ', () => {
    test('言語切り替えが500ms以内に完了する', async () => {
      const startTime = performance.now();
      
      await localizationManager.setLanguage('en');
      
      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      expect(switchTime).toBeLessThan(500);
    });

    test('言語切り替え中にUI状態が適切に管理される', async () => {
      // 切り替え前の言語を確認
      const initialLanguage = localizationManager.getCurrentLanguage();
      expect(initialLanguage).toBe('ja');
      
      // 言語切り替えを実行
      const switchPromise = localizationManager.setLanguage('en');
      
      // 切り替え中の状態確認
      expect(localizationManager.isLoading()).toBe(true);
      
      await switchPromise;
      
      // 切り替え後の状態確認
      expect(localizationManager.getCurrentLanguage()).toBe('en');
      expect(localizationManager.isLoading()).toBe(false);
    });

    test('無効な言語コードでフォールバックが動作する', async () => {
      const initialLanguage = localizationManager.getCurrentLanguage();
      
      // 無効な言語コードを指定
      await localizationManager.setLanguage('invalid-lang');
      
      // フォールバック言語（英語または日本語）になることを確認
      const currentLanguage = localizationManager.getCurrentLanguage();
      expect(['ja', 'en']).toContain(currentLanguage);
    });

    test('連続した言語切り替えが正しく処理される', async () => {
      // 連続して言語を切り替え
      const promises = [
        localizationManager.setLanguage('en'),
        localizationManager.setLanguage('zh-CN'),
        localizationManager.setLanguage('ja')
      ];
      
      await Promise.all(promises);
      
      // 最終的に日本語になることを確認
      expect(localizationManager.getCurrentLanguage()).toBe('ja');
    });
  });

  describe('UI表示の自然さ', () => {
    test('翻訳テキストが適切にレンダリングされる', async () => {
      const testKeys = [
        'common.buttons.ok',
        'menu.start',
        'game.score',
        'settings.language'
      ];
      
      for (const key of testKeys) {
        const translation = localizationManager.t(key);
        
        expect(translation).toBeTruthy();
        expect(typeof translation).toBe('string');
        expect(translation.trim()).not.toBe('');
        expect(translation).not.toContain('{{');
        expect(translation).not.toContain('[Missing:');
      }
    });

    test('パラメータ付き翻訳が正しく処理される', async () => {
      const translation = localizationManager.t('common.messages.welcome', { 
        name: 'テストユーザー' 
      });
      
      expect(translation).toBeTruthy();
      expect(translation).toContain('テストユーザー');
      expect(translation).not.toContain('{{name}}');
    });

    test('複数形翻訳が適切に機能する', async () => {
      // 日本語（複数形の概念が少ない）
      await localizationManager.setLanguage('ja');
      let translation = localizationManager.tPlural('common.items', 1);
      expect(translation).toBeTruthy();
      
      // 英語（複数形の概念がある）
      await localizationManager.setLanguage('en');
      const singular = localizationManager.tPlural('common.items', 1);
      const plural = localizationManager.tPlural('common.items', 2);
      
      expect(singular).toBeTruthy();
      expect(plural).toBeTruthy();
      
      // 単数形と複数形で異なることを確認（英語の場合）
      if (singular.includes('item') && plural.includes('item')) {
        // 基本的な複数形チェック
        expect(singular !== plural || singular.includes('1')).toBe(true);
      }
    });

    test('長いテキストが適切に処理される', async () => {
      const longTextKeys = [
        'help.gameRules',
        'help.bubbleTypes',
        'errors.connectionFailure'
      ];
      
      for (const key of longTextKeys) {
        const translation = localizationManager.t(key);
        
        if (translation && translation.length > 100) {
          // 長いテキストでも適切に改行やフォーマットがされている
          expect(translation).not.toMatch(/(.{200,})/); // 200文字以上の連続は避ける
        }
      }
    });
  });

  describe('レスポンス時間テスト', () => {
    test('翻訳取得が10ms以内に完了する（キャッシュ有効時）', async () => {
      const key = 'common.buttons.ok';
      
      // 初回読み込み（キャッシュなし）
      await localizationManager.t(key);
      
      // キャッシュされた翻訳の取得時間を測定
      const startTime = performance.now();
      const translation = localizationManager.t(key);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(10);
      expect(translation).toBeTruthy();
    });

    test('大量の翻訳取得がパフォーマンス基準を満たす', async () => {
      const keys: any[] = [];
      for (let i = 0; i < 100; i++) {
        keys.push('common.buttons.ok');
        keys.push('menu.start');
        keys.push('game.score');
      }
      
      const startTime = performance.now();
      
      const translations = keys.map(key => localizationManager.t(key));
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(100); // 100ms以内
      expect(translations.every(t => t && t.length > 0)).toBe(true);
    });

    test('メモリ使用量が適切な範囲内である', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 大量の翻訳を取得
      for (let i = 0; i < 1000; i++) {
        localizationManager.t('common.buttons.ok');
        localizationManager.t('menu.start', { param: `test${i}` });
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // メモリ使用量の増加が5MB以下であることを確認
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('ユーザー体験品質テスト', () => {
    test('言語設定が永続化される', async () => {
      await localizationManager.setLanguage('en');
      
      // ローカルストレージに保存されることを確認
      const savedLanguage = localStorage.getItem('bubblePop_language');
      expect(savedLanguage).toBe('en');
      
      // 新しいインスタンスでも設定が復元される
      const { LocalizationManager } = await import('../../src/core/LocalizationManager.js');
      const newInstance = new LocalizationManager();
      await newInstance.initialize();
      
      expect(newInstance.getCurrentLanguage()).toBe('en');
    });

    test('エラー状況での適切なフォールバック', async () => {
      // ネットワークエラーをシミュレート
      const originalFetch = global.fetch;
      (global as any).fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      
      try {
        await localizationManager.setLanguage('zh-CN');
        
        // エラーが発生してもアプリが動作し続ける
        const translation = localizationManager.t('common.buttons.ok');
        expect(translation).toBeTruthy();
        
      } finally {
        (global as any).fetch = originalFetch;
      }
    });

    test('アクセシビリティ対応の確認', async () => {
      // 言語属性が正しく設定される
      await localizationManager.setLanguage('en');
      
      // HTML lang属性が更新されることを確認
      if (document.documentElement) {
        expect(document.documentElement.lang).toBe('en');
      }
      
      // ARIAラベルが多言語対応されている
      const ariaLabel = localizationManager.t('common.accessibility.menuButton');
      expect(ariaLabel).toBeTruthy();
    });

    test('右から左（RTL）言語の準備確認', async () => {
      // RTL言語検出機能の確認
      const isRTL = localizationManager.isRTLLanguage('ar');
      expect(typeof isRTL).toBe('boolean');
      
      // 現在サポートしている言語はすべてLTR
      const supportedLanguages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
      for (const lang of supportedLanguages) {
        expect(localizationManager.isRTLLanguage(lang).toBe(false));
      }
    });
  });

  describe('ブラウザ互換性テスト', () => {
    test('LocalStorageが利用できない環境でのフォールバック', () => {
      // LocalStorageを一時的に無効化
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;
      
      try {
        import { LocalizationManager  } from '../../src/core/LocalizationManager.js';
        const manager = new LocalizationManager();
        
        // エラーが発生せずにインスタンスが作成される
        expect(manager).toBeTruthy();
        expect(manager.getCurrentLanguage()).toBeTruthy();
        
      } finally {
        (global as any).localStorage = originalLocalStorage;
      }
    });

    test('古いブラウザでの基本機能動作', () => {
      // ES6機能のポリフィル確認
      expect(typeof Map).toBe('function');
      expect(typeof Set).toBe('function');
      expect(typeof Promise).toBe('function');
      
      // Fetch APIのフォールバック確認
      expect(typeof global.fetch).toBe('function');
    });
  });
});

/**
 * ユーザビリティメトリクス収集
 */
export class UsabilityMetricsCollector {
  constructor() {
    this.metrics = {
      languageSwitchTimes: [],
      translationLoadTimes: [],
      memoryUsage: [],
      errorCounts: {
        translation: 0,
        loading: 0,
        network: 0
      }
    };
  }

  recordLanguageSwitchTime(time: any10040 {
    this.metrics.languageSwitchTimes.push(time);
  }

  recordTranslationLoadTime(time: any10137 {
    this.metrics.translationLoadTimes.push(time);
  }

  recordMemoryUsage(usage: any10227 {
    this.metrics.memoryUsage.push(usage);
  }

  recordError(type: any10304 {
    if (this.metrics.errorCounts[type] !== undefined) {
      this.metrics.errorCounts[type]++;
    }
  }

  generateReport() {
    const avgSwitchTime = this.metrics.languageSwitchTimes.length > 0 
      ? this.metrics.languageSwitchTimes.reduce((a, b) => a + b, 0) / this.metrics.languageSwitchTimes.length 
      : 0;

    const avgLoadTime = this.metrics.translationLoadTimes.length > 0 
      ? this.metrics.translationLoadTimes.reduce((a, b) => a + b, 0) / this.metrics.translationLoadTimes.length 
      : 0;

    return {
      timestamp: new Date().toISOString(),
      performance: {
        averageLanguageSwitchTime: avgSwitchTime,
        averageTranslationLoadTime: avgLoadTime,
        maxMemoryUsage: Math.max(...this.metrics.memoryUsage, 0),
        meetsSwitchTimeRequirement: avgSwitchTime < 500,
        meetsLoadTimeRequirement: avgLoadTime < 200
      },
      reliability: {
        totalErrors: Object.values(this.metrics.errorCounts).reduce((a, b) => a + b, 0),
        errorsByType: this.metrics.errorCounts,
        errorRate: this.metrics.languageSwitchTimes.length > 0 
          ? Object.values(this.metrics.errorCounts).reduce((a, b) => a + b, 0) / this.metrics.languageSwitchTimes.length 
          : 0
      },
      recommendations: this.generateRecommendations(avgSwitchTime, avgLoadTime)
    };
  }

  generateRecommendations(avgSwitchTime, avgLoadTime) {
    const recommendations: any[] = [];

    if (avgSwitchTime > 500) {
      recommendations.push('言語切り替え処理の最適化を検討してください');
    }

    if (avgLoadTime > 200) {
      recommendations.push('翻訳ファイルの読み込み処理の最適化を検討してください');
    }

    const totalErrors = Object.values(this.metrics.errorCounts).reduce((a, b) => a + b, 0);
    if (totalErrors > 0) {
      recommendations.push('エラーハンドリングの改善を検討してください');
    }

    if (recommendations.length === 0) {
      recommendations.push('ユーザビリティ要件を満たしています');
    }

    return recommendations;
  }
}

export default UsabilityMetricsCollector;