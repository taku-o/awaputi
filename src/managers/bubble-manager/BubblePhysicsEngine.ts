import type { 
    BubblePhysicsEngine as IBubblePhysicsEngine, 
    Bubble, 
    Position, 
    Vector2 
} from '../../types/game';

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
        
        // 摩擦の適用
        bubble.velocity.x *= this.dragPhysics.friction;
        bubble.velocity.y *= this.dragPhysics.friction;
        
        // 最小速度未満で停止
        const speed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
        if (speed < this.dragPhysics.minVelocity) {
            bubble.velocity.x = 0;
            bubble.velocity.y = 0;
        }
        
        // 位置更新
        bubble.position.x += bubble.velocity.x * deltaSeconds;
        bubble.position.y += bubble.velocity.y * deltaSeconds;
        
        // 境界との衝突判定
        this.handleBoundaryCollision(bubble);
    }
    
    /**
     * 境界との衝突判定
     */
    handleBoundaryCollision(bubble: Bubble): void {
        const canvas = this.gameEngine.canvas;
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
            
            // 地面に着地したら速度を大幅に減衰
            bubble.velocity.x *= 0.3;
            bubble.velocity.y *= 0.1;
        }
    }
    
    /**
     * 逃げる泡の更新処理
     */
    updateEscapingBubble(bubble: Bubble, deltaSeconds: number): void {
        const dx = bubble.position.x - this.mousePosition.x;
        const dy = bubble.position.y - this.mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 一定距離内でマウスから逃げる
        const escapeDistance = 100;
        if (distance < escapeDistance && distance > 0) {
            const escapeForce = 200 * (1 - distance / escapeDistance);
            const escapeDirection = {
                x: dx / distance,
                y: dy / distance
            };
            
            bubble.velocity.x += escapeDirection.x * escapeForce * deltaSeconds;
            bubble.velocity.y += escapeDirection.y * escapeForce * deltaSeconds;
            
            // 最大逃げ速度を制限
            const maxEscapeSpeed = 300;
            const currentSpeed = Math.sqrt(bubble.velocity.x * bubble.velocity.x + bubble.velocity.y * bubble.velocity.y);
            if (currentSpeed > maxEscapeSpeed) {
                bubble.velocity.x = (bubble.velocity.x / currentSpeed) * maxEscapeSpeed;
                bubble.velocity.y = (bubble.velocity.y / currentSpeed) * maxEscapeSpeed;
            }
        }
    }
    
    /**
     * スロー効果の適用
     */
    applySlowEffect(bubble: Bubble): void {
        const slowEffect = (bubble as any).slowEffect;
        if (slowEffect && slowEffect.endTime > Date.now()) {
            // スロー効果が有効
            bubble.velocity.x *= slowEffect.factor;
            bubble.velocity.y *= slowEffect.factor;
        } else if (slowEffect) {
            // スロー効果の時間が切れた
            delete (bubble as any).slowEffect;
        }
    }
    
    /**
     * 泡に力を適用
     */
    applyForceToBubble(bubble: Bubble, direction: Vector2, strength: number): void {
        bubble.velocity.x = direction.x * strength;
        bubble.velocity.y = direction.y * strength;
        
        // 泡のタイプによる調整
        switch (bubble.type) {
            case 'stone':
                // 石は重いので速度を減衰
                bubble.velocity.x *= 0.7;
                bubble.velocity.y *= 0.7;
                break;
            case 'iron':
                bubble.velocity.x *= 0.5;
                bubble.velocity.y *= 0.5;
                break;
            case 'diamond':
                bubble.velocity.x *= 0.3;
                bubble.velocity.y *= 0.3;
                break;
            case 'escaping':
                // 逃げる泡は軽いので速度を増幅
                bubble.velocity.x *= 1.5;
                bubble.velocity.y *= 1.5;
                break;
            case 'boss':
                // ボス泡は非常に重い
                bubble.velocity.x *= 0.2;
                bubble.velocity.y *= 0.2;
                break;
        }
    }
    
    /**
     * 泡が画面内にあるかチェック（パフォーマンス最適化用）
     */
    isBubbleVisible(bubble: Bubble): boolean {
        const margin = 100;
        return (
            bubble.position.x > -margin &&
            bubble.position.x < 800 + margin &&
            bubble.position.y > -margin &&
            bubble.position.y < 600 + margin
        );
    }
    
    /**
     * 画面外の泡の処理
     */
    handleOffscreenBubble(bubble: Bubble, deltaTime: number, offscreenBubbles: Set<Bubble>, offscreenTimer: Map<Bubble, number>): boolean {
        const canvas = this.gameEngine.canvas;
        const margin = bubble.size; // マージンを設けて判定
        
        const isOffscreen = (
            bubble.position.x < -margin ||
            bubble.position.x > canvas.width + margin ||
            bubble.position.y < -margin ||
            bubble.position.y > canvas.height + margin
        );
        
        if (isOffscreen) {
            // 特定の泡タイプは即座に消滅
            if (this.shouldDisappearOffscreen(bubble.type)) {
                bubble.isAlive = false;
                console.log(`${bubble.type} bubble disappeared offscreen`);
                return true; // 消滅した
            }
            
            // その他の泡は時間経過で消滅
            if (!offscreenBubbles.has(bubble)) {
                offscreenBubbles.add(bubble);
                offscreenTimer.set(bubble, 0);
            }
            
            const timer = (offscreenTimer.get(bubble) || 0) + deltaTime;
            offscreenTimer.set(bubble, timer);
            
            if (timer >= 3000) { // 3秒で消滅
                bubble.isAlive = false;
                console.log(`${bubble.type} bubble timed out offscreen`);
                return true; // 消滅した
            }
        } else {
            // 画面内に戻った場合はタイマーをリセット
            if (offscreenBubbles.has(bubble)) {
                offscreenBubbles.delete(bubble);
                offscreenTimer.delete(bubble);
            }
        }
        
        return false; // 継続
    }
    
    /**
     * 特定の泡タイプが画面外で即座に消滅するかどうか
     */
    shouldDisappearOffscreen(bubbleType: string): boolean {
        const disappearTypes = ['rainbow', 'pink', 'clock', 'score', 'electric', 'poison'];
        return disappearTypes.includes(bubbleType);
    }
    
    /**
     * 指定範囲内のバブルを取得
     */
    getBubblesInRadius(bubbles: Bubble[], x: number, y: number, radius: number): Bubble[] {
        const nearbyBubbles: Bubble[] = [];
        
        bubbles.forEach(bubble => {
            if (!bubble.isAlive) return;
            
            const distance = Math.sqrt(
                Math.pow(bubble.position.x - x, 2) + 
                Math.pow(bubble.position.y - y, 2)
            );
            
            if (distance < radius + bubble.size) {
                nearbyBubbles.push(bubble);
            }
        });
        
        return nearbyBubbles;
    }
    
    /**
     * パス上のバブルを取得
     */
    getBubblesAlongPath(bubbles: Bubble[], startPos: Position, endPos: Position): Bubble[] {
        const pathBubbles: Bubble[] = [];
        const pathLength = Math.sqrt(
            Math.pow(endPos.x - startPos.x, 2) + 
            Math.pow(endPos.y - startPos.y, 2)
        );
        
        const direction = {
            x: (endPos.x - startPos.x) / pathLength,
            y: (endPos.y - startPos.y) / pathLength
        };
        
        // パス上のバブルを検出
        bubbles.forEach(bubble => {
            if (!bubble.isAlive) return;
            
            // 点と線分の最短距離を計算
            const distance = this.pointToLineDistance(
                bubble.position,
                startPos,
                endPos
            );
            
            // バブルの半径内にパスが通っている場合
            if (distance < bubble.size) {
                pathBubbles.push(bubble);
            }
        });
        
        return pathBubbles;
    }
    
    /**
     * 点と線分の最短距離を計算
     */
    pointToLineDistance(point: Position, lineStart: Position, lineEnd: Position): number {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx: number, yy: number;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
}