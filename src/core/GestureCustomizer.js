import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * ジェスチャーカスタマイザークラス
 * パーソナライズされた操作とジェスチャーの設定・管理
 */
export class GestureCustomizer {
    constructor(motorAccessibilityManager) {
        this.motorAccessibilityManager = motorAccessibilityManager;
        this.accessibilityManager = motorAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // ジェスチャー設定
        this.config = {
            enabled: false,
            oneHandedMode: false,
            gestureRecognition: true,
            touchSensitivity: 1.0,
            mouseSensitivity: 1.0,
            keyboardSensitivity: 1.0,
            gestureThresholds: {
                minDistance: 20,      // 最小移動距離（ピクセル）
                maxTime: 1000,        // 最大ジェスチャー時間（ミリ秒）
                minVelocity: 0.1,     // 最小速度（ピクセル/ミリ秒）
                maxVelocity: 5.0,     // 最大速度
                angleThreshold: 15,   // 角度許容度（度）
                pressureThreshold: 0.5 // 圧力閾値（0-1）
            },
            alternativeGestures: {
                enabled: true,
                simplifiedMode: false,
                singleFingerOnly: false,
                dwellActivation: false,
                dwellTime: 800
            },
            deviceAdaptation: {
                autoDetect: true,
                touchscreenOptimized: false,
                mouseOptimized: true,
                keyboardOptimized: false,
                gamepadOptimized: false
            }
        };
        
        // ジェスチャーパターン定義
        this.gesturePatterns = new Map([
            // 基本ジェスチャー
            ['tap', {
                type: 'touch',
                fingers: 1,
                duration: [50, 300],
                movement: [0, 10],
                action: 'click',
                alternatives: ['click', 'space', 'enter']
            }],
            ['longPress', {
                type: 'touch',
                fingers: 1,
                duration: [800, 2000],
                movement: [0, 15],
                action: 'contextMenu',
                alternatives: ['rightClick', 'ctrl+click']
            }],
            ['doubleTap', {
                type: 'touch',
                fingers: 1,
                duration: [50, 200],
                interval: [50, 400],
                movement: [0, 20],
                action: 'doubleClick',
                alternatives: ['doubleClick', 'enter']
            }],
            
            // スワイプジェスチャー
            ['swipeUp', {
                type: 'swipe',
                direction: [80, 100], // 角度範囲（度）
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'scrollUp',
                alternatives: ['arrowUp', 'pageUp', 'wheelUp']
            }],
            ['swipeDown', {
                type: 'swipe',
                direction: [260, 280],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'scrollDown',
                alternatives: ['arrowDown', 'pageDown', 'wheelDown']
            }],
            ['swipeLeft', {
                type: 'swipe',
                direction: [170, 190],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'navigateBack',
                alternatives: ['arrowLeft', 'backspace', 'escape']
            }],
            ['swipeRight', {
                type: 'swipe',
                direction: [-10, 10],
                distance: [50, 500],
                velocity: [0.2, 3.0],
                action: 'navigateForward',
                alternatives: ['arrowRight', 'tab', 'enter']
            }],
            
            // マルチタッチジェスチャー
            ['pinchIn', {
                type: 'pinch',
                fingers: 2,
                direction: 'in',
                scale: [0.5, 1.0],
                action: 'zoomOut',
                alternatives: ['ctrl+-', 'minus']
            }],
            ['pinchOut', {
                type: 'pinch',
                fingers: 2,
                direction: 'out',
                scale: [1.0, 2.0],
                action: 'zoomIn',
                alternatives: ['ctrl+=', 'plus']
            }],
            ['twoFingerTap', {
                type: 'touch',
                fingers: 2,
                duration: [50, 300],
                movement: [0, 20],
                action: 'rightClick',
                alternatives: ['rightClick', 'contextMenu']
            }],
            ['threeFingerTap', {
                type: 'touch',
                fingers: 3,
                duration: [50, 300],
                movement: [0, 30],
                action: 'showMenu',
                alternatives: ['alt', 'menu', 'F10']
            }],
            
            // 片手操作専用ジェスチャー
            ['edgeSwipeLeft', {
                type: 'edgeSwipe',
                edge: 'left',
                distance: [30, 100],
                action: 'navigateBack',
                oneHandedOnly: true,
                alternatives: ['swipeRight']
            }],
            ['edgeSwipeRight', {
                type: 'edgeSwipe',
                edge: 'right',
                distance: [30, 100],
                action: 'showMenu',
                oneHandedOnly: true,
                alternatives: ['longPress']
            }],
            ['cornerTap', {
                type: 'cornerTap',
                corner: 'topRight',
                size: [50, 50],
                action: 'quickAction',
                oneHandedOnly: true,
                alternatives: ['doubleTap']
            }]
        ]);
        
        // カスタマイズされたジェスチャー
        this.customGestures = new Map();
        
        // ジェスチャー認識状態
        this.recognitionState = {
            isRecognizing: false,
            currentGesture: null,
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            touchPoints: [],
            velocity: { x: 0, y: 0 },
            pressure: 0,
            gestureHistory: []
        };
        
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
        
        // 入力適応システム
        this.adaptationSystem = {
            learningEnabled: true,
            userProfile: {
                dominantHand: 'right', // 'left', 'right', 'both'
                reachability: 'normal', // 'limited', 'normal', 'extended'
                precision: 'normal',    // 'low', 'normal', 'high'
                speed: 'normal',        // 'slow', 'normal', 'fast'
                endurance: 'normal'     // 'low', 'normal', 'high'
            },
            adaptiveThresholds: {
                errorRate: 0.1,
                successRate: 0.9,
                responseTime: 1000,
                gestureCompletion: 0.8
            },
            suggestions: []
        };
        
        // 統計情報
        this.stats = {
            gesturesRecognized: 0,
            gesturesByType: new Map(),
            successfulGestures: 0,
            failedGestures: 0,
            averageGestureTime: 0,
            customizationChanges: 0,
            adaptationTriggers: 0,
            sessionStart: Date.now()
        };
        
        // ユーザー設定
        this.userPreferences = {
            oneHandedMode: false,
            preferredHand: 'right',
            gestureComplexity: 'normal', // 'simple', 'normal', 'advanced'
            touchSensitivity: 1.0,
            gestureTimeout: 1000,
            visualFeedback: true,
            audioFeedback: true,
            hapticFeedback: true,
            customGestures: new Map(),
            disabledGestures: new Set(),
            alternativeBindings: new Map()
        };
        
        // 認識エンジン
        this.recognitionEngine = {
            currentRecognizers: new Map(),
            gestureBuffer: [],
            recognitionThreshold: 0.8,
            maxBufferSize: 20
        };
        
        console.log('GestureCustomizer initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // デバイス検出と最適化
            this.detectAndOptimizeForDevice();
            
            // ジェスチャー認識エンジンの初期化
            this.initializeRecognitionEngine();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // ユーザープロファイルの初期化
            this.initializeUserProfile();
            
            console.log('GestureCustomizer initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'GESTURE_CUSTOMIZER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('gestureCustomizer_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map/Set の復元
                if (preferences.customGestures) {
                    this.userPreferences.customGestures = new Map(preferences.customGestures);
                }
                if (preferences.disabledGestures) {
                    this.userPreferences.disabledGestures = new Set(preferences.disabledGestures);
                }
                if (preferences.alternativeBindings) {
                    this.userPreferences.alternativeBindings = new Map(preferences.alternativeBindings);
                }
                
                // 設定を適用
                this.applyUserPreferences();
            }
        } catch (error) {
            console.warn('Failed to load gesture customizer preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                customGestures: Array.from(this.userPreferences.customGestures.entries()),
                disabledGestures: Array.from(this.userPreferences.disabledGestures),
                alternativeBindings: Array.from(this.userPreferences.alternativeBindings.entries())
            };
            
            localStorage.setItem('gestureCustomizer_preferences', 
                JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save gesture customizer preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の適用
     */
    applyUserPreferences() {
        // 基本設定
        this.config.oneHandedMode = this.userPreferences.oneHandedMode;
        this.config.touchSensitivity = this.userPreferences.touchSensitivity;
        
        // 片手モードの適応
        if (this.userPreferences.oneHandedMode) {
            this.enableOneHandedMode(this.userPreferences.preferredHand);
        }
        
        // ジェスチャー複雑度の適応
        this.adaptGestureComplexity(this.userPreferences.gestureComplexity);
        
        // カスタムジェスチャーの適用
        for (const [name, gesture] of this.userPreferences.customGestures) {
            this.customGestures.set(name, gesture);
        }
    }
    
    /**
     * デバイス検出と最適化
     */
    detectAndOptimizeForDevice() {
        const deviceInfo = this.detectDeviceCapabilities();
        
        // タッチスクリーン対応
        if (deviceInfo.hasTouch) {
            this.config.deviceAdaptation.touchscreenOptimized = true;
            this.optimizeForTouch();
        }
        
        // マウス対応
        if (deviceInfo.hasMouse) {
            this.config.deviceAdaptation.mouseOptimized = true;
            this.optimizeForMouse();
        }
        
        // キーボード対応
        if (deviceInfo.hasKeyboard) {
            this.config.deviceAdaptation.keyboardOptimized = true;
            this.optimizeForKeyboard();
        }
        
        // ゲームパッド対応
        if (deviceInfo.hasGamepad) {
            this.config.deviceAdaptation.gamepadOptimized = true;
            this.optimizeForGamepad();
        }
        
        console.log('Device optimization applied:', deviceInfo);
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
        this.deviceSettings.touch.sensitivity = this.userPreferences.touchSensitivity;
        
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
        this.deviceSettings.mouse.sensitivity = this.userPreferences.touchSensitivity;
        this.deviceSettings.mouse.acceleration = 1.0;
    }
    
    /**
     * キーボード入力の最適化
     */
    optimizeForKeyboard() {
        // キーボード設定
        this.deviceSettings.keyboard.sensitivity = this.userPreferences.touchSensitivity;
        
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
        this.deviceSettings.gamepad.sensitivity = this.userPreferences.touchSensitivity;
    }
    
    /**
     * 認識エンジンの初期化
     */
    initializeRecognitionEngine() {
        // 各ジェスチャータイプの認識エンジン
        this.recognitionEngine.currentRecognizers.set('tap', this.createTapRecognizer());
        this.recognitionEngine.currentRecognizers.set('swipe', this.createSwipeRecognizer());
        this.recognitionEngine.currentRecognizers.set('pinch', this.createPinchRecognizer());
        this.recognitionEngine.currentRecognizers.set('custom', this.createCustomRecognizer());
        
        console.log('Recognition engines initialized');
    }
    
    /**
     * タップ認識エンジン
     */
    createTapRecognizer() {
        return {
            recognize: (gestureData) => {
                const { duration, movement, fingers } = gestureData;
                
                // タップパターンのマッチング
                for (const [name, pattern] of this.gesturePatterns) {
                    if (pattern.type === 'touch' && 
                        this.matchesTapPattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * スワイプ認識エンジン
     */
    createSwipeRecognizer() {
        return {
            recognize: (gestureData) => {
                const { direction, distance, velocity } = gestureData;
                
                // スワイプパターンのマッチング
                for (const [name, pattern] of this.gesturePatterns) {
                    if (pattern.type === 'swipe' && 
                        this.matchesSwipePattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * ピンチ認識エンジン
     */
    createPinchRecognizer() {
        return {
            recognize: (gestureData) => {
                const { scale, fingers } = gestureData;
                
                if (fingers !== 2) return null;
                
                // ピンチパターンのマッチング
                for (const [name, pattern] of this.gesturePatterns) {
                    if (pattern.type === 'pinch' && 
                        this.matchesPinchPattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
    }
    
    /**
     * カスタム認識エンジン
     */
    createCustomRecognizer() {
        return {
            recognize: (gestureData) => {
                // カスタムジェスチャーの認識
                for (const [name, pattern] of this.customGestures) {
                    if (this.matchesCustomPattern(gestureData, pattern)) {
                        return { gesture: name, confidence: this.calculateCustomConfidence(gestureData, pattern) };
                    }
                }
                
                return null;
            }
        };
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
        window.addEventListener('resize', () => {
            this.handleScreenSizeChange();
        });
        
        // オリエンテーション変更
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleOrientationChange();
            });
        }
    }
    
    /**
     * タッチリスナーの設定
     */
    setupTouchListeners() {
        document.addEventListener('touchstart', (event) => {
            this.handleTouchStart(event);
        }, { passive: false });
        
        document.addEventListener('touchmove', (event) => {
            this.handleTouchMove(event);
        }, { passive: false });
        
        document.addEventListener('touchend', (event) => {
            this.handleTouchEnd(event);
        }, { passive: false });
        
        document.addEventListener('touchcancel', (event) => {
            this.handleTouchCancel(event);
        }, { passive: false });
    }
    
    /**
     * マウスリスナーの設定
     */
    setupMouseListeners() {
        document.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });
        
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
            window.lastMouseEvent = event; // 視線追跡用
        });
        
        document.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });
        
        document.addEventListener('wheel', (event) => {
            this.handleWheel(event);
        }, { passive: false });
        
        document.addEventListener('contextmenu', (event) => {
            this.handleContextMenu(event);
        });
    }
    
    /**
     * キーボードリスナーの設定
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // 組み合わせキーの検出
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardGesture(event);
        });
    }
    
    /**
     * ゲームパッドリスナーの設定
     */
    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', (event) => {
            this.handleGamepadConnected(event);
        });
        
        window.addEventListener('gamepaddisconnected', (event) => {
            this.handleGamepadDisconnected(event);
        });
        
        // ゲームパッド入力の監視
        this.startGamepadPolling();
    }
    
    /**
     * ユーザープロファイルの初期化
     */
    initializeUserProfile() {
        // 既存の統計から推測
        this.analyzeUserBehavior();
        
        // 適応的閾値の設定
        this.setAdaptiveThresholds();
        
        console.log('User profile initialized:', this.adaptationSystem.userProfile);
    }
    
    /**
     * ユーザー行動の分析
     */
    analyzeUserBehavior() {
        // 統計データから利き手を推測
        // 画面上の操作位置分析
        // ジェスチャーの成功率分析
        // 反応時間の分析
        
        console.log('Analyzing user behavior patterns...');
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
        
        // リアルタイムジェスチャー認識
        this.performRealtimeRecognition();
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
            )
        };
        
        // ジェスチャー認識の実行
        this.recognizeGesture(gestureData);
        
        // 状態リセット
        this.resetRecognitionState();
    }
    
    /**
     * タッチキャンセル処理
     */
    handleTouchCancel(event) {
        this.resetRecognitionState();
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
        
        this.processWheelGesture(wheelGesture);
    }
    
    /**
     * コンテキストメニュー処理
     */
    handleContextMenu(event) {
        if (this.config.enabled) {
            // カスタムコンテキストメニューの表示
            event.preventDefault();
            this.showCustomContextMenu(event.clientX, event.clientY);
        }
    }
    
    // キーボードイベント処理
    
    /**
     * キー押下処理
     */
    handleKeyDown(event) {
        if (!this.config.enabled) return;
        
        // アクセシビリティキーの処理
        this.processAccessibilityKeys(event);
        
        // カスタムキーバインディング
        this.processCustomKeyBinding(event);
    }
    
    /**
     * キー解放処理
     */
    handleKeyUp(event) {
        // キーリピートの処理
        this.processKeyRepeat(event);
    }
    
    /**
     * キーボードジェスチャー処理
     */
    handleKeyboardGesture(event) {
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
        
        this.processKeyboardGesture(keyboardGesture);
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
    }
    
    /**
     * ゲームパッド切断処理
     */
    handleGamepadDisconnected(event) {
        const gamepad = event.gamepad;
        console.log(`Gamepad disconnected: ${gamepad.id}`);
    }
    
    /**
     * ゲームパッド入力監視の開始
     */
    startGamepadPolling() {
        const pollGamepad = () => {
            if (!this.deviceSettings.gamepad.enabled) return;
            
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
        
        this.processGamepadGesture(gamepadGesture);
    }
    
    // ジェスチャー認識
    
    /**
     * リアルタイムジェスチャー認識
     */
    performRealtimeRecognition() {
        // 進行中のジェスチャーの中間認識
        const partialGestureData = this.buildPartialGestureData();
        
        // 予測的認識
        const prediction = this.predictGesture(partialGestureData);
        if (prediction && prediction.confidence > 0.5) {
            this.providePredictiveFeedback(prediction);
        }
    }
    
    /**
     * ジェスチャー認識の実行
     */
    recognizeGesture(gestureData) {
        const recognitionResults = [];
        
        // 各認識エンジンで認識
        for (const [type, recognizer] of this.recognitionEngine.currentRecognizers) {
            const result = recognizer.recognize(gestureData);
            if (result && result.confidence > this.recognitionEngine.recognitionThreshold) {
                recognitionResults.push(result);
            }
        }
        
        // 最も信頼度の高い結果を選択
        if (recognitionResults.length > 0) {
            const bestResult = recognitionResults.reduce((best, current) => 
                current.confidence > best.confidence ? current : best
            );
            
            this.executeGesture(bestResult.gesture, gestureData);
            this.updateGestureStats(bestResult.gesture, true);
        } else {
            this.handleUnrecognizedGesture(gestureData);
            this.updateGestureStats('unknown', false);
        }
    }
    
    /**
     * タップパターンマッチング
     */
    matchesTapPattern(gestureData, pattern) {
        const { duration, movement, fingers } = gestureData;
        
        return duration >= pattern.duration[0] && 
               duration <= pattern.duration[1] &&
               movement <= pattern.movement[1] &&
               fingers === pattern.fingers;
    }
    
    /**
     * スワイプパターンマッチング
     */
    matchesSwipePattern(gestureData, pattern) {
        const { direction, distance, velocity } = gestureData;
        
        return direction >= pattern.direction[0] && 
               direction <= pattern.direction[1] &&
               distance >= pattern.distance[0] &&
               distance <= pattern.distance[1] &&
               velocity >= pattern.velocity[0] &&
               velocity <= pattern.velocity[1];
    }
    
    /**
     * ピンチパターンマッチング
     */
    matchesPinchPattern(gestureData, pattern) {
        const { scale, fingers } = gestureData;
        
        return fingers === pattern.fingers &&
               scale >= pattern.scale[0] &&
               scale <= pattern.scale[1];
    }
    
    /**
     * カスタムパターンマッチング
     */
    matchesCustomPattern(gestureData, pattern) {
        // カスタムパターンの複雑なマッチング
        return this.calculateCustomConfidence(gestureData, pattern) > 0.8;
    }
    
    /**
     * 信頼度計算
     */
    calculateConfidence(gestureData, pattern) {
        let confidence = 1.0;
        
        // 各パラメーターの一致度を計算
        // 実装は簡略化
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    /**
     * カスタム信頼度計算
     */
    calculateCustomConfidence(gestureData, pattern) {
        // カスタムパターン用の信頼度計算
        return 0.85; // 簡略化
    }
    
    // ジェスチャー実行
    
    /**
     * ジェスチャーの実行
     */
    executeGesture(gestureName, gestureData) {
        console.log(`Executing gesture: ${gestureName}`);
        
        // 無効化されたジェスチャーをスキップ
        if (this.userPreferences.disabledGestures.has(gestureName)) {
            console.log(`Gesture ${gestureName} is disabled`);
            return;
        }
        
        // 代替バインディングの確認
        const alternativeAction = this.userPreferences.alternativeBindings.get(gestureName);
        if (alternativeAction) {
            this.executeAlternativeAction(alternativeAction, gestureData);
            return;
        }
        
        // 標準ジェスチャーの実行
        const pattern = this.gesturePatterns.get(gestureName) || this.customGestures.get(gestureName);
        if (pattern) {
            this.executeStandardAction(pattern.action, gestureData);
        }
        
        // フィードバック提供
        this.provideGestureFeedback(gestureName, gestureData);
        
        // 適応学習
        this.updateAdaptiveLearning(gestureName, gestureData, true);
    }
    
    /**
     * 標準アクションの実行
     */
    executeStandardAction(action, gestureData) {
        switch (action) {
            case 'click':
                this.simulateClick(gestureData.endPosition);
                break;
            case 'doubleClick':
                this.simulateDoubleClick(gestureData.endPosition);
                break;
            case 'rightClick':
                this.simulateRightClick(gestureData.endPosition);
                break;
            case 'scrollUp':
                this.simulateScroll(-100);
                break;
            case 'scrollDown':
                this.simulateScroll(100);
                break;
            case 'zoomIn':
                this.simulateZoom(1.2);
                break;
            case 'zoomOut':
                this.simulateZoom(0.8);
                break;
            case 'navigateBack':
                this.navigateBack();
                break;
            case 'navigateForward':
                this.navigateForward();
                break;
            case 'showMenu':
                this.showContextMenu(gestureData.endPosition);
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }
    
    /**
     * 代替アクションの実行
     */
    executeAlternativeAction(alternativeAction, gestureData) {
        if (alternativeAction.type === 'key') {
            this.simulateKeyPress(alternativeAction.key, alternativeAction.modifiers);
        } else if (alternativeAction.type === 'custom') {
            this.executeCustomAction(alternativeAction.action, gestureData);
        }
    }
    
    /**
     * 未認識ジェスチャーの処理
     */
    handleUnrecognizedGesture(gestureData) {
        console.log('Unrecognized gesture:', gestureData);
        
        // 学習機会として記録
        this.recordUnrecognizedGesture(gestureData);
        
        // ユーザーにフィードバック
        this.provideUnrecognizedGestureFeedback();
        
        // 適応提案
        this.suggestGestureAlternatives(gestureData);
    }
    
    // シミュレーション機能
    
    /**
     * クリックシミュレーション
     */
    simulateClick(position) {
        const element = document.elementFromPoint(position.x, position.y);
        if (element) {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: position.x,
                clientY: position.y
            });
            element.dispatchEvent(clickEvent);
        }
    }
    
    /**
     * ダブルクリックシミュレーション
     */
    simulateDoubleClick(position) {
        this.simulateClick(position);
        setTimeout(() => this.simulateClick(position), 50);
    }
    
    /**
     * 右クリックシミュレーション
     */
    simulateRightClick(position) {
        const element = document.elementFromPoint(position.x, position.y);
        if (element) {
            const contextEvent = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: position.x,
                clientY: position.y
            });
            element.dispatchEvent(contextEvent);
        }
    }
    
    /**
     * スクロールシミュレーション
     */
    simulateScroll(deltaY) {
        const wheelEvent = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            view: window,
            deltaY: deltaY * this.deviceSettings.mouse.wheelSensitivity
        });
        
        const focusedElement = document.activeElement || document.body;
        focusedElement.dispatchEvent(wheelEvent);
    }
    
    /**
     * ズームシミュレーション
     */
    simulateZoom(scaleFactor) {
        // ゲームエンジンのズーム機能を呼び出し
        if (this.gameEngine?.cameraManager) {
            this.gameEngine.cameraManager.zoom(scaleFactor);
        }
    }
    
    /**
     * キープレスシミュレーション
     */
    simulateKeyPress(key, modifiers = {}) {
        const keyEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: key,
            ctrlKey: modifiers.ctrl || false,
            altKey: modifiers.alt || false,
            shiftKey: modifiers.shift || false,
            metaKey: modifiers.meta || false
        });
        
        document.dispatchEvent(keyEvent);
        
        // keyup イベントも発火
        setTimeout(() => {
            const keyUpEvent = new KeyboardEvent('keyup', {
                bubbles: true,
                cancelable: true,
                key: key,
                ctrlKey: modifiers.ctrl || false,
                altKey: modifiers.alt || false,
                shiftKey: modifiers.shift || false,
                metaKey: modifiers.meta || false
            });
            document.dispatchEvent(keyUpEvent);
        }, 50);
    }
    
    // 片手操作モード
    
    /**
     * 片手操作モードの有効化
     */
    enableOneHandedMode(preferredHand = 'right') {
        this.config.oneHandedMode = true;
        this.userPreferences.preferredHand = preferredHand;
        
        // 片手用のジェスチャーを有効化
        this.activateOneHandedGestures();
        
        // UIの調整
        this.adjustUIForOneHanded(preferredHand);
        
        console.log(`One-handed mode enabled for ${preferredHand} hand`);
    }
    
    /**
     * 片手操作モードの無効化
     */
    disableOneHandedMode() {
        this.config.oneHandedMode = false;
        
        // 標準ジェスチャーに戻す
        this.deactivateOneHandedGestures();
        
        // UIを元に戻す
        this.resetUILayout();
        
        console.log('One-handed mode disabled');
    }
    
    /**
     * 片手用ジェスチャーの有効化
     */
    activateOneHandedGestures() {
        // エッジスワイプを有効化
        this.gesturePatterns.get('edgeSwipeLeft').enabled = true;
        this.gesturePatterns.get('edgeSwipeRight').enabled = true;
        this.gesturePatterns.get('cornerTap').enabled = true;
        
        // 通常のスワイプの閾値を調整
        this.config.gestureThresholds.minDistance = 30; // より短い距離で認識
    }
    
    /**
     * 片手用ジェスチャーの無効化
     */
    deactivateOneHandedGestures() {
        // エッジスワイプを無効化
        this.gesturePatterns.get('edgeSwipeLeft').enabled = false;
        this.gesturePatterns.get('edgeSwipeRight').enabled = false;
        this.gesturePatterns.get('cornerTap').enabled = false;
        
        // 閾値を標準に戻す
        this.config.gestureThresholds.minDistance = 20;
    }
    
    /**
     * UIの片手操作調整
     */
    adjustUIForOneHanded(preferredHand) {
        // UI要素を操作しやすい位置に移動
        const uiElements = document.querySelectorAll('[data-ui-adjustable]');
        
        uiElements.forEach(element => {
            if (preferredHand === 'right') {
                element.style.transform = 'translateX(-20%)';
            } else {
                element.style.transform = 'translateX(20%)';
            }
        });
    }
    
    /**
     * UIレイアウトのリセット
     */
    resetUILayout() {
        const uiElements = document.querySelectorAll('[data-ui-adjustable]');
        
        uiElements.forEach(element => {
            element.style.transform = '';
        });
    }
    
    // 適応学習システム
    
    /**
     * 適応学習の更新
     */
    updateAdaptiveLearning(gestureName, gestureData, success) {
        if (!this.adaptationSystem.learningEnabled) return;
        
        // 成功/失敗パターンの学習
        this.learnGesturePattern(gestureName, gestureData, success);
        
        // ユーザープロファイルの更新
        this.updateUserProfile(gestureData, success);
        
        // 適応的閾値の調整
        this.adjustAdaptiveThresholds(success);
        
        // 改善提案の生成
        this.generateImprovementSuggestions();
    }
    
    /**
     * ジェスチャーパターンの学習
     */
    learnGesturePattern(gestureName, gestureData, success) {
        // 成功したパターンを記録
        if (success) {
            // 閾値の微調整
            this.adjustGestureThresholds(gestureName, gestureData);
        }
    }
    
    /**
     * ユーザープロファイルの更新
     */
    updateUserProfile(gestureData, success) {
        const profile = this.adaptationSystem.userProfile;
        
        // 精度の更新
        if (gestureData.distance < 10) {
            profile.precision = 'high';
        } else if (gestureData.distance > 50) {
            profile.precision = 'low';
        }
        
        // 速度の更新
        if (gestureData.duration < 200) {
            profile.speed = 'fast';
        } else if (gestureData.duration > 1000) {
            profile.speed = 'slow';
        }
    }
    
    /**
     * ジェスチャー複雑度の適応
     */
    adaptGestureComplexity(complexity) {
        switch (complexity) {
            case 'simple':
                this.enableSimpleGestures();
                break;
            case 'advanced':
                this.enableAdvancedGestures();
                break;
            case 'normal':
            default:
                this.enableNormalGestures();
                break;
        }
    }
    
    /**
     * 簡単なジェスチャーの有効化
     */
    enableSimpleGestures() {
        // 複雑なマルチタッチを無効化
        this.config.alternativeGestures.singleFingerOnly = true;
        
        // 滞留アクティベーションを有効化
        this.config.alternativeGestures.dwellActivation = true;
    }
    
    /**
     * 通常ジェスチャーの有効化
     */
    enableNormalGestures() {
        // バランスの取れた設定
        this.config.alternativeGestures.singleFingerOnly = false;
        this.config.alternativeGestures.dwellActivation = false;
    }
    
    /**
     * 高度なジェスチャーの有効化
     */
    enableAdvancedGestures() {
        // すべてのジェスチャーを有効化
        this.config.alternativeGestures.singleFingerOnly = false;
        this.config.alternativeGestures.simplifiedMode = false;
        
        // カスタムジェスチャーの推奨
        this.suggestAdvancedGestures();
    }
    
    // ユーティリティ関数
    
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
        this.recognitionState = {
            isRecognizing: false,
            currentGesture: null,
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            touchPoints: [],
            velocity: { x: 0, y: 0 },
            pressure: 0,
            gestureHistory: []
        };
    }
    
    // フィードバック機能
    
    /**
     * ジェスチャーフィードバックの提供
     */
    provideGestureFeedback(gestureName, gestureData) {
        // 視覚フィードバック
        if (this.userPreferences.visualFeedback) {
            this.showVisualFeedback(gestureName, gestureData);
        }
        
        // 音声フィードバック
        if (this.userPreferences.audioFeedback) {
            this.playGestureFeedbackSound(gestureName);
        }
        
        // 触覚フィードバック
        if (this.userPreferences.hapticFeedback) {
            this.triggerHapticFeedback(gestureName);
        }
    }
    
    /**
     * 視覚フィードバックの表示
     */
    showVisualFeedback(gestureName, gestureData) {
        // 一時的な視覚効果
        const feedback = document.createElement('div');
        feedback.className = 'gesture-feedback';
        feedback.textContent = gestureName;
        feedback.style.cssText = `
            position: fixed;
            left: ${gestureData.endPosition.x}px;
            top: ${gestureData.endPosition.y}px;
            background: rgba(0, 255, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            animation: fadeOut 1s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }
    
    /**
     * ジェスチャー音声フィードバック
     */
    playGestureFeedbackSound(gestureName) {
        if (this.gameEngine?.audioManager) {
            const soundMap = {
                'tap': 'gesture_tap',
                'swipe': 'gesture_swipe',
                'pinch': 'gesture_pinch',
                'longPress': 'gesture_long'
            };
            
            const soundId = soundMap[gestureName] || 'gesture_generic';
            this.gameEngine.audioManager.playSound(soundId, { volume: 0.3 });
        }
    }
    
    /**
     * 触覚フィードバック
     */
    triggerHapticFeedback(gestureName) {
        if (this.motorAccessibilityManager?.vibrationManager) {
            this.motorAccessibilityManager.vibrationManager.triggerVibration(gestureName);
        }
    }
    
    // 統計管理
    
    /**
     * ジェスチャー統計の更新
     */
    updateGestureStats(gestureName, success) {
        this.stats.gesturesRecognized++;
        
        if (success) {
            this.stats.successfulGestures++;
        } else {
            this.stats.failedGestures++;
        }
        
        const count = this.stats.gesturesByType.get(gestureName) || 0;
        this.stats.gesturesByType.set(gestureName, count + 1);
    }
    
    // パブリックAPI
    
    /**
     * ジェスチャーカスタマイザーの有効化
     */
    enable() {
        this.config.enabled = true;
        
        console.log('Gesture customizer enabled');
    }
    
    /**
     * ジェスチャーカスタマイザーの無効化
     */
    disable() {
        this.config.enabled = false;
        
        // 認識状態をリセット
        this.resetRecognitionState();
        
        console.log('Gesture customizer disabled');
    }
    
    /**
     * カスタムジェスチャーの追加
     */
    addCustomGesture(name, pattern) {
        this.customGestures.set(name, pattern);
        this.userPreferences.customGestures.set(name, pattern);
        
        this.saveUserPreferences();
        console.log(`Custom gesture added: ${name}`);
    }
    
    /**
     * ジェスチャーの無効化
     */
    disableGesture(gestureName) {
        this.userPreferences.disabledGestures.add(gestureName);
        this.saveUserPreferences();
        
        console.log(`Gesture disabled: ${gestureName}`);
    }
    
    /**
     * ジェスチャーの有効化
     */
    enableGesture(gestureName) {
        this.userPreferences.disabledGestures.delete(gestureName);
        this.saveUserPreferences();
        
        console.log(`Gesture enabled: ${gestureName}`);
    }
    
    /**
     * 代替バインディングの設定
     */
    setAlternativeBinding(gestureName, alternativeAction) {
        this.userPreferences.alternativeBindings.set(gestureName, alternativeAction);
        this.saveUserPreferences();
        
        console.log(`Alternative binding set: ${gestureName} -> ${alternativeAction}`);
    }
    
    /**
     * 感度の設定
     */
    setSensitivity(inputType, sensitivity) {
        const normalizedSensitivity = Math.max(0.1, Math.min(3.0, sensitivity));
        
        switch (inputType) {
            case 'touch':
                this.config.touchSensitivity = normalizedSensitivity;
                this.userPreferences.touchSensitivity = normalizedSensitivity;
                break;
            case 'mouse':
                this.config.mouseSensitivity = normalizedSensitivity;
                break;
            case 'keyboard':
                this.config.keyboardSensitivity = normalizedSensitivity;
                break;
        }
        
        this.saveUserPreferences();
        console.log(`${inputType} sensitivity set to: ${normalizedSensitivity}`);
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.motor?.gestureCustomizer) {
            Object.assign(this.config, config.motor.gestureCustomizer);
        }
        
        console.log('GestureCustomizer configuration applied');
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.stats.sessionStart;
        
        return {
            timestamp: new Date().toISOString(),
            configuration: {
                enabled: this.config.enabled,
                oneHandedMode: this.config.oneHandedMode,
                gestureComplexity: this.userPreferences.gestureComplexity
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                gesturesPerMinute: this.stats.gesturesRecognized / (sessionDuration / 60000),
                successRate: this.stats.successfulGestures / this.stats.gesturesRecognized,
                customGestures: this.customGestures.size,
                disabledGestures: this.userPreferences.disabledGestures.size
            },
            userPreferences: this.userPreferences,
            adaptationSystem: this.adaptationSystem,
            deviceSettings: this.deviceSettings
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
        
        console.log(`GestureCustomizer ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying GestureCustomizer...');
        
        // ジェスチャーカスタマイザーを無効化
        this.disable();
        
        // フィードバック要素の削除
        document.querySelectorAll('.gesture-feedback').forEach(element => {
            element.remove();
        });
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.gesturePatterns.clear();
        this.customGestures.clear();
        this.recognitionEngine.currentRecognizers.clear();
        this.recognitionEngine.gestureBuffer = [];
        
        console.log('GestureCustomizer destroyed');
    }
}