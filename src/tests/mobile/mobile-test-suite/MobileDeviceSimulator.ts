/**
 * Mobile Device Simulator
 * モバイルデバイスシミュレーション専用クラス
 */

// Jest types are globally available in test environment
declare const jest: any,

// Type definitions
interface DeviceConfig { devices: string[],
    browsers: string[]  }

interface ScreenInfo { width: number,
    height: number,
    pixelRatio: number }

interface CurrentDevice { name: string,
    screen: ScreenInfo,
    userAgent: string,
    orientation: 'portrait' | 'landscape',
    battery: {
        leve,l: number,
    charging: boolean };
    connection: { type: string,
    effectiveType: string }

interface SimulationState { isActive: boolean,
    mocksApplied: boolean,
    originalValues: Map<string, any>,
    activeListeners: Map<string, any> }

interface TouchPoint { identifier: number,
    clientX: number,
    clientY: number,
    pageX: number,
    pageY: number,
    screenX: number,
    screenY: number,
    target: Element
     }

interface DeviceInfo { userAgent: string,
    screen: ScreenInfo,
    pixelRatio: number }

interface DeviceUtils { createTouchEvent: (type: string, touches: TouchPoint[]) => Event,
    createTouch: (x: number, y: number, id?: number) => TouchPoint,
    createDeviceInfo: (device: string) => DeviceInfo,
    measurePerformance: (testFunction: () => Promise<void>) => Promise<number>,
    wait: (ms: number) => Promise<void>,
    randomDelay: (min: number, max: number) => Promise<void>  }
}

interface MockedAPIs { vibrate: any,
    speechSynthesis: {
        spea,k: any,
        cancel: any,
    getVoices: any  };
    deviceMotion: any;
    deviceOrientation: any;
    getBattery: any,
    serviceWorker: { register: any,
    ready: Promise<any> };
    connection: { effectiveType: string,
        downlink: number,
        rtt: number,
    saveData: boolean }

interface DebugInfo { deviceConfig: DeviceConfig,
    currentDevice: CurrentDevice,
    simulationState: SimulationState,
    mocksStatus: Record<string, boolean> }

export class MobileDeviceSimulator {
    private mobileTestSuite: any, // MobileTestSuite type would create circular dependency
    private deviceConfig: DeviceConfig,
    private currentDevice: CurrentDevice,
    private simulationState: SimulationState,
    private mocks: MockedAPIs,
    public, utils: DeviceUtils,

    constructor(mobileTestSuite: any) {
        this.mobileTestSuite = mobileTestSuite,
        
        // デバイス設定
        this.deviceConfig = {
            devices: [',
                'iPhone SE', 'iPhone 12', 'iPhone 14 Pro',
                'Samsung Galaxy S21', 'Samsung Galaxy Note 20',
                'iPad Air', 'iPad Pro',]',
                'Pixel 6', 'OnePlus 9'],
            ],
            browsers: [',
                'Safari Mobile', 'Chrome Mobile', 'Firefox Mobile',]',
                'Samsung Internet', 'Edge Mobile'] }
            ] }
        };
        
        // 現在のデバイス状態
        this.currentDevice = {;
            name: 'iPhone 12' }

            screen: { width: 390, height: 844, pixelRatio: 3  },''
            userAgent: ',
            orientation: 'portrait',
            battery: { level: 1.0, charging: false  },''
            connection: { type: '4g', effectiveType: '4g'
            };
        
        // シミュレーション状態
        this.simulationState = { isActive: false,
            mocksApplied: false,
    originalValues: new Map<string, any>(),
            activeListeners: new Map<string, any>( }
        
        // モック設定
        this.mocks = { // 振動API, vibrate: jest.fn(),
            // 音声合成API
           , speechSynthesis: {
                speak: jest.fn(),
                cancel: jest.fn(
    getVoices: jest.fn(() => []) 
    };
            // デバイス API
            deviceMotion: jest.fn();
            deviceOrientation: jest.fn();
            // バッテリー API
           , getBattery: jest.fn(() => Promise.resolve({ level: 0.8)
                charging: false),
                chargingTime: Infinity),
                dischargingTime: 28800)),
            // PWA API
           , serviceWorker: {
                register: jest.fn(() => Promise.resolve(),
                ready: Promise.resolve({) }
                    active: { postMessage: jest.fn( }'}';
            },
            
            // ネットワーク API
            connection: { ''
                effectiveType: '4g',
                downlink: 10,
                rtt: 50,
    saveData: false 
    };
        // ユーティリティ設定
        this.utils = {} as DeviceUtils;
        
        this.initializeSimulator();
    }
    
    /**
     * シミュレーター初期化
     */
    private initializeSimulator(): void { ''
        this.setupUtils()',
        this.setDefaultDevice('iPhone, 12' }'
    
    /**
     * ユーティリティ関数セットアップ
     */
    private setupUtils(): void { this.utils = {
            // タッチイベント生成
            createTouchEvent: (type: string, touches: TouchPoint[]): Event => {  }
                const event = new Event(type, { bubbles: true, cancelable: true  });
                (event, as any).touches = touches;
                (event, as any).targetTouches = touches;
                (event, as any).changedTouches = touches;
                return event;
            },
            
            // タッチポイント生成
            createTouch: (x: number, y: number, id: number = 0): TouchPoint => ({ identifier: id,
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y,
                screenX: x,
                screenY: y,
    target: this.mobileTestSuite.testContainer || document.body  });
            // デバイス情報生成
            createDeviceInfo: (device: string): DeviceInfo => ({ userAgent: this.getDeviceUserAgent(device),
                screen: this.getDeviceScreen(device,
    pixelRatio: this.getDevicePixelRatio(device });
            // パフォーマンス測定
            measurePerformance: async (testFunction: () => Promise<void>): Promise<number> => {  const start = performance.now(),
                await testFunction(),
                const end = performance.now() }
                return end - start;,
            
            // 非同期待機
            wait: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms),
            
            // ランダム遅延
            randomDelay: (min: number, max: number): Promise<void> => {  const delay = Math.random() * (max - min) + min,' }'

                return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    /**
     * デバイスシミュレーション開始'
     */''
    async startSimulation(deviceName: string = 'iPhone, 12): Promise<void> { if (this.simulationState.isActive) {
            await this.stopSimulation() }
        
        console.log(`[MobileDeviceSimulator] ${ deviceName) シミュレーション開始`),
        
        this.simulationState.isActive = true,
        this.setDevice(deviceName),
        this.applyMocks(};
        this.setupDeviceEnvironment(}
        console.log(`[MobileDeviceSimulator] ${deviceName} シミュレーション開始完了`});
    }
    
    /**
     * デバイスシミュレーション停止
     */'
    async stopSimulation(): Promise<void> { ''
        if(!this.simulationState.isActive) {
    
}
            return; }
        }

        console.log('[MobileDeviceSimulator] シミュレーション停止');
        ';

        this.restoreMocks();
        this.cleanupDeviceEnvironment()';
        console.log('[MobileDeviceSimulator] シミュレーション停止完了);
    }
    
    /**
     * デバイス設定
     */
    setDevice(deviceName: string): void { if(!this.deviceConfig.devices.includes(deviceName) { }
            throw new Error(`Unknown, device: ${deviceName}`});
        }
        
        this.currentDevice = { name: deviceName,

            screen: this.getDeviceScreen(deviceName,
            userAgent: this.getDeviceUserAgent(deviceName',
            orientation: 'portrait'
            }

            battery: { level: 1.0, charging: false  },''
            connection: { type: '4g', effectiveType: '4g'
            };
        
        console.log(`[MobileDeviceSimulator] デバイス設定: ${deviceName}`});
    }
    
    /**
     * デフォルトデバイス設定
     */
    private setDefaultDevice(deviceName: string): void { this.setDevice(deviceName) }
    
    /**
     * モック適用
     */
    private applyMocks(): void { if (this.simulationState.mocksApplied) {
            return }
        
        // 既存値を保存
        Object.keys(this.mocks).forEach(key => {  ),
            if ((navigator, as any)[key] !== undefined) { }
                this.simulationState.originalValues.set(key, (navigator: any)[key]); }
});
        
        // モック適用
        Object.assign(navigator, this.mocks);
        // カスタムプロパティ設定
        this.applyCustomProperties()';
        console.log('[MobileDeviceSimulator] モック適用完了');
    }
    
    /**
     * カスタムプロパティ適用'
     */''
    private applyCustomProperties()';
        Object.defineProperty(navigator, 'userAgent', { value: this.currentDevice.userAgent', writable: false,')',
            configurable: true'),
        ',
        // 画面サイズ設定
        Object.defineProperty(window, 'innerWidth', {)
            value: this.currentDevice.screen.width',
    writable: true,')',
            configurable: true',

        Object.defineProperty(window, 'innerHeight', {)
            value: this.currentDevice.screen.height',
    writable: true,')',
            configurable: true'),
        ',
        // デバイスピクセル比設定
        Object.defineProperty(window, 'devicePixelRatio', {)
            value: this.currentDevice.screen.pixelRatio',
    writable: true,')',
            configurable: true'),
        ',
        // タッチサポート設定
        Object.defineProperty(navigator, 'maxTouchPoints', {)
            value: 10,
    writable: false),
            configurable: true  }
    
    /**
     * モック復元
     */
    private restoreMocks(): void { if (!this.simulationState.mocksApplied) {
            return }
        
        // 元の値を復元
        for(const [key, originalValue] of Array.from(this.simulationState.originalValues.entries()) { (navigator, as any)[key] = originalValue }
        
        // 設定されていなかったプロパティを削除
        Object.keys(this.mocks).forEach(key => {  ),
            if(!this.simulationState.originalValues.has(key) { }
                delete (navigator, as any)[key]; }
});

        this.simulationState.originalValues.clear()';
        console.log('[MobileDeviceSimulator] モック復元完了);
    }
    
    /**
     * デバイス環境セットアップ
     */
    private setupDeviceEnvironment(): void { // CSS環境変数設定
        this.setCSSEnvironmentVariables(),
        
        // イベントリスナー設定
        this.setupEventListeners(),
        
        // メディアクエリ設定
        this.setupMediaQueries() }
    
    /**
     * CSS環境変数設定
     */''
    private setCSSEnvironmentVariables()';
        const style = document.createElement('style';
        style.textContent = `;
            :root {
                --device-width: ${this.currentDevice.screen.width}px;
                --device-height: ${this.currentDevice.screen.height}px;
                --device-pixel-ratio: ${this.currentDevice.screen.pixelRatio}

        `;
        document.head.appendChild(style);

        this.simulationState.activeListeners.set('css-vars', style);
    }
    
    /**
     * イベントリスナー設定
     */
    private setupEventListeners(): void { // デバイス向き変更イベント
        const orientationHandler = (): void => { ''
            this.handleOrientationChange()',
        window.addEventListener('orientationchange', orientationHandler',
        this.simulationState.activeListeners.set('orientation', orientationHandler),
        
        // タッチイベント設定
        const touchHandler = (event: Event): void => { }'

            this.handleTouchEvent(event); }
        };

        document.addEventListener('touchstart', touchHandler, { passive: false }';
        document.addEventListener('touchmove', touchHandler, { passive: false }';
        document.addEventListener('touchend', touchHandler, { passive: false )',

        this.simulationState.activeListeners.set('touch', touchHandler) }
    
    /**
     * メディアクエリ設定
     */
    private setupMediaQueries(): void { // モバイル用メディアクエリのシミュレーション
        const mediaQueries = { }
            mobile: `(max-width: ${this.currentDevice.screen.width}px)`;
            tablet: `(min-width: 768px) and (max-width: 1024px)`,
            desktop: `(min-width: 1025px')`;
        },

        this.simulationState.activeListeners.set('mediaQueries', mediaQueries';
    }
    
    /**
     * デバイス環境クリーンアップ'
     */''
    private cleanupDeviceEnvironment()';
        const cssVars = this.simulationState.activeListeners.get('css-vars);
        if(cssVars && cssVars.parentNode) {', ' }

            cssVars.parentNode.removeChild(cssVars); }
        }
        ';
        // イベントリスナー削除
        const orientationHandler = this.simulationState.activeListeners.get('orientation';
        if(orientationHandler) {', ' }

            window.removeEventListener('orientationchange', orientationHandler'; }
        }

        const touchHandler = this.simulationState.activeListeners.get('touch';
        if(touchHandler) {

            document.removeEventListener('touchstart', touchHandler',
            document.removeEventListener('touchmove', touchHandler' }

            document.removeEventListener('touchend', touchHandler); }
        }
        
        this.simulationState.activeListeners.clear();
    }
    
    /**
     * 向き変更処理'
     */''
    private handleOrientationChange()';
        const newOrientation: 'portrait' | 'landscape' = this.currentDevice.orientation === 'portrait' ? 'landscape' : 'portrait');
        this.setOrientation(newOrientation);
        
        console.log(`[MobileDeviceSimulator] 向き変更: ${newOrientation}`});
    }
    
    /**
     * タッチイベント処理
     */
    private handleTouchEvent(event: Event): void { // タッチイベントの拡張処理
        (event, as any).deviceName = this.currentDevice.name,
        (event, as any').simulatedTouch = true }'
    
    /**
     * デバイス向き設定'
     */''
    setOrientation(orientation: 'portrait' | 'landscape'): void { ''
        if(!['portrait', 'landscape].includes(orientation) { }

            throw new Error(`Invalid, orientation: ${orientation}`}';
        }
        
        this.currentDevice.orientation = orientation;
        ';
        // 画面サイズ調整
        if(orientation === 'landscape' {'
            const temp = this.currentDevice.screen.width,
            this.currentDevice.screen.width = this.currentDevice.screen.height }
            this.currentDevice.screen.height = temp; }
        }
        
        // 環境変数更新
        if (this.simulationState.isActive) { this.setCSSEnvironmentVariables() }
    }
    
    /**
     * デバイス状態リセット
     */
    async resetDeviceState(): Promise<void> { if (!this.simulationState.isActive) {
            return }
        ;
        // モック関数のコール履歴クリア
        Object.values(this.mocks).forEach(mock => {  '),
            if (typeof, mock === 'function' && (mock, as any).mockClear) { }

                (mock, as any).mockClear() }

            } else if (typeof, mock === 'object' && mock !== null' { ''
                Object.values(mock).forEach(subMock => { '),
                    if (typeof, subMock === 'function' && (subMock, as any).mockClear) { }
                        (subMock, as any).mockClear(); }
});

            }'}');
        
        // バッテリー状態リセット
        this.currentDevice.battery = { level: 1.0, charging: false  }''
        console.log('[MobileDeviceSimulator] デバイス状態リセット完了);
    }
    
    /**
     * デバイス強制リセット
     */
    async forceResetDevice(): Promise<void> { await this.stopSimulation(),
        await this.startSimulation(this.currentDevice.name') }
    
    /**
     * デバイスUser Agent取得'
     */''
    getDeviceUserAgent(device: string): string { const userAgents: Record<string, string> = {', 'iPhone SE': 'Mozilla/5.0 (iPhone, CPU, iPhone OS, 15_0 like, Mac OS, X) AppleWebKit/605.1.15(KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',', 'iPhone 12': 'Mozilla/5.0 (iPhone, CPU, iPhone OS, 16_0 like, Mac OS, X) AppleWebKit/605.1.15(KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',', 'iPhone 14 Pro': 'Mozilla/5.0 (iPhone, CPU, iPhone OS, 17_0 like, Mac OS, X) AppleWebKit/605.1.15(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',', 'Samsung Galaxy S21': 'Mozilla/5.0 (Linux, Android, 11, SM-G991B) AppleWebKit/537.36(KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36',', 'Samsung Galaxy Note 20': 'Mozilla/5.0 (Linux, Android, 10, SM-N981B) AppleWebKit/537.36(KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',', 'iPad Air': 'Mozilla/5.0 (iPad, CPU, OS 15_0, like Mac, OS X) AppleWebKit/605.1.15(KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',', 'iPad Pro': 'Mozilla/5.0 (iPad, CPU, OS 16_0, like Mac, OS X) AppleWebKit/605.1.15(KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',', 'Pixel 6': 'Mozilla/5.0 (Linux, Android, 12, Pixel, 6) AppleWebKit/537.36(KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',', 'OnePlus 9': 'Mozilla/5.0 (Linux, Android, 11, LE2115) AppleWebKit/537.36(KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36' }

        };
        return userAgents[device] || userAgents['iPhone 12];
    }
    
    /**
     * デバイス画面サイズ取得'
     */''
    getDeviceScreen(device: string): ScreenInfo { const screens: Record<string, ScreenInfo> = { }', 'iPhone SE': { width: 375, height: 667, pixelRatio: 2  },', 'iPhone 12': { width: 390, height: 844, pixelRatio: 3  },', 'iPhone 14 Pro': { width: 393, height: 852, pixelRatio: 3  },', 'Samsung Galaxy S21': { width: 384, height: 854, pixelRatio: 2.75  },', 'Samsung Galaxy Note 20': { width: 412, height: 915, pixelRatio: 2.625  },', 'iPad Air': { width: 820, height: 1180, pixelRatio: 2  },', 'iPad Pro': { width: 1024, height: 1366, pixelRatio: 2  },', 'Pixel 6': { width: 412, height: 915, pixelRatio: 2.625  },', 'OnePlus 9': { width: 412, height: 919, pixelRatio: 2.625  }

        };
        return screens[device] || screens['iPhone 12];
    }
    
    /**
     * デバイスピクセル比取得
     */
    getDevicePixelRatio(device: string): number { return this.getDeviceScreen(device).pixelRatio }
    
    /**
     * 利用可能デバイス一覧取得
     */
    getAvailableDevices(): string[] { return [...this.deviceConfig.devices],
    
    /**
     * 現在のデバイス情報取得
     */
    getCurrentDevice(): CurrentDevice {
        return { ...this.currentDevice }
    
    /**
     * シミュレーション状態取得
     */
    getSimulationState(): { isActive: boolean,
        currentDevice: string,
        mocksApplied: boolean,
    activeListeners: number  } { return { isActive: this.simulationState.isActive,
            currentDevice: this.currentDevice.name,
    mocksApplied: this.simulationState.mocksApplied };
            activeListeners: this.simulationState.activeListeners.size 
    }
    
    /**
     * デバッグ情報取得
     */
    getDebugInfo(): DebugInfo { return { deviceConfig: this.deviceConfig,
            currentDevice: this.currentDevice,
    simulationState: this.simulationState,
            mocksStatus: Object.keys(this.mocks).reduce((status: Record<string, boolean>, key: string) => { }'

                status[key] = typeof(navigator, as any)[key] !== 'undefined'; };

                return status; }'

            }, {}');
        }'}