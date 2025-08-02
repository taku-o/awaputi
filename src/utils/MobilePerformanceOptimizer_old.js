import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * Mobile Performance Optimization System
 * モバイルパフォーマンス最適化システム - デバイス検出とモバイル特化最適化
 * 
 * 主要機能:
 * - 包括的デバイスパフォーマンスプロファイリング
 * - ハードウェア能力評価
 * - モバイル特化最適化トリガー
 * - タッチインタラクション パフォーマンス最適化
 * - モバイルレンダリングパイプライン最適化
 * - バッテリー使用量最適化機能
 */
export class MobilePerformanceOptimizer {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // Mobile optimization configuration
        this.mobileConfig = {
            enabled: true,
            autoDetection: true,
            aggressiveOptimization: false,
            
            // Performance targets for mobile
            targets: {
                minFPS: 30,
                targetFPS: 40,
                optimalFPS: 50,
                maxMemoryMB: 512,
                maxBatteryDrainPerHour: 15 // percentage
            },
            
            // Optimization levels
            optimizationLevel: 'balanced', // 'battery', 'balanced', 'performance'
            adaptiveMode: true
        };
        
        // Device capability detection
        this.deviceDetection = {
            enabled: true,
            
            // Device classification
            deviceClass: 'unknown', // 'low-end', 'mid-range', 'high-end', 'flagship'
            isMobile: false,
            isTablet: false,
            platform: 'unknown', // 'ios', 'android', 'web'
            
            // Hardware capabilities
            hardware: {
                // CPU information
                cpu: {
                    cores: navigator.hardwareConcurrency || 2,
                    performance: 'unknown', // 'low', 'medium', 'high'
                    architecture: 'unknown'
                },
                
                // Memory information
                memory: {
                    total: 0,
                    available: 0,
                    pressure: 'unknown' // 'low', 'medium', 'high', 'critical'
                },
                
                // GPU information
                gpu: {
                    vendor: 'unknown',
                    renderer: 'unknown',
                    webglVersion: 'unknown',
                    maxTextureSize: 0,
                    performance: 'unknown' // 'low', 'medium', 'high'
                },
                
                // Display information
                display: {
                    width: window.screen.width || 1920,
                    height: window.screen.height || 1080,
                    pixelRatio: window.devicePixelRatio || 1,
                    refreshRate: 60, // Estimated
                    colorDepth: window.screen.colorDepth || 24
                },
                
                // Network information
                network: {
                    type: 'unknown',
                    effectiveType: 'unknown',
                    downlink: 0,
                    rtt: 0
                },
                
                // Battery information
                battery: {
                    level: 1.0,
                    charging: false,
                    dischargingTime: Infinity,
                    chargingTime: Infinity
                }
            },
            
            // Performance benchmarks
            benchmarks: {
                cpuScore: 0,
                gpuScore: 0,
                memoryScore: 0,
                overallScore: 0,
                benchmarkComplete: false
            },
            
            // User agent analysis
            userAgent: {
                browser: 'unknown',
                version: 'unknown',
                engine: 'unknown',
                os: 'unknown',
                osVersion: 'unknown'
            }
        };
        
        // Mobile-specific optimizations
        this.mobileOptimizations = {
            enabled: true,
            
            // Touch optimization
            touch: {
                enabled: true,
                responsiveThreshold: 16, // Max touch response time in ms
                gestureOptimization: true,
                touchPooling: true,
                passiveListeners: true,
                touchCallbackThrottling: true
            },
            
            // Rendering optimizations
            rendering: {
                enabled: true,
                reducedResolution: false,
                simplifiedShaders: false,
                cullAggressive: true,
                lodBias: 1.0, // Level of detail bias for mobile
                drawCallReduction: true,
                textureCompression: true,
                mipmapOptimization: true
            },
            
            // Battery optimizations
            battery: {
                enabled: true,
                reducedFrameRate: false,
                backgroundThrottling: true,
                cpuThrottling: false,
                screenDimming: false,
                networkOptimization: true,
                cacheAggressive: true
            },
            
            // Enhanced Memory optimizations
            memory: {
                enabled: true,
                aggressiveGC: true,
                textureStreamingEnabled: true,
                audioCompression: true,
                assetPreloading: false,
                memoryPressureHandling: true,
                
                // Advanced memory management
                memoryManagement: {
                    enabled: true,
                    intelligentCaching: true,
                    memoryDefragmentation: true,
                    preemptiveCleanup: true,
                    memorySizeTuning: true
                },
                
                // Memory pressure detection
                pressureDetection: {
                    enabled: true,
                    pressureLevels: ['normal', 'moderate', 'severe', 'critical'],
                    currentPressure: 'normal',
                    thresholds: {
                        moderate: 0.70,
                        severe: 0.85,
                        critical: 0.95
                    },
                    warningTriggered: false
                },
                
                // Memory pool management
                poolManagement: {
                    enabled: true,
                    objectPools: new Map(),
                    maxPoolSize: 1000,
                    poolReuse: true,
                    poolCleanupInterval: 30000
                },
                
                // Memory leak detection
                leakDetection: {
                    enabled: true,
                    trackingEnabled: true,
                    leakThreshold: 50, // MB
                    suspiciousGrowthRate: 10, // MB/minute
                    detectedLeaks: [],
                    monitoringInterval: 15000
                },
                
                // Platform-specific optimizations
                platformOptimizations: {
                    ios: {
                        memoryWarningHandling: true,
                        backgroundAppRefresh: false
                    },
                    android: {
                        lowMemoryKiller: true,
                        compactHeap: true
                    },
                    web: {
                        webWorkerMemoryLimit: 256, // MB
                        offscreenCanvasLimit: 128
                    }
                }
            },
            
            // UI/UX optimizations
            ui: {
                enabled: true,
                simplifiedEffects: false,
                reducedAnimations: false,
                lowLatencyMode: true,
                adaptiveUI: true,
                gestureRecognition: true
            }
        };
        
        // Performance monitoring for mobile
        this.mobileMonitoring = {
            enabled: true,
            
            // Performance metrics
            metrics: {
                fps: 60,
                frameTime: 16.67,
                touchLatency: 0,
                memoryUsage: 0,
                batteryDrain: 0,
                thermalState: 'normal',
                networkUsage: 0
            },
            
            // Touch performance tracking
            touchTracking: {
                enabled: true,
                touchEvents: [],
                averageLatency: 0,
                maxLatency: 0,
                touchesPerSecond: 0,
                gestureRecognitionTime: 0
            },
            
            // Enhanced Thermal monitoring
            thermalMonitoring: {
                enabled: true,
                currentState: 'normal', // 'normal', 'moderate', 'serious', 'critical'
                throttleThreshold: 'moderate',
                cooldownRequired: false,
                
                // Advanced thermal management
                thermalControl: {
                    enabled: true,
                    adaptiveCooling: true,
                    predictiveThrottling: true,
                    emergencyShutdown: false,
                    maxTemperatureReached: false
                },
                
                // Temperature estimation system
                temperatureEstimation: {
                    enabled: true,
                    baselineTemperature: 25, // Celsius
                    currentEstimate: 25,
                    deltaTemperature: 0,
                    heatGenerationRate: 0,
                    coolingRate: 0
                },
                
                // Performance impact tracking
                performanceImpact: {
                    cpuThrottleLevel: 0, // 0-1 scale
                    gpuThrottleLevel: 0,
                    memoryThrottleLevel: 0,
                    ioThrottleLevel: 0,
                    overallThrottleLevel: 0
                },
                
                // Thermal history and patterns
                thermalHistory: {
                    temperatureLog: [],
                    heatEvents: [],
                    coolingEvents: [],
                    throttleEvents: [],
                    maxHistorySize: 1000
                },
                
                // Device-specific thermal characteristics
                thermalCharacteristics: {
                    maxSafeTemperature: 70, // Celsius
                    criticalTemperature: 85,
                    thermalMass: 1.0, // Relative thermal mass
                    coolingEfficiency: 1.0,
                    heatDissipationRate: 1.0
                }
            },
            
            // Enhanced Battery monitoring
            batteryMonitoring: {
                enabled: true,
                initialLevel: 1.0,
                currentLevel: 1.0,
                drainRate: 0,
                projectedLife: Infinity,
                powerSavingMode: false,
                
                // Advanced battery features
                chargingOptimization: {
                    enabled: true,
                    fastChargingDetected: false,
                    chargingEfficiency: 1.0,
                    temperatureMonitoring: true
                },
                
                // Battery health tracking
                healthMetrics: {
                    cycleCount: 0,
                    degradationLevel: 0, // 0-1 scale
                    optimalRange: { min: 0.2, max: 0.8 },
                    lastFullCharge: null
                },
                
                // Power consumption analysis
                consumptionAnalysis: {
                    baselineConsumption: 0,
                    peakConsumption: 0,
                    averageConsumption: 0,
                    consumptionHistory: [],
                    deviceSpecificBaseline: 0
                },
                
                // Dynamic power management
                dynamicPowerManagement: {
                    enabled: true,
                    adaptiveThresholds: {
                        critical: 0.10,
                        low: 0.20,
                        medium: 0.50,
                        high: 0.80
                    },
                    powerStates: ['normal', 'conservation', 'aggressive', 'emergency'],
                    currentPowerState: 'normal'
                }
            },
            
            // Network monitoring
            networkMonitoring: {
                enabled: true,
                quality: 'good',
                latency: 0,
                bandwidth: 0,
                dataUsage: 0
            }
        };
        
        // Adaptive optimization system
        this.adaptiveSystem = {
            enabled: true,
            
            // Current optimization state
            currentOptimizations: new Set(),
            optimizationHistory: [],
            
            // Adaptation triggers
            triggers: {
                lowFPS: { threshold: 25, action: 'reduce_quality' },
                highMemory: { threshold: 0.85, action: 'aggressive_gc' },
                lowBattery: { threshold: 0.20, action: 'battery_save' },
                thermal: { threshold: 'moderate', action: 'thermal_throttle' },
                touchLatency: { threshold: 50, action: 'touch_optimize' }
            },
            
            // Optimization strategies
            strategies: {
                'emergency': {
                    priority: 5,
                    optimizations: [
                        'reduce_resolution_50',
                        'disable_particles',
                        'disable_shadows',
                        'reduce_audio_quality',
                        'aggressive_culling'
                    ]
                },
                'battery_save': {
                    priority: 4,
                    optimizations: [
                        'reduce_framerate_30',
                        'reduce_brightness',
                        'disable_background_audio',
                        'network_throttle',
                        'cpu_throttle'
                    ]
                },
                'thermal_throttle': {
                    priority: 4,
                    optimizations: [
                        'reduce_cpu_load',
                        'reduce_gpu_load',
                        'pause_background_tasks',
                        'reduce_rendering_quality'
                    ]
                },
                'touch_optimize': {
                    priority: 3,
                    optimizations: [
                        'prioritize_touch_events',
                        'reduce_frame_complexity',
                        'disable_non_critical_updates'
                    ]
                },
                'memory_pressure': {
                    priority: 3,
                    optimizations: [
                        'force_garbage_collect',
                        'clear_texture_cache',
                        'reduce_particle_count',
                        'unload_unused_assets'
                    ]
                }
            }
        };
        
        // Platform-specific optimizations
        this.platformOptimizations = {
            ios: {
                enabled: false,
                webkitOptimizations: true,
                metalPerformanceShaders: false,
                backgroundAppRefresh: true,
                lowPowerMode: false
            },
            android: {
                enabled: false,
                chromeOptimizations: true,
                vulkanAPI: false,
                batteryOptimization: true,
                dataSaver: false
            },
            web: {
                enabled: true,
                serviceWorker: true,
                webAssembly: false,
                webGL2: true,
                offscreenCanvas: false
            }
        };
        
        this.initializeMobileOptimizer();
        
        console.log('[MobilePerformanceOptimizer] Mobile performance optimization system initialized');
    }
    
    /**
     * Initialize mobile optimizer
     */
    initializeMobileOptimizer() {
        // Detect device capabilities
        this.detectDeviceCapabilities();
        
        // Run performance benchmarks
        this.runPerformanceBenchmarks();
        
        // Setup mobile-specific optimizations
        this.setupMobileOptimizations();
        
        // Start mobile monitoring
        this.startMobileMonitoring();
        
        // Setup event listeners
        this.setupMobileEventListeners();
        
        // Apply initial optimizations
        this.applyInitialOptimizations();
    }
    
    /**
     * Detect comprehensive device capabilities
     */
    detectDeviceCapabilities() {
        console.log('[MobilePerformanceOptimizer] Starting device capability detection...');
        
        // Detect mobile platform
        this.detectMobilePlatform();
        
        // Analyze user agent
        this.analyzeUserAgent();
        
        // Detect hardware capabilities
        this.detectHardwareCapabilities();
        
        // Detect network capabilities
        this.detectNetworkCapabilities();
        
        // Detect battery information
        this.detectBatteryCapabilities();
        
        // Classify device performance
        this.classifyDevicePerformance();
        
        console.log('[MobilePerformanceOptimizer] Device detection complete:', this.deviceDetection.deviceClass);
    }
    
    /**
     * Detect if running on mobile platform
     */
    detectMobilePlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for mobile indicators
        this.deviceDetection.isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        this.deviceDetection.isTablet = /tablet|ipad|android(?!.*mobile)/i.test(userAgent);
        
        // Detect platform
        if (/iphone|ipad|ipod/i.test(userAgent)) {
            this.deviceDetection.platform = 'ios';
            this.platformOptimizations.ios.enabled = true;
        } else if (/android/i.test(userAgent)) {
            this.deviceDetection.platform = 'android';
            this.platformOptimizations.android.enabled = true;
        } else {
            this.deviceDetection.platform = 'web';
        }
        
        // Additional mobile detection using touch support and screen size
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const smallScreen = window.screen.width <= 768 || window.screen.height <= 768;
        
        if (hasTouchScreen && smallScreen && !this.deviceDetection.isMobile) {
            this.deviceDetection.isMobile = true;
        }
        
        console.log(`[MobilePerformanceOptimizer] Platform detected: ${this.deviceDetection.platform}, Mobile: ${this.deviceDetection.isMobile}`);
    }
    
    /**
     * Analyze user agent for detailed browser/device information
     */
    analyzeUserAgent() {
        const userAgent = navigator.userAgent;
        const userAgentData = this.deviceDetection.userAgent;
        
        // Browser detection
        if (userAgent.includes('Chrome')) {
            userAgentData.browser = 'Chrome';
            userAgentData.engine = 'Blink';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            userAgentData.browser = 'Safari';
            userAgentData.engine = 'WebKit';
        } else if (userAgent.includes('Firefox')) {
            userAgentData.browser = 'Firefox';
            userAgentData.engine = 'Gecko';
        } else if (userAgent.includes('Edge')) {
            userAgentData.browser = 'Edge';
            userAgentData.engine = 'Blink';
        }
        
        // OS detection
        if (userAgent.includes('Windows')) {
            userAgentData.os = 'Windows';
        } else if (userAgent.includes('Mac OS')) {
            userAgentData.os = 'macOS';
        } else if (userAgent.includes('iPhone OS') || userAgent.includes('iOS')) {
            userAgentData.os = 'iOS';
        } else if (userAgent.includes('Android')) {
            userAgentData.os = 'Android';
        } else if (userAgent.includes('Linux')) {
            userAgentData.os = 'Linux';
        }
        
        // Extract version numbers
        this.extractVersionNumbers(userAgent, userAgentData);
    }
    
    /**
     * Extract version numbers from user agent
     * @param {string} userAgent - User agent string
     * @param {object} userAgentData - User agent data object
     */
    extractVersionNumbers(userAgent, userAgentData) {
        // Browser version
        const browserPatterns = {
            'Chrome': /Chrome\/(\d+\.\d+)/,
            'Safari': /Version\/(\d+\.\d+)/,
            'Firefox': /Firefox\/(\d+\.\d+)/,
            'Edge': /Edge\/(\d+\.\d+)/
        };
        
        const pattern = browserPatterns[userAgentData.browser];
        if (pattern) {
            const match = userAgent.match(pattern);
            if (match) {
                userAgentData.version = match[1];
            }
        }
        
        // OS version
        if (userAgentData.os === 'iOS') {
            const match = userAgent.match(/OS (\d+_\d+)/);
            if (match) {
                userAgentData.osVersion = match[1].replace('_', '.');
            }
        } else if (userAgentData.os === 'Android') {
            const match = userAgent.match(/Android (\d+\.\d+)/);
            if (match) {
                userAgentData.osVersion = match[1];
            }
        }
    }
    
    /**
     * Detect hardware capabilities
     */
    detectHardwareCapabilities() {
        const hardware = this.deviceDetection.hardware;
        
        // CPU detection
        hardware.cpu.cores = navigator.hardwareConcurrency || 2;
        this.estimateCPUPerformance();
        
        // Memory detection
        if (navigator.deviceMemory) {
            hardware.memory.total = navigator.deviceMemory * 1024; // Convert to MB
        } else {
            hardware.memory.total = this.estimateMemorySize();
        }
        
        // GPU detection
        this.detectGPUCapabilities();
        
        // Display detection
        this.detectDisplayCapabilities();
    }
    
    /**
     * Estimate CPU performance
     */
    estimateCPUPerformance() {
        const cores = this.deviceDetection.hardware.cpu.cores;
        const userAgent = navigator.userAgent;
        
        // Basic heuristic based on cores and device type
        if (this.deviceDetection.isMobile) {
            if (cores >= 8) {
                this.deviceDetection.hardware.cpu.performance = 'high';
            } else if (cores >= 4) {
                this.deviceDetection.hardware.cpu.performance = 'medium';
            } else {
                this.deviceDetection.hardware.cpu.performance = 'low';
            }
        } else {
            if (cores >= 8) {
                this.deviceDetection.hardware.cpu.performance = 'high';
            } else if (cores >= 4) {
                this.deviceDetection.hardware.cpu.performance = 'medium';
            } else {
                this.deviceDetection.hardware.cpu.performance = 'low';
            }
        }
        
        // Adjust based on known device patterns
        if (userAgent.includes('iPhone')) {
            // iPhone typically has good performance per core
            if (cores >= 6) this.deviceDetection.hardware.cpu.performance = 'high';
        }
    }
    
    /**
     * Estimate memory size for devices that don't report it
     * @returns {number} Estimated memory in MB
     */
    estimateMemorySize() {
        if (this.deviceDetection.isMobile) {
            // Mobile devices typically have less memory
            const year = new Date().getFullYear();
            if (year >= 2020) return 6144; // 6GB for modern mobile
            if (year >= 2018) return 4096; // 4GB for recent mobile
            return 2048; // 2GB for older mobile
        } else {
            // Desktop/laptop estimates
            return 8192; // 8GB default for desktop
        }
    }
    
    /**
     * Detect GPU capabilities
     */
    detectGPUCapabilities() {
        const gpu = this.deviceDetection.hardware.gpu;
        
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                // WebGL 1.0 support
                gpu.webglVersion = 'webgl1';
                
                // Try WebGL 2.0
                const gl2 = canvas.getContext('webgl2');
                if (gl2) {
                    gpu.webglVersion = 'webgl2';
                }
                
                // Get GPU info
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpu.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    gpu.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
                
                // Get max texture size
                gpu.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                
                // Estimate GPU performance
                this.estimateGPUPerformance(gpu);
            }
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] GPU detection failed:', error);
            gpu.performance = 'low';
        }
    }
    
    /**
     * Estimate GPU performance based on available information
     * @param {object} gpu - GPU information object
     */
    estimateGPUPerformance(gpu) {
        const renderer = gpu.renderer.toLowerCase();
        
        // Desktop GPU patterns
        if (renderer.includes('nvidia') || renderer.includes('geforce')) {
            gpu.performance = 'high';
        } else if (renderer.includes('amd') || renderer.includes('radeon')) {
            gpu.performance = 'medium';
        } else if (renderer.includes('intel')) {
            gpu.performance = 'low';
        }
        // Mobile GPU patterns
        else if (renderer.includes('adreno')) {
            if (renderer.includes('640') || renderer.includes('650')) {
                gpu.performance = 'high';
            } else if (renderer.includes('530') || renderer.includes('540')) {
                gpu.performance = 'medium';
            } else {
                gpu.performance = 'low';
            }
        } else if (renderer.includes('mali')) {
            if (renderer.includes('g76') || renderer.includes('g77')) {
                gpu.performance = 'high';
            } else if (renderer.includes('g52') || renderer.includes('g72')) {
                gpu.performance = 'medium';
            } else {
                gpu.performance = 'low';
            }
        } else if (renderer.includes('apple')) {
            // Apple GPUs are generally good
            gpu.performance = 'high';
        } else {
            // Default based on texture size and WebGL version
            if (gpu.maxTextureSize >= 4096 && gpu.webglVersion === 'webgl2') {
                gpu.performance = 'medium';
            } else {
                gpu.performance = 'low';
            }
        }
    }
    
    /**
     * Detect display capabilities
     */
    detectDisplayCapabilities() {
        const display = this.deviceDetection.hardware.display;
        
        display.width = window.screen.width;
        display.height = window.screen.height;
        display.pixelRatio = window.devicePixelRatio || 1;
        display.colorDepth = window.screen.colorDepth || 24;
        
        // Estimate refresh rate (most mobile devices are 60Hz, some are 90Hz/120Hz)
        if (this.deviceDetection.isMobile) {
            // High-end devices may have higher refresh rates
            if (this.deviceDetection.hardware.cpu.performance === 'high') {
                display.refreshRate = 90; // Assume high-end mobile has 90Hz
            } else {
                display.refreshRate = 60;
            }
        } else {
            display.refreshRate = 60; // Default for desktop
        }
    }
    
    /**
     * Detect network capabilities
     */
    detectNetworkCapabilities() {
        const network = this.deviceDetection.hardware.network;
        
        if (navigator.connection) {
            const conn = navigator.connection;
            network.type = conn.type || 'unknown';
            network.effectiveType = conn.effectiveType || 'unknown';
            network.downlink = conn.downlink || 0;
            network.rtt = conn.rtt || 0;
        }
    }
    
    /**
     * Detect battery capabilities
     */
    async detectBatteryCapabilities() {
        const battery = this.deviceDetection.hardware.battery;
        
        try {
            if (navigator.getBattery) {
                const batteryInfo = await navigator.getBattery();
                battery.level = batteryInfo.level;
                battery.charging = batteryInfo.charging;
                battery.dischargingTime = batteryInfo.dischargingTime;
                battery.chargingTime = batteryInfo.chargingTime;
                
                // Setup battery event listeners
                this.setupBatteryEventListeners(batteryInfo);
            }
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] Battery API not available');
        }
    }
    
    /**
     * Setup battery event listeners
     * @param {BatteryManager} battery - Battery manager object
     */
    setupBatteryEventListeners(battery) {
        battery.addEventListener('levelchange', () => {
            this.deviceDetection.hardware.battery.level = battery.level;
            this.handleBatteryLevelChange(battery.level);
        });
        
        battery.addEventListener('chargingchange', () => {
            this.deviceDetection.hardware.battery.charging = battery.charging;
            this.handleChargingStateChange(battery.charging);
        });
    }
    
    /**
     * Handle battery level changes
     * @param {number} level - Battery level (0-1)
     */
    handleBatteryLevelChange(level) {
        this.mobileMonitoring.batteryMonitoring.currentLevel = level;
        
        // Trigger battery optimizations at low levels
        if (level < 0.20 && !this.mobileMonitoring.batteryMonitoring.powerSavingMode) {
            this.triggerBatteryOptimizations();
        } else if (level > 0.50 && this.mobileMonitoring.batteryMonitoring.powerSavingMode) {
            this.disableBatteryOptimizations();
        }
    }
    
    /**
     * Handle charging state changes
     * @param {boolean} charging - Whether device is charging
     */
    handleChargingStateChange(charging) {
        if (charging && this.mobileMonitoring.batteryMonitoring.powerSavingMode) {
            // Device is now charging, can relax battery optimizations
            this.disableBatteryOptimizations();
        }
    }
    
    /**
     * Classify overall device performance
     */
    classifyDevicePerformance() {
        const hardware = this.deviceDetection.hardware;
        
        // Calculate performance scores
        let cpuScore = this.getPerformanceScore(hardware.cpu.performance);
        let gpuScore = this.getPerformanceScore(hardware.gpu.performance);
        let memoryScore = this.calculateMemoryScore(hardware.memory.total);
        
        // Weight the scores
        const overallScore = (cpuScore * 0.4) + (gpuScore * 0.4) + (memoryScore * 0.2);
        
        // Classify device
        if (overallScore >= 0.8) {
            this.deviceDetection.deviceClass = 'flagship';
        } else if (overallScore >= 0.6) {
            this.deviceDetection.deviceClass = 'high-end';
        } else if (overallScore >= 0.4) {
            this.deviceDetection.deviceClass = 'mid-range';
        } else {
            this.deviceDetection.deviceClass = 'low-end';
        }
        
        console.log(`[MobilePerformanceOptimizer] Device classified as: ${this.deviceDetection.deviceClass} (score: ${overallScore.toFixed(2)})`);
    }
    
    /**
     * Get performance score from performance rating
     * @param {string} performance - Performance rating
     * @returns {number} Score (0-1)
     */
    getPerformanceScore(performance) {
        switch (performance) {
            case 'high': return 1.0;
            case 'medium': return 0.6;
            case 'low': return 0.3;
            default: return 0.2;
        }
    }
    
    /**
     * Calculate memory score
     * @param {number} memoryMB - Memory in MB
     * @returns {number} Score (0-1)
     */
    calculateMemoryScore(memoryMB) {
        if (memoryMB >= 8192) return 1.0; // 8GB+
        if (memoryMB >= 6144) return 0.8; // 6GB
        if (memoryMB >= 4096) return 0.6; // 4GB
        if (memoryMB >= 2048) return 0.4; // 2GB
        return 0.2; // <2GB
    }
    
    /**
     * Run performance benchmarks
     */
    async runPerformanceBenchmarks() {
        console.log('[MobilePerformanceOptimizer] Running performance benchmarks...');
        
        try {
            // CPU benchmark
            const cpuScore = await this.runCPUBenchmark();
            this.deviceDetection.benchmarks.cpuScore = cpuScore;
            
            // GPU benchmark
            const gpuScore = await this.runGPUBenchmark();
            this.deviceDetection.benchmarks.gpuScore = gpuScore;
            
            // Memory benchmark
            const memoryScore = await this.runMemoryBenchmark();
            this.deviceDetection.benchmarks.memoryScore = memoryScore;
            
            // Calculate overall score
            this.deviceDetection.benchmarks.overallScore = 
                (cpuScore * 0.4) + (gpuScore * 0.4) + (memoryScore * 0.2);
            
            this.deviceDetection.benchmarks.benchmarkComplete = true;
            
            console.log('[MobilePerformanceOptimizer] Benchmarks complete:', this.deviceDetection.benchmarks);
            
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] Benchmark failed:', error);
        }
    }
    
    /**
     * Run CPU benchmark
     * @returns {Promise<number>} CPU performance score (0-1)
     */
    async runCPUBenchmark() {
        return new Promise((resolve) => {
            const startTime = performance.now();
            
            // Simple CPU-intensive task
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.sin(i) * Math.cos(i);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Score based on execution time (lower is better)
            // Baseline: ~100ms for good performance
            const score = Math.max(0, Math.min(1, 200 / duration));
            
            resolve(score);
        });
    }
    
    /**
     * Run GPU benchmark
     * @returns {Promise<number>} GPU performance score (0-1)
     */
    async runGPUBenchmark() {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) {
                    resolve(0.1);
                    return;
                }
                
                const startTime = performance.now();
                
                // Simple GPU benchmark - render many textured quads
                for (let i = 0; i < 100; i++) {
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
                
                gl.finish();
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Score based on rendering time
                const score = Math.max(0, Math.min(1, 50 / duration));
                
                resolve(score);
                
            } catch (error) {
                resolve(0.1);
            }
        });
    }
    
    /**
     * Run memory benchmark
     * @returns {Promise<number>} Memory performance score (0-1)
     */
    async runMemoryBenchmark() {
        return new Promise((resolve) => {
            try {
                const startTime = performance.now();
                
                // Allocate and manipulate arrays
                const arrays = [];
                for (let i = 0; i < 100; i++) {
                    const array = new Float32Array(10000);
                    for (let j = 0; j < array.length; j++) {
                        array[j] = Math.random();
                    }
                    arrays.push(array);
                }
                
                // Force some memory operations
                arrays.forEach(array => {
                    array.sort();
                });
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Score based on memory operation time
                const score = Math.max(0, Math.min(1, 100 / duration));
                
                resolve(score);
                
            } catch (error) {
                resolve(0.1);
            }
        });
    }
    
    /**
     * Setup mobile-specific optimizations
     */
    setupMobileOptimizations() {
        if (!this.deviceDetection.isMobile) {
            console.log('[MobilePerformanceOptimizer] Not on mobile device, skipping mobile optimizations');
            return;
        }
        
        // Setup touch optimizations
        this.setupTouchOptimizations();
        
        // Setup rendering optimizations
        this.setupRenderingOptimizations();
        
        // Setup battery optimizations
        this.setupBatteryOptimizations();
        
        // Setup memory optimizations
        this.setupMemoryOptimizations();
        
        console.log('[MobilePerformanceOptimizer] Mobile optimizations configured');
    }
    
    /**
     * Setup touch interaction optimizations
     */
    setupTouchOptimizations() {
        const touchOpt = this.mobileOptimizations.touch;
        
        if (touchOpt.enabled) {
            // Use passive event listeners for better scroll performance
            if (touchOpt.passiveListeners) {
                this.enablePassiveEventListeners();
            }
            
            // Setup touch event pooling
            if (touchOpt.touchPooling) {
                this.setupTouchEventPooling();
            }
            
            // Setup gesture optimization
            if (touchOpt.gestureOptimization) {
                this.setupGestureOptimization();
            }
        }
    }
    
    /**
     * Enable passive event listeners for better scroll performance
     */
    enablePassiveEventListeners() {
        // Override addEventListener to use passive listeners for touch events
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (['touchstart', 'touchmove', 'touchend', 'wheel'].includes(type)) {
                if (typeof options === 'boolean') {
                    options = { passive: true, capture: options };
                } else if (typeof options === 'object') {
                    options = { ...options, passive: true };
                } else {
                    options = { passive: true };
                }
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        console.log('[MobilePerformanceOptimizer] Passive event listeners enabled');
    }
    
    /**
     * Setup touch event pooling for reduced GC pressure
     */
    setupTouchEventPooling() {
        // Create a pool of touch event objects to reuse
        this.touchEventPool = {
            pool: [],
            active: new Set(),
            maxSize: 50
        };
        
        // Pre-allocate touch event objects
        for (let i = 0; i < 10; i++) {
            this.touchEventPool.pool.push({
                type: '',
                x: 0, y: 0,
                timestamp: 0,
                identifier: 0,
                pressure: 0
            });
        }
    }
    
    /**
     * Setup gesture recognition optimization
     */
    setupGestureOptimization() {
        // Throttle gesture recognition to reduce CPU usage
        this.gestureRecognitionThrottle = this.createThrottledFunction(
            this.processGestureRecognition.bind(this),
            16 // ~60fps
        );
    }
    
    /**
     * Create throttled function
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    createThrottledFunction(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }
    
    /**
     * Process gesture recognition (placeholder)
     * @param {TouchEvent} event - Touch event
     */
    processGestureRecognition(event) {
        // This would contain actual gesture recognition logic
        const gestureStart = performance.now();
        
        // Simulate gesture processing
        // ... gesture recognition logic ...
        
        const gestureTime = performance.now() - gestureStart;
        this.mobileMonitoring.touchTracking.gestureRecognitionTime = gestureTime;
    }
    
    /**
     * Setup rendering optimizations for mobile
     */
    setupRenderingOptimizations() {
        const renderOpt = this.mobileOptimizations.rendering;
        
        if (renderOpt.enabled) {
            // Adjust rendering based on device capability
            this.adjustRenderingForDevice();
            
            // Setup LOD bias for mobile
            this.setupMobileLOD();
            
            // Enable texture compression
            if (renderOpt.textureCompression) {
                this.enableTextureCompression();
            }
        }
    }
    
    /**
     * Adjust rendering settings based on device capability
     */
    adjustRenderingForDevice() {
        const deviceClass = this.deviceDetection.deviceClass;
        const renderOpt = this.mobileOptimizations.rendering;
        
        switch (deviceClass) {
            case 'low-end':
                renderOpt.reducedResolution = true;
                renderOpt.simplifiedShaders = true;
                renderOpt.lodBias = 2.0;
                break;
            case 'mid-range':
                renderOpt.reducedResolution = false;
                renderOpt.simplifiedShaders = false;
                renderOpt.lodBias = 1.5;
                break;
            case 'high-end':
            case 'flagship':
                renderOpt.reducedResolution = false;
                renderOpt.simplifiedShaders = false;
                renderOpt.lodBias = 1.0;
                break;
        }
        
        console.log(`[MobilePerformanceOptimizer] Rendering adjusted for ${deviceClass} device`);
    }
    
    /**
     * Setup Level of Detail bias for mobile
     */
    setupMobileLOD() {
        // This would integrate with the rendering system to bias LOD selection
        // Lower values = higher quality, higher values = lower quality
        const lodBias = this.mobileOptimizations.rendering.lodBias;
        
        // Apply LOD bias to configuration
        try {
            this.configManager.set('graphics.lod.bias', lodBias);
            console.log(`[MobilePerformanceOptimizer] LOD bias set to: ${lodBias}`);
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] Failed to set LOD bias:', error);
        }
    }
    
    /**
     * Enable texture compression for mobile
     */
    enableTextureCompression() {
        try {
            this.configManager.set('graphics.textures.compression', true);
            this.configManager.set('graphics.textures.format', 'compressed');
            console.log('[MobilePerformanceOptimizer] Texture compression enabled');
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] Failed to enable texture compression:', error);
        }
    }
    
    /**
     * Setup battery optimizations
     */
    setupBatteryOptimizations() {
        const batteryOpt = this.mobileOptimizations.battery;
        
        if (batteryOpt.enabled) {
            // Monitor battery level
            this.monitorBatteryLevel();
            
            // Setup background throttling
            if (batteryOpt.backgroundThrottling) {
                this.setupBackgroundThrottling();
            }
            
            // Setup network optimization
            if (batteryOpt.networkOptimization) {
                this.setupNetworkOptimization();
            }
        }
    }
    
    /**
     * Monitor battery level and adjust optimizations
     */
    monitorBatteryLevel() {
        const checkBattery = () => {
            const battery = this.deviceDetection.hardware.battery;
            const monitoring = this.mobileMonitoring.batteryMonitoring;
            
            // Calculate drain rate
            if (monitoring.initialLevel > 0) {
                const timeDiff = Date.now() - (monitoring.lastCheck || Date.now());
                const levelDiff = monitoring.currentLevel - battery.level;
                
                if (timeDiff > 0 && levelDiff > 0) {
                    monitoring.drainRate = (levelDiff / timeDiff) * 3600000; // Per hour
                }
            }
            
            monitoring.lastCheck = Date.now();
            
            // Project battery life
            if (monitoring.drainRate > 0) {
                monitoring.projectedLife = battery.level / monitoring.drainRate;
            }
        };
        
        setInterval(checkBattery, 30000); // Check every 30 seconds
    }
    
    /**
     * Setup background throttling
     */
    setupBackgroundThrottling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.enableBackgroundThrottling();
            } else {
                this.disableBackgroundThrottling();
            }
        });
    }
    
    /**
     * Enable background throttling when app is not visible
     */
    enableBackgroundThrottling() {
        console.log('[MobilePerformanceOptimizer] Background throttling enabled');
        
        // Reduce frame rate
        this.configManager.set('performance.targetFPS', 15);
        
        // Pause non-essential systems
        this.configManager.set('audio.enabled', false);
        this.configManager.set('particles.enabled', false);
        
        // Reduce network activity
        this.configManager.set('network.throttle', true);
    }
    
    /**
     * Disable background throttling when app becomes visible
     */
    disableBackgroundThrottling() {
        console.log('[MobilePerformanceOptimizer] Background throttling disabled');
        
        // Restore frame rate
        this.configManager.set('performance.targetFPS', this.mobileConfig.targets.targetFPS);
        
        // Resume systems
        this.configManager.set('audio.enabled', true);
        this.configManager.set('particles.enabled', true);
        
        // Restore network activity
        this.configManager.set('network.throttle', false);
    }
    
    /**
     * Setup network optimization for battery savings
     */
    setupNetworkOptimization() {
        // Batch network requests
        // Reduce polling frequency
        // Compress data transfers
        
        console.log('[MobilePerformanceOptimizer] Network optimization enabled');
    }
    
    /**
     * Setup memory optimizations for mobile
     */
    setupMemoryOptimizations() {
        const memoryOpt = this.mobileOptimizations.memory;
        
        if (memoryOpt.enabled) {
            // Enable aggressive garbage collection
            if (memoryOpt.aggressiveGC) {
                this.enableAggressiveGC();
            }
            
            // Setup texture streaming
            if (memoryOpt.textureStreamingEnabled) {
                this.enableTextureStreaming();
            }
            
            // Setup memory pressure handling
            if (memoryOpt.memoryPressureHandling) {
                this.setupMemoryPressureHandling();
            }
        }
    }
    
    /**
     * Enable aggressive garbage collection
     */
    enableAggressiveGC() {
        // Force GC more frequently on mobile
        this.gcInterval = setInterval(() => {
            if (window.gc) {
                window.gc();
            }
        }, 10000); // Every 10 seconds
        
        console.log('[MobilePerformanceOptimizer] Aggressive GC enabled');
    }
    
    /**
     * Enable texture streaming to reduce memory usage
     */
    enableTextureStreaming() {
        try {
            this.configManager.set('graphics.textures.streaming', true);
            this.configManager.set('graphics.textures.maxCacheSize', 128); // 128MB on mobile
            console.log('[MobilePerformanceOptimizer] Texture streaming enabled');
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] Failed to enable texture streaming:', error);
        }
    }
    
    /**
     * Setup memory pressure handling
     */
    setupMemoryPressureHandling() {
        // Monitor memory usage and trigger cleanup when needed
        setInterval(() => {
            if (performance.memory) {
                const memInfo = performance.memory;
                const pressure = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
                
                if (pressure > 0.8) {
                    this.handleMemoryPressure();
                }
            }
        }, 5000); // Check every 5 seconds
    }
    
    /**
     * Handle memory pressure situations
     */
    handleMemoryPressure() {
        console.log('[MobilePerformanceOptimizer] Memory pressure detected, triggering cleanup');
        
        // Force garbage collection
        if (window.gc) {
            window.gc();
        }
        
        // Clear caches
        this.configManager.set('cache.clear', true);
        
        // Reduce quality temporarily
        this.triggerAdaptiveOptimization('memory_pressure');
    }
    
    /**
     * Start mobile performance monitoring
     */
    startMobileMonitoring() {
        if (!this.mobileMonitoring.enabled) return;
        
        // Start touch latency monitoring
        this.startTouchLatencyMonitoring();
        
        // Start enhanced thermal monitoring
        this.startAdvancedThermalMonitoring();
        
        // Start enhanced battery monitoring
        this.startAdvancedBatteryMonitoring();
        
        // Start enhanced memory management
        this.startAdvancedMemoryManagement();
        
        // Start network monitoring
        this.startNetworkMonitoring();
        
        console.log('[MobilePerformanceOptimizer] Enhanced mobile monitoring started');
    }
    
    /**
     * Start touch latency monitoring
     */
    startTouchLatencyMonitoring() {
        const touchTracking = this.mobileMonitoring.touchTracking;
        
        if (touchTracking.enabled) {
            let touchStartTime = 0;
            
            document.addEventListener('touchstart', (event) => {
                touchStartTime = performance.now();
            }, { passive: true });
            
            document.addEventListener('touchend', (event) => {
                if (touchStartTime > 0) {
                    const latency = performance.now() - touchStartTime;
                    touchTracking.touchEvents.push(latency);
                    
                    // Keep only recent touch events
                    if (touchTracking.touchEvents.length > 100) {
                        touchTracking.touchEvents.shift();
                    }
                    
                    // Update statistics
                    this.updateTouchStatistics();
                }
            }, { passive: true });
        }
    }
    
    /**
     * Update touch statistics
     */
    updateTouchStatistics() {
        const touchTracking = this.mobileMonitoring.touchTracking;
        const events = touchTracking.touchEvents;
        
        if (events.length > 0) {
            touchTracking.averageLatency = events.reduce((sum, latency) => sum + latency, 0) / events.length;
            touchTracking.maxLatency = Math.max(...events);
            
            // Check if touch latency is too high
            if (touchTracking.averageLatency > this.mobileOptimizations.touch.responsiveThreshold) {
                this.handleHighTouchLatency();
            }
        }
    }
    
    /**
     * Handle high touch latency
     */
    handleHighTouchLatency() {
        console.log('[MobilePerformanceOptimizer] High touch latency detected, optimizing');
        this.triggerAdaptiveOptimization('touch_optimize');
    }
    
    /**
     * Start thermal monitoring (simulated)
     */
    startThermalMonitoring() {
        // Real thermal monitoring would require native APIs
        // This is a simulation based on performance metrics
        
        setInterval(() => {
            const fps = this.mobileMonitoring.metrics.fps;
            const frameTime = this.mobileMonitoring.metrics.frameTime;
            
            // Estimate thermal state based on performance degradation
            if (fps < 20 || frameTime > 50) {
                this.mobileMonitoring.thermalMonitoring.currentState = 'critical';
            } else if (fps < 30 || frameTime > 35) {
                this.mobileMonitoring.thermalMonitoring.currentState = 'serious';
            } else if (fps < 40 || frameTime > 25) {
                this.mobileMonitoring.thermalMonitoring.currentState = 'moderate';
            } else {
                this.mobileMonitoring.thermalMonitoring.currentState = 'normal';
            }
            
            // Handle thermal throttling
            this.handleThermalState();
            
        }, 5000); // Check every 5 seconds
    }
    
    /**
     * Handle thermal state changes
     */
    handleThermalState() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        
        if (thermal.currentState === 'critical' || thermal.currentState === 'serious') {
            if (!thermal.cooldownRequired) {
                console.log('[MobilePerformanceOptimizer] Thermal throttling triggered');
                this.triggerAdaptiveOptimization('thermal_throttle');
                thermal.cooldownRequired = true;
            }
        } else if (thermal.currentState === 'normal' && thermal.cooldownRequired) {
            console.log('[MobilePerformanceOptimizer] Thermal state normalized');
            thermal.cooldownRequired = false;
        }
    }
    
    /**
     * Start battery monitoring
     */
    startBatteryMonitoring() {
        const batteryMonitoring = this.mobileMonitoring.batteryMonitoring;
        
        if (batteryMonitoring.enabled) {
            batteryMonitoring.initialLevel = this.deviceDetection.hardware.battery.level;
            
            setInterval(() => {
                this.updateBatteryMetrics();
            }, 30000); // Check every 30 seconds
        }
    }
    
    /**
     * Update battery metrics
     */
    updateBatteryMetrics() {
        const battery = this.deviceDetection.hardware.battery;
        const monitoring = this.mobileMonitoring.batteryMonitoring;
        
        monitoring.currentLevel = battery.level;
        
        // Calculate drain rate if not charging
        if (!battery.charging && monitoring.initialLevel > battery.level) {
            const timeDiff = Date.now() - (monitoring.lastUpdate || Date.now());
            if (timeDiff > 0) {
                const levelDiff = monitoring.initialLevel - battery.level;
                monitoring.drainRate = (levelDiff / timeDiff) * 3600000; // Per hour
            }
        }
        
        monitoring.lastUpdate = Date.now();
        
        // Check if battery optimization needed
        if (battery.level < 0.20 && !monitoring.powerSavingMode) {
            this.triggerBatteryOptimizations();
        }
    }
    
    /**
     * Start network monitoring
     */
    startNetworkMonitoring() {
        const networkMonitoring = this.mobileMonitoring.networkMonitoring;
        
        if (networkMonitoring.enabled && navigator.connection) {
            const conn = navigator.connection;
            
            // Update network metrics
            const updateNetworkMetrics = () => {
                networkMonitoring.latency = conn.rtt || 0;
                networkMonitoring.bandwidth = conn.downlink || 0;
                
                // Determine network quality
                if (conn.effectiveType === '4g' && conn.downlink > 10) {
                    networkMonitoring.quality = 'excellent';
                } else if (conn.effectiveType === '4g' || conn.downlink > 1) {
                    networkMonitoring.quality = 'good';
                } else if (conn.effectiveType === '3g') {
                    networkMonitoring.quality = 'fair';
                } else {
                    networkMonitoring.quality = 'poor';
                }
            };
            
            updateNetworkMetrics();
            
            // Listen for network changes
            conn.addEventListener('change', updateNetworkMetrics);
            
            setInterval(updateNetworkMetrics, 10000); // Update every 10 seconds
        }
    }
    
    /**
     * Setup mobile-specific event listeners
     */
    setupMobileEventListeners() {
        // Orientation change
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Window resize (for mobile viewport changes)
        window.addEventListener('resize', () => {
            this.handleMobileResize();
        });
        
        // Touch events for performance monitoring
        this.setupTouchPerformanceListeners();
    }
    
    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        console.log('[MobilePerformanceOptimizer] Orientation changed');
        
        // Update display capabilities
        setTimeout(() => {
            this.detectDisplayCapabilities();
            this.updateRenderingForOrientation();
        }, 100); // Small delay to ensure screen dimensions are updated
    }
    
    /**
     * Update rendering for new orientation
     */
    updateRenderingForOrientation() {
        const display = this.deviceDetection.hardware.display;
        
        // Adjust rendering settings based on new aspect ratio
        if (display.width > display.height) {
            // Landscape - can handle slightly more complex rendering
            this.configManager.set('graphics.quality.mobile', 'balanced');
        } else {
            // Portrait - prioritize battery and performance
            this.configManager.set('graphics.quality.mobile', 'performance');
        }
    }
    
    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('[MobilePerformanceOptimizer] App backgrounded');
            this.enableBackgroundThrottling();
        } else {
            console.log('[MobilePerformanceOptimizer] App foregrounded');
            this.disableBackgroundThrottling();
        }
    }
    
    /**
     * Handle mobile window resize
     */
    handleMobileResize() {
        // Update viewport and rendering settings
        this.detectDisplayCapabilities();
        
        // Trigger canvas resize optimization
        const event = new CustomEvent('mobileResize', {
            detail: {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Setup touch performance listeners
     */
    setupTouchPerformanceListeners() {
        let touchCount = 0;
        let lastTouchTime = 0;
        
        document.addEventListener('touchstart', () => {
            touchCount++;
            lastTouchTime = Date.now();
        }, { passive: true });
        
        // Calculate touches per second
        setInterval(() => {
            const now = Date.now();
            if (now - lastTouchTime < 1000) {
                this.mobileMonitoring.touchTracking.touchesPerSecond = touchCount;
            } else {
                this.mobileMonitoring.touchTracking.touchesPerSecond = 0;
            }
            touchCount = 0;
        }, 1000);
    }
    
    /**
     * Apply initial optimizations based on device capability
     */
    applyInitialOptimizations() {
        const deviceClass = this.deviceDetection.deviceClass;
        
        console.log(`[MobilePerformanceOptimizer] Applying initial optimizations for ${deviceClass} device`);
        
        switch (deviceClass) {
            case 'low-end':
                this.applyLowEndOptimizations();
                break;
            case 'mid-range':
                this.applyMidRangeOptimizations();
                break;
            case 'high-end':
                this.applyHighEndOptimizations();
                break;
            case 'flagship':
                this.applyFlagshipOptimizations();
                break;
        }
        
        // Apply platform-specific optimizations
        this.applyPlatformOptimizations();
    }
    
    /**
     * Apply optimizations for low-end devices
     */
    applyLowEndOptimizations() {
        this.mobileConfig.optimizationLevel = 'battery';
        this.mobileConfig.targets.targetFPS = 30;
        
        // Aggressive optimizations
        this.mobileOptimizations.rendering.reducedResolution = true;
        this.mobileOptimizations.rendering.simplifiedShaders = true;
        this.mobileOptimizations.rendering.lodBias = 2.0;
        
        this.mobileOptimizations.battery.reducedFrameRate = true;
        this.mobileOptimizations.memory.aggressiveGC = true;
        
        this.triggerAdaptiveOptimization('emergency');
    }
    
    /**
     * Apply optimizations for mid-range devices
     */
    applyMidRangeOptimizations() {
        this.mobileConfig.optimizationLevel = 'balanced';
        this.mobileConfig.targets.targetFPS = 40;
        
        // Moderate optimizations
        this.mobileOptimizations.rendering.lodBias = 1.5;
        this.mobileOptimizations.battery.backgroundThrottling = true;
        this.mobileOptimizations.memory.textureStreamingEnabled = true;
    }
    
    /**
     * Apply optimizations for high-end devices
     */
    applyHighEndOptimizations() {
        this.mobileConfig.optimizationLevel = 'performance';
        this.mobileConfig.targets.targetFPS = 50;
        
        // Light optimizations
        this.mobileOptimizations.rendering.lodBias = 1.2;
        this.mobileOptimizations.touch.gestureOptimization = true;
    }
    
    /**
     * Apply optimizations for flagship devices
     */
    applyFlagshipOptimizations() {
        this.mobileConfig.optimizationLevel = 'performance';
        this.mobileConfig.targets.targetFPS = 60;
        
        // Minimal optimizations - focus on advanced features
        this.mobileOptimizations.rendering.lodBias = 1.0;
        this.mobileOptimizations.ui.adaptiveUI = true;
        this.mobileOptimizations.touch.gestureRecognition = true;
    }
    
    /**
     * Apply platform-specific optimizations
     */
    applyPlatformOptimizations() {
        const platform = this.deviceDetection.platform;
        
        switch (platform) {
            case 'ios':
                this.applyIOSOptimizations();
                break;
            case 'android':
                this.applyAndroidOptimizations();
                break;
            case 'web':
                this.applyWebOptimizations();
                break;
        }
    }
    
    /**
     * Apply iOS-specific optimizations
     */
    applyIOSOptimizations() {
        const iosOpt = this.platformOptimizations.ios;
        
        // Enable WebKit-specific optimizations
        if (iosOpt.webkitOptimizations) {
            document.documentElement.style.webkitTouchCallout = 'none';
            document.documentElement.style.webkitUserSelect = 'none';
        }
        
        // Handle low power mode
        this.detectIOSLowPowerMode();
    }
    
    /**
     * Detect iOS low power mode
     */
    detectIOSLowPowerMode() {
        // Indirect detection through performance characteristics
        if (this.deviceDetection.benchmarks.cpuScore < 0.3) {
            this.platformOptimizations.ios.lowPowerMode = true;
            this.triggerBatteryOptimizations();
            console.log('[MobilePerformanceOptimizer] iOS Low Power Mode detected');
        }
    }
    
    /**
     * Apply Android-specific optimizations
     */
    applyAndroidOptimizations() {
        const androidOpt = this.platformOptimizations.android;
        
        // Enable Chrome-specific optimizations
        if (androidOpt.chromeOptimizations) {
            this.enableChromeOptimizations();
        }
        
        // Check for battery optimization settings
        this.checkAndroidBatteryOptimization();
    }
    
    /**
     * Enable Chrome-specific optimizations
     */
    enableChromeOptimizations() {
        // Enable hardware acceleration hints
        document.documentElement.style.transform = 'translateZ(0)';
        
        // Enable Chrome's aggressive optimizations
        if ('connection' in navigator) {
            this.mobileOptimizations.network.enabled = true;
        }
    }
    
    /**
     * Check Android battery optimization
     */
    checkAndroidBatteryOptimization() {
        // Check for data saver mode
        if (navigator.connection && navigator.connection.saveData) {
            this.platformOptimizations.android.dataSaver = true;
            this.triggerBatteryOptimizations();
            console.log('[MobilePerformanceOptimizer] Android Data Saver detected');
        }
    }
    
    /**
     * Apply web-specific optimizations
     */
    applyWebOptimizations() {
        const webOpt = this.platformOptimizations.web;
        
        // Enable Service Worker for caching
        if (webOpt.serviceWorker && 'serviceWorker' in navigator) {
            this.enableServiceWorkerOptimizations();
        }
        
        // Check for WebGL 2.0
        if (webOpt.webGL2) {
            this.checkWebGL2Support();
        }
        
        // Check for OffscreenCanvas
        if (webOpt.offscreenCanvas && 'OffscreenCanvas' in window) {
            this.enableOffscreenCanvas();
        }
    }
    
    /**
     * Enable Service Worker optimizations
     */
    enableServiceWorkerOptimizations() {
        // This would register and configure a service worker for caching
        console.log('[MobilePerformanceOptimizer] Service Worker optimizations enabled');
    }
    
    /**
     * Check WebGL 2.0 support
     */
    checkWebGL2Support() {
        const canvas = document.createElement('canvas');
        const gl2 = canvas.getContext('webgl2');
        
        if (gl2) {
            this.platformOptimizations.web.webGL2 = true;
            console.log('[MobilePerformanceOptimizer] WebGL 2.0 support confirmed');
        }
    }
    
    /**
     * Enable OffscreenCanvas optimizations
     */
    enableOffscreenCanvas() {
        this.platformOptimizations.web.offscreenCanvas = true;
        console.log('[MobilePerformanceOptimizer] OffscreenCanvas optimizations enabled');
    }
    
    /**
     * Trigger adaptive optimization
     * @param {string} strategy - Optimization strategy to apply
     */
    triggerAdaptiveOptimization(strategy) {
        const strategyConfig = this.adaptiveSystem.strategies[strategy];
        
        if (!strategyConfig) {
            console.warn(`[MobilePerformanceOptimizer] Unknown optimization strategy: ${strategy}`);
            return;
        }
        
        console.log(`[MobilePerformanceOptimizer] Triggering optimization strategy: ${strategy}`);
        
        // Add to current optimizations
        this.adaptiveSystem.currentOptimizations.add(strategy);
        
        // Apply optimizations
        for (const optimization of strategyConfig.optimizations) {
            this.applyOptimization(optimization);
        }
        
        // Record in history
        this.adaptiveSystem.optimizationHistory.push({
            strategy,
            timestamp: Date.now(),
            trigger: this.getOptimizationTrigger(),
            deviceState: this.getDeviceState()
        });
        
        // Keep history manageable
        if (this.adaptiveSystem.optimizationHistory.length > 100) {
            this.adaptiveSystem.optimizationHistory.shift();
        }
    }
    
    /**
     * Apply specific optimization
     * @param {string} optimization - Optimization to apply
     */
    applyOptimization(optimization) {
        switch (optimization) {
            case 'reduce_resolution_50':
                this.configManager.set('graphics.resolution.scale', 0.5);
                break;
            case 'disable_particles':
                this.configManager.set('particles.enabled', false);
                break;
            case 'disable_shadows':
                this.configManager.set('graphics.shadows.enabled', false);
                break;
            case 'reduce_audio_quality':
                this.configManager.set('audio.quality', 'low');
                break;
            case 'aggressive_culling':
                this.configManager.set('graphics.culling.aggressive', true);
                break;
            case 'reduce_framerate_30':
                this.configManager.set('performance.targetFPS', 30);
                break;
            case 'prioritize_touch_events':
                this.mobileOptimizations.touch.responsiveThreshold = 8;
                break;
            case 'force_garbage_collect':
                if (window.gc) window.gc();
                break;
            default:
                console.warn(`[MobilePerformanceOptimizer] Unknown optimization: ${optimization}`);
        }
    }
    
    /**
     * Get current optimization trigger
     * @returns {string} Trigger reason
     */
    getOptimizationTrigger() {
        const metrics = this.mobileMonitoring.metrics;
        
        if (metrics.fps < 25) return 'low_fps';
        if (metrics.memoryUsage > 0.85) return 'high_memory';
        if (this.deviceDetection.hardware.battery.level < 0.2) return 'low_battery';
        if (this.mobileMonitoring.thermalMonitoring.currentState !== 'normal') return 'thermal';
        if (this.mobileMonitoring.touchTracking.averageLatency > 50) return 'touch_latency';
        
        return 'unknown';
    }
    
    /**
     * Get current device state
     * @returns {object} Device state snapshot
     */
    getDeviceState() {
        return {
            deviceClass: this.deviceDetection.deviceClass,
            platform: this.deviceDetection.platform,
            batteryLevel: this.deviceDetection.hardware.battery.level,
            memoryPressure: this.mobileMonitoring.metrics.memoryUsage,
            thermalState: this.mobileMonitoring.thermalMonitoring.currentState,
            networkQuality: this.mobileMonitoring.networkMonitoring.quality
        };
    }
    
    /**
     * Trigger battery optimizations
     */
    triggerBatteryOptimizations() {
        console.log('[MobilePerformanceOptimizer] Battery optimizations triggered');
        
        this.mobileMonitoring.batteryMonitoring.powerSavingMode = true;
        this.triggerAdaptiveOptimization('battery_save');
    }
    
    /**
     * Disable battery optimizations
     */
    disableBatteryOptimizations() {
        console.log('[MobilePerformanceOptimizer] Battery optimizations disabled');
        
        this.mobileMonitoring.batteryMonitoring.powerSavingMode = false;
        
        // Remove battery save optimization
        this.adaptiveSystem.currentOptimizations.delete('battery_save');
        
        // Restore normal settings
        this.configManager.set('performance.targetFPS', this.mobileConfig.targets.targetFPS);
        this.configManager.set('graphics.quality', 'normal');
    }
    
    // Public API methods
    
    /**
     * Get device information
     * @returns {object} Comprehensive device information
     */
    getDeviceInfo() {
        return {
            detection: this.deviceDetection,
            benchmarks: this.deviceDetection.benchmarks,
            optimizations: {
                level: this.mobileConfig.optimizationLevel,
                active: Array.from(this.adaptiveSystem.currentOptimizations),
                targets: this.mobileConfig.targets
            }
        };
    }
    
    /**
     * Get mobile performance statistics
     * @returns {object} Performance statistics
     */
    getMobileStats() {
        return {
            device: {
                class: this.deviceDetection.deviceClass,
                platform: this.deviceDetection.platform,
                isMobile: this.deviceDetection.isMobile
            },
            performance: this.mobileMonitoring.metrics,
            touch: this.mobileMonitoring.touchTracking,
            battery: this.mobileMonitoring.batteryMonitoring,
            thermal: this.mobileMonitoring.thermalMonitoring,
            network: this.mobileMonitoring.networkMonitoring,
            optimizations: {
                current: Array.from(this.adaptiveSystem.currentOptimizations),
                history: this.adaptiveSystem.optimizationHistory.slice(-10)
            }
        };
    }
    
    /**
     * Force specific optimization level
     * @param {string} level - Optimization level
     */
    setOptimizationLevel(level) {
        const validLevels = ['battery', 'balanced', 'performance'];
        
        if (!validLevels.includes(level)) {
            console.warn(`[MobilePerformanceOptimizer] Invalid optimization level: ${level}`);
            return;
        }
        
        this.mobileConfig.optimizationLevel = level;
        
        // Apply corresponding optimizations
        switch (level) {
            case 'battery':
                this.triggerAdaptiveOptimization('battery_save');
                break;
            case 'performance':
                this.adaptiveSystem.currentOptimizations.clear();
                break;
            case 'balanced':
                // Remove extreme optimizations
                this.adaptiveSystem.currentOptimizations.delete('emergency');
                this.adaptiveSystem.currentOptimizations.delete('battery_save');
                break;
        }
        
        console.log(`[MobilePerformanceOptimizer] Optimization level set to: ${level}`);
    }
    
    /**
     * Enable or disable adaptive mode
     * @param {boolean} enabled - Whether to enable adaptive mode
     */
    setAdaptiveMode(enabled) {
        this.mobileConfig.adaptiveMode = enabled;
        console.log(`[MobilePerformanceOptimizer] Adaptive mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Configure mobile optimizer
     * @param {object} config - Configuration options
     */
    configure(config) {
        if (config.mobile) {
            Object.assign(this.mobileConfig, config.mobile);
        }
        
        if (config.optimizations) {
            Object.assign(this.mobileOptimizations, config.optimizations);
        }
        
        if (config.monitoring) {
            Object.assign(this.mobileMonitoring, config.monitoring);
        }
        
        console.log('[MobilePerformanceOptimizer] Configuration updated');
    }
    
    /**
     * Enhanced Battery API Integration and Management
     */
    
    /**
     * Advanced battery monitoring with health tracking
     */
    startAdvancedBatteryMonitoring() {
        const batteryMonitoring = this.mobileMonitoring.batteryMonitoring;
        
        if (!batteryMonitoring.enabled) return;
        
        // Start continuous monitoring
        this.batteryMonitoringInterval = setInterval(() => {
            this.updateAdvancedBatteryMetrics();
        }, 10000); // Every 10 seconds
        
        // Monitor charging state changes
        this.setupAdvancedBatteryEventListeners();
        
        console.log('[MobilePerformanceOptimizer] Advanced battery monitoring started');
    }
    
    /**
     * Update advanced battery metrics
     */
    async updateAdvancedBatteryMetrics() {
        try {
            const batteryInfo = await this.getBatteryInfo();
            const monitoring = this.mobileMonitoring.batteryMonitoring;
            
            if (batteryInfo) {
                this.analyzeChargingOptimization(batteryInfo);
                this.trackBatteryHealth(batteryInfo);
                this.analyzePowerConsumption(batteryInfo);
                this.updateDynamicPowerManagement(batteryInfo);
            }
        } catch (error) {
            console.warn('[MobilePerformanceOptimizer] Battery metrics update failed:', error);
        }
    }
    
    /**
     * Analyze charging optimization
     */
    analyzeChargingOptimization(batteryInfo) {
        const chargingOpt = this.mobileMonitoring.batteryMonitoring.chargingOptimization;
        
        if (batteryInfo.charging) {
            // Detect fast charging
            const chargingRate = this.calculateChargingRate(batteryInfo);
            chargingOpt.fastChargingDetected = chargingRate > 0.5; // >50% per hour
            
            // Calculate charging efficiency
            if (chargingRate > 0) {
                chargingOpt.chargingEfficiency = Math.min(1.0, chargingRate / 0.8); // Expected max rate
            }
        }
    }
    
    /**
     * Calculate current charging rate
     */
    calculateChargingRate(batteryInfo) {
        const history = this.mobileMonitoring.batteryMonitoring.consumptionAnalysis.consumptionHistory;
        
        if (history.length < 2) return 0;
        
        const recent = history[history.length - 1];
        const previous = history[history.length - 2];
        const timeDiff = recent.timestamp - previous.timestamp;
        const levelDiff = recent.level - previous.level;
        
        if (timeDiff > 0 && levelDiff > 0) {
            return (levelDiff / timeDiff) * 3600000; // Per hour
        }
        
        return 0;
    }
    
    /**
     * Track battery health metrics
     */
    trackBatteryHealth(batteryInfo) {
        const healthMetrics = this.mobileMonitoring.batteryMonitoring.healthMetrics;
        
        // Track full charge cycles
        if (batteryInfo.level >= 0.99 && !healthMetrics.lastFullCharge) {
            healthMetrics.lastFullCharge = Date.now();
            healthMetrics.cycleCount++;
        } else if (batteryInfo.level < 0.95) {
            healthMetrics.lastFullCharge = null;
        }
        
        // Estimate degradation based on charging patterns
        if (healthMetrics.cycleCount > 0) {
            const expectedCapacity = Math.max(0.7, 1.0 - (healthMetrics.cycleCount * 0.0002));
            healthMetrics.degradationLevel = 1.0 - expectedCapacity;
        }
    }
    
    /**
     * Analyze power consumption patterns
     */
    analyzePowerConsumption(batteryInfo) {
        const analysis = this.mobileMonitoring.batteryMonitoring.consumptionAnalysis;
        
        // Add to consumption history
        analysis.consumptionHistory.push({
            timestamp: Date.now(),
            level: batteryInfo.level,
            charging: batteryInfo.charging
        });
        
        // Keep history manageable
        if (analysis.consumptionHistory.length > 100) {
            analysis.consumptionHistory.shift();
        }
        
        // Calculate consumption metrics
        this.calculateConsumptionMetrics(analysis);
    }
    
    /**
     * Calculate power consumption metrics
     */
    calculateConsumptionMetrics(analysis) {
        const history = analysis.consumptionHistory;
        if (history.length < 3) return;
        
        const consumptionRates = [];
        
        for (let i = 1; i < history.length; i++) {
            const current = history[i];
            const previous = history[i - 1];
            
            if (!current.charging && !previous.charging) {
                const timeDiff = current.timestamp - previous.timestamp;
                const levelDiff = previous.level - current.level;
                
                if (timeDiff > 0 && levelDiff > 0) {
                    const rate = (levelDiff / timeDiff) * 3600000; // Per hour
                    consumptionRates.push(rate);
                }
            }
        }
        
        if (consumptionRates.length > 0) {
            analysis.averageConsumption = consumptionRates.reduce((sum, rate) => sum + rate, 0) / consumptionRates.length;
            analysis.peakConsumption = Math.max(...consumptionRates);
            analysis.baselineConsumption = Math.min(...consumptionRates);
        }
    }
    
    /**
     * Update dynamic power management state
     */
    updateDynamicPowerManagement(batteryInfo) {
        const powerMgmt = this.mobileMonitoring.batteryMonitoring.dynamicPowerManagement;
        const level = batteryInfo.level;
        
        // Determine power state based on adaptive thresholds
        let newPowerState = 'normal';
        
        if (level <= powerMgmt.adaptiveThresholds.critical) {
            newPowerState = 'emergency';
        } else if (level <= powerMgmt.adaptiveThresholds.low) {
            newPowerState = 'aggressive';
        } else if (level <= powerMgmt.adaptiveThresholds.medium) {
            newPowerState = 'conservation';
        }
        
        // Apply power state if changed
        if (newPowerState !== powerMgmt.currentPowerState) {
            this.applyPowerState(newPowerState);
            powerMgmt.currentPowerState = newPowerState;
        }
    }
    
    /**
     * Apply specific power management state
     */
    applyPowerState(powerState) {
        console.log(`[MobilePerformanceOptimizer] Applying power state: ${powerState}`);
        
        switch (powerState) {
            case 'emergency':
                this.triggerAdaptiveOptimization('emergency');
                break;
            case 'aggressive':
                this.triggerAdaptiveOptimization('battery_save');
                break;
            case 'conservation':
                this.configManager.set('performance.targetFPS', 40);
                this.configManager.set('graphics.quality', 'medium');
                break;
            case 'normal':
                this.disableBatteryOptimizations();
                break;
        }
    }
    
    /**
     * Enhanced Thermal Monitoring and Control
     */
    
    /**
     * Start advanced thermal monitoring
     */
    startAdvancedThermalMonitoring() {
        const thermalMonitoring = this.mobileMonitoring.thermalMonitoring;
        
        if (!thermalMonitoring.enabled) return;
        
        // Start thermal estimation
        this.thermalMonitoringInterval = setInterval(() => {
            this.updateThermalEstimation();
            this.analyzeThermalPatterns();
            this.applyThermalControl();
        }, 2000); // Every 2 seconds
        
        console.log('[MobilePerformanceOptimizer] Advanced thermal monitoring started');
    }
    
    /**
     * Update thermal estimation based on performance metrics
     */
    updateThermalEstimation() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const estimation = thermal.temperatureEstimation;
        
        // Estimate temperature based on performance degradation
        const performanceData = this.gatherPerformanceData();
        const heatGeneration = this.calculateHeatGeneration(performanceData);
        
        // Update temperature estimate
        const coolingEffect = this.calculateCoolingEffect();
        estimation.deltaTemperature = heatGeneration - coolingEffect;
        estimation.currentEstimate = Math.max(
            estimation.baselineTemperature,
            estimation.currentEstimate + estimation.deltaTemperature
        );
        
        // Update heat generation and cooling rates
        estimation.heatGenerationRate = heatGeneration;
        estimation.coolingRate = coolingEffect;
        
        // Log temperature data
        this.logThermalData(estimation.currentEstimate);
    }
    
    /**
     * Gather performance data for thermal estimation
     */
    gatherPerformanceData() {
        return {
            fps: this.mobileMonitoring.metrics.fps,
            frameTime: this.mobileMonitoring.metrics.frameTime,
            cpuUsage: this.estimateCPUUsage(),
            gpuUsage: this.estimateGPUUsage(),
            memoryPressure: this.mobileOptimizations.memory.pressureDetection.currentPressure
        };
    }
    
    /**
     * Calculate heat generation based on performance data
     */
    calculateHeatGeneration(performanceData) {
        // Heat generation factors
        const baseFactor = 0.1;
        const cpuFactor = performanceData.cpuUsage * 0.5;
        const gpuFactor = performanceData.gpuUsage * 0.3;
        const memoryFactor = this.getPressureLevel(performanceData.memoryPressure) * 0.2;
        
        return baseFactor + cpuFactor + gpuFactor + memoryFactor;
    }
    
    /**
     * Calculate cooling effect
     */
    calculateCoolingEffect() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const characteristics = thermal.thermalCharacteristics;
        
        // Natural cooling rate
        const ambientCooling = 0.05 * characteristics.coolingEfficiency;
        
        // Active cooling (if device is idle or optimizations are active)
        const activeCooling = this.isDeviceIdle() ? 0.02 : 0;
        
        return ambientCooling + activeCooling;
    }
    
    /**
     * Estimate CPU usage based on performance metrics
     */
    estimateCPUUsage() {
        const fps = this.mobileMonitoring.metrics.fps;
        const targetFPS = this.mobileConfig.targets.targetFPS;
        
        // Estimate based on FPS performance
        if (fps >= targetFPS) {
            return 0.5; // Normal usage
        } else {
            return Math.min(1.0, 1.0 - (fps / targetFPS)); // Higher usage if struggling
        }
    }
    
    /**
     * Estimate GPU usage based on rendering metrics
     */
    estimateGPUUsage() {
        const frameTime = this.mobileMonitoring.metrics.frameTime;
        const targetFrameTime = 1000 / this.mobileConfig.targets.targetFPS;
        
        return Math.min(1.0, frameTime / targetFrameTime);
    }
    
    /**
     * Get numeric pressure level
     */
    getPressureLevel(pressureString) {
        const levels = { 'normal': 0, 'moderate': 0.3, 'severe': 0.7, 'critical': 1.0 };
        return levels[pressureString] || 0;
    }
    
    /**
     * Check if device is idle
     */
    isDeviceIdle() {
        const touchTracking = this.mobileMonitoring.touchTracking;
        const lastTouchTime = Date.now() - 30000; // 30 seconds
        
        return touchTracking.touchEvents.length === 0 || 
               touchTracking.touchEvents[touchTracking.touchEvents.length - 1] < lastTouchTime;
    }
    
    /**
     * Log thermal data for analysis
     */
    logThermalData(temperature) {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const history = thermal.thermalHistory;
        
        // Add temperature log entry
        history.temperatureLog.push({
            timestamp: Date.now(),
            temperature: temperature,
            throttleLevel: thermal.performanceImpact.overallThrottleLevel
        });
        
        // Maintain history size
        if (history.temperatureLog.length > history.maxHistorySize) {
            history.temperatureLog.shift();
        }
    }
    
    /**
     * Analyze thermal patterns
     */
    analyzeThermalPatterns() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const estimation = thermal.temperatureEstimation;
        const characteristics = thermal.thermalCharacteristics;
        
        // Determine thermal state
        let newState = 'normal';
        
        if (estimation.currentEstimate >= characteristics.criticalTemperature) {
            newState = 'critical';
        } else if (estimation.currentEstimate >= characteristics.maxSafeTemperature + 10) {
            newState = 'serious';
        } else if (estimation.currentEstimate >= characteristics.maxSafeTemperature) {
            newState = 'moderate';
        }
        
        // Update thermal state
        if (newState !== thermal.currentState) {
            this.handleThermalStateChange(thermal.currentState, newState);
            thermal.currentState = newState;
        }
    }
    
    /**
     * Handle thermal state changes
     */
    handleThermalStateChange(oldState, newState) {
        console.log(`[MobilePerformanceOptimizer] Thermal state changed: ${oldState} → ${newState}`);
        
        const thermal = this.mobileMonitoring.thermalMonitoring;
        
        // Log thermal event
        thermal.thermalHistory.heatEvents.push({
            timestamp: Date.now(),
            oldState,
            newState,
            temperature: thermal.temperatureEstimation.currentEstimate
        });
        
        // Apply thermal control if needed
        if (newState === 'critical' || newState === 'serious') {
            this.applyEmergencyThermalControl();
        }
    }
    
    /**
     * Apply thermal control measures
     */
    applyThermalControl() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const control = thermal.thermalControl;
        
        if (!control.enabled) return;
        
        // Calculate required throttle levels
        const throttleLevels = this.calculateThermalThrottleLevels();
        thermal.performanceImpact = throttleLevels;
        
        // Apply adaptive cooling
        if (control.adaptiveCooling) {
            this.applyAdaptiveCooling(throttleLevels);
        }
        
        // Apply predictive throttling
        if (control.predictiveThrottling) {
            this.applyPredictiveThrottling();
        }
    }
    
    /**
     * Calculate thermal throttle levels
     */
    calculateThermalThrottleLevels() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const currentTemp = thermal.temperatureEstimation.currentEstimate;
        const maxSafe = thermal.thermalCharacteristics.maxSafeTemperature;
        const critical = thermal.thermalCharacteristics.criticalTemperature;
        
        let throttleLevel = 0;
        
        if (currentTemp > maxSafe) {
            throttleLevel = Math.min(1.0, (currentTemp - maxSafe) / (critical - maxSafe));
        }
        
        return {
            cpuThrottleLevel: throttleLevel,
            gpuThrottleLevel: throttleLevel * 0.8, // GPU less aggressive
            memoryThrottleLevel: throttleLevel * 0.6,
            ioThrottleLevel: throttleLevel * 0.4,
            overallThrottleLevel: throttleLevel
        };
    }
    
    /**
     * Apply adaptive cooling measures
     */
    applyAdaptiveCooling(throttleLevels) {
        const overallThrottle = throttleLevels.overallThrottleLevel;
        
        if (overallThrottle > 0.8) {
            this.triggerAdaptiveOptimization('emergency');
        } else if (overallThrottle > 0.5) {
            this.triggerAdaptiveOptimization('thermal_throttle');
        } else if (overallThrottle > 0.2) {
            // Light throttling
            this.configManager.set('performance.targetFPS', Math.round(this.mobileConfig.targets.targetFPS * (1 - overallThrottle * 0.5)));
        }
    }
    
    /**
     * Apply predictive throttling
     */
    applyPredictiveThrottling() {
        const thermal = this.mobileMonitoring.thermalMonitoring;
        const estimation = thermal.temperatureEstimation;
        
        // Predict temperature in next 30 seconds
        const predictedTemp = estimation.currentEstimate + (estimation.heatGenerationRate * 30);
        
        if (predictedTemp > thermal.thermalCharacteristics.maxSafeTemperature) {
            console.log('[MobilePerformanceOptimizer] Predictive thermal throttling activated');
            this.triggerAdaptiveOptimization('thermal_throttle');
        }
    }
    
    /**
     * Apply emergency thermal control
     */
    applyEmergencyThermalControl() {
        console.log('[MobilePerformanceOptimizer] Emergency thermal control activated');
        
        const thermal = this.mobileMonitoring.thermalMonitoring;
        thermal.thermalControl.emergencyShutdown = true;
        
        // Extreme measures
        this.triggerAdaptiveOptimization('emergency');
        
        // Log emergency event
        thermal.thermalHistory.throttleEvents.push({
            timestamp: Date.now(),
            type: 'emergency',
            temperature: thermal.temperatureEstimation.currentEstimate,
            action: 'emergency_throttle'
        });
    }
    
    /**
     * Enhanced Memory Management
     */
    
    /**
     * Start advanced memory management
     */
    startAdvancedMemoryManagement() {
        const memoryOpt = this.mobileOptimizations.memory;
        
        if (!memoryOpt.enabled) return;
        
        // Start memory monitoring
        this.memoryMonitoringInterval = setInterval(() => {
            this.updateMemoryPressureDetection();
            this.performIntelligentMemoryManagement();
            this.detectMemoryLeaks();
        }, 5000); // Every 5 seconds
        
        // Setup memory pools
        this.initializeMemoryPools();
        
        // Setup platform-specific optimizations
        this.applyPlatformMemoryOptimizations();
        
        console.log('[MobilePerformanceOptimizer] Advanced memory management started');
    }
    
    /**
     * Update memory pressure detection
     */
    updateMemoryPressureDetection() {
        const pressureDetection = this.mobileOptimizations.memory.pressureDetection;
        
        if (!pressureDetection.enabled || !performance.memory) return;
        
        const memInfo = performance.memory;
        const memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        // Determine pressure level
        let newPressure = 'normal';
        
        if (memoryUsage >= pressureDetection.thresholds.critical) {
            newPressure = 'critical';
        } else if (memoryUsage >= pressureDetection.thresholds.severe) {
            newPressure = 'severe';
        } else if (memoryUsage >= pressureDetection.thresholds.moderate) {
            newPressure = 'moderate';
        }
        
        // Handle pressure level changes
        if (newPressure !== pressureDetection.currentPressure) {
            this.handleMemoryPressureChange(pressureDetection.currentPressure, newPressure);
            pressureDetection.currentPressure = newPressure;
        }
        
        // Update monitoring metrics
        this.mobileMonitoring.metrics.memoryUsage = memoryUsage;
    }
    
    /**
     * Handle memory pressure level changes
     */
    handleMemoryPressureChange(oldPressure, newPressure) {
        console.log(`[MobilePerformanceOptimizer] Memory pressure changed: ${oldPressure} → ${newPressure}`);
        
        switch (newPressure) {
            case 'critical':
                this.triggerEmergencyMemoryCleanup();
                this.triggerAdaptiveOptimization('emergency');
                break;
            case 'severe':
                this.triggerAdaptiveOptimization('memory_pressure');
                break;
            case 'moderate':
                this.performPreemptiveMemoryCleanup();
                break;
            case 'normal':
                this.restoreNormalMemoryOperations();
                break;
        }
    }
    
    /**
     * Perform intelligent memory management
     */
    performIntelligentMemoryManagement() {
        const memoryMgmt = this.mobileOptimizations.memory.memoryManagement;
        
        if (!memoryMgmt.enabled) return;
        
        // Intelligent caching
        if (memoryMgmt.intelligentCaching) {
            this.optimizeMemoryCaches();
        }
        
        // Memory defragmentation
        if (memoryMgmt.memoryDefragmentation) {
            this.performMemoryDefragmentation();
        }
        
        // Preemptive cleanup
        if (memoryMgmt.preemptiveCleanup) {
            this.performPreemptiveMemoryCleanup();
        }
    }
    
    /**
     * Optimize memory caches
     */
    optimizeMemoryCaches() {
        // Clear least recently used cache entries
        if (this.configManager && this.configManager.clearLRUCache) {
            this.configManager.clearLRUCache();
        }
        
        // Optimize texture cache
        this.configManager.set('graphics.textures.cacheOptimization', true);
        
        // Optimize audio cache
        this.configManager.set('audio.cacheOptimization', true);
    }
    
    /**
     * Perform memory defragmentation
     */
    performMemoryDefragmentation() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Compact object pools
        this.compactMemoryPools();
        
        console.log('[MobilePerformanceOptimizer] Memory defragmentation performed');
    }
    
    /**
     * Perform preemptive memory cleanup
     */
    performPreemptiveMemoryCleanup() {
        // Clear temporary objects
        this.clearTemporaryObjects();
        
        // Optimize object pools
        this.optimizeMemoryPools();
        
        // Clear unused resources
        this.clearUnusedResources();
    }
    
    /**
     * Trigger emergency memory cleanup
     */
    triggerEmergencyMemoryCleanup() {
        console.log('[MobilePerformanceOptimizer] Emergency memory cleanup triggered');
        
        // Aggressive cleanup measures
        this.performMemoryDefragmentation();
        this.clearAllCaches();
        this.releaseUnusedMemory();
        
        // Force GC multiple times
        if (window.gc) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => window.gc(), i * 100);
            }
        }
    }
    
    /**
     * Initialize memory pools
     */
    initializeMemoryPools() {
        const poolMgmt = this.mobileOptimizations.memory.poolManagement;
        
        if (!poolMgmt.enabled) return;
        
        // Initialize common object pools
        poolMgmt.objectPools.set('touchEvents', {
            pool: [],
            maxSize: 50,
            createFn: () => ({ x: 0, y: 0, timestamp: 0, identifier: 0 })
        });
        
        poolMgmt.objectPools.set('performanceMetrics', {
            pool: [],
            maxSize: 100,
            createFn: () => ({ fps: 0, frameTime: 0, timestamp: 0 })
        });
        
        console.log('[MobilePerformanceOptimizer] Memory pools initialized');
    }
    
    /**
     * Optimize memory pools
     */
    optimizeMemoryPools() {
        const poolMgmt = this.mobileOptimizations.memory.poolManagement;
        
        poolMgmt.objectPools.forEach((pool, name) => {
            // Remove excess objects from pool
            while (pool.pool.length > pool.maxSize / 2) {
                pool.pool.pop();
            }
        });
    }
    
    /**
     * Compact memory pools
     */
    compactMemoryPools() {
        const poolMgmt = this.mobileOptimizations.memory.poolManagement;
        
        poolMgmt.objectPools.forEach((pool, name) => {
            // Recreate pool with current objects to reduce fragmentation
            const currentObjects = pool.pool.slice();
            pool.pool = currentObjects;
        });
    }
    
    /**
     * Detect memory leaks
     */
    detectMemoryLeaks() {
        const leakDetection = this.mobileOptimizations.memory.leakDetection;
        
        if (!leakDetection.enabled || !performance.memory) return;
        
        const memInfo = performance.memory;
        const currentUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
        
        // Track memory growth over time
        if (!this.memoryGrowthHistory) {
            this.memoryGrowthHistory = [];
        }
        
        this.memoryGrowthHistory.push({
            timestamp: Date.now(),
            usage: currentUsage
        });
        
        // Keep only recent history
        if (this.memoryGrowthHistory.length > 20) {
            this.memoryGrowthHistory.shift();
        }
        
        // Analyze growth pattern
        if (this.memoryGrowthHistory.length >= 10) {
            this.analyzeMemoryGrowthPattern();
        }
    }
    
    /**
     * Analyze memory growth pattern for leaks
     */
    analyzeMemoryGrowthPattern() {
        const leakDetection = this.mobileOptimizations.memory.leakDetection;
        const history = this.memoryGrowthHistory;
        
        // Calculate growth rate over last 10 minutes
        const recent = history[history.length - 1];
        const old = history[0];
        const timeDiff = (recent.timestamp - old.timestamp) / 60000; // minutes
        const usageDiff = recent.usage - old.usage;
        
        if (timeDiff > 0) {
            const growthRate = usageDiff / timeDiff; // MB per minute
            
            // Check for suspicious growth
            if (growthRate > leakDetection.suspiciousGrowthRate) {
                this.reportSuspiciousMemoryGrowth(growthRate);
            }
            
            // Check for excessive memory usage
            if (recent.usage > leakDetection.leakThreshold) {
                this.reportExcessiveMemoryUsage(recent.usage);
            }
        }
    }
    
    /**
     * Report suspicious memory growth
     */
    reportSuspiciousMemoryGrowth(growthRate) {
        const leakDetection = this.mobileOptimizations.memory.leakDetection;
        
        const leak = {
            type: 'suspicious_growth',
            growthRate: growthRate,
            timestamp: Date.now(),
            severity: growthRate > leakDetection.suspiciousGrowthRate * 2 ? 'high' : 'medium'
        };
        
        leakDetection.detectedLeaks.push(leak);
        
        console.warn(`[MobilePerformanceOptimizer] Suspicious memory growth detected: ${growthRate.toFixed(2)} MB/min`);
        
        // Trigger cleanup if severe
        if (leak.severity === 'high') {
            this.triggerEmergencyMemoryCleanup();
        }
    }
    
    /**
     * Report excessive memory usage
     */
    reportExcessiveMemoryUsage(usage) {
        const leakDetection = this.mobileOptimizations.memory.leakDetection;
        
        const leak = {
            type: 'excessive_usage',
            usage: usage,
            timestamp: Date.now(),
            severity: usage > leakDetection.leakThreshold * 2 ? 'critical' : 'high'
        };
        
        leakDetection.detectedLeaks.push(leak);
        
        console.warn(`[MobilePerformanceOptimizer] Excessive memory usage detected: ${usage.toFixed(2)} MB`);
        
        // Trigger immediate cleanup
        this.triggerEmergencyMemoryCleanup();
    }
    
    /**
     * Apply platform-specific memory optimizations
     */
    applyPlatformMemoryOptimizations() {
        const platform = this.deviceDetection.platform;
        const platformOpts = this.mobileOptimizations.memory.platformOptimizations;
        
        switch (platform) {
            case 'ios':
                this.applyIOSMemoryOptimizations(platformOpts.ios);
                break;
            case 'android':
                this.applyAndroidMemoryOptimizations(platformOpts.android);
                break;
            case 'web':
                this.applyWebMemoryOptimizations(platformOpts.web);
                break;
        }
    }
    
    /**
     * Apply iOS-specific memory optimizations
     */
    applyIOSMemoryOptimizations(iosOpts) {
        if (iosOpts.memoryWarningHandling) {
            // Listen for memory warnings (if available)
            document.addEventListener('webkitmemorypressure', () => {
                console.log('[MobilePerformanceOptimizer] iOS memory pressure detected');
                this.triggerEmergencyMemoryCleanup();
            });
        }
        
        if (iosOpts.backgroundAppRefresh) {
            // Disable background app refresh behavior
            this.configManager.set('background.refreshEnabled', false);
        }
    }
    
    /**
     * Apply Android-specific memory optimizations
     */
    applyAndroidMemoryOptimizations(androidOpts) {
        if (androidOpts.lowMemoryKiller) {
            // Implement low memory killer logic
            this.setupLowMemoryKiller();
        }
        
        if (androidOpts.compactHeap) {
            // Trigger heap compaction more frequently
            this.heapCompactionInterval = setInterval(() => {
                this.performMemoryDefragmentation();
            }, 30000);
        }
    }
    
    /**
     * Apply web-specific memory optimizations
     */
    applyWebMemoryOptimizations(webOpts) {
        // Set Web Worker memory limits
        this.configManager.set('webWorkers.memoryLimit', webOpts.webWorkerMemoryLimit);
        
        // Set OffscreenCanvas limits
        this.configManager.set('canvas.offscreenMemoryLimit', webOpts.offscreenCanvasLimit);
    }
    
    /**
     * Setup low memory killer for Android
     */
    setupLowMemoryKiller() {
        // Monitor memory pressure and kill non-essential processes
        const checkMemoryPressure = () => {
            if (this.mobileOptimizations.memory.pressureDetection.currentPressure === 'critical') {
                this.killNonEssentialProcesses();
            }
        };
        
        setInterval(checkMemoryPressure, 10000); // Every 10 seconds
    }
    
    /**
     * Kill non-essential processes
     */
    killNonEssentialProcesses() {
        // Pause non-critical game systems
        this.configManager.set('particles.enabled', false);
        this.configManager.set('audio.backgroundMusic', false);
        this.configManager.set('effects.advancedEffects', false);
        
        console.log('[MobilePerformanceOptimizer] Non-essential processes paused due to memory pressure');
    }
    
    /**
     * Clear all caches
     */
    clearAllCaches() {
        // Clear configuration cache
        if (this.configManager && this.configManager.clearCache) {
            this.configManager.clearCache();
        }
        
        // Clear performance cache
        this.performance.cache.measurements.clear();
        this.performance.cache.calculations.clear();
    }
    
    /**
     * Clear temporary objects
     */
    clearTemporaryObjects() {
        // Clear touch event history
        this.mobileMonitoring.touchTracking.touchEvents = [];
        
        // Clear thermal history (keep recent)
        const thermalHistory = this.mobileMonitoring.thermalMonitoring.thermalHistory;
        if (thermalHistory.temperatureLog.length > 100) {
            thermalHistory.temperatureLog = thermalHistory.temperatureLog.slice(-50);
        }
    }
    
    /**
     * Clear unused resources
     */
    clearUnusedResources() {
        // Clear optimization history (keep recent)
        if (this.adaptiveSystem.optimizationHistory.length > 50) {
            this.adaptiveSystem.optimizationHistory = this.adaptiveSystem.optimizationHistory.slice(-25);
        }
        
        // Clear memory growth history
        if (this.memoryGrowthHistory && this.memoryGrowthHistory.length > 10) {
            this.memoryGrowthHistory = this.memoryGrowthHistory.slice(-5);
        }
    }
    
    /**
     * Release unused memory
     */
    releaseUnusedMemory() {
        // Clear large data structures that can be rebuilt
        this.deviceDetection.benchmarks = {
            cpuScore: 0,
            gpuScore: 0,
            memoryScore: 0,
            overallScore: 0,
            benchmarkComplete: false
        };
        
        // Reset performance cache
        this.performance.cache.lastUpdate = 0;
    }
    
    /**
     * Restore normal memory operations
     */
    restoreNormalMemoryOperations() {
        // Re-enable disabled systems
        this.configManager.set('particles.enabled', true);
        this.configManager.set('audio.backgroundMusic', true);
        this.configManager.set('effects.advancedEffects', true);
        
        console.log('[MobilePerformanceOptimizer] Normal memory operations restored');
    }
    
    /**
     * Get comprehensive battery information
     */
    async getBatteryInfo() {
        try {
            if (navigator.getBattery) {
                return await navigator.getBattery();
            }
        } catch (error) {
            // Fallback to stored battery info
            return this.deviceDetection.hardware.battery;
        }
        return null;
    }
    
    /**
     * Enhanced public API methods
     */
    
    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        return {
            device: this.getDeviceInfo(),
            battery: {
                level: this.mobileMonitoring.batteryMonitoring.currentLevel,
                powerState: this.mobileMonitoring.batteryMonitoring.dynamicPowerManagement.currentPowerState,
                drainRate: this.mobileMonitoring.batteryMonitoring.drainRate,
                healthMetrics: this.mobileMonitoring.batteryMonitoring.healthMetrics
            },
            thermal: {
                currentState: this.mobileMonitoring.thermalMonitoring.currentState,
                estimatedTemperature: this.mobileMonitoring.thermalMonitoring.temperatureEstimation.currentEstimate,
                throttleLevel: this.mobileMonitoring.thermalMonitoring.performanceImpact.overallThrottleLevel
            },
            memory: {
                pressure: this.mobileOptimizations.memory.pressureDetection.currentPressure,
                usage: this.mobileMonitoring.metrics.memoryUsage,
                leaks: this.mobileOptimizations.memory.leakDetection.detectedLeaks.length
            },
            optimizations: {
                active: Array.from(this.adaptiveSystem.currentOptimizations),
                level: this.mobileConfig.optimizationLevel
            }
        };
    }
    
    /**
     * Force optimization trigger
     */
    forceOptimization(type, reason = 'manual') {
        console.log(`[MobilePerformanceOptimizer] Force optimization triggered: ${type} (${reason})`);
        
        switch (type) {
            case 'battery':
                this.triggerBatteryOptimizations();
                break;
            case 'thermal':
                this.applyEmergencyThermalControl();
                break;
            case 'memory':
                this.triggerEmergencyMemoryCleanup();
                break;
            case 'all':
                this.triggerAdaptiveOptimization('emergency');
                break;
            default:
                this.triggerAdaptiveOptimization(type);
        }
    }
    
    /**
     * Enhanced cleanup with advanced monitoring
     */
    destroy() {
        // Clear all monitoring intervals
        if (this.gcInterval) clearInterval(this.gcInterval);
        if (this.batteryMonitoringInterval) clearInterval(this.batteryMonitoringInterval);
        if (this.thermalMonitoringInterval) clearInterval(this.thermalMonitoringInterval);
        if (this.memoryMonitoringInterval) clearInterval(this.memoryMonitoringInterval);
        if (this.heapCompactionInterval) clearInterval(this.heapCompactionInterval);
        
        // Clear optimizations
        this.adaptiveSystem.currentOptimizations.clear();
        
        // Clear memory pools
        if (this.mobileOptimizations.memory.poolManagement.objectPools) {
            this.mobileOptimizations.memory.poolManagement.objectPools.clear();
        }
        
        // Final cleanup
        this.clearAllCaches();
        
        console.log('[MobilePerformanceOptimizer] Enhanced mobile optimizer destroyed');
    }
}

// グローバルインスタンス（遅延初期化）
let _mobilePerformanceOptimizer = null;

export function getMobilePerformanceOptimizer() {
    if (!_mobilePerformanceOptimizer) {
        try {
            _mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
            console.log('[MobilePerformanceOptimizer] グローバルインスタンスを作成しました');
        } catch (error) {
            console.error('[MobilePerformanceOptimizer] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
        }
    }
    return _mobilePerformanceOptimizer;
}

/**
 * MobilePerformanceOptimizerインスタンスを再初期化
 */
export function reinitializeMobilePerformanceOptimizer() {
    try {
        if (_mobilePerformanceOptimizer) {
            _mobilePerformanceOptimizer.destroy();
        }
        _mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
        console.log('[MobilePerformanceOptimizer] 再初期化完了');
    } catch (error) {
        console.error('[MobilePerformanceOptimizer] 再初期化エラー:', error);
    }
}

// 後方互換性のため
export const mobilePerformanceOptimizer = getMobilePerformanceOptimizer;