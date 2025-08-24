import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';

/**
 * ErrorNotificationSystem テストスイート
 */
import { ErrorNotificationSystem } from '../../src/debug/ErrorNotificationSystem';

// モックErrorReporter
const createMockErrorReporter = () => ({
    sessionId: 'test_session_123',
    errorPatterns: new Map(),
    developerNotifications: { enabled: true }
});

// DOM環境のセットアップ
const setupDOMEnvironment = () => {
    (global as any).document = {
        createElement: jest.fn((tag) => {
            const element = {
                tagName: tag.toUpperCase(),
                id: '',
                className: '',
                style: { cssText: '' },
                innerHTML: '',
                appendChild: jest.fn(),
                remove: jest.fn(),
                addEventListener: jest.fn()
            };
            return element;
        }),
        head: { appendChild: jest.fn() },
        body: { appendChild: jest.fn() }
    };
    
    (global as any).window = {
        fetch: jest.fn()
    };
    
    (global as any).localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
    };
};

describe('ErrorNotificationSystem', () => {
    let notificationSystem: any;
    let mockErrorReporter: any;
    
    beforeEach(() => {
        setupDOMEnvironment();
        mockErrorReporter = createMockErrorReporter();
        notificationSystem = new ErrorNotificationSystem(mockErrorReporter as any);
        // コンソールのモック
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        if (notificationSystem) {
            notificationSystem.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('初期化', () => {
        test('デフォルト設定で初期化される', () => {
            expect(notificationSystem.isEnabled).toBe(true);
            expect(notificationSystem.notificationMethods).toContain('toast');
            expect(notificationSystem.notificationMethods).toContain('console');
            expect(notificationSystem.severity).toBe('error');
            expect(notificationSystem.maxNotifications).toBe(50);
            expect(notificationSystem.activeNotifications.length).toBe(0);
        });

        test('カスタム設定で初期化される', () => {
            const customNotificationSystem = new ErrorNotificationSystem(
                mockErrorReporter as any,
                {
                    enabled: false,
                    methods: ['email', 'webhook'],
                    severity: 'warning',
                    maxNotifications: 25
                }
            );
            
            expect(customNotificationSystem.isEnabled).toBe(false);
            expect(customNotificationSystem.notificationMethods).toEqual(['email', 'webhook']);
            expect(customNotificationSystem.severity).toBe('warning');
            expect(customNotificationSystem.maxNotifications).toBe(25);
            
            customNotificationSystem.destroy();
        });

        test('通知要素がDOMに追加される', () => {
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });
    });

    describe('showNotification', () => {
        test('エラー通知を表示する', async () => {
            const error = {
                message: 'Test error',
                stack: 'Error: Test error\n    at test.js:1:1',
                severity: 'error',
                timestamp: new Date(),
                context: { page: 'test' }
            };

            await notificationSystem.showNotification(error);

            expect(notificationSystem.activeNotifications.length).toBe(1);
            expect(notificationSystem.activeNotifications[0].message).toBe('Test error');
            expect(notificationSystem.activeNotifications[0].severity).toBe('error');
        });

        test('警告通知を表示する', async () => {
            notificationSystem.severity = 'warning';
            
            const warning = {
                message: 'Test warning',
                severity: 'warning',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(warning);

            expect(notificationSystem.activeNotifications.length).toBe(1);
            expect(notificationSystem.activeNotifications[0].severity).toBe('warning');
        });

        test('無効化されている場合は通知を表示しない', async () => {
            notificationSystem.isEnabled = false;
            
            const error = {
                message: 'Test error',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(error);

            expect(notificationSystem.activeNotifications.length).toBe(0);
        });

        test('重要度が低い通知は無視される', async () => {
            notificationSystem.severity = 'error';
            
            const info = {
                message: 'Test info',
                severity: 'info',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(info);

            expect(notificationSystem.activeNotifications.length).toBe(0);
        });

        test('最大通知数を超えた場合は古い通知を削除', async () => {
            notificationSystem.maxNotifications = 2;

            for (let i = 0; i < 3; i++) {
                await notificationSystem.showNotification({
                    message: `Test error ${i}`,
                    severity: 'error',
                    timestamp: new Date()
                });
            }

            expect(notificationSystem.activeNotifications.length).toBe(2);
            expect(notificationSystem.activeNotifications[0].message).toBe('Test error 1');
            expect(notificationSystem.activeNotifications[1].message).toBe('Test error 2');
        });
    });

    describe('hideNotification', () => {
        test('通知を非表示にする', async () => {
            const error = {
                message: 'Test error',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(error);
            expect(notificationSystem.activeNotifications.length).toBe(1);

            const notificationId = notificationSystem.activeNotifications[0].id;
            notificationSystem.hideNotification(notificationId);

            expect(notificationSystem.activeNotifications.length).toBe(0);
        });

        test('存在しない通知IDの場合は何もしない', () => {
            notificationSystem.hideNotification('nonexistent');
            expect(notificationSystem.activeNotifications.length).toBe(0);
        });
    });

    describe('clearAllNotifications', () => {
        test('すべての通知をクリアする', async () => {
            // 複数の通知を追加
            for (let i = 0; i < 3; i++) {
                await notificationSystem.showNotification({
                    message: `Test error ${i}`,
                    severity: 'error',
                    timestamp: new Date()
                });
            }

            expect(notificationSystem.activeNotifications.length).toBe(3);

            notificationSystem.clearAllNotifications();

            expect(notificationSystem.activeNotifications.length).toBe(0);
        });
    });

    describe('updateSettings', () => {
        test('設定を更新する', () => {
            const newSettings = {
                enabled: false,
                methods: ['webhook'],
                severity: 'warning',
                maxNotifications: 10
            };

            notificationSystem.updateSettings(newSettings);

            expect(notificationSystem.isEnabled).toBe(false);
            expect(notificationSystem.notificationMethods).toEqual(['webhook']);
            expect(notificationSystem.severity).toBe('warning');
            expect(notificationSystem.maxNotifications).toBe(10);
        });

        test('部分的な設定更新', () => {
            const originalMethods = [...notificationSystem.notificationMethods];
            
            notificationSystem.updateSettings({ enabled: false });

            expect(notificationSystem.isEnabled).toBe(false);
            expect(notificationSystem.notificationMethods).toEqual(originalMethods);
            expect(notificationSystem.severity).toBe('error'); // 変更されていない
        });
    });

    describe('getStatistics', () => {
        test('統計情報を取得する', async () => {
            // 通知を追加
            await notificationSystem.showNotification({
                message: 'Error 1',
                severity: 'error',
                timestamp: new Date()
            });

            await notificationSystem.showNotification({
                message: 'Warning 1',
                severity: 'warning',
                timestamp: new Date()
            });

            const stats = notificationSystem.getStatistics();

            expect(stats.totalNotifications).toBeGreaterThan(0);
            expect(stats.activeNotifications).toBe(notificationSystem.activeNotifications.length);
            expect(stats.notificationsByType).toBeDefined();
        });

        test('空の統計情報', () => {
            const stats = notificationSystem.getStatistics();

            expect(stats.totalNotifications).toBe(0);
            expect(stats.activeNotifications).toBe(0);
            expect(stats.notificationsByType).toEqual({});
        });
    });

    describe('通知メソッド', () => {
        test('トースト通知を送信', async () => {
            const createToastSpy = jest.spyOn(notificationSystem, 'createToast');
            
            const error = {
                message: 'Toast test',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(error);

            expect(createToastSpy).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Toast test',
                severity: 'error'
            }));
        });

        test('コンソール通知を送信', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error');
            
            const error = {
                message: 'Console test',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(error);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Console test')
            );
        });
    });

    describe('destroy', () => {
        test('リソースをクリーンアップする', () => {
            const removeSpy = jest.fn();
            notificationSystem.notificationContainer = { remove: removeSpy };

            notificationSystem.destroy();

            expect(removeSpy).toHaveBeenCalled();
            expect(notificationSystem.activeNotifications.length).toBe(0);
        });

        test('すでに破棄されている場合は何もしない', () => {
            notificationSystem.destroy();
            notificationSystem.destroy(); // 2回目の呼び出し

            // エラーが発生しないことを確認
            expect(() => notificationSystem.destroy()).not.toThrow();
        });
    });

    describe('エラーパターンマッチング', () => {
        test('パターンにマッチするエラーを検出', async () => {
            // エラーパターンを設定
            mockErrorReporter.errorPatterns.set('network', /network|fetch|xhr/i);
            
            const networkError = {
                message: 'Network request failed',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(networkError);

            expect(notificationSystem.activeNotifications.length).toBe(1);
            expect(notificationSystem.activeNotifications[0].category).toBe('network');
        });

        test('パターンにマッチしないエラーは通常処理', async () => {
            const genericError = {
                message: 'Generic error',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(genericError);

            expect(notificationSystem.activeNotifications.length).toBe(1);
            expect(notificationSystem.activeNotifications[0].category).toBeUndefined();
        });
    });

    describe('重複通知の処理', () => {
        test('同じメッセージの重複通知をマージ', async () => {
            const error = {
                message: 'Duplicate error',
                severity: 'error',
                timestamp: new Date()
            };

            await notificationSystem.showNotification(error);
            await notificationSystem.showNotification(error);

            expect(notificationSystem.activeNotifications.length).toBe(1);
            expect(notificationSystem.activeNotifications[0].count).toBe(2);
        });

        test('異なるメッセージは別々に処理', async () => {
            await notificationSystem.showNotification({
                message: 'Error 1',
                severity: 'error',
                timestamp: new Date()
            });

            await notificationSystem.showNotification({
                message: 'Error 2',
                severity: 'error',
                timestamp: new Date()
            });

            expect(notificationSystem.activeNotifications.length).toBe(2);
        });
    });
});