/**
 * 基本泡クラス
 */
export class Bubble {
    constructor(type, position) {
        this.type = type;
        this.position = { ...position };
        this.velocity = { x: 0, y: 0 };
        this.size = 50;
        this.health = 1;
        this.maxHealth = 1;
        this.age = 0;
        this.maxAge = 10000; // 10秒
        this.isAlive = true;
        this.effects = [];
        this.clickCount = 0; // 硬い泡用のクリック回数
        
        // 泡の種類別設定を適用
        this.applyTypeConfig();
    }
    
    /**
     * 泡の種類別設定を適用
     */
    applyTypeConfig() {
        const config = this.getTypeConfig();
        this.health = config.health;
        this.maxHealth = config.health;
        this.size = config.size;
        this.maxAge = config.maxAge;
    }
    
    /**
     * 泡の種類別設定を取得
     */
    getTypeConfig() {
        const configs = {
            normal: {
                health: 1,
                size: 50,
                maxAge: 12000, // 10000 -> 12000 (少し長く)
                color: '#87CEEB',
                score: 15
            },
            stone: {
                health: 2,
                size: 55,
                maxAge: 16000, // 15000 -> 16000 (少し長く)
                color: '#696969',
                score: 35
            },
            iron: {
                health: 3,
                size: 60,
                maxAge: 20000, // 変更なし
                color: '#708090',
                score: 65
            },
            diamond: {
                health: 4, // 5 -> 4 (少し弱く)
                size: 65,
                maxAge: 22000, // 25000 -> 22000 (少し短く)
                color: '#B0E0E6',
                score: 120
            },
            pink: {
                health: 1,
                size: 45,
                maxAge: 10000, // 8000 -> 10000 (少し長く)
                color: '#FFB6C1',
                score: 25,
                healAmount: 25 // 20 -> 25 (回復量増加)
            },
            poison: {
                health: 1,
                size: 48,
                maxAge: 14000, // 12000 -> 14000 (少し長く)
                color: '#9370DB',
                score: 8,
                damageAmount: 8 // 10 -> 8 (ダメージ軽減)
            },
            spiky: {
                health: 1,
                size: 52,
                maxAge: 13000, // 12000 -> 13000 (少し長く)
                color: '#FF6347',
                score: 85,
                chainRadius: 120 // 150 -> 120 (連鎖範囲を少し狭く)
            },
            rainbow: {
                health: 1,
                size: 55,
                maxAge: 16000, // 15000 -> 16000 (少し長く)
                color: '#FF69B4',
                score: 400,
                bonusTimeMs: 8000 // 10000 -> 8000 (ボーナス時間短縮)
            },
            clock: {
                health: 1,
                size: 50,
                maxAge: 20000, // 18000 -> 20000 (少し長く)
                color: '#FFD700',
                score: 180,
                timeStopMs: 2500 // 3000 -> 2500 (時間停止短縮)
            },
            score: {
                health: 1,
                size: 48,
                maxAge: 9000, // 8000 -> 9000 (少し長く)
                color: '#32CD32',
                score: 250,
                bonusScore: 80 // 100 -> 80 (ボーナス軽減)
            },
            electric: {
                health: 1,
                size: 50,
                maxAge: 13000, // 12000 -> 13000 (少し長く)
                color: '#FFFF00',
                score: 20,
                shakeIntensity: 15, // 20 -> 15 (揺れ軽減)
                disableDuration: 1500 // 2000 -> 1500 (操作不能時間短縮)
            },
            escaping: {
                health: 1,
                size: 45,
                maxAge: 16000, // 15000 -> 16000 (少し長く)
                color: '#FF8C00',
                score: 50,
                escapeSpeed: 180, // 200 -> 180 (逃げる速度軽減)
                escapeRadius: 90 // 100 -> 90 (逃げる範囲縮小)
            },
            cracked: {
                health: 1,
                size: 52,
                maxAge: 6000, // 5000 -> 6000 (少し長く)
                color: '#8B4513',
                score: 30
            },
            boss: {
                health: 8, // 10 -> 8 (少し弱く)
                size: 90, // 100 -> 90 (少し小さく)
                maxAge: 35000, // 30000 -> 35000 (少し長く)
                color: '#8B0000',
                score: 800
            },
            // 新しい泡タイプ
            golden: {
                health: 1,
                size: 55,
                maxAge: 8000,
                color: '#FFD700',
                score: 500,
                multiplier: 2.0 // スコア倍率
            },
            frozen: {
                health: 2,
                size: 50,
                maxAge: 25000, // 長時間持続
                color: '#87CEEB',
                score: 100,
                slowEffect: 0.5 // 周囲の泡の動きを遅くする
            },
            magnetic: {
                health: 1,
                size: 48,
                maxAge: 15000,
                color: '#FF1493',
                score: 150,
                magnetRadius: 100 // 他の泡を引き寄せる
            },
            explosive: {
                health: 1,
                size: 52,
                maxAge: 10000,
                color: '#FF4500',
                score: 200,
                explosionRadius: 150 // 爆発範囲
            },
            phantom: {
                health: 1,
                size: 45,
                maxAge: 12000,
                color: '#9370DB',
                score: 300,
                phaseChance: 0.3 // クリックをすり抜ける確率
            },
            multiplier: {
                health: 1,
                size: 50,
                maxAge: 18000,
                color: '#32CD32',
                score: 100,
                scoreMultiplier: 3.0 // 次の泡のスコアを3倍
            }
        };
        
        return configs[this.type] || configs.normal;
    }
    
    /**
     * 泡を更新
     */
    update(deltaTime, mousePosition = null) {
        if (!this.isAlive) return;
        
        this.age += deltaTime;
        
        // 逃げる泡の特殊行動
        if (this.type === 'escaping' && mousePosition) {
            this.handleEscapingBehavior(mousePosition, deltaTime);
        }
        
        // 位置更新
        this.position.x += this.velocity.x * deltaTime / 1000;
        this.position.y += this.velocity.y * deltaTime / 1000;
        
        // 画面境界での処理
        this.handleBoundaryCollision();
        
        // 年齢による危険度チェック
        if (this.age >= this.maxAge) {
            this.burst();
        }
    }
    
    /**
     * 逃げる泡の行動処理
     */
    handleEscapingBehavior(mousePosition, deltaTime) {
        const config = this.getTypeConfig();
        const dx = this.position.x - mousePosition.x;
        const dy = this.position.y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // マウスが近づいたら逃げる
        if (distance < config.escapeRadius) {
            // 正規化されたベクトルを計算
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // 逃げる方向に速度を設定
            this.velocity.x = normalizedX * config.escapeSpeed;
            this.velocity.y = normalizedY * config.escapeSpeed;
        } else {
            // 遠くにいる時は徐々に速度を減らす
            this.velocity.x *= 0.95;
            this.velocity.y *= 0.95;
        }
    }
    
    /**
     * 画面境界での衝突処理（強化版）
     */
    handleBoundaryCollision() {
        const margin = this.size / 2; // 泡の半径を使用
        const canvasWidth = 800;
        const canvasHeight = 600;
        const dampening = 0.7; // 跳ね返り時の減衰率
        const minVelocity = 10; // 最小速度（これ以下は停止）
        
        let bounced = false;
        
        // 左右の境界
        if (this.position.x - margin <= 0) {
            this.position.x = margin;
            if (this.velocity.x < 0) {
                this.velocity.x = -this.velocity.x * dampening;
                bounced = true;
            }
        } else if (this.position.x + margin >= canvasWidth) {
            this.position.x = canvasWidth - margin;
            if (this.velocity.x > 0) {
                this.velocity.x = -this.velocity.x * dampening;
                bounced = true;
            }
        }
        
        // 上下の境界
        if (this.position.y - margin <= 0) {
            this.position.y = margin;
            if (this.velocity.y < 0) {
                this.velocity.y = -this.velocity.y * dampening;
                bounced = true;
            }
        } else if (this.position.y + margin >= canvasHeight) {
            this.position.y = canvasHeight - margin;
            if (this.velocity.y > 0) {
                this.velocity.y = -this.velocity.y * dampening;
                bounced = true;
            }
        }
        
        // 跳ね返り後の速度が小さすぎる場合は停止
        if (bounced) {
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed < minVelocity) {
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
        
        // 自然な減速（摩擦効果）
        if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
            const friction = 0.98; // 摩擦係数
            this.velocity.x *= friction;
            this.velocity.y *= friction;
            
            // 非常に小さい速度は0にする
            if (Math.abs(this.velocity.x) < 1) this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 1) this.velocity.y = 0;
        }
    }
    
    /**
     * 泡を描画
     */
    render(context) {
        if (!this.isAlive) return;
        
        const config = this.getTypeConfig();
        const centerX = this.position.x;
        const centerY = this.position.y;
        
        // 年齢による色の変化（危険度表示）
        const ageRatio = this.age / this.maxAge;
        let fillColor = config.color;
        
        if (ageRatio > 0.7) {
            // 危険状態：赤みを増す
            fillColor = this.blendColors(config.color, '#FF4444', (ageRatio - 0.7) / 0.3);
        }
        
        // 泡の描画
        context.save();
        
        // 影
        context.shadowColor = 'rgba(0,0,0,0.3)';
        context.shadowBlur = 10;
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        
        // メインの泡
        context.beginPath();
        context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
        context.fillStyle = fillColor;
        context.fill();
        
        // 光沢効果
        const gradient = context.createRadialGradient(
            centerX - this.size * 0.3, centerY - this.size * 0.3, 0,
            centerX, centerY, this.size
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fill();
        
        // 硬い泡の場合、耐久値を表示
        if (this.type === 'stone' || this.type === 'iron' || this.type === 'diamond') {
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 16px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(this.health.toString(), centerX, centerY);
        }
        
        // 特殊泡のアイコン表示
        this.renderSpecialIcon(context, centerX, centerY);
        
        context.restore();
    }
    
    /**
     * 特殊泡のアイコンを描画
     */
    renderSpecialIcon(context, centerX, centerY) {
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        switch (this.type) {
            case 'pink':
                context.fillText('♥', centerX, centerY - 5);
                break;
            case 'poison':
                context.fillText('☠', centerX, centerY - 5);
                break;
            case 'stone':
                context.fillText('●', centerX, centerY - 5);
                break;
            case 'iron':
                context.fillText('◆', centerX, centerY - 5);
                break;
            case 'diamond':
                context.fillText('♦', centerX, centerY - 5);
                break;
            case 'spiky':
                context.fillText('✦', centerX, centerY - 5);
                break;
            case 'rainbow':
                // 虹色効果のため複数色で描画
                context.save();
                const gradient = context.createLinearGradient(centerX - 10, centerY - 10, centerX + 10, centerY + 10);
                gradient.addColorStop(0, '#FF0000');
                gradient.addColorStop(0.33, '#00FF00');
                gradient.addColorStop(0.66, '#0000FF');
                gradient.addColorStop(1, '#FF00FF');
                context.fillStyle = gradient;
                context.fillText('◉', centerX, centerY - 5);
                context.restore();
                break;
            case 'clock':
                context.fillText('⏰', centerX, centerY - 5);
                break;
            case 'score':
                context.fillText('S', centerX, centerY - 5);
                break;
            case 'electric':
                context.fillText('⚡', centerX, centerY - 5);
                break;
            case 'escaping':
                context.fillText('💨', centerX, centerY - 5);
                break;
            case 'cracked':
                context.fillText('💥', centerX, centerY - 5);
                break;
            case 'boss':
                context.fillStyle = '#FFFFFF';
                context.font = 'bold 24px Arial';
                context.fillText('👑', centerX, centerY - 5);
                // ボス泡の場合、耐久値も表示
                context.font = 'bold 16px Arial';
                context.fillText(this.health.toString(), centerX, centerY + 15);
                break;
            // 新しい泡タイプのアイコン
            case 'golden':
                context.fillText('★', centerX, centerY - 5);
                break;
            case 'frozen':
                context.fillText('❄', centerX, centerY - 5);
                break;
            case 'magnetic':
                context.fillText('🧲', centerX, centerY - 5);
                break;
            case 'explosive':
                context.fillText('💣', centerX, centerY - 5);
                break;
            case 'phantom':
                context.fillStyle = 'rgba(255,255,255,0.7)'; // 半透明
                context.fillText('👻', centerX, centerY - 5);
                break;
            case 'multiplier':
                context.fillText('×', centerX, centerY - 5);
                break;
        }
    }
    
    /**
     * 色をブレンド
     */
    blendColors(color1, color2, ratio) {
        // 簡単な色ブレンド実装
        return color2; // 簡略化
    }
    
    /**
     * ダメージを受ける
     */
    takeDamage(amount = 1) {
        this.health -= amount;
        this.clickCount++;
        
        if (this.health <= 0) {
            this.destroy();
            return true; // 破壊された
        }
        return false; // まだ生きている
    }
    
    /**
     * 泡を破壊
     */
    destroy() {
        this.isAlive = false;
        this.triggerSpecialEffect();
    }
    
    /**
     * 泡が自然破裂
     */
    burst() {
        this.isAlive = false;
        // 破裂時は特殊効果を発動しない（ダメージのみ）
    }
    
    /**
     * 特殊効果を発動
     */
    triggerSpecialEffect() {
        const config = this.getTypeConfig();
        
        switch (this.type) {
            case 'pink':
                // HP回復効果
                this.effects.push({
                    type: 'heal',
                    amount: config.healAmount
                });
                break;
                
            case 'poison':
                // ダメージ効果
                this.effects.push({
                    type: 'damage',
                    amount: config.damageAmount
                });
                break;
                
            case 'spiky':
                // とげとげの泡：連鎖破壊効果
                this.effects.push({
                    type: 'chain_destroy',
                    position: { ...this.position },
                    radius: config.chainRadius
                });
                break;
                
            case 'rainbow':
                // 虹色の泡：ボーナスタイム効果
                this.effects.push({
                    type: 'bonus_time',
                    duration: config.bonusTimeMs
                });
                break;
                
            case 'clock':
                // 時計の泡：時間停止効果
                this.effects.push({
                    type: 'time_stop',
                    duration: config.timeStopMs
                });
                break;
                
            case 'score':
                // S字の泡：追加スコア効果
                this.effects.push({
                    type: 'bonus_score',
                    amount: config.bonusScore
                });
                break;
                
            case 'electric':
                // ビリビリの泡：画面揺れ・操作不能効果
                this.effects.push({
                    type: 'screen_shake',
                    intensity: config.shakeIntensity,
                    duration: config.disableDuration
                });
                break;
                
            case 'escaping':
                // 逃げる泡：通常の効果なし（逃げる行動は update で処理）
                break;
                
            case 'cracked':
                // ひび割れの泡：通常の効果なし（早期破裂は maxAge で処理済み）
                break;
                
            case 'boss':
                // ボス泡：通常の効果なし（高スコア・高耐久は設定済み）
                break;
                
            // 新しい泡タイプの特殊効果
            case 'golden':
                // 黄金の泡：スコア倍率効果
                this.effects.push({
                    type: 'score_multiplier',
                    multiplier: config.multiplier,
                    duration: 5000 // 5秒間
                });
                break;
                
            case 'frozen':
                // 氷の泡：周囲の泡を遅くする効果
                this.effects.push({
                    type: 'slow_area',
                    position: { ...this.position },
                    radius: 120,
                    slowFactor: config.slowEffect,
                    duration: 8000 // 8秒間
                });
                break;
                
            case 'magnetic':
                // 磁石の泡：他の泡を引き寄せる効果
                this.effects.push({
                    type: 'magnetic_pull',
                    position: { ...this.position },
                    radius: config.magnetRadius,
                    strength: 150
                });
                break;
                
            case 'explosive':
                // 爆発の泡：大きな爆発効果
                this.effects.push({
                    type: 'big_explosion',
                    position: { ...this.position },
                    radius: config.explosionRadius,
                    damage: 15
                });
                break;
                
            case 'phantom':
                // 幻の泡：特殊効果なし（すり抜け効果は別途処理）
                break;
                
            case 'multiplier':
                // 倍率の泡：次の泡のスコアを倍増
                this.effects.push({
                    type: 'next_score_multiplier',
                    multiplier: config.scoreMultiplier,
                    duration: 10000 // 10秒間
                });
                break;
        }
    }
    
    /**
     * 位置が範囲内かチェック
     */
    containsPoint(x, y) {
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.size;
    }
    
    /**
     * スコアを取得
     */
    getScore() {
        const config = this.getTypeConfig();
        let baseScore = config.score;
        
        // 年齢によるボーナス
        const ageRatio = this.age / this.maxAge;
        if (ageRatio < 0.1) {
            // 発生直後
            baseScore *= 2;
        } else if (ageRatio > 0.9) {
            // 破裂直前
            baseScore *= 3;
        }
        
        return Math.floor(baseScore);
    }
    
    /**
     * 更新処理
     */
    update(deltaTime, mousePosition) {
        // 年齢を更新
        this.age += deltaTime;
        
        // 寿命チェック
        if (this.age >= this.maxAge) {
            this.isAlive = false;
        }
        
        // 特殊タイプの更新処理
        this.updateSpecialBehavior(deltaTime, mousePosition);
        
        // 位置更新（速度がある場合）
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.position.x += this.velocity.x * (deltaTime / 1000);
            this.position.y += this.velocity.y * (deltaTime / 1000);
            
            // 摩擦による減速
            this.velocity.x *= 0.98;
            this.velocity.y *= 0.98;
        }
    }
    
    /**
     * 特殊タイプの振る舞い更新
     */
    updateSpecialBehavior(deltaTime, mousePosition) {
        switch (this.type) {
            case 'escaping':
                // 逃げる泡：マウスから離れる動き
                if (mousePosition) {
                    const dx = this.position.x - mousePosition.x;
                    const dy = this.position.y - mousePosition.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100 && distance > 0) {
                        const escapeForce = 50 / distance;
                        this.velocity.x += (dx / distance) * escapeForce;
                        this.velocity.y += (dy / distance) * escapeForce;
                    }
                }
                break;
                
            case 'magnetic':
                // 磁力の泡：他の泡を引き寄せる効果（ここでは位置のみ更新）
                break;
                
            case 'frozen':
                // 凍った泡：動きを制限
                this.velocity.x *= 0.5;
                this.velocity.y *= 0.5;
                break;
        }
    }
    
    /**
     * 効果を取得してクリア
     */
    getAndClearEffects() {
        const effects = [...this.effects];
        this.effects = [];
        return effects;
    }
}