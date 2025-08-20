import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
/**
 * AnalyticsSystemPerformance.test.js
 * ゲーム分析システム全体の統合パフォーマンステスト
 */

import { EnhancedAnalyticsManager } from '../../src/analytics/EnhancedAnalyticsManager';
import { AnalyticsDashboard } from '../../src/analytics/AnalyticsDashboard';
import { TrendAnalyzer } from '../../src/analytics/TrendAnalyzer';
import { ComparisonEngine } from '../../src/analytics/ComparisonEngine';

// フェイクIndexedDB実装
import 'fake-indexeddb/auto';

// 統合パフォーマンステスト
describe('Analytics System Integration Performance Tests', () => {
    let analyticsManager: any;
    let dashboard: any;
    let trendAnalyzer: any;
    let comparisonEngine: any;
    
    const INTEGRATION_THRESHOLDS = {
        // 初期化時間
        INITIALIZATION_TIME: 2000,     // < 2秒
        
        // エンドツーエンド処理時間
        DATA_FLOW_TIME: 1000,          // データ収集→保存→表示: < 1秒
        DASHBOARD_RENDER_TIME: 500,    // ダッシュボード描画: < 500ms
        TREND_ANALYSIS_TIME: 800,      // トレンド分析: < 800ms
        COMPARISON_TIME: 600,          // 比較分析: < 600ms
        
        // 同時処理性能
        CONCURRENT_SESSIONS: 10,       // 10セッション同時処理
        CONCURRENT_PROCESSING_TIME: 3000, // < 3秒
        
        // メモリ効率
        SYSTEM_MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB
        MEMORY_LEAK_THRESHOLD: 20 * 1024 * 1024  // 20MB
    };

    beforeEach(async () => {
        // システム全体の初期化
        analyticsManager = new EnhancedAnalyticsManager({
            enableGameAnalytics: true,
            enablePerformanceTracking: true,
            enableBehaviorAnalysis: true,
            autoInitialize: false,
            performanceOptimization: {
                batchSize: 20,
                batchTimeout: 1000,
                cacheSize: 500
            }
        });
    });

    afterEach(async () => {
        if (analyticsManager) {
            await analyticsManager.destroy();
        }
        if (dashboard) {
            dashboard.destroy();
        }
    });

    describe('システム初期化性能', () => {
        test('完全初期化時間', async () => {
            const startTime = performance.now();
            
            await analyticsManager.initialize();
            
            // ダッシュボードとアナライザーも初期化
            dashboard = new AnalyticsDashboard(document.createElement('div'));
            trendAnalyzer = new TrendAnalyzer(analyticsManager.storageManager);
            comparisonEngine = new ComparisonEngine(analyticsManager.storageManager);
            
            const endTime = performance.now();
            const initializationTime = endTime - startTime;
            
            expect(initializationTime.toBeLessThan(INTEGRATION_THRESHOLDS.INITIALIZATION_TIME);
            expect(analyticsManager.isInitialized).toBe(true);
            expect(analyticsManager.isGameAnalyticsEnabled).toBe(true);
        });

        test('コンポーネント間接続確認', async () => {
            await analyticsManager.initialize();
            
            // すべてのコンポーネントが正しく初期化されているか確認
            expect(analyticsManager.privacyManager).toBeTruthy();
            expect(analyticsManager.storageManager).toBeTruthy();
            expect(analyticsManager.dataCollector).toBeTruthy();
            expect(analyticsManager.performanceOptimizer).toBeTruthy();
            
            // コンポーネント間の依存関係確認
            expect(analyticsManager.dataCollector.privacyManager).toBe(analyticsManager.privacyManager);
            expect(analyticsManager.dataCollector.storageManager).toBe(analyticsManager.storageManager);
        });
    });

    describe('エンドツーエンドデータフロー性能', () => {
        test('データ収集→保存→取得フロー', async () => {
            await analyticsManager.initialize();
            
            const startTime = performance.now();
            
            // プレイヤー行動データの生成と送信
            const sessionData = {
                sessionId: 'perf_test_session',
                stageId: 'stage_1',
                difficulty: 'normal',
                startTime: Date.now(),
                previousBestScore: 5000
            };
            
            analyticsManager.startSession(sessionData;
            
            // 複数のプレイヤー行動を記録
            for (let i = 0; i < 50; i++) {
                analyticsManager.recordPlayerInteractionPattern({
                    bubbleType: 'normal',
                    action: 'popped',
                    reactionTime: Math.random() * 1000,
                    comboCount: i % 10,
                    currentScore: i * 100,
                    stageProgress: i / 50,
                    playerHP: 100 - i,
                    timeRemaining: 300000 - i * 1000
                });
                
                // 一部でパフォーマンスデータも記録
                if (i % 10 === 0) {
                    analyticsManager.trackPerformanceMetrics({
                        fps: 60 - Math.random() * 10,
                        memoryUsage: 50 * 1024 * 1024 + Math.random() * 10 * 1024 * 1024,
                        loadTime: Math.random() * 100
                    });
                }
            }
            
            // セッション終了
            analyticsManager.updatePlayerBehaviorAnalysis({
                exitReason: 'completed',
                finalScore: 5000,
                completed: true,
                timeRemaining: 60000,
                hpRemaining: 50,
                bubblesRemaining: 0,
                maxCombo: 15,
                activeItems: []
            });
            
            // バッチ処理の完了を待機
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // データ取得の確認
            const stats = analyticsManager.getAnalyticsStats();
            
            const endTime = performance.now();
            const dataFlowTime = endTime - startTime;
            
            expect(dataFlowTime.toBeLessThan(INTEGRATION_THRESHOLDS.DATA_FLOW_TIME);
            expect(stats.isInitialized).toBe(true);
            expect(stats.dataCollector).toBeTruthy();
        });

        test('リアルタイム分析パイプライン', async () => {
            await analyticsManager.initialize();
            
            const startTime = performance.now();
            
            // リアルタイム監視を開始
            analyticsManager.startPerformanceMonitoring();
            
            // 継続的なデータストリームをシミュレート
            const dataPoints = 100;
            const dataInterval = 10; // 10ms間隔
            
            for (let i = 0; i < dataPoints; i++) {
                // パフォーマンスデータの送信
                analyticsManager.trackPerformanceMetrics({
                    fps: 55 + Math.sin(i * 0.1) * 5,
                    memoryUsage: 60 * 1024 * 1024 + Math.sin(i * 0.05) * 10 * 1024 * 1024,
                    timestamp: Date.now()
                });
                
                await new Promise(resolve => setTimeout(resolve, dataInterval));
            }
            
            const endTime = performance.now();
            const pipelineTime = endTime - startTime;
            
            expect(pipelineTime.toBeLessThan(INTEGRATION_THRESHOLDS.DATA_FLOW_TIME + dataPoints * dataInterval);
            
            // リアルタイム統計の確認
            const optimizationStats = analyticsManager.getPerformanceOptimizationStats();
            expect(optimizationStats.batchesProcessed).toBeGreaterThan(0);
        });
    });

    describe('ダッシュボード描画性能', () => {
        test('基本統計ダッシュボード描画', async () => {
            await analyticsManager.initialize();
            
            // テストデータの準備
            await generateTestData(analyticsManager, 100);
            
            // ダッシュボードの初期化
            const container = document.createElement('div');
            dashboard = new AnalyticsDashboard(container;
            
            const startTime = performance.now();
            
            // 基本統計の描画
            await dashboard.renderBasicStats();
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            expect(renderTime.toBeLessThan(INTEGRATION_THRESHOLDS.DASHBOARD_RENDER_TIME);
            
            // 描画されたコンテンツの確認
            const statsElements = container.querySelectorAll('[data-stat]');
            expect(statsElements.length).toBeGreaterThan(0);
        });

        test('複雑な可視化の描画性能', async () => {
            await analyticsManager.initialize();
            await generateTestData(analyticsManager, 500);
            
            const container = document.createElement('div');
            dashboard = new AnalyticsDashboard(container;
            
            const startTime = performance.now();
            
            // 複数の可視化を同時に描画
            await Promise.all([
                dashboard.renderBasicStats(),
                dashboard.renderBubbleAnalysis(),
                dashboard.renderPerformanceCharts()
            ]);
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            expect(renderTime.toBeLessThan(INTEGRATION_THRESHOLDS.DASHBOARD_RENDER_TIME * 2);
        });
    });

    describe('分析エンジン性能', () => {
        test('トレンド分析性能', async () => {
            await analyticsManager.initialize();
            await generateTestData(analyticsManager, 1000);
            
            trendAnalyzer = new TrendAnalyzer(analyticsManager.storageManager);
            
            const startTime = performance.now();
            
            // 週次トレンド分析
            const weeklyTrend = await trendAnalyzer.analyzeWeeklyTrend('score', Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            // 異常パターン検出
            const anomalies = trendAnalyzer.detectAnomalies([60, 58, 62, 15, 59, 61], 2.0);
            
            const endTime = performance.now();
            const analysisTime = endTime - startTime;
            
            expect(analysisTime.toBeLessThan(INTEGRATION_THRESHOLDS.TREND_ANALYSIS_TIME);
            expect(weeklyTrend.toBeTruthy();
            expect(anomalies.length).toBeGreaterThan(0);
        });

        test('比較分析性能', async () => {
            await analyticsManager.initialize();
            await generateTestData(analyticsManager, 800);
            
            comparisonEngine = new ComparisonEngine(analyticsManager.storageManager);
            
            const startTime = performance.now();
            
            // 過去データとの比較
            const comparison = await comparisonEngine.compareWithPast(
                { score: 5000, accuracy: 0.85, playTime: 300 },
                'week'
            );
            
            // ベンチマーク比較
            const benchmarkComparison = await comparisonEngine.compareWithBenchmark(
                { score: 5000, accuracy: 0.85 },
                'global'
            );
            
            const endTime = performance.now();
            const comparisonTime = endTime - startTime;
            
            expect(comparisonTime.toBeLessThan(INTEGRATION_THRESHOLDS.COMPARISON_TIME);
            expect(comparison.toBeTruthy();
            expect(benchmarkComparison.toBeTruthy();
        });
    });

    describe('同時処理性能', () => {
        test('複数セッション同時処理', async () => {
            await analyticsManager.initialize();
            
            const startTime = performance.now();
            const concurrentSessions: any[] = [];
            
            // 複数セッションの同時実行
            for (let sessionId = 0; sessionId < INTEGRATION_THRESHOLDS.CONCURRENT_SESSIONS; sessionId++) {
                const sessionPromise = simulateGameSession(analyticsManager, `session_${sessionId}`, 50);
                concurrentSessions.push(sessionPromise;
            }
            
            await Promise.all(concurrentSessions;
            
            const endTime = performance.now();
            const concurrentTime = endTime - startTime;
            
            expect(concurrentTime.toBeLessThan(INTEGRATION_THRESHOLDS.CONCURRENT_PROCESSING_TIME);
            
            // すべてのセッションが正常に処理されたか確認
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.dataCollector).toBeTruthy();
        });
    });

    describe('メモリ効率性', () => {
        test('システム全体メモリ使用量', async () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            await analyticsManager.initialize();
            
            // 大量のデータ処理
            await generateTestData(analyticsManager, 2000);
            
            // ダッシュボードとアナライザーの初期化
            const container = document.createElement('div');
            dashboard = new AnalyticsDashboard(container;
            trendAnalyzer = new TrendAnalyzer(analyticsManager.storageManager);
            comparisonEngine = new ComparisonEngine(analyticsManager.storageManager);
            
            await dashboard.renderBasicStats();
            
            const peakMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryUsage = peakMemory - initialMemory;
            
            expect(memoryUsage.toBeLessThan(INTEGRATION_THRESHOLDS.SYSTEM_MEMORY_LIMIT);
        });

        test('長時間実行メモリリーク検出', async () => {
            await analyticsManager.initialize();
            
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // 長時間実行のシミュレーション
            for (let cycle = 0; cycle < 10; cycle++) {
                await generateTestData(analyticsManager, 200);
                
                // 定期的なクリーンアップ
                if (cycle % 3 === 0) {
                    await analyticsManager.performanceOptimizer.performMemoryCleanup();
                }
                
                // 少し待機
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryLeak = finalMemory - initialMemory;
            
            expect(memoryLeak.toBeLessThan(INTEGRATION_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
        });
    });

    describe('エラー耐性と回復性能', () => {
        test('部分的障害からの回復', async () => {
            await analyticsManager.initialize();
            
            const startTime = performance.now();
            
            // 正常データ
            await generateTestData(analyticsManager, 100);
            
            // 不正データの注入
            try {
                analyticsManager.trackPlayerBehavior(null, null);
                analyticsManager.trackGameBalance(undefined;
            } catch (error) {
                // エラーは期待される
            }
            
            // 正常データの続行
            await generateTestData(analyticsManager, 100);
            
            const endTime = performance.now();
            const recoveryTime = endTime - startTime;
            
            expect(recoveryTime.toBeLessThan(INTEGRATION_THRESHOLDS.DATA_FLOW_TIME * 2);
            
            // システムが正常に動作し続けることを確認
            const stats = analyticsManager.getAnalyticsStats();
            expect(stats.isInitialized).toBe(true);
        });
    });
});

// ヘルパー関数: テストデータ生成
async function generateTestData(analyticsManager, count) {
    const sessionId = `test_session_${Date.now()}`;
    
    analyticsManager.startSession({
        sessionId: sessionId,
        stageId: 'test_stage',
        difficulty: 'normal',
        startTime: Date.now(),
        previousBestScore: Math.floor(Math.random() * 10000)
    });
    
    for (let i = 0; i < count; i++) {
        analyticsManager.recordPlayerInteractionPattern({
            bubbleType: ['normal', 'stone', 'rainbow', 'pink'][Math.floor(Math.random() * 4)],
            action: Math.random() > 0.2 ? 'popped' : 'missed',
            reactionTime: Math.random() * 2000,
            comboCount: Math.floor(Math.random() * 20),
            currentScore: i * 100 + Math.floor(Math.random() * 50),
            stageProgress: i / count,
            playerHP: Math.max(0, 100 - Math.floor(i / 10)),
            timeRemaining: Math.max(0, 300000 - i * 1000)
        });
        
        // パフォーマンスデータも時々記録
        if (i % 20 === 0) {
            analyticsManager.trackPerformanceMetrics({
                fps: 50 + Math.random() * 20,
                memoryUsage: 50 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024,
                timestamp: Date.now()
            });
        }
    }
    
    // セッション終了
    analyticsManager.updatePlayerBehaviorAnalysis({
        exitReason: 'completed',
        finalScore: count * 100,
        completed: true,
        timeRemaining: Math.max(0, 300000 - count * 1000),
        hpRemaining: Math.max(0, 100 - Math.floor(count / 10)),
        bubblesRemaining: 0,
        maxCombo: Math.floor(count / 10),
        activeItems: []
    });
    
    // バッチ処理完了を待機
    await new Promise(resolve => setTimeout(resolve, 100));
}

// ヘルパー関数: ゲームセッションシミュレーション
async function simulateGameSession(analyticsManager, sessionId, interactionCount) {
    analyticsManager.startSession({
        sessionId: sessionId,
        stageId: `stage_${Math.floor(Math.random() * 5)}`,
        difficulty: ['easy', 'normal', 'hard'][Math.floor(Math.random() * 3)],
        startTime: Date.now(),
        previousBestScore: Math.floor(Math.random() * 10000)
    });
    
    for (let i = 0; i < interactionCount; i++) {
        analyticsManager.recordPlayerInteractionPattern({
            bubbleType: ['normal', 'stone', 'rainbow', 'pink', 'clock'][Math.floor(Math.random() * 5)],
            action: Math.random() > 0.3 ? 'popped' : 'missed',
            reactionTime: Math.random() * 1500 + 200,
            comboCount: Math.floor(Math.random() * 15),
            currentScore: i * 150 + Math.floor(Math.random() * 100),
            stageProgress: i / interactionCount,
            playerHP: Math.max(0, 100 - Math.floor(i / 8)),
            timeRemaining: Math.max(0, 300000 - i * 2000)
        });
        
        // 小さな遅延
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }
    
    analyticsManager.updatePlayerBehaviorAnalysis({
        exitReason: Math.random() > 0.8 ? 'quit' : 'completed',
        finalScore: interactionCount * 150,
        completed: Math.random() > 0.2,
        timeRemaining: Math.max(0, 300000 - interactionCount * 2000),
        hpRemaining: Math.max(0, 100 - Math.floor(interactionCount / 8)),
        bubblesRemaining: Math.floor(Math.random() * 10),
        maxCombo: Math.floor(interactionCount / 5),
        activeItems: []
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
}