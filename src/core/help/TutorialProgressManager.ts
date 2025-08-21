/**
 * TutorialProgressManager.ts
 * チュートリアル進捗管理クラス
 * ユーザー進捗の保存・復元、ツアー進捗追跡、ステップ管理を担当
 */

import { ErrorHandler  } from '../../utils/ErrorHandler.js';
import { LoggingSystem  } from '../LoggingSystem.js';

// 型定義
export interface UserProgress { completedTutorials: Set<string>,
    currentTutorialId: string | null;
    currentStepIndex: number;
    startTime: number | null;
    pausedTime: number | null  }

export interface TourProgress { lastActiveStep: number,
    stepStartTime: number;
    stepAttempts: number;
    tourType: string | null;
    completedSteps: string[];
    skippedSteps: string[];

export interface SavedProgress { completedTutorials: string[],
    currentTutorialId: string | null;
    currentStepIndex: number;
    startTime: number | null;
    pausedTime: number | null;
    tourProgress: TourProgress;

export interface TutorialStep { id: string,
    title?: string;
    content?: string;
    [key: string]: any;

export interface Tutorial { id: string,
    tourType?: string;
    steps: TutorialStep[];
    [key: string]: any;

export interface TourSpecificProgress { tourId: string,
    lastAccessTime: number;
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    stepDetails: StepDetail[];

export interface StepDetail { id: string,
    title?: string;
    isCompleted: boolean;
    isCurrent: boolean;
    attempts: number;
    lastAttemptTime: number | null }

export interface ProgressInfo { completedTutorials: string[],
    currentTutorialId: string | null;
    currentStepIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    elapsedTime: number;
    startTime: number | null }

export interface ProgressStatistics { totalCompletedTutorials: number,
    totalStepsCompleted: number;
    totalTimeSpent: number;
    averageTimePerTutorial: number;
    mostRecentCompletion: number | null;
    completionRate: number;

export interface StepAttemptData { stepKey: string,
    attempts: number;
    lastAttemptTime: number | null }

/**
 * チュートリアル進捗管理クラス
 */
export class TutorialProgressManager {
    private loggingSystem: LoggingSystem;
    // ユーザー進捗データ
    private userProgress: UserProgress;
    // ステップ試行回数
    private, stepAttempts: Map<string, number>,
    
    // スキップされたステップ
    private skippedSteps: string[];
    constructor(loggingSystem?: LoggingSystem | null) {

        this.loggingSystem = loggingSystem || (LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // ユーザー進捗データ
        this.userProgress = {
            completedTutorials: new Set<string>(),
            currentTutorialId: null,
            currentStepIndex: 0,
            startTime: null,
            pausedTime: null,;
        // ステップ試行回数
        this.stepAttempts = new Map<string, number>();
        
        // スキップされたステップ
        this.skippedSteps = [];
        
        this.initialize();
    }
    
    /**
     * 進捗管理システムを初期化
     */
    private initialize(): void { try {'
            this.loadUserProgress()','
            this.loggingSystem.log('TutorialProgressManagerが初期化されました', 'info', 'TutorialProgressManager) }'

        } catch (error) { }

            this.loggingSystem.log(`進捗管理初期化エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ユーザー進捗を読み込み'
     */''
    private loadUserProgress()';'
            const saved = localStorage.getItem('awaputi_tutorial_progress);'
            if (saved) {
                const progress: SavedProgress = JSON.parse(saved,
                this.userProgress.completedTutorials = new Set(progress.completedTutorials || []),
                this.userProgress.currentTutorialId = progress.currentTutorialId || null,
                this.userProgress.currentStepIndex = progress.currentStepIndex || 0,
                this.userProgress.startTime = progress.startTime || null }
                this.userProgress.pausedTime = progress.pausedTime || null; }

            } catch (error) { }

            this.loggingSystem.log(`ユーザー進捗読み込みエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ユーザー進捗を保存
     * @param currentTutorial - 現在のチュートリアル
     * @param currentStep - 現在のステップ
     */
    saveUserProgress(currentTutorial?: Tutorial | null, currentStep: number = 0): void { try {
            const progress: SavedProgress = {
                completedTutorials: Array.from(this.userProgress.completedTutorials),
                currentTutorialId: this.userProgress.currentTutorialId,
                currentStepIndex: this.userProgress.currentStepIndex,
                startTime: this.userProgress.startTime,
                pausedTime: this.userProgress.pausedTime,
                // ガイドツアー専用の進捗情報
               , tourProgress: {
                    lastActiveStep: currentStep,
                    stepStartTime: Date.now()','
                    stepAttempts: this.stepAttempts.get(this.userProgress.currentTutorialId || ') || 0,'
    tourType: currentTutorial?.tourType || null, : undefined','
                    completedSteps: this.getCompletedStepsForCurrentTour(currentTutorial, currentStep),
                    skippedSteps: this.getSkippedStepsForCurrentTour()','
            localStorage.setItem('awaputi_tutorial_progress', JSON.stringify(progress)),
            ','
            // ガイドツアー専用の詳細進捗も保存
            if(currentTutorial?.tourType === 'guided_tour' { }
                this.saveTourSpecificProgress(currentTutorial, currentStep); }

            } catch (error) { : undefined', '
            this.loggingSystem.log(`ユーザー進捗保存エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル開始時の進捗設定
     * @param tutorialId - チュートリアルID
     */
    startTutorial(tutorialId: string): void { try {
            this.userProgress.currentTutorialId = tutorialId,
            this.userProgress.currentStepIndex = 0,
            this.userProgress.startTime = Date.now(),
            this.userProgress.pausedTime = null,

            ' }'

            this.loggingSystem.log(`チュートリアル開始: ${tutorialId}`, 'info', 'TutorialProgressManager'});

        } catch (error) { }

            this.loggingSystem.log(`チュートリアル開始設定エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル完了
     * @param tutorialId - チュートリアルID
     */
    completeTutorial(tutorialId: string): void { try {
            this.userProgress.completedTutorials.add(tutorialId),
            this.userProgress.currentTutorialId = null,
            this.userProgress.currentStepIndex = 0,
            this.userProgress.startTime = null,
            this.userProgress.pausedTime = null,

            ' }'

            this.loggingSystem.log(`チュートリアル完了: ${tutorialId}`, 'info', 'TutorialProgressManager'});

        } catch (error) { }

            this.loggingSystem.log(`チュートリアル完了設定エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル一時停止
     */'
    pauseTutorial(): void { try {'
            this.userProgress.pausedTime = Date.now()','
            this.loggingSystem.log('チュートリアルが一時停止されました', 'info', 'TutorialProgressManager) }'

        } catch (error) { }

            this.loggingSystem.log(`チュートリアル一時停止エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * チュートリアル再開'
     */''
    resumeTutorial()';'
            this.loggingSystem.log('チュートリアルが再開されました', 'info', 'TutorialProgressManager);'

        } catch (error) { }

            this.loggingSystem.log(`チュートリアル再開エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ステップ進行
     * @param stepIndex - 新しいステップインデックス
     */
    advanceToStep(stepIndex: number): void { try {
            this.userProgress.currentStepIndex = stepIndex,' }'

            this.loggingSystem.log(`ステップ${stepIndex}に進行`, 'info', 'TutorialProgressManager'});

        } catch (error) { }

            this.loggingSystem.log(`ステップ進行エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * 現在のツアーで完了済みのステップを取得
     * @param currentTutorial - 現在のチュートリアル
     * @param currentStep - 現在のステップ
     * @returns 完了済みステップのID配列
     */
    getCompletedStepsForCurrentTour(currentTutorial?: Tutorial | null, currentStep: number = 0): string[] { if (!currentTutorial) return [],
        
        const completedSteps: string[] = [],
        for(let, i = 0, i < currentStep, i++) {
            if (currentTutorial.steps[i]) {
        }
                completedSteps.push(currentTutorial.steps[i].id); }
}
        return completedSteps;
    }
    
    /**
     * 現在のツアーでスキップされたステップを取得
     * @returns スキップされたステップのID配列
     */
    getSkippedStepsForCurrentTour(): string[] { return this.skippedSteps || [] }
    
    /**
     * ステップをスキップ済みとしてマーク
     * @param stepId - ステップID
     */
    markStepAsSkipped(stepId: string): void { try {
            if (!this.skippedSteps.includes(stepId) {
    
}
                this.skippedSteps.push(stepId); }

            }''
            this.loggingSystem.log(`ステップ${stepId}がスキップされました`, 'info', 'TutorialProgressManager'});

        } catch (error) { }

            this.loggingSystem.log(`ステップスキップマークエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ツアー固有の進捗情報を保存
     * @param currentTutorial - 現在のチュートリアル
     * @param currentStep - 現在のステップ
     */
    saveTourSpecificProgress(currentTutorial: Tutorial, currentStep: number): void { try {
            if (!currentTutorial) return,
            
            const tourId = currentTutorial.id,
            const tourProgress: TourSpecificProgress = {
                tourId,
                lastAccessTime: Date.now(),
                currentStep: currentStep,
                totalSteps: currentTutorial.steps.length,
    completedSteps: this.getCompletedStepsForCurrentTour(currentTutorial, currentStep),
                
                // ステップ別の詳細情報
                stepDetails: currentTutorial.steps.map((step: TutorialStep, index: number): StepDetail => ({
                    id: step.id,
                    title: step.title,
                    isCompleted: index < currentStep,
                    isCurrent: index === currentStep),
                    attempts: this.getStepAttempts(tourId, step.id),
                    lastAttemptTime: this.getStepLastAttemptTime(tourId, step.id) }
                });
            };
            
            const storageKey = `awaputi_tour_progress_${tourId}`;
            localStorage.setItem(storageKey, JSON.stringify(tourProgress);
        } catch (error) { }

            this.loggingSystem.log(`ツアー進捗保存エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ツアー固有の進捗情報を読み込み
     * @param tourId - ツアーID
     * @returns ツアー進捗情報
     */
    loadTourSpecificProgress(tourId: string): TourSpecificProgress | null { try { }
            const storageKey = `awaputi_tour_progress_${tourId}`;
            const saved = localStorage.getItem(storageKey);
            
            if (saved) { const progress: TourSpecificProgress = JSON.parse(saved }
                return, progress;
            
            return, null;

        } catch (error) { }

            this.loggingSystem.log(`ツアー進捗読み込みエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
            return null;
    
    /**
     * ステップの試行回数を取得
     * @param tourId - ツアーID
     * @param stepId - ステップID
     * @returns 試行回数
     */
    getStepAttempts(tourId: string, stepId: string): number {
        const stepKey = `${tourId}_${stepId}`;
        return this.stepAttempts.get(stepKey) || 0;
    }
    
    /**
     * ステップの最後の試行時間を取得
     * @param tourId - ツアーID
     * @param stepId - ステップID
     * @returns 最後の試行時間
     */
    getStepLastAttemptTime(tourId: string, stepId: string): number | null {
        const storageKey = `awaputi_step_attempt_${tourId}_${stepId}`;
        try { const saved = localStorage.getItem(storageKey),
            return saved ? parseInt(saved, 10) : null; catch (error) { return null,
    
    /**
     * ステップの試行を記録
     * @param tourId - ツアーID
     * @param stepId - ステップID
     */
    recordStepAttempt(tourId: string, stepId: string): void { try {  }
            const stepKey = `${tourId}_${stepId}`;
            const currentAttempts = this.stepAttempts.get(stepKey) || 0;
            this.stepAttempts.set(stepKey, currentAttempts + 1);
            
            // 最後の試行時間を保存
            const storageKey = `awaputi_step_attempt_${tourId}_${stepId}`;
            localStorage.setItem(storageKey, Date.now().toString();
            ';'

        } catch (error) { }

            this.loggingSystem.log(`ステップ試行記録エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * 経過時間を取得
     * @returns 経過時間（ミリ秒）
     */
    getElapsedTime(): number { if (!this.userProgress.startTime) return 0,
        
        const now = Date.now(),
        const pausedDuration = this.userProgress.pausedTime ? (now - this.userProgress.pausedTime) : 0,
        return now - this.userProgress.startTime - pausedDuration }
    
    /**
     * 進捗情報を取得
     * @returns 進捗情報
     */
    getProgress(): ProgressInfo { return { completedTutorials: Array.from(this.userProgress.completedTutorials,
            currentTutorialId: this.userProgress.currentTutorialId,
            currentStepIndex: this.userProgress.currentStepIndex,
            isRunning: !!this.userProgress.currentTutorialId,
            isPaused: !!this.userProgress.pausedTime,
    elapsedTime: this.getElapsedTime() };
            startTime: this.userProgress.startTime 
    }
    
    /**
     * 特定のチュートリアルが完了済みかチェック
     * @param tutorialId - チュートリアルID
     * @returns 完了済みフラグ
     */
    isCompleted(tutorialId: string): boolean { return this.userProgress.completedTutorials.has(tutorialId) }
    
    /**
     * 現在実行中のチュートリアルがあるかチェック
     * @returns 実行中フラグ
     */
    isRunning(): boolean { return !!this.userProgress.currentTutorialId }
    
    /**
     * チュートリアルが一時停止中かチェック
     * @returns 一時停止中フラグ
     */
    isPaused(): boolean { return !!this.userProgress.pausedTime }
    
    /**
     * 現在のチュートリアルIDを取得
     * @returns 現在のチュートリアルID
     */
    getCurrentTutorialId(): string | null { return this.userProgress.currentTutorialId }
    
    /**
     * 現在のステップインデックスを取得
     * @returns 現在のステップインデックス
     */
    getCurrentStepIndex(): number { return this.userProgress.currentStepIndex }
    
    /**
     * 完了済みチュートリアルの一覧を取得
     * @returns 完了済みチュートリアルのID配列
     */
    getCompletedTutorials(): string[] { return Array.from(this.userProgress.completedTutorials) }
    
    /**
     * 開始時間を取得
     * @returns 開始時間（タイムスタンプ）
     */
    getStartTime(): number | null { return this.userProgress.startTime }
    
    /**
     * 一時停止時間を取得
     * @returns 一時停止時間（タイムスタンプ）
     */
    getPausedTime(): number | null { return this.userProgress.pausedTime }
    
    /**
     * 進捗統計情報を取得
     * @returns 進捗統計情報
     */
    getProgressStatistics(): ProgressStatistics { const completedTutorials = Array.from(this.userProgress.completedTutorials),
        const totalCompleted = completedTutorials.length,
        
        // 各チュートリアルの統計を集計
        let totalStepsCompleted = 0,
        let totalTimeSpent = 0,
        let mostRecentCompletion: number | null = null,
        
        completedTutorials.forEach(tutorialId => { ),
            const tourProgress = this.loadTourSpecificProgress(tutorialId),
            if (tourProgress) {
                totalStepsCompleted += tourProgress.completedSteps.length }
                if (!mostRecentCompletion || tourProgress.lastAccessTime > mostRecentCompletion) { }
                    mostRecentCompletion = tourProgress.lastAccessTime; }
}
        });
        
        // 現在のチュートリアルの経過時間を追加
        if (this.isRunning() { totalTimeSpent += this.getElapsedTime() }
        
        return { totalCompletedTutorials: totalCompleted,
            totalStepsCompleted,
            totalTimeSpent,
            averageTimePerTutorial: totalCompleted > 0 ? totalTimeSpent / totalCompleted : 0,
            mostRecentCompletion };
            completionRate: 0 // 全体のチュートリアル数がわからないため、外部で計算が必要 
    }
    
    /**
     * 全ステップ試行データを取得
     * @returns ステップ試行データの配列
     */
    getAllStepAttempts(): StepAttemptData[] { const attempts: StepAttemptData[] = [],

        this.stepAttempts.forEach((attemptCount, stepKey) => { ''
            const [tourId, stepId] = stepKey.split('_', 2),
            attempts.push({)
                stepKey),
                attempts: attemptCount) }
                lastAttemptTime: this.getStepLastAttemptTime(tourId, stepId); }
            });
        });
        
        return attempts;
    }
    
    /**
     * 特定ツアーのステップ試行データを取得
     * @param tourId - ツアーID
     * @returns ステップ試行データの配列
     */
    getTourStepAttempts(tourId: string): StepAttemptData[] { const attempts: StepAttemptData[] = [],
        
        this.stepAttempts.forEach((attemptCount, stepKey) => { }
            if (stepKey.startsWith(`${tourId}_`) {
                const stepId = stepKey.substring(tourId.length + 1),
                attempts.push({)
                    stepKey),
                    attempts: attemptCount) }
                    lastAttemptTime: this.getStepLastAttemptTime(tourId, stepId); }
                });
            }
        });
        
        return attempts;
    }
    
    /**
     * スキップされたステップのリストを取得
     * @returns スキップされたステップのID配列
     */
    getSkippedSteps(): string[] { return [...this.skippedSteps],
    
    /**
     * 特定のステップがスキップされているかチェック
     * @param stepId - ステップID
     * @returns スキップ済みフラグ
     */
    isStepSkipped(stepId: string): boolean { return this.skippedSteps.includes(stepId) }
    
    /**
     * 進捗をリセット
     */
    resetProgress(): void { try {
            this.userProgress = {
                completedTutorials: new Set<string>(),
                currentTutorialId: null,
                currentStepIndex: 0,
                startTime: null,
                pausedTime: null,;
            this.stepAttempts.clear()';'
            localStorage.removeItem('awaputi_tutorial_progress');

            this.loggingSystem.log('進捗がリセットされました', 'info', 'TutorialProgressManager);'

        } catch (error) { }

            this.loggingSystem.log(`進捗リセットエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * 特定のチュートリアルの進捗をリセット
     * @param tutorialId - チュートリアルID
     */
    resetTutorialProgress(tutorialId: string): void { try {
            // 完了済みリストから削除
            this.userProgress.completedTutorials.delete(tutorialId),
            
            // 現在のチュートリアルの場合は停止
            if (this.userProgress.currentTutorialId === tutorialId) {
                this.userProgress.currentTutorialId = null,
                this.userProgress.currentStepIndex = 0,
                this.userProgress.startTime = null }
                this.userProgress.pausedTime = null; }
            }
            
            // ステップ試行回数をクリア
            const keysToDelete: string[] = [],
            this.stepAttempts.forEach((_, key) => {  }
                if (key.startsWith(`${tutorialId}_`) { keysToDelete.push(key) }
            });
            keysToDelete.forEach(key => this.stepAttempts.delete(key);
            
            // ツアー固有の進捗データを削除
            const tourStorageKey = `awaputi_tour_progress_${tutorialId}`;
            localStorage.removeItem(tourStorageKey);
            
            // ステップ試行時間データを削除
            for(let, i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i) }
                if (key?.startsWith(`awaputi_step_attempt_${ tutorialId}_` } { }
                    localStorage.removeItem(key});
                }
            }

            this.loggingSystem.log(`チュートリアル${tutorialId}の進捗がリセットされました`, 'info', 'TutorialProgressManager'});

        } catch (error) { : undefined', '
            this.loggingSystem.log(`チュートリアル進捗リセットエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * ローカルストレージの全チュートリアルデータをクリア
     */
    clearAllTutorialData(): void { try {
            // 全進捗データをリセット
            this.resetProgress(),
            
            // ローカルストレージから全関連データを削除
            const keysToRemove: string[] = [],
            for(let, i = 0, i < localStorage.length, i++) {

                const key = localStorage.key(i),

                if (key && (','
                    key.startsWith('awaputi_tutorial_') ||','
                    key.startsWith('awaputi_tour_progress_') ||','
                    key.startsWith('awaputi_step_attempt_' { }
                    keysToRemove.push(key); }
}

            keysToRemove.forEach(key => localStorage.removeItem(key));

            this.loggingSystem.log('全チュートリアルデータがクリアされました', 'info', 'TutorialProgressManager);'

        } catch (error) { }

            this.loggingSystem.log(`チュートリアルデータクリアエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy(): void { try {
            // 現在の進捗を保存
            this.saveUserProgress()','
            this.loggingSystem.log('TutorialProgressManagerがクリーンアップされました', 'info', 'TutorialProgressManager) }'

        } catch (error) { }

            this.loggingSystem.log(`クリーンアップエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialProgressManager');
        }
}

// シングルトンインスタンス管理
let tutorialProgressManagerInstance: TutorialProgressManager | null = null,

/**
 * TutorialProgressManagerのシングルトンインスタンスを取得
 * @param loggingSystem - ロギングシステム
 * @returns シングルトンインスタンス
 */
export function getTutorialProgressManager(loggingSystem?: LoggingSystem | null): TutorialProgressManager { if (!tutorialProgressManagerInstance) {
        tutorialProgressManagerInstance = new TutorialProgressManager(loggingSystem) }
    return tutorialProgressManagerInstance;
}

/**
 * TutorialProgressManagerのシングルトンインスタンスを再初期化
 * @param loggingSystem - ロギングシステム
 * @returns 新しいシングルトンインスタンス
 */
export function reinitializeTutorialProgressManager(loggingSystem?: LoggingSystem | null): TutorialProgressManager { if (tutorialProgressManagerInstance) {
        tutorialProgressManagerInstance.destroy() }''
    tutorialProgressManagerInstance = new TutorialProgressManager(loggingSystem);
    return tutorialProgressManagerInstance;
}

export default TutorialProgressManager;