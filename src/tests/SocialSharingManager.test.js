/**
 * SocialSharingManager 基盤テスト
 */

describe('SocialSharingManager', () => {
    let gameEngine;
    let socialSharingManager;
    
    beforeEach(() => {
        // モックGameEngineの作成
        gameEngine = {
            statisticsManager: {
                recordSocialEvent: jest.fn()
            },
            achievementManager: {
                getAchievements: jest.fn()
            },
            localizationManager: {
                translate: jest.fn().mockReturnValue('test message')
            },
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            isDebugMode: jest.fn().mockReturnValue(false)
        };
        
        // LocalStorageのモック
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn()
            }
        });
        
        // Navigatorのモック
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });
        
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Chrome/90.0)'
        });
    });
    
    afterEach(() => {
        if (socialSharingManager) {
            socialSharingManager.cleanup();
        }
        jest.clearAllMocks();
    });
    
    describe('初期化', () => {
        test('正常に初期化される', async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
            
            expect(socialSharingManager.gameEngine).toBe(gameEngine);
            expect(socialSharingManager.settings.enabled).toBe(true);
            expect(socialSharingManager.performanceStats.shareRequests).toBe(0);
        });
        
        test('既存システムとの連携が設定される', async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
            await socialSharingManager.initialize();
            
            expect(socialSharingManager.statisticsManager).toBe(gameEngine.statisticsManager);
            expect(socialSharingManager.achievementManager).toBe(gameEngine.achievementManager);
            expect(socialSharingManager.localizationManager).toBe(gameEngine.localizationManager);
        });
        
        test('GameEngineイベントリスナーが設定される', async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
            await socialSharingManager.initialize();
            
            expect(gameEngine.on).toHaveBeenCalledWith('gameEnd', expect.any(Function));
            expect(gameEngine.on).toHaveBeenCalledWith('highScore', expect.any(Function));
            expect(gameEngine.on).toHaveBeenCalledWith('achievementUnlocked', expect.any(Function));
        });
    });
    
    describe('設定管理', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('設定の読み込み', async () => {
            const savedSettings = JSON.stringify({ autoPrompt: false });
            window.localStorage.getItem.mockReturnValue(savedSettings);
            
            await socialSharingManager.loadSettings();
            
            expect(window.localStorage.getItem).toHaveBeenCalledWith('socialSharingSettings');
            expect(socialSharingManager.settings.autoPrompt).toBe(false);
        });
        
        test('設定の保存', async () => {
            await socialSharingManager.saveSettings();
            
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'socialSharingSettings',
                JSON.stringify(socialSharingManager.settings)
            );
        });
        
        test('設定の更新', () => {
            const newSettings = { shareOnHighScore: false };
            socialSharingManager.updateSettings(newSettings);
            
            expect(socialSharingManager.settings.shareOnHighScore).toBe(false);
        });
    });
    
    describe('イベント処理', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('ゲーム終了時の処理', async () => {
            const gameData = { 
                score: 1000, 
                isHighScore: true,
                stage: 'normal'
            };
            
            await socialSharingManager.onGameEnd(gameData);
            
            // 統計イベントの記録確認
            expect(gameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'gameEnd',
                expect.objectContaining({
                    score: 1000,
                    wasShared: false
                })
            );
        });
        
        test('ハイスコア達成時の処理', async () => {
            const scoreData = { 
                score: 2000, 
                stage: 'hard' 
            };
            
            const result = await socialSharingManager.onHighScore(scoreData);
            
            expect(result).toBeDefined();
            expect(result.type).toBe('score');
            expect(result.content.score).toBe(2000);
        });
        
        test('実績解除時の処理', async () => {
            const achievementData = { 
                id: 'first_100', 
                name: '初回100点達成' 
            };
            
            const result = await socialSharingManager.onAchievementUnlocked(achievementData);
            
            expect(result).toBeDefined();
            expect(result.type).toBe('achievement');
            expect(result.content.achievement).toBe(achievementData);
        });
    });
    
    describe('プラットフォーム検出', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('Web Share API対応ブラウザの検出', () => {
            Object.defineProperty(navigator, 'share', {
                value: jest.fn(),
                writable: true
            });
            
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('web-share');
        });
        
        test('Twitter ブラウザの検出', () => {
            Object.defineProperty(navigator, 'userAgent', {
                writable: true,
                value: 'Mozilla/5.0 Twitter'
            });
            
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('twitter');
        });
        
        test('一般ブラウザの検出', () => {
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('generic');
        });
    });
    
    describe('エラーハンドリング', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('エラー統計の更新', () => {
            const error = new Error('テストエラー');
            socialSharingManager.handleError('TEST_ERROR', error);
            
            expect(socialSharingManager.performanceStats.failedShares).toBe(1);
        });
        
        test('設定読み込みエラーの処理', async () => {
            window.localStorage.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            
            // エラーが発生してもクラッシュしないことを確認
            await expect(socialSharingManager.loadSettings()).resolves.not.toThrow();
        });
    });
    
    describe('パフォーマンス統計', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('統計情報の取得', () => {
            socialSharingManager.performanceStats.shareRequests = 10;
            socialSharingManager.performanceStats.successfulShares = 8;
            
            const stats = socialSharingManager.getPerformanceStats();
            
            expect(stats.successRate).toBe(80);
            expect(stats.shareRequests).toBe(10);
            expect(stats.successfulShares).toBe(8);
        });
    });
    
    describe('デバッグ機能', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('デバッグ情報の取得', () => {
            const debugInfo = socialSharingManager.getDebugInfo();
            
            expect(debugInfo).toHaveProperty('settings');
            expect(debugInfo).toHaveProperty('performanceStats');
            expect(debugInfo).toHaveProperty('systemIntegration');
            expect(debugInfo).toHaveProperty('platform');
            expect(debugInfo).toHaveProperty('onlineStatus');
        });
        
        test('システム連携状態の確認', () => {
            const debugInfo = socialSharingManager.getDebugInfo();
            
            expect(debugInfo.systemIntegration.gameEngine).toBe(true);
            expect(debugInfo.systemIntegration.statisticsManager).toBe(true);
            expect(debugInfo.systemIntegration.achievementManager).toBe(true);
            expect(debugInfo.systemIntegration.localizationManager).toBe(true);
        });
    });
    
    describe('クリーンアップ', () => {
        beforeEach(async () => {
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
            socialSharingManager = new SocialSharingManager(gameEngine);
        });
        
        test('正常にクリーンアップされる', () => {
            socialSharingManager.cleanup();
            
            expect(gameEngine.off).toHaveBeenCalledWith('gameEnd', expect.any(Function));
            expect(gameEngine.off).toHaveBeenCalledWith('highScore', expect.any(Function));
            expect(gameEngine.off).toHaveBeenCalledWith('achievementUnlocked', expect.any(Function));
        });
    });
});