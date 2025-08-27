import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { MobileEffectOptimizer } from './MobileEffectOptimizer.js';
import { MobileResourceManager } from './MobileResourceManager.js';

/**
 * モバイル効果統合管理クラス
 * モバイル最適化とリソース管理を統合し、一元的なモバイル対応を提供
 */
export class MobileEffectIntegrator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.effectManager = null;
        this.mobileOptimizer = null;
        this.resourceManager = null;
        
        this.state = {
            initialized: false,
            mobileMode: false,
            adaptiveMode: true,
            performanceMode: 'auto'
        };
        
        // 統合設定
        this.integrationConfig = {
            enableAutoDetection: true,
            enableAdaptiveQuality: true,
            enableResourceOptimization: true,
            enableTouchOptimization: true,
            enableBatteryOptimization: true,
            enableNetworkOptimization: true
        };
        
        // パフォーマンス閾値
        this.performanceThresholds = {
            fps: {
                excellent: 55,
                good: 45,
                acceptable: 30,
                poor: 20
            },
            memory: {
                low: 0.6,
                medium: 0.75,
                high: 0.9
            },
            battery: {
                critical: 0.15,
                low: 0.3,
                medium: 0.6
            }
        };
        
        // 適応戦略
        this.adaptationStrategies = new Map([
            ['performance-critical', {
                priority: 'performance',
                particleReduction: 0.3,
                effectQuality: 'minimal',
                disableAdvanced: true,
                targetFPS: 30
            }],
            ['balanced', {
                priority: 'balanced',
                particleReduction: 0.7,
                effectQuality: 'medium',
                disableAdvanced: false,
                targetFPS: 45
            }],
            ['quality-focused', {
                priority: 'quality',
                particleReduction: 1.0,
                effectQuality: 'high',
                disableAdvanced: false,
                targetFPS: 60
            }]
        ]);
        
        console.log('MobileEffectIntegrator initialized');
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            console.log('Initializing mobile effect integration...');
            
            // 必要なシステムの取得
            this.effectManager = this.gameEngine.effectManager;
            if (!this.effectManager) {
                throw new Error('EffectManager not found in GameEngine');
            }
            
            // モバイル最適化システムの初期化
            this.mobileOptimizer = new MobileEffectOptimizer(this.effectManager);
            await this.mobileOptimizer.initialize();
            
            // リソース管理システムの初期化
            this.resourceManager = new MobileResourceManager();
            await this.resourceManager.initialize();
            
            // モバイルモードの自動検出
            this.detectMobileMode();
            
            // 統合設定の適用
            await this.applyIntegrationSettings();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 適応的品質制御の開始
            this.startAdaptiveQualityControl();
            
            this.state.initialized = true;
            console.log('Mobile effect integration initialized successfully');
            console.log('Mobile mode:', this.state.mobileMode);
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'MOBILE_INTEGRATION_ERROR', {
                operation: 'initialize',
                component: 'MobileEffectIntegrator'
            });
            return false;
        }
    }
    
    /**
     * モバイルモードの検出
     */
    detectMobileMode() {
        if (!this.integrationConfig.enableAutoDetection) return;
        
        const deviceInfo = this.mobileOptimizer?.getDeviceInfo();
        if (deviceInfo) {
            this.state.mobileMode = deviceInfo.isMobile || deviceInfo.isTablet;
            
            // パフォーマンスモードの自動設定
            if (deviceInfo.profile === 'ultra-low' || deviceInfo.profile === 'low-end') {
                this.state.performanceMode = 'performance-critical';
            } else if (deviceInfo.profile === 'mid-range') {
                this.state.performanceMode = 'balanced';
            } else {
                this.state.performanceMode = 'quality-focused';
            }
        } else {
            // フォールバック検出
            this.state.mobileMode = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
            this.state.performanceMode = this.state.mobileMode ? 'balanced' : 'quality-focused';
        }
        
        console.log(`Mobile mode detected: ${this.state.mobileMode}, Performance mode: ${this.state.performanceMode}`);
    }
    
    /**
     * 統合設定の適用
     */
    async applyIntegrationSettings() {
        if (!this.state.mobileMode) return;
        
        console.log('Applying mobile integration settings...');
        
        // モバイル最適化の有効化
        if (this.integrationConfig.enableResourceOptimization && this.mobileOptimizer) {
            this.mobileOptimizer.setOptimizationLevel('balanced');
        }
        
        // リソース管理設定の調整  
        if (this.integrationConfig.enableResourceOptimization && this.resourceManager) {
            const deviceInfo = this.mobileOptimizer?.getDeviceInfo();
            this.adjustResourceSettings(deviceInfo);
        }
        
        // エフェクトマネージャーとの統合
        await this.integrateWithEffectManager();
        
        console.log('Mobile integration settings applied');
    }
    
    /**
     * リソース設定の調整
     */
    adjustResourceSettings(deviceInfo) {
        if (!deviceInfo) return;
        
        const memoryGB = deviceInfo.performanceMemory 
            ? deviceInfo.performanceMemory.jsHeapSizeLimit / (1024 * 1024 * 1024) 
            : 1;
        
        const resourceSettings = {
            memory: {
                maxHeapUsage: memoryGB < 1 ? 0.7 : 0.8,
                gcThreshold: memoryGB < 1 ? 0.6 : 0.7,
                cleanupInterval: memoryGB < 1 ? 3000 : 5000
            },
            network: {
                dataUsageLimit: this.getDataUsageLimit(deviceInfo),
                compressionLevel: deviceInfo.profile === 'ultra-low' ? 0.6 : 0.8
            }
        };
        
        this.resourceManager.updateSettings(resourceSettings);
    }
    
    /**
     * データ使用制限の取得
     */
    getDataUsageLimit(deviceInfo) {
        const baseLimits = {
            'ultra-low': 2 * 1024 * 1024,  // 2MB
            'low-end': 5 * 1024 * 1024,    // 5MB
            'mid-range': 10 * 1024 * 1024, // 10MB
            'high-end': 20 * 1024 * 1024   // 20MB
        };
        
        return baseLimits[deviceInfo.profile] || baseLimits['mid-range'];
    }
    
    /**
     * エフェクトマネージャーとの統合
     */
    async integrateWithEffectManager() {
        // EnhancedEffectManagerの拡張
        if (this.effectManager.enhancedEffectManager) {
            this.extendEnhancedEffectManager();
        }
        
        // EnhancedParticleManagerの拡張
        if (this.effectManager.enhancedParticleManager) {
            this.extendEnhancedParticleManager();
        }
        
        // AnimationManagerの拡張
        if (this.effectManager.animationManager) {
            this.extendAnimationManager();
        }
    }
    
    /**
     * EnhancedEffectManagerの拡張
     */
    extendEnhancedEffectManager() {
        const effectManager = this.effectManager.enhancedEffectManager;
        
        // 元のメソッドを保存
        const originalAddTransitionEffect = effectManager.addTransitionEffect?.bind(effectManager);
        const originalAddLightingEffect = effectManager.addLightingEffect?.bind(effectManager);
        
        // モバイル最適化版に置き換え
        effectManager.addTransitionEffect = (type, duration, options = {}) => {
            // モバイル最適化を適用
            const optimizedOptions = this.optimizeTransitionEffect(type, duration, options);
            
            if (originalAddTransitionEffect) {
                return originalAddTransitionEffect(type, optimizedOptions.duration, optimizedOptions);
            }
            return null;
        };
        
        effectManager.addLightingEffect = (x, y, intensity, color, radius) => {
            // モバイル最適化を適用
            const optimized = this.optimizeLightingEffect({ x, y, intensity, color, radius });
            
            if (originalAddLightingEffect) {
                return originalAddLightingEffect(
                    optimized.x, optimized.y, optimized.intensity, 
                    optimized.color, optimized.radius
                );
            }
            return null;
        };
    }
    
    /**
     * EnhancedParticleManagerの拡張
     */
    extendEnhancedParticleManager() {
        const particleManager = this.effectManager.enhancedParticleManager;
        
        // 元のメソッドを保存
        const originalCreateAdvancedBubbleEffect = particleManager.createAdvancedBubbleEffect?.bind(particleManager);
        
        // モバイル最適化版に置き換え
        particleManager.createAdvancedBubbleEffect = (x, y, bubbleType, bubbleSize, options = {}) => {
            // モバイル最適化を適用
            const optimizedOptions = this.optimizeBubbleEffect(bubbleType, options);
            
            // リソースプールからパーティクルを取得
            const pooledParticles = this.acquirePooledParticles(optimizedOptions.particleCount || 15);
            if (pooledParticles) {
                optimizedOptions.pooledParticles = pooledParticles;
            }
            
            if (originalCreateAdvancedBubbleEffect) {
                return originalCreateAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, optimizedOptions);
            }
            return null;
        };
    }
    
    /**
     * AnimationManagerの拡張
     */
    extendAnimationManager() {
        const animationManager = this.effectManager.animationManager;
        
        // 元のメソッドを保存
        const originalAnimateUIElement = animationManager.animateUIElement?.bind(animationManager);
        
        // モバイル最適化版に置き換え
        animationManager.animateUIElement = (element, animationType, duration, options = {}) => {
            // モバイル最適化を適用
            const optimized = this.optimizeUIAnimation(animationType, duration, options);
            
            if (originalAnimateUIElement) {
                return originalAnimateUIElement(element, optimized.type, optimized.duration, optimized.options);
            }
            return null;
        };
    }
    
    /**
     * 遷移効果の最適化
     */
    optimizeTransitionEffect(type, duration, options) {
        if (!this.state.mobileMode) return { duration, ...options };
        
        const strategy = this.adaptationStrategies.get(this.state.performanceMode);
        if (!strategy) return { duration, ...options };
        
        return {
            duration: Math.floor(duration * 0.8), // 20%短縮
            ...options,
            intensity: (options.intensity || 1.0) * 0.8,
            quality: strategy.effectQuality
        };
    }
    
    /**
     * 光源効果の最適化
     */
    optimizeLightingEffect({ x, y, intensity, color, radius }) {
        if (!this.state.mobileMode) return { x, y, intensity, color, radius };
        
        const strategy = this.adaptationStrategies.get(this.state.performanceMode);
        if (!strategy) return { x, y, intensity, color, radius };
        
        return {
            x, y, color,
            intensity: intensity * 0.7, // 30%削減
            radius: radius * 0.8 // 20%削減
        };
    }
    
    /**
     * バブル効果の最適化
     */
    optimizeBubbleEffect(bubbleType, options) {
        if (!this.state.mobileMode) return options;
        
        const strategy = this.adaptationStrategies.get(this.state.performanceMode);
        if (!strategy) return options;
        
        const baseParticleCount = this.getBubbleParticleCount(bubbleType);
        const optimizedCount = Math.floor(baseParticleCount * strategy.particleReduction);
        
        return {
            ...options,
            particleCount: optimizedCount,
            quality: strategy.effectQuality,
            duration: (options.duration || 1000) * 0.8,
            usePooling: true
        };
    }
    
    /**
     * UIアニメーションの最適化
     */
    optimizeUIAnimation(animationType, duration, options) {
        if (!this.state.mobileMode) return { type: animationType, duration, options };
        
        const strategy = this.adaptationStrategies.get(this.state.performanceMode);
        if (!strategy) return { type: animationType, duration, options };
        
        // 複雑なアニメーションを簡単なものに変更
        const simplifiedAnimations = {
            'bounce': 'ease-out',
            'spring': 'ease-in-out',
            'elastic': 'ease-out'
        };
        
        const optimizedType = strategy.disableAdvanced 
            ? (simplifiedAnimations[animationType] || animationType)
            : animationType;
        
        return {
            type: optimizedType,
            duration: Math.floor(duration * 0.8),
            options: {
                ...options,
                quality: strategy.effectQuality
            }
        };
    }
    
    /**
     * バブルタイプ別パーティクル数の取得
     */
    getBubbleParticleCount(bubbleType) {
        const particleCounts = {
            'normal': 15,
            'stone': 20,
            'iron': 25,
            'diamond': 30,
            'boss': 50,
            'electric': 25,
            'rainbow': 35,
            'golden': 40
        };
        
        return particleCounts[bubbleType] || 15;
    }
    
    /**
     * プールされたパーティクルの取得
     */
    acquirePooledParticles(count) {
        if (!this.resourceManager) return null;
        
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = this.resourceManager.acquireResource('particles');
            if (particle) {
                particles.push(particle);
            }
        }
        
        return particles.length > 0 ? particles : null;
    }
    
    /**
     * 適応的品質制御の開始
     */
    startAdaptiveQualityControl() {
        if (!this.integrationConfig.enableAdaptiveQuality) return;
        
        console.log('Starting adaptive quality control...');
        
        setInterval(() => {
            this.performQualityAdaptation();
        }, 2000); // 2秒ごと
    }
    
    /**
     * 品質適応の実行
     */
    performQualityAdaptation() {
        if (!this.state.adaptiveMode) return;
        
        // パフォーマンスメトリクス取得
        const mobileMetrics = this.mobileOptimizer?.getPerformanceMetrics();
        const resourceStats = this.resourceManager?.getStatistics();
        
        if (!mobileMetrics || !resourceStats) return;
        
        // 現在の状況を評価
        const currentCondition = this.evaluateCurrentCondition(mobileMetrics, resourceStats);
        
        // 必要に応じて戦略を調整
        if (currentCondition !== this.state.performanceMode) {
            this.adaptToCondition(currentCondition);
        }
    }
    
    /**
     * 現在の状況評価
     */
    evaluateCurrentCondition(mobileMetrics, resourceStats) {
        const fps = mobileMetrics.averageFPS;
        const memoryUsage = resourceStats.memoryUsage;
        const batteryLevel = mobileMetrics.batteryLevel;
        
        // クリティカル条件
        if (fps < this.performanceThresholds.fps.poor || 
            memoryUsage > this.performanceThresholds.memory.high ||
            batteryLevel < this.performanceThresholds.battery.critical) {
            return 'performance-critical';
        }
        
        // バランス条件
        if (fps < this.performanceThresholds.fps.good || 
            memoryUsage > this.performanceThresholds.memory.medium ||
            batteryLevel < this.performanceThresholds.battery.low) {
            return 'balanced';
        }
        
        // 品質重視条件
        return 'quality-focused';
    }
    
    /**
     * 条件に応じた適応
     */
    adaptToCondition(newCondition) {
        console.log(`Adapting to condition: ${this.state.performanceMode} -> ${newCondition}`);
        
        this.state.performanceMode = newCondition;
        const strategy = this.adaptationStrategies.get(newCondition);
        
        if (!strategy) return;
        
        // モバイル最適化レベルの調整
        if (this.mobileOptimizer) {
            const optimizationLevel = {
                'performance-critical': 'aggressive',
                'balanced': 'balanced',
                'quality-focused': 'minimal'
            }[newCondition];
            
            this.mobileOptimizer.setOptimizationLevel(optimizationLevel);
        }
        
        // エフェクト品質の調整
        if (this.effectManager?.setQualityLevel) {
            this.effectManager.setQualityLevel(strategy.effectQuality);
        }
        
        // リソース管理の調整
        this.adjustResourceManagement(strategy);
    }
    
    /**
     * リソース管理の調整
     */
    adjustResourceManagement(strategy) {
        if (!this.resourceManager) return;
        
        const memorySettings = {
            maxHeapUsage: strategy.priority === 'performance' ? 0.7 : 0.8,
            gcThreshold: strategy.priority === 'performance' ? 0.6 : 0.7,
            cleanupInterval: strategy.priority === 'performance' ? 3000 : 5000
        };
        
        this.resourceManager.updateSettings({ memory: memorySettings });
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // バッテリーレベル変更
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => {
                    this.handleBatteryChange(battery.level);
                });
                
                battery.addEventListener('chargingchange', () => {
                    this.handleChargingChange(battery.charging);
                });
            });
        }
        
        // ネットワーク状態変更
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.handleNetworkChange();
            });
        }
        
        // 画面方向・サイズ変更
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        window.addEventListener('resize', () => {
            this.handleScreenResize();
        });
        
        // アプリケーション状態変更
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    /**
     * バッテリー変更の処理
     */
    handleBatteryChange(level) {
        console.log(`Battery level changed: ${(level * 100).toFixed(1)}%`);
        
        if (!this.integrationConfig.enableBatteryOptimization) return;
        
        if (level < this.performanceThresholds.battery.critical) {
            this.forceLowPowerMode();
        } else if (level < this.performanceThresholds.battery.low) {
            this.enableBatteryOptimization();
        } else {
            this.disableBatteryOptimization();
        }
    }
    
    /**
     * 充電状態変更の処理
     */
    handleChargingChange(isCharging) {
        console.log(`Charging state changed: ${isCharging}`);
        
        if (isCharging) {
            // 充電中は品質を向上
            if (this.state.performanceMode === 'performance-critical') {
                this.adaptToCondition('balanced');
            }
        } else {
            // 非充電時はバッテリー最適化
            this.enableBatteryOptimization();
        }
    }
    
    /**
     * ネットワーク変更の処理
     */
    handleNetworkChange() {
        console.log('Network conditions changed');
        
        if (!this.integrationConfig.enableNetworkOptimization) return;
        
        // ネットワーク状態に応じたリソース読み込み調整
        if (this.resourceManager) {
            const connection = navigator.connection;
            const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
            
            if (isSlowConnection) {
                // 低速接続時はリソース読み込みを制限
                this.resourceManager.updateSettings({
                    network: {
                        dataUsageLimit: 1 * 1024 * 1024, // 1MB
                        compressionLevel: 0.6
                    }
                });
            }
        }
    }
    
    /**
     * 画面方向変更の処理
     */
    handleOrientationChange() {
        console.log('Orientation changed');
        
        // 方向変更時の一時的品質低下
        this.temporaryQualityReduction(1000);
    }
    
    /**
     * 画面サイズ変更の処理
     */
    handleScreenResize() {
        console.log('Screen resized');
        
        // サイズ変更時の一時的品質低下
        this.temporaryQualityReduction(500);
    }
    
    /**
     * 表示状態変更の処理
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.handleAppHidden();
        } else {
            this.handleAppVisible();
        }
    }
    
    /**
     * 低電力モードの強制有効化
     */
    forceLowPowerMode() {
        console.log('Forcing low power mode');
        
        this.adaptToCondition('performance-critical');
        
        // 追加の低電力設定
        if (this.mobileOptimizer) {
            this.mobileOptimizer.setOptimizationLevel('aggressive');
        }
        
        if (this.effectManager?.setTargetFPS) {
            this.effectManager.setTargetFPS(20);
        }
    }
    
    /**
     * バッテリー最適化の有効化
     */
    enableBatteryOptimization() {
        console.log('Enabling battery optimization');
        
        if (this.state.performanceMode === 'quality-focused') {
            this.adaptToCondition('balanced');
        }
    }
    
    /**
     * バッテリー最適化の無効化
     */
    disableBatteryOptimization() {
        console.log('Disabling battery optimization');
        
        // 通常の品質に戻す（条件が許せば）
        if (this.state.performanceMode === 'performance-critical') {
            const mobileMetrics = this.mobileOptimizer?.getPerformanceMetrics();
            if (mobileMetrics && mobileMetrics.averageFPS > this.performanceThresholds.fps.good) {
                this.adaptToCondition('quality-focused');
            }
        }
    }
    
    /**
     * 一時的品質低下
     */
    temporaryQualityReduction(duration) {
        const originalMode = this.state.performanceMode;
        
        // 一時的に品質を下げる
        this.adaptToCondition('performance-critical');
        
        // 指定時間後に元に戻す
        setTimeout(() => {
            this.adaptToCondition(originalMode);
        }, duration);
    }
    
    /**
     * アプリ非表示時の処理
     */
    handleAppHidden() {
        console.log('App hidden, reducing resource usage');
        
        // エフェクトの一時停止
        if (this.effectManager?.pauseAllEffects) {
            this.effectManager.pauseAllEffects();
        }
        
        // リソース解放
        if (this.resourceManager) {
            // 非必須リソースを解放
        }
    }
    
    /**
     * アプリ表示時の処理
     */
    handleAppVisible() {
        console.log('App visible, resuming normal operation');
        
        // エフェクトの再開
        if (this.effectManager?.resumeAllEffects) {
            this.effectManager.resumeAllEffects();
        }
        
        // 必要に応じて品質を調整
        this.performQualityAdaptation();
    }
    
    /**
     * モバイル統合の設定
     */
    setMobileMode(enabled) {
        this.state.mobileMode = enabled;
        
        if (enabled) {
            this.applyIntegrationSettings();
            this.startAdaptiveQualityControl();
        } else {
            // デスクトップモードに戻す
            if (this.mobileOptimizer) {
                this.mobileOptimizer.setOptimizationLevel('minimal');
            }
        }
        
        console.log(`Mobile mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 適応モードの切り替え
     */
    setAdaptiveMode(enabled) {
        this.state.adaptiveMode = enabled;
        console.log(`Adaptive mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * パフォーマンスモードの手動設定
     */
    setPerformanceMode(mode) {
        if (this.adaptationStrategies.has(mode)) {
            this.state.adaptiveMode = false; // 手動モードでは適応を無効化
            this.adaptToCondition(mode);
            console.log(`Performance mode manually set to: ${mode}`);
        } else {
            console.warn(`Unknown performance mode: ${mode}`);
        }
    }
    
    /**
     * 統合状態の取得
     */
    getIntegrationStatus() {
        return {
            initialized: this.state.initialized,
            mobileMode: this.state.mobileMode,
            adaptiveMode: this.state.adaptiveMode,
            performanceMode: this.state.performanceMode,
            optimizerStatus: this.mobileOptimizer?.getOptimizationStatus() || null,
            resourceStatus: this.resourceManager?.getStatistics() || null,
            configuration: { ...this.integrationConfig }
        };
    }
    
    /**
     * パフォーマンスレポートの生成
     */
    generatePerformanceReport() {
        const optimizerReport = this.mobileOptimizer?.generateReport() || {};
        const resourceReport = this.resourceManager?.generateReport() || {};
        
        return {
            component: 'MobileEffectIntegrator',
            timestamp: new Date().toISOString(),
            state: { ...this.state },
            integrationConfig: { ...this.integrationConfig },
            performance: {
                thresholds: this.performanceThresholds,
                strategies: Object.fromEntries(this.adaptationStrategies),
                optimizer: optimizerReport,
                resources: resourceReport
            }
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying MobileEffectIntegrator...');
        
        // 子システムのクリーンアップ
        if (this.mobileOptimizer) {
            this.mobileOptimizer.destroy();
            this.mobileOptimizer = null;
        }
        
        if (this.resourceManager) {
            this.resourceManager.destroy();
            this.resourceManager = null;
        }
        
        // イベントリスナーの削除
        if (navigator.connection) {
            navigator.connection.removeEventListener('change', this.handleNetworkChange);
        }
        
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleScreenResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 参照のクリア
        this.gameEngine = null;
        this.effectManager = null;
        
        this.state.initialized = false;
        console.log('MobileEffectIntegrator destroyed');
    }
}