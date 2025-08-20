import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { DeveloperAlertSystem } from '../../src/analytics/DeveloperAlertSystem';

// fetch APIのモック
(global as any).fetch = jest.fn() as jest.Mock;

describe('DeveloperAlertSystem', () => {
    let dataCollector: any;
    let trendAnalyzer: any;
    let alertSystem: any;
    let consoleGroupSpy, consoleLogSpy, consoleGroupEndSpy, consoleWarnSpy;

    beforeEach(() => {
        // モックデータコレクターとトレンドアナライザー
        dataCollector = {
            getData: jest.fn()
        };
        
        trendAnalyzer = {
            analyzeTrend: jest.fn()
        };

        // コンソールメソッドをモック
        consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // DeveloperAlertSystemを作成
        alertSystem = new DeveloperAlertSystem(dataCollector, trendAnalyzer, {
            enableConsoleLogging: true,
            enableWebhookNotifications: false,
            enableEmailNotifications: false
        });
    });

    afterEach(() => {
        if (alertSystem) {
            alertSystem.destroy();
        }
        
        // スパイをリストア
        consoleGroupSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleGroupEndSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('Task 9.4: 開発者向けアラートシステムの実装', () => {
        test('アラートシステムが正しく初期化される', () => {
            expect(alertSystem.alertCategories.size).toBeGreaterThan(0);
            expect(alertSystem.alertFilters.size).toBeGreaterThan(0);
            expect(alertSystem.alertHistory).toEqual([]);
            expect(alertSystem.severityLevels).toEqual(['info', 'warning', 'error', 'critical']);
        });

        test('アラートカテゴリが正しく設定される', () => {
            expect(alertSystem.alertCategories.has('gameplay')).toBe(true);
            expect(alertSystem.alertCategories.has('performance')).toBe(true);
            expect(alertSystem.alertCategories.has('security')).toBe(true);
            expect(alertSystem.alertCategories.has('data')).toBe(true);
            expect(alertSystem.alertCategories.has('business')).toBe(true);

            const gameplayCategory = alertSystem.alertCategories.get('gameplay');
            expect(gameplayCategory.name).toBe('異常なゲームプレイ');
            expect(gameplayCategory.defaultSeverity).toBe('warning');
            expect(gameplayCategory.checks).toContain('unusualScoreProgression');
        });

        test('異常なスコア進行が検出される', () => {
            const testData = {
                playerBehavior: {
                    sessionData: [
                        { totalScore: 1000 },
                        { totalScore: 2000 },
                        { totalScore: 15000 }, // 13000の増加
                        { totalScore: 40000 }  // 25000の増加 -> 平均 (1000+13000+25000)/3 = 13000 > 10000
                    ]
                }
            };

            const result = alertSystem.checkUnusualScoreProgression(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('異常に急激なスコア上昇');
        });

        test('異常なセッション長が検出される', () => {
            const testData = {
                playerBehavior: {
                    sessionData: [
                        { duration: 25 * 60 * 60 * 1000 }, // 25時間
                        { duration: 26 * 60 * 60 * 1000 }  // 26時間
                    ]
                }
            };

            const result = alertSystem.checkAbnormalSessionLength(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('異常に長いセッション時間');
        });

        test('繰り返し動作パターンが検出される', () => {
            const testData = {
                gameBalance: {
                    bubbleInteractions: Array(100).fill('click_normal_bubble') // 同じアクションの繰り返し
                }
            };

            const result = alertSystem.checkRepetitiveActions(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('info');
            expect(result.message).toContain('繰り返し動作パターン');
        });

        test('不可能な実績が検出される', () => {
            const testData = {
                playerBehavior: {
                    achievementData: [
                        { id: 'impossible_achievement', timeToAchieve: 500 } // 500ms以内の実績取得
                    ]
                }
            };

            const result = alertSystem.checkImpossibleAchievements(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('critical');
            expect(result.message).toContain('不可能な実績取得');
        });

        test('低フレームレートが検出される', () => {
            const testData = {
                performance: {
                    frameRate: {
                        average: 15,
                        min: 10
                    }
                }
            };

            const result = alertSystem.checkLowFrameRate(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('error');
            expect(result.message).toContain('深刻なパフォーマンス問題');
        });

        test('高メモリ使用量が検出される', () => {
            const testData = {
                performance: {
                    memoryUsage: {
                        current: 600 * 1024 * 1024, // 600MB
                        trend: 'increasing'
                    }
                }
            };

            const result = alertSystem.checkHighMemoryUsage(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('高メモリ使用量');
        });

        test('長いロード時間が検出される', () => {
            const testData = {
                performance: {
                    loadTimes: {
                        average: 6000, // 6秒
                        max: 10000
                    }
                }
            };

            const result = alertSystem.checkLongLoadTimes(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('長いロード時間');
        });

        test('頻繁なエラーが検出される', () => {
            const testData = {
                errors: {
                    errorRate: 2.5, // 2.5エラー/分
                    mostCommon: ['TypeError', 'NetworkError']
                }
            };

            const result = alertSystem.checkFrequentErrors(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('error');
            expect(result.message).toContain('高いエラー発生率');
        });

        test('疑わしい活動が検出される', () => {
            const now = Date.now();
            const testData = {
                security: {
                    activityLog: Array(200).fill().map((_, i) => ({
                        action: 'click',
                        timestamp: now - (i * 50) // 50ms間隔で200アクション (10秒で200アクション)
                    }))
                }
            };

            const result = alertSystem.checkSuspiciousActivity(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('critical');
            expect(result.message).toContain('疑わしい活動');
        });

        test('データ操作が検出される', () => {
            const testData = {
                security: {
                    dataIntegrity: {
                        issues: [
                            { type: 'checksum_mismatch', table: 'player_data' },
                            { type: 'unexpected_change', field: 'score' }
                        ]
                    }
                }
            };

            const result = alertSystem.checkDataManipulation(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('critical');
            expect(result.message).toContain('データ整合性の問題');
        });

        test('データ不整合が検出される', () => {
            const testData = {
                validation: {
                    inconsistencies: Array(8).fill().map((_, i) => ({
                        field: `field_${i}`,
                        issue: 'validation_failed'
                    }))
                }
            };

            const result = alertSystem.checkDataInconsistency(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('データ不整合が多数検出');
        });

        test('データ欠損が検出される', () => {
            const testData = {
                gameBalance: { some: 'data' }
                // playerBehavior と performance が欠損
            };

            const result = alertSystem.checkMissingData(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('error');
            expect(result.message).toContain('必須データが欠損');
        });

        test('ユーザーエンゲージメント低下が検出される', () => {
            const testData = {
                business: {
                    engagement: {
                        current: 40,
                        previous: 60 // 33%の低下
                    }
                }
            };

            const result = alertSystem.checkUserEngagementDrop(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('ユーザーエンゲージメントが大幅に低下');
        });

        test('リテンション率変化が検出される', () => {
            const testData = {
                business: {
                    retention: {
                        current: 0.5,
                        previous: 0.7 // 約29%の低下
                    }
                }
            };

            const result = alertSystem.checkRetentionRateChange(testData);
            expect(result.shouldAlert).toBe(true);
            expect(result.severity).toBe('error');
            expect(result.message).toContain('ユーザーリテンション率が大幅に低下');
        });

        test('アラートが正しく生成される', () => {
            const alertData = {
                category: 'performance',
                checkType: 'test_check',
                severity: 'error',
                message: 'テストアラート',
                data: { test: 'data' },
                recommendations: ['テスト推奨アクション']
            };

            const alert = alertSystem.generateAlert(alertData);
            
            expect(alert).toBeTruthy();
            expect(alert.id).toMatch(/^alert_\d+_[a-z0-9]+$/);
            expect(alert.category).toBe('performance');
            expect(alert.severity).toBe('error');
            expect(alert.message).toBe('テストアラート');
            expect(alert.status).toBe('new');
            expect(alert.acknowledged).toBe(false);
        });

        test('アラートフィルターが正しく動作する', () => {
            // 最小重要度フィルター
            const lowSeverityAlert = {
                category: 'test',
                severity: 'info',
                checkType: 'test'
            };

            alertSystem.options.minSeverityLevel = 'warning';
            expect(alertSystem.passesFilters(lowSeverityAlert)).toBe(false);

            alertSystem.options.minSeverityLevel = 'info';
            expect(alertSystem.passesFilters(lowSeverityAlert)).toBe(true);
        });

        test('レート制限フィルターが動作する', () => {
            const alert = {
                category: 'test',
                severity: 'warning',
                checkType: 'test_check',
                timestamp: Date.now()
            };

            alertSystem.options.maxAlertsPerHour = 2;

            // 最初の2つは通る
            expect(alertSystem.alertFilters.get('rateLimit')(alert)).toBe(true);
            expect(alertSystem.alertFilters.get('rateLimit')(alert)).toBe(true);
            
            // 3つ目は制限される
            expect(alertSystem.alertFilters.get('rateLimit')(alert)).toBe(false);
        });

        test('重複フィルターが動作する', () => {
            const alert1 = {
                category: 'test',
                checkType: 'test_check',
                timestamp: Date.now()
            };

            const alert2 = {
                category: 'test',
                checkType: 'test_check',
                timestamp: Date.now() + 30000 // 30秒後
            };

            // 最初のアラートは通る
            expect(alertSystem.alertFilters.get('duplicate')(alert1)).toBe(true);
            alertSystem.alertHistory.push(alert1);

            // 同じアラートは重複として除外される
            expect(alertSystem.alertFilters.get('duplicate')(alert2)).toBe(false);
        });

        test('コンソールログが出力される', () => {
            const alert = {
                id: 'test-alert',
                category: 'performance',
                severity: 'error',
                message: 'テストアラート',
                data: { test: 'data' },
                recommendations: ['推奨アクション1', '推奨アクション2'],
                timestamp: Date.now()
            };

            alertSystem.logToConsole(alert);

            expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining('テストアラート'));
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('カテゴリ'), expect.any(String);
            expect(consoleLogSpy).toHaveBeenCalledWith('データ:', { test: 'data' });
            expect(consoleGroupEndSpy).toHaveBeenCalled();
        });

        test('ウェブフック通知が送信される', async () => {
            alertSystem.options.enableWebhookNotifications = true;
            alertSystem.options.webhookUrl = 'https://webhook.example.com';
            
            fetch.mockResolvedValueOnce({ ok: true });

            const alert = {
                id: 'test-alert',
                message: 'テストアラート'
            };

            await alertSystem.sendWebhookNotification(alert);

            expect(fetch).toHaveBeenCalledWith(
                'https://webhook.example.com',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('テストアラート')
                })
            );
        });

        test('メール通知が送信される', async () => {
            alertSystem.options.enableEmailNotifications = true;
            alertSystem.options.emailEndpoint = 'https://email.example.com';
            
            fetch.mockResolvedValueOnce({ ok: true });

            const alert = {
                id: 'test-alert',
                category: 'performance',
                severity: 'error',
                message: 'テストアラート',
                timestamp: Date.now(),
                data: { test: 'data' },
                recommendations: ['推奨アクション']
            };

            await alertSystem.sendEmailNotification(alert);

            expect(fetch).toHaveBeenCalledWith(
                'https://email.example.com',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('テストアラート')
                })
            );
        });

        test('パフォーマンス警告が処理される', () => {
            const warningData = {
                severity: 'warning',
                message: 'FPS低下',
                details: { fps: 25 }
            };

            const generateAlertSpy = jest.spyOn(alertSystem, 'generateAlert');
            alertSystem.handlePerformanceWarning(warningData;

            expect(generateAlertSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'performance',
                    checkType: 'performance_warning',
                    severity: 'warning',
                    message: 'パフォーマンス警告: FPS低下'
                })
            );
        });

        test('エラーイベントが処理される', () => {
            const errorData = {
                severity: 'critical',
                message: '重大なエラー',
                details: { error: 'critical_error' }
            };

            const generateAlertSpy = jest.spyOn(alertSystem, 'generateAlert');
            alertSystem.handleErrorEvent(errorData;

            expect(generateAlertSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'performance',
                    checkType: 'error_event',
                    severity: 'critical',
                    message: 'エラー発生: 重大なエラー'
                })
            );
        });

        test('コールバックが登録・実行される', () => {
            const callback = jest.fn() as jest.Mock;
            alertSystem.registerCallback('test-callback', callback);

            const alert = {
                id: 'test-alert',
                message: 'テストアラート'
            };

            alertSystem.executeCallbacks(alert);
            expect(callback).toHaveBeenCalledWith(alert);

            alertSystem.unregisterCallback('test-callback');
            callback.mockClear();
            
            alertSystem.executeCallbacks(alert);
            expect(callback).not.toHaveBeenCalled();
        });

        test('カスタムフィルターが追加・削除される', () => {
            const customFilter = jest.fn().mockReturnValue(true) as jest.Mock;
            alertSystem.addFilter('custom-filter', customFilter);

            const alert = { 
                category: 'test',
                severity: 'warning',
                checkType: 'test_check',
                timestamp: Date.now()
            };
            alertSystem.passesFilters(alert);

            expect(customFilter).toHaveBeenCalledWith(alert);

            alertSystem.removeFilter('custom-filter');
            customFilter.mockClear();
            
            alertSystem.passesFilters(alert);
            expect(customFilter).not.toHaveBeenCalled();
        });

        test('アラート履歴がトリミングされる', () => {
            // 古いアラートを追加
            const oldAlert = {
                id: 'old-alert',
                timestamp: Date.now() - (40 * 24 * 60 * 60 * 1000) // 40日前
            };
            
            const recentAlert = {
                id: 'recent-alert',
                timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000) // 10日前
            };

            alertSystem.alertHistory = [oldAlert, recentAlert];
            alertSystem.options.alertRetentionDays = 30;

            alertSystem.trimAlertHistory();

            expect(alertSystem.alertHistory).toHaveLength(1);
            expect(alertSystem.alertHistory[0].id).toBe('recent-alert');
        });

        test('アラート統計が正しく計算される', () => {
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            
            alertSystem.alertHistory = [
                { timestamp: now, category: 'performance', severity: 'error', acknowledged: false },
                { timestamp: oneDayAgo + 1000, category: 'gameplay', severity: 'warning', acknowledged: true },
                { timestamp: oneDayAgo - 1000, category: 'security', severity: 'critical', acknowledged: false }
            ];

            const stats = alertSystem.getAlertStatistics();

            expect(stats.total).toBe(3);
            expect(stats.today).toBe(2);
            expect(stats.acknowledged).toBe(1);
            expect(stats.byCategory.performance).toBe(1);
            expect(stats.bySeverity.error).toBe(1);
        });

        test('データ分析でアラートが生成される', () => {
            const testData = {
                playerBehavior: {
                    sessionData: [
                        { totalScore: 1000 },
                        { totalScore: 2000 },  
                        { totalScore: 15000 }, // 13000増加
                        { totalScore: 40000 }  // 25000増加 -> 平均13000 > 10000
                    ]
                },
                performance: {
                    frameRate: { average: 15 } // 低FPS
                },
                gameBalance: { some: 'data' } // データ欠損を防ぐ
            };

            const generateAlertSpy = jest.spyOn(alertSystem, 'generateAlert').mockReturnValue(null);
            alertSystem.analyzeData(testData);

            // 複数のアラートが生成されることを確認
            expect(generateAlertSpy).toHaveBeenCalled();
            expect(generateAlertSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'gameplay',
                    checkType: 'unusualScoreProgression'
                })
            );
        });

        test('ヘルパーメソッドが正しく動作する', () => {
            // calculateAverageIncrease
            const values = [100, 150, 200, 300];
            const avgIncrease = alertSystem.calculateAverageIncrease(values;
            expect(avgIncrease).toBeCloseTo(66.67, 1);

            // analyzeActionPatterns - より繰り返しが多いパターンを作成
            const actions = Array(20).fill(['A', 'B', 'C']).flat(); // 同じパターンを20回繰り返し
            const patterns = alertSystem.analyzeActionPatterns(actions;
            expect(patterns.repetitiveScore).toBeGreaterThan(0);

            // getSeverityColor
            expect(alertSystem.getSeverityColor('error')).toBe('#f44336');
            expect(alertSystem.getSeverityColor('unknown')).toBe('#666');
        });

        test('設定が更新される', () => {
            const newOptions = {
                enableDeveloperAlerts: false,
                maxAlertsPerHour: 5
            };

            alertSystem.updateOptions(newOptions;

            expect(alertSystem.options.enableDeveloperAlerts).toBe(false);
            expect(alertSystem.options.maxAlertsPerHour).toBe(5);
        });

        test('リソースが正しく解放される', () => {
            expect(alertSystem.alertHistory.length).toBeGreaterThanOrEqual(0);
            expect(alertSystem.alertCallbacks.size).toBeGreaterThanOrEqual(0);

            alertSystem.destroy();

            expect(alertSystem.alertHistory).toEqual([]);
            expect(alertSystem.alertCallbacks.size).toBe(0);
            expect(alertSystem.rateLimitCounter.size).toBe(0);
        });

        test('イベントリスナーが正しく動作する', () => {
            const analyzeDataSpy = jest.spyOn(alertSystem, 'analyzeData').mockImplementation(() => {});
            const handlePerformanceWarningSpy = jest.spyOn(alertSystem, 'handlePerformanceWarning').mockImplementation(() => {});
            const handleErrorEventSpy = jest.spyOn(alertSystem, 'handleErrorEvent').mockImplementation(() => {});

            // イベントを発火
            window.dispatchEvent(new CustomEvent('analytics-data-updated', { 
                detail: { test: 'data' } 
            }));
            
            window.dispatchEvent(new CustomEvent('performance-warning', { 
                detail: { severity: 'warning', message: 'test warning' } 
            }));
            
            window.dispatchEvent(new CustomEvent('error-notification-displayed', { 
                detail: { severity: 'error', message: 'test error' } 
            }));

            expect(analyzeDataSpy).toHaveBeenCalledWith({ test: 'data' });
            expect(handlePerformanceWarningSpy).toHaveBeenCalledWith({ severity: 'warning', message: 'test warning' });
            expect(handleErrorEventSpy).toHaveBeenCalledWith({ severity: 'error', message: 'test error' });
        });

        test('メール本文が正しくフォーマットされる', () => {
            const alert = {
                category: 'performance',
                severity: 'error',
                message: 'テストアラート',
                timestamp: Date.now(),
                data: { test: 'value' },
                recommendations: ['アクション1', 'アクション2']
            };

            const emailBody = alertSystem.formatEmailBody(alert);

            expect(emailBody).toContain('開発者アラート通知');
            expect(emailBody).toContain('パフォーマンス問題');
            expect(emailBody).toContain('テストアラート');
            expect(emailBody).toContain('error');
            expect(emailBody).toContain('アクション1');
            expect(emailBody).toContain('アクション2');
        });

        test('アラートIDが正しく生成される', () => {
            const id1 = alertSystem.generateAlertId();
            const id2 = alertSystem.generateAlertId();

            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^alert_\d+_[a-z0-9]+$/);
        });
    });
});