/**
 * AchievementManager単体テスト
 */
import { describe, test, beforeEach, expect, jest } from '@jest/globals';
import { AchievementManager } from '../../src/core/AchievementManager.js';

// Type definitions for test objects
interface StageProgress { 
    bestScore: number; 
    completed: boolean;
}

interface BubbleTypeStats {
    popped: number;
}

interface SessionDataStats { 
    lastSessionDate: string; 
    consecutiveDays: number;
}

interface ComboStats {
    maxCombo: number;
}

interface AccuracyStats {
    overall: number;
}

interface DetailedStatistics {
    bubbleTypes: {
        normal: BubbleTypeStats;
        stone: BubbleTypeStats;
        rainbow: BubbleTypeStats;
    };
    sessionData: SessionDataStats;
    combos: ComboStats;
    accuracy: AccuracyStats;
}

interface PlayerData {
    totalBubblesPopped: number;
    totalScore: number;
    totalPlayTime: number;
    consecutiveDays: number;
    maxCombo: number;
    stageProgress: { [key: string]: StageProgress };
    getDetailedStatistics: () => DetailedStatistics;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    type: string;
    requirement: {
        type: string;
        target: number;
        bubbleType?: string;
        timeLimit?: number;
    };
    reward: { type: string; value: number };
    unlocked: boolean;
    unlockedAt?: Date;
    progress: {
        current: number;
        target: number;
        percentage: number;
    };
}

interface AchievementUpdateResult {
    updated: boolean;
    unlocked: boolean;
    previousProgress: number;
    newProgress: number;
}

// Mock classes
class MockPlayerData implements PlayerData {
    public totalBubblesPopped = 0;
    public totalScore = 0;
    public totalPlayTime = 0;
    public consecutiveDays = 1;
    public maxCombo = 0;
    public stageProgress: { [key: string]: StageProgress } = {};

    getDetailedStatistics(): DetailedStatistics {
        return {
            bubbleTypes: {
                normal: { popped: 10 },
                stone: { popped: 5 },
                rainbow: { popped: 2 }
            },
            sessionData: {
                lastSessionDate: '2023-01-01',
                consecutiveDays: this.consecutiveDays
            },
            combos: {
                maxCombo: this.maxCombo
            },
            accuracy: {
                overall: 85.5
            }
        };
    }
}

class MockConfigManager {
    public achievements: Achievement[] = [
        {
            id: 'first_bubble',
            name: '初めてのバブル',
            description: '最初のバブルをポップする',
            type: 'progress',
            requirement: {
                type: 'bubbles_popped',
                target: 1
            },
            reward: {
                type: 'points',
                value: 10
            },
            unlocked: false,
            progress: {
                current: 0,
                target: 1,
                percentage: 0
            }
        },
        {
            id: 'bubble_master',
            name: 'バブルマスター',
            description: '100個のバブルをポップする',
            type: 'progress',
            requirement: {
                type: 'bubbles_popped',
                target: 100
            },
            reward: {
                type: 'points',
                value: 100
            },
            unlocked: false,
            progress: {
                current: 0,
                target: 100,
                percentage: 0
            }
        }
    ];

    getAchievements(): Achievement[] {
        return this.achievements;
    }
}

class MockLocalStorage {
    private storage: Map<string, string> = new Map();

    getItem(key: string): string | null {
        return this.storage.get(key) || null;
    }

    setItem(key: string, value: string): void {
        this.storage.set(key, value);
    }

    removeItem(key: string): void {
        this.storage.delete(key);
    }

    clear(): void {
        this.storage.clear();
    }
}

class MockEventDispatcher {
    public events: Array<{ type: string; data: any }> = [];

    dispatch(type: string, data: any): void {
        this.events.push({ type, data });
    }
}

describe('AchievementManager', () => {
    let manager: AchievementManager;
    let mockPlayerData: MockPlayerData;
    let mockConfigManager: MockConfigManager;
    let mockLocalStorage: MockLocalStorage;
    let mockEventDispatcher: MockEventDispatcher;

    beforeEach(() => {
        mockPlayerData = new MockPlayerData();
        mockConfigManager = new MockConfigManager();
        mockLocalStorage = new MockLocalStorage();
        mockEventDispatcher = new MockEventDispatcher();

        // localStorage をモック化
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        manager = new AchievementManager(
            mockPlayerData,
            mockConfigManager,
            mockEventDispatcher
        );
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(manager).toBeDefined();
            expect(manager.playerData).toBe(mockPlayerData);
            expect(manager.achievements).toHaveLength(mockConfigManager.achievements.length);
        });

        test('実績データが正しく読み込まれる', () => {
            const achievements = manager.getAchievements();
            expect(achievements).toHaveLength(2);
            expect(achievements[0].id).toBe('first_bubble');
            expect(achievements[1].id).toBe('bubble_master');
        });

        test('保存されたデータから実績状態を復元する', () => {
            const savedData = {
                first_bubble: {
                    unlocked: true,
                    unlockedAt: '2023-01-01T00:00:00.000Z',
                    progress: { current: 1, target: 1, percentage: 100 }
                }
            };
            mockLocalStorage.setItem('achievements', JSON.stringify(savedData));

            const newManager = new AchievementManager(
                mockPlayerData,
                mockConfigManager,
                mockEventDispatcher
            );
            const achievement = newManager.getAchievement('first_bubble');
            
            expect(achievement?.unlocked).toBe(true);
            expect(achievement?.progress.current).toBe(1);
        });
    });

    describe('実績取得', () => {
        test('IDによる実績取得が正常に動作する', () => {
            const achievement = manager.getAchievement('first_bubble');
            expect(achievement).toBeDefined();
            expect(achievement?.id).toBe('first_bubble');
            expect(achievement?.name).toBe('初めてのバブル');
        });

        test('存在しない実績IDの場合nullを返す', () => {
            const achievement = manager.getAchievement('nonexistent');
            expect(achievement).toBeNull();
        });

        test('すべての実績を取得できる', () => {
            const achievements = manager.getAchievements();
            expect(achievements).toHaveLength(2);
            expect(achievements.every(a => a.id && a.name)).toBe(true);
        });

        test('アンロック済み実績のみを取得できる', () => {
            // 1つの実績をアンロック
            manager.updateProgress('first_bubble', 1);
            const unlockedAchievements = manager.getUnlockedAchievements();
            
            expect(unlockedAchievements).toHaveLength(1);
            expect(unlockedAchievements[0].id).toBe('first_bubble');
        });

        test('ロック中の実績のみを取得できる', () => {
            const lockedAchievements = manager.getLockedAchievements();
            expect(lockedAchievements).toHaveLength(2);
            expect(lockedAchievements.every(a => !a.unlocked)).toBe(true);
        });
    });

    describe('実績進捗更新', () => {
        test('進捗が正しく更新される', () => {
            const result = manager.updateProgress('first_bubble', 1);
            
            expect(result.updated).toBe(true);
            expect(result.unlocked).toBe(true);
            expect(result.previousProgress).toBe(0);
            expect(result.newProgress).toBe(1);
        });

        test('進捗更新でパーセンテージが計算される', () => {
            manager.updateProgress('bubble_master', 50);
            const achievement = manager.getAchievement('bubble_master');
            
            expect(achievement?.progress.current).toBe(50);
            expect(achievement?.progress.percentage).toBe(50);
        });

        test('最大値を超える進捗でもターゲット値で制限される', () => {
            const result = manager.updateProgress('first_bubble', 10);
            const achievement = manager.getAchievement('first_bubble');
            
            expect(achievement?.progress.current).toBe(1);
            expect(achievement?.progress.percentage).toBe(100);
        });

        test('存在しない実績IDでは更新が失敗する', () => {
            const result = manager.updateProgress('nonexistent', 1);
            expect(result.updated).toBe(false);
            expect(result.unlocked).toBe(false);
        });
    });

    describe('実績アンロック', () => {
        test('実績アンロック時にイベントが発火される', () => {
            manager.updateProgress('first_bubble', 1);
            
            expect(mockEventDispatcher.events).toHaveLength(1);
            expect(mockEventDispatcher.events[0].type).toBe('achievement_unlocked');
            expect(mockEventDispatcher.events[0].data.id).toBe('first_bubble');
        });

        test('同じ実績を再アンロックしてもイベントは発火されない', () => {
            manager.updateProgress('first_bubble', 1);
            manager.updateProgress('first_bubble', 1);
            
            expect(mockEventDispatcher.events).toHaveLength(1);
        });

        test('実績アンロック時刻が記録される', () => {
            const before = Date.now();
            manager.updateProgress('first_bubble', 1);
            const after = Date.now();
            
            const achievement = manager.getAchievement('first_bubble');
            expect(achievement?.unlockedAt).toBeDefined();
            const unlockedTime = new Date(achievement!.unlockedAt!).getTime();
            expect(unlockedTime).toBeGreaterThanOrEqual(before);
            expect(unlockedTime).toBeLessThanOrEqual(after);
        });
    });

    describe('自動チェック機能', () => {
        test('プレイヤーデータから自動的に実績をチェックする', () => {
            mockPlayerData.totalBubblesPopped = 150;
            
            manager.checkAchievementsFromPlayerData();
            
            // 両方の実績がアンロックされるはず
            expect(manager.getAchievement('first_bubble')?.unlocked).toBe(true);
            expect(manager.getAchievement('bubble_master')?.unlocked).toBe(true);
        });

        test('複数実績の同時アンロック時に複数イベントが発火される', () => {
            mockPlayerData.totalBubblesPopped = 150;
            
            manager.checkAchievementsFromPlayerData();
            
            expect(mockEventDispatcher.events).toHaveLength(2);
            expect(mockEventDispatcher.events[0].type).toBe('achievement_unlocked');
            expect(mockEventDispatcher.events[1].type).toBe('achievement_unlocked');
        });
    });

    describe('保存・読み込み', () => {
        test('実績データが正しく保存される', () => {
            manager.updateProgress('first_bubble', 1);
            manager.saveToStorage();
            
            const savedData = mockLocalStorage.getItem('achievements');
            expect(savedData).toBeDefined();
            
            const parsed = JSON.parse(savedData!);
            expect(parsed.first_bubble.unlocked).toBe(true);
            expect(parsed.first_bubble.progress.current).toBe(1);
        });

        test('保存されたデータから正しく読み込まれる', () => {
            const testData = {
                first_bubble: {
                    unlocked: true,
                    unlockedAt: '2023-01-01T00:00:00.000Z',
                    progress: { current: 1, target: 1, percentage: 100 }
                }
            };
            mockLocalStorage.setItem('achievements', JSON.stringify(testData));
            
            manager.loadFromStorage();
            const achievement = manager.getAchievement('first_bubble');
            
            expect(achievement?.unlocked).toBe(true);
            expect(achievement?.progress.current).toBe(1);
        });

        test('不正な保存データでもエラーなく処理される', () => {
            mockLocalStorage.setItem('achievements', 'invalid json');
            
            expect(() => {
                manager.loadFromStorage();
            }).not.toThrow();
        });
    });

    describe('統計情報', () => {
        test('アンロック統計が正しく取得される', () => {
            manager.updateProgress('first_bubble', 1);
            
            const stats = manager.getAchievementStats();
            expect(stats.total).toBe(2);
            expect(stats.unlocked).toBe(1);
            expect(stats.locked).toBe(1);
            expect(stats.percentage).toBe(50);
        });

        test('カテゴリ別統計が正しく取得される', () => {
            const stats = manager.getAchievementStatsByCategory();
            expect(stats.progress.total).toBe(2);
            expect(stats.progress.unlocked).toBe(0);
        });
    });

    describe('バッチ処理', () => {
        test('複数の実績進捗を一度に更新できる', () => {
            const updates = [
                { id: 'first_bubble', progress: 1 },
                { id: 'bubble_master', progress: 50 }
            ];
            
            const results = manager.batchUpdateProgress(updates);
            
            expect(results).toHaveLength(2);
            expect(results[0].unlocked).toBe(true);
            expect(results[1].unlocked).toBe(false);
        });

        test('不正なIDを含むバッチ更新でも処理が継続される', () => {
            const updates = [
                { id: 'first_bubble', progress: 1 },
                { id: 'invalid', progress: 50 },
                { id: 'bubble_master', progress: 30 }
            ];
            
            const results = manager.batchUpdateProgress(updates);
            
            expect(results).toHaveLength(3);
            expect(results[0].updated).toBe(true);
            expect(results[1].updated).toBe(false);
            expect(results[2].updated).toBe(true);
        });
    });

    describe('イベントリスナー', () => {
        test('実績アンロックイベントのリスナーが正しく動作する', () => {
            let eventReceived = false;
            let receivedData: any = null;

            manager.on('achievement_unlocked', (data) => {
                eventReceived = true;
                receivedData = data;
            });

            manager.updateProgress('first_bubble', 1);

            expect(eventReceived).toBe(true);
            expect(receivedData.id).toBe('first_bubble');
        });

        test('複数のリスナーが正しく動作する', () => {
            let count = 0;

            manager.on('achievement_unlocked', () => count++);
            manager.on('achievement_unlocked', () => count++);

            manager.updateProgress('first_bubble', 1);

            expect(count).toBe(2);
        });

        test('リスナーの削除が正しく動作する', () => {
            let eventReceived = false;
            const listener = () => { eventReceived = true; };

            manager.on('achievement_unlocked', listener);
            manager.off('achievement_unlocked', listener);
            manager.updateProgress('first_bubble', 1);

            expect(eventReceived).toBe(false);
        });
    });

    describe('エラーハンドリング', () => {
        test('破損した設定データでもエラーなく初期化される', () => {
            const brokenConfigManager = {
                getAchievements: () => null as any
            };

            expect(() => {
                new AchievementManager(
                    mockPlayerData,
                    brokenConfigManager as any,
                    mockEventDispatcher
                );
            }).not.toThrow();
        });

        test('存在しないプロパティへのアクセスでもエラーが発生しない', () => {
            expect(() => {
                manager.updateProgress('first_bubble', 1);
                const achievement = manager.getAchievement('first_bubble');
                (achievement as any).nonexistentProperty;
            }).not.toThrow();
        });
    });
});