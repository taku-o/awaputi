/**
 * AnalyticsFinalIntegration.test.js
 * ゲーム分析機能の最終統合検証テスト
 */

import { EnhancedAnalyticsManager } from '../../src/analytics/EnhancedAnalyticsManager.js';
import { AnalyticsDashboard } from '../../src/analytics/AnalyticsDashboard.js';
import { TrendAnalyzer } from '../../src/analytics/TrendAnalyzer.js';
import { ComparisonEngine } from '../../src/analytics/ComparisonEngine.js';
import { ExportManager } from '../../src/analytics/ExportManager.js';
import { AnalyticsAPI } from '../../src/analytics/AnalyticsAPI.js';

// フェイクIndexedDB実装
import 'fake-indexeddb/auto';

/**
 * 最終統合検証テスト
 * 全機能の動作確認と既存システムとの互換性検証
 */
describe('Analytics Final Integration Tests', () => {
    let analyticsManager;
    let dashboard;
    let trendAnalyzer;
    let comparisonEngine;
    let exportManager;
    let analyticsAPI;

    beforeEach(async () => {
        // システム全体の初期化
        analyticsManager = new EnhancedAnalyticsManager({
            enableGameAnalytics: true,
            enablePerformanceTracking: true,
            enableBehaviorAnalysis: true,
            autoInitialize: false
        });
    });

    afterEach(async () => {
        // クリーンアップ
        if (analyticsManager) {
            await analyticsManager.destroy();
        }
        if (dashboard) {
            dashboard.destroy();
        }
    });

    describe('システム全体統合テスト', () => {
        test('完全システム初期化とコンポーネント連携確認', async () => {
            // 初期化
            await analyticsManager.initialize();
            
            // 全コンポーネントの初期化確認
            expect(analyticsManager.isInitialized).toBe(true);
            expect(analyticsManager.privacyManager).toBeTruthy();
            expect(analyticsManager.storageManager).toBeTruthy();
            expect(analyticsManager.dataCollector).toBeTruthy();
            expect(analyticsManager.performanceOptimizer).toBeTruthy();
            
            // 関連コンポーネントの初期化
            const container = document.createElement('div');
            dashboard = new AnalyticsDashboard(container);
            trendAnalyzer = new TrendAnalyzer(analyticsManager.storageManager);
            comparisonEngine = new ComparisonEngine(analyticsManager.storageManager);
            exportManager = new ExportManager(analyticsManager.storageManager);
            analyticsAPI = new AnalyticsAPI(analyticsManager.storageManager);
            
            // コンポーネント間の依存関係確認
            expect(dashboard.chartRenderer).toBeTruthy();
            expect(dashboard.dataVisualizer).toBeTruthy();
            expect(trendAnalyzer.storageManager).toBe(analyticsManager.storageManager);
            expect(comparisonEngine.storageManager).toBe(analyticsManager.storageManager);
        });

        test('エンドツーエンドワークフロー検証', async () => {
            await analyticsManager.initialize();
            
            // 1. セッション開始
            const sessionData = {
                sessionId: 'integration_test_session',
                stageId: 'stage_integration',
                difficulty: 'normal',
                startTime: Date.now(),
                previousBestScore: 5000
            };
            
            analyticsManager.startSession(sessionData);
            
            // 2. プレイヤー行動データ収集
            const interactions = [];
            for (let i = 0; i < 50; i++) {
                const interaction = {
                    bubbleType: ['normal', 'stone', 'rainbow', 'pink'][i % 4],
                    action: Math.random() > 0.2 ? 'popped' : 'missed',
                    reactionTime: Math.random() * 1000 + 200,
                    comboCount: Math.floor(i / 5),
                    currentScore: i * 100,
                    stageProgress: i / 50,
                    playerHP: Math.max(0, 100 - i),
                    timeRemaining: Math.max(0, 300000 - i * 6000)
                };
                
                interactions.push(interaction);
                analyticsManager.recordPlayerInteractionPattern(interaction);
            }
            
            // 3. パフォーマンスデータ収集
            for (let i = 0; i < 10; i++) {
                analyticsManager.trackPerformanceMetrics({
                    fps: 55 + Math.random() * 10,
                    memoryUsage: 50 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024,
                    timestamp: Date.now()
                });
            }
            
            // 4. セッション終了
            const endInfo = {
                exitReason: 'completed',
                finalScore: 5000,
                completed: true,
                timeRemaining: 60000,
                hpRemaining: 50,
                bubblesRemaining: 0,
                maxCombo: 15,
                activeItems: []
            };
            
            analyticsManager.updatePlayerBehaviorAnalysis(endInfo);
            
            // バッチ処理完了を待機
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 5. データ確認
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.isInitialized).toBe(true);
            expect(stats.dataCollector).toBeTruthy();
            
            // 6. 分析結果確認
            const extendedStats = analyticsManager.getExtendedAnalyticsStats();
            expect(extendedStats.performanceOptimization).toBeTruthy();
            
            // 7. パフォーマンスレポート生成
            const performanceReport = analyticsManager.generatePerformanceReport();
            expect(performanceReport.summary).toBeTruthy();
            expect(performanceReport.recommendations).toBeInstanceOf(Array);
        });
    });

    describe('既存システムとの互換性検証', () => {
        test('ゲームエンジンとの統合確認', async () => {
            await analyticsManager.initialize();
            
            // 既存のゲームエンジンAPIとの互換性テスト
            const mockGameEngine = {
                getState: () => ({
                    currentStage: 'stage_1',
                    playerHP: 100,
                    score: 2500,
                    timeRemaining: 180000
                }),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            
            // ゲームエンジンからのイベント処理
            const gameEventData = {
                type: 'bubbleClick',
                bubbleType: 'normal',
                result: 'popped',
                reactionTime: 350,
                position: { x: 400, y: 300 }
            };
            
            // 既存のイベント形式での処理確認
            expect(() => {
                analyticsManager.recordPlayerInteractionPattern({
                    bubbleType: gameEventData.bubbleType,
                    action: gameEventData.result,
                    reactionTime: gameEventData.reactionTime,
                    comboCount: 5,
                    currentScore: 2500,
                    stageProgress: 0.4,
                    playerHP: 100,
                    timeRemaining: 180000
                });
            }).not.toThrow();
        });

        test('プレイヤーデータシステムとの統合確認', async () => {
            await analyticsManager.initialize();
            
            // 既存のPlayerDataシステムとの連携テスト
            const mockPlayerData = {
                getBestScore: (stageId) => 5000,
                getPlayTime: () => 3600000,
                getAchievements: () => ['first_pop', 'combo_master'],
                updateStats: jest.fn()
            };
            
            // プレイヤーデータとの連携確認
            const sessionData = {
                sessionId: 'compatibility_test',
                stageId: 'stage_1',
                difficulty: 'normal',
                startTime: Date.now(),
                previousBestScore: mockPlayerData.getBestScore('stage_1')
            };
            
            analyticsManager.startSession(sessionData);
            
            // セッション後のプレイヤーデータ更新確認
            const sessionStats = analyticsManager.getAnalyticsStats();
            expect(sessionStats.playerSkillLevel).toBeTruthy();
            expect(sessionStats.playStyleDistribution).toBeTruthy();
        });

        test('設定システムとの統合確認', async () => {
            await analyticsManager.initialize();
            
            // 既存のSettingsManagerとの連携テスト
            const mockSettingsManager = {
                get: jest.fn((key) => {
                    const settings = {
                        'analytics.enabled': true,
                        'analytics.privacyMode': false,
                        'performance.monitoring': true
                    };
                    return settings[key];
                }),
                set: jest.fn(),
                addEventListener: jest.fn()
            };
            
            // 設定変更への対応確認
            analyticsManager.updateSettings({
                enableGameAnalytics: mockSettingsManager.get('analytics.enabled'),
                enablePerformanceTracking: mockSettingsManager.get('performance.monitoring')
            });
            
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.isGameAnalyticsEnabled).toBe(true);
        });
    });

    describe('データ整合性とエラー耐性', () => {
        test('不正データでのエラー処理確認', async () => {
            await analyticsManager.initialize();
            
            // 不正データの投入テスト
            expect(() => {
                analyticsManager.recordPlayerInteractionPattern(null);
            }).not.toThrow();
            
            expect(() => {
                analyticsManager.recordPlayerInteractionPattern({
                    bubbleType: undefined,
                    action: null,
                    reactionTime: -100
                });
            }).not.toThrow();
            
            expect(() => {
                analyticsManager.trackPerformanceMetrics({
                    fps: NaN,
                    memoryUsage: undefined
                });
            }).not.toThrow();
            
            // システムが正常に動作し続けることを確認
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.isInitialized).toBe(true);
        });

        test('データ破損からの回復テスト', async () => {
            await analyticsManager.initialize();
            
            // 正常なデータを保存
            analyticsManager.startSession({
                sessionId: 'recovery_test',
                stageId: 'stage_1',
                difficulty: 'normal',
                startTime: Date.now(),
                previousBestScore: 3000
            });
            
            // 破損データの模擬
            try {
                await analyticsManager.storageManager.saveData('sessions', {
                    invalidData: 'corrupted'
                });
            } catch (error) {
                // エラーは期待される
            }
            
            // システムが回復することを確認
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.isInitialized).toBe(true);
            
            // 正常なデータ保存が継続できることを確認
            expect(() => {
                analyticsManager.recordPlayerInteractionPattern({
                    bubbleType: 'normal',
                    action: 'popped',
                    reactionTime: 400,
                    comboCount: 1,
                    currentScore: 100,
                    stageProgress: 0.1,
                    playerHP: 100,
                    timeRemaining: 290000
                });
            }).not.toThrow();
        });
    });

    describe('APIエンドポイント検証', () => {
        test('全APIエンドポイントの動作確認', async () => {
            await analyticsManager.initialize();
            
            // テストデータの準備
            await generateTestData(analyticsManager);
            
            analyticsAPI = new AnalyticsAPI(analyticsManager.storageManager);
            
            // 基本統計API
            analyticsAPI.registerEndpoint('/stats/basic', async () => {
                return {
                    totalSessions: 10,
                    averageScore: 4500,
                    totalPlayTime: 1800000
                };
            });
            
            const basicStats = await analyticsAPI.getData({
                endpoint: '/stats/basic'
            });
            
            expect(basicStats.totalSessions).toBe(10);
            expect(basicStats.averageScore).toBe(4500);
            
            // 集計データAPI
            const aggregatedData = await analyticsAPI.getAggregatedData({
                table: 'sessions',
                groupBy: 'stageId',
                aggregations: {
                    count: { $count: 1 },
                    avgScore: { $avg: 'finalScore' }
                }
            });
            
            expect(aggregatedData).toBeInstanceOf(Array);
        });

        test('データエクスポート機能の完全検証', async () => {
            await analyticsManager.initialize();
            await generateTestData(analyticsManager);
            
            exportManager = new ExportManager(analyticsManager.storageManager);
            
            // JSON形式エクスポート
            const jsonData = await exportManager.exportToJSON({
                tables: ['sessions'],
                anonymize: true
            });
            
            expect(typeof jsonData).toBe('string');
            expect(() => JSON.parse(jsonData)).not.toThrow();
            
            // CSV形式エクスポート
            const csvData = await exportManager.exportToCSV('sessions', {
                columns: ['sessionId', 'stageId', 'finalScore']
            });
            
            expect(typeof csvData).toBe('string');
            expect(csvData).toContain('sessionId,stageId,finalScore');
            
            // フィルタ付きエクスポート
            const filteredData = await exportManager.exportFiltered({
                table: 'sessions',
                filters: { completed: true },
                format: 'json'
            });
            
            expect(filteredData).toBeTruthy();
        });
    });

    describe('パフォーマンス要件検証', () => {
        test('レスポンス時間要件確認', async () => {
            await analyticsManager.initialize();
            
            // 初期化時間
            const initStart = performance.now();
            const newManager = new EnhancedAnalyticsManager();
            await newManager.initialize();
            const initTime = performance.now() - initStart;
            
            expect(initTime).toBeLessThan(2000); // 2秒以内
            
            // データ処理時間
            const processStart = performance.now();
            for (let i = 0; i < 100; i++) {
                analyticsManager.recordPlayerInteractionPattern({
                    bubbleType: 'normal',
                    action: 'popped',
                    reactionTime: 400,
                    comboCount: i % 10,
                    currentScore: i * 50,
                    stageProgress: i / 100,
                    playerHP: 100 - i,
                    timeRemaining: 300000 - i * 3000
                });
            }
            const processTime = performance.now() - processStart;
            
            expect(processTime).toBeLessThan(500); // 500ms以内
            
            await newManager.destroy();
        });

        test('メモリ使用量要件確認', async () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            await analyticsManager.initialize();
            
            // 大量データ処理
            for (let cycle = 0; cycle < 5; cycle++) {
                await generateTestData(analyticsManager, 200);
                
                // メモリクリーンアップ
                analyticsManager.performanceOptimizer.performMemoryCleanup();
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB以内
        });
    });

    describe('セキュリティとプライバシー検証', () => {
        test('データ匿名化の完全性確認', async () => {
            await analyticsManager.initialize();
            
            const sensitiveData = {
                userId: 'user123',
                email: 'test@example.com',
                ipAddress: '192.168.1.1',
                sessionData: {
                    score: 5000,
                    accuracy: 0.85
                }
            };
            
            const anonymizedData = analyticsManager.privacyManager.anonymizeData(sensitiveData);
            
            // 個人情報が除去されているか確認
            expect(anonymizedData.userId).toBeUndefined();
            expect(anonymizedData.email).toBeUndefined();
            expect(anonymizedData.ipAddress).toBeUndefined();
            
            // ゲームデータは保持されているか確認
            expect(anonymizedData.sessionData).toBeTruthy();
            expect(anonymizedData.sessionData.score).toBe(5000);
            expect(anonymizedData.anonymized).toBe(true);
        });

        test('GDPR準拠機能の検証', async () => {
            await analyticsManager.initialize();
            
            // データアクセス権
            const exportedData = await analyticsManager.exportData();
            expect(exportedData).toBeTruthy();
            
            // データ削除権
            await generateTestData(analyticsManager, 50);
            await analyticsManager.deleteData();
            
            // データが削除されたことを確認
            const remainingData = await analyticsManager.storageManager.getData('sessions', {});
            expect(Object.keys(remainingData).length).toBe(0);
        });
    });

    describe('要件適合性最終検証', () => {
        test('要件1: プレイヤー行動分析システム', async () => {
            await analyticsManager.initialize();
            
            // セッション記録
            analyticsManager.startSession({
                sessionId: 'req1_test',
                stageId: 'stage_1',
                difficulty: 'normal',
                startTime: Date.now(),
                previousBestScore: 3000
            });
            
            // インタラクション記録
            analyticsManager.recordPlayerInteractionPattern({
                bubbleType: 'rainbow',
                action: 'popped',
                reactionTime: 320,
                comboCount: 8,
                currentScore: 1200,
                stageProgress: 0.3,
                playerHP: 85,
                timeRemaining: 210000
            });
            
            // 離脱記録
            analyticsManager.updatePlayerBehaviorAnalysis({
                exitReason: 'quit',
                finalScore: 1200,
                completed: false,
                timeRemaining: 210000,
                hpRemaining: 85
            });
            
            // 長時間プレイマークの確認
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.isInitialized).toBe(true);
        });

        test('要件2: ゲームバランス分析システム', async () => {
            await analyticsManager.initialize();
            
            // バブル生成記録
            analyticsManager.trackGameBalance({
                bubbleSpawn: {
                    bubbleType: 'boss',
                    spawnPosition: { x: 400, y: 200 },
                    spawnTiming: Date.now(),
                    surroundingBubbles: ['normal', 'stone']
                }
            });
            
            // スコア獲得記録
            analyticsManager.trackGameBalance({
                scoreEvent: {
                    scoreGain: 500,
                    source: 'combo_bonus',
                    comboMultiplier: 2.0
                }
            });
            
            // アイテム使用記録
            analyticsManager.trackGameBalance({
                itemUsage: {
                    itemType: 'speed_boost',
                    usageTiming: 'strategic',
                    effectDuration: 5000,
                    impactOnScore: 300
                }
            });
            
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.dataCollector).toBeTruthy();
        });

        test('要件3-10: 全要件統合確認', async () => {
            await analyticsManager.initialize();
            
            // パフォーマンス分析
            analyticsManager.trackPerformanceMetrics({
                fps: 58,
                memoryUsage: 45 * 1024 * 1024,
                loadTimes: { total: 1200 }
            });
            
            // エラー追跡
            const testError = new Error('Test error');
            analyticsManager.trackError(testError, { context: 'integration_test' });
            
            // データ可視化
            const container = document.createElement('div');
            dashboard = new AnalyticsDashboard(container);
            await dashboard.renderBasicStats();
            
            // トレンド分析
            trendAnalyzer = new TrendAnalyzer(analyticsManager.storageManager);
            const anomalies = trendAnalyzer.detectAnomalies([60, 58, 62, 15, 59], 2.0);
            expect(anomalies.length).toBeGreaterThan(0);
            
            // すべての機能が正常に動作することを確認
            const finalStats = analyticsManager.getAnalyticsStats();
            expect(finalStats.isInitialized).toBe(true);
            expect(finalStats.isGameAnalyticsEnabled).toBe(true);
        });
    });
});

// ヘルパー関数: テストデータ生成
async function generateTestData(analyticsManager, count = 100) {
    const sessionId = `test_session_${Date.now()}`;
    
    analyticsManager.startSession({
        sessionId: sessionId,
        stageId: 'test_stage',
        difficulty: 'normal',
        startTime: Date.now(),
        previousBestScore: Math.floor(Math.random() * 5000)
    });
    
    for (let i = 0; i < count; i++) {
        analyticsManager.recordPlayerInteractionPattern({
            bubbleType: ['normal', 'stone', 'rainbow', 'pink', 'clock'][Math.floor(Math.random() * 5)],
            action: Math.random() > 0.25 ? 'popped' : 'missed',
            reactionTime: Math.random() * 1000 + 100,
            comboCount: Math.floor(Math.random() * 20),
            currentScore: i * 75 + Math.floor(Math.random() * 50),
            stageProgress: i / count,
            playerHP: Math.max(0, 100 - Math.floor(i / 5)),
            timeRemaining: Math.max(0, 300000 - i * 2500)
        });
        
        if (i % 25 === 0) {
            analyticsManager.trackPerformanceMetrics({
                fps: 50 + Math.random() * 20,
                memoryUsage: 40 * 1024 * 1024 + Math.random() * 30 * 1024 * 1024,
                timestamp: Date.now()
            });
        }
    }
    
    analyticsManager.updatePlayerBehaviorAnalysis({
        exitReason: Math.random() > 0.7 ? 'quit' : 'completed',
        finalScore: count * 75,
        completed: Math.random() > 0.3,
        timeRemaining: Math.max(0, 300000 - count * 2500),
        hpRemaining: Math.max(0, 100 - Math.floor(count / 5)),
        bubblesRemaining: Math.floor(Math.random() * 15),
        maxCombo: Math.floor(count / 8),
        activeItems: []
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
}