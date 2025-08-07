/**
 * Game Engine Initializer
 * ゲームエンジンの初期化・設定・SEO統合機能を担当
 */
import { getSEOMonitor } from '../../seo/SEOMonitor.js';
import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getPerformanceOptimizer } from '../../utils/PerformanceOptimizer.js';
import { getMemoryManager } from '../../utils/MemoryManager.js';
import { getPoolManager } from '../../utils/ObjectPool.js';
import { MainMenuScene } from '../../scenes/MainMenuScene.js';
import { StageSelectScene } from '../../scenes/StageSelectScene.js';
import { GameScene } from '../../scenes/GameScene.js';
import { ShopScene } from '../../scenes/ShopScene.js';
import { UserInfoScene } from '../../scenes/UserInfoScene.js';
import { SettingsScene } from '../../scenes/SettingsScene.js';
import { HelpScene } from '../../scenes/HelpScene.js';
import { SocialSharingManager } from '../SocialSharingManager.js';

export class GameEngineInitializer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.seoMonitor = null;
    }
    
    /**
     * SEOシステムとの統合機能を設定
     * @private
     */
    setupSEOIntegration() {
        try {
            // SEOシステムが利用可能な場合のみ統合
            if (window.seoMetaManager && window.structuredDataEngine) {
                // SEO監視システムの初期化
                // Removed: const { getSEOMonitor } = require('../seo/SEOMonitor.js');
                this.seoMonitor = getSEOMonitor();
                
                // SEO監視システムを開始
                this.seoMonitor.startMonitoring({
                    interval: 300000, // 5分間隔
                    includeLighthouse: true,
                    includeCoreWebVitals: true,
                    includeSocialMedia: true,
                    includeSearchConsole: true,
                    enableAlerts: true
                });
                
                // アラートコールバックの設定
                this.seoMonitor.addAlertCallback((alert) => {
                    console.warn(`[SEO Alert] ${alert.severity.toUpperCase()}: ${alert.message}`, alert);
                    
                    // 重要なアラートはゲーム内通知として表示
                    if (alert.severity === 'critical' && this.gameEngine.achievementNotificationSystem) {
                        this.gameEngine.achievementNotificationSystem.showNotification({
                            title: 'SEO Alert',
                            message: alert.message,
                            type: 'warning',
                            duration: 5000
                        });
                    }
                });
                
                // ゲーム状態変更時のSEO更新
                this.gameEngine.on('gameStateChanged', async (gameState) => {
                    await this.updateSEOMetadata(gameState);
                });
                
                // プレイヤー実績達成時のSEO更新
                this.gameEngine.on('achievementUnlocked', async (achievement) => {
                    await this.updateSEOForAchievement(achievement);
                });
                
                // ハイスコア更新時のSEO更新
                this.gameEngine.on('highScoreUpdated', async (score) => {
                    await this.updateSEOForHighScore(score);
                });
                
                // グローバルにアクセス可能にする
                window.seoMonitor = this.seoMonitor;
                
                console.log('[GameEngine] SEO system integration with monitoring initialized');
            }
        } catch (error) {
            console.error('[GameEngine] Failed to setup SEO integration:', error);
        }
    }
    
    /**
     * ゲーム状態に基づいてSEOメタデータを更新
     * @param {Object} gameState - 現在のゲーム状態
     * @private
     */
    async updateSEOMetadata(gameState) {
        try {
            if (!window.seoMetaManager) return;
            
            // 動的コンテンツ生成
            const dynamicContent = {
                gameState: gameState.scene || 'menu',
                playingTime: gameState.playTime || 0,
                currentScore: gameState.score || 0,
                level: gameState.level || 1,
                bubblesPopped: gameState.bubblesPopped || 0
            };
            
            // メタタグ更新
            await window.seoMetaManager.updateDynamicContent(dynamicContent);
            
            // 構造化データ更新
            if (window.structuredDataEngine) {
                await window.structuredDataEngine.updateGameplayData(dynamicContent);
            }
            
        } catch (error) {
            console.error('[GameEngine] Failed to update SEO metadata:', error);
        }
    }
    
    /**
     * 実績解除時のSEO更新
     * @param {Object} achievement - 解除された実績
     * @private
     */
    async updateSEOForAchievement(achievement) {
        try {
            if (!window.seoMetaManager) return;
            
            // 実績共有用のメタデータ生成
            const achievementContent = {
                type: 'achievement',
                title: `実績解除: ${achievement.name}`,
                description: `BubblePopで「${achievement.name}」を達成しました！`,
                imageUrl: achievement.shareImage || '/assets/images/achievement-share.png'
            };
            
            // ソーシャルメディア用メタタグ更新
            await window.seoMetaManager.updateForSharing(achievementContent);
            
        } catch (error) {
            console.error('[GameEngine] Failed to update SEO for achievement:', error);
        }
    }
    
    /**
     * ハイスコア更新時のSEO更新
     * @param {number} score - 新しいハイスコア
     * @private
     */
    async updateSEOForHighScore(score) {
        try {
            if (!window.seoMetaManager) return;
            
            // ハイスコア共有用のメタデータ生成
            const highScoreContent = {
                type: 'highscore',
                title: `新記録達成: ${score.toLocaleString()}点`,
                description: `BubblePopで${score.toLocaleString()}点の新記録を達成！`,
                imageUrl: `/assets/images/score-share.png?score=${score}`
            };
            
            // ソーシャルメディア用メタタグ更新
            await window.seoMetaManager.updateForSharing(highScoreContent);
            
        } catch (error) {
            console.error('[GameEngine] Failed to update SEO for high score:', error);
        }
    }
    
    /**
     * ソーシャルメディア共有機能のトリガー
     * @param {string} platform - 共有プラットフォーム
     * @param {Object} customGameState - カスタムゲーム状態（オプション）
     */
    async triggerSocialShare(platform, customGameState = null) {
        try {
            if (!window.socialMediaOptimizer) {
                console.warn('[GameEngine] SocialMediaOptimizer not available');
                return;
            }

            // 現在のゲーム状態を取得
            const currentGameState = customGameState || this._getCurrentGameState();
            
            // プラットフォーム別の共有コンテンツを生成
            const shareContent = window.socialMediaOptimizer.generateShareContent(platform, currentGameState);
            
            // ソーシャル共有URLを生成
            const shareUrl = this._generatePlatformShareUrl(platform, shareContent);
            
            // 新しいウィンドウでソーシャル共有を開く
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
            }
            
            // 共有イベントを発火
            this.gameEngine.emit('socialShareTriggered', { platform, gameState: currentGameState, shareContent });
            
        } catch (error) {
            console.error('[GameEngine] Failed to trigger social share:', error);
        }
    }

    /**
     * 現在のゲーム状態を取得
     * @returns {Object} ゲーム状態オブジェクト
     */
    _getCurrentGameState() {
        const scene = this.gameEngine.sceneManager?.getCurrentScene();
        
        return {
            scene: scene?.constructor.name || 'Unknown',
            score: this.gameEngine.scoreManager?.getScore() || 0,
            level: this.gameEngine.currentLevel || 1,
            bubblesPopped: this.gameEngine.totalBubblesPopped || 0,
            playTime: this.gameEngine.gameTime || 0,
            achievements: this.gameEngine.achievementManager?.getUnlockedAchievements() || [],
            timestamp: Date.now()
        };
    }

    /**
     * プラットフォーム別のソーシャル共有URLを生成
     * @param {string} platform - プラットフォーム名
     * @param {Object} shareContent - 共有コンテンツ
     * @returns {string|null} 共有URL
     */
    _generatePlatformShareUrl(platform, shareContent) {
        const encodedUrl = encodeURIComponent(shareContent.url || window.location.href);
        const encodedTitle = encodeURIComponent(shareContent.title || 'BubblePop');
        const encodedText = encodeURIComponent(shareContent.text || shareContent.description || '');
        
        switch (platform.toLowerCase()) {
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&title=${encodedTitle}&description=${encodeURIComponent(shareContent.description || '')}`;
            
            case 'line':
                return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;
            
            case 'reddit':
                return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
            
            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            
            default:
                console.warn(`[GameEngine] Unsupported share platform: ${platform}`);
                return null;
        }
    }
    
    /**
     * 言語変更イベントリスナーを設定
     */
    setupLanguageChangeListener() {
        this.gameEngine.localizationManager.addLanguageChangeListener((newLanguage, oldLanguage) => {
            this.onLanguageChanged(newLanguage, oldLanguage);
        });
    }
    
    /**
     * 言語変更時の処理
     */
    onLanguageChanged(newLanguage, oldLanguage) {
        try {
            console.log(`Language changed from ${oldLanguage} to ${newLanguage}`);
            
            // HTMLのlang属性を更新
            document.documentElement.lang = newLanguage;
            
            // 設定を永続化
            this.gameEngine.settingsManager.set('language', newLanguage);
            
            // 全シーンのUI更新
            this.refreshAllScenes();
            
        } catch (error) {
            // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
            getErrorHandler().handleError(error, 'LANGUAGE_CHANGE_ERROR', {
                newLanguage: newLanguage,
                oldLanguage: oldLanguage
            });
        }
    }
    
    /**
     * 全シーンのUI更新
     */
    refreshAllScenes() {
        try {
            // 現在のシーンを取得
            const currentScene = this.gameEngine.sceneManager.getCurrentScene();
            
            // すべての登録されたシーンの翻訳を更新
            const sceneNames = ['menu', 'stageSelect', 'game', 'shop', 'userInfo', 'help'];
            
            for (const sceneName of sceneNames) {
                const scene = this.gameEngine.sceneManager.getScene(sceneName);
                if (scene && typeof scene.updateMenuLabels === 'function') {
                    scene.updateMenuLabels();
                }
                if (scene && typeof scene.refreshLabels === 'function') {
                    scene.refreshLabels();
                }
            }
            
            // 現在のシーンを再描画
            if (currentScene && typeof currentScene.render === 'function') {
                currentScene.render(this.gameEngine.context);
            }
            
        } catch (error) {
            // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
            getErrorHandler().handleError(error, 'SCENE_REFRESH_ERROR', {
                operation: 'refreshAllScenes'
            });
        }
    }
    
    /**
     * パフォーマンス最適化を初期化
     */
    initializePerformanceOptimization() {
        // Removed: const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        // Removed: const { getMemoryManager } = require('../utils/MemoryManager.js');
        
        // レンダリングコンテキストを最適化
        getPerformanceOptimizer().optimizeRenderingContext(this.gameEngine.context);
        
        // メモリマネージャーでCanvasコンテキストを追跡
        getMemoryManager().trackCanvasContext(this.gameEngine.context);
        
        // 定期的な最適化処理
        setInterval(() => {
            this.performOptimization();
        }, 5000); // 5秒ごと
    }
    
    /**
     * 定期的な最適化処理
     */
    performOptimization() {
        // Removed: const { getPoolManager } = require('../utils/ObjectPool.js');
        // Removed: const { getMemoryManager } = require('../utils/MemoryManager.js');
        // Removed: const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        
        // オブジェクトプールの最適化
        getPoolManager().optimize();
        
        // メモリ使用量チェック
        const memoryStats = getMemoryManager().getStats();
        const performanceStats = getPerformanceOptimizer().getStats();
        
        console.log('Performance Stats:', {
            fps: Math.round(performanceStats.averageFPS),
            level: performanceStats.performanceLevel,
            memory: memoryStats.memoryUsage,
            pools: getPoolManager().getAllStats()
        });
        
        // 警告チェック
        const warnings = [
            ...getPerformanceOptimizer().getWarnings(),
            ...getMemoryManager().getStats().detectedIssues
        ];
        
        if (warnings.length > 0) {
            console.warn('Performance warnings:', warnings);
        }
    }
    
    /**
     * シーンを初期化
     */
    async initializeScenes() {
        try {
            // Removed: const { MainMenuScene } = require('../scenes/MainMenuScene.js');
            // Removed: const { StageSelectScene } = require('../scenes/StageSelectScene.js');
            // Removed: const { GameScene } = require('../scenes/GameScene.js');
            // Removed: const { ShopScene } = require('../scenes/ShopScene.js');
            // Removed: const { UserInfoScene } = require('../scenes/UserInfoScene.js');
            // Removed: const { SettingsScene } = require('../scenes/SettingsScene.js');
            // Removed: const { HelpScene } = require('../scenes/HelpScene.js');
            
            // シーンを作成
            const mainMenuScene = new MainMenuScene(this.gameEngine);
            const stageSelectScene = new StageSelectScene(this.gameEngine);
            const gameScene = new GameScene(this.gameEngine);
            const shopScene = new ShopScene(this.gameEngine);
            const userInfoScene = new UserInfoScene(this.gameEngine);
            const settingsScene = new SettingsScene(this.gameEngine);
            const helpScene = new HelpScene(this.gameEngine);
            
            // シーンを登録
            this.gameEngine.sceneManager.addScene('menu', mainMenuScene);
            this.gameEngine.sceneManager.addScene('stageSelect', stageSelectScene);
            this.gameEngine.sceneManager.addScene('game', gameScene);
            this.gameEngine.sceneManager.addScene('shop', shopScene);
            this.gameEngine.sceneManager.addScene('userInfo', userInfoScene);
            this.gameEngine.sceneManager.addScene('settings', settingsScene);
            this.gameEngine.sceneManager.addScene('help', helpScene);
            
            // データを読み込み
            try {
                this.gameEngine.playerData.load();
            } catch (error) {
                // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
                getErrorHandler().handleError(error, 'STORAGE_ERROR', { operation: 'load', data: 'playerData' });
                // フォールバック: デフォルトデータで続行
                this.gameEngine.playerData.reset();
            }
            
            try {
                this.gameEngine.itemManager.initialize();
            } catch (error) {
                // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
                getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { component: 'itemManager' });
                // フォールバック: アイテムシステムなしで続行
            }
            
            // 新しいシステムの初期化
            try {
                this.gameEngine.achievementManager.load();
                this.gameEngine.statisticsManager.load();
                this.gameEngine.eventStageManager.load();
                
                // ソーシャル機能システムの初期化
                await this.initializeSocialSharingManager();
                
                // リーダーボードシステムの初期化
                await this.gameEngine.leaderboardManager.initialize();
                
                // チャレンジシステムの初期化
                await this.gameEngine.challengeSystem.initialize();
                
                // デイリーチャレンジシステムの初期化
                await this.gameEngine.dailyChallengeManager.initialize();
                
                // ウィークリーチャレンジシステムの初期化
                await this.gameEngine.weeklyChallengeManager.initialize();
            } catch (error) {
                // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
                getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { component: 'additionalSystems' });
                // フォールバック: 新システムなしで続行
            }
            
            // 初期シーンをメインメニューに設定
            this.gameEngine.sceneManager.switchScene('menu');
            
        } catch (error) {
            // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
            getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { component: 'scenes' });
            throw error;
        }
    }
    
    /**
     * ソーシャル機能システムの初期化
     */
    async initializeSocialSharingManager() {
        try {
            if (!this.gameEngine.socialSharingManager) {
                // Removed: const { SocialSharingManager } = require('./SocialSharingManager.js');
                this.gameEngine.socialSharingManager = new SocialSharingManager(this.gameEngine);
                await this.gameEngine.socialSharingManager.initialize();
                
                // SEOシステムとの連携
                if (this.gameEngine.seoMetaManager) {
                    this.gameEngine.socialSharingManager.seoMetaManager = this.gameEngine.seoMetaManager;
                }
                
                console.log('[GameEngine] SocialSharingManager初期化完了');
            }
        } catch (error) {
            // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
            getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { 
                component: 'SocialSharingManager' 
            });
            console.warn('[GameEngine] SocialSharingManager初期化に失敗しましたが、ゲームは続行されます');
        }
    }
    
    /**
     * ブラウザ互換性をチェック
     */
    checkBrowserCompatibility() {
        try {
            // 動的インポートではなく、ブラウザ機能を直接チェック
            const canvasSupported = !!window.HTMLCanvasElement;
            const audioContextSupported = !!(window.AudioContext || window.webkitAudioContext);
            const localStorageSupported = !!window.localStorage;
            
            const report = {
                features: {
                    canvas: canvasSupported,
                    audioContext: audioContextSupported,
                    localStorage: localStorageSupported
                }
            };
        
            // 重要な機能が利用できない場合は警告
            if (!report.features.canvas) {
                console.error('Canvas API is not supported');
                return false;
            }
            
            if (!report.features.audioContext) {
                console.warn('Audio Context is not fully supported');
            }
            
            if (!report.features.localStorage) {
                console.warn('LocalStorage is not supported, progress will not be saved');
            }
            
            // デバッグ情報を出力（ブラウザ環境でのみ）
            if (typeof window !== 'undefined' && this.gameEngine.isDebugMode()) {
                console.log('Browser compatibility report:', report);
            }
            
            return true;
            
        } catch (error) {
            console.error('Browser compatibility check failed:', error);
            // フォールバック: 基本的なブラウザ環境では続行
            return typeof window !== 'undefined' && !!window.HTMLCanvasElement;
        }
    }
    
    /**
     * システム統合の設定
     * @private
     */
    _setupSystemIntegration() {
        try {            
            // エフェクト統合システムにシステムを登録
            this.gameEngine.effectConfigurationIntegrator.registerEffectSystems({
                qualityController: this.gameEngine.effectQualityController,
                seasonalManager: this.gameEngine.seasonalEffectManager,
                audioManager: this.gameEngine.audioManager
            });
            
            // オーディオビジュアル同期システムにシステムを登録
            this.gameEngine.audioVisualSynchronizer.registerSystems({
                audioManager: this.gameEngine.audioManager,
                particleManager: this.gameEngine.enhancedParticleManager,
                effectManager: this.gameEngine.enhancedEffectManager,
                seasonalManager: this.gameEngine.seasonalEffectManager
            });
            
            console.log('[GameEngine] システム統合設定完了');
            
        } catch (error) {
            // Removed: const { getErrorHandler } = require('../utils/ErrorHandler.js');
            getErrorHandler().handleError(error, 'GameEngine._setupSystemIntegration');
        }
    }
}