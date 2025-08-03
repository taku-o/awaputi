/**
 * Game Engine Event Manager
 * イベント管理・入力処理・統合機能を担当
 */
export class GameEngineEventManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * イベントリスナーを追加
     * @param {string} eventName - イベント名
     * @param {Function} listener - リスナー関数
     */
    on(eventName, listener) {
        if (!this.gameEngine.eventListeners.has(eventName)) {
            this.gameEngine.eventListeners.set(eventName, []);
        }
        this.gameEngine.eventListeners.get(eventName).push(listener);
    }
    
    /**
     * イベントを発火
     * @param {string} eventName - イベント名
     * @param {*} data - イベントデータ
     */
    emit(eventName, data) {
        const listeners = this.gameEngine.eventListeners.get(eventName);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`[GameEngine] Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }
    
    /**
     * イベントリスナーを削除
     * @param {string} eventName - イベント名
     * @param {Function} listener - リスナー関数
     */
    off(eventName, listener) {
        const listeners = this.gameEngine.eventListeners.get(eventName);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        const { getMemoryManager } = require('../utils/MemoryManager.js');
        
        // マウスクリック
        const clickHandler = (event) => {
            this.gameEngine.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.gameEngine.canvas, 'click', clickHandler);
        
        // マウス移動
        const mouseMoveHandler = (event) => {
            this.gameEngine.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.gameEngine.canvas, 'mousemove', mouseMoveHandler);
        
        // タッチイベント
        const touchStartHandler = (event) => {
            event.preventDefault();
            this.gameEngine.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.gameEngine.canvas, 'touchstart', touchStartHandler);
        
        // タッチ移動
        const touchMoveHandler = (event) => {
            event.preventDefault();
            this.gameEngine.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(this.gameEngine.canvas, 'touchmove', touchMoveHandler);
        
        // キーボードイベント
        const keyDownHandler = (event) => {
            this.gameEngine.sceneManager.handleInput(event);
        };
        getMemoryManager().addEventListener(document, 'keydown', keyDownHandler);
    }
    
    /**
     * ボーナスタイムを開始
     */
    startBonusTime(duration, multiplier = 2) {
        this.gameEngine.bonusTimeRemaining = Math.max(this.gameEngine.bonusTimeRemaining, duration);
        this.gameEngine.scoreMultiplier = multiplier;
        
        // 音響・視覚エフェクト
        this.gameEngine.audioManager.playBonusSound();
        this.gameEngine.effectManager.addScreenFlash(0.2, 300, '#FF69B4');
        this.gameEngine.effectManager.addScreenTint(0.1, duration, '#FF69B4');
        
        console.log(`ボーナスタイム開始: ${duration}ms, 倍率: ${multiplier}x`);
    }
    
    /**
     * 時間停止を開始
     */
    startTimeStop(duration) {
        this.gameEngine.timeStopRemaining = Math.max(this.gameEngine.timeStopRemaining, duration);
        
        // 音響・視覚エフェクト
        this.gameEngine.audioManager.playTimeStopSound();
        this.gameEngine.effectManager.addScreenFlash(0.3, 500, '#FFD700');
        this.gameEngine.effectManager.addScreenTint(0.15, duration, '#FFD700');
        
        console.log(`時間停止開始: ${duration}ms`);
    }
    
    /**
     * 画面揺れを開始
     */
    startScreenShake(duration, intensity = 10) {
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        
        if (!getPerformanceOptimizer().shouldRunEffect('shake')) {
            return; // 低品質モードでは画面揺れをスキップ
        }
        
        this.gameEngine.screenShakeIntensity = intensity * getPerformanceOptimizer().getEffectQuality();
        this.gameEngine.screenShakeRemaining = duration;
        this.gameEngine.inputDisabled = true;
        
        // 音響エフェクト
        this.gameEngine.audioManager.playElectricSound();
        
        // 画面揺れエフェクト
        this.gameEngine.effectManager.addScreenShake(intensity, duration, 'random');
        
        console.log(`画面揺れ開始: 強度${this.gameEngine.screenShakeIntensity}, 時間${duration}ms`);
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
     * 画面揺れ効果を発動
     */
    activateScreenShake(intensity, duration) {
        this.startScreenShake(duration, intensity);
    }
    
    /**
     * スコア倍率効果を発動
     */
    activateScoreMultiplier(multiplier, duration) {
        this.gameEngine.scoreMultiplier = Math.max(this.gameEngine.scoreMultiplier, multiplier);
        
        // 一定時間後に元に戻す
        setTimeout(() => {
            this.gameEngine.scoreMultiplier = 1;
            console.log('スコア倍率効果終了');
        }, duration);
        
        console.log(`スコア倍率効果開始: ${multiplier}x, ${duration}ms`);
    }
    
    /**
     * 次の泡のスコア倍率効果を発動
     */
    activateNextScoreMultiplier(multiplier, duration) {
        // ScoreManagerに次の泡のスコア倍率を設定
        if (this.gameEngine.scoreManager.setNextBubbleMultiplier) {
            this.gameEngine.scoreManager.setNextBubbleMultiplier(multiplier, duration);
        }
        
        console.log(`次の泡スコア倍率効果開始: ${multiplier}x, ${duration}ms`);
    }
    
    /**
     * ナイトモードを発動
     */
    activateNightMode() {
        // 背景を暗くする効果
        this.gameEngine.effectManager.addScreenTint(0.3, 300000, '#000033');
        console.log('ナイトモード発動');
    }
    
    /**
     * 視界制限効果を発動
     */
    activateReducedVisibility() {
        // 視界を制限する効果
        this.gameEngine.effectManager.addVignette(0.4, 300000);
        console.log('視界制限効果発動');
    }
    
    /**
     * ゲームオーバー処理
     */
    gameOver() {
        this.gameEngine.isGameOver = true;
        
        // ゲーム終了イベントをSEOシステムに通知
        this.emit('gameStateChanged', {
            state: 'gameOver',
            score: this.gameEngine.playerData.currentScore,
            timestamp: Date.now()
        });
        
        // 音響エフェクト
        this.gameEngine.audioManager.playGameOverSound();
        
        // クリーンアップ処理
        this.gameEngine.cleanup();
        
        // クリックで再開
        const restartHandler = () => {
            const { getMemoryManager } = require('../utils/MemoryManager.js');
            getMemoryManager().removeEventListener(this.gameEngine.canvas, 'click', restartHandler);
            this.gameEngine.start();
        };
        
        const { getMemoryManager } = require('../utils/MemoryManager.js');
        getMemoryManager().addEventListener(this.gameEngine.canvas, 'click', restartHandler);
    }
    
    /**
     * 特殊効果の更新
     */
    updateSpecialEffects(deltaTime) {
        // 時間停止中は特殊効果の時間を進めない
        if (this.gameEngine.isTimeStopActive()) {
            deltaTime = 0;
        }
        
        // ボーナスタイムの更新
        if (this.gameEngine.bonusTimeRemaining > 0) {
            this.gameEngine.bonusTimeRemaining -= deltaTime;
            
            if (this.gameEngine.bonusTimeRemaining <= 0) {
                this.gameEngine.scoreMultiplier = 1;
                console.log('ボーナスタイム終了');
            }
        }
        
        // 時間停止効果の更新
        if (this.gameEngine.timeStopRemaining > 0) {
            this.gameEngine.timeStopRemaining -= deltaTime;
            
            if (this.gameEngine.timeStopRemaining <= 0) {
                console.log('時間停止効果終了');
            }
        }
        
        // 画面揺れ効果の更新
        if (this.gameEngine.screenShakeRemaining > 0) {
            this.gameEngine.screenShakeRemaining -= deltaTime;
            
            if (this.gameEngine.screenShakeRemaining <= 0) {
                this.gameEngine.screenShakeIntensity = 0;
                this.gameEngine.inputDisabled = false;
                console.log('画面揺れ効果終了');
                
                // 画面揺れ終了時にTransformをリセット
                this.gameEngine.context.restore();
            }
        }
    }
    
    /**
     * 現在のスコア倍率を取得
     */
    getScoreMultiplier() {
        return this.gameEngine.scoreMultiplier;
    }
    
    /**
     * ボーナスタイム中かどうか
     */
    isBonusTimeActive() {
        return this.gameEngine.bonusTimeRemaining > 0;
    }
    
    /**
     * 時間停止中かどうか
     */
    isTimeStopActive() {
        return this.gameEngine.timeStopRemaining > 0;
    }
    
    /**
     * 時間停止中かどうか（互換性のためのエイリアス）
     */
    isTimeStopped() {
        return this.isTimeStopActive();
    }
    
    /**
     * 画面揺れ中かどうか
     */
    isScreenShakeActive() {
        return this.gameEngine.screenShakeRemaining > 0;
    }
    
    /**
     * 時間表示を更新
     */
    updateTimeDisplay() {
        const timeElement = document.getElementById('time');
        if (timeElement) {
            const minutes = Math.floor(this.gameEngine.timeRemaining / 60000);
            const seconds = Math.floor((this.gameEngine.timeRemaining % 60000) / 1000);
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
        this.gameEngine.audioVisualSynchronizer.createSyncedEffect(effectType, x, y, parameters);
    }
    
    /**
     * エフェクト設定の更新
     * @param {string} key - 設定キー
     * @param {*} value - 新しい値
     */
    updateEffectConfiguration(key, value) {
        this.gameEngine.effectConfigurationIntegrator.updateConfiguration(key, value);
    }
    
    /**
     * エフェクト設定の一括更新
     * @param {Object} settings - 設定オブジェクト
     */
    updateMultipleEffectConfigurations(settings) {
        this.gameEngine.effectConfigurationIntegrator.updateMultipleConfigurations(settings);
    }
    
    /**
     * エフェクト設定のエクスポート
     * @returns {Object} エクスポート用設定データ
     */
    exportEffectSettings() {
        return this.gameEngine.effectConfigurationIntegrator.exportEffectSettings();
    }
    
    /**
     * エフェクト設定のインポート
     * @param {Object} settings - インポート用設定データ
     * @returns {boolean} インポート成功か
     */
    importEffectSettings(settings) {
        return this.gameEngine.effectConfigurationIntegrator.importEffectSettings(settings);
    }
    
    /**
     * エフェクト品質レベルを設定
     * @param {string} qualityLevel - 品質レベル
     */
    setEffectQuality(qualityLevel) {
        this.gameEngine.effectQualityController.setQualityLevel(qualityLevel);
        console.log(`[GameEngine] エフェクト品質レベル設定: ${qualityLevel}`);
    }
    
    /**
     * 季節テーマを設定
     * @param {string} season - 季節
     */
    setSeasonalTheme(season) {
        this.gameEngine.seasonalEffectManager.setSeason(season);
        console.log(`[GameEngine] 季節テーマ設定: ${season}`);
    }
    
    /**
     * カスタムテーマを適用
     * @param {string} themeId - テーマID
     */
    applyCustomTheme(themeId) {
        const result = this.gameEngine.seasonalEffectManager.applyCustomTheme(themeId);
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
            performanceMonitor: this.gameEngine.effectPerformanceMonitor.getPerformanceStats(),
            qualityController: this.gameEngine.effectQualityController.getPerformanceStats(),
            currentTheme: this.gameEngine.seasonalEffectManager.getCurrentTheme()?.name || 'None',
            audioVisualSync: this.gameEngine.audioVisualSynchronizer.getStats(),
            configurationStats: this.gameEngine.effectConfigurationIntegrator.getConfigurationStats()
        };
    }
}