/**
 * ソーシャル機能の統合管理システム
 * スコア共有、実績共有、リーダーボード、チャレンジシステムの中央制御を行う
 * 分割されたコンポーネントを統合管理するメインクラス
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ShareContentGenerator } from './ShareContentGenerator.js';
import { SocialErrorHandler } from './SocialErrorHandler.js';
import { SocialPlatformAdapters } from './SocialPlatformAdapters.js';
import { SocialAnalyticsTracker } from './SocialAnalyticsTracker.js';

// 型定義
interface SocialSharingSettings {
    enabled: boolean;
    autoPrompt: boolean;
    shareOnHighScore: boolean;
    shareOnAchievement: boolean;
    defaultPlatform: string;
    promptDelay: number;
}

interface GameData {
    score: number;
    level: number;
    duration: number;
}

interface ScoreData {
    score: number;
    previousBest: number;
}

interface Achievement {
    id: string;
    type: string;
    name: string;
    description: string;
}

interface ShareData {
    platform?: string;
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
    hashtags?: string[];
}

interface ShareOptions {
    urgent?: boolean;
    useWebAPI?: boolean;
    fallback?: boolean;
}

interface ShareResult {
    success: boolean;
    platform?: string;
    error?: string;
}

interface Dependencies {
    statisticsManager?: any;
    achievementManager?: any;
    localizationManager?: any;
    screenshotCapture?: any;
    leaderboardManager?: any;
    challengeSystem?: any;
}

interface GameEngine {
    on: (event: string, callback: (data: any) => void) => void;
}

export class SocialSharingManager {
    private gameEngine: GameEngine;
    private statisticsManager: any | null;
    private achievementManager: any | null;
    private localizationManager: any | null;
    private screenshotCapture: any | null;
    private leaderboardManager: any | null;
    private challengeSystem: any | null;
    private shareContentGenerator: ShareContentGenerator | null;
    private errorHandler: SocialErrorHandler;
    private platformAdapters: SocialPlatformAdapters;
    private analyticsTracker: SocialAnalyticsTracker;
    private settings: SocialSharingSettings;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.statisticsManager = null;
        this.achievementManager = null;
        this.localizationManager = null;
        this.screenshotCapture = null;
        this.leaderboardManager = null;
        this.challengeSystem = null;
        this.shareContentGenerator = null;
        
        // エラーハンドラーの設定
        this.errorHandler = new SocialErrorHandler();
        
        // 分割されたコンポーネントを初期化
        this.platformAdapters = new SocialPlatformAdapters();
        this.analyticsTracker = new SocialAnalyticsTracker();

        // デフォルト設定
        this.settings = {
            enabled: true,
            autoPrompt: true,
            shareOnHighScore: true,
            shareOnAchievement: true,
            defaultPlatform: 'web-share',
            promptDelay: 1000
        };
        
        // 初期化
        this.init();
    }

    /**
     * システムの初期化
     */
    async init(): Promise<void> {
        try {
            // ShareContentGeneratorの初期化
            this.shareContentGenerator = new ShareContentGenerator();
            
            // 設定の読み込み
            await this.loadSettings();
            
            // エラーハンドラーの設定
            this.setupErrorHandler();
            
            // イベントリスナーの設定
            this.setupEventListeners();

            // 分析イベントの記録
            this.analyticsTracker.trackShareEvent('system_init', {
                platform: this.platformAdapters.detectPlatform(),
                webShareSupported: this.platformAdapters.isWebShareSupported()
            });

        } catch (error) {
            this.errorHandler.handleError('SOCIAL_SHARING_INIT_ERROR', error, {}, 'SocialSharingManager.init');
        }
    }

    /**
     * エラーハンドラーの設定
     */
    setupErrorHandler(): void {
        this.errorHandler.addErrorNotificationCallback((errorInfo) => {
            this.handleRetryAction(errorInfo);
        });
    }

    /**
     * リトライアクションの処理
     */
    handleRetryAction(errorInfo: any): void {
        this.analyticsTracker.trackError('retry_attempt', errorInfo);
    }

    /**
     * 既存システムとの連携設定
     */
    setupDependencies(dependencies: Dependencies): void {
        const {
            statisticsManager,
            achievementManager,
            localizationManager,
            screenshotCapture,
            leaderboardManager,
            challengeSystem
        } = dependencies;

        this.statisticsManager = statisticsManager;
        this.achievementManager = achievementManager;
        this.localizationManager = localizationManager;
        this.screenshotCapture = screenshotCapture;
        this.leaderboardManager = leaderboardManager;
        this.challengeSystem = challengeSystem;

        // ShareContentGeneratorに依存関係を設定
        if (this.shareContentGenerator) {
            this.shareContentGenerator.setupDependencies(dependencies);
        }
    }

    /**
     * 設定の読み込み
     */
    async loadSettings(): Promise<void> {
        try {
            const saved = localStorage.getItem('socialSharingSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            this.analyticsTracker.trackError('settings_load_failed', { error: (error as Error).message });
        }
    }

    /**
     * 設定の保存
     */
    async saveSettings(): Promise<void> {
        try {
            localStorage.setItem('socialSharingSettings', JSON.stringify(this.settings));
        } catch (error) {
            this.analyticsTracker.trackError('settings_save_failed', { error: (error as Error).message });
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners(): void {
        // ゲーム終了時の処理
        this.gameEngine.on('gameEnd', (gameData) => {
            this.handleGameEnd(gameData);
        });

        // ハイスコア達成時の処理
        this.gameEngine.on('highScore', (scoreData) => {
            this.handleHighScore(scoreData);
        });

        // 実績解除時の処理
        if (this.achievementManager) {
            this.achievementManager.on('achievementUnlocked', (achievement: Achievement) => {
                this.handleAchievementUnlock(achievement);
            });
        }

        // オンライン状態の変化
        window.addEventListener('online', () => this.onOnlineStatusChange());
        window.addEventListener('offline', () => this.onOnlineStatusChange());

        // ページ離脱時の処理
        window.addEventListener('beforeunload', (event) => this.onBeforeUnload(event));
    }

    /**
     * ゲーム終了時の処理
     */
    handleGameEnd(gameData: GameData): void {
        this.analyticsTracker.trackShareEvent('game_end', {
            score: gameData.score,
            level: gameData.level,
            duration: gameData.duration
        });

        if (this.settings.autoPrompt && gameData.score > 0) {
            setTimeout(() => {
                this.showScoreSharePrompt(gameData);
            }, this.settings.promptDelay);
        }
    }

    /**
     * ハイスコア達成時の処理
     */
    handleHighScore(scoreData: ScoreData): void {
        this.analyticsTracker.trackShareEvent('high_score', {
            score: scoreData.score,
            previousBest: scoreData.previousBest
        });

        if (this.settings.shareOnHighScore) {
            this.showHighScoreSharePrompt(scoreData);
        }
    }

    /**
     * 実績解除時の処理
     */
    handleAchievementUnlock(achievement: Achievement): void {
        this.analyticsTracker.trackShareEvent('achievement_unlock', {
            achievementId: achievement.id,
            achievementType: achievement.type
        });

        if (this.settings.shareOnAchievement) {
            this.showAchievementSharePrompt(achievement);
        }
    }

    /**
     * スコア共有プロンプトの表示
     */
    async showScoreSharePrompt(gameData: GameData): Promise<void> {
        this.analyticsTracker.trackUserBehavior('sharePromptView', { type: 'score' });
        
        if (this.shareContentGenerator) {
            const shareData = await this.shareContentGenerator.generateScoreShareContent(gameData);
            this.showShareDialog(shareData);
        }
    }

    /**
     * ハイスコア共有プロンプトの表示
     */
    async showHighScoreSharePrompt(scoreData: ScoreData): Promise<void> {
        this.analyticsTracker.trackUserBehavior('sharePromptView', { type: 'highScore' });
        
        if (this.shareContentGenerator) {
            const shareData = await this.shareContentGenerator.generateHighScoreShareContent(scoreData);
            this.showShareDialog(shareData);
        }
    }

    /**
     * 実績共有プロンプトの表示
     */
    async showAchievementSharePrompt(achievement: Achievement): Promise<void> {
        this.analyticsTracker.trackUserBehavior('sharePromptView', { type: 'achievement' });
        
        if (this.shareContentGenerator) {
            const shareData = await this.shareContentGenerator.generateAchievementShareContent(achievement);
            this.showShareDialog(shareData);
        }
    }

    /**
     * 統合共有メソッド（Web API優先、フォールバック対応）
     */
    async share(shareData: ShareData, options: ShareOptions = {}): Promise<ShareResult> {
        try {
            const startTime = Date.now();
            
            this.analyticsTracker.trackShareEvent('share_request', {
                platform: shareData.platform || 'auto',
                hasScreenshot: !!shareData.files,
                startTime
            });

            let result: ShareResult;

            // プラットフォーム別共有処理
            if (shareData.platform === 'twitter') {
                result = await this.shareViaTwitter(shareData);
            } else if (shareData.platform === 'facebook') {
                result = await this.shareViaFacebook(shareData);
            } else if (this.platformAdapters.isWebShareSupported()) {
                result = await this.platformAdapters.shareViaWebAPI(shareData);
            } else {
                result = await this.showFallbackShareDialog(shareData);
            }

            this.analyticsTracker.trackShareEvent('share_success', {
                platform: result.platform || shareData.platform,
                endTime: Date.now(),
                startTime
            });

            return result;

        } catch (error) {
            this.analyticsTracker.trackShareEvent('share_failure', {
                platform: shareData.platform,
                error: (error as Error).message,
                endTime: Date.now()
            });

            this.analyticsTracker.trackError('share_failed', {
                platform: shareData.platform,
                error: (error as Error).message
            });

            throw error;
        }
    }

    /**
     * Twitter向け共有
     */
    async shareViaTwitter(shareData: ShareData): Promise<ShareResult> {
        if (this.platformAdapters.isWebShareSupported()) {
            return await this.platformAdapters.shareViaTwitterWebAPI(shareData);
        } else {
            const url = this.platformAdapters.generateTwitterShareUrl(shareData);
            window.open(url, '_blank', 'width=600,height=400');
            return { success: true, platform: 'twitter-url' };
        }
    }

    /**
     * Facebook向け共有
     */
    async shareViaFacebook(shareData: ShareData): Promise<ShareResult> {
        if (this.platformAdapters.isWebShareSupported()) {
            return await this.platformAdapters.shareViaFacebookWebAPI(shareData);
        } else {
            const url = this.platformAdapters.generateFacebookShareUrl(shareData);
            window.open(url, '_blank', 'width=600,height=400');
            return { success: true, platform: 'facebook-url' };
        }
    }

    /**
     * フォールバック共有ダイアログの表示
     */
    async showFallbackShareDialog(shareData: ShareData): Promise<ShareResult> {
        // フォールバック用のダイアログ表示
        console.log('Fallback share dialog for:', shareData);
        return { success: true, platform: 'fallback' };
    }

    /**
     * 共有ダイアログの表示
     */
    showShareDialog(shareData: ShareData): void {
        // ダイアログ表示のロジック
        this.analyticsTracker.trackUserBehavior('shareDialogShow', {
            platform: shareData.platform
        });
    }

    /**
     * オンライン状態変更時の処理
     */
    onOnlineStatusChange(): void {
        this.analyticsTracker.trackShareEvent('online_status_change', {
            isOnline: navigator.onLine
        });
    }

    /**
     * ウィンドウ閉じる前の処理
     */
    onBeforeUnload(event: BeforeUnloadEvent): void {
        // 未完了の共有処理があるかチェック
        const stats = this.analyticsTracker.getPerformanceStats();
        if (stats.shareRequests > stats.successfulShares + stats.failedShares) {
            event.preventDefault();
            event.returnValue = '';
        }
    }

    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats(): any {
        return this.analyticsTracker.getPerformanceStats();
    }

    /**
     * 設定の更新
     */
    updateSettings(newSettings: Partial<SocialSharingSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    /**
     * 機能の有効/無効切り替え
     */
    setEnabled(enabled: boolean): void {
        this.settings.enabled = enabled;
        this.saveSettings();
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo(): any {
        return {
            settings: this.settings,
            platformCapabilities: this.platformAdapters.getDebugInfo(),
            analytics: this.analyticsTracker.getDebugInfo(),
            dependencies: {
                statisticsManager: !!this.statisticsManager,
                achievementManager: !!this.achievementManager,
                localizationManager: !!this.localizationManager,
                screenshotCapture: !!this.screenshotCapture,
                shareContentGenerator: !!this.shareContentGenerator
            }
        };
    }

    /**
     * システムのクリーンアップ
     */
    cleanup(): void {
        window.removeEventListener('online', this.onOnlineStatusChange);
        window.removeEventListener('offline', this.onOnlineStatusChange);
        window.removeEventListener('beforeunload', this.onBeforeUnload);

        // 分析データの最終保存
        this.analyticsTracker.trackShareEvent('system_cleanup', {});
    }

    /**
     * 分割されたコンポーネントへの直接アクセス用メソッド
     */
    getPlatformAdapters(): SocialPlatformAdapters {
        return this.platformAdapters;
    }

    getAnalyticsTracker(): SocialAnalyticsTracker {
        return this.analyticsTracker;
    }

    getShareContentGenerator(): ShareContentGenerator | null {
        return this.shareContentGenerator;
    }
}