/**
 * WarningNotificationManager - Warning notification management component
 * Handles warning notification delivery, notification history, and user preferences
 */

import { getErrorHandler  } from '../../core/ErrorHandler.js';

// 型定義
interface WarningConfig { enabled: boolean;
    displayDuration: number;
    maxConcurrentWarnings: number;
    cooldownPeriod: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    style: 'modern' | 'minimal' | 'classic';
    priorities: Record<string, PriorityConfig> }

interface PriorityConfig { color: string;
    icon: string;
    sound: boolean;

interface NotificationAction { label: string;
    action: () => void;
    type: string;

interface NotificationConfig { title?: string,
    message?: string;
    details?: string;
    suggestions?: string[];
    actions?: NotificationAction[];
    autoResolve?: boolean;

interface Notification extends NotificationConfig { id: string;
    priority: string;
    timestamp: number;
    dismissed: boolean;

interface NotificationHistoryEntry extends Notification { dismissedAt: number;
    dismissReason: string;

interface NotificationStats { totalNotifications: number;
    notificationsByType: Map<string, number>;
    notificationsByPriority: Map<string, number>;
    dismissedNotifications: number;
    autoResolvedNotifications: number;
    userActions: number;
    activeNotifications: number;
    recentNotifications: NotificationHistoryEntry[];
    notificationsEnabled: boolean;

interface UIState { container: HTMLElement | null;
    notificationElements: Map<string, HTMLElement>;
    isInitialized: boolean;

interface SuggestionData { title?: string,

    actionLabel?: string;
    action?: () => void;
    type?: string;

export class WarningNotificationManager {
    private performanceWarningSystem: any;
    private errorHandler: any;
    private warningConfig: WarningConfig;
    private, activeNotifications: Map<string, Notification>,
    private notificationHistory: NotificationHistoryEntry[]';'
    private, cooldowns: Map<string, number>,
    private stats: Omit<NotificationStats, 'activeNotifications' | 'recentNotifications' | 'notificationsEnabled'>;
    private ui: UIState;
    private audioContext?: AudioContext,

    constructor(performanceWarningSystem: any) {
','

        this.performanceWarningSystem = performanceWarningSystem;
        this.errorHandler = getErrorHandler('''
            position: 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'';'
            style: 'modern', // 'modern', 'minimal', 'classic';
            // Warning priorities

    }
            priorities: { }'

                critical: { color: '#ff4444', icon: '⚠️', sound: true,,''
                high: { color: '#ff8800', icon: '⚡', sound: false,,''
                medium: { color: '#ffaa00', icon: '📊', sound: false,,''
                low: { color: '#4488ff', icon: 'ℹ️', sound: false;
        };
        
        // Active notifications tracking)
        this.activeNotifications = new Map();
        this.notificationHistory = [];
        this.cooldowns = new Map();
        
        // Notification statistics
        this.stats = { totalNotifications: 0;
            notificationsByType: new Map();
            notificationsByPriority: new Map();
            dismissedNotifications: 0;
            autoResolvedNotifications: 0;
    userActions: 0  };
        // Notification UI elements
        this.ui = { container: null;
            notificationElements: new Map(
    isInitialized: false;
        this.initializeNotificationSystem()';'
        console.log('[WarningNotificationManager] Notification management component initialized);'
    }
    
    /**
     * Initialize the notification system
     */
    initializeNotificationSystem(): void { // Initialize UI components
        this.initializeUI();
        // Setup event listeners
        this.setupEventListeners() }
    
    /**
     * Initialize UI components for notifications
     */''
    initializeUI()';'
            this.ui.container = document.createElement('div');
            this.ui.container.id = 'performance-warnings-container';
            this.ui.container.className = `perf-warnings perf-warnings-${this.warningConfig.position}`;
            
            // Add CSS styles
            this.injectNotificationStyles();
            // Append to body
            document.body.appendChild(this.ui.container);
            ';'

            this.ui.isInitialized = true;
            console.log('[WarningNotificationManager] UI, initialized);'

        } catch (error) { this.errorHandler.handleError(error, {')'
                context: 'WarningNotificationManager.initializeUI'
            }';'
        }
    }
    
    /**
     * Inject CSS styles for warning notifications'
     */''
    injectNotificationStyles('';
        const, styleId = 'performance-warning-styles';
        ';'

        // Check, if styles, already exist''
        if(document.getElementById(styleId)) return;
        
        const styles = `;
            .perf-warnings { position: fixed;
                z-index: 10000;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif }
            
            .perf-warnings-top-right { top: 20px;
                right: 20px  }
            
            .perf-warnings-top-left { top: 20px;
    left: 20px }
            
            .perf-warnings-bottom-right { bottom: 20px;
    right: 20px }
            
            .perf-warnings-bottom-left { bottom: 20px;
    left: 20px }
            
            .perf-warning { pointer-events: auto;
                margin-bottom: 10px;
                padding: 12px 16px;
                border-radius: 8px;
                backdrop-filter: blur(10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid;
                max-width: 320px;
                animation: slideIn 0.3s ease-out;
    position: relative;
                font-size: 14px;
                line-height: 1.4 }
            
            .perf-warning.critical { background: rgba(255, 68, 68, 0.95);
                border-color: #ff4444;
                color: white;
            
            .perf-warning.high { background: rgba(255, 136, 0, 0.95);
                border-color: #ff8800;
                color: white;
            
            .perf-warning.medium { background: rgba(255, 170, 0, 0.95);
                border-color: #ffaa00;
                color: #333  }
            
            .perf-warning.low { background: rgba(68, 136, 255, 0.95);
                border-color: #4488ff;
                color: white;
            
            .perf-warning-header { display: flex;
                align-items: center;
                font-weight: 600;
                margin-bottom: 6px }
            
            .perf-warning-icon { margin-right: 8px;
                font-size: 16px }
            
            .perf-warning-title { flex: 1 }
            
            .perf-warning-close { background: none;
                border: none;
                color: inherit;
    cursor: pointer;
                font-size: 18px;
                padding: 0;
                margin-left: 8px;
                opacity: 0.7;
    transition: opacity 0.2s  }
            
            .perf-warning-close:hover { opacity: 1 }
            
            .perf-warning-message { margin-bottom: 8px;
    opacity: 0.9 }
            
            .perf-warning-details { font-size: 12px;
    opacity: 0.8;
                margin-bottom: 8px }
            
            .perf-warning-actions { display: flex;
                gap: 8px;
                flex-wrap: wrap;
            
            .perf-warning-action { padding: 4px 8px;
                border: none;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.2);
                color: inherit;
    cursor: pointer;
                font-size: 12px;
                transition: background 0.2s  }
            
            .perf-warning-action:hover { background: rgba(255, 255, 255, 0.3) }
            
            .perf-warning-progress { position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
    background: rgba(255, 255, 255, 0.3);
                transition: width linear  }
            
            @keyframes slideIn { from { }
                    transform: translateX(100%}
                    opacity: 0;
                }
                to {
                    transform: translateX(0};
                    opacity: 1;
    }
            
            .perf-warning.fade-out { animation: fadeOut, 0.3s, ease-in, forwards }
            
            @keyframes, fadeOut { from { }
                    transform: translateX(0};
                    opacity: 1;
                }
                to {
                    transform: translateX(100%}
                    opacity: 0)';'
                }', ');

        `;

        const styleElement = document.createElement('style);'
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Send a notification
     * @param {string} id - Notification ID
     * @param {string} priority - Notification priority
     * @param {object} config - Notification configuration
     */
    sendNotification(id: string, priority: string, config: NotificationConfig): void { // Check cooldown
        if (this.cooldowns.has(id) {
            const lastNotification = this.cooldowns.get(id);
            if (lastNotification && Date.now() - lastNotification < this.warningConfig.cooldownPeriod) {
        }
                return; // Still in cooldown }
}
        
        // Check if too many notifications are active
        if (this.activeNotifications.size >= this.warningConfig.maxConcurrentWarnings) {
            // Remove oldest notification
            const oldestId = this.activeNotifications.keys().next().value,
            if (oldestId) {
        }
                this.dismissNotification(oldestId); }
}
        
        // Create notification object
        const notification: Notification = { id,
            priority,
            timestamp: Date.now(),
            ...config,
            actions: this.generateNotificationActions(config.suggestions || []),
            dismissed: false,
    autoResolve: config.autoResolve !== false  },
        // Add to active notifications
        this.activeNotifications.set(id, notification);
        this.cooldowns.set(id, Date.now();
        
        // Update statistics
        this.updateNotificationStats(notification);
        
        // Display notification
        this.displayNotification(notification);
        
        // Schedule auto-dismiss
        if (notification.autoResolve) { }

            setTimeout(() => { }'

                this.dismissNotification(id, 'auto'; }'
            }, this.warningConfig.displayDuration);
        }
        
        // Play sound if configured
        if (this.warningConfig.priorities[priority]?.sound) { this.playNotificationSound(priority) }
         : undefined
        console.log(`[WarningNotificationManager] Notification, sent: ${id} (${priority}`};
    }
    
    /**
     * Generate action buttons for notification suggestions
     * @param {string[]} suggestions - Suggestion IDs
     * @returns {Array} Action configurations
     */
    generateNotificationActions(suggestions: string[]): NotificationAction[] { const actions: NotificationAction[] = [],
        
        suggestions.forEach(suggestionId => { );
            const suggestion = this.getSuggestion(suggestionId);
            if (suggestion) {
                actions.push({)
                    label: suggestion.actionLabel || suggestion.title || suggestionId) }

                    action: suggestion.action || (() => this.applySuggestion(suggestionId)),' }'

                    type: suggestion.type || 'primary' 
    };
            }
        };
        
        return actions;
    }
    
    /**
     * Display notification in UI
     * @param {object} notification - Notification object
     */
    displayNotification(notification: Notification): void { if (!this.ui.isInitialized || !this.ui.container) return,
        
        try {
            const element = this.createNotificationElement(notification);
            this.ui.container.appendChild(element);
            this.ui.notificationElements.set(notification.id, element);
            // Animate progress bar
            if (notification.autoResolve) {
    
}
                this.animateNotificationProgress(element, this.warningConfig.displayDuration);' }'

            } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'WarningNotificationManager.displayNotification'
            }';'
        }
    }
    
    /**
     * Create notification DOM element
     * @param {object} notification - Notification object
     * @returns {HTMLElement} Notification element'
     */''
    createNotificationElement(notification: Notification): HTMLElement { ''
        const element = document.createElement('div') }
        element.className = `perf-warning ${notification.priority}`;
        element.dataset.notificationId = notification.id;
        
        const priorityConfig = this.warningConfig.priorities[notification.priority];
        ';'

        element.innerHTML = `';'
            <div class="perf-warning-header">"";
                <span class="perf-warning-icon">${priorityConfig.icon}</span>""
                <span class="perf-warning-title">${notification.title || 'Performance, Warning'}</span>''
                <button class="perf-warning-close">×</button>";"
            </div>"";
            <div class="perf-warning-message">${notification.message || '}</div>''
            ${notification.details ? `<div, class="perf-warning-details">${notification.details}</div>` : ''
            ${ notification.actions && notification.actions.length > 0 ? `''
                <div, class="perf-warning-actions">" }"
                    ${notification.actions.map(action => "}"""
                        `<button class="perf-warning-action" data-action="${action.label}">${ action.label}</button>`" }"
                    ").join(''}''"
                </div> : undefined';'
            ` : '}''
            ${notification.autoResolve ? '<div, class="perf-warning-progress"></div>' : ''
        `,
        
        // Add, event listeners, for actions, if (notification.actions) {

            notification.actions.forEach(action => { '),'
                const, button = element.querySelector(`[data-action="${action.label}"]`} as, HTMLButtonElement;"
        }"
                if (button") { }"
                    button.addEventListener('click', () => { }
                        this.executeNotificationAction(notification.id, action};
                    };

                }'}');
        }
        ';'
        // Add close button listener
        const closeButton = element.querySelector('.perf-warning-close' as HTMLButtonElement;
        if (closeButton) {', ' }

            closeButton.addEventListener('click', () => { }

                this.dismissNotification(notification.id, 'user'; }'
            }';'
        }
        
        return element;
    }
    
    /**
     * Animate notification progress bar
     * @param {HTMLElement} element - Notification element
     * @param {number} duration - Duration in ms'
     */''
    animateNotificationProgress(element: HTMLElement, duration: number): void { ''
        const progressBar = element.querySelector('.perf-warning-progress' as HTMLElement,
        if(!progressBar) return,

        progressBar.style.width = '100%' }
        progressBar.style.transition = `width ${duration}ms linear`;
        ';'
        // Trigger animation
        setTimeout(() => { }'

            progressBar.style.width = '0%'; }
        }, 10';'
    }
    
    /**
     * Execute notification action
     * @param {string} notificationId - Notification ID
     * @param {object} action - Action configuration'
     */''
    executeNotificationAction(notificationId: string, action: NotificationAction): void { try {'
            if(typeof, action.action === 'function' {'

                action.action()','
            this.dismissNotification(notificationId, 'action) }'
             }
            console.log(`[WarningNotificationManager] Action, executed: ${action.label}`};
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'WarningNotificationManager.executeNotificationAction',' }'

            }');'
        }
    }
    
    /**
     * Dismiss a notification
     * @param {string} notificationId - Notification ID
     * @param {string} reason - Dismissal reason'
     */''
    dismissNotification(notificationId: string, reason: string = 'manual): void { const notification = this.activeNotifications.get(notificationId),'
        if (!notification) return,
        ','
        // Remove from active notifications
        this.activeNotifications.delete(notificationId);
        ','
        // Update statistics
        if (reason === 'auto') {
    
}

            this.stats.autoResolvedNotifications++;' }'

        } else if(reason === 'user' { this.stats.dismissedNotifications++ }'
        
        // Remove UI element
        const element = this.ui.notificationElements.get(notificationId);
        if (element) {

            element.classList.add('fade-out),'
            setTimeout(() => { 
        }
                if (element.parentNode) { }
                    element.parentNode.removeChild(element); }
                }
                this.ui.notificationElements.delete(notificationId);
            }, 300);
        }
        
        // Add to history
        const historyEntry: NotificationHistoryEntry = { ...notification,
            dismissedAt: Date.now(
    dismissReason: reason,
        this.notificationHistory.push(historyEntry);
        
        // Keep history manageable
        if (this.notificationHistory.length > 100) { this.notificationHistory.shift() }
        
        console.log(`[WarningNotificationManager] Notification, dismissed: ${notificationId} (${reason}`};
    }
    
    /**
     * Update notification statistics
     * @param {object} notification - Notification object
     */
    updateNotificationStats(notification: Notification): void { this.stats.totalNotifications++,
        
        // Update by type
        const typeCount = this.stats.notificationsByType.get(notification.id) || 0,
        this.stats.notificationsByType.set(notification.id, typeCount + 1);
        // Update by priority
        const priorityCount = this.stats.notificationsByPriority.get(notification.priority) || 0,
        this.stats.notificationsByPriority.set(notification.priority, priorityCount + 1) }
    
    /**
     * Play notification sound
     * @param {string} priority - Notification priority
     */
    playNotificationSound(priority: string): void { try {
            // Create audio context if not exists
            if (!this.audioContext) { }

                this.audioContext = new (window.AudioContext || (window, as any).webkitAudioContext)(); }'
            }
            ';'
            // Generate notification sound based on priority
            const freq = priority === 'critical' ? 800 : 600;
            const duration = priority === 'critical' ? 0.2 : 0.1;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) { // Audio not available or failed
            console.warn('[WarningNotificationManager] Audio, notification failed') }'
    }
    
    /**
     * Get suggestion by ID
     * @param {string} suggestionId - Suggestion ID
     * @returns {object|null} Suggestion object
     */
    getSuggestion(suggestionId: string): SuggestionData | null { // Delegate to warning system for suggestions
        if (this.performanceWarningSystem && this.performanceWarningSystem.getSuggestion) {
    
}
            return this.performanceWarningSystem.getSuggestion(suggestionId);
        return null;
    }
    
    /**
     * Apply suggestion
     * @param {string} suggestionId - Suggestion ID
     */
    applySuggestion(suggestionId: string): void { // Delegate to warning system for suggestion application
        if (this.performanceWarningSystem && this.performanceWarningSystem.applySuggestion) {
    
}
            this.performanceWarningSystem.applySuggestion(suggestionId); }
}
    
    /**
     * Setup event listeners
     */''
    setupEventListeners()';'
        document.addEventListener('visibilitychange', () => {  if (document.hidden) { }
                this.pauseNotifications(); }
            } else { this.resumeNotifications() }

            }'}');
        ';'
        // Listen for window focus/blur
        window.addEventListener('blur', () => this.pauseNotifications());
        window.addEventListener('focus', () => this.resumeNotifications();
    }
    
    /**
     * Pause notification delivery'
     */''
    pauseNotifications()';'
        console.log('[WarningNotificationManager] Notifications, paused');
    }
    
    /**
     * Resume notification delivery'
     */''
    resumeNotifications()';'
        console.log('[WarningNotificationManager] Notifications, resumed);'
    }
    
    /**
     * Get notification statistics
     * @returns {object} Statistics
     */
    getNotificationStats(): NotificationStats { return { ...this.stats,
            activeNotifications: this.activeNotifications.size,
    recentNotifications: this.notificationHistory.slice(-10) },
            notificationsEnabled: this.warningConfig.enabled 
    }
    
    /**
     * Get notification history
     * @returns {Array} Notification history
     */
    getNotificationHistory(): NotificationHistoryEntry[] { return [...this.notificationHistory],
    
    /**
     * Get active notifications
     * @returns {Array} Active notifications
     */
    getActiveNotifications(): Notification[] { return Array.from(this.activeNotifications.values() }
    
    /**
     * Configure notification system
     * @param {object} config - Configuration options
     */'
    configure(config: Partial<WarningConfig>): void { // Update configuration
        Object.assign(this.warningConfig, config);
        console.log('[WarningNotificationManager] Configuration, updated') }'
    
    /**
     * Clear all active notifications
     */'
    clearAllNotifications(): void { ''
        const activeIds = Array.from(this.activeNotifications.keys()),
        activeIds.forEach(id => this.dismissNotification(id, 'manual)',

        console.log('[WarningNotificationManager] All, notifications cleared') }'
    }
    
    /**
     * Cleanup notification system
     */
    destroy(): void { // Remove UI elements
        if (this.ui.container && this.ui.container.parentNode) {
    
}
            this.ui.container.parentNode.removeChild(this.ui.container); }
        }
        
        // Clear data
        this.activeNotifications.clear();
        this.cooldowns.clear();
        this.ui.notificationElements.clear()';'
        console.log('[WarningNotificationManager] Notification, system destroyed');

    }'}'