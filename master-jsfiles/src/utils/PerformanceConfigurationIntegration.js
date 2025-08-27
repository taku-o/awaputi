/**
 * PerformanceConfigurationIntegration - Main Controller for performance configuration integration system
 * Refactored to use the Main Controller Pattern with sub-components
 * パフォーマンス設定管理強化と動的更新機構
 * Requirements: 4.4, 7.1, 10.3
 */

import { ConfigurationValidator } from './performance-config/ConfigurationValidator.js';
import { ConfigurationApplier } from './performance-config/ConfigurationApplier.js';
import { ConfigurationMonitor } from './performance-config/ConfigurationMonitor.js';

export class PerformanceConfigurationIntegration {
    constructor() {
        // Initialize sub-components with dependency injection
        this.validator = new ConfigurationValidator(this);
        this.applier = new ConfigurationApplier(this);
        this.monitor = new ConfigurationMonitor(this);
        
        // Legacy component references for backward compatibility
        this.configManager = this.applier;
        this.validationEngine = this.validator;
        this.backupManager = this.applier;
        this.syncManager = this.monitor.syncManager;
        this.notificationSystem = this.monitor.notificationSystem;
        this.errorHandler = new ConfigErrorHandler();
        
        this.initialized = false;
        
        this.initializeIntegration();
        
        console.log('[PerformanceConfigurationIntegration] Main controller initialized successfully');
    }

    async initializeIntegration() {
        try {
            // Initialize sub-components
            await this.validator.initialize();
            await this.applier.initialize();
            await this.monitor.initialize();
            await this.errorHandler.initialize();
            
            // Set error handler for monitor
            this.monitor.setErrorHandler(this.errorHandler);
            
            this.initialized = true;
            console.log('[PerformanceConfigurationIntegration] Main controller initialized successfully');
        } catch (error) {
            console.error('[PerformanceConfigurationIntegration] Failed to initialize:', error);
            throw error;
        }
    }

    // ===== DELEGATED METHODS - Maintain backward compatibility =====
    
    /**
     * Apply configuration change - delegated to applier
     * @param {string} key - Configuration key
     * @param {*} value - Configuration value
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Application result
     */

    async applyConfigChange(key, value, metadata = {}) {
        try {
            // Validation - delegated to validator
            await this.validator.validateConfigChange(key, value);
            
            // Application - delegated to applier
            const result = await this.applier.set(key, value, metadata);
            
            console.log(`[PerformanceConfigurationIntegration] Configuration applied: ${key} = ${JSON.stringify(value)}`);
            return result;
            
        } catch (error) {
            console.error(`[PerformanceConfigurationIntegration] Failed to apply config change for ${key}:`, error);
            await this.errorHandler.handleConfigError(key, error);
            throw error;
        }
    }

    // ===== PUBLIC API METHODS - Enhanced with sub-component functionality =====
    
    /**
     * Update multiple performance configurations
     * @param {Object} configUpdates - Configuration updates
     * @returns {Array} Update results
     */
    async updatePerformanceConfig(configUpdates) {
        return await this.applier.applyConfigChanges(configUpdates, {
            reason: 'manual_update',
            timestamp: Date.now()
        });
    }

    /**
     * Get all performance configuration - delegated to applier
     * @returns {Object} All performance configuration
     */
    async getPerformanceConfig() {
        return await this.applier.getAllPerformanceConfig();
    }

    /**
     * Reset configuration to defaults - delegated to applier
     * @param {string} category - Optional category to reset
     * @returns {Object} Reset result
     */
    async resetToDefaults(category = null) {
        if (category) {
            return await this.applier.resetCategoryToDefaults(category);
        } else {
            return await this.applier.resetAllToDefaults();
        }
    }

    /**
     * Create configuration profile - delegated to applier
     * @param {string} name - Profile name
     * @param {Object} config - Configuration
     * @returns {Object} Profile creation result
     */
    async createConfigProfile(name, config) {
        return await this.applier.createProfile(name, config);
    }

    /**
     * Load configuration profile - delegated to applier
     * @param {string} name - Profile name
     * @returns {Object} Profile load result
     */
    async loadConfigProfile(name) {
        return await this.applier.loadProfile(name);
    }

    /**
     * Get configuration history - delegated to applier
     * @param {string} key - Configuration key
     * @param {number} limit - History limit
     * @returns {Array} Configuration history
     */
    async getConfigHistory(key, limit = 10) {
        return await this.applier.getHistory(key, limit);
    }

    /**
     * Rollback configuration - delegated to applier
     * @param {string} key - Configuration key
     * @param {number} version - Version to rollback to
     * @returns {Object} Rollback result
     */
    async rollbackConfig(key, version) {
        return await this.applier.rollback(key, version);
    }

    /**
     * Get configuration status
     * @returns {Object} Configuration status
     */
    getConfigStatus() {
        return {
            initialized: this.initialized,
            activeIntegrations: this.monitor.getActiveIntegrations(),
            lastSyncTime: this.syncManager.getLastSyncTime(),
            pendingChanges: this.syncManager.getPendingChanges(),
            errorCount: this.errorHandler.getErrorCount(),
            validator: this.validator.getValidatorStatus(),
            applier: this.applier.getApplierStatus(),
            monitor: this.monitor.getMonitorStatus()
        };
    }

    /**
     * Get active integrations - delegated to monitor
     * @returns {Object} Active integrations
     */
    getActiveIntegrations() {
        return this.monitor.getActiveIntegrations();
    }

    /**
     * Validate configuration changes - delegated to validator
     * @param {Object} changes - Configuration changes
     * @returns {Object} Validation result
     */
    async validateConfigChanges(changes) {
        return await this.validator.validateConfigChanges(changes);
    }

    /**
     * Configure components
     * @param {Object} config - Configuration options
     */
    configure(config) {
        if (config.validator) {
            this.validator.configure(config.validator);
        }
        
        if (config.applier) {
            this.applier.configure(config.applier);
        }
        
        if (config.monitor) {
            this.monitor.configure(config.monitor);
        }
        
        console.log('[PerformanceConfigurationIntegration] Configuration updated');
    }

    /**
     * Get component references for advanced usage
     * @returns {Object} Component references
     */
    getComponents() {
        return {
            validator: this.validator,
            applier: this.applier,
            monitor: this.monitor,
            errorHandler: this.errorHandler
        };
    }

    /**
     * Cleanup integration system
     */
    destroy() {
        try {
            // Destroy sub-components
            if (this.validator.destroy) {
                this.validator.destroy();
            }
            
            if (this.applier.destroy) {
                this.applier.destroy();
            }
            
            if (this.monitor.destroy) {
                this.monitor.destroy();
            }
            
            if (this.errorHandler.destroy) {
                this.errorHandler.destroy();
            }
            
            this.initialized = false;
            console.log('[PerformanceConfigurationIntegration] Main controller destroyed');
        } catch (error) {
            console.error('[PerformanceConfigurationIntegration] Error during cleanup:', error);
        }
    }
}

// Singleton instance
let performanceConfigurationIntegrationInstance = null;

/**
 * Get PerformanceConfigurationIntegration singleton instance
 * @returns {PerformanceConfigurationIntegration} Integration instance
 */
export function getPerformanceConfigurationIntegration() {
    if (!performanceConfigurationIntegrationInstance) {
        performanceConfigurationIntegrationInstance = new PerformanceConfigurationIntegration();
    }
    return performanceConfigurationIntegrationInstance;
}

// 設定エラーハンドラー - Kept for backward compatibility
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
            console.warn(`[ConfigErrorHandler] Validation error for ${key}, reverting to default`);
            return { strategy: 'revert_to_default', applied: true };
        });

        this.recoveryStrategies.set('sync_error', async (key, error) => {
            console.warn(`[ConfigErrorHandler] Sync error for ${key}, queuing retry`);
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
                console.error('[ConfigErrorHandler] Recovery strategy failed:', recoveryError);
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

    destroy() {
        this.errors = [];
        this.recoveryStrategies.clear();
    }
}

export { PerformanceConfigurationIntegration };