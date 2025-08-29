import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Lighting System Renderer
 * 光源効果システム - 動的光源、影、反射レンダリング処理
 */
export class LightingSystemRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * 光源効果をレンダリング
     */
    renderLighting(context, lightSources) {
        try {
            if (lightSources.length === 0) return;
            
            // 光源に基づいた照明効果を描画
            lightSources.forEach(light => {
                if (!light.enabled) return;
                
                context.save();
                
                // 放射状グラデーション
                const gradient = context.createRadialGradient(
                    light.x, light.y, 0,
                    light.x, light.y, light.radius
                );
                
                const intensity = light.currentIntensity || light.intensity;
                const alpha = Math.min(intensity, 1.0);
                
                gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
                
                context.globalCompositeOperation = 'screen';
                context.fillStyle = gradient;
                context.fillRect(
                    light.x - light.radius,
                    light.y - light.radius,
                    light.radius * 2,
                    light.radius * 2
                );
                
                context.restore();
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'LightingSystemRenderer.renderLighting'
            });
        }
    }
    
    /**
     * 基本的な影レンダリング
     */
    renderBasicShadows(context, shadowCasters, lightSources) {
        try {
            shadowCasters.forEach(caster => {
                if (!caster.enabled) return;
                
                lightSources.forEach(light => {
                    if (!light.enabled || !light.castShadows) return;
                    
                    // 影の方向を計算
                    const dx = caster.object.x - light.x;
                    const dy = caster.object.y - light.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > light.radius) return;
                    
                    const shadowLength = 100 * (1 - distance / light.radius);
                    const shadowX = caster.object.x + (dx / distance) * shadowLength;
                    const shadowY = caster.object.y + (dy / distance) * shadowLength;
                    
                    context.save();
                    context.globalAlpha = caster.opacity * (1 - distance / light.radius);
                    
                    // 影のソフトネス
                    if (caster.shadowType === 'soft') {
                        context.filter = `blur(${caster.blur}px)`;
                    }
                    
                    context.fillStyle = '#000000';
                    context.globalCompositeOperation = 'multiply';
                    
                    // 対象オブジェクトの形状に基づいた影
                    this.renderObjectShadow(context, caster.object, shadowX, shadowY, dx / distance, dy / distance);
                    
                    context.restore();
                });
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'LightingSystemRenderer.renderBasicShadows'
            });
        }
    }
    
    /**
     * 高度な影レンダリング
     */
    renderAdvancedShadows(context, shadowCasters, lightSources) {
        try {
            // バブル専用の影レンダリング
            shadowCasters.forEach(caster => {
                if (!caster.enabled) return;
                
                lightSources.forEach(light => {
                    if (!light.enabled || !light.castShadows) return;
                    
                    const dx = caster.object.x - light.x;
                    const dy = caster.object.y - light.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > light.radius) return;
                    
                    // 高品質バブル影
                    this.renderBubbleShadow(context, caster.object, light, distance);
                });
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'LightingSystemRenderer.renderAdvancedShadows'
            });
        }
    }
    
    /**
     * オブジェクトの形状に基づいた影を描画
     */
    renderObjectShadow(context, object, shadowX, shadowY, dirX, dirY) {
        try {
            if (object.type === 'bubble') {
                // バブル用の楕円影
                const radius = object.size || 20;
                const scaleX = 1 + Math.abs(dirX) * 0.5;
                const scaleY = 0.3 + Math.abs(dirY) * 0.3;
                
                context.save();
                context.translate(shadowX, shadowY + radius * 0.8);
                context.scale(scaleX, scaleY);
                
                context.beginPath();
                context.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
                context.fill();
                
                context.restore();
            } else {
                // 一般的な円形影
                context.beginPath();
                context.arc(shadowX, shadowY, 15, 0, Math.PI * 2);
                context.fill();
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'LightingSystemRenderer.renderObjectShadow'
            });
        }
    }
    
    /**
     * バブル専用の高品質影
     */
    renderBubbleShadow(context, bubble, light, distance) {
        try {
            const radius = bubble.size || 20;
            const intensity = light.currentIntensity || light.intensity;
            const shadowOpacity = 0.6 * intensity * (1 - distance / light.radius);
            
            if (shadowOpacity < 0.1) return;
            
            // 影の位置計算
            const lightAngle = Math.atan2(bubble.y - light.y, bubble.x - light.x);
            const shadowDistance = radius * 2.5;
            const shadowX = bubble.x + Math.cos(lightAngle) * shadowDistance;
            const shadowY = bubble.y + Math.sin(lightAngle) * shadowDistance + radius * 0.5;
            
            context.save();
            context.globalAlpha = shadowOpacity;
            context.globalCompositeOperation = 'multiply';
            
            // グラデーション影
            const gradient = context.createRadialGradient(
                shadowX, shadowY, 0,
                shadowX, shadowY, radius * 1.2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            context.fillStyle = gradient;
            
            // 楕円形の影
            context.save();
            context.translate(shadowX, shadowY);
            context.scale(1, 0.4);
            context.beginPath();
            context.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
            context.fill();
            context.restore();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'LightingSystemRenderer.renderBubbleShadow'
            });
        }
    }
}