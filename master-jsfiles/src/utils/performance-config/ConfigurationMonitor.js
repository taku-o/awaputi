/**
 * ConfigurationMonitor - Configuration monitoring and change detection functionality
 * Part of the PerformanceConfigurationIntegration split implementation
 */

export class ConfigurationMonitor {
    constructor(mainController) {
        this.mainController = mainController;
        this.optimizationSystems = {
            frameStabilizer: null,
            memoryManager: null,
            qualityController: null,
            renderOptimizer: null,
            mobileOptimizer: null
        };
        this.globalConfigManager = null;
        this.monitoringSystem = null;
        this.configWatcher = null;
        this.syncManager = new ConfigSyncManager();
        this.notificationSystem = new ConfigNotificationSystem();
        this.errorHandler = null;
        
        console.log('[ConfigurationMonitor] Monitor component initialized');
    }
    
    /**
     * Initialize monitor components
     */
    async initialize() {
        await this.syncManager.initialize();
        await this.notificationSystem.initialize();
        await this.setupIntegrations();
        this.startConfigurationWatching();
        console.log('[ConfigurationMonitor] All monitor components initialized');
    }
    
    /**
     * Setup system integrations
     */
    async setupIntegrations() {
        // ConfigurationManager との統合
        await this.integrateWithConfigurationManager();
        
        // パフォーマンス最適化システムとの統合
        await this.integrateWithOptimizationSystems();
        
        // 監視システムとの統合
        await this.integrateWithMonitoringSystems();
    }
    
    /**
     * Integrate with global configuration manager
     */
    async integrateWithConfigurationManager() {
        if (window.getConfigurationManager) {
            this.globalConfigManager = window.getConfigurationManager();
            
            // パフォーマンス関連設定の監視
            const performanceKeys = [
                'performance.targetFPS',
                'performance.adaptiveQuality',
                'performance.memoryManagement',
                'performance.renderingOptimization',
                'performance.mobileOptimization'
            ];

            for (const key of performanceKeys) {
                this.globalConfigManager.watch(key, (newValue, oldValue) => {
                    this.handleGlobalConfigChange(key, newValue, oldValue);
                });
            }
        }
    }
    
    /**
     * Integrate with optimization systems
     */
    async integrateWithOptimizationSystems() {
        // 各最適化システムとの統合ポイントを設定
        await this.detectAndIntegrateOptimizationSystems();
    }
    
    /**
     * Detect and integrate optimization systems
     */
    async detectAndIntegrateOptimizationSystems() {
        // FrameStabilizer との統合
        if (window.FrameStabilizer) {
            this.optimizationSystems.frameStabilizer = window.FrameStabilizer;
            this.setupFrameStabilizerIntegration();
        }

        // MemoryManager との統合
        if (window.MemoryManager) {
            this.optimizationSystems.memoryManager = window.MemoryManager;
            this.setupMemoryManagerIntegration();
        }

        // AdaptiveQualityController との統合
        if (window.AdaptiveQualityController) {
            this.optimizationSystems.qualityController = window.AdaptiveQualityController;
            this.setupQualityControllerIntegration();
        }

        // RenderOptimizer との統合
        if (window.RenderOptimizer) {
            this.optimizationSystems.renderOptimizer = window.RenderOptimizer;
            this.setupRenderOptimizerIntegration();
        }

        // MobileOptimizer との統合
        if (window.MobileOptimizer) {
            this.optimizationSystems.mobileOptimizer = window.MobileOptimizer;
            this.setupMobileOptimizerIntegration();
        }
    }
    
    /**
     * Setup frame stabilizer integration
     */
    setupFrameStabilizerIntegration() {
        // フレーム安定化設定の動的更新
        if (this.mainController.configManager) {
            this.mainController.configManager.onConfigChange('frameStabilization', (config) => {
                if (this.optimizationSystems.frameStabilizer) {
                    this.optimizationSystems.frameStabilizer.updateConfiguration(config);
                }
            });
        }
    }
    
    /**
     * Setup memory manager integration
     */
    setupMemoryManagerIntegration() {
        // メモリ管理設定の動的更新
        if (this.mainController.configManager) {
            this.mainController.configManager.onConfigChange('memoryManagement', (config) => {
                if (this.optimizationSystems.memoryManager) {
                    this.optimizationSystems.memoryManager.updateConfiguration(config);
                }
            });
        }
    }
    
    /**
     * Setup quality controller integration
     */
    setupQualityControllerIntegration() {
        // 品質制御設定の動的更新
        if (this.mainController.configManager) {
            this.mainController.configManager.onConfigChange('qualityControl', (config) => {
                if (this.optimizationSystems.qualityController) {
                    this.optimizationSystems.qualityController.updateConfiguration(config);
                }
            });
        }
    }
    
    /**
     * Setup render optimizer integration
     */
    setupRenderOptimizerIntegration() {
        // レンダリング最適化設定の動的更新
        if (this.mainController.configManager) {
            this.mainController.configManager.onConfigChange('rendering', (config) => {
                if (this.optimizationSystems.renderOptimizer) {
                    this.optimizationSystems.renderOptimizer.updateConfiguration(config);
                }
            });
        }
    }
    
    /**
     * Setup mobile optimizer integration
     */
    setupMobileOptimizerIntegration() {
        // モバイル最適化設定の動的更新
        if (this.mainController.configManager) {
            this.mainController.configManager.onConfigChange('mobile', (config) => {
                if (this.optimizationSystems.mobileOptimizer) {
                    this.optimizationSystems.mobileOptimizer.updateConfiguration(config);
                }
            });
        }
    }
    
    /**
     * Integrate with monitoring systems
     */
    async integrateWithMonitoringSystems() {
        if (window.PerformanceMonitoringSystem) {
            this.monitoringSystem = window.PerformanceMonitoringSystem;
            this.setupMonitoringIntegration();
        }
    }
    
    /**
     * Setup monitoring integration
     */
    setupMonitoringIntegration() {
        // 監視システムからのフィードバックに基づく設定調整
        this.monitoringSystem.onMetricsUpdate('performance_feedback', (metrics) => {
            this.handlePerformanceFeedback(metrics);
        });
    }
    
    /**
     * Start configuration watching
     */
    startConfigurationWatching() {
        this.configWatcher = new ConfigFileWatcher();
        this.configWatcher.onConfigChange((changedConfigs) => {
            this.handleConfigFileChanges(changedConfigs);
        });
        this.configWatcher.startWatching();
    }
    
    /**
     * Handle global configuration change
     * @param {string} key - Configuration key
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    async handleGlobalConfigChange(key, newValue, oldValue) {
        console.log(`[ConfigurationMonitor] Global config change detected: ${key}`, { newValue, oldValue });
        
        try {
            // バックアップの作成
            if (this.mainController.backupManager) {
                await this.mainController.backupManager.createBackup(key, oldValue);
            }
            
            // ローカル設定の同期
            await this.syncManager.syncGlobalChange(key, newValue);
            
            // 関連システムへの通知
            await this.notifySystemsOfChange(key, newValue);
            
        } catch (error) {
            console.error(`[ConfigurationMonitor] Failed to handle global config change for ${key}:`, error);
            if (this.errorHandler) {
                await this.errorHandler.handleConfigError(key, error);
            }
        }
    }
    
    /**
     * Handle performance feedback
     * @param {Map} metrics - Performance metrics
     */
    async handlePerformanceFeedback(metrics) {
        // パフォーマンスメトリクスに基づく自動設定調整
        const recommendations = await this.generateConfigRecommendations(metrics);
        
        for (const recommendation of recommendations) {
            if (recommendation.autoApply && recommendation.confidence > 0.8) {
                if (this.mainController.applyConfigChange) {
                    await this.mainController.applyConfigChange(recommendation.key, recommendation.value, {
                        reason: 'performance_feedback',
                        confidence: recommendation.confidence,
                        automatic: true
                    });
                }
            } else {
                // 手動承認が必要な推奨事項
                await this.notificationSystem.notifyRecommendation(recommendation);
            }
        }
    }
    
    /**
     * Generate configuration recommendations based on metrics
     * @param {Map} metrics - Performance metrics
     * @returns {Array} Configuration recommendations
     */
    async generateConfigRecommendations(metrics) {
        const recommendations = [];

        // フレームレートベースの推奨事項
        if (metrics.has('fps')) {
            const fps = metrics.get('fps');
            if (fps < 50) {
                recommendations.push({
                    key: 'performance.adaptiveQuality.enabled',
                    value: true,
                    reason: 'Low frame rate detected',
                    confidence: 0.9,
                    autoApply: true,
                    impact: 'Should improve frame rate',
                    priority: 'high'
                });

                recommendations.push({
                    key: 'performance.qualityLevel',
                    value: 'medium',
                    reason: 'Reduce quality to improve performance',
                    confidence: 0.8,
                    autoApply: false,
                    impact: 'Will improve performance but reduce visual quality',
                    priority: 'medium'
                });
            }
        }

        // メモリ使用量ベースの推奨事項
        if (metrics.has('memory_used')) {
            const memoryUsed = metrics.get('memory_used');
            if (memoryUsed > 100 * 1024 * 1024) { // 100MB以上
                recommendations.push({
                    key: 'performance.memoryManagement.aggressiveCleanup',
                    value: true,
                    reason: 'High memory usage detected',
                    confidence: 0.85,
                    autoApply: true,
                    impact: 'Will reduce memory usage',
                    priority: 'high'
                });

                recommendations.push({
                    key: 'performance.memoryManagement.gcInterval',
                    value: 30000, // 30秒間隔
                    reason: 'Increase GC frequency for better memory management',
                    confidence: 0.7,
                    autoApply: false,
                    impact: 'May cause periodic frame drops but will improve memory stability',
                    priority: 'medium'
                });
            }
        }

        // CPU使用率ベースの推奨事項
        if (metrics.has('cpu_usage')) {
            const cpuUsage = metrics.get('cpu_usage');
            if (cpuUsage > 80) {
                recommendations.push({
                    key: 'rendering.batchRendering',
                    value: true,
                    reason: 'High CPU usage detected',
                    confidence: 0.8,
                    autoApply: true,
                    impact: 'Should reduce CPU usage',
                    priority: 'high'
                });
            }
        }

        return recommendations;
    }
    
    /**
     * Handle configuration file changes
     * @param {Array} changedConfigs - Changed configuration files
     */
    async handleConfigFileChanges(changedConfigs) {
        console.log('[ConfigurationMonitor] Config file changes detected:', changedConfigs);
        
        for (const change of changedConfigs) {
            try {
                await this.processConfigFileChange(change);
            } catch (error) {
                console.error(`[ConfigurationMonitor] Failed to process config file change:`, error);
                if (this.errorHandler) {
                    await this.errorHandler.handleConfigError(change.key, error);
                }
            }
        }
    }
    
    /**
     * Process configuration file change
     * @param {Object} change - Configuration change object
     */
    async processConfigFileChange(change) {
        // ファイル変更の種類に応じた処理
        switch (change.type) {
            case 'modified':
                await this.handleConfigModification(change);
                break;
            case 'added':
                await this.handleConfigAddition(change);
                break;
            case 'deleted':
                await this.handleConfigDeletion(change);
                break;
        }
    }
    
    /**
     * Handle configuration modification
     * @param {Object} change - Configuration change object
     */
    async handleConfigModification(change) {
        // 設定変更の検証と適用
        if (this.mainController.validationEngine) {
            await this.mainController.validationEngine.validateConfigFile(change.file);
        }
        if (this.mainController.configManager) {
            await this.mainController.configManager.reloadConfig(change.file);
        }
        await this.syncManager.syncFileChange(change);
    }
    
    /**
     * Handle configuration addition
     * @param {Object} change - Configuration change object
     */
    async handleConfigAddition(change) {
        // 新しい設定ファイルの追加
        if (this.mainController.configManager) {
            await this.mainController.configManager.loadConfig(change.file);
        }
    }
    
    /**
     * Handle configuration deletion
     * @param {Object} change - Configuration change object
     */
    async handleConfigDeletion(change) {
        // 設定ファイルの削除処理
        if (this.mainController.configManager) {
            await this.mainController.configManager.unloadConfig(change.file);
        }
    }
    
    /**
     * Notify systems of configuration change
     * @param {string} key - Configuration key
     * @param {*} value - Configuration value
     */
    async notifySystemsOfChange(key, value) {
        // 関連する最適化システムへの通知
        const category = this.categorizeConfigKey(key);
        
        switch (category) {
            case 'frameStabilization':
                if (this.optimizationSystems.frameStabilizer) {
                    await this.optimizationSystems.frameStabilizer.handleConfigChange(key, value);
                }
                break;
                
            case 'memoryManagement':
                if (this.optimizationSystems.memoryManager) {
                    await this.optimizationSystems.memoryManager.handleConfigChange(key, value);
                }
                break;
                
            case 'qualityControl':
                if (this.optimizationSystems.qualityController) {
                    await this.optimizationSystems.qualityController.handleConfigChange(key, value);
                }
                break;
                
            case 'rendering':
                if (this.optimizationSystems.renderOptimizer) {
                    await this.optimizationSystems.renderOptimizer.handleConfigChange(key, value);
                }
                break;
                
            case 'mobile':
                if (this.optimizationSystems.mobileOptimizer) {
                    await this.optimizationSystems.mobileOptimizer.handleConfigChange(key, value);
                }
                break;
        }
    }
    
    /**
     * Categorize configuration key
     * @param {string} key - Configuration key
     * @returns {string} Category name
     */
    categorizeConfigKey(key) {
        if (key.includes('frame') || key.includes('fps')) return 'frameStabilization';
        if (key.includes('memory') || key.includes('gc')) return 'memoryManagement';
        if (key.includes('quality') || key.includes('level')) return 'qualityControl';
        if (key.includes('render')) return 'rendering';
        if (key.includes('mobile')) return 'mobile';
        return 'general';
    }
    
    /**
     * Get active integrations status
     * @returns {Object} Active integrations
     */
    getActiveIntegrations() {
        return {
            configurationManager: !!this.globalConfigManager,
            frameStabilizer: !!this.optimizationSystems.frameStabilizer,
            memoryManager: !!this.optimizationSystems.memoryManager,
            qualityController: !!this.optimizationSystems.qualityController,
            renderOptimizer: !!this.optimizationSystems.renderOptimizer,
            mobileOptimizer: !!this.optimizationSystems.mobileOptimizer,
            monitoringSystem: !!this.monitoringSystem
        };
    }
    
    /**
     * Get monitor status
     * @returns {Object} Monitor status
     */
    getMonitorStatus() {
        return {
            integrations: this.getActiveIntegrations(),
            lastSyncTime: this.syncManager.getLastSyncTime(),
            pendingChanges: this.syncManager.getPendingChanges(),
            watchingFiles: !!this.configWatcher,
            notificationSubscribers: this.notificationSystem.getSubscriberCount()
        };
    }
    
    /**
     * Set error handler
     * @param {Object} errorHandler - Error handler instance
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }
    
    /**
     * Configure monitor settings
     * @param {Object} config - Monitor configuration
     */
    configure(config) {
        if (config.syncInterval) {
            this.syncManager.setSyncInterval(config.syncInterval);
        }
        
        if (config.enableFileWatching !== undefined) {
            if (config.enableFileWatching && !this.configWatcher) {
                this.startConfigurationWatching();
            } else if (!config.enableFileWatching && this.configWatcher) {
                this.configWatcher.stopWatching();
                this.configWatcher = null;
            }
        }
    }
    
    /**
     * Cleanup monitor resources
     */
    destroy() {
        if (this.configWatcher) {
            this.configWatcher.stopWatching();
            this.configWatcher = null;
        }
        
        if (this.syncManager) {
            this.syncManager.destroy();
        }
        
        if (this.notificationSystem) {
            this.notificationSystem.destroy();
        }
        
        this.optimizationSystems = {
            frameStabilizer: null,
            memoryManager: null,
            qualityController: null,
            renderOptimizer: null,
            mobileOptimizer: null
        };
        
        this.globalConfigManager = null;
        this.monitoringSystem = null;
        
        console.log('[ConfigurationMonitor] Monitor destroyed');
    }
}

// 設定同期管理器
class ConfigSyncManager {
    constructor() {
        this.lastSyncTime = null;
        this.pendingChanges = new Set();
        this.syncInProgress = false;
        this.syncInterval = null;
    }

    async initialize() {
        this.startPeriodicSync();
    }

    startPeriodicSync() {
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, 30000); // 30秒間隔
    }

    async performSync() {
        if (this.syncInProgress || this.pendingChanges.size === 0) return;
        
        this.syncInProgress = true;
        
        try {
            for (const change of this.pendingChanges) {
                await this.syncChange(change);
            }
            
            this.pendingChanges.clear();
            this.lastSyncTime = Date.now();
            
        } catch (error) {
            console.error('[ConfigSyncManager] Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncGlobalChange(key, value) {
        this.pendingChanges.add({ type: 'global', key, value, timestamp: Date.now() });
    }

    async syncConfigChange(key, value) {
        this.pendingChanges.add({ type: 'local', key, value, timestamp: Date.now() });
    }

    async syncFileChange(change) {
        this.pendingChanges.add({ type: 'file', ...change, timestamp: Date.now() });
    }

    async syncChange(change) {
        console.log('[ConfigSyncManager] Syncing change:', change);
        // 実装は要件に応じて
    }

    getLastSyncTime() {
        return this.lastSyncTime;
    }

    getPendingChanges() {
        return Array.from(this.pendingChanges);
    }

    setSyncInterval(interval) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, interval);
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.pendingChanges.clear();
    }
}

// 設定通知システム
class ConfigNotificationSystem {
    constructor() {
        this.subscribers = new Set();
    }

    async initialize() {}

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    async notifyConfigChange(key, newValue, oldValue, metadata) {
        const notification = {
            type: 'config_change',
            key,
            newValue,
            oldValue,
            metadata,
            timestamp: Date.now()
        };

        this.broadcast(notification);
    }

    async notifyRecommendation(recommendation) {
        const notification = {
            type: 'recommendation',
            recommendation,
            timestamp: Date.now()
        };

        this.broadcast(notification);
    }

    broadcast(notification) {
        for (const subscriber of this.subscribers) {
            try {
                subscriber(notification);
            } catch (error) {
                console.error('[ConfigNotificationSystem] Notification subscriber error:', error);
            }
        }
    }

    getSubscriberCount() {
        return this.subscribers.size;
    }

    destroy() {
        this.subscribers.clear();
    }
}

// 設定ファイル監視器
class ConfigFileWatcher {
    constructor() {
        this.watchers = new Map();
        this.changeCallbacks = new Set();
        this.watching = false;
    }

    onConfigChange(callback) {
        this.changeCallbacks.add(callback);
        return () => this.changeCallbacks.delete(callback);
    }

    notifyChange(changes) {
        for (const callback of this.changeCallbacks) {
            try {
                callback(changes);
            } catch (error) {
                console.error('[ConfigFileWatcher] Config change callback error:', error);
            }
        }
    }

    startWatching() {
        if (!this.watching) {
            this.watching = true;
            console.log('[ConfigFileWatcher] Config file watching started (simulated)');
        }
    }

    stopWatching() {
        if (this.watching) {
            this.watching = false;
            console.log('[ConfigFileWatcher] Config file watching stopped');
        }
    }
}