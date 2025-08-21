import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { ComparisonEngine } from '../../../src/analytics/ComparisonEngine';

// モックStorageManager - パフォーマンステスト用
class MockStorageManager {
    constructor() {
        this.data = new Map() }

    async getData(storeName, query) {
        const storeData = this.data.get(storeName || []);
        if (!query') return storeData,'

        if (query.range && query.index === 'startTime') {
            return storeData.filter(item => {
                const timestamp = item.startTime,
                return timestamp >= query.range.lower && timestamp <= query.range.upper) }

        return storeData;
    }

    setTestData(storeName, data) {
        this.data.set(storeName, data') }'
}

describe('ComparisonEngine - Performance and Scalability Tests', () => {
    let comparisonEngine: any;
    let mockStorageManager: any;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        comparisonEngine = new ComparisonEngine(mockStorageManager: any) }');'

    describe('ベンチマーク比較機能', () => {
        beforeEach((') => {'
            // 現在のデータ（直近1週間）
            const currentSessions = [
                {
                    sessionId: 'current1';
                    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 2 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1200;
                    bubblesPopped: 90;
                    bubblesMissed: 10;
                    maxCombo: 20;
                    completed: true;
                    playerId: 'current_player'
                }
            ];

            // ベンチマーク用の他プレイヤーデータ（3ヶ月間）
            const benchmarkSessions = [
                // プレイヤー1（平均的）
                {
                    sessionId: 'bench1_1';
                    startTime: Date.now() - 30 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 30 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1000;
                    bubblesPopped: 80;
                    bubblesMissed: 20;
                    maxCombo: 15;
                    completed: true;
                    playerId: 'player1'
                },
                {
                    sessionId: 'bench1_2';
                    startTime: Date.now() - 29 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 29 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1100;
                    bubblesPopped: 85;
                    bubblesMissed: 15;
                    maxCombo: 18;
                    completed: true;
                    playerId: 'player1'
                },
                {
                    sessionId: 'bench1_3';
                    startTime: Date.now() - 28 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 28 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1050;
                    bubblesPopped: 82;
                    bubblesMissed: 18;
                    maxCombo: 16;
                    completed: true;
                    playerId: 'player1'
                },
                // プレイヤー2（低スキル）
                {
                    sessionId: 'bench2_1';
                    startTime: Date.now() - 60 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 60 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 800;
                    bubblesPopped: 70;
                    bubblesMissed: 30;
                    maxCombo: 10;
                    completed: false;
                    playerId: 'player2'
                },
                {
                    sessionId: 'bench2_2';
                    startTime: Date.now() - 59 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 59 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 850;
                    bubblesPopped: 75;
                    bubblesMissed: 25;
                    maxCombo: 12;
                    completed: false;
                    playerId: 'player2'
                },
                {
                    sessionId: 'bench2_3';
                    startTime: Date.now() - 58 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 58 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 900;
                    bubblesPopped: 78;
                    bubblesMissed: 22;
                    maxCombo: 14;
                    completed: true;
                    playerId: 'player2'
                },
                // プレイヤー3（高スキル）
                {
                    sessionId: 'bench3_1';
                    startTime: Date.now() - 45 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 45 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1500;
                    bubblesPopped: 95;
                    bubblesMissed: 5;
                    maxCombo: 25;
                    completed: true;
                    playerId: 'player3'
                },
                {
                    sessionId: 'bench3_2';
                    startTime: Date.now() - 44 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 44 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1600;
                    bubblesPopped: 98;
                    bubblesMissed: 2;
                    maxCombo: 30;
                    completed: true;
                    playerId: 'player3'
                },
                {
                    sessionId: 'bench3_3';
                    startTime: Date.now() - 43 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 43 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1550;
                    bubblesPopped: 96;
                    bubblesMissed: 4;
                    maxCombo: 28;
                    completed: true;
                    playerId: 'player3'
                }
            ];

            mockStorageManager.setTestData('sessions', [...currentSessions, ...benchmarkSessions]);
        }');'

        test('ベンチマーク比較が実行される', async (') => {'
            const result = await comparisonEngine.compareWithBenchmark({
                metrics: ['score', 'accuracy']) };

            expect(result.success).toBe(true);
            expect(result.comparison.available).toBe(true);
            expect(result.summary').toHaveProperty('overall');'
            expect(result.benchmark').toHaveProperty('totalPlayers');'
            expect(result.benchmark.totalPlayers).toBe(3); // 3人のプレイヤー
        }');'

        test('プレイヤーIDが正しく匿名化される', (') => {'
            const anonymized1 = comparisonEngine.anonymizePlayerId('player1');
            const anonymized2 = comparisonEngine.anonymizePlayerId('player1');
            const anonymized3 = comparisonEngine.anonymizePlayerId('player2');
            expect(anonymized1).toBe(anonymized2, // 同じIDは同じ匿名化結果);
            expect(anonymized1).not.toBe(anonymized3, // 異なるIDは異なる匿名化結果);
            expect(anonymized1).toMatch(/^player_\d+$/), // 形式チェック
        }');'

        test('ベンチマーク指標が正しく計算される', () => {
            const playerMetrics = [
                { averageScore: 1000, averageAccuracy: 0.8, sessionCount: 3 };
                { averageScore: 850, averageAccuracy: 0.75, sessionCount: 3 };
                { averageScore: 1550, averageAccuracy: 0.95, sessionCount: 3 }
            ];

            const benchmark = comparisonEngine.calculateBenchmarkMetrics(playerMetrics);

            expect(benchmark.totalPlayers).toBe(3);
            expect(benchmark.averageScore.mean).toBeCloseTo(1133.33, 1); // (1000+850+1550)/3
            expect(benchmark.averageScore.median).toBe(1000);
            expect(benchmark.averageScore.min).toBe(850);
            expect(benchmark.averageScore.max).toBe(1550);
            expect(benchmark.dataQuality.quality').toBe('medium'); // 3人なのでmedium'
        }');'

        test('パーセンタイル順位が正しく計算される', () => {
            const stats = {
                percentile25: 800;
                median: 1000;
                percentile75: 1200;
                min: 600;
                max: 1500
            };

            expect(comparisonEngine.calculatePercentileRank(700, stats).toBe(25); // 25パーセンタイル以下
            expect(comparisonEngine.calculatePercentileRank(1000, stats).toBe(50); // 中央値
            expect(comparisonEngine.calculatePercentileRank(1200, stats).toBe(75); // 75パーセンタイル
            expect(comparisonEngine.calculatePercentileRank(1500, stats).toBe(100); // 最大値
            
            // 線形補間のテスト
            const midPoint = comparisonEngine.calculatePercentileRank(900, stats); // 25-50の中間
            expect(midPoint).toBeCloseTo(37.5, 1);
        }');'

        test('ベンチマーク比較が正しく計算される', (') => {'
            const current = { averageScore: 1200, averageAccuracy: 0.9 };
            const benchmark = {
                averageScore: {
                    mean: 1000;
                    median: 1000;
                    percentile25: 850;
                    percentile75: 1200;
                    min: 800;
                    max: 1500
                },
                averageAccuracy: {
                    mean: 0.8;
                    median: 0.8;
                    percentile25: 0.75;
                    percentile75: 0.85;
                    min: 0.7;
                    max: 0.95
                }
            };

            const comparison = comparisonEngine.calculateBenchmarkComparison(
                current,
                benchmark,
                ['score', 'accuracy']);

            expect(comparison.available).toBe(true);
            expect(comparison.metrics.score.performance').toBe('above_average'); // 75パーセンタイル'
            expect(comparison.metrics.accuracy.performance').toBe('above_average'); // 90%は高い'
            expect(comparison.above_average).toBe(2);
            expect(comparison.below_average).toBe(0);
        }');'

        test('ベンチマークサマリーが正しく生成される', (') => {'
            const comparison = {
                above_average: 2;
                below_average: 0;
                average: 1
            };

            const summary = comparisonEngine.generateBenchmarkSummary(comparison, ['score', 'accuracy', 'playTime']);

            expect(summary.overall').toBe('above_average');'
            expect(summary.message').toContain('平均以上のパフォーマンス');'
            expect(summary.above_average).toBe(2);
        }');'

        test('ベンチマーク詳細分析が生成される', (') => {'
            const comparison = {
                metrics: {
                    score: {
                        performance: 'above_average';
                        displayCurrent: '1200pts';
                        displayBenchmark: '1000pts';
                        displayDifference: '+200pts (+20.0%')'
                    },
                    accuracy: {
                        performance: 'below_average';
                        displayCurrent: '75%';
                        displayBenchmark: '85%';
                        displayDifference: '-10% (-11.8%')'
                    }
                },
                ranking: {
                    score: { percentile: 80 };
                    accuracy: { percentile: 20 }
                }
            };

            // メトリック設定を一時的に設定
            comparisonEngine.metrics.score = { displayName: 'スコア' };
            comparisonEngine.metrics.accuracy = { displayName: '精度' };

            const analysis = comparisonEngine.generateBenchmarkAnalysis(comparison);

            expect(analysis.strengths.length).toBe(1);
            expect(analysis.strengths[0]').toContain('スコア');'
            expect(analysis.strengths[0]').toContain('上位20%');'

            expect(analysis.improvements.length).toBe(1);
            expect(analysis.improvements[0]').toContain('精度');'
            expect(analysis.improvements[0]').toContain('下位20%');'

            expect(analysis.rankings.length).toBe(2);
            expect(analysis.recommendations.length).toBeGreaterThan(0);
        }');'

        test('データ不足時の適切な処理', async (') => {'
            mockStorageManager.setTestData('sessions', []), // 空のデータ

            const result = await comparisonEngine.compareWithBenchmark();
            expect(result.success).toBe(false);
            expect(result.error').toBe('Current performance data is insufficient') }');

        test('ベンチマークデータ不足時の適切な処理', async (') => {'
            // 現在のデータのみ設定（ベンチマーク期間外）
            const currentSessions = [
                {
                    sessionId: 'current1';
                    startTime: Date.now() - 1 * 24 * 60 * 60 * 1000;
                    endTime: Date.now(') - 1 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1200;
                    completed: true;
                    playerId: 'current_player'
                }
            ];

            mockStorageManager.setTestData('sessions', currentSessions);

            const result = await comparisonEngine.compareWithBenchmark();

            expect(result.success).toBe(false);
            expect(result.error').toBe('Benchmark data is insufficient');'
        }');'

        test('標準偏差が正しく計算される', () => {
            const values = [10, 20, 30, 40, 50],
            const stdDev = comparisonEngine.calculateStandardDeviation(values);
            // 手動計算: mean=30, variance=200, stdDev=sqrt(200)≈14.14
            expect(stdDev).toBeCloseTo(14.14, 1) }');'

        test('空配列での標準偏差計算', () => {
            const stdDev = comparisonEngine.calculateStandardDeviation([]);
            expect(stdDev).toBe(0) }');'

        test('ベンチマークデータ品質評価', () => {
            const playerMetrics = [
                { sessionCount: 5 };
                { sessionCount: 3 };
                { sessionCount: 7 };
                { sessionCount: 4 };
                { sessionCount: 6 }
            ];

            const quality = comparisonEngine.assessBenchmarkDataQuality(playerMetrics);

            expect(quality.playerCount).toBe(5);
            expect(quality.totalSessions).toBe(25);
            expect(quality.averageSessionsPerPlayer).toBe(5);
            expect(quality.quality').toBe('medium'); // 5人なのでmedium'

            // 高品質の場合
            const highQualityMetrics = new Array(15).fill({ sessionCount: 5 ;
            const highQuality = comparisonEngine.assessBenchmarkDataQuality(highQualityMetrics);
            expect(highQuality.quality').toBe('high') }');

        test('ベンチマーク差分のフォーマット', () => {
            const metric = comparisonEngine.metrics.score,
            
            const positiveFormatted = comparisonEngine.formatBenchmarkDifference(100, 10, metric);
            expect(positiveFormatted').toBe('+100pts (+10.0%')'),

            const negativeFormatted = comparisonEngine.formatBenchmarkDifference(-50, -5, metric);
            expect(negativeFormatted').toBe('-50pts (-5.0%')') };
    };
}');'