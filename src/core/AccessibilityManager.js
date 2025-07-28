import { getErrorHandler } from '../utils/ErrorHandler.js';
import { FocusManager } from './FocusManager.js';
import { KeyboardAccessibilityManager } from './KeyboardAccessibilityManager.js';
import { VisualFocusManager } from './VisualFocusManager.js';

/**
 * アクセシビリティ管理システムの中核クラス
 * WCAG 2.1 AA準拠の包括的なアクセシビリティサポートを提供
 */
export class AccessibilityManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.managers = new Map();
        this.config = new AccessibilityConfiguration();
        this.state = new AccessibilityState();
        this.testingFramework = null;
        
        // イベントエミッター機能
        this.eventListeners = new Map();
        
        // 初期化フラグ
        this.isInitialized = false;
        this.isEnabled = true;
        
        console.log('AccessibilityManager initialized');
    }
    
    /**
     * アクセシビリティシステムの初期化
     */
    async initialize() {
        try {
            console.log('Initializing accessibility system...');
            
            // システム設定の検出
            await this.detectSystemPreferences();
            
            // プラグインアーキテクチャの設定
            this.setupPluginArchitecture();
            
            // 専用マネージャーの初期化
            await this.initializeManagers();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // テストフレームワークの初期化（開発時のみ）
            if (this.gameEngine.isDebugMode?.()) {
                await this.initializeTestingFramework();
            }
            
            this.isInitialized = true;
            console.log('Accessibility system initialized successfully');
            
            // 初期化完了イベントを発行
            this.emit('initialized', {
                config: this.config,
                detectedPreferences: this.state.systemPreferences
            });
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'initialize',
                phase: 'core_setup'
            });
            return false;
        }
    }
    
    /**
     * システム設定の自動検出
     */
    async detectSystemPreferences() {
        console.log('Detecting system accessibility preferences...');
        
        const preferences = {
            reducedMotion: false,
            highContrast: false,
            largeText: false,
            screenReader: false,
            colorScheme: 'light'
        };
        
        try {
            // Reduced Motion の検出
            if (window.matchMedia) {
                const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                preferences.reducedMotion = reducedMotionQuery.matches;
                
                // 変更を監視
                reducedMotionQuery.addEventListener('change', (e) => {
                    this.handleSystemPreferenceChange('reducedMotion', e.matches);
                });
            }
            
            // High Contrast の検出
            if (window.matchMedia) {
                const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
                preferences.highContrast = highContrastQuery.matches;
                
                highContrastQuery.addEventListener('change', (e) => {
                    this.handleSystemPreferenceChange('highContrast', e.matches);
                });
            }
            
            // Color Scheme の検出
            if (window.matchMedia) {
                const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                preferences.colorScheme = darkSchemeQuery.matches ? 'dark' : 'light';
                
                darkSchemeQuery.addEventListener('change', (e) => {
                    this.handleSystemPreferenceChange('colorScheme', e.matches ? 'dark' : 'light');
                });
            }
            
            // Screen Reader の検出（推定）
            preferences.screenReader = this.detectScreenReader();
            
            // Large Text の検出（フォントサイズ基準）
            preferences.largeText = this.detectLargeTextPreference();
            
            this.state.systemPreferences = preferences;
            
            // 検出された設定を自動適用
            await this.applySystemPreferences(preferences);
            
            console.log('System preferences detected:', preferences);
        } catch (error) {
            console.warn('Failed to detect some system preferences:', error);
        }
    }
    
    /**
     * スクリーンリーダーの検出
     */
    detectScreenReader() {
        // 複数の指標を組み合わせてスクリーンリーダーを検出
        const indicators = [
            // ユーザーエージェント文字列
            navigator.userAgent.includes('NVDA'),
            navigator.userAgent.includes('JAWS'),
            navigator.userAgent.includes('VoiceOver'),
            
            // DOM要素の存在
            !!document.querySelector('[role="application"]'),
            !!document.querySelector('[aria-live]'),
            
            // Speech Synthesis API の利用可能性
            !!window.speechSynthesis,
            
            // アクセシビリティ特化のプロパティ
            !!navigator.userAgent.match(/(screen reader|accessibility)/i)
        ];
        
        // 複数の指標が一致する場合にスクリーンリーダーと判定
        const matches = indicators.filter(Boolean).length;
        return matches >= 2;
    }
    
    /**
     * 大きなテキスト設定の検出
     */
    detectLargeTextPreference() {
        // システムフォントサイズの検出
        const testElement = document.createElement('div');
        testElement.style.cssText = 'font-size: 1rem; position: absolute; visibility: hidden;';
        document.body.appendChild(testElement);
        
        const fontSize = window.getComputedStyle(testElement).fontSize;
        const fontSizeValue = parseFloat(fontSize);
        
        document.body.removeChild(testElement);
        
        // 16px以上を大きなテキストと判定
        return fontSizeValue >= 18;
    }
    
    /**
     * システム設定変更の処理
     */
    handleSystemPreferenceChange(preference, value) {
        console.log(`System preference changed: ${preference} = ${value}`);
        
        this.state.systemPreferences[preference] = value;
        
        // 設定を自動適用
        const changes = { [preference]: value };
        this.applySystemPreferences(changes);
        
        // 変更イベントを発行
        this.emit('systemPreferenceChanged', {
            preference,
            value,
            allPreferences: this.state.systemPreferences
        });
    }
    
    /**
     * システム設定の適用
     */
    async applySystemPreferences(preferences) {
        try {
            // Reduced Motion
            if (preferences.reducedMotion !== undefined) {
                this.config.visual.motion.reduced = preferences.reducedMotion;
                this.config.visual.motion.level = preferences.reducedMotion ? 'minimal' : 'none';
            }
            
            // High Contrast
            if (preferences.highContrast !== undefined) {
                this.config.visual.highContrast.enabled = preferences.highContrast;
                this.config.visual.highContrast.level = preferences.highContrast ? 'aaa' : 'aa';
            }
            
            // Large Text
            if (preferences.largeText !== undefined) {
                this.config.visual.textScaling.enabled = preferences.largeText;
                this.config.visual.textScaling.scale = preferences.largeText ? 1.2 : 1.0;
            }
            
            // Screen Reader
            if (preferences.screenReader !== undefined) {
                this.config.screenReader.enabled = preferences.screenReader ? true : 'auto';
                this.config.screenReader.verbosity = preferences.screenReader ? 'normal' : 'minimal';
            }
            
            // Color Scheme
            if (preferences.colorScheme !== undefined) {
                this.config.visual.colorScheme = preferences.colorScheme;
            }
            
            // 設定を各マネージャーに適用
            await this.applyConfiguration(this.config);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'applySystemPreferences',
                preferences
            });
        }
    }
    
    /**
     * プラグインアーキテクチャの設定
     */
    setupPluginArchitecture() {
        console.log('Setting up plugin architecture...');
        
        // マネージャー登録のためのレジストリ
        this.managerRegistry = new Map([
            ['keyboard', null],
            ['screenReader', null],
            ['visual', null],
            ['audio', null],
            ['motor', null],
            ['cognitive', null],
            ['testing', null]
        ]);
        
        // マネージャー間の依存関係定義
        this.managerDependencies = new Map([
            ['keyboard', []],
            ['screenReader', ['keyboard']],
            ['visual', []],
            ['audio', ['visual']],
            ['motor', ['keyboard']],
            ['cognitive', ['keyboard', 'screenReader']],
            ['testing', ['keyboard', 'screenReader', 'visual', 'audio']]
        ]);
    }
    
    /**
     * マネージャーの初期化
     */
    async initializeManagers() {
        console.log('Initializing accessibility managers...');
        
        // 依存関係順にマネージャーを初期化
        const initOrder = this.resolveDependencyOrder();
        
        for (const managerType of initOrder) {
            try {
                await this.initializeManager(managerType);
            } catch (error) {
                console.warn(`Failed to initialize ${managerType} manager:`, error);
                // エラーが発生しても他のマネージャーの初期化は続行
            }
        }
    }
    
    /**
     * 依存関係順序の解決
     */
    resolveDependencyOrder() {
        const resolved = [];
        const resolving = new Set();
        
        const resolve = (managerType) => {
            if (resolved.includes(managerType)) return;
            if (resolving.has(managerType)) {
                throw new Error(`Circular dependency detected: ${managerType}`);
            }
            
            resolving.add(managerType);
            
            const dependencies = this.managerDependencies.get(managerType) || [];
            for (const dep of dependencies) {
                resolve(dep);
            }
            
            resolving.delete(managerType);
            resolved.push(managerType);
        };
        
        for (const managerType of this.managerRegistry.keys()) {
            resolve(managerType);
        }
        
        return resolved;
    }
    
    /**
     * 個別マネージャーの初期化
     */
    async initializeManager(managerType) {
        console.log(`Initializing ${managerType} manager...`);
        
        try {
            let manager = null;
            
            switch (managerType) {
                case 'keyboard':
                    // FocusManagerを先に初期化
                    const focusManager = new FocusManager(this);
                    
                    // KeyboardAccessibilityManagerを初期化（既存のKeyboardShortcutManagerを拡張）
                    const keyboardAccessibilityManager = new KeyboardAccessibilityManager(
                        this, 
                        this.gameEngine.keyboardShortcutManager
                    );
                    
                    // VisualFocusManagerを初期化
                    const visualFocusManager = new VisualFocusManager(this, focusManager);
                    
                    // 統合管理オブジェクトを作成
                    manager = {
                        focus: focusManager,
                        accessibility: keyboardAccessibilityManager,
                        visual: visualFocusManager,
                        
                        // 統一インターフェース
                        applyConfig: (config) => {
                            focusManager.applyConfig?.(config);
                            keyboardAccessibilityManager.applyConfig?.(config);
                            visualFocusManager.applyConfig?.(config);
                        },
                        
                        setEnabled: (enabled) => {
                            focusManager.setEnabled?.(enabled);
                            keyboardAccessibilityManager.setEnabled?.(enabled);
                            visualFocusManager.setEnabled?.(enabled);
                        },
                        
                        generateReport: () => ({
                            focus: focusManager.generateReport?.() || {},
                            accessibility: keyboardAccessibilityManager.generateReport?.() || {},
                            visual: visualFocusManager.generateReport?.() || {}
                        }),
                        
                        destroy: () => {
                            focusManager.destroy?.();
                            keyboardAccessibilityManager.destroy?.();
                            visualFocusManager.destroy?.();
                        }
                    };
                    break;
                    
                case 'screenReader':
                    // 後続のタスクで実装
                    console.log('ScreenReaderManager will be implemented in subsequent tasks');
                    break;
                    
                case 'visual':
                    // 後続のタスクで実装
                    console.log('VisualAccessibilityManager will be implemented in subsequent tasks');
                    break;
                    
                case 'audio':
                    // 後続のタスクで実装
                    console.log('AudioAccessibilityManager will be implemented in subsequent tasks');
                    break;
                    
                case 'motor':
                    // 後続のタスクで実装
                    console.log('MotorAccessibilityManager will be implemented in subsequent tasks');
                    break;
                    
                case 'cognitive':
                    // 後続のタスクで実装
                    console.log('CognitiveAccessibilityManager will be implemented in subsequent tasks');
                    break;
                    
                case 'testing':
                    // デバッグモードでのみ初期化
                    if (this.gameEngine.isDebugMode?.()) {
                        console.log('AccessibilityTestingFramework will be implemented in subsequent tasks');
                    }
                    break;
            }
            
            if (manager) {
                this.managers.set(managerType, manager);
                this.managerRegistry.set(managerType, manager);
                console.log(`${managerType} manager initialized successfully`);
            }
            
        } catch (error) {
            throw new Error(`Failed to initialize ${managerType} manager: ${error.message}`);
        }
    }
    
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウフォーカス変更の監視
        window.addEventListener('focus', () => {
            this.handleWindowFocus();
        });
        
        window.addEventListener('blur', () => {
            this.handleWindowBlur();
        });
        
        // ページ表示状態の監視
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // エラーイベントの監視
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });
        
        // GameEngineとの統合
        if (this.gameEngine) {
            // シーン変更の監視
            this.gameEngine.addEventListener?.('sceneChanged', (event) => {
                this.handleSceneChange(event);
            });
            
            // 設定変更の監視
            this.gameEngine.addEventListener?.('settingsChanged', (event) => {
                this.handleSettingsChange(event);
            });
        }
        
        console.log('Event listeners set up');
    }
    
    /**
     * テストフレームワークの初期化
     */
    async initializeTestingFramework() {
        try {
            console.log('Initializing accessibility testing framework...');
            // 後続のタスクで実装
            console.log('AccessibilityTestingFramework initialization deferred to subsequent tasks');
        } catch (error) {
            console.warn('Failed to initialize testing framework:', error);
        }
    }
    
    /**
     * 設定の適用
     */
    async applyConfiguration(config) {
        if (!this.isInitialized) {
            console.warn('AccessibilityManager not initialized, configuration will be applied after initialization');
            return;
        }
        
        try {
            // 各マネージャーに設定を適用
            for (const [type, manager] of this.managers) {
                if (manager && typeof manager.applyConfig === 'function') {
                    await manager.applyConfig(config);
                }
            }
            
            // 設定適用イベントを発行
            this.emit('configurationApplied', { config });
            
            console.log('Configuration applied successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'applyConfiguration',
                config
            });
        }
    }
    
    /**
     * WCAG準拠の検証
     */
    async validateCompliance() {
        if (!this.testingFramework) {
            console.warn('Testing framework not available for compliance validation');
            return { compliant: false, reason: 'Testing framework not initialized' };
        }
        
        try {
            console.log('Validating WCAG 2.1 AA compliance...');
            const results = await this.testingFramework.runFullAudit();
            
            this.state.complianceStatus = {
                wcag21AA: results.overallCompliance,
                lastCheck: new Date(),
                issues: results.issues,
                score: results.score
            };
            
            console.log('WCAG compliance validation completed:', this.state.complianceStatus);
            return results;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'validateCompliance'
            });
            return { compliant: false, error: error.message };
        }
    }
    
    /**
     * アクセシビリティレポートの生成
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            system: {
                userAgent: navigator.userAgent,
                systemPreferences: this.state.systemPreferences,
                screenSize: {
                    width: window.screen.width,
                    height: window.screen.height
                }
            },
            configuration: {
                keyboard: this.config.keyboard,
                screenReader: this.config.screenReader,
                visual: this.config.visual,
                audio: this.config.audio,
                motor: this.config.motor,
                cognitive: this.config.cognitive
            },
            managers: {},
            compliance: this.state.complianceStatus,
            statistics: this.getUsageStatistics()
        };
        
        // 各マネージャーからレポートデータを収集
        for (const [type, manager] of this.managers) {
            if (manager && typeof manager.generateReport === 'function') {
                report.managers[type] = manager.generateReport();
            }
        }
        
        return report;
    }
    
    /**
     * 使用統計の取得
     */
    getUsageStatistics() {
        return {
            initializationTime: this.state.initializationTime,
            managersCount: this.managers.size,
            eventsEmitted: this.state.eventsEmitted || 0,
            errorsHandled: this.state.errorsHandled || 0,
            configChanges: this.state.configChanges || 0
        };
    }
    
    // イベントエミッター機能
    
    /**
     * イベントリスナーの追加
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }
    
    /**
     * イベントの発行
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
        
        // 統計更新
        this.state.eventsEmitted = (this.state.eventsEmitted || 0) + 1;
    }
    
    // イベントハンドラー
    
    handleWindowFocus() {
        this.emit('windowFocused', { timestamp: Date.now() });
    }
    
    handleWindowBlur() {
        this.emit('windowBlurred', { timestamp: Date.now() });
    }
    
    handleVisibilityChange() {
        const isVisible = !document.hidden;
        this.emit('visibilityChanged', { visible: isVisible, timestamp: Date.now() });
    }
    
    handleGlobalError(event) {
        this.state.errorsHandled = (this.state.errorsHandled || 0) + 1;
        this.emit('globalError', { error: event.error, timestamp: Date.now() });
    }
    
    handleSceneChange(event) {
        this.emit('sceneChanged', event);
        
        // シーン変更時にアクセシビリティ設定を再適用
        this.applyConfiguration(this.config);
    }
    
    handleSettingsChange(event) {
        this.state.configChanges = (this.state.configChanges || 0) + 1;
        this.emit('settingsChanged', event);
    }
    
    // ユーティリティメソッド
    
    /**
     * マネージャーの取得
     */
    getManager(type) {
        return this.managers.get(type);
    }
    
    /**
     * 設定の取得
     */
    getConfiguration() {
        return this.config;
    }
    
    /**
     * 状態の取得
     */
    getState() {
        return this.state;
    }
    
    /**
     * 有効状態の切り替え
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        // 各マネージャーに状態を通知
        for (const [type, manager] of this.managers) {
            if (manager && typeof manager.setEnabled === 'function') {
                manager.setEnabled(enabled);
            }
        }
        
        this.emit('enabledChanged', { enabled });
        console.log(`AccessibilityManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // アクセシビリティ機能のクイックアクセス
    
    toggleScreenReader() {
        const enabled = !this.config.screenReader.enabled;
        this.config.screenReader.enabled = enabled;
        this.applyConfiguration(this.config);
        console.log(`Screen reader ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    adjustTextSize(delta) {
        const newScale = Math.max(0.8, Math.min(2.0, this.config.visual.textScaling.scale + delta));
        this.config.visual.textScaling.scale = newScale;
        this.config.visual.textScaling.enabled = newScale !== 1.0;
        this.applyConfiguration(this.config);
        console.log(`Text size adjusted to ${Math.round(newScale * 100)}%`);
    }
    
    toggleHighContrast() {
        const enabled = !this.config.visual.highContrast.enabled;
        this.config.visual.highContrast.enabled = enabled;
        this.applyConfiguration(this.config);
        console.log(`High contrast ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    showAccessibilityHelp() {
        const help = this.generateAccessibilityHelp();
        console.log('Accessibility Help:', help);
        this.emit('accessibilityHelpRequested', { help });
    }
    
    generateAccessibilityHelp() {
        return {
            shortcuts: [
                'Alt+Shift+S: スクリーンリーダー切り替え',
                'Ctrl+Plus: テキストサイズ拡大',
                'Ctrl+Minus: テキストサイズ縮小',
                'Ctrl+Alt+H: ハイコントラスト切り替え',
                'Alt+Shift+H: このヘルプを表示'
            ],
            features: [
                'キーボードナビゲーション対応',
                'スクリーンリーダー対応',
                'ハイコントラストモード',
                'テキストサイズ調整',
                'アニメーション軽減',
                'WCAG 2.1 AA準拠'
            ]
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AccessibilityManager...');
        
        // 各マネージャーのクリーンアップ
        for (const [type, manager] of this.managers) {
            if (manager && typeof manager.destroy === 'function') {
                try {
                    manager.destroy();
                } catch (error) {
                    console.warn(`Error destroying ${type} manager:`, error);
                }
            }
        }
        
        // イベントリスナーのクリーンアップ
        this.eventListeners.clear();
        
        // マップのクリア
        this.managers.clear();
        this.managerRegistry.clear();
        this.managerDependencies.clear();
        
        // テストフレームワークのクリーンアップ
        if (this.testingFramework && typeof this.testingFramework.destroy === 'function') {
            this.testingFramework.destroy();
        }
        
        this.isInitialized = false;
        console.log('AccessibilityManager destroyed');
    }
}

/**
 * アクセシビリティ設定クラス
 */
export class AccessibilityConfiguration {
    constructor() {
        this.keyboard = {
            enabled: true,
            navigationMode: '2d', // '1d', '2d', 'custom'
            shortcuts: new Map(),
            focusVisible: true,
            skipLinks: true,
            tabOrder: 'logical' // 'logical', 'dom', 'custom'
        };
        
        this.screenReader = {
            enabled: 'auto', // true, false, 'auto'
            verbosity: 'normal', // 'minimal', 'normal', 'verbose'
            announcements: {
                gameState: true,
                score: true,
                actions: true,
                errors: true
            },
            speechRate: 1.0,
            language: 'auto'
        };
        
        this.visual = {
            highContrast: {
                enabled: false,
                level: 'aa', // 'aa', 'aaa'
                customColors: null
            },
            textScaling: {
                enabled: false,
                scale: 1.0, // 0.8 - 2.0
                lineHeight: 1.4
            },
            colorBlindness: {
                enabled: false,
                type: 'none', // 'protanopia', 'deuteranopia', 'tritanopia'
                patterns: true,
                shapes: true
            },
            motion: {
                reduced: false,
                level: 'none' // 'none', 'reduced', 'minimal'
            },
            colorScheme: 'light' // 'light', 'dark', 'auto'
        };
        
        this.audio = {
            visualFeedback: {
                enabled: false,
                intensity: 'medium', // 'low', 'medium', 'high'
                type: 'flash' // 'flash', 'glow', 'pulse'
            },
            captions: {
                enabled: false,
                position: 'bottom', // 'top', 'bottom', 'overlay'
                size: 'medium',
                background: true
            },
            vibration: {
                enabled: false,
                intensity: 0.5, // 0.0 - 1.0
                patterns: new Map()
            }
        };
        
        this.motor = {
            oneHanded: {
                enabled: false,
                dominantHand: 'right' // 'left', 'right'
            },
            sensitivity: {
                mouse: 1.0,
                touch: 1.0,
                keyboard: 1.0
            },
            timing: {
                clickDelay: 0,
                holdDuration: 500,
                doubleClickInterval: 300
            },
            alternativeInput: {
                switches: false,
                eyeTracking: false,
                voiceControl: false
            }
        };
        
        this.cognitive = {
            simplification: {
                enabled: false,
                level: 'basic' // 'basic', 'intermediate', 'advanced'
            },
            help: {
                contextual: true,
                tooltips: true,
                tutorials: true
            },
            errorHandling: {
                recovery: true,
                suggestions: true,
                prevention: true
            }
        };
    }
}

/**
 * アクセシビリティ状態クラス
 */
export class AccessibilityState {
    constructor() {
        this.currentFocus = null;
        this.navigationHistory = [];
        this.activeAnnouncements = [];
        this.errorState = null;
        this.helpContext = null;
        this.userPreferences = new Map();
        this.systemPreferences = {};
        this.complianceStatus = {
            wcag21AA: false,
            lastCheck: null,
            issues: []
        };
        this.initializationTime = Date.now();
        this.eventsEmitted = 0;
        this.errorsHandled = 0;
        this.configChanges = 0;
    }
}