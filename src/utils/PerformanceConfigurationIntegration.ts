/**
 * PerformanceConfigurationIntegration - Main Controller for performance configuration integration system
 * Refactored to use the Main Controller Pattern with sub-components
 * パフォーマンス設定管理強化と動的更新機構
 * Requirements: 4.4, 7.1, 10.3
 */

import { ConfigurationValidator  } from './performance-config/ConfigurationValidator.js';
import { ConfigurationApplier  } from './performance-config/ConfigurationApplier.js';
import { ConfigurationMonitor  } from './performance-config/ConfigurationMonitor.js';

// Type definitions
interface ConfigMetadata {
    reason?: string;
    timestamp?: number;
    [key: string]: any;
}

interface ConfigStatus {
    initialized: boolean;
    activeIntegrations: any;
    lastSyncTime: number | null;
    pendingChanges: any[];
    errorCount: number;
    validator: any;
    applier: any;
    monitor: any;
}

interface Components {
    validator: ConfigurationValidator;
    applier: ConfigurationApplier;
    monitor: ConfigurationMonitor;
    errorHandler: ConfigErrorHandler;
}

interface ConfigurationOptions {
    validator?: any;
    applier?: any;
    monitor?: any;
}

interface ErrorRecord {
    key: string;
    error: string;
    timestamp: number;
    type: string;
    recovery?: RecoveryResult;
    recoveryFailed?: string;
}

interface RecoveryResult {
    strategy: string;
    applied: boolean;
}

type RecoveryStrategy = (key: string, error: Error) => Promise<RecoveryResult>;

export class PerformanceConfigurationIntegration {
    private validator: ConfigurationValidator;
    private applier: ConfigurationApplier;
    private monitor: ConfigurationMonitor;
    private errorHandler: ConfigErrorHandler;
    // Legacy component references for backward compatibility
    private configManager: ConfigurationApplier;
    private validationEngine: ConfigurationValidator;
    private backupManager: ConfigurationApplier;
    private syncManager: any;
    private notificationSystem: any;
    private initialized: boolean;
    constructor() {

        // Initialize sub-components with dependency injection
        this.validator = new ConfigurationValidator(this as any);
        this.applier = new ConfigurationApplier(this as any);
        this.monitor = new ConfigurationMonitor(this as any);
        
        // Legacy component references for backward compatibility
        this.configManager = this.applier;
        this.validationEngine = this.validator;
        this.backupManager = this.applier;
        this.syncManager = (this.monitor as any).syncManager || {};
        this.notificationSystem = (this.monitor as any).notificationSystem || {};
        this.errorHandler = new ConfigErrorHandler();
        this.initialized = false;
        this.initializeIntegration();
        console.log('[PerformanceConfigurationIntegration] Main controller initialized successfully');
    }

    async initializeIntegration(): Promise<void> {
        try {
            // Initialize sub-components
            await this.validator.initialize();
            await this.applier.initialize();
            await this.monitor.initialize();
            await this.errorHandler.initialize();
            // Set error handler for monitor
            if (this.monitor && typeof (this.monitor as any).setErrorHandler === 'function') {
                (this.monitor as any).setErrorHandler(this.errorHandler);
            }

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
     */
    async applyConfigChange(key: string, value: any, metadata: ConfigMetadata = {}): Promise<any> {
        try {
            // Validation - delegated to validator
            await this.validator.validateConfigChange(key, value);
            // Application - delegated to applier
            const result = await this.applier.set(key, value, metadata);
            console.log(`[PerformanceConfigurationIntegration] Configuration applied: ${key} = ${JSON.stringify(value)}`);
            return result;
            
        } catch (error) {
            console.error(`[PerformanceConfigurationIntegration] Failed to apply config change for ${key}:`, error);
            await this.errorHandler.handleConfigError(key, error as Error);
            throw error;
        }
    }

    // ===== PUBLIC API METHODS - Enhanced with sub-component functionality =====
    
    /**
     * Update multiple performance configurations
     */
    async updatePerformanceConfig(configUpdates: Record<string, any>): Promise<any[]> {
        return await this.applier.applyConfigChanges(configUpdates, {
            reason: 'manual_update',
            timestamp: Date.now()
        });
    }

    /**
     * Get all performance configuration - delegated to applier
     */
    async getPerformanceConfig(): Promise<any> {
        return await this.applier.getAllPerformanceConfig();
    }

    /**
     * Reset configuration to defaults - delegated to applier
     */
    async resetToDefaults(category: string | null = null): Promise<any> {
        if (category) {
            return await (this.applier as any).resetCategoryToDefaults(category);
        } else {
            return await (this.applier as any).resetAllToDefaults();
        }
    }

    /**
     * Create configuration profile - delegated to applier
     */
    async createConfigProfile(name: string, config: any): Promise<any> {
        return await this.applier.createProfile(name, config);
    }

    /**
     * Load configuration profile - delegated to applier
     */
    async loadConfigProfile(name: string): Promise<any> {
        return await this.applier.loadProfile(name);
    }

    /**
     * Get configuration history - delegated to applier
     */
    async getConfigHistory(key: string, limit: number = 10): Promise<any[]> {
        return await this.applier.getHistory(key, limit);
    }

    /**
     * Rollback configuration - delegated to applier
     */
    async rollbackConfig(key: string, version: number): Promise<any> {
        return await this.applier.rollback(key, version);
    }

    /**
     * Get configuration status
     */
    getConfigStatus(): ConfigStatus {
        return {
            initialized: this.initialized,
            activeIntegrations: (this.monitor as any).getActiveIntegrations ? (this.monitor as any).getActiveIntegrations() : [],
            lastSyncTime: this.syncManager.getLastSyncTime ? this.syncManager.getLastSyncTime() : null,
            pendingChanges: this.syncManager.getPendingChanges ? this.syncManager.getPendingChanges() : [],
            errorCount: this.errorHandler.getErrorCount(),
            validator: (this.validator as any).getValidatorStatus ? (this.validator as any).getValidatorStatus() : {},
            applier: (this.applier as any).getApplierStatus ? (this.applier as any).getApplierStatus() : {},
            monitor: (this.monitor as any).getMonitorStatus ? (this.monitor as any).getMonitorStatus() : {}
        };
    }

    /**
     * Get active integrations - delegated to monitor
     */
    getActiveIntegrations(): any {
        return (this.monitor as any).getActiveIntegrations ? (this.monitor as any).getActiveIntegrations() : [];
    }

    /**
     * Validate configuration changes - delegated to validator
     */
    async validateConfigChanges(changes: Record<string, any>): Promise<any> {
        return await this.validator.validateConfigChanges(changes);
    }

    /**
     * Configure components
     */
    configure(config: ConfigurationOptions): void {
        if (config.validator && typeof (this.validator as any).configure === 'function') {
            (this.validator as any).configure(config.validator);
        }
        
        if (config.applier && typeof (this.applier as any).configure === 'function') {
            (this.applier as any).configure(config.applier);
        }
        
        if (config.monitor && typeof (this.monitor as any).configure === 'function') {
            (this.monitor as any).configure(config.monitor);
        }

        console.log('[PerformanceConfigurationIntegration] Configuration updated');
    }

    /**
     * Get component references for advanced usage
     */
    getComponents(): Components {
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
    destroy(): void {
        try {
            // Destroy sub-components
            if (this.validator && typeof (this.validator as any).destroy === 'function') {
                (this.validator as any).destroy();
            }
            
            if (this.applier && typeof (this.applier as any).destroy === 'function') {
                (this.applier as any).destroy();
            }
            
            if (this.monitor && typeof (this.monitor as any).destroy === 'function') {
                (this.monitor as any).destroy();
            }
            
            if (this.errorHandler && typeof this.errorHandler.destroy === 'function') {
                this.errorHandler.destroy();
            }

            console.log('[PerformanceConfigurationIntegration] Main controller destroyed');

        } catch (error) {
            console.error('[PerformanceConfigurationIntegration] Error during cleanup:', error);
        }
    }
}

// Singleton instance
let performanceConfigurationIntegrationInstance: PerformanceConfigurationIntegration | null = null;

/**
 * Get PerformanceConfigurationIntegration singleton instance
 */
export function getPerformanceConfigurationIntegration(): PerformanceConfigurationIntegration {
    if (!performanceConfigurationIntegrationInstance) {
        performanceConfigurationIntegrationInstance = new PerformanceConfigurationIntegration();
    }
    return performanceConfigurationIntegrationInstance;
}

// 設定エラーハンドラー - Kept for backward compatibility
class ConfigErrorHandler {
    private errors: ErrorRecord[];
    private recoveryStrategies: Map<string, RecoveryStrategy>;

    constructor() {
        this.errors = [];
        this.recoveryStrategies = new Map<string, RecoveryStrategy>();
    }

    async initialize(): Promise<void> {
        this.setupRecoveryStrategies();
    }

    setupRecoveryStrategies(): void {
        this.recoveryStrategies.set('validation_error', async (key: string, error: Error): Promise<RecoveryResult> => {
            console.warn(`[ConfigErrorHandler] Validation error for ${key}, reverting to default`);
            return { strategy: 'revert_to_default', applied: true };
        });

        this.recoveryStrategies.set('sync_error', async (key: string, error: Error): Promise<RecoveryResult> => {
            console.warn(`[ConfigErrorHandler] Sync error for ${key}, queuing retry`);
            return { strategy: 'retry_later', applied: true };
        });
    }

    async handleConfigError(key: string, error: Error): Promise<ErrorRecord> {
        const errorRecord: ErrorRecord = {
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
                errorRecord.recoveryFailed = (recoveryError as Error).message;
            }
        }

        return errorRecord;
    }

    classifyError(error: Error): string {
        if (error.message.includes('Validation failed')) return 'validation_error';
        if (error.message.includes('sync')) return 'sync_error';
        if (error.message.includes('network')) return 'network_error';
        return 'unknown_error';
    }

    getErrorCount(): number {
        return this.errors.length;
    }

    getRecentErrors(limit: number = 10): ErrorRecord[] {
        return this.errors.slice(-limit);
    }

    destroy(): void {
        this.errors = [];
        this.recoveryStrategies.clear();
    }
}