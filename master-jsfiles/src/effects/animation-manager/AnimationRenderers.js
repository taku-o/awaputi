/**
 * Animation Renderers
 * アニメーションレンダリング処理 - 各種エフェクトの描画処理
 */

/**
 * Loading Animation Renderer
 * ローディングアニメーション描画
 */
export class LoadingAnimationRenderer {
    /**
     * ローディングアニメーションをレンダリング
     */
    static renderLoadingAnimation(context, animation) {
        const pos = animation.position;
        const size = animation.size;
        const options = animation.options;
        
        context.save();
        context.strokeStyle = options.color;
        context.lineWidth = options.thickness;
        context.lineCap = 'round';
        
        switch (animation.loadingType) {
            case 'spinner':
                this.renderSpinner(context, pos, size, animation.rotation, options);
                break;
            case 'dots':
                this.renderDots(context, pos, size, animation.dotPhases, options);
                break;
            case 'pulse':
                this.renderPulse(context, pos, size, animation.phase, options);
                break;
            case 'wave':
                this.renderWave(context, pos, size, animation.waveOffset, options);
                break;
            case 'progress':
                this.renderProgress(context, pos, size, options);
                break;
        }
        
        context.restore();
    }
    
    /**
     * スピナーをレンダリング
     */
    static renderSpinner(context, pos, size, rotation, options) {
        context.translate(pos.x, pos.y);
        context.rotate(rotation);
        
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const alpha = (i + 1) / segments;
            const startRadius = size * 0.6;
            const endRadius = size;
            
            context.globalAlpha = alpha;
            context.beginPath();
            context.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
            context.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
            context.stroke();
        }
    }
    
    /**
     * ドットローディングをレンダリング
     */
    static renderDots(context, pos, size, phases, options) {
        const dotCount = options.elements;
        const spacing = size * 0.3;
        const startX = pos.x - (dotCount - 1) * spacing / 2;
        
        context.fillStyle = options.color;
        
        for (let i = 0; i < dotCount; i++) {
            const dotX = startX + i * spacing;
            const phase = phases[i] || 0;
            const scale = (Math.sin(phase) + 1) * 0.5 * 0.5 + 0.5;
            const radius = size * 0.1 * scale;
            
            context.globalAlpha = scale;
            context.beginPath();
            context.arc(dotX, pos.y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    /**
     * パルスローディングをレンダリング
     */
    static renderPulse(context, pos, size, phase, options) {
        const scale = (Math.sin(phase) + 1) * 0.5 * 0.5 + 0.5;
        const radius = size * scale;
        
        context.globalAlpha = 1 - scale;
        context.strokeStyle = options.color;
        context.beginPath();
        context.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        context.stroke();
    }
    
    /**
     * ウェーブローディングをレンダリング
     */
    static renderWave(context, pos, size, waveOffset, options) {
        const waveWidth = size * 2;
        const waveHeight = size * 0.3;
        const segments = 20;
        
        context.strokeStyle = options.color;
        context.beginPath();
        
        for (let i = 0; i <= segments; i++) {
            const x = pos.x - waveWidth / 2 + (i / segments) * waveWidth;
            const y = pos.y + Math.sin((i / segments) * Math.PI * 4 + waveOffset) * waveHeight;
            
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        
        context.stroke();
    }
    
    /**
     * プログレスバーをレンダリング
     */
    static renderProgress(context, pos, size, options) {
        const barWidth = size * 2;
        const barHeight = size * 0.3;
        const progress = options.progress || 0;
        
        // 背景バー
        context.fillStyle = options.backgroundColor;
        context.fillRect(pos.x - barWidth / 2, pos.y - barHeight / 2, barWidth, barHeight);
        
        // 進行バー
        context.fillStyle = options.foregroundColor;
        context.fillRect(pos.x - barWidth / 2, pos.y - barHeight / 2, barWidth * progress, barHeight);
        
        // 境界線
        context.strokeStyle = options.color;
        context.lineWidth = 1;
        context.strokeRect(pos.x - barWidth / 2, pos.y - barHeight / 2, barWidth, barHeight);
        
        // パーセンテージ表示
        if (options.showPercentage) {
            context.fillStyle = options.color;
            context.font = `${size * 0.3}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(`${Math.round(progress * 100)}%`, pos.x, pos.y + size * 0.8);
        }
    }
}

/**
 * Interactive Effect Renderer
 * インタラクティブエフェクト描画
 */
export class InteractiveEffectRenderer {
    /**
     * リップル効果をレンダリング
     */
    static renderRippleEffect(context, animation, progress) {
        const pos = animation.position;
        const startRadius = animation.startRadius || 0;
        const endRadius = animation.endRadius || 100;
        const currentRadius = startRadius + (endRadius - startRadius) * progress;
        const alpha = animation.options.maxAlpha * (1 - progress);
        
        context.save();
        context.globalAlpha = alpha;
        context.strokeStyle = animation.options.color;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(pos.x, pos.y, currentRadius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
    }
    
    /**
     * フォーカスグロー効果をレンダリング
     */
    static renderFocusGlow(context, element, glowOptions) {
        if (!element.focusGlow || !element.focusGlow.active) return;
        
        const glow = element.focusGlow;
        const pulse = Math.sin(glow.phase || 0) * 0.3 + 0.7;
        const glowIntensity = glow.intensity * pulse;
        
        context.save();
        context.shadowColor = glow.color;
        context.shadowBlur = 20 * glowIntensity;
        context.globalAlpha = glowIntensity;
        
        // グロー効果の描画（要素に応じて調整）
        context.strokeStyle = glow.color;
        context.lineWidth = 3;
        context.strokeRect(element.x - 5, element.y - 5, element.width + 10, element.height + 10);
        
        context.restore();
        
        // フェーズ更新
        glow.phase = (glow.phase || 0) + 0.1;
    }
    
    /**
     * ホバー効果をレンダリング
     */
    static renderHoverEffect(context, element, hoverOptions) {
        if (!element.hoverState || !element.hoverState.active) return;
        
        const hover = element.hoverState;
        const scale = hover.scale || 1;
        
        context.save();
        
        // スケール効果
        if (scale !== 1) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            
            context.translate(centerX, centerY);
            context.scale(scale, scale);
            context.translate(-centerX, -centerY);
        }
        
        // 追加の視覚効果（影、グロー等）
        if (hoverOptions.shadow) {
            context.shadowColor = hoverOptions.shadowColor || '#000000';
            context.shadowBlur = hoverOptions.shadowBlur || 10;
            context.shadowOffsetX = hoverOptions.shadowOffsetX || 2;
            context.shadowOffsetY = hoverOptions.shadowOffsetY || 2;
        }
        
        context.restore();
    }
}

/**
 * Particle Effect Renderer
 * パーティクルエフェクト描画
 */
export class ParticleEffectRenderer {
    /**
     * 爆発パーティクルをレンダリング
     */
    static renderExplosionParticles(context, animation, progress) {
        const particles = animation.particles || [];
        const options = animation.options;
        
        context.save();
        
        particles.forEach(particle => {
            const alpha = (1 - progress) * particle.alpha;
            const size = particle.size * (1 + progress * particle.growth);
            const x = particle.startX + particle.velocityX * progress * animation.duration;
            const y = particle.startY + particle.velocityY * progress * animation.duration + 
                      0.5 * particle.gravity * Math.pow(progress * animation.duration, 2);
            
            context.globalAlpha = alpha;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        });
        
        context.restore();
    }
    
    /**
     * トレイルパーティクルをレンダリング
     */
    static renderTrailParticles(context, animation, progress) {
        const trail = animation.trail || [];
        const options = animation.options;
        
        context.save();
        context.strokeStyle = options.color;
        context.lineWidth = options.thickness || 2;
        context.lineCap = 'round';
        
        if (trail.length > 1) {
            context.beginPath();
            context.moveTo(trail[0].x, trail[0].y);
            
            for (let i = 1; i < trail.length; i++) {
                const alpha = i / trail.length;
                context.globalAlpha = alpha;
                context.lineTo(trail[i].x, trail[i].y);
            }
            
            context.stroke();
        }
        
        context.restore();
    }
    
    /**
     * スパークルパーティクルをレンダリング
     */
    static renderSparkleParticles(context, animation, progress) {
        const sparkles = animation.sparkles || [];
        const options = animation.options;
        
        context.save();
        
        sparkles.forEach(sparkle => {
            const phase = (sparkle.phase + progress * sparkle.speed) % (Math.PI * 2);
            const alpha = (Math.sin(phase) + 1) * 0.5 * sparkle.alpha;
            const size = sparkle.size * (Math.sin(phase * 2) * 0.5 + 1);
            
            context.globalAlpha = alpha;
            context.fillStyle = sparkle.color;
            
            // 星形の描画
            this.drawStar(context, sparkle.x, sparkle.y, size, 5);
        });
        
        context.restore();
    }
    
    /**
     * 星形を描画
     */
    static drawStar(context, x, y, size, points) {
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        context.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                context.moveTo(pointX, pointY);
            } else {
                context.lineTo(pointX, pointY);
            }
        }
        
        context.closePath();
        context.fill();
    }
}

/**
 * Transition Effect Renderer
 * 遷移エフェクト描画
 */
export class TransitionEffectRenderer {
    /**
     * フェード遷移をレンダリング
     */
    static renderFadeTransition(context, fromElement, toElement, progress) {
        if (fromElement) {
            context.save();
            context.globalAlpha = 1 - progress;
            this.renderElement(context, fromElement);
            context.restore();
        }
        
        if (toElement) {
            context.save();
            context.globalAlpha = progress;
            this.renderElement(context, toElement);
            context.restore();
        }
    }
    
    /**
     * スライド遷移をレンダリング
     */
    static renderSlideTransition(context, fromElement, toElement, progress, direction = 'horizontal') {
        const canvasWidth = context.canvas.width;
        const canvasHeight = context.canvas.height;
        
        if (fromElement) {
            context.save();
            if (direction === 'horizontal') {
                context.translate(-canvasWidth * progress, 0);
            } else {
                context.translate(0, -canvasHeight * progress);
            }
            this.renderElement(context, fromElement);
            context.restore();
        }
        
        if (toElement) {
            context.save();
            if (direction === 'horizontal') {
                context.translate(canvasWidth * (1 - progress), 0);
            } else {
                context.translate(0, canvasHeight * (1 - progress));
            }
            this.renderElement(context, toElement);
            context.restore();
        }
    }
    
    /**
     * ズーム遷移をレンダリング
     */
    static renderZoomTransition(context, fromElement, toElement, progress) {
        const centerX = context.canvas.width / 2;
        const centerY = context.canvas.height / 2;
        
        if (fromElement) {
            context.save();
            context.translate(centerX, centerY);
            context.scale(1 + progress * 0.5, 1 + progress * 0.5);
            context.globalAlpha = 1 - progress;
            context.translate(-centerX, -centerY);
            this.renderElement(context, fromElement);
            context.restore();
        }
        
        if (toElement) {
            context.save();
            context.translate(centerX, centerY);
            context.scale(0.5 + progress * 0.5, 0.5 + progress * 0.5);
            context.globalAlpha = progress;
            context.translate(-centerX, -centerY);
            this.renderElement(context, toElement);
            context.restore();
        }
    }
    
    /**
     * 要素を描画（プレースホルダー）
     */
    static renderElement(context, element) {
        // 実際の要素描画ロジックは使用側で実装
        if (element && element.render) {
            element.render(context);
        }
    }
}

/**
 * Animation Effect Utils
 * アニメーションエフェクトユーティリティ
 */
export class AnimationEffectUtils {
    /**
     * パーティクル群を生成
     */
    static createExplosionParticles(centerX, centerY, count = 10, options = {}) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const speed = (Math.random() * 100 + 50) * (options.intensity || 1);
            
            particles.push({
                startX: centerX,
                startY: centerY,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                gravity: options.gravity || 98,
                size: Math.random() * 3 + 1,
                growth: Math.random() * 2,
                alpha: Math.random() * 0.5 + 0.5,
                color: options.colors ? 
                       options.colors[Math.floor(Math.random() * options.colors.length)] : 
                       '#FFFFFF'
            });
        }
        
        return particles;
    }
    
    /**
     * スパークルパーティクル群を生成
     */
    static createSparkleParticles(centerX, centerY, count = 8, options = {}) {
        const sparkles = [];
        const radius = options.radius || 50;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = Math.random() * radius;
            
            sparkles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                size: Math.random() * 4 + 2,
                alpha: Math.random() * 0.8 + 0.2,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.1 + 0.05,
                color: options.colors ? 
                       options.colors[Math.floor(Math.random() * options.colors.length)] : 
                       '#FFD700'
            });
        }
        
        return sparkles;
    }
    
    /**
     * 色の補間
     */
    static interpolateColor(color1, color2, progress) {
        const r1 = parseInt(color1.substr(1, 2), 16);
        const g1 = parseInt(color1.substr(3, 2), 16);
        const b1 = parseInt(color1.substr(5, 2), 16);
        
        const r2 = parseInt(color2.substr(1, 2), 16);
        const g2 = parseInt(color2.substr(3, 2), 16);
        const b2 = parseInt(color2.substr(5, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * ベジェ曲線上の点を計算
     */
    static calculateBezierPoint(t, p0, p1, p2, p3) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        
        return {
            x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
            y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
        };
    }
}