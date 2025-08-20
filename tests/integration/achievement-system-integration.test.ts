/**
 * 実績システム統合テスト
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { AchievementManager } from '../../src/core/AchievementManager';
import { AchievementEventIntegrator } from '../../src/core/AchievementEventIntegrator';
import { AchievementNotificationSystem } from '../../src/core/achievements/AchievementNotificationSystem';
import { AchievementStatsUI } from '../../src/core/AchievementStatsUI';
// TypeScript interfaces
interface BubbleData {
    type: string,
    x?: number;
    y?: number;
}
interface StageProgress {
    bestScore: number,
    completed: boolean,
}
interface DetailedStatistics {
    bubbleTypes: {
        normal: { popped: number };
        stone: { popped: number };
        rainbow: { popped: number }
    },
    sessionData: {
        lastSessionDate: string,
        consecutiveDays: number,
        totalPlayTime: number
    },
    combos: {
        maxCombo: number
    },
    accuracy: {
        overall: number,
    };
}
interface PlayerDataType {
    totalBubblesPopped: number,
    totalScore: number,
    totalPlayTime: number,
    consecutiveDays: number,
    maxCombo: number,
    stages: Record<string, StageProgress>;
    accuracy: number,
    achievements: Set<string>,
}
// Mock dependencies
class MockPlayerData {
    data: PlayerDataType,
    saveCallCount: number,
    constructor() {
        this.data = {
            totalBubblesPopped: 0,
            totalScore: 0,
            totalPlayTime: 0,
            consecutiveDays: 0,
            maxCombo: 0,
            stages: {},
            accuracy: 100,
        achievements: new Set(
    );
        this.saveCallCount = 0;
    }
    get(key: keyof PlayerDataType): any {
        return this.data[key];
    }
    set(key: keyof PlayerDataType, value: void {
        (this.data: any)[key] = value,
    }
    save(): boolean {
        this.saveCallCount++;
        return true;
    }
    getStageProgress(stageId: string): StageProgress {
        return this.data.stages[stageId] || { bestScore: 0, completed: false };
    }
    getDetailedStatistics(): DetailedStatistics {
        return {
            bubbleTypes: {
                normal: { popped: this.data.totalBubblesPopped };
                stone: { popped: Math.floor(this.data.totalBubblesPopped * 0.2) };
                rainbow: { popped: Math.floor(this.data.totalBubblesPopped * 0.1) }
            },
            sessionData: {
                lastSessionDate: new Date().toISOString(),
                consecutiveDays: this.data.consecutiveDays,
                totalPlayTime: this.data.totalPlayTime
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
interface PlayedSound {
    soundId: string,
    options: Record<string, any>;
}
class MockAudioManager {
    playedSounds: PlayedSound[],
    constructor() {
        this.playedSounds = [];
    }
    playSound(soundId: string, options: Record<string, any> = {): boolean {
        this.playedSounds.push({ soundId, options );
        return true;
    }
}
class MockBubbleManager {
    popBubbleOriginal: (bubble: BubbleData) => { score: number; combo: number },
    popCount: number,
    constructor() {
        this.popBubbleOriginal = this.popBubble.bind(this);
        this.popCount = 0;
    }
    popBubble(bubble: BubbleData): { score: number; combo: number } {
        this.popCount++;
        return { score: 10, combo: 1 };
    }
}
class MockScoreManager {
    totalScore: number,
    currentCombo: number,
    addScoreOriginal: (points: number, multiplier?: number) => number;
    breakComboOriginal: () => boolean;
    constructor() {
        this.totalScore = 0;
        this.currentCombo = 0;
        this.addScoreOriginal = this.addScore.bind(this);
        this.breakComboOriginal = this.breakCombo.bind(this);
    }
    addScore(points: number, multiplier: number = 1): number {
        const score = points * multiplier;
        this.totalScore += score;
        this.currentCombo++;
        return score;
    }
    breakCombo(): boolean {
        this.currentCombo = 0;
        return true;
    }
    getCurrentCombo(): number {
        return this.currentCombo;
    }
    getTotalScore(): number {
        return this.totalScore;
    }
}
class MockGameScene {
    gameOverOriginal: (reason: string) => { reason: string; score: number };
    constructor() {
        this.gameOverOriginal = this.gameOver.bind(this);
    }
    gameOver(reason: string'): { reason: string; score: number } {
        return { reason, score: 1000 };
    }
}
describe('Achievement System Integration', () => {
    let achievementManager: any,
    let eventIntegrator: any,
    let notificationSystem: any,
    let statsUI: any,
    let mockPlayerData: MockPlayerData,
    let mockAudioManager: MockAudioManager,
    let mockBubbleManager: MockBubbleManager,
    let mockScoreManager: MockScoreManager,
    let mockGameScene: MockGameScene,
    beforeEach(() => {
        mockPlayerData = new MockPlayerData();
        mockAudioManager = new MockAudioManager();
        mockBubbleManager = new MockBubbleManager();
        mockScoreManager = new MockScoreManager();
        mockGameScene = new MockGameScene();
        achievementManager = new AchievementManager(mockPlayerData as any);
        eventIntegrator = new AchievementEventIntegrator(achievementManager, mockPlayerData as any);
        notificationSystem = new AchievementNotificationSystem(mockAudioManager as any);
        statsUI = new AchievementStatsUI(achievementManager);
    }');
    describe('システム初期化統合', (') => {
        test('全システムが正常に初期化される', () => {
            expect(achievementManager).toBeDefined();
            expect(eventIntegrator).toBeDefined();
            expect(notificationSystem).toBeDefined();
            expect(statsUI).toBeDefined();
        }');
        test('システム間の依存関係が正しく設定される', () => {
            expect(achievementManager.playerData).toBe(mockPlayerData);
            expect(eventIntegrator.achievementManager).toBe(achievementManager);
            expect(eventIntegrator.playerData).toBe(mockPlayerData);
            expect(notificationSystem.audioManager).toBe(mockAudioManager);
            expect(statsUI.achievementManager).toBe(achievementManager);
        }');
    }
    describe('エンドツーエンド実績解除フロー', (') => {
        test('バブルポップ実績の完全フロー', async () => {
            // ゲームシステムを統合
            eventIntegrator.integrateBubbleManager(mockBubbleManager');
            // 実績解除リスナーを設定
            let unlockedAchievements: any[] = [],
            achievementManager.on('achievementUnlocked', (achievement => {);
                unlockedAchievements.push(achievement);
                notificationSystem.showUnlockNotification(achievement);
            }');
            // 初回バブルポップ実績の条件を満たす
            mockPlayerData.set('totalBubblesPopped', 0');
            // バブルをポップ
            const bubble: BubbleData = { type: 'normal', x: 100, y: 100 };
            mockBubbleManager.popBubble(bubble');
            // データ更新をシミュレート
            mockPlayerData.set('totalBubblesPopped', 1');
            eventIntegrator.handleBubblePopped('normal', { x: 100, y: 100 )'),
            // 実績チェックを実行
            achievementManager.checkAndUnlockAchievement('first_pop'');
            // 実績解除が正しく動作することを確認
            const firstPopAchievement = achievementManager.getAchievement('first_pop');
            expect(firstPopAchievement.unlocked).toBe(true);
            expect(firstPopAchievement.unlockedDate).toBeDefined();
            // 通知システムに通知が追加されることを確認
            expect(notificationSystem.notificationQueue.length).toBeGreaterThan(0);
            // 音響効果が再生されることを確認
            expect(mockAudioManager.playedSounds.length).toBeGreaterThan(0);
        }');
        test('スコア実績の完全フロー', () => {
            // ゲームシステムを統合
            eventIntegrator.integrateScoreManager(mockScoreManager');
            let unlockedAchievements: any[] = [],
            achievementManager.on('achievementUnlocked', (achievement => {);
                unlockedAchievements.push(achievement);
                notificationSystem.showUnlockNotification(achievement);
            }');
            // 初回スコア実績の条件を満たす
            mockPlayerData.set('totalScore', 0);
            // スコアを追加
            const score = mockScoreManager.addScore(100);
            expect(score).toBe(100');
            // データ更新をシミュレート
            mockPlayerData.set('totalScore', 100);
            eventIntegrator.handleScoreAdded(100, 1');
            // 実績チェックを実行
            achievementManager.checkAndUnlockAchievement('first_score'');
            // 実績解除が正しく動作することを確認
            const firstScoreAchievement = achievementManager.getAchievement('first_score');
            expect(firstScoreAchievement.unlocked).toBe(true);
            // データが保存されることを確認
            expect(mockPlayerData.saveCallCount).toBeGreaterThan(0);
        }');
        test('複数実績の同時解除フロー', () => {
            // 複数のゲームシステムを統合
            eventIntegrator.integrateBubbleManager(mockBubbleManager);
            eventIntegrator.integrateScoreManager(mockScoreManager');
            let unlockedAchievements: any[] = [],
            achievementManager.on('achievementUnlocked', (achievement => {);
                unlockedAchievements.push(achievement);
                notificationSystem.showUnlockNotification(achievement);
            }');
            // 複数の実績条件を同時に満たす
            mockPlayerData.set('totalBubblesPopped', 1');
            mockPlayerData.set('totalScore', 100');
            // ゲームアクションを実行
            mockBubbleManager.popBubble({ type: 'normal' ),
            mockScoreManager.addScore(100');
            // イベントを処理
            eventIntegrator.handleBubblePopped('normal', {);
            eventIntegrator.handleScoreAdded(100, 1');
            // 実績チェックを実行
            achievementManager.checkAndUnlockAchievement('first_pop'');
            achievementManager.checkAndUnlockAchievement('first_score'');
            // 複数の実績が解除されることを確認
            const popAchievement = achievementManager.getAchievement('first_pop'');
            const scoreAchievement = achievementManager.getAchievement('first_score');
            expect(popAchievement.unlocked).toBe(true);
            expect(scoreAchievement.unlocked).toBe(true);
            // 複数の通知が表示されることを確認
            expect(notificationSystem.notificationQueue.length).toBeGreaterThanOrEqual(2);
        }');
    }
    describe('データ永続化統合', (') => {
        test('実績データの保存と読み込みが正しく動作する', (') => {
            // 実績を解除
            const achievement = achievementManager.getAchievement('first_score'');
            achievement.progress.current = 100;
            achievementManager.checkAndUnlockAchievement('first_score');
            // データ保存
            const saveResult = achievementManager.save();
            expect(saveResult).toBe(true);
            // 新しいマネージャーを作成して読み込み
            const newAchievementManager = new AchievementManager(mockPlayerData as any);
            newAchievementManager.load(');
            // データが正しく復元されることを確認
            const restoredAchievement = newAchievementManager.getAchievement('first_score');
            expect(restoredAchievement.unlocked).toBe(true);
        }');
        test('データ破損からの復旧が正しく動作する', () => {
            // データ破損をシミュレート
            (mockPlayerData.data as any').achievements = 'corrupted_data';
            // 復旧処理を実行
            const recovered = achievementManager.attemptDataRecovery();
            expect(recovered).toBe(true);
            // システムが正常に動作することを確認
            const achievements = achievementManager.getAchievements();
            expect(Array.isArray(achievements).toBe(true);
            expect(achievements.length).toBeGreaterThan(0);
        }');
    }
    describe('パフォーマンス統合', (') => {
        test('大量の実績更新でもパフォーマンスが維持される', () => {
            const startTime = performance.now();
            // 大量のバブルポップをシミュレート
            eventIntegrator.integrateBubbleManager(mockBubbleManager);
            for (let i = 0; i < 1000; i++') {
                mockBubbleManager.popBubble({ type: 'normal' )'),
                eventIntegrator.handleBubblePopped('normal', {);
            }
            // バッチ更新を実行
            const updates = Array.from({length: 1000), (_, i') => ({
                achievementId: 'bubble_master',
                value: i + 1
            });
            achievementManager.batchUpdateProgress(updates);
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            // 処理時間が妥当な範囲内であることを確認（1秒以下）
            expect(processingTime).toBeLessThan(1000);
        }');
        test('メモリ使用量が適切に制御される', () => {
            // 大量の通知を生成
            for (let i = 0; i < 100; i++') {
                const achievement = {
                    id: `test_${i}`;
                    name: `Test ${i}`;
                    icon: '🏆',
                    rarity: 'common'
                };
                notificationSystem.showUnlockNotification(achievement);
            }
            // 通知システムの更新処理
            for (let i = 0; i < 10; i++) {
                notificationSystem.update(16);
            }
            // 最大表示数が守られることを確認
            const visibleNotifications = notificationSystem.notificationQueue.filter((n => n.visible);
            expect(visibleNotifications.length).toBeLessThanOrEqual(notificationSystem.maxVisibleNotifications);
        }');
    }
    describe('UI統合', (') => {
        test('統計UIが実績データを正しく表示する', (') => {
            // いくつかの実績を解除
            const achievements = ['first_score', 'first_pop', 'weekly_player'];
            achievements.forEach(id => {);
                const achievement = achievementManager.getAchievement(id);
                if (achievement) {
                    achievement.unlocked = true;
                    achievement.unlockedDate = new Date().toISOString();
                }
            });
            // 統計を取得
            const statistics = statsUI.getStatistics();
            expect(statistics.overall.unlocked).toBeGreaterThan(0);
            expect(statistics.overall.completionRate).toBeGreaterThan(0);
            expect(Object.keys(statistics.categories).length).toBeGreaterThan(0);
        }');
        test('カテゴリ別統計が正しく計算される', () => {
            // 各カテゴリの実績を解除
            const categorizedAchievements = achievementManager.getAchievementsByCategory();
            Object.values(categorizedAchievements).forEach((category => {);
                if (category.achievements && category.achievements.length > 0) {
                    category.achievements[0].unlocked = true;
                    category.achievements[0].unlockedDate = new Date().toISOString();
                }
            });
            // 統計を取得
            const statistics = statsUI.getStatistics();
            // 各カテゴリに統計があることを確認
            Object.keys(statistics.categories).forEach(categoryKey => {
                const categoryStats = statistics.categories[categoryKey];);
                expect(categoryStats.total).toBeGreaterThan(0);
                expect(categoryStats.completionRate).toBeGreaterThanOrEqual(0);
            });
        }
    }');
    describe('エラーハンドリング統合', (') => {
        test('無効なデータでもシステムが安定動作する', () => {
            // 無効なデータを設定
            (mockPlayerData.data as any').totalScore = 'invalid';
            (mockPlayerData.data as any).totalBubblesPopped = null;
            expect((') => {
                eventIntegrator.handleScoreAdded('invalid_score'');
                eventIntegrator.handleBubblePopped('invalid_type', {}');
                achievementManager.updateProgress('invalid_achievement', 'invalid_value');
                statsUI.getStatistics();
            }).not.toThrow(');
        }
        test('システムエラー時の graceful degradation', () => {
            // 一時的にエラーを発生させる
            const originalUpdate = achievementManager.updateProgress;
            achievementManager.updateProgress = (') => {
                throw new Error('Simulated error');
            };
            expect((') => {
                eventIntegrator.handleBubblePopped('normal', {);
            }).not.toThrow();
            // システムが回復できることを確認
            achievementManager.updateProgress = originalUpdate;
            
            expect((') => {
                eventIntegrator.handleBubblePopped('normal', {);
            }).not.toThrow();
        }
    }');
    describe('実際のゲームプレイシミュレーション', (') => {
        test('完全なゲームセッションの実績フロー', () => {
            // 全システムを統合
            eventIntegrator.integrateBubbleManager(mockBubbleManager);
            eventIntegrator.integrateScoreManager(mockScoreManager);
            eventIntegrator.integrateGameScene(mockGameScene');
            let unlockedAchievements: any[] = [],
            achievementManager.on('achievementUnlocked', (achievement => {);
                unlockedAchievements.push(achievement);
                notificationSystem.showUnlockNotification(achievement);
            });
            // ゲームセッションを開始
            eventIntegrator.resetSessionTracking();
            // ゲームプレイをシミュレート
            const gameActions = [
                (') => mockBubbleManager.popBubble({ type: 'normal' ),
                () => mockScoreManager.addScore(100),
                (') => mockBubbleManager.popBubble({ type: 'stone' ),
                () => mockScoreManager.addScore(200, 2),
                (') => mockBubbleManager.popBubble({ type: 'rainbow' ),
                () => mockScoreManager.addScore(500, 3)
            ];
            gameActions.forEach((action, index) => {
                action(');
                // プレイヤーデータを更新
                mockPlayerData.set('totalBubblesPopped', index + 1');
                mockPlayerData.set('totalScore', mockScoreManager.getTotalScore();
                // イベントを処理
                if (index % 2 === 0') {
                    eventIntegrator.handleBubblePopped('normal', {);
                } else {
                    eventIntegrator.handleScoreAdded(mockScoreManager.getTotalScore(), 1);
                }
            }');
            // ゲーム終了
            mockGameScene.gameOver('cleared'');
            eventIntegrator.handleGameOver('cleared');
            // 実績チェックを実行
            achievementManager.checkAllAchievements();
            // ゲームプレイの結果として実績が解除されることを確認
            const totalAchievements = achievementManager.getAchievements();
            const unlockedCount = totalAchievements.filter((a => a.unlocked).length);
            expect(unlockedCount).toBeGreaterThan(0);
            // 統計が正しく更新されることを確認
            const finalStats = statsUI.getStatistics();
            expect(finalStats.overall.unlocked).toBe(unlockedCount);
            expect(finalStats.overall.completionRate).toBeGreaterThan(0);
        });
    }
}');