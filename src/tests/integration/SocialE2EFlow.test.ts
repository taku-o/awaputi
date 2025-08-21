/**
 * ソーシャル機能のエンドツーエンド共有フロー統合テスト
 * Issue #37 Task 21.4: エンドツーエンド共有フローテスト
 */
import { jest } from '@jest/globals';

interface GameStats {
    totalScore: number;
    highScore: number;
    gamesPlayed: number;
    totalPlayTime: number;
    averageScore: number;
    bestCombo: number;
    accuracy: number;
    bubblesPopped: number;
    perfectRounds: number;
    highestStreak: number;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
    rare: boolean;
    rarity?: string;
    category: string;
    progress?: number;
    target?: number;
}

interface GameResult {
    score: number;
    stage: string;
    playTime: number;
    combo: number;
    accuracy: number;
    isHighScore?: boolean;
    bubblesPopped?: number;
    perfectStreak?: number;
    timestamp?: number;
}

interface ShareSettings {
    autoShare: boolean;
    shareHighScores: boolean;
    shareAchievements: boolean;
    shareProgress: boolean;
    privacy: string;
}

interface PlayerSettings {
    shareSettings: ShareSettings;
}

interface ShareSuggestion {
    shouldSuggestShare: boolean;
    reasons?: string[];
    reason?: string;
    shareData?: any;
}

interface ChallengeData {
    id: string;
    name: string;
    description: string;
    type: string;
    completed: boolean;
    completedAt?: number;
    progress?: number;
    target: number;
    reward?: {
        ap?: number;
        items?: string[];
    };
}

interface ShareResult {
    success: boolean;
    fallbackUsed?: boolean;
    retriesUsed?: number;
}

interface CleanupResult {
    cleaned: boolean;
    itemsRemoved: number;
}

interface AchievementProgress {
    total: number;
    unlocked: number;
    percentage: number;
    rare: number;
}

interface GameEngine {
    canvas: HTMLCanvasElement;
    getCanvas(): HTMLCanvasElement;
    getCurrentScene(): { name: string; isGameEnd?: boolean; };
    isRunning(): boolean;
    render(): void;
}

interface StatisticsManager {
    recordGameSession(session: GameResult): void;
    getDetailedStatistics(): GameStats;
    getHighScore(stage: string): number;
    getTotalScore(): number;
    getTotalGames(): number;
    getAverageScore(): number;
    getBestCombo(): number;
    getAccuracy(): number;
    getSessions(): GameResult[];
}

interface AchievementManager {
    getAchievements(): Achievement[];
    getUnlockedAchievements(): Achievement[];
    getRareAchievements(): Achievement[];
    unlockAchievement(id: string): Achievement | null;
    checkAndUnlockAchievements(gameData: GameResult): Achievement[];
}

interface PlayerData {
    getPlayerName(): string;
    getTotalAP(): number;
    getHighScore(stage: string): number;
    getAllHighScores(): Record<string, number>;
    updateHighScore(stage: string, score: number): boolean;
    getSettings(): PlayerSettings;
    updateSettings(newSettings: Partial<PlayerSettings>): void;
    save(): void;
}

interface SettingsManager {
    get(key: string): any;
    set(key: string, value: any): void;
}

interface SocialSharingManager {
    gameEngine: GameEngine;
    statisticsManager: StatisticsManager;
    achievementManager: AchievementManager;
    isInitialized: boolean;
    shareContentGenerator: any;
    screenshotCapture: any;
    leaderboardManager: any;
    challengeSystem: any;
    initialize(): Promise<void>;
    checkShareSuggestion(gameResult: GameResult): Promise<ShareSuggestion>;
    handleGameEnd(gameResult: GameResult): Promise<void>;
    captureGameScreen(options?: any): Promise<string | null>;
    handleAchievementUnlocked(achievement: Achievement): Promise<void>;
    generateAchievementShareData(achievement: Achievement): Promise<any>;
    handleChallengeCompleted(challenge: ChallengeData): Promise<void>;
    share(shareData: any): Promise<ShareResult>;
    shareToTwitter(shareData: any): Promise<void>;
    shareToFacebook(shareData: any): Promise<void>;
    shareWithRetry(shareData: any, options: { maxRetries: number; }): Promise<ShareResult>;
    generateRankingShareData(rankData: any): Promise<any>;
    cleanup(): Promise<void>;
    getAchievementProgress(): Promise<AchievementProgress>;
}

// E2Eテスト用のフルシステムモック
class FullSystemMock {
    gameEngine: GameEngine;
    statisticsManager: StatisticsManager;
    achievementManager: AchievementManager;
    playerData: PlayerData;
    settingsManager: SettingsManager;

    constructor() {
        this.gameEngine = this.createGameEngine();
        this.statisticsManager = this.createStatisticsManager();
        this.achievementManager = this.createAchievementManager();
        this.playerData = this.createPlayerData();
        this.settingsManager = this.createSettingsManager();
    }

    createGameEngine(): GameEngine {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;

        // テストゲーム画面を描画
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#16213e';
        ctx.beginPath();
        ctx.arc(400, 300, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f3460';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BubblePop', 400, 200);
        ctx.fillStyle = '#e94560';
        ctx.font = '32px Arial';
        ctx.fillText('Score: 75000', 400, 320);
        ctx.fillText('Combo: 25x', 400, 380);
        
        return {
            canvas,
            getCanvas: () => canvas,
            getCurrentScene: () => ({ name: 'GameScene', isGameEnd: true }),
            isRunning: () => true,
            render: () => {
                // レンダリングロジックのシミュレート
                ctx.fillStyle = `hsl(${Date.now() % 360}, 70%, 50%)`;
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.arc(
                        Math.random() * 800,
                        Math.random() * 600,
                        Math.random() * 30 + 10,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        };
    }

    createStatisticsManager(): StatisticsManager {
        const sessions: GameResult[] = [];
        let totalScore = 750000;
        let totalGames = 150;
        
        return {
            recordGameSession: (session: GameResult) => {
                sessions.push({ ...session, timestamp: Date.now() });
                totalGames++;
                totalScore += session.score;
            },
            getDetailedStatistics: () => ({
                totalScore,
                totalGames,
                averageScore: Math.floor(totalScore / totalGames),
                totalPlayTime: 180000,
                bestCombo: 35,
                accuracy: 0.82,
                bubblesPopped: 25000,
                perfectRounds: 12,
                highestStreak: 8,
                highScore: 75000,
                gamesPlayed: totalGames
            }),
            getHighScore: (stage: string) => {
                const highScores: Record<string, number> = { normal: 65000, hard: 48000, expert: 32000 };
                return highScores[stage] || 0;
            },
            getTotalScore: () => totalScore,
            getTotalGames: () => totalGames,
            getAverageScore: () => Math.floor(totalScore / totalGames),
            getBestCombo: () => 35,
            getAccuracy: () => 0.82,
            getSessions: () => [...sessions]
        };
    }

    createAchievementManager(): AchievementManager {
        const achievements = new Map([
            ['first_win', {
                id: 'first_win',
                name: '初勝利',
                description: '初めてゲームをクリア',
                unlocked: true,
                unlockedAt: Date.now(),
                rare: false,
                category: 'progress'
            }],
            ['high_scorer', {
                id: 'high_scorer',
                name: 'ハイスコアラー',
                description: '50000点を達成',
                unlocked: true,
                unlockedAt: Date.now(),
                rare: true,
                category: 'score'
            }],
            ['combo_master', {
                id: 'combo_master',
                name: 'コンボマスター',
                description: '30コンボを達成',
                unlocked: false,
                progress: 25,
                target: 30,
                rare: true,
                category: 'skill'
            }]
        ]);
        
        return {
            getAchievements: () => Array.from(achievements.values()),
            getUnlockedAchievements: () => Array.from(achievements.values()).filter(a => a.unlocked),
            getRareAchievements: () => Array.from(achievements.values()).filter(a => a.rare),
            unlockAchievement: (id: string) => {
                if (achievements.has(id)) {
                    const achievement = achievements.get(id)!;
                    achievement.unlocked = true;
                    achievement.unlockedAt = Date.now();
                    return achievement;
                }
                return null;
            },
            checkAndUnlockAchievements: (gameData: GameResult) => {
                const newlyUnlocked: Achievement[] = [];
                if (gameData.combo >= 30 && !achievements.get('combo_master')!.unlocked) {
                    const achievement = achievements.get('combo_master')!;
                    achievement.unlocked = true;
                    achievement.unlockedAt = Date.now();
                    newlyUnlocked.push(achievement);
                }
                return newlyUnlocked;
            }
        };
    }

    createPlayerData(): PlayerData {
        const data = {
            playerName: 'TestPlayer',
            totalAP: 8500,
            totalTAP: 25000,
            highScores: { normal: 65000, hard: 48000, expert: 32000 },
            settings: {
                shareSettings: {
                    autoShare: true,
                    shareHighScores: true,
                    shareAchievements: true,
                    shareProgress: true,
                    privacy: 'public'
                }
            }
        };
        
        return {
            getPlayerName: () => data.playerName,
            getTotalAP: () => data.totalAP,
            getHighScore: (stage: string) => data.highScores[stage] || 0,
            getAllHighScores: () => ({ ...data.highScores }),
            updateHighScore: (stage: string, score: number) => {
                if (score > (data.highScores[stage] || 0)) {
                    data.highScores[stage] = score;
                    return true;
                }
                return false;
            },
            getSettings: () => data.settings,
            updateSettings: (newSettings: Partial<PlayerSettings>) => {
                Object.assign(data.settings, newSettings);
            },
            save: () => localStorage.setItem('playerData', JSON.stringify(data))
        };
    }

    createSettingsManager(): SettingsManager {
        return {
            get: (key: string) => {
                const settings: Record<string, any> = {
                    'social.autoShare': true,
                    'social.shareHighScores': true,
                    'social.shareAchievements': true,
                    'social.privacy': 'public',
                    'ui.theme': 'modern',
                    'ui.animations': true
                };
                return settings[key];
            },
            set: (key: string, value: any) => {
                localStorage.setItem(`setting_${key}`, JSON.stringify(value));
            }
        };
    }
}

describe('SocialE2EFlow', () => {
    let systemMock: FullSystemMock;
    let socialManager: SocialSharingManager;
    let domElements: Record<string, HTMLElement>;

    beforeAll(async () => {
        // グローバル環境を設定
        global.document = document;
        global.window = window;
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        } as any;

        // Web Share API のモック
        global.navigator = {
            share: jest.fn().mockResolvedValue(undefined),
            canShare: jest.fn(),
            userAgent: 'Mozilla/5.0(iPhone CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        } as any;

        // Performance API のモック
        global.performance = {
            now: jest.fn(() => Date.now()),
            memory: {
                usedJSHeapSize: 10000000,
                totalJSHeapSize: 50000000
            }
        } as any;
    });

    beforeEach(async () => {
        // DOM環境をセットアップ
        document.body.innerHTML = `
            <div id="gameContainer">
                <canvas id="gameCanvas" width="800" height="600"></canvas>
                <div id="gameEndScreen" style="display: none">
                    <div class="score-display">
                        <h2 id="finalScore">0</h2>
                        <p id="scoreMessage">ゲーム終了</p>
                    </div>
                    <div id="actionButtons" class="action-buttons"></div>
                </div>
            </div>
            <div id="achievementNotifications"></div>
            <div id="challengeNotifications"></div>
            <div id="modalContainer"></div>
        `;

        domElements = {
            gameCanvas: document.getElementById('gameCanvas')!,
            gameEndScreen: document.getElementById('gameEndScreen')!,
            actionButtons: document.getElementById('actionButtons')!,
            achievementNotifications: document.getElementById('achievementNotifications')!,
            challengeNotifications: document.getElementById('challengeNotifications')!,
            modalContainer: document.getElementById('modalContainer')!,
            finalScore: document.getElementById('finalScore')!
        };

        // フルシステムモックを初期化
        systemMock = new FullSystemMock();
        const module = await import('../../core/SocialSharingManager.js');
        const SocialSharingManager = module.SocialSharingManager;
        socialManager = new SocialSharingManager(
            systemMock.gameEngine,
            systemMock.statisticsManager,
            systemMock.achievementManager
        );
        await socialManager.initialize();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('完全な共有フロー: ゲーム終了からスコア共有まで', () => {
        test('ハイスコア達成時の完全フロー', async () => {
            const gameResult: GameResult = {
                score: 78000,
                stage: 'normal',
                playTime: 425000,
                combo: 32,
                accuracy: 0.89,
                isHighScore: true,
                bubblesPopped: 845,
                perfectStreak: 12
            };

            // 1. ゲーム終了処理
            systemMock.statisticsManager.recordGameSession(gameResult);
            const wasHighScore = systemMock.playerData.updateHighScore('normal', gameResult.score);
            expect(wasHighScore).toBe(true);

            // 2. 実績チェック（コンボマスター解除）
            const unlockedAchievements = systemMock.achievementManager
                .checkAndUnlockAchievements(gameResult);
            expect(unlockedAchievements.length).toBe(1);
            expect(unlockedAchievements[0].id).toBe('combo_master');

            // 3. 共有提案の生成
            const shareSuggestion = await socialManager.checkShareSuggestion(gameResult);
            expect(shareSuggestion.shouldSuggestShare).toBe(true);
            expect(shareSuggestion.reasons).toContain('high_score');
            expect(shareSuggestion.reasons).toContain('new_achievement');

            // 4. ゲーム終了画面の表示と共有ボタンの挿入
            domElements.gameEndScreen.style.display = 'block';
            domElements.finalScore.textContent = gameResult.score.toLocaleString();
            await socialManager.handleGameEnd(gameResult);

            // 共有ボタンが挿入されることを確認
            const shareButton = domElements.actionButtons.querySelector('.share-button') as HTMLElement;
            expect(shareButton).toBeTruthy();
            expect(shareButton.classList.contains('highlight')).toBe(true);

            // 5. スクリーンショット生成
            const screenshot = await socialManager.captureGameScreen({
                includeOverlay: true,
                overlayData: {
                    score: gameResult.score,
                    stage: gameResult.stage,
                    isHighScore: true,
                    combo: gameResult.combo
                }
            });
            expect(screenshot).toBeTruthy();
            expect(screenshot!.startsWith('data:image/')).toBe(true);

            // 6. 共有ボタンクリックとダイアログ表示
            shareButton.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            const shareDialog = document.querySelector('.share-dialog') as HTMLElement;
            expect(shareDialog).toBeTruthy();
            expect(shareDialog.style.display).not.toBe('none');

            // 7. プラットフォーム選択（Twitter）
            const twitterButton = shareDialog.querySelector('[data-platform="twitter"]') as HTMLElement;
            expect(twitterButton).toBeTruthy();
            twitterButton.click();

            const messageEditor = shareDialog.querySelector('.message-editor') as HTMLTextAreaElement;
            expect(messageEditor).toBeTruthy();
            expect(messageEditor.value).toContain('78000');
            expect(messageEditor.value).toContain('コンボマスター');

            // カスタムメッセージを入力
            messageEditor.value = 'BubblePopで新記録78000点！コンボマスターも解除したよ！ #BubblePop #NewRecord';
            messageEditor.dispatchEvent(new Event('input'));

            // 9. 最終的な共有実行
            const shareNowButton = shareDialog.querySelector('.share-now-button') as HTMLElement;
            expect(shareNowButton).toBeTruthy();
            shareNowButton.click();

            // Web Share API が呼ばれることを確認
            expect(navigator.share).toHaveBeenCalledWith({
                title: 'BubblePop - New High Score!',
                text: 'BubblePopで新記録78000点！コンボマスターも解除したよ！ #BubblePop #NewRecord',
                url: expect.stringContaining('bubblePop')
            });

            // 10. 共有成功のフィードバック
            await new Promise(resolve => setTimeout(resolve, 100));
            const successMessage = document.querySelector('.share-success-message') as HTMLElement;
            expect(successMessage).toBeTruthy();
            expect(successMessage.textContent).toContain('共有完了');
        });
    });
});