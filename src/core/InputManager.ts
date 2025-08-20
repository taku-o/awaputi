// TypeScript conversion - basic types
interface BasicConfig { [key: string]: any, }
}
import { getBrowserCompatibility, type ScreenInfo } from '../utils/BrowserCompatibility.js';

/**
 * 入力管理クラス - ドラッグ操作を含む統一的な入力処理（クロスブラウザ・デバイス対応強化版）
 */
export class InputManager {
    private config: BasicConfig;
    private state: any;
    constructor(canvas: any) {

        this.canvas = canvas

    }
    }
        this.isDragging = false; }
        this.dragStartPosition = { x: 0, y: 0 }
        this.dragCurrentPosition = { x: 0, y: 0 }
        this.draggedBubble = null;
        
        // デバイス固有の設定
        this.setupDeviceSpecificSettings();
        
        // マルチタッチ対応
        this.activeTouches = new Map();
        this.maxTouches = 2; // 最大同時タッチ数
        
        // ジェスチャー認識
        this.gestureState = { isPinching: false,
            isRotating: false,
            lastPinchDistance: 0,
            lastRotationAngle: 0 }
        },
        
        // イベント処理の最適化
        this.eventQueue = [];
        this.isProcessingEvents = false;
        
        this.setupEventListeners();
    }
    
    /**
     * デバイス固有の設定を行う
     */
    setupDeviceSpecificSettings() {
        const deviceInfo = getBrowserCompatibility().deviceInfo;
        const browserInfo = getBrowserCompatibility().browserInfo;
        ;
        // タッチデバイスの設定
        if (deviceInfo.isTouchDevice') {
            this.dragThreshold = deviceInfo.isMobile ? 15 : 10; // モバイルは少し大きく
            this.clickThreshold = 300; // タッチデバイスは長めに
    }
            this.tapTimeout = 200; // ダブルタップ判定時間 }
        } else {  this.dragThreshold = 5;
            this.clickThreshold = 200; }
            this.tapTimeout = 300; }
        }
        ;
        // ブラウザ固有の調整
        if(browserInfo.name === 'safari' && deviceInfo.isMobile) {
            // iOS Safari は特別な処理が必要
            this.clickThreshold = 400;
        }
            this.dragThreshold = 20; }
        }
        
        // 状態管理
        this.isMouseDown = false;
        this.mouseDownTime = 0;
        this.lastTapTime = 0;
        this.tapCount = 0;
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        const deviceInfo = getBrowserCompatibility().deviceInfo;
        const features = getBrowserCompatibility().features;
        
        // ポインターイベントが利用可能な場合は優先的に使用
        if (features.pointerEvents) {
    }
            this.setupPointerEvents(); }
        } else {  // フォールバック: マウス・タッチイベント }
            this.setupMouseAndTouchEvents(); }
        }
        
        // キーボードイベント（デスクトップ用）
        if (deviceInfo.isDesktop) { this.setupKeyboardEvents(); }
        }
        
        // ジェスチャーイベント（タッチデバイス用）
        if(deviceInfo.isTouchDevice) {
            '';
            this.setupGestureEvents();
        }'
        this.canvas.addEventListener('contextmenu', (event) => {  }
            event.preventDefault(); }
        };
    }
    
    /**
     * ポインターイベントを設定'
     */''
    setupPointerEvents()';
        this.canvas.addEventListener('pointerdown', (event) => {  ' }'
            this.handleEnhancedPointerDown(event'); }'
        };''
        this.canvas.addEventListener('pointermove', (event) => {  ' }'
            this.handleEnhancedPointerMove(event'); }'
        };''
        this.canvas.addEventListener('pointerup', (event) => {  ' }'
            this.handleEnhancedPointerUp(event'); }'
        };''
        this.canvas.addEventListener('pointercancel', (event) => { this.handlePointerCancel(event); }
        };
    }
    
    /**
     * マウス・タッチイベントを設定（フォールバック）'
     */''
    setupMouseAndTouchEvents()';
        this.canvas.addEventListener('mousedown', (event) => this.handlePointerDown(event)');''
        this.canvas.addEventListener('mousemove', (event) => this.handlePointerMove(event)');''
        this.canvas.addEventListener('mouseup', (event) => this.handlePointerUp(event)');
        
        // タッチイベント
        const touchOptions = { passive: false }''
        this.canvas.addEventListener('touchstart', (event) => {  event.preventDefault(); }'
            this.handleTouchStart(event);' }'
        }, touchOptions');''
        this.canvas.addEventListener('touchmove', (event) => {  event.preventDefault(); }'
            this.handleTouchMove(event);' }'
        }, touchOptions');''
        this.canvas.addEventListener('touchend', (event) => {  event.preventDefault(); }'
            this.handleTouchEnd(event);' }'
        }, touchOptions');''
        this.canvas.addEventListener('touchcancel', (event) => {  event.preventDefault(); }
            this.handleTouchCancel(event); }
        }, touchOptions);
    }
    
    /**
     * キーボードイベントを設定'
     */''
    setupKeyboardEvents()';
        document.addEventListener('keydown', (event) => {  ' }'
            this.handleKeyDown(event'); }'
        };''
        document.addEventListener('keyup', (event) => { this.handleKeyUp(event); }
        };
    }
    
    /**
     * ジェスチャーイベントを設定
     */
    setupGestureEvents() {'
        // iOS Safari のジェスチャーイベント
        if (getBrowserCompatibility(').browserInfo.name === 'safari'') {''
            this.canvas.addEventListener('gesturestart', (event) => { 
    }'
                event.preventDefault();' }'
                this.handleGestureStart(event'); }'
            };''
            this.canvas.addEventListener('gesturechange', (event) => {  event.preventDefault();' }'
                this.handleGestureChange(event'); }'
            };''
            this.canvas.addEventListener('gestureend', (event) => {  event.preventDefault(); }
                this.handleGestureEnd(event); }
            };
        }
    }
    
    /**
     * ポインター押下処理
     */
    handlePointerDown(event) {
        const position = this.getPointerPosition(event);
        
        this.isMouseDown = true;
    }
        this.mouseDownTime = Date.now(); }
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
    handlePointerMove(event) { const position = this.getPointerPosition(event); }
        this.dragCurrentPosition = { ...position };
        
        // ドラッグ判定
        if(this.isMouseDown && !this.isDragging) {
            const distance = this.calculateDistance(this.dragStartPosition, position);
            if (distance > this.dragThreshold) {
        }
                this.startDrag(); }
            }
        }
        
        // ドラッグ中の処理
        if (this.isDragging) { this.notifyDragMove(position); }
        } else {  // 通常のマウス移動 }
            this.notifyPointerMove(position); }
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
    }
            this.endDrag(position); }
        } else if (holdTime < this.clickThreshold) { // クリック処理
            this.notifyClick(position); }
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
    }
        this.notifyDragStart(this.dragStartPosition); }
    }
    
    /**
     * ドラッグ終了
     */
    endDrag(endPosition) {
        const dragVector = {
            x: endPosition.x - this.dragStartPosition.x }
            y: endPosition.y - this.dragStartPosition.y }
        },
        
        this.notifyDragEnd(this.dragStartPosition, endPosition, dragVector);
    }
    
    /**
     * ポインター位置を取得
     */
    getPointerPosition(event) {
        '';
        const rect = this.canvas.getBoundingClientRect()';
        if (event.type.startsWith('mouse'') || event.type.startsWith('pointer')') {
            x = event.clientX - rect.left;
    }'
            y = event.clientY - rect.top;' }'
        } else if(event.type.startsWith('touch') { // タッチイベントの安全な処理
            const touches = event.touches || event.changedTouches || [];
            if(touches.length > 0) {
                const touch = touches[0];
                x = touch.clientX - rect.left;
            }
                y = touch.clientY - rect.top; }
            } else {  // フォールバック: マウスイベントとして処理
                x = event.clientX - rect.left; }
                y = event.clientY - rect.top; }
            }
        } else {  // その他のイベントはマウスイベントとして処理
            x = event.clientX - rect.left; }
            y = event.clientY - rect.top; }
        }
        
        // 座標変換システムで使用できるよう元のイベントも含める
        return { x, 
            y,  };
            originalEvent: event  }
        },
    }
    
    /**
     * 距離を計算
     */
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
    }
        return Math.sqrt(dx * dx + dy * dy); }
    }
    
    /**
     * ドラッグベクトルを正規化
     */
    normalizeDragVector(vector) { const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y); }
        if (magnitude === 0) return { x: 0, y: 0 }
        return { x: vector.x / magnitude, };
            y: vector.y / magnitude }
        },
    }
    
    /**
     * ドラッグ力を計算（距離に基づく）
     */
    calculateDragForce(dragVector) {
        const distance = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
        const maxForce = 1000; // 最大力
        const forceMultiplier = Math.min(distance / 100, 5); // 距離に応じた倍率（最大5倍）
        
    }
        return Math.min(maxForce * forceMultiplier, maxForce); }
    }
    
    // イベント通知メソッド（オーバーライド用）
    notifyPointerDown(position) { // サブクラスでオーバーライド }
    }
    
    notifyPointerMove(position) { // サブクラスでオーバーライド }
    }
    
    notifyClick(position) { // サブクラスでオーバーライド }
    }
    
    notifyDragStart(startPosition) { // サブクラスでオーバーライド }
    }
    
    notifyDragMove(currentPosition) { // サブクラスでオーバーライド }
    }
    
    notifyDragEnd(startPosition, endPosition, dragVector) { // サブクラスでオーバーライド }
    }
    
    /**
     * 拡張ポインター押下処理（ポインターイベント用）
     */
    handleEnhancedPointerDown(event) {
        const position = this.getEnhancedPointerPosition(event);
        
        // マルチタッチ対応
        this.activeTouches.set(event.pointerId, {)
            id: event.pointerId,);
            position: position),
            startTime: Date.now(),
    }
            type: event.pointerType }
        },
        
        // 最初のタッチの場合は通常の処理
        if (this.activeTouches.size === 1) { this.handlePointerDown(event); }
        } else if (this.activeTouches.size === 2) { // 2点タッチの場合はジェスチャー開始
            this.startMultiTouchGesture(); }
        }
    }
    
    /**
     * 拡張ポインター移動処理
     */
    handleEnhancedPointerMove(event) {
        const position = this.getEnhancedPointerPosition(event);
        
        if(this.activeTouches.has(event.pointerId) {
            this.activeTouches.get(event.pointerId).position = position;
            
            if (this.activeTouches.size === 1) {
    }
                this.handlePointerMove(event); }
            } else if (this.activeTouches.size === 2) { this.handleMultiTouchMove(); }
            }
        }
    }
    
    /**
     * 拡張ポインター離上処理
     */
    handleEnhancedPointerUp(event) {
        if(this.activeTouches.has(event.pointerId) {
            const touch = this.activeTouches.get(event.pointerId);
            this.activeTouches.delete(event.pointerId);
            
            if (this.activeTouches.size === 0) {
    }
                this.handlePointerUp(event); }
            } else if (this.activeTouches.size === 1) { // マルチタッチからシングルタッチに戻る
                this.endMultiTouchGesture(); }
            }
        }
    }
    
    /**
     * ポインターキャンセル処理
     */
    handlePointerCancel(event) {
        if(this.activeTouches.has(event.pointerId) {
            this.activeTouches.delete(event.pointerId);
            
            if (this.activeTouches.size === 0) {
    }
                this.resetInputState(); }
            }
        }
    }
    
    /**
     * タッチ開始処理
     */
    handleTouchStart(event) {
        // マルチタッチ対応
        for (let i = 0; i < event.touches.length && i < this.maxTouches; i++) {
            const touch = event.touches[i];
            const position = this.getTouchPosition(touch);
            
            this.activeTouches.set(touch.identifier, {)
                id: touch.identifier,);
                position: position),'';
                startTime: Date.now(''
    }'
                type: 'touch' })
            })
        }
        );
        if(this.activeTouches.size === 1) {'
            // シングルタッチ
            const firstTouch = Array.from(this.activeTouches.values())[0];
            this.handlePointerDown({ )
                clientX: firstTouch.position.x)';
                clientY: firstTouch.position.y,')
        }'
                type: 'touchstart'); }
        } else if (this.activeTouches.size === 2) { // マルチタッチジェスチャー開始
            this.startMultiTouchGesture(); }
        }
    }
    
    /**
     * タッチ移動処理
     */
    handleTouchMove(event) {
        // アクティブなタッチを更新
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            if(this.activeTouches.has(touch.identifier) {
                const position = this.getTouchPosition(touch);
    }
                this.activeTouches.get(touch.identifier).position = position; }
            }
        }
        
        if(this.activeTouches.size === 1) {
        ';'
            '';
            const firstTouch = Array.from(this.activeTouches.values()')[0];
            this.handlePointerMove({)
                clientX: firstTouch.position.x)';
                clientY: firstTouch.position.y,')
        }'
                type: 'touchmove'); }
        } else if (this.activeTouches.size === 2) { this.handleMultiTouchMove(); }
        }
    }
    
    /**
     * タッチ終了処理
     */
    handleTouchEnd(event) {
        // 終了したタッチを削除
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if(this.activeTouches.has(touch.identifier) {
                const touchData = this.activeTouches.get(touch.identifier);
                this.activeTouches.delete(touch.identifier);
                
                // タップ判定
                if (this.activeTouches.size === 0) {
                    const holdTime = Date.now() - touchData.startTime;
                    if (holdTime < this.clickThreshold && !this.isDragging) {
    }
                        this.handleTap(touchData.position, holdTime); }
                    }
                }
            }
        }
        '';
        if(this.activeTouches.size === 0') {
            this.handlePointerUp({)
                clientX: 0)';
                clientY: 0,')
        }'
                type: 'touchend'); }
        } else if (this.activeTouches.size === 1) { this.endMultiTouchGesture(); }
        }
    }
    
    /**
     * タッチキャンセル処理
     */
    handleTouchCancel(event) {
        this.activeTouches.clear();
    }
        this.resetInputState(); }
    }
    
    /**
     * キーボード押下処理
     */
    handleKeyDown(event) {'
        // ゲーム固有のキーボードショートカット
        switch (event.code') {''
            case 'Space':'';
                event.preventDefault()';
                this.notifyKeyAction('pause'');'
                break;''
            case 'Escape':'';
                this.notifyKeyAction('menu'');'
                break;''
            case 'KeyF':'';
                if (getBrowserCompatibility().deviceInfo.isDesktop') {'
    }'
                    this.notifyKeyAction('fullscreen'); }
                }
                break;
        }
    }
    
    /**
     * キーボード離上処理
     */
    handleKeyUp(event) { // 必要に応じて実装 }
    }
    
    /**
     * ジェスチャー開始処理（iOS Safari）
     */
    handleGestureStart(event) {
        this.gestureState.isPinching = true;
    }
        this.gestureState.lastPinchDistance = event.scale; }
    }
    
    /**
     * ジェスチャー変更処理（iOS Safari）
     */
    handleGestureChange(event) {
        if (this.gestureState.isPinching) {
            const scaleDelta = event.scale - this.gestureState.lastPinchDistance;
            this.notifyPinchGesture(event.scale, scaleDelta);
    }
            this.gestureState.lastPinchDistance = event.scale; }
        }
    }
    
    /**
     * ジェスチャー終了処理（iOS Safari）
     */
    handleGestureEnd(event) {
        this.gestureState.isPinching = false;
    }
        this.gestureState.lastPinchDistance = 0; }
    }
    
    /**
     * マルチタッチジェスチャー開始
     */
    startMultiTouchGesture() {
        if (this.activeTouches.size !== 2) return;
        
        const touches = Array.from(this.activeTouches.values();
        const distance = this.calculateDistance(touches[0].position, touches[1].position);
        
        this.gestureState.isPinching = true;
        this.gestureState.lastPinchDistance = distance;
        
        // ドラッグ状態をリセット
        this.isDragging = false;
    }
        this.isMouseDown = false; }
    }
    
    /**
     * マルチタッチ移動処理
     */
    handleMultiTouchMove() {
        if (this.activeTouches.size !== 2 || !this.gestureState.isPinching) return;
        
        const touches = Array.from(this.activeTouches.values();
        const currentDistance = this.calculateDistance(touches[0].position, touches[1].position);
        const scaleDelta = currentDistance - this.gestureState.lastPinchDistance;
        
        if (Math.abs(scaleDelta) > 5) { // 最小変化量
            const scale = currentDistance / this.gestureState.lastPinchDistance;
            this.notifyPinchGesture(scale, scaleDelta);
    }
            this.gestureState.lastPinchDistance = currentDistance; }
        }
    }
    
    /**
     * マルチタッチジェスチャー終了
     */
    endMultiTouchGesture() {
        this.gestureState.isPinching = false;
    }
        this.gestureState.lastPinchDistance = 0; }
    }
    
    /**
     * タップ処理
     */
    handleTap(position, holdTime) {
        const currentTime = Date.now();
        
        // ダブルタップ判定
        if (currentTime - this.lastTapTime < this.tapTimeout) {
            this.tapCount++;
            if (this.tapCount === 2) {
                this.notifyDoubleTap(position);
                this.tapCount = 0;
    }
                return; }
            }
        } else { this.tapCount = 1; }
        }
        
        this.lastTapTime = currentTime;
        
        // シングルタップとして処理
        setTimeout(() => {  if (this.tapCount === 1) {
                this.notifyClick(position); }
                this.tapCount = 0; }
            }
        }, this.tapTimeout);
    }
    
    /**
     * 拡張ポインター位置取得
     */
    getEnhancedPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            pressure: event.pressure || 1,
    }
            tiltX: event.tiltX || 0, };
            tiltY: event.tiltY || 0 }
        },
    }
    
    /**
     * タッチ位置取得
     */
    getTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
    }
        return { x: touch.clientX - rect.left, };
            y: touch.clientY - rect.top }
        },
    }
    
    /**
     * 入力状態をリセット
     */
    resetInputState() {
        this.isMouseDown = false;
        this.isDragging = false;
        this.draggedBubble = null;
        this.activeTouches.clear();
        this.gestureState.isPinching = false;
    }
        this.gestureState.lastPinchDistance = 0; }
    }
    
    /**
     * デバイス情報を取得
     */
    getDeviceInfo() {
        return { ...getBrowserCompatibility().deviceInfo,
            activeTouches: this.activeTouches.size,
            maxTouches: this.maxTouches,
    }
            dragThreshold: this.dragThreshold, };
            clickThreshold: this.clickThreshold }
        },
    }
    
    // 拡張通知メソッド
    notifyDoubleTap(position) { // サブクラスでオーバーライド }
    }
    
    notifyPinchGesture(scale, scaleDelta) { // サブクラスでオーバーライド }
    }
    
    notifyKeyAction(action) { // サブクラスでオーバーライド }
    }
    
    /**
     * 現在のドラッグ状態を取得
     */
    getDragState() { return {  };
            isDragging: this.isDragging, }
            startPosition: { ...this.dragStartPosition },
            currentPosition: { ...this.dragCurrentPosition },
            draggedBubble: this.draggedBubble,
            activeTouches: this.activeTouches.size,
            gestureState: { ...this.gestureState }
        },
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        ';'
    }'
        this.resetInputState(') }')