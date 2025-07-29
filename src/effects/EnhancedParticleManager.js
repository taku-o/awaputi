import { ParticleManager } from './ParticleManager.js';
import { BubbleEffectRenderer } from './renderers/BubbleEffectRenderer.js';
import { ComboEffectRenderer } from './renderers/ComboEffectRenderer.js';
import { SpecialEffectRenderer } from './renderers/SpecialEffectRenderer.js';
import { SeasonalEffectRenderer } from './renderers/SeasonalEffectRenderer.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectQualityController } from './EffectQualityController.js';
import { getEffectPerformanceMonitor } from './EffectPerformanceMonitor.js';

/**
 * 強化されたパーティクル管理クラス
 * 既存のParticleManagerを拡張し、より多様で魅力的な視覚効果を実現
 */
export class EnhancedParticleManager extends ParticleManager {
    constructor() {
        super();
        
        // 品質コントローラーとパフォーマンス監視の取得
        this.qualityController = getEffectQualityController();
        this.performanceMonitor = getEffectPerformanceMonitor();
        
        // 拡張パーティクル設定（品質コントローラーに移行）
        this.qualitySettings = {
            low: { countMultiplier: 0.25, sizeMultiplier: 0.8, complexityLevel: 1 },
            medium: { countMultiplier: 0.5, sizeMultiplier: 0.9, complexityLevel: 2 },
            high: { countMultiplier: 1.0, sizeMultiplier: 1.0, complexityLevel: 3 },
            ultra: { countMultiplier: 1.5, sizeMultiplier: 1.2, complexityLevel: 4 }
        };
        
        // 現在の品質レベル（品質コントローラーから取得）
        this.currentQualityLevel = this.qualityController.getCurrentQualityLevel();
        
        // 背景パーティクル
        this.backgroundParticles = [];
        this.backgroundEnabled = false;
        this.backgroundDensity = 0.1;
        this.backgroundTheme = 'default';
        
        // エフェクトレンダラーの初期化
        this.bubbleRenderer = new BubbleEffectRenderer(this);
        this.comboRenderer = new ComboEffectRenderer(this);
        this.specialRenderer = new SpecialEffectRenderer(this);
        this.seasonalRenderer = new SeasonalEffectRenderer(this);
        
        // 拡張パーティクルタイプの定義
        this.extendedParticleTypes = {
            // 高度な基本パーティクル
            'advanced_circle': { renderMethod: 'renderAdvancedCircle', cost: 'low' },
            'glow_circle': { renderMethod: 'renderGlowCircle', cost: 'medium' },
            'trail_particle': { renderMethod: 'renderTrailParticle', cost: 'medium' },
            
            // カスタム形状
            'hexagon': { renderMethod: 'renderHexagon', cost: 'low' },
            'triangle': { renderMethod: 'renderTriangle', cost: 'low' },
            'cross': { renderMethod: 'renderCross', cost: 'low' },
            
            // 高級エフェクト
            'energy_orb': { renderMethod: 'renderEnergyOrb', cost: 'high' },
            'magic_sparkle': { renderMethod: 'renderMagicSparkle', cost: 'high' },
            'plasma_burst': { renderMethod: 'renderPlasmaBurst', cost: 'high' }
        };
        
        console.log('[EnhancedParticleManager] 初期化完了');
    }
    
    /**
     * 品質レベルを設定
     * @param {string} level - 品質レベル ('low', 'medium', 'high', 'ultra')
     */
    setQualityLevel(level) {
        if (this.qualitySettings[level]) {
            this.currentQualityLevel = level;
            const settings = this.qualitySettings[level];
            this.quality = settings.countMultiplier;
            
            console.log(`[EnhancedParticleManager] 品質レベル設定: ${level}`, settings);
        }
    }
    
    /**
     * 現在の品質設定を取得
     * @returns {Object} 品質設定
     */
    getCurrentQualitySettings() {
        // 品質コントローラーから最新の設定を取得
        this.currentQualityLevel = this.qualityController.getCurrentQualityLevel();
        return this.qualityController.getCurrentQualitySettings();
    }
    
    /**
     * 品質に基づいてパーティクル数を調整
     * @param {number} baseCount - 基本パーティクル数
     * @returns {number} 調整されたパーティクル数
     */
    adjustParticleCount(baseCount) {
        const settings = this.getCurrentQualitySettings();
        return Math.floor(baseCount * settings.countMultiplier);
    }
    
    /**
     * 高度なバブル破壊効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     * @param {Object} options - 追加オプション
     */
    createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {}) {
        if (!this.enabled) return;
        
        // エフェクト実行可否のチェック
        const priority = options.priority || 'normal';
        if (!this.qualityController.canExecuteEffect('particle', priority)) {
            return;
        }
        
        try {
            // BubbleEffectRendererに委譲
            this.bubbleRenderer.createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options);
            
            // エフェクトカウントの更新
            this.qualityController.updateEffectCount('particles', 1);
            
            // パフォーマンス統計の記録
            this.performanceMonitor.recordRenderStats('particle', 1);
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager.createAdvancedBubbleEffect'
            });
        }
    }
    
    /**
     * 強化されたコンボ効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     * @param {string} comboType - コンボタイプ
     */
    createEnhancedComboEffect(x, y, comboCount, comboType = 'normal') {
        if (!this.enabled) return;
        
        // コンボ効果は重要度が高いので優先度を高く設定
        const priority = comboCount >= 10 ? 'critical' : 'important';
        if (!this.qualityController.canExecuteEffect('particle', priority)) {
            return;
        }
        
        try {
            // ComboEffectRendererに委譲
            this.comboRenderer.createEnhancedComboEffect(x, y, comboCount, comboType);
            
            // エフェクトカウントの更新
            const particleCount = Math.min(comboCount * 2, 20); // 推定パーティクル数
            this.qualityController.updateEffectCount('particles', particleCount);
            
            // パフォーマンス統計の記録
            this.performanceMonitor.recordRenderStats('particle', particleCount);
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager.createEnhancedComboEffect'
            });
        }
    }
    
    /**
     * 特殊バブル効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - 効果タイプ
     * @param {number} intensity - 強度
     */
    createSpecialBubbleEffect(x, y, effectType, intensity = 1.0) {
        if (!this.enabled) return;
        
        try {
            // SpecialEffectRendererに委譲
            this.specialRenderer.createSpecialEffect(x, y, effectType, intensity);
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager.createSpecialBubbleEffect'
            });
        }
    }
    
    /**
     * 季節限定効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} seasonType - 季節タイプ
     * @param {string} eventType - イベントタイプ
     */
    createSeasonalEffect(x, y, seasonType, eventType = null) {
        if (!this.enabled) return;
        
        try {
            // SeasonalEffectRendererに委譲
            this.seasonalRenderer.createSeasonalEffect(x, y, seasonType, eventType);
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedParticleManager.createSeasonalEffect'
            });
        }
    }
    
    /**
     * 背景パーティクルを作成
     * @param {number} density - 密度 (0.0-1.0)
     * @param {string} theme - テーマ
     */
    createBackgroundParticles(density = 0.1, theme = 'default') {
        this.backgroundDensity = density;
        this.backgroundTheme = theme;
        this.backgroundEnabled = density > 0;
        
        if (!this.backgroundEnabled) {
            this.backgroundParticles = [];
            return;
        }
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const particleCount = Math.floor((canvas.width * canvas.height) / 10000 * density);
        const adjustedCount = this.adjustParticleCount(particleCount);
        
        this.backgroundParticles = [];
        
        for (let i = 0; i < adjustedCount; i++) {
            const particle = this.getParticleFromPool();
            
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
            particle.vx = (Math.random() - 0.5) * 20;
            particle.vy = (Math.random() - 0.5) * 20;
            particle.size = 1 + Math.random() * 2;
            particle.color = this.getBackgroundParticleColor(theme);
            particle.life = Infinity; // 永続
            particle.maxLife = Infinity;
            particle.alpha = 0.3 + Math.random() * 0.4;
            particle.type = 'background';
            particle.pulseSpeed = 1 + Math.random() * 2;
            
            this.backgroundParticles.push(particle);
        }
        
        console.log(`[EnhancedParticleManager] 背景パーティクル作成: ${adjustedCount}個`);
    }
    
    /**
     * 背景パーティクルの色を取得
     * @param {string} theme - テーマ
     * @returns {string} 色
     */
    getBackgroundParticleColor(theme) {
        const themeColors = {
            default: ['#E8F4FD', '#D4E7F7', '#C1DBF1'],
            spring: ['#FFE4E6', '#E8F5E8', '#F0F8E8'],
            summer: ['#FFF2CC', '#FFE4B5', '#E6F3FF'],
            autumn: ['#FFE4CC', '#E8D5B7', '#D2B48C'],
            winter: ['#E6F3FF', '#DDEEFF', '#CCE5FF'],
            night: ['#2C2C54', '#40407A', '#706FD3'],
            cosmic: ['#2F1B69', '#A29BFE', '#6C5CE7']
        };
        
        const colors = themeColors[theme] || themeColors.default;
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 背景パーティクルを更新
     * @param {number} deltaTime - 経過時間
     */
    updateBackgroundParticles(deltaTime) {
        if (!this.backgroundEnabled || !this.backgroundParticles.length) return;
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        this.backgroundParticles.forEach(particle => {
            // 位置更新
            particle.x += particle.vx * deltaSeconds;
            particle.y += particle.vy * deltaSeconds;
            
            // 境界での折り返し
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));
            }
            
            // パルス効果
            if (particle.pulseSpeed > 0) {
                const pulse = Math.sin(Date.now() * 0.001 * particle.pulseSpeed) * 0.2 + 0.8;
                particle.scale = pulse;
            }
        });
    }
    
    /**
     * 更新処理（既存の更新に背景パーティクル更新を追加）
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime) {
        // パフォーマンス監視の更新
        this.performanceMonitor.update(performance.now());
        
        // 親クラスの更新を実行
        super.update(deltaTime);
        
        // 背景パーティクルの更新
        this.updateBackgroundParticles(deltaTime);
        
        // 品質レベルの同期
        this.currentQualityLevel = this.qualityController.getCurrentQualityLevel();
    }
    
    /**
     * 高度なパーティクルレンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderAdvancedParticle(context, particle) {
        const settings = this.getCurrentQualitySettings();
        
        // 品質レベルに応じてレンダリング方法を選択
        if (settings.complexityLevel >= 3 && this.extendedParticleTypes[particle.type]) {
            const typeInfo = this.extendedParticleTypes[particle.type];
            
            // コストに応じて品質調整
            if (typeInfo.cost === 'high' && settings.complexityLevel < 4) {
                // 高コストエフェクトを簡略化
                this.renderSimplifiedParticle(context, particle);
            } else {
                // 指定されたレンダリングメソッドを実行
                if (this[typeInfo.renderMethod]) {
                    this[typeInfo.renderMethod](context, particle);
                } else {
                    // フォールバック
                    this.renderParticle(context, particle);
                }
            }
        } else {
            // 標準レンダリング
            this.renderParticle(context, particle);
        }
    }
    
    /**
     * 簡略化されたパーティクルレンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderSimplifiedParticle(context, particle) {
        // 複雑な効果を簡単な円に置き換え
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(0, 0, particle.size, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 高度な円レンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderAdvancedCircle(context, particle) {
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.7, particle.color + '80');
        gradient.addColorStop(1, particle.color + '00');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(0, 0, particle.size, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * グロー円レンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderGlowCircle(context, particle) {
        // 外側のグロー
        const glowGradient = context.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
        glowGradient.addColorStop(0, particle.color + '40');
        glowGradient.addColorStop(0.5, particle.color + '20');
        glowGradient.addColorStop(1, particle.color + '00');
        
        context.fillStyle = glowGradient;
        context.beginPath();
        context.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
        context.fill();
        
        // 内側のコア
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(0, 0, particle.size * 0.6, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * トレイルパーティクルレンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderTrailParticle(context, particle) {
        // トレイルの描画
        if (particle.trail && particle.trail.length > 1) {
            context.strokeStyle = particle.color;
            context.lineWidth = particle.size * 0.8;
            context.lineCap = 'round';
            context.globalCompositeOperation = 'screen';
            
            for (let i = 1; i < particle.trail.length; i++) {
                const alpha = (i / particle.trail.length) * particle.alpha * 0.6;
                context.globalAlpha = alpha;
                
                const curr = particle.trail[i];
                const prev = particle.trail[i - 1];
                
                context.beginPath();
                context.moveTo(prev.x - particle.x, prev.y - particle.y);
                context.lineTo(curr.x - particle.x, curr.y - particle.y);
                context.stroke();
            }
            
            context.globalCompositeOperation = 'source-over';
            context.globalAlpha = particle.alpha;
        }
        
        // メインパーティクルの描画
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(0, 0, particle.size, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 六角形レンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderHexagon(context, particle) {
        const sides = 6;
        const radius = particle.size;
        
        context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        context.lineWidth = 1;
        
        context.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * Math.PI * 2) / sides;
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
        context.stroke();
    }
    
    /**
     * 三角形レンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderTriangle(context, particle) {
        const size = particle.size;
        
        context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        context.lineWidth = 1;
        
        context.beginPath();
        context.moveTo(0, -size);
        context.lineTo(-size * 0.866, size * 0.5);
        context.lineTo(size * 0.866, size * 0.5);
        context.closePath();
        context.fill();
        context.stroke();
    }
    
    /**
     * 十字レンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderCross(context, particle) {
        const size = particle.size;
        const thickness = size * 0.3;
        
        context.fillStyle = particle.color;
        
        // 縦線
        context.fillRect(-thickness / 2, -size, thickness, size * 2);
        // 横線
        context.fillRect(-size, -thickness / 2, size * 2, thickness);
    }
    
    /**
     * エネルギーオーブレンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderEnergyOrb(context, particle) {
        const time = Date.now() * 0.01;
        const pulseIntensity = Math.sin(time * particle.pulseSpeed) * 0.3 + 0.7;
        const currentSize = particle.size * pulseIntensity;
        
        // 外側のエネルギー層
        const outerGradient = context.createRadialGradient(0, 0, 0, 0, 0, currentSize * 1.5);
        outerGradient.addColorStop(0, particle.color + 'AA');
        outerGradient.addColorStop(0.5, particle.color + '44');
        outerGradient.addColorStop(1, particle.color + '00');
        
        context.fillStyle = outerGradient;
        context.beginPath();
        context.arc(0, 0, currentSize * 1.5, 0, Math.PI * 2);
        context.fill();
        
        // 中間層
        const middleGradient = context.createRadialGradient(0, 0, 0, 0, 0, currentSize);
        middleGradient.addColorStop(0, particle.color + 'FF');
        middleGradient.addColorStop(0.7, particle.color + '88');
        middleGradient.addColorStop(1, particle.color + '00');
        
        context.fillStyle = middleGradient;
        context.beginPath();
        context.arc(0, 0, currentSize, 0, Math.PI * 2);
        context.fill();
        
        // コア
        context.fillStyle = '#FFFFFF';
        context.globalAlpha = particle.alpha * 0.8;
        context.beginPath();
        context.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = particle.alpha;
    }
    
    /**
     * 魔法の輝きレンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderMagicSparkle(context, particle) {
        const time = Date.now() * 0.001;
        const twinkle = Math.sin(time * particle.pulseSpeed * 4) * 0.5 + 0.5;
        
        // 中心の輝き
        const sparkleGradient = context.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        sparkleGradient.addColorStop(0, '#FFFFFF');
        sparkleGradient.addColorStop(0.3, particle.color);
        sparkleGradient.addColorStop(1, particle.color + '00');
        
        context.fillStyle = sparkleGradient;
        context.globalAlpha = particle.alpha * twinkle;
        context.beginPath();
        context.arc(0, 0, particle.size, 0, Math.PI * 2);
        context.fill();
        
        // 十字の光線
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1;
        context.globalAlpha = particle.alpha * twinkle * 0.8;
        
        const rayLength = particle.size * 1.5;
        context.beginPath();
        context.moveTo(-rayLength, 0);
        context.lineTo(rayLength, 0);
        context.moveTo(0, -rayLength);
        context.lineTo(0, rayLength);
        context.stroke();
        
        context.globalAlpha = particle.alpha;
    }
    
    /**
     * プラズマバーストレンダリング
     * @param {CanvasRenderingContext2D} context - コンテキスト
     * @param {Object} particle - パーティクル
     */
    renderPlasmaBurst(context, particle) {
        const time = Date.now() * 0.001;
        const chaos = Math.sin(time * 10) * 0.3 + Math.cos(time * 7) * 0.2;
        
        // 不規則な形状を生成
        const segments = 8;
        const baseRadius = particle.size;
        
        context.fillStyle = particle.color;
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1;
        
        context.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = (i * Math.PI * 2) / segments;
            const radiusVariation = 0.7 + Math.sin(angle * 3 + time * 5) * 0.3;
            const radius = baseRadius * radiusVariation * (1 + chaos);
            
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
        context.stroke();
        
        // 内部のエネルギーコア
        const coreGradient = context.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.5);
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(1, particle.color + '44');
        
        context.fillStyle = coreGradient;
        context.beginPath();
        context.arc(0, 0, baseRadius * 0.5, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * 描画処理（背景パーティクルを含む）
     * @param {CanvasRenderingContext2D} context - コンテキスト
     */
    render(context) {
        // 背景パーティクルの描画
        if (this.backgroundEnabled && this.backgroundParticles.length > 0) {
            context.save();
            this.backgroundParticles.forEach(particle => {
                if (!particle.isActive) return;
                
                context.save();
                context.globalAlpha = particle.alpha;
                context.translate(particle.x, particle.y);
                
                if (particle.scale !== 1) {
                    context.scale(particle.scale, particle.scale);
                }
                
                this.renderAdvancedParticle(context, particle);
                context.restore();
            });
            context.restore();
        }
        
        // 通常のパーティクル描画（親クラスのメソッドを使用）
        super.render(context);
    }
    
    /**
     * エフェクトが特定の品質レベル以上でのみ表示されるかチェック
     * @param {string} effectType - エフェクトタイプ
     * @param {number} priority - 優先度 (1-10)
     * @returns {boolean} 表示するかどうか
     */
    shouldRenderEffect(effectType, priority = 5) {
        const settings = this.getCurrentQualitySettings();
        
        // 品質レベルに応じて表示判定
        if (settings.complexityLevel === 1) {
            // Low quality - 高優先度のみ
            return priority >= 8;
        } else if (settings.complexityLevel === 2) {
            // Medium quality - 中優先度以上
            return priority >= 5;
        } else {
            // High/Ultra quality - 全て表示
            return true;
        }
    }
    
    /**
     * パーティクル数の乗数を取得
     * @returns {number} 乗数
     */
    getParticleCountMultiplier() {
        return this.getCurrentQualitySettings().countMultiplier;
    }
    
    /**
     * エフェクト強度の乗数を取得
     * @returns {number} 乗数
     */
    getEffectIntensityMultiplier() {
        return this.getCurrentQualitySettings().sizeMultiplier;
    }
    
    /**
     * 使用していないリソースをクリーンアップ
     */
    cleanupUnusedResources() {
        // 背景パーティクルのクリーンアップ
        if (!this.backgroundEnabled) {
            this.backgroundParticles.forEach(particle => {
                this.returnParticleToPool(particle);
            });
            this.backgroundParticles = [];
        }
        
        // 親クラスのクリーンアップ
        super.clear();
        
        console.log('[EnhancedParticleManager] 未使用リソースをクリーンアップしました');
    }
    
    /**
     * メモリ使用量を最適化
     */
    optimizeMemoryUsage() {
        const settings = this.getCurrentQualitySettings();
        
        // 品質に応じてパーティクル数を制限
        const maxAllowedParticles = Math.floor(this.maxParticles * settings.countMultiplier);
        
        if (this.particles.length > maxAllowedParticles) {
            const excessCount = this.particles.length - maxAllowedParticles;
            for (let i = 0; i < excessCount; i++) {
                const particle = this.particles.shift();
                this.returnParticleToPool(particle);
            }
        }
        
        console.log(`[EnhancedParticleManager] メモリ使用量を最適化: ${this.particles.length}/${maxAllowedParticles}`);
    }
    
    /**
     * パフォーマンス統計を取得（拡張版）
     * @returns {Object} 拡張パフォーマンス統計
     */
    getPerformanceStats() {
        const baseStats = super.getPerformanceStats();
        const settings = this.getCurrentQualitySettings();
        
        return {
            ...baseStats,
            qualityLevel: this.currentQualityLevel,
            complexityLevel: settings.complexityLevel,
            backgroundParticles: this.backgroundParticles.length,
            backgroundEnabled: this.backgroundEnabled,
            effectRenderers: {
                bubbleRenderer: !!this.bubbleRenderer,
                comboRenderer: !!this.comboRenderer,
                specialRenderer: !!this.specialRenderer,
                seasonalRenderer: !!this.seasonalRenderer
            }
        };
    }
    
    /**
     * 全パーティクルをクリア（背景パーティクルを含む）
     */
    clear() {
        // 背景パーティクルのクリア
        this.backgroundParticles.forEach(particle => {
            this.returnParticleToPool(particle);
        });
        this.backgroundParticles = [];
        
        // 親クラスのクリア
        super.clear();
    }
}