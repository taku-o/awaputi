/**
 * TutorialStatsManager.ts
 * チュートリアル統計管理クラス
 * 統計収集、データ分析、進捗詳細、パフォーマンス測定を担当
 */

import { ErrorHandler  } from '../../utils/ErrorHandler.js';
import { LoggingSystem  } from '../LoggingSystem.js';

// 型定義
export interface TutorialStepData { id: string;
    title?: string;
    estimatedTime?: number;
    export interface TutorialData { title: string,
    steps: TutorialStepData[];
    prerequisites?: string[];
    difficulty?: DifficultyLevel;
     };
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TutorialStatsData { totalTime: number,
    averageStepTime: Map<string, number>;
    skipCount: Map<string, number>;
    failureCount: Map<string, number>;
    attemptCount: Map<string, number>;
    completionRate: number,
    lastUpdated: number;
    export interface SerializedTutorialStatsData { totalTime: number,
    averageStepTime: Array<[string, number]>;
    skipCount: Array<[string, number]>;
    failureCount: Array<[string, number]>;
    attemptCount: Array<[string, number]>;
    completionRate: number,
    lastUpdated: number;
    export interface TutorialStatistics { totalTutorials: number,
    completedTutorials: number,
    completionRate: number,
    totalTime: number,
    averageStepTimes: Record<string, number>;
    skipCounts: Record<string, number>;
    lastUpdated: number,
    currentTutorial: string | null,
    isRunning: boolean;
    export interface StepStatistics { index: number,
    title: string,
    averageTime: number,
    skipCount: number,
    failureCount: number,
    successRate: number;
    export interface TutorialProgressDetails { tutorialId: string,
    title: string,
    totalSteps: number,
    currentStep: number,
    isCompleted: boolean,
    isRunning: boolean,
    isPaused: boolean,
    completionRate: number,
    estimatedTimeRemaining: number,
    stepStatistics: Record<string, StepStatistics>;
    lastAttempt: LastAttemptInfo;
    prerequisites?: string[];
    difficulty: DifficultyLevel;
    export interface LastAttemptInfo { timestamp: number,
    tutorialId: string,
    totalAttempts: number;
    export type TutorialAction = 'start' | 'complete' | 'skip' | 'fail';

/**
 * チュートリアル統計管理クラス
 */
export class TutorialStatsManager {
    private loggingSystem: LoggingSystem;
    private, stats: TutorialStatsData;
    constructor(loggingSystem?: LoggingSystem) {

        this.loggingSystem = loggingSystem || LoggingSystem.getInstance();
        
        // チュートリアル統計
        this.stats = {
            totalTime: 0,
    averageStepTime: new Map<string, number>();
    skipCount: new Map<string, number>();
    failureCount: new Map<string, number>();
    attemptCount: new Map<string, number>();
    completionRate: 0 };
            lastUpdated: Date.now(); 
    };
        
        this.initialize();
    }
    
    /**
     * 統計管理システムを初期化
     */
    initialize(): void { try {'
            this.loadStats()','
            this.loggingSystem.log('TutorialStatsManagerが初期化されました', 'info', 'TutorialStatsManager) }'

        } catch (error) { }

            this.loggingSystem.log(`統計管理初期化エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * 統計データを読み込み'
     */''
    loadStats()';'
            const saved = localStorage.getItem('awaputi_tutorial_stats);'
            if (saved) {
                const stats: SerializedTutorialStatsData = JSON.parse(saved,
                this.stats = {
                    totalTime: stats.totalTime || 0,
    averageStepTime: new Map<string, number>(stats.averageStepTime || []);
                    skipCount: new Map<string, number>(stats.skipCount || []),
                    failureCount: new Map<string, number>(stats.failureCount || []),
                    attemptCount: new Map<string, number>(stats.attemptCount || []),
                    completionRate: stats.completionRate || 0 }
                    lastUpdated: stats.lastUpdated || Date.now(); 
    } catch (error) { }

            this.loggingSystem.log(`統計読み込みエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * 統計データを保存
     */
    saveStats(): void { try {
            const stats: SerializedTutorialStatsData = {
                totalTime: this.stats.totalTime,
                averageStepTime: Array.from(this.stats.averageStepTime.entries())),
                skipCount: Array.from(this.stats.skipCount.entries())),
                failureCount: Array.from(this.stats.failureCount.entries(
    attemptCount: Array.from(this.stats.attemptCount.entries(
                completionRate: this.stats.completionRate,
                lastUpdated: Date.now()))','
            localStorage.setItem('awaputi_tutorial_stats', JSON.stringify(stats);
            this.stats.lastUpdated = Date.now();

        } catch (error) { }

            this.loggingSystem.log(`統計保存エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * ステップ統計を更新
     * @param stepId - ステップID
     * @param tutorialId - チュートリアルID
     * @param duration - 所要時間
     * @param success - 成功フラグ
     * @param skipped - スキップフラグ
     */
    updateStepStats(stepId: string, tutorialId: string, duration: number, success: boolean = true, skipped: boolean = false): void { try {
            if (!tutorialId || !stepId) return }
            const stepKey = `${tutorialId}_${stepId}`;
            
            // 平均時間の更新
            const currentAvg = this.stats.averageStepTime.get(stepKey) || 0;
            const newAvg = currentAvg > 0 ? (currentAvg + duration) / 2 : duration;
            this.stats.averageStepTime.set(stepKey, newAvg);
            
            // 試行回数の更新
            const currentAttempts = this.stats.attemptCount.get(stepKey) || 0;
            this.stats.attemptCount.set(stepKey, currentAttempts + 1);
            
            // スキップ回数の更新
            if (skipped) {
                const currentSkips = this.stats.skipCount.get(stepKey) || 0 }
                this.stats.skipCount.set(stepKey, currentSkips + 1); }
            }
            
            // 失敗回数の更新
            if (!success) {
                const currentFailures = this.stats.failureCount.get(stepKey) || 0 }
                this.stats.failureCount.set(stepKey, currentFailures + 1); }
            }
            
            this.stats.totalTime += duration;
            
            // 統計の自動保存（5分間隔）
            const now = Date.now();
            if (now - this.stats.lastUpdated > 300000) {
                // 5分
            }
                this.saveStats(); }
        } catch (error) { }

            this.loggingSystem.log(`ステップ統計更新エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * チュートリアル統計を取得
     * @param tutorialData - チュートリアルデータ
     * @param completedTutorials - 完了済みチュートリアル
     * @param currentTutorialId - 現在のチュートリアルID
     * @param currentTutorial - 現在のチュートリアル
     * @returns 統計情報
     */
    getTutorialStatistics(;
        tutorialData: Map<string, TutorialData>, ;
        completedTutorials: Set<string>
    ),
        currentTutorialId: string | null),
        currentTutorial: TutorialData | null,
    ): TutorialStatistics { try {
            const totalTutorials = tutorialData.size,
            const completedCount = completedTutorials.size,
            const completionRate = totalTutorials > 0 ? (completedCount / totalTutorials) * 100 : 0,
            
            return { totalTutorials,
                completedTutorials: completedCount,
                completionRate,
                totalTime: this.stats.totalTime,
                averageStepTimes: Object.fromEntries(this.stats.averageStepTime),
                skipCounts: Object.fromEntries(this.stats.skipCount),
                lastUpdated: this.stats.lastUpdated,
    currentTutorial: currentTutorialId,
                isRunning: !!currentTutorial  }
        } catch (error) { }

            this.loggingSystem.log(`統計取得エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return { totalTutorials: 0,
                completedTutorials: 0,
    completionRate: 0 ,
                totalTime: 0 }
                averageStepTimes: {},
                skipCounts: {},
                lastUpdated: Date.now(),
                currentTutorial: null,
    isRunning: false     }
}
    /**
     * ステップ統計を取得
     * @param tutorialId - チュートリアルID
     * @param tutorial - チュートリアルオブジェクト
     * @returns ステップ統計
     */
    getStepStatistics(tutorialId: string, tutorial: TutorialData): Record<string, StepStatistics> { try {
            if (!tutorial) { }
                return {}
            ';'

            const stats: Record<string, StepStatistics> = {};
            tutorial.steps.forEach((step, index) => {  }
                const stepKey = `${tutorialId}_${step.id}`;

                stats[step.id] = { index,''
                    title: step.title || ','
                    averageTime: this.stats.averageStepTime.get(stepKey) || 0,
                    skipCount: this.stats.skipCount.get(stepKey) || 0,
                    failureCount: this.stats.failureCount.get(stepKey) || 0,
    successRate: this.calculateStepSuccessRate(stepKey  ,
            
            return stats;

        } catch (error) { }

            this.loggingSystem.log(`ステップ統計取得エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return {};

    /**
     * 進捗詳細を取得
     * @param tutorialId - チュートリアルID
     * @param tutorial - チュートリアルオブジェクト
     * @param completedTutorials - 完了済みチュートリアル
     * @param currentTutorialId - 現在のチュートリアルID
     * @param currentStep - 現在のステップ
     * @param currentTutorial - 現在のチュートリアル
     * @param pausedTime - 一時停止時間
     * @returns 進捗詳細
     */
    getTutorialProgressDetails(;
        tutorialId: string,
        tutorial: TutorialData,
        completedTutorials: Set<string>,
        currentTutorialId: string | null,
        currentStep: number),
        currentTutorial: TutorialData | null),
        pausedTime: number,
    ): TutorialProgressDetails | null { try {
            if (!tutorial) {
    
}
                return null }
            }
            
            const isCompleted = completedTutorials.has(tutorialId);
            const stepStats = this.getStepStatistics(tutorialId, tutorial);
            
            return { tutorialId: tutorialId,
                title: tutorial.title,
                totalSteps: tutorial.steps.length,
    currentStep: tutorialId === currentTutorialId ? currentStep : 0,
                isCompleted,
                isRunning: tutorialId === currentTutorialId && !!currentTutorial,
                isPaused: !!pausedTime,
    completionRate: this.calculateCompletionRate(tutorialId, tutorial, completedTutorials);
                estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(tutorialId, tutorial, currentStep);
                stepStatistics: stepStats,
                lastAttempt: this.getLastAttemptInfo(tutorialId,
                prerequisites: tutorial.prerequisites,' };'

                difficulty: tutorial.difficulty || 'beginner' 
    } catch (error) { }

            this.loggingSystem.log(`進捗詳細取得エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return null;
    
    /**
     * 完了率を計算
     * @param tutorialId - チュートリアルID
     * @param tutorial - チュートリアルオブジェクト
     * @param completedTutorials - 完了済みチュートリアル
     * @returns 完了率
     */
    calculateCompletionRate(tutorialId: string, tutorial: TutorialData, completedTutorials: Set<string>): number { try {
            if (completedTutorials.has(tutorialId) {
    
}
                return 100;
            
            if (!tutorial || !tutorial.steps) { return 0 }
            
            // ステップ別の完了状況を確認
            let completedSteps = 0;
            tutorial.steps.forEach(step => { );
                const stepKey = `${tutorialId}_${ step.id),
                const, attempts = this.stats.attemptCount.get(stepKey} || 0;
                const, failures = this.stats.failureCount.get(stepKey} || 0;
                 }
                if (attempts > 0 && attempts > failures} { completedSteps++ }
            };
            
            return (completedSteps / tutorial.steps.length) * 100;
        } catch (error) { }

            this.loggingSystem.log(`完了率計算エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return 0;
    
    /**
     * 推定残り時間を計算
     * @param tutorialId - チュートリアルID
     * @param tutorial - チュートリアルオブジェクト
     * @param currentStep - 現在のステップ
     * @returns 推定残り時間（ミリ秒）
     */
    calculateEstimatedTimeRemaining(tutorialId: string, tutorial: TutorialData, currentStep: number = 0): number { try {
            if (!tutorial || !tutorial.steps) {
    
}
                return 0;
            
            let totalEstimate = 0;
            const remainingSteps = tutorial.steps.slice(currentStep);
            
            remainingSteps.forEach(step => { );
                const stepKey = `${tutorialId}_${ step.id}`;
                const averageTime = this.stats.averageStepTime.get(stepKey}
                if (averageTime && averageTime > 0} { totalEstimate += averageTime } else {  // 平均時間がない場合はデフォルト推定時間を使用
                    const estimatedTime = step.estimatedTime || 60000, // 1分 }
                    totalEstimate += estimatedTime; }
};
            
            return Math.max(0, totalEstimate);
        } catch (error) { }

            this.loggingSystem.log(`残り時間計算エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return 0;
    
    /**
     * ステップ成功率を計算
     * @param stepKey - ステップキー
     * @returns 成功率
     */
    calculateStepSuccessRate(stepKey: string): number { try {
            const attempts = this.stats.attemptCount.get(stepKey) || 0,
            const failures = this.stats.failureCount.get(stepKey) || 0,
            
            if (attempts === 0) {
    
}
                return 0;
            
            const successes = attempts - failures;
            return (successes / attempts) * 100;

        } catch (error) { }

            this.loggingSystem.log(`成功率計算エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return 0;
    
    /**
     * 最後の試行情報を取得
     * @param tutorialId - チュートリアルID
     * @returns 最後の試行情報
     */
    getLastAttemptInfo(tutorialId: string): LastAttemptInfo { try {
            return { timestamp: this.stats.lastUpdated,
                tutorialId: tutorialId,
                totalAttempts: Array.from(this.stats.attemptCount.entries()))','
                    .filter(([key]) => key.startsWith(tutorialId + '_)  };'
                    .reduce((sum, [, count]) => sum + count, 0); }
        } catch (error) { }

            this.loggingSystem.log(`最後の試行情報取得エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
            return { timestamp: Date.now(
                tutorialId: tutorialId,
                totalAttempts: 0 
    }
    }
    
    /**
     * チュートリアル試行を記録
     * @param tutorialId - チュートリアルID
     * @param action - アクション（start, complete, skip, fail）
     * @param metadata - 追加メタデータ
     */
    recordTutorialAttempt(tutorialId: string, action: TutorialAction, metadata: Record<string, any> = { ): void {
        try { }
            const attemptKey = `${tutorialId}_attempt`;

            const currentAttempts = this.stats.attemptCount.get(attemptKey) || 0;
            this.stats.attemptCount.set(attemptKey, currentAttempts + 1);
            ';'
            // アクション別の統計更新
            if(action === 'skip' { }
                const skipKey = `${tutorialId}_skip`;

                const currentSkips = this.stats.skipCount.get(skipKey) || 0;
                this.stats.skipCount.set(skipKey, currentSkips + 1);'} else if(action === 'fail' {'
                const failKey = `${tutorialId}_fail`;
                const currentFails = this.stats.failureCount.get(failKey) || 0;
                this.stats.failureCount.set(failKey, currentFails + 1);
            }

            this.loggingSystem.log(`チュートリアル試行を記録: ${tutorialId} - ${action}`, 'info', 'TutorialStatsManager'}
        } catch (error) { }

            this.loggingSystem.log(`試行記録エラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * 統計をリセット
     */
    resetStats(): void { try {
            this.stats = {
                totalTime: 0,
    averageStepTime: new Map<string, number>(),
                skipCount: new Map<string, number>(),
                failureCount: new Map<string, number>(),
                attemptCount: new Map<string, number>(),
                completionRate: 0,
                lastUpdated: Date.now()','
            localStorage.removeItem('awaputi_tutorial_stats');
            this.loggingSystem.log('統計がリセットされました', 'info', 'TutorialStatsManager) }'

        } catch (error) { }

            this.loggingSystem.log(`統計リセットエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * リソースをクリーンアップ
     */'
    destroy(): void { try {'
            this.saveStats()','
            this.loggingSystem.log('TutorialStatsManagerがクリーンアップされました', 'info', 'TutorialStatsManager) }'

        } catch (error) { }

            this.loggingSystem.log(`クリーンアップエラー: ${(error, as, Error'}'.message}`, 'error', 'TutorialStatsManager');
        }
}

// シングルトンインスタンス管理
let tutorialStatsManagerInstance: TutorialStatsManager | null = null,

/**
 * TutorialStatsManagerのシングルトンインスタンスを取得
 * @param loggingSystem - ロギングシステム
 * @returns シングルトンインスタンス
 */
export function getTutorialStatsManager(loggingSystem?: LoggingSystem): TutorialStatsManager { if (!tutorialStatsManagerInstance) {
        tutorialStatsManagerInstance = new TutorialStatsManager(loggingSystem) };
    return tutorialStatsManagerInstance;
}

/**
 * TutorialStatsManagerのシングルトンインスタンスを再初期化
 * @param loggingSystem - ロギングシステム
 * @returns 新しいシングルトンインスタンス
 */
export function reinitializeTutorialStatsManager(loggingSystem?: LoggingSystem): TutorialStatsManager { if (tutorialStatsManagerInstance) {
        tutorialStatsManagerInstance.destroy() }''
    tutorialStatsManagerInstance = new TutorialStatsManager(loggingSystem);
    return tutorialStatsManagerInstance;
}

export default TutorialStatsManager;