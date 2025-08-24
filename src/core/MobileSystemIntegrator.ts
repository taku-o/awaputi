/**
 * MobileSystemIntegrator - モバイルシステム統合・エラーハンドリング強化
 * 全モバイル機能の統合テストを実施
 * モバイル固有エラーハンドリングを実装
 * フォールバック機能とグレースフルデグラデーションを追加
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface IntegrationConfig {
    components: string[];
    errorRecovery: {
        enabled: boolean;
        maxRetries: number;
        retryDelay: number;
        fallbackMode: boolean;
        gracefulDegradation: boolean;
    };
    healthCheck: {
        interval: number;
        enabled: boolean;
        autoRepair: boolean;
    };
    monitoring: {
        performanceThresholds: {
            maxInitTime: number;
            maxResponseTime: number;
            maxMemoryUsage: number;
            minFPS: number;
        };
        errorThresholds: {
            maxErrorsPerMinute: number;
            maxCriticalErrors: number;
        };
    };
}

interface SystemState {
    initialized: boolean;
    loading: boolean;
    errors: any[];
    warnings: any[];
    performance: Map<string, any>;
    components: Map<string, any>;
    lastHealthCheck: Date | null;
}

interface ComponentInfo {
    instance: any;
    initialized: boolean;
    status: 'active' | 'inactive' | 'error';
    lastError: Error | null;
    retryCount: number;
}

interface PerformanceMetrics {
    initTime: number;
    responseTime: number;
    memoryUsage: number;
    fps: number;
    errorRate: number;
}

export class MobileSystemIntegrator {
    private gameEngine: any;
    private errorHandler: any;
    private integrationConfig: IntegrationConfig;
    private mobileComponents: Map<string, ComponentInfo>;
    private systemState: SystemState;
    private errorHandlers: Map<string, Function>;
    private fallbackStrategies: Map<string, Function>;
    private debugMode: boolean;
    private performanceMonitor: any | null;
    private errorAnalyzer: any | null;
    private healthCheckInterval: NodeJS.Timeout | null = null;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
        // モバイルシステム構成
        this.integrationConfig = {
            components: [
                'DeviceSpecificHandler',
                'EnhancedTouchManager',
                'AdvancedResponsiveLayoutManager',
                'MobilePerformanceOptimizer',
                'AdvancedGestureRecognitionSystem',
                'MobileUIUXManager',
                'MobileAccessibilityManager',
                'PWAManager'
            ],
            errorRecovery: {
                enabled: true,
                maxRetries: 3,
                retryDelay: 1000,
                fallbackMode: true,
                gracefulDegradation: true
            },
            healthCheck: {
                interval: 30000, // 30秒間隔
                enabled: true,
                autoRepair: true
            },
            monitoring: {
                performanceThresholds: {
                    maxInitTime: 5000,
                    maxResponseTime: 100,
                    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
                    minFPS: 30
                },
                errorThresholds: {
                    maxErrorsPerMinute: 10,
                    maxCriticalErrors: 3
                }
            }
        };

        // システム状態
        this.systemState = {
            initialized: false,
            loading: false,
            errors: [],
            warnings: [],
            performance: new Map(),
            components: new Map(),
            lastHealthCheck: null
        };

        // コンポーネント情報
        this.mobileComponents = new Map();

        // エラーハンドリング
        this.errorHandlers = new Map();
        this.fallbackStrategies = new Map();
        
        // デバッグ・監視機能
        this.debugMode = false;
        this.performanceMonitor = null;
        this.errorAnalyzer = null;
        
        this.initialize();
    }
    
    /**
     * システム統合初期化
     */
    public async initialize(): Promise<void> {
        try {
            console.log('[MobileSystemIntegrator] モバイルシステム統合開始');
            
            this.systemState.loading = true;
            const startTime = performance.now();
            
            // 統合前検証
            await this.preIntegrationValidation();
            
            // コンポーネント読み込み・初期化
            await this.loadMobileComponents();
            
            // システム統合
            await this.integrateComponents();
            
            // エラーハンドリング設定
            this.setupMobileErrorHandling();
            
            // 監視システム開始
            this.startMonitoring();
            
            // 統合後検証
            await this.postIntegrationValidation();
            
            const initTime = performance.now() - startTime;
            this.systemState.initialized = true;
            this.systemState.loading = false;
            
            console.log(`[MobileSystemIntegrator] モバイルシステム統合完了 (${initTime.toFixed(2)}ms)`);
            
            // 初期化時間が閾値を超えた場合の警告
            if (initTime > this.integrationConfig.monitoring.performanceThresholds.maxInitTime) {
                this.reportPerformanceWarning('initialization', initTime);
            }

        } catch (error) {
            this.systemState.loading = false;
            this.handleCriticalError('system-integration', error as Error);
            throw error;
        }
    }
    
    /**
     * 統合前検証
     */
    private async preIntegrationValidation(): Promise<void> {
        console.log('[MobileSystemIntegrator] 統合前検証開始');
        
        // デバイス互換性チェック
        await this.checkDeviceCompatibility();
        
        // 必要なAPI利用可能性チェック
        await this.checkAPIAvailability();
        
        // システムリソースチェック
        await this.checkSystemResources();
        
        console.log('[MobileSystemIntegrator] 統合前検証完了');
    }
    
    /**
     * デバイス互換性チェック
     */
    private async checkDeviceCompatibility(): Promise<void> {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            touchSupport: 'ontouchstart' in window,
            orientationSupport: 'orientation' in window,
            devicePixelRatio: window.devicePixelRatio || 1
        };
        
        // モバイルデバイスの検出
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
            this.addWarning('device-compatibility', 'Desktop environment detected, mobile features may not work optimally');
        }
        
        // タッチサポートチェック
        if (!deviceInfo.touchSupport) {
            this.addWarning('touch-support', 'Touch events not supported');
        }
        
        this.systemState.components.set('deviceInfo', deviceInfo);
    }
    
    /**
     * API利用可能性チェック
     */
    private async checkAPIAvailability(): Promise<void> {
        const apis = {
            ServiceWorker: 'serviceWorker' in navigator,
            Notification: 'Notification' in window,
            Geolocation: 'geolocation' in navigator,
            DeviceOrientation: 'DeviceOrientationEvent' in window,
            DeviceMotion: 'DeviceMotionEvent' in window,
            Vibration: 'vibrate' in navigator,
            Battery: 'getBattery' in navigator,
            NetworkInformation: 'connection' in navigator,
            PointerEvents: 'PointerEvent' in window,
            TouchEvents: 'TouchEvent' in window
        };
        
        const unavailableAPIs: string[] = [];
        
        Object.entries(apis).forEach(([api, available]) => {
            if (!available) {
                unavailableAPIs.push(api);
            }
        });
        
        if (unavailableAPIs.length > 0) {
            this.addWarning('api-availability', `APIs not available: ${unavailableAPIs.join(', ')}`);
        }
        
        this.systemState.components.set('availableAPIs', apis);
    }
    
    /**
     * システムリソースチェック
     */
    private async checkSystemResources(): Promise<void> {
        const performance = (window as any).performance;
        let memoryInfo = null;
        
        if (performance && performance.memory) {
            memoryInfo = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        // バッテリー情報の取得（利用可能な場合）
        let batteryInfo = null;
        if ('getBattery' in navigator) {
            try {
                const battery = await (navigator as any).getBattery();
                batteryInfo = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            } catch (error) {
                console.warn('Battery API not available:', error);
            }
        }
        
        // ネットワーク情報の取得
        let networkInfo = null;
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        
        this.systemState.components.set('systemResources', {
            memory: memoryInfo,
            battery: batteryInfo,
            network: networkInfo
        });
    }
    
    /**
     * モバイルコンポーネント読み込み
     */
    private async loadMobileComponents(): Promise<void> {
        console.log('[MobileSystemIntegrator] モバイルコンポーネント読み込み開始');
        
        const loadPromises = this.integrationConfig.components.map(async (componentName) => {
            try {
                const componentInfo: ComponentInfo = {
                    instance: null,
                    initialized: false,
                    status: 'inactive',
                    lastError: null,
                    retryCount: 0
                };
                
                // コンポーネントの動的インポート（実際の実装では適切なパスを使用）
                const ComponentClass = await this.dynamicImport(componentName);
                
                if (ComponentClass) {
                    componentInfo.instance = new ComponentClass(this.gameEngine);
                    componentInfo.status = 'active';
                    console.log(`[MobileSystemIntegrator] ${componentName} 読み込み完了`);
                } else {
                    throw new Error(`Component ${componentName} not found`);
                }
                
                this.mobileComponents.set(componentName, componentInfo);
                
            } catch (error) {
                console.error(`[MobileSystemIntegrator] ${componentName} 読み込み失敗:`, error);
                this.mobileComponents.set(componentName, {
                    instance: null,
                    initialized: false,
                    status: 'error',
                    lastError: error as Error,
                    retryCount: 0
                });
                this.addError('component-load', error as Error, componentName);
            }
        });
        
        await Promise.allSettled(loadPromises);
        console.log('[MobileSystemIntegrator] モバイルコンポーネント読み込み完了');
    }
    
    /**
     * 動的インポート（モックアップ）
     */
    private async dynamicImport(componentName: string): Promise<any | null> {
        try {
            // 実際の実装では適切なパスとモジュール構造を使用
            switch (componentName) {
                case 'DeviceSpecificHandler':
                    // return (await import('./mobile/DeviceSpecificHandler.js')).DeviceSpecificHandler;
                    return null; // 一時的なモックアップ
                case 'EnhancedTouchManager':
                    // return (await import('./mobile/EnhancedTouchManager.js')).EnhancedTouchManager;
                    return null;
                case 'AdvancedResponsiveLayoutManager':
                    // return (await import('./mobile/AdvancedResponsiveLayoutManager.js')).AdvancedResponsiveLayoutManager;
                    return null;
                case 'MobilePerformanceOptimizer':
                    // return (await import('./mobile/MobilePerformanceOptimizer.js')).MobilePerformanceOptimizer;
                    return null;
                case 'AdvancedGestureRecognitionSystem':
                    // return (await import('./mobile/AdvancedGestureRecognitionSystem.js')).AdvancedGestureRecognitionSystem;
                    return null;
                case 'MobileUIUXManager':
                    // return (await import('./MobileUIUXManager.js')).MobileUIUXManager;
                    return null;
                case 'MobileAccessibilityManager':
                    // return (await import('./MobileAccessibilityManager.js')).MobileAccessibilityManager;
                    return null;
                case 'PWAManager':
                    // return (await import('./mobile/PWAManager.js')).PWAManager;
                    return null;
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Failed to import ${componentName}:`, error);
            return null;
        }
    }
    
    /**
     * コンポーネント統合
     */
    private async integrateComponents(): Promise<void> {
        console.log('[MobileSystemIntegrator] コンポーネント統合開始');
        
        // 依存関係順でコンポーネントを初期化
        const initializationOrder = [
            'DeviceSpecificHandler',
            'EnhancedTouchManager',
            'AdvancedResponsiveLayoutManager',
            'MobilePerformanceOptimizer',
            'AdvancedGestureRecognitionSystem',
            'MobileUIUXManager',
            'MobileAccessibilityManager',
            'PWAManager'
        ];
        
        for (const componentName of initializationOrder) {
            await this.initializeComponent(componentName);
        }
        
        // 相互接続の設定
        await this.setupComponentConnections();
        
        console.log('[MobileSystemIntegrator] コンポーネント統合完了');
    }
    
    /**
     * 単一コンポーネント初期化
     */
    private async initializeComponent(componentName: string): Promise<void> {
        const componentInfo = this.mobileComponents.get(componentName);
        
        if (!componentInfo || !componentInfo.instance) {
            console.warn(`[MobileSystemIntegrator] ${componentName} not loaded, skipping initialization`);
            return;
        }
        
        try {
            // コンポーネントに初期化メソッドがある場合は呼び出し
            if (typeof componentInfo.instance.initialize === 'function') {
                await componentInfo.instance.initialize();
            }
            
            componentInfo.initialized = true;
            componentInfo.status = 'active';
            componentInfo.lastError = null;
            
            console.log(`[MobileSystemIntegrator] ${componentName} 初期化完了`);
            
        } catch (error) {
            componentInfo.status = 'error';
            componentInfo.lastError = error as Error;
            componentInfo.retryCount++;
            
            console.error(`[MobileSystemIntegrator] ${componentName} 初期化失敗:`, error);
            this.addError('component-init', error as Error, componentName);
            
            // リトライロジック
            if (this.integrationConfig.errorRecovery.enabled && 
                componentInfo.retryCount < this.integrationConfig.errorRecovery.maxRetries) {
                
                setTimeout(() => {
                    this.initializeComponent(componentName);
                }, this.integrationConfig.errorRecovery.retryDelay);
            }
        }
    }
    
    /**
     * コンポーネント間接続設定
     */
    private async setupComponentConnections(): Promise<void> {
        // タッチマネージャーとジェスチャー認識の連携
        const touchManager = this.mobileComponents.get('EnhancedTouchManager')?.instance;
        const gestureRecognition = this.mobileComponents.get('AdvancedGestureRecognitionSystem')?.instance;
        
        if (touchManager && gestureRecognition) {
            touchManager.setGestureRecognizer(gestureRecognition);
        }
        
        // UIUXマネージャーとアクセシビリティマネージャーの連携
        const uiuxManager = this.mobileComponents.get('MobileUIUXManager')?.instance;
        const accessibilityManager = this.mobileComponents.get('MobileAccessibilityManager')?.instance;
        
        if (uiuxManager && accessibilityManager) {
            uiuxManager.setAccessibilityManager(accessibilityManager);
        }
        
        // パフォーマンスオプティマイザーと他コンポーネントの連携
        const performanceOptimizer = this.mobileComponents.get('MobilePerformanceOptimizer')?.instance;
        
        if (performanceOptimizer) {
            this.mobileComponents.forEach((componentInfo, name) => {
                if (componentInfo.instance && name !== 'MobilePerformanceOptimizer') {
                    performanceOptimizer.addMonitoredComponent(componentInfo.instance);
                }
            });
        }
    }
    
    /**
     * モバイル専用エラーハンドリング設定
     */
    private setupMobileErrorHandling(): void {
        console.log('[MobileSystemIntegrator] モバイルエラーハンドリング設定');
        
        // デバイス固有エラーハンドラー
        this.errorHandlers.set('device-orientation', this.handleOrientationError.bind(this));
        this.errorHandlers.set('touch-events', this.handleTouchError.bind(this));
        this.errorHandlers.set('gesture-recognition', this.handleGestureError.bind(this));
        this.errorHandlers.set('performance-degradation', this.handlePerformanceError.bind(this));
        this.errorHandlers.set('network-connectivity', this.handleNetworkError.bind(this));
        
        // フォールバック戦略の設定
        this.fallbackStrategies.set('touch-input', this.enableMouseFallback.bind(this));
        this.fallbackStrategies.set('gesture-input', this.enableBasicTouchFallback.bind(this));
        this.fallbackStrategies.set('orientation-lock', this.enableOrientationFallback.bind(this));
        this.fallbackStrategies.set('performance-mode', this.enableLowPerformanceMode.bind(this));
        
        // グローバルエラーハンドラーの設定
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
        
        // モバイル固有イベントのエラーハンドリング
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        window.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    /**
     * 監視システム開始
     */
    private startMonitoring(): void {
        if (this.integrationConfig.healthCheck.enabled) {
            this.healthCheckInterval = setInterval(() => {
                this.performHealthCheck();
            }, this.integrationConfig.healthCheck.interval);
        }
        
        // パフォーマンス監視の開始
        this.startPerformanceMonitoring();
        
        console.log('[MobileSystemIntegrator] 監視システム開始');
    }
    
    /**
     * ヘルスチェック実行
     */
    private async performHealthCheck(): Promise<void> {
        const healthReport = {
            timestamp: new Date(),
            components: {} as { [key: string]: any },
            systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical',
            recommendations: [] as string[]
        };
        
        // 各コンポーネントのヘルスチェック
        for (const [name, componentInfo] of this.mobileComponents.entries()) {
            if (componentInfo.instance && typeof componentInfo.instance.getHealthStatus === 'function') {
                try {
                    const status = await componentInfo.instance.getHealthStatus();
                    healthReport.components[name] = status;
                } catch (error) {
                    healthReport.components[name] = {
                        status: 'error',
                        error: (error as Error).message
                    };
                    componentInfo.status = 'error';
                    componentInfo.lastError = error as Error;
                }
            } else {
                healthReport.components[name] = {
                    status: componentInfo.status,
                    initialized: componentInfo.initialized,
                    retryCount: componentInfo.retryCount
                };
            }
        }
        
        // システム全体のヘルス判定
        const errorCount = Object.values(healthReport.components)
            .filter(status => status.status === 'error').length;
            
        if (errorCount >= 3) {
            healthReport.systemHealth = 'critical';
            healthReport.recommendations.push('多数のコンポーネントでエラーが発生しています。システムの再起動を検討してください。');
        } else if (errorCount > 0) {
            healthReport.systemHealth = 'warning';
            healthReport.recommendations.push('一部のコンポーネントでエラーが発生しています。');
        }
        
        // 自動修復の実行
        if (this.integrationConfig.healthCheck.autoRepair && healthReport.systemHealth !== 'healthy') {
            await this.attemptAutoRepair(healthReport);
        }
        
        this.systemState.lastHealthCheck = healthReport.timestamp;
        
        if (this.debugMode) {
            console.log('[MobileSystemIntegrator] Health Check:', healthReport);
        }
    }
    
    /**
     * 自動修復試行
     */
    private async attemptAutoRepair(healthReport: any): Promise<void> {
        console.log('[MobileSystemIntegrator] 自動修復開始');
        
        for (const [componentName, status] of Object.entries(healthReport.components)) {
            if ((status as any).status === 'error') {
                const componentInfo = this.mobileComponents.get(componentName);
                if (componentInfo && componentInfo.retryCount < this.integrationConfig.errorRecovery.maxRetries) {
                    console.log(`[MobileSystemIntegrator] ${componentName} 自動修復試行`);
                    await this.initializeComponent(componentName);
                }
            }
        }
    }
    
    /**
     * パフォーマンス監視開始
     */
    private startPerformanceMonitoring(): void {
        // FPS監視
        let lastTime = performance.now();
        let frameCount = 0;
        
        const monitorFPS = (currentTime: number) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                
                if (fps < this.integrationConfig.monitoring.performanceThresholds.minFPS) {
                    this.reportPerformanceWarning('fps', fps);
                }
                
                this.systemState.performance.set('fps', fps);
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitorFPS);
        };
        
        requestAnimationFrame(monitorFPS);
        
        // メモリ使用量監視
        setInterval(() => {
            if ((window as any).performance && (window as any).performance.memory) {
                const memory = (window as any).performance.memory;
                const memoryUsage = memory.usedJSHeapSize;
                
                if (memoryUsage > this.integrationConfig.monitoring.performanceThresholds.maxMemoryUsage) {
                    this.reportPerformanceWarning('memory', memoryUsage);
                }
                
                this.systemState.performance.set('memory', {
                    used: memoryUsage,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                });
            }
        }, 5000);
    }
    
    /**
     * 統合後検証
     */
    private async postIntegrationValidation(): Promise<void> {
        console.log('[MobileSystemIntegrator] 統合後検証開始');
        
        const validationResults = {
            componentCount: this.mobileComponents.size,
            activeComponents: 0,
            errorComponents: 0,
            warnings: [] as string[]
        };
        
        // コンポーネント状態チェック
        this.mobileComponents.forEach((componentInfo, name) => {
            if (componentInfo.status === 'active' && componentInfo.initialized) {
                validationResults.activeComponents++;
            } else if (componentInfo.status === 'error') {
                validationResults.errorComponents++;
                validationResults.warnings.push(`${name}: ${componentInfo.lastError?.message}`);
            }
        });
        
        // システム機能テスト
        await this.runSystemFunctionTests();
        
        console.log('[MobileSystemIntegrator] 統合後検証完了:', validationResults);
        
        if (validationResults.errorComponents > 0) {
            console.warn(`[MobileSystemIntegrator] ${validationResults.errorComponents} コンポーネントでエラーが発生`);
        }
    }
    
    /**
     * システム機能テスト実行
     */
    private async runSystemFunctionTests(): Promise<void> {
        const tests = [
            this.testTouchResponsiveness,
            this.testOrientationHandling,
            this.testPerformanceBaseline,
            this.testErrorRecovery
        ];
        
        for (const test of tests) {
            try {
                await test.call(this);
            } catch (error) {
                this.addError('system-test', error as Error);
            }
        }
    }
    
    /**
     * タッチ応答性テスト
     */
    private async testTouchResponsiveness(): Promise<void> {
        const touchManager = this.mobileComponents.get('EnhancedTouchManager')?.instance;
        
        if (touchManager && typeof touchManager.testResponsiveness === 'function') {
            const responseTime = await touchManager.testResponsiveness();
            
            if (responseTime > this.integrationConfig.monitoring.performanceThresholds.maxResponseTime) {
                this.reportPerformanceWarning('touch-response', responseTime);
            }
        }
    }
    
    /**
     * 方向転換処理テスト
     */
    private async testOrientationHandling(): Promise<void> {
        const layoutManager = this.mobileComponents.get('AdvancedResponsiveLayoutManager')?.instance;
        
        if (layoutManager && typeof layoutManager.testOrientation === 'function') {
            await layoutManager.testOrientation();
        }
    }
    
    /**
     * パフォーマンスベースラインテスト
     */
    private async testPerformanceBaseline(): Promise<void> {
        const performanceOptimizer = this.mobileComponents.get('MobilePerformanceOptimizer')?.instance;
        
        if (performanceOptimizer && typeof performanceOptimizer.runPerformanceTest === 'function') {
            const metrics = await performanceOptimizer.runPerformanceTest();
            this.systemState.performance.set('baseline', metrics);
        }
    }
    
    /**
     * エラー回復テスト
     */
    private async testErrorRecovery(): Promise<void> {
        // 意図的なエラーを発生させて回復機能をテスト
        try {
            throw new Error('Test error for recovery validation');
        } catch (error) {
            const recovered = await this.handleError('test-error', error as Error);
            
            if (!recovered) {
                this.addWarning('error-recovery', 'Error recovery test failed');
            }
        }
    }
    
    // ========================================
    // エラーハンドリングメソッド
    // ========================================
    
    /**
     * エラー処理
     */
    private async handleError(errorType: string, error: Error, context?: string): Promise<boolean> {
        const errorHandler = this.errorHandlers.get(errorType);
        
        if (errorHandler) {
            try {
                return await errorHandler(error, context);
            } catch (handlerError) {
                console.error(`Error handler for ${errorType} failed:`, handlerError);
            }
        }
        
        // デフォルトエラー処理
        return this.handleDefaultError(errorType, error, context);
    }
    
    /**
     * デフォルトエラー処理
     */
    private async handleDefaultError(errorType: string, error: Error, context?: string): Promise<boolean> {
        this.addError(errorType, error, context);
        
        if (this.integrationConfig.errorRecovery.fallbackMode) {
            const fallbackStrategy = this.fallbackStrategies.get(errorType);
            
            if (fallbackStrategy) {
                try {
                    await fallbackStrategy(error, context);
                    return true;
                } catch (fallbackError) {
                    console.error(`Fallback strategy for ${errorType} failed:`, fallbackError);
                }
            }
        }
        
        return false;
    }
    
    /**
     * 方向転換エラーハンドリング
     */
    private async handleOrientationError(error: Error, context?: string): Promise<boolean> {
        console.warn('[MobileSystemIntegrator] Orientation error:', error);
        
        // 方向転換の強制処理
        const layoutManager = this.mobileComponents.get('AdvancedResponsiveLayoutManager')?.instance;
        
        if (layoutManager && typeof layoutManager.forceLayout === 'function') {
            try {
                await layoutManager.forceLayout();
                return true;
            } catch (layoutError) {
                console.error('Force layout failed:', layoutError);
            }
        }
        
        return false;
    }
    
    /**
     * タッチエラーハンドリング
     */
    private async handleTouchError(error: Error, context?: string): Promise<boolean> {
        console.warn('[MobileSystemIntegrator] Touch error:', error);
        
        // タッチマネージャーのリセット
        const touchManager = this.mobileComponents.get('EnhancedTouchManager')?.instance;
        
        if (touchManager && typeof touchManager.reset === 'function') {
            try {
                await touchManager.reset();
                return true;
            } catch (resetError) {
                console.error('Touch manager reset failed:', resetError);
            }
        }
        
        return false;
    }
    
    /**
     * ジェスチャー認識エラーハンドリング
     */
    private async handleGestureError(error: Error, context?: string): Promise<boolean> {
        console.warn('[MobileSystemIntegrator] Gesture error:', error);
        
        // ジェスチャー認識システムの再初期化
        const gestureSystem = this.mobileComponents.get('AdvancedGestureRecognitionSystem')?.instance;
        
        if (gestureSystem && typeof gestureSystem.recalibrate === 'function') {
            try {
                await gestureSystem.recalibrate();
                return true;
            } catch (calibrationError) {
                console.error('Gesture system calibration failed:', calibrationError);
            }
        }
        
        return false;
    }
    
    /**
     * パフォーマンスエラーハンドリング
     */
    private async handlePerformanceError(error: Error, context?: string): Promise<boolean> {
        console.warn('[MobileSystemIntegrator] Performance error:', error);
        
        // 低パフォーマンスモードの有効化
        await this.enableLowPerformanceMode();
        
        return true;
    }
    
    /**
     * ネットワークエラーハンドリング
     */
    private async handleNetworkError(error: Error, context?: string): Promise<boolean> {
        console.warn('[MobileSystemIntegrator] Network error:', error);
        
        // オフラインモードへの切り替え
        const pwaManager = this.mobileComponents.get('PWAManager')?.instance;
        
        if (pwaManager && typeof pwaManager.enableOfflineMode === 'function') {
            try {
                await pwaManager.enableOfflineMode();
                return true;
            } catch (offlineError) {
                console.error('Offline mode activation failed:', offlineError);
            }
        }
        
        return false;
    }
    
    // ========================================
    // フォールバック戦略
    // ========================================
    
    /**
     * マウスフォールバック有効化
     */
    private async enableMouseFallback(): Promise<void> {
        console.log('[MobileSystemIntegrator] マウスフォールバック有効化');
        
        // マウスイベントをタッチイベントにマッピング
        document.addEventListener('mousedown', this.mouseToTouchHandler.bind(this));
        document.addEventListener('mousemove', this.mouseToTouchHandler.bind(this));
        document.addEventListener('mouseup', this.mouseToTouchHandler.bind(this));
    }
    
    /**
     * 基本タッチフォールバック有効化
     */
    private async enableBasicTouchFallback(): Promise<void> {
        console.log('[MobileSystemIntegrator] 基本タッチフォールバック有効化');
        
        // 複雑なジェスチャーを基本的なタッチ操作に置換
        const gestureSystem = this.mobileComponents.get('AdvancedGestureRecognitionSystem')?.instance;
        
        if (gestureSystem && typeof gestureSystem.enableBasicMode === 'function') {
            await gestureSystem.enableBasicMode();
        }
    }
    
    /**
     * 方向転換フォールバック有効化
     */
    private async enableOrientationFallback(): Promise<void> {
        console.log('[MobileSystemIntegrator] 方向転換フォールバック有効化');
        
        // 方向固定モードの有効化
        if (screen.orientation && screen.orientation.lock) {
            try {
                await screen.orientation.lock('portrait-primary');
            } catch (lockError) {
                console.warn('Screen orientation lock failed:', lockError);
            }
        }
    }
    
    /**
     * 低パフォーマンスモード有効化
     */
    private async enableLowPerformanceMode(): Promise<void> {
        console.log('[MobileSystemIntegrator] 低パフォーマンスモード有効化');
        
        // 各コンポーネントに低パフォーマンスモードを通知
        this.mobileComponents.forEach((componentInfo, name) => {
            if (componentInfo.instance && typeof componentInfo.instance.enableLowPerformanceMode === 'function') {
                componentInfo.instance.enableLowPerformanceMode();
            }
        });
    }
    
    // ========================================
    // イベントハンドラー
    // ========================================
    
    /**
     * マウス→タッチイベント変換
     */
    private mouseToTouchHandler(event: MouseEvent): void {
        const touchEventType = {
            'mousedown': 'touchstart',
            'mousemove': 'touchmove',
            'mouseup': 'touchend'
        }[event.type];
        
        if (touchEventType) {
            const touchEvent = new TouchEvent(touchEventType, {
                touches: touchEventType === 'touchend' ? [] : [{
                    identifier: 0,
                    target: event.target as Element,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY,
                    screenX: event.screenX,
                    screenY: event.screenY
                }] as Touch[],
                bubbles: true,
                cancelable: true
            });
            
            event.target?.dispatchEvent(touchEvent);
        }
    }
    
    /**
     * グローバルエラーハンドラー
     */
    private handleGlobalError(event: ErrorEvent): void {
        this.handleError('global-error', new Error(event.message));
    }
    
    /**
     * 未処理Promise拒否ハンドラー
     */
    private handleUnhandledRejection(event: PromiseRejectionEvent): void {
        this.handleError('unhandled-rejection', new Error(String(event.reason)));
    }
    
    /**
     * 方向転換ハンドラー
     */
    private handleOrientationChange(): void {
        setTimeout(() => {
            // 方向転換後の処理
            this.mobileComponents.forEach((componentInfo, name) => {
                if (componentInfo.instance && typeof componentInfo.instance.onOrientationChange === 'function') {
                    componentInfo.instance.onOrientationChange();
                }
            });
        }, 100);
    }
    
    /**
     * 可視性変更ハンドラー
     */
    private handleVisibilityChange(): void {
        if (document.hidden) {
            // バックグラウンドに移行
            this.mobileComponents.forEach((componentInfo, name) => {
                if (componentInfo.instance && typeof componentInfo.instance.onPause === 'function') {
                    componentInfo.instance.onPause();
                }
            });
        } else {
            // フォアグラウンドに復帰
            this.mobileComponents.forEach((componentInfo, name) => {
                if (componentInfo.instance && typeof componentInfo.instance.onResume === 'function') {
                    componentInfo.instance.onResume();
                }
            });
        }
    }
    
    // ========================================
    // ユーティリティメソッド
    // ========================================
    
    /**
     * エラーの追加
     */
    private addError(type: string, error: Error, context?: string): void {
        const errorEntry = {
            timestamp: new Date(),
            type,
            message: error.message,
            stack: error.stack,
            context
        };
        
        this.systemState.errors.push(errorEntry);
        
        // エラー上限チェック
        if (this.systemState.errors.length > 100) {
            this.systemState.errors = this.systemState.errors.slice(-50);
        }
        
        this.errorHandler.handleError(error, `MobileSystemIntegrator.${type}${context ? '.' + context : ''}`);
    }
    
    /**
     * 警告の追加
     */
    private addWarning(type: string, message: string, context?: string): void {
        const warningEntry = {
            timestamp: new Date(),
            type,
            message,
            context
        };
        
        this.systemState.warnings.push(warningEntry);
        
        // 警告上限チェック
        if (this.systemState.warnings.length > 50) {
            this.systemState.warnings = this.systemState.warnings.slice(-25);
        }
        
        console.warn(`[MobileSystemIntegrator] Warning (${type}): ${message}${context ? ` [${context}]` : ''}`);
    }
    
    /**
     * パフォーマンス警告の報告
     */
    private reportPerformanceWarning(metric: string, value: number): void {
        this.addWarning('performance', `${metric} threshold exceeded: ${value}`, metric);
        
        // 自動最適化の試行
        if (this.integrationConfig.errorRecovery.gracefulDegradation) {
            this.enableLowPerformanceMode();
        }
    }
    
    /**
     * 重大エラーの処理
     */
    private handleCriticalError(type: string, error: Error): void {
        console.error(`[MobileSystemIntegrator] Critical Error (${type}):`, error);
        
        this.addError(type, error);
        
        // 緊急時の処理
        this.mobileComponents.forEach((componentInfo, name) => {
            if (componentInfo.instance && typeof componentInfo.instance.emergencyShutdown === 'function') {
                try {
                    componentInfo.instance.emergencyShutdown();
                } catch (shutdownError) {
                    console.error(`Emergency shutdown failed for ${name}:`, shutdownError);
                }
            }
        });
    }
    
    // ========================================
    // 公開API
    // ========================================
    
    /**
     * システム状態の取得
     */
    public getSystemState(): SystemState {
        return { ...this.systemState };
    }
    
    /**
     * コンポーネント情報の取得
     */
    public getComponentInfo(componentName: string): ComponentInfo | undefined {
        return this.mobileComponents.get(componentName);
    }
    
    /**
     * パフォーマンスメトリクスの取得
     */
    public getPerformanceMetrics(): PerformanceMetrics {
        return {
            initTime: this.systemState.performance.get('initTime') || 0,
            responseTime: this.systemState.performance.get('responseTime') || 0,
            memoryUsage: this.systemState.performance.get('memory')?.used || 0,
            fps: this.systemState.performance.get('fps') || 0,
            errorRate: this.systemState.errors.length / Math.max(1, 
                (Date.now() - (this.systemState.lastHealthCheck?.getTime() || Date.now())) / 60000
            )
        };
    }
    
    /**
     * デバッグモードの切り替え
     */
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
        console.log(`[MobileSystemIntegrator] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * コンポーネントの手動初期化
     */
    public async reinitializeComponent(componentName: string): Promise<boolean> {
        try {
            await this.initializeComponent(componentName);
            return true;
        } catch (error) {
            console.error(`Manual reinitialization of ${componentName} failed:`, error);
            return false;
        }
    }
    
    /**
     * システムの再起動
     */
    public async restart(): Promise<void> {
        console.log('[MobileSystemIntegrator] システム再起動開始');
        
        // 既存コンポーネントのクリーンアップ
        this.dispose();
        
        // 状態リセット
        this.systemState = {
            initialized: false,
            loading: false,
            errors: [],
            warnings: [],
            performance: new Map(),
            components: new Map(),
            lastHealthCheck: null
        };
        
        this.mobileComponents.clear();
        
        // 再初期化
        await this.initialize();
    }
    
    /**
     * クリーンアップ
     */
    public dispose(): void {
        console.log('[MobileSystemIntegrator] クリーンアップ開始');
        
        // ヘルスチェック停止
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        
        // イベントリスナーの削除
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 各コンポーネントのクリーンアップ
        this.mobileComponents.forEach((componentInfo, name) => {
            if (componentInfo.instance && typeof componentInfo.instance.dispose === 'function') {
                try {
                    componentInfo.instance.dispose();
                } catch (error) {
                    console.error(`Disposal of ${name} failed:`, error);
                }
            }
        });
        
        this.mobileComponents.clear();
        this.errorHandlers.clear();
        this.fallbackStrategies.clear();
        
        this.systemState.initialized = false;
        
        console.log('[MobileSystemIntegrator] クリーンアップ完了');
    }
}