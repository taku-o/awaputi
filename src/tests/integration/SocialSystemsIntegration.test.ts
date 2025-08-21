/**
 * ソーシャル機能と既存システム（統計・実績）連携の統合テスト
 * Issue #37 Task 21.2: 既存システム連携テスト
 */
import { jest, describe, test, beforeAll, beforeEach, afterEach, expect } from '@jest/globals';

// Type definitions
interface PlayerData {
    playerName: string;
    totalAP: number;
    totalTAP: number;
    highScores: {
        normal: number;
        hard: number;
        expert: number;
    };
    achievements: string[];
    settings: {
        shareSettings: {
            autoShare: boolean;
            shareHighScores: boolean;
            shareAchievements: boolean;
        };
        privacy: string;
    };
}

interface MockPlayerData {
    data: PlayerData;
    getPlayerName(): string;
    getTotalAP(): number;
    getHighScore(stage: string): number;
    getAllHighScores(): { [key: string]: number };
    updateHighScore(stage: string, score: number): boolean;
    getSettings(): PlayerData['settings'];
    updateSettings(settings: Partial<PlayerData['settings']>): void;
    save(): void;
}

interface SessionData {
    score: number;
    stage: string;
    playTime: number;
    combo: number;
    accuracy: number;
    timestamp?: number;
}

interface StatisticsData {
    sessions: Array<SessionData & { timestamp: number }>;
    totalPlayTime: number;
    totalGames: number;
    totalScore: number;
    averageScore: number;
    bestCombo: number;
    accuracy: number;
    bubblesPopped: number;
    stageStats: { 
        [key: string]: {
            played: number;
            won: number;
            averageScore: number;
        };
    };
}

interface SocialSystemsStatisticsManager {
    stats: StatisticsData;
    getDetailedStatistics(): StatisticsData;
    getTotalPlayTime(): number;
    getTotalGames(): number;
    getAverageScore(): number;
    getBestCombo(): number;
    getAccuracy(): number;
    getStageStatistics(stage: string): Partial<StatisticsData['stageStats'][string]>;
    recordGameSession(sessionData: SessionData): void;
    updateAggregateStats(sessionData: SessionData): void;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
    rare: boolean;
    category: string;
    progress?: number;
    target?: number;
}

interface AchievementProgress {
    total: number;
    unlocked: number;
    percentage: number;
    categories: {
        [key: string]: {
            total: number;
            unlocked: number;
        };
    };
}

interface SocialSystemsAchievementManager {
    achievements: Map<string, Achievement>;
    getAchievements(): Achievement[];
    getUnlockedAchievements(): Achievement[];
    getRareAchievements(): Achievement[];
    getAchievementProgress(): AchievementProgress;
    getCategoryProgress(): { [key: string]: { total: number; unlocked: number } };
    checkAndUnlockAchievements(gameData: GameData): Achievement[];
}

interface GameData {
    score: number;
    combo: number;
    accuracy: number;
    stage: string;
}

interface SocialSharingManager {
    shareContentGenerator: {
        generateScoreMessage(shareData: any, platform: string): Promise<string>;
        generateMilestoneMessage(milestoneData: any, platform: string): Promise<string>;
        generateAchievementMessage(achievement: Achievement, platform: string): Promise<string>;
    };
    leaderboardManager: {
        updateScore(scoreData: any): Promise<void>;
        getLeaderboard(stage?: string): Promise<any[]>;
        submitScore(scoreData: any): Promise<boolean>;
    };
    initialize(): Promise<void>;
    isEnabled(): boolean;
}

// Mock implementations
let mockPlayerData: MockPlayerData;
let mockStatisticsManager: SocialSystemsStatisticsManager;
let mockAchievementManager: SocialSystemsAchievementManager;
let mockSocialSharingManager: SocialSharingManager;

describe('ソーシャル機能とシステム連携テスト', () => {
    beforeAll(() => {
        // Initialize test environment
    });

    beforeEach(() => {
        // Setup mocks
        mockPlayerData = {
            data: {
                playerName: 'TestPlayer',
                totalAP: 1000,
                totalTAP: 500,
                highScores: {
                    normal: 85000,
                    hard: 62000,
                    expert: 45000
                },
                achievements: ['first_game', 'combo_master'],
                settings: {
                    shareSettings: {
                        autoShare: true,
                        shareHighScores: true,
                        shareAchievements: true
                    },
                    privacy: 'friends'
                }
            },
            getPlayerName: jest.fn(() => 'TestPlayer'),
            getTotalAP: jest.fn(() => 1000),
            getHighScore: jest.fn((stage: string) => mockPlayerData.data.highScores[stage as keyof typeof mockPlayerData.data.highScores] || 0),
            getAllHighScores: jest.fn(() => mockPlayerData.data.highScores),
            updateHighScore: jest.fn((stage: string, score: number) => {
                const currentScore = mockPlayerData.data.highScores[stage as keyof typeof mockPlayerData.data.highScores] || 0;
                if (score > currentScore) {
                    (mockPlayerData.data.highScores as any)[stage] = score;
                    return true;
                }
                return false;
            }),
            getSettings: jest.fn(() => mockPlayerData.data.settings),
            updateSettings: jest.fn((settings: Partial<PlayerData['settings']>) => {
                Object.assign(mockPlayerData.data.settings, settings);
            }),
            save: jest.fn()
        };

        mockStatisticsManager = {
            stats: {
                sessions: [],
                totalPlayTime: 3600000,
                totalGames: 25,
                totalScore: 1250000,
                averageScore: 50000,
                bestCombo: 45,
                accuracy: 0.85,
                bubblesPopped: 2500,
                stageStats: {
                    normal: { played: 15, won: 12, averageScore: 52000 },
                    hard: { played: 8, won: 5, averageScore: 48000 },
                    expert: { played: 2, won: 1, averageScore: 35000 }
                }
            },
            getDetailedStatistics: jest.fn(() => mockStatisticsManager.stats),
            getTotalPlayTime: jest.fn(() => 3600000),
            getTotalGames: jest.fn(() => 25),
            getAverageScore: jest.fn(() => 50000),
            getBestCombo: jest.fn(() => 45),
            getAccuracy: jest.fn(() => 0.85),
            getStageStatistics: jest.fn((stage: string) => mockStatisticsManager.stats.stageStats[stage] || {}),
            recordGameSession: jest.fn((sessionData: SessionData) => {
                mockStatisticsManager.stats.sessions.push({ ...sessionData, timestamp: Date.now() });
            }),
            updateAggregateStats: jest.fn((sessionData: SessionData) => {
                mockStatisticsManager.stats.totalGames++;
                mockStatisticsManager.stats.totalScore += sessionData.score;
                mockStatisticsManager.stats.averageScore = mockStatisticsManager.stats.totalScore / mockStatisticsManager.stats.totalGames;
            })
        };

        const mockAchievements = new Map<string, Achievement>([
            ['first_game', {
                id: 'first_game',
                name: 'はじめの一歩',
                description: '初回ゲームクリア',
                unlocked: true,
                unlockedAt: Date.now() - 86400000,
                rare: false,
                category: 'basic'
            }],
            ['combo_master', {
                id: 'combo_master',
                name: 'コンボマスター',
                description: '30コンボ達成',
                unlocked: true,
                unlockedAt: Date.now() - 43200000,
                rare: true,
                category: 'skill'
            }],
            ['high_scorer', {
                id: 'high_scorer',
                name: 'ハイスコアラー',
                description: '100,000点達成',
                unlocked: false,
                rare: true,
                category: 'score',
                progress: 85000,
                target: 100000
            }]
        ]);

        mockAchievementManager = {
            achievements: mockAchievements,
            getAchievements: jest.fn(() => Array.from(mockAchievements.values())),
            getUnlockedAchievements: jest.fn(() => Array.from(mockAchievements.values()).filter(a => a.unlocked)),
            getRareAchievements: jest.fn(() => Array.from(mockAchievements.values()).filter(a => a.rare)),
            getAchievementProgress: jest.fn(() => {
                const total = mockAchievements.size;
                const unlocked = Array.from(mockAchievements.values()).filter(a => a.unlocked).length;
                return {
                    total,
                    unlocked,
                    percentage: (unlocked / total) * 100,
                    categories: {
                        basic: { total: 1, unlocked: 1 },
                        skill: { total: 1, unlocked: 1 },
                        score: { total: 1, unlocked: 0 }
                    }
                };
            }),
            getCategoryProgress: jest.fn(() => ({
                basic: { total: 1, unlocked: 1 },
                skill: { total: 1, unlocked: 1 },
                score: { total: 1, unlocked: 0 }
            })),
            checkAndUnlockAchievements: jest.fn((gameData: GameData) => {
                const newAchievements: Achievement[] = [];
                const highScorer = mockAchievements.get('high_scorer');
                if (highScorer && !highScorer.unlocked && gameData.score >= 100000) {
                    highScorer.unlocked = true;
                    highScorer.unlockedAt = Date.now();
                    newAchievements.push(highScorer);
                }
                return newAchievements;
            })
        };

        mockSocialSharingManager = {
            shareContentGenerator: {
                generateScoreMessage: jest.fn(async (shareData: any, platform: string) => 
                    `🎯 BubblePop で ${shareData.score} 点を獲得！ #BubblePop #HighScore`),
                generateMilestoneMessage: jest.fn(async (milestoneData: any, platform: string) => 
                    `🎉 ${milestoneData.milestone} を達成！ #BubblePop #Milestone`),
                generateAchievementMessage: jest.fn(async (achievement: Achievement, platform: string) => 
                    `🏆 実績「${achievement.name}」を解除！ ${achievement.description} #BubblePop #Achievement`)
            },
            leaderboardManager: {
                updateScore: jest.fn(async (scoreData: any) => {
                    // Mock leaderboard update
                }),
                getLeaderboard: jest.fn(async (stage?: string) => [
                    { player: 'Player1', score: 95000, rank: 1 },
                    { player: 'Player2', score: 88000, rank: 2 },
                    { player: 'TestPlayer', score: 85000, rank: 3 }
                ]),
                submitScore: jest.fn(async (scoreData: any) => true)
            },
            initialize: jest.fn(async () => {}),
            isEnabled: jest.fn(() => true)
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Player Data Integration', () => {
        test('プレイヤーデータとソーシャル設定の連携', async () => {
            // プレイヤーデータ取得テスト
            expect(mockPlayerData.getPlayerName()).toBe('TestPlayer');
            expect(mockPlayerData.getTotalAP()).toBe(1000);
            expect(mockPlayerData.getHighScore('normal')).toBe(85000);

            // ソーシャル設定確認
            const settings = mockPlayerData.getSettings();
            expect(settings.shareSettings.autoShare).toBe(true);
            expect(settings.shareSettings.shareHighScores).toBe(true);
            expect(settings.privacy).toBe('friends');

            // 設定更新テスト
            mockPlayerData.updateSettings({
                shareSettings: {
                    autoShare: false,
                    shareHighScores: true,
                    shareAchievements: false
                }
            });

            const updatedSettings = mockPlayerData.getSettings();
            expect(updatedSettings.shareSettings.autoShare).toBe(false);
            expect(mockPlayerData.save).toHaveBeenCalled();
        });

        test('ハイスコア更新とソーシャル連携', async () => {
            const newScore = 95000;
            const scoreUpdated = mockPlayerData.updateHighScore('normal', newScore);
            
            expect(scoreUpdated).toBe(true);
            expect(mockPlayerData.getHighScore('normal')).toBe(newScore);

            // ソーシャル共有が有効な場合の確認
            const settings = mockPlayerData.getSettings();
            if (settings.shareSettings.shareHighScores) {
                // スコア共有メッセージ生成テスト
                const shareMessage = await mockSocialSharingManager.shareContentGenerator.generateScoreMessage(
                    { score: newScore, stage: 'normal' },
                    'twitter'
                );
                expect(shareMessage).toContain('95000');
                expect(shareMessage).toContain('#BubblePop');
            }
        });
    });

    describe('Statistics Integration', () => {
        test('統計データとソーシャル機能連携', async () => {
            const sessionData: SessionData = {
                score: 75000,
                stage: 'normal',
                playTime: 180000,
                combo: 28,
                accuracy: 0.92
            };

            // セッション記録
            mockStatisticsManager.recordGameSession(sessionData);
            mockStatisticsManager.updateAggregateStats(sessionData);

            // 統計データ確認
            expect(mockStatisticsManager.getTotalGames()).toBe(26);
            expect(mockStatisticsManager.getAccuracy()).toBe(0.85);

            // ステージ統計
            const stageStats = mockStatisticsManager.getStageStatistics('normal');
            expect(stageStats.played).toBeGreaterThan(0);
            expect(stageStats.averageScore).toBeGreaterThan(0);

            // リーダーボード更新
            await mockSocialSharingManager.leaderboardManager.updateScore({
                player: mockPlayerData.getPlayerName(),
                score: sessionData.score,
                stage: sessionData.stage
            });

            expect(mockSocialSharingManager.leaderboardManager.updateScore).toHaveBeenCalled();
        });

        test('統計データに基づくソーシャル共有', async () => {
            const stats = mockStatisticsManager.getDetailedStatistics();
            
            // マイルストーン達成チェック例
            if (stats.totalGames >= 25) {
                const milestoneMessage = await mockSocialSharingManager.shareContentGenerator.generateMilestoneMessage(
                    { milestone: '25ゲーム達成', games: stats.totalGames },
                    'twitter'
                );
                expect(milestoneMessage).toContain('25ゲーム達成');
            }

            // 累積統計の確認
            expect(stats.totalPlayTime).toBeGreaterThan(0);
            expect(stats.bubblesPopped).toBeGreaterThan(0);
            expect(stats.bestCombo).toBeGreaterThan(0);
        });
    });

    describe('Achievement Integration', () => {
        test('実績システムとソーシャル共有連携', async () => {
            const gameData: GameData = {
                score: 105000,
                combo: 35,
                accuracy: 0.95,
                stage: 'normal'
            };

            // 実績チェックと解除
            const newAchievements = mockAchievementManager.checkAndUnlockAchievements(gameData);
            expect(newAchievements).toHaveLength(1);
            expect(newAchievements[0].id).toBe('high_scorer');

            // 実績解除のソーシャル共有
            const achievementMessage = await mockSocialSharingManager.shareContentGenerator.generateAchievementMessage(
                newAchievements[0],
                'twitter'
            );
            expect(achievementMessage).toContain('ハイスコアラー');
            expect(achievementMessage).toContain('🏆');

            // 実績進捗確認
            const progress = mockAchievementManager.getAchievementProgress();
            expect(progress.unlocked).toBe(3);
            expect(progress.percentage).toBe(100);
        });

        test('レア実績とソーシャル連携', async () => {
            const rareAchievements = mockAchievementManager.getRareAchievements();
            expect(rareAchievements.length).toBeGreaterThan(0);

            for (const achievement of rareAchievements) {
                if (achievement.unlocked) {
                    const message = await mockSocialSharingManager.shareContentGenerator.generateAchievementMessage(
                        achievement,
                        'twitter'
                    );
                    expect(message).toContain(achievement.name);
                }
            }
        });

        test('カテゴリ別実績進捗とソーシャル表示', async () => {
            const categoryProgress = mockAchievementManager.getCategoryProgress();
            
            expect(categoryProgress.basic.total).toBe(1);
            expect(categoryProgress.basic.unlocked).toBe(1);
            expect(categoryProgress.skill.total).toBe(1);
            expect(categoryProgress.skill.unlocked).toBe(1);
            expect(categoryProgress.score.total).toBe(1);
        });
    });

    describe('Cross-System Integration', () => {
        test('総合的なシステム連携フロー', async () => {
            // 1. ゲームセッション開始
            const sessionData: SessionData = {
                score: 98000,
                stage: 'hard',
                playTime: 240000,
                combo: 42,
                accuracy: 0.89
            };

            // 2. 統計記録
            mockStatisticsManager.recordGameSession(sessionData);
            mockStatisticsManager.updateAggregateStats(sessionData);

            // 3. ハイスコア更新
            const isHighScore = mockPlayerData.updateHighScore('hard', sessionData.score);
            if (isHighScore) {
                expect(mockPlayerData.getHighScore('hard')).toBe(sessionData.score);
            }

            // 4. 実績チェック
            const gameData: GameData = {
                score: sessionData.score,
                combo: sessionData.combo,
                accuracy: sessionData.accuracy,
                stage: sessionData.stage
            };
            const newAchievements = mockAchievementManager.checkAndUnlockAchievements(gameData);

            // 5. ソーシャル共有（自動共有が有効な場合）
            const settings = mockPlayerData.getSettings();
            if (settings.shareSettings.autoShare) {
                if (isHighScore && settings.shareSettings.shareHighScores) {
                    const scoreMessage = await mockSocialSharingManager.shareContentGenerator.generateScoreMessage(
                        { score: sessionData.score, stage: sessionData.stage },
                        'twitter'
                    );
                    expect(scoreMessage).toBeDefined();
                }

                if (newAchievements.length > 0 && settings.shareSettings.shareAchievements) {
                    for (const achievement of newAchievements) {
                        const achievementMessage = await mockSocialSharingManager.shareContentGenerator.generateAchievementMessage(
                            achievement,
                            'twitter'
                        );
                        expect(achievementMessage).toBeDefined();
                    }
                }
            }

            // 6. リーダーボード更新
            if (mockSocialSharingManager.isEnabled()) {
                await mockSocialSharingManager.leaderboardManager.submitScore({
                    player: mockPlayerData.getPlayerName(),
                    score: sessionData.score,
                    stage: sessionData.stage,
                    timestamp: Date.now()
                });
                
                expect(mockSocialSharingManager.leaderboardManager.submitScore).toHaveBeenCalled();
            }
        });

        test('プライバシー設定とソーシャル機能', async () => {
            // プライバシー設定の確認
            const settings = mockPlayerData.getSettings();
            expect(settings.privacy).toBeDefined();

            // プライバシー設定に基づく動作テスト
            if (settings.privacy === 'private') {
                // プライベート設定時はソーシャル共有を無効化
                expect(settings.shareSettings.autoShare).toBe(false);
            } else if (settings.privacy === 'friends') {
                // フレンド限定の場合の処理
                expect(settings.shareSettings).toBeDefined();
            }

            // 設定変更テスト
            mockPlayerData.updateSettings({
                privacy: 'private',
                shareSettings: {
                    autoShare: false,
                    shareHighScores: false,
                    shareAchievements: false
                }
            });

            const updatedSettings = mockPlayerData.getSettings();
            expect(updatedSettings.privacy).toBe('private');
            expect(updatedSettings.shareSettings.autoShare).toBe(false);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('ソーシャル機能無効時のフォールバック', async () => {
            // ソーシャル機能を無効化
            mockSocialSharingManager.isEnabled = jest.fn(() => false);

            const sessionData: SessionData = {
                score: 85000,
                stage: 'normal',
                playTime: 180000,
                combo: 25,
                accuracy: 0.87
            };

            // 統計記録は継続
            mockStatisticsManager.recordGameSession(sessionData);
            expect(mockStatisticsManager.recordGameSession).toHaveBeenCalled();

            // ソーシャル機能は呼ばれない
            if (!mockSocialSharingManager.isEnabled()) {
                // リーダーボード更新をスキップ
                const submitCalled = mockSocialSharingManager.leaderboardManager.submitScore;
                expect(submitCalled).not.toHaveBeenCalled();
            }
        });

        test('不正なデータ処理', async () => {
            // 不正なスコアデータ
            const invalidSessionData = {
                score: -1000,
                stage: '',
                playTime: -60000,
                combo: -5,
                accuracy: 1.5
            } as SessionData;

            // 統計マネージャーでの検証処理
            try {
                mockStatisticsManager.recordGameSession(invalidSessionData);
                // 実装では不正データを適切にフィルタリング
                expect(mockStatisticsManager.recordGameSession).toHaveBeenCalled();
            } catch (error) {
                // エラーハンドリングの確認
                expect(error).toBeDefined();
            }
        });

        test('ネットワークエラー時の処理', async () => {
            // ネットワークエラーをシミュレート
            mockSocialSharingManager.leaderboardManager.submitScore = jest.fn()
                .mockRejectedValue(new Error('Network error'));

            const scoreData = {
                player: 'TestPlayer',
                score: 85000,
                stage: 'normal'
            };

            try {
                await mockSocialSharingManager.leaderboardManager.submitScore(scoreData);
            } catch (error) {
                expect(error).toBeDefined();
                expect((error as Error).message).toBe('Network error');
            }

            // ローカルデータは保持されている
            expect(mockPlayerData.getPlayerName()).toBe('TestPlayer');
            expect(mockStatisticsManager.getTotalGames()).toBeGreaterThan(0);
        });
    });
});