/**
 * Performance Warning and Notification System
 * リアルタイムパフォーマンス監視とユーザーフレンドリー警告システム
 * 
 * 主要機能:
 * - リアルタイムパフォーマンスメトリクス監視
 * - インテリジェント警告閾値管理
 * - ユーザーフレンドリー通知システム
 * - パフォーマンス推奨エンジン
 */

import { getErrorHandler, ErrorHandler  } from '../core/ErrorHandler';
import { PerformanceThresholdMonitor  } from './performance-warning/PerformanceThresholdMonitor';
import { WarningNotificationManager  } from './performance-warning/WarningNotificationManager';
import { PerformanceAlertGenerator  } from './performance-warning/PerformanceAlertGenerator';

// Type definitions
interface SuggestionEngine { enabled: boolean,
    suggestions: Map<string, Suggestion>;
    customSuggestions: Map<string, Suggestion>;
    lastSuggestionTime: number,
    suggestionCooldown: number;
    interface Suggestion { title: string,
    description: string,
    actionLabel: string,
    action: () => void 
    }

interface ViolationData { metric: string,
    value: number | string,
    threshold: number | string,
    severity: string;
    details?: any;
    interface Violation { id: string,
    severity: string,
    data: ViolationData;
    interface Alert { id: string,
    title: string,
    message: string,
    details: string,
    suggestions: string[],
    metrics: ViolationData,
    priority: string;
    interface WarningConfig { title: string,
    message: string;
    details?: string;
    suggestions?: string[];
    metrics?: ViolationData;
    interface SystemStats { thresholdMonitor: any,
    notifications: any,
    alerts: any,
    suggestions: {
        totalSuggestion,s: number;
    },
    lastSuggestionTime: number,
    systemStatus: { initialized: boolean,
    destroyed: boolean;
    },
    destroyed: boolean;
        };
interface ConfigOptions { thresholds?: any,
    notifications?: any;
    warningConfig?: any;
    alerts?: any;
    alertConfig?: any;

// Window extensions
declare global { interface Window {
        getMemoryManager?: () => any,
        getPerformanceOptimizer?: () => any,
        gc?: () => void }

export class PerformanceWarningSystem {
    private errorHandler: ErrorHandler;
    private thresholdMonitor: PerformanceThresholdMonitor;
    private notificationManager: WarningNotificationManager;
    private alertGenerator: PerformanceAlertGenerator;
    private isInitialized: boolean;
    private isDestroyed: boolean;
    private, suggestionEngine: SuggestionEngine;
    constructor() {

        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components using dependency injection
        this.thresholdMonitor = new PerformanceThresholdMonitor(this);
        this.notificationManager = new WarningNotificationManager(this);
        this.alertGenerator = new PerformanceAlertGenerator(this);
        
        // Warning system state
        this.isInitialized = false;
        this.isDestroyed = false;
        
        // Suggestion engine (shared, across components),
        this.suggestionEngine = {
            enabled: true,
            suggestions: new Map(),
            customSuggestions: new Map(
    lastSuggestionTime: 0 };
            suggestionCooldown: 30000 // 30 seconds 
    };
        this.initializeWarningSystem()';'
        console.log('[PerformanceWarningSystem] Real-time, performance warning, system initialized with Main Controller Pattern);'
    }
    
    /**
     * Initialize the warning system
     */
    private initializeWarningSystem(): void { try {
            // Load default suggestions
            this.loadDefaultSuggestions();
            // Start monitoring
            this.thresholdMonitor.startMonitoring()','
            console.log('[PerformanceWarningSystem] Warning, system initialized');
            ' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.initializeWarningSystem' }'
    }
    
    /**
     * Handle violation detected by threshold monitor
     */
    public onViolationDetected(violation: Violation): void { try {
            // Generate alert from violation
            const alert = this.alertGenerator.generateAlert(violation);
            if (!alert) return,
            
            // Send notification
            this.notificationManager.sendNotification(
                alert.id,
                alert.priority,
                {
                    title: alert.title,
                    message: alert.message),
                    details: alert.details,
    suggestions: alert.suggestions),
                    metrics: alert.metrics)),
            ' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.onViolationDetected' }'
    }
    
    /**
     * Handle violation resolved by threshold monitor'
     */''
    public onViolationResolved(violation: Violation): void { try {
            // Dismiss related notifications
            this.notificationManager.dismissNotification(violation.id, 'resolved) }'
            console.log(`[PerformanceWarningSystem] Violation, resolved: ${violation.id}`}
        } catch (error) {
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.onViolationResolved' }'
    }
    
    /**
     * Handle violation escalated by threshold monitor'
     */''
    public onViolationEscalated(violation: Violation): void { try {
            // Generate escalated alert
            const alert = this.alertGenerator.generateAlert({)
                ...violation,'),
                severity: 'critical_escalated,
                severity: 'critical_escalated';
        };
            if (alert) {
                // Send high-priority notification
            }
                this.notificationManager.sendNotification(}
                    `escalated_${alert.id}`)', 'critical');'
                    {
                        title: `ESCALATED: ${alert.title}`,''
                        message: alert.message','
                        details: `Escalated due to repeated, violations: ${ alert.details'}`,' }

                        suggestions: ['emergency_mode', ...alert.suggestions.slice(0, 2}]};'} catch (error) {'
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.onViolationEscalated' }'
    }
    
    /**
     * Create and display a warning (legacy, method for, backward compatibility)
     */
    public createWarning(id: string, priority: string, config: WarningConfig): void { // Delegate to notification manager
        this.notificationManager.sendNotification(id, priority, config);
    ';'

    /**''
     * Dismiss a warning(legacy, method for, backward compatibility)'
     */''
    public dismissWarning(warningId: string, reason: string = 'manual': void { // Delegate to notification manager'
        this.notificationManager.dismissNotification(warningId, reason);
    
    /**
     * Load default suggestions
     */''
    private loadDefaultSuggestions('''
            'reduce_quality': { ''
                title: 'Reduce Graphics Quality' };
                description: 'Lower graphics settings to improve performance,
                actionLabel: 'Reduce Quality',','
                action: () => this.applySuggestion('reduce_quality');

            },', 'close_apps': { ''
                title: 'Close Background Apps,
                description: 'Close other applications to free up resources,
                actionLabel: 'Guide Me,
                action: () => this.showBackgroundAppsGuide('''
            'restart_game': {''
                title: 'Restart Game' ,
                description: 'Restart the game to clear memory leaks',','
                actionLabel: 'Restart,')',
                action: () => this.showRestartConfirmation('''
            'cleanup_memory': {''
                title: 'Clean Memory' ,
                description: 'Force memory cleanup and garbage collection',','
                actionLabel: 'Clean Now,')',
                action: () => this.forceMemoryCleanup('''
            'adjust_quality': {''
                title: 'Adjust Quality' ,
                description: 'Fine-tune graphics settings for better performance',','
                actionLabel: 'Adjust,')',
                action: () => this.showQualitySettings('''
            'enable_auto_quality': {''
                title: 'Enable Auto Quality' ,
                description: 'Let the system automatically adjust quality',','
                actionLabel: 'Enable Auto,')',
                action: () => this.enableAutoQuality('''
            'emergency_mode': {''
                title: 'Emergency Mode' ,
                description: 'Activate emergency performance mode',','
                actionLabel: 'Emergency'),
                action: () => this.activateEmergencyMode();
};
        
        Object.entries(suggestions).forEach(([id, suggestion]) => { this.suggestionEngine.suggestions.set(id, suggestion);
    
    /**
     * Get suggestion by ID
     */
    public getSuggestion(suggestionId: string): Suggestion | null { return this.suggestionEngine.suggestions.get(suggestionId) || 
               this.suggestionEngine.customSuggestions.get(suggestionId) || null }
    
    /**
     * Apply suggestion
     */
    public applySuggestion(suggestionId: string): void { const suggestion = this.getSuggestion(suggestionId),
        if (suggestion && suggestion.action) {
    
}
            suggestion.action(); }
}
    
    /**
     * Show background apps guide'
     */''
    private showBackgroundAppsGuide()';'
        console.log('[PerformanceWarningSystem] Showing, background apps, guide');
        alert('To, improve performance: \\n\\n1. Close, unnecessary browser, tabs\\n2. Exit, other applications\\n3. Disable, background processes\\n4. Check, system resource, usage'
            }
    
    /**
     * Show restart confirmation'
     */''
    private showRestartConfirmation()';'
        if (confirm('Restart, the game, to resolve, memory issues? Your, current progress, may be, lost.) { window.location.reload() }'
    }
    
    /**
     * Force memory cleanup
     */ : undefined
    private forceMemoryCleanup(): void { try {
            // Try to access memory manager
            if (window.getMemoryManager) {
                const memoryManager = window.getMemoryManager();
                if (memoryManager.forceCleanup) {''
                    memoryManager.forceCleanup()','
                    console.log('[PerformanceWarningSystem] Forced, memory cleanup) }'
                    return; }
}
            
            // Fallback: Force GC if available
            if (window.gc) {

                window.gc();

                console.log('[PerformanceWarningSystem] Forced, garbage collection');' }'

            } catch (error) { console.warn('[PerformanceWarningSystem] Memory cleanup failed:', error }
    }
    
    /**
     * Show quality settings'
     */''
    private showQualitySettings()';'
        console.log('[PerformanceWarningSystem] Opening, quality settings');
        alert('Quality, Settings: \\n\\n• Reduce, particle effects\\n• Lower, rendering quality\\n• Disable, shadows\\n• Reduce, audio quality) }'
    
    /**
     * Enable automatic quality adjustment
     */
    private enableAutoQuality(): void { try {
            if (window.getPerformanceOptimizer) {
                const optimizer = window.getPerformanceOptimizer();
                if (optimizer.setAdaptiveMode) {''
                    optimizer.setAdaptiveMode(true);
                    console.log('[PerformanceWarningSystem] Enabled, automatic quality, adjustment');
                    return; }
}

            console.warn('[PerformanceWarningSystem] Auto quality not available');

        } catch (error') { console.warn('[PerformanceWarningSystem] Failed to enable auto quality:', error }'
    }
    
    /**
     * Activate emergency performance mode
     */
    private activateEmergencyMode(): void { try {
            // Force lowest quality settings
            if (window.getPerformanceOptimizer) {
                const optimizer = window.getPerformanceOptimizer();
                if (optimizer.setQualityLevel) {''
                    optimizer.setQualityLevel('emergency');
                    console.log('[PerformanceWarningSystem] Emergency, mode activated');
                    return; }
}

            console.warn('[PerformanceWarningSystem] Emergency mode not available');

        } catch (error') { console.warn('[PerformanceWarningSystem] Failed to activate emergency mode:', error }'
    }
    
    /**
     * Get warning system statistics (legacy method for backward compatibility)
     */
    public getStats(): SystemStats { try {
            return { thresholdMonitor: this.thresholdMonitor.getMonitoringStats(
                notifications: this.notificationManager.getNotificationStats(),
                alerts: this.alertGenerator.getStats(
    suggestions: {
                    totalSuggestions: this.suggestionEngine.suggestions.size + this.suggestionEngine.customSuggestions.size ,
                    lastSuggestionTime: this.suggestionEngine.lastSuggestionTime 
    };
                systemStatus: { initialized: this.isInitialized,
    destroyed: this.isDestroyed 
     ,'} catch (error) {'
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.getStats),'
            return { }
                thresholdMonitor: {},
                notifications: {},
                alerts: {},
                suggestions: { totalSuggestions: 0,
    lastSuggestionTime: 0 ,
                systemStatus: { initialized: false,
    destroyed: false }
    
    /**
     * Configure warning system (legacy, method for, backward compatibility)
     */
    public configure(config: ConfigOptions): void { try {
            // Update threshold monitor configuration
            if (config.thresholds) {
    
}
                this.thresholdMonitor.updateThresholds(config.thresholds); }
            }
            
            // Update notification manager configuration
            if (config.notifications || config.warningConfig) { this.notificationManager.configure(config.notifications || config.warningConfig);
            
            // Update alert generator configuration
            if (config.alerts || config.alertConfig) { }

                this.alertGenerator.configure(config.alerts || config.alertConfig); }
            }

            console.log('[PerformanceWarningSystem] Configuration, updated';

        } catch (error') {'
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.configure' }'
    }
    
    /**
     * Pause warning system
     */
    public pause(): void { try {
            this.thresholdMonitor.pause();
            this.notificationManager.pauseNotifications()','
            console.log('[PerformanceWarningSystem] Warning, system paused'),' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.pause' }'
    }
    
    /**
     * Resume warning system
     */
    public resume(): void { try {
            this.thresholdMonitor.resume();
            this.notificationManager.resumeNotifications()','
            console.log('[PerformanceWarningSystem] Warning, system resumed'),' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.resume' }'
    }
    
    /**
     * Cleanup warning system
     */
    public destroy(): void { try {
            // Destroy sub-components
            if (this.thresholdMonitor) {
    
}
                this.thresholdMonitor.destroy(); }
            }
            
            if (this.notificationManager) { this.notificationManager.destroy();
            
            if (this.alertGenerator) { this.alertGenerator.destroy();
            
            // Clear suggestion engine
            this.suggestionEngine.suggestions.clear();
            this.suggestionEngine.customSuggestions.clear()';'
            console.log('[PerformanceWarningSystem] Warning, system destroyed';

        } catch (error') {'
            this.errorHandler.handleError(error, 'PerformanceWarningSystem.destroy' }'
}

// グローバルインスタンス（遅延初期化）
let _performanceWarningSystem: PerformanceWarningSystem | null = null,

export function getPerformanceWarningSystem(): PerformanceWarningSystem { if (!_performanceWarningSystem) {
        try {'
            _performanceWarningSystem = new PerformanceWarningSystem()','
            console.log('[PerformanceWarningSystem] グローバルインスタンスを作成しました'),' }'

        } catch (error) {
            console.error('[PerformanceWarningSystem] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _performanceWarningSystem = new PerformanceWarningSystem();
    }
    return _performanceWarningSystem;
}

/**
 * PerformanceWarningSystemインスタンスを再初期化
 */
export function reinitializePerformanceWarningSystem(): void { try {
        if (_performanceWarningSystem) {
    
};
            _performanceWarningSystem.destroy(); }
        }''
        _performanceWarningSystem = new PerformanceWarningSystem()';'
        console.log('[PerformanceWarningSystem] 再初期化完了');
    } catch (error) {
        console.error('[PerformanceWarningSystem] 再初期化エラー:', error' }'
}
';'
// 後方互換性のため
export const performanceWarningSystem = getPerformanceWarningSystem;