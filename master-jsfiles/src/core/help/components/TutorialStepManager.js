/**
 * TutorialStepManager.js
 * チュートリアルステップ管理システム
 * TutorialOverlayから分離されたステップ管理機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { LoggingSystem } from '../../LoggingSystem.js';

export class TutorialStepManager {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // ステップ管理
        this.currentTutorial = null;
        this.currentStep = null;
        this.stepIndex = 0;
        this.totalSteps = 0;
        this.completedSteps = new Set();
        
        // ステップ定義
        this.stepDefinitions = new Map();
        this.stepValidators = new Map();
        this.stepCallbacks = new Map();
        
        // 進捗管理
        this.progressData = {
            startTime: null,
            stepStartTime: null,
            stepDurations: [],
            totalDuration: 0,
            skippedSteps: new Set(),
            failedValidations: []
        };
        
        // 設定
        this.config = {
            allowSkipping: true,
            allowBackNavigation: true,
            autoAdvance: false,
            autoAdvanceDelay: 3000,
            validateOnAdvance: true,
            saveProgress: true,
            maxRetries: 3
        };
    }
    
    /**
     * チュートリアルを開始
     * @param {Object} tutorial - チュートリアル定義
     */
    startTutorial(tutorial) {
        try {
            this.currentTutorial = tutorial;
            this.stepIndex = 0;
            this.totalSteps = tutorial.steps ? tutorial.steps.length : 0;
            this.completedSteps.clear();
            
            this.progressData = {
                startTime: Date.now(),
                stepStartTime: Date.now(),
                stepDurations: [],
                totalDuration: 0,
                skippedSteps: new Set(),
                failedValidations: []
            };
            
            // ステップ定義を登録
            this.registerStepDefinitions(tutorial.steps);
            
            // 最初のステップを読み込み
            this.loadStep(0);
            
            this.loggingSystem.info('TutorialStepManager', `Tutorial started: ${tutorial.id}, ${this.totalSteps} steps`);
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.startTutorial');
            return false;
        }
    }
    
    /**
     * ステップ定義を登録
     * @param {Array} steps - ステップ配列
     */
    registerStepDefinitions(steps) {
        if (!Array.isArray(steps)) return;
        
        steps.forEach((step, index) => {
            this.stepDefinitions.set(index, step);
            
            // バリデーター登録
            if (step.validator) {
                this.stepValidators.set(index, step.validator);
            }
            
            // コールバック登録
            if (step.onComplete) {
                this.stepCallbacks.set(index, step.onComplete);
            }
        });
    }
    
    /**
     * 指定されたステップを読み込み
     * @param {number} index - ステップインデックス
     */
    loadStep(index) {
        try {
            if (index < 0 || index >= this.totalSteps) {
                throw new Error(`Invalid step index: ${index}`);
            }
            
            // 前のステップの記録
            if (this.currentStep && this.progressData.stepStartTime) {
                const stepDuration = Date.now() - this.progressData.stepStartTime;
                this.progressData.stepDurations[this.stepIndex] = stepDuration;
            }
            
            this.stepIndex = index;
            this.currentStep = this.stepDefinitions.get(index);
            this.progressData.stepStartTime = Date.now();
            
            if (!this.currentStep) {
                throw new Error(`Step definition not found for index: ${index}`);
            }
            
            this.loggingSystem.debug('TutorialStepManager', `Step loaded: ${index + 1}/${this.totalSteps}`);
            
            return this.currentStep;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.loadStep');
            return null;
        }
    }
    
    /**
     * 次のステップに進む
     */
    async nextStep() {
        try {
            // 現在のステップのバリデーション
            if (this.config.validateOnAdvance && !await this.validateCurrentStep()) {
                return false;
            }
            
            // 現在のステップを完了としてマーク
            this.completeCurrentStep();
            
            // 次のステップが存在するかチェック
            if (this.stepIndex + 1 >= this.totalSteps) {
                this.completeTutorial();
                return true;
            }
            
            // 次のステップを読み込み
            this.loadStep(this.stepIndex + 1);
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.nextStep');
            return false;
        }
    }
    
    /**
     * 前のステップに戻る
     */
    previousStep() {
        try {
            if (!this.config.allowBackNavigation) {
                this.loggingSystem.warn('TutorialStepManager', 'Back navigation is disabled');
                return false;
            }
            
            if (this.stepIndex <= 0) {
                this.loggingSystem.debug('TutorialStepManager', 'Already at first step');
                return false;
            }
            
            // 前のステップを読み込み
            this.loadStep(this.stepIndex - 1);
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.previousStep');
            return false;
        }
    }
    
    /**
     * 指定されたステップにジャンプ
     * @param {number} index - ステップインデックス
     */
    jumpToStep(index) {
        try {
            if (index < 0 || index >= this.totalSteps) {
                throw new Error(`Invalid step index: ${index}`);
            }
            
            this.loadStep(index);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.jumpToStep');
            return false;
        }
    }
    
    /**
     * 現在のステップをスキップ
     */
    skipCurrentStep() {
        try {
            if (!this.config.allowSkipping) {
                this.loggingSystem.warn('TutorialStepManager', 'Skipping is disabled');
                return false;
            }
            
            this.progressData.skippedSteps.add(this.stepIndex);
            this.loggingSystem.debug('TutorialStepManager', `Step skipped: ${this.stepIndex + 1}`);
            
            return this.nextStep();
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.skipCurrentStep');
            return false;
        }
    }
    
    /**
     * 現在のステップを完了
     */
    completeCurrentStep() {
        try {
            this.completedSteps.add(this.stepIndex);
            
            // コールバック実行
            const callback = this.stepCallbacks.get(this.stepIndex);
            if (callback && typeof callback === 'function') {
                callback(this.currentStep, this.stepIndex);
            }
            
            this.loggingSystem.debug('TutorialStepManager', `Step completed: ${this.stepIndex + 1}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.completeCurrentStep');
        }
    }
    
    /**
     * 現在のステップをバリデート
     */
    async validateCurrentStep() {
        try {
            const validator = this.stepValidators.get(this.stepIndex);
            if (!validator || typeof validator !== 'function') {
                return true; // バリデーターがない場合は成功とみなす
            }
            
            const result = await validator(this.currentStep, this.stepIndex);
            
            if (!result) {
                this.progressData.failedValidations.push({
                    stepIndex: this.stepIndex,
                    timestamp: Date.now()
                });
            }
            
            return result;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.validateCurrentStep');
            return false;
        }
    }
    
    /**
     * チュートリアルを完了
     */
    completeTutorial() {
        try {
            this.progressData.totalDuration = Date.now() - this.progressData.startTime;
            
            this.loggingSystem.info('TutorialStepManager', 'Tutorial completed', {
                tutorial: this.currentTutorial?.id,
                totalSteps: this.totalSteps,
                completedSteps: this.completedSteps.size,
                skippedSteps: this.progressData.skippedSteps.size,
                totalDuration: this.progressData.totalDuration
            });
            
            // 進捗保存
            if (this.config.saveProgress) {
                this.saveProgress();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.completeTutorial');
        }
    }
    
    /**
     * 進捗を保存
     */
    saveProgress() {
        try {
            const progressKey = `tutorial_progress_${this.currentTutorial?.id}`;
            const progressData = {
                tutorialId: this.currentTutorial?.id,
                completedSteps: Array.from(this.completedSteps),
                skippedSteps: Array.from(this.progressData.skippedSteps),
                totalDuration: this.progressData.totalDuration,
                stepDurations: this.progressData.stepDurations,
                completedAt: Date.now()
            };
            
            localStorage.setItem(progressKey, JSON.stringify(progressData));
            this.loggingSystem.debug('TutorialStepManager', 'Progress saved');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.saveProgress');
        }
    }
    
    /**
     * 進捗を読み込み
     * @param {string} tutorialId - チュートリアルID
     */
    loadProgress(tutorialId) {
        try {
            const progressKey = `tutorial_progress_${tutorialId}`;
            const savedProgress = localStorage.getItem(progressKey);
            
            if (!savedProgress) return null;
            
            return JSON.parse(savedProgress);
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialStepManager.loadProgress');
            return null;
        }
    }
    
    /**
     * 現在の進捗情報を取得
     */
    getProgress() {
        return {
            currentStep: this.stepIndex + 1,
            totalSteps: this.totalSteps,
            completedSteps: this.completedSteps.size,
            skippedSteps: this.progressData.skippedSteps.size,
            progress: this.totalSteps > 0 ? (this.stepIndex + 1) / this.totalSteps : 0,
            tutorialId: this.currentTutorial?.id,
            stepTitle: this.currentStep?.title,
            stepDescription: this.currentStep?.description,
            canGoNext: this.stepIndex + 1 < this.totalSteps,
            canGoPrevious: this.stepIndex > 0 && this.config.allowBackNavigation,
            canSkip: this.config.allowSkipping
        };
    }
    
    /**
     * ステップ統計を取得
     */
    getStepStatistics() {
        return {
            averageStepDuration: this.progressData.stepDurations.length > 0 ? 
                this.progressData.stepDurations.reduce((sum, duration) => sum + duration, 0) / this.progressData.stepDurations.length : 0,
            longestStep: Math.max(...this.progressData.stepDurations, 0),
            shortestStep: this.progressData.stepDurations.length > 0 ? Math.min(...this.progressData.stepDurations) : 0,
            failedValidations: this.progressData.failedValidations.length,
            completionRate: this.totalSteps > 0 ? this.completedSteps.size / this.totalSteps : 0
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.loggingSystem.debug('TutorialStepManager', 'Configuration updated', newConfig);
    }
    
    /**
     * チュートリアルステップマネージャーをリセット
     */
    reset() {
        this.currentTutorial = null;
        this.currentStep = null;
        this.stepIndex = 0;
        this.totalSteps = 0;
        this.completedSteps.clear();
        this.stepDefinitions.clear();
        this.stepValidators.clear();
        this.stepCallbacks.clear();
        
        this.progressData = {
            startTime: null,
            stepStartTime: null,
            stepDurations: [],
            totalDuration: 0,
            skippedSteps: new Set(),
            failedValidations: []
        };
        
        this.loggingSystem.debug('TutorialStepManager', 'Step manager reset');
    }
}