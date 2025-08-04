/**
 * OnboardingProgressTracker - Progress tracking and personalization data collection
 * Monitors user engagement, tracks completion status, and collects personalization data
 */
export class OnboardingProgressTracker {
    constructor(config = {}) {
        this.config = {
            enableProgressTracking: true,
            enableEngagementMonitoring: true,
            enablePersonalizationCollection: true,
            trackingInterval: 30000, // 30 seconds
            enablePrivacyMode: true,
            dataRetentionDays: 90,
            enableAnalytics: true,
            autoSaveProgress: true,
            enableUserInsights: true,
            ...config
        };

        // Progress tracking state
        this.progressState = {
            sessionId: null,
            userId: null,
            onboardingStartTime: null,
            currentStep: 0,
            totalSteps: 0,
            completedSteps: new Set(),
            skippedSteps: new Set(),
            timeSpentPerStep: new Map(),
            stepStartTimes: new Map(),
            completionPercentage: 0,
            estimatedTimeRemaining: 0
        };

        // Engagement monitoring data
        this.engagementData = {
            totalInteractions: 0,
            keyboardInteractions: 0,
            mouseInteractions: 0,
            touchInteractions: 0,
            focusEvents: 0,
            scrollEvents: 0,
            idleTime: 0,
            activeTime: 0,
            lastActivityTime: null,
            sessionPauseCount: 0,
            avgInteractionInterval: 0,
            engagementScore: 0
        };

        // Personalization data collection
        this.personalizationData = {
            userPreferences: new Map(),
            accessibilityNeeds: new Map(),
            deviceCapabilities: new Map(),
            usagePatterns: new Map(),
            learningStyle: null,
            preferredPace: 'normal',
            completionBehavior: new Map(),
            helpSeeking: new Map(),
            errorPatterns: new Map(),
            successFactors: new Map()
        };

        // Completion status tracking
        this.completionStatus = {
            overallProgress: 0,
            stepStatuses: new Map(),
            milestones: new Map(),
            achievements: new Set(),
            certifications: new Set(),
            timeToCompletion: null,
            completionDate: null,
            isCompleted: false,
            partialCompletions: new Map()
        };

        // Privacy and data protection
        this.privacySettings = {
            anonymizeData: true,
            trackingConsent: false,
            dataEncryption: true,
            shareAnalytics: false,
            retainPersonalData: false
        };

        // Performance and analytics
        this.analytics = {
            sessionMetrics: new Map(),
            performanceMetrics: {
                trackingOverhead: [],
                dataProcessingTime: [],
                storageOperationTime: []
            },
            userJourney: [],
            heatmapData: new Map(),
            conversionFunnels: new Map(),
            dropoffPoints: new Map()
        };

        // Monitoring intervals and timers
        this.monitoringIntervals = new Map();
        this.trackingTimer = null;
        this.idleTimer = null;
        this.autosaveTimer = null;

        this.initialized = false;
    }

    /**
     * Initialize progress tracker
     */
    initialize(userId = null, sessionConfig = {}) {
        if (this.initialized) return true;

        console.log('OnboardingProgressTracker: Initializing...');

        try {
            // Setup session
            this.progressState.sessionId = this.generateSessionId();
            this.progressState.userId = userId;
            this.progressState.onboardingStartTime = Date.now();

            // Apply session configuration
            this.applySessionConfig(sessionConfig);

            // Setup privacy settings based on user consent
            this.setupPrivacySettings();

            // Initialize tracking systems
            if (this.config.enableProgressTracking) {
                this.initializeProgressTracking();
            }

            if (this.config.enableEngagementMonitoring) {
                this.initializeEngagementMonitoring();
            }

            if (this.config.enablePersonalizationCollection) {
                this.initializePersonalizationCollection();
            }

            // Start monitoring intervals
            this.startMonitoringIntervals();

            // Setup event listeners
            this.setupEventListeners();

            // Load existing progress if available
            this.loadExistingProgress();

            this.initialized = true;
            console.log('OnboardingProgressTracker: Initialized successfully');
            return true;

        } catch (error) {
            console.error('OnboardingProgressTracker: Initialization error:', error);
            return false;
        }
    }

    /**
     * Track progress through onboarding steps
     */
    async trackProgress(stepInfo) {
        if (!this.config.enableProgressTracking || !this.initialized) {
            return { success: false, error: 'Progress tracking not enabled or not initialized' };
        }

        const trackingStartTime = performance.now();

        try {
            const { stepIndex, stepId, stepType = 'unknown', totalSteps = 0 } = stepInfo;

            // Update basic progress state
            const previousStep = this.progressState.currentStep;
            this.progressState.currentStep = stepIndex;
            this.progressState.totalSteps = totalSteps;

            // Record step timing
            if (this.progressState.stepStartTimes.has(previousStep)) {
                const stepStartTime = this.progressState.stepStartTimes.get(previousStep);
                const stepDuration = Date.now() - stepStartTime;
                this.progressState.timeSpentPerStep.set(previousStep, stepDuration);
            }

            // Set start time for current step
            this.progressState.stepStartTimes.set(stepIndex, Date.now());

            // Update completion tracking
            if (stepIndex > previousStep && previousStep >= 0) {
                this.progressState.completedSteps.add(previousStep);
                this.updateStepStatus(previousStep, 'completed');
            }

            // Calculate progress percentage
            this.updateProgressPercentage();

            // Calculate estimated time remaining
            this.updateEstimatedTimeRemaining();

            // Record in user journey
            this.recordUserJourneyEvent({
                type: 'step_progress',
                stepIndex,
                stepId,
                stepType,
                timestamp: Date.now(),
                timeFromStart: Date.now() - this.progressState.onboardingStartTime
            });

            // Auto-save progress if enabled
            if (this.config.autoSaveProgress) {
                await this.saveProgress();
            }

            // Record performance metrics
            const trackingEndTime = performance.now();
            this.analytics.performanceMetrics.trackingOverhead.push(trackingEndTime - trackingStartTime);

            console.log(`Progress tracked: Step ${stepIndex} (${stepId})`);

            return {
                success: true,
                currentStep: stepIndex,
                progress: this.progressState.completionPercentage,
                estimatedTimeRemaining: this.progressState.estimatedTimeRemaining
            };

        } catch (error) {
            console.error('OnboardingProgressTracker: Track progress error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Monitor user engagement metrics
     */
    async monitorEngagement() {
        if (!this.config.enableEngagementMonitoring || !this.initialized) {
            return { success: false, error: 'Engagement monitoring not enabled or not initialized' };
        }

        const monitoringStartTime = performance.now();

        try {
            // Update activity tracking
            this.updateActivityTracking();

            // Calculate engagement metrics
            this.calculateEngagementMetrics();

            // Update engagement score
            this.updateEngagementScore();

            // Detect patterns and anomalies
            const patterns = this.detectEngagementPatterns();

            // Update personalization data based on engagement
            this.updatePersonalizationFromEngagement();

            // Record performance metrics
            const monitoringEndTime = performance.now();
            this.analytics.performanceMetrics.trackingOverhead.push(monitoringEndTime - monitoringStartTime);

            return {
                success: true,
                engagementScore: this.engagementData.engagementScore,
                totalInteractions: this.engagementData.totalInteractions,
                activeTime: this.engagementData.activeTime,
                patterns
            };

        } catch (error) {
            console.error('OnboardingProgressTracker: Monitor engagement error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update completion status
     */
    async updateCompletionStatus(statusInfo) {
        if (!this.initialized) {
            return { success: false, error: 'Tracker not initialized' };
        }

        const updateStartTime = performance.now();

        try {
            const { 
                stepIndex, 
                status = 'completed', 
                milestone = null, 
                achievement = null,
                certificationData = null 
            } = statusInfo;

            // Update step status
            this.updateStepStatus(stepIndex, status);

            // Handle milestone completion
            if (milestone) {
                this.completionStatus.milestones.set(milestone.id, {
                    ...milestone,
                    completedAt: Date.now(),
                    stepIndex
                });
            }

            // Handle achievement unlocking
            if (achievement) {
                this.completionStatus.achievements.add(achievement);
                this.recordUserJourneyEvent({
                    type: 'achievement_unlocked',
                    achievement,
                    stepIndex,
                    timestamp: Date.now()
                });
            }

            // Handle certification
            if (certificationData) {
                this.completionStatus.certifications.add({
                    ...certificationData,
                    earnedAt: Date.now(),
                    stepIndex
                });
            }

            // Check for overall completion
            await this.checkOverallCompletion();

            // Update completion analytics
            this.updateCompletionAnalytics();

            // Auto-save progress
            if (this.config.autoSaveProgress) {
                await this.saveProgress();
            }

            // Record performance metrics
            const updateEndTime = performance.now();
            this.analytics.performanceMetrics.dataProcessingTime.push(updateEndTime - updateStartTime);

            console.log(`Completion status updated: Step ${stepIndex} -> ${status}`);

            return {
                success: true,
                stepStatus: status,
                overallProgress: this.completionStatus.overallProgress,
                milestonesCompleted: this.completionStatus.milestones.size,
                achievementsUnlocked: this.completionStatus.achievements.size
            };

        } catch (error) {
            console.error('OnboardingProgressTracker: Update completion status error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Collect personalization data
     */
    async collectPersonalizationData(dataType, data) {
        if (!this.config.enablePersonalizationCollection || !this.initialized) {
            return { success: false, error: 'Personalization collection not enabled or not initialized' };
        }

        if (!this.privacySettings.trackingConsent) {
            return { success: false, error: 'User has not consented to data collection' };
        }

        const collectionStartTime = performance.now();

        try {
            // Process and anonymize data if required
            const processedData = this.processPersonalizationData(dataType, data);

            // Store data in appropriate category
            switch (dataType) {
                case 'preferences':
                    this.personalizationData.userPreferences.set(data.key, processedData);
                    break;
                case 'accessibility_needs':
                    this.personalizationData.accessibilityNeeds.set(data.category, processedData);
                    break;
                case 'device_capabilities':
                    this.personalizationData.deviceCapabilities.set(data.capability, processedData);
                    break;
                case 'usage_patterns':
                    this.personalizationData.usagePatterns.set(data.pattern, processedData);
                    break;
                case 'learning_style':
                    this.personalizationData.learningStyle = processedData.style;
                    break;
                case 'completion_behavior':
                    this.personalizationData.completionBehavior.set(data.behavior, processedData);
                    break;
                case 'help_seeking':
                    this.personalizationData.helpSeeking.set(data.context, processedData);
                    break;
                case 'error_patterns':
                    this.personalizationData.errorPatterns.set(data.errorType, processedData);
                    break;
                case 'success_factors':
                    this.personalizationData.successFactors.set(data.factor, processedData);
                    break;
                default:
                    console.warn(`Unknown personalization data type: ${dataType}`);
            }

            // Update analytics
            this.updatePersonalizationAnalytics(dataType, processedData);

            // Record performance metrics
            const collectionEndTime = performance.now();
            this.analytics.performanceMetrics.dataProcessingTime.push(collectionEndTime - collectionStartTime);

            console.log(`Personalization data collected: ${dataType}`);

            return {
                success: true,
                dataType,
                dataCollected: true,
                privacyCompliant: this.privacySettings.anonymizeData
            };

        } catch (error) {
            console.error('OnboardingProgressTracker: Collect personalization data error:', error);
            return {
                success: false,
                error: error.message,
                dataType
            };
        }
    }

    /**
     * Get comprehensive progress report
     */
    getProgressReport() {
        if (!this.initialized) {
            return null;
        }

        const sessionDuration = Date.now() - this.progressState.onboardingStartTime;

        return {
            // Basic progress information
            sessionId: this.progressState.sessionId,
            userId: this.progressState.userId,
            sessionDuration,
            
            // Progress metrics
            progress: {
                currentStep: this.progressState.currentStep,
                totalSteps: this.progressState.totalSteps,
                completedSteps: Array.from(this.progressState.completedSteps),
                skippedSteps: Array.from(this.progressState.skippedSteps),
                completionPercentage: this.progressState.completionPercentage,
                estimatedTimeRemaining: this.progressState.estimatedTimeRemaining,
                averageStepTime: this.calculateAverageStepTime()
            },

            // Engagement metrics
            engagement: {
                totalInteractions: this.engagementData.totalInteractions,
                engagementScore: this.engagementData.engagementScore,
                activeTime: this.engagementData.activeTime,
                idleTime: this.engagementData.idleTime,
                interactionBreakdown: {
                    keyboard: this.engagementData.keyboardInteractions,
                    mouse: this.engagementData.mouseInteractions,
                    touch: this.engagementData.touchInteractions,
                    focus: this.engagementData.focusEvents
                }
            },

            // Completion status
            completion: {
                overallProgress: this.completionStatus.overallProgress,
                milestonesCompleted: this.completionStatus.milestones.size,
                achievementsUnlocked: this.completionStatus.achievements.size,
                certificationsEarned: this.completionStatus.certifications.size,
                isCompleted: this.completionStatus.isCompleted,
                completionDate: this.completionStatus.completionDate
            },

            // Personalization insights (privacy-compliant)
            personalization: this.getPersonalizationInsights(),

            // Performance metrics
            performance: {
                averageTrackingOverhead: this.calculateAverageTrackingOverhead(),
                dataProcessingTime: this.calculateAverageDataProcessingTime(),
                userJourneyLength: this.analytics.userJourney.length
            },

            // Generated at
            generatedAt: Date.now()
        };
    }

    /**
     * Get user analytics and insights (simplified)
     */
    getUserAnalytics() {
        if (!this.config.enableAnalytics || !this.initialized) return null;

        return {
            session: {
                sessionId: this.progressState.sessionId,
                duration: Date.now() - this.progressState.onboardingStartTime,
                completionRate: this.progressState.completionPercentage
            },
            behavior: {
                learningStyle: this.personalizationData.learningStyle,
                preferredPace: this.personalizationData.preferredPace
            }
        };
    }

    /**
     * Reset all tracking data
     */
    resetProgress(keepPersonalizationData = false) {
        console.log('Resetting progress tracking data...');

        // Reset progress state
        this.progressState = {
            sessionId: this.generateSessionId(),
            userId: this.progressState.userId,
            onboardingStartTime: Date.now(),
            currentStep: 0,
            totalSteps: 0,
            completedSteps: new Set(),
            skippedSteps: new Set(),
            timeSpentPerStep: new Map(),
            stepStartTimes: new Map(),
            completionPercentage: 0,
            estimatedTimeRemaining: 0
        };

        // Reset engagement data
        this.engagementData = {
            totalInteractions: 0,
            keyboardInteractions: 0,
            mouseInteractions: 0,
            touchInteractions: 0,
            focusEvents: 0,
            scrollEvents: 0,
            idleTime: 0,
            activeTime: 0,
            lastActivityTime: null,
            sessionPauseCount: 0,
            avgInteractionInterval: 0,
            engagementScore: 0
        };

        // Reset completion status
        this.completionStatus = {
            overallProgress: 0,
            stepStatuses: new Map(),
            milestones: new Map(),
            achievements: new Set(),
            certifications: new Set(),
            timeToCompletion: null,
            completionDate: null,
            isCompleted: false,
            partialCompletions: new Map()
        };

        // Optionally reset personalization data
        if (!keepPersonalizationData) {
            this.personalizationData = {
                userPreferences: new Map(),
                accessibilityNeeds: new Map(),
                deviceCapabilities: new Map(),
                usagePatterns: new Map(),
                learningStyle: null,
                preferredPace: 'normal',
                completionBehavior: new Map(),
                helpSeeking: new Map(),
                errorPatterns: new Map(),
                successFactors: new Map()
            };
        }

        // Reset analytics
        this.analytics = {
            sessionMetrics: new Map(),
            performanceMetrics: {
                trackingOverhead: [],
                dataProcessingTime: [],
                storageOperationTime: []
            },
            userJourney: [],
            heatmapData: new Map(),
            conversionFunnels: new Map(),
            dropoffPoints: new Map()
        };

        console.log('Progress tracking data reset complete');
    }

    // Private helper methods

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Apply session configuration
     */
    applySessionConfig(config) {
        if (config.totalSteps) {
            this.progressState.totalSteps = config.totalSteps;
        }
        if (config.startingStep !== undefined) {
            this.progressState.currentStep = config.startingStep;
        }
    }

    /**
     * Setup privacy settings based on consent
     */
    setupPrivacySettings() {
        // Default to privacy-first approach
        if (!this.privacySettings.trackingConsent) {
            this.config.enablePersonalizationCollection = false;
            this.privacySettings.anonymizeData = true;
        }
    }

    /**
     * Initialize progress tracking systems
     */
    initializeProgressTracking() {
        console.log('Initializing progress tracking...');
        
        // Setup step status tracking
        this.completionStatus.stepStatuses = new Map();
        
        // Initialize milestone tracking
        this.completionStatus.milestones = new Map();
    }

    /**
     * Initialize engagement monitoring
     */
    initializeEngagementMonitoring() {
        console.log('Initializing engagement monitoring...');
        
        // Reset engagement counters
        this.engagementData.lastActivityTime = Date.now();
        
        // Start activity monitoring
        this.startActivityMonitoring();
    }

    /**
     * Initialize personalization data collection
     */
    initializePersonalizationCollection() {
        console.log('Initializing personalization data collection...');
        
        // Detect device capabilities
        this.detectDeviceCapabilities();
        
        // Initialize user preference detection
        this.initializePreferenceDetection();
    }

    /**
     * Start monitoring intervals
     */
    startMonitoringIntervals() {
        // Main tracking interval
        if (this.config.trackingInterval > 0) {
            this.trackingTimer = setInterval(() => {
                this.monitorEngagement();
            }, this.config.trackingInterval);
        }

        // Auto-save interval
        if (this.config.autoSaveProgress) {
            this.autosaveTimer = setInterval(() => {
                this.saveProgress();
            }, 60000); // Save every minute
        }
    }

    /**
     * Setup event listeners for tracking
     */
    setupEventListeners() {
        if (typeof document === 'undefined') return;

        // Interaction tracking
        document.addEventListener('keydown', (event) => {
            this.recordInteraction('keyboard', event);
        });

        document.addEventListener('click', (event) => {
            this.recordInteraction('mouse', event);
        });

        document.addEventListener('touchstart', (event) => {
            this.recordInteraction('touch', event);
        });

        document.addEventListener('focus', (event) => {
            this.recordInteraction('focus', event);
        }, true);

        document.addEventListener('scroll', (event) => {
            this.recordInteraction('scroll', event);
        });

        // Page visibility tracking for idle detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
    }

    /**
     * Record user interaction
     */
    recordInteraction(type, event) {
        const now = Date.now();
        
        // Update interaction counters
        this.engagementData.totalInteractions++;
        
        switch (type) {
            case 'keyboard':
                this.engagementData.keyboardInteractions++;
                break;
            case 'mouse':
                this.engagementData.mouseInteractions++;
                break;
            case 'touch':
                this.engagementData.touchInteractions++;
                break;
            case 'focus':
                this.engagementData.focusEvents++;
                break;
            case 'scroll':
                this.engagementData.scrollEvents++;
                break;
        }

        // Update activity tracking
        this.engagementData.lastActivityTime = now;
        this.resetIdleTimer();

        // Record in user journey
        this.recordUserJourneyEvent({
            type: 'interaction',
            interactionType: type,
            timestamp: now,
            elementTag: event.target?.tagName,
            elementId: event.target?.id
        });
    }

    /**
     * Update activity tracking
     */
    updateActivityTracking() {
        const now = Date.now();
        const lastActivity = this.engagementData.lastActivityTime || now;
        const timeSinceLastActivity = now - lastActivity;

        // Check if user is idle (no activity for more than 2 minutes)
        if (timeSinceLastActivity > 120000) {
            this.engagementData.idleTime += timeSinceLastActivity;
        } else {
            this.engagementData.activeTime += timeSinceLastActivity;
        }
    }

    /**
     * Calculate engagement metrics
     */
    calculateEngagementMetrics() {
        const sessionDuration = Date.now() - this.progressState.onboardingStartTime;
        
        if (sessionDuration > 0) {
            this.engagementData.avgInteractionInterval = 
                this.engagementData.totalInteractions > 0 
                    ? sessionDuration / this.engagementData.totalInteractions 
                    : 0;
        }
    }

    /**
     * Update engagement score
     */
    updateEngagementScore() {
        const sessionDuration = Date.now() - this.progressState.onboardingStartTime;
        const activeRatio = sessionDuration > 0 ? this.engagementData.activeTime / sessionDuration : 0;
        const interactionDensity = sessionDuration > 0 ? this.engagementData.totalInteractions / (sessionDuration / 1000) : 0;
        
        // Calculate engagement score (0-100)
        this.engagementData.engagementScore = Math.min(100, 
            (activeRatio * 50) + (Math.min(interactionDensity * 10, 50))
        );
    }

    /**
     * Update progress percentage
     */
    updateProgressPercentage() {
        if (this.progressState.totalSteps > 0) {
            this.progressState.completionPercentage = 
                (this.progressState.completedSteps.size / this.progressState.totalSteps) * 100;
            
            this.completionStatus.overallProgress = this.progressState.completionPercentage;
        }
    }

    /**
     * Update estimated time remaining
     */
    updateEstimatedTimeRemaining() {
        const avgStepTime = this.calculateAverageStepTime();
        const remainingSteps = this.progressState.totalSteps - this.progressState.completedSteps.size;
        
        this.progressState.estimatedTimeRemaining = avgStepTime * remainingSteps;
    }

    /**
     * Calculate average step completion time
     */
    calculateAverageStepTime() {
        const stepTimes = Array.from(this.progressState.timeSpentPerStep.values());
        return stepTimes.length > 0 
            ? stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length 
            : 60000; // Default 1 minute per step
    }

    /**
     * Update step status
     */
    updateStepStatus(stepIndex, status) {
        this.completionStatus.stepStatuses.set(stepIndex, {
            status,
            updatedAt: Date.now(),
            stepIndex
        });
    }

    /**
     * Check for overall completion
     */
    async checkOverallCompletion() {
        const completedSteps = this.progressState.completedSteps.size;
        const totalSteps = this.progressState.totalSteps;
        
        if (totalSteps > 0 && completedSteps >= totalSteps) {
            this.completionStatus.isCompleted = true;
            this.completionStatus.completionDate = Date.now();
            this.completionStatus.timeToCompletion = 
                Date.now() - this.progressState.onboardingStartTime;
                
            console.log('Onboarding completed!');
        }
    }

    /**
     * Process personalization data for privacy compliance
     */
    processPersonalizationData(dataType, data) {
        if (this.privacySettings.anonymizeData) {
            // Remove or hash personally identifiable information
            const processedData = { ...data };
            
            // Remove direct identifiers
            delete processedData.userId;
            delete processedData.email;
            delete processedData.name;
            
            // Add anonymization marker
            processedData._anonymized = true;
            processedData._processedAt = Date.now();
            
            return processedData;
        }
        
        return data;
    }

    /**
     * Record user journey event
     */
    recordUserJourneyEvent(event) {
        this.analytics.userJourney.push({
            ...event,
            sessionId: this.progressState.sessionId,
            currentStep: this.progressState.currentStep
        });
        
        // Limit journey length to prevent memory issues
        if (this.analytics.userJourney.length > 1000) {
            this.analytics.userJourney = this.analytics.userJourney.slice(-500);
        }
    }

    /**
     * Save progress to storage
     */
    async saveProgress() {
        const saveStartTime = performance.now();
        
        try {
            const progressData = {
                progressState: this.progressState,
                completionStatus: this.completionStatus,
                engagementData: this.engagementData,
                savedAt: Date.now()
            };
            
            // Save to localStorage (in a real app, this would be a backend call)
            if (typeof localStorage !== 'undefined') {
                const key = `onboarding_progress_${this.progressState.sessionId}`;
                localStorage.setItem(key, JSON.stringify(progressData));
            }
            
            const saveEndTime = performance.now();
            this.analytics.performanceMetrics.storageOperationTime.push(saveEndTime - saveStartTime);
            
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    /**
     * Load existing progress from storage
     */
    loadExistingProgress() {
        try {
            if (typeof localStorage !== 'undefined') {
                const key = `onboarding_progress_${this.progressState.sessionId}`;
                const savedData = localStorage.getItem(key);
                
                if (savedData) {
                    const progressData = JSON.parse(savedData);
                    
                    // Restore progress state
                    this.progressState = { ...this.progressState, ...progressData.progressState };
                    this.completionStatus = { ...this.completionStatus, ...progressData.completionStatus };
                    this.engagementData = { ...this.engagementData, ...progressData.engagementData };
                    
                    console.log('Previous progress loaded');
                }
            }
        } catch (error) {
            console.error('Failed to load existing progress:', error);
        }
    }

    // Analytics helper methods (simplified for MCP compatibility)
    
    detectEngagementPatterns() {
        return {
            peakEngagementTime: this.engagementData.lastActivityTime,
            interactionClusters: [],
            sessionRhythm: 'normal'
        };
    }

    identifyDropoffPoint() {
        const lastCompletedStep = Math.max(...Array.from(this.progressState.completedSteps));
        return lastCompletedStep < this.progressState.totalSteps - 1 ? lastCompletedStep + 1 : null;
    }

    getPersonalizationInsights() {
        if (!this.privacySettings.shareAnalytics) {
            return { message: 'Privacy mode active' };
        }
        return {
            learningStyle: this.personalizationData.learningStyle,
            preferredPace: this.personalizationData.preferredPace
        };
    }

    calculateAverageTrackingOverhead() {
        const overheads = this.analytics.performanceMetrics.trackingOverhead;
        return overheads.length > 0 ? overheads.reduce((a, b) => a + b, 0) / overheads.length : 0;
    }

    calculateAverageDataProcessingTime() {
        const times = this.analytics.performanceMetrics.dataProcessingTime;
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    }

    // Simplified helper methods
    startActivityMonitoring() { this.engagementData.lastActivityTime = Date.now(); }
    detectDeviceCapabilities() { this.personalizationData.deviceCapabilities.set('basic', true); }
    initializePreferenceDetection() { this.personalizationData.preferredPace = 'normal'; }
    resetIdleTimer() { this.engagementData.lastActivityTime = Date.now(); }
    handlePageHidden() { this.engagementData.sessionPauseCount++; }
    handlePageVisible() { this.engagementData.lastActivityTime = Date.now(); }
    updatePersonalizationFromEngagement() { /* Simplified */ }
    updateCompletionAnalytics() { /* Simplified */ }
    updatePersonalizationAnalytics() { /* Simplified */ }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Clear timers
        if (this.trackingTimer) {
            clearInterval(this.trackingTimer);
            this.trackingTimer = null;
        }
        
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
            this.autosaveTimer = null;
        }
        
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }

        // Clear monitoring intervals
        this.monitoringIntervals.forEach((interval, key) => {
            clearInterval(interval);
        });
        this.monitoringIntervals.clear();

        // Save final progress before cleanup
        if (this.config.autoSaveProgress && this.initialized) {
            this.saveProgress();
        }

        // Clear data structures
        this.progressState = null;
        this.engagementData = null;
        this.personalizationData = null;
        this.completionStatus = null;
        this.analytics = null;

        // Cleanup complete

        this.initialized = false;
        console.log('OnboardingProgressTracker: Destroyed');
    }
}