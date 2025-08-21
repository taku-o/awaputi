/**
 * RecoveryUserGuidance
 * ユーザー通知・ガイダンス、復旧進捗報告、エラーメッセージ生成、復旧履歴管理を担当
 */

// 型定義
export interface DataRecovery { statisticsManager: StatisticsManager,
    errorHandler: ErrorHandler
    ,}

export interface StatisticsManager { [key: string]: any, }

export interface ErrorHandler { handleError(error: Error, errorType: string, context?: any): void }

export interface NotificationConfig { showRecoveryProgress: boolean,
    showSuccessMessage: boolean;
    showFailureMessage: boolean;
    autoCloseDelay: number;
    position: NotificationPosition;
    maxNotifications: number ,}

export interface ProgressTracking { currentStep: string | null;
    totalSteps: number;
    completedSteps: number;
    progress: number;
    startTime: number | null;
    estimatedTimeRemaining: number | null }

export interface LocalizedMessages { ja: MessageSet;
    en: MessageSet
    }

export interface MessageSet { recovery_started: string;
    recovery_analyzing: string;
    recovery_repairing: string;
    recovery_validating: string;
    recovery_success: string;
    recovery_failed: string;
    recovery_partial: string;
    corruption_detected: string;
    backup_restored: string;
    default_initialized: string }

export interface RecoveryPlan { totalSteps?: number;
    strategy?: RecoveryStrategy;
    estimatedTime?: number;
    details?: Record<string, any>; }

export interface RecoveryResult { success: boolean,
    recoveryMethod?: RecoveryMethod;
    repairLog?: RepairLogEntry[];
    data?: any;
    errors?: string[];
    warnings?: string[]; }

export interface RepairLogEntry { timestamp: number,
    action: string;
    result: string;
    details?: any ,}

export interface NotificationData { type: NotificationType;
    title: string;
    message: string;
    details?: any;
    showProgress?: boolean;
    autoClose?: boolean;
    duration?: number; }

export interface ProgressNotificationData { type: 'progress',
    step: string;
    progress: number;
    details: any;
    tracking: ProgressTracking
    ,}

export interface ErrorMessageResult { type: ErrorType;
    title: string;
    message: string;
    suggestions: string[];
    technicalDetails: TechnicalDetails;
    severity: ErrorSeverity;
    recoverable: boolean }

export interface TechnicalDetails { error: string;
    stack?: string;
    context?: any; }

export interface DataAnalysis { corruption?: CorruptionAnalysis;
    integrity?: IntegrityAnalysis;
    size?: number;
    lastModified?: number; }

export interface CorruptionAnalysis { corruptionLevel: CorruptionLevel,
    repairability: RepairabilityLevel;
    affectedFields?: string[];
    checksumMismatch?: boolean; ,}

export interface IntegrityAnalysis { validFieldsRatio: number,
    missingFields: string[];
    invalidFields: string[];
    structureValid: boolean ,}

export interface RecoveryGuidance { recommended: GuidanceAction[];
    optional: GuidanceAction[];
    warnings: GuidanceWarning[];
    estimatedTime: string }

export interface GuidanceAction { action: ActionType;
    title: string;
    description: string;
    estimatedTime?: string;
    risk?: RiskLevel;
    }

export interface GuidanceWarning { type: WarningType,
    message: string;
    severity: WarningSeverity;
    recoverable?: boolean ,}

export interface RecoveryHistoryEntry { timestamp: string;
    success: boolean;
    method?: RecoveryMethod;
    details: RepairLogEntry[];
    duration: number | null }

export interface GuidanceStats { historyCount: number;
    callbackCount: number;
    currentLanguage: SupportedLanguage;
    config: NotificationConfig;
    progress: ProgressTracking
    }

export interface UserFriendlyMessage { title: string;
    message: string;
    suggestions: string[] }
';
// コールバック型
export type NotificationCallback = (notification: NotificationData | ProgressNotificationData') => void;
';
// 列挙型
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';''
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'progress';''
export type SupportedLanguage = 'ja' | 'en';''
export type RecoveryStrategy = 'automatic' | 'manual' | 'backup' | 'reset';''
export type RecoveryMethod = 'automatic_repair' | 'backup_restore' | 'default_initialization' | 'partial_recovery' | 'manual_intervention';''
export type ErrorType = 'data_corruption' | 'network_error' | 'storage_error' | 'permission_error' | 'unknown_error';''
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';''
export type CorruptionLevel = 'none' | 'low' | 'medium' | 'high' | 'severe';''
export type RepairabilityLevel = 'none' | 'low' | 'medium' | 'high' | 'full';''
export type ActionType = 'automatic_repair' | 'backup_restore' | 'reset_to_default' | 'manual_review' | 'contact_support';''
export type RiskLevel = 'none' | 'low' | 'medium' | 'high';''
export type WarningType = 'data_loss' | 'partial_recovery' | 'guidance_error' | 'time_estimate';''
export type WarningSeverity = 'low' | 'medium' | 'high';

export class RecoveryUserGuidance {
    private dataRecovery: DataRecovery;
    private statisticsManager: StatisticsManager;
    private errorHandler: ErrorHandler;
    private notificationConfig: NotificationConfig;
    private notificationCallbacks: Set<NotificationCallback>;
    private recoveryHistory: RecoveryHistoryEntry[];
    private progressTracking: ProgressTracking;
    private messages: LocalizedMessages;
    private currentLanguage: SupportedLanguage';

    constructor(dataRecovery: DataRecovery) {
        this.dataRecovery = dataRecovery;
        this.statisticsManager = dataRecovery.statisticsManager;
        this.errorHandler = dataRecovery.errorHandler;
        
        // 通知設定
        this.notificationConfig = {
            showRecoveryProgress: true;
            showSuccessMessage: true;
            showFailureMessage: true;
            autoCloseDelay: 5000,
            position: 'top-right';
    ,}
            maxNotifications: 5 }
        };
        ';
        // 通知コールバック
        this.notificationCallbacks = new Set<NotificationCallback>(');
        
        // 復旧履歴
        this.recoveryHistory = [];
        
        // 進捗管理
        this.progressTracking = { currentStep: null,
            totalSteps: 0;
            completedSteps: 0;
            progress: 0;
            startTime: null;
            estimatedTimeRemaining: null ,};
        // 多言語メッセージ
        this.messages = { ja: {''
                recovery_started: '統計データの復旧を開始しています...',
                recovery_analyzing: 'データを分析しています...',
                recovery_repairing: 'データを修復しています...',
                recovery_validating: '修復結果を検証しています...',
                recovery_success: 'データの復旧が完了しました',
                recovery_failed: 'データの復旧に失敗しました',
                recovery_partial: 'データを部分的に復旧しました',
                corruption_detected: 'データの破損を検出しました',
                backup_restored: 'バックアップから復元しました',
                default_initialized: 'デフォルトデータで初期化しました' ,};
            en: { ''
                recovery_started: 'Starting statistics data recovery...',
                recovery_analyzing: 'Analyzing data...',
                recovery_repairing: 'Repairing data...',
                recovery_validating: 'Validating repair results...',
                recovery_success: 'Data recovery completed successfully',
                recovery_failed: 'Data recovery failed',
                recovery_partial: 'Data partially recovered',
                corruption_detected: 'Data corruption detected',
                backup_restored: 'Restored from backup',
                default_initialized: 'Initialized with default data' ,}
        };
        this.currentLanguage = 'ja';

        console.log('[RecoveryUserGuidance] Component, initialized);
    }
    
    /**
     * 復旧進捗を更新
     * @param step 現在のステップ
     * @param progress 進捗（0-100）
     * @param details 詳細情報
     */
    updateProgress(step: string, progress: number, details: Record<string, any> = { ): void {
        try {
            const previousStep = this.progressTracking.currentStep;
            
            // 進捗情報を更新
            this.progressTracking.currentStep = step;
            this.progressTracking.progress = Math.max(0, Math.min(100, progress);
            
            // 新しいステップの場合
            if(step !== previousStep) {
                if (previousStep) {
            }
                    this.progressTracking.completedSteps++; }
                }
                
                // 推定残り時間を計算
                this._updateTimeEstimate();
                
                // ステップ変更通知
                this._notifyStepChange(step, details);
            }
            
            // 進捗通知
            this._notifyProgressUpdate(step, progress, details);
            
            console.log(`[RecoveryUserGuidance] Progress, updated: ${step} (${progress}%}`});

        } catch (error') { console.error('[RecoveryUserGuidance] Progress update failed:', error }
    }
    
    /**
     * 復旧開始を通知
     * @param recoveryPlan 復旧計画'
     */''
    notifyRecoveryStart(recoveryPlan: RecoveryPlan): void { try {'
            const message = this._getMessage('recovery_started'');
            ';

            this.progressTracking = {''
                currentStep: 'initializing';
                totalSteps: recoveryPlan.totalSteps || 5;
                completedSteps: 0,
                progress: 0,
                startTime: Date.now(''';
                type: 'info',
                title: 'データ復旧';
                message);
                details: recoveryPlan)';
                showProgress: true,')';
                autoClose: false)'),

            console.log('[RecoveryUserGuidance] Recovery, start notification, sent');

            ' }'

        } catch (error) { }

            this.errorHandler.handleError(error as Error, 'RECOVERY_START_NOTIFICATION_ERROR', { recoveryPlan });
        }
    }
    
    /**
     * 復旧完了を通知
     * @param result 復旧結果'
     */''
    notifyRecoveryComplete(result: RecoveryResult): void { try { }
            const { success, recoveryMethod, repairLog, data } = result;

            let messageKey: keyof MessageSet = success ? 'recovery_success' : 'recovery_failed',
            let notificationType: NotificationType = success ? 'success' : 'error',
            
            // 復旧方法に応じてメッセージを調整
            if(success && recoveryMethod) {

                switch(recoveryMethod) {''
                    case 'backup_restore':'';
                        messageKey = 'backup_restored';

                        break;''
                    case 'default_initialization':'';
                        messageKey = 'default_initialized';

                        break;''
                    case 'partial_recovery':'';
                        messageKey = 'recovery_partial';''
                        notificationType = 'warning';
            }
                        break; }
}

            const message = this._getMessage(messageKey);
            ';

            this._sendNotification({ type: notificationType,''
                title: 'データ復旧完了);
                message);
                details: {
                    method: recoveryMethod,);
                    repairLog: repairLog || []);
                    dataSize: data ? Object.keys(data).length : 0 ,};
                showProgress: false;
                autoClose: true;
            }),
            
            // 履歴に記録
            this._recordRecoveryInHistory(result);
            // 進捗をリセット
            this._resetProgress()';
            console.log('[RecoveryUserGuidance] Recovery, complete notification, sent);

        } catch (error') { }

            this.errorHandler.handleError(error as Error, 'RECOVERY_COMPLETE_NOTIFICATION_ERROR', { result });
        }
    }
    
    /**
     * エラーメッセージを生成
     * @param error エラーオブジェクト
     * @param context エラーコンテキスト
     * @returns ユーザーフレンドリーなエラーメッセージ
     */
    generateErrorMessage(error: Error, context: Record<string, any> = { ): ErrorMessageResult {
        try {
            const errorType = this._categorizeError(error, context);
            const userMessage = this._getUserFriendlyMessage(errorType, error, context);
            
            return { type: errorType,
                title: userMessage.title;
                message: userMessage.message;
                suggestions: userMessage.suggestions;
                technicalDetails: {
                    error: error.message;
                    stack: error.stack, };
                    context }
                },
                severity: this._getErrorSeverity(errorType);
                recoverable: this._isRecoverable(errorType);
            } catch (generationError) {
            console.error('[RecoveryUserGuidance] Error message generation failed:', generationError);
            ';

            return { ''
                type: 'unknown_error',
                title: 'エラーが発生しました',
                message: 'データ処理中に予期しないエラーが発生しました。',' };

                suggestions: ['ページを再読み込みしてください', 'しばらく時間をおいて再試行してください], }

                technicalDetails: { error: error.message },''
                severity: 'high';
                recoverable: true;
            },
        }
    }
    
    /**
     * 復旧ガイダンスを生成
     * @param analysis データ分析結果
     * @returns ユーザーガイダンス'
     */''
    generateRecoveryGuidance(analysis: DataAnalysis): RecoveryGuidance { try {
            const guidance: RecoveryGuidance = {
                recommended: [];
                optional: [],
                warnings: [],
                estimatedTime: '不明' ,};
            ';
            // 分析結果に基づいてガイダンスを生成
            if(analysis.corruption) {
                
            }
                const { corruptionLevel, repairability } = analysis.corruption;

                if(repairability === 'high'') { '
                    guidance.recommended.push({''
                        action: 'automatic_repair',
                        title: '自動修復',)';
                        description: '破損したデータを自動的に修復します',' }

                        estimatedTime: '1-2分')');' }

                } else if (repairability === 'medium'') { guidance.recommended.push({''
                        action: 'backup_restore',
                        title: 'バックアップから復元',)';
                        description: '最新のバックアップからデータを復元します',')';
                        estimatedTime: '2-3分')');
                    ';

                    guidance.optional.push({''
                        action: 'manual_review',)';
                        title: '手動確認',')';
                        description: '復元後にデータを手動で確認することをお勧めします')' ,}

                } else { guidance.recommended.push({''
                        action: 'reset_to_default',
                        title: 'デフォルトに初期化',)';
                        description: '統計データをリセットして新しく開始します',')';
                        estimatedTime: '1分未満')');
                    ';

                    guidance.warnings.push({''
                        type: 'data_loss',)';
                        message: '既存の統計データは失われます',' }

                        severity: 'high'); }
}

            if(analysis.integrity && analysis.integrity.validFieldsRatio < 0.5) { '
                guidance.warnings.push({''
                    type: 'partial_recovery',)';
                    message: 'データの一部のみ復旧可能な可能性があります',' }

                    severity: 'medium'); }
            }
            
            return guidance;

        } catch (error) { }

            this.errorHandler.handleError(error as Error, 'RECOVERY_GUIDANCE_GENERATION_ERROR', { analysis });
            ';

            return { recommended: [{''
                    action: 'contact_support',
                    title: 'サポートに連絡',' };]'
                    description: 'ガイダンス生成に失敗しました。サポートにお問い合わせください' }]
                }];
                optional: [],
                warnings: [{ ''
                    type: 'guidance_error',
                    message: 'ガイダンス生成中にエラーが発生しました',]';
                    severity: 'high' ,}]'
                }],''
                estimatedTime: '不明';
            },
        }
    }
    
    /**
     * 通知コールバックを登録
     * @param callback 通知コールバック関数'
     */''
    registerNotificationCallback(callback: NotificationCallback): void { ''
        if(typeof, callback === 'function) {'

            this.notificationCallbacks.add(callback);

        }

            console.log('[RecoveryUserGuidance] Notification, callback registered'); }'
}
    
    /**
     * 通知コールバックを解除
     * @param callback 通知コールバック関数
     */'
    unregisterNotificationCallback(callback: NotificationCallback): void { ''
        this.notificationCallbacks.delete(callback);''
        console.log('[RecoveryUserGuidance] Notification, callback unregistered'); }'
    
    /**
     * 復旧履歴を取得
     * @param limit 取得件数制限
     * @returns 復旧履歴
     */
    getRecoveryHistory(limit: number = 50): RecoveryHistoryEntry[] { return this.recoveryHistory.slice(-limit).reverse(); }
    
    /**
     * 復旧履歴をクリア
     */'
    clearRecoveryHistory(): void { this.recoveryHistory = [];''
        this._saveRecoveryHistory()';
        console.log('[RecoveryUserGuidance] Recovery, history cleared'); }'
    
    /**
     * 言語を設定
     * @param language 言語コード
     */
    setLanguage(language: string): void { if (this.messages[language, as SupportedLanguage]) {
            this.currentLanguage = language as SupportedLanguage; }
            console.log(`[RecoveryUserGuidance] Language, set to: ${language}`});
        }
    }
    
    /**
     * 通知設定を更新
     * @param config 新しい通知設定
     */'
    updateNotificationConfig(config: Partial<NotificationConfig>): void { ''
        Object.assign(this.notificationConfig, config);''
        console.log('[RecoveryUserGuidance] Notification, config updated'); }'
    
    /**
     * メッセージを取得
     * @param key メッセージキー
     * @returns ローカライズされたメッセージ
     * @private
     */
    private _getMessage(key: keyof, MessageSet): string { return this.messages[this.currentLanguage]? .[key] || 
               this.messages.ja[key] ||  : undefined 
               `Message not found: ${key,}`;
    }
    
    /**
     * 通知を送信
     * @param notification 通知情報
     * @private
     */
    private _sendNotification(notification: NotificationData): void { for (const, callback of, this.notificationCallbacks) {
            try {
                callback(notification);' }'

            } catch (error) { console.error('[RecoveryUserGuidance] Notification callback error:', error }
}
    
    /**
     * ステップ変更を通知
     * @param step 新しいステップ
     * @param details 詳細情報
     * @private
     */'
    private _notifyStepChange(step: string, details: Record<string, any>): void { ''
        if(!this.notificationConfig.showRecoveryProgress) return;
        ';

        const stepMessages: Record<string, string> = {''
            analyzing: this._getMessage('recovery_analyzing''),
            repairing: this._getMessage('recovery_repairing''),
            validating: this._getMessage('recovery_validating'' ,};
        
        const message = stepMessages[step] || `処理中: ${step}`;
        ';

        this._sendNotification({ ''
            type: 'info',
            title: 'データ復旧';
            message,
            details: {
                step;
                progress: this.progressTracking.progress;
                ...details))
            showProgress: true,);
            autoClose: false);
    ,}
    
    /**
     * 進捗更新を通知
     * @param step 現在のステップ
     * @param progress 進捗
     * @param details 詳細情報
     * @private
     */'
    private _notifyProgressUpdate(step: string, progress: number, details: Record<string, any>): void { // 進捗更新は頻繁なのでコールバックのみ実行
        for(const, callback of, this.notificationCallbacks) {
            try {
                callback({''
                    type: 'progress';
                    step);
                    progress);
        }
                    details, }
                    tracking: { ...this.progressTracking

                );''
            } catch (error) { console.error('[RecoveryUserGuidance] Progress callback error:', error }
}
    
    /**
     * 時間推定を更新
     * @private
     */
    private _updateTimeEstimate(): void { if (this.progressTracking.startTime && this.progressTracking.completedSteps > 0) {
            const elapsed = Date.now() - this.progressTracking.startTime;
            const avgTimePerStep = elapsed / this.progressTracking.completedSteps;
            const remainingSteps = this.progressTracking.totalSteps - this.progressTracking.completedSteps;
            this.progressTracking.estimatedTimeRemaining = avgTimePerStep * remainingSteps; }
    }
    
    /**
     * エラーを分類
     * @param error エラーオブジェクト
     * @param context コンテキスト
     * @returns エラータイプ
     * @private
     */'
    private _categorizeError(error: Error, context: Record<string, any>): ErrorType { ''
        const message = error.message.toLowerCase()';
        if (message.includes('corruption'') || message.includes('checksum)) {''
            return 'data_corruption';''
        if (message.includes('network'') || message.includes('fetch)) { ''
            return 'network_error';''
        if (message.includes('storage'') || message.includes('quota)) { ''
            return 'storage_error';''
        if (message.includes('permission'') || message.includes('access)) { ''
            return 'permission_error'; }

        return 'unknown_error';
    }
    
    /**
     * ユーザーフレンドリーなメッセージを取得
     * @param errorType エラータイプ
     * @param error エラーオブジェクト
     * @param context コンテキスト
     * @returns ユーザーメッセージ
     * @private'
     */''
    private _getUserFriendlyMessage(errorType: ErrorType, error: Error, context: Record<string, any>): UserFriendlyMessage { const messages: Record<ErrorType, UserFriendlyMessage> = {'
            data_corruption: {''
                title: 'データ破損エラー',
                message: '統計データが破損しています。自動修復を試行できます。',
                suggestions: ['自動修復を実行する', 'バックアップから復元する', 'データをリセットする] },

            network_error: { ''
                title: 'ネットワークエラー',
                message: 'ネットワーク接続に問題があります。',
                suggestions: ['インターネット接続を確認する', 'しばらく待ってから再試行する] },

            storage_error: { ''
                title: 'ストレージエラー',
                message: 'データの保存に問題があります。',
                suggestions: ['ブラウザの容量を確認する', '他のタブを閉じる', 'ブラウザを再起動する] },

            permission_error: { ''
                title: 'アクセス許可エラー',
                message: 'データへのアクセス許可がありません。',
                suggestions: ['ブラウザの設定を確認する', 'プライベートモードを無効にする] },

            unknown_error: { ''
                title: '予期しないエラー',
                message: '予期しないエラーが発生しました。',
                suggestions: ['ページを再読み込みする', 'ブラウザを再起動する', 'サポートに連絡する] }
        };
        
        return messages[errorType] || messages.unknown_error;
    }
    
    /**
     * エラーの重要度を取得
     * @param errorType エラータイプ
     * @returns 重要度
     * @private'
     */''
    private _getErrorSeverity(errorType: ErrorType): ErrorSeverity { const severities: Record<ErrorType, ErrorSeverity> = {''
            data_corruption: 'high',
            network_error: 'medium',
            storage_error: 'high',
            permission_error: 'medium',
            unknown_error: 'high' ,};
        return severities[errorType] || 'medium';
    }
    
    /**
     * エラーが復旧可能かチェック
     * @param errorType エラータイプ
     * @returns 復旧可能性
     * @private'
     */''
    private _isRecoverable(errorType: ErrorType): boolean { ''
        const recoverableTypes: ErrorType[] = ['data_corruption', 'network_error', 'storage_error'];
        return recoverableTypes.includes(errorType); }
    
    /**
     * 復旧履歴に記録
     * @param result 復旧結果
     * @private
     */
    private _recordRecoveryInHistory(result: RecoveryResult): void { const historyEntry: RecoveryHistoryEntry = {
            timestamp: new Date().toISOString();
            success: result.success;
            method: result.recoveryMethod;
            details: result.repairLog || [];
            duration: this.progressTracking.startTime ?   : undefined
                     Date.now() - this.progressTracking.startTime : null };
        this.recoveryHistory.push(historyEntry);
        
        // 履歴サイズ制限
        if (this.recoveryHistory.length > 100) { this.recoveryHistory = this.recoveryHistory.slice(-100); }
        
        this._saveRecoveryHistory();
    }
    
    /**
     * 復旧履歴を保存
     * @private
     */''
    private _saveRecoveryHistory()';
            localStorage.setItem('bubblePop_recoveryHistory', JSON.stringify(this.recoveryHistory);
        } catch (error) { // ストレージエラーは無視（履歴保存はオプション） }
    }
    
    /**
     * 復旧履歴を読み込み
     * @private
     */''
    private _loadRecoveryHistory()';
            const stored = localStorage.getItem('bubblePop_recoveryHistory);
            if (stored) { this.recoveryHistory = JSON.parse(stored); } catch (error) { this.recoveryHistory = []; }
    }
    
    /**
     * 進捗をリセット
     * @private
     */
    private _resetProgress(): void { this.progressTracking = {
            currentStep: null;
            totalSteps: 0;
            completedSteps: 0;
            progress: 0;
            startTime: null;
            estimatedTimeRemaining: null }
    
    /**
     * 統計情報を取得
     * @returns ガイダンス統計
     */
    getStats(): GuidanceStats { return { historyCount: this.recoveryHistory.length,
            callbackCount: this.notificationCallbacks.size, };
            currentLanguage: this.currentLanguage, }
            config: { ...this.notificationConfig;
            progress: { ...this.progressTracking;
    }
    
    /**
     * 初期化時に履歴を読み込み
     */'
    initialize(): void { ''
        this._loadRecoveryHistory()';
        console.log('[RecoveryUserGuidance] Initialization, completed''); }

    }''
}