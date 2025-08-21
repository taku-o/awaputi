/**
 * GestureDeviceManager - デバイス管理システム
 * 
 * デバイス検出、入力最適化、イベント処理、ゲームパッド統合を専門的に管理します
 */

// 型定義
export interface GestureConfig { enabled: boolean,
    touchSensitivity?: number;
    keyboardSensitivity?: number;
    oneHandedMode?: boolean;
    deviceAdaptation: DeviceAdaptation;
   , gestureThresholds: GestureThresholds
    ,}

export interface DeviceAdaptation { touchscreenOptimized: boolean;
    mouseOptimized: boolean;
    keyboardOptimized: boolean;
   , gamepadOptimized: boolean }

export interface GestureThresholds { minDistance: number;
    angleThreshold: number;
   , minVelocity: number }

export interface RecognitionState { isRecognizing: boolean;
    currentGesture: string | null;
    startTime: number;
    startPosition: Position;
    currentPosition: Position;
    touchPoints: TouchPoint[];
    velocity: Velocity;
   , pressure: number;
    scale?: number;
    edge?: EdgePosition;
    }

export interface TouchPoint { id: number,
    x: number;
    y: number;
   , force: number ,}

export interface Position { x: number;
   , y: number }

export interface Velocity { x: number;
   , y: number }

export interface DeviceSettings { touch: TouchSettings;
    mouse: MouseSettings;
    keyboard: KeyboardSettings;
   , gamepad: GamepadSettings
    }

export interface TouchSettings { sensitivity: number;
    deadZone: number;
    multiTouchEnabled: boolean;
   , pressureEnabled: boolean }

export interface MouseSettings { sensitivity: number;
    acceleration: number;
    rightClickEnabled: boolean;
   , wheelSensitivity: number }

export interface KeyboardSettings { sensitivity: number;
    repeatDelay: number;
    repeatRate: number;
    stickyKeys: boolean;
   , filterKeys: boolean }

export interface GamepadSettings { enabled: boolean;
    deadZone: number;
    sensitivity: number;
   , vibrationEnabled: boolean }

export interface DeviceInfo { hasTouch: boolean;
    hasMouse: boolean;
    hasKeyboard: boolean;
    hasGamepad: boolean;
    screenSize: ScreenSize;
    devicePixelRatio: number;
   , orientation: string }

export interface ScreenSize { width: number;
   , height: number }

export interface KeyModifiers { ctrl: boolean;
    alt: boolean;
    shift: boolean;
   , meta: boolean }

export interface StickInput { x: number;
   , y: number }

export interface GamepadButton { pressed: boolean;
    touched: boolean;
   , value: number }

export interface BoundHandlers { touchStart: (even;t: TouchEvent) => void;
    touchMove: (even;t: TouchEvent) => void;
    touchEnd: (even;t: TouchEvent) => void;
    touchCancel: (even;t: TouchEvent) => void;
    mouseDown: (even;t: MouseEvent) => void;
    mouseMove: (even;t: MouseEvent) => void;
    mouseUp: (even;t: MouseEvent) => void;
    wheel: (even;t: WheelEvent) => void;
    contextMenu: (even;t: MouseEvent) => void;
    keyDown: (even;t: KeyboardEvent) => void;
    keyUp: (even;t: KeyboardEvent) => void;
    gamepadConnected: (even;t: GamepadEvent) => void;
    gamepadDisconnected: (even;t: GamepadEvent) => void;
    resize: (even;t: Event) => void;
    orientationChange: (even;t: Event) => void }
}

export interface GestureEventData { type: GestureInputType;
    [key: string]: any, }

export interface TouchGestureData extends GestureEventData { type: 'touch',
    points?: TouchPoint[];
    startPosition?: Position;
    currentPosition?: Position;
    velocity?: Velocity;
    duration?: number;
    distance?: number;
    endPosition?: Position;
    touchPoints?: TouchPoint[];
    fingers?: number;
    direction?: number;
    movement?: number; }
';

export interface MouseGestureData extends GestureEventData {;
    type: 'mouse';
    x?: number;
    y?: number; }
';

export interface WheelGestureData extends GestureEventData {;
    type: 'wheel';
    deltaX: number;
    deltaY: number;
    deltaZ: number;
   , deltaMode: number }
';

export interface KeyboardGestureData extends GestureEventData {;
    type: 'keyboard';
   , key: string;
    code?: string;
    modifiers?: KeyModifiers;
    combo?: string; }
';

export interface GamepadGestureData extends GestureEventData {;
    type: 'gamepad';
    leftStick?: StickInput;
    rightStick?: StickInput;
    buttons?: GamepadButton[];
    timestamp?: number;
    gamepad?: Gamepad;
    }

export interface DeviceCapabilities { touch: boolean,
    mouse: boolean;
    keyboard: boolean;
    gamepad: boolean;
    multiTouch: boolean;
   , pressure: boolean ,}

export interface DeviceSettingsUpdate { touch?: Partial<TouchSettings>;
    mouse?: Partial<MouseSettings>;
    keyboard?: Partial<KeyboardSettings>;
    gamepad?: Partial<GamepadSettings>;
    }
';
// 列挙型
export type GestureInputType = 'touch' | 'mouse' | 'wheel' | 'keyboard' | 'gamepad';''
export type EdgePosition = 'left' | 'right' | 'top' | 'bottom';

export type GestureEventType = '';
    | 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel''';
    | 'mouseDown' | 'mouseMove' | 'mouseUp' | 'wheel' | 'contextMenu''';
    | 'keyDown' | 'keyUp''';
    | 'gamepadInput' | 'gamepadConnected' | 'gamepadDisconnected''';
    | 'screenSizeChange' | 'orientationChange';
';
// 型ガード
export function isTouchGestureData(data: GestureEventData): data is TouchGestureData {;
    return data.type === 'touch'; }

export function isMouseGestureData(data: GestureEventData): data is MouseGestureData {;
    return data.type === 'mouse'; }

export function isWheelGestureData(data: GestureEventData): data is WheelGestureData {;
    return data.type === 'wheel'; }

export function isKeyboardGestureData(data: GestureEventData): data is KeyboardGestureData {;
    return data.type === 'keyboard'; }

export function isGamepadGestureData(data: GestureEventData): data is GamepadGestureData {;
    return data.type === 'gamepad'; }

// コールバック型
export type GestureEventHandler = (eventType: GestureEventType, data: GestureEventData) => void;

export class GestureDeviceManager {
    private config: GestureConfig;
    private recognitionState: RecognitionState;
    private deviceSettings: DeviceSettings;
    private deviceInfo: DeviceInfo | null;
    private boundHandlers: BoundHandlers;
    private, gamepadPollingActive: boolean;
    private onGestureEvent?: GestureEventHandler;

    constructor(config: GestureConfig, recognitionState: RecognitionState) {

        this.config = config;
        this.recognitionState = recognitionState;
        
        // デバイス固有設定
        this.deviceSettings = {
            touch: {
                sensitivity: 1.0;
                deadZone: 5;
               , multiTouchEnabled: true;
    ,}
                pressureEnabled: false }
            };
            mouse: { sensitivity: 1.0;
                acceleration: 1.0;
                rightClickEnabled: true;
               , wheelSensitivity: 1.0 };
            keyboard: { sensitivity: 1.0;
                repeatDelay: 500;
                repeatRate: 50;
                stickyKeys: false;
               , filterKeys: false };
            gamepad: { enabled: false;
                deadZone: 0.1;
                sensitivity: 1.0;
               , vibrationEnabled: true }
        };
        // デバイス情報
        this.deviceInfo = null;
        
        // イベントハンドラーのバインド
        this.boundHandlers = { touchStart: this.handleTouchStart.bind(this),
            touchMove: this.handleTouchMove.bind(this);
            touchEnd: this.handleTouchEnd.bind(this);
            touchCancel: this.handleTouchCancel.bind(this);
            mouseDown: this.handleMouseDown.bind(this);
            mouseMove: this.handleMouseMove.bind(this);
            mouseUp: this.handleMouseUp.bind(this);
            wheel: this.handleWheel.bind(this);
            contextMenu: this.handleContextMenu.bind(this);
            keyDown: this.handleKeyDown.bind(this);
            keyUp: this.handleKeyUp.bind(this);
            gamepadConnected: this.handleGamepadConnected.bind(this);
            gamepadDisconnected: this.handleGamepadDisconnected.bind(this);
            resize: this.handleScreenSizeChange.bind(this);
           , orientationChange: this.handleOrientationChange.bind(this ,};
        
        // ゲームパッドポーリング
        this.gamepadPollingActive = false;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { // デバイス検出と最適化
        this.detectAndOptimizeForDevice();
        // イベントリスナーの設定
        this.setupEventListeners()';
        console.log('GestureDeviceManager, initialized'); }'
    
    /**
     * デバイス検出と最適化
     */
    private detectAndOptimizeForDevice(): void { this.deviceInfo = this.detectDeviceCapabilities();
        
        // タッチスクリーン対応
        if(this.deviceInfo.hasTouch) {
            this.config.deviceAdaptation.touchscreenOptimized = true;
        }
            this.optimizeForTouch(); }
        }
        
        // マウス対応
        if(this.deviceInfo.hasMouse) {
            this.config.deviceAdaptation.mouseOptimized = true;
        }
            this.optimizeForMouse(); }
        }
        
        // キーボード対応
        if(this.deviceInfo.hasKeyboard) {
            this.config.deviceAdaptation.keyboardOptimized = true;
        }
            this.optimizeForKeyboard(); }
        }
        
        // ゲームパッド対応
        if(this.deviceInfo.hasGamepad) {
            this.config.deviceAdaptation.gamepadOptimized = true;''
            this.optimizeForGamepad();
        }

        console.log('Device optimization applied:', this.deviceInfo); }
    }
    
    /**
     * デバイス機能の検出'
     */''
    private detectDeviceCapabilities(''';
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,)';
            hasMouse: matchMedia('(pointer: fine)'').matches,
            hasKeyboard: true, // 常に利用可能と仮定;
            hasGamepad: 'getGamepads' in navigator;
           , screenSize: { width: window.screen.width;
               , height: window.screen.height };
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation? .type || 'unknown';
        },
    }
    
    /**
     * タッチ入力の最適化'
     */ : undefined''
    private optimizeForTouch()';
        if ('TouchEvent' in, window && 'force' in, TouchEvent.prototype) { this.deviceSettings.touch.pressureEnabled = true; }
    }
    
    /**
     * マウス入力の最適化
     */
    private optimizeForMouse(): void { // マウス用の閾値調整
        this.config.gestureThresholds.minDistance = 10;
        this.config.gestureThresholds.minVelocity = 0.05;
        
        // マウス固有設定
        this.deviceSettings.mouse.sensitivity = this.config.touchSensitivity || 1.0;
        this.deviceSettings.mouse.acceleration = 1.0; }
    
    /**
     * キーボード入力の最適化
     */''
    private optimizeForKeyboard()';
        if(navigator.userAgent.includes('Windows) {'
            // Windows固有の設定
            this.deviceSettings.keyboard.stickyKeys = this.checkStickyKeysEnabled();
        }
            this.deviceSettings.keyboard.filterKeys = this.checkFilterKeysEnabled(); }
}
    
    /**
     * ゲームパッド入力の最適化
     */
    private optimizeForGamepad(): void { this.deviceSettings.gamepad.enabled = true;
        this.deviceSettings.gamepad.sensitivity = this.config.touchSensitivity || 1.0; }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void { // タッチイベント
        if(this.config.deviceAdaptation.touchscreenOptimized) {
            
        }
            this.setupTouchListeners(); }
        }
        
        // マウスイベント
        if (this.config.deviceAdaptation.mouseOptimized) { this.setupMouseListeners(); }
        
        // キーボードイベント
        if (this.config.deviceAdaptation.keyboardOptimized) { this.setupKeyboardListeners(); }
        
        // ゲームパッドイベント
        if(this.config.deviceAdaptation.gamepadOptimized) {

            this.setupGamepadListeners()';
        window.addEventListener('resize', this.boundHandlers.resize);
        ';
        // オリエンテーション変更
        if(screen.orientation) {'
        }

            screen.orientation.addEventListener('change', this.boundHandlers.orientationChange); }
}
    
    /**
     * タッチリスナーの設定'
     */''
    private setupTouchListeners()';
        document.addEventListener('touchstart', this.boundHandlers.touchStart, { passive: false )),''
        document.addEventListener('touchmove', this.boundHandlers.touchMove, { passive: false )),''
        document.addEventListener('touchend', this.boundHandlers.touchEnd, { passive: false )),''
        document.addEventListener('touchcancel', this.boundHandlers.touchCancel, { passive: false ,}
    
    /**
     * マウスリスナーの設定'
     */''
    private setupMouseListeners()';
        document.addEventListener('mousedown', this.boundHandlers.mouseDown);''
        document.addEventListener('mousemove', this.boundHandlers.mouseMove);''
        document.addEventListener('mouseup', this.boundHandlers.mouseUp);''
        document.addEventListener('wheel', this.boundHandlers.wheel, { passive: false )),''
        document.addEventListener('contextmenu', this.boundHandlers.contextMenu }
    
    /**
     * キーボードリスナーの設定'
     */''
    private setupKeyboardListeners()';
        document.addEventListener('keydown', this.boundHandlers.keyDown);''
        document.addEventListener('keyup', this.boundHandlers.keyUp);
    }
    
    /**
     * ゲームパッドリスナーの設定'
     */''
    private setupGamepadListeners()';
        window.addEventListener('gamepadconnected', this.boundHandlers.gamepadConnected);''
        window.addEventListener('gamepaddisconnected', this.boundHandlers.gamepadDisconnected);
        
        // ゲームパッド入力の監視
        this.startGamepadPolling();
    }
    
    // タッチイベント処理
    
    /**
     * タッチ開始処理
     */
    private handleTouchStart(event: TouchEvent): void { if (!this.config.enabled) return;
        
        this.recognitionState.isRecognizing = true;
        this.recognitionState.startTime = Date.now();
        this.recognitionState.touchPoints = Array.from(event.touches).map(touch => ({
            id: touch.identifier);
            x: touch.clientX);
           , y: touch.clientY,);
            force: touch.force || 0)));
        this.recognitionState.startPosition = {
            x: this.recognitionState.touchPoints[0].x;
           , y: this.recognitionState.touchPoints[0].y ,}
        };
        // 片手モード用のエッジ検出
        if(this.config.oneHandedMode) {
            ';

        }

            this.detectEdgeTouch(this.recognitionState.startPosition); }
        }
        ';
        // 上位に通知
        this.notifyGestureEvent('touchStart', { ')'
            type: 'touch');
           , points: this.recognitionState.touchPoints,);
            startPosition: this.recognitionState.startPosition ,}
    
    /**
     * タッチ移動処理
     */
    private handleTouchMove(event: TouchEvent): void { if (!this.recognitionState.isRecognizing) return;
        
        event.preventDefault(); // スクロール防止
        
        const currentTouches = Array.from(event.touches).map(touch => ({
            id: touch.identifier);
            x: touch.clientX);
           , y: touch.clientY,);
            force: touch.force || 0)));
        // 速度計算
        this.calculateVelocity(currentTouches);
        
        // 現在位置の更新
        this.recognitionState.currentPosition = {
            x: currentTouches[0].x;
           , y: currentTouches[0].y ,}
        };
        // マルチタッチの処理
        if(currentTouches.length > 1) {
            ';

        }

            this.handleMultiTouch(currentTouches); }
        }
        ';
        // 上位に通知
        this.notifyGestureEvent('touchMove', { ''
            type: 'touch);
            points: currentTouches);
           , currentPosition: this.recognitionState.currentPosition,);
            velocity: this.recognitionState.velocity ,}
    
    /**
     * タッチ終了処理
     */
    private handleTouchEnd(event: TouchEvent): void { if (!this.recognitionState.isRecognizing) return;
        
        const duration = Date.now() - this.recognitionState.startTime;
        const distance = this.calculateDistance(;
            this.recognitionState.startPosition)';
            this.recognitionState.currentPosition)'';
        ');

        // ジェスチャーデータの構築
        const gestureData: TouchGestureData = {''
            type: 'touch';
            duration,
            distance,
            startPosition: this.recognitionState.startPosition;
            endPosition: this.recognitionState.currentPosition;
            touchPoints: this.recognitionState.touchPoints;
            velocity: this.recognitionState.velocity;
            fingers: this.recognitionState.touchPoints.length;
           , direction: this.calculateDirection(;
                this.recognitionState.startPosition)';
                this.recognitionState.currentPosition)'';
            '),
            movement: distance ,};
        ';
        // 上位に通知
        this.notifyGestureEvent('touchEnd', gestureData);
        
        // 状態リセット
        this.resetRecognitionState();
    }
    
    /**
     * タッチキャンセル処理
     */
    private handleTouchCancel(event: TouchEvent): void { ''
        this.resetRecognitionState()';
        this.notifyGestureEvent('touchCancel', { type: 'touch ,}
    
    // マウスイベント処理
    
    /**
     * マウス押下処理
     */
    private handleMouseDown(event: MouseEvent): void { if (!this.config.enabled) return;
        
        // マウスをタッチイベントとして処理
        const mouseTouch = {
            touches: [{
                identifier: 0;
                clientX: event.clientX;
                clientY: event.clientY];
               , force: (event, as any).pressure || 0.5 }]
            }] as Touch[]
        } as TouchEvent;
        this.handleTouchStart(mouseTouch);
    }
    
    /**
     * マウス移動処理
     */
    private handleMouseMove(event: MouseEvent): void { // 視線追跡用
        (window, as any).lastMouseEvent = event;
        
        if (!this.recognitionState.isRecognizing) return;
        
        const mouseTouch = {
            touches: [{
                identifier: 0;
                clientX: event.clientX;
                clientY: event.clientY];
               , force: (event, as any).pressure || 0.5 }]
            }] as Touch[]
        } as TouchEvent;
        this.handleTouchMove(mouseTouch);
    }
    
    /**
     * マウス解放処理
     */
    private handleMouseUp(event: MouseEvent): void { if (!this.recognitionState.isRecognizing) return;
        
        const mouseTouch = {
            touches: [] } as TouchEvent;
        this.handleTouchEnd(mouseTouch);
    }
    
    /**
     * ホイール処理
     */
    private handleWheel(event: WheelEvent): void { if (!this.config.enabled) return;

        event.preventDefault(''';
            type: 'wheel';
            deltaX: event.deltaX;
            deltaY: event.deltaY;
            deltaZ: event.deltaZ;
           , deltaMode: event.deltaMode }))', ')';
        this.notifyGestureEvent('wheel', wheelGesture);
    }
    
    /**
     * コンテキストメニュー処理
     */
    private handleContextMenu(event: MouseEvent): void { if (this.config.enabled) {'
            // カスタムコンテキストメニューの表示
            event.preventDefault(''';
            this.notifyGestureEvent('contextMenu', {)'
                type: 'mouse');
               , x: event.clientX,);
                y: event.clientY ,}
    }
    
    // キーボードイベント処理
    
    /**
     * キー押下処理
     */
    private handleKeyDown(event: KeyboardEvent): void { if (!this.config.enabled) return;
        
        const modifiers: KeyModifiers = {
            ctrl: event.ctrlKey;
            alt: event.altKey;
            shift: event.shiftKey;
           , meta: event.metaKey };
        const keyCombo = this.createKeyCombo(event.key, modifiers);
        
        // キーボードジェスチャーとして処理
        const keyboardGesture: KeyboardGestureData = { ''
            type: 'keyboard';
            key: event.key;
           , code: event.code;
            modifiers,
            combo: keyCombo ,};
        this.notifyGestureEvent('keyDown', keyboardGesture);
    }
    
    /**
     * キー解放処理
     */'
    private handleKeyUp(event: KeyboardEvent): void { ''
        if(!this.config.enabled) return;

        this.notifyGestureEvent('keyUp', {)'
            type: 'keyboard');
           , key: event.key,);
            code: event.code ,}
    
    // ゲームパッド処理
    
    /**
     * ゲームパッド接続処理
     */
    private handleGamepadConnected(event: GamepadEvent): void { const gamepad = event.gamepad;
        console.log(`Gamepad, connected: ${gamepad.id)`},
        ;
        // ゲームパッド固有の設定を適用
        this.configureGamepad(gamepad};

        ' }'

        this.notifyGestureEvent('gamepadConnected', { type: 'gamepad', gamepad });
    }
    
    /**
     * ゲームパッド切断処理
     */'
    private handleGamepadDisconnected(event: GamepadEvent): void { const gamepad = event.gamepad;''
        console.log(`Gamepad disconnected: ${gamepad.id}`'},

        ' }'

        this.notifyGestureEvent('gamepadDisconnected', { type: 'gamepad', gamepad });
    }
    
    /**
     * ゲームパッド入力監視の開始
     */
    private startGamepadPolling(): void { if (this.gamepadPollingActive) return;
        
        this.gamepadPollingActive = true;
        
        const pollGamepad = (): void => { 
            if (!this.deviceSettings.gamepad.enabled || !this.gamepadPollingActive) return;
            
            const gamepads = navigator.getGamepads();
            for(let, i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
            }
                if (gamepad) { }
                    this.processGamepadInput(gamepad); }
}
            
            requestAnimationFrame(pollGamepad);
        };
        
        pollGamepad();
    }
    
    /**
     * ゲームパッド入力処理
     */
    private processGamepadInput(gamepad: Gamepad): void { // スティック入力
        const leftStick: StickInput = {
            x: Math.abs(gamepad.axes[0]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[0] : 0;
            y: Math.abs(gamepad.axes[1]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[1] : 0 };
        const rightStick: StickInput = { x: Math.abs(gamepad.axes[2]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[2] : 0,
            y: Math.abs(gamepad.axes[3]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[3] : 0 ,};
        // ボタン入力
        const buttons: GamepadButton[] = gamepad.buttons.map(button => ({ pressed: button.pressed)
           , touched: button.touched,')';
            value: button.value))');
        // ゲームパッドジェスチャーとして処理
        const, gamepadGesture: GamepadGestureData = {''
            type: 'gamepad';
            leftStick,
            rightStick,
            buttons,
            timestamp: Date.now()';
        this.notifyGestureEvent('gamepadInput', gamepadGesture); }
    
    // ユーティリティ関数
    
    /**
     * キーコンボの作成
     */
    private createKeyCombo(key: string, modifiers: KeyModifiers): string { const parts: string[] = [],''
        if(modifiers.ctrl) parts.push('Ctrl);''
        if(modifiers.alt) parts.push('Alt);''
        if(modifiers.shift) parts.push('Shift);''
        if(modifiers.meta) parts.push('Meta);''
        parts.push(key);''
        return parts.join('+); }'
    
    /**
     * ゲームパッド設定'
     */''
    private configureGamepad(gamepad: Gamepad): void { // ゲームパッド固有の設定
        if(gamepad.id.includes('Xbox)) {'
            this.deviceSettings.gamepad.deadZone = 0.15;' }'

        } else if(gamepad.id.includes('PlayStation) { this.deviceSettings.gamepad.deadZone = 0.1; }'
    }
    
    /**
     * StickyKeys有効状態のチェック
     */
    private checkStickyKeysEnabled(): boolean { // Windowsの場合のみ実装可能
        return false; // 簡略化 }
    
    /**
     * FilterKeys有効状態のチェック
     */
    private checkFilterKeysEnabled(): boolean { // Windowsの場合のみ実装可能
        return false; // 簡略化 }
    
    /**
     * 距離計算
     */
    private calculateDistance(point1: Position, point2: Position): number { const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy); }
    
    /**
     * 方向計算（度）
     */
    private calculateDirection(start: Position, end: Position): number { const angle = Math.atan2(end.y - start.y, end.x - start.x);
        return (angle * 180 / Math.PI + 360) % 360; }
    
    /**
     * 速度計算
     */
    private calculateVelocity(currentTouches: TouchPoint[]): void { if (this.recognitionState.touchPoints.length === 0) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.recognitionState.startTime;
        
        if (deltaTime === 0) return;
        
        const startTouch = this.recognitionState.touchPoints[0];
        const currentTouch = currentTouches[0];
        
        const dx = currentTouch.x - startTouch.x;
        const dy = currentTouch.y - startTouch.y;
        
        this.recognitionState.velocity = {
            x: dx / deltaTime;
           , y: dy / deltaTime }
    
    /**
     * マルチタッチ処理
     */
    private handleMultiTouch(touches: TouchPoint[]): void { if (touches.length === 2) {
            // ピンチジェスチャーの検出
            const distance = this.calculateDistance(touches[0], touches[1]);
            const initialDistance = this.calculateDistance(;
                this.recognitionState.touchPoints[0]);
                this.recognitionState.touchPoints[1]);
            
            const scale = distance / initialDistance;
            this.recognitionState.scale = scale; }
    }
    
    /**
     * エッジタッチの検出
     */
    private detectEdgeTouch(position: Position): void { const edgeThreshold = 50;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        // エッジの判定
        if(position.x < edgeThreshold) {', ';

        }

            this.recognitionState.edge = 'left';' }

        } else if(position.x > screenWidth - edgeThreshold) { ''
            this.recognitionState.edge = 'right';' }

        } else if(position.y < edgeThreshold) { ''
            this.recognitionState.edge = 'top';' }

        } else if(position.y > screenHeight - edgeThreshold) { ''
            this.recognitionState.edge = 'bottom'; }
    }
    
    /**
     * 認識状態のリセット
     */
    private resetRecognitionState(): void { this.recognitionState.isRecognizing = false;
        this.recognitionState.currentGesture = null;
        this.recognitionState.startTime = 0; }
        this.recognitionState.startPosition = { x: 0, y: 0 ,}
        this.recognitionState.currentPosition = { x: 0, y: 0 ,}
        this.recognitionState.touchPoints = [];
        this.recognitionState.velocity = { x: 0, y: 0 ,}
        this.recognitionState.pressure = 0;
        delete this.recognitionState.scale;
        delete this.recognitionState.edge;
    }
    
    /**
     * 画面サイズ変更処理
     */'
    private handleScreenSizeChange(): void { ''
        if(!this.deviceInfo) return;
        
        // デバイス情報を更新
        this.deviceInfo.screenSize = {
            width: window.screen.width;
           , height: window.screen.height };
        this.notifyGestureEvent('screenSizeChange', { ')'
            type: 'touch', // ダミー型);
            screenSize: this.deviceInfo.screenSize ,}
    
    /**
     * オリエンテーション変更処理
     */
    private handleOrientationChange(): void { ''
        if(!this.deviceInfo) return;

        this.deviceInfo.orientation = screen.orientation? .type || 'unknown';''
        this.notifyGestureEvent('orientationChange', { : undefined)'
            type: 'touch', // ダミー型);
            orientation: this.deviceInfo.orientation ,}
    
    /**
     * ジェスチャーイベントの通知
     */
    private notifyGestureEvent(eventType: GestureEventType, data: GestureEventData): void { if (this.onGestureEvent) {
            this.onGestureEvent(eventType, data); }
    }
    
    /**
     * イベントハンドラーの設定
     */
    setGestureEventHandler(handler: GestureEventHandler): void { this.onGestureEvent = handler; }
    
    /**
     * デバイス情報の取得
     */
    getDeviceInfo(): DeviceInfo | null { return this.deviceInfo; }
    
    /**
     * デバイス設定の取得
     */
    getDeviceSettings(): DeviceSettings { return this.deviceSettings; }
    
    /**
     * 設定の更新
     */
    updateSettings(newSettings: DeviceSettingsUpdate): void { if (newSettings.touch) {
            Object.assign(this.deviceSettings.touch, newSettings.touch); }
        
        if (newSettings.mouse) { Object.assign(this.deviceSettings.mouse, newSettings.mouse); }
        
        if (newSettings.keyboard) { Object.assign(this.deviceSettings.keyboard, newSettings.keyboard); }
        
        if(newSettings.gamepad) {
        ';

            ';

        }

            Object.assign(this.deviceSettings.gamepad, newSettings.gamepad); }
        }

        console.log('GestureDeviceManager, settings updated);
    }
    
    /**
     * デバイス機能を取得
     */
    getDeviceCapabilities(): DeviceCapabilities { const info = this.deviceInfo;
        if(!info) {
            return { touch: false,
                mouse: false;
                keyboard: false;
               , gamepad: false;
        ,}
                multiTouch: false, };
                pressure: false }
            }
        
        return { touch: info.hasTouch,
            mouse: info.hasMouse;
            keyboard: info.hasKeyboard;
            gamepad: info.hasGamepad;
           , multiTouch: this.deviceSettings.touch.multiTouchEnabled, };
            pressure: this.deviceSettings.touch.pressureEnabled }
        }
    
    /**
     * ゲームパッドポーリングの停止
     */
    stopGamepadPolling('): void { this.gamepadPollingActive = false; }
    
    /**
     * リソースの解放'
     */''
    destroy()';
        document.removeEventListener('touchstart', this.boundHandlers.touchStart);''
        document.removeEventListener('touchmove', this.boundHandlers.touchMove);''
        document.removeEventListener('touchend', this.boundHandlers.touchEnd);''
        document.removeEventListener('touchcancel', this.boundHandlers.touchCancel);''
        document.removeEventListener('mousedown', this.boundHandlers.mouseDown);''
        document.removeEventListener('mousemove', this.boundHandlers.mouseMove);''
        document.removeEventListener('mouseup', this.boundHandlers.mouseUp);''
        document.removeEventListener('wheel', this.boundHandlers.wheel);''
        document.removeEventListener('contextmenu', this.boundHandlers.contextMenu);''
        document.removeEventListener('keydown', this.boundHandlers.keyDown);''
        document.removeEventListener('keyup', this.boundHandlers.keyUp);''
        window.removeEventListener('gamepadconnected', this.boundHandlers.gamepadConnected);''
        window.removeEventListener('gamepaddisconnected', this.boundHandlers.gamepadDisconnected);''
        window.removeEventListener('resize', this.boundHandlers.resize);

        if(screen.orientation) {', ';

        }

            screen.orientation.removeEventListener('change', this.boundHandlers.orientationChange); }
        }

        console.log('GestureDeviceManager, destroyed'');

    }''
}