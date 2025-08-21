/**
 * AdvancedGestureRecognitionSystem - 高度なジェスチャー認識システム
 * 複雑なジェスチャーパターンを認識するシステム
 * カスタムジェスチャーの定義・学習機能を実装
 * ジェスチャー設定のカスタマイズ機能を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface GameEngine { canvas: HTMLCanvasElement,
    bubbleManager?: {
        handleSwipeUp(gesture: GestureData): void;
        handleSwipeDown(gesture: GestureData): void,
        handleSwipeLeft(gesture: GestureData): void,
        handleSwipeRight(gesture: GestureData): void,
        handleTap(position: Position): void,
        handleDoubleTap(position: Position): void, };
    cameraManager?: { zoomIn(scale: number, center: Position): void,
        zoomOut(scale: number, center: Position): void,
        rotate(angle: number): void, };
    uiManager?: { showContextMenu(position: Position): void, };
    effectsManager?: { createWhirlwindEffect(center: Position, direction: string): void ,};
    customGestureHandler?: { handle(gesture: GestureData): void, }

interface Position { x: number,
    y: number ,}

interface Touch { identifier: number;
    clientX: number;
    clientY: number;
    pageX?: number;
    pageY?: number;
    screenX?: number;
    screenY?: number;
    target?: EventTarget | null;
    force?: number;
    radiusX?: number;
    radiusY?: number;
    rotationAngle?: number; }

interface GestureConfig { swipe: {
        minDistance: number;
        maxDuration: number;
        velocityThreshold: number;
        angleThreshold: number;
        directions: string[] };
    pinch: { minScale: number;
        maxScale: number;
        scaleThreshold: number;
        centerThreshold: number;
        simultaneousTouch: boolean };
    tap: { maxDuration: number;
        maxMovement: number;
        doubleTapInterval: number;
        longPressDelay: number;
        multiTapSupport: boolean };
    advanced: { circularGesture: boolean;
        customPatterns: boolean;
        gestureChaining: boolean;
        machinesLearning: boolean }

interface GestureState { active: boolean,
    type: string | null;
    startTime: number;
    startPosition: Position;
    currentPosition: Position;
    velocity: Position;
    scale: number;
    rotation: number;
    touches: TouchState[];
    pinch?: PinchState;
    rotation?: RotationState;
    ,}

interface TouchState { id: number,
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    path: PathPoint[]
    ,}

interface PathPoint { x: number;
    y: number;
    time: number }

interface PinchState { initialDistance: number;
    currentDistance: number;
    initialScale: number;
    currentScale: number;
    center: Position
    }

interface RotationState { initialAngle: number;
    currentAngle: number;
    totalRotation: number }

interface GestureData { type: string;
    direction?: string;
    velocity?: number;
    distance?: number;
    duration?: number;
    startPosition?: Position;
    endPosition?: Position;
    scale?: number;
    center?: Position;
    count?: number;
    position?: Position;
    angle?: number;
    radius?: number;
    totalAngle?: number;
    name?: string;
    pattern?: unknown;
    similarity?: number; }

interface GesturePattern { type: string,
    direction?: string;
    scale?: string;
    count?: number;
    pattern?: string; }

interface GesturePatterns { basic: Record<string, GesturePattern>;
    advanced: Record<string, GesturePattern>;
    custom: Map<string, GesturePattern> }

interface GestureHistory { type: string | null,
    timestamp: number;
    duration: number;
    touches: number;
    startPosition: Position;
    endPosition: Position
    ,}

interface LearningData { patterns: Map<string, unknown>;
    accuracy: Map<string, number>;
    adaptiveThresholds: Map<string, number> }

interface CircularResult { isCircular: boolean,
    direction?: string;
    center?: Position;
    radius?: number;
    totalAngle?: number; }

interface MovementData { dx: number,
    dy: number;
    distance: number;
    angle: number;
    velocity: number ,}

interface GestureAnalyzer { pathAnalyzer: PathAnalyzer;
    patternMatcher: PatternMatcher;
    learningEngine: LearningEngine
    }

interface GestureStatistics { totalGestures: number;
    typeDistribution: Record<string, number>;
    averageDuration: number;
    customGestureCount: number ,}

class AdvancedGestureRecognitionSystem { private gameEngine: GameEngine
    private errorHandler: ErrorHandler;
    private gestureConfig: GestureConfig;
    private gestureState: GestureState;
    private gesturePatterns: GesturePatterns;
    private gestureHistory: GestureHistory[];
    private maxHistoryLength: number;
    private learningData: LearningData;
    private longPressTimer: ReturnType<typeof setTimeout> | null;
    private gestureAnalyzer?: GestureAnalyzer;

    constructor(gameEngine: GameEngine) {
';

        this.gameEngine = gameEngine;''
        this.errorHandler = ErrorHandler.getInstance('';
    }

                directions: ['up', 'down', 'left', 'right', 'diagonal] }
            },
            pinch: { minScale: 0.1;
                maxScale: 5.0;
                scaleThreshold: 0.05;
                centerThreshold: 20;
                simultaneousTouch: true };
            tap: { maxDuration: 200;
                maxMovement: 10;
                doubleTapInterval: 300;
                longPressDelay: 500;
                multiTapSupport: true };
            advanced: { circularGesture: true;
                customPatterns: true;
                gestureChaining: true;
                machinesLearning: false }
        };
        // ジェスチャー状態管理
        this.gestureState = { active: false,
            type: null;
            startTime: 0, }
            startPosition: { x: 0, y: 0 ,},
            currentPosition: { x: 0, y: 0 ,},
            velocity: { x: 0, y: 0 ,},
            scale: 1.0;
            rotation: 0;
            touches: [];
        },
        
        // ジェスチャーパターン
        this.gesturePatterns = { // 基本ジェスチャー
            basic: {' }'

                swipeUp: { type: 'swipe', direction: 'up' ,},''
                swipeDown: { type: 'swipe', direction: 'down' ,},''
                swipeLeft: { type: 'swipe', direction: 'left' ,},''
                swipeRight: { type: 'swipe', direction: 'right' ,},''
                pinchIn: { type: 'pinch', scale: '<1' ,},''
                pinchOut: { type: 'pinch', scale: '>1' ,},''
                tap: { type: 'tap', count: 1 ,},''
                doubleTap: { type: 'tap', count: 2 ,},''
                longPress: { type: 'longpress' };
            // 高度なジェスチャー
            advanced: { ' }'

                circle: { type: 'circular', direction: 'clockwise' ,},''
                counterCircle: { type: 'circular', direction: 'counterclockwise' ,},''
                zigzag: { type: 'path', pattern: 'zigzag' ,},''
                heart: { type: 'path', pattern: 'heart' ,},''
                star: { type: 'path', pattern: 'star' ,}))
            // カスタムジェスチャー)
            custom: new Map();
        };
        
        // ジェスチャー履歴
        this.gestureHistory = [];
        this.maxHistoryLength = 100;
        
        // 学習データ
        this.learningData = { patterns: new Map<string, unknown>(),
            accuracy: new Map<string, number>(),
            adaptiveThresholds: new Map<string, number>( };
        
        this.initialize();
    }
    
    /**
     * システム初期化
     */
    private initialize(): void { try {
            this.setupEventListeners();
            this.loadGestureSettings();''
            this.initializeGestureAnalysis()';
            console.log('[AdvancedGestureRecognitionSystem] 高度ジェスチャー認識システム初期化完了');' }

        } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.initialize); }'
    }
    
    /**
     * イベントリスナー設定'
     */''
    private setupEventListeners()';
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false }');''
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false }');''
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false }');''
        canvas.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false }');
        ';
        // マウスイベント（デスクトップ対応）
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));''
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));''
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e);
        ';
        // ポインターイベント（統一処理）
        if(window.PointerEvent) {'

            canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));''
            canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));

        }

            canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e)); }
        }
        ';
        // ジェスチャーイベント（iOS Safari）
        canvas.addEventListener('gesturestart', (e) => this.handleGestureStart(e), { passive: false }');''
        canvas.addEventListener('gesturechange', (e) => this.handleGestureChange(e), { passive: false }');''
        canvas.addEventListener('gestureend', (e) => this.handleGestureEnd(e), { passive: false });
    }
    
    /**
     * タッチ開始処理
     */
    private handleTouchStart(e: TouchEvent): void { e.preventDefault();
        
        try {
            const touches = Array.from(e.touches);
            this.startGestureRecognition(touches);
            
            // マルチタッチ検出
            if(touches.length > 1) {
                
            }
                this.startMultiTouchGesture(touches); }
            } else { this.startSingleTouchGesture(touches[0]);' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.handleTouchStart); }'
    }
    
    /**
     * タッチ移動処理
     */
    private handleTouchMove(e: TouchEvent): void { e.preventDefault();
        
        try {
            const touches = Array.from(e.touches);
            this.updateGestureRecognition(touches);
            
            if(this.gestureState.active) {
            
                
            
            }

                this.analyzeGestureMovement(touches);' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.handleTouchMove); }'
    }
    
    /**
     * タッチ終了処理
     */
    private handleTouchEnd(e: TouchEvent): void { try {
            const touches = Array.from(e.changedTouches);
            this.endGestureRecognition(touches);
            
            // ジェスチャー完了判定
            if(e.touches.length === 0) {
                
            }
                this.completeGestureAnalysis();' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.handleTouchEnd); }'
    }
    
    /**
     * タッチキャンセル処理
     */
    private handleTouchCancel(e: TouchEvent): void { try {
            this.cancelGestureRecognition();' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.handleTouchCancel); }'
    }
    
    /**
     * マウス処理（デスクトップ対応）
     */
    private handleMouseDown(e: MouseEvent): void { const touch = this.mouseEventToTouch(e);
        this.startSingleTouchGesture(touch); }
    
    private handleMouseMove(e: MouseEvent): void { if (this.gestureState.active) {
            const touch = this.mouseEventToTouch(e);
            this.updateGestureRecognition([touch]); }
    }
    
    private handleMouseUp(e: MouseEvent): void { if (this.gestureState.active) {
            this.completeGestureAnalysis(); }
    }
    
    /**
     * マウスイベントをタッチイベントに変換
     */
    private mouseEventToTouch(e: MouseEvent): Touch { const rect = this.gameEngine.canvas.getBoundingClientRect();
        return { identifier: 0,
            clientX: e.clientX;
            clientY: e.clientY;
            pageX: e.pageX;
            pageY: e.pageY;
            screenX: e.screenX;
            screenY: e.screenY;
            target: e.target;
            force: e.pressure || 1.0;
            radiusX: 10;
            radiusY: 10, };
            rotationAngle: 0 }
        }
    
    /**
     * ポインターイベント処理
     */'
    private handlePointerDown(e: PointerEvent): void { ''
        const touch = this.pointerEventToTouch(e);''
        if(e.pointerType === 'touch) {'
            
        }
            this.startSingleTouchGesture(touch); }
}

    private handlePointerMove(e: PointerEvent): void { ''
        if(this.gestureState.active && e.pointerType === 'touch) {'
            const touch = this.pointerEventToTouch(e);
        }
            this.updateGestureRecognition([touch]); }
}

    private handlePointerUp(e: PointerEvent): void { ''
        if(this.gestureState.active && e.pointerType === 'touch) {'
            
        }
            this.completeGestureAnalysis(); }
}
    
    /**
     * ポインターイベントをタッチイベントに変換
     */
    private pointerEventToTouch(e: PointerEvent): Touch { return { identifier: e.pointerId,
            clientX: e.clientX;
            clientY: e.clientY;
            pageX: e.pageX;
            pageY: e.pageY;
            screenX: e.screenX;
            screenY: e.screenY;
            target: e.target;
            force: e.pressure || 1.0;
            radiusX: e.width / 2 || 10;
            radiusY: e.height / 2 || 10, };
            rotationAngle: e.tiltX || 0 }
        }
    
    /**
     * iOS ジェスチャーイベント処理
     */
    private handleGestureStart(e: Event): void { e.preventDefault();
        this.startPinchGesture(e); }
    
    private handleGestureChange(e: Event): void { e.preventDefault();
        this.updatePinchGesture(e); }
    
    private handleGestureEnd(e: Event): void { e.preventDefault();
        this.endPinchGesture(e); }
    
    /**
     * ジェスチャー認識開始
     */
    private startGestureRecognition(touches: Touch[]): void { this.gestureState.active = true;
        this.gestureState.startTime = Date.now();
        this.gestureState.touches = touches.map(touch => ({
            id: touch.identifier;
            startX: touch.clientX);
            startY: touch.clientY);
            currentX: touch.clientX,);
            currentY: touch.clientY), }
            path: [{ x: touch.clientX, y: touch.clientY, time: Date.now( ,}]
        });
        
        if(touches.length = == 1) {
        
            this.gestureState.startPosition = {
                x: touches[0].clientX }
                y: touches[0].clientY }
            };
            this.gestureState.currentPosition = { ...this.gestureState.startPosition;
        }
    }
    
    /**
     * シングルタッチジェスチャー開始'
     */''
    private startSingleTouchGesture(touch: Touch): void { ''
        this.gestureState.type = 'single';
        
        // 長押し検出タイマー
        this.longPressTimer = setTimeout(() => { 
            if (this.gestureState.active) { }
                this.recognizeLongPress(); }
}, this.gestureConfig.tap.longPressDelay);
    }
    
    /**
     * マルチタッチジェスチャー開始
     */''
    private startMultiTouchGesture(touches: Touch[]): void { ''
        this.gestureState.type = 'multi';
        
        if(touches.length === 2) {
        
            
        
        }
            this.startPinchGestureDetection(touches); }
        }
        
        // 長押しタイマーをクリア
        if(this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
            this.longPressTimer = null; }
}
    
    /**
     * ピンチジェスチャー検出開始
     */
    startPinchGestureDetection(touches) {
        const distance = this.calculateDistance(touches[0], touches[1]);
        const center = this.calculateCenter(touches[0], touches[1]);
        
        this.gestureState.pinch = {
            initialDistance: distance;
            currentDistance: distance;
            initialScale: 1.0;
            currentScale: 1.0;
    ,}
            center: center }
        }
    
    /**
     * ジェスチャー認識更新
     */
    updateGestureRecognition(touches) {
        if (!this.gestureState.active) return;
        
        // タッチパス記録
        touches.forEach(touch => { );
            const existingTouch = this.gestureState.touches.find(t => t.id === touch.identifier);
            if (existingTouch) {
                existingTouch.currentX = touch.clientX;
                existingTouch.currentY = touch.clientY;
                existingTouch.path.push({)
                    x: touch.clientX,)
    }
                    y: touch.clientY), }
                    time: Date.now(); }
                });
            }
        });
        
        // 位置更新
        if(touches.length = == 1) {
            this.gestureState.currentPosition = {
                x: touches[0].clientX }
                y: touches[0].clientY }
            };
            // 速度計算
            this.calculateVelocity();
        }
        
        // マルチタッチ処理
        if (touches.length === 2 && this.gestureState.pinch) { this.updatePinchGestureDetection(touches); }
    }
    
    /**
     * ピンチジェスチャー更新
     */
    updatePinchGestureDetection(touches) {
        const distance = this.calculateDistance(touches[0], touches[1]);
        const center = this.calculateCenter(touches[0], touches[1]);
        
        this.gestureState.pinch.currentDistance = distance;
        this.gestureState.pinch.currentScale = distance / this.gestureState.pinch.initialDistance;
        this.gestureState.pinch.center = center;
        
        // ピンチ閾値チェック
        const scaleDiff = Math.abs(this.gestureState.pinch.currentScale - 1.0);
        if (scaleDiff > this.gestureConfig.pinch.scaleThreshold) {
    }
            this.recognizePinchGesture(); }
}
    
    /**
     * ジェスチャー移動分析
     */
    analyzeGestureMovement(touches) {
        if (touches.length === 1) {
    }
            this.analyzeSingleTouchMovement(touches[0]); }
        } else if (touches.length === 2) { this.analyzeMultiTouchMovement(touches); }
        
        // カスタムパターン分析
        this.analyzeCustomPatterns();
    }
    
    /**
     * シングルタッチ移動分析
     */
    analyzeSingleTouchMovement(touch) {
        const movement = this.calculateMovement();
        
        // スワイプ検出
        if (movement.distance > this.gestureConfig.swipe.minDistance) {
            const duration = Date.now() - this.gestureState.startTime;
            if (duration < this.gestureConfig.swipe.maxDuration) {
    }
                this.analyzeSwipeGesture(movement); }
}
        
        // 円形ジェスチャー検出
        if (this.gestureConfig.advanced.circularGesture) { this.analyzeCircularGesture(); }
    }
    
    /**
     * マルチタッチ移動分析
     */
    analyzeMultiTouchMovement(touches) {
        if (touches.length === 2) {
            // 回転検出
    }
            this.analyzeRotationGesture(touches); }
}
    
    /**
     * スワイプジェスチャー分析
     */''
    analyzeSwipeGesture(movement) {'
        const angle = movement.angle;''
        let direction = 'unknown';
        ';
        // 方向判定
        if (Math.abs(angle) < this.gestureConfig.swipe.angleThreshold) {'
    }

            direction = 'right';' }

        } else if (Math.abs(angle - 180) < this.gestureConfig.swipe.angleThreshold) { ''
            direction = 'left';' }

        } else if (Math.abs(angle - 90) < this.gestureConfig.swipe.angleThreshold) { ''
            direction = 'down';' }

        } else if (Math.abs(angle - 270) < this.gestureConfig.swipe.angleThreshold) { ''
            direction = 'up'; }

        } else { }'

            direction = 'diagonal'; }
        }
        
        // 速度チェック
        if (movement.velocity > this.gestureConfig.swipe.velocityThreshold) { this.recognizeSwipeGesture(direction, movement); }
    }
    
    /**
     * 円形ジェスチャー分析
     */
    analyzeCircularGesture() {
        const touch = this.gestureState.touches[0];
        if (touch && touch.path.length > 10) {
            const circularResult = this.detectCircularPath(touch.path);
            if (circularResult.isCircular) {
    }
                this.recognizeCircularGesture(circularResult); }
}
    }
    
    /**
     * 円形パス検出
     */
    detectCircularPath(path) {
        
    }
        if (path.length < 10) return { isCircular: false }
        const center = this.calculatePathCenter(path);
        const radii = path.map(point => this.calculateDistance(center, point);
        
        // 半径の一貫性チェック
        const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
        const radiusVariance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
        const radiusStdDev = Math.sqrt(radiusVariance);
        
        // 角度変化チェック
        let totalAngleChange = 0;
        for(let, i = 1; i < path.length; i++) {
            const angle1 = Math.atan2(path[i-1].y - center.y, path[i-1].x - center.x);
            const angle2 = Math.atan2(path[i].y - center.y, path[i].x - center.x);
        }
            totalAngleChange += this.normalizeAngleDifference(angle2 - angle1); }
        }

        const isCircular = radiusStdDev < avgRadius * 0.3 && Math.abs(totalAngleChange) > Math.PI;''
        const direction = totalAngleChange > 0 ? 'clockwise' : 'counterclockwise';
        
        return { isCircular,
            direction,
            center,
            radius: avgRadius, };
            totalAngle: Math.abs(totalAngleChange); }
        }
    
    /**
     * 回転ジェスチャー分析
     */
    analyzeRotationGesture(touches) {
        if (!this.gestureState.rotation) {
            this.gestureState.rotation = {
                initialAngle: this.calculateAngleBetweenTouches(touches[0], touches[1]),
                currentAngle: 0;
    ,}
                totalRotation: 0 }
            }
        
        const currentAngle = this.calculateAngleBetweenTouches(touches[0], touches[1]);
        const angleDiff = this.normalizeAngleDifference(currentAngle - this.gestureState.rotation.initialAngle);
        
        this.gestureState.rotation.currentAngle = currentAngle;
        this.gestureState.rotation.totalRotation += angleDiff;
        
        // 回転閾値チェック
        if (Math.abs(this.gestureState.rotation.totalRotation) > Math.PI / 6) { // 30度
            this.recognizeRotationGesture(); }
    }
    
    /**
     * カスタムパターン分析
     */
    analyzeCustomPatterns() {
        if (!this.gestureConfig.advanced.customPatterns) return;
        
        // 学習済みパターンとの照合
        this.gesturePatterns.custom.forEach((pattern, name) => { 
            const similarity = this.calculatePatternSimilarity(pattern);
    }
            if (similarity > 0.8) { // 80%以上の類似度 }
                this.recognizeCustomGesture(name, pattern, similarity); }
});
    }
    
    /**
     * ジェスチャー認識完了
     */
    completeGestureAnalysis() {
        try {
            if (!this.gestureState.active) return;
            
            const duration = Date.now() - this.gestureState.startTime;
            const movement = this.calculateMovement();
            
            // タップ判定
            if (duration < this.gestureConfig.tap.maxDuration && ;
                movement.distance < this.gestureConfig.tap.maxMovement) {
    }
                this.recognizeTapGesture(); }
            }
            
            // ジェスチャー履歴に追加
            this.addToGestureHistory();
            
            // 学習データ更新
            this.updateLearningData();
            
            // 状態リセット
            this.resetGestureState();

        } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.completeGestureAnalysis); }'
    }
    
    /**
     * ジェスチャー認識キャンセル
     */
    cancelGestureRecognition() { this.resetGestureState(); }
    
    /**
     * ジェスチャー状態リセット
     */
    resetGestureState() {
        this.gestureState.active = false;
        this.gestureState.type = null;
        this.gestureState.touches = [];
        this.gestureState.pinch = null;
        this.gestureState.rotation = null;
        
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
    }
            this.longPressTimer = null; }
}
    
    /**
     * ジェスチャー認識関数群'
     */''
    recognizeSwipeGesture(direction, movement) {'
        const gesture = {''
            type: 'swipe';
            direction: direction;
            velocity: movement.velocity,
            distance: movement.distance,
            duration: Date.now()';
        this.dispatchGestureEvent('swipe', gesture);
    }
        this.handleSwipeGameAction(gesture); }
    }

    recognizePinchGesture(''';
            type: 'pinch';
            scale: this.gestureState.pinch.currentScale,
            center: this.gestureState.pinch.center,
            direction: this.gestureState.pinch.currentScale > 1 ? 'out' : 'in);
        })'

        this.dispatchGestureEvent('pinch', gesture);
        this.handlePinchGameAction(gesture);
    }
    
    recognizeTapGesture() { ';

        const tapCount = this.detectMultiTap(''';
            type: 'tap);
            count: tapCount);
            position: this.gestureState.startPosition, }
            duration: Date.now() - this.gestureState.startTime }
        };
        if(tapCount > 1) {
        
            
        
        }
            gesture.type = `${tapCount}tap`;
        }
        
        this.dispatchGestureEvent(gesture.type, gesture);
        this.handleTapGameAction(gesture);
    }

    recognizeLongPress()';
            type: 'longpress')';
            position: this.gestureState.startPosition,
            duration: Date.now()';
        this.dispatchGestureEvent('longpress', gesture);
        this.handleLongPressGameAction(gesture);
    }

    recognizeCircularGesture(circularResult) {'
        const gesture = {''
            type: 'circular';
            direction: circularResult.direction;
            center: circularResult.center;
            radius: circularResult.radius;
    }
            totalAngle: circularResult.totalAngle }
        };
        this.dispatchGestureEvent('circular', gesture);
        this.handleCircularGameAction(gesture);
    }

    recognizeRotationGesture(''';
            type: 'rotation',
            angle: this.gestureState.rotation.totalRotation,
            direction: this.gestureState.rotation.totalRotation > 0 ? 'clockwise' : 'counterclockwise);
        })'

        this.dispatchGestureEvent('rotation', gesture);
        this.handleRotationGameAction(gesture);
    }

    recognizeCustomGesture(name, pattern, similarity) {'
        const gesture = {''
            type: 'custom';
            name: name;
            pattern: pattern;
    }
            similarity: similarity }
        };
        this.dispatchGestureEvent('custom', gesture);
        this.handleCustomGameAction(gesture);
    }
    
    /**
     * ゲーム固有のアクション処理
     */
    handleSwipeGameAction(gesture) {'

        switch(gesture.direction) {''
            case 'up':'';
                this.gameEngine.bubbleManager? .handleSwipeUp(gesture);

                break; : undefined''
            case 'down':'';
                this.gameEngine.bubbleManager? .handleSwipeDown(gesture);

                break; : undefined''
            case 'left':'';
                this.gameEngine.bubbleManager? .handleSwipeLeft(gesture);

                break; : undefined''
            case 'right':;
                this.gameEngine.bubbleManager? .handleSwipeRight(gesture);
    }
                break; }
}

    handlePinchGameAction(gesture) {'

        if(gesture.direction === 'out) {'
            // ズームイン効果
    }
            this.gameEngine.cameraManager?.zoomIn(gesture.scale, gesture.center); }
        } else {  // ズームアウト効果 }
            this.gameEngine.cameraManager?.zoomOut(gesture.scale, gesture.center); }
}
    
    handleTapGameAction(gesture) {
    
        if (gesture.count === 1) {
            // シングルタップ - バブルポップ
    
    }
            this.gameEngine.bubbleManager?.handleTap(gesture.position); }
        } else if (gesture.count === 2) { // ダブルタップ - 特殊アクション
            this.gameEngine.bubbleManager?.handleDoubleTap(gesture.position); }
    }
    
    handleLongPressGameAction(gesture) {
    
        // 長押し - コンテキストメニューまたは特殊効果
    
    }
        this.gameEngine.uiManager?.showContextMenu(gesture.position); }
    }
    
    handleCircularGameAction(gesture) {
    
        // 円形ジェスチャー - 旋風効果
    
    }
        this.gameEngine.effectsManager?.createWhirlwindEffect(gesture.center, gesture.direction); }
    }
    
    handleRotationGameAction(gesture) {
    
        // 回転ジェスチャー - 画面回転
    
    }
        this.gameEngine.cameraManager?.rotate(gesture.angle); }
    }
    
    handleCustomGameAction(gesture) {
    
        // カスタムジェスチャー処理
    
    }
        this.gameEngine.customGestureHandler?.handle(gesture); }
    }
    
    /**
     * ユーティリティ関数
     */
    calculateDistance(point1, point2) {
        const dx = point1.clientX || point1.x - (point2.clientX || point2.x);
        const dy = point1.clientY || point1.y - (point2.clientY || point2.y);
    }
        return Math.sqrt(dx * dx + dy * dy);
    
    calculateCenter(point1, point2) {
    
        return { : undefined
    
    
            x: ((point1.clientX || point1.x) + (point2.clientX || point2.x)) / 2, };
            y: ((point1.clientY || point1.y) + (point2.clientY || point2.y) / 2 }
        }
    
    calculateMovement() {
    
        const dx = this.gestureState.currentPosition.x - this.gestureState.startPosition.x;
        const dy = this.gestureState.currentPosition.y - this.gestureState.startPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const duration = Date.now() - this.gestureState.startTime;
        const velocity = duration > 0 ? distance / duration: 0 
        return { dx, dy, distance, angle, velocity }
    
    calculateVelocity() {
    
        const touch = this.gestureState.touches[0];
        if (touch && touch.path.length > 1) {
            const last = touch.path[touch.path.length - 1];
            const prev = touch.path[touch.path.length - 2];
            const dt = last.time - prev.time;
            
            if (dt > 0) {
                this.gestureState.velocity = {
                    x: (last.x - prev.x) / dt }
                    y: (last.y - prev.y) / dt }
                }
}
    
    calculateAngleBetweenTouches(touch1, touch2) {
    
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
    
    }
        return Math.atan2(dy, dx);
    
    normalizeAngleDifference(angle) {
    
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
    
    }
        return angle;
    
    calculatePathCenter(path) {
    
        const sumX = path.reduce((sum, point) => sum + point.x, 0);
        const sumY = path.reduce((sum, point) => sum + point.y, 0);
    
    }
        return { x: sumX / path.length, };
            y: sumY / path.length }
        }
    
    detectMultiTap() {
    ;
        // 直近のタップ履歴をチェック
        const now = Date.now()';
            g.type === 'tap' && );
            now - g.timestamp < this.gestureConfig.tap.doubleTapInterval);
        
    
    }
        return recentTaps.length + 1;
    
    calculatePatternSimilarity(pattern) {
    
        // パターンマッチングアルゴリズム実装
        // 現在のジェスチャーパスと学習済みパターンの類似度を計算
    
    }
        return 0.5; // プレースホルダー }
    }
    
    /**
     * イベント送信
     */
    dispatchGestureEvent(type, gesture) {
        
    }
        const event = new CustomEvent(`gesture:${type}`, { detail: gesture)
        ),
        this.gameEngine.canvas.dispatchEvent(event }
        console.log(`[AdvancedGestureRecognitionSystem] ジェスチャー認識: ${type}`, gesture});
    }
    
    /**
     * ジェスチャー履歴管理
     */
    addToGestureHistory() {
        const gestureRecord = {
            type: this.gestureState.type;
            timestamp: Date.now();
            duration: Date.now() - this.gestureState.startTime;
            touches: this.gestureState.touches.length;
            startPosition: this.gestureState.startPosition;
    }
            endPosition: this.gestureState.currentPosition }
        };
        this.gestureHistory.push(gestureRecord);
        
        // 履歴サイズ制限
        if (this.gestureHistory.length > this.maxHistoryLength) { this.gestureHistory.shift(); }
    }
    
    /**
     * 学習データ更新
     */
    updateLearningData() {
        if (this.gestureConfig.advanced.machinesLearning) {
    }
            // 機械学習データ更新（今後の機能） }
}
    
    /**
     * ジェスチャー設定読み込み
     */''
    loadGestureSettings()';
            const savedSettings = localStorage.getItem('bubblepop_gesture_settings);
            if (savedSettings) { const settings = JSON.parse(savedSettings); }

                this.gestureConfig = { ...this.gestureConfig, ...settings;''
            } catch (error) {
            console.warn('[AdvancedGestureRecognitionSystem] ジェスチャー設定読み込みエラー:', error); }
    }
    
    /**
     * ジェスチャー設定保存'
     */''
    saveGestureSettings()';
            localStorage.setItem('bubblepop_gesture_settings', JSON.stringify(this.gestureConfig);''
        } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.saveGestureSettings); }'
    }
    
    /**
     * ジェスチャー分析初期化
     */
    initializeGestureAnalysis() { // 分析エンジン初期化
        this.gestureAnalyzer = {
            pathAnalyzer: new PathAnalyzer();
            patternMatcher: new PatternMatcher( }
            learningEngine: new, LearningEngine(); }
        }
    
    /**
     * カスタムジェスチャー追加
     */
    addCustomGesture(name, pattern) {
        this.gesturePatterns.custom.set(name, pattern);
    }
        this.saveGestureSettings(); }
    }
    
    /**
     * カスタムジェスチャー削除
     */
    removeCustomGesture(name) {
        this.gesturePatterns.custom.delete(name);
    }
        this.saveGestureSettings(); }
    }
    
    /**
     * ジェスチャー統計取得
     */
    getGestureStatistics() {
        
    }
        const typeCount = {};
        this.gestureHistory.forEach(gesture => {  ); }
            typeCount[gesture.type] = (typeCount[gesture.type] || 0) + 1; }
        });
        
        return { totalGestures: this.gestureHistory.length,
            typeDistribution: typeCount;
            averageDuration: this.gestureHistory.reduce((sum, g) => sum + g.duration, 0) / this.gestureHistory.length || 0, };
            customGestureCount: this.gesturePatterns.custom.size }
        }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        try {
            this.resetGestureState();
            this.saveGestureSettings();
    }
            console.log('[AdvancedGestureRecognitionSystem] クリーンアップ完了');' }

        } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedGestureRecognitionSystem.cleanup); }'
}

/**
 * パス分析クラス（プレースホルダー）
 */
class PathAnalyzer { analyze(path: PathPoint[]): Record<string, unknown> {
        // パス分析ロジック }
        return {};

/**
 * パターンマッチングクラス（プレースホルダー）
 */
class PatternMatcher { match(pattern1: unknown, pattern2: unknown): number {
        // パターンマッチングロジック
        return 0.5 ,}
}

/**
 * 学習エンジンクラス（プレースホルダー）
 */
class LearningEngine { learn(data: unknown): void {
        // 機械学習ロジック }
}

// シングルトンインスタンス
let advancedGestureRecognitionSystemInstance: AdvancedGestureRecognitionSystem | null = null,

export function getAdvancedGestureRecognitionSystem(gameEngine: GameEngine | null = null): AdvancedGestureRecognitionSystem | null { if (!advancedGestureRecognitionSystemInstance && gameEngine) {''
        advancedGestureRecognitionSystemInstance = new AdvancedGestureRecognitionSystem(gameEngine); }
    return advancedGestureRecognitionSystemInstance;
}

export { AdvancedGestureRecognitionSystem };