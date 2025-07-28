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
export class PerformanceWarningSystem {
    constructor() {
        this.errorHandler = getErrorHandler();
        
        // Warning configuration
        this.warningConfig = {
            enabled: true,
            displayDuration: 5000, // 5 seconds
            maxConcurrentWarnings: 3,
            cooldownPeriod: 10000, // 10 seconds between same warning types
            position: 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
            style: 'modern', // 'modern', 'minimal', 'classic'
            
            // Warning priorities
            priorities: {
                critical: { color: '#ff4444', icon: '⚠️', sound: true },
                high: { color: '#ff8800', icon: '⚡', sound: false },
                medium: { color: '#ffaa00', icon: '📊', sound: false },
                low: { color: '#4488ff', icon: 'ℹ️', sound: false }
            }
        };
        
        // Performance thresholds
        this.thresholds = {
            fps: {
                critical: 20,
                warning: 30,
                good: 45,
                excellent: 55
            },
            frameTime: {
                critical: 50, // 50ms
                warning: 33, // 33ms
                good: 22, // 22ms
                excellent: 18 // 18ms
            },
            memory: {
                critical: 0.95, // 95% of limit
                warning: 0.8,   // 80% of limit
                good: 0.6,      // 60% of limit
                excellent: 0.4  // 40% of limit
            },
            stability: {
                critical: 0.3,  // 30% stability score
                warning: 0.5,   // 50% stability score
                good: 0.7,      // 70% stability score
                excellent: 0.9  // 90% stability score
            },
            variance: {
                critical: 20,   // 20ms variance
                warning: 10,    // 10ms variance
                good: 5,        // 5ms variance
                excellent: 2    // 2ms variance
            }
        };
        
        // Active warnings tracking
        this.activeWarnings = new Map();
        this.warningHistory = [];
        this.cooldowns = new Map();
        
        // Performance metrics monitoring
        this.monitoring = {
            enabled: true,
            interval: 1000, // 1 second
            lastCheck: 0,
            metricsBuffer: [],
            bufferSize: 60 // 1 minute of data
        };
        
        // Warning statistics
        this.stats = {
            totalWarnings: 0,
            warningsByType: new Map(),
            warningsByPriority: new Map(),
            dismissedWarnings: 0,
            autoResolvedWarnings: 0,
            userActions: 0
        };
        
        // Notification UI elements
        this.ui = {
            container: null,
            warningElements: new Map(),
            isInitialized: false
        };
        
        // Suggestion engine
        this.suggestionEngine = {
            enabled: true,
            suggestions: new Map(),
            customSuggestions: new Map(),
            lastSuggestionTime: 0,
            suggestionCooldown: 30000 // 30 seconds
        };
        
        this.initializeWarningSystem();
        
        console.log('[PerformanceWarningSystem] Real-time performance warning system initialized');
    }
    
    /**
     * Initialize the warning system
     */
    initializeWarningSystem() {
        // Initialize UI components
        this.initializeUI();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Load default suggestions
        this.loadDefaultSuggestions();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize UI components for warnings
     */
    initializeUI() {
        try {
            // Create warning container
            this.ui.container = document.createElement('div');
            this.ui.container.id = 'performance-warnings-container';
            this.ui.container.className = `perf-warnings perf-warnings-${this.warningConfig.position}`;
            
            // Add CSS styles
            this.injectWarningStyles();
            
            // Append to body
            document.body.appendChild(this.ui.container);
            
            this.ui.isInitialized = true;
            console.log('[PerformanceWarningSystem] UI initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.initializeUI'
            });
        }
    }
    
    /**
     * Inject CSS styles for warning notifications
     */
    injectWarningStyles() {
        const styleId = 'performance-warning-styles';
        
        // Check if styles already exist
        if (document.getElementById(styleId)) return;
        
        const styles = `
            .perf-warnings {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .perf-warnings-top-right {
                top: 20px;
                right: 20px;
            }
            
            .perf-warnings-top-left {
                top: 20px;
                left: 20px;
            }
            
            .perf-warnings-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .perf-warnings-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .perf-warning {
                pointer-events: auto;
                margin-bottom: 10px;
                padding: 12px 16px;
                border-radius: 8px;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid;
                max-width: 320px;
                animation: slideIn 0.3s ease-out;
                position: relative;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .perf-warning.critical {
                background: rgba(255, 68, 68, 0.95);
                border-color: #ff4444;
                color: white;
            }
            
            .perf-warning.high {
                background: rgba(255, 136, 0, 0.95);
                border-color: #ff8800;
                color: white;
            }
            
            .perf-warning.medium {
                background: rgba(255, 170, 0, 0.95);
                border-color: #ffaa00;
                color: #333;
            }
            
            .perf-warning.low {
                background: rgba(68, 136, 255, 0.95);
                border-color: #4488ff;
                color: white;
            }
            
            .perf-warning-header {
                display: flex;
                align-items: center;
                font-weight: 600;
                margin-bottom: 6px;
            }
            
            .perf-warning-icon {
                margin-right: 8px;
                font-size: 16px;
            }
            
            .perf-warning-title {
                flex: 1;
            }
            
            .perf-warning-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                margin-left: 8px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .perf-warning-close:hover {
                opacity: 1;
            }
            
            .perf-warning-message {
                margin-bottom: 8px;
                opacity: 0.9;
            }
            
            .perf-warning-details {
                font-size: 12px;
                opacity: 0.8;
                margin-bottom: 8px;
            }
            
            .perf-warning-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .perf-warning-action {
                padding: 4px 8px;
                border: none;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.2);
                color: inherit;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            
            .perf-warning-action:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .perf-warning-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .perf-warning.fade-out {
                animation: fadeOut 0.3s ease-in forwards;
            }
            
            @keyframes fadeOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (!this.monitoring.enabled) return;
        
        this.monitoringInterval = setInterval(() => {
            this.checkPerformanceMetrics();
        }, this.monitoring.interval);
        
        console.log('[PerformanceWarningSystem] Performance monitoring started');
    }
    
    /**
     * Check performance metrics and trigger warnings
     */
    checkPerformanceMetrics() {
        try {
            const now = Date.now();
            this.monitoring.lastCheck = now;
            
            // Get performance metrics from various sources
            const metrics = this.gatherPerformanceMetrics();
            
            // Add to metrics buffer
            this.monitoring.metricsBuffer.push({
                timestamp: now,
                ...metrics
            });
            
            // Keep buffer size manageable
            if (this.monitoring.metricsBuffer.length > this.monitoring.bufferSize) {
                this.monitoring.metricsBuffer.shift();
            }
            
            // Analyze metrics for warnings
            this.analyzeMetricsForWarnings(metrics);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.checkPerformanceMetrics'
            });
        }
    }
    
    /**
     * Gather performance metrics from available sources
     * @returns {object} Performance metrics
     */
    gatherPerformanceMetrics() {
        const metrics = {
            fps: 60,
            frameTime: 16.67,
            memory: { used: 0, total: 0, pressure: 0 },
            stability: 1.0,
            variance: 0,
            timestamp: Date.now()
        };
        
        try {
            // Try to get metrics from PerformanceOptimizer
            if (window.getPerformanceOptimizer) {
                const optimizer = window.getPerformanceOptimizer();
                if (optimizer && optimizer.getStats) {
                    const stats = optimizer.getStats();
                    metrics.fps = stats.averageFPS || stats.currentFPS || 60;
                    metrics.frameTime = stats.frameTime || 16.67;
                    metrics.stability = stats.stabilityScore || 1.0;
                    metrics.variance = stats.frameTimeVariance || 0;
                }
            }
            
            // Get memory information
            if (performance.memory) {
                metrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    pressure: performance.memory.jsHeapSizeLimit > 0 ? 
                        performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit : 0
                };
            }
            
            // Try to get metrics from MemoryManager
            if (window.getMemoryManager) {
                const memoryManager = window.getMemoryManager();
                if (memoryManager && memoryManager.getStats) {
                    const memStats = memoryManager.getStats();
                    metrics.memoryHealthScore = memStats.memoryHealthScore || 1.0;
                    metrics.leakRisk = memStats.leakRiskLevel || 'low';
                }
            }
            
            // Try to get metrics from FrameStabilizer
            if (window.getFrameStabilizer) {
                const stabilizer = window.getFrameStabilizer();
                if (stabilizer && stabilizer.getStabilizationStatus) {
                    const status = stabilizer.getStabilizationStatus();
                    metrics.stabilityScore = status.timing?.stabilityScore || 1.0;
                    metrics.performanceZone = status.adaptive?.performanceZone || 'optimal';
                    metrics.jitterLevel = status.timing?.jitterLevel || 0;
                }
            }
            
        } catch (error) {
            // Fallback to basic metrics if integration fails
            console.warn('[PerformanceWarningSystem] Failed to gather advanced metrics, using fallbacks');
        }
        
        return metrics;
    }
    
    /**
     * Analyze metrics for potential warnings
     * @param {object} metrics - Current performance metrics
     */
    analyzeMetricsForWarnings(metrics) {
        // Check FPS warnings
        this.checkFPSWarnings(metrics.fps);
        
        // Check memory warnings
        this.checkMemoryWarnings(metrics.memory);
        
        // Check stability warnings
        this.checkStabilityWarnings(metrics.stability || metrics.stabilityScore);
        
        // Check variance warnings
        this.checkVarianceWarnings(metrics.variance);
        
        // Check for performance zone warnings
        if (metrics.performanceZone) {
            this.checkPerformanceZoneWarnings(metrics.performanceZone);
        }
        
        // Check for memory leak warnings
        if (metrics.leakRisk) {
            this.checkMemoryLeakWarnings(metrics.leakRisk);
        }
        
        // Check for jitter warnings
        if (metrics.jitterLevel !== undefined) {
            this.checkJitterWarnings(metrics.jitterLevel);
        }
    }
    
    /**
     * Check FPS-related warnings
     * @param {number} fps - Current FPS
     */
    checkFPSWarnings(fps) {
        const thresholds = this.thresholds.fps;
        
        if (fps < thresholds.critical) {
            this.createWarning('fps_critical', 'critical', {
                title: 'Critical FPS Drop',
                message: `Frame rate severely low: ${Math.round(fps)} FPS`,
                details: `Target: 60 FPS | Current: ${Math.round(fps)} FPS`,
                suggestions: ['reduce_quality', 'close_apps', 'restart_game'],
                metrics: { fps }
            });
        } else if (fps < thresholds.warning) {
            this.createWarning('fps_warning', 'high', {
                title: 'Low Frame Rate',
                message: `Frame rate below optimal: ${Math.round(fps)} FPS`,
                details: `Consider reducing graphics quality`,
                suggestions: ['adjust_quality', 'check_background'],
                metrics: { fps }
            });
        }
    }
    
    /**
     * Check memory-related warnings
     * @param {object} memory - Memory metrics
     */
    checkMemoryWarnings(memory) {
        if (!memory || !memory.pressure) return;
        
        const thresholds = this.thresholds.memory;
        
        if (memory.pressure > thresholds.critical) {
            this.createWarning('memory_critical', 'critical', {
                title: 'Critical Memory Usage',
                message: `Memory usage extremely high: ${Math.round(memory.pressure * 100)}%`,
                details: `${Math.round(memory.used / 1024 / 1024)}MB / ${Math.round(memory.limit / 1024 / 1024)}MB`,
                suggestions: ['force_cleanup', 'close_apps', 'reduce_quality'],
                metrics: { memoryPressure: memory.pressure }
            });
        } else if (memory.pressure > thresholds.warning) {
            this.createWarning('memory_warning', 'high', {
                title: 'High Memory Usage',
                message: `Memory usage elevated: ${Math.round(memory.pressure * 100)}%`,
                details: `Consider closing other applications`,
                suggestions: ['cleanup_memory', 'check_apps'],
                metrics: { memoryPressure: memory.pressure }
            });
        }
    }
    
    /**
     * Check stability-related warnings
     * @param {number} stability - Stability score (0-1)
     */
    checkStabilityWarnings(stability) {
        if (stability === undefined) return;
        
        const thresholds = this.thresholds.stability;
        
        if (stability < thresholds.critical) {
            this.createWarning('stability_critical', 'critical', {
                title: 'Performance Unstable',
                message: `Frame timing highly inconsistent: ${Math.round(stability * 100)}%`,
                details: `Performance stability critically low`,
                suggestions: ['reduce_quality', 'check_system', 'restart_game'],
                metrics: { stability }
            });
        } else if (stability < thresholds.warning) {
            this.createWarning('stability_warning', 'medium', {
                title: 'Performance Inconsistent',
                message: `Frame timing unstable: ${Math.round(stability * 100)}%`,
                details: `Performance could be more stable`,
                suggestions: ['adjust_settings', 'check_background'],
                metrics: { stability }
            });
        }
    }
    
    /**
     * Check frame time variance warnings
     * @param {number} variance - Frame time variance in ms
     */
    checkVarianceWarnings(variance) {
        if (variance === undefined) return;
        
        const thresholds = this.thresholds.variance;
        
        if (variance > thresholds.critical) {
            this.createWarning('variance_critical', 'high', {
                title: 'High Frame Jitter',
                message: `Frame timing very inconsistent: ${variance.toFixed(1)}ms variance`,
                details: `Expect noticeable stuttering`,
                suggestions: ['reduce_effects', 'check_system'],
                metrics: { variance }
            });
        } else if (variance > thresholds.warning) {
            this.createWarning('variance_warning', 'medium', {
                title: 'Frame Time Variance',
                message: `Frame timing inconsistent: ${variance.toFixed(1)}ms variance`,
                details: `Minor stuttering may occur`,
                suggestions: ['optimize_settings'],
                metrics: { variance }
            });
        }
    }
    
    /**
     * Check performance zone warnings
     * @param {string} zone - Performance zone
     */
    checkPerformanceZoneWarnings(zone) {
        if (zone === 'critical') {
            this.createWarning('zone_critical', 'critical', {
                title: 'Critical Performance Zone',
                message: `System performance critically degraded`,
                details: `Automatic quality reduction recommended`,
                suggestions: ['enable_auto_quality', 'reduce_quality'],
                metrics: { zone }
            });
        } else if (zone === 'poor') {
            this.createWarning('zone_poor', 'high', {
                title: 'Poor Performance Zone',
                message: `System performance below acceptable levels`,
                details: `Quality adjustments may help`,
                suggestions: ['adjust_quality', 'check_system'],
                metrics: { zone }
            });
        }
    }
    
    /**
     * Check memory leak warnings
     * @param {string} leakRisk - Memory leak risk level
     */
    checkMemoryLeakWarnings(leakRisk) {
        if (leakRisk === 'critical') {
            this.createWarning('leak_critical', 'critical', {
                title: 'Memory Leak Detected',
                message: `Critical memory leak patterns detected`,
                details: `Memory usage growing rapidly`,
                suggestions: ['restart_game', 'report_issue'],
                metrics: { leakRisk }
            });
        } else if (leakRisk === 'high') {
            this.createWarning('leak_high', 'high', {
                title: 'Potential Memory Leak',
                message: `Suspicious memory growth detected`,
                details: `Monitor memory usage closely`,
                suggestions: ['monitor_memory', 'cleanup_memory'],
                metrics: { leakRisk }
            });
        }
    }
    
    /**
     * Check jitter level warnings
     * @param {number} jitterLevel - Jitter level (0-10)
     */
    checkJitterWarnings(jitterLevel) {
        if (jitterLevel > 8) {
            this.createWarning('jitter_critical', 'high', {
                title: 'Severe Frame Jitter',
                message: `Very high frame jitter detected: ${jitterLevel.toFixed(1)}/10`,
                details: `Gameplay experience significantly impacted`,
                suggestions: ['reduce_effects', 'lower_quality'],
                metrics: { jitterLevel }
            });
        } else if (jitterLevel > 5) {
            this.createWarning('jitter_warning', 'medium', {
                title: 'Frame Jitter Detected',
                message: `Noticeable frame jitter: ${jitterLevel.toFixed(1)}/10`,
                details: `Consider reducing visual effects`,
                suggestions: ['adjust_effects', 'check_background'],
                metrics: { jitterLevel }
            });
        }
    }
    
    /**
     * Create and display a warning
     * @param {string} id - Warning ID
     * @param {string} priority - Warning priority
     * @param {object} config - Warning configuration
     */
    createWarning(id, priority, config) {
        // Check cooldown
        if (this.cooldowns.has(id)) {
            const lastWarning = this.cooldowns.get(id);
            if (Date.now() - lastWarning < this.warningConfig.cooldownPeriod) {
                return; // Still in cooldown
            }
        }
        
        // Check if too many warnings are active
        if (this.activeWarnings.size >= this.warningConfig.maxConcurrentWarnings) {
            // Remove oldest warning
            const oldestId = this.activeWarnings.keys().next().value;
            this.dismissWarning(oldestId);
        }
        
        // Create warning object
        const warning = {
            id,
            priority,
            timestamp: Date.now(),
            ...config,
            actions: this.generateWarningActions(config.suggestions || []),
            dismissed: false,
            autoResolve: true
        };
        
        // Add to active warnings
        this.activeWarnings.set(id, warning);
        this.cooldowns.set(id, Date.now());
        
        // Update statistics
        this.updateWarningStats(warning);
        
        // Display warning
        this.displayWarning(warning);
        
        // Schedule auto-dismiss
        if (warning.autoResolve) {
            setTimeout(() => {
                this.dismissWarning(id, 'auto');
            }, this.warningConfig.displayDuration);
        }
        
        // Play sound if configured
        if (this.warningConfig.priorities[priority].sound) {
            this.playWarningSound(priority);
        }
        
        console.log(`[PerformanceWarningSystem] Warning created: ${id} (${priority})`);
    }
    
    /**
     * Generate action buttons for warning suggestions
     * @param {string[]} suggestions - Suggestion IDs
     * @returns {Array} Action configurations
     */
    generateWarningActions(suggestions) {
        const actions = [];
        
        suggestions.forEach(suggestionId => {
            const suggestion = this.getSuggestion(suggestionId);
            if (suggestion) {
                actions.push({
                    label: suggestion.actionLabel || suggestion.title,
                    action: suggestion.action || (() => this.applySuggestion(suggestionId)),
                    type: suggestion.type || 'primary'
                });
            }
        });
        
        return actions;
    }
    
    /**
     * Display warning in UI
     * @param {object} warning - Warning object
     */
    displayWarning(warning) {
        if (!this.ui.isInitialized) return;
        
        try {
            const element = this.createWarningElement(warning);
            this.ui.container.appendChild(element);
            this.ui.warningElements.set(warning.id, element);
            
            // Animate progress bar
            if (warning.autoResolve) {
                this.animateWarningProgress(element, this.warningConfig.displayDuration);
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.displayWarning'
            });
        }
    }
    
    /**
     * Create warning DOM element
     * @param {object} warning - Warning object
     * @returns {HTMLElement} Warning element
     */
    createWarningElement(warning) {
        const element = document.createElement('div');
        element.className = `perf-warning ${warning.priority}`;
        element.dataset.warningId = warning.id;
        
        const priorityConfig = this.warningConfig.priorities[warning.priority];
        
        element.innerHTML = `
            <div class="perf-warning-header">
                <span class="perf-warning-icon">${priorityConfig.icon}</span>
                <span class="perf-warning-title">${warning.title}</span>
                <button class="perf-warning-close" onclick="this.closest('.perf-warning').remove()">×</button>
            </div>
            <div class="perf-warning-message">${warning.message}</div>
            ${warning.details ? `<div class="perf-warning-details">${warning.details}</div>` : ''}
            ${warning.actions && warning.actions.length > 0 ? `
                <div class="perf-warning-actions">
                    ${warning.actions.map(action => 
                        `<button class="perf-warning-action" data-action="${action.label}">${action.label}</button>`
                    ).join('')}
                </div>
            ` : ''}
            ${warning.autoResolve ? '<div class="perf-warning-progress"></div>' : ''}
        `;
        
        // Add event listeners for actions
        if (warning.actions) {
            warning.actions.forEach(action => {
                const button = element.querySelector(`[data-action="${action.label}"]`);
                if (button) {
                    button.addEventListener('click', () => {
                        this.executeWarningAction(warning.id, action);
                    });
                }
            });
        }
        
        // Add close button listener
        const closeButton = element.querySelector('.perf-warning-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.dismissWarning(warning.id, 'user');
            });
        }
        
        return element;
    }
    
    /**
     * Animate warning progress bar
     * @param {HTMLElement} element - Warning element
     * @param {number} duration - Duration in ms
     */
    animateWarningProgress(element, duration) {
        const progressBar = element.querySelector('.perf-warning-progress');
        if (!progressBar) return;
        
        progressBar.style.width = '100%';
        progressBar.style.transition = `width ${duration}ms linear`;
        
        // Trigger animation
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 10);
    }
    
    /**
     * Execute warning action
     * @param {string} warningId - Warning ID
     * @param {object} action - Action configuration
     */
    executeWarningAction(warningId, action) {
        try {
            if (typeof action.action === 'function') {
                action.action();
            }
            
            // Update statistics
            this.stats.userActions++;
            
            // Dismiss warning after action
            this.dismissWarning(warningId, 'action');
            
            console.log(`[PerformanceWarningSystem] Action executed: ${action.label}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceWarningSystem.executeWarningAction'
            });
        }
    }
    
    /**
     * Dismiss a warning
     * @param {string} warningId - Warning ID
     * @param {string} reason - Dismissal reason
     */
    dismissWarning(warningId, reason = 'manual') {
        const warning = this.activeWarnings.get(warningId);
        if (!warning) return;
        
        // Remove from active warnings
        this.activeWarnings.delete(warningId);
        
        // Update statistics
        if (reason === 'auto') {
            this.stats.autoResolvedWarnings++;
        } else if (reason === 'user') {
            this.stats.dismissedWarnings++;
        }
        
        // Remove UI element
        const element = this.ui.warningElements.get(warningId);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                this.ui.warningElements.delete(warningId);
            }, 300);
        }
        
        // Add to history
        this.warningHistory.push({
            ...warning,
            dismissedAt: Date.now(),
            dismissReason: reason
        });
        
        // Keep history manageable
        if (this.warningHistory.length > 100) {
            this.warningHistory.shift();
        }
        
        console.log(`[PerformanceWarningSystem] Warning dismissed: ${warningId} (${reason})`);
    }
    
    /**
     * Update warning statistics
     * @param {object} warning - Warning object
     */
    updateWarningStats(warning) {
        this.stats.totalWarnings++;
        
        // Update by type
        const typeCount = this.stats.warningsByType.get(warning.id) || 0;
        this.stats.warningsByType.set(warning.id, typeCount + 1);
        
        // Update by priority
        const priorityCount = this.stats.warningsByPriority.get(warning.priority) || 0;
        this.stats.warningsByPriority.set(warning.priority, priorityCount + 1);
    }
    
    /**
     * Play warning sound
     * @param {string} priority - Warning priority
     */
    playWarningSound(priority) {
        try {
            // Create audio context if not exists
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Generate warning sound based on priority
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
            
        } catch (error) {
            // Audio not available or failed
            console.warn('[PerformanceWarningSystem] Audio notification failed');
        }
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
        // This would typically open a help dialog
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
        // This would typically open a settings dialog
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
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for visibility changes to pause monitoring when tab is not active
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMonitoring();
            } else {
                this.resumeMonitoring();
            }
        });
        
        // Listen for window focus/blur
        window.addEventListener('blur', () => this.pauseMonitoring());
        window.addEventListener('focus', () => this.resumeMonitoring());
    }
    
    /**
     * Pause performance monitoring
     */
    pauseMonitoring() {
        this.monitoring.enabled = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('[PerformanceWarningSystem] Monitoring paused');
    }
    
    /**
     * Resume performance monitoring
     */
    resumeMonitoring() {
        if (!this.monitoring.enabled) {
            this.monitoring.enabled = true;
            this.startPerformanceMonitoring();
            console.log('[PerformanceWarningSystem] Monitoring resumed');
        }
    }
    
    /**
     * Get warning system statistics
     * @returns {object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            activeWarnings: this.activeWarnings.size,
            recentWarnings: this.warningHistory.slice(-10),
            monitoringEnabled: this.monitoring.enabled,
            thresholds: this.thresholds
        };
    }
    
    /**
     * Configure warning system
     * @param {object} config - Configuration options
     */
    configure(config) {
        // Update configuration
        Object.assign(this.warningConfig, config);
        
        // Update thresholds if provided
        if (config.thresholds) {
            Object.assign(this.thresholds, config.thresholds);
        }
        
        console.log('[PerformanceWarningSystem] Configuration updated');
    }
    
    /**
     * Cleanup warning system
     */
    destroy() {
        // Clear intervals
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Remove UI elements
        if (this.ui.container && this.ui.container.parentNode) {
            this.ui.container.parentNode.removeChild(this.ui.container);
        }
        
        // Clear data
        this.activeWarnings.clear();
        this.cooldowns.clear();
        this.ui.warningElements.clear();
        
        console.log('[PerformanceWarningSystem] Warning system destroyed');
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