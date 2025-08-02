/**
 * TutorialProgressManager.js
 * チュートリアル進捗管理クラス
 * ユーザー進捗の保存・復元、ツアー進捗追跡、ステップ管理を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * チュートリアル進捗管理クラス
 */
export class TutorialProgressManager {
    constructor(loggingSystem) {
        this.loggingSystem = loggingSystem || LoggingSystem.getInstance();
        
        // ユーザー進捗データ
        this.userProgress = {
            completedTutorials: new Set(),
            currentTutorialId: null,
            currentStepIndex: 0,
            startTime: null,
            pausedTime: null
        };
        
        // ステップ試行回数
        this.stepAttempts = new Map();
        
        // スキップされたステップ
        this.skippedSteps = [];
        
        this.initialize();
    }
    
    /**
     * 進捗管理システムを初期化
     */
    initialize() {
        try {
            this.loadUserProgress();
            this.loggingSystem.log('TutorialProgressManagerが初期化されました', 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`進捗管理初期化エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ユーザー進捗を読み込み
     */
    loadUserProgress() {
        try {
            const saved = localStorage.getItem('awaputi_tutorial_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.userProgress.completedTutorials = new Set(progress.completedTutorials || []);
                this.userProgress.currentTutorialId = progress.currentTutorialId;
                this.userProgress.currentStepIndex = progress.currentStepIndex || 0;
                this.userProgress.startTime = progress.startTime;
                this.userProgress.pausedTime = progress.pausedTime;
            }
        } catch (error) {
            this.loggingSystem.log(`ユーザー進捗読み込みエラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ユーザー進捗を保存
     * @param {Object} currentTutorial - 現在のチュートリアル
     * @param {number} currentStep - 現在のステップ
     */
    saveUserProgress(currentTutorial = null, currentStep = 0) {
        try {
            const progress = {
                completedTutorials: Array.from(this.userProgress.completedTutorials),
                currentTutorialId: this.userProgress.currentTutorialId,
                currentStepIndex: this.userProgress.currentStepIndex,
                startTime: this.userProgress.startTime,
                pausedTime: this.userProgress.pausedTime,
                
                // ガイドツアー専用の進捗情報
                tourProgress: {
                    lastActiveStep: currentStep,
                    stepStartTime: Date.now(),
                    stepAttempts: this.stepAttempts.get(this.userProgress.currentTutorialId) || 0,
                    tourType: currentTutorial?.tourType || null,
                    completedSteps: this.getCompletedStepsForCurrentTour(currentTutorial, currentStep),
                    skippedSteps: this.getSkippedStepsForCurrentTour()
                }
            };
            
            localStorage.setItem('awaputi_tutorial_progress', JSON.stringify(progress));
            
            // ガイドツアー専用の詳細進捗も保存
            if (currentTutorial?.tourType === 'guided_tour') {
                this.saveTourSpecificProgress(currentTutorial, currentStep);
            }
        } catch (error) {
            this.loggingSystem.log(`ユーザー進捗保存エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル開始時の進捗設定
     * @param {string} tutorialId - チュートリアルID
     */
    startTutorial(tutorialId) {
        try {
            this.userProgress.currentTutorialId = tutorialId;
            this.userProgress.currentStepIndex = 0;
            this.userProgress.startTime = Date.now();
            this.userProgress.pausedTime = null;
            
            this.loggingSystem.log(`チュートリアル開始: ${tutorialId}`, 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`チュートリアル開始設定エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル完了
     * @param {string} tutorialId - チュートリアルID
     */
    completeTutorial(tutorialId) {
        try {
            this.userProgress.completedTutorials.add(tutorialId);
            this.userProgress.currentTutorialId = null;
            this.userProgress.currentStepIndex = 0;
            this.userProgress.startTime = null;
            this.userProgress.pausedTime = null;
            
            this.loggingSystem.log(`チュートリアル完了: ${tutorialId}`, 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`チュートリアル完了設定エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル一時停止
     */
    pauseTutorial() {
        try {
            this.userProgress.pausedTime = Date.now();
            this.loggingSystem.log('チュートリアルが一時停止されました', 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`チュートリアル一時停止エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル再開
     */
    resumeTutorial() {
        try {
            this.userProgress.pausedTime = null;
            this.loggingSystem.log('チュートリアルが再開されました', 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`チュートリアル再開エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ステップ進行
     * @param {number} stepIndex - 新しいステップインデックス
     */
    advanceToStep(stepIndex) {
        try {
            this.userProgress.currentStepIndex = stepIndex;
            this.loggingSystem.log(`ステップ${stepIndex}に進行`, 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`ステップ進行エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * 現在のツアーで完了済みのステップを取得
     * @param {Object} currentTutorial - 現在のチュートリアル
     * @param {number} currentStep - 現在のステップ
     * @returns {Array} 完了済みステップのID配列
     */
    getCompletedStepsForCurrentTour(currentTutorial, currentStep = 0) {
        if (!currentTutorial) return [];
        
        const completedSteps = [];
        for (let i = 0; i < currentStep; i++) {
            if (currentTutorial.steps[i]) {
                completedSteps.push(currentTutorial.steps[i].id);
            }
        }
        return completedSteps;
    }
    
    /**
     * 現在のツアーでスキップされたステップを取得
     * @returns {Array} スキップされたステップのID配列
     */
    getSkippedStepsForCurrentTour() {
        return this.skippedSteps || [];
    }
    
    /**
     * ステップをスキップ済みとしてマーク
     * @param {string} stepId - ステップID
     */
    markStepAsSkipped(stepId) {
        try {
            if (!this.skippedSteps.includes(stepId)) {
                this.skippedSteps.push(stepId);
            }
            this.loggingSystem.log(`ステップ${stepId}がスキップされました`, 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`ステップスキップマークエラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ツアー固有の進捗情報を保存
     * @param {Object} currentTutorial - 現在のチュートリアル
     * @param {number} currentStep - 現在のステップ
     */
    saveTourSpecificProgress(currentTutorial, currentStep) {
        try {
            if (!currentTutorial) return;
            
            const tourId = currentTutorial.id;
            const tourProgress = {
                tourId,
                lastAccessTime: Date.now(),
                currentStep: currentStep,
                totalSteps: currentTutorial.steps.length,
                completedSteps: this.getCompletedStepsForCurrentTour(currentTutorial, currentStep),
                
                // ステップ別の詳細情報
                stepDetails: currentTutorial.steps.map((step, index) => ({
                    id: step.id,
                    title: step.title,
                    isCompleted: index < currentStep,
                    isCurrent: index === currentStep,
                    attempts: this.getStepAttempts(tourId, step.id),
                    lastAttemptTime: this.getStepLastAttemptTime(tourId, step.id)
                }))
            };
            
            const storageKey = `awaputi_tour_progress_${tourId}`;
            localStorage.setItem(storageKey, JSON.stringify(tourProgress));
        } catch (error) {
            this.loggingSystem.log(`ツアー進捗保存エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ツアー固有の進捗情報を読み込み
     * @param {string} tourId - ツアーID
     * @returns {Object|null} ツアー進捗情報
     */
    loadTourSpecificProgress(tourId) {
        try {
            const storageKey = `awaputi_tour_progress_${tourId}`;
            const saved = localStorage.getItem(storageKey);
            
            if (saved) {
                const progress = JSON.parse(saved);
                return progress;
            }
            
            return null;
        } catch (error) {
            this.loggingSystem.log(`ツアー進捗読み込みエラー: ${error.message}`, 'error', 'TutorialProgressManager');
            return null;
        }
    }
    
    /**
     * ステップの試行回数を取得
     * @param {string} tourId - ツアーID
     * @param {string} stepId - ステップID
     * @returns {number} 試行回数
     */
    getStepAttempts(tourId, stepId) {
        const stepKey = `${tourId}_${stepId}`;
        return this.stepAttempts.get(stepKey) || 0;
    }
    
    /**
     * ステップの最後の試行時間を取得
     * @param {string} tourId - ツアーID
     * @param {string} stepId - ステップID
     * @returns {number|null} 最後の試行時間
     */
    getStepLastAttemptTime(tourId, stepId) {
        const storageKey = `awaputi_step_attempt_${tourId}_${stepId}`;
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? parseInt(saved) : null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * ステップの試行を記録
     * @param {string} tourId - ツアーID
     * @param {string} stepId - ステップID
     */
    recordStepAttempt(tourId, stepId) {
        try {
            const stepKey = `${tourId}_${stepId}`;
            const currentAttempts = this.stepAttempts.get(stepKey) || 0;
            this.stepAttempts.set(stepKey, currentAttempts + 1);
            
            // 最後の試行時間を保存
            const storageKey = `awaputi_step_attempt_${tourId}_${stepId}`;
            localStorage.setItem(storageKey, Date.now().toString());
            
        } catch (error) {
            this.loggingSystem.log(`ステップ試行記録エラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * 経過時間を取得
     * @returns {number} 経過時間（ミリ秒）
     */
    getElapsedTime() {
        if (!this.userProgress.startTime) return 0;
        
        const now = Date.now();
        const pausedDuration = this.userProgress.pausedTime ? (now - this.userProgress.pausedTime) : 0;
        return now - this.userProgress.startTime - pausedDuration;
    }
    
    /**
     * 進捗情報を取得
     * @returns {Object} 進捗情報
     */
    getProgress() {
        return {
            completedTutorials: Array.from(this.userProgress.completedTutorials),
            currentTutorialId: this.userProgress.currentTutorialId,
            currentStepIndex: this.userProgress.currentStepIndex,
            isRunning: !!this.userProgress.currentTutorialId,
            isPaused: !!this.userProgress.pausedTime,
            elapsedTime: this.getElapsedTime(),
            startTime: this.userProgress.startTime
        };
    }
    
    /**
     * 特定のチュートリアルが完了済みかチェック
     * @param {string} tutorialId - チュートリアルID
     * @returns {boolean} 完了済みフラグ
     */
    isCompleted(tutorialId) {
        return this.userProgress.completedTutorials.has(tutorialId);
    }
    
    /**
     * 現在実行中のチュートリアルがあるかチェック
     * @returns {boolean} 実行中フラグ
     */
    isRunning() {
        return !!this.userProgress.currentTutorialId;
    }
    
    /**
     * チュートリアルが一時停止中かチェック
     * @returns {boolean} 一時停止中フラグ
     */
    isPaused() {
        return !!this.userProgress.pausedTime;
    }
    
    /**
     * 進捗をリセット
     */
    resetProgress() {
        try {
            this.userProgress = {
                completedTutorials: new Set(),
                currentTutorialId: null,
                currentStepIndex: 0,
                startTime: null,
                pausedTime: null
            };
            
            this.stepAttempts.clear();
            this.skippedSteps = [];
            
            localStorage.removeItem('awaputi_tutorial_progress');
            
            this.loggingSystem.log('進捗がリセットされました', 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`進捗リセットエラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy() {
        try {
            // 現在の進捗を保存
            this.saveUserProgress();
            this.loggingSystem.log('TutorialProgressManagerがクリーンアップされました', 'info', 'TutorialProgressManager');
        } catch (error) {
            this.loggingSystem.log(`クリーンアップエラー: ${error.message}`, 'error', 'TutorialProgressManager');
        }
    }
}

// シングルトンインスタンス管理
let tutorialProgressManagerInstance = null;

/**
 * TutorialProgressManagerのシングルトンインスタンスを取得
 * @param {Object} loggingSystem - ロギングシステム
 * @returns {TutorialProgressManager} シングルトンインスタンス
 */
export function getTutorialProgressManager(loggingSystem) {
    if (!tutorialProgressManagerInstance) {
        tutorialProgressManagerInstance = new TutorialProgressManager(loggingSystem);
    }
    return tutorialProgressManagerInstance;
}

/**
 * TutorialProgressManagerのシングルトンインスタンスを再初期化
 * @param {Object} loggingSystem - ロギングシステム
 * @returns {TutorialProgressManager} 新しいシングルトンインスタンス
 */
export function reinitializeTutorialProgressManager(loggingSystem) {
    if (tutorialProgressManagerInstance) {
        tutorialProgressManagerInstance.destroy();
    }
    tutorialProgressManagerInstance = new TutorialProgressManager(loggingSystem);
    return tutorialProgressManagerInstance;
}

export default TutorialProgressManager;