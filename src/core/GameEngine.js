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
import { UserInfoScene } from '../scenes/UserInfoScene.js';
import { AudioManager } from '../audio/AudioManager.js';
import { ParticleManager } from '../effects/ParticleManager.js';
import { EffectManager } from '../effects/EffectManager.js';

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
        
        // 新しいシステム
        this.audioManager = new AudioManager();
        this.particleManager = new ParticleManager();
        this.effectManager = new EffectManager(canvas);
        
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
        
        // オーディオの初期化（ユーザー操作後）
        this.audioInitialized = false;
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
        const userInfoScene = new UserInfoScene(this);
        
        // シーンを登録
        this.sceneManager.addScene('menu', mainMenuScene);
        this.sceneManager.addScene('mainMenu', mainMenuScene); // 互換性のため両方登録
        this.sceneManager.addScene('stageSelect', stageSelectScene);
        this.sceneManager.addScene('game', gameScene);
        this.sceneManager.addScene('shop', shopScene);
        this.sceneManager.addScene('userInfo', userInfoScene);
        
        // データを読み込み
        this.playerData.load();
        this.itemManager.initialize();
        
        // 初期シーンをメインメニューに設定
        this.sceneManager.switchScene('menu');
    }
    
    /**
     * オーディオの初期化（ユーザー操作後）
     */
    async initializeAudio() {
        if (!this.audioInitialized) {
            await this.audioManager.resumeContext();
            this.audioInitialized = true;
            console.log('Audio system initialized');
        }
    }
    
    /**
     * ゲームを開始
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop();
            console.log('Game started');
        }
    }
    
    /**
     * ゲームを停止
     */
    stop() {
        this.isRunning = false;
        this.audioManager.stopAllSounds();
        console.log('Game stopped');
    }
    
    /**
     * ゲームループ
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新
        this.update(deltaTime);
        
        // 描画
        this.render();
        
        // 次のフレームを要求
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 特殊効果の更新
        this.updateSpecialEffects(deltaTime);
        
        // 新しいシステムの更新
        this.particleManager.update(deltaTime);
        this.effectManager.update(deltaTime);
        
        // スコアマネージャーの更新
        this.scoreManager.update(deltaTime);
        
        // シーンの更新
        this.sceneManager.update(deltaTime);
    }
    
    /**
     * 特殊効果の更新
     */
    updateSpecialEffects(deltaTime) {
        // ボーナスタイム
        if (this.bonusTimeRemaining > 0) {
            this.bonusTimeRemaining -= deltaTime;
            if (this.bonusTimeRemaining <= 0) {
                this.bonusTimeRemaining = 0;
                this.scoreMultiplier = 1;
                console.log('Bonus time ended');
            }
        }
        
        // 時間停止
        if (this.timeStopRemaining > 0) {
            this.timeStopRemaining -= deltaTime;
            if (this.timeStopRemaining <= 0) {
                this.timeStopRemaining = 0;
                console.log('Time stop ended');
            }
        }
        
        // 画面震動（レガシー - 新しいEffectManagerに移行予定）
        if (this.screenShakeRemaining > 0) {
            this.screenShakeRemaining -= deltaTime;
            if (this.screenShakeRemaining <= 0) {
                this.screenShakeRemaining = 0;
                this.screenShakeIntensity = 0;
                this.inputDisabled = false;
                console.log('Screen shake ended');
            }
        }
    }
    
    /**
     * 描画処理
     */
    render() {
        const context = this.context;
        const canvas = this.canvas;
        
        // 画面をクリア
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // エフェクト変換を適用
        context.save();
        this.effectManager.applyTransform(context);
        
        // レガシー画面震動（移行期間中）
        if (this.screenShakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
            context.translate(shakeX, shakeY);
        }
        
        // シーンの描画
        this.sceneManager.render(context);
        
        // パーティクル効果の描画
        this.particleManager.render(context);
        
        // 変換をリセット
        this.effectManager.resetTransform(context);
        context.restore();
        
        // オーバーレイ効果（フラッシュ、色調等）
        this.effectManager.renderOverlays(context);
        
        // ボーナスタイムエフェクト（レガシー）
        if (this.bonusTimeRemaining > 0) {
            this.renderBonusTimeEffect(context);
        }
        
        // 時間停止エフェクト（レガシー）
        if (this.timeStopRemaining > 0) {
            this.renderTimeStopEffect(context);
        }
    }
    
    /**
     * ボーナスタイムエフェクトを描画（レガシー）
     */
    renderBonusTimeEffect(context) {
        const canvas = this.canvas;
        const alpha = 0.1 + 0.1 * Math.sin(Date.now() * 0.01);
        
        context.save();
        context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ボーナス表示
        context.fillStyle = '#FFD700';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('BONUS TIME!', canvas.width / 2, 10);
        
        context.restore();
    }
    
    /**
     * 時間停止エフェクトを描画（レガシー）
     */
    renderTimeStopEffect(context) {
        const canvas = this.canvas;
        
        context.save();
        context.fillStyle = 'rgba(0, 100, 200, 0.1)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 時間停止表示
        context.fillStyle = '#00AAFF';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('TIME STOP', canvas.width / 2, 40);
        
        context.restore();
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (event) => {
            if (!this.inputDisabled) {
                this.initializeAudio(); // 初回ユーザー操作でオーディオ初期化
                this.sceneManager.handleInput(event);
            }
        });
        
        // マウスイベント
        this.canvas.addEventListener('click', (event) => {
            if (!this.inputDisabled) {
                this.initializeAudio(); // 初回ユーザー操作でオーディオ初期化
                this.sceneManager.handleInput(event);
            }
        });
        
        this.canvas.addEventListener('mousedown', (event) => {
            if (!this.inputDisabled) {
                this.sceneManager.handleInput(event);
            }
        });
        
        this.canvas.addEventListener('mousemove', (event) => {
            if (!this.inputDisabled) {
                this.sceneManager.handleInput(event);
            }
        });
        
        this.canvas.addEventListener('mouseup', (event) => {
            if (!this.inputDisabled) {
                this.sceneManager.handleInput(event);
            }
        });
        
        // タッチイベント
        this.canvas.addEventListener('touchstart', (event) => {
            if (!this.inputDisabled) {
                event.preventDefault();
                this.initializeAudio(); // 初回ユーザー操作でオーディオ初期化
                this.sceneManager.handleInput(event);
            }
        });
        
        this.canvas.addEventListener('touchmove', (event) => {
            if (!this.inputDisabled) {
                event.preventDefault();
                this.sceneManager.handleInput(event);
            }
        });
        
        this.canvas.addEventListener('touchend', (event) => {
            if (!this.inputDisabled) {
                event.preventDefault();
                this.sceneManager.handleInput(event);
            }
        });
        
        // ページ離脱時にオーディオを停止
        window.addEventListener('beforeunload', () => {
            this.audioManager.dispose();
        });
    }
    
    /**
     * ボーナスタイムを開始（新しいエフェクト付き）
     */
    startBonusTime(duration = 10000, multiplier = 2) {
        this.bonusTimeRemaining = duration;
        this.scoreMultiplier = multiplier;
        
        // 音響効果
        this.audioManager.playSound('bonus', { volume: 0.8 });
        
        // 視覚効果
        this.effectManager.addBonusTimeEffect(duration);
        
        console.log(`Bonus time started: ${duration}ms, multiplier: ${multiplier}`);
    }
    
    /**
     * 時間停止を開始（新しいエフェクト付き）
     */
    startTimeStop(duration = 3000) {
        this.timeStopRemaining = duration;
        
        // 音響効果
        this.audioManager.playSound('time_stop', { volume: 0.7 });
        
        // 視覚効果
        this.effectManager.addTimeStopEffect(duration);
        
        console.log(`Time stop started: ${duration}ms`);
    }
    
    /**
     * 画面震動を開始（新しいエフェクト付き）
     */
    startScreenShake(duration = 2000, intensity = 10) {
        // レガシーシステム
        this.screenShakeRemaining = duration;
        this.screenShakeIntensity = intensity;
        this.inputDisabled = true;
        
        // 新しいエフェクトシステム
        this.effectManager.addScreenShake(intensity, duration, 'random');
        
        // 音響効果
        this.audioManager.playSound('electric', { volume: 0.6 });
        
        console.log(`Screen shake started: ${duration}ms, intensity: ${intensity}`);
    }
    
    /**
     * 爆発エフェクト
     */
    createExplosion(x, y, bubbleType, bubbleSize, intensity = 1) {
        // パーティクル効果
        this.particleManager.createBubblePopEffect(x, y, bubbleType, bubbleSize);
        
        // 音響効果
        const soundName = bubbleType === 'boss' ? 'chain' : 
                         bubbleType === 'spiky' ? 'chain' : 
                         bubbleType === 'electric' ? 'electric' : 'pop';
        
        this.audioManager.playSound(soundName, { 
            volume: 0.4 + intensity * 0.3,
            pitch: 0.8 + Math.random() * 0.4
        });
        
        // 視覚効果（大きな爆発の場合）
        if (intensity > 1 || bubbleType === 'boss' || bubbleType === 'spiky') {
            this.effectManager.addExplosionEffect(x, y, intensity);
        }
    }
    
    /**
     * ダメージエフェクト
     */
    createDamageEffect(damage, source = 'unknown') {
        // 音響効果
        this.audioManager.playSound('damage', { volume: 0.5 });
        
        // 視覚効果
        this.effectManager.addDamageEffect();
        
        console.log(`Damage effect: ${damage} from ${source}`);
    }
    
    /**
     * 回復エフェクト
     */
    createHealEffect(heal) {
        // 音響効果
        this.audioManager.playSound('heal', { volume: 0.6 });
        
        // 視覚効果
        this.effectManager.addHealEffect();
        
        console.log(`Heal effect: ${heal}`);
    }
    
    /**
     * コンボエフェクト
     */
    createComboEffect(x, y, comboCount) {
        // パーティクル効果
        this.particleManager.createComboEffect(x, y, comboCount);
        
        // 音響効果
        this.audioManager.playSound('pop_combo', { 
            volume: 0.5,
            pitch: 1 + comboCount * 0.1
        });
    }
    
    /**
     * UI音を再生
     */
    playUISound(soundName, options = {}) {
        this.audioManager.playSound(soundName, options);
    }
    
    /**
     * BGMを開始
     */
    startBGM() {
        this.audioManager.startProceduralBGM();
    }
    
    /**
     * BGMを停止
     */
    stopBGM() {
        this.audioManager.stopBGM();
    }
    
    /**
     * 現在のスコア倍率を取得
     */
    getScoreMultiplier() {
        return this.scoreMultiplier;
    }
    
    /**
     * 時間停止中かどうか
     */
    isTimeStopped() {
        return this.timeStopRemaining > 0;
    }
    
    /**
     * アイテムシステムの参照を取得（後方互換性）
     */
    get itemSystem() {
        return this.itemManager;
    }
    
    /**
     * システム状態を取得
     */
    getSystemStatus() {
        return {
            audio: this.audioManager.getStatus(),
            particles: this.particleManager.getParticleCount(),
            effects: this.effectManager.getActiveEffectCount(),
            isRunning: this.isRunning,
            audioInitialized: this.audioInitialized
        };
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        this.stop();
        this.audioManager.dispose();
        this.particleManager.clear();
        this.effectManager.clearEffects();
    }
}