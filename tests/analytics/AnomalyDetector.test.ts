import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { AnomalyDetector } from '../../src/analytics/AnomalyDetector';
// モックStorageManager
class MockStorageManager {
    constructor() {
        this.data = new Map() }
    async getData(storeName, query) {
        const storeData = this.data.get(storeName || []),
        if (!query) return storeData,
        return storeData.filter(item => {),
            if (query.startDate && query.endDate) {
                const itemDate = new Date(item.startTime || item.timestamp),
                return itemDate >= query.startDate && itemDate <= query.endDate }
            return true;
        });
    }
    setTestData(storeName, data) {
        this.data.set(storeName, data') }
}
describe('AnomalyDetector', () => {
    let anomalyDetector: any,
    let mockStorageManager: any,
    beforeEach(() => {
        mockStorageManager = new MockStorageManager(),
        anomalyDetector = new AnomalyDetector(mockStorageManager) });
    afterEach(() => {
        // 閾値をリセット
        anomalyDetector.thresholds.statistical = 2.5,
        anomalyDetector.thresholds.behavioral = 0.8,
        anomalyDetector.thresholds.performance = 3.0,
        anomalyDetector.thresholds.temporal = 0.9 }');
    describe('コンストラクタ', (') => {
        test('正しく初期化される', () => {
            expect(anomalyDetector.storageManager).toBe(mockStorageManager),
            expect(anomalyDetector.detectionRules).toBeInstanceOf(Map),
            expect(anomalyDetector.alertHistory).toEqual([]),
            expect(anomalyDetector.maxAlertHistory).toBe(100),
            // 閾値の確認
            expect(anomalyDetector.thresholds.statistical).toBe(2.5),
            expect(anomalyDetector.thresholds.behavioral).toBe(0.8),
            expect(anomalyDetector.thresholds.performance).toBe(3.0),
            expect(anomalyDetector.thresholds.temporal).toBe(0.9) }');
        test('検出ルールが正しく初期化される', () => {
            expect(anomalyDetector.detectionRules.size).toBe(8),
            expect(anomalyDetector.detectionRules.has(anomalyDetector.anomalyTypes.SCORE_OUTLIER).toBe(true),
            expect(anomalyDetector.detectionRules.has(anomalyDetector.anomalyTypes.ACCURACY_DROP).toBe(true),
            expect(anomalyDetector.detectionRules.has(anomalyDetector.anomalyTypes.PERFORMANCE_DEGRADATION).toBe(true) }');
    }
    describe('異常パターン検出', (') => {
        test('データが不足している場合、適切なメッセージを返す', async (') => {
            mockStorageManager.setTestData('sessions', []'),
            mockStorageManager.setTestData('interactions', []'),
            mockStorageManager.setTestData('performance', []),
            const result = await anomalyDetector.detectAnomalies(),
            expect(result.success).toBe(true),
            expect(result.anomalies).toEqual([]),
            expect(result.summary').toContain('分析対象データが不足しています'),
            expect(result.recommendations).toEqual([]) }');
        test('正常データの場合、異常が検出されない', async (') => {
            // 正常なセッションデータ
            const normalSessions: any[] = [],
            const baseDate = new Date('2024-01-01'),
            for (let i = 0, i < 10, i++) {
                const sessionDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000),
                normalSessions.push({),
                    sessionId: `session-${i)`,
                    startTime: sessionDate.getTime(
                    endTime: sessionDate.getTime() + 300000, // 5分
                    finalScore: 1000 + Math.random() * 200, // 正常な範囲のスコア
                    bubblesPopped: 50 + Math.floor(Math.random() * 10,
                    bubblesMissed: 5 + Math.floor(Math.random() * 5,
                    maxCombo: 10 + Math.floor(Math.random() * 5'},
                    completed: true,
                    exitReason: 'completed'
                }');
            }
            mockStorageManager.setTestData('sessions', normalSessions');
            mockStorageManager.setTestData('interactions', []');
            mockStorageManager.setTestData('performance', []);
            const result = await anomalyDetector.detectAnomalies();
            expect(result.success).toBe(true);
            expect(result.anomalies.length).toBeLessThanOrEqual(2); // 正常データでも若干の異常は許容
        }');
    }
    describe('スコア異常値検出', (') => {
        test('スコアの異常値を正しく検出する', (') => {
            // より小さな閾値を設定してテスト
            anomalyDetector.thresholds.statistical = 1.5,
            
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, finalScore: 100 },
                    { sessionId: 's2', startTime: 2000, finalScore: 110 },
                    { sessionId: 's3', startTime: 3000, finalScore: 105 },
                    { sessionId: 's4', startTime: 4000, finalScore: 115 },
                    { sessionId: 's5', startTime: 5000, finalScore: 1000 }, // より大きな異常値
                    { sessionId: 's6', startTime: 6000, finalScore: 108 }
                ]
            };
            const outliers = anomalyDetector.detectScoreOutliers(testData);
            expect(outliers.length).toBeGreaterThan(0);
            expect(outliers[0].sessionId').toBe('s5');
            expect(outliers[0].value).toBe(1000);
            expect(outliers[0]').toHaveProperty('zScore');
            expect(outliers[0]').toHaveProperty('expectedRange');
        }');
        test('データが不足している場合、空配列を返す', (') => {
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, finalScore: 100 },
                    { sessionId: 's2', startTime: 2000, finalScore: 110 }
                ]
            };
            const outliers = anomalyDetector.detectScoreOutliers(testData);
            expect(outliers).toEqual([]);
        }');
        test('標準偏差が0の場合、空配列を返す', (') => {
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, finalScore: 100 },
                    { sessionId: 's2', startTime: 2000, finalScore: 100 },
                    { sessionId: 's3', startTime: 3000, finalScore: 100 },
                    { sessionId: 's4', startTime: 4000, finalScore: 100 },
                    { sessionId: 's5', startTime: 5000, finalScore: 100 }
                ]
            };
            const outliers = anomalyDetector.detectScoreOutliers(testData);
            expect(outliers).toEqual([]);
        }');
    }
    describe('精度急降下検出', (') => {
        test('精度の急降下を正しく検出する', (') => {
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, bubblesPopped: 90, bubblesMissed: 10 }, // 90%
                    { sessionId: 's2', startTime: 2000, bubblesPopped: 85, bubblesMissed: 15 }, // 85%
                    { sessionId: 's3', startTime: 3000, bubblesPopped: 40,
        bubblesMissed: 60 }  // 40% (急降下
            });
                ]
            };
            const drops = anomalyDetector.detectAccuracyDrop(testData);
            expect(drops.length).toBeGreaterThan(0);
            expect(drops[0].sessionId').toBe('s3');
            expect(drops[0].currentAccuracy).toBeCloseTo(0.4);
            expect(drops[0]').toHaveProperty('dropPercentage');
            expect(drops[0].dropPercentage).toBeGreaterThan(0);
        }');
        test('データが不足している場合、空配列を返す', (') => {
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, bubblesPopped: 90, bubblesMissed: 10 }
                ]
            };
            const drops = anomalyDetector.detectAccuracyDrop(testData);
            expect(drops).toEqual([]);
        }');
    }
    describe('プレイ時間異常検出', (') => {
        test('プレイ時間の異常を正しく検出する', (') => {
            // より小さな閾値を設定してテスト
            anomalyDetector.thresholds.statistical = 1.5,
            
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, endTime: 1000 + 300000 }, // 5分
                    { sessionId: 's2', startTime: 2000, endTime: 2000 + 320000 }, // 5.3分
                    { sessionId: 's3', startTime: 3000, endTime: 3000 + 310000 }, // 5.2分
                    { sessionId: 's4', startTime: 4000, endTime: 4000 + 290000 }, // 4.8分
                    { sessionId: 's5', startTime: 5000, endTime: 5000 + 10000 },  // 10秒 (異常に短い')
                    { sessionId: 's6', startTime: 6000, endTime: 6000 + 300000 }  // 5分
                ]
            };
            const anomalies = anomalyDetector.detectPlayTimeAnomaly(testData);
            expect(anomalies.length).toBeGreaterThan(0');
            const shortSession = anomalies.find(a => a.sessionId === 's5');
            expect(shortSession).toBeDefined();
            expect(shortSession.anomalyType').toBe('unusually_short');
        }');
        test('durationプロパティを使用する場合も正常に動作する', (') => {
            // より小さな閾値を設定してテスト
            anomalyDetector.thresholds.statistical = 1.5,
            
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, duration: 300 }, // 5分
                    { sessionId: 's2', startTime: 2000, duration: 320 },
                    { sessionId: 's3', startTime: 3000, duration: 310 },
                    { sessionId: 's4', startTime: 4000, duration: 290 },
                    { sessionId: 's5', startTime: 5000, duration: 10 },  // 10秒 (異常に短い')
                    { sessionId: 's6', startTime: 6000, duration: 300 }
                ]
            };
            const anomalies = anomalyDetector.detectPlayTimeAnomaly(testData);
            expect(anomalies.length).toBeGreaterThan(0);
        }');
    }
    describe('コンボ一貫性異常検出', (') => {
        test('コンボの一貫性問題を検出する', (') => {
            const testData = {
                sessions: [
                    { sessionId: 's1', startTime: 1000, maxCombo: 10 },
                    { sessionId: 's2', startTime: 2000, maxCombo: 12 },
                    { sessionId: 's3', startTime: 3000, maxCombo: 11 },
                    { sessionId: 's4', startTime: 4000, maxCombo: 13 },
                    { sessionId: 's5', startTime: 5000, maxCombo: 9 },
                    { sessionId: 's6', startTime: 6000, maxCombo: 50 }, // 異常に高い
                    { sessionId: 's7', startTime: 7000, maxCombo: 2 }   // 異常に低い
                ]
            };
            const inconsistencies = anomalyDetector.detectComboInconsistency(testData);
            expect(inconsistencies.length).toBeGreaterThan(0);
            expect(inconsistencies[0]').toHaveProperty('consistencyScore');
            expect(inconsistencies[0]').toHaveProperty('variability');
        }');
    }
    describe('バブルインタラクション異常検出', (') => {
        test('遅い反応時間の異常を検出する', (') => {
            // より小さな閾値を設定してテスト
            anomalyDetector.thresholds.statistical = 0.5, // 大幅に下げる
            
            const testData = {
                interactions: [
                    { sessionId: 's1', timestamp: 1000, reactionTime: 200 },
                    { sessionId: 's1', timestamp: 1200, reactionTime: 210 },
                    { sessionId: 's1', timestamp: 1400, reactionTime: 10000 }, // 異常に遅い
                    { sessionId: 's1', timestamp: 1600, reactionTime: 9500 }, // 異常に遅い
                    { sessionId: 's1', timestamp: 1800, reactionTime: 11000 }, // 異常に遅い
                    { sessionId: 's1', timestamp: 2000, reactionTime: 9800 }, // 異常に遅い
                    { sessionId: 's1', timestamp: 2200, reactionTime: 10500 }, // 異常に遅い
                    { sessionId: 's1', timestamp: 2400, reactionTime: 220 },
                    { sessionId: 's1', timestamp: 2600, reactionTime: 190 },
                    { sessionId: 's1', timestamp: 2800, reactionTime: 205 }
                ]
            };
            const anomalies = anomalyDetector.detectBubbleInteractionAnomaly(testData);
            expect(anomalies.length).toBeGreaterThan(0);
            expect(anomalies[0].anomalyType').toBe('slow_reactions');
            expect(anomalies[0]').toHaveProperty('slowReactionRatio');
            expect(anomalies[0].slowReactionRatio).toBeGreaterThan(0.2);
        }');
        test('インタラクションデータがない場合、空配列を返す', () => {
            const testData = { interactions: [] };
            const anomalies = anomalyDetector.detectBubbleInteractionAnomaly(testData);
            expect(anomalies).toEqual([]);
        }');
    }
    describe('パフォーマンス劣化検出', (') => {
        test('FPS低下を検出する', () => {
            const testData = {
                performance: [
                    { fps: 60 }, { fps: 58 }, { fps: 62 }, { fps: 59 },
                    { fps: 25 }, { fps: 20 }, { fps: 28 }, { fps: 22 }, // 低FPS
                    { fps: 24 }, { fps: 26 }, { fps: 23 }, { fps: 27 },
                    { fps: 21 }, { fps: 29 }, { fps: 25 }
                ]
            };
            const anomalies = anomalyDetector.detectPerformanceDegradation(testData);
            expect(anomalies.length).toBeGreaterThan(0);
            expect(anomalies[0]').toHaveProperty('lowPerformanceRatio');
            expect(anomalies[0].lowPerformanceRatio).toBeGreaterThan(0.3);
        }');
        test('パフォーマンスデータが不足している場合、空配列を返す', () => {
            const testData = { performance: [] };
            const anomalies = anomalyDetector.detectPerformanceDegradation(testData);
            expect(anomalies).toEqual([]);
        }');
    }
    describe('異常な終了パターン検出', (') => {
        test('途中終了が多い場合を検出する', (') => {
            const testData = {
                sessions: [
                    { sessionId: 's1', exitReason: 'quit', endTime: 1000 + 60000, startTime: 1000 },
                    { sessionId: 's2', exitReason: 'quit', endTime: 2000 + 80000, startTime: 2000 },
                    { sessionId: 's3', exitReason: 'completed', endTime: 3000 + 300000, startTime: 3000 },
                    { sessionId: 's4', exitReason: 'quit', endTime: 4000 + 45000, startTime: 4000 },
                    { sessionId: 's5', exitReason: 'quit', endTime: 5000 + 90000, startTime: 5000 },
                    { sessionId: 's6', exitReason: 'quit', endTime: 6000 + 120000, startTime: 6000 },
                    { sessionId: 's7', exitReason: 'completed', endTime: 7000 + 280000, startTime: 7000 },
                    { sessionId: 's8', exitReason: 'quit', endTime: 8000 + 50000, startTime: 8000 },
                    { sessionId: 's9', exitReason: 'quit', endTime: 9000 + 70000, startTime: 9000 },
                    { sessionId: 's10', exitReason: 'quit', endTime: 10000 + 40000, startTime: 10000 }
                ]
            };
            const anomalies = anomalyDetector.detectUnusualQuitPattern(testData);
            expect(anomalies.length).toBeGreaterThan(0);
            expect(anomalies[0].quitRatio).toBeGreaterThan(0.4);
            expect(anomalies[0]').toHaveProperty('pattern');
        }');
    }
    describe('重要度分析', (') => {
        test('重要度別分布を正しく計算する', (') => {
            const results = [
                { severity: 'low' },
                { severity: 'medium' },
                { severity: 'medium' },
                { severity: 'high' },
                { severity: 'critical' }
            ];
            const breakdown = anomalyDetector.calculateSeverityBreakdown(results);
            expect(breakdown.low).toBe(1);
            expect(breakdown.medium).toBe(2);
            expect(breakdown.high).toBe(1);
            expect(breakdown.critical).toBe(1);
        }');
    }
    describe('サマリー生成', (') => {
        test('異常なしの場合、適切なメッセージを生成する', () => {
            const summary = anomalyDetector.generateAnomalySummary([]),
            expect(summary').toBe('異常なパターンは検出されませんでした。') }');
        test('異常ありの場合、詳細なサマリーを生成する', (') => {
            const results = [
                { type: 'score_outlier', severity: 'medium' },
                { type: 'accuracy_drop', severity: 'high' },
                { type: 'score_outlier', severity: 'medium' }
            ];
            const summary = anomalyDetector.generateAnomalySummary(results);
            expect(summary').toContain('3件の異常パターンが検出されました');
            expect(summary').toContain('1件は高優先度');
            expect(summary').toContain('最も多い問題は');
        }');
    }
    describe('推奨事項生成', (') => {
        test('タイプ別の推奨事項を生成する', (') => {
            const results = [
                { type: anomalyDetector.anomalyTypes.SCORE_OUTLIER, severity: 'medium' },
                { type: anomalyDetector.anomalyTypes.ACCURACY_DROP, severity: 'high' }
            ];
            const recommendations = anomalyDetector.generateRecommendations(results);
            expect(recommendations.length).toBe(2);
            expect(recommendations[0]').toContain('スコアの変動');
            expect(recommendations[1]').toContain('精度が低下');
        }');
    }
    describe('アラート履歴管理', (') => {
        test('アラート履歴に正しく保存される', (') => {
            const results = [
                { type: 'test_anomaly', severity: 'medium', description: 'テスト異常' }
            ];
            anomalyDetector.saveToAlertHistory(results);
            const history = anomalyDetector.getAlertHistory();
            expect(history.length).toBe(1);
            expect(history[0]').toHaveProperty('id');
            expect(history[0]').toHaveProperty('timestamp');
            expect(history[0].type').toBe('test_anomaly');
        }');
        test('履歴サイズが制限される', () => {
            // maxAlertHistoryを小さく設定
            anomalyDetector.maxAlertHistory = 3,
            // 5件のアラートを追加
            for (let i = 0, i < 5, i++') {
                anomalyDetector.saveToAlertHistory([
                    { type: `test_${i}`, severity: 'low', description: `Test ${i}`
            });
                ]);
            }
            const history = anomalyDetector.getAlertHistory();
            expect(history.length).toBe(3); // 最新の3件のみ保持
        }');
    }
    describe('設定管理', (') => {
        test('閾値を更新できる', () => {
            const newThresholds = {
                statistical: 3.0,
                behavioral: 0.9
            };
            anomalyDetector.updateThresholds(newThresholds);
            expect(anomalyDetector.thresholds.statistical).toBe(3.0);
            expect(anomalyDetector.thresholds.behavioral).toBe(0.9);
            expect(anomalyDetector.thresholds.performance).toBe(3.0); // 変更されない
        }');
        test('表示名を正しく取得する', () => {
            const displayName = anomalyDetector.getTypeDisplayName(
                anomalyDetector.anomalyTypes.SCORE_OUTLIER),
            expect(displayName').toBe('スコア異常'),
            const unknownDisplayName = anomalyDetector.getTypeDisplayName('unknown_type'),
            expect(unknownDisplayName').toBe('unknown_type') }');
    }
    describe('キャッシュ管理', (') => {
        test('キャッシュが正しくクリアされる', (') => {
            // アラート履歴を追加
            anomalyDetector.saveToAlertHistory([
                { type: 'test', severity: 'low', description: 'Test'
            });
            ]);
            expect(anomalyDetector.alertHistory.length).toBe(1);
            anomalyDetector.clearCache();
            expect(anomalyDetector.alertHistory.length).toBe(0);
        }');
    }
    describe('エラーハンドリング', (') => {
        test('ストレージエラーが適切に処理される', async () => {
            mockStorageManager.getData = jest.fn(') as jest.Mock.mockRejectedValue(new Error('Database error'),
            const result = await anomalyDetector.detectAnomalies(),
            expect(result.success).toBe(false),
            expect(result.error').toBe('Database error'),
            expect(result.anomalies).toEqual([]) });
    }
}');