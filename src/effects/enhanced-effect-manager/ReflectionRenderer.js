import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Reflection Renderer
 * 反射効果レンダラー - 水面、鏡面、バブル反射処理
 */
export class ReflectionRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.errorHandler = getErrorHandler();
    }
    
    /**
     * 反射をレンダリング
     */
    renderReflections(context, reflectionSurfaces, renderSettings) {
        try {
            if (reflectionSurfaces.length === 0) return;
            
            // 品質に基づいて反射レンダリングを調整
            if (renderSettings.qualityLevel === 'low') {
                return; // 低品質では反射を描画しない
            }
            
            reflectionSurfaces.forEach(surface => {
                if (!surface.enabled) return;
                
                // 反射面のタイプに基づいて処理
                switch (surface.surface.type) {
                    case 'water':
                        this.renderWaterReflection(context, surface);
                        break;
                    case 'mirror':
                        this.renderMirrorReflection(context, surface);
                        break;
                    case 'bubble':
                        this.renderBubbleReflection(context, surface, renderSettings);
                        break;
                    default:
                        this.renderGenericReflection(context, surface);
                        break;
                }
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderReflections'
            });
        }
    }
    
    /**
     * 水面反射をレンダリング
     */
    renderWaterReflection(context, surface) {
        try {
            const waterLevel = surface.surface.y;
            const reflectivity = surface.reflectivity;
            
            context.save();
            context.globalAlpha = reflectivity * 0.6;
            context.globalCompositeOperation = 'multiply';
            
            // クリッピング領域を設定
            context.beginPath();
            context.rect(0, waterLevel, this.canvas.width, this.canvas.height - waterLevel);
            context.clip();
            
            // 反射変換
            context.scale(1, -1);
            context.translate(0, -waterLevel * 2);
            
            // 波紋効果
            const time = Date.now() * 0.001;
            const waveOffset = Math.sin(time * 2) * 2;
            context.translate(waveOffset, 0);
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderWaterReflection'
            });
        }
    }
    
    /**
     * 鏡面反射をレンダリング
     */
    renderMirrorReflection(context, surface) {
        try {
            const mirror = surface.surface;
            const reflectivity = surface.reflectivity;
            
            context.save();
            context.globalAlpha = reflectivity;
            context.globalCompositeOperation = 'screen';
            
            // 鏡面の角度に基づいた反射変換
            const angle = mirror.angle || 0;
            const centerX = mirror.x + mirror.width / 2;
            const centerY = mirror.y + mirror.height / 2;
            
            context.translate(centerX, centerY);
            context.rotate(angle);
            context.scale(1, -1);
            context.rotate(-angle);
            context.translate(-centerX, -centerY);
            
            // 反射領域のクリッピング
            context.beginPath();
            context.rect(mirror.x, mirror.y, mirror.width, mirror.height);
            context.clip();
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderMirrorReflection'
            });
        }
    }
    
    /**
     * バブル反射をレンダリング
     */
    renderBubbleReflection(context, surface, renderSettings) {
        try {
            const bubble = surface.surface;
            const reflectivity = surface.reflectivity;
            
            if (!bubble.x || !bubble.y || !bubble.size) return;
            
            context.save();
            
            // バブルの光沢効果
            this.renderBubbleGloss(context, bubble, reflectivity);
            
            // 環境反射
            if (renderSettings.qualityLevel === 'ultra' || renderSettings.qualityLevel === 'high') {
                this.renderBubbleEnvironmentReflection(context, bubble, reflectivity, []);
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderBubbleReflection'
            });
        }
    }
    
    /**
     * バブルの光沢効果
     */
    renderBubbleGloss(context, bubble, reflectivity) {
        try {
            const radius = bubble.size || 20;
            const glossSize = radius * 0.3;
            const glossX = bubble.x - radius * 0.2;
            const glossY = bubble.y - radius * 0.3;
            
            // 主要な光沢
            const gradient = context.createRadialGradient(
                glossX, glossY, 0,
                glossX, glossY, glossSize
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${reflectivity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${reflectivity * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.globalCompositeOperation = 'screen';
            context.beginPath();
            context.arc(glossX, glossY, glossSize, 0, Math.PI * 2);
            context.fill();
            
            // 二次光沢
            const secondaryGlossSize = radius * 0.15;
            const secondaryGlossX = bubble.x + radius * 0.3;
            const secondaryGlossY = bubble.y + radius * 0.1;
            
            const secondaryGradient = context.createRadialGradient(
                secondaryGlossX, secondaryGlossY, 0,
                secondaryGlossX, secondaryGlossY, secondaryGlossSize
            );
            secondaryGradient.addColorStop(0, `rgba(255, 255, 255, ${reflectivity * 0.4})`);
            secondaryGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = secondaryGradient;
            context.beginPath();
            context.arc(secondaryGlossX, secondaryGlossY, secondaryGlossSize, 0, Math.PI * 2);
            context.fill();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderBubbleGloss'
            });
        }
    }
    
    /**
     * バブルの環境反射
     */
    renderBubbleEnvironmentReflection(context, bubble, reflectivity, lightSources) {
        try {
            const radius = bubble.size || 20;
            
            // バブル表面での環境光反射
            lightSources.forEach(light => {
                if (!light.enabled) return;
                
                const dx = light.x - bubble.x;
                const dy = light.y - bubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > light.radius + radius) return;
                
                // 反射点の計算
                const reflectionAngle = Math.atan2(dy, dx);
                const reflectionX = bubble.x + Math.cos(reflectionAngle) * radius * 0.8;
                const reflectionY = bubble.y + Math.sin(reflectionAngle) * radius * 0.8;
                
                // 光源からの反射光
                const intensity = (light.currentIntensity || light.intensity) * reflectivity;
                const lightInfluence = Math.max(0, 1 - distance / light.radius);
                
                const reflectionGradient = context.createRadialGradient(
                    reflectionX, reflectionY, 0,
                    reflectionX, reflectionY, radius * 0.4
                );
                
                const alpha = intensity * lightInfluence * 0.3;
                reflectionGradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha})`);
                reflectionGradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
                
                context.fillStyle = reflectionGradient;
                context.globalCompositeOperation = 'screen';
                context.beginPath();
                context.arc(reflectionX, reflectionY, radius * 0.4, 0, Math.PI * 2);
                context.fill();
            });
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderBubbleEnvironmentReflection'
            });
        }
    }
    
    /**
     * 汎用反射をレンダリング
     */
    renderGenericReflection(context, surface) {
        try {
            context.save();
            context.globalAlpha = surface.reflectivity;
            context.globalCompositeOperation = 'multiply';
            
            // ぼかし効果
            if (surface.blur > 0) {
                context.filter = `blur(${surface.blur}px)`;
            }
            
            // 簡単な反射効果
            const obj = surface.surface;
            if (obj.x !== undefined && obj.y !== undefined) {
                const gradient = context.createRadialGradient(
                    obj.x, obj.y, 0,
                    obj.x, obj.y, 50
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                context.fillStyle = gradient;
                context.beginPath();
                context.arc(obj.x, obj.y, 50, 0, Math.PI * 2);
                context.fill();
            }
            
            context.restore();
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderGenericReflection'
            });
        }
    }
    
    /**
     * バブル表面の光沢とリフレクションを統合描画
     */
    renderBubbleCompleteReflectionSystem(context, bubble, renderSettings) {
        try {
            if (!renderSettings.enableReflections || renderSettings.qualityLevel === 'low') {
                return;
            }
            
            // バブル反射面を自動追加
            const reflectionSurface = {
                surface: { ...bubble, type: 'bubble' },
                reflectivity: 0.7,
                blur: 0,
                enabled: true
            };
            
            this.renderBubbleReflection(context, reflectionSurface, renderSettings);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ReflectionRenderer.renderBubbleCompleteReflectionSystem'
            });
        }
    }
}