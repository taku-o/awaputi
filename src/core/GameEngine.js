import { PlayerData } from './PlayerData.js';
import { BubbleManager } from '../managers/BubbleManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { StageManager } from './StageManager.js';
import { SceneManager } from './SceneManager.js';
import { ItemManager } from './ItemSystem.js';
import { SettingsManager } from './SettingsManager.js';
import { LocalizationManager } from './LocalizationManager.js';
import { KeyboardShortcutManager } from './KeyboardShortcutManager.js';
import { AchievementManager } from './AchievementManager.js';
import { AchievementEventIntegrator } from './AchievementEventIntegrator.js';
import { AchievementNotificationSystem } from './achievements/AchievementNotificationSystem.js';
import { StatisticsManager } from './StatisticsManager.js';
import { EventStageManager } from './EventStageManager.js';
import { ChallengeSystem } from './ChallengeSystem.js';
import { DailyChallengeManager } from './DailyChallengeManager.js';
import { WeeklyChallengeManager } from './WeeklyChallengeManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ParticleManager } from '../effects/ParticleManager.js';
import { EffectManager } from '../effects/EffectManager.js';
import { EnhancedParticleManager } from '../effects/EnhancedParticleManager.js';
import { EnhancedEffectManager } from '../effects/EnhancedEffectManager.js';
import { getSeasonalEffectManager } from '../effects/SeasonalEffectManager.js';
import { getEffectQualityController } from '../effects/EffectQualityController.js';
import { getEffectPerformanceMonitor } from '../effects/EffectPerformanceMonitor.js';
import { getEffectConfigurationIntegrator } from '../effects/EffectConfigurationIntegrator.js';
import { getAudioVisualSynchronizer } from '../effects/AudioVisualSynchronizer.js';
import { getPoolManager } from '../utils/ObjectPool.js';
import { RenderOptimizer, PerformanceMonitor } from '../utils/RenderOptimizer.js';
import { getMemoryManager } from '../utils/MemoryManager.js';
import { getPerformanceOptimizer } from '../utils/PerformanceOptimizer.js';
import { getBrowserCompatibility } from '../utils/BrowserCompatibility.js';
import { ResponsiveCanvasManager } from '../utils/ResponsiveCanvasManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getConfigurationManager } from './ConfigurationManager.js';
import { getCalculationEngine } from './CalculationEngine.js';
import { EffectDebugInterface } from '../effects/EffectDebugInterface.js';
import { EnhancedDebugInterface } from '../debug/EnhancedDebugInterface.js';
import { EffectProfiler } from '../effects/EffectProfiler.js';
import { EffectOptimizationAdvisor } from '../effects/EffectOptimizationAdvisor.js';
import { EffectPerformanceOptimizer } from '../effects/EffectPerformanceOptimizer.js';
import { EffectErrorHandler } from '../effects/EffectErrorHandler.js';
import { VisualPolishEnhancements } from '../effects/VisualPolishEnhancements.js';
import { AnimationManager } from '../effects/AnimationManager.js';
import { getHelpManager } from './help/HelpManager.js';
import { getSEOMonitor } from '../seo/SEOMonitor.js';
import { SocialSharingManager } from './SocialSharingManager.js';
import { LeaderboardManager } from './LeaderboardManager.js';

// サブコンポーネントのインポート
import { GameEngineInitializer } from './game-engine/GameEngineInitializer.js';
import { GameEngineEventManager } from './game-engine/GameEngineEventManager.js';
import { GameEngineRenderer } from './game-engine/GameEngineRenderer.js';
import { GameEngineUtilities } from './game-engine/GameEngineUtilities.js';

// Top-level console.log removed due to ES Modules caching behavior

/**
 * ゲームエンジンクラス - 統合版（パフォーマンス最適化 + 音響・視覚効果）
 * Main Controller Pattern: サブコンポーネントに処理を委譲し、公開APIを維持
 */
export class GameEngine {
    constructor(canvas) {
        console.log('[DEBUG] GameEngine: コンストラクター開始');
        try {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
            this.isRunning = false;
            this.lastTime = 0;
            console.log('[DEBUG] GameEngine: 基本プロパティ設定完了');
            
            // シンプルなイベントエミッター機能
            this.eventListeners = new Map();
            
            // Canvas コンテキストの検証
            if (!this.context) {
                throw new Error('Failed to get 2D rendering context');
            }
            
            // サブコンポーネントの初期化
            console.log('[DEBUG] GameEngine: サブコンポーネント初期化開始');
            this._initializeSubComponents();
            console.log('[DEBUG] GameEngine: サブコンポーネント初期化完了');
            
            // ブラウザ互換性チェック
            this.initializer.checkBrowserCompatibility();
        } catch (error) {
            getErrorHandler().handleError(error, 'CANVAS_ERROR', { 
                canvasElement: canvas,
                contextType: '2d'
            });
            throw error;
        }
        
        // 設定管理システム
        this.configManager = getConfigurationManager();
        this.calculationEngine = getCalculationEngine();
        
        // レスポンシブCanvas管理
        this.responsiveCanvasManager = new ResponsiveCanvasManager(canvas, this);
        
        // パフォーマンス最適化システム
        this.renderOptimizer = new RenderOptimizer(canvas);
        this.performanceMonitor = new PerformanceMonitor();
        this.renderOptimizer.addLayer('background', 0);
        this.renderOptimizer.addLayer('bubbles', 1);
        this.renderOptimizer.addLayer('effects', 2);
        this.renderOptimizer.addLayer('ui', 3);
        
        // 音響・視覚効果システム
        this.audioManager = new AudioManager();
        
        // 拡張エフェクトシステムの初期化
        this.effectQualityController = getEffectQualityController();
        this.effectPerformanceMonitor = getEffectPerformanceMonitor();
        this.seasonalEffectManager = getSeasonalEffectManager();
        this.effectConfigurationIntegrator = getEffectConfigurationIntegrator();
        this.audioVisualSynchronizer = getAudioVisualSynchronizer();
        
        // 既存システムとの下位互換性を保持
        this.particleManager = new ParticleManager();
        this.effectManager = new EffectManager(canvas);
        
        // 拡張エフェクトマネージャー
        this.enhancedParticleManager = new EnhancedParticleManager();
        this.enhancedEffectManager = new EnhancedEffectManager(canvas);
        this.animationManager = new AnimationManager();
        
        // システム統合の設定
        this.initializer._setupSystemIntegration();
        
        // デバッグ・プロファイリングツール（開発環境用）
        this.effectDebugInterface = new EffectDebugInterface(this);
        
        // 統合デバッグインターフェース（拡張版）
        this.enhancedDebugInterface = new EnhancedDebugInterface(this);
        this.effectProfiler = new EffectProfiler(this);
        this.effectOptimizationAdvisor = new EffectOptimizationAdvisor(this);
        this.effectPerformanceOptimizer = new EffectPerformanceOptimizer(this);
        this.effectErrorHandler = new EffectErrorHandler(this);
        this.visualPolishEnhancements = new VisualPolishEnhancements(this);
        
        // コアシステム
        console.log('[DEBUG] GameEngine: コアシステム初期化開始');
        this.playerData = new PlayerData(this);
        console.log('[DEBUG] GameEngine: PlayerData初期化完了');
        this.itemManager = new ItemManager(this);
        console.log('[DEBUG] GameEngine: ItemManager初期化完了');
        this.scoreManager = new ScoreManager(this);
        console.log('[DEBUG] GameEngine: ScoreManager初期化完了');
        this.bubbleManager = new BubbleManager(this);
        console.log('[DEBUG] GameEngine: BubbleManager初期化完了');
        this.stageManager = new StageManager(this);
        console.log('[DEBUG] GameEngine: StageManager初期化完了');
        this.sceneManager = new SceneManager(this);
        console.log('[DEBUG] GameEngine: SceneManager初期化完了');
        
        // 新しいUI改善システム
        this.settingsManager = new SettingsManager(this);
        this.localizationManager = new LocalizationManager();
        this.keyboardShortcutManager = new KeyboardShortcutManager(this);
        
        // 追加コンテンツシステム
        console.log('[DEBUG] GameEngine: 追加コンテンツシステム初期化開始');
        this.achievementManager = new AchievementManager(this);
        console.log('[DEBUG] GameEngine: AchievementManager初期化完了');
        this.statisticsManager = new StatisticsManager(this);
        console.log('[DEBUG] GameEngine: StatisticsManager初期化完了');
        // EventStageManager初期化（loadメソッド問題対応）
        console.log('[DEBUG] GameEngine: EventStageManager初期化開始');
        this.eventStageManager = new EventStageManager(this);
        
        // loadメソッドが存在しない場合の動的修正
        if (typeof this.eventStageManager.load !== 'function') {
            console.warn('[DEBUG] GameEngine: EventStageManager.loadメソッド不足 - 動的追加中');
            
            // loadメソッドを動的に追加
            this.eventStageManager.load = function() {
                try {
                    console.log('[DEBUG] EventStageManager.load() 動的実行開始');
                    
                    // 各サブコンポーネントのloadメソッドを呼び出し（存在する場合）
                    if (this.seasonalEventManager && typeof this.seasonalEventManager.load === 'function') {
                        this.seasonalEventManager.load();
                    }
                    
                    if (this.historyManager && typeof this.historyManager.load === 'function') {
                        this.historyManager.load();
                    }
                    
                    if (this.rankingSystem && typeof this.rankingSystem.load === 'function') {
                        this.rankingSystem.load();
                    }
                    
                    console.log('[DEBUG] EventStageManager.load() 動的実行完了');
                    return true;
                    
                } catch (error) {
                    console.error('[DEBUG] EventStageManager.load() 動的実行エラー:', error);
                    return false;
                }
            }.bind(this.eventStageManager);
            
            console.log('[DEBUG] GameEngine: EventStageManager.loadメソッド動的追加完了');
        }
        
        console.log('[DEBUG] GameEngine: EventStageManager初期化完了');
        console.log('[DEBUG] GameEngine: EventStageManager.loadメソッド存在:', typeof this.eventStageManager.load === 'function');
        
        // 実績イベント統合システム
        this.achievementEventIntegrator = new AchievementEventIntegrator(this);
        
        // 実績通知システム
        this.achievementNotificationSystem = new AchievementNotificationSystem(this);
        
        // ヘルプシステム
        this.helpManager = getHelpManager(this);
        
        // ソーシャル機能システム（遅延初期化）
        this.socialSharingManager = null;
        
        // リーダーボードシステム
        this.leaderboardManager = new LeaderboardManager(this);
        
        // チャレンジシステム
        this.challengeSystem = new ChallengeSystem(this);
        
        // デイリーチャレンジシステム
        this.dailyChallengeManager = new DailyChallengeManager(this, this.challengeSystem);
        
        // ウィークリーチャレンジシステム
        this.weeklyChallengeManager = new WeeklyChallengeManager(this, this.challengeSystem);
        
        // ゲーム状態
        this.timeRemaining = 300000; // 5分
        this.isGameOver = false;
        
        // シーンを初期化（非同期）
        console.log('[DEBUG] GameEngine: initializeScenes呼び出し開始');
        this.initializer.initializeScenes().then(() => {
            console.log('[DEBUG] GameEngine: initializeScenes完了');
        }).catch(error => {
            console.error('[DEBUG] GameEngine: initializeScenes失敗:', error);
            console.error('[DEBUG] エラースタック:', error.stack);
        });
        
        // 特殊効果状態
        this.bonusTimeRemaining = 0;
        this.timeStopRemaining = 0;
        this.scoreMultiplier = 1;
        this.screenShakeRemaining = 0;
        this.screenShakeIntensity = 0;
        this.inputDisabled = false;
        
        // パフォーマンス統計
        this.frameCount = 0;
        this.performanceStats = {
            fps: 60,
            renderTime: 0,
            updateTime: 0,
            memoryUsage: 0
        };
        
        this.eventManager.setupEventListeners();
        this.initializer.initializePerformanceOptimization();
        
        // 言語変更イベントリスナーを設定
        this.initializer.setupLanguageChangeListener();
        
        // SEOシステム統合の初期化
        this.initializer.setupSEOIntegration();
    }
    
    /**
     * サブコンポーネントを初期化
     * @private
     */
    _initializeSubComponents() {
        try {
            this.initializer = new GameEngineInitializer(this);
            this.eventManager = new GameEngineEventManager(this);
            this.renderer = new GameEngineRenderer(this);
            this.utilities = new GameEngineUtilities(this);
            
            console.log('[GameEngine] サブコンポーネントを初期化しました');
        } catch (error) {
            console.error('Failed to initialize sub-components:', error);
            throw error;
        }
    }
    
    // ========================================
    // 公開API - イベント管理（委譲）
    // ========================================
    
    /**
     * イベントリスナーを追加
     * @param {string} eventName - イベント名
     * @param {Function} listener - リスナー関数
     */
    on(eventName, listener) {
        return this.eventManager.on(eventName, listener);
    }
    
    /**
     * イベントを発火
     * @param {string} eventName - イベント名
     * @param {*} data - イベントデータ
     */
    emit(eventName, data) {
        return this.eventManager.emit(eventName, data);
    }
    
    /**
     * イベントリスナーを削除
     * @param {string} eventName - イベント名
     * @param {Function} listener - リスナー関数
     */
    off(eventName, listener) {
        return this.eventManager.off(eventName, listener);
    }
    
    // ========================================
    // 公開API - 言語・初期化（委譲）
    // ========================================
    
    /**
     * 言語変更時の処理
     */
    onLanguageChanged(newLanguage, oldLanguage) {
        return this.initializer.onLanguageChanged(newLanguage, oldLanguage);
    }
    
    /**
     * 全シーンのUI更新
     */
    refreshAllScenes() {
        return this.initializer.refreshAllScenes();
    }
    
    /**
     * ソーシャルメディア共有機能のトリガー
     * @param {string} platform - 共有プラットフォーム
     * @param {Object} customGameState - カスタムゲーム状態（オプション）
     */
    async triggerSocialShare(platform, customGameState = null) {
        return this.initializer.triggerSocialShare(platform, customGameState);
    }
    
    // ========================================
    // 公開API - 描画・エフェクト（委譲）
    // ========================================
    
    /**
     * レンダリングオブジェクトを追加
     */
    addRenderObject(obj, layer = 'default') {
        return this.renderer.addRenderObject(obj, layer);
    }
    
    /**
     * 爆発エフェクトを作成（統合）
     */
    createExplosion(x, y, bubbleType, bubbleSize, intensity = 1) {
        return this.renderer.createExplosion(x, y, bubbleType, bubbleSize, intensity);
    }
    
    /**
     * 拡張バブル破壊エフェクトを作成
     */
    createEnhancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {}) {
        return this.renderer.createEnhancedBubbleEffect(x, y, bubbleType, bubbleSize, options);
    }
    
    /**
     * 拡張コンボエフェクトを作成
     */
    createEnhancedComboEffect(x, y, comboCount, comboType = 'normal') {
        return this.renderer.createEnhancedComboEffect(x, y, comboCount, comboType);
    }
    
    /**
     * 特殊バブルエフェクトを作成
     */
    createSpecialBubbleEffect(x, y, specialType, effectData = {}) {
        return this.renderer.createSpecialBubbleEffect(x, y, specialType, effectData);
    }
    
    /**
     * バブルをプールから取得
     */
    getBubbleFromPool() {
        return this.renderer.getBubbleFromPool();
    }
    
    /**
     * バブルをプールに返却
     */
    returnBubbleToPool(bubble) {
        return this.renderer.returnBubbleToPool(bubble);
    }
    
    /**
     * パーティクルをプールから取得
     */
    getParticleFromPool() {
        return this.renderer.getParticleFromPool();
    }
    
    /**
     * パーティクルをプールに返却
     */
    returnParticleToPool(particle) {
        return this.renderer.returnParticleToPool(particle);
    }
    
    /**
     * フローティングテキストをプールから取得
     */
    getFloatingTextFromPool() {
        return this.renderer.getFloatingTextFromPool();
    }
    
    /**
     * フローティングテキストをプールに返却
     */
    returnFloatingTextToPool(text) {
        return this.renderer.returnFloatingTextToPool(text);
    }
    
    // ========================================
    // 公開API - 特殊効果・ゲーム状態（委譲）
    // ========================================
    
    /**
     * ボーナスタイムを開始
     */
    startBonusTime(duration, multiplier = 2) {
        return this.eventManager.startBonusTime(duration, multiplier);
    }
    
    /**
     * 時間停止を開始
     */
    startTimeStop(duration) {
        return this.eventManager.startTimeStop(duration);
    }
    
    /**
     * 画面揺れを開始
     */
    startScreenShake(duration, intensity = 10) {
        return this.eventManager.startScreenShake(duration, intensity);
    }
    
    /**
     * ボーナスタイムを発動
     */
    activateBonusTime(duration) {
        return this.eventManager.activateBonusTime(duration);
    }
    
    /**
     * 時間停止効果を発動
     */
    activateTimeStop(duration) {
        return this.eventManager.activateTimeStop(duration);
    }
    
    /**
     * 画面揺れ効果を発動
     */
    activateScreenShake(intensity, duration) {
        return this.eventManager.activateScreenShake(intensity, duration);
    }
    
    /**
     * スコア倍率効果を発動
     */
    activateScoreMultiplier(multiplier, duration) {
        return this.eventManager.activateScoreMultiplier(multiplier, duration);
    }
    
    /**
     * 次の泡のスコア倍率効果を発動
     */
    activateNextScoreMultiplier(multiplier, duration) {
        return this.eventManager.activateNextScoreMultiplier(multiplier, duration);
    }
    
    /**
     * ナイトモードを発動
     */
    activateNightMode() {
        return this.eventManager.activateNightMode();
    }
    
    /**
     * 視界制限効果を発動
     */
    activateReducedVisibility() {
        return this.eventManager.activateReducedVisibility();
    }
    
    /**
     * 現在のスコア倍率を取得
     */
    getScoreMultiplier() {
        return this.eventManager.getScoreMultiplier();
    }
    
    /**
     * ボーナスタイム中かどうか
     */
    isBonusTimeActive() {
        return this.eventManager.isBonusTimeActive();
    }
    
    /**
     * 時間停止中かどうか
     */
    isTimeStopActive() {
        return this.eventManager.isTimeStopActive();
    }
    
    /**
     * 時間停止中かどうか（互換性のためのエイリアス）
     */
    isTimeStopped() {
        return this.eventManager.isTimeStopped();
    }
    
    /**
     * 画面揺れ中かどうか
     */
    isScreenShakeActive() {
        return this.eventManager.isScreenShakeActive();
    }
    
    /**
     * 統合エフェクト作成（音響・視覚同期）
     */
    createIntegratedEffect(effectType, x, y, parameters = {}) {
        return this.eventManager.createIntegratedEffect(effectType, x, y, parameters);
    }
    
    /**
     * エフェクト設定の更新
     */
    updateEffectConfiguration(key, value) {
        return this.eventManager.updateEffectConfiguration(key, value);
    }
    
    /**
     * エフェクト設定の一括更新
     */
    updateMultipleEffectConfigurations(settings) {
        return this.eventManager.updateMultipleEffectConfigurations(settings);
    }
    
    /**
     * エフェクト設定のエクスポート
     */
    exportEffectSettings() {
        return this.eventManager.exportEffectSettings();
    }
    
    /**
     * エフェクト設定のインポート
     */
    importEffectSettings(settings) {
        return this.eventManager.importEffectSettings(settings);
    }
    
    /**
     * エフェクト品質レベルを設定
     */
    setEffectQuality(qualityLevel) {
        return this.eventManager.setEffectQuality(qualityLevel);
    }
    
    /**
     * 季節テーマを設定
     */
    setSeasonalTheme(season) {
        return this.eventManager.setSeasonalTheme(season);
    }
    
    /**
     * カスタムテーマを適用
     */
    applyCustomTheme(themeId) {
        return this.eventManager.applyCustomTheme(themeId);
    }
    
    /**
     * エフェクトパフォーマンス統計を取得
     */
    getEffectPerformanceStats() {
        return this.eventManager.getEffectPerformanceStats();
    }
    
    // ========================================
    // 公開API - ユーティリティ（委譲）
    // ========================================
    
    /**
     * デバッグモードかどうか
     */
    isDebugMode() {
        return this.utilities.isDebugMode();
    }
    
    /**
     * Canvas リサイズ時のコールバック
     */
    onCanvasResize(canvasInfo) {
        return this.utilities.onCanvasResize(canvasInfo);
    }
    
    /**
     * デバイス固有の最適化を取得
     */
    getDeviceOptimizations() {
        return this.utilities.getDeviceOptimizations();
    }
    
    /**
     * レスポンシブCanvas情報を取得
     */
    getCanvasInfo() {
        return this.utilities.getCanvasInfo();
    }
    
    /**
     * フルスクリーンモードを切り替え
     */
    toggleFullscreen() {
        return this.utilities.toggleFullscreen();
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        return this.utilities.cleanup();
    }
    
    /**
     * ゲームエンジンを破棄
     */
    destroy() {
        return this.utilities.destroy();
    }
    
    // ========================================
    // 公開API - ゲームループ制御
    // ========================================
    
    /**
     * ゲームを開始
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    /**
     * ゲームを停止
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * ゲームループ
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        try {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // パフォーマンス監視開始
            this.performanceMonitor.startFrame(currentTime);
            getPerformanceOptimizer().startFrame(currentTime);
            
            const updateStartTime = performance.now();
            this.update(deltaTime);
            this.performanceStats.updateTime = performance.now() - updateStartTime;
            
            const renderStartTime = performance.now();
            this.render();
            this.performanceStats.renderTime = performance.now() - renderStartTime;
            
            this.frameCount++;
            
            // 統計更新
            if (this.frameCount % 60 === 0) {
                this.utilities.updatePerformanceStats();
            }
            
            requestAnimationFrame(() => this.gameLoop());
            
        } catch (error) {
            getErrorHandler().handleError(error, 'GAME_LOOP_ERROR', {
                frameCount: this.frameCount,
                isRunning: this.isRunning,
                deltaTime: this.lastTime ? performance.now() - this.lastTime : 0
            });
            
            // 重要なエラーの場合はゲームを停止
            if (error.name === 'ReferenceError' || error.message.includes('Canvas')) {
                this.stop();
                return;
            }
            
            // 軽微なエラーの場合は続行
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // パフォーマンス調整されたデルタタイムを使用
        const adjustedDeltaTime = getPerformanceOptimizer().adjustUpdateFrequency(deltaTime);
        
        // 特殊効果の更新
        this.eventManager.updateSpecialEffects(adjustedDeltaTime);
        // テスト互換性のため直接メソッドも呼び出し
        this.updateSpecialEffects(deltaTime);
        
        // エフェクトマネージャーの更新（既存）
        this.effectManager.update(adjustedDeltaTime);
        
        // パーティクルマネージャーの更新（既存）
        this.particleManager.update(adjustedDeltaTime);
        
        // 拡張エフェクトシステムの更新
        this.enhancedParticleManager.update(adjustedDeltaTime);
        this.enhancedEffectManager.update(adjustedDeltaTime);
        this.seasonalEffectManager.update(adjustedDeltaTime);
        this.audioVisualSynchronizer.update(adjustedDeltaTime);
        
        // パフォーマンス監視の更新
        this.effectPerformanceMonitor.startFrame();
        
        // 実績イベント統合システムの更新
        if (this.achievementEventIntegrator) {
            this.achievementEventIntegrator.update(adjustedDeltaTime);
        }
        
        // 実績通知システムの更新
        if (this.achievementNotificationSystem) {
            this.achievementNotificationSystem.update(adjustedDeltaTime);
        }
        
        // シーンマネージャーに更新を委譲
        this.sceneManager.update(adjustedDeltaTime);
    }

    /**
     * 特殊効果の更新（テスト互換性のため）
     * Issue #106: テストで期待されるメソッド
     */
    updateSpecialEffects(deltaTime) {
        // 直接特殊効果の状態を更新（テスト用）
        const effectiveDeltaTime = this.isTimeStopActive() ? 0 : deltaTime;
        
        // ボーナスタイムの更新
        if (this.bonusTimeRemaining > 0) {
            this.bonusTimeRemaining -= effectiveDeltaTime;
            if (this.bonusTimeRemaining <= 0) {
                this.bonusTimeRemaining = 0;
                this.scoreMultiplier = 1;
            }
        }
        
        // 時間停止効果の更新
        if (this.timeStopRemaining > 0) {
            this.timeStopRemaining -= deltaTime; // 時間停止自体は常に減算
            if (this.timeStopRemaining <= 0) {
                this.timeStopRemaining = 0;
            }
        }
        
        // 画面揺れ効果の更新
        if (this.screenShakeRemaining > 0) {
            this.screenShakeRemaining -= effectiveDeltaTime;
            if (this.screenShakeRemaining <= 0) {
                this.screenShakeRemaining = 0;
                this.screenShakeIntensity = 0;
                this.inputDisabled = false;
            }
        }
        
        // eventManagerの処理も実行
        if (this.eventManager && typeof this.eventManager.updateSpecialEffects === 'function') {
            this.eventManager.updateSpecialEffects(deltaTime);
        }
    }
    
    /**
     * 描画処理
     */
    render() {
        return this.renderer.render();
    }
    
    /**
     * ゲームオーバー処理
     */
    gameOver() {
        return this.eventManager.gameOver();
    }
    
    /**
     * パフォーマンス最適化処理（Issue #106: テスト用）
     */
    performOptimization() {
        try {
            // パフォーマンス最適化システムに最適化実行を指示
            getPerformanceOptimizer().performOptimization();
            
            // エフェクト品質の調整
            if (this.effectQualityController) {
                this.effectQualityController.optimizeQualityLevel();
            }
            
            // メモリクリーンアップ
            getMemoryManager().performIntelligentCleanup();
            
            console.log('[GameEngine] Performance optimization completed');
        } catch (error) {
            console.error('[GameEngine] Error during performance optimization:', error);
        }
    }
}