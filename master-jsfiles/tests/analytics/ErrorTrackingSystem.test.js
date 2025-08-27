/**
 * ErrorTrackingSystem のテスト
 */

import { ErrorTrackingSystem } from '../../src/analytics/ErrorTrackingSystem.js';

// DOM とブラウザ API のモック
global.XMLHttpRequest = jest.fn(() => ({
    open: jest.fn(),
    send: jest.fn(),
    addEventListener: jest.fn(),
    status: 200,
    statusText: 'OK'
}));

global.fetch = jest.fn(() => Promise.resolve());

Object.defineProperty(global, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
    }
});

Object.defineProperty(window, 'performance', {
    value: {
        now: jest.fn(() => Date.now()),
        timeOrigin: Date.now(),
        navigation: { type: 0, redirectCount: 0 }
    }
});

Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:8000/test'
    }
});

Object.defineProperty(document, 'referrer', {
    value: 'http://localhost:8000'
});

Object.defineProperty(document, 'visibilityState', {
    value: 'visible'
});

Object.defineProperty(document, 'readyState', {
    value: 'complete'
});

describe('ErrorTrackingSystem', () => {
    let errorTracker;
    let mockAddEventListener;
    let mockDispatchEvent;

    beforeEach(() => {
        jest.clearAllMocks();
        mockAddEventListener = jest.spyOn(window, 'addEventListener');
        mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
        
        errorTracker = new ErrorTrackingSystem({
            enableContextCapture: true,
            enableUserActionTracking: true,
            maxErrors: 50
        });
    });

    afterEach(() => {
        if (errorTracker) {
            errorTracker.destroy();
        }
        mockAddEventListener.mockRestore();
        mockDispatchEvent.mockRestore();
    });

    describe('初期化', () => {
        test('正しく初期化される', () => {
            expect(errorTracker).toBeDefined();
            expect(errorTracker.errors).toEqual([]);
            expect(errorTracker.sessionInfo).toBeDefined();
            expect(errorTracker.errorStats).toBeDefined();
        });

        test('セッション情報が正しく設定される', () => {
            expect(errorTracker.sessionInfo.sessionId).toBeDefined();
            expect(errorTracker.sessionInfo.startTime).toBeDefined();
            expect(errorTracker.sessionInfo.userAgent).toBeDefined();
            expect(errorTracker.sessionInfo.url).toBe('http://localhost:8000/test');
        });

        test('エラー統計が初期化される', () => {
            expect(errorTracker.errorStats.totalErrors).toBe(0);
            expect(errorTracker.errorStats.errorsByCategory).toEqual({});
            expect(errorTracker.errorStats.recoverableErrors).toBe(0);
        });

        test('イベントリスナーが設定される', () => {
            expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
        });
    });

    describe('JavaScript エラー処理', () => {
        test('JavaScript エラーを処理する', () => {
            const errorData = {
                message: 'Test error',
                filename: 'test.js',
                lineno: 10,
                colno: 5,
                error: new Error('Test error'),
                type: 'javascript_error',
                timestamp: Date.now()
            };

            errorTracker.handleJavaScriptError(errorData);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].message).toBe('Test error');
            expect(errorTracker.errors[0].category).toBe('javascript');
            expect(errorTracker.errors[0].context).toBeDefined();
            expect(errorTracker.errorStats.totalErrors).toBe(1);
        });

        test('エラーの重要度を正しく判定する', () => {
            expect(errorTracker.determineErrorSeverity({ message: 'out of memory' })).toBe('fatal');
            expect(errorTracker.determineErrorSeverity({ message: 'undefined is not a function' })).toBe('error');
            expect(errorTracker.determineErrorSeverity({ message: 'deprecation warning' })).toBe('warning');
        });
    });

    describe('Promise拒否処理', () => {
        test('Promise拒否を処理する', () => {
            const rejectionData = {
                reason: new Error('Promise rejected'),
                promise: Promise.reject(),
                type: 'unhandled_promise_rejection',
                timestamp: Date.now()
            };

            errorTracker.handlePromiseRejection(rejectionData);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].message).toBe('Promise rejected');
            expect(errorTracker.errors[0].type).toBe('unhandled_promise_rejection');
            expect(errorTracker.errors[0].category).toBe('javascript');
        });
    });

    describe('ネットワークエラー処理', () => {
        test('ネットワークエラーを処理する', () => {
            const errorData = {
                method: 'GET',
                url: '/api/test',
                status: 404,
                statusText: 'Not Found',
                duration: 1000,
                type: 'network_error',
                timestamp: Date.now()
            };

            errorTracker.handleNetworkError(errorData);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].category).toBe('network');
            expect(errorTracker.errors[0].method).toBe('GET');
            expect(errorTracker.errors[0].status).toBe(404);
        });

        test('ネットワークエラーの重要度を正しく判定する', () => {
            expect(errorTracker.determineNetworkErrorSeverity({ status: 500 })).toBe('error');
            expect(errorTracker.determineNetworkErrorSeverity({ status: 404 })).toBe('warning');
            expect(errorTracker.determineNetworkErrorSeverity({ type: 'network_timeout' })).toBe('warning');
        });
    });

    describe('ゲームエラー処理', () => {
        test('ゲームエラーを処理する', () => {
            const errorData = {
                message: 'Game logic error',
                type: 'game_logic_error',
                severity: 'error',
                context: { gameState: 'playing' }
            };

            errorTracker.handleGameError(errorData);

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errors[0].category).toBe('game_logic');
            expect(errorTracker.errors[0].message).toBe('Game logic error');
        });
    });

    describe('コンテキスト収集', () => {
        test('エラーコンテキストを収集する', () => {
            const context = errorTracker.captureErrorContext();

            expect(context.timestamp).toBeDefined();
            expect(context.url).toBe('http://localhost:8000/test');
            expect(context.userAgent).toBeDefined();
            expect(context.viewport).toBeDefined();
            expect(context.performance).toBeDefined();
            expect(context.dom).toBeDefined();
        });

        test('ゲーム状態を収集する', () => {
            // モックゲーム状態を設定
            window.gameEngine = {
                isRunning: true,
                sceneManager: {
                    getCurrentScene: () => ({ constructor: { name: 'GameScene' } })
                }
            };

            window.playerData = {
                currentHP: 100,
                score: 1000,
                level: 5
            };

            const gameState = errorTracker.captureGameState();

            expect(gameState.timestamp).toBeDefined();
            expect(gameState.currentScene).toBe('GameScene');
            expect(gameState.gameStatus).toBe('running');
            expect(gameState.playerData.currentHP).toBe(100);

            // クリーンアップ
            delete window.gameEngine;
            delete window.playerData;
        });
    });

    describe('ユーザーアクション追跡', () => {
        test('ユーザーアクションを記録する', () => {
            const action = {
                type: 'click',
                timestamp: Date.now(),
                target: {
                    tagName: 'BUTTON',
                    id: 'test-button'
                }
            };

            errorTracker.recordUserAction(action);

            expect(errorTracker.userActions).toHaveLength(1);
            expect(errorTracker.userActions[0]).toMatchObject(action);
        });

        test('最新100アクションのみ保持する', () => {
            // 150個のアクションを追加
            for (let i = 0; i < 150; i++) {
                errorTracker.recordUserAction({
                    type: 'click',
                    timestamp: Date.now(),
                    actionId: i
                });
            }

            expect(errorTracker.userActions).toHaveLength(100);
            expect(errorTracker.userActions[0].actionId).toBe(149); // 最新のアクション
        });

        test('最近のユーザーアクションを取得する', () => {
            for (let i = 0; i < 20; i++) {
                errorTracker.recordUserAction({
                    type: 'click',
                    timestamp: Date.now(),
                    actionId: i
                });
            }

            const recentActions = errorTracker.getRecentUserActions(10);
            expect(recentActions).toHaveLength(10);
            expect(recentActions[0].actionId).toBe(19); // 最新のアクション
        });
    });

    describe('エラー復旧', () => {
        test('復旧を試行する', () => {
            const errorInfo = {
                message: 'is not defined',
                type: 'reference_error',
                recovery: {
                    attempted: false,
                    successful: false,
                    recoveryTime: null
                }
            };

            errorTracker.attemptErrorRecovery(errorInfo);

            expect(errorInfo.recovery.attempted).toBe(true);
        });

        test('復旧戦略を取得する', () => {
            const referenceErrorStrategy = errorTracker.getRecoveryStrategy({
                message: 'foo is not defined'
            });
            expect(referenceErrorStrategy).toBeDefined();

            const typeErrorStrategy = errorTracker.getRecoveryStrategy({
                message: 'foo is not a function'
            });
            expect(typeErrorStrategy).toBeDefined();

            const networkErrorStrategy = errorTracker.getRecoveryStrategy({
                category: 'network'
            });
            expect(networkErrorStrategy).toBeDefined();
        });
    });

    describe('統計機能', () => {
        test('エラー統計を更新する', () => {
            const errorInfo = {
                category: 'javascript',
                type: 'reference_error',
                severity: 'error',
                timestamp: Date.now()
            };

            errorTracker.updateErrorStats(errorInfo);

            expect(errorTracker.errorStats.totalErrors).toBe(1);
            expect(errorTracker.errorStats.errorsByCategory.javascript).toBe(1);
            expect(errorTracker.errorStats.errorsByType.reference_error).toBe(1);
        });

        test('エラー統計を取得する', () => {
            // テストエラーを追加
            for (let i = 0; i < 5; i++) {
                errorTracker.recordError({
                    id: `error-${i}`,
                    category: 'javascript',
                    type: 'test_error',
                    severity: 'error',
                    message: `Test error ${i}`,
                    timestamp: Date.now(),
                    recovery: { attempted: false, successful: false }
                });
            }

            const stats = errorTracker.getErrorStatistics();

            expect(stats.totalErrors).toBe(5);
            expect(stats.uptime).toBeGreaterThan(0);
            expect(stats.averageErrorRate).toBeGreaterThan(0);
            expect(stats.sessionInfo).toBeDefined();
        });

        test('エラータイムラインを生成する', () => {
            // 過去のエラーを追加
            const now = Date.now();
            errorTracker.errors = [
                { timestamp: now - 3600000 }, // 1時間前
                { timestamp: now - 7200000 }, // 2時間前
                { timestamp: now - 1800000 }  // 30分前
            ];

            const timeline = errorTracker.generateErrorTimeline();

            expect(timeline).toHaveLength(24); // 24時間分
            expect(timeline[0].hour).toBeDefined();
            expect(timeline[0].errorCount).toBeDefined();
        });
    });

    describe('データ管理', () => {
        test('エラー数を制限する', () => {
            const limitedTracker = new ErrorTrackingSystem({ maxErrors: 3 });

            // 5つのエラーを追加
            for (let i = 0; i < 5; i++) {
                limitedTracker.recordError({
                    id: `error-${i}`,
                    category: 'test',
                    type: 'test_error',
                    message: `Test error ${i}`,
                    timestamp: Date.now(),
                    recovery: { attempted: false, successful: false }
                });
            }

            expect(limitedTracker.errors).toHaveLength(3);
            limitedTracker.destroy();
        });

        test('エラー履歴をフィルタリングできる', () => {
            // 異なるカテゴリ・重要度のエラーを追加
            errorTracker.recordError({
                id: 'error-1',
                category: 'javascript',
                severity: 'error',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            });

            errorTracker.recordError({
                id: 'error-2',
                category: 'network',
                severity: 'warning',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            });

            const jsErrors = errorTracker.getErrorHistory({ category: 'javascript' });
            expect(jsErrors).toHaveLength(1);
            expect(jsErrors[0].category).toBe('javascript');

            const errorSeverity = errorTracker.getErrorHistory({ severity: 'error' });
            expect(errorSeverity).toHaveLength(1);
            expect(errorSeverity[0].severity).toBe('error');
        });
    });

    describe('レポート生成', () => {
        test('エラーレポートを生成する', () => {
            errorTracker.recordError({
                id: 'test-error',
                category: 'javascript',
                type: 'test_error',
                severity: 'error',
                message: 'Test error',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            });

            const report = errorTracker.generateErrorReport();
            const reportObj = JSON.parse(report);

            expect(reportObj.summary).toBeDefined();
            expect(reportObj.recentErrors).toHaveLength(1);
            expect(reportObj.topErrorsByCategory).toBeDefined();
            expect(reportObj.timeline).toBeDefined();
            expect(reportObj.generatedAt).toBeDefined();
        });

        test('CSV形式でレポートを生成する', () => {
            errorTracker.recordError({
                id: 'test-error',
                category: 'javascript',
                type: 'test_error',
                severity: 'error',
                message: 'Test error',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            });

            const csvReport = errorTracker.generateErrorReport('csv');

            expect(typeof csvReport).toBe('string');
            expect(csvReport).toContain('Type,Category,Severity,Message,Timestamp,Recovered');
            expect(csvReport).toContain('test_error,javascript,error');
        });
    });

    describe('ローカルストレージ', () => {
        test('データをローカルストレージに保存する', () => {
            errorTracker.recordError({
                id: 'test-error',
                category: 'test',
                type: 'test_error',
                message: 'Test error',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            });

            errorTracker.saveToLocalStorage();

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'bubblePop_errorTracking',
                expect.any(String)
            );
        });

        test('ローカルストレージからデータを読み込む', () => {
            const mockData = {
                errors: [{ id: 'test-error', category: 'test' }],
                stats: { totalErrors: 1 },
                timestamp: Date.now()
            };

            localStorage.getItem.mockReturnValue(JSON.stringify(mockData));

            errorTracker.loadFromLocalStorage();

            expect(errorTracker.errors).toHaveLength(1);
            expect(errorTracker.errorStats.totalErrors).toBe(1);
        });
    });

    describe('イベント発火', () => {
        test('エラー追跡イベントを発火する', () => {
            const errorInfo = {
                id: 'test-error',
                category: 'test',
                type: 'test_error',
                message: 'Test error',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            };

            errorTracker.recordError(errorInfo);

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error-tracked',
                    detail: expect.objectContaining({
                        id: 'test-error'
                    })
                })
            );
        });
    });

    describe('リソース管理', () => {
        test('エラーをクリアできる', () => {
            errorTracker.recordError({
                id: 'test-error',
                category: 'test',
                type: 'test_error',
                message: 'Test error',
                timestamp: Date.now(),
                recovery: { attempted: false, successful: false }
            });

            expect(errorTracker.errors).toHaveLength(1);

            errorTracker.clearErrors();

            expect(errorTracker.errors).toHaveLength(0);
            expect(errorTracker.errorStats.totalErrors).toBe(0);
        });

        test('destroy()でリソースを解放する', () => {
            errorTracker.destroy();

            expect(errorTracker.errors).toHaveLength(0);
            expect(errorTracker.userActions).toHaveLength(0);
        });
    });
});