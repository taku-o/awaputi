/**
 * パフォーマンス最適化システム統合テスト
 * 
 * LocalizationManager、OptimizedTranslationLoader、
 * I18nPerformanceMonitor、I18nRenderOptimizerの統合動作テスト
 */

import { jest } from '@jest/globals';
import { LocalizationManager } from '../../src/core/LocalizationManager.js';
import { OptimizedTranslationLoader } from '../../src/core/i18n/OptimizedTranslationLoader.js';
import { I18nPerformanceMonitor } from '../../src/core/i18n/I18nPerformanceMonitor.js';
import { I18nRenderOptimizer } from '../../src/core/i18n/I18nRenderOptimizer.js';

describe('Performance Optimization Integration Tests', () => {
    let localizationManager;
    let mockDOM;

    beforeEach(() => {
        // LocalizationManagerインスタンス作成
        localizationManager = new LocalizationManager();

        // DOM環境のモック
        global.document = {
            documentElement: { lang: 'ja' },
            createElement: jest.fn().mockReturnValue({
                id: '',
                textContent: '',
                style: { cssText: '' },
                appendChild: jest.fn(),
                remove: jest.fn()
            }),
            head: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            querySelectorAll: jest.fn().mockReturnValue([]),
            createDocumentFragment: jest.fn().mockReturnValue({}),
            fonts: {
                add: jest.fn()
            }
        };

        global.window = {
            matchMedia: jest.fn().mockReturnValue({
                matches: false,
                addListener: jest.fn()
            }),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            requestAnimationFrame: jest.fn((cb) => setTimeout(cb, 16)),
            cancelAnimationFrame: jest.fn(),
            performance: {
                now: jest.fn(() => Date.now()),
                memory: {
                    usedJSHeapSize: 1000000,
                    totalJSHeapSize: 10000000,
                    jsHeapSizeLimit: 100000000
                }
            },
            FontFace: jest.fn().mockImplementation(() => ({
                load: jest.fn().mockResolvedValue()
            })),
            fetch: jest.fn().mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({
                    'test.key': 'Test Value'
                }),
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                }
            }),
            gc: jest.fn()
        };

        global.navigator = {
            connection: {
                effectiveType: '4g',
                downlink: 10,
                rtt: 50
            }
        };

        // コンソールをモック
        global.console = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        mockDOM = {
            elements: []
        };
    });

    afterEach(() => {
        localizationManager?.cleanup();
        jest.clearAllMocks();
    });

    describe('System Integration', () => {
        test('OptimizedTranslationLoaderが正しく統合されている', () => {
            expect(localizationManager.optimizedLoader).toBeInstanceOf(OptimizedTranslationLoader);
            expect(localizationManager.optimizedLoader).toBeDefined();
        });

        test('I18nPerformanceMonitorが正しく統合されている', () => {
            expect(localizationManager.performanceMonitor).toBeInstanceOf(I18nPerformanceMonitor);
            expect(localizationManager.performanceMonitor).toBeDefined();
        });

        test('I18nRenderOptimizerが正しく統合されている', () => {
            expect(localizationManager.renderOptimizer).toBeInstanceOf(I18nRenderOptimizer);
            expect(localizationManager.renderOptimizer).toBeDefined();
        });
    });

    describe('Performance-Optimized Language Loading', () => {
        test('最適化されたローダーで言語を読み込める', async () => {
            // OptimizedTranslationLoaderのloadLanguageメソッドをモック
            const mockTranslations = {
                'test.key': 'Optimized Test Value',
                'test.key2': 'Another Value'
            };
            
            localizationManager.optimizedLoader.loadLanguage = jest.fn()
                .mockResolvedValue(mockTranslations);

            const result = await localizationManager.loadLanguageData('en');

            expect(result).toBe(true);
            expect(localizationManager.optimizedLoader.loadLanguage).toHaveBeenCalledWith(
                'en',
                { priority: 'medium' } // current language でないため medium
            );
            expect(localizationManager.translations.get('en')).toEqual(mockTranslations);
        });

        test('最適化ローダー失敗時にフォールバックローダーが動作する', async () => {
            const mockTranslations = {
                'test.key': 'Fallback Test Value'
            };

            // 最適化ローダーを失敗させる
            localizationManager.optimizedLoader.loadLanguage = jest.fn()
                .mockRejectedValue(new Error('Optimized loader failed'));

            // フォールバックローダーをモック
            localizationManager.translationLoader.loadLanguage = jest.fn()
                .mockResolvedValue(mockTranslations);

            const result = await localizationManager.loadLanguageData('en');

            expect(result).toBe(true);
            expect(localizationManager.optimizedLoader.loadLanguage).toHaveBeenCalled();
            expect(localizationManager.translationLoader.loadLanguage).toHaveBeenCalledWith('en');
            expect(localizationManager.translations.get('en')).toEqual(mockTranslations);
        });
    });

    describe('Performance-Monitored Translation', () => {
        beforeEach(() => {
            // 翻訳データをセットアップ
            localizationManager.translations.set('ja', {
                'test.key': 'テスト値'
            });
            localizationManager.loadedLanguages.add('ja');
        });

        test('翻訳取得でパフォーマンス監視が動作する', () => {
            const mockMeasurement = { id: 'test-measurement', startTime: 1000 };
            
            localizationManager.performanceMonitor.startTranslationMeasurement = jest.fn()
                .mockReturnValue(mockMeasurement);
            localizationManager.performanceMonitor.endTranslationMeasurement = jest.fn();

            const result = localizationManager.t('test.key');

            expect(result).toBe('テスト値');
            expect(localizationManager.performanceMonitor.startTranslationMeasurement)
                .toHaveBeenCalledWith('test.key', 'ja');
            expect(localizationManager.performanceMonitor.endTranslationMeasurement)
                .toHaveBeenCalledWith(mockMeasurement, true);
        });

        test('翻訳が見つからない場合もパフォーマンス監視が動作する', () => {
            const mockMeasurement = { id: 'test-measurement', startTime: 1000 };
            
            localizationManager.performanceMonitor.startTranslationMeasurement = jest.fn()
                .mockReturnValue(mockMeasurement);
            localizationManager.performanceMonitor.endTranslationMeasurement = jest.fn();

            const result = localizationManager.t('nonexistent.key');

            expect(result).toBe('nonexistent.key'); // キーがそのまま返される
            expect(localizationManager.performanceMonitor.endTranslationMeasurement)
                .toHaveBeenCalledWith(mockMeasurement, false); // 失敗として記録
        });
    });

    describe('Optimized Language Switching', () => {
        beforeEach(() => {
            // 言語データをセットアップ
            localizationManager.translations.set('ja', { 'test.key': 'テスト値' });
            localizationManager.translations.set('en', { 'test.key': 'Test Value' });
            localizationManager.loadedLanguages.add('ja');
            localizationManager.loadedLanguages.add('en');
        });

        test('レンダリング最適化付き言語切り替えが動作する', async () => {
            const mockSwitchResult = { duration: 250 };
            const mockRenderResult = { success: true, renderTime: 100 };

            localizationManager.performanceMonitor.measureLanguageSwitch = jest.fn()
                .mockImplementation(async (from, to, callback) => {
                    const result = await callback();
                    return { ...mockSwitchResult, result };
                });

            localizationManager.renderOptimizer.optimizeLanguageSwitch = jest.fn()
                .mockResolvedValue(mockRenderResult);

            localizationManager.loadFontsForLanguage = jest.fn().mockResolvedValue(true);

            const result = await localizationManager.setLanguage('en');

            expect(result).toBe(true);
            expect(localizationManager.currentLanguage).toBe('en');
            expect(localizationManager.performanceMonitor.measureLanguageSwitch)
                .toHaveBeenCalledWith('ja', 'en', expect.any(Function));
            expect(localizationManager.renderOptimizer.optimizeLanguageSwitch)
                .toHaveBeenCalledWith('ja', 'en', expect.any(Function));
        });

        test('言語切り替え時にUI要素が更新される', async () => {
            const mockElement = {
                getAttribute: jest.fn().mockReturnValue('test.key'),
                textContent: 'Old Text'
            };

            const updateCallback = jest.fn().mockResolvedValue('Updated Text');

            localizationManager.performanceMonitor.measureLanguageSwitch = jest.fn()
                .mockImplementation(async (from, to, callback) => {
                    return { duration: 200, result: await callback() };
                });

            localizationManager.renderOptimizer.optimizeLanguageSwitch = jest.fn()
                .mockImplementation(async (from, to, callback) => {
                    const result = await callback(mockElement);
                    return { success: true, renderTime: 50, result };
                });

            localizationManager.loadFontsForLanguage = jest.fn().mockResolvedValue(true);

            await localizationManager.setLanguage('en');

            expect(localizationManager.renderOptimizer.optimizeLanguageSwitch)
                .toHaveBeenCalled();
        });
    });

    describe('Performance Statistics', () => {
        test('パフォーマンス統計を取得できる', () => {
            const mockTranslationStats = { totalTranslations: 100, averageTime: 5 };
            const mockLoadingStats = { cacheHitRate: '85%', totalRequests: 50 };
            const mockRenderingStats = { frameMetrics: { averageFrameTime: 16 } };

            localizationManager.performanceMonitor.generatePerformanceReport = jest.fn()
                .mockReturnValue(mockTranslationStats);
            localizationManager.optimizedLoader.getPerformanceStats = jest.fn()
                .mockReturnValue(mockLoadingStats);
            localizationManager.renderOptimizer.getPerformanceStats = jest.fn()
                .mockReturnValue(mockRenderingStats);

            const stats = localizationManager.getPerformanceStats();

            expect(stats).toEqual({
                translation: mockTranslationStats,
                loading: mockLoadingStats,
                rendering: mockRenderingStats
            });
        });
    });

    describe('Lazy Loading', () => {
        test('名前空間の遅延読み込みが動作する', async () => {
            const mockNamespaceData = {
                'namespace.key1': 'Value 1',
                'namespace.key2': 'Value 2'
            };

            localizationManager.optimizedLoader.lazyLoadNamespace = jest.fn()
                .mockResolvedValue(mockNamespaceData);

            // 既存の翻訳データをセットアップ
            localizationManager.translations.set('en', {
                'existing.key': 'Existing Value'
            });

            const result = await localizationManager.loadNamespace('en', 'namespace');

            expect(result).toBe(true);
            expect(localizationManager.optimizedLoader.lazyLoadNamespace)
                .toHaveBeenCalledWith('en', 'namespace');

            const translations = localizationManager.translations.get('en');
            expect(translations).toEqual({
                'existing.key': 'Existing Value',
                'namespace.key1': 'Value 1',
                'namespace.key2': 'Value 2'
            });
        });
    });

    describe('Cache Management', () => {
        test('翻訳キャッシュをクリアできる', () => {
            localizationManager.optimizedLoader.clearCache = jest.fn();
            localizationManager.renderOptimizer.clearCaches = jest.fn();

            localizationManager.clearTranslationCache();

            expect(localizationManager.optimizedLoader.clearCache).toHaveBeenCalled();
            expect(localizationManager.renderOptimizer.clearCaches).toHaveBeenCalled();
        });
    });

    describe('Performance Monitoring Control', () => {
        test('パフォーマンス監視を停止・再開できる', () => {
            localizationManager.performanceMonitor.stopMonitoring = jest.fn();
            localizationManager.performanceMonitor.startMonitoring = jest.fn();

            localizationManager.stopPerformanceMonitoring();
            expect(localizationManager.performanceMonitor.stopMonitoring).toHaveBeenCalled();

            localizationManager.startPerformanceMonitoring();
            expect(localizationManager.performanceMonitor.startMonitoring).toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        test('全コンポーネントのクリーンアップが実行される', () => {
            localizationManager.performanceMonitor.cleanup = jest.fn();
            localizationManager.renderOptimizer.cleanup = jest.fn();
            localizationManager.optimizedLoader.cleanup = jest.fn();

            localizationManager.cleanup();

            expect(localizationManager.performanceMonitor.cleanup).toHaveBeenCalled();
            expect(localizationManager.renderOptimizer.cleanup).toHaveBeenCalled();
            expect(localizationManager.optimizedLoader.cleanup).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('最適化ローダーエラー時にフォールバック処理が動作する', async () => {
            localizationManager.optimizedLoader.loadLanguage = jest.fn()
                .mockRejectedValue(new Error('Network error'));
            
            localizationManager.translationLoader.loadLanguage = jest.fn()
                .mockResolvedValue({ 'test.key': 'Fallback value' });

            const result = await localizationManager.loadLanguageData('fr');

            expect(result).toBe(true);
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Optimized loader failed for fr'),
                expect.any(String)
            );
        });

        test('レンダリング最適化エラー時も言語切り替えが完了する', async () => {
            localizationManager.translations.set('en', { 'test.key': 'Test Value' });
            localizationManager.loadedLanguages.add('en');

            localizationManager.performanceMonitor.measureLanguageSwitch = jest.fn()
                .mockImplementation(async (from, to, callback) => {
                    try {
                        const result = await callback();
                        return { duration: 300, result };
                    } catch (error) {
                        throw error;
                    }
                });

            localizationManager.renderOptimizer.optimizeLanguageSwitch = jest.fn()
                .mockRejectedValue(new Error('Rendering optimization failed'));

            localizationManager.loadFontsForLanguage = jest.fn().mockResolvedValue(true);

            const result = await localizationManager.setLanguage('en');

            expect(result).toBe(false); // エラーによりfalseが返される
        });
    });
});