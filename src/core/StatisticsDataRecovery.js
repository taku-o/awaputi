/**
 * 統計データ復旧クラス
 * データ破損時の自動復旧、バックアップからの復元、ユーザーガイダンス機能を提供する
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
        
        // 復旧戦略
        this.recoveryStrategies = new Map([
            ['corruption', this.recoverFromCorruption.bind(this)],
            ['partial_loss', this.recoverFromPartialLoss.bind(this)],
            ['version_mismatch', this.recoverFromVersionMismatch.bind(this)],
            ['checksum_failure', this.recoverFromChecksumFailure.bind(this)],
            ['structure_damage', this.recoverFromStructureDamage.bind(this)],
            ['complete_loss', this.recoverFromCompleteLoss.bind(this)]
        ]);
        
        // データ検証規則
        this.validationRules = new Map([
            ['gamePlayStats', this.validateGamePlayStats.bind(this)],
            ['scoreStats', this.validateScoreStats.bind(this)],
            ['bubbleStats', this.validateBubbleStats.bind(this)],
            ['comboStats', this.validateComboStats.bind(this)],
            ['timeStats', this.validateTimeStats.bind(this)]
        ]);
        
        // 復旧優先度（高い順）
        this.recoveryPriority = [
            'gamePlayStats',
            'scoreStats', 
            'bubbleStats',
            'comboStats',
            'achievementStats',
            'timeStats',
            'sessionStats'
        ];
        
        // ユーザー通知システム
        this.notificationCallbacks = new Set();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.loadRecoveryHistory();
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
     * 自動復旧トリガーの判定
     */
    shouldTriggerAutoRecovery(errorDetails, severity) {
        // 重大度が高い場合のみ自動復旧
        if (severity < this.errorHandler.config.severityLevels.HIGH) {
            return false;
        }
        
        // データ関連エラーの場合のみ
        const dataRelatedErrors = [
            this.errorHandler.config.errorTypes.DATA_CORRUPTION,
            this.errorHandler.config.errorTypes.STORAGE_FULL
        ];
        
        return dataRelatedErrors.includes(errorDetails.type);
    }
    
    /**
     * メイン復旧処理
     */
    async performRecovery(options = {}) {
        if (this.recoveryState.isRecovering) {
            throw new Error('Recovery already in progress');
        }
        
        this.recoveryState.isRecovering = true;
        this.recoveryState.currentStep = 'initialization';
        this.recoveryState.progress = 0;
        
        try {
            const recoveryOptions = {
                strategy: 'auto', // 'auto', 'corruption', 'partial_loss', etc.
                preserveUserData: true,
                validateResult: true,
                createBackup: true,
                showProgress: true,
                ...options
            };
            
            await this.notifyRecoveryStart(recoveryOptions);
            
            // 事前バックアップの作成
            if (recoveryOptions.createBackup) {
                await this.createPreRecoveryBackup();
            }
            
            // 現在のデータ状態の分析
            const dataAnalysis = await this.analyzeDataState();
            
            // 復旧戦略の決定
            const strategy = recoveryOptions.strategy === 'auto' ? 
                this.determineRecoveryStrategy(dataAnalysis) : 
                recoveryOptions.strategy;
            
            // 復旧処理の実行
            const recoveryResult = await this.executeRecoveryStrategy(strategy, dataAnalysis, recoveryOptions);
            
            // 復旧結果の検証
            if (recoveryOptions.validateResult) {
                const validationResult = await this.validateRecoveredData(recoveryResult.data);
                if (!validationResult.isValid) {
                    throw new Error(`Recovery validation failed: ${validationResult.errors.join(', ')}`);
                }
            }
            
            // 復旧したデータの適用
            await this.applyRecoveredData(recoveryResult.data);
            
            // 復旧履歴の記録
            this.recordRecoverySuccess(strategy, recoveryResult);
            
            await this.notifyRecoverySuccess(recoveryResult);
            
            return {
                success: true,
                strategy: strategy,
                recoveredData: recoveryResult.data,
                metrics: recoveryResult.metrics,
                timestamp: Date.now()
            };
            
        } catch (error) {
            this.recordRecoveryFailure(error);
            await this.notifyRecoveryFailure(error);
            throw error;
        } finally {
            this.recoveryState.isRecovering = false;
            this.recoveryState.currentStep = null;
            this.recoveryState.progress = 100;
        }
    }
    
    /**
     * 自動復旧処理
     */
    async performAutoRecovery(errorDetails) {
        try {
            console.info('Starting automatic recovery for error:', errorDetails.id);
            
            const recoveryResult = await this.performRecovery({
                strategy: 'auto',
                showProgress: false,
                createBackup: true
            });
            
            console.info('Automatic recovery completed successfully');
            return recoveryResult;
            
        } catch (error) {
            console.error('Automatic recovery failed:', error);
            
            // 自動復旧失敗時は手動復旧のガイダンスを表示
            await this.showManualRecoveryGuidance(errorDetails, error);
        }
    }
    
    /**
     * データ状態の分析
     */
    async analyzeDataState() {
        this.updateProgress('analyzing_data', 10);
        
        const analysis = {
            hasData: false,
            dataSize: 0,
            corruption: {
                level: 0, // 0-100%
                areas: [],
                recoverable: false
            },
            availability: {
                main: false,
                backup: false,
                legacy: false,
                minimal: false
            },
            integrity: {
                checksum: null,
                structure: null,
                ranges: null
            }
        };
        
        try {
            // メインデータの分析
            const mainData = await this.analyzeMainData();
            if (mainData.exists) {
                analysis.hasData = true;
                analysis.dataSize = mainData.size;
                analysis.availability.main = true;
                analysis.integrity = mainData.integrity;
                analysis.corruption = mainData.corruption;
            }
            
            // バックアップデータの分析
            const backupAnalysis = await this.analyzeBackupData();
            analysis.availability.backup = backupAnalysis.hasValidBackups;
            
            // レガシーデータの分析
            const legacyAnalysis = await this.analyzeLegacyData();
            analysis.availability.legacy = legacyAnalysis.exists;
            
            // 最小バックアップの分析
            const minimalAnalysis = await this.analyzeMinimalBackup();
            analysis.availability.minimal = minimalAnalysis.exists;
            
        } catch (error) {
            console.error('Data analysis failed:', error);
            analysis.corruption.level = 100;
        }
        
        return analysis;
    }
    
    /**
     * メインデータの分析
     */
    async analyzeMainData() {
        try {
            const savedData = localStorage.getItem('bubblePop_statistics_v2');
            if (!savedData) {
                return { exists: false };
            }
            
            const data = JSON.parse(savedData);
            const corruption = this.analyzeDataCorruption(data);
            const integrity = this.analyzeDataIntegrity(data);
            
            return {
                exists: true,
                size: savedData.length,
                corruption: corruption,
                integrity: integrity,
                data: data
            };
            
        } catch (error) {
            return {
                exists: true,
                corruption: { level: 100, areas: ['parse_error'], recoverable: false },
                integrity: { checksum: false, structure: false, ranges: false }
            };
        }
    }
    
    /**
     * データ破損の分析
     */
    analyzeDataCorruption(data) {
        const corruption = {
            level: 0,
            areas: [],
            recoverable: false
        };
        
        try {
            if (!data || typeof data !== 'object') {
                corruption.level = 100;
                corruption.areas.push('root_structure');
                return corruption;
            }
            
            if (!data.statistics) {
                corruption.level = 90;
                corruption.areas.push('missing_statistics');
                return corruption;
            }
            
            const stats = data.statistics;
            const totalFields = this.recoveryPriority.length;
            let corruptedFields = 0;
            
            // 各重要フィールドの確認
            for (const field of this.recoveryPriority) {
                if (!stats[field] || typeof stats[field] !== 'object') {
                    corruption.areas.push(field);
                    corruptedFields++;
                } else {
                    // フィールド内部の検証
                    const fieldValidation = this.validateField(field, stats[field]);
                    if (!fieldValidation.isValid) {
                        corruption.areas.push(`${field}_internal`);
                        corruptedFields += 0.5; // 部分的な破損
                    }
                }
            }
            
            corruption.level = Math.round((corruptedFields / totalFields) * 100);
            corruption.recoverable = corruption.level < (100 - this.config.recovery.corruptionThreshold * 100);
            
        } catch (error) {
            corruption.level = 100;
            corruption.areas.push('analysis_error');
        }
        
        return corruption;
    }
    
    /**
     * データ整合性の分析
     */
    analyzeDataIntegrity(data) {
        const integrity = {
            checksum: false,
            structure: false,
            ranges: false
        };
        
        try {
            // チェックサム検証
            if (data.metadata && data.metadata.integrity) {
                const currentChecksum = this.calculateChecksum(data.statistics);
                integrity.checksum = currentChecksum === data.metadata.integrity;
            }
            
            // 構造検証
            integrity.structure = this.validateDataStructure(data.statistics);
            
            // 範囲検証
            integrity.ranges = this.validateDataRanges(data.statistics);
            
        } catch (error) {
            console.warn('Integrity analysis failed:', error);
        }
        
        return integrity;
    }
    
    /**
     * バックアップデータの分析
     */
    async analyzeBackupData() {
        try {
            const backupHistory = this.statisticsManager.getBackupHistory();
            let validBackups = 0;
            
            for (const backup of backupHistory) {
                try {
                    const backupData = localStorage.getItem(backup.key);
                    if (backupData) {
                        const data = JSON.parse(backupData);
                        const corruption = this.analyzeDataCorruption(data);
                        if (corruption.level < 50) { // 50%未満の破損なら有効
                            validBackups++;
                        }
                    }
                } catch (error) {
                    // このバックアップは破損している
                }
            }
            
            return {
                total: backupHistory.length,
                valid: validBackups,
                hasValidBackups: validBackups > 0
            };
            
        } catch (error) {
            return { total: 0, valid: 0, hasValidBackups: false };
        }
    }
    
    /**
     * レガシーデータの分析
     */
    async analyzeLegacyData() {
        try {
            const legacyData = localStorage.getItem('bubblePop_statistics');
            if (legacyData) {
                JSON.parse(legacyData); // パース可能かチェック
                return { exists: true, data: legacyData };
            }
        } catch (error) {
            // レガシーデータが破損
        }
        
        return { exists: false };
    }
    
    /**
     * 最小バックアップの分析
     */
    async analyzeMinimalBackup() {
        try {
            const minimalData = localStorage.getItem('bubblePop_minimal_backup');
            if (minimalData) {
                const data = JSON.parse(minimalData);
                if (data.gamePlayStats && data.scoreStats) {
                    return { exists: true, data: data };
                }
            }
        } catch (error) {
            // 最小バックアップが破損
        }
        
        return { exists: false };
    }
    
    /**
     * 復旧戦略の決定
     */
    determineRecoveryStrategy(analysis) {
        // 完全なデータ損失
        if (!analysis.hasData && !analysis.availability.backup && !analysis.availability.legacy) {
            return 'complete_loss';
        }
        
        // メインデータが使用可能
        if (analysis.hasData && analysis.corruption.level < 30) {
            if (!analysis.integrity.checksum) {
                return 'checksum_failure';
            }
            if (!analysis.integrity.structure) {
                return 'structure_damage';
            }
            return 'partial_loss'; // 軽微な問題
        }
        
        // 重大な破損
        if (analysis.corruption.level > 70) {
            if (analysis.availability.backup) {
                return 'corruption';
            } else {
                return 'complete_loss';
            }
        }
        
        // 中程度の破損
        if (analysis.corruption.level > 30) {
            return 'corruption';
        }
        
        // バージョンの問題
        return 'version_mismatch';
    }
    
    /**
     * 復旧戦略の実行
     */
    async executeRecoveryStrategy(strategy, analysis, options) {
        this.updateProgress(`executing_${strategy}`, 30);
        
        const recoveryFunction = this.recoveryStrategies.get(strategy);
        if (!recoveryFunction) {
            throw new Error(`Unknown recovery strategy: ${strategy}`);
        }
        
        return await recoveryFunction(analysis, options);
    }
    
    /**
     * データ破損からの復旧
     */
    async recoverFromCorruption(analysis, options) {
        this.updateProgress('recovering_from_corruption', 40);
        
        // バックアップから復元を試行
        const backupResult = await this.tryBackupRestore();
        if (backupResult.success) {
            return {
                data: backupResult.data,
                method: 'backup_restore',
                confidence: 0.9,
                metrics: {
                    restoredFields: Object.keys(backupResult.data),
                    dataSource: 'backup'
                }
            };
        }
        
        // 部分復旧を試行
        const partialResult = await this.tryPartialRecovery(analysis);
        if (partialResult.success) {
            return {
                data: partialResult.data,
                method: 'partial_recovery',
                confidence: 0.7,
                metrics: {
                    restoredFields: partialResult.restoredFields,
                    corruptedFields: partialResult.corruptedFields
                }
            };
        }
        
        throw new Error('Unable to recover from corruption');
    }
    
    /**
     * 部分データ損失からの復旧
     */
    async recoverFromPartialLoss(analysis, options) {
        this.updateProgress('recovering_partial_data', 50);
        
        try {
            const currentData = analysis.hasData ? 
                JSON.parse(localStorage.getItem('bubblePop_statistics_v2')).statistics :
                {};
            
            // 欠損フィールドを補完
            const recoveredData = await this.fillMissingFields(currentData);
            
            // データ範囲の修正
            const correctedData = this.correctDataRanges(recoveredData);
            
            return {
                data: correctedData,
                method: 'field_completion',
                confidence: 0.8,
                metrics: {
                    originalFields: Object.keys(currentData),
                    recoveredFields: Object.keys(correctedData),
                    addedFields: Object.keys(correctedData).filter(k => !currentData[k])
                }
            };
            
        } catch (error) {
            throw new Error(`Partial recovery failed: ${error.message}`);
        }
    }
    
    /**
     * バージョン不一致からの復旧
     */
    async recoverFromVersionMismatch(analysis, options) {
        this.updateProgress('migrating_version', 60);
        
        try {
            // レガシーデータの読み込み
            const legacyData = localStorage.getItem('bubblePop_statistics');
            if (legacyData) {
                const data = JSON.parse(legacyData);
                const migratedData = await this.migrateDataVersion(data);
                
                return {
                    data: migratedData,
                    method: 'version_migration',
                    confidence: 0.9,
                    metrics: {
                        sourceVersion: 'legacy',
                        targetVersion: '2.0',
                        migratedFields: Object.keys(migratedData)
                    }
                };
            }
            
            throw new Error('No legacy data available for migration');
            
        } catch (error) {
            throw new Error(`Version migration failed: ${error.message}`);
        }
    }
    
    /**
     * チェックサム失敗からの復旧
     */
    async recoverFromChecksumFailure(analysis, options) {
        this.updateProgress('fixing_checksum', 70);
        
        try {
            const data = JSON.parse(localStorage.getItem('bubblePop_statistics_v2'));
            
            // データ構造が正常であればチェックサムを再計算
            if (this.validateDataStructure(data.statistics)) {
                data.metadata.integrity = this.calculateChecksum(data.statistics);
                
                return {
                    data: data.statistics,
                    method: 'checksum_recalculation',
                    confidence: 0.95,
                    metrics: {
                        oldChecksum: analysis.integrity.checksum,
                        newChecksum: data.metadata.integrity
                    }
                };
            }
            
            throw new Error('Data structure invalid, cannot fix checksum');
            
        } catch (error) {
            throw new Error(`Checksum recovery failed: ${error.message}`);
        }
    }
    
    /**
     * 構造破損からの復旧
     */
    async recoverFromStructureDamage(analysis, options) {
        this.updateProgress('repairing_structure', 80);
        
        try {
            const data = JSON.parse(localStorage.getItem('bubblePop_statistics_v2'));
            
            // 構造の修復
            const repairedData = await this.repairDataStructure(data.statistics);
            
            return {
                data: repairedData,
                method: 'structure_repair',
                confidence: 0.7,
                metrics: {
                    repairedFields: this.getRepairedFields(data.statistics, repairedData)
                }
            };
            
        } catch (error) {
            throw new Error(`Structure repair failed: ${error.message}`);
        }
    }
    
    /**
     * 完全データ損失からの復旧
     */
    async recoverFromCompleteLoss(analysis, options) {
        this.updateProgress('initializing_new_data', 90);
        
        // 最小バックアップがあるか確認
        const minimalAnalysis = await this.analyzeMinimalBackup();
        if (minimalAnalysis.exists) {
            const expandedData = await this.expandMinimalData(minimalAnalysis.data);
            
            return {
                data: expandedData,
                method: 'minimal_expansion',
                confidence: 0.6,
                metrics: {
                    sourceFields: Object.keys(minimalAnalysis.data),
                    expandedFields: Object.keys(expandedData)
                }
            };
        }
        
        // 新しいデータの初期化
        const newData = this.statisticsManager.initializeStatistics();
        
        return {
            data: newData,
            method: 'clean_initialization',
            confidence: 0.5,
            metrics: {
                initializedFields: Object.keys(newData)
            }
        };
    }
    
    /**
     * バックアップからの復元試行
     */
    async tryBackupRestore() {
        try {
            const restoreResult = await this.statisticsManager.restoreFromBackup();
            if (restoreResult.success) {
                return {
                    success: true,
                    data: this.statisticsManager.statistics
                };
            }
        } catch (error) {
            console.warn('Backup restore failed:', error);
        }
        
        return { success: false };
    }
    
    /**
     * 部分復旧の試行
     */
    async tryPartialRecovery(analysis) {
        try {
            const data = JSON.parse(localStorage.getItem('bubblePop_statistics_v2'));
            const recoveredData = {};
            const restoredFields = [];
            const corruptedFields = [];
            
            // 優先度順に各フィールドを復旧
            for (const field of this.recoveryPriority) {
                if (data.statistics[field] && this.validateField(field, data.statistics[field]).isValid) {
                    recoveredData[field] = data.statistics[field];
                    restoredFields.push(field);
                } else {
                    // デフォルト値で補完
                    const defaultStats = this.statisticsManager.initializeStatistics();
                    recoveredData[field] = defaultStats[field];
                    corruptedFields.push(field);
                }
            }
            
            return {
                success: true,
                data: recoveredData,
                restoredFields,
                corruptedFields
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 欠損フィールドの補完
     */
    async fillMissingFields(currentData) {
        const defaultStats = this.statisticsManager.initializeStatistics();
        const filledData = { ...currentData };
        
        // 欠損フィールドをデフォルト値で補完
        Object.keys(defaultStats).forEach(key => {
            if (filledData[key] === undefined) {
                filledData[key] = defaultStats[key];
            } else if (typeof defaultStats[key] === 'object' && !Array.isArray(defaultStats[key])) {
                // ネストされたオブジェクトの補完
                filledData[key] = { ...defaultStats[key], ...filledData[key] };
            }
        });
        
        return filledData;
    }
    
    /**
     * データ範囲の修正
     */
    correctDataRanges(data) {
        const correctedData = { ...data };
        
        // 数値フィールドの範囲チェックと修正
        if (correctedData.gamePlayStats) {
            correctedData.gamePlayStats.totalGames = Math.max(0, correctedData.gamePlayStats.totalGames || 0);
            correctedData.gamePlayStats.totalPlayTime = Math.max(0, correctedData.gamePlayStats.totalPlayTime || 0);
        }
        
        if (correctedData.scoreStats) {
            correctedData.scoreStats.totalScore = Math.max(0, correctedData.scoreStats.totalScore || 0);
            correctedData.scoreStats.highestScore = Math.max(0, correctedData.scoreStats.highestScore || 0);
        }
        
        if (correctedData.bubbleStats) {
            correctedData.bubbleStats.accuracy = Math.min(1, Math.max(0, correctedData.bubbleStats.accuracy || 0));
            correctedData.bubbleStats.totalPopped = Math.max(0, correctedData.bubbleStats.totalPopped || 0);
        }
        
        return correctedData;
    }
    
    /**
     * データバージョンの移行
     */
    async migrateDataVersion(legacyData) {
        // レガシーフォーマットから新フォーマットへの変換
        const migratedData = this.statisticsManager.initializeStatistics();
        
        // 基本統計の移行
        if (legacyData.gamePlayStats) {
            Object.assign(migratedData.gamePlayStats, legacyData.gamePlayStats);
        }
        
        if (legacyData.scoreStats) {
            Object.assign(migratedData.scoreStats, legacyData.scoreStats);
        }
        
        if (legacyData.bubbleStats) {
            Object.assign(migratedData.bubbleStats, legacyData.bubbleStats);
        }
        
        // 新機能の初期化
        migratedData.migrationInfo = {
            migratedFrom: 'legacy',
            migrationDate: Date.now(),
            originalVersion: '1.0'
        };
        
        return migratedData;
    }
    
    /**
     * データ構造の修復
     */
    async repairDataStructure(data) {
        const repairedData = { ...data };
        const defaultStats = this.statisticsManager.initializeStatistics();
        
        // 各フィールドの型と構造をチェック・修復
        Object.keys(defaultStats).forEach(key => {
            if (typeof repairedData[key] !== typeof defaultStats[key]) {
                repairedData[key] = defaultStats[key];
            } else if (typeof defaultStats[key] === 'object' && !Array.isArray(defaultStats[key])) {
                // オブジェクトの内部構造修復
                repairedData[key] = this.repairObjectStructure(repairedData[key], defaultStats[key]);
            }
        });
        
        return repairedData;
    }
    
    /**
     * オブジェクト構造の修復
     */
    repairObjectStructure(obj, template) {
        const repaired = { ...obj };
        
        Object.keys(template).forEach(key => {
            if (repaired[key] === undefined) {
                repaired[key] = template[key];
            } else if (typeof repaired[key] !== typeof template[key]) {
                repaired[key] = template[key];
            }
        });
        
        return repaired;
    }
    
    /**
     * 最小データの拡張
     */
    async expandMinimalData(minimalData) {
        const expandedData = this.statisticsManager.initializeStatistics();
        
        // 最小データの情報を保持
        if (minimalData.gamePlayStats) {
            Object.assign(expandedData.gamePlayStats, minimalData.gamePlayStats);
        }
        
        if (minimalData.scoreStats) {
            Object.assign(expandedData.scoreStats, minimalData.scoreStats);
        }
        
        // 復旧情報の追加
        expandedData.recoveryInfo = {
            recoveredFrom: 'minimal_backup',
            recoveryDate: Date.now(),
            confidence: 0.6
        };
        
        return expandedData;
    }
    
    /**
     * 復旧データの検証
     */
    async validateRecoveredData(data) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        try {
            // 基本構造の検証
            if (!data || typeof data !== 'object') {
                validation.isValid = false;
                validation.errors.push('Invalid data structure');
                return validation;
            }
            
            // 各フィールドの検証
            for (const [field, validator] of this.validationRules) {
                if (data[field]) {
                    const fieldValidation = validator(data[field]);
                    if (!fieldValidation.isValid) {
                        validation.warnings.push(`${field}: ${fieldValidation.errors.join(', ')}`);
                    }
                }
            }
            
            // JSON serialization test
            JSON.stringify(data);
            
        } catch (error) {
            validation.isValid = false;
            validation.errors.push(`Validation error: ${error.message}`);
        }
        
        return validation;
    }
    
    /**
     * 復旧データの適用
     */
    async applyRecoveredData(data) {
        this.updateProgress('applying_recovered_data', 95);
        
        try {
            // 統計マネージャーにデータを設定
            this.statisticsManager.statistics = data;
            
            // データの保存
            await this.statisticsManager.save({
                createBackup: true,
                validateIntegrity: true
            });
            
            console.info('Recovered data applied successfully');
            
        } catch (error) {
            throw new Error(`Failed to apply recovered data: ${error.message}`);
        }
    }
    
    /**
     * フィールド検証
     */
    validateField(fieldName, fieldData) {
        const validator = this.validationRules.get(fieldName);
        if (validator) {
            return validator(fieldData);
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * ゲームプレイ統計の検証
     */
    validateGamePlayStats(data) {
        const validation = { isValid: true, errors: [] };
        
        if (typeof data.totalGames !== 'number' || data.totalGames < 0) {
            validation.errors.push('Invalid totalGames');
        }
        
        if (typeof data.totalPlayTime !== 'number' || data.totalPlayTime < 0) {
            validation.errors.push('Invalid totalPlayTime');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
    
    /**
     * スコア統計の検証
     */
    validateScoreStats(data) {
        const validation = { isValid: true, errors: [] };
        
        if (typeof data.totalScore !== 'number' || data.totalScore < 0) {
            validation.errors.push('Invalid totalScore');
        }
        
        if (typeof data.highestScore !== 'number' || data.highestScore < 0) {
            validation.errors.push('Invalid highestScore');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
    
    /**
     * バブル統計の検証
     */
    validateBubbleStats(data) {
        const validation = { isValid: true, errors: [] };
        
        if (typeof data.totalPopped !== 'number' || data.totalPopped < 0) {
            validation.errors.push('Invalid totalPopped');
        }
        
        if (typeof data.accuracy !== 'number' || data.accuracy < 0 || data.accuracy > 1) {
            validation.errors.push('Invalid accuracy');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
    
    /**
     * コンボ統計の検証
     */
    validateComboStats(data) {
        const validation = { isValid: true, errors: [] };
        
        if (typeof data.maxCombo !== 'number' || data.maxCombo < 0) {
            validation.errors.push('Invalid maxCombo');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
    
    /**
     * 時間統計の検証
     */
    validateTimeStats(data) {
        const validation = { isValid: true, errors: [] };
        
        if (Array.isArray(data.playTimeByHour) && data.playTimeByHour.length !== 24) {
            validation.errors.push('Invalid playTimeByHour length');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
    
    /**
     * ヘルパーメソッド
     */
    
    updateProgress(step, progress) {
        this.recoveryState.currentStep = step;
        this.recoveryState.progress = progress;
        
        if (this.config.notification.showRecoveryProgress) {
            this.notifyProgress(step, progress);
        }
    }
    
    calculateChecksum(data) {
        const dataString = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    validateDataStructure(data) {
        try {
            return data && 
                   typeof data === 'object' && 
                   data.gamePlayStats && 
                   data.scoreStats && 
                   data.bubbleStats;
        } catch {
            return false;
        }
    }
    
    validateDataRanges(data) {
        try {
            if (data.bubbleStats && (data.bubbleStats.accuracy < 0 || data.bubbleStats.accuracy > 1)) {
                return false;
            }
            if (data.gamePlayStats && data.gamePlayStats.totalGames < 0) {
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }
    
    getRepairedFields(original, repaired) {
        const repairedFields = [];
        Object.keys(repaired).forEach(key => {
            if (JSON.stringify(original[key]) !== JSON.stringify(repaired[key])) {
                repairedFields.push(key);
            }
        });
        return repairedFields;
    }
    
    /**
     * 通知機能
     */
    
    async notifyRecoveryStart(options) {
        const notification = {
            type: 'recovery_started',
            message: 'データ復旧を開始しています...',
            options: options,
            timestamp: Date.now()
        };
        
        await this.broadcastNotification(notification);
    }
    
    async notifyRecoverySuccess(result) {
        const notification = {
            type: 'recovery_success',
            message: `データ復旧が完了しました（方法: ${result.method}）`,
            result: result,
            timestamp: Date.now()
        };
        
        await this.broadcastNotification(notification);
    }
    
    async notifyRecoveryFailure(error) {
        const notification = {
            type: 'recovery_failure',
            message: `データ復旧に失敗しました: ${error.message}`,
            error: error,
            timestamp: Date.now()
        };
        
        await this.broadcastNotification(notification);
    }
    
    async notifyProgress(step, progress) {
        const notification = {
            type: 'recovery_progress',
            step: step,
            progress: progress,
            timestamp: Date.now()
        };
        
        await this.broadcastNotification(notification);
    }
    
    async broadcastNotification(notification) {
        for (const callback of this.notificationCallbacks) {
            try {
                await callback(notification);
            } catch (error) {
                console.error('Notification callback failed:', error);
            }
        }
    }
    
    async showManualRecoveryGuidance(errorDetails, recoveryError) {
        const guidance = {
            type: 'manual_recovery_guidance',
            title: 'データ復旧のガイダンス',
            message: '自動復旧に失敗しました。以下の手順を試してください：',
            steps: [
                '1. ページを再読み込みしてください',
                '2. ブラウザのキャッシュをクリアしてください',
                '3. 別のブラウザでアクセスしてみてください',
                '4. 問題が続く場合は、新しいゲームを始めることを検討してください'
            ],
            errorDetails: errorDetails,
            recoveryError: recoveryError,
            timestamp: Date.now()
        };
        
        await this.broadcastNotification(guidance);
    }
    
    /**
     * 履歴管理
     */
    
    recordRecoverySuccess(strategy, result) {
        const record = {
            id: `recovery_${Date.now()}`,
            timestamp: Date.now(),
            strategy: strategy,
            success: true,
            method: result.method,
            confidence: result.confidence,
            metrics: result.metrics
        };
        
        this.recoveryState.recoveryHistory.push(record);
        this.recoveryState.lastRecoveryTime = Date.now();
        this.recoveryState.failedAttempts = 0;
        
        this.saveRecoveryHistory();
    }
    
    recordRecoveryFailure(error) {
        const record = {
            id: `recovery_${Date.now()}`,
            timestamp: Date.now(),
            success: false,
            error: error.message,
            stack: error.stack
        };
        
        this.recoveryState.recoveryHistory.push(record);
        this.recoveryState.failedAttempts++;
        
        this.saveRecoveryHistory();
    }
    
    loadRecoveryHistory() {
        try {
            const saved = localStorage.getItem('bubblePop_recovery_history');
            if (saved) {
                const data = JSON.parse(saved);
                this.recoveryState.recoveryHistory = data.history || [];
                this.recoveryState.lastRecoveryTime = data.lastRecoveryTime;
                this.recoveryState.failedAttempts = data.failedAttempts || 0;
            }
        } catch (error) {
            console.warn('Failed to load recovery history:', error);
        }
    }
    
    saveRecoveryHistory() {
        try {
            const data = {
                history: this.recoveryState.recoveryHistory.slice(-50), // 最新50件
                lastRecoveryTime: this.recoveryState.lastRecoveryTime,
                failedAttempts: this.recoveryState.failedAttempts,
                timestamp: Date.now()
            };
            
            localStorage.setItem('bubblePop_recovery_history', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save recovery history:', error);
        }
    }
    
    async createPreRecoveryBackup() {
        try {
            const backupData = {
                timestamp: Date.now(),
                purpose: 'pre_recovery_backup',
                originalData: localStorage.getItem('bubblePop_statistics_v2')
            };
            
            localStorage.setItem(`bubblePop_pre_recovery_${Date.now()}`, JSON.stringify(backupData));
        } catch (error) {
            console.warn('Failed to create pre-recovery backup:', error);
        }
    }
    
    /**
     * 外部インターフェース
     */
    
    registerNotificationCallback(callback) {
        this.notificationCallbacks.add(callback);
    }
    
    unregisterNotificationCallback(callback) {
        this.notificationCallbacks.delete(callback);
    }
    
    getRecoveryStatus() {
        return {
            isRecovering: this.recoveryState.isRecovering,
            currentStep: this.recoveryState.currentStep,
            progress: this.recoveryState.progress,
            lastRecoveryTime: this.recoveryState.lastRecoveryTime,
            failedAttempts: this.recoveryState.failedAttempts,
            historyCount: this.recoveryState.recoveryHistory.length
        };
    }
    
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }
    
    destroy() {
        this.notificationCallbacks.clear();
        this.recoveryState.recoveryHistory = [];
    }
}