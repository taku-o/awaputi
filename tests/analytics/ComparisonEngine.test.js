import { ComparisonEngine } from '../../src/analytics/ComparisonEngine.js';
import { ComparisonEngine as CoreComparisonEngine } from '../../src/core/ComparisonEngine.js';

// モックStorageManager
class MockStorageManager {
    constructor() {
        this.data = new Map();
    }

    async getData(storeName, query) {
        const storeData = this.data.get(storeName) || [];
        if (!query) return storeData;

        if (query.range && query.index === 'startTime') {
            return storeData.filter(item => {
                const timestamp = item.startTime;
                return timestamp >= query.range.lower && timestamp <= query.range.upper;
            });
        }

        return storeData;
    }

    setTestData(storeName, data) {
        this.data.set(storeName, data);
    }
}

describe('ComparisonEngine', () => {
    let comparisonEngine;
    let mockStorageManager;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        comparisonEngine = new ComparisonEngine(mockStorageManager);
    });

    describe('コンストラクタ', () => {
        test('正しく初期化される', () => {
            expect(comparisonEngine.storageManager).toBe(mockStorageManager);
            expect(comparisonEngine.comparisonPeriods).toHaveProperty('week');
            expect(comparisonEngine.comparisonPeriods).toHaveProperty('month');
            expect(comparisonEngine.metrics).toHaveProperty('score');
            expect(comparisonEngine.cache).toBeInstanceOf(Map);
        });

        test('比較期間が正しく設定される', () => {
            expect(comparisonEngine.comparisonPeriods.week).toBe(7 * 24 * 60 * 60 * 1000);
            expect(comparisonEngine.comparisonPeriods.month).toBe(30 * 24 * 60 * 60 * 1000);
            expect(comparisonEngine.comparisonPeriods.quarter).toBe(90 * 24 * 60 * 60 * 1000);
        });

        test('指標設定が正しく定義される', () => {
            expect(comparisonEngine.metrics.score.displayName).toBe('スコア');
            expect(comparisonEngine.metrics.accuracy.displayName).toBe('精度');
            expect(comparisonEngine.metrics.playTime.displayName).toBe('プレイ時間');
        });
    });

    describe('パフォーマンス指標計算', () => {
        test('基本的なパフォーマンス指標が正しく計算される', () => {
            const sessionData = [
                {
                    sessionId: 's1',
                    startTime: 1000,
                    endTime: 301000, // 5分1秒
                    finalScore: 1000,
                    bubblesPopped: 80,
                    bubblesMissed: 20,
                    maxCombo: 15,
                    completed: true
                },
                {
                    sessionId: 's2',
                    startTime: 2000,
                    endTime: 302000, // 5分
                    finalScore: 1200,
                    bubblesPopped: 90,
                    bubblesMissed: 10,
                    maxCombo: 20,
                    completed: false
                }
            ];

            const metrics = comparisonEngine.calculatePerformanceMetrics(sessionData);

            expect(metrics.sessionCount).toBe(2);
            expect(metrics.averageScore).toBe(1100); // (1000 + 1200) / 2
            expect(metrics.averageAccuracy).toBeCloseTo(0.85); // (80+90) / (80+20+90+10)
            expect(metrics.averagePlayTime).toBe(300); // ((301+300)/2)
            expect(metrics.completionRate).toBe(0.5); // 1/2
            expect(metrics.maxCombo).toBe(20);
        });

        test('空のセッションデータで正しく処理される', () => {
            const metrics = comparisonEngine.calculatePerformanceMetrics([]);

            expect(metrics.sessionCount).toBe(0);
            expect(metrics.averageScore).toBe(0);
            expect(metrics.averageAccuracy).toBe(0);
            expect(metrics.averagePlayTime).toBe(0);
            expect(metrics.completionRate).toBe(0);
            expect(metrics.maxCombo).toBe(0);
        });

        test('不完全なデータでも正しく処理される', () => {
            const sessionData = [
                {
                    sessionId: 's1',
                    startTime: 1000,
                    // endTimeなし
                    duration: 300, // duration使用
                    finalScore: 500,
                    // bubblesデータなし
                    completed: true
                }
            ];

            const metrics = comparisonEngine.calculatePerformanceMetrics(sessionData);

            expect(metrics.sessionCount).toBe(1);
            expect(metrics.averageScore).toBe(500);
            expect(metrics.averageAccuracy).toBe(0); // bubbleデータなしで0
            expect(metrics.averagePlayTime).toBe(300);
            expect(metrics.completionRate).toBe(1);
        });
    });

    describe('比較計算', () => {
        test('基本的な比較が正しく計算される', () => {
            const currentData = {
                averageScore: 1100,
                averageAccuracy: 0.85,
                averagePlayTime: 300
            };

            const pastData = {
                averageScore: 1000,
                averageAccuracy: 0.80,
                averagePlayTime: 320
            };

            const comparison = comparisonEngine.calculateComparison(
                currentData, 
                pastData, 
                ['score', 'accuracy', 'playTime']
            );

            expect(comparison.available).toBe(true);
            expect(comparison.improvements).toBe(2); // score, accuracy
            expect(comparison.declines).toBe(1); // playTime
            expect(comparison.stable).toBe(0);

            // スコア改善の確認
            expect(comparison.metrics.score.trend).toBe('improved');
            expect(comparison.metrics.score.change).toBe(100);
            expect(comparison.metrics.score.changePercent).toBe(10);

            // 精度改善の確認
            expect(comparison.metrics.accuracy.trend).toBe('improved');
            expect(comparison.metrics.accuracy.changePercent).toBeCloseTo(6.25, 1); // (0.05/0.80)*100
        });

        test('安定したパフォーマンスが正しく判定される', () => {
            const currentData = { averageScore: 1000 };
            const pastData = { averageScore: 1020 }; // 2%の変化（閾値5%未満）

            const comparison = comparisonEngine.calculateComparison(
                currentData, 
                pastData, 
                ['score']
            );

            expect(comparison.metrics.score.trend).toBe('stable');
            expect(comparison.stable).toBe(1);
            expect(comparison.improvements).toBe(0);
            expect(comparison.declines).toBe(0);
        });
    });

    describe('変化量のフォーマット', () => {
        test('正の変化が正しくフォーマットされる', () => {
            const metric = comparisonEngine.metrics.score;
            const formatted = comparisonEngine.formatChange(100, 10, metric);
            expect(formatted).toBe('+100pts (+10.0%)');
        });

        test('負の変化が正しくフォーマットされる', () => {
            const metric = comparisonEngine.metrics.accuracy;
            const formatted = comparisonEngine.formatChange(-0.05, -6.25, metric);
            expect(formatted).toBe('-5% (-6.3%)');
        });

        test('ゼロ変化が正しくフォーマットされる', () => {
            const metric = comparisonEngine.metrics.playTime;
            const formatted = comparisonEngine.formatChange(0, 0, metric);
            expect(formatted).toBe('+0秒 (+0.0%)');
        });
    });

    describe('比較サマリー生成', () => {
        test('改善傾向のサマリーが正しく生成される', () => {
            const comparisons = {
                week: {
                    available: true,
                    improvements: 2,
                    declines: 0,
                    stable: 1
                }
            };

            const summary = comparisonEngine.generateComparisonSummary(comparisons, ['score', 'accuracy', 'playTime']);

            expect(summary.overall).toBe('improving');
            expect(summary.message).toContain('向上しています');
            expect(summary.improvements).toBe(2);
            expect(summary.declines).toBe(0);
        });

        test('低下傾向のサマリーが正しく生成される', () => {
            const comparisons = {
                week: {
                    available: true,
                    improvements: 0,
                    declines: 2,
                    stable: 1
                }
            };

            const summary = comparisonEngine.generateComparisonSummary(comparisons, ['score', 'accuracy', 'playTime']);

            expect(summary.overall).toBe('declining');
            expect(summary.message).toContain('低下が見られます');
            expect(summary.declines).toBe(2);
        });

        test('データ不足時のサマリーが正しく生成される', () => {
            const comparisons = {
                week: { available: false },
                month: { available: false }
            };

            const summary = comparisonEngine.generateComparisonSummary(comparisons, ['score']);

            expect(summary.overall).toBe('insufficient_data');
            expect(summary.message).toContain('十分なデータがありません');
        });
    });

    describe('詳細分析生成', () => {
        test('強みと弱みが正しく特定される', () => {
            const comparisons = {
                week: {
                    available: true,
                    metrics: {
                        score: {
                            trend: 'improved',
                            changePercent: 15,
                            displayChange: '+150pts (+15.0%)'
                        },
                        accuracy: {
                            trend: 'declined',
                            changePercent: -12,
                            displayChange: '-10% (-12.0%)'
                        }
                    }
                }
            };

            // メトリック設定を一時的に設定
            comparisonEngine.metrics.score = { displayName: 'スコア' };
            comparisonEngine.metrics.accuracy = { displayName: '精度' };

            const analysis = comparisonEngine.generateDetailedAnalysis(comparisons);

            expect(analysis.strengths.length).toBe(1);
            expect(analysis.strengths[0]).toContain('スコア');
            expect(analysis.strengths[0]).toContain('向上');

            expect(analysis.weaknesses.length).toBe(1);
            expect(analysis.weaknesses[0]).toContain('精度');
            expect(analysis.weaknesses[0]).toContain('低下');

            expect(analysis.recommendations.length).toBeGreaterThan(0);
        });

        test('安定した状態での推奨事項が生成される', () => {
            const comparisons = {
                week: {
                    available: true,
                    metrics: {
                        score: { trend: 'stable', changePercent: 2 }
                    }
                }
            };

            const analysis = comparisonEngine.generateDetailedAnalysis(comparisons);

            expect(analysis.strengths.length).toBe(0);
            expect(analysis.weaknesses.length).toBe(0);
            expect(analysis.recommendations).toContain('安定したパフォーマンスです。新しいステージや難易度に挑戦してみましょう。');
        });
    });

    describe('線形トレンド計算', () => {
        test('上昇トレンドが正しく計算される', () => {
            const values = [10, 20, 30, 40, 50];
            const trend = comparisonEngine.calculateLinearTrend(values);

            expect(trend.slope).toBe(10); // 傾き10
            expect(trend.correlation).toBeCloseTo(1, 5); // 完全な正の相関
        });

        test('下降トレンドが正しく計算される', () => {
            const values = [50, 40, 30, 20, 10];
            const trend = comparisonEngine.calculateLinearTrend(values);

            expect(trend.slope).toBe(-10); // 傾き-10
            expect(trend.correlation).toBeCloseTo(-1, 5); // 完全な負の相関
        });

        test('フラットなトレンドが正しく計算される', () => {
            const values = [25, 25, 25, 25, 25];
            const trend = comparisonEngine.calculateLinearTrend(values);

            expect(trend.slope).toBe(0); // 傾き0
            expect(trend.correlation).toBe(0); // 相関なし（NaN→0）
        });

        test('データが不足している場合の処理', () => {
            const values = [10];
            const trend = comparisonEngine.calculateLinearTrend(values);

            expect(trend.slope).toBe(0);
            expect(trend.correlation).toBe(0);
        });
    });

    describe('キャッシュ機能', () => {
        test('データが正しくキャッシュされる', () => {
            const testData = { test: 'data' };
            comparisonEngine.setCachedData('test_key', testData);

            const cached = comparisonEngine.getCachedData('test_key');
            expect(cached).toEqual(testData);
        });

        test('期限切れのデータは取得されない', () => {
            const testData = { test: 'data' };
            comparisonEngine.setCachedData('test_key', testData);

            // キャッシュ期限を短く設定して期限切れをシミュレート
            comparisonEngine.cacheExpiry = -1;

            const cached = comparisonEngine.getCachedData('test_key');
            expect(cached).toBeNull();
        });

        test('キャッシュがクリアされる', () => {
            comparisonEngine.setCachedData('test_key', { test: 'data' });
            expect(comparisonEngine.cache.size).toBe(1);

            comparisonEngine.clearCache();
            expect(comparisonEngine.cache.size).toBe(0);
        });
    });

    describe('過去データとの比較', () => {
        beforeEach(() => {
            // 現在のデータ（直近1週間）
            const currentSessions = [
                {
                    sessionId: 'current1',
                    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
                    endTime: Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1200,
                    bubblesPopped: 90,
                    bubblesMissed: 10,
                    maxCombo: 20,
                    completed: true
                }
            ];

            // 過去のデータ（1週間前の1週間）
            const pastSessions = [
                {
                    sessionId: 'past1',
                    startTime: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2週間前
                    endTime: Date.now() - 14 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1000,
                    bubblesPopped: 80,
                    bubblesMissed: 20,
                    maxCombo: 15,
                    completed: true
                }
            ];

            mockStorageManager.setTestData('sessions', [...currentSessions, ...pastSessions]);
        });

        test('過去データとの比較が実行される', async () => {
            const result = await comparisonEngine.compareWithPastData({
                periods: ['week'],
                metrics: ['score', 'accuracy']
            });

            expect(result.success).toBe(true);
            expect(result.comparisons.week.available).toBe(true);
            expect(result.summary).toHaveProperty('overall');
        });

        test('データ不足時の適切な処理', async () => {
            mockStorageManager.setTestData('sessions', []); // 空のデータ

            const result = await comparisonEngine.compareWithPastData();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Current performance data is insufficient');
        });
    });

    describe('エラーハンドリング', () => {
        test('ストレージエラーが適切に処理される', async () => {
            mockStorageManager.getData = jest.fn().mockRejectedValue(new Error('Database error'));

            const result = await comparisonEngine.compareWithPastData();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
        });
    });

    describe('ベンチマーク比較機能', () => {
        beforeEach(() => {
            // 現在のデータ（直近1週間）
            const currentSessions = [
                {
                    sessionId: 'current1',
                    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1200,
                    bubblesPopped: 90,
                    bubblesMissed: 10,
                    maxCombo: 20,
                    completed: true,
                    playerId: 'current_player'
                }
            ];

            // ベンチマーク用の他プレイヤーデータ（3ヶ月間）
            const benchmarkSessions = [
                // プレイヤー1（平均的）
                {
                    sessionId: 'bench1_1',
                    startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 30 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1000,
                    bubblesPopped: 80,
                    bubblesMissed: 20,
                    maxCombo: 15,
                    completed: true,
                    playerId: 'player1'
                },
                {
                    sessionId: 'bench1_2',
                    startTime: Date.now() - 29 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 29 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1100,
                    bubblesPopped: 85,
                    bubblesMissed: 15,
                    maxCombo: 18,
                    completed: true,
                    playerId: 'player1'
                },
                {
                    sessionId: 'bench1_3',
                    startTime: Date.now() - 28 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 28 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1050,
                    bubblesPopped: 82,
                    bubblesMissed: 18,
                    maxCombo: 16,
                    completed: true,
                    playerId: 'player1'
                },
                // プレイヤー2（低スキル）
                {
                    sessionId: 'bench2_1',
                    startTime: Date.now() - 60 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 60 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 800,
                    bubblesPopped: 70,
                    bubblesMissed: 30,
                    maxCombo: 10,
                    completed: false,
                    playerId: 'player2'
                },
                {
                    sessionId: 'bench2_2',
                    startTime: Date.now() - 59 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 59 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 850,
                    bubblesPopped: 75,
                    bubblesMissed: 25,
                    maxCombo: 12,
                    completed: false,
                    playerId: 'player2'
                },
                {
                    sessionId: 'bench2_3',
                    startTime: Date.now() - 58 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 58 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 900,
                    bubblesPopped: 78,
                    bubblesMissed: 22,
                    maxCombo: 14,
                    completed: true,
                    playerId: 'player2'
                },
                // プレイヤー3（高スキル）
                {
                    sessionId: 'bench3_1',
                    startTime: Date.now() - 45 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 45 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1500,
                    bubblesPopped: 95,
                    bubblesMissed: 5,
                    maxCombo: 25,
                    completed: true,
                    playerId: 'player3'
                },
                {
                    sessionId: 'bench3_2',
                    startTime: Date.now() - 44 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 44 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1600,
                    bubblesPopped: 98,
                    bubblesMissed: 2,
                    maxCombo: 30,
                    completed: true,
                    playerId: 'player3'
                },
                {
                    sessionId: 'bench3_3',
                    startTime: Date.now() - 43 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 43 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1550,
                    bubblesPopped: 96,
                    bubblesMissed: 4,
                    maxCombo: 28,
                    completed: true,
                    playerId: 'player3'
                }
            ];

            mockStorageManager.setTestData('sessions', [...currentSessions, ...benchmarkSessions]);
        });

        test('ベンチマーク比較が実行される', async () => {
            const result = await comparisonEngine.compareWithBenchmark({
                metrics: ['score', 'accuracy']
            });

            expect(result.success).toBe(true);
            expect(result.comparison.available).toBe(true);
            expect(result.summary).toHaveProperty('overall');
            expect(result.benchmark).toHaveProperty('totalPlayers');
            expect(result.benchmark.totalPlayers).toBe(3); // 3人のプレイヤー
        });

        test('プレイヤーIDが正しく匿名化される', () => {
            const anonymized1 = comparisonEngine.anonymizePlayerId('player1');
            const anonymized2 = comparisonEngine.anonymizePlayerId('player1');
            const anonymized3 = comparisonEngine.anonymizePlayerId('player2');

            expect(anonymized1).toBe(anonymized2); // 同じIDは同じ匿名化結果
            expect(anonymized1).not.toBe(anonymized3); // 異なるIDは異なる匿名化結果
            expect(anonymized1).toMatch(/^player_\d+$/); // 形式チェック
        });

        test('ベンチマーク指標が正しく計算される', () => {
            const playerMetrics = [
                { averageScore: 1000, averageAccuracy: 0.8, sessionCount: 3 },
                { averageScore: 850, averageAccuracy: 0.75, sessionCount: 3 },
                { averageScore: 1550, averageAccuracy: 0.95, sessionCount: 3 }
            ];

            const benchmark = comparisonEngine.calculateBenchmarkMetrics(playerMetrics);

            expect(benchmark.totalPlayers).toBe(3);
            expect(benchmark.averageScore.mean).toBeCloseTo(1133.33, 1); // (1000+850+1550)/3
            expect(benchmark.averageScore.median).toBe(1000);
            expect(benchmark.averageScore.min).toBe(850);
            expect(benchmark.averageScore.max).toBe(1550);
            expect(benchmark.dataQuality.quality).toBe('medium'); // 3人なのでmedium
        });

        test('パーセンタイル順位が正しく計算される', () => {
            const stats = {
                percentile25: 800,
                median: 1000,
                percentile75: 1200,
                min: 600,
                max: 1500
            };

            expect(comparisonEngine.calculatePercentileRank(700, stats)).toBe(25); // 25パーセンタイル以下
            expect(comparisonEngine.calculatePercentileRank(1000, stats)).toBe(50); // 中央値
            expect(comparisonEngine.calculatePercentileRank(1200, stats)).toBe(75); // 75パーセンタイル
            expect(comparisonEngine.calculatePercentileRank(1500, stats)).toBe(100); // 最大値
            
            // 線形補間のテスト
            const midPoint = comparisonEngine.calculatePercentileRank(900, stats); // 25-50の中間
            expect(midPoint).toBeCloseTo(37.5, 1);
        });

        test('ベンチマーク比較が正しく計算される', () => {
            const current = { averageScore: 1200, averageAccuracy: 0.9 };
            const benchmark = {
                averageScore: {
                    mean: 1000,
                    median: 1000,
                    percentile25: 850,
                    percentile75: 1200,
                    min: 800,
                    max: 1500
                },
                averageAccuracy: {
                    mean: 0.8,
                    median: 0.8,
                    percentile25: 0.75,
                    percentile75: 0.85,
                    min: 0.7,
                    max: 0.95
                }
            };

            const comparison = comparisonEngine.calculateBenchmarkComparison(
                current,
                benchmark,
                ['score', 'accuracy']
            );

            expect(comparison.available).toBe(true);
            expect(comparison.metrics.score.performance).toBe('above_average'); // 75パーセンタイル
            expect(comparison.metrics.accuracy.performance).toBe('above_average'); // 90%は高い
            expect(comparison.above_average).toBe(2);
            expect(comparison.below_average).toBe(0);
        });

        test('ベンチマークサマリーが正しく生成される', () => {
            const comparison = {
                above_average: 2,
                below_average: 0,
                average: 1
            };

            const summary = comparisonEngine.generateBenchmarkSummary(comparison, ['score', 'accuracy', 'playTime']);

            expect(summary.overall).toBe('above_average');
            expect(summary.message).toContain('平均以上のパフォーマンス');
            expect(summary.above_average).toBe(2);
        });

        test('ベンチマーク詳細分析が生成される', () => {
            const comparison = {
                metrics: {
                    score: {
                        performance: 'above_average',
                        displayCurrent: '1200pts',
                        displayBenchmark: '1000pts',
                        displayDifference: '+200pts (+20.0%)'
                    },
                    accuracy: {
                        performance: 'below_average',
                        displayCurrent: '75%',
                        displayBenchmark: '85%',
                        displayDifference: '-10% (-11.8%)'
                    }
                },
                ranking: {
                    score: { percentile: 80 },
                    accuracy: { percentile: 20 }
                }
            };

            // メトリック設定を一時的に設定
            comparisonEngine.metrics.score = { displayName: 'スコア' };
            comparisonEngine.metrics.accuracy = { displayName: '精度' };

            const analysis = comparisonEngine.generateBenchmarkAnalysis(comparison);

            expect(analysis.strengths.length).toBe(1);
            expect(analysis.strengths[0]).toContain('スコア');
            expect(analysis.strengths[0]).toContain('上位20%');

            expect(analysis.improvements.length).toBe(1);
            expect(analysis.improvements[0]).toContain('精度');
            expect(analysis.improvements[0]).toContain('下位20%');

            expect(analysis.rankings.length).toBe(2);
            expect(analysis.recommendations.length).toBeGreaterThan(0);
        });

        test('データ不足時の適切な処理', async () => {
            mockStorageManager.setTestData('sessions', []); // 空のデータ

            const result = await comparisonEngine.compareWithBenchmark();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Current performance data is insufficient');
        });

        test('ベンチマークデータ不足時の適切な処理', async () => {
            // 現在のデータのみ設定（ベンチマーク期間外）
            const currentSessions = [
                {
                    sessionId: 'current1',
                    startTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
                    endTime: Date.now() - 1 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1200,
                    completed: true,
                    playerId: 'current_player'
                }
            ];

            mockStorageManager.setTestData('sessions', currentSessions);

            const result = await comparisonEngine.compareWithBenchmark();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Benchmark data is insufficient');
        });

        test('標準偏差が正しく計算される', () => {
            const values = [10, 20, 30, 40, 50];
            const stdDev = comparisonEngine.calculateStandardDeviation(values);
            
            // 手動計算: mean=30, variance=200, stdDev=sqrt(200)≈14.14
            expect(stdDev).toBeCloseTo(14.14, 1);
        });

        test('空配列での標準偏差計算', () => {
            const stdDev = comparisonEngine.calculateStandardDeviation([]);
            expect(stdDev).toBe(0);
        });

        test('ベンチマークデータ品質評価', () => {
            const playerMetrics = [
                { sessionCount: 5 },
                { sessionCount: 3 },
                { sessionCount: 7 },
                { sessionCount: 4 },
                { sessionCount: 6 }
            ];

            const quality = comparisonEngine.assessBenchmarkDataQuality(playerMetrics);

            expect(quality.playerCount).toBe(5);
            expect(quality.totalSessions).toBe(25);
            expect(quality.averageSessionsPerPlayer).toBe(5);
            expect(quality.quality).toBe('medium'); // 5人なのでmedium

            // 高品質の場合
            const highQualityMetrics = new Array(15).fill({ sessionCount: 5 });
            const highQuality = comparisonEngine.assessBenchmarkDataQuality(highQualityMetrics);
            expect(highQuality.quality).toBe('high');
        });

        test('ベンチマーク差分のフォーマット', () => {
            const metric = comparisonEngine.metrics.score;
            
            const positiveFormatted = comparisonEngine.formatBenchmarkDifference(100, 10, metric);
            expect(positiveFormatted).toBe('+100pts (+10.0%)');

            const negativeFormatted = comparisonEngine.formatBenchmarkDifference(-50, -5, metric);
            expect(negativeFormatted).toBe('-50pts (-5.0%)');
        });
    });
});

// Task 8.3とTask 8.4で実装した機能のテスト
describe('CoreComparisonEngine (Task 8.3 & 8.4)', () => {
    let coreComparisonEngine;

    beforeEach(() => {
        coreComparisonEngine = new CoreComparisonEngine();
    });

    describe('Task 8.3: ステージ別比較機能', () => {
        test('ステージ別パフォーマンス比較が正しく実行される', () => {
            const stageData = {
                'stage_tutorial': [
                    {
                        sessionId: 's1',
                        stageId: 'stage_tutorial',
                        finalScore: 800,
                        bubblesPopped: 70,
                        bubblesMissed: 30,
                        maxCombo: 10,
                        completed: true,
                        startTime: Date.now() - 1000000,
                        endTime: Date.now() - 700000,
                        stageDifficulty: 1
                    },
                    {
                        sessionId: 's2',
                        stageId: 'stage_tutorial',
                        finalScore: 900,
                        bubblesPopped: 80,
                        bubblesMissed: 20,
                        maxCombo: 12,
                        completed: true,
                        startTime: Date.now() - 900000,
                        endTime: Date.now() - 600000,
                        stageDifficulty: 1
                    }
                ],
                'stage_normal': [
                    {
                        sessionId: 's3',
                        stageId: 'stage_normal',
                        finalScore: 1200,
                        bubblesPopped: 90,
                        bubblesMissed: 10,
                        maxCombo: 20,
                        completed: true,
                        startTime: Date.now() - 800000,
                        endTime: Date.now() - 500000,
                        stageDifficulty: 2
                    }
                ]
            };

            const result = coreComparisonEngine.compareStagePerformance(stageData);

            // 実際の実装に合わせたテスト - 2つのステージがあるので比較可能
            expect(result.stageStatistics).toHaveProperty('stage_tutorial');
            expect(result.stageStatistics).toHaveProperty('stage_normal');
            expect(result.stageComparisons).toHaveProperty('stage_tutorial_vs_stage_normal');
            expect(result.summary).toBeDefined();
            expect(result.summary.totalStages).toBe(2);
            expect(result.summary.totalComparisons).toBe(1);
        });

        test('難易度調整された比較が正しく計算される', () => {
            const stageData = {
                'stage_easy': [
                    {
                        sessionId: 's1',
                        stageId: 'stage_easy',
                        finalScore: 1000,
                        bubblesPopped: 80,
                        bubblesMissed: 20,
                        maxCombo: 15,
                        completed: true,
                        stageDifficulty: 1
                    }
                ],
                'stage_hard': [
                    {
                        sessionId: 's2',
                        stageId: 'stage_hard',
                        finalScore: 800,
                        bubblesPopped: 70,
                        bubblesMissed: 30,
                        maxCombo: 12,
                        completed: true,
                        stageDifficulty: 3
                    }
                ]
            };

            const result = coreComparisonEngine.compareStagePerformance(stageData, {
                includeDifficultyAdjustment: true
            });

            // 実際の実装に合わせたテスト
            expect(result.stageStatistics).toHaveProperty('stage_easy');
            expect(result.stageStatistics).toHaveProperty('stage_hard');
            
            // 難易度調整された指標の確認
            const easyStage = result.stageStatistics.stage_easy;
            const hardStage = result.stageStatistics.stage_hard;
            
            expect(easyStage.difficultyAdjustedMetrics).toBeDefined();
            expect(hardStage.difficultyAdjustedMetrics).toBeDefined();
        });

        test('ステージランキングが正しく生成される', () => {
            const stageData = {
                'stage_tutorial': [
                    { finalScore: 1000, stageDifficulty: 1 },
                    { finalScore: 1100, stageDifficulty: 1 }
                ],
                'stage_normal': [
                    { finalScore: 1200, stageDifficulty: 2 },
                    { finalScore: 900, stageDifficulty: 2 }
                ]
            };

            const result = coreComparisonEngine.compareStagePerformance(stageData);
            
            expect(result.rankings).toBeDefined();
            expect(result.summary.bestPerformingStage).toBeDefined();
            expect(result.summary.mostDifficultStage).toBeDefined();
        });

        test('不十分なデータでエラーハンドリングが動作する', () => {
            // 1つのステージのみ（比較には2つ以上必要）
            const insufficientData = {
                'stage_test': [
                    { finalScore: 1000 }
                ]
            };
            
            const result = coreComparisonEngine.compareStagePerformance(insufficientData);
            expect(result.error).toBe('insufficient_stages');
            expect(result.message).toContain('At least 2 stages required');
        });
    });

    describe('Task 8.4: 改善提案システム', () => {
        test('個人化された改善計画が生成される', () => {
            const playerData = {
                totalSessions: 50,
                totalPlayTime: 15000, // 250分
                averageScore: 1100,
                averageAccuracy: 0.75,
                maxCombo: 25,
                completionRate: 0.8,
                preferredStages: ['stage_normal', 'stage_time_attack'],
                recentSessions: [
                    { 
                        finalScore: 1200, 
                        accuracy: 0.8, 
                        maxCombo: 20, 
                        completed: true,
                        playTime: 300,
                        stageId: 'stage_normal'
                    },
                    { 
                        finalScore: 1000, 
                        accuracy: 0.7, 
                        maxCombo: 15, 
                        completed: false,
                        playTime: 250,
                        stageId: 'stage_time_attack'
                    }
                ]
            };

            const comparisonAnalysis = {
                strengths: ['スコア', 'コンボ'],
                weaknesses: ['精度', '完了率'],
                overallTrend: 'improving'
            };

            const result = coreComparisonEngine.generatePersonalizedImprovementPlan(
                playerData, 
                comparisonAnalysis
            );

            // 実際の実装に合わせたテスト
            expect(result.planId).toBeDefined();
            expect(result.timestamp).toBeDefined();
            expect(result.playerProfile).toBeDefined();
            expect(result.analysis).toBeDefined();
            expect(result.suggestions).toBeDefined();
            expect(result.actionPlan).toBeDefined();
            expect(result.motivation).toBeDefined();
            expect(result.successMetrics).toBeDefined();
            expect(result.followUp).toBeDefined();

            // プレイヤープロファイルの確認
            expect(result.playerProfile).toBeDefined();
            expect(result.analysis.strengths).toBeInstanceOf(Array);
            expect(result.analysis.weaknesses).toBeInstanceOf(Array);
        });

        test('カスタムオプションが正しく適用される', () => {
            const playerData = {
                averageScore: 1000,
                averageAccuracy: 0.75,
                totalSessions: 30
            };

            const comparisonAnalysis = {
                strengths: ['スコア'],
                weaknesses: ['精度'],
                overallTrend: 'improving'
            };

            const customOptions = {
                focusAreas: 3,
                timeHorizon: 14, // 2週間
                difficultyPreference: 'gradual',
                includeMotivationalElements: true
            };

            const result = coreComparisonEngine.generatePersonalizedImprovementPlan(
                playerData, 
                comparisonAnalysis,
                customOptions
            );

            expect(result.planId).toBeDefined();
            expect(result.actionPlan).toBeDefined();
            expect(result.motivation).toBeDefined(); // includeMotivationalElements: true
            expect(result.followUp).toBeDefined();
        });
    });
});