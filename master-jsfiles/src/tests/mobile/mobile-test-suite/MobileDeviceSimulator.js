/**
 * Mobile Device Simulator
 * モバイルデバイスシミュレーション専用クラス
 */

export class MobileDeviceSimulator {
    constructor(mobileTestSuite) {
        this.mobileTestSuite = mobileTestSuite;
        
        // デバイス設定
        this.deviceConfig = {
            devices: [
                'iPhone SE', 'iPhone 12', 'iPhone 14 Pro',
                'Samsung Galaxy S21', 'Samsung Galaxy Note 20',
                'iPad Air', 'iPad Pro',
                'Pixel 6', 'OnePlus 9'
            ],
            browsers: [
                'Safari Mobile', 'Chrome Mobile', 'Firefox Mobile',
                'Samsung Internet', 'Edge Mobile'
            ]
        };
        
        // 現在のデバイス状態
        this.currentDevice = {
            name: 'iPhone 12',
            screen: { width: 390, height: 844, pixelRatio: 3 },
            userAgent: '',
            orientation: 'portrait',
            battery: { level: 1.0, charging: false },
            connection: { type: '4g', effectiveType: '4g' }
        };
        
        // シミュレーション状態
        this.simulationState = {
            isActive: false,
            mocksApplied: false,
            originalValues: new Map(),
            activeListeners: new Map()
        };
        
        // モック設定
        this.mocks = {
            // 振動API
            vibrate: jest.fn(),
            
            // 音声合成API
            speechSynthesis: {
                speak: jest.fn(),
                cancel: jest.fn(),
                getVoices: jest.fn(() => [])
            },
            
            // デバイス API
            deviceMotion: jest.fn(),
            deviceOrientation: jest.fn(),
            
            // バッテリー API
            getBattery: jest.fn(() => Promise.resolve({
                level: 0.8,
                charging: false,
                chargingTime: Infinity,
                dischargingTime: 28800
            })),
            
            // PWA API
            serviceWorker: {
                register: jest.fn(() => Promise.resolve()),
                ready: Promise.resolve({
                    active: { postMessage: jest.fn() }
                })
            },
            
            // ネットワーク API
            connection: {
                effectiveType: '4g',
                downlink: 10,
                rtt: 50,
                saveData: false
            }
        };
        
        // ユーティリティ設定
        this.utils = {};
        
        this.initializeSimulator();
    }
    
    /**
     * シミュレーター初期化
     */
    initializeSimulator() {
        this.setupUtils();
        this.setDefaultDevice('iPhone 12');
    }
    
    /**
     * ユーティリティ関数セットアップ
     */
    setupUtils() {
        this.utils = {
            // タッチイベント生成
            createTouchEvent: (type, touches) => {
                const event = new Event(type, { bubbles: true, cancelable: true });
                event.touches = touches;
                event.targetTouches = touches;
                event.changedTouches = touches;
                return event;
            },
            
            // タッチポイント生成
            createTouch: (x, y, id = 0) => ({
                identifier: id,
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y,
                screenX: x,
                screenY: y,
                target: this.mobileTestSuite.testContainer || document.body
            }),
            
            // デバイス情報生成
            createDeviceInfo: (device) => ({
                userAgent: this.getDeviceUserAgent(device),
                screen: this.getDeviceScreen(device),
                pixelRatio: this.getDevicePixelRatio(device)
            }),
            
            // パフォーマンス測定
            measurePerformance: async (testFunction) => {
                const start = performance.now();
                await testFunction();
                const end = performance.now();
                return end - start;
            },
            
            // 非同期待機
            wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
            
            // ランダム遅延
            randomDelay: (min, max) => {
                const delay = Math.random() * (max - min) + min;
                return new Promise(resolve => setTimeout(resolve, delay));
            }
        };
    }
    
    /**
     * デバイスシミュレーション開始
     */
    async startSimulation(deviceName = 'iPhone 12') {
        if (this.simulationState.isActive) {
            await this.stopSimulation();
        }
        
        console.log(`[MobileDeviceSimulator] ${deviceName} シミュレーション開始`);
        
        this.simulationState.isActive = true;
        this.setDevice(deviceName);
        this.applyMocks();
        this.setupDeviceEnvironment();
        
        console.log(`[MobileDeviceSimulator] ${deviceName} シミュレーション開始完了`);
    }
    
    /**
     * デバイスシミュレーション停止
     */
    async stopSimulation() {
        if (!this.simulationState.isActive) {
            return;
        }
        
        console.log('[MobileDeviceSimulator] シミュレーション停止');
        
        this.restoreMocks();
        this.cleanupDeviceEnvironment();
        this.simulationState.isActive = false;
        
        console.log('[MobileDeviceSimulator] シミュレーション停止完了');
    }
    
    /**
     * デバイス設定
     */
    setDevice(deviceName) {
        if (!this.deviceConfig.devices.includes(deviceName)) {
            throw new Error(`Unknown device: ${deviceName}`);
        }
        
        this.currentDevice = {
            name: deviceName,
            screen: this.getDeviceScreen(deviceName),
            userAgent: this.getDeviceUserAgent(deviceName),
            orientation: 'portrait',
            battery: { level: 1.0, charging: false },
            connection: { type: '4g', effectiveType: '4g' }
        };
        
        console.log(`[MobileDeviceSimulator] デバイス設定: ${deviceName}`);
    }
    
    /**
     * デフォルトデバイス設定
     */
    setDefaultDevice(deviceName) {
        this.setDevice(deviceName);
    }
    
    /**
     * モック適用
     */
    applyMocks() {
        if (this.simulationState.mocksApplied) {
            return;
        }
        
        // 既存値を保存
        Object.keys(this.mocks).forEach(key => {
            if (navigator[key] !== undefined) {
                this.simulationState.originalValues.set(key, navigator[key]);
            }
        });
        
        // モック適用
        Object.assign(navigator, this.mocks);
        
        // カスタムプロパティ設定
        this.applyCustomProperties();
        
        this.simulationState.mocksApplied = true;
        console.log('[MobileDeviceSimulator] モック適用完了');
    }
    
    /**
     * カスタムプロパティ適用
     */
    applyCustomProperties() {
        // User Agent設定
        Object.defineProperty(navigator, 'userAgent', {
            value: this.currentDevice.userAgent,
            writable: false,
            configurable: true
        });
        
        // 画面サイズ設定
        Object.defineProperty(window, 'innerWidth', {
            value: this.currentDevice.screen.width,
            writable: true,
            configurable: true
        });
        
        Object.defineProperty(window, 'innerHeight', {
            value: this.currentDevice.screen.height,
            writable: true,
            configurable: true
        });
        
        // デバイスピクセル比設定
        Object.defineProperty(window, 'devicePixelRatio', {
            value: this.currentDevice.screen.pixelRatio,
            writable: true,
            configurable: true
        });
        
        // タッチサポート設定
        Object.defineProperty(navigator, 'maxTouchPoints', {
            value: 10,
            writable: false,
            configurable: true
        });
    }
    
    /**
     * モック復元
     */
    restoreMocks() {
        if (!this.simulationState.mocksApplied) {
            return;
        }
        
        // 元の値を復元
        for (const [key, originalValue] of this.simulationState.originalValues.entries()) {
            navigator[key] = originalValue;
        }
        
        // 設定されていなかったプロパティを削除
        Object.keys(this.mocks).forEach(key => {
            if (!this.simulationState.originalValues.has(key)) {
                delete navigator[key];
            }
        });
        
        this.simulationState.originalValues.clear();
        this.simulationState.mocksApplied = false;
        
        console.log('[MobileDeviceSimulator] モック復元完了');
    }
    
    /**
     * デバイス環境セットアップ
     */
    setupDeviceEnvironment() {
        // CSS環境変数設定
        this.setCSSEnvironmentVariables();
        
        // イベントリスナー設定
        this.setupEventListeners();
        
        // メディアクエリ設定
        this.setupMediaQueries();
    }
    
    /**
     * CSS環境変数設定
     */
    setCSSEnvironmentVariables() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --device-width: ${this.currentDevice.screen.width}px;
                --device-height: ${this.currentDevice.screen.height}px;
                --device-pixel-ratio: ${this.currentDevice.screen.pixelRatio};
            }
        `;
        document.head.appendChild(style);
        
        this.simulationState.activeListeners.set('css-vars', style);
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // デバイス向き変更イベント
        const orientationHandler = () => {
            this.handleOrientationChange();
        };
        
        window.addEventListener('orientationchange', orientationHandler);
        this.simulationState.activeListeners.set('orientation', orientationHandler);
        
        // タッチイベント設定
        const touchHandler = (event) => {
            this.handleTouchEvent(event);
        };
        
        document.addEventListener('touchstart', touchHandler, { passive: false });
        document.addEventListener('touchmove', touchHandler, { passive: false });
        document.addEventListener('touchend', touchHandler, { passive: false });
        
        this.simulationState.activeListeners.set('touch', touchHandler);
    }
    
    /**
     * メディアクエリ設定
     */
    setupMediaQueries() {
        // モバイル用メディアクエリのシミュレーション
        const mediaQueries = {
            mobile: `(max-width: ${this.currentDevice.screen.width}px)`,
            tablet: `(min-width: 768px) and (max-width: 1024px)`,
            desktop: `(min-width: 1025px)`
        };
        
        this.simulationState.activeListeners.set('mediaQueries', mediaQueries);
    }
    
    /**
     * デバイス環境クリーンアップ
     */
    cleanupDeviceEnvironment() {
        // CSS環境変数削除
        const cssVars = this.simulationState.activeListeners.get('css-vars');
        if (cssVars && cssVars.parentNode) {
            cssVars.parentNode.removeChild(cssVars);
        }
        
        // イベントリスナー削除
        const orientationHandler = this.simulationState.activeListeners.get('orientation');
        if (orientationHandler) {
            window.removeEventListener('orientationchange', orientationHandler);
        }
        
        const touchHandler = this.simulationState.activeListeners.get('touch');
        if (touchHandler) {
            document.removeEventListener('touchstart', touchHandler);
            document.removeEventListener('touchmove', touchHandler);
            document.removeEventListener('touchend', touchHandler);
        }
        
        this.simulationState.activeListeners.clear();
    }
    
    /**
     * 向き変更処理
     */
    handleOrientationChange() {
        const newOrientation = this.currentDevice.orientation === 'portrait' ? 'landscape' : 'portrait';
        this.setOrientation(newOrientation);
        
        console.log(`[MobileDeviceSimulator] 向き変更: ${newOrientation}`);
    }
    
    /**
     * タッチイベント処理
     */
    handleTouchEvent(event) {
        // タッチイベントの拡張処理
        event.deviceName = this.currentDevice.name;
        event.simulatedTouch = true;
    }
    
    /**
     * デバイス向き設定
     */
    setOrientation(orientation) {
        if (!['portrait', 'landscape'].includes(orientation)) {
            throw new Error(`Invalid orientation: ${orientation}`);
        }
        
        this.currentDevice.orientation = orientation;
        
        // 画面サイズ調整
        if (orientation === 'landscape') {
            const temp = this.currentDevice.screen.width;
            this.currentDevice.screen.width = this.currentDevice.screen.height;
            this.currentDevice.screen.height = temp;
        }
        
        // 環境変数更新
        if (this.simulationState.isActive) {
            this.setCSSEnvironmentVariables();
        }
    }
    
    /**
     * デバイス状態リセット
     */
    async resetDeviceState() {
        if (!this.simulationState.isActive) {
            return;
        }
        
        // モック関数のコール履歴クリア
        Object.values(this.mocks).forEach(mock => {
            if (typeof mock === 'function' && mock.mockClear) {
                mock.mockClear();
            } else if (typeof mock === 'object') {
                Object.values(mock).forEach(subMock => {
                    if (typeof subMock === 'function' && subMock.mockClear) {
                        subMock.mockClear();
                    }
                });
            }
        });
        
        // バッテリー状態リセット
        this.currentDevice.battery = { level: 1.0, charging: false };
        
        console.log('[MobileDeviceSimulator] デバイス状態リセット完了');
    }
    
    /**
     * デバイス強制リセット
     */
    async forceResetDevice() {
        await this.stopSimulation();
        await this.startSimulation(this.currentDevice.name);
    }
    
    /**
     * デバイスUser Agent取得
     */
    getDeviceUserAgent(device) {
        const userAgents = {
            'iPhone SE': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            'iPhone 12': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'iPhone 14 Pro': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Samsung Galaxy S21': 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36',
            'Samsung Galaxy Note 20': 'Mozilla/5.0 (Linux; Android 10; SM-N981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
            'iPad Air': 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            'iPad Pro': 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Pixel 6': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
            'OnePlus 9': 'Mozilla/5.0 (Linux; Android 11; LE2115) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36'
        };
        return userAgents[device] || userAgents['iPhone 12'];
    }
    
    /**
     * デバイス画面サイズ取得
     */
    getDeviceScreen(device) {
        const screens = {
            'iPhone SE': { width: 375, height: 667, pixelRatio: 2 },
            'iPhone 12': { width: 390, height: 844, pixelRatio: 3 },
            'iPhone 14 Pro': { width: 393, height: 852, pixelRatio: 3 },
            'Samsung Galaxy S21': { width: 384, height: 854, pixelRatio: 2.75 },
            'Samsung Galaxy Note 20': { width: 412, height: 915, pixelRatio: 2.625 },
            'iPad Air': { width: 820, height: 1180, pixelRatio: 2 },
            'iPad Pro': { width: 1024, height: 1366, pixelRatio: 2 },
            'Pixel 6': { width: 412, height: 915, pixelRatio: 2.625 },
            'OnePlus 9': { width: 412, height: 919, pixelRatio: 2.625 }
        };
        return screens[device] || screens['iPhone 12'];
    }
    
    /**
     * デバイスピクセル比取得
     */
    getDevicePixelRatio(device) {
        return this.getDeviceScreen(device).pixelRatio;
    }
    
    /**
     * 利用可能デバイス一覧取得
     */
    getAvailableDevices() {
        return [...this.deviceConfig.devices];
    }
    
    /**
     * 現在のデバイス情報取得
     */
    getCurrentDevice() {
        return { ...this.currentDevice };
    }
    
    /**
     * シミュレーション状態取得
     */
    getSimulationState() {
        return {
            isActive: this.simulationState.isActive,
            currentDevice: this.currentDevice.name,
            mocksApplied: this.simulationState.mocksApplied,
            activeListeners: this.simulationState.activeListeners.size
        };
    }
    
    /**
     * デバッグ情報取得
     */
    getDebugInfo() {
        return {
            deviceConfig: this.deviceConfig,
            currentDevice: this.currentDevice,
            simulationState: this.simulationState,
            mocksStatus: Object.keys(this.mocks).reduce((status, key) => {
                status[key] = typeof navigator[key] !== 'undefined';
                return status;
            }, {})
        };
    }
}