import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Background Effect Renderer
 * 背景効果レンダラー - パーティクル、天候、環境効果処理
 */
export class BackgroundEffectRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * 背景効果をレンダリング
     */
    renderBackgroundEffects(context, backgroundEffects) {
        try {
            backgroundEffects.forEach(effect => {
                if (!effect.enabled) return;
                
                switch (effect.effectType) {
                    case 'particles':
                        this.renderParticleBackground(context, effect);
                        break;
                    case 'rain':
                        this.renderRainEffect(context, effect);
                        break;
                    case 'snow':
                        this.renderSnowEffect(context, effect);
                        break;
                    case 'fog':
                        this.renderFogEffect(context, effect);
                        break;
                    case 'stars':
                        this.renderStarsEffect(context, effect);
                        break;
                }
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.renderBackgroundEffects'
            });
        }
    }
    
    /**
     * パーティクル背景をレンダリング
     */
    renderParticleBackground(context, effect) {
        try {
            const particleCount = Math.floor(effect.intensity * effect.options.density * 50);
            const time = Date.now() * 0.001;
            
            context.save();
            context.globalAlpha = effect.options.opacity;
            context.fillStyle = effect.options.color;
            
            for (let i = 0; i < particleCount; i++) {
                const x = (i * 123.456 + time * effect.options.speed * 10) % this.canvas.width;
                const y = (i * 78.9 + time * effect.options.speed * 5) % this.canvas.height;
                const size = effect.options.size * (0.5 + Math.sin(i + time) * 0.5);
                
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.renderParticleBackground'
            });
        }
    }
    
    /**
     * 雨効果をレンダリング
     */
    renderRainEffect(context, effect) {
        try {
            const dropCount = Math.floor(effect.intensity * 100);
            const time = Date.now() * 0.001;
            
            context.save();
            context.globalAlpha = 0.7;
            context.strokeStyle = effect.options.color;
            context.lineWidth = 1;
            
            for (let i = 0; i < dropCount; i++) {
                const x = (i * 73.2 + time * effect.options.speed * 200) % (this.canvas.width + 100);
                const y = (i * 41.7 + time * effect.options.speed * 300) % (this.canvas.height + 100);
                const length = 10 + Math.sin(i) * 5;
                
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x - length * 0.3, y + length);
                context.stroke();
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.renderRainEffect'
            });
        }
    }
    
    /**
     * 雪効果をレンダリング
     */
    renderSnowEffect(context, effect) {
        try {
            const flakeCount = Math.floor(effect.intensity * 50);
            const time = Date.now() * 0.001;
            
            context.save();
            context.globalAlpha = 0.8;
            context.fillStyle = effect.options.color;
            
            for (let i = 0; i < flakeCount; i++) {
                const x = (i * 91.3 + time * effect.options.speed * 20 + Math.sin(time + i) * 20) % this.canvas.width;
                const y = (i * 67.1 + time * effect.options.speed * 50) % (this.canvas.height + 20);
                const size = 2 + Math.sin(i) * 2;
                
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.renderSnowEffect'
            });
        }
    }
    
    /**
     * 霧効果をレンダリング
     */
    renderFogEffect(context, effect) {
        try {
            context.save();
            context.globalAlpha = effect.options.opacity * effect.intensity;
            context.fillStyle = effect.options.color;
            context.globalCompositeOperation = 'multiply';
            
            // 簡単な霧効果
            const gradient = context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, `rgba(200, 200, 200, ${effect.intensity * 0.1})`);
            gradient.addColorStop(0.5, `rgba(200, 200, 200, ${effect.intensity * 0.3})`);
            gradient.addColorStop(1, `rgba(200, 200, 200, ${effect.intensity * 0.1})`);
            
            context.fillStyle = gradient;
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.renderFogEffect'
            });
        }
    }
    
    /**
     * 星効果をレンダリング
     */
    renderStarsEffect(context, effect) {
        try {
            const starCount = Math.floor(effect.intensity * 100);
            const time = Date.now() * 0.001;
            
            context.save();
            context.fillStyle = effect.options.color;
            
            for (let i = 0; i < starCount; i++) {
                const x = (i * 113.7) % this.canvas.width;
                const y = (i * 89.3) % this.canvas.height;
                const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;
                const size = effect.options.size * twinkle;
                
                context.globalAlpha = effect.options.opacity * twinkle;
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.renderStarsEffect'
            });
        }
    }
    
    /**
     * 個別背景効果の更新
     */
    updateBackgroundEffect(effect, deltaTime) {
        try {
            switch (effect.effectType) {
                case 'particles':
                    // パーティクル位置更新などの処理
                    break;
                case 'rain':
                case 'snow':
                    // 天候エフェクトの更新
                    break;
                case 'fog':
                case 'clouds':
                    // 雲・霧エフェクトの更新
                    break;
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BackgroundEffectRenderer.updateBackgroundEffect'
            });
        }
    }
}