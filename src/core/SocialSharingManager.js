/**
 * ソーシャル機能の統合管理システム
 * スコア共有、実績共有、リーダーボード、チャレンジシステムの中央制御を行う
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ShareContentGenerator } from './ShareContentGenerator.js';

export class SocialSharingManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.statisticsManager = null;
        this.achievementManager = null;
        this.localizationManager = null;
        
        // コンポーネント参照（後で初期化）
        this.shareContentGenerator = null;
        this.screenshotCapture = null;
        this.leaderboardManager = null;
        this.challengeSystem = null;
        
        // 設定
        this.settings = {
            enabled: true,
            autoPrompt: true,
            shareOnHighScore: true,
            shareOnAchievement: true,
            defaultPlatform: 'web-share'
        };
        
        // パフォーマンス監視
        this.performanceStats = {
            shareRequests: 0,
            successfulShares: 0,
            failedShares: 0,
            averageResponseTime: 0
        };
        
        // エラーハンドリング
        this.errorTypes = {
            WEB_SHARE_NOT_SUPPORTED: 'WEB_SHARE_NOT_SUPPORTED',
            SCREENSHOT_FAILED: 'SCREENSHOT_FAILED',
            STORAGE_FULL: 'STORAGE_FULL',
            NETWORK_ERROR: 'NETWORK_ERROR',
            PERMISSION_DENIED: 'PERMISSION_DENIED',
            INVALID_DATA: 'INVALID_DATA'
        };
        
        this.initialize();
    }
    
    /**
     * システムの初期化
     */
    async initialize() {
        try {
            this.log('SocialSharingManager: 初期化開始');
            
            // 既存システムとの連携設定
            await this.setupSystemIntegration();
            
            // 設定の読み込み
            await this.loadSettings();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            this.log('SocialSharingManager: 初期化完了');
            
        } catch (error) {
            this.handleError('INITIALIZATION_FAILED', error, {
                context: 'SocialSharingManager.initialize'
            });
        }
    }
    
    /**
     * 既存システムとの連携設定
     */
    async setupSystemIntegration() {
        if (this.gameEngine) {
            // StatisticsManagerとの連携
            this.statisticsManager = this.gameEngine.statisticsManager;
            
            // AchievementManagerとの連携
            this.achievementManager = this.gameEngine.achievementManager;
            
            // LocalizationManagerとの連携
            this.localizationManager = this.gameEngine.localizationManager;
            
            // ShareContentGeneratorの初期化
            this.shareContentGenerator = new ShareContentGenerator(this.localizationManager);
            
            // GameEngineイベントリスナー設定
            this.gameEngine.on('gameEnd', this.onGameEnd.bind(this));
            this.gameEngine.on('highScore', this.onHighScore.bind(this));
            this.gameEngine.on('achievementUnlocked', this.onAchievementUnlocked.bind(this));
        }
        
        this.log('システム連携設定完了', {
            statisticsManager: !!this.statisticsManager,
            achievementManager: !!this.achievementManager,
            localizationManager: !!this.localizationManager,
            shareContentGenerator: !!this.shareContentGenerator
        });
    }
    
    /**
     * 設定の読み込み
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('socialSharingSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            }
            
            this.log('設定読み込み完了', this.settings);
        } catch (error) {
            this.handleError('SETTINGS_LOAD_FAILED', error, {
                context: 'loadSettings'
            });
        }
    }
    
    /**
     * 設定の保存
     */
    async saveSettings() {
        try {
            localStorage.setItem('socialSharingSettings', JSON.stringify(this.settings));
            this.log('設定保存完了');
        } catch (error) {
            this.handleError('SETTINGS_SAVE_FAILED', error, {
                context: 'saveSettings'
            });
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウの閉じる前イベント（未保存データの確認）
        window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
        
        // オンライン/オフライン状態の監視
        window.addEventListener('online', this.onOnlineStatusChange.bind(this));
        window.addEventListener('offline', this.onOnlineStatusChange.bind(this));
    }
    
    /**
     * ゲーム終了時の処理
     */
    async onGameEnd(gameData) {
        if (!this.settings.enabled || !gameData) return;
        
        try {
            // ハイスコア達成時の自動共有プロンプト
            if (this.settings.shareOnHighScore && gameData.isHighScore) {
                await this.promptShareScore(gameData);
            }
            
            // 統計データの更新
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('gameEnd', {
                    score: gameData.score,
                    wasShared: false // 実際の共有後に更新
                });
            }
            
        } catch (error) {
            this.handleError('GAME_END_PROCESSING_FAILED', error, {
                context: 'onGameEnd',
                gameData
            });
        }
    }
    
    /**
     * ハイスコア達成時の処理
     */
    async onHighScore(scoreData) {
        if (!this.settings.enabled || !this.settings.shareOnHighScore) return;
        
        try {
            await this.promptShareScore(scoreData);
        } catch (error) {
            this.handleError('HIGH_SCORE_SHARE_FAILED', error, {
                context: 'onHighScore',
                scoreData
            });
        }
    }
    
    /**
     * 実績解除時の処理
     */
    async onAchievementUnlocked(achievementData) {
        if (!this.settings.enabled || !this.settings.shareOnAchievement) return;
        
        try {
            await this.promptShareAchievement(achievementData);
        } catch (error) {
            this.handleError('ACHIEVEMENT_SHARE_FAILED', error, {
                context: 'onAchievementUnlocked',
                achievementData
            });
        }
    }
    
    /**
     * スコア共有プロンプトの表示
     */
    async promptShareScore(scoreData) {
        try {
            this.log('スコア共有プロンプト表示', scoreData);
            
            if (!this.shareContentGenerator) {
                throw new Error('ShareContentGeneratorが初期化されていません');
            }
            
            // プラットフォームの検出
            const platform = this.detectPlatform();
            
            // 共有メッセージの生成
            const messageResult = this.shareContentGenerator.generateScoreMessage(
                scoreData, 
                platform,
                { url: this.getShareUrl(scoreData) }
            );
            
            // 共有データの構築
            const shareData = {
                type: 'score',
                content: {
                    score: scoreData.score,
                    stage: scoreData.stage,
                    message: messageResult.message,
                    timestamp: Date.now()
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: messageResult.platform,
                    language: messageResult.language,
                    generationTime: messageResult.metadata.generationTime
                }
            };
            
            // 統計の更新
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('scoreSharePrompted', {
                    score: scoreData.score,
                    platform: messageResult.platform
                });
            }
            
            return shareData;
            
        } catch (error) {
            this.handleError('SCORE_SHARE_PROMPT_FAILED', error, { scoreData });
            
            // フォールバック：基本的な共有データ
            return {
                type: 'score',
                content: {
                    score: scoreData.score,
                    stage: scoreData.stage,
                    message: `BubblePopで${scoreData.score}点を達成！`,
                    timestamp: Date.now()
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: this.detectPlatform(),
                    isFallback: true
                }
            };
        }
    }
    
    /**
     * 実績共有プロンプトの表示
     */
    async promptShareAchievement(achievementData) {
        try {
            this.log('実績共有プロンプト表示', achievementData);
            
            if (!this.shareContentGenerator) {
                throw new Error('ShareContentGeneratorが初期化されていません');
            }
            
            // プラットフォームの検出
            const platform = this.detectPlatform();
            
            // 共有メッセージの生成
            const messageResult = this.shareContentGenerator.generateAchievementMessage(
                achievementData, 
                platform,
                { url: this.getShareUrl(achievementData) }
            );
            
            // 共有データの構築
            const shareData = {
                type: 'achievement',
                content: {
                    achievement: achievementData,
                    message: messageResult.message,
                    timestamp: Date.now()
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: messageResult.platform,
                    language: messageResult.language,
                    isRare: messageResult.metadata.isRare
                }
            };
            
            // 統計の更新
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('achievementSharePrompted', {
                    achievementId: achievementData.id,
                    platform: messageResult.platform,
                    isRare: messageResult.metadata.isRare
                });
            }
            
            return shareData;
            
        } catch (error) {
            this.handleError('ACHIEVEMENT_SHARE_PROMPT_FAILED', error, { achievementData });
            
            // フォールバック：基本的な共有データ
            return {
                type: 'achievement',
                content: {
                    achievement: achievementData,
                    message: `実績「${achievementData.name || '新しい実績'}」を解除しました！`,
                    timestamp: Date.now()
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: this.detectPlatform(),
                    isFallback: true
                }
            };
        }
    }
    
    /**
     * 共有用URLの生成
     */
    getShareUrl(data) {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        
        // データタイプに応じたパラメータ追加
        if (data.score) {
            params.append('score', data.score);
        }
        if (data.stage) {
            params.append('stage', data.stage);
        }
        if (data.id) {
            params.append('achievement', data.id);
        }
        
        // UTMパラメータの追加
        params.append('utm_source', 'social_share');
        params.append('utm_medium', 'social');
        params.append('utm_campaign', 'game_share');
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * プラットフォーム検出
     */
    detectPlatform() {
        if (navigator.share) {
            return 'web-share';
        } else if (navigator.userAgent.includes('Twitter')) {
            return 'twitter';
        } else if (navigator.userAgent.includes('Facebook')) {
            return 'facebook';
        } else {
            return 'generic';
        }
    }
    
    /**
     * オンライン状態変更時の処理
     */
    onOnlineStatusChange() {
        const isOnline = navigator.onLine;
        this.log(`オンライン状態変更: ${isOnline ? 'オンライン' : 'オフライン'}`);
        
        if (isOnline) {
            // オンライン復帰時の処理（保留中の共有リクエストなど）
            this.processPendingShares();
        }
    }
    
    /**
     * 保留中の共有処理
     */
    async processPendingShares() {
        // TODO: オフライン時に蓄積された共有リクエストの処理
        this.log('保留中の共有処理を実行');
    }
    
    /**
     * ウィンドウ閉じる前の処理
     */
    onBeforeUnload(event) {
        // 重要なデータの保存
        this.saveSettings();
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = {}) {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        // パフォーマンス統計の更新
        this.performanceStats.failedShares++;
        
        // ErrorHandlerユーティリティの使用
        if (ErrorHandler) {
            ErrorHandler.handleError(error, 'SocialSharingManager', context);
        }
        
        // ローカルログの記録
        this.log('エラー発生', errorInfo, 'error');
        
        // ユーザーフレンドリーなエラー表示（必要に応じて）
        this.showUserError(type, context);
    }
    
    /**
     * ユーザー向けエラー表示
     */
    showUserError(errorType, context) {
        // TODO: ユーザーフレンドリーなエラーメッセージの表示
        // 現在は基本的なアラートで代替
        switch (errorType) {
            case this.errorTypes.WEB_SHARE_NOT_SUPPORTED:
                console.warn('このブラウザでは共有機能がサポートされていません');
                break;
            case this.errorTypes.SCREENSHOT_FAILED:
                console.warn('スクリーンショットの生成に失敗しました');
                break;
            case this.errorTypes.STORAGE_FULL:
                console.warn('ストレージ容量が不足しています');
                break;
            default:
                console.warn('共有機能で問題が発生しました');
        }
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            successRate: this.performanceStats.shareRequests > 0 
                ? (this.performanceStats.successfulShares / this.performanceStats.shareRequests) * 100 
                : 0
        };
    }
    
    /**
     * 設定の更新
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.log('設定更新完了', this.settings);
    }
    
    /**
     * 機能の有効/無効切り替え
     */
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.saveSettings();
        this.log(`ソーシャル機能: ${enabled ? '有効' : '無効'}`);
    }
    
    /**
     * ログ記録
     */
    log(message, data = null, level = 'info') {
        const logEntry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        
        // コンソール出力
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[SocialSharingManager] ${message}`, data);
        
        // 永続ログの保存（デバッグモード時のみ）
        if (this.gameEngine && this.gameEngine.isDebugMode && this.gameEngine.isDebugMode()) {
            this.savePersistentLog(logEntry);
        }
    }
    
    /**
     * 永続ログの保存
     */
    savePersistentLog(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('socialSharingLogs') || '[]');
            logs.push(logEntry);
            
            // ログサイズの制限（最新の100件まで）
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('socialSharingLogs', JSON.stringify(logs));
        } catch (error) {
            console.warn('ログ保存に失敗:', error);
        }
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            settings: this.settings,
            performanceStats: this.getPerformanceStats(),
            systemIntegration: {
                gameEngine: !!this.gameEngine,
                statisticsManager: !!this.statisticsManager,
                achievementManager: !!this.achievementManager,
                localizationManager: !!this.localizationManager
            },
            platform: this.detectPlatform(),
            onlineStatus: navigator.onLine,
            userAgent: navigator.userAgent
        };
    }
    
    /**
     * システムのクリーンアップ
     */
    cleanup() {
        // イベントリスナーの削除
        window.removeEventListener('beforeunload', this.onBeforeUnload.bind(this));
        window.removeEventListener('online', this.onOnlineStatusChange.bind(this));
        window.removeEventListener('offline', this.onOnlineStatusChange.bind(this));
        
        // GameEngineイベントリスナーの削除
        if (this.gameEngine) {
            this.gameEngine.off('gameEnd', this.onGameEnd.bind(this));
            this.gameEngine.off('highScore', this.onHighScore.bind(this));
            this.gameEngine.off('achievementUnlocked', this.onAchievementUnlocked.bind(this));
        }
        
        // 設定の最終保存
        this.saveSettings();
        
        this.log('SocialSharingManager: クリーンアップ完了');
    }
}