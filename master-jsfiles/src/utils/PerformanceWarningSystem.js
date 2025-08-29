import { getErrorHandler } from './ErrorHandler.js';

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
import { getErrorHandler } from '../core/ErrorHandler.js';
import { PerformanceThresholdMonitor } from './performance-warning/PerformanceThresholdMonitor.js';
import { WarningNotificationManager } from './performance-warning/WarningNotificationManager.js';
import { PerformanceAlertGenerator } from './performance-warning/PerformanceAlertGenerator.js';

export class PerformanceWarningSystem {
    constructor() {
        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components using dependency injection
        this.thresholdMonitor = new PerformanceThresholdMonitor(this);
        this.notificationManager = new WarningNotificationManager(this);
        this.alertGenerator = new PerformanceAlertGenerator(this);
        
        // Warning system state
        this.isInitialized = false;
        this.isDestroyed = false;
        
        // Suggestion engine (shared across components)
        this.suggestionEngine = {
            enabled: true,
            suggestions: new Map(),
            customSuggestions: new Map(),
            lastSuggestionTime: 0,
            suggestionCooldown: 30000 // 30 seconds
        };
        
        this.initializeWarningSystem();
        
        console.log('[PerformanceWarningSystem] Real-time performance warning system initialized with Main Controller Pattern');
    }
    
    /**
     * Initialize the warning system
     */
    initializeWarningSystem() {
        try {
            // Load default suggestions
            this.loadDefaultSuggestions();
            
            // Start monitoring
            this.thresholdMonitor.startMonitoring();
            
            this.isInitialized = true;
            console.log('[PerformanceWarningSystem] Warning system initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.initializeWarningSystem'
            });
        }
    }
    
    /**
     * Handle violation detected by threshold monitor
     * @param {object} violation - Violation object
     */
    onViolationDetected(violation) {
        try {
            // Generate alert from violation
            const alert = this.alertGenerator.generateAlert(violation);
            if (!alert) return;
            
            // Send notification
            this.notificationManager.sendNotification(
                alert.id,
                alert.priority,
                {
                    title: alert.title,
                    message: alert.message,
                    details: alert.details,
                    suggestions: alert.suggestions,
                    metrics: alert.metrics
                }
            );
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.onViolationDetected'
            });
        }
    }
    
    /**
     * Handle violation resolved by threshold monitor
     * @param {object} violation - Violation object
     */
    onViolationResolved(violation) {
        try {
            // Dismiss related notifications
            this.notificationManager.dismissNotification(violation.id, 'resolved');
            
            console.log(`[PerformanceWarningSystem] Violation resolved: ${violation.id}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.onViolationResolved'
            });
        }
    }
    
    /**
     * Handle violation escalated by threshold monitor
     * @param {object} violation - Violation object
     */
    onViolationEscalated(violation) {
        try {
            // Generate escalated alert
            const alert = this.alertGenerator.generateAlert({
                ...violation,
                severity: 'critical_escalated'
            });
            
            if (alert) {
                // Send high-priority notification
                this.notificationManager.sendNotification(
                    `escalated_${alert.id}`,
                    'critical',
                    {
                        title: `ESCALATED: ${alert.title}`,
                        message: alert.message,
                        details: `Escalated due to repeated violations: ${alert.details}`,
                        suggestions: ['emergency_mode', ...alert.suggestions.slice(0, 2)]
                    }
                );
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.onViolationEscalated'
            });
        }
    }
    
    /**
     * Create and display a warning (legacy method for backward compatibility)
     * @param {string} id - Warning ID
     * @param {string} priority - Warning priority
     * @param {object} config - Warning configuration
     */
    createWarning(id, priority, config) {
        // Delegate to notification manager
        this.notificationManager.sendNotification(id, priority, config);
    }
    
    /**
     * Dismiss a warning (legacy method for backward compatibility)
     * @param {string} warningId - Warning ID
     * @param {string} reason - Dismissal reason
     */
    dismissWarning(warningId, reason = 'manual') {
        // Delegate to notification manager
        this.notificationManager.dismissNotification(warningId, reason);
    }
    
    /**
     * Load default suggestions
     */
    loadDefaultSuggestions() {
        const suggestions = {
            'reduce_quality': {
                title: 'Reduce Graphics Quality',
                description: 'Lower graphics settings to improve performance',
                actionLabel: 'Reduce Quality',
                action: () => this.applySuggestion('reduce_quality')
            },
            'close_apps': {
                title: 'Close Background Apps',
                description: 'Close other applications to free up resources',
                actionLabel: 'Guide Me',
                action: () => this.showBackgroundAppsGuide()
            },
            'restart_game': {
                title: 'Restart Game',
                description: 'Restart the game to clear memory leaks',
                actionLabel: 'Restart',
                action: () => this.showRestartConfirmation()
            },
            'cleanup_memory': {
                title: 'Clean Memory',
                description: 'Force memory cleanup and garbage collection',
                actionLabel: 'Clean Now',
                action: () => this.forceMemoryCleanup()
            },
            'adjust_quality': {
                title: 'Adjust Quality',
                description: 'Fine-tune graphics settings for better performance',
                actionLabel: 'Adjust',
                action: () => this.showQualitySettings()
            },
            'enable_auto_quality': {
                title: 'Enable Auto Quality',
                description: 'Let the system automatically adjust quality',
                actionLabel: 'Enable Auto',
                action: () => this.enableAutoQuality()
            },
            'emergency_mode': {
                title: 'Emergency Mode',
                description: 'Activate emergency performance mode',
                actionLabel: 'Emergency',
                action: () => this.activateEmergencyMode()
            }
        };
        
        Object.entries(suggestions).forEach(([id, suggestion]) => {
            this.suggestionEngine.suggestions.set(id, suggestion);
        });
    }
    
    /**
     * Get suggestion by ID
     * @param {string} suggestionId - Suggestion ID
     * @returns {object|null} Suggestion object
     */
    getSuggestion(suggestionId) {
        return this.suggestionEngine.suggestions.get(suggestionId) || 
               this.suggestionEngine.customSuggestions.get(suggestionId);
    }
    
    /**
     * Apply suggestion
     * @param {string} suggestionId - Suggestion ID
     */
    applySuggestion(suggestionId) {
        const suggestion = this.getSuggestion(suggestionId);
        if (suggestion && suggestion.action) {
            suggestion.action();
        }
    }
    
    /**
     * Show background apps guide
     */
    showBackgroundAppsGuide() {
        console.log('[PerformanceWarningSystem] Showing background apps guide');
        alert('To improve performance:\\n\\n1. Close unnecessary browser tabs\\n2. Exit other applications\\n3. Disable background processes\\n4. Check system resource usage');
    }
    
    /**
     * Show restart confirmation
     */
    showRestartConfirmation() {
        if (confirm('Restart the game to resolve memory issues? Your current progress may be lost.')) {
            window.location.reload();
        }
    }
    
    /**
     * Force memory cleanup
     */
    forceMemoryCleanup() {
        try {
            // Try to access memory manager
            if (window.getMemoryManager) {
                const memoryManager = window.getMemoryManager();
                if (memoryManager.forceCleanup) {
                    memoryManager.forceCleanup();
                    console.log('[PerformanceWarningSystem] Forced memory cleanup');
                    return;
                }
            }
            
            // Fallback: Force GC if available
            if (window.gc) {
                window.gc();
                console.log('[PerformanceWarningSystem] Forced garbage collection');
            }
            
        } catch (error) {
            console.warn('[PerformanceWarningSystem] Memory cleanup failed:', error);
        }
    }
    
    /**
     * Show quality settings
     */
    showQualitySettings() {
        console.log('[PerformanceWarningSystem] Opening quality settings');
        alert('Quality Settings:\\n\\n• Reduce particle effects\\n• Lower rendering quality\\n• Disable shadows\\n• Reduce audio quality');
    }
    
    /**
     * Enable automatic quality adjustment
     */
    enableAutoQuality() {
        try {
            if (window.getPerformanceOptimizer) {
                const optimizer = window.getPerformanceOptimizer();
                if (optimizer.setAdaptiveMode) {
                    optimizer.setAdaptiveMode(true);
                    console.log('[PerformanceWarningSystem] Enabled automatic quality adjustment');
                    return;
                }
            }
            
            console.warn('[PerformanceWarningSystem] Auto quality not available');
            
        } catch (error) {
            console.warn('[PerformanceWarningSystem] Failed to enable auto quality:', error);
        }
    }
    
    /**
     * Activate emergency performance mode
     */
    activateEmergencyMode() {
        try {
            // Force lowest quality settings
            if (window.getPerformanceOptimizer) {
                const optimizer = window.getPerformanceOptimizer();
                if (optimizer.setQualityLevel) {
                    optimizer.setQualityLevel('emergency');
                    console.log('[PerformanceWarningSystem] Emergency mode activated');
                    return;
                }
            }
            
            console.warn('[PerformanceWarningSystem] Emergency mode not available');
            
        } catch (error) {
            console.warn('[PerformanceWarningSystem] Failed to activate emergency mode:', error);
        }
    }
    
    /**
     * Get warning system statistics (legacy method for backward compatibility)
     * @returns {object} Statistics
     */
    getStats() {
        try {
            return {
                thresholdMonitor: this.thresholdMonitor.getMonitoringStats(),
                notifications: this.notificationManager.getNotificationStats(),
                alerts: this.alertGenerator.getStats(),
                suggestions: {
                    totalSuggestions: this.suggestionEngine.suggestions.size + this.suggestionEngine.customSuggestions.size,
                    lastSuggestionTime: this.suggestionEngine.lastSuggestionTime
                },
                systemStatus: {
                    initialized: this.isInitialized,
                    destroyed: this.isDestroyed
                }
            };
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.getStats'
            });
            return {};
        }
    }
    
    /**
     * Configure warning system (legacy method for backward compatibility)
     * @param {object} config - Configuration options
     */
    configure(config) {
        try {
            // Update threshold monitor configuration
            if (config.thresholds) {
                this.thresholdMonitor.updateThresholds(config.thresholds);
            }
            
            // Update notification manager configuration
            if (config.notifications || config.warningConfig) {
                this.notificationManager.configure(config.notifications || config.warningConfig);
            }
            
            // Update alert generator configuration
            if (config.alerts || config.alertConfig) {
                this.alertGenerator.configure(config.alerts || config.alertConfig);
            }
            
            console.log('[PerformanceWarningSystem] Configuration updated');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.configure'
            });
        }
    }
    
    /**
     * Pause warning system
     */
    pause() {
        try {
            this.thresholdMonitor.pause();
            this.notificationManager.pauseNotifications();
            console.log('[PerformanceWarningSystem] Warning system paused');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.pause'
            });
        }
    }
    
    /**
     * Resume warning system
     */
    resume() {
        try {
            this.thresholdMonitor.resume();
            this.notificationManager.resumeNotifications();
            console.log('[PerformanceWarningSystem] Warning system resumed');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.resume'
            });
        }
    }
    
    /**
     * Cleanup warning system
     */
    destroy() {
        try {
            // Destroy sub-components
            if (this.thresholdMonitor) {
                this.thresholdMonitor.destroy();
            }
            
            if (this.notificationManager) {
                this.notificationManager.destroy();
            }
            
            if (this.alertGenerator) {
                this.alertGenerator.destroy();
            }
            
            // Clear suggestion engine
            this.suggestionEngine.suggestions.clear();
            this.suggestionEngine.customSuggestions.clear();
            
            this.isDestroyed = true;
            
            console.log('[PerformanceWarningSystem] Warning system destroyed');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.destroy'
            });
        }
    }
}

// グローバルインスタンス（遅延初期化）
let _performanceWarningSystem = null;

export function getPerformanceWarningSystem() {
    if (!_performanceWarningSystem) {
        try {
            _performanceWarningSystem = new PerformanceWarningSystem();
            console.log('[PerformanceWarningSystem] グローバルインスタンスを作成しました');
        } catch (error) {
            console.error('[PerformanceWarningSystem] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _performanceWarningSystem = new PerformanceWarningSystem();
        }
    }
    return _performanceWarningSystem;
}

// Create performance-warning directory for sub-components

/**
 * PerformanceWarningSystemインスタンスを再初期化
 */
export function reinitializePerformanceWarningSystem() {
    try {
        if (_performanceWarningSystem) {
            _performanceWarningSystem.destroy();
        }
        _performanceWarningSystem = new PerformanceWarningSystem();
        console.log('[PerformanceWarningSystem] 再初期化完了');
    } catch (error) {
        console.error('[PerformanceWarningSystem] 再初期化エラー:', error);
    }
}

// 後方互換性のため
export const performanceWarningSystem = getPerformanceWarningSystem;