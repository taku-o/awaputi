/**
 * TutorialProgressTracker.ts
 * チュートリアル進捗追跡システム
 * TutorialOverlayから分離された進捗管理・分析機能
 */

import { getErrorHandler  } from '../../../utils/ErrorHandler.js';
import { LoggingSystem  } from '../../LoggingSystem.js';

// 型定義
export interface ProgressData { sessionId: string,
    userId: string | null,
    tutorialId: string | null,
    startTime: number | null,
    endTime: number | null,
    totalDuration: number,
    currentStep: number,
    totalSteps: number,
    completedSteps: Set<number>,
    skippedSteps: Set<number>,
    revisitedSteps: Set<number>,
    stepTimings: Map<number, StepTiming>,
    userActions: UserAction[],
    errors: ErrorRecord[],
    helpRequests: HelpRequest[],
    completionStatus: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
            }

export interface StepTiming { stepIndex: number,
    startTime: number,
    endTime?: number,
    duration?: number,
    interactions: number }

export interface UserAction { type: string,
    timestamp: number,
    stepIndex: number,
    data: any }

export interface ErrorRecord { message: string,
    timestamp: number,
    stepIndex: number,
    stack?: string,
    context: string }

export interface HelpRequest { type: string,
    timestamp: number,
    stepIndex: number,
    query?: string }

export interface SessionStats { totalInteractions: number,
    averageStepTime: number,
    completionRate: number,
    helpRequestRate: number,
    skipRate: number,
    errorRate: number,
    userEngagement: {
        scroll,s: number,
        clicks: number,
        keystrokes: number,
    gestures: number }

export interface AnalyticsConfig { trackDetailedActions: boolean,
    trackTimings: boolean,
    trackErrors: boolean,
    trackEngagement: boolean,
    sendToServer: boolean,
    serverEndpoint: string | null,
    batchSize: number,
    batchInterval: number  }

export interface StorageKeys { progress: string,
    analytics: string,
    userPreferences: string }

export interface TutorialData { id: string,
    steps?: any[] }

export class TutorialProgressTracker {
    private errorHandler: any,
    private loggingSystem: LoggingSystem,
    private progressData: ProgressData,
    private, stepMetrics: Map<number, any>,
    private sessionStats: SessionStats,
    private analyticsConfig: AnalyticsConfig,
    private storageKeys: StorageKeys,
    private batchQueue: any[],
    private, batchTimer: number | null,
    constructor() {

        this.errorHandler = getErrorHandler(),
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem(),
        
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
            revisitedSteps: new Set<number>(
            stepTimings: new Map<number, StepTiming>(),
            userActions: [],
    errors: [],
            helpRequests: [] }

            completionStatus: 'not_started' 
    };
        ';
        // ステップレベルの詳細データ
        this.stepMetrics = new Map('''
            progress: 'tutorial_progress',
            analytics: 'tutorial_analytics',
            userPreferences: 'tutorial_user_prefs);
            });
        // バッチ送信用データ
        this.batchQueue = [];
        this.batchTimer = null;
        
        this.initialize();
    }
    
    /**
     * 進捗追跡システムを初期化
     */
    initialize(): void { try {
            this.loadStoredProgress(),
            this.setupBatchProcessing()',
            this.loggingSystem.debug('TutorialProgressTracker', 'Progress tracker initialized',' }

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.initialize' }'
    }
    
    /**
     * チュートリアル開始を記録
     * @param tutorial - チュートリアル情報
     * @param userId - ユーザーID（オプション）
     */
    startTracking(tutorial: TutorialData, userId: string | null = null): void { try {
            this.progressData = {
                sessionId: this.generateSessionId(),
                userId: userId,
                tutorialId: tutorial.id,
                startTime: Date.now(),
                endTime: null,
                totalDuration: 0,
                currentStep: 0,
                totalSteps: tutorial.steps ? tutorial.steps.length : 0,
                completedSteps: new Set(
    skippedSteps: new Set(
                revisitedSteps: new Set(
                stepTimings: new Map('',
    completionStatus: 'in_progress'
            };
            this.sessionStats = { totalInteractions: 0,
                averageStepTime: 0,
                completionRate: 0,
                helpRequestRate: 0,
                skipRate: 0,
                errorRate: 0,
    userEngagement: {
                    scrolls: 0,
                    clicks: 0,
                    keystrokes: 0,
    gestures: 0  }
            };
            this.stepMetrics.clear()';
            this.recordEvent('tutorial_started', { tutorialId: tutorial.id', totalSteps: this.progressData.totalSteps,')',
                userId: userId',
            ' }'

            this.loggingSystem.info('TutorialProgressTracker', `Tracking started for tutorial: ${tutorial.id}`});

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.startTracking' }'
    }
    
    /**
     * ステップ開始を記録
     * @param {number} stepIndex - ステップインデックス
     * @param {Object} stepData - ステップデータ
     */
    recordStepStart(stepIndex, stepData) {
        try {
            this.progressData.currentStep = stepIndex,
            
            // 前のステップの終了時間を記録
            if (this.currentStepStartTime) {
                const previousStepIndex = stepIndex - 1,
                const stepDuration = Date.now() - this.currentStepStartTime,
                this.progressData.stepTimings.set(previousStepIndex, stepDuration) }
                this.updateStepMetrics(previousStepIndex, { duration: stepDuration }
            
            this.currentStepStartTime = Date.now();
            
            // 再訪問チェック
            if(this.progressData.completedSteps.has(stepIndex) { this.progressData.revisitedSteps.add(stepIndex) }

            this.initializeStepMetrics(stepIndex, stepData);

            this.recordEvent('step_started', { stepIndex: stepIndex)
                stepTitle: stepData.title,
    isRevisit: this.progressData.revisitedSteps.has(stepIndex });

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordStepStart' }'
    }
    
    /**
     * ステップ完了を記録
     * @param {number} stepIndex - ステップインデックス
     * @param {Object} completionData - 完了データ
     */
    recordStepComplete(stepIndex, completionData = { ) {
        try {
            this.progressData.completedSteps.add(stepIndex),
            
            const stepDuration = Date.now() - this.currentStepStartTime,
            this.progressData.stepTimings.set(stepIndex, stepDuration),
            
            this.updateStepMetrics(stepIndex, {
                duration: stepDuration)',
    completed: true,')',
                completionData: completionData',

            this.recordEvent('step_completed', {)
                stepIndex: stepIndex,
    duration: stepDuration),
                ...completionData),
            
            this.updateSessionStats(),
            this.saveProgress() })

            ' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordStepComplete') }
    }
    
    /**
     * ステップスキップを記録
     * @param {number} stepIndex - ステップインデックス
     * @param {string} reason - スキップ理由'
     */''
    recordStepSkip(stepIndex, reason = 'user_choice' { try {'
            this.progressData.skippedSteps.add(stepIndex),
            
            this.updateStepMetrics(stepIndex, {)'
                skipped: true,')',
                skipReason: reason',

            this.recordEvent('step_skipped', {
                stepIndex: stepIndex),
                reason: reason',
            this.updateSessionStats(  })

            ' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordStepSkip' }'
    }
    
    /**
     * ユーザーアクションを記録
     * @param {string} actionType - アクション種別
     * @param {Object} actionData - アクションデータ
     */
    recordUserAction(actionType, actionData = { ) {
        try {
            if (!this.analyticsConfig.trackDetailedActions) return,
            
            const action = {
                type: actionType,
                timestamp: Date.now(
    stepIndex: this.progressData.currentStep }
                data: actionData 
    };
            this.progressData.userActions.push(action);
            this.sessionStats.totalInteractions++;
            
            // エンゲージメント統計を更新
            this.updateEngagementStats(actionType);
            
            // バッチキューに追加
            this.addToBatch(action);

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordUserAction') }
    }
    
    /**
     * エラーを記録
     * @param {Error} error - エラーオブジェクト
     * @param {string} context - エラー発生コンテキスト'
     */''
    recordError(error, context = ') {
        try {
            if (!this.analyticsConfig.trackErrors) return,
            
            const errorRecord = {
                message: error.message,
                stack: error.stack,
                context: context,
    timestamp: Date.now() }
                stepIndex: this.progressData.currentStep 
    };
            this.progressData.errors.push(errorRecord);

            this.recordEvent('error_occurred', errorRecord);

        } catch (recordError) {
            this.errorHandler.handleError(recordError, 'TutorialProgressTracker.recordError' }'
    }
    
    /**
     * ヘルプリクエストを記録
     * @param {string} helpType - ヘルプ種別
     * @param {Object} helpData - ヘルプデータ
     */
    recordHelpRequest(helpType, helpData = { ) {
        try {
            const helpRequest = {
                type: helpType,
                timestamp: Date.now(
    stepIndex: this.progressData.currentStep }
                data: helpData 
    };
            this.progressData.helpRequests.push(helpRequest);

            this.recordEvent('help_requested', helpRequest);

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordHelpRequest') }
    }
    
    /**'
     * チュートリアル完了を記録''
     * @param {string} completionType - 完了種別 ('completed', 'abandoned')'
     */''
    recordTutorialEnd(completionType = 'completed' {'
        try {
            this.progressData.endTime = Date.now(),
            this.progressData.totalDuration = this.progressData.endTime - this.progressData.startTime,
            this.progressData.completionStatus = completionType,
            
            // 最後のステップのタイミングを記録
            if (this.currentStepStartTime) {
                const lastStepDuration = Date.now() - this.currentStepStartTime }
                this.progressData.stepTimings.set(this.progressData.currentStep, lastStepDuration); }
            }

            this.updateSessionStats('''
            this.recordEvent('tutorial_ended', { completionType: completionType,
                totalDuration: this.progressData.totalDuration),
                completedSteps: this.progressData.completedSteps.size,
    skippedSteps: this.progressData.skippedSteps.size),
                totalSteps: this.progressData.totalSteps),
            this.generateFinalReport(),
            this.saveProgress(),
            this.sendBatch(true), // 強制送信
            '
            }'

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordTutorialEnd' }'
    }
    
    /**
     * イベントを記録
     * @param {string} eventType - イベント種別
     * @param {Object} eventData - イベントデータ
     */
    recordEvent(eventType, eventData = { ) {
        try {
            const event = {'
                type: eventType,
                timestamp: Date.now()',
            this.loggingSystem.debug('TutorialProgressTracker', `Event recorded: ${eventType }`, event}
    }
            this.addToBatch(event});

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.recordEvent' }'
    }
    
    /**
     * ステップメトリクスを初期化
     * @param {number} stepIndex - ステップインデックス
     * @param {Object} stepData - ステップデータ
     */
    initializeStepMetrics(stepIndex, stepData) {
        this.stepMetrics.set(stepIndex, {),
            startTime: Date.now(),
            duration: 0,
            completed: false,
            skipped: false,
            interactions: 0,
            helpRequests: 0,
            errors: 0,
    revisitCount: this.progressData.revisitedSteps.has(stepIndex) ? 1 : 0 }
            stepData: stepData 
    });
    }
    
    /**
     * ステップメトリクスを更新
     * @param {number} stepIndex - ステップインデックス
     * @param {Object} updates - 更新データ
     */
    updateStepMetrics(stepIndex, updates) {
    
}
        const metrics = this.stepMetrics.get(stepIndex) || {};
        Object.assign(metrics, updates);
        this.stepMetrics.set(stepIndex, metrics);
    }
    
    /**
     * セッション統計を更新
     */
    updateSessionStats() {
        try {
            const completedCount = this.progressData.completedSteps.size,
            const skippedCount = this.progressData.skippedSteps.size,
            const totalSteps = this.progressData.totalSteps,
            
            this.sessionStats.completionRate = totalSteps > 0 ? completedCount / totalSteps: 0,
            this.sessionStats.skipRate = totalSteps > 0 ? skippedCount / totalSteps: 0,
            this.sessionStats.helpRequestRate = this.sessionStats.totalInteractions > 0 ? undefined : undefined
                this.progressData.helpRequests.length / this.sessionStats.totalInteractions: 0,
            this.sessionStats.errorRate = this.sessionStats.totalInteractions > 0 ? undefined : undefined
                this.progressData.errors.length / this.sessionStats.totalInteractions: 0,
            
            // 平均ステップ時間を計算
            if (this.progressData.stepTimings.size > 0) {
                const totalTime = Array.from(this.progressData.stepTimings.values(),
                    .reduce((sum, time) => sum + time, 0) }
                this.sessionStats.averageStepTime = totalTime / this.progressData.stepTimings.size;' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.updateSessionStats' }'
    }
    
    /**
     * エンゲージメント統計を更新
     * @param {string} actionType - アクション種別
     */
    updateEngagementStats(actionType) {

        switch(actionType) {''
            case 'scroll':,
                this.sessionStats.userEngagement.scrolls++,

                break,
            case 'click':',
            case 'tap':,
                this.sessionStats.userEngagement.clicks++,

                break,
            case 'keydown':',
            case 'keypress':,
                this.sessionStats.userEngagement.keystrokes++,

                break,
            case 'swipe':',
            case 'gesture':,
                this.sessionStats.userEngagement.gestures++ }
                break; }
}
    
    /**
     * バッチ処理を設定
     */
    setupBatchProcessing() {
        if (!this.analyticsConfig.sendToServer) return }
        this.batchTimer = setInterval(() => {  }
            this.sendBatch(); }
        }, this.analyticsConfig.batchInterval);
    }
    
    /**
     * データをバッチキューに追加
     * @param {Object} data - 追加するデータ
     */
    addToBatch(data) {
        this.batchQueue.push(data),
        
        if (this.batchQueue.length >= this.analyticsConfig.batchSize) {
    }
            this.sendBatch(); }
}
    
    /**
     * バッチデータを送信
     * @param {boolean} force - 強制送信フラグ
     */
    async sendBatch(force = false) { try {
            if (!this.analyticsConfig.sendToServer || !this.analyticsConfig.serverEndpoint) return,
            if(this.batchQueue.length === 0 && !force) return,
            
            const dataToSend = [...this.batchQueue],
            this.batchQueue = [],
            ',

            const response = await fetch(this.analyticsConfig.serverEndpoint, {)'
                method: 'POST')',
    headers: {', 'Content-Type': 'application/json'),
                body: JSON.stringify({)
                    sessionId: this.progressData.sessionId),
                    events: dataToSend,
    timestamp: Date.now() });
            });
            ';

            if (!response.ok) { }'

                throw new Error(`Server, responded with, status: ${response.status}`}';
            }

            this.loggingSystem.debug('TutorialProgressTracker', `Batch sent: ${dataToSend.length} events`});

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.sendBatch),
            // 送信失敗時はデータを戻す
            this.batchQueue.unshift(...dataToSend) }
    
    /**
     * 最終レポートを生成
     */
    generateFinalReport() {
        try {
            const report = {
                sessionInfo: {
                    sessionId: this.progressData.sessionId,
                    tutorialId: this.progressData.tutorialId,
                    userId: this.progressData.userId,
                    startTime: this.progressData.startTime,
    endTime: this.progressData.endTime }
                    totalDuration: this.progressData.totalDuration 
    };
                progress: { completionStatus: this.progressData.completionStatus,
                    totalSteps: this.progressData.totalSteps,
                    completedSteps: this.progressData.completedSteps.size,
                    skippedSteps: this.progressData.skippedSteps.size,
    revisitedSteps: this.progressData.revisitedSteps.size };
                performance: { averageStepTime: this.sessionStats.averageStepTime,
                    totalInteractions: this.sessionStats.totalInteractions,
                    helpRequests: this.progressData.helpRequests.length,
    errors: this.progressData.errors.length };
                engagement: this.sessionStats.userEngagement,
                stepDetails: Object.fromEntries(this.stepMetrics);
            };

            this.loggingSystem.info('TutorialProgressTracker', 'Final report generated', report);
            
            // ローカルストレージに保存
            localStorage.setItem(`${this.storageKeys.analytics}_${ this.progressData.sessionId}`
            }
                JSON.stringify(report)});
            
            return report;

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.generateFinalReport),
            return null,
    
    /**
     * 進捗を保存
     */
    saveProgress() {
        try {
            const progressToSave = {
                ...this.progressData,
                completedSteps: Array.from(this.progressData.completedSteps),
                skippedSteps: Array.from(this.progressData.skippedSteps,
    revisitedSteps: Array.from(this.progressData.revisitedSteps) }
                stepTimings: Object.fromEntries(this.progressData.stepTimings); 
    };
            
            localStorage.setItem(this.storageKeys.progress, JSON.stringify(progressToSave);

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.saveProgress' }'
    }
    
    /**
     * 保存された進捗を読み込み
     */
    loadStoredProgress() {
        try {
            const stored = localStorage.getItem(this.storageKeys.progress),
            if (!stored) return,
            
            const parsedData = JSON.parse(stored),
            
            // セットとマップを復元
            parsedData.completedSteps = new Set(parsedData.completedSteps),
            parsedData.skippedSteps = new Set(parsedData.skippedSteps),
            parsedData.revisitedSteps = new Set(parsedData.revisitedSteps),
            parsedData.stepTimings = new Map(Object.entries(parsedData.stepTimings),
            
            Object.assign(this.progressData, parsedData) }
            ' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.loadStoredProgress' }'
    }
    
    /**
     * セッションIDを生成
     * @returns {string} ユニークなセッションID
     */
    generateSessionId() {
    
}
        return `tutorial_${Date.now())_${Math.random().toString(36}.substring(2, 15})`;
    }
    
    /**
     * 現在の進捗情報を取得
     * @returns {Object} 進捗情報
     */
    getProgress() {
        return { sessionId: this.progressData.sessionId,
            tutorialId: this.progressData.tutorialId,
            currentStep: this.progressData.currentStep,
            totalSteps: this.progressData.totalSteps,
            completedSteps: this.progressData.completedSteps.size,
            skippedSteps: this.progressData.skippedSteps.size,
            completionRate: this.sessionStats.completionRate,
    averageStepTime: this.sessionStats.averageStepTime }
            totalDuration: Date.now() - this.progressData.startTime };
            status: this.progressData.completionStatus 
    }
    
    /**
     * 詳細統計を取得
     * @returns {Object} 詳細統計
     */
    getDetailedStats() {
        return { sessionStats: this.sessionStats }
            progressData: this.progressData };
            stepMetrics: Object.fromEntries(this.stepMetrics); 
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.analyticsConfig, newConfig),
        
        // バッチ処理の再設定
        if (this.batchTimer) {
            clearInterval(this.batchTimer) }
            this.batchTimer = null; }
        }''
        this.setupBatchProcessing()';
        this.loggingSystem.debug('TutorialProgressTracker', 'Configuration updated', newConfig);
    }
    
    /**
     * リソースをクリーンアップ
     */
    dispose() {
        try {
            if (this.batchTimer) {
                clearInterval(this.batchTimer) }
                this.batchTimer = null; }
            }
            
            // 残りのバッチデータを送信
            this.sendBatch(true);
            // 最終進捗を保存
            this.saveProgress()';
            this.loggingSystem.debug('TutorialProgressTracker', 'Progress tracker disposed';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialProgressTracker.dispose') }

    }'}