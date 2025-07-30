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
import { AchievementNotificationSystem } from './AchievementNotificationSystem.js';
import { StatisticsManager } from './StatisticsManager.js';
import { EventStageManager } from './EventStageManager.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { StageSelectScene } from '../scenes/StageSelectScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { ShopScene } from '../scenes/ShopScene.js';
import { UserInfoScene } from '../scenes/UserInfoScene.js';
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
import { EffectProfiler } from '../effects/EffectProfiler.js';
import { EffectOptimizationAdvisor } from '../effects/EffectOptimizationAdvisor.js';
import { EffectPerformanceOptimizer } from '../effects/EffectPerformanceOptimizer.js';
import { EffectErrorHandler } from '../effects/EffectErrorHandler.js';
import { VisualPolishEnhancements } from '../effects/VisualPolishEnhancements.js';
import { AnimationManager } from '../effects/AnimationManager.js';

/**
 * ゲームエンジンクラス - 統合版（パフォーマンス最適化 + 音響・視覚効果）
 */
export class GameEngine {
    constructor(canvas) {
        try {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
            this.isRunning = false;
            this.lastTime = 0;
            
            // Canvas コンテキストの検証
            if (!this.context) {
                throw new Error('Failed to get 2D rendering context');
            }
            
            // ブラウザ互換性チェック
            this.checkBrowserCompatibility();
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
        
        // 新しいシステム（音響・視覚効果）
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
        this._setupSystemIntegration();
        
        // デバッグ・プロファイリングツール（開発環境用）
        this.effectDebugInterface = new EffectDebugInterface(this);
        this.effectProfiler = new EffectProfiler(this);
        this.effectOptimizationAdvisor = new EffectOptimizationAdvisor(this);
        this.effectPerformanceOptimizer = new EffectPerformanceOptimizer(this);
        this.effectErrorHandler = new EffectErrorHandler(this);
        this.visualPolishEnhancements = new VisualPolishEnhancements(this);
        
        // コアシステム
        this.playerData = new PlayerData(this);
        this.itemManager = new ItemManager(this);
        this.scoreManager = new ScoreManager(this);
        this.bubbleManager = new BubbleManager(this);
        this.stageManager = new StageManager(this);
        this.sceneManager = new SceneManager(this);
        
        // 新しいUI改善システム
        this.settingsManager = new SettingsManager(this);
        this.localizationManager = new LocalizationManager();
        this.keyboardShortcutManager = new KeyboardShortcutManager(this);
        
        // 追加コンテンツシステム
        this.achievementManager = new AchievementManager(this);
        this.statisticsManager = new StatisticsManager(this);
        this.eventStageManager = new EventStageManager(this);
        
        // 実績イベント統合システム
        this.achievementEventIntegrator = new AchievementEventIntegrator(this);
        
        // 実績通知システム
        this.achievementNotificationSystem = new AchievementNotificationSystem(this);
        
        // ゲーム状態
        this.timeRemaining = 300000; // 5分
        this.isGameOver = false;
        
        // シーンを初期化
        this.initializeScenes();
        
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
        
        this.setupEventListeners();
        this.initializePerformanceOptimization();
        
        // 言語変更イベントリスナーを設定
        this.setupLanguageChangeListener();
    }
    
    /**
     * 言語変更イベントリスナーを設定
     */
    setupLanguageChangeListener() {
        this.localizationManager.addLanguageChangeListener((newLanguage, oldLanguage) => {
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
            this.settingsManager.set('language', newLanguage);
            
            // 全シーンのUI更新
            this.refreshAllScenes();
            
        } catch (error) {
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
            const currentScene = this.sceneManager.getCurrentScene();
            
            // すべての登録されたシーンの翻訳を更新
            const sceneNames = ['menu', 'stageSelect', 'game', 'shop', 'userInfo'];
            
            for (const sceneName of sceneNames) {
                const scene = this.sceneManager.getScene(sceneName);
                if (scene && typeof scene.updateMenuLabels === 'function') {
                    scene.updateMenuLabels();
                }
                if (scene && typeof scene.refreshLabels === 'function') {
                    scene.refreshLabels();
                }
            }
            
            // 現在のシーンを再描画
            if (currentScene && typeof currentScene.render === 'function') {
                currentScene.render(this.context);
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SCENE_REFRESH_ERROR', {
                operation: 'refreshAllScenes'
            });
        }
    }
    
    /**
     * パフォーマンス最適化を初期化
     */
    initializePerformanceOptimization() {
        // レンダリングコンテキストを最適化
        getPerformanceOptimizer().optimizeRenderingContext(this.context);
        
        // メモリマネージャーでCanvasコンテキストを追跡
        getMemoryManager().trackCanvasContext(this.context);
        
        // 定期的な最適化処理
        setInterval(() => {
            this.performOptimization();
        }, 5000); // 5秒ごと
    }
    
    /**
     * 定期的な最適化処理
     */
    performOptimization() {
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
    initializeScenes() {
        try {
            // シーンを作成
            const mainMenuScene = new MainMenuScene(this);
            const stageSelectScene = new StageSelectScene(this);
            const gameScene = new GameScene(this);
            const shopScene = new ShopScene(this);
            const userInfoScene = new UserInfoScene(this);
            
            // シーンを登録
            this.sceneManager.addScene('menu', mainMenuScene);
            this.sceneManager.addScene('stageSelect', stageSelectScene);
            this.sceneManager.addScene('game', gameScene);
            this.sceneManager.addScene('shop', shopScene);
            this.sceneManager.addScene('userInfo', userInfoScene);
            
            // データを読み込み
            try {
                this.playerData.load();
            } catch (error) {
                getErrorHandler().handleError(error, 'STORAGE_ERROR', { operation: 'load', data: 'playerData' });
                // フォールバック: デフォルトデータで続行
                this.playerData.reset();
            }
            
            try {
                this.itemManager.initialize();
            } catch (error) {
                getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { component: 'itemManager' });
                // フォールバック: アイテムシステムなしで続行
            }
            
            // 新しいシステムの初期化
            try {
                this.achievementManager.load();
                this.statisticsManager.load();
                this.eventStageManager.load();
            } catch (error) {
                getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { component: 'additionalSystems' });
                // フォールバック: 新システムなしで続行
            }
            
            // 初期シーンをメインメニューに設定
            this.sceneManager.switchScene('menu');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'INITIALIZATION_ERROR', { component: 'scenes' });
            throw error;
        }
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // マウスクリック
        const clickHandler = (event) => {
            this.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.canvas, 'click', clickHandler);
        
        // マウス移動
        const mouseMoveHandler = (event) => {
            this.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.canvas, 'mousemove', mouseMoveHandler);
        
        // タッチイベント
        const touchStartHandler = (event) => {
            event.preventDefault();
            this.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.canvas, 'touchstart', touchStartHandler);
        
        // タッチ移動
        const touchMoveHandler = (event) => {
            event.preventDefault();
            this.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.canvas, 'touchmove', touchMoveHandler);
        
        // キーボードイベント
        const keyDownHandler = (event) => {
            this.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(document, 'keydown', keyDownHandler);
    }
    
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
                this.updatePerformanceStats();
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
     * パフォーマンス統計を更新
     */
    updatePerformanceStats() {
        const perfStats = this.performanceMonitor.getStats();
        const optimizerStats = getPerformanceOptimizer().getStats();
        
        this.performanceStats = {
            fps: perfStats.fps,
            renderTime: this.performanceStats.renderTime,
            updateTime: this.performanceStats.updateTime,
            memoryUsage: perfStats.memoryUsage.usedJSHeapSize || 0,
            performanceLevel: optimizerStats.performanceLevel
        };
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // パフォーマンス調整されたデルタタイムを使用
        const adjustedDeltaTime = getPerformanceOptimizer().adjustUpdateFrequency(deltaTime);
        
        // 特殊効果の更新
        this.updateSpecialEffects(adjustedDeltaTime);
        
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
     * 描画処理
     */
    render() {
        // Canvas の状態を確認
        if (!this.context) {
            console.error('Context が存在しません');
            return;
        }
        
        // Canvas をクリア
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // レンダリング最適化開始
        this.renderOptimizer.optimize();
        
        // 画面揺れ効果を適用
        if (this.isScreenShakeActive()) {
            this.applyScreenShake();
        }
        
        // エフェクトマネージャーの前処理エフェクト
        this.effectManager.renderPreEffects(this.context);
        
        // シーンマネージャーに描画を委譲
        this.sceneManager.render(this.context);
        
        // パーティクルエフェクトを描画（既存）
        this.particleManager.render(this.context);
        
        // 拡張パーティクルエフェクトを描画
        this.enhancedParticleManager.render(this.context);
        
        // 季節限定エフェクトを描画
        this.seasonalEffectManager.render(this.context);
        
        // エフェクトマネージャーの後処理エフェクト（既存）
        this.effectManager.renderPostEffects(this.context);
        
        // 拡張エフェクトマネージャーのレンダリング
        this.enhancedEffectManager.render(this.context);
        
        // 実績通知システムの描画（最前面）
        if (this.achievementNotificationSystem) {
            this.achievementNotificationSystem.render();
        }
        
        // レンダリング最適化終了 - 問題のある可能性があるため一時的にコメントアウト
        // this.renderOptimizer.render();
        
        // パフォーマンス情報表示（デバッグモード時）
        if (this.isDebugMode()) {
            this.renderPerformanceInfo();
        }
        
        this.context.restore();
    }
    
    /**
     * 画面揺れ効果を適用
     */
    applyScreenShake() {
        if (!getPerformanceOptimizer().shouldRunEffect('shake')) {
            return; // 低品質モードでは画面揺れをスキップ
        }
        
        const intensity = this.screenShakeIntensity * getPerformanceOptimizer().getEffectQuality();
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        
        this.context.save();
        this.context.translate(shakeX, shakeY);
    }
    
    /**
     * パフォーマンス情報を描画
     */
    renderPerformanceInfo() {
        this.context.save();
        
        this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.context.fillRect(this.canvas.width - 200, 0, 200, 150);
        
        this.context.fillStyle = '#FFFFFF';
        this.context.font = '12px monospace';
        this.context.textAlign = 'left';
        
        const stats = this.performanceStats;
        const y = 15;
        const lineHeight = 15;
        
        this.context.fillText(`FPS: ${stats.fps}`, this.canvas.width - 190, y);
        this.context.fillText(`Render: ${Math.round(stats.renderTime)}ms`, this.canvas.width - 190, y + lineHeight);
        this.context.fillText(`Update: ${Math.round(stats.updateTime)}ms`, this.canvas.width - 190, y + lineHeight * 2);
        this.context.fillText(`Level: ${stats.performanceLevel}`, this.canvas.width - 190, y + lineHeight * 3);
        
        if (stats.memoryUsage) {
            this.context.fillText(`Memory: ${Math.round(stats.memoryUsage / 1024 / 1024)}MB`, this.canvas.width - 190, y + lineHeight * 4);
        }
        
        // プール統計
        const poolStats = getPoolManager().getAllStats();
        let line = 6;
        Object.entries(poolStats).forEach(([name, stat]) => {
            this.context.fillText(`${name}: ${stat.activeCount}/${stat.poolSize}`, this.canvas.width - 190, y + lineHeight * line);
            line++;
        });
        
        this.context.restore();
    }
    
    /**
     * デバッグモードかどうか
     */
    isDebugMode() {
        return localStorage.getItem('debug') === 'true';
    }
    
    /**
     * バブルをプールから取得
     */
    getBubbleFromPool() {
        return getPoolManager().get('bubbles');
    }
    
    /**
     * バブルをプールに返却
     */
    returnBubbleToPool(bubble) {
        getPoolManager().return('bubbles', bubble);
    }
    
    /**
     * パーティクルをプールから取得
     */
    getParticleFromPool() {
        return getPoolManager().get('particles');
    }
    
    /**
     * パーティクルをプールに返却
     */
    returnParticleToPool(particle) {
        getPoolManager().return('particles', particle);
    }
    
    /**
     * フローティングテキストをプールから取得
     */
    getFloatingTextFromPool() {
        return getPoolManager().get('floatingText');
    }
    
    /**
     * フローティングテキストをプールに返却
     */
    returnFloatingTextToPool(text) {
        getPoolManager().return('floatingText', text);
    }
    
    /**
     * レンダリングオブジェクトを追加
     */
    addRenderObject(obj, layer = 'default') {
        this.renderOptimizer.addObject(obj, layer);
    }
    
    /**
     * 爆発エフェクトを作成（統合）
     */
    createExplosion(x, y, bubbleType, bubbleSize, intensity = 1) {
        // パーティクルエフェクト
        this.particleManager.createBubblePopEffect(x, y, bubbleType, bubbleSize);
        
        // 音響エフェクト
        this.audioManager.playPopSound(false, bubbleType);
        
        // 視覚エフェクト
        if (intensity > 0.5) {
            this.effectManager.addScreenFlash(0.1, 100, '#FFFFFF');
        }
    }
    
    /**
     * 拡張バブル破壊エフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} options - 追加オプション
     */
    createEnhancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {}) {
        // 拡張パーティクルエフェクト
        this.enhancedParticleManager.createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options);
        
        // 季節限定エフェクト
        this.seasonalEffectManager.createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize);
        
        // 拡張エフェクトマネージャー
        this.enhancedEffectManager.createEnhancedScreenEffect(x, y, 'bubble_destruction', {
            bubbleType,
            bubbleSize,
            ...options
        });
        
        // 音響エフェクト（既存）
        this.audioManager.playPopSound(false, bubbleType);
    }
    
    /**
     * 拡張コンボエフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     * @param {string} comboType - コンボタイプ
     */
    createEnhancedComboEffect(x, y, comboCount, comboType = 'normal') {
        // 拡張パーティクルエフェクト
        this.enhancedParticleManager.createEnhancedComboEffect(x, y, comboCount, comboType);
        
        // 季節限定コンボエフェクト
        this.seasonalEffectManager.createSeasonalComboEffect(x, y, comboCount);
        
        // 拡張画面エフェクト
        this.enhancedEffectManager.createComboScreenEffect(x, y, comboCount, comboType);
        
        // 音響エフェクト
        this.audioManager.playComboSound(comboCount);
    }
    
    /**
     * 特殊バブルエフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} specialType - 特殊タイプ
     * @param {Object} effectData - エフェクトデータ
     */
    createSpecialBubbleEffect(x, y, specialType, effectData = {}) {
        // 拡張特殊エフェクト
        this.enhancedParticleManager.createSpecialBubbleEffect(x, y, specialType, effectData);
        
        // 特殊画面エフェクト
        this.enhancedEffectManager.createSpecialScreenEffect(x, y, specialType, effectData);
        
        // 音響エフェクト
        this.audioManager.playSpecialSound(specialType);
    }
    
    /**
     * エフェクト品質レベルを設定
     * @param {string} qualityLevel - 品質レベル
     */
    setEffectQuality(qualityLevel) {
        this.effectQualityController.setQualityLevel(qualityLevel);
        console.log(`[GameEngine] エフェクト品質レベル設定: ${qualityLevel}`);
    }
    
    /**
     * 季節テーマを設定
     * @param {string} season - 季節
     */
    setSeasonalTheme(season) {
        this.seasonalEffectManager.setSeason(season);
        console.log(`[GameEngine] 季節テーマ設定: ${season}`);
    }
    
    /**
     * カスタムテーマを適用
     * @param {string} themeId - テーマID
     */
    applyCustomTheme(themeId) {
        const result = this.seasonalEffectManager.applyCustomTheme(themeId);
        if (result) {
            console.log(`[GameEngine] カスタムテーマ適用: ${themeId}`);
        } else {
            console.warn(`[GameEngine] カスタムテーマ適用失敗: ${themeId}`);
        }
        return result;
    }
    
    /**
     * エフェクトパフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */
    getEffectPerformanceStats() {
        return {
            performanceMonitor: this.effectPerformanceMonitor.getPerformanceStats(),
            qualityController: this.effectQualityController.getPerformanceStats(),
            currentTheme: this.seasonalEffectManager.getCurrentTheme()?.name || 'None',
            audioVisualSync: this.audioVisualSynchronizer.getStats(),
            configurationStats: this.effectConfigurationIntegrator.getConfigurationStats()
        };
    }
    
    /**
     * システム統合の設定
     * @private
     */
    _setupSystemIntegration() {
        try {            
            // エフェクト統合システムにシステムを登録
            this.effectConfigurationIntegrator.registerEffectSystems({
                qualityController: this.effectQualityController,
                seasonalManager: this.seasonalEffectManager,
                audioManager: this.audioManager
            });
            
            // オーディオビジュアル同期システムにシステムを登録
            this.audioVisualSynchronizer.registerSystems({
                audioManager: this.audioManager,
                particleManager: this.enhancedParticleManager,
                effectManager: this.enhancedEffectManager,
                seasonalManager: this.seasonalEffectManager
            });
            
            console.log('[GameEngine] システム統合設定完了');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'GameEngine._setupSystemIntegration');
        }
    }
    
    /**
     * 統合エフェクト作成（音響・視覚同期）
     * @param {string} effectType - エフェクトタイプ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} parameters - パラメータ
     */
    createIntegratedEffect(effectType, x, y, parameters = {}) {
        // 統合エフェクトの作成（音響・視覚同期）
        this.audioVisualSynchronizer.createSyncedEffect(effectType, x, y, parameters);
    }
    
    /**
     * エフェクト設定の更新
     * @param {string} key - 設定キー
     * @param {*} value - 新しい値
     */
    updateEffectConfiguration(key, value) {
        this.effectConfigurationIntegrator.updateConfiguration(key, value);
    }
    
    /**
     * エフェクト設定の一括更新
     * @param {Object} settings - 設定オブジェクト
     */
    updateMultipleEffectConfigurations(settings) {
        this.effectConfigurationIntegrator.updateMultipleConfigurations(settings);
    }
    
    /**
     * エフェクト設定のエクスポート
     * @returns {Object} エクスポート用設定データ
     */
    exportEffectSettings() {
        return this.effectConfigurationIntegrator.exportEffectSettings();
    }
    
    /**
     * エフェクト設定のインポート
     * @param {Object} settings - インポート用設定データ
     * @returns {boolean} インポート成功か
     */
    importEffectSettings(settings) {
        return this.effectConfigurationIntegrator.importEffectSettings(settings);
    }
    
    /**
     * ボーナスタイムを開始
     */
    startBonusTime(duration, multiplier = 2) {
        this.bonusTimeRemaining = Math.max(this.bonusTimeRemaining, duration);
        this.scoreMultiplier = multiplier;
        
        // 音響・視覚エフェクト
        this.audioManager.playBonusSound();
        this.effectManager.addScreenFlash(0.2, 300, '#FF69B4');
        this.effectManager.addScreenTint(0.1, duration, '#FF69B4');
        
        console.log(`ボーナスタイム開始: ${duration}ms, 倍率: ${multiplier}x`);
    }
    
    /**
     * 時間停止を開始
     */
    startTimeStop(duration) {
        this.timeStopRemaining = Math.max(this.timeStopRemaining, duration);
        
        // 音響・視覚エフェクト
        this.audioManager.playTimeStopSound();
        this.effectManager.addScreenFlash(0.3, 500, '#FFD700');
        this.effectManager.addScreenTint(0.15, duration, '#FFD700');
        
        console.log(`時間停止開始: ${duration}ms`);
    }
    
    /**
     * 画面揺れを開始
     */
    startScreenShake(duration, intensity = 10) {
        if (!getPerformanceOptimizer().shouldRunEffect('shake')) {
            return; // 低品質モードでは画面揺れをスキップ
        }
        
        this.screenShakeIntensity = intensity * getPerformanceOptimizer().getEffectQuality();
        this.screenShakeRemaining = duration;
        this.inputDisabled = true;
        
        // 音響エフェクト
        this.audioManager.playElectricSound();
        
        // 画面揺れエフェクト
        this.effectManager.addScreenShake(intensity, duration, 'random');
        
        console.log(`画面揺れ開始: 強度${this.screenShakeIntensity}, 時間${duration}ms`);
    }
    
    /**
     * コンボ表示
     */
    renderCombo() {
        if (!performanceOptimizer.shouldRunEffect('ui')) {
            return; // 低品質モードではUIエフェクトをスキップ
        }
        
        const combo = this.scoreManager.getCurrentCombo();
        this.context.save();
        
        this.context.fillStyle = '#FFD700';
        this.context.font = 'bold 24px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        
        this.context.fillText(`${combo} COMBO!`, this.canvas.width / 2, 50);
        
        this.context.restore();
    }
    
    /**
     * ゲームオーバー画面
     */
    renderGameOver() {
        this.context.save();
        
        // 半透明オーバーレイ
        this.context.fillStyle = 'rgba(0,0,0,0.7)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ゲームオーバーテキスト
        this.context.fillStyle = '#FFFFFF';
        this.context.font = 'bold 48px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        
        this.context.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.context.font = 'bold 24px Arial';
        this.context.fillText(`最終スコア: ${this.playerData.currentScore}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.context.font = '18px Arial';
        this.context.fillText('クリックして再開', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.context.restore();
    }
    
    /**
     * 時間表示を更新
     */
    updateTimeDisplay() {
        const timeElement = document.getElementById('time');
        if (timeElement) {
            const minutes = Math.floor(this.timeRemaining / 60000);
            const seconds = Math.floor((this.timeRemaining % 60000) / 1000);
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * 特殊効果の背景表示
     */
    renderSpecialEffectBackground() {
        if (!performanceOptimizer.shouldRunEffect('background')) {
            return; // 低品質モードでは背景エフェクトをスキップ
        }
        
        this.context.save();
        
        // ボーナスタイム中の背景効果
        if (this.isBonusTimeActive()) {
            const alpha = (0.1 + 0.1 * Math.sin(Date.now() / 200)) * performanceOptimizer.getEffectQuality();
            this.context.fillStyle = `rgba(255, 105, 180, ${alpha})`;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 時間停止中の背景効果
        if (this.isTimeStopActive()) {
            const alpha = (0.15 + 0.1 * Math.sin(Date.now() / 150)) * performanceOptimizer.getEffectQuality();
            this.context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.context.restore();
    }
    
    /**
     * 特殊効果の表示
     */
    renderSpecialEffects() {
        if (!performanceOptimizer.shouldRunEffect('ui')) {
            return; // 低品質モードではUIエフェクトをスキップ
        }
        
        this.context.save();
        
        // ボーナスタイム表示
        if (this.isBonusTimeActive()) {
            this.context.fillStyle = '#FF69B4';
            this.context.font = 'bold 20px Arial';
            this.context.textAlign = 'left';
            this.context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.bonusTimeRemaining / 1000);
            this.context.fillText(`ボーナスタイム: ${remainingSeconds}s`, 10, 10);
            this.context.fillText('スコア2倍!', 10, 35);
        }
        
        // 時間停止表示
        if (this.isTimeStopActive()) {
            this.context.fillStyle = '#FFD700';
            this.context.font = 'bold 20px Arial';
            this.context.textAlign = 'left';
            this.context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.timeStopRemaining / 1000);
            const yOffset = this.isBonusTimeActive() ? 70 : 10;
            this.context.fillText(`時間停止: ${remainingSeconds}s`, 10, yOffset);
        }
        
        // 画面揺れ表示
        if (this.isScreenShakeActive()) {
            this.context.fillStyle = '#FFFF00';
            this.context.font = 'bold 20px Arial';
            this.context.textAlign = 'left';
            this.context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.screenShakeRemaining / 1000);
            let yOffset = 10;
            if (this.isBonusTimeActive()) yOffset += 60;
            if (this.isTimeStopActive()) yOffset += 35;
            
            this.context.fillText(`ビリビリ: ${remainingSeconds}s`, 10, yOffset);
            this.context.fillText('操作不能!', 10, yOffset + 25);
        }
        
        this.context.restore();
    }
    
    /**
     * 特殊効果の更新
     */
    updateSpecialEffects(deltaTime) {
        // 時間停止中は特殊効果の時間を進めない
        if (this.isTimeStopActive()) {
            deltaTime = 0;
        }
        
        // ボーナスタイムの更新
        if (this.bonusTimeRemaining > 0) {
            this.bonusTimeRemaining -= deltaTime;
            
            if (this.bonusTimeRemaining <= 0) {
                this.scoreMultiplier = 1;
                console.log('ボーナスタイム終了');
            }
        }
        
        // 時間停止効果の更新
        if (this.timeStopRemaining > 0) {
            this.timeStopRemaining -= deltaTime;
            
            if (this.timeStopRemaining <= 0) {
                console.log('時間停止効果終了');
            }
        }
        
        // 画面揺れ効果の更新
        if (this.screenShakeRemaining > 0) {
            this.screenShakeRemaining -= deltaTime;
            
            if (this.screenShakeRemaining <= 0) {
                this.screenShakeIntensity = 0;
                this.inputDisabled = false;
                console.log('画面揺れ効果終了');
                
                // 画面揺れ終了時にTransformをリセット
                this.context.restore();
            }
        }
    }
    
    /**
     * ボーナスタイムを発動
     */
    activateBonusTime(duration) {
        this.startBonusTime(duration, 2);
    }
    
    /**
     * 時間停止効果を発動
     */
    activateTimeStop(duration) {
        this.startTimeStop(duration);
    }
    
    /**
     * 現在のスコア倍率を取得
     */
    getScoreMultiplier() {
        return this.scoreMultiplier;
    }
    
    /**
     * ボーナスタイム中かどうか
     */
    isBonusTimeActive() {
        return this.bonusTimeRemaining > 0;
    }
    
    /**
     * 時間停止中かどうか
     */
    isTimeStopActive() {
        return this.timeStopRemaining > 0;
    }
    
    /**
     * 時間停止中かどうか（互換性のためのエイリアス）
     */
    isTimeStopped() {
        return this.isTimeStopActive();
    }
    
    /**
     * 画面揺れ効果を発動
     */
    activateScreenShake(intensity, duration) {
        this.startScreenShake(duration, intensity);
    }
    
    /**
     * 画面揺れ中かどうか
     */
    isScreenShakeActive() {
        return this.screenShakeRemaining > 0;
    }
    
    /**
     * スコア倍率効果を発動
     */
    activateScoreMultiplier(multiplier, duration) {
        this.scoreMultiplier = Math.max(this.scoreMultiplier, multiplier);
        
        // 一定時間後に元に戻す
        setTimeout(() => {
            this.scoreMultiplier = 1;
            console.log('スコア倍率効果終了');
        }, duration);
        
        console.log(`スコア倍率効果開始: ${multiplier}x, ${duration}ms`);
    }
    
    /**
     * 次の泡のスコア倍率効果を発動
     */
    activateNextScoreMultiplier(multiplier, duration) {
        // ScoreManagerに次の泡のスコア倍率を設定
        if (this.scoreManager.setNextBubbleMultiplier) {
            this.scoreManager.setNextBubbleMultiplier(multiplier, duration);
        }
        
        console.log(`次の泡スコア倍率効果開始: ${multiplier}x, ${duration}ms`);
    }
    
    /**
     * ナイトモードを発動
     */
    activateNightMode() {
        // 背景を暗くする効果
        this.effectManager.addScreenTint(0.3, 300000, '#000033');
        console.log('ナイトモード発動');
    }
    
    /**
     * 視界制限効果を発動
     */
    activateReducedVisibility() {
        // 視界を制限する効果
        this.effectManager.addVignette(0.4, 300000);
        console.log('視界制限効果発動');
    }

    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.isGameOver = true;
        
        // 音響エフェクト
        this.audioManager.playGameOverSound();
        
        // クリーンアップ処理
        this.cleanup();
        
        // クリックで再開
        const restartHandler = () => {
            getMemoryManager().removeEventListener(this.canvas, 'click', restartHandler);
            this.start();
        };
        
        getMemoryManager().addEventListener(this.canvas, 'click', restartHandler);
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        // すべてのプールをクリア
        getPoolManager().clearAll();
        
        // レンダリング最適化をクリーンアップ
        this.renderOptimizer.cleanup();
        
        // エフェクトマネージャーをクリア（既存）
        this.effectManager.clearAllEffects();
        
        // パーティクルマネージャーをクリア（既存）
        this.particleManager.clearAllParticles();
        
        // 拡張エフェクトシステムのクリーンアップ
        if (this.enhancedParticleManager) {
            this.enhancedParticleManager.dispose();
        }
        
        if (this.enhancedEffectManager) {
            this.enhancedEffectManager.dispose();
        }
        
        if (this.seasonalEffectManager) {
            this.seasonalEffectManager.dispose();
        }
        
        if (this.effectPerformanceMonitor) {
            this.effectPerformanceMonitor.dispose();
        }
        
        if (this.effectQualityController) {
            this.effectQualityController.dispose();
        }
        
        if (this.effectConfigurationIntegrator) {
            this.effectConfigurationIntegrator.dispose();
        }
        
        if (this.audioVisualSynchronizer) {
            this.audioVisualSynchronizer.dispose();
        }
        
        // メモリ最適化を実行
        getMemoryManager().performCleanup();
        
        console.log('Game cleanup completed (with enhanced effects)');
    }
    
    /**
     * ブラウザ互換性をチェック
     */
    checkBrowserCompatibility() {
        const browserCompatibility = getBrowserCompatibility();
        const report = browserCompatibility.generateCompatibilityReport();
        
        // 重要な機能が利用できない場合は警告
        if (!report.features.canvas) {
            console.error('Canvas API is not supported');
            browserCompatibility.showFallbackUI();
            return false;
        }
        
        if (!report.features.requestAnimationFrame) {
            console.warn('requestAnimationFrame is not supported, using fallback');
        }
        
        if (!report.features.webAudio) {
            console.warn('Web Audio API is not supported, audio will be disabled');
        }
        
        if (!report.features.localStorage) {
            console.warn('LocalStorage is not supported, progress will not be saved');
        }
        
        // デバッグ情報を出力
        if (this.isDebugMode()) {
            browserCompatibility.logDebugInfo();
        }
        
        // 推奨事項と警告を表示
        if (report.recommendations.length > 0) {
            console.warn('Browser compatibility recommendations:', report.recommendations);
        }
        
        if (report.warnings.length > 0) {
            console.warn('Browser compatibility warnings:', report.warnings);
        }
        
        return true;
    }
    
    /**
     * Canvas リサイズ時のコールバック
     */
    onCanvasResize(canvasInfo) {
        console.log('Canvas resized:', canvasInfo);
        
        // レンダリング最適化システムを更新
        this.renderOptimizer.setViewport(0, 0, canvasInfo.actualWidth, canvasInfo.actualHeight);
        
        // パフォーマンス最適化システムに通知
        getPerformanceOptimizer().onCanvasResize(canvasInfo);
        
        // シーンマネージャーに通知
        if (this.sceneManager) {
            this.sceneManager.onCanvasResize?.(canvasInfo);
        }
        
        // UI要素の位置を調整
        this.adjustUIForCanvasSize(canvasInfo);
    }
    
    /**
     * Canvas サイズに応じてUIを調整
     */
    adjustUIForCanvasSize(canvasInfo) {
        // UI要素のスケールを調整
        const uiScale = Math.min(canvasInfo.scale, 1.5); // 最大1.5倍まで
        
        // フォントサイズを調整
        const baseFontSize = 18;
        const adjustedFontSize = Math.max(12, baseFontSize * uiScale);
        
        // UI要素のサイズ情報を保存
        this.uiInfo = {
            scale: uiScale,
            fontSize: adjustedFontSize,
            canvasInfo: canvasInfo
        };
        
        // HTML UI要素も調整
        this.adjustHTMLUI(canvasInfo);
    }
    
    /**
     * HTML UI要素を調整
     */
    adjustHTMLUI(canvasInfo) {
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            // UI要素のスケールを調整
            const scale = Math.min(canvasInfo.scale, 1.2);
            gameUI.style.transform = `scale(${scale})`;
            gameUI.style.transformOrigin = 'top left';
            
            // モバイルデバイスでの調整
            const browserCompatibility = getBrowserCompatibility();
            if (browserCompatibility.deviceInfo.isMobile) {
                gameUI.style.fontSize = `${14 * scale}px`;
                
                // 縦向きの場合は位置を調整
                const orientation = browserCompatibility.getOrientation();
                if (orientation.includes('portrait')) {
                    gameUI.style.top = '5px';
                    gameUI.style.left = '5px';
                } else {
                    gameUI.style.top = '10px';
                    gameUI.style.left = '10px';
                }
            }
        }
    }
    
    /**
     * デバイス固有の最適化を取得
     */
    getDeviceOptimizations() {
        const browserCompatibility = getBrowserCompatibility();
        const deviceInfo = browserCompatibility.deviceInfo;
        const browserInfo = browserCompatibility.browserInfo;
        
        return {
            // タッチデバイス用の調整
            touchOptimizations: deviceInfo.isTouchDevice ? {
                largerHitboxes: true,
                reducedParticles: deviceInfo.isMobile,
                simplifiedEffects: deviceInfo.isMobile
            } : null,
            
            // ブラウザ固有の調整
            browserOptimizations: {
                safari: browserInfo.name === 'safari' ? {
                    disableImageSmoothing: deviceInfo.isMobile,
                    reduceAnimationFrameRate: deviceInfo.isMobile
                } : null,
                
                firefox: browserInfo.name === 'firefox' ? {
                    enableHardwareAcceleration: true
                } : null,
                
                chrome: browserInfo.name === 'chrome' ? {
                    enableOffscreenCanvas: browserCompatibility.features.offscreenCanvas
                } : null
            },
            
            // パフォーマンス調整
            performanceOptimizations: {
                lowEndDevice: deviceInfo.screenInfo.pixelRatio < 1.5,
                highEndDevice: deviceInfo.screenInfo.pixelRatio > 2,
                limitParticles: deviceInfo.isMobile,
                reduceEffects: deviceInfo.isMobile && deviceInfo.screenInfo.width < 400
            }
        };
    }
    
    /**
     * レスポンシブCanvas情報を取得
     */
    getCanvasInfo() {
        return this.responsiveCanvasManager?.getCanvasInfo() || {
            displayWidth: this.canvas.width,
            displayHeight: this.canvas.height,
            actualWidth: this.canvas.width,
            actualHeight: this.canvas.height,
            scale: 1,
            pixelRatio: 1
        };
    }
    
    /**
     * フルスクリーンモードを切り替え
     */
    toggleFullscreen() {
        if (this.responsiveCanvasManager) {
            this.responsiveCanvasManager.toggleFullscreen();
        }
    }
    
    /**
     * ゲームエンジンを破棄
     */
    destroy() {
        this.stop();
        this.cleanup();
        
        // レスポンシブCanvas管理をクリーンアップ
        if (this.responsiveCanvasManager) {
            this.responsiveCanvasManager.cleanup();
        }
        
        // イベントリスナーを削除
        memoryManager.removeAllEventListeners();
        
        // パフォーマンス最適化システムをリセット
        performanceOptimizer.reset();
        
        // 音響システムを停止
        this.audioManager.stopAll();
    }
}