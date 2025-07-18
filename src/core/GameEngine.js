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

/**
 * ゲームエンジンクラス
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        
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
        
        this.setupEventListeners();
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
        this.canvas.addEventListener('click', (event) => {
            this.sceneManager.handleInput(event);
        });
        
        // マウス移動
        this.canvas.addEventListener('mousemove', (event) => {
            this.sceneManager.handleInput(event);
        });
        
        // タッチイベント
        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.sceneManager.handleInput(event);
        });
        
        // タッチ移動
        this.canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.sceneManager.handleInput(event);
        });
        
        // キーボードイベント
        document.addEventListener('keydown', (event) => {
            this.sceneManager.handleInput(event);
        });
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
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // シーンマネージャーに更新を委譲
        this.sceneManager.update(deltaTime);
    }
    
    /**
     * 描画処理
     */
    render() {
        // シーンマネージャーに描画を委譲
        this.sceneManager.render(this.context);
    }
    
    /**
     * コンボ表示
     */
    renderCombo() {
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
        this.context.save();
        
        // ボーナスタイム中の背景効果
        if (this.isBonusTimeActive()) {
            const alpha = 0.1 + 0.1 * Math.sin(Date.now() / 200); // 点滅効果
            this.context.fillStyle = `rgba(255, 105, 180, ${alpha})`;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 時間停止中の背景効果
        if (this.isTimeStopActive()) {
            const alpha = 0.15 + 0.1 * Math.sin(Date.now() / 150); // 点滅効果
            this.context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.context.restore();
    }
    
    /**
     * 特殊効果の表示
     */
    renderSpecialEffects() {
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
        this.screenShakeIntensity = intensity;
        this.screenShakeRemaining = duration;
        this.inputDisabled = true;
        console.log(`画面揺れ発動: 強度${intensity}, 時間${duration}ms`);
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
        
        // クリックで再開
        const restartHandler = () => {
            this.canvas.removeEventListener('click', restartHandler);
            this.start();
        };
        
        this.canvas.addEventListener('click', restartHandler);
    }
}