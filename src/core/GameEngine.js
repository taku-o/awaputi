import { PlayerData } from './PlayerData.js';
import { BubbleManager } from '../managers/BubbleManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { StageManager } from './StageManager.js';
import { SceneManager } from './SceneManager.js';
import { ItemManager } from './ItemSystem.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { StageSelectScene } from '../scenes/StageSelectScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { ShopScene } from '../scenes/ShopScene.js';
import { poolManager } from '../utils/ObjectPool.js';
import { RenderOptimizer, PerformanceMonitor } from '../utils/RenderOptimizer.js';
import { memoryManager } from '../utils/MemoryManager.js';
import { performanceOptimizer } from '../utils/PerformanceOptimizer.js';

/**
 * ゲームエンジンクラス
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        
        // パフォーマンス最適化システム
        this.renderOptimizer = new RenderOptimizer(canvas);
        this.performanceMonitor = new PerformanceMonitor();
        this.renderOptimizer.addLayer('background', 0);
        this.renderOptimizer.addLayer('bubbles', 1);
        this.renderOptimizer.addLayer('effects', 2);
        this.renderOptimizer.addLayer('ui', 3);
        
        // コアシステム
        this.playerData = new PlayerData(this);
        this.itemManager = new ItemManager(this);
        this.scoreManager = new ScoreManager(this);
        this.bubbleManager = new BubbleManager(this);
        this.stageManager = new StageManager(this);
        this.sceneManager = new SceneManager(this);
        
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
    }
    
    /**
     * パフォーマンス最適化を初期化
     */
    initializePerformanceOptimization() {
        // レンダリングコンテキストを最適化
        performanceOptimizer.optimizeRenderingContext(this.context);
        
        // メモリマネージャーでCanvasコンテキストを追跡
        memoryManager.trackCanvasContext(this.context);
        
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
        poolManager.optimize();
        
        // メモリ使用量チェック
        const memoryStats = memoryManager.getStats();
        const performanceStats = performanceOptimizer.getStats();
        
        console.log('Performance Stats:', {
            fps: Math.round(performanceStats.averageFPS),
            level: performanceStats.performanceLevel,
            memory: memoryStats.memoryUsage,
            pools: poolManager.getAllStats()
        });
        
        // 警告チェック
        const warnings = [
            ...performanceOptimizer.getWarnings(),
            ...memoryManager.getStats().detectedIssues
        ];
        
        if (warnings.length > 0) {
            console.warn('Performance warnings:', warnings);
        }
    }
    
    /**
     * シーンを初期化
     */
    initializeScenes() {
        // シーンを作成
        const mainMenuScene = new MainMenuScene(this);
        const stageSelectScene = new StageSelectScene(this);
        const gameScene = new GameScene(this);
        const shopScene = new ShopScene(this);
        
        // シーンを登録
        this.sceneManager.addScene('menu', mainMenuScene);
        this.sceneManager.addScene('stageSelect', stageSelectScene);
        this.sceneManager.addScene('game', gameScene);
        this.sceneManager.addScene('shop', shopScene);
        
        // データを読み込み
        this.playerData.load();
        this.itemManager.initialize();
        
        // 初期シーンをメインメニューに設定
        this.sceneManager.switchScene('menu');
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // マウスクリック
        const clickHandler = (event) => {
            this.sceneManager.handleInput(event);
        };
        memoryManager.addEventListener(this.canvas, 'click', clickHandler);
        
        // マウス移動
        const mouseMoveHandler = (event) => {
            this.sceneManager.handleInput(event);
        };
        memoryManager.addEventListener(this.canvas, 'mousemove', mouseMoveHandler);
        
        // タッチイベント
        const touchStartHandler = (event) => {
            event.preventDefault();
            this.sceneManager.handleInput(event);
        };
        memoryManager.addEventListener(this.canvas, 'touchstart', touchStartHandler);
        
        // タッチ移動
        const touchMoveHandler = (event) => {
            event.preventDefault();
            this.sceneManager.handleInput(event);
        };
        memoryManager.addEventListener(this.canvas, 'touchmove', touchMoveHandler);
        
        // キーボードイベント
        const keyDownHandler = (event) => {
            this.sceneManager.handleInput(event);
        };
        memoryManager.addEventListener(document, 'keydown', keyDownHandler);
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
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // パフォーマンス監視開始
        this.performanceMonitor.startFrame(currentTime);
        performanceOptimizer.startFrame(currentTime);
        
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
    }
    
    /**
     * パフォーマンス統計を更新
     */
    updatePerformanceStats() {
        const perfStats = this.performanceMonitor.getStats();
        const optimizerStats = performanceOptimizer.getStats();
        
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
        const adjustedDeltaTime = performanceOptimizer.adjustUpdateFrequency(deltaTime);
        
        // 特殊効果の更新
        this.updateSpecialEffects(adjustedDeltaTime);
        
        // シーンマネージャーに更新を委譲
        this.sceneManager.update(adjustedDeltaTime);
    }
    
    /**
     * 描画処理
     */
    render() {
        // レンダリング最適化開始
        this.renderOptimizer.optimize();
        
        // 画面揺れ効果を適用
        if (this.isScreenShakeActive()) {
            this.applyScreenShake();
        }
        
        // シーンマネージャーに描画を委譲
        this.sceneManager.render(this.context);
        
        // レンダリング最適化終了
        this.renderOptimizer.render();
        
        // パフォーマンス情報表示（デバッグモード時）
        if (this.isDebugMode()) {
            this.renderPerformanceInfo();
        }
    }
    
    /**
     * 画面揺れ効果を適用
     */
    applyScreenShake() {
        if (!performanceOptimizer.shouldRunEffect('shake')) {
            return; // 低品質モードでは画面揺れをスキップ
        }
        
        const intensity = this.screenShakeIntensity * performanceOptimizer.getEffectQuality();
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
        const poolStats = poolManager.getAllStats();
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
        return poolManager.get('bubbles');
    }
    
    /**
     * バブルをプールに返却
     */
    returnBubbleToPool(bubble) {
        poolManager.return('bubbles', bubble);
    }
    
    /**
     * パーティクルをプールから取得
     */
    getParticleFromPool() {
        return poolManager.get('particles');
    }
    
    /**
     * パーティクルをプールに返却
     */
    returnParticleToPool(particle) {
        poolManager.return('particles', particle);
    }
    
    /**
     * フローティングテキストをプールから取得
     */
    getFloatingTextFromPool() {
        return poolManager.get('floatingText');
    }
    
    /**
     * フローティングテキストをプールに返却
     */
    returnFloatingTextToPool(text) {
        poolManager.return('floatingText', text);
    }
    
    /**
     * レンダリングオブジェクトを追加
     */
    addRenderObject(obj, layer = 'default') {
        this.renderOptimizer.addObject(obj, layer);
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
            this.scoreMultiplier = 2; // ボーナスタイム中はスコア2倍
            
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
        this.bonusTimeRemaining = Math.max(this.bonusTimeRemaining, duration);
        console.log(`ボーナスタイム発動: ${duration}ms`);
    }
    
    /**
     * 時間停止効果を発動
     */
    activateTimeStop(duration) {
        this.timeStopRemaining = Math.max(this.timeStopRemaining, duration);
        console.log(`時間停止発動: ${duration}ms`);
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
     * 画面揺れ効果を発動
     */
    activateScreenShake(intensity, duration) {
        if (!performanceOptimizer.shouldRunEffect('shake')) {
            return; // 低品質モードでは画面揺れをスキップ
        }
        
        this.screenShakeIntensity = intensity * performanceOptimizer.getEffectQuality();
        this.screenShakeRemaining = duration;
        this.inputDisabled = true;
        console.log(`画面揺れ発動: 強度${this.screenShakeIntensity}, 時間${duration}ms`);
    }
    
    /**
     * 画面揺れ中かどうか
     */
    isScreenShakeActive() {
        return this.screenShakeRemaining > 0;
    }

    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.isGameOver = true;
        
        // クリーンアップ処理
        this.cleanup();
        
        // クリックで再開
        const restartHandler = () => {
            memoryManager.removeEventListener(this.canvas, 'click', restartHandler);
            this.start();
        };
        
        memoryManager.addEventListener(this.canvas, 'click', restartHandler);
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        // すべてのプールをクリア
        poolManager.clearAll();
        
        // レンダリング最適化をクリーンアップ
        this.renderOptimizer.cleanup();
        
        // メモリ最適化を実行
        memoryManager.performCleanup();
        
        console.log('Game cleanup completed');
    }
    
    /**
     * ゲームエンジンを破棄
     */
    destroy() {
        this.stop();
        this.cleanup();
        
        // イベントリスナーを削除
        memoryManager.removeAllEventListeners();
        
        // パフォーマンス最適化システムをリセット
        performanceOptimizer.reset();
    }
}