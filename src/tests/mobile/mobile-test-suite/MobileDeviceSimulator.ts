/**
 * Mobile Device Simulator
 * モバイルデバイスシミュレーション専用クラス
 */

// Jest types are globally available in test environment
declare const jest: any;

// Type definitions
interface DeviceConfig {
    devices: string[];
    browsers: string[];
}

interface ScreenInfo {
    width: number;
    height: number;
    pixelRatio: number;
}

interface CurrentDevice {
    name: string;
    screen: ScreenInfo;
    userAgent: string;
    orientation: 'portrait' | 'landscape';
    battery: {
        level: number;
        charging: boolean;
    };
    connection: {
        type: string;
        effectiveType: string;
    };
}

interface SimulationState {
    isActive: boolean;
    mocksApplied: boolean;
    originalValues: Map<string, any>;
    activeListeners: Map<string, any>;
}

interface TouchPoint {
    identifier: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    target: Element;
}

interface DeviceInfo {
    userAgent: string;
    screen: ScreenInfo;
    pixelRatio: number;
}

interface DeviceUtils {
    createTouchEvent: (type: string, touches: TouchPoint[]) => Event;
    createTouch: (x: number, y: number, id?: number) => TouchPoint;
    createDeviceInfo: (device: string) => DeviceInfo;
    measurePerformance: (testFunction: () => Promise<void>) => Promise<number>;
    wait: (ms: number) => Promise<void>;
    randomDelay: (min: number, max: number) => Promise<void>;
}

interface MockedAPIs {
    vibrate: any;
    speechSynthesis: {
        speak: any;
        cancel: any;
        getVoices: any;
    };
    deviceMotion: any;
    deviceOrientation: any;
    getBattery: any;
    serviceWorker: {
        register: any;
        ready: Promise<any>;
    };
    connection: {
        effectiveType: string;
        downlink: number;
        rtt: number;
        saveData: boolean;
    };
}

interface DebugInfo {
    deviceConfig: DeviceConfig;
    currentDevice: CurrentDevice;
    simulationState: SimulationState;
    mocksStatus: Record<string, boolean>;
}

export class MobileDeviceSimulator {
    private mobileTestSuite: any; // MobileTestSuite type would create circular dependency
    private deviceConfig: DeviceConfig;
    private currentDevice: CurrentDevice;
    private simulationState: SimulationState;
    private mocks: MockedAPIs;
    public utils: DeviceUtils;

    constructor(mobileTestSuite: any) {
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

        // 現在のデバイス設定（デフォルト）
        this.currentDevice = {
            name: 'iPhone 12',
            screen: {
                width: 390,
                height: 844,
                pixelRatio: 3
            },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            orientation: 'portrait',
            battery: {
                level: 0.8,
                charging: false
            },
            connection: {
                type: 'wifi',
                effectiveType: '4g'
            }
        };

        // シミュレーション状態
        this.simulationState = {
            isActive: false,
            mocksApplied: false,
            originalValues: new Map(),
            activeListeners: new Map()
        };

        // モックAPIs
        this.mocks = {
            vibrate: jest.fn(),
            speechSynthesis: {
                speak: jest.fn(),
                cancel: jest.fn(),
                getVoices: jest.fn(() => [])
            },
            deviceMotion: jest.fn(),
            deviceOrientation: jest.fn(),
            getBattery: jest.fn(() => Promise.resolve({
                level: this.currentDevice.battery.level,
                charging: this.currentDevice.battery.charging,
                chargingTime: Infinity,
                dischargingTime: 3600
            })),
            serviceWorker: {
                register: jest.fn(() => Promise.resolve()),
                ready: Promise.resolve()
            },
            connection: {
                effectiveType: this.currentDevice.connection.effectiveType,
                downlink: 10,
                rtt: 50,
                saveData: false
            }
        };

        // ユーティリティメソッド
        this.utils = {
            createTouchEvent: this.createTouchEvent.bind(this),
            createTouch: this.createTouch.bind(this),
            createDeviceInfo: this.createDeviceInfo.bind(this),
            measurePerformance: this.measurePerformance.bind(this),
            wait: this.wait.bind(this),
            randomDelay: this.randomDelay.bind(this)
        };

        console.log('MobileDeviceSimulator initialized');
    }

    /**
     * デバイスシミュレーション開始
     */
    startSimulation(deviceName?: string): void {
        if (this.simulationState.isActive) {
            console.warn('Simulation is already active');
            return;
        }

        if (deviceName) {
            this.switchDevice(deviceName);
        }

        this.applyMocks();
        this.simulationState.isActive = true;
        
        console.log(`Device simulation started: ${this.currentDevice.name}`);
    }

    /**
     * デバイスシミュレーション停止
     */
    stopSimulation(): void {
        if (!this.simulationState.isActive) {
            console.warn('No simulation is currently active');
            return;
        }

        this.removeMocks();
        this.simulationState.isActive = false;
        
        console.log('Device simulation stopped');
    }

    /**
     * デバイス切り替え
     */
    switchDevice(deviceName: string): void {
        if (!this.deviceConfig.devices.includes(deviceName)) {
            throw new Error(`Unknown device: ${deviceName}`);
        }

        const deviceInfo = this.getDeviceInfo(deviceName);
        this.currentDevice = {
            name: deviceName,
            screen: deviceInfo.screen,
            userAgent: deviceInfo.userAgent,
            orientation: 'portrait',
            battery: {
                level: Math.random() * 0.5 + 0.3, // 30-80%
                charging: Math.random() > 0.7
            },
            connection: {
                type: Math.random() > 0.5 ? 'wifi' : 'cellular',
                effectiveType: Math.random() > 0.3 ? '4g' : '3g'
            }
        };

        if (this.simulationState.isActive) {
            this.updateMocks();
        }

        console.log(`Switched to device: ${deviceName}`);
    }

    /**
     * 画面向きを変更
     */
    setOrientation(orientation: 'portrait' | 'landscape'): void {
        const previousOrientation = this.currentDevice.orientation;
        this.currentDevice.orientation = orientation;

        // 画面サイズを回転
        if (orientation !== previousOrientation) {
            const { width, height } = this.currentDevice.screen;
            this.currentDevice.screen.width = height;
            this.currentDevice.screen.height = width;

            // 向き変更イベントを発火
            this.triggerOrientationChange();
        }

        console.log(`Orientation changed to: ${orientation}`);
    }

    /**
     * バッテリー状態を設定
     */
    setBatteryLevel(level: number, charging: boolean = false): void {
        if (level < 0 || level > 1) {
            throw new Error('Battery level must be between 0 and 1');
        }

        this.currentDevice.battery.level = level;
        this.currentDevice.battery.charging = charging;

        // バッテリーモックを更新
        this.mocks.getBattery = jest.fn(() => Promise.resolve({
            level: level,
            charging: charging,
            chargingTime: charging ? 3600 : Infinity,
            dischargingTime: charging ? Infinity : 7200
        }));

        console.log(`Battery updated: ${Math.round(level * 100)}%, charging: ${charging}`);
    }

    /**
     * ネットワーク状態を設定
     */
    setNetworkCondition(type: string, effectiveType: string = '4g'): void {
        this.currentDevice.connection.type = type;
        this.currentDevice.connection.effectiveType = effectiveType;

        // ネットワークスピードに基づく値設定
        const networkSpeeds = {
            'slow-2g': { downlink: 0.25, rtt: 2000 },
            '2g': { downlink: 0.5, rtt: 1400 },
            '3g': { downlink: 1.5, rtt: 400 },
            '4g': { downlink: 10, rtt: 50 }
        };

        const speeds = networkSpeeds[effectiveType as keyof typeof networkSpeeds] || networkSpeeds['4g'];
        this.mocks.connection.effectiveType = effectiveType;
        this.mocks.connection.downlink = speeds.downlink;
        this.mocks.connection.rtt = speeds.rtt;

        console.log(`Network condition updated: ${type}, ${effectiveType}`);
    }

    /**
     * タッチイベントをシミュレート
     */
    simulateTouch(x: number, y: number, type: string = 'touchstart'): void {
        const touch = this.createTouch(x, y);
        const event = this.createTouchEvent(type, [touch]);
        
        // イベントを対象要素にディスパッチ
        const element = document.elementFromPoint(x, y) || document.body;
        element.dispatchEvent(event);

        console.log(`Touch simulated: ${type} at (${x}, ${y})`);
    }

    /**
     * スワイプジェスチャーをシミュレート
     */
    simulateSwipe(startX: number, startY: number, endX: number, endY: number, duration: number = 300): void {
        const steps = 10;
        const stepX = (endX - startX) / steps;
        const stepY = (endY - startY) / steps;
        const stepDuration = duration / steps;

        // タッチ開始
        this.simulateTouch(startX, startY, 'touchstart');

        // 中間点でのタッチ移動
        let currentStep = 0;
        const moveInterval = setInterval(() => {
            currentStep++;
            const currentX = startX + stepX * currentStep;
            const currentY = startY + stepY * currentStep;
            
            this.simulateTouch(currentX, currentY, 'touchmove');

            if (currentStep >= steps) {
                clearInterval(moveInterval);
                // タッチ終了
                this.simulateTouch(endX, endY, 'touchend');
                
                console.log(`Swipe completed from (${startX}, ${startY}) to (${endX}, ${endY})`);
            }
        }, stepDuration);
    }

    /**
     * バイブレーションをシミュレート
     */
    simulateVibration(pattern: number | number[]): void {
        this.mocks.vibrate(pattern);
        console.log(`Vibration simulated with pattern:`, pattern);
    }

    /**
     * デバイス回転をシミュレート
     */
    simulateDeviceMotion(acceleration: { x: number, y: number, z: number }): void {
        const event = new DeviceMotionEvent('devicemotion', {
            acceleration: acceleration,
            accelerationIncludingGravity: {
                x: acceleration.x,
                y: acceleration.y + 9.8,
                z: acceleration.z
            },
            rotationRate: { alpha: 0, beta: 0, gamma: 0 },
            interval: 16
        });

        window.dispatchEvent(event);
        console.log('Device motion simulated:', acceleration);
    }

    /**
     * パフォーマンステスト
     */
    async runPerformanceTest(testFunction: () => Promise<void>, iterations: number = 1): Promise<{
        averageTime: number;
        minTime: number;
        maxTime: number;
        times: number[];
    }> {
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const time = await this.measurePerformance(testFunction);
            times.push(time);
        }

        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        const result = { averageTime, minTime, maxTime, times };
        console.log('Performance test completed:', result);
        
        return result;
    }

    /**
     * デバイス互換性テスト
     */
    async testDeviceCompatibility(testFunction: () => Promise<void>): Promise<Record<string, boolean>> {
        const results: Record<string, boolean> = {};

        for (const device of this.deviceConfig.devices) {
            try {
                this.switchDevice(device);
                await testFunction();
                results[device] = true;
                console.log(`✅ ${device}: Compatible`);
            } catch (error) {
                results[device] = false;
                console.log(`❌ ${device}: Incompatible -`, error);
            }
        }

        return results;
    }

    /**
     * プライベートメソッド: デバイス情報取得
     */
    private getDeviceInfo(deviceName: string): DeviceInfo {
        const deviceInfoMap: Record<string, DeviceInfo> = {
            'iPhone SE': {
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
                screen: { width: 375, height: 667, pixelRatio: 2 },
                pixelRatio: 2
            },
            'iPhone 12': {
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
                screen: { width: 390, height: 844, pixelRatio: 3 },
                pixelRatio: 3
            },
            'iPhone 14 Pro': {
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                screen: { width: 393, height: 852, pixelRatio: 3 },
                pixelRatio: 3
            },
            'Samsung Galaxy S21': {
                userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                screen: { width: 384, height: 854, pixelRatio: 2.75 },
                pixelRatio: 2.75
            },
            'iPad Air': {
                userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
                screen: { width: 820, height: 1180, pixelRatio: 2 },
                pixelRatio: 2
            },
            'Pixel 6': {
                userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
                screen: { width: 411, height: 891, pixelRatio: 2.625 },
                pixelRatio: 2.625
            }
        };

        return deviceInfoMap[deviceName] || deviceInfoMap['iPhone 12'];
    }

    /**
     * プライベートメソッド: モック適用
     */
    private applyMocks(): void {
        if (this.simulationState.mocksApplied) {
            return;
        }

        // 元の値を保存
        this.simulationState.originalValues.set('userAgent', navigator.userAgent);
        this.simulationState.originalValues.set('screen.width', screen.width);
        this.simulationState.originalValues.set('screen.height', screen.height);
        this.simulationState.originalValues.set('devicePixelRatio', window.devicePixelRatio);

        // モックを適用
        Object.defineProperty(navigator, 'userAgent', {
            value: this.currentDevice.userAgent,
            writable: true
        });

        Object.defineProperty(screen, 'width', {
            value: this.currentDevice.screen.width,
            writable: true
        });

        Object.defineProperty(screen, 'height', {
            value: this.currentDevice.screen.height,
            writable: true
        });

        Object.defineProperty(window, 'devicePixelRatio', {
            value: this.currentDevice.screen.pixelRatio,
            writable: true
        });

        // API モック
        if (navigator.vibrate) {
            this.simulationState.originalValues.set('vibrate', navigator.vibrate);
            navigator.vibrate = this.mocks.vibrate;
        }

        if (navigator.getBattery) {
            this.simulationState.originalValues.set('getBattery', navigator.getBattery);
            (navigator as any).getBattery = this.mocks.getBattery;
        }

        if ((navigator as any).connection) {
            this.simulationState.originalValues.set('connection', (navigator as any).connection);
            (navigator as any).connection = this.mocks.connection;
        }

        this.simulationState.mocksApplied = true;
        console.log('Device mocks applied');
    }

    /**
     * プライベートメソッド: モック削除
     */
    private removeMocks(): void {
        if (!this.simulationState.mocksApplied) {
            return;
        }

        // 元の値を復元
        for (const [key, value] of this.simulationState.originalValues.entries()) {
            try {
                if (key.includes('.')) {
                    const [obj, prop] = key.split('.');
                    (window as any)[obj][prop] = value;
                } else {
                    (navigator as any)[key] = value;
                }
            } catch (error) {
                console.warn(`Failed to restore ${key}:`, error);
            }
        }

        this.simulationState.originalValues.clear();
        this.simulationState.mocksApplied = false;
        console.log('Device mocks removed');
    }

    /**
     * プライベートメソッド: モック更新
     */
    private updateMocks(): void {
        if (!this.simulationState.mocksApplied) {
            return;
        }

        // デバイス情報を更新
        Object.defineProperty(navigator, 'userAgent', {
            value: this.currentDevice.userAgent,
            writable: true
        });

        Object.defineProperty(screen, 'width', {
            value: this.currentDevice.screen.width,
            writable: true
        });

        Object.defineProperty(screen, 'height', {
            value: this.currentDevice.screen.height,
            writable: true
        });

        Object.defineProperty(window, 'devicePixelRatio', {
            value: this.currentDevice.screen.pixelRatio,
            writable: true
        });

        console.log('Device mocks updated');
    }

    /**
     * プライベートメソッド: 向き変更イベント発火
     */
    private triggerOrientationChange(): void {
        const event = new Event('orientationchange');
        window.dispatchEvent(event);
    }

    /**
     * ユーティリティメソッド: タッチイベント作成
     */
    private createTouchEvent(type: string, touches: TouchPoint[]): Event {
        const event = new TouchEvent(type, {
            touches: touches as any,
            targetTouches: touches as any,
            changedTouches: touches as any,
            bubbles: true,
            cancelable: true
        });

        return event;
    }

    /**
     * ユーティリティメソッド: タッチポイント作成
     */
    private createTouch(x: number, y: number, id: number = 0): TouchPoint {
        const target = document.elementFromPoint(x, y) || document.body;

        return {
            identifier: id,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
            screenX: x,
            screenY: y,
            target: target
        };
    }

    /**
     * ユーティリティメソッド: デバイス情報作成
     */
    private createDeviceInfo(device: string): DeviceInfo {
        return this.getDeviceInfo(device);
    }

    /**
     * ユーティリティメソッド: パフォーマンス測定
     */
    private async measurePerformance(testFunction: () => Promise<void>): Promise<number> {
        const startTime = performance.now();
        await testFunction();
        const endTime = performance.now();
        return endTime - startTime;
    }

    /**
     * ユーティリティメソッド: 待機
     */
    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * ユーティリティメソッド: ランダム遅延
     */
    private async randomDelay(min: number, max: number): Promise<void> {
        const delay = Math.random() * (max - min) + min;
        return this.wait(delay);
    }

    // パブリックAPI

    /**
     * 現在のデバイス情報取得
     */
    getCurrentDevice(): CurrentDevice {
        return { ...this.currentDevice };
    }

    /**
     * シミュレーション状態取得
     */
    getSimulationState(): SimulationState {
        return {
            isActive: this.simulationState.isActive,
            mocksApplied: this.simulationState.mocksApplied,
            originalValues: new Map(this.simulationState.originalValues),
            activeListeners: new Map(this.simulationState.activeListeners)
        };
    }

    /**
     * 利用可能デバイス一覧取得
     */
    getAvailableDevices(): string[] {
        return [...this.deviceConfig.devices];
    }

    /**
     * デバッグ情報取得
     */
    getDebugInfo(): DebugInfo {
        return {
            deviceConfig: { ...this.deviceConfig },
            currentDevice: { ...this.currentDevice },
            simulationState: this.getSimulationState(),
            mocksStatus: {
                userAgent: Object.getOwnPropertyDescriptor(navigator, 'userAgent')?.writable || false,
                screen: Object.getOwnPropertyDescriptor(screen, 'width')?.writable || false,
                pixelRatio: Object.getOwnPropertyDescriptor(window, 'devicePixelRatio')?.writable || false,
                vibrate: typeof navigator.vibrate === 'function',
                battery: typeof (navigator as any).getBattery === 'function',
                connection: !!(navigator as any).connection
            }
        };
    }

    /**
     * リセット
     */
    reset(): void {
        if (this.simulationState.isActive) {
            this.stopSimulation();
        }

        // デフォルトデバイスに戻す
        this.currentDevice = {
            name: 'iPhone 12',
            screen: {
                width: 390,
                height: 844,
                pixelRatio: 3
            },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            orientation: 'portrait',
            battery: {
                level: 0.8,
                charging: false
            },
            connection: {
                type: 'wifi',
                effectiveType: '4g'
            }
        };

        console.log('MobileDeviceSimulator reset to default state');
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.stopSimulation();
        this.simulationState.activeListeners.clear();
        this.simulationState.originalValues.clear();
        
        console.log('MobileDeviceSimulator destroyed');
    }
}