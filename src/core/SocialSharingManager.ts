/**
 * ソーシャル機能の統合管理システム
 * スコア共有、実績共有、リーダーボード、チャレンジシステムの中央制御を行う
 * 分割されたコンポーネントを統合管理するメインクラス
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';
import { ShareContentGenerator  } from './ShareContentGenerator.js';
import { socialErrorHandler  } from './SocialErrorHandler.js';
import { SocialPlatformAdapters  } from './SocialPlatformAdapters.js';
import { SocialAnalyticsTracker  } from './SocialAnalyticsTracker.js';

export class SocialSharingManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine,
        this.statisticsManager = null,
        this.achievementManager = null,
        this.localizationManager = null,
        
        // エラーハンドラーの設定
        this.errorHandler = socialErrorHandler,
        
        // 分割されたコンポーネントを初期化
        this.platformAdapters = new SocialPlatformAdapters(),
        this.analyticsTracker = new SocialAnalyticsTracker('}

            defaultPlatform: 'web-share' }))
        // 初期化
        this.init();
    }

    /**
     * システムの初期化
     */
    async init() { try {
            // ShareContentGeneratorの初期化
            this.shareContentGenerator = new ShareContentGenerator(),
            
            // 設定の読み込み
            await this.loadSettings(),
            
            // エラーハンドラーの設定
            this.setupErrorHandler(),
            // イベントリスナーの設定
            this.setupEventListeners()',
            this.analyticsTracker.trackShareEvent('system_init', {),
                platform: this.platformAdapters.detectPlatform(
    webShareSupported: this.platformAdapters.isWebShareSupported(  });

        } catch (error) {
            this.errorHandler.handleError(error, 'SocialSharingManager.init' }'
    }

    /**
     * エラーハンドラーの設定'
     */''
    setupErrorHandler()';
        if(typeof, this.errorHandler.setRetryHandler === 'function) { this.errorHandler.setRetryHandler((errorInfo) => {  }'
                this.handleRetryAction(errorInfo); }
            });
        }
    }

    /**
     * リトライアクションの処理'
     */''
    handleRetryAction(errorInfo) {', ' }

        this.analyticsTracker.trackError('retry_attempt', errorInfo); }
    }

    /**
     * 既存システムとの連携設定
     */
    setupDependencies(dependencies) {
        const {
            statisticsManager,
            achievementManager,
            localizationManager,
            screenshotCapture,
            leaderboardManager }
            challengeSystem }
        } = dependencies;

        this.statisticsManager = statisticsManager;
        this.achievementManager = achievementManager;
        this.localizationManager = localizationManager;
        this.screenshotCapture = screenshotCapture;
        this.leaderboardManager = leaderboardManager;
        this.challengeSystem = challengeSystem;

        // ShareContentGeneratorに依存関係を設定
        if (this.shareContentGenerator) { this.shareContentGenerator.setupDependencies(dependencies) }
    }

    /**
     * 設定の読み込み
     */''
    async loadSettings()';
            const saved = localStorage.getItem('socialSharingSettings);
            if(saved) {
    
}

                this.settings = { ...this.settings, ...JSON.parse(saved),'} catch (error) { }

            this.analyticsTracker.trackError('settings_load_failed', { error: error.message }';
        }
    }

    /**
     * 設定の保存'
     */''
    async saveSettings()';
            localStorage.setItem('socialSharingSettings', JSON.stringify(this.settings);'} catch (error) { }

            this.analyticsTracker.trackError('settings_save_failed', { error: error.message }';
        }
    }

    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners()';
        this.gameEngine.on('gameEnd', (gameData) => { this.handleGameEnd(gameData),' }

        }');
';
        // ハイスコア達成時の処理
        this.gameEngine.on('highScore', (scoreData) => { this.handleHighScore(scoreData) });
';
        // 実績解除時の処理
        if(this.achievementManager) {', ' }

            this.achievementManager.on('achievementUnlocked', (achievement) => {  }

                this.handleAchievementUnlock(achievement);' }'

            }');
        }
';
        // オンライン状態の変化
        window.addEventListener('online', () => this.onOnlineStatusChange());
        window.addEventListener('offline', () => this.onOnlineStatusChange());
        ';
        // ページ離脱時の処理
        window.addEventListener('beforeunload', (event) => this.onBeforeUnload(event);
    }

    /**
     * ゲーム終了時の処理'
     */''
    handleGameEnd(gameData) {

        this.analyticsTracker.trackShareEvent('game_end', {
                score: gameData.score,
    level: gameData.level),
            duration: gameData.duration),
        if (this.settings.autoPrompt && gameData.score > 0) {
     })
            this.showScoreSharePrompt(gameData); }
}

    /**
     * ハイスコア達成時の処理'
     */''
    handleHighScore(scoreData) {

        this.analyticsTracker.trackShareEvent('high_score', {
                score: scoreData.score),
            previousBest: scoreData.previousBest),
        if (this.settings.shareOnHighScore) {
     })
            this.showHighScoreSharePrompt(scoreData); }
}

    /**
     * 実績解除時の処理'
     */''
    handleAchievementUnlock(achievement) {

        this.analyticsTracker.trackShareEvent('achievement_unlock', {
                achievementId: achievement.id),
            achievementType: achievement.type),
        if (this.settings.shareOnAchievement) {
     })
            this.showAchievementSharePrompt(achievement); }
}

    /**
     * スコア共有プロンプトの表示'
     */''
    async showScoreSharePrompt(gameData) { ''
        this.analyticsTracker.trackUserBehavior('sharePromptView', { type: 'score ,
        
        const shareData = await this.shareContentGenerator.generateScoreShareContent(gameData),
        this.showShareDialog(shareData) }

    /**
     * ハイスコア共有プロンプトの表示'
     */''
    async showHighScoreSharePrompt(scoreData) { ''
        this.analyticsTracker.trackUserBehavior('sharePromptView', { type: 'highScore ,
        
        const shareData = await this.shareContentGenerator.generateHighScoreShareContent(scoreData),
        this.showShareDialog(shareData) }

    /**
     * 実績共有プロンプトの表示'
     */''
    async showAchievementSharePrompt(achievement) { ''
        this.analyticsTracker.trackUserBehavior('sharePromptView', { type: 'achievement ,
        
        const shareData = await this.shareContentGenerator.generateAchievementShareContent(achievement),
        this.showShareDialog(shareData) }

    /**
     * 統合共有メソッド（Web API優先、フォールバック対応）
     */'
    async share(shareData, options = { ) {''
        const startTime = Date.now('',
            this.analyticsTracker.trackShareEvent('share_request', {''
                platform: shareData.platform || 'auto',
    hasScreenshot: !!shareData.files),
                startTime,

            // データ検証
            const validation = this.platformAdapters.validateShareData(shareData),
            if(!validation.valid) { }'

                throw new Error(`Share data validation failed: ${validation.errors.join(', '}'`);
            }

            let result;
';
            // プラットフォーム別共有処理
            if(shareData.platform === 'twitter' {', ' }

                result = await this.shareViaTwitter(shareData);' }'

            } else if(shareData.platform === 'facebook) { result = await this.shareViaFacebook(shareData) } else if(this.platformAdapters.isWebShareSupported() { result = await this.platformAdapters.shareViaWebAPI(shareData) }'

            } else { }'

                result = await this.showFallbackShareDialog(shareData); }
            }

            this.analyticsTracker.trackShareEvent('share_success', {
                platform: result.platform || shareData.platform,
    endTime: Date.now(),
                startTime,

            return result }) catch (error) {
            this.analyticsTracker.trackShareEvent('share_failure', {
                platform: shareData.platform),
                error: error.message,
    endTime: Date.now(
                startTime' }'

            }');

            this.analyticsTracker.trackError('share_failed', { platform: shareData.platform)
               , error: error.message),
            throw error }
    }

    /**
     * Twitter向け共有
     */
    async shareViaTwitter(shareData) { if(this.platformAdapters.isWebShareSupported() {
            return await this.platformAdapters.shareViaTwitterWebAPI(shareData), else {  ''
            const url = this.platformAdapters.generateTwitterShareUrl(shareData),' }'

            window.open(url, '_blank', 'width=600,height=400'); }

            return { success: true, platform: 'twitter-url'
            }
    }

    /**
     * Facebook向け共有
     */
    async shareViaFacebook(shareData) { if(this.platformAdapters.isWebShareSupported() {
            return await this.platformAdapters.shareViaFacebookWebAPI(shareData), else {  ''
            const url = this.platformAdapters.generateFacebookShareUrl(shareData),' }'

            window.open(url, '_blank', 'width=600,height=400'); }

            return { success: true, platform: 'facebook-url'
            }
    }

    /**
     * フォールバック共有ダイアログの表示'
     */''
    async showFallbackShareDialog(shareData) { // フォールバック用のダイアログ表示' }'

        return { success: true, platform: 'fallback'
            }

    /**
     * 共有ダイアログの表示'
     */''
    showShareDialog(shareData) {
        // ダイアログ表示のロジック
        this.analyticsTracker.trackUserBehavior('shareDialogShow', { }
            platform: shareData.platform';

    /**
     * オンライン状態変更時の処理'
     */''
    onOnlineStatusChange()';
        this.analyticsTracker.trackShareEvent('online_status_change', {
                isOnline: navigator.onLine 
            })

    /**
     * ウィンドウ閉じる前の処理
     */
    onBeforeUnload(event) {
        // 未完了の共有処理があるかチェック
        const stats = this.analyticsTracker.getPerformanceStats(),
        if (stats.shareRequests > stats.successfulShares + stats.failedShares) {''
            event.preventDefault(' }

            event.returnValue = '; }
}

    /**
     * パフォーマンス統計の取得)
     */)
    getPerformanceStats() { return this.analyticsTracker.getPerformanceStats() }

    /**
     * 設定の更新
     */
    updateSettings(newSettings) {
    
}
        this.settings = { ...this.settings, ...newSettings,
        this.saveSettings() }

    /**
     * 機能の有効/無効切り替え
     */
    setEnabled(enabled) {
        this.settings.enabled = enabled }
        this.saveSettings(); }
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return { settings: this.settings,
            platformCapabilities: this.platformAdapters.getAllPlatformCapabilities(),
            analytics: this.analyticsTracker.getDebugInfo(
    dependencies: {
                statisticsManager: !!this.statisticsManager,
                achievementManager: !!this.achievementManager,
    localizationManager: !!this.localizationManager }
                screenshotCapture: !!this.screenshotCapture };
                shareContentGenerator: !!this.shareContentGenerator 
    }

    /**
     * システムのクリーンアップ'
     */''
    cleanup()';
        window.removeEventListener('online', this.onOnlineStatusChange';
        window.removeEventListener('offline', this.onOnlineStatusChange';
        window.removeEventListener('beforeunload', this.onBeforeUnload';
        ';
        // 分析データの最終保存
        this.analyticsTracker.trackShareEvent('system_cleanup);
    }

    /**
     * 分割されたコンポーネントへの直接アクセス用メソッド
     */
    getPlatformAdapters() { return this.platformAdapters }

    getAnalyticsTracker() { return this.analyticsTracker }

    getShareContentGenerator();