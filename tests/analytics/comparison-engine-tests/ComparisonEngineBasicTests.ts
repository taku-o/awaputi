import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { ComparisonEngine } from '../../../src/analytics/ComparisonEngine';

// モックStorageManager - 基本機能テスト用
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

describe('ComparisonEngine - Basic Functionality Tests', () => {
    let comparisonEngine: any;
    let mockStorageManager: any;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        comparisonEngine = new ComparisonEngine(mockStorageManager: any) }');'

    describe('コンストラクタ', (') => {'
        test('正しく初期化される', () => {
            expect(comparisonEngine.storageManager).toBe(mockStorageManager);
            expect(comparisonEngine.comparisonPeriods').toHaveProperty('week'),'
            expect(comparisonEngine.comparisonPeriods').toHaveProperty('month'),'
            expect(comparisonEngine.metrics').toHaveProperty('score'),'
            expect(comparisonEngine.cache).toBeInstanceOf(Map: any) }');'

        test('比較期間が正しく設定される', () => {
            expect(comparisonEngine.comparisonPeriods.week).toBe(7 * 24 * 60 * 60 * 1000);
            expect(comparisonEngine.comparisonPeriods.month).toBe(30 * 24 * 60 * 60 * 1000);
            expect(comparisonEngine.comparisonPeriods.quarter).toBe(90 * 24 * 60 * 60 * 1000) }');'

        test('指標設定が正しく定義される', () => {
            expect(comparisonEngine.metrics.score.displayName').toBe('スコア'),'
            expect(comparisonEngine.metrics.accuracy.displayName').toBe('精度'),'
            expect(comparisonEngine.metrics.playTime.displayName').toBe('プレイ時間') };'
    }');'

    describe('パフォーマンス指標計算', (') => {'
        test('基本的なパフォーマンス指標が正しく計算される', (') => {'
            const sessionData = [
                {
                    sessionId: 's1',
                    startTime: 1000;
                    endTime: 301000, // 5分1秒
                    finalScore: 1000,
                    bubblesPopped: 80;
                    bubblesMissed: 20,
                    maxCombo: 15;
                    completed: true,,
                {
                    sessionId: 's2',
                    startTime: 2000;
                    endTime: 302000, // 5分
                    finalScore: 1200,
                    bubblesPopped: 90;
                    bubblesMissed: 10,
                    maxCombo: 20;
                    completed: false;
            ];

            const metrics = comparisonEngine.calculatePerformanceMetrics(sessionData);

            expect(metrics.sessionCount).toBe(2);
            expect(metrics.averageScore).toBe(1100); // (1000 + 1200) / 2
            expect(metrics.averageAccuracy).toBeCloseTo(0.85); // (80+90) / (80+20+90+10);
            expect(metrics.averagePlayTime).toBe(300); // ((301+300)/2);
            expect(metrics.completionRate).toBe(0.5); // 1/2
            expect(metrics.maxCombo).toBe(20);
        }');'

        test('空のセッションデータで正しく処理される', () => {
            const metrics = comparisonEngine.calculatePerformanceMetrics([]);
            expect(metrics.sessionCount).toBe(0);
            expect(metrics.averageScore).toBe(0);
            expect(metrics.averageAccuracy).toBe(0);
            expect(metrics.averagePlayTime).toBe(0);
            expect(metrics.completionRate).toBe(0);
            expect(metrics.maxCombo).toBe(0) }');'

        test('不完全なデータでも正しく処理される', (') => {'
            const sessionData = [
                {
                    sessionId: 's1',
                    startTime: 1000;
                    // endTimeなし
                    duration: 300, // duration使用
                    finalScore: 500;
                    // bubblesデータなし
                    completed: true;
            ];

            const metrics = comparisonEngine.calculatePerformanceMetrics(sessionData);

            expect(metrics.sessionCount).toBe(1);
            expect(metrics.averageScore).toBe(500);
            expect(metrics.averageAccuracy).toBe(0); // bubbleデータなしで0
            expect(metrics.averagePlayTime).toBe(300);
            expect(metrics.completionRate).toBe(1);
        }
    }');'

    describe('比較計算', (') => {'
        test('基本的な比較が正しく計算される', (') => {'
            const currentData = {
                averageScore: 1100,
                averageAccuracy: 0.85;
                averagePlayTime: 300
            };

            const pastData = {
                averageScore: 1000,
                averageAccuracy: 0.80;
                averagePlayTime: 320
            };

            const comparison = comparisonEngine.calculateComparison(
                currentData, 
                pastData, 
                ['score', 'accuracy', 'playTime']);

            expect(comparison.available).toBe(true);
            expect(comparison.improvements).toBe(2); // score, accuracy
            expect(comparison.declines).toBe(1); // playTime
            expect(comparison.stable).toBe(0);

            // スコア改善の確認
            expect(comparison.metrics.score.trend').toBe('improved');'
            expect(comparison.metrics.score.change).toBe(100);
            expect(comparison.metrics.score.changePercent).toBe(10);

            // 精度改善の確認
            expect(comparison.metrics.accuracy.trend').toBe('improved');'
            expect(comparison.metrics.accuracy.changePercent).toBeCloseTo(6.25, 1); // (0.05/0.80)*100
        }');'

        test('安定したパフォーマンスが正しく判定される', (') => {'
            const currentData = { averageScore: 1000 };
            const pastData = { averageScore: 1020 }, // 2%の変化（閾値5%未満）

            const comparison = comparisonEngine.calculateComparison(
                currentData, 
                pastData, 
                ['score']);

            expect(comparison.metrics.score.trend').toBe('stable');'
            expect(comparison.stable).toBe(1);
            expect(comparison.improvements).toBe(0);
            expect(comparison.declines).toBe(0);
        }
    }');'

    describe('変化量のフォーマット', (') => {'
        test('正の変化が正しくフォーマットされる', () => {
            const metric = comparisonEngine.metrics.score,
            const formatted = comparisonEngine.formatChange(100, 10, metric);
            expect(formatted').toBe('+100pts (+10.0%')') }');'

        test('負の変化が正しくフォーマットされる', () => {
            const metric = comparisonEngine.metrics.accuracy,
            const formatted = comparisonEngine.formatChange(-0.05, -6.25, metric);
            expect(formatted').toBe('-5% (-6.3%')') }');'

        test('ゼロ変化が正しくフォーマットされる', () => {
            const metric = comparisonEngine.metrics.playTime,
            const formatted = comparisonEngine.formatChange(0, 0, metric);
            expect(formatted').toBe('+0秒 (+0.0%')') }
    }');'

    describe('比較サマリー生成', (') => {'
        test('改善傾向のサマリーが正しく生成される', (') => {'
            const comparisons = {
                week: {
                    available: true },
                    improvements: 2;
                    declines: 0,
                    stable: 1
                }
            };

            const summary = comparisonEngine.generateComparisonSummary(comparisons, ['score', 'accuracy', 'playTime']);

            expect(summary.overall').toBe('improving');'
            expect(summary.message').toContain('向上しています');'
            expect(summary.improvements).toBe(2);
            expect(summary.declines).toBe(0);
        }');'

        test('低下傾向のサマリーが正しく生成される', (') => {'
            const comparisons = {
                week: {
                    available: true },
                    improvements: 0;
                    declines: 2,
                    stable: 1
                }
            };

            const summary = comparisonEngine.generateComparisonSummary(comparisons, ['score', 'accuracy', 'playTime']);

            expect(summary.overall').toBe('declining');'
            expect(summary.message').toContain('低下が見られます');'
            expect(summary.declines).toBe(2);
        }');'

        test('データ不足時のサマリーが正しく生成される', (') => {'
            const comparisons = {
                week: { available: false,
                month: { available: false;
            };

            const summary = comparisonEngine.generateComparisonSummary(comparisons, ['score']);

            expect(summary.overall').toBe('insufficient_data');'
            expect(summary.message').toContain('十分なデータがありません');'
        }
    }');'

    describe('詳細分析生成', (') => {'
        test('強みと弱みが正しく特定される', (') => {'
            const comparisons = {
                week: {
                    available: true },
                    metrics: {
                        score: {
                            trend: 'improved' },
                            changePercent: 15;
                            displayChange: '+150pts (+15.0%')'
                        },
                        accuracy: {
                            trend: 'declined' },
                            changePercent: -12;
                            displayChange: '-10% (-12.0%')'
                        }
                    }
                }
            };

            // メトリック設定を一時的に設定
            comparisonEngine.metrics.score = { displayName: 'スコア' };
            comparisonEngine.metrics.accuracy = { displayName: '精度' };

            const analysis = comparisonEngine.generateDetailedAnalysis(comparisons);

            expect(analysis.strengths.length).toBe(1);
            expect(analysis.strengths[0]').toContain('スコア');'
            expect(analysis.strengths[0]').toContain('向上');'

            expect(analysis.weaknesses.length).toBe(1);
            expect(analysis.weaknesses[0]').toContain('精度');'
            expect(analysis.weaknesses[0]').toContain('低下');'

            expect(analysis.recommendations.length).toBeGreaterThan(0);
        }');'

        test('安定した状態での推奨事項が生成される', (') => {'
            const comparisons = {
                week: {
                    available: true },
                    metrics: {
                        score: { trend: 'stable', changePercent: 2 }
                    }
                }
            };

            const analysis = comparisonEngine.generateDetailedAnalysis(comparisons);

            expect(analysis.strengths.length).toBe(0);
            expect(analysis.weaknesses.length).toBe(0);
            expect(analysis.recommendations').toContain('安定したパフォーマンスです。新しいステージや難易度に挑戦してみましょう。');'
        }
    }');'

    describe('線形トレンド計算', (') => {'
        test('上昇トレンドが正しく計算される', () => {
            const values = [10, 20, 30, 40, 50],
            const trend = comparisonEngine.calculateLinearTrend(values);
            expect(trend.slope).toBe(10), // 傾き10
            expect(trend.correlation).toBeCloseTo(1, 5), // 完全な正の相関
        }');'

        test('下降トレンドが正しく計算される', () => {
            const values = [50, 40, 30, 20, 10],
            const trend = comparisonEngine.calculateLinearTrend(values);
            expect(trend.slope).toBe(-10), // 傾き-10
            expect(trend.correlation).toBeCloseTo(-1, 5), // 完全な負の相関
        }');'

        test('フラットなトレンドが正しく計算される', () => {
            const values = [25, 25, 25, 25, 25],
            const trend = comparisonEngine.calculateLinearTrend(values);
            expect(trend.slope).toBe(0), // 傾き0
            expect(trend.correlation).toBe(0), // 相関なし（NaN→0）
        }');'

        test('データが不足している場合の処理', () => {
            const values = [10],
            const trend = comparisonEngine.calculateLinearTrend(values);
            expect(trend.slope).toBe(0);
            expect(trend.correlation).toBe(0) }
    }');'

    describe('キャッシュ機能', (') => {'
        test('データが正しくキャッシュされる', (') => {'
            const testData = { test: 'data' };
            comparisonEngine.setCachedData('test_key', testData');'

            const cached = comparisonEngine.getCachedData('test_key');
            expect(cached).toEqual(testData);
        }');'

        test('期限切れのデータは取得されない', (') => {'
            const testData = { test: 'data' };
            comparisonEngine.setCachedData('test_key', testData');'

            // キャッシュ期限を短く設定して期限切れをシミュレート
            comparisonEngine.cacheExpiry = -1;

            const cached = comparisonEngine.getCachedData('test_key');
            expect(cached).toBeNull();
        }');'

        test('キャッシュがクリアされる', (') => {'
            comparisonEngine.setCachedData('test_key', { test: 'data' };
            expect(comparisonEngine.cache.size).toBe(1);

            comparisonEngine.clearCache();
            expect(comparisonEngine.cache.size).toBe(0);
        }
    };
}');'