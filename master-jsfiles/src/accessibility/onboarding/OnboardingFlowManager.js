/**
 * OnboardingFlowManager - Onboarding step sequencing and adaptive content delivery
 * Handles flow control, navigation logic, and step validation for accessibility onboarding
 */
export class OnboardingFlowManager {
    constructor(config = {}) {
        this.config = {
            enableAdaptiveFlow: true,
            skipCompletedSteps: true,
            allowStepSkipping: true,
            maxStepsPerSession: 10,
            adaptiveContentDelivery: true,
            personalizedRecommendations: true,
            ...config
        };

        // Flow state management
        this.flowState = {
            currentStep: 0,
            completedSteps: new Set(),
            skippedSteps: new Set(),
            totalSteps: 0,
            sessionStartTime: null,
            sessionId: null,
            userProfile: null,
            adaptivePath: []
        };

        // Step definitions and flow configuration
        this.steps = [
            {
                id: 'welcome',
                title: 'アクセシビリティ設定へようこそ',
                type: 'intro',
                required: true,
                estimatedTime: 30,
                prerequisites: [],
                adaptiveConditions: []
            },
            {
                id: 'assessment',
                title: 'アクセシビリティニーズ評価',
                type: 'questionnaire',
                required: true,
                estimatedTime: 120,
                prerequisites: ['welcome'],
                adaptiveConditions: []
            },
            {
                id: 'profile-selection',
                title: 'プロファイル選択',
                type: 'configuration',
                required: true,
                estimatedTime: 60,
                prerequisites: ['assessment'],
                adaptiveConditions: ['hasAssessmentResults']
            },
            {
                id: 'keyboard-tutorial',
                title: 'キーボードナビゲーション',
                type: 'tutorial',
                required: false,
                estimatedTime: 180,
                prerequisites: ['profile-selection'],
                adaptiveConditions: ['needsKeyboardSupport']
            },
            {
                id: 'screen-reader-tutorial',
                title: 'スクリーンリーダー設定',
                type: 'tutorial',
                required: false,
                estimatedTime: 240,
                prerequisites: ['profile-selection'],
                adaptiveConditions: ['needsScreenReaderSupport']
            },
            {
                id: 'visual-tutorial',
                title: '視覚調整設定',
                type: 'tutorial',
                required: false,
                estimatedTime: 150,
                prerequisites: ['profile-selection'],
                adaptiveConditions: ['needsVisualSupport']
            },
            {
                id: 'practice',
                title: '実践練習',
                type: 'practice',
                required: false,
                estimatedTime: 300,
                prerequisites: ['keyboard-tutorial', 'screen-reader-tutorial', 'visual-tutorial'],
                adaptiveConditions: ['hasTutorialCompletion']
            },
            {
                id: 'summary',
                title: '設定完了',
                type: 'summary',
                required: true,
                estimatedTime: 45,
                prerequisites: [],
                adaptiveConditions: []
            }
        ];

        // Navigation history and branching logic
        this.navigationHistory = [];
        this.branchingRules = new Map();
        this.conditionalLogic = new Map();

        // Performance and analytics
        this.performance = {
            stepTransitionTimes: [],
            validationTimes: [],
            adaptationTimes: [],
            totalFlowTime: 0
        };

        this.initialized = false;
    }

    /**
     * Initialize the flow manager
     */
    initialize(userProfile = null) {
        if (this.initialized) return true;

        console.log('OnboardingFlowManager: Initializing...');

        this.flowState.userProfile = userProfile;
        this.flowState.sessionId = this.generateSessionId();
        this.flowState.sessionStartTime = Date.now();
        this.flowState.totalSteps = this.steps.length;

        // Setup branching rules
        this.setupBranchingRules();

        // Generate adaptive path based on user profile
        if (this.config.enableAdaptiveFlow && userProfile) {
            this.generateAdaptivePath(userProfile);
        }

        this.initialized = true;
        console.log('OnboardingFlowManager: Initialized with adaptive flow enabled');
        return true;
    }

    /**
     * Manage the complete onboarding flow
     */
    async manageOnboardingFlow(startStep = 0) {
        if (!this.initialized) {
            throw new Error('OnboardingFlowManager must be initialized first');
        }

        const startTime = performance.now();
        console.log(`Starting onboarding flow from step ${startStep}`);

        try {
            // Set starting position
            this.flowState.currentStep = startStep;

            // Validate starting step
            if (!this.isValidStep(startStep)) {
                throw new Error(`Invalid starting step: ${startStep}`);
            }

            // Apply adaptive content delivery
            if (this.config.adaptiveContentDelivery) {
                await this.applyAdaptiveContent();
            }

            // Execute flow management logic
            const flowResult = await this.executeFlowLogic();

            // Calculate performance metrics
            const endTime = performance.now();
            const flowTime = endTime - startTime;
            this.performance.totalFlowTime = flowTime;

            console.log(`Onboarding flow management completed in ${flowTime.toFixed(2)}ms`);

            return {
                success: true,
                flowResult,
                currentStep: this.flowState.currentStep,
                completedSteps: Array.from(this.flowState.completedSteps),
                sessionId: this.flowState.sessionId,
                performance: {
                    flowTime,
                    stepsCompleted: this.flowState.completedSteps.size
                }
            };

        } catch (error) {
            console.error('OnboardingFlowManager: Flow management error:', error);
            return {
                success: false,
                error: error.message,
                currentStep: this.flowState.currentStep
            };
        }
    }

    /**
     * Navigate to the next step in the flow
     */
    async navigateToNextStep() {
        const startTime = performance.now();
        
        try {
            // Validate current step completion
            const isCurrentStepValid = await this.validateStepCompletion(this.flowState.currentStep);
            
            if (!isCurrentStepValid && this.getCurrentStep().required) {
                return {
                    success: false,
                    error: 'Current step must be completed before proceeding',
                    currentStep: this.flowState.currentStep
                };
            }

            // Mark current step as completed
            this.flowState.completedSteps.add(this.flowState.currentStep);

            // Determine next step using adaptive logic
            const nextStep = await this.determineNextStep();

            if (nextStep === null) {
                // Flow completed
                return {
                    success: true,
                    completed: true,
                    totalSteps: this.flowState.completedSteps.size,
                    sessionTime: Date.now() - this.flowState.sessionStartTime
                };
            }

            // Update navigation history
            this.navigationHistory.push({
                from: this.flowState.currentStep,
                to: nextStep,
                timestamp: Date.now(),
                reason: 'navigation'
            });

            // Update current step
            const previousStep = this.flowState.currentStep;
            this.flowState.currentStep = nextStep;

            // Apply step-specific adaptations
            if (this.config.adaptiveContentDelivery) {
                await this.applyStepAdaptations(nextStep);
            }

            // Record performance metrics
            const endTime = performance.now();
            this.performance.stepTransitionTimes.push(endTime - startTime);

            console.log(`Navigated from step ${previousStep} to step ${nextStep}`);

            return {
                success: true,
                previousStep,
                currentStep: nextStep,
                stepInfo: this.getCurrentStep(),
                estimatedTimeRemaining: this.calculateEstimatedTimeRemaining()
            };

        } catch (error) {
            console.error('OnboardingFlowManager: Navigation error:', error);
            return {
                success: false,
                error: error.message,
                currentStep: this.flowState.currentStep
            };
        }
    }

    /**
     * Navigate to the previous step
     */
    async navigateToPreviousStep() {
        if (this.flowState.currentStep <= 0) {
            return {
                success: false,
                error: 'Already at the first step',
                currentStep: this.flowState.currentStep
            };
        }

        try {
            // Find previous valid step from navigation history
            const previousStep = this.findPreviousStep();

            // Update navigation history
            this.navigationHistory.push({
                from: this.flowState.currentStep,
                to: previousStep,
                timestamp: Date.now(),
                reason: 'back_navigation'
            });

            // Update current step
            const currentStep = this.flowState.currentStep;
            this.flowState.currentStep = previousStep;

            // Remove from completed steps if going back
            this.flowState.completedSteps.delete(currentStep);

            console.log(`Navigated back from step ${currentStep} to step ${previousStep}`);

            return {
                success: true,
                previousStep: currentStep,
                currentStep: previousStep,
                stepInfo: this.getCurrentStep()
            };

        } catch (error) {
            console.error('OnboardingFlowManager: Back navigation error:', error);
            return {
                success: false,
                error: error.message,
                currentStep: this.flowState.currentStep
            };
        }
    }

    /**
     * Validate step completion requirements
     */
    async validateStepCompletion(stepIndex) {
        const startTime = performance.now();

        try {
            const step = this.steps[stepIndex];
            if (!step) {
                return false;
            }

            // Check basic step requirements
            let isValid = true;

            // Validate step-specific completion criteria
            switch (step.type) {
                case 'intro':
                    isValid = this.validateIntroStep(step);
                    break;
                case 'questionnaire':
                    isValid = await this.validateQuestionnaireStep(step);
                    break;
                case 'configuration':
                    isValid = await this.validateConfigurationStep(step);
                    break;
                case 'tutorial':
                    isValid = await this.validateTutorialStep(step);
                    break;
                case 'practice':
                    isValid = await this.validatePracticeStep(step);
                    break;
                case 'summary':
                    isValid = this.validateSummaryStep(step);
                    break;
                default:
                    isValid = true;
            }

            // Check adaptive conditions
            if (isValid && step.adaptiveConditions.length > 0) {
                isValid = await this.validateAdaptiveConditions(step.adaptiveConditions);
            }

            // Record performance metrics
            const endTime = performance.now();
            this.performance.validationTimes.push(endTime - startTime);

            return isValid;

        } catch (error) {
            console.error('OnboardingFlowManager: Step validation error:', error);
            return false;
        }
    }

    /**
     * Apply adaptive content delivery based on user profile
     */
    async applyAdaptiveContent() {
        const startTime = performance.now();

        try {
            if (!this.flowState.userProfile) {
                return;
            }

            const userProfile = this.flowState.userProfile;

            // Analyze user needs and preferences
            const adaptations = {
                contentComplexity: this.determineContentComplexity(userProfile),
                estimatedPace: this.calculateEstimatedPace(userProfile),
                recommendedPath: this.generateRecommendedPath(userProfile),
                skipConditions: this.determineSkipConditions(userProfile)
            };

            // Apply content adaptations to steps
            for (let i = 0; i < this.steps.length; i++) {
                await this.adaptStepContent(i, adaptations);
            }

            // Update adaptive path
            this.flowState.adaptivePath = adaptations.recommendedPath;

            // Record performance metrics
            const endTime = performance.now();
            this.performance.adaptationTimes.push(endTime - startTime);

            console.log('Adaptive content delivery applied successfully');

        } catch (error) {
            console.error('OnboardingFlowManager: Adaptive content error:', error);
        }
    }

    /**
     * Get current step information
     */
    getCurrentStep() {
        return this.steps[this.flowState.currentStep] || null;
    }

    /**
     * Get flow progress information
     */
    getFlowProgress() {
        const completedCount = this.flowState.completedSteps.size;
        const totalSteps = this.steps.length;
        const currentStep = this.getCurrentStep();

        return {
            currentStepIndex: this.flowState.currentStep,
            currentStep: currentStep,
            completedSteps: Array.from(this.flowState.completedSteps),
            skippedSteps: Array.from(this.flowState.skippedSteps),
            progress: totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0,
            totalSteps,
            completedCount,
            sessionTime: Date.now() - this.flowState.sessionStartTime,
            estimatedTimeRemaining: this.calculateEstimatedTimeRemaining()
        };
    }

    /**
     * Skip current step if allowed
     */
    async skipCurrentStep() {
        const currentStep = this.getCurrentStep();
        
        if (!currentStep) {
            return { success: false, error: 'No current step to skip' };
        }

        if (!this.config.allowStepSkipping) {
            return { success: false, error: 'Step skipping is disabled' };
        }

        if (currentStep.required) {
            return { success: false, error: 'Cannot skip required step' };
        }

        try {
            // Mark step as skipped
            this.flowState.skippedSteps.add(this.flowState.currentStep);

            // Navigate to next step
            const navigationResult = await this.navigateToNextStep();

            if (navigationResult.success) {
                console.log(`Skipped step: ${currentStep.id}`);
            }

            return navigationResult;

        } catch (error) {
            console.error('OnboardingFlowManager: Skip step error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Jump to a specific step
     */
    async jumpToStep(stepIndex) {
        if (!this.isValidStep(stepIndex)) {
            return { success: false, error: 'Invalid step index' };
        }

        try {
            // Validate prerequisites
            const step = this.steps[stepIndex];
            const prerequisitesMet = await this.validatePrerequisites(step.prerequisites);

            if (!prerequisitesMet) {
                return { 
                    success: false, 
                    error: 'Prerequisites not met for target step',
                    missingPrerequisites: step.prerequisites
                };
            }

            // Update navigation history
            this.navigationHistory.push({
                from: this.flowState.currentStep,
                to: stepIndex,
                timestamp: Date.now(),
                reason: 'jump_navigation'
            });

            // Update current step
            const previousStep = this.flowState.currentStep;
            this.flowState.currentStep = stepIndex;

            console.log(`Jumped from step ${previousStep} to step ${stepIndex}`);

            return {
                success: true,
                previousStep,
                currentStep: stepIndex,
                stepInfo: this.getCurrentStep()
            };

        } catch (error) {
            console.error('OnboardingFlowManager: Jump to step error:', error);
            return { 
                success: false, 
                error: error.message,
                currentStep: this.flowState.currentStep
            };
        }
    }

    /**
     * Reset flow to beginning
     */
    resetFlow() {
        this.flowState = {
            currentStep: 0,
            completedSteps: new Set(),
            skippedSteps: new Set(),
            totalSteps: this.steps.length,
            sessionStartTime: Date.now(),
            sessionId: this.generateSessionId(),
            userProfile: this.flowState.userProfile,
            adaptivePath: []
        };

        this.navigationHistory = [];
        this.performance = {
            stepTransitionTimes: [],
            validationTimes: [],
            adaptationTimes: [],
            totalFlowTime: 0
        };

        console.log('Onboarding flow reset to beginning');
    }

    /**
     * Get flow analytics and metrics
     */
    getFlowAnalytics() {
        const sessionTime = Date.now() - this.flowState.sessionStartTime;
        const avgTransitionTime = this.performance.stepTransitionTimes.length > 0 
            ? this.performance.stepTransitionTimes.reduce((a, b) => a + b, 0) / this.performance.stepTransitionTimes.length 
            : 0;

        return {
            sessionId: this.flowState.sessionId,
            sessionTime,
            completedSteps: this.flowState.completedSteps.size,
            skippedSteps: this.flowState.skippedSteps.size,
            totalSteps: this.steps.length,
            completionRate: (this.flowState.completedSteps.size / this.steps.length) * 100,
            averageTransitionTime: avgTransitionTime,
            navigationHistory: this.navigationHistory,
            performance: this.performance,
            adaptivePath: this.flowState.adaptivePath
        };
    }

    // Private helper methods
    generateSessionId() {
        return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    isValidStep(stepIndex) {
        return stepIndex >= 0 && stepIndex < this.steps.length;
    }

    setupBranchingRules() {
        // Define branching logic for adaptive flow
        this.branchingRules.set('needsKeyboardSupport', (profile) => {
            return profile?.disabilities?.includes('motor') || 
                   profile?.preferences?.keyboardOnly === true;
        });

        this.branchingRules.set('needsScreenReaderSupport', (profile) => {
            return profile?.disabilities?.includes('visual') ||
                   profile?.assistiveTechnology?.screenReader === true;
        });

        this.branchingRules.set('needsVisualSupport', (profile) => {
            return profile?.disabilities?.includes('visual') ||
                   profile?.preferences?.highContrast === true ||
                   profile?.preferences?.largeText === true;
        });
    }

    async executeFlowLogic() {
        // Implement main flow execution logic
        const currentStep = this.getCurrentStep();
        
        return {
            stepExecuted: currentStep?.id,
            nextStepRecommendation: await this.determineNextStep(),
            adaptationsApplied: this.config.adaptiveContentDelivery
        };
    }

    async determineNextStep() {
        const currentIndex = this.flowState.currentStep;
        
        // Check if we've reached the end
        if (currentIndex >= this.steps.length - 1) {
            return null;
        }

        // Use adaptive path if available
        if (this.flowState.adaptivePath.length > 0) {
            const nextInPath = this.flowState.adaptivePath.find(step => step > currentIndex);
            if (nextInPath !== undefined) {
                return nextInPath;
            }
        }

        // Default to next sequential step
        let nextStep = currentIndex + 1;
        
        // Check if next step should be skipped based on conditions
        while (nextStep < this.steps.length) {
            const step = this.steps[nextStep];
            const shouldSkip = await this.shouldSkipStep(step);
            
            if (!shouldSkip) {
                return nextStep;
            }
            
            nextStep++;
        }

        return null;
    }

    async shouldSkipStep(step) {
        // Check adaptive conditions to determine if step should be skipped
        if (step.adaptiveConditions.length === 0) {
            return false;
        }

        const userProfile = this.flowState.userProfile;
        if (!userProfile) {
            return false;
        }

        return !step.adaptiveConditions.some(condition => {
            const rule = this.branchingRules.get(condition);
            return rule ? rule(userProfile) : false;
        });
    }

    findPreviousStep() {
        // Find the most recent valid previous step from navigation history
        for (let i = this.navigationHistory.length - 1; i >= 0; i--) {
            const nav = this.navigationHistory[i];
            if (nav.to === this.flowState.currentStep) {
                return nav.from;
            }
        }

        // Fallback to previous sequential step
        return Math.max(0, this.flowState.currentStep - 1);
    }

    calculateEstimatedTimeRemaining() {
        let remainingTime = 0;
        
        for (let i = this.flowState.currentStep; i < this.steps.length; i++) {
            const step = this.steps[i];
            if (!this.flowState.completedSteps.has(i) && !this.flowState.skippedSteps.has(i)) {
                remainingTime += step.estimatedTime || 60;
            }
        }

        return remainingTime;
    }

    // Step validation methods
    validateIntroStep(step) {
        return true; // Intro steps are always considered complete when viewed
    }

    async validateQuestionnaireStep(step) {
        // Validate that questionnaire has been completed
        return this.flowState.userProfile && 
               Object.keys(this.flowState.userProfile).length > 0;
    }

    async validateConfigurationStep(step) {
        // Validate that configuration has been set
        return this.flowState.userProfile?.selectedProfile !== undefined;
    }

    async validateTutorialStep(step) {
        // Validate tutorial completion based on step type
        return true; // Simplified validation
    }

    async validatePracticeStep(step) {
        // Validate practice session completion
        return true; // Simplified validation
    }

    validateSummaryStep(step) {
        return true; // Summary steps are informational
    }

    async validateAdaptiveConditions(conditions) {
        // Validate that adaptive conditions are met
        const userProfile = this.flowState.userProfile;
        if (!userProfile) return true;

        return conditions.some(condition => {
            const rule = this.branchingRules.get(condition);
            return rule ? rule(userProfile) : true;
        });
    }

    async validatePrerequisites(prerequisites) {
        if (!prerequisites || prerequisites.length === 0) {
            return true;
        }

        // Check that all prerequisite steps are completed
        return prerequisites.every(prereq => {
            const stepIndex = this.steps.findIndex(step => step.id === prereq);
            return stepIndex === -1 || this.flowState.completedSteps.has(stepIndex);
        });
    }

    // Adaptive content methods
    determineContentComplexity(userProfile) {
        const experience = userProfile?.experience || 'beginner';
        return experience === 'expert' ? 'advanced' : 
               experience === 'intermediate' ? 'standard' : 'simplified';
    }

    calculateEstimatedPace(userProfile) {
        const pace = userProfile?.pace || 'normal';
        return pace === 'fast' ? 0.8 : pace === 'slow' ? 1.5 : 1.0;
    }

    generateRecommendedPath(userProfile) {
        const path = [];
        
        // Always include required steps
        this.steps.forEach((step, index) => {
            if (step.required) {
                path.push(index);
            }
        });

        // Add optional steps based on user profile
        this.steps.forEach((step, index) => {
            if (!step.required && step.adaptiveConditions.length > 0) {
                const shouldInclude = step.adaptiveConditions.some(condition => {
                    const rule = this.branchingRules.get(condition);
                    return rule ? rule(userProfile) : false;
                });
                
                if (shouldInclude) {
                    path.push(index);
                }
            }
        });

        return path.sort((a, b) => a - b);
    }

    determineSkipConditions(userProfile) {
        const skipConditions = new Map();
        
        this.steps.forEach((step, index) => {
            if (!step.required && step.adaptiveConditions.length > 0) {
                const shouldSkip = !step.adaptiveConditions.some(condition => {
                    const rule = this.branchingRules.get(condition);
                    return rule ? rule(userProfile) : false;
                });
                
                skipConditions.set(index, shouldSkip);
            }
        });

        return skipConditions;
    }

    async adaptStepContent(stepIndex, adaptations) {
        const step = this.steps[stepIndex];
        if (!step) return;

        // Apply content complexity adjustments
        if (adaptations.contentComplexity === 'simplified') {
            step.estimatedTime = Math.floor(step.estimatedTime * 0.8);
        } else if (adaptations.contentComplexity === 'advanced') {
            step.estimatedTime = Math.floor(step.estimatedTime * 1.2);
        }

        // Apply pace adjustments
        step.estimatedTime = Math.floor(step.estimatedTime * adaptations.estimatedPace);
    }

    async applyStepAdaptations(stepIndex) {
        // Apply real-time adaptations when entering a step
        const step = this.steps[stepIndex];
        const userProfile = this.flowState.userProfile;

        if (step && userProfile) {
            // Log step entry for analytics
            console.log(`Entering step: ${step.id} (${step.title})`);
        }
    }

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
        this.flowState = null;
        this.navigationHistory = [];
        this.branchingRules.clear();
        this.conditionalLogic.clear();
        this.performance = null;
        this.initialized = false;
        
        console.log('OnboardingFlowManager: Destroyed');
    }
}