// TypeScript conversion - basic types
interface BasicConfig { 
    [key: string]: any;
}

import { getBrowserCompatibility } from '../utils/BrowserCompatibility.js';

interface Point {
    x: number;
    y: number;
}

interface GestureState {
    isPinching: boolean;
    isRotating: boolean;
    lastPinchDistance: number;
    lastRotationAngle: number;
}

interface TouchInfo {
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    timestamp: number;
}

/**
 * 入力管理クラス - ドラッグ操作を含む統一的な入力処理（クロスブラウザ・デバイス対応強化版）
 */
export class InputManager {
    private config: BasicConfig;
    private state: any;
    private canvas: HTMLCanvasElement;
    private isDragging: boolean;
    private dragStartPosition: Point;
    private dragCurrentPosition: Point;
    private draggedBubble: any;
    private activeTouches: Map<number, TouchInfo>;
    private maxTouches: number;
    private gestureState: GestureState;
    private eventQueue: any[];
    private isProcessingEvents: boolean;
    private dragThreshold: number;
    private clickThreshold: number;
    private tapTimeout: number;
    private isMouseDown: boolean;
    private mouseDownTime: number;
    private lastTapTime: number;
    private tapCount: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.isDragging = false;
        this.dragStartPosition = { x: 0, y: 0 };
        this.dragCurrentPosition = { x: 0, y: 0 };
        this.draggedBubble = null;
        
        // デバイス固有の設定
        this.setupDeviceSpecificSettings();
        
        // マルチタッチ対応
        this.activeTouches = new Map();
        this.maxTouches = 2; // 最大同時タッチ数
        
        // ジェスチャー認識
        this.gestureState = { 
            isPinching: false,
            isRotating: false,
            lastPinchDistance: 0,
            lastRotationAngle: 0  
        };

        // イベント処理の最適化
        this.eventQueue = [];
        this.isProcessingEvents = false;
        
        // 状態管理
        this.isMouseDown = false;
        this.mouseDownTime = 0;
        this.lastTapTime = 0;
        this.tapCount = 0;

        // 初期化
        this.config = {};
        this.state = {};
        
        this.setupEventListeners();
    }
    
    /**
     * デバイス固有の設定を行う
     */
    setupDeviceSpecificSettings(): void {
        const deviceInfo = getBrowserCompatibility().deviceInfo;
        const browserInfo = getBrowserCompatibility().browserInfo;

        // タッチデバイスの設定
        if (deviceInfo.isTouchDevice) {
            this.dragThreshold = deviceInfo.isMobile ? 15 : 10; // モバイルは少し大きく
            this.clickThreshold = 300; // タッチデバイスは長めに
            this.tapTimeout = 200; // ダブルタップ判定時間
        } else {  
            this.dragThreshold = 5;
            this.clickThreshold = 200;
            this.tapTimeout = 300;
        }

        // ブラウザ固有の調整
        if (browserInfo.name === 'safari' && deviceInfo.isMobile) {
            // iOS Safari は特別な処理が必要
            this.clickThreshold = 400;
            this.dragThreshold = 20;
        }
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners(): void {
        const deviceInfo = getBrowserCompatibility().deviceInfo;
        const features = getBrowserCompatibility().features;
        
        // ポインターイベントが利用可能な場合は優先的に使用
        if (features.pointerEvents) {
            this.setupPointerEvents();
        } else {  
            // フォールバック: マウス・タッチイベント
            this.setupMouseAndTouchEvents();
        }
        
        // キーボードイベント（デスクトップ用）
        if (deviceInfo.isDesktop) { 
            this.setupKeyboardEvents();
        }
        
        // ジェスチャーイベント（タッチデバイス用）
        if (deviceInfo.isTouchDevice) {
            this.setupGestureEvents();
        }

        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    /**
     * ポインターイベントを設定
     */
    setupPointerEvents(): void {
        this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this), { passive: false });
        this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this), { passive: false });
        this.canvas.addEventListener('pointerup', this.handlePointerUp.bind(this), { passive: false });
        this.canvas.addEventListener('pointercancel', this.handlePointerCancel.bind(this), { passive: false });
    }

    /**
     * マウス・タッチイベントを設定
     */
    setupMouseAndTouchEvents(): void {
        // マウスイベント
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this), { passive: false });
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: false });
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this), { passive: false });

        // タッチイベント
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    }

    /**
     * キーボードイベントを設定
     */
    setupKeyboardEvents(): void {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * ジェスチャーイベントを設定
     */
    setupGestureEvents(): void {
        this.canvas.addEventListener('gesturestart', this.handleGestureStart.bind(this), { passive: false });
        this.canvas.addEventListener('gesturechange', this.handleGestureChange.bind(this), { passive: false });
        this.canvas.addEventListener('gestureend', this.handleGestureEnd.bind(this), { passive: false });
    }

    // ポインターイベントハンドラー
    handlePointerDown(event: PointerEvent): void {
        event.preventDefault();
        const point = this.getEventPosition(event);
        this.startDrag(point, event.pointerId);
    }

    handlePointerMove(event: PointerEvent): void {
        event.preventDefault();
        const point = this.getEventPosition(event);
        this.updateDrag(point, event.pointerId);
    }

    handlePointerUp(event: PointerEvent): void {
        event.preventDefault();
        const point = this.getEventPosition(event);
        this.endDrag(point, event.pointerId);
    }

    handlePointerCancel(event: PointerEvent): void {
        event.preventDefault();
        this.cancelDrag(event.pointerId);
    }

    // マウスイベントハンドラー
    handleMouseDown(event: MouseEvent): void {
        event.preventDefault();
        const point = this.getEventPosition(event);
        this.startDrag(point, -1); // マウスIDは-1
    }

    handleMouseMove(event: MouseEvent): void {
        event.preventDefault();
        const point = this.getEventPosition(event);
        this.updateDrag(point, -1);
    }

    handleMouseUp(event: MouseEvent): void {
        event.preventDefault();
        const point = this.getEventPosition(event);
        this.endDrag(point, -1);
    }

    // タッチイベントハンドラー
    handleTouchStart(event: TouchEvent): void {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const point = this.getEventPosition(touch);
            this.startDrag(point, touch.identifier);
        }
    }

    handleTouchMove(event: TouchEvent): void {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const point = this.getEventPosition(touch);
            this.updateDrag(point, touch.identifier);
        }
    }

    handleTouchEnd(event: TouchEvent): void {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const point = this.getEventPosition(touch);
            this.endDrag(point, touch.identifier);
        }
    }

    handleTouchCancel(event: TouchEvent): void {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.cancelDrag(touch.identifier);
        }
    }

    // キーボードイベントハンドラー
    handleKeyDown(event: KeyboardEvent): void {
        // キーボード処理は必要に応じて実装
        console.log('Key down:', event.key);
    }

    handleKeyUp(event: KeyboardEvent): void {
        // キーボード処理は必要に応じて実装
        console.log('Key up:', event.key);
    }

    // ジェスチャーイベントハンドラー
    handleGestureStart(event: any): void {
        event.preventDefault();
        this.gestureState.isPinching = true;
        this.gestureState.lastPinchDistance = 0;
    }

    handleGestureChange(event: any): void {
        event.preventDefault();
        if (this.gestureState.isPinching) {
            // ピンチジェスチャー処理
            console.log('Gesture change:', event.scale);
        }
    }

    handleGestureEnd(event: any): void {
        event.preventDefault();
        this.gestureState.isPinching = false;
        this.gestureState.lastPinchDistance = 0;
    }

    // 共通ドラッグ処理
    startDrag(point: Point, id: number): void {
        this.isDragging = true;
        this.dragStartPosition = { ...point };
        this.dragCurrentPosition = { ...point };
        this.isMouseDown = true;
        this.mouseDownTime = Date.now();

        // タッチ情報を記録
        if (id !== -1) {
            this.activeTouches.set(id, {
                id,
                x: point.x,
                y: point.y,
                startX: point.x,
                startY: point.y,
                timestamp: Date.now()
            });
        }
    }

    updateDrag(point: Point, id: number): void {
        if (!this.isDragging) return;

        this.dragCurrentPosition = { ...point };

        // タッチ情報を更新
        if (id !== -1 && this.activeTouches.has(id)) {
            const touch = this.activeTouches.get(id)!;
            touch.x = point.x;
            touch.y = point.y;
        }

        // ドラッグ閾値チェック
        const distance = this.getDistance(this.dragStartPosition, point);
        if (distance > this.dragThreshold) {
            // 実際のドラッグ処理
            this.processDrag(point);
        }
    }

    endDrag(point: Point, id: number): void {
        const dragDuration = Date.now() - this.mouseDownTime;
        const distance = this.getDistance(this.dragStartPosition, point);

        if (distance < this.dragThreshold && dragDuration < this.clickThreshold) {
            // クリック/タップとして処理
            this.processClick(point);
        } else {
            // ドラッグ終了として処理
            this.processDragEnd(point);
        }

        // 状態リセット
        this.isDragging = false;
        this.isMouseDown = false;
        this.draggedBubble = null;

        // タッチ情報を削除
        if (id !== -1) {
            this.activeTouches.delete(id);
        }
    }

    cancelDrag(id: number): void {
        this.isDragging = false;
        this.isMouseDown = false;
        this.draggedBubble = null;

        if (id !== -1) {
            this.activeTouches.delete(id);
        }
    }

    // ヘルパーメソッド
    getEventPosition(event: MouseEvent | Touch | PointerEvent): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    getDistance(point1: Point, point2: Point): number {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 実際の処理メソッド（サブクラスでオーバーライド）
    protected processClick(point: Point): void {
        console.log('Click at:', point);
        // 具体的なクリック処理は継承先で実装
    }

    protected processDrag(point: Point): void {
        console.log('Drag to:', point);
        // 具体的なドラッグ処理は継承先で実装
    }

    protected processDragEnd(point: Point): void {
        console.log('Drag end at:', point);
        // 具体的なドラッグ終了処理は継承先で実装
    }

    // 公開API
    getDragStartPosition(): Point {
        return { ...this.dragStartPosition };
    }

    getDragCurrentPosition(): Point {
        return { ...this.dragCurrentPosition };
    }

    isDraggingActive(): boolean {
        return this.isDragging;
    }

    getActiveTouches(): TouchInfo[] {
        return Array.from(this.activeTouches.values());
    }

    // クリーンアップ
    destroy(): void {
        // すべてのイベントリスナーを削除
        this.canvas.removeEventListener('pointerdown', this.handlePointerDown.bind(this));
        this.canvas.removeEventListener('pointermove', this.handlePointerMove.bind(this));
        this.canvas.removeEventListener('pointerup', this.handlePointerUp.bind(this));
        this.canvas.removeEventListener('pointercancel', this.handlePointerCancel.bind(this));
        
        this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));

        this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));

        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));

        // 状態クリア
        this.activeTouches.clear();
    }
}