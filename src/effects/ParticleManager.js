import { getEffectsConfig } from '../config/EffectsConfig.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { ParticleRenderer } from './particles/ParticleRenderer.js';
import { ParticleLifecycleManager } from './particles/ParticleLifecycleManager.js';

/**
 * パーティクル効果管理クラス（Main Controller）
 * 泡が割れる時の視覚効果、爆発、きらめき等の統合管理
 */
export class ParticleManager {
    constructor() {
        this.particles = [];
        this.errorHandler = getErrorHandler();
        
        // 設定システムの初期化
        this.effectsConfig = getEffectsConfig();
        this._initializeFromConfig();
        
        // サブコンポーネントの初期化
        this.renderer = new ParticleRenderer(this);
        this.lifecycleManager = new ParticleLifecycleManager(this);
        
        // パーティクルプールの初期化
        this.lifecycleManager.initializePool(this.poolSize);
        
        // 設定変更の監視
        this._setupConfigWatchers();
        
        console.log('[ParticleManager] Main Controller initialized');
    }
    
    /**
     * 設定から初期値を設定
     * @private
     */
    _initializeFromConfig() {
        try {
            const particleConfig = this.effectsConfig.getParticleConfig();
            this.maxParticles = particleConfig.maxCount;
            this.poolSize = particleConfig.poolSize;
            this.quality = particleConfig.quality;
            this.enabled = particleConfig.enabled;
            
            console.log('[ParticleManager] 設定から初期化完了:', {
                maxParticles: this.maxParticles,
                poolSize: this.poolSize,
                quality: this.quality,
                enabled: this.enabled
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleManager._initializeFromConfig'
            });
            
            // フォールバック値
            this.maxParticles = 500;
            this.poolSize = 100;
            this.quality = 1.0;
            this.enabled = true;
        }
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    _setupConfigWatchers() {
        try {
            // 最大パーティクル数の変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.maxCount', (newValue) => {
                this._onMaxParticleCountChanged(newValue);
            });
            
            // プールサイズの変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.poolSize', (newValue) => {
                this._onPoolSizeChanged(newValue);
            });
            
            // 品質の変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.quality', (newValue) => {
                this._onQualityChanged(newValue);
            });
            
            // 有効状態の変更監視
            this.effectsConfig.configManager.watch('effects', 'particles.enabled', (newValue) => {
                this._onEnabledChanged(newValue);
            });
            
            console.log('[ParticleManager] 設定変更監視を設定しました');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleManager._setupConfigWatchers'
            });
        }
    }
    
    /**
     * 最大パーティクル数変更時の処理
     * @param {number} newValue - 新しい最大パーティクル数
     * @private
     */
    _onMaxParticleCountChanged(newValue) {
        try {
            const oldValue = this.maxParticles;
            this.maxParticles = newValue;
            
            // 現在のパーティクル数が新しい制限を超えている場合は削除
            if (this.particles.length > newValue) {
                const excessCount = this.particles.length - newValue;
                for (let i = 0; i < excessCount; i++) {
                    const particle = this.particles.shift();
                    this.lifecycleManager.returnParticleToPool(particle);
                }
            }
            
            console.log(`[ParticleManager] 最大パーティクル数を変更: ${oldValue} → ${newValue}`);
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'ParticleManager._onMaxParticleCountChanged'
            });
        }
    }
    
    /**
     * プールサイズ変更時の処理
     * @param {number} newValue - 新しいプールサイズ
     * @private
     */
    _onPoolSizeChanged(newValue) {
        try {
            const oldValue = this.poolSize;
            this.poolSize = newValue;
            
            // ライフサイクルマネージャーにプールサイズ変更を委譲
            this.lifecycleManager.resizePool(newValue);
            
            console.log(`[ParticleManager] プールサイズを変更: ${oldValue} → ${newValue}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleManager._onPoolSizeChanged'
            });
        }
    }
    
    /**
     * 品質変更時の処理
     * @param {number} newValue - 新しい品質値
     * @private
     */
    _onQualityChanged(newValue) {
        try {
            const oldValue = this.quality;
            this.quality = newValue;
            
            console.log(`[ParticleManager] 品質を変更: ${oldValue} → ${newValue}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleManager._onQualityChanged'
            });
        }
    }
    
    /**
     * 有効状態変更時の処理
     * @param {boolean} newValue - 新しい有効状態
     * @private
     */
    _onEnabledChanged(newValue) {
        try {
            const oldValue = this.enabled;
            this.enabled = newValue;
            
            // 無効になった場合は全パーティクルをクリア
            if (!newValue) {
                this.clear();
            }
            
            console.log(`[ParticleManager] 有効状態を変更: ${oldValue} → ${newValue}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleManager._onEnabledChanged'
            });
        }
    }
    
    /**
     * プールからパーティクルを取得（ライフサイクルマネージャーに委譲）
     */
    getParticleFromPool() {
        return this.lifecycleManager.getParticleFromPool();
    }
    
    /**
     * パーティクルをプールに戻す（ライフサイクルマネージャーに委譲）
     */
    returnParticleToPool(particle) {
        return this.lifecycleManager.returnParticleToPool(particle);
    }
    
    /**
     * 泡ポップエフェクトを作成
     */
    createBubblePopEffect(x, y, bubbleType, bubbleSize) {
        // パーティクルが無効な場合は何もしない
        if (!this.enabled) {
            return;
        }
        
        try {
            const particleConfig = this.effectsConfig.getParticleConfig();
            
            // ライフサイクルマネージャーに基本パーティクル生成を委譲
            const bubbleParticles = this.lifecycleManager.createBubblePopParticles(
                x, y, bubbleType, bubbleSize, particleConfig, this.quality
            );
            
            this.particles.push(...bubbleParticles);
            
            // 特殊効果（バブルタイプ別）
            this.createSpecialBubbleEffect(x, y, bubbleType, bubbleSize);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleManager.createBubblePopEffect'
            });
        }
    }
    
    /**
     * バブルタイプ別の色を取得（レンダラーに委譲）
     */
    getBubbleColors(bubbleType) {
        return this.renderer.getBubbleColors(bubbleType);
    }
    
    /**
     * バブルタイプ別の特殊効果
     */
    createSpecialBubbleEffect(x, y, bubbleType, bubbleSize) {
        let specialParticles = [];
        
        switch (bubbleType) {
            case 'rainbow':
                specialParticles = this.lifecycleManager.createRainbowSparkles(x, y, bubbleSize);
                break;
            case 'electric':
                specialParticles = this.lifecycleManager.createElectricSparks(x, y, bubbleSize);
                break;
            case 'spiky':
                specialParticles = this.lifecycleManager.createSpikeExplosion(x, y, bubbleSize);
                break;
            case 'diamond':
                specialParticles = this.lifecycleManager.createDiamondShards(x, y, bubbleSize);
                break;
            case 'boss':
                specialParticles = this.lifecycleManager.createBossExplosion(x, y, bubbleSize);
                break;
            case 'poison':
                specialParticles = this.lifecycleManager.createPoisonCloud(x, y, bubbleSize);
                break;
            case 'clock':
                specialParticles = this.lifecycleManager.createTimeRipple(x, y, bubbleSize);
                break;
        }
        
        if (specialParticles.length > 0) {
            this.particles.push(...specialParticles);
        }
    }
    
    
    /**
     * コンボエフェクト
     */
    createComboEffect(x, y, comboCount) {
        // パーティクルが無効な場合は何もしない
        if (!this.enabled) {
            return;
        }
        
        try {
            const particleConfig = this.effectsConfig.getParticleConfig();
            const starConfig = particleConfig.star;
            
            // 品質に基づいてパーティクル数を調整
            const baseStarCount = Math.min(comboCount, starConfig.count * 2);
            const starCount = Math.floor(baseStarCount * this.quality);
            const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'];
            
            for (let i = 0; i < starCount; i++) {
                const particle = this.getParticleFromPool();
                
                const angle = (Math.PI * 2 * i) / starCount;
                const radius = 30 + comboCount * 2;
                const speed = starConfig.speed * (0.6 + Math.random() * 0.4) * this.quality;
                
                particle.x = x + Math.cos(angle) * radius;
                particle.y = y + Math.sin(angle) * radius;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                particle.size = starConfig.size * (0.75 + Math.random() * 0.5) * this.quality;
                particle.color = colors[Math.min(Math.floor(comboCount / 5), colors.length - 1)];
                particle.life = starConfig.life * (0.8 + Math.random() * 0.4);
                particle.maxLife = particle.life;
                particle.gravity = -20;
                particle.friction = 0.97;
                particle.type = 'star';
                particle.rotationSpeed = (Math.random() - 0.5) * 10;
                
                this.particles.push(particle);
            }
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'ParticleManager.createComboEffect'
            });
        }
    }
    
    /**
     * 更新処理（ライフサイクルマネージャーに委譲）
     */
    update(deltaTime) {
        this.particles = this.lifecycleManager.updateParticles(this.particles, deltaTime);
        
        // パーティクル数制限
        if (this.particles.length > this.maxParticles) {
            const excessCount = this.particles.length - this.maxParticles;
            for (let i = 0; i < excessCount; i++) {
                const particle = this.particles.shift();
                this.returnParticleToPool(particle);
            }
        }
    }
    
    
    /**
     * 描画処理（レンダラーに委譲）
     */
    render(context) {
        this.renderer.render(context, this.particles);
    }
    
    
    /**
     * 全パーティクルをクリア
     */
    clear() {
        this.lifecycleManager.clearAllParticles(this.particles);
        this.particles = [];
    }
    
    /**
     * パーティクル数を取得
     */
    getParticleCount() {
        return this.particles.length;
    }
    
    /**
     * アクティブなパーティクルを取得
     */
    getActiveParticles() {
        return this.particles.filter(p => p.isActive);
    }
    
    /**
     * 全パーティクルをクリア（clearAllParticlesエイリアス）
     */
    clearAllParticles() {
        this.clear();
    }
    
    /**
     * 設定を動的に更新
     * @param {Object} config - 新しい設定
     */
    updateConfiguration(config) {
        try {
            if (config.maxParticles !== undefined) {
                this.effectsConfig.setMaxParticleCount(config.maxParticles);
            }
            
            if (config.poolSize !== undefined) {
                this.effectsConfig.setParticlePoolSize(config.poolSize);
            }
            
            if (config.quality !== undefined) {
                this.effectsConfig.setParticleQuality(config.quality);
            }
            
            if (config.enabled !== undefined) {
                this.effectsConfig.setParticleEnabled(config.enabled);
            }
            
            console.log('[ParticleManager] 設定を動的に更新しました:', config);
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'ParticleManager.updateConfiguration'
            });
        }
    }
    
    /**
     * 現在の設定を取得
     * @returns {Object} 現在の設定
     */
    getCurrentConfiguration() {
        const lifecycleStats = this.lifecycleManager.getLifecycleStats();
        
        return {
            maxParticles: this.maxParticles,
            poolSize: this.poolSize,
            quality: this.quality,
            enabled: this.enabled,
            currentParticleCount: this.particles.length,
            poolUsage: this.poolSize - lifecycleStats.currentPoolSize
        };
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
        const lifecycleStats = this.lifecycleManager.getLifecycleStats();
        const renderingStats = this.renderer.getRenderingStats();
        
        return {
            activeParticles: this.particles.length,
            maxParticles: this.maxParticles,
            poolSize: this.poolSize,
            availableInPool: lifecycleStats.currentPoolSize,
            poolUsagePercent: lifecycleStats.memoryUtilization.poolUsagePercent,
            particleUtilizationPercent: (this.particles.length / this.maxParticles * 100).toFixed(1),
            quality: this.quality,
            enabled: this.enabled,
            lifecycle: lifecycleStats,
            rendering: renderingStats
        };
    }
    
    /**
     * 設定をEffectsConfigと同期
     */
    syncWithEffectsConfig() {
        try {
            this.effectsConfig.syncFromParticleManager(this);
            console.log('[ParticleManager] EffectsConfigと同期しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'ParticleManager.syncWithEffectsConfig'
            });
        }
    }
    
    /**
     * デバッグ情報を出力
     */
    debugInfo() {
        const stats = this.getPerformanceStats();
        const config = this.getCurrentConfiguration();
        
        console.group('[ParticleManager] デバッグ情報');
        console.log('パフォーマンス統計:', stats);
        console.log('現在の設定:', config);
        console.log('パーティクルタイプ分布:', this._getParticleTypeDistribution());
        console.groupEnd();
    }
    
    /**
     * パーティクルタイプの分布を取得
     * @returns {Object} タイプ別パーティクル数
     * @private
     */
    _getParticleTypeDistribution() {
        const distribution = {};
        this.particles.forEach(particle => {
            if (particle.isActive) {
                distribution[particle.type] = (distribution[particle.type] || 0) + 1;
            }
        });
        return distribution;
    }
    
    /**
     * パーティクルシステムを無効化
     * エラー復旧やセーフモード時に使用
     */
    disable() {
        try {
            this.enabled = false;
            this.clear();
            console.log('[ParticleManager] パーティクルシステムを無効化しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'ParticleManager.disable'
            });
        }
    }
    
    /**
     * パーティクルシステムを有効化
     */
    enable() {
        this.enabled = true;
        console.log('[ParticleManager] パーティクルシステムを有効化しました');
    }
}