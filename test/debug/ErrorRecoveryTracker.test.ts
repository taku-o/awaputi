import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';

/**
 * ErrorRecoveryTracker テストスイート
 */
import { ErrorRecoveryTracker } from '../../src/debug/ErrorRecoveryTracker';

// モックGameEngine
const createMockGameEngine = () => ({
    canvas: {
        width: 800,
        height: 600,
        getContext: jest.fn(() => ({
            save: jest.fn(),
            restore: jest.fn(),
            setTransform: jest.fn(),
            clearRect: jest.fn()
        }))
    },
    cacheSystem: {
        clearCache: jest.fn()
    },
    objectPool: { cleanup: jest.fn() },
    particleManager: {
        cleanup: jest.fn(),
        disable: jest.fn()
    },
    audioManager: {
        stop: jest.fn().mockResolvedValue(),
        initialize: jest.fn().mockResolvedValue(),
        mute: jest.fn()
    },
    sceneManager: {
        currentScene: { constructor: { name: 'TestScene' } },
        reloadCurrentScene: jest.fn().mockResolvedValue()
    },
    effectManager: { disable: jest.fn() },
    renderOptimizer: { reset: jest.fn() },
    playerData: { enableFallbackMode: jest.fn() },
    settingsManager: { enableFallbackMode: jest.fn() },
    enableSafeMode: jest.fn(),
    bubbleManager: { restart: jest.fn().mockResolvedValue() }
});

// モックErrorReporter
const createMockErrorReporter = () => ({
    sessionStartTime: Date.now(),
    gameEngine: createMockGameEngine()
});

describe('ErrorRecoveryTracker', () => {
    let recoveryTracker: any;
    let mockErrorReporter: any;
    
    beforeEach(() => {
        mockErrorReporter = createMockErrorReporter();
        recoveryTracker = new ErrorRecoveryTracker(mockErrorReporter as any);
        
        // コンソールのモック
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        if (recoveryTracker) {
            recoveryTracker.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('初期化', () => {
        test('デフォルト設定で初期化される', () => {
            expect(recoveryTracker.isEnabled).toBe(true);
            expect(recoveryTracker.maxRetryAttempts).toBe(3);
            expect(recoveryTracker.retryDelay).toBe(1000);
            expect(recoveryTracker.recoveryStrategies).toBeInstanceOf(Map);
            expect(recoveryTracker.activeRecoveries).toBeInstanceOf(Set);
        });

        test('回復戦略が登録される', () => {
            expect(recoveryTracker.recoveryStrategies.size).toBeGreaterThan(0);
            expect(recoveryTracker.recoveryStrategies.has('canvas-reset')).toBe(true);
            expect(recoveryTracker.recoveryStrategies.has('cache-clear')).toBe(true);
            expect(recoveryTracker.recoveryStrategies.has('scene-reload')).toBe(true);
        });
    });

    describe('trackError', () => {
        test('エラーを追跡する', () => {
            const error = new Error('Test error');
            const context = { operation: 'rendering' };

            const result = recoveryTracker.trackError(error, context);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.error).toBe(error);
            expect(result.context).toBe(context);
            expect(result.timestamp).toBeDefined();
            expect(result.attempts).toBe(0);
            expect(result.recovered).toBe(false);
        });

        test('同じエラーは重複追跡される', () => {
            const error1 = new Error('Same error');
            const error2 = new Error('Same error');

            const result1 = recoveryTracker.trackError(error1);
            const result2 = recoveryTracker.trackError(error2);

            expect(result1.id).not.toBe(result2.id);
        });

        test('無効化されている場合は追跡しない', () => {
            recoveryTracker.isEnabled = false;
            const error = new Error('Test error');

            const result = recoveryTracker.trackError(error);

            expect(result).toBeNull();
        });
    });

    describe('attemptRecovery', () => {
        test('キャンバスリセット戦略を実行', async () => {
            const error = new Error('Canvas error');
            const errorRecord = recoveryTracker.trackError(error);

            const result = await recoveryTracker.attemptRecovery(errorRecord.id, 'canvas-reset');

            expect(result).toBe(true);
            expect(mockErrorReporter.gameEngine.canvas.getContext).toHaveBeenCalled();
        });

        test('キャッシュクリア戦略を実行', async () => {
            const error = new Error('Cache error');
            const errorRecord = recoveryTracker.trackError(error);

            const result = await recoveryTracker.attemptRecovery(errorRecord.id, 'cache-clear');

            expect(result).toBe(true);
            expect(mockErrorReporter.gameEngine.cacheSystem.clearCache).toHaveBeenCalled();
        });

        test('シーンリロード戦略を実行', async () => {
            const error = new Error('Scene error');
            const errorRecord = recoveryTracker.trackError(error);

            const result = await recoveryTracker.attemptRecovery(errorRecord.id, 'scene-reload');

            expect(result).toBe(true);
            expect(mockErrorReporter.gameEngine.sceneManager.reloadCurrentScene).toHaveBeenCalled();
        });

        test('存在しないエラーIDの場合は失敗', async () => {
            const result = await recoveryTracker.attemptRecovery('nonexistent', 'canvas-reset');

            expect(result).toBe(false);
        });

        test('存在しない戦略の場合は失敗', async () => {
            const error = new Error('Test error');
            const errorRecord = recoveryTracker.trackError(error);

            const result = await recoveryTracker.attemptRecovery(errorRecord.id, 'nonexistent');

            expect(result).toBe(false);
        });

        test('回復試行回数を記録', async () => {
            const error = new Error('Test error');
            const errorRecord = recoveryTracker.trackError(error);

            await recoveryTracker.attemptRecovery(errorRecord.id, 'canvas-reset');

            expect(errorRecord.attempts).toBe(1);
            expect(errorRecord.lastAttemptTime).toBeDefined();
        });
    });

    describe('autoRecover', () => {
        test('自動回復を実行', async () => {
            const error = new Error('Auto recovery test');
            const errorRecord = recoveryTracker.trackError(error);

            const result = await recoveryTracker.autoRecover(errorRecord.id);

            expect(result).toBe(true);
            expect(errorRecord.recovered).toBe(true);
            expect(errorRecord.recoveryStrategy).toBeDefined();
        });

        test('すべての戦略が失敗した場合', async () => {
            // すべての戦略をエラーを投げるようにモック
            jest.spyOn(mockErrorReporter.gameEngine.canvas, 'getContext').mockImplementation(() => {
                throw new Error('Mock error');
            });
            jest.spyOn(mockErrorReporter.gameEngine.cacheSystem, 'clearCache').mockImplementation(() => {
                throw new Error('Mock error');
            });
            jest.spyOn(mockErrorReporter.gameEngine.sceneManager, 'reloadCurrentScene').mockRejectedValue(new Error('Mock error'));

            const error = new Error('Unrecoverable error');
            const errorRecord = recoveryTracker.trackError(error);

            const result = await recoveryTracker.autoRecover(errorRecord.id);

            expect(result).toBe(false);
            expect(errorRecord.recovered).toBe(false);
        });

        test('最大試行回数に達した場合は停止', async () => {
            recoveryTracker.maxRetryAttempts = 2;
            const error = new Error('Max attempts test');
            const errorRecord = recoveryTracker.trackError(error);

            // 手動で試行回数を設定
            errorRecord.attempts = 2;

            const result = await recoveryTracker.autoRecover(errorRecord.id);

            expect(result).toBe(false);
        });
    });

    describe('registerCustomStrategy', () => {
        test('カスタム戦略を登録', () => {
            const customStrategy = {
                name: 'custom-strategy',
                description: 'Custom recovery strategy',
                canRecover: jest.fn(() => true),
                recover: jest.fn(() => Promise.resolve())
            };

            const result = recoveryTracker.registerCustomStrategy('custom', customStrategy);

            expect(result).toBe(true);
            expect(recoveryTracker.recoveryStrategies.has('custom')).toBe(true);
        });

        test('重複した戦略名では登録失敗', () => {
            const strategy1 = { name: 'duplicate', canRecover: jest.fn(), recover: jest.fn() };
            const strategy2 = { name: 'duplicate-2', canRecover: jest.fn(), recover: jest.fn() };

            recoveryTracker.registerCustomStrategy('duplicate', strategy1);
            const result = recoveryTracker.registerCustomStrategy('duplicate', strategy2);

            expect(result).toBe(false);
        });
    });

    describe('getErrorHistory', () => {
        test('エラー履歴を取得', () => {
            const error1 = new Error('Error 1');
            const error2 = new Error('Error 2');

            recoveryTracker.trackError(error1);
            recoveryTracker.trackError(error2);

            const history = recoveryTracker.getErrorHistory();

            expect(history).toHaveLength(2);
            expect(history[0].error.message).toBe('Error 1');
            expect(history[1].error.message).toBe('Error 2');
        });

        test('回復済みエラーをフィルタリング', () => {
            const error1 = new Error('Error 1');
            const error2 = new Error('Error 2');

            const record1 = recoveryTracker.trackError(error1);
            const record2 = recoveryTracker.trackError(error2);
            record1.recovered = true;

            const activeHistory = recoveryTracker.getErrorHistory({ includeRecovered: false });

            expect(activeHistory).toHaveLength(1);
            expect(activeHistory[0].error.message).toBe('Error 2');
        });
    });

    describe('getStatistics', () => {
        test('統計情報を取得', async () => {
            const error1 = new Error('Error 1');
            const error2 = new Error('Error 2');

            const record1 = recoveryTracker.trackError(error1);
            const record2 = recoveryTracker.trackError(error2);

            await recoveryTracker.autoRecover(record1.id);

            const stats = recoveryTracker.getStatistics();

            expect(stats.totalErrors).toBe(2);
            expect(stats.recoveredErrors).toBe(1);
            expect(stats.activeErrors).toBe(1);
            expect(stats.recoveryRate).toBe(0.5);
            expect(stats.averageRecoveryTime).toBeGreaterThanOrEqual(0);
        });

        test('空の統計情報', () => {
            const stats = recoveryTracker.getStatistics();

            expect(stats.totalErrors).toBe(0);
            expect(stats.recoveredErrors).toBe(0);
            expect(stats.activeErrors).toBe(0);
            expect(stats.recoveryRate).toBe(0);
        });
    });

    describe('clearHistory', () => {
        test('回復済みエラー履歴をクリア', () => {
            const error1 = new Error('Error 1');
            const error2 = new Error('Error 2');

            const record1 = recoveryTracker.trackError(error1);
            const record2 = recoveryTracker.trackError(error2);
            record1.recovered = true;

            expect(recoveryTracker.getErrorHistory()).toHaveLength(2);

            recoveryTracker.clearHistory();

            const remainingHistory = recoveryTracker.getErrorHistory();
            expect(remainingHistory).toHaveLength(1);
            expect(remainingHistory[0].error.message).toBe('Error 2');
        });

        test('すべてのエラー履歴をクリア', () => {
            recoveryTracker.trackError(new Error('Error 1'));
            recoveryTracker.trackError(new Error('Error 2'));

            recoveryTracker.clearHistory(true);

            expect(recoveryTracker.getErrorHistory()).toHaveLength(0);
        });
    });

    describe('destroy', () => {
        test('リソースをクリーンアップ', () => {
            recoveryTracker.trackError(new Error('Test error'));
            recoveryTracker.registerCustomStrategy('test', {
                name: 'test',
                canRecover: jest.fn(),
                recover: jest.fn()
            });

            expect(recoveryTracker.errorHistory.length).toBeGreaterThan(0);
            expect(recoveryTracker.recoveryStrategies.size).toBeGreaterThan(0);

            recoveryTracker.destroy();

            expect(recoveryTracker.errorHistory.length).toBe(0);
            expect(recoveryTracker.activeRecoveries.size).toBe(0);
        });

        test('進行中の回復処理をキャンセル', async () => {
            const error = new Error('Test error');
            const errorRecord = recoveryTracker.trackError(error);

            // 長時間かかる回復処理をシミュレート
            jest.spyOn(mockErrorReporter.gameEngine.sceneManager, 'reloadCurrentScene')
                .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 5000)));

            const recoveryPromise = recoveryTracker.autoRecover(errorRecord.id);
            recoveryTracker.destroy();

            const result = await recoveryPromise;
            expect(result).toBe(false);
        });
    });

    describe('エラー分類', () => {
        test('レンダリングエラーを分類', () => {
            const renderError = new Error('WebGL context lost');
            const errorRecord = recoveryTracker.trackError(renderError, { operation: 'rendering' });

            expect(errorRecord.category).toBe('rendering');
        });

        test('メモリエラーを分類', () => {
            const memoryError = new Error('Out of memory');
            const errorRecord = recoveryTracker.trackError(memoryError);

            expect(errorRecord.category).toBe('memory');
        });

        test('ネットワークエラーを分類', () => {
            const networkError = new Error('Network request failed');
            const errorRecord = recoveryTracker.trackError(networkError);

            expect(errorRecord.category).toBe('network');
        });

        test('一般的なエラーを分類', () => {
            const genericError = new Error('Generic error');
            const errorRecord = recoveryTracker.trackError(genericError);

            expect(errorRecord.category).toBe('general');
        });
    });
});