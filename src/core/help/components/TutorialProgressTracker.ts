/**
 * TutorialProgressTracker.ts
 * チュートリアル進捗追跡システム
 * TutorialOverlayから分離された進捗管理・分析機能
 */

import { ErrorHandler } from '../../../utils/ErrorHandler.js';
import { LoggingSystem } from '../../LoggingSystem.js';

// 型定義
export interface ProgressData {
    sessionId: string;
    userId: string | null;
    tutorialId: string | null;
    startTime: number | null;
    endTime: number | null;
    totalDuration: number;
    currentStep: number;
    totalSteps: number;
    completedSteps: Set<number>;
    skippedSteps: Set<number>;
    revisitedSteps: Set<number>;
    stepTimings: Map<number, StepTiming>;
    userActions: UserAction[];
    errors: ErrorRecord[];
    helpRequests: HelpRequest[];
    completionStatus: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
}

export interface StepTiming {
    stepIndex: number;
    startTime: number;
    endTime?: number;
    duration?: number;
    interactions: number;
}

export interface UserAction {
    type: string;
    timestamp: number;
    stepIndex: number;
    data: any;
}

export interface ErrorRecord {
    message: string;
    timestamp: number;
    stepIndex: number;
    stack?: string;
    context: string;
}

export interface HelpRequest {
    type: string;
    timestamp: number;
    stepIndex: number;
    query?: string;
}

export interface SessionStats {
    totalInteractions: number;
    averageStepTime: number;
    completionRate: number;
    helpRequestRate: number;
    skipRate: number;
    errorRate: number;
    userEngagement: {
        scrolls: number;
        clicks: number;
        keystrokes: number;
        gestures: number;
    };
}

export interface AnalyticsConfig {
    trackDetailedActions: boolean;
    trackTimings: boolean;
    trackErrors: boolean;
    trackEngagement: boolean;
    sendToServer: boolean;
    serverEndpoint: string | null;
    batchSize: number;
    batchInterval: number;
}

export interface StorageKeys {
    progress: string;
    analytics: string;
    userPreferences: string;
}

export interface TutorialData {
    id: string;
    steps?: any[];
}

export class TutorialProgressTracker {
    private errorHandler: ErrorHandler;
    private loggingSystem: LoggingSystem;
    private progressData: ProgressData;
    private stepMetrics: Map<number, any>;
    private sessionStats: SessionStats;
    private analyticsConfig: AnalyticsConfig;
    private storageKeys: StorageKeys;
    private batchQueue: any[];
    private batchTimer: number | null;
    private currentStepStartTime: number | null;

    constructor() {
        this.errorHandler = ErrorHandler.getInstance ? ErrorHandler.getInstance() : new ErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // 進捗データ
        this.progressData = {
            sessionId: this.generateSessionId(),
            userId: null,
            tutorialId: null,
            startTime: null,
            endTime: null,
            totalDuration: 0,
            currentStep: 0,
            totalSteps: 0,
            completedSteps: new Set<number>(),
            skippedSteps: new Set<number>(),
            revisitedSteps: new Set<number>(),
            stepTimings: new Map<number, StepTiming>(),
            userActions: [],
            errors: [],
            helpRequests: [],
            completionStatus: 'not_started'
        };
        
        // ステップレベルの詳細データ
        this.stepMetrics = new Map();
        
        // セッション統計
        this.sessionStats = {
            totalInteractions: 0,
            averageStepTime: 0,
            completionRate: 0,
            helpRequestRate: 0,
            skipRate: 0,
            errorRate: 0,
            userEngagement: {
                scrolls: 0,
                clicks: 0,
                keystrokes: 0,
                gestures: 0
            }
        };
        
        // アナリティクス設定
        this.analyticsConfig = {
            trackDetailedActions: true,
            trackTimings: true,
            trackErrors: true,
            trackEngagement: true,
            sendToServer: false,
            serverEndpoint: null,
            batchSize: 50,
            batchInterval: 30000
        };
        
        // ストレージキー
        this.storageKeys = {
            progress: 'tutorial_progress',
            analytics: 'tutorial_analytics',
            userPreferences: 'tutorial_user_prefs'
        };
        
        // バッチ送信用データ
        this.batchQueue = [];
        this.batchTimer = null;
        this.currentStepStartTime = null;
        
        this.initialize();
    }
    
    /**
     * 進捗追跡システムを初期化
     */
    initialize(): void {
        try {
            this.loadStoredProgress();
            this.setupBatchProcessing();
            this.loggingSystem.debug('TutorialProgressTracker', 'Progress tracker initialized');
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.initialize');
        }
    }
    
    /**
     * チュートリアル開始を記録
     * @param tutorial - チュートリアル情報
     * @param userId - ユーザーID（オプション）
     */
    startTracking(tutorial: TutorialData, userId: string | null = null): void {
        try {
            this.progressData = {
                sessionId: this.generateSessionId(),
                userId: userId,
                tutorialId: tutorial.id,
                startTime: Date.now(),
                endTime: null,
                totalDuration: 0,
                currentStep: 0,
                totalSteps: tutorial.steps ? tutorial.steps.length : 0,
                completedSteps: new Set(),
                skippedSteps: new Set(),
                revisitedSteps: new Set(),
                stepTimings: new Map(),
                userActions: [],
                errors: [],
                helpRequests: [],
                completionStatus: 'in_progress'
            };
            
            this.sessionStats = {
                totalInteractions: 0,
                averageStepTime: 0,
                completionRate: 0,
                helpRequestRate: 0,
                skipRate: 0,
                errorRate: 0,
                userEngagement: {
                    scrolls: 0,
                    clicks: 0,
                    keystrokes: 0,
                    gestures: 0
                }
            };
            
            this.stepMetrics.clear();
            
            this.recordEvent('tutorial_started', {
                tutorialId: tutorial.id,
                totalSteps: this.progressData.totalSteps,
                userId: userId
            });
            
            this.loggingSystem.info('TutorialProgressTracker', `Tracking started for tutorial: ${tutorial.id}`);
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.startTracking');
        }
    }
    
    /**
     * ステップ開始を記録
     * @param stepIndex - ステップインデックス
     * @param stepData - ステップデータ
     */
    recordStepStart(stepIndex: number, stepData: any): void {
        try {
            this.progressData.currentStep = stepIndex;
            
            // 前のステップの終了時間を記録
            if (this.currentStepStartTime) {
                const previousStepIndex = stepIndex - 1;
                const stepDuration = Date.now() - this.currentStepStartTime;
                const stepTiming: StepTiming = {
                    stepIndex: previousStepIndex,
                    startTime: this.currentStepStartTime,
                    endTime: Date.now(),
                    duration: stepDuration,
                    interactions: 0
                };
                this.progressData.stepTimings.set(previousStepIndex, stepTiming);
                this.updateStepMetrics(previousStepIndex, { duration: stepDuration });
            }
            
            this.currentStepStartTime = Date.now();
            
            // 再訪問チェック
            if (this.progressData.completedSteps.has(stepIndex)) {
                this.progressData.revisitedSteps.add(stepIndex);
            }
            
            this.initializeStepMetrics(stepIndex, stepData);
            
            this.recordEvent('step_started', {
                stepIndex: stepIndex,
                stepTitle: stepData.title,
                isRevisit: this.progressData.revisitedSteps.has(stepIndex)
            });
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordStepStart');
        }
    }
    
    /**
     * ステップ完了を記録
     * @param stepIndex - ステップインデックス
     * @param completionData - 完了データ
     */
    recordStepComplete(stepIndex: number, completionData: any = {}): void {
        try {
            this.progressData.completedSteps.add(stepIndex);
            const stepDuration = this.currentStepStartTime ? Date.now() - this.currentStepStartTime : 0;
            
            const stepTiming: StepTiming = {
                stepIndex: stepIndex,
                startTime: this.currentStepStartTime || Date.now(),
                endTime: Date.now(),
                duration: stepDuration,
                interactions: 0
            };
            
            this.progressData.stepTimings.set(stepIndex, stepTiming);
            this.updateStepMetrics(stepIndex, {
                duration: stepDuration,
                completed: true,
                completionData: completionData
            });
            
            this.recordEvent('step_completed', {
                stepIndex: stepIndex,
                duration: stepDuration,
                ...completionData
            });
            
            this.updateSessionStats();
            this.saveProgress();
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordStepComplete');
        }
    }
    
    /**
     * ステップスキップを記録
     * @param stepIndex - ステップインデックス
     * @param reason - スキップ理由
     */
    recordStepSkip(stepIndex: number, reason: string = 'user_choice'): void {
        try {
            this.progressData.skippedSteps.add(stepIndex);
            this.updateStepMetrics(stepIndex, {
                skipped: true,
                skipReason: reason
            });
            
            this.recordEvent('step_skipped', {
                stepIndex: stepIndex,
                reason: reason
            });
            
            this.updateSessionStats();
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordStepSkip');
        }
    }
    
    /**
     * ユーザーアクションを記録
     * @param actionType - アクション種別
     * @param actionData - アクションデータ
     */
    recordUserAction(actionType: string, actionData: any = {}): void {
        try {
            if (!this.analyticsConfig.trackDetailedActions) return;
            
            const action: UserAction = {
                type: actionType,
                timestamp: Date.now(),
                stepIndex: this.progressData.currentStep,
                data: actionData
            };
            
            this.progressData.userActions.push(action);
            this.sessionStats.totalInteractions++;
            
            // エンゲージメント統計を更新
            this.updateEngagementStats(actionType);
            
            // バッチキューに追加
            this.addToBatch(action);
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordUserAction');
        }
    }
    
    /**
     * エラーを記録
     * @param error - エラーオブジェクト
     * @param context - エラー発生コンテキスト
     */
    recordError(error: Error, context: string = ''): void {
        try {
            if (!this.analyticsConfig.trackErrors) return;
            
            const errorRecord: ErrorRecord = {
                message: error.message,
                stack: error.stack,
                context: context,
                timestamp: Date.now(),
                stepIndex: this.progressData.currentStep
            };
            
            this.progressData.errors.push(errorRecord);
            this.recordEvent('error_occurred', errorRecord);
        } catch (recordError) {
            this.errorHandler.handle(recordError as Error, 'TutorialProgressTracker.recordError');
        }
    }
    
    /**
     * ヘルプリクエストを記録
     * @param helpType - ヘルプ種別
     * @param helpData - ヘルプデータ
     */
    recordHelpRequest(helpType: string, helpData: any = {}): void {
        try {
            const helpRequest: HelpRequest = {
                type: helpType,
                timestamp: Date.now(),
                stepIndex: this.progressData.currentStep,
                query: helpData.query
            };
            
            this.progressData.helpRequests.push(helpRequest);
            this.recordEvent('help_requested', helpRequest);
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordHelpRequest');
        }
    }
    
    /**
     * チュートリアル完了を記録
     * @param completionType - 完了種別 ('completed', 'abandoned')
     */
    recordTutorialEnd(completionType: string = 'completed'): void {
        try {
            this.progressData.endTime = Date.now();
            this.progressData.totalDuration = this.progressData.endTime - (this.progressData.startTime || 0);
            this.progressData.completionStatus = completionType as any;
            
            // 最後のステップのタイミングを記録
            if (this.currentStepStartTime) {
                const lastStepDuration = Date.now() - this.currentStepStartTime;
                const stepTiming: StepTiming = {
                    stepIndex: this.progressData.currentStep,
                    startTime: this.currentStepStartTime,
                    endTime: Date.now(),
                    duration: lastStepDuration,
                    interactions: 0
                };
                this.progressData.stepTimings.set(this.progressData.currentStep, stepTiming);
            }
            
            this.updateSessionStats();
            this.recordEvent('tutorial_ended', {
                completionType: completionType,
                totalDuration: this.progressData.totalDuration,
                completedSteps: this.progressData.completedSteps.size,
                skippedSteps: this.progressData.skippedSteps.size,
                totalSteps: this.progressData.totalSteps
            });
            
            this.generateFinalReport();
            this.saveProgress();
            this.sendBatch(true); // 強制送信
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordTutorialEnd');
        }
    }
    
    /**
     * イベントを記録
     * @param eventType - イベント種別
     * @param eventData - イベントデータ
     */
    recordEvent(eventType: string, eventData: any = {}): void {
        try {
            const event = {
                type: eventType,
                timestamp: Date.now(),
                ...eventData
            };
            
            this.loggingSystem.debug('TutorialProgressTracker', `Event recorded: ${eventType}`, event);
            this.addToBatch(event);
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.recordEvent');
        }
    }
    
    /**
     * ステップメトリクスを初期化
     * @param stepIndex - ステップインデックス
     * @param stepData - ステップデータ
     */
    initializeStepMetrics(stepIndex: number, stepData: any): void {
        this.stepMetrics.set(stepIndex, {
            startTime: Date.now(),
            duration: 0,
            completed: false,
            skipped: false,
            interactions: 0,
            helpRequests: 0,
            errors: 0,
            revisitCount: this.progressData.revisitedSteps.has(stepIndex) ? 1 : 0,
            stepData: stepData
        });
    }
    
    /**
     * ステップメトリクスを更新
     * @param stepIndex - ステップインデックス
     * @param updates - 更新データ
     */
    updateStepMetrics(stepIndex: number, updates: any): void {
        const metrics = this.stepMetrics.get(stepIndex) || {};
        Object.assign(metrics, updates);
        this.stepMetrics.set(stepIndex, metrics);
    }
    
    /**
     * セッション統計を更新
     */
    updateSessionStats(): void {
        try {
            const completedCount = this.progressData.completedSteps.size;
            const skippedCount = this.progressData.skippedSteps.size;
            const totalSteps = this.progressData.totalSteps;
            
            this.sessionStats.completionRate = totalSteps > 0 ? completedCount / totalSteps : 0;
            this.sessionStats.skipRate = totalSteps > 0 ? skippedCount / totalSteps : 0;
            this.sessionStats.helpRequestRate = this.sessionStats.totalInteractions > 0 
                ? this.progressData.helpRequests.length / this.sessionStats.totalInteractions 
                : 0;
            this.sessionStats.errorRate = this.sessionStats.totalInteractions > 0 
                ? this.progressData.errors.length / this.sessionStats.totalInteractions 
                : 0;
            
            // 平均ステップ時間を計算
            if (this.progressData.stepTimings.size > 0) {
                const totalTime = Array.from(this.progressData.stepTimings.values())
                    .reduce((sum, timing) => sum + (timing.duration || 0), 0);
                this.sessionStats.averageStepTime = totalTime / this.progressData.stepTimings.size;
            }
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.updateSessionStats');
        }
    }
    
    /**
     * エンゲージメント統計を更新
     * @param actionType - アクション種別
     */
    updateEngagementStats(actionType: string): void {
        switch (actionType) {
            case 'scroll':
                this.sessionStats.userEngagement.scrolls++;
                break;
            case 'click':
            case 'tap':
                this.sessionStats.userEngagement.clicks++;
                break;
            case 'keydown':
            case 'keypress':
                this.sessionStats.userEngagement.keystrokes++;
                break;
            case 'swipe':
            case 'gesture':
                this.sessionStats.userEngagement.gestures++;
                break;
        }
    }
    
    /**
     * バッチ処理を設定
     */
    setupBatchProcessing(): void {
        if (!this.analyticsConfig.sendToServer) return;
        
        this.batchTimer = window.setInterval(() => {
            this.sendBatch();
        }, this.analyticsConfig.batchInterval);
    }
    
    /**
     * データをバッチキューに追加
     * @param data - 追加するデータ
     */
    addToBatch(data: any): void {
        this.batchQueue.push(data);
        if (this.batchQueue.length >= this.analyticsConfig.batchSize) {
            this.sendBatch();
        }
    }
    
    /**
     * バッチデータを送信
     * @param force - 強制送信フラグ
     */
    async sendBatch(force: boolean = false): Promise<void> {
        try {
            if (!this.analyticsConfig.sendToServer || !this.analyticsConfig.serverEndpoint) return;
            if (this.batchQueue.length === 0 && !force) return;
            
            const dataToSend = [...this.batchQueue];
            this.batchQueue = [];
            
            const response = await fetch(this.analyticsConfig.serverEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.progressData.sessionId,
                    events: dataToSend,
                    timestamp: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            this.loggingSystem.debug('TutorialProgressTracker', `Batch sent: ${dataToSend.length} events`);
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.sendBatch');
            // 送信失敗時はデータを戻す
            this.batchQueue.unshift(...(dataToSend || []));
        }
    }
    
    /**
     * 最終レポートを生成
     */
    generateFinalReport(): any {
        try {
            const report = {
                sessionInfo: {
                    sessionId: this.progressData.sessionId,
                    tutorialId: this.progressData.tutorialId,
                    userId: this.progressData.userId,
                    startTime: this.progressData.startTime,
                    endTime: this.progressData.endTime,
                    totalDuration: this.progressData.totalDuration
                },
                progress: {
                    completionStatus: this.progressData.completionStatus,
                    totalSteps: this.progressData.totalSteps,
                    completedSteps: this.progressData.completedSteps.size,
                    skippedSteps: this.progressData.skippedSteps.size,
                    revisitedSteps: this.progressData.revisitedSteps.size
                },
                performance: {
                    averageStepTime: this.sessionStats.averageStepTime,
                    totalInteractions: this.sessionStats.totalInteractions,
                    helpRequests: this.progressData.helpRequests.length,
                    errors: this.progressData.errors.length
                },
                engagement: this.sessionStats.userEngagement,
                stepDetails: Object.fromEntries(this.stepMetrics)
            };
            
            this.loggingSystem.info('TutorialProgressTracker', 'Final report generated', report);
            
            // ローカルストレージに保存
            localStorage.setItem(
                `${this.storageKeys.analytics}_${this.progressData.sessionId}`,
                JSON.stringify(report)
            );
            
            return report;
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.generateFinalReport');
            return null;
        }
    }
    
    /**
     * 進捗を保存
     */
    saveProgress(): void {
        try {
            const progressToSave = {
                ...this.progressData,
                completedSteps: Array.from(this.progressData.completedSteps),
                skippedSteps: Array.from(this.progressData.skippedSteps),
                revisitedSteps: Array.from(this.progressData.revisitedSteps),
                stepTimings: Object.fromEntries(this.progressData.stepTimings)
            };
            
            localStorage.setItem(this.storageKeys.progress, JSON.stringify(progressToSave));
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.saveProgress');
        }
    }
    
    /**
     * 保存された進捗を読み込み
     */
    loadStoredProgress(): void {
        try {
            const stored = localStorage.getItem(this.storageKeys.progress);
            if (!stored) return;
            
            const parsedData = JSON.parse(stored);
            // セットとマップを復元
            parsedData.completedSteps = new Set(parsedData.completedSteps);
            parsedData.skippedSteps = new Set(parsedData.skippedSteps);
            parsedData.revisitedSteps = new Set(parsedData.revisitedSteps);
            parsedData.stepTimings = new Map(Object.entries(parsedData.stepTimings));
            
            Object.assign(this.progressData, parsedData);
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.loadStoredProgress');
        }
    }
    
    /**
     * セッションIDを生成
     * @returns ユニークなセッションID
     */
    generateSessionId(): string {
        return `tutorial_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    
    /**
     * 現在の進捗情報を取得
     * @returns 進捗情報
     */
    getProgress(): any {
        return {
            sessionId: this.progressData.sessionId,
            tutorialId: this.progressData.tutorialId,
            currentStep: this.progressData.currentStep,
            totalSteps: this.progressData.totalSteps,
            completedSteps: this.progressData.completedSteps.size,
            skippedSteps: this.progressData.skippedSteps.size,
            completionRate: this.sessionStats.completionRate,
            averageStepTime: this.sessionStats.averageStepTime,
            totalDuration: (this.progressData.startTime ? Date.now() - this.progressData.startTime : 0),
            status: this.progressData.completionStatus
        };
    }
    
    /**
     * 詳細統計を取得
     * @returns 詳細統計
     */
    getDetailedStats(): any {
        return {
            sessionStats: this.sessionStats,
            progressData: this.progressData,
            stepMetrics: Object.fromEntries(this.stepMetrics)
        };
    }
    
    /**
     * 設定を更新
     * @param newConfig - 新しい設定
     */
    updateConfig(newConfig: Partial<AnalyticsConfig>): void {
        Object.assign(this.analyticsConfig, newConfig);
        
        // バッチ処理の再設定
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
            this.batchTimer = null;
        }
        
        this.setupBatchProcessing();
        this.loggingSystem.debug('TutorialProgressTracker', 'Configuration updated', newConfig);
    }
    
    /**
     * リソースをクリーンアップ
     */
    dispose(): void {
        try {
            if (this.batchTimer) {
                clearInterval(this.batchTimer);
                this.batchTimer = null;
            }
            
            // 残りのバッチデータを送信
            this.sendBatch(true);
            // 最終進捗を保存
            this.saveProgress();
            
            this.loggingSystem.debug('TutorialProgressTracker', 'Progress tracker disposed');
        } catch (error) {
            this.errorHandler.handle(error as Error, 'TutorialProgressTracker.dispose');
        }
    }
}

export default TutorialProgressTracker;