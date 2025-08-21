import type { BubbleDragSystem as IBubbleDragSystem, 
    BubblePhysicsEngine,
    Bubble, ;
    Position,
    Vector2  } from '../../types/game';

interface DragHistoryEntry { x: number,
    y: number;
   , time: number ,}

/**
 * BubbleDragSystem - 泡ドラッグ操作システム
 * 
 * 泡のドラッグ＆フリック操作、速度計算、軌跡描画を専門的に管理します
 */
export class BubbleDragSystem implements IBubbleDragSystem { private draggedBubble: Bubble | null = null
    private, isDragging: boolean = false;
    // @ts-ignore 将来のドラッグ機能拡張で使用予定 }
    private __dragStartPosition: Position = { x: 0, y: 0 ,}
    // @ts-ignore 将来のドラッグ機能拡張で使用予定
    private __dragCurrentPosition: Position = { x: 0, y: 0 ,}
    private dragHistory: DragHistoryEntry[] = []; // ドラッグ軌跡の履歴（速度計算用）

    constructor() { // 初期化済み }
    
    /**
     * ドラッグ開始処理
     */
    handleDragStart(bubbles: Bubble[], x: number, y: number): Bubble | null { // ドラッグ対象の泡を検索（最前面から）
        for(let, i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            
            if(bubble.containsPoint(x, y) {
                this.draggedBubble = bubble;
        }
                this.isDragging = true; }
                this.__dragStartPosition = { x, y };
                this.__dragCurrentPosition = { x, y };
                this.dragHistory = [{ x, y, time: Date.now( ,}];
                
                console.log(`Drag started on ${bubble.type} bubble`});
                return bubble; // 泡オブジェクトを返す
            }
        }
        
        return null;
    }
    
    /**
     * ドラッグ移動処理
     */
    handleDragMove(x: number, y: number): boolean { if (!this.isDragging || !this.draggedBubble) {
            return false; }
        
        this.__dragCurrentPosition = { x, y };
        
        // 履歴を記録（最新の10個まで保持）
        this.dragHistory.push({ x, y, time: Date.now( ,});
        if (this.dragHistory.length > 10) { this.dragHistory.shift(); }
        
        return true;
    }
    
    /**
     * ドラッグ終了処理
     */
    handleDragEnd(startX: number, startY: number, endX: number, endY: number, physicsEngine: BubblePhysicsEngine): boolean { if (!this.isDragging || !this.draggedBubble) {
            return false; }
        
        // ドラッグベクトルを計算
        const dragVector: Vector2 = { x: endX - startX,
            y: endY - startY ,};
        // ドラッグ距離を計算
        const dragDistance = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
        
        // 最小ドラッグ距離をチェック
        if(dragDistance < 15) {
            this.resetDrag();
        }
            return false;
        
        // 履歴から速度を計算（より滑らかな投擲）
        const velocity = this.calculateVelocityFromHistory();
        
        // フリック強度を計算
        const flickStrength = this.calculateFlickStrength(dragVector, velocity);
        
        // 力の方向を計算
        const forceDirection = this.calculateForceDirection(dragVector, velocity);
        
        // 泡に物理的な力を適用
        physicsEngine.applyForceToBubble(this.draggedBubble, forceDirection, flickStrength);
        
        console.log(`Bubble, flicked with, strength: ${flickStrength.toFixed(1}), direction: (${forceDirection.x.toFixed(2}), ${forceDirection.y.toFixed(2}))`);
        
        this.resetDrag();
        return true;
    }
    
    /**
     * ドラッグ履歴から速度を計算
     */
    calculateVelocityFromHistory(): Vector2 { if (this.dragHistory.length < 2) { }
            return { x: 0, y: 0 ,}
        
        const recent = this.dragHistory[this.dragHistory.length - 1];
        const previous = this.dragHistory[this.dragHistory.length - 2];
        const timeDiff = Math.max(recent.time - previous.time, 1); // ゼロ除算防止
        
        return { x: (recent.x - previous.x) / timeDiff * 1000, // ピクセル/秒 };
            y: (recent.y - previous.y) / timeDiff * 1000 }
        }
    
    /**
     * フリック強度を計算
     */
    calculateFlickStrength(dragVector: Vector2, velocity: Vector2): number { const dragDistance = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
        const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // ドラッグ距離と速度の両方を考慮
        const distanceComponent = Math.min(dragDistance / 30, 10); // 最大10倍
        const velocityComponent = Math.min(velocityMagnitude / 100, 5); // 最大5倍
        
        return Math.max(1, distanceComponent * 0.7 + velocityComponent * 0.3) * 250; // 基本力250 }
    
    /**
     * 力の方向を計算
     */
    calculateForceDirection(dragVector: Vector2, velocity: Vector2): Vector2 { // ドラッグベクトルと速度ベクトルを合成
        const combinedVector: Vector2 = {
            x: dragVector.x * 0.6 + velocity.x * 0.4;
           , y: dragVector.y * 0.6 + velocity.y * 0.4 };
        const magnitude = Math.sqrt(combinedVector.x * combinedVector.x + combinedVector.y * combinedVector.y);
        if(magnitude === 0) {
            
        }
            return { x: 0, y: 0 ,}
        
        return { x: combinedVector.x / magnitude, };
            y: combinedVector.y / magnitude }
        }
    
    /**
     * ドラッグ状態をリセット
     */
    resetDrag(): void { this.isDragging = false;
        this.draggedBubble = null; }
        this.__dragStartPosition = { x: 0, y: 0 ,}
        this.__dragCurrentPosition = { x: 0, y: 0 ,}
        this.dragHistory = [];
    }
    
    /**
     * ドラッグ軌跡の描画（デバッグ用）
     */
    renderDragTrail(context: CanvasRenderingContext2D, renderQuality: number): void { if (renderQuality > 0.8 && this.isDragging && this.dragHistory.length > 1) {''
            context.save()';
            context.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            context.lineWidth = 2;
            context.setLineDash([3, 3]);
            
            context.beginPath();
            context.moveTo(this.dragHistory[0].x, this.dragHistory[0].y);
            
            for(let, i = 1; i < this.dragHistory.length; i++) {
            
                
            
            }
                context.lineTo(this.dragHistory[i].x, this.dragHistory[i].y); }
            }
            
            context.stroke();
            context.restore();
        }
    }
    
    /**
     * ドラッグ中かどうか
     */
    isDragInProgress(): boolean { return this.isDragging; }
    
    /**
     * ドラッグ中の泡を取得'
     */''
    getDraggedBubble(');