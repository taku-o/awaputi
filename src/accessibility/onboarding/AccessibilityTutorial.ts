/**
 * AccessibilityTutorial - Interactive tutorial content and feature demonstration
 * Provides guided tutorials, feature demonstrations, and hands-on practice sessions
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// Interfaces for accessibility tutorial
interface TutorialConfig {
    enableInteractiveTutorials: boolean;
    enableFeatureDemos: boolean;
    enablePracticeMode: boolean;
    adaptiveTutorialContent: boolean;
    tutorialSpeed: 'slow' | 'normal' | 'fast';
    enableVoiceGuidance: boolean;
    showVisualIndicators: boolean;
    allowTutorialSkipping: boolean;
}

interface TutorialStep {
    id: string;
    title: string;
    type: 'explanation' | 'practice' | 'configuration';
    content: string;
    duration: number;
    action?: () => void | Promise<void>;
    validation?: () => boolean;
    hint?: string;
}

interface TutorialDefinition {
    id: string;
    title: string;
    description: string;
    steps: TutorialStep[];
    estimatedTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prerequisites: string[];
}

interface TutorialContent {
    keyboardNavigation: TutorialDefinition;
    screenReader: TutorialDefinition;
    visualAdjustments: TutorialDefinition;
    audioSettings: TutorialDefinition;
}

interface TutorialState {
    currentTutorial: string | null;
    currentStep: number;
    completedTutorials: Set<string>;
    completedSteps: Map<string, Set<number>>;
    practiceResults: Map<string, PracticeSessionResult>;
    userProgress: Map<string, any>;
    sessionStartTime: number | null;
    interactionHistory: InteractionRecord[];
}

interface InteractionRecord {
    type: "single" | "batch";
    action: string;
    timestamp: number;
    tutorial: string;
    step: number;
    success: boolean;
}

interface PracticeSession {
    active: boolean;
    currentExercise: Exercise | null;
    attempts: number;
    successRate: number;
    feedback: PracticeFeedback[];
    timeSpent: number;
}

interface Exercise {
    id: string;
    name: string;
    type: string;
    difficulty: string;
    instructions: string;
    validate: () => boolean;
    timeout?: number;
}

interface ExerciseResult {
    exerciseId: string;
    name: string;
    success: boolean;
    attempts: number;
    time: number;
    score: number;
    errors?: string[];
}

interface PracticeFeedback {
    type: 'success' | 'improvement' | 'error';
    message: string;
    score: number;
    suggestions: string[];
}

interface PracticeSessionResult {
    sessionTime: number;
    exercises: ExerciseResult[];
    overallSuccessRate: number;
    feedback: PracticeFeedback[];
    timestamp: number;
}

interface DeliverySettings {
    highlightElements: boolean;
    showTooltips: boolean;
    enableAnimations: boolean;
    pauseOnInteraction: boolean;
    repeatInstructions: boolean;
}

interface PerformanceMetrics {
    tutorialStartTimes: Map<string, number>;
    tutorialCompletionTimes: Map<string, number>;
    stepTransitionTimes: number[];
    practiceSessionTimes: number[];
    userEngagementMetrics: Map<string, any>;
}

interface TutorialProgress {
    tutorialId: string;
    stepsCompleted: number;
    totalSteps: number;
    percentComplete: number;
    timeSpent: number;
    lastAccessed: number;
}

export class AccessibilityTutorial {
    private config: TutorialConfig;
    private tutorialContent: TutorialContent;
    private state: TutorialState;
    private practiceSession: PracticeSession;
    private deliverySettings: DeliverySettings;
    private performanceMetrics: PerformanceMetrics;
    private initialized: boolean;
    private activeHighlight: HTMLElement | null;
    private voiceGuidance: SpeechSynthesisUtterance | null;

    constructor(config: Partial<TutorialConfig> = {}) {
        this.config = {
            enableInteractiveTutorials: true,
            enableFeatureDemos: true,
            enablePracticeMode: true,
            adaptiveTutorialContent: true,
            tutorialSpeed: 'normal',
            enableVoiceGuidance: true,
            showVisualIndicators: true,
            allowTutorialSkipping: true,
            ...config
        };

        // Initialize tutorial content
        this.tutorialContent = this.createTutorialContent();

        // Initialize state
        this.state = {
            currentTutorial: null,
            currentStep: 0,
            completedTutorials: new Set(),
            completedSteps: new Map(),
            practiceResults: new Map(),
            userProgress: new Map(),
            sessionStartTime: null,
            interactionHistory: []
        };

        // Initialize practice session
        this.practiceSession = {
            active: false,
            currentExercise: null,
            attempts: 0,
            successRate: 0,
            feedback: [],
            timeSpent: 0
        };

        // Delivery settings
        this.deliverySettings = {
            highlightElements: true,
            showTooltips: true,
            enableAnimations: true,
            pauseOnInteraction: true,
            repeatInstructions: false
        };

        // Performance metrics
        this.performanceMetrics = {
            tutorialStartTimes: new Map(),
            tutorialCompletionTimes: new Map(),
            stepTransitionTimes: [],
            practiceSessionTimes: [],
            userEngagementMetrics: new Map()
        };

        this.initialized = false;
        this.activeHighlight = null;
        this.voiceGuidance = null;

        this.initialize();
    }

    /**
     * Initialize the tutorial system
     */
    private initialize(): void {
        try {
            this.setupTutorials();
            this.loadUserProgress();
            this.initialized = true;
            console.log('AccessibilityTutorial initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_TUTORIAL_ERROR', {
                operation: 'initialize'
            });
        }
    }

    /**
     * Create tutorial content definitions
     */
    private createTutorialContent(): TutorialContent {
        return {
            keyboardNavigation: {
                id: 'keyboard-nav',
                title: 'キーボードナビゲーション',
                description: 'キーボードのみでアプリケーションを操作する方法を学びます',
                steps: [
                    {
                        id: 'intro',
                        title: 'キーボードナビゲーションの紹介',
                        type: 'explanation',
                        content: 'Tabキーを使用してフォーカスを移動し、Enterキーで選択します',
                        duration: 5000
                    },
                    {
                        id: 'tab-practice',
                        title: 'Tabキーの練習',
                        type: 'practice',
                        content: 'Tabキーを押して次のボタンにフォーカスを移動してください',
                        duration: 10000,
                        validation: () => this.validateTabNavigation()
                    },
                    {
                        id: 'shortcuts',
                        title: 'ショートカットキー',
                        type: 'explanation',
                        content: '便利なショートカットキーを覚えましょう',
                        duration: 8000
                    }
                ],
                estimatedTime: 5,
                difficulty: 'beginner',
                prerequisites: []
            },
            screenReader: {
                id: 'screen-reader',
                title: 'スクリーンリーダーサポート',
                description: 'スクリーンリーダーとの連携機能を理解します',
                steps: [
                    {
                        id: 'intro',
                        title: 'スクリーンリーダーとは',
                        type: 'explanation',
                        content: 'スクリーンリーダーは画面の内容を音声で読み上げます',
                        duration: 5000
                    },
                    {
                        id: 'aria-labels',
                        title: 'ARIAラベルの理解',
                        type: 'explanation',
                        content: '要素には適切な説明が付与されています',
                        duration: 7000
                    }
                ],
                estimatedTime: 10,
                difficulty: 'intermediate',
                prerequisites: ['keyboard-nav']
            },
            visualAdjustments: {
                id: 'visual-adjust',
                title: '視覚調整',
                description: 'コントラストやフォントサイズの調整方法を学びます',
                steps: [
                    {
                        id: 'contrast',
                        title: 'コントラスト調整',
                        type: 'configuration',
                        content: '高コントラストモードを有効にできます',
                        duration: 5000
                    }
                ],
                estimatedTime: 5,
                difficulty: 'beginner',
                prerequisites: []
            },
            audioSettings: {
                id: 'audio-settings',
                title: '音声設定',
                description: '音声フィードバックとガイダンスの設定',
                steps: [
                    {
                        id: 'voice-guidance',
                        title: '音声ガイダンス',
                        type: 'configuration',
                        content: '音声ガイダンスの有効化と速度調整',
                        duration: 5000
                    }
                ],
                estimatedTime: 3,
                difficulty: 'beginner',
                prerequisites: []
            }
        };
    }

    /**
     * Start a tutorial
     */
    startTutorial(tutorialId: string): boolean {
        try {
            if (!this.initialized) {
                throw new Error('Tutorial system not initialized');
            }

            const tutorial = this.getTutorialById(tutorialId);
            if (!tutorial) {
                throw new Error(`Tutorial not found: ${tutorialId}`);
            }

            // Check prerequisites
            if (!this.checkPrerequisites(tutorial)) {
                console.warn('Prerequisites not met for tutorial:', tutorialId);
                return false;
            }

            this.state.currentTutorial = tutorialId;
            this.state.currentStep = 0;
            this.state.sessionStartTime = Date.now();

            // Record start time
            this.performanceMetrics.tutorialStartTimes.set(tutorialId, Date.now());

            // Initialize step tracking
            if (!this.state.completedSteps.has(tutorialId)) {
                this.state.completedSteps.set(tutorialId, new Set());
            }

            console.log(`Starting tutorial: ${tutorial.title}`);
            this.playCurrentStep();

            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_TUTORIAL_ERROR', {
                operation: 'startTutorial',
                tutorialId: tutorialId
            });
            return false;
        }
    }

    /**
     * Play the current step
     */
    private playCurrentStep(): void {
        if (!this.state.currentTutorial) return;

        const tutorial = this.getTutorialById(this.state.currentTutorial);
        if (!tutorial || this.state.currentStep >= tutorial.steps.length) {
            this.completeTutorial();
            return;
        }

        const step = tutorial.steps[this.state.currentStep];
        
        // Show visual indicators
        if (this.config.showVisualIndicators) {
            this.showStepIndicators(step);
        }

        // Voice guidance
        if (this.config.enableVoiceGuidance) {
            this.speakStep(step);
        }

        // Execute step action if any
        if (step.action) {
            step.action();
        }

        // Set timeout for auto-advance
        const duration = this.getStepDuration(step);
        setTimeout(() => {
            if (step.type !== 'practice' || (step.validation && step.validation())) {
                this.nextStep();
            }
        }, duration);
    }

    /**
     * Move to next step
     */
    nextStep(): void {
        if (!this.state.currentTutorial) return;

        const tutorial = this.getTutorialById(this.state.currentTutorial);
        if (!tutorial) return;

        // Mark current step as completed
        this.state.completedSteps.get(this.state.currentTutorial)?.add(this.state.currentStep);

        // Record interaction
        this.recordInteraction({
            type: "single",
            action: 'step_completed',
            timestamp: Date.now(),
            tutorial: this.state.currentTutorial,
            step: this.state.currentStep,
            success: true
        });

        // Move to next step
        this.state.currentStep++;
        
        if (this.state.currentStep < tutorial.steps.length) {
            this.playCurrentStep();
        } else {
            this.completeTutorial();
        }
    }

    /**
     * Skip current step
     */
    skipStep(): void {
        if (!this.config.allowTutorialSkipping) return;
        
        this.recordInteraction({
            type: "single",
            action: 'step_skipped',
            timestamp: Date.now(),
            tutorial: this.state.currentTutorial || '',
            step: this.state.currentStep,
            success: false
        });

        this.nextStep();
    }

    /**
     * Complete the current tutorial
     */
    private completeTutorial(): void {
        if (!this.state.currentTutorial) return;

        // Mark as completed
        this.state.completedTutorials.add(this.state.currentTutorial);
        
        // Record completion time
        const startTime = this.performanceMetrics.tutorialStartTimes.get(this.state.currentTutorial);
        if (startTime) {
            const completionTime = Date.now() - startTime;
            this.performanceMetrics.tutorialCompletionTimes.set(this.state.currentTutorial, completionTime);
        }

        console.log(`Tutorial completed: ${this.state.currentTutorial}`);
        
        // Clean up
        this.cleanupTutorial();
        
        // Reset state
        this.state.currentTutorial = null;
        this.state.currentStep = 0;
        this.state.sessionStartTime = null;
    }

    /**
     * Start practice mode
     */
    startPracticeMode(exerciseType?: string): boolean {
        try {
            if (!this.config.enablePracticeMode) {
                console.warn('Practice mode is disabled');
                return false;
            }

            this.practiceSession.active = true;
            this.practiceSession.attempts = 0;
            this.practiceSession.successRate = 0;
            this.practiceSession.feedback = [];
            this.practiceSession.timeSpent = 0;

            const exercise = this.selectExercise(exerciseType);
            if (exercise) {
                this.practiceSession.currentExercise = exercise;
                this.startExercise(exercise);
                return true;
            }

            return false;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_TUTORIAL_ERROR', {
                operation: 'startPracticeMode',
                exerciseType: exerciseType
            });
            return false;
        }
    }

    /**
     * Select an exercise
     */
    private selectExercise(type?: string): Exercise | null {
        // Sample exercises
        const exercises: Exercise[] = [
            {
                id: 'tab-nav-1',
                name: 'Tab Navigation Practice',
                type: 'navigation',
                difficulty: 'beginner',
                instructions: 'Navigate to all buttons using Tab key',
                validate: () => this.validateTabNavigation()
            },
            {
                id: 'shortcuts-1',
                name: 'Keyboard Shortcuts',
                type: 'shortcuts',
                difficulty: 'intermediate',
                instructions: 'Use keyboard shortcuts to perform actions',
                validate: () => this.validateShortcutUsage()
            }
        ];

        if (type) {
            return exercises.find(e => e.type === type) || null;
        }

        // Select based on user progress
        return exercises[0]; // Simplified selection
    }

    /**
     * Start an exercise
     */
    private startExercise(exercise: Exercise): void {
        console.log(`Starting exercise: ${exercise.name}`);
        
        // Show instructions
        if (this.config.showVisualIndicators) {
            this.showExerciseInstructions(exercise);
        }

        if (this.config.enableVoiceGuidance) {
            this.speak(exercise.instructions);
        }

        // Start timer
        const startTime = Date.now();
        
        // Set up validation check
        const checkInterval = setInterval(() => {
            if (exercise.validate()) {
                clearInterval(checkInterval);
                this.completeExercise(exercise, true, Date.now() - startTime);
            }
        }, 100);

        // Timeout if specified
        if (exercise.timeout) {
            setTimeout(() => {
                clearInterval(checkInterval);
                this.completeExercise(exercise, false, exercise.timeout);
            }, exercise.timeout);
        }
    }

    /**
     * Complete an exercise
     */
    private completeExercise(exercise: Exercise, success: boolean, time: number): void {
        const result: ExerciseResult = {
            exerciseId: exercise.id,
            name: exercise.name,
            success: success,
            attempts: this.practiceSession.attempts + 1,
            time: time,
            score: success ? 100 : 0
        };

        // Update practice session
        this.practiceSession.attempts++;
        
        // Generate feedback
        const feedback: PracticeFeedback = {
            type: success ? 'success' : 'improvement',
            message: success ? 'よくできました！' : '改善の余地があります',
            score: result.score,
            suggestions: success ? [] : ['もう一度練習してみましょう']
        };

        this.practiceSession.feedback.push(feedback);

        // Store result
        const sessionResults = this.state.practiceResults.get(exercise.type) || {
            sessionTime: 0,
            exercises: [],
            overallSuccessRate: 0,
            feedback: [],
            timestamp: Date.now()
        };

        sessionResults.exercises.push(result);
        this.state.practiceResults.set(exercise.type, sessionResults);

        console.log('Exercise completed:', result);
    }

    /**
     * Show step indicators
     */
    private showStepIndicators(step: TutorialStep): void {
        // Clean up previous highlight
        this.cleanupHighlight();

        // Create highlight overlay
        const highlight = document.createElement('div');
        highlight.className = 'accessibility-tutorial-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.5);
        `;

        document.body.appendChild(highlight);
        this.activeHighlight = highlight;

        // Show tooltip with content
        const tooltip = document.createElement('div');
        tooltip.className = 'accessibility-tutorial-tooltip';
        tooltip.textContent = step.content;
        tooltip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            color: black;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            z-index: 10000;
        `;

        highlight.appendChild(tooltip);
    }

    /**
     * Show exercise instructions
     */
    private showExerciseInstructions(exercise: Exercise): void {
        // Similar to showStepIndicators but for exercises
        this.showStepIndicators({
            id: exercise.id,
            title: exercise.name,
            type: 'practice',
            content: exercise.instructions,
            duration: 0
        });
    }

    /**
     * Speak text using voice guidance
     */
    private speak(text: string): void {
        if (!('speechSynthesis' in window)) return;

        // Cancel previous speech
        window.speechSynthesis.cancel();

        this.voiceGuidance = new SpeechSynthesisUtterance(text);
        this.voiceGuidance.rate = this.getVoiceSpeed();
        this.voiceGuidance.lang = 'ja-JP';

        window.speechSynthesis.speak(this.voiceGuidance);
    }

    /**
     * Speak step content
     */
    private speakStep(step: TutorialStep): void {
        const text = `${step.title}。${step.content}`;
        this.speak(text);
    }

    /**
     * Get voice speed based on config
     */
    private getVoiceSpeed(): number {
        switch (this.config.tutorialSpeed) {
            case 'slow': return 0.8;
            case 'fast': return 1.2;
            default: return 1.0;
        }
    }

    /**
     * Get step duration
     */
    private getStepDuration(step: TutorialStep): number {
        const speedMultiplier = {
            slow: 1.5,
            normal: 1.0,
            fast: 0.7
        };

        return step.duration * speedMultiplier[this.config.tutorialSpeed];
    }

    /**
     * Validate Tab navigation
     */
    private validateTabNavigation(): boolean {
        // Check if user successfully tabbed through elements
        // This is a simplified validation
        return document.activeElement?.tagName === 'BUTTON';
    }

    /**
     * Validate shortcut usage
     */
    private validateShortcutUsage(): boolean {
        // Check if user used keyboard shortcuts
        // This is a simplified validation
        return this.state.interactionHistory.some(i => i.action === 'shortcut_used');
    }

    /**
     * Check prerequisites
     */
    private checkPrerequisites(tutorial: TutorialDefinition): boolean {
        return tutorial.prerequisites.every(prereq => 
            this.state.completedTutorials.has(prereq)
        );
    }

    /**
     * Get tutorial by ID
     */
    private getTutorialById(tutorialId: string): TutorialDefinition | null {
        const tutorials = Object.values(this.tutorialContent);
        return tutorials.find(t => t.id === tutorialId) || null;
    }

    /**
     * Record interaction
     */
    private recordInteraction(interaction: InteractionRecord): void {
        this.state.interactionHistory.push(interaction);
        
        // Keep history manageable
        if (this.state.interactionHistory.length > 100) {
            this.state.interactionHistory = this.state.interactionHistory.slice(-50);
        }
    }

    /**
     * Clean up tutorial resources
     */
    private cleanupTutorial(): void {
        this.cleanupHighlight();
        
        if (this.voiceGuidance) {
            window.speechSynthesis.cancel();
            this.voiceGuidance = null;
        }
    }

    /**
     * Clean up highlight
     */
    private cleanupHighlight(): void {
        if (this.activeHighlight) {
            this.activeHighlight.remove();
            this.activeHighlight = null;
        }
    }

    /**
     * Load user progress
     */
    private loadUserProgress(): void {
        try {
            const savedProgress = localStorage.getItem('accessibility-tutorial-progress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                this.state.completedTutorials = new Set(progress.completedTutorials);
                this.state.userProgress = new Map(progress.userProgress);
            }
        } catch (error) {
            console.warn('Failed to load tutorial progress:', error);
        }
    }

    /**
     * Save user progress
     */
    saveUserProgress(): void {
        try {
            const progress = {
                completedTutorials: Array.from(this.state.completedTutorials),
                userProgress: Array.from(this.state.userProgress.entries())
            };
            localStorage.setItem('accessibility-tutorial-progress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Failed to save tutorial progress:', error);
        }
    }

    /**
     * Setup tutorials
     */
    private setupTutorials(): void {
        // Additional tutorial setup if needed
        console.log('Tutorials setup completed');
    }

    /**
     * Get available tutorials
     */
    getAvailableTutorials(): TutorialDefinition[] {
        return Object.values(this.tutorialContent);
    }

    /**
     * Get tutorial progress
     */
    getTutorialProgress(tutorialId: string): TutorialProgress | null {
        const tutorial = this.getTutorialById(tutorialId);
        if (!tutorial) return null;

        const completedSteps = this.state.completedSteps.get(tutorialId)?.size || 0;
        const startTime = this.performanceMetrics.tutorialStartTimes.get(tutorialId);
        const completionTime = this.performanceMetrics.tutorialCompletionTimes.get(tutorialId);

        return {
            tutorialId: tutorialId,
            stepsCompleted: completedSteps,
            totalSteps: tutorial.steps.length,
            percentComplete: (completedSteps / tutorial.steps.length) * 100,
            timeSpent: completionTime || (startTime ? Date.now() - startTime : 0),
            lastAccessed: startTime || 0
        };
    }

    /**
     * Get practice results
     */
    getPracticeResults(exerciseType?: string): PracticeSessionResult[] {
        if (exerciseType) {
            const result = this.state.practiceResults.get(exerciseType);
            return result ? [result] : [];
        }
        return Array.from(this.state.practiceResults.values());
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<TutorialConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('Tutorial configuration updated');
    }

    /**
     * Check if tutorial system is ready
     */
    isReady(): boolean {
        return this.initialized;
    }

    /**
     * Destroy tutorial system
     */
    destroy(): void {
        this.cleanupTutorial();
        this.saveUserProgress();
        this.initialized = false;
        console.log('AccessibilityTutorial destroyed');
    }
}