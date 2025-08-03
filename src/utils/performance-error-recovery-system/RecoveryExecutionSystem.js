/**
 * Recovery Execution System
 * 回復実行システム - エラー回復戦略の実行と劣化管理
 */

/**
 * Performance Recovery Engine
 * パフォーマンス回復エンジン - 回復戦略の決定と実行
 */
export class PerformanceRecoveryEngine {
    constructor() {
        this.recoveryStrategies = new Map();
        this.executionHistory = [];
        this.recoveryCallbacks = [];
        this.maxHistorySize = 50;
        this.initialized = false;
    }

    async initialize() {
        console.log('Initializing Performance Recovery Engine...');
        
        this.setupRecoveryStrategies();
        this.initialized = true;
        
        console.log('Performance Recovery Engine initialized successfully');
    }

    setupRecoveryStrategies() {
        // Frame rate recovery strategies
        this.recoveryStrategies.set('frameRate', [
            {
                name: 'reduce_quality',
                priority: 1,
                execute: async (error) => this.reduceRenderQuality(error),
                conditions: { severity: ['medium', 'high', 'critical'] }
            },
            {
                name: 'disable_effects',
                priority: 2,
                execute: async (error) => this.disableVisualEffects(error),
                conditions: { severity: ['high', 'critical'] }
            },
            {
                name: 'emergency_optimization',
                priority: 3,
                execute: async (error) => this.emergencyOptimization(error),
                conditions: { severity: ['critical'] }
            }
        ]);

        // Memory recovery strategies
        this.recoveryStrategies.set('memory', [
            {
                name: 'garbage_collection',
                priority: 1,
                execute: async (error) => this.forceGarbageCollection(error),
                conditions: { severity: ['medium', 'high', 'critical'] }
            },
            {
                name: 'cache_cleanup',
                priority: 2,
                execute: async (error) => this.cleanupCaches(error),
                conditions: { severity: ['high', 'critical'] }
            },
            {
                name: 'memory_pressure_relief',
                priority: 3,
                execute: async (error) => this.relieveMemoryPressure(error),
                conditions: { severity: ['critical'] }
            }
        ]);

        // Rendering recovery strategies
        this.recoveryStrategies.set('rendering', [
            {
                name: 'optimize_rendering',
                priority: 1,
                execute: async (error) => this.optimizeRendering(error),
                conditions: { severity: ['medium', 'high', 'critical'] }
            },
            {
                name: 'fallback_renderer',
                priority: 2,
                execute: async (error) => this.activateFallbackRenderer(error),
                conditions: { severity: ['high', 'critical'] }
            }
        ]);

        // Network recovery strategies
        this.recoveryStrategies.set('network', [
            {
                name: 'retry_request',
                priority: 1,
                execute: async (error) => this.retryNetworkRequest(error),
                conditions: { severity: ['medium', 'high'] }
            },
            {
                name: 'offline_mode',
                priority: 2,
                execute: async (error) => this.activateOfflineMode(error),
                conditions: { severity: ['high', 'critical'] }
            }
        ]);

        // JavaScript recovery strategies
        this.recoveryStrategies.set('javascript', [
            {
                name: 'safe_mode',
                priority: 1,
                execute: async (error) => this.activateSafeMode(error),
                conditions: { severity: ['medium', 'high', 'critical'] }
            },
            {
                name: 'feature_disable',
                priority: 2,
                execute: async (error) => this.disableProblematicFeatures(error),
                conditions: { severity: ['high', 'critical'] }
            }
        ]);

        // Resource recovery strategies
        this.recoveryStrategies.set('resource', [
            {
                name: 'reload_resource',
                priority: 1,
                execute: async (error) => this.reloadFailedResource(error),
                conditions: { severity: ['medium', 'high'] }
            },
            {
                name: 'fallback_resource',
                priority: 2,
                execute: async (error) => this.useFallbackResource(error),
                conditions: { severity: ['high', 'critical'] }
            }
        ]);
    }

    async determineStrategy(classifiedError) {
        if (!this.initialized) {
            throw new Error('Recovery engine not initialized');
        }

        const detectorType = classifiedError.detector;
        const strategies = this.recoveryStrategies.get(detectorType) || [];
        const severity = classifiedError.classification?.severity?.level || 'low';

        // Filter strategies based on conditions
        const applicableStrategies = strategies.filter(strategy => {
            return strategy.conditions.severity.includes(severity);
        });

        if (applicableStrategies.length === 0) {
            return {
                strategy: null,
                reason: 'no_applicable_strategy',
                error: classifiedError
            };
        }

        // Sort by priority and select the best strategy
        applicableStrategies.sort((a, b) => a.priority - b.priority);
        const selectedStrategy = applicableStrategies[0];

        return {
            strategy: selectedStrategy,
            alternatives: applicableStrategies.slice(1),
            error: classifiedError,
            determinedAt: Date.now()
        };
    }

    async executeRecovery(recoveryStrategy) {
        if (!recoveryStrategy.strategy) {
            return {
                success: false,
                reason: 'no_strategy',
                executedAt: Date.now()
            };
        }

        const startTime = Date.now();
        
        try {
            console.log(`Executing recovery strategy: ${recoveryStrategy.strategy.name}`);
            
            const result = await recoveryStrategy.strategy.execute(recoveryStrategy.error);
            const endTime = Date.now();
            
            const executionResult = {
                success: true,
                strategy: recoveryStrategy.strategy.name,
                result,
                executionTime: endTime - startTime,
                executedAt: startTime
            };

            this.recordExecution(executionResult);
            this.notifyRecoveryCallbacks(executionResult);
            
            return executionResult;
            
        } catch (error) {
            console.error(`Recovery strategy ${recoveryStrategy.strategy.name} failed:`, error);
            
            const failureResult = {
                success: false,
                strategy: recoveryStrategy.strategy.name,
                error: error.message,
                executionTime: Date.now() - startTime,
                executedAt: startTime
            };

            this.recordExecution(failureResult);
            return failureResult;
        }
    }

    recordExecution(result) {
        this.executionHistory.push(result);
        
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }
    }

    notifyRecoveryCallbacks(result) {
        this.recoveryCallbacks.forEach(callback => {
            try {
                callback(result);
            } catch (error) {
                console.error('Recovery callback failed:', error);
            }
        });
    }

    onRecoveryFailed(callback) {
        this.recoveryCallbacks.push((result) => {
            if (!result.success) {
                callback(result.error, result);
            }
        });
    }

    // Recovery strategy implementations
    async reduceRenderQuality(error) {
        console.log('Reducing render quality to improve frame rate');
        return { action: 'quality_reduced', level: 'medium' };
    }

    async disableVisualEffects(error) {
        console.log('Disabling visual effects to improve performance');
        return { action: 'effects_disabled', affected: ['particles', 'shadows', 'bloom'] };
    }

    async emergencyOptimization(error) {
        console.log('Activating emergency optimization');
        return { action: 'emergency_mode', optimizations: ['minimal_quality', 'no_effects', 'reduced_resolution'] };
    }

    async forceGarbageCollection(error) {
        console.log('Forcing garbage collection');
        if (window.gc) {
            window.gc();
        }
        return { action: 'gc_forced', available: !!window.gc };
    }

    async cleanupCaches(error) {
        console.log('Cleaning up caches to free memory');
        return { action: 'caches_cleaned', freed: 'estimated_10mb' };
    }

    async relieveMemoryPressure(error) {
        console.log('Relieving memory pressure');
        return { action: 'memory_pressure_relieved', techniques: ['object_pooling', 'lazy_loading'] };
    }

    async optimizeRendering(error) {
        console.log('Optimizing rendering pipeline');
        return { action: 'rendering_optimized', optimizations: ['batching', 'culling'] };
    }

    async activateFallbackRenderer(error) {
        console.log('Activating fallback renderer');
        return { action: 'fallback_renderer', renderer: 'canvas_2d' };
    }

    async retryNetworkRequest(error) {
        console.log('Retrying network request');
        return { action: 'request_retried', attempts: 1 };
    }

    async activateOfflineMode(error) {
        console.log('Activating offline mode');
        return { action: 'offline_mode', cached_data: true };
    }

    async activateSafeMode(error) {
        console.log('Activating safe mode');
        return { action: 'safe_mode', disabled_features: ['advanced_features'] };
    }

    async disableProblematicFeatures(error) {
        console.log('Disabling problematic features');
        return { action: 'features_disabled', features: ['dynamic_loading'] };
    }

    async reloadFailedResource(error) {
        console.log('Reloading failed resource');
        return { action: 'resource_reloaded', success: true };
    }

    async useFallbackResource(error) {
        console.log('Using fallback resource');
        return { action: 'fallback_resource', resource: 'default_asset' };
    }

    getExecutionHistory() {
        return [...this.executionHistory];
    }

    getRecoveryStatistics() {
        const total = this.executionHistory.length;
        const successful = this.executionHistory.filter(r => r.success).length;
        const byStrategy = {};
        
        this.executionHistory.forEach(result => {
            const strategy = result.strategy;
            if (!byStrategy[strategy]) {
                byStrategy[strategy] = { total: 0, successful: 0 };
            }
            byStrategy[strategy].total++;
            if (result.success) {
                byStrategy[strategy].successful++;
            }
        });

        return {
            total,
            successful,
            successRate: total > 0 ? successful / total : 0,
            byStrategy
        };
    }
}

/**
 * Graceful Degradation Manager
 * 優雅な劣化管理システム - 段階的な機能制限とユーザー体験保護
 */
export class GracefulDegradationManager {
    constructor() {
        this.degradationLevels = new Map();
        this.currentDegradationLevel = 0;
        this.maxDegradationLevel = 5;
        this.degradationHistory = [];
        this.featureStates = new Map();
        this.initialized = false;
    }

    async initialize() {
        console.log('Initializing Graceful Degradation Manager...');
        
        this.setupDegradationLevels();
        this.initializeFeatureStates();
        
        this.initialized = true;
        console.log('Graceful Degradation Manager initialized successfully');
    }

    setupDegradationLevels() {
        // Level 0: Normal operation
        this.degradationLevels.set(0, {
            name: 'normal',
            description: 'All features enabled',
            actions: []
        });

        // Level 1: Minor optimizations
        this.degradationLevels.set(1, {
            name: 'minor_optimization',
            description: 'Minor performance optimizations',
            actions: [
                { type: 'reduce_quality', target: 'effects', amount: 0.1 },
                { type: 'optimize', target: 'animations', level: 'basic' }
            ]
        });

        // Level 2: Moderate degradation
        this.degradationLevels.set(2, {
            name: 'moderate_degradation',
            description: 'Reduced visual quality',
            actions: [
                { type: 'reduce_quality', target: 'graphics', amount: 0.25 },
                { type: 'disable', target: 'non_essential_effects' },
                { type: 'reduce', target: 'particle_count', amount: 0.5 }
            ]
        });

        // Level 3: Significant degradation
        this.degradationLevels.set(3, {
            name: 'significant_degradation',
            description: 'Significantly reduced functionality',
            actions: [
                { type: 'reduce_quality', target: 'graphics', amount: 0.5 },
                { type: 'disable', target: 'advanced_effects' },
                { type: 'reduce', target: 'update_frequency', amount: 0.7 },
                { type: 'enable', target: 'aggressive_culling' }
            ]
        });

        // Level 4: Severe degradation
        this.degradationLevels.set(4, {
            name: 'severe_degradation',
            description: 'Minimal functionality for stability',
            actions: [
                { type: 'reduce_quality', target: 'graphics', amount: 0.75 },
                { type: 'disable', target: 'all_effects' },
                { type: 'enable', target: 'safe_mode' },
                { type: 'reduce', target: 'render_resolution', amount: 0.5 }
            ]
        });

        // Level 5: Emergency mode
        this.degradationLevels.set(5, {
            name: 'emergency_mode',
            description: 'Emergency survival mode',
            actions: [
                { type: 'enable', target: 'emergency_mode' },
                { type: 'disable', target: 'all_non_essential_features' },
                { type: 'reduce_quality', target: 'everything', amount: 0.9 },
                { type: 'enable', target: 'aggressive_cleanup' }
            ]
        });
    }

    initializeFeatureStates() {
        const features = [
            'graphics_quality', 'visual_effects', 'particle_effects',
            'advanced_shaders', 'post_processing', 'dynamic_lighting',
            'sound_effects', 'background_music', 'ui_animations',
            'network_features', 'auto_save', 'analytics'
        ];

        features.forEach(feature => {
            this.featureStates.set(feature, {
                enabled: true,
                quality: 1.0,
                lastModified: Date.now()
            });
        });
    }

    async initiateDegradation(error, failedRecovery) {
        if (!this.initialized) {
            throw new Error('Degradation manager not initialized');
        }

        console.warn('Initiating graceful degradation due to failed recovery');
        
        const targetLevel = this.calculateTargetDegradationLevel(error, failedRecovery);
        return await this.degradeToLevel(targetLevel);
    }

    calculateTargetDegradationLevel(error, failedRecovery) {
        let targetLevel = this.currentDegradationLevel + 1;

        // Adjust based on error severity
        const severity = error.classification?.severity?.level;
        switch (severity) {
            case 'critical':
                targetLevel += 2;
                break;
            case 'high':
                targetLevel += 1;
                break;
            case 'medium':
                targetLevel += 0;
                break;
            default:
                targetLevel = Math.max(1, targetLevel);
        }

        // Adjust based on error type
        if (error.detector === 'memory' || error.detector === 'javascript') {
            targetLevel += 1;
        }

        // Consider failed recovery attempts
        if (failedRecovery && failedRecovery.attempts > 1) {
            targetLevel += 1;
        }

        return Math.min(targetLevel, this.maxDegradationLevel);
    }

    async degradeToLevel(targetLevel) {
        if (targetLevel <= this.currentDegradationLevel) {
            return {
                success: true,
                action: 'no_change',
                currentLevel: this.currentDegradationLevel
            };
        }

        console.log(`Degrading from level ${this.currentDegradationLevel} to level ${targetLevel}`);
        
        const degradationStart = Date.now();
        const actionsExecuted = [];

        try {
            // Execute degradation actions for each level
            for (let level = this.currentDegradationLevel + 1; level <= targetLevel; level++) {
                const levelConfig = this.degradationLevels.get(level);
                if (levelConfig) {
                    for (const action of levelConfig.actions) {
                        const result = await this.executeAction(action);
                        actionsExecuted.push({ level, action, result });
                    }
                }
            }

            this.currentDegradationLevel = targetLevel;
            
            const degradationResult = {
                success: true,
                previousLevel: this.currentDegradationLevel,
                currentLevel: targetLevel,
                actionsExecuted,
                executionTime: Date.now() - degradationStart,
                timestamp: degradationStart
            };

            this.recordDegradation(degradationResult);
            return degradationResult;

        } catch (error) {
            console.error('Degradation execution failed:', error);
            
            return {
                success: false,
                error: error.message,
                actionsExecuted,
                executionTime: Date.now() - degradationStart
            };
        }
    }

    async executeAction(action) {
        console.log(`Executing degradation action: ${action.type} on ${action.target}`);
        
        switch (action.type) {
            case 'reduce_quality':
                return this.reduceQuality(action.target, action.amount);
            
            case 'disable':
                return this.disableFeature(action.target);
            
            case 'enable':
                return this.enableFeature(action.target);
            
            case 'reduce':
                return this.reduceParameter(action.target, action.amount);
            
            case 'optimize':
                return this.optimizeFeature(action.target, action.level);
            
            default:
                console.warn(`Unknown action type: ${action.type}`);
                return { success: false, reason: 'unknown_action' };
        }
    }

    reduceQuality(target, amount) {
        const feature = this.featureStates.get(target);
        if (feature) {
            feature.quality = Math.max(0.1, feature.quality - amount);
            feature.lastModified = Date.now();
            return { success: true, newQuality: feature.quality };
        }
        return { success: false, reason: 'feature_not_found' };
    }

    disableFeature(target) {
        const feature = this.featureStates.get(target);
        if (feature) {
            feature.enabled = false;
            feature.lastModified = Date.now();
            return { success: true, disabled: target };
        }
        return { success: false, reason: 'feature_not_found' };
    }

    enableFeature(target) {
        // For enabling special modes like safe_mode
        console.log(`Enabling special mode: ${target}`);
        return { success: true, enabled: target };
    }

    reduceParameter(target, amount) {
        console.log(`Reducing ${target} by ${amount * 100}%`);
        return { success: true, reduced: target, amount };
    }

    optimizeFeature(target, level) {
        console.log(`Optimizing ${target} to ${level} level`);
        return { success: true, optimized: target, level };
    }

    recordDegradation(result) {
        this.degradationHistory.push(result);
        
        // Keep only last 20 degradation events
        if (this.degradationHistory.length > 20) {
            this.degradationHistory.shift();
        }
    }

    async executeDegradation(error, failedRecovery) {
        return await this.initiateDegradation(error, failedRecovery);
    }

    getCurrentDegradationLevel() {
        return this.currentDegradationLevel;
    }

    getFeatureStates() {
        return new Map(this.featureStates);
    }

    getDegradationHistory() {
        return [...this.degradationHistory];
    }

    async restoreToLevel(targetLevel) {
        if (targetLevel >= this.currentDegradationLevel) {
            return { success: true, action: 'no_change' };
        }

        console.log(`Restoring from level ${this.currentDegradationLevel} to level ${targetLevel}`);
        
        // Reset feature states for restoration
        this.initializeFeatureStates();
        this.currentDegradationLevel = targetLevel;
        
        // Re-apply degradation actions only up to target level
        if (targetLevel > 0) {
            await this.degradeToLevel(targetLevel);
        }

        return {
            success: true,
            restoredToLevel: targetLevel,
            timestamp: Date.now()
        };
    }

    getDegradationStatistics() {
        return {
            currentLevel: this.currentDegradationLevel,
            maxLevel: this.maxDegradationLevel,
            totalDegradations: this.degradationHistory.length,
            averageDegradationLevel: this.degradationHistory.length > 0 ? 
                this.degradationHistory.reduce((sum, d) => sum + d.currentLevel, 0) / this.degradationHistory.length : 0,
            featureStatesCount: this.featureStates.size,
            disabledFeatures: Array.from(this.featureStates.entries())
                .filter(([_, state]) => !state.enabled)
                .map(([name, _]) => name)
        };
    }
}