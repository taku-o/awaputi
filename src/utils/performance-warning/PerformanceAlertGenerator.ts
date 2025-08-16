/**
 * PerformanceAlertGenerator - Alert generation logic component
 * Handles alert generation logic, alert prioritization, alert formatting, and alert escalation
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

// 型定義
interface AlertConfig {
    enabled: boolean;
    priorityLevels: string[];
    escalationThresholds: {
        frequency: number;
        timeWindow: number;
        severityIncrease: number;
    };
    suppressionRules: {
        enabled: boolean;
        maxSimilarAlerts: number;
        similarityThreshold: number;
        suppressionDuration: number;
    };
}

interface AlertTemplate {
    title: string;
    message: string;
    details?: string;
}

interface Violation {
    id: string;
    severity: string;
    data: {
        metric: string;
        value?: any;
        threshold?: any;
        details?: Record<string, any>;
    };
    count?: number;
}

interface Alert {
    id: string;
    violationId: string;
    type: string;
    priority: string;
    severity: string;
    timestamp: number;
    title: string;
    message: string;
    details: string;
    suggestions: string[];
    metrics: any;
    escalated: boolean;
    acknowledged: boolean;
    originalPriority?: string;
}

interface AlertFrequency {
    count: number;
    firstSeen: number;
    lastSeen?: number;
}

interface Suppression {
    startedAt: number;
    expiresAt: number;
    count: number;
}

interface SuggestionData {
    title: string;
    actionLabel: string;
}

interface SuggestionEngine {
    enabled: boolean;
    suggestions: Map<string, SuggestionData>;
    customSuggestions: Map<string, SuggestionData>;
    lastSuggestionTime: number;
    suggestionCooldown: number;
}

interface AlertStats {
    totalAlerts: number;
    suppressedAlerts: number;
    alertFrequencies: Record<string, AlertFrequency>;
    escalationRate: number;
    priorityDistribution: Record<string, number>;
}

interface PriorityDistribution {
    critical: number;
    high: number;
    medium: number;
    low: number;
}

type Priority = 'critical' | 'high' | 'medium' | 'low';

export class PerformanceAlertGenerator {
    private performanceWarningSystem: any;
    private errorHandler: any;
    private alertConfig: AlertConfig;
    private alertTemplates: Map<string, AlertTemplate>;
    private alertHistory: Alert[];
    private alertFrequency: Map<string, AlertFrequency>;
    private suppressedAlerts: Map<string, Suppression>;
    private suggestionEngine: SuggestionEngine;

    constructor(performanceWarningSystem: any) {
        this.performanceWarningSystem = performanceWarningSystem;
        this.errorHandler = getErrorHandler();
        
        // Alert generation configuration
        this.alertConfig = {
            enabled: true,
            priorityLevels: ['low', 'medium', 'high', 'critical'],
            escalationThresholds: {
                frequency: 5,    // Number of occurrences before escalation
                timeWindow: 30000, // Time window for frequency calculation (30 seconds)
                severityIncrease: 1 // How many levels to increase severity
            },
            suppressionRules: {
                enabled: true,
                maxSimilarAlerts: 3,
                similarityThreshold: 0.8,
                suppressionDuration: 60000 // 1 minute
            }
        };
        
        // Alert templates
        this.alertTemplates = new Map();
        this.loadDefaultAlertTemplates();
        
        // Alert tracking
        this.alertHistory = [];
        this.alertFrequency = new Map();
        this.suppressedAlerts = new Map();
        
        // Suggestion engine
        this.suggestionEngine = {
            enabled: true,
            suggestions: new Map(),
            customSuggestions: new Map(),
            lastSuggestionTime: 0,
            suggestionCooldown: 30000 // 30 seconds
        };
        
        this.loadDefaultSuggestions();
        
        console.log('[PerformanceAlertGenerator] Alert generation component initialized');
    }
    
    /**
     * Generate alert from violation data
     * @param {object} violation - Violation data
     * @returns {object|null} Generated alert or null if suppressed
     */
    generateAlert(violation: Violation): Alert | null {
        try {
            // Check if alert generation is enabled
            if (!this.alertConfig.enabled) {
                return null;
            }
            
            // Get alert template
            const template = this.getAlertTemplate(violation.id);
            if (!template) {
                console.warn(`[PerformanceAlertGenerator] No template found for violation: ${violation.id}`);
                return null;
            }
            
            // Check suppression rules
            if (this.shouldSuppressAlert(violation)) {
                console.log(`[PerformanceAlertGenerator] Alert suppressed: ${violation.id}`);
                return null;
            }
            
            // Calculate priority
            const priority = this.calculateAlertPriority(violation);
            
            // Generate alert object
            const alert: Alert = {
                id: `alert_${violation.id}_${Date.now()}`,
                violationId: violation.id,
                type: violation.data.metric,
                priority,
                severity: violation.severity,
                timestamp: Date.now(),
                title: this.generateAlertTitle(template, violation),
                message: this.generateAlertMessage(template, violation),
                details: this.generateAlertDetails(template, violation),
                suggestions: this.generateAlertSuggestions(violation),
                metrics: violation.data,
                escalated: false,
                acknowledged: false
            };
            
            // Update tracking
            this.updateAlertTracking(alert);
            
            // Check for escalation
            this.checkAlertEscalation(alert);
            
            console.log(`[PerformanceAlertGenerator] Alert generated: ${alert.id} (${priority})`);
            
            return alert;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceAlertGenerator.generateAlert'
            });
            return null;
        }
    }
    
    /**
     * Get alert template for violation type
     * @param {string} violationId - Violation ID
     * @returns {object|null} Alert template
     */
    getAlertTemplate(violationId: string): AlertTemplate | null {
        // Map violation IDs to template IDs
        const templateMap: Record<string, string> = {
            'fps_critical': 'fps_performance',
            'fps_warning': 'fps_performance',
            'memory_critical': 'memory_usage',
            'memory_warning': 'memory_usage',
            'stability_critical': 'stability_issue',
            'stability_warning': 'stability_issue',
            'variance_critical': 'frame_variance',
            'variance_warning': 'frame_variance',
            'zone_critical': 'performance_zone',
            'zone_poor': 'performance_zone',
            'leak_critical': 'memory_leak',
            'leak_high': 'memory_leak',
            'jitter_critical': 'frame_jitter',
            'jitter_warning': 'frame_jitter'
        };
        
        const templateId = templateMap[violationId];
        return templateId ? this.alertTemplates.get(templateId) || null : null;
    }
    
    /**
     * Check if alert should be suppressed
     * @param {object} violation - Violation data
     * @returns {boolean} True if should be suppressed
     */
    shouldSuppressAlert(violation: Violation): boolean {
        if (!this.alertConfig.suppressionRules.enabled) {
            return false;
        }
        
        const now = Date.now();
        const suppressionKey = violation.id;
        
        // Check if currently suppressed
        const suppression = this.suppressedAlerts.get(suppressionKey);
        if (suppression && now < suppression.expiresAt) {
            // Update suppression count
            suppression.count++;
            return true;
        }
        
        // Check similarity to recent alerts
        const recentAlerts = this.alertHistory.filter(alert => 
            now - alert.timestamp < this.alertConfig.suppressionRules.maxSimilarAlerts * 1000
        );
        
        const similarAlerts = recentAlerts.filter(alert => 
            this.calculateAlertSimilarity(alert.violationId, violation.id) > 
            this.alertConfig.suppressionRules.similarityThreshold
        );
        
        if (similarAlerts.length >= this.alertConfig.suppressionRules.maxSimilarAlerts) {
            // Start suppression
            this.suppressedAlerts.set(suppressionKey, {
                startedAt: now,
                expiresAt: now + this.alertConfig.suppressionRules.suppressionDuration,
                count: 1
            });
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate similarity between two alerts
     * @param {string} alertId1 - First alert ID
     * @param {string} alertId2 - Second alert ID
     * @returns {number} Similarity score (0-1)
     */
    calculateAlertSimilarity(alertId1: string, alertId2: string): number {
        if (alertId1 === alertId2) return 1.0;
        
        // Extract base types (remove _critical, _warning suffixes)
        const baseType1 = alertId1.replace(/_critical|_warning|_high|_medium|_low$/, '');
        const baseType2 = alertId2.replace(/_critical|_warning|_high|_medium|_low$/, '');
        
        if (baseType1 === baseType2) return 0.8;
        
        // Check category similarity
        const categories: Record<string, string[]> = {
            'fps': ['fps'],
            'memory': ['memory', 'leak'],
            'stability': ['stability', 'variance', 'jitter'],
            'zone': ['zone']
        };
        
        for (const [category, types] of Object.entries(categories)) {
            if (types.some(type => baseType1.includes(type)) && 
                types.some(type => baseType2.includes(type))) {
                return 0.6;
            }
        }
        
        return 0.0;
    }
    
    /**
     * Calculate alert priority
     * @param {object} violation - Violation data
     * @returns {string} Priority level
     */
    calculateAlertPriority(violation: Violation): string {
        let basePriority = violation.severity;
        
        // Map severity to priority
        const severityToPriority: Record<string, string> = {
            'critical': 'critical',
            'high': 'high',
            'warning': 'medium',
            'medium': 'medium',
            'low': 'low'
        };
        
        let priority = severityToPriority[basePriority] || 'low';
        
        // Check for escalation factors
        const escalationFactors = this.getEscalationFactors(violation);
        
        if (escalationFactors.length > 0) {
            priority = this.escalatePriority(priority, escalationFactors.length);
        }
        
        return priority;
    }
    
    /**
     * Get escalation factors for violation
     * @param {object} violation - Violation data
     * @returns {Array} Escalation factors
     */
    getEscalationFactors(violation: Violation): string[] {
        const factors: string[] = [];
        
        // Check frequency
        const frequency = this.alertFrequency.get(violation.id) || { count: 0, firstSeen: Date.now() };
        if (frequency.count >= this.alertConfig.escalationThresholds.frequency) {
            factors.push('high_frequency');
        }
        
        // Check metric severity
        if (violation.data) {
            const { metric, value, threshold } = violation.data;
            
            if (metric === 'fps' && typeof value === 'number' && typeof threshold === 'number' && value < threshold * 0.5) {
                factors.push('severe_fps_drop');
            } else if (metric === 'memory_pressure' && typeof value === 'number' && typeof threshold === 'number' && value > threshold * 1.2) {
                factors.push('severe_memory_pressure');
            } else if (metric === 'stability_score' && typeof value === 'number' && typeof threshold === 'number' && value < threshold * 0.5) {
                factors.push('severe_instability');
            }
        }
        
        // Check consecutive violations
        if (violation.count && violation.count > 5) {
            factors.push('consecutive_violations');
        }
        
        return factors;
    }
    
    /**
     * Escalate priority level
     * @param {string} currentPriority - Current priority
     * @param {number} escalationLevel - Level of escalation
     * @returns {string} New priority
     */
    escalatePriority(currentPriority: string, escalationLevel: number = 1): string {
        const priorityLevels = this.alertConfig.priorityLevels;
        const currentIndex = priorityLevels.indexOf(currentPriority);
        
        if (currentIndex === -1) return currentPriority;
        
        const newIndex = Math.min(
            priorityLevels.length - 1, 
            currentIndex + escalationLevel
        );
        
        return priorityLevels[newIndex];
    }
    
    /**
     * Generate alert title
     * @param {object} template - Alert template
     * @param {object} violation - Violation data
     * @returns {string} Alert title
     */
    generateAlertTitle(template: AlertTemplate, violation: Violation): string {
        let title = template.title;
        
        // Replace placeholders
        title = title.replace('{severity}', violation.severity.toUpperCase());
        title = title.replace('{metric}', violation.data.metric);
        
        if (violation.data.value !== undefined) {
            const formattedValue = this.formatMetricValue(violation.data.metric, violation.data.value);
            title = title.replace('{value}', formattedValue);
        }
        
        return title;
    }
    
    /**
     * Generate alert message
     * @param {object} template - Alert template
     * @param {object} violation - Violation data
     * @returns {string} Alert message
     */
    generateAlertMessage(template: AlertTemplate, violation: Violation): string {
        let message = template.message;
        
        // Replace placeholders
        message = message.replace('{metric}', violation.data.metric);
        
        if (violation.data.value !== undefined) {
            const formattedValue = this.formatMetricValue(violation.data.metric, violation.data.value);
            message = message.replace('{value}', formattedValue);
        }
        
        if (violation.data.threshold !== undefined) {
            const formattedThreshold = this.formatMetricValue(violation.data.metric, violation.data.threshold);
            message = message.replace('{threshold}', formattedThreshold);
        }
        
        return message;
    }
    
    /**
     * Generate alert details
     * @param {object} template - Alert template
     * @param {object} violation - Violation data
     * @returns {string} Alert details
     */
    generateAlertDetails(template: AlertTemplate, violation: Violation): string {
        let details = template.details || '';
        
        // Add metric-specific details
        if (violation.data.details) {
            const detailsText = Object.entries(violation.data.details)
                .map(([key, value]) => `${key}: ${this.formatMetricValue(key, value)}`)
                .join(' | ');
            details += details ? ` | ${detailsText}` : detailsText;
        }
        
        return details;
    }
    
    /**
     * Generate alert suggestions
     * @param {object} violation - Violation data
     * @returns {Array} Suggestion IDs
     */
    generateAlertSuggestions(violation: Violation): string[] {
        const suggestions: string[] = [];
        
        // Base suggestions by violation type
        const suggestionMap: Record<string, string[]> = {
            'fps_critical': ['reduce_quality', 'close_apps', 'restart_game'],
            'fps_warning': ['adjust_quality', 'check_background'],
            'memory_critical': ['force_cleanup', 'close_apps', 'reduce_quality'],
            'memory_warning': ['cleanup_memory', 'check_apps'],
            'stability_critical': ['reduce_quality', 'check_system', 'restart_game'],
            'stability_warning': ['adjust_settings', 'check_background'],
            'variance_critical': ['reduce_effects', 'check_system'],
            'variance_warning': ['optimize_settings'],
            'zone_critical': ['enable_auto_quality', 'reduce_quality'],
            'zone_poor': ['adjust_quality', 'check_system'],
            'leak_critical': ['restart_game', 'report_issue'],
            'leak_high': ['monitor_memory', 'cleanup_memory'],
            'jitter_critical': ['reduce_effects', 'lower_quality'],
            'jitter_warning': ['adjust_effects', 'check_background']
        };
        
        const baseSuggestions = suggestionMap[violation.id] || [];
        suggestions.push(...baseSuggestions);
        
        // Add severity-based suggestions
        if (violation.severity === 'critical') {
            suggestions.unshift('emergency_mode');
        }
        
        // Remove duplicates and limit count
        return [...new Set(suggestions)].slice(0, 3);
    }
    
    /**
     * Format metric value for display
     * @param {string} metric - Metric type
     * @param {*} value - Metric value
     * @returns {string} Formatted value
     */
    formatMetricValue(metric: string, value: any): string {
        if (typeof value !== 'number') return String(value);
        
        switch (metric) {
            case 'fps':
                return `${Math.round(value)} FPS`;
            case 'memory_pressure':
                return `${Math.round(value * 100)}%`;
            case 'stability_score':
                return `${Math.round(value * 100)}%`;
            case 'frame_variance':
                return `${value.toFixed(1)}ms`;
            case 'jitter_level':
                return `${value.toFixed(1)}/10`;
            case 'used':
            case 'total':
            case 'limit':
                return `${Math.round(value / 1024 / 1024)}MB`;
            default:
                return value.toFixed(2);
        }
    }
    
    /**
     * Update alert tracking
     * @param {object} alert - Alert object
     */
    updateAlertTracking(alert: Alert): void {
        // Add to history
        this.alertHistory.push(alert);
        
        // Keep history manageable
        if (this.alertHistory.length > 500) {
            this.alertHistory.shift();
        }
        
        // Update frequency tracking
        const frequency = this.alertFrequency.get(alert.violationId) || { count: 0, firstSeen: Date.now() };
        frequency.count++;
        frequency.lastSeen = Date.now();
        this.alertFrequency.set(alert.violationId, frequency);
        
        // Clean old frequency data
        this.cleanOldFrequencyData();
    }
    
    /**
     * Clean old frequency tracking data
     */
    cleanOldFrequencyData(): void {
        const now = Date.now();
        const maxAge = this.alertConfig.escalationThresholds.timeWindow * 10; // 10x time window
        
        for (const [key, frequency] of this.alertFrequency.entries()) {
            if (frequency.lastSeen && now - frequency.lastSeen > maxAge) {
                this.alertFrequency.delete(key);
            }
        }
    }
    
    /**
     * Check alert escalation
     * @param {object} alert - Alert object
     */
    checkAlertEscalation(alert: Alert): void {
        const frequency = this.alertFrequency.get(alert.violationId);
        if (!frequency) return;
        
        const timeWindow = this.alertConfig.escalationThresholds.timeWindow;
        const recentCount = this.alertHistory.filter(
            a => a.violationId === alert.violationId && 
                 Date.now() - a.timestamp < timeWindow
        ).length;
        
        if (recentCount >= this.alertConfig.escalationThresholds.frequency) {
            alert.escalated = true;
            alert.originalPriority = alert.priority;
            alert.priority = this.escalatePriority(alert.priority, this.alertConfig.escalationThresholds.severityIncrease);
            
            console.log(`[PerformanceAlertGenerator] Alert escalated: ${alert.id} to ${alert.priority}`);
        }
    }
    
    /**
     * Prioritize alerts
     * @param {Array} alerts - Array of alerts
     * @returns {Array} Prioritized alerts
     */
    prioritizeAlerts(alerts: Alert[]): Alert[] {
        const priorityOrder: Record<string, number> = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        
        return alerts.sort((a, b) => {
            // Sort by priority first
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by escalation status
            if (a.escalated !== b.escalated) {
                return b.escalated ? 1 : -1;
            }
            
            // Then by timestamp (newest first)
            return b.timestamp - a.timestamp;
        });
    }
    
    /**
     * Load default alert templates
     */
    loadDefaultAlertTemplates(): void {
        const templates: Record<string, AlertTemplate> = {
            'fps_performance': {
                title: '{severity} FPS Drop',
                message: 'Frame rate {value}, target: 60 FPS',
                details: 'Consider reducing graphics quality'
            },
            'memory_usage': {
                title: '{severity} Memory Usage',
                message: 'Memory usage {value}, threshold: {threshold}',
                details: 'High memory usage detected'
            },
            'stability_issue': {
                title: '{severity} Performance Instability',
                message: 'Frame timing unstable: {value}',
                details: 'Performance stability compromised'
            },
            'frame_variance': {
                title: '{severity} Frame Jitter',
                message: 'Frame timing variance: {value}',
                details: 'Inconsistent frame timing detected'
            },
            'performance_zone': {
                title: '{severity} Performance Zone',
                message: 'Performance zone: {value}',
                details: 'System performance degraded'
            },
            'memory_leak': {
                title: '{severity} Memory Leak',
                message: 'Memory leak risk: {value}',
                details: 'Suspicious memory growth patterns'
            },
            'frame_jitter': {
                title: '{severity} Frame Jitter',
                message: 'Jitter level: {value}',
                details: 'Frame timing irregularities'
            }
        };
        
        Object.entries(templates).forEach(([id, template]) => {
            this.alertTemplates.set(id, template);
        });
    }
    
    /**
     * Load default suggestions
     */
    loadDefaultSuggestions(): void {
        const suggestions: Record<string, SuggestionData> = {
            'reduce_quality': {
                title: 'Reduce Graphics Quality',
                actionLabel: 'Reduce Quality'
            },
            'close_apps': {
                title: 'Close Background Apps',
                actionLabel: 'Guide Me'
            },
            'restart_game': {
                title: 'Restart Game',
                actionLabel: 'Restart'
            },
            'cleanup_memory': {
                title: 'Clean Memory',
                actionLabel: 'Clean Now'
            },
            'adjust_quality': {
                title: 'Adjust Quality',
                actionLabel: 'Adjust'
            },
            'enable_auto_quality': {
                title: 'Enable Auto Quality',
                actionLabel: 'Enable Auto'
            },
            'emergency_mode': {
                title: 'Emergency Mode',
                actionLabel: 'Emergency'
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
    getSuggestion(suggestionId: string): SuggestionData | null {
        return this.suggestionEngine.suggestions.get(suggestionId) || 
               this.suggestionEngine.customSuggestions.get(suggestionId) || null;
    }
    
    /**
     * Get alert generation statistics
     * @returns {object} Statistics
     */
    getStats(): AlertStats {
        return {
            totalAlerts: this.alertHistory.length,
            suppressedAlerts: this.suppressedAlerts.size,
            alertFrequencies: Object.fromEntries(this.alertFrequency),
            escalationRate: this.alertHistory.filter(a => a.escalated).length / Math.max(1, this.alertHistory.length),
            priorityDistribution: this.calculatePriorityDistribution()
        };
    }
    
    /**
     * Calculate priority distribution
     * @returns {object} Priority distribution
     */
    calculatePriorityDistribution(): Record<string, number> {
        const distribution: PriorityDistribution = { critical: 0, high: 0, medium: 0, low: 0 };
        
        this.alertHistory.forEach(alert => {
            if (distribution.hasOwnProperty(alert.priority as keyof PriorityDistribution)) {
                (distribution as any)[alert.priority]++;
            }
        });
        
        return distribution;
    }
    
    /**
     * Configure alert generator
     * @param {object} config - Configuration options
     */
    configure(config: Partial<AlertConfig>): void {
        Object.assign(this.alertConfig, config);
        console.log('[PerformanceAlertGenerator] Configuration updated');
    }
    
    /**
     * Cleanup alert generator
     */
    destroy(): void {
        this.alertHistory = [];
        this.alertFrequency.clear();
        this.suppressedAlerts.clear();
        this.alertTemplates.clear();
        this.suggestionEngine.suggestions.clear();
        
        console.log('[PerformanceAlertGenerator] Alert generator destroyed');
    }
}