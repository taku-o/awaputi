/**
 * GestureDeviceManager - デバイス管理システム
 * 
 * デバイス検出、入力最適化、イベント処理、ゲームパッド統合を専門的に管理します
 */
export class GestureDeviceManager {
    constructor(config, recognitionState) {
        this.config = config;
        this.recognitionState = recognitionState;
        
        // デバイス固有設定
        this.deviceSettings = {
            touch: {
                sensitivity: 1.0,
                deadZone: 5,
                multiTouchEnabled: true,
                pressureEnabled: false
            },
            mouse: {
                sensitivity: 1.0,
                acceleration: 1.0,
                rightClickEnabled: true,
                wheelSensitivity: 1.0
            },
            keyboard: {
                sensitivity: 1.0,
                repeatDelay: 500,
                repeatRate: 50,
                stickyKeys: false,
                filterKeys: false
            },
            gamepad: {
                enabled: false,
                deadZone: 0.1,
                sensitivity: 1.0,
                vibrationEnabled: true
            }
        };
        
        // デバイス情報
        this.deviceInfo = null;
        
        // イベントハンドラーのバインド
        this.boundHandlers = {
            touchStart: this.handleTouchStart.bind(this),
            touchMove: this.handleTouchMove.bind(this),
            touchEnd: this.handleTouchEnd.bind(this),
            touchCancel: this.handleTouchCancel.bind(this),
            mouseDown: this.handleMouseDown.bind(this),
            mouseMove: this.handleMouseMove.bind(this),
            mouseUp: this.handleMouseUp.bind(this),
            wheel: this.handleWheel.bind(this),
            contextMenu: this.handleContextMenu.bind(this),
            keyDown: this.handleKeyDown.bind(this),
            keyUp: this.handleKeyUp.bind(this),
            gamepadConnected: this.handleGamepadConnected.bind(this),
            gamepadDisconnected: this.handleGamepadDisconnected.bind(this),
            resize: this.handleScreenSizeChange.bind(this),
            orientationChange: this.handleOrientationChange.bind(this)
        };
        
        // ゲームパッドポーリング
        this.gamepadPollingActive = false;
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        // デバイス検出と最適化
        this.detectAndOptimizeForDevice();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        console.log('GestureDeviceManager initialized');
    }
    
    /**
     * デバイス検出と最適化
     */
    detectAndOptimizeForDevice() {
        this.deviceInfo = this.detectDeviceCapabilities();
        
        // タッチスクリーン対応
        if (this.deviceInfo.hasTouch) {
            this.config.deviceAdaptation.touchscreenOptimized = true;
            this.optimizeForTouch();
        }
        
        // マウス対応
        if (this.deviceInfo.hasMouse) {
            this.config.deviceAdaptation.mouseOptimized = true;
            this.optimizeForMouse();
        }
        
        // キーボード対応
        if (this.deviceInfo.hasKeyboard) {
            this.config.deviceAdaptation.keyboardOptimized = true;
            this.optimizeForKeyboard();
        }
        
        // ゲームパッド対応
        if (this.deviceInfo.hasGamepad) {
            this.config.deviceAdaptation.gamepadOptimized = true;
            this.optimizeForGamepad();
        }
        
        console.log('Device optimization applied:', this.deviceInfo);
    }
    
    /**
     * デバイス機能の検出
     */
    detectDeviceCapabilities() {
        return {
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            hasMouse: matchMedia('(pointer: fine)').matches,
            hasKeyboard: true, // 常に利用可能と仮定
            hasGamepad: 'getGamepads' in navigator,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation?.type || 'unknown'
        };
    }
    
    /**
     * タッチ入力の最適化
     */
    optimizeForTouch() {
        // タッチ用の閾値調整
        this.config.gestureThresholds.minDistance = 15;
        this.config.gestureThresholds.angleThreshold = 20;
        
        // タッチ固有設定
        this.deviceSettings.touch.multiTouchEnabled = true;
        this.deviceSettings.touch.sensitivity = this.config.touchSensitivity || 1.0;
        
        // プレッシャー検出
        if ('TouchEvent' in window && 'force' in TouchEvent.prototype) {
            this.deviceSettings.touch.pressureEnabled = true;
        }
    }
    
    /**
     * マウス入力の最適化
     */
    optimizeForMouse() {
        // マウス用の閾値調整
        this.config.gestureThresholds.minDistance = 10;
        this.config.gestureThresholds.minVelocity = 0.05;
        
        // マウス固有設定
        this.deviceSettings.mouse.sensitivity = this.config.touchSensitivity || 1.0;
        this.deviceSettings.mouse.acceleration = 1.0;
    }
    
    /**
     * キーボード入力の最適化
     */
    optimizeForKeyboard() {
        // キーボード設定
        this.deviceSettings.keyboard.sensitivity = this.config.keyboardSensitivity || 1.0;
        
        // アクセシビリティ機能
        if (navigator.userAgent.includes('Windows')) {
            // Windows固有の設定
            this.deviceSettings.keyboard.stickyKeys = this.checkStickyKeysEnabled();
            this.deviceSettings.keyboard.filterKeys = this.checkFilterKeysEnabled();
        }
    }
    
    /**
     * ゲームパッド入力の最適化
     */
    optimizeForGamepad() {
        this.deviceSettings.gamepad.enabled = true;
        this.deviceSettings.gamepad.sensitivity = this.config.touchSensitivity || 1.0;
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // タッチイベント
        if (this.config.deviceAdaptation.touchscreenOptimized) {
            this.setupTouchListeners();
        }
        
        // マウスイベント
        if (this.config.deviceAdaptation.mouseOptimized) {
            this.setupMouseListeners();
        }
        
        // キーボードイベント
        if (this.config.deviceAdaptation.keyboardOptimized) {
            this.setupKeyboardListeners();
        }
        
        // ゲームパッドイベント
        if (this.config.deviceAdaptation.gamepadOptimized) {
            this.setupGamepadListeners();
        }
        
        // ウィンドウイベント
        window.addEventListener('resize', this.boundHandlers.resize);
        
        // オリエンテーション変更
        if (screen.orientation) {
            screen.orientation.addEventListener('change', this.boundHandlers.orientationChange);
        }
    }
    
    /**
     * タッチリスナーの設定
     */
    setupTouchListeners() {
        document.addEventListener('touchstart', this.boundHandlers.touchStart, { passive: false });
        document.addEventListener('touchmove', this.boundHandlers.touchMove, { passive: false });
        document.addEventListener('touchend', this.boundHandlers.touchEnd, { passive: false });
        document.addEventListener('touchcancel', this.boundHandlers.touchCancel, { passive: false });
    }
    
    /**
     * マウスリスナーの設定
     */
    setupMouseListeners() {
        document.addEventListener('mousedown', this.boundHandlers.mouseDown);
        document.addEventListener('mousemove', this.boundHandlers.mouseMove);
        document.addEventListener('mouseup', this.boundHandlers.mouseUp);
        document.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
        document.addEventListener('contextmenu', this.boundHandlers.contextMenu);
    }
    
    /**
     * キーボードリスナーの設定
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', this.boundHandlers.keyDown);
        document.addEventListener('keyup', this.boundHandlers.keyUp);
    }
    
    /**
     * ゲームパッドリスナーの設定
     */
    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', this.boundHandlers.gamepadConnected);
        window.addEventListener('gamepaddisconnected', this.boundHandlers.gamepadDisconnected);
        
        // ゲームパッド入力の監視
        this.startGamepadPolling();
    }
    
    // タッチイベント処理
    
    /**
     * タッチ開始処理
     */
    handleTouchStart(event) {
        if (!this.config.enabled) return;
        
        this.recognitionState.isRecognizing = true;
        this.recognitionState.startTime = Date.now();
        this.recognitionState.touchPoints = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            force: touch.force || 0
        }));
        
        this.recognitionState.startPosition = {
            x: this.recognitionState.touchPoints[0].x,
            y: this.recognitionState.touchPoints[0].y
        };
        
        // 片手モード用のエッジ検出
        if (this.config.oneHandedMode) {
            this.detectEdgeTouch(this.recognitionState.startPosition);
        }
        
        // 上位に通知
        this.notifyGestureEvent('touchStart', {
            type: 'touch',
            points: this.recognitionState.touchPoints,
            startPosition: this.recognitionState.startPosition
        });
    }
    
    /**
     * タッチ移動処理
     */
    handleTouchMove(event) {
        if (!this.recognitionState.isRecognizing) return;
        
        event.preventDefault(); // スクロール防止
        
        const currentTouches = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            force: touch.force || 0
        }));
        
        // 速度計算
        this.calculateVelocity(currentTouches);
        
        // 現在位置の更新
        this.recognitionState.currentPosition = {
            x: currentTouches[0].x,
            y: currentTouches[0].y
        };
        
        // マルチタッチの処理
        if (currentTouches.length > 1) {
            this.handleMultiTouch(currentTouches);
        }
        
        // 上位に通知
        this.notifyGestureEvent('touchMove', {
            type: 'touch',
            points: currentTouches,
            currentPosition: this.recognitionState.currentPosition,
            velocity: this.recognitionState.velocity
        });
    }
    
    /**
     * タッチ終了処理
     */
    handleTouchEnd(event) {
        if (!this.recognitionState.isRecognizing) return;
        
        const duration = Date.now() - this.recognitionState.startTime;
        const distance = this.calculateDistance(
            this.recognitionState.startPosition,
            this.recognitionState.currentPosition
        );
        
        // ジェスチャーデータの構築
        const gestureData = {
            type: 'touch',
            duration,
            distance,
            startPosition: this.recognitionState.startPosition,
            endPosition: this.recognitionState.currentPosition,
            touchPoints: this.recognitionState.touchPoints,
            velocity: this.recognitionState.velocity,
            fingers: this.recognitionState.touchPoints.length,
            direction: this.calculateDirection(
                this.recognitionState.startPosition,
                this.recognitionState.currentPosition
            ),
            movement: distance
        };
        
        // 上位に通知
        this.notifyGestureEvent('touchEnd', gestureData);
        
        // 状態リセット
        this.resetRecognitionState();
    }
    
    /**
     * タッチキャンセル処理
     */
    handleTouchCancel(event) {
        this.resetRecognitionState();
        this.notifyGestureEvent('touchCancel', {});
    }
    
    // マウスイベント処理
    
    /**
     * マウス押下処理
     */
    handleMouseDown(event) {
        if (!this.config.enabled) return;
        
        // マウスをタッチイベントとして処理
        const mouseTouch = {
            touches: [{
                identifier: 0,
                clientX: event.clientX,
                clientY: event.clientY,
                force: event.pressure || 0.5
            }]
        };
        
        this.handleTouchStart(mouseTouch);
    }
    
    /**
     * マウス移動処理
     */
    handleMouseMove(event) {
        // 視線追跡用
        window.lastMouseEvent = event;
        
        if (!this.recognitionState.isRecognizing) return;
        
        const mouseTouch = {
            touches: [{
                identifier: 0,
                clientX: event.clientX,
                clientY: event.clientY,
                force: event.pressure || 0.5
            }]
        };
        
        this.handleTouchMove(mouseTouch);
    }
    
    /**
     * マウス解放処理
     */
    handleMouseUp(event) {
        if (!this.recognitionState.isRecognizing) return;
        
        const mouseTouch = {
            touches: []
        };
        
        this.handleTouchEnd(mouseTouch);
    }
    
    /**
     * ホイール処理
     */
    handleWheel(event) {
        if (!this.config.enabled) return;
        
        event.preventDefault();
        
        const wheelGesture = {
            type: 'wheel',
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode
        };
        
        this.notifyGestureEvent('wheel', wheelGesture);
    }
    
    /**
     * コンテキストメニュー処理
     */
    handleContextMenu(event) {
        if (this.config.enabled) {
            // カスタムコンテキストメニューの表示
            event.preventDefault();
            this.notifyGestureEvent('contextMenu', {
                x: event.clientX,
                y: event.clientY
            });
        }
    }
    
    // キーボードイベント処理
    
    /**
     * キー押下処理
     */
    handleKeyDown(event) {
        if (!this.config.enabled) return;
        
        const modifiers = {
            ctrl: event.ctrlKey,
            alt: event.altKey,
            shift: event.shiftKey,
            meta: event.metaKey
        };
        
        const keyCombo = this.createKeyCombo(event.key, modifiers);
        
        // キーボードジェスチャーとして処理
        const keyboardGesture = {
            type: 'keyboard',
            key: event.key,
            code: event.code,
            modifiers,
            combo: keyCombo
        };
        
        this.notifyGestureEvent('keyDown', keyboardGesture);
    }
    
    /**
     * キー解放処理
     */
    handleKeyUp(event) {
        if (!this.config.enabled) return;
        
        this.notifyGestureEvent('keyUp', {
            type: 'keyboard',
            key: event.key,
            code: event.code
        });
    }
    
    // ゲームパッド処理
    
    /**
     * ゲームパッド接続処理
     */
    handleGamepadConnected(event) {
        const gamepad = event.gamepad;
        console.log(`Gamepad connected: ${gamepad.id}`);
        
        // ゲームパッド固有の設定を適用
        this.configureGamepad(gamepad);
        
        this.notifyGestureEvent('gamepadConnected', { gamepad });
    }
    
    /**
     * ゲームパッド切断処理
     */
    handleGamepadDisconnected(event) {
        const gamepad = event.gamepad;
        console.log(`Gamepad disconnected: ${gamepad.id}`);
        
        this.notifyGestureEvent('gamepadDisconnected', { gamepad });
    }
    
    /**
     * ゲームパッド入力監視の開始
     */
    startGamepadPolling() {
        if (this.gamepadPollingActive) return;
        
        this.gamepadPollingActive = true;
        
        const pollGamepad = () => {
            if (!this.deviceSettings.gamepad.enabled || !this.gamepadPollingActive) return;
            
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
                if (gamepad) {
                    this.processGamepadInput(gamepad);
                }
            }
            
            requestAnimationFrame(pollGamepad);
        };
        
        pollGamepad();
    }
    
    /**
     * ゲームパッド入力処理
     */
    processGamepadInput(gamepad) {
        // スティック入力
        const leftStick = {
            x: Math.abs(gamepad.axes[0]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[0] : 0,
            y: Math.abs(gamepad.axes[1]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[1] : 0
        };
        
        const rightStick = {
            x: Math.abs(gamepad.axes[2]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[2] : 0,
            y: Math.abs(gamepad.axes[3]) > this.deviceSettings.gamepad.deadZone ? gamepad.axes[3] : 0
        };
        
        // ボタン入力
        const buttons = gamepad.buttons.map(button => ({
            pressed: button.pressed,
            touched: button.touched,
            value: button.value
        }));
        
        // ゲームパッドジェスチャーとして処理
        const gamepadGesture = {
            type: 'gamepad',
            leftStick,
            rightStick,
            buttons,
            timestamp: Date.now()
        };
        
        this.notifyGestureEvent('gamepadInput', gamepadGesture);
    }
    
    // ユーティリティ関数
    
    /**
     * キーコンボの作成
     */
    createKeyCombo(key, modifiers) {
        const parts = [];
        if (modifiers.ctrl) parts.push('Ctrl');
        if (modifiers.alt) parts.push('Alt');
        if (modifiers.shift) parts.push('Shift');
        if (modifiers.meta) parts.push('Meta');
        parts.push(key);
        return parts.join('+');
    }
    
    /**
     * ゲームパッド設定
     */
    configureGamepad(gamepad) {
        // ゲームパッド固有の設定
        if (gamepad.id.includes('Xbox')) {
            this.deviceSettings.gamepad.deadZone = 0.15;
        } else if (gamepad.id.includes('PlayStation')) {
            this.deviceSettings.gamepad.deadZone = 0.1;
        }
    }
    
    /**
     * StickyKeys有効状態のチェック
     */
    checkStickyKeysEnabled() {
        // Windowsの場合のみ実装可能
        return false; // 簡略化
    }
    
    /**
     * FilterKeys有効状態のチェック
     */
    checkFilterKeysEnabled() {
        // Windowsの場合のみ実装可能
        return false; // 簡略化
    }
    
    /**
     * 距離計算
     */
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 方向計算（度）
     */
    calculateDirection(start, end) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        return (angle * 180 / Math.PI + 360) % 360;
    }
    
    /**
     * 速度計算
     */
    calculateVelocity(currentTouches) {
        if (this.recognitionState.touchPoints.length === 0) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.recognitionState.startTime;
        
        if (deltaTime === 0) return;
        
        const startTouch = this.recognitionState.touchPoints[0];
        const currentTouch = currentTouches[0];
        
        const dx = currentTouch.x - startTouch.x;
        const dy = currentTouch.y - startTouch.y;
        
        this.recognitionState.velocity = {
            x: dx / deltaTime,
            y: dy / deltaTime
        };
    }
    
    /**
     * マルチタッチ処理
     */
    handleMultiTouch(touches) {
        if (touches.length === 2) {
            // ピンチジェスチャーの検出
            const distance = this.calculateDistance(touches[0], touches[1]);
            const initialDistance = this.calculateDistance(
                this.recognitionState.touchPoints[0],
                this.recognitionState.touchPoints[1]
            );
            
            const scale = distance / initialDistance;
            this.recognitionState.scale = scale;
        }
    }
    
    /**
     * エッジタッチの検出
     */
    detectEdgeTouch(position) {
        const edgeThreshold = 50;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // エッジの判定
        if (position.x < edgeThreshold) {
            this.recognitionState.edge = 'left';
        } else if (position.x > screenWidth - edgeThreshold) {
            this.recognitionState.edge = 'right';
        } else if (position.y < edgeThreshold) {
            this.recognitionState.edge = 'top';
        } else if (position.y > screenHeight - edgeThreshold) {
            this.recognitionState.edge = 'bottom';
        }
    }
    
    /**
     * 認識状態のリセット
     */
    resetRecognitionState() {
        this.recognitionState.isRecognizing = false;
        this.recognitionState.currentGesture = null;
        this.recognitionState.startTime = 0;
        this.recognitionState.startPosition = { x: 0, y: 0 };
        this.recognitionState.currentPosition = { x: 0, y: 0 };
        this.recognitionState.touchPoints = [];
        this.recognitionState.velocity = { x: 0, y: 0 };
        this.recognitionState.pressure = 0;
    }
    
    /**
     * 画面サイズ変更処理
     */
    handleScreenSizeChange() {
        // デバイス情報を更新
        this.deviceInfo.screenSize = {
            width: window.screen.width,
            height: window.screen.height
        };
        
        this.notifyGestureEvent('screenSizeChange', this.deviceInfo.screenSize);
    }
    
    /**
     * オリエンテーション変更処理
     */
    handleOrientationChange() {
        this.deviceInfo.orientation = screen.orientation?.type || 'unknown';
        this.notifyGestureEvent('orientationChange', this.deviceInfo.orientation);
    }
    
    /**
     * ジェスチャーイベントの通知
     */
    notifyGestureEvent(eventType, data) {
        if (this.onGestureEvent) {
            this.onGestureEvent(eventType, data);
        }
    }
    
    /**
     * イベントハンドラーの設定
     */
    setGestureEventHandler(handler) {
        this.onGestureEvent = handler;
    }
    
    /**
     * デバイス情報の取得
     */
    getDeviceInfo() {
        return this.deviceInfo;
    }
    
    /**
     * デバイス設定の取得
     */
    getDeviceSettings() {
        return this.deviceSettings;
    }
    
    /**
     * 設定の更新
     */
    updateSettings(newSettings) {
        if (newSettings.touch) {
            Object.assign(this.deviceSettings.touch, newSettings.touch);
        }
        
        if (newSettings.mouse) {
            Object.assign(this.deviceSettings.mouse, newSettings.mouse);
        }
        
        if (newSettings.keyboard) {
            Object.assign(this.deviceSettings.keyboard, newSettings.keyboard);
        }
        
        if (newSettings.gamepad) {
            Object.assign(this.deviceSettings.gamepad, newSettings.gamepad);
        }
        
        console.log('GestureDeviceManager settings updated');
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        // ゲームパッドポーリング停止
        this.gamepadPollingActive = false;
        
        // イベントリスナーの削除
        document.removeEventListener('touchstart', this.boundHandlers.touchStart);
        document.removeEventListener('touchmove', this.boundHandlers.touchMove);
        document.removeEventListener('touchend', this.boundHandlers.touchEnd);
        document.removeEventListener('touchcancel', this.boundHandlers.touchCancel);
        document.removeEventListener('mousedown', this.boundHandlers.mouseDown);
        document.removeEventListener('mousemove', this.boundHandlers.mouseMove);
        document.removeEventListener('mouseup', this.boundHandlers.mouseUp);
        document.removeEventListener('wheel', this.boundHandlers.wheel);
        document.removeEventListener('contextmenu', this.boundHandlers.contextMenu);
        document.removeEventListener('keydown', this.boundHandlers.keyDown);
        document.removeEventListener('keyup', this.boundHandlers.keyUp);
        window.removeEventListener('gamepadconnected', this.boundHandlers.gamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.boundHandlers.gamepadDisconnected);
        window.removeEventListener('resize', this.boundHandlers.resize);
        
        if (screen.orientation) {
            screen.orientation.removeEventListener('change', this.boundHandlers.orientationChange);
        }
        
        console.log('GestureDeviceManager destroyed');
    }
}