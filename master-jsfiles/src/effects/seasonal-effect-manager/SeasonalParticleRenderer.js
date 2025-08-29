/**
 * SeasonalParticleRenderer - 季節限定パーティクル描画システム
 * 
 * 季節やイベント特有のパーティクルエフェクトの生成と描画を専門的に処理します
 */

export class SeasonalParticleRenderer {
    constructor(qualityController, errorHandler) {
        this.qualityController = qualityController;
        this.errorHandler = errorHandler;
        this.activeSeasonalEffects = new Map();
        this.seasonalParticles = [];
    }
    
    /**
     * 季節限定バブル破壊エフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} theme - アクティブテーマ
     */
    createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize, theme) {
        if (!theme) return;
        
        // エフェクト実行可否のチェック
        if (!this.qualityController.canExecuteEffect('particle', 'normal')) {
            return;
        }
        
        try {
            const effect = theme.effects.bubbleDestruction;
            const colors = theme.colors.primary;
            const particleTypes = theme.particles.types;
            
            this._createThemeSpecificEffect(x, y, effect, {
                colors,
                particleTypes,
                size: bubbleSize,
                intensity: this._getEffectIntensity()
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalParticleRenderer.createSeasonalBubbleEffect');
        }
    }
    
    /**
     * 季節限定コンボエフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     * @param {Object} theme - アクティブテーマ
     */
    createSeasonalComboEffect(x, y, comboCount, theme) {
        if (!theme) return;
        
        // コンボエフェクトは重要度が高い
        const priority = comboCount >= 10 ? 'critical' : 'important';
        if (!this.qualityController.canExecuteEffect('particle', priority)) {
            return;
        }
        
        try {
            const effect = theme.effects.comboEffect;
            const colors = theme.colors.accent;
            const particleTypes = theme.particles.types;
            
            this._createThemeSpecificEffect(x, y, effect, {
                colors,
                particleTypes,
                intensity: Math.min(comboCount * 0.2, 2.0),
                particleCount: Math.min(comboCount * 3, 30)
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalParticleRenderer.createSeasonalComboEffect');
        }
    }
    
    /**
     * テーマ固有エフェクトの作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - エフェクトタイプ
     * @param {Object} config - 設定
     * @private
     */
    _createThemeSpecificEffect(x, y, effectType, config) {
        const effectId = `seasonal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const effect = {
            id: effectId,
            type: effectType,
            x: x,
            y: y,
            config: config,
            createdTime: performance.now(),
            particles: []
        };
        
        // エフェクトタイプに応じたパーティクル生成
        switch (effectType) {
            case 'flower_burst':
                this._createFlowerBurstEffect(effect);
                break;
            case 'splash_burst':
                this._createSplashBurstEffect(effect);
                break;
            case 'leaf_scatter':
                this._createLeafScatterEffect(effect);
                break;
            case 'ice_shatter':
                this._createIceShatterEffect(effect);
                break;
            case 'firework_burst':
                this._createFireworkBurstEffect(effect);
                break;
            case 'heart_burst':
                this._createHeartBurstEffect(effect);
                break;
            case 'spooky_burst':
                this._createSpookyBurstEffect(effect);
                break;
            case 'christmas_burst':
                this._createChristmasBurstEffect(effect);
                break;
            default:
                this._createDefaultSeasonalEffect(effect);
        }
        
        this.activeSeasonalEffects.set(effectId, effect);
    }
    
    /**
     * 花の爆発エフェクト（春）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createFlowerBurstEffect(effect) {
        const particleCount = Math.floor(15 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 4,
                color: color,
                life: 1.0,
                decay: 0.015,
                type: 'cherry_blossom',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    /**
     * 水しぶきエフェクト（夏）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createSplashBurstEffect(effect) {
        const particleCount = Math.floor(20 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const velocity = 3 + Math.random() * 4;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 1, // 上向きの初速
                size: 2 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.02,
                type: 'water_drop',
                gravity: 0.15,
                bounce: 0.3
            });
        }
    }
    
    /**
     * 葉っぱ散乱エフェクト（秋）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createLeafScatterEffect(effect) {
        const particleCount = Math.floor(12 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1.5 + Math.random() * 2.5;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 4 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.012,
                type: 'maple_leaf',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                flutter: Math.random() * 0.1
            });
        }
    }
    
    /**
     * 氷の粉砕エフェクト（冬）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createIceShatterEffect(effect) {
        const particleCount = Math.floor(18 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
            const velocity = 2.5 + Math.random() * 3.5;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 2 + Math.random() * 2,
                color: color,
                life: 1.0,
                decay: 0.018,
                type: 'ice_crystal',
                sparkle: true,
                sparkleIntensity: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    /**
     * 花火エフェクト（新年）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createFireworkBurstEffect(effect) {
        const particleCount = Math.floor(25 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 4 + Math.random() * 4;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 2,
                color: color,
                life: 1.0,
                decay: 0.01,
                type: 'firework',
                brightness: 1.0,
                trail: true,
                trailLength: 5
            });
        }
    }
    
    /**
     * ハートエフェクト（バレンタイン）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createHeartBurstEffect(effect) {
        const particleCount = Math.floor(12 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 1.5 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 0.5,
                size: 4 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.01,
                type: 'heart',
                pulse: true,
                pulseSpeed: 0.1
            });
        }
    }
    
    /**
     * 不気味エフェクト（ハロウィン）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createSpookyBurstEffect(effect) {
        const particleCount = Math.floor(10 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 5 + Math.random() * 4,
                color: color,
                life: 1.0,
                decay: 0.008,
                type: 'ghost',
                opacity: 0.7,
                wobble: true,
                wobbleAmplitude: 1
            });
        }
    }
    
    /**
     * クリスマスエフェクト
     * @param {Object} effect - エフェクト
     * @private
     */
    _createChristmasBurstEffect(effect) {
        const particleCount = Math.floor(16 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.012,
                type: 'christmas_star',
                twinkle: true,
                twinkleSpeed: 0.15
            });
        }
    }
    
    /**
     * デフォルト季節エフェクト
     * @param {Object} effect - エフェクト
     * @private
     */
    _createDefaultSeasonalEffect(effect) {
        const particleCount = Math.floor(10 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 2,
                color: color,
                life: 1.0,
                decay: 0.015,
                type: 'default'
            });
        }
    }
    
    /**
     * パーティクルの更新
     * @param {number} deltaTime - 経過時間
     */
    updateParticles(deltaTime) {
        this.activeSeasonalEffects.forEach((effect, effectId) => {
            effect.particles.forEach((particle, index) => {
                // パーティクルの更新
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                
                // 重力効果
                if (particle.gravity) {
                    particle.vy += particle.gravity * deltaTime;
                }
                
                // 回転効果
                if (particle.rotationSpeed) {
                    particle.rotation += particle.rotationSpeed * deltaTime;
                }
                
                // 特殊効果
                this._updateSpecialEffects(particle, deltaTime);
                
                // ライフサイクル管理
                particle.life -= particle.decay * deltaTime;
                
                // 死んだパーティクルを除去
                if (particle.life <= 0) {
                    effect.particles.splice(index, 1);
                }
            });
            
            // エフェクトが空になったら削除
            if (effect.particles.length === 0) {
                this.activeSeasonalEffects.delete(effectId);
            }
        });
    }
    
    /**
     * 特殊効果の更新
     * @param {Object} particle - パーティクル
     * @param {number} deltaTime - 経過時間
     * @private
     */
    _updateSpecialEffects(particle, deltaTime) {
        const time = performance.now() * 0.001;
        
        // パルス効果
        if (particle.pulse) {
            particle.currentSize = particle.size * (1 + Math.sin(time * particle.pulseSpeed) * 0.3);
        }
        
        // 点滅効果
        if (particle.twinkle) {
            particle.alpha = 0.5 + Math.sin(time * particle.twinkleSpeed) * 0.5;
        }
        
        // 揺れ効果
        if (particle.wobble) {
            particle.wobbleOffset = Math.sin(time * 2) * particle.wobbleAmplitude;
        }
    }
    
    /**
     * パーティクルの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */
    renderParticles(context) {
        this.activeSeasonalEffects.forEach(effect => {
            effect.particles.forEach(particle => {
                this._renderParticle(context, particle);
            });
        });
    }
    
    /**
     * 個別パーティクルの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {Object} particle - パーティクル
     * @private
     */
    _renderParticle(context, particle) {
        context.save();
        
        const alpha = particle.alpha || particle.life;
        context.globalAlpha = alpha;
        
        const x = particle.x + (particle.wobbleOffset || 0);
        const y = particle.y;
        const size = particle.currentSize || particle.size;
        
        context.fillStyle = particle.color;
        context.translate(x, y);
        
        if (particle.rotation) {
            context.rotate(particle.rotation);
        }
        
        // パーティクルタイプ別描画
        switch (particle.type) {
            case 'heart':
                this._drawHeart(context, size);
                break;
            case 'star':
            case 'christmas_star':
                this._drawStar(context, size);
                break;
            default:
                this._drawCircle(context, size);
        }
        
        context.restore();
    }
    
    /**
     * ハート形状の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _drawHeart(context, size) {
        const scale = size / 10;
        context.scale(scale, scale);
        
        context.beginPath();
        context.moveTo(0, 3);
        context.bezierCurveTo(-5, -2, -15, 2, 0, 15);
        context.bezierCurveTo(15, 2, 5, -2, 0, 3);
        context.fill();
    }
    
    /**
     * 星形状の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _drawStar(context, size) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        context.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.fill();
    }
    
    /**
     * 円形状の描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _drawCircle(context, size) {
        context.beginPath();
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * ランダムな色を取得
     * @param {Array} colors - 色配列
     * @returns {string} 色
     * @private
     */
    _getRandomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * エフェクトの強度を取得
     * @returns {number} 強度
     * @private
     */
    _getEffectIntensity() {
        return this.qualityController ? this.qualityController.getParticleQualityMultiplier() : 1.0;
    }
    
    /**
     * エフェクトのクリア
     */
    clearAllEffects() {
        this.activeSeasonalEffects.clear();
        this.seasonalParticles.length = 0;
    }
    
    /**
     * エフェクト統計の取得
     * @returns {Object} 統計情報
     */
    getEffectStats() {
        let totalParticles = 0;
        this.activeSeasonalEffects.forEach(effect => {
            totalParticles += effect.particles.length;
        });
        
        return {
            activeEffects: this.activeSeasonalEffects.size,
            totalParticles: totalParticles,
            memoryUsage: this._estimateMemoryUsage()
        };
    }
    
    /**
     * メモリ使用量の推定
     * @returns {number} メモリ使用量（バイト）
     * @private
     */
    _estimateMemoryUsage() {
        let usage = 0;
        this.activeSeasonalEffects.forEach(effect => {
            usage += effect.particles.length * 200; // パーティクル当たり約200バイト
        });
        return usage;
    }
}