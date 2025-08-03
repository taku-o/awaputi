/**
 * Game Engine Renderer
 * 描画・レンダリング・エフェクト処理を担当
 */
export class GameEngineRenderer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * 描画処理
     */
    render() {
        // Canvas の状態を確認
        if (!this.gameEngine.context) {
            console.error('Context が存在しません');
            return;
        }
        
        // Canvas をクリア
        this.gameEngine.context.save();
        this.gameEngine.context.clearRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        
        // レンダリング最適化開始
        this.gameEngine.renderOptimizer.optimize();
        
        // 画面揺れ効果を適用
        if (this.isScreenShakeActive()) {
            this.applyScreenShake();
        }
        
        // エフェクトマネージャーの前処理エフェクト
        this.gameEngine.effectManager.renderPreEffects(this.gameEngine.context);
        
        // シーンマネージャーに描画を委譲
        this.gameEngine.sceneManager.render(this.gameEngine.context);
        
        // パーティクルエフェクトを描画（既存）
        this.gameEngine.particleManager.render(this.gameEngine.context);
        
        // 拡張パーティクルエフェクトを描画
        this.gameEngine.enhancedParticleManager.render(this.gameEngine.context);
        
        // 季節限定エフェクトを描画
        this.gameEngine.seasonalEffectManager.render(this.gameEngine.context);
        
        // エフェクトマネージャーの後処理エフェクト（既存）
        this.gameEngine.effectManager.renderPostEffects(this.gameEngine.context);
        
        // 拡張エフェクトマネージャーのレンダリング
        this.gameEngine.enhancedEffectManager.render(this.gameEngine.context);
        
        // 実績通知システムの描画（最前面）
        if (this.gameEngine.achievementNotificationSystem) {
            this.gameEngine.achievementNotificationSystem.render();
        }
        
        // レンダリング最適化終了 - 問題のある可能性があるため一時的にコメントアウト
        // this.gameEngine.renderOptimizer.render();
        
        // パフォーマンス情報表示（デバッグモード時）
        if (this.gameEngine.isDebugMode()) {
            this.renderPerformanceInfo();
        }
        
        this.gameEngine.context.restore();
    }
    
    /**
     * 画面揺れ効果を適用
     */
    applyScreenShake() {
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        
        if (!getPerformanceOptimizer().shouldRunEffect('shake')) {
            return; // 低品質モードでは画面揺れをスキップ
        }
        
        const intensity = this.gameEngine.screenShakeIntensity * getPerformanceOptimizer().getEffectQuality();
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        
        this.gameEngine.context.save();
        this.gameEngine.context.translate(shakeX, shakeY);
    }
    
    /**
     * パフォーマンス情報を描画
     */
    renderPerformanceInfo() {
        this.gameEngine.context.save();
        
        this.gameEngine.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.gameEngine.context.fillRect(this.gameEngine.canvas.width - 200, 0, 200, 150);
        
        this.gameEngine.context.fillStyle = '#FFFFFF';
        this.gameEngine.context.font = '12px monospace';
        this.gameEngine.context.textAlign = 'left';
        
        const stats = this.gameEngine.performanceStats;
        const y = 15;
        const lineHeight = 15;
        
        this.gameEngine.context.fillText(`FPS: ${stats.fps}`, this.gameEngine.canvas.width - 190, y);
        this.gameEngine.context.fillText(`Render: ${Math.round(stats.renderTime)}ms`, this.gameEngine.canvas.width - 190, y + lineHeight);
        this.gameEngine.context.fillText(`Update: ${Math.round(stats.updateTime)}ms`, this.gameEngine.canvas.width - 190, y + lineHeight * 2);
        this.gameEngine.context.fillText(`Level: ${stats.performanceLevel}`, this.gameEngine.canvas.width - 190, y + lineHeight * 3);
        
        if (stats.memoryUsage) {
            this.gameEngine.context.fillText(`Memory: ${Math.round(stats.memoryUsage / 1024 / 1024)}MB`, this.gameEngine.canvas.width - 190, y + lineHeight * 4);
        }
        
        // プール統計
        const { getPoolManager } = require('../utils/ObjectPool.js');
        const poolStats = getPoolManager().getAllStats();
        let line = 6;
        Object.entries(poolStats).forEach(([name, stat]) => {
            this.gameEngine.context.fillText(`${name}: ${stat.activeCount}/${stat.poolSize}`, this.gameEngine.canvas.width - 190, y + lineHeight * line);
            line++;
        });
        
        this.gameEngine.context.restore();
    }
    
    /**
     * 画面揺れ中かどうか
     */
    isScreenShakeActive() {
        return this.gameEngine.screenShakeRemaining > 0;
    }
    
    /**
     * コンボ表示
     */
    renderCombo() {
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        
        if (!getPerformanceOptimizer().shouldRunEffect('ui')) {
            return; // 低品質モードではUIエフェクトをスキップ
        }
        
        const combo = this.gameEngine.scoreManager.getCurrentCombo();
        this.gameEngine.context.save();
        
        this.gameEngine.context.fillStyle = '#FFD700';
        this.gameEngine.context.font = 'bold 24px Arial';
        this.gameEngine.context.textAlign = 'center';
        this.gameEngine.context.textBaseline = 'middle';
        
        this.gameEngine.context.fillText(`${combo} COMBO!`, this.gameEngine.canvas.width / 2, 50);
        
        this.gameEngine.context.restore();
    }
    
    /**
     * ゲームオーバー画面
     */
    renderGameOver() {
        this.gameEngine.context.save();
        
        // 半透明オーバーレイ
        this.gameEngine.context.fillStyle = 'rgba(0,0,0,0.7)';
        this.gameEngine.context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        
        // ゲームオーバーテキスト
        this.gameEngine.context.fillStyle = '#FFFFFF';
        this.gameEngine.context.font = 'bold 48px Arial';
        this.gameEngine.context.textAlign = 'center';
        this.gameEngine.context.textBaseline = 'middle';
        
        this.gameEngine.context.fillText('GAME OVER', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 - 50);
        
        this.gameEngine.context.font = 'bold 24px Arial';
        this.gameEngine.context.fillText(`最終スコア: ${this.gameEngine.playerData.currentScore}`, this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 + 20);
        
        this.gameEngine.context.font = '18px Arial';
        this.gameEngine.context.fillText('クリックして再開', this.gameEngine.canvas.width / 2, this.gameEngine.canvas.height / 2 + 60);
        
        this.gameEngine.context.restore();
    }
    
    /**
     * 特殊効果の背景表示
     */
    renderSpecialEffectBackground() {
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        
        if (!getPerformanceOptimizer().shouldRunEffect('background')) {
            return; // 低品質モードでは背景エフェクトをスキップ
        }
        
        this.gameEngine.context.save();
        
        // ボーナスタイム中の背景効果
        if (this.isBonusTimeActive()) {
            const alpha = (0.1 + 0.1 * Math.sin(Date.now() / 200)) * getPerformanceOptimizer().getEffectQuality();
            this.gameEngine.context.fillStyle = `rgba(255, 105, 180, ${alpha})`;
            this.gameEngine.context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        }
        
        // 時間停止中の背景効果
        if (this.isTimeStopActive()) {
            const alpha = (0.15 + 0.1 * Math.sin(Date.now() / 150)) * getPerformanceOptimizer().getEffectQuality();
            this.gameEngine.context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.gameEngine.context.fillRect(0, 0, this.gameEngine.canvas.width, this.gameEngine.canvas.height);
        }
        
        this.gameEngine.context.restore();
    }
    
    /**
     * 特殊効果の表示
     */
    renderSpecialEffects() {
        const { getPerformanceOptimizer } = require('../utils/PerformanceOptimizer.js');
        
        if (!getPerformanceOptimizer().shouldRunEffect('ui')) {
            return; // 低品質モードではUIエフェクトをスキップ
        }
        
        this.gameEngine.context.save();
        
        // ボーナスタイム表示
        if (this.isBonusTimeActive()) {
            this.gameEngine.context.fillStyle = '#FF69B4';
            this.gameEngine.context.font = 'bold 20px Arial';
            this.gameEngine.context.textAlign = 'left';
            this.gameEngine.context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.gameEngine.bonusTimeRemaining / 1000);
            this.gameEngine.context.fillText(`ボーナスタイム: ${remainingSeconds}s`, 10, 10);
            this.gameEngine.context.fillText('スコア2倍!', 10, 35);
        }
        
        // 時間停止表示
        if (this.isTimeStopActive()) {
            this.gameEngine.context.fillStyle = '#FFD700';
            this.gameEngine.context.font = 'bold 20px Arial';
            this.gameEngine.context.textAlign = 'left';
            this.gameEngine.context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.gameEngine.timeStopRemaining / 1000);
            const yOffset = this.isBonusTimeActive() ? 70 : 10;
            this.gameEngine.context.fillText(`時間停止: ${remainingSeconds}s`, 10, yOffset);
        }
        
        // 画面揺れ表示
        if (this.isScreenShakeActive()) {
            this.gameEngine.context.fillStyle = '#FFFF00';
            this.gameEngine.context.font = 'bold 20px Arial';
            this.gameEngine.context.textAlign = 'left';
            this.gameEngine.context.textBaseline = 'top';
            
            const remainingSeconds = Math.ceil(this.gameEngine.screenShakeRemaining / 1000);
            let yOffset = 10;
            if (this.isBonusTimeActive()) yOffset += 60;
            if (this.isTimeStopActive()) yOffset += 35;
            
            this.gameEngine.context.fillText(`ビリビリ: ${remainingSeconds}s`, 10, yOffset);
            this.gameEngine.context.fillText('操作不能!', 10, yOffset + 25);
        }
        
        this.gameEngine.context.restore();
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
     * レンダリングオブジェクトを追加
     */
    addRenderObject(obj, layer = 'default') {
        this.gameEngine.renderOptimizer.addObject(obj, layer);
    }
    
    /**
     * 爆発エフェクトを作成（統合）
     */
    createExplosion(x, y, bubbleType, bubbleSize, intensity = 1) {
        // パーティクルエフェクト
        this.gameEngine.particleManager.createBubblePopEffect(x, y, bubbleType, bubbleSize);
        
        // 音響エフェクト
        this.gameEngine.audioManager.playPopSound(false, bubbleType);
        
        // 視覚エフェクト
        if (intensity > 0.5) {
            this.gameEngine.effectManager.addScreenFlash(0.1, 100, '#FFFFFF');
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
        this.gameEngine.enhancedParticleManager.createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options);
        
        // 季節限定エフェクト
        this.gameEngine.seasonalEffectManager.createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize);
        
        // 拡張エフェクトマネージャー
        this.gameEngine.enhancedEffectManager.createEnhancedScreenEffect(x, y, 'bubble_destruction', {
            bubbleType,
            bubbleSize,
            ...options
        });
        
        // 音響エフェクト（既存）
        this.gameEngine.audioManager.playPopSound(false, bubbleType);
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
        this.gameEngine.enhancedParticleManager.createEnhancedComboEffect(x, y, comboCount, comboType);
        
        // 季節限定コンボエフェクト
        this.gameEngine.seasonalEffectManager.createSeasonalComboEffect(x, y, comboCount);
        
        // 拡張画面エフェクト
        this.gameEngine.enhancedEffectManager.createComboScreenEffect(x, y, comboCount, comboType);
        
        // 音響エフェクト
        this.gameEngine.audioManager.playComboSound(comboCount);
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
        this.gameEngine.enhancedParticleManager.createSpecialBubbleEffect(x, y, specialType, effectData);
        
        // 特殊画面エフェクト
        this.gameEngine.enhancedEffectManager.createSpecialScreenEffect(x, y, specialType, effectData);
        
        // 音響エフェクト
        this.gameEngine.audioManager.playSpecialSound(specialType);
    }
    
    /**
     * バブルをプールから取得
     */
    getBubbleFromPool() {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        return getPoolManager().get('bubbles');
    }
    
    /**
     * バブルをプールに返却
     */
    returnBubbleToPool(bubble) {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        getPoolManager().return('bubbles', bubble);
    }
    
    /**
     * パーティクルをプールから取得
     */
    getParticleFromPool() {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        return getPoolManager().get('particles');
    }
    
    /**
     * パーティクルをプールに返却
     */
    returnParticleToPool(particle) {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        getPoolManager().return('particles', particle);
    }
    
    /**
     * フローティングテキストをプールから取得
     */
    getFloatingTextFromPool() {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        return getPoolManager().get('floatingText');
    }
    
    /**
     * フローティングテキストをプールに返却
     */
    returnFloatingTextToPool(text) {
        const { getPoolManager } = require('../utils/ObjectPool.js');
        getPoolManager().return('floatingText', text);
    }
}