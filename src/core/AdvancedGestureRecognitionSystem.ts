import { ErrorHandler } from '../errors/ErrorHandler';
import { EventEmitter } from '../events/EventEmitter';

interface GesturePoint {
    x: number;
    y: number;
    timestamp: number;
}

interface GestureEvent {
    type: string;
    direction?: string;
    angle?: number;
    velocity?: number;
    distance?: number;
    duration?: number;
    startPoint?: GesturePoint;
    endPoint?: GesturePoint;
    deltaX?: number;
    deltaY?: number;
    scale?: number;
    rotation?: number;
    touches?: GesturePoint[];
}

interface GestureConfig {
    swipe: {
        minDistance: number;
        maxDuration: number;
        velocityThreshold: number;
        angleThreshold: number;
    };
    tap: {
        maxDuration: number;
        maxDistance: number;
        doubleTapDelay: number;
    };
    hold: {
        minDuration: number;
        maxDistance: number;
    };
    pinch: {
        minScale: number;
        maxScale: number;
    };
    rotate: {
        minAngle: number;
    };
}

/**
 * 高度なジェスチャー認識システム
 */
export class AdvancedGestureRecognitionSystem {
    private canvas: HTMLCanvasElement;
    private eventEmitter: EventEmitter;
    private errorHandler: ErrorHandler;
    private isEnabled: boolean;
    private currentTouches: Map<number, GesturePoint>;
    private gestureInProgress: boolean;
    private lastTapTime: number;
    private lastTapPoint: GesturePoint | null;
    private holdTimer: number | null;
    private config: GestureConfig;
    private startPoint: GesturePoint | null;
    private startTouches: GesturePoint[];
    private customGestures: Map<string, (points: GesturePoint[]) => boolean>;
    private gestureHistory: GestureEvent[];
    private maxHistorySize: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.eventEmitter = new EventEmitter();
        this.errorHandler = new ErrorHandler();
        
        this.isEnabled = false;
        this.currentTouches = new Map();
        this.gestureInProgress = false;
        this.lastTapTime = 0;
        this.lastTapPoint = null;
        this.holdTimer = null;
        this.startPoint = null;
        this.startTouches = [];
        this.customGestures = new Map();
        this.gestureHistory = [];
        this.maxHistorySize = 10;
        
        this.config = {
            swipe: {
                minDistance: 50,
                maxDuration: 500,
                velocityThreshold: 0.3,
                angleThreshold: 30
            },
            tap: {
                maxDuration: 250,
                maxDistance: 10,
                doubleTapDelay: 300
            },
            hold: {
                minDuration: 500,
                maxDistance: 10
            },
            pinch: {
                minScale: 0.5,
                maxScale: 2.0
            },
            rotate: {
                minAngle: 10
            }
        };
        
        this.initialize();
    }
    
    /**
     * ジェスチャー認識システムを初期化
     */
    private initialize(): void {
        this.bindEvents();
        console.log('Advanced gesture recognition system initialized');
    }
    
    /**
     * イベントをバインド
     */
    private bindEvents(): void {
        // タッチイベント
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
        
        // マウスイベント（デバッグ用）
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    
    /**
     * ジェスチャー認識を有効化
     */
    public enable(): void {
        this.isEnabled = true;
        console.log('Gesture recognition enabled');
    }
    
    /**
     * ジェスチャー認識を無効化
     */
    public disable(): void {
        this.isEnabled = false;
        this.reset();
        console.log('Gesture recognition disabled');
    }
    
    /**
     * タッチ開始を処理
     */
    private handleTouchStart(event: TouchEvent): void {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        try {
            const now = Date.now();
            const touches = Array.from(event.touches);
            
            // タッチポイントを記録
            touches.forEach(touch => {
                const point: GesturePoint = {
                    x: touch.clientX,
                    y: touch.clientY,
                    timestamp: now
                };
                this.currentTouches.set(touch.identifier, point);
            });
            
            if (this.currentTouches.size === 1) {
                // シングルタッチ
                const touch = touches[0];
                const point: GesturePoint = {
                    x: touch.clientX,
                    y: touch.clientY,
                    timestamp: now
                };
                
                this.startPoint = point;
                this.gestureInProgress = true;
                
                // ホールドタイマーを開始
                this.startHoldTimer(point);
                
                // ダブルタップをチェック
                if (this.checkDoubleTap(point, now)) {
                    this.emitGesture({
                        type: 'doubletap',
                        startPoint: point,
                        endPoint: point
                    });
                }
                
                this.lastTapTime = now;
                this.lastTapPoint = point;
            } else if (this.currentTouches.size >= 2) {
                // マルチタッチ
                this.startTouches = Array.from(this.currentTouches.values());
                this.clearHoldTimer();
            }
        } catch (error) {
            this.errorHandler.logError('Touch start error', error);
        }
    }
    
    /**
     * タッチ移動を処理
     */
    private handleTouchMove(event: TouchEvent): void {
        if (!this.isEnabled || !this.gestureInProgress) return;
        
        event.preventDefault();
        
        try {
            const touches = Array.from(event.touches);
            
            // タッチポイントを更新
            touches.forEach(touch => {
                const point: GesturePoint = {
                    x: touch.clientX,
                    y: touch.clientY,
                    timestamp: Date.now()
                };
                this.currentTouches.set(touch.identifier, point);
            });
            
            if (this.currentTouches.size === 1 && this.startPoint) {
                // シングルタッチの移動
                const currentPoint = this.currentTouches.values().next().value as GesturePoint;
                const distance = this.calculateDistance(this.startPoint, currentPoint);
                
                if (distance > this.config.tap.maxDistance) {
                    this.clearHoldTimer();
                }
            } else if (this.currentTouches.size >= 2 && this.startTouches.length >= 2) {
                // マルチタッチジェスチャーを検出
                const currentTouches = Array.from(this.currentTouches.values());
                this.detectMultiTouchGesture(this.startTouches, currentTouches);
            }
        } catch (error) {
            this.errorHandler.logError('Touch move error', error);
        }
    }
    
    /**
     * タッチ終了を処理
     */
    private handleTouchEnd(event: TouchEvent): void {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        try {
            const now = Date.now();
            const changedTouches = Array.from(event.changedTouches);
            
            // 終了したタッチを削除
            changedTouches.forEach(touch => {
                this.currentTouches.delete(touch.identifier);
            });
            
            if (this.currentTouches.size === 0 && this.startPoint) {
                // 最後のタッチが終了
                const touch = changedTouches[0];
                const endPoint: GesturePoint = {
                    x: touch.clientX,
                    y: touch.clientY,
                    timestamp: now
                };
                
                const duration = now - this.startPoint.timestamp;
                const distance = this.calculateDistance(this.startPoint, endPoint);
                
                if (distance <= this.config.tap.maxDistance && 
                    duration <= this.config.tap.maxDuration) {
                    // タップジェスチャー
                    this.emitGesture({
                        type: 'tap',
                        startPoint: this.startPoint,
                        endPoint: endPoint,
                        duration: duration
                    });
                } else if (distance >= this.config.swipe.minDistance && 
                          duration <= this.config.swipe.maxDuration) {
                    // スワイプジェスチャーを検出
                    this.detectSwipeGesture(this.startPoint, endPoint, duration);
                }
                
                this.clearHoldTimer();
                this.reset();
            }
        } catch (error) {
            this.errorHandler.logError('Touch end error', error);
        }
    }
    
    /**
     * タッチキャンセルを処理
     */
    private handleTouchCancel(event: TouchEvent): void {
        if (!this.isEnabled) return;
        
        try {
            const changedTouches = Array.from(event.changedTouches);
            changedTouches.forEach(touch => {
                this.currentTouches.delete(touch.identifier);
            });
            
            if (this.currentTouches.size === 0) {
                this.reset();
            }
        } catch (error) {
            this.errorHandler.logError('Touch cancel error', error);
        }
    }
    
    /**
     * マウスダウンを処理（デバッグ用）
     */
    private handleMouseDown(event: MouseEvent): void {
        if (!this.isEnabled) return;
        
        const point: GesturePoint = {
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now()
        };
        
        this.currentTouches.set(0, point);
        this.handleTouchStart({
            touches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }],
            preventDefault: () => {}
        } as any);
    }
    
    /**
     * マウス移動を処理（デバッグ用）
     */
    private handleMouseMove(event: MouseEvent): void {
        if (!this.isEnabled || this.currentTouches.size === 0) return;
        
        this.handleTouchMove({
            touches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }],
            preventDefault: () => {}
        } as any);
    }
    
    /**
     * マウスアップを処理（デバッグ用）
     */
    private handleMouseUp(event: MouseEvent): void {
        if (!this.isEnabled || this.currentTouches.size === 0) return;
        
        this.handleTouchEnd({
            changedTouches: [{ identifier: 0, clientX: event.clientX, clientY: event.clientY }],
            preventDefault: () => {}
        } as any);
    }
    
    /**
     * マウスリーブを処理（デバッグ用）
     */
    private handleMouseLeave(_event: MouseEvent): void {
        if (!this.isEnabled) return;
        
        this.reset();
    }
    
    /**
     * スワイプジェスチャーを検出
     */
    private detectSwipeGesture(startPoint: GesturePoint, endPoint: GesturePoint, duration: number): void {
        const deltaX = endPoint.x - startPoint.x;
        const deltaY = endPoint.y - startPoint.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;
        
        if (velocity < this.config.swipe.velocityThreshold) return;
        
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        const direction = this.getSwipeDirection(angle);
        
        this.emitGesture({
            type: 'swipe',
            direction: direction,
            angle: angle,
            velocity: velocity,
            distance: distance,
            duration: duration,
            startPoint: startPoint,
            endPoint: endPoint,
            deltaX: deltaX,
            deltaY: deltaY
        });
    }
    
    /**
     * スワイプ方向を取得
     */
    private getSwipeDirection(angle: number): string {
        const threshold = this.config.swipe.angleThreshold;
        
        if (angle >= -threshold && angle <= threshold) {
            return 'right';
        } else if (angle >= 180 - threshold || angle <= -180 + threshold) {
            return 'left';
        } else if (angle >= 90 - threshold && angle <= 90 + threshold) {
            return 'down';
        } else if (angle >= -90 - threshold && angle <= -90 + threshold) {
            return 'up';
        } else if (angle > threshold && angle < 90 - threshold) {
            return 'down-right';
        } else if (angle > 90 + threshold && angle < 180 - threshold) {
            return 'down-left';
        } else if (angle < -threshold && angle > -90 + threshold) {
            return 'up-right';
        } else {
            return 'up-left';
        }
    }
    
    /**
     * マルチタッチジェスチャーを検出
     */
    private detectMultiTouchGesture(startTouches: GesturePoint[], currentTouches: GesturePoint[]): void {
        if (startTouches.length < 2 || currentTouches.length < 2) return;
        
        // ピンチジェスチャーを検出
        const startDistance = this.calculateDistance(startTouches[0], startTouches[1]);
        const currentDistance = this.calculateDistance(currentTouches[0], currentTouches[1]);
        const scale = currentDistance / startDistance;
        
        if (scale >= this.config.pinch.minScale && scale <= this.config.pinch.maxScale) {
            this.emitGesture({
                type: 'pinch',
                scale: scale,
                touches: currentTouches
            });
        }
        
        // 回転ジェスチャーを検出
        const startAngle = this.calculateAngle(startTouches[0], startTouches[1]);
        const currentAngle = this.calculateAngle(currentTouches[0], currentTouches[1]);
        const rotation = currentAngle - startAngle;
        
        if (Math.abs(rotation) >= this.config.rotate.minAngle) {
            this.emitGesture({
                type: 'rotate',
                rotation: rotation,
                touches: currentTouches
            });
        }
    }
    
    /**
     * ホールドタイマーを開始
     */
    private startHoldTimer(point: GesturePoint): void {
        this.clearHoldTimer();
        
        this.holdTimer = window.setTimeout(() => {
            if (this.gestureInProgress && this.currentTouches.size === 1) {
                this.emitGesture({
                    type: 'hold',
                    startPoint: point,
                    duration: this.config.hold.minDuration
                });
            }
        }, this.config.hold.minDuration);
    }
    
    /**
     * ホールドタイマーをクリア
     */
    private clearHoldTimer(): void {
        if (this.holdTimer !== null) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
    }
    
    /**
     * ダブルタップをチェック
     */
    private checkDoubleTap(point: GesturePoint, timestamp: number): boolean {
        if (!this.lastTapPoint || !this.lastTapTime) return false;
        
        const timeDelta = timestamp - this.lastTapTime;
        const distance = this.calculateDistance(this.lastTapPoint, point);
        
        return timeDelta <= this.config.tap.doubleTapDelay && 
               distance <= this.config.tap.maxDistance;
    }
    
    /**
     * 2点間の距離を計算
     */
    private calculateDistance(p1: GesturePoint, p2: GesturePoint): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 2点間の角度を計算
     */
    private calculateAngle(p1: GesturePoint, p2: GesturePoint): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    }
    
    /**
     * ジェスチャーイベントを発行
     */
    private emitGesture(event: GestureEvent): void {
        this.gestureHistory.push(event);
        if (this.gestureHistory.length > this.maxHistorySize) {
            this.gestureHistory.shift();
        }
        
        this.eventEmitter.emit('gesture', event);
        this.eventEmitter.emit(`gesture:${event.type}`, event);
        
        console.log(`Gesture detected: ${event.type}`, event);
    }
    
    /**
     * カスタムジェスチャーを登録
     */
    public registerCustomGesture(name: string, detector: (points: GesturePoint[]) => boolean): void {
        this.customGestures.set(name, detector);
        console.log(`Custom gesture registered: ${name}`);
    }
    
    /**
     * カスタムジェスチャーを削除
     */
    public unregisterCustomGesture(name: string): void {
        this.customGestures.delete(name);
        console.log(`Custom gesture unregistered: ${name}`);
    }
    
    /**
     * ジェスチャーイベントをリッスン
     */
    public on(event: string, callback: (event: GestureEvent) => void): void {
        this.eventEmitter.on(event, callback);
    }
    
    /**
     * ジェスチャーイベントのリッスンを解除
     */
    public off(event: string, callback: (event: GestureEvent) => void): void {
        this.eventEmitter.off(event, callback);
    }
    
    /**
     * 設定を更新
     */
    public updateConfig(config: Partial<GestureConfig>): void {
        this.config = { ...this.config, ...config };
        console.log('Gesture config updated', this.config);
    }
    
    /**
     * ジェスチャー履歴を取得
     */
    public getGestureHistory(): GestureEvent[] {
        return [...this.gestureHistory];
    }
    
    /**
     * ジェスチャー履歴をクリア
     */
    public clearHistory(): void {
        this.gestureHistory = [];
    }
    
    /**
     * 状態をリセット
     */
    private reset(): void {
        this.gestureInProgress = false;
        this.startPoint = null;
        this.startTouches = [];
        this.currentTouches.clear();
        this.clearHoldTimer();
    }
    
    /**
     * クリーンアップ
     */
    public cleanup(): void {
        this.disable();
        
        // イベントリスナーを削除
        this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
        this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        this.eventEmitter.removeAllListeners();
        console.log('Gesture recognition system cleaned up');
    }
}