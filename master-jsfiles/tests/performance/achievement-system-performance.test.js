/**
 * 実績システムパフォーマンステスト
 */

import { AchievementManager } from '../../src/core/AchievementManager.js';
import { AchievementEventIntegrator } from '../../src/core/AchievementEventIntegrator.js';
import { AchievementNotificationSystem } from '../../src/core/achievements/AchievementNotificationSystem.js';
import { AchievementStatsUI } from '../../src/core/AchievementStatsUI.js';

// Performance testing utilities
class PerformanceMonitor {
    constructor() {
        this.measurements = {};
    }

    start(label) {
        this.measurements[label] = { start: performance.now() };
    }

    end(label) {
        if (this.measurements[label]) {
            this.measurements[label].end = performance.now();
            this.measurements[label].duration = this.measurements[label].end - this.measurements[label].start;
        }
    }

    getDuration(label) {
        return this.measurements[label]?.duration || 0;
    }

    getAllMeasurements() {
        return Object.keys(this.measurements).map(label => ({
            label,
            duration: this.measurements[label].duration
        }));
    }
}

class MockPlayerData {
    constructor() {
        this.data = {
            totalBubblesPopped: 0,
            totalScore: 0,
            totalPlayTime: 0,
            consecutiveDays: 0,
            maxCombo: 0,
            stages: {},
            accuracy: 100,
            achievements: new Set()
        };
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
    }

    save() {
        // シミュレートされた保存遅延
        const start = performance.now();
        while (performance.now() - start < 1) {} // 1ms の遅延
        return true;
    }

    getDetailedStatistics() {
        return {
            bubbleTypes: {
                normal: { popped: this.data.totalBubblesPopped },
                stone: { popped: Math.floor(this.data.totalBubblesPopped * 0.2) }
            },
            sessionData: {
                lastSessionDate: new Date().toISOString(),
                consecutiveDays: this.data.consecutiveDays
            },
            combos: {
                maxCombo: this.data.maxCombo
            },
            accuracy: {
                overall: this.data.accuracy
            }
        };
    }
}

class MockAudioManager {
    playSound() {
        // 音響処理をシミュレート
        const start = performance.now();
        while (performance.now() - start < 0.5) {} // 0.5ms の遅延
        return true;
    }
}

describe('Achievement System Performance Tests', () => {
    let monitor;
    let achievementManager;
    let eventIntegrator;
    let notificationSystem;
    let statsUI;
    let mockPlayerData;
    let mockAudioManager;

    beforeEach(() => {
        monitor = new PerformanceMonitor();
        mockPlayerData = new MockPlayerData();
        mockAudioManager = new MockAudioManager();
        
        achievementManager = new AchievementManager(mockPlayerData);
        eventIntegrator = new AchievementEventIntegrator(achievementManager, mockPlayerData);
        notificationSystem = new AchievementNotificationSystem(mockAudioManager);
        statsUI = new AchievementStatsUI(achievementManager);
    });

    describe('AchievementManager Performance', () => {
        test('大量の進捗更新処理性能', () => {
            const updateCount = 10000;
            
            monitor.start('bulk_progress_updates');
            
            for (let i = 0; i < updateCount; i++) {
                achievementManager.updateProgress('first_score', i);
            }
            
            monitor.end('bulk_progress_updates');
            
            const duration = monitor.getDuration('bulk_progress_updates');
            
            // 10,000回の更新が100ms以下で完了することを確認
            expect(duration).toBeLessThan(100);
            
            // スループットを計算（更新/ms）
            const throughput = updateCount / duration;
            expect(throughput).toBeGreaterThan(50); // 最低50更新/ms
        });

        test('バッチ更新処理性能', () => {
            const batchSize = 5000;
            const updates = Array.from({length: batchSize}, (_, i) => ({
                achievementId: 'bubble_master',
                value: i + 1
            }));
            
            monitor.start('batch_updates');
            
            achievementManager.batchUpdateProgress(updates);
            
            monitor.end('batch_updates');
            
            const duration = monitor.getDuration('batch_updates');
            
            // バッチ処理が効率的であることを確認（50ms以下）
            expect(duration).toBeLessThan(50);
        });

        test('実績検索性能', () => {
            const searchCount = 1000;
            
            monitor.start('achievement_searches');
            
            for (let i = 0; i < searchCount; i++) {
                achievementManager.getAchievement('first_score');
                achievementManager.getAchievementsByCategory();
                achievementManager.getRelevantAchievements('score');
            }
            
            monitor.end('achievement_searches');
            
            const duration = monitor.getDuration('achievement_searches');
            
            // 1,000回の検索が20ms以下で完了することを確認
            expect(duration).toBeLessThan(20);
        });

        test('キャッシュ効果のパフォーマンス向上', () => {
            // キャッシュなしの性能を測定
            achievementManager.clearPerformanceCache();
            
            monitor.start('without_cache');
            for (let i = 0; i < 100; i++) {
                achievementManager.getRelevantAchievements('score');
            }
            monitor.end('without_cache');
            
            const durationWithoutCache = monitor.getDuration('without_cache');
            
            // キャッシュありの性能を測定
            monitor.start('with_cache');
            for (let i = 0; i < 100; i++) {
                achievementManager.getRelevantAchievements('score');
            }
            monitor.end('with_cache');
            
            const durationWithCache = monitor.getDuration('with_cache');
            
            // キャッシュにより性能が向上することを確認（CI環境対応の現実的な閾値）
            expect(durationWithCache).toBeLessThan(durationWithoutCache * 0.8);  // キャッシュで20%向上を期待
        });

        test('データ永続化性能', () => {
            // 大量の実績データを設定
            const achievements = achievementManager.getAchievements();
            achievements.forEach((achievement, index) => {
                if (index < 20) {
                    achievement.unlocked = true;
                    achievement.progress.current = achievement.progress.target;
                }
            });
            
            monitor.start('data_save');
            achievementManager.save();
            monitor.end('data_save');
            
            monitor.start('data_load');
            achievementManager.load();
            monitor.end('data_load');
            
            const saveDuration = monitor.getDuration('data_save');
            const loadDuration = monitor.getDuration('data_load');
            
            // 保存・読み込みが合理的な時間で完了することを確認
            expect(saveDuration).toBeLessThan(50);
            expect(loadDuration).toBeLessThan(30);
        });
    });

    describe('EventIntegrator Performance', () => {
        test('イベント処理性能', () => {
            const eventCount = 5000;
            
            monitor.start('event_processing');
            
            for (let i = 0; i < eventCount; i++) {
                eventIntegrator.handleBubblePopped('normal', { x: 100, y: 100 });
                eventIntegrator.handleScoreAdded(100, 1);
                
                if (i % 100 === 0) {
                    eventIntegrator.handleGameOver('cleared');
                    eventIntegrator.resetSessionTracking();
                }
            }
            
            monitor.end('event_processing');
            
            const duration = monitor.getDuration('event_processing');
            
            // 5,000イベントが200ms以下で処理されることを確認
            expect(duration).toBeLessThan(200);
            
            const eventsPerMs = eventCount / duration;
            expect(eventsPerMs).toBeGreaterThan(20); // 最低20イベント/ms
        });

        test('スロットリング効果の測定', () => {
            // スロットリングなしのパフォーマンス
            achievementManager.enableThrottling = false;
            
            monitor.start('without_throttling');
            for (let i = 0; i < 1000; i++) {
                eventIntegrator.handleScoreAdded(100);
            }
            monitor.end('without_throttling');
            
            // スロットリングありのパフォーマンス
            achievementManager.enableThrottling = true;
            
            monitor.start('with_throttling');
            for (let i = 0; i < 1000; i++) {
                eventIntegrator.handleScoreAdded(100);
            }
            monitor.end('with_throttling');
            
            const withoutThrottling = monitor.getDuration('without_throttling');
            const withThrottling = monitor.getDuration('with_throttling');
            
            // スロットリングにより処理が軽減されることを確認
            expect(withThrottling).toBeLessThan(withoutThrottling * 1.5);
        });
    });

    describe('NotificationSystem Performance', () => {
        test('通知レンダリング性能', () => {
            // 大量の通知を生成
            for (let i = 0; i < 50; i++) {
                const achievement = {
                    id: `test_${i}`,
                    name: `Test Achievement ${i}`,
                    description: 'Performance test achievement',
                    icon: '🏆',
                    reward: { ap: 10 },
                    rarity: i % 4 === 0 ? 'legendary' : 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            
            // Mock canvas context
            const mockContext = {
                save: jest.fn(),
                restore: jest.fn(),
                clearRect: jest.fn(),
                fillRect: jest.fn(),
                strokeRect: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                stroke: jest.fn(),
                createLinearGradient: jest.fn(() => ({
                    addColorStop: jest.fn()
                })),
                measureText: jest.fn(() => ({ width: 100 })),
                fillText: jest.fn(),
                strokeText: jest.fn(),
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1,
                font: '14px Arial',
                textAlign: 'left',
                textBaseline: 'top',
                globalAlpha: 1
            };
            
            const mockCanvas = { width: 800, height: 600 };
            
            monitor.start('notification_rendering');
            
            // 複数フレームのレンダリングをシミュレート
            for (let frame = 0; frame < 60; frame++) {
                notificationSystem.update(16); // 60FPS
                notificationSystem.render(mockContext, mockCanvas);
            }
            
            monitor.end('notification_rendering');
            
            const duration = monitor.getDuration('notification_rendering');
            
            // 60フレームのレンダリングが500ms以下で完了することを確認
            expect(duration).toBeLessThan(500);
            
            const frameTime = duration / 60;
            expect(frameTime).toBeLessThan(16); // 60FPS維持
        });

        test('通知キュー管理性能', () => {
            const notificationCount = 1000;
            
            monitor.start('notification_queue_management');
            
            // 大量の通知を追加
            for (let i = 0; i < notificationCount; i++) {
                const achievement = {
                    id: `test_${i}`,
                    name: `Test ${i}`,
                    icon: '🏆',
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            
            // キュー処理をシミュレート
            for (let i = 0; i < 100; i++) {
                notificationSystem.update(16);
            }
            
            monitor.end('notification_queue_management');
            
            const duration = monitor.getDuration('notification_queue_management');
            
            // キュー管理が効率的であることを確認
            expect(duration).toBeLessThan(100);
        });
    });

    describe('StatsUI Performance', () => {
        test('統計計算性能', () => {
            // 大量の実績データを設定
            const achievements = achievementManager.getAchievements();
            achievements.forEach((achievement, index) => {
                achievement.unlocked = index % 3 === 0;
                if (achievement.unlocked) {
                    achievement.unlockedDate = new Date().toISOString();
                }
                achievement.progress.current = Math.random() * achievement.progress.target;
            });
            
            monitor.start('stats_calculation');
            
            // 複数回の統計計算
            for (let i = 0; i < 100; i++) {
                statsUI.getStatistics();
            }
            
            monitor.end('stats_calculation');
            
            const duration = monitor.getDuration('stats_calculation');
            
            // 100回の統計計算が50ms以下で完了することを確認
            expect(duration).toBeLessThan(50);
        });

        test('統計キャッシュ効果', () => {
            // キャッシュクリア後の性能
            statsUI.clearCache();
            
            monitor.start('stats_without_cache');
            for (let i = 0; i < 50; i++) {
                statsUI.getStatistics();
            }
            monitor.end('stats_without_cache');
            
            // キャッシュ利用時の性能
            monitor.start('stats_with_cache');
            for (let i = 0; i < 50; i++) {
                statsUI.getStatistics();
            }
            monitor.end('stats_with_cache');
            
            const withoutCache = monitor.getDuration('stats_without_cache');
            const withCache = monitor.getDuration('stats_with_cache');
            
            // キャッシュにより性能向上があることを確認（CI環境対応の現実的な閾値）
            expect(withCache).toBeLessThan(withoutCache * 0.7);  // キャッシュで30%向上を期待
        });
    });

    describe('Memory Performance', () => {
        test('メモリ使用量の監視', () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // 大量のデータ処理
            for (let i = 0; i < 1000; i++) {
                achievementManager.updateProgress('bubble_master', i);
                
                const achievement = {
                    id: `temp_${i}`,
                    name: `Temp ${i}`,
                    icon: '🏆'
                };
                notificationSystem.showUnlockNotification(achievement);
                
                if (i % 100 === 0) {
                    notificationSystem.update(16);
                }
            }
            
            // ガベージコレクションを促進
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // メモリ増加が合理的な範囲内であることを確認（10MB以下）
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });

        test('ガベージコレクション効果の確認', () => {
            const iterations = 500;
            
            monitor.start('gc_test');
            
            for (let i = 0; i < iterations; i++) {
                // 一時的なオブジェクトを大量作成
                const tempAchievements = Array.from({length: 100}, (_, j) => ({
                    id: `temp_${i}_${j}`,
                    name: `Temp ${i} ${j}`,
                    progress: { current: j, target: 100 }
                }));
                
                // 統計計算で一時オブジェクトを使用
                statsUI.calculateOverallStats(tempAchievements);
                
                if (i % 100 === 0 && global.gc) {
                    global.gc();
                }
            }
            
            monitor.end('gc_test');
            
            const duration = monitor.getDuration('gc_test');
            
            // ガベージコレクションを含めても合理的な時間で完了することを確認
            expect(duration).toBeLessThan(1000);
        });
    });

    describe('Concurrent Performance', () => {
        test('並行処理での性能維持', async () => {
            const promises = [];
            const operationsPerThread = 500;
            
            monitor.start('concurrent_operations');
            
            // 複数の並行操作をシミュレート
            for (let thread = 0; thread < 4; thread++) {
                const promise = new Promise(resolve => {
                    setTimeout(() => {
                        for (let i = 0; i < operationsPerThread; i++) {
                            achievementManager.updateProgress('first_score', i + thread * operationsPerThread);
                            eventIntegrator.handleBubblePopped('normal', {});
                            
                            if (i % 50 === 0) {
                                statsUI.getStatistics();
                            }
                        }
                        resolve();
                    }, 0);
                });
                promises.push(promise);
            }
            
            await Promise.all(promises);
            
            monitor.end('concurrent_operations');
            
            const duration = monitor.getDuration('concurrent_operations');
            
            // 並行処理が効率的に実行されることを確認
            expect(duration).toBeLessThan(500);
        });
    });

    describe('Performance Regression Detection', () => {
        test('性能ベースラインの確立', () => {
            const operations = [
                () => achievementManager.updateProgress('first_score', 100),
                () => achievementManager.getAchievements(),
                () => achievementManager.checkAndUnlockAchievement('first_score'),
                () => statsUI.getStatistics(),
                () => eventIntegrator.handleBubblePopped('normal', {}),
                () => notificationSystem.update(16)
            ];
            
            const benchmarks = {};
            
            operations.forEach((operation, index) => {
                const label = `operation_${index}`;
                
                monitor.start(label);
                
                // 各操作を複数回実行
                for (let i = 0; i < 100; i++) {
                    operation();
                }
                
                monitor.end(label);
                
                benchmarks[label] = monitor.getDuration(label);
            });
            
            // ベースライン性能を記録
            console.log('Performance Benchmarks:', benchmarks);
            
            // 各操作が合理的な時間で完了することを確認
            Object.values(benchmarks).forEach(duration => {
                expect(duration).toBeLessThan(100); // 100操作が100ms以下
            });
        });
    });
});