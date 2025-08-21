/**
 * SeasonalParticleRenderer - 季節限定パーティクル描画システム
 * 
 * 季節やイベント特有のパーティクルエフェクトの生成と描画を専門的に処理します
 */

// パーティクルの型定義
export interface SeasonalParticle { x: number,
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    decay: number;
   , type: string;
    rotation?: number;
    rotationSpeed?: number;
    gravity?: number;
    bounce?: number;
    flutter?: number;
    sparkle?: boolean;
    sparkleIntensity?: number;
    brightness?: number;
    trail?: boolean;
    trailLength?: number;
    pulse?: boolean;
    pulseSpeed?: number;
    opacity?: number;
    wobble?: boolean;
    wobbleAmplitude?: number;
    currentSize?: number;
    alpha?: number;
    wobbleOffset?: number;
    twinkle?: boolean;
    twinkleSpeed?: number; ,}

// エフェクトの型定義
export interface SeasonalEffect { id: string,
    type: string;
    x: number;
    y: number;
    config: EffectConfig;
    createdTime: number;
   , particles: SeasonalParticle[]
    ,}

export interface EffectConfig { colors: string[];
   , particleTypes: string[];
    size?: number;
    intensity?: number;
    particleCount?: number; }

// テーマ設定の型定義
export interface ThemeConfig { colors: {
        primar;y: string[];
        accent?: string[] };
    particles: { types: string[] };
    effects: { bubbleDestruction: string;
        comboEffect?: string }

// Quality Controller インターフェース
export interface QualityController { canExecuteEffect(type: 'particle', priority: 'normal' | 'important' | 'critical): boolean,
    getParticleQualityMultiplier(): number }

// Error Handler インターフェース
export interface ErrorHandler { handleError(error: Error, context: string): void ,}

export interface EffectStatistics { activeEffects: number,
    totalParticles: number;
   , memoryUsage: number ,}

export class SeasonalParticleRenderer {
    private qualityController: QualityController | null;
    private errorHandler: ErrorHandler | null;
    private, activeSeasonalEffects: Map<string, SeasonalEffect>;
    private seasonalParticles: SeasonalParticle[];
    constructor(qualityController?: QualityController, errorHandler?: ErrorHandler) {
    
        this.qualityController = qualityController || null;
        this.errorHandler = errorHandler || null;
        this.activeSeasonalEffects = new Map<string, SeasonalEffect>();
    
    }
        this.seasonalParticles = []; }
    }
    
    /**
     * 季節限定バブル破壊エフェクトを作成
     * @param x - X座標
     * @param y - Y座標
     * @param bubbleType - バブルタイプ
     * @param bubbleSize - バブルサイズ
     * @param theme - アクティブテーマ
     */
    createSeasonalBubbleEffect(x: number, y: number, bubbleType: string, bubbleSize: number, theme: ThemeConfig | null): void { ''
        if(!theme) return;
        ';
        // エフェクト実行可否のチェック
        if(this.qualityController && !this.qualityController.canExecuteEffect('particle', 'normal) {
            
        }
            return; }
        }
        
        try { const effect = theme.effects.bubbleDestruction;
            const colors = theme.colors.primary;
            const particleTypes = theme.particles.types;
            
            this._createThemeSpecificEffect(x, y, effect, {)
                colors);
                particleTypes,);
                size: bubbleSize);
               , intensity: this._getEffectIntensity( ,});
            ';

        } catch (error) {
            if(this.errorHandler) {', ';

            }

                this.errorHandler.handleError(error as Error, 'SeasonalParticleRenderer.createSeasonalBubbleEffect); }'
}
    }
    
    /**
     * 季節限定コンボエフェクトを作成
     * @param x - X座標
     * @param y - Y座標
     * @param comboCount - コンボ数
     * @param theme - アクティブテーマ
     */'
    createSeasonalComboEffect(x: number, y: number, comboCount: number, theme: ThemeConfig | null): void { ''
        if(!theme) return;
        ';
        // コンボエフェクトは重要度が高い
        const priority = comboCount >= 10 ? 'critical' : 'important';''
        if(this.qualityController && !this.qualityController.canExecuteEffect('particle', priority) {
            
        }
            return; }
        }
        
        try { const effect = theme.effects.comboEffect || theme.effects.bubbleDestruction;
            const colors = theme.colors.accent || theme.colors.primary;
            const particleTypes = theme.particles.types;
            
            this._createThemeSpecificEffect(x, y, effect, {)
                colors,);
                particleTypes);
                intensity: Math.min(comboCount * 0.2, 2.0),
                particleCount: Math.min(comboCount * 3, 30 });
            ';

        } catch (error) {
            if(this.errorHandler) {', ';

            }

                this.errorHandler.handleError(error as Error, 'SeasonalParticleRenderer.createSeasonalComboEffect); }'
}
    }
    
    /**
     * テーマ固有エフェクトの作成
     * @param x - X座標
     * @param y - Y座標
     * @param effectType - エフェクトタイプ
     * @param config - 設定
     * @private
     */
    private _createThemeSpecificEffect(x: number, y: number, effectType: string, config: EffectConfig): void {
        const effectId = `seasonal_${Date.now(})_${Math.random(}.toString(36}.substr(2, 9})`;
        
        const effect: SeasonalEffect = { id: effectId,
            type: effectType;
            x: x;
            y: y;
            config: config;
            createdTime: performance.now();
           , particles: [] ,};
        ';
        // エフェクトタイプに応じたパーティクル生成
        switch(effectType) {'

            case 'flower_burst':'';
                this._createFlowerBurstEffect(effect);

                break;''
            case 'splash_burst':'';
                this._createSplashBurstEffect(effect);

                break;''
            case 'leaf_scatter':'';
                this._createLeafScatterEffect(effect);

                break;''
            case 'ice_shatter':'';
                this._createIceShatterEffect(effect);

                break;''
            case 'firework_burst':'';
                this._createFireworkBurstEffect(effect);

                break;''
            case 'heart_burst':'';
                this._createHeartBurstEffect(effect);

                break;''
            case 'spooky_burst':'';
                this._createSpookyBurstEffect(effect);

                break;''
            case 'christmas_burst':;
                this._createChristmasBurstEffect(effect);
                break;
        }
            default: this._createDefaultSeasonalEffect(effect); }
        }
        
        this.activeSeasonalEffects.set(effectId, effect);
    }
    
    /**
     * 花の爆発エフェクト（春）
     * @param effect - エフェクト
     * @private
     */
    private _createFlowerBurstEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(15 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random()';
               , type: 'cherry_blossom',);
                rotation: Math.random() * Math.PI * 2;
        ,}
                rotationSpeed: (Math.random() - 0.5) * 0.1 }
            });
        }
    }
    
    /**
     * 水しぶきエフェクト（夏）
     * @param effect - エフェクト
     * @private
     */
    private _createSplashBurstEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(20 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const velocity = 3 + Math.random() * 4;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 1, // 上向きの初速;
                size: 2 + Math.random(''';
                type: 'water_drop);
               , gravity: 0.15 ,}
                bounce: 0.3) }
            });
        }
    }
    
    /**
     * 葉っぱ散乱エフェクト（秋）
     * @param effect - エフェクト
     * @private
     */
    private _createLeafScatterEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(12 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1.5 + Math.random() * 2.5;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 4 + Math.random()';
               , type: 'maple_leaf',);
                rotation: Math.random() * Math.PI * 2;
               , rotationSpeed: (Math.random() - 0.5) * 0.15;
        ,}
                flutter: Math.random() * 0.1 }
            });
        }
    }
    
    /**
     * 氷の粉砕エフェクト（冬）
     * @param effect - エフェクト
     * @private
     */
    private _createIceShatterEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(18 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
            const velocity = 2.5 + Math.random() * 3.5;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 2 + Math.random()';
                type: 'ice_crystal');
               , sparkle: true, }
                sparkleIntensity: 0.5 + Math.random() * 0.5 }
            });
        }
    }
    
    /**
     * 花火エフェクト（新年）
     * @param effect - エフェクト
     * @private
     */
    private _createFireworkBurstEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(25 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 4 + Math.random() * 4;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random(''';
                type: 'firework';
                brightness: 1.0);
               , trail: true ,}
                trailLength: 5) }
            });
        }
    }
    
    /**
     * ハートエフェクト（バレンタイン）
     * @param effect - エフェクト
     * @private
     */
    private _createHeartBurstEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(12 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 1.5 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 0.5,
                size: 4 + Math.random(''';
                type: 'heart);
               , pulse: true ,}
                pulseSpeed: 0.1) }
            });
        }
    }
    
    /**
     * 不気味エフェクト（ハロウィン）
     * @param effect - エフェクト
     * @private
     */
    private _createSpookyBurstEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(10 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 5 + Math.random(''';
                type: 'ghost';
                opacity: 0.7);
               , wobble: true ,}
                wobbleAmplitude: 1) }
            });
        }
    }
    
    /**
     * クリスマスエフェクト
     * @param effect - エフェクト
     * @private
     */
    private _createChristmasBurstEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(16 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random(''';
                type: 'christmas_star);
               , twinkle: true ,}
                twinkleSpeed: 0.15) }
            });
        }
    }
    
    /**
     * デフォルト季節エフェクト
     * @param effect - エフェクト
     * @private
     */
    private _createDefaultSeasonalEffect(effect: SeasonalEffect): void { const particleCount = Math.floor(10 * this._getEffectIntensity();
        
        for(let, i = 0; i < particleCount; i++) {
        
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({)
                x: effect.x,);
                y: effect.y);
               , vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random(''
        ,})'
                type: 'default') }
            });
        }
    }
    
    /**
     * パーティクルの更新
     * @param deltaTime - 経過時間
     */
    updateParticles(deltaTime: number): void { this.activeSeasonalEffects.forEach((effect, effectId) => { 
            // 配列インデックスを逆順で処理してsplice時の問題を回避
            for(let, index = effect.particles.length - 1; index >= 0; index--) {
                const particle = effect.particles[index];
                
                // パーティクルの更新
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                
                // 重力効果
            }
                if (particle.gravity) { }
                    particle.vy += particle.gravity * deltaTime; }
                }
                
                // 回転効果
                if (particle.rotationSpeed && particle.rotation !== undefined) { particle.rotation += particle.rotationSpeed * deltaTime; }
                
                // 特殊効果
                this._updateSpecialEffects(particle, deltaTime);
                
                // ライフサイクル管理
                particle.life -= particle.decay * deltaTime;
                
                // 死んだパーティクルを除去
                if (particle.life <= 0) { effect.particles.splice(index, 1); }
            }
            
            // エフェクトが空になったら削除
            if (effect.particles.length === 0) { this.activeSeasonalEffects.delete(effectId); }
        });
    }
    
    /**
     * 特殊効果の更新
     * @param particle - パーティクル
     * @param deltaTime - 経過時間
     * @private
     */
    private _updateSpecialEffects(particle: SeasonalParticle, deltaTime: number): void { const time = performance.now() * 0.001;
        
        // パルス効果
        if(particle.pulse && particle.pulseSpeed) {
            
        }
            particle.currentSize = particle.size * (1 + Math.sin(time * particle.pulseSpeed) * 0.3); }
        }
        
        // 点滅効果
        if (particle.twinkle && particle.twinkleSpeed) { particle.alpha = 0.5 + Math.sin(time * particle.twinkleSpeed) * 0.5; }
        
        // 揺れ効果
        if (particle.wobble && particle.wobbleAmplitude) { particle.wobbleOffset = Math.sin(time * 2) * particle.wobbleAmplitude; }
    }
    
    /**
     * パーティクルの描画
     * @param context - 描画コンテキスト
     */
    renderParticles(context: CanvasRenderingContext2D): void { this.activeSeasonalEffects.forEach(effect => { )
            effect.particles.forEach(particle => {); }
                this._renderParticle(context, particle); }
            });
        });
    }
    
    /**
     * 個別パーティクルの描画
     * @param context - 描画コンテキスト
     * @param particle - パーティクル
     * @private
     */
    private _renderParticle(context: CanvasRenderingContext2D, particle: SeasonalParticle): void { context.save();
        
        const alpha = particle.alpha || particle.life;
        context.globalAlpha = alpha;
        
        const x = particle.x + (particle.wobbleOffset || 0);
        const y = particle.y;
        const size = particle.currentSize || particle.size;
        
        context.fillStyle = particle.color;
        context.translate(x, y);
        
        if(particle.rotation) {
        
            
        
        }
            context.rotate(particle.rotation); }
        }
        ;
        // パーティクルタイプ別描画
        switch(particle.type) {'

            case 'heart':'';
                this._drawHeart(context, size);

                break;''
            case 'star':'';
            case 'christmas_star':;
                this._drawStar(context, size);
                break;
            default:;
        ,}
                this._drawCircle(context, size); }
        }
        
        context.restore();
    }
    
    /**
     * ハート形状の描画
     * @param context - 描画コンテキスト
     * @param size - サイズ
     * @private
     */
    private _drawHeart(context: CanvasRenderingContext2D, size: number): void { const scale = size / 10;
        context.scale(scale, scale);
        
        context.beginPath();
        context.moveTo(0, 3);
        context.bezierCurveTo(-5, -2, -15, 2, 0, 15);
        context.bezierCurveTo(15, 2, 5, -2, 0, 3);
        context.fill(); }
    
    /**
     * 星形状の描画
     * @param context - 描画コンテキスト
     * @param size - サイズ
     * @private
     */
    private _drawStar(context: CanvasRenderingContext2D, size: number): void { const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        context.beginPath();
        for(let, i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius: innerRadius,
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
        }
                context.moveTo(x, y); }
            } else { context.lineTo(x, y); }
        }
        context.closePath();
        context.fill();
    }
    
    /**
     * 円形状の描画
     * @param context - 描画コンテキスト
     * @param size - サイズ
     * @private
     */
    private _drawCircle(context: CanvasRenderingContext2D, size: number): void { context.beginPath();
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.fill(); }
    
    /**
     * ランダムな色を取得
     * @param colors - 色配列
     * @returns 色
     * @private
     */
    private _getRandomColor(colors: string[]): string { return colors[Math.floor(Math.random() * colors.length)]; }
    
    /**
     * エフェクトの強度を取得
     * @returns 強度
     * @private
     */
    private _getEffectIntensity(): number { return this.qualityController ? this.qualityController.getParticleQualityMultiplier() : 1.0; }
    
    /**
     * エフェクトのクリア
     */
    clearAllEffects(): void { this.activeSeasonalEffects.clear();
        this.seasonalParticles.length = 0; }
    
    /**
     * エフェクト統計の取得
     * @returns 統計情報
     */
    getEffectStats(): EffectStatistics { let totalParticles = 0;
        this.activeSeasonalEffects.forEach(effect => { )
            totalParticles += effect.particles.length);
        
        return { activeEffects: this.activeSeasonalEffects.size }
            totalParticles: totalParticles, };
            memoryUsage: this._estimateMemoryUsage(); }
        }
    
    /**
     * メモリ使用量の推定
     * @returns メモリ使用量（バイト）
     * @private
     */
    private _estimateMemoryUsage(): number { let usage = 0;

        this.activeSeasonalEffects.forEach(effect => { ')'
            usage += effect.particles.length * 200; // パーティクル当たり約200バイト)); }
        return usage;''
}