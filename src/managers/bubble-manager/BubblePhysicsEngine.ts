import type { BubblePhysicsEngine as IBubblePhysicsEngine, 
    Bubble,
    Position,
    Vector2  } from '../../types/game';

/**
 * BubblePhysicsEngine - 泡物理演算エンジン
 * 
 * 泡の物理計算、力学、特殊効果、境界処理を専門的に管理します
 */
export class BubblePhysicsEngine implements IBubblePhysicsEngine {
    public gameEngine: any;
    public mousePosition: Position = { x: 0, y: 0 };
    private dragPhysics = {
        friction: 0.98,    // 空気抵抗
        bounce: 0.7,       // 跳ね返り係数
        gravity: 50,       // 重力加速度
        minVelocity: 5     // 最小速度（これ以下で停止）
    };

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * マウス位置を更新
     */
    updateMousePosition(x: number, y: number): void {
        this.mousePosition.x = x;
        this.mousePosition.y = y;
    }
    
    /**
     * 個別泡の更新処理（物理計算を含む）
     */
    updateBubble(bubble: Bubble, deltaTime: number): void {
        const deltaSeconds = deltaTime / 1000;
        
        // 逃げる泡の特殊処理
        if (bubble.type === 'escaping') {
            this.updateEscapingBubble(bubble, deltaSeconds);
        }
        
        // 物理計算
        this.applyPhysics(bubble, deltaSeconds);
        
        // スロー効果の適用
        this.applySlowEffect(bubble);
    }
    
    /**
     * 物理計算を適用
     */
    applyPhysics(bubble: Bubble, deltaSeconds: number): void {
        // 重力の適用（上向きの速度がある場合のみ）
        if (bubble.velocity.y < 0) {
            bubble.velocity.y += this.dragPhysics.gravity * deltaSeconds;
        }
        
        // 摩擦力の適用
        bubble.velocity.x *= this.dragPhysics.friction;
        bubble.velocity.y *= this.dragPhysics.friction;
        
        // 最小速度以下で停止
        const speed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
        if (speed < this.dragPhysics.minVelocity) {
            bubble.velocity.x = 0;
            bubble.velocity.y = 0;
        }
        
        // 位置の更新
        bubble.position.x += bubble.velocity.x * deltaSeconds;
        bubble.position.y += bubble.velocity.y * deltaSeconds;
        
        // 境界チェック
        this.checkBoundaries(bubble);
    }
    
    /**
     * スロー効果を適用
     */
    applySlowEffect(bubble: Bubble): void {
        const slowEffect = (bubble as any).slowEffect;
        if (slowEffect && Date.now() < slowEffect.endTime) {
            bubble.velocity.x *= slowEffect.factor;
            bubble.velocity.y *= slowEffect.factor;
        } else {
            // 効果時間終了
            delete (bubble as any).slowEffect;
        }
    }
    
    /**
     * 逃げる泡の更新処理
     */
    updateEscapingBubble(bubble: Bubble, deltaSeconds: number): void {
        const dx = bubble.position.x - this.mousePosition.x;
        const dy = bubble.position.y - this.mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            // マウスから逃げる方向を計算
            const escapeForce = 200 * (1 - distance / 150);
            const direction = {
                x: dx / distance,
                y: dy / distance
            };
            
            bubble.velocity.x += direction.x * escapeForce * deltaSeconds;
            bubble.velocity.y += direction.y * escapeForce * deltaSeconds;
        }
    }
    
    /**
     * 境界チェックと跳ね返り
     */
    checkBoundaries(bubble: Bubble): void {
        const canvas = this.gameEngine.canvasManager.canvas;
        const radius = bubble.size / 2;
        
        // 左右の境界
        if (bubble.position.x - radius < 0) {
            bubble.position.x = radius;
            bubble.velocity.x *= -this.dragPhysics.bounce;
        } else if (bubble.position.x + radius > canvas.width) {
            bubble.position.x = canvas.width - radius;
            bubble.velocity.x *= -this.dragPhysics.bounce;
        }
        
        // 上下の境界
        if (bubble.position.y - radius < 0) {
            bubble.position.y = radius;
            bubble.velocity.y *= -this.dragPhysics.bounce;
        } else if (bubble.position.y + radius > canvas.height) {
            bubble.position.y = canvas.height - radius;
            bubble.velocity.y *= -this.dragPhysics.bounce;
        }
    }
    
    /**
     * 泡に力を適用
     */
    applyForceToBubble(bubble: Bubble, direction: Vector2, force: number): void {
        bubble.velocity.x += direction.x * force;
        bubble.velocity.y += direction.y * force;
        
        // 最大速度制限
        const maxSpeed = 800;
        const speed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            bubble.velocity.x *= scale;
            bubble.velocity.y *= scale;
        }
    }
    
    /**
     * 衝突検出
     */
    checkCollisions(bubbles: Bubble[]): void {
        for (let i = 0; i < bubbles.length; i++) {
            for (let j = i + 1; j < bubbles.length; j++) {
                const bubbleA = bubbles[i];
                const bubbleB = bubbles[j];
                
                if (this.areBubblesColliding(bubbleA, bubbleB)) {
                    this.resolveBubbleCollision(bubbleA, bubbleB);
                }
            }
        }
    }
    
    /**
     * 二つの泡が衝突しているかチェック
     */
    areBubblesColliding(bubbleA: Bubble, bubbleB: Bubble): boolean {
        const dx = bubbleA.position.x - bubbleB.position.x;
        const dy = bubbleA.position.y - bubbleB.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (bubbleA.size + bubbleB.size) / 2;
        
        return distance < minDistance;
    }
    
    /**
     * 泡の衝突を解決
     */
    resolveBubbleCollision(bubbleA: Bubble, bubbleB: Bubble): void {
        const dx = bubbleA.position.x - bubbleB.position.x;
        const dy = bubbleA.position.y - bubbleB.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return; // 同じ位置の場合は処理しない
        
        const minDistance = (bubbleA.size + bubbleB.size) / 2;
        const overlap = minDistance - distance;
        
        // 位置の修正
        const separationX = (dx / distance) * (overlap / 2);
        const separationY = (dy / distance) * (overlap / 2);
        
        bubbleA.position.x += separationX;
        bubbleA.position.y += separationY;
        bubbleB.position.x -= separationX;
        bubbleB.position.y -= separationY;
        
        // 速度の交換（簡単な弾性衝突）
        const tempVelX = bubbleA.velocity.x;
        const tempVelY = bubbleA.velocity.y;
        
        bubbleA.velocity.x = bubbleB.velocity.x * this.dragPhysics.bounce;
        bubbleA.velocity.y = bubbleB.velocity.y * this.dragPhysics.bounce;
        bubbleB.velocity.x = tempVelX * this.dragPhysics.bounce;
        bubbleB.velocity.y = tempVelY * this.dragPhysics.bounce;
    }
    
    /**
     * 泡の年齢を更新
     */
    updateBubbleAge(bubble: Bubble, deltaTime: number): void {
        bubble.age += deltaTime;
        
        // 寿命チェック
        if (bubble.maxAge > 0 && bubble.age >= bubble.maxAge) {
            bubble.isAlive = false;
        }
    }
    
    /**
     * 特殊効果の物理計算
     */
    applySpecialEffects(bubble: Bubble, deltaTime: number): void {
        const deltaSeconds = deltaTime / 1000;
        
        // 磁石の泡：他の泡を引き寄せる
        if (bubble.type === 'magnetic') {
            this.applyMagneticEffect(bubble, deltaSeconds);
        }
        
        // 氷の泡：周囲の泡を遅くする
        if (bubble.type === 'frozen') {
            this.applyFrozenEffect(bubble, deltaSeconds);
        }
    }
    
    /**
     * 磁石効果を適用
     */
    applyMagneticEffect(magneticBubble: Bubble, deltaSeconds: number): void {
        const bubbles = this.gameEngine.bubbleManager.bubbles;
        const magneticRange = 120;
        const magneticForce = 100;
        
        bubbles.forEach((bubble: Bubble) => {
            if (bubble === magneticBubble || !bubble.isAlive) return;
            
            const dx = magneticBubble.position.x - bubble.position.x;
            const dy = magneticBubble.position.y - bubble.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < magneticRange) {
                const force = magneticForce * (1 - distance / magneticRange);
                const direction = {
                    x: dx / distance,
                    y: dy / distance
                };
                
                bubble.velocity.x += direction.x * force * deltaSeconds;
                bubble.velocity.y += direction.y * force * deltaSeconds;
            }
        });
    }
    
    /**
     * 氷効果を適用
     */
    applyFrozenEffect(frozenBubble: Bubble, deltaSeconds: number): void {
        const bubbles = this.gameEngine.bubbleManager.bubbles;
        const frozenRange = 100;
        const slowFactor = 0.3;
        
        bubbles.forEach((bubble: Bubble) => {
            if (bubble === frozenBubble || !bubble.isAlive) return;
            
            const dx = frozenBubble.position.x - bubble.position.x;
            const dy = frozenBubble.position.y - bubble.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < frozenRange) {
                bubble.velocity.x *= slowFactor;
                bubble.velocity.y *= slowFactor;
            }
        });
    }

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * 物理設定を更新
     */
    updatePhysicsSettings(settings: { gravity?: number; friction?: number; bounce?: number }): void {
        try {
            if (settings.gravity !== undefined && typeof settings.gravity === 'number' && settings.gravity >= 0) {
                this.dragPhysics.gravity = settings.gravity;
            }
            
            if (settings.friction !== undefined && typeof settings.friction === 'number' && settings.friction >= 0 && settings.friction <= 1) {
                this.dragPhysics.friction = settings.friction;
            }
            
            if (settings.bounce !== undefined && typeof settings.bounce === 'number' && settings.bounce >= 0 && settings.bounce <= 1) {
                this.dragPhysics.bounce = settings.bounce;
            }
            
            console.log('[BubblePhysicsEngine] 物理設定を更新:', settings);
        } catch (error) {
            console.error('[BubblePhysicsEngine] updatePhysicsSettings error:', error);
        }
    }

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats(): { activeCollisions: number; totalForces: number; averageSpeed: number } {
        try {
            const bubbles = this.gameEngine.bubbleManager.bubbles || [];
            let totalSpeed = 0;
            let activeCollisions = 0;
            
            bubbles.forEach((bubble: Bubble) => {
                if (bubble.isAlive) {
                    const speed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
                    totalSpeed += speed;
                    
                    if (speed > this.dragPhysics.minVelocity) {
                        activeCollisions++;
                    }
                }
            });
            
            return {
                activeCollisions,
                totalForces: bubbles.length,
                averageSpeed: bubbles.length > 0 ? totalSpeed / bubbles.length : 0
            };
        } catch (error) {
            console.error('[BubblePhysicsEngine] getPerformanceStats error:', error);
            return { activeCollisions: 0, totalForces: 0, averageSpeed: 0 };
        }
    }
}