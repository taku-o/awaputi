/**
 * ConfigurationApplier - Configuration application and setting management functionality
 * Part of the PerformanceConfigurationIntegration split implementation
 */

export class ConfigurationApplier {
    constructor(mainController) {
        this.mainController = mainController;
        this.config = new Map();
        this.profiles = new Map();
        this.listeners = new Map();
        this.defaults = new Map();
        this.updateQueue = [];
        this.updating = false;
        this.updateHistory = [];
        this.backups = new Map();
        this.maxBackupsPerKey = 10;
        
        console.log('[ConfigurationApplier] Applier component initialized');
    }
    
    /**
     * Initialize applier components
     */
    async initialize() {
        this.setupDefaults();
        await this.loadCurrentConfig();
        await this.loadBackups();
        this.startUpdateProcessor();
        console.log('[ConfigurationApplier] All applier components initialized');
    }
    
    /**
     * Setup default configuration values
     */
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
    
    /**
     * Load current configuration from storage
     */
    async loadCurrentConfig() {
        try {
            const saved = localStorage.getItem('performance_config');
            if (saved) {
                const parsedConfig = JSON.parse(saved);
                for (const [key, value] of Object.entries(parsedConfig)) {
                    this.config.set(key, value);
                }
            }
        } catch (error) {
            console.error('[ConfigurationApplier] Failed to load saved config:', error);
        }
    }
    
    /**
     * Load configuration backups
     */
    async loadBackups() {
        try {
            const saved = localStorage.getItem('performance_config_backups');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.backups = new Map(Object.entries(parsed));
            }
        } catch (error) {
            console.error('[ConfigurationApplier] Failed to load backups:', error);
        }
    }
    
    /**
     * Start update processor for queued configuration changes
     */
    startUpdateProcessor() {
        setInterval(() => {
            this.processUpdateQueue();
        }, 1000); // 1秒間隔で更新処理
    }
    
    /**
     * Process queued configuration updates
     */
    async processUpdateQueue() {
        if (this.updating || this.updateQueue.length === 0) return;
        
        this.updating = true;
        
        try {
            while (this.updateQueue.length > 0) {
                const update = this.updateQueue.shift();
                await this.processUpdate(update);
            }
        } catch (error) {
            console.error('[ConfigurationApplier] Update processing failed:', error);
        } finally {
            this.updating = false;
        }
    }
    
    /**
     * Process a single configuration update
     * @param {Object} update - Update object
     */
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
    
    /**
     * Get configuration value
     * @param {string} key - Configuration key
     * @returns {*} Configuration value
     */
    async get(key) {
        return this.config.get(key);
    }
    
    /**
     * Set configuration value
     * @param {string} key - Configuration key
     * @param {*} value - Configuration value
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Set result
     */
    async set(key, value, metadata = {}) {
        const oldValue = this.config.get(key);
        
        // Create backup before changing
        await this.createBackup(key, oldValue, metadata);
        
        // Apply the change
        this.config.set(key, value);
        
        // Notify listeners
        this.notifyChange(key, value, oldValue, metadata);
        
        // Save configuration
        await this.saveConfig();
        
        return { success: true, oldValue, newValue: value };
    }
    
    /**
     * Apply multiple configuration changes
     * @param {Object} configUpdates - Configuration updates
     * @param {Object} metadata - Additional metadata
     * @returns {Array} Application results
     */
    async applyConfigChanges(configUpdates, metadata = {}) {
        const results = [];
        
        for (const [key, value] of Object.entries(configUpdates)) {
            try {
                const result = await this.set(key, value, {
                    ...metadata,
                    reason: metadata.reason || 'batch_update',
                    timestamp: Date.now()
                });
                results.push({ key, status: 'success', result });
            } catch (error) {
                results.push({ key, status: 'error', error: error.message });
            }
        }
        
        return results;
    }
    
    /**
     * Create configuration backup
     * @param {string} key - Configuration key
     * @param {*} value - Configuration value
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Backup result
     */
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
    
    /**
     * Save configuration backups
     */
    async saveBackups() {
        try {
            const backupsObj = Object.fromEntries(this.backups);
            localStorage.setItem('performance_config_backups', JSON.stringify(backupsObj));
        } catch (error) {
            console.error('[ConfigurationApplier] Failed to save backups:', error);
        }
    }
    
    /**
     * Get all performance configuration
     * @returns {Object} All configuration values
     */
    async getAllPerformanceConfig() {
        const config = {};
        for (const [key, value] of this.config) {
            config[key] = value;
        }
        return config;
    }
    
    /**
     * Register configuration change listener
     * @param {string} category - Configuration category
     * @param {Function} callback - Change callback
     * @returns {Function} Unsubscribe function
     */
    onConfigChange(category, callback) {
        if (!this.listeners.has(category)) {
            this.listeners.set(category, new Set());
        }
        this.listeners.get(category).add(callback);
        
        return () => {
            this.listeners.get(category).delete(callback);
        };
    }
    
    /**
     * Notify configuration change listeners
     * @param {string} key - Configuration key
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     * @param {Object} metadata - Additional metadata
     */
    notifyChange(key, newValue, oldValue, metadata) {
        const category = this.categorizeKey(key);
        const listeners = this.listeners.get(category);
        
        if (listeners) {
            for (const callback of listeners) {
                try {
                    callback({ key, newValue, oldValue, metadata });
                } catch (error) {
                    console.error('[ConfigurationApplier] Config change listener error:', error);
                }
            }
        }
    }
    
    /**
     * Categorize configuration key
     * @param {string} key - Configuration key
     * @returns {string} Category name
     */
    categorizeKey(key) {
        if (key.startsWith('frameStabilization')) return 'frameStabilization';
        if (key.startsWith('memoryManagement')) return 'memoryManagement';
        if (key.startsWith('qualityControl')) return 'qualityControl';
        if (key.startsWith('rendering')) return 'rendering';
        if (key.startsWith('mobile')) return 'mobile';
        return 'general';
    }
    
    /**
     * Save configuration to storage
     */
    async saveConfig() {
        try {
            const configObj = Object.fromEntries(this.config);
            localStorage.setItem('performance_config', JSON.stringify(configObj));
        } catch (error) {
            console.error('[ConfigurationApplier] Failed to save config:', error);
        }
    }
    
    /**
     * Reset category to defaults
     * @param {string} category - Configuration category
     * @returns {Object} Reset result
     */
    async resetCategoryToDefaults(category) {
        const resetKeys = [];
        for (const [key, value] of this.defaults) {
            if (this.categorizeKey(key) === category) {
                const oldValue = this.config.get(key);
                this.config.set(key, value);
                this.notifyChange(key, value, oldValue, {
                    reason: 'category_reset',
                    category,
                    timestamp: Date.now()
                });
                resetKeys.push(key);
            }
        }
        
        await this.saveConfig();
        return { resetKeys, category };
    }
    
    /**
     * Reset all configuration to defaults
     * @returns {Object} Reset result
     */
    async resetAllToDefaults() {
        const resetKeys = [];
        for (const [key, value] of this.defaults) {
            const oldValue = this.config.get(key);
            this.config.set(key, value);
            this.notifyChange(key, value, oldValue, {
                reason: 'all_reset',
                timestamp: Date.now()
            });
            resetKeys.push(key);
        }
        
        await this.saveConfig();
        return { status: 'success', message: 'All configurations reset to defaults', resetKeys };
    }
    
    /**
     * Create configuration profile
     * @param {string} name - Profile name
     * @param {Object} config - Configuration object
     * @returns {Object} Profile creation result
     */
    async createProfile(name, config) {
        this.profiles.set(name, { ...config, created: Date.now() });
        
        // プロファイルの保存
        try {
            const profiles = Object.fromEntries(this.profiles);
            localStorage.setItem('performance_config_profiles', JSON.stringify(profiles));
        } catch (error) {
            console.error('[ConfigurationApplier] Failed to save profile:', error);
            throw error;
        }
        
        return { name, status: 'created' };
    }
    
    /**
     * Load configuration profile
     * @param {string} name - Profile name
     * @returns {Object} Profile load result
     */
    async loadProfile(name) {
        const profile = this.profiles.get(name);
        if (!profile) {
            throw new Error(`Profile '${name}' not found`);
        }
        
        const changes = {};
        for (const [key, value] of Object.entries(profile)) {
            if (key !== 'created') {
                const oldValue = this.config.get(key);
                this.config.set(key, value);
                this.notifyChange(key, value, oldValue, {
                    reason: 'profile_load',
                    profile: name,
                    timestamp: Date.now()
                });
                changes[key] = { oldValue, newValue: value };
            }
        }
        
        await this.saveConfig();
        return { name, status: 'loaded', changes };
    }
    
    /**
     * Get configuration history
     * @param {string} key - Configuration key
     * @param {number} limit - History limit
     * @returns {Array} Configuration history
     */
    async getHistory(key, limit = 10) {
        const keyBackups = this.backups.get(key) || [];
        return keyBackups.slice(-limit).reverse();
    }
    
    /**
     * Rollback configuration to previous version
     * @param {string} key - Configuration key
     * @param {number} version - Version index
     * @returns {Object} Rollback result
     */
    async rollback(key, version) {
        const keyBackups = this.backups.get(key) || [];
        const backup = keyBackups[version];
        
        if (!backup) {
            throw new Error(`Backup version ${version} not found for key ${key}`);
        }

        const oldValue = this.config.get(key);
        await this.set(key, backup.value, {
            reason: 'rollback',
            originalTimestamp: backup.timestamp,
            rollbackTimestamp: Date.now()
        });

        return {
            key,
            value: backup.value,
            oldValue,
            originalTimestamp: backup.timestamp,
            rollbackTimestamp: Date.now()
        };
    }
    
    /**
     * Queue configuration update
     * @param {Function} handler - Update handler
     * @param {*} data - Update data
     * @param {string} priority - Update priority
     */
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
    
    /**
     * Get update status
     * @returns {Object} Update status
     */
    getUpdateStatus() {
        return {
            queueLength: this.updateQueue.length,
            updating: this.updating,
            recentUpdates: this.updateHistory.slice(-10)
        };
    }
    
    /**
     * Reload configuration from file
     * @param {string} file - Configuration file
     */
    async reloadConfig(file) {
        console.log(`[ConfigurationApplier] Reloading config from file: ${file}`);
        // 実装は設定ファイルの形式に依存
    }
    
    /**
     * Load configuration from file
     * @param {string} file - Configuration file
     */
    async loadConfig(file) {
        console.log(`[ConfigurationApplier] Loading new config from file: ${file}`);
    }
    
    /**
     * Unload configuration from file
     * @param {string} file - Configuration file
     */
    async unloadConfig(file) {
        console.log(`[ConfigurationApplier] Unloading config from file: ${file}`);
    }
    
    /**
     * Get applier status
     * @returns {Object} Applier status
     */
    getApplierStatus() {
        return {
            configCount: this.config.size,
            profileCount: this.profiles.size,
            listenerCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
            updateQueueLength: this.updateQueue.length,
            updating: this.updating,
            backupCount: Array.from(this.backups.values()).reduce((sum, arr) => sum + arr.length, 0)
        };
    }
    
    /**
     * Configure applier settings
     * @param {Object} config - Applier configuration
     */
    configure(config) {
        if (config.maxBackupsPerKey !== undefined) {
            this.maxBackupsPerKey = config.maxBackupsPerKey;
            console.log(`[ConfigurationApplier] Max backups per key: ${this.maxBackupsPerKey}`);
        }
        
        if (config.updateInterval !== undefined) {
            // Update processor interval will be applied on next restart
            console.log(`[ConfigurationApplier] Update interval: ${config.updateInterval}ms`);
        }
    }
    
    /**
     * Cleanup applier resources
     */
    destroy() {
        this.config.clear();
        this.profiles.clear();
        this.listeners.clear();
        this.defaults.clear();
        this.updateQueue = [];
        this.updateHistory = [];
        this.backups.clear();
        
        console.log('[ConfigurationApplier] Applier destroyed');
    }
}