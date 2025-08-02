/**
 * TutorialStatsManager.js
 * チュートリアル統計管理クラス
 * 統計収集、データ分析、進捗詳細、パフォーマンス測定を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * チュートリアル統計管理クラス
 */
export class TutorialStatsManager {
    constructor(loggingSystem) {
        this.loggingSystem = loggingSystem || LoggingSystem.getInstance();
        
        // チュートリアル統計
        this.stats = {
            totalTime: 0,
            averageStepTime: new Map(),
            skipCount: new Map(),
            failureCount: new Map(),
            attemptCount: new Map(),
            completionRate: 0,
            lastUpdated: Date.now()
        };
        
        this.initialize();
    }
    
    /**
     * 統計管理システムを初期化
     */
    initialize() {
        try {
            this.loadStats();
            this.loggingSystem.log('TutorialStatsManagerが初期化されました', 'info', 'TutorialStatsManager');
        } catch (error) {
            this.loggingSystem.log(`統計管理初期化エラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * 統計データを読み込み
     */
    loadStats() {
        try {
            const saved = localStorage.getItem('awaputi_tutorial_stats');
            if (saved) {
                const stats = JSON.parse(saved);
                this.stats = {
                    totalTime: stats.totalTime || 0,
                    averageStepTime: new Map(stats.averageStepTime || []),
                    skipCount: new Map(stats.skipCount || []),
                    failureCount: new Map(stats.failureCount || []),
                    attemptCount: new Map(stats.attemptCount || []),
                    completionRate: stats.completionRate || 0,
                    lastUpdated: stats.lastUpdated || Date.now()
                };
            }
        } catch (error) {
            this.loggingSystem.log(`統計読み込みエラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * 統計データを保存
     */
    saveStats() {
        try {
            const stats = {
                totalTime: this.stats.totalTime,
                averageStepTime: Array.from(this.stats.averageStepTime.entries()),
                skipCount: Array.from(this.stats.skipCount.entries()),
                failureCount: Array.from(this.stats.failureCount.entries()),
                attemptCount: Array.from(this.stats.attemptCount.entries()),
                completionRate: this.stats.completionRate,
                lastUpdated: Date.now()
            };
            localStorage.setItem('awaputi_tutorial_stats', JSON.stringify(stats));
            this.stats.lastUpdated = Date.now();
        } catch (error) {
            this.loggingSystem.log(`統計保存エラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * ステップ統計を更新
     * @param {string} stepId - ステップID
     * @param {string} tutorialId - チュートリアルID
     * @param {number} duration - 所要時間
     * @param {boolean} success - 成功フラグ
     * @param {boolean} skipped - スキップフラグ
     */
    updateStepStats(stepId, tutorialId, duration, success = true, skipped = false) {
        try {
            if (!tutorialId || !stepId) return;
            
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
                const currentSkips = this.stats.skipCount.get(stepKey) || 0;
                this.stats.skipCount.set(stepKey, currentSkips + 1);
            }
            
            // 失敗回数の更新
            if (!success) {
                const currentFailures = this.stats.failureCount.get(stepKey) || 0;
                this.stats.failureCount.set(stepKey, currentFailures + 1);
            }
            
            this.stats.totalTime += duration;
            
            // 統計の自動保存（5分間隔）
            const now = Date.now();
            if (now - this.stats.lastUpdated > 300000) { // 5分
                this.saveStats();
            }
            
        } catch (error) {
            this.loggingSystem.log(`ステップ統計更新エラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * チュートリアル統計を取得
     * @param {Map} tutorialData - チュートリアルデータ
     * @param {Set} completedTutorials - 完了済みチュートリアル
     * @param {string} currentTutorialId - 現在のチュートリアルID
     * @param {Object} currentTutorial - 現在のチュートリアル
     * @returns {Object} 統計情報
     */
    getTutorialStatistics(tutorialData, completedTutorials, currentTutorialId, currentTutorial) {
        try {
            const totalTutorials = tutorialData.size;
            const completedCount = completedTutorials.size;
            const completionRate = totalTutorials > 0 ? (completedCount / totalTutorials) * 100 : 0;
            
            return {
                totalTutorials,
                completedTutorials: completedCount,
                completionRate,
                totalTime: this.stats.totalTime,
                averageStepTimes: Object.fromEntries(this.stats.averageStepTime),
                skipCounts: Object.fromEntries(this.stats.skipCount),
                lastUpdated: this.stats.lastUpdated,
                currentTutorial: currentTutorialId,
                isRunning: !!currentTutorial
            };
        } catch (error) {
            this.loggingSystem.log(`統計取得エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return {};
        }
    }
    
    /**
     * ステップ統計を取得
     * @param {string} tutorialId - チュートリアルID
     * @param {Object} tutorial - チュートリアルオブジェクト
     * @returns {Object} ステップ統計
     */
    getStepStatistics(tutorialId, tutorial) {
        try {
            if (!tutorial) {
                return {};
            }
            
            const stats = {};
            tutorial.steps.forEach((step, index) => {
                const stepKey = `${tutorialId}_${step.id}`;
                stats[step.id] = {
                    index,
                    title: step.title,
                    averageTime: this.stats.averageStepTime.get(stepKey) || 0,
                    skipCount: this.stats.skipCount.get(stepKey) || 0,
                    failureCount: this.stats.failureCount.get(stepKey) || 0,
                    successRate: this.calculateStepSuccessRate(stepKey)
                };
            });
            
            return stats;
        } catch (error) {
            this.loggingSystem.log(`ステップ統計取得エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return {};
        }
    }
    
    /**
     * 進捗詳細を取得
     * @param {string} tutorialId - チュートリアルID
     * @param {Object} tutorial - チュートリアルオブジェクト
     * @param {Set} completedTutorials - 完了済みチュートリアル
     * @param {string} currentTutorialId - 現在のチュートリアルID
     * @param {number} currentStep - 現在のステップ
     * @param {Object} currentTutorial - 現在のチュートリアル
     * @param {number} pausedTime - 一時停止時間
     * @returns {Object} 進捗詳細
     */
    getTutorialProgressDetails(tutorialId, tutorial, completedTutorials, currentTutorialId, currentStep, currentTutorial, pausedTime) {
        try {
            if (!tutorial) {
                return null;
            }
            
            const isCompleted = completedTutorials.has(tutorialId);
            const stepStats = this.getStepStatistics(tutorialId, tutorial);
            
            return {
                tutorialId: tutorialId,
                title: tutorial.title,
                totalSteps: tutorial.steps.length,
                currentStep: tutorialId === currentTutorialId ? currentStep : 0,
                isCompleted,
                isRunning: tutorialId === currentTutorialId && !!currentTutorial,
                isPaused: !!pausedTime,
                completionRate: this.calculateCompletionRate(tutorialId, tutorial, completedTutorials),
                estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(tutorialId, tutorial, currentStep),
                stepStatistics: stepStats,
                lastAttempt: this.getLastAttemptInfo(tutorialId),
                prerequisites: tutorial.prerequisites,
                difficulty: tutorial.difficulty || 'beginner'
            };
        } catch (error) {
            this.loggingSystem.log(`進捗詳細取得エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return null;
        }
    }
    
    /**
     * 完了率を計算
     * @param {string} tutorialId - チュートリアルID
     * @param {Object} tutorial - チュートリアルオブジェクト
     * @param {Set} completedTutorials - 完了済みチュートリアル
     * @returns {number} 完了率
     */
    calculateCompletionRate(tutorialId, tutorial, completedTutorials) {
        try {
            if (completedTutorials.has(tutorialId)) {
                return 100;
            }
            
            if (!tutorial || !tutorial.steps) {
                return 0;
            }
            
            // ステップ別の完了状況を確認
            let completedSteps = 0;
            tutorial.steps.forEach(step => {
                const stepKey = `${tutorialId}_${step.id}`;
                const attempts = this.stats.attemptCount.get(stepKey) || 0;
                const failures = this.stats.failureCount.get(stepKey) || 0;
                
                if (attempts > 0 && attempts > failures) {
                    completedSteps++;
                }
            });
            
            return (completedSteps / tutorial.steps.length) * 100;
        } catch (error) {
            this.loggingSystem.log(`完了率計算エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return 0;
        }
    }
    
    /**
     * 推定残り時間を計算
     * @param {string} tutorialId - チュートリアルID
     * @param {Object} tutorial - チュートリアルオブジェクト
     * @param {number} currentStep - 現在のステップ
     * @returns {number} 推定残り時間（ミリ秒）
     */
    calculateEstimatedTimeRemaining(tutorialId, tutorial, currentStep = 0) {
        try {
            if (!tutorial || !tutorial.steps) {
                return 0;
            }
            
            let totalEstimate = 0;
            const remainingSteps = tutorial.steps.slice(currentStep);
            
            remainingSteps.forEach(step => {
                const stepKey = `${tutorialId}_${step.id}`;
                const averageTime = this.stats.averageStepTime.get(stepKey);
                
                if (averageTime && averageTime > 0) {
                    totalEstimate += averageTime;
                } else {
                    // 平均時間がない場合はデフォルト推定時間を使用
                    const estimatedTime = step.estimatedTime || 60000; // 1分
                    totalEstimate += estimatedTime;
                }
            });
            
            return Math.max(0, totalEstimate);
        } catch (error) {
            this.loggingSystem.log(`残り時間計算エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return 0;
        }
    }
    
    /**
     * ステップ成功率を計算
     * @param {string} stepKey - ステップキー
     * @returns {number} 成功率
     */
    calculateStepSuccessRate(stepKey) {
        try {
            const attempts = this.stats.attemptCount.get(stepKey) || 0;
            const failures = this.stats.failureCount.get(stepKey) || 0;
            
            if (attempts === 0) {
                return 0;
            }
            
            const successes = attempts - failures;
            return (successes / attempts) * 100;
        } catch (error) {
            this.loggingSystem.log(`成功率計算エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return 0;
        }
    }
    
    /**
     * 最後の試行情報を取得
     * @param {string} tutorialId - チュートリアルID
     * @returns {Object} 最後の試行情報
     */
    getLastAttemptInfo(tutorialId) {
        try {
            return {
                timestamp: this.stats.lastUpdated,
                tutorialId: tutorialId,
                totalAttempts: Array.from(this.stats.attemptCount.entries())
                    .filter(([key]) => key.startsWith(tutorialId + '_'))
                    .reduce((sum, [, count]) => sum + count, 0)
            };
        } catch (error) {
            this.loggingSystem.log(`最後の試行情報取得エラー: ${error.message}`, 'error', 'TutorialStatsManager');
            return {};
        }
    }
    
    /**
     * チュートリアル試行を記録
     * @param {string} tutorialId - チュートリアルID
     * @param {string} action - アクション（start, complete, skip, fail）
     * @param {Object} metadata - 追加メタデータ
     */
    recordTutorialAttempt(tutorialId, action, metadata = {}) {
        try {
            const attemptKey = `${tutorialId}_attempt`;
            const currentAttempts = this.stats.attemptCount.get(attemptKey) || 0;
            this.stats.attemptCount.set(attemptKey, currentAttempts + 1);
            
            // アクション別の統計更新
            if (action === 'skip') {
                const skipKey = `${tutorialId}_skip`;
                const currentSkips = this.stats.skipCount.get(skipKey) || 0;
                this.stats.skipCount.set(skipKey, currentSkips + 1);
            } else if (action === 'fail') {
                const failKey = `${tutorialId}_fail`;
                const currentFails = this.stats.failureCount.get(failKey) || 0;
                this.stats.failureCount.set(failKey, currentFails + 1);
            }
            
            this.loggingSystem.log(`チュートリアル試行を記録: ${tutorialId} - ${action}`, 'info', 'TutorialStatsManager');
        } catch (error) {
            this.loggingSystem.log(`試行記録エラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * 統計をリセット
     */
    resetStats() {
        try {
            this.stats = {
                totalTime: 0,
                averageStepTime: new Map(),
                skipCount: new Map(),
                failureCount: new Map(),
                attemptCount: new Map(),
                completionRate: 0,
                lastUpdated: Date.now()
            };
            
            localStorage.removeItem('awaputi_tutorial_stats');
            this.loggingSystem.log('統計がリセットされました', 'info', 'TutorialStatsManager');
        } catch (error) {
            this.loggingSystem.log(`統計リセットエラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
    
    /**
     * リソースをクリーンアップ
     */
    destroy() {
        try {
            this.saveStats();
            this.loggingSystem.log('TutorialStatsManagerがクリーンアップされました', 'info', 'TutorialStatsManager');
        } catch (error) {
            this.loggingSystem.log(`クリーンアップエラー: ${error.message}`, 'error', 'TutorialStatsManager');
        }
    }
}

// シングルトンインスタンス管理
let tutorialStatsManagerInstance = null;

/**
 * TutorialStatsManagerのシングルトンインスタンスを取得
 * @param {Object} loggingSystem - ロギングシステム
 * @returns {TutorialStatsManager} シングルトンインスタンス
 */
export function getTutorialStatsManager(loggingSystem) {
    if (!tutorialStatsManagerInstance) {
        tutorialStatsManagerInstance = new TutorialStatsManager(loggingSystem);
    }
    return tutorialStatsManagerInstance;
}

/**
 * TutorialStatsManagerのシングルトンインスタンスを再初期化
 * @param {Object} loggingSystem - ロギングシステム
 * @returns {TutorialStatsManager} 新しいシングルトンインスタンス
 */
export function reinitializeTutorialStatsManager(loggingSystem) {
    if (tutorialStatsManagerInstance) {
        tutorialStatsManagerInstance.destroy();
    }
    tutorialStatsManagerInstance = new TutorialStatsManager(loggingSystem);
    return tutorialStatsManagerInstance;
}

export default TutorialStatsManager;