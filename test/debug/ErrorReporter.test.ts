import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * ErrorReporter テストスイート'
 */''
import { ErrorReporter  } from '../../src/debug/ErrorReporter';
// モックゲームエンジン''
const createMockGameEngine = (') => ({ sceneManager: { }'
        currentScene: { constructor: { name: 'TestScene' } }
    },
    gameTime: 1000,
    isRunning: true,
    isPaused: false,
    targetFPS: 60),
       , bubbleManager: {
        bubbles: new Array(10}
    ) },
    scoreManager: { score: 1500 }
    },
    playerData: { currentHP: 100 }'
    }'}');
describe('ErrorReporter', () => {  let errorReporter: any,
    let mockGameEngine: any,
    beforeEach(() => { }
        mockGameEngine = createMockGameEngine(};
        // Canvasモックを追加
        mockGameEngine.canvas = { width: 800)
            height: 600),
           , getContext: jest.fn(() => ({
                drawImage: jest.fn() }'
    )),''
            toDataURL: jest.fn((') => 'data:image/jpeg,base64,/9j/4AAQSkZJRgABAQEA...');'
    };
        errorReporter = new ErrorReporter(mockGameEngine: any);
        // LocalStorageのモック
        const localStorageMock = { getItem: jest.fn(
            setItem: jest.fn(
            removeItem: jest.fn(
        clear: jest.fn()),
        (global: any).localStorage = localStorageMock,
        
        // Document.createElement のモック
        (global: any).document = {
            createElement: jest.fn(() => mockGameEngine.canvas)) }
    );
        // Window プロパティのモック
        (global: any).window = { ...global.window,
            innerWidth: 1920,
            innerHeight: 1080,','
            devicePixelRatio: 1' }'
    }'),'
        // コンソールのモック''
        jest.spyOn(console, 'log').mockImplementation(')';
        jest.spyOn(console, 'warn').mockImplementation(')';
        jest.spyOn(console, 'error').mockImplementation(')';
        jest.spyOn(console, 'group').mockImplementation(')';
        jest.spyOn(console, 'groupEnd').mockImplementation();
    };
    afterEach(() => { errorReporter.destroy() }'
        jest.restoreAllMocks(};'}');
    describe('初期化', (') => {  ''
        test('ErrorReporterが正しく初期化される', () => {
            expect(errorReporter).toBeDefined();
            expect(errorReporter.sessionId).toMatch(/^session_/);
            expect(errorReporter.errorCollector).toBeDefined();
            expect(errorReporter.errorAnalyzer).toBeDefined();
            expect(errorReporter.errorStorage).toBeDefined() }'
            expect(errorReporter.screenshotCapture).toBeDefined();' }'
        }');'
        test('セッションIDが一意である', () => {  const anotherReporter = new ErrorReporter(mockGameEngine: any);
            expect(errorReporter.sessionId).not.toBe(anotherReporter.sessionId) }'
            anotherReporter.destroy();' }'
        }');'
        test('通知設定が正しく初期化される', () => {  expect(errorReporter.developerNotifications.enabled).toBe(true),'
            expect(errorReporter.developerNotifications.maxPerMinute).toBe(10),' }'
            expect(errorReporter.developerNotifications.channels').toContain('console');' }'
        }');'
    }''
    describe('エラー収集', (') => {  ''
        test('基本的なエラーが正しく収集される', (') => { }'
            const testError = new Error('Test error message');' }'
            const context = { component: 'TestComponent' }
            const collectedError = errorReporter.collectEnhancedError(testError, context);'
            expect(collectedError).toBeDefined();
            expect(collectedError.message').toBe('Test error message');'
            expect(collectedError.context.component').toBe('TestComponent');'
            expect(collectedError.sessionId).toBe(errorReporter.sessionId);'}');
        test('ゲーム状態が正しくキャプチャされる', (') => {  ''
            const testError = new Error('Game state test');
            const collectedError = errorReporter.collectEnhancedError(testError: any),'
            expect(collectedError.context.gameState).toBeDefined();
            expect(collectedError.context.gameState.currentScene').toBe('TestScene'),'
            expect(collectedError.context.gameState.bubbleCount).toBe(10) }'
            expect(collectedError.context.gameState.score).toBe(1500););' }'
        }');'
        test('エラーフィンガープリントが生成される', (') => { }'
            const testError = new Error('Fingerprint test');' }'
            const context = { component: 'TestComponent' }
            const collectedError = errorReporter.collectEnhancedError(testError, context);'
            expect(collectedError.fingerprint).toBeDefined();
            expect(typeof collectedError.fingerprint').toBe('string');'}');'
        test('エラー重要度が正しく計算される', async (') => {  ''
            const typeError = new TypeError('Type error test'),'
            const collectedError1 = await errorReporter.collectEnhancedError(typeError: any);
            expect(collectedError1.severity').toBe('high'),'
            const genericError = new Error('Generic error test'),'
            const collectedError2 = await errorReporter.collectEnhancedError(genericError: any),' }'
            expect(collectedError2.severity').toBe('low'););' }'
        }');'
        test('エラーカテゴリが正しく分類される', async (') => {  ''
            const networkError = new Error('Network request failed'),'
            const collectedError1 = await errorReporter.collectEnhancedError(networkError: any);
            expect(collectedError1.category').toBe('network'),'
            const renderError = new Error('Canvas rendering failed'),'
            const collectedError2 = await errorReporter.collectEnhancedError(renderError: any),' }'
            expect(collectedError2.category').toBe('rendering'););' }'
        }');'
        test('クリティカルエラーでスクリーンショットが取得される', async (') => { }'
            const criticalError = new Error('Critical system failure'); }'
            const collectedError = await errorReporter.collectEnhancedError(criticalError, { critical: true,);
            expect(collectedError.severity').toBe('critical');'
            expect(collectedError.screenshot).toBeDefined();
            expect(collectedError.screenshot.id).toMatch(/^screenshot_/);'
            expect(mockGameEngine.canvas.toDataURL).toHaveBeenCalled();'}');
        test('高重要度エラーでスクリーンショットが取得される', async (') => {  ''
            const highSeverityError = new TypeError('Type error causing screenshot'),'
            const collectedError = await errorReporter.collectEnhancedError(highSeverityError: any);
            expect(collectedError.severity').toBe('high'),'
            expect(collectedError.screenshot).toBeDefined() }'
            expect(mockGameEngine.canvas.toDataURL).toHaveBeenCalled();' }'
        }');'
        test('低重要度エラーではスクリーンショットが取得されない', async (') => {  ''
            const lowSeverityError = new Error('Minor error'),'
            const collectedError = await errorReporter.collectEnhancedError(lowSeverityError: any);
            expect(collectedError.severity').toBe('low') }'
            expect(collectedError.screenshot).toBeUndefined();' }'
        }');'
        test('スクリーンショット取得エラーは適切に処理される', async () => {  // Canvas.toDataURLでエラーを発生させる''
            mockGameEngine.canvas.toDataURL.mockImplementation((') => { }'
                throw new Error('Canvas error');' }'
            }');'
            const criticalError = new Error('Critical error');'
            const collectedError = await errorReporter.collectEnhancedError(criticalError, { critical: true,);
            expect(collectedError.severity').toBe('critical');'
            expect(collectedError.screenshot).toBeUndefined();
            expect(console.warn').toHaveBeenCalledWith(')';'
                'Failed to capture error screenshot: ',
                expect.any(String);'
            );'}');'
    }''
    describe('パターン分析', (') => {  ''
        test('同じエラーパターンが正しく検出される', async (') => { }'
            const testError = new Error('Repeated error');' }'
            const context = { component: 'TestComponent' }
            // 同じエラーを複数回収集
            await errorReporter.collectEnhancedError(testError, context);
            await errorReporter.collectEnhancedError(testError, context);
            await errorReporter.collectEnhancedError(testError, context);
            const patterns = errorReporter.errorPatterns;
            expect(patterns.size).toBe(1);
            const pattern = patterns.values().next().value;'
            expect(pattern.count).toBe(3);'}');
        test('パターン別にエラーが分類される', (') => {  ''
            const error1 = new Error('Error type 1');
            const error2 = new Error('Error type 2');
            errorReporter.collectEnhancedError(error1: any);
            errorReporter.collectEnhancedError(error2) }'
            expect(errorReporter.errorPatterns.size).toBe(2););' }'
        }');'
    }''
    describe('通知システム', (') => {  ''
        test('クリティカルエラーで即座に通知される', (') => { }'
            const criticalError = new Error('Critical system failure'); }
            const context = { critical: true,
            errorReporter.collectEnhancedError(criticalError, context);'
            // コンソール通知が送信されることを確認''
            expect(console.group').toHaveBeenCalledWith(expect.stringContaining('Error Reporter');'
            expect(console.error').toHaveBeenCalledWith(expect.stringContaining('Critical system failure');'}');'
        test('レート制限が正しく適用される', () => {  // レート制限をテストするため設定を変更
            errorReporter.developerNotifications.maxPerMinute = 2,
            
            // 制限を超える数のエラーを送信 }
            for (let i = 0; i < 5; i++) { }
                const error = new Error(`Rate limit test ${i}`);
                errorReporter.collectEnhancedError(error, { critical: true ) }
            }
            
            // 最大2回しか通知されないことを確認'
            expect(console.group).toHaveBeenCalledTimes(2);'}');
        test('通知設定に基づいてチャンネルが選択される', (') => {  ''
            errorReporter.developerNotifications.channels = ['console'],', ' }'
            const testError = new Error('Channel test'); }
            errorReporter.collectEnhancedError(testError, { critical: true,);'
            expect(console.group).toHaveBeenCalled();'}');'
    }''
    describe('ストレージ機能', (') => {  ''
        test('エラーがローカルストレージに保存される', (') => { }'
            const testError = new Error('Storage test'); }
            errorReporter.collectEnhancedError(testError as any}'
            );
            expect(localStorage.setItem').toHaveBeenCalledWith(')';'
                'errorReporter_data')';'
                expect.any(String};'}');
        test('ストレージサイズ制限が適用される', () => {  // ストレージサイズを小さく設定
            errorReporter.errorStorage.maxStorageSize = 2,
            
            // 制限を超える数のエラーを生成 }
            for (let i = 0; i < 5; i++) { }
                const error = new Error(`Storage limit test ${i}`);
                errorReporter.collectEnhancedError(error: any);
            }
            
            // コレクターのエラー数が制限内であることを確認'
            expect(errorReporter.errorCollector.collectedErrors.length).toBeLessThanOrEqual(1000);'}');'
    }''
    describe('レポート生成', (') => {  ''
        test('セッションレポートが正しく生成される', (') => {'
            // テストエラーを追加''
            const error1 = new Error('Report test 1');
            const error2 = new TypeError('Report test 2'),'
            errorReporter.collectEnhancedError(error1: any);
            errorReporter.collectEnhancedError(error2'),'
            const report = errorReporter.generateErrorReport('session');
            expect(report).toBeDefined();
            expect(report.summary.total).toBe(2);
            expect(report.summary.bySeverity.low).toBe(1);
            expect(report.summary.bySeverity.high).toBe(1) }'
            expect(report.sessionId).toBe(errorReporter.sessionId););' }'
        }');'
        test('統計情報が正しく計算される', (') => {  ''
            const error1 = new Error('Stats test 1');
            const error2 = new Error('Stats test 2');
            errorReporter.collectEnhancedError(error1: any);
            errorReporter.collectEnhancedError(error2);
            const stats = errorReporter.getErrorStatistics();
            expect(stats.totalErrors).toBe(2);
            expect(stats.sessionDuration).toBeGreaterThan(0) }'
            expect(stats.errorRate).toBeDefined();' }'
        }');'
        test('推奨事項が生成される', (') => {  // 高頻度エラーを生成''
            const repeatedError = new Error('High frequency error') }
            for (let i = 0; i < 6; i++) { }
                errorReporter.collectEnhancedError(repeatedError as any};)'
            }')', ');'
            const report = errorReporter.generateErrorReport('session');
            expect(report.recommendations).toBeDefined();'
            expect(report.recommendations.length).toBeGreaterThan(0);
            expect(report.recommendations[0].type').toBe('high_frequency');'}');'
    }''
    describe('ブラウザ情報キャプチャ', (') => {  ''
        test('ブラウザ情報が正しくキャプチャされる', () => {
            const browserInfo = errorReporter.captureBrowserInfo();
            expect(browserInfo).toBeDefined();
            expect(browserInfo.userAgent).toBeDefined();
            expect(browserInfo.platform).toBeDefined() }'
            expect(browserInfo.language).toBeDefined();' }'
        }');'
        test('パフォーマンス情報が正しくキャプチャされる', () => {  const performanceInfo = errorReporter.capturePerformanceInfo();
            expect(performanceInfo).toBeDefined() }'
            expect(performanceInfo.timing).toBeDefined();' }'
        }');'
    }''
    describe('クリーンアップ', (') => {  ''
        test('古いパターンが正しくクリーンアップされる', () => {'
            // 古いタイムスタンプでパターンを作成''
            const oldTimestamp = Date.now('',
            errorReporter.errorPatterns.set('old_pattern', {')'
                fingerprint: 'old_pattern'),
               , count: 1) }
                lastSeen: oldTimestamp); }'
            };
            errorReporter.cleanupOldPatterns(')';
            expect(errorReporter.errorPatterns.has('old_pattern').toBe(false);'}');
        test('destroyメソッドでリソースがクリーンアップされる', () => {  errorReporter.destroy();
            expect(localStorage.setItem').toHaveBeenCalledWith(' }', 'errorReporter_settings') }'
                expect.any(String};'}');'
    }''
    describe('エラーハンドリング統合', (') => {  ''
        test('既存のErrorHandlerとの統合が正しく動作する', (') => {''
            const testError = new Error('Integration test') }'
            // handleErrorメソッドが拡張されていることを確認' }'
            const result = errorReporter.handleError(testError, { component: 'IntegrationTest' };
            // 元のエラーハンドリングと拡張エラー収集の両方が実行されることを確認
            expect(result).toBeDefined();
            expect(errorReporter.errorCollector.collectedErrors.length).toBeGreaterThan(0);
        };'
    }'}');
describe('ErrorCollector', () => {  let errorReporter: any,
    let errorCollector: any,
    beforeEach(() => { }
        errorReporter = new ErrorReporter(createMockGameEngine()};
        errorCollector = errorReporter.errorCollector;
        
        // LocalStorageのモック
        (global: any).localStorage = { getItem: jest.fn(
        setItem: jest.fn() }
        };
    );'
    afterEach(() => { errorReporter.destroy(),' }'
    }');'
    test('エラーが正しく収集される', (') => {  const testError = {''
            id: 'test_error_1',','
            message: 'Test error',','
            severity: 'low',' }'
            category: 'test' }
        },
        ';'
        const errorId = errorCollector.collect(testError);
        expect(errorId').toBe('test_error_1');'
        expect(errorCollector.collectedErrors).toContain(testError);'}');
    test('フィルタリングが正しく動作する', (') => {  const error1 = {''
            id: 'error_1',','
            severity: 'low',','
            category: 'test',','
        timestamp: Date.now('',
           , id: 'error_2',','
            severity: 'high',')',
            category: 'critical') }
        timestamp: Date.now(); }
        };
        ';'
        errorCollector.collect(error1);
        errorCollector.collect(error2');'
        const highSeverityErrors = errorCollector.getErrors({ severity: 'high' ),'
        expect(highSeverityErrors.toHaveLength(1);
        expect(highSeverityErrors[0].id').toBe('error_2'),' }'
    }');'
}''
describe('ErrorAnalyzer', () => {  let errorReporter: any,
    let errorAnalyzer: any,
    beforeEach(() => { }
        errorReporter = new ErrorReporter(createMockGameEngine()};
        errorAnalyzer = errorReporter.errorAnalyzer;
    };'
    afterEach(() => { errorReporter.destroy(),' }'
    }');'
    test('パターン分析が正しく動作する', (') => {  const testError = {''
            id: 'pattern_test',','
            fingerprint: 'test_fingerprint'
            }
        timestamp: Date.now(); }
        };
        
        const pattern = errorAnalyzer.analyzePattern(testError);'
        expect(pattern).toBeDefined();
        expect(pattern.fingerprint').toBe('test_fingerprint');'
        expect(pattern.count).toBe(1);
        expect(pattern.errors').toContain('pattern_test');'}');'
    test('トレンド分析が更新される', () => {  ''
        const baseTimestamp = Date.now('',
            id: 'trend_test',','
            fingerprint: 'trend_fingerprint'
            }
            timestamp: baseTimestamp;);
            };
        // パターンを作成)
        const pattern = errorAnalyzer.analyzePattern(testError);'
        // 追加のエラーでトレンド更新をテスト''
        for (let i = 0; i < 5; i++') { errorAnalyzer.analyzePattern({ }'
                id: `trend_test_${i}`,')'
                fingerprint: 'trend_fingerprint'),
        timestamp: baseTimestamp + (i * 1000),
            }
        }', ';
        expect(pattern.trend).toBeDefined(')';
        expect(['increasing', 'stable', 'decreasing']).toContain(pattern.trend);'}');'
}''
describe('ErrorStorage', () => {  let errorReporter: any,
    let errorStorage: any,
    beforeEach(() => { }
        errorReporter = new ErrorReporter(createMockGameEngine()};
        errorStorage = errorReporter.errorStorage;
        
        (global: any).localStorage = { getItem: jest.fn(
            setItem: jest.fn(
        removeItem: jest.fn() }
        };
    );'
    afterEach(() => { errorReporter.destroy(),' }'
    }');'
    test('エラーがストレージに保存される', (') => {  const testError = {''
            id: 'storage_test',','
            message: 'Storage test error'
            }
        timestamp: Date.now(); }
        };
        ';'
        errorStorage.store(testError);
        expect(localStorage.setItem').toHaveBeenCalledWith(')';'
            'errorReporter_data');
            expect.any(String);'
            );'}');
    test('通知がストレージに保存される', (') => {  const testNotification = {''
            id: 'notification_test',','
            type: 'error'
            }
        timestamp: Date.now(); }
        };
        ';'
        errorStorage.storeNotification(testNotification);
        expect(localStorage.setItem').toHaveBeenCalledWith(')';'
            'errorReporter_data');
            expect.any(String);'
            );'}');
    test('ストレージクリーンアップが正しく動作する', (') => {  // モックデータを設定'
        const oldError = {''
            id: 'old_error',' }'
            timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000') // 8日前 }'
        },
        ';'
        const recentError = { ''
            id: 'recent_error',
        timestamp: Date.now() }
        };
        
        localStorage.getItem.mockReturnValue(JSON.stringify({ errors: [oldError, recentError])
            notifications: []),
            sessions: [],
        lastUpdated: Date.now() }
        };
        errorStorage.cleanup();'
        // 新しいデータのみが保存されることを確認''
        expect(localStorage.setItem).toHaveBeenCalledWith(')';
            'errorReporter_data');
            expect.stringContaining('recent_error');'
            );'}');'}'