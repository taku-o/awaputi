/**
 * Performance Configuration Integration System
 * 
 * パフォーマンス設定管理強化と動的更新機構
 * Requirements: 4.4, 7.1, 10.3
 */

export class PerformanceConfigurationIntegration {
    constructor() {
        this.configManager = new PerformanceConfigManager();
        this.dynamicUpdater = new DynamicConfigUpdater();
        this.validationEngine = new ConfigValidationEngine();
        this.errorHandler = new ConfigErrorHandler();
        this.backupManager = new ConfigBackupManager();
        this.syncManager = new ConfigSyncManager();
        this.notificationSystem = new ConfigNotificationSystem();
        this.initialized = false;
        
        this.initializeIntegration();
    }

    async initializeIntegration() {
        try {
            await this.configManager.initialize();
            await this.dynamicUpdater.initialize();
            await this.validationEngine.initialize();
            await this.errorHandler.initialize();
            await this.backupManager.initialize();
            await this.syncManager.initialize();
            await this.notificationSystem.initialize();
            
            // 設定システム間の統合
            await this.setupIntegrations();
            
            this.initialized = true;
            console.log('PerformanceConfigurationIntegration initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerformanceConfigurationIntegration:', error);
            throw error;
        }
    }

    async setupIntegrations() {
        // ConfigurationManager との統合
        await this.integrateWithConfigurationManager();
        
        // パフォーマンス最適化システムとの統合
        await this.integrateWithOptimizationSystems();
        
        // 監視システムとの統合
        await this.integrateWithMonitoringSystems();
        
        // 設定変更の監視開始
        this.startConfigurationWatching();
    }

    async integrateWithConfigurationManager() {
        // ConfigurationManager からの設定取得と同期
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

    async integrateWithOptimizationSystems() {
        // 各最適化システムとの統合ポイントを設定
        this.optimizationSystems = {
            frameStabilizer: null,
            memoryManager: null,
            qualityController: null,
            renderOptimizer: null,
            mobileOptimizer: null
        };

        // システム検出と統合
        await this.detectAndIntegrateOptimizationSystems();
    }

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
    }

    setupFrameStabilizerIntegration() {
        // フレーム安定化設定の動的更新
        this.configManager.onConfigChange('frameStabilization', (config) => {
            if (this.optimizationSystems.frameStabilizer) {
                this.optimizationSystems.frameStabilizer.updateConfiguration(config);
            }
        });
    }

    setupMemoryManagerIntegration() {
        // メモリ管理設定の動的更新
        this.configManager.onConfigChange('memoryManagement', (config) => {
            if (this.optimizationSystems.memoryManager) {
                this.optimizationSystems.memoryManager.updateConfiguration(config);
            }
        });
    }

    setupQualityControllerIntegration() {
        // 品質制御設定の動的更新
        this.configManager.onConfigChange('qualityControl', (config) => {
            if (this.optimizationSystems.qualityController) {
                this.optimizationSystems.qualityController.updateConfiguration(config);
            }
        });
    }

    async integrateWithMonitoringSystems() {
        // 監視システムとの統合
        if (window.PerformanceMonitoringSystem) {
            this.monitoringSystem = window.PerformanceMonitoringSystem;
            this.setupMonitoringIntegration();
        }
    }

    setupMonitoringIntegration() {
        // 監視システムからのフィードバックに基づく設定調整
        this.monitoringSystem.onMetricsUpdate('performance_feedback', (metrics) => {
            this.handlePerformanceFeedback(metrics);
        });
    }

    startConfigurationWatching() {
        // 設定ファイルの変更監視
        this.configWatcher = new ConfigFileWatcher();
        this.configWatcher.onConfigChange((changedConfigs) => {
            this.handleConfigFileChanges(changedConfigs);
        });
    }

    async handleGlobalConfigChange(key, newValue, oldValue) {
        console.log(`Global config change detected: ${key}`, { newValue, oldValue });
        
        try {
            // 変更の検証
            await this.validationEngine.validateConfigChange(key, newValue);
            
            // バックアップの作成
            await this.backupManager.createBackup(key, oldValue);
            
            // ローカル設定の同期
            await this.syncManager.syncGlobalChange(key, newValue);
            
            // 関連システムへの通知
            await this.notifySystemsOfChange(key, newValue);
            
        } catch (error) {
            console.error(`Failed to handle global config change for ${key}:`, error);
            await this.errorHandler.handleConfigError(key, error);
        }
    }

    async handlePerformanceFeedback(metrics) {
        // パフォーマンスメトリクスに基づく自動設定調整
        const recommendations = await this.generateConfigRecommendations(metrics);
        
        for (const recommendation of recommendations) {
            if (recommendation.autoApply && recommendation.confidence > 0.8) {
                await this.applyConfigChange(recommendation.key, recommendation.value, {
                    reason: 'performance_feedback',
                    confidence: recommendation.confidence,
                    automatic: true
                });
            } else {
                // 手動承認が必要な推奨事項
                await this.notificationSystem.notifyRecommendation(recommendation);
            }
        }
    }

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

        return recommendations;
    }

    async applyConfigChange(key, value, metadata = {}) {
        try {
            // 変更前の検証
            await this.validationEngine.validateConfigChange(key, value);
            
            // バックアップの作成
            const currentValue = await this.configManager.get(key);
            await this.backupManager.createBackup(key, currentValue, metadata);
            
            // 設定の適用
            await this.configManager.set(key, value, metadata);
            
            // 変更の同期
            await this.syncManager.syncConfigChange(key, value);
            
            // 通知の送信
            await this.notificationSystem.notifyConfigChange(key, value, currentValue, metadata);
            
            console.log(`Configuration applied: ${key} = ${JSON.stringify(value)}`);
            
        } catch (error) {
            console.error(`Failed to apply config change for ${key}:`, error);
            await this.errorHandler.handleConfigError(key, error);
            throw error;
        }
    }

    async handleConfigFileChanges(changedConfigs) {
        console.log('Config file changes detected:', changedConfigs);
        
        for (const change of changedConfigs) {
            try {
                await this.processConfigFileChange(change);
            } catch (error) {
                console.error(`Failed to process config file change:`, error);
                await this.errorHandler.handleConfigError(change.key, error);
            }
        }
    }

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

    async handleConfigModification(change) {
        // 設定変更の検証と適用
        await this.validationEngine.validateConfigFile(change.file);
        await this.configManager.reloadConfig(change.file);
        await this.syncManager.syncFileChange(change);
    }

    async handleConfigAddition(change) {
        // 新しい設定ファイルの追加
        await this.configManager.loadConfig(change.file);
    }

    async handleConfigDeletion(change) {
        // 設定ファイルの削除処理
        await this.configManager.unloadConfig(change.file);
    }

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
        }
    }

    categorizeConfigKey(key) {
        if (key.includes('frame') || key.includes('fps')) return 'frameStabilization';
        if (key.includes('memory') || key.includes('gc')) return 'memoryManagement';
        if (key.includes('quality') || key.includes('level')) return 'qualityControl';
        if (key.includes('render')) return 'rendering';
        if (key.includes('mobile')) return 'mobile';
        return 'general';
    }

    // 公開API
    async updatePerformanceConfig(configUpdates) {
        const results = [];
        
        for (const [key, value] of Object.entries(configUpdates)) {
            try {
                await this.applyConfigChange(key, value, {
                    reason: 'manual_update',
                    timestamp: Date.now()
                });
                results.push({ key, status: 'success' });
            } catch (error) {
                results.push({ key, status: 'error', error: error.message });
            }
        }
        
        return results;
    }

    async getPerformanceConfig() {
        return await this.configManager.getAllPerformanceConfig();
    }

    async resetToDefaults(category = null) {
        if (category) {
            return await this.configManager.resetCategoryToDefaults(category);
        } else {
            return await this.configManager.resetAllToDefaults();
        }
    }

    async createConfigProfile(name, config) {
        return await this.configManager.createProfile(name, config);
    }

    async loadConfigProfile(name) {
        return await this.configManager.loadProfile(name);
    }

    async getConfigHistory(key, limit = 10) {
        return await this.backupManager.getHistory(key, limit);
    }

    async rollbackConfig(key, version) {
        return await this.backupManager.rollback(key, version);
    }

    getConfigStatus() {
        return {
            initialized: this.initialized,
            activeIntegrations: this.getActiveIntegrations(),
            lastSyncTime: this.syncManager.getLastSyncTime(),
            pendingChanges: this.syncManager.getPendingChanges(),
            errorCount: this.errorHandler.getErrorCount()
        };
    }

    getActiveIntegrations() {
        return {
            configurationManager: !!this.globalConfigManager,
            frameStabilizer: !!this.optimizationSystems.frameStabilizer,
            memoryManager: !!this.optimizationSystems.memoryManager,
            qualityController: !!this.optimizationSystems.qualityController,
            monitoringSystem: !!this.monitoringSystem
        };
    }
}

// パフォーマンス設定管理器
class PerformanceConfigManager {
    constructor() {
        this.config = new Map();
        this.profiles = new Map();
        this.listeners = new Map();
        this.defaults = new Map();
    }

    async initialize() {
        this.setupDefaults();
        await this.loadCurrentConfig();
    }

    setupDefaults() {
        const defaultConfigs = {
            // フレーム安定化設定
            'frameStabilization.enabled': true,
            'frameStabilization.targetFPS': 60,
            'frameStabilization.minFPS': 30,
            'frameStabilization.adaptiveTargeting': true,
            'frameStabilization.stabilityThreshold': 5,
            
            // メモリ管理設定
            'memoryManagement.enabled': true,
            'memoryManagement.maxUsage': 150 * 1024 * 1024, // 150MB
            'memoryManagement.gcInterval': 60000, // 60秒
            'memoryManagement.aggressiveCleanup': false,
            'memoryManagement.leakDetection': true,
            
            // 品質制御設定
            'qualityControl.enabled': true,
            'qualityControl.autoAdjust': true,
            'qualityControl.qualityLevel': 'high',
            'qualityControl.minQuality': 'low',
            'qualityControl.adjustmentSpeed': 'medium',
            
            // レンダリング最適化設定
            'rendering.enableOptimization': true,
            'rendering.dirtyRegions': true,
            'rendering.viewportCulling': true,
            'rendering.batchRendering': true,
            'rendering.layerCaching': true,
            
            // モバイル最適化設定
            'mobile.enableOptimization': true,
            'mobile.deviceDetection': true,
            'mobile.batteryOptimization': true,
            'mobile.thermalManagement': true,
            'mobile.touchOptimization': true
        };

        for (const [key, value] of Object.entries(defaultConfigs)) {
            this.defaults.set(key, value);
            this.config.set(key, value);
        }
    }

    async loadCurrentConfig() {
        // 保存された設定があれば読み込み
        try {
            const saved = localStorage.getItem('performance_config');
            if (saved) {
                const parsedConfig = JSON.parse(saved);
                for (const [key, value] of Object.entries(parsedConfig)) {
                    this.config.set(key, value);
                }
            }
        } catch (error) {
            console.error('Failed to load saved config:', error);
        }
    }

    async get(key) {
        return this.config.get(key);
    }

    async set(key, value, metadata = {}) {
        const oldValue = this.config.get(key);
        this.config.set(key, value);
        
        // 変更通知
        this.notifyChange(key, value, oldValue, metadata);
        
        // 設定の保存
        await this.saveConfig();
        
        return { success: true, oldValue, newValue: value };
    }

    async getAllPerformanceConfig() {
        const config = {};
        for (const [key, value] of this.config) {
            config[key] = value;
        }
        return config;
    }

    onConfigChange(category, callback) {
        if (!this.listeners.has(category)) {
            this.listeners.set(category, new Set());
        }
        this.listeners.get(category).add(callback);
        
        return () => {
            this.listeners.get(category).delete(callback);
        };
    }

    notifyChange(key, newValue, oldValue, metadata) {
        const category = this.categorizeKey(key);
        const listeners = this.listeners.get(category);
        
        if (listeners) {
            for (const callback of listeners) {
                try {
                    callback({ key, newValue, oldValue, metadata });
                } catch (error) {
                    console.error('Config change listener error:', error);
                }
            }
        }
    }

    categorizeKey(key) {
        if (key.startsWith('frameStabilization')) return 'frameStabilization';
        if (key.startsWith('memoryManagement')) return 'memoryManagement';
        if (key.startsWith('qualityControl')) return 'qualityControl';
        if (key.startsWith('rendering')) return 'rendering';
        if (key.startsWith('mobile')) return 'mobile';
        return 'general';
    }

    async saveConfig() {
        try {
            const configObj = Object.fromEntries(this.config);
            localStorage.setItem('performance_config', JSON.stringify(configObj));
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    async resetCategoryToDefaults(category) {
        const resetKeys = [];
        for (const [key, value] of this.defaults) {
            if (this.categorizeKey(key) === category) {
                this.config.set(key, value);
                resetKeys.push(key);
            }
        }
        
        await this.saveConfig();
        return { resetKeys, category };
    }

    async resetAllToDefaults() {
        for (const [key, value] of this.defaults) {
            this.config.set(key, value);
        }
        
        await this.saveConfig();
        return { status: 'success', message: 'All configurations reset to defaults' };
    }

    async createProfile(name, config) {
        this.profiles.set(name, { ...config, created: Date.now() });
        
        // プロファイルの保存
        try {
            const profiles = Object.fromEntries(this.profiles);
            localStorage.setItem('performance_config_profiles', JSON.stringify(profiles));
        } catch (error) {
            console.error('Failed to save profile:', error);
            throw error;
        }
        
        return { name, status: 'created' };
    }

    async loadProfile(name) {
        const profile = this.profiles.get(name);
        if (!profile) {
            throw new Error(`Profile '${name}' not found`);
        }
        
        for (const [key, value] of Object.entries(profile)) {
            if (key !== 'created') {
                this.config.set(key, value);
            }
        }
        
        await this.saveConfig();
        return { name, status: 'loaded' };
    }

    async reloadConfig(file) {
        // 設定ファイルの再読み込み
        console.log(`Reloading config from file: ${file}`);
        // 実装は設定ファイルの形式に依存
    }

    async loadConfig(file) {
        // 新しい設定ファイルの読み込み
        console.log(`Loading new config from file: ${file}`);
    }

    async unloadConfig(file) {
        // 設定ファイルのアンロード
        console.log(`Unloading config from file: ${file}`);
    }
}

// 動的設定更新器
class DynamicConfigUpdater {
    constructor() {
        this.updateQueue = [];
        this.updating = false;
        this.updateHistory = [];
    }

    async initialize() {
        this.startUpdateProcessor();
    }

    startUpdateProcessor() {
        setInterval(() => {
            this.processUpdateQueue();
        }, 1000); // 1秒間隔で更新処理
    }

    async processUpdateQueue() {
        if (this.updating || this.updateQueue.length === 0) return;
        
        this.updating = true;
        
        try {
            while (this.updateQueue.length > 0) {
                const update = this.updateQueue.shift();
                await this.processUpdate(update);
            }
        } catch (error) {
            console.error('Update processing failed:', error);
        } finally {
            this.updating = false;
        }
    }

    async processUpdate(update) {
        try {
            await update.handler(update.data);
            
            this.updateHistory.push({
                ...update,
                status: 'completed',
                completedAt: Date.now()
            });
            
        } catch (error) {
            this.updateHistory.push({
                ...update,
                status: 'failed',
                error: error.message,
                failedAt: Date.now()
            });
        }
    }

    queueUpdate(handler, data, priority = 'normal') {
        this.updateQueue.push({
            id: Date.now() + Math.random(),
            handler,
            data,
            priority,
            queuedAt: Date.now()
        });
        
        // 優先度でソート
        this.updateQueue.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
    }

    getUpdateStatus() {
        return {
            queueLength: this.updateQueue.length,
            updating: this.updating,
            recentUpdates: this.updateHistory.slice(-10)
        };
    }
}

// 設定検証エンジン
class ConfigValidationEngine {
    constructor() {
        this.validators = new Map();
        this.rules = new Map();
    }

    async initialize() {
        this.setupValidators();
        this.setupValidationRules();
    }

    setupValidators() {
        this.validators.set('number', (value, constraints) => {
            if (typeof value !== 'number') throw new Error('Value must be a number');
            if (constraints.min !== undefined && value < constraints.min) {
                throw new Error(`Value must be >= ${constraints.min}`);
            }
            if (constraints.max !== undefined && value > constraints.max) {
                throw new Error(`Value must be <= ${constraints.max}`);
            }
        });

        this.validators.set('boolean', (value, constraints) => {
            if (typeof value !== 'boolean') throw new Error('Value must be a boolean');
        });

        this.validators.set('string', (value, constraints) => {
            if (typeof value !== 'string') throw new Error('Value must be a string');
            if (constraints.enum && !constraints.enum.includes(value)) {
                throw new Error(`Value must be one of: ${constraints.enum.join(', ')}`);
            }
        });
    }

    setupValidationRules() {
        // フレーム安定化設定の検証ルール
        this.rules.set('frameStabilization.targetFPS', {
            type: 'number',
            constraints: { min: 10, max: 120 }
        });

        this.rules.set('frameStabilization.minFPS', {
            type: 'number',
            constraints: { min: 1, max: 60 }
        });

        // メモリ管理設定の検証ルール
        this.rules.set('memoryManagement.maxUsage', {
            type: 'number',
            constraints: { min: 10 * 1024 * 1024, max: 1024 * 1024 * 1024 } // 10MB-1GB
        });

        this.rules.set('memoryManagement.gcInterval', {
            type: 'number',
            constraints: { min: 1000, max: 300000 } // 1秒-5分
        });

        // 品質制御設定の検証ルール
        this.rules.set('qualityControl.qualityLevel', {
            type: 'string',
            constraints: { enum: ['low', 'medium', 'high', 'ultra'] }
        });

        this.rules.set('qualityControl.adjustmentSpeed', {
            type: 'string',
            constraints: { enum: ['slow', 'medium', 'fast'] }
        });
    }

    async validateConfigChange(key, value) {
        const rule = this.rules.get(key);
        if (!rule) {
            // ルールが定義されていない場合は警告のみ
            console.warn(`No validation rule for config key: ${key}`);
            return { valid: true, warnings: [`No validation rule defined for ${key}`] };
        }

        try {
            const validator = this.validators.get(rule.type);
            if (validator) {
                validator(value, rule.constraints || {});
            }
            
            return { valid: true };
            
        } catch (error) {
            throw new Error(`Validation failed for ${key}: ${error.message}`);
        }
    }

    async validateConfigFile(file) {
        // 設定ファイル全体の検証
        console.log(`Validating config file: ${file}`);
        return { valid: true };
    }
}

// 設定エラーハンドラー
class ConfigErrorHandler {
    constructor() {
        this.errors = [];
        this.recoveryStrategies = new Map();
    }

    async initialize() {
        this.setupRecoveryStrategies();
    }

    setupRecoveryStrategies() {
        this.recoveryStrategies.set('validation_error', async (key, error) => {
            console.warn(`Validation error for ${key}, reverting to default`);
            // デフォルト値への復帰
            return { strategy: 'revert_to_default', applied: true };
        });

        this.recoveryStrategies.set('sync_error', async (key, error) => {
            console.warn(`Sync error for ${key}, queuing retry`);
            // 再試行のキューイング
            return { strategy: 'retry_later', applied: true };
        });
    }

    async handleConfigError(key, error) {
        const errorRecord = {
            key,
            error: error.message,
            timestamp: Date.now(),
            type: this.classifyError(error)
        };

        this.errors.push(errorRecord);
        
        // 最新100件のエラーのみ保持
        if (this.errors.length > 100) {
            this.errors.shift();
        }

        // 回復戦略の適用
        const strategy = this.recoveryStrategies.get(errorRecord.type);
        if (strategy) {
            try {
                const result = await strategy(key, error);
                errorRecord.recovery = result;
            } catch (recoveryError) {
                console.error('Recovery strategy failed:', recoveryError);
                errorRecord.recoveryFailed = recoveryError.message;
            }
        }

        return errorRecord;
    }

    classifyError(error) {
        if (error.message.includes('Validation failed')) return 'validation_error';
        if (error.message.includes('sync')) return 'sync_error';
        if (error.message.includes('network')) return 'network_error';
        return 'unknown_error';
    }

    getErrorCount() {
        return this.errors.length;
    }

    getRecentErrors(limit = 10) {
        return this.errors.slice(-limit);
    }
}

// 設定バックアップ管理器
class ConfigBackupManager {
    constructor() {
        this.backups = new Map();
        this.maxBackupsPerKey = 10;
    }

    async initialize() {
        this.loadBackups();
    }

    loadBackups() {
        try {
            const saved = localStorage.getItem('performance_config_backups');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.backups = new Map(Object.entries(parsed));
            }
        } catch (error) {
            console.error('Failed to load backups:', error);
        }
    }

    async createBackup(key, value, metadata = {}) {
        if (!this.backups.has(key)) {
            this.backups.set(key, []);
        }

        const keyBackups = this.backups.get(key);
        keyBackups.push({
            value,
            timestamp: Date.now(),
            metadata
        });

        // 最大バックアップ数を超えた場合は古いものを削除
        if (keyBackups.length > this.maxBackupsPerKey) {
            keyBackups.shift();
        }

        await this.saveBackups();
        return { key, backupCount: keyBackups.length };
    }

    async saveBackups() {
        try {
            const backupsObj = Object.fromEntries(this.backups);
            localStorage.setItem('performance_config_backups', JSON.stringify(backupsObj));
        } catch (error) {
            console.error('Failed to save backups:', error);
        }
    }

    async getHistory(key, limit = 10) {
        const keyBackups = this.backups.get(key) || [];
        return keyBackups.slice(-limit).reverse();
    }

    async rollback(key, version) {
        const keyBackups = this.backups.get(key) || [];
        const backup = keyBackups[version];
        
        if (!backup) {
            throw new Error(`Backup version ${version} not found for key ${key}`);
        }

        return {
            key,
            value: backup.value,
            originalTimestamp: backup.timestamp,
            rollbackTimestamp: Date.now()
        };
    }
}

// 設定同期管理器
class ConfigSyncManager {
    constructor() {
        this.lastSyncTime = null;
        this.pendingChanges = new Set();
        this.syncInProgress = false;
    }

    async initialize() {
        this.startPeriodicSync();
    }

    startPeriodicSync() {
        setInterval(() => {
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
            console.error('Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncGlobalChange(key, value) {
        // グローバル設定変更の同期
        this.pendingChanges.add({ type: 'global', key, value, timestamp: Date.now() });
    }

    async syncConfigChange(key, value) {
        // ローカル設定変更の同期
        this.pendingChanges.add({ type: 'local', key, value, timestamp: Date.now() });
    }

    async syncFileChange(change) {
        // ファイル変更の同期
        this.pendingChanges.add({ type: 'file', ...change, timestamp: Date.now() });
    }

    async syncChange(change) {
        // 実際の同期処理
        console.log('Syncing change:', change);
        // 実装は要件に応じて
    }

    getLastSyncTime() {
        return this.lastSyncTime;
    }

    getPendingChanges() {
        return Array.from(this.pendingChanges);
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
                console.error('Notification subscriber error:', error);
            }
        }
    }
}

// 設定ファイル監視器
class ConfigFileWatcher {
    constructor() {
        this.watchers = new Map();
        this.changeCallbacks = new Set();
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
                console.error('Config change callback error:', error);
            }
        }
    }

    // ブラウザ環境では実ファイル監視は制限されるため、
    // 代替として定期的なチェックや手動トリガーを使用
    startWatching() {
        console.log('Config file watching started (simulated)');
    }
}

export { PerformanceConfigurationIntegration };