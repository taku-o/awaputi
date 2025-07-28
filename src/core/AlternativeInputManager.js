import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 代替入力管理クラス
 * スイッチ入力、視線追跡、音声コントロールなど多様な入力方法のサポート
 */
export class AlternativeInputManager {
    constructor(motorAccessibilityManager) {
        this.motorAccessibilityManager = motorAccessibilityManager;
        this.accessibilityManager = motorAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // 代替入力設定
        this.config = {
            enabled: false,
            supportedMethods: {
                switch: true,      // スイッチ入力
                eyeTracking: true, // 視線追跡
                voiceControl: true,// 音声制御
                headTracking: true,// 頭部追跡
                singleKey: true,   // 単一キー操作
                scanning: true     // スキャニング入力
            },
            switchInput: {
                enabled: false,
                scanSpeed: 2000, // ミリ秒
                scanMode: 'auto', // 'auto', 'manual', 'hybrid'
                activationTime: 100, // 押下判定時間
                dwellTime: 1000, // 滞留時間
                numberOfSwitches: 1, // スイッチ数
                switchMapping: new Map([
                    ['space', 'primary'],
                    ['enter', 'secondary'],
                    ['escape', 'cancel']
                ])
            },
            eyeTracking: {
                enabled: false,
                calibrationPoints: 9,
                dwellTime: 800,
                gazeTolerance: 50, // ピクセル
                smoothingFactor: 0.3,
                blinkDetection: true,
                blinkThreshold: 200 // ミリ秒
            },
            voiceControl: {
                enabled: false,
                language: 'ja-JP',
                confidence: 0.7,
                commands: new Map([
                    ['クリック', 'click'],
                    ['ポップ', 'pop'],
                    ['選択', 'select'],
                    ['戻る', 'back'],
                    ['次へ', 'next'],
                    ['メニュー', 'menu'],
                    ['ポーズ', 'pause'],
                    ['再開', 'resume'],
                    ['上', 'up'],
                    ['下', 'down'],
                    ['左', 'left'],
                    ['右', 'right']
                ]),
                continuousListening: false,
                pushToTalk: true
            },
            headTracking: {
                enabled: false,
                sensitivity: 1.0,
                deadZone: 0.1,
                smoothing: 0.5,
                calibrationTime: 3000,
                gestureRecognition: true
            },
            singleKey: {
                enabled: false,
                key: 'space',
                actionCycle: ['move', 'select', 'cancel'],
                cycleTime: 3000,
                visualIndicator: true
            },
            scanning: {
                enabled: false,
                scanPattern: 'linear', // 'linear', 'group', 'custom'
                highlightStyle: 'border',
                highlightColor: '#00ff00',
                audioFeedback: true,
                autoStart: true,
                groupScanLevels: 2
            }
        };
        
        // 入力状態管理
        this.activeMethod = null;
        this.inputState = {
            switch: {
                isPressed: false,
                lastPressTime: 0,
                scanningActive: false,
                currentIndex: 0,
                scanDirection: 1
            },
            eyeTracking: {
                isCalibrated: false,
                currentGaze: { x: 0, y: 0 },
                dwellTimer: null,
                gazeHistory: [],
                lastBlink: 0
            },
            voiceControl: {
                isListening: false,
                recognition: null,
                lastCommand: null,
                commandQueue: []
            },
            headTracking: {
                isCalibrated: false,
                neutralPosition: null,
                currentPosition: { x: 0, y: 0, z: 0 },
                gestureBuffer: []
            },
            singleKey: {
                currentAction: 0,
                cycleTimer: null,
                lastKeyTime: 0
            },
            scanning: {
                isScanning: false,
                currentElement: null,
                scanTimer: null,
                elementGroups: [],
                currentGroup: 0
            }
        };
        
        // 要素管理
        this.interactiveElements = new Map();
        this.focusableElements = [];
        this.scanningGroups = [];
        this.currentFocusIndex = -1;
        
        // 視覚フィードバック要素
        this.feedbackElements = new Map();
        this.scanHighlight = null;
        this.gazePointer = null;
        
        // 外部デバイス連携
        this.externalDevices = new Map();
        this.deviceAPIs = {
            eyeTracker: null,
            headTracker: null,
            switchAdapter: null
        };
        
        // 統計情報
        this.stats = {
            inputsProcessed: 0,
            inputsByMethod: new Map(),
            successfulActivations: 0,
            missedActivations: 0,
            averageActivationTime: 0,
            calibrationAttempts: 0,
            sessionStart: Date.now()
        };
        
        // ユーザー設定
        this.userPreferences = {
            preferredMethod: 'switch',
            switchSettings: {
                scanSpeed: 2000,
                activationSound: true,
                visualFeedback: true
            },
            eyeTrackingSettings: {
                dwellTime: 800,
                showGazeCursor: true,
                calibrationReminder: true
            },
            voiceSettings: {
                customCommands: new Map(),
                voiceEngine: 'default',
                feedbackVoice: true
            },
            headTrackingSettings: {
                invertX: false,
                invertY: false,
                gestureEnabled: true
            },
            generalSettings: {
                audioFeedback: true,
                hapticFeedback: true,
                confirmActions: true
            }
        };
        
        console.log('AlternativeInputManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // 入力方法の検出と初期化
            this.detectAvailableInputMethods();
            
            // 視覚フィードバック要素の作成
            this.createFeedbackElements();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // インタラクティブ要素の収集
            this.collectInteractiveElements();
            
            console.log('AlternativeInputManager initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ALTERNATIVE_INPUT_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('alternativeInput_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                
                // Map の復元
                if (preferences.voiceSettings?.customCommands) {
                    this.userPreferences.voiceSettings.customCommands = 
                        new Map(preferences.voiceSettings.customCommands);
                }
                
                // 設定を適用
                this.applyUserPreferences();
            }
        } catch (error) {
            console.warn('Failed to load alternative input preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.userPreferences,
                voiceSettings: {
                    ...this.userPreferences.voiceSettings,
                    customCommands: Array.from(this.userPreferences.voiceSettings.customCommands.entries())
                }
            };
            
            localStorage.setItem('alternativeInput_preferences', 
                JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save alternative input preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の適用
     */
    applyUserPreferences() {
        const prefs = this.userPreferences;
        
        // スイッチ設定
        this.config.switchInput.scanSpeed = prefs.switchSettings.scanSpeed;
        
        // 視線追跡設定
        this.config.eyeTracking.dwellTime = prefs.eyeTrackingSettings.dwellTime;
        
        // 音声コマンド統合
        if (prefs.voiceSettings.customCommands.size > 0) {
            for (const [phrase, action] of prefs.voiceSettings.customCommands) {
                this.config.voiceControl.commands.set(phrase, action);
            }
        }
        
        // 頭部追跡設定
        if (prefs.headTrackingSettings.invertX || prefs.headTrackingSettings.invertY) {
            this.updateHeadTrackingInversion();
        }
    }
    
    /**
     * 利用可能な入力方法の検出
     */
    detectAvailableInputMethods() {
        // スイッチ入力（常に利用可能）
        this.config.supportedMethods.switch = true;
        
        // 音声認識API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.config.supportedMethods.voiceControl = true;
            this.initializeVoiceControl();
        }
        
        // カメラアクセス（視線・頭部追跡用）
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // 実際のデバイス検出は権限が必要なため、後で実行
            this.config.supportedMethods.eyeTracking = true;
            this.config.supportedMethods.headTracking = true;
        }
        
        // 外部デバイスの検出
        this.detectExternalDevices();
        
        console.log('Available input methods:', Object.entries(this.config.supportedMethods)
            .filter(([, supported]) => supported)
            .map(([method]) => method));
    }
    
    /**
     * 外部デバイスの検出
     */
    detectExternalDevices() {
        // WebUSB API での検出（対応デバイス用）
        if ('usb' in navigator) {
            navigator.usb.getDevices().then(devices => {
                devices.forEach(device => {
                    this.checkDeviceCompatibility(device);
                });
            });
        }
        
        // WebHID API での検出
        if ('hid' in navigator) {
            navigator.hid.getDevices().then(devices => {
                devices.forEach(device => {
                    this.checkHIDDeviceCompatibility(device);
                });
            });
        }
    }
    
    /**
     * デバイス互換性確認
     */
    checkDeviceCompatibility(device) {
        // 既知のアクセシビリティデバイスのベンダーID
        const knownDevices = {
            0x1234: 'Switch Adapter',
            0x5678: 'Eye Tracker',
            0x9ABC: 'Head Tracker'
        };
        
        if (knownDevices[device.vendorId]) {
            this.externalDevices.set(knownDevices[device.vendorId], device);
            console.log(`External device detected: ${knownDevices[device.vendorId]}`);
        }
    }
    
    /**
     * HIDデバイス互換性確認
     */
    checkHIDDeviceCompatibility(device) {
        // HIDデバイスの処理
        console.log('HID device detected:', device.productName);
    }
    
    /**
     * フィードバック要素の作成
     */
    createFeedbackElements() {
        // スキャンハイライト
        this.scanHighlight = document.createElement('div');
        this.scanHighlight.className = 'alternative-input-highlight';
        this.scanHighlight.style.cssText = `
            position: fixed;
            border: 3px solid #00ff00;
            background: rgba(0, 255, 0, 0.1);
            pointer-events: none;
            z-index: 10001;
            transition: all 0.2s ease;
            opacity: 0;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        `;
        document.body.appendChild(this.scanHighlight);
        
        // 視線ポインター
        this.gazePointer = document.createElement('div');
        this.gazePointer.className = 'gaze-pointer';
        this.gazePointer.style.cssText = `
            position: fixed;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,0,0,0.8) 0%, transparent 70%);
            pointer-events: none;
            z-index: 10002;
            opacity: 0;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(this.gazePointer);
        
        // 音声フィードバック表示
        this.createVoiceFeedbackDisplay();
        
        // アクションインジケーター
        this.createActionIndicator();
    }
    
    /**
     * 音声フィードバック表示の作成
     */
    createVoiceFeedbackDisplay() {
        const voiceDisplay = document.createElement('div');
        voiceDisplay.id = 'voice-feedback-display';
        voiceDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 16px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10003;
        `;
        document.body.appendChild(voiceDisplay);
        this.feedbackElements.set('voiceDisplay', voiceDisplay);
    }
    
    /**
     * アクションインジケーターの作成
     */
    createActionIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'action-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 30px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: bold;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10003;
        `;
        document.body.appendChild(indicator);
        this.feedbackElements.set('actionIndicator', indicator);
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // スイッチ入力
        this.setupSwitchInputListeners();
        
        // キーボード（単一キー操作）
        this.setupSingleKeyListeners();
        
        // ゲームイベント
        this.setupGameEventListeners();
        
        // ウィンドウイベント
        window.addEventListener('resize', () => {
            this.updateElementPositions();
        });
        
        // フォーカス管理
        document.addEventListener('focusin', (event) => {
            this.handleFocusChange(event.target);
        });
    }
    
    /**
     * スイッチ入力リスナーの設定
     */
    setupSwitchInputListeners() {
        // キーボードベースのスイッチ入力
        document.addEventListener('keydown', (event) => {
            if (!this.config.switchInput.enabled) return;
            
            const switchAction = this.config.switchInput.switchMapping.get(event.key);
            if (switchAction) {
                event.preventDefault();
                this.handleSwitchPress(switchAction, event);
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (!this.config.switchInput.enabled) return;
            
            const switchAction = this.config.switchInput.switchMapping.get(event.key);
            if (switchAction) {
                event.preventDefault();
                this.handleSwitchRelease(switchAction, event);
            }
        });
    }
    
    /**
     * 単一キーリスナーの設定
     */
    setupSingleKeyListeners() {
        document.addEventListener('keydown', (event) => {
            if (!this.config.singleKey.enabled) return;
            if (event.key !== this.config.singleKey.key) return;
            
            event.preventDefault();
            this.handleSingleKeyPress();
        });
    }
    
    /**
     * ゲームイベントリスナーの設定
     */
    setupGameEventListeners() {
        if (!this.gameEngine) return;
        
        // ゲーム要素の動的追加
        this.gameEngine.addEventListener?.('elementAdded', (event) => {
            if (event.element && this.isInteractive(event.element)) {
                this.addInteractiveElement(event.element);
            }
        });
        
        // ゲーム要素の削除
        this.gameEngine.addEventListener?.('elementRemoved', (event) => {
            if (event.element) {
                this.removeInteractiveElement(event.element);
            }
        });
        
        // シーン変更
        this.gameEngine.addEventListener?.('sceneChanged', () => {
            this.collectInteractiveElements();
        });
    }
    
    /**
     * インタラクティブ要素の収集
     */
    collectInteractiveElements() {
        this.interactiveElements.clear();
        this.focusableElements = [];
        
        // フォーカス可能な要素
        const focusableSelectors = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([aria-disabled="true"])',
            '.bubble',
            '.interactive',
            '.clickable'
        ];
        
        const elements = document.querySelectorAll(focusableSelectors.join(', '));
        
        elements.forEach((element, index) => {
            if (this.isVisible(element)) {
                this.interactiveElements.set(element, {
                    index,
                    type: this.getElementType(element),
                    bounds: element.getBoundingClientRect(),
                    action: this.getElementAction(element)
                });
                this.focusableElements.push(element);
            }
        });
        
        // スキャニンググループの作成
        if (this.config.scanning.enabled) {
            this.createScanningGroups();
        }
        
        console.log(`Collected ${this.interactiveElements.size} interactive elements`);
    }
    
    /**
     * 要素の可視性チェック
     */
    isVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return rect.width > 0 && 
               rect.height > 0 && 
               style.opacity !== '0' && 
               style.visibility !== 'hidden' &&
               style.display !== 'none';
    }
    
    /**
     * インタラクティブ判定
     */
    isInteractive(element) {
        const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
        const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'switch'];
        
        return interactiveTags.includes(element.tagName.toLowerCase()) ||
               interactiveRoles.includes(element.getAttribute('role')) ||
               element.classList.contains('interactive') ||
               element.classList.contains('clickable') ||
               element.hasAttribute('onclick') ||
               element.hasAttribute('tabindex');
    }
    
    /**
     * 要素タイプの取得
     */
    getElementType(element) {
        if (element.classList.contains('bubble')) return 'bubble';
        if (element.tagName.toLowerCase() === 'button') return 'button';
        if (element.tagName.toLowerCase() === 'a') return 'link';
        if (element.tagName.toLowerCase() === 'input') return 'input';
        return 'generic';
    }
    
    /**
     * 要素アクションの取得
     */
    getElementAction(element) {
        if (element.classList.contains('bubble')) return 'pop';
        if (element.tagName.toLowerCase() === 'button') return 'click';
        if (element.tagName.toLowerCase() === 'a') return 'navigate';
        return 'activate';
    }
    
    /**
     * スキャニンググループの作成
     */
    createScanningGroups() {
        this.scanningGroups = [];
        
        if (this.config.scanning.scanPattern === 'group') {
            // 画面を領域に分割してグループ化
            const groups = this.divideIntoGroups(this.focusableElements);
            this.scanningGroups = groups;
        } else {
            // 線形スキャン用の単一グループ
            this.scanningGroups = [this.focusableElements];
        }
    }
    
    /**
     * 要素のグループ分割
     */
    divideIntoGroups(elements) {
        // 簡単な実装：画面を4分割
        const groups = [[], [], [], []];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            
            let groupIndex = 0;
            if (elementCenterX > centerX) groupIndex += 1;
            if (elementCenterY > centerY) groupIndex += 2;
            
            groups[groupIndex].push(element);
        });
        
        return groups.filter(group => group.length > 0);
    }
    
    /**
     * インタラクティブ要素の追加
     */
    addInteractiveElement(element) {
        if (!this.isVisible(element)) return;
        
        const index = this.interactiveElements.size;
        this.interactiveElements.set(element, {
            index,
            type: this.getElementType(element),
            bounds: element.getBoundingClientRect(),
            action: this.getElementAction(element)
        });
        this.focusableElements.push(element);
        
        // スキャニンググループの更新
        if (this.config.scanning.enabled) {
            this.createScanningGroups();
        }
    }
    
    /**
     * インタラクティブ要素の削除
     */
    removeInteractiveElement(element) {
        this.interactiveElements.delete(element);
        const index = this.focusableElements.indexOf(element);
        if (index > -1) {
            this.focusableElements.splice(index, 1);
        }
        
        // スキャニンググループの更新
        if (this.config.scanning.enabled) {
            this.createScanningGroups();
        }
    }
    
    /**
     * 要素位置の更新
     */
    updateElementPositions() {
        for (const [element, data] of this.interactiveElements) {
            data.bounds = element.getBoundingClientRect();
        }
    }
    
    // スイッチ入力処理
    
    /**
     * スイッチ押下処理
     */
    handleSwitchPress(action, event) {
        const state = this.inputState.switch;
        state.isPressed = true;
        state.lastPressTime = Date.now();
        
        switch (action) {
            case 'primary':
                this.handlePrimarySwitchAction();
                break;
            case 'secondary':
                this.handleSecondarySwitchAction();
                break;
            case 'cancel':
                this.handleCancelAction();
                break;
        }
        
        // 統計更新
        this.updateInputStats('switch', action);
    }
    
    /**
     * スイッチ解放処理
     */
    handleSwitchRelease(action, event) {
        const state = this.inputState.switch;
        state.isPressed = false;
        
        const pressDuration = Date.now() - state.lastPressTime;
        
        // 長押し判定
        if (pressDuration > 1000) {
            this.handleLongPress(action);
        }
    }
    
    /**
     * プライマリスイッチアクション
     */
    handlePrimarySwitchAction() {
        if (this.config.scanning.enabled) {
            if (this.inputState.scanning.isScanning) {
                // 現在の要素を選択
                this.selectCurrentElement();
            } else {
                // スキャン開始
                this.startScanning();
            }
        } else {
            // 現在フォーカスされている要素をアクティブ化
            this.activateCurrentElement();
        }
    }
    
    /**
     * セカンダリスイッチアクション
     */
    handleSecondarySwitchAction() {
        if (this.config.scanning.enabled) {
            // スキャン方向の反転
            this.reverseScanDirection();
        } else {
            // 次の要素へ移動
            this.focusNextElement();
        }
    }
    
    /**
     * キャンセルアクション
     */
    handleCancelAction() {
        if (this.inputState.scanning.isScanning) {
            this.stopScanning();
        }
        
        // フィードバックのクリア
        this.clearAllFeedback();
    }
    
    /**
     * 長押し処理
     */
    handleLongPress(action) {
        // 設定メニューの表示など
        this.showQuickSettings();
    }
    
    // スキャニング機能
    
    /**
     * スキャン開始
     */
    startScanning() {
        if (this.inputState.scanning.isScanning) return;
        
        this.inputState.scanning.isScanning = true;
        this.inputState.scanning.currentElement = null;
        this.currentFocusIndex = -1;
        
        console.log('Scanning started');
        
        // 自動スキャンの開始
        if (this.config.scanning.autoStart) {
            this.performScan();
        }
    }
    
    /**
     * スキャン停止
     */
    stopScanning() {
        if (this.inputState.scanning.scanTimer) {
            clearTimeout(this.inputState.scanning.scanTimer);
            this.inputState.scanning.scanTimer = null;
        }
        
        this.inputState.scanning.isScanning = false;
        this.clearScanHighlight();
        
        console.log('Scanning stopped');
    }
    
    /**
     * スキャン実行
     */
    performScan() {
        if (!this.inputState.scanning.isScanning) return;
        
        // 次の要素へ移動
        this.currentFocusIndex++;
        if (this.currentFocusIndex >= this.focusableElements.length) {
            this.currentFocusIndex = 0;
        }
        
        const element = this.focusableElements[this.currentFocusIndex];
        if (element) {
            this.highlightElement(element);
            this.inputState.scanning.currentElement = element;
            
            // 音声フィードバック
            if (this.config.scanning.audioFeedback) {
                this.provideScanAudioFeedback(element);
            }
        }
        
        // 次のスキャン
        this.inputState.scanning.scanTimer = setTimeout(() => {
            this.performScan();
        }, this.config.switchInput.scanSpeed);
    }
    
    /**
     * スキャン方向の反転
     */
    reverseScanDirection() {
        this.inputState.switch.scanDirection *= -1;
        console.log('Scan direction reversed');
    }
    
    /**
     * 現在の要素を選択
     */
    selectCurrentElement() {
        const element = this.inputState.scanning.currentElement;
        if (!element) return;
        
        this.stopScanning();
        this.activateElement(element);
        
        // 選択後の処理
        setTimeout(() => {
            if (this.config.scanning.autoStart) {
                this.startScanning();
            }
        }, 1000);
    }
    
    /**
     * 要素のハイライト
     */
    highlightElement(element) {
        const rect = element.getBoundingClientRect();
        
        this.scanHighlight.style.left = `${rect.left - 5}px`;
        this.scanHighlight.style.top = `${rect.top - 5}px`;
        this.scanHighlight.style.width = `${rect.width + 10}px`;
        this.scanHighlight.style.height = `${rect.height + 10}px`;
        this.scanHighlight.style.opacity = '1';
        
        // ハイライトカラーの設定
        const highlightColor = this.config.scanning.highlightColor;
        this.scanHighlight.style.borderColor = highlightColor;
        this.scanHighlight.style.backgroundColor = `${highlightColor}20`;
    }
    
    /**
     * スキャンハイライトのクリア
     */
    clearScanHighlight() {
        this.scanHighlight.style.opacity = '0';
    }
    
    /**
     * スキャン音声フィードバック
     */
    provideScanAudioFeedback(element) {
        // 要素タイプに基づく音声フィードバック
        if (this.gameEngine?.audioManager) {
            const soundMap = {
                'button': 'scan_button',
                'bubble': 'scan_bubble',
                'link': 'scan_link',
                'generic': 'scan_element'
            };
            
            const elementData = this.interactiveElements.get(element);
            const soundId = soundMap[elementData?.type] || 'scan_element';
            
            this.gameEngine.audioManager.playSound(soundId, { volume: 0.3 });
        }
    }
    
    // 音声制御
    
    /**
     * 音声制御の初期化
     */
    initializeVoiceControl() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        this.inputState.voiceControl.recognition = new SpeechRecognition();
        const recognition = this.inputState.voiceControl.recognition;
        
        recognition.lang = this.config.voiceControl.language;
        recognition.continuous = this.config.voiceControl.continuousListening;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;
        
        recognition.onresult = (event) => {
            this.handleVoiceResult(event);
        };
        
        recognition.onerror = (event) => {
            this.handleVoiceError(event);
        };
        
        recognition.onend = () => {
            this.inputState.voiceControl.isListening = false;
            if (this.config.voiceControl.continuousListening && this.config.voiceControl.enabled) {
                this.startVoiceListening();
            }
        };
        
        console.log('Voice control initialized');
    }
    
    /**
     * 音声認識開始
     */
    startVoiceListening() {
        if (!this.config.voiceControl.enabled) return;
        if (!this.inputState.voiceControl.recognition) return;
        if (this.inputState.voiceControl.isListening) return;
        
        try {
            this.inputState.voiceControl.recognition.start();
            this.inputState.voiceControl.isListening = true;
            this.showVoiceFeedback('リスニング中...');
            console.log('Voice listening started');
        } catch (error) {
            console.warn('Failed to start voice recognition:', error);
        }
    }
    
    /**
     * 音声認識停止
     */
    stopVoiceListening() {
        if (!this.inputState.voiceControl.recognition) return;
        if (!this.inputState.voiceControl.isListening) return;
        
        try {
            this.inputState.voiceControl.recognition.stop();
            this.inputState.voiceControl.isListening = false;
            this.hideVoiceFeedback();
            console.log('Voice listening stopped');
        } catch (error) {
            console.warn('Failed to stop voice recognition:', error);
        }
    }
    
    /**
     * 音声認識結果の処理
     */
    handleVoiceResult(event) {
        const results = event.results[event.results.length - 1];
        const transcript = results[0].transcript.trim();
        const confidence = results[0].confidence;
        
        console.log(`Voice command: "${transcript}" (confidence: ${confidence})`);
        
        if (confidence < this.config.voiceControl.confidence) {
            this.showVoiceFeedback('認識信頼度が低いです');
            return;
        }
        
        // コマンドの実行
        const command = this.findMatchingCommand(transcript);
        if (command) {
            this.executeVoiceCommand(command, transcript);
            this.showVoiceFeedback(`コマンド: ${transcript}`);
        } else {
            this.showVoiceFeedback('コマンドが認識されませんでした');
        }
        
        // 統計更新
        this.updateInputStats('voice', command || 'unknown');
    }
    
    /**
     * 音声エラーの処理
     */
    handleVoiceError(event) {
        console.warn('Voice recognition error:', event.error);
        
        const errorMessages = {
            'no-speech': '音声が検出されませんでした',
            'audio-capture': 'マイクにアクセスできません',
            'not-allowed': 'マイクの使用が許可されていません',
            'network': 'ネットワークエラー'
        };
        
        const message = errorMessages[event.error] || 'エラーが発生しました';
        this.showVoiceFeedback(message);
    }
    
    /**
     * マッチするコマンドの検索
     */
    findMatchingCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // 完全一致
        for (const [phrase, command] of this.config.voiceControl.commands) {
            if (lowerTranscript === phrase.toLowerCase()) {
                return command;
            }
        }
        
        // 部分一致
        for (const [phrase, command] of this.config.voiceControl.commands) {
            if (lowerTranscript.includes(phrase.toLowerCase())) {
                return command;
            }
        }
        
        return null;
    }
    
    /**
     * 音声コマンドの実行
     */
    executeVoiceCommand(command, transcript) {
        this.inputState.voiceControl.lastCommand = command;
        
        switch (command) {
            case 'click':
            case 'pop':
            case 'select':
                this.activateNearestElement();
                break;
            case 'back':
                this.navigateBack();
                break;
            case 'next':
                this.focusNextElement();
                break;
            case 'menu':
                this.openMenu();
                break;
            case 'pause':
                this.pauseGame();
                break;
            case 'resume':
                this.resumeGame();
                break;
            case 'up':
            case 'down':
            case 'left':
            case 'right':
                this.navigateDirection(command);
                break;
            default:
                // カスタムコマンド
                this.executeCustomCommand(command, transcript);
        }
    }
    
    /**
     * 音声フィードバックの表示
     */
    showVoiceFeedback(message) {
        const display = this.feedbackElements.get('voiceDisplay');
        if (!display) return;
        
        display.textContent = message;
        display.style.opacity = '1';
        
        // 自動非表示
        clearTimeout(this.voiceFeedbackTimer);
        this.voiceFeedbackTimer = setTimeout(() => {
            this.hideVoiceFeedback();
        }, 3000);
    }
    
    /**
     * 音声フィードバックの非表示
     */
    hideVoiceFeedback() {
        const display = this.feedbackElements.get('voiceDisplay');
        if (display) {
            display.style.opacity = '0';
        }
    }
    
    // 視線追跡
    
    /**
     * 視線追跡の開始
     */
    async startEyeTracking() {
        if (!this.config.eyeTracking.enabled) return;
        
        try {
            // カメラアクセス
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            
            // 視線追跡ライブラリの初期化（実装依存）
            // この例では仮想的な実装
            await this.initializeEyeTracker(stream);
            
            this.inputState.eyeTracking.isCalibrated = false;
            this.startEyeCalibration();
            
        } catch (error) {
            console.error('Failed to start eye tracking:', error);
            this.config.eyeTracking.enabled = false;
        }
    }
    
    /**
     * 視線追跡器の初期化（仮想実装）
     */
    async initializeEyeTracker(stream) {
        // 実際の実装では WebGazer.js などのライブラリを使用
        console.log('Eye tracker initialized (mock)');
        
        // 視線データのシミュレーション
        this.simulateGazeData();
    }
    
    /**
     * 視線データのシミュレーション
     */
    simulateGazeData() {
        // 開発用の仮想視線データ
        setInterval(() => {
            if (!this.config.eyeTracking.enabled) return;
            if (!this.inputState.eyeTracking.isCalibrated) return;
            
            // マウス位置を視線位置として使用（開発用）
            const mouseEvent = window.lastMouseEvent;
            if (mouseEvent) {
                this.handleGazeUpdate({
                    x: mouseEvent.clientX,
                    y: mouseEvent.clientY,
                    timestamp: Date.now()
                });
            }
        }, 50);
    }
    
    /**
     * 視線キャリブレーション開始
     */
    startEyeCalibration() {
        console.log('Starting eye calibration...');
        
        // キャリブレーションUI表示
        this.showCalibrationUI();
        
        // キャリブレーション完了後
        setTimeout(() => {
            this.inputState.eyeTracking.isCalibrated = true;
            this.hideCalibrationUI();
            console.log('Eye calibration completed');
        }, this.config.eyeTracking.calibrationPoints * 1000);
    }
    
    /**
     * 視線データの更新処理
     */
    handleGazeUpdate(gazeData) {
        const state = this.inputState.eyeTracking;
        
        // 視線履歴の更新
        state.gazeHistory.push(gazeData);
        if (state.gazeHistory.length > 10) {
            state.gazeHistory.shift();
        }
        
        // スムージング適用
        const smoothedGaze = this.smoothGazeData(gazeData);
        state.currentGaze = smoothedGaze;
        
        // 視線ポインターの更新
        this.updateGazePointer(smoothedGaze);
        
        // 滞留検出
        this.checkDwellActivation(smoothedGaze);
    }
    
    /**
     * 視線データのスムージング
     */
    smoothGazeData(currentGaze) {
        const history = this.inputState.eyeTracking.gazeHistory;
        if (history.length < 3) return currentGaze;
        
        const factor = this.config.eyeTracking.smoothingFactor;
        const avgX = history.reduce((sum, g) => sum + g.x, 0) / history.length;
        const avgY = history.reduce((sum, g) => sum + g.y, 0) / history.length;
        
        return {
            x: currentGaze.x * (1 - factor) + avgX * factor,
            y: currentGaze.y * (1 - factor) + avgY * factor
        };
    }
    
    /**
     * 視線ポインターの更新
     */
    updateGazePointer(gaze) {
        if (!this.gazePointer) return;
        
        this.gazePointer.style.left = `${gaze.x}px`;
        this.gazePointer.style.top = `${gaze.y}px`;
        this.gazePointer.style.opacity = '0.6';
    }
    
    /**
     * 滞留アクティベーションのチェック
     */
    checkDwellActivation(gaze) {
        const tolerance = this.config.eyeTracking.gazeTolerance;
        
        // 視線下の要素を取得
        const element = document.elementFromPoint(gaze.x, gaze.y);
        if (!element || !this.interactiveElements.has(element)) {
            this.clearDwellTimer();
            return;
        }
        
        const state = this.inputState.eyeTracking;
        
        // 新しい要素の場合
        if (state.dwellTarget !== element) {
            this.clearDwellTimer();
            state.dwellTarget = element;
            state.dwellStartTime = Date.now();
            
            // 滞留タイマー開始
            state.dwellTimer = setTimeout(() => {
                this.activateElement(element);
                this.clearDwellTimer();
            }, this.config.eyeTracking.dwellTime);
            
            // 視覚フィードバック
            this.showDwellProgress(element);
        }
    }
    
    /**
     * 滞留タイマーのクリア
     */
    clearDwellTimer() {
        const state = this.inputState.eyeTracking;
        
        if (state.dwellTimer) {
            clearTimeout(state.dwellTimer);
            state.dwellTimer = null;
        }
        
        state.dwellTarget = null;
        this.hideDwellProgress();
    }
    
    /**
     * 滞留進捗の表示
     */
    showDwellProgress(element) {
        // プログレスインジケーターの表示
        const rect = element.getBoundingClientRect();
        
        // 既存のハイライトを使用
        this.highlightElement(element);
        
        // プログレスアニメーション
        this.scanHighlight.style.transition = `all ${this.config.eyeTracking.dwellTime}ms linear`;
        this.scanHighlight.style.transform = 'scale(0.9)';
    }
    
    /**
     * 滞留進捗の非表示
     */
    hideDwellProgress() {
        this.scanHighlight.style.transition = 'all 0.2s ease';
        this.scanHighlight.style.transform = 'scale(1)';
        this.clearScanHighlight();
    }
    
    // 単一キー操作
    
    /**
     * 単一キー押下処理
     */
    handleSingleKeyPress() {
        const state = this.inputState.singleKey;
        const currentTime = Date.now();
        
        // ダブルクリック検出
        if (currentTime - state.lastKeyTime < 300) {
            this.handleDoubleKeyPress();
            return;
        }
        
        state.lastKeyTime = currentTime;
        
        // アクションサイクル
        const actions = this.config.singleKey.actionCycle;
        const currentAction = actions[state.currentAction];
        
        this.executeAction(currentAction);
        
        // 次のアクションへ
        state.currentAction = (state.currentAction + 1) % actions.length;
        
        // ビジュアルインジケーター更新
        if (this.config.singleKey.visualIndicator) {
            this.updateActionIndicator(actions[state.currentAction]);
        }
        
        // 自動サイクルタイマー
        this.resetCycleTimer();
    }
    
    /**
     * ダブルキー押下処理
     */
    handleDoubleKeyPress() {
        // 現在の選択を確定
        this.activateCurrentElement();
        
        // サイクルリセット
        this.inputState.singleKey.currentAction = 0;
        this.resetCycleTimer();
    }
    
    /**
     * サイクルタイマーのリセット
     */
    resetCycleTimer() {
        const state = this.inputState.singleKey;
        
        if (state.cycleTimer) {
            clearTimeout(state.cycleTimer);
        }
        
        state.cycleTimer = setTimeout(() => {
            state.currentAction = 0;
            this.updateActionIndicator(this.config.singleKey.actionCycle[0]);
        }, this.config.singleKey.cycleTime);
    }
    
    /**
     * アクションインジケーターの更新
     */
    updateActionIndicator(nextAction) {
        const indicator = this.feedbackElements.get('actionIndicator');
        if (!indicator) return;
        
        const actionLabels = {
            'move': '移動',
            'select': '選択',
            'cancel': 'キャンセル'
        };
        
        indicator.textContent = `次: ${actionLabels[nextAction] || nextAction}`;
        indicator.style.opacity = '1';
        
        // フェードアウト
        setTimeout(() => {
            indicator.style.opacity = '0.6';
        }, 500);
    }
    
    // 共通アクション
    
    /**
     * アクションの実行
     */
    executeAction(action) {
        switch (action) {
            case 'move':
                this.focusNextElement();
                break;
            case 'select':
            case 'activate':
                this.activateCurrentElement();
                break;
            case 'cancel':
                this.handleCancelAction();
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }
    
    /**
     * 現在の要素をアクティブ化
     */
    activateCurrentElement() {
        const element = this.focusableElements[this.currentFocusIndex];
        if (element) {
            this.activateElement(element);
        }
    }
    
    /**
     * 要素のアクティブ化
     */
    activateElement(element) {
        console.log('Activating element:', element);
        
        const elementData = this.interactiveElements.get(element);
        if (!elementData) return;
        
        // アクション実行
        switch (elementData.type) {
            case 'bubble':
                this.popBubble(element);
                break;
            case 'button':
                element.click();
                break;
            case 'link':
                if (element.href) {
                    window.location.href = element.href;
                }
                break;
            case 'input':
                element.focus();
                break;
            default:
                // 汎用的なクリックイベント
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                element.dispatchEvent(clickEvent);
        }
        
        // フィードバック
        this.provideActivationFeedback(element);
        
        // 統計更新
        this.stats.successfulActivations++;
    }
    
    /**
     * バブルをポップ
     */
    popBubble(bubbleElement) {
        if (this.gameEngine?.bubbleManager) {
            // BubbleManager 経由でポップ
            const bubble = this.gameEngine.bubbleManager.getBubbleByElement(bubbleElement);
            if (bubble) {
                bubble.pop();
            }
        } else {
            // 直接クリックイベント
            bubbleElement.click();
        }
    }
    
    /**
     * 次の要素へフォーカス
     */
    focusNextElement() {
        if (this.focusableElements.length === 0) return;
        
        this.currentFocusIndex++;
        if (this.currentFocusIndex >= this.focusableElements.length) {
            this.currentFocusIndex = 0;
        }
        
        const element = this.focusableElements[this.currentFocusIndex];
        if (element) {
            element.focus();
            this.highlightElement(element);
        }
    }
    
    /**
     * 最も近い要素をアクティブ化
     */
    activateNearestElement() {
        // 画面中央に最も近い要素を検索
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        let nearestElement = null;
        let minDistance = Infinity;
        
        for (const [element, data] of this.interactiveElements) {
            const rect = data.bounds;
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(elementCenterX - centerX, 2) +
                Math.pow(elementCenterY - centerY, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestElement = element;
            }
        }
        
        if (nearestElement) {
            this.activateElement(nearestElement);
        }
    }
    
    /**
     * 方向ナビゲーション
     */
    navigateDirection(direction) {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (!currentElement) return;
        
        const currentRect = currentElement.getBoundingClientRect();
        const candidates = [];
        
        // 方向に基づいて候補を絞り込み
        for (const [element, data] of this.interactiveElements) {
            if (element === currentElement) continue;
            
            const rect = data.bounds;
            let isCandidate = false;
            
            switch (direction) {
                case 'up':
                    isCandidate = rect.bottom < currentRect.top;
                    break;
                case 'down':
                    isCandidate = rect.top > currentRect.bottom;
                    break;
                case 'left':
                    isCandidate = rect.right < currentRect.left;
                    break;
                case 'right':
                    isCandidate = rect.left > currentRect.right;
                    break;
            }
            
            if (isCandidate) {
                candidates.push({ element, rect });
            }
        }
        
        // 最も近い候補を選択
        if (candidates.length > 0) {
            const nearest = this.findNearestCandidate(currentRect, candidates);
            if (nearest) {
                const index = this.focusableElements.indexOf(nearest.element);
                if (index !== -1) {
                    this.currentFocusIndex = index;
                    nearest.element.focus();
                    this.highlightElement(nearest.element);
                }
            }
        }
    }
    
    /**
     * 最も近い候補要素を検索
     */
    findNearestCandidate(currentRect, candidates) {
        const currentCenterX = currentRect.left + currentRect.width / 2;
        const currentCenterY = currentRect.top + currentRect.height / 2;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const candidate of candidates) {
            const rect = candidate.rect;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(centerX - currentCenterX, 2) +
                Math.pow(centerY - currentCenterY, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = candidate;
            }
        }
        
        return nearest;
    }
    
    /**
     * アクティベーションフィードバック
     */
    provideActivationFeedback(element) {
        // 視覚フィードバック
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
        
        // 音声フィードバック
        if (this.userPreferences.generalSettings.audioFeedback) {
            this.playFeedbackSound('activate');
        }
        
        // 触覚フィードバック
        if (this.userPreferences.generalSettings.hapticFeedback) {
            this.triggerHapticFeedback('activate');
        }
    }
    
    /**
     * フィードバック音の再生
     */
    playFeedbackSound(type) {
        if (this.gameEngine?.audioManager) {
            const soundMap = {
                'activate': 'ui_activate',
                'focus': 'ui_focus',
                'error': 'ui_error'
            };
            
            this.gameEngine.audioManager.playSound(soundMap[type] || 'ui_click', {
                volume: 0.5
            });
        }
    }
    
    /**
     * 触覚フィードバックのトリガー
     */
    triggerHapticFeedback(type) {
        if (this.motorAccessibilityManager?.vibrationManager) {
            this.motorAccessibilityManager.vibrationManager.triggerVibration(type);
        }
    }
    
    /**
     * フォーカス変更の処理
     */
    handleFocusChange(element) {
        if (!this.interactiveElements.has(element)) return;
        
        const index = this.focusableElements.indexOf(element);
        if (index !== -1) {
            this.currentFocusIndex = index;
        }
    }
    
    // ゲーム固有の機能
    
    /**
     * 戻るナビゲーション
     */
    navigateBack() {
        if (this.gameEngine?.sceneManager) {
            this.gameEngine.sceneManager.previousScene();
        } else {
            history.back();
        }
    }
    
    /**
     * メニューを開く
     */
    openMenu() {
        if (this.gameEngine?.uiManager) {
            this.gameEngine.uiManager.toggleMenu();
        }
    }
    
    /**
     * ゲームを一時停止
     */
    pauseGame() {
        if (this.gameEngine) {
            this.gameEngine.pause();
        }
    }
    
    /**
     * ゲームを再開
     */
    resumeGame() {
        if (this.gameEngine) {
            this.gameEngine.resume();
        }
    }
    
    /**
     * カスタムコマンドの実行
     */
    executeCustomCommand(command, transcript) {
        // カスタムコマンドハンドラー
        console.log(`Custom command: ${command} (${transcript})`);
    }
    
    // UI 機能
    
    /**
     * キャリブレーションUIの表示
     */
    showCalibrationUI() {
        // キャリブレーションUI実装
        console.log('Showing calibration UI');
    }
    
    /**
     * キャリブレーションUIの非表示
     */
    hideCalibrationUI() {
        // キャリブレーションUI非表示
        console.log('Hiding calibration UI');
    }
    
    /**
     * クイック設定の表示
     */
    showQuickSettings() {
        // クイック設定メニュー
        console.log('Showing quick settings');
    }
    
    /**
     * すべてのフィードバックをクリア
     */
    clearAllFeedback() {
        this.clearScanHighlight();
        this.hideVoiceFeedback();
        this.hideDwellProgress();
        
        // アクションインジケーターをクリア
        const indicator = this.feedbackElements.get('actionIndicator');
        if (indicator) {
            indicator.style.opacity = '0';
        }
    }
    
    // 統計管理
    
    /**
     * 入力統計の更新
     */
    updateInputStats(method, action) {
        this.stats.inputsProcessed++;
        
        const methodCount = this.stats.inputsByMethod.get(method) || 0;
        this.stats.inputsByMethod.set(method, methodCount + 1);
    }
    
    // パブリックAPI
    
    /**
     * 代替入力マネージャーの有効化
     */
    enable() {
        this.config.enabled = true;
        
        // 要素の収集
        this.collectInteractiveElements();
        
        console.log('Alternative input manager enabled');
    }
    
    /**
     * 代替入力マネージャーの無効化
     */
    disable() {
        this.config.enabled = false;
        
        // すべての入力方法を停止
        this.stopAllInputMethods();
        
        console.log('Alternative input manager disabled');
    }
    
    /**
     * すべての入力方法を停止
     */
    stopAllInputMethods() {
        this.stopScanning();
        this.stopVoiceListening();
        this.clearDwellTimer();
        this.clearAllFeedback();
    }
    
    /**
     * 特定の入力方法を有効化
     */
    enableInputMethod(method) {
        switch (method) {
            case 'switch':
                this.config.switchInput.enabled = true;
                break;
            case 'eyeTracking':
                this.config.eyeTracking.enabled = true;
                this.startEyeTracking();
                break;
            case 'voiceControl':
                this.config.voiceControl.enabled = true;
                this.startVoiceListening();
                break;
            case 'headTracking':
                this.config.headTracking.enabled = true;
                // 頭部追跡開始
                break;
            case 'singleKey':
                this.config.singleKey.enabled = true;
                break;
            case 'scanning':
                this.config.scanning.enabled = true;
                break;
        }
        
        this.activeMethod = method;
        this.saveUserPreferences();
        
        console.log(`Input method enabled: ${method}`);
    }
    
    /**
     * 特定の入力方法を無効化
     */
    disableInputMethod(method) {
        switch (method) {
            case 'switch':
                this.config.switchInput.enabled = false;
                this.stopScanning();
                break;
            case 'eyeTracking':
                this.config.eyeTracking.enabled = false;
                this.clearDwellTimer();
                break;
            case 'voiceControl':
                this.config.voiceControl.enabled = false;
                this.stopVoiceListening();
                break;
            case 'headTracking':
                this.config.headTracking.enabled = false;
                break;
            case 'singleKey':
                this.config.singleKey.enabled = false;
                break;
            case 'scanning':
                this.config.scanning.enabled = false;
                this.stopScanning();
                break;
        }
        
        if (this.activeMethod === method) {
            this.activeMethod = null;
        }
        
        this.saveUserPreferences();
        
        console.log(`Input method disabled: ${method}`);
    }
    
    /**
     * スイッチマッピングの設定
     */
    setSwitchMapping(key, action) {
        this.config.switchInput.switchMapping.set(key, action);
        this.saveUserPreferences();
        
        console.log(`Switch mapping set: ${key} -> ${action}`);
    }
    
    /**
     * スキャン速度の設定
     */
    setScanSpeed(speed) {
        this.config.switchInput.scanSpeed = Math.max(500, Math.min(5000, speed));
        this.userPreferences.switchSettings.scanSpeed = this.config.switchInput.scanSpeed;
        
        this.saveUserPreferences();
        
        console.log(`Scan speed set to: ${this.config.switchInput.scanSpeed}ms`);
    }
    
    /**
     * 滞留時間の設定
     */
    setDwellTime(time) {
        this.config.eyeTracking.dwellTime = Math.max(200, Math.min(3000, time));
        this.userPreferences.eyeTrackingSettings.dwellTime = this.config.eyeTracking.dwellTime;
        
        this.saveUserPreferences();
        
        console.log(`Dwell time set to: ${this.config.eyeTracking.dwellTime}ms`);
    }
    
    /**
     * カスタム音声コマンドの追加
     */
    addVoiceCommand(phrase, action) {
        this.config.voiceControl.commands.set(phrase, action);
        this.userPreferences.voiceSettings.customCommands.set(phrase, action);
        
        this.saveUserPreferences();
        
        console.log(`Voice command added: "${phrase}" -> ${action}`);
    }
    
    /**
     * 頭部追跡の反転設定
     */
    updateHeadTrackingInversion() {
        const settings = this.userPreferences.headTrackingSettings;
        
        // 反転設定の適用
        console.log(`Head tracking inversion - X: ${settings.invertX}, Y: ${settings.invertY}`);
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.motor?.alternativeInput) {
            Object.assign(this.config, config.motor.alternativeInput);
        }
        
        console.log('AlternativeInputManager configuration applied');
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
                supportedMethods: this.config.supportedMethods,
                activeMethod: this.activeMethod
            },
            statistics: {
                ...this.stats,
                sessionDuration,
                inputsPerMinute: this.stats.inputsProcessed / (sessionDuration / 60000),
                successRate: this.stats.successfulActivations / 
                           (this.stats.successfulActivations + this.stats.missedActivations),
                preferredMethod: this.getMostUsedMethod()
            },
            userPreferences: this.userPreferences,
            deviceSupport: {
                hasVibration: this.deviceAPIs.switchAdapter !== null,
                hasEyeTracking: this.deviceAPIs.eyeTracker !== null,
                hasVoiceControl: this.config.supportedMethods.voiceControl,
                connectedDevices: this.externalDevices.size
            }
        };
    }
    
    /**
     * 最も使用された入力方法の取得
     */
    getMostUsedMethod() {
        let maxCount = 0;
        let mostUsed = null;
        
        for (const [method, count] of this.stats.inputsByMethod) {
            if (count > maxCount) {
                maxCount = count;
                mostUsed = method;
            }
        }
        
        return mostUsed;
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
        
        console.log(`AlternativeInputManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AlternativeInputManager...');
        
        // 代替入力マネージャーを無効化
        this.disable();
        
        // フィードバック要素の削除
        if (this.scanHighlight && this.scanHighlight.parentNode) {
            this.scanHighlight.parentNode.removeChild(this.scanHighlight);
        }
        
        if (this.gazePointer && this.gazePointer.parentNode) {
            this.gazePointer.parentNode.removeChild(this.gazePointer);
        }
        
        for (const element of this.feedbackElements.values()) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
        
        // タイマーのクリア
        if (this.inputState.scanning.scanTimer) {
            clearTimeout(this.inputState.scanning.scanTimer);
        }
        
        if (this.inputState.singleKey.cycleTimer) {
            clearTimeout(this.inputState.singleKey.cycleTimer);
        }
        
        if (this.gamepadCheckInterval) {
            clearInterval(this.gamepadCheckInterval);
        }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.interactiveElements.clear();
        this.focusableElements = [];
        this.scanningGroups = [];
        this.feedbackElements.clear();
        this.externalDevices.clear();
        
        console.log('AlternativeInputManager destroyed');
    }
}