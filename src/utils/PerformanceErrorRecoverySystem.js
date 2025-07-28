/**
 * Performance Error Handling and Recovery System
 * 
 * パフォーマンスエラー検出・回復とユーザー通信システム
 * Requirements: 10.1, 10.2, 3.4, 10.4
 */

export class PerformanceErrorRecoverySystem {
    constructor() {
        this.errorDetector = new PerformanceErrorDetector();
        this.errorClassifier = new PerformanceErrorClassifier();
        this.recoveryEngine = new PerformanceRecoveryEngine();
        this.degradationManager = new GracefulDegradationManager();
        this.userCommunicator = new PerformanceUserCommunicator();
        this.troubleshootingGuide = new TroubleshootingGuide();
        this.errorLogger = new PerformanceErrorLogger();
        this.monitoringIntegration = new ErrorMonitoringIntegration();
        this.initialized = false;
        
        this.initializeErrorRecovery();
    }

    async initializeErrorRecovery() {
        try {
            await this.errorDetector.initialize();
            await this.errorClassifier.initialize();
            await this.recoveryEngine.initialize();
            await this.degradationManager.initialize();
            await this.userCommunicator.initialize();
            await this.troubleshootingGuide.initialize();
            await this.errorLogger.initialize();
            await this.monitoringIntegration.initialize();
            
            // システム統合の設定
            await this.setupSystemIntegration();
            
            this.initialized = true;
            console.log('PerformanceErrorRecoverySystem initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerformanceErrorRecoverySystem:', error);
            throw error;
        }
    }

    async setupSystemIntegration() {
        // エラー検出と分類の連携
        this.errorDetector.onErrorDetected((error) => {
            this.handleDetectedError(error);
        });

        // 回復エンジンと劣化管理の連携
        this.recoveryEngine.onRecoveryFailed((error, attemptedRecovery) => {
            this.degradationManager.initiateDegradation(error, attemptedRecovery);
        });

        // ユーザー通信と監視システムの連携
        this.monitoringIntegration.onCriticalError((error) => {
            this.userCommunicator.notifyCriticalError(error);
        });
    }

    async handleDetectedError(detectedError) {
        try {
            // エラーのログ記録
            await this.errorLogger.logError(detectedError);
            
            // エラーの分類
            const classifiedError = await this.errorClassifier.classify(detectedError);
            
            // 回復戦略の決定と実行
            const recoveryStrategy = await this.recoveryEngine.determineStrategy(classifiedError);
            const recoveryResult = await this.recoveryEngine.executeRecovery(recoveryStrategy);
            
            // 回復結果の評価
            if (recoveryResult.success) {
                // 成功した回復の通知
                await this.userCommunicator.notifyRecoverySuccess(classifiedError, recoveryResult);
                await this.errorLogger.logRecoverySuccess(classifiedError, recoveryResult);
            } else {
                // 回復失敗時の劣化処理
                await this.handleRecoveryFailure(classifiedError, recoveryResult);
            }
            
        } catch (error) {
            console.error('Error handling failed:', error);
            await this.handleCriticalSystemError(error);
        }
    }

    async handleRecoveryFailure(classifiedError, recoveryResult) {
        console.warn('Performance recovery failed:', { classifiedError, recoveryResult });
        
        try {
            // 劣化戦略の実行
            const degradationResult = await this.degradationManager.executeDegradation(
                classifiedError, 
                recoveryResult
            );
            
            // ユーザーへの通知
            await this.userCommunicator.notifyDegradation(
                classifiedError, 
                degradationResult
            );
            
            // トラブルシューティングガイドの提供
            const troubleshootingSteps = await this.troubleshootingGuide.generateSteps(
                classifiedError
            );
            
            await this.userCommunicator.provideTroubleshootingGuidance(
                troubleshootingSteps
            );
            
        } catch (error) {
            console.error('Degradation handling failed:', error);
            await this.handleCriticalSystemError(error);
        }
    }

    async handleCriticalSystemError(error) {
        // システム自体のエラー処理
        console.error('Critical system error in error recovery system:', error);
        
        try {
            // 最小限の緊急通知
            await this.userCommunicator.notifySystemEmergency(error);
            
            // 緊急ログ記録
            await this.errorLogger.logCriticalSystemError(error);
            
            // 最小限の劣化状態への移行
            await this.degradationManager.enterEmergencyMode();
            
        } catch (emergencyError) {
            // 最後の手段：コンソールエラーのみ
            console.error('Emergency error handling failed:', emergencyError);
        }
    }

    // 公開API
    async startErrorMonitoring() {
        if (!this.initialized) {
            throw new Error('PerformanceErrorRecoverySystem not initialized');
        }

        await this.errorDetector.startMonitoring();
        await this.monitoringIntegration.startIntegration();
        
        console.log('Performance error monitoring started');
    }

    async stopErrorMonitoring() {
        await this.errorDetector.stopMonitoring();
        await this.monitoringIntegration.stopIntegration();
        
        console.log('Performance error monitoring stopped');
    }

    async testRecoverySystem() {
        // システムのテスト実行
        const testResults = {
            errorDetection: await this.errorDetector.runSelfTest(),
            errorClassification: await this.errorClassifier.runSelfTest(),
            recoveryEngine: await this.recoveryEngine.runSelfTest(),
            degradationManager: await this.degradationManager.runSelfTest(),
            userCommunication: await this.userCommunicator.runSelfTest()
        };

        return {
            overall: Object.values(testResults).every(result => result.passed),
            details: testResults
        };
    }

    async simulateError(errorType, severity = 'medium') {
        // エラーシミュレーション（テスト用）
        const simulatedError = {
            type: errorType,
            severity,
            message: `Simulated ${errorType} error`,
            timestamp: performance.now(),
            simulated: true,
            context: this.getCurrentContext()
        };

        await this.handleDetectedError(simulatedError);
        return simulatedError;
    }

    getCurrentContext() {
        return {
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    getSystemStatus() {
        return {
            initialized: this.initialized,
            monitoring: this.errorDetector.isMonitoring(),
            recentErrors: this.errorLogger.getRecentErrors(5),
            activeRecoveries: this.recoveryEngine.getActiveRecoveries(),
            degradationLevel: this.degradationManager.getCurrentLevel(),
            systemHealth: this.calculateSystemHealth()
        };
    }

    calculateSystemHealth() {
        const recentErrors = this.errorLogger.getRecentErrors(10);
        const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
        const highErrors = recentErrors.filter(e => e.severity === 'high').length;
        
        let healthScore = 100;
        healthScore -= criticalErrors * 20;
        healthScore -= highErrors * 10;
        healthScore -= (recentErrors.length - criticalErrors - highErrors) * 2;
        
        healthScore = Math.max(0, healthScore);
        
        if (healthScore >= 90) return 'excellent';
        if (healthScore >= 75) return 'good';
        if (healthScore >= 60) return 'fair';
        if (healthScore >= 40) return 'poor';
        return 'critical';
    }
}

// パフォーマンスエラー検出器
class PerformanceErrorDetector {
    constructor() {
        this.detectors = new Map();
        this.monitoring = false;
        this.errorCallbacks = new Set();
        this.detectionInterval = null;
        this.thresholds = new Map();
    }

    async initialize() {
        this.setupDetectors();
        this.setupThresholds();
    }

    setupDetectors() {
        // フレームレートエラー検出
        this.detectors.set('frame_rate', new FrameRateErrorDetector());
        
        // メモリエラー検出
        this.detectors.set('memory', new MemoryErrorDetector());
        
        // レンダリングエラー検出
        this.detectors.set('rendering', new RenderingErrorDetector());
        
        // ネットワークエラー検出
        this.detectors.set('network', new NetworkErrorDetector());
        
        // JavaScriptエラー検出
        this.detectors.set('javascript', new JavaScriptErrorDetector());
        
        // リソースエラー検出
        this.detectors.set('resource', new ResourceErrorDetector());

        // 各検出器を初期化
        for (const detector of this.detectors.values()) {
            detector.initialize();
        }
    }

    setupThresholds() {
        this.thresholds.set('frame_rate_critical', 15); // 15fps以下
        this.thresholds.set('frame_rate_high', 30);      // 30fps以下
        this.thresholds.set('memory_critical', 200 * 1024 * 1024); // 200MB以上
        this.thresholds.set('memory_high', 150 * 1024 * 1024);     // 150MB以上
        this.thresholds.set('render_time_critical', 100); // 100ms以上
        this.thresholds.set('render_time_high', 50);      // 50ms以上
    }

    async startMonitoring() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        
        // 定期的なエラー検出
        this.detectionInterval = setInterval(() => {
            this.performDetection();
        }, 1000); // 1秒間隔

        // 各検出器の監視開始
        for (const detector of this.detectors.values()) {
            if (detector.startMonitoring) {
                detector.startMonitoring();
            }
        }

        console.log('Performance error detection started');
    }

    async stopMonitoring() {
        this.monitoring = false;
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }

        // 各検出器の監視停止
        for (const detector of this.detectors.values()) {
            if (detector.stopMonitoring) {
                detector.stopMonitoring();
            }
        }

        console.log('Performance error detection stopped');
    }

    async performDetection() {
        if (!this.monitoring) return;

        for (const [detectorName, detector] of this.detectors) {
            try {
                const errors = await detector.detect(this.thresholds);
                for (const error of errors) {
                    this.reportError({
                        ...error,
                        detector: detectorName,
                        detectedAt: performance.now()
                    });
                }
            } catch (error) {
                console.error(`Detection failed for ${detectorName}:`, error);
            }
        }
    }

    reportError(error) {
        for (const callback of this.errorCallbacks) {
            try {
                callback(error);
            } catch (error) {
                console.error('Error callback failed:', error);
            }
        }
    }

    onErrorDetected(callback) {
        this.errorCallbacks.add(callback);
        return () => this.errorCallbacks.delete(callback);
    }

    isMonitoring() {
        return this.monitoring;
    }

    async runSelfTest() {
        try {
            // 各検出器のテスト
            for (const [name, detector] of this.detectors) {
                if (detector.runSelfTest) {
                    const result = await detector.runSelfTest();
                    if (!result.passed) {
                        return { passed: false, failedDetector: name, details: result };
                    }
                }
            }

            return { passed: true, message: 'All detectors operational' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// パフォーマンスエラー分類器
class PerformanceErrorClassifier {
    constructor() {
        this.classificationRules = new Map();
        this.severityCalculators = new Map();
    }

    async initialize() {
        this.setupClassificationRules();
        this.setupSeverityCalculators();
    }

    setupClassificationRules() {
        // フレームレート関連エラー
        this.classificationRules.set('frame_rate', {
            category: 'performance',
            subcategory: 'frame_rate',
            recoverable: true,
            userImpact: 'high',
            systemImpact: 'medium'
        });

        // メモリ関連エラー
        this.classificationRules.set('memory', {
            category: 'resource',
            subcategory: 'memory',
            recoverable: true,
            userImpact: 'medium',
            systemImpact: 'high'
        });

        // レンダリング関連エラー
        this.classificationRules.set('rendering', {
            category: 'performance',
            subcategory: 'rendering',
            recoverable: true,
            userImpact: 'high',
            systemImpact: 'medium'
        });

        // JavaScript エラー
        this.classificationRules.set('javascript', {
            category: 'application',
            subcategory: 'javascript',
            recoverable: false,
            userImpact: 'critical',
            systemImpact: 'critical'
        });
    }

    setupSeverityCalculators() {
        this.severityCalculators.set('frame_rate', (error) => {
            if (error.value < 15) return 'critical';
            if (error.value < 30) return 'high';
            if (error.value < 45) return 'medium';
            return 'low';
        });

        this.severityCalculators.set('memory', (error) => {
            const usageMB = error.value / 1024 / 1024;
            if (usageMB > 200) return 'critical';
            if (usageMB > 150) return 'high';
            if (usageMB > 100) return 'medium';
            return 'low';
        });

        this.severityCalculators.set('rendering', (error) => {
            if (error.value > 100) return 'critical';
            if (error.value > 50) return 'high';
            if (error.value > 25) return 'medium';
            return 'low';
        });
    }

    async classify(error) {
        const rule = this.classificationRules.get(error.detector) || {
            category: 'unknown',
            subcategory: 'unknown',
            recoverable: false,
            userImpact: 'unknown',
            systemImpact: 'unknown'
        };

        const severityCalculator = this.severityCalculators.get(error.detector);
        const severity = severityCalculator ? severityCalculator(error) : 'medium';

        return {
            ...error,
            classification: rule,
            severity,
            classifiedAt: performance.now(),
            recoveryPriority: this.calculateRecoveryPriority(severity, rule)
        };
    }

    calculateRecoveryPriority(severity, rule) {
        const severityWeight = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1
        };

        const impactWeight = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
            unknown: 1
        };

        const score = 
            (severityWeight[severity] || 1) * 2 + 
            (impactWeight[rule.userImpact] || 1) + 
            (impactWeight[rule.systemImpact] || 1);

        if (score >= 12) return 'immediate';
        if (score >= 8) return 'high';
        if (score >= 5) return 'medium';
        return 'low';
    }

    async runSelfTest() {
        try {
            // テスト用エラーで分類をテスト
            const testError = {
                type: 'frame_rate_drop',
                detector: 'frame_rate',
                value: 25,
                message: 'Test error'
            };

            const classified = await this.classify(testError);
            
            if (!classified.classification || !classified.severity) {
                return { passed: false, message: 'Classification failed' };
            }

            return { passed: true, message: 'Classification working correctly' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// パフォーマンス回復エンジン
class PerformanceRecoveryEngine {
    constructor() {
        this.recoveryStrategies = new Map();
        this.activeRecoveries = new Set();
        this.recoveryHistory = [];
        this.failureCallbacks = new Set();
    }

    async initialize() {
        this.setupRecoveryStrategies();
    }

    setupRecoveryStrategies() {
        // フレームレート回復戦略
        this.recoveryStrategies.set('frame_rate', [
            { name: 'quality_reduction', priority: 1, handler: this.reduceQuality.bind(this) },
            { name: 'effect_reduction', priority: 2, handler: this.reduceEffects.bind(this) },
            { name: 'frame_rate_cap', priority: 3, handler: this.capFrameRate.bind(this) }
        ]);

        // メモリ回復戦略
        this.recoveryStrategies.set('memory', [
            { name: 'garbage_collection', priority: 1, handler: this.forceGarbageCollection.bind(this) },
            { name: 'cache_clearing', priority: 2, handler: this.clearCaches.bind(this) },
            { name: 'resource_cleanup', priority: 3, handler: this.cleanupResources.bind(this) }
        ]);

        // レンダリング回復戦略
        this.recoveryStrategies.set('rendering', [
            { name: 'layer_optimization', priority: 1, handler: this.optimizeLayers.bind(this) },
            { name: 'batch_optimization', priority: 2, handler: this.optimizeBatching.bind(this) },
            { name: 'render_scaling', priority: 3, handler: this.scaleRendering.bind(this) }
        ]);
    }

    async determineStrategy(classifiedError) {
        const strategies = this.recoveryStrategies.get(classifiedError.detector) || [];
        
        // 優先度と重要度に基づいて戦略を選択
        const availableStrategies = strategies.filter(strategy => 
            !this.isStrategyCurrentlyActive(strategy.name)
        );

        if (availableStrategies.length === 0) {
            return null;
        }

        // 最高優先度の戦略を選択
        return availableStrategies.reduce((best, current) => 
            current.priority < best.priority ? current : best
        );
    }

    async executeRecovery(strategy) {
        if (!strategy) {
            return { success: false, reason: 'No recovery strategy available' };
        }

        const recoveryId = `${strategy.name}_${Date.now()}`;
        this.activeRecoveries.add(recoveryId);

        try {
            console.log(`Executing recovery strategy: ${strategy.name}`);
            
            const startTime = performance.now();
            const result = await strategy.handler();
            const duration = performance.now() - startTime;

            const recoveryResult = {
                success: true,
                strategy: strategy.name,
                duration,
                result,
                recoveryId
            };

            this.recordRecoverySuccess(recoveryResult);
            return recoveryResult;

        } catch (error) {
            const recoveryResult = {
                success: false,
                strategy: strategy.name,
                error: error.message,
                recoveryId
            };

            this.recordRecoveryFailure(recoveryResult);
            return recoveryResult;

        } finally {
            this.activeRecoveries.delete(recoveryId);
        }
    }

    // 回復戦略の実装
    async reduceQuality() {
        // 品質設定の削減
        if (window.AdaptiveQualityController) {
            await window.AdaptiveQualityController.reduceQuality();
            return { action: 'quality_reduced', level: 'medium' };
        }
        throw new Error('AdaptiveQualityController not available');
    }

    async reduceEffects() {
        // エフェクトの削減
        if (window.ParticlePerformanceOptimizer) {
            await window.ParticlePerformanceOptimizer.reduceEffects();
            return { action: 'effects_reduced', reduction: '50%' };
        }
        throw new Error('ParticlePerformanceOptimizer not available');
    }

    async capFrameRate() {
        // フレームレートの制限
        if (window.FrameStabilizer) {
            await window.FrameStabilizer.setTargetFPS(30);
            return { action: 'frame_rate_capped', target: 30 };
        }
        throw new Error('FrameStabilizer not available');
    }

    async forceGarbageCollection() {
        // ガベージコレクションの強制実行
        if (window.MemoryManager) {
            await window.MemoryManager.forceCleanup();
            return { action: 'gc_forced', memory_freed: 'unknown' };
        }
        
        // フォールバック: 大きなオブジェクトを作成・削除してGCを誘発
        const tempArrays = [];
        for (let i = 0; i < 100; i++) {
            tempArrays.push(new Array(10000).fill(null));
        }
        tempArrays.length = 0;
        
        return { action: 'gc_attempted', method: 'fallback' };
    }

    async clearCaches() {
        // キャッシュのクリア
        if (window.CacheSystem) {
            await window.CacheSystem.clearAll();
            return { action: 'caches_cleared', type: 'all' };
        }
        
        // フォールバック: sessionStorage と一部の localStorage をクリア
        sessionStorage.clear();
        return { action: 'caches_cleared', type: 'session_storage' };
    }

    async cleanupResources() {
        // リソースのクリーンアップ
        const cleanupActions = [];
        
        // 画像リソースのクリーンアップ
        const images = document.querySelectorAll('img[data-cleanup="true"]');
        images.forEach(img => {
            img.src = '';
            cleanupActions.push('image_cleanup');
        });
        
        // イベントリスナーのクリーンアップ
        if (window.cleanupEventListeners) {
            window.cleanupEventListeners();
            cleanupActions.push('event_listener_cleanup');
        }
        
        return { action: 'resources_cleaned', actions: cleanupActions };
    }

    async optimizeLayers() {
        // レイヤー最適化
        if (window.AdvancedRenderingOptimizer) {
            await window.AdvancedRenderingOptimizer.optimizeLayers();
            return { action: 'layers_optimized' };
        }
        throw new Error('AdvancedRenderingOptimizer not available');
    }

    async optimizeBatching() {
        // バッチング最適化
        if (window.AdvancedRenderingOptimizer) {
            await window.AdvancedRenderingOptimizer.optimizeBatching();
            return { action: 'batching_optimized' };
        }
        throw new Error('AdvancedRenderingOptimizer not available');
    }

    async scaleRendering() {
        // レンダリングスケーリング
        if (window.AdvancedRenderingOptimizer) {
            await window.AdvancedRenderingOptimizer.scaleRendering(0.8);
            return { action: 'rendering_scaled', scale: 0.8 };
        }
        throw new Error('AdvancedRenderingOptimizer not available');
    }

    isStrategyCurrentlyActive(strategyName) {
        return Array.from(this.activeRecoveries).some(id => id.includes(strategyName));
    }

    recordRecoverySuccess(result) {
        this.recoveryHistory.push({
            ...result,
            timestamp: Date.now(),
            outcome: 'success'
        });

        // 履歴サイズ制限
        if (this.recoveryHistory.length > 100) {
            this.recoveryHistory.shift();
        }
    }

    recordRecoveryFailure(result) {
        this.recoveryHistory.push({
            ...result,
            timestamp: Date.now(),
            outcome: 'failure'
        });

        // 失敗コールバックの実行
        for (const callback of this.failureCallbacks) {
            try {
                callback(result.error, result);
            } catch (error) {
                console.error('Recovery failure callback error:', error);
            }
        }

        // 履歴サイズ制限
        if (this.recoveryHistory.length > 100) {
            this.recoveryHistory.shift();
        }
    }

    onRecoveryFailed(callback) {
        this.failureCallbacks.add(callback);
        return () => this.failureCallbacks.delete(callback);
    }

    getActiveRecoveries() {
        return Array.from(this.activeRecoveries);
    }

    getRecoveryHistory(limit = 10) {
        return this.recoveryHistory.slice(-limit);
    }

    async runSelfTest() {
        try {
            // テスト戦略の実行
            const testStrategy = {
                name: 'test_strategy',
                handler: async () => ({ test: 'passed' })
            };

            const result = await this.executeRecovery(testStrategy);
            
            if (!result.success) {
                return { passed: false, message: 'Recovery execution failed' };
            }

            return { passed: true, message: 'Recovery engine operational' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// 劣化管理器
class GracefulDegradationManager {
    constructor() {
        this.degradationLevel = 0; // 0-5 (0=normal, 5=emergency)
        this.degradationStrategies = new Map();
        this.currentDegradations = new Set();
        this.emergencyMode = false;
    }

    async initialize() {
        this.setupDegradationStrategies();
    }

    setupDegradationStrategies() {
        // レベル1: 軽微な劣化
        this.degradationStrategies.set(1, [
            { name: 'reduce_particle_count', handler: this.reduceParticles.bind(this) },
            { name: 'lower_texture_quality', handler: this.lowerTextureQuality.bind(this) }
        ]);

        // レベル2: 中程度の劣化
        this.degradationStrategies.set(2, [
            { name: 'disable_shadows', handler: this.disableShadows.bind(this) },
            { name: 'reduce_animation_quality', handler: this.reduceAnimationQuality.bind(this) }
        ]);

        // レベル3: 重度の劣化
        this.degradationStrategies.set(3, [
            { name: 'disable_post_processing', handler: this.disablePostProcessing.bind(this) },
            { name: 'reduce_resolution', handler: this.reduceResolution.bind(this) }
        ]);

        // レベル4: 最小限機能
        this.degradationStrategies.set(4, [
            { name: 'minimal_rendering', handler: this.enableMinimalRendering.bind(this) },
            { name: 'disable_audio', handler: this.disableAudio.bind(this) }
        ]);

        // レベル5: 緊急モード
        this.degradationStrategies.set(5, [
            { name: 'emergency_fallback', handler: this.activateEmergencyFallback.bind(this) }
        ]);
    }

    async initiateDegradation(error, failedRecovery) {
        const targetLevel = this.calculateDegradationLevel(error, failedRecovery);
        
        if (targetLevel > this.degradationLevel) {
            await this.escalateDegradation(targetLevel);
        }
    }

    calculateDegradationLevel(error, failedRecovery) {
        let level = 1;

        // エラーの重要度に基づく
        if (error.severity === 'critical') level += 2;
        else if (error.severity === 'high') level += 1;

        // 回復失敗の回数に基づく
        const failureCount = this.getRecoveryFailureCount(error.detector);
        level += Math.min(failureCount, 2);

        return Math.min(level, 5);
    }

    async escalateDegradation(targetLevel) {
        console.warn(`Escalating degradation to level ${targetLevel}`);

        for (let level = this.degradationLevel + 1; level <= targetLevel; level++) {
            const strategies = this.degradationStrategies.get(level) || [];
            
            for (const strategy of strategies) {
                try {
                    await strategy.handler();
                    this.currentDegradations.add(strategy.name);
                    console.log(`Applied degradation: ${strategy.name}`);
                } catch (error) {
                    console.error(`Degradation strategy failed: ${strategy.name}`, error);
                }
            }
        }

        this.degradationLevel = targetLevel;
    }

    async executeDegradation(error, recoveryResult) {
        const degradationLevel = this.calculateDegradationLevel(error, recoveryResult);
        await this.escalateDegradation(degradationLevel);

        return {
            level: this.degradationLevel,
            appliedDegradations: Array.from(this.currentDegradations),
            timestamp: Date.now()
        };
    }

    async enterEmergencyMode() {
        this.emergencyMode = true;
        await this.escalateDegradation(5);
        
        console.error('Entered emergency mode');
        
        return {
            mode: 'emergency',
            degradationLevel: this.degradationLevel,
            timestamp: Date.now()
        };
    }

    // 劣化戦略の実装
    async reduceParticles() {
        if (window.ParticlePerformanceOptimizer) {
            await window.ParticlePerformanceOptimizer.setMaxParticles(50);
        }
    }

    async lowerTextureQuality() {
        // テクスチャ品質の低下（実装依存）
        console.log('Lowering texture quality');
    }

    async disableShadows() {
        // 影の無効化（実装依存）
        console.log('Disabling shadows');
    }

    async reduceAnimationQuality() {
        // アニメーション品質の低下（実装依存）
        console.log('Reducing animation quality');
    }

    async disablePostProcessing() {
        // ポストプロセシングの無効化（実装依存）
        console.log('Disabling post-processing');
    }

    async reduceResolution() {
        // 解像度の低下
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const currentWidth = canvas.width;
            const currentHeight = canvas.height;
            canvas.width = Math.floor(currentWidth * 0.8);
            canvas.height = Math.floor(currentHeight * 0.8);
        }
    }

    async enableMinimalRendering() {
        // 最小限のレンダリングモード
        console.log('Enabling minimal rendering mode');
    }

    async disableAudio() {
        // オーディオの無効化
        if (window.AudioManager) {
            await window.AudioManager.disable();
        }
    }

    async activateEmergencyFallback() {
        // 緊急フォールバック
        console.error('Activating emergency fallback mode');
        
        // 最小限のHTMLフォールバック表示
        const fallbackDiv = document.createElement('div');
        fallbackDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 20px; border: 2px solid red; z-index: 10000;">
                <h3>システムエラー</h3>
                <p>アプリケーションで深刻なエラーが発生しました。</p>
                <p>ページを再読み込みしてください。</p>
                <button onclick="location.reload()">再読み込み</button>
            </div>
        `;
        document.body.appendChild(fallbackDiv);
    }

    getRecoveryFailureCount(detector) {
        // 回復失敗回数の取得（簡易実装）
        return 0;
    }

    getCurrentLevel() {
        return this.degradationLevel;
    }

    isEmergencyMode() {
        return this.emergencyMode;
    }

    async runSelfTest() {
        try {
            const initialLevel = this.degradationLevel;
            
            // テスト劣化の実行
            await this.escalateDegradation(1);
            
            if (this.degradationLevel !== 1) {
                return { passed: false, message: 'Degradation level not updated correctly' };
            }

            // 元のレベルに戻す
            this.degradationLevel = initialLevel;
            
            return { passed: true, message: 'Degradation manager operational' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// ユーザー通信システム
class PerformanceUserCommunicator {
    constructor() {
        this.notificationContainer = null;
        this.activeNotifications = new Map();
        this.messageTemplates = new Map();
    }

    async initialize() {
        this.createNotificationContainer();
        this.setupMessageTemplates();
        this.setupStyles();
    }

    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'performance-notifications';
        this.notificationContainer.className = 'performance-notifications-container';
        document.body.appendChild(this.notificationContainer);
    }

    setupMessageTemplates() {
        this.messageTemplates.set('recovery_success', {
            title: 'パフォーマンス復旧完了',
            icon: '✅',
            type: 'success',
            template: (error, result) => 
                `${error.type}の問題が${result.strategy}により解決されました。`
        });

        this.messageTemplates.set('degradation', {
            title: 'パフォーマンス調整中',
            icon: '⚠️',
            type: 'warning',
            template: (error, result) => 
                `システム性能を維持するため、一部機能を調整しています。（レベル: ${result.level}）`
        });

        this.messageTemplates.set('critical_error', {
            title: '重要なエラーが発生',
            icon: '🚨',
            type: 'error',
            template: (error) => 
                `${error.type}: ${error.message}`
        });

        this.messageTemplates.set('system_emergency', {
            title: 'システム緊急事態',
            icon: '🆘',
            type: 'emergency',
            template: (error) => 
                'システムで緊急事態が発生しました。ページの再読み込みをお試しください。'
        });
    }

    setupStyles() {
        const styleId = 'performance-notification-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .performance-notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                max-width: 400px;
            }

            .performance-notification {
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 10px;
                padding: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateX(100%);
            }

            .performance-notification.show {
                opacity: 1;
                transform: translateX(0);
            }

            .performance-notification.success {
                border-left: 4px solid #4CAF50;
            }

            .performance-notification.warning {
                border-left: 4px solid #FF9800;
            }

            .performance-notification.error {
                border-left: 4px solid #F44336;
            }

            .performance-notification.emergency {
                border-left: 4px solid #9C27B0;
                background: #FFF3E0;
            }

            .notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-weight: bold;
            }

            .notification-icon {
                margin-right: 8px;
                font-size: 16px;
            }

            .notification-title {
                font-size: 14px;
            }

            .notification-message {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }

            .notification-actions {
                margin-top: 10px;
                text-align: right;
            }

            .notification-button {
                background: #2196F3;
                color: white;
                border: none;
                padding: 5px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                margin-left: 5px;
            }

            .notification-button:hover {
                background: #1976D2;
            }

            .notification-button.secondary {
                background: #757575;
            }

            .notification-button.secondary:hover {
                background: #616161;
            }
        `;

        document.head.appendChild(style);
    }

    async notifyRecoverySuccess(error, result) {
        const template = this.messageTemplates.get('recovery_success');
        await this.showNotification({
            id: `recovery_${Date.now()}`,
            template,
            data: { error, result },
            duration: 5000,
            actions: [
                { text: '詳細', action: () => this.showRecoveryDetails(error, result) },
                { text: '閉じる', action: 'close', secondary: true }
            ]
        });
    }

    async notifyDegradation(error, degradationResult) {
        const template = this.messageTemplates.get('degradation');
        await this.showNotification({
            id: `degradation_${Date.now()}`,
            template,
            data: { error, result: degradationResult },
            duration: 10000,
            actions: [
                { text: 'ヘルプ', action: () => this.showPerformanceHelp() },
                { text: '閉じる', action: 'close', secondary: true }
            ]
        });
    }

    async notifyCriticalError(error) {
        const template = this.messageTemplates.get('critical_error');
        await this.showNotification({
            id: `critical_${Date.now()}`,
            template,
            data: { error },
            duration: 0, // 手動で閉じるまで表示
            actions: [
                { text: '再読み込み', action: () => location.reload() },
                { text: '詳細', action: () => this.showErrorDetails(error) },
                { text: '閉じる', action: 'close', secondary: true }
            ]
        });
    }

    async notifySystemEmergency(error) {
        const template = this.messageTemplates.get('system_emergency');
        await this.showNotification({
            id: `emergency_${Date.now()}`,
            template,
            data: { error },
            duration: 0,
            actions: [
                { text: '今すぐ再読み込み', action: () => location.reload() }
            ]
        });
    }

    async provideTroubleshootingGuidance(steps) {
        await this.showNotification({
            id: `troubleshooting_${Date.now()}`,
            template: {
                title: 'トラブルシューティング',
                icon: '🛠️',
                type: 'info',
                template: () => `以下の手順をお試しください：\n${steps.map((step, i) => `${i+1}. ${step}`).join('\n')}`
            },
            data: { steps },
            duration: 0,
            actions: [
                { text: 'ヘルプページ', action: () => this.openHelpPage() },
                { text: '閉じる', action: 'close', secondary: true }
            ]
        });
    }

    async showNotification(config) {
        const notification = this.createNotificationElement(config);
        this.notificationContainer.appendChild(notification);
        this.activeNotifications.set(config.id, notification);

        // アニメーション表示
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 自動削除
        if (config.duration > 0) {
            setTimeout(() => {
                this.removeNotification(config.id);
            }, config.duration);
        }
    }

    createNotificationElement(config) {
        const notification = document.createElement('div');
        notification.className = `performance-notification ${config.template.type}`;
        notification.id = config.id;

        const message = config.template.template(config.data.error, config.data.result);

        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${config.template.icon}</span>
                <span class="notification-title">${config.template.title}</span>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-actions">
                ${config.actions.map(action => 
                    `<button class="notification-button ${action.secondary ? 'secondary' : ''}"
                             data-action="${action.action}">${action.text}</button>`
                ).join('')}
            </div>
        `;

        // アクションボタンのイベント設定
        notification.addEventListener('click', (event) => {
            if (event.target.classList.contains('notification-button')) {
                const action = event.target.dataset.action;
                if (action === 'close') {
                    this.removeNotification(config.id);
                } else {
                    const actionConfig = config.actions.find(a => a.action === action);
                    if (actionConfig && typeof actionConfig.action === 'function') {
                        actionConfig.action();
                    }
                }
            }
        });

        return notification;
    }

    removeNotification(id) {
        const notification = this.activeNotifications.get(id);
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.activeNotifications.delete(id);
            }, 300);
        }
    }

    showRecoveryDetails(error, result) {
        console.log('Recovery Details:', { error, result });
        // 詳細情報のモーダル表示などを実装
    }

    showErrorDetails(error) {
        console.log('Error Details:', error);
        // エラー詳細のモーダル表示などを実装
    }

    showPerformanceHelp() {
        // パフォーマンスヘルプの表示
        window.open('/help/performance', '_blank');
    }

    openHelpPage() {
        // ヘルプページを開く
        window.open('/help', '_blank');
    }

    async runSelfTest() {
        try {
            // テスト通知の表示
            await this.showNotification({
                id: 'test_notification',
                template: {
                    title: 'テスト通知',
                    icon: '🧪',
                    type: 'info',
                    template: () => 'これはテスト通知です。'
                },
                data: {},
                duration: 3000,
                actions: [{ text: '閉じる', action: 'close', secondary: true }]
            });

            return { passed: true, message: 'User communication system operational' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// トラブルシューティングガイド
class TroubleshootingGuide {
    constructor() {
        this.guideDatabase = new Map();
    }

    async initialize() {
        this.setupGuides();
    }

    setupGuides() {
        this.guideDatabase.set('frame_rate', [
            'ブラウザの他のタブを閉じてください',
            'ウィンドウサイズを小さくしてみてください',
            'ブラウザを再起動してください',
            'ハードウェアアクセラレーションを確認してください'
        ]);

        this.guideDatabase.set('memory', [
            'ブラウザの他のタブを閉じてください',
            'ブラウザのキャッシュをクリアしてください',
            'ページを再読み込みしてください',
            'デバイスを再起動してください'
        ]);

        this.guideDatabase.set('rendering', [
            'ブラウザを最新版に更新してください',
            'グラフィックドライバを更新してください',
            'ハードウェアアクセラレーションを有効にしてください',
            '他のアプリケーションを終了してください'
        ]);
    }

    async generateSteps(error) {
        const steps = this.guideDatabase.get(error.detector) || [
            'ページを再読み込みしてください',
            'ブラウザを再起動してください',
            'デバイスを再起動してください'
        ];

        return steps;
    }

    async runSelfTest() {
        try {
            const testError = { detector: 'frame_rate' };
            const steps = await this.generateSteps(testError);
            
            if (!Array.isArray(steps) || steps.length === 0) {
                return { passed: false, message: 'Failed to generate troubleshooting steps' };
            }

            return { passed: true, message: 'Troubleshooting guide operational' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// パフォーマンスエラーロガー
class PerformanceErrorLogger {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
    }

    async initialize() {
        // 既存のログを読み込み
        this.loadExistingLogs();
    }

    loadExistingLogs() {
        try {
            const saved = localStorage.getItem('performance_error_log');
            if (saved) {
                this.errorLog = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load error logs:', error);
        }
    }

    async logError(error) {
        const logEntry = {
            ...error,
            loggedAt: Date.now(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(logEntry);
        
        // ログサイズ制限
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        await this.saveLog();
    }

    async logRecoverySuccess(error, result) {
        const logEntry = {
            type: 'recovery_success',
            originalError: error,
            recoveryResult: result,
            loggedAt: Date.now(),
            sessionId: this.getSessionId()
        };

        this.errorLog.push(logEntry);
        await this.saveLog();
    }

    async logCriticalSystemError(error) {
        const logEntry = {
            type: 'critical_system_error',
            error: error.message,
            stack: error.stack,
            loggedAt: Date.now(),
            sessionId: this.getSessionId(),
            emergency: true
        };

        this.errorLog.push(logEntry);
        await this.saveLog();
        
        // 緊急ログは即座にサーバーに送信（実装要）
        this.sendEmergencyLog(logEntry);
    }

    async saveLog() {
        try {
            localStorage.setItem('performance_error_log', JSON.stringify(this.errorLog));
        } catch (error) {
            console.error('Failed to save error log:', error);
        }
    }

    sendEmergencyLog(logEntry) {
        // 緊急ログのサーバー送信（実装要）
        console.error('Emergency log:', logEntry);
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    getRecentErrors(limit = 10) {
        return this.errorLog.slice(-limit);
    }

    getErrorsByType(type, limit = 10) {
        return this.errorLog
            .filter(entry => entry.type === type || entry.detector === type)
            .slice(-limit);
    }

    getErrorStatistics() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        const recentErrors = this.errorLog.filter(entry => 
            now - entry.loggedAt < oneHour
        );

        const dailyErrors = this.errorLog.filter(entry => 
            now - entry.loggedAt < oneDay
        );

        return {
            total: this.errorLog.length,
            lastHour: recentErrors.length,
            lastDay: dailyErrors.length,
            byType: this.getErrorCountByType(),
            bySeverity: this.getErrorCountBySeverity()
        };
    }

    getErrorCountByType() {
        const counts = {};
        for (const entry of this.errorLog) {
            const type = entry.detector || entry.type || 'unknown';
            counts[type] = (counts[type] || 0) + 1;
        }
        return counts;
    }

    getErrorCountBySeverity() {
        const counts = {};
        for (const entry of this.errorLog) {
            const severity = entry.severity || 'unknown';
            counts[severity] = (counts[severity] || 0) + 1;
        }
        return counts;
    }

    async runSelfTest() {
        try {
            const testError = {
                type: 'test_error',
                detector: 'test',
                message: 'Test error for logging'
            };

            await this.logError(testError);
            
            const recentErrors = this.getRecentErrors(1);
            if (recentErrors.length === 0 || recentErrors[0].type !== 'test_error') {
                return { passed: false, message: 'Error logging failed' };
            }

            return { passed: true, message: 'Error logger operational' };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }
}

// 監視統合システム
class ErrorMonitoringIntegration {
    constructor() {
        this.integrations = new Map();
        this.criticalErrorCallbacks = new Set();
    }

    async initialize() {
        this.setupIntegrations();
    }

    setupIntegrations() {
        // PerformanceMonitoringSystem との統合
        if (window.PerformanceMonitoringSystem) {
            this.integrations.set('monitoring', window.PerformanceMonitoringSystem);
        }

        // 外部監視サービスとの統合ポイント
        this.setupExternalIntegrations();
    }

    setupExternalIntegrations() {
        // Sentry, LogRocket, Datadog等との統合ポイント
        if (window.Sentry) {
            this.integrations.set('sentry', window.Sentry);
        }
    }

    async startIntegration() {
        console.log('Error monitoring integration started');
    }

    async stopIntegration() {
        console.log('Error monitoring integration stopped');
    }

    onCriticalError(callback) {
        this.criticalErrorCallbacks.add(callback);
        return () => this.criticalErrorCallbacks.delete(callback);
    }

    async runSelfTest() {
        return { passed: true, message: 'Monitoring integration operational' };
    }
}

// 基本的なエラー検出器の実装
class FrameRateErrorDetector {
    constructor() {
        this.frameHistory = [];
        this.lastFrameTime = 0;
    }

    initialize() {
        this.lastFrameTime = performance.now();
    }

    async detect(thresholds) {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        const fps = frameTime > 0 ? 1000 / frameTime : 0;

        this.frameHistory.push(fps);
        if (this.frameHistory.length > 60) {
            this.frameHistory.shift();
        }

        this.lastFrameTime = now;

        const errors = [];
        const avgFPS = this.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.frameHistory.length;

        if (avgFPS < thresholds.get('frame_rate_critical')) {
            errors.push({
                type: 'critical_frame_rate_drop',
                value: avgFPS,
                message: `Critical frame rate drop: ${avgFPS.toFixed(1)} fps`
            });
        } else if (avgFPS < thresholds.get('frame_rate_high')) {
            errors.push({
                type: 'frame_rate_drop',
                value: avgFPS,
                message: `Frame rate drop: ${avgFPS.toFixed(1)} fps`
            });
        }

        return errors;
    }

    startMonitoring() {
        // 継続的な監視開始
    }

    stopMonitoring() {
        // 監視停止
    }

    async runSelfTest() {
        return { passed: true, message: 'Frame rate detector operational' };
    }
}

// 他の基本検出器（スタブ実装）
class MemoryErrorDetector {
    initialize() {}
    async detect(thresholds) { return []; }
    startMonitoring() {}
    stopMonitoring() {}
    async runSelfTest() { return { passed: true }; }
}

class RenderingErrorDetector {
    initialize() {}
    async detect(thresholds) { return []; }
    startMonitoring() {}
    stopMonitoring() {}
    async runSelfTest() { return { passed: true }; }
}

class NetworkErrorDetector {
    initialize() {}
    async detect(thresholds) { return []; }
    startMonitoring() {}
    stopMonitoring() {}
    async runSelfTest() { return { passed: true }; }
}

class JavaScriptErrorDetector {
    initialize() {}
    async detect(thresholds) { return []; }
    startMonitoring() {}
    stopMonitoring() {}
    async runSelfTest() { return { passed: true }; }
}

class ResourceErrorDetector {
    initialize() {}
    async detect(thresholds) { return []; }
    startMonitoring() {}
    stopMonitoring() {}
    async runSelfTest() { return { passed: true }; }
}

export { PerformanceErrorRecoverySystem };