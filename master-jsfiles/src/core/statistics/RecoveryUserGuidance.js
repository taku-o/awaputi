/**
 * RecoveryUserGuidance
 * ユーザー通知・ガイダンス、復旧進捗報告、エラーメッセージ生成、復旧履歴管理を担当
 */
export class RecoveryUserGuidance {
    constructor(dataRecovery) {
        this.dataRecovery = dataRecovery;
        this.statisticsManager = dataRecovery.statisticsManager;
        this.errorHandler = dataRecovery.errorHandler;
        
        // 通知設定
        this.notificationConfig = {
            showRecoveryProgress: true,
            showSuccessMessage: true,
            showFailureMessage: true,
            autoCloseDelay: 5000,
            position: 'top-right',
            maxNotifications: 5
        };
        
        // 通知コールバック
        this.notificationCallbacks = new Set();
        
        // 復旧履歴
        this.recoveryHistory = [];
        
        // 進捗管理
        this.progressTracking = {
            currentStep: null,
            totalSteps: 0,
            completedSteps: 0,
            progress: 0,
            startTime: null,
            estimatedTimeRemaining: null
        };
        
        // 多言語メッセージ
        this.messages = {
            ja: {
                recovery_started: '統計データの復旧を開始しています...',
                recovery_analyzing: 'データを分析しています...',
                recovery_repairing: 'データを修復しています...',
                recovery_validating: '修復結果を検証しています...',
                recovery_success: 'データの復旧が完了しました',
                recovery_failed: 'データの復旧に失敗しました',
                recovery_partial: 'データを部分的に復旧しました',
                corruption_detected: 'データの破損を検出しました',
                backup_restored: 'バックアップから復元しました',
                default_initialized: 'デフォルトデータで初期化しました'
            },
            en: {
                recovery_started: 'Starting statistics data recovery...',
                recovery_analyzing: 'Analyzing data...',
                recovery_repairing: 'Repairing data...',
                recovery_validating: 'Validating repair results...',
                recovery_success: 'Data recovery completed successfully',
                recovery_failed: 'Data recovery failed',
                recovery_partial: 'Data partially recovered',
                corruption_detected: 'Data corruption detected',
                backup_restored: 'Restored from backup',
                default_initialized: 'Initialized with default data'
            }
        };
        
        this.currentLanguage = 'ja';
        
        console.log('[RecoveryUserGuidance] Component initialized');
    }
    
    /**
     * 復旧進捗を更新
     * @param {string} step 現在のステップ
     * @param {number} progress 進捗（0-100）
     * @param {Object} details 詳細情報
     */
    updateProgress(step, progress, details = {}) {
        try {
            const previousStep = this.progressTracking.currentStep;
            
            // 進捗情報を更新
            this.progressTracking.currentStep = step;
            this.progressTracking.progress = Math.max(0, Math.min(100, progress));
            
            // 新しいステップの場合
            if (step !== previousStep) {
                if (previousStep) {
                    this.progressTracking.completedSteps++;
                }
                
                // 推定残り時間を計算
                this._updateTimeEstimate();
                
                // ステップ変更通知
                this._notifyStepChange(step, details);
            }
            
            // 進捗通知
            this._notifyProgressUpdate(step, progress, details);
            
            console.log(`[RecoveryUserGuidance] Progress updated: ${step} (${progress}%)`);
            
        } catch (error) {
            console.error('[RecoveryUserGuidance] Progress update failed:', error);
        }
    }
    
    /**
     * 復旧開始を通知
     * @param {Object} recoveryPlan 復旧計画
     */
    notifyRecoveryStart(recoveryPlan) {
        try {
            const message = this._getMessage('recovery_started');
            
            this.progressTracking = {
                currentStep: 'initializing',
                totalSteps: recoveryPlan.totalSteps || 5,
                completedSteps: 0,
                progress: 0,
                startTime: Date.now(),
                estimatedTimeRemaining: null
            };
            
            this._sendNotification({
                type: 'info',
                title: 'データ復旧',
                message,
                details: recoveryPlan,
                showProgress: true,
                autoClose: false
            });
            
            console.log('[RecoveryUserGuidance] Recovery start notification sent');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'RECOVERY_START_NOTIFICATION_ERROR', { recoveryPlan });
        }
    }
    
    /**
     * 復旧完了を通知
     * @param {Object} result 復旧結果
     */
    notifyRecoveryComplete(result) {
        try {
            const { success, recoveryMethod, repairLog, data } = result;
            
            let messageKey = success ? 'recovery_success' : 'recovery_failed';
            let notificationType = success ? 'success' : 'error';
            
            // 復旧方法に応じてメッセージを調整
            if (success && recoveryMethod) {
                switch (recoveryMethod) {
                    case 'backup_restore':
                        messageKey = 'backup_restored';
                        break;
                    case 'default_initialization':
                        messageKey = 'default_initialized';
                        break;
                    case 'partial_recovery':
                        messageKey = 'recovery_partial';
                        notificationType = 'warning';
                        break;
                }
            }
            
            const message = this._getMessage(messageKey);
            
            this._sendNotification({
                type: notificationType,
                title: 'データ復旧完了',
                message,
                details: {
                    method: recoveryMethod,
                    repairLog: repairLog || [],
                    dataSize: data ? Object.keys(data).length : 0
                },
                showProgress: false,
                autoClose: true
            });
            
            // 履歴に記録
            this._recordRecoveryInHistory(result);
            
            // 進捗をリセット
            this._resetProgress();
            
            console.log('[RecoveryUserGuidance] Recovery complete notification sent');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'RECOVERY_COMPLETE_NOTIFICATION_ERROR', { result });
        }
    }
    
    /**
     * エラーメッセージを生成
     * @param {Error} error エラーオブジェクト
     * @param {Object} context エラーコンテキスト
     * @returns {Object} ユーザーフレンドリーなエラーメッセージ
     */
    generateErrorMessage(error, context = {}) {
        try {
            const errorType = this._categorizeError(error, context);
            const userMessage = this._getUserFriendlyMessage(errorType, error, context);
            
            return {
                type: errorType,
                title: userMessage.title,
                message: userMessage.message,
                suggestions: userMessage.suggestions,
                technicalDetails: {
                    error: error.message,
                    stack: error.stack,
                    context
                },
                severity: this._getErrorSeverity(errorType),
                recoverable: this._isRecoverable(errorType)
            };
            
        } catch (generationError) {
            console.error('[RecoveryUserGuidance] Error message generation failed:', generationError);
            
            return {
                type: 'unknown',
                title: 'エラーが発生しました',
                message: 'データ処理中に予期しないエラーが発生しました。',
                suggestions: ['ページを再読み込みしてください', 'しばらく時間をおいて再試行してください'],
                technicalDetails: { error: error.message },
                severity: 'high',
                recoverable: true
            };
        }
    }
    
    /**
     * 復旧ガイダンスを生成
     * @param {Object} analysis データ分析結果
     * @returns {Object} ユーザーガイダンス
     */
    generateRecoveryGuidance(analysis) {
        try {
            const guidance = {
                recommended: [],
                optional: [],
                warnings: [],
                estimatedTime: '不明'
            };
            
            // 分析結果に基づいてガイダンスを生成
            if (analysis.corruption) {
                const { corruptionLevel, repairability } = analysis.corruption;
                
                if (repairability === 'high') {
                    guidance.recommended.push({
                        action: 'automatic_repair',
                        title: '自動修復',
                        description: '破損したデータを自動的に修復します',
                        estimatedTime: '1-2分'
                    });
                } else if (repairability === 'medium') {
                    guidance.recommended.push({
                        action: 'backup_restore',
                        title: 'バックアップから復元',
                        description: '最新のバックアップからデータを復元します',
                        estimatedTime: '2-3分'
                    });
                    
                    guidance.optional.push({
                        action: 'manual_review',
                        title: '手動確認',
                        description: '復元後にデータを手動で確認することをお勧めします'
                    });
                } else {
                    guidance.recommended.push({
                        action: 'reset_to_default',
                        title: 'デフォルトに初期化',
                        description: '統計データをリセットして新しく開始します',
                        estimatedTime: '1分未満'
                    });
                    
                    guidance.warnings.push({
                        type: 'data_loss',
                        message: '既存の統計データは失われます',
                        severity: 'high'
                    });
                }
            }
            
            if (analysis.integrity && analysis.integrity.validFieldsRatio < 0.5) {
                guidance.warnings.push({
                    type: 'partial_recovery',
                    message: 'データの一部のみ復旧可能な可能性があります',
                    severity: 'medium'
                });
            }
            
            return guidance;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'RECOVERY_GUIDANCE_GENERATION_ERROR', { analysis });
            
            return {
                recommended: [{
                    action: 'contact_support',
                    title: 'サポートに連絡',
                    description: 'ガイダンス生成に失敗しました。サポートにお問い合わせください'
                }],
                optional: [],
                warnings: [{
                    type: 'guidance_error',
                    message: 'ガイダンス生成中にエラーが発生しました',
                    severity: 'high'
                }],
                estimatedTime: '不明'
            };
        }
    }
    
    /**
     * 通知コールバックを登録
     * @param {Function} callback 通知コールバック関数
     */
    registerNotificationCallback(callback) {
        if (typeof callback === 'function') {
            this.notificationCallbacks.add(callback);
            console.log('[RecoveryUserGuidance] Notification callback registered');
        }
    }
    
    /**
     * 通知コールバックを解除
     * @param {Function} callback 通知コールバック関数
     */
    unregisterNotificationCallback(callback) {
        this.notificationCallbacks.delete(callback);
        console.log('[RecoveryUserGuidance] Notification callback unregistered');
    }
    
    /**
     * 復旧履歴を取得
     * @param {number} limit 取得件数制限
     * @returns {Array} 復旧履歴
     */
    getRecoveryHistory(limit = 50) {
        return this.recoveryHistory.slice(-limit).reverse();
    }
    
    /**
     * 復旧履歴をクリア
     */
    clearRecoveryHistory() {
        this.recoveryHistory = [];
        this._saveRecoveryHistory();
        console.log('[RecoveryUserGuidance] Recovery history cleared');
    }
    
    /**
     * 言語を設定
     * @param {string} language 言語コード
     */
    setLanguage(language) {
        if (this.messages[language]) {
            this.currentLanguage = language;
            console.log(`[RecoveryUserGuidance] Language set to: ${language}`);
        }
    }
    
    /**
     * 通知設定を更新
     * @param {Object} config 新しい通知設定
     */
    updateNotificationConfig(config) {
        Object.assign(this.notificationConfig, config);
        console.log('[RecoveryUserGuidance] Notification config updated');
    }
    
    /**
     * メッセージを取得
     * @param {string} key メッセージキー
     * @returns {string} ローカライズされたメッセージ
     * @private
     */
    _getMessage(key) {
        return this.messages[this.currentLanguage]?.[key] || 
               this.messages.ja[key] || 
               `Message not found: ${key}`;
    }
    
    /**
     * 通知を送信
     * @param {Object} notification 通知情報
     * @private
     */
    _sendNotification(notification) {
        for (const callback of this.notificationCallbacks) {
            try {
                callback(notification);
            } catch (error) {
                console.error('[RecoveryUserGuidance] Notification callback error:', error);
            }
        }
    }
    
    /**
     * ステップ変更を通知
     * @param {string} step 新しいステップ
     * @param {Object} details 詳細情報
     * @private
     */
    _notifyStepChange(step, details) {
        if (!this.notificationConfig.showRecoveryProgress) return;
        
        const stepMessages = {
            analyzing: this._getMessage('recovery_analyzing'),
            repairing: this._getMessage('recovery_repairing'),
            validating: this._getMessage('recovery_validating')
        };
        
        const message = stepMessages[step] || `処理中: ${step}`;
        
        this._sendNotification({
            type: 'info',
            title: 'データ復旧',
            message,
            details: {
                step,
                progress: this.progressTracking.progress,
                ...details
            },
            showProgress: true,
            autoClose: false
        });
    }
    
    /**
     * 進捗更新を通知
     * @param {string} step 現在のステップ
     * @param {number} progress 進捗
     * @param {Object} details 詳細情報
     * @private
     */
    _notifyProgressUpdate(step, progress, details) {
        // 進捗更新は頻繁なのでコールバックのみ実行
        for (const callback of this.notificationCallbacks) {
            try {
                callback({
                    type: 'progress',
                    step,
                    progress,
                    details,
                    tracking: { ...this.progressTracking }
                });
            } catch (error) {
                console.error('[RecoveryUserGuidance] Progress callback error:', error);
            }
        }
    }
    
    /**
     * 時間推定を更新
     * @private
     */
    _updateTimeEstimate() {
        if (this.progressTracking.startTime && this.progressTracking.completedSteps > 0) {
            const elapsed = Date.now() - this.progressTracking.startTime;
            const avgTimePerStep = elapsed / this.progressTracking.completedSteps;
            const remainingSteps = this.progressTracking.totalSteps - this.progressTracking.completedSteps;
            this.progressTracking.estimatedTimeRemaining = avgTimePerStep * remainingSteps;
        }
    }
    
    /**
     * エラーを分類
     * @param {Error} error エラーオブジェクト
     * @param {Object} context コンテキスト
     * @returns {string} エラータイプ
     * @private
     */
    _categorizeError(error, context) {
        const message = error.message.toLowerCase();
        
        if (message.includes('corruption') || message.includes('checksum')) {
            return 'data_corruption';
        }
        if (message.includes('network') || message.includes('fetch')) {
            return 'network_error';
        }
        if (message.includes('storage') || message.includes('quota')) {
            return 'storage_error';
        }
        if (message.includes('permission') || message.includes('access')) {
            return 'permission_error';
        }
        
        return 'unknown_error';
    }
    
    /**
     * ユーザーフレンドリーなメッセージを取得
     * @param {string} errorType エラータイプ
     * @param {Error} error エラーオブジェクト
     * @param {Object} context コンテキスト
     * @returns {Object} ユーザーメッセージ
     * @private
     */
    _getUserFriendlyMessage(errorType, error, context) {
        const messages = {
            data_corruption: {
                title: 'データ破損エラー',
                message: '統計データが破損しています。自動修復を試行できます。',
                suggestions: ['自動修復を実行する', 'バックアップから復元する', 'データをリセットする']
            },
            network_error: {
                title: 'ネットワークエラー',
                message: 'ネットワーク接続に問題があります。',
                suggestions: ['インターネット接続を確認する', 'しばらく待ってから再試行する']
            },
            storage_error: {
                title: 'ストレージエラー',
                message: 'データの保存に問題があります。',
                suggestions: ['ブラウザの容量を確認する', '他のタブを閉じる', 'ブラウザを再起動する']
            },
            permission_error: {
                title: 'アクセス許可エラー',
                message: 'データへのアクセス許可がありません。',
                suggestions: ['ブラウザの設定を確認する', 'プライベートモードを無効にする']
            },
            unknown_error: {
                title: '予期しないエラー',
                message: '予期しないエラーが発生しました。',
                suggestions: ['ページを再読み込みする', 'ブラウザを再起動する', 'サポートに連絡する']
            }
        };
        
        return messages[errorType] || messages.unknown_error;
    }
    
    /**
     * エラーの重要度を取得
     * @param {string} errorType エラータイプ
     * @returns {string} 重要度
     * @private
     */
    _getErrorSeverity(errorType) {
        const severities = {
            data_corruption: 'high',
            network_error: 'medium',
            storage_error: 'high',
            permission_error: 'medium',
            unknown_error: 'high'
        };
        
        return severities[errorType] || 'medium';
    }
    
    /**
     * エラーが復旧可能かチェック
     * @param {string} errorType エラータイプ
     * @returns {boolean} 復旧可能性
     * @private
     */
    _isRecoverable(errorType) {
        const recoverableTypes = ['data_corruption', 'network_error', 'storage_error'];
        return recoverableTypes.includes(errorType);
    }
    
    /**
     * 復旧履歴に記録
     * @param {Object} result 復旧結果
     * @private
     */
    _recordRecoveryInHistory(result) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            success: result.success,
            method: result.recoveryMethod,
            details: result.repairLog || [],
            duration: this.progressTracking.startTime ? 
                     Date.now() - this.progressTracking.startTime : null
        };
        
        this.recoveryHistory.push(historyEntry);
        
        // 履歴サイズ制限
        if (this.recoveryHistory.length > 100) {
            this.recoveryHistory = this.recoveryHistory.slice(-100);
        }
        
        this._saveRecoveryHistory();
    }
    
    /**
     * 復旧履歴を保存
     * @private
     */
    _saveRecoveryHistory() {
        try {
            localStorage.setItem('bubblePop_recoveryHistory', JSON.stringify(this.recoveryHistory));
        } catch (error) {
            // ストレージエラーは無視（履歴保存はオプション）
        }
    }
    
    /**
     * 復旧履歴を読み込み
     * @private
     */
    _loadRecoveryHistory() {
        try {
            const stored = localStorage.getItem('bubblePop_recoveryHistory');
            if (stored) {
                this.recoveryHistory = JSON.parse(stored);
            }
        } catch (error) {
            this.recoveryHistory = [];
        }
    }
    
    /**
     * 進捗をリセット
     * @private
     */
    _resetProgress() {
        this.progressTracking = {
            currentStep: null,
            totalSteps: 0,
            completedSteps: 0,
            progress: 0,
            startTime: null,
            estimatedTimeRemaining: null
        };
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} ガイダンス統計
     */
    getStats() {
        return {
            historyCount: this.recoveryHistory.length,
            callbackCount: this.notificationCallbacks.size,
            currentLanguage: this.currentLanguage,
            config: { ...this.notificationConfig },
            progress: { ...this.progressTracking }
        };
    }
    
    /**
     * 初期化時に履歴を読み込み
     */
    initialize() {
        this._loadRecoveryHistory();
        console.log('[RecoveryUserGuidance] Initialization completed');
    }
}