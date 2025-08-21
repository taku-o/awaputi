/**
 * AchievementManager単体テスト
 */
import { describe, test, beforeEach, expect, jest  } from '@jest/globals';
import { AchievementManager  } from '../../src/core/AchievementManager.js';
// Type definitions for test objects
interface StageProgress {
    bestScore: number,
    completed: boolean }
interface BubbleTypeStats {
    popped: number }
interface SessionDataStats {
    lastSessionDate: string,
    consecutiveDays: number }
interface ComboStats {
    maxCombo: number }
interface AccuracyStats {
    overall: number }
interface DetailedStatistics {
    bubbleTypes: {
        norma,l: BubbleTypeStats,
        stone: BubbleTypeStats,
        rainbow: BubbleTypeStats
    },
    sessionData: SessionDataStats,
    combos: ComboStats,
    accuracy: AccuracyStats }
interface PlayerData {
    totalBubblesPopped: number,
    totalScore: number,
    totalPlayTime: number,
    consecutiveDays: number,
    maxCombo: number,
    stages: Record<string, StageProgress>,
    accuracy: number,
    achievements: Set<string> }
interface BatchUpdate {
    achievementId: string,
    value: number }
interface TotalRewards {
    ap: number }
interface CategoryReward {
    ap: number }
interface CategoryRewards {
    score: CategoryReward,
    play: CategoryReward,
    technique: CategoryReward,
    collection: CategoryReward,
    special: CategoryReward }
interface SaveData {
    achievements: any[],
    unlockedAchievements: Set<string>,
    progressData: Record<string, any>,
    version: string }
interface PerformanceStats {
    cacheHits: number }
interface PerformanceDiagnostics {
    cacheHitRate: number,
    averageUpdateTime: number,
    memoryUsage: number,
    recommendations: string[] }
// MockPlayerDataクラス
class MockPlayerData {
    public data: PlayerData,
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
    }
    get(key: string): any {
        return (this.data: any)[key] }
    set(key: string, value: void {
        (this.data: any)[key] = value }
    save(): boolean {
        return true }
    getStageProgress(stageId: string): StageProgress {
        return this.data.stages[stageId] || { bestScore: 0, completed: false };
    }
    getDetailedStatistics(): DetailedStatistics {
        return {
            bubbleTypes: {
                normal: { popped: 50 };
                stone: { popped: 20 };
                rainbow: { popped: 5 }
            },
            sessionData: {
                lastSessionDate: new Date().toISOString(',
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
describe('AchievementManager', () => {
    let achievementManager: AchievementManager,
    let mockPlayerData: MockPlayerData,
    beforeEach(() => {
        mockPlayerData = new MockPlayerData(),
        achievementManager = new AchievementManager(mockPlayerData) }');
    describe('初期化', (') => {
        test('正常に初期化される', () => {
            expect(achievementManager).toBeDefined(),
            expect(achievementManager.playerData).toBe(mockPlayerData) }');
        test('実績定義が正しく読み込まれる', () => {
            const achievements = achievementManager.getAchievements(),
            expect(achievements.length).toBeGreaterThan(40), // 40個以上の実績
        }');
        test('カテゴリ分類が正しく設定される', () => {
            const categories = achievementManager.getAchievementsByCategory(),
            expect(categories').toHaveProperty('score'),
            expect(categories').toHaveProperty('play'),
            expect(categories').toHaveProperty('technique'),
            expect(categories').toHaveProperty('collection'),
            expect(categories').toHaveProperty('special') }');
    }
    describe('進捗更新', (') => {
        test('累積スコア実績の進捗が正しく更新される', (') => {
            mockPlayerData.set('totalScore', 500'),
            achievementManager.updateProgress('first_score', 500'),
            const achievement = achievementManager.getAchievement('first_score'),
            expect(achievement.progress.current).toBe(500),
            expect(achievement.unlocked).toBe(true) }');
        test('泡ポップ数実績の進捗が正しく更新される', (') => {
            mockPlayerData.set('totalBubblesPopped', 50'),
            achievementManager.updateProgress('first_pop', 50'),
            const achievement = achievementManager.getAchievement('first_pop'),
            expect(achievement.progress.current).toBe(50),
            expect(achievement.unlocked).toBe(true) }');
        test('連続ログイン実績の進捗が正しく更新される', (') => {
            mockPlayerData.set('consecutiveDays', 7'),
            achievementManager.updateProgress('weekly_player', 7'),
            const achievement = achievementManager.getAchievement('weekly_player'),
            expect(achievement.progress.current).toBe(7),
            expect(achievement.unlocked).toBe(true) }');
        test('無効な実績IDの場合はエラーをログに出力する', (') => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}');
            achievementManager.updateProgress('invalid_achievement', 100);
            expect(consoleSpy').toHaveBeenCalledWith('Achievement not found:', 'invalid_achievement');
            consoleSpy.mockRestore();
        }');
    }
    describe('実績解除', (') => {
        test('実績解除時に正しくマークされる', (') => {
            const achievement = achievementManager.getAchievement('first_score'),
            achievement.progress.current = 100,
            
            const unlocked = achievementManager.checkAndUnlockAchievement('first_score'),
            expect(unlocked).toBe(true),
            expect(achievement.unlocked).toBe(true),
            expect(achievement.unlockedDate).toBeDefined() }');
        test('既に解除済みの実績は再度解除されない', (') => {
            const achievement = achievementManager.getAchievement('first_score'),
            achievement.unlocked = true,
            achievement.unlockedDate = new Date().toISOString('),
            const unlocked = achievementManager.checkAndUnlockAchievement('first_score'),
            expect(unlocked).toBe(false) }');
        test('条件を満たしていない実績は解除されない', (') => {
            const achievement = achievementManager.getAchievement('first_score'),
            achievement.progress.current = 50, // 条件は100
            
            const unlocked = achievementManager.checkAndUnlockAchievement('first_score'),
            expect(unlocked).toBe(false),
            expect(achievement.unlocked).toBe(false) }');
    }
    describe('バッチ処理', (') => {
        test('バッチ更新が正しく動作する', (') => {
            const updates: BatchUpdate[] = [
                { achievementId: 'first_score', value: 100 },
                { achievementId: 'first_pop', value: 10 },
                { achievementId: 'weekly_player', value: 3 }
            ];
            
            achievementManager.batchUpdateProgress(updates');
            const scoreAchievement = achievementManager.getAchievement('first_score');
            const popAchievement = achievementManager.getAchievement('first_pop');
            const loginAchievement = achievementManager.getAchievement('weekly_player');
            expect(scoreAchievement.progress.current).toBe(100);
            expect(popAchievement.progress.current).toBe(10);
            expect(loginAchievement.progress.current).toBe(3);
        }');
        test('バッチサイズが制限される', () => {
            // 100個の更新を作成（制限は50）
            const updates: BatchUpdate[] = Array.from({length: 100}, (_, i') => ({
                achievementId: 'first_score',
                value: i + 1
            });
            const processedCount = achievementManager.batchUpdateProgress(updates);
            expect(processedCount).toBe(50); // バッチサイズ制限
        }');
    }
    describe('パフォーマンス最適化', (') => {
        test('キャッシュが正しく動作する', (') => {
            // 最初の呼び出し（キャッシュミス）
            const relevant1 = achievementManager.getRelevantAchievements('score'),
            // 2回目の呼び出し（キャッシュヒット）
            const relevant2 = achievementManager.getRelevantAchievements('score'),
            expect(relevant1).toEqual(relevant2),
            const stats: PerformanceStats = achievementManager.getPerformanceStats(
            expect(stats.cacheHits).toBeGreaterThan(0) }');
        test('スロットリングが動作する', (done) => {
            let updateCount = 0,
            const originalUpdate = achievementManager.updateProgressInternal,
            achievementManager.updateProgressInternal = jest.fn((') => {
                updateCount++,
                originalUpdate.call(achievementManager, 'first_score', 100))') as any,
            
            // 短時間で複数回呼び出し
            achievementManager.updateProgress('first_score', 100'),
            achievementManager.updateProgress('first_score', 200'),
            achievementManager.updateProgress('first_score', 300),
            // スロットリング期間後に確認
            setTimeout(() => {
                expect(updateCount).toBeLessThan(3), // スロットリングにより減少
                done()), 150))'),
        test('パフォーマンス診断が動作する', (') => {
            // パフォーマンス統計を生成
            achievementManager.getRelevantAchievements('score'), // キャッシュミス
            achievementManager.getRelevantAchievements('score'), // キャッシュヒット
            
            const diagnostics: PerformanceDiagnostics = achievementManager.performanceDiagnostic(
            expect(diagnostics').toHaveProperty('cacheHitRate'),
            expect(diagnostics').toHaveProperty('averageUpdateTime'),
            expect(diagnostics').toHaveProperty('memoryUsage'),
            expect(diagnostics').toHaveProperty('recommendations'),
            expect(Array.isArray(diagnostics.recommendations).toBe(true) }');
    }
    describe('データ永続化', (') => {
        test('進捗データが正しく保存される', (') => {
            achievementManager.updateProgress('first_score', 100),
            const saveResult = achievementManager.save(),
            expect(saveResult).toBe(true) }');
        test('データ検証が正しく動作する', () => {
            // 正常なデータ
            const validData: SaveData = {
                achievements: [],
                unlockedAchievements: new Set(',
                progressData: {};
                version: '1.0.0'
            };
            
            const isValid = achievementManager.validateSaveData(validData);
            expect(isValid).toBe(true');
            // 不正なデータ
            const invalidData = {
                achievements: 'invalid'
            } as any;
            
            const isInvalid = achievementManager.validateSaveData(invalidData);
            expect(isInvalid).toBe(false);
        }');
        test('データ復旧が正しく動作する', () => {
            // データ破損をシミュレート
            (achievementManager.progressData = null),
            const recovered = achievementManager.attemptDataRecovery(),
            expect(recovered).toBe(true),
            expect((achievementManager.progressData).toBeDefined() }');
    }
    describe('実績報酬計算', (') => {
        test('総報酬が正しく計算される', (') => {
            // いくつかの実績を解除
            const achievement1 = achievementManager.getAchievement('first_score'),
            const achievement2 = achievementManager.getAchievement('first_pop'),
            achievement1.unlocked = true,
            achievement2.unlocked = true,
            
            const totalRewards: TotalRewards = achievementManager.calculateTotalRewards(
            expect(totalRewards.ap).toBeGreaterThan(0),
            expect(typeof totalRewards.ap').toBe('number') }');
        test('カテゴリ別報酬が正しく計算される', () => {
            const categoryRewards: CategoryRewards = achievementManager.calculateCategoryRewards(
            expect(categoryRewards').toHaveProperty('score'),
            expect(categoryRewards').toHaveProperty('play'),
            expect(categoryRewards').toHaveProperty('technique'),
            expect(categoryRewards').toHaveProperty('collection'),
            expect(categoryRewards').toHaveProperty('special'),
            Object.values(categoryRewards).forEach(reward => {),
                expect(typeof reward.ap').toBe('number'),
                expect(reward.ap).toBeGreaterThanOrEqual(0) });
        }
    }');
    describe('エラーハンドリング', (') => {
        test('無効な進捗値でもエラーが発生しない', () => {
            expect((') => {
                achievementManager.updateProgress('first_score', -1'),
                achievementManager.updateProgress('first_score', 'invalid' as any'),
                achievementManager.updateProgress('first_score', null) }).not.toThrow(');
        }
        test('存在しない実績への操作でもエラーが発生しない', () => {
            expect((') => {
                achievementManager.getAchievement('nonexistent'),
                achievementManager.updateProgress('nonexistent', 100'),
                achievementManager.checkAndUnlockAchievement('nonexistent') }).not.toThrow();
        }
    }');
}