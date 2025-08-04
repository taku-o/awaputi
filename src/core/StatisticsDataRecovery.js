import { RecoveryStrategies } from './statistics/RecoveryStrategies.js';
import { RecoveryValidation } from './statistics/RecoveryValidation.js';
import { RecoveryUserGuidance } from './statistics/RecoveryUserGuidance.js';

/**
 * 統計データ復旧クラス（Main Controller）
 * データ破損時の自動復旧、バックアップからの復元、ユーザーガイダンス機能を提供する
 * Main Controller Patternによる軽量オーケストレーター
 */
export class StatisticsDataRecovery {
    constructor(statisticsManager, errorHandler) {
        this.statisticsManager = statisticsManager;
        this.errorHandler = errorHandler;
        
        // 復旧設定
        this.config = {
            recovery: {
                autoRecoveryEnabled: true,
                maxRetryAttempts: 3,
                retryDelayMs: 1000,
                backupRetentionDays: 30,
                corruptionThreshold: 0.7 // 70%以上のデータが有効であれば復旧可能
            },
            validation: {
                strictMode: false,
                validateChecksums: true,
                validateStructure: true,
                validateRanges: true
            },
            notification: {
                showRecoveryProgress: true,
                showSuccessMessage: true,
                showFailureMessage: true,
                autoCloseDelay: 5000
            }
        };
        
        // 復旧状態管理
        this.recoveryState = {
            isRecovering: false,
            currentStep: null,
            progress: 0,
            lastRecoveryTime: null,
            recoveryHistory: [],
            failedAttempts: 0
        };
        
        // サブコンポーネントの初期化（依存注入）
        this.strategies = new RecoveryStrategies(this);
        this.validation = new RecoveryValidation(this);
        this.userGuidance = new RecoveryUserGuidance(this);
        
        // 初期化
        this.initialize();
        
        console.log('[StatisticsDataRecovery] Main Controller initialized with sub-components');
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.userGuidance.initialize();
        this.setupAutomaticRecovery();
    }
    
    /**
     * 自動復旧の設定
     */
    setupAutomaticRecovery() {
        if (!this.config.recovery.autoRecoveryEnabled) return;
        
        // 統計システムのエラーハンドラーに復旧機能を登録
        if (this.errorHandler) {
            this.errorHandler.registerNotificationCallback(async (errorDetails, severity) => {
                if (this.shouldTriggerAutoRecovery(errorDetails, severity)) {
                    await this.performAutoRecovery(errorDetails);
                }
            });
        }
    }
    
    /**
     * 自動復旧をトリガーするかチェック
     * @param {Object} errorDetails エラー詳細
     * @param {string} severity 重要度
     * @returns {boolean} 自動復旧を実行するか
     */
    shouldTriggerAutoRecovery(errorDetails, severity) {
        // 既に復旧中の場合はスキップ
        if (this.recoveryState.isRecovering) {
            return false;
        }
        
        // 重要度が低い場合はスキップ
        if (severity === 'low') {
            return false;
        }
        
        // 最大試行回数を超えている場合はスキップ
        if (this.recoveryState.failedAttempts >= this.config.recovery.maxRetryAttempts) {
            return false;
        }
        
        // データ関連のエラーのみ対象
        const dataErrorTypes = ['corruption', 'checksum_failure', 'structure_damage', 'partial_loss'];
        return dataErrorTypes.some(type => errorDetails.type === type || errorDetails.message?.includes(type));
    }
    
    /**
     * 自動復旧を実行
     * @param {Object} errorDetails エラー詳細
     * @returns {Promise<Object>} 復旧結果
     */
    async performAutoRecovery(errorDetails) {
        try {
            console.log('[StatisticsDataRecovery] Starting automatic recovery for:', errorDetails);
            
            this.recoveryState.isRecovering = true;
            this.recoveryState.currentStep = 'analyzing';
            this.recoveryState.progress = 0;
            
            // データを取得
            const currentData = await this.statisticsManager.getAllStatistics();
            
            // データ分析
            const analysis = await this.analyzeData(currentData);
            
            // 復旧戦略を決定
            const strategy = this.determineRecoveryStrategy(analysis);
            
            // 復旧を実行
            const result = await this.initiateRecovery(strategy, { autoRecovery: true });
            
            if (result.success) {
                this.recoveryState.failedAttempts = 0;
                this.recordRecoverySuccess(strategy, result);
            } else {
                this.recoveryState.failedAttempts++;
                this.recordRecoveryFailure(result.error);
            }
            
            return result;
            
        } catch (error) {
            this.recoveryState.failedAttempts++;
            this.recordRecoveryFailure(error);
            throw error;
        } finally {
            this.recoveryState.isRecovering = false;
            this.recoveryState.currentStep = null;
            this.recoveryState.progress = 0;
        }
    }
    
    // ========== 公開API（後方互換性維持） ==========
    
    /**
     * 復旧を開始
     * @param {string} strategy 復旧戦略
     * @param {Object} options オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async initiateRecovery(strategy, options = {}) {
        try {
            console.log(`[StatisticsDataRecovery] Initiating recovery with strategy: ${strategy}`);
            
            this.recoveryState.isRecovering = true;
            this.recoveryState.lastRecoveryTime = Date.now();
            
            // ユーザーガイダンスに復旧開始を通知
            this.userGuidance.notifyRecoveryStart({
                strategy,
                totalSteps: 5,
                options
            });
            
            // データ取得・分析
            this.updateProgress('analyzing', 20);
            const currentData = await this.statisticsManager.getAllStatistics();
            const analysis = await this.analyzeData(currentData);
            
            // 復旧戦略を実行
            this.updateProgress('recovering', 40);
            const result = await this.strategies.executeStrategy(strategy, analysis, options);
            
            // 結果を検証
            this.updateProgress('validating', 80);
            if (result.success && result.data) {
                const validationResult = await this.validation.analyzeDataIntegrity(result.data);
                result.validationPassed = validationResult.isValid;
                
                if (validationResult.isValid) {
                    // 統計マネージャーにデータを適用
                    await this.statisticsManager.loadStatistics(result.data);
                }
            }
            
            this.updateProgress('completed', 100);
            
            // ユーザーガイダンスに完了を通知
            this.userGuidance.notifyRecoveryComplete(result);
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'RECOVERY_INITIATION_ERROR', { strategy, options });
            
            const errorResult = {
                success: false,
                error: error.message,
                strategy
            };
            
            this.userGuidance.notifyRecoveryComplete(errorResult);
            return errorResult;
            
        } finally {
            this.recoveryState.isRecovering = false;
        }
    }
    
    /**
     * データを分析
     * @param {Object} data 分析対象データ
     * @returns {Promise<Object>} 分析結果
     */
    async analyzeData(data) {
        const analysis = {};
        
        // データ破損分析
        analysis.corruption = await this.validation.analyzeDataCorruption(data);
        
        // データ整合性分析
        analysis.integrity = await this.validation.analyzeDataIntegrity(data);
        
        // 構造検証
        analysis.structure = this.validation.validateDataStructure(data);
        
        // 範囲検証
        analysis.ranges = this.validation.validateDataRanges(data);
        
        // チェックサム検証
        if (this.config.validation.validateChecksums) {
            const expectedChecksum = await this.statisticsManager.getStoredChecksum();
            const actualChecksum = this.validation.calculateChecksum(data);
            analysis.checksum = {
                expected: expectedChecksum,
                actual: actualChecksum,
                matches: expectedChecksum === actualChecksum
            };
        }
        
        return analysis;
    }
    
    /**
     * 復旧戦略を決定
     * @param {Object} analysis 分析結果
     * @returns {string} 推奨される復旧戦略
     */
    determineRecoveryStrategy(analysis) {
        // 完全なデータ損失
        if (!analysis.integrity || analysis.integrity.validFieldsRatio === 0) {
            return 'complete_loss';
        }
        
        // チェックサム失敗
        if (analysis.checksum && !analysis.checksum.matches) {
            return 'checksum_failure';
        }
        
        // 構造破損
        if (analysis.structure && !analysis.structure.isValid) {
            return 'structure_damage';
        }
        
        // データ破損
        if (analysis.corruption && analysis.corruption.isCorrupted) {
            if (analysis.corruption.corruptionLevel > 0.7) {
                return 'corruption';
            } else {
                return 'partial_loss';
            }
        }
        
        // バージョン不一致の可能性をチェック
        const currentVersion = this.statisticsManager.getDataVersion();
        const dataVersion = this.statisticsManager.getStoredDataVersion();
        if (currentVersion !== dataVersion) {
            return 'version_mismatch';
        }
        
        // デフォルトは部分損失として処理
        return 'partial_loss';
    }
    
    // ========== 委譲メソッド ==========
    
    /**
     * データ破損を分析
     * @param {Object} data 分析対象データ
     * @returns {Promise<Object>} 破損分析結果
     */
    async analyzeDataCorruption(data) {
        return await this.validation.analyzeDataCorruption(data);
    }
    
    /**
     * データ整合性を分析
     * @param {Object} data 検証対象データ
     * @returns {Promise<Object>} 整合性分析結果
     */
    async analyzeDataIntegrity(data) {
        return await this.validation.analyzeDataIntegrity(data);
    }
    
    /**
     * チェックサムを計算
     * @param {Object} data データオブジェクト
     * @returns {string} チェックサム
     */
    calculateChecksum(data) {
        return this.validation.calculateChecksum(data);
    }
    
    /**
     * データ構造を検証
     * @param {Object} data データオブジェクト
     * @returns {Object} 検証結果
     */
    validateDataStructure(data) {
        return this.validation.validateDataStructure(data);
    }
    
    /**
     * データ範囲を検証
     * @param {Object} data データオブジェクト
     * @returns {Object} 検証結果
     */
    validateDataRanges(data) {
        return this.validation.validateDataRanges(data);
    }
    
    /**
     * オブジェクト構造を修復
     * @param {Object} obj 修復対象オブジェクト
     * @param {Object} template テンプレートオブジェクト
     * @returns {Object} 修復されたオブジェクト
     */
    repairObjectStructure(obj, template) {
        const repaired = {};
        
        // テンプレートに基づいてオブジェクトを修復
        for (const [key, value] of Object.entries(template)) {
            if (obj && obj.hasOwnProperty(key)) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    repaired[key] = this.repairObjectStructure(obj[key], value);
                } else {
                    repaired[key] = obj[key];
                }
            } else {
                repaired[key] = value;
            }
        }
        
        return repaired;
    }
    
    /**
     * 進捗を更新
     * @param {string} step 現在のステップ
     * @param {number} progress 進捗（0-100）
     * @param {Object} details 詳細情報
     */
    updateProgress(step, progress, details = {}) {
        this.recoveryState.currentStep = step;
        this.recoveryState.progress = progress;
        
        // ユーザーガイダンスに委譲
        this.userGuidance.updateProgress(step, progress, details);
    }
    
    // ========== 復旧履歴管理 ==========
    
    /**
     * 復旧成功を記録
     * @param {string} strategy 使用した戦略
     * @param {Object} result 復旧結果
     */
    recordRecoverySuccess(strategy, result) {
        const record = {
            timestamp: new Date().toISOString(),
            strategy,
            success: true,
            result,
            duration: this.recoveryState.lastRecoveryTime ? 
                     Date.now() - this.recoveryState.lastRecoveryTime : null
        };
        
        this.recoveryState.recoveryHistory.push(record);
        this._trimRecoveryHistory();
        
        console.log('[StatisticsDataRecovery] Recovery success recorded');
    }
    
    /**
     * 復旧失敗を記録
     * @param {Error} error 発生したエラー
     */
    recordRecoveryFailure(error) {
        const record = {
            timestamp: new Date().toISOString(),
            success: false,
            error: error.message,
            duration: this.recoveryState.lastRecoveryTime ? 
                     Date.now() - this.recoveryState.lastRecoveryTime : null
        };
        
        this.recoveryState.recoveryHistory.push(record);
        this._trimRecoveryHistory();
        
        console.log('[StatisticsDataRecovery] Recovery failure recorded');
    }
    
    /**
     * 復旧履歴を取得
     * @param {number} limit 取得件数制限
     * @returns {Array} 復旧履歴
     */
    getRecoveryHistory(limit = 50) {
        return this.userGuidance.getRecoveryHistory(limit);
    }
    
    // ========== 通知システム連携 ==========
    
    /**
     * 通知コールバックを登録
     * @param {Function} callback 通知コールバック関数
     */
    registerNotificationCallback(callback) {
        this.userGuidance.registerNotificationCallback(callback);
    }
    
    /**
     * 通知コールバックを解除
     * @param {Function} callback 通知コールバック関数
     */
    unregisterNotificationCallback(callback) {
        this.userGuidance.unregisterNotificationCallback(callback);
    }
    
    // ========== 状態・設定管理 ==========
    
    /**
     * 復旧ステータスを取得
     * @returns {Object} 復旧ステータス
     */
    getRecoveryStatus() {
        return {
            ...this.recoveryState,
            config: { ...this.config },
            strategies: this.strategies.getStrategyStats(),
            validation: this.validation.getValidationStats(),
            guidance: this.userGuidance.getStats()
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // サブコンポーネントにも設定を適用
        if (newConfig.validation) {
            this.validation.updateValidationConfig(newConfig.validation);
        }
        
        if (newConfig.notification) {
            this.userGuidance.updateNotificationConfig(newConfig.notification);
        }
        
        console.log('[StatisticsDataRecovery] Configuration updated');
    }
    
    /**
     * 復旧履歴を整理
     * @private
     */
    _trimRecoveryHistory() {
        const maxHistory = 100;
        if (this.recoveryState.recoveryHistory.length > maxHistory) {
            this.recoveryState.recoveryHistory = this.recoveryState.recoveryHistory.slice(-maxHistory);
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        // サブコンポーネントのクリーンアップ
        if (this.userGuidance) {
            this.userGuidance.clearRecoveryHistory();
        }
        
        if (this.validation) {
            this.validation.resetValidationStats();
        }
        
        // 状態をリセット
        this.recoveryState = {
            isRecovering: false,
            currentStep: null,
            progress: 0,
            lastRecoveryTime: null,
            recoveryHistory: [],
            failedAttempts: 0
        };
        
        console.log('[StatisticsDataRecovery] Main Controller cleanup completed');
    }
}