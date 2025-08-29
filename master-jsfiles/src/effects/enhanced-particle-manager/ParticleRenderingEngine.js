import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Particle Rendering Engine
 * パーティクル描画処理エンジン - レンダリングメソッドと描画最適化
 */
export class ParticleRenderingEngine {
    constructor(canvas, particleManager) {
        this.canvas = canvas;
        this.particleManager = particleManager;
        this.errorHandler = getErrorHandler();
        
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
        
        // レンダリング設定
        this.renderingSettings = {
            batchRendering: false,
            antiAliasing: true,
            shadowQuality: 'medium',
            textureFiltering: 'linear'
        };
        
        console.log('[ParticleRenderingEngine] パーティクルレンダリングエンジンを初期化しました');
    }
    
    /**
     * パーティクルを描画
     */
    renderParticle(context, particle) {
        try {
            if (!particle || !particle.active) return;
            
            const particleType = this.extendedParticleTypes[particle.type];
            if (particleType && this[particleType.renderMethod]) {
                this[particleType.renderMethod](context, particle);
            } else {
                // フォールバック: 基本描画
                this.renderBasicParticle(context, particle);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderParticle'
            });
        }
    }
    
    /**
     * 基本パーティクル描画
     */
    renderBasicParticle(context, particle) {
        try {
            context.save();
            
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = particle.color || '#ffffff';
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderBasicParticle'
            });
        }
    }
    
    /**
     * 高度な円形パーティクル描画
     */
    renderAdvancedCircle(context, particle) {
        try {
            context.save();
            
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = particle.color || '#ffffff';
            
            // グラデーション効果
            if (particle.gradient) {
                const gradient = context.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                context.fillStyle = gradient;
            }
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderAdvancedCircle'
            });
        }
    }
    
    /**
     * 光るパーティクル描画
     */
    renderGlowCircle(context, particle) {
        try {
            context.save();
            
            const glowSize = (particle.size || 2) * 2;
            const gradient = context.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, glowSize
            );
            
            gradient.addColorStop(0, particle.color || '#ffffff');
            gradient.addColorStop(0.5, `${particle.color || '#ffffff'}80`);
            gradient.addColorStop(1, 'transparent');
            
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = gradient;
            
            context.beginPath();
            context.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderGlowCircle'
            });
        }
    }
    
    /**
     * 軌跡付きパーティクル描画
     */
    renderTrailParticle(context, particle) {
        try {
            context.save();
            
            // 軌跡描画
            if (particle.trail && particle.trail.length > 1) {
                context.strokeStyle = `${particle.color || '#ffffff'}40`;
                context.lineWidth = (particle.size || 2) * 0.5;
                context.lineCap = 'round';
                
                context.beginPath();
                context.moveTo(particle.trail[0].x, particle.trail[0].y);
                
                for (let i = 1; i < particle.trail.length; i++) {
                    const alpha = i / particle.trail.length;
                    context.globalAlpha = alpha * (particle.alpha || 1.0);
                    context.lineTo(particle.trail[i].x, particle.trail[i].y);
                }
                
                context.stroke();
            }
            
            // メインパーティクル描画
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = particle.color || '#ffffff';
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderTrailParticle'
            });
        }
    }
    
    /**
     * 六角形パーティクル描画
     */
    renderHexagon(context, particle) {
        try {
            context.save();
            
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = particle.color || '#ffffff';
            
            const size = particle.size || 2;
            const x = particle.x;
            const y = particle.y;
            
            context.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                
                if (i === 0) {
                    context.moveTo(px, py);
                } else {
                    context.lineTo(px, py);
                }
            }
            context.closePath();
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderHexagon'
            });
        }
    }
    
    /**
     * 三角形パーティクル描画
     */
    renderTriangle(context, particle) {
        try {
            context.save();
            
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = particle.color || '#ffffff';
            
            const size = particle.size || 2;
            const x = particle.x;
            const y = particle.y;
            const rotation = particle.rotation || 0;
            
            context.translate(x, y);
            context.rotate(rotation);
            
            context.beginPath();
            context.moveTo(0, -size);
            context.lineTo(-size * 0.866, size * 0.5);
            context.lineTo(size * 0.866, size * 0.5);
            context.closePath();
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderTriangle'
            });
        }
    }
    
    /**
     * 十字パーティクル描画
     */
    renderCross(context, particle) {
        try {
            context.save();
            
            context.globalAlpha = particle.alpha || 1.0;
            context.strokeStyle = particle.color || '#ffffff';
            context.lineWidth = Math.max(1, (particle.size || 2) * 0.2);
            context.lineCap = 'round';
            
            const size = particle.size || 2;
            const x = particle.x;
            const y = particle.y;
            
            // 縦線
            context.beginPath();
            context.moveTo(x, y - size);
            context.lineTo(x, y + size);
            context.stroke();
            
            // 横線
            context.beginPath();
            context.moveTo(x - size, y);
            context.lineTo(x + size, y);
            context.stroke();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderCross'
            });
        }
    }
    
    /**
     * エネルギーオーブ描画
     */
    renderEnergyOrb(context, particle) {
        try {
            context.save();
            
            const time = Date.now() * 0.001;
            const pulsation = 1 + Math.sin(time * 3 + particle.x * 0.01) * 0.3;
            const glowSize = (particle.size || 2) * pulsation * 3;
            
            // 外側の光
            const outerGradient = context.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, glowSize
            );
            outerGradient.addColorStop(0, `${particle.color || '#00ffff'}80`);
            outerGradient.addColorStop(0.7, `${particle.color || '#00ffff'}20`);
            outerGradient.addColorStop(1, 'transparent');
            
            context.globalAlpha = particle.alpha || 1.0;
            context.fillStyle = outerGradient;
            
            context.beginPath();
            context.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
            context.fill();
            
            // 内側のコア
            const coreGradient = context.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * pulsation
            );
            coreGradient.addColorStop(0, '#ffffff');
            coreGradient.addColorStop(0.8, particle.color || '#00ffff');
            coreGradient.addColorStop(1, 'transparent');
            
            context.fillStyle = coreGradient;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size * pulsation, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticleRenderingEngine.renderEnergyOrb'
            });
        }
    }
    
    /**
     * バッチ描画を有効化
     */
    enableBatchRendering() {
        this.renderingSettings.batchRendering = true;
        console.log('[ParticleRenderingEngine] バッチ描画を有効化しました');
    }
    
    /**
     * レンダリング設定を更新
     */
    updateRenderingSettings(newSettings) {
        this.renderingSettings = { ...this.renderingSettings, ...newSettings };
        console.log('[ParticleRenderingEngine] レンダリング設定を更新しました');
    }
}