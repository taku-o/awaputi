/**
 * Alternative Input Manager
 * 代替入力管理 - スイッチ、視線、音声、ヘッドトラッキング入力の統合制御
 */
import { SwitchInputController } from './alternative-input-manager/SwitchInputController.js';
import { EyeTrackingController } from './alternative-input-manager/EyeTrackingController.js';
import { VoiceInputController } from './alternative-input-manager/VoiceInputController.js';
import { HeadTrackingController } from './alternative-input-manager/HeadTrackingController.js';

interface MotorAccessibilityManager {
    accessibilityManager?: {
        gameEngine?: unknown;
    };
}

interface InputConfig {
    enabled: boolean;
    inputMethods: {
        switchInput: boolean;
        eyeTracking: boolean;
        voiceControl: boolean;
        headTracking: boolean;
    };
    keyboardShortcuts?: boolean;
    singleKeyMode?: boolean;
    switchInput: {
        enabled: boolean;
        scanSpeed: number;
        scanMode: string;
        activationTime: number;
        dwellTime: number;
        numberOfSwitches: number;
        switchMapping: Map<string, string>;
    };
    eyeTracking: {
        enabled: boolean;
        calibrationPoints: number;
        dwellTime: number;
        gazeTolerance: number;
        smoothingFactor: number;
        blinkDetection: boolean;
        blinkThreshold: number;
    };
    voiceControl: {
        enabled: boolean;
        language: string;
        confidence: number;
        commands: Map<string, string>;
        continuousListening: boolean;
        pushToTalk: boolean;
    };
    headTracking: {
        enabled: boolean;
        sensitivity: number;
        deadZone: number;
        smoothing: number;
        calibrationTime: number;
        gestureRecognition: boolean;
    };
    singleKey: {
        enabled: boolean;
        key: string;
        actionCycle: string[];
        cycleTime: number;
        visualIndicator: boolean;
    };
    scanning: {
        enabled: boolean;
        scanPattern: string;
        highlightStyle: string;
        highlightColor: string;
        audioFeedback: boolean;
        autoStart: boolean;
        groupScanLevels: number;
    };
    [key: string]: unknown;
}

interface InputState {
    initialized: boolean;
    activeInputMethods: Set<string>;
    currentContext: string;
    accessibilityMode: boolean;
    assistiveDevice: string | null;
}

interface SwitchState {
    isPressed: boolean;
    lastPressTime: number;
    scanningActive: boolean;
    currentIndex: number;
    scanDirection: number;
}

interface EyeTrackingState {
    isCalibrated: boolean;
    currentGaze: { x: number; y: number };
    dwellTimer: ReturnType<typeof setTimeout> | null;
    gazeHistory: Array<{ x: number; y: number; timestamp: number }>;
    lastBlink: number;
}

interface VoiceControlState {
    isListening: boolean;
    recognition: any;
    lastCommand: string | null;
    commandQueue: string[];
}

interface HeadTrackingState {
    isCalibrated: boolean;
    neutralPosition: { x: number; y: number; z: number } | null;
    currentPosition: { x: number; y: number; z: number };
    gestureBuffer: Array<{ x: number; y: number; z: number; timestamp: number }>;
}

interface SingleKeyState {
    currentAction: number;
    cycleTimer: ReturnType<typeof setTimeout> | null;
    lastKeyTime: number;
}

interface ScanningState {
    isScanning: boolean;
    currentElement: Element | null;
    scanTimer: ReturnType<typeof setTimeout> | null;
    elementGroups: Element[][];
    currentGroup: number;
}

interface Statistics {
    inputsProcessed: number;
    inputsByMethod: Map<string, number>;
    successfulActivations: number;
    missedActivations: number;
    averageActivationTime: number;
    calibrationAttempts: number;
    sessionStart: number;
    preferredMethod: string;
    totalInputs: number;
    inputMethodUsage: Map<string, number>;
}

interface UserSettings {
    switchSettings: {
        scanSpeed: number;
        activationSound: boolean;
        visualFeedback: boolean;
    };
    eyeTrackingSettings: {
        dwellTime: number;
        showGazeCursor: boolean;
        calibrationReminder: boolean;
    };
    voiceSettings: {
        customCommands: Map<string, string>;
        voiceEngine: string;
        feedbackVoice: boolean;
    };
    headTrackingSettings: {
        invertX: boolean;
        invertY: boolean;
        gestureEnabled: boolean;
    };
    generalSettings: {
        audioFeedback: boolean;
        hapticFeedback: boolean;
        confirmActions: boolean;
    };
}

export class AlternativeInputManager {
    private motorAccessibilityManager: MotorAccessibilityManager;
    private accessibilityManager: unknown;
    private gameEngine: unknown;
    private switchController: SwitchInputController;
    private eyeTrackingController: EyeTrackingController;
    private voiceController: VoiceInputController;
    private headTrackingController: HeadTrackingController;
    private config: InputConfig;
    private state: InputState;
    private activeMethod: string | null;
    private inputState: {
        switch: SwitchState;
        eyeTracking: EyeTrackingState;
        voiceControl: VoiceControlState;
        headTracking: HeadTrackingState;
        singleKey: SingleKeyState;
        scanning: ScanningState;
    };
    private interactiveElements: Map<string, Element>;
    private focusableElements: Element[];
    private scanningGroups: Element[][];
    private currentFocusIndex: number;
    private feedbackElements: Map<string, Element>;
    private scanHighlight: Element | null;
    private gazePointer: Element | null;
    private externalDevices: Map<string, number>;
    private statistics: Statistics;
    private stats: Statistics;
    private userSettings: UserSettings;
    private gamepadCheckInterval: ReturnType<typeof setInterval> | null = null;

    constructor(motorAccessibilityManager: MotorAccessibilityManager) {
        this.motorAccessibilityManager = motorAccessibilityManager;
        this.accessibilityManager = motorAccessibilityManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;
        
        // サブコンポーネントを初期化
        this.switchController = new SwitchInputController();
        this.eyeTrackingController = new EyeTrackingController();
        this.voiceController = new VoiceInputController();
        this.headTrackingController = new HeadTrackingController();

        // 設定の初期化
        this.config = {
            enabled: true,
            activationMethod: 'dwell',
            supportedMethods: {
                switch: true,
                eyeTracking: true,
                voiceControl: true,
                headTracking: true,
                singleKey: true,
                scanning: true
            },
            inputMethods: {
                switchInput: false,
                eyeTracking: false,
                voiceControl: false,
                headTracking: false
            },
            switchInput: {
                enabled: false,
                scanSpeed: 2000,
                scanMode: 'auto',
                activationTime: 100,
                dwellTime: 1000,
                numberOfSwitches: 1,
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
                gazeTolerance: 50,
                smoothingFactor: 0.3,
                blinkDetection: true,
                blinkThreshold: 200
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
                scanPattern: 'linear',
                highlightStyle: 'border',
                highlightColor: '#00ff00',
                audioFeedback: true,
                autoStart: true,
                groupScanLevels: 2
            }
        };

        // 統合状態
        this.state = {
            initialized: false,
            activeInputMethods: new Set<string>(),
            currentContext: 'default',
            accessibilityMode: false,
            assistiveDevice: null
        };

        // 入力状態管理（従来互換性のため保持）
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
        
        // 要素管理（サブコントローラーに委譲予定）
        this.interactiveElements = new Map();
        this.focusableElements = [];
        this.scanningGroups = [];
        this.currentFocusIndex = -1;
        
        // フィードバック要素
        this.feedbackElements = new Map();
        this.scanHighlight = null;
        this.gazePointer = null;

        // 外部デバイス連携
        this.externalDevices = new Map([
            ['switchInput', 0],
            ['eyeTracking', 0],
            ['voiceControl', 0],
            ['headTracking', 0],
            ['keyboard', 0]
        ]);

        this.statistics = {
            inputsProcessed: 0,
            inputsByMethod: new Map(),
            successfulActivations: 0,
            missedActivations: 0,
            averageActivationTime: 0,
            calibrationAttempts: 0,
            sessionStart: Date.now(),
            averageResponseTime: 0,
            preferredMethod: 'switch',
            totalInputs: 0,
            inputMethodUsage: new Map()
        };
        
        this.stats = { ...this.statistics };

        this.userSettings = {
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
        
        console.log('[AlternativeInputManager] Initialized with sub-controllers');
        this.initialize();
    }
    
    /**
     * 代替入力システムを初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initialize(config: Partial<InputConfig> = {}) {
        Object.assign(this.config, config);

        if (!this.config.enabled) {
            console.log('[AlternativeInputManager] Disabled by configuration');
            return;
        }
        
        try {
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            // 各入力方法を初期化
            await Promise.all([
                this.initializeSwitchInput(config),
                this.initializeEyeTracking(config),
                this.initializeVoiceControl(config),
                this.initializeHeadTracking(config)
            ]);
            
            this.setupKeyboardShortcuts();
            this.setupAccessibilityFeatures();
            console.log('[AlternativeInputManager] All input methods initialized');
        } catch (error) {
            console.error('[AlternativeInputManager] Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * スイッチ入力を初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeSwitchInput(config: any) {
        if (!this.config.inputMethods.switchInput) return;
        
        try {
            this.switchController.initializeSwitchInput(config);
            this.state.activeInputMethods.add('switchInput');
            console.log('[AlternativeInputManager] Switch input initialized');
        } catch (error) {
            console.error('[AlternativeInputManager] Switch input initialization failed:', error);
        }
    }
    
    /**
     * 視線追跡を初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeEyeTracking(config: any) {
        if (!this.config.inputMethods.eyeTracking) return;
        
        try {
            await this.eyeTrackingController.initializeEyeTracking(config);
            this.state.activeInputMethods.add('eyeTracking');
            console.log('[AlternativeInputManager] Eye tracking initialized');
        } catch (error) {
            console.error('[AlternativeInputManager] Eye tracking initialization failed:', error);
        }
    }
    
    /**
     * 音声制御を初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeVoiceControl(config: any) {
        if (!this.config.inputMethods.voiceControl) return;
        
        try {
            await this.voiceController.initializeVoiceInput(config);
            this.state.activeInputMethods.add('voiceControl');
            console.log('[AlternativeInputManager] Voice control initialized');
        } catch (error) {
            console.error('[AlternativeInputManager] Voice control initialization failed:', error);
        }
    }
    
    /**
     * ヘッドトラッキングを初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeHeadTracking(config: any) {
        if (!this.config.inputMethods.headTracking) return;
        
        try {
            await this.headTrackingController.initializeHeadTracking(config);
            this.state.activeInputMethods.add('headTracking');
            console.log('[AlternativeInputManager] Head tracking initialized');
        } catch (error) {
            console.error('[AlternativeInputManager] Head tracking initialization failed:', error);
        }
    }
    
    /**
     * キーボードショートカットを設定
     */
    setupKeyboardShortcuts() {
        if (!this.config.keyboardShortcuts) return;
        
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcut(event);
        });
        
        console.log('[AlternativeInputManager] Keyboard shortcuts configured');
    }
    
    /**
     * キーボードショートカットを処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyboardShortcut(event: KeyboardEvent) {
        const { key, ctrlKey, altKey, shiftKey } = event;
        
        // アクセシビリティ切り替え
        if (ctrlKey && altKey && key === 'a') {
            this.toggleAccessibilityMode();
            event.preventDefault();
        }
        
        if (ctrlKey && altKey && key >= '1' && key <= '4') {
            const methodIndex = parseInt(key) - 1;
            const methods = ['switchInput', 'eyeTracking', 'voiceControl', 'headTracking'];
            
            this.toggleInputMethod(methods[methodIndex]);
            event.preventDefault();
        }
        
        if (ctrlKey && shiftKey && key === 'c') {
            this.startCalibration();
            event.preventDefault();
        }
        
        this.statistics.inputMethodUsage.set('keyboard', 
            (this.statistics.inputMethodUsage.get('keyboard') || 0) + 1);
        this.statistics.totalInputs++;
    }
    
    /**
     * アクセシビリティ機能を設定
     */
    setupAccessibilityFeatures() {
        this.setupHighContrastMode();
        this.setupScreenReaderSupport();
        this.setupKeyboardNavigation();

        console.log('[AlternativeInputManager] Accessibility features configured');
    }
    
    /**
     * 高コントラストモードを設定
     */
    setupHighContrastMode() {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');

        const handleContrastChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
                this.updateControllerContrastSettings(true);
            } else {
                document.body.classList.remove('high-contrast');
                this.updateControllerContrastSettings(false);
            }
        };

        mediaQuery.addEventListener('change', handleContrastChange);
        handleContrastChange({ matches: mediaQuery.matches } as MediaQueryListEvent);
    }
    
    /**
     * コントローラーのコントラスト設定を更新
     * @param {boolean} highContrast - 高コントラストモードかどうか
     */
    updateControllerContrastSettings(highContrast: boolean) {
        const contrastConfig = {
            highlightColor: highContrast ? '#ffffff' : '#00ff00',
            indicatorOpacity: highContrast ? 1.0 : 0.8
        };
        
        this.switchController.updateConfig({ scanning: contrastConfig });
        this.eyeTrackingController.updateConfig(contrastConfig);
    }
    
    /**
     * スクリーンリーダー対応を設定
     */
    setupScreenReaderSupport() {
        const gameElements = document.querySelectorAll('.bubble, .ui-element');
        gameElements.forEach((element, index) => {
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', `ゲーム要素 ${index + 1}`);
                element.setAttribute('role', 'button');
            }
        });
        
        this.setupFocusManagement();
    }
    
    /**
     * キーボードナビゲーションを設定
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (this.config.singleKeyMode) {
                this.handleSingleKeyNavigation(event);
            } else {
                this.handleStandardKeyNavigation(event);
            }
        });
    }
    
    /**
     * シングルキーナビゲーションを処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleSingleKeyNavigation(event: KeyboardEvent) {
        const singleKeyMap: { [key: string]: () => void } = {
            '1': () => this.focusNextElement(),
            '2': () => this.focusPreviousElement(),
            '3': () => this.activateCurrentElement(),
            '4': () => this.cancelCurrentAction(),
            '5': () => this.toggleScanning()
        };
        
        const action = singleKeyMap[event.key];
        if (action) {
            action();
            event.preventDefault();
        }
    }
    
    /**
     * 標準キーナビゲーションを処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleStandardKeyNavigation(event: KeyboardEvent) {
        switch (event.key) {
            case 'Tab':
                if (event.shiftKey) {
                    this.focusPreviousElement();
                } else {
                    this.focusNextElement();
                }
                event.preventDefault();
                break;
            case 'Enter':
            case ' ':
                this.activateCurrentElement();
                event.preventDefault();
                break;
            case 'Escape':
                this.cancelCurrentAction();
                event.preventDefault();
                break;
        }
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        console.log('[AlternativeInputManager] User preferences loaded');
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        console.log('[AlternativeInputManager] User preferences saved');
    }
    
    /**
     * ユーザー設定の適用
     */
    applyUserPreferences() {
        console.log('[AlternativeInputManager] User preferences applied');
    }
    
    /**
     * 利用可能な入力方法の検出
     */
    detectAvailableInputMethods() {
        // カメラとマイクの利用可能性をチェック
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
                console.log('[AlternativeInputManager] Camera available for eye/head tracking');
            })
            .catch(() => {
                console.log('[AlternativeInputManager] Camera not available');
                this.config.inputMethods.eyeTracking = false;
                this.config.inputMethods.headTracking = false;
            });

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                console.log('[AlternativeInputManager] Microphone available for voice control');
            })
            .catch(() => {
                console.log('[AlternativeInputManager] Microphone not available');
                this.config.inputMethods.voiceControl = false;
            });
    }
    
    /**
     * フィードバック要素の作成
     */
    createFeedbackElements() {
        console.log('[AlternativeInputManager] Feedback elements created');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        console.log('[AlternativeInputManager] Event listeners setup');
    }
    
    /**
     * インタラクティブ要素の収集
     */
    collectInteractiveElements() {
        console.log('[AlternativeInputManager] Interactive elements collected');
    }
    
    // スキャニング機能（サブコントローラーに委譲）
    startScanning() { 
        this.switchController.startScanning?.(); 
    }
    
    stopScanning() { 
        this.switchController.stopScanning?.(); 
    }
    
    selectCurrentElement() { 
        this.switchController.selectCurrentElement?.(); 
    }
    
    /**
     * アクセシビリティモードを切り替え
     */
    toggleAccessibilityMode() {
        this.state.accessibilityMode = !this.state.accessibilityMode;
        console.log(`[AlternativeInputManager] Accessibility mode: ${this.state.accessibilityMode ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 入力方法を切り替え
     * @param {string} method - 入力方法名
     */
    toggleInputMethod(method: string) {
        this.config.inputMethods[method as keyof typeof this.config.inputMethods] = 
            !this.config.inputMethods[method as keyof typeof this.config.inputMethods];
        
        if (this.config.inputMethods[method as keyof typeof this.config.inputMethods]) {
            this.state.activeInputMethods.add(method);
        } else {
            this.state.activeInputMethods.delete(method);
        }

        console.log(`[AlternativeInputManager] ${method}: ${this.config.inputMethods[method as keyof typeof this.config.inputMethods] ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * キャリブレーションを開始
     */
    async startCalibration() {
        console.log('[AlternativeInputManager] Starting calibration for all active input methods');
        
        const calibrationPromises = [];

        if (this.state.activeInputMethods.has('eyeTracking')) {
            calibrationPromises.push(this.eyeTrackingController.startCalibration());
        }

        if (this.state.activeInputMethods.has('headTracking')) {
            calibrationPromises.push(this.headTrackingController.startCalibration());
        }

        try {
            const results = await Promise.all(calibrationPromises);
            console.log('[AlternativeInputManager] Calibration completed:', results);
            
            return results;
        } catch (error) {
            console.error('[AlternativeInputManager] Calibration failed:', error);
            throw error;
        }
    }
    
    /**
     * コンテキストを設定
     * @param {string} context - コンテキスト名
     */
    setContext(context: string) {
        this.state.currentContext = context;
        
        // 各コントローラーにコンテキストを通知
        if (this.voiceController.setContext) {
            this.voiceController.setContext(context);
        }
        
        console.log(`[AlternativeInputManager] Context changed to: ${context}`);
    }
    
    // ナビゲーションメソッド（delegation to switch controller）
    focusNextElement() { 
        this.switchController.focusNextElement?.(); 
    }
    
    focusPreviousElement() { 
        this.switchController.focusPreviousElement?.(); 
    }
    
    activateCurrentElement() { 
        this.switchController.activateCurrentElement?.(); 
    }
    
    cancelCurrentAction() { 
        this.switchController.cancelCurrentAction?.(); 
    }
    
    toggleScanning() { 
        this.switchController.toggleScanning?.(); 
    }
    
    /**
     * フォーカス管理を設定
     */
    setupFocusManagement() {
        document.addEventListener('focusin', (event) => {
            this.announceElementToScreenReader(event.target as Element);
        });
    }
    
    /**
     * 要素をスクリーンリーダーに通知
     * @param {Element} element - 対象要素
     */
    announceElementToScreenReader(element: Element) {
        const announcement = this.generateElementAnnouncement(element);
        if (announcement) {
            this.createScreenReaderAnnouncement(announcement);
        }
    }
    
    /**
     * 要素の読み上げテキストを生成
     * @param {Element} element - 対象要素
     * @returns {string} 読み上げテキスト
     */
    generateElementAnnouncement(element: Element): string | null {
        if (element.classList.contains('bubble')) {
            const bubbleType = (element as HTMLElement).dataset.bubbleType || 'normal';
            return `${bubbleType}バブル、クリックして破壊`;
        } else if (element.tagName === 'BUTTON') {
            return `ボタン: ${element.textContent}`;
        } else if (element.classList.contains('ui-element')) {
            return `UI要素: ${element.textContent || 'インタラクティブ要素'}`;
        }
        return null;
    }
    
    /**
     * スクリーンリーダー用アナウンスを作成
     * @param {string} text - アナウンステキスト
     */
    createScreenReaderAnnouncement(text: string) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = text;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            ...this.statistics,
            activeInputMethods: Array.from(this.state.activeInputMethods),
            initialized: this.state.initialized,
            accessibilityMode: this.state.accessibilityMode,
            currentContext: this.state.currentContext,
            controllerStats: {
                switch: this.switchController.getStats(),
                eyeTracking: this.eyeTrackingController.getStats(),
                voice: this.voiceController.getStats(),
                headTracking: this.headTrackingController.getStats()
            }
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig: Partial<InputConfig>) {
        Object.assign(this.config, newConfig);
        
        // 各コントローラーに設定を委譲
        if (newConfig.switchInput) {
            this.switchController.updateConfig({ switchInput: newConfig.switchInput });
        }
        
        if (newConfig.eyeTracking) {
            this.eyeTrackingController.updateConfig(newConfig.eyeTracking);
        }
        
        if (newConfig.voiceControl) {
            this.voiceController.updateConfig({ voiceControl: newConfig.voiceControl });
        }
        
        if (newConfig.headTracking) {
            this.headTrackingController.updateConfig(newConfig.headTracking);
        }

        console.log('[AlternativeInputManager] Configuration updated');
    }
    
    // 従来APIとの互換性を保つためのメソッド（簡略化版）
    enable() { 
        this.config.enabled = true; 
        this.collectInteractiveElements(); 
    }
    
    disable() { 
        this.config.enabled = false; 
        this.stopAllInputMethods(); 
    }
    
    stopAllInputMethods() { 
        this.switchController.cleanup(); 
    }
    
    enableInputMethod(method: string) { 
        (this.config.inputMethods as any)[method] = true; 
    }
    
    disableInputMethod(method: string) { 
        (this.config.inputMethods as any)[method] = false; 
    }
    
    setSwitchMapping(key: string, action: string) { 
        this.config.switchInput.switchMapping.set(key, action); 
    }
    
    setScanSpeed(speed: number) { 
        this.config.switchInput.scanSpeed = Math.max(500, Math.min(5000, speed)); 
    }
    
    setDwellTime(time: number) { 
        this.config.eyeTracking.dwellTime = Math.max(200, Math.min(3000, time)); 
    }
    
    addVoiceCommand(phrase: string, action: string) { 
        this.config.voiceControl.commands.set(phrase, action); 
    }
    
    setEnabled(enabled: boolean) { 
        enabled ? this.enable() : this.disable(); 
    }
    
    applyConfig(config: any) { 
        if (config.motor?.alternativeInput) {
            Object.assign(this.config, config.motor.alternativeInput);
        }
    }
    
    generateReport() { 
        return { 
            timestamp: new Date().toISOString(), 
            configuration: this.config, 
            statistics: this.statistics 
        }; 
    }
    
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
     * クリーンアップ
     */
    cleanup() {
        // 各コントローラーをクリーンアップ
        this.switchController.cleanup();
        this.eyeTrackingController.cleanup();
        this.voiceController.cleanup();
        this.headTrackingController.cleanup();
        
        document.body.classList.remove('accessibility-mode', 'high-contrast');
        document.documentElement.style.fontSize = '';
        
        this.state.initialized = false;
        this.state.activeInputMethods.clear();

        console.log('[AlternativeInputManager] Cleaned up');
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy() {
        console.log('Destroying AlternativeInputManager...');
        
        this.disable();
        this.cleanup();
        
        // 従来の実装のクリーンアップ
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