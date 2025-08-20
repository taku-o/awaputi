/**
 * 統計システム統合テスト
 * StatisticsManager、StatisticsCollector、StatisticsAnalyzer、StatisticsVisualizerの統合テスト
 * データ収集から分析、可視化までの全フローテスト、他システムとの連携テスト
 */
import { jest } from '@jest/globals';
// モック対象のモジュール
const mockGameEngine = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getPerformanceMetrics: jest.fn().mockReturnValue({
        frameRate: 60,
        memoryUsage: { used: 1024 * 1024 * 50 });
};
const mockCanvas = {
    getContext: jest.fn().mockReturnValue({),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 100 ),
        createLinearGradient: jest.fn().mockReturnValue({),
            addColorStop: jest.fn(),
        }),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        clearRect: jest.fn(),
    }),
    width: 800,
    height: 600,
    addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
};
const mockPlayerData = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getPlayerStats: jest.fn().mockReturnValue({
        level: 10,
        totalGames: 50,
        totalScore: 125000),
    save: jest.fn().mockResolvedValue(true),
    load: jest.fn().mockResolvedValue(true);
const mockUserInfoScene = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    updateStatisticsDisplay: jest.fn(),
        refreshCharts: jest.fn(),
};
// 動的インポート用のモック
const createMockModule = (className, methods = {}) => ({
    [className]: jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        destroy: jest.fn(),
        ...methods
    })');
}
// テストデータ
const sampleGameplayEvent = {
    type: 'bubble_popped',
    timestamp: Date.now('),
    data: {
        bubbleType: 'normal',
        score: 100,
        combo: 5,
        position: { x: 400, y: 300 },
        sessionId: 'test-session-1'
    }
};
const sampleStatisticsData = {
    gamePlayStats: {
        totalGames: 25,
        totalPlayTime: 1800000, // 30分
        averageSessionTime: 360000, // 6分
        lastPlayTime: Date.now(') - 3600000 // 1時間前
    },
    scoreStats: {
        totalScore: 75000,
        highestScore: 5500,
        averageScore: 3000,
        scoreHistory: [2500, 3200, 4100, 5500, 4800]
    },
    bubbleStats: {
        totalPopped: 1250,
        accuracy: 0.85,
        bubbleTypeStats: new Map([
            ['normal', { count: 800, score: 40000 }],
            ['stone', { count: 200, score: 15000 }],
            ['rainbow', { count: 150, score: 15000 }],
            ['boss', { count: 100,
        score: 5000 }]
        ]
        )');
    },
    comboStats: {
        maxCombo: 25,
        averageCombo: 8.5,
        comboHistory: [5, 8, 12, 15, 25, 20, 18]
    },
    timeSeries: {
        daily: new Map([
            ['2024-01-01', { games: 5, score: 15000, playtime: 1800000 }],
            ['2024-01-02', { games: 8, score: 24000, playtime: 2400000 )]
        ]'),
        weekly: new Map([
            ['2024-W01', { games: 25, score: 75000, playtime: 9000000 )]
        ]'),
        monthly: new Map([
            ['2024-01', { games: 100, score: 300000,
        playtime: 36000000 }]
        ]
        )');
    }
};
describe('統計システム統合テスト', () => {
    let statisticsManager: any,
    let statisticsCollector: any,
    let statisticsAnalyzer: any,
    let statisticsVisualizer: any,
    let chartRenderer: any,
    let timeSeriesDataManager: any,
    let statisticsExporter: any,
    beforeAll(async (') => {
        // LocalStorageのモック
        Object.defineProperty(window, 'localStorage', {
            value: {),
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
        clear: jest.fn(),
            },
            writable: true
        }');
        // パフォーマンスAPIのモック
        Object.defineProperty(window, 'performance', {
            value: {),
                now: jest.fn(() => Date.now();
                memory: {
                    usedJSHeapSize: 1024 * 1024 * 50,
                    totalJSHeapSize: 1024 * 1024 * 100,
        jsHeapSizeLimit: 1024 * 1024 * 200
    })
            ),
            writable: true
    })');
        // 必要なクラスをインポート
        try {
            const StatisticsManagerModule = await import('../../src/core/StatisticsManager.js'');
            const StatisticsCollectorModule = await import('../../src/core/StatisticsCollector.js'');
            const StatisticsAnalyzerModule = await import('../../src/core/StatisticsAnalyzer.js'');
            const ChartRendererModule = await import('../../src/core/ChartRenderer.js'');
            const TimeSeriesDataManagerModule = await import('../../src/core/TimeSeriesDataManager.js'');
            const StatisticsExporterModule = await import('../../src/core/StatisticsExporter.js');
            // インスタンス作成
            statisticsManager = new StatisticsManagerModule.StatisticsManager(mockGameEngine);
            statisticsCollector = new StatisticsCollectorModule.StatisticsCollector(statisticsManager);
            statisticsAnalyzer = new StatisticsAnalyzerModule.StatisticsAnalyzer(statisticsManager);
            chartRenderer = new ChartRendererModule.ChartRenderer(mockCanvas);
            timeSeriesDataManager = new TimeSeriesDataManagerModule.TimeSeriesDataManager();
            statisticsExporter = new StatisticsExporterModule.StatisticsExporter(statisticsManager);
            // 統計データの初期化
            statisticsManager.statistics = JSON.parse(JSON.stringify(sampleStatisticsData);
        } catch (error') {
            console.error('Failed to import modules:', error);
        }
    });
    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.getItem.mockReturnValue(null);
        window.localStorage.setItem.mockImplementation(() => {});
    }
    afterAll(() => {
        // クリーンアップ
        statisticsManager? .destroy();
        statisticsCollector?.destroy();
        statisticsAnalyzer?.destroy();
        chartRenderer?.destroy();
        timeSeriesDataManager?.destroy();
        statisticsExporter?.destroy();
    }');
    describe('コンポーネント初期化テスト', (') => {
        test('全コンポーネントが正常に初期化される', () => {
            expect(statisticsManager.toBeDefined();
            expect(statisticsCollector.toBeDefined();
            expect(statisticsAnalyzer.toBeDefined();
            expect(chartRenderer.toBeDefined();
            expect(timeSeriesDataManager.toBeDefined();
            expect(statisticsExporter.toBeDefined();
        }');
        test('StatisticsManagerが統計データを持っている', () => {
            expect(statisticsManager.statistics).toBeDefined();
            expect(statisticsManager.statistics.gamePlayStats).toBeDefined();
            expect(statisticsManager.statistics.scoreStats).toBeDefined();
            expect(statisticsManager.statistics.bubbleStats).toBeDefined();
            expect(statisticsManager.statistics.comboStats).toBeDefined();
        }');
        test('コンポーネント間の依存関係が設定されている', () => {
            expect(statisticsCollector.statisticsManager).toBe(statisticsManager);
            expect(statisticsAnalyzer.statisticsManager).toBe(statisticsManager);
            expect(statisticsExporter.statisticsManager).toBe(statisticsManager);
        }');
    }
    describe('データ収集フローテスト', (') => {
        test('ゲームイベントから統計データ収集までの完全フロー', async () => {
            // 1. イベント受信
            await statisticsCollector.collectEvent(sampleGameplayEvent);
            // 2. バッチ処理の実行
            await statisticsCollector.processBatch();
            // 3. 統計の更新確認
            expect(statisticsManager.updateStatistics).toHaveBeenCalled();
            // 4. 時系列データの更新確認
            const currentStats = statisticsManager.getStatistics();
            expect(currentStats.bubbleStats.totalPopped).toBeGreaterThan(1250);
        }');
        test('複数イベントのバッチ処理', async (') => {
            const events = [ : undefined
                { ...sampleGameplayEvent, data: { ...sampleGameplayEvent.data, bubbleType: 'normal' } },
                { ...sampleGameplayEvent, data: { ...sampleGameplayEvent.data, bubbleType: 'stone' } },
                { ...sampleGameplayEvent, data: { ...sampleGameplayEvent.data, bubbleType: 'rainbow' } }
            ];
            // バッチでイベント収集
            for (const event of events) {
                await statisticsCollector.collectEvent(event);
            }
            // バッチ処理実行
            await statisticsCollector.processBatch();
            // 各泡タイプの統計が更新されることを確認
            const stats = statisticsManager.getStatistics();
            expect(stats.bubbleStats.bubbleTypeStats.size).toBeGreaterThanOrEqual(3);
        }');
        test('時系列データの自動更新', async (') => {
            const gameEndEvent = {
                type: 'game_ended',
                timestamp: Date.now(),
                data: {
                    finalScore: 4500,
                    playtime: 180000,
                    bubblesPopped: 85
                }
            };
            await statisticsCollector.collectEvent(gameEndEvent);
            await statisticsCollector.processBatch();
            // 時系列データの更新確認
            const timeSeries = statisticsManager.getTimeSeriesData();
            expect(timeSeries.daily.size).toBeGreaterThan(0);
        }');
    }
    describe('データ分析フローテスト', (') => {
        test('トレンド分析の実行', async () => {
            const trendAnalysis = await statisticsAnalyzer.analyzeTrends();
            expect(trendAnalysis.toBeDefined();
            expect(trendAnalysis.scoreTrend).toBeDefined();
            expect(trendAnalysis.accuracyTrend).toBeDefined();
            expect(trendAnalysis.playtimeTrend).toBeDefined();
            expect(typeof trendAnalysis.scoreTrend.slope').toBe('number');
        }');
        test('比較分析の実行', async () => {
            const comparison = await statisticsAnalyzer.comparePerformance({);
                startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1週間前
                endDate: Date.now(),
            expect(comparison.toBeDefined();
            expect(comparison.scoreComparison).toBeDefined();
            expect(comparison.accuracyComparison).toBeDefined();
            expect(typeof comparison.scoreComparison.percentageChange').toBe('number');
        }');
        test('洞察生成の実行', async () => {
            const insights = await statisticsAnalyzer.generateInsights();
            expect(insights.toBeDefined();
            expect(Array.isArray(insights.strengths).toBe(true);
            expect(Array.isArray(insights.improvements).toBe(true);
            expect(Array.isArray(insights.recommendations).toBe(true);
        }');
    }
    describe('データ可視化フローテスト', (') => {
        test('棒グラフの生成', async (') => {
            const chartData = {
                labels: ['Normal', 'Stone', 'Rainbow', 'Boss'],
                datasets: [{
                    label: 'Bubble Types',
                    data: [800, 200, 150, 100],
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
                }]
            };
            await chartRenderer.renderBarChart(chartData);
            const ctx = mockCanvas.getContext();
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();
        }');
        test('線グラフの生成', async (') => {
            const timeSeriesData = {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
                datasets: [{
                    label: 'Score Trend',
                    data: [2500, 3200, 4100, 5500, 4800],
                    borderColor: '#3498db',
                    fill: false
                }]
            };
            await chartRenderer.renderLineChart(timeSeriesData);
            const ctx = mockCanvas.getContext();
            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
        }');
        test('円グラフの生成', async (') => {
            const pieData = {
                labels: ['Normal', 'Special', 'Rare'],
                datasets: [{
                    data: [70, 25, 5],
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71']
                }]
            };
            await chartRenderer.renderPieChart(pieData);
            const ctx = mockCanvas.getContext();
            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.arc).toHaveBeenCalled();
            expect(ctx.fill).toHaveBeenCalled();
        }');
    }
    describe('データエクスポート・インポートフローテスト', (') => {
        test('JSON形式でのデータエクスポート', async (') => {
            const exportResult = await statisticsExporter.exportData('json');
            expect(exportResult.success).toBe(true);
            expect(exportResult.format').toBe('json');
            expect(typeof exportResult.data').toBe('string');
            const parsedData = JSON.parse(exportResult.data);
            expect(parsedData.gamePlayStats).toBeDefined();
            expect(parsedData.scoreStats).toBeDefined();
        }');
        test('CSV形式でのデータエクスポート', async (') => {
            const exportResult = await statisticsExporter.exportData('csv');
            expect(exportResult.success).toBe(true);
            expect(exportResult.format').toBe('csv');
            expect(typeof exportResult.data').toBe('string');
            expect(exportResult.data').toContain('totalGames');
            expect(exportResult.data').toContain('totalScore');
        }');
        test('エクスポートされたデータのインポート', async (') => {
            // エクスポート
            const exportResult = await statisticsExporter.exportData('json');
            // 統計データをクリア
            statisticsManager.statistics = statisticsManager.initializeStatistics(');
            // インポート
            const importResult = await statisticsExporter.importData(exportResult.data, 'json');
            expect(importResult.success).toBe(true);
            expect(statisticsManager.statistics.gamePlayStats.totalGames).toBe(25);
        }');
    }
    describe('他システムとの連携テスト', (') => {
        test('GameEngineとの連携', async (') => {
            // GameEngineからのイベント受信シミュレーション
            const gameEvent = {
                type: 'performance_update',
                data: mockGameEngine.getPerformanceMetrics(}
            };);
            await statisticsCollector.collectEvent(gameEvent);
            await statisticsCollector.processBatch();
            expect(mockGameEngine.getPerformanceMetrics).toHaveBeenCalled();
        }');
        test('PlayerDataとの連携', async () => {
            // PlayerDataからの統計情報取得
            const playerStats = mockPlayerData.getPlayerStats();
            // 統計データとの整合性確認
            expect(playerStats.totalGames).toBeGreaterThan(0);
            expect(playerStats.totalScore).toBeGreaterThan(0);
        }');
        test('UserInfoSceneとの連携', async (') => {
            // 統計更新イベントの発行
            statisticsManager.emit('statisticsUpdated', {);
                data: statisticsManager.getStatistics(});
            }
            // UserInfoSceneの更新確認
            expect(mockUserInfoScene.updateStatisticsDisplay).toHaveBeenCalled();
        }');
    }
    describe('エラーハンドリングと復旧テスト', (') => {
        test('データ破損からの復旧', async () => {
            // 破損データの設定
            statisticsManager.statistics = null;
            try {
                await statisticsManager.load();
            } catch (error) {
                // エラーハンドリングが機能することを確認
                expect(error.toBeDefined();
            }
            // 復旧処理の実行
            await statisticsManager.initializeStatistics();
            expect(statisticsManager.statistics).toBeDefined();
            expect(statisticsManager.statistics.gamePlayStats).toBeDefined();
        }');
        test('ストレージエラーからの復旧', async () => {
            // LocalStorageエラーのシミュレーション
            window.localStorage.setItem.mockImplementation((') => {
                throw new Error('Storage quota exceeded');
            });
            const saveResult = await statisticsManager.save();
            // エラーが適切に処理されることを確認
            expect(saveResult.toBe(false);
        }');
        test('計算エラーの処理', async (') => {
            // 無効なデータでの計算エラーシミュレーション
            const invalidEvent = {
                type: 'bubble_popped',
                data: {
                    score: 'invalid_score',
                    combo: -1
                }
            };
            const result = await statisticsCollector.collectEvent(invalidEvent);
            // エラーが適切に処理され、システムが継続動作することを確認
            expect(result.toBeDefined();
        }');
    }
    describe('パフォーマンステスト', (') => {
        test('大量データ処理のパフォーマンス', async () => {
            const startTime = performance.now();
            // 1000件のイベントを生成
            const events = Array.from({ length: 1000 }, (_, i) => ({
                ...sampleGameplayEvent,
                timestamp: Date.now() + i,
                data: {
                    ...sampleGameplayEvent.data,
                    score: Math.floor(Math.random() * 1000),
                }
            });
            // バッチで処理
            for (const event of events) {
                await statisticsCollector.collectEvent(event);
            }
            
            await statisticsCollector.processBatch();
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            // 処理時間が1秒以内であることを確認
            expect(processingTime.toBeLessThan(1000);
        }');
        test('メモリ使用量の監視', async () => {
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // 大量の統計データを生成
            for (let i = 0; i < 100; i++) {
                await statisticsCollector.collectEvent({
                    ...sampleGameplayEvent);
                    timestamp: Date.now() + i
                });
            }
            
            await statisticsCollector.processBatch();
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = finalMemory - initialMemory;
            
            // メモリ増加が10MB以内であることを確認
            expect(memoryIncrease.toBeLessThan(10 * 1024 * 1024);
        }');
        test('レンダリングパフォーマンス', async () => {
            const startTime = performance.now(');
            // 複数のチャートを連続描画
            const chartTypes = ['bar', 'line', 'pie'];
            
            for (const type of chartTypes') {
                const data = {
                    labels: ['A', 'B', 'C', 'D'],
                    datasets: [{ data: [10, 20, 30, 40] }]
                };
                
                switch (type') {
                    case 'bar':
                        await chartRenderer.renderBarChart(data');
                        break;
                    case 'line':
                        await chartRenderer.renderLineChart(data');
                        break;
                    case 'pie':
                        await chartRenderer.renderPieChart(data);
                        break;
                }
            }
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // レンダリング時間が500ms以内であることを確認
            expect(renderTime.toBeLessThan(500);
        }');
    }
    describe('データ整合性テスト', (') => {
        test('統計データの整合性チェック', () => {
            const stats = statisticsManager.getStatistics();
            // 基本的な整合性チェック
            expect(stats.gamePlayStats.totalGames).toBeGreaterThanOrEqual(0);
            expect(stats.scoreStats.totalScore).toBeGreaterThanOrEqual(0);
            expect(stats.bubbleStats.accuracy).toBeGreaterThanOrEqual(0);
            expect(stats.bubbleStats.accuracy).toBeLessThanOrEqual(1);
            expect(stats.comboStats.maxCombo).toBeGreaterThanOrEqual(0);
            // 計算値の整合性チェック
            if (stats.gamePlayStats.totalGames > 0) {
                const expectedAverage = stats.scoreStats.totalScore / stats.gamePlayStats.totalGames;
                expect(Math.abs(stats.scoreStats.averageScore - expectedAverage).toBeLessThan(1);
            }
        }');
        test('時系列データの整合性', () => {
            const timeSeries = statisticsManager.getTimeSeriesData();
            // 日別データから週別データが正しく集計されているかチェック
            let dailyTotal = 0;
            for (const [date, data] of timeSeries.daily') {
                if (date.startsWith('2024-01')') {
                    dailyTotal += data.score;
                }
            }
            
            const weeklyData = timeSeries.weekly.get('2024-W01');
            if (weeklyData && dailyTotal > 0) {
                expect(weeklyData.score).toBeLessThanOrEqual(dailyTotal * 1.1); // 10%の誤差を許容
            }
        }');
        test('エクスポート・インポート後のデータ整合性', async () => {
            const originalStats = JSON.parse(JSON.stringify(statisticsManager.getStatistics()');
            // エクスポート・インポートサイクル
            const exported = await statisticsExporter.exportData('json');
            statisticsManager.statistics = statisticsManager.initializeStatistics(');
            await statisticsExporter.importData(exported.data, 'json');
            const restoredStats = statisticsManager.getStatistics();
            // 主要データの整合性チェック
            expect(restoredStats.gamePlayStats.totalGames).toBe(originalStats.gamePlayStats.totalGames);
            expect(restoredStats.scoreStats.totalScore).toBe(originalStats.scoreStats.totalScore);
            expect(restoredStats.bubbleStats.accuracy).toBeCloseTo(originalStats.bubbleStats.accuracy, 2);
        }');
    }
    describe('リアルタイム更新テスト', (') => {
        test('リアルタイム統計更新', async (') => {
            let updateCount = 0;
            
            // 統計更新イベントのリスニング
            statisticsManager.addEventListener('statisticsUpdated', () => {
                updateCount++;
            });
            // 複数のイベントを短時間で送信
            for (let i = 0; i < 5; i++) {
                await statisticsCollector.collectEvent({
                    ...sampleGameplayEvent);
                    timestamp: Date.now() + i
                });
            }
            
            await statisticsCollector.processBatch();
            // 更新イベントが発行されることを確認
            expect(updateCount.toBeGreaterThan(0);
        }');
        test('UI更新の連携', async () => {
            // 統計更新
            await statisticsCollector.collectEvent(sampleGameplayEvent);
            await statisticsCollector.processBatch(');
            // UI更新の確認（モック経由）
            statisticsManager.emit('statisticsUpdated', {);
                data: statisticsManager.getStatistics(});
            }
            expect(mockUserInfoScene.refreshCharts).toHaveBeenCalledTimes(1);
        }');
    }
    describe('統合テスト総合評価', (') => {
        test('システム全体の正常動作確認', async () => {
            // 1. データ収集
            await statisticsCollector.collectEvent(sampleGameplayEvent);
            await statisticsCollector.processBatch();
            // 2. 分析
            const analysis = await statisticsAnalyzer.analyzeTrends(');
            // 3. 可視化
            const chartData = {
                labels: ['Test'],
                datasets: [{ data: [100] }]
            };
            await chartRenderer.renderBarChart(chartData');
            // 4. エクスポート
            const exportResult = await statisticsExporter.exportData('json');
            // 5. 各ステップの成功確認
            expect(statisticsManager.getStatistics().toBeDefined();
            expect(analysis.toBeDefined();
            expect(mockCanvas.getContext().fillRect).toHaveBeenCalled();
            expect(exportResult.success).toBe(true);
        }');
        test('長時間動作の安定性', async () => {
            // 長時間のゲームプレイをシミュレーション
            const duration = 100; // 簡略化されたテスト
            
            for (let i = 0; i < duration; i++) {
                await statisticsCollector.collectEvent({
                    ...sampleGameplayEvent);
                    timestamp: Date.now() + i * 1000
                });
                if (i % 10 === 0) {
                    await statisticsCollector.processBatch();
                }
            }
            
            // 最終バッチ処理
            await statisticsCollector.processBatch();
            // システムが安定して動作することを確認
            const finalStats = statisticsManager.getStatistics();
            expect(finalStats.bubbleStats.totalPopped).toBeGreaterThan(1250);
            expect(finalStats.gamePlayStats.totalGames).toBeGreaterThanOrEqual(25);
        });
    }
});
// テスト用ヘルパー関数
const TestHelper = {
    /**
     * テスト用の統計データを生成
     */
    generateTestStatistics(overrides = {)') {
        return {
            ...sampleStatisticsData,
            ...overrides
        };
    },
    /**
     * テスト用のイベントを生成
     */
    generateTestEvent(type = 'bubble_popped', overrides = {) {
        return {
            type,
            timestamp: Date.now('),
            data: {
                bubbleType: 'normal',
                score: 100,
                combo: 1,
                ...overrides
            }
        };
    },
    /**
     * 非同期処理の完了を待機
     */
    async waitForProcessing(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms);
    },
    /**
     * メモリリークの検出
     */
    detectMemoryLeaks() {
        const initialMemory = performance.memory.usedJSHeapSize;
        
        return {
            check: () => {
                const currentMemory = performance.memory.usedJSHeapSize;
                const increase = currentMemory - initialMemory;
                return {
                    increased: increase,
                    percentage: (increase / initialMemory') * 100
                };
            }
        };
    }
};
export { TestHelper };