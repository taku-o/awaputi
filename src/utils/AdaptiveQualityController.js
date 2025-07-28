import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * Adaptive Quality Control System
 * 適応的品質制御システム - パフォーマンスベースの自動品質調整と検証・ロールバック機能
 * 
 * 主要機能:
 * - インテリジェント品質調整アルゴリズム
 * - 段階的品質調整メカニズム
 * - 視覚的一貫性の維持
 * - 品質設定検証とロールバック
 * - ユーザー設定保護システム
 */
export class AdaptiveQualityController {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // Quality control configuration
        this.qualityConfig = {
            enabled: true,
            autoAdjustment: true,
            userOverride: false,
            adjustmentSensitivity: 'balanced', // 'conservative', 'balanced', 'aggressive'
            transitionDuration: 2000, // 2 seconds for quality transitions
            stabilizationTime: 5000, // 5 seconds to stabilize before next adjustment
            
            // Quality validation
            validation: {
                enabled: true,
                validationPeriod: 3000, // 3 seconds to validate new quality
                rollbackThreshold: 0.8, // If performance drops below 80% of expected
                maxRollbacks: 3, // Maximum rollbacks before disabling auto-adjustment
                rollbackCooldown: 30000 // 30 seconds before retrying failed quality level
            },
            
            // User preference preservation
            userPreferences: {
                preserveManualSettings: true,
                requireUserConfirmation: false,
                notifyQualityChanges: true,
                allowUserOverride: true
            }
        };
        
        // Quality levels definition
        this.qualityLevels = {
            'ultra': {
                index: 4,
                label: 'Ultra High',
                description: 'Maximum quality settings',
                targetFPS: 60,
                minFPS: 55,
                settings: {
                    renderScale: 1.2,
                    particleDensity: 1.5,
                    shadowQuality: 'high',
                    effectsQuality: 'ultra',
                    antialiasing: 'msaa-4x',
                    textureQuality: 'ultra',
                    postProcessing: true,
                    bloomEnabled: true,
                    distortionEnabled: true,
                    reflectionQuality: 'high'
                }
            },
            'high': {
                index: 3,
                label: 'High',
                description: 'High quality settings',
                targetFPS: 60,
                minFPS: 50,
                settings: {
                    renderScale: 1.0,
                    particleDensity: 1.0,
                    shadowQuality: 'medium',
                    effectsQuality: 'high',
                    antialiasing: 'msaa-2x',
                    textureQuality: 'high',
                    postProcessing: true,
                    bloomEnabled: true,
                    distortionEnabled: false,
                    reflectionQuality: 'medium'
                }
            },
            'medium': {
                index: 2,
                label: 'Medium',
                description: 'Balanced quality and performance',
                targetFPS: 60,
                minFPS: 45,
                settings: {
                    renderScale: 0.9,
                    particleDensity: 0.8,
                    shadowQuality: 'low',
                    effectsQuality: 'medium',
                    antialiasing: 'fxaa',
                    textureQuality: 'medium',
                    postProcessing: true,
                    bloomEnabled: false,
                    distortionEnabled: false,
                    reflectionQuality: 'low'
                }
            },
            'low': {
                index: 1,
                label: 'Low',
                description: 'Performance-focused settings',
                targetFPS: 50,
                minFPS: 35,
                settings: {
                    renderScale: 0.8,
                    particleDensity: 0.5,
                    shadowQuality: 'disabled',
                    effectsQuality: 'low',
                    antialiasing: 'none',
                    textureQuality: 'low',
                    postProcessing: false,
                    bloomEnabled: false,
                    distortionEnabled: false,
                    reflectionQuality: 'disabled'
                }
            },
            'minimal': {
                index: 0,
                label: 'Minimal',
                description: 'Minimum quality for maximum performance',
                targetFPS: 30,
                minFPS: 25,
                settings: {
                    renderScale: 0.7,
                    particleDensity: 0.3,
                    shadowQuality: 'disabled',
                    effectsQuality: 'minimal',
                    antialiasing: 'none',
                    textureQuality: 'minimal',
                    postProcessing: false,
                    bloomEnabled: false,
                    distortionEnabled: false,
                    reflectionQuality: 'disabled'
                }
            }
        };
        
        // Current quality state
        this.qualityState = {
            currentLevel: 'high',
            targetLevel: 'high',
            previousLevel: 'high',
            isTransitioning: false,
            transitionStartTime: 0,
            transitionProgress: 1.0,
            
            // Performance tracking
            performanceHistory: [],
            lastAdjustmentTime: 0,
            adjustmentCount: 0,
            stabilizationStartTime: 0,
            isStabilizing: false,
            
            // Validation state
            validationInProgress: false,
            validationStartTime: 0,
            validationBaseline: null,
            rollbackCount: 0,
            lastRollbackTime: 0,
            
            // User override tracking
            userOverrideActive: false,
            userLastSettings: null,
            manualAdjustmentTime: 0
        };
        
        // Performance monitoring
        this.performanceMonitoring = {
            enabled: true,
            sampleInterval: 500, // 500ms
            historySize: 60, // 30 seconds of history
            metrics: {
                fps: { current: 60, average: 60, target: 60 },
                frameTime: { current: 16.67, average: 16.67, target: 16.67 },
                stability: { current: 1.0, average: 1.0, target: 0.8 },
                memory: { current: 0.5, pressure: 0.5, target: 0.7 }
            },
            thresholds: {
                performanceDrop: 0.85, // 85% of target performance
                performanceGain: 1.05, // 105% of target performance
                stabilityThreshold: 0.7, // 70% stability minimum
                criticalPerformance: 0.6 // 60% of target = critical
            }
        };
        
        // Quality adjustment algorithms
        this.adjustmentAlgorithms = {
            // Decision algorithm weights
            decisionWeights: {
                fpsWeight: 0.4,
                stabilityWeight: 0.3,
                memoryWeight: 0.2,
                trendWeight: 0.1
            },
            
            // Adjustment curves
            adjustmentCurves: {
                conservative: {
                    upwardSpeed: 0.5,
                    downwardSpeed: 1.5,
                    hysteresis: 0.15
                },
                balanced: {
                    upwardSpeed: 1.0,
                    downwardSpeed: 2.0,
                    hysteresis: 0.1
                },
                aggressive: {
                    upwardSpeed: 1.5,
                    downwardSpeed: 3.0,
                    hysteresis: 0.05
                }
            },
            
            // Smoothing parameters
            smoothing: {
                enabled: true,
                transitionType: 'smooth', // 'smooth', 'linear', 'stepped'
                interpolationSteps: 10,
                easingFunction: 'ease-in-out'
            }
        };
        
        // Visual consistency preservation
        this.visualConsistency = {
            enabled: true,
            preserveAspectRatio: true,
            maintainUIScale: true,
            gradualTransitions: true,
            
            // Critical settings that should change last
            criticalSettings: ['renderScale', 'antialiasing'],
            
            // Settings that can change quickly
            dynamicSettings: ['particleDensity', 'effectsQuality', 'postProcessing'],
            
            // Visual impact weights
            visualImpactWeights: {
                renderScale: 0.3,
                antialiasing: 0.25,
                textureQuality: 0.2,
                effectsQuality: 0.15,
                particleDensity: 0.1
            }
        };
        
        // Statistics and analytics
        this.stats = {
            totalAdjustments: 0,
            automaticAdjustments: 0,
            userOverrides: 0,
            rollbacks: 0,
            qualityLevelDistribution: new Map(),
            averageQualityTime: new Map(),
            performanceGains: 0,
            userSatisfactionMetrics: {
                manualChanges: 0,
                quickReverts: 0,
                settingsAccepted: 0
            }
        };
        
        this.initializeQualityController();
        
        console.log('[AdaptiveQualityController] Intelligent quality control system initialized');
    }
    
    /**
     * Initialize the quality controller
     */
    initializeQualityController() {
        // Load user preferences
        this.loadUserPreferences();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Initialize quality state
        this.initializeQualityState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load quality statistics
        this.loadQualityStatistics();
    }
    
    /**
     * Load user preferences from storage
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('adaptiveQuality_userPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.qualityConfig.userPreferences, preferences);
                
                // Apply user's last quality level if available
                if (preferences.lastQualityLevel && !this.qualityConfig.userOverride) {
                    this.qualityState.currentLevel = preferences.lastQualityLevel;
                    this.qualityState.targetLevel = preferences.lastQualityLevel;
                }
            }
            
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to load user preferences:', error);
        }
    }
    
    /**
     * Save user preferences to storage
     */
    saveUserPreferences() {
        try {
            const preferences = {
                ...this.qualityConfig.userPreferences,
                lastQualityLevel: this.qualityState.currentLevel,
                autoAdjustmentEnabled: this.qualityConfig.autoAdjustment,
                lastSaved: Date.now()
            };
            
            localStorage.setItem('adaptiveQuality_userPreferences', JSON.stringify(preferences));
            
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to save user preferences:', error);
        }
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (!this.performanceMonitoring.enabled) return;
        
        this.monitoringInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.evaluateQualityAdjustment();
        }, this.performanceMonitoring.sampleInterval);
        
        console.log('[AdaptiveQualityController] Performance monitoring started');
    }
    
    /**
     * Update performance metrics from various sources
     */
    updatePerformanceMetrics() {
        try {
            const metrics = this.gatherPerformanceMetrics();
            
            // Update current metrics
            Object.assign(this.performanceMonitoring.metrics, metrics);
            
            // Add to history
            this.performanceMonitoring.metrics.timestamp = Date.now();
            this.qualityState.performanceHistory.push({
                ...this.performanceMonitoring.metrics,
                qualityLevel: this.qualityState.currentLevel
            });
            
            // Keep history size manageable
            const maxSize = this.performanceMonitoring.historySize;
            if (this.qualityState.performanceHistory.length > maxSize) {
                this.qualityState.performanceHistory.shift();
            }
            
            // Update averages
            this.updatePerformanceAverages();
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'AdaptiveQualityController.updatePerformanceMetrics'
            });
        }
    }
    
    /**
     * Gather performance metrics from available sources
     * @returns {object} Performance metrics
     */
    gatherPerformanceMetrics() {
        const metrics = {
            fps: { current: 60, average: 60, target: 60 },
            frameTime: { current: 16.67, average: 16.67, target: 16.67 },
            stability: { current: 1.0, average: 1.0, target: 0.8 },
            memory: { current: 0.5, pressure: 0.5, target: 0.7 }
        };
        
        try {
            // Get metrics from PerformanceOptimizer
            if (window.getPerformanceOptimizer) {
                const optimizer = window.getPerformanceOptimizer();
                if (optimizer?.getStats) {
                    const stats = optimizer.getStats();
                    metrics.fps.current = stats.currentFPS || stats.averageFPS || 60;
                    metrics.fps.average = stats.averageFPS || 60;
                    metrics.frameTime.current = stats.frameTime || 16.67;
                    metrics.stability.current = stats.stabilityScore || 1.0;
                }
            }
            
            // Get metrics from FrameStabilizer
            if (window.getFrameStabilizer) {
                const stabilizer = window.getFrameStabilizer();
                if (stabilizer?.getStabilizationStatus) {
                    const status = stabilizer.getStabilizationStatus();
                    metrics.stability.current = status.timing?.stabilityScore || 1.0;
                    metrics.fps.target = status.adaptive?.currentTargetFPS || 60;
                }
            }
            
            // Get memory metrics
            if (performance.memory) {
                const memInfo = performance.memory;
                metrics.memory.current = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
                metrics.memory.pressure = metrics.memory.current;
            }
            
            // Get memory manager metrics
            if (window.getMemoryManager) {
                const memManager = window.getMemoryManager();
                if (memManager?.getStats) {
                    const memStats = memManager.getStats();
                    metrics.memory.pressure = 1 - (memStats.memoryHealthScore || 1.0);
                }
            }
            
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to gather comprehensive metrics');
        }
        
        return metrics;
    }
    
    /**
     * Update performance averages
     */
    updatePerformanceAverages() {
        const history = this.qualityState.performanceHistory.slice(-10); // Last 10 samples
        if (history.length === 0) return;
        
        const metrics = this.performanceMonitoring.metrics;
        
        // Calculate averages
        metrics.fps.average = history.reduce((sum, h) => sum + h.fps.current, 0) / history.length;
        metrics.frameTime.average = history.reduce((sum, h) => sum + h.frameTime.current, 0) / history.length;
        metrics.stability.average = history.reduce((sum, h) => sum + h.stability.current, 0) / history.length;
        metrics.memory.average = history.reduce((sum, h) => sum + h.memory.current, 0) / history.length;
    }
    
    /**
     * Evaluate whether quality adjustment is needed
     */
    evaluateQualityAdjustment() {
        if (!this.qualityConfig.autoAdjustment || this.qualityState.userOverrideActive) {
            return;
        }
        
        const now = Date.now();
        
        // Check if still in transition or stabilization
        if (this.qualityState.isTransitioning || this.qualityState.isStabilizing) {
            this.updateTransitionState();
            return;
        }
        
        // Check if enough time has passed since last adjustment
        const timeSinceAdjustment = now - this.qualityState.lastAdjustmentTime;
        if (timeSinceAdjustment < this.qualityConfig.stabilizationTime) {
            return;
        }
        
        // Check if validation is in progress
        if (this.qualityState.validationInProgress) {
            this.checkValidationStatus();
            return;
        }
        
        // Perform quality decision analysis
        const decision = this.analyzeQualityDecision();
        
        if (decision.shouldAdjust) {
            this.initiateQualityAdjustment(decision.recommendedLevel, decision.reason);
        }
    }
    
    /**
     * Analyze whether quality should be adjusted
     * @returns {object} Quality decision analysis
     */
    analyzeQualityDecision() {
        const metrics = this.performanceMonitoring.metrics;
        const thresholds = this.performanceMonitoring.thresholds;
        const currentLevel = this.qualityLevels[this.qualityState.currentLevel];
        const weights = this.adjustmentAlgorithms.decisionWeights;
        
        // Calculate performance score (0-1, higher is better)
        const fpsScore = Math.min(1, metrics.fps.current / currentLevel.targetFPS);
        const stabilityScore = metrics.stability.current;
        const memoryScore = Math.max(0, 1 - metrics.memory.pressure);
        
        // Calculate trend score from recent history
        const trendScore = this.calculatePerformanceTrend();
        
        // Weighted overall score
        const overallScore = (
            fpsScore * weights.fpsWeight +
            stabilityScore * weights.stabilityWeight +
            memoryScore * weights.memoryWeight +
            trendScore * weights.trendWeight
        );
        
        const decision = {
            shouldAdjust: false,
            recommendedLevel: this.qualityState.currentLevel,
            reason: 'stable',
            scores: { fpsScore, stabilityScore, memoryScore, trendScore, overallScore }
        };
        
        // Determine if adjustment is needed
        if (overallScore < thresholds.performanceDrop) {
            // Performance is poor, consider reducing quality
            const lowerLevel = this.getNextQualityLevel(this.qualityState.currentLevel, 'down');
            if (lowerLevel) {
                decision.shouldAdjust = true;
                decision.recommendedLevel = lowerLevel;
                decision.reason = 'performance_drop';
            }
        } else if (overallScore > thresholds.performanceGain) {
            // Performance is good, consider increasing quality
            const higherLevel = this.getNextQualityLevel(this.qualityState.currentLevel, 'up');
            if (higherLevel) {
                decision.shouldAdjust = true;
                decision.recommendedLevel = higherLevel;
                decision.reason = 'performance_gain';
            }
        }
        
        // Apply hysteresis to prevent oscillation
        const curve = this.adjustmentAlgorithms.adjustmentCurves[this.qualityConfig.adjustmentSensitivity];
        const hysteresis = curve.hysteresis;
        
        if (decision.shouldAdjust) {
            if (decision.reason === 'performance_drop' && overallScore > (thresholds.performanceDrop + hysteresis)) {
                decision.shouldAdjust = false;
            } else if (decision.reason === 'performance_gain' && overallScore < (thresholds.performanceGain - hysteresis)) {
                decision.shouldAdjust = false;
            }
        }
        
        return decision;
    }
    
    /**
     * Calculate performance trend from recent history
     * @returns {number} Trend score (0-1)
     */
    calculatePerformanceTrend() {
        const history = this.qualityState.performanceHistory.slice(-5); // Last 5 samples
        if (history.length < 3) return 0.5; // Neutral if not enough data
        
        // Calculate linear trend for FPS
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        history.forEach((sample, index) => {
            const x = index;
            const y = sample.fps.current;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });
        
        const n = history.length;
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        // Convert slope to trend score
        // Positive slope = improving trend (score > 0.5)
        // Negative slope = declining trend (score < 0.5)
        const normalizedSlope = Math.max(-2, Math.min(2, slope / 5)); // Normalize slope
        return 0.5 + (normalizedSlope * 0.25); // Map to 0-1 range
    }
    
    /**
     * Get next quality level in specified direction
     * @param {string} currentLevel - Current quality level
     * @param {string} direction - 'up' or 'down'
     * @returns {string|null} Next quality level or null
     */
    getNextQualityLevel(currentLevel, direction) {
        const levelNames = Object.keys(this.qualityLevels);
        const currentIndex = this.qualityLevels[currentLevel].index;
        
        if (direction === 'up') {
            const nextLevel = levelNames.find(name => this.qualityLevels[name].index === currentIndex + 1);
            return nextLevel || null;
        } else {
            const nextLevel = levelNames.find(name => this.qualityLevels[name].index === currentIndex - 1);
            return nextLevel || null;
        }
    }
    
    /**
     * Initiate quality adjustment to target level
     * @param {string} targetLevel - Target quality level
     * @param {string} reason - Reason for adjustment
     */
    initiateQualityAdjustment(targetLevel, reason) {
        console.log(`[AdaptiveQualityController] Initiating quality adjustment: ${this.qualityState.currentLevel} → ${targetLevel} (${reason})`);
        
        // Record adjustment attempt
        this.stats.totalAdjustments++;
        this.stats.automaticAdjustments++;
        
        // Update state
        this.qualityState.previousLevel = this.qualityState.currentLevel;
        this.qualityState.targetLevel = targetLevel;
        this.qualityState.isTransitioning = true;
        this.qualityState.transitionStartTime = Date.now();
        this.qualityState.transitionProgress = 0;
        this.qualityState.lastAdjustmentTime = Date.now();
        this.qualityState.adjustmentCount++;
        
        // Start transition
        this.startQualityTransition(reason);
    }
    
    /**
     * Start quality transition with smooth interpolation
     * @param {string} reason - Reason for transition
     */
    startQualityTransition(reason) {
        const startLevel = this.qualityLevels[this.qualityState.previousLevel];
        const targetLevel = this.qualityLevels[this.qualityState.targetLevel];
        const duration = this.qualityConfig.transitionDuration;
        
        // Create transition plan
        const transitionPlan = this.createTransitionPlan(startLevel, targetLevel);
        
        // Execute transition
        this.executeTransition(transitionPlan, duration, reason);
    }
    
    /**
     * Create transition plan for smooth quality changes
     * @param {object} startLevel - Starting quality level
     * @param {object} targetLevel - Target quality level
     * @returns {object} Transition plan
     */
    createTransitionPlan(startLevel, targetLevel) {
        const plan = {
            phases: [],
            totalSteps: this.adjustmentAlgorithms.smoothing.interpolationSteps,
            preserveVisualConsistency: this.visualConsistency.enabled
        };
        
        // Determine which settings to change and in what order
        const settingsToChange = this.identifySettingsChanges(startLevel.settings, targetLevel.settings);
        
        if (this.visualConsistency.enabled) {
            // Change dynamic settings first, critical settings last
            const dynamicChanges = settingsToChange.filter(change => 
                this.visualConsistency.dynamicSettings.includes(change.setting));
            const criticalChanges = settingsToChange.filter(change => 
                this.visualConsistency.criticalSettings.includes(change.setting));
            const otherChanges = settingsToChange.filter(change => 
                !this.visualConsistency.dynamicSettings.includes(change.setting) &&
                !this.visualConsistency.criticalSettings.includes(change.setting));
            
            plan.phases = [
                { type: 'dynamic', changes: dynamicChanges, weight: 0.3 },
                { type: 'other', changes: otherChanges, weight: 0.4 },
                { type: 'critical', changes: criticalChanges, weight: 0.3 }
            ];
        } else {
            // Change all settings uniformly
            plan.phases = [
                { type: 'uniform', changes: settingsToChange, weight: 1.0 }
            ];
        }
        
        return plan;
    }
    
    /**
     * Identify settings changes needed for transition
     * @param {object} startSettings - Starting settings
     * @param {object} targetSettings - Target settings
     * @returns {Array} Array of setting changes
     */
    identifySettingsChanges(startSettings, targetSettings) {
        const changes = [];
        
        Object.keys(targetSettings).forEach(setting => {
            const startValue = startSettings[setting];
            const targetValue = targetSettings[setting];
            
            if (startValue !== targetValue) {
                changes.push({
                    setting,
                    startValue,
                    targetValue,
                    valueType: typeof targetValue,
                    visualImpact: this.visualConsistency.visualImpactWeights[setting] || 0.1
                });
            }
        });
        
        // Sort by visual impact (higher impact changes later)
        return changes.sort((a, b) => a.visualImpact - b.visualImpact);
    }
    
    /**
     * Execute quality transition
     * @param {object} transitionPlan - Transition plan
     * @param {number} duration - Transition duration in ms
     * @param {string} reason - Reason for transition
     */
    executeTransition(transitionPlan, duration, reason) {
        const startTime = Date.now();
        const totalSteps = transitionPlan.totalSteps;
        let currentStep = 0;
        
        const executeStep = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // Update transition progress
            this.qualityState.transitionProgress = progress;
            
            // Apply easing function
            const easedProgress = this.applyEasingFunction(progress);
            
            // Apply quality changes for current step
            this.applyTransitionStep(transitionPlan, easedProgress);
            
            // Continue transition or complete
            if (progress < 1) {
                requestAnimationFrame(executeStep);
            } else {
                this.completeQualityTransition(reason);
            }
        };
        
        executeStep();
    }
    
    /**
     * Apply easing function to transition progress
     * @param {number} progress - Linear progress (0-1)
     * @returns {number} Eased progress (0-1)
     */
    applyEasingFunction(progress) {
        const easingType = this.adjustmentAlgorithms.smoothing.easingFunction;
        
        switch (easingType) {
            case 'ease-in-out':
                return progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            case 'ease-in':
                return progress * progress;
            case 'ease-out':
                return 1 - Math.pow(1 - progress, 2);
            default:
                return progress; // linear
        }
    }
    
    /**
     * Apply transition step with interpolated values
     * @param {object} transitionPlan - Transition plan
     * @param {number} progress - Transition progress (0-1)
     */
    applyTransitionStep(transitionPlan, progress) {
        try {
            const interpolatedSettings = {};
            
            // Process each phase based on progress
            transitionPlan.phases.forEach((phase, phaseIndex) => {
                const phaseProgress = this.calculatePhaseProgress(progress, phaseIndex, transitionPlan.phases.length);
                
                phase.changes.forEach(change => {
                    const interpolatedValue = this.interpolateValue(
                        change.startValue, 
                        change.targetValue, 
                        phaseProgress, 
                        change.valueType
                    );
                    interpolatedSettings[change.setting] = interpolatedValue;
                });
            });
            
            // Apply settings to configuration
            this.applyQualitySettings(interpolatedSettings);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'AdaptiveQualityController.applyTransitionStep'
            });
        }
    }
    
    /**
     * Calculate phase-specific progress
     * @param {number} totalProgress - Overall transition progress
     * @param {number} phaseIndex - Current phase index
     * @param {number} totalPhases - Total number of phases
     * @returns {number} Phase progress (0-1)
     */
    calculatePhaseProgress(totalProgress, phaseIndex, totalPhases) {
        const phaseStart = phaseIndex / totalPhases;
        const phaseEnd = (phaseIndex + 1) / totalPhases;
        
        if (totalProgress < phaseStart) return 0;
        if (totalProgress > phaseEnd) return 1;
        
        return (totalProgress - phaseStart) / (phaseEnd - phaseStart);
    }
    
    /**
     * Interpolate between two values
     * @param {*} startValue - Starting value
     * @param {*} targetValue - Target value
     * @param {number} progress - Interpolation progress (0-1)
     * @param {string} valueType - Type of value
     * @returns {*} Interpolated value
     */
    interpolateValue(startValue, targetValue, progress, valueType) {
        switch (valueType) {
            case 'number':
                return startValue + (targetValue - startValue) * progress;
            case 'boolean':
                return progress < 0.5 ? startValue : targetValue;
            case 'string':
                // For string values like quality settings, use stepped interpolation
                if (progress < 0.5) return startValue;
                return targetValue;
            default:
                return progress < 0.5 ? startValue : targetValue;
        }
    }
    
    /**
     * Apply quality settings to the system
     * @param {object} settings - Quality settings to apply
     */
    applyQualitySettings(settings) {
        try {
            // Apply settings through configuration manager
            Object.entries(settings).forEach(([setting, value]) => {
                const configPath = this.getConfigurationPath(setting);
                if (configPath) {
                    this.configManager.set(configPath, value);
                }
            });
            
            // Notify other systems of quality changes
            this.notifyQualityChange(settings);
            
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to apply quality settings:', error);
        }
    }
    
    /**
     * Get configuration path for quality setting
     * @param {string} setting - Quality setting name
     * @returns {string|null} Configuration path
     */
    getConfigurationPath(setting) {
        const settingMap = {
            'renderScale': 'graphics.rendering.scale',
            'particleDensity': 'graphics.particles.density',
            'shadowQuality': 'graphics.shadows.quality',
            'effectsQuality': 'graphics.effects.quality',
            'antialiasing': 'graphics.antialiasing.type',
            'textureQuality': 'graphics.textures.quality',
            'postProcessing': 'graphics.postProcessing.enabled',
            'bloomEnabled': 'graphics.effects.bloom.enabled',
            'distortionEnabled': 'graphics.effects.distortion.enabled',
            'reflectionQuality': 'graphics.reflections.quality'
        };
        
        return settingMap[setting] || null;
    }
    
    /**
     * Notify other systems of quality changes
     * @param {object} settings - Applied settings
     */
    notifyQualityChange(settings) {
        // Dispatch custom event for quality changes
        const event = new CustomEvent('qualityChanged', {
            detail: {
                settings,
                level: this.qualityState.targetLevel,
                isTransitioning: this.qualityState.isTransitioning
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Complete quality transition
     * @param {string} reason - Reason for transition
     */
    completeQualityTransition(reason) {
        console.log(`[AdaptiveQualityController] Quality transition completed: ${this.qualityState.targetLevel} (${reason})`);
        
        // Update state
        this.qualityState.currentLevel = this.qualityState.targetLevel;
        this.qualityState.isTransitioning = false;
        this.qualityState.transitionProgress = 1.0;
        
        // Start validation if enabled
        if (this.qualityConfig.validation.enabled) {
            this.startQualityValidation();
        } else {
            // Skip to stabilization
            this.startStabilizationPeriod();
        }
        
        // Update statistics
        this.updateQualityStatistics();
        
        // Save user preferences
        this.saveUserPreferences();
        
        // Notify quality change completion
        this.notifyQualityChangeComplete();
    }
    
    /**
     * Start quality validation period
     */
    startQualityValidation() {
        console.log('[AdaptiveQualityController] Starting quality validation period');
        
        // Store baseline performance for comparison
        const metrics = this.performanceMonitoring.metrics;
        this.qualityState.validationBaseline = {
            expectedFPS: this.qualityLevels[this.qualityState.currentLevel].targetFPS,
            expectedStability: 0.8,
            startTime: Date.now(),
            initialFPS: metrics.fps.current,
            initialStability: metrics.stability.current
        };
        
        this.qualityState.validationInProgress = true;
        this.qualityState.validationStartTime = Date.now();
    }
    
    /**
     * Check validation status and determine if rollback is needed
     */
    checkValidationStatus() {
        const now = Date.now();
        const elapsed = now - this.qualityState.validationStartTime;
        const validationPeriod = this.qualityConfig.validation.validationPeriod;
        
        if (elapsed >= validationPeriod) {
            // Validation period complete
            const validationResult = this.evaluateValidationResult();
            
            if (validationResult.success) {
                console.log('[AdaptiveQualityController] Quality validation successful');
                this.qualityState.validationInProgress = false;
                this.startStabilizationPeriod();
            } else {
                console.log('[AdaptiveQualityController] Quality validation failed, initiating rollback');
                this.initiateQualityRollback(validationResult.reason);
            }
        }
    }
    
    /**
     * Evaluate validation result
     * @returns {object} Validation result
     */
    evaluateValidationResult() {
        const baseline = this.qualityState.validationBaseline;
        const metrics = this.performanceMonitoring.metrics;
        const threshold = this.qualityConfig.validation.rollbackThreshold;
        
        // Check if performance meets expectations
        const fpsRatio = metrics.fps.current / baseline.expectedFPS;
        const stabilityRatio = metrics.stability.current / baseline.expectedStability;
        
        const result = {
            success: true,
            reason: '',
            fpsRatio,
            stabilityRatio,
            threshold
        };
        
        if (fpsRatio < threshold) {
            result.success = false;
            result.reason = 'fps_below_threshold';
        } else if (stabilityRatio < threshold) {
            result.success = false;
            result.reason = 'stability_below_threshold';
        }
        
        return result;
    }
    
    /**
     * Initiate quality rollback
     * @param {string} reason - Reason for rollback
     */
    initiateQualityRollback(reason) {
        console.warn(`[AdaptiveQualityController] Rolling back quality change: ${reason}`);
        
        // Update rollback statistics
        this.stats.rollbacks++;
        this.qualityState.rollbackCount++;
        this.qualityState.lastRollbackTime = Date.now();
        
        // Check if we've exceeded max rollbacks
        if (this.qualityState.rollbackCount >= this.qualityConfig.validation.maxRollbacks) {
            console.warn('[AdaptiveQualityController] Maximum rollbacks reached, disabling auto-adjustment');
            this.qualityConfig.autoAdjustment = false;
            this.notifyAutoAdjustmentDisabled();
        }
        
        // Rollback to previous level
        const rollbackLevel = this.qualityState.previousLevel;
        this.qualityState.targetLevel = rollbackLevel;
        this.qualityState.validationInProgress = false;
        
        // Execute immediate rollback (no transition)
        this.applyQualitySettings(this.qualityLevels[rollbackLevel].settings);
        this.qualityState.currentLevel = rollbackLevel;
        
        // Set cooldown period
        this.setCooldownPeriod(this.qualityConfig.validation.rollbackCooldown);
        
        console.log(`[AdaptiveQualityController] Rollback completed to ${rollbackLevel}`);
    }
    
    /**
     * Set cooldown period to prevent immediate retries
     * @param {number} duration - Cooldown duration in ms
     */
    setCooldownPeriod(duration) {
        this.qualityState.lastAdjustmentTime = Date.now() + duration;
        console.log(`[AdaptiveQualityController] Quality adjustment cooldown set for ${duration}ms`);
    }
    
    /**
     * Start stabilization period
     */
    startStabilizationPeriod() {
        this.qualityState.isStabilizing = true;
        this.qualityState.stabilizationStartTime = Date.now();
        
        console.log(`[AdaptiveQualityController] Starting stabilization period for ${this.qualityConfig.stabilizationTime}ms`);
    }
    
    /**
     * Update transition state
     */
    updateTransitionState() {
        const now = Date.now();
        
        if (this.qualityState.isStabilizing) {
            const elapsed = now - this.qualityState.stabilizationStartTime;
            if (elapsed >= this.qualityConfig.stabilizationTime) {
                this.qualityState.isStabilizing = false;
                console.log('[AdaptiveQualityController] Stabilization period completed');
            }
        }
    }
    
    /**
     * Initialize quality state
     */
    initializeQualityState() {
        // Set initial quality level based on system capabilities
        const detectedLevel = this.detectOptimalQualityLevel();
        this.qualityState.currentLevel = detectedLevel;
        this.qualityState.targetLevel = detectedLevel;
        
        // Apply initial settings
        this.applyQualitySettings(this.qualityLevels[detectedLevel].settings);
        
        console.log(`[AdaptiveQualityController] Initial quality level set to: ${detectedLevel}`);
    }
    
    /**
     * Detect optimal quality level for current system
     * @returns {string} Recommended quality level
     */
    detectOptimalQualityLevel() {
        // This is a simplified detection - in practice, you'd run performance tests
        try {
            // Check device capabilities
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return 'low'; // No WebGL support
            
            // Check memory
            const memory = performance.memory;
            const memoryGB = memory ? memory.jsHeapSizeLimit / (1024 * 1024 * 1024) : 1;
            
            // Check CPU cores (rough estimate)
            const cores = navigator.hardwareConcurrency || 2;
            
            // Simple heuristic for quality level
            if (memoryGB >= 4 && cores >= 8) return 'high';
            if (memoryGB >= 2 && cores >= 4) return 'medium';
            return 'low';
            
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to detect system capabilities, using medium quality');
            return 'medium';
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for manual quality changes
        document.addEventListener('manualQualityChange', (event) => {
            this.handleManualQualityChange(event.detail);
        });
        
        // Listen for user preferences changes
        document.addEventListener('qualityPreferencesChanged', (event) => {
            this.handlePreferencesChange(event.detail);
        });
        
        // Listen for performance warning system integration
        document.addEventListener('performanceWarning', (event) => {
            this.handlePerformanceWarning(event.detail);
        });
    }
    
    /**
     * Handle manual quality changes from user
     * @param {object} details - Change details
     */
    handleManualQualityChange(details) {
        console.log('[AdaptiveQualityController] Manual quality change detected:', details);
        
        this.stats.userOverrides++;
        this.qualityState.userOverrideActive = true;
        this.qualityState.manualAdjustmentTime = Date.now();
        
        // Respect user's choice
        if (this.qualityConfig.userPreferences.preserveManualSettings) {
            this.qualityConfig.autoAdjustment = false;
            this.qualityState.userLastSettings = details.settings;
        }
        
        // Update statistics
        this.stats.userSatisfactionMetrics.manualChanges++;
    }
    
    /**
     * Handle performance warnings
     * @param {object} warning - Warning details
     */
    handlePerformanceWarning(warning) {
        if (warning.type === 'critical' && this.qualityConfig.autoAdjustment) {
            // Immediate quality reduction for critical warnings
            const lowerLevel = this.getNextQualityLevel(this.qualityState.currentLevel, 'down');
            if (lowerLevel) {
                console.log('[AdaptiveQualityController] Critical performance warning, reducing quality immediately');
                this.initiateQualityAdjustment(lowerLevel, 'critical_warning');
            }
        }
    }
    
    /**
     * Update quality statistics
     */
    updateQualityStatistics() {
        const level = this.qualityState.currentLevel;
        
        // Update level distribution
        const currentCount = this.stats.qualityLevelDistribution.get(level) || 0;
        this.stats.qualityLevelDistribution.set(level, currentCount + 1);
        
        // Update average time in level
        const now = Date.now();
        const timeInLevel = now - this.qualityState.lastAdjustmentTime;
        const avgTime = this.stats.averageQualityTime.get(level) || 0;
        const count = this.stats.qualityLevelDistribution.get(level);
        this.stats.averageQualityTime.set(level, (avgTime * (count - 1) + timeInLevel) / count);
    }
    
    /**
     * Load quality statistics from storage
     */
    loadQualityStatistics() {
        try {
            const saved = localStorage.getItem('adaptiveQuality_statistics');
            if (saved) {
                const stats = JSON.parse(saved);
                Object.assign(this.stats, stats);
                
                // Restore Maps
                if (stats.qualityLevelDistribution) {
                    this.stats.qualityLevelDistribution = new Map(stats.qualityLevelDistribution);
                }
                if (stats.averageQualityTime) {
                    this.stats.averageQualityTime = new Map(stats.averageQualityTime);
                }
            }
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to load statistics:', error);
        }
    }
    
    /**
     * Save quality statistics to storage
     */
    saveQualityStatistics() {
        try {
            const stats = {
                ...this.stats,
                qualityLevelDistribution: Array.from(this.stats.qualityLevelDistribution.entries()),
                averageQualityTime: Array.from(this.stats.averageQualityTime.entries()),
                lastSaved: Date.now()
            };
            
            localStorage.setItem('adaptiveQuality_statistics', JSON.stringify(stats));
        } catch (error) {
            console.warn('[AdaptiveQualityController] Failed to save statistics:', error);
        }
    }
    
    /**
     * Notify quality change completion
     */
    notifyQualityChangeComplete() {
        const event = new CustomEvent('qualityChangeComplete', {
            detail: {
                level: this.qualityState.currentLevel,
                previousLevel: this.qualityState.previousLevel,
                automatic: true,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        
        // Show notification if enabled
        if (this.qualityConfig.userPreferences.notifyQualityChanges) {
            this.showQualityChangeNotification();
        }
    }
    
    /**
     * Show quality change notification to user
     */
    showQualityChangeNotification() {
        const level = this.qualityLevels[this.qualityState.currentLevel];
        console.log(`[AdaptiveQualityController] Quality automatically adjusted to: ${level.label}`);
        
        // This could integrate with the PerformanceWarningSystem
        if (window.getPerformanceWarningSystem) {
            const warningSystem = window.getPerformanceWarningSystem();
            if (warningSystem.createNotification) {
                warningSystem.createNotification('quality_change', {
                    title: 'Quality Adjusted',
                    message: `Graphics quality changed to ${level.label}`,
                    type: 'info'
                });
            }
        }
    }
    
    /**
     * Notify auto-adjustment disabled
     */
    notifyAutoAdjustmentDisabled() {
        console.warn('[AdaptiveQualityController] Auto-adjustment disabled due to repeated failures');
        
        const event = new CustomEvent('autoAdjustmentDisabled', {
            detail: {
                reason: 'max_rollbacks_exceeded',
                rollbackCount: this.qualityState.rollbackCount,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Public API methods
    
    /**
     * Manually set quality level
     * @param {string} level - Quality level to set
     * @param {boolean} preserveAutoAdjustment - Whether to keep auto-adjustment enabled
     */
    setQualityLevel(level, preserveAutoAdjustment = false) {
        if (!this.qualityLevels[level]) {
            throw new Error(`Invalid quality level: ${level}`);
        }
        
        console.log(`[AdaptiveQualityController] Manual quality change to: ${level}`);
        
        this.qualityState.userOverrideActive = !preserveAutoAdjustment;
        this.qualityState.manualAdjustmentTime = Date.now();
        
        if (!preserveAutoAdjustment) {
            this.qualityConfig.autoAdjustment = false;
        }
        
        this.initiateQualityAdjustment(level, 'manual_override');
    }
    
    /**
     * Enable or disable auto-adjustment
     * @param {boolean} enabled - Whether to enable auto-adjustment
     */
    setAutoAdjustment(enabled) {
        this.qualityConfig.autoAdjustment = enabled;
        this.qualityState.userOverrideActive = !enabled;
        
        if (enabled) {
            // Reset rollback count
            this.qualityState.rollbackCount = 0;
            console.log('[AdaptiveQualityController] Auto-adjustment enabled');
        } else {
            console.log('[AdaptiveQualityController] Auto-adjustment disabled');
        }
        
        this.saveUserPreferences();
    }
    
    /**
     * Get current quality status
     * @returns {object} Quality status
     */
    getQualityStatus() {
        return {
            currentLevel: this.qualityState.currentLevel,
            targetLevel: this.qualityState.targetLevel,
            isTransitioning: this.qualityState.isTransitioning,
            transitionProgress: this.qualityState.transitionProgress,
            autoAdjustmentEnabled: this.qualityConfig.autoAdjustment,
            userOverrideActive: this.qualityState.userOverrideActive,
            validationInProgress: this.qualityState.validationInProgress,
            availableLevels: Object.keys(this.qualityLevels),
            performanceMetrics: this.performanceMonitoring.metrics,
            statistics: this.getStatisticsSummary()
        };
    }
    
    /**
     * Get statistics summary
     * @returns {object} Statistics summary
     */
    getStatisticsSummary() {
        return {
            totalAdjustments: this.stats.totalAdjustments,
            automaticAdjustments: this.stats.automaticAdjustments,
            userOverrides: this.stats.userOverrides,
            rollbacks: this.stats.rollbacks,
            currentLevelTime: Date.now() - this.qualityState.lastAdjustmentTime,
            levelDistribution: Object.fromEntries(this.stats.qualityLevelDistribution),
            averageTimePerLevel: Object.fromEntries(this.stats.averageQualityTime)
        };
    }
    
    /**
     * Configure quality system
     * @param {object} config - Configuration options
     */
    configure(config) {
        // Update configuration
        if (config.qualityConfig) {
            Object.assign(this.qualityConfig, config.qualityConfig);
        }
        
        if (config.performanceThresholds) {
            Object.assign(this.performanceMonitoring.thresholds, config.performanceThresholds);
        }
        
        if (config.adjustmentSensitivity) {
            this.qualityConfig.adjustmentSensitivity = config.adjustmentSensitivity;
        }
        
        this.saveUserPreferences();
        
        console.log('[AdaptiveQualityController] Configuration updated');
    }
    
    /**
     * Force immediate quality evaluation
     */
    forceEvaluation() {
        console.log('[AdaptiveQualityController] Forcing immediate quality evaluation');
        this.evaluateQualityAdjustment();
    }
    
    /**
     * Cleanup quality controller
     */
    destroy() {
        // Clear intervals
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Save statistics
        this.saveQualityStatistics();
        this.saveUserPreferences();
        
        // Clear data
        this.qualityState.performanceHistory = [];
        
        console.log('[AdaptiveQualityController] Quality controller destroyed');
    }
}

// グローバルインスタンス（遅延初期化）
let _adaptiveQualityController = null;

export function getAdaptiveQualityController() {
    if (!_adaptiveQualityController) {
        try {
            _adaptiveQualityController = new AdaptiveQualityController();
            console.log('[AdaptiveQualityController] グローバルインスタンスを作成しました');
        } catch (error) {
            console.error('[AdaptiveQualityController] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _adaptiveQualityController = new AdaptiveQualityController();
        }
    }
    return _adaptiveQualityController;
}

/**
 * AdaptiveQualityControllerインスタンスを再初期化
 */
export function reinitializeAdaptiveQualityController() {
    try {
        if (_adaptiveQualityController) {
            _adaptiveQualityController.destroy();
        }
        _adaptiveQualityController = new AdaptiveQualityController();
        console.log('[AdaptiveQualityController] 再初期化完了');
    } catch (error) {
        console.error('[AdaptiveQualityController] 再初期化エラー:', error);
    }
}

// 後方互換性のため
export const adaptiveQualityController = getAdaptiveQualityController;