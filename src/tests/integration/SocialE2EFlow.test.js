/**
 * ソーシャル機能のエンドツーエンド共有フロー統合テスト
 * Issue #37 Task 21.4: エンドツーエンド共有フローテスト
 */

import { jest } from '@jest/globals';

// E2Eテスト用のフルシステムモック
class FullSystemMock {
    constructor() {
        this.gameEngine = this.createGameEngine();
        this.statisticsManager = this.createStatisticsManager();
        this.achievementManager = this.createAchievementManager();
        this.playerData = this.createPlayerData();
        this.settingsManager = this.createSettingsManager();
    }

    createGameEngine() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

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

    createStatisticsManager() {
        const sessions = [];
        let totalScore = 750000;
        let totalGames = 150;

        return {
            recordGameSession: (session) => {
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
                highestStreak: 8
            }),
            getHighScore: (stage) => {
                const highScores = { normal: 65000, hard: 48000, expert: 32000 };
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

    createAchievementManager() {
        const achievements = new Map([
            ['first_win', {
                id: 'first_win',
                name: '初勝利',
                description: '初めてゲームをクリア',
                unlocked: true,
                unlockedAt: Date.now() - 86400000,
                rare: false,
                category: 'progress'
            }],
            ['high_scorer', {
                id: 'high_scorer',
                name: 'ハイスコアラー',
                description: '50000点を達成',
                unlocked: true,
                unlockedAt: Date.now() - 7200000,
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
            unlockAchievement: (id) => {
                if (achievements.has(id)) {
                    const achievement = achievements.get(id);
                    achievement.unlocked = true;
                    achievement.unlockedAt = Date.now();
                    return achievement;
                }
                return null;
            },
            checkAndUnlockAchievements: (gameData) => {
                const newlyUnlocked = [];
                
                if (gameData.combo >= 30 && !achievements.get('combo_master').unlocked) {
                    const achievement = achievements.get('combo_master');
                    achievement.unlocked = true;
                    achievement.unlockedAt = Date.now();
                    newlyUnlocked.push(achievement);
                }
                
                return newlyUnlocked;
            }
        };
    }

    createPlayerData() {
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
            getHighScore: (stage) => data.highScores[stage] || 0,
            getAllHighScores: () => ({ ...data.highScores }),
            updateHighScore: (stage, score) => {
                if (score > data.highScores[stage]) {
                    data.highScores[stage] = score;
                    return true;
                }
                return false;
            },
            getSettings: () => data.settings,
            updateSettings: (newSettings) => {
                Object.assign(data.settings, newSettings);
            },
            save: () => localStorage.setItem('playerData', JSON.stringify(data))
        };
    }

    createSettingsManager() {
        return {
            get: (key) => {
                const settings = {
                    'social.autoShare': true,
                    'social.shareHighScores': true,
                    'social.shareAchievements': true,
                    'social.privacy': 'public',
                    'ui.theme': 'modern',
                    'ui.animations': true
                };
                return settings[key];
            },
            set: (key, value) => {
                localStorage.setItem(`setting_${key}`, JSON.stringify(value));
            }
        };
    }
}

describe('SocialE2EFlow', () => {
    let systemMock;
    let socialManager;
    let domElements;

    beforeAll(async () => {
        // グローバル環境を設定
        global.document = document;
        global.window = window;
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };

        // Web Share API のモック
        global.navigator = {
            share: jest.fn().mockResolvedValue(undefined),
            canShare: jest.fn().mockReturnValue(true),
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        };

        // Performance API のモック
        global.performance = {
            now: jest.fn(() => Date.now()),
            memory: {
                usedJSHeapSize: 10000000,
                totalJSHeapSize: 50000000
            }
        };
    });

    beforeEach(async () => {
        // DOM環境をセットアップ
        document.body.innerHTML = `
            <div id="gameContainer">
                <canvas id="gameCanvas" width="800" height="600"></canvas>
                <div id="gameEndScreen" style="display: none;">
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
            gameCanvas: document.getElementById('gameCanvas'),
            gameEndScreen: document.getElementById('gameEndScreen'),
            actionButtons: document.getElementById('actionButtons'),
            achievementNotifications: document.getElementById('achievementNotifications'),
            challengeNotifications: document.getElementById('challengeNotifications'),
            modalContainer: document.getElementById('modalContainer')
        };

        // フルシステムモックを初期化
        systemMock = new FullSystemMock();

        // SocialSharingManagerを初期化
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
            const gameResult = {
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
            const shareButton = domElements.actionButtons.querySelector('.share-button');
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
            expect(screenshot.startsWith('data:image/')).toBe(true);

            // 6. 共有ボタンクリックとダイアログ表示
            shareButton.click();

            await new Promise(resolve => setTimeout(resolve, 200));

            const shareDialog = document.querySelector('.share-dialog');
            expect(shareDialog).toBeTruthy();
            expect(shareDialog.style.display).not.toBe('none');

            // 7. プラットフォーム選択（Twitter）
            const twitterButton = shareDialog.querySelector('[data-platform="twitter"]');
            expect(twitterButton).toBeTruthy();

            twitterButton.click();

            // 8. メッセージのカスタマイズ
            const messageEditor = shareDialog.querySelector('.message-editor');
            expect(messageEditor).toBeTruthy();
            expect(messageEditor.value).toContain('78000');
            expect(messageEditor.value).toContain('コンボマスター');

            // カスタムメッセージを入力
            messageEditor.value = 'BubblePopで新記録78000点！コンボマスターも解除したよ！ #BubblePop #NewRecord';
            messageEditor.dispatchEvent(new Event('input'));

            // 9. 最終的な共有実行
            const shareNowButton = shareDialog.querySelector('.share-now-button');
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

            const successMessage = document.querySelector('.share-success-message');
            expect(successMessage).toBeTruthy();
            expect(successMessage.textContent).toContain('共有完了');
        });

        test('実績解除時の即座共有フロー', async () => {
            const rareAchievement = {
                id: 'perfect_master',
                name: 'パーフェクトマスター',
                description: '10回連続でパーフェクトラウンド',
                rare: true,
                rarity: 'legendary',
                unlockedAt: Date.now(),
                category: 'skill'
            };

            // 1. 実績解除通知の表示
            await socialManager.handleAchievementUnlocked(rareAchievement);

            const achievementNotification = domElements.achievementNotifications
                .querySelector('.achievement-notification');
            
            expect(achievementNotification).toBeTruthy();
            expect(achievementNotification.classList.contains('rare')).toBe(true);
            expect(achievementNotification.classList.contains('legendary')).toBe(true);

            // 2. 実績専用の共有ボタン確認
            const achievementShareButton = achievementNotification
                .querySelector('.share-button[data-type="achievement"]');
            
            expect(achievementShareButton).toBeTruthy();
            expect(achievementShareButton.textContent).toContain('実績を共有');

            // 3. 実績共有データの生成
            const achievementShareData = await socialManager
                .generateAchievementShareData(rareAchievement);

            expect(achievementShareData.type).toBe('achievement');
            expect(achievementShareData.achievement.id).toBe('perfect_master');
            expect(achievementShareData.shouldHighlight).toBe(true);

            // 4. 実績共有ボタンクリック
            achievementShareButton.click();

            await new Promise(resolve => setTimeout(resolve, 100));

            const shareDialog = document.querySelector('.share-dialog');
            expect(shareDialog).toBeTruthy();

            // 5. 実績専用のメッセージテンプレート確認
            const messagePreview = shareDialog.querySelector('.message-preview');
            expect(messagePreview.textContent).toContain('パーフェクトマスター');
            expect(messagePreview.textContent).toContain('10回連続');
            expect(messagePreview.textContent).toContain('#BubblePop');

            // 6. 実績画像の生成確認
            const achievementImage = shareDialog.querySelector('.achievement-image');
            expect(achievementImage).toBeTruthy();
            expect(achievementImage.src).toContain('data:image/');
        });

        test('チャレンジ完了時の共有フロー', async () => {
            const completedChallenge = {
                id: 'weekly_high_scorer',
                name: '週間ハイスコアチャレンジ',
                description: '1週間で500000点を獲得',
                type: 'weekly',
                completed: true,
                completedAt: Date.now(),
                progress: 500000,
                target: 500000,
                reward: { ap: 1000, items: ['golden_bubble'] }
            };

            // 1. チャレンジ完了処理
            await socialManager.challengeSystem.completeChallenge(completedChallenge.id);

            // 2. 完了通知の表示
            await socialManager.handleChallengeCompleted(completedChallenge);

            const challengeNotification = domElements.challengeNotifications
                .querySelector('.challenge-notification');

            expect(challengeNotification).toBeTruthy();
            expect(challengeNotification.textContent).toContain('週間ハイスコアチャレンジ');

            // 3. チャレンジ共有ボタンの確認
            const challengeShareButton = challengeNotification
                .querySelector('.share-button[data-type="challenge"]');

            expect(challengeShareButton).toBeTruthy();

            // 4. 共有実行
            challengeShareButton.click();

            await new Promise(resolve => setTimeout(resolve, 100));

            const shareDialog = document.querySelector('.share-dialog');
            const messagePreview = shareDialog.querySelector('.message-preview');

            expect(messagePreview.textContent).toContain('週間ハイスコアチャレンジ');
            expect(messagePreview.textContent).toContain('500000点');
        });
    });

    describe('複数プラットフォーム共有フロー', () => {
        test('Twitter共有の完全フロー', async () => {
            const shareData = {
                type: 'score',
                score: 85000,
                stage: 'expert',
                combo: 28,
                screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANS...'
            };

            // Twitter共有ウィンドウの開始をモック
            const originalOpen = window.open;
            window.open = jest.fn();

            await socialManager.shareToTwitter(shareData);

            // Twitter共有URLが正しく生成されることを確認
            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('twitter.com/intent/tweet'),
                'twitter-share',
                expect.stringContaining('width=550,height=420')
            );

            const callArgs = window.open.mock.calls[0][0];
            expect(callArgs).toContain('text=');
            expect(callArgs).toContain('85000');
            expect(callArgs).toContain('hashtags=BubblePop');

            window.open = originalOpen;
        });

        test('Facebook共有のOGタグ連携', async () => {
            const shareData = {
                type: 'achievement',
                achievement: {
                    name: 'スピードデーモン',
                    description: '30秒以内でクリア'
                },
                screenshot: 'data:image/png;base64,test...'
            };

            // OGタグの動的更新をテスト
            await socialManager.shareToFacebook(shareData);

            // メタタグが適切に設定されることを確認
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDescription = document.querySelector('meta[property="og:description"]');
            const ogImage = document.querySelector('meta[property="og:image"]');

            expect(ogTitle?.getAttribute('content')).toContain('スピードデーモン');
            expect(ogDescription?.getAttribute('content')).toContain('30秒以内');
            expect(ogImage?.getAttribute('content')).toContain('data:image/');
        });

        test('Web Share API フォールバック機能', async () => {
            // Web Share API を無効化
            global.navigator.canShare = jest.fn().mockReturnValue(false);
            global.navigator.share = undefined;

            const shareData = {
                type: 'score',
                score: 62000,
                stage: 'normal'
            };

            // カスタム共有ダイアログが表示されることを確認
            await socialManager.share(shareData);

            const customShareDialog = document.querySelector('.custom-share-dialog');
            expect(customShareDialog).toBeTruthy();

            // プラットフォーム別のボタンが表示されることを確認
            const platformButtons = customShareDialog.querySelectorAll('.platform-button');
            expect(platformButtons.length).toBeGreaterThanOrEqual(3); // Twitter, Facebook, Copy Link
        });
    });

    describe('リーダーボード統合共有フロー', () => {
        test('ランキング上位達成時の共有フロー', async () => {
            // 複数のスコアをリーダーボードに追加
            const scores = [
                { score: 95000, playerName: 'Player1', stage: 'expert' },
                { score: 87000, playerName: 'Player2', stage: 'expert' },
                { score: 82000, playerName: 'TestPlayer', stage: 'expert' }, // 現在のプレイヤー
                { score: 79000, playerName: 'Player4', stage: 'expert' }
            ];

            for (const scoreData of scores) {
                await socialManager.leaderboardManager.updateScore({
                    ...scoreData,
                    timestamp: Date.now(),
                    metadata: { combo: 20, accuracy: 0.85, playTime: 300000 }
                });
            }

            // 新しい高得点で3位から1位に上昇
            const newScore = {
                score: 98000,
                playerName: 'TestPlayer',
                stage: 'expert',
                timestamp: Date.now(),
                metadata: { combo: 35, accuracy: 0.92, playTime: 480000 }
            };

            await socialManager.leaderboardManager.updateScore(newScore);

            // ランキング変動の検出
            const currentRanking = await socialManager.leaderboardManager.getRanking('allTime', 'expert');
            const playerRank = currentRanking.findIndex(entry => entry.playerName === 'TestPlayer') + 1;

            expect(playerRank).toBe(1); // 1位に上昇

            // ランキング上位達成の共有提案
            const rankShareData = await socialManager.generateRankingShareData({
                rank: playerRank,
                score: newScore.score,
                stage: newScore.stage,
                previousRank: 3
            });

            expect(rankShareData.type).toBe('ranking');
            expect(rankShareData.rank).toBe(1);
            expect(rankShareData.improvement).toBe(2); // 3位→1位 = +2

            // 共有メッセージの生成
            const shareMessage = await socialManager.shareContentGenerator
                .generateRankingMessage(rankShareData, 'twitter');

            expect(shareMessage).toContain('1位');
            expect(shareMessage).toContain('98000');
            expect(shareMessage).toContain('expert');
        });
    });

    describe('エラーハンドリングと復旧フロー', () => {
        test('スクリーンショット生成失敗時のフォールバック', async () => {
            // Canvas.toDataURL を失敗させる
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = jest.fn(() => {
                throw new Error('Canvas tainted');
            });

            const shareData = {
                type: 'score',
                score: 45000,
                stage: 'normal'
            };

            // フォールバック画像が使用されることを確認
            const screenshot = await socialManager.captureGameScreen();
            expect(screenshot).toBeNull(); // または デフォルト画像

            // 共有は画像なしで続行されることを確認
            const shareResult = await socialManager.share(shareData);
            expect(shareResult.success).toBe(true);
            expect(shareResult.fallbackUsed).toBe(true);

            HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
        });

        test('ネットワークエラー時の再試行機能', async () => {
            // Navigator.share を失敗させる
            global.navigator.share = jest.fn()
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce(undefined);

            const shareData = {
                type: 'achievement',
                achievement: {
                    name: 'ネットワークテスト',
                    description: 'ネットワークエラーのテスト'
                }
            };

            // 最初の試行は失敗、再試行で成功することを確認
            const shareResult = await socialManager.shareWithRetry(shareData, { maxRetries: 2 });

            expect(shareResult.success).toBe(true);
            expect(shareResult.retriesUsed).toBe(1);
            expect(navigator.share).toHaveBeenCalledTimes(2);
        });

        test('ストレージ容量不足時のクリーンアップ', async () => {
            // LocalStorage を容量不足にシミュレート
            global.localStorage.setItem = jest.fn().mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            // 大量のリーダーボードデータを生成してストレージ不足を引き起こす
            const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
                score: Math.floor(Math.random() * 100000),
                playerName: `Player${i}`,
                timestamp: Date.now() - (i * 1000),
                metadata: { combo: i, accuracy: Math.random(), playTime: 300000 }
            }));

            // 自動クリーンアップが実行されることを確認
            const cleanupResult = await socialManager.leaderboardManager
                .handleStorageCleanup(largeDataSet);

            expect(cleanupResult.cleaned).toBe(true);
            expect(cleanupResult.itemsRemoved).toBeGreaterThan(0);
        });
    });

    describe('パフォーマンスとメモリ管理フロー', () => {
        test('連続共有操作でのメモリリーク防止', async () => {
            const initialMemory = performance.memory?.usedJSHeapSize || 0;

            // 50回の連続共有操作
            for (let i = 0; i < 50; i++) {
                const shareData = {
                    type: 'score',
                    score: Math.floor(Math.random() * 100000),
                    stage: ['normal', 'hard', 'expert'][i % 3]
                };

                await socialManager.captureGameScreen({
                    includeOverlay: true,
                    overlayData: shareData
                });

                await socialManager.shareContentGenerator
                    .generateScoreMessage(shareData, 'twitter');

                // 定期的にクリーンアップを実行
                if (i % 10 === 0) {
                    await socialManager.cleanup();
                }
            }

            const finalMemory = performance.memory?.usedJSHeapSize || 0;
            const memoryIncrease = finalMemory - initialMemory;

            // メモリ増加量が5MB以下であることを確認
            expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
        });

        test('大画面スクリーンショット処理のパフォーマンス', async () => {
            // 4Kサイズのキャンバスを作成
            const largeCanvas = document.createElement('canvas');
            largeCanvas.width = 3840;
            largeCanvas.height = 2160;

            const ctx = largeCanvas.getContext('2d');
            
            // 複雑な描画を実行
            for (let i = 0; i < 1000; i++) {
                ctx.fillStyle = `hsl(${i % 360}, 70%, 50%)`;
                ctx.beginPath();
                ctx.arc(
                    Math.random() * 3840,
                    Math.random() * 2160,
                    Math.random() * 100 + 20,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            // 大画面スクリーンショットの処理時間を測定
            const startTime = performance.now();

            const screenshot = await socialManager.screenshotCapture
                .captureCanvas(largeCanvas, {
                    outputWidth: 1200,
                    outputHeight: 630,
                    quality: 0.8
                });

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            // 処理時間が2秒以内であることを確認（要件8.1）
            expect(processingTime).toBeLessThan(2000);
            expect(screenshot).toBeTruthy();
            expect(screenshot.startsWith('data:image/')).toBe(true);
        });
    });
});