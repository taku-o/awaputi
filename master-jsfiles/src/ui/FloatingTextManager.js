/**
 * フローティングテキスト管理クラス
 * スコア表示、ダメージ表示、効果通知などのアニメーションテキストを管理
 */
export class FloatingTextManager {
    constructor() {
        this.texts = [];
        this.textId = 0;
    }
    
    /**
     * フローティングテキストを追加
     */
    addText(x, y, text, options = {}) {
        const floatingText = {
            id: this.textId++,
            x: x,
            y: y,
            originalY: y,
            text: text,
            life: options.duration || 2000,
            maxLife: options.duration || 2000,
            color: options.color || '#FFFFFF',
            fontSize: options.fontSize || 20,
            fontWeight: options.fontWeight || 'bold',
            fontFamily: options.fontFamily || 'Arial',
            velocityX: options.velocityX || 0,
            velocityY: options.velocityY || -50,
            gravity: options.gravity || 0,
            fadeOut: options.fadeOut !== false,
            scaleAnimation: options.scaleAnimation || false,
            bounceAnimation: options.bounceAnimation || false,
            pulseAnimation: options.pulseAnimation || false,
            alpha: 1,
            scale: 1,
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || 0,
            shadow: options.shadow || false,
            outline: options.outline || false,
            outlineColor: options.outlineColor || '#000000',
            easing: options.easing || 'linear'
        };
        
        this.texts.push(floatingText);
        return floatingText.id;
    }
    
    /**
     * スコア表示用のフローティングテキスト
     */
    addScoreText(x, y, score, multiplier = 1) {
        const color = multiplier > 1 ? '#FFD700' : '#00FF00';
        const text = multiplier > 1 ? `+${score} x${multiplier}` : `+${score}`;
        
        return this.addText(x, y, text, {
            color: color,
            fontSize: 24,
            fontWeight: 'bold',
            velocityY: -80,
            duration: 1500,
            scaleAnimation: true,
            shadow: true
        });
    }
    
    /**
     * ダメージ表示用のフローティングテキスト
     */
    addDamageText(x, y, damage) {
        return this.addText(x, y, `-${damage}`, {
            color: '#FF4444',
            fontSize: 28,
            fontWeight: 'bold',
            velocityY: -60,
            velocityX: (Math.random() - 0.5) * 40,
            duration: 2000,
            bounceAnimation: true,
            shadow: true
        });
    }
    
    /**
     * 回復表示用のフローティングテキスト
     */
    addHealText(x, y, heal) {
        return this.addText(x, y, `+${heal} HP`, {
            color: '#44FF44',
            fontSize: 26,
            fontWeight: 'bold',
            velocityY: -70,
            duration: 1800,
            pulseAnimation: true,
            shadow: true
        });
    }
    
    /**
     * コンボ表示用のフローティングテキスト
     */
    addComboText(x, y, combo) {
        const colors = ['#FFD700', '#FF8C00', '#FF4500', '#DC143C', '#8B0000'];
        const colorIndex = Math.min(Math.floor(combo / 5), colors.length - 1);
        
        return this.addText(x, y, `${combo} COMBO!`, {
            color: colors[colorIndex],
            fontSize: 32 + Math.min(combo * 2, 20),
            fontWeight: 'bold',
            velocityY: -100,
            duration: 2500,
            scaleAnimation: true,
            pulseAnimation: true,
            outline: true,
            shadow: true
        });
    }
    
    /**
     * 特殊効果表示用のフローティングテキスト
     */
    addEffectText(x, y, effect, type = 'normal') {
        const configs = {
            bonus: {
                color: '#FFD700',
                fontSize: 36,
                velocityY: -120,
                duration: 3000,
                scaleAnimation: true,
                pulseAnimation: true
            },
            timeStop: {
                color: '#00AAFF',
                fontSize: 32,
                velocityY: -90,
                duration: 2500,
                bounceAnimation: true
            },
            shock: {
                color: '#FFFF00',
                fontSize: 28,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: -60,
                duration: 2000,
                rotationSpeed: (Math.random() - 0.5) * 10
            },
            chain: {
                color: '#FF6600',
                fontSize: 30,
                velocityY: -80,
                duration: 2200,
                scaleAnimation: true
            }
        };
        
        const config = configs[type] || configs.normal;
        
        return this.addText(x, y, effect, {
            ...config,
            fontWeight: 'bold',
            outline: true,
            shadow: true
        });
    }
    
    /**
     * カスタムアニメーション付きテキスト
     */
    addAnimatedText(x, y, text, animationType) {
        const animations = {
            rainbow: {
                color: '#FF0000', // 虹色は更新で変更
                fontSize: 28,
                velocityY: -70,
                duration: 2000,
                pulseAnimation: true
            },
            explosive: {
                color: '#FF4500',
                fontSize: 32,
                velocityX: (Math.random() - 0.5) * 200,
                velocityY: -150,
                gravity: 80,
                duration: 2500,
                rotationSpeed: (Math.random() - 0.5) * 15
            },
            gentle: {
                color: '#87CEEB',
                fontSize: 22,
                velocityY: -40,
                duration: 3000,
                scaleAnimation: true
            }
        };
        
        const config = animations[animationType] || animations.gentle;
        
        return this.addText(x, y, text, {
            ...config,
            fontWeight: 'bold',
            shadow: true
        });
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        this.texts = this.texts.filter(text => {
            text.life -= deltaTime;
            
            if (text.life <= 0) {
                return false; // 削除
            }
            
            // 位置更新
            text.x += text.velocityX * deltaTime * 0.001;
            text.y += text.velocityY * deltaTime * 0.001;
            
            // 重力適用
            if (text.gravity) {
                text.velocityY += text.gravity * deltaTime * 0.001;
            }
            
            // 回転更新
            if (text.rotationSpeed) {
                text.rotation += text.rotationSpeed * deltaTime * 0.001;
            }
            
            // アルファ値計算
            if (text.fadeOut) {
                text.alpha = text.life / text.maxLife;
            }
            
            // アニメーション更新
            this.updateAnimations(text, deltaTime);
            
            return true;
        });
    }
    
    /**
     * アニメーション更新
     */
    updateAnimations(text, deltaTime) {
        const progress = 1 - (text.life / text.maxLife);
        const time = Date.now() * 0.001;
        
        // スケールアニメーション
        if (text.scaleAnimation) {
            if (progress < 0.2) {
                // 拡大フェーズ
                text.scale = 1 + (progress * 2.5);
            } else {
                // 通常サイズに戻る
                text.scale = 1.5 - ((progress - 0.2) * 0.625);
            }
        }
        
        // バウンスアニメーション
        if (text.bounceAnimation) {
            text.y = text.originalY + text.velocityY * (Date.now() - (text.maxLife - text.life)) * 0.001;
            text.y += Math.sin(time * 10) * 5 * (1 - progress);
        }
        
        // パルスアニメーション
        if (text.pulseAnimation) {
            const pulse = Math.sin(time * 8) * 0.3 + 1;
            text.scale = (text.scale || 1) * pulse;
        }
        
        // 虹色アニメーション（特殊）
        if (text.color === '#FF0000' && text.pulseAnimation) {
            const hue = (time * 100) % 360;
            text.color = `hsl(${hue}, 100%, 50%)`;
        }
    }
    
    /**
     * 描画処理
     */
    render(context) {
        this.texts.forEach(text => {
            context.save();
            
            // 透明度設定
            context.globalAlpha = text.alpha;
            
            // 位置とスケールを適用
            context.translate(text.x, text.y);
            if (text.scale !== 1) {
                context.scale(text.scale, text.scale);
            }
            if (text.rotation !== 0) {
                context.rotate(text.rotation);
            }
            
            // フォント設定
            context.font = `${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // 影を描画
            if (text.shadow) {
                context.shadowColor = 'rgba(0, 0, 0, 0.8)';
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.shadowBlur = 4;
            }
            
            // アウトラインを描画
            if (text.outline) {
                context.strokeStyle = text.outlineColor;
                context.lineWidth = 3;
                context.strokeText(text.text, 0, 0);
            }
            
            // テキストを描画
            context.fillStyle = text.color;
            context.fillText(text.text, 0, 0);
            
            context.restore();
        });
    }
    
    /**
     * 特定のテキストを削除
     */
    removeText(id) {
        this.texts = this.texts.filter(text => text.id !== id);
    }
    
    /**
     * 全てのテキストをクリア
     */
    clear() {
        this.texts = [];
    }
    
    /**
     * テキスト数を取得
     */
    getTextCount() {
        return this.texts.length;
    }
    
    /**
     * 画面上のテキストを取得
     */
    getTextsInArea(x, y, width, height) {
        return this.texts.filter(text => 
            text.x >= x && text.x <= x + width &&
            text.y >= y && text.y <= y + height
        );
    }
}