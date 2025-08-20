import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Enhanced Analytics Manager Tests
 * EnhancedAnalyticsManagerクラスの単体テスト
 */

import { EnhancedAnalyticsManager } from '../../src/analytics/EnhancedAnalyticsManager';
import Analytics from '../../src/utils/Analytics';

// Analyticsのモック作成
jest.mock('../../src/utils/Analytics.js');
jest.mock('../../src/analytics/PrivacyManager.js');
jest.mock('../../src/analytics/IndexedDBStorageManager.js');
jest.mock('../../src/analytics/DataCollector.js');
jest.mock('../../src/analytics/GameBalanceCollector.js');

// モッククラスの定義
class MockPrivacyManager {
    constructor() {
        this.consentStatus = true;
    }
    
    async requestConsent() {
        return true;
    }
    
    checkConsent() {
        return this.consentStatus;
    }
    
    anonymizeData(data: any869 {
        return { ...data, anonymized: true };
    }
    
    setOptOut(feature, status) {
        this.optOutFeatures = this.optOutFeatures || {};
        this.optOutFeatures[feature] = status;
    }
    
    isOptedOut(feature: any1104 {
        return this.optOutFeatures && this.optOutFeatures[feature];
    }
    
    async exportUserData(callback: any1226 {
        return await callback();
    }
    
    async deleteUserData(callback: any1314 {
        return await callback();
    }
}

class MockIndexedDBStorageManager {
    constructor() {
        this.data = {};
    }
    
    async initialize() {
        return true;
    }
    
    async saveData(storeName, data) {
        this.data[storeName] = this.data[storeName] || [];
        this.data[storeName].push(data);
        return true;
    }
    
    async getData(storeName, query) {
        return this.data[storeName] || [];
    }
    
    async deleteData(storeName, query) {
        this.data[storeName] = [];
        return true;
    }
    
    close() {
        // Mock implementation
    }
}

class MockDataCollector {
    constructor() {
        this.currentSessionId = 'test-session-123';
        this.eventStats = {
            totalEvents: 0,
            sessionEvents: 0,
            bubbleEvents: 0
        };
    }
    
    startSession(sessionInfo: any2198 {
        this.sessionInfo = sessionInfo;
        this.eventStats.sessionEvents++;
    }
    
    endSession(endInfo: any2327 {
        this.endInfo = endInfo;
        this.eventStats.sessionEvents++;
    }
    
    collectBubbleInteraction(bubbleData: any2458 {
        this.eventStats.bubbleEvents++;
        this.eventStats.totalEvents++;
    }
    
    collectScoreData(scoreData: any2590 {
        this.eventStats.totalEvents++;
    }
    
    collectItemUsageData(itemData: any2685 {
        this.eventStats.totalEvents++;
    }
    
    collectPerformanceData(performanceData: any2781 {
        this.eventStats.totalEvents++;
    }
    
    collectGameBalanceData(balanceData: any2884 {
        this.eventStats.totalEvents++;
    }
    
    getEventStats() {
        return this.eventStats;
    }
    
    destroy() {
        // Mock implementation
    }
}

class MockGameBalanceCollector {
    constructor() {
        this.collectedData = [];
    }
    
    collectBubbleSpawn(bubbleInfo: any3197 {
        this.collectedData.push({ type: 'bubbleSpawn', data: bubbleInfo });
    }
    
    collectScoreData(scoreInfo: any3326 {
        this.collectedData.push({ type: 'scoreData', data: scoreInfo });
    }
    
    collectItemEffectData(itemInfo: any3456 {
        this.collectedData.push({ type: 'itemEffect', data: itemInfo });
    }
    
    collectStageDifficultyData(stageInfo: any3590 {
        this.collectedData.push({ type: 'stageDifficulty', data: stageInfo });
    }
    
    collectGameBalanceData(balanceData: any3727 {
        this.collectedData.push({ type: 'gameBalance', data: balanceData });
    }
}

// グローバルモック設定
(global as any).performance = {
    now: jest.fn(() => Date.now()),
    memory: {
        usedJSHeapSize: 50000000,
        totalJSHeapSize: 100000000,
        jsHeapSizeLimit: 200000000
    }
};

(global as any).requestAnimationFrame = jest.fn(callback => setTimeout(callback, 16));

describe('EnhancedAnalyticsManager', () => {
    let analyticsManager: any;
    let mockAnalytics: any;

    beforeEach(() => {
        // Analytics基底クラスのモック
        mockAnalytics = {
            trackEvent: jest.fn(),
            trackError: jest.fn(),
            generateSessionId: jest.fn(() => 'test-session-id'),
            startTime: Date.now()
        };
        
        // デフォルトエクスポートのモック設定
        jest.mocked(Analytics.mockImplementation(() => mockAnalytics));
        
        // コンソールをモック
        jest.spyOn(console, 'info').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // モッククラスを設定
        require('../../src/analytics/PrivacyManager.js').PrivacyManager = MockPrivacyManager;
        require('../../src/analytics/IndexedDBStorageManager.js').IndexedDBStorageManager = MockIndexedDBStorageManager;
        require('../../src/analytics/DataCollector.js').DataCollector = MockDataCollector;
        require('../../src/analytics/GameBalanceCollector.js').GameBalanceCollector = MockGameBalanceCollector;
        
        analyticsManager = new EnhancedAnalyticsManager({
            autoInitialize: false
        });
        
        // アナリティクスのモックを設定
        analyticsManager.analytics = mockAnalytics;
    });

    afterEach(() => {
        if (analyticsManager) {
            analyticsManager.destroy();
        }
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('初期化', () => {
        test('デフォルト設定で正しく初期化される', () => {
            expect(analyticsManager.options.enableGameAnalytics).toBe(true);
            expect(analyticsManager.options.enablePerformanceTracking).toBe(true);
            expect(analyticsManager.options.enableBehaviorAnalysis).toBe(true);
            expect(analyticsManager.isInitialized).toBe(false);
            expect(analyticsManager.isGameAnalyticsEnabled).toBe(false);
        });

        test('カスタム設定で初期化される', () => {
            const customManager = new EnhancedAnalyticsManager({
                enableGameAnalytics: false,
                enablePerformanceTracking: false,
                autoInitialize: false
            });

            expect(customManager.options.enableGameAnalytics).toBe(false);
            expect(customManager.options.enablePerformanceTracking).toBe(false);
        });

        test('initialize()が正常に完了する', async () => {
            await analyticsManager.initialize();

            expect(analyticsManager.isInitialized).toBe(true);
            expect(analyticsManager.isGameAnalyticsEnabled).toBe(true);
            expect(analyticsManager.privacyManager).toBeInstanceOf(MockPrivacyManager);
            expect(analyticsManager.storageManager).toBeInstanceOf(MockIndexedDBStorageManager);
            expect(analyticsManager.dataCollector).toBeInstanceOf(MockDataCollector);
            expect(analyticsManager.gameBalanceCollector).toBeInstanceOf(MockGameBalanceCollector);
        });

        test('同意がない場合は初期化をスキップする', async () => {
            const consentDeniedManager = new EnhancedAnalyticsManager({
                autoInitialize: false
            });
            
            // プライバシーマネージャーをモック
            consentDeniedManager.privacyManager = new MockPrivacyManager();
            consentDeniedManager.privacyManager.consentStatus = false;

            await consentDeniedManager.initialize();

            expect(consentDeniedManager.isGameAnalyticsEnabled).toBe(false);
        });
    });

    describe('基本的な追跡機能', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
        });

        test('ゲームセッション開始を追跡する', () => {
            const sessionInfo = {
                stageId: 'normal',
                difficulty: 'medium',
                soundEnabled: true,
                effectsEnabled: true,
                playerLevel: 5
            };

            analyticsManager.startGameSession(sessionInfo);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_session_start', {
                stage_id: 'normal',
                difficulty: 'medium',
                player_level: 5
            });

            expect(analyticsManager.dataCollector.sessionInfo).toEqual(expect.objectContaining({
                stageId: 'normal',
                difficulty: 'medium'
            }));
        });

        test('ゲームセッション終了を追跡する', () => {
            const endInfo = {
                duration: 120000,
                finalScore: 1500,
                bubblesPopped: 50,
                bubblesMissed: 5,
                maxCombo: 10,
                completed: true,
                exitReason: 'completed'
            };

            analyticsManager.endGameSession(endInfo);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_session_end', {
                duration: 120000,
                final_score: 1500,
                completed: true,
                exit_reason: 'completed'
            });
        });

        test('バブルインタラクションを追跡する', () => {
            const bubbleData = {
                bubbleType: 'normal',
                action: 'popped',
                reactionTime: 450,
                position: { x: 100, y: 200 },
                scoreGained: 10,
                comboCount: 3
            };

            analyticsManager.trackBubbleInteraction(bubbleData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('bubble_interaction', {
                bubble_type: 'normal',
                action: 'popped',
                reaction_time: 450
            });

            expect(analyticsManager.dataCollector.eventStats.bubbleEvents).toBe(1);
        });

        test('スコア獲得を追跡する', () => {
            const scoreData = {
                type: 'bubble',
                amount: 20,
                totalScore: 500,
                source: 'stone',
                multiplier: 2,
                comboCount: 5
            };

            analyticsManager.trackScore(scoreData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('score_gained', {
                score_type: 'bubble',
                amount: 20,
                total_score: 500
            });
        });

        test('アイテム使用を追跡する', () => {
            const itemData = {
                itemType: 'timeExtender',
                cost: 50,
                effectiveness: 0.8,
                duration: 5000
            };

            analyticsManager.trackItemUsage(itemData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('item_used', {
                item_type: 'timeExtender',
                cost: 50,
                effectiveness: 0.8
            });
        });
    });

    describe('ゲームバランス分析機能', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
        });

        test('ゲームバランスデータを追跡する', () => {
            const balanceData = {
                type: 'bubbleFrequency',
                stageId: 'normal',
                difficulty: 'medium',
                bubbleFrequency: {
                    normal: 10,
                    stone: 3,
                    rainbow: 1
                },
                scoreDistribution: {
                    normal: [10, 15, 12],
                    stone: [30, 25, 35]
                },
                completionRate: 0.75,
                averagePlayTime: 180000
            };

            analyticsManager.trackGameBalance(balanceData);

            expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('game_balance', {
                balance_type: 'bubbleFrequency',
                stage_id: 'normal',
                difficulty: 'medium'
            });
        });

        test('ゲームバランス警告を生成する', () => {
            const balanceData = {
                type: 'scoreDistribution',
                stageId: 'normal',
                difficulty: 'medium',
                scoreDistribution: {
                    normal: [10, 500, 12] // 異常に高いスコア
                },
                completionRate: 0.05 // 異常に低い完了率
            };

            analyticsManager.trackGameBalance(balanceData);

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[Game Balance Warning]'),
                expect.any(Object
            );
        });
    });

    describe('パフォーマンス監視', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
        });

        test('パフォーマンス監視が開始される', () => {
            analyticsManager.startPerformanceMonitoring();

            expect(analyticsManager.performanceMonitor.fps).toBeDefined();
            expect(analyticsManager.performanceMonitor.memoryUsage).toBeDefined();
        });

        test('パフォーマンス指標を収集する', () => {
            analyticsManager.collectPerformanceMetrics();

            expect(analyticsManager.dataCollector.eventStats.totalEvents).toBeGreaterThan(0);
        });

        test('低FPS警告を生成する', () => {
            const lowFpsMetrics = {
                fps: 20, // 30fps以下
                memoryUsage: {
                    used: 50000000,
                    total: 100000000,
                    limit: 200000000
                },
                errorCount: 0,
                timestamp: Date.now()
            };

            analyticsManager.checkPerformanceWarnings(lowFpsMetrics);

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[Performance Warning]'),
                expect.stringContaining('Low FPS detected')
            );
        });

        test('高メモリ使用量警告を生成する', () => {
            const highMemoryMetrics = {
                fps: 60,
                memoryUsage: {
                    used: 170000000, // 80%以上
                    total: 200000000,
                    limit: 200000000
                },
                errorCount: 0,
                timestamp: Date.now()
            };

            analyticsManager.checkPerformanceWarnings(highMemoryMetrics);

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('[Performance Warning]'),
                expect.stringContaining('High memory usage')
            );
        });
    });

    describe('プレイヤー行動分析', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
            
            // セッション開始
            analyticsManager.initializePlayerBehaviorTracking({
                stageId: 'normal',
                difficulty: 'medium',
                previousBestScore: 1000
            });
        });

        test('プレイヤー行動を追跡する', () => {
            const behaviorData = {
                type: 'interaction',
                action: 'popped',
                bubbleType: 'normal',
                reactionTime: 300,
                currentScore: 150
            };

            analyticsManager.trackPlayerBehavior(behaviorData);

            expect(analyticsManager.dataCollector.eventStats.totalEvents).toBeGreaterThan(0);
        });

        test('長時間セッションを検出する', () => {
            // 30分以上のセッション時間をシミュレート
            const originalStartTime = analyticsManager.playerBehavior.sessionData.startTime;
            analyticsManager.playerBehavior.sessionData.startTime = Date.now() - (31 * 60 * 1000);

            const behaviorData = {
                type: 'interaction',
                action: 'popped',
                bubbleType: 'normal'
            };

            analyticsManager.trackPlayerBehavior(behaviorData);

            expect(console.info).toHaveBeenCalledWith(
                expect.stringContaining('[Analytics] Long session detected')
            );
        });

        test('離脱行動を分析する', () => {
            const exitData = {
                type: 'exit',
                reason: 'quit',
                stageProgress: 0.6,
                timeRemaining: 60000,
                playerHP: 20,
                currentScore: 500
            };

            const sessionDuration = 120000;
            analyticsManager.trackExitBehavior(exitData, sessionDuration);

            expect(analyticsManager.playerBehavior.sessionStats.exitEvents).toHaveLength(1);
        });

        test('プレイスタイルを分析する', () => {
            // 攻撃的プレイスタイル（速い反応時間）
            const aggressivePattern = {
                bubbleType: 'normal',
                action: 'popped',
                reactionTime: 250,
                accuracy: 1
            };

            analyticsManager.analyzePlayStyle(aggressivePattern);

            expect(analyticsManager.playerBehavior.playStyle.aggressive).toBe(1);
        });

        test('スキル向上を計算する', () => {
            // 履歴データを設定
            analyticsManager.playerBehavior.skillProgression.accuracyHistory = [0.6, 0.7, 0.8];
            analyticsManager.playerBehavior.skillProgression.reactionTimeHistory = [800, 700, 600];

            const improvement = analyticsManager.calculateSkillImprovement();

            expect(improvement).toHaveProperty('improved');
            expect(improvement).toHaveProperty('accuracyDelta');
            expect(improvement).toHaveProperty('reactionTimeDelta');
        });
    });

    describe('エラーハンドリング', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
        });

        test('エラーを追跡する', () => {
            const error = new Error('Test error');
            const context = { component: 'TestComponent' };

            analyticsManager.trackError(error, context);

            expect(mockAnalytics.trackError).toHaveBeenCalledWith(error, context);
            expect(analyticsManager.performanceMonitor.errorCount).toBe(1);
        });

        test('初期化エラーを処理する', () => {
            const error = new Error('Initialization failed');
            
            analyticsManager.handleInitializationError(error);

            expect(analyticsManager.isGameAnalyticsEnabled).toBe(false);
            expect(console.warn).toHaveBeenCalledWith(
                'Falling back to basic analytics only'
            );
        });
    });

    describe('設定管理', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
        });

        test('設定を更新する', () => {
            const newSettings = {
                enableGameAnalytics: false,
                enablePerformanceTracking: true,
                privacySettings: {
                    dataCollection: true,
                    errorReporting: false
                }
            };

            analyticsManager.updateSettings(newSettings);

            expect(analyticsManager.options.enableGameAnalytics).toBe(false);
            expect(analyticsManager.options.enablePerformanceTracking).toBe(true);
            expect(analyticsManager.isGameAnalyticsEnabled).toBe(false);
        });

        test('統計情報を取得する', () => {
            const stats = analyticsManager.getAnalyticsStats();

            expect(stats).toHaveProperty('isInitialized');
            expect(stats).toHaveProperty('isGameAnalyticsEnabled');
            expect(stats).toHaveProperty('performanceMonitor');
            expect(stats).toHaveProperty('playerSkillLevel');
            expect(stats).toHaveProperty('playStyleDistribution');
        });
    });

    describe('データ管理', () => {
        beforeEach(async () => {
            await analyticsManager.initialize();
        });

        test('データをエクスポートする', async () => {
            const exportedData = await analyticsManager.exportData();

            expect(exportedData).toHaveProperty('sessions');
            expect(exportedData).toHaveProperty('bubbleInteractions');
            expect(exportedData).toHaveProperty('performance');
        });

        test('データを削除する', async () => {
            await analyticsManager.deleteData();

            expect(analyticsManager.storageManager.data.sessions).toEqual([]);
            expect(analyticsManager.storageManager.data.bubbleInteractions).toEqual([]);
            expect(analyticsManager.storageManager.data.performance).toEqual([]);
        });
    });

    describe('既存機能との互換性', () => {
        test('基本のAnalyticsのメソッドが利用可能', () => {
            expect(analyticsManager.analytics.trackEvent).toBeDefined();
            expect(analyticsManager.analytics.trackError).toBeDefined();
        });

        test('基本のAnalyticsが無効でも動作する', async () => {
            const managerWithoutAnalytics = new EnhancedAnalyticsManager({
                autoInitialize: false
            });
            
            // Analytics基底クラスのメソッドが存在しない場合をシミュレート
            managerWithoutAnalytics.analytics = null;
            
            await managerWithoutAnalytics.initialize();

            // エラーが発生せずに動作することを確認
            expect(() => {
                managerWithoutAnalytics.startGameSession({
                    stageId: 'test',
                    difficulty: 'easy'
                });
            }).not.toThrow();
        });

        test('段階的な機能無効化が正常に動作する', async () => {
            const limitedManager = new EnhancedAnalyticsManager({
                enableGameAnalytics: false,
                enablePerformanceTracking: false,
                enableBehaviorAnalysis: false,
                autoInitialize: false
            });

            await limitedManager.initialize();

            // 機能が無効化されていても基本動作は維持される
            expect(() => {
                limitedManager.trackBubbleInteraction({
                    bubbleType: 'normal',
                    action: 'popped'
                });
            }).not.toThrow();
        });
    });

    describe('メモリ管理', () => {
        test('destroy()が正常に動作する', async () => {
            await analyticsManager.initialize();
            
            analyticsManager.destroy();

            expect(analyticsManager.isInitialized).toBe(false);
            expect(analyticsManager.isGameAnalyticsEnabled).toBe(false);
        });

        test('破棄後の操作でエラーが発生しない', async () => {
            await analyticsManager.initialize();
            analyticsManager.destroy();

            // 破棄後の操作でエラーが発生しないことを確認
            expect(() => {
                analyticsManager.trackBubbleInteraction({
                    bubbleType: 'normal',
                    action: 'popped'
                });
            }).not.toThrow();
        });
    });
});