/**
 * ソーシャル機能と既存システム（統計・実績）連携の統合テスト
 * Issue #37 Task 21.2: 既存システム連携テスト
 */
import { jest, describe, test, beforeAll, beforeEach, afterEach, expect  } from '@jest/globals';
// Type definitions
interface PlayerData { playerName: string,
    totalAP: number;
    totalTAP: number;
    highScores: {
        norma,l: number,
        hard: number,
    expert: number,;
    achievements: string[],
    settings: { shareSettings: {
            autoShare: boolean,
            shareHighScores: boolean,
            shareAchievements: boolean,
    privacy: string,;
}
interface MockPlayerData { data: PlayerData,
    getPlayerName(): string;
    getTotalAP(): number;
    getHighScore(stage: string): number;
    getAllHighScores(): { [key: string]: number,
    updateHighScore(stage: string, score: number): boolean,
    getSettings(): PlayerData['settings'];
    updateSettings(settings: Partial<PlayerData['settings]>): void,'
    save(): void;
}
interface SessionData { score: number,
    stage: string;
    playTime: number;
    combo: number;
    accuracy: number;
    timestamp?: number;
interface StatisticsData {
    sessions: Array<SessionData & { timestam,p: number;>;
    totalPlayTime: number;
    totalGames: number;
    totalScore: number;
    averageScore: number;
    bestCombo: number;
    accuracy: number;
    bubblesPopped: number;
    stageStats: { [key: string]: {
            played: number,
            won: number,
    averageScore: number,;
}
interface SocialSystemsStatisticsManager { stats: StatisticsData,
    getDetailedStatistics(): StatisticsData;
    getTotalPlayTime(): number;
    getTotalGames(): number;
    getAverageScore(): number;
    getBestCombo(): number;

    getAccuracy(): number;
    getStageStatistics(stage: string): Partial<StatisticsData['stageStats][string]>;'
    recordGameSession(sessionData: SessionData): void;
    updateAggregateStats(sessionData: SessionData): void;
interface Achievement { id: string,
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
    rare: boolean;
    category: string;
    progress?: number;
    target?: number,  }
interface AchievementProgress { total: number,
    unlocked: number;
    percentage: number;
    categories: {
        [key: string]: {
            tota,l: number,
    unlocked: number,;
}
interface SocialSystemsAchievementManager { achievements: Map<string, Achievement>,
    getAchievements(): Achievement[];
    getUnlockedAchievements(): Achievement[];
    getRareAchievements(): Achievement[];
    getAchievementProgress(): AchievementProgress;
    getCategoryProgress(): { [key: string]: { total: number,, unlocked: number,
    checkAndUnlockAchievements(gameData: GameData): Achievement[],
interface GameData { score: number,
    combo: number;
    accuracy: number;
    stage: string;
interface SocialSharingManager { shareContentGenerator: {
        generateScoreMessage(shareData: any, platform: string): Promise<string>,
        generateMilestoneMessage(milestoneData: any, platform: string): Promise<string>,
        generateAchievementMessage(achievement: Achievement, platform: string): Promise<string>,,
    leaderboardManager: { updateScore(scoreData: any): Promise<void>,
        getRanking(period: string): Promise<any[]>,;
    initialize(): Promise<void>;
    checkSharePermission(type: string, data: any): Promise<boolean>,
    checkShareSuggestion(gameResult: any): Promise<ShareSuggestion>,
    generateAchievementShareData(achievement: Achievement): Promise<AchievementShareData>,
    getAchievementProgressVisualization(): Promise<ProgressVisualization>;
    captureGameScreen(): Promise<string | null>;
}
interface ShareSuggestion { shouldSuggestShare: boolean,
    reason: string;
    shareData: {
        scor,e: number,
interface AchievementShareData { type: string,
    shouldHighlight: boolean;
interface ProgressVisualization { overall: {
        percentag,e: number,;
    categories: { [key: string]: {
            unlocked: number,;
    rarityBreakdown: { rare: {
            unlocked: number,;
}
interface MockLocalStorage { getItem: jest.Mock<(key: string) => string | null>,
    setItem: jest.Mock<(key: string, value: string) => void>;
    removeItem: jest.Mock<(key: string) => void>;
    clear: jest.Mock<() => void>  }
}
interface MockNavigator { share: jest.Mock<() => Promise<void>>,
    userAgent: string;
// 既存システムのモック
class MockPlayerData implements MockPlayerData { data: PlayerData,''
    constructor('''
            playerName: 'TestPlayer';
            totalAP: 5000;
            totalTAP: 15000;
    highScores: {
                normal: 50000,
                hard: 35000,
    expert: 20000  }

            },''
            achievements: ['first_win', 'high_scorer'],
            settings: { shareSettings: {
                    autoShare: true,
    shareHighScores: true,
                    shareAchievements: true,
                    privacy: 'public'
            }
            }))
    }
    getPlayerName(): string { return this.data.playerName }
    getTotalAP(): number { return this.data.totalAP }
    getHighScore(stage: string): number { return this.data.highScores[stage as keyof typeof this.data.highScores] || 0 }
    getAllHighScores(): { [key: string]: number; {
        return { ...this.data.highScores }
    updateHighScore(stage: string, score: number): boolean { if (score > this.getHighScore(stage) {
            (this.data.highScores, as any)[stage] = score,
            return true }
        return false;

    }''
    getSettings(): PlayerData['settings] { return this.data.settings,'
    updateSettings(settings: Partial<PlayerData['settings]>): void { Object.assign(this.data.settings, settings) }'

    }''
    save()';'
        localStorage.setItem('playerData', JSON.stringify(this.data);
    }
}
class SocialSystemsMockStatisticsManager implements SocialSystemsStatisticsManager { stats: StatisticsData,
    constructor() {
        this.stats = {
            sessions: [],
            totalPlayTime: 180000,
            totalGames: 150,
            totalScore: 750000,
            averageScore: 5000,
            bestCombo: 25,
            accuracy: 0.78,
    bubblesPopped: 15000 }
            stageStats: { }
                normal: { played: 100, won: 85, averageScore: 6000  };
                hard: { played: 30, won: 20, averageScore: 4500  };
                expert: { played: 20, won: 8, averageScore: 3000  }
        }
    getDetailedStatistics(): StatisticsData {
        return { ...this.stats }
    getTotalPlayTime(): number { return this.stats.totalPlayTime }
    getTotalGames(): number { return this.stats.totalGames }
    getAverageScore(): number { return this.stats.averageScore }
    getBestCombo(): number { return this.stats.bestCombo }
    getAccuracy(): number { return this.stats.accuracy,
    getStageStatistics(stage: string): Partial<StatisticsData['stageStats][string]> {'
        return this.stats.stageStats[stage] || {}
    recordGameSession(sessionData: SessionData): void { this.stats.sessions.push({)
            ...sessionData),
        timestamp: Date.now( });
        this.updateAggregateStats(sessionData);
    }
    updateAggregateStats(sessionData: SessionData): void { this.stats.totalGames++,
        this.stats.totalScore += sessionData.score,
        this.stats.averageScore = Math.floor(this.stats.totalScore / this.stats.totalGames),
        if (sessionData.combo > this.stats.bestCombo) {
    
}
            this.stats.bestCombo = sessionData.combo; }
}
}

class SocialSystemsMockAchievementManager implements SocialSystemsAchievementManager { achievements: Map<string, Achievement>,
    constructor('''
            ['first_win', { ''
                id: 'first_win',
                name: '初勝利',
                description: '初めてゲームをクリア',
                unlocked: true,
                unlockedAt: Date.now(']',
    category: 'progress'
            }]'
            }],''
            ['high_scorer', { ''
                id: 'high_scorer',
                name: 'ハイスコアラー',
                description: '50000点を達成',
                unlocked: true,
                unlockedAt: Date.now(']',
    category: 'score'
            }]'
            }],''
            ['combo_master', { ''
                id: 'combo_master',
                name: 'コンボマスター',
                description: '30コンボを達成',
                unlocked: false,
                progress: 25,
    target: 30,
                rare: true,]','
                category: 'skill'
            }]'
            }],''
            ['perfect_accuracy', { ''
                id: 'perfect_accuracy',
                name: 'パーフェクト',
                description: '100%の精度でラウンドを完了',
                unlocked: false,
                progress: 0),
                target: 1','
    rare: true,]','
                category: 'skill'
            }]
            }])
        ]);
    }
    getAchievements(): Achievement[] { return Array.from(this.achievements.values() }
    getUnlockedAchievements(): Achievement[] { return this.getAchievements().filter(a => a.unlocked),
    getRareAchievements(): Achievement[] { return this.getAchievements().filter(a => a.rare),
    getAchievementProgress(): AchievementProgress { const total = this.achievements.size,
        const unlocked = this.getUnlockedAchievements().length,
        return { total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100 };
        categories: this.getCategoryProgress(); 
    }
    getCategoryProgress(): { [key: string]: { total: number,, unlocked: number; {
        const categories: { [key: string]: { total: number,, unlocked: number, = {}
        this.getAchievements().forEach(achievement => {  ) }
            if (!categories[achievement.category]) { }
                categories[achievement.category] = { total: 0, unlocked: 0  }
            categories[achievement.category].total++;
            if (achievement.unlocked) { categories[achievement.category].unlocked++ }
        });
        return categories;

    }''
    checkAndUnlockAchievements(gameData: GameData): Achievement[] { const newlyUnlocked: Achievement[] = [],
        // コンボマスター実績のチェック
        const comboMaster = this.achievements.get('combo_master),'
        if (comboMaster && !comboMaster.unlocked && gameData.combo >= 30) {
            comboMaster.unlocked = true,

            comboMaster.unlockedAt = Date.now() }

            newlyUnlocked.push(comboMaster); }
        }

        // パーフェクト実績のチェック
        const perfectAccuracy = this.achievements.get('perfect_accuracy);'
        if (perfectAccuracy && !perfectAccuracy.unlocked && gameData.accuracy >= 1.0) {
            perfectAccuracy.unlocked = true,

            perfectAccuracy.unlockedAt = Date.now() }

            newlyUnlocked.push(perfectAccuracy); }
        }
        return newlyUnlocked;
describe('SocialSystemsIntegration', () => {  let mockPlayerData: MockPlayerData,
    let mockStatisticsManager: SocialSystemsMockStatisticsManager,
    let mockAchievementManager: SocialSystemsMockAchievementManager,
    let SocialSharingManagerClass: any,
    let socialManager: SocialSharingManager,
    beforeAll(async () => {
        // DOM環境をセットアップ
        (global, as any).document = document,
        (global, as any).window = window,
        (global, as any).navigator = {''
            share: jest.fn()  }

            userAgent: 'Mozilla/5.0(Windows, NT 10.0; Win64; x64) AppleWebKit/537.36' }
        } as MockNavigator;
    });
    beforeEach(async () => {  // モックオブジェクトを初期化
        mockPlayerData = new MockPlayerData(),
        mockStatisticsManager = new SocialSystemsMockStatisticsManager(),
        mockAchievementManager = new SocialSystemsMockAchievementManager(),
        // LocalStorageモック
        (global, as any).localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(
    removeItem: jest.fn(),' }'

        clear: jest.fn()); 
    } as MockLocalStorage;

        // SocialSharingManagerを動的にインポート
        const module = await import('../../core/SocialSharingManager.js');
        SocialSharingManagerClass = module.SocialSharingManager;

        const mockGameEngine = { ''
            canvas: document.createElement('canvas }'
            getCanvas() { return this.canvas },
            getCurrentScene: () => null;
        },
        socialManager = new SocialSharingManagerClass(;
            mockGameEngine,
            mockStatisticsManager,
            mockAchievementManager;
        ) as SocialSharingManager;
        await socialManager.initialize();
    });

    afterEach(() => { jest.clearAllMocks(),' }'

    }');'
    describe('PlayerDataシステム連携', () => {  ''
        test('プレイヤー名が共有メッセージに適切に含まれる', async () => {
            const shareData = {'
                score: 45000,
                playerName: mockPlayerData.getPlayerName('}'

                stage: 'normal'
            });
            const message = await socialManager.shareContentGenerator';'

                .generateScoreMessage(shareData, 'generic';
            expect(message).toContain('TestPlayer';
            expect(message).toContain('45000';}');'
        test('共有設定がプライバシー制御に反映される', async () => {  ''
            const settings = mockPlayerData.getSettings('',
            settings.shareSettings.privacy = 'private',
            settings.shareSettings.shareHighScores = false,

            const canShare = await socialManager.checkSharePermission('score', {
                score: 60000),
                isHighScore: true) });

            expect(canShare).toBe(false);' }'

        }');'
        test('ハイスコア更新時の共有提案ロジック', async () => {  const gameResult = {'
                score: 65000,
                stage: 'normal'
            }
                isHighScore: true;;
            const shareSuggestion = await socialManager.checkShareSuggestion(gameResult);

            expect(shareSuggestion.shouldSuggestShare).toBe(true);
            expect(shareSuggestion.reason).toBe('high_score);'

            expect(shareSuggestion.shareData.score).toBe(65000);'}');

    }''
    describe('StatisticsManager連携', () => {  ''
        test('統計データがリーダーボードに正しく統合される', async () => {
            // 新しいゲームセッションを記録
            const sessionData: SessionData = {
                score: 42000,
                stage: 'normal',
                playTime: 300000,
    combo: 18 }
                accuracy: 0.82 
    };
            mockStatisticsManager.recordGameSession(sessionData);
            // リーダーボードに反映されることを確認
            await socialManager.leaderboardManager.updateScore({ score: sessionData.score)
                stage: sessionData.stage),
                timestamp: Date.now(
    metadata: {
                    combo: sessionData.combo,
                    accuracy: sessionData.accuracy,
    playTime: sessionData.playTime }';'

            }');'
            const rankings = await socialManager.leaderboardManager.getRanking('weekly);'
            const topScore = rankings[0];
            expect(topScore.score).toBe(42000);

            expect(topScore.metadata.combo).toBe(18);'}');
        test('統計データから共有推奨度を計算', async () => {  const gameResult = {'
                score: 38000,
                combo: mockStatisticsManager.getBestCombo('}'

                stage: 'normal' });)
            const shareSuggestion = await socialManager.checkShareSuggestion(gameResult);

            expect(shareSuggestion.shouldSuggestShare).toBe(true);
            expect(shareSuggestion.reason).toBe('personal_best_combo';}');'
        test('長期プレイ統計の共有コンテンツ生成', async () => {  const milestoneData = {
                totalGames: 200, // マイルストーン達成,
                totalPlayTime: 200000,
        averageScore: mockStatisticsManager.getAverageScore()','
                .generateMilestoneMessage(milestoneData, 'twitter',
            expect(milestoneMessage).toContain('200',
            expect(milestoneMessage).toContain('ゲーム' }'

            expect(milestoneMessage.length).toBeLessThanOrEqual(280);' }'

        }');'

    }''
    describe('AchievementManager連携', () => {  ''
        test('実績解除時の自動共有提案', async () => {
            const gameData: GameData = {
                score: 35000,
    combo: 30, // コンボマスター実績を解除,
                accuracy: 0.88,' }'

                stage: 'normal' 
    };
            const unlockedAchievements = mockAchievementManager;
                .checkAndUnlockAchievements(gameData);

            expect(unlockedAchievements.length).toBe(1);
            expect(unlockedAchievements[0].id).toBe('combo_master);'
            // ソーシャル機能との連携確認
            const shareData = await socialManager.generateAchievementShareData();
                unlockedAchievements[0]);
            expect(shareData.type).toBe('achievement);'

            expect(shareData.shouldHighlight).toBe(true); // rare achievement
        }');'
        test('実績進捗の視覚化データ生成', async () => {  const progressData = await socialManager.getAchievementProgressVisualization(),
            expect(progressData.overall.percentage).toBe(50), // 2/4 achievements unlocked
            expect(progressData.categories.score.unlocked).toBe(1),
            expect(progressData.categories.skill.unlocked).toBe(0) }
            expect(progressData.rarityBreakdown.rare.unlocked).toBe(1);' }'

        }');'
        test('実績コンテンツの共有メッセージ生成', async () => {  ''
            const achievement = mockAchievementManager.achievements.get('high_scorer')!,
            ','

            const shareMessage = await socialManager.shareContentGenerator','

                .generateAchievementMessage(achievement, 'facebook',
            expect(shareMessage).toContain('ハイスコアラー',
            expect(shareMessage).toContain('50000点',' }'

            expect(shareMessage).toContain('BubblePop'; }

        }');'

    }''
    describe('システム間データ整合性', () => {  ''
        test('複数システム間でのデータ同期', async () => {
            const gameResult = {'
                score: 55000,
                stage: 'hard',
                playTime: 420000,
    combo: 22,
                accuracy: 0.91,
        timestamp: Date.now()','
            const isNewHighScore = mockPlayerData.updateHighScore('hard', gameResult.score),
            // StatisticsManagerへのセッション記録
            mockStatisticsManager.recordGameSession(gameResult),
            // 実績チェック
            const unlockedAchievements = mockAchievementManager,
                .checkAndUnlockAchievements(gameResult),
            // LeaderboardManagerへのスコア記録
            await socialManager.leaderboardManager.updateScore({
                score: gameResult.score,
                stage: gameResult.stage,
                timestamp: gameResult.timestamp,
    metadata: {
                    combo: gameResult.combo,
    accuracy: gameResult.accuracy)  }
                    playTime: gameResult.playTime) 
    });
            // 各システムのデータ整合性確認;
            expect(isNewHighScore).toBe(true);
            expect(mockStatisticsManager.getTotalGames().toBe(151); // +1

            const leaderboard = await socialManager.leaderboardManager.getRanking('allTime);'

            expect(leaderboard[0].score).toBe(55000);'}');
        test('データ競合時の解決メカニズム', async () => {  // 同時に複数のスコア更新を試行
            const scores = [48000, 52000, 49000],
            const updatePromises = scores.map(score => ,
                socialManager.leaderboardManager.updateScore({)
                    score,')',
                    stage: 'normal') }
                    timestamp: Date.now() }
                    metadata: { combo: 10, accuracy: 0.8, playTime: 300000  });

            );
            await Promise.all(updatePromises);
            const rankings = await socialManager.leaderboardManager.getRanking('allTime);'
            // 最高スコアが正しく保持されていることを確認
            expect(rankings[0].score).toBe(52000);
            expect(rankings.length).toBe(3);'}');

    }''
    describe('パフォーマンスとメモリ管理', () => {  ''
        test('大量の統計データ処理パフォーマンス', async () => {
            const startTime = performance.now(),
            // 100セッション分のデータを処理
            for(let, i = 0, i < 100, i++) {
                const sessionData: SessionData = {''
                    score: Math.floor(Math.random() * 100000','
                    stage: ['normal', 'hard', 'expert][i % 3],'
                    playTime: Math.floor(Math.random() * 600000) }
                    combo: Math.floor(Math.random() * 50) }
        accuracy: Math.random(); 
    };
                mockStatisticsManager.recordGameSession(sessionData);
                await socialManager.leaderboardManager.updateScore({ score: sessionData.score)
                    stage: sessionData.stage),
                    timestamp: Date.now() - (i * 1000,
    metadata: sessionData,);
            };
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            // 処理時間が1秒以内であることを確認
            expect(processingTime).toBeLessThan(1000);'}');
        test('メモリリーク防止の確認', async () => {  const initialMemory = (performance, as any).memory ? (performance, as any).memory.usedJSHeapSize: 0,
            // 多数の共有操作を実行
            for(let, i = 0, i < 50, i++) {
                await socialManager.shareContentGenerator.generateScoreMessage({) }

                    score: Math.floor(Math.random() * 100000'),' }

                    stage: 'normal'}, 'twitter');
                await socialManager.captureGameScreen();
            }
            // ガベージコレクションを促進
            if ((global, as any).gc) { (global, as any).gc() }
            const finalMemory = (performance, as any).memory ? (performance, as any).memory.usedJSHeapSize: 0,
            const memoryIncrease = finalMemory - initialMemory;
            // メモリ増加量が5MB以下であることを確認
            expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
        });
    }'}');