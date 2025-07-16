/**
 * 入力管理クラス - ドラッグ操作を含む統一的な入力処理
 */
export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.isDragging = false;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragCurrentPosition = { x: 0, y: 0 };
        this.draggedBubble = null;
        this.dragThreshold = 10; // ドラッグ判定の最小距離
        this.isMouseDown = false;
        this.mouseDownTime = 0;
        this.clickThreshold = 200; // クリック判定の最大時間(ms)
        
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // マウスイベント
        this.canvas.addEventListener('mousedown', (event) => this.handlePointerDown(event));
        this.canvas.addEventListener('mousemove', (event) => this.handlePointerMove(event));
        this.canvas.addEventListener('mouseup', (event) => this.handlePointerUp(event));
        
        // タッチイベント
        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.handlePointerDown(event);
        });
        this.canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.handlePointerMove(event);
        });
        this.canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.handlePointerUp(event);
        });
    }
    
    /**
     * ポインター押下処理
     */
    handlePointerDown(event) {
        const position = this.getPointerPosition(event);
        
        this.isMouseDown = true;
        this.mouseDownTime = Date.now();
        this.dragStartPosition = { ...position };
        this.dragCurrentPosition = { ...position };
        this.isDragging = false;
        this.draggedBubble = null;
        
        // イベントを通知
        this.notifyPointerDown(position);
    }
    
    /**
     * ポインター移動処理
     */
    handlePointerMove(event) {
        const position = this.getPointerPosition(event);
        this.dragCurrentPosition = { ...position };
        
        // ドラッグ判定
        if (this.isMouseDown && !this.isDragging) {
            const distance = this.calculateDistance(this.dragStartPosition, position);
            if (distance > this.dragThreshold) {
                this.startDrag();
            }
        }
        
        // ドラッグ中の処理
        if (this.isDragging) {
            this.notifyDragMove(position);
        } else {
            // 通常のマウス移動
            this.notifyPointerMove(position);
        }
    }
    
    /**
     * ポインター離上処理
     */
    handlePointerUp(event) {
        const position = this.getPointerPosition(event);
        const holdTime = Date.now() - this.mouseDownTime;
        
        if (this.isDragging) {
            // ドラッグ終了処理
            this.endDrag(position);
        } else if (holdTime < this.clickThreshold) {
            // クリック処理
            this.notifyClick(position);
        }
        
        this.isMouseDown = false;
        this.isDragging = false;
        this.draggedBubble = null;
    }
    
    /**
     * ドラッグ開始
     */
    startDrag() {
        this.isDragging = true;
        this.notifyDragStart(this.dragStartPosition);
    }
    
    /**
     * ドラッグ終了
     */
    endDrag(endPosition) {
        const dragVector = {
            x: endPosition.x - this.dragStartPosition.x,
            y: endPosition.y - this.dragStartPosition.y
        };
        
        this.notifyDragEnd(this.dragStartPosition, endPosition, dragVector);
    }
    
    /**
     * ポインター位置を取得
     */
    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        
        if (event.type.startsWith('mouse')) {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else {
            const touch = event.touches[0] || event.changedTouches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        }
        
        return { x, y };
    }
    
    /**
     * 距離を計算
     */
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * ドラッグベクトルを正規化
     */
    normalizeDragVector(vector) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude === 0) return { x: 0, y: 0 };
        
        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    }
    
    /**
     * ドラッグ力を計算（距離に基づく）
     */
    calculateDragForce(dragVector) {
        const distance = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
        const maxForce = 1000; // 最大力
        const forceMultiplier = Math.min(distance / 100, 5); // 距離に応じた倍率（最大5倍）
        
        return Math.min(maxForce * forceMultiplier, maxForce);
    }
    
    // イベント通知メソッド（オーバーライド用）
    notifyPointerDown(position) {
        // サブクラスでオーバーライド
    }
    
    notifyPointerMove(position) {
        // サブクラスでオーバーライド
    }
    
    notifyClick(position) {
        // サブクラスでオーバーライド
    }
    
    notifyDragStart(startPosition) {
        // サブクラスでオーバーライド
    }
    
    notifyDragMove(currentPosition) {
        // サブクラスでオーバーライド
    }
    
    notifyDragEnd(startPosition, endPosition, dragVector) {
        // サブクラスでオーバーライド
    }
    
    /**
     * 現在のドラッグ状態を取得
     */
    getDragState() {
        return {
            isDragging: this.isDragging,
            startPosition: { ...this.dragStartPosition },
            currentPosition: { ...this.dragCurrentPosition },
            draggedBubble: this.draggedBubble
        };
    }
}