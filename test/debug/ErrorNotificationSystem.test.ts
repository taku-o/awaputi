import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * ErrorNotificationSystem テストスイート
 */

import { ErrorNotificationSystem } from '../../src/debug/ErrorNotificationSystem';

// モックErrorReporter
const createMockErrorReporter = () => ({
    sessionId: 'test_session_123',
    errorPatterns: new Map(),
    developerNotifications: {
        enabled: true
    }
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
        head: {
            appendChild: jest.fn()
        },
        body: {
            appendChild: jest.fn()
        }
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
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'group').mockImplementation();
        jest.spyOn(console, 'groupEnd').mockImplementation();
        
        // タイマーのモック
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        notificationSystem.destroy();
        jest.restoreAllMocks();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    
    describe('初期化', () => {
        test('ErrorNotificationSystemが正しく初期化される', () => {
            expect(notificationSystem).toBeDefined();
            expect(notificationSystem.notificationConfig.enabled).toBe(true;
            expect(notificationSystem.notificationHistory).toEqual([]);
            expect(notificationSystem.pendingNotifications).toBeInstanceOf(Map as any);
        });
        
        test('UI コンテナが作成される', () => {
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();
        });
        
        test('設定が正しく初期化される', () => {
            const config = notificationSystem.notificationConfig;
            
            expect(config.channels.console.enabled).toBe(true;
            expect(config.channels.ui.enabled).toBe(true;
            expect(config.channels.storage.enabled).toBe(true;
            expect(config.rateLimit.maxPerMinute).toBe(10);
        });
    });
    
    describe('通知処理', () => {
        test('基本的なエラー通知が処理される', () => {
            const testError = {
                id: 'test_error_1',
                message: 'Test error message',
                severity: 'high',
                category: 'test',
                fingerprint: 'test_fingerprint'
            };
            
            const result = notificationSystem.processErrorNotification(testError;
            
            expect(result).toBe(true;
            expect(notificationSystem.notificationHistory.length).toBe(1);
            expect(console.group).toHaveBeenCalled();
        });
        
        test('重要度フィルタが正しく動作する', () => {
            // 低重要度は除外設定
            notificationSystem.notificationConfig.filters.severities = ['high', 'critical'];
            
            const lowSeverityError = {
                id: 'low_error',
                message: 'Low severity error',
                severity: 'low',
                category: 'test',
                fingerprint: 'low_fingerprint'
            };
            
            const result = notificationSystem.processErrorNotification(lowSeverityError;
            
            expect(result).toBe(false;
            expect(notificationSystem.notificationHistory.length).toBe(0);
        });
        
        test('カテゴリフィルタが正しく動作する', () => {
            // 特定カテゴリのみ通知
            notificationSystem.notificationConfig.filters.categories = ['network'];
            
            const networkError = {
                id: 'network_error',
                message: 'Network error',
                severity: 'high',
                category: 'network',
                fingerprint: 'network_fingerprint'
            };
            
            const renderError = {
                id: 'render_error',
                message: 'Render error',
                severity: 'high',
                category: 'rendering',
                fingerprint: 'render_fingerprint'
            };
            
            const networkResult = notificationSystem.processErrorNotification(networkError;
            const renderResult = notificationSystem.processErrorNotification(renderError;
            
            expect(networkResult).toBe(true;
            expect(renderResult).toBe(false;
        });
        
        test('除外パターンが正しく動作する', () => {
            notificationSystem.notificationConfig.filters.excludePatterns = ['test_exclude'];
            
            const excludedError = {
                id: 'excluded_error',
                message: 'Excluded error',
                severity: 'high',
                category: 'test',
                fingerprint: 'test_exclude_pattern'
            };
            
            const result = notificationSystem.processErrorNotification(excludedError;
            
            expect(result).toBe(false;
        });
    });
    
    describe('レート制限', () => {
        test('レート制限が正しく適用される', () => {
            // レート制限を低く設定
            notificationSystem.notificationConfig.rateLimit.maxPerMinute = 2;
            
            const testError = {
                id: 'rate_test',
                message: 'Rate limit test',
                severity: 'high',
                category: 'test',
                fingerprint: 'rate_fingerprint'
            };
            
            // 制限内では成功
            expect(notificationSystem.processErrorNotification(testError).toBe(true;
            expect(notificationSystem.processErrorNotification(testError).toBe(true;
            
            // 制限を超えると失敗
            expect(notificationSystem.processErrorNotification(testError).toBe(false;
        });
        
        test('レート制限リセットが正しく動作する', () => {
            notificationSystem.notificationConfig.rateLimit.maxPerMinute = 1;
            
            const testError = {
                id: 'reset_test',
                message: 'Reset test',
                severity: 'high',
                category: 'test',
                fingerprint: 'reset_fingerprint'
            };
            
            // 1回目は成功
            expect(notificationSystem.processErrorNotification(testError).toBe(true;
            
            // 2回目は失敗（制限に達している）
            expect(notificationSystem.processErrorNotification(testError).toBe(false;
            
            // 時間を進めてリセット
            jest.advanceTimersByTime(60000); // 1分進める
            
            // リセット後は再び成功
            expect(notificationSystem.processErrorNotification(testError).toBe(true;
        });
    });
    
    describe('通知閾値', () => {
        test('閾値チェックが正しく動作する', () => {
            // 中重要度エラーは5回で通知する設定
            const testError = {
                id: 'threshold_test',
                message: 'Threshold test',
                severity: 'medium',
                category: 'test',
                fingerprint: 'threshold_fingerprint'
            };
            
            // パターンを事前に作成（4回発生済み）
            mockErrorReporter.errorPatterns.set('threshold_fingerprint', {
                count: 4,
                errors: ['error1', 'error2', 'error3', 'error4']
            });
            
            // 通知履歴も作成
            for (let i = 0; i < 4; i++) {
                notificationSystem.notificationHistory.push({
                    timestamp: Date.now() - 60000, // 1分前
                    error: { fingerprint: 'threshold_fingerprint' }
                });
            }
            
            // 5回目で通知される
            expect(notificationSystem.processErrorNotification(testError).toBe(true;
        });
        
        test('クリティカルエラーは即座に通知される', () => {
            const criticalError = {
                id: 'critical_test',
                message: 'Critical error',
                severity: 'critical',
                category: 'test',
                fingerprint: 'critical_fingerprint'
            };
            
            // 1回目から通知される
            expect(notificationSystem.processErrorNotification(criticalError).toBe(true;
        });
    });
    
    describe('通知集約', () => {
        test('通知集約が正しく動作する', () => {
            notificationSystem.notificationConfig.aggregation.enabled = true;
            
            const testError1 = {
                id: 'agg_test_1',
                message: 'Aggregation test 1',
                severity: 'medium',
                category: 'test',
                fingerprint: 'agg_fingerprint_1'
            };
            
            const testError2 = {
                id: 'agg_test_2',
                message: 'Aggregation test 2',
                severity: 'medium',
                category: 'test',
                fingerprint: 'agg_fingerprint_2'
            };
            
            // 複数のエラーを追加
            notificationSystem.processErrorNotification(testError1;
            notificationSystem.processErrorNotification(testError2;
            
            // 集約期間内なので即座には送信されない
            expect(console.group).not.toHaveBeenCalled();
            
            // 集約タイマーを進める
            jest.advanceTimersByTime(60000); // 1分進める
            
            // 集約された通知が送信される
            expect(console.group).toHaveBeenCalled();
        });
        
        test('クリティカルエラーは集約されない', () => {
            notificationSystem.notificationConfig.aggregation.enabled = true;
            
            const criticalError = {
                id: 'critical_no_agg',
                message: 'Critical no aggregation',
                severity: 'critical',
                category: 'test',
                fingerprint: 'critical_fingerprint'
            };
            
            notificationSystem.processErrorNotification(criticalError, 'critical');
            
            // 即座に送信される
            expect(console.group).toHaveBeenCalled();
        });
    });
    
    describe('チャンネル別送信', () => {
        test('コンソール通知が正しく送信される', () => {
            const testError = {
                id: 'console_test',
                message: 'Console test',
                severity: 'high',
                category: 'test',
                fingerprint: 'console_fingerprint'
            };
            
            notificationSystem.processErrorNotification(testError;
            
            expect(console.group).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Console test')
            );
        });
        
        test('UI通知要素が作成される', () => {
            // UIチャンネルを有効にする
            notificationSystem.notificationConfig.channels.ui.enabled = true;
            
            const testError = {
                id: 'ui_test',
                message: 'UI test',
                severity: 'high',
                category: 'test',
                fingerprint: 'ui_fingerprint'
            };
            
            notificationSystem.processErrorNotification(testError;
            
            // UI要素が作成されることを確認
            expect(document.createElement).toHaveBeenCalledWith('div');
        });
        
        test('ストレージ通知が保存される', () => {
            const testError = {
                id: 'storage_test',
                message: 'Storage test',
                severity: 'high',
                category: 'test',
                fingerprint: 'storage_fingerprint'
            };
            
            notificationSystem.processErrorNotification(testError;
            
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'error_notifications',
                expect.any(String
            );
        });
        
        test('Webhook通知が送信される', async () => {
            // Webhookを有効にする
            notificationSystem.notificationConfig.channels.webhook.enabled = true;
            notificationSystem.notificationConfig.channels.webhook.url = 'https://example.com/webhook';
            
            const mockFetch = jest.fn().mockResolvedValue({ ok: true });
            (global as any).fetch = mockFetch;
            
            const testError = {
                id: 'webhook_test',
                message: 'Webhook test',
                severity: 'critical',
                category: 'test',
                fingerprint: 'webhook_fingerprint'
            };
            
            notificationSystem.processErrorNotification(testError;
            
            // 非同期処理を待つ
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockFetch).toHaveBeenCalledWith(
                'https://example.com/webhook',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
            );
        });
    });
    
    describe('集約通知', () => {
        test('集約通知が正しく作成される', () => {
            const group = {
                key: 'test_medium',
                notifications: [
                    {
                        id: 'agg1',
                        timestamp: Date.now() - 5000,
                        error: {
                            category: 'test',
                            severity: 'medium',
                            message: 'Message 1'
                        },
                        channels: ['console']
                    },
                    {
                        id: 'agg2',
                        timestamp: Date.now(),
                        error: {
                            category: 'test',
                            severity: 'medium',
                            message: 'Message 2'
                        },
                        channels: ['console']
                    }
                ],
                firstSeen: Date.now() - 5000,
                lastSeen: Date.now()
            };
            
            const aggregated = notificationSystem.createAggregatedNotification(group;
            
            expect(aggregated.type).toBe('aggregated');
            expect(aggregated.error.count).toBe(2);
            expect(aggregated.error.category).toBe('test');
            expect(aggregated.error.severity).toBe('medium');
            expect(aggregated.aggregatedNotifications).toHaveLength(2);
        });
    });
    
    describe('スタイルヘルパー', () => {
        test('重要度別絵文字が正しく取得される', () => {
            expect(notificationSystem.getSeverityEmoji('critical')).toBe('🚨');
            expect(notificationSystem.getSeverityEmoji('high')).toBe('⚠️');
            expect(notificationSystem.getSeverityEmoji('medium')).toBe('⚡');
            expect(notificationSystem.getSeverityEmoji('low')).toBe('ℹ️');
        });
        
        test('重要度別色が正しく取得される', () => {
            expect(notificationSystem.getSeverityColor('critical')).toBe('#dc3545');
            expect(notificationSystem.getSeverityColor('high')).toBe('#fd7e14');
            expect(notificationSystem.getSeverityColor('medium')).toBe('#ffc107');
            expect(notificationSystem.getSeverityColor('low')).toBe('#17a2b8');
        });
        
        test('通知持続時間が重要度に応じて計算される', () => {
            const criticalNotification = { error: { severity: 'critical' } };
            const lowNotification = { error: { severity: 'low' } };
            
            const criticalDuration = notificationSystem.getNotificationDuration(criticalNotification;
            const lowDuration = notificationSystem.getNotificationDuration(lowNotification;
            
            expect(criticalDuration).toBeGreaterThan(lowDuration;
        });
    });
    
    describe('設定管理', () => {
        test('設定が正しく更新される', () => {
            const newSettings = {
                channels: {
                    console: { enabled: false }
                }
            };
            
            notificationSystem.updateSettings(newSettings;
            
            expect(notificationSystem.notificationConfig.channels.console.enabled).toBe(false;
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'error_notification_settings',
                expect.any(String
            );
        });
        
        test('設定が正しく読み込まれる', () => {
            const storedSettings = {
                channels: {
                    ui: { enabled: false }
                }
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(storedSettings);
            
            // 新しいインスタンスを作成
            const newNotificationSystem = new ErrorNotificationSystem(mockErrorReporter as any);
            
            expect(newNotificationSystem.notificationConfig.channels.ui.enabled).toBe(false;
            
            newNotificationSystem.destroy();
        });
    });
    
    describe('統計情報', () => {
        test('通知統計が正しく計算される', () => {
            // テスト用通知を追加
            const testError = {
                id: 'stats_test',
                message: 'Stats test',
                severity: 'high',
                category: 'test',
                fingerprint: 'stats_fingerprint'
            };
            
            notificationSystem.processErrorNotification(testError;
            
            const stats = notificationSystem.getNotificationStatistics();
            
            expect(stats.total).toBe(1);
            expect(stats.bySeverity.high).toBe(1);
            expect(stats.byCategory.test).toBe(1);
            expect(stats.rateLimitStatus).toBeDefined();
        });
    });
    
    describe('クリーンアップ', () => {
        test('destroyメソッドでリソースがクリーンアップされる', () => {
            notificationSystem.destroy();
            
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'error_notification_settings',
                expect.any(String
            );
        });
    });
});