/**
 * ソーシャル機能とGameEngine連携の統合テスト
 * Issue #37 Task 21.1: ゲームエンジン連携テスト
 */

import { jest } from '@jest/globals';

// テスト用のモッククラス
class MockGameEngine {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.context = this.canvas.getContext('2d');
        this.isRunning = false;
        this.currentScene = null;
        this.systems = new Map();
    }

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    getCanvas() {
        return this.canvas;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    setCurrentScene(scene) {
        this.currentScene = scene;
    }

    getSystem(systemName) {
        return this.systems.get(systemName);
    }

    addSystem(systemName, system) {
        this.systems.set(systemName, system);
    }
}

class MockStatisticsManager {
    constructor() {
        this.gameStats = {
            totalScore: 50000,
            highScore: 75000,
            gamesPlayed: 100,
            totalPlayTime: 180000,
            averageScore: 25000
        };
    }

    getTotalScore() {
        return this.gameStats.totalScore;
    }

    getHighScore() {
        return this.gameStats.highScore;
    }

    getGamesPlayed() {
        return this.gameStats.gamesPlayed;
    }

    getDetailedStatistics() {
        return { ...this.gameStats };
    }
}

class MockAchievementManager {
    constructor() {
        this.achievements = [
            { id: 'first_win', name: '初勝利', description: '初めてゲームをクリア', unlocked: true, rare: false },
            { id: 'high_scorer', name: 'ハイスコアラー', description: '50000点を達成', unlocked: true, rare: true },
            { id: 'combo_master', name: 'コンボマスター', description: '20コンボを達成', unlocked: false, rare: true }
        ];
    }

    getAchievements() {
        return this.achievements;
    }

    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }

    getRareAchievements() {
        return this.achievements.filter(a => a.rare);
    }
}

describe('SocialGameEngineIntegration', () => {
    let mockGameEngine;
    let mockStatisticsManager;
    let mockAchievementManager;
    let SocialSharingManager;

    beforeAll(async () => {
        // DOM環境をセットアップ
        global.document = document;
        global.window = window;
        global.navigator = {
            share: jest.fn(),
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        // Web Share API モック
        global.navigator.canShare = jest.fn().mockReturnValue(true);
    });

    beforeEach(async () => {
        // モックオブジェクトを初期化
        mockGameEngine = new MockGameEngine();
        mockStatisticsManager = new MockStatisticsManager();
        mockAchievementManager = new MockAchievementManager();

        // SocialSharingManagerを動的にインポート
        const module = await import('../../core/SocialSharingManager.js');
        SocialSharingManager = module.SocialSharingManager;

        // LocalStorageモック
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GameEngine統合初期化', () => {
        test('SocialSharingManagerがGameEngineと正しく統合される', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            expect(socialManager.gameEngine).toBe(mockGameEngine);
            expect(socialManager.statisticsManager).toBe(mockStatisticsManager);
            expect(socialManager.achievementManager).toBe(mockAchievementManager);
            expect(socialManager.isInitialized).toBe(true);
        });

        test('必要なシステムコンポーネントが正しくリンクされる', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            // 内部システムの初期化確認
            expect(socialManager.shareContentGenerator).toBeDefined();
            expect(socialManager.screenshotCapture).toBeDefined();
            expect(socialManager.leaderboardManager).toBeDefined();
            expect(socialManager.challengeSystem).toBeDefined();
        });
    });

    describe('ゲーム状態との連携', () => {
        test('ゲーム終了時にスコア共有が提案される', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const gameEndData = {
                score: 75000,
                isHighScore: true,
                stage: 'normal',
                playTime: 300000,
                combo: 15
            };

            const shareSuggestion = await socialManager.checkShareSuggestion(gameEndData);

            expect(shareSuggestion.shouldSuggestShare).toBe(true);
            expect(shareSuggestion.reason).toBe('high_score');
            expect(shareSuggestion.shareData).toMatchObject({
                type: 'score',
                score: 75000,
                isHighScore: true
            });
        });

        test('Canvas状態からスクリーンショットが生成できる', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            // Canvas に何か描画
            const ctx = mockGameEngine.context;
            ctx.fillStyle = '#0066cc';
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.fillText('Test Game Screen', 200, 300);

            const screenshot = await socialManager.captureGameScreen({
                includeOverlay: true,
                overlayData: {
                    score: 50000,
                    stage: 'normal'
                }
            });

            expect(screenshot).toBeDefined();
            expect(screenshot.startsWith('data:image/')).toBe(true);
        });
    });

    describe('統計システム連携', () => {
        test('統計データがリーダーボードに正しく反映される', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            // 新しいスコアを記録
            const scoreData = {
                score: 65000,
                stage: 'normal',
                timestamp: Date.now(),
                metadata: {
                    combo: 18,
                    accuracy: 0.85,
                    playTime: 240000
                }
            };

            await socialManager.leaderboardManager.updateScore(scoreData);

            const rankings = await socialManager.leaderboardManager.getRanking('allTime');
            expect(rankings.length).toBeGreaterThan(0);
            expect(rankings[0].score).toBe(65000);
        });

        test('統計データが共有メッセージに適切に統合される', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const shareMessage = await socialManager.shareContentGenerator.generateScoreMessage({
                score: 50000,
                isHighScore: false,
                totalGames: mockStatisticsManager.getGamesPlayed(),
                averageScore: 25000
            }, 'twitter');

            expect(shareMessage).toContain('50000');
            expect(shareMessage).toContain('BubblePop');
            expect(shareMessage.length).toBeLessThanOrEqual(280); // Twitter文字数制限
        });
    });

    describe('実績システム連携', () => {
        test('実績解除時に共有オプションが提示される', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const newAchievement = {
                id: 'perfect_round',
                name: 'パーフェクトラウンド',
                description: '1ラウンドでミスなし',
                unlocked: true,
                rare: true,
                unlockedAt: Date.now()
            };

            const shareData = await socialManager.generateAchievementShareData(newAchievement);

            expect(shareData.type).toBe('achievement');
            expect(shareData.achievement.name).toBe('パーフェクトラウンド');
            expect(shareData.shouldHighlight).toBe(true); // rare achievement
        });

        test('実績進捗が視覚的に表示される', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const achievementProgress = await socialManager.getAchievementProgress();

            expect(achievementProgress.total).toBe(3);
            expect(achievementProgress.unlocked).toBe(2);
            expect(achievementProgress.percentage).toBe(67); // 2/3 * 100, rounded
            expect(achievementProgress.rare).toBe(1); // unlocked rare achievements
        });
    });

    describe('エラーハンドリング統合', () => {
        test('GameEngine初期化失敗時の適切なエラーハンドリング', async () => {
            const invalidGameEngine = null;

            expect(() => {
                new SocialSharingManager(
                    invalidGameEngine,
                    mockStatisticsManager,
                    mockAchievementManager
                );
            }).toThrow('GameEngine is required');
        });

        test('Canvas取得失敗時のフォールバック動作', async () => {
            const gameEngineWithoutCanvas = {
                getCanvas: () => null,
                getCurrentScene: () => null
            };

            const socialManager = new SocialSharingManager(
                gameEngineWithoutCanvas,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const screenshot = await socialManager.captureGameScreen();
            expect(screenshot).toBeNull(); // Canvas無しの場合はnullを返す
        });
    });

    describe('パフォーマンス統合', () => {
        test('大量のデータ処理時のパフォーマンス', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const startTime = performance.now();

            // 大量のスコアデータを処理
            const promises = [];
            for (let i = 0; i < 100; i++) {
                promises.push(socialManager.leaderboardManager.updateScore({
                    score: Math.floor(Math.random() * 100000),
                    stage: 'normal',
                    timestamp: Date.now() - (i * 1000),
                    metadata: { combo: i, accuracy: Math.random() }
                }));
            }

            await Promise.all(promises);

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            expect(processingTime).toBeLessThan(1000); // 1秒以内で完了
        });

        test('メモリ使用量の監視', async () => {
            const socialManager = new SocialSharingManager(
                mockGameEngine,
                mockStatisticsManager,
                mockAchievementManager
            );

            await socialManager.initialize();

            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

            // 複数回のスクリーンショット生成
            for (let i = 0; i < 10; i++) {
                await socialManager.captureGameScreen();
            }

            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = finalMemory - initialMemory;

            // メモリ増加量が10MB以下であることを確認（要件8.5）
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });
});